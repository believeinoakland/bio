/* investigation R14–R16, R22: a remembered claim becomes something to find; it reads as recalled until found; a
   firsthand account is provenance's testimony; a person in no public role is warned of, never refused. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, ANN, BOB, DAN, OUT, AI, P1, P2, PH, Q1, Q3 } from "./fixture.mjs";

const SIX = ["The campus closed.", "The school district.", "Since June.", "The district said the campus would be closed for one school year.", "A newsletter.", "Reopen it."];

test("R14: narrativeClaim records a quoted span of an interview answer, or her own words; claimFindStep makes the find step on the claim's question or in the project (the assistant only proposes it)", () => {
  const w = world();
  w.runs();
  const iv = w.inv.interviewKeep({ project: P1, answers: SIX, by: ANN }).interview;
  const before = w.snapshot();
  const claim = (args) => w.inv.narrativeClaim({ project: P1, source: { interview: iv, answer: 3 }, text: "closed for one school year", by: BOB, ...args });
  assert.equal(claim({ text: "" }).code, "CLAIM_NO_TEXT");
  assert.equal(claim({ text: "closed for two years" }).code, "CLAIM_BAD_SOURCE", "not a quoted span of that answer");
  assert.equal(claim({ source: { interview: iv, answer: 9 } }).code, "CLAIM_BAD_SOURCE");
  assert.equal(claim({ source: { interview: 99, answer: 3 } }).code, "NO_SUCH_INTERVIEW");
  assert.equal(claim({ source: { somewhere: true } }).code, "CLAIM_BAD_SOURCE");
  assert.equal(claim({ by: OUT }).code, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(claim({ by: AI }).code, "INVESTIGATION_MEMBER_ONLY");
  assert.equal(w.snapshot(), before);
  const c = claim({ about: "the school district" });
  assert.deepEqual([c.ok, c.stated_as], [true, "as_recalled"]);
  const own = w.inv.narrativeClaim({ project: P1, source: { own: true }, text: "The board voted in secret.", by: ANN });
  assert.equal(own.ok, true);
  /* the find step: by hand, on the claim's question or in the project */
  assert.equal(w.inv.claimFindStep({ claim: 99, by: ANN }).code, "NO_SUCH_CLAIM");
  assert.equal(w.inv.claimFindStep({ claim: c.claim, question: Q3, by: ANN }).code, "NO_SUCH_QUESTION");
  assert.equal(w.inv.claimFindStep({ claim: c.claim, by: DAN }).code, "NO_SUCH_CLAIM", "not seen: as absent");
  const f = w.inv.claimFindStep({ claim: c.claim, question: Q1, by: ANN });
  assert.equal(f.ok, true);
  const step = w.steps.step({ step: f.step, viewer: ANN });
  assert.deepEqual([step.place, step.work.startsWith("Find the record: "), step.doer], [{ questions: [Q1] }, true, "ann-h"]);
  assert.equal(w.inv.claimFindStep({ claim: c.claim, by: ANN }).already, true);
  const g = w.inv.claimFindStep({ claim: own.claim, by: BOB });
  assert.deepEqual(w.steps.step({ step: g.step, viewer: ANN }).place, { project: P1 });
  /* from the assistant: a proposal (steps R24), never a step */
  const third = w.inv.narrativeClaim({ project: P1, source: { own: true }, text: "They promised a new roof.", by: ANN });
  const steps = w.rows(`SELECT COUNT(*) AS n FROM steps`)[0].n;
  assert.equal(w.inv.claimFindStep({ claim: third.claim, run: "RUN-9", by: AI }).code, "PLAN_NOT_YOUR_RUN");
  const p = w.inv.claimFindStep({ claim: third.claim, run: "RUN-1", by: AI });
  assert.deepEqual([p.ok, p.label.machine_work], [true, true]);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM steps`)[0].n, steps, "no step until a member accepts it");
  assert.equal(w.inv.claimsOf({ project: P1, viewer: ANN }).claims.find((x) => x.claim === third.claim).find_proposal, p.proposal);
});

test("R15: a claim reads as_recalled until a member ties a record to its find step and marks it found, then found, naming the record; its look is stated; never shown as what the body said", () => {
  const w = world();
  const c = w.inv.narrativeClaim({ project: P1, source: { own: true }, text: "The district said one school year.", by: ANN });
  const read = () => w.inv.claimsOf({ project: P1, viewer: BOB }).claims[0];
  let r = read();
  assert.deepEqual([r.stated_as, r.look], ["as_recalled", { state: "not_yet_looked_for" }]);
  assert.match(r.label, /as ann-h recalls it; not what the body said/);
  assert.equal(w.inv.claimFound({ claim: c.claim, record: Q1, by: ANN }).code, "CLAIM_NO_FIND_STEP");
  const { step } = w.inv.claimFindStep({ claim: c.claim, by: ANN });
  /* a look made for the step, absent: looked for and not found, naming where */
  w.observationLog.observe({ actor_class: "member", actor: "ann", authority_kind: "step", authority: step, level: "internet",
                            subject_kind: "address", subject: "https://example.org/newsletter", state: "LOOKED_ABSENT" });
  r = read();
  assert.equal(r.stated_as, "as_recalled");
  assert.equal(r.look.state, "looked_for_and_not_found");
  assert.deepEqual(r.look.where.map((x) => x.subject), ["https://example.org/newsletter"]);
  assert.equal(w.inv.claimFound({ claim: c.claim, record: Q1, by: AI }).code, "INVESTIGATION_MEMBER_ONLY");
  assert.equal(w.inv.claimFound({ claim: c.claim, record: Q1, by: DAN }).code, "NO_SUCH_CLAIM");
  assert.equal(w.inv.claimFound({ claim: c.claim, record: "INQ-2026-0004-h", by: ANN }).ok, false, "a record she may not see is not tied");
  assert.equal(read().stated_as, "as_recalled");
  const f = w.inv.claimFound({ claim: c.claim, record: Q1, by: BOB });
  assert.deepEqual([f.ok, f.stated_as, f.record], [true, "found", Q1]);
  r = read();
  assert.deepEqual([r.stated_as, r.found.record, r.found.by], ["found", Q1, "bob-h"]);
  assert.equal(r.look, undefined);
  /* the record is the step's product (steps R9) */
  assert.deepEqual(w.steps.productsOf({ step, viewer: ANN }).products.map((p) => p.id), [Q1]);
  /* to a reader who cannot see the record it names, the claim still reads as recalled */
  assert.equal(w.inv.claimsOf({ project: P1, viewer: DAN }).code, "PROJECT_SEEN_NOT_A_PARTICIPANT");
});

test("R16: a member who was present records her firsthand account through provenance's testify (its R28): testimony graded and labelled as hers; nothing here grades it or keeps it", () => {
  const w = world();
  const before = w.snapshot();
  assert.equal(w.inv.firsthandAccount({ words: "I heard it said at the board.", observedAt: "2026-09-01", by: AI }).code, "INVESTIGATION_MEMBER_ONLY");
  const r = w.inv.firsthandAccount({ words: "I heard the superintendent say one school year at the board meeting.", observedAt: "2026-09-01", by: ANN });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(r.bundle_id, /^INFO-\d{4}-\d{4,}-observation$/);
  assert.deepEqual([r.authored, r.author, r.axes.testimony.grade, r.axes.testimony.determined], [true, ANN, "D", true], "graded on the testimony axis by provenance");
  assert.match(r.label, /^ann-h's own firsthand account/);
  assert.equal(w.snapshot(), before, "this module keeps nothing of it");
  /* provenance's own refusals reach her unchanged */
  assert.equal(w.inv.firsthandAccount({ words: "", observedAt: "2026-09-01", by: ANN }).reason, "TESTIMONY_NO_WORDS");
});

test("R22: an interview answer or claim naming a person in no public role carries inquiry R59's warning at the act, never a refusal", () => {
  const w = world();
  w.personNamed = "Jane Roe";
  const answers = [...SIX]; answers[1] = "Jane Roe, a neighbour, told me.";
  const iv = w.inv.interviewKeep({ project: P1, answers, by: ANN });
  assert.equal(iv.ok, true, "never refused");
  assert.equal(iv.warning.code, "PERSON_IN_NO_PUBLIC_ROLE");
  assert.deepEqual(iv.warning.persons.map((p) => p.label), ["Jane Roe"]);
  assert.equal(w.inv.interviewOf({ project: P1, viewer: ANN }).interviews[0].warning.code, "PERSON_IN_NO_PUBLIC_ROLE", "her choice recorded with it");
  const c = w.inv.narrativeClaim({ project: P1, source: { own: true }, text: "Jane Roe said the district lied.", by: ANN });
  assert.deepEqual([c.ok, c.warning.code], [true, "PERSON_IN_NO_PUBLIC_ROLE"]);
  /* the negative control: no such person, no warning */
  const plain = w.inv.narrativeClaim({ project: P1, source: { own: true }, text: "The district said one school year.", by: ANN });
  assert.equal(plain.warning, undefined);
  assert.equal(w.inv.interviewKeep({ project: P1, answers: SIX, by: ANN }).warning, undefined);
  void BOB; void P2; void PH;
});
