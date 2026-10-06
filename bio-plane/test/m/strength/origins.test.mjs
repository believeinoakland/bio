/* R12's origins since T33 (INT C-18; K1470): independence fails on one issuing source, a shared person, a shared event
   origin, a shared ledger table, or an `acts_for` or `within` tie, each named with the line, event or table that ties
   them; a tie undetermined on the documents' dates is named `undetermined`, never counted as independence. Driven
   through `candidateIndependence`, `partitionIndependence` and `versionStrength` (the one implementation, R27), over
   documents whose captures attest events (`events` R37's `event_attestations`, R26), lines (`lines` R10), identity
   clusters (`people` R5), money facts (`money` R8) and calculations' inputs (`calculations` R9), as the fixture holds
   them in those modules' shapes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE } from "./fixture.mjs";
import { ORIGIN_LIMIT } from "../../../src/strength/index.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-a", C = "INFO-2026-0003-a";
const DAY = "2026-03-01";
const ind = (w, a, b) => w.s.candidateIndependence({ legs: [{ target: a, ground: "x" }, { target: b, ground: "y" }], parts: 2 });
const through = (r) => (r.shared[0] ? r.shared[0].through : []);

/* Two documents, each with its own capture; each capture attests its own event unless told otherwise. */
function docs() {
  const w = world();
  for (const [d, sha] of [[A, "sa"], [B, "sb"], [C, "sc"]]) { w.bundle(d); w.capture(sha, d); }
  return w;
}

test("R12: two documents attesting one event share that event; a control with two events is independent", () => {
  const w = docs();
  w.event("EVT-2026-0001", { captures: ["sa", "sb"] });
  w.event("EVT-2026-0002", { captures: ["sc"] });
  assert.deepEqual(through(ind(w, A, B)), ["event:EVT-2026-0001"]);
  const c = ind(w, A, C);
  assert.deepEqual([c.checked, c.shared, c.complete], [true, [], true]);
});

test("R12: a shared person, as the same entity or one identity cluster, taking part in both; a subject is not one; an undetermined cluster joins only the same entity", () => {
  const w = docs();
  for (const p of ["ENT-P1", "ENT-P2", "ENT-P3"]) w.entity(p, "person");
  w.event("EVT-2026-0001", { captures: ["sa"], participants: [["ENT-P1", "author"]] });
  w.event("EVT-2026-0002", { captures: ["sb"], participants: [["ENT-P1", "signatory"]] });
  assert.deepEqual(through(ind(w, A, B)), ["person:ENT-P1"]);
  /* One cluster: P2 claimed the same as P1. */
  w.clusters.set("ENT-P1", { state: "linked", members: ["ENT-P1", "ENT-P2"] });
  w.clusters.set("ENT-P2", { state: "linked", members: ["ENT-P2", "ENT-P1"] });
  w.event("EVT-2026-0003", { captures: ["sc"], participants: [["ENT-P2", "participant"]] });
  assert.deepEqual(through(ind(w, A, C)), ["person:ENT-P1"]);
  /* An undetermined cluster joins nothing across it. */
  w.clusters.set("ENT-P2", { state: "undetermined", members: ["ENT-P2", "ENT-P1"] });
  w.clusters.set("ENT-P1", { state: "undetermined", members: ["ENT-P1", "ENT-P2"] });
  assert.deepEqual(ind(w, A, C).shared, []);
  /* The person a document is about is not its origin. */
  const s = docs();
  s.entity("ENT-P3", "person");
  s.event("EVT-2026-0001", { captures: ["sa"], participants: [["ENT-P3", "subject"]] });
  s.event("EVT-2026-0002", { captures: ["sb"], participants: [["ENT-P3", "subject"]] });
  assert.deepEqual(ind(s, A, B).shared, []);
});

test("R12: one issuing source: the same office or body issuing both, or offices part_of one body on the documents' dates, named with the lines; a line undetermined there is named undetermined", () => {
  const w = docs();
  w.entity("ENT-O1", "office"); w.entity("ENT-O2", "office"); w.entity("ENT-B", "body"); w.entity("ENT-P", "person");
  w.event("EVT-2026-0001", { kind: "issuance", captures: ["sa"], participants: [["ENT-O1", "actor"]] });
  w.event("EVT-2026-0002", { kind: "issuance", captures: ["sb"], participants: [["ENT-O1", "author"]] });
  assert.deepEqual(through(ind(w, A, B)), ["issuer:ENT-O1"]);
  /* Two offices, each part_of one body on the documents' date. */
  const p = docs();
  p.entity("ENT-O1", "office"); p.entity("ENT-O2", "office"); p.entity("ENT-B", "body");
  p.event("EVT-2026-0001", { kind: "issuance", when: DAY, captures: ["sa"], participants: [["ENT-O1", "actor"]] });
  p.event("EVT-2026-0002", { kind: "publication", when: DAY, captures: ["sb"], participants: [["ENT-O2", "actor"]] });
  assert.deepEqual(ind(p, A, B).shared, [], "no line: two issuers are two sources");
  p.line("LIN-2026-0001", "part_of", "ENT-O1", "ENT-B", [DAY]);
  p.line("LIN-2026-0002", "part_of", "ENT-O2", "ENT-B", [DAY]);
  assert.deepEqual(through(ind(p, A, B)), ["issuer:ENT-B part_of LIN-2026-0001, LIN-2026-0002"]);
  /* One office part of the other. */
  const q = docs();
  q.entity("ENT-O1", "office"); q.entity("ENT-B", "body");
  q.event("EVT-2026-0001", { kind: "issuance", when: DAY, captures: ["sa"], participants: [["ENT-O1", "actor"]] });
  q.event("EVT-2026-0002", { kind: "issuance", when: DAY, captures: ["sb"], participants: [["ENT-B", "actor"]] });
  q.line("LIN-2026-0001", "part_of", "ENT-O1", "ENT-B", [DAY]);
  assert.deepEqual(through(ind(q, A, B)), ["issuer:ENT-B part_of LIN-2026-0001"]);
  /* A line held on another date only does not tie them on this one. */
  const r = docs();
  r.entity("ENT-O1", "office"); r.entity("ENT-O2", "office"); r.entity("ENT-B", "body");
  r.event("EVT-2026-0001", { kind: "issuance", when: DAY, captures: ["sa"], participants: [["ENT-O1", "actor"]] });
  r.event("EVT-2026-0002", { kind: "issuance", when: DAY, captures: ["sb"], participants: [["ENT-O2", "actor"]] });
  r.line("LIN-2026-0001", "part_of", "ENT-O1", "ENT-B", ["2020-01-01"]);
  r.line("LIN-2026-0002", "part_of", "ENT-O2", "ENT-B", [DAY]);
  assert.deepEqual(ind(r, A, B).shared, []);
  /* Undetermined on the date: named undetermined, never independence. */
  r.line("LIN-2026-0003", "part_of", "ENT-O1", "ENT-B", "undetermined");
  assert.deepEqual(through(ind(r, A, B)), ["undetermined:issuer:ENT-B part_of LIN-2026-0003, LIN-2026-0002"]);
  /* A person issuing is a person, not an issuer; a subject is neither. */
  const s = docs();
  s.entity("ENT-O1", "office");
  s.event("EVT-2026-0001", { kind: "issuance", captures: ["sa"], participants: [["ENT-O1", "subject"]] });
  s.event("EVT-2026-0002", { kind: "issuance", captures: ["sb"], participants: [["ENT-O1", "subject"]] });
  assert.deepEqual(ind(s, A, B).shared, []);
});

test("R12: undated documents whose issuers have lines: the tie is undetermined, never independence; with no lines at all they stay two sources", () => {
  const w = docs();
  w.entity("ENT-O1", "office"); w.entity("ENT-O2", "office");
  w.event("EVT-2026-0001", { kind: "issuance", when: null, captures: ["sa"], participants: [["ENT-O1", "actor"]] });
  w.event("EVT-2026-0002", { kind: "issuance", when: null, captures: ["sb"], participants: [["ENT-O2", "actor"]] });
  assert.deepEqual(ind(w, A, B).shared, []);
  w.line("LIN-2026-0001", "part_of", "ENT-O1", "ENT-B", [DAY]);
  assert.deepEqual(through(ind(w, A, B)), ["undetermined:issuer:ENT-O1|ENT-O2 (no date settles the lines between them)"]);
});

test("R12: an acts_for line between the issuers on the documents' dates ties them, named with the line; undetermined there it is named undetermined", () => {
  const w = docs();
  w.entity("ENT-O1", "office"); w.entity("ENT-K", "body");
  w.event("EVT-2026-0001", { kind: "issuance", when: DAY, captures: ["sa"], participants: [["ENT-O1", "actor"]] });
  w.event("EVT-2026-0002", { kind: "issuance", when: DAY, captures: ["sb"], participants: [["ENT-K", "actor"]] });
  w.line("LIN-2026-0007", "acts_for", "ENT-K", "ENT-O1", [DAY]);
  assert.deepEqual(through(ind(w, A, B)), ["acts_for:LIN-2026-0007"]);
  const u = docs();
  u.entity("ENT-O1", "office"); u.entity("ENT-K", "body");
  u.event("EVT-2026-0001", { kind: "issuance", when: DAY, captures: ["sa"], participants: [["ENT-O1", "actor"]] });
  u.event("EVT-2026-0002", { kind: "issuance", when: DAY, captures: ["sb"], participants: [["ENT-K", "actor"]] });
  u.line("LIN-2026-0007", "acts_for", "ENT-K", "ENT-O1", "undetermined");
  assert.deepEqual(through(ind(u, A, B)), ["undetermined:acts_for:LIN-2026-0007"]);
});

test("R12: an event of one within an event of the other ties them, named with the event; an event placed nowhere makes it undetermined", () => {
  const w = docs();
  w.event("EVT-2026-0001", { kind: "vote", captures: ["sa"], within: ["EVT-2026-0002"] });
  w.event("EVT-2026-0002", { kind: "meeting", captures: ["sb"] });
  assert.deepEqual(through(ind(w, A, B)), ["within:EVT-2026-0001"]);
  assert.deepEqual(through(ind(w, B, A)), ["within:EVT-2026-0001"], "either way round");
  const u = docs();
  u.event("EVT-2026-0001", { kind: "vote", when: null, captures: ["sa"], within: ["EVT-2026-0002"] });
  u.event("EVT-2026-0002", { kind: "meeting", captures: ["sb"] });
  assert.deepEqual(through(ind(u, A, B)), ["undetermined:within:EVT-2026-0001"]);
});

test("R12: a shared ledger table: two calculations reading one declared table, or money facts drawn from it, share it; a control on two tables is independent", () => {
  const w = world();
  w.calcs.set("CALC-2026-0001", { capture: { grade: "B" }, inputs: [{ name: "t", kind: "table", ref: "sha-ledger" }] });
  w.calcs.set("CALC-2026-0002", { capture: { grade: "B" }, inputs: [{ name: "m", kind: "money", ref: ["MNY-2026-0001"] }] });
  w.calcs.set("CALC-2026-0003", { capture: { grade: "B" }, inputs: [{ name: "t", kind: "table", ref: "sha-other" }] });
  w.facts.set("MNY-2026-0001", { fact_id: "MNY-2026-0001", source: { table: "sha-ledger", row: 4, binding: "b1" } });
  assert.deepEqual(through(ind(w, "CALC-2026-0001", "CALC-2026-0002")), ["table:sha-ledger"]);
  assert.deepEqual(ind(w, "CALC-2026-0001", "CALC-2026-0003").shared, []);
  /* A calculation resting on another shares it; an occurrence's duty is its origin, and two keys of one duty share it. */
  w.calcs.set("CALC-2026-0004", { capture: { grade: "B" }, inputs: [{ name: "c", kind: "calculation", ref: "CALC-2026-0001" }] });
  assert.deepEqual(through(ind(w, "CALC-2026-0001", "CALC-2026-0004")), ["calc:CALC-2026-0001"]);
  assert.deepEqual(through(ind(w, "occurrence:DUT-2026-0001/a", "occurrence:DUT-2026-0001/b")), ["duty:DUT-2026-0001"]);
});

test("R12, R27: the new origins are one implementation: a version, a partition and a candidate of the same legs agree, and versionStrength carries them", () => {
  const w = docs();
  w.inquiry("INQ-2026-0001-a", [{ target: A }, { target: B }, { target: C }], "ENT-1");
  w.event("EVT-2026-0001", { captures: ["sa", "sc"] });
  w.version("INQ-2026-0001-a", "split", "accepted", [{ target: A, ground: "one" }, { target: B, ground: "one" }, { target: C, ground: "two" }]);
  const v = w.s.versionStrength({ id: "INQ-2026-0001-a", version: "split", viewer: MACHINE }).independence;
  const p = w.s.partitionIndependence({ id: "INQ-2026-0001-a", viewer: MACHINE, partition: [{ label: "one", legs: [0, 1] }, { label: "two", legs: [2] }] }).independence;
  const c = w.s.candidateIndependence({ legs: [{ target: A, ground: "one" }, { target: B, ground: "one" }, { target: C, ground: "two" }], parts: 2 });
  assert.deepEqual(v, p);
  assert.deepEqual(v, c);
  assert.deepEqual(v.shared, [{ a: "one", b: "two", through: ["event:EVT-2026-0001"] }]);
});

test("R12: events attested by one capture are read one past the limit; reaching it makes the answer complete: false, never clean", () => {
  const w = docs();
  for (let k = 0; k <= ORIGIN_LIMIT; k++) w.event(`EVT-2026-${String(1000 + k)}`, { captures: ["sa"] });
  const r = ind(w, A, B);
  assert.equal(r.complete, false);
});

test("R30, R12: corroboration keeps R12's first three origins: two documents sharing only an event still bear an anonymous observation out of each other's way", () => {
  const w = docs();
  w.observation("INFO-2026-0009-observation", "member-ann");
  w.event("EVT-2026-0001", { captures: ["obs-INFO-2026-0009-observation", "sa"] });
  w.inquiry("INQ-2026-0001-a", [{ target: "INFO-2026-0009-observation", grade: "D", axis: "testimony", source: "testimony" },
                                { target: A, grade: "B", axis: "connection", source: "resolution" }]);
  const r = w.s.testimonyCorroboration({ inquiry: "INQ-2026-0001-a", levels: { "INFO-2026-0009-observation": "group" }, viewer: MACHINE });
  assert.equal(r.legs[0].state, "corroborated");
});
