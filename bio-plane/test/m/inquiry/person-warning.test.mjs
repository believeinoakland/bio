/* R59 (D13; K2479, K2480): a promotion that creates a question, or revises its question or subject, naming a person in no
   public role carries a warning, never an error, recorded with her choice; a machine's proposal carries it to the member
   who takes it up. Its test is the pure export `personWarning` (over `personsInNoPublicRole`), which `intent` R32 and
   `hypotheses` R19 ask too; the record's facts behind it (`personFacts`) read a public role from `lines` (an office held,
   responsible for or acted for; a government body belonged to or sat on). Driven through the real entities, lines and
   promotion. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, V, MACHINE } from "./fixture.mjs";
import { linesOf } from "../../../src/lines/index.mjs";
import { personWarning, personsInNoPublicRole, PUBLIC_ROLE_LINES, INQUIRY_WARNINGS } from "../../../src/inquiry/index.mjs";

const ROW = INQUIRY_WARNINGS.PERSON_IN_NO_PUBLIC_ROLE;
const VALID = { from: null, to: null, zone: "America/Los_Angeles" };

function setup() {
  const w = world();
  w.member("alice");
  const lines = linesOf(w.host, { record: w.record, provenance: w.prov, content: w.content, entities: w.entities });
  lines.migrate();
  const ent = (kind, label, extra = {}) => {
    const r = w.entities.createEntity({ kind, label, note: `${label}, registered for the test`, declaredBy: V("alice"), ...extra });
    assert.equal(r.ok, true, JSON.stringify(r)); return r.entity_id;
  };
  const line = (kind, from, to, extra = {}) => {
    const r = lines.recordLine({ kind, from, to, valid: VALID, basis: { statement: "as the clerk's roster says" }, by: V("alice"), ...extra });
    assert.equal(r.ok, true, JSON.stringify(r)); return r.line_id;
  };
  return { w, lines, ent, line };
}
const question = (w, id, q, opts = {}) => inquiryMd(id, { question: q, ...opts });
const rows = (w, id) => w.rows(`SELECT by, persons, choice FROM inquiry_person_warnings WHERE bundle_id=? ORDER BY warning_id`, id)
  .map((r) => [r.by, JSON.parse(r.persons).map((p) => p.label), r.choice]);

test("R59 the pure test: a person in no public role the text names (by label or alias as whole words, by id, or found named) warns; anything else answers null", () => {
  const roe = { entity_id: "ENT-2026-0001", kind: "person", label: "Jane Roe", aliases: ["J. Roe"], public_role: false };
  const w = personWarning({ text: "Did Jane Roe sign the contract?", entities: [roe], viewer: V("alice") });
  assert.deepEqual(w, { code: "PERSON_IN_NO_PUBLIC_ROLE", key: "question.warning.person", translation: ROW.translation,
                        persons: [{ entity_id: "ENT-2026-0001", label: "Jane Roe" }], viewer: V("alice") });
  for (const text of ["did jane  roe sign?", "Was it J. Roe?", "Is ENT-2026-0001 the signer?"])
    assert.deepEqual(personsInNoPublicRole({ text, entities: [roe] }).map((p) => p.entity_id), ["ENT-2026-0001"], text);
  assert.deepEqual(personsInNoPublicRole({ text: "Was the budget cut?", entities: [{ ...roe, named: true }] }).length, 1, "named by the caller");
  /* negative controls */
  for (const [text, entities, why] of [
    ["Did Janet Roesler sign?", [roe], "not the name as whole words"],
    ["Did Jane Roe sign?", [{ ...roe, public_role: true }], "a person in a public role"],
    ["Did Jane Roe sign?", [{ ...roe, kind: "body" }], "not a person"],
    ["Was the budget cut?", [roe], "named nowhere"],
    ["Did Jane Roe sign?", [], "no facts"]])
    assert.equal(personWarning({ text, entities }), null, why);
  for (const a of [undefined, null, {}, { text: 7, entities: "x" }, { entities: [null, 7, { kind: "person" }] }])
    assert.doesNotThrow(() => personWarning(a));
  assert.deepEqual(personsInNoPublicRole({ text: "Jane Roe, Jane Roe", entities: [roe, roe] }).length, 1, "each once");
});

test("R59 the public role is read from lines: an office held, responsible for or acted for, a government body belonged to or sat on; a withdrawn line, a company or no line is no public role", () => {
  const { w, lines, ent, line } = setup();
  assert.deepEqual(PUBLIC_ROLE_LINES, { office: ["holds", "responsible_for", "acts_for"], government_body: ["belongs_to", "seat_on"] });
  const office = ent("office", "City Clerk"), council = ent("body", "City Council", { sector: "government" }),
        firm = ent("body", "Acme Paving", { sector: "company" });
  const cases = [
    ["Ann Held", (p) => line("holds", p, office, { capacity: "elected" }), true],
    ["Ben Responsible", (p) => line("responsible_for", p, office), true],
    ["Cy Acting", (p) => line("acts_for", p, office), true],
    ["Di Member", (p) => line("belongs_to", p, council), true],
    ["Ed Employee", (p) => line("belongs_to", p, firm), false],
    ["Flo Withdrawn", (p) => { const id = line("holds", p, office, { capacity: "appointed" });
                               assert.equal(lines.withdrawLine({ lineId: id, reason: "entered in error", by: V("alice") }).ok, true); }, false],
    ["Gus Nobody", () => {}, false]];
  for (const [label, make, expected] of cases) {
    const p = ent("person", label);
    make(p);
    const facts = w.k.personFacts({ text: `What did ${label} decide?` });
    assert.deepEqual(facts, [{ entity_id: p, kind: "person", label, public_role: expected, named: true }], label);
    assert.equal(personWarning({ text: `What did ${label} decide?`, entities: facts }) === null, expected, label);
  }
  /* an entity that is no person is never a fact here; the subject and an id written in the text are found too */
  assert.deepEqual(w.k.personFacts({ text: "What did the City Clerk decide?" }), []);
  const p = ent("person", "Hal Subject");
  assert.deepEqual(w.k.personFacts({ text: "Was it signed?", subject: p }).map((f) => f.entity_id), [p]);
  assert.deepEqual(w.k.personFacts({ text: `Did ${p} sign?` }).map((f) => f.entity_id), [p]);
});

test("R59 at the promotion: a creation or a revision of the question naming a person in no public role carries the warning, recorded with her choice; nothing is refused", () => {
  const { w, ent, line } = setup();
  const roe = ent("person", "Jane Roe"), clerk = ent("person", "Kim Clerk"), office = ent("office", "City Clerk");
  line("holds", clerk, office, { capacity: "appointed" });
  const Q = "INQ-2026-5901-q", R = "INQ-2026-5902-r";
  const made = w.promote(Q, question(w, Q, "Did Jane Roe sign the paving contract?"), null, { author: V("alice") });
  assert.equal(made.ok, true);
  assert.deepEqual(made.warning, { code: "PERSON_IN_NO_PUBLIC_ROLE", key: ROW.key, translation: ROW.translation,
    persons: [{ entity_id: roe, label: "Jane Roe" }], viewer: V("alice"), choice: "warned_at_act" });
  assert.equal(w.record.head(Q) !== null, true, "the question landed");
  /* a revision that leaves the question and subject alone asks nothing and records nothing */
  const same = w.promote(Q, question(w, Q, "Did Jane Roe sign the paving contract?", { extra: ["criticality: supporting"] }));
  assert.equal(same.ok, true); assert.equal(same.warning, undefined);
  /* re-worded, still naming her, seen before the act: she went on */
  const seen = w.promote(Q, question(w, Q, "When did Jane Roe sign the paving contract?"), undefined, { personWarningSeen: true });
  assert.equal(seen.warning.choice, "went_on");
  assert.deepEqual(rows(w, Q), [[V("alice"), ["Jane Roe"], "warned_at_act"], [V("alice"), ["Jane Roe"], "went_on"]]);
  /* negative controls: a person in a public role, and a question naming nobody, carry none */
  for (const [id, q] of [[R, "Did Kim Clerk sign the paving contract?"], ["INQ-2026-5903-s", "Was the paving contract signed?"]]) {
    const r = w.promote(id, question(w, id, q), null, { author: V("alice") });
    assert.equal(r.ok, true); assert.equal(r.warning, undefined, q); assert.deepEqual(rows(w, id), []);
  }
  /* the subject entity is a named entity: a revision naming her as subject warns */
  const subj = w.promote(R, question(w, R, "Did Kim Clerk sign the paving contract?", { subject: roe }));
  assert.deepEqual(subj.warning.persons.map((p) => p.label), ["Jane Roe"]);
  assert.deepEqual(subj.findings ?? [], [], "a warning, never a finding");
  /* purged with its question */
  w.record.purge({ bundleId: Q });
  assert.deepEqual(rows(w, Q), []);
});

test("R59 a machine's proposal records the warning pending, and carries it to the member who takes the question up, once", () => {
  const { w, ent } = setup();
  ent("person", "Jane Roe");
  const Q = "INQ-2026-5911-m";
  const proposed = w.promote(Q, question(w, Q, "Did Jane Roe sign the paving contract?"), null, { author: MACHINE });
  assert.equal(proposed.ok, true);
  assert.deepEqual([proposed.warning.choice, proposed.warning.viewer], ["pending", undefined]);
  /* alice takes it up with a revision that leaves the question alone: the machine's warning is hers now */
  const taken = w.promote(Q, question(w, Q, "Did Jane Roe sign the paving contract?", { extra: ["criticality: supporting"] }),
    undefined, { author: V("alice") });
  assert.deepEqual([taken.warning.choice, taken.warning.proposed_by_machine, taken.warning.viewer], ["warned_at_act", true, V("alice")]);
  assert.deepEqual(rows(w, Q), [[MACHINE, ["Jane Roe"], "pending"], [V("alice"), ["Jane Roe"], "warned_at_act"]]);
  /* negative control: told once, her next revision carries none */
  const later = w.promote(Q, question(w, Q, "Did Jane Roe sign the paving contract?", { extra: ["criticality: central"] }),
    undefined, { author: V("alice") });
  assert.equal(later.warning, undefined);
  assert.equal(rows(w, Q).length, 2);
});
