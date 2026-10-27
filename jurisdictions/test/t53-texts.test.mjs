/* jurisdictions, T53 (T53-11; N858; K5509-K5512, K5527, K5528): the text record of a profile. R40's `reviewed_text_sha`,
 * R125 a guide's attribution, R126 `attributionLacks` / `countedReview` / `textsLack`, R136 no file template for a court-filed
 * kind, R138 a named writer and a declared machine draft. Tested at the module's interface over the test profile. */
import test from "node:test";
import assert from "node:assert/strict";
import { get, validate, attributionLacks, countedReview, textsLack } from "../index.mjs";
import { canonicalJson, sha256HexSync } from "../../bio-plane/src/record-grammar/index.mjs";

const TEST = "test-port-ellery";
const hasError = (r, code, path) => r.errors.some((e) => e.code === code && (path === undefined || e.path === path));
const kindOf = (p, kind) => p.action_kinds.find((k) => k.kind === kind);

const review = (text, extra = {}) => ({ reviewer: "Dee Example", kind: "professional", organisation: "Marlow Commons Legal Society (test)",
  credential: "solicitor (test)", scope: "the whole text", outcome: "no_concerns", at: "2026-08-20", reviewed_text_sha: sha256HexSync(text), ...extra });
const text = "To the {{counterparty_role}}: under {{law}}, {{group}} asks for the records described below.";
const template = (extra = {}) => ({ id: "TPL-t53", version: 1, use: "file", text, notes: "", authored_by: "Ada Example", contributors: [],
  reviews: [review(text)], approved_by: "Cy Example", approved_at: "2026-09-01", basis: "TEST", sources: [{ citation: "P.E.B.L. § 1" }], ...extra });

test("R40 a review's reviewed_text_sha is optional in the shape: a well-formed hash loads, a short or upper-case one is VALUE_INVALID", () => {
  const withSha = (sha) => { const p = get(TEST); kindOf(p, "records_request").template.reviews[0].reviewed_text_sha = sha; return validate(p); };
  assert.deepEqual(withSha(sha256HexSync("x")).errors, []);
  assert.ok(hasError(withSha("abc123"), "VALUE_INVALID", "action_kinds[0].template.reviews[0].reviewed_text_sha"));
  assert.ok(hasError(withSha(sha256HexSync("x").toUpperCase()), "VALUE_INVALID", "action_kinds[0].template.reviews[0].reviewed_text_sha"));
  const none = get(TEST); delete kindOf(none, "records_request").template.reviews[0].reviewed_text_sha;
  assert.deepEqual(validate(none).errors, [], "control: a review without it loads");
});

test("R125 a profile guide carries the attribution a template does; the first missing field is GUIDE_UNATTRIBUTED; no opt-out", () => {
  const g = (fn) => { const p = get(TEST); fn(p.procedure_guides[0]); return validate(p); };
  assert.deepEqual(g(() => {}).errors, [], "the test profile's guide passes");
  for (const f of ["notes", "authored_by", "reviews", "approved_by", "approved_at"])
    assert.ok(hasError(g((x) => { delete x[f]; }), "GUIDE_UNATTRIBUTED", `procedure_guides[0].${f}`), f);
  assert.ok(hasError(g((x) => { x.approved_by = x.authored_by; }), "VALUE_INVALID", "procedure_guides[0].approved_by"));
  assert.ok(hasError(g((x) => { x.approved_at = "soon"; }), "VALUE_INVALID", "procedure_guides[0].approved_at"));
  assert.ok(hasError(g((x) => { x.basis = "M-12"; x.status = "researched"; }), "BASIS_INVALID", "procedure_guides[0].basis"), "a basis that is not a ruling");
  assert.deepEqual(g((x) => { x.status = "ruled"; x.basis = "K5528"; }).errors, [], "a ruling is a basis");
  for (const f of ["review_opt_out", "not_reviewed"])
    assert.ok(hasError(g((x) => { x[f] = true; }), "VALUE_INVALID", `procedure_guides[0].${f}`), f);
  assert.ok(hasError(g((x) => { x.reviews[0].reviewed_text_sha = "zz"; }), "VALUE_INVALID", "procedure_guides[0].reviews[0].reviewed_text_sha"));
});

test("R126 attributionLacks answers what a text lacks, in order; countedReview answers the latest counted review", () => {
  assert.deepEqual(attributionLacks(template()), []);
  assert.deepEqual(attributionLacks(template({ authored_by: "" })), ["writer"]);
  assert.deepEqual(attributionLacks(template({ authored_by: "claude", approved_by: "Cy Example" })), ["writer"], "a machine writer");
  assert.deepEqual(attributionLacks(template({ sources: [] })), ["sources"]);
  assert.deepEqual(attributionLacks(template({ sources: [{ citation: " " }] })), ["sources"]);
  assert.deepEqual(attributionLacks(template({ reviews: [] })), ["professional_review"]);
  assert.deepEqual(attributionLacks(template({ approved_by: "Ada Example" })), ["second_approval"]);
  assert.deepEqual(attributionLacks(template({ approved_by: "" })), ["second_approval"]);
  assert.deepEqual(attributionLacks(template({ authored_by: "", sources: [], reviews: [], approved_by: "" })), ["writer", "sources", "professional_review", "second_approval"]);
  /* each fault of a review: no organisation, no credential, the hash of other text, a machine reviewer, a member's review, concerns */
  for (const bad of [{ organisation: undefined }, { credential: undefined }, { reviewed_text_sha: sha256HexSync("other text") }, { reviewer: "claude" },
    { kind: "member" }, { outcome: "concerns" }, { reviewed_text_sha: undefined }, { at: "later" }])
    assert.deepEqual(attributionLacks(template({ reviews: [review(text, bad)] })), ["professional_review"], JSON.stringify(bad));
  /* a changed text loses its review until a new one is recorded */
  assert.deepEqual(attributionLacks(template({ text: `${text} (changed)` })), ["professional_review"]);
  assert.deepEqual(attributionLacks(template({ text: `${text} (changed)`, reviews: [review(text), review(`${text} (changed)`, { reviewer: "Eve Example", at: "2026-09-10" })] })), []);
  /* the later of two counted reviews */
  const two = template({ reviews: [review(text, { reviewer: "Eve Example", at: "2026-09-10" }), review(text, { at: "2026-08-01" })] });
  assert.deepEqual(countedReview(two), { reviewer: "Eve Example", organisation: "Marlow Commons Legal Society (test)", credential: "solicitor (test)", at: "2026-09-10" });
  assert.equal(countedReview(template({ reviews: [] })), null);
  /* a guide: sources are its items; the review is of its items in canonical JSON */
  const guide = get(TEST).procedure_guides[0];
  assert.deepEqual(attributionLacks(guide), []);
  assert.equal(guide.reviews[0].reviewed_text_sha, sha256HexSync(canonicalJson(guide.items)));
  assert.deepEqual(attributionLacks({ ...guide, items: guide.items.slice(1) }), ["professional_review"]);
  assert.deepEqual(attributionLacks({ ...guide, items: [] }), ["sources", "professional_review"]);
  /* never throws; control: a member review with no hash is unchanged */
  for (const x of [null, undefined, 3, "text", [], {}]) assert.ok(Array.isArray(attributionLacks(x)));
  assert.equal(countedReview(null), null);
  assert.deepEqual(attributionLacks(template({ reviews: [review(text, { kind: "member", reviewed_text_sha: undefined })] })), ["professional_review"]);
});

test("R126 textsLack lists, for a profile, every template and guide that lacks a part; an empty profile answers []", () => {
  assert.deepEqual(textsLack({}), []);
  assert.deepEqual(textsLack(null), []);
  const p = { action_kinds: [{ kind: "a", templates: [{ ...template(), purpose: "initial" }, { ...template({ authored_by: "" }), purpose: "follow_up" }] },
    { kind: "b", template: template({ reviews: [] }) }, { kind: "c", label: "no text" }],
  procedure_guides: [{ ...get(TEST).procedure_guides[0], approved_by: "" }] };
  assert.deepEqual(textsLack(p), [
    { kind: "a", purpose: "follow_up", lacks: ["writer"] },
    { kind: "b", purpose: "initial", lacks: ["professional_review"] },
    { kind: "bylaw_complaint", guide: true, lacks: ["second_approval"] }]);
  assert.ok(Array.isArray(textsLack(get(TEST))), "the test profile is printable, never failed on");
});

test("R136 a profile carries no file template for a court-filed kind, whatever its attribution; a brief may serve it", () => {
  const withKind = (k) => { const p = get(TEST); p.action_kinds.push(k); return validate(p); };
  const court = (tpl, tier = 2) => ({ kind: "petition", label: "petition", tier, venue: { name: "a court", how: "court", basis: "TEST" }, template: tpl, basis: "TEST" });
  assert.ok(hasError(withKind(court(template())), "TEMPLATE_COURT_PETITION", `action_kinds[${get(TEST).action_kinds.length}].template`), "fully attributed and professionally reviewed");
  assert.deepEqual(withKind(court(template({ use: "brief" }), 3)).errors, [], "a brief may serve a court kind");
  assert.deepEqual(withKind({ ...court(undefined), template: undefined, venue: { name: "a court", how: "court", basis: "TEST" } }).errors.filter((e) => e.code === "TEMPLATE_COURT_PETITION"), [], "the same kind without it");
  const email = court(template()); email.venue.how = "email";
  assert.deepEqual(withKind(email).errors, [], "control: not filed in a court");
});

test("R138 a text's writer is a named person; a machine may compose a declared first draft; a machine approver is refused", () => {
  const withT = (fn) => { const p = get(TEST); fn(kindOf(p, "records_request").template); return validate(p); };
  assert.ok(hasError(withT((t) => { t.authored_by = "claude"; }), "MACHINE_CANNOT_DRAFT_TEMPLATE", "action_kinds[0].template.authored_by"));
  assert.ok(hasError(withT((t) => { t.approved_by = "claude"; }), "MACHINE_CANNOT_APPROVE_TEMPLATE", "action_kinds[0].template.approved_by"));
  assert.deepEqual(withT((t) => { t.machine_draft = true; t.notes = "The first draft was composed by an AI."; }).errors, [], "a named writer and a declared draft");
  assert.ok(hasError(withT((t) => { t.machine_draft = true; t.notes = ""; }), "VALUE_INVALID", "action_kinds[0].template.notes"));
  assert.ok(hasError(withT((t) => { t.machine_draft = "yes"; }), "VALUE_INVALID", "action_kinds[0].template.machine_draft"));
  assert.deepEqual(withT((t) => { t.reviews[0].reviewer = "claude"; }).errors, [], "a machine reviewer loads and is not counted, never refused");
  assert.deepEqual(withT(() => {}).errors, [], "control: a person as writer and no machine_draft");
  const g = (fn) => { const p = get(TEST); fn(p.procedure_guides[0]); return validate(p); };
  assert.ok(hasError(g((x) => { x.authored_by = "claude"; }), "MACHINE_CANNOT_DRAFT_TEMPLATE", "procedure_guides[0].authored_by"));
  assert.ok(hasError(g((x) => { x.machine_draft = true; x.notes = ""; }), "VALUE_INVALID", "procedure_guides[0].notes"));
});
