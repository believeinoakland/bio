/* promotion's DEC-149 sweep (T35-16; N690, K1847, K1899 (1); `build/plan/draft-T35-dec149-l1-l7.md`): the 19 served strings
 * that called the group's own Civicsmith "the instance", "this copy" or "the plane", each read here through the act that
 * serves it and named by the requirement whose refusal carries it. The rule (BOB's START): field and identifier names
 * stay; "the plane" and "the instance" go; member-facing text says "your group's Civicsmith" or names the thing itself
 * (here, the record, which mints a project's id and writes it into the document). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { word, localize } from "../../../src/setup-words/index.mjs";
import { makePromotion, doc, infoDoc, create, T0 } from "./fixtures.mjs";
import { runGate, PROMOTION_CHECKS, PROMOTED_TYPE_CHECKS, PROJECT_CREATION_VISIBILITY_CHECKS, PROMOTION_ROW_CHECKS,
         PROJECT_MINT_CHECKS, PROMOTION_REGISTRATION_CHECKS, checkProjectNameUniqueness } from "../../../src/promotion/index.mjs";

/* The words DEC-149 retires for the group's own Civicsmith. "copy" is asked only as the noun for it ("this copy",
   "a copy records"); a promotion's copy of a file in history is another meaning and is not served by these rows. */
const RETIRED = /\binstance\b|\bplane\b|\bserver\b|\bthis copy\b|\ba copy records\b/i;
const pd = (title, extra = {}) => doc({ object_type: "project", title, current_state: "forming", created: T0, last_updated: T0, ...extra });
const mk = (title, extra = {}) => ({ base: null, snapKey: `p-${title}`, author: "member:ann", ownerMemberId: "ann",
  files: [{ path: "bundle.md", text: pd(title) }], meta: {}, ...extra });

test("R28 (gate.mjs runGate): PLANE_HELD_IN_PARTS says the acquisition receipt of your team's Civicsmith names the whole hash", async () => {
  const r = await runGate({ bundleId: "INFO-2026-0001", image: { "bundle.md": infoDoc("INFO-2026-0001") }, knownIds: new Set(),
    registers: [{ path: "data/p.pdf", capture_sha: "a".repeat(64), bytes: 10 }],
    hasCapture: async () => ({ present: false, heldInParts: true }) });
  const f = r.findings.find((x) => x.check === "PLANE_HELD_IN_PARTS");
  assert.ok(f, JSON.stringify(r.findings));
  assert.equal(f.detail, localize("promotion.gate.registered_capture_is_held_only", "registered capture is held only in parts: the acquisition receipt of your team's Civicsmith names the whole hash, and the working bucket stores the document as its parts, each under its own hash, but the record's data/provenance.json names no parts for it. Publication copies the parts the record names, so name them there, or register the parts rather than the whole"));
  assert.doesNotMatch(f.detail, RETIRED);
  assert.doesNotMatch(f.detail, /\bgroup\b/i);
  assert.equal(r.ok, false);
});

/* N1116 (plan rule 6): a refusal row the design keys carries its words by key, `refusal.<CODE>` through setup-words'
   `word`, never English of this module's own; the refusal an act answers carries that row's translation. */
const KEYED = [PROMOTION_CHECKS, PROMOTED_TYPE_CHECKS, PROJECT_CREATION_VISIBILITY_CHECKS, PROMOTION_ROW_CHECKS,
               PROJECT_MINT_CHECKS, PROMOTION_REGISTRATION_CHECKS];

test("R9, R13, R19, R39, R40 (N1116): every refusal row this module holds has its translation by key, word(refusal.<CODE>), and says team where it names one", () => {
  let rows = 0;
  for (const table of KEYED)
    for (const [code, row] of Object.entries(table)) {
      rows += 1;
      assert.equal(row.translation, word(`refusal.${code}`), code);
      assert.doesNotMatch(row.translation, /\bgroup\b/i, code);
    }
  assert.equal(rows, 38);
});

test("R9 (C-86.3): ENVELOPE_TITLE_DISAGREES's translation is the word refusal.ENVELOPE_TITLE_DISAGREES, which says names are held unique across the team's Civicsmith", () => {
  const { p } = makePromotion();
  const id = "INFO-2026-0001";
  const r = p.promote(create(id, infoDoc(id), { meta: { title: "Another name" } }));
  assert.deepEqual([r.reason, r.check], ["ENVELOPE_TITLE_DISAGREES", "C-86.3"]);
  assert.equal(r.translation, word("refusal.ENVELOPE_TITLE_DISAGREES"));
  assert.equal(r.translation, PROMOTED_TYPE_CHECKS.ENVELOPE_TITLE_DISAGREES.translation);
  assert.doesNotMatch(r.translation, RETIRED);
});

test("R13 (C-64.1): GROUP_UNDETERMINED's translation is the word refusal.GROUP_UNDETERMINED", () => {
  const { p } = makePromotion({ group: null });
  const id = "INFO-2026-0001";
  const r = p.promote(create(id, infoDoc(id, { group: undefined })));
  assert.deepEqual([r.reason, r.check], ["GROUP_UNDETERMINED", "C-64.1"]);
  assert.equal(r.translation, word("refusal.GROUP_UNDETERMINED"));
  assert.doesNotMatch(r.translation, RETIRED);
});

test("R40 (C-102.4, C-102.5): FACT_UNAVAILABLE and FACT_FAILED answer the words refusal.FACT_UNAVAILABLE and refusal.FACT_FAILED", () => {
  const { p } = makePromotion();
  const none = p.fact("nobodyProvides");
  assert.deepEqual([none.reason, none.check], ["FACT_UNAVAILABLE", "C-102.4"]);
  assert.equal(none.translation, word("refusal.FACT_UNAVAILABLE"));
  /* The act that needs an unprovided fact answers the same row. */
  const bare = makePromotion({ facts: false });
  assert.equal(bare.p.promote(create("INFO-2026-0001", infoDoc("INFO-2026-0001"))).translation, none.translation);
  p.registerFact("fragile", "later", () => { throw new Error("down"); });
  const failed = p.fact("fragile");
  assert.deepEqual([failed.reason, failed.check], ["FACT_FAILED", "C-102.5"]);
  assert.equal(failed.translation, word("refusal.FACT_FAILED"));
  for (const x of [none, failed]) assert.doesNotMatch(x.translation, RETIRED);
});

test("R40 (C-102.6): FACT_MALFORMED answers the word refusal.FACT_MALFORMED", () => {
  const { p } = makePromotion();
  const r = p.registerFact("", "later", () => 1);
  assert.deepEqual([r.reason, r.check], ["FACT_MALFORMED", "C-102.6"]);
  assert.equal(r.translation, word("refusal.FACT_MALFORMED"));
});

test("R39 (C-102.7): STEP_MODULE_UNNAMED answers the word refusal.STEP_MODULE_UNNAMED", () => {
  const { p } = makePromotion();
  const r = p.registerStep("", {});
  assert.deepEqual([r.reason, r.check], ["STEP_MODULE_UNNAMED", "C-102.7"]);
  assert.equal(r.translation, word("refusal.STEP_MODULE_UNNAMED"));
});

test("R39 (C-102.8): STEP_DECLARED answers the word refusal.STEP_DECLARED, at a step and at a fact", () => {
  const { p } = makePromotion();
  p.registerStep("later", {});
  for (const r of [p.registerStep("later", {}), p.registerFact("citedBy", "later", () => [])]) {
    assert.deepEqual([r.reason, r.check], ["STEP_DECLARED", "C-102.8"]);
    assert.equal(r.translation, word("refusal.STEP_DECLARED"));
  }
});

test("R19 (index.mjs NAME_TAKEN, #promote): NAME_TAKEN and NO_TITLE say a project's name is unique across your group's Civicsmith", () => {
  const { p } = makePromotion();
  assert.equal(p.promote(mk("Sewer Fund")).ok, true);
  const taken = p.promote(mk("  sewer   FUND "));
  assert.equal(taken.reason, "NAME_TAKEN");
  assert.equal(taken.detail, localize("promotion.index.project_name_taken", "a project by that name already exists in your team's Civicsmith, compared without regard to case or spacing. This holds for deactivated projects too, because their names are still cited."));
  const untitled = p.promote(mk("", { files: [{ path: "bundle.md", text: pd("") }] }));
  assert.deepEqual([untitled.reason, untitled.detail], ["NO_TITLE",
    localize("promotion.index.project_needs_name", "a project needs a name, and it must be unique across your team's Civicsmith")]);
  for (const x of [taken, untitled]) assert.doesNotMatch(x.detail, RETIRED);
});

test("R19 (index.mjs is-project-id-supplied, is-project-id-bytes): a project's creation is refused in words naming the record as what mints its id and writes it in, the field names kept", () => {
  const { p } = makePromotion();
  const supplied = p.promote({ ...mk("Sewer Fund"), bundleId: "PROJ-2026-0001-x" });
  assert.equal(supplied.reason, "PROJECT_ID_SUPPLIED");
  assert.equal(supplied.detail, localize("promotion.index.new_project_id_minted_by_record", "a new project's id is minted by the record and returned; send the creation with no bundleId. A creation in the PROJ- namespace names no id, whatever type it claims. Nothing was created."));
  const unreadable = p.promote({ ...mk("x"), files: [{ path: "bundle.md", text: "no fm" }], meta: { object_type: "project" } });
  assert.equal(unreadable.reason, "PROJECT_DOCUMENT_UNREADABLE");
  assert.equal(unreadable.detail, localize("promotion.index.new_project_document_unreadable", "the new project's bundle.md must arrive as inline text beginning with a --- front matter block, because the record writes the minted id into it. Nothing was created."));
  const inBytes = p.promote({ ...mk("x"), files: [{ path: "bundle.md", text: pd("x", { id: "PROJ-1" }) }] });
  assert.equal(inBytes.reason, "PROJECT_ID_IN_BYTES");
  assert.equal(inBytes.detail, localize("promotion.index.new_project_document_has_id", "the new project's bundle.md already carries a top-level id: line. The record writes the id it mints; remove the line and send it again. Nothing was created."));
  for (const x of [supplied, unreadable, inBytes]) assert.doesNotMatch(x.detail, RETIRED);
});

test("R41 (index.mjs is-project-fork-id-supplied): PROJECT_FORK_ID_SUPPLIED says a fork's id is minted by the record and returned as newId, the field name kept", () => {
  const { p } = makePromotion();
  const r = p.forkProject({ projectId: "PROJ-2026-0001-x", newId: "PROJ-2026-0002-y", title: "Fork", by: "bob" });
  assert.equal(r.reason, "PROJECT_FORK_ID_SUPPLIED");
  assert.equal(r.detail, localize("promotion.index.fork_id_minted_by_record", "a fork's id is minted by the record and returned as newId; send the fork with no newId. Nothing was forked."));
  assert.doesNotMatch(r.detail, RETIRED);
});

test("R38 (C-77.2): C-77.2's repair for an untitled project says give it a title unique across your group's Civicsmith", () => {
  const files = new Map([["bundle.md", pd("")]]);
  const r = checkProjectNameUniqueness([{ folderName: "PROJ-2026-0001-x", files }]);
  const w = r.findings.find((x) => x.check === "C-77.2");
  assert.ok(w, JSON.stringify(r.findings));
  assert.deepEqual(w.repairs, [localize("promotion.names.give_project_title_unique", "give the project a title unique across your team's Civicsmith")]);
});

test("R9, R13, R39, R40 (DEC-149): no row this module holds calls the group's own Civicsmith the instance, the plane, a server or a copy", () => {
  for (const table of [PROMOTION_CHECKS, PROMOTED_TYPE_CHECKS, PROJECT_CREATION_VISIBILITY_CHECKS, PROMOTION_ROW_CHECKS,
                       PROJECT_MINT_CHECKS, PROMOTION_REGISTRATION_CHECKS])
    for (const [code, row] of Object.entries(table)) assert.doesNotMatch(row.translation, RETIRED, code);
});

test("R11 (N1116): a revision that carries the head's type or fields forward says so in the words promotion.says.document_request_stated and promotion.says.document_request_stated_revision", () => {
  const { p } = makePromotion();
  const id = "INFO-2026-0001";
  const head = p.promote(create(id, infoDoc(id)));
  assert.equal(head.ok, true, JSON.stringify(head));
  const rev = p.promote({ bundleId: id, base: head.bundleSha, snapKey: "s-2", author: "member:ann", meta: {},
    files: [{ path: "bundle.md", text: doc({ id }) }] });
  assert.equal(rev.ok, true, JSON.stringify(rev));
  assert.equal(rev.type_carried.says, word("promotion.says.document_request_stated"));
  assert.equal(rev.fields_carried.says, word("promotion.says.document_request_stated_revision"));
  for (const x of [rev.type_carried.says, rev.fields_carried.says]) assert.doesNotMatch(x, /\bgroup\b/i);
});
