import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle, MessageCircle } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import fs from 'fs';
import path from 'path';

// Get all available service JSON files
function getAvailableServices() {
  const servicesDir = path.join(process.cwd(), 'data/services');
  const files = fs.readdirSync(servicesDir);
  return files
    .filter((file) => file.endsWith('.json') && file !== 'README.md')
    .map((file) => file.replace('.json', ''));
}

// This will be used to generate static pages for all services at build time
export async function generateStaticParams() {
  const availableServices = getAvailableServices();

  return availableServices.map((slug) => ({
    slug,
  }));
}

// Load service content from JSON files
async function loadServiceContent(slug: string) {
  if (!slug) return null;

  try {
    const content = await import(`@/data/services/${slug}.json`);
    return content.default;
  } catch {
    // Try alternative file names (some files might have different naming)
    const alternatives = [
      slug.replace(/-/g, '_'),
      slug.split('-').filter(Boolean)[0],
    ].filter(Boolean);

    for (const alt of alternatives) {
      if (!alt) continue;
      try {
        const content = await import(`@/data/services/${alt}.json`);
        return content.default;
      } catch {
        continue;
      }
    }

    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const serviceContent = await loadServiceContent(slug);

  if (!serviceContent) {
    return {
      title: 'Service Not Found | Homezy',
    };
  }

  return {
    title: serviceContent.metaTitle || `${serviceContent.title} | Homezy`,
    description: serviceContent.metaDescription || serviceContent.description,
    keywords: serviceContent.keywords,
    openGraph: {
      title: serviceContent.metaTitle || serviceContent.title,
      description: serviceContent.metaDescription || serviceContent.description,
      images: serviceContent.headerImage ? [serviceContent.headerImage] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: serviceContent.metaTitle || serviceContent.title,
      description: serviceContent.metaDescription || serviceContent.description,
      images: serviceContent.headerImage ? [serviceContent.headerImage] : [],
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const serviceContent = await loadServiceContent(slug);

  if (!serviceContent) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-primary-100 py-16 md:py-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {serviceContent.title}
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                {serviceContent.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Find a Pro
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-300 hover:border-primary-500 hover:text-primary-600 transition-colors"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Chat with Home GPT
                </Link>
              </div>
            </div>
            {serviceContent.headerImage && (
              <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={serviceContent.headerImage}
                  alt={serviceContent.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      {serviceContent.benefits && serviceContent.benefits.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Why Choose Our {serviceContent.title}?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceContent.benefits.map((benefit: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                >
                  <CheckCircle className="h-6 w-6 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* What to Expect Section */}
      {serviceContent.whatToExpect && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              What to Expect
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {serviceContent.whatToExpect}
            </p>
          </div>
        </section>
      )}

      {/* Image Gallery */}
      {serviceContent.images && serviceContent.images.length > 1 && (
        <section className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {serviceContent.images.slice(0, 4).map((image: string, index: number) => (
                <div
                  key={index}
                  className="relative h-48 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                >
                  <Image
                    src={image}
                    alt={`${serviceContent.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs Section */}
      {serviceContent.faqs && serviceContent.faqs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {serviceContent.faqs.map((faq: { question: string; answer: string }, index: number) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-800 mb-8">
            Connect with verified professionals in minutes. Get free quotes and compare options.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Find a Pro Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Get AI Assistance
            </Link>
          </div>
        </div>
      </section>

      {/* Related Services */}
      {serviceContent.relatedServices && serviceContent.relatedServices.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Related Services
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {serviceContent.relatedServices.map((related: { id: string; title: string }) => (
                <Link
                  key={related.id}
                  href={`/services/${related.id}`}
                  className="p-6 bg-gray-50 rounded-lg border-2 border-transparent hover:border-primary-500 hover:bg-primary-50 transition-all"
                >
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                    {related.title} →
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Structured Data */}
      {serviceContent.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceContent.schema),
          }}
        />
      )}

      <PublicFooter />
    </div>
  );
}
