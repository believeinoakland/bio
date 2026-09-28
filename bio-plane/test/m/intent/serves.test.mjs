/* intent's R28: what an address, a bundle or a request serves, for scheduler's rank (its R10) — the open gaps (R6) in
   any project and the held aspirations in force (R12) for the subject's project, member aspirations aside. */
import test from "node:test";
import assert from "node:assert/strict";
import { migrateProvenance } from "../../../src/provenance/schema.mjs";
import { intentOps } from "../../../src/intent/index.mjs";
import { seeded, V, COND } from "./fixture.mjs";

/* P (alice's, bob joined) states a condition: ENT-1's `proc` instances and those member_of it, need and award placed,
   grade B. ENT-1 meets it; ENT-2 is short (award missing), so P has one open gap, documented by ENT-2's need. */
async function served() {
  const w = seeded();
  migrateProvenance(w.st.sql);
  for (const id of ["ENT-1", "ENT-2", "ENT-3"]) w.entity(id);
  w.relate("ENT-2", "ENT-1", "member_of");
  w.define();
  await w.thread("ENT-1", { need: "A", award: "B" });
  await w.thread("ENT-2", { need: "A" });
  w.resolve("x-sha", "INFO-X", "ENT-1", "A");                        // concerns ENT-1, placed in no instance, in no project
  const Q = w.project("Second", "bob");
  const file = (bundle, project) => w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, project, bundle);
  file("INFO-ENT-2-need", w.P);
  file("INFO-ENT-1-award", w.P);
  file("INFO-ENT-1-need", Q);
  assert.equal(w.i.setCondition({ project: w.P, condition: { ...COND, relation: "member_of", required: { grade: "B", stages: ["need", "award"] } },
                                   author: V("bob"), viewer: V("bob") }).ok, true);
  const gap = w.i.gaps({ project: w.P, viewer: V("bob") }).gaps;
  assert.deepEqual(gap.map((g) => g.basis.entity), ["ENT-2"]);
  const decl = (a) => w.i.declareAspiration(a).aspiration;
  const A = {
    proc: decl({ scope: "group", statement: "Every procurement traced", progressions: ["proc"], author: V("alice") }),
    ent1: decl({ scope: "group", statement: "Know ENT-1", entities: ["ENT-1"], author: V("alice") }),
    ent3: decl({ scope: "group", statement: "Know ENT-3", entities: ["ENT-3"], author: V("alice") }),
    projP: decl({ scope: "project", owner: w.P, statement: "ENT-1 in P", entities: ["ENT-1"], author: V("bob") }),
    mine: decl({ scope: "member", owner: "bob", statement: "Mine", progressions: ["proc"], entities: ["ENT-1"], author: V("bob") }),
  };
  const retired = decl({ scope: "group", statement: "Old", progressions: ["proc"], author: V("alice") });
  assert.equal(w.i.retireAspiration({ aspiration: retired, taught: "done", author: V("alice") }).ok, true);
  assert.equal(w.i.departFrom({ project: Q, aspiration: A.proc, reason: "Q follows no flow.", author: V("bob") }).ok, true);
  /* an address the record captured ENT-2's need from (provenance R48's read contract), and a request for it */
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?,?,?,?,?,?)`,
                "ent-2-need", "INFO-ENT-2-need", "snapshots/a.pdf", "binary", 1, w.clock.now);
  w.st.sql.exec(`INSERT INTO captured_locators (address_norm, address, capture_sha, first_retrieved, last_retrieved)
                 VALUES (?,?,?,?,?)`, "https://example.org/a", "https://example.org/a", "ent-2-need", w.clock.now, w.clock.now);
  w.inquiry("INQ-2026-0001-question");
  w.requests.push({ request: "CR-1", address: "https://example.org/a", target: "INQ-2026-0001-question", state: "requested" });
  w.stand.captureRequests.bundlesOf = (id) => (id === "CR-1" ? { target: "INQ-2026-0001-question" } : null);
  return { w, Q, A, gapKey: gap[0].key };
}

const PLURAL = { address: "addresses", bundle: "bundles", request: "requests" };
const one = (w, kind, id) => w.i.servesOf({ [PLURAL[kind]]: [id] }).serves[0];

test("R28 a bundle serves the open gaps its document is in and the held group or project aspirations in force for its project that it is placed under (a named progression) or concerns (a named entity); member aspirations aside", async () => {
  const { w, Q, A, gapKey } = await served();
  const snap = w.snapshot();
  const r = w.i.servesOf({ bundles: ["INFO-ENT-2-need", "INFO-ENT-1-award", "INFO-ENT-1-need", "INFO-X", "INFO-NONE"] });
  assert.equal(r.ok, true);
  assert.equal(r.truncated, false);
  const by = Object.fromEntries(r.serves.map((s) => [s.id, s]));
  assert.deepEqual(r.serves.map((s) => s.kind), ["bundle", "bundle", "bundle", "bundle", "bundle"]);
  /* the short instance's document serves P's gap, and the group aspiration naming its flow */
  assert.deepEqual(by["INFO-ENT-2-need"].gaps, [gapKey]);
  assert.deepEqual(by["INFO-ENT-2-need"].aspirations, [A.proc]);
  /* a met instance's document serves no gap; in P it serves the flow's, ENT-1's group aspiration and P's own */
  assert.deepEqual(by["INFO-ENT-1-award"].gaps, []);
  assert.deepEqual(by["INFO-ENT-1-award"].aspirations, [A.proc, A.ent1, A.projP].sort());
  /* in Q, which departed from the flow's aspiration and holds none of P's: ENT-1's group aspiration only */
  assert.deepEqual(by["INFO-ENT-1-need"].aspirations, [A.ent1]);
  /* in no project: the group's alone, and only what it concerns (ENT-1), not a flow it is placed in by no instance */
  assert.deepEqual(by["INFO-X"].aspirations, [A.ent1]);
  /* unknown: empty lists; never a member aspiration, a retired one, or one naming what the subject does not touch */
  assert.deepEqual(by["INFO-NONE"], { kind: "bundle", id: "INFO-NONE", gaps: [], aspirations: [] });
  const everything = JSON.stringify(r);
  for (const not of [A.mine, A.ent3]) assert.ok(!everything.includes(not), not);
  assert.deepEqual(w.snapshot(), snap, "it writes nothing");
  /* a gap set aside is no longer open, so nothing serves it */
  assert.equal(w.i.triage({ proposal: gapKey, act: "defer", project: w.P, reason: "After the audit.", author: V("bob"), viewer: V("bob") }).ok, true);
  assert.deepEqual(one(w, "bundle", "INFO-ENT-2-need").gaps, []);
  void Q;
});

test("R28 an address serves what the bundles captured from it serve; a request what its address and its target question serve; an unknown one answers empty lists", async () => {
  const { w, A, gapKey } = await served();
  assert.deepEqual(one(w, "address", "https://example.org/a"), { kind: "address", id: "https://example.org/a", gaps: [gapKey], aspirations: [A.proc] });
  assert.deepEqual(one(w, "request", "CR-1"), { kind: "request", id: "CR-1", gaps: [gapKey], aspirations: [A.proc] });
  /* the target question serves on its own account: filed in P and placed in the flow, the request gains what it serves */
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, w.P, "INQ-2026-0001-question");
  w.resolve("inq-sha", "INQ-2026-0001-question", "ENT-1", "A");
  assert.deepEqual(one(w, "request", "CR-1").aspirations, [A.proc, A.ent1, A.projP].sort());
  for (const [kind, id] of [["address", "https://example.org/none"], ["request", "CR-NONE"], ["bundle", ""]])
    assert.deepEqual([one(w, kind, id).gaps, one(w, kind, id).aspirations], [[], []], `${kind} ${id}`);
});

test("R28 at most 1,000 subjects in all, the first in the order given, with truncated; it never throws, and is no op: it orders work and is never shown", async () => {
  const { w } = await served();
  const many = Array.from({ length: 1001 }, (_, n) => `INFO-${n}`);
  const r = w.i.servesOf({ addresses: ["https://example.org/a"], bundles: many, requests: ["CR-1"] });
  assert.equal(r.truncated, true);
  assert.equal(r.serves.length, 1000);
  assert.deepEqual([r.serves[0].kind, r.serves[1].id, r.serves[999].id], ["address", "INFO-0", "INFO-998"]);
  assert.equal(w.i.servesOf({ bundles: many.slice(0, 1000) }).truncated, false);
  /* it never throws: a use failing under it answers empty lists, still ok */
  w.entities.concerns = () => { throw new Error("down"); };
  const hurt = w.i.servesOf({ bundles: ["INFO-ENT-1-award"], addresses: [null], requests: [42] });
  assert.equal(hurt.ok, true);
  assert.deepEqual(hurt.serves.map((s) => [s.kind, s.gaps.length >= 0, Array.isArray(s.aspirations)]),
                   [["address", true, true], ["bundle", true, true], ["request", true, true]]);
  assert.deepEqual(w.i.servesOf().serves, []);
  assert.deepEqual(w.i.servesOf({ bundles: "INFO-X" }).serves, [], "a list is what it reads");
  /* never shown: no op answers it (R21: no read of evidence uses it) */
  const ops = intentOps(w.i, new URL("https://plane.test/?viewer=member:bob"), {});
  const calls = [];
  const spy = w.i.servesOf;
  w.i.servesOf = (...a) => { calls.push(a); return spy.apply(w.i, a); };
  for (const name of Object.keys(ops)) { try { await ops[name](); } catch { /* an op refusing or throwing is not the question */ } }
  assert.deepEqual(calls, [], "no op reaches servesOf");
});
