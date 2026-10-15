/* T49-1 (N1072, K3265; DEC-230): R144, the founder's own handle, and R141 as re-worded (`admin` is an id only, the handle of
   no one, the founder included). Each id is tested here explicitly, with a negative control per refusal (K874). Every
   test drives the module at its interface. R145's `MODULE_ORDER` is `module-order.test.mjs`'s. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { Membership, MEMBERSHIP_CHECKS, MEMBERSHIP_EXEMPT_TABLES, viewerPredicate }
  from "../../../src/membership/index.mjs";

const PASSWORD = "cal-passphrase-x";
const founderRows = (w) => JSON.stringify(w.rows(`SELECT id, handle FROM founder_handle`));
const snapshot = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));

/* The founder, `second` (an administrator), ann and bob active, cal invited. */
async function group() {
  const w = await world().group("ann", "bob");
  w.inv = (await w.m.memberAdd({ memberId: "cal", cover: "cover of cal", by: "admin" })).invite;
  return w;
}

test("R144 founderHandleSet by the founder holds the handle: founderHandle() answers it, sessionRights(admin).handle names it, handleCheck answers it taken; control: none is held before", async () => {
  const w = await group();
  assert.equal(w.m.founderHandle(), null, "none held at first");
  assert.equal(w.m.sessionRights("admin").handle, null, "and sessionRights names none");
  assert.deepEqual(await w.m.handleCheck({ invite: w.inv, handle: "steward" }), {
    ok: true, handle: "steward", state: "free", problems: [], suggestion: null, words: { key: "handle.free", en: "{handle} is free in {group}" } });
  const set = w.m.founderHandleSet({ handle: "steward", by: "admin" });
  assert.deepEqual(set, { ok: true, handle: "steward" });
  assert.equal(w.m.founderHandle(), "steward");
  assert.equal(founderRows(w), JSON.stringify([{ id: 1, handle: "steward" }]));
  const rights = w.m.sessionRights("admin");
  assert.deepEqual([rights.handle, rights.member, rights.administer, rights.rootOfTrust], ["steward", "admin", true, true]);
  assert.deepEqual(rights.capabilities, ["contribute", "publish", "create_projects"], "R92's other fields are unchanged");
  /* R123: taken, by invitation and by an active member, with a suggestion that is itself free */
  const byInvite = await w.m.handleCheck({ invite: w.inv, handle: "steward" });
  assert.deepEqual([byInvite.ok, byInvite.state, byInvite.suggestion, byInvite.words.key], [true, "taken", "steward-2", "handle.taken"]);
  const byMember = await w.m.handleCheck({ viewer: V("ann"), handle: "steward" });
  assert.deepEqual([byMember.state, byMember.suggestion], ["taken", "steward-2"]);
  assert.equal((await w.m.handleCheck({ invite: w.inv, handle: "steward-2" })).state, "free", "the suggestion is free");
  /* control: a handle that only starts with hers, and a member's own, behave as before */
  assert.equal((await w.m.handleCheck({ invite: w.inv, handle: "stewards" })).state, "free");
  assert.equal((await w.m.handleCheck({ invite: w.inv, handle: "ann" })).state, "taken");
  /* the suggestion never lands on her handle: with steward-2 held by a member, the next is steward-3 */
  await w.enrol("steward-2");
  assert.equal((await w.m.handleCheck({ invite: w.inv, handle: "steward" })).suggestion, "steward-3");
  /* the ordinary members' rights are untouched */
  assert.equal(w.m.sessionRights(V("ann")).handle, "ann");
  assert.equal(w.m.sessionRights("class:admin").handle, null);
});

test("R144 R16 enroll with the founder's handle is refused HANDLE_TAKEN and writes nothing; control: a free handle enrols on the same invitation", async () => {
  const w = await group();
  assert.equal(w.m.founderHandleSet({ handle: "steward", by: "admin" }).ok, true);
  const before = snapshot(w);
  assert.deepEqual(await w.m.enroll({ invite: w.inv, handle: "steward", password: PASSWORD }),
    { ok: false, reason: "HANDLE_TAKEN", handle: "steward" });
  assert.deepEqual(await w.m.enroll({ invite: w.inv, handle: "  steward ", password: PASSWORD }),
    { ok: false, reason: "HANDLE_TAKEN", handle: "steward" }, "trimmed, then taken");
  assert.equal(snapshot(w), before, "nothing written");
  assert.equal(w.m.memberFacts("cal").status, "invited");
  assert.deepEqual(await w.m.enroll({ invite: w.inv, handle: "stewards", password: PASSWORD }),
    { ok: true, memberId: "cal", handle: "stewards" });
});

test("R144 a by that is not the founder is refused FOUNDER_HANDLE_NOT_FOUNDER (C-96.54), first, writing nothing; both spellings of the founder are accepted", async () => {
  const w = await group();
  const row = MEMBERSHIP_CHECKS.FOUNDER_HANDLE_NOT_FOUNDER;
  assert.deepEqual([row.check, Object.isFrozen(row)], ["C-96.54", true]);
  assert.match(row.where, /founderHandleSet > is-founder-handle-founder$/);
  const before = snapshot(w);
  for (const by of ["ann", "second", V("ann"), "class:admin", "class:member", "", null, undefined, "Admin", "admin ", "member:ann", 7, {}]) {
    const r = w.m.founderHandleSet({ handle: "steward", by });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "FOUNDER_HANDLE_NOT_FOUNDER", "FOUNDER_HANDLE_NOT_FOUNDER", "C-96.54", row.translation],
      JSON.stringify(by));
  }
  assert.equal(snapshot(w), before, "nothing written");
  assert.equal(w.m.founderHandle(), null);
  /* the caller is judged before the handle: a bad handle under a member's by is still the caller's refusal */
  assert.equal(w.m.founderHandleSet({ handle: "Bad Handle!", by: "ann" }).reason, "FOUNDER_HANDLE_NOT_FOUNDER");
  assert.equal(w.m.founderHandleSet({ by: "ann" }).reason, "FOUNDER_HANDLE_NOT_FOUNDER");
  /* control: the founder, as `admin` or `member:admin`, is accepted */
  assert.equal(w.m.founderHandleSet({ handle: "steward", by: "member:admin" }).ok, true);
  const w2 = await group();
  assert.equal(w2.m.founderHandleSet({ handle: "steward", by: "admin" }).ok, true);
  /* no call throws, whatever it is handed */
  for (const arg of [undefined, null, 5, "x", []]) assert.doesNotThrow(() => w2.m.founderHandleSet(arg));
});

test("R144 R129 a second set is refused HANDLE_FIXED, the first handle kept, whatever the second names; control: the first set was accepted", async () => {
  const w = await group();
  assert.equal(w.m.founderHandleSet({ handle: "steward", by: "admin" }).ok, true);
  const before = snapshot(w);
  const fixed = MEMBERSHIP_CHECKS.HANDLE_FIXED;
  for (const handle of ["steward", "other", "admin", "ADMIN", "Bad Handle!", "", null, undefined, "ann"]) {
    const r = w.m.founderHandleSet({ handle, by: "admin" });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "HANDLE_FIXED", "HANDLE_FIXED", "C-96.52", fixed.translation],
      String(handle));
    assert.match(r.detail, /never changed[\s\S]*Nothing was written\.$/);
  }
  assert.equal(snapshot(w), before, "nothing written");
  assert.equal(w.m.founderHandle(), "steward", "the first handle kept");
  /* the not-the-founder refusal is still asked first */
  assert.equal(w.m.founderHandleSet({ handle: "other", by: "ann" }).reason, "FOUNDER_HANDLE_NOT_FOUNDER");
});

test("R144 R16 R141 the handle is judged as enrolment judges it: NO_HANDLE, BAD_HANDLE (ADMIN, Bad Handle!), HANDLE_TAKEN (admin, a member's current or earlier handle), each writing nothing; control: a free handle is accepted", async () => {
  const w = await group();
  /* a change made before T46 left ann's earlier handle in the history */
  w.sql.exec(`UPDATE members SET handle='ann-new' WHERE member_id='ann'`);
  w.sql.exec(`INSERT INTO handle_history (member_id, from_handle, to_handle, at) VALUES ('ann','ann','ann-new','2026-10-01T00:00:00.000Z')`);
  const before = snapshot(w);
  const cases = [["", "NO_HANDLE"], ["   ", "NO_HANDLE"], [null, "NO_HANDLE"], [undefined, "NO_HANDLE"],
                 ["ADMIN", "BAD_HANDLE"], ["Admin", "BAD_HANDLE"], ["Bad Handle!", "BAD_HANDLE"], ["a", "BAD_HANDLE"],
                 ["-ab", "BAD_HANDLE"], ["a".repeat(42), "BAD_HANDLE"],
                 ["admin", "HANDLE_TAKEN"], ["  admin ", "HANDLE_TAKEN"], ["bob", "HANDLE_TAKEN"], ["ann-new", "HANDLE_TAKEN"],
                 ["ann", "HANDLE_TAKEN"], ["second", "HANDLE_TAKEN"]];
  for (const [handle, reason] of cases) {
    const r = w.m.founderHandleSet({ handle, by: "admin" });
    assert.deepEqual([r.ok, r.reason], [false, reason], JSON.stringify(handle));
  }
  assert.equal(snapshot(w), before, "nothing written");
  assert.equal(w.m.founderHandle(), null);
  /* a revoked member's handle is taken too (R16: whatever the member's status) */
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  assert.equal(w.m.founderHandleSet({ handle: "bob", by: "admin" }).reason, "HANDLE_TAKEN");
  /* control: the same call with a free handle is accepted, and the answer is R144's */
  assert.deepEqual(w.m.founderHandleSet({ handle: "  steward  ", by: "admin" }), { ok: true, handle: "steward" });
  assert.equal(w.m.founderHandle(), "steward", "trimmed");
});

test("R144 R141 admin is an id only, the handle of no one, the founder included: enroll, handleCheck and founderHandleSet refuse it as taken, before and after her handle is held; ROOT_ADMIN is the id", async () => {
  const w = await group();
  assert.equal(Membership.ROOT_ADMIN, "admin", "N1067: ROOT_ADMIN names the founder's id");
  for (const phase of ["before", "after"]) {
    if (phase === "after") assert.equal(w.m.founderHandleSet({ handle: "steward", by: "admin" }).ok, true);
    assert.deepEqual(await w.m.enroll({ invite: w.inv, handle: "admin", password: PASSWORD }), { ok: false, reason: "HANDLE_TAKEN", handle: "admin" }, phase);
    assert.equal((await w.m.handleCheck({ invite: w.inv, handle: "admin" })).state, "taken", phase);
    assert.equal((await w.m.handleCheck({ viewer: V("ann"), handle: "admin" })).state, "taken", phase);
    assert.equal(w.m.memberByHandle("admin"), null, `${phase}: no member holds admin`);
    assert.equal(w.m.sessionRights("admin").handle === "admin", false, `${phase}: the founder's handle is never her id`);
  }
  assert.equal(w.m.founderHandleSet({ handle: "admin", by: "admin" }).reason, "HANDLE_FIXED", "held: the second set");
  assert.equal(world().m.founderHandleSet({ handle: "admin", by: "admin" }).reason, "HANDLE_TAKEN", "none held: taken");
  /* control: another handle enrols */
  assert.equal((await w.m.enroll({ invite: w.inv, handle: "administrator", password: PASSWORD })).ok, true);
});

test("R144 the founder's member id stays admin everywhere: R43, R44, R64, R86 and R94 are unchanged, and the handle is no member row or viewer", async () => {
  const w = await group();
  const sightBefore = [viewerPredicate("admin"), viewerPredicate("member:admin")];
  const adminsBefore = w.m.activeAdmins();
  assert.equal(w.m.founderHandleSet({ handle: "steward", by: "admin" }).ok, true);
  assert.deepEqual([viewerPredicate("admin"), viewerPredicate("member:admin")], sightBefore, "R43 unchanged");
  assert.deepEqual(w.m.activeAdmins(), adminsBefore, "R86 unchanged: the founder first, as `admin`");
  assert.equal(w.m.activeAdmins()[0], "admin");
  assert.equal(w.m.isAdministrator("admin"), true, "R64");
  assert.equal(w.m.positionalMember("admin"), null, "R76: the bare founder viewer names no member");
  assert.equal(w.m.positionalMember("member:admin"), "admin", "and the second spelling names `admin`, not her handle");
  assert.equal(w.m.memberFacts("admin"), null, "R68: she is no members row");
  assert.equal(w.m.memberByHandle("steward"), null, "R119: a handle in `members` only");
  assert.equal(w.m.memberList({ administer: true }).members.some((r) => r.member_id === "admin" || r.handle === "steward"), false,
    "R17: the roster lists members; she is not one");
  /* a project she owns: participation rows keep the id `admin` */
  w.project("PROJ-F");
  assert.equal(w.m.projectClaimOwner({ projectId: "PROJ-F", memberId: "admin" }).ok, true);
  assert.deepEqual(w.m.projectOwners("PROJ-F"), ["admin"], "R65");
  assert.deepEqual(w.m.participation("PROJ-F", "admin"), { state: "joined", owner: true });
  assert.equal(w.m.sight("PROJ-F", "admin"), Membership.SIGHT_FULL, "R44");
  /* control: her handle names no participant */
  assert.equal(w.m.participation("PROJ-F", "steward"), null);
});

test("R144 R77 a hidden project's existence shows its owners' handles: the founder's is her own handle once she holds one, and never admin; control: null while she holds none", async () => {
  const w = await group();
  w.project("PROJ-H");
  assert.equal(w.m.projectClaimOwner({ projectId: "PROJ-H", memberId: "admin" }).ok, true);
  w.m.participationWrite("invite", { projectId: "PROJ-H", memberId: "ann", by: "admin" });
  w.m.participationWrite("ownerOn", { projectId: "PROJ-H", memberId: "ann", by: "admin" });
  /* `bob` is an ordinary member outside it: he sees a hidden project as nothing; `second`, an administrator neither invited
     nor joined, sees its existence and its owners (D54). */
  const seen = () => w.m.existenceAct("PROJ-H", V("second"));
  assert.deepEqual(seen().owners, [null, "ann"], "while she holds none, the founder's entry is null");
  assert.equal(w.m.founderHandleSet({ handle: "steward", by: "admin" }).ok, true);
  assert.deepEqual(seen().owners, ["steward", "ann"], "her handle, in R65's order");
  assert.equal(JSON.stringify(seen()).includes('"admin"'), false, "the id admin reaches no reader of the answer");
  assert.equal(w.m.existenceAct("PROJ-H", V("bob")), null, "control: an ordinary member at a hidden project is told nothing");
});

test("R144 R115 the founder's handle is exempt from purge as the members are, and the table is declared once", async () => {
  const w = world();
  assert.ok(MEMBERSHIP_EXEMPT_TABLES.includes("founder_handle"));
  assert.ok(w.declared[0].opts.exempt.includes("founder_handle"), "declared exempt to record-core's purge");
  assert.ok(!w.declared[0].tables.some((t) => t.name === "founder_handle"), "and keyed to no project");
  w.m.migrate();
  assert.equal(w.declared.length, 1, "declared once");
  /* the handle survives a second boot (migrate is idempotent) */
  assert.equal(w.m.founderHandleSet({ handle: "steward", by: "admin" }).ok, true);
  w.m.migrate();
  assert.equal(w.m.founderHandle(), "steward");
  /* control: a plain table of the module's is named in the exempt list too, and the founder's is not a project's */
  assert.ok(MEMBERSHIP_EXEMPT_TABLES.includes("members"));
});

test("R144 op=founderhandleset sets the handle for the stamped founder only: by is the control plane's stamp from the query, never the body's; control: the founder's stamp sets it", async () => {
  const w = await group();
  /* a body naming the founder under a member's stamp is the member's call */
  const forged = w.ops("by=ann", { handle: "steward", by: "admin" }).founderhandleset();
  assert.equal(forged.reason, "FOUNDER_HANDLE_NOT_FOUNDER");
  assert.equal(w.m.founderHandle(), null);
  const unstamped = w.ops("", { handle: "steward", by: "admin" }).founderhandleset();
  assert.equal(unstamped.reason, "FOUNDER_HANDLE_NOT_FOUNDER", "no stamp is no founder");
  const machine = w.ops("by=class%3Aadmin", { handle: "steward" }).founderhandleset();
  assert.equal(machine.reason, "FOUNDER_HANDLE_NOT_FOUNDER", "a machine credential is refused");
  assert.deepEqual(w.ops("by=admin", { handle: "steward" }).founderhandleset(), { ok: true, handle: "steward" });
  assert.deepEqual(w.ops("by=admin", { handle: "steward" }).founderhandleset().reason, "HANDLE_FIXED");
  assert.equal(w.m.founderHandle(), "steward");
  assert.equal(typeof w.ops("by=admin", null).founderhandleset, "function");
  /* no body at all */
  assert.equal(w.ops("by=admin", null).founderhandleset().reason, "HANDLE_FIXED");
  const fresh = await group();
  assert.equal(fresh.ops("by=admin", null).founderhandleset().reason, "NO_HANDLE");
});

test("R144 R16 enroll and founderHandleSet share one judgment: the same handles are refused with the same answers", async () => {
  const w = await group();
  const f = await group();
  for (const handle of ["", "ADMIN", "admin", "ann", "Bad Handle!", "a"]) {
    const viaEnroll = await w.m.enroll({ invite: w.inv, handle, password: PASSWORD });
    const viaFounder = f.m.founderHandleSet({ handle, by: "admin" });
    assert.deepEqual(viaFounder, viaEnroll, JSON.stringify(handle));
  }
});
