const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://anwar-videoeditor.vercel.app';
const projects = JSON.parse(fs.readFileSync(path.join(root, 'data', 'projects.json'), 'utf8'));
const sitePages = JSON.parse(fs.readFileSync(path.join(root, 'data', 'site-pages.json'), 'utf8'));
const adConfig = JSON.parse(fs.readFileSync(path.join(root, 'data', 'ad-config.json'), 'utf8'));
const publishedProjects = projects.filter((project) => project.publicationStatus === 'published');
const manifestPath = path.join(root, 'generated-pages.json');
const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function assertUnique(values, label) {
  if (new Set(values).size !== values.length) {
    throw new Error(`Project data contains duplicate ${label}.`);
  }
}

assertUnique(projects.map((project) => project.id), 'IDs');
assertUnique(projects.map((project) => project.slug), 'slugs');
assertUnique(publishedProjects.map((project) => project.seo.title), 'published SEO titles');
assertUnique(publishedProjects.map((project) => project.seo.description), 'published SEO descriptions');
assertUnique(sitePages.map((page) => page.slug), 'information page slugs');

for (const project of projects) {
  if (!['draft', 'published'].includes(project.publicationStatus)) {
    throw new Error(`Project "${project.id}" must be marked "draft" or "published".`);
  }
  if (!validSlug.test(project.slug) || !project.thumbnail || !project.thumbnailAlt || !project.videoUrl) {
    throw new Error(`Project "${project.id}" has an invalid slug or missing media details.`);
  }
}
for (const page of sitePages) {
  if (!validSlug.test(page.slug) || !page.title || !page.description || !page.heading || !page.sections?.length) {
    throw new Error(`Information page "${page.slug}" is missing required content or has an invalid slug.`);
  }
}

const projectById = new Map(projects.map((project) => [project.id, project]));
for (const project of publishedProjects) {
  if (!project.seo?.title || !project.seo?.description || !project.overview || !project.videoUrl) {
    throw new Error(`Published project "${project.id}" is missing required content or metadata.`);
  }
  for (const relatedId of project.related) {
    if (!projectById.has(relatedId)) {
      throw new Error(`Published project "${project.id}" links to a missing project.`);
    }
  }
}

const requiredPlacements = [
  'project-top',
  'project-middle',
  'project-bottom',
  'portfolio-interstitial',
  'supporting-content'
];

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

for (const name of requiredPlacements) {
  const placement = adConfig.placements?.[name];
  if (!placement || typeof placement.enabled !== 'boolean' || typeof placement.fallback !== 'boolean') {
    throw new Error(`Advertisement placement "${name}" must define enabled and fallback booleans.`);
  }
  if (placement.campaign && !['draft', 'active', 'paused'].includes(placement.campaign.status)) {
    throw new Error(`Advertisement placement "${name}" has an invalid campaign status.`);
  }
  if (placement.campaign?.status === 'active'
    && (!placement.campaign.creativeText || !isHttpsUrl(placement.campaign.destinationUrl))) {
    throw new Error(`Active campaign for "${name}" needs creative text and an HTTPS destination.`);
  }
}

function adSlot(name) {
  const placement = adConfig.placements[name];
  if (!placement) throw new Error(`Advertisement placement "${name}" is not configured.`);
  const campaign = placement.campaign;
  const hasActiveCreative = campaign?.status === 'active'
    && Boolean(campaign.creativeText)
    && isHttpsUrl(campaign.destinationUrl);
  const shouldReserveSpace = placement.enabled && (hasActiveCreative || placement.fallback);
  const hidden = shouldReserveSpace ? '' : ' hidden';
  return `<aside class="ad-slot" data-ad-slot="${name}" aria-label="Advertisement"${hidden}></aside>`;
}

function pageHead({ title, description, canonical, type = 'website', image, imageAlt = 'Anwar, finance video editor' }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeCanonical = escapeHtml(canonical);
  const socialImage = image || `${baseUrl}/Anwar.webp`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3376684105322240" crossorigin="anonymous"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}">
  <meta name="author" content="Anwar">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${safeCanonical}">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="Anwar — Finance Video Editor">
  <meta property="og:url" content="${safeCanonical}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:image" content="${escapeHtml(socialImage)}">
  <meta property="og:image:alt" content="${escapeHtml(imageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="${escapeHtml(socialImage)}">
  <link rel="stylesheet" href="/editorial.css">
</head>`;
}

function siteHeader() {
  return `<header class="editorial-header">
  <a class="wordmark" href="/" aria-label="Anwar home">ANWAR<span> / FINANCE VIDEO EDITOR</span></a>
  <nav aria-label="Main navigation">
    <a href="/work/">Work</a>
    <a href="/services/">Services</a>
    <a href="/about/">About</a>
    <a href="/contact/">Contact</a>
  </nav>
</header>`;
}

function siteFooter() {
  return `<footer class="editorial-footer">
  <a class="wordmark" href="/">ANWAR<span> / FINANCE VIDEO EDITOR</span></a>
  <nav aria-label="Footer navigation">
    <a href="/work/">Work</a>
    <a href="/services/">Services</a>
    <a href="/contact/">Contact</a>
    <a href="/privacy-policy/">Privacy</a>
  </nav>
  <p>© ${new Date().getFullYear()} Anwar</p>
</footer>`;
}

function renderProjectCard(project) {
  return `<article class="project-card">
  <a href="/work/${encodeURIComponent(project.slug)}/">
    <img src="${escapeHtml(project.thumbnail)}" alt="${escapeHtml(project.thumbnailAlt)}" width="540" height="960" loading="lazy">
    <div class="project-card-copy">
      <p class="eyebrow">${escapeHtml(project.category)} <span>·</span> ${project.durationSeconds} sec</p>
      <h2>${escapeHtml(project.title)}</h2>
      <span class="text-link">View project <span aria-hidden="true">↗</span></span>
    </div>
  </a>
</article>`;
}

function renderWorkPage() {
  const canonical = `${baseUrl}/work/`;
  const cards = publishedProjects.map(renderProjectCard);
  const firstGroup = cards.slice(0, 3).join('\n');
  const secondGroup = cards.slice(3).join('\n');
  return `${pageHead({
    title: 'Finance Video Editing Portfolio | Anwar',
    description: 'Browse Anwar’s finance Reels and YouTube Shorts editing portfolio, with six verified vertical video samples and individual project case studies.',
    canonical
  })}
<body class="editorial-site">
${siteHeader()}
<main class="editorial-main work-page">
  <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Work</span></nav>
  <header class="page-intro">
    <p class="eyebrow">Selected work · ${publishedProjects.length} video samples</p>
    <h1>Finance video editing portfolio</h1>
    <p>Selected short-form finance video samples, presented with project-specific notes about the visible format and editing treatment. No client identities or performance claims are inferred.</p>
  </header>
  <section class="project-grid" aria-label="Published finance video projects">
    ${firstGroup}
  </section>
  ${adSlot('portfolio-interstitial')}
  <section class="project-grid" aria-label="More published finance video projects">
    ${secondGroup}
  </section>
  <section class="page-cta">
    <h2>Have a finance video to edit?</h2>
    <p>Discuss your Reel or YouTube Short project with Anwar.</p>
    <a class="button-link" href="/contact/">Contact Anwar</a>
  </section>
</main>
${siteFooter()}
<script src="/ad-config.js" defer></script>
<script src="/ad-slots.js" defer></script>
</body>
</html>`;
}

function renderProjectPage(project) {
  const canonical = `${baseUrl}/work/${encodeURIComponent(project.slug)}/`;
  const related = project.related
    .map((relatedId) => projectById.get(relatedId))
    .filter((relatedProject) => relatedProject.publicationStatus === 'published');
  const techniques = project.techniques.map((technique) => `<li>${escapeHtml(technique)}</li>`).join('\n');
  const highlights = project.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join('\n');
  const relatedLinks = related.map((relatedProject) => `<a href="/work/${encodeURIComponent(relatedProject.slug)}/">${escapeHtml(relatedProject.title)} <span aria-hidden="true">↗</span></a>`).join('\n');
  const whatsappUrl = `https://wa.me/919334273309?text=${encodeURIComponent(project.contact.whatsappText)}`;
  const emailUrl = `mailto:anwaransarijmt1098@gmail.com?subject=${encodeURIComponent(project.contact.emailSubject)}`;

  return `${pageHead({
    title: project.seo.title,
    description: project.seo.description,
    canonical,
    type: 'article',
    image: `${baseUrl}${project.thumbnail}`,
    imageAlt: project.thumbnailAlt
  })}
<body class="editorial-site project-page">
${siteHeader()}
<main class="editorial-main">
  <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/work/">Work</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(project.title)}</span></nav>
  <article>
    <header class="page-intro project-intro">
      <p class="eyebrow">${escapeHtml(project.category)} <span>·</span> ${project.durationSeconds} seconds</p>
      <h1>${escapeHtml(project.title)}</h1>
      <p>${escapeHtml(project.overview)}</p>
    </header>
    ${adSlot('project-top')}
    <figure class="project-media">
      <video controls preload="none" poster="${escapeHtml(project.thumbnail)}" width="540" height="960" aria-label="Play the ${escapeHtml(project.title)} video sample">
        <source src="${escapeHtml(project.videoUrl)}" type="video/mp4">
        <img src="${escapeHtml(project.thumbnail)}" alt="${escapeHtml(project.thumbnailAlt)}" width="540" height="960" fetchpriority="high">
        Your browser does not support HTML video. <a href="${escapeHtml(project.videoUrl)}">Open the original video sample</a>.
      </video>
      <figcaption>${escapeHtml(project.category)} editing sample · ${project.durationSeconds} seconds. The sample is reproduced as supplied; on-screen financial information is not independently verified.</figcaption>
    </figure>
    <div class="project-copy">
      <section>
        <p class="eyebrow">01 / Project overview</p>
        <h2>Project overview</h2>
        <p>${escapeHtml(project.overview)}</p>
        <h3>Type of finance content</h3>
        <p>${escapeHtml(project.contentType)}</p>
      </section>
      ${adSlot('project-middle')}
      <section>
        <p class="eyebrow">02 / Editing</p>
        <h2>Editing responsibilities shown</h2>
        <p>${escapeHtml(project.editingResponsibilities)}</p>
        <h3>Creative editing approach</h3>
        <p>${escapeHtml(project.editingApproach)}</p>
      </section>
      <section class="detail-columns">
        <div>
          <h2>Editing techniques</h2>
          <ul>${techniques}</ul>
        </div>
        <div>
          <h2>Sample highlights</h2>
          <ul>${highlights}</ul>
        </div>
      </section>
    </div>
    ${adSlot('project-bottom')}
    <nav class="related-projects" aria-label="Related finance video projects">
      <h2>Related projects</h2>
      ${relatedLinks}
      <a href="/work/">Browse all finance video projects <span aria-hidden="true">↗</span></a>
    </nav>
    <section class="project-contact">
      <p class="eyebrow">Next / Enquiry</p>
      <h2>${escapeHtml(project.contact.heading)}</h2>
      <p>Contact Anwar to discuss a similar finance video edit.</p>
      <div class="contact-links">
        <a class="button-link" href="${escapeHtml(emailUrl)}">Email Anwar</a>
        <a class="text-link" href="${escapeHtml(whatsappUrl)}" target="_blank" rel="noopener noreferrer">Discuss on WhatsApp <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  </article>
</main>
${siteFooter()}
<script src="/ad-config.js" defer></script>
<script src="/ad-slots.js" defer></script>
</body>
</html>`;
}

function renderSitePage(page) {
  const canonical = `${baseUrl}/${page.slug}/`;
  const sections = page.sections.map((section) => `<section class="content-section">
    <p class="eyebrow">${escapeHtml(section.heading)}</p>
    <h2>${escapeHtml(section.heading)}</h2>
    <p>${escapeHtml(section.paragraph)}</p>
  </section>`).join('\n');
  const cta = page.cta ? `<section class="page-cta">
    <h2>${escapeHtml(page.cta.heading)}</h2>
    <p>${escapeHtml(page.cta.text)}</p>
    <div class="contact-links">
      <a class="button-link" href="mailto:anwaransarijmt1098@gmail.com">${escapeHtml(page.cta.emailLabel)}</a>
      <a class="text-link" href="https://wa.me/919334273309" target="_blank" rel="noopener noreferrer">${escapeHtml(page.cta.whatsappLabel)} <span aria-hidden="true">↗</span></a>
    </div>
  </section>` : `<p class="policy-updated">Last updated: ${escapeHtml(page.updated)}</p>`;
  const ad = page.adPlacement ? adSlot(page.adPlacement) : '';
  const scripts = page.ads === false ? '' : `<script src="/ad-config.js" defer></script>\n<script src="/ad-slots.js" defer></script>`;

  return `${pageHead({
    title: page.title,
    description: page.description,
    canonical
  })}
<body class="editorial-site">
${siteHeader()}
<main class="editorial-main content-page">
  <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(page.heading)}</span></nav>
  <header class="page-intro">
    <p class="eyebrow">ANWAR / ${escapeHtml(page.heading)}</p>
    <h1>${escapeHtml(page.heading)}</h1>
    <p>${escapeHtml(page.intro)}</p>
  </header>
${ad ? `  ${ad}\n` : ''}
  <div class="content-sections">${sections}</div>
  ${cta}
</main>
${siteFooter()}
${scripts}
</body>
</html>`;
}

function writeRoute(route, html) {
  const output = path.join(root, route, 'index.html');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${html}\n`, 'utf8');
}

const generatedRoutes = [
  'work/index.html',
  ...publishedProjects.map((project) => path.join('work', project.slug, 'index.html')),
  ...sitePages.map((page) => path.join(page.slug, 'index.html'))
];
let previousRoutes = [];
if (fs.existsSync(manifestPath)) {
  previousRoutes = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}
for (const previousRoute of previousRoutes) {
  if (generatedRoutes.includes(previousRoute)) continue;
  const stalePath = path.resolve(root, previousRoute);
  if (!stalePath.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Generated route manifest contains an invalid path: ${previousRoute}`);
  }
  if (fs.existsSync(stalePath)) fs.unlinkSync(stalePath);
}

writeRoute('work', renderWorkPage());
for (const project of publishedProjects) {
  writeRoute(path.join('work', project.slug), renderProjectPage(project));
}
for (const page of sitePages) {
  writeRoute(page.slug, renderSitePage(page));
}
fs.writeFileSync(manifestPath, `${JSON.stringify(generatedRoutes, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  path.join(root, 'ad-config.js'),
  `window.ANWAR_AD_CONFIG = ${JSON.stringify(adConfig, null, 2)};\n`,
  'utf8'
);

const routes = [
  '/',
  '/work/',
  ...publishedProjects.map((project) => `/work/${project.slug}/`),
  ...sitePages.map((page) => `/${page.slug}/`)
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url>
    <loc>${baseUrl}${route}</loc>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap, 'utf8');

console.log(`Generated ${publishedProjects.length} project pages, ${sitePages.length} information pages, and ${routes.length} sitemap URLs.`);
