/* A project's scope (R21–R23) and its second-approval setting (R24), T45 (Actions D4, D27; v0.2 rules 9, 15, 20; Bob's
   K2782). At the interface: membership's acts set up the participation and the visibility, this module's acts are
   asked, and R22's guard is reached as membership's invitation and visibility acts reach it (its R128). Every refusal
   is held with its negative control: the same call without the refusing condition lands. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, snapshot } from "./fixture.mjs";
import { Membership, noSuchProject } from "../../../src/membership/index.mjs";
import { ProjectRoster, PROJECT_SCOPE_CHECKS } from "../../../src/project-roster/index.mjs";

/* H hidden: ann owns it, bob joined, cal invited. S hidden: dee its owner and only participant. D discoverable: ann. */
async function scopeWorld() {
  const w = await world().group("ann", "bob", "cal", "dee", "eve");
  w.owned("PROJ-H", "ann", ["bob"], ["cal"]);
  w.owned("PROJ-S", "dee");
  w.owned("PROJ-D", "ann");
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  return w;
}
const set = (w, by, scope, projectId = "PROJ-H", reason = "a reason", viewer = V(by)) =>
  w.r.projectScopeSet({ projectId, scope, reason, by, viewer });
const approve = (w, by, needs, projectId = "PROJ-H", reason = "a reason", viewer = V(by)) =>
  w.r.projectApprovalSet({ projectId, needs, reason, by, viewer });
const carries = (r, code) => {
  const row = PROJECT_SCOPE_CHECKS[code];
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, row.check, row.translation], code);
};

test("R21 projectScopeSet: after sight, each refusal in order writes nothing, each with its control; a joined participant sets counsel_matter on a hidden project; the latest record is the scope", async () => {
  const w = await scopeWorld();
  w.bundle("INFO-1");
  const before = snapshot(w);
  /* sight first: an outsider of hidden H is answered as an id naming nothing; at discoverable D's EXISTENCE, C-70.1 */
  assert.deepEqual(set(w, "eve", "counsel_matter"), noSuchProject("PROJ-H"));
  assert.deepEqual(set(w, "eve", "counsel_matter", "PROJ-NEVER"), noSuchProject("PROJ-NEVER"));
  assert.deepEqual(set(w, "eve", "counsel_matter", "PROJ-D"), w.m.existenceAct("PROJ-D", V("eve")));
  assert.equal(set(w, "ann", "counsel_matter", "INFO-1").reason, "NOT_A_PROJECT");
  /* PROJECT_ACT_NOT_A_PARTICIPANT (membership R55 joined): the invited cal; with no viewer sent, eve, a machine
     credential and the founder are asked too, never passed */
  for (const by of ["cal", "eve", "class:ai", "admin", null, "x y"]) {
    const r = w.r.projectScopeSet({ projectId: "PROJ-H", scope: "counsel_matter", reason: "r", by });
    assert.deepEqual([r.ok, r.reason, r.check], [false, "PROJECT_ACT_NOT_A_PARTICIPANT", "C-56.1"], String(by));
  }
  /* PROJECT_SCOPE_UNKNOWN */
  for (const s of ["privileged", "", null, undefined, 7]) carries(set(w, "bob", s), "PROJECT_SCOPE_UNKNOWN");
  /* NO_REASON: absent, blank or over 2,000 characters */
  for (const reason of [undefined, null, "   ", "x".repeat(2001), 5])
    assert.equal(w.r.projectScopeSet({ projectId: "PROJ-H", scope: "counsel_matter", reason, by: "bob", viewer: V("bob") }).reason,
      "NO_REASON", String(reason).slice(0, 9));
  /* PROJECT_SCOPE_NEEDS_HIDDEN: discoverable D refused, its owner asking */
  carries(set(w, "ann", "counsel_matter", "PROJ-D"), "PROJECT_SCOPE_NEEDS_HIDDEN");
  /* PROJECT_SCOPE_UNCHANGED: none on a project with no record */
  carries(set(w, "bob", "none"), "PROJECT_SCOPE_UNCHANGED");
  assert.equal(snapshot(w), before, "no refusal wrote anything");
  assert.deepEqual(w.r.projectScope("PROJ-H"), { scope: "none", since: null, by: null });
  /* the controls: a joined participant (not an owner), on hidden H, with a reason of exactly 2,000 characters */
  const ok = set(w, "bob", "counsel_matter", "PROJ-H", ` ${"x".repeat(2000)} `);
  assert.deepEqual([ok.ok, ok.projectId, ok.scope, ok.previous, ok.by, ok.reason.length], [true, "PROJ-H", "counsel_matter",
    "none", "bob", 2000]);
  assert.match(ok.at, /^\d{4}-\d\d-\d\dT/);
  assert.deepEqual(w.r.projectScope("PROJ-H"), { scope: "counsel_matter", since: ok.at, by: "bob" });
  carries(set(w, "ann", "counsel_matter"), "PROJECT_SCOPE_UNCHANGED");
  /* discoverable D, hidden again, takes the scope (NEEDS_HIDDEN's control) */
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "hidden", by: "ann", viewer: V("ann") });
  assert.equal(set(w, "ann", "counsel_matter", "PROJ-D").ok, true);
  /* removed the same way, with a reason; the latest record governs */
  const off = set(w, "ann", "none", "PROJ-H", "counsel stood down");
  assert.deepEqual([off.ok, off.scope, off.previous], [true, "none", "counsel_matter"]);
  assert.deepEqual([w.r.projectScope("PROJ-H").scope, w.r.projectScope("PROJ-H").by], ["none", "ann"]);
  assert.equal(w.rows(`SELECT * FROM project_scopes WHERE project_id='PROJ-H'`).length, 2, "appended, never rewritten");
});

test("R21 own: set and removed only by an owner who is the project's only participant, in any state; refused with a second participant, and its history read by every participant and not by an outsider", async () => {
  const w = await scopeWorld();
  /* H has three participants: refused for its owner; S has one, its owner: lands */
  carries(set(w, "ann", "own"), "PROJECT_SCOPE_OWN_NOT_SOLE");
  carries(set(w, "bob", "own"), "PROJECT_SCOPE_OWN_NOT_SOLE");
  const ok = set(w, "dee", "own", "PROJ-S", "my source notes");
  assert.deepEqual([ok.ok, ok.scope], [true, "own"]);
  assert.equal(w.r.projectScope("PROJ-S").scope, "own");
  /* a second participant in any state (here, invited directly, as a store written before the guard could hold):
     removing own, and changing it to counsel_matter, are refused; the control is the sole owner again */
  w.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
              VALUES ('PROJ-S','eve','invited',0,'t','t')`);
  for (const s of ["none", "counsel_matter"]) carries(set(w, "dee", s, "PROJ-S"), "PROJECT_SCOPE_OWN_NOT_SOLE");
  w.sql.exec(`DELETE FROM project_participants WHERE project_id='PROJ-S' AND member_id='eve'`);
  /* the history, in R6's form, on projectParticipants: every participant reads it, an outsider is answered absent */
  const off = set(w, "dee", "counsel_matter", "PROJ-S", "counsel now");
  assert.deepEqual([off.ok, off.previous], [true, "own"]);
  const h = w.r.projectParticipants({ projectId: "PROJ-S", by: "dee" }).scopes;
  assert.deepEqual(h.map((x) => [x.scope, x.reason, x.by]), [["own", "my source notes", "dee"], ["counsel_matter", "counsel now", "dee"]]);
  for (const x of h) assert.match(x.at, /^\d{4}-\d\d-\d\dT/);
  set(w, "bob", "counsel_matter");
  for (const reader of ["ann", "bob", "cal"])
    assert.deepEqual(w.r.projectParticipants({ projectId: "PROJ-H", by: reader }).scopes.map((x) => [x.scope, x.by]),
      [["counsel_matter", "bob"]], reader);
  for (const outsider of ["eve", "second", "admin"])
    assert.deepEqual(w.r.projectParticipants({ projectId: "PROJ-H", by: outsider }), noSuchProject("PROJ-H"), outsider);
});

test("R22 at start this module registers once in membership's project-act guard; it refuses an invitation to an own project and making a counsel matter or an own project discoverable, writing nothing; each act lands on a project of scope none", async () => {
  const w = await scopeWorld();
  /* registered once: a second registration in the slot is refused, naming this module (membership R81) */
  assert.equal(w.m.registerProjectActGuard("project-roster", () => null).reason, "LISTENER_DECLARED");
  assert.equal(w.r.start().guard.reason, "LISTENER_DECLARED");
  set(w, "dee", "own", "PROJ-S", "mine");
  set(w, "bob", "counsel_matter", "PROJ-H", "counsel");
  w.project("PROJ-N");
  w.m.projectClaimOwner({ projectId: "PROJ-N", memberId: "ann" });
  const before = snapshot(w);
  /* an invitation to an own project */
  const inv = w.m.projectInvite({ projectId: "PROJ-S", handle: "eve", by: "dee", viewer: V("dee") });
  carries(inv, "PROJECT_SCOPE_OWN");
  /* discoverable, on each scope */
  for (const [p, by] of [["PROJ-S", "dee"], ["PROJ-H", "ann"]])
    carries(w.m.projectVisibilitySet({ projectId: p, setting: "discoverable", reason: "r", by, viewer: V(by) }),
      "PROJECT_SCOPE_KEEPS_HIDDEN");
  assert.equal(snapshot(w), before, "nothing written");
  assert.deepEqual([w.m.visibilityOf("PROJ-S"), w.m.visibilityOf("PROJ-H")], ["hidden", "hidden"]);
  /* the controls: scope none takes both acts; a counsel matter takes an invitation, and setting hidden again */
  assert.equal(w.m.projectInvite({ projectId: "PROJ-N", handle: "eve", by: "ann", viewer: V("ann") }).ok, true);
  assert.equal(w.m.projectVisibilitySet({ projectId: "PROJ-N", setting: "discoverable", by: "ann", viewer: V("ann") }).ok, true);
  assert.equal(w.m.projectInvite({ projectId: "PROJ-H", handle: "eve", by: "ann", viewer: V("ann") }).ok, true);
  assert.equal(w.m.projectVisibilitySet({ projectId: "PROJ-H", setting: "hidden", by: "ann", viewer: V("ann") }).ok, true);
  /* the scope removed, the same acts land */
  set(w, "ann", "none", "PROJ-H", "done with counsel");
  assert.equal(w.m.projectVisibilitySet({ projectId: "PROJ-H", setting: "discoverable", by: "ann", viewer: V("ann") }).ok, true);
});

test("R22 (K2782) a member's own project is never rescued: refused PROJECT_SCOPE_OWN after NOT_AN_ADMIN and before the rescue's own refusals, naming nothing of the project; scope none is rescued", async () => {
  const w = await scopeWorld();
  set(w, "dee", "own", "PROJ-S", "mine");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  const resc = (by, viewer, projectId = "PROJ-S", reason = "stranded", handle = "eve") =>
    w.r.projectOwnerRescue({ projectId, handle, by, reason, viewer });
  const before = snapshot(w);
  assert.equal(resc("eve", V("eve")).reason, "NO_SUCH_PROJECT", "a member outside hidden S: absent, first");
  assert.equal(resc("eve", null).reason, "NOT_AN_ADMIN", "not an administrator: NOT_AN_ADMIN first");
  for (const [by, v] of [["second", V("second")], ["admin", "admin"], ["admin", V("admin")]]) {
    assert.equal(w.m.sight("PROJ-S", v), Membership.SIGHT_EXISTENCE, v);
    for (const [reason, handle] of [["stranded", "eve"], [" ", "eve"], ["stranded", "zed"]]) {
      const r = resc(by, v, "PROJ-S", reason, handle);
      carries(r, "PROJECT_SCOPE_OWN");
      assert.equal(r.project, "PROJ-S");
      assert.doesNotMatch(JSON.stringify(r), /"(dee|eve|zed)"|Project PROJ-S|mine/, `${v}: names nothing of the project`);
    }
  }
  assert.equal(snapshot(w), before, "nothing written");
  assert.equal(w.m.participation("PROJ-S", "eve"), null);
  /* the control: H of scope none, its every owner inactive, is rescued */
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  const ok = resc("second", V("second"), "PROJ-H", "stranded", "eve");
  assert.deepEqual([ok.ok, ok.owner], [true, true]);
  /* a counsel matter is rescued too: only `own` is excepted */
  w.owned("PROJ-C", "cal");
  set(w, "cal", "counsel_matter", "PROJ-C", "counsel");
  w.m.memberSet({ memberId: "cal", status: "revoked", by: "admin" });
  assert.equal(resc("second", V("second"), "PROJ-C", "stranded", "bob").ok, true);
});

test("R23 projectScope answers {scope, since, by}; none with no record and for an id that names nothing; asks no viewer, writes nothing, never throws", async () => {
  const w = await scopeWorld();
  const none = { scope: "none", since: null, by: null };
  for (const id of ["PROJ-H", "PROJ-NEVER", "", null, undefined, 42, { a: 1 }]) assert.deepEqual(w.r.projectScope(id), none, String(id));
  const a = set(w, "bob", "counsel_matter");
  assert.deepEqual(w.r.projectScope("PROJ-H"), { scope: "counsel_matter", since: a.at, by: "bob" });
  const before = snapshot(w);
  w.r.projectScope("PROJ-H");
  assert.equal(snapshot(w), before, "writes nothing");
  /* never throws, even over a store that cannot be read */
  const broken = new ProjectRoster({ sql: { exec() { throw new Error("gone"); } }, core: w.core, membership: w.m });
  assert.deepEqual(broken.projectScope("PROJ-H"), none);
  assert.deepEqual(broken.secondApprovalNeeded({ projectId: "PROJ-H", tier: 1 }), { needed: false, matched: [] });
});

test("R24 projectApprovalSet: an owner's act; each refusal in order writes nothing, with its control; secondApprovalNeeded matches kind, tier and public, an undetermined tier matching every {tier}; [] restores one member", async () => {
  const w = await scopeWorld();
  const before = snapshot(w);
  /* sight, then NOT_THE_OWNER: a joined participant, an administrator and the founder (at FULL of discoverable D) */
  assert.deepEqual(approve(w, "eve", [], "PROJ-H"), noSuchProject("PROJ-H"));
  assert.equal(approve(w, "bob", []).reason, "NOT_THE_OWNER");
  for (const [by, v] of [["second", V("second")], ["admin", "admin"]])
    assert.equal(approve(w, by, [], "PROJ-D", "r", v).reason, "NOT_THE_OWNER", by);
  /* APPROVAL_RULE_INVALID naming the entry */
  for (const [needs, entry] of [["tier 2", null], [{ tier: 2 }, null], [[{ tier: 4 }], { tier: 4 }], [[{ tier: "2" }], { tier: "2" }],
                                [[{ public: false }], { public: false }], [[{ kind: "Records" }], { kind: "Records" }],
                                [[{ tier: 2, public: true }], { tier: 2, public: true }], [[{}], {}], [[null], null],
                                [[{ member: "bob" }], { member: "bob" }]]) {
    const r = approve(w, "ann", needs);
    carries(r, "APPROVAL_RULE_INVALID");
    assert.deepEqual(r.entry, entry, JSON.stringify(needs));
  }
  /* APPROVAL_KIND_UNKNOWN: a kind the active profiles' view does not hold (Port Ellery's test profile is active) */
  const unk = approve(w, "ann", [{ tier: 1 }, { kind: "grand_jury" }]);
  carries(unk, "APPROVAL_KIND_UNKNOWN");
  assert.deepEqual([unk.entry, unk.index], [{ kind: "grand_jury" }, 1]);
  /* with no active profile, no kind is held */
  w.settings.jurisdiction_profiles = [];
  carries(approve(w, "ann", [{ kind: "bylaw_complaint" }]), "APPROVAL_KIND_UNKNOWN");
  w.settings.jurisdiction_profiles = ["test-port-ellery"];
  /* NO_REASON */
  for (const reason of [undefined, null, " ", "x".repeat(2001)])
    assert.equal(w.r.projectApprovalSet({ projectId: "PROJ-H", needs: [{ tier: 3 }], reason, by: "ann", viewer: V("ann") }).reason,
      "NO_REASON", String(reason).slice(0, 9));
  assert.equal(snapshot(w), before, "no refusal wrote anything");
  assert.deepEqual(w.r.secondApprovalNeeded({ projectId: "PROJ-H", tier: 3, public: true }), { needed: false, matched: [] },
    "no setting: one member approves");
  /* the control: an owner, valid entries, a kind the view holds, a reason */
  const ok = approve(w, "ann", [{ kind: "bylaw_complaint" }, { tier: 2 }, { public: true }], "PROJ-H", "care");
  assert.deepEqual([ok.ok, ok.needs, ok.by], [true, [{ kind: "bylaw_complaint" }, { tier: 2 }, { public: true }], "ann"]);
  const need = (q) => w.r.secondApprovalNeeded({ projectId: "PROJ-H", ...q });
  assert.deepEqual(need({ kind: "bylaw_complaint", tier: 1 }), { needed: true, matched: [{ kind: "bylaw_complaint" }] });
  assert.deepEqual(need({ kind: "records_request", tier: 1 }), { needed: false, matched: [] });
  assert.deepEqual(need({ kind: "records_request", tier: 2 }), { needed: true, matched: [{ tier: 2 }] });
  assert.deepEqual(need({ kind: "records_request", tier: 1, public: true }), { needed: true, matched: [{ public: true }] });
  /* an undetermined tier (null, absent, a word) matches {tier: 2}: never read as Tier 1 */
  for (const tier of [null, undefined, "undetermined", 0, "2"])
    assert.deepEqual(need({ kind: "records_request", tier }), { needed: true, matched: [{ tier: 2 }] }, String(tier));
  /* [] restores the default; the history reads in R6's form for every participant, and names no member as an entry */
  assert.equal(approve(w, "ann", [], "PROJ-H", "back to one").ok, true);
  assert.deepEqual(need({ tier: null, public: true, kind: "bylaw_complaint" }), { needed: false, matched: [] });
  for (const reader of ["ann", "bob", "cal"]) {
    const h = w.r.projectParticipants({ projectId: "PROJ-H", by: reader }).approvals;
    assert.deepEqual(h.map((x) => [x.needs, x.reason, x.by]),
      [[[{ kind: "bylaw_complaint" }, { tier: 2 }, { public: true }], "care", "ann"], [[], "back to one", "ann"]], reader);
  }
  assert.deepEqual(w.r.projectParticipants({ projectId: "PROJ-H", by: "eve" }), noSuchProject("PROJ-H"));
  /* another project's setting is its own; an id naming nothing needs none */
  approve(w, "dee", [{ tier: 1 }], "PROJ-S");
  assert.deepEqual(w.r.secondApprovalNeeded({ projectId: "PROJ-S", tier: 1 }), { needed: true, matched: [{ tier: 1 }] });
  assert.deepEqual(need({ tier: 1 }), { needed: false, matched: [] });
  for (const p of ["PROJ-NEVER", null]) assert.deepEqual(w.r.secondApprovalNeeded({ projectId: p, tier: null }), { needed: false, matched: [] });
  assert.deepEqual(w.r.secondApprovalNeeded(), { needed: false, matched: [] });
});

test("R20 the scope rows: each code minted carries its row, frozen, numbered C-147, its `where` naming this module's region; the translations and every detail name the group's Civicsmith only so", async () => {
  const FORBIDDEN = /\b(cop(y|ies)|instances?|planes?|servers?)\b/i;
  assert.deepEqual(Object.fromEntries(Object.entries(PROJECT_SCOPE_CHECKS).map(([k, r]) => [k, r.check])), {
    PROJECT_SCOPE_UNKNOWN: "C-147.1", PROJECT_SCOPE_NEEDS_HIDDEN: "C-147.2", PROJECT_SCOPE_OWN_NOT_SOLE: "C-147.3",
    PROJECT_SCOPE_UNCHANGED: "C-147.4", PROJECT_SCOPE_OWN: "C-147.5", PROJECT_SCOPE_KEEPS_HIDDEN: "C-147.6",
    APPROVAL_RULE_INVALID: "C-147.7", APPROVAL_KIND_UNKNOWN: "C-147.8" });
  assert.ok(Object.isFrozen(PROJECT_SCOPE_CHECKS));
  for (const [code, row] of Object.entries(PROJECT_SCOPE_CHECKS)) {
    assert.ok(Object.isFrozen(row), code);
    assert.match(row.where, /^src\/project-roster\/index\.mjs [#\w]+ > is-[a-z-]+$/, code);
    assert.ok(typeof row.translation === "string" && row.translation.length > 40, code);
    assert.doesNotMatch(row.translation, FORBIDDEN, code);
  }
  const w = await scopeWorld();
  set(w, "dee", "own", "PROJ-S", "mine");
  set(w, "bob", "counsel_matter", "PROJ-H", "counsel");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  const answers = [
    set(w, "bob", "x"), set(w, "bob", "own"), set(w, "bob", "none", "PROJ-H", " "), set(w, "ann", "counsel_matter", "PROJ-D"),
    set(w, "ann", "counsel_matter"), set(w, "cal", "none"), set(w, "ann", "none", "PROJ-H", "done"),
    w.m.projectInvite({ projectId: "PROJ-S", handle: "eve", by: "dee", viewer: V("dee") }),
    w.m.projectVisibilitySet({ projectId: "PROJ-S", setting: "discoverable", by: "dee", viewer: V("dee") }),
    w.r.projectOwnerRescue({ projectId: "PROJ-S", handle: "eve", by: "second", reason: "r", viewer: V("second") }),
    approve(w, "bob", []), approve(w, "ann", [{ tier: 9 }]), approve(w, "ann", [{ kind: "grand_jury" }]),
    approve(w, "ann", [], "PROJ-H", ""), approve(w, "ann", [{ tier: 2 }]),
  ];
  const seen = new Set();
  for (const [i, a] of answers.entries()) {
    seen.add(a.reason);
    for (const k of ["translation", "detail", "message", "remedy"])
      if (typeof a[k] === "string") assert.doesNotMatch(a[k], FORBIDDEN, `${i} ${a.reason ?? "ok"} ${k}`);
  }
  for (const code of Object.keys(PROJECT_SCOPE_CHECKS)) assert.ok(seen.has(code), `${code} reached`);
});
