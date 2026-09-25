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
 *
 * ARM C (M0-23, 2026-09-10) — THE FIXTURE-SHAPE CENSUS. Its own rules and its own
 * blind spots are stated at the arm; what belongs here is its CONTROLS, run
 * against the final file with the subject restored by sha256 AND byte-for-byte:
 *
 *   (c1) DOES IT SEE A DROPPED COLUMN AT ALL — `version_sha` deleted from both
 *       roster rows of `test/preauth-vocabulary.test.mjs`'s `caseMembers`
 *       fixture (the exact defect UI-56 and M0-23 each found on this op). RUN:
 *         arm C: NARROWER THAN THE WIRE … preauth-vocabulary.test.mjs ·
 *         publishedmanifest.caseMembers[] carries 5 of the 6 column(s) …
 *       naming the suite, the field and the column — and the guard still EXITS
 *       0, which is the declared behaviour and not a miss: a narrow fixture is
 *       reported, never failed. Restored byte-identical (164,282 B).
 *   (c2) THE INSTRUMENT FOUND WRONG THREE TIMES BY ITS OWN FIRST RUN, recorded
 *       rather than smoothed, because all three were the arm misreporting the
 *       plane rather than the plane being wrong. (i) The `SELECT` reader took the
 *       first backtick after `this.#rows(` and the plane DOCUMENTS its queries in
 *       block comments that quote column names in backticks — so `cases[]` was
 *       read as starting inside a comment and scored UNCLASSIFIED. (ii) The
 *       narrow-row sentence counted the fixture's TOTAL keys against the plane's
 *       column count and printed "carries 9 of the 9 column(s) … MISSING
 *       strength, required", contradicting itself. (iii) The method finder
 *       required a single-line parameter list and reported `resolveReferences`
 *       and `threadInstance` as "not found as a method" when both are plainly
 *       there. Each is corrected at its site, and each is why the arm PRINTS ITS
 *       CORPUS: the first run's headline read "1 op classified, 8 fields judged"
 *       and the corrected one reads 37 resolved, 10 judged over 70 rows.
 *   (c3) THE FLOORS ARE THE ARM'S OWN NEGATIVE CONTROL and they are structural
 *       rather than run: it FAILS if store.mjs cannot be read, if no op resolves
 *       to a method, or if no field is judged — because a census over an empty
 *       corpus reports a clean estate for free, which this project has shipped
 *       three times.
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
  /* CORRECTED 2026-08-05 (UI-18), never exempted: this line carried
     op=publishedcase's return literal against op=knock's name. The
     CLASSIFICATION was right — knock builds its own answer and is flat — but
     the evidence beside it named a different op, which is the one thing this
     column exists to prevent, since the list is re-checkable only if each line
     points at the handler it came from. */
  knock:          'index.mjs op==="knock" — builds its own answer literal (ok, knockId, sha256, bytes, received)',
  verify:         'index.mjs op==="verify" — json({ok:true, ...out.result})',
  /* UI-18. The public read path's case op has its own handler and FLATTENS.
     CORRECTED 2026-08-04 (UI-29, REC-44/DEC-44), never exempted: the quoted
     return literal was `json({ok:true, ...c, object_type, body, basis,
     verification})`, and those three keys moved INSIDE `findings[]` when a case
     became a container over one or more findings. The envelope shape did not
     move at all — this line is evidence for the FLAT judgement and evidence has
     to name the code it was read off, or the list becomes a place to add an op
     that is merely inconvenient. Its sibling `op=publishedbytes` is not listed
     because it answers BYTES, not JSON, on success — the probe only judges
     answers it can read as an object, and a refusal is legitimately flat either
     way. `op=publishedmanifest` is NOT here and must not be: index.mjs re-wraps
     it explicitly (`json({ok:true, result: …})`), so wrapped is correct. */
  publishedcase:  'index.mjs op==="publishedcase" — json({ok:true, ...c, findings, verification})',
  /* UI-68. The review copy's two ungated ops share ONE handler in index.mjs
     (`op === "reviewcopy" || op === "reviewcomment"`), which opens the Durable
     Object's answer itself and FLATTENS it. `casedraft` and `reviewrevoke` go
     through the passthrough and are wrapped; `reviewgrant` re-wraps explicitly
     (`json({ok:true, result:{…, secret}})`), so none of those three is here. */
  reviewcopy:     'index.mjs op==="reviewcopy" — json({ ok: true, ...r }, 200) over the DO\'s result',
  reviewcomment:  'index.mjs op==="reviewcomment" — the same handler, json({ ok: true, ...r }, 200)',
  /* UI-89. D-150 gave that SAME handler a third op: `op === "reviewcopy" || op === "reviewcomment" ||
     op === "statementack"` in index.mjs, and every one of the three returns through `reviewAnswer`, whose
     tail is `json({ ok: true, ...r }, 200)` and whose refusal half is `json({ ok: false, ...r }, …)`. Only
     `reviewcopy` takes the `inband` branch before it; `statementack` falls straight through. So it is FLAT
     on both wires, and `statement-ack.test.mjs` drives the REAL plane rather than mocking it — this line is
     what lets that suite's own answers be judged instead of being read as a mock of the wrong shape. */
  statementack:   'index.mjs op==="statementack" — the same handler, reviewAnswer\'s json({ ok: true, ...r }, 200)',
  /* UI-92. REC-198's list of a project's drafts returns through `reviewAnswer` TOO — index.mjs's
     `if (op === "casedrafts") return reviewAnswer(await doAnswer(...), op)`, whose success tail is
     `json({ ok: true, ...r }, 200)` — and deliberately so: IC-243's rule is that a caller its fence
     refuses receives the SINGLE READ's dead answer byte for byte, which cannot be true of one shape
     wrapped and the other flat. This line arrives with the op's first UI call site (UI-92's list on
     the project workspace), and until there was one nothing in this harness could observe the op;
     FOUR suites drive it against the real plane the moment the workspace does, and each of the four
     read as a mock of the wrong shape against a missing line rather than against a wrong answer. */
  casedrafts:     'index.mjs op==="casedrafts" — reviewAnswer\'s json({ ok: true, ...r }, 200) over the DO\'s result',
  /* UI-121. `op=casedocument` has its own handler in index.mjs (`if (op === "casedocument")`), which opens the
     Durable Object's answer itself (`const r = out.result`) and FLATTENS it — `json({ ok: true, ...r, … })`,
     the literal verdict first and the statement to sign printed beside it; its refusal half is
     `json({ ok: false, ...r }, 404)`. This line arrives with the op's first UI call site (UI-121's published
     case page, which quotes the signed text), and `draft-binding.test.mjs` drives it against the real plane. */
  casedocument:   'index.mjs op==="casedocument" — json({ ok: true, ...r, … }) over out.result',
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
   harness, so arm B could never have found it. Its seam is `apiR`.

   `apiQ` JOINED THIS FAMILY IN UI-18 and is the busier half now: the public case
   surface reaches four `classes: null` ops with QUERY PARAMETERS and no
   credential, and every one of those reads goes through it. It is a SEAM and not
   a transport — it opens the envelope exactly as `apiR` does — so it belongs in
   this set rather than under the call-site ban, and the day something calls
   `api()` directly to sneak a parameter in, arm A names it. */
const API_SEAMS = new Set(["api", "apiR", "apiQ"]);

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
  /* UI-27. Pinned the day it landed, on UI-18's precedent: it is the only suite
     that drives `op=inquiryground`, the act DEC-32's elicitation authors
     through, and a mock that answered it flat would leave the receipt — the one
     place this flow shows a strength at all — reading `undefined` while every
     assertion about the questions it asks stayed green. */
  "elicitation.test.mjs",
  "inquiry-page.test.mjs", "intent-write.test.mjs", "members-roster.test.mjs", "project-workspace.test.mjs",
  /* UI-18. Pinned the day it landed rather than a release later: it is the only
     suite that drives the CREDENTIAL-FREE ops, so if it goes quiet the three
     public reads leave arm B's coverage entirely and nothing else notices. */
  "publishedcase.test.mjs",
  "queue.test.mjs", "record-list.test.mjs", "release-flow.test.mjs", "seals-backrestore.test.mjs",
  "subject-view.test.mjs",
];

/* Arm C reads what arm B's single re-run already observed, so the census costs
   no second pass over the harness. One row per suite per op. */
const OBSERVED = [];

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
      if(r.rowKeys && Object.keys(r.rowKeys).length) OBSERVED.push({ suite, op:r.op, rowKeys:r.rowKeys });
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

/* ============================================================
   ARM C — THE FIXTURE-SHAPE CENSUS (M0-23, UI-56's delegation)
   ============================================================

   THE CLASS, and it is D-173 one altitude down. Arm B asks what shape the
   ENVELOPE was. A mock can answer a perfectly wrapped envelope whose ROWS drop
   half the columns the plane selects, and no assertion can notice: a suite
   cannot assert against a column its own fixture does not have. That is not a
   live defect on its own — the surface reads what it reads — but it is the
   condition under which a real defect is unseeable, and it has now been found
   twice on the same op. `publishedManifest()` selects six columns for
   `caseMembers[]`; `publishedcase.test.mjs` carried four (UI-56) and
   `preauth-vocabulary.test.mjs` carried the same four (M0-23). `version_sha`,
   one of the two missing, is THE COLUMN THE PUBLISHED INDEX'S JOIN IS MADE ON.

   IT REPORTS AND IT DOES NOT FAIL ON A NARROW FIXTURE, deliberately, and this
   is the over-strictness rule enacted rather than promised. A fixture may be
   legitimately narrower than the wire: `caseMembers[].role` is selected by the
   plane and READ BY NO SURFACE IN app.html (`memberRole()` is the project
   roster's, a different table), so a suite exercising a surface that never
   reads it is not carrying a defect. A guard that failed on that would push
   every suite toward carrying columns for their own sake. So the arm NAMES what
   is narrow and leaves the judgement to a reader, in the shape this estate
   already uses for an open question (the DEC-49 report, the runner's phantom
   residual).

   WHAT IT DOES FAIL ON is losing its own subject. A walk that covers nothing
   passes everything, and this project has hit that three times, so the arm
   fails if the plane's columns cannot be read at all, or if the census observed
   no answer for an op it could read columns for. A census over an empty corpus
   is the zero-cost outcome arriving in the instrument.

   NOTHING HERE IS A LIST OF COLUMNS. The op is resolved to its store method
   through the DO's own dispatch table, and the columns are read out of that
   method's `SELECT`s. Add a seventh column to `caseMembers[]`, or a fifth array
   to the answer, and this arm sees it the same day — where a list of spellings
   would go stale the moment somebody wrote the fourth.

   WHAT IT CANNOT SEE, stated every run rather than only here:
     - An op no suite drives. Arm C's reach is arm B's reach, which is the
       harness's. It prints its corpus so the gap is visible.
     - A field the plane does not build from a readable `SELECT` — anything
       assembled in JS, parsed out of a manifest, or selected with `*` — is not
       classified and is NAMED as unclassified rather than scored zero.
     - Whether a missing column MATTERS. It says the fixture cannot represent
       the column; it does not say any surface reads it. That is the reader's
       judgement and the reason this arm reports.
     - A suite that builds a correct fixture and never answers it. The census
       observes ANSWERS, not source. */

const STORE = path.join(HERE, "..", "bio-plane", "src", "store.mjs");

/* The method body, taken by brace-matching from the declaration rather than by
   a line count, so it cannot silently read half a method. */
/* CORRECTED DURING M0-23's OWN FIRST RUN, recorded rather than smoothed: this
   first required the parameter list to contain no `)` and to sit on one line,
   and it reported `resolveReferences` and `threadInstance` as "not found as a
   method" when both are plainly there — the instrument naming the subject wrong
   in the direction that looks like a finding. */
function methodBody(src, name){
  const m = new RegExp("^  " + name + "\\s*\\([\\s\\S]*?\\)\\s*\\{", "m").exec(src);
  if(!m) return null;
  let i = src.indexOf("{", m.index), depth = 0;
  for(let j = i; j < src.length; j++){
    if(src[j] === "{") depth++;
    else if(src[j] === "}"){ depth--; if(depth === 0) return src.slice(i, j + 1); }
  }
  return null;
}

/* `<field>: this.#rows(`SELECT … FROM …`)` — the only shape the plane builds a
   row array with. Aliases are stripped (`c.case_id` -> `case_id`) and an
   explicit `AS` wins, because the KEY THE WIRE CARRIES is what a fixture has to
   match, not the column the table happens to call it. */
function selectFields(body){
  const out = new Map(), unreadable = [];
  const re = /(\w+):\s*this\.#rows\(/g;
  let m;
  while((m = re.exec(body))){
    const field = m[1];
    /* CORRECTED DURING M0-23's OWN FIRST RUN, and it is the receipt for why a
       census must be read before it is believed: this took the FIRST backtick
       after `this.#rows(`, and the plane documents its queries in block comments
       that quote column names IN BACKTICKS. So `cases` was read as starting
       inside a comment, found no `SELECT … FROM`, and was reported UNCLASSIFIED
       — the arm scoring the plane's best-documented query as unreadable. The
       comments are stripped first now. */
    const rest = body.slice(m.index + m[0].length - 1);
    const cleaned = rest.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
    const tick = cleaned.indexOf("`");
    if(tick < 0){ unreadable.push(field + " (no template literal)"); continue; }
    const end = cleaned.indexOf("`", tick + 1);
    if(end < 0){ unreadable.push(field + " (unterminated literal)"); continue; }
    const sql = cleaned.slice(tick + 1, end);
    const sel = /SELECT\s+([\s\S]*?)\s+FROM\s/i.exec(sql);
    if(!sel){ unreadable.push(field + " (no SELECT … FROM)"); continue; }
    if(/\*/.test(sel[1])){ unreadable.push(field + " (SELECT * — the columns are the table's, not this text's)"); continue; }
    const cols = sel[1].split(",").map(c => {
      const t = c.trim().replace(/\s+/g, " ");
      const as = / AS ([A-Za-z0-9_]+)$/i.exec(t);
      if(as) return as[1];
      const bare = t.split(".").pop();
      return /^[A-Za-z0-9_]+$/.test(bare) ? bare : null;
    }).filter(Boolean);
    if(!cols.length){ unreadable.push(field + " (no column names recoverable)"); continue; }
    out.set(field, cols);
  }
  return { fields: out, unreadable };
}

function armC(){
  let src = "";
  try{ src = fs.readFileSync(STORE, "utf8"); }
  catch(_){ FAIL("arm C could not read bio-plane/src/store.mjs — the census has no authority to compare against and would pass over nothing"); return; }

  /* The op -> method binding comes from the DO's OWN dispatch table. */
  const dispatch = new Map();
  for(const d of src.matchAll(/^\s*([a-z0-9_]+):\s*\(\)\s*=>\s*this\.([A-Za-z0-9_]+)\(/gm))
    if(!dispatch.has(d[1])) dispatch.set(d[1], d[2]);
  if(!dispatch.size){ FAIL("arm C read no op -> method bindings out of store.mjs's dispatch table — its subject is gone"); return; }

  const opsObserved = [...new Set(OBSERVED.map(o => o.op))].sort();
  const wire = new Map(), unclassified = [], noMethod = [];
  let resolved = 0, noRows = 0;
  for(const op of opsObserved){
    const method = dispatch.get(op);
    if(!method){ noMethod.push(op); continue; }
    const body = methodBody(src, method);
    if(!body){ noMethod.push(op + " (" + method + " not found as a method)"); continue; }
    resolved++;
    const { fields, unreadable } = selectFields(body);
    for(const u of unreadable) unclassified.push(op + "." + u);
    if(fields.size) wire.set(op, fields);
    else noRows++;
  }

  if(!wire.size){
    FAIL("arm C classified ZERO ops — no op the harness drives resolves to a store method with a "
       + "readable SELECT, so the census would report a clean corpus over nothing. Establish whether "
       + "the dispatch table, the method shape or the harness's reach moved before trusting this.");
    return;
  }

  let judged = 0, narrow = 0, rowsSeen = 0;
  const narrowRows = [], wideRows = [], censusRows = [], absentFields = [];
  for(const o of OBSERVED){
    const fields = wire.get(o.op);
    if(!fields) continue;
    for(const [field, cols] of fields){
      const got = o.rowKeys[field];
      /* THE SUITE ANSWERED NO SUCH ARRAY AT ALL, which is NARROWER than dropping
         columns and would be invisible if it were simply skipped — absence at one
         level is not evidence of absence at the next, and a fixture missing a
         whole wire array is a fixture that cannot assert about that array's
         existence either. Named, not judged: a suite may legitimately never
         answer a field its surface does not read. */
      if(!got){ absentFields.push(`${o.suite} · ${o.op} answers NO ${field}[] at all (the plane always sends it, with ${cols.length} column(s))`); continue; }
      judged++;
      rowsSeen += got.rows;
      /* AN EMPTY ARRAY IS NOT A NARROW FIXTURE AND IS NOT A WIDE ONE — it is
         zero evidence, and it is SAID rather than dropped, because a census whose
         judged count is inflated by empty answers is exactly the headline that
         passes over an empty corpus. */
      if(!got.rows){ censusRows.push(`${o.suite} · ${o.op}.${field}[]: EMPTY (0 rows) — counted as judged, proves nothing either way`); continue; }
      const have = new Set(got.keys);
      const missing = cols.filter(c => !have.has(c));
      const extra = got.keys.filter(k => !cols.includes(k));
      /* CORRECTED DURING M0-23's OWN FIRST RUN: this counted the fixture's TOTAL
         key count against the plane's column count and printed "carries 9 of the
         9 column(s) … MISSING strength, required" — a sentence that contradicts
         itself, because two of those nine keys were the fixture's own additions.
         What the census is about is the INTERSECTION. */
      const carried = cols.length - missing.length;
      censusRows.push(`${o.suite} · ${o.op}.${field}[]: ${carried}/${cols.length} wire column(s) over ${got.rows} row(s)`);
      if(missing.length){ narrow++; narrowRows.push(`${o.suite} · ${o.op}.${field}[] carries ${carried} of the ${cols.length} column(s) the plane selects, over ${got.rows} row(s) — MISSING ${missing.join(", ")}`); }
      if(extra.length) wideRows.push(`${o.suite} · ${o.op}.${field}[] answers ${extra.length} key(s) the plane's SELECT does not: ${extra.join(", ")}`);
    }
  }

  if(!judged){
    FAIL("arm C judged NO field at all — every op it could read columns for was answered by a suite "
       + "without the array in question. The census is measuring nothing and reporting clean.");
    return;
  }

  notes.push(`arm C: THE FIXTURE-SHAPE CENSUS — ${OBSERVED.length} suite/op answer(s) observed across `
           + `${opsObserved.length} op(s); ${resolved} resolved through the DO's OWN dispatch table to a store `
           + `method (${noMethod.length} not resolved, named below), and ${wire.size} of those build at least one `
           + `row array from a readable SELECT (${noRows} build their answer some other way and are outside this `
           + `census by construction); ${judged} array field(s) judged over ${rowsSeen} fixture row(s); `
           + `${narrow} NARROWER THAN THE WIRE · floors ${judged} judged / ${wire.size} classified`);
  /* THE CORPUS, PRINTED. A census that does not say what it compared against
     cannot be told apart from one that compared against nothing. */
  for(const [op, fields] of wire)
    for(const [field, cols] of fields)
      notes.push(`arm C: THE WIRE — ${op}.${field}[] is ${cols.length} column(s) read out of the plane's own `
               + `SELECT: ${cols.join(", ")}`);
  for(const r of censusRows) notes.push(`arm C: JUDGED — ${r}`);
  for(const r of narrowRows)
    notes.push(`arm C: NARROWER THAN THE WIRE (reported, NOT failed — a suite exercising a surface that never `
             + `reads the dropped column is legitimately narrow, and only a reader can say which this is): ${r}`);
  if(!narrowRows.length)
    notes.push(`arm C: no fixture in reach is narrower than the plane's own SELECT — and the figure that makes `
             + `that mean something is the ${judged} field(s) judged above, not this sentence`);
  for(const r of absentFields)
    notes.push(`arm C: FIELD ABSENT FROM THE FIXTURE ENTIRELY (narrower than dropping a column, and named `
             + `for the same reason — it is not judged, because a suite may never answer a field its surface `
             + `does not read): ${r}`);
  for(const r of wideRows.slice(0, 12))
    notes.push(`arm C: WIDER THAN THE WIRE (a key the plane's SELECT does not carry — often a field the method `
             + `adds in JS after the query, which this arm cannot see, so it is NAMED and not failed): ${r}`);
  if(unclassified.length)
    notes.push(`arm C: UNCLASSIFIED — ${unclassified.length} field(s) the plane builds in a way no SELECT text `
             + `can be read out of, NAMED rather than scored zero: ${unclassified.slice(0, 10).join(" · ")}`);
  if(noMethod.length)
    notes.push(`arm C: NOT RESOLVED — ${noMethod.length} observed op(s) have no `
             + `\`op: () => this.method()\` binding this reader can see (a parameterised entry, an op the `
             + `control plane answers itself, or a mock's own invention): ${noMethod.slice(0, 12).join(" ")}`);
  notes.push(`arm C: WHAT THIS CENSUS CANNOT SEE (stated every run, not only in the header): an op NO suite `
           + `drives is outside it entirely — its reach is the harness's; a field the plane assembles in JS, `
           + `parses out of a manifest or selects with \`*\` is unclassified, named above; an EMPTY array `
           + `carries no column evidence and is counted as judged but proves nothing; and it says a fixture `
           + `CANNOT REPRESENT a column, never that any surface reads it.`);
}

/* ============================================================ */

armA();
armB();
armC();

for(const n of notes) console.log("  " + n);
if(fails.length){
  for(const f of fails) console.error("FAIL: " + f);
  console.error(`check-mock-envelope: ${fails.length} failure${fails.length===1?"":"s"} — the D-173 class is open again`);
  process.exit(1);
}
console.log("check-mock-envelope: the envelope seam is the only door, and every mock answers the wire shape");
