/* monitoring R29, R31, R36, R56–R64: the link sweep's run, reads, conditions and scope check, driven at the module's
   interface (`sweepDue`, `sweepWake`, `sweepTick`, `sweeps`, `sweepConditions`, the registered scope check, `op=sweeps`)
   over the real record, promotion, provenance, observation log and capture. Capture's `acquire` is the real module's
   method replaced on the instance by a scripted site in its answer shape (the bytes held in the evidence bucket, the
   document carrying the origin the caller declared), except in R36's test, which runs the real acquire over a scripted
   network (`acquisition` R31's redirect fence is that module's; this module's part is the scope it hands in). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, infoMd, sweepDef, NOW_MS, stubCaptureRequests } from "./fixture.mjs";
import { monitoringOps, SWEEP_TICK_BATCH, SWEEP_CONDITION_KINDS, SWEEP_ACTOR, MONITOR_PAUSE_SETTING, linksOf }
  from "../../../src/monitoring/index.mjs";
import { listFormats } from "../../../src/formats.mjs";
import { normalizeAddress } from "../../../src/subresources.mjs";

const DAY = 86400000, WEEK = 7 * DAY;
const PROJ = "PROJ-2026-0950-sweep";
const LIST = "INFO-2026-0950-list";
const NAME = `${LIST}#minutes`;
const SEED = "https://records.example.org/council/index.html";
const U = (p) => `https://records.example.org/council/${p}`;
const page = (links) => `<html><body>${links.map(([href, text]) => `<a href="${href}">${text}</a>`).join("\n")}</body></html>`;

/* A scripted site through capture's acquire: `site` maps a locator to {body, type} (a capture), {redirect} (refused out
   of scope), {fail} (refused with that status), or {governed}. Every call recorded. */
function site(w, map) {
  const calls = [];
  w.capture.acquire = async (body, opts) => {
    const cr = opts.captureRequest;
    calls.push({ locator: cr.locator, opts });
    const s = map[cr.locator];
    if (!s || s.fail) return { status: 502, body: { ok: false, reason: "SOURCE_REFUSED", status: s ? s.fail : 404 } };
    if (s.redirect) return { status: 422, body: { ok: false, reason: "SWEEP_REDIRECT_OUT_OF_SCOPE", code: "SWEEP_REDIRECT_OUT_OF_SCOPE", target: s.redirect } };
    if (s.governed) return { status: 429, body: { ok: false, reason: "HOST_COOLING_OFF" } };
    const bytes = Buffer.from(s.body);
    const h = sha(bytes);
    if (cr.heldSha === h) return { status: 200, body: { ok: true, existed: true, unchanged: true, capture: { sha256: h } } };
    w.bkt.held.set(`bio/captures/${h}`, new Uint8Array(bytes));
    return { status: 200, body: { ok: true, existed: s.existed === true, document: {
      file: `snapshots/c-${h.slice(0, 8)}`, locator: cr.locator, retrieved: new Date(w.clock.ms).toISOString().replace(/\.\d+Z$/, "Z"),
      authority: "the sweep", origin: cr.origin, attestation_attempts: [],
      capture: { sha256: h, method: "direct", grade: "B", actor_class: "daemon", encoding: "binary", bytes: bytes.length,
                 content_type: s.type || "text/html" } } } };
  };
  return calls;
}

/* The list bundle in PROJ (alice owns it), carrying `sweeps` and `daemon`, written by alice. */
function sweepWorld({ sweeps = [sweepDef()], daemon = undefined, capture = undefined } = {}) {
  const w = world(capture === undefined ? {} : { captureRequests: capture });
  w.inProject(PROJ, { owner: "alice", joined: ["bob"] });
  const write = (sw, d = daemon) => {
    const t = JSON.stringify({ ...(d ? { daemon: d } : {}), sweeps: sw });
    /* the seeds' snapshots a run filed are carried forward */
    const img = w.record.readImage(LIST) || {};
    const kept = Object.entries(img).filter(([p, v]) => p.startsWith("snapshots/") && typeof v === "object")
      .map(([path, v]) => ({ path, blobSha: v.blobSha, sha256: v.sha256, bytes: v.bytes }));
    return w.promote(LIST, infoMd(LIST, "https://records.example.org/list", { enabled: false, lines: [`project: ${PROJ}`] }),
      { files: [{ path: "data/gathering.json", text: t, bytes: Buffer.byteLength(t), sha256: sha(t) }, ...kept], author: "member:alice" });
  };
  const r = write(sweeps);
  if (!r.ok) throw new Error(JSON.stringify(r).slice(0, 400));
  return { w, write };
}
const runs = (w) => w.rows(`SELECT * FROM sweep_runs ORDER BY sweep, seq`).map((r) => ({ ...r, detail: JSON.parse(r.detail) }));
const filedBundles = (w) => w.rows(`SELECT b.bundle_id, b.current_state, b.project FROM bundles b WHERE b.bundle_id LIKE 'INFO-%-gathered' ORDER BY b.bundle_id`);

test("R29 R58 R59 R62 a ratified sweep's run: the seed read, one hop to the links its match admits in scope, each filed as its own Information bundle at collected in the list's project, its origin the sweep's, the seed capture named; one look per fetch", async () => {
  const { w } = sweepWorld({ sweeps: [sweepDef({ match: { terms: ["minutes"], paths: [U("m/")] } })] });
  const calls = site(w, {
    [SEED]: { body: page([[U("m/2026-09.html"), "Minutes, September"], [U("m/2026-08.html"), "Minutes, August"],
                          [U("agenda.html"), "Agenda"], [U("x/minutes.html"), "Minutes elsewhere"],
                          ["https://other.example.org/council/m/1.html", "Minutes off-site"], [U("m/2026-09.html#top"), "Minutes again"]]) },
    [U("m/2026-09.html")]: { body: "<html>September minutes</html>" },
    [U("m/2026-08.html")]: { body: "<html>August minutes</html>" },
    [U("m/2026-08.html") + "/next"]: { body: "never fetched: one hop" },
  });
  assert.equal(w.m.sweepDue(NOW_MS), NOW_MS, "never run: due");
  const t = await w.m.sweepTick(NOW_MS);
  assert.deepEqual(t.ran.map((r) => [r.sweep, r.fetched, r.filed]), [[NAME, 3, 2]]);
  assert.deepEqual(calls.map((c) => c.locator), [SEED, U("m/2026-09.html"), U("m/2026-08.html")], "one hop, seed order then link order");
  /* R57's origin and scope on every fetch */
  for (const c of calls) {
    assert.deepEqual(c.opts.captureRequest.origin, { kind: "sweep", matched_sweep: NAME, deeming_actor: SWEEP_ACTOR });
    assert.deepEqual(c.opts.captureRequest.scope, ["https://records.example.org/council"]);
    assert.equal(c.opts.cls, "daemon");
  }
  /* R59: filed at collected, in the list's project, origin as R57, the seed capture named */
  const filed = filedBundles(w);
  assert.equal(filed.length, 2);
  for (const f of filed) {
    assert.deepEqual([f.current_state, f.project], ["collected", PROJ]);
    const reg = JSON.parse(w.record.readFile(f.bundle_id, "data/provenance.json").text);
    assert.deepEqual(reg.documents[0].origin, { kind: "sweep", matched_sweep: NAME, deeming_actor: SWEEP_ACTOR });
    const notes = w.text(f.bundle_id).split("## Provenance Notes")[1];
    const seedSha = runs(w)[0].detail.seeds[0].sha;
    assert.ok(notes.includes(seedSha) && notes.includes(SEED), "the seed capture that listed it");
  }
  const d = runs(w)[0].detail;
  assert.deepEqual([d.candidates, d.matched], [5, 2], "the same address twice is one candidate; only in-scope, in-path, term-matching ones match");
  /* R62: one look per fetch, authority the sweep, PRESENT referring to the capture */
  const looks = w.looks().filter((l) => l.authority === NAME);
  assert.equal(looks.length, 3);
  assert.ok(looks.every((l) => l.authority_kind === "sweep" && l.level === "document" && l.state === "PRESENT" && /^[0-9a-f]{64}$/.test(l.result_ref)));
  /* R57: the seed's capture filed in the list bundle as a monitor snapshot, by a mechanical sweep promotion */
  assert.ok(w.record.livePaths(LIST).some((p) => p.startsWith(`snapshots/monitor-${d.seeds[0].sha.slice(0, 12)}-index.html`)));
  assert.equal(w.manifest(LIST).at(-1).operation, "sweep");
  /* R56: not due again until its cadence passes */
  assert.equal(w.m.sweepDue(NOW_MS + DAY), null);
  assert.equal(w.m.sweepWake(NOW_MS + DAY), NOW_MS + WEEK);
  assert.equal(w.m.sweepDue(NOW_MS + WEEK), NOW_MS + WEEK);
});

test("R58 the skips: already_swept, already_held and budget_spent, the budget counted with the seeds; R64 a request filed under the sweep counts toward per_run on its next run", async () => {
  const { w, write } = sweepWorld({ sweeps: [sweepDef({ budget: { per_run: 3, backlog: 50 }, seeds: [SEED, U("feed.xml")] })] });
  const docs = ["a", "b", "c", "d"].map((x) => U(`minutes-${x}.html`));
  site(w, { [SEED]: { body: page(docs.map((u, i) => [u, `Minutes ${i}`])) },
            [U("feed.xml")]: { body: `<rss><channel><item><title>Minutes feed</title><link>${docs[0]}</link></item></channel></rss>` },
            ...Object.fromEntries(docs.map((u) => [u, { body: `<p>${u}</p>` }])) });
  /* already held: the record holds a capture at docs[1] */
  w.monitored("INFO-2026-0951-held", docs[1], "held-bytes");
  w.prov.recordReceipt({ address: docs[1], addressNorm: normalizeAddress(docs[1]), captureSha: sha("held-bytes"),
    retrieved: "2026-09-20T00:00:00Z", via: "direct", context: { authorityKind: "sweep", authority: "x", actorClass: "plane", actor: null, observe: false } });
  const t = await w.m.sweepTick(NOW_MS);
  let d = runs(w)[0].detail;
  assert.deepEqual([t.ran[0].fetched, t.ran[0].filed], [3, 1], "two seeds and one candidate: the budget counts seeds");
  assert.deepEqual(d.skipped, { already_swept: 0, already_held: 1, budget_spent: 2 });
  /* next run: the filed one is already_swept; a request capture-requests filed under the sweep since spends one */
  w.monitored("INFO-2026-0952-req", docs[3], "requested-bytes", { enabled: false, row: { retrieved: new Date(NOW_MS + WEEK - 1000).toISOString(),
    origin: { kind: "sweep", matched_sweep: NAME, deeming_actor: "run:RUN-1" } } });
  w.clock.ms = NOW_MS + WEEK;
  await w.m.sweepTick(NOW_MS + WEEK);
  d = runs(w)[1].detail;
  assert.equal(d.budget.requests, 1, "R64: the request is counted");
  assert.equal(runs(w)[1].fetched, 2, "per_run 3, less the request: two fetches (the seeds)");
  assert.equal(d.seeds.filter((s) => s.outcome === "unchanged").length, 2, "R57: bytes equal to the last capture are unchanged");
  assert.deepEqual(d.skipped, { already_swept: 1, already_held: 1, budget_spent: 2 });
  /* daemon.sweep_budget 0: no fetch, and the run says so */
  write([sweepDef({ budget: { per_run: 3, backlog: 50 }, seeds: [SEED, U("feed.xml")] })], { enabled: true, sweep_budget: 0 });
  await w.m.sweepTick(NOW_MS + 2 * WEEK);
  const z = runs(w)[2];
  assert.equal(z.fetched, 0);
  assert.match(z.detail.note, /sweep_budget allows no fetch/);
});

test("R57 R62 the seeds: one that fails is recorded with capture's reachability and the run goes on; one redirected out of scope is recorded with its target; a governed fetch is marked governed; each writes its look", async () => {
  const { w } = sweepWorld({ sweeps: [sweepDef({ seeds: [U("gone.html"), U("moved.html"), U("slow.html"), SEED] })] });
  const calls = site(w, { [U("gone.html")]: { fail: 503 }, [U("moved.html")]: { redirect: "https://elsewhere.example.org/x" },
                          [U("slow.html")]: { governed: true }, [SEED]: { body: page([]) } });
  await w.capture.recordSourceOutcome({ addressNorm: U("gone.html"), outcome: "fetch_failed", at: "2026-09-20T00:00:00Z" });
  await w.m.sweepTick(NOW_MS);
  const d = runs(w)[0].detail;
  assert.deepEqual(d.seeds.map((s) => s.outcome), ["failed", "out_of_scope_redirect", "governed", "captured"]);
  assert.ok(d.seeds[0].reachability && typeof d.seeds[0].reachability === "object", "capture's reachability (its R8)");
  assert.equal(d.seeds[1].target, "https://elsewhere.example.org/x");
  assert.deepEqual(d.redirected, [{ address: U("moved.html"), target: "https://elsewhere.example.org/x" }]);
  assert.equal(calls.length, 4);
  const looks = w.looks().filter((l) => l.authority === NAME);
  assert.deepEqual(looks.map((l) => [l.state, l.governed]), [["LOOKED_INDETERMINATE", 0], ["LOOKED_INDETERMINATE", 0],
                                                              ["LOOKED_INDETERMINATE", 1], ["PRESENT", 0]]);
  assert.match(looks[1].detail, /out_of_scope_redirect/);
});

test("R59 R62 a fetched document of a format not in match.formats is not filed (format_excluded), its fetch still counted and looked at; a skipped candidate writes no look", async () => {
  assert.ok(listFormats().includes("pdf") && listFormats().includes("html"));
  const { w } = sweepWorld({ sweeps: [sweepDef({ match: { terms: ["minutes"], formats: ["pdf"] }, budget: { per_run: 2, backlog: 20 } })] });
  site(w, { [SEED]: { body: page([[U("m1.html"), "minutes 1"], [U("m2.pdf"), "minutes 2"], [U("m3.pdf"), "minutes 3"]]) },
            [U("m1.html")]: { body: "<!DOCTYPE html><html><body>minutes</body></html>" } });
  await w.m.sweepTick(NOW_MS);
  const r = runs(w)[0];
  assert.deepEqual([r.fetched, r.filed], [2, 0]);
  assert.deepEqual(r.detail.excluded, [{ address: U("m1.html"), format: "html" }]);
  assert.equal(r.detail.skipped.budget_spent, 2);
  const looks = w.looks().filter((l) => l.authority === NAME);
  assert.equal(looks.length, 2, "the seed and the excluded fetch; the skipped candidates wrote nothing");
  assert.match(looks[1].detail, /format_excluded/);
  assert.equal(filedBundles(w).length, 0);
});

test("R56 due only when ratified, not paused, daemon enabled, its project not closed and not held; at most 5 a tick, longest-overdue first then by name, the rank's order given one; claims and re-entrance", async () => {
  const many = Array.from({ length: 7 }, (_, i) => sweepDef({ id: `s${i}`, seeds: [U(`s${i}.html`)] }));
  const { w, write } = sweepWorld({ sweeps: many });
  site(w, Object.fromEntries(many.map((s) => [s.seeds[0], { body: page([]) }])));
  const t = await w.m.sweepTick(NOW_MS);
  assert.equal(SWEEP_TICK_BATCH, 5);
  assert.deepEqual(t.ran.map((r) => r.sweep), ["s0", "s1", "s2", "s3", "s4"].map((x) => `${LIST}#${x}`));
  assert.equal(w.m.sweepWake(NOW_MS), NOW_MS + 1000, "two still due");
  /* the rank: offered as {kind: "sweep", id, waitingSince}, run in its order */
  const seen = [];
  const t2 = await w.m.sweepTick(NOW_MS + 1, (items) => { seen.push(items); return [...items].reverse(); });
  assert.deepEqual(seen[0].map((x) => [x.kind, x.id, x.waitingSince]), [["sweep", `${LIST}#s5`, null], ["sweep", `${LIST}#s6`, null]]);
  assert.deepEqual(t2.ran.map((r) => r.sweep), [`${LIST}#s6`, `${LIST}#s5`]);
  assert.equal(w.m.sweepDue(NOW_MS + 2), null);
  /* longest-overdue first: s6 ran last, so after a week s0..s4 are older */
  /* not ratified, disabled, paused, closed: never due */
  const due = (now) => w.m.sweepDue(now) !== null;
  assert.equal(write([sweepDef({ ratified: false, seeds: [U("s0.html")] })]).ok, true);
  assert.equal(due(NOW_MS + 2 * WEEK), false, "not ratified");
  write([sweepDef({ seeds: [U("s0.html")] })], { enabled: false });
  assert.equal(due(NOW_MS + 2 * WEEK), false, "daemon.enabled false");
  write([sweepDef({ seeds: [U("s0.html")] })], { enabled: true });
  assert.equal(due(NOW_MS + 2 * WEEK), true, "the negative control");
  w.stages[PROJ] = "closed";
  assert.equal(due(NOW_MS + 2 * WEEK), false, "its project is closed");
  assert.equal(w.m.sweeps({ viewer: "member:alice", now: NOW_MS + 2 * WEEK }).sweeps[0].why, "its project is closed");
  w.stages[PROJ] = "matured";
  w.record.setSetting(MONITOR_PAUSE_SETTING, { paused: true, by: "class:admin", at: "2026-09-28T00:00:00Z" }, "class:admin");
  assert.equal(due(NOW_MS + 2 * WEEK), false, "paused");
  assert.equal(w.m.sweepWake(NOW_MS + 2 * WEEK), NOW_MS + 2 * WEEK + 3600000, "a pause is looked at again one interval on");
  const p = await w.m.sweepTick(NOW_MS + 2 * WEEK);
  assert.deepEqual([p.paused.paused, p.ran.length], [true, 0]);
  w.record.setSetting(MONITOR_PAUSE_SETTING, { paused: false }, "class:admin");
  /* re-entrance (R22) and a claim an unfinished tick holds (R21) */
  let release;
  const hold = new Promise((r) => { release = r; });
  const real = w.capture.acquire;
  w.capture.acquire = async (...a) => { await hold; return real(...a); };
  const first = w.m.sweepTick(NOW_MS + 2 * WEEK);
  const second = await w.m.sweepTick(NOW_MS + 2 * WEEK);
  assert.equal(second.busy, true);
  release();
  assert.equal((await first).ran.length, 1);
});

test("R60 held: at or over budget.backlog the sweep does not run and every read says held: backlog; a backlog capture cannot read (null) holds it too; the scope check refuses a held sweep", async () => {
  const { w } = sweepWorld({ sweeps: [sweepDef({ budget: { per_run: 10, backlog: 2 } })] });
  site(w, { [SEED]: { body: page([[U("m1.html"), "minutes"], [U("m2.html"), "minutes"]]) },
            [U("m1.html")]: { body: "one" }, [U("m2.html")]: { body: "two" } });
  await w.m.sweepTick(NOW_MS);
  assert.equal(w.capture.heldCount({ sweep: NAME }), 2, "two documents still at collected (capture R82)");
  const s = w.m.sweeps({ viewer: "member:alice", now: NOW_MS + WEEK }).sweeps[0];
  assert.deepEqual([s.held, s.backlog, s.backlog_limit, s.due], ["backlog", 2, 2, false]);
  assert.equal(w.m.sweepDue(NOW_MS + WEEK), null);
  assert.equal(w.m.sweepWake(NOW_MS + WEEK), NOW_MS + WEEK + 3600000, "a held sweep is looked at again one interval on");
  /* below the ceiling it runs: the negative control */
  const real = w.capture.heldCount.bind(w.capture);
  w.capture.heldCount = () => 1;
  assert.equal(w.m.sweepDue(NOW_MS + WEEK), NOW_MS + WEEK);
  /* K1129: null is held, never 0 */
  w.capture.heldCount = () => null;
  assert.equal(w.m.sweepDue(NOW_MS + WEEK), null);
  assert.equal(w.m.sweeps({ viewer: "member:alice", now: NOW_MS + WEEK }).sweeps[0].held, "backlog");
  const check = w.captureRequests.registered[0].fn;
  assert.deepEqual(await check({ sweep: NAME, locators: [U("x")] }), { ok: false, reason: "held", detail: "the sweep's backlog is at or over its limit" });
  w.capture.heldCount = real;
});

/* A sweep whose runs file `yields` documents in turn, one run a week; answers each run's row. */
async function yields(list) {
  const { w } = sweepWorld({ sweeps: [sweepDef({ match: {}, budget: { per_run: 100, backlog: 1000 } })] });
  let n = 0;
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const links = Array.from({ length: list[i] }, () => { n++; return [U(`d${n}.html`), "doc"]; });
    site(w, { [SEED]: { body: page(links) + `<!-- run ${i} -->` }, ...Object.fromEntries(links.map(([u]) => [u, { body: u }])) });
    w.clock.ms = NOW_MS + i * WEEK;
    await w.m.sweepTick(NOW_MS + i * WEEK);
    out.push(runs(w).at(-1));
  }
  assert.deepEqual(out.map((r) => r.filed), list, "each run filed what it was offered");
  return { w, out };
}

test("R60 the anomaly once 4 runs exist: more than three times the median of the last 8 runs and more than 5, or 0 against a median of at least 2; at the edges; kept on the run and changing nothing else", async () => {
  const anomalies = async (list) => (await yields(list)).out.map((r) => (r.anomaly ? JSON.parse(r.anomaly) : null));
  assert.deepEqual((await anomalies([2, 2, 2, 7])).at(-1), { kind: "surge", filed: 7, median: 2 });
  assert.equal((await anomalies([2, 2, 2, 6])).at(-1), null, "6 is not more than three times 2");
  assert.equal((await anomalies([1, 1, 1, 5])).at(-1), null, "5 is not more than 5");
  assert.deepEqual((await anomalies([2, 3, 2, 0])).at(-1), { kind: "dry", filed: 0, median: 2 });
  assert.equal((await anomalies([1, 2, 1, 0])).at(-1), null, "0 against a median of 1");
  assert.deepEqual(await anomalies([2, 2, 9]), [null, null, null], "3 runs: no anomaly, whatever was filed");
  assert.equal((await anomalies([2, 2, 0])).at(-1), null);
});

test("R60 R63 silent: a sweep whose last 4 runs filed nothing, not held, at the edge of 3 and 4", async () => {
  const three = (await yields([1, 0, 0, 0])).w;
  assert.equal(three.m.sweeps({ viewer: "member:alice" }).sweeps[0].silent, false, "the last 4 runs include one that filed");
  const { w } = await yields([0, 0, 0, 0]);
  assert.equal(w.m.sweeps({ viewer: "member:alice" }).sweeps[0].silent, true);
  assert.deepEqual(w.m.sweepConditions({ viewer: "member:alice" }).conditions.map((c) => c.kind), ["sweep-silent"]);
  w.capture.heldCount = () => null;
  assert.equal(w.m.sweeps({ viewer: "member:alice" }).sweeps[0].silent, false, "a held sweep is not silent");
});
