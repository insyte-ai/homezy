# Service-Specific Preferences

This directory contains configuration files for service-specific preference questions in the homezy app. These preferences are used to match homeowners with service providers based on their specific needs and requirements.

## Directory Structure

- `common.json` - Common questions that apply to all services
- `service-mapping.json` - Maps service titles to their specific question files
- Service-specific question files:
  - `smart-home.json` - Questions for smart home services
  - `plumbing.json` - Questions for plumbing services
  - `electrical.json` - Questions for electrical services
  - `hvac.json` - Questions for HVAC services
  - `home-remodeling.json` - Questions for home remodeling services
  - `default.json` - Default questions for services without specific templates

## File Format

Each question file contains an array of question objects with the following structure:

```json
[
  {
    "questionText": "Question text here",
    "questionType": "single_select", // or "multi_select" or "text"
    "options": [
      { "optionText": "Option 1", "value": "option_1" },
      { "optionText": "Option 2", "value": "option_2" }
    ],
    "isRequired": true,
    "displayOrder": 0
  }
]
```

## Adding New Service Questions

To add questions for a new service type:

1. Create a new JSON file in this directory (e.g., `new-service.json`)
2. Add your questions following the format above
3. Update `service-mapping.json` to map service titles to your new file

## Modifying Existing Questions

To modify questions for an existing service:

1. Edit the appropriate JSON file
2. Run the seeder to update templates for services that don't have them yet
3. For services with existing templates, you'll need to manually update them in the database or delete them to have the seeder recreate them

## Running the Seeder

To apply these configurations to the database:

```bash
# From the project root
node --loader ts-node/esm src/scripts/run-preference-seeder.ts
```

This will create new service preference templates for services that don't have them yet, and update existing templates with the latest service-specific questions. This ensures all services have the most relevant questions for their specific type.

## How It Works

The seeder:
1. Loads common questions from `common.json`
2. For each service, determines which specific question file to use based on `service-mapping.json`
3. Combines common questions with service-specific questions
4. Creates a template in the database with these combined questions

When a homeowner selects a service in the app, they will be shown the relevant questions for that specific service type.