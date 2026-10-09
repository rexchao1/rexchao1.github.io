// Drift: one particle world in dark space. Scroll moves the camera through it:
// Wren, through Rex's name, into a ring of About items, Tooey, a row of builds, teams, contact.
// Plain script on the classic three.js build (global THREE).

const ABOUT = [ // angle in degrees around the ring, y offset, item
  { deg: 0, dy: 0.1, kind: 'photo', label: 'You', caption: "Hi, I'm Rex. CS at UCLA.", w: 2.1, h: 2.7 },
  { deg: 36, dy: -0.35, kind: 'photo', label: 'Baseball', caption: 'Volunteer umpire, Tri-Valley youth baseball', w: 2.6, h: 1.9 },
  { deg: 72, dy: 0.4, kind: 'photo', label: 'Tahoe', caption: 'Tahoe, every winter', w: 1.9, h: 2.5 },
  { deg: 108, dy: -0.25, kind: 'photo', label: 'Pickleball', caption: 'Pickleball, for fun', w: 2.3, h: 1.7 },
  { deg: 144, dy: 0.15, kind: 'map', caption: 'From Danville. Since then: Peru, Japan, China, Spain, Mexico, Alaska' },
  { deg: 180, dy: -0.3, kind: 'photo', label: 'LA eats', caption: 'LA eats', w: 2.2, h: 2.2 },
  { deg: 216, dy: 0.35, kind: 'photo', label: 'Friends', caption: 'The crew', w: 2.6, h: 1.8 },
  { deg: 252, dy: -0.1, kind: 'records', caption: 'On repeat: [your top artists]' },
  { deg: 288, dy: 0.2, kind: 'pets', caption: 'Rusty, Petey and Jasper' },
];
const BUILDS = [
  { name: 'Front desk', img: 'assets/frontdesk.jpg', aspect: 1.6, about: 'An AI front desk for a real dental office. It checks insurance, waits on hold and drafts referral letters for staff to approve.' },
  { name: 'Fetch', img: 'assets/fetch.jpg', aspect: 1.39, about: 'A Mac app that streams video without the ads. Building it taught me how HLS playlists actually work.' },
  { name: 'Bruin Desk', img: 'assets/bruindesk.jpg', aspect: 1.6, about: 'My whole UCLA life in one private dashboard: classes, GPA, deadlines and degree progress.' },
  { name: 'PoseAR', img: null, aspect: 0.46, about: 'Tell a 3D person what to do and they do it in your iPhone camera.' },
  { name: 'CatCart', img: 'assets/catcart.jpg', aspect: 0.46, about: 'An endless runner starring a cat. Four worlds and four power-ups, built in SceneKit.' },
  { name: 'Laoshu', img: 'assets/laoshu.jpg', aspect: 0.46, about: 'Chinese flashcards for 5,400 HSK words, with reviews the next day and a week later.' },
];
const PLACES = [[-150, 61], [-102, 23], [-75, -10], [-4, 40], [105, 35], [138, 36]];
const HOME = [-122, 37.8];
const LAND = [
  [-100, 45, 32, 18], [-150, 63, 14, 7], [-85, 15, 10, 9], [-62, -12, 16, 22], [-68, -40, 7, 12],
  [15, 50, 22, 10], [-3, 40, 6, 4], [20, 5, 20, 26], [25, -25, 12, 10], [90, 50, 50, 16],
  [100, 25, 22, 12], [78, 20, 9, 10], [138, 37, 3, 7], [134, -25, 17, 11], [-42, 72, 13, 8],
];

const RING = new THREE.Vector3(0, 2.2, -30), RING_R = 7;
const RING_START = 0.25, RING_END = 0.5, RING_SWEEP = THREE.MathUtils.degToRad(288);
const ROW_Z = -76, ROW_Y = 2.2, ROW_H = 2.3, ROW_GAP = 1.1;

const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const ringDir = (a) => new THREE.Vector3(Math.sin(a), 0, -Math.cos(a));

function textTexture(draw, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  return t;
}

function makeSampler(geometry) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry;
  const p = g.attributes.position.array, n = p.length / 9, cum = new Float32Array(n);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  let total = 0;
  for (let i = 0; i < n; i++) {
    a.fromArray(p, i * 9); b.fromArray(p, i * 9 + 3); c.fromArray(p, i * 9 + 6);
    total += b.clone().sub(a).cross(c.clone().sub(a)).length() / 2; cum[i] = total;
  }
  return (out) => {
    const r = Math.random() * total; let lo = 0, hi = n - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < r) lo = m + 1; else hi = m; }
    let u = Math.random(), v = Math.random(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
    a.fromArray(p, lo * 9); b.fromArray(p, lo * 9 + 3); c.fromArray(p, lo * 9 + 6);
    return out.copy(a).addScaledVector(b.sub(a), u).addScaledVector(c.sub(a), v);
  };
}

async function start(theme) {
  await document.fonts.ready;
  const canvas = document.getElementById('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  const scene = new THREE.Scene();
  const bg = new THREE.Color(theme.bg);
  scene.background = bg; scene.fog = new THREE.Fog(bg, 9, 40);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 300);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 0.8); sun.position.set(3, 6, 5); scene.add(sun);
  const ink = new THREE.Color(theme.ink), accent = new THREE.Color(theme.accent);
  const loader = new THREE.TextureLoader();

  const dots = (positions, size, opacity = 0.9, color = ink) => {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color, size, transparent: true, opacity, depthWrite: false }));
  };
  const particles = (geometry, count) => {
    const sample = makeSampler(geometry), tmp = new THREE.Vector3(), out = [];
    for (let i = 0; i < count; i++) { sample(tmp); out.push(tmp.x, tmp.y, tmp.z); }
    return dots(out, 0.022);
  };
  const frame = (w, h, opacity = 0.4) => new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(w + 0.08, h + 0.08)),
    new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity }));
  const placeholder = (label, w = 512, h = 640) => textTexture((g) => {
    g.fillStyle = '#1B2430'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2400; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    g.fillStyle = 'rgba(220,230,242,.55)'; g.font = `500 ${Math.round(w / 15)}px ${theme.bodyFont}`;
    g.fillText(`[ ${label} ]`, w * 0.07, h * 0.92);
  }, w, h);

  // Space dust.
  {
    const pos = [];
    for (let i = 0; i < 2600; i++) pos.push((Math.random() - 0.5) * 90, (Math.random() - 0.3) * 50, 25 - Math.random() * 130);
    scene.add(dots(pos, 0.05, 0.4));
  }

  // Wren stand-in and floor.
  const wren = new THREE.Group();
  [
    [new THREE.SphereGeometry(0.42, 32, 24), [0, 2.55, 0]],
    [new THREE.CapsuleGeometry(0.46, 0.9, 8, 24), [0, 1.55, 0]],
    [new THREE.CapsuleGeometry(0.14, 0.75, 6, 12), [-0.62, 1.55, 0], 0.18],
    [new THREE.CapsuleGeometry(0.14, 0.75, 6, 12), [0.62, 1.6, 0.1], -0.9],
    [new THREE.CapsuleGeometry(0.17, 0.75, 6, 12), [-0.22, 0.5, 0]],
    [new THREE.CapsuleGeometry(0.17, 0.75, 6, 12), [0.22, 0.5, 0]],
  ].forEach(([geo, at, rz = 0]) => { const o = particles(geo, 1400); o.position.set(...at); o.rotation.z = rz; wren.add(o); });
  scene.add(wren);
  const floor = particles(new THREE.CircleGeometry(6, 64), 5000); floor.rotation.x = -Math.PI / 2; scene.add(floor);

  // Rex's name as a particle sign; the camera flies through it and it scatters.
  const name = (() => {
    const W = 2048, H = 360;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `400 250px ${theme.displayFont}`; g.fillText('REX CHAO', W / 2, H / 2);
    const data = g.getImageData(0, 0, W, H).data, base = [], dir = [];
    const width = 13, scale = width / W;
    for (let y = 0; y < H; y += 3) for (let x = 0; x < W; x += 3) {
      if (data[(y * W + x) * 4 + 3] > 128) {
        base.push((x - W / 2) * scale, -(y - H / 2) * scale, (Math.random() - 0.5) * 0.15);
        const d = new THREE.Vector3((x - W / 2) * scale, -(y - H / 2) * scale, 0).normalize().multiplyScalar(0.6 + Math.random())
          .add(new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, 0.4 + Math.random() * 1.2));
        dir.push(d.x, d.y, d.z);
      }
    }
    const pts = dots(base.slice(), 0.03, 1);
    pts.position.set(0, 4.6, -12);
    pts.userData = { base: Float32Array.from(base), dir: Float32Array.from(dir), last: -1 };
    scene.add(pts);
    return pts;
  })();

  // The About ring: you stand in the middle and turn.
  const ringItems = ABOUT.map((it) => {
    const a = THREE.MathUtils.degToRad(it.deg), group = new THREE.Group();
    group.position.copy(RING).addScaledVector(ringDir(a), RING_R); group.position.y += it.dy;
    group.lookAt(RING.x, group.position.y, RING.z);
    const fade = [];
    if (it.kind === 'photo') {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(it.w, it.h), new THREE.MeshBasicMaterial({ map: placeholder(it.label), transparent: true }));
      group.add(m, frame(it.w, it.h)); fade.push(m.material);
    } else if (it.kind === 'pets') {
      ['Rusty', 'Petey', 'Jasper'].forEach((n, i) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.45), new THREE.MeshBasicMaterial({ map: placeholder(n), transparent: true }));
        m.position.set((i - 1) * 1.3, i === 1 ? 0.25 : -0.1, 0); m.rotation.z = (i - 1) * -0.05;
        group.add(m); fade.push(m.material);
      });
    } else if (it.kind === 'records') {
      const tex = textTexture((g, w) => {
        const r = w / 2; g.fillStyle = '#0c0c0e'; g.beginPath(); g.arc(r, r, r, 0, Math.PI * 2); g.fill();
        for (let k = r * 0.38; k < r * 0.98; k += 3) { g.strokeStyle = `rgba(255,255,255,${0.04 + Math.random() * 0.05})`; g.beginPath(); g.arc(r, r, k, 0, Math.PI * 2); g.stroke(); }
        g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3; g.beginPath(); g.arc(r, r, r - 2, 0, Math.PI * 2); g.stroke();
        g.fillStyle = theme.accent; g.beginPath(); g.arc(r, r, r * 0.34, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#0c0c0e'; g.beginPath(); g.arc(r, r, r * 0.04, 0, Math.PI * 2); g.fill();
      }, 512, 512);
      [[-0.75, 0.3, 0.62], [0.55, -0.1, 0.8], [-0.05, -0.75, 0.5]].forEach(([x, y, r], i) => {
        const m = new THREE.Mesh(new THREE.CircleGeometry(r, 64), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
        m.position.set(x, y, i * 0.02); m.userData.spin = 0.9 + i * 0.35; group.add(m); fade.push(m.material);
      });
    } else if (it.kind === 'map') {
      const pts = [], sx = 1.5 / 180, sy = 0.82 / 90;
      for (let lon = -180; lon <= 180; lon += 4) for (let lat = -60; lat <= 80; lat += 4)
        if (LAND.some(([x, y, rx, ry]) => ((lon - x) / rx) ** 2 + ((lat - y) / ry) ** 2 < 1)) pts.push(lon * sx, lat * sy, 0);
      const land = dots(pts, 0.035, 0.6); group.add(land); fade.push(land.material);
      const hx = HOME[0] * sx, hy = HOME[1] * sy;
      it.routes = PLACES.map(([lon, lat]) => {
        const x = lon * sx, y = lat * sy;
        const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(hx, hy, 0), new THREE.Vector3((hx + x) / 2, (hy + y) / 2 + 0.35, 0.3), new THREE.Vector3(x, y, 0));
        const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)); g.setDrawRange(0, 0);
        const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: accent, transparent: true })); group.add(line); fade.push(line.material);
        return g;
      });
      const home = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), new THREE.MeshBasicMaterial({ color: ink, transparent: true }));
      home.position.set(hx, hy, 0.01); group.add(home); fade.push(home.material);
    }
    scene.add(group);
    return { ...it, angle: a, group, fade, baseY: group.position.y };
  });

  // Tooey: the prep sheet it sends every night.
  const prep = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 2.95), new THREE.MeshBasicMaterial({
    map: textTexture((g, w, h) => {
      g.fillStyle = '#F2F2EE'; g.fillRect(0, 0, w, h); g.fillStyle = '#16171A';
      g.font = `600 40px ${theme.bodyFont}`; g.fillText('Prep, Tuesday', 48, 90); g.fillRect(48, 112, w - 96, 3);
      g.font = `400 30px ${theme.bodyFont}`;
      [['Cheeseburger', 45], ['Chicken sandwich', 33], ['Caesar salad', 26], ['House pasta', 20]].forEach(([n, q], i) => {
        const y = 190 + i * 78; g.fillStyle = '#16171A'; g.fillText(n, 48, y);
        g.textAlign = 'right'; g.fillText(String(q), w - 48, y); g.textAlign = 'left';
        g.fillStyle = '#C9C9C2'; g.fillRect(48, y + 26, w - 96, 1);
      });
    }, 512, 560),
  }));
  prep.position.set(1.7, 2.1, -56); prep.rotation.set(-0.06, -0.18, -0.04); scene.add(prep);
  const consoleShot = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 3.9 / 1.6), new THREE.MeshBasicMaterial({ map: loader.load('assets/tooey.jpg', (t) => { t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; }) }));
  consoleShot.position.set(-1.6, 2.3, -57.5); consoleShot.rotation.y = 0.2; consoleShot.add(frame(3.9, 3.9 / 1.6, 0.3)); scene.add(consoleShot);

  // Builds: a horizontal row the camera slides along.
  let x = 0;
  const builds = BUILDS.map((b, i) => {
    const h = b.aspect < 1 ? ROW_H * 1.25 : ROW_H, w = h * b.aspect;
    const map = b.img ? loader.load(b.img, (t) => { t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; }) : placeholder(`${b.name} screenshot`, 300, 650);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: true }));
    const group = new THREE.Group(); group.add(mesh, frame(w, h, 0.35));
    x += (i ? ROW_GAP : 0) + w / 2; group.position.set(x, ROW_Y + (i % 2 ? 0.15 : -0.15), ROW_Z); x += w / 2;
    scene.add(group);
    return { ...b, w, h, mesh, group, hover: 0 };
  });
  const rowStart = builds[0].group.position.x, rowEnd = builds[builds.length - 1].group.position.x;

  // Camera path. Before the ring, through it, and after it.
  const ringLook = (a) => RING.clone().addScaledVector(ringDir(a), 8);
  const pre = [
    [0.00, [0, 2.0, 8.5], [0, 2.7, 0]],
    [0.11, [0, 3.6, -3], [0, 4.4, -12]],
    [0.19, [0, 3.9, -16], [0, 2.8, -28]],
    [RING_START, RING.toArray(), ringLook(0).toArray()],
  ];
  const post = [
    [RING_END, RING.toArray(), ringLook(RING_SWEEP).toArray()],
    [0.58, [0, 2.2, -47.5], [0, 2.1, -56]],
    [0.65, [rowStart, 2.3, -67.5], [rowStart, 2.2, ROW_Z]],
    [0.84, [rowEnd, 2.3, -67.5], [rowEnd, 2.2, ROW_Z], true],
    [0.91, [rowEnd - 2, 3, -63], [rowEnd - 2, 12, -66]],
    [1.00, [rowEnd - 2, 6.5, -52], [rowEnd - 2, 1.6, ROW_Z]],
  ];
  const along = (keys, p) => {
    let i = 0; while (i < keys.length - 2 && p > keys[i + 1][0]) i++;
    const [p0, a0, l0] = keys[i], [p1, a1, l1, linear] = keys[i + 1];
    const raw = clamp01((p - p0) / (p1 - p0)), t = linear ? raw : smooth(raw);
    return { pos: new THREE.Vector3(...a0).lerp(new THREE.Vector3(...a1), t), look: new THREE.Vector3(...l0).lerp(new THREE.Vector3(...l1), t) };
  };
  const ringAngle = (p) => RING_SWEEP * smooth(clamp01((p - RING_START) / (RING_END - RING_START)));
  const cameraAt = (p) => {
    if (p < RING_START) return along(pre, p);
    if (p <= RING_END) return { pos: RING.clone(), look: ringLook(ringAngle(p)) };
    return along(post, p);
  };

  // Hover on builds. Touch screens show the build closest to the middle instead.
  const pointer = new THREE.Vector2(9, 9), ray = new THREE.Raycaster();
  const canHover = matchMedia('(hover: hover)').matches;
  addEventListener('pointermove', (e) => { pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); });
  const blurb = document.getElementById('blurb'), blurbName = blurb.querySelector('b'), blurbText = blurb.querySelector('span');

  const overlays = [...document.querySelectorAll('[data-in]')].map((el) => ({ el, a: +el.dataset.in, b: +el.dataset.out }));
  const caption = document.getElementById('caption');

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight;
    camera.fov = innerWidth < 700 ? 62 : 45; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  const forced = new URLSearchParams(location.search).get('p');
  const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
  let cur = forced !== null ? +forced : 0;
  const clock = new THREE.Clock(), tmp = new THREE.Vector3();

  function tick() {
    const t = clock.getElapsedTime();
    const target = forced !== null ? +forced : scrollY / Math.max(1, maxScroll());
    cur += (target - cur) * (forced !== null ? 1 : 0.09);
    const p = cur;
    const { pos, look } = cameraAt(p);
    camera.position.copy(pos); camera.lookAt(look);

    wren.rotation.y = Math.sin(t * 0.4) * 0.25; wren.position.y = Math.sin(t * 1.3) * 0.04;
    wren.children[3].rotation.z = -0.9 + Math.sin(t * 2.2) * 0.35;

    // Name scatter.
    const burst = smooth(clamp01((p - 0.12) / 0.08));
    if (Math.abs(burst - name.userData.last) > 0.0005) {
      const { base, dir } = name.userData, arr = name.geometry.attributes.position.array, k = burst * 7;
      for (let i = 0; i < arr.length; i++) arr[i] = base[i] + dir[i] * k;
      name.geometry.attributes.position.needsUpdate = true; name.material.opacity = 1 - burst * 0.85; name.userData.last = burst;
    }

    // Ring focus: the item you face is bright and gets its caption.
    const inRing = p > RING_START - 0.02 && p < RING_END + 0.03, facing = ringAngle(p);
    let best = null, bestD = Infinity;
    for (const it of ringItems) {
      const d = Math.abs(it.angle - facing); if (d < bestD) { bestD = d; best = it; }
      const f = inRing ? 1 - smooth(clamp01(d / 0.55)) : 0.6;
      it.fade.forEach((m) => { m.opacity = 0.22 + 0.78 * f; });
      it.group.position.y = it.baseY + Math.sin(t * 0.6 + it.angle * 3) * 0.07;
      if (it.kind === 'records') it.group.children.forEach((c) => { c.rotation.z = -t * c.userData.spin; });
      if (it.kind === 'map') {
        const k = clamp01(1 - d / 0.5);
        it.routes.forEach((g, i) => g.setDrawRange(0, Math.floor(clamp01(k * 1.8 - i * 0.12) * 61)));
      }
    }
    const cap = inRing && bestD < 0.3 ? best.caption : '';
    if (caption.textContent !== cap) caption.textContent = cap;
    caption.style.opacity = cap ? 1 : 0;

    prep.position.y = 2.1 + Math.sin(t * 0.8) * 0.07;

    // Builds hover.
    let hovered = null;
    const inRow = p > 0.62 && p < 0.9;
    if (inRow) {
      if (canHover) {
        ray.setFromCamera(pointer, camera);
        const hit = ray.intersectObjects(builds.map((b) => b.mesh))[0];
        hovered = hit ? builds.find((b) => b.mesh === hit.object) : null;
      } else {
        hovered = builds.reduce((a, b) => (Math.abs(b.group.position.x - camera.position.x) < Math.abs(a.group.position.x - camera.position.x) ? b : a));
      }
    }
    canvas.style.cursor = hovered && canHover ? 'pointer' : '';
    for (const b of builds) {
      b.hover += ((b === hovered ? 1 : 0) - b.hover) * 0.15;
      b.group.scale.setScalar(1 + b.hover * 0.12);
      b.group.position.z = ROW_Z + b.hover * 0.6;
      b.mesh.material.opacity = hovered && b !== hovered ? 0.45 : 1;
    }
    if (hovered) {
      tmp.copy(hovered.group.position); tmp.y -= (hovered.h * 1.12) / 2 + 0.15; tmp.project(camera);
      blurb.style.left = `${Math.min(innerWidth - 16 - blurb.offsetWidth, Math.max(16, (tmp.x + 1) / 2 * innerWidth - blurb.offsetWidth / 2))}px`;
      blurb.style.top = `${Math.min(innerHeight - blurb.offsetHeight - 16, (1 - tmp.y) / 2 * innerHeight + 8)}px`;
      if (blurbName.textContent !== hovered.name) { blurbName.textContent = hovered.name; blurbText.textContent = hovered.about; }
    }
    blurb.style.opacity = hovered ? 1 : 0;

    for (const { el, a, b } of overlays) {
      const o = Math.min(smooth(clamp01((p - a) / 0.025)), smooth(clamp01((b - p) / 0.025)));
      el.style.opacity = o; el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
  document.body.classList.add('ready');
}
