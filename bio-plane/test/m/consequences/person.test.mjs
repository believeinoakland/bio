/* consequences R16 (R10, R15; DEC-78): a person a part names is answered, with the passage naming them, only to a viewer
   who may see that passage's capture and whom a protected source's link admits; to any other viewer the part answers
   `affected: {kind: person}`, withheld whole, `out_of_view: true`, its value and grade standing. And R15's rule for the
   operands T33 added: a money fact or a calculation the viewer may not see leaves the operands. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { Consequences } from "../../../src/consequences/index.mjs";

const S = "STD-2026-0001-law";
const ROLL = "INFO-2026-0001-roll";

/* people is the real one: its `sourceLinkSight(person)` (its R34) answers a link's sight. */
function setup() {
  const w = world();
  w.D = w.determination("CONF-2026-0001-act", w.P, { [S]: "noncompliant" });
  w.doe = w.person("Jordan Doe");
  w.roll = w.figure(ROLL, "The waiting list removed Jordan Doe");
  w.cut = w.figure("INFO-2026-0002-cut", "Cut $1,000");
  const r = w.c.consequenceRecord({ determination: w.D, standard: S, period: { from: "2026-01-01", to: "2026-06-30" },
    affected: { kind: "person", description: "Jordan Doe, removed from the list", person: { entity: w.doe, named_in: w.roll } },
    measure: { unit: "money" }, basis: { op: "sum", operands: [{ content: w.cut, figure: "$1,000" }] }, author: V("alice") });
  assert.equal(r.ok, true, JSON.stringify(r));
  w.id = r.id;
  w.read = (c, v) => c.consequenceRead({ id: w.id, viewer: V(v) }).part;
  return w;
}
const holds = (v, s) => JSON.stringify(v, (k, x) => (k === "project" ? "P" : x)).includes(s);

test("R16: a viewer who may see the passage's capture is answered the person; one who may not, {kind: person} alone", () => {
  const w = setup();
  const alice = w.read(w.c, "alice");
  assert.deepEqual(alice.affected, { kind: "person", description: "Jordan Doe, removed from the list",
                                     person: { entity: w.doe, named_in: w.roll } });
  assert.equal("out_of_view" in alice, false, "a viewer who may see everything is answered whole");
  /* pat sees the project but not the roll's capture. */
  const c = w.sighted(new Set([ROLL]));
  const pat = w.read(c, "pat");
  assert.deepEqual(pat.affected, { kind: "person" });
  assert.equal(pat.out_of_view, true);
  assert.deepEqual([holds(pat, w.doe), holds(pat, w.roll), holds(pat, "Doe")], [false, false, false], "withheld whole");
  assert.deepEqual([pat.measure, pat.grade, pat.state, pat.computation], [alice.measure, alice.grade, alice.state, alice.computation],
                   "the computed value and grade stand");
  const { affected: pa, out_of_view, ...patRest } = pat;
  const { affected: aa, ...aliceRest } = alice;
  assert.deepEqual(patRest, aliceRest, "every other fact the part records stands");
  /* consequencesOf answers the part alike; bob, outside the project, is answered no part at all (R13). */
  assert.deepEqual(c.consequencesOf({ determination: w.D, viewer: V("pat") }).parts.find((p) => p.id === w.id), pat);
  assert.equal(w.c.consequenceRead({ id: w.id, viewer: V("bob") }).reason, "NO_SUCH_PART");
});

test("R16 (DEC-78): a person the record holds as a protected source is withheld from every viewer the link does not admit", () => {
  const w = setup();
  const link = w.people.linkSourceToPerson({ source: "SRC-2026-0001-tip", person: w.doe, evidence: "she told us",
                                              sight: ["alice"], by: V("alice") });
  assert.equal(link.ok, true, JSON.stringify(link));
  /* alice is listed; pat and carol (an administrator) see the capture and the project, and are not. */
  assert.equal(w.read(w.c, "alice").affected.person.entity, w.doe);
  for (const v of ["pat", "carol"]) {
    const p = w.read(w.c, v);
    assert.deepEqual([p.affected, p.out_of_view, holds(p, w.doe)], [{ kind: "person" }, true, false], v);
    assert.equal(p.measure.value, "1000");
  }
  /* The listed member who may not see the capture is not answered it either: both conditions hold. */
  const c = w.sighted(new Set([ROLL]));
  const pat = w.people.linkSourceToPerson({ source: "SRC-2026-0001-tip", person: w.doe, evidence: "she told us",
                                             sight: ["alice", "pat"], by: V("alice") });
  assert.equal(pat.ok, true);
  assert.deepEqual(w.read(c, "pat").affected, { kind: "person" });
  assert.equal(w.read(w.c, "pat").affected.person.entity, w.doe, "listed, and seeing the capture: answered");
  /* Whatever the sight, the part's record object never names the person. */
  const md = w.record.readFile(w.id, "bundle.md").text;
  assert.equal(md.includes(w.doe) || md.includes(w.roll) || /doe/i.test(md), false);
});

test("R16 (N600): no link held leaves the capture's sight alone to decide; a person no link names is withheld from no one for want of one", () => {
  const w = setup();
  assert.equal(w.people.sourceLinkSight(w.doe), null, "no link is held");
  /* Every viewer who may see the roll's capture is answered the person: alice, pat, and carol (an administrator). */
  for (const v of ["alice", "pat", "carol"]) {
    const p = w.read(w.c, v);
    assert.deepEqual(p.affected.person, { entity: w.doe, named_in: w.roll }, v);
    assert.equal("out_of_view" in p, false, v);
  }
  /* A link to another person changes nothing for this one. */
  const other = w.person("Robin Roe");
  assert.equal(w.people.linkSourceToPerson({ source: "SRC-2026-0002-tip", person: other, evidence: "e", sight: ["alice"],
                                             by: V("alice") }).ok, true);
  assert.equal(w.read(w.c, "pat").affected.person.entity, w.doe);
  /* An internal read (no viewer) holds the person as the document names them. */
  assert.equal(w.c.consequenceRead({ id: w.id }).part.affected.person.named_in, w.roll);
});

test("R16 (N600): a person withheld for a link is answered exactly as for a capture the viewer may not see; several links admit only those every one admits", () => {
  const w = setup();
  /* pat withheld for the capture, before any link. */
  const forCapture = w.read(w.sighted(new Set([ROLL])), "pat");
  assert.deepEqual([forCapture.affected, forCapture.out_of_view], [{ kind: "person" }, true]);
  /* pat sees the capture; a link admits alice alone: pat's answer is the same, word for word, saying no link is held. */
  assert.equal(w.people.linkSourceToPerson({ source: "SRC-2026-0001-tip", person: w.doe, evidence: "e", sight: ["alice", "pat"],
                                             by: V("alice") }).ok, true);
  assert.equal(w.read(w.c, "pat").affected.person.entity, w.doe, "admitted by the one link");
  assert.equal(w.people.linkSourceToPerson({ source: "SRC-2026-0003-tip", person: w.doe, evidence: "e", sight: ["alice"],
                                             by: V("alice") }).ok, true);
  const forLink = w.read(w.c, "pat");
  assert.deepEqual(forLink, forCapture, "no answer says that a link is held");
  assert.equal(/link|source/i.test(JSON.stringify(forLink)), false);
  assert.equal(w.read(w.c, "alice").affected.person.entity, w.doe, "alice, whom every link admits, is answered the person");
  assert.deepEqual(w.c.consequencesOf({ determination: w.D, viewer: V("pat") }).parts.find((p) => p.id === w.id), forLink);
});

test("R15: a money fact the viewer may not see leaves the operands; the computed value and grade stand", () => {
  const w = setup();
  const HID = "INFO-2026-0091-ledger";
  const seen = w.fact({ amount: "100" });
  const hidden = w.fact({ amount: "250.50" }, HID);
  const r = w.c.consequenceRecord({ determination: w.D, standard: S, period: { from: "2026-01-01", to: "2026-06-30" },
    affected: { kind: "fund", description: "the harbour fund" }, measure: { unit: "money" },
    basis: { op: "sum", operands: [{ money: hidden }, { money: seen }] }, author: V("alice") });
  assert.equal(r.ok, true, JSON.stringify(r));
  const alice = w.c.consequenceRead({ id: r.id, viewer: V("alice") }).part;
  assert.deepEqual(alice.computation.operands.map((o) => o.money), [hidden, seen]);
  assert.equal(alice.measure.value, "350.50");
  assert.equal("out_of_view" in alice, false);
  /* money answers a fact the viewer may not see as absent (its R21); this module over the same record, with money
     answering pat so for the hidden fact (and every other read as it is). */
  const fenced = new Proxy(w.money, { get: (t, p) => (p === "readFact"
    ? (a) => (a.viewer === V("pat") && a.factId === hidden ? { ok: true, found: false, fact_id: hidden, fact: null } : t.readFact(a))
    : typeof t[p] === "function" ? t[p].bind(t) : t[p]) });
  const c2 = new Consequences({ storage: w.st, host: w.host, record: w.record, membership: w.membership, promotion: w.promotion,
    content: w.content, provenance: w.prov, inquiry: w.inquiry, strength: w.strength, money: fenced, calculations: w.calculations,
    entities: w.entities, people: w.people, passageText: (id) => w.texts.get(id) ?? null });
  const pat = c2.consequenceRead({ id: r.id, viewer: V("pat") }).part;
  assert.deepEqual(pat.computation.operands.map((o) => o.money), [seen], "no null in the withheld one's place");
  assert.deepEqual([pat.out_of_view, holds(pat, hidden), holds(pat, "250.50")], [true, false, false]);
  assert.deepEqual([pat.measure.value, pat.grade.grade], ["350.50", alice.grade.grade]);
  assert.doesNotMatch(pat.grade.why, /operand (is )?\d/);
});
