import { defineConfig } from 'vite';
import { homeSaver, popfoldFallback } from 'popfold/vite';
import { STORIES } from './src/stories.ts'; // with its extension: Vite's native config loader needs it

const LINKEDIN = 'https://www.linkedin.com/in/dimiter-todorov-94248213/';
const CONTACT = `## Contact\n\n- LinkedIn: ${LINKEDIN}\n- Toronto, Ontario · remote · open to consulting and speaking`;

// The personal resume site on Popfold: the site (index.html) and Popfold Studio (studio.html).
// popfoldFallback writes the tower's stories under each floor's section, adds the stills captured in the studio
// (public/stills/personal-tower-<n>.webp), Person structured data and llms.txt for crawlers and agents.
export default defineConfig({
  base: './',
  plugins: [
    homeSaver({ home: 'src/home.json' }), // the studio's Save writes into the home file
    popfoldFallback({
      siteName: 'Dimiter Todorov',
      siteUrl: 'https://todorov.ca/', // canonical links, share images, the sitemap and each language's hreflang
      // the site in English, and the same page in Bulgarian (bg/) and German (de/): its words swapped by the
      // translation files in src/i18n/ (the build makes bg/index.html and de/index.html). The pieces and their place
      // are in the home file; the stories come from stories.ts.
      pages: [
        { html: 'index.html', homeFile: 'src/home.json', stories: STORIES, storiesHeading: 'On this floor', llmsExtra: CONTACT },
        { html: 'bg/index.html', from: 'index.html', lang: 'bg', text: 'src/i18n/bg.json', homeFile: 'src/home.json', stories: STORIES, storiesHeading: 'On this floor' },
        { html: 'de/index.html', from: 'index.html', lang: 'de', text: 'src/i18n/de.json', homeFile: 'src/home.json', stories: STORIES, storiesHeading: 'On this floor' },
      ],
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Dimiter Todorov',
        jobTitle: 'Senior Cyber Security & Integration Specialist',
        description: 'ServiceNow SecOps architect building the integrations and automation that make security operations work.',
        address: { '@type': 'PostalAddress', addressLocality: 'Toronto', addressRegion: 'ON', addressCountry: 'CA' },
        worksFor: { '@type': 'GovernmentOrganization', name: 'Ontario Treasury Board Secretariat' },
        alumniOf: { '@type': 'CollegeOrUniversity', name: 'Georgian College' },
        sameAs: [LINKEDIN],
        knowsAbout: ['ServiceNow Security Incident Response', 'Vulnerability Response', 'USEM / CTEM', 'Systems integration', 'CMDB',
          'Microsoft Defender', 'Microsoft Sentinel', 'Splunk', 'Azure', 'Azure DevOps', 'Microsoft 365', 'Cloudflare',
          'Penetration testing', 'AI-assisted software engineering', 'TypeScript', 'Kotlin'],
      },
    }),
  ],
  build: {
    target: 'es2020', assetsInlineLimit: 0, chunkSizeWarningLimit: 760,
    rollupOptions: { input: { main: 'index.html', studio: 'studio.html' } },
  },
});
