/* Illustrations uniques des œuvres : chaque carte compose une petite scène (186 × 74) à partir d'une bibliothèque de motifs.
   Style : aplats doux, trait brun, palette du thème. window.SCENES[id] renvoie le contenu SVG. */
(function () {
  const D = '#4a3524', WALL = '#f3ead7', GOLD = '#c9a227', RED = '#b3261e', SAF = '#e8902e', GRN = '#6f9a4a', WAT = '#7fb3c8', SKIN = '#e6b183', STONE = '#cfc3ad', WOOD = '#9a6a3c';
  const H = 74, G = 64; // hauteur, ligne du sol
  const f = n => +n.toFixed(1);
  const T = (x, y, s, c) => `<g transform="translate(${f(x)} ${f(y)})${s && s !== 1 ? ` scale(${s})` : ''}">${c}</g>`;
  const st = `stroke="${D}" stroke-width="1" stroke-linejoin="round"`;

  // ---- fonds ----
  const SKY = { P: '#f7e6c4', M: '#f3dcd2', S: '#dcecdf', C: '#dbe4f3', J: '#ebe5da', X: '#efe5d2', N: '#2c3550', D: '#f6d7a8' };
  const sky = k => `<rect width="186" height="${H}" fill="${SKY[k] || SKY.X}"/>`;
  const ground = (c = '#c9b58e') => `<rect x="0" y="${G}" width="186" height="${H - G}" fill="${c}"/>`;
  const grass = () => ground('#a9c27e');
  const hills = (c = GRN, o = .25) => `<path d="M0 ${G} Q30 ${G - 22} 62 ${G - 8} T124 ${G - 14} T186 ${G - 6} V${G} Z" fill="${c}" opacity="${o}"/>`;
  const mountains = (o = .3, snow = true) => `<path d="M0 ${G} L34 ${G - 30} L56 ${G - 16} L92 ${G - 46} L124 ${G - 18} L150 ${G - 32} L186 ${G - 10} V${G} Z" fill="#7a6a8a" opacity="${o}"/>${snow ? `<path d="M84 ${G - 38} L92 ${G - 46} L100 ${G - 38} L95 ${G - 40} L92 ${G - 36} L88 ${G - 40} Z" fill="#fff" opacity=".85"/>` : ''}`;
  const sun = (x = 150, y = 18, r = 9, c = '#f2b84b') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${r + 5}" fill="${c}" opacity=".25"/>`;
  const moon = (x = 150, y = 16) => `<circle cx="${x}" cy="${y}" r="7" fill="#f6efd8"/><circle cx="${x + 3}" cy="${y - 2}" r="6" fill="${SKY.N}"/>`;
  const stars = (n = 14, seed = 3) => Array.from({ length: n }, (_, i) => { const x = (i * 53 + seed * 17) % 180 + 3, y = (i * 29 + seed * 11) % 40 + 4; return `<circle cx="${x}" cy="${y}" r="${(i % 3) * .4 + .6}" fill="#fff8d8"/>`; }).join('');
  const clouds = (x = 30, y = 14) => `<path d="M${x} ${y} q4-6 10-2 q4-6 11 0 q6 0 5 5 h-29 q-2-4 3-3z" fill="#fff" opacity=".75"/>`;
  const river = (y = G - 2, c = WAT) => `<path d="M0 ${y} Q46 ${y - 6} 93 ${y} T186 ${y} V${H} H0 Z" fill="${c}"/><path d="M20 ${y + 4} h18 M80 ${y + 6} h22 M140 ${y + 3} h16" stroke="#fff" stroke-width="1.2" opacity=".7"/>`;
  const sea = () => `<rect x="0" y="${G - 14}" width="186" height="${H - G + 14}" fill="${WAT}"/><path d="M8 ${G - 6} q5-3 10 0 q5 3 10 0 M60 ${G} q5-3 10 0 q5 3 10 0 M120 ${G - 8} q5-3 10 0 q5 3 10 0" fill="none" stroke="#fff" stroke-width="1.2" opacity=".8"/>`;
  const terraces = (c = '#8fb36a') => [0, 1, 2, 3].map(i => `<path d="M0 ${G - i * 7} Q93 ${G - i * 7 - 6} 186 ${G - i * 7}" fill="none" stroke="${c}" stroke-width="4" opacity="${1 - i * .18}"/>`).join('');
  const field = () => `${ground('#b9cf8a')}${[20, 50, 80, 110, 140, 170].map(x => `<path d="M${x} ${G + 1} l-3 7 M${x + 6} ${G + 1} l-1 7" stroke="${GRN}" stroke-width="1.4"/>`).join('')}`;

  // ---- architecture ----
  const roof = (x, y, w, t, c) => `<path d="M${x - 7} ${y + 2} Q${x + w * .12} ${y} ${x + w * .2} ${y - t} L${x + w * .8} ${y - t} Q${x + w * .88} ${y} ${x + w + 7} ${y + 2} Q${x + w / 2} ${y - 3} ${x - 7} ${y + 2}Z" fill="${c}" ${st}/>`;
  const house = (x, w = 44, c = SAF, y = G) => `<rect x="${x}" y="${y - 20}" width="${w}" height="20" fill="${WALL}" ${st}/>${roof(x, y - 20, w, 11, c)}<rect x="${x + w / 2 - 5}" y="${y - 13}" width="10" height="13" fill="${D}"/>`;
  const pagoda = (x, n = 3, c = RED, s = 1) => { let o = '', y = G, ww = 46; for (let i = 0; i < n; i++) { const hh = 11 - i; o += `<rect x="${x - ww / 2 + 5}" y="${y - hh}" width="${ww - 10}" height="${hh}" fill="${WALL}" ${st}/>${roof(x - ww / 2, y - hh, ww, 5, c)}`; y -= hh + 5; ww -= 8; } return s === 1 ? o + `<path d="M${x} ${y + 2} v-9" stroke="${D}" stroke-width="1.6"/><circle cx="${x}" cy="${y - 8}" r="2" fill="${GOLD}"/>` : o; };
  const gate = (x, w = 54, c = RED) => `<rect x="${x}" y="${G - 34}" width="6" height="34" fill="${c}" ${st}/><rect x="${x + w - 6}" y="${G - 34}" width="6" height="34" fill="${c}" ${st}/><rect x="${x - 4}" y="${G - 30}" width="${w + 8}" height="4" fill="${c}" ${st}/>${roof(x - 2, G - 34, w + 4, 6, D)}<rect x="${x + w / 2 - 8}" y="${G - 27}" width="16" height="6" fill="${GOLD}" ${st}/>`;
  const stupa = (x, s = 1, c = WALL) => T(x, G, s, `<rect x="-24" y="-6" width="48" height="6" fill="${STONE}" ${st}/><path d="M-18 -6 Q-18 -30 0 -30 Q18 -30 18 -6Z" fill="${c}" ${st}/><rect x="-5" y="-38" width="10" height="8" fill="${GOLD}" ${st}/><path d="M-3 -38 L0 -54 L3 -38Z" fill="${GOLD}" ${st}/><path d="M-8 -22 q3-3 6 0 M2 -22 q3-3 6 0" fill="none" stroke="#3b2a6e" stroke-width="1.2"/>`);
  const pavilion = (x, w = 60, c = '#2e7d5b') => `<rect x="${x - 4}" y="${G - 4}" width="${w + 8}" height="4" fill="${STONE}" ${st}/><rect x="${x}" y="${G - 24}" width="${w}" height="20" fill="${WALL}" ${st}/>${roof(x, G - 24, w, 10, c)}${roof(x + w * .22, G - 34, w * .56, 8, c)}<circle cx="${x + w / 2}" cy="${G - 14}" r="6" fill="${D}"/><circle cx="${x + w / 2}" cy="${G - 14}" r="3.6" fill="${c}" opacity=".6"/>`;
  const wall = (x, w = 90, h = 18) => `<rect x="${x}" y="${G - h}" width="${w}" height="${h}" fill="${STONE}" ${st}/>${Array.from({ length: Math.floor(w / 12) }, (_, i) => `<rect x="${x + i * 12 + 2}" y="${G - h - 5}" width="7" height="5" fill="${STONE}" ${st}/>`).join('')}`;
  const tower = (x, c = RED) => `<rect x="${x - 9}" y="${G - 40}" width="18" height="40" fill="${STONE}" ${st}/>${roof(x - 9, G - 40, 18, 7, c)}<rect x="${x - 3}" y="${G - 30}" width="6" height="8" fill="${D}"/>`;
  const granary = (x, c = SAF) => `<rect x="${x - 14}" y="${G - 6}" width="4" height="6" fill="${WOOD}"/><rect x="${x + 10}" y="${G - 6}" width="4" height="6" fill="${WOOD}"/><rect x="${x - 16}" y="${G - 26}" width="32" height="20" fill="#e2c48a" ${st}/><path d="M${x - 20} ${G - 25} L${x} ${G - 40} L${x + 20} ${G - 25}Z" fill="${c}" ${st}/>`;
  const stall = (x, c = RED) => `<rect x="${x}" y="${G - 14}" width="34" height="14" fill="${WOOD}" ${st}/><path d="M${x - 3} ${G - 24} h40 l-4 8 h-32z" fill="${c}" ${st}/><path d="M${x + 5} ${G - 16} v-8 M${x + 29} ${G - 16} v-8" stroke="${D}"/>${[0, 1, 2].map(i => `<circle cx="${x + 8 + i * 9}" cy="${G - 17}" r="3" fill="${['#e8902e', '#b3261e', '#6f9a4a'][i]}" ${st}/>`).join('')}`;
  const well = x => `<ellipse cx="${x}" cy="${G - 2}" rx="12" ry="4" fill="${STONE}" ${st}/><rect x="${x - 12}" y="${G - 12}" width="24" height="10" fill="${STONE}" ${st}/><ellipse cx="${x}" cy="${G - 12}" rx="12" ry="3.5" fill="#3d6c80" ${st}/><path d="M${x - 10} ${G - 12} v-14 M${x + 10} ${G - 12} v-14 M${x - 13} ${G - 26} h26" stroke="${WOOD}" stroke-width="2.4"/><path d="M${x} ${G - 26} v8" stroke="${D}"/><rect x="${x - 3}" y="${G - 18}" width="6" height="5" fill="${WOOD}"/>`;
  const spring = x => `<path d="M${x - 22} ${G} Q${x - 18} ${G - 18} ${x} ${G - 20} Q${x + 18} ${G - 18} ${x + 22} ${G}Z" fill="${STONE}" ${st}/><path d="M${x - 3} ${G - 20} q-2 8 0 14 q2 6 0 6 M${x + 3} ${G - 19} q2 8 0 18" fill="none" stroke="${WAT}" stroke-width="2.4"/><ellipse cx="${x}" cy="${G + 3}" rx="26" ry="4" fill="${WAT}"/>`;
  const bridge = (x, w = 70) => `<path d="M${x} ${G - 6} Q${x + w / 2} ${G - 24} ${x + w} ${G - 6}" fill="none" stroke="${RED}" stroke-width="4"/>${[.2, .4, .6, .8].map(t => `<path d="M${x + w * t} ${G - 6 - 18 * Math.sin(Math.PI * t) * .9} v-6" stroke="${RED}" stroke-width="2"/>`).join('')}`;
  const scaffold = (x, w = 50, h = 38) => `<rect x="${x}" y="${G - h * .6}" width="${w}" height="${h * .6}" fill="${WALL}" ${st}/>${[0, 1, 2, 3].map(i => `<path d="M${x - 4 + i * (w + 8) / 3} ${G} v-${h}" stroke="${WOOD}" stroke-width="2"/>`).join('')}${[1, 2, 3].map(i => `<path d="M${x - 6} ${G - i * h / 3.2} h${w + 12}" stroke="${WOOD}" stroke-width="2"/>`).join('')}<path d="M${x - 4} ${G} L${x + w + 4} ${G - h}" stroke="${WOOD}" stroke-width="1.4"/>`;
  const stele = (x, s = 1) => T(x, G, s, `<rect x="-10" y="-4" width="20" height="4" fill="${STONE}" ${st}/><path d="M-7 -4 V-30 Q0 -36 7 -30 V-4Z" fill="#b8ad97" ${st}/>${[0, 1, 2, 3].map(i => `<path d="M-4 ${-26 + i * 5} h8" stroke="${D}" stroke-width=".8"/>`).join('')}`);
  const borne = x => `<rect x="${x - 4}" y="${G - 18}" width="8" height="18" rx="3" fill="#b8ad97" ${st}/><path d="M${x - 2} ${G - 12} h4 M${x - 2} ${G - 9} h4" stroke="${D}" stroke-width=".8"/>`;
  const gnomon = x => `<ellipse cx="${x}" cy="${G - 2}" rx="22" ry="5" fill="${STONE}" ${st}/><path d="M${x} ${G - 3} L${x + 4} ${G - 34} L${x + 6} ${G - 3}Z" fill="${WOOD}" ${st}/><path d="M${x + 6} ${G - 3} L${x + 30} ${G + 2}" stroke="${D}" stroke-width="2" opacity=".35"/>${[-16, -8, 8, 16].map(d => `<path d="M${x + d} ${G - 4} v2" stroke="${D}"/>`).join('')}`;
  const stage = (x, w = 80) => `<rect x="${x}" y="${G - 10}" width="${w}" height="10" fill="${WOOD}" ${st}/><path d="M${x} ${G - 10} V${G - 40} h${w} V${G - 10}" fill="none" stroke="${RED}" stroke-width="3"/><path d="M${x} ${G - 40} q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0" fill="${RED}" opacity=".85"/>`;
  const bath = (x, w = 80) => `<rect x="${x}" y="${G - 8}" width="${w}" height="8" fill="${STONE}" ${st}/><rect x="${x + 4}" y="${G - 6}" width="${w - 8}" height="5" fill="${WAT}"/>${[0, 1, 2].map(i => `<path d="M${x + 16 + i * 22} ${G - 10} q-4-6 0-10 q4-5 0-10" fill="none" stroke="#fff" stroke-width="1.6" opacity=".8"/>`).join('')}`;

  // ---- nature ----
  const tree = (x, s = 1, c = GRN, y = G) => T(x, y, s, `<rect x="-2" y="-14" width="4" height="14" fill="${WOOD}"/><circle cx="0" cy="-20" r="10" fill="${c}" ${st}/><circle cx="-7" cy="-14" r="6" fill="${c}" ${st}/><circle cx="7" cy="-14" r="6" fill="${c}" ${st}/>`);
  const fruitTree = (x, s = 1) => tree(x, s, '#7aa356') + T(x, G, s, `<circle cx="-5" cy="-20" r="2" fill="${RED}"/><circle cx="4" cy="-16" r="2" fill="${SAF}"/><circle cx="2" cy="-25" r="2" fill="${RED}"/><circle cx="-8" cy="-12" r="2" fill="${SAF}"/>`);
  const pine = (x, s = 1) => T(x, G, s, `<rect x="-2" y="-10" width="4" height="10" fill="${WOOD}"/><path d="M0 -36 L10 -22 H5 L13 -10 H-13 L-5 -22 H-10Z" fill="#3f6f4a" ${st}/>`);
  const bodhi = (x, s = 1) => T(x, G, s, `<path d="M-3 0 Q-2 -14 -6 -22 M3 0 Q2 -14 6 -22 M0 0 V-24" stroke="${WOOD}" stroke-width="3" fill="none"/><ellipse cx="0" cy="-30" rx="24" ry="13" fill="#5f8f45" ${st}/><ellipse cx="-12" cy="-24" rx="10" ry="7" fill="#6f9a4a" ${st}/><ellipse cx="13" cy="-25" rx="10" ry="7" fill="#6f9a4a" ${st}/>`);
  const bamboo = (x, n = 3) => Array.from({ length: n }, (_, i) => `<path d="M${x + i * 6} ${G} V${G - 30 - (i % 2) * 8}" stroke="#7aa356" stroke-width="3"/>${[1, 2, 3].map(k => `<path d="M${x + i * 6 - 2} ${G - k * 9} h4" stroke="#4f7a36"/>`).join('')}<path d="M${x + i * 6} ${G - 28} q6-4 10-1" stroke="#5f8f45" stroke-width="1.6" fill="none"/>`).join('');
  const lotus = (x, y = G + 4, s = 1) => T(x, y, s, `<ellipse cx="0" cy="2" rx="9" ry="2.5" fill="#6f9a4a"/><path d="M0 0 C-3 -4 -3 -8 0 -11 C3 -8 3 -4 0 0Z M0 0 C-6 -2 -9 -6 -9 -9 C-4 -8 -1 -4 0 0Z M0 0 C6 -2 9 -6 9 -9 C4 -8 1 -4 0 0Z" fill="#e58aa8" ${st}/>`);
  const rice = (x, n = 5) => Array.from({ length: n }, (_, i) => `<path d="M${x + i * 7} ${G + 2} q-2-8 1-12 M${x + i * 7} ${G + 2} q3-7 5-9" stroke="${GRN}" stroke-width="1.4" fill="none"/>`).join('');
  const sheaf = x => `<path d="M${x - 6} ${G} L${x} ${G - 22} L${x + 6} ${G}Z" fill="#e2c048" ${st}/><path d="M${x - 5} ${G - 8} h10" stroke="${WOOD}" stroke-width="2"/>`;

  // ---- personnages ----
  const monk = (x, s = 1, robe = SAF, pose = 'stand', y = G) => T(x, y, s, pose === 'sit'
    ? `<path d="M-11 0 Q-11 -10 0 -12 Q11 -10 11 0Z" fill="${robe}" ${st}/><path d="M-6 -10 Q0 -16 6 -10 L4 -4 H-4Z" fill="${robe}" ${st}/><circle cx="0" cy="-17" r="4.5" fill="${SKIN}" ${st}/>`
    : pose === 'walk'
      ? `<path d="M-5 0 L-3 -16 Q0 -19 3 -16 L6 0Z" fill="${robe}" ${st}/><circle cx="0" cy="-21" r="4" fill="${SKIN}" ${st}/><path d="M5 -14 L9 0" stroke="${WOOD}" stroke-width="1.6"/>`
      : `<path d="M-6 0 L-4 -16 Q0 -19 4 -16 L6 0Z" fill="${robe}" ${st}/><path d="M-4 -15 L4 -8" stroke="${RED}" stroke-width="2"/><circle cx="0" cy="-21" r="4" fill="${SKIN}" ${st}/>`);
  const person = (x, s = 1, c = '#5b7fa8', y = G) => T(x, y, s, `<path d="M-5 0 L-4 -15 Q0 -18 4 -15 L5 0Z" fill="${c}" ${st}/><circle cx="0" cy="-20" r="4" fill="${SKIN}" ${st}/><path d="M-4 -23 q4-4 8 0" fill="none" stroke="${D}" stroke-width="1.6"/>`);
  const child = (x, c = '#8fb36a') => person(x, .7, c);
  const crowd = (x, n = 5, cols = ['#5b7fa8', SAF, '#8fb36a', RED, '#9a6a9a']) => Array.from({ length: n }, (_, i) => person(x + i * 11, .85 + (i % 2) * .1, cols[i % cols.length])).join('');
  const monks = (x, n = 3, pose = 'stand') => Array.from({ length: n }, (_, i) => monk(x + i * 14, .9, i % 2 ? '#c9661e' : SAF, pose)).join('');
  const dancer = (x, c = RED) => T(x, G, 1, `<path d="M-7 0 Q0 -6 7 0 L3 -14 Q0 -17 -3 -14Z" fill="${c}" ${st}/><path d="M-3 -13 L-12 -20 M3 -13 L12 -22" stroke="${c}" stroke-width="2.4"/><path d="M-12 -20 q-4 4 -2 8 M12 -22 q4 4 2 8" stroke="${GOLD}" stroke-width="1.2" fill="none"/><circle cx="0" cy="-20" r="4" fill="${SKIN}" ${st}/><path d="M-3 -24 L0 -29 L3 -24" fill="${GOLD}" ${st}/>`);
  const mask = (x, y) => T(x, y, 1, `<path d="M-8 -8 Q0 -12 8 -8 Q9 4 0 9 Q-9 4 -8 -8Z" fill="#f6efd8" ${st}/><path d="M-5 -3 q2-2 4 0 M1 -3 q2-2 4 0" stroke="${D}" stroke-width="1.2" fill="none"/><path d="M-3 4 q3 2 6 0" stroke="${RED}" stroke-width="1.4" fill="none"/>`);

  // ---- objets ----
  const scroll = (x, y, s = 1) => T(x, y, s, `<rect x="-12" y="-6" width="24" height="12" fill="#f6efd8" ${st}/><rect x="-14" y="-7" width="3" height="14" rx="1" fill="${WOOD}"/><rect x="11" y="-7" width="3" height="14" rx="1" fill="${WOOD}"/><path d="M-8 -2 h14 M-8 2 h10" stroke="${D}" stroke-width=".8"/>`);
  const books = (x, y = G, n = 4) => Array.from({ length: n }, (_, i) => `<rect x="${x - 12 + (i % 2) * 2}" y="${y - (i + 1) * 5}" width="24" height="5" fill="${['#b3261e', '#2e7d5b', '#2b5aa8', '#d98e04'][i % 4]}" ${st}/>`).join('');
  const shelf = (x, w = 60) => `<rect x="${x}" y="${G - 40}" width="${w}" height="40" fill="${WOOD}" ${st}/>${[0, 1, 2].map(r => `<rect x="${x + 3}" y="${G - 37 + r * 12}" width="${w - 6}" height="10" fill="#6b4626"/>${Array.from({ length: Math.floor((w - 8) / 6) }, (_, i) => `<rect x="${x + 5 + i * 6}" y="${G - 36 + r * 12}" width="4" height="8" fill="${['#f6efd8', '#e2c48a', '#d9c4a0'][(i + r) % 3]}"/>`).join('')}`).join('')}`;
  const brush = (x, y) => `<path d="M${x} ${y} L${x + 16} ${y - 18}" stroke="${WOOD}" stroke-width="2.4"/><path d="M${x - 2} ${y + 2} L${x + 2} ${y - 2} L${x - 3} ${y + 5}Z" fill="${D}"/><ellipse cx="${x + 24}" cy="${y + 1}" rx="6" ry="2.5" fill="${D}"/>`;
  const lamp = (x, y = G, s = 1) => T(x, y, s, `<path d="M-6 0 Q-6 -5 0 -5 Q6 -5 6 0Z" fill="${GOLD}" ${st}/><path d="M0 -5 q-3 -4 0 -9 q3 5 0 9Z" fill="#f2b84b"/><circle cx="0" cy="-8" r="6" fill="#f2b84b" opacity=".25"/>`);
  const lantern = (x, y, c = '#e85d3f') => `<path d="M${x} ${y - 6} v-6" stroke="${D}"/><ellipse cx="${x}" cy="${y}" rx="5" ry="7" fill="${c}" ${st}/><path d="M${x - 5} ${y} h10" stroke="${GOLD}" stroke-width=".8"/>`;
  const lanternString = (y = 14) => `<path d="M0 ${y - 4} Q93 ${y + 8} 186 ${y - 4}" fill="none" stroke="${D}"/>${[22, 54, 93, 132, 164].map((x, i) => lantern(x, y + 4 + Math.sin(x / 186 * Math.PI) * 6 + 6, ['#e85d3f', '#f2b84b', '#e85d3f', '#f2b84b', '#e85d3f'][i])).join('')}`;
  const incense = (x, y = G) => `<path d="M${x - 12} ${y} Q${x - 12} ${y - 12} ${x} ${y - 12} Q${x + 12} ${y - 12} ${x + 12} ${y}Z" fill="${GOLD}" ${st}/><path d="M${x - 14} ${y - 12} h28" stroke="${D}" stroke-width="2"/>${[-4, 0, 4].map((d, i) => `<path d="M${x + d} ${y - 12} v-8" stroke="${RED}" stroke-width="1.2"/><path d="M${x + d} ${y - 21} q-4 -6 0 -12 q4 -6 0 -12" fill="none" stroke="#9a8f80" stroke-width="1.2" opacity="${.8 - i * .15}"/>`).join('')}`;
  const bell = (x, y = G - 10, s = 1) => T(x, y, s, `<path d="M-14 -30 h28 M-12 -30 V8 M12 -30 V8" stroke="${WOOD}" stroke-width="3"/><path d="M0 -30 v4" stroke="${D}"/><path d="M-8 6 Q-8 -24 0 -26 Q8 -24 8 6Z" fill="#b8862a" ${st}/><path d="M-6 -6 h12 M-7 0 h14" stroke="${D}" stroke-width=".8"/>`);
  const drum = (x, y = G, s = 1) => T(x, y, s, `<path d="M-10 0 L-12 -8 M10 0 L12 -8" stroke="${WOOD}" stroke-width="2"/><ellipse cx="0" cy="-20" rx="13" ry="13" fill="${RED}" ${st}/><ellipse cx="0" cy="-20" rx="9" ry="9" fill="#f3dcb4" ${st}/><path d="M16 -36 L6 -24" stroke="${WOOD}" stroke-width="2.4"/><circle cx="17" cy="-37" r="2.4" fill="${D}"/>`);
  const bowl = (x, y = G, c = WOOD, s = 1) => T(x, y, s, `<path d="M-9 -7 Q-9 0 0 0 Q9 0 9 -7Z" fill="${c}" ${st}/><ellipse cx="0" cy="-7" rx="9" ry="2" fill="#6b4626"/>`);
  const riceBowl = (x, y = G) => bowl(x, y, '#f6efd8') + `<path d="M${x - 7} ${y - 8} Q${x} ${y - 15} ${x + 7} ${y - 8}" fill="#fff" ${st}/>`;
  const jar = (x, y = G, c = '#b0713a', s = 1) => T(x, y, s, `<path d="M-7 0 Q-11 -10 -6 -18 H6 Q11 -10 7 0Z" fill="${c}" ${st}/><rect x="-5" y="-21" width="10" height="3" fill="${c}" ${st}/>`);
  const coin = (x, y, r = 6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${GOLD}" ${st}/><rect x="${x - r * .3}" y="${y - r * .3}" width="${r * .6}" height="${r * .6}" fill="${SKY.P}" ${st}/>`;
  const coins = (x, y = G) => [0, 1, 2, 3, 4].map(i => coin(x - 8 + (i % 3) * 8, y - 5 - Math.floor(i / 3) * 6, 5)).join('');
  const chest = (x, y = G) => `<rect x="${x - 16}" y="${y - 16}" width="32" height="16" fill="${WOOD}" ${st}/><path d="M${x - 16} ${y - 16} Q${x} ${y - 26} ${x + 16} ${y - 16}" fill="#b0713a" ${st}/><rect x="${x - 3}" y="${y - 12}" width="6" height="6" fill="${GOLD}" ${st}/>`;
  const scales = (x, y = G) => `<path d="M${x} ${y} V${y - 30} M${x - 18} ${y - 26} H${x + 18}" stroke="${D}" stroke-width="1.6"/><path d="M${x - 18} ${y - 26} l-6 12 h12z M${x + 18} ${y - 26} l-6 12 h12z" fill="${GOLD}" ${st}/><rect x="${x - 8}" y="${y - 3}" width="16" height="3" fill="${D}"/>`;
  const robes = (x) => `<path d="M${x - 30} ${G - 38} Q${x} ${G - 32} ${x + 30} ${G - 38}" fill="none" stroke="${D}"/>${[-20, 0, 20].map((d, i) => `<path d="M${x + d - 8} ${G - 36} h16 l2 18 h-20z" fill="${[SAF, '#c9661e', RED][i]}" ${st}/>`).join('')}`;
  const loom = x => `<rect x="${x - 18}" y="${G - 30}" width="4" height="30" fill="${WOOD}"/><rect x="${x + 14}" y="${G - 30}" width="4" height="30" fill="${WOOD}"/><rect x="${x - 18}" y="${G - 32}" width="36" height="4" fill="${WOOD}"/><rect x="${x - 12}" y="${G - 26}" width="24" height="16" fill="${SAF}" ${st}/>${[0, 1, 2, 3].map(i => `<path d="M${x - 10 + i * 6} ${G - 26} v16" stroke="#c9661e"/>`).join('')}`;
  const tablet = (x, y) => `<rect x="${x - 10}" y="${y - 14}" width="20" height="26" rx="2" fill="#e2d6bd" ${st}/>${[0, 1, 2, 3].map(i => `<path d="M${x - 6} ${y - 9 + i * 5} h12" stroke="${D}" stroke-width=".9"/>`).join('')}`;
  const flag = (x, c = RED, h = 36) => `<path d="M${x} ${G} V${G - h}" stroke="${WOOD}" stroke-width="2"/><path d="M${x} ${G - h} q10 3 18 0 v10 q-8 3 -18 0z" fill="${c}" ${st}/>`;
  const banners = () => `<path d="M0 8 Q93 18 186 8" fill="none" stroke="${D}" stroke-width=".8"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${6 + i * 15}" y="${10 + Math.sin(i / 11 * Math.PI) * 5}" width="9" height="8" fill="${['#2b5aa8', '#f8f1df', '#b3261e', '#2e7d5b', '#e8b10f'][i % 5]}"/>`).join('')}`;
  const cow = (x, s = 1, c = '#c9a27a') => T(x, G, s, `<rect x="-14" y="-16" width="24" height="11" rx="5" fill="${c}" ${st}/><path d="M-12 -6 v6 M-6 -6 v6 M4 -6 v6 M8 -6 v6" stroke="${D}" stroke-width="2"/><rect x="8" y="-20" width="9" height="8" rx="3" fill="${c}" ${st}/><path d="M10 -20 l-2 -4 M15 -20 l2 -4" stroke="${D}"/>`);
  const goat = (x, s = .8) => cow(x, s, '#f0e8d8');
  const camel = (x, s = 1) => T(x, G, s, `<path d="M-16 -14 Q-12 -26 -6 -16 Q-2 -28 4 -16 L10 -16 L14 -28 L18 -28 L16 -14 Q8 -8 -16 -10Z" fill="#c9a26a" ${st}/><path d="M-13 -10 v10 M-6 -10 v10 M4 -10 v10 M10 -12 v12" stroke="${D}" stroke-width="2"/><rect x="-8" y="-20" width="10" height="6" fill="${RED}" ${st}/>`);
  const boat = (x, y = G - 8, s = 1, sail = '#f6efd8') => T(x, y, s, `<path d="M-24 0 Q0 10 24 0 L18 6 Q0 12 -18 6Z" fill="${WOOD}" ${st}/><path d="M0 0 V-30" stroke="${D}" stroke-width="1.6"/><path d="M1 -28 Q16 -16 1 -4Z" fill="${sail}" ${st}/>`);
  const cart = x => `<rect x="${x - 18}" y="${G - 18}" width="30" height="10" fill="${WOOD}" ${st}/><circle cx="${x - 10}" cy="${G - 6}" r="6" fill="none" stroke="${D}" stroke-width="2"/><circle cx="${x + 6}" cy="${G - 6}" r="6" fill="none" stroke="${D}" stroke-width="2"/>${sheaf(x - 4).replace(new RegExp(`${G}`, 'g'), String(G - 18))}`;
  const herbs = (x, y = G) => `<path d="M${x} ${y} q-4 -8 -2 -14 M${x} ${y} q4 -8 6 -12 M${x} ${y} v-16" stroke="${GRN}" stroke-width="1.6" fill="none"/><circle cx="${x - 2}" cy="${y - 15}" r="2" fill="#9ac46a"/><circle cx="${x + 6}" cy="${y - 13}" r="2" fill="#9ac46a"/>`;
  const plan = (x, y) => `<rect x="${x - 22}" y="${y - 14}" width="44" height="28" fill="#f6efd8" ${st}/><path d="M${x - 16} ${y + 8} h32 M${x - 12} ${y + 8} V${y - 4} h24 V${y + 8} M${x - 16} ${y - 4} L${x} ${y - 12} L${x + 16} ${y - 4}" fill="none" stroke="#2b5aa8" stroke-width="1.2"/>`;
  const starChart = (x, y, r = 18) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2c3550" ${st}/><circle cx="${x}" cy="${y}" r="${r - 5}" fill="none" stroke="${GOLD}" stroke-width=".8" stroke-dasharray="2 2"/>${[[-6, -5], [5, -8], [8, 4], [-4, 7], [0, 0]].map(([a, b]) => `<circle cx="${x + a}" cy="${y + b}" r="1.3" fill="#fff8d8"/>`).join('')}<path d="M${x - 6} ${y - 5} L${x} ${y} L${x + 8} ${y + 4}" stroke="#fff8d8" stroke-width=".6"/>`;
  const smoke = (x, y) => `<path d="M${x} ${y} q-8 -8 0 -16 q8 -8 0 -16 q-6 -6 2 -12" fill="none" stroke="#b9a8d8" stroke-width="2.4" opacity=".8"/>`;
  const sand = () => `${ground('#e6dcc6')}${[0, 1, 2].map(i => `<path d="M0 ${G + 2 + i * 3} Q93 ${G - 2 + i * 3} 186 ${G + 2 + i * 3}" fill="none" stroke="#c9bb9c"/>`).join('')}`;
  const rock = (x, s = 1) => T(x, G, s, `<path d="M-12 0 Q-14 -10 -4 -14 Q8 -16 12 -6 L13 0Z" fill="#9a9384" ${st}/>`);
  const table = (x, w = 50) => `<rect x="${x}" y="${G - 14}" width="${w}" height="4" fill="${WOOD}" ${st}/><path d="M${x + 4} ${G - 10} v10 M${x + w - 4} ${G - 10} v10" stroke="${WOOD}" stroke-width="2.4"/>`;
  const sunRays = (x = 93, y = 20) => `<circle cx="${x}" cy="${y}" r="10" fill="#f2b84b"/>${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M${f(x + 13 * Math.cos(a))} ${f(y + 13 * Math.sin(a))} L${f(x + 19 * Math.cos(a))} ${f(y + 19 * Math.sin(a))}" stroke="#f2b84b" stroke-width="2"/>`; }).join('')}`;
  const halo = (x, y, r = 12) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f2d27a" opacity=".55"/><circle cx="${x}" cy="${y}" r="${r * .7}" fill="#fff3c4" opacity=".7"/>`;
  const fire = (x, y = G) => `<path d="M${x - 8} ${y} h16" stroke="${WOOD}" stroke-width="3"/><path d="M${x} ${y - 2} c-6 -4 -5 -10 0 -16 c1 5 6 6 4 12 c3 -1 3 -4 3 -6 c3 5 0 10 -7 10z" fill="${SAF}" ${st}/>`;
  const mold = x => `${fire(x - 26)}<path d="M${x - 10} ${G} L${x - 6} ${G - 26} H${x + 22} L${x + 26} ${G}Z" fill="#8a7a62" ${st}/><path d="M${x + 2} ${G - 26} q0 -6 6 -6 q6 0 6 6" fill="none" stroke="${D}" stroke-width="2"/><path d="M${x - 24} ${G - 30} Q${x - 10} ${G - 44} ${x + 4} ${G - 30}" stroke="#e85d3f" stroke-width="2" fill="none" stroke-dasharray="3 2"/>`;
  const press = x => `<rect x="${x - 14}" y="${G - 10}" width="28" height="10" fill="${STONE}" ${st}/><path d="M${x} ${G - 10} V${G - 34} M${x - 24} ${G - 34} H${x + 24}" stroke="${WOOD}" stroke-width="3.4"/><circle cx="${x}" cy="${G - 14}" r="6" fill="${STONE}" ${st}/>${jar(x + 30, G, '#b0713a', .9)}`;
  const people2 = (x) => person(x, 1, '#5b7fa8') + person(x + 14, 1, RED);
  const mapRoute = () => `<path d="M10 ${G - 4} Q50 ${G - 20} 90 ${G - 10} T176 ${G - 26}" fill="none" stroke="#b08a5a" stroke-width="3" stroke-dasharray="5 3"/>`;

  // ---- les scènes, carte par carte ----
  const S = {
    a1: () => sky('S') + sun(150, 16) + field() + rice(20, 6) + sheaf(120) + sheaf(134) + monk(78, 1, SAF) + incense(100, G),
    a2: () => sky('S') + mountains(.25) + ground() + mapRoute() + monk(60, .95, SAF, 'walk') + monk(80, .9, '#c9661e', 'walk') + monk(100, .85, SAF, 'walk') + stupa(160, .55),
    a3: () => sky('S') + ground('#c9b58e') + table(40, 100) + scroll(70, G - 20) + scroll(110, G - 20, .9) + brush(126, G - 16) + monk(30, .9, SAF, 'sit') + lamp(150, G - 14, .8),
    a4: () => sky('C') + moon(150, 16) + hills('#8fb36a', .35) + ground() + bamboo(14, 3) + person(70, 1, '#2b5aa8') + scroll(96, G - 18, .8) + lotus(140, G + 3) + lotus(160, G + 5, .8),
    a5: () => sky('P') + ground() + stall(40) + stall(100, '#2b5aa8') + person(86, .95, SAF) + jar(150),
    a6: () => sky('P') + hills() + ground() + house(98, 52, SAF) + lantern(92, G - 26) + person(50, 1, '#8fb36a') + person(64, .95, '#9a6a9a') + flag(166, SAF, 30),
    a7: () => sky('P') + ground() + banners() + stall(14, RED) + stall(76, SAF) + stall(138, '#2e7d5b') + crowd(54, 2),
    a8: () => sky('P') + sun(32, 16) + terraces() + rice(60, 8) + person(120, 1, '#8a7a62') + `<path d="M108 ${G - 24} L132 ${G - 24} L120 ${G - 30}Z" fill="#e2c048" ${st}/>`,
    a9: () => sky('M') + moon(26, 14) + mountains(.2, false) + ground() + pagoda(110, 3) + monk(60, 1, SAF) + lantern(70, G - 26),
    a10: () => sky('M') + clouds(20, 16) + mountains(.5) + `<path d="M40 ${G} L70 ${G - 14} L100 ${G - 26} L120 ${G - 36}" fill="none" stroke="#b08a5a" stroke-width="2" stroke-dasharray="3 2"/>` + monk(84, .7, SAF, 'walk', G - 20) + stupa(124, .4).replace(`translate(124 ${G})`, `translate(124 ${G - 38})`) + ground(),
    a11: () => sky('M') + hills('#c97a5a', .2) + ground() + gate(66, 56) + scaffold(20, 30, 30) + monk(150, .9),
    a12: () => sky('M') + halo(93, G - 22, 18) + ground('#c9b58e') + monk(93, 1.4, SAF, 'sit') + lotus(50, G + 4) + lotus(136, G + 4) + incense(150, G),
    a14: () => sky('C') + ground() + incense(93, G) + smoke(60, G - 20) + lantern(40, G - 30) + lantern(146, G - 30),
    a15: () => sky('C') + sun(40, 18) + river(G - 8) + monk(70, 1, SAF, 'stand', G + 4) + person(110, 1, '#5b7fa8', G + 4) + lotus(150, G + 6),
    a16: () => sky('C') + ground() + halo(93, G - 30, 22) + monks(66, 3, 'sit') + `<path d="M40 30 q6 -6 12 0 M132 26 q6 -6 12 0" fill="none" stroke="${GOLD}" stroke-width="1.4"/><text x="93" y="22" font-size="11" text-anchor="middle" fill="${GOLD}" font-family="serif">ॐ</text>`,
    a17: () => sky('P') + sun(160, 14, 8, '#f0a040') + `<path d="M0 ${G} Q60 ${G - 18} 120 ${G - 8} T186 ${G - 12} V${G}Z" fill="#e2c48a"/>` + sand() + camel(60) + camel(100, .9) + person(136, .95, '#8a5a3a'),
    a18: () => sky('M') + ground() + flag(30, RED) + flag(156, SAF) + monks(54, 6) ,
    a19: () => sky('S') + ground() + table(36, 114) + books(60, G - 14, 3) + scroll(96, G - 20) + starChart(132, G - 34, 12) + tablet(150, G - 22),
    a20: () => sky('C') + ground() + stage(48, 90) + mask(76, G - 22) + dancer(110, RED) + crowd(14, 2) + crowd(150, 2),
    a21: () => sky('J') + ground() + stupa(93, .7) + crowd(20, 4) + crowd(126, 4),
    a22: () => sky('X') + ground() + house(20, 50, GOLD) + person(100, 1.05, '#7a3b8e') + chest(136) + coins(160),
    a23: () => sky('X') + ground() + scaffold(60, 66, 44) + person(40, .9, '#8a7a62') + `<path d="M150 ${G} V${G - 50} H128" stroke="${WOOD}" stroke-width="2.4" fill="none"/><path d="M130 ${G - 50} v14" stroke="${D}"/><rect x="125" y="${G - 36}" width="10" height="7" fill="${STONE}" ${st}/>`,
    a25: () => sky('X') + ground() + granary(70) + granary(120, RED) + sheaf(30) + sheaf(42) + jar(160),
    a27: () => sky('P') + ground() + table(46, 94) + riceBowl(66, G - 14) + riceBowl(93, G - 14) + riceBowl(120, G - 14) + monk(30, 1, SAF) + child(154) + person(168, .9),
    a28: () => sky('P') + ground() + press(80) + lamp(150, G, 1.2) + lamp(166, G, 1),
    a29: () => sky('P') + grass() + fruitTree(40) + fruitTree(84, 1.1) + fruitTree(130) + person(160, .9, '#8fb36a'),
    a30: () => sky('P') + hills('#8fb36a', .45) + grass() + cow(50) + goat(90) + cow(130, .9, '#a8875e') + person(166, .95, '#8a5a3a'),
    a32: () => sky('X') + ground() + table(40, 100) + bowl(64, G - 14) + bowl(88, G - 14, '#b0713a') + bowl(112, G - 14, '#8a5a3a') + fire(160),
    a34: () => sky('M') + ground() + mold(100) + person(40, 1, '#8a7a62'),
    a35: () => sky('M') + ground() + loom(56) + robes(130),
    a38: () => sky('N') + stars(16, 2) + ground('#6b5a44') + pagoda(93, 3, RED) + lamp(30, G, 1.1) + lamp(50, G) + lamp(136, G) + lamp(156, G, 1.1),
    a39: () => sky('C') + ground() + lanternString(10) + dancer(70, SAF) + dancer(116, '#9a6a9a') + monk(160, .9, '#c9661e', 'sit'),
    a40: () => sky('S') + sunRays(120, 22) + mountains(.25, false) + ground() + monk(56, 1.1, SAF),
    a42: () => sky('S') + ground() + shelf(40, 70) + scroll(140, G - 10) + monk(124, .9, SAF),
    a43: () => sky('S') + ground() + table(40, 110) + plan(92, G - 30) + brush(130, G - 18) + person(30, .9, '#2e7d5b'),
    a44: () => sky('S') + ground() + well(93) + person(60, .95, '#8a7a62') + jar(130),
    a45: () => sky('S') + hills('#8fb36a', .4) + grass() + spring(93) + bamboo(20, 2) + rock(150),
    a46: () => sky('C') + ground() + stele(93, 1.3) + person(54, 1, '#8a7a62') + `<path d="M64 ${G - 22} l10 -6" stroke="${D}" stroke-width="2"/>`,
    a48: () => sky('C') + ground() + table(56, 74) + tablet(80, G - 26) + tablet(104, G - 26) + incense(93, G - 14).replace(/translate/, 'translate') + lamp(66, G - 14, .8) + lamp(122, G - 14, .8),
    a49: () => sky('C') + grass() + pine(40) + bodhi(93, 1.1) + pine(146) + monk(124, .8, SAF, 'sit'),
    a50: () => sky('J') + hills() + ground() + mapRoute() + monk(70, 1.1, '#8a5a3a', 'walk') + house(130, 40, SAF),
    a51: () => sky('C') + ground() + banners() + crowd(30, 3) + drum(110, G, .8) + dancer(150, RED),
    a52: () => sky('P') + ground() + granary(60) + jar(100) + jar(118, G, '#8a5a3a') + jar(136) + sheaf(160),
    a53: () => sky('X') + hills() + ground() + borne(93) + `<path d="M0 ${G - 1} H186" stroke="#b08a5a" stroke-dasharray="4 4"/>` + person(130, .95, '#8a7a62'),
    a55: () => sky('M') + ground() + drum(93, G, 1.3) + monk(56, 1, SAF) + `<path d="M120 ${G - 34} q8 6 0 12 M130 ${G - 38} q12 10 0 20" fill="none" stroke="${D}" stroke-width="1.2" opacity=".6"/>`,
    a56: () => sky('P') + river(G - 6) + person(56, 1, '#5b7fa8', G + 2) + person(96, .95, RED, G + 2) + `<path d="M120 20 Q150 26 180 20" stroke="${D}" fill="none"/>` + [130, 146, 162].map((x, i) => `<rect x="${x}" y="22" width="10" height="12" fill="${['#f6efd8', SAF, '#8fb36a'][i]}" ${st}/>`).join(''),
    a57: () => sky('M') + ground() + monk(46, 1.15, '#c9661e') + monk(86, .75, SAF) + monk(110, .75, SAF) + monk(134, .75, SAF) + bell(166, G - 6, .5),
    a58: () => sky('S') + ground() + house(110, 60, '#2e7d5b') + child(40) + child(56, '#f2b84b') + child(72, '#9a6a9a') + tablet(94, G - 26),
    b1: () => sky('P') + terraces('#a9c27e') + person(60, 1, '#8a7a62', G - 14) + cow(120, .9),
    b2: () => sky('M') + mountains(.3) + ground() + wall(20, 146, 18) + pagoda(93, 3) + tower(30) + tower(156),
    b3: () => sky('S') + ground() + monk(56, 1.1, SAF, 'sit') + monk(130, 1.1, '#c9661e', 'sit') + scroll(93, G - 26) + `<path d="M70 ${G - 34} q6 -6 12 0 M104 ${G - 34} q6 -6 12 0" stroke="${D}" fill="none"/>`,
    b4: () => sky('C') + ground() + `<rect x="20" y="10" width="146" height="${G - 14}" fill="#f6efd8" ${st}/>` + `<circle cx="70" cy="30" r="10" fill="#e58aa8" opacity=".7"/><path d="M30 ${G - 8} Q60 20 100 ${G - 20} T160 30" fill="none" stroke="#2b5aa8" stroke-width="3" opacity=".6"/>` + scaffold(120, 30, 34) + person(100, .9, '#2b5aa8'),
    b5: () => sky('P') + sea() + boat(60, G - 8, 1.2) + boat(130, G - 4, .9, SAF) + `<rect x="150" y="${G - 22}" width="36" height="10" fill="${WOOD}" ${st}/>` + jar(168, G - 22, '#b0713a', .8),
    b6: () => sky('M') + ground() + pagoda(130, 4) + monks(30, 5),
    b7: () => sky('N') + stars(24, 5) + moon(30, 14) + ground('#6b5a44') + starChart(120, 30, 18) + monk(70, 1, SAF) + `<path d="M76 ${G - 22} L106 ${G - 40}" stroke="${GOLD}" stroke-width="1.6"/>`,
    b8: () => sky('C') + mountains(.25) + field() + `<path d="M0 ${G + 4} Q40 ${G - 2} 80 ${G + 4} L186 ${G}" fill="none" stroke="${WAT}" stroke-width="5"/>` + `<path d="M40 ${G + 4} V${G + 8} M110 ${G + 2} V${G + 8}" stroke="${WAT}" stroke-width="3"/>` + rice(120, 6) + person(60, .95, '#8a7a62'),
    b10: () => sky('S') + ground() + house(20, 56, '#2e7d5b') + monk(104, 1, SAF) + person(132, 1, '#8fb36a', G) + bowl(150, G - 2) + herbs(170),
    b11: () => sky('C') + ground() + bath(30, 126) + house(132, 44, '#2b5aa8') + person(70, .9, '#f6efd8', G - 4),
    b12: () => sky('S') + ground() + monk(46, 1.2, '#c9661e', 'sit') + monks(90, 4, 'sit') + scroll(46, G - 34, .8),
    b13: () => sky('M') + ground() + stupa(93, .8) + halo(93, 30, 18) + lanternString(8) + monks(26, 2) + monks(138, 2),
    b14: () => sky('S') + ground() + pavilion(20, 70) + shelf(110, 60),
    b15: () => sky('P') + ground() + chest(70) + chest(116) + coins(150) + coins(36) + scales(93).replace(/^/, ''),
    b16: () => sky('M') + clouds(20, 12) + hills('#c97a5a', .2) + ground() + stupa(93, 1.25) + banners(),
    b17: () => sky('S') + ground() + pavilion(10, 76, '#2e7d5b') + pavilion(98, 76, '#2b5aa8') + monk(93, .8, SAF),
    b18: () => sky('C') + ground() + scroll(93, G - 26, 2.2) + brush(140, G - 10) + `<path d="M60 ${G - 30} h56 M60 ${G - 24} h44" stroke="${D}" stroke-width="1.2"/>`,
    b19: () => sky('J') + ground() + banners() + flag(30, '#d98e04') + flag(70, RED) + flag(110, '#2e7d5b') + flag(150, '#2b5aa8') + crowd(36, 6),
    b20: () => sky('X') + ground() + tablet(70, G - 24) + tablet(98, G - 24) + scales(140) + person(36, 1, '#7a3b8e'),
    b21: () => sky('J') + ground() + fire(40) + `<rect x="70" y="${G - 14}" width="30" height="14" fill="${STONE}" ${st}/>` + coins(130) + `<path d="M84 ${G - 34} L84 ${G - 16}" stroke="${WOOD}" stroke-width="4"/><rect x="76" y="${G - 40}" width="16" height="8" fill="#8a7a62" ${st}/>`,
    b22: () => sky('X') + ground() + banners() + stall(8, RED) + stall(52, SAF) + stall(96, '#2e7d5b') + stall(140, '#2b5aa8') + camel(26, .7),
    b23: () => sky('J') + sand() + rock(60, 1.4) + rock(130, 1) + `<circle cx="60" cy="${G + 2}" r="20" fill="none" stroke="#c9bb9c"/><circle cx="60" cy="${G + 2}" r="26" fill="none" stroke="#c9bb9c"/>` + pine(170, .8),
    b26: () => sky('M') + ground() + pagoda(150, 3) + table(30, 96) + riceBowl(46, G - 14) + bowl(66, G - 14, '#b0713a') + riceBowl(86, G - 14) + jar(110, G - 14, '#b0713a', .7) + monk(20, .9, SAF) + person(140, .9, '#8fb36a') + lantern(78, 18) + lantern(108, 18, '#f2b84b'),
    b28: () => sky('S') + ground() + monk(60, 1.25, '#c9661e') + monk(120, 1.25, SAF) + halo(60, G - 26, 10) + halo(120, G - 26, 10) + scroll(93, G - 34),
    b31: () => sky('M') + ground() + pavilion(48, 90, RED) + monks(14, 2, 'sit') + monks(146, 2, 'sit'),
    b32: () => sky('C') + river(G - 10) + lotus(40, G - 4) + lotus(70, G) + lotus(120, G - 2) + monk(150, 1, SAF, 'stand', G - 4) + `<path d="M140 ${G - 26} q-6 8 0 14" stroke="${WAT}" stroke-width="2" fill="none"/>`,
    b33: () => sky('M') + ground() + monk(60, 1, SAF) + monk(126, 1.2, '#8a5a3a', 'sit') + halo(126, G - 22, 14) + lotus(96, G + 2),
    b34: () => sky('P') + ground() + house(14, 50, SAF) + house(76, 50, '#8a5a3a') + person(140, 1, '#8a7a62') + jar(162) + `<path d="M150 ${G - 18} l8 -6" stroke="${D}" stroke-width="2"/>`,
    b37: () => sky('P') + ground() + gate(40, 56, SAF) + person(120, 1, '#7a3b8e') + coins(150) + camel(26, .55),
    b38: () => sky('P') + ground() + pavilion(14, 70, GOLD) + chest(120) + coins(156) + scales(100),
    b39: () => sky('P') + ground() + monk(50, 1.1, SAF) + child(80) + child(94, '#f2b84b') + child(108, '#9a6a9a') + riceBowl(130) + house(140, 40, SAF),
    b41: () => sky('S') + ground() + shelf(14, 60) + books(110, G, 6) + monk(150, 1, SAF, 'sit') + scroll(150, G - 30, .7),
    b44: () => sky('M') + halo(93, G - 26, 26) + ground() + gate(56, 74, GOLD) + monk(93, .9, SAF, 'walk'),
    b45: () => sky('S') + ground() + incense(93, G) + smoke(93, G - 22) + monk(50, 1, '#7a3b8e', 'sit') + `<circle cx="140" cy="${G - 30}" r="8" fill="#b9a8d8" opacity=".6"/>` + person(150, 1, '#2e7d5b'),
    b46: () => sky('S') + ground() + shelf(30, 54) + shelf(96, 54) + lamp(166, G, .9),
    b49: () => sky('C') + hills() + ground() + mapRoute() + monk(40, 1, '#8a5a3a', 'walk') + monk(60, 1, SAF, 'walk') + pavilion(110, 60, '#2b5aa8'),
    b50: () => sky('M') + halo(130, 26, 22) + `<path d="M30 ${G} L60 ${G - 12} L90 ${G - 20} L120 ${G - 34}" fill="none" stroke="${GOLD}" stroke-width="2" stroke-dasharray="3 3"/>` + ground() + monk(60, 1, SAF, 'walk') + monk(110, .8, '#f2d27a', 'walk', G - 26),
    b51: () => sky('C') + ground('#d9c9a6') + banners() + well(93) + crowd(20, 3) + crowd(130, 3),
    b52: () => sky('X') + ground() + pavilion(40, 106, SAF) + bowl(40, G) + riceBowl(146) + lamp(166, G, .8),
    b55: () => sky('C') + grass() + `<path d="M0 ${G} V12 H14 V${G - 12} H186 V${G}Z" fill="${STONE}" opacity=".5"/>` + tree(150, 1, '#c8553d') + T(60, G, 1, `<rect x="-4" y="-14" width="8" height="14" fill="#b8ad97" ${st}/><rect x="-11" y="-18" width="22" height="4" fill="#b8ad97" ${st}/><rect x="-7" y="-28" width="14" height="10" fill="#b8ad97" ${st}/><rect x="-3" y="-26" width="6" height="5" fill="#f2b84b"/><path d="M-12 -28 L0 -36 L12 -28Z" fill="#8a7a62" ${st}/>`) + rock(100, .8) + lotus(30, G + 4) + bamboo(170, 2),
    b56: () => sky('P') + hills() + ground() + house(6, 40, SAF) + house(50, 36, '#8a5a3a') + house(90, 40, SAF) + house(134, 46, RED) + child(88),
    b57: () => sky('C') + ground() + pavilion(40, 106, '#2b5aa8') + crowd(16, 2) + crowd(150, 2),
  };
  window.SCENES = S;

  // ---- Sanctuaires ----
  const W = {
    M1: () => sky('M') + clouds(24, 14) + `<path d="M40 ${G} L93 8 L146 ${G}Z" fill="#8a7a9a" opacity=".55"/><path d="M80 22 L93 8 L106 22 L99 19 L93 25 L87 19Z" fill="#fff"/>` + ground() + monk(30, .7, SAF, 'walk') + flag(160, '#2b5aa8', 28),
    M2: () => sky('D') + ground() + stupa(93, 1.25, GOLD) + lamp(40, G) + lamp(146, G),
    M3: () => sky('P') + river(G - 4) + T(93, G - 4, 1, `<path d="M-40 0 L-34 -10 H34 L40 0Z" fill="${STONE}" ${st}/><path d="M-12 -10 L-8 -40 Q0 -48 8 -40 L12 -10Z" fill="#b8ad97" ${st}/><path d="M-32 -10 L-29 -26 Q-25 -30 -21 -26 L-18 -10Z M18 -10 L21 -26 Q25 -30 29 -26 L32 -10Z" fill="#b8ad97" ${st}/>`) + tree(20, .8),
    M4: () => sky('S') + ground() + wall(12, 70, 22) + wall(104, 70, 22) + shelf(70, 44) + monk(150, .8, SAF),
    M5: () => sky('C') + `<path d="M0 ${G} V16 Q93 4 186 16 V${G}Z" fill="#b08a6a"/>` + [40, 93, 146].map(x => `<path d="M${x - 16} ${G} V${G - 26} Q${x} ${G - 40} ${x + 16} ${G - 26} V${G}Z" fill="#7a5a44" ${st}/>`).join('') + monk(93, .9, '#c9661e', 'sit') + ground('#a88a6a'),
    M6: () => sky('P') + hills('#8fb36a', .4) + ground() + T(93, G, 1, [0, 1, 2, 3].map(i => `<rect x="${-46 + i * 9}" y="${-8 - i * 8}" width="${92 - i * 18}" height="8" fill="#b8ad97" ${st}/>`).join('') + `<path d="M-8 -32 Q0 -44 8 -32Z" fill="#b8ad97" ${st}/><path d="M0 -44 v-6" stroke="${D}" stroke-width="2"/>`),
    M7: () => sky('M') + mountains(.3) + T(93, G, 1, `<rect x="-50" y="-30" width="100" height="30" fill="${WALL}" ${st}/><rect x="-22" y="-44" width="44" height="14" fill="#9b2226" ${st}/>${[-40, -28, -16, 8, 20, 32].map(x => `<rect x="${x}" y="-24" width="6" height="7" fill="${D}"/>`).join('')}`) + ground(),
    M8: () => sky('M') + mountains(.35, false) + ground() + pagoda(60, 3, RED) + pagoda(130, 2, '#2e7d5b') + pine(24, .8) + pine(166, .7),
    M9: () => sky('M') + halo(93, 26, 18) + grass() + bodhi(93, 1.2) + monk(93, .9, SAF, 'sit') + lotus(40, G + 4) + lotus(150, G + 4),
    M10: () => sky('P') + grass() + spring(60) + tree(130, 1.1, '#7aa356') + lotus(96, G + 5) + T(150, G, .7, `<rect x="-4" y="-20" width="8" height="20" fill="#b8ad97" ${st}/><circle cx="0" cy="-24" r="5" fill="#b8ad97" ${st}/>`),
    M11: () => sky('D') + river(G - 6) + T(93, G - 14, 1, [0, 1, 2, 3, 4].map(i => `<rect x="${-80 + i * 32}" y="-24" width="28" height="24" fill="${['#e8c08a', WALL, '#e2b07a', WALL, '#e8c08a'][i]}" ${st}/>`).join('')) + lamp(50, G + 2, .8) + lamp(120, G + 4, .8) + sun(160, 14, 8, '#f0a040'),
    M12: () => sky('X') + ground() + T(93, G, 1, `<rect x="-52" y="-26" width="104" height="26" fill="${WALL}" ${st}/>${roof(-52, -26, 104, 12, D)}${roof(-36, -40, 72, 10, D)}<rect x="-8" y="-20" width="16" height="20" fill="${D}"/>`) + monk(20, .8, SAF) + cow(166, .55, '#a8875e'),
    M13: () => sky('S') + river(G - 6, '#8fbcc8') + T(93, G - 8, 1, `<rect x="-26" y="-14" width="52" height="14" fill="${GOLD}" ${st}/>${roof(-26, -14, 52, 7, D)}<rect x="-18" y="-30" width="36" height="12" fill="${GOLD}" ${st}/>${roof(-18, -30, 36, 6, D)}<path d="M0 -38 v-6" stroke="${GOLD}" stroke-width="2"/>`) + pine(24, .9) + pine(164, .8),
    M14: () => sky('M') + ground('#a99a7a') + pine(20) + pine(44, .8) + [70, 96, 122].map(x => stele(x, .8)).join('') + lantern(150, G - 18) + pine(170, .9),
    M15: () => sky('S') + mountains(.3, false) + ground() + house(120, 50, RED) + monk(40, 1, SAF) + T(66, G, 1, `<path d="M-6 0 L-4 -16 Q0 -19 4 -16 L8 0Z" fill="#c9661e" ${st}/><path d="M3 -14 L14 -22" stroke="#c9661e" stroke-width="2.4"/><circle cx="0" cy="-21" r="4" fill="${SKIN}" ${st}/>`),
    M16: () => sky('C') + ground() + T(93, G, 1, `<rect x="-40" y="-8" width="80" height="8" fill="${STONE}" ${st}/><path d="M-32 -8 Q-32 -20 0 -22 Q32 -20 32 -8Z" fill="${WALL}" ${st}/>`) + monk(93, 1, SAF, 'sit', G - 14) + halo(93, G - 30, 10) + tree(24, .9) + tree(162, .9),
  };
  window.WSCENES = W;
})();
