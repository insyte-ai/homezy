import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for optimized Docker builds
  output: 'standalone',

  // Specify monorepo root to prevent Next.js from inferring it
  turbopack: {
    root: '../',
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },

  // Proxy SEO routes (sitemaps, robots.txt) to the backend server
  async rewrites() {
    // Extract the base API URL (remove /api/v1 suffix if present)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
    const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, '');

    return [
      {
        source: '/sitemap.xml',
        destination: `${baseUrl}/sitemap.xml`,
      },
      // Match all sitemap-*.xml files
      {
        source: '/sitemap-:filename.xml',
        destination: `${baseUrl}/sitemap-:filename.xml`,
      },
      {
        source: '/robots.txt',
        destination: `${baseUrl}/robots.txt`,
      },
    ];
  },
};

export default nextConfig;
