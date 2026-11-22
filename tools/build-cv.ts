// Makes the CV's PDF from its data (src/cv.ts): public/cv/dimiter-todorov-cv.pdf, which the site's CV buttons
// download. It writes the CV as one HTML page in the site's fonts, then has a local Chrome or Edge print it, so the
// PDF's text is real text (searchable, readable by recruiters' tools). Run by `pnpm cv` and before every build.
//
//   node tools/build-cv.ts            the PDF (and, beside it in the system's temp folder, the HTML it was made from)
//   node tools/build-cv.ts --html     only the HTML, in public/cv/, to look at in a browser
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CV } from '../src/cv.ts';

const root = resolve(import.meta.dirname, '..');
const outDir = join(root, 'public', 'cv');
const pdf = join(outDir, 'dimiter-todorov-cv.pdf');

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const font = (pkg: string, file: string) => pathToFileURL(join(root, 'node_modules', '@fontsource-variable', pkg, 'files', file)).href;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(CV.name)}: CV</title>
<style>
  @font-face { font-family: 'Display'; src: url('${font('bricolage-grotesque', 'bricolage-grotesque-latin-wght-normal.woff2')}') format('woff2'); font-weight: 200 800; }
  @font-face { font-family: 'Body'; src: url('${font('dm-sans', 'dm-sans-latin-wght-normal.woff2')}') format('woff2'); font-weight: 100 1000; }
  /* DM Sans has no Cyrillic (НЗОК): those letters come from Manrope */
  @font-face { font-family: 'Body'; src: url('${font('manrope', 'manrope-cyrillic-wght-normal.woff2')}') format('woff2'); font-weight: 200 800; unicode-range: U+0400-045F, U+0490-0491; }
  @page { size: Letter; margin: 0.5in 0.58in; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 9.4pt/1.4 'Body', system-ui, sans-serif; color: #1B1830; }
  a { color: inherit; text-decoration: none; }
  a.link { color: #4A2F8A; text-decoration: underline; text-decoration-color: #C2189C; }
  header { border-bottom: 2.5pt solid #FF4FD8; padding-bottom: 9pt; margin-bottom: 10pt; }
  h1 { font: 800 25pt/1 'Display', sans-serif; letter-spacing: -0.02em; margin: 0; }
  h1 b { color: #C2189C; }
  .role { font: 600 11pt 'Body', sans-serif; color: #4A2F8A; margin: 4pt 0 5pt; }
  .contact { display: flex; flex-wrap: wrap; gap: 0 14pt; font-size: 8.8pt; color: #4B4766; }
  h2 { font: 800 10.5pt 'Display', sans-serif; text-transform: uppercase; letter-spacing: 0.08em; color: #0E7C93; margin: 10pt 0 4pt; }
  .summary { margin: 0; }
  .job { margin: 0 0 8pt; break-inside: avoid-page; }
  .job-head { display: flex; justify-content: space-between; gap: 12pt; align-items: baseline; }
  .job-title { font-weight: 700; font-size: 10.2pt; }
  .when { color: #6A6585; font-size: 8.8pt; white-space: nowrap; }
  .org { color: #4B4766; font-size: 9pt; }
  .intro { margin: 2pt 0 0; font-style: italic; color: #4B4766; }
  ul { margin: 3pt 0 0; padding-left: 13pt; }
  li { margin: 1.5pt 0; }
  li::marker { color: #C2189C; }
  .project { margin: 0 0 5pt; break-inside: avoid; }
  .project b { font-weight: 700; }
  .skills { display: grid; grid-template-columns: 1.15in 1fr; gap: 2.5pt 10pt; }
  .skills dt { font-weight: 700; }
  .skills dd { margin: 0; }
</style>
</head>
<body>
<header>
  <h1>${esc(CV.name)}</h1>
  <p class="role">${esc(CV.title)}</p>
  <div class="contact">${CV.contact.map((c) => (c.href ? `<a href="${esc(c.href)}">${esc(c.label)}</a>` : `<span>${esc(c.label)}</span>`)).join('')}</div>
</header>
<p class="summary">${esc(CV.summary)}</p>

<h2>Experience · Ontario Public Service</h2>
${CV.experience.map((r) => `<section class="job">
  <div class="job-head"><span class="job-title">${esc(r.title)}</span><span class="when">${esc(r.when)}</span></div>
  <div class="org">${esc(r.org)}</div>
  ${r.intro ? `<p class="intro">${esc(r.intro)}</p>` : ''}
  ${r.points.length ? `<ul>${r.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
</section>`).join('\n')}

<h2>Projects</h2>
${CV.projects.map((p) => {
  // a project's client or page, linked: its name in the text becomes the link
  const link = 'link' in p ? (p as { link: { label: string; href: string } }).link : undefined;
  const text = link ? esc(p.text).replace(esc(link.label), `<a class="link" href="${esc(link.href)}">${esc(link.label)}</a>`) : esc(p.text);
  return `<p class="project"><b>${esc(p.title)}</b> <span class="when">· ${esc(p.when)}</span><br />${text}</p>`;
}).join('\n')}

<h2>Skills</h2>
<dl class="skills">${CV.skills.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>

<h2>Education</h2>
${CV.education.map((e) => `<p class="project"><b>${esc(e.org)}</b> <span class="when">· ${esc(e.when)}</span></p>`).join('\n')}

<h2>Languages</h2>
<p class="project">${CV.languages.map(esc).join(' · ')}</p>
</body>
</html>
`;

mkdirSync(outDir, { recursive: true });
if (process.argv.includes('--html')) {
  writeFileSync(join(outDir, 'cv.html'), html);
  console.log(`cv: wrote ${join(outDir, 'cv.html')}`);
  process.exit(0);
}

/** a local Chrome or Edge to print with (CHROME_PATH wins) */
const browser = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].find((p) => p && existsSync(p));
if (!browser) throw new Error('cv: no Chrome or Edge found to print the PDF with; set CHROME_PATH');

const work = mkdtempSync(join(tmpdir(), 'cv-'));
const page = join(work, 'cv.html');
writeFileSync(page, html);
// the browser's own profile in the temp folder: printing never touches the user's browser or its sign-ins
execFileSync(browser, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--user-data-dir=${join(work, 'profile')}`,
  '--allow-file-access-from-files', `--print-to-pdf=${pdf}`, pathToFileURL(page).href], { stdio: 'ignore', timeout: 120_000 });
rmSync(work, { recursive: true, force: true });
if (!existsSync(pdf)) throw new Error('cv: the browser did not write the PDF');
console.log(`cv: wrote ${pdf}`);
