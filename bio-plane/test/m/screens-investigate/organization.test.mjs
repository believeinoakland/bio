/* screens-investigate R50, R53, R58 (T51; K4194 L10, DEC-374 C68, DEC-384 I-32): an organization's page on interface-shell's served page. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, PERSON, ENT, ORG, SHA, word, drew, notDrew, heldByState, dayOf } from "./fixtures.mjs";

const at = "/app/person/" + ORG;
const OFFICE = "ENT-2026-0800", SUBJECT = "ENT-2026-0801", OTHER_OFFICE = "ENT-2026-0802";
const orgEntity = (kind = "institution") => ok({ ok: true, found: true, entity: { entity_id: ORG, kind, label: "Public Works Department", note: "A city department", aliases: [
  { alias: "Public Works Department", canonical: true, declared_by: "machine:roster", at: "2026-09-01T09:00:00Z", withdrawn: null }], relations: [] } });
const noPerson = refusedIn("NOT_A_PERSON", "The record named is not a person.");
const secOf = (p, key) => main(p).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word(key));
const orgPlane = (extra = {}) => ({ entity: (r) => (r.query.id === ORG ? orgEntity() : ok({ ok: false, found: false })), person: noPerson, samepersoncandidates: noPerson, ...extra });

test("R53 an institution's page draws no Born, Died or where they live, offers a fact only the kinds Name, Address and Contact, and reads no claim or candidate it cannot have; NOT_A_PERSON is no claims, never a failed read; control: a person draws the person page", async () => {
  const p = await open(at, { plane: orgPlane() });
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Public Works Department");
  const kinds = p.doc.getElementById("person-fact-kind").querySelectorAll("option").map((o) => o.textContent);
  assert.deepEqual(kinds, ["name", "address", "contact"].map((k) => word("screen.person.kind." + k)), "exactly three kinds");
  for (const k of ["birth", "death", "locality"]) assert.ok(!kinds.includes(word("screen.person.kind." + k)), k);
  drew(m, "screen.person.kind.help.org");
  /* the person read is made and refused as the owner refuses it; it is not drawn as failed or as a claim */
  assert.ok(p.byOp("person").length >= 1);
  assert.equal(m.querySelector('[data-state="failed"]'), null, "a NOT_A_PERSON refusal is drawn as no claims");
  assert.ok(!m.textContent.includes(word("refusal.NOT_A_PERSON")));
  const q = await open("/app/person/" + ENT);
  const pk = q.doc.getElementById("person-fact-kind").querySelectorAll("option").map((o) => o.textContent);
  assert.equal(pk.length, 6, "control: a person has her six kinds");
  assert.equal(secOf(q, "screen.person.same") !== undefined, true);
});

test("R53 an organization of each kind (institution, body, movement) is drawn as one; its connect act answers in words", async () => {
  for (const kind of ["institution", "body", "movement"]) {
    const p = await open(at, { plane: orgPlane({ entity: orgEntity(kind), connect: refusedIn("NOT_A_PERSON", "x") }) });
    assert.equal(p.doc.getElementById("person-fact-kind").querySelectorAll("option").length, 3, kind);
  }
  const p = await open(at, { plane: orgPlane({ connect: refusedIn("NOT_A_PERSON", "x") }) });
  await press(p, "connect");
  assert.ok(main(p).textContent.includes(word("refusal.NOT_A_PERSON")), "the refusal by its words, never the bare code");
  assert.ok(!main(p).textContent.includes("NOT_A_PERSON"));
});

test("R58 an organization's page draws the .org keys: Same organization?, its help, the claim's words and the candidates; control: a person's page draws its own keys", async () => {
  const claims = [{ claim_id: "IDC-2026-0009", a: ORG, b: "ENT-2026-0050", kind: "same_as", basis: "name", grade: "B", why: "both give the same street address", by: "member:mai", at: "2026-10-04T09:00:00Z" },
    { claim_id: "IDC-2026-0010", a: ORG, b: "ENT-2026-0051", kind: "not_same_as", basis: "identifier", grade: "A", why: "different registration numbers", by: "member:dev", at: "2026-10-05T09:00:00Z" },
    { claim_id: "IDC-2026-0011", a: ORG, b: "ENT-2026-0052", kind: "unsure", basis: "testimony", grade: "D", why: "a similar name", by: "member:mai", at: "2026-10-06T09:00:00Z" }];
  const p = await open(at, { plane: orgPlane({ person: ok(PERSON({ entity_id: ORG, claims, cluster: { state: "linked", members: [ORG, "ENT-2026-0050"], truncated: false }, facts: [], posts: [] })),
    samepersoncandidates: ok({ ok: true, entity_id: ORG, count: 1, candidates: [{ entity_id: "ENT-2026-0050", fields: { names: { state: "agrees" } } }], truncated: false }) }) });
  const s = secOf(p, "screen.person.same.org");
  assert.ok(s, "headed by the organization's key");
  assert.equal(secOf(p, "screen.person.same"), undefined, "not the person's");
  assert.ok(s.querySelector("[data-tip]").getAttribute("data-tip").includes(word("screen.person.same.holds.org")), "its help");
  drew(s, "screen.person.same.claimed.org");
  drew(s, "screen.person.candidates.org");
  drew(s, "screen.person.same.because.org", { grade: "B", basis: word("screen.person.basis.row.name") });
  for (const k of ["same_as", "not_same_as", "unsure"]) drew(s, "screen.person.claim.kind." + k + ".org");
  const form = p.doc.getElementById("person-claim-kind").querySelectorAll("option").map((o) => o.textContent);
  assert.deepEqual(form, [word("screen.person.claim.same_as.org"), word("screen.person.claim.not_same_as.org"), word("screen.person.claim.kind.unsure.org")]);
  /* control: the person's own page is drawn with the person's words and none of the organization's */
  const q = await open("/app/person/" + ENT);
  const t = secOf(q, "screen.person.same");
  assert.ok(t);
  for (const k of ["same.claimed", "candidates", "claim.same_as", "claim.not_same_as", "claim.kind.unsure"]) notDrew(t, "screen.person." + k + ".org");
  assert.ok(!t.textContent.includes(word("screen.person.kind.help.org")));
});

/* R50 */
const keeperPlane = (extra = {}) => orgPlane({
  entitieskind: (r) => ok({ ok: true, kind: r.query.kind, entities: r.query.kind === "office" ? [{ entity_id: OFFICE, kind: "office", label: "Director of Public Works" }, { entity_id: OTHER_OFFICE, kind: "office", label: "Another city's clerk" }] : [], truncated: false }),
  linesof: (r) => ok({ ok: true, entity: r.query.entity, lines: r.query.kinds === "post_in" ? [{ line_id: "LIN-1", kind: "post_in", from: OFFICE, to: ORG }]
    : r.query.entity === OFFICE && r.query.kinds === "custodian_of,responsible_for" ? [{ line_id: "LIN-5", kind: "custodian_of", from: OFFICE, to: SUBJECT, valid: { from: "2022-03-01", to: null, precision: "day", zone: "UTC" }, assertion: "B", basis: { captureSha: SHA, extent: { kind: "pdf-page", page: 3 } } }] : [], truncated: false }),
  peopledirectory: (r) => ok({ ok: true, following: 2, limit: 200, truncated: false, rows: [{ entity: SUBJECT, kind: "ordinance", name: "Street repair and potholes", documents: 1 }] }),
  heldcaptures: heldByState,
  ...extra });

test("R50 Records its offices keep lists the lines standing for this organization's offices; the act records a new one with the declared fields (kind, office, subject, the chosen document, dates); control: an office of another organization is not offered", async () => {
  const p = await open(at, { plane: keeperPlane({ recordline: ok({ ok: true, line_id: "LIN-6" }) }) });
  const sec = secOf(p, "screen.person.keeper.heading");
  assert.ok(sec, "the section is drawn for an organization with an office");
  drew(sec, "screen.person.keeper.intro.a");
  drew(sec, "screen.person.keeper.line", { subject: "Street repair and potholes" });
  assert.ok(sec.textContent.includes("Director of Public Works"));
  assert.ok(sec.textContent.includes(word("screen.person.since", { from: dayOf("2022-03-01") })), "the dates it states");
  assert.equal(sec.querySelectorAll(".cs-grade").length >= 1, true, "its source's grade");
  assert.deepEqual(p.doc.getElementById("kp-office").querySelectorAll("option").map((o) => o.textContent), ["Director of Public Works"], "an office of another organization is not offered");
  fill(p, { "kp-office": OFFICE, "kp-kind": "responsible_for", "kp-subject": SUBJECT, "kp-doc": SHA, "kp-from": "2022-03-01" });
  await press(p, "recordline");
  assert.deepEqual(p.byOp("recordline")[0].body, { kind: "responsible_for", from: OFFICE, to: SUBJECT, basis: { captureSha: SHA, extent: { kind: "document" } },
    valid: { from: "2022-03-01", to: null, precision: "day", zone: "UTC" } });
  assert.ok(p.byOp("linesof").length >= 3, "the lines are read again after the act");
  /* a member's own word is a basis too, with the statement she gives */
  const q = await open(at, { plane: keeperPlane({ recordline: ok({ ok: true, line_id: "LIN-7" }) }) });
  fill(q, { "kp-src": "own" });
  q.fire(q.doc.getElementById("kp-src"), "change");
  await q.settle();
  assert.equal(q.doc.getElementById("kp-doc"), null, "no document chosen for her own word");
  fill(q, { "kp-office": OFFICE, "kp-subject": SUBJECT, "kp-statement": "I worked in that office" });
  await press(q, "recordline");
  assert.deepEqual(q.byOp("recordline")[0].body, { kind: "custodian_of", from: OFFICE, to: SUBJECT, basis: { statement: "I worked in that office" } }, "no dates: no validity sent");
});

test("R50 a statement with no source sends nothing; the owner's refusals are drawn in the design's words (no source, same office and subject, dates reversed); an organization with no office draws no section (R22)", async () => {
  const nodoc = await open(at, { plane: keeperPlane({ heldcaptures: ok({ ok: true, held: [] }) }) });
  fill(nodoc, { "kp-office": OFFICE, "kp-subject": SUBJECT });
  await press(nodoc, "recordline");
  assert.equal(nodoc.byOp("recordline").length, 0, "no source, nothing sent");
  drew(main(nodoc), "screen.person.keeper.refused.nobasis.b");
  for (const [code, key] of [["SELF_LINE", "self"], ["NO_BASIS", "nobasis"], ["BOUNDS_REVERSED", "dates"]]) {
    const p = await open(at, { plane: keeperPlane({ recordline: refusedIn(code, "x") }) });
    fill(p, { "kp-office": OFFICE, "kp-subject": SUBJECT, "kp-doc": SHA });
    await press(p, "recordline");
    assert.equal(p.byOp("recordline").length, 1, code);
    drew(main(p), "screen.person.keeper.refused." + key + ".a");
  }
  const none = await open(at, { plane: keeperPlane({ entitieskind: ok({ ok: true, kind: "office", entities: [], truncated: false }) }) });
  assert.equal(secOf(none, "screen.person.keeper.heading"), undefined);
  assert.ok(!actsIn(main(none)).includes("recordline"));
  const person = await open("/app/person/" + ENT, { plane: keeperPlane() });
  assert.equal(secOf(person, "screen.person.keeper.heading"), undefined, "control: a person's page has none");
});

/* B423 (T51; DEC-384 design rows, words.json): an office's responsible-for statement is drawn by its own key */
test("R50 B423 a statement that an office is responsible for is drawn by its own key, never the bare relation word", async () => {
  const r = await open(at, { plane: keeperPlane({ linesof: (x) => ok({ ok: true, entity: x.query.entity, truncated: false, lines: x.query.kinds === "post_in" ? [{ line_id: "LIN-1", kind: "post_in", from: OFFICE, to: ORG }]
    : x.query.entity === OFFICE && x.query.kinds === "custodian_of,responsible_for" ? [{ line_id: "LIN-8", kind: "responsible_for", from: OFFICE, to: SUBJECT, valid: null, assertion: "B", basis: { captureSha: SHA, extent: { kind: "pdf-page", page: 3 } } }] : [] }) }) });
  drew(secOf(r, "screen.person.keeper.heading"), "screen.person.keeper.line.responsible", { subject: "Street repair and potholes" });
});
