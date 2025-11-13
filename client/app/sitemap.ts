import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://homezy.co';

// Get all available service JSON files
function getAvailableServices() {
  const servicesDir = path.join(process.cwd(), 'data/services');
  const files = fs.readdirSync(servicesDir);
  return files
    .filter((file) => file.endsWith('.json') && file !== 'README.md')
    .map((file) => file.replace('.json', ''));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Static pages with their priorities and change frequencies
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/become-a-pro`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/help`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/auth/login`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/auth/register`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamic service pages
  const availableServices = getAvailableServices();
  const servicePages: MetadataRoute.Sitemap = availableServices.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Combine all pages
  return [...staticPages, ...servicePages];
}
