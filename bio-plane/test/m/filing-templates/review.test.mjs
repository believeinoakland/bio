/* filing-templates: review grants, reviews and comments (R8, R9, R13), at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, draft, approved, V, MACHINE, TEXT, sha, secret } from "./fixture.mjs";
import * as ft from "../../../src/filing-templates/index.mjs";
import { proposalLabel } from "../../../src/record-grammar/labels.mjs";

const A = V("alice"), B = V("bob"), F = V("frank");
const code = (r) => [r.ok, r.reason, r.code, r.check, r.translation];
const row = (c) => ft.FILING_TEMPLATE_CHECKS[c];
const refused = (r, c) => { assert.deepEqual(code(r), [false, c, c, row(c).check, row(c).translation], JSON.stringify(r).slice(0, 300)); return r; };
const grant = (w, version, s, x = {}) => w.ft.templateReviewGrant({ version, recipient: "Pat Lawyer", organisation: "Legal Aid (test)",
                                                                     secretSha: secret(s), by: A, viewer: A, ...x });

test("R8 templateReviewGrant: a participant opens a revocable door to one draft or in-review version, an opaque TRG- id, by a secret's SHA-256; the secret's value never enters", () => {
  const w = seeded();
  const d = draft(w);
  const g = grant(w, d.version, "one", { by: F, viewer: F });
  assert.equal(g.ok, true, JSON.stringify(g));
  assert.match(g.grant, /^TRG-2026-\d{4}$/);
  assert.deepEqual([g.version, g.recipient, g.organisation, g.by.id], [d.version, "Pat Lawyer", "Legal Aid (test)", "frank"]);
  assert.ok(!JSON.stringify(g).includes(secret("one")), "the digest is not answered back");
  /* through the door: read, comment, and once in review, review */
  const r = w.ft.templateRead({ secretSha: secret("one") });
  assert.deepEqual([r.ok, r.version.id, r.version.text], [true, d.version, TEXT]);
  assert.equal(w.ft.templateComment({ text: "Looks fine", secretSha: secret("one") }).ok, true);
  w.ft.templateSubmit({ version: d.version, reviewers: [], author: A, viewer: A });
  assert.equal(w.ft.templateReview({ outcome: "no_concerns", scope: "legal", secretSha: secret("one") }).ok, true);
});

test("R8 refusals in order: MACHINE_CANNOT_DRAFT_TEMPLATE, NO_SUCH_TEMPLATE, TEMPLATE_SCOPE_REFUSED, GRANT_RECIPIENT_REFUSED, GRANT_NO_SECRET; a version past review is not opened", () => {
  const w = seeded();
  const d = draft(w);
  refused(grant(w, "x@1", "a", { by: MACHINE }), "MACHINE_CANNOT_DRAFT_TEMPLATE");
  refused(grant(w, "x@1", "a"), "NO_SUCH_TEMPLATE");
  refused(grant(w, d.version, "a", { by: V("carol"), viewer: V("carol") }), "TEMPLATE_SCOPE_REFUSED");
  for (const recipient of ["", "a\nb", "x".repeat(201), null]) refused(grant(w, d.version, "a", { recipient }), "GRANT_RECIPIENT_REFUSED");
  refused(grant(w, d.version, "a", { organisation: "" }), "GRANT_RECIPIENT_REFUSED");
  for (const secretSha of ["", null, "ABC", secret("a").toUpperCase(), "z".repeat(64)]) refused(grant(w, d.version, "a", { secretSha }), "GRANT_NO_SECRET");
  assert.equal(grant(w, d.version, "a").ok, true);
  refused(grant(w, d.version, "a"), "GRANT_NO_SECRET", "a digest already held is no fresh secret");
  const a = approved(w, { name: "Done" });
  assert.equal(grant(w, a.version, "late").reason, "NOT_IN_REVIEW");
});

test("R8 revocation records the revoker and instant; a second answers existed: true with the first; every caller with a secret not live receives one byte-identical dead answer", () => {
  const w = seeded();
  const d = draft(w);
  const g = grant(w, d.version, "rv");
  const rv = (x) => w.ft.templateGrantRevoke({ grant: g.grant, by: B, viewer: B, ...x });
  refused(rv({ by: MACHINE }), "MACHINE_CANNOT_DRAFT_TEMPLATE");
  refused(rv({ grant: "TRG-2026-0000" }), "NO_SUCH_GRANT");
  refused(rv({ by: V("dave"), viewer: V("dave") }), "NO_SUCH_GRANT", "a grant on a template one may not see is absent");
  refused(rv({ by: V("carol"), viewer: V("carol") }), "TEMPLATE_SCOPE_REFUSED");
  w.clock.now = "2026-10-04T00:00:00Z";
  const first = rv({});
  assert.deepEqual([first.ok, first.existed, first.revoked], [true, false, { by: { id: "bob", name: "h_bob" }, at: "2026-10-04T00:00:00Z" }]);
  w.clock.now = "2026-10-05T00:00:00Z";
  assert.deepEqual(rv({ by: A, viewer: A }), { ok: true, grant: g.grant, existed: true, revoked: first.revoked });
  /* the dead answer: revoked, never issued, malformed, a version left review, a live one asked for another version */
  const dead = JSON.stringify(ft.noTemplateGrant());
  assert.equal(JSON.parse(dead).check, row("NO_TEMPLATE_GRANT").check);
  const g2 = grant(w, d.version, "live");
  const e = draft(w, { name: "Other" });
  const asks = [
    () => w.ft.templateRead({ secretSha: secret("rv") }),
    () => w.ft.templateRead({ secretSha: secret("never") }),
    () => w.ft.templateRead({ secretSha: "nope" }),
    () => w.ft.templateComments({ secretSha: secret("rv") }),
    () => w.ft.templateComment({ text: "x", secretSha: secret("rv") }),
    () => w.ft.templateReview({ outcome: "no_concerns", scope: "s", secretSha: secret("never") }),
    () => w.ft.templateRead({ version: e.version, secretSha: secret("live") }),
    () => w.ft.templateRead({ template: e.template, secretSha: secret("live") }),
    () => w.ft.templateComment({ template: e.template, version: e.version, text: "x", secretSha: secret("live") }),
  ];
  for (const ask of asks) assert.equal(JSON.stringify(ask()), dead);
  assert.equal(g2.ok, true);
  /* a version that left review closes its live grant */
  w.ft.templateSubmit({ version: d.version, reviewers: ["frank"], author: A, viewer: A });
  w.ft.templateReview({ outcome: "no_concerns", scope: "s", secretSha: secret("live") });
  assert.equal(w.ft.templateApprove({ version: d.version, by: B, viewer: B }).ok, true);
  assert.equal(JSON.stringify(w.ft.templateRead({ secretSha: secret("live") })), dead);
});

test("R9 templateReview records one review against the present sha: a member (with declared expertise shown) or a professional through a grant (recipient, organisation, credential as stated, never verified)", () => {
  const w = seeded();
  w.membership.expertiseDeclare({ memberId: "frank", label: "paralegal" });
  const d = draft(w);
  grant(w, d.version, "pro");
  w.ft.templateSubmit({ version: d.version, reviewers: ["frank"], author: A, viewer: A });
  const m = w.ft.templateReview({ version: d.version, outcome: "concerns", scope: "plain language", comment: "tone", author: F, viewer: F });
  assert.deepEqual([m.ok, m.review.kind, m.review.reviewer.id, m.review.reviewer.expertise, m.review.sha],
                   [true, "member", "frank", [{ label: "paralegal", confirmed: false }], sha(TEXT)]);
  const p = w.ft.templateReview({ outcome: "no_concerns", scope: "legal sufficiency", credential: "bar no. 123 (test)", secretSha: secret("pro") });
  assert.deepEqual([p.review.kind, p.review.reviewer.name, p.review.reviewer.organisation, p.review.reviewer.credential, p.review.reviewer.credential_says],
                   ["professional", "Pat Lawyer", "Legal Aid (test)", "bar no. 123 (test)", "as stated; never verified"]);
  const v = w.ft.templateRead({ version: d.version, template: d.template, viewer: A }).version;
  assert.deepEqual(v.reviews.map((r) => [r.kind, r.outcome, r.scope, r.stands]),
                   [["member", "concerns", "plain language", true], ["professional", "no_concerns", "legal sufficiency", true]]);
  assert.deepEqual(v.reviews_summary, { member: 1, professional: 1, no_concerns: 1, concerns: 1, changes_requested: 0 });
  /* a later review of the same sha stands in place of the earlier, which is kept */
  w.ft.templateReview({ version: d.version, outcome: "no_concerns", scope: "plain language", author: F, viewer: F });
  const v2 = w.ft.templateRead({ version: d.version, template: d.template, viewer: A }).version;
  assert.equal(v2.reviews.length, 3);
  assert.deepEqual(v2.reviews.map((r) => r.stands), [false, true, true]);
  assert.deepEqual(v2.reviews_summary, { member: 1, professional: 1, no_concerns: 2, concerns: 0, changes_requested: 0 });
  /* any member who may see the template reviews, asked or not */
  assert.equal(w.ft.templateReview({ version: d.version, outcome: "no_concerns", scope: "s", author: V("carol"), viewer: V("carol") }).ok, true);
});

test("R9 refusals in order: MACHINE_CANNOT_REVIEW_TEMPLATE, the dead answer or NO_SUCH_TEMPLATE, NOT_IN_REVIEW, REVIEW_REFUSED, REVIEW_STALE", () => {
  const w = seeded();
  const d = draft(w);
  const rv = (x) => w.ft.templateReview({ version: d.version, outcome: "no_concerns", scope: "all", author: F, viewer: F, ...x });
  for (const author of [MACHINE, "token:t", "", null]) refused(rv({ author, version: "x@1" }), "MACHINE_CANNOT_REVIEW_TEMPLATE");
  refused(rv({ version: "x@1", outcome: "bad" }), "NO_SUCH_TEMPLATE");
  refused(rv({ author: V("dave"), viewer: V("dave") }), "NO_SUCH_TEMPLATE");
  refused(rv({ outcome: "bad" }), "NOT_IN_REVIEW");
  refused(rv({ version: "TPL-test-records-request@1" }), "NOT_IN_REVIEW");
  w.ft.templateSubmit({ version: d.version, reviewers: ["frank"], author: A, viewer: A });
  for (const x of [{ outcome: "fine" }, { outcome: null }, { scope: "" }, { scope: "x".repeat(201) }, { scope: "a\nb" },
                   { comment: "x".repeat(4001) }]) refused(rv(x), "REVIEW_REFUSED");
  refused(rv({ outcome: "bad", sha: "0".repeat(64) }), "REVIEW_REFUSED", "REVIEW_REFUSED before REVIEW_STALE");
  const st = refused(rv({ sha: "0".repeat(64) }), "REVIEW_STALE");
  assert.equal(st.sha, sha(TEXT));
  assert.equal(rv({ sha: sha(TEXT), comment: "x".repeat(4000) }).ok, true);
  /* a grant's credential over 200 is refused */
  grant(w, d.version, "c");
  refused(w.ft.templateReview({ outcome: "no_concerns", scope: "s", credential: "x".repeat(201), secretSha: secret("c") }), "REVIEW_REFUSED");
});

test("R13 templateComment: 1–4,000 characters, naming its version, attributed to the member, the grant, or a labelled run; templateComments lists newest last, limit clamped to [1, 500], saying whether cut", () => {
  const w = seeded();
  const d = draft(w);
  grant(w, d.version, "c");
  const c = (x) => w.ft.templateComment({ template: d.template, version: d.version, text: "A comment", author: B, viewer: B, ...x });
  const m = c({});
  assert.deepEqual([m.ok, m.comment.version, m.comment.by], [true, d.version, { kind: "member", id: "bob", name: "h_bob" }]);
  const g = c({ author: null, viewer: null, secretSha: secret("c") });
  assert.deepEqual(g.comment.by, { kind: "grant", grant: g.comment.by.grant, name: "Pat Lawyer", organisation: "Legal Aid (test)" });
  const run = c({ author: MACHINE, viewer: MACHINE, version: "1" });
  assert.deepEqual(run.comment.by, { kind: "run", label: proposalLabel(MACHINE, "template") });
  for (const text of ["", "  ", "x".repeat(4001), null]) refused(c({ text }), "COMMENT_REFUSED");
  refused(c({ author: null }), "COMMENT_REFUSED");
  refused(c({ author: V("dave"), viewer: V("dave") }), "NO_SUCH_TEMPLATE");
  refused(c({ version: `${d.template}@9` }), "NO_SUCH_TEMPLATE");
  assert.equal(c({ text: "x".repeat(4000) }).ok, true);
  /* on a profile's template */
  assert.equal(w.ft.templateComment({ template: "TPL-test-records-request", version: 1, text: "ok", author: B, viewer: B }).ok, true);
  for (let i = 0; i < 3; i++) c({ text: `n${i}` });
  const all = w.ft.templateComments({ template: d.template, viewer: A });
  assert.deepEqual([all.comments.length, all.limit, all.truncated], [7, 500, false]);
  assert.deepEqual(all.comments.slice(-3).map((x) => x.text), ["n0", "n1", "n2"], "newest last");
  const cut = w.ft.templateComments({ template: d.template, limit: 2, viewer: A });
  assert.deepEqual([cut.comments.length, cut.truncated], [2, true]);
  for (const [limit, want] of [[0, 1], [-5, 1], [900, 500], ["x", 500], [null, 500]])
    assert.equal(w.ft.templateComments({ template: d.template, limit, viewer: A }).limit, want, String(limit));
  /* a grant's door reaches only its own version's comments */
  const two = w.ft.templateRetire({ template: d.template, version: d.version, reason: "r", by: A, viewer: A });
  assert.equal(two.ok, true);
  const v2 = w.ft.templateDraft({ template: d.template, text: "v2 {{group}}", author: A, viewer: A });
  w.ft.templateComment({ template: d.template, version: v2.version, text: "on v2", author: B, viewer: B });
  assert.equal(w.ft.templateComments({ template: d.template, viewer: A }).comments.length, 8);
  assert.equal(JSON.stringify(w.ft.templateComments({ secretSha: secret("c") })), JSON.stringify(ft.noTemplateGrant()),
               "its version was withdrawn, so its door is dead");
  const v2g = grant(w, v2.version, "v2");
  assert.equal(v2g.ok, true);
  const through = w.ft.templateComments({ secretSha: secret("v2") });
  assert.deepEqual(through.comments.map((x) => x.text), ["on v2"]);
});
