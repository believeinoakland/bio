/* action-records' instance, tables and ops map at its interface (R11, R13, R15; was `actions` R36's six tables, R39;
   new R15, `case-account` R12's form). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, storage, V, M, MACHINE, A, B, HIDDEN, INFO, ledger, progressionsStandIn, standardsStandIn } from "./fixture.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import * as records from "../../../src/action-records/index.mjs";

const SIX = ["action_law_proposals", "action_risk_proposals", "action_seeks_proposals", "action_receipts", "action_scopes", "action_promises"];
const E1 = "ENT-2026-0001-council";
/* one row in each of the six tables for `id`, through the acts */
function fill(w, id) {
  const out = [
    w.r.actionLawsPropose({ target: id, laws: [{ level: "state", citation: "X" }], proposer: MACHINE, viewer: MACHINE }),
    w.r.actionRiskPropose({ target: id, tier: 2, basis: "b", proposer: MACHINE, viewer: MACHINE }),
    w.r.actionSeeksPropose({ target: id, seeks: [{ progression: "meeting", entity: E1, stage: "notice" }], proposer: MACHINE, viewer: MACHINE }),
    w.r.actionReceipt({ target: id, ord: 0, at: "2026-09-03", how: "by hand", account: "handed over", viewer: MACHINE, author: M }),
    w.r.actionScope({ target: id, confidential: true, reason: "r", viewer: MACHINE, author: M }),
    w.r.actionPromise({ target: id, kind: "other", text: "t", viewer: MACHINE, author: M })];
  for (const r of out) assert.equal(r.ok, true, JSON.stringify(r).slice(0, 200));
}

test("R11 the six tables (ACTION_RECORDS_TABLES) are this module's, keyed by bundle_id, declared once to record-core's purge as action-records; a bundle's purge clears its rows and no other's; every act answers an invisible action as an absent one", () => {
  assert.deepEqual([...records.ACTION_RECORDS_TABLES], SIX);
  assert.ok(Object.isFrozen(records.ACTION_RECORDS_TABLES));
  const w = world({ deps: { progressions: progressionsStandIn() } });
  const mine = w.record.declaredTables().filter((t) => SIX.includes(t.name));
  assert.deepEqual(mine.map((t) => [t.name, t.module, t.purge, t.sight]), SIX.map((n) => [n, "action-records", "clear", "bundle"]));
  for (const t of SIX) assert.ok(w.rows(`PRAGMA table_info(${t})`).some((c) => c.name === "bundle_id"), `${t} keyed by bundle_id`);
  for (const t of SIX) assert.equal(records.actionRecordsOwns(t), true, t);
  assert.equal(records.actionRecordsOwns({ name: "action_basis" }), false, "control: actions' own table");
  /* declared once: the same host's second call declares nothing again */
  assert.equal(w.make(), w.r);
  assert.equal(w.record.declaredTables().filter((t) => SIX.includes(t.name)).length, 6);
  w.action(A, ledger("sent")); w.action(B, ledger("sent"));
  fill(w, A); fill(w, B);
  w.record.purge({ bundleId: A });
  for (const t of SIX) {
    assert.equal(w.row(`SELECT COUNT(*) AS n FROM ${t} WHERE bundle_id=?`, A).n, 0, `${t}: the purged action's rows cleared`);
    assert.equal(w.row(`SELECT COUNT(*) AS n FROM ${t} WHERE bundle_id=?`, B).n, 1, `${t}: another action's rows kept`);
  }
  w.record.purge({});
  for (const t of SIX) assert.equal(w.row(`SELECT COUNT(*) AS n FROM ${t}`).n, 0, `${t}: the whole-store purge`);
  /* an invisible action is answered exactly as an absent one, by every act */
  const v = world({ deps: { progressions: progressionsStandIn() } });
  v.hidden(HIDDEN, ledger("sent"));
  const ABSENT = "ACTN-2026-0404-none";
  const asks = (target) => [
    v.r.actionLawsPropose({ target, laws: [{ level: "state", citation: "X" }], proposer: M, viewer: M }),
    v.r.actionRiskPropose({ target, tier: 2, basis: "b", proposer: M, viewer: M }),
    v.r.actionSeeksPropose({ target, seeks: [{ progression: "meeting", entity: E1, stage: "notice" }], proposer: M, viewer: M }),
    v.r.actionReceipt({ target, ord: 0, at: "2026-09-03", how: "h", account: "a", viewer: M, author: M }),
    v.r.actionScope({ target, confidential: true, reason: "r", viewer: M, author: M }),
    v.r.actionPromise({ target, kind: "other", text: "t", viewer: M, author: M })];
  const hid = asks(HIDDEN), abs = asks(ABSENT);
  hid.forEach((r, i) => assert.deepEqual({ ...r, target: null }, { ...abs[i], target: null }, `act ${i}: invisible as absent`));
  for (const r of hid) assert.deepEqual([r.reason, r.target], ["NO_SUCH_BUNDLE", HIDDEN]);
  for (const t of SIX) assert.equal(v.row(`SELECT COUNT(*) AS n FROM ${t}`).n, 0, t);
  fill(v, HIDDEN); /* control: a viewer who sees it (a machine credential, membership R43) */
});

test("R13 no place is named in this module's behaviour or outward text: with the test profile active, no answer of any act or read names a place", () => {
  const w = world({ profiles: ["test-port-ellery"], deps: { progressions: progressionsStandIn(), standards: standardsStandIn() } });
  assert.deepEqual(w.record.getSetting("jurisdiction_profiles"), ["test-port-ellery"], "the test profile is the active one");
  w.action(A, ledger("sent", "received"));
  w.doc(INFO);
  fill(w, A);
  const answers = [
    w.r.lawProposalsFor(A), w.r.riskProposalsFor(A), w.r.seeksProposalsFor(A), w.r.receiptsOf(A), w.r.scopeOf(A), w.r.promisesOf(A),
    w.r.lawProposalsFor(B), w.r.riskProposalsFor(B), w.r.seeksProposalsFor(B),
    w.r.lawEntries([]), w.r.lawEntries([{ level: "x" }]), w.r.badRiskTier(A, 9, "the act"), w.r.standardSeen("STD-2026-0404-x", M),
    w.r.seeksRefusal({ action_kind: "records_request", seeks: [{ progression: "zoning", entity: E1, stage: "x" }] }),
    w.r.actionLawsPropose({ target: A, laws: [{ level: "state", citation: "Y" }], proposer: M, viewer: M }),
    w.r.actionRiskPropose({ target: A, tier: 3, basis: "b", proposer: M, viewer: M }),
    w.r.actionReceipt({ target: A, ord: 1, at: "2026-09-03", how: "h", account: "a", viewer: M, author: M }),
    w.r.actionReceipt({ target: A, ord: 0, at: "2026-09-03", how: "h", artifactSha: "e".repeat(64), viewer: M, author: M }),
    w.r.actionScope({ target: A, confidential: false, reason: "r", viewer: M, author: M }),
    w.r.actionScope({ target: A, confidential: false, reason: "r", viewer: M, author: M }),
    w.r.actionPromise({ target: A, kind: "x", text: "t", viewer: M, author: M }),
    w.r.actionPromise({ target: A, kind: "other", text: "t", viewer: MACHINE, author: MACHINE })];
  const text = JSON.stringify(answers);
  for (const place of ["Port Ellery", "Oakland", "Alameda", "California", "Hayward"])
    assert.equal(text.includes(place), false, `no answer names ${place}`);
  /* control: the scan sees a place where one is written (the fixture's counterparty body is in the action's bytes) */
  assert.equal(w.text(A).includes("Port Ellery"), true);
});

test("R15 actionRecordsOf answers the one instance per host; its deps reached lazily on the host unless given; at creation it creates its six tables with actions' DDL, keeping a running store's rows and adding action_law_proposals' standard column where absent", () => {
  const w = world();
  assert.equal(records.actionRecordsOf(w.host), w.r, "the same instance, whatever deps a later caller gives");
  assert.equal(records.actionRecordsOf(w.host, { record: null }), w.r);
  assert.ok(w.r instanceof records.ActionRecords);
  /* deps not given are reached on the host: the real modules */
  assert.equal(typeof w.r.membership.memberList, "function", "membership on the host");
  assert.equal(typeof w.r.progressions.readProgression, "function", "progressions on the host");
  assert.equal(typeof w.r.standards.standardRead, "function", "standards on the host");
  /* given deps win */
  const prog = progressionsStandIn(), std = standardsStandIn();
  const g = world({ deps: { progressions: prog, standards: std } });
  assert.equal(g.r.progressions, prog); assert.equal(g.r.standards, std);
  /* a running store's tables, created by actions' DDL before the split and before `standard` existed, keep their rows */
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  st.db.exec(`CREATE TABLE action_law_proposals (bundle_id TEXT NOT NULL, proposed_by TEXT NOT NULL, ord INTEGER NOT NULL,
    level TEXT NOT NULL, citation TEXT NOT NULL, proposed_at TEXT NOT NULL, PRIMARY KEY (bundle_id, proposed_by, ord))`);
  st.db.exec(`INSERT INTO action_law_proposals VALUES ('${A}', 'class:daemon', 0, 'state', 'Old Act', '2026-01-01T00:00:00Z')`);
  st.db.exec(`CREATE TABLE action_scopes (bundle_id TEXT NOT NULL, seq INTEGER NOT NULL, confidential INTEGER NOT NULL,
    reason TEXT NOT NULL, by TEXT NOT NULL, at TEXT NOT NULL, PRIMARY KEY (bundle_id, seq))`);
  st.db.exec(`INSERT INTO action_scopes VALUES ('${A}', 1, 1, 'kept', 'member:alice', '2026-01-01T00:00:00Z')`);
  const record = recordOf(host, { evidence: null });
  record.migrate();
  const r = records.actionRecordsOf(host, { record });
  assert.ok(st.sql.exec(`PRAGMA table_info(action_law_proposals)`).toArray().some((c) => c.name === "standard"), "standard added");
  assert.deepEqual(r.lawProposalsFor(A).proposals.map((p) => p.laws), [[{ level: "state", citation: "Old Act" }]], "rows kept, no data move");
  assert.equal(r.confidential(A), true, "a scope stated before the split stands");
  for (const t of SIX) assert.ok(st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, t).toArray().length, t);
  r.migrate(); /* running it again changes nothing */
  assert.equal(r.lawProposalsFor(A).proposals.length, 1);
});

test("R15 a refused declaration is thrown at creation and no instance is kept; control: a host with its tables undeclared creates one", () => {
  const w = world({ create: false });
  const held = w.record.declarePurge("someone-else", ["action_scopes"]);
  assert.equal(held.ok === false, false, "the other module's declaration stands");
  assert.throws(() => w.make(), /action-records: its tables could not be declared \(TABLE_DECLARED/);
  assert.throws(() => w.make(), /TABLE_DECLARED/, "no instance was kept: a second call declares again");
  assert.equal(w.record.declaredTables().filter((t) => t.module === "action-records").length, 0, "nothing declared");
  const ok = world({ create: false });
  assert.ok(ok.make() instanceof records.ActionRecords);
});

test("R15 actionRecordsOps publishes one route arm per act, each answering exactly what its act answers; the target from the query, else the body; the stamps from the query only; a catalogue-backed refusal with its row", () => {
  const w = world({ deps: { progressions: progressionsStandIn() } });
  w.action(A, ledger("sent"));
  const ops = (qs, body = null) => records.actionRecordsOps(w.r, new URL(`https://x/?${qs}`), body);
  assert.deepEqual(Object.keys(ops("")), ["actionlawspropose", "actionseekspropose", "actionriskpropose", "actionreceipt",
    "actionscope", "actionpromise"]);
  for (const f of Object.values(ops(""))) assert.equal(typeof f, "function");
  /* the stamps are the query's: a body naming another proposer, author or viewer is not read */
  const lp = ops(`target=${A}&viewer=${MACHINE}&proposer=${MACHINE}`, { laws: [{ level: "state", citation: "X" }], proposer: M, viewer: M }).actionlawspropose();
  assert.deepEqual([lp.ok, lp.proposal.by], [true, MACHINE]);
  const noStamp = ops(`target=${A}`, { laws: [{ level: "state", citation: "X" }], proposer: M }).actionlawspropose();
  assert.equal(noStamp.reason, "NO_AUTHOR", "a body's proposer never stamps");
  const sc = ops(`viewer=${M}&author=${M}`, { target: A, confidential: true, reason: "r", author: V("bob") }).actionscope();
  assert.deepEqual([sc.ok, sc.by, sc.target], [true, M, A], "the target from the body when the query has none; the author the query's");
  const scNo = ops(`viewer=${M}`, { target: A, confidential: false, reason: "r", author: M }).actionscope();
  assert.equal(scNo.reason, "MACHINE_CANNOT_SET_SCOPE", "a body's author never stamps");
  assert.ok(scNo.check && scNo.translation, "with its row");
  /* the query's target wins over the body's */
  assert.equal(ops(`target=ACTN-2026-0404-x&viewer=${M}&proposer=${M}`, { target: A, tier: 1, basis: "b" }).actionriskpropose().reason, "NO_SUCH_BUNDLE");
  /* tier and basis from the query, else the body */
  const rk = ops(`target=${A}&viewer=${M}&proposer=${M}&tier=2`, { tier: 3, basis: "from the body" }).actionriskpropose();
  assert.deepEqual([rk.ok, rk.proposal.tier, rk.proposal.basis], [true, 2, "from the body"]);
  const bt = ops(`target=${A}&viewer=${M}&proposer=${M}&tier=9&basis=b`).actionriskpropose();
  assert.deepEqual([bt.reason, bt.check], ["BAD_RISK_TIER", "C-90.2"]);
  /* seeks from the body, else the query */
  const sk = ops(`target=${A}&viewer=${M}&proposer=${M}&seeks=${encodeURIComponent(JSON.stringify([{ progression: "budget", entity: E1, stage: "adopted" }]))}`).actionseekspropose();
  assert.deepEqual([sk.ok, sk.proposal.seeks.map((x) => x.stage)], [true, ["adopted"]]);
  /* receipt and promise: every field from the query, else the body */
  const rc = ops(`target=${A}&viewer=${M}&author=${M}`, { ord: 0, kind: "service", at: "2026-09-03", how: "post", party: "clerk", account: "a" }).actionreceipt();
  assert.deepEqual([rc.ok, rc.kind, rc.party, rc.how], [true, "service", "clerk", "post"]);
  const pm = ops(`target=${A}&viewer=${M}&author=${M}&kind=embargo`, { kind: "other", text: "until the 9th" }).actionpromise();
  assert.deepEqual([pm.ok, pm.kind, pm.text], [true, "embargo", "until the 9th"]);
  const ends = ops(`target=${A}&viewer=${M}&author=${M}&ends=${pm.seq}`, { kind: "embargo", text: "lifted" }).actionpromise();
  assert.deepEqual([ends.ok, ends.ends], [true, pm.seq]);
  /* exactly what the act answers: the same call through the act and through the op (on twin worlds) */
  const twin = () => { const t = world(); t.action(A, ledger("sent")); return t; };
  const t1 = twin(), t2 = twin();
  const viaAct = t1.r.actionPromise({ target: A, kind: "other", text: "t", viewer: M, author: M });
  const viaOp = records.actionRecordsOps(t2.r, new URL(`https://x/?target=${A}&kind=other&text=t&viewer=${M}&author=${M}`), null).actionpromise();
  assert.deepEqual(viaOp, viaAct);
});
