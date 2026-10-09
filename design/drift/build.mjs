// Builds drift/index.html: direction A as one self-contained page (classic three.js build, engine inlined).
import { readFileSync, writeFileSync } from 'node:fs';
let engine = readFileSync(new URL('../tiles/engine.js', import.meta.url), 'utf8');
engine = engine
  .replace(/^import .*\n/gm, '')
  .replace('export async function start(theme)', 'async function start(theme)')
  .replace('const s = new MeshSurfaceSampler(mesh).build();', 'const s = makeSampler(geometry);')
  .replace('t.colorSpace = THREE.SRGBColorSpace;', 't.encoding = THREE.sRGBEncoding;')
  .replace("renderer.toneMapping = THREE.ACESFilmicToneMapping;", "renderer.toneMapping = THREE.ACESFilmicToneMapping;\n  renderer.outputEncoding = THREE.sRGBEncoding;");
if (engine.includes('MeshSurfaceSampler(') || engine.includes('SRGBColorSpace')) throw new Error('replacement missed');
const sampler = `
// Picks random points on a mesh surface, weighted by triangle area.
function makeSampler(geometry) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry;
  const p = g.attributes.position.array, n = p.length / 9, cum = new Float32Array(n);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  let total = 0;
  for (let i = 0; i < n; i++) {
    a.fromArray(p, i * 9); b.fromArray(p, i * 9 + 3); c.fromArray(p, i * 9 + 6);
    total += b.clone().sub(a).cross(c.clone().sub(a)).length() / 2; cum[i] = total;
  }
  return { sample(out) {
    const r = Math.random() * total; let lo = 0, hi = n - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < r) lo = m + 1; else hi = m; }
    let u = Math.random(), v = Math.random(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
    a.fromArray(p, lo * 9); b.fromArray(p, lo * 9 + 3); c.fromArray(p, lo * 9 + 6);
    return out.copy(a).addScaledVector(b.sub(a), u).addScaledVector(c.sub(a), v);
  } };
}
`;
const theme = { title: 'Drift', style: 'points', bg: '#04060A', ink: '#DCE6F2', accent: '#8FD3FF',
  displayFont: "'Michroma', sans-serif", bodyFont: "'Hanken Grotesk', sans-serif",
  photoTones: ['#1B2430', '#232B36', '#1A2029', '#26303C'], screenBg: '#0E141C', fogNear: 10, fogFar: 46, dust: 2600,
  inkCss: '#DCE6F2', accentCss: '#8FD3FF' };
const csp = process.argv[2] === '--csp'
  ? `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net/npm/ https://unpkg.com; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src data: blob:;">\n` : '';
const page = `${csp}<title>Rex Chao</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Michroma&family=Hanken+Grotesk:wght@400;500&display=swap">
<style>
/* One fixed WebGL world; the tall track only drives the camera. Single dark look on purpose. */
:root{--bg:#04060A;--ink:#DCE6F2;--accent:#8FD3FF;--display:'Michroma',sans-serif;--body:'Hanken Grotesk',system-ui,sans-serif;color-scheme:dark}
html,body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--body)}
#gl{position:fixed;inset:0;width:100vw;height:100vh;display:block}
.track{height:1100vh}
.ov{position:fixed;pointer-events:none;opacity:0;will-change:opacity,transform;margin:0}
.ov a{pointer-events:auto;color:var(--ink)}
.name{left:clamp(16px,5vw,72px);bottom:clamp(28px,8vh,88px);font-family:var(--display);font-size:clamp(34px,6vw,84px);letter-spacing:.02em;font-weight:400;line-height:.95;opacity:1}
.sub{display:block;font-family:var(--body);font-size:17px;letter-spacing:0;opacity:.7;margin-top:18px;line-height:1.5}
.word{left:50%;top:14vh;transform:translateX(-50%);font-family:var(--display);font-size:clamp(20px,3vw,40px);white-space:nowrap}
.word small{display:block;text-align:center;font-family:var(--body);font-size:15px;opacity:.65;margin-top:10px;white-space:normal}
#caption{position:fixed;left:clamp(16px,5vw,72px);bottom:clamp(28px,8vh,72px);font-size:clamp(20px,2.4vw,30px);transition:opacity .3s ease;opacity:0;pointer-events:none;margin:0}
.contact{left:clamp(16px,5vw,72px);right:16px;bottom:clamp(28px,10vh,96px)}
.contact h2{font-family:var(--display);font-size:clamp(44px,9vw,140px);font-weight:400;margin:0 0 20px;line-height:.9}
.links{display:flex;flex-wrap:wrap;gap:12px 28px;font-size:18px}
.links a{text-decoration:none;border-bottom:1px solid var(--accent);padding-bottom:3px}
.links a:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
.hint{right:clamp(16px,5vw,72px);bottom:clamp(28px,8vh,88px);font-size:14px}
#fail{position:fixed;inset:auto 16px 16px 16px;font-size:14px;opacity:.7}
</style>
<canvas id="gl" aria-hidden="true"></canvas>
<div class="track"></div>
<h1 class="ov name" data-in="-1" data-out="0.06">Rex Chao<span class="sub">I made Wren. I study CS at UCLA.</span></h1>
<p class="ov hint" data-in="-1" data-out="0.04">Scroll</p>
<p id="caption" aria-live="polite"></p>
<p class="ov word" data-in="0.46" data-out="0.53">On repeat</p>
<p class="ov word" data-in="0.565" data-out="0.65">Out of Danville</p>
<p class="ov word" data-in="0.69" data-out="0.76">Tooey<small>Cofounder. Prep forecasts for restaurants.</small></p>
<p class="ov word" data-in="0.80" data-out="0.86">Builds</p>
<p class="ov word" data-in="0.865" data-out="0.92">Team player?<small>Ask Photon Commerce and StudioApp.ai</small></p>
<div class="ov contact" data-in="0.95" data-out="2">
<h2>Say hi</h2>
<nav class="links"><a href="https://www.linkedin.com/in/rexchao1/">LinkedIn</a><a href="https://github.com/rexchao1">GitHub</a><a href="#top">Resume</a><span style="opacity:.8;user-select:all">rexchao1@gmail.com</span></nav>
</div>
<p id="fail" hidden></p>
<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js"></script>
<script>
${sampler}
${engine}
if (window.THREE) { start(${JSON.stringify(theme)}).catch((e) => { const f = document.getElementById('fail'); f.hidden = false; f.textContent = 'The 3D scene could not start: ' + e.message; }); }
else { const f = document.getElementById('fail'); f.hidden = false; f.textContent = 'The 3D library did not load.'; }
</script>
`;
writeFileSync(new URL(process.argv[2] === '--csp' ? './csp-test.html' : './index.html', import.meta.url), page);
console.log('built', process.argv[2] || '');
