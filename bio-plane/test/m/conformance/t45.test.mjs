/* T45-23 (N828, N883; Actions D5, D16, D16a, D23, D24; BIO_Action_v0_2.md §3, rules 1, 2, 3, 17, §6 `cures`): a
   determination rests on findings of three kinds, published, checked and held (R31) or accepted from another group
   (R32); it reads void while one no longer stands (R33), moves to the edition when its held check is published (R34),
   never adopts another group's determination (R35), and holds the link naming a later act as a breach's cure (R36,
   R37). Every test drives `conformance` at its interface over the real `case-check` and `accepted-work`, with the
   stand-ins ./fixture.mjs describes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scene, V, MACHINE, F, DOC } from "./fixture.mjs";
import { Conformance, CONFORMANCE_CHECKS, FINDING_KINDS, ADOPTION_KEYS, ACCEPTED_SAYS, SOURCE_FACTS_UNRECORDED, VOID_SAYS,
         REASON_MAX, determinationVoided, noSuchDetermination, determinationSuperseded } from "../../../src/conformance/index.mjs";
import { ACCEPTED_WORK_CHECKS } from "../../../src/accepted-work/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { caseCheckOfNoSuchCase } from "../case-check/fixtures.mjs";

const refused = (r, code) => {
  assert.equal(r.ok, false, `expected ${code}, got ${JSON.stringify(r).slice(0, 300)}`);
  assert.equal(r.reason, code, JSON.stringify(r).slice(0, 300));
  const row = CONFORMANCE_CHECKS[code] || ACCEPTED_WORK_CHECKS[code];
  if (row) assert.deepEqual([r.code, r.check, r.translation], [code, row.check, row.translation]);
};
const nothing = (w, fn) => { const before = w.snapshot(); const r = fn(); assert.deepEqual(w.snapshot(), before, "nothing written"); return r; };
const IMP = "a".repeat(64);
const H = "INQ-2026-0201-held";

/* The scene, with a finding of the project checked for publication and held unsigned (case CASE-2026-0101, edition 1). */
function heldScene() {
  const s = scene();
  s.w.inquiry(H, { legs: [{ target: DOC }] });
  const check = s.w.hold(H, s.proj);
  return { ...s, check };
}

test("R2 R31 R14: a finding checked for publication and held unsigned by the project is pinned with its check (basis checked_held); its check voided before determine is FINDING_NOT_PUBLISHED, naming the three kinds; another project's held check is not one", () => {
  const { w, proj, check, input } = heldScene();
  assert.deepEqual(FINDING_KINDS, ["published", "checked_held", "accepted"]);
  const d = w.c.determine(input({ findings: [H] }));
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 400));
  const [f] = d.findings;
  assert.deepEqual([f.finding, f.case, f.edition, f.version_sha, f.frozen], [H, "CASE-2026-0101", 1, w.head(H), null]);
  assert.deepEqual(f.basis, { kind: "checked_held", case: "CASE-2026-0101", edition: 1, check: check.check, checked_at: check.checked_at });
  assert.equal("void" in d, false, "a check still held: no void key");
  /* R14: it rests on a finding of one of the three kinds */
  assert.deepEqual(w.rows(`SELECT basis, check_id FROM determination_findings WHERE determination_id=?`, d.id),
                   [{ basis: "checked_held", check_id: check.check }]);
  /* another project's held check is no finding of this project */
  const libs = w.project("Libraries", "olive");
  const L = "INQ-2026-0202-libs";
  w.inquiry(L, { legs: [{ target: DOC }] });
  w.hold(L, libs, { caseId: "CASE-2026-0102" });
  const other = nothing(w, () => w.c.determine(input({ findings: [L] })));
  refused(other, "FINDING_NOT_PUBLISHED");
  assert.deepEqual(other.kinds, FINDING_KINDS);
  assert.match(other.detail, /checked for publication and held/);
  assert.match(CONFORMANCE_CHECKS.FINDING_NOT_PUBLISHED.translation, /three kinds/);
  assert.equal(CONFORMANCE_CHECKS.FINDING_NOT_PUBLISHED.check, "C-113.7");
  /* the control: the check voided before determine (a source lapsed) refuses the same finding */
  w.lapse.sources = [{ source: "lapsed" }];
  assert.equal(w.caseCheck.caseCheckOf({ check: check.check }).state, "void");
  refused(nothing(w, () => w.c.determine(input({ findings: [H] }))), "FINDING_NOT_PUBLISHED");
  w.lapse.sources = [];
  assert.equal(w.c.determine(input({ findings: [H] })).ok, true);
  /* R14: every determination recorded rests on findings of the three kinds and a standard */
  for (const r of w.rows(`SELECT determination_id FROM determinations`)) {
    const kinds = w.rows(`SELECT basis FROM determination_findings WHERE determination_id=?`, r.determination_id).map((x) => x.basis);
    assert.ok(kinds.length && kinds.every((k) => FINDING_KINDS.includes(k)), JSON.stringify(kinds));
    assert.ok(w.row(`SELECT COUNT(*) AS n FROM determination_standards WHERE determination_id=?`, r.determination_id).n >= 1);
  }
  /* R2: published still pins first (the scene's finding) */
  assert.equal(w.c.determine(input()).findings[0].basis.kind, "published");
  assert.equal(proj, d.project);
});

test("R2 R32 R9: another group's finding accepted at the edition named is pinned with the ref, group, case, edition and acceptance; its pair is the source edition's; the read labels it another group's, identity and stake undetermined until case-import records them (K2832)", () => {
  const { w, input } = scene();
  const ref = w.accept(IMP, "INQ-2026-0001-theirs", { edition: 3 });
  const d = w.c.determine(input({ findings: [{ ref, edition: 3 }] }));
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 400));
  const [f] = d.findings;
  assert.deepEqual([f.finding, f.case, f.edition], [ref, "CASE-2026-0900", 3]);
  assert.deepEqual(f.basis, { kind: "accepted", group: "Hayward Parents", case: "CASE-2026-0900", edition: 3, edition_date: null,
    accepted_at: "2026-09-20T00:00:00Z", accepted_by: "olive", identity: null, stake: "undetermined", matter_stake: "undetermined",
    identity_says: SOURCE_FACTS_UNRECORDED, says: ACCEPTED_SAYS });
  const pair = { capture: { state: "graded", grade: "B" }, connection: { state: "graded", grade: "C" }, testimony: null };
  assert.deepEqual([f.frozen, f.live], [pair, pair], "the source edition's pair, never raised");
  /* recorded at import, the source's identity and stake are read from case-import's group_fields (R39) */
  w.imports.editions.set(`${IMP}|3`, { group_fields: { group: "hayward-parents", name: "Hayward Parents for Accountability",
    domain: "haywardparents.org", domain_verified_at: "2026-09-01T00:00:00Z", stake: "parents of pupils", detail: null,
    read_at: "2026-09-19T00:00:00Z" } });
  const b = w.c.determinationRead({ id: d.id, viewer: V("pat") }).findings[0].basis;
  assert.deepEqual([b.identity.name, b.stake, b.edition_date, "identity_says" in b],
                   ["Hayward Parents for Accountability", "parents of pupils", null, false]);
  /* the same ref named by `finding`, as an id, reaches the same kind */
  assert.equal(w.c.determine(input({ findings: [{ finding: ref, edition: 3 }] })).ok, true);
});

test("R32: a ref not accepted at that edition is IMPORTED_NOT_ACCEPTED (C-21.4) and accepted work unreadable ACCEPTED_WORK_UNREADABLE (C-21.5), each accepted-work's row minted there; the acceptance withdrawn before determine is refused; each writes nothing", () => {
  const { w, input } = scene();
  const ref = w.accept(IMP, "INQ-2026-0001-theirs");
  const theirs = w.accept(IMP, "INQ-2026-0002-unaccepted", { accepted: false });
  for (const findings of [[{ ref: theirs, edition: 1 }], [{ ref, edition: 2 }], [{ ref }], [ref]]) {
    const r = nothing(w, () => w.c.determine(input({ findings })));
    refused(r, "IMPORTED_NOT_ACCEPTED");
    assert.equal(r.check, "C-21.4");
  }
  w.imports.fail = true;
  const u = nothing(w, () => w.c.determine(input({ findings: [{ ref, edition: 1 }] })));
  refused(u, "ACCEPTED_WORK_UNREADABLE");
  assert.equal(u.check, "C-21.5");
  w.imports.fail = false;
  assert.equal("IMPORTED_NOT_ACCEPTED" in CONFORMANCE_CHECKS, false, "never copied");
  /* the control, then the acceptance withdrawn before determine */
  assert.equal(w.c.determine(input({ findings: [{ ref, edition: 1 }] })).ok, true);
  w.imports.findings.get(`${ref}|1`).acceptance = null;
  refused(nothing(w, () => w.c.determine(input({ findings: [{ ref, edition: 1 }] }))), "IMPORTED_NOT_ACCEPTED");
});

test("R33 R9 R11: a determination whose held check is voided reads void, naming the finding and what happened; each outcome reads undetermined with the recorded one beside it; it stays live and is never edited; a check still held is the control", () => {
  const { w, std, input } = heldScene();
  const d = w.c.determine(input({ findings: [H] }));
  const control = w.c.determine(input());
  const text = w.text(d.id);
  w.lapse.sources = [{ source: "lapsed" }];
  const r = w.c.determinationRead({ id: d.id, viewer: V("pat") });
  assert.deepEqual(r.void.causes.map((c) => [c.finding, c.cause]), [[H, "check_void"]]);
  assert.deepEqual(r.void.causes[0].why, ["source_lapsed"]);
  assert.equal(r.void.says, VOID_SAYS);
  assert.deepEqual(r.outcomes, [{ standard: std, outcome: "undetermined", recorded_outcome: "noncompliant" }]);
  assert.deepEqual([r.standards[0].outcome, r.standards[0].recorded_outcome, r.live], ["undetermined", "noncompliant", true]);
  assert.equal(w.text(d.id), text, "never edited: nothing is written when it becomes void");
  /* the list answers the same, and filters by it */
  const items = w.c.determinationsFor({ viewer: V("pat") }).items;
  assert.deepEqual(items.find((i) => i.id === d.id).void, r.void);
  assert.deepEqual(items.find((i) => i.id === d.id).outcomes, r.outcomes);
  assert.deepEqual(w.c.determinationsFor({ void: true, viewer: V("pat") }).items.map((i) => i.id), [d.id]);
  assert.deepEqual(w.c.determinationsFor({ void: false, viewer: V("pat") }).items.map((i) => i.id), [control.id]);
  assert.deepEqual(w.op("determinations", { void: "true", viewer: V("pat") }).items.map((i) => i.id), [d.id]);
  /* the control: the published determination reads its recorded outcomes and no void key */
  const c = w.c.determinationRead({ id: control.id, viewer: V("pat") });
  assert.deepEqual(["void" in c, c.outcomes[0].outcome, "recorded_outcome" in c.outcomes[0]], [false, "noncompliant", false]);
  /* the state is derived on every read, as case-check answers it: a lapse undone before case-check latches it (its R2,
     N907) reads held again; a member moved latches (the next test's supersession is the way out) */
  w.lapse.sources = [];
  assert.equal("void" in w.c.determinationRead({ id: d.id, viewer: V("pat") }), false);
  w.inquiry(H, { legs: [{ target: DOC }], question: "Moved?" });
  assert.deepEqual(w.c.determinationRead({ id: d.id, viewer: V("pat") }).void.causes[0].why, ["member_moved"]);
});

test("R33: a check whose state cannot be determined voids the determination (cause check_undetermined), never reads not-void; a check still held reads no void (control)", () => {
  const { w, input } = scene();
  w.inquiry(H, { legs: [{ target: DOC }] });
  w.hold(H, input().project);
  const d = w.c.determine(input({ findings: [H] }));
  assert.equal("void" in w.c.determinationRead({ id: d.id, viewer: V("pat") }), false);
  w.lapse.fail = true;
  const r = w.c.determinationRead({ id: d.id, viewer: V("pat") });
  assert.deepEqual(r.void.causes.map((c) => c.cause), ["check_undetermined"]);
  w.lapse.fail = false;
  assert.equal("void" in w.c.determinationRead({ id: d.id, viewer: V("pat") }), false, "undone, it reads held again");
});

test("R33 R7: a void determination stops being void only when a member supersedes it with one resting on findings that stand", () => {
  const { w, input } = heldScene();
  const d = w.c.determine(input({ findings: [H] }));
  w.lapse.sources = [{ source: "lapsed" }];
  const next = w.c.determine(input({ supersedes: d.id, reason: "re-evaluated on the published finding", findings: [F] }));
  assert.equal(next.ok, true, JSON.stringify(next).slice(0, 300));
  assert.equal("void" in next, false);
  const old = w.c.determinationRead({ id: d.id, viewer: V("pat") });
  assert.deepEqual([old.live, "void" in old], [false, true]);
});

test("R33: an accepted finding's source withdrawing its edition (or all) after the determination voids it; a newer edition voids it unless accepted here; a move before the determination, or taken back, does not; a moves read that fails is unreadable", () => {
  const { w, std, input } = scene();
  const ref = w.accept(IMP, "INQ-2026-0001-theirs");
  const d = w.c.determine(input({ findings: [{ ref, edition: 1 }] }));
  const reads = () => w.c.determinationRead({ id: d.id, viewer: V("pat") });
  /* before the determination, another import, or taken back: nothing */
  w.move(IMP, { at: "2026-09-01T00:00:00Z" });
  w.move("b".repeat(64), { at: "2026-10-01T00:00:00Z" });
  w.move(IMP, { at: "2026-10-01T00:00:00Z", taken_back: { seq: 9, date: "2026-10-02" } });
  w.move(IMP, { kind: "withdrawal", edition: 2, at: "2026-10-01T00:00:00Z" });
  assert.equal("void" in reads(), false);
  /* a newer edition accepted here: still standing */
  w.accept(IMP, "INQ-2026-0001-theirs", { edition: 2 });
  w.move(IMP, { kind: "edition", edition: 2, at: "2026-10-01T00:00:00Z" });
  assert.equal("void" in reads(), false);
  /* a newer edition not accepted */
  w.move(IMP, { kind: "edition", edition: 3, at: "2026-10-02T00:00:00Z", date: "2026-10-02" });
  assert.deepEqual(reads().void.causes.map((c) => [c.finding, c.cause, c.edition, c.date]), [[ref, "source_revised", 3, "2026-10-02"]]);
  /* a withdrawal of all */
  w.move(IMP, { kind: "withdrawal", edition: "all", at: "2026-10-03T00:00:00Z", date: "2026-10-03" });
  assert.deepEqual(reads().void.causes.map((c) => c.cause), ["source_revised", "source_withdrawn"]);
  assert.deepEqual(reads().outcomes, [{ standard: std, outcome: "undetermined", recorded_outcome: "noncompliant" }]);
  /* unreadable: void, never not-void */
  w.imports.moves.length = 0;
  w.imports.fail = true;
  assert.deepEqual(reads().void.causes.map((c) => c.cause), ["unreadable"]);
  w.imports.fail = false;
  assert.equal("void" in reads(), false, "the control: no move");
  w.move(IMP, { kind: "withdrawal", edition: 1, at: "2026-10-04T00:00:00Z" });
  assert.deepEqual(reads().void.causes.map((c) => c.cause), ["source_withdrawn"]);
});

test("R33: determinationVoided is the one answer to a void determination: R19's form with causes, its row C-113.37 naming this function; extra never replaces a fixed field; it writes nothing and never throws", () => {
  const causes = [{ finding: F, cause: "check_void", date: null }];
  const r = determinationVoided("CONF-2026-0001-determination", causes);
  const row = CONFORMANCE_CHECKS.DETERMINATION_VOID;
  assert.deepEqual(Object.keys(r).sort(), ["causes", "check", "code", "detail", "determination", "ok", "reason", "translation"]);
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.determination, r.causes],
    [false, "DETERMINATION_VOID", "DETERMINATION_VOID", "C-113.37", row.translation, "CONF-2026-0001-determination", causes]);
  assert.match(row.where, /^src\/conformance\/index\.mjs determinationVoided > /);
  assert.deepEqual(determinationVoided("x", causes, { action: "A-1", causes: [], detail: "mine", ok: true }),
                   { ...determinationVoided("x", causes), action: "A-1" });
  for (const bad of [undefined, null, 42, "s", {}, new Proxy({}, { ownKeys() { throw new Error("boom"); } })])
    assert.doesNotThrow(() => determinationVoided(bad, bad, bad));
  assert.deepEqual(determinationVoided(null, "not a list").causes, []);
  assert.equal(determinationVoided("a").detail, determinationVoided("b", causes).detail, "one fixed sentence");
});

test("R34 R2 R14: when the held check's edition is published holding the pinned version, every read answers the finding published with from_check beside it, nothing rewritten; published without that version it stays checked_held and reads void", () => {
  const { w, proj, check, input } = heldScene();
  const d = w.c.determine(input({ findings: [H] }));
  const stored = w.rows(`SELECT * FROM determination_findings WHERE determination_id=?`, d.id);
  w.publish(H, proj, { caseId: "CASE-2026-0101", edition: 1 });
  assert.equal(w.caseCheck.caseCheckOf({ check: check.check }).state, "published");
  const [f] = w.c.determinationRead({ id: d.id, viewer: V("pat") }).findings;
  assert.deepEqual(f.basis, { kind: "published", case: "CASE-2026-0101", edition: 1,
                              from_check: { check: check.check, checked_at: check.checked_at } });
  assert.deepEqual(f.frozen.capture, { state: "graded", grade: "B" }, "the published edition's frozen pair");
  assert.equal("void" in w.c.determinationRead({ id: d.id, viewer: V("pat") }), false);
  assert.deepEqual(w.rows(`SELECT * FROM determination_findings WHERE determination_id=?`, d.id), stored, "nothing rewritten");
  /* the control: a version that differs in the published edition stays checked_held and reads void */
  const s2 = heldScene();
  const d2 = s2.w.c.determine(s2.input({ findings: [H] }));
  s2.w.inquiry(H, { legs: [{ target: DOC }], question: "Revised?" });
  s2.w.publish(H, s2.proj, { caseId: "CASE-2026-0101", edition: 1 });
  const r2 = s2.w.c.determinationRead({ id: d2.id, viewer: V("pat") });
  assert.equal(r2.findings[0].basis.kind, "checked_held");
  assert.deepEqual(r2.void.causes.map((c) => c.cause), ["published_version_differs"]);
});

test("R35: a determination naming another group's determination (adopts, imported_determination, source_determination, or an imported supersedes) is DETERMINATION_NOT_ADOPTABLE (C-113.38), writing nothing; the same call without it lands", () => {
  const { w, input } = scene();
  assert.deepEqual(ADOPTION_KEYS, ["adopts", "imported_determination", "source_determination"]);
  for (const key of ADOPTION_KEYS) {
    const r = nothing(w, () => w.c.determine(input({ [key]: "imported:" + IMP + "/CONF-2026-0001-determination" })));
    refused(r, "DETERMINATION_NOT_ADOPTABLE");
    assert.deepEqual(r.keys, [key]);
  }
  refused(nothing(w, () => w.c.determine(input({ supersedes: `imported:${IMP}/CONF-2026-0001-determination`, reason: "r" }))),
          "DETERMINATION_NOT_ADOPTABLE");
  assert.equal(CONFORMANCE_CHECKS.DETERMINATION_NOT_ADOPTABLE.check, "C-113.38");
  /* asked after the member, project and participant: a machine is still refused first */
  refused(w.c.determine(input({ author: MACHINE, adopts: "x" })), "MACHINE_CANNOT_DETERMINE");
  assert.equal(w.c.determine(input()).ok, true, "the control");
});

/* A cure scene: the scene's noncompliant determination of the office's act on 2026-03-02, and a later act of the same
   office (2026-04-01) a member determined compliant against the same standard. */
function cureScene() {
  const s = scene();
  const { w, std, ev, input } = s;
  const target = w.c.determine(input());
  const later = w.event(ev, { date: "2026-04-01" });
  const compliant = (over = {}) => input({ act: { ...input().act, event: later }, standards: [{ standard: std, outcome: "compliant" }],
                                           rows: [{ ...input().rows[0], reading: "aligns" }], ...over });
  const cure = w.c.determine(compliant());
  assert.deepEqual([target.ok, cure.ok], [true, true], JSON.stringify(cure).slice(0, 300));
  const link = (over = {}) => ({ determination: target.id, standard: std, cure: cure.id, author: V("olive"), viewer: V("olive"), ...over });
  return { ...s, target, cure, later, compliant, link };
}

test("R36: cureLink's refusals in order, each writing nothing: a machine, either determination absent or unseen, the author not joined, either superseded, either void; then the target not noncompliant, the cure not compliant, another office, not later, a link standing", () => {
  const { w, proj, std, ev, input, target, cure, compliant, link } = cureScene();
  for (const author of [MACHINE, "", null]) refused(nothing(w, () => w.c.cureLink(link({ author }))), "MACHINE_CANNOT_LINK_CURE");
  assert.deepEqual(nothing(w, () => w.c.cureLink(link({ determination: "CONF-2026-0099-determination" }))),
                   noSuchDetermination("CONF-2026-0099-determination"));
  refused(nothing(w, () => w.c.cureLink(link({ cure: "CONF-2026-0099-determination" }))), "NO_SUCH_DETERMINATION");
  refused(nothing(w, () => w.c.cureLink(link({ author: V("quinn"), viewer: V("quinn") }))), "NO_SUCH_DETERMINATION");
  w.membership.projectInvite({ projectId: proj, handle: "h_sam", by: "olive", viewer: V("olive") });
  refused(nothing(w, () => w.c.cureLink(link({ author: V("sam"), viewer: V("sam") }))), "DETERMINATION_NOT_A_PARTICIPANT");
  /* superseded, either */
  const t2 = w.c.determine(input());
  const t3 = w.c.determine(input({ supersedes: t2.id, reason: "restated" }));
  assert.deepEqual(nothing(w, () => w.c.cureLink(link({ determination: t2.id }))), determinationSuperseded(t2.id, t3.id));
  const c2 = w.c.determine(compliant());
  const c3 = w.c.determine(compliant({ supersedes: c2.id, reason: "restated" }));
  refused(nothing(w, () => w.c.cureLink(link({ cure: c2.id }))), "DETERMINATION_SUPERSEDED");
  /* void, either */
  w.inquiry(H, { legs: [{ target: DOC }] });
  w.hold(H, proj);
  const heldTarget = w.c.determine(input({ findings: [H] }));
  const heldCure = w.c.determine(compliant({ findings: [H] }));
  w.lapse.sources = [{ source: "lapsed" }];
  for (const over of [{ determination: heldTarget.id }, { cure: heldCure.id }]) {
    const r = nothing(w, () => w.c.cureLink(link(over)));
    refused(r, "DETERMINATION_VOID");
    assert.deepEqual(r, determinationVoided(r.determination, r.causes));
  }
  w.lapse.sources = [];
  /* the target not noncompliant (compliant, or not naming the standard) */
  refused(nothing(w, () => w.c.cureLink(link({ determination: c3.id }))), "CURE_TARGET_NOT_NONCOMPLIANT");
  refused(nothing(w, () => w.c.cureLink(link({ standard: "STD-2026-0099-none" }))), "CURE_TARGET_NOT_NONCOMPLIANT");
  /* the cure not compliant against that standard */
  const nc = w.c.determine(input({ act: { ...input().act, event: cure.act.event } }));
  refused(nothing(w, () => w.c.cureLink(link({ cure: nc.id }))), "CURE_NOT_COMPLIANT");
  /* another office's act */
  const clerk = w.c.determine(compliant({ act: { ...input().act, event: cure.act.event, actor: { role: "City Clerk", body: "Office of the Clerk" } } }));
  assert.equal(clerk.ok, true, JSON.stringify(clerk).slice(0, 300));
  refused(nothing(w, () => w.c.cureLink(link({ cure: clerk.id }))), "CURE_OTHER_OFFICE");
  /* not later: the same day, and an act placed nowhere (undetermined, said so) */
  const same = w.c.determine(compliant({ act: { ...input().act, event: w.event(ev, { date: "2026-03-02" }) } }));
  const r = nothing(w, () => w.c.cureLink(link({ cure: same.id })));
  refused(r, "CURE_NOT_LATER");
  assert.equal(r.order, "not_later");
  const nowhere = w.c.determine(compliant({ act: { ...input().act, event: w.event(ev, { date: null }) } }));
  assert.equal(nowhere.ok, true, JSON.stringify(nowhere).slice(0, 300));
  const u = nothing(w, () => w.c.cureLink(link({ cure: nowhere.id })));
  refused(u, "CURE_NOT_LATER");
  assert.deepEqual([u.order, /undetermined/.test(u.detail)], ["undetermined", true]);
  /* the control lands; a second is CURE_LINKED */
  const ok = w.c.cureLink(link({ reason: "the department posted notice and reopened" }));
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  const twice = nothing(w, () => w.c.cureLink(link()));
  refused(twice, "CURE_LINKED");
  assert.equal(twice.link, ok.link);
  /* a reason given that is not text or too long is R7's malformed code */
  refused(nothing(w, () => w.c.cureLink(link({ determination: t3.id, reason: "x".repeat(REASON_MAX + 1) }))), "CONFORMANCE_BAD_REASON");
  for (const [code, n] of [["MACHINE_CANNOT_LINK_CURE", 39], ["CURE_TARGET_NOT_NONCOMPLIANT", 40], ["CURE_NOT_COMPLIANT", 41],
                           ["CURE_OTHER_OFFICE", 42], ["CURE_NOT_LATER", 43], ["CURE_LINKED", 44]])
    assert.equal(CONFORMANCE_CHECKS[code].check, `C-113.${n}`);
  assert.equal(target.ok && std.length > 0, true);
});

test("R36 R37 R9: the link is appended and read per standard (cured_by, curesOf) and on the cure (cures); cureUnlink appends its ending with a reason, the link read apart, and a new link may then stand; a superseded cure answers cure_standing false with why", () => {
  const { w, std, target, cure, compliant, link } = cureScene();
  const l = w.c.cureLink(link());
  assert.equal(l.ok, true);
  const read = w.c.curesOf({ determination: target.id, viewer: V("pat") });
  assert.deepEqual(read.standards, [{ standard: std, link: { link: l.link, cure: cure.id, standard: std, by: V("olive"),
                                                                    at: l.standards[0].link.at, reason: null, cure_standing: true },
                                       ended: [] }]);
  const r = w.c.determinationRead({ id: target.id, viewer: V("pat") });
  assert.deepEqual(r.cured_by, read.standards);
  assert.deepEqual(w.c.determinationRead({ id: cure.id, viewer: V("pat") }).cures,
                   [{ link: l.link, determination: target.id, standard: std, by: V("olive"), at: read.standards[0].link.at }]);
  assert.deepEqual(w.c.curesOf({ determination: target.id, standard: std, viewer: V("pat") }).standards, read.standards);
  assert.deepEqual(w.c.curesOf({ determination: target.id, standard: "STD-2026-0099-none", viewer: V("pat") }).standards, []);
  /* the cure superseded: not standing, with why; nothing moves */
  w.c.determine(compliant({ supersedes: cure.id, reason: "restated" }));
  const after = w.c.curesOf({ determination: target.id, viewer: V("pat") }).standards[0].link;
  assert.deepEqual([after.link, after.cure_standing, after.cure_why], [l.link, false, word("conformance.curing_determination_superseded")]);
  /* unlink: R7's reason codes, a machine refused, an unknown link one answer */
  for (const reason of [undefined, "", "  "]) refused(nothing(w, () => w.c.cureUnlink({ link: l.link, reason, author: V("olive"), viewer: V("olive") })), "CONFORMANCE_NO_REASON");
  refused(nothing(w, () => w.c.cureUnlink({ link: l.link, reason: 7, author: V("olive"), viewer: V("olive") })), "CONFORMANCE_BAD_REASON");
  refused(nothing(w, () => w.c.cureUnlink({ link: l.link, reason: "r", author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_LINK_CURE");
  assert.deepEqual(nothing(w, () => w.c.cureUnlink({ link: "CURE-2026-0099", reason: "r", author: V("olive"), viewer: V("olive") })),
                   noSuchDetermination(null, { link: "CURE-2026-0099" }));
  refused(nothing(w, () => w.c.cureUnlink({ link: l.link, reason: "r", author: V("quinn"), viewer: V("quinn") })), "NO_SUCH_DETERMINATION");
  const end = w.c.cureUnlink({ link: l.link, reason: "the cure was restated", author: V("olive"), viewer: V("olive") });
  assert.deepEqual([end.ok, end.wrote, end.ended.reason], [true, true, "the cure was restated"]);
  const again = nothing(w, () => w.c.cureUnlink({ link: l.link, reason: "again", author: V("olive"), viewer: V("olive") }));
  assert.deepEqual([again.ok, again.wrote, again.ended.reason], [true, false, "the cure was restated"]);
  const ended = w.c.curesOf({ determination: target.id, viewer: V("pat") }).standards[0];
  assert.deepEqual([ended.link, ended.ended.map((x) => [x.link, x.ended.reason])], [null, [[l.link, "the cure was restated"]]]);
  assert.deepEqual(w.c.determinationRead({ id: cure.id, viewer: V("pat") }).cures, [], "an ended link is no cure");
  /* a new link may stand after the ending (the superseding cure) */
  const next = w.c.determinationsFor({ live: true, viewer: V("pat") }).items.find((i) => i.supersedes === cure.id);
  assert.equal(w.c.cureLink(link({ cure: next.id })).ok, true);
  /* the tables are append-only: the first link's row is as written */
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM determination_cures`).n, 2);
});

test("R37 R24: a cure the viewer may not see is withheld whole and the read states out_of_view: true; a viewer who sees it reads it (control)", () => {
  const { w, std, ev, input, target, link } = cureScene();
  /* a cure in a project pat has not joined: olive, joined in both, links it */
  const libs = w.project("Libraries", "olive");
  const L = "INQ-2026-0300-libs";
  w.inquiry(L, { legs: [{ target: DOC }] });
  w.publish(L, libs, { caseId: "CASE-2026-0103" });
  const cure = w.c.determine(input({ project: libs, findings: [L], act: { ...input().act, event: w.event(ev, { date: "2026-05-01" }) },
                                     standards: [{ standard: std, outcome: "compliant" }], rows: [{ ...input().rows[0], reading: "aligns" }] }));
  assert.equal(cure.ok, true, JSON.stringify(cure).slice(0, 300));
  assert.equal(w.c.cureLink(link({ cure: cure.id })).ok, true);
  const pat = w.c.curesOf({ determination: target.id, viewer: V("pat") });
  assert.deepEqual([pat.standards[0].link, pat.out_of_view], [null, true]);
  assert.equal(JSON.stringify(pat).includes(cure.id), false);
  const pr = w.c.determinationRead({ id: target.id, viewer: V("pat") });
  assert.deepEqual([pr.cured_by[0].link, pr.out_of_view], [null, true]);
  const olive = w.c.curesOf({ determination: target.id, viewer: V("olive") });
  assert.deepEqual([olive.standards[0].link.cure, "out_of_view" in olive], [cure.id, false]);
  refused(w.c.curesOf({ determination: target.id, viewer: V("quinn") }), "NO_SUCH_DETERMINATION");
});

test("R24 R31 R32: a pinned held check or accepted finding the viewer may not see is withheld whole, with out_of_view: true; a viewer who sees them reads them (control)", () => {
  const { w, input } = heldScene();
  const ref = w.accept(IMP, "INQ-2026-0001-theirs");
  const d = w.c.determine(input({ findings: [F, H, { ref, edition: 1 }] }));
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  w.imports.hiddenFrom = [V("pat")];
  /* case-check's real refusal to a viewer without standing, from its published fixture (K4990): the same bytes as an absent case */
  const noSuchCase = caseCheckOfNoSuchCase().refusal;
  const fenced = new Proxy(w.caseCheck, { get: (t, p) => (p === "caseCheckOf"
    ? (a) => (a.viewer === V("pat") ? noSuchCase : t.caseCheckOf(a))
    : typeof t[p] === "function" ? t[p].bind(t) : t[p]) });
  const c = new Conformance({ storage: w.st, record: w.record, membership: w.membership, promotion: w.promotion, host: w.host,
    content: w.content, inquiry: w.k, strength: w.strength, reevaluation: w.reevaluation, publication: w.publication,
    standards: w.standards, events: w.events, entities: w.entities, caseCheck: fenced, acceptedWork: w.acceptedWork,
    caseImport: { importedCase: () => ({ ok: false }) }, now: () => w.clock.now });
  const pat = c.determinationRead({ id: d.id, viewer: V("pat") });
  assert.deepEqual([pat.findings.map((f) => f.finding), pat.out_of_view], [[F], true]);
  for (const gone of [H, ref]) assert.equal(JSON.stringify(pat.findings).includes(gone), false, gone);
  const item = c.determinationsFor({ viewer: V("pat") }).items.find((i) => i.id === d.id);
  assert.deepEqual([item.findings.map((f) => f.finding), item.out_of_view], [[F], true]);
  const olive = c.determinationRead({ id: d.id, viewer: V("olive") });
  assert.deepEqual([olive.findings.map((f) => f.basis.kind), "out_of_view" in olive], [["published", "checked_held", "accepted"], false]);
});

test("Purpose (T45) R2 R31 R32 R35 R33 R36: a determination rests on findings of three kinds, is always this group's own, reads undetermined while its basis no longer stands, and holds the cure link", () => {
  const { w, proj, std, input } = heldScene();
  const ref = w.accept(IMP, "INQ-2026-0001-theirs");
  const all = w.c.determine(input({ findings: [F, H, { ref, edition: 1 }] }));
  assert.deepEqual(all.findings.map((f) => f.basis.kind), FINDING_KINDS);
  refused(w.c.determine(input({ adopts: "their determination" })), "DETERMINATION_NOT_ADOPTABLE");
  w.move(IMP, { at: "2026-10-01T00:00:00Z" });
  assert.deepEqual(w.c.determinationRead({ id: all.id, viewer: V("pat") }).outcomes,
                   [{ standard: std, outcome: "undetermined", recorded_outcome: "noncompliant" }]);
  /* the control: one resting on the published finding alone is not void */
  assert.equal("void" in w.c.determine(input()), false);
  assert.equal(proj, all.project);
});

test("R36 R37: the ops curelink, cureunlink and cures route to the services, the author and viewer the control plane's stamps, never the body's", () => {
  const { w, target, cure, std } = cureScene();
  const body = { determination: target.id, standard: std, cure: cure.id, author: V("olive"), viewer: V("olive") };
  refused(w.op("curelink", { author: MACHINE, viewer: MACHINE }, body), "MACHINE_CANNOT_LINK_CURE");
  const l = w.op("curelink", { author: V("olive"), viewer: V("olive") }, { ...body, author: MACHINE });
  assert.equal(l.ok, true, JSON.stringify(l).slice(0, 300));
  assert.equal(w.op("cures", { determination: target.id, viewer: V("pat") }).standards[0].link.link, l.link);
  refused(w.op("cures", { determination: target.id, viewer: V("quinn") }), "NO_SUCH_DETERMINATION");
  const e = w.op("cureunlink", { author: V("olive"), viewer: V("olive") }, { link: l.link, reason: "mistaken" });
  assert.deepEqual([e.ok, e.wrote], [true, true]);
});
