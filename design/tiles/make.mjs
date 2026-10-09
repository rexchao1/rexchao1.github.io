// Writes a.html, b.html, c.html from one template and three themes.
import { writeFileSync } from 'node:fs';

const themes = {
  a: { title: 'Drift', style: 'points', bg: '#04060A', ink: '#DCE6F2', accent: '#8FD3FF',
       fonts: 'family=Michroma&family=Hanken+Grotesk:wght@400;500',
       displayFont: "'Michroma', sans-serif", bodyFont: "'Hanken Grotesk', sans-serif",
       nameSize: 'clamp(34px,6vw,84px)', nameTrack: '0.02em', nameWeight: 400,
       photoTones: ['#1B2430', '#232B36', '#1A2029', '#26303C'], screenBg: '#0E141C', fogNear: 10, fogFar: 46, dust: 2600 },
  b: { title: 'Chrome', style: 'chrome', bg: '#0B0B0D', ink: '#EDEDEA', accent: '#D7C29A',
       fonts: 'family=Archivo:wdth,wght@62..125,400..800',
       displayFont: "'Archivo', sans-serif", bodyFont: "'Archivo', sans-serif",
       nameSize: 'clamp(44px,8vw,128px)', nameTrack: '-0.03em', nameWeight: 800, nameStretch: '125%',
       photoTones: ['#2A2723', '#33302B', '#24221F', '#3A362F'], screenBg: '#151517', fogNear: 12, fogFar: 52, dust: 900 },
  c: { title: 'Signal', style: 'wire', bg: '#07080C', ink: '#B9C3FF', accent: '#FFB547',
       fonts: 'family=Tektur:wght@400;600',
       displayFont: "'Tektur', sans-serif", bodyFont: "'Tektur', sans-serif",
       nameSize: 'clamp(40px,7.5vw,112px)', nameTrack: '-0.01em', nameWeight: 600,
       photoTones: ['#6B7280', '#9CA3AF', '#4B5563', '#808894'], screenBg: '#10131C', fogNear: 9, fogFar: 44, dust: 1600 },
};

for (const [id, th] of Object.entries(themes)) {
  const cfg = { ...th, inkCss: th.ink, accentCss: th.accent };
  writeFileSync(`${id}.html`, `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rex Chao, direction ${id.toUpperCase()}: ${th.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${th.fonts}&display=swap">
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>
<style>
:root{--bg:${th.bg};--ink:${th.ink};--accent:${th.accent};--display:${th.displayFont};--body:${th.bodyFont}}
html,body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--body)}
#gl{position:fixed;inset:0;width:100vw;height:100vh;display:block}
.track{height:1100vh}
.ov{position:fixed;pointer-events:none;opacity:0;will-change:opacity,transform}
.ov a{pointer-events:auto;color:var(--ink)}
.name{left:clamp(16px,5vw,72px);bottom:clamp(28px,8vh,88px);font-family:var(--display);font-size:${th.nameSize};letter-spacing:${th.nameTrack};font-weight:${th.nameWeight};font-stretch:${th.nameStretch || '100%'};line-height:.95;margin:0}
.sub{display:block;font-family:var(--body);font-size:16px;letter-spacing:0;font-weight:400;font-stretch:100%;opacity:.7;margin-top:18px;line-height:1.5}
.word{left:50%;top:14vh;transform:translateX(-50%);font-family:var(--display);font-size:clamp(22px,3vw,40px);font-weight:${th.nameWeight};font-stretch:${th.nameStretch || '100%'};white-space:nowrap;margin:0}
.word small{display:block;text-align:center;font-family:var(--body);font-size:15px;font-weight:400;font-stretch:100%;opacity:.65;margin-top:10px}
#caption{position:fixed;left:clamp(16px,5vw,72px);bottom:clamp(28px,8vh,72px);font-size:clamp(20px,2.4vw,30px);transition:opacity .3s ease;opacity:0;pointer-events:none}
.contact{left:clamp(16px,5vw,72px);bottom:clamp(28px,10vh,96px)}
.contact h2{font-family:var(--display);font-size:clamp(48px,9vw,140px);font-weight:${th.nameWeight};font-stretch:${th.nameStretch || '100%'};margin:0 0 20px;line-height:.9}
.links{display:flex;flex-wrap:wrap;gap:12px 28px;font-size:18px}
.links a{text-decoration:none;border-bottom:1px solid var(--accent);padding-bottom:3px;min-height:24px}
.hint{right:clamp(16px,5vw,72px);bottom:clamp(28px,8vh,88px);font-size:14px;opacity:0}
.tag{position:fixed;top:16px;right:16px;font-size:12px;opacity:.45}
</style>
</head>
<body>
<canvas id="gl" aria-hidden="true"></canvas>
<div class="track"></div>
<span class="tag">${id.toUpperCase()} · ${th.title}</span>

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
<nav class="links"><a href="mailto:rexchao1@gmail.com">rexchao1@gmail.com</a><a href="https://www.linkedin.com/in/rexchao1/">LinkedIn</a><a href="#">Resume</a><a href="https://github.com/rexchao1">GitHub</a></nav>
</div>

<script type="module">
import { start } from './engine.js';
start(${JSON.stringify(cfg)});
</script>
</body>
</html>
`);
}
console.log('wrote a, b, c');
