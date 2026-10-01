/* filing-templates: revision, contributors, proposals, submission, approval, retirement and withdrawal, notes (R4, R5,
   R6, R7, R10, R11, R12), at the module's interface, under the test profile. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, draft, approved, V, MACHINE, TEST, TEXT, sha, secret } from "./fixture.mjs";
import * as ft from "../../../src/filing-templates/index.mjs";
import { proposalLabel } from "../../../src/record-grammar/labels.mjs";

const A = V("alice"), B = V("bob"), F = V("frank");
const code = (r) => [r.ok, r.reason, r.code, r.check, r.translation];
const row = (c) => ft.FILING_TEMPLATE_CHECKS[c];
const refused = (r, c) => { assert.deepEqual(code(r), [false, c, c, row(c).check, row(c).translation], JSON.stringify(r).slice(0, 300)); return r; };
const read = (w, version, viewer = A) => w.ft.templateRead({ version, template: version.split("@")[0], viewer }).version;
/* A bylaw complaint (Tier 1 in the test profile). */
const tier1 = (w, x = {}) => draft(w, { kind: "bylaw_complaint", name: "Complaint", text: "{{act}} breaches {{standards}}.", ...x });

test("R4 templateRevise replaces a draft's text by a new revision, every earlier revision kept with its author and time; sha is the latest's; adopt takes a proposal's text", () => {
  const w = seeded();
  const d = draft(w);
  w.clock.now = "2026-10-02T09:00:00Z";
  const r1 = w.ft.templateRevise({ version: d.version, text: "Rev {{group}}", author: B, viewer: B });
  assert.deepEqual([r1.ok, r1.sha, r1.revisions], [true, sha("Rev {{group}}"), 2]);
  const p = w.ft.templatePropose({ template: d.template, text: "Machine {{law}}", why: "shorter", proposer: MACHINE, viewer: MACHINE });
  const r2 = w.ft.templateRevise({ version: d.version, adopt: p.proposal.id, author: F, viewer: F });
  assert.deepEqual([r2.ok, r2.sha, r2.adopted], [true, sha("Machine {{law}}"), p.proposal.id]);
  const v = read(w, d.version);
  assert.equal(v.text, "Machine {{law}}");
  assert.equal(v.sha, sha("Machine {{law}}"));
  assert.deepEqual(v.revisions.map((x) => [x.sha, x.by.id, x.at, x.adopted ?? null]), [
    [sha(TEXT), "alice", "2026-10-01T12:00:00Z", null], [sha("Rev {{group}}"), "bob", "2026-10-02T09:00:00Z", null],
    [sha("Machine {{law}}"), "frank", "2026-10-02T09:00:00Z", p.proposal.id]]);
  /* text given wins over adopt */
  const r3 = w.ft.templateRevise({ version: d.version, text: "Own {{group}}", adopt: p.proposal.id, author: A, viewer: A });
  assert.equal(r3.sha, sha("Own {{group}}"));
});

test("R4 refusals in order: MACHINE_CANNOT_DRAFT_TEMPLATE, NO_SUCH_TEMPLATE, TEMPLATE_SCOPE_REFUSED, NOT_A_DRAFT, R2's text refusals, TEMPLATE_FROM_REFUSED", () => {
  const w = seeded();
  const d = draft(w);
  const rev = (x) => w.ft.templateRevise({ version: d.version, text: "New {{group}}", author: A, viewer: A, ...x });
  for (const author of [MACHINE, "", null]) refused(rev({ author, version: "TPL-2026-0000@1" }), "MACHINE_CANNOT_DRAFT_TEMPLATE");
  refused(rev({ version: "TPL-2026-0000@1" }), "NO_SUCH_TEMPLATE");
  refused(rev({ version: `${d.template}@7` }), "NO_SUCH_TEMPLATE");
  refused(rev({ author: V("dave"), viewer: V("dave") }), "NO_SUCH_TEMPLATE", "dave cannot see P's template: absent");
  refused(rev({ author: V("carol"), viewer: V("carol") }), "TEMPLATE_SCOPE_REFUSED", "carol sees it (invited) and is not joined");
  refused(rev({ version: "TPL-test-records-request@1" }), "TEMPLATE_SCOPE_REFUSED");
  refused(rev({ text: "" }), "TEMPLATE_TEXT_REFUSED");
  refused(rev({ text: "{{nope}}" }), "TEMPLATE_BLANK_UNKNOWN");
  refused(rev({ text: undefined, adopt: "TPP-2026-0000" }), "TEMPLATE_TEXT_REFUSED", "no text and no proposal to adopt");
  refused(rev({ adopt: "TPP-2026-0000" }), "TEMPLATE_FROM_REFUSED");
  w.ft.templateSubmit({ version: d.version, reviewers: ["bob"], author: A, viewer: A });
  refused(rev({ text: "" }), "NOT_A_DRAFT", "NOT_A_DRAFT before the text's refusals");
});

test("R5 contributors lists, in time order, every member who revised and every adopted proposal's run (run, model, skill pack version, proposal id), each dated; written by R3, R4 and adoption alone", () => {
  const w = seeded();
  const p0 = w.ft.templatePropose({ kind: "records_request", text: "P0 {{group}}", why: "start", proposer: MACHINE, viewer: MACHINE,
                                    run: "RUN-1", model: "model-x", skill_pack: "drafting@3" });
  const d = draft(w, { text: undefined, from: p0.proposal.id });
  w.clock.now = "2026-10-03T00:00:00Z";
  w.ft.templateRevise({ version: d.version, text: "B {{group}}", author: B, viewer: B });
  w.ft.templateRevise({ version: d.version, text: "A again {{group}}", author: A, viewer: A });
  const p1 = w.ft.templatePropose({ template: d.template, text: "P1 {{law}}", why: "w", proposer: MACHINE, viewer: MACHINE, run: "RUN-2" });
  w.ft.templateRevise({ version: d.version, adopt: p1.proposal.id, author: F, viewer: F });
  /* comments, reviews and a proposal not adopted write no contributor */
  w.ft.templateComment({ template: d.template, version: d.version, text: "hm", author: V("carol"), viewer: V("carol") });
  w.ft.templatePropose({ template: d.template, text: "P2 {{law}}", why: "w", proposer: B, viewer: B });
  const c = read(w, d.version).contributors;
  assert.deepEqual(c.map((x) => [x.kind, x.member ?? x.proposal, x.at]), [
    ["member", "alice", "2026-10-01T12:00:00Z"], ["run", p0.proposal.id, "2026-10-01T12:00:00Z"],
    ["member", "bob", "2026-10-03T00:00:00Z"], ["member", "frank", "2026-10-03T00:00:00Z"], ["run", p1.proposal.id, "2026-10-03T00:00:00Z"]]);
  assert.deepEqual([c[1].run, c[1].model, c[1].skill_pack, c[1].label.machine_work], ["RUN-1", "model-x", "drafting@3", true]);
  assert.deepEqual([c[4].run, c[4].model, c[4].skill_pack], ["RUN-2", null, null]);
  assert.equal(c[0].name, "h_alice");
});

test("R6 templatePropose: any credential proposes, stored apart under an opaque TPP- id, labelled proposalLabel(proposer, \"template\"); it is no template's text until adopted", () => {
  const w = seeded();
  const d = draft(w);
  const before = read(w, d.version);
  for (const proposer of [MACHINE, B, "token:agent"]) {
    const p = w.ft.templatePropose({ template: d.template, text: "Prop {{group}}", why: "clearer", proposer, viewer: proposer === B ? B : MACHINE });
    assert.equal(p.ok, true, JSON.stringify(p));
    assert.match(p.proposal.id, /^TPP-2026-\d{4}$/);
    assert.deepEqual(p.proposal.label, proposalLabel(proposer, "template"));
    assert.equal(p.proposal.sha, sha("Prop {{group}}"));
  }
  assert.deepEqual(read(w, d.version), before, "the version is untouched by a proposal");
  const k = w.ft.templatePropose({ kind: "bylaw_complaint", text: "For a kind {{act}}", why: "new", proposer: MACHINE, viewer: MACHINE });
  assert.deepEqual([k.proposal.template, k.proposal.kind], [null, "bylaw_complaint"]);
  /* listed as open proposals (R14's `proposed`), and gone from that list once adopted */
  const open = () => w.ft.templatesFor({ state: "proposed", viewer: A }).proposals.map((x) => x.id);
  assert.equal(open().length, 4);
  w.ft.templateRevise({ version: d.version, adopt: open()[3], author: A, viewer: A });
  assert.equal(open().length, 3);
});

test("R6 refusals in order: TEMPLATE_NO_PROPOSER, NO_SUCH_TEMPLATE, TEMPLATE_KIND_REFUSED (for a kind), R2's text refusals, TEMPLATE_WHY_REFUSED", () => {
  const w = seeded();
  const d = draft(w);
  const pr = (x) => w.ft.templatePropose({ template: d.template, text: "Ok {{group}}", why: "why", proposer: MACHINE, viewer: MACHINE, ...x });
  for (const proposer of ["", null, "  "]) refused(pr({ proposer, template: "TPL-2026-0000" }), "TEMPLATE_NO_PROPOSER");
  refused(pr({ template: "TPL-2026-0000", text: "" }), "NO_SUCH_TEMPLATE");
  refused(pr({ proposer: V("dave"), viewer: V("dave") }), "NO_SUCH_TEMPLATE");
  for (const kind of [null, "Bad", ""]) refused(pr({ template: null, kind, text: "" }), "TEMPLATE_KIND_REFUSED");
  refused(pr({ text: "" }), "TEMPLATE_TEXT_REFUSED");
  refused(pr({ text: "{{mayor}}", why: "" }), "TEMPLATE_BLANK_UNKNOWN");
  for (const why of ["", "  ", "x".repeat(1001), null]) refused(pr({ why }), "TEMPLATE_WHY_REFUSED");
  assert.equal(pr({ why: "x".repeat(1000) }).ok, true);
});

test("R7 templateSubmit moves a draft to in_review, fixing its text and sha, recording the members asked; a live grant alone also suffices", () => {
  const w = seeded();
  const d = draft(w);
  const s = w.ft.templateSubmit({ version: d.version, reviewers: ["bob", "member:frank", "bob"], author: A, viewer: A });
  assert.equal(s.ok, true, JSON.stringify(s));
  assert.deepEqual([s.state, s.sha, s.reviewers.map((r) => r.member)], ["in_review", sha(TEXT), ["bob", "frank"]]);
  const v = read(w, d.version);
  assert.equal(v.state, "in_review");
  assert.deepEqual(v.reviewers.map((r) => [r.member, r.asked_by.id]), [["bob", "alice"], ["frank", "alice"]]);
  /* a grant and no member */
  const e = draft(w, { name: "Second" });
  w.ft.templateReviewGrant({ version: e.version, recipient: "R", organisation: "O", secretSha: secret("e"), by: A, viewer: A });
  const s2 = w.ft.templateSubmit({ version: e.version, reviewers: [], author: A, viewer: A });
  assert.deepEqual([s2.ok, s2.reviewers.length, s2.grants.length], [true, 0, 1]);
});

test("R7 refusals in order: MACHINE_CANNOT_DRAFT_TEMPLATE, NO_SUCH_TEMPLATE, TEMPLATE_SCOPE_REFUSED, NOT_A_DRAFT, REVIEWER_UNKNOWN (naming the first), NO_REVIEWERS", () => {
  const w = seeded();
  const d = draft(w);
  const sub = (x) => w.ft.templateSubmit({ version: d.version, reviewers: ["bob"], author: A, viewer: A, ...x });
  refused(sub({ author: MACHINE, version: "x@1" }), "MACHINE_CANNOT_DRAFT_TEMPLATE");
  refused(sub({ version: "x@1" }), "NO_SUCH_TEMPLATE");
  refused(sub({ author: V("carol"), viewer: V("carol") }), "TEMPLATE_SCOPE_REFUSED");
  const r = refused(sub({ reviewers: ["bob", "dave", "nobody"] }), "REVIEWER_UNKNOWN");
  assert.equal(r.reviewer, "member:dave", "dave cannot see the template: the first named");
  refused(sub({ reviewers: ["nobody"] }), "REVIEWER_UNKNOWN");
  w.member("gone", { status: "revoked" }); w.join(w.P, "gone");
  refused(sub({ reviewers: ["gone"] }), "REVIEWER_UNKNOWN");
  refused(sub({ reviewers: [] }), "NO_REVIEWERS");
  refused(sub({ reviewers: null }), "NO_REVIEWERS");
  /* a revoked grant is not live */
  const g = w.ft.templateReviewGrant({ version: d.version, recipient: "R", organisation: "O", secretSha: secret("x"), by: A, viewer: A });
  w.ft.templateGrantRevoke({ grant: g.grant, by: A, viewer: A });
  refused(sub({ reviewers: [] }), "NO_REVIEWERS");
  assert.equal(sub({}).ok, true);
  refused(sub({ reviewers: ["dave"] }), "NOT_A_DRAFT");
});

test("R10 a full lifecycle at Tier 1: one member review with no concerns; the approver an owner who is not the sole author; approval records approver, instant, tier, profiles", () => {
  const w = seeded();
  const d = tier1(w);
  w.ft.templateSubmit({ version: d.version, reviewers: ["frank"], author: A, viewer: A });
  const ap = () => w.ft.templateApprove({ version: d.version, by: B, viewer: B });
  refused(ap(), "REVIEWS_INSUFFICIENT");
  /* a professional review does not stand in for the member review at Tier 1 */
  w.ft.templateReviewGrant({ version: d.version, recipient: "R", organisation: "O", secretSha: secret("t1"), by: A, viewer: A });
  w.ft.templateReview({ version: d.version, outcome: "no_concerns", scope: "all", secretSha: secret("t1") });
  refused(ap(), "REVIEWS_INSUFFICIENT");
  w.ft.templateReview({ version: d.version, outcome: "no_concerns", scope: "plain language", author: F, viewer: F });
  w.clock.now = "2026-10-05T10:00:00Z";
  const a = ap();
  assert.equal(a.ok, true, JSON.stringify(a));
  assert.deepEqual([a.state, a.approved.by, a.approved.at, a.approved.tier, a.approved.profiles, a.approved.reason, a.updated],
                   ["approved", { id: "bob", name: "h_bob" }, "2026-10-05T10:00:00Z", 1, [TEST], null, null]);
  assert.deepEqual(read(w, d.version).approved.by, { id: "bob", name: "h_bob" });
});

test("R10 at Tier 2 a professional review, or in its place the approver's reason of 1–1,000 characters, shown wherever the version is", () => {
  const w = seeded();
  const d = draft(w);
  w.ft.templateSubmit({ version: d.version, reviewers: ["frank"], author: A, viewer: A });
  w.ft.templateReview({ version: d.version, outcome: "no_concerns", scope: "all", author: F, viewer: F });
  refused(w.ft.templateApprove({ version: d.version, by: B, viewer: B }), "REVIEWS_INSUFFICIENT");
  refused(w.ft.templateApprove({ version: d.version, reason: "x".repeat(1001), by: B, viewer: B }), "REVIEWS_INSUFFICIENT");
  const a = w.ft.templateApprove({ version: d.version, reason: "No lawyer available; plain request", by: B, viewer: B });
  assert.deepEqual([a.ok, a.approved.tier, a.approved.reason], [true, 2, "No lawyer available; plain request"]);
  assert.equal(read(w, d.version).approved.reason, "No lawyer available; plain request");
  const listed = w.ft.templatesFor({ viewer: A }).templates.find((t) => t.id === d.template).versions[0];
  assert.equal(listed.approved.reason, "No lawyer available; plain request");
  /* with a professional review, approved with no reason (the fixture's path) */
  const e = approved(w, { name: "Pro" });
  assert.equal(read(w, e.version).approved.reason, null);
  /* a brief on a Tier 3 kind needs the same */
  const br = draft(w, { kind: "commitment_claim", use: "brief", name: "Brief", text: "{{act}} {{findings}}" });
  w.ft.templateSubmit({ version: br.version, reviewers: ["frank"], author: A, viewer: A });
  w.ft.templateReview({ version: br.version, outcome: "no_concerns", scope: "all", author: F, viewer: F });
  const r3 = refused(w.ft.templateApprove({ version: br.version, by: B, viewer: B }), "REVIEWS_INSUFFICIENT");
  assert.deepEqual([r3.tier, r3.needs], [3, "professional"]);
});

test("R10 an undetermined tier needs a professional review or a reason; a standing changes_requested refuses; a later review of the same sha stands in place of the earlier", () => {
  const w = seeded({ profiles: [] });
  w.ft; /* no active profile: a general template's tier is undetermined */
  const d = draft(w, { profiles: "general" });
  w.ft.templateSubmit({ version: d.version, reviewers: ["frank"], author: A, viewer: A });
  w.ft.templateReview({ version: d.version, outcome: "changes_requested", scope: "all", author: F, viewer: F });
  const r = refused(w.ft.templateApprove({ version: d.version, reason: "fine", by: B, viewer: B }), "REVIEWS_INSUFFICIENT");
  assert.equal(r.tier, "undetermined");
  w.ft.templateReview({ version: d.version, outcome: "no_concerns", scope: "all", author: F, viewer: F });
  refused(w.ft.templateApprove({ version: d.version, by: B, viewer: B }), "REVIEWS_INSUFFICIENT");
  assert.equal(w.ft.templateApprove({ version: d.version, reason: "member read it", by: B, viewer: B }).ok, true);
  const reviews = read(w, d.version).reviews;
  assert.deepEqual(reviews.map((x) => [x.outcome, x.stands]), [["changes_requested", false], ["no_concerns", true]]);
});

test("R10 refusals in order: MACHINE_CANNOT_APPROVE_TEMPLATE, NO_SUCH_TEMPLATE, NOT_IN_REVIEW, NOT_AN_APPROVER, APPROVER_IS_AUTHOR (the sole author refused, a co-contributor's author accepted), REVIEWS_INSUFFICIENT", () => {
  const w = seeded();
  const d = draft(w);
  const ap = (x) => w.ft.templateApprove({ version: d.version, by: A, viewer: A, ...x });
  for (const by of [MACHINE, "token:t", "", null]) refused(ap({ by, version: "x@1" }), "MACHINE_CANNOT_APPROVE_TEMPLATE");
  refused(ap({ version: "x@1" }), "NO_SUCH_TEMPLATE");
  refused(ap({ by: V("dave"), viewer: V("dave") }), "NO_SUCH_TEMPLATE");
  refused(ap({}), "NOT_IN_REVIEW");
  refused(ap({ version: "TPL-test-records-request@1" }), "NOT_IN_REVIEW");
  w.ft.templateSubmit({ version: d.version, reviewers: ["frank"], author: A, viewer: A });
  refused(ap({ by: F, viewer: F }), "NOT_AN_APPROVER");
  refused(ap({ by: V("erin"), viewer: V("erin") }), "NOT_AN_APPROVER", "an administrator is not a project owner");
  refused(ap({}), "APPROVER_IS_AUTHOR");
  refused(ap({ by: B, viewer: B }), "REVIEWS_INSUFFICIENT", "bob, another owner, passes APPROVER_IS_AUTHOR");
  /* a co-contributor: alice approves her own version once bob revised it (a run's adoption does not count) */
  const e = draft(w, { name: "Co" });
  const p = w.ft.templatePropose({ template: e.template, text: "M {{group}}", why: "w", proposer: MACHINE, viewer: MACHINE });
  w.ft.templateRevise({ version: e.version, adopt: p.proposal.id, author: A, viewer: A });
  w.ft.templateSubmit({ version: e.version, reviewers: ["frank"], author: A, viewer: A });
  w.ft.templateReview({ version: e.version, outcome: "no_concerns", scope: "s", author: F, viewer: F });
  refused(w.ft.templateApprove({ version: e.version, reason: "r", by: A, viewer: A }), "APPROVER_IS_AUTHOR");
  const f = draft(w, { name: "Co2" });
  w.ft.templateRevise({ version: f.version, text: "By bob {{group}}", author: B, viewer: B });
  w.ft.templateSubmit({ version: f.version, reviewers: ["frank"], author: A, viewer: A });
  assert.equal(w.ft.templateApprove({ version: f.version, reason: "r", by: A, viewer: A }).ok, true);
});

test("R10 the earlier approved version becomes updated, naming its successor, and stays offered; widen makes a project template group-wide, by an administrator, changing no version", () => {
  const w = seeded();
  const a = approved(w);
  const two = w.ft.templateDraft({ template: a.template, text: "Two {{group}}", author: A, viewer: A });
  w.ft.templateSubmit({ version: two.version, reviewers: ["frank"], author: A, viewer: A });
  const r = w.ft.templateApprove({ version: two.version, reason: "same review standing", by: B, viewer: B });
  assert.deepEqual([r.ok, r.updated], [true, a.version]);
  assert.deepEqual([read(w, a.version).state, read(w, a.version).updated_by], ["updated", two.version]);
  const listed = w.ft.templatesFor({ viewer: A }).templates.find((t) => t.id === a.template);
  assert.deepEqual(listed.versions.map((v) => [v.id, v.state, v.default ?? false]), [[two.version, "approved", true], [a.version, "updated", false]]);
  /* widen */
  const before = [read(w, a.version), read(w, two.version)];
  assert.equal(w.ft.templatesFor({ viewer: V("dave") }).templates.some((t) => t.id === a.template), false, "dave cannot see P's template");
  const wd = (x) => w.ft.templateApprove({ version: two.version, widen: true, by: V("erin"), viewer: V("erin"), ...x });
  refused(wd({ by: B, viewer: B }), "NOT_AN_APPROVER", "an owner is not an administrator");
  const d3 = w.ft.templateDraft({ template: a.template, text: "Three {{group}}", author: A, viewer: A });
  refused(wd({ version: d3.version }), "TEMPLATE_NOT_APPROVED");
  refused(wd({ version: "x@1" }), "NO_SUCH_TEMPLATE");
  refused(wd({ by: MACHINE }), "MACHINE_CANNOT_APPROVE_TEMPLATE");
  w.clock.now = "2026-10-09T00:00:00Z";
  const ok = wd({});
  assert.deepEqual([ok.ok, ok.scope, ok.existed, ok.widened.by.id, ok.widened.at], [true, "group", false, "erin", "2026-10-09T00:00:00Z"]);
  assert.equal(wd({}).existed, true, "a second widening answers the first");
  assert.deepEqual([read(w, a.version), read(w, two.version)], before, "no version changed");
  assert.deepEqual(w.ft.templateRead({ template: a.template, viewer: V("dave") }).template.scope, "group");
  assert.equal(w.ft.templatesFor({ viewer: V("dave") }).templates.some((t) => t.id === a.template), true, "now every member sees it");
});

test("R11 retiring a whole template: by an approver of its scope, with a reason; none of its versions is offered, each stays readable with the reason, no new version is drafted; nothing deleted", () => {
  const w = seeded();
  const a = approved(w);
  const rt = (x) => w.ft.templateRetire({ template: a.template, reason: "law changed", by: A, viewer: A, ...x });
  refused(rt({ by: MACHINE }), "MACHINE_CANNOT_APPROVE_TEMPLATE");
  refused(rt({ template: "TPL-2026-0000" }), "NO_SUCH_TEMPLATE");
  refused(rt({ by: F, viewer: F }), "NOT_AN_APPROVER");
  refused(rt({ template: "TPL-test-records-request" }), "NOT_AN_APPROVER");
  for (const reason of ["", "x".repeat(501), null]) refused(rt({ reason }), "TEMPLATE_REASON_REFUSED");
  const rows = w.count("tpl_revisions");
  w.clock.now = "2026-10-07T00:00:00Z";
  const r = rt({});
  assert.deepEqual([r.ok, r.retired.reason, r.retired.by.id, r.retired.at], [true, "law changed", "alice", "2026-10-07T00:00:00Z"]);
  const again = refused(rt({ reason: "again" }), "TEMPLATE_ALREADY_ENDED");
  assert.equal(again.ended.reason, "law changed", "answered with the first ending");
  assert.equal(w.ft.templatesFor({ viewer: A }).templates.some((t) => t.id === a.template), false, "not offered");
  assert.equal(w.ft.offeredVersion({ template: a.template, viewer: A }).reason, "TEMPLATE_RETIRED");
  const v = read(w, a.version);
  assert.deepEqual([v.state, v.ended.ending, v.ended.reason, v.text], ["approved", "retired", "law changed", TEXT]);
  const listed = w.ft.templatesFor({ state: "retired", viewer: A }).templates.find((t) => t.id === a.template);
  assert.equal(listed.retired.reason, "law changed");
  assert.equal(w.count("tpl_revisions"), rows, "nothing deleted");
  /* a group-wide template is retired by an administrator */
  const b = approved(w, { name: "Wide" });
  w.ft.templateApprove({ version: b.version, widen: true, by: V("erin"), viewer: V("erin") });
  refused(w.ft.templateRetire({ template: b.template, reason: "r", by: A, viewer: A }), "NOT_AN_APPROVER");
  assert.equal(w.ft.templateRetire({ template: b.template, reason: "r", by: V("erin"), viewer: V("erin") }).ok, true);
});

test("R11 withdrawing a draft or in-review version: by its author, with a reason; an approved or updated version is never withdrawn alone", () => {
  const w = seeded();
  const d = draft(w);
  const wd = (x) => w.ft.templateRetire({ template: d.template, version: d.version, reason: "not ready", by: A, viewer: A, ...x });
  refused(wd({ by: B, viewer: B }), "TEMPLATE_SCOPE_REFUSED", "another owner is not its author");
  refused(wd({ version: `${d.template}@4` }), "NO_SUCH_TEMPLATE");
  refused(wd({ reason: "" }), "TEMPLATE_REASON_REFUSED");
  w.ft.templateSubmit({ version: d.version, reviewers: ["frank"], author: A, viewer: A });
  const r = wd({});
  assert.deepEqual([r.ok, r.state, r.withdrawn.reason], [true, "withdrawn", "not ready"]);
  assert.equal(read(w, d.version).ended.ending, "withdrawn");
  refused(wd({ reason: "twice" }), "TEMPLATE_ALREADY_ENDED");
  assert.deepEqual(w.ft.templatesFor({ state: "withdrawn", viewer: A }).templates.map((t) => t.id), [d.template]);
  /* the template is then free for a new draft */
  assert.equal(w.ft.templateDraft({ template: d.template, text: "again {{group}}", author: A, viewer: A }).ok, true);
  const a = approved(w, { name: "Approved" });
  refused(w.ft.templateRetire({ template: a.template, version: a.version, reason: "x", by: A, viewer: A }), "NOT_A_DRAFT");
});

test("R12 notes: at most 8,000 characters, each edit kept with author and time, edited through R3 and R4 while a draft; after that added as notes, never changed; a new version starts with its predecessor's, marked carried", () => {
  const w = seeded();
  const d = draft(w, { notes: "Use for first requests." });
  w.clock.now = "2026-10-02T00:00:00Z";
  w.ft.templateRevise({ version: d.version, notes: "Use for first requests only.", author: B, viewer: B });
  assert.equal(read(w, d.version).sha, sha(TEXT), "a notes edit is no revision of the text");
  refused(w.ft.templateRevise({ version: d.version, notes: "x".repeat(8001), author: A, viewer: A }), "TEMPLATE_NOTES_REFUSED");
  refused(w.ft.templateDraft({ project: w.P, kind: "records_request", use: "file",
    profiles: [TEST], name: "N", text: TEXT, notes: "x".repeat(8001), author: A, viewer: A }), "TEMPLATE_NOTES_REFUSED");
  assert.equal(w.ft.templateRevise({ version: d.version, notes: "x".repeat(8000), author: A, viewer: A }).ok, true);
  w.ft.templateRevise({ version: d.version, notes: "Use for first requests only.", author: A, viewer: A });
  let n = read(w, d.version).notes;
  assert.deepEqual(n.edits.map((e) => [e.by.id, e.at, e.carried]), [["alice", "2026-10-01T12:00:00Z", false],
    ["bob", "2026-10-02T00:00:00Z", false], ["alice", "2026-10-02T00:00:00Z", false], ["alice", "2026-10-02T00:00:00Z", false]]);
  assert.equal(n.text, "Use for first requests only.");
  /* a note on a draft is an edit, not an added note */
  refused(w.ft.templateComment({ template: d.template, version: d.version, text: "n", note: true, author: A, viewer: A }), "COMMENT_REFUSED");
  w.ft.templateSubmit({ version: d.version, reviewers: ["frank"], author: A, viewer: A });
  refused(w.ft.templateRevise({ version: d.version, notes: "changed", author: A, viewer: A }), "NOT_A_DRAFT");
  const added = w.ft.templateComment({ template: d.template, version: d.version, text: "Counsel prefers 'records'.", note: true, author: B, viewer: B });
  assert.equal(added.ok, true);
  refused(w.ft.templateComment({ template: d.template, version: d.version, text: "n", note: true, author: V("carol"), viewer: V("carol") }), "TEMPLATE_SCOPE_REFUSED");
  n = read(w, d.version).notes;
  assert.deepEqual([n.text, n.added.map((a) => [a.text, a.by.id])], ["Use for first requests only.", [["Counsel prefers 'records'.", "bob"]]]);
  /* the next version starts with the predecessor's notes, carried */
  w.ft.templateRetire({ template: d.template, version: d.version, reason: "redo", by: A, viewer: A });
  const two = w.ft.templateDraft({ template: d.template, text: "Two {{group}}", author: F, viewer: F });
  const n2 = read(w, two.version).notes;
  assert.deepEqual([n2.text, n2.carried, n2.edits.length, n2.edits[0].carried], ["Use for first requests only.", true, 1, true]);
  const three = w.ft.templateRetire({ template: d.template, version: two.version, reason: "r", by: F, viewer: F });
  assert.equal(three.ok, true);
  const v3 = w.ft.templateDraft({ template: d.template, text: "Three {{group}}", notes: "Fresh notes.", author: A, viewer: A });
  const n3 = read(w, v3.version).notes;
  assert.deepEqual([n3.text, n3.carried, n3.edits.map((e) => e.carried)], ["Fresh notes.", false, [true, false]]);
});
