/**
 * Knowledge Base Service
 *
 * Provides curated UAE home improvement information:
 * - Loads articles from TOML files
 * - Uses Weaviate for semantic search (with fallback to keyword search)
 * - Covers regulations, best practices, materials, maintenance, costs, seasonal
 */

import * as fs from 'fs';
import * as path from 'path';
import * as toml from 'toml';
import { logger } from '../../utils/logger';
import { weaviateService, KnowledgeArticle as WeaviateArticle } from '../weaviate.service';

export interface KnowledgeArticle {
  id: string;
  category: 'regulations' | 'best_practices' | 'materials' | 'maintenance' | 'costs' | 'seasonal' | 'general';
  topic: string;
  summary: string;
  content: string;
  tags: string[];
  keywords: string[];
  emirates?: string[];
  services?: string[];
  relevance?: number;
}

export interface KnowledgeSearchResult {
  articles: KnowledgeArticle[];
  totalFound: number;
  searchMethod: 'semantic' | 'keyword';
}

interface TOMLArticle {
  article: {
    id: string;
    category: string;
    topic: string;
    summary: string;
    emirates?: string[];
    services?: string[];
  };
  content: {
    text: string;
  };
  metadata: {
    tags: string[];
    keywords: string[];
    last_updated: string;
    version?: number;
  };
}

export class KnowledgeBaseService {
  private articles: KnowledgeArticle[] = [];
  private isInitialized: boolean = false;
  private weaviateAvailable: boolean = false;

  constructor() {
    // Load articles on construction
    this.initialize();
  }

  /**
   * Initialize the knowledge base
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load articles from TOML files
      await this.loadArticlesFromFiles();

      // Try to initialize Weaviate
      this.weaviateAvailable = await weaviateService.initialize();

      if (this.weaviateAvailable) {
        // Index articles in Weaviate
        await this.indexArticlesInWeaviate();
        logger.info('Knowledge base initialized with Weaviate semantic search');
      } else {
        logger.info('Knowledge base initialized with keyword search fallback');
      }

      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize knowledge base', { error });
      this.isInitialized = true; // Mark as initialized to prevent retry loops
    }
  }

  /**
   * Load articles from TOML files
   */
  private async loadArticlesFromFiles(): Promise<void> {
    // Use process.cwd() since __dirname points to dist folder at runtime
    const articlesDir = path.join(process.cwd(), 'src/data/knowledge-base/articles');

    logger.debug('Loading knowledge base articles', { articlesDir });

    // Check if directory exists
    if (!fs.existsSync(articlesDir)) {
      logger.warn('Knowledge base articles directory not found, using empty knowledge base', { articlesDir });
      return;
    }

    const categories = ['regulations', 'best_practices', 'materials', 'maintenance', 'costs', 'seasonal'];

    for (const category of categories) {
      const categoryDir = path.join(articlesDir, category);

      if (!fs.existsSync(categoryDir)) {
        continue;
      }

      const files = fs.readdirSync(categoryDir).filter((f) => f.endsWith('.toml'));

      for (const file of files) {
        try {
          const filePath = path.join(categoryDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const parsed = toml.parse(content) as TOMLArticle;

          const article: KnowledgeArticle = {
            id: parsed.article.id,
            category: parsed.article.category as KnowledgeArticle['category'],
            topic: parsed.article.topic,
            summary: parsed.article.summary,
            content: parsed.content.text,
            tags: parsed.metadata.tags || [],
            keywords: parsed.metadata.keywords || [],
            emirates: parsed.article.emirates,
            services: parsed.article.services,
          };

          this.articles.push(article);
        } catch (error) {
          logger.error(`Failed to load article from ${file}`, { error });
        }
      }
    }

    logger.info(`Loaded ${this.articles.length} knowledge base articles from TOML files`);
  }

  /**
   * Index articles in Weaviate for semantic search
   */
  private async indexArticlesInWeaviate(): Promise<void> {
    if (!this.weaviateAvailable) return;

    const weaviateArticles: WeaviateArticle[] = this.articles.map((article) => ({
      id: article.id,
      category: article.category,
      topic: article.topic,
      summary: article.summary,
      content: article.content,
      tags: article.tags,
      keywords: article.keywords,
      emirates: article.emirates,
      services: article.services,
      lastUpdated: new Date(),
    }));

    await weaviateService.indexArticles(weaviateArticles);
  }

  /**
   * Search knowledge base - uses semantic search if available, falls back to keyword
   */
  async searchKnowledge(
    query: string,
    category?: 'regulations' | 'best_practices' | 'materials' | 'maintenance' | 'costs' | 'seasonal' | 'general'
  ): Promise<KnowledgeSearchResult> {
    logger.info('Searching knowledge base', { query, category });

    // Ensure initialized
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Try semantic search first if Weaviate is available
    if (this.weaviateAvailable) {
      try {
        const semanticResults = await weaviateService.semanticSearch(query, {
          limit: 5,
          category: category,
          certaintyThreshold: 0.6,
        });

        if (semanticResults.length > 0) {
          const articles: KnowledgeArticle[] = semanticResults.map((result) => ({
            id: result.article.id,
            category: result.article.category as KnowledgeArticle['category'],
            topic: result.article.topic,
            summary: result.article.summary,
            content: result.article.content,
            tags: result.article.tags,
            keywords: result.article.keywords || [],
            emirates: result.article.emirates,
            services: result.article.services,
            relevance: result.certainty * 10,
          }));

          logger.info('Semantic search completed', {
            query,
            resultsFound: articles.length,
          });

          return {
            articles: articles.slice(0, 3),
            totalFound: articles.length,
            searchMethod: 'semantic',
          };
        }
      } catch (error) {
        logger.warn('Semantic search failed, falling back to keyword search', { error });
      }
    }

    // Fallback to keyword search
    return this.keywordSearch(query, category);
  }

  /**
   * Keyword-based search fallback
   */
  private keywordSearch(
    query: string,
    category?: string
  ): KnowledgeSearchResult {
    const queryLower = query.toLowerCase();
    const searchTerms = queryLower
      .split(' ')
      .filter((term) => term.length > 2)
      .filter((term) => !['the', 'and', 'for', 'with', 'how', 'what', 'when', 'where'].includes(term));

    // Filter by category if specified
    let articles = category
      ? this.articles.filter((article) => article.category === category)
      : this.articles;

    // Calculate relevance scores
    articles = articles.map((article) => {
      let relevance = 0;

      // Topic match (highest weight - 10 points)
      if (article.topic.toLowerCase().includes(queryLower)) {
        relevance += 10;
      }

      // Summary match (high weight - 5 points)
      if (article.summary.toLowerCase().includes(queryLower)) {
        relevance += 5;
      }

      // Tag matches (medium weight - 3 points each)
      const matchingTags = article.tags.filter((tag) =>
        searchTerms.some((term) => tag.toLowerCase().includes(term))
      );
      relevance += matchingTags.length * 3;

      // Keyword matches (medium weight - 2 points each)
      const matchingKeywords = article.keywords.filter((keyword) =>
        searchTerms.some((term) => keyword.toLowerCase().includes(term))
      );
      relevance += matchingKeywords.length * 2;

      // Content matches (lower weight - 1 point each)
      const contentLower = article.content.toLowerCase();
      const contentMatches = searchTerms.filter((term) => contentLower.includes(term));
      relevance += contentMatches.length;

      return { ...article, relevance };
    });

    // Filter out articles with no relevance
    articles = articles.filter((article) => article.relevance! > 0);

    // Sort by relevance (highest first)
    articles.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    // Return top 3 results
    const topResults = articles.slice(0, 3);

    logger.info('Keyword search completed', {
      query,
      totalFound: articles.length,
      returned: topResults.length,
    });

    return {
      articles: topResults,
      totalFound: articles.length,
      searchMethod: 'keyword',
    };
  }

  /**
   * Get article by ID
   */
  async getArticleById(id: string): Promise<KnowledgeArticle | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.articles.find((article) => article.id === id) || null;
  }

  /**
   * Get articles by category
   */
  async getArticlesByCategory(
    category: 'regulations' | 'best_practices' | 'materials' | 'maintenance' | 'costs' | 'seasonal' | 'general'
  ): Promise<KnowledgeArticle[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.articles.filter((article) => article.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    return ['regulations', 'best_practices', 'materials', 'maintenance', 'costs', 'seasonal', 'general'];
  }

  /**
   * Get article count
   */
  getArticleCount(): number {
    return this.articles.length;
  }

  /**
   * Check if Weaviate semantic search is available
   */
  isSemanticSearchAvailable(): boolean {
    return this.weaviateAvailable;
  }

  /**
   * Reload articles from files (useful for development)
   */
  async reloadArticles(): Promise<void> {
    this.articles = [];
    this.isInitialized = false;
    await this.initialize();
  }
}
