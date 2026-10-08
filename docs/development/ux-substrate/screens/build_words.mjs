// The interface's word list for translation (DEC-157, DEC-179; BOB's B90 for N669 and N670): every fixed word and phrase
// the member screens use, each with the stable key a translation is known by and whether it is protected (DEC-157 (4)).
// Read from the same sources the mockups are drawn from, so the list cannot drift from the screens:
// mock-acts.js (ACT_HELP), mock-kit.js (WNAME, WEIGHT, OUTWARD, the draft labels), mock-shell.js (RAIL, TABS, the guide),
// mock-refs.js (SCREEN_HELP, RAIL_HELP, COL_HELP), page.src.html (the marks' explanations), registry.json (screen and act
// names), library.json (Civicsmith's wizard scripts). Sentences on a screen that carry its data (names, counts, dates) are
// not here: they become keyed strings with placeholders when each screen is built, under the same key scheme and rules.
// Run: node docs/development/ux-substrate/screens/build_words.mjs   (writes words.json beside it; fails on any drift)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const R = f => fs.readFileSync(path.join(HERE, f), 'utf8');
const fail = m => { console.error('build_words: ' + m); process.exit(1); };

// the mockup scripts, evaluated as the page evaluates them (functions that touch the DOM are never called here)
const ctx = vm.createContext({ console, CSS: { escape: s => s } });
const js = ['mock-acts.js', 'mock-kit.js', 'mock-screens.js', 'mock-shell.js', 'mock-refs.js'].map(R).join('\n')
  + '\n;globalThis.__W = { ACT_HELP, WNAME, WEIGHT, OUTWARD: [...OUTWARD], RAIL, TABS, SCREEN_HELP, RAIL_HELP, COL_HELP, WRITE_ACT };';
vm.runInContext(js, ctx);
const W = ctx.__W;
const page = R('page.src.html');
const shell = R('mock-shell.js');
const kit = R('mock-kit.js');
const g0 = page.indexOf('var G = {'), g1 = page.indexOf('window.CS_LEVEL', g0);
if (g0 < 0 || g1 < 0) fail('the marks table (var G) was not found in page.src.html');
const G = vm.runInNewContext('(' + page.slice(g0 + 'var G = '.length, g1).trim().replace(/;\s*$/, '') + ')');
const reg = JSON.parse(R('registry.json')).screens;
const lib = JSON.parse(R('library.json')).scripts;

const plain = s => String(s).replace(/<span class=["']?more["']?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const words = [];
const seen = new Set();
const add = (key, en, prot, source, note) => {
  if (seen.has(key)) fail('duplicate key ' + key);
  if (!en || !String(en).trim()) fail('empty text for ' + key);
  seen.add(key);
  if (/\b(DEC|K)-?\d{2,4}\b|\bN\d{3}\b/.test(plain(en))) fail(`an internal code in member words: ${key}`);
  words.push({ key, en: plain(en), protected: !!prot, source, ...(note ? { note } : {}) });
};
// a phrase written here by hand must appear, word for word, in the source it names (a drift guard)
const must = (src, name, s) => { if (!src.includes(s)) fail(`"${s}" is no longer in ${name}`); return s; };
const opkey = op => op.startsWith('owed:') ? 'owed_' + op.slice(5).split(' ')[0] : op;
const weightOf = op => W.WEIGHT[opkey(op)] || 2;

// 1. Weights: the five names and what each means (protected: the weights, DEC-157 (4))
W.WNAME.forEach((n, i) => { if (!i) return; add(`weight.${n.toLowerCase()}.name`, n, true, 'mock-kit.js WNAME'); });
for (const [n, t] of Object.entries(G.weight)) add(`weight.${n.toLowerCase()}.means`, t, true, 'page.src.html marks');
add('weight.dots.means', must(page, 'page.src.html', 'The dots show how much the act weighs, from one to five.'), true, 'page.src.html marks');

// 2. The marks: fixed terms (protected)
for (const [k, [name, means]] of Object.entries(G.scale)) {
  add(`mark.scale.${k}.name`, name, true, 'page.src.html marks');
  add(`mark.scale.${k}.means`, means, true, 'page.src.html marks');
}
add('mark.grade.reading', must(page, 'page.src.html', 'A is easiest to check; D rests on a person\\\'s word. A grade never says whether something is true.').replace(/\\'/g, "'"), true, 'page.src.html marks');
for (const [k, t] of Object.entries(G.gap)) { add(`mark.gap.${k}.name`, (t.match(/<b>([^<]+)<\/b>/) || [])[1], true, 'page.src.html marks'); add(`mark.gap.${k}.means`, t, true, 'page.src.html marks'); }
for (const [k, t] of Object.entries(G.origin)) { add(`mark.origin.${k}.name`, (t.match(/<b>([^<]+)<\/b>/) || [])[1], true, 'page.src.html marks'); add(`mark.origin.${k}.means`, t, true, 'page.src.html marks'); }
for (const [k, t] of Object.entries(G.kind)) { add(`mark.kind.${k}.name`, (t.match(/<b>([^<]+)<\/b>/) || [])[1], true, 'page.src.html marks'); add(`mark.kind.${k}.means`, t, true, 'page.src.html marks'); }
for (const [k, t] of Object.entries(G.path)) add(`mark.path.${k.toLowerCase().replace(/\s+/g, '-')}.means`, t, true, 'page.src.html marks');
const fixed = [
  ['mark.strength.means', 'An answer is only as strong as the weakest thing it depends on'],
  ['mark.due.means', 'counted on your group\\\'s local day.'],
  ['mark.hint.means', 'something the machine marked worth a look, with how it was found and out of how many. A lead, never a finding.'],
  ['mark.hunch.means', 'a member\\\'s suspicion, labelled as one. Never evidence, and it never moves a finding.'],
  ['mark.outward.means', 'this leaves your group\\\'s Civicsmith. Someone outside will see it.'],
  ['mark.band.means', 'this band says who can see what you are working on.'],
];
const tipLine = (key, frag) => {
  must(page, 'page.src.html', frag);
  const i = page.indexOf(frag), a = page.lastIndexOf("'", i - 1), b = page.indexOf("'", i + frag.length);
  // the whole quoted string the fragment sits in, as tipFor returns it
  let s = page.slice(a + 1, b);
  while (s.endsWith('\\')) { const c = page.indexOf("'", b + 1); s = page.slice(a + 1, c); }
  return s.replace(/\\'/g, "'");
};
for (const [key, frag] of fixed) add(key, tipLine(key, frag), true, 'page.src.html marks');
add('mark.tag.protected.means', tipLine('', 'it protects members, so a change to it needs a second check before it shows'), true, 'page.src.html marks');
add('mark.tag.local-name.means', tipLine('', 'the official name stays as it is, with an explanation in the member'), true, 'page.src.html marks');
add('mark.hint.label', must(kit, 'mock-kit.js', 'Hint · machine work'), true, 'mock-kit.js hint');
add('mark.kind.todo.label', 'To do', true, 'mock-kit.js kindm');
add('mark.kind.noticed.label', 'Noticed', true, 'mock-kit.js kindm');
add('mark.kind.status.label', 'Status', true, 'mock-kit.js kindm');
for (const p of ['Working', 'Shared for review', 'Published']) add(`mark.path.${p.toLowerCase().replace(/\s+/g, '-')}.name`, must(kit, 'mock-kit.js', `'${p}'`).slice(1, -1), true, 'mock-kit.js pathm');

// 3. The ordinary states (DEC-98): one vocabulary everywhere ("Undetermined, because…" is a fixed term, protected)
add('state.empty', 'Nothing here', false, 'DEC-98');
add('state.loading', 'Still loading', false, 'DEC-98');
add('state.failed', 'Could not read this, because {reason}', false, 'DEC-98', 'the reason always follows');
add('state.undetermined', 'Undetermined, because {reason}', true, 'DEC-98', 'the reason always follows');

// 4. Labelled drafts (DEC-120 G5, DEC-153): who wrote what is in a field
for (const [k, s] of [['machine', 'Draft by the assistant, at your request · edit it until it is yours'], ['template', 'Draft from your group\\\'s template · edit it until it is yours'], ['wizard', 'Draft from the wizard · edit it until it is yours']])
  add(`draft.${k}.label`, must(kit, 'mock-kit.js', s).replace(/\\'/g, "'"), false, 'mock-kit.js field');
add('draft.writing-help.act', 'Help me write this', false, 'mock-kit.js writeHelp');

// 4a. Photos in a published case (DEC-180, DEC-183): the reminder, the copy's label and the Photos step's words (protected: they say
//     who can see something)
const scr = R('mock-screens.js');
add('photo.reminder', must(scr, 'mock-screens.js', 'Frame what you are checking, and leave out people\\\'s faces and number plates where you can. If a published case relies on this photo, anyone in it who is not part of a finding, and any number plate, is obscured in the public copy; the original stays inside your group.').replace(/\\'/g, "'"), true, 'mock-screens.js PHOTO_REMINDER');
add('photo.obscured.label', must(scr, 'mock-screens.js', 'Faces and plates obscured for publication; the group holds the original'), true, 'mock-screens.js ceremony', 'the label the published copy carries');
add('photo.step.gate', must(scr, 'mock-screens.js', 'Every photo the case relies on must be checked before signing: marked, or “nothing to obscure”. A mark that covers the wrong thing is withdrawn with a reason, never erased. Text read from a photo, such as a number plate, is never published with it; a passage you quote in the case still is.'), true, 'mock-screens.js ceremony');
add('photo.state.nothing', must(scr, 'mock-screens.js', 'nothing to obscure'), true, 'mock-screens.js ceremony');
add('photo.refused.format', 'This photo\'s format can\'t be obscured: {photo}. Capture it again as an ordinary photo, or stop relying on it.', true, 'DEC-183', 'PHOTO_NOT_COVERABLE');
add('photo.refused.changed', 'A mark changed after this case was prepared. Prepare it again before signing.', true, 'DEC-183', 'PHOTO_MARKS_CHANGED_SINCE');
add('photo.refused.unchecked', 'Signing waits until every photo the case relies on is checked: {photo}.', true, 'DEC-183', 'the Photos step as a gate');

// 5. The frame: rail, phone tabs, explanation levels
for (const [k, name] of W.RAIL) { add(`rail.${k}.name`, name, false, 'mock-shell.js RAIL'); if (W.RAIL_HELP[k]) add(`rail.${k}.holds`, W.RAIL_HELP[k], false, 'mock-refs.js RAIL_HELP'); }
for (const [k, name] of W.TABS) if (!W.RAIL.some(r => r[0] === k)) add(`tab.${k}.name`, name, false, 'mock-shell.js TABS');
add('tab.more.holds', must(shell, 'mock-shell.js', 'projects, people and settings.'), false, 'mock-shell.js decorate');
add('level.prompt.name', 'Explain promptly', false, 'DEC-175');
add('level.pause.name', 'On a longer pause', false, 'DEC-175');

// 6. The wizard guide (DEC-120, DEC-121): the guide's own words, around each script's step
add('guide.stopping', must(shell, 'mock-shell.js', 'Stopping is fine: nothing is lost, and nobody is told.'), false, 'mock-shell.js wizardGuide');
add('guide.showwhere', must(shell, 'mock-shell.js', 'Show me where'), false, 'mock-shell.js wizardGuide');
add('guide.sidetrip', 'Side trip: {wizard}. When it finishes or you stop it, you come back to this step.', false, 'mock-shell.js wizardGuide', 'the wizard\'s name in place of {wizard}');
must(shell, 'mock-shell.js', 'When it finishes or you stop it, you come back to this step.');
add('guide.draft', must(shell, 'mock-shell.js', 'This step places a labelled draft in the field. It becomes yours only when you keep or edit it.'), false, 'mock-shell.js wizardGuide');
add('guide.press', must(shell, 'mock-shell.js', 'Press here when you\\\'re ready').replace(/\\'/g, "'"), false, 'mock-shell.js ring');
add('guide.step', 'step {i} of {n}', false, 'mock-shell.js wizardGuide');

// 7. Screens: each one's name and what it is for
for (const s of reg) {
  add(`screen.${s.id}.name`, s.name, false, 'registry.json');
  if (W.SCREEN_HELP[s.id]) add(`screen.${s.id}.purpose`, W.SCREEN_HELP[s.id], false, 'mock-refs.js SCREEN_HELP');
}

// 8. Acts: each act's name as each screen labels it (a fixed term: protected), and what it does (protected where the act is
//    signed, terminal, irreversible or outward: its explanation is the warning before it, DEC-157 (4))
for (const s of reg) for (const a of s.acts) {
  const k = `act.${opkey(a.op)}.label.${s.id}`;
  if (!seen.has(k)) add(k, a.label, true, 'registry.json');
}
for (const [op, t] of Object.entries(W.ACT_HELP)) add(`act.${op}.does`, t, weightOf(op.startsWith('owed_') ? 'owed:' + op.slice(5) : op) >= 3 || W.OUTWARD.includes(op), 'mock-acts.js ACT_HELP');
for (const s of reg) for (const a of s.acts) if (!W.ACT_HELP[opkey(a.op)]) fail(`no ACT_HELP for ${a.op} (screen ${s.id})`);

// 9. Table columns: the heading and what it shows
for (const [k, t] of Object.entries(W.COL_HELP)) {
  const [scr, head] = k.split('|');
  const slug = head.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  add(`column.${scr}.${slug}.name`, head, false, 'mock-refs.js COL_HELP');
  add(`column.${scr}.${slug}.shows`, t, false, 'mock-refs.js COL_HELP');
}
add('column.sort.how', must(shell, 'mock-shell.js', 'Click to sort the rows by this column; click again to reverse. Sorting changes only your view, never the record.'), false, 'mock-shell.js decorate');

// 10. Civicsmith's wizard library (DEC-148): each script's name and each step's what and why
for (const w of lib) {
  add(`wizard.${w.id}.name`, w.name, false, 'library.json');
  w.versions[0].steps.forEach((st, i) => {
    add(`wizard.${w.id}.step${i + 1}.what`, st.what, false, 'library.json');
    add(`wizard.${w.id}.step${i + 1}.why`, st.why, false, 'library.json');
  });
}

const out = {
  _note: 'The interface word list (DEC-179). Built by build_words.mjs from the mockups\' sources; never edit by hand. Keys are stable: a word keeps its key when its English changes, and a new word takes a new key. {name} marks a placeholder the screen fills.',
  protected_rule: 'DEC-157 (4): the fixed terms (grades and scales, the five gaps, origins, the queue\'s kinds, the path, the acts\' names), the weights, every warning and dialog before an outward, signed or irreversible act, the court notice, and every "who can see this" notice. A protected word changed from the assistant\'s draft, or typed without one, shows only after a second check.',
  for_builders: 'A sentence on a screen that carries its data (a name, a count, a date) is keyed when the screen is built: screen.<id>.<part>, with {placeholders}; it is protected when it is a warning or dialog before an outward, signed or irreversible act, the court notice ("What a court can reach"), or says who can see something.',
  counts: {},
  words,
};
for (const w of words) { const f = w.key.split('.')[0]; out.counts[f] = (out.counts[f] || 0) + 1; }
out.counts.total = words.length;
out.counts.protected = words.filter(w => w.protected).length;
fs.writeFileSync(path.join(HERE, 'words.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`words.json: ${words.length} words and phrases, ${out.counts.protected} protected · ` + Object.entries(out.counts).filter(([k]) => !['total', 'protected'].includes(k)).map(([k, v]) => `${k} ${v}`).join(', '));
