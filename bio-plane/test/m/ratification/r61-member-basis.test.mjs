/* ratification R61 (T51 fix round 10; K5187; case-catalogue R6): the member basis the case gate is given at the pinned bytes
   is each member's `{basis, references}`, so a leg severed at the pinned bytes reaches the gate's case arm. The gate is read
   at its one call (`promotion.runCaseGate`), the case document through the pre-flight (R18), and each member's pinned
   bytes through the record's `textAtSha` (the same record the module reads). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, cleanCase, fmText, CASE_BODY, V } from "./fixture.mjs";

const CASE = "CASE-2026-0061";
const M = "INQ-2026-0061-member", L = "INQ-2026-0061-leg", N = "INQ-2026-0061-other";
const PIN = "ab".repeat(32), PIN_N = "cd".repeat(32), PIN_GONE = "ef".repeat(32);

/* a member's bytes at its pin: one live leg, and `references` as the record holds them (`severed` or not, or none) */
const memberText = (references) => [
  "---", `id: ${M}`, "object_type: inquiry", "schema: inquiry@1",
  "basis:", `  - target: ${L}`, "    ground: first-hand", "    stance: supports",
  ...references,
  "---", "", "## Question", "", "What happened?", "",
].join("\n");

const SEVERED = ["references:", `  - target: ${L}`, "    status: severed"];
const LIVE = ["references:", `  - target: ${L}`, "    status: live"];

function setup(pinnedText) {
  const w = world();
  w.member("alice");
  const doc = cleanCase({ caseId: CASE, edition: 1, project: "PROJ-0061", members: [{ id: M, pin: PIN }] });
  const text = fmText(doc, { body: CASE_BODY });
  const bytes = new Map([[`${M}@${PIN}`, pinnedText]]);
  const real = w.record.textAtSha.bind(w.record);
  w.record.textAtSha = (id, sha) => (bytes.has(`${id}@${sha}`) ? bytes.get(`${id}@${sha}`) : real(id, sha));
  const handed = [];
  const runCaseGate = w.promotion.runCaseGate.bind(w.promotion);
  w.promotion.runCaseGate = (a) => { handed.push(a.memberBasis); return runCaseGate(a); };
  const preflight = (t) => w.r.caseRatifyPreflight({ text: t, signer: "alice", viewer: V("alice") });
  return { w, text, handed, preflight };
}

test("R61: the case gate is handed a member's {basis, references} at its pinned bytes, with the severed reference in it", () => {
  const { text, handed, preflight } = setup(memberText(SEVERED));
  preflight(text);
  assert.equal(handed.length, 1, "the case gate is asked once");
  const basis = handed[0];
  assert.ok(basis && Object.prototype.hasOwnProperty.call(basis, M), "the member is in the basis handed to the gate");
  assert.deepEqual(basis[M], {
    basis: [{ target: L, ground: "first-hand", stance: "supports" }],
    references: [{ target: L, status: "severed" }],
  });
});

test("R61 (control): a member whose pinned bytes hold a live reference is handed that reference too, status live", () => {
  const { text, handed, preflight } = setup(memberText(LIVE));
  preflight(text);
  assert.deepEqual(handed[0][M].references, [{ target: L, status: "live" }]);
  assert.equal(handed[0][M].basis.length, 1);
});

test("R61 (control): a member whose pinned bytes name no references is handed an empty reference list beside its basis", () => {
  const { text, handed, preflight } = setup(memberText([]));
  preflight(text);
  assert.deepEqual(handed[0][M], {
    basis: [{ target: L, ground: "first-hand", stance: "supports" }],
    references: [],
  });
});

test("R61 (control): a member whose pinned bytes the record cannot produce stays absent from the basis handed to the gate", () => {
  const { w, text, handed, preflight } = setup(memberText(SEVERED));
  const doc = cleanCase({ caseId: CASE, edition: 1, project: "PROJ-0061",
                          members: [{ id: N, pin: PIN_GONE }, { id: M, pin: PIN }] });
  preflight(fmText(doc, { body: CASE_BODY }));
  assert.equal(Object.prototype.hasOwnProperty.call(handed[0], N), false, "an unreadable pin is left unasked");
  assert.ok(Object.prototype.hasOwnProperty.call(handed[0], M));
  assert.ok(w && text);
});
