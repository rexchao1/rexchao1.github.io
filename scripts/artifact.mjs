// Turns dist/index.html into the artifact page (no doctype/html/head/body; the viewer adds its own) and a copy with
// the viewer's strict content policy, dist/csp-test.html, to check it locally before publishing.
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist/index.html', 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
const keep = head
  .split('\n')
  .filter((l) => !/<meta charset|<meta name="viewport"/.test(l))
  .join('\n');
const title = keep.match(/<title>.*?<\/title>/)[0];
const page = `${title}\n${keep.replace(title, '')}\n${body}\n`;
writeFileSync('dist/artifact.html', page);
const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' https://cdn.jsdelivr.net/npm/; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src data: blob:;">\n`;
writeFileSync('dist/csp-test.html', `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">${csp}</head><body>${page}</body></html>`);
console.log('artifact.html', (page.length / 1e6).toFixed(2), 'MB');
