import { Router, Request, Response } from 'express';
import Service from '../models/Service.model';
import User from '../models/User.model';
import Lead from '../models/Lead.model';

const router = Router();
const BASE_URL = process.env.BASE_URL || 'https://homezy.co';

// ==========================================
// MAIN SITEMAP INDEX
// ==========================================
router.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    // Static pages sitemap
    xml += `
    <sitemap>
      <loc>${BASE_URL}/sitemap-main.xml</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`;

    // Services sitemap
    xml += `
    <sitemap>
      <loc>${BASE_URL}/sitemap-services.xml</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`;

    // Professionals sitemap
    xml += `
    <sitemap>
      <loc>${BASE_URL}/sitemap-pros.xml</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`;

    // Leads sitemap
    xml += `
    <sitemap>
      <loc>${BASE_URL}/sitemap-leads.xml</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`;

    xml += '</sitemapindex>';

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// ==========================================
// STATIC PAGES SITEMAP
// ==========================================
router.get('/sitemap-main.xml', async (_req: Request, res: Response) => {
  try {
    const staticPages = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/services', changefreq: 'daily', priority: 0.9 },
      { url: '/lead-marketplace', changefreq: 'daily', priority: 0.9 },
      { url: '/pros', changefreq: 'daily', priority: 0.8 },
      { url: '/become-a-pro', changefreq: 'monthly', priority: 0.8 },
      { url: '/create-request', changefreq: 'monthly', priority: 0.7 },
      { url: '/about', changefreq: 'monthly', priority: 0.6 },
      { url: '/contact', changefreq: 'monthly', priority: 0.6 },
      { url: '/help', changefreq: 'monthly', priority: 0.5 },
      { url: '/how-it-works', changefreq: 'monthly', priority: 0.5 },
      { url: '/pricing', changefreq: 'monthly', priority: 0.5 },
      { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
      { url: '/terms', changefreq: 'yearly', priority: 0.3 },
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    staticPages.forEach((page) => {
      xml += `
      <url>
        <loc>${BASE_URL}${page.url}</loc>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
      </url>`;
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=86400');
    res.send(xml);
  } catch (error) {
    console.error('Error generating main sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// ==========================================
// SERVICES SITEMAP
// ==========================================
router.get('/sitemap-services.xml', async (_req: Request, res: Response) => {
  try {
    const serviceGroups = await Service.find({ isActive: true }).lean();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    serviceGroups.forEach((group: any) => {
      group.categories?.forEach((category: any) => {
        category.subservices?.forEach((subservice: any) => {
          // Main service page
          xml += `
      <url>
        <loc>${BASE_URL}/services/${subservice.slug}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`;

          // Service type pages
          subservice.serviceTypes?.forEach((serviceType: any) => {
            xml += `
      <url>
        <loc>${BASE_URL}/services/${subservice.slug}?type=${serviceType.id}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>`;
          });
        });
      });
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=86400');
    res.send(xml);
  } catch (error) {
    console.error('Error generating services sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// ==========================================
// PROFESSIONALS SITEMAP
// ==========================================
router.get('/sitemap-pros.xml', async (_req: Request, res: Response) => {
  try {
    const professionals = await User.find({
      role: 'pro',
      'proProfile.verificationStatus': 'approved',
      'proProfile.slug': { $exists: true, $ne: null },
    })
      .select('_id proProfile.slug updatedAt')
      .lean();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    professionals.forEach((pro: any) => {
      const lastmod = pro.updatedAt ? new Date(pro.updatedAt).toISOString() : new Date().toISOString();
      xml += `
      <url>
        <loc>${BASE_URL}/pros/${pro._id}/${pro.proProfile.slug}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>`;
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=43200');
    res.send(xml);
  } catch (error) {
    console.error('Error generating professionals sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// ==========================================
// LEADS SITEMAP
// ==========================================
router.get('/sitemap-leads.xml', async (_req: Request, res: Response) => {
  try {
    const leads = await Lead.find({
      status: { $in: ['open', 'published'] },
    })
      .select('_id updatedAt createdAt')
      .lean();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    leads.forEach((lead: any) => {
      const lastmod = lead.updatedAt
        ? new Date(lead.updatedAt).toISOString()
        : lead.createdAt
          ? new Date(lead.createdAt).toISOString()
          : new Date().toISOString();
      xml += `
      <url>
        <loc>${BASE_URL}/lead-marketplace/${lead._id}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.6</priority>
      </url>`;
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('Error generating leads sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// ==========================================
// ROBOTS.TXT
// ==========================================
router.get('/robots.txt', async (_req: Request, res: Response) => {
  try {
    let txt = '# Homezy Robots.txt\n';
    txt += '# Updated: ' + new Date().toISOString() + '\n\n';
    txt += 'User-agent: *\n';
    txt += 'Allow: /\n';
    txt += 'Allow: /services\n';
    txt += 'Allow: /services/*\n';
    txt += 'Allow: /pros\n';
    txt += 'Allow: /pros/*\n';
    txt += 'Allow: /lead-marketplace\n';
    txt += 'Allow: /lead-marketplace/*\n';
    txt += 'Allow: /become-a-pro\n';
    txt += 'Allow: /create-request\n';
    txt += 'Allow: /about\n';
    txt += 'Allow: /contact\n';
    txt += 'Allow: /help\n';
    txt += 'Allow: /how-it-works\n';
    txt += 'Allow: /pricing\n';
    txt += 'Allow: /terms\n';
    txt += 'Allow: /privacy\n\n';
    txt += '# Block private areas\n';
    txt += 'Disallow: /dashboard/\n';
    txt += 'Disallow: /admin/\n';
    txt += 'Disallow: /auth/\n';
    txt += 'Disallow: /account/\n';
    txt += 'Disallow: /settings/\n\n';
    txt += '# Block API endpoints\n';
    txt += 'Disallow: /api/\n\n';
    txt += '# Sitemaps\n';
    txt += `Sitemap: ${BASE_URL}/sitemap.xml\n`;

    res.header('Content-Type', 'text/plain');
    res.header('Cache-Control', 'public, max-age=86400');
    res.send(txt);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    res.status(500).send('Error generating robots.txt');
  }
});

export default router;
