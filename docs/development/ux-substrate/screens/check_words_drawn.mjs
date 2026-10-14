// Every sentence a member reads on a screen is a keyed word, word for word (K3268). Render every screen of ../layouts.html
// in a browser (plain, and in each variant a journey or wizard step draws it in, with and without the assistant), take the
// text each screen draws, and match it against words.json: exactly, or as an instance of a key's {placeholder} template
// (its placeholders may hold at most 70% of the sentence, less any keyed word or words people wrote they hold). Counted are
// the drawn sentences of four words or more: each is matched whole and, failing that, part by part where " · " or " › "
// joins it. Not counted: the mockup's own controls (.mk-mockctl); words people wrote (.rec, as the visual language marks a
// question, a passage or a reading; a field's typed value; a sentence wholly in quotation marks; a template's placeholder in
// quotation marks, "{reason}"); the mockup's sample records marked .mk-data (a reading's name, a document's title: an
// instance, never a fixed word; unstyled); and parts that are only sample data (numbers, dates and names).
// Prints each screen's unmatched count and FAILS if any screen's count exceeds its baseline in words-drawn-baseline.json
// (a ratchet: counts may only fall; a screen with no baseline has a baseline of 0). Run it after check_walk.mjs.
// Usage: node check_words_drawn.mjs                    check against the baseline (run after check_walk.mjs)
//        node check_words_drawn.mjs --write-baseline   write the current counts as the baseline (refused if any rose)
//        node check_words_drawn.mjs --list <screen>    also print that screen's unmatched sentences ("all" for every screen)
//        node check_words_drawn.mjs --json <file>      also write every unmatched sentence, by screen, to <file>
// Needs Playwright: set PW to its module path if it is not resolvable, and PW_CHROMIUM to a browser if its own is missing.
import { createRequire } from 'module';
import fs from 'fs'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const here = path.dirname(url.fileURLToPath(import.meta.url));
const BASE = path.join(here, 'words-drawn-baseline.json');
const argv = process.argv.slice(2);
const opt = n => { const i = argv.indexOf(n); return i < 0 ? null : (argv[i + 1] || ''); };
const WRITE = argv.includes('--write-baseline'), LIST = opt('--list'), JSONOUT = opt('--json');

// 1. What each screen draws: text segments, split at every block, control and mark
const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.join(here, '..', 'layouts.html')); await p.waitForTimeout(300);
const drawn = await p.evaluate(() => {
  const W = window.CS_WALK, st = W.st, pairs = new Map();
  const add = (s, v, ai) => { const k = s + '|' + (v || '') + '|' + ai; if (!pairs.has(k)) pairs.set(k, { s, v, ai }); };
  for (const r of REG) { add(r.id, undefined, true); add(r.id, undefined, false); }
  for (const j of J) for (const ai of [true, false]) { st.mode = 'journey'; st.id = j.n; st.ai = ai; st.step = 0; for (const x of W.stepsNow()) add(x.s, x.v, ai); }
  const box = document.createElement('main'); document.body.appendChild(box);
  const SEPCLS = /\b(cs-btn|mk-tag|cs-tag|cs-band|cs-grade|cs-strength|cs-kind|cs-due|cs-origin|cs-gap|cs-hint|cs-hunch|cs-changed|cs-tension|cs-risk)\b/;
  const SEPTAG = new Set(['BUTTON', 'SELECT', 'OPTION', 'INPUT', 'TEXTAREA', 'LABEL', 'BR', 'IMG']);
  const res = {};
  for (const { s, v, ai } of pairs.values()) {
    box.innerHTML = W.render(s, { ai, v, dockAssist: s === 'assistant' });
    box.querySelectorAll('.mk-mockctl, script, style').forEach(e => e.remove());
    box.querySelectorAll('textarea').forEach(e => { e.textContent = ''; });   // what a member typed in a field: data
    box.querySelectorAll('.rec:not(input, textarea, select), .mk-data').forEach(e => e.replaceWith('⁂'));   // words people wrote, sample records: data
    const segs = []; let cur = '';
    const flush = () => { const t = cur.replace(/\s+/g, ' ').trim(); if (t) segs.push(t); cur = ''; };
    // a flex or grid container blockifies its children: where it also holds text of its own, they are words of one sentence
    const INL = new Set(['A', 'SPAN', 'B', 'I', 'EM', 'STRONG', 'CODE', 'MARK', 'SMALL', 'ABBR']);
    const walk = n => { const run = n.nodeType === 1 && /flex|grid/.test(getComputedStyle(n).display) && [...n.childNodes].some(x => x.nodeType === 3 && x.nodeValue.trim());
      for (const ch of n.childNodes) {
      if (ch.nodeType === 3) { cur += ch.nodeValue; continue; }
      if (ch.nodeType !== 1 || ch.tagName.toLowerCase() === 'svg') continue;
      const d = getComputedStyle(ch).display;
      const sep = (!d.startsWith('inline') && !(run && INL.has(ch.tagName) && d !== 'none')) || d === 'none' || SEPTAG.has(ch.tagName) || SEPCLS.test(typeof ch.className === 'string' ? ch.className : '');
      if (ch.placeholder) { flush(); segs.push(ch.placeholder.trim()); }
      if (sep) { flush(); walk(ch); flush(); } else walk(ch);
    } };
    walk(box); flush();
    res[s] = res[s] || new Set(); segs.forEach(t => res[s].add(t));
  }
  box.remove();
  const o = {}; for (const k in res) o[k] = [...res[k]]; return o;
});
await b.close();
if (errs.length) { for (const e of errs) console.log('SCRIPT ERROR:', e); console.log('FAILED'); process.exit(1); }

// 2. The keyed words: exact sentences, and {placeholder} templates
const norm = t => String(t).replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const SPL = /(?<=[.!?⁂])(?<!\b(?:[A-Z]|Prof|Gov|Dr|Mr|Ms|Mrs|St|No)\.)\s+(?=[A-Z"({])/;   // never after an initial ("L. Chen")
const sents = t => t.split(SPL).map(x => x.trim()).filter(Boolean);
const bare = t => t.replace(/[.:…]$/, '');   // a closing period or colon, or the ellipsis of a button that asks more
const PH = /\{[A-Za-z_][\w.]*\}/;
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const exact = new Set(), tmpl = [];
const REC = '⁂';   // stands where the drawing shows words people wrote (.rec, .mk-data)
for (const w of JSON.parse(fs.readFileSync(path.join(here, 'words.json'), 'utf8')).words) {
  const en = norm(w.en);
  // the whole, each sentence, and each part of a line joined by " · " (a key drawn after a name: "· not public · …")
  const units = new Set([en, ...sents(en), ...en.split(/(?:^|\s)·(?:\s|$)/).map(x => x.trim()).filter(x => x.includes(' '))]);
  for (const u0 of units) {
    if (PH.test(u0)) {
      const u = u0.replace(/"(\{[A-Za-z_][\w.]*\})"/g, '$1');   // a quoted placeholder takes its quotation marks with it
      const parts = u.split(new RegExp(PH.source, 'g'));
      if (parts.join('').replace(/[^A-Za-z]/g, '').length < 6) continue;   // too little fixed text to tell a template from data
      const lit = parts.reduce((a, x) => x.length > a.length ? x : a, '');
      tmpl.push({ re: new RegExp('^' + parts.map(esc).join('(.+?)') + '$'), lit });
    } else { exact.add(u0); exact.add(bare(u0)); }
  }
}
// a placeholder's text is not the template's data when it is words people wrote (quoted, or drawn as such) or is itself
// a keyed word; the rest may be at most 70% of the sentence, so a template cannot pass off a sentence of other words
const free = x => /^"[^"]*"$/.test(x) || /^[\s"'.,:;…]*$/.test(x.split(REC).join('')) || exact.has(x) || exact.has(bare(x));
const matched = s => {
  if (exact.has(s) || exact.has(bare(s))) return true;
  for (const t of tmpl) if (s.includes(t.lit)) {
    const m = t.re.exec(s) || t.re.exec(bare(s));
    if (!m) continue;
    const g = m.slice(1), skip = g.reduce((a, x) => a + (free(x) ? x.length : 0), 0);
    if (g.reduce((a, x) => a + (free(x) ? 0 : x.length), 0) <= 0.7 * (s.length - skip)) return true;
  }
  return false;
};
// sample data only: every word a number, a date, a capitalized name, or a joining word
// ("Set by Rosa on 2 October" and "For Prof. N. Iyer" are sentences about data, not data)
const JOIN = new Set(['of', 'and', 'the', 'a', 'at', 'in', 'on', 'to', 'de', 'la', 'y', 'am', 'pm']);
const sample = s => { if (/^"[^"]+"$/.test(s)) return true;   // wholly a quotation: words people wrote
  const ws = s.match(/[\p{L}\p{N}][\p{L}\p{N}'’.$%-]*/gu) || [];
  return !ws.some(x => x === 'by') && !/^(For|From|With|To)$/.test(ws[0]) && ws.every(x => /^[\p{N}$]/u.test(x) || /^\p{Lu}/u.test(x) || JOIN.has(x.toLowerCase())); };
const nwords = s => (s.match(/\p{L}[\p{L}\p{N}'’-]*/gu) || []).length;

// 3. Count each screen's drawn sentences that are not keyed
const unmatched = {};
for (const [sid, segs] of Object.entries(drawn)) {
  const um = new Set();
  const ok = x => nwords(x) < 4 || matched(x) || sample(x);
  // words people wrote may sit between keyed words ("Concluded by {who}, {date}:" then the claim): each side is matched
  const okRec = x => ok(x) || (x.includes(REC) && x.split(REC).every(y => ok(y.trim())));
  for (const seg0 of segs) {
    const seg = norm(seg0);
    if (matched(seg)) continue;
    // each sentence, whole; failing that, each of its parts joined by " · " or " › " ("Settings › Security" stays whole)
    for (const s of sents(seg)) {
      if (okRec(s)) continue;
      for (const part of s.split(/(?:^|\s)[·›](?:\s|$)/).map(x => x.trim()).filter(Boolean)) if (!okRec(part)) um.add(part);
    }
  }
  unmatched[sid] = [...um];
}
const ids = Object.keys(unmatched).sort();
const now = Object.fromEntries(ids.map(s => [s, unmatched[s].length]));
const total = Object.values(now).reduce((a, x) => a + x, 0);
const base = fs.existsSync(BASE) ? JSON.parse(fs.readFileSync(BASE, 'utf8')).screens : null;
if (JSONOUT) fs.writeFileSync(JSONOUT, JSON.stringify(unmatched, null, 1) + '\n');
console.log('unmatched drawn sentences by screen: ' + ids.map(s => `${s} ${now[s]}` + (base && base[s] !== undefined && base[s] !== now[s] ? ` (baseline ${base[s]})` : '')).join(', '));
if (LIST) for (const s of ids) if (LIST === 'all' || LIST === s) for (const t of unmatched[s]) console.log(`  ${s}: ${t}`);
const rose = base ? ids.filter(s => now[s] > (base[s] ?? 0)) : [];
for (const s of rose) console.log(`FAIL: screen ${s} draws ${now[s]} sentences that are not keyed words, more than its baseline of ${base[s] ?? 0}; key them in words-t49.src.py (or the newest words file), or draw the keyed words`);
if (WRITE) {
  if (rose.length) { console.log('FAILED: the baseline only falls; key the new sentences first'); process.exit(1); }
  fs.writeFileSync(BASE, JSON.stringify({ _note: 'Written by check_words_drawn.mjs --write-baseline: each screen\'s drawn sentences that are not yet keyed words (K3268). A ratchet: counts may only fall.', total, screens: now }, null, 1) + '\n');
  console.log(`baseline written: ${total} unmatched sentences on ${ids.length} screens`);
  process.exit(0);
}
if (!base) { console.log('FAILED: no baseline; write one with --write-baseline'); process.exit(1); }
console.log(`${total} drawn sentences on ${ids.length} screens are not yet keyed words (baseline ${JSON.parse(fs.readFileSync(BASE, 'utf8')).total})`);
console.log(rose.length ? 'FAILED' : 'All checks pass.');
process.exit(rose.length ? 1 : 0);
