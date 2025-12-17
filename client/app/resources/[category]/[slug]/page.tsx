'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Clock, Calendar, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import { ResourceCard, NewsletterSignup } from '@/components/resources';
import {
  Resource,
  RESOURCE_TYPE_LABELS,
  RESOURCE_TYPE_COLORS,
  ResourceType,
  TARGET_AUDIENCE_LABELS,
  TargetAudience,
} from '@/types/resource';
import {
  getResourceBySlug,
  getRelatedResources,
  formatPublishedDate,
  getCategoryBySlug,
} from '@/lib/services/resources';

export default function ArticlePage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const slug = params.slug as string;

  const [resource, setResource] = useState<Resource | null>(null);
  const [relatedResources, setRelatedResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const category = getCategoryBySlug(categorySlug);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [articleData, related] = await Promise.all([
        getResourceBySlug(slug),
        getRelatedResources(slug, 3),
      ]);
      setResource(articleData);
      setRelatedResources(related);
    } catch (err) {
      console.error('Error loading article:', err);
      setError('Article not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && resource) {
      try {
        await navigator.share({
          title: resource.title,
          text: resource.excerpt,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    notFound();
  }

  const typeLabel = RESOURCE_TYPE_LABELS[resource.type as ResourceType] || resource.type;
  const typeColor = RESOURCE_TYPE_COLORS[resource.type as ResourceType] || 'bg-gray-100 text-gray-800';
  const audienceLabel = resource.targetAudience
    ? TARGET_AUDIENCE_LABELS[resource.targetAudience as TargetAudience]
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/resources/center" className="text-gray-500 hover:text-gray-700">
              Resources
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link
              href={`/resources/${categorySlug}`}
              className="text-gray-500 hover:text-gray-700"
            >
              {category?.name || categorySlug}
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {resource.title}
            </span>
          </nav>
        </div>
      </div>

      <article className="container-custom py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href={`/resources/${categorySlug}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {category?.name || 'Category'}
          </Link>

          {/* Article Header */}
          <header className="mb-8">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColor}`}>
                {typeLabel}
              </span>
              {resource.featured && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Featured
                </span>
              )}
              {audienceLabel && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  For {audienceLabel}s
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {resource.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-600 mb-6">{resource.excerpt}</p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              {/* Author */}
              <div className="flex items-center gap-2">
                {resource.author.avatar && (
                  <Image
                    src={resource.author.avatar}
                    alt={resource.author.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="font-medium text-gray-900">{resource.author.name}</span>
              </div>

              <span className="text-gray-300">|</span>

              {/* Date */}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{resource.publishedAt ? formatPublishedDate(resource.publishedAt) : ''}</span>
              </div>

              {/* Reading Time */}
              {resource.content.readingTime && (
                <>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{resource.content.readingTime} min read</span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Bookmark className="h-4 w-4" />
                Save
              </button>
            </div>
          </header>

          {/* Featured Image */}
          {resource.featuredImage && (
            <div className="relative aspect-video mb-8 rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={resource.featuredImage}
                alt={resource.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: resource.content.body }}
          />

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="border-t border-gray-200 pt-6 mb-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">Tags:</span>
                {resource.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/resources/search?q=${encodeURIComponent(tag.name)}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          {resource.author.bio && (
            <div className="bg-gray-50 rounded-xl p-6 mb-12">
              <div className="flex items-start gap-4">
                {resource.author.avatar && (
                  <Image
                    src={resource.author.avatar}
                    alt={resource.author.name}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{resource.author.name}</h3>
                  {resource.author.title && (
                    <p className="text-sm text-gray-500 mb-2">{resource.author.title}</p>
                  )}
                  <p className="text-gray-600">{resource.author.bio}</p>
                </div>
              </div>
            </div>
          )}

          {/* Newsletter CTA */}
          <div className="mb-12">
            <NewsletterSignup variant="compact" />
          </div>
        </div>
      </article>

      {/* Related Resources */}
      {relatedResources.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="container-custom">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Resources</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedResources.map((related) => (
                <ResourceCard key={related.id || related._id} resource={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
