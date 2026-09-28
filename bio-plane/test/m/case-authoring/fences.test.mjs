/* case-authoring: op=publish's fences before any member is read — the machine fence (R1), authority (R2), the authored
   fields (R3) — and the authored partition (R5). Each refusal writes nothing. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, AUTHORED } from "./fixture.mjs";
import { MACHINE_FENCE_CHECKS, PROJECT_VISIBILITY_CHECKS } from "../../../checks/bio-checks.mjs";
import { COMPLETENESS_MAX, MEMBER_ROLES } from "../../../src/case-authoring/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";

function setup() {
  const w = world();
  for (const m of ["alice", "bo", "cy"]) w.member(m);
  w.member("root", { role: "admin" });
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  w.finding(Q2, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  return { w, P };
}
const reasons = (r) => [r.ok, r.reason];

test("R1: an empty or machine author is MACHINE_CANNOT_PUBLISH (C-32.6, with its code and translation) before anything else, even with nothing else given", () => {
  const { w, P } = setup();
  const before = w.snapshot();
  const row = MACHINE_FENCE_CHECKS.MACHINE_CANNOT_PUBLISH;
  for (const author of [null, "", "   ", MACHINE, "token:member", "class:ai"]) {
    const r = w.ca.publishCase({ author, viewer: V("alice") });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "MACHINE_CANNOT_PUBLISH",
      "MACHINE_CANNOT_PUBLISH", "C-32.6", row.translation], `author ${JSON.stringify(author)}`);
    const full = w.publish(P, "alice", [Q], { author });
    assert.equal(full.reason, "MACHINE_CANNOT_PUBLISH", "asked before a well-formed act's every other gate");
  }
  assert.deepEqual(w.snapshot(), before, "nothing written");
});

test("R2: authority in order — NO_PUBLISHING_PROJECT; a project seen only at existence answers C-70.1; one unseen or none NO_SUCH_PROJECT identically; NOT_A_PROJECT; NOT_THE_PROJECT_OWNER, an owner only, no administrator arm", () => {
  const { w, P } = setup();
  const before = w.snapshot();
  assert.deepEqual(reasons(w.ca.publishCase({ ...AUTHORED, author: "alice", viewer: V("alice") })), [false, "NO_PUBLISHING_PROJECT"]);
  /* unseen (bo is no participant of a hidden project) and absent answer alike */
  const unseen = w.publish(P, "bo", [Q]);
  const absent = w.publish("PROJ-2026-9999-none", "bo", [Q]);
  assert.equal(unseen.reason, "NO_SUCH_PROJECT");
  assert.deepEqual({ ...unseen, project: null, detail: unseen.detail.replace(P, "X") },
                   { ...absent, project: null, detail: absent.detail.replace("PROJ-2026-9999-none", "X") });
  /* a discoverable project, asked by a member outside it: the existence refusal, membership's own (C-70.1) */
  assert.equal(w.membership.projectVisibilitySet({ projectId: P, setting: "discoverable", reason: "open to all",
                                                   by: "alice", viewer: V("alice") }).ok, true);
  const seen = w.publish(P, "bo", [Q]);
  assert.deepEqual([seen.ok, seen.reason, seen.check],
    [false, "PROJECT_SEEN_NOT_A_PARTICIPANT", PROJECT_VISIBILITY_CHECKS.PROJECT_SEEN_NOT_A_PARTICIPANT.check]);
  assert.deepEqual(reasons(w.publish(Q, "alice", [Q])), [false, "NOT_A_PROJECT"]);
  /* a joined participant who is not an owner, and an active administrator who sees every project */
  w.join(P, "cy");
  assert.deepEqual(reasons(w.publish(P, "cy", [Q])), [false, "NOT_THE_PROJECT_OWNER"]);
  assert.deepEqual(reasons(w.publish(P, "root", [Q])), [false, "NOT_THE_PROJECT_OWNER"]);
  const ownerOnly = w.publish(P, "cy", [Q]);
  assert.deepEqual([ownerOnly.project, ownerOnly.author], [P, "cy"]);
  w.st.sql.exec(`UPDATE project_participants SET owner=1 WHERE project_id=? AND member_id='cy'`, P);
  assert.equal(w.publish(P, "cy", [Q]).ok, true, "an owner publishes");
  const after = w.snapshot();
  assert.notDeepEqual(after, before);
});

test("R3: authored fields in order — NO_TARGET, DUPLICATE_MEMBER, NO_STATEMENT, NO_SUBJECT_POSITION (one of SUBJECT_POSITIONS), NO_SUBJECT_JUSTIFICATION, NO_EXCLUSION_FIELD (an empty list legal), NO_SCOPE, NO_BIAS_ACKNOWLEDGEMENT, BAD_EXCLUSION with ord, BAD_COMPLETENESS; nothing written", () => {
  const { w, P } = setup();
  const before = w.snapshot();
  const all = { ...AUTHORED };
  const act = (over, targets = [Q]) => w.publish(P, "alice", targets, over);
  assert.deepEqual(reasons(act({}, [])), [false, "NO_TARGET"]);
  assert.deepEqual(reasons(act({ targets: null, target: null }, [])), [false, "NO_TARGET"]);
  const dup = act({}, [Q, Q]);
  assert.deepEqual([dup.reason, dup.target], ["DUPLICATE_MEMBER", Q]);
  /* each field missing, with every LATER field missing too, answers the earliest */
  const order = [["statement", "NO_STATEMENT"], ["subjectPosition", "NO_SUBJECT_POSITION"],
                 ["subjectJustification", "NO_SUBJECT_JUSTIFICATION"], ["excluded", "NO_EXCLUSION_FIELD"],
                 ["scope", "NO_SCOPE"], ["biasAcknowledgement", "NO_BIAS_ACKNOWLEDGEMENT"]];
  order.forEach(([field, code], i) => {
    const over = Object.fromEntries(order.slice(i).map(([f]) => [f, f === "excluded" ? null : ""]));
    assert.equal(act(over).reason, code, `${field} absent is ${code}`);
    assert.equal(act({ [field]: field === "excluded" ? undefined : "   " }).reason, code, `${field} blank is ${code}`);
  });
  const pos = act({ subjectPosition: "contacted" });
  assert.deepEqual([pos.reason, pos.allowed], ["NO_SUBJECT_POSITION", ["sought_and_answered", "sought_no_answer", "not_sought"]]);
  /* each declared position passes this gate (the one act that publishes leaves an unsigned preparation, so the others
     are asked of their own refusal, which is later: R8) */
  for (const p of pos.allowed) assert.notEqual(act({ subjectPosition: p }).reason, "NO_SUBJECT_POSITION", `${p} is a position`);
  /* exclusions: an object, a target or a description, a reason */
  for (const [excluded, ord] of [[["x"], 0], [[{ reason: "why" }], 0], [[{ target: "INFO-2026-0009-z", reason: "r" }, { description: "d" }], 1]]) {
    const r = act({ excluded });
    assert.deepEqual([r.reason, r.ord], ["BAD_EXCLUSION", ord]);
  }
  /* the restricted grammar: at most COMPLETENESS_MAX characters, no quote, backslash or line break, in every authored
     field and every exclusion's description and reason */
  assert.equal(COMPLETENESS_MAX, 2000);
  const fields = [["statement", "statement"], ["subjectJustification", "subject_justification"], ["scope", "scope"],
                  ["biasAcknowledgement", "bias_acknowledgement"]];
  for (const bad of ['a "quote"', "a \\ backslash", "a\nbreak", "a\rreturn", "x".repeat(COMPLETENESS_MAX + 1)]) {
    for (const [arg, name] of fields) {
      const r = act({ [arg]: bad });
      assert.deepEqual([r.reason, r.field], ["BAD_COMPLETENESS", name], `${name}: ${JSON.stringify(bad).slice(0, 20)}`);
    }
    const r1 = act({ excluded: [{ description: bad, reason: "r" }] });
    assert.deepEqual([r1.reason, r1.field], ["BAD_COMPLETENESS", "excluded[0].description"]);
    const r2 = act({ excluded: [{ description: "d", reason: bad }] });
    assert.deepEqual([r2.reason, r2.field], ["BAD_COMPLETENESS", "excluded[0].reason"]);
  }
  for (const [arg] of fields)
    assert.notEqual(act({ [arg]: "x".repeat(COMPLETENESS_MAX) }).reason, "BAD_COMPLETENESS", `${arg}: exactly the bound is legal`);
  assert.ok(!["NO_EXCLUSION_FIELD", "BAD_EXCLUSION"].includes(act({ excluded: [] }).reason), "an empty exclusion list is a claim, and legal");
  const firstPublish = w.rows(`SELECT case_id FROM case_documents`).length;
  assert.equal(firstPublish, 1, "one act published (the first well-formed one); no refusal wrote a document");
  void before; void all;
});

test("R5: roles is a map from member id to load_bearing or supporting, with no default — BAD_ROLES, NO_MEMBER_ROLE, BAD_MEMBER_ROLE, NO_LOAD_BEARING_MEMBER", () => {
  const { w, P } = setup();
  const before = w.snapshot();
  assert.deepEqual(MEMBER_ROLES, ["load_bearing", "supporting"]);
  const bad = w.publish(P, "alice", [Q], { roles: ["load_bearing"] });
  assert.deepEqual([bad.reason, bad.allowed], ["BAD_ROLES", MEMBER_ROLES]);
  assert.equal(w.publish(P, "alice", [Q], { roles: "load_bearing" }).reason, "BAD_ROLES");
  const none = w.publish(P, "alice", [Q, Q2], { roles: null });
  assert.deepEqual([none.reason, none.target], ["NO_MEMBER_ROLE", Q], "absent roles designate nobody");
  const one = w.publish(P, "alice", [Q, Q2], { roles: { [Q]: "load_bearing" } });
  assert.deepEqual([one.reason, one.target], ["NO_MEMBER_ROLE", Q2], "no default for an omitted member");
  const wrong = w.publish(P, "alice", [Q], { roles: { [Q]: "critical" } });
  assert.deepEqual([wrong.reason, wrong.target, wrong.role, wrong.allowed], ["BAD_MEMBER_ROLE", Q, "critical", MEMBER_ROLES]);
  const sup = w.publish(P, "alice", [Q, Q2], { roles: { [Q]: "supporting", [Q2]: "supporting" } });
  assert.deepEqual([sup.reason, sup.members], ["NO_LOAD_BEARING_MEMBER", [Q, Q2]]);
  assert.deepEqual(w.snapshot(), before, "nothing written by any of them");
  const ok = w.publish(P, "alice", [Q, Q2], { roles: { [Q]: "load_bearing", [Q2]: "supporting" } });
  assert.deepEqual([ok.ok, ok.roles], [true, [{ target: Q, role: "load_bearing" }, { target: Q2, role: "supporting" }]]);
});
