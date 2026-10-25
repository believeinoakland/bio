# capture-sources (T51)

**Status** · session_015NNE8YXK9B29MQ2FEJGQ2N · depth 2 · COMPLETE · handled B9

## J1 · REPORT

Completion record, capture-sources in T51 (words, T51-181). Code commit b6aaa8fb43 on job/T51/capture-sources (tranche/T51 merged in, never rebased).

Entries applied
- Words-pass findings (build/plan/words-pass/capture-sources.md), all fixed by the words rule:
  - Plain findings (K3957): each member-facing sentence read through localize('capture-sources.<stem>.<slug>', en, vars). These are refusal details (credentials.mjs, memento.mjs, cdx.mjs), RENDER_BLOCKED_REASONS (browserrender.mjs) and evidence/detail sentences. Nothing judged developer-only, so no string is listed as unkeyed.
  - Inline findings: the sentence fragments passed as variables (drive.mjs:245, render.mjs:472, :475, :476) now each a localize call with vars; render.mjs:151 and :477 read word('render.unstated_number') and word('render.renderer_report_wait').
  - Test copies (K3962): each copied sentence compared with localize(id, en, vars) (same id and en as the product call), or word(key, vars) where a words.json row exists (dec149 R46 basis sentences, R12, render.test lengths and cap/budget reasons). A test never holds a sentence's text any more.
- Beyond the check (setup-words R13 binds every member-read sentence): render.mjs settled and quiet-window reasons, the undetermined requests/scripts sentences, the scripts-executed authority reason, the not-sniffed evidence line, cdx's 'no digest', 'digest is the empty-body digest', 'the CDX record carried no urlkey', credentials' 'no secret was given', the no-host and no-key reasons, and memento's two Link header details. Converted to localize with the same en.
- Left as they are, per BOB's ruling on built-in error constructors (dev text): every `new Error(...)` message in browserrender.mjs and drive.mjs. Identifiers (codes, op names, the CDX_ and MEMENTO_ reason codes) are unchanged.

Deferred: none.

Found in another module: none in this module's files. The whole-product run of checks/run.mjs reports 4078 words failures in other modules (for example wizard-scripts t48.test.mjs, observation-log vocabulary.mjs:1367), and 30 coverage failures; none is capture-sources. Those belong to their own jobs; reporting them here so BOB can see the run is not clean outside this module.

Tests and checks (final run on b6aaa8fb43)
- node --test test/m/capture-sources/*.test.mjs (bio-plane): tests 96, pass 96, fail 0.
- checks/words.mjs /home/user/bio capture-sources: 0 failures (inline 0, plain 0, testcopy 0, missingkey 0, marker 0).
- checks/format.mjs: 175 modules, 174 requirements files, 0 failures.
- checks/architecture.mjs capture-sources: 23 product files, 0 failures.
- checks/coverage.mjs capture-sources: 65 of 65 live requirement ids named by a test, 0 failures.
- checks/ownership.mjs /home/user/bio capture-sources tranche/T51 job/T51/capture-sources: 14 files changed by capture-sources, 0 failures.
- checks/run.mjs /home/user/bio: format 0, architecture 0, words shows no finding in capture-sources; the remaining findings are other modules' (see above).
- node bio-plane/src/setup-words/build.mjs --check: the rows.mjs stale-rows note is expected (BOB regenerates at the layer close); no refusal naming capture-sources.

Commit note: the commit message carries no model identifier, following the process rule for pushed artifacts; no Co-Authored-By model line.

Size (session_015AzGmWcjbqBcwr292qPePs): test runs 3, module lines 2664

## J2 · COMPLETE

capture-sources (T51-181) complete on b6aaa8fb43: the words findings are fixed by key and the module's tests, checks and ownership pass. Details are in J1.

## J3 · QUESTION

R67's test uses test-support's declaredOpHolds (BOB's START names it), but capture-sources' modules.json uses does not list test-support, so checks/architecture.mjs capture-sources fails: 'imports bio-plane/test/declared-ops.mjs of test-support, which capture-sources does not declare in uses' (1 failure; everything else green: tests 110/110, coverage 67/67, words 0, format 0, ownership 0). modules.json is yours (ownership). Best reading: add "test-support" to capture-sources' uses (it is already ordered before it). Code is pushed on db9afe06a7 (R66, R67, ops.mjs with captureSourcesOps and DECLARED_OPS, tests). I carry on with my record meanwhile; I will merge tranche/T51 and COMPLETE once the edge is there.

## J4 · COMPLETE

Fix round 3, C13 (P5), my part: the browser render. Requirements met: capture-sources R68 (new) and R25 (amended timing); R20 held, R49 (null for a phase not reached).

**Built** (`bio-plane/src/browserrender.mjs`): a body collector takes each completed load's body as its `Network.loadingFinished` arrives, `BODY_CONCURRENCY` (6, exported) at a time, so bodies are collected during the load. `collectBodies` (still exported for tests) is a wrapper over it. At the end of the wait and the document taken, `finish` offers the unseen entries (redirect hops, ids missing) and waits for the outstanding bodies to the least of `BODY_PHASE_MS` (10,000 ms) and the render's `navMs + timeoutMs`; an outstanding body or an unstarted one is `body_unavailable` with R25's sentence (the render's reserved bound, or the 10,000 ms bound), and a late result is ignored, never filled. The count and byte ceilings are held in the order the loads completed (a slot reserved per body in flight). Each fetch call is bounded by what remains of the render's bound.

**The field that carries the phase times (named here, as the RC asks):** `phases_ms: {session, load, quiet, bodies}` on the answer, whole milliseconds. session = start to the navigation sent; load = navigation to the load event (or to the end of the wait when it never fired); quiet = load event to the end of the wait, `null` when the load event never fired; bodies = what the render waited for bodies after taking the document (0 with no sub-resources). A failed render answers `{ok: false, error}` only, as before. Documented in `render.mjs`'s RENDER_ANSWER comment (one line). `render.mjs` ignores the field today: it is not on the record. If BOB wants it recorded on the capture's `render` block or on `timings`, that is a requirement for BOB to write (acquisition/capture side).

**Tests** (`bio-plane/test/m/capture-sources/browserrender.test.mjs`), seen failing first on the old source, then green: R68 (20 bodies of 1 s each: all kept, concurrency between 2 and 6, first body asked for before the document is taken, body phase under half the sum, four whole-ms phases, render inside its bound); R68 (hung bodies at the cap are `body_unavailable` with the sentence, finished ones kept, quiet `null` when load never fired); R68 control (no sub-resources: four phases, bodies 0, document, requests, wait unchanged; the 400-body ceiling still holds). R19's answer-shape list gained `phases_ms`. R25's old test of the time bounds assumed one-after-another collection (a clock jump per body); I rewrote it for the amended R25: a hung body at the 10,000 ms bound and at the reserved bound, the finished bodies kept. Nothing skipped or weakened; the sentences are asserted by key through `word`.

**Not done / for BOB.** The 504s in the re-walk also come from the host governor's double booking (P4b: host-governor peek R29, acquisition R97) and the 3 s attest wait (P4a), which are other jobs'; this change cuts the body phase (up to 10 s sequential → about the slowest few) and bounds it to the door, but the page's own load and quiet wait (up to 15 s) remain. No early answer, per K4360. No stand-in words and no new member-facing sentences; no census op of mine changed (the ops file is untouched).

**Ran.** `node --test --test-force-exit bio-plane/test/m/capture-sources/`: tests 113, pass 113, fail 0. `bio-plane/test/m/acquisition/` (the user of capture-sources): tests 185, pass 185. impact.mjs names 113 modules (the plane's whole closure); I ran the direct user, not all 1,645 files. checks/run.mjs: architecture 0 failures; words 0; coverage shows no finding in capture-sources; format 1 failure, `build/rulings.md:4346` (K4349 lacks a standing-list decision), on the tranche tip and not mine. ownership: 1 file changed by capture-sources... see the run: 0 failures (files: browserrender.mjs, render.mjs, the test).
Merge: `tranche/T51` already merged, no provider named for this cause.

Size (session_016XY41FauSzZ6Ec9JTB5R7K): test runs 8, module lines 2664

## J5 · QUESTION

QUESTION (J-seam, architecture). My two seam tests (C13a: `acquire` with the visitor render of a 33-body page, the store charging 0.27 s a call; C13b: render deferred, render table reset, "Finish it" through `acquire` with `continue`) must run the real merged `acquire`, so they import `bio-plane/src/acquisition/index.mjs` and acquisition's test fixture `bio-plane/test/m/acquisition/fixture.mjs` (its `world`, `run`). Acquisition is later than capture-sources in `build/modules.json` and not in my `uses`, so `checks/architecture.mjs` will name those imports ("not earlier in the order"), as it names `citation/register.test.mjs` on the tranche tip.

My best reading, which I am carrying on with: the seam tests live in `bio-plane/test/m/capture-sources/seam-render.test.mjs` (my tests path) and import acquisition and its fixture; the architecture check names exactly those lines and nothing else of mine, and BOB takes them as the seam owner's named red (K4431: the last-merged job owns the whole-path test). Everything else (the provider fix in `render.mjs` and its interface tests) is clean.

The smallest thing I need from BOB: say yes (named red accepted), or give the rule that makes the edge legal (an exemption for seam tests, or the test moved to a module that can import both). Not blocking: the provider fix and its test go ahead meanwhile.

## J6 · COMPLETE

COMPLETE · capture-sources · T51 fix round 4 (CAPTURE-SOURCES #16, session_01YZ5sTpHcAyaNyqP97XCiGf). Code on job/T51/capture-sources, tranche/T51 merged in (c3ca39e31f). J5 answered by B7 (K4453): the seam tests are acquisition's; they left my tests.

Files: bio-plane/src/render.mjs (keepRenderBodies); tests render.test.mjs (3 new), browserrender.test.mjs (1 new; imports the shared fake), fake-binding.mjs (the fake binding moved out of browserrender.test.mjs, unchanged).

C13a / P7
(1) Root cause: render.mjs keepRenderBodies awaited sha256 then put one body at a time (~0.27 s a trip, two trips with acquisition's head-then-put). browserrender.mjs collectBodies was already concurrent (R68), so it needed no change. Now KEEP_LANES = 8 at a time, results by request index, a repeated body put once, a failed body frees its place for a later one (ceilings still held in request order). `head` before `put` is acquisition's injected put.
(2) Tests missed it: fixtures used instant puts / 1 s fake bodies. Gap fix: the store double charges 0.27 s a trip (render.test.mjs, browserrender.test.mjs).
(3) Failing-first, red then green: render.test.mjs "R8 (C13a, P7) thirty-three bodies ..." red 17.9 s (limit 6 s), green 2.7 s; "R8 R9 ... results stay in the requests' order" red (sequential never finishes out of order), green; control "same bytes twice put once" green. browserrender.test.mjs "R68 R8 (C13a, P7) 33 bodies by the real driver and kept" green. Whole path through the real merged acquisition (seam test below): old render.mjs render stage 18948 ms, whole answer 20063 ms (red against 6 s / 15 s); new 3781 ms / 4888 ms.
(4) L done: keepRenderBodies bundled into a Worker, run under workerd 1.20260722 / Miniflare 4.20260722 with a real local R2 binding and 0.27 s added per call (33 bodies, head+put): 2980 ms, 33 of 33 held, 8 in flight, no limit error (sequential would be 17.8 s). LIVE-CHECK: no fresh timing, an acquire writes and is not read-only; the "before" figures are the performance lane's P7 (legistar People render stage 13.6 s for 33 bodies, iana 6.4 s for 9). To be timed at the re-walk against 15 s. R-OLD: new captures only.

C13b
(1) Root cause is acquisition's (its step 0, J12: finishRender waits on a run that never settles once its request ended); fixed there by R99 (merged). No code of mine changed.
(2)-(3) The through-the-door test is acquisition's (B7). I ran it before handing it over: with the real driver, a render that never comes back, then "Finish it" after the live bound files the visitor copy and closes the session: red on acquisition before 0fdc2798bd, green on the merged one; the table-reset and render-cannot-be-made cases green on both. (4) L for an object restart: run as a fresh module instance (table gone), not in workerd; said so.

Requirement ids: all 68 live ids named by a test (coverage 0 failures). Proposed line (BOB writes it): capture-sources R8 add at its end "(fix round 4, C13a, P7) The bodies are kept several at a time (eight), the answer by request index in the requests' order, a body asked for twice put once; the count ceiling and the byte budget are held in request order and the place of a body whose store failed goes to the next. Test: 33 bodies against a store charging 0.27 s a trip are kept in under 6 s." and R68 amended likewise.
Suites: capture-sources 117 of 117; capture 245/245; monitoring + corpus-export 195/195; acquisition 201 of 204 (3 reds identical on the tranche tip: R29 R31, R98 C25 needing pdf-reader, R9 R95 needing host-governor R30). Checks: format 0, architecture 0, coverage 0, words 0, ownership 0 (5 files). QUESTIONs open: none (J5 answered B7).
Size (session_01YZ5sTpHcAyaNyqP97XCiGf): test runs 14, module lines 2805

Seam test for acquisition (bio-plane/test/m/acquisition/seam-render.test.mjs; imports ../capture-sources/fake-binding.mjs and ./fixture.mjs; acquisition must declare capture-sources in uses, it does; after the move drop the architecture note in its header):

```js
/* capture-sources: the SEAM tests of the visitor render (fix round 4 of T51; K4429, K4431, K4448). The seam owner is the last-merged job on the path
 * press -> stored result, so these run the whole path with the REAL merged parts: acquisition's `acquire` (its own `world` and `run` fixture),
 * this module's real browser driver (`renderWithBinding` over the fake Browser Rendering binding of fake-binding.mjs, which speaks CDP) and its
 * real `keepRenderBodies`, record-core over a real SQLite database, and an evidence store that charges what the live one costs (0.27 s a call,
 * lane-performance P7). Nothing of acquisition is a double and no answer shape is written by hand: the inputs are the member's own acts through
 * the real op (`acquire` with `render`, then `acquire` with `continue`).
 * IMPORTS OF A MODULE LATER IN THE ORDER, by design (the seam owner's test); see the job record (QUESTION J5). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, run, network, HTML, page } from "./fixture.mjs";
import { acquire } from "../../../src/acquisition/index.mjs";
import { fakeBinding, HOST } from "./fake-binding.mjs";
import { renderWithBinding } from "../../../src/browserrender.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (s) => createHash("sha256").update(s).digest("hex");
const TRIP_MS = 270;
/* The evidence store as the live one behaves: every call is a round trip. */
function slowStore(w, ms = TRIP_MS) {
  for (const m of ["head", "get", "put", "delete"]) {
    const f = w.b[m].bind(w.b);
    w.b[m] = async (...a) => { await sleep(ms); return f(...a); };
  }
  return w;
}
const SHELL = HTML("<div id=app></div>");
const renderedText = (w, r) => new TextDecoder().decode(w.bytesOf(r.body.document.capture.sha256));

/* A page of `n` sub-resources, each with a body of its own. */
const pageOf = (n, over = {}) => ({
  requests: Array.from({ length: n }, (_, i) => ({ url: `https://${HOST}/s${i}.js`, type: "Script", status: 200, end: "finished", bodyText: `body ${i} `.padEnd(2000, "x") })),
  ...over });
const asked = (path) => `https://${HOST}${path}`;
const member = { cls: "member", member: true, sessMember: "m1", storeName: "bio" };

test("R8 R68 (C13a, P7): `acquire` with the visitor render of a page of 33 bodies, through the real merged acquisition and the real driver, against a store that charges 0.27 s a call: the render stage is under 6 s and the whole answer is within 15 s", async () => {
  const binding = fakeBinding({ "/zion": pageOf(33) });
  const w = slowStore(world({ env: { BROWSER: binding } }));
  const t0 = Date.now();
  const r = await run(w, { [asked("/zion")]: () => page(SHELL) }, { locator: asked("/zion"), render: true });
  const took = Date.now() - t0;
  assert.equal(r.status, 200);
  assert.equal(r.body.document.capture.method, "rendered", "the visitor copy is the primary document");
  assert.match(renderedText(w, r), /<main>Rendered \/zion<\/main>/, "and its bytes are the browser's document");
  const stages = r.body.timings.stages;
  console.log(`SEAM C13a: render stage ${stages.render} ms, whole answer ${took} ms`);
  assert.ok(stages.render < 6000, `the render stage took ${stages.render} ms (kept one at a time it is 33 x 2 trips x ${TRIP_MS} ms = ${33 * 2 * TRIP_MS} ms more)`);
  assert.ok(took < 15000, `the whole answer took ${took} ms`);
  /* every body was kept, under its own digest, in the place of its request */
  const subs = w.core && r.body.document.render ? r.body.document.render.subresources : null;
  assert.equal(subs.length, 33);
  subs.forEach((s, i) => {
    assert.equal(s.address, `https://${HOST}/s${i}.js`);
    assert.equal(s.sha256, sha(`body ${i} `.padEnd(2000, "x")), `sub-resource ${i}`);
    assert.ok(w.held(s.sha256), `sub-resource ${i} is held`);
  });
  assert.equal(binding.stats.browserCloses + binding.stats.socketCloses > 0, true);
});

test("R8 R68 (C13a, P7) control: a page of three bodies is rendered and kept as before, each held once", async () => {
  const w = slowStore(world({ env: { BROWSER: fakeBinding({ "/zion": pageOf(3) }) } }));
  const r = await run(w, { [asked("/zion")]: () => page(SHELL) }, { locator: asked("/zion"), render: true });
  assert.equal(r.body.document.capture.method, "rendered");
  assert.equal(r.body.document.render.subresources.length, 3);
  for (const s of r.body.document.render.subresources) assert.equal(w.b.calls.filter((c) => c[0] === "put" && c[1].endsWith(s.sha256)).length, 1);
});

/* ---------- C13b (fix round 4): "Finish it" when the object that began the render no longer holds it. ---------- */

/* The member's act: capture a page with the visitor render asked for, the answer coming before the render ends (the live bound
   is `renderWaitMs`), so the page as served is filed and the render is pending in a capture session. */
const begin = async (w, path, wait = 40) => {
  const r = await run(w, { [asked(path)]: () => page(SHELL) }, { locator: asked(path), render: true }, { renderWaitMs: wait });
  assert.equal(r.status, 200);
  assert.notEqual(r.body.document.capture.method, "rendered", "the page as served is the document filed first");
  const sid = r.body.document.render_pending && r.body.document.render_pending.session;
  assert.ok(sid, "the render is pending in a capture session the member finishes");
  return { sid, shell: r.body.document.capture.sha256 };
};
/* "Finish it": `acquire` with `continue`, on a module instance that is not the one which began the render when `fresh` names one. */
const finish = async (w, sid, path, { fresh = null, ...opts } = {}) => {
  const net = network({ [asked(path)]: () => page(SHELL) });
  try { return await (fresh || { acquire }).acquire(w.store, { continue: sid }, { ...member, ...opts }); }
  finally { net.restore(); }
};
const SLOW_LOAD = { loadAfterMs: 6000 };   // the page's load event comes 0.3 s of real time after the navigation

test("R68 (C13b): a render deferred past the live bound, the object restarted (the render table is empty), then `acquire` with `continue`: the visitor copy is filed as the second document and the session is closed; control: a continuation whose render is still held by the object finishes it as before", async () => {
  /* the restart */
  const w = world({ env: { BROWSER: fakeBinding({ "/zion": pageOf(5, SLOW_LOAD) }) } });
  const { sid, shell } = await begin(w, "/zion");
  assert.ok(w.store.state.sessions.has(sid));
  const restarted = await import("../../../src/acquisition/index.mjs?restart=seam-c13b");   // a new module instance: the render table is gone
  const done = await finish(w, sid, "/zion", { fresh: restarted });
  assert.equal(done.status, 200);
  assert.notEqual(done.body.note && done.body.continued, true, "never 'already in the record, nothing new saved'");
  assert.equal(done.body.document.capture.method, "rendered", "the second document is the visitor copy");
  assert.notEqual(done.body.document.capture.sha256, shell);
  assert.match(new TextDecoder().decode(w.bytesOf(done.body.document.capture.sha256)), /<main>Rendered \/zion<\/main>/);
  assert.equal(done.body.document.render.subresources.length, 5);
  assert.equal(w.store.state.sessions.has(sid), false, "the session is closed");

  /* control: no restart, the render still held by the object that began it; the same act finishes it */
  const w2 = world({ env: { BROWSER: fakeBinding({ "/zion": pageOf(5, SLOW_LOAD) }) } });
  const c = await begin(w2, "/zion");
  await sleep(1500);
  const live = await finish(w2, c.sid, "/zion");
  assert.equal(live.status, 200);
  assert.equal(live.body.document.capture.method, "rendered");
  assert.equal(live.body.document.render.subresources.length, 5);
  assert.equal(w2.store.state.sessions.has(c.sid), false);
});

test("R68 (C13b): the render begun afresh cannot be made (the browser refuses the navigation): \"Finish it\" is refused in words that say the page could not be rendered, and the session is closed", async () => {
  const w = world({ env: { BROWSER: fakeBinding({ "/zion": pageOf(2, SLOW_LOAD) }) } });
  const { sid } = await begin(w, "/zion");
  /* the browser can no longer render the page: its navigation is refused */
  w.store.env.BROWSER = fakeBinding({ "/zion": { navError: "net::ERR_NAME_NOT_RESOLVED" } });
  const restarted = await import("../../../src/acquisition/index.mjs?restart=seam-c13b2");
  const bad = await finish(w, sid, "/zion", { fresh: restarted });
  assert.deepEqual([bad.status, bad.body.reason], [502, "RENDER_FAILED"]);
  assert.match(bad.body.detail, /ERR_NAME_NOT_RESOLVED/, "the browser's own words");
  assert.equal(bad.body.continued, undefined);
  assert.equal(w.store.state.sessions.has(sid), false, "the session is closed");
});

/* The runtime cuts what a request began once it has answered: the render's promise then never settles (the walker's Zion). A renderer
   service that does that for the render begun with the member's first act, and renders with the REAL driver for any later one. */
const cutThenReal = (binding) => {
  const calls = [];
  return { calls, RENDERER: { fetch: async (u, init) => {
    const req = JSON.parse(init.body);
    calls.push(req.url);
    if (calls.length === 1) return new Promise(() => {});
    return new Response(JSON.stringify(await renderWithBinding(binding, req, {})));
  } } };
};

test("R68 (C13b): the request that began the render ended and the render never came back (the table still holds it): `acquire` with `continue` after the live bound renders afresh with the real driver, files the visitor copy as the second document and closes the session; before the bound it is still pending", async () => {
  const renderer = cutThenReal(fakeBinding({ "/zion": pageOf(5) }));
  const w = world({ env: renderer });
  const { sid, shell } = await begin(w, "/zion", 20);
  const early = await finish(w, sid, "/zion", { renderWaitMs: 10, renderStaleMs: 60000 });
  assert.equal(early.body.render.state, "pending", "control: within the live bound it is pending");
  assert.ok(w.store.state.sessions.has(sid), "and the session is kept");
  await sleep(70);
  const done = await finish(w, sid, "/zion", { renderStaleMs: 50 });
  assert.equal(done.status, 200);
  assert.notEqual(done.body.note && done.body.continued, true, "never 'already in the record, nothing new saved'");
  assert.equal(done.body.document.capture.method, "rendered");
  assert.notEqual(done.body.document.capture.sha256, shell);
  assert.match(new TextDecoder().decode(w.bytesOf(done.body.document.capture.sha256)), /<main>Rendered \/zion<\/main>/);
  assert.equal(done.body.document.render.subresources.length, 5, "the real driver's bodies, kept");
  assert.equal(renderer.calls.length, 2, "the render was begun once more, not waited for again");
  assert.equal(w.store.state.sessions.has(sid), false, "the session is closed");
});
```

## J7 · REPORT

REPORT · capture-sources round 9: the interface acquisition (job 23) and capture (job 24) may code against. Working in my tree; merged to my branch at COMPLETE.

- `renderWithBinding` (browserrender.mjs): every `{ok:false}` answer now carries `elapsed_ms` (whole ms, session open to close, close included), `failure_class` ("transient" for a session refused / three a second / open bound spent; else "permanent") and `detail` (the error's words, <= 200 chars). The success answer is unchanged. A success still reports `elapsed_ms` taken before the close.
- `renderBlock(answer, {..., domBound})` (render.mjs): `{ok:false, problem, failure_class}` for: renderer not ok (its failure_class passes through, "permanent" when unstated), no html, `domBound.size > domBound.bound` (R71: the caller passes `domBound: {size, bound}` in bytes, from `READ_BOUNDS`), a main-frame status >= 400, a `chrome-error://` location, an empty shell. Every "page did not render" problem is "permanent". The block's `render.undetermined` always holds `RENDER_COPY_STATEMENT` (exported; the one stand-in sentence `capture-sources.render.copy_first_load_not_scrolled`, row owed to later-ux). `isEmptyShell(html)` is exported.
- `keepRenderBodies` (R70): same signature and answers; bodies decoded one at a time (acquisition's `keepReply` need change nothing).
- Found by the real-Chromium test and fixed in my module: the main document's `status` was `null` on every page rendered by a real browser (the response arrives before `Page.navigate` answers); now read off. R11's status >= 400 test depends on it. A page that hydrates by a timer with no network request (not by a fetch) is captured as the browser had it at network idle: a shell, and now "the page did not render".
- Not in my requirements (stated, no action): "banner text marked" (V6) names no requirement of mine; I state banners as not dismissed (R69) and dismiss page dialogs so a render does not hang on one.

## J8 · COMPLETE

COMPLETE · capture-sources, fix round 9 (causes G138, G142, G137c; requirement ids R11, R26, R69, R70, R71). Code commit on job/T51/capture-sources, tranche/T51 merged in before reading (never rebased).

Entries applied

G138 · pictures decoded all at once (R70). (1) Root cause: `keepRenderBodies` decoded every body (atob / TextEncoder) in its first pass, before any was put (render.mjs, old lines 337-347); now the first pass reads each body's size off the string (`b64size`, `utf8size`: no decode, no allocation) and the ceilings (R9: size, count, budget) are held in request order on those sizes; a body is decoded in its lane's turn, hashed, put, and let go. Answers, digests and reasons are as before. (2) Why the tests missed it: the only memory test was 42 MiB in node and counted nothing in the keep; gap closed by R70's test, which counts decoded bytes resident (atob and TextEncoder spied; a body is resident until its put ends). (3) Failing-first, through `keepRenderBodies`: 40 bodies (half base64, half text, distinct lengths). RED on the old code: "peak ... against 8 x 150000 -> actual: false, expected: true" (render.test.mjs, R70 test), and "decodes ... actual: 3, expected: 0" for the ceilings test; GREEN now. Full size (40 x 1.5 MiB, the SCAN E8 page) measured: peak decoded 60.0 MiB before, 12.0 MiB after (8 lanes x 1.5 MiB), the same bodies kept. Real Chromium (chromium-render.test.mjs, R70): 12 real PNGs loaded by the real driver, kept by `keepRenderBodies` at most 8 at a time, each digest the plane's. (4) Platform: L done at node scale (workerd at the 128 MB cap is the corpus R set's and BOB's); P is after the redeploy.
The "N pictures kept, not read" count is acquisition's (job 23), as the START says.

G142 · the quiet-window rule (R26). (1) The code holds the rule on (4 s, browserrender.mjs LONG_LIVED_AFTER_MS); BOB corrected R26 (K4840). No code change. (2) No test pinned a render waiting the window. (3) New browserrender test "R26 (G142, X33)": a page holding one long-lived request open waits 4 s of the test's own clock (the clock moves 20 ms per read, so the window is counted as reads, at least 220), answers `quiet_excluding_long_lived`; control: a page with none ends on `networkidle` in a fifth of the reads. The test was green on the existing code and the requirement now matches it; shown red by mutation (rule off: `fired` is "timeout", actual 'timeout', expected 'quiet_excluding_long_lived'). (4) L: fake browser and real Chromium; P is BOB's after the redeploy.

G137c · the failed render (R11, R69, R71; the words). (1) Root causes: a failed render returned `{ok:false, error}` with no `elapsed_ms` and no class (browserrender.mjs, the catch of renderWithBinding), so the caller left the whole 25 s reserved; the content test was "html non-empty" (render.mjs renderBlock); no sentence said what the copy is. Now: every `{ok:false}` of `renderWithBinding` (the early own-host refusal included) carries `elapsed_ms` (session open to close, close included, whole ms), `failure_class` (`transient`: the binding refused a session, an upgrade refused with 429 or 5xx, the open bound spent; `permanent` otherwise) and `detail` (<= 200 chars, the error's words); `renderBlock` answers `{ok:false, problem, failure_class}` for a renderer failure (its class passes through), no html, a `domBound` ({size, bound} from the caller, R71) over its bound, a main-frame status >= 400, a `chrome-error://` location, or an empty shell (`isEmptyShell`: a body with no text and no image/media/frame/form/table element once scripts, styles, noscript, templates and comments are removed); each "did not render" is `permanent`. Every block states `RENDER_COPY_STATEMENT` (first load, not scrolled, banners and dialogs not dismissed, no frames or shadow content) among `render.undetermined`, once. (2) Why missed: the only page tested was 60 bytes and the fake browser cannot show a 403, a browser error page, a shell that never hydrates, a dialog or an event that arrives before `Page.navigate` answers; gap closed by chromium-render.test.mjs (real Chromium over an offline https origin on the loopback, a certificate made by openssl, the browser mapped to it and told to use no proxy; skips with its reason when Chromium or openssl is missing) and by the fake's new modes (acquire status, dialog). (3) Failing-first RED on the old code (stubs for the two new exports appended to the old render.mjs so each test fails for its own reason): "R69: every failed answer carries elapsed_ms... actual: false, expected: true"; "R69: a dialog ... actual: undefined, expected: { accept: false }"; "R11: renderBlock refuses ... actual: true, expected: false"; "R69: the render block states what the copy is ... actual: false, expected: true"; "R71: a page whose document is over the render-DOM bound ... actual: true, expected: false"; GREEN now, 126 of 126 in the module. Real Chromium (DOCS V4-V7 at their smallest): the page renders and is a document with the copy's statement; a hydration from a request answered 1.5 s in is waited for and is a document; a 403 with a body is `status 403` and not a document; an empty 404 is refused by the browser (ERR_HTTP_RESPONSE_CODE_FAILURE): a failed render, `permanent`, with elapsed time and the browser's words; a blank page and a shell that never hydrates are "the page did not render"; a page that opens an alert is rendered (the dialog is dismissed); a reset connection is a failed render with its time and class; no browser is left running. (4) L done (fake and real Chromium); P is BOB's after the redeploy (acadia's `timings.stages`).
Found and fixed in my module while doing it: on a real browser the main document's `status` was `null` on every render (the response event arrives before `Page.navigate` answers, when the main frame's id is not yet known): the statuses of all frames' documents are kept as they arrive and the main frame's is read off once its id is known (R24); R11's status test depends on it. Found by the real-Chromium test; the fake never ordered events so.
Also fixed: a page dialog (alert, confirm, prompt) stopped the page and held the render to its bound; it is now dismissed (`Page.handleJavaScriptDialog`), tested with the fake and real Chromium (V6: "nothing hangs on the dialog").

Interface for acquisition (job 23) and capture (job 24), also in my mailbox entry J7: `renderBlock(answer, {..., domBound: {size, bound}})`, `failure_class` on every `{ok:false}` of the renderer and of `renderBlock`, `elapsed_ms` on a failed answer, `RENDER_COPY_STATEMENT`, `isEmptyShell`.

Existing tests changed (my tests path): `<html></html>` fixtures in render.test.mjs and dec149.test.mjs now hold content (an empty body is a shell under R11); R11's test rewritten for R11 as BOB edited it.

Proposals for BOB to write (a job writes no requirement): R69 and R71 to name the exports and the option (`domBound: {size, bound}` in bytes, from the caller), R24 to say the main frame's status is read off even when the document's response arrives before the navigation answers, R19 or R25 to say a page dialog is dismissed. None changes a ruling.

Words owed (stand-ins keyed through `localize` in this module; rows to later-ux, plan section 5 "Visitor copy"): `capture-sources.render.copy_first_load_not_scrolled`; `capture-sources.render.the_page_did_not_render_over_bound`, `...the_page_did_not_render_status`, `...the_page_did_not_render_error_page`, `...the_page_did_not_render_empty_shell`. The day's render account is capture's and acquisition's.

Files created outside my paths: none.

Tests and checks
- Module: `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/capture-sources/` -> tests 126, pass 126, fail 0 (chromium-render.test.mjs ran, not skipped).
- Users of render.mjs and browserrender.mjs (the direct ones; `impact.mjs origin/tranche/T51 HEAD` names 174 of 176 modules transitively, 2,519 test files, which I did not run whole): acquire, fix2-t51, fix3-t51, fix4b-owed, selflink-render, seam-render (67 of 67), plane round6-extraction and screens-intake r8-supporting (6 of 6), capture t50-words, t35, g32-t51, reads, t51, t44, converts, g27-t51, act, services (82 of 82): no failure.
- format: 176 modules, 176 requirements files; 0 failures. architecture capture-sources: 28 product files, 57 relative imports; 0 failures. coverage capture-sources: 71 of 71 live requirement ids named by a test; 0 failures. words capture-sources: inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, marker 0; 0 failures. ownership capture-sources tranche/T51: 8 files changed by capture-sources; 0 failures.
- Stale generated artifacts I made: setup-words rows (new localize ids, BOB regenerates at the round end).

Size (session_016pEx7TYe1KsCbHGpZGUn13): test runs 24, module lines 2894

## J9 · COMPLETE

COMPLETE · CAPTURE-SOURCES #18 · fix round 10, Wave A batch 1 (START B9). Code commit c2cfee5724 on job/T51/capture-sources (pushed; tranche/T51 not merged, nothing it changed was read).

Entries applied
- Published `bio-plane/test/m/capture-sources/fixtures.mjs` (new), two named exports, each made by the real driver at test time over this module's own fake binding (`fake-binding.mjs`), nothing stored:
  - `renderFailure({class})`: the failed answer of `renderWithBinding` (`src/browserrender.mjs`) for `no_session` (the binding hands out a session with no id: permanent), `session_refused` (HTTP 503: transient) and `open_bound` (no session within the navigation bound: transient). Each answer is `{ok:false, error, elapsed_ms, failure_class, detail}`.
  - `renderRefusal({kind})`: the runner's failing answer for `connection_refused` (ERR_CONNECTION_REFUSED on navigation, permanent), `session_refused` (transient), `not_html` (no serialised document, permanent) and `navigation_timeout` (the navigation does not answer within its bound and fails by name, permanent).
- `bio-plane/test/m/capture-sources/fixtures.test.mjs` (new): two tests, one per fixture, each checking the real answer's `ok`, `failure_class`, `error` words, whole-ms `elapsed_ms`, `detail` of at most 200 characters, and the bound held for the two timing cases. Titles name R19, R20, R69.

Rulings I made (job-level, for BOB to enter in build/rulings.md; the job cannot write it)
1. `renderFailure` takes `{class}` and `renderRefusal` takes `{kind}`; neither takes `elapsed_ms`. The plan's note shows `renderFailure({class, elapsed_ms})`, but `elapsed_ms` is the run's own measurement (R69), and a caller-stated figure would be a made-up value under K4426. Acquisition's and control-plane's re-points pass the class or kind and read the time from the answer.
2. START's "no session free = permanent" is read as the driver's no-session-id case (`acquired a session with no sessionId`), which the driver already marks permanent. A refused session and a spent open bound are transient under R69, as the START's other half says.
3. Only the two named exports. START says the success answer `OK()` "can come from the same fixture"; I did not add a third export, so acquisition keeps its own success answers.

Lines (`node checks/fixtures.mjs /home/user/bio capture-sources --list`)
- Done: none to do; the module had no live line at takeover (answer 0, stub 0, code 0, contract 0). No marker was added, so there is no `fixtures-own` or `fixtures-generic` line to list for BOB's merge read (K5060).
- Left, in other modules: acquisition 8 (FIX-E `renderFailure`, re-points in acquisition's job) and control-plane 5 (FIX-E `renderRefusal`: r9-seam-safety.mjs:185, :209, :211, :213, :221), to be re-pointed in control-plane's job.

Finding for BOB (not in the START): the fixtures check reads nothing when its root is relative. `node checks/fixtures.mjs . capture-sources --list` (and the same with `.` as the product) reported `0 failures` across 178 modules; with the absolute path `/home/user/bio` the same check reports the plan's count, 2,816 failures in 178 modules. Any wave gate run with a relative root reads zero. Please run it with the absolute path.

Checks (absolute product path)
- fixtures capture-sources --list: answer 0, stub 0, code 0, contract 0; 0 failures.
- format /home/user/bio: 178 modules, 178 requirements files; 0 failures.
- architecture capture-sources: 29 product files, 59 relative imports; 0 failures.
- coverage capture-sources: 71 of 71 live requirement ids named by a test; 0 failures.
- words capture-sources: 4139 literals, inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, marker 0; 0 failures (dev 9 and unkeyed 5 are as before; no new string added).
- ownership capture-sources tranche/T51: 3 files changed by capture-sources; 0 failures.

Tests
- New: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/capture-sources/fixtures.test.mjs`: 2 pass, 0 fail.
- Module: `bio-plane/test/m/capture-sources/*.test.mjs`: 128 tests, 128 pass, 0 fail, 0 skipped (126 before plus the 2 new).
- Impact: `node build/plan/impact.mjs origin/tranche/T51 HEAD`: affected modules 1 of 178 (capture-sources only), affected test files 1 of 2710 (its own new test). No user module is named, so no user's tests were run; the change adds test files and no product code.

Size (session_01YENRH2Y3YDuYBqxX65xUfX): test runs 3, module lines 2894

## J10 · COMPLETE

Fix round 10, follow-up 31 (SUITE #2): the browserrender timing red. Code commit on job/T51/capture-sources (tranche/T51 merged in, never rebased).

**Cause.** The R68 control (`phases_ms.bodies` 20 where 0 is asserted) is a clock artefact, not load on the collector. The tests' clock (`scaled()`) runs 20 times the wall. `browserrender.mjs` read `now()` either side of `collector.finish()` and reported the difference even when `finish` had nothing to wait for (a page with no sub-resources); whenever one real millisecond fell between the two reads the phase read 20. Instrumented under load (8 busy loops on 4 cores, the R68 control alone, 40 runs): the one trigger printed `bodies 20, sawNetwork true, requests 0, []`, so no entry was in flight; the 25 ms ticks of `finish` were not involved. The same class of assertion was the whole-suite R69 red: the refused-address case asserted `elapsed_ms` 0 on the 20x clock (old product, same test file: actual 20).

**Fix (product).** `finish()` answers whether it had to wait at all; the render states `phases_ms.bodies` as the time it waited, and 0 when it did not wait (R68: "what the render waited for bodies"; no requirement change). **Fix (tests).** New R68 test on a clock that moves 20 ms at every read (deterministic): no sub-resources states bodies 0 (seen failing on the old source, 40 where 0); a page with slow bodies states bodies > 0 (control). The R69 refused-address case now uses a clock that does not move (elapsed 0 exactly), and the R69 closing-time case a stepping clock (1 ms per read plus the 1,500 ms jump) in place of the 20x clock, so its upper bound counts reads, not wall time. Nothing skipped or weakened.

**Evidence.** Before: the R68 control red in 1 of 40 runs under the load, and the new R68 test and the R69 test red on the old source. After: `browserrender.test.mjs` 18/18, 20 runs in a row green under the same load (8 busy `while :` loops on 4 cores); `bio-plane/test/m/capture-sources/` 129/129; with the users that name browserrender or phases_ms (acquisition, screens-intake r8-supporting): 363/363. `impact.mjs` names 113 modules (the plane's closure); the users' tests above are the ones that read the changed behaviour.

**Checks (absolute product root).** format 178 modules, 0 failures; architecture capture-sources 0; coverage 71 of 71 ids, 0; words 0 failures; fixtures 0 failures; ownership 3 files changed by capture-sources, 0 failures.

Deferred: none. Found in another module: none.

Size (session_015NNE8YXK9B29MQ2FEJGQ2N): test runs 12, module lines 2897
