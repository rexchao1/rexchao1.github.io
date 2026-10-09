// Builds drift/index.html, one self-contained page (classic three.js build, drift.js inlined).
// `node build.mjs --csp` writes csp-test.html with a strict policy, to test like the artifact viewer.
import { readFileSync, writeFileSync } from 'node:fs';

const csp = process.argv[2] === '--csp';
const engine = readFileSync(new URL('./drift.js', import.meta.url), 'utf8');
const theme = { bg: '#04060A', ink: '#DCE6F2', accent: '#8FD3FF', displayFont: "'Michroma', sans-serif", bodyFont: "'Hanken Grotesk', sans-serif" };
const icon = {
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>',
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>',
  resume: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 13h4"></path><path d="M10 17h4"></path></svg>',
};

const page = `${csp ? `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' https://cdn.jsdelivr.net/npm/; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:;">\n` : ''}<title>Rex Chao</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Michroma&family=Hanken+Grotesk:wght@400;500;600&display=swap">
<style>
/* One fixed WebGL world; the tall track only drives the camera. Single dark look on purpose. */
:root{--bg:#04060A;--ink:#DCE6F2;--dim:#9AA6B4;--accent:#8FD3FF;--display:'Michroma','Eurostile',sans-serif;--body:'Hanken Grotesk',system-ui,sans-serif;color-scheme:dark}
html,body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--body)}
#gl{position:fixed;inset:0;width:100vw;height:100vh;display:block}
.track{height:640vh}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.ov{position:fixed;pointer-events:none;opacity:0;margin:0}
.ov a{pointer-events:auto}
.hello{left:clamp(16px,5vw,72px);bottom:clamp(28px,7vh,72px);font-size:17px;color:var(--dim);line-height:1.5}
.hint{right:clamp(16px,5vw,72px);bottom:clamp(28px,7vh,72px);font-size:14px;color:var(--dim)}
.word{left:16px;right:16px;top:12vh;text-align:center;font-family:var(--display);font-size:clamp(20px,2.8vw,36px)}
.word small{display:block;font-family:var(--body);font-size:16px;color:var(--dim);margin-top:10px}
#caption{position:fixed;left:16px;right:16px;bottom:clamp(28px,9vh,80px);text-align:center;font-size:clamp(18px,2.2vw,26px);transition:opacity .3s ease;opacity:0;pointer-events:none;margin:0;text-wrap:balance}
#blurb{position:fixed;left:0;top:0;width:min(320px,calc(100vw - 32px));pointer-events:none;opacity:0;transition:opacity .2s ease;background:rgba(4,6,10,.88);border:1px solid rgba(220,230,242,.18);padding:14px 16px;box-sizing:border-box;line-height:1.45;font-size:15px}
#blurb b{display:block;font-family:var(--display);font-weight:400;font-size:15px;margin-bottom:6px}
#blurb span{color:var(--dim)}
.teams{left:16px;right:16px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:36px}
.teams p{margin:0;font-family:var(--display);font-size:clamp(22px,3vw,40px);text-align:center}
.logos{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:28px 56px}
.logos{gap:20px}
.logos span{background:#EEF2F6;display:flex;align-items:center;justify-content:center;height:96px;padding-inline:28px;box-sizing:border-box;max-width:100%}
.logos img{display:block;max-width:100%;height:auto}
.contact{left:clamp(16px,5vw,72px);right:16px;bottom:clamp(28px,9vh,88px)}
.contact h2{font-family:var(--display);font-size:clamp(44px,9vw,132px);font-weight:400;margin:0 0 28px;line-height:.9}
.links{display:flex;flex-wrap:wrap;align-items:center;gap:14px 30px;font-size:17px}
.links a{display:inline-flex;align-items:center;gap:10px;color:var(--ink);text-decoration:none;min-height:44px}
.links a:hover{color:var(--accent)}
.links a:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
.links svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.email{color:var(--dim);user-select:all}
#fail{position:fixed;left:16px;right:16px;bottom:16px;font-size:14px;color:var(--dim)}
</style>
<canvas id="gl" aria-hidden="true"></canvas>
<div class="track"></div>
<h1 class="sr">Rex Chao</h1>
<p class="ov hello" data-in="-1" data-out="0.05">I made Wren. I study CS at UCLA.</p>
<p class="ov hint" data-in="-1" data-out="0.04">Scroll</p>
<p id="caption" aria-live="polite"></p>
<p class="ov word" data-in="0.535" data-out="0.6">Tooey<small>Cofounder. Prep forecasts for restaurants.</small></p>
<p class="ov word" data-in="0.62" data-out="0.86">Builds<small>Hover one</small></p>
<div id="blurb" role="status"><b></b><span></span></div>
<div class="ov teams" data-in="0.875" data-out="0.935">
<p>Team player? Ask them.</p>
<div class="logos"><span><img src="assets/photon.png" alt="Photon Commerce" width="230" height="48"></span><span><img src="assets/studioapp.png" alt="" width="72" height="72"><b style="color:#1F4E6E;font-family:var(--body);font-size:22px;margin-left:10px">StudioApp.ai</b></span></div>
</div>
<div class="ov contact" data-in="0.955" data-out="2">
<h2>Say hi</h2>
<nav class="links" aria-label="Contact">
<a href="https://www.linkedin.com/in/rexchao1/">${icon.linkedin}LinkedIn</a>
<a href="https://github.com/rexchao1">${icon.github}GitHub</a>
<a href="#resume">${icon.resume}Resume</a>
<span class="email">rexchao1@gmail.com</span>
</nav>
</div>
<p id="fail" hidden></p>
<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js"></script>
<script>
${engine}
(function () {
  const fail = (m) => { const f = document.getElementById('fail'); f.hidden = false; f.textContent = m; };
  if (!window.THREE) return fail('The 3D library did not load.');
  start(${JSON.stringify(theme)}).catch((e) => fail('The 3D scene could not start: ' + e.message));
})();
</script>
`;
writeFileSync(new URL(csp ? './csp-test.html' : './index.html', import.meta.url), page);
console.log('built', csp ? 'csp-test.html' : 'index.html');
