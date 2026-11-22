// The personal site's home: a Popfold tower, one floor per skill set, with the integration pipeline running
// down its spine. What is in it, where, and the story are data: home.json (the studio edits it). This file says
// how each kind of piece is built (screens, labels and stand-ins drawn in code, models from public/models), and
// draws the data flowing between them. Words on screens and signs live in TEXT; the cards in stories.ts.
import * as THREE from 'three';
import { homeFromFile, pageLang, rbox, t, toy, type FloorContext, type PieceKind, type PieceSpec } from 'popfold';
import json from './home.json';
import { STORIES } from './stories';

export const NEON = { pink: '#FF4FD8', cyan: '#3EE6FF', lime: '#B8FF5C', amber: '#FFB547', violet: '#9B7BFF', red: '#FF5A6E' };
// the words drawn on screens and signs go through t(): on the Bulgarian and German pages, their translation file
// (src/i18n/). Bricolage Grotesque has no Cyrillic, so the Bulgarian page draws in Rubik (style.css does the same).
const DISPLAY = pageLang() === 'bg' ? '"Rubik Variable", "Arial Black", sans-serif' : '"Bricolage Grotesque Variable", "Arial Black", sans-serif';
const MONO = '"JetBrains Mono", "Cascadia Code", Consolas, monospace';

export const TEXT = {
  /** the top floor's screens, newest first (two title lines + a one-line proof point); add one and a screen appears */
  projects: [
    { title: ['CheriBase for a', 'prosthetics clinic'], proof: 'Kotlin · React · legacy parity', color: NEON.violet },
    { title: ['Remedy ↔ ServiceNow', 're-platform'], proof: '8 days · 320 tests', color: NEON.pink },
    { title: ['Explainable', 'risk scoring'], proof: '7-component model', color: NEON.cyan },
    { title: ['Local ServiceNow', 'emulator'], proof: 'Kotlin · Rhino · IRE', color: NEON.lime },
    { title: ['AI engineering', 'handbook'], proof: 'prompt → review → evidence', color: NEON.amber },
  ],
  timeline: [
    ['2020 – now', 'Senior Cyber Security & Integration Specialist'],
    ['2016 – 2020', 'Senior Automation & Integration Specialist'],
    ['2010 – 2016', 'Senior Systems Analyst, Datacenter Ops'],
    ['2009', 'Operating Systems Support'],
  ],
  tech: ['ServiceNow', 'Defender', 'Sentinel', 'Splunk', 'Azure', 'Azure DevOps', 'Microsoft 365', 'Cloudflare'],
  sources: ['REMEDY', 'DEFENDER', 'SPLUNK'],
};

// ---------- small helpers ----------
const dark = (c = '#191830') => toy(c, { roughness: 0.55, clearcoat: 0.2 });
const glow = (c: string, k = 1.4) => new THREE.MeshStandardMaterial({ color: '#0B0B14', emissive: c, emissiveIntensity: k });

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** a glowing screen (w × h) showing a drawing; the screen faces +z */
function screen(w: number, h: number, draw: (g: CanvasRenderingContext2D, W: number, H: number) => void, px = 512) {
  const g = new THREE.Group();
  const frame = rbox(w + 0.06, h + 0.06, 0.05, 0.02, dark('#0E0D1C'));
  const ph = Math.round(px * (h / w));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: canvasTex(px, ph, (c) => draw(c, px, ph)), toneMapped: false }));
  face.position.z = 0.027;
  g.add(frame, face);
  return g;
}

/** a small neon label plate */
function label(text: string, color: string, w = 0.8) {
  const words = t(text);
  const tex = canvasTex(512, 128, (g) => {
    g.fillStyle = '#0B0A18'; g.fillRect(0, 0, 512, 128);
    g.strokeStyle = color; g.lineWidth = 6; g.strokeRect(6, 6, 500, 116);
    let px = 58; // shrink a long translation to fit the plate
    g.font = `800 ${px}px ${DISPLAY}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    while (px > 20 && g.measureText(words).width > 470) g.font = `800 ${(px -= 2)}px ${DISPLAY}`;
    g.shadowColor = color; g.shadowBlur = 18; g.fillStyle = color; g.fillText(words, 256, 66);
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
}

const bg = (g: CanvasRenderingContext2D, W: number, H: number, c = '#0D0B22') => { g.fillStyle = c; g.fillRect(0, 0, W, H); };
/** draw a line of text, shrinking it to fit maxW when given */
const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, color: string, font = DISPLAY, weight = 800, maxW = 0) => {
  s = t(s);
  let px = size;
  g.font = `${weight} ${px}px ${font}`;
  while (maxW && px > 10 && g.measureText(s).width > maxW) g.font = `${weight} ${(px -= 2)}px ${font}`;
  g.fillStyle = color; g.textBaseline = 'middle'; g.fillText(s, x, y);
};

/** a server rack with blinking-looking LEDs */
function rack(color: string, h = 1.6) {
  const g = new THREE.Group();
  const body = rbox(0.6, h, 0.6, 0.03, dark('#1E1D33'));
  body.position.y = h / 2;
  g.add(body);
  for (let i = 0; i < 7; i++) {
    const u = rbox(0.52, 0.12, 0.02, 0.01, dark('#2B2A47'));
    u.position.set(0, 0.2 + i * (h - 0.3) / 7, 0.31);
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.01), glow(i % 3 ? color : NEON.lime, 2));
    led.position.set(0.2, u.position.y, 0.33);
    g.add(u, led);
  }
  return g;
}

/** a desk with two monitors */
function deskWithScreens(draw: (g: CanvasRenderingContext2D, W: number, H: number) => void) {
  const g = new THREE.Group();
  const top = rbox(1.7, 0.06, 0.7, 0.02, dark('#2A2840'));
  top.position.y = 0.75;
  g.add(top);
  for (const x of [-0.78, 0.78]) { const l = rbox(0.05, 0.75, 0.6, 0.01, dark('#121120')); l.position.set(x, 0.375, 0); g.add(l); }
  for (const x of [-0.42, 0.42]) { const s = screen(0.75, 0.45, draw); s.position.set(x, 1.15, -0.15); s.rotation.y = -x * 0.35; g.add(s); }
  const chair = rbox(0.5, 0.1, 0.5, 0.05, dark('#3A2F5A'));
  chair.position.set(0, 0.48, 0.65);
  const back = rbox(0.5, 0.55, 0.08, 0.05, dark('#3A2F5A'));
  back.position.set(0, 0.8, 0.88);
  g.add(chair, back);
  return g;
}

/** put a drawing on every mesh of a model that uses the given material (e.g. a console's blank screens) */
function paint(obj: THREE.Object3D, materialName: string, draw: (g: CanvasRenderingContext2D, W: number, H: number) => void, w = 512, h = 300) {
  const t = canvasTex(w, h, (g) => draw(g, w, h));
  t.flipY = false; // glTF UVs
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || (m.material as THREE.Material).name !== materialName) return;
    m.material = new THREE.MeshBasicMaterial({ map: t, toneMapped: false });
  });
  return obj;
}

// ---------- drawings for screens ----------
const drawProject = (n: number) => (g: CanvasRenderingContext2D, W: number, H: number) => {
  const p = TEXT.projects[n];
  bg(g, W, H);
  g.strokeStyle = p.color; g.lineWidth = 6; g.strokeRect(12, 12, W - 24, H - 24);
  text(g, `0${n + 1}`, 36, H * 0.19, 30, p.color, MONO, 700);
  p.title.forEach((t, i) => text(g, t, 36, H * (0.42 + i * 0.17), 48, '#FFFFFF', DISPLAY, 800, W - 72));
  text(g, p.proof, 36, H * 0.82, 26, p.color, MONO, 600, W - 72);
};
const drawCode = (g: CanvasRenderingContext2D, W: number, H: number) => {
  bg(g, W, H, '#0A0A16');
  const lines = ['GET /api/now/table/cmdb_ci', '  → enrich(asset, owner)', 'POST /sn_si/incident', '  risk = model.score(ci)', 'flow.run("usem_sync")'];
  lines.forEach((l, i) => text(g, l, 24, 40 + i * 52, 30, i % 2 ? NEON.lime : NEON.cyan, MONO, 600));
};
const drawMap = (g: CanvasRenderingContext2D, W: number, H: number) => {
  bg(g, W, H, '#080A18');
  g.fillStyle = '#1B2245';
  for (let i = 0; i < 260; i++) { const x = (i * 97) % W, y = (i * 53) % H; if ((x * y) % 7 < 4) g.fillRect(x, y, 6, 6); }
  [[0.2, 0.35], [0.48, 0.3], [0.72, 0.45], [0.6, 0.7], [0.3, 0.62]].forEach(([x, y], i) => {
    g.fillStyle = i % 2 ? NEON.red : NEON.amber; g.shadowColor = g.fillStyle; g.shadowBlur = 24;
    g.beginPath(); g.arc(x * W, y * H, 10, 0, Math.PI * 2); g.fill();
  });
  g.shadowBlur = 0; g.strokeStyle = 'rgba(255,90,110,.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0.2 * W, 0.35 * H); g.quadraticCurveTo(0.5 * W, 0.05 * H, 0.72 * W, 0.45 * H); g.stroke();
  text(g, 'THREAT INTEL · LIVE', 24, 36, 30, NEON.red, MONO, 700);
};
const drawQueue = (g: CanvasRenderingContext2D, W: number, H: number) => {
  bg(g, W, H);
  text(g, 'SIR QUEUE', 24, 36, 32, NEON.cyan, MONO, 700);
  [['P1', 'Phishing → contained', NEON.red], ['P2', 'Vuln on crown jewel', NEON.amber], ['P3', 'Anomalous sign-in', NEON.cyan], ['P3', 'Enriched via CMDB', NEON.lime]].forEach(([p, t, c], i) => {
    g.fillStyle = '#1A1838'; g.fillRect(20, 70 + i * 62, W - 40, 50);
    text(g, p as string, 34, 95 + i * 62, 28, c as string, MONO, 700); text(g, t as string, 100, 95 + i * 62, 26, '#D8D4FF', MONO, 500);
  });
};
const drawBlueprint = (g: CanvasRenderingContext2D, W: number, H: number) => {
  bg(g, W, H, '#0B2A5A');
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1;
  for (let x = 0; x < W; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y < H; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 4;
  [[0.1, 0.2], [0.42, 0.2], [0.74, 0.2], [0.26, 0.6], [0.58, 0.6]].forEach(([x, y]) => g.strokeRect(x * W, y * H, W * 0.18, H * 0.2));
  g.beginPath(); g.moveTo(0.28 * W, 0.3 * H); g.lineTo(0.42 * W, 0.3 * H); g.moveTo(0.6 * W, 0.3 * H); g.lineTo(0.74 * W, 0.3 * H);
  g.moveTo(0.19 * W, 0.4 * H); g.lineTo(0.35 * W, 0.6 * H); g.moveTo(0.83 * W, 0.4 * H); g.lineTo(0.67 * W, 0.6 * H); g.stroke();
};
const drawTimeline = (g: CanvasRenderingContext2D, W: number, H: number) => {
  bg(g, W, H, '#0C0B1E');
  g.strokeStyle = NEON.violet; g.lineWidth = 6; g.beginPath(); g.moveTo(60, 40); g.lineTo(60, H - 40); g.stroke();
  TEXT.timeline.forEach(([when, what], i) => {
    const y = 80 + i * (H - 120) / Math.max(1, TEXT.timeline.length - 1);
    g.fillStyle = NEON.violet; g.beginPath(); g.arc(60, y, 12, 0, Math.PI * 2); g.fill();
    text(g, when, 90, y - 18, 26, NEON.cyan, MONO, 700); text(g, what, 90, y + 16, 34, '#FFFFFF', DISPLAY, 700, W - 120);
  });
};

// ---------- kinds: how each piece in home.json is built ----------
// A piece's place (at, lift, turn) and its delay are in home.json; `opts` picks what a builder draws.
/** these kinds only ever sit on a tower's floors */
const onFloor = (ctx: Parameters<PieceKind>[1]) => ctx as FloorContext;
const neon = (c: unknown) => NEON[c as keyof typeof NEON] ?? String(c);
const n = (s: PieceSpec) => Number(s.opts?.n ?? 0);
/** the project screens' spacing: they share the floor's width */
const projectGap = () => Math.min(1.45, 5.4 / TEXT.projects.length);

const kinds: Record<string, PieceKind> = {
  'project-screen': (s) => {
    const gap = projectGap();
    const stand = new THREE.Group();
    const pole = rbox(0.08, 0.9, 0.08, 0.02, dark('#121120')); pole.position.y = 0.45;
    const sc = screen(gap - 0.15, (gap - 0.15) * 0.62, drawProject(n(s)));
    sc.position.y = 1.25;
    stand.add(pole, sc);
    return stand;
  },
  'cmdb-rack': (s, ctx) => {
    const i = n(s);
    return onFloor(ctx).gen('server-rack', 1.55 + i * 0.08, { tint: { led_: [NEON.amber, NEON.cyan, NEON.lime][i] } }) ?? rack(NEON.amber, 1.5 + i * 0.1);
  },
  label: (s) => label(String(s.opts?.text ?? ''), neon(s.opts?.color), Number(s.opts?.width ?? 0.8)),
  'source-label': (s) => label(TEXT.sources[n(s)] ?? '', NEON.amber, 0.58),
  'mid-server': (_s, ctx) => {
    const plinth = rbox(0.8, 0.42, 0.6, 0.04, dark('#22213B')); plinth.position.y = 0.21;
    const g = new THREE.Group(); g.add(plinth);
    const appliance = onFloor(ctx).gen('appliance', 0.78);
    if (appliance) { appliance.position.y = 0.42; g.add(appliance); }
    const lbl = label('MID', NEON.cyan, 0.6); lbl.position.set(0, 0.78, 0.2); g.add(lbl);
    return g;
  },
  hub: () => {
    const hub = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 12, 48), glow(NEON.cyan, 2));
    ring.position.y = 1.2;
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), glow(NEON.violet, 1.6));
    core.position.y = 1.2;
    core.userData.spin = 0.6;
    const base = rbox(0.9, 0.6, 0.9, 0.06, dark('#24223D')); base.position.y = 0.3;
    const lbl = label('SIR · VR · USEM', NEON.cyan, 1.3); lbl.position.set(0, 2.0, 0);
    hub.add(base, ring, core, lbl);
    return hub;
  },
  'risk-gauge': () => screen(0.9, 0.6, (g, W, H) => {
    bg(g, W, H); text(g, 'RISK', 24, 40, 34, NEON.pink, MONO, 700);
    g.strokeStyle = '#2A2850'; g.lineWidth = 26; g.beginPath(); g.arc(W / 2, H * 0.78, H * 0.45, Math.PI, 0); g.stroke();
    g.strokeStyle = NEON.pink; g.beginPath(); g.arc(W / 2, H * 0.78, H * 0.45, Math.PI, Math.PI * 1.72); g.stroke();
    text(g, '72', W / 2 - 34, H * 0.7, 64, '#FFFFFF');
  }),
  'code-screen': () => screen(1.1, 0.62, drawCode),
  'threat-map': () => screen(1.5, 0.75, drawMap, 640),
  'soc-desk': (_s, ctx) => {
    const console = onFloor(ctx).gen('soc-console', 2.3);
    return console ? paint(console, 'screen_blank', drawQueue) : deskWithScreens(drawQueue);
  },
  'queue-screen': () => screen(0.85, 1.0, drawQueue),
  shield: () => {
    const shield = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), glow(NEON.red, 1.8));
    shield.userData.spin = 0.8;
    return shield;
  },
  'lab-bench': () => {
    const bench = rbox(2.6, 0.08, 0.8, 0.03, dark('#262540')); bench.position.y = 0.85;
    const g = new THREE.Group(); g.add(bench);
    for (const x of [-1.2, 1.2]) { const l = rbox(0.06, 0.85, 0.7, 0.01, dark('#121120')); l.position.set(x, 0.425, 0); g.add(l); }
    return g;
  },
  brain: () => {
    const brain = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 2), new THREE.MeshStandardMaterial({ color: '#0B0B14', emissive: NEON.lime, emissiveIntensity: 1.2, wireframe: true }));
    brain.userData.spin = 0.4;
    return brain;
  },
  agent: (s) => new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), glow([NEON.cyan, NEON.pink, NEON.violet][n(s)] ?? NEON.cyan, 1.8)),
  'prompt-screen': () => screen(1.1, 0.6, (g, W, H) => { bg(g, W, H); text(g, '> prompt', 24, 50, 34, NEON.lime, MONO, 700); text(g, '  → human review → PR', 24, 110, 28, '#D8D4FF', MONO, 500); text(g, '  ✓ 320 unit tests', 24, 165, 28, NEON.cyan, MONO, 600); text(g, '> evidence: DEV + ATF', 24, 225, 30, NEON.lime, MONO, 700); }),
  'drafting-table': (_s, ctx) => {
    const model = onFloor(ctx).gen('drafting-table', 1.55);
    if (model) return model;
    const table = new THREE.Group();
    const top = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshBasicMaterial({ map: canvasTex(512, 320, (g) => drawBlueprint(g, 512, 320)), toneMapped: false }));
    top.rotation.x = -Math.PI / 2 + 0.35; top.position.y = 0.95;
    const legs = rbox(1.4, 0.9, 0.7, 0.03, dark('#1C1B30')); legs.position.y = 0.45;
    table.add(legs, top);
    return table;
  },
  'blueprint-board': () => screen(1.6, 1.0, drawBlueprint, 640),
  // Popfold: this site's own engine, shown as a little tower on a screen
  'popfold-screen': () => screen(0.8, 1.0, (g, W, H) => {
    bg(g, W, H, '#0C0A1E');
    const cols = [NEON.pink, NEON.cyan, NEON.red, NEON.lime, NEON.violet, NEON.amber];
    cols.forEach((c, i) => { g.strokeStyle = c; g.lineWidth = 5; g.shadowColor = c; g.shadowBlur = 12; g.strokeRect(W * 0.18, H * (0.1 + i * 0.12), W * 0.5, H * 0.1); });
    g.shadowBlur = 0; g.fillStyle = NEON.cyan; g.fillRect(W * 0.74, H * 0.08, 6, H * 0.74);
    text(g, 'POPFOLD', W * 0.14, H * 0.9, 44, '#FFFFFF');
  }, 400),
  swatch: (s) => new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.32), new THREE.MeshBasicMaterial({ color: [NEON.pink, NEON.cyan, NEON.lime, NEON.amber, NEON.violet][n(s)] ?? NEON.pink, toneMapped: false })),
  timeline: () => screen(2.0, 1.1, drawTimeline, 768),
  // the tech power board: one lit switch per technology
  'tech-board': () => {
    const board = new THREE.Group();
    const panel = rbox(1.5, 1.5, 0.08, 0.04, dark('#1A1930')); panel.position.y = 1.25;
    board.add(panel);
    TEXT.tech.forEach((t, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const sw = label(t, [NEON.cyan, NEON.amber, NEON.lime, NEON.pink][i % 4], 0.66);
      sw.position.set(-0.36 + col * 0.72, 1.8 - row * 0.3, 0.05);
      board.add(sw);
    });
    return board;
  },
  cv: () => {
    const cv = rbox(0.5, 0.65, 0.04, 0.02, glow(NEON.amber, 0.8));
    cv.position.set(0.2, 0.9, 0.6); cv.rotation.x = -0.4;
    const stand = rbox(0.6, 0.8, 0.4, 0.04, dark('#24223D')); stand.position.set(0.2, 0.4, 0.6);
    const g = new THREE.Group(); g.add(stand, cv);
    return g;
  },
};

// ---------- the data flowing between the pieces: pipes a list cannot say ----------
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** the plug on every cable (home.json, tower.cables.size) and a wall jack, about six times life size, so a plug is wider than its cable */
const PLUG = 0.24, JACK = 0.27;
const AMBER = new THREE.Color(NEON.amber), GREEN = new THREE.Color(NEON.lime);

/** a jack's status light (its led_status material, made its own): amber, green while a cable is plugged in */
function statusLight(jack: THREE.Object3D) {
  let led: THREE.MeshStandardMaterial | undefined;
  jack.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || led) return;
    const mat = m.material as THREE.MeshStandardMaterial;
    if (mat.name !== 'led_status') return;
    led = mat.clone();
    m.material = led;
  });
  led?.emissive.copy(AMBER);
  return (plugged: boolean) => { led?.emissive.copy(plugged ? GREEN : AMBER); };
}
const build: Record<string, (f: FloorContext) => void> = {
  integrations(f) {
    // racks → MID → hub → risk model, plugged in that order as the floor opens (the spine's branch first); the
    // three sources ripple in together
    [[-2.5, 1.2], [-1.85, 1.3], [-1.2, 1.4]].forEach(([x, y], i) =>
      f.flow([V(x, y, -0.95), V(x + 0.3, 0.7, -0.2), V(-0.2, 0.55, 0.2)], { packets: 3, speed: 0.3, step: 1 + i * 0.3 }));
    f.flow([V(-0.2, 0.55, 0.2), V(0.6, 0.9, 0.1), V(1.4, 1.2, -0.9)], { packets: 4, speed: 0.3, color: NEON.violet, step: 2 });
    f.flow([V(1.4, 1.2, -0.9), V(2.0, 1.3, -0.1), V(2.3, 1.4, 0.55)], { packets: 3, speed: 0.3, color: NEON.pink, step: 3 });
    // the spine's branch plugs into a wall jack on the front of the hub's base; its light goes green when it does
    const jack = f.gen('rj45-jack', JACK);
    if (jack) {
      f.place(jack, 1.62, 0.32, -0.45 + 0.006); // its back against the base's front face
      f.pop(jack, 'hub-port', 0.3); // just before the cables, with the hub
      f.port(V(1.62, 0.32, -0.45 + JACK * 0.244 + PLUG - JACK * 0.12), statusLight(jack)); // the plug sits in the port
    } else f.port(V(1.9, 0.6, -0.4));
  },
  ai(f) {
    // the agents, wired to the model
    for (const p of [V(1.5, 1.2, 0.1), V(2.1, 0.8, -0.7), V(1.2, 0.5, -0.3)]) {
      f.flow([V(-0.6, 1.5, -1.2), p.clone().lerp(V(-0.6, 1.5, -1.2), 0.5).add(V(0, 0.4, 0)), p], { packets: 2, speed: 0.4, color: NEON.lime });
    }
  },
};

// The home and its story come from home.json (checked: a mistake in the file is reported in words). The stories
// stay in stories.ts, with the notes on what may be named. The floors' neon signs are drawn by Popfold from their
// labels, so those are translated here (the studio, in English, saves the file as it is).
const signs = { ...json, floors: json.floors.map((f) => ({ ...f, label: t(f.label) })) };
export const { recipe: PERSONAL, beats: BEATS } = homeFromFile(signs, {
  kinds,
  // GLBs in public/models/props (see CREDITS.md): Poly Pizza downloads normalised with Popfold's normalize_glb.py,
  // Blender-built tech (tools/build_tech_props.py) and Sweet Home 3D pieces (sh3d/, Popfold's sh3d_to_glb.py)
  props: ['server-rack', 'soc-console', 'appliance', 'rj45-plug', 'rj45-jack', 'animated-robot', 'office-chair', 'desk-chair', 'drafting-table', 'light-desk',
    'file-cabinet', 'wall-corkboard', 'satellite-dish', 'roof-antenna', 'sh3d/cctv', 'sh3d/laptop', 'sh3d/little-plant'],
  models: {
    'office-chair': { tint: { Chair: '#4A2F6A' } },
    'desk-chair': { tint: { carpet: '#3A2F5A' } },
    'animated-robot': { clip: 'Idle', fit: true },
  },
  stories: STORIES,
  tower: { build }, // the building's colours, pipe and lift are in home.json
});
