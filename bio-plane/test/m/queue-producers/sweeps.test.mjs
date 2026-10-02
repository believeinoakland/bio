/* The sweep and working-on-notice signals (R26, R27; K1036 (8), DEC-111, K1031) at feedItems' interface (R8), and the
   export log read from corpus-export (R2's export-performed; N483, K1122). `monitoring.sweepConditions` (its R63) and
   `network-notices.noticesOf` (its R22) are fakes answering in the shapes their requirements publish, filled per test;
   membership and record-core are real, so who is a project's member or owner (membership R65, R74) and who may see a
   sweep's bundle (its R43) are their own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { corpusExportOf, EXPORT_LOG_LIMIT_DEFAULT } from "../../../src/corpus-export/index.mjs";
import { QueueProducers } from "../../../src/queue-producers/index.mjs";

const DAY = 86400000;
const ofKind = (r, re) => r.items.filter((i) => re.test(i.kind));
const ids = (r, re) => ofKind(r, re).map((i) => i.id).sort();
const SWEEP_KINDS = ["sweep-held-backlog", "sweep-yield-anomaly", "sweep-seed-unreachable", "sweep-redirect-out-of-scope", "sweep-silent"];

/* PRJ-1 with its sweep bundle GATH-1 (alice and bob members, olga its owner); PRJ-H with GATH-H, which alice may not see;
   GATH-0 in no project; carl a member of nothing. */
function sweepWorld(conditions) {
  const asked = [];
  const w = world({ monitoring: { sweepConditions: (a) => { asked.push(a); return { ok: true, conditions: conditions() }; } } });
  for (const m of ["alice", "bob", "olga", "carl", "hana"]) w.member(m);
  w.bundle("PRJ-1", "project"); w.bundle("PRJ-H", "project");
  w.bundle("GATH-1", "information", { title: "Council agendas" }); w.bundle("GATH-H"); w.bundle("GATH-0");
  w.run(`UPDATE bundles SET project='PRJ-1' WHERE bundle_id='GATH-1'`);
  w.run(`UPDATE bundles SET project='PRJ-H' WHERE bundle_id='GATH-H'`);
  w.join("PRJ-1", "olga", { owner: true }); w.join("PRJ-1", "alice"); w.join("PRJ-1", "bob", { state: "leaving" });
  w.join("PRJ-H", "hana");
  return { w, asked };
}

const allFive = (sweep, at = iso(NOW - 3 * DAY)) => [
  { sweep, kind: "sweep-held-backlog", since: at, detail: { backlog: 40, limit: 40 } },
  { sweep, kind: "sweep-yield-anomaly", since: at, detail: { filed: 30, median: 3 } },
  { sweep, kind: "sweep-seed-unreachable", since: at, detail: { seeds: [{ seed: "https://x.example/list", reachability: { state: "fetch_failed" } }] } },
  { sweep, kind: "sweep-redirect-out-of-scope", since: at, detail: { redirects: [{ address: "https://x.example/a", target: "https://y.example/b" }] } },
  { sweep, kind: "sweep-silent", since: iso(NOW - 10 * DAY), detail: { runs: 4 } }];

test("R26: one CONDITION for each condition sweepConditions answers the viewer, the five sweep-* kinds, keyed CONDITION::<kind>::<bundle>#<id>, its subject the sweep's bundle, its age from since, its detail the condition's", () => {
  let conds = allFive("GATH-1#agendas");
  const { w, asked } = sweepWorld(() => conds);
  const r = w.read("alice");
  assert.deepEqual(asked.at(-1), { viewer: "member:alice", now: NOW }, "the viewer and the read's instant are monitoring's to read by");
  assert.deepEqual(ids(r, /^sweep-/), SWEEP_KINDS.map((k) => `CONDITION::${k}::GATH-1#agendas`).sort(), "each key as stated");
  const m = byId(r);
  for (const c of conds) {
    const it = m[`CONDITION::${c.kind}::GATH-1#agendas`];
    assert.deepEqual([it.class, it.kind], ["CONDITION", c.kind]);
    assert.deepEqual(it.subject, { kind: "bundle", id: "GATH-1", sweep: "GATH-1#agendas", sweep_id: "agendas", project: "PRJ-1" },
      "its subject the sweep's bundle");
    assert.deepEqual(it.age, { state: "determined", since: c.since, ms: NOW - Date.parse(c.since) }, "its age runs from since");
    assert.deepEqual(it.basis.condition, c.detail, "its detail comes from the condition, whole");
    assert.equal(it.basis.source, "monitoring.sweepConditions");
    assert.equal(typeof it.summary, "string"); assert.equal(typeof it.detail, "string");
    assert.deepEqual(it.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 0]], "homed under the sweep's project");
    assert.deepEqual(it.options, [{ id: "opt", on: ["GATH-1"] }], "R12: the acts on the sweep's record, which a member's change answers");
    assert.ok(!("disposition" in it) && !("catalogue_id" in it));
  }
  /* the sentences say what the condition's detail gives */
  assert.match(m["CONDITION::sweep-held-backlog::GATH-1#agendas"].detail, /40 of its captures .* limit of 40/);
  assert.match(m["CONDITION::sweep-yield-anomaly::GATH-1#agendas"].detail, /filed 30 against a median of 3/);
  assert.match(m["CONDITION::sweep-seed-unreachable::GATH-1#agendas"].detail, /https:\/\/x\.example\/list/);
  assert.match(m["CONDITION::sweep-redirect-out-of-scope::GATH-1#agendas"].detail, /https:\/\/x\.example\/a to https:\/\/y\.example\/b/);
  assert.match(m["CONDITION::sweep-silent::GATH-1#agendas"].summary, /last 4 runs/);
  assert.match(m["CONDITION::sweep-held-backlog::GATH-1#agendas"].summary, /"Council agendas" \(agendas\)/);
  /* each kind leaves when its condition leaves, the others standing */
  for (const k of SWEEP_KINDS) {
    conds = allFive("GATH-1#agendas").filter((c) => c.kind !== k);
    const now = ids(w.read("alice"), /^sweep-/);
    assert.ok(!now.includes(`CONDITION::${k}::GATH-1#agendas`), `${k} leaves with its condition`);
    assert.equal(now.length, 4);
  }
  conds = [];
  assert.deepEqual(ids(w.read("alice"), /^sweep-/), [], "nothing stands once monitoring answers nothing");
  /* a since monitoring could not date is undetermined, never this read's clock */
  conds = [{ sweep: "GATH-1#agendas", kind: "sweep-held-backlog", since: null, detail: { backlog: 1, limit: 1 } }];
  assert.equal(byId(w.read("alice"))["CONDITION::sweep-held-backlog::GATH-1#agendas"].age.state, "undetermined");
});

test("R26: it goes to the members of the sweep's project who may see its bundle, and to nobody else", () => {
  const conds = [...allFive("GATH-1#agendas"), ...allFive("GATH-H#hidden"), ...allFive("GATH-0#orphan")];
  /* monitoring gates by sight (its R63); a fake that answers every sweep to every viewer still yields only the right items */
  const { w } = sweepWorld(() => conds);
  const one = SWEEP_KINDS.map((k) => `CONDITION::${k}::GATH-1#agendas`).sort();
  assert.deepEqual(ids(w.read("alice"), /^sweep-/), one, "a joined member");
  assert.deepEqual(ids(w.read("bob"), /^sweep-/), one, "a leaving member is still a member");
  assert.deepEqual(ids(w.read("olga"), /^sweep-/), one, "the owner is a member");
  assert.deepEqual(ids(w.read("carl"), /^sweep-/), [], "a member of no project is told nothing");
  assert.deepEqual(ids(w.read("hana"), /^sweep-/), SWEEP_KINDS.map((k) => `CONDITION::${k}::GATH-H#hidden`).sort(),
    "hana, a member of the other project, sees only its sweep");
  assert.ok(!JSON.stringify(w.read("alice")).includes("GATH-H"), "R11: a sweep whose bundle alice may not see is named nowhere");
  assert.deepEqual(ids(w.read(null, "class:admin"), /^sweep-/), [], "a caller with no member is none of the members it goes to");
  assert.ok(!ofKind(w.read("olga"), /^sweep-/).some((i) => i.id.includes("GATH-0")), "a sweep in no project has no members");
  /* a member who joins the project but may not see the bundle: alice loses sight of GATH-1 when it moves to PRJ-H */
  w.run(`UPDATE bundles SET project='PRJ-H' WHERE bundle_id='GATH-1'`);
  assert.deepEqual(ids(w.read("alice"), /^sweep-/), [], "a member who may not see the sweep's bundle is given nothing");
  /* a kind monitoring does not publish, or a malformed name, mints nothing */
  conds.length = 0;
  conds.push({ sweep: "GATH-H#hidden", kind: "sweep-other", since: iso(NOW), detail: {} },
             { sweep: "GATH-H", kind: "sweep-silent", since: iso(NOW), detail: {} },
             { sweep: "GATH-H#", kind: "sweep-silent", since: iso(NOW), detail: {} });
  assert.deepEqual(ids(w.read("hana"), /^sweep-/), []);
});

/* PRJ-1 owned by olga and ada, alice a member and not an owner; each notice answered as network-notices R22 answers it. */
function noticeWorld(notices) {
  const asked = [];
  const w = world({ networkNotices: { noticesOf: (a) => { asked.push(a);
    return { ok: true, project: a.project, notices: a.project === "PRJ-1" ? notices() : [], sealed_weeks: [], methodVersion: 1 }; } } });
  for (const m of ["alice", "olga", "ada", "hana"]) w.member(m);
  w.bundle("PRJ-1", "project", { title: "Contracts" }); w.bundle("PRJ-2", "project");
  w.join("PRJ-1", "olga", { owner: true }); w.join("PRJ-1", "ada", { owner: true }); w.join("PRJ-1", "alice");
  w.join("PRJ-2", "hana", { owner: true });
  return { w, asked };
}
const monthly = (as_of, published_at = `${as_of}T00:05:00Z`, level = "Some work") =>
  ({ kind: "monthly", as_of, published_at, json: { activity: { level } } });
const notice = (id, status, extra = {}) => ({ notice: id, status, opened_at: "2026-05-01T10:00:00Z", revisions: [],
  attestations: [{ kind: "posted", as_of: "2026-05-01", published_at: "2026-05-01T10:00:00Z", json: { activity: { level: "Active" } } }],
  level: null, next_monthly: status === "open" ? "2026-10-01" : null, lapse_date: null, missed_monthlies: [], ...extra });

test("R27: notice-attestation-missed, for the owners of a project whose open notice missed a monthly attestation for want of a key, keyed CONDITION::notice-attestation-missed::<notice>; it leaves when one is issued", () => {
  let n = notice("WO-1", "open", { missed_monthlies: [{ month: "2026-08", at: "2026-08-01T00:00:00Z" }] });
  const { w, asked } = noticeWorld(() => [n]);
  const id = "CONDITION::notice-attestation-missed::WO-1";
  const it = byId(w.read("olga"))[id];
  assert.deepEqual(asked.at(-1), { project: "PRJ-1", viewer: "member:olga" }, "read through noticesOf, under the viewer");
  assert.deepEqual([it.class, it.kind, it.subject], ["CONDITION", "notice-attestation-missed",
    { kind: "notice", id: "WO-1", project: "PRJ-1", status: "open" }]);
  assert.deepEqual(it.age, { state: "determined", since: "2026-08-01T00:00:00Z", ms: NOW - Date.parse("2026-08-01T00:00:00Z") });
  assert.deepEqual([it.basis.source, it.basis.month, it.basis.recipients_rule], ["network-notices.noticesOf", "2026-08", "project_owners"]);
  assert.deepEqual(it.recipients, w.membership.projectOwners("PRJ-1"), "the project's owners, as membership R65 lists them");
  assert.deepEqual([...it.recipients].sort(), ["ada", "olga"]);
  assert.deepEqual(it.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 0]]);
  assert.ok(byId(w.read("ada"))[id], "every owner");
  assert.equal(byId(w.read("alice"))[id], undefined, "a member who is not an owner is told nothing");
  assert.equal(byId(w.read("hana"))[id], undefined, "nor the owner of another project");
  assert.equal(byId(w.read(null, "class:admin"))[id], undefined, "nor a caller with no member");
  /* a monthly issued before the miss does not answer it; one issued after it does */
  n = { ...n, attestations: [...n.attestations, monthly("2026-07-01")] };
  assert.ok(byId(w.read("olga"))[id], "an earlier monthly leaves it standing");
  n = { ...n, attestations: [...n.attestations, monthly("2026-09-01")] };
  assert.equal(byId(w.read("olga"))[id], undefined, "it leaves when a monthly is issued");
  /* a later miss raises it again; a stopped notice takes no monthly and raises nothing */
  n = { ...n, missed_monthlies: [...n.missed_monthlies, { month: "2026-10", at: "2026-10-01T00:00:00Z" }] };
  assert.ok(byId(w.read("olga", "member:olga", { now: Date.parse("2026-10-02T00:00:00Z") }))[id]);
  n = { ...n, status: "stopped" };
  assert.equal(byId(w.read("olga"))[id], undefined);
});

test("R27: notice-lapse-near, for the owners while a lapse is due within 7 days, keyed CONDITION::notice-lapse-near::<notice>; it leaves on a revision, a stop or the lapse", () => {
  let n = notice("WO-2", "open", { lapse_date: "2026-09-09", attestations: [monthly("2026-08-01", undefined, "Dormant")] });
  const { w } = noticeWorld(() => [n]);
  const id = "CONDITION::notice-lapse-near::WO-2";
  assert.equal(byId(w.read("olga"))[id], undefined, "8 days before the lapse: not yet");
  n = { ...n, lapse_date: "2026-09-08" };
  const it = byId(w.read("olga"))[id];
  assert.ok(it, "7 days before the lapse");
  assert.deepEqual([it.class, it.kind, it.basis.lapse_date, it.basis.window_days], ["CONDITION", "notice-lapse-near", "2026-09-08", 7]);
  assert.deepEqual(it.age, { state: "determined", since: "2026-09-01T00:00:00Z", ms: 0 }, "aged from the day the window opened");
  assert.deepEqual(it.options.map((o) => o.id), ["noticeprepare"], "a revision or a stop answers it (network-notices R6, R11)");
  assert.ok(!("due" in it), "R25: no due on it");
  assert.equal(byId(w.read("alice"))[id], undefined, "a non-owner is told nothing");
  n = { ...n, lapse_date: null };
  assert.equal(byId(w.read("olga"))[id], undefined, "a revision ends the running lapse, and it leaves");
  n = { ...n, lapse_date: "2026-09-08" };
  assert.ok(byId(w.read("olga"))[id]);
  n = { ...n, status: "stopped", lapse_date: null };
  assert.equal(byId(w.read("olga"))[id], undefined, "a stop");
  n = { ...n, status: "lapsed" };
  assert.equal(byId(w.read("olga"))[id], undefined, "the lapse");
});

test("R27: notice-project-closed, for the owners when the project closed while the notice was open, keyed CONDITION::notice-project-closed::<notice>; it leaves after 30 days or on an owner's stop", () => {
  const closedAt = "2026-08-10T12:00:00Z";
  let n = notice("WO-3", "closed", { attestations: [{ kind: "closed", as_of: "2026-08-10", published_at: closedAt, json: {} }] });
  const { w } = noticeWorld(() => [n]);
  const id = "CONDITION::notice-project-closed::WO-3";
  const it = byId(w.read("olga"))[id];
  assert.deepEqual([it.class, it.kind, it.subject.status], ["CONDITION", "notice-project-closed", "closed"]);
  assert.deepEqual(it.age, { state: "determined", since: closedAt, ms: NOW - Date.parse(closedAt) });
  assert.deepEqual(it.options.map((o) => o.id), ["noticeprepare"], "the owner's stop, which may add a handoff");
  assert.equal(byId(w.read("alice"))[id], undefined, "a non-owner is told nothing");
  const at = (d) => ({ now: Date.parse(closedAt) + d * DAY });
  assert.ok(byId(w.read("olga", "member:olga", at(29.9)))[id], "within 30 days");
  assert.equal(byId(w.read("olga", "member:olga", at(30)))[id], undefined, "after 30 days it leaves");
  n = { ...n, status: "stopped" };
  assert.equal(byId(w.read("olga"))[id], undefined, "an owner's stop");
  /* no other notice state raises it, and an open notice never does */
  n = notice("WO-3", "open");
  assert.deepEqual(ids(w.read("olga"), /^notice-/), []);
});

test("R8 (R26, R27): feedItems answers the sweep and notice signals homed through homesOf and optioned through optionsOf, as every other condition", () => {
  const w = world({
    monitoring: { sweepConditions: () => ({ ok: true, conditions: allFive("GATH-1#agendas") }) },
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
