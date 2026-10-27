/* doorbell, T51 fix round 9 (G126; K4835 (2), K4837; R28, amends R13): the pull registers the reading it owes as one job row, in its own
   transaction, through the registrar. At the module's interface (`pullKnock`, `inboxResolve`) over fixture.mjs, the registrar on test-support's
   `jobRegistrarStub`. Each test names the id it proves; each has its control (K874). Counts and rows only, never a time (R-CLOCK). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, sha, register } from "./fixture.mjs";
// fixtures-contract: plane job-registrar
import { jobRegistrarStub } from "../../job-registrar-stub.mjs";

const BY = "member:bob";
const AT = "2026-10-24T10:00:00Z";
const setup = () => {
  const b = bucket();
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  f.c.provenance.homeOf = (captureSha) => {
    const r = [...f.s.sql.exec(`SELECT r.bundle_id FROM register r JOIN bundles b ON b.bundle_id = r.bundle_id WHERE r.capture_sha = ?`, captureSha)][0];
    return r ? { bundleId: r.bundle_id } : null;
  };
  return { ...f, b, prov: f.c.provenance };
};
/* the registrar as plane wires it: a synchronous write the pull's transaction rolls back with, so the stub is made part of record-core's
   transaction (a throw or a refusal rolls its rows back as it rolls back the SQL rows) */
// fixtures-contract: plane job-registrar
const registrar = (w, store = w.cap) => {
  const j = jobRegistrarStub();
  store.registerJob = j.registerJob;
  store.armJobs = j.armJobs;
  const real = w.core.transact.bind(w.core);
  w.core.transact = (fn) => {
    try {
      return real(() => j.transact(() => { const out = fn(); if (out && typeof out === "object" && out.ok === false) throw Object.assign(new Error("refused"), { refused: out }); return out; }));
    } catch (e) { if (e && e.refused) return e.refused; throw e; }
  };
  return j;
};
const everything = (rows) => rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((r) => r.name)
  .map((t) => [t, JSON.stringify(rows(`SELECT * FROM ${t}`))]);
const knockOf = (w, text) => w.c.knock({ content: text, note: "n", sourceAddress: "1.1.1.1" });
const inboxRow = (w, id) => ({ ...w.rows(`SELECT status, capture_sha, pulled_by FROM inbox WHERE knock_id = ?`, id)[0] });

test("R28 (G126): a pull of new bytes leaves exactly one reading row, keyed by the capture's whole digest, registered with the pull and the alarm armed after it; the rest of the pull is R13's act", async () => {
  const w = setup(); const j = registrar(w);
  const k = await knockOf(w, "new bytes for the group");
  const d = sha("new bytes for the group");
  assert.deepEqual(j.rows(), [], "nothing is registered before the pull");
  const r = await w.c.pullKnock({ knockId: k.knockId, by: BY, at: AT });
  assert.equal(r.ok, true); assert.equal(r.existed, false);
  assert.equal(r.capture.sha256, d);
  assert.equal("jobs" in r, false, "a registrar held: the answer has no note of missing rows");
  const rows = j.rows();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].kind, "reading"); assert.equal(rows[0].sha, d); assert.equal(rows[0].carrier, r.document.file);
  assert.equal(j.armed(), true, "the alarm is armed after the commit");
  assert.deepEqual(inboxRow(w, k.knockId), { status: "pulled", capture_sha: d, pulled_by: BY });
  /* control: a pull through the reasoned resolve registers the same one row */
  const w2 = setup(); const j2 = registrar(w2);
  const k2 = await knockOf(w2, "resolved into the record");
  const r2 = await w2.c.inboxResolve({ knockId: k2.knockId, status: "pulled", by: BY, reason: "it is the lease", at: AT });
  assert.equal(r2.ok, true);
  assert.deepEqual(j2.rows().map((x) => [x.kind, x.sha]), [["reading", sha("resolved into the record")]]);
});

test("R28 (G126): a pull of bytes already pulled, or held by the record, registers nothing, and a second pull leaves the one row", async () => {
  const w = setup(); const j = registrar(w);
  const k = await knockOf(w, "pulled twice");
  await w.c.pullKnock({ knockId: k.knockId, by: BY, at: AT });
  const again = await w.c.pullKnock({ knockId: k.knockId, by: BY });
  assert.equal(again.existed, true);
  assert.equal(j.rows().length, 1, "a knock already pulled registers no second row");
  /* bytes the record already holds: the pull writes nothing, so no row */
  const h = setup(); const jh = registrar(h);
  const kh = await knockOf(h, "already in the record");
  register(h.s, sha("already in the record"), "BUNDLE-1");
  const rh = await h.c.pullKnock({ knockId: kh.knockId, by: BY, viewer: "member:alice", at: AT });
  assert.equal(rh.existed, true); assert.equal(rh.holder, "BUNDLE-1");
  assert.deepEqual(jh.rows(), [], "a pull of held bytes leaves no new row");
  /* idempotent: the registrar holds a row for the digest already; the pull re-arms it and adds none */
  const i = setup(); const ji = registrar(i);
  const ki = await knockOf(i, "row already there");
  ji.registerJob({ kind: "reading", sha: sha("row already there") });
  assert.equal((await i.c.pullKnock({ knockId: ki.knockId, by: BY, at: AT })).ok, true);
  assert.equal(ji.rows().length, 1);
});

test("R28 (G126): a registrar that refuses, or throws, rolls the pull back and is answered with the knock's id: no actor, the knock unpulled, no row; the same knock pulled with a working registrar is R13's act", async () => {
  // fixtures-generic: JOB_TABLE_FULL a refusal made up on purpose: the pull answers any registrar refusal as JOB_NOT_REGISTERED
  // fixtures-contract: plane job-registrar
  for (const bad of [() => ({ ok: false, reason: "JOB_TABLE_FULL" }), () => { throw new Error("down"); }, () => undefined]) {
    const w = setup(); registrar(w);
    const k = await knockOf(w, "refused by the registrar");
    w.cap.registerJob = bad;
    const before = everything(w.rows).filter(([t]) => t !== "inbox");
    const inboxBefore = inboxRow(w, k.knockId);
    const r = await w.c.pullKnock({ knockId: k.knockId, by: BY, at: AT });
    assert.equal(r.ok, false); assert.equal(r.reason, "JOB_NOT_REGISTERED"); assert.equal(r.knockId, k.knockId);
    assert.equal(typeof r.detail, "string"); assert.equal("document" in r, false);
    assert.equal(r.job.kind, "reading");
    /* the fixture's provenance keeps receipts in memory, outside the SQL transaction; the actor table is SQL, and is one of the tables compared */
    assert.deepEqual(everything(w.rows).filter(([t]) => t !== "inbox"), before, "no actor and no other row");
    assert.deepEqual(inboxRow(w, k.knockId), inboxBefore, "the knock is unpulled");
    /* the refusal reaches the reasoned resolve alike */
    const rr = await w.c.inboxResolve({ knockId: k.knockId, status: "pulled", by: BY, reason: "why", at: AT });
    assert.equal(rr.reason, "JOB_NOT_REGISTERED");
    /* control: with the registrar restored, the same knock is brought in */
    const j = registrar(w);
    const ok = await w.c.pullKnock({ knockId: k.knockId, by: BY, at: AT });
    assert.equal(ok.ok, true); assert.equal(j.rows().length, 1);
  }
});

test("R28 (G126): a kill between the held bytes and the transaction finds no pull and no row; the retry finds one row and no inline read; a within that refuses rolls the row back with the pull", async () => {
  const w = setup(); const j = registrar(w);
  const k = await knockOf(w, "killed in between");
  const d = sha("killed in between");
  const real = w.core.transact;
  w.core.transact = () => { throw new Error("killed"); };
  await assert.rejects(() => w.c.pullKnock({ knockId: k.knockId, by: BY, at: AT }), /killed/);
  w.core.transact = real;
  assert.equal(w.b.held.has(`bio/captures/${d}`) || [...w.b.held.keys()].some((x) => x.endsWith(d)), true, "the bytes were held before the transaction");
  assert.deepEqual(j.rows(), [], "no pull and no row");
  assert.equal(inboxRow(w, k.knockId).status, "new");
  const r = await w.c.pullKnock({ knockId: k.knockId, by: BY, at: AT });
  assert.equal(r.ok, true);
  assert.deepEqual(j.rows().map((x) => [x.kind, x.sha, x.written, x.state]), [["reading", d, 0, "queued"]], "one row, nothing read inline");
  /* within refusing: the row goes with the pull */
  const v = setup(); const jv = registrar(v);
  const kv = await knockOf(v, "within says no");
  const rv = await v.c.pullKnock({ knockId: kv.knockId, by: BY, at: AT, within: () => ({ ok: false, reason: "PROMOTION_REFUSED" }) });
  assert.equal(rv.reason, "PROMOTION_REFUSED");
  assert.deepEqual(jv.rows(), []);
  assert.equal(inboxRow(v, kv.knockId).status, "new");
});

test("R28 (G126): with no registrar the pull says so in its answer and is otherwise R13's act; a registrar handed in by the call serves, capture's instance's first", async () => {
  const w = setup();
  const k = await knockOf(w, "no registrar anywhere");
  const r = await w.c.pullKnock({ knockId: k.knockId, by: BY, at: AT });
  assert.equal(r.ok, true); assert.equal(r.existed, false);
  assert.deepEqual(r.jobs, { not_registered: [{ kind: "reading", reason: "NO_REGISTRAR" }] });
  assert.equal(inboxRow(w, k.knockId).status, "pulled");
  /* the call's registrar */
  const o = setup(); const jo = jobRegistrarStub();
  const ko = await knockOf(o, "by the call");
  const ro = await o.c.pullKnock({ knockId: ko.knockId, by: BY, at: AT, registerJob: jo.registerJob, armJobs: jo.armJobs });
  assert.equal(ro.ok, true); assert.equal("jobs" in ro, false);
  assert.equal(jo.rows().length, 1); assert.equal(jo.armed(), true);
  /* capture's instance's wins over the call's */
  const p = setup(); const mine = registrar(p); const theirs = jobRegistrarStub();
  const kp = await knockOf(p, "by the store");
  await p.c.pullKnock({ knockId: kp.knockId, by: BY, at: AT, registerJob: theirs.registerJob });
  assert.equal(mine.rows().length, 1); assert.equal(theirs.rows().length, 0);
});
