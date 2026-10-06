/* entities' share of DEC-149 (T34-78, K1784, K1785): every member-facing string (a check's translation, a refusal's
   detail, a read's `why`) that called the group's Civicsmith "this instance" or "the instance" now says "your group's".
   Each changed string is named by a test at the interface that answers it, with the requirement that answers it. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, sha, MACHINE } from "./fixture.mjs";
import { IDSPACE_CHECKS, Entities } from "../../../src/entities/index.mjs";

const PE = ["test-port-ellery"];
const NOTE = "a subject the test registers";
/* A test profile that names proceeding kinds and no `proceeding` space, so a proceeding's number has no form to be in. */
const NO_FORMS = { id: "test-no-forms", name: "A test profile with no spaces", covers: ["Nowhere"], test: true,
                   proceeding_kinds: [{ kind: "suit", label: "suit", forum_kind: "court", basis: "TEST" }] };
/* No held profile names proceeding kinds without a `proceeding` space, and record-core's setting holds ids only, so the
   record entities is given (its injected `record`) answers the active profiles as that profile; every other act is the
   real record's. */
function noForms() {
  const w = world();
  const record = new Proxy(w.record, { get(t, k) {
    if (k === "getSetting") return (n) => (n === "jurisdiction_profiles" ? [NO_FORMS] : t.getSetting(n));
    const v = t[k];
    return typeof v === "function" ? v.bind(t) : v;
  } });
  return new Entities(w.st, { record, membership: w.membership, provenance: w.prov });
}
const NAMED = /\b(?:this|the) instance\b|\binstance's\b|\bcopy\b|\bplane\b|\bserver\b/i;

test("R20 R25 (DEC-149) C-91.1 IDSPACE_UNKNOWN's translation names your group's jurisdiction profiles, never this instance's", () => {
  const r = world({ profiles: PE }).e.idMatch({ space: "nope" });
  assert.equal(r.translation, "That is not an identifier space the record knows how to judge. The answer lists the spaces it "
    + "knows, each with its forms as your group's jurisdiction profiles give them. Nothing was judged.");
  assert.equal(r.translation, IDSPACE_CHECKS.IDSPACE_UNKNOWN.translation);
});

test("R21 R25 (DEC-149) C-91.2 IDSPACE_VALUE_NOT_IN_SPACE's translation names your group's jurisdiction profiles; with no form held, its detail says your group's active jurisdiction profiles give the space none", () => {
  const r = world({ profiles: PE }).e.idMatch({ space: "project", a: "zzz" });
  assert.equal(r.translation, "The value given does not have the shape of any form your group's jurisdiction profiles give "
    + "that identifier space, so the record cannot say what it would join. Give the identifier as the document writes it; "
    + "the answer lists the forms. Nothing was judged.");
  assert.equal(r.translation, IDSPACE_CHECKS.IDSPACE_VALUE_NOT_IN_SPACE.translation);
  assert.equal(r.detail, "a has the shape of no form of the works order number", "with forms held, the detail names none");
  const none = world().e.idMatch({ space: "enactment", a: "12345" });
  assert.match(none.detail, /; your group's active jurisdiction profiles give this space no form$/);
});

test("R43 (DEC-149) UNKNOWN_SCHEME's detail says an identifier is held in a scheme your group's active jurisdiction profiles name, listing them, or that they name none", () => {
  const w = world({ profiles: PE });
  const pat = w.e.createEntity({ note: NOTE, kind: "person", label: "Pat Quill" }).entity_id;
  const r = w.e.addIdentifier({ entityId: pat, scheme: "nope", id: "1", basis: "b", by: "member:ann" });
  assert.equal(r.reason, "UNKNOWN_SCHEME");
  assert.equal(r.detail, `an identifier is held in a scheme your group's active jurisdiction profiles name: one of ${r.schemes.join(", ")}. Nothing was written.`);
  const bare = world();
  const lee = bare.e.createEntity({ note: NOTE, kind: "person", label: "Lee Quill" }).entity_id;
  assert.equal(bare.e.addIdentifier({ entityId: lee, scheme: "nope", id: "1", basis: "b" }).detail,
               "an identifier is held in a scheme your group's active jurisdiction profiles name; they name none. Nothing was written.");
});

test("R45 (DEC-149) PROCEEDING_KIND_UNKNOWN's detail says a proceeding's kind is one your group's active jurisdiction profiles name; IDENTIFIER_NOT_IN_SPACE's, with no form held, that they give the space none", () => {
  const w = world({ profiles: PE });
  const court = w.e.createEntity({ note: NOTE, kind: "institution", label: "Marlow County Court" }).entity_id;
  const k = w.e.createEntity({ note: NOTE, kind: "proceeding", proceeding: { forum: court, kind: "nope", number: "MC-26-0001" } });
  assert.equal(k.reason, "PROCEEDING_KIND_UNKNOWN");
  assert.equal(k.detail, `a proceeding's kind is one your group's active jurisdiction profiles name: one of ${k.kinds.join(", ")}. Nothing was written.`);
  const bare = world();
  const forum = bare.e.createEntity({ note: NOTE, kind: "institution", label: "A Court" }).entity_id;
  assert.equal(bare.e.createEntity({ note: NOTE, kind: "proceeding", proceeding: { forum, kind: "suit", number: "1" } }).detail,
               "a proceeding's kind is one your group's active jurisdiction profiles name; they name none. Nothing was written.");
  const nf = noForms();
  const f2 = nf.createEntity({ note: NOTE, kind: "institution", label: "A Court" }).entity_id;
  const n = nf.createEntity({ note: NOTE, kind: "proceeding", proceeding: { forum: f2, kind: "suit", number: "1" } });
  assert.deepEqual([n.reason, n.field, n.forms], ["IDENTIFIER_NOT_IN_SPACE", "number", []]);
  /* the space's label is id-spaces' (its R1); the rest of the sentence is this module's */
  assert.match(n.detail, /^the number has the shape of no form of the .+ space; your group's active jurisdiction profiles give it no form\. Nothing was written\.$/);
});

test("R19 (DEC-149) namingPlan with no terms and none held answers why: your group's active jurisdiction profiles hold no search terms", () => {
  assert.equal(world().e.namingPlan().why, "no terms were given and your group's active jurisdiction profiles hold no search terms, so "
    + "there is nothing to explain; no term is assumed");
});

test("R25 R31 (DEC-149) no member-facing string this module answers calls the group's Civicsmith the instance, a copy, the plane or a server", () => {
  const texts = [];
  const keep = (x) => { if (x && typeof x === "object") for (const k of ["translation", "detail", "why", "message"]) if (typeof x[k] === "string") texts.push(x[k]); };
  for (const t of Object.values(IDSPACE_CHECKS)) texts.push(t.translation);
  for (const profiles of [PE, null, "no forms"]) {
    const w = world({ profiles: profiles === "no forms" ? null : profiles });
    const e = profiles === "no forms" ? noForms() : w.e;
    const a = e.createEntity({ note: NOTE, kind: "person", label: "Pat" }).entity_id;
    const court = e.createEntity({ note: NOTE, kind: "institution", label: "A Court" }).entity_id;
    w.read("INFO-1", sha("d"), [{ kind: "x", key: "1", label: "Pat" }]);
    const held = w.held("INFO-2", sha("h"), ["https://minutes.port-ellery.example/a/1"]);
    [e.createEntity({}), e.createEntity({ kind: "theme", label: "x", note: NOTE }), e.createEntity({ kind: "office", note: NOTE }),
     e.createEntity({ kind: "office", label: "x" }), e.createEntity({ kind: "body", label: "x", note: NOTE, sector: "club" }),
     e.createEntity({ kind: "office", label: "x", note: NOTE, sector: "government" }),
     e.createEntity({ kind: "proceeding", note: NOTE, proceeding: {} }),
     e.createEntity({ kind: "proceeding", note: NOTE, proceeding: { forum: court, kind: "nope", number: "1" } }),
     e.createEntity({ kind: "proceeding", note: NOTE, proceeding: { forum: court, kind: "suit", number: "?" } }),
     e.addAlias({ entityId: a, alias: " " }), e.addAlias({ entityId: "ENT-2026-0404", alias: "x" }),
     e.declareRelation({ relation: "x" }), e.declareRelation({ relation: "overlaps", fromEntity: a, toEntity: court, justification: "j" }),
     e.addIdentifier({ entityId: a, scheme: "nope", id: "1", basis: "b" }), e.addIdentifier({ entityId: a, scheme: "marlow_bar", id: "?", basis: "b" }),
     e.addIdentifier({ entityId: a, scheme: "ellery_person", id: "P1", basis: "x", by: "class:daemon" }),
     e.setSector({ entityId: a, sector: "government", note: "n" }), e.withdrawIdentifier({ entityId: a, scheme: "x", id: "1", reason: "r" }),
     e.resolve({}), e.resolve({ captureSha: sha("d"), ref: "z:9" }), e.testify({ captureSha: sha("d"), ref: "x:1", entityId: a, basis: " " }),
     e.reportResolutionDefect({ captureSha: sha("d"), ref: "x:1", entityId: a, reason: "r" }),
     e.registerProceeding({ captureSha: sha("never"), extent: { kind: "document" }, forum: court, kind: "suit", number: "1" }),
     e.namingDocuments({}), e.namingPlan(), e.readEntity({}), e.concerns({}), e.resolutionsFor({}),
     e.idMatch({ space: "nope" }), e.idMatch({ space: "project", a: "zzz" }), e.idMatch({ space: "enactment", a: "1" }),
     e.idMatch({ space: "project", a: "WO-0001", b: "WO-0001", aCapture: held, bCapture: sha("no"), viewer: MACHINE }),
     e.neighbours({ node: a }),
    ].forEach(keep);
  }
  assert.ok(texts.length > 60, String(texts.length));
  for (const t of texts) assert.ok(!NAMED.test(t), t);
  assert.ok(texts.some((t) => /your group's/.test(t)), "the group is named where a sentence needs a name");
});
