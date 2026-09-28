/* capture: requirement-named tests of the store-side services at the module's interface
   (build/requirements/capture.md). Each test names the requirement ids it checks in its title. A fresh store per
   test; no network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, receipt, register, H } from "./fixture.mjs";
import { captureOf, REACHABILITY_DEFAULTS, REACHABILITY_SETTINGS, TASK_KINDS } from "../../../src/capture/index.mjs";

const A = H("a"), B = H("b"), C = H("c"), D = H("d");

test("R8 R43: each attempt is recorded by kind, governed counted apart, eligibility by 3 failures or 2 over 14 days, thresholds from the instance", async () => {
  const { c } = fresh();
  const addr = "https://x.example/doc";
  assert.deepEqual(c.sourceReachability({ addressNorm: addr }).known, false, "an address never attempted is known: false");
  assert.equal(c.sourceReachability({ addressNorm: addr }).fallback_eligible, false);
  await c.recordSourceOutcome({ addressNorm: addr, outcome: "governed", at: "2026-01-01T00:00:00Z" });
  let r = c.sourceReachability({ addressNorm: addr, now: "2026-01-01T00:00:00Z" });
  assert.equal(r.governed_refusals, 1); assert.equal(r.consecutive_failures, 0); assert.equal(r.fallback_eligible, false);
  assert.match(r.basis, /DELIBERATELY not counted/);
  for (const o of ["source_refused", "fetch_failed"]) await c.recordSourceOutcome({ addressNorm: addr, outcome: o, status: 503, at: "2026-01-01T00:00:00Z" });
  assert.equal(c.sourceReachability({ addressNorm: addr, now: "2026-01-02T00:00:00Z" }).fallback_eligible, false, "two failures, one day");
  assert.equal(c.sourceReachability({ addressNorm: addr, now: "2026-01-16T00:00:00Z" }).fallback_eligible, true, "two failures, the first 15 days old");
  await c.recordSourceOutcome({ addressNorm: addr, outcome: "source_refused", status: 404, at: "2026-01-02T00:00:00Z" });
  r = c.sourceReachability({ addressNorm: addr, now: "2026-01-02T00:00:00Z" });
  assert.equal(r.consecutive_failures, 3); assert.equal(r.fallback_eligible, true); assert.match(r.basis, /3 consecutive failures/);
  await c.recordSourceOutcome({ addressNorm: addr, outcome: "success", status: 200, at: "2026-01-03T00:00:00Z" });
  r = c.sourceReachability({ addressNorm: addr, now: "2026-01-30T00:00:00Z" });
  assert.equal(r.consecutive_failures, 0); assert.equal(r.fallback_eligible, false); assert.equal(r.governed_refusals, 1);
  assert.deepEqual(await c.recordSourceOutcome({ addressNorm: addr, outcome: "maybe" }).then((x) => x.reason), "BAD_OUTCOME");
  assert.deepEqual(await c.recordSourceOutcome({ outcome: "success" }).then((x) => x.reason), "NO_ADDRESS");
  /* one failure never retried is not eligible, however old */
  await c.recordSourceOutcome({ addressNorm: "https://y.example/", outcome: "fetch_failed", at: "2026-01-01T00:00:00Z" });
  assert.equal(c.sourceReachability({ addressNorm: "https://y.example/", now: "2026-03-01T00:00:00Z" }).fallback_eligible, false);
  /* R43 (K120): the figures, record-core's instance settings else the defaults; a bad setting is never obeyed */
  assert.deepEqual(c.reachabilityThresholds(), REACHABILITY_DEFAULTS);
  const t = fresh();
  t.core.setSetting(REACHABILITY_SETTINGS.failures, 1, "member:admin");
  t.core.setSetting(REACHABILITY_SETTINGS.days, 0, "member:admin");
  t.core.setSetting(REACHABILITY_SETTINGS.minForAge, "abc", "member:admin");
  assert.deepEqual(t.c.reachabilityThresholds(), { failures: 1, days: 0, minForAge: 2 });
  await t.c.recordSourceOutcome({ addressNorm: addr, outcome: "fetch_failed" });
  assert.equal(t.c.sourceReachability({ addressNorm: addr }).fallback_eligible, true);
  assert.deepEqual(t.c.sourceReachability({ addressNorm: addr }).thresholds, { failures: 1, days: 0, minForAge: 2 });
  const z = fresh(); z.core.setSetting(REACHABILITY_SETTINGS.failures, 0, "member:admin");
  assert.equal(z.c.reachabilityThresholds().failures, 3, "a figure below its floor falls back");
  assert.equal(fresh({ env: { FALLBACK_CONSECUTIVE_FAILURES: "1" } }).c.reachabilityThresholds().failures, 3, "a binding is not the setting");
});

test("R44: listeners for source outcomes and tasks are called after the write, in registration order, and a failing one fails nothing", async () => {
  const { c, rows } = fresh();
  const heard = [];
  assert.equal(c.on("source-outcome", "a", (o) => { heard.push(["a", o.outcome, rows(`SELECT count(*) n FROM source_reachability`)[0].n]); }).ok, true);
  assert.equal(c.on("source-outcome", "b", () => { throw new Error("boom"); }).ok, true);
  assert.equal(c.on("source-outcome", "c", (o) => { heard.push(["c", o.outcome]); }).ok, true);
  assert.equal(c.on("source-outcome", "a", () => {}).reason, "LISTENER_DECLARED");
  assert.equal(c.on("nonsense", "a", () => {}).reason, "UNKNOWN_EVENT");
  const out = await c.recordSourceOutcome({ addressNorm: "https://x.example/", outcome: "fetch_failed" });
  assert.equal(out.ok, true);
  assert.deepEqual(heard, [["a", "fetch_failed", 1], ["c", "fetch_failed"]], "after the write, in order; b's throw failed nothing");
  c.on("task", "sched", async () => ({ armedAt: 42 }));
  c.on("task", "bad", async () => { throw new Error("x"); });
  const t = await c.taskEnqueue({ captureSha: A, subject: "s" });
  assert.equal(t.ok, true); assert.equal(t.armedAt, 42);
  assert.equal(rows(`SELECT count(*) n FROM task_queue`)[0].n, 1);
  const t2 = await c.taskEnqueue({ captureSha: A, subject: "s" });
  assert.equal(t2.deduped, true); assert.equal(t2.armedAt, 42, "a dedupe still calls the listeners: the drain is still owed");
});

test("R15: taskEnqueue accepts only a known kind and a 64-hex digest, bounds subject and locator, dedupes on (kind, digest)", async () => {
  const { c, rows } = fresh();
  assert.deepEqual(TASK_KINDS, ["authority-undetermined"]);
  assert.equal((await c.taskEnqueue({ kind: "other", captureSha: A })).reason, "BAD_KIND");
  assert.equal((await c.taskEnqueue({ captureSha: "abc" })).reason, "BAD_CAPTURE_SHA");
  assert.equal((await c.taskEnqueue({ captureSha: A.toUpperCase() })).reason, "BAD_CAPTURE_SHA");
  const r = await c.taskEnqueue({ captureSha: A, subject: "line one\nline two\u0007 " + "x".repeat(3000), locator: "y".repeat(2001), at: "2026-02-02T00:00:00Z" });
  assert.equal(r.ok, true); assert.equal(r.queued, true); assert.equal(r.deduped, false); assert.equal(r.enqueued, "2026-02-02T00:00:00Z");
  const row = rows(`SELECT * FROM task_queue`)[0];
  assert.ok(!/[\n\u0007]/.test(row.subject)); assert.ok(row.subject.length <= 2000); assert.equal(row.locator, null, "a locator over 2,000 is not kept");
  const again = await c.taskEnqueue({ captureSha: A, subject: "other" });
  assert.deepEqual([again.queued, again.deduped], [false, true]);
  assert.equal(rows(`SELECT count(*) n FROM task_queue`)[0].n, 1);
  await c.taskEnqueue({ captureSha: B, locator: "https://z.example/" });
  assert.equal(rows(`SELECT locator FROM task_queue WHERE capture_sha=?`, B)[0].locator, "https://z.example/");
});

test("R45: the event queue for its drainer: oldest first, count, attempt, remove, none throws", async () => {
  const { c } = fresh();
  await c.taskEnqueue({ captureSha: B, subject: "b", at: "2026-01-02T00:00:00Z" });
  await c.taskEnqueue({ captureSha: A, subject: "a", at: "2026-01-02T00:00:00Z" });
  await c.taskEnqueue({ captureSha: C, subject: "c", locator: "https://c.example/", at: "2026-01-01T00:00:00Z" });
  assert.equal(c.taskEventCount(), 3);
  const ev = c.taskEvents({ limit: 10 });
  assert.deepEqual(ev.map((e) => e.captureSha), [C, A, B], "by enqueued, then digest");
  assert.deepEqual(Object.keys(ev[0]).sort(), ["attempts", "captureSha", "enqueued", "kind", "lastTry", "locator", "subject"]);
  assert.equal(c.taskEvents({ limit: 1 }).length, 1);
  assert.deepEqual(c.taskEventAttempt({ kind: "authority-undetermined", captureSha: A, at: "2026-01-05T00:00:00Z" }), { found: true });
  const a = c.taskEvents({ limit: 10 }).find((e) => e.captureSha === A);
  assert.deepEqual([a.attempts, a.lastTry], [1, "2026-01-05T00:00:00Z"]);
  assert.deepEqual(c.taskEventAttempt({ kind: "authority-undetermined", captureSha: D, at: "x" }), { found: false });
  assert.deepEqual(c.taskEventRemove({ kind: "authority-undetermined", captureSha: A }), { found: true });
  assert.deepEqual(c.taskEventRemove({ kind: "authority-undetermined", captureSha: A }), { found: false });
  assert.equal(c.taskEventCount(), 2);
  assert.doesNotThrow(() => c.taskEvents({ limit: "nonsense" }));
});

test("R22 R46: a session holds resume state for its ttl; unknown or expired answers found: false; drop removes it; live sessions listed", () => {
  const { c } = fresh();
  const t0 = "2026-03-01T00:00:00Z";
  const s = c.saveCaptureSession({ session: "cs1", locator: "https://x.example/", primarySha: A, primaryFile: "snapshots/p",
                                   base: "https://x.example/", state: { outstanding: [1] }, ttlMs: 60000, at: t0 });
  assert.deepEqual([s.saved, s.ticks], [true, 1]);
  assert.equal(c.saveCaptureSession({ session: "cs1", locator: "https://x.example/", primarySha: A, primaryFile: "snapshots/p",
                                       base: "https://x.example/", state: { outstanding: [2] }, at: t0 }).ticks, 2);
  const ld = c.loadCaptureSession({ session: "cs1", at: "2026-03-01T00:00:30Z" });
  assert.deepEqual([ld.found, ld.primarySha, ld.state.outstanding[0]], [true, A, 2]);
  const live = c.liveCaptureSessions("2026-03-01T00:00:30Z");
  assert.equal(live.length, 1);
  assert.deepEqual(Object.keys(live[0]).sort(), ["base", "created", "expires", "locator", "primaryFile", "primarySha", "session", "state", "ticks", "updated"]);
  assert.deepEqual(c.liveCaptureSessions("2026-03-01T05:00:00Z"), [], "expiry is after now");
  assert.equal(c.loadCaptureSession({ session: "nope" }).found, false);
  assert.match(c.loadCaptureSession({ session: "nope" }).note, /never existed|expired/);
  c.saveCaptureSession({ session: "cs2", locator: "l", primarySha: B, primaryFile: "f", base: "b", state: {}, ttlMs: 1000, at: t0 });
  assert.equal(c.loadCaptureSession({ session: "cs2", at: "2026-03-01T00:00:05Z" }).found, false, "an expired session");
  c.saveCaptureSession({ session: "cs3", locator: "l", primarySha: B, primaryFile: "f", base: "b", state: {} });
  assert.equal(c.saveCaptureSession({ session: "cs4", locator: "l", primarySha: B, primaryFile: "f", base: "b" }).saved, false);
  assert.equal(c.loadCaptureSession({ session: "cs3" }).found, true, "default ttl is an hour");
  assert.deepEqual(c.dropCaptureSession({ session: "cs3" }), { session: "cs3", dropped: true });
  assert.equal(c.loadCaptureSession({ session: "cs3" }).found, false);
  assert.deepEqual(captureOf({ storage: { sql: { exec() { throw new Error("x"); } } } }, { record: null }).liveCaptureSessions(0), []);
});

test("R23: the ceiling is learned by being refused; an unrefused run records nothing about it; a move keeps the old value; probe due at 25", () => {
  const { c } = fresh();
  assert.deepEqual([c.captureLimit("subrequests").observed, c.captureLimit("subrequests").probeDue], [null, true]);
  const n = c.recordCaptureLimit({ runtime: "subrequests", observed: null });
  assert.equal(n.recorded, false); assert.match(n.note, /nothing about where it is/);
  assert.equal(c.captureLimit("subrequests").observed, null, "an unrefused run records no ceiling");
  c.recordCaptureLimit({ runtime: "subrequests", observed: 50, at: "2026-01-01T00:00:00Z" });
  assert.deepEqual([c.captureLimit("subrequests").observed, c.captureLimit("subrequests").probeDue], [50, false]);
  for (let i = 0; i < 24; i++) c.recordCaptureLimit({ runtime: "subrequests" });
  assert.equal(c.captureLimit("subrequests").probeDue, false);
  c.recordCaptureLimit({ runtime: "subrequests" });
  assert.equal(c.captureLimit("subrequests").probeDue, true, "25 unrefused runs since the observation");
  const m = c.recordCaptureLimit({ runtime: "subrequests", observed: 1000, at: "2026-02-01T00:00:00Z" });
  assert.deepEqual([m.moved, m.previous, m.observed], [true, 50, 1000]);
  const now = c.captureLimit("subrequests");
  assert.deepEqual([now.previous, now.moved_at, now.probeDue], [50, "2026-02-01T00:00:00Z", false]);
});

test("R24 R25: site assets count distinct document addresses, undetermined apart; a change updates, counts and appends posthoc verdicts naming the reusers; a reuse never moves last_fetched_by", () => {
  const { c, s, rows } = fresh();
  const host = "x.example";
  const obs = (sha256, extra = {}) => ({ address_norm: "https://x.example/a.css", address: "https://x.example/a.css", sha256, kind: "stylesheet", bytes: 3, ...extra });
  receipt(s, { address: "https://x.example/p1", capture: A, first: "2026-01-01T00:00:00Z" });
  receipt(s, { address: "https://x.example/p1", capture: B, first: "2026-01-02T00:00:00Z" });
  receipt(s, { address: "https://x.example/p2", capture: C, first: "2026-01-03T00:00:00Z" });
  assert.equal(c.recordSiteAssets({ host, primarySha: A, observations: [obs(H("1"))], at: "2026-01-01T00:00:00Z" }).added, 1);
  c.recordSiteAssets({ host, primarySha: B, observations: [obs(H("1"), { reused: true, reused_from: A })], at: "2026-01-02T00:00:00Z" });
  c.recordSiteAssets({ host, primarySha: D, observations: [obs(H("1"), { reused: true, reused_from: "not-a-sha" })], at: "2026-01-02T00:00:00Z" });
  let a = c.siteAssets({ host }).assets["https://x.example/a.css"];
  assert.equal(a.documents, 1, "A and B are one page (p1): documents counts addresses, not shas");
  assert.equal(a.documents_undetermined, 1, "D has no receipt: counted apart");
  assert.equal(a.last_fetched_by, A, "a reuse never moves last_fetched_by");
  assert.equal(rows(`SELECT reused_from FROM site_asset_refs WHERE primary_sha=?`, D)[0].reused_from, null, "a non-digest source is undetermined");
  const ch = c.recordSiteAssets({ host, primarySha: C, observations: [obs(H("2"))], at: "2026-01-03T00:00:00Z" });
  assert.equal(ch.changed, 1); assert.deepEqual(ch.changes[0].reused_by.sort(), [B, D].sort());
  a = c.siteAssets({ host }).assets["https://x.example/a.css"];
  assert.deepEqual([a.sha256, a.changes, a.last_fetched_by, a.stable_since], [H("2"), 1, C, "2026-01-03T00:00:00Z"]);
  assert.equal(a.documents, 2);
  const v = rows(`SELECT source_capture, phase, verdict, reused_sha, observed_sha FROM reuse_verdicts ORDER BY source_capture`);
  assert.deepEqual(v.map((x) => [x.source_capture, x.phase, x.verdict, x.reused_sha, x.observed_sha]),
                   [[B, "posthoc", "changed", H("1"), H("2")], [D, "posthoc", "changed", H("1"), H("2")]].sort());
  assert.deepEqual(Object.keys(c.siteAssets({ host, addresses: ["https://x.example/none"] }).assets), []);
  /* R25: a reused part's source is the reusing capture's own record */
  register(s, B, "INFO-1");
  const parts = c.reusedParts("INFO-1").parts;
  assert.deepEqual(parts.map((p) => [p.primary_sha, p.reused_from, p.reused_from_state]), [[B, A, "recorded"]]);
  register(s, D, "INFO-2");
  assert.equal(c.reusedParts("INFO-2").parts[0].reused_from_state, "undetermined");
});

test("R26: ratify verdicts are appended dated, never overwritten, listed newest first, and each maps to its observation", () => {
  const { c } = fresh();
  const seen = [];
  c.on("observation", "log", ({ row }) => { seen.push(row); return row.state === "LOOKED_INDETERMINATE" ? { reason: "R" } : null; });
  const v = (verdict) => ({ source_capture: A, host: "x.example", address_norm: `https://x.example/${verdict}`, verdict, reused_sha: H("1"), observed_sha: H("2") });
  const out = c.recordReuseVerdicts({ bundleId: "INFO-1", verdicts: [v("confirmed"), v("changed"), v("unreachable"), v("not_attempted")], at: "2026-01-01T00:00:00Z" });
  assert.equal(out.recorded, 4);
  assert.deepEqual(seen.map((r) => [r.state, r.detail, r.resultRef]),
                   [["PRESENT", "unchanged", H("1")], ["PRESENT", "changed", H("2")], ["LOOKED_INDETERMINATE", "unreachable", null]],
                   "not_attempted writes no observation");
  assert.deepEqual(out.observation_refusals, [{ reason: "R" }]);
  c.recordReuseVerdicts({ bundleId: "INFO-1", verdicts: [{ ...v("changed"), verdict: "confirmed" }], at: "2026-01-02T00:00:00Z" });
  const list = c.reuseVerdicts({ bundleId: "INFO-1" }).verdicts;
  assert.equal(list.length, 5, "nothing overwritten");
  assert.equal(list[0].at, "2026-01-02T00:00:00Z", "newest first");
  assert.ok(list.every((x) => x.phase === "ratify"));
  assert.equal(c.reuseVerdicts({ sourceCapture: A }).verdicts.length, 5);
});

test("R27: recordLinks replaces a capture's rows; linksTo answers every source and element; verdicts append; resolveLinks judges against direct receipts only", () => {
  const { c, s } = fresh();
  const T = "2026-05-10T00:00:00Z";
  const link = (address, extra = {}) => ({ ref: address, address, address_norm: address.split("#")[0],
                                          citation_norm: address, fragment: address.includes("#") ? address.split("#")[1] : null, type: "deferred", ...extra });
  c.recordLinks({ sourceCapture: A, capturedAt: T, links: [link("https://t.example/x"), link("https://t.example/r#findings"),
    link("https://t.example/r#method"), link("https://t.example/self"), link("https://t.example/one"), link("https://t.example/old"),
    link("https://t.example/new"), link("https://t.example/none"), link("https://t.example/arch"),
    { ref: "#top", address: "https://s.example/#top", address_norm: "https://s.example/", type: "anchor" }, { address_norm: null }] });
  assert.equal(c.recordLinks({ sourceCapture: A, capturedAt: T, links: [link("https://t.example/x"), link("https://t.example/r#findings"),
    link("https://t.example/r#method"), link("https://t.example/self"), link("https://t.example/one"), link("https://t.example/old"),
    link("https://t.example/new"), link("https://t.example/none"), link("https://t.example/arch"),
    { ref: "#top", address: "https://s.example/#top", address_norm: "https://s.example/", type: "anchor" }] }).recorded, 10, "replaced, not appended");
  const to = c.linksTo({ address_norm: "https://t.example/r" });
  assert.equal(to.count, 2); assert.deepEqual(to.elements.sort(), ["findings", "method"]);
  receipt(s, { address: "https://t.example/x", capture: B, first: "2026-05-01T00:00:00Z", last: "2026-05-20T00:00:00Z", observations: 2 });
  receipt(s, { address: "https://t.example/self", capture: A, first: T, last: T });
  receipt(s, { address: "https://t.example/one", capture: C, first: T, last: T });
  receipt(s, { address: "https://t.example/old", capture: C, first: "2026-01-01T00:00:00Z", last: "2026-01-01T00:00:00Z" });
  receipt(s, { address: "https://t.example/new", capture: D, first: "2026-06-01T00:00:00Z" });
  receipt(s, { address: "https://t.example/arch", capture: D, via: "archive.org", first: "2026-05-01T00:00:00Z", last: "2026-05-20T00:00:00Z", observations: 3 });
  register(s, B, "INFO-9");
  const r = c.resolveLinks({ sourceCapture: A });
  const by = Object.fromEntries(r.links.map((l) => [l.link_ref, l]));
  assert.equal(by["https://t.example/x"].verdict, "contemporaneous");
  assert.equal(by["https://t.example/x"].target_bundle, "INFO-9", "the target's home");
  assert.equal(by["https://t.example/self"].verdict, "undetermined"); assert.match(by["https://t.example/self"].basis, /the document itself/);
  assert.equal(by["https://t.example/one"].verdict, "undetermined"); assert.match(by["https://t.example/one"].detail, /one capture/);
  assert.equal(by["https://t.example/old"].verdict, "undetermined"); assert.match(by["https://t.example/old"].basis, /all predate/);
  assert.equal(by["https://t.example/new"].verdict, "superseded");
  assert.equal(by["https://t.example/none"].resolution, "offsite");
  assert.equal(by["https://t.example/arch"].resolution, "offsite", "archive receipts are not the target's direct receipts");
  assert.equal(by["#top"].resolution, "anchor");
  assert.match(r.note, /resting state/);
  /* bracketing captures differ */
  receipt(s, { address: "https://t.example/r", capture: B, first: "2026-05-01T00:00:00Z" });
  receipt(s, { address: "https://t.example/r", capture: C, first: "2026-05-20T00:00:00Z" });
  const r2 = c.resolveLinks({ sourceCapture: A }).links.find((l) => l.link_ref === "https://t.example/r#findings");
  assert.equal(r2.verdict, "undetermined"); assert.match(r2.detail, /bracketing captures differ/);
  /* recordLinkVerdict */
  c.recordLinkVerdict({ sourceCapture: A, addressNorm: "https://t.example/x", verdict: "undetermined", basis: "b1", at: "2026-05-11T00:00:00Z" });
  const lv = c.recordLinkVerdict({ sourceCapture: A, addressNorm: "https://t.example/x", verdict: "contemporaneous", basis: "b2", at: "2026-05-12T00:00:00Z" });
  assert.deepEqual([lv.current.verdict, lv.history.length, lv.changed], ["contemporaneous", 2, true]);
});

test("R27: what a viewer cannot see is never named or counted (D-701): a gated source is absent, a gated target is offsite", () => {
  const { c, s } = fresh();
  const T = "2026-05-10T00:00:00Z";
  s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('dave', 'd', 'member', 'active', '2026-01-01', '2026-01-01')`);
  register(s, A, "PROJ-1", { type: "project" });
  register(s, C, "PROJ-1");
  c.recordLinks({ sourceCapture: A, capturedAt: T, links: [{ ref: "u", address: "https://t.example/u", address_norm: "https://t.example/u", type: "deferred" }] });
  c.recordLinks({ sourceCapture: B, capturedAt: T, links: [{ ref: "u", address: "https://t.example/u", address_norm: "https://t.example/u", type: "deferred" }] });
  receipt(s, { address: "https://t.example/u", capture: A, first: T });
  assert.equal(c.linksTo({ address_norm: "https://t.example/u", viewer: "class:admin" }).count, 2, "a machine credential is not filtered");
  const dave = c.linksTo({ address_norm: "https://t.example/u", viewer: "member:dave" });
  assert.deepEqual([dave.count, dave.sources.map((x) => x.source_capture)], [1, [B]]);
  assert.equal(c.linksTo({ address_norm: "https://t.example/u", viewer: "nobody" }).count, 0, "an unrecognised viewer sees nothing");
  assert.equal(c.resolveLinks({ sourceCapture: A, viewer: "member:dave" }).resolved, 0, "a hidden source answers as not held");
  const viaB = c.resolveLinks({ sourceCapture: B, viewer: "member:dave" }).links[0];
  assert.equal(viaB.resolution, "offsite", "the only capture of the target is hidden");
  assert.equal(c.resolveLinks({ sourceCapture: B, viewer: "class:admin" }).links[0].target_bundle, "PROJ-1");
});

test("R28 R29: chrome only when contained AND recurring on two distinct pages; one page reads undetermined; derived per host, regenerable by scan; the per-host read names what navigation lost", () => {
  const { c, s, rows } = fresh();
  const nav = (addrs) => addrs.map((a) => ({ ref: a, address: a, address_norm: a, type: "deferred", chrome: true, chrome_basis: "<nav>" }));
  const cap = (sha, page, when, addrs) => { receipt(s, { address: page, capture: sha, first: when }); c.recordLinks({ sourceCapture: sha, capturedAt: when, links: nav(addrs) }); };
  cap(A, "https://h.example/p1", "2026-01-01T00:00:00Z", ["https://h.example/about", "https://h.example/works", "https://h.example/side"]);
  let ch = Object.fromEntries(c.chromeOf({ host: "h.example" }).links.map((l) => [l.address_norm, l]));
  assert.equal(ch["https://h.example/about"].state, "undetermined", "one page only: undetermined, never chrome");
  assert.match(ch["https://h.example/about"].basis, /one page/);
  cap(B, "https://h.example/p2", "2026-01-02T00:00:00Z", ["https://h.example/about", "https://h.example/works"]);
  ch = Object.fromEntries(c.chromeOf({ host: "h.example" }).links.map((l) => [l.address_norm, l]));
  assert.deepEqual([ch["https://h.example/about"].state, ch["https://h.example/about"].pages], ["chrome", 2]);
  assert.equal(ch["https://h.example/side"].state, "undetermined");
  assert.ok(ch["https://h.example/about"].at && /recurred on 2 distinct pages/.test(ch["https://h.example/about"].basis), "basis and date");
  cap(C, "https://h.example/p1", "2026-01-03T00:00:00Z", ["https://h.example/about"]);
  const nc = c.navChanges({ host: "h.example" });
  assert.equal(nc.observations, 3);
  assert.deepEqual(nc.lost.map((l) => l.address_norm), ["https://h.example/works"], "a recurring chrome link lost between B and C");
  assert.ok(nc.undetermined.some((u) => u.address_norm === "https://h.example/side"), "a one-page link is undetermined, never lost");
  assert.ok(nc.records.every((r) => r.fingerprint && Array.isArray(r.links)), "each navigation fingerprinted");
  assert.equal(rows(`SELECT count(*) n FROM links`)[0].n, 6, "a classification, never a deletion");
  /* regenerable by scan: wipe the derived rows and re-derive */
  const before = JSON.stringify(c.chromeOf({ host: "h.example" }).links.map(({ at, ...x }) => x));
  s.sql.exec(`DELETE FROM site_chrome`); s.sql.exec(`DELETE FROM site_chrome_refs`); s.sql.exec(`DELETE FROM link_chrome`);
  const d1 = c.deriveSiteChrome({ host: "h.example", limit: 2 });
  assert.deepEqual([d1.captures, d1.truncated], [2, true]);
  const d2 = c.deriveSiteChrome({ host: "h.example", limit: 2, after: d1.next });
  assert.deepEqual([d2.captures, d2.truncated], [1, false]);
  assert.equal(JSON.stringify(c.chromeOf({ host: "h.example" }).links.map(({ at, ...x }) => x)), before);
  assert.equal(c.navChanges({ host: "h.example" }).lost.length, 1);
});

test("R39: admission reclaims expired slots, waits over the cap, defers an unreserved or over-allowance render and counts it, else reserves and takes a slot", () => {
  const { c, rows } = fresh();
  const at = "2026-04-01T00:00:00Z";
  assert.equal(c.renderAdmit({ allowanceMs: 1000, reserveMs: 0, at }).state, "deferred", "an unreserved admission is refused");
  const a = c.renderAdmit({ allowanceMs: 1000, reserveMs: 400, cap: 2, at });
  assert.deepEqual([a.state, a.reserved_ms, typeof a.slot], ["admitted", 400, "string"]);
  const b = c.renderAdmit({ allowanceMs: 1000, reserveMs: 400.2, cap: 2, at });
  assert.deepEqual([b.state, b.reserved_ms], ["admitted", 801], "reservation ceiled");
  const w = c.renderAdmit({ allowanceMs: 1000, reserveMs: 1, cap: 2, at });
  assert.equal(w.state, "waiting"); assert.equal(rows(`SELECT deferred FROM render_allowance`)[0].deferred, 1, "a wait counts nothing");
  assert.equal(rows(`SELECT reserved_ms FROM render_allowance`)[0].reserved_ms, 801, "a wait reserves nothing");
  const d = c.renderAdmit({ allowanceMs: 1000, reserveMs: 400, at });
  assert.equal(d.state, "deferred"); assert.equal(d.deferred, 2, "over the allowance: deferred and counted");
  const later = c.renderAdmit({ allowanceMs: 5000, reserveMs: 100, cap: 2, at: "2026-04-01T00:00:01Z" });
  assert.equal(later.state, "admitted", "slots past their expiry are reclaimed");
  assert.equal(c.renderAdmit({ allowanceMs: 1000, reserveMs: 100, at: "2026-04-02T00:00:00Z" }).state, "admitted", "days are UTC dates");
});

test("R40: renderSpend frees the slot, adds the elapsed time ceiled, releases at most what is held, and an unreported render stays charged", () => {
  const { c, rows } = fresh();
  const at = "2026-04-01T00:00:00Z";
  const a = c.renderAdmit({ allowanceMs: 10000, reserveMs: 500, cap: 1, at });
  assert.equal(c.renderAdmit({ allowanceMs: 10000, reserveMs: 500, cap: 1, at }).state, "waiting");
  const sp = c.renderSpend({ ms: 120.3, releaseMs: 500, slot: a.slot, at });
  assert.deepEqual([sp.spent_ms, sp.reserved_ms, sp.released_ms], [121, 0, 500]);
  assert.equal(rows(`SELECT count(*) n FROM render_slots`)[0].n, 0);
  const b = c.renderAdmit({ allowanceMs: 10000, reserveMs: 300, cap: 1, at });
  const un = c.renderSpend({ slot: b.slot, releaseMs: 300, at });
  assert.deepEqual([un.reserved_ms, un.released_ms], [300, 0]); assert.match(un.why, /stays charged/);
  assert.equal(rows(`SELECT count(*) n FROM render_slots`)[0].n, 0, "the slot is freed on every path");
  assert.equal(c.renderSpend({ ms: 0, releaseMs: 99999, at }).reserved_ms, 0, "never below zero");
});

test("R59 (N166): source_reachability is a read contract: one row per address_norm, consecutive_failures counts the source's failures since its last success and never a governed refusal, first_failure_since is the first failure of the current run; a reader's own SQL finds the failing documents oldest run first", async () => {
  const { c, rows } = fresh();
  const cols = rows(`PRAGMA table_info(source_reachability)`).map((r) => r.name);
  for (const col of ["address_norm", "consecutive_failures", "first_failure_since"]) assert.ok(cols.includes(col), col);
  const row = (a) => rows(`SELECT address_norm, consecutive_failures, first_failure_since FROM source_reachability WHERE address_norm = ?`, a);
  const a = "https://a.example/doc", b = "https://b.example/doc", g = "https://g.example/doc";
  assert.deepEqual(row(a), [], "no row for an address never attempted");
  await c.recordSourceOutcome({ addressNorm: a, outcome: "success", status: 200, at: "2026-01-01T00:00:00Z" });
  assert.deepEqual({ ...row(a)[0] }, { address_norm: a, consecutive_failures: 0, first_failure_since: null }, "a success: no run");
  await c.recordSourceOutcome({ addressNorm: a, outcome: "source_refused", status: 503, at: "2026-01-02T00:00:00Z" });
  await c.recordSourceOutcome({ addressNorm: a, outcome: "governed", at: "2026-01-03T00:00:00Z" });
  await c.recordSourceOutcome({ addressNorm: a, outcome: "fetch_failed", at: "2026-01-04T00:00:00Z" });
  assert.deepEqual({ ...row(a)[0] }, { address_norm: a, consecutive_failures: 2, first_failure_since: "2026-01-02T00:00:00Z" },
                   "two failures the source produced; the governed refusal moved nothing; the run's first failure kept");
  assert.equal(rows(`SELECT count(*) n FROM source_reachability WHERE address_norm = ?`, a)[0].n, 1, "one row per address");
  for (const at of ["2026-01-05T00:00:00Z", "2026-01-06T00:00:00Z"]) await c.recordSourceOutcome({ addressNorm: g, outcome: "governed", at });
  assert.deepEqual({ ...row(g)[0] }, { address_norm: g, consecutive_failures: 0, first_failure_since: null }, "governed refusals alone are no run");
  await c.recordSourceOutcome({ addressNorm: b, outcome: "fetch_failed", at: "2025-12-31T00:00:00Z" });
  await c.recordSourceOutcome({ addressNorm: b, outcome: "source_refused", status: 404, at: "2026-01-07T00:00:00Z" });
  assert.equal(row(b)[0].first_failure_since, "2025-12-31T00:00:00Z");
  assert.match(row(b)[0].first_failure_since, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/, "a whole-second UTC instant");
  /* monitoring's reads, as its own SQL, at the floor R43's figures give */
  const TH = c.reachabilityThresholds();
  const floor = Math.max(1, Math.min(TH.failures, TH.minForAge));
  assert.equal(rows(`SELECT count(*) c FROM source_reachability WHERE consecutive_failures >= ?`, floor)[0].c, 2);
  assert.deepEqual(rows(`SELECT address_norm FROM source_reachability WHERE consecutive_failures >= ? ORDER BY first_failure_since LIMIT ?`, floor, 50)
                     .map((r) => r.address_norm), [b, a], "the oldest failing run first");
  /* a success ends the run */
  await c.recordSourceOutcome({ addressNorm: a, outcome: "success", status: 200, at: "2026-01-08T00:00:00Z" });
  assert.deepEqual({ ...row(a)[0] }, { address_norm: a, consecutive_failures: 0, first_failure_since: null });
  await c.recordSourceOutcome({ addressNorm: a, outcome: "fetch_failed", at: "2026-01-09T00:00:00Z" });
  assert.deepEqual([row(a)[0].consecutive_failures, row(a)[0].first_failure_since], [1, "2026-01-09T00:00:00Z"], "a new run starts at its own first failure");
  /* the reading agrees with the module's own answer */
  for (const x of [a, b, g]) {
    const r = c.sourceReachability({ addressNorm: x });
    assert.deepEqual([r.consecutive_failures, r.first_failure_since], [row(x)[0].consecutive_failures, row(x)[0].first_failure_since], x);
  }
});
