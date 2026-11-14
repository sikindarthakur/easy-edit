import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

// Static routes
const STATIC_ROUTES = [
  {
    route: '/',
    title: 'EasyEdit — Free, Private Online File Tools',
    description: 'Edit, convert and compress files. Free. Private. Instant. Merge PDF, resize images, convert documents with zero server uploads.',
  },
  {
    route: '/tools',
    title: 'All File Tools Online — Free & Private | EasyEdit',
    description: 'Browse all 18 free, private online tools for PDF, images, documents, archives, and developer utilities.',
  },
  {
    route: '/pdf',
    title: 'PDF Tools Online — Free & Private | EasyEdit',
    description: 'Merge, split, rotate, organize, and compress PDF documents right inside your browser.',
  },
  {
    route: '/image',
    title: 'Image Tools Online — Free & Private | EasyEdit',
    description: 'Resize, compress, and convert images with zero quality loss and no server uploads.',
  },
  {
    route: '/document',
    title: 'Document Tools Online — Free & Private | EasyEdit',
    description: 'Count words, convert text cases, and convert Markdown to PDF privately.',
  },
  {
    route: '/developer',
    title: 'Developer Tools Online — Free & Private | EasyEdit',
    description: 'Format and validate JSON, encode and decode Base64 directly on your local device.',
  },
  {
    route: '/spreadsheet',
    title: 'Spreadsheet Tools Online — Free & Private | EasyEdit',
    description: 'Convert between CSV and JSON spreadsheets instantly in your browser.',
  },
  {
    route: '/archive',
    title: 'Archive Tools Online — Free & Private | EasyEdit',
    description: 'Create and extract ZIP archives with complete privacy and security against traversal.',
  },
  {
    route: '/about',
    title: 'About Us — Free & Private Tools | EasyEdit',
    description: 'Learn why EasyEdit was built to provide fast, watermark-free, private file tools.',
  },
  {
    route: '/privacy',
    title: 'Privacy Policy | EasyEdit',
    description: 'Our privacy-first commitment: your files never leave your device.',
  },
  {
    route: '/terms',
    title: 'Terms of Service | EasyEdit',
    description: 'Free to use for personal and commercial purposes. No watermarks or hidden fees.',
  },
  {
    route: '/contact',
    title: 'Contact Support | EasyEdit',
    description: 'Get in touch with the EasyEdit team for questions, feedback, or security inquiries.',
  },
  {
    route: '/how-we-handle-files',
    title: 'How We Handle Files — 100% Client-Side | EasyEdit',
    description: 'Understand how EasyEdit processes your files securely on your device without server uploads.',
  },
];

// Read tool registry data
const registryPath = path.resolve(__dirname, '../src/tools/registry.ts');
const registryContent = fs.readFileSync(registryPath, 'utf8');

const toolBlocks = registryContent.split(/\/\/\s*\d+\.\s+/).slice(1);
const toolRoutes = [];

for (const block of toolBlocks) {
  const nameMatch = block.match(/name:\s*'([^']+)'/);
  const routeMatch = block.match(/route:\s*'([^']+)'/);
  const descMatch = block.match(/description:\s*'([^']+)'/);

  if (nameMatch && routeMatch && descMatch) {
    const name = nameMatch[1];
    const route = routeMatch[1];
    const desc = descMatch[1];
    toolRoutes.push({
      name,
      route,
      description: desc.slice(0, 155),
      title: `${name} Online — Free & Private | EasyEdit`.slice(0, 60),
    });
  }
}

const allRoutes = [
  ...STATIC_ROUTES,
  ...toolRoutes.map((t) => ({
    route: t.route,
    title: t.title,
    description: t.description,
  })),
];

// Read template index.html
const templatePath = path.join(distDir, 'index.html');
if (!fs.existsSync(templatePath)) {
  console.error('dist/index.html not found! Run "vite build" first.');
  process.exit(1);
}
const templateHtml = fs.readFileSync(templatePath, 'utf8');

console.log(`Prerendering ${allRoutes.length} static HTML routes (${toolRoutes.length} tools)...`);

for (const item of allRoutes) {
  const canonicalUrl = `https://easyedit.app${item.route === '/' ? '' : item.route}`;

  let html = templateHtml;
  // Replace title
  html = html.replace(/<title>.*?<\/title>/, `<title>${item.title}</title>`);
  // Replace or add meta description
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="${item.description}" />`
  );

  // Inject canonical and OpenGraph tags
  const seoTags = `
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${item.title}" />
    <meta property="og:description" content="${item.description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${item.title}" />
    <meta name="twitter:description" content="${item.description}" />
  `;
  html = html.replace('</head>', `${seoTags}\n  </head>`);

  const targetDir = item.route === '/' ? distDir : path.join(distDir, item.route.replace(/^\//, ''));
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
}

// Generate sitemap.xml
const sitemapEntries = allRoutes
  .map(
    (item) => `  <url>
    <loc>https://easyedit.app${item.route === '/' ? '' : item.route}</loc>
    <changefreq>${item.route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${item.route === '/' ? '1.0' : item.route.split('/').length === 2 ? '0.8' : '0.9'}</priority>
  </url>`
  )
  .join('\n');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>
`;

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');

console.log(`Prerendering complete! Generated ${allRoutes.length} static pages and sitemap.xml.`);
