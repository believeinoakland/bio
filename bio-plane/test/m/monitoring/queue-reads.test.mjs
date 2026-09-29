/* monitoring R47 and R48 (N330, K406): the two reads `queue` makes instead of `source_reachability` and front matter —
   what the next unranked archive tick would find eligible, and the monitored documents the viewer may see whose last
   tick flagged them. Driven at the interface over the real capture record (R8's outcomes) and real ticks (R8's flag). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, serve, infoMd, V, DAEMON, NOW, NOW_MS } from "./fixture.mjs";
import { MONITOR_TICK_BATCH, FLAGGED_LIMIT_MAX } from "../../../src/monitoring/index.mjs";

const ADMIN = "class:admin";
const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");
/* An address with `n` counted failures, its run starting at `at` (capture's own record, R8). */
const failing = async (w, addr, n = 3, at = "2026-09-20T00:00:00Z") => {
  for (let i = 0; i < n; i++) await w.capture.recordSourceOutcome({ addressNorm: addr, outcome: "fetch_failed", at });
};
const tick = (w, id) => w.m.monitor({ bundleId: id, viewer: DAEMON, actorClass: "machine", actor: DAEMON });
/* What a read must leave as it was. */
const state = (w) => JSON.stringify(["source_reachability", "monitor_fired", "monitor_tick_epoch", "observation_log", "manifest"]
  .map((t) => w.rows(`SELECT count(*) c FROM ${t}`)[0].c));

test("R47 archiveEligible(now): of at most 50 addresses at the floor, oldest failing run first, those capture answers fallback_eligible, each {address, first_failure_since, reachability}, with limit, truncated and paused; the same the next unranked archive tick finds; writes nothing", async () => {
  const w = world();
  /* below the floor: one failure is not monitoring work (R20) */
  await failing(w, "https://gone.example.org/one", 1);
  /* at the floor but not eligible: two failures, a young run (capture R8's age arm needs 14 days) */
  await failing(w, "https://gone.example.org/young", 2, "2026-09-27T00:00:00Z");
  /* eligible by count, and by age */
  await failing(w, "https://gone.example.org/count", 3, "2026-09-20T00:00:00Z");
  await failing(w, "https://gone.example.org/age", 2, "2026-09-01T00:00:00Z");
  const before = state(w);
  const r = w.m.archiveEligible(NOW_MS);
  assert.equal(state(w), before, "nothing written");
  assert.equal(r.ok, true);
  assert.deepEqual(r.eligible.map((e) => e.address), ["https://gone.example.org/age", "https://gone.example.org/count"],
    "oldest failing run first; the young run and the single failure are not eligible");
  for (const e of r.eligible) {
    assert.deepEqual(Object.keys(e), ["address", "first_failure_since", "reachability"]);
    assert.deepEqual(e.reachability, w.capture.sourceReachability({ addressNorm: e.address, now: iso(NOW_MS) }),
      "capture's own answer, carried whole");
  }
  assert.equal(r.eligible[0].first_failure_since, "2026-09-01T00:00:00Z");
  assert.deepEqual([r.limit, r.truncated, r.paused], [MONITOR_TICK_BATCH, false, { paused: false }]);
  assert.equal(r.at, iso(NOW_MS));
  /* the same addresses the next unranked archive tick finds eligible */
  w.capture.acquire = async () => ({ status: 200, body: { ok: true, document: { capture: { grade: "C" }, provenance_chain: [] } } });
  const t = await w.m.archiveTick(NOW_MS);
  assert.deepEqual(t.eligible, r.eligible.map((e) => e.address));
});

test("R47 a 51st address at the floor gives truncated; the 50 read are the oldest failing runs", async () => {
  const w = world();
  const base = Date.parse("2026-09-01T00:00:00Z");
  for (let i = 0; i < 51; i++) await failing(w, `https://gone.example.org/${String(i).padStart(2, "0")}`, 3, iso(base + i * 1000));
  const r = w.m.archiveEligible(NOW_MS);
  assert.equal(r.truncated, true);
  assert.equal(r.eligible.length, 50);
  assert.equal(r.eligible.at(-1).address, "https://gone.example.org/49");
  assert.equal(r.eligible.some((e) => e.address === "https://gone.example.org/50"), false, "the newest run is past the bound");
  /* exactly 50 at the floor is not truncated */
  const x = world();
  for (let i = 0; i < 50; i++) await failing(x, `https://gone.example.org/${i}`, 3);
  assert.deepEqual([x.m.archiveEligible(NOW_MS).truncated, x.m.archiveEligible(NOW_MS).eligible.length], [false, 50]);
});

test("R47 a paused daemon still lists its eligible addresses, with paused set (R30)", async () => {
  const w = world();
  await failing(w, "https://gone.example.org/p", 3);
  assert.equal(w.m.pause({ paused: true, by: ADMIN }).ok, true);
  const r = w.m.archiveEligible(NOW_MS);
  assert.deepEqual(r.eligible.map((e) => e.address), ["https://gone.example.org/p"]);
  assert.deepEqual(r.paused, { paused: true, by: ADMIN, at: iso(NOW_MS) });
  /* while the tick itself fires nothing */
  assert.deepEqual((await w.m.archiveTick(NOW_MS)).fired, []);
});

test("R47 never throws: a read that fails answers ok false in words, with limit, truncated and paused", async () => {
  const w = world();
  await failing(w, "https://gone.example.org/t", 3);
  w.capture.sourceReachability = () => { throw new Error("capture unavailable"); };
  let r;
  assert.doesNotThrow(() => { r = w.m.archiveEligible(NOW_MS); });
  assert.equal(r.ok, false);
  assert.equal(r.reason, null, "no bare code of this module's (DEC-49)");
  assert.match(r.detail, /capture unavailable/);
  assert.deepEqual([r.eligible, r.limit, r.truncated, r.paused], [[], MONITOR_TICK_BATCH, false, { paused: false }]);
});

const LOC = (n) => `https://records.example.org/flag-${n}.txt`;
/* A monitored document ticked `modified` (flagged by R8), or `removed`. */
async function flaggedDoc(w, id, n, how = "modified") {
  w.monitored(id, LOC(n), `flag v1 ${n}`, { freq: "daily" });
  w.net.routes[LOC(n)] = how === "removed" ? serve("gone", "text/plain", 404) : serve(`flag v2 ${n}`);
  const r = await tick(w, id);
  assert.equal(r.body.reeval_raised, true, `${id} flagged`);
  return r;
}

test("R48 flagged({viewer, limit}): the monitored documents whose last tick flagged them, each {bundleId, source_status, since}, in id order; unflagged and unmonitored documents are not listed; writes nothing", async () => {
  const w = world();
  const b = await flaggedDoc(w, "INFO-2026-0502-b", 2);
  const a = await flaggedDoc(w, "INFO-2026-0501-a", 1, "removed");
  /* ticked, unchanged: not flagged */
  w.monitored("INFO-2026-0503-quiet", LOC(3), "quiet", { freq: "daily" });
  w.net.routes[LOC(3)] = serve("quiet");
  assert.equal((await tick(w, "INFO-2026-0503-quiet")).body.reeval_raised, false);
  /* a flag whose source is not the tick's, and a flagged document that is not monitored */
  w.promote("INFO-2026-0504-other", infoMd("INFO-2026-0504-other", LOC(4), {}).replace("  flag: false\n  since: null\n  source: null",
    "  flag: true\n  since: 2026-09-20T00:00:00Z\n  source: annotation"));
  w.promote("INFO-2026-0505-off", infoMd("INFO-2026-0505-off", LOC(5), { enabled: false }).replace("  flag: false\n  since: null\n  source: null",
    "  flag: true\n  since: 2026-09-20T00:00:00Z\n  source: source_status"));
  const before = state(w);
  const r = w.m.flagged({ viewer: DAEMON });
  assert.equal(state(w), before, "nothing written");
  assert.deepEqual(r, { ok: true, items: [
    { bundleId: "INFO-2026-0501-a", source_status: "removed", since: a.body.checked },
    { bundleId: "INFO-2026-0502-b", source_status: "modified", since: b.body.checked },
  ], limit: FLAGGED_LIMIT_MAX, truncated: false });
});

test("R48 at most limit (1–200, default 200), truncated when more follow", async () => {
  const w = world();
  for (let i = 1; i <= 3; i++) await flaggedDoc(w, `INFO-2026-051${i}-f`, 10 + i);
  const one = w.m.flagged({ viewer: DAEMON, limit: 2 });
  assert.deepEqual([one.items.map((x) => x.bundleId), one.limit, one.truncated], [["INFO-2026-0511-f", "INFO-2026-0512-f"], 2, true]);
  assert.deepEqual([w.m.flagged({ viewer: DAEMON, limit: 3 }).truncated, w.m.flagged({ viewer: DAEMON, limit: 3 }).items.length], [false, 3]);
  assert.equal(w.m.flagged({ viewer: DAEMON, limit: 5000 }).limit, 200, "clamped to 200");
  assert.equal(w.m.flagged({ viewer: DAEMON, limit: 0 }).limit, 200, "no usable limit is the default");
  assert.equal(w.m.flagged({ viewer: DAEMON }).limit, 200);
});

test("R48 reads past more than one page of monitored documents to find its flagged ones (K391's cut is over flagged documents, not ids)", async () => {
  const w = world();
  for (let i = 0; i < 205; i++) w.promote(`INFO-2026-1${String(i).padStart(3, "0")}-q`, infoMd(`INFO-2026-1${String(i).padStart(3, "0")}-q`, LOC(`q${i}`)));
  await flaggedDoc(w, "INFO-2026-2000-late", 99);
  assert.deepEqual(w.m.flagged({ viewer: DAEMON, limit: 1 }).items.map((x) => x.bundleId), ["INFO-2026-2000-late"]);
});

test("R48 a hidden flagged document is neither listed nor counted (K391)", async () => {
  const w = world();
  await flaggedDoc(w, "INFO-2026-0521-hidden", 21);
  await flaggedDoc(w, "INFO-2026-0522-seen", 22);
  await flaggedDoc(w, "INFO-2026-0523-seen", 23);
  /* the first is a project of carol's, hidden from every member session that is not a participant */
  w.st.sql.exec(`UPDATE bundles SET object_type='project' WHERE bundle_id=?`, "INFO-2026-0521-hidden");
  w.st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES (?, 'carol', 'joined', 1, ?, ?)`,
    "INFO-2026-0521-hidden", NOW, NOW);
  const d = w.m.flagged({ viewer: V("dave"), limit: 2 });
  assert.deepEqual(d.items.map((x) => x.bundleId), ["INFO-2026-0522-seen", "INFO-2026-0523-seen"]);
  assert.equal(d.truncated, false, "the hidden one is not counted as more to follow");
  assert.equal(JSON.stringify(d).includes("0521"), false);
  /* its member sees it */
  assert.deepEqual(w.m.flagged({ viewer: V("carol"), limit: 2 }).items.map((x) => x.bundleId),
    ["INFO-2026-0521-hidden", "INFO-2026-0522-seen"]);
  assert.equal(w.m.flagged({ viewer: V("carol"), limit: 2 }).truncated, true);
});

test("R48 a restyled tick is not flagged (R8: a change assess settles raises no flag)", async () => {
  const w = world();
  /* A meeting calendar served by ASP.NET WebForms (a certain stack): only the site header, outside the substance, moves. */
  const cal = (header) => `<html><head><title>Calendar</title></head><body><form id="aspnetForm"><input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="abc" />
<div id="ctl00_divTop">${header}</div>
<main id="mainContent" role="main">
<input id="ctl00_lstYears_Input" value="This Month" />
<table><tr><td><a href="MeetingDetail.aspx?ID=1&amp;GUID=x">Harbor Commission</a></td><td>3/3/2026</td><td>Not available</td><td>Not available</td></tr></table>
</main></form></body></html>`;
  const loc = "https://agendas.example.org/Calendar.aspx";
  const H = { "content-type": "text/html; charset=utf-8", "x-aspnet-version": "4.0.30319", "x-powered-by": "ASP.NET" };
  const id = "INFO-2026-0531-restyled";
  w.monitored(id, loc, cal("site header"));
  w.net.routes[loc] = () => new Response(cal("new header"), { headers: H });
  const r = await tick(w, id);
  assert.deepEqual([r.body.status, r.body.assessment.verdict, r.body.reeval_raised], ["modified", "restyled", false]);
  assert.deepEqual(w.m.flagged({ viewer: DAEMON }).items, []);
  /* and the same document, its substance changed, is listed: the negative control */
  w.net.routes[loc] = () => new Response(cal("new header").replace("Harbor Commission", "Harbor Commission - CANCELLED"), { headers: H });
  const c = await tick(w, id);
  assert.equal(c.body.reeval_raised, true, c.body.assessment && c.body.assessment.verdict);
  assert.deepEqual(w.m.flagged({ viewer: DAEMON }).items.map((x) => x.bundleId), [id]);
});

test("R48 never throws: a read that fails answers ok false in words", () => {
  const w = world();
  w.st.db.exec(`DROP TABLE bundle_projection`);
  let r;
  assert.doesNotThrow(() => { r = w.m.flagged({ viewer: DAEMON }); });
  assert.deepEqual([r.ok, r.reason, r.items, r.truncated, r.limit], [false, null, [], false, FLAGGED_LIMIT_MAX]);
  assert.match(r.detail, /could not be read/);
});
