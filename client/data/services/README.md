# Service-Specific Content Management

This directory contains JSON files for service-specific content that enhances the SEO and user experience of service detail pages.

## Purpose

These JSON files allow us to:

1. Maintain service-specific SEO metadata (title, description, keywords)
2. Provide rich, detailed content for each service
3. Include structured data for better search engine visibility
4. Easily update content without changing code

## File Structure

Each service should have its own JSON file named after the service ID or slug:

```
services/
  ├── ac-maintenance.json
  ├── plumbing.json
  ├── electrical-repairs.json
  └── ...
```

## JSON Schema

Each service JSON file should follow this structure:

```json
{
  "id": "service-id",
  "title": "Service Title",
  "metaTitle": "SEO-optimized title for the service page",
  "metaDescription": "Detailed description for SEO purposes",
  "keywords": "comma, separated, keywords, for, SEO",
  "headerImage": "URL to the main image for the service",
  "description": "Detailed service description",
  "benefits": [
    "Benefit 1",
    "Benefit 2",
    "..."
  ],
  "whatToExpect": "Description of what customers can expect when booking this service",
  "faqs": [
    {
      "question": "Frequently asked question?",
      "answer": "Detailed answer to the question"
    },
    "..."
  ],
  "relatedServices": [
    {
      "id": "related-service-id",
      "title": "Related Service Title"
    },
    "..."
  ],
  "images": [
    "URL to image 1",
    "URL to image 2",
    "..."
  ],
  "schema": {
    // JSON-LD structured data for the service
    "@context": "https://schema.org",
    "@type": "Service",
    // Additional structured data properties
  }
}
```

## How It Works

1. When a user visits a service detail page, the system first tries to load service data from the API
2. It then looks for a matching JSON file in this directory using a sophisticated matching algorithm:
   - **ID-based matching**:
     - The original service ID
     - Lowercase version of the ID
     - Slugified version of the ID
     - First part of a hyphenated ID
     - Last part of a hyphenated ID
     - Alphanumeric-only version of the ID
   - **Slug-based matching**:
     - The service slug from the API
     - First part of the slug
     - Last part of the slug
   - **Title-based matching**:
     - The service title converted to a slug
     - The service title with only alphanumeric characters
   - **Category-based matching**:
     - The service category name converted to a slug
   - **Common service type detection**:
     - Checks if the title or slug contains common service types like "plumbing", "electrical", etc.
     - Supports an extensible list of service types that can be easily updated
3. If found, the JSON data is merged with the API data, with the JSON data taking precedence
4. The combined data is used to render the page with enhanced SEO elements

This intelligent matching system allows you to create JSON files with simplified names (like "plumbing.json" or "electrical.json") that will still match complex service IDs from the database (like "68025ae5d5029e0a5dae41bd").

## Performance Considerations

The matching algorithm has been optimized for performance:

1. **Efficient ID Generation**: Potential IDs are generated once using a dedicated function
2. **Duplicate Elimination**: All duplicate IDs are automatically removed
3. **Conditional Logging**: Detailed logs are only shown in development mode, not in production
4. **Early Returns**: The function returns as soon as a match is found
5. **Extensible Service Types**: Common service types are defined in a single array for easy maintenance

## Adding a New Service

To add content for a new service:

1. Create a new JSON file named after the service ID or slug (e.g., `painting-services.json`)
2. Follow the schema structure above
3. Fill in all the relevant fields
4. The changes will be reflected immediately when the service page is loaded

## Best Practices

1. **Be Descriptive**: Provide detailed, helpful content that answers potential customer questions
2. **SEO Optimization**: Use relevant keywords in titles, descriptions, and content
3. **Structured Data**: Include complete structured data to improve search engine visibility
4. **Regular Updates**: Keep the content fresh and up-to-date
5. **Consistent Formatting**: Maintain consistent formatting across all service files

## Example

See `ac-maintenance.json` for a complete example of a well-structured service content file.