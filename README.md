# Anwar — Finance Video Editor

A responsive portfolio for Anwar, a freelance video editor specializing in finance Reels and Shorts. The site is built with plain HTML, CSS, and JavaScript and runs without a build step or package installation.

## Features

- Finance-focused introduction, editing benefits, and contact details
- Six short-form video samples with poster covers and animated 3D coverflow navigation
- Dark theme by default, with a compact light/dark toggle
- Project inquiry form that prepares a WhatsApp message
- Responsive layout, scroll reveals, and reduced-motion support
- Rounded, multi-size ICO browser favicon and Anwar profile image
- Search and social metadata, structured profile data, `robots.txt`, and an XML sitemap
- Optional Apache HTTPS redirect and security headers via `.htaccess`

## Run locally

Open `index.html` in a browser. For local development, you can also serve the project directory with any static file server. Keep the asset paths and the `Short video` folder together with the HTML file.

## Publish on GitHub Pages

The canonical URL configured in the page metadata and sitemap is `https://arvind90782-hash.github.io/Anwar-Portfolio/`. To publish it, open the repository's **Settings → Pages** and select the `main` branch with the repository root as the source. After the site is live, submit `https://arvind90782-hash.github.io/Anwar-Portfolio/sitemap.xml` in Google Search Console.

GitHub Pages does not process `.htaccess`; it is included only for Apache hosting. For other hosts, configure HTTPS redirects and equivalent security headers in that host's dashboard or server configuration. Replace the canonical, sitemap, robots, Open Graph, and structured-data URLs if you deploy to a different domain.

## Privacy and security

This static site has no server-side form storage or analytics. The inquiry form puts the visitor's entered details into a WhatsApp message for them to review and send. Anwar's email address and WhatsApp number are intentionally public contact details; no credentials or private keys are included in the site.

## Project files

```text
.
├── index.html
├── style.css
├── script.js
├── .htaccess
├── favicon.ico
├── Anwar.png
├── Anwar.webp
├── robots.txt
├── sitemap.xml
└── Short video/
    ├── cover 1.png ... cover 6.png
    └── short 1.mp4 ... short 6.mp4
```

## Contact

- Email: [anwaransarijmt1098@gmail.com](mailto:anwaransarijmt1098@gmail.com)
- WhatsApp: [9334273309](https://wa.me/919334273309)
