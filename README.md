# Anwar — Finance Video Editor

A responsive portfolio for Anwar, a freelance video editor specializing in finance Reels and Shorts. The site is built with plain HTML, CSS, and JavaScript and runs without a build step or package installation.

## Features

- Finance-focused introduction, editing benefits, and contact details
- Six short-form video samples with poster covers and animated 3D coverflow navigation
- Dark theme by default, with a compact light/dark toggle
- Project inquiry form that prepares a WhatsApp message
- Responsive layout, scroll reveals, and reduced-motion support
- 96 × 96 PNG favicon, multi-size ICO fallback, and Anwar profile image
- Search and social metadata, structured profile data, `robots.txt`, and an XML sitemap
- Optimized video poster images for faster loading
- Vercel security headers via `vercel.json` and an Apache fallback via `.htaccess`
- A PowerShell helper for reviewing, committing, and pushing changes to GitHub

## Run locally

Open `index.html` in a browser. For local development, you can also serve the project directory with any static file server. Keep the asset paths and the `Short video` folder together with the HTML file.

## Publish changes to GitHub on Windows

After editing the site, open PowerShell in this project folder and run:

```powershell
.\push-changes.ps1
```

If PowerShell blocks the script, run it for this command only with:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\push-changes.ps1
```

The helper checks for changes, stages the project, shows what will be committed, and asks for a commit message and confirmation before committing and pushing to the `origin` remote on the current branch. Review the displayed file list and do not continue if it includes files you do not intend to publish. Git must be installed and authenticated with GitHub before the first push.

## Deployment and search indexing

The primary production URL configured in the page metadata and sitemap is `https://anwar-videoeditor.vercel.app/`. Deploy the repository through Vercel so `vercel.json` security headers are applied. `sitemap.xml` lists the crawlable pages only, because URL fragments such as `/#about` are not separate indexable pages. Submit `https://anwar-videoeditor.vercel.app/sitemap.xml` in Google Search Console after deployment and verify the homepage with URL Inspection.

GitHub Pages does not process `.htaccess` or Vercel headers. `.htaccess` is only for Apache hosting. If you use another domain or host, update the canonical, sitemap, robots, Open Graph, and structured-data URLs and configure equivalent security headers on that host.

## Privacy and security

This static site has no server-side form storage or analytics. The inquiry form puts the visitor's entered details into a WhatsApp message for them to review and send. Anwar's email address and WhatsApp number are intentionally public contact details; no credentials or private keys are included in the site.

## Editorial pages and project publishing

The existing homepage remains the main portfolio experience. New editorial pages use a separate stylesheet so their monochrome presentation does not alter the homepage design.

- `/work/` lists published project samples.
- `/work/<project-slug>/` contains the corresponding crawlable project case study.
- `/services/`, `/about/`, `/contact/`, and `/privacy-policy/` contain supporting information.
- Previous `/projects/<project-slug>/` addresses permanently redirect to the new `/work/` case-study routes on Vercel and Apache.

Project content is maintained in `data/projects.json`. Each entry has a `publicationStatus` of `draft` or `published`; only published projects are generated into the portfolio, sitemap, and related-project links. After editing project or supporting-page data, run:

```powershell
node .\scripts\generate-pages.js
```

The generator writes static HTML into the route directories, updates the sitemap, and removes only previously generated route files that are no longer published. Commit the generated HTML together with the source data so the static Vercel deployment serves crawlable content without client-side rendering.

## Advertising slots

The reusable placements are defined in `data/ad-config.json`; the page generator emits `ad-config.js`, and `ad-slots.js` renders the configured placements. All site-managed placements are disabled by default. A placement only renders a configured active campaign; optional fallback copy is available if a placement is deliberately enabled without a campaign. Enabled slots reserve space in the generated HTML to avoid shifting content when the placement script runs. Campaign links are labeled as advertisements and use `rel="sponsored noopener noreferrer"`. Do not enable a campaign until the owner has confirmed the creative, destination, advertiser and any required advertising-provider approvals.

The Google AdSense ownership-verification script for publisher `ca-pub-3376684105322240` is included in the homepage and generated page heads. The CSP permits that script host. This ownership snippet is separate from the disabled site-managed ad slots; confirm Auto ads are not enabled in the AdSense account unless and until the owner intends to show ads. No `ads.txt` file is generated because no official `ads.txt` directive was supplied.

The privacy page reflects the current implementation and should be reviewed by the owner for accuracy and local legal requirements before it is treated as legal advice.

## Project files

```text
.
├── index.html
├── style.css
├── script.js
├── .htaccess
├── favicon.ico
├── favicon-96x96.png
├── Anwar.png
├── Anwar.webp
├── apple-touch-icon.png
├── robots.txt
├── sitemap.xml
├── vercel.json
├── push-changes.ps1
└── Short video/
    ├── cover 1.jpg ... cover 6.jpg
    └── short 1.mp4 ... short 6.mp4
```

## Contact

- Email: [anwaransarijmt1098@gmail.com](mailto:anwaransarijmt1098@gmail.com)
- WhatsApp: [9334273309](https://wa.me/919334273309)
