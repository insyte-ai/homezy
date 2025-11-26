/**
 * Weaviate Service for HomeGPT Knowledge Base
 *
 * Provides semantic search capabilities for home improvement articles.
 * Falls back gracefully if Weaviate is not available.
 */

import weaviate, { WeaviateClient } from 'weaviate-ts-client';
import { logger } from '../utils/logger';
import { env } from '../config/env';

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
  lastUpdated: Date;
}

export interface SearchResult {
  article: KnowledgeArticle;
  score: number;
  certainty: number;
}

const SCHEMA_CLASS_NAME = 'HomeGPTKnowledge';

export class WeaviateService {
  private client: WeaviateClient | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.initializeClient();
  }

  /**
   * Initialize Weaviate client
   */
  private initializeClient(): void {
    try {
      const host = env.WEAVIATE_HOST || 'localhost';
      const port = env.WEAVIATE_PORT || '8080';
      const scheme = env.WEAVIATE_SCHEME || 'http';

      this.client = weaviate.client({
        scheme,
        host: `${host}:${port}`,
      });

      logger.info('Weaviate client configured', { host, port, scheme });
    } catch (error) {
      logger.warn('Failed to configure Weaviate client', { error });
      this.client = null;
    }
  }

  /**
   * Initialize Weaviate connection and schema
   */
  async initialize(): Promise<boolean> {
    if (!this.client) {
      logger.warn('Weaviate client not configured, skipping initialization');
      return false;
    }

    try {
      // Check if Weaviate is ready
      const isReady = await this.client.misc.readyChecker().do();
      if (!isReady) {
        logger.warn('Weaviate is not ready');
        return false;
      }

      // Create schema if needed
      await this.createSchema();

      this.isConnected = true;
      logger.info('Weaviate service initialized successfully');
      return true;
    } catch (error) {
      logger.warn('Failed to initialize Weaviate, semantic search will be unavailable', {
        error: (error as Error).message,
      });
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Check if Weaviate is available
   */
  isAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Create the knowledge base schema
   */
  private async createSchema(): Promise<void> {
    if (!this.client) return;

    try {
      const existingSchemas = await this.client.schema.getter().do();
      const existingClassNames = existingSchemas.classes?.map((c) => c.class) || [];

      if (existingClassNames.includes(SCHEMA_CLASS_NAME)) {
        logger.info('Knowledge base schema already exists');
        return;
      }

      await this.client.schema
        .classCreator()
        .withClass({
          class: SCHEMA_CLASS_NAME,
          description: 'Home improvement knowledge base articles for UAE',
          vectorizer: 'text2vec-transformers',
          moduleConfig: {
            'text2vec-transformers': {
              poolingStrategy: 'masked_mean',
              vectorizeClassName: false,
            },
          },
          properties: [
            {
              name: 'articleId',
              dataType: ['string'],
              description: 'Unique article identifier',
            },
            {
              name: 'category',
              dataType: ['string'],
              description: 'Article category (regulations, best_practices, etc.)',
            },
            {
              name: 'topic',
              dataType: ['string'],
              description: 'Article topic/title',
              moduleConfig: {
                'text2vec-transformers': {
                  skip: false,
                  vectorizePropertyName: false,
                },
              },
            },
            {
              name: 'summary',
              dataType: ['text'],
              description: 'Brief summary of the article',
              moduleConfig: {
                'text2vec-transformers': {
                  skip: false,
                  vectorizePropertyName: false,
                },
              },
            },
            {
              name: 'content',
              dataType: ['text'],
              description: 'Full article content',
              moduleConfig: {
                'text2vec-transformers': {
                  skip: false,
                  vectorizePropertyName: false,
                },
              },
            },
            {
              name: 'tags',
              dataType: ['string[]'],
              description: 'Article tags',
            },
            {
              name: 'keywords',
              dataType: ['string[]'],
              description: 'Search keywords',
            },
            {
              name: 'emirates',
              dataType: ['string[]'],
              description: 'Relevant emirates',
            },
            {
              name: 'services',
              dataType: ['string[]'],
              description: 'Related service categories',
            },
            {
              name: 'lastUpdated',
              dataType: ['date'],
              description: 'Last update timestamp',
            },
          ],
        })
        .do();

      logger.info('Created knowledge base schema in Weaviate');
    } catch (error) {
      logger.error('Failed to create Weaviate schema', { error });
      throw error;
    }
  }

  /**
   * Index an article in Weaviate
   */
  async indexArticle(article: KnowledgeArticle): Promise<void> {
    if (!this.client || !this.isConnected) {
      logger.warn('Weaviate not available, skipping article indexing', { articleId: article.id });
      return;
    }

    try {
      // Check if article already exists
      const existingResponse = await this.client.graphql
        .get()
        .withClassName(SCHEMA_CLASS_NAME)
        .withWhere({
          path: ['articleId'],
          operator: 'Equal',
          valueString: article.id,
        })
        .withFields('_additional { id }')
        .do();

      const existingArticles = existingResponse.data?.Get?.[SCHEMA_CLASS_NAME] || [];

      if (existingArticles.length > 0) {
        // Update existing article
        const existingId = existingArticles[0]._additional.id;
        await this.client.data
          .merger()
          .withClassName(SCHEMA_CLASS_NAME)
          .withId(existingId)
          .withProperties({
            articleId: article.id,
            category: article.category,
            topic: article.topic,
            summary: article.summary,
            content: article.content,
            tags: article.tags,
            keywords: article.keywords,
            emirates: article.emirates || [],
            services: article.services || [],
            lastUpdated: article.lastUpdated.toISOString(),
          })
          .do();

        logger.debug('Updated article in Weaviate', { articleId: article.id });
      } else {
        // Create new article
        await this.client.data
          .creator()
          .withClassName(SCHEMA_CLASS_NAME)
          .withProperties({
            articleId: article.id,
            category: article.category,
            topic: article.topic,
            summary: article.summary,
            content: article.content,
            tags: article.tags,
            keywords: article.keywords,
            emirates: article.emirates || [],
            services: article.services || [],
            lastUpdated: article.lastUpdated.toISOString(),
          })
          .do();

        logger.debug('Indexed article in Weaviate', { articleId: article.id });
      }
    } catch (error) {
      logger.error('Failed to index article in Weaviate', {
        articleId: article.id,
        error: (error as Error).message,
      });
      // Don't throw - allow the system to continue without semantic search
    }
  }

  /**
   * Bulk index multiple articles
   */
  async indexArticles(articles: KnowledgeArticle[]): Promise<void> {
    logger.info('Indexing articles in Weaviate', { count: articles.length });

    for (const article of articles) {
      await this.indexArticle(article);
    }

    logger.info('Finished indexing articles', { count: articles.length });
  }

  /**
   * Semantic search for articles
   */
  async semanticSearch(
    query: string,
    options: {
      limit?: number;
      category?: string;
      emirate?: string;
      service?: string;
      certaintyThreshold?: number;
    } = {}
  ): Promise<SearchResult[]> {
    if (!this.client || !this.isConnected) {
      logger.debug('Weaviate not available for semantic search');
      return [];
    }

    const { limit = 5, category, emirate, service, certaintyThreshold = 0.65 } = options;

    try {
      // Build where conditions
      const whereConditions: any[] = [];

      if (category) {
        whereConditions.push({
          path: ['category'],
          operator: 'Equal',
          valueString: category,
        });
      }

      if (emirate) {
        whereConditions.push({
          path: ['emirates'],
          operator: 'ContainsAny',
          valueStringArray: [emirate],
        });
      }

      if (service) {
        whereConditions.push({
          path: ['services'],
          operator: 'ContainsAny',
          valueStringArray: [service],
        });
      }

      // Build query
      let builder = this.client.graphql
        .get()
        .withClassName(SCHEMA_CLASS_NAME)
        .withFields(
          [
            'articleId',
            'category',
            'topic',
            'summary',
            'content',
            'tags',
            'keywords',
            'emirates',
            'services',
            'lastUpdated',
            '_additional { id certainty distance }',
          ].join(' ')
        )
        .withNearText({ concepts: [query] })
        .withLimit(limit);

      // Add where conditions
      if (whereConditions.length === 1) {
        builder = builder.withWhere(whereConditions[0]);
      } else if (whereConditions.length > 1) {
        builder = builder.withWhere({
          operator: 'And',
          operands: whereConditions,
        });
      }

      const response = await builder.do();
      const results = response.data?.Get?.[SCHEMA_CLASS_NAME] || [];

      return results
        .filter((item: any) => {
          const certainty = item._additional?.certainty;
          return certainty === null || certainty >= certaintyThreshold;
        })
        .map((item: any) => ({
          article: {
            id: item.articleId,
            category: item.category,
            topic: item.topic,
            summary: item.summary,
            content: item.content,
            tags: item.tags || [],
            keywords: item.keywords || [],
            emirates: item.emirates || [],
            services: item.services || [],
            lastUpdated: new Date(item.lastUpdated),
          },
          score: 1 - (item._additional?.distance || 0),
          certainty: item._additional?.certainty || 0.5,
        }));
    } catch (error) {
      logger.error('Semantic search failed', { error: (error as Error).message, query });
      return [];
    }
  }

  /**
   * Hybrid search (combines semantic + keyword)
   */
  async hybridSearch(
    query: string,
    options: {
      limit?: number;
      category?: string;
      alpha?: number; // 0 = keyword only, 1 = vector only, 0.75 = balanced towards semantic
    } = {}
  ): Promise<SearchResult[]> {
    if (!this.client || !this.isConnected) {
      return [];
    }

    const { limit = 5, category, alpha = 0.75 } = options;

    try {
      let builder = this.client.graphql
        .get()
        .withClassName(SCHEMA_CLASS_NAME)
        .withFields(
          [
            'articleId',
            'category',
            'topic',
            'summary',
            'content',
            'tags',
            'keywords',
            'emirates',
            'services',
            'lastUpdated',
            '_additional { id score }',
          ].join(' ')
        )
        .withHybrid({
          query,
          alpha,
        })
        .withLimit(limit);

      if (category) {
        builder = builder.withWhere({
          path: ['category'],
          operator: 'Equal',
          valueString: category,
        });
      }

      const response = await builder.do();
      const results = response.data?.Get?.[SCHEMA_CLASS_NAME] || [];

      return results.map((item: any) => ({
        article: {
          id: item.articleId,
          category: item.category,
          topic: item.topic,
          summary: item.summary,
          content: item.content,
          tags: item.tags || [],
          keywords: item.keywords || [],
          emirates: item.emirates || [],
          services: item.services || [],
          lastUpdated: new Date(item.lastUpdated),
        },
        score: item._additional?.score || 0.5,
        certainty: item._additional?.certainty || 0.5,
      }));
    } catch (error) {
      logger.error('Hybrid search failed', { error: (error as Error).message, query });
      return [];
    }
  }

  /**
   * Delete an article from Weaviate
   */
  async deleteArticle(articleId: string): Promise<void> {
    if (!this.client || !this.isConnected) return;

    try {
      // Find the Weaviate ID for this article
      const response = await this.client.graphql
        .get()
        .withClassName(SCHEMA_CLASS_NAME)
        .withWhere({
          path: ['articleId'],
          operator: 'Equal',
          valueString: articleId,
        })
        .withFields('_additional { id }')
        .do();

      const articles = response.data?.Get?.[SCHEMA_CLASS_NAME] || [];

      if (articles.length > 0) {
        const weaviateId = articles[0]._additional.id;
        await this.client.data.deleter().withClassName(SCHEMA_CLASS_NAME).withId(weaviateId).do();

        logger.debug('Deleted article from Weaviate', { articleId });
      }
    } catch (error) {
      logger.error('Failed to delete article from Weaviate', {
        articleId,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Get statistics about indexed articles
   */
  async getStatistics(): Promise<{
    total: number;
    byCategory: Record<string, number>;
  }> {
    if (!this.client || !this.isConnected) {
      return { total: 0, byCategory: {} };
    }

    try {
      const response = await this.client.graphql
        .aggregate()
        .withClassName(SCHEMA_CLASS_NAME)
        .withFields('meta { count }')
        .withGroupBy(['category'])
        .do();

      const aggregations = response.data?.Aggregate?.[SCHEMA_CLASS_NAME] || [];

      let total = 0;
      const byCategory: Record<string, number> = {};

      aggregations.forEach((agg: any) => {
        const count = agg.meta?.count || 0;
        total += count;

        if (agg.groupedBy?.category) {
          byCategory[agg.groupedBy.category] = count;
        }
      });

      return { total, byCategory };
    } catch (error) {
      logger.error('Failed to get Weaviate statistics', { error });
      return { total: 0, byCategory: {} };
    }
  }
}

// Singleton instance
export const weaviateService = new WeaviateService();
