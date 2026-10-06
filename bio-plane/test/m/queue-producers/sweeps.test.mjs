/* The sweep and working-on-notice conditions (machinery-producers R4, R5; was this module's R26, R27, K1850) as feedItems
   answers them (R8), and the export log read from corpus-export (R2's export-performed; N483, K1122). The conditions' own
   arms are machinery-producers' tests; here only R8's: that feedItems answers them through the walk and options it was
   handed. `link-sweep.sweepConditions` and `network-notices.noticesOf` are fakes in their requirements' shapes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { corpusExportOf, EXPORT_LOG_LIMIT_DEFAULT } from "../../../src/corpus-export/index.mjs";
import { QueueProducers } from "../../../src/queue-producers/index.mjs";

const DAY = 86400000;
const SWEEP_KINDS = ["sweep-held-backlog", "sweep-yield-anomaly", "sweep-seed-unreachable", "sweep-redirect-out-of-scope", "sweep-silent"];

const allFive = (sweep, at = iso(NOW - 3 * DAY)) => [
  { sweep, kind: "sweep-held-backlog", since: at, detail: { backlog: 40, limit: 40 } },
  { sweep, kind: "sweep-yield-anomaly", since: at, detail: { filed: 30, median: 3 } },
  { sweep, kind: "sweep-seed-unreachable", since: at, detail: { seeds: [{ seed: "https://x.example/list", reachability: { state: "fetch_failed" } }] } },
  { sweep, kind: "sweep-redirect-out-of-scope", since: at, detail: { redirects: [{ address: "https://x.example/a", target: "https://y.example/b" }] } },
  { sweep, kind: "sweep-silent", since: iso(NOW - 10 * DAY), detail: { runs: 4 } }];

const notice = (id, status, extra = {}) => ({ notice: id, status, opened_at: "2026-05-01T10:00:00Z", revisions: [],
  attestations: [{ kind: "posted", as_of: "2026-05-01", published_at: "2026-05-01T10:00:00Z", json: { activity: { level: "Active" } } }],
  level: null, next_monthly: status === "open" ? "2026-10-01" : null, lapse_date: null, missed_monthlies: [], ...extra });


test("R8 (K1850; machinery-producers R4, R5): feedItems answers the sweep and notice conditions homed through homesOf and optioned through optionsOf, as every other condition", () => {
  const w = world({
    linkSweep: { sweepConditions: () => ({ ok: true, conditions: allFive("GATH-1#agendas") }) },
    networkNotices: { noticesOf: ({ project }) => ({ ok: true, project, sealed_weeks: [], methodVersion: 1, notices: project !== "PRJ-1" ? [] : [
      notice("WO-1", "open", { missed_monthlies: [{ month: "2026-08", at: "2026-08-01T00:00:00Z" }], lapse_date: "2026-09-05" }),
      notice("WO-3", "closed", { attestations: [{ kind: "closed", as_of: "2026-08-20", published_at: "2026-08-20T00:00:00Z" }] })] }) } });
  w.member("olga"); w.bundle("PRJ-1", "project"); w.bundle("GATH-1");
  w.run(`UPDATE bundles SET project='PRJ-1' WHERE bundle_id='GATH-1'`);
  w.join("PRJ-1", "olga", { owner: true });
  w.bundle("INQ-1", "inquiry"); w.cite("INQ-1", "GATH-1");       // the sweep's bundle is drawn on by a question
  const r = w.read("olga");
  const m = byId(r);
  const want = [...SWEEP_KINDS.map((k) => `CONDITION::${k}::GATH-1#agendas`),
    "CONDITION::notice-attestation-missed::WO-1", "CONDITION::notice-lapse-near::WO-1", "CONDITION::notice-project-closed::WO-3"];
  for (const id of want) {
    const it = m[id];
    assert.ok(it, id);
    assert.equal(it.class, "CONDITION");
    assert.ok(!("disposition" in it) && !("catalogue_id" in it), `${id}: the mint's and queue's`);
    assert.equal(it.case.state, "determined");
    assert.doesNotMatch(`${it.summary} ${it.detail}`, /\b(obligation|condition)s?\b/i, `${id}: R24's words`);
  }
  /* the sweep's homes: its project at depth 0 and the walk from its bundle (queue R7) */
  assert.deepEqual(m["CONDITION::sweep-silent::GATH-1#agendas"].case.ancestors.map((a) => [a.id, a.depth]), [["INQ-1", 1], ["PRJ-1", 0]]);
  assert.ok(w.asked.homes.some((s) => s.length === 1 && s[0] === "GATH-1"), "the walk asked from the sweep's bundle");
  assert.ok(w.asked.options.some((s) => s.length === 1 && s[0] === "GATH-1"));
  assert.deepEqual(m["CONDITION::notice-attestation-missed::WO-1"].options, [{ id: "opt", on: ["PRJ-1"] }]);
  /* without the walk, nothing is given a home it was not handed */
  const bare = w.read("olga", "member:olga", { homes: false, options: false });
  for (const it of bare.items) assert.deepEqual(it.case.ancestors.filter((a) => a.depth > 0), [], it.id);
});

test("N483 (R2): export-performed reads corpus-export's log through its own dep, its default bound corpus-export's, and nothing of publication's", () => {
  let asked = null;
  const w = world({ corpusExport: { exportLog: (a) => { asked = a; return { ok: true, limit: a.limit, truncated: true,
    exports: [{ seq: 7, at: iso(NOW - 60000), scope: "working-corpus", bundles: 2, files: 3, note: "hand-off" }] }; } },
    publication: { exportLog: () => { throw new Error("publication's export log was read"); } } });
  w.member("ada", { role: "admin" });
  const it = byId(w.read("ada"))["FINDING::export-performed::7"];
  assert.deepEqual(asked, { limit: EXPORT_LOG_LIMIT_DEFAULT }, "corpus-export's own default bound (its R2: 200)");
  assert.equal(EXPORT_LOG_LIMIT_DEFAULT, 200);
  assert.deepEqual([it.basis.seq, it.basis.bounds.limit, it.basis.bounds.truncated, it.age.ms], [7, 200, true, 60000]);
  assert.match(it.detail, /row 7 of the append-only export log, noted "hand-off"/);
});

test("N483 (R2): handed no export-log dep, the producers read the host's one corpus-export instance (corpusExportOf), and the export it logged is told to an administrator", () => {
  const w = world({ publication: { exportLog: () => { throw new Error("publication's export log was read"); } } });
  w.member("ada", { role: "admin" }); w.member("alice");
  const { corpusExport, ...rest } = w.fakes;
  void corpusExport;
  const p = new QueueProducers({ host: w.host, storage: w.host.storage,
    deps: { record: w.record, membership: w.membership, credentials: w.credentials, ...rest } });
  const ce = corpusExportOf(w.host, { record: w.record });
  ce.exportManifest({ note: "the drill" });
  const [row] = ce.exportLog({}).exports;
  const feed = (member) => p.feedItems({ member, viewer: `member:${member}`, now: NOW });
  const it = byId(feed("ada"))[`FINDING::export-performed::${row.seq}`];
  assert.ok(it, "the logged export reaches the administrator through corpus-export's own instance");
  assert.equal(it.basis.note, "the drill");
  assert.ok(!feed("alice").items.some((i) => i.kind === "export-performed"), "and nobody else");
});
