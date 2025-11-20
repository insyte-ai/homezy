#!/usr/bin/env tsx
/**
 * Service Config Generator
 *
 * Converts service question JSON files from data/lead-form-data/
 * to frontend-ready config files in config/services/
 *
 * Usage: npm run generate:configs
 */

import fs from 'fs';
import path from 'path';

// Paths
const DATA_DIR = path.join(process.cwd(), 'data/lead-form-data');
const CONFIG_DIR = path.join(process.cwd(), 'config/services');

// Icon mapping for question types
const ICON_MAP: Record<string, string> = {
  // Work types
  repair: '🔧',
  install: '🚰',
  emergency: '🚨',
  inspection: '🔍',
  maintenance: '🛠️',
  replacement: '🔄',

  // Locations
  kitchen: '🍳',
  bathroom: '🚿',
  laundry: '🧺',
  outdoor: '🏡',
  bedroom: '🛏️',
  living_room: '🛋️',

  // Fixtures
  sink: '🚰',
  faucet: '💧',
  toilet: '🚽',
  shower: '🚿',
  pipes: '🔧',
  water_heater: '♨️',

  // General
  yes: '✅',
  no: '❌',
  unknown: '❓',
  multiple: '📍',
};

// Get icon for option value (smart matching)
function getIcon(value: string, questionText: string): string {
  // Try exact match first
  if (ICON_MAP[value]) return ICON_MAP[value];

  // Try fuzzy matching on keywords
  const lowerValue = value.toLowerCase();
  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (lowerValue.includes(key) || key.includes(lowerValue)) {
      return icon;
    }
  }

  // Default icons based on question context
  if (questionText.toLowerCase().includes('emergency')) return '🚨';
  if (questionText.toLowerCase().includes('problem')) return '⚠️';
  if (questionText.toLowerCase().includes('budget')) return '💰';
  if (questionText.toLowerCase().includes('time')) return '⏰';

  // Default
  return '•';
}

// Generate question ID from question text
function generateQuestionId(questionText: string, index: number): string {
  // Extract key words and create ID
  const words = questionText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['what', 'when', 'where', 'which', 'would', 'this', 'that', 'have', 'need', 'your'].includes(w));

  const id = words.slice(0, 3).join('_');
  return id || `question_${index + 1}`;
}

// Convert question type format
function convertQuestionType(type: string): string {
  const typeMap: Record<string, string> = {
    'single_select': 'single-choice',
    'multi_select': 'multiple-choice',
    'text': 'text',
    'number': 'number',
  };
  return typeMap[type] || 'single-choice';
}

// Generate weight based on question importance
function calculateWeight(question: any): number {
  if (question.isRequired) return 1.0;
  if (question.displayOrder <= 3) return 0.8;
  if (question.displayOrder <= 5) return 0.6;
  return 0.4;
}

// Generate option weight
function calculateOptionWeight(optionValue: string, isRequired: boolean): number {
  // Emergency/urgent options get higher weight
  if (optionValue.includes('emergency') || optionValue.includes('urgent')) return 1.0;
  if (optionValue.includes('immediate') || optionValue.includes('asap')) return 1.0;

  // Common options
  if (optionValue.includes('repair') || optionValue.includes('install')) return 0.8;

  // Default
  return isRequired ? 0.7 : 0.5;
}

// Generate tags for option
function generateTags(optionValue: string, optionText: string): string[] {
  const tags: string[] = [];
  const combined = `${optionValue} ${optionText}`.toLowerCase();

  if (combined.includes('emergency') || combined.includes('urgent')) tags.push('urgent');
  if (combined.includes('common') || combined.includes('standard')) tags.push('common');
  if (combined.includes('complex') || combined.includes('major')) tags.push('complex');
  if (combined.includes('special')) tags.push('specialized');
  if (combined.includes('high') || combined.includes('premium')) tags.push('high_value');

  return tags;
}

// Determine match type
function getMatchType(optionValue: string, questionRequired: boolean): string {
  if (optionValue.includes('emergency') || optionValue.includes('urgent')) return 'direct';
  if (questionRequired && optionValue !== 'unknown' && optionValue !== 'not_sure') return 'direct';
  return 'partial';
}

// Convert data format to config format
function convertToConfig(filename: string, dataQuestions: any[]): any {
  const serviceId = filename.replace('.json', '');
  const serviceName = serviceId
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Sort questions by displayOrder
  const sortedQuestions = dataQuestions.sort((a, b) =>
    (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  const questions = sortedQuestions.map((q, index) => ({
    id: generateQuestionId(q.questionText, index),
    question: q.questionText,
    type: convertQuestionType(q.questionType),
    required: q.isRequired || false,
    weight: calculateWeight(q),
    helpText: `This helps us match you with the right professional for your ${serviceName.toLowerCase()} needs`,
    options: q.options.map((opt: any) => ({
      value: opt.value,
      label: opt.optionText,
      icon: getIcon(opt.value, q.questionText),
      weight: calculateOptionWeight(opt.value, q.isRequired),
      tags: generateTags(opt.value, opt.optionText),
      matchType: getMatchType(opt.value, q.isRequired),
    })),
  }));

  return {
    serviceId,
    serviceName,
    description: `Professional ${serviceName.toLowerCase()} services`,
    questions,
    metadata: {
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'auto-generator',
      sourceFile: filename,
    },
  };
}

// Main conversion function
async function generateConfigs() {
  console.log('🔄 Starting service config generation...\n');

  // Ensure config directory exists
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    console.log(`✅ Created config directory: ${CONFIG_DIR}\n`);
  }

  // Read all JSON files from data directory
  const files = fs.readdirSync(DATA_DIR)
    .filter(file => file.endsWith('.json') && !file.startsWith('_'));

  console.log(`📁 Found ${files.length} service question files\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const dataPath = path.join(DATA_DIR, file);
      const configPath = path.join(CONFIG_DIR, file);

      // Skip special configuration files
      const specialFiles = ['common.json', 'default.json', 'service-mapping.json', 'README.md'];
      if (specialFiles.includes(file) || file.startsWith('_')) {
        console.log(`⏭️  Skipping ${file} (special file)`);
        continue;
      }

      // Read data file
      const dataContent = fs.readFileSync(dataPath, 'utf-8');
      const dataQuestions = JSON.parse(dataContent);

      // Convert to config format
      const config = convertToConfig(file, dataQuestions);

      // Write config file
      fs.writeFileSync(
        configPath,
        JSON.stringify(config, null, 2) + '\n',
        'utf-8'
      );

      console.log(`✅ Generated: ${file} (${config.questions.length} questions)`);
      successCount++;

    } catch (error: any) {
      console.error(`❌ Error processing ${file}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Success: ${successCount} files`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} files`);
  }
  console.log(`${'='.repeat(50)}\n`);

  console.log('📝 Generated config files can be found in:');
  console.log(`   ${CONFIG_DIR}\n`);

  console.log('🎯 Next steps:');
  console.log('   1. Review generated configs for accuracy');
  console.log('   2. Customize icons/weights if needed');
  console.log('   3. Update questionnaireLoader.ts to use new configs');
  console.log('   4. Test with MultiStepLeadForm\n');
}

// Run the generator
generateConfigs().catch(console.error);
