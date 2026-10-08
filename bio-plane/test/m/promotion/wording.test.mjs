/* promotion's DEC-149 sweep (T35-16; N690, K1847, K1899 (1); `build/plan/draft-T35-dec149-l1-l7.md`): the 19 served strings
 * that called the group's own Civicsmith "the instance", "this copy" or "the plane", each read here through the act that
 * serves it and named by the requirement whose refusal carries it. The rule (BOB's START): field and identifier names
 * stay; "the plane" and "the instance" go; member-facing text says "your group's Civicsmith" or names the thing itself
 * (here, the record, which mints a project's id and writes it into the document). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { makePromotion, doc, infoDoc, create, T0 } from "./fixtures.mjs";
import { runGate, PROMOTION_CHECKS, PROMOTED_TYPE_CHECKS, PROJECT_CREATION_VISIBILITY_CHECKS, PROMOTION_ROW_CHECKS,
         PROJECT_MINT_CHECKS, PROMOTION_REGISTRATION_CHECKS, checkProjectNameUniqueness } from "../../../src/promotion/index.mjs";

const OURS = "your group's Civicsmith";
/* The words DEC-149 retires for the group's own Civicsmith. "copy" is asked only as the noun for it ("this copy",
   "a copy records"); a promotion's copy of a file in history is another meaning and is not served by these rows. */
const RETIRED = /\binstance\b|\bplane\b|\bserver\b|\bthis copy\b|\ba copy records\b/i;
const pd = (title, extra = {}) => doc({ object_type: "project", title, current_state: "forming", created: T0, last_updated: T0, ...extra });
const mk = (title, extra = {}) => ({ base: null, snapKey: `p-${title}`, author: "member:ann", ownerMemberId: "ann",
  files: [{ path: "bundle.md", text: pd(title) }], meta: {}, ...extra });

test("R28 (gate.mjs runGate): PLANE_HELD_IN_PARTS says the acquisition receipt of your group's Civicsmith names the whole hash", async () => {
  const r = await runGate({ bundleId: "INFO-2026-0001", image: { "bundle.md": infoDoc("INFO-2026-0001") }, knownIds: new Set(),
    registers: [{ path: "data/p.pdf", capture_sha: "a".repeat(64), bytes: 10 }],
    hasCapture: async () => ({ present: false, heldInParts: true }) });
  const f = r.findings.find((x) => x.check === "PLANE_HELD_IN_PARTS");
  assert.ok(f, JSON.stringify(r.findings));
  assert.match(f.detail, /^registered capture is held only in parts: the acquisition receipt of your group's Civicsmith names the whole hash, /);
  assert.doesNotMatch(f.detail, RETIRED);
  assert.equal(r.ok, false);
});

test("R9 (checks.mjs:165, C-86.3): ENVELOPE_TITLE_DISAGREES's translation says names are held unique across your group's Civicsmith", () => {
  const { p } = makePromotion();
  const id = "INFO-2026-0001";
  const r = p.promote(create(id, infoDoc(id), { meta: { title: "Another name" } }));
  assert.deepEqual([r.reason, r.check], ["ENVELOPE_TITLE_DISAGREES", "C-86.3"]);
  assert.match(r.translation, /names are held unique across your group's Civicsmith, so rather than file it under a name it does not bear/);
  assert.equal(r.translation, PROMOTED_TYPE_CHECKS.ENVELOPE_TITLE_DISAGREES.translation);
  assert.doesNotMatch(r.translation, RETIRED);
});

test("R13 (checks.mjs:290, :291, C-64.1): GROUP_UNDETERMINED's translation says your group's Civicsmith has not recorded its group, and that it records it once", () => {
  const { p } = makePromotion({ group: null });
  const id = "INFO-2026-0001";
  const r = p.promote(create(id, infoDoc(id, { group: undefined })));
  assert.deepEqual([r.reason, r.check], ["GROUP_UNDETERMINED", "C-64.1"]);
  assert.equal(r.translation, "Your group's Civicsmith has not recorded which group it belongs to, and nothing in this "
    + "request says, so the record cannot write a document that must name the group that produced it. It records its "
    + "group once: when it is first installed, or by one act of whoever holds its administrator token in the hosting "
    + "account. Nothing was written.");
  assert.doesNotMatch(r.translation, RETIRED);
});

test("R40 (checks.mjs:336, :342, C-102.4, C-102.5): FACT_UNAVAILABLE and FACT_FAILED say no part of your group's Civicsmith answers, or the part that does stopped", () => {
  const { p } = makePromotion();
  const none = p.fact("nobodyProvides");
  assert.deepEqual([none.reason, none.check], ["FACT_UNAVAILABLE", "C-102.4"]);
  assert.equal(none.translation, "No part of your group's Civicsmith answers that question yet, so there is no answer here, "
    + "which is not the same as the answer being no. Nothing was written.");
  /* The act that needs an unprovided fact answers the same row. */
  const bare = makePromotion({ facts: false });
  assert.equal(bare.p.promote(create("INFO-2026-0001", infoDoc("INFO-2026-0001"))).translation, none.translation);
  p.registerFact("fragile", "later", () => { throw new Error("down"); });
  const failed = p.fact("fragile");
  assert.deepEqual([failed.reason, failed.check], ["FACT_FAILED", "C-102.5"]);
  assert.equal(failed.translation, "The part of your group's Civicsmith that answers that question stopped with an error "
    + "instead of answering, so there is no answer here, which is not the same as the answer being no. Nothing was written.");
  for (const x of [none, failed]) assert.doesNotMatch(x.translation, RETIRED);
});

const BUILD_FAULT = "This is a fault in how your group's Civicsmith was built, not in the record, and nothing in the record changed.";

test("R40 (checks.mjs:349, :350, C-102.6): FACT_MALFORMED says a part of your group's Civicsmith offered an unnamed answer, a fault in how your group's Civicsmith was built", () => {
  const { p } = makePromotion();
  const r = p.registerFact("", "later", () => 1);
  assert.deepEqual([r.reason, r.check], ["FACT_MALFORMED", "C-102.6"]);
  assert.equal(r.translation, "A part of your group's Civicsmith tried to offer an answer to a question without naming the "
    + `question, itself, or how to answer it, so nothing was registered. ${BUILD_FAULT}`);
});

test("R39 (checks.mjs:356, :357, C-102.7): STEP_MODULE_UNNAMED says a part of your group's Civicsmith added a check without naming itself, a fault in how your group's Civicsmith was built", () => {
  const { p } = makePromotion();
  const r = p.registerStep("", {});
  assert.deepEqual([r.reason, r.check], ["STEP_MODULE_UNNAMED", "C-102.7"]);
  assert.equal(r.translation, "A part of your group's Civicsmith tried to add its own check to every promotion without "
    + `naming itself, so nothing was registered. ${BUILD_FAULT}`);
});

test("R39 (checks.mjs:363, :365, C-102.8): STEP_DECLARED says a part of your group's Civicsmith registered twice, a fault in how your group's Civicsmith was built", () => {
  const { p } = makePromotion();
  p.registerStep("later", {});
  for (const r of [p.registerStep("later", {}), p.registerFact("citedBy", "later", () => [])]) {
    assert.deepEqual([r.reason, r.check], ["STEP_DECLARED", "C-102.8"]);
    assert.equal(r.translation, "A part of your group's Civicsmith tried to register something it had already registered, "
      + "or that another part already provides, so the second registration was refused and the first still stands. "
      + BUILD_FAULT);
  }
});

test("R19 (index.mjs NAME_TAKEN, #promote): NAME_TAKEN and NO_TITLE say a project's name is unique across your group's Civicsmith", () => {
  const { p } = makePromotion();
  assert.equal(p.promote(mk("Sewer Fund")).ok, true);
  const taken = p.promote(mk("  sewer   FUND "));
  assert.equal(taken.reason, "NAME_TAKEN");
  assert.equal(taken.detail, "a project by that name already exists in your group's Civicsmith, compared without regard "
    + "to case or spacing. This holds for deactivated projects too, because their names are still cited.");
  const untitled = p.promote(mk("", { files: [{ path: "bundle.md", text: pd("") }] }));
  assert.deepEqual([untitled.reason, untitled.detail], ["NO_TITLE", "a project needs a name, and it must be unique across your group's Civicsmith"]);
  for (const x of [taken, untitled]) assert.doesNotMatch(x.detail, RETIRED);
});

test("R19 (index.mjs is-project-id-supplied, is-project-id-bytes): a project's creation is refused in words naming the record as what mints its id and writes it in, the field names kept", () => {
  const { p } = makePromotion();
  const supplied = p.promote({ ...mk("Sewer Fund"), bundleId: "PROJ-2026-0001-x" });
  assert.equal(supplied.reason, "PROJECT_ID_SUPPLIED");
  assert.equal(supplied.detail, "a new project's id is minted by the record and returned; send the creation with no "
    + "bundleId. A creation in the PROJ- namespace names no id, whatever type it claims. Nothing was created.");
  const unreadable = p.promote({ ...mk("x"), files: [{ path: "bundle.md", text: "no fm" }], meta: { object_type: "project" } });
  assert.equal(unreadable.reason, "PROJECT_DOCUMENT_UNREADABLE");
  assert.equal(unreadable.detail, "the new project's bundle.md must arrive as inline text beginning with a --- front matter "
    + "block, because the record writes the minted id into it. Nothing was created.");
  const inBytes = p.promote({ ...mk("x"), files: [{ path: "bundle.md", text: pd("x", { id: "PROJ-1" }) }] });
  assert.equal(inBytes.reason, "PROJECT_ID_IN_BYTES");
  assert.equal(inBytes.detail, "the new project's bundle.md already carries a top-level id: line. The record writes the id "
    + "it mints; remove the line and send it again. Nothing was created.");
  for (const x of [supplied, unreadable, inBytes]) assert.doesNotMatch(x.detail, RETIRED);
});

test("R41 (index.mjs is-project-fork-id-supplied): PROJECT_FORK_ID_SUPPLIED says a fork's id is minted by the record and returned as newId, the field name kept", () => {
  const { p } = makePromotion();
  const r = p.forkProject({ projectId: "PROJ-2026-0001-x", newId: "PROJ-2026-0002-y", title: "Fork", by: "bob" });
  assert.equal(r.reason, "PROJECT_FORK_ID_SUPPLIED");
  assert.equal(r.detail, "a fork's id is minted by the record and returned as newId; send the fork with no newId. Nothing was forked.");
  assert.doesNotMatch(r.detail, RETIRED);
});

test("R38 (names.mjs:84): C-77.2's repair for an untitled project says give it a title unique across your group's Civicsmith", () => {
  const files = new Map([["bundle.md", pd("")]]);
  const r = checkProjectNameUniqueness([{ folderName: "PROJ-2026-0001-x", files }]);
  const w = r.findings.find((x) => x.check === "C-77.2");
  assert.ok(w, JSON.stringify(r.findings));
  assert.deepEqual(w.repairs, [`give the project a title unique across ${OURS}`]);
});

test("R9, R13, R39, R40 (DEC-149): no row this module holds calls the group's own Civicsmith the instance, the plane, a server or a copy", () => {
  for (const table of [PROMOTION_CHECKS, PROMOTED_TYPE_CHECKS, PROJECT_CREATION_VISIBILITY_CHECKS, PROMOTION_ROW_CHECKS,
                       PROJECT_MINT_CHECKS, PROMOTION_REGISTRATION_CHECKS])
    for (const [code, row] of Object.entries(table)) assert.doesNotMatch(row.translation, RETIRED, code);
});
