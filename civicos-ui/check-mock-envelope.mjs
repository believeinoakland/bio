#!/usr/bin/env node
/* check-mock-envelope.mjs — THE D-173 GUARD (UI-23), the check-semantics
 * pattern applied to the one defect this codebase has now shipped five times.
 *
 * WHAT D-173 IS, in one sentence: the Durable Object wraps every answer it
 * gives as `{ok:true, result:<the store's own return>}` and the control plane
 * passes that through, so a surface that reads a field off the ANSWER instead
 * of off `result` sees `undefined` for everything and renders a perfectly
 * honest-looking empty screen. Found live on 2026-08-04; five instances closed
 * across UI-13 (17 reads at one seam), UI-16 (openBallotDialog, doBallot,
 * renderMembers) and UI-22 (doDispose); four more found by UI-22 and closed by
 * UI-23 (cite, retire, sever/reinstate, release — release twice).
 *
 * WHY A GUARD AND NOT ANOTHER FIX. Every one of those nine was GREEN in the
 * suite when it shipped, because the harness mock answered the one shape the
 * plane never sends. A mock that agrees with the defect is an equality that
 * costs nothing (CLAUDE.md), and no amount of fixing call sites prevents the
 * tenth. So the class is closed structurally, in two arms:
 *
 *   ARM A — THE SEAM IS THE ONLY DOOR (static, over app.html). `rec` and
 *     `recPost` speak to the plane. `recR`, `recPostR`, `actAsk` and
 *     `intentAsk` open the envelope. NOTHING ELSE IN THE FILE MAY CALL `rec`
 *     OR `recPost`, so there is no site left at which the envelope can be
 *     forgotten. This replaces the per-site unwrap (`const x = env.result !==
 *     undefined ? env.result : env`) that UI-22 had to write by hand and that
 *     the next site would have had to write again.
 *
 *   ARM B — A MOCK MUST ANSWER THE WIRE SHAPE (runtime, over every harness).
 *     Each suite is re-run with `test/envelope-probe.mjs` preloaded, which
 *     wraps the `fetch` every harness hands its `vm` context and records, per
 *     op, whether the answer carried `result`. Then each observation is checked
 *     against what the PLANE actually sends for that op. A suite whose mock
 *     answers a wrapped op flat FAILS, naming the suite and the op.
 *
 * THE WIRE MAP, and where it comes from. Most ops reach the browser through
 * `bio-plane/src/index.mjs`'s generic passthrough, whose one return is
 * `json({ ...body, store: storeName, tokenClass: cls })` over the DO's
 * `{ok:true, result:…}` — so they are WRAPPED. A short list of ops have their
 * own handler earlier in that file which FLATTENS the store's return
 * (`json({ok:true, ...r.result})`) or builds a literal answer of its own; those
 * are FLAT, and each is listed below with the evidence. Anything not named FLAT
 * is treated as WRAPPED, which is the right direction to fail in: a new op with
 * a new flattening handler makes this guard fail until somebody classifies it,
 * rather than silently passing.
 *
 * The check is BIDIRECTIONAL. A flat op answered WRAPPED is the same defect
 * mirrored — the surface would read `.result` off an answer that has none — and
 * fails here too. This is also what keeps the FLAT list from becoming a place
 * to silence an inconvenient failure.
 *
 * WHAT THIS GUARD DOES NOT DO, stated so nobody trusts it for more:
 *   - It cannot see an op no suite exercises. Arm B is only as wide as the
 *     harness. It reports its coverage so the gap is visible rather than
 *     assumed, and arm A is what actually protects the unexercised sites.
 *   - It does not check the shape of a REFUSAL. A control-plane refusal
 *     (`{ok:false,…}`, a throw) is legitimately flat and a store refusal
 *     legitimately rides inside `result`; only SUCCESS answers are judged.
 *   - It says nothing about whether a field READ off `result` is the right
 *     field. That is the suite's job.
 *   - Arm A is textual. It finds calls by name at the top level of app.html's
 *     one script block, where every function in that file is declared. A call
 *     smuggled through `globalThis["rec"]` would not be seen; nothing in this
 *     codebase does that, and the day something does, this comment is the
 *     receipt that it was a known limit rather than an oversight.
 *
 * Run from civicos-ui/ (test/run.mjs runs it):
 *
 *     node check-mock-envelope.mjs
 *
 * NEGATIVE CONTROL, RUN 2026-08-05, two arms, each restored byte-identical
 * (sha256 compared before and after — cite-act.test.mjs
 * 3dee25476df97358ccac7157fefed062d03377698c06369198236f46fcca7822, app.html
 * 4f45d78d57382e32f9dff4fb88e57e8e363816d7a772ac86437e22a5792f4466):
 *
 *   (a) THE GUARD'S OWN — unwrap one mock answer. In
 *       `test/cite-act.test.mjs`, change the `op === "select"` branch back to
 *       `return R({ ok:true, handle, kind:"enumerated", n:ids.length })` (the
 *       shape it shipped with). RUN: this guard exits 1 with
 *         FAIL: cite-act.test.mjs answers op=select UNWRAPPED (5 of 5 answers;
 *         top-level keys ["ok","handle","kind","n"]) …
 *       naming the suite and the op, and `node test/run.mjs` exits 1 with it.
 *       AND THE FINDING THAT MAKES THE ARM WORTH HAVING: `node
 *       test/cite-act.test.mjs` on its own still exits 0 — 131 assertions
 *       green over a mock that answers a shape the plane never sends. The seam
 *       is shape-agnostic by design, so the SWEEP alone cannot detect a wrong
 *       mock; only this guard can. That is the whole argument for arm B.
 *
 *   (b) THE OTHER DIRECTION — re-introduce one envelope read. In `app.html`,
 *       change `doCite`'s selection line back to
 *       `const s = await recPost("select", …); handle = s.handle;`. RUN: arm A
 *       fails, naming the function and the line —
 *         FAIL: app.html calls recPost() from doCite() (line 5399 of the script
 *         block) …
 *       AND — the point of correcting the mocks in the same turn —
 *       `cite-act.test.mjs` itself exits 1 against the now-WRAPPED mock, with
 *         FAIL and the act ran through op=cite
 *       because `s.handle` is `undefined` and no `op=cite` call carries the
 *       handle. Before the mock was corrected, the same edit left it green.
 *
 *   (c) ARM A OVER THE UNTOKENED SIBLING — in `app.html`, change `signIn`'s
 *       line back to `const l = await api("login", …)`. RUN: arm A fails with
 *         FAIL: app.html calls api() from signIn() (line 232 of the script
 *         block) …
 *       This arm exists because that is the shape D-173's sixth instance had,
 *       and NO harness reaches `signIn` — arm B is blind to it and always was.
 *       Restored byte-identical, app.html sha256
 *       37b23352da844222ff69c61366751d3d684df5661a0df4928592f766eb59560e.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import os from "os";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TESTDIR = path.join(HERE, "test");
const APP = path.join(HERE, "app.html");

const fails = [];
const notes = [];
const FAIL = m => fails.push(m);

/* ============================================================
   THE WIRE MAP
   ============================================================ */

/* Ops the control plane answers with its OWN handler, flat, rather than letting
   the passthrough wrap them. Each line is the evidence, so the list can be
   re-checked without re-deriving it. Verified 2026-08-05 against
   bio-plane/src/index.mjs. */
const FLAT_OPS = new Map(Object.entries({
  links:          'index.mjs op==="links" — json({ok:true, ...r.result})',
  acquire:        'index.mjs op==="acquire" — builds its own answer literal (ok, existed, document, snapshot)',
  attest:         'index.mjs op==="attest" — builds its own answer literal (ok, attempts, attestation, archive)',
  monitor:        'index.mjs op==="monitor" — builds its own answer literal (checked, status, revision, …)',
  archivelookup:  'index.mjs op==="archivelookup" — builds its own answer literal (address, eligible_because, chosen, rejected)',
  linkproject:    'index.mjs op==="linkproject" — json({ok:true, ...p.result})',
  governorstate:  'index.mjs op==="governorstate" — json({ok:true, ...r.result})',
  governorconfig: 'index.mjs op==="governorconfig" — json({ok:true, ...r.result})',
  knock:          'index.mjs op==="knock" — json({ok:true, ...c, object_type, body, basis, verification})',
  verify:         'index.mjs op==="verify" — json({ok:true, ...out.result})',
}));
const wireShapeOf = op => FLAT_OPS.has(op) ? "flat" : "wrapped";

/* ============================================================
   ARM A — the seam is the only door
   ============================================================ */

/* The four functions allowed to speak to `rec`/`recPost`, and what each is for.
   `rec`/`recPost` themselves are the transport; the other four are the seams
   that open the envelope. */
const SEAMS = new Set(["rec", "recPost", "recR", "recPostR", "actAsk", "intentAsk"]);
/* `api` is `rec`'s UNTOKENED sibling — the two endpoints reached before a
   session exists — and it carries exactly the same hazard. It was left out of
   the first draft of this rule, and a sweep that trusted the draft would have
   missed D-173's sixth instance: `signIn` read `l.token` off `api("login")`'s
   envelope, so no correct password ever signed anybody in and no wrong one ever
   showed the plane's reason. Neither `signIn` nor `pubList` is reached by any
   harness, so arm B could never have found it. Its seam is `apiR`. */
const API_SEAMS = new Set(["api", "apiR"]);

function armA(){
  const html = fs.readFileSync(APP, "utf8");
  const m = /<script>\n([\s\S]*?)\n<\/script>/.exec(html);
  if(!m){ FAIL("app.html has no runtime script block — arm A could not run at all"); return; }
  const src = m[1];
  const lines = src.split("\n");
  /* Every function in app.html's script is declared at the top level, so the
     enclosing function of a line is the nearest `function NAME(` above it that
     starts in column 0. */
  let cur = "(top level)";
  let seenSeams = new Set();
  for(let i = 0; i < lines.length; i++){
    const L = lines[i];
    const d = /^(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/.exec(L)
           || /^const\s+([A-Za-z0-9_$]+)\s*=\s*\(/.exec(L);   // `api` is an arrow at top level
    if(d){ cur = d[1]; if(SEAMS.has(cur) || API_SEAMS.has(cur)) seenSeams.add(cur); }
    /* Ignore comment bodies: this file explains the rule at length and the
       explanation names the functions. */
    const code = L.replace(/^\s*\*.*$/, "").replace(/\/\/.*$/, "");
    for(const call of code.matchAll(/(^|[^A-Za-z0-9_$.])(rec|recPost|api)\s*\(/g)){
      const name = call[2];
      if(d && d[1] === name) continue;                       // the declaration itself
      const family = name === "api" ? API_SEAMS : SEAMS;
      if(family.has(cur)) continue;                          // a seam may call its own transport
      const use = name === "api" ? "apiR" : "recR/recPostR";
      FAIL(`app.html calls ${name}() from ${cur}() (line ${i+1} of the script block) — `
         + `D-173's class: only the seams (${[...family].join(", ")}) may call this transport. `
         + `Use ${use}, which open the envelope for every op and are correct for the flat ones too.`);
    }
  }
  for(const s of [...SEAMS, ...API_SEAMS])
    if(!seenSeams.has(s))
      FAIL(`app.html no longer declares the seam ${s}() — arm A was checking a rule that no longer has a subject`);
  notes.push(`arm A: ${lines.length} lines of app.html's script read; the transports rec/recPost/api `
           + `are reached from these declarations and nowhere else — ${[...seenSeams].sort().join(", ")}`);
}

/* ============================================================
   ARM B — a mock must answer the wire shape
   ============================================================ */

/* THE SUITES THAT ACTUALLY DRIVE OPS, measured 2026-08-05 and pinned. Several
   harnesses stub a `fetch` and never reach an op — they exercise rendering,
   parsing or navigation — and a guard that demanded op traffic from them would
   be noise. What must never happen quietly is one of THESE going silent: that
   is the probe breaking, and a guard reporting green on nothing observed is the
   failure this file exists to prevent. A NEW suite with no op traffic is fine
   and needs no entry; an existing one that stops answering fails here. */
const SUITES_WITH_OP_TRAFFIC = [
  "act-attest.test.mjs", "act-ballot.test.mjs", "act-dispose.test.mjs", "act-proposal.test.mjs",
  "cite-act.test.mjs", "conclude-act.test.mjs", "document-page.test.mjs", "document-structure.test.mjs",
  "inquiry-page.test.mjs", "intent-write.test.mjs", "members-roster.test.mjs", "project-workspace.test.mjs",
  "queue.test.mjs", "record-list.test.mjs", "release-flow.test.mjs", "seals-backrestore.test.mjs",
  "subject-view.test.mjs",
];

function armB(){
  const probe = path.join(TESTDIR, "envelope-probe.mjs");
  if(!fs.existsSync(probe)){ FAIL("test/envelope-probe.mjs is missing — arm B cannot run"); return; }
  const suites = fs.readdirSync(TESTDIR).filter(f => f.endsWith(".test.mjs")).sort();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ui-envelope-"));
  let observed = 0, checked = 0;
  const opsSeen = new Set(), withTraffic = new Set();

  for(const suite of suites){
    const out = path.join(tmp, suite + ".json");
    let ran = true;
    try{
      execFileSync("node", ["--import", "file://" + probe, path.join(TESTDIR, suite)],
        { stdio:"pipe", env:{ ...process.env, UI_ENVELOPE_PROBE_OUT: out } });
    }catch(_){
      /* The suite's own failure is run.mjs's to report, not this guard's — but
         a suite that cannot run produced no evidence either way, and saying so
         is the difference between "clean" and "unmeasured". */
      ran = false;
    }
    let data = { calls:0, ops:[] };
    try{ data = JSON.parse(fs.readFileSync(out, "utf8")); }catch(_){}
    const rows = Array.isArray(data.ops) ? data.ops : [];
    if(rows.length) withTraffic.add(suite);

    if(!rows.length){
      if(!ran) notes.push(`arm B: ${suite} did not complete — no envelope evidence from it`);
      else if(SUITES_WITH_OP_TRAFFIC.includes(suite))
        FAIL(`${suite} is a pinned op-driving suite and the probe observed NO op answer from it `
           + `(${data.calls} fetch call${data.calls===1?"":"s"} seen) — either the suite stopped driving `
           + `the plane or the probe stopped reaching the mock. A guard that passes on nothing observed `
           + `is not a guard; establish which before removing it from the pin.`);
      continue;
    }
    for(const r of rows){
      opsSeen.add(r.op);
      observed += r.wrapped + r.flat;
      const want = wireShapeOf(r.op);
      checked++;
      if(want === "wrapped" && r.flat)
        FAIL(`${suite} answers op=${r.op} UNWRAPPED (${r.flat} of ${r.flat + r.wrapped} answers; `
           + `top-level keys ${JSON.stringify(r.sampleKeys || [])}) — the plane answers it through `
           + `index.mjs's passthrough as {ok:true, result:{…}, store, tokenClass}. A mock that answers the `
           + `one shape the plane never sends proves nothing about the read (D-173).`);
      if(want === "flat" && r.wrapped)
        FAIL(`${suite} answers op=${r.op} WRAPPED (${r.wrapped} of ${r.flat + r.wrapped} answers) — `
           + `but ${FLAT_OPS.get(r.op)}, so the real answer carries no 'result'. `
           + `Same defect mirrored: the surface would open an envelope that is not there.`);
    }
  }
  try{ fs.rmSync(tmp, { recursive:true, force:true }); }catch(_){}
  if(!observed) FAIL("arm B observed no op answers in any suite — the probe is not reaching the mocks");
  notes.push(`arm B: ${suites.length} suites re-run under the probe, ${withTraffic.size} of them driving ops; `
           + `${observed} op answers observed across ${opsSeen.size} distinct ops; ${checked} op/suite pairs judged`);
  notes.push(`arm B coverage — ops exercised by the harness: ${[...opsSeen].sort().join(" ")}`);
}

/* ============================================================ */

armA();
armB();

for(const n of notes) console.log("  " + n);
if(fails.length){
  for(const f of fails) console.error("FAIL: " + f);
  console.error(`check-mock-envelope: ${fails.length} failure${fails.length===1?"":"s"} — the D-173 class is open again`);
  process.exit(1);
}
console.log("check-mock-envelope: the envelope seam is the only door, and every mock answers the wire shape");
