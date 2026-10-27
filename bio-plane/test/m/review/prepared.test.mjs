/* review T51 (fix round 10, follow-up 53; K5130): a draft that asked for a NEW case and has prepared it stands, for its
   observations, at the prepared case and edition (R16, `case-authoring` R83's `prepared`), so its authors' attribution
   choices for that edition are read; a draft not yet prepared reads each unchosen, with its reason. Driven through the real
   acts: `casedraft` (review), `publishCase` (case-authoring, the preparation), `attributeObservation` (case-tensions, the
   author's choice) and `reviewcopy`, over case-authoring's real fixture (real record-core, membership, basis-versions,
   provenance, publication, case-tensions). R8 stays as it was for both kinds of draft: a grant bound before the
   preparation and one after both read the draft at the identity they were bound to. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED } from "../case-authoring/fixture.mjs";
import { caseTensionsOf } from "../../../src/case-tensions/index.mjs";
import { reviewOf } from "../../../src/review/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { sha as shaOf } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";
const SECRET_A = shaOf("secret-r171-a"), SECRET_B = shaOf("secret-r171-b");
const WORDS = "I was at the meeting.";

function setup() {
  const w = world({ provider: false });
  for (const m of ["alice", "bo"]) w.member(m);
  w.doc(DOC);
  /* two members' firsthand observations, reached through one question's testimony leg */
  const obs = ["alice", "bo"].map((author, i) => {
    const o = w.prov.testify({ words: `${WORDS} (${author})`, observedAt: "2026-09-20", title: `At the meeting ${i}`, author });
    assert.equal(o.ok, true, JSON.stringify(o).slice(0, 300));
    return o.bundle_id;
  });
  w.finding(Q, [{ target: DOC, grade: "C", grade_axis: "capture", grade_source: "capture" }]);
  w.finding(Q2, obs.map((target) => ({ target, grade: "D", grade_axis: "testimony", grade_source: "testimony" })));
  const P = w.project("Team", "alice", [Q, Q2]);
  const r = reviewOf(w.host, { record: w.record, membership: w.membership, strength: w.strength,
    basisVersions: w.basisVersions, publication: w.publication, caseAuthoring: w.ca, caseInputs: w.ci,
    caseAccount: w.cacc, ratification: w.ratification, caseTensions: caseTensionsOf(w.host), now: () => w.clock.ms });
  return { w, P, r, obs };
}
const ROLES = { [Q]: "load_bearing", [Q2]: "supporting" };
const newCaseDraft = (r, P, over = {}) => {
  const d = r.act({ act: "draft", author: "alice", project: P, newCase: true, targets: [Q, Q2], roles: ROLES, ...AUTHORED, ...over });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  return d.draftId;
};
/* the preparation: op=publish over the draft's own arguments, as the editor's publish does, naming the draft */
const prepare = (w, P, draft) => {
  const p = w.publish(P, "alice", [Q, Q2], { newCase: true, draft, roles: ROLES });
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 400));
  assert.equal(p.edition, 1);
  return p;
};
const choose = (w, p, observation, by, level) => {
  const c = caseTensionsOf(w.host).attributeObservation({ caseId: p.caseId, edition: 1, observation, level,
    reason: `I choose ${level} for this edition.`, by });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
};
const member = (r, draft) => r.copy({ draft, viewer: V("alice") });
const byObs = (c) => Object.fromEntries(c.observations.map((o) => [o.observation, o]));

test("R16 (K5130): a new-case draft that has prepared its case reads each author's choice for the prepared edition, at both doors; a draft not yet prepared reads each unchosen, saying why", () => {
  const { w, P, r, obs } = setup();
  const [oa, ob] = obs;
  const draft = newCaseDraft(r, P);
  assert.equal(r.act({ act: "grant", author: "alice", draft, recipient: "Early reader", secretSha: SECRET_A }).ok, true);
  /* not yet prepared: unchosen, with its reason; the case it stands at is none */
  const before = member(r, draft);
  assert.equal(before.case.case_id, null);
  assert.deepEqual(before.observations.map((o) => o.chosen), [false, false]);
  for (const o of before.observations) assert.match(o.stated, /names no case yet, so no level can be chosen/);
  /* prepared, nobody has chosen: unchosen, now naming the prepared case and edition */
  const p = prepare(w, P, draft);
  for (const c of [member(r, draft), r.copy({ secretSha: SECRET_A, bySecret: true })]) {
    assert.deepEqual(c.observations.map((o) => o.chosen), [false, false]);
    for (const o of c.observations)
      assert.match(o.stated, new RegExp(`chosen no level for ${p.caseId} edition 1; the edition cannot be signed`));
  }
  /* writer-b chose cover, then name: the later choice is in force; writer-a has chosen nothing */
  choose(w, p, ob, "bo", "cover");
  choose(w, p, ob, "bo", "name");
  const after = [member(r, draft), r.copy({ secretSha: SECRET_A, bySecret: true })];
  for (const c of after) {
    const o = byObs(c);
    assert.deepEqual([o[oa].chosen, o[ob].chosen], [false, true]);
    assert.equal(o[ob].stated, word("review.stated.author_chosen_level", { case_id: p.caseId, edition: "1" }));
    assert.equal(JSON.stringify(c.observations).includes("\"name\""), false, "never the level itself");
  }
  assert.deepEqual(after[0].observations, after[1].observations, "both doors alike");
  /* the copy still states the draft's own case as none; only the observations read the prepared one */
  assert.equal(after[0].case.case_id, null);
});

test("R16 control (K5130): a draft that asked for a new case and has not prepared reads unchosen though a sibling prepared and chose; a draft's choices are read for its own preparation only", () => {
  const { w, P, r, obs } = setup();
  const [oa, ob] = obs;
  const prepared = newCaseDraft(r, P);
  const idle = newCaseDraft(r, P);
  const p = prepare(w, P, prepared);
  choose(w, p, oa, "alice", "group");
  assert.deepEqual([byObs(member(r, prepared))[oa].chosen, byObs(member(r, prepared))[ob].chosen], [true, false]);
  const c = member(r, idle);
  assert.deepEqual(c.observations.map((o) => o.chosen), [false, false]);
  for (const o of c.observations) assert.match(o.stated, /names no case yet, so no level can be chosen/);
});

test("R8, R16 (K5130): a grant bound before the preparation and one bound after both stay live and read the same copy; revoking one leaves the other; the dead answer is unchanged", () => {
  const { w, P, r } = setup();
  const draft = newCaseDraft(r, P);
  const g1 = r.act({ act: "grant", author: "alice", draft, recipient: "Before", secretSha: SECRET_A });
  assert.equal(g1.ok, true);
  const p = prepare(w, P, draft);
  const g2 = r.act({ act: "grant", author: "alice", draft, recipient: "After", secretSha: SECRET_B });
  assert.equal(g2.ok, true);
  for (const s of [SECRET_A, SECRET_B]) {
    assert.ok(r.liveGrant(s), "live");
    const c = r.copy({ secretSha: s, bySecret: true });
    assert.equal(c.ok, true);
    assert.equal(c.draft, draft);
    assert.match(c.observations[0].stated, new RegExp(`${p.caseId} edition 1`));
  }
  assert.equal(r.act({ act: "revoke", author: "alice", grant: g1.grantId }).ok, true);
  assert.equal(r.liveGrant(SECRET_A), null);
  assert.ok(r.liveGrant(SECRET_B));
  assert.deepEqual(r.copy({ secretSha: SECRET_A, bySecret: true }), r.copy({ secretSha: shaOf("never"), bySecret: true }));
});
