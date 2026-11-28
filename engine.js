/* Empires — moteur de règles (version B : coûts en niveaux 1-5, effet défausse).
   Données pures + interpréteur d'effets. Utilisé par l'app (partie, en ligne, simulateur) et par Node. */
(function (root) {
'use strict';

const TAGS = ['P', 'M', 'S', 'C'];
const TAG_NAMES = { P: 'Prospérité', M: 'Militaire', S: 'Science', C: 'Culture', J: 'Joker' };
const GUILDS = ['art', 'eru', 'mar'];
// Proposition d'effets fixes par guilde (variante « effet fixe par guilde »)
// fb : si l'effet ne peut pas s'appliquer (réserve vide, roue vide), le joueur prend 1 Plan à la place
const GUILD_FIXED = { art: [{ op: 'progress', n: 1, by: 1, fb: true }], mar: [{ op: 'gain', n: 1, lvl: 0, fb: true }], eru: [{ op: 'plan', n: 1 }] };
const GUILD_NAMES = { art: 'Artisans', eru: 'Érudits', mar: 'Marchands', voy: 'Voyageurs' };

/* ---------- Effets défausse ---------- */
const D = {
  A: [{ op: 'gain', n: 3, lvl: 0 }],
  B: [{ op: 'choice', options: [[{ op: 'turn', n: 1 }], [{ op: 'gain', n: 2, lvl: 1 }]] }],
  C: [{ op: 'progress', n: 2, by: 1 }],
  D: [{ op: 'turn', n: 2 }],
  E: [{ op: 'turn', n: 1 }, { op: 'gain', n: 1, lvl: 0 }],
};
const IF_ALL = (ops) => [{ op: 'if', cond: 'allTypes', then: ops }];

/* ---------- Cartes ---------- */
// t: tags, c: coût (niveau minimum de chaque ouvrier), imm/act: listes d'effets, perm, end, d: défausse
const CARDS = [
  // Niveau 1
  { id: 'a1', lvl: 1, g: 'art', name: 'Officine', t: { S: 1 }, c: [1, 1], pv: 3, perm: { on: 'build', tag: 'P', ops: [{ op: 'gain', n: 1, lvl: 0 }] }, d: D.A },
  { id: 'a2', lvl: 1, g: 'mar', name: 'Université', t: { S: 1 }, c: [1, 1], pv: 3, perm: { on: 'build', tag: 'M', ops: [{ op: 'gain', n: 1, lvl: 0 }] }, d: D.B },
  { id: 'a3', lvl: 1, g: 'eru', name: 'Atelier', t: { S: 1 }, c: [1, 1], pv: 3, perm: { on: 'build', tag: 'S', ops: [{ op: 'gain', n: 1, lvl: 0 }] }, d: D.C },
  { id: 'a4', lvl: 1, g: 'voy', name: 'Scriptorium', t: { S: 1 }, c: [1, 1], pv: 3, perm: { on: 'build', tag: 'C', ops: [{ op: 'gain', n: 1, lvl: 0 }] }, d: D.E },
  { id: 'a5', lvl: 1, g: 'art', name: 'Échoppe', t: { P: 1 }, c: [1], pv: 2, imm: [{ op: 'gain', n: 1, lvl: { c: 'P', max: 5 } }], d: D.A },
  { id: 'a6', lvl: 1, g: 'mar', name: 'Taverne', t: { P: 1 }, c: [1, 1], pv: 3, imm: [{ op: 'gain', n: { c: 'P' }, lvl: 0 }], d: D.B },
  { id: 'a7', lvl: 1, g: 'eru', f: 'ag', name: 'Marché', t: { P: 1 }, v: 3, c: [2, 2], pv: 2, imm: [{ op: 'gain', n: 1, lvl: 3 }], d: D.C },
  { id: 'a8', lvl: 1, g: 'art', gd: true, f: 'or', sx: true, name: 'Ferme', t: { P: 2 }, c: [1, 4], pv: 4, imm: [{ op: 'gain', n: 2, lvl: 1 }], d: D.D },
  { id: 'a9', lvl: 1, g: 'art', name: 'Tour de guet', t: { M: 1 }, c: [1, 1], pv: 3, imm: [{ op: 'progress', n: 1, by: { c: 'M', max: 3 } }], d: D.A },
  { id: 'a10', lvl: 1, g: 'mar', name: 'Fort', t: { M: 1 }, c: [1], pv: 3, imm: [{ op: 'gain', n: 1, lvl: { c: 'M', max: 5 } }], d: D.B },
  { id: 'a11', lvl: 1, g: 'eru', gd: true, f: 'ag', name: 'Palissade', t: { M: 1 }, v: 6, c: [1, 1, 2, 3], pv: 3, imm: [{ op: 'gain', n: 1, lvl: 2, free: true }], d: D.C },
  { id: 'a12', lvl: 1, g: 'voy', f: 'ag', name: 'Caserne', t: { M: 2 }, c: [2, 2], pv: 2, imm: [{ op: 'retrigger', times: 1 }], d: D.D },
  { id: 'a14', lvl: 1, g: 'mar', name: 'Autel', t: { C: 1 }, c: [1, 1], pv: 1, imm: [{ op: 'plan', n: 1 }], end: { col: 'M', pts: 2 }, d: D.B },
  { id: 'a15', lvl: 1, g: 'eru', name: 'Bains', t: { C: 1 }, v: 3, c: [1, 1], pv: 1, imm: [{ op: 'turn', n: 1 }], end: { col: 'S', pts: 2 }, d: D.C },
  { id: 'a16', lvl: 1, g: 'mar', name: 'Odéon', t: { C: 1 }, c: [1], pv: 1, end: { col: 'C', pts: 2 }, d: D.E },
  { id: 'a17', lvl: 1, name: 'Caravansérail', t: { P: 1 }, v: 3, c: [1, 2], pv: 1, imm: IF_ALL([{ op: 'gain', n: 2, lvl: 3, free: true }]), d: D.A },
  { id: 'a18', lvl: 1, name: 'Citadelle', t: { M: 1 }, v: 3, c: [1, 2], pv: 1, imm: IF_ALL([{ op: 'gain', n: 1, lvl: 5, free: true }]), d: D.B },
  { id: 'a19', lvl: 1, name: 'Laboratoire', t: { S: 1 }, v: 3, c: [1, 2], pv: 1, imm: IF_ALL([{ op: 'progress', n: 3, by: 2 }]), d: D.C },
  { id: 'a20', lvl: 1, name: 'Théâtre', t: { C: 1 }, v: 3, c: [1, 2], pv: 1, imm: IF_ALL([{ op: 'vp', n: 5 }]), d: D.A },
  { id: 'a23', lvl: 1, name: 'Grue', t: {}, v: 2, c: [1, 1], pv: 1, imm: [{ op: 'plan', n: 1 }], perm: { crane: true }, d: D.D },
  { id: 'a21', lvl: 1, g: 'art', gd: true, name: 'Forum', t: { J: 1 }, end: { guildMax: 1 }, v: 8, c: [1, 2, 4], pv: 5, d: D.D },
  { id: 'a22', lvl: 1, g: 'mar', gd: true, f: 'or', sx: true, name: 'Villa', t: {}, c: [1, 4], pv: 4, imm: [{ op: 'gain', n: 1, lvl: 2, free: true }], d: D.D },
  { id: 'a25', lvl: 1, g: 'art', name: 'Grenier', t: {}, c: [1, 1], pv: 3, imm: [{ op: 'gain', n: 1, lvl: { c: 'diff', max: 5 } }], d: D.D },
  // Niveau 1 — nouveaux bâtiments
  { id: 'a27', lvl: 1, g: 'mar', name: 'Boulangerie', t: { P: 1 }, v: 2, c: [1, 2], pv: 2, perm: { on: 'build', tag: 'P', ops: [{ op: 'plan', n: 1 }] }, d: D.A },
  { id: 'a28', lvl: 1, g: 'eru', name: 'Pressoir', t: { P: 1 }, v: 3, c: [2, 2], pv: 2, imm: [{ op: 'progress', n: 2, by: 1 }], d: D.A },
  { id: 'a29', lvl: 1, g: 'art', name: 'Verger', t: { P: 1 }, c: [1], pv: 1, end: { row: 'P', pts: 1 }, d: D.A },
  { id: 'a30', lvl: 1, g: 'mar', gd: true, name: 'Bergerie', t: { P: 1 }, v: 5, c: [1, 3], pv: 2, imm: [{ op: 'gain', n: 1, lvl: 2 }], d: D.A },
  { id: 'a32', lvl: 1, g: 'art', name: 'Poterie', t: {}, c: [1, 1], pv: 2, perm: { on: 'discard', g: 'art', ops: [{ op: 'gain', n: 1, lvl: 0 }] }, d: D.A },
  { id: 'a34', lvl: 1, g: 'art', name: 'Forge', t: { M: 1 }, c: [1, 2], pv: 1, imm: [{ op: 'plan', n: 3 }], d: D.A },
  { id: 'a35', lvl: 1, g: 'eru', name: 'Armurerie', t: { M: 1 }, v: 2, c: [1, 2], pv: 2, perm: { discount: 1, tag: 'M' }, d: D.A },
  { id: 'a38', lvl: 1, g: 'eru', name: 'Poste de garde', t: { M: 1 }, c: [1, 1], pv: 1, end: { row: 'M', pts: 2 }, d: D.A },
  { id: 'a39', lvl: 1, g: 'mar', f: 'or', sx: true, name: 'Arène', t: { M: 1, C: 1 }, c: [5], pv: 2, imm: [{ op: 'vp', n: 1 }], end: { atLvl: 5, pts: 2 }, d: D.A },
  { id: 'a40', lvl: 1, g: 'art', name: 'Cadran solaire', t: { S: 1 }, c: [1, 1], pv: 1, imm: [{ op: 'turn', n: 1 }, { op: 'plan', n: 1 }], d: D.A },
  { id: 'a42', lvl: 1, g: 'eru', name: 'Archives', t: { S: 1 }, v: 2, c: [1, 2], pv: 1, perm: { on: 'discard', g: 'eru', ops: [{ op: 'plan', n: 1 }] }, d: D.A },
  { id: 'a43', lvl: 1, g: 'art', name: 'Cartographe', t: { S: 2 }, c: [1, 1], pv: 3, perm: { discount: 1, lvl: 2 }, d: D.A },
  { id: 'a44', lvl: 1, g: 'eru', name: 'Puits', t: { S: 1 }, c: [1], pv: 2, imm: [{ op: 'gain', n: 1, lvl: 1 }], d: D.A },
  { id: 'a45', lvl: 1, g: 'mar', name: 'Fontaine', t: { S: 1, C: 1 }, c: [2, 2], pv: 1, imm: [{ op: 'plan', n: 1 }], end: { col: 'S', pts: 1 }, d: D.A },
  { id: 'a46', lvl: 1, g: 'art', name: 'Stèle', t: { C: 1 }, c: [1, 2], pv: 1, end: { guild: 'eru', pts: 1 }, d: D.A },
  { id: 'a48', lvl: 1, g: 'mar', name: 'Nécropole', t: { C: 1 }, c: [1, 1], pv: 2, perm: { onMarker: [{ op: 'plan', n: 3 }] }, d: D.A },
  { id: 'a49', lvl: 1, g: 'art', gd: true, name: 'Bosquet sacré', t: { C: 2 }, v: 5, c: [1, 3], pv: 2, end: { row: 'C', pts: 2 }, d: D.A },
  { id: 'a50', lvl: 1, g: 'voy', name: 'Relais', t: { J: 1 }, c: [1, 1], pv: 1, imm: [{ op: 'takeGuild' }], d: D.A },
  // Niveau 2
  // Cadre bronze : payables uniquement avec des ouvriers de niveau 1 ou 2
  { id: 'a56', lvl: 1, f: 'br', name: 'Lavoir', t: { P: 1 }, v: 3, c: [1, 2], pv: 2, imm: [{ op: 'gain', n: 2, lvl: 1, free: true }], d: D.A },
  { id: 'a57', lvl: 1, f: 'br', name: 'Camp d’entraînement', t: { M: 1 }, v: 4, c: [2, 2], pv: 3, imm: [{ op: 'progress', n: 3, by: 1 }], d: D.C },
  { id: 'a58', lvl: 1, f: 'br', name: 'École', t: { S: 1 }, v: 4, c: [2, 2], pv: 3, imm: [{ op: 'plan', n: 2 }], d: D.A },
  { id: 'b1', lvl: 2, g: 'art', req: { tags: { P: 1 } }, name: 'Vignoble', t: { P: 1 }, v: 3, c: [1, 1], pv: 3, imm: [{ op: 'gain', n: 2, lvl: 1 }], d: [{ op: 'gain', n: 4, lvl: 0 }] },
  { id: 'b2', lvl: 2, g: 'mar', req: { tags: { M: 1 } }, name: 'Murailles', t: { M: 1 }, v: 3, c: [1, 1], pv: 3, imm: [{ op: 'gain', n: 1, lvl: 2, free: true }], d: [{ op: 'gain', n: 1, lvl: 2, free: true }] },
  { id: 'b3', lvl: 2, g: 'eru', req: { tags: { S: 1 } }, f: 'ag', name: 'Étude', t: { S: 1 }, c: [1, 2], pv: 3, imm: [{ op: 'adjImm' }], d: [{ op: 'progress', n: 3, by: 1 }] },
  { id: 'b4', lvl: 2, g: 'art', gd: true, name: 'Agora', t: { C: 1 }, c: [1, 2, 2], pv: 3, end: { perTag: ['C'], pts: 1 }, d: [{ op: 'vp', n: 2 }] },
  { id: 'b5', lvl: 2, g: 'mar', req: { tags: { P: 1 } }, name: 'Comptoir', t: { P: 1 }, end: { guildEach: 2 }, c: [1, 2], pv: 3, perm: { on: 'discard', g: 'mar', ops: [{ op: 'gain', n: 1, lvl: 1 }] }, d: [{ op: 'gain', n: 4, lvl: 0 }] },
  { id: 'b6', lvl: 2, g: 'eru', req: { tags: { M: 1 } }, name: 'Écuries', t: { M: 1 }, c: [1, 2], pv: 5, perm: { on: 'build', tag: 'M', ops: [{ op: 'gain', n: 1, lvl: 2, free: true }] }, d: [{ op: 'gain', n: 1, lvl: 2, free: true }] },
  { id: 'b7', lvl: 2, g: 'voy', req: { tags: { S: 1 } }, name: 'Observatoire', t: { S: 1 }, v: 3, c: [2, 2], pv: 4, perm: { keep5: true }, d: [{ op: 'turn', n: 2 }] },
  { id: 'b8', lvl: 2, g: 'art', req: { tags: { C: 1 } }, name: 'Aqueduc', t: { C: 1 }, v: 2, c: [1, 1], pv: 2, end: { row: 'P', pts: 2 }, d: [{ op: 'vp', n: 2 }] },
  { id: 'b10', lvl: 2, g: 'eru', req: { tags: { P: 1, S: 1 } }, f: 'ag', name: 'Dispensaire', t: { P: 1, S: 1 }, c: [2, 2], pv: 3, imm: [{ op: 'takeGuild' }, { op: 'turn', n: 1 }], d: [{ op: 'turn', n: 2 }] },
  { id: 'b11', lvl: 2, g: 'art', req: { tags: { P: 1, C: 1 } }, f: 'ag', name: 'Thermes', t: { P: 1, C: 1 }, c: [3, 3], pv: 2, end: { perWheel: 0.5 }, d: [{ op: 'gain', n: 4, lvl: 0 }] },
  { id: 'b12', lvl: 2, g: 'mar', req: { tags: { M: 1, S: 1 } }, name: 'Arsenal', t: { M: 1, S: 1 }, c: [2, 2], pv: 3, imm: [{ op: 'progress', n: 2, by: 2 }], d: [{ op: 'progress', n: 3, by: 1 }] },
  { id: 'b13', lvl: 2, g: 'eru', req: { wonder: 1 }, f: 'ag', name: 'Cirque', t: { M: 1, C: 1 }, c: [2, 2], pv: 5, imm: [{ op: 'gain', n: { c: 'wondW', max: 2 }, lvl: 3, free: true }], d: [{ op: 'gain', n: 1, lvl: 2, free: true }] },
  { id: 'b14', lvl: 2, g: 'voy', req: { tags: { S: 1, C: 1 } }, f: 'ag', name: 'Bibliothèque', t: { S: 1, C: 1 }, v: 6, c: [2, 2], pv: 2, end: { perTag: ['S', 'C'], pts: 1 }, d: [{ op: 'vp', n: 2 }] },
  { id: 'b15', lvl: 2, g: 'art', req: { wonder: 1 }, f: 'or', sx: true, name: 'Trésor royal', t: { P: 3 }, c: [3, 3], pv: 4, imm: [{ op: 'gain', n: 3, lvl: 2 }], d: [{ op: 'gain', n: 5, lvl: 0 }] },
  { id: 'b16', lvl: 2, g: 'mar', req: { wonder: 1 }, f: 'or', sx: true, name: 'Fortifications', t: { M: 3 }, c: [3, 3], pv: 6, imm: [{ op: 'gain', n: 2, lvl: 2, free: true }], d: [{ op: 'recall', n: 9 }, { op: 'gain', n: 1, lvl: 2, free: true }] },
  { id: 'b17', lvl: 2, g: 'eru', req: { wonder: 1 }, f: 'or', sx: true, name: 'Académie', t: { S: 3 }, v: 7, c: [3, 3], pv: 4, perm: { discount: 1 }, d: [{ op: 'turn', n: 2 }, { op: 'progress', n: 1, by: 1 }] },
  { id: 'b18', lvl: 2, g: 'art', req: { wonder: 1 }, f: 'or', sx: true, name: 'Panthéon', t: { C: 3 }, c: [3, 4], pv: 8, d: [{ op: 'vp', n: 3 }] },
  { id: 'b19', lvl: 2, g: 'voy', req: { tags: { all: 1 } }, f: 'ag', name: 'Palais', t: { P: 1, M: 1, S: 1, C: 1 }, c: [1, 2, 3], pv: 6, d: [{ op: 'turn', n: 2 }] },
  { id: 'b20', lvl: 2, g: 'mar', req: { wonder: 1 }, name: 'Chancellerie', t: {}, v: 4, c: [1, 3], pv: 4, imm: [{ op: 'retrigger', times: 2 }], d: [{ op: 'retrigger', times: 1 }] },
  { id: 'b21', lvl: 2, g: 'eru', gd: true, name: 'Hôtel des monnaies', t: { J: 1 }, c: [1, 1, 2], pv: 3, imm: [{ op: 'gain', n: 1, lvl: 5 }], d: [{ op: 'gain', n: 1, lvl: 4 }] },
  { id: 'b22', lvl: 2, g: 'art', gd: true, name: 'Grand marché', t: {}, end: { guild: 'mar', pts: 1 }, c: [1, 3, 3], pv: 3, imm: [{ op: 'gain', n: 1, lvl: 4 }], d: [{ op: 'gain', n: 2, lvl: 2 }] },
  { id: 'b23', lvl: 2, g: 'mar', gd: true, name: 'Jardins', t: { J: 1 }, v: 8, c: [2, 2, 3], pv: 2, end: { lines: 2 }, d: [{ op: 'vp', n: 2 }] },
  // Niveau 2 — nouveaux bâtiments
  { id: 'b26', lvl: 2, g: 'eru', req: { tags: { M: 1, C: 1 } }, name: 'Hippodrome', t: { M: 1, C: 1 }, c: [2, 3], pv: 1, end: { atLvl: 3, pts: 1 }, d: D.A },
  { id: 'b28', lvl: 2, g: 'art', req: { tags: { S: 1 } }, name: 'Lycée', t: { S: 1 }, v: 3, c: [2, 2], pv: 2, perm: { on: 'build', tag: 'S', ops: [{ op: 'progress', n: 1, by: 1 }] }, d: D.A },
  { id: 'b31', lvl: 2, g: 'mar', f: 'or', sx: true, req: { wonder: 1 }, name: 'Capitole', t: { M: 1, S: 1 }, c: [3, 5], pv: 6, imm: [{ op: 'guildAct', g: 'max', times: 2 }], d: D.A },
  { id: 'b32', lvl: 2, g: 'eru', req: { tags: { C: 1 } }, name: 'Nymphée', t: { C: 1 }, v: 6, c: [2, 2], pv: 1, end: { guild: 'art', pts: 1 }, imm: [{ op: 'progress', n: 3, by: 1 }], d: D.A },
  { id: 'b33', lvl: 2, g: 'mar', f: 'ag', req: { tags: { M: 1 } }, name: 'Stade', t: { M: 1 }, c: [2, 3], pv: 3, end: { atLvl: 5, pts: 2 }, d: D.A },
  { id: 'b34', lvl: 2, g: 'art', gd: true, req: { tags: { P: 1 } }, name: 'Quartier des artisans', t: { P: 1 }, v: 5, c: [3, 3], pv: 3, imm: [{ op: 'guildAct', g: 'art', times: 1 }], d: D.A },
  { id: 'b37', lvl: 2, g: 'art', req: { tags: { P: 1 } }, name: 'Douane', t: { P: 1 }, v: 3, c: [2, 2], pv: 2, perm: { on: 'discard', g: 'art', ops: [{ op: 'vp', n: 1 }] }, d: D.A },
  { id: 'b38', lvl: 2, g: 'eru', f: 'or', sx: true, req: { tags: { P: 2 } }, name: 'Banque', t: { P: 1 }, c: [3, 5], pv: 4, imm: [{ op: 'plan', n: 3 }], end: { perPlans: 1 }, d: D.A },
  { id: 'b39', lvl: 2, g: 'mar', req: { tags: { P: 1 } }, name: 'Halle aux grains', t: { P: 1 }, c: [2, 2], pv: 4, perm: { cap: 2 }, d: D.A },
  { id: 'b41', lvl: 2, g: 'eru', req: { tags: { S: 1 } }, name: 'Conservatoire', t: { S: 1 }, c: [2, 2], pv: 3, perm: { discount: 1, tag: 'S' }, d: D.A },
  { id: 'b44', lvl: 2, g: 'eru', f: 'or', sx: true, req: { wonder: 1 }, name: 'Arc de triomphe', t: { M: 1 }, c: [3, 5], pv: 5, end: { markers: 2 }, d: D.A },
  { id: 'b45', lvl: 2, g: 'mar', req: { tags: { S: 1 } }, name: 'Oracle', t: { S: 1 }, v: 5, c: [2, 3], pv: 1, imm: [{ op: 'choice', options: [[{ op: 'turn', n: 2 }], [{ op: 'progress', n: 2, by: 2 }]] }], d: D.A },
  { id: 'b46', lvl: 2, g: 'eru', gd: true, name: 'Archives impériales', t: { S: 1 }, c: [2, 4], pv: 2, end: { guildMax: 1 }, d: D.A },
  { id: 'b49', lvl: 2, g: 'eru', req: { wonder: 1 }, name: 'Hospice des vétérans', t: { C: 1 }, c: [2, 3], pv: 3, perm: { retireLvl: 2 }, d: D.A },
  { id: 'b50', lvl: 2, g: 'mar', f: 'ag', req: { tags: { M: 1 } }, name: 'Caserne des vétérans', t: { M: 1 }, v: 3, c: [2, 2], pv: 2, imm: [{ op: 'zone', n: 1, min: 3 }], d: D.A },
  // Bâtiments de placement et de guilde
  { id: 'a51', lvl: 1, name: 'Place publique', t: { C: 1 }, c: [1, 2], pv: 1, end: { adjAny: 1 } },
  { id: 'a52', lvl: 1, name: 'Entrepôt', t: { P: 1 }, c: [1, 1], pv: 1, end: { adjTag: 'P', pts: 2 } },
  { id: 'a53', lvl: 1, name: 'Borne milliaire', t: {}, c: [1], pv: 1, end: { corner: 4 } },
  { id: 'a55', lvl: 1, name: 'Tour des signaux', t: { M: 1 }, c: [1, 2], pv: 2, end: { adjTag: 'M', pts: 2 } },
  { id: 'b51', lvl: 2, req: { tags: { C: 1 } }, name: 'Grand-place', t: { C: 1 }, v: 7, c: [2, 4], pv: 0, end: { adjAny: 2 } },
  { id: 'b52', lvl: 2, name: 'Maison des guildes', t: {}, v: 6, c: [2, 3], pv: 2, end: { guildTotal: 2 } },
  { id: 'b55', lvl: 2, req: { tags: { S: 1 } }, name: 'Gnomon', t: { S: 1 }, c: [2, 2], pv: 2, end: { corner: 4 } },
  { id: 'b56', lvl: 2, f: 'br', req: { tags: { P: 1 } }, name: 'Faubourg', t: { P: 1 }, v: 6, c: [2, 2, 2], pv: 2, end: { bronze: 1 }, d: D.A },
  { id: 'b57', lvl: 2, f: 'br', req: { tags: { C: 1 } }, name: 'Maison commune', t: { C: 1 }, v: 7, c: [1, 2, 2, 2], pv: 7, d: D.A },
];
// Les bâtiments ne sont plus des cartes de guilde : ils ne gardent un symbole de guilde que s'ils ont une réduction de guilde
for (const c of CARDS) { if (!c.gd) delete c.g; delete c.d; }
// Cartes de guilde : un paquet à part de petites cartes (41 × 63 mm). Chaque guilde a son thème, la force varie.
const GCARDS = [];
{
  const P = (n, by) => ({ op: 'progress', n, by, fb: true }), W = (n, lvl) => ({ op: 'gain', n, lvl, fb: true }), K = n => ({ op: 'plan', n });
  // Les cartes n'ont pas de texte : l'effet dépend du rang de la carte dans sa rangée (matrice du plateau).
  const SETS = { art: [[20, []]], mar: [[20, []]], eru: [[20, []]], voy: [[6, []]] };
  let n = 0;
  for (const g of ['art', 'mar', 'eru', 'voy']) for (const [k, d] of SETS[g]) for (let i = 0; i < k; i++) GCARDS.push({ id: 'g' + (++n), guild: true, g, name: GUILD_NAMES[g], d });
}
const BY_ID = Object.fromEntries(CARDS.map(c => [c.id, c]));
const BASE_CARDS = JSON.parse(JSON.stringify(CARDS));
for (const c of GCARDS) BY_ID[c.id] = c;

const WONDERS = [
  // Valeur fixe : la cible des joueurs pressés
  { id: 'M1', name: 'Pyramide', vals: [9, 6, 3] },
  // Un tag chacune : récompense la spécialisation
  { id: 'M2', name: 'Colosse', vals: [3, 2, 1], mult: 'M' },
  { id: 'M3', name: 'Phare', vals: [3, 2, 1], mult: 'P' },
  { id: 'M4', name: 'Jardins suspendus', vals: [3, 2, 1], mult: 'S' },
  { id: 'M5', name: 'Temple', vals: [3, 2, 1], mult: 'C' },
  // La forme de la ville, la variété, les vétérans, les guildes
  { id: 'M6', name: 'Grande Muraille', vals: [4, 3, 2], by: 'lines' },
  { id: 'M7', name: 'Acropole', vals: [3, 2, 1], by: 'lvl2' },
  { id: 'M8', name: 'Cercle de pierres', vals: [3, 2, 1], by: 'diff' },
  { id: 'M9', name: 'Armée de terre cuite', vals: [2, 1, 1], by: 'vets' },
  { id: 'M10', name: 'Grand Bazar', vals: [3, 2, 1], by: 'sets' },
  // Peu de points, mais un effet immédiat : du tempo
  { id: 'M11', name: 'Mausolée', vals: [5, 3, 2], bonus: [{ op: 'retrigger', times: 1 }] },
  { id: 'M12', name: 'Sphinx', vals: [6, 4, 3], bonus: [{ op: 'plan', n: 2 }] },
  { id: 'M13', name: 'Porte d’Ishtar', vals: [6, 4, 3], bonus: [{ op: 'takeGuild' }] },
  { id: 'M14', name: 'Statue de Zeus', vals: [6, 4, 3], bonus: [{ op: 'gain', n: 1, lvl: 3, free: true }] },
  { id: 'M15', name: 'Grande Bibliothèque', vals: [6, 4, 3], bonus: [{ op: 'progress', n: 3, by: 1 }] },
  { id: 'M16', name: 'Pétra', vals: [6, 4, 3], bonus: [{ op: 'zone', n: 1, min: 3 }] },
];
const W_BY_ID = Object.fromEntries(WONDERS.map(w => [w.id, w]));
const BASE_WONDERS = JSON.parse(JSON.stringify(WONDERS));
// Applique des modifications partagées : { cards: { a1: { c:[1,2], pv:2 } }, wonders: { M1: { vals:[5,3,2] } } }
function applyOverrides(ov) {
  ov = ov || {};
  BASE_CARDS.forEach(b => { const c = BY_ID[b.id]; for (const k of Object.keys(c)) delete c[k]; Object.assign(c, JSON.parse(JSON.stringify(b)), (ov.cards || {})[b.id] || {}); c.id = b.id; c.lvl = b.lvl; });
  BASE_WONDERS.forEach(b => { const w = W_BY_ID[b.id]; Object.assign(w, JSON.parse(JSON.stringify(b)), (ov.wonders || {})[b.id] || {}); w.id = b.id; });
}

const DEFAULT_OPTS = {
  startWheel: [2, 2, 1, 0, 0, 0], // ouvriers par niveau 0..5
  reserve: 6, locked: 4,
  endWonders: 0,                 // 0 = auto : 5 × nb joueurs
  wonderScoring: 'arrival',      // 'arrival' | 'end'
  market: 4,
  costMode: 'sum',               // 'sum' | 'levels'
  guildRows: true,               // les cartes jouées en guilde restent devant le joueur
  guildDiscount: true,           // symbole de guilde : −1 par carte de cette guilde (max 3)
  prereqs: true,                 // prérequis de tags / de Merveille au niveau 2
  guildFrom: 'gdeck',            // 'market' : la carte de guilde est une carte visible ; 'deck' : dessus d'une pioche
  matrix: true,                  // matrice de guildes : l'effet d'une carte dépend de son rang dans sa rangée ; une colonne complète fait tourner la roue
  guildChoice: true,             // chaque tour : une carte de guilde, puis construire OU tourner la roue d'un cran
  guildThenBuild: false,         // après une action de guilde, on peut aussi construire dans le même tour
  turnOnBuild: false,            // construire fait aussi tourner la roue d'un cran
  wonderMode: 'track',           // 'auto' : chaque retraite pose un marqueur ; 'track' : un marqueur toutes les N retraites ; 'consecrate' : action volontaire
  retireStep: 2,                 // N pour 'track'
  supply: 'cycle',               // 'cycle' : un ouvrier dépensé ou parti à la retraite revient au niveau 0 de sa roue ; 'general' : il part dans la réserve générale
  recruitCap: 3,                 // > 0 : on ne peut gagner un ouvrier que si la case 0 en contient moins que ce nombre             // 'general' : ouvriers dépensés ou partis à la retraite vont à la réserve générale ; débloquer en reprend
  ejectReturn: true,             // l'ouvrier éjecté retourne dans la réserve ; un marqueur du joueur va sur la Merveille
  guildChain: 0,                 // jouer une carte en guilde réactive les cartes déjà dans la rangée (0 = non, N = au plus N, 99 = toutes)
  chainNoTurn: false,
  guildFixed: null,                  // ex. { art: [...], eru: [...], mar: [...] } : effet propre à chaque guilde, à la place de l'effet imprimé
  guildTurn: true,               // jouer en guilde fait aussi tourner la roue d'un cran            // la réactivation ignore « tournez la roue »
  copies1: 1, copies2: 1,        // exemplaires de chaque carte (doublons en attendant de nouveaux effets)           // fin de tour de table : la plus ancienne carte de niveau 2 est défaussée
};

/* ---------- Aléatoire reproductible ---------- */
function rnd(G) { // mulberry32
  let t = (G.rng = (G.rng + 0x6D2B79F5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function shuffle(G, a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd(G) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ---------- Mise en place ---------- */
function newGame(names, opts = {}, seed) {
  const o = Object.assign({}, DEFAULT_OPTS, opts);
  if (o.guildFixed === 'default') o.guildFixed = GUILD_FIXED;
  const n = names.length;
  const G = {
    v: 1, rng: (seed ?? Math.floor(Math.random() * 2 ** 31)) | 0, opts: o,
    players: names.map(nm => ({
      name: nm, wheel: o.startWheel.slice(), reserve: o.reserve, locked: o.locked,
      grid: Array(9).fill(null), guilds: { art: [], eru: [], mar: [] }, tokens: 0, plans: 0, vp: 0, u1: false, u2: false,
      st: { built: 0, guild: 0, ejected: 0, lost: 0, acts: 0, gained: 0, turns: 0 },
    })),
    decks: { 1: [], 2: [] }, disc: { 1: [], 2: [] }, market: { 1: [], 2: [] },
    wonders: [], cur: 0, start: 0, turn: 1, round: 1,
    mainDone: false, actUsed: false, queue: [], pending: null,
    endTriggered: false, endReason: null, over: false, log: [],
  };
  const L1 = CARDS.filter(c => c.lvl === 1).map(c => c.id);
  G.decks[1] = shuffle(G, Array.from({ length: o.copies1 || 1 }, () => L1).flat());
  const L2 = CARDS.filter(c => c.lvl === 2).map(c => c.id);
  G.decks[2] = shuffle(G, Array.from({ length: o.copies2 || 1 }, () => L2).flat());
  for (const L of [1, 2]) for (let i = 0; i < o.market; i++) refill(G, L);
  G.gdeck = shuffle(G, GCARDS.map(c => c.id)); G.grow = [];
  if (o.guildFrom === 'gdeck') for (let i = 0; i < 4; i++) G.grow.push(G.gdeck.pop());
  G.gmarket = { 1: [], 2: [] };
  if (o.guildFrom === 'row') for (const L of [1, 2]) for (let i = 0; i < (o.guildRow || 2); i++) if (G.decks[L].length) G.gmarket[L].push(G.decks[L].pop());
  G.wonders = shuffle(G, WONDERS.map(w => w.id)).slice(0, Math.min(WONDERS.length, n + 2)).map(id => ({ id, slots: [] }));
  // 5 marqueurs par joueur, sans dépasser le nombre de places sur les Merveilles
  const perP = o.wonderMode === 'auto' ? 5 : (o.wondersPerPlayer || 2);
  G.endAt = o.endWonders || Math.min(perP * n, 3 * G.wonders.length);
  G.start = G.cur = Math.floor(rnd(G) * n);
  if (n === 2 && o.secondPlan !== false) G.players[(G.start + 1) % 2].plans = 1; // à 2 joueurs, le second joueur commence avec 1 Plan
  log(G, `Partie lancée — ${G.players[G.cur].name} commence.`);
  return G;
}
function refill(G, L) {
  if (!G.decks[L].length && G.disc[L].length) { G.decks[L] = shuffle(G, G.disc[L]); G.disc[L] = []; }
  if (G.decks[L].length) G.market[L].push(G.decks[L].pop());
}
function cs(G, id) { G.cs = G.cs || {}; return (G.cs[id] = G.cs[id] || { b: 0, g: 0 }); }
function log(G, s) { G.log.push(s); if (G.log.length > 60) G.log.shift(); }
const clone = (G) => JSON.parse(JSON.stringify(G));

/* ---------- Lecture d'état ---------- */
function tagCounts(p) {
  const t = { P: 0, M: 0, S: 0, C: 0, J: 0 };
  for (const cell of p.grid) if (cell) { const c = BY_ID[cell.id]; for (const k in c.t) t[k] += c.t[k]; }
  return t;
}
function hasAllTypes(p) {
  const t = tagCounts(p); let missing = TAGS.filter(k => t[k] === 0).length;
  return missing <= t.J;
}
function diffTags(p) { const t = tagCounts(p); return Math.min(5, TAGS.filter(k => t[k] > 0).length + (t.J > 0 ? 1 : 0)); }
function wondersPresent(G, pi) { return G.wonders.filter(w => w.slots.includes(pi)).length; }
function placedOnWonders(G) { return G.wonders.reduce((s, w) => s + w.slots.length, 0); }
function wheelCount(p) { return p.wheel.reduce((a, b) => a + b, 0); }
function hasPerm(p, key) { return p.grid.some(c => c && BY_ID[c.id].perm && BY_ID[c.id].perm[key]); }
function num(G, pi, v) {
  if (typeof v === 'number') return v;
  const p = G.players[pi], t = tagCounts(p); let x = 0;
  if (v.c === 'diff') x = diffTags(p);
  else if (v.c === 'wondW') x = wondersPresent(G, pi);
  else if (v.c === 'PM') x = t.P + t.M;
  else x = t[v.c];
  return v.max != null ? Math.min(v.max, x) : x;
}
const rowOf = i => Math.floor(i / 3), colOf = i => i % 3;

/* ---------- Coûts ----------
   Mode 'sum' (défaut) : le bâtiment a une valeur (chiffre dans un meeple) ; on paie avec des ouvriers
   dont la somme des niveaux atteint cette valeur. Mode 'levels' : chaque ouvrier doit atteindre un niveau minimum. */
const cardValue = (card) => card.v != null ? card.v : card.c.reduce((a, b) => a + b, 0);
function discountFor(G, pi, card) {
  let d = 0;
  for (const cell of G.players[pi].grid) if (cell) {
    const pm = BY_ID[cell.id].perm;
    if (pm && pm.discount && (!pm.tag || (card.t[pm.tag] || 0) > 0) && (!pm.lvl || pm.lvl === card.lvl)) d += pm.discount;
  }
  if (card.gd && G.opts.guildDiscount !== false && card.g !== 'voy') d += Math.min(3, (G.players[pi].guilds || {})[card.g]?.length || 0);
  return d;
}
// Mode 'sum' : renvoie un nombre ; mode 'levels' : une liste de niveaux minimum
function effectiveCost(G, pi, card, coverCell, noPlans) {
  const p = G.players[pi];
  const crane = coverCell != null && p.grid[coverCell] ? BY_ID[p.grid[coverCell].id] : null;
  if (G.opts.costMode !== 'levels') {
    let v = cardValue(card) - discountFor(G, pi, card);
    if (crane) v -= cardValue(crane);
    if (!noPlans) v -= p.plans || 0;
    return Math.max(0, v);
  }
  let c = card.c.slice().sort((a, b) => a - b);
  if (crane) c.shift();
  const d = discountFor(G, pi, card);
  if (d && c.length) c[c.length - 1] = Math.max(0, c[c.length - 1] - d);
  return c;
}
// Cadre argent / or : le paiement doit contenir au moins un ouvrier de la zone argent (niveau 3+) ou or (niveau 5).
// Cadre bronze : uniquement des ouvriers de la zone bronze (niveaux 1 et 2) ; codé par une valeur négative = niveau maximal.
const FRAME_MIN = { ag: 3, or: 5, br: -2 };
const BYPASS_COST = 2;
const frameMin = (G, card) => (G.opts.costMode !== 'levels' && card.f) ? FRAME_MIN[card.f] : 0;
function payOk(wheel, reqs, pay, minLvl = 0) {
  if (minLvl < 0) { if (pay.some(l => l > -minLvl)) return false; minLvl = 0; }
  const w = wheel.slice(); for (const l of pay) { if (l < 0 || l > 5 || !(w[l] > 0)) return false; w[l]--; }
  if (typeof reqs === 'number') {
    const sum = pay.reduce((a, b) => a + b, 0);
    if (sum < reqs) return false;
    const q = pay.filter(l => l >= minLvl).length;
    if (minLvl && !q) return false;
    if (reqs === 0 && !minLvl) return pay.length === 0;
    // pas d'ouvrier inutile : chacun doit être nécessaire (pour la somme ou pour le cadre)
    return pay.every(x => sum - x < reqs || (minLvl && x >= minLvl && q === 1));
  }
  if (pay.length !== reqs.length) return false;
  const r = reqs.slice().sort((a, b) => b - a), p = pay.slice().sort((a, b) => b - a);
  return r.every((req, i) => p[i] >= req);
}
// Paiement automatique. Mode 'sum' : 'exact' = le moins de gaspillage puis le moins d'ouvriers ; 'old' = d'abord les plus vieux.
function autoPay(wheel, reqs, mode = 'exact', minLvl = 0) {
  if (minLvl < 0) { const w = wheel.map((n, l) => (l > -minLvl ? 0 : n)); return autoPay(w, reqs, mode, 0); }
  if (typeof reqs === 'number') {
    if (minLvl) {
      let best = null;
      for (let q = 5; q >= minLvl; q--) {
        if (!(wheel[q] > 0)) continue;
        const w = wheel.slice(); w[q]--;
        const rest = autoPay(w, Math.max(0, reqs - q), mode, 0);
        if (!rest) continue;
        const pay = [q].concat(rest), waste = pay.reduce((a, b) => a + b, 0) - reqs;
        if (mode === 'old') return pay;
        if (!best || waste < best.waste || (waste === best.waste && pay.length < best.pay.length)) best = { waste, pay };
      }
      return best ? best.pay : null;
    }
    if (reqs <= 0) return [];
    if (mode === 'old') {
      const pay = []; let sum = 0;
      for (let l = 5; l >= 1 && sum < reqs; l--) for (let k = 0; k < wheel[l] && sum < reqs; k++) { pay.push(l); sum += l; }
      if (sum < reqs) return null;
      pay.sort((a, b) => a - b); while (pay.length && sum - pay[0] >= reqs) sum -= pay.shift();
      return pay;
    }
    let best = null;
    const rec = (l, sum, pay) => {
      if (sum >= reqs) {
        const waste = sum - reqs;
        if (!best || waste < best.waste || (waste === best.waste && pay.length < best.pay.length)) best = { waste, pay: pay.slice() };
        return;
      }
      if (l < 1) return;
      const maxK = Math.min(wheel[l], Math.ceil((reqs - sum) / l));
      for (let k = maxK; k >= 0; k--) { for (let i = 0; i < k; i++) pay.push(l); rec(l - 1, sum + k * l, pay); pay.length -= k; }
    };
    rec(5, 0, []);
    return best ? best.pay : null;
  }
  const w = wheel.slice(), pay = [];
  for (const req of reqs.slice().sort((a, b) => b - a)) {
    let found = -1;
    if (mode !== 'old') { for (let l = req; l <= 5; l++) if (w[l] > 0) { found = l; break; } }
    else { for (let l = 5; l >= req; l--) if (w[l] > 0) { found = l; break; } }
    if (found < 0) return null;
    w[found]--; pay.push(found);
  }
  return pay;
}
function prereqOk(G, pi, card) {
  if (!card.req || G.opts.prereqs === false) return true;
  const p = G.players[pi];
  if (card.req.wonder && wondersPresent(G, pi) < card.req.wonder) return false;
  if (card.req.tags) {
    const t = tagCounts(p);
    if (card.req.tags.all) { if (!TAGS.every(k => t[k] >= 1)) return false; }
    else for (const k in card.req.tags) if (t[k] < card.req.tags[k]) return false;
  }
  return true;
}
function legalCells(G, pi, card, bypass) {
  if (!bypass && !prereqOk(G, pi, card)) return [];
  const g = G.players[pi].grid, out = [];
  const any = g.some(Boolean);
  for (let i = 0; i < 9; i++) {
    if (g[i]) { if (card.lvl === 2 && BY_ID[g[i].id].perm && BY_ID[g[i].id].perm.crane) out.push(i); continue; }
    if (!any) { out.push(i); continue; }
    const r = rowOf(i), c = colOf(i);
    const adj = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].some(([a, b]) => a >= 0 && a < 3 && b >= 0 && b < 3 && g[a * 3 + b]);
    if (adj) out.push(i);
  }
  return out;
}

/* ---------- Interpréteur d'effets ---------- */
function push(G, ops, front = true) {
  const items = ops.map(op => ({ op }));
  if (front) G.queue.unshift(...items); else G.queue.push(...items);
}
function gain(G, pi, n, lvl, free) {
  const p = G.players[pi]; lvl = Math.max(0, Math.min(5, lvl));
  let k = G.opts.supply === 'cycle' ? n : Math.min(n, p.reserve);
  if (G.opts.recruitCap && !free && lvl === 0) { let cap = G.opts.recruitCap; for (const c of p.grid) if (c) { const pm = BY_ID[c.id].perm; if (pm && pm.cap) cap += pm.cap; } k = Math.min(k, Math.max(0, cap - p.wheel[0])); }
  if (G.opts.supply !== 'cycle') p.reserve -= k;
  p.wheel[lvl] += k; p.st.gained += k; return k;
}
function rotate(G, pi) {
  const p = G.players[pi], w = p.wheel;
  let out = w[5]; let kept = 0;
  if (out > 0 && hasPerm(p, 'keep5')) { kept = 1; out--; }
  for (let l = 5; l > 0; l--) w[l] = w[l - 1];
  w[0] = 0; w[5] += kept;
  return out;
}
function ejectN(G, n) { for (let i = 0; i < n; i++) G.queue.unshift({ op: { op: 'eject' } }); }

function run(G) {
  while (!G.pending && G.queue.length) {
    const { op } = G.queue.shift(); const pi = G.cur, p = G.players[pi];
    switch (op.op) {
      case 'gain': { const want = num(G, pi, op.n), got = gain(G, pi, want, num(G, pi, op.lvl), op.free); if (op.fb && got < want) p.plans += want - got; break; }
      case 'plan': p.plans += num(G, pi, op.n); break;
      case 'takeGuild': if (G.grow && G.grow.length) G.pending = { type: 'takeGuild', options: G.grow.map((_, i) => i) }; break;
      case 'guildAct': {
        let g = op.g;
        if (g === 'max') g = GUILDS.slice().sort((a, b) => p.guilds[b].length - p.guilds[a].length)[0];
        if (G.opts.matrix) { const k = p.guilds[g].length; if (k) for (let i = 0; i < (op.times || 1); i++) push(G, matrixOps(g, k), false); } // rejoue l'effet de la rangée à son rang actuel
        else for (const id of p.guilds[g].slice(-(op.times || 1))) push(G, BY_ID[id].d, false);
        break;
      }
      case 'zone': {
        let k = op.n;
        for (let l = 5; l >= (op.min || 0) && k > 0; l--) while (p.wheel[l] > 0 && k > 0) { p.wheel[l]--; k--; p.st.ejected++; addToZone(G, pi); }
        break;
      }
      case 'turn': {
        // on tourne une fois, on résout les éjections, puis la rotation suivante
        const rest = op.n - 1;
        if (rest > 0) G.queue.unshift({ op: { op: 'turn', n: rest } });
        const out = rotate(G, pi); ejectN(G, out);
        break;
      }
      case 'progress': if (wheelCount(p) > 0) G.pending = { type: 'progress', left: op.n, by: op.by }; else if (op.fb) p.plans += op.n; if (G.pending && G.pending.type === 'progress') G.pending.by = num(G, pi, op.by); break;
      case 'unlock': { const n = num(G, pi, op.n); if (G.opts.supply === 'cycle') { p.wheel[0] += n; p.st.unlocked = (p.st.unlocked || 0) + n; } else if (G.opts.supply === 'general') { p.reserve += n; p.st.unlocked = (p.st.unlocked || 0) + n; } else { const k = Math.min(n, p.locked); p.locked -= k; p.reserve += k; } break; }
      case 'recall': {
        let k = num(G, pi, op.n);
        for (const c of p.grid) if (k > 0 && c && c.occ) { c.occ = false; p.wheel[0]++; k--; }
        break;
      }
      case 'token': p.tokens += op.n; break;
      case 'guildPlace': {
        const c = BY_ID[op.id];
        if (c.g && c.g !== 'voy') { chainGuild(G, pi, c.g); p.guilds[c.g].push(op.id); }
        else G.pending = { type: 'guildRow', id: op.id, options: GUILDS.slice() };
        break;
      }
      case 'vp': p.vp += num(G, pi, op.n); break;
      case 'if': if (op.cond === 'allTypes' && hasAllTypes(p)) push(G, op.then); break;
      case 'choice': G.pending = { type: 'choice', options: op.options }; break;
      case 'retrigger': {
        const cells = retriggerCells(G, pi);
        if (cells.length) G.pending = { type: 'retrigger', times: op.times, cells };
        break;
      }
      case 'line': {
        const cell = G._lastCell;
        if (cell != null) G.pending = { type: 'choice', label: 'line', options: [[{ op: 'lineAct', axis: 'row', cell }], [{ op: 'lineAct', axis: 'col', cell }]] };
        break;
      }
      case 'adjImm': {
        const cell = G._lastCell; if (cell == null) break;
        const r = rowOf(cell), c = colOf(cell), ops = [];
        for (const [a, b] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) if (a >= 0 && a < 3 && b >= 0 && b < 3 && p.grid[a * 3 + b]) {
          const k = BY_ID[p.grid[a * 3 + b].id]; if (k.imm && !/retrigger|adjImm/.test(JSON.stringify(k.imm))) ops.push(...k.imm);
        }
        push(G, ops); break;
      }
      case 'lineAct': {
        const ops = [];
        for (let i = 0; i < 9; i++) {
          if (i === op.cell) continue;
          if ((op.axis === 'row' ? rowOf(i) === rowOf(op.cell) : colOf(i) === colOf(op.cell)) && p.grid[i]) {
            const c = BY_ID[p.grid[i].id]; if (c.act && !JSON.stringify(c.act).includes('retrigger')) ops.push(...c.act);
          }
        }
        push(G, ops);
        break;
      }
      case 'eject': {
        const free = G.wonders.map((w, i) => i).filter(i => G.wonders[i].slots.length < 3);
        p.st.ejected++;
        if (G.opts.wonderMode && G.opts.wonderMode !== 'auto' && !op.marker) {
          if (G.opts.wonderMode === 'track') {
            // le joueur choisit : l'ouvrier revient au niveau 0, ou attend dans la zone de retraite
            G.pending = { type: 'retire', options: ['zone', 'zero'] };
            break;
          }
          if (G.opts.supply === 'cycle') p.wheel[0]++; // mode 'consecrate' : la retraite boucle sans marqueur
          break;
        }
        if (op.noReturn) { if (!free.length) break; if (free.length === 1) placeOnWonder(G, pi, free[0]); else G.pending = { type: 'eject', options: free }; break; }
        if (G.opts.supply === 'cycle') p.wheel[0]++;
        else if (G.opts.ejectReturn && G.opts.supply !== 'general') p.reserve++;
        if (!free.length) { p.st.lost++; log(G, `${p.name} : un ouvrier part à la retraite mais toutes les Merveilles sont pleines${G.opts.ejectReturn ? ' (il retourne dans la réserve)' : ''}.`); }
        else if (free.length === 1) placeOnWonder(G, pi, free[0]);
        else G.pending = { type: 'eject', options: free };
        break;
      }
    }
  }
  checkEnd(G);
}
// Réactivation de la rangée : les cartes déjà posées rejouent leur effet de guilde, après la nouvelle
function addToZone(G, pi) {
  const p = G.players[pi];
  p.retired = (p.retired || 0) + 1;
  if (p.retired >= retireNeed(p, G)) {
    const k = p.retired; p.retired = 0;
    let back = 0; for (const c of p.grid) if (c) { const pm = BY_ID[c.id].perm; if (pm && pm.retireLvl) back = Math.max(back, pm.retireLvl); }
    if (G.opts.supply === 'cycle') p.wheel[back] += k;
    log(G, `${p.name} : ${k} retraités, un marqueur sur une Merveille ; ils reviennent au niveau ${back}.`);
    G.queue.unshift({ op: { op: 'eject', marker: true, noReturn: true } });
  }
}
function retireNeed(p, G) {
  let n = (G && G.opts.retireStep) || 3;
  for (const c of p.grid) if (c) { const pm = BY_ID[c.id].perm; if (pm && pm.retire) n += pm.retire; }
  return Math.max(1, n);
}
// Matrice de guildes. Rang k = position de la carte dans sa rangée.
//   Marchands : 1 ouvrier de niveau k − 1 (0, 1, 2, 3, 4, puis 5)   Artisans : k niveaux à répartir   Érudits : k Savoir
// Une colonne complète (une carte de chaque guilde) fait tourner la roue.
function matrixOps(g, k) {
  if (g === 'mar') return [{ op: 'gain', n: 1, lvl: Math.min(5, k - 1), free: k > 1 }];
  if (g === 'art') return [{ op: 'progress', n: k, by: 1 }];
  return [{ op: 'plan', n: k }];
}
function matrixText(g, k) {
  if (g === 'mar') return `Gagnez 1 ouvrier de niveau ${Math.min(5, k - 1)}`;
  if (g === 'art') return `${k} niveau${k > 1 ? 'x' : ''} à répartir entre vos ouvriers`;
  return `Gagnez ${k} Savoir`;
}
function guildColumns(p) { return Math.min(...GUILDS.map(x => p.guilds[x].length)); }
function matrixEffect(G, pi, g) {
  const p = G.players[pi], k = p.guilds[g].length + 1;
  const before = guildColumns(p), after = Math.min(...GUILDS.map(x => p.guilds[x].length + (x === g ? 1 : 0)));
  const ops = matrixOps(g, k);
  if (after > before) { ops.push({ op: 'turn', n: 1 }); p.st.cols = (p.st.cols || 0) + 1; log(G, `${p.name} complète une colonne de guildes : sa roue tourne.`); }
  push(G, ops, false);
}
function chainGuild(G, pi, g) {
  if (G.opts.matrix) return matrixEffect(G, pi, g);
  if (G.opts.guildFixed) { // la nouvelle carte + chaque carte déjà posée (selon guildChain) donnent l'effet de la guilde
    const n = G.opts.guildChain ? Math.min(G.opts.guildChain, G.players[pi].guilds[g].length) : 0;
    for (let i = 0; i <= n; i++) push(G, G.opts.guildFixed[g], false);
    if (n) log(G, `${G.players[pi].name} réactive ${n} carte${n > 1 ? 's' : ''} de sa guilde ${GUILD_NAMES[g]}.`);
    return;
  }
  const n = G.opts.guildChain || 0; if (!n) return;
  const row = G.players[pi].guilds[g].slice(-n);
  if (!row.length) return;
  log(G, `${G.players[pi].name} réactive ${row.length} carte${row.length > 1 ? 's' : ''} de sa guilde ${GUILD_NAMES[g]}.`);
  const noTurn = G.opts.chainNoTurn;
  const strip = ops => ops.flatMap(o => o.op === 'turn' ? [] : o.op === 'choice' ? [{ op: 'choice', options: o.options.map(strip).filter(x => x.length) }] : [o]).filter(o => o.op !== 'choice' || o.options.length);
  for (const id of row) push(G, noTurn ? strip(BY_ID[id].d) : BY_ID[id].d, false);
}
function retriggerCells(G, pi) {
  // pas de boucle : on ne redéclenche ni un autre redéclenchement, ni l'Étude (qui active des cartes)
  return G.players[pi].grid.map((c, i) => { if (!c || !BY_ID[c.id].imm) return -1; const j = JSON.stringify(BY_ID[c.id].imm); return j.includes('retrigger') || j.includes('"line"') || j.includes('adjImm') ? -1 : i; }).filter(i => i >= 0);
}
const WONDER_BY = { lines: 'nb de lignes et colonnes complètes de votre ville', lvl2: 'nb de bâtiments de niveau 2', diff: 'nb de types de tags différents', vets: 'nb d’ouvriers de niveau 5 sur votre roue', sets: 'nb de séries Artisans + Érudits + Marchands' };
function wonderCount(p, k) {
  if (k === 'lines') { let L = 0; for (let i = 0; i < 3; i++) { if ([0, 1, 2].every(j => p.grid[i * 3 + j])) L++; if ([0, 1, 2].every(j => p.grid[j * 3 + i])) L++; } return L; }
  if (k === 'lvl2') return p.grid.filter(c => c && BY_ID[c.id].lvl === 2).length;
  if (k === 'diff') return diffTags(p);
  if (k === 'vets') return p.wheel[5];
  if (k === 'sets') return Math.min(...GUILDS.map(g => p.guilds[g].length));
  return 0;
}
function wonderPoints(G, pi, wi, slotIndex) {
  const k = G.opts.wonderMul || 1; return k === 1 ? wonderPointsRaw(G, pi, wi, slotIndex) : Math.round(k * wonderPointsRaw(G, pi, wi, slotIndex));
}
function wonderPointsRaw(G, pi, wi, slotIndex) {
  const W = W_BY_ID[G.wonders[wi].id]; const base = W.vals[slotIndex] || 0;
  if (W.multG) return base * G.players[pi].guilds[W.multG].length;
  if (W.by) return base * wonderCount(G.players[pi], W.by);
  return W.mult ? base * tagCounts(G.players[pi])[W.mult] : base;
}
function placeOnWonder(G, pi, wi) {
  const w = G.wonders[wi], W = W_BY_ID[w.id], p = G.players[pi];
  const slot = w.slots.length; w.slots.push(pi);
  if (G.opts.wonderScoring === 'arrival') { const pts = wonderPoints(G, pi, wi, slot); p.vp += pts; (G.wst = G.wst || []).push([W.id, slot, pts, pi]); log(G, `${p.name} : un ouvrier part à la retraite, marqueur sur ${W.name} (+${pts} PV).`); }
  else log(G, `${p.name} : un ouvrier rejoint ${W.name}.`);
  if (W.bonus) push(G, W.bonus);
  for (const c of p.grid) if (c) { const pm = BY_ID[c.id].perm; if (pm && pm.onMarker) push(G, pm.onMarker); }
}
function checkEnd(G) {
  if (G.endTriggered) return;
  if (placedOnWonders(G) >= G.endAt) { G.endTriggered = true; G.endReason = 'Merveilles'; log(G, `Fin de partie déclenchée (Merveilles) : on termine le tour de table.`); }
  else if (G.opts.guildFrom === 'gdeck' && !G.gdeck.length && !G.grow.length) { G.endTriggered = true; G.endReason = 'Pioche épuisée'; log(G, `Fin de partie déclenchée (plus de cartes de guilde) : on termine le tour de table.`); }
  else if (!G.decks[1].length && !G.disc[1].length) { G.endTriggered = true; G.endReason = 'Pioche épuisée'; log(G, `Fin de partie déclenchée (pioche de niveau 1 épuisée) : on termine le tour de table.`); }
  else if (G.players.some(p => p.grid.every(Boolean))) { G.endTriggered = true; G.endReason = 'Ville complète'; log(G, `Fin de partie déclenchée (ville de 9 bâtiments) : on termine le tour de table.`); }
}
function checkUnlocks(G, pi) {
  const p = G.players[pi];
  if (!p.u1 && hasAllTypes(p)) { p.u1 = true; const k = Math.min(1, p.locked); p.locked -= k; if (G.opts.supply === 'cycle') p.wheel[0] += k; else p.reserve += k; if (k) log(G, `${p.name} débloque un ouvrier (1 tag de chaque type).`); }
  const t = tagCounts(p);
  if (!p.u2 && TAGS.some(k => t[k] >= 4)) { p.u2 = true; const k = Math.min(1, p.locked); p.locked -= k; if (G.opts.supply === 'cycle') p.wheel[0] += k; else p.reserve += k; if (k) log(G, `${p.name} débloque un ouvrier (4 tags identiques).`); }
}

/* ---------- Actions ---------- */
// {type:'build', L, idx, cell, pay}  {type:'discard', L, idx}  {type:'activate', cell, lvl}
// {type:'token', lvl}  {type:'resolve', value}  {type:'end'}
function canAct(G) { return !G.over && !G.pending && !G.queue.length; }

function apply(G, a) {
  const pi = G.cur, p = G.players[pi];
  if (G.over) throw new Error('Partie terminée');
  if (a.type === 'resolve') return resolve(G, a.value);
  if (G.pending) throw new Error('Un choix est en attente');
  switch (a.type) {
    case 'build': {
      const bonus = G.mainDone;
      if (bonus && !((G.opts.guildThenBuild || G.opts.guildChoice) && G.lastMain === 'guild' && !G.bonusBuilt)) throw new Error('Action principale déjà jouée');
      if (!bonus && G.opts.guildChoice) throw new Error('Prenez d’abord une carte de guilde');
      if (bonus) G.bonusBuilt = true; else G.lastMain = 'build';
      const id = G.market[a.L][a.idx]; if (!id) throw new Error('Carte absente');
      const card = BY_ID[id];
      const byp = a.bypass ? BYPASS_COST : 0; // 2 Savoir : ignorer le prérequis et le cadre de ce bâtiment
      if (byp && (p.plans || 0) < byp) throw new Error(`Il faut ${BYPASS_COST} Savoir pour ignorer un prérequis ou un cadre`);
      if (!legalCells(G, pi, card, !!byp).includes(a.cell)) throw new Error('Emplacement interdit');
      const cover = !!p.grid[a.cell];
      p.plans -= byp;
      const reqs = effectiveCost(G, pi, card, a.cell);
      if (!payOk(p.wheel, reqs, a.pay, byp ? 0 : frameMin(G, card))) { p.plans += byp; throw new Error(card.f && G.opts.costMode !== 'levels' ? (card.f === 'br' ? 'Ce bâtiment se paie uniquement avec des ouvriers de la zone bronze (niveaux 1 et 2)' : `Il faut un ouvrier de la zone ${card.f === 'or' ? 'or (niveau 5)' : 'argent (niveau 3 ou plus)'}`) : 'Paiement insuffisant'); }
      if (G.opts.costMode !== 'levels' && p.plans) { const before = effectiveCost(G, pi, card, a.cell, true); p.plans -= Math.min(p.plans, before); }
      for (const l of a.pay) { p.wheel[l]--; if (G.opts.supply === 'cycle' && !card.sx) p.wheel[0]++; else if (G.opts.supply !== 'general' && G.opts.supply !== 'cycle') p.reserve++; }
      G.market[a.L].splice(a.idx, 1); refill(G, a.L);
      if (cover) { G.disc[1].push(p.grid[a.cell].id); }
      // effets permanents « quand vous construisez » des bâtiments déjà en place
      const triggers = [];
      for (const c of p.grid) if (c) { const pm = BY_ID[c.id].perm; if (pm && pm.on === 'build' && (card.t[pm.tag] || 0) > 0) triggers.push(...pm.ops); }
      p.grid[a.cell] = { id, occ: false };
      p.st.built++; G.mainDone = true; G._lastCell = a.cell; cs(G, id).b++;
      log(G, `${p.name} construit ${card.name}${cover ? ' (sur la Grue)' : ''}${byp ? ` en dépensant ${byp} Savoir pour ignorer ${card.req && card.f ? 'le prérequis et le cadre' : card.req ? 'le prérequis' : 'le cadre'}` : ''}.`);
      push(G, (G.opts.turnOnBuild ? [{ op: 'turn', n: 1 }] : []).concat(card.imm || [], triggers), false);
      run(G); return G;
    }
    case 'guild': {
      // carte face cachée du dessus d'une pioche, jouée pour son effet de guilde puis défaussée
      if (G.mainDone) throw new Error('Action principale déjà jouée');
      if (a.gi == null && !G.decks[a.L].length && G.disc[a.L].length) { G.decks[a.L] = shuffle(G, G.disc[a.L]); G.disc[a.L] = []; }
      let id;
      if (a.gi != null) { id = G.grow[a.gi]; if (!id) throw new Error('Carte absente'); G.grow.splice(a.gi, 1); if (G.gdeck.length) G.grow.push(G.gdeck.pop()); }
      else if (a.row) { id = G.gmarket[a.L][a.idx]; if (!id) throw new Error('Carte absente'); G.gmarket[a.L].splice(a.idx, 1); if (!G.decks[a.L].length && G.disc[a.L].length) { G.decks[a.L] = shuffle(G, G.disc[a.L]); G.disc[a.L] = []; } if (G.decks[a.L].length) G.gmarket[a.L].push(G.decks[a.L].pop()); }
      else if (a.idx != null) { id = G.market[a.L][a.idx]; if (!id) throw new Error('Carte absente'); G.market[a.L].splice(a.idx, 1); refill(G, a.L); }
      else id = G.decks[a.L].pop();
      if (!id) throw new Error('Pioche vide');
      const card = BY_ID[id];
      G.lastGuild = id;
      if (G.opts.guildRows === false && a.gi == null) G.disc[a.L].push(id);
      p.st.guild++; G.mainDone = true; G.lastMain = 'guild'; cs(G, id).g++;
      log(G, a.gi != null ? `${p.name} prend une carte de guilde ${card.name}.` : a.idx != null ? `${p.name} prend ${card.name} en guilde.` : `${p.name} pioche face cachée et joue ${card.name} en guilde.`);
      const extra = [];
      for (const c of p.grid) if (c) { const pm = BY_ID[c.id].perm; if (pm && pm.on === 'discard' && (!pm.g || pm.g === card.g)) extra.push(...pm.ops); }
      const place = G.opts.guildRows === false ? [] : [{ op: 'guildPlace', id }];
      const own = G.opts.guildFixed || G.opts.matrix ? [] : card.d;
      const turn = G.opts.guildTurn && !G.opts.guildChoice ? [{ op: 'turn', n: 1 }] : [];
      push(G, turn.concat(place, own, extra), false);
      run(G); return G;
    }
    case 'spin': { // variante guildChoice : après la guilde, tourner la roue au lieu de construire
      if (!(G.opts.guildChoice && G.lastMain === 'guild' && !G.bonusBuilt)) throw new Error('Action indisponible');
      G.bonusBuilt = true; log(G, `${p.name} fait tourner sa roue.`);
      { let back = 0, k = 0; for (const c of p.grid) if (c) { const pm = BY_ID[c.id].perm; if (pm && pm.actBack) back = Math.max(back, pm.actBack); }
        for (const c of p.grid) if (c && c.occ) { c.occ = false; k++; }
        if (k) { G._back = { k, back }; } }
      push(G, [{ op: 'turn', n: 1 }], false); run(G);
      if (G._back) { p.wheel[G._back.back] += G._back.k; G._back = null; }
      return G;
    }
    case 'rest': {
      if (G.mainDone) throw new Error('Action principale déjà jouée');
      G.mainDone = true; gain(G, pi, 1, 0); log(G, `${p.name} se repose (1 ouvrier de niveau 0).`); run(G); return G;
    }
    case 'consecrate': {
      if (G.opts.wonderMode !== 'consecrate') throw new Error('Variante inactive');
      if (G.actUsed) throw new Error('Activation déjà utilisée ce tour');
      if (!(p.wheel[5] > 0)) throw new Error('Il faut un ouvrier de niveau 5');
      if (!G.wonders.some(w => w.slots.length < 3)) throw new Error('Merveilles complètes');
      p.wheel[5]--; G.actUsed = true; p.st.consecrated = (p.st.consecrated || 0) + 1;
      log(G, `${p.name} consacre un vétéran à une Merveille.`);
      G.queue.unshift({ op: { op: 'eject', marker: true, noReturn: true } }); run(G); return G;
    }
    case 'activate': {
      if (G.actUsed) throw new Error('Activation déjà utilisée ce tour');
      const c = p.grid[a.cell]; if (!c || c.occ || !BY_ID[c.id].act) throw new Error('Bâtiment non activable');
      if (!(p.wheel[a.lvl] > 0)) throw new Error('Aucun ouvrier à ce niveau');
      p.wheel[a.lvl]--; c.occ = true; G.actUsed = true; p.st.acts++;
      log(G, `${p.name} active ${BY_ID[c.id].name}.`);
      push(G, BY_ID[c.id].act, false); G._lastCell = a.cell;
      run(G); return G;
    }
    case 'token': {
      if (p.tokens <= 0 || !(p.wheel[a.lvl] > 0)) throw new Error('Jeton impossible');
      p.tokens--; p.wheel[a.lvl]--;
      if (a.lvl + 1 > 5) ejectN(G, 1); else p.wheel[a.lvl + 1]++;
      run(G); return G;
    }
    case 'end': {
      if (!G.mainDone) throw new Error('Jouez d’abord une carte (guilde ou construction)');
      if (G.opts.guildChoice && G.lastMain === 'guild' && !G.bonusBuilt) throw new Error('Choisissez : construire ou tourner la roue');
      p.st.turns++;
      G.mainDone = false; G.actUsed = false; G._lastCell = null; G.lastMain = null; G.bonusBuilt = false;
      G.cur = (G.cur + 1) % G.players.length; G.turn++;
      if (G.cur === G.start) {
        G.round++;
        if (G.endTriggered) finish(G);
      }
      return G;
    }
  }
  throw new Error('Action inconnue');
}
function resolve(G, v) {
  const pd = G.pending; if (!pd) throw new Error('Aucun choix en attente');
  const pi = G.cur, p = G.players[pi];
  if (pd.type === 'choice') { const opt = pd.options[v]; if (!opt) throw new Error('Option invalide'); G.pending = null; push(G, opt); }
  else if (pd.type === 'takeGuild') {
    const id = G.grow[v]; if (!id) throw new Error('Carte absente');
    G.pending = null; G.grow.splice(v, 1); if (G.gdeck.length) G.grow.push(G.gdeck.pop());
    const card = BY_ID[id], extra = [];
    for (const c of p.grid) if (c) { const pm = BY_ID[c.id].perm; if (pm && pm.on === 'discard' && (!pm.g || pm.g === card.g)) extra.push(...pm.ops); }
    log(G, `${p.name} prend une carte de guilde ${card.name} grâce à un bâtiment.`);
    push(G, [{ op: 'guildPlace', id }].concat(G.opts.matrix ? [] : card.d, extra));
  }
  else if (pd.type === 'retire') {
    G.pending = null;
    if (v === 'zero') { if (G.opts.supply === 'cycle') p.wheel[0]++; }
    else if (v === 'zone') addToZone(G, pi);
    else throw new Error('Choix invalide');
  }
  else if (pd.type === 'guildRow') { if (!GUILDS.includes(v)) throw new Error('Rangée invalide'); G.pending = null; chainGuild(G, pi, v); p.guilds[v].push(pd.id); log(G, `${p.name} range ${BY_ID[pd.id].name} chez les ${GUILD_NAMES[v]}.`); }
  else if (pd.type === 'eject') { if (!pd.options.includes(v)) throw new Error('Merveille invalide'); G.pending = null; placeOnWonder(G, pi, v); }
  else if (pd.type === 'retrigger') {
    G.pending = null;
    if (v >= 0) { if (!pd.cells.includes(v)) throw new Error('Bâtiment invalide'); const c = BY_ID[p.grid[v].id]; G._lastCell = v; for (let i = 0; i < pd.times; i++) push(G, c.imm, false); }
  } else if (pd.type === 'progress') {
    if (v < 0) G.pending = null;
    else {
      if (!(p.wheel[v] > 0)) throw new Error('Aucun ouvrier à ce niveau');
      p.wheel[v]--; const to = v + pd.by;
      if (to > 5) ejectN(G, 1); else p.wheel[to]++;
      pd.left--; if (pd.left <= 0 || wheelCount(p) === 0) G.pending = null;
      if (G.pending) { const saved = G.pending; G.pending = null; run(G); if (!G.pending) G.pending = saved; return G; }
    }
  }
  run(G); return G;
}

/* ---------- Score final ---------- */
function endPoints(G, pi) {
  const p = G.players[pi], t = tagCounts(p); let pts = 0;
  p.grid.forEach((cell, i) => {
    if (!cell) return; const e = BY_ID[cell.id].end; if (!e) return;
    if (e.col || e.row) {
      const tag = e.col || e.row; let n = 0;
      for (let j = 0; j < 9; j++) if (p.grid[j] && (e.col ? colOf(j) === colOf(i) : rowOf(j) === rowOf(i))) n += BY_ID[p.grid[j].id].t[tag] || 0;
      pts += n * e.pts;
    } else if (e.perTag) pts += e.perTag.reduce((s, k) => s + t[k], 0) * e.pts;
    else if (e.perWheel) pts += Math.floor(wheelCount(p) * e.perWheel);
    else if (e.adjAny || e.adjTag) {
      const r = rowOf(i), c = colOf(i);
      for (const [a, b] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) if (a >= 0 && a < 3 && b >= 0 && b < 3 && p.grid[a * 3 + b]) pts += e.adjAny ? e.adjAny : ((BY_ID[p.grid[a * 3 + b].id].t[e.adjTag] || 0) > 0 ? e.pts : 0);
    }
    else if (e.corner) pts += [0, 2, 6, 8].includes(i) ? e.corner : 0;
    else if (e.guildTotal) pts += Math.floor(GUILDS.reduce((a, g) => a + p.guilds[g].length, 0) / e.guildTotal);
    else if (e.atLvl) pts += p.wheel.slice(e.atLvl).reduce((a, b) => a + b, 0) * e.pts;
    else if (e.bronze) pts += (p.wheel[1] + p.wheel[2]) * e.bronze;
    else if (e.markers) pts += G.wonders.reduce((a, w) => a + w.slots.filter(x => x === pi).length, 0) * e.markers;
    else if (e.perPlans) pts += (p.plans || 0) * e.perPlans;
    else if (e.guildMax) pts += Math.max(...GUILDS.map(g => p.guilds[g].length)) * e.guildMax;
    else if (e.guild) pts += p.guilds[e.guild].length * e.pts;
    else if (e.guildEach) pts += Math.min(...GUILDS.map(g => p.guilds[g].length)) * e.guildEach;
    else if (e.lines) {
      let L = 0; for (let k = 0; k < 3; k++) { if ([0, 1, 2].every(j => p.grid[k * 3 + j])) L++; if ([0, 1, 2].every(j => p.grid[j * 3 + k])) L++; }
      pts += L * e.lines;
    }
  });
  return pts;
}
function scoreOf(G, pi) {
  const p = G.players[pi];
  const bat = p.grid.reduce((s, c) => s + (c ? BY_ID[c.id].pv : 0), 0);
  const fin = endPoints(G, pi);
  let wond = p.vp;
  if (G.opts.wonderScoring === 'end') {
    wond = 0; G.wonders.forEach((w, wi) => w.slots.forEach((who, s) => { if (who === pi) wond += wonderPoints(G, pi, wi, s); }));
    wond += p.vp;
  }
  return { bat, fin, wond, tokens: p.tokens, total: bat + fin + wond + p.tokens };
}
function finish(G) {
  G.over = true;
  G.final = G.players.map((p, i) => Object.assign({ i, name: p.name, wheel: wheelCount(p) }, scoreOf(G, i)));
  const best = G.final.slice().sort((a, b) => b.total - a.total || b.wheel - a.wheel)[0];
  G.winner = best.i;
  log(G, `Fin de partie : ${best.name} l’emporte avec ${best.total} PV.`);
}

/* ---------- Options légales (bots & interface) ---------- */
function mainOptions(G) {
  const pi = G.cur, p = G.players[pi], out = [];
  if (G.opts.guildFrom === 'gdeck') G.grow.forEach((id, gi) => out.push({ type: 'guild', gi }));
  else if (G.opts.guildFrom === 'row') { for (const L of [1, 2]) G.gmarket[L].forEach((id, idx) => out.push({ type: 'guild', L, idx, row: true })); }
  else if (G.opts.guildFrom === 'market') { for (const L of [1, 2]) G.market[L].forEach((id, idx) => out.push({ type: 'guild', L, idx })); }
  else for (const L of [1, 2]) if (G.decks[L].length || G.disc[L].length) out.push({ type: 'guild', L });
  for (const L of [1, 2]) G.market[L].forEach((id, idx) => {
    const card = BY_ID[id];
    const cells = legalCells(G, pi, card);
    const seen = new Set();
    for (const cell of cells) {
      const reqs = effectiveCost(G, pi, card, cell);
      for (const mode of ['exact', 'old']) {
        const pay = autoPay(p.wheel, reqs, mode, frameMin(G, card)); if (!pay) continue;
        const key = cell + ':' + pay.join(','); if (seen.has(key)) continue; seen.add(key);
        out.push({ type: 'build', L, idx, cell, pay });
      }
    }
    // Aucun moyen normal : 2 Savoir permettent d'ignorer le prérequis et le cadre
    if (!seen.size && G.opts.matrix && (p.plans || 0) >= BYPASS_COST && (card.req || card.f)) {
      p.plans -= BYPASS_COST;
      for (const cell of legalCells(G, pi, card, true)) {
        const pay = autoPay(p.wheel, effectiveCost(G, pi, card, cell), 'exact', 0); if (!pay) continue;
        out.push({ type: 'build', L, idx, cell, pay, bypass: true });
      }
      p.plans += BYPASS_COST;
    }
  });
  if (G.opts.guildChoice && !G.mainDone) { const g = out.filter(a => a.type === 'guild'); return g.length ? g : [{ type: 'rest' }]; }
  if (!out.length) out.push({ type: 'rest' });
  return out;
}
function pendingOptions(G) {
  const pd = G.pending, p = G.players[G.cur];
  if (pd.type === 'choice') return pd.options.map((_, i) => i);
  if (pd.type === 'eject' || pd.type === 'guildRow' || pd.type === 'retire' || pd.type === 'takeGuild') return pd.options.slice();
  if (pd.type === 'retrigger') return pd.cells.concat([-1]);
  if (pd.type === 'progress') return [0, 1, 2, 3, 4, 5].filter(l => p.wheel[l] > 0).concat([-1]);
  return [];
}

/* ---------- Bot ---------- */
const BOT_W = { a0: 1.0, a1: 0.6, b0: 0.9, b1: 0.7, wk: 1, wl: 0.45, wp: 0.9, wr: 2.6, wperm: 1.5, wt: 0, wb: 0, gp: 1, et: 0, sf: 1, lt: 9, en: 0 };
function evalPlayer(G, pi, forcePhase) {
  const p = G.players[pi], W = p.bw ? Object.assign({}, BOT_W, p.bw) : BOT_W;
  const nb = p.grid.filter(Boolean).length;
  // avancement de la partie : marqueurs posés, ville la plus avancée (la sienne ou celle d'un adversaire), pioche de guilde
  const maxNb = W.gp ? Math.max(...G.players.map(q => q.grid.filter(Boolean).length)) : nb;
  const phase = forcePhase != null ? forcePhase : Math.min(1, Math.max(placedOnWonders(G) / G.endAt, maxNb / 9));
  const s = scoreOf(G, pi);
  let econ = 0; p.wheel.forEach((n, l) => { econ += n * (W.wk + W.wl * l); });
  econ += p.reserve * 0.7 + p.locked * 0.15 + (p.plans || 0) * W.wp + (p.retired || 0) * W.wr * (G.opts.wonderMul || 1);
  p.grid.forEach(c => { if (!c) return; const k = BY_ID[c.id]; if (k.act) econ += c.occ ? 0.6 : 1.6; if (k.perm) econ += W.wperm; });
  if (p.guilds) for (const g of GUILDS) econ += Math.min(3, p.guilds[g].length) * 0.4 + p.guilds[g].length * (G.opts.guildChain ? 0.6 : 0.15);
  if (G.opts.prereqs !== false && wondersPresent(G, pi) === 0) econ -= 0.8 * (1 - phase);
  if (W.wt) { const t = tagCounts(p); econ += W.wt * (t.P + t.M + t.S + t.C + t.J); }
  econ += W.wb * nb;
  return s.total * (W.a0 + W.a1 * phase) + econ * (W.b0 - W.b1 * phase);
}
function botPick(G, opts, depth) {
  // évalue chaque résolution en simulant
  let best = opts[0], bv = -1e9;
  for (const v of opts) {
    const g = clone(G); try { resolve(g, v); botResolve(g, depth - 1); } catch (e) { continue; }
    const val = evalPlayer(g, G.cur); if (val > bv) { bv = val; best = v; }
  }
  return best;
}
function botResolve(G, depth = 1) {
  let guard = 0;
  while (G.pending && guard++ < 400) {
    const pd = G.pending, p = G.players[G.cur]; let v;
    if (pd.type === 'progress') {
      const ok = [4, 3, 2, 1, 0].filter(l => p.wheel[l] > 0 && l + pd.by <= 5);
      v = ok.length ? ok[0] : -1;
    } else if (pd.type === 'eject') {
      const wv = w => wonderPoints(G, G.cur, w, G.wonders[w].slots.length) + (W_BY_ID[G.wonders[w].id].bonus ? 2 : 0);
      v = pd.options.slice().sort((a, b) => wv(b) - wv(a))[0];
    } else if (depth > 0) v = botPick(G, pendingOptions(G), depth);
    else v = pendingOptions(G)[0];
    resolve(G, v);
  }
  while (G.pending) resolve(G, pendingOptions(G)[0]); // filet de sécurité
}
function botTurnBasic(G, noise = 0.6) {
  const pi = G.cur, p = G.players[pi];
  const tryAct = () => {
    const canCons = G.opts.wonderMode === 'consecrate' && G.players[pi].wheel[5] > 0;
    if (G.actUsed || (!canCons && !G.players[pi].grid.some(c => c && !c.occ && BY_ID[c.id].act))) return;
    const base = evalPlayer(G, pi); let best = null, bv = base + 0.3;
    if (canCons) { const g = clone(G); try { apply(g, { type: 'consecrate' }); botResolve(g, 1); const v = evalPlayer(g, pi); if (v > bv) { bv = v; best = { type: 'consecrate' }; } } catch (e) { } }
    G.players[pi].grid.forEach((c, cell) => {
      if (!c || c.occ || !BY_ID[c.id].act) return;
      const lvl = G.players[pi].wheel.findIndex(n => n > 0); if (lvl < 0) return;
      const g = clone(G); try { apply(g, { type: 'activate', cell, lvl }); botResolve(g, 1); } catch (e) { return; }
      const v = evalPlayer(g, pi); if (v > bv) { bv = v; best = { type: 'activate', cell, lvl }; }
    });
    if (best) { apply(G, best); botResolve(G, 1); }
  };
  tryAct();
  let best = null, bv = -1e9;
  for (const a of mainOptions(G)) {
    let v;
    if (a.type === 'guild' && a.idx == null && a.gi == null) {
      // la carte est cachée : moyenne sur quelques tirages possibles, sans tricher
      const pool = G.decks[a.L].length ? G.decks[a.L] : G.disc[a.L];
      let sum = 0, k = 0;
      for (let s = 0; s < 4; s++) {
        const g = clone(G); const src = g.decks[a.L].length ? g.decks[a.L] : null;
        if (src) { const j = Math.floor(rnd(G) * src.length); const [x] = src.splice(j, 1); src.push(x); }
        try { apply(g, a); botResolve(g, 1); } catch (e) { continue; }
        sum += evalPlayer(g, pi); k++;
      }
      if (!k || !pool.length) continue; v = sum / k;
    } else {
      const g = clone(G); try { apply(g, a); botResolve(g, 1); } catch (e) { continue; }
      v = evalPlayer(g, pi);
    }
    v += (rnd(G) - 0.5) * noise;
    if (v > bv) { bv = v; best = a; }
  }
  apply(G, best); botResolve(G, 1);
  if (G.opts.guildChoice && G.lastMain === 'guild' && !G.over) {
    const g0 = clone(G); apply(g0, { type: 'spin' }); botResolve(g0, 1);
    let bb = { type: 'spin' }, bbv = evalPlayer(g0, pi);
    for (const a of mainOptions(G)) { if (a.type !== 'build') continue; const g = clone(G); try { apply(g, a); botResolve(g, 1); } catch (e) { continue; } const v = evalPlayer(g, pi); if (v > bbv) { bbv = v; bb = a; } }
    apply(G, bb); botResolve(G, 1);
  } else if (G.opts.guildThenBuild && G.lastMain === 'guild' && !G.over) {
    let bb = null, bbv = evalPlayer(G, pi) + 0.2;
    for (const a of mainOptions(G)) { if (a.type !== 'build') continue; const g = clone(G); try { apply(g, a); botResolve(g, 1); } catch (e) { continue; } const v = evalPlayer(g, pi); if (v > bbv) { bbv = v; bb = a; } }
    if (bb) { apply(G, bb); botResolve(G, 1); }
  }
  tryAct();
  apply(G, { type: 'end' });
  return G;
}

/* ---------- Bot réfléchi : planifie tout son tour, puis regarde le tour suivant ---------- */
// Copie légère pour la réflexion. hide : les cartes à venir sont inconnues, on mélange donc les pioches de la copie.
function botCopy(G, hide) {
  const l = G.log, c = G.cs; G.log = []; G.cs = null;
  const g = JSON.parse(JSON.stringify(G)); G.log = l; G.cs = c; g.cs = {};
  if (hide) for (const d of [g.gdeck, g.decks && g.decks[1], g.decks && g.decks[2]]) if (d) for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(rnd(g) * (i + 1)); const t = d[i]; d[i] = d[j]; d[j] = t; }
  return g;
}
// 1 : prendre une carte de guilde ; 2 : construire ou tourner la roue ; 3 : tour terminé
function botStage(G) {
  if (G.over) return 3;
  if (!G.mainDone) return 1;
  if (G.opts.guildChoice && G.lastMain === 'guild' && !G.bonusBuilt) return 2;
  return 3;
}
function botValue(G, pi) {
  if (G.endTriggered) { const p = G.players[pi]; return scoreOf(G, pi).total + 0.02 * wheelCount(p); } // dernier tour : seuls les points comptent
  return evalPlayer(G, pi);
}
// Déclencher la fin de partie : bon si l'on est devant, mauvais si l'on est derrière.
// Les adversaires qui ont encore un tour à jouer gagneront quelques points de plus.
function botEndMargin(G, pi, last) {
  const mine = scoreOf(G, pi).total; let worst = 1e9;
  G.players.forEach((q, j) => {
    if (j === pi) return;
    let k = j; let stillPlays = false; // joue-t-il encore avant la fin du tour de table ?
    for (let c = (pi + 1) % G.players.length; c !== G.start; c = (c + 1) % G.players.length) if (c === j) stillPlays = true;
    worst = Math.min(worst, mine - scoreOf(G, j).total - (stillPlays ? last : 0));
  });
  return worst === 1e9 ? 0 : worst;
}
// Valeur d'un emplacement pour une carte, sans la payer : points de fin de partie que la position rapporte
function botCellScore(G, pi, card, cell) {
  const p = G.players[pi]; if (p.grid[cell]) return 0;
  p.grid[cell] = { id: card.id, occ: false };
  let v = endPoints(G, pi);
  const r = rowOf(cell), c = colOf(cell); let nb = 0;
  for (const [a, b] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) if (a >= 0 && a < 3 && b >= 0 && b < 3 && p.grid[a * 3 + b]) nb++;
  if (JSON.stringify(card.imm || '').includes('adjImm')) v += nb * 1.5;
  for (let k = 0; k < 3; k++) { if ([0, 1, 2].every(j => p.grid[k * 3 + j])) v += 0.6; if ([0, 1, 2].every(j => p.grid[j * 3 + k])) v += 0.6; }
  p.grid[cell] = null;
  return v + nb * 0.05;
}
// Constructions à étudier : pour chaque carte, ses deux meilleurs emplacements
function botBuildCands(G, pi) {
  const by = {};
  for (const a of mainOptions(G)) { if (a.type !== 'build') continue; (by[a.L + ':' + a.idx] = by[a.L + ':' + a.idx] || []).push(a); }
  const out = [];
  for (const k in by) {
    const card = BY_ID[G.market[by[k][0].L][by[k][0].idx]];
    const cells = [...new Set(by[k].map(a => a.cell))].map(cell => [cell, G.players[pi].grid[cell] ? 1e6 : botCellScore(G, pi, card, cell)]).sort((x, y) => y[1] - x[1]);
    const keep = new Set(cells.slice(0, 2).map(x => x[0]));
    for (const [cell, v] of cells) if (v >= 1e6) keep.add(cell); // recouvrir la Grue : toujours étudié
    for (const a of by[k]) if (keep.has(a.cell)) out.push(a);
  }
  return out;
}
function botFinishPending(G) { let guard = 0; while (G.pending && guard++ < 60) { const o = pendingOptions(G); if (!o.length) break; resolve(G, o[0]); } }
// Choix en attente : on ne garde que les deux plus prometteurs
function botPendingCands(G, pi) {
  const opts = pendingOptions(G); if (opts.length <= 2) return opts;
  const sc = [];
  for (const v of opts) { const g = botCopy(G); try { resolve(g, v); botFinishPending(g); } catch (e) { continue; } sc.push([v, botValue(g, pi)]); }
  sc.sort((a, b) => b[1] - a[1]);
  return sc.slice(0, 2).map(x => x[0]);
}
function botDecisions(G, pi) {
  if (G.pending) return botPendingCands(G, pi).map(r => ({ r }));
  const st = botStage(G);
  if (st === 1) return mainOptions(G).map(a => ({ a }));
  if (st === 2) return botBuildCands(G, pi).map(a => ({ a })).concat([{ a: { type: 'spin' } }]);
  return [];
}
function botApply(G, d) { if (d.a) apply(G, d.a); else resolve(G, d.r); }
// Tour suivant joué vite (sans tenir compte des adversaires) : que vaut la position une fois ce tour préparé ?
function botNextTurnValue(g, pi) {
  if (g.over || g.endTriggered) return botValue(g, pi);
  g.cur = pi; g.mainDone = false; g.lastMain = null; g.bonusBuilt = false; g.actUsed = false; g.pending = null; g.queue = g.queue && [];
  for (let step = 0; step < 2; step++) {
    const st = botStage(g); if (st === 3) break;
    const ds = st === 1 ? mainOptions(g).map(a => ({ a })) : botBuildCands(g, pi).map(a => ({ a })).concat([{ a: { type: 'spin' } }]);
    let best = null, bv = -1e9;
    for (const d of ds) { const h = botCopy(g); try { botApply(h, d); botFinishPendingSmart(h, pi); } catch (e) { continue; } const v = botValue(h, pi); if (v > bv) { bv = v; best = h; } }
    if (!best) break; g = best;
  }
  return botValue(g, pi);
}
function botFinishPendingSmart(G, pi) {
  let guard = 0;
  while (G.pending && guard++ < 60) {
    const opts = pendingOptions(G); if (!opts.length) break;
    if (opts.length === 1) { resolve(G, opts[0]); continue; }
    let best = opts[0], bv = -1e9;
    for (const v of opts) { const g = botCopy(G); try { resolve(g, v); botFinishPending(g); } catch (e) { continue; } const x = botValue(g, pi); if (x > bv) { bv = x; best = v; } }
    resolve(G, best);
  }
}
// Explore toutes les façons de finir le tour ; renvoie la première décision du meilleur plan
function botChoose(G, pi, level, noise) {
  const root = botCopy(G, true); const leaves = []; let nodes = 0;
  const bw = G.players[pi].bw, ET = bw && bw.et != null ? bw.et : BOT_W.et, SF = bw && bw.sf != null ? bw.sf : BOT_W.sf, LT = bw && bw.lt != null ? bw.lt : BOT_W.lt, EN = bw && bw.en != null ? bw.en : BOT_W.en;
  const rec = (g, first) => {
    if (!g.pending && botStage(g) === 3) {
      let v = botValue(g, pi);
      if (g.endTriggered && !G.endTriggered) { // c'est moi qui déclenche la fin : même échelle que les autres plans, puis prime si je suis devant
        if (SF) v = evalPlayer(g, pi, 1);
        if (ET) { const m = botEndMargin(g, pi, LT); v += m >= 0 ? ET * Math.min(20, m) : EN * Math.max(-20, m); }
      }
      leaves.push({ first, g, v }); return;
    }
    if (nodes > 700) { try { botFinishPendingSmart(g, pi); if (botStage(g) === 2) apply(g, { type: 'spin' }); botFinishPending(g); } catch (e) { return; } leaves.push({ first, g, v: botValue(g, pi) }); return; }
    for (const d of botDecisions(g, pi)) {
      const h = botCopy(g); nodes++;
      try { botApply(h, d); } catch (e) { continue; }
      rec(h, first || d);
    }
  };
  rec(root, null);
  if (!leaves.length) return null;
  leaves.sort((a, b) => b.v - a.v);
  let cand = leaves;
  if (level >= 2 && !G.endTriggered) {
    cand = [];
    for (const lf of leaves) { // les meilleures fins de tour, avec des premières décisions variées
      const key = JSON.stringify(lf.first);
      if (cand.length >= 4) break;
      if (cand.filter(c => JSON.stringify(c.first) === key).length >= 2) continue;
      cand.push(lf);
    }
    for (const lf of cand) if (!lf.g.endTriggered) lf.v = 0.45 * lf.v + 0.55 * botNextTurnValue(lf.g, pi);
  }
  let best = null, bv = -1e9;
  for (const lf of cand) { const v = lf.v + (rnd(root) - 0.5) * noise; if (v > bv) { bv = v; best = lf; } }
  return best.first;
}
function botTurn(G, noise = 0.6, level) {
  if (level == null) level = G.opts.botLevel == null ? 2 : G.opts.botLevel;
  if (!level || !G.opts.guildChoice || G.opts.guildFrom !== 'gdeck') return botTurnBasic(G, noise);
  const pi = G.cur; let guard = 0;
  while (!G.over && guard++ < 80 && (G.pending || botStage(G) !== 3)) {
    let d = null; try { d = botChoose(G, pi, level, noise); } catch (e) { d = null; }
    try {
      if (d) botApply(G, d);
      else if (G.pending) resolve(G, pendingOptions(G)[0]);
      else if (botStage(G) === 1) apply(G, mainOptions(G)[0]);
      else apply(G, { type: 'spin' });
    } catch (e) { // décision devenue impossible : on avance au plus simple
      if (G.pending) resolve(G, pendingOptions(G)[0]); else if (botStage(G) === 1) apply(G, mainOptions(G)[0]); else apply(G, { type: 'spin' });
    }
  }
  while (G.pending) resolve(G, pendingOptions(G)[0]);
  if (!G.over) apply(G, { type: 'end' });
  return G;
}

/* ---------- Texte des effets ---------- */
function nTxt(v) {
  if (typeof v === 'number') return String(v);
  const lbl = { P: 'nb de Prospérité', M: 'nb de Militaire', S: 'nb de Science', C: 'nb de Culture', diff: 'nb de tags différents', wondW: 'nb de Merveilles où vous êtes', PM: 'nb de Prospérité + Militaire' }[v.c];
  return 'X' + (v.max ? ` (max ${v.max})` : '') + ` — X = ${lbl}`;
}
function opTxt(o) {
  switch (o.op) {
    case 'gain': {
      const n = typeof o.n === 'number' ? o.n : 'X', l = typeof o.lvl === 'number' ? o.lvl : 'X';
      const x = typeof o.n !== 'number' ? o.n : (typeof o.lvl !== 'number' ? o.lvl : null);
      return `Gagnez ${n} ouvrier${n === 1 ? '' : 's'} de niveau ${l}` + (x ? ` (${nTxt(x).replace(/^X( \(max \d\))? — /, '').replace(/^/, 'X = ').replace('X = X = ', 'X = ')}${x.max ? `, max ${x.max}` : ''})` : '');
    }
    case 'turn': return o.n === 1 ? 'Tournez votre roue' : `Tournez votre roue ${o.n} fois`;
    case 'progress': return typeof o.by !== 'number' ? `Faites progresser 1 ouvrier de X niveaux (X = nb de ${TAG_NAMES[o.by.c]}, max ${o.by.max})` : o.n === 1 ? `Faites progresser 1 ouvrier de ${o.by} niveau${o.by > 1 ? 'x' : ''}` : `Faites progresser jusqu’à ${o.n} ouvriers de ${o.by} niveau${o.by > 1 ? 'x' : ''}`;
    case 'unlock': return typeof o.n === 'number' ? `Débloquez ${o.n} ouvrier${o.n > 1 ? 's' : ''}` : `Débloquez 1 ouvrier par Merveille où vous êtes présent (max ${o.n.max})`;
    case 'recall': return typeof o.n === 'number' ? (o.n >= 9 ? 'Reprenez tous vos ouvriers posés sur vos cartes' : `Reprenez ${o.n} ouvrier${o.n > 1 ? 's' : ''} posé${o.n > 1 ? 's' : ''} sur vos cartes`) : `Reprenez jusqu’à X ouvriers posés sur vos cartes (X = nb de Militaire)`;
    case 'token': return `Gagnez ${o.n} jeton${o.n > 1 ? 's' : ''} Bonus`;
    case 'takeGuild': return 'Prenez une carte de guilde visible et appliquez son effet';
    case 'plan': return typeof o.n === 'number' ? `Gagnez ${o.n} Savoir` : `Gagnez 1 Savoir par ${TAG_NAMES[o.n.c]}${o.n.max ? ` (max ${o.n.max})` : ''}`;
    case 'retrigger': return o.times > 1 ? `Déclenchez ${o.times} fois l’effet immédiat d’un de vos bâtiments` : `Déclenchez l’effet immédiat d’un de vos bâtiments`;
    case 'adjImm': return 'Déclenchez l’effet immédiat de chaque bâtiment adjacent';
    case 'line': return `Activez gratuitement les cartes de sa ligne ou de sa colonne`;
    case 'choice': return o.options.map(ops => ops.map(opTxt).join(' + ')).join(' OU ');
    case 'if': return `Si vous avez 1 tag de chaque type : ${o.then.map(opTxt).join(' + ').replace(/^./, c => c.toLowerCase())}`;
    case 'vp': return typeof o.n === 'number' ? `Marquez ${o.n} PV` : `Gagnez 1 PV par ${TAG_NAMES[o.n.c]}`;
    case 'guildAct': return `Rejouez ${o.times > 1 ? o.times + ' fois ' : ''}l’effet de ${o.g === 'max' ? 'votre plus longue rangée de guilde' : 'votre rangée ' + GUILD_NAMES[o.g]}, à son rang actuel`;
    case 'zone': return `Envoyez ${o.n} ouvrier${o.n > 1 ? 's' : ''} de niveau ${o.min} ou plus dans votre zone de retraite`;
  }
  return '';
}
const opsTxt = (ops) => ops ? ops.map(opTxt).join('. ') + '.' : '';
function cardText(c) {
  const out = {};
  if (c.imm) out.imm = opsTxt(c.imm);
  if (c.act) out.act = 'Placez 1 ouvrier : ' + opsTxt(c.act).replace(/^./, m => m.toLowerCase());
  if (c.perm) {
    const pm = c.perm;
    if (pm.on === 'build') out.perm = `Quand vous construisez un bâtiment ${TAG_NAMES[pm.tag]} : ${opsTxt(pm.ops).replace(/^./, m => m.toLowerCase())}`;
    else if (pm.on === 'discard') out.perm = `Quand vous prenez une carte de guilde${pm.g ? ' ' + GUILD_NAMES[pm.g] : ''} : ${opsTxt(pm.ops).replace(/^./, m => m.toLowerCase())}`;
    else if (pm.keep5) out.perm = 'Quand votre roue tourne, un ouvrier de niveau 5 peut rester sur place.';
    else if (pm.discount) out.perm = `Vos bâtiments${pm.tag ? ' ' + TAG_NAMES[pm.tag] : ''}${pm.lvl ? ' de niveau ' + pm.lvl : ''} coûtent ${pm.discount} de moins.`;
    else if (pm.onMarker) out.perm = `Quand vous posez un marqueur sur une Merveille : ${opsTxt(pm.onMarker).replace(/^./, m => m.toLowerCase())}`;
    else if (pm.cap) out.perm = `Votre case 0 peut accueillir ${3 + pm.cap} nouveaux ouvriers au lieu de 3.`;
    else if (pm.retireLvl) out.perm = `Vos retraités reviennent sur la roue au niveau ${pm.retireLvl} au lieu de 0.`;
    else if (pm.actBack) out.perm = `Vos ouvriers posés sur des bâtiments reviennent au niveau ${pm.actBack} au lieu de 0.`;
    else if (pm.retire) out.perm = `Votre zone de retraite se déclenche avec ${3 + pm.retire} ouvriers au lieu de 3.`;
    else if (pm.crane) out.perm = 'Un bâtiment de niveau 2 peut recouvrir la Grue : payez seulement la différence de coût.';
  }
  if (c.end) {
    const e = c.end;
    if (e.col) out.end = `${e.pts} PV par ${TAG_NAMES[e.col]} dans sa colonne.`;
    else if (e.row) out.end = `${e.pts} PV par ${TAG_NAMES[e.row]} dans sa ligne.`;
    else if (e.perTag) out.end = `${e.pts} PV par tag ${e.perTag.map(k => TAG_NAMES[k]).join(' et ')}.`;
    else if (e.perWheel) out.end = e.perWheel < 1 ? `1 PV par ${Math.round(1 / e.perWheel)} ouvriers sur votre roue.` : `${e.perWheel} PV par ouvrier sur votre roue.`;
    else if (e.adjAny) out.end = `${e.adjAny} PV par bâtiment adjacent.`;
    else if (e.adjTag) out.end = `${e.pts} PV par bâtiment ${TAG_NAMES[e.adjTag]} adjacent.`;
    else if (e.corner) out.end = `${e.corner} PV si ce bâtiment est dans un coin de votre ville.`;
    else if (e.guildTotal) out.end = `1 PV par ${e.guildTotal} cartes de guilde que vous possédez.`;
    else if (e.atLvl) out.end = `${e.pts} PV par ouvrier de niveau ${e.atLvl}${e.atLvl < 5 ? ' ou plus' : ''} sur votre roue.`;
    else if (e.bronze) out.end = `${e.bronze} PV par ouvrier de niveau 1 ou 2 sur votre roue.`;
    else if (e.markers) out.end = `${e.markers} PV par marqueur à vous sur les Merveilles.`;
    else if (e.perPlans) out.end = `${e.perPlans} PV par Savoir non dépensé.`;
    else if (e.guildMax) out.end = `${e.guildMax} PV par carte de votre plus grande guilde.`;
    else if (e.guild) out.end = `${e.pts} PV par carte ${GUILD_NAMES[e.guild]} dans votre guilde.`;
    else if (e.guildEach) out.end = `${e.guildEach} PV par série Artisans + Érudits + Marchands.`;
    else if (e.lines) out.end = `${e.lines} PV par ligne ou colonne complète de votre ville.`;
  }
  if (c.req) {
    if (c.req.wonder) out.req = c.req.wonder > 1 ? `Avoir des marqueurs sur ${c.req.wonder} Merveilles.` : 'Avoir au moins 1 marqueur sur une Merveille.';
    else if (c.req.tags.all) out.req = 'Avoir 1 tag de chaque type.';
    else out.req = 'Avoir ' + Object.entries(c.req.tags).map(([k, n]) => `${n} ${TAG_NAMES[k]}`).join(' et ') + '.';
  }
  if (c.sx) out.sx = 'Les ouvriers dépensés pour ce bâtiment quittent votre roue (réserve générale).';
  if (c.gd && c.g !== 'voy') out.gd = `Coûte 1 de moins par carte ${GUILD_NAMES[c.g]} dans votre guilde (max 3).`;
  if (c.d) out.disc = opsTxt(c.d);
  return out;
}
function guildText(g, opts) {
  const fx = (opts && opts.guildFixed) || GUILD_FIXED;
  if (!opts || opts.matrix !== false) return g === 'voy' ? 'Joker : rangez-la dans la rangée de votre choix et appliquez l’effet de cette rangée.' : { mar: 'Gagnez 1 ouvrier de niveau 0 / 1 / 2 / 3 / 4 / 5 selon le rang de la carte.', art: '1 / 2 / 3 / 4 / 5 / 6… niveaux à répartir selon le rang de la carte.', eru: 'Gagnez 1 / 2 / 3 / 4 / 5 / 6… Savoir selon le rang de la carte.' }[g];
  if (g === 'voy') return 'Joker : rangez-la dans la guilde de votre choix, qui s’active.';
  return opsTxt(fx[g]) + (fx[g].some(o => o.fb) ? ' Si c’est impossible, prenez 1 Plan à la place.' : '');
}
function wonderText(W) {
  const v = W.vals.join(' / ');
  let s = W.by ? `${v} PV × ${WONDER_BY[W.by]}` : W.multG ? `${v} PV × nb de cartes de guilde ${GUILD_NAMES[W.multG]}` : W.mult ? `${v} PV × nb de ${TAG_NAMES[W.mult]}` : `${v} PV`;
  if (W.bonus) s += ' + ' + opsTxt(W.bonus).replace(/^./, m => m.toLowerCase());
  return s;
}

/* ---------- Export tableur (Google Sheets) ---------- */
function exportTables(opts) {
  const o = Object.assign({}, DEFAULT_OPTS, opts || {});
  const fx = GUILD_FIXED;
  const tagStr = t => Object.entries(t).map(([k, v]) => (v > 1 ? v + ' ' : '') + TAG_NAMES[k]).join(', ');
  const cards = [['ID', 'Nom', 'Niveau', 'Symbole de guilde (réduction)', 'Tags apportés', 'Coût', 'Cadre', 'Sacrifice', 'Prérequis', 'Réduction de guilde', 'PV', 'Immédiat', 'Activation', 'Permanent', 'Fin de partie']];
  for (const c of CARDS) {
    const t = cardText(c);
    cards.push([c.id, c.name, c.lvl, GUILD_NAMES[c.g] || '', tagStr(c.t) || 'aucun', cardValue(c), c.f === 'or' ? 'Or (niveau 5)' : c.f === 'ag' ? 'Argent (niveau 3+)' : c.f === 'br' ? 'Bronze (niveaux 1-2 uniquement)' : '', c.sx ? 'oui' : '', t.req || '', c.gd && c.g !== 'voy' ? '−1 par carte ' + GUILD_NAMES[c.g] + ' (max 3)' : '', c.pv, t.imm || '', t.act || '', t.perm || '', t.end || '']);
  }
  const wonders = [['ID', 'Merveille', '1er marqueur', '2e marqueur', '3e marqueur', 'Multiplicateur', 'Bonus', 'Texte']];
  for (const W of WONDERS) wonders.push([W.id, W.name, W.vals[0], W.vals[1], W.vals[2], W.by ? WONDER_BY[W.by] : W.multG ? 'nb de cartes ' + GUILD_NAMES[W.multG] : W.mult ? 'nb de ' + TAG_NAMES[W.mult] : '', W.bonus ? opsTxt(W.bonus) : '', wonderText(W)]);
  const theme = { art: 'Expérience : des niveaux à répartir', eru: 'Savoir : une ressource qui réduit les coûts ou fait ignorer un prérequis ou un cadre', mar: 'Population : gagner des ouvriers', voy: 'Joker : rangée au choix' };
  const guilds = [['Guilde', 'Thème', 'Nombre de cartes de guilde', 'Bâtiments avec réduction de cette guilde']];
  for (const g of ['art', 'eru', 'mar', 'voy']) guilds.push([GUILD_NAMES[g], theme[g], GCARDS.filter(c => c.g === g).length, CARDS.filter(c => c.gd && c.g === g).length]);
  const gcards = [['Rangée', '1re carte', '2e carte', '3e carte', '4e carte', '5e carte', '6e carte et suivantes', 'Cartes dans le paquet']];
  for (const g of ['mar', 'art', 'eru']) gcards.push([GUILD_NAMES[g], ...[1, 2, 3, 4, 5, 6].map(k => matrixText(g, k)), GCARDS.filter(c => c.g === g).length]);
  gcards.push(['Voyageurs (joker)', 'Rangée au choix : appliquez l’effet de cette rangée', '', '', '', '', '', GCARDS.filter(c => c.g === 'voy').length]);
  gcards.push(['Colonne complète', 'Dès qu’une colonne contient une carte de chaque guilde : tournez votre roue', '', '', '', '', '', '']);
  gcards.push(['Savoir', '1 Savoir = 1 de moins sur le coût d’un bâtiment (utilisé automatiquement). 2 Savoir = ignorer le prérequis et le cadre d’un bâtiment.', '', '', '', '', '', '']);
  const tags = [['Tag', 'Cartes niveau 1 (tags apportés)', 'Cartes niveau 2 (tags apportés)']];
  for (const k of ['P', 'M', 'S', 'C', 'J']) tags.push([TAG_NAMES[k], CARDS.filter(c => c.lvl === 1).reduce((a, c) => a + (c.t[k] || 0), 0), CARDS.filter(c => c.lvl === 2).reduce((a, c) => a + (c.t[k] || 0), 0)]);
  const settings = [['Réglage', 'Valeur par défaut']];
  const lbl = { startWheel: 'Roue de départ (ouvriers par niveau 0→5)', endWonders: 'Fin : marqueurs sur les Merveilles (0 = 2 par joueur)', wonderScoring: 'Score des Merveilles', market: 'Cartes visibles par niveau', costMode: 'Coûts', wonderMode: 'Marqueurs sur les Merveilles', retireStep: 'Taille de la zone de retraite (retraités pour 1 marqueur)', supply: 'Ouvriers dépensés', recruitCap: 'Limite de recrutement en case 0', guildChoice: 'Tour : une carte de guilde, puis construire ou tourner la roue', copies1: 'Exemplaires des cartes niveau 1', copies2: 'Exemplaires des cartes niveau 2' };
  const human = { arrival: 'À l’arrivée du marqueur', end: 'En fin de partie', sum: 'Somme des niveaux', levels: 'Niveau minimum par ouvrier', track: 'Zone de retraite (2 retraités = 1 marqueur)', auto: '1 marqueur à chaque retraite', consecrate: 'Consacrer volontairement un vétéran', cycle: 'Reviennent au niveau 0 de la roue', general: 'Partent dans la réserve générale' };
  settings.push(['Cartes de guilde visibles', '4'], ['Cartes de guilde dans le paquet', String(GCARDS.length)], ['Bâtiments par niveau', String(CARDS.filter(c => c.lvl === 1).length)]);
  for (const k in lbl) { let v = o[k]; if (Array.isArray(v)) v = "'" + v.join(', '); if (typeof v === 'boolean') v = v ? 'oui' : 'non'; if (human[v]) v = human[v]; settings.push([lbl[k], String(v)]); }
  return { 'Cartes': cards, 'Cartes de guilde': gcards, 'Merveilles': wonders, 'Guildes': guilds, 'Tags': tags, 'Réglages': settings };
}
const API = {
  GCARDS, TAGS, TAG_NAMES, GUILDS, GUILD_FIXED, GUILD_NAMES, prereqOk, CARDS, BASE_CARDS, BASE_WONDERS, applyOverrides, BY_ID, WONDERS, W_BY_ID, DEFAULT_OPTS,
  cardValue, discountFor, frameMin, newGame, apply, resolve, clone, canAct, mainOptions, pendingOptions, legalCells, effectiveCost, autoPay, payOk,
  tagCounts, hasAllTypes, diffTags, scoreOf, endPoints, wheelCount, placedOnWonders, wonderPoints,
  retireNeed, botTurn, botTurnBasic, botResolve, evalPlayer, cardText, wonderText, guildText, exportTables, opsTxt, matrixOps, matrixText, guildColumns, BYPASS_COST,
};
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.Empires = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
