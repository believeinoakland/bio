// Walk every journey (with and without the assistant), every wizard and every screen of ../layouts.html in a browser,
// and prove: each step's control (its act) is drawn on its screen; every act the registry lists for a screen is drawn
// on it (acts that exist only with the assistant are exempt without it); no script error. Exit 1 on any failure.
// Usage: node check_walk.mjs   (needs Playwright; set PW to its module path if it is not resolvable)
import { createRequire } from 'module';
import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const here = path.dirname(url.fileURLToPath(import.meta.url));
const AI_ONLY = new Set(['airunopen', 'suggest', 'airunclose', 'optionadopt', 'optionpropose', 'owed:translationdraft DEC-127', 'whatchangedpropose']);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.join(here, '..', 'layouts.html')); await p.waitForTimeout(300);
const out = await p.evaluate((aiOnly) => { const AI_ONLY = new Set(aiOnly);
  const W = window.CS_WALK, st = W.st, fails = []; let walked = 0;
  const visit = (mode, id, ai, tag) => { st.mode = mode; st.id = id; st.ai = ai; st.step = 0;
    const steps = W.stepsNow();
    steps.forEach((x, i) => { st.step = i; W.draw(); walked++;
      if (document.querySelector('#vsay .miss')) fails.push(`${tag} step ${i + 1}: control ${x.act} not on ${x.s}`); }); };
  for (const j of J) { visit('journey', j.n, true, `journey ${j.n} (with)`); visit('journey', j.n, false, `journey ${j.n} (without)`); }
  for (const w of LIB) visit('wizard', w.id, true, `wizard "${w.name}"`);
  const box = document.createElement('div'); document.body.appendChild(box);
  for (const r of REG) for (const ai of [true, false]) {
    box.innerHTML = W.render(r.id, { ai, dockAssist: r.id === 'assistant' });
    for (const a of r.acts) { if (!ai && AI_ONLY.has(a.op)) continue;
      if (!box.querySelector(`[data-act="${CSS.escape(a.op)}"]`)) fails.push(`screen ${r.id} (${ai ? 'with' : 'without'}): act ${a.op} not drawn`); }
    const host = r.id === 'assistant' ? REG.find(q => q.id === 'question').acts : []; // the panel is drawn over the question screen
    const extra = [...box.querySelectorAll('[data-act]')].map(e => e.dataset.act).filter(o => !r.acts.some(a => a.op === o) && !host.some(a => a.op === o));
    for (const o of new Set(extra)) if (!['airunopen','suggest','airunclose'].includes(o)) fails.push(`screen ${r.id}: draws act ${o} the registry does not list`);
  }
  return { fails, walked, journeys: J.length, wizards: LIB.length, screens: REG.length };
}, [...AI_ONLY]);
await b.close();
for (const f of out.fails) console.log('FAIL:', f);
for (const e of errs) console.log('SCRIPT ERROR:', e);
console.log(`walked ${out.walked} steps: ${out.journeys} journeys with and without the assistant, ${out.wizards} wizards; ${out.screens} screens checked against the registry`);
console.log(out.fails.length || errs.length ? 'FAILED' : 'All checks pass.');
process.exit(out.fails.length || errs.length ? 1 : 0);
