/* T40 (T40-M; N797, N799, N812; DEC-184, DEC-186; K1881, K2373, K2376, K2394): R122 `notTheOwner` and R55's owner
   refusal through it; R123 `handleCheck`, R125 `registerHandleGuard`, R126's rows; R16, R17 and R57 as amended. T46
   (T46-4; DEC-196, DEC-197; K2903): R124's change of handle is retired (its refusal, R129, is `t46-handles-doors.test.mjs`'s),
   so the handle history these tests read is seeded as the changes made before its retirement left it. Each id is tested
   here explicitly, with a negative control (K874: older tests name some of these ids already). Every test drives the
   module at its interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world, V } from "./fixture.mjs";
import { notTheOwner, notAnAdmin, Membership, MEMBERSHIP_CHECKS, PROJECT_AUTHORITY_CHECKS, HANDLE_WORDS }
  from "../../../src/membership/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const wordsJson = async () =>
  JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8")).words;

/* Every table's rows, so an answer that must write nothing is held to it. */
const snapshot = (w, skip = []) => Object.fromEntries(
  w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).map((r) => r.name)
    .filter((t) => !skip.includes(t)).map((t) => [t, JSON.stringify(w.rows(`SELECT * FROM ${t}`))]));

/* A change of handle made before R124 was retired (T46): the member's handle moved and the history row it appended. No
   act of the module makes one any longer (R129), so a test that needs an earlier handle writes what such a change left. */
function earlierHandle(w, memberId, to) {
  const from = w.row(`SELECT handle FROM members WHERE member_id=?`, memberId).handle;
  const at = new Date().toISOString();
  w.sql.exec(`UPDATE members SET handle=?, updated=? WHERE member_id=?`, to, at, memberId);
  w.sql.exec(`INSERT INTO handle_history (member_id, from_handle, to_handle, at) VALUES (?,?,?,?)`, memberId, from, to, at);
}

/* A group: the founder, `second` (an administrator), ann and bob active; `inv` an invitation not yet used. */
async function handleWorld({ guard = () => null, omitGuard = false } = {}) {
  const w = await world().group("ann", "bob");
  if (!omitGuard) assert.equal(w.m.registerHandleGuard("publication", (a) => guard(a)).ok, true);
  const inv = await w.m.memberAdd({ memberId: "cal", cover: "cover of cal", by: "admin" });
  w.inv = inv.invite;
  return w;
}

/* ---------------------------------------------------------------- R122, R55 ---------------------------------------- */

test("R122 notTheOwner answers PROJECT_ACT_NOT_THE_OWNER in R84's shape, with C-56.2's row, at one site", () => {
  const row = PROJECT_AUTHORITY_CHECKS.PROJECT_ACT_NOT_THE_OWNER;
  assert.equal(row.check, "C-56.2");
  assert.equal(row.where, "src/membership/index.mjs notTheOwner > is-not-the-owner", "the row's where moved to the function");
  const r = notTheOwner("ann", "PROJ-1");
  assert.deepEqual(Object.keys(r).sort(), ["by", "check", "code", "detail", "ok", "project", "reason", "translation"]);
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.by, r.project],
    [false, "PROJECT_ACT_NOT_THE_OWNER", "PROJECT_ACT_NOT_THE_OWNER", "C-56.2", row.translation, "ann", "PROJ-1"]);
  assert.match(r.detail, /Nothing was changed\.$/);
  /* the detail is one fixed sentence: the same for every caller and project */
  assert.equal(notTheOwner("bob", "PROJ-2").detail, r.detail);
  assert.deepEqual([notTheOwner().by, notTheOwner().project], [null, null]);
  /* extra adds a caller's own fields and never replaces the refusal's */
  const x = notTheOwner("ann", "PROJ-1", { act: "setting the AI account", code: "X", check: "C-0", by: "eve", detail: "d",
                                          message: "m", project: "P" });
  assert.deepEqual([x.act, x.code, x.check, x.by, x.detail, x.project, "message" in x],
    ["setting the AI account", "PROJECT_ACT_NOT_THE_OWNER", "C-56.2", "ann", r.detail, "PROJ-1", false]);
  /* R84's remedy: kept, and the message is the row's translation then the remedy */
  const y = notTheOwner("ann", "PROJ-1", { remedy: "Ask an owner of the project." });
  assert.deepEqual([y.remedy, y.message], ["Ask an owner of the project.", `${row.translation} Ask an owner of the project.`]);
  assert.equal("remedy" in notTheOwner("ann", "PROJ-1", { remedy: 7 }), false, "a remedy is a sentence");
  /* never throws, whatever it is handed */
  const hostile = new Proxy({}, { ownKeys() { throw new Error("no"); } });
  for (const e of [hostile, [1], "s", 3, null]) assert.equal(notTheOwner({}, "PROJ-1", e).ok, false);
  /* negative control: R84's refusal is a different condition with its own row */
  const n = notAnAdmin("ann", "acting");
  assert.notEqual(n.code, r.code);
  assert.notEqual(n.check, r.check);
});

test("R55 R122 projectAuthority answers its owner refusal through notTheOwner; its joined refusal stays C-56.1", async () => {
  const w = await world().group("ann", "bob", "cal");
  w.project("PROJ-1");
  w.m.projectClaimOwner({ projectId: "PROJ-1", memberId: "ann" });
  w.m.projectInvite({ projectId: "PROJ-1", handle: "bob", by: "ann" });
  w.m.projectJoin({ projectId: "PROJ-1", by: "bob" });
  const r = w.m.projectAuthority("PROJ-1", V("bob"), "owner", "revising the document");
  assert.deepEqual(r, notTheOwner("bob", "PROJ-1", { act: "revising the document", needs: "owner" }));
  for (const who of [V("second"), V("admin"), V("cal")])
    assert.deepEqual(w.m.projectAuthority("PROJ-1", who, "owner", "x"),
      notTheOwner(who.slice(7), "PROJ-1", { act: "x", needs: "owner" }), who);
  /* negative controls: an owner passes; the joined fence answers its own row; no member is not asked */
  assert.equal(w.m.projectAuthority("PROJ-1", V("ann"), "owner", "x"), null);
  const j = w.m.projectAuthority("PROJ-1", V("cal"), "joined", "x");
  assert.deepEqual([j.code, j.check], ["PROJECT_ACT_NOT_A_PARTICIPANT", "C-56.1"]);
  assert.equal(w.m.projectAuthority("PROJ-1", `${MACHINE_CLASS_PREFIX}member`, "owner", "x"), null);
});

/* ---------------------------------------------------------------- R123 --------------------------------------------- */

test("R123 handleCheck with a live invitation: free, taken (with the smallest free suggestion) or not allowed (naming each problem), with words.json's words", async () => {
  const w = await handleWorld();
  const words = await wordsJson();
  const en = (k) => words.find((x) => x.key === k).en;
  for (const k of ["handle.free", "handle.taken", "handle.characters"]) assert.equal(HANDLE_WORDS[k], en(k), k);
  const free = await w.m.handleCheck({ invite: w.inv, handle: "cal-k" });
  assert.deepEqual(free, { ok: true, handle: "cal-k", state: "free", problems: [], suggestion: null,
                           words: { key: "handle.free", en: en("handle.free") } });
  const taken = await w.m.handleCheck({ invite: w.inv, handle: "ann" });
  assert.deepEqual(taken, { ok: true, handle: "ann", state: "taken", problems: [], suggestion: "ann-2",
                            words: { key: "handle.taken", en: en("handle.taken") } });
  /* the smallest free: ann-2 and ann-3 held, so ann-4 */
  await w.enrol("ann-2");
  await w.enrol("ann-3");
  assert.equal((await w.m.handleCheck({ invite: w.inv, handle: "ann" })).suggestion, "ann-4");
  /* none fits 41 characters */
  const long = "a".repeat(40);
  await w.enrol(long);
  assert.deepEqual([(await w.m.handleCheck({ invite: w.inv, handle: long })).state,
                    (await w.m.handleCheck({ invite: w.inv, handle: long })).suggestion], ["taken", null]);
  const bad = await w.m.handleCheck({ invite: w.inv, handle: "-Mai.K!" });
  assert.deepEqual(bad, { ok: true, handle: "-Mai.K!", state: "not_allowed", suggestion: null,
    problems: [{ problem: "start" }, { problem: "characters", characters: ["M", ".", "K", "!"] }],
    words: { key: "handle.characters", en: en("handle.characters") } });
  assert.deepEqual((await w.m.handleCheck({ invite: w.inv, handle: "a" })).problems, [{ problem: "length", min: 2, max: 41 }]);
  assert.deepEqual((await w.m.handleCheck({ invite: w.inv, handle: "" })).problems, [{ problem: "length", min: 2, max: 41 }]);
  assert.deepEqual((await w.m.handleCheck({ invite: w.inv, handle: "b".repeat(42) })).problems.map((p) => p.problem), ["length"]);
  /* negative control: the boundaries R12 admits are free */
  for (const h of ["ab", "9z", "a".repeat(41), "mai-k"])
    assert.equal((await w.m.handleCheck({ invite: w.inv, handle: h })).state, "free", h);
});

test("R123 handleCheck never says who holds a handle or that it was someone's earlier one: taken is one answer", async () => {
  const w = await handleWorld();
  earlierHandle(w, "ann", "ann-new");   // "ann" is ann's earlier handle, from a change made before T46
  const current = await w.m.handleCheck({ invite: w.inv, handle: "bob" });
  const earlier = await w.m.handleCheck({ invite: w.inv, handle: "ann" });
  assert.deepEqual({ ...earlier, handle: "x", suggestion: "x" }, { ...current, handle: "x", suggestion: "x" });
  for (const a of [current, earlier]) assert.doesNotMatch(JSON.stringify(a), /"(member|memberId|member_id|by|holder|formerly)"/);
  /* a member's own earlier handle reads free to them, taken to everyone else (no change is made, R129) */
  assert.equal((await w.m.handleCheck({ viewer: V("ann"), handle: "ann" })).state, "free");
  assert.equal((await w.m.handleCheck({ viewer: V("bob"), handle: "ann" })).state, "taken");
  /* negative control: a handle nobody held is free */
  assert.equal((await w.m.handleCheck({ invite: w.inv, handle: "zed" })).state, "free");
});

test("R123 handleCheck is asked with a live invitation or by an active member; anything else answers R15's NO_SUCH_INVITATION byte for byte, writing nothing", async (t) => {
  const w = await handleWorld();
  const never = await w.m.inviteLook({ invite: "0".repeat(32) });
  const misses = [{ invite: "0".repeat(32) }, { invite: "not an invite" }, {}, { viewer: "admin" }, { viewer: V("admin") },
    { viewer: `${MACHINE_CLASS_PREFIX}member` }, { viewer: V("cal") }, { viewer: V("nobody") }, { viewer: "junk" },
    { invite: null, viewer: null }];
  for (const a of misses) assert.deepEqual(await w.m.handleCheck({ ...a, handle: "x-y" }), never, JSON.stringify(a));
  /* a spent, a withdrawn and an expired invitation alike */
  const d = await w.m.memberAdd({ memberId: "dee", cover: "c", by: "admin" });
  await w.m.enroll({ invite: d.invite, handle: "dee", password: "dee-passphrase-x" });
  const e = await w.m.memberAdd({ memberId: "eve", cover: "c", by: "admin" });
  w.m.inviteWithdraw({ memberId: "eve", by: "admin" });
  const f = await w.m.memberAdd({ memberId: "fay", cover: "c", expiresInDays: 1, by: "admin" });
  const mid = snapshot(w);
  for (const inv of [d.invite, e.invite]) assert.deepEqual(await w.m.handleCheck({ invite: inv, handle: "x-y" }), never);
  t.mock.timers.enable({ apis: ["Date"], now: Date.now() + 2 * 86_400_000 });
  assert.deepEqual(await w.m.handleCheck({ invite: f.invite, handle: "x-y" }), never, "expired");
  t.mock.timers.reset();
  assert.deepEqual(snapshot(w), mid, "a refusal writes nothing");
  /* a revoked member is no longer asked */
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  assert.deepEqual(await w.m.handleCheck({ viewer: V("bob"), handle: "x-y" }), never);
  /* negative controls: the live invitation and an active member are answered */
  assert.equal((await w.m.handleCheck({ invite: w.inv, handle: "x-y" })).ok, true);
  assert.equal((await w.m.handleCheck({ viewer: V("ann"), handle: "x-y" })).ok, true);
  assert.equal((await w.m.handleCheck({ viewer: V("second"), handle: "x-y" })).ok, true, "an administrator is a member");
});

test("R123 R126 handleCheck's window: 60 checks in any 10 minutes per invitation or member, then HANDLE_CHECK_PAUSED before the handle is read; it writes only its count", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.UTC(2026, 9, 9, 12, 0, 0) });
  const w = await handleWorld();
  const counted = snapshot(w, ["handle_check_window"]);
  for (let i = 0; i < 60; i++) assert.equal((await w.m.handleCheck({ invite: w.inv, handle: `h-${i}` })).ok, true, String(i));
  assert.deepEqual(snapshot(w, ["handle_check_window"]), counted, "only the window table is written");
  const p = await w.m.handleCheck({ invite: w.inv, handle: "ann" });
  const row = MEMBERSHIP_CHECKS.HANDLE_CHECK_PAUSED;
  assert.deepEqual([p.ok, p.reason, p.code, p.check, p.translation, p.stated],
    [false, "HANDLE_CHECK_PAUSED", "HANDLE_CHECK_PAUSED", "C-96.48", row.translation,
     "at most 60 handle checks in any 10 minutes for one invitation or one member"]);
  assert.ok(Number.isInteger(p.retryAfter) && p.retryAfter > 0 && p.retryAfter <= 1201, String(p.retryAfter));
  /* before the handle is read: the answer is the same whatever handle is asked, taken, free or not allowed */
  for (const h of ["zzz", "Bad!", "bob"])
    assert.deepEqual(await w.m.handleCheck({ invite: w.inv, handle: h }), p);
  assert.equal(JSON.stringify(p).includes("ann"), false);
  /* per key: another invitation and a member are not paused by this one */
  const other = await w.m.memberAdd({ memberId: "dee", cover: "c", by: "admin" });
  assert.equal((await w.m.handleCheck({ invite: other.invite, handle: "x-y" })).ok, true);
  assert.equal((await w.m.handleCheck({ viewer: V("ann"), handle: "x-y" })).ok, true);
  for (let i = 0; i < 59; i++) await w.m.handleCheck({ viewer: V("ann"), handle: "x-y" });
  assert.equal((await w.m.handleCheck({ viewer: V("ann"), handle: "x-y" })).reason, "HANDLE_CHECK_PAUSED", "per member too");
  /* a paused check is not counted, so the window drains: after retryAfter seconds it answers again */
  t.mock.timers.setTime(Date.now() + p.retryAfter * 1000);
  assert.equal((await w.m.handleCheck({ invite: w.inv, handle: "x-y" })).ok, true, "answered again after retryAfter");
  /* negative control: 59 checks in the window and the 60th is still answered */
  const w2 = await handleWorld();
  for (let i = 0; i < 59; i++) await w2.m.handleCheck({ invite: w2.inv, handle: "x-y" });
  assert.equal((await w2.m.handleCheck({ invite: w2.inv, handle: "x-y" })).ok, true);
});

test("R123 op=handlecheck reads the invitation and the handle from the body and the viewer from the control plane's stamp", async () => {
  const w = await handleWorld();
  assert.equal((await w.ops("", { invite: w.inv, handle: "ann" }).handlecheck()).state, "taken");
  assert.equal((await w.ops(`viewer=${encodeURIComponent(V("ann"))}`, { handle: "bob" }).handlecheck()).state, "taken");
  /* negative control: a viewer in the body is never the stamp; an invitation in the address is never read */
  assert.equal((await w.ops("", { viewer: V("ann"), handle: "bob" }).handlecheck()).reason, "NO_SUCH_INVITATION");
  assert.equal((await w.ops(`invite=${w.inv}&handle=bob`, null).handlecheck()).reason, "NO_SUCH_INVITATION");
});

/* ---------------------------------------------------------------- R125 --------------------------------------------- */

test("R125 registerHandleGuard: one registration whoever makes it, refusals through R81", async () => {
  const w = await world();
  const mal = w.m.registerHandleGuard("publication", "not a function");
  assert.deepEqual([mal.ok, mal.code, mal.check], [false, "LISTENER_MALFORMED", "C-102.11"]);
  assert.equal(w.m.registerHandleGuard("", () => null).code, "LISTENER_MALFORMED");
  assert.deepEqual(w.m.registerHandleGuard("publication", () => null), { ok: true, module: "publication" });
  for (const m of ["publication", "case-carriage"]) {
    const d = w.m.registerHandleGuard(m, () => null);
    assert.deepEqual([d.ok, d.code, d.check, d.module], [false, "LISTENER_DECLARED", "C-102.12", "publication"], m);
  }
});

/* ---------------------------------------------------------------- R126 --------------------------------------------- */

test("R126 HANDLE_CHECK_PAUSED is C-96.48, answered at its act; T46: C-96.49, C-96.50 and C-96.51 are retired, their numbers never reused, and HANDLE_FIXED holds C-96.52", async () => {
  const row = MEMBERSHIP_CHECKS.HANDLE_CHECK_PAUSED;
  assert.ok(Object.isFrozen(row));
  assert.deepEqual([row.check, row.where], ["C-96.48", "src/membership/index.mjs handleCheck > is-handle-check-window"]);
  assert.ok(typeof row.translation === "string" && row.translation.length > 20);
  const all = Object.entries(MEMBERSHIP_CHECKS);
  assert.equal(all.filter(([, r]) => r.check === "C-96.48").length, 1);
  /* the retired: no code and no row */
  for (const code of ["HANDLE_CHANGE_NOT_A_MEMBER", "HANDLE_CHANGE_UNCHECKED"]) assert.equal(code in MEMBERSHIP_CHECKS, false, code);
  for (const check of ["C-96.49", "C-96.50", "C-96.51"])
    assert.equal(all.filter(([, r]) => r.check === check).length, 0, `${check} is never reused`);
  /* negative control: HANDLE_FIXED's one row is C-96.52, and C-96.47 is still NO_SUCH_MEMBER's */
  assert.equal(MEMBERSHIP_CHECKS.HANDLE_FIXED.check, "C-96.52");
  assert.equal(MEMBERSHIP_CHECKS.NO_SUCH_MEMBER.check, "C-96.47");
});

/* ---------------------------------------------------------------- R16, R17, R57 ------------------------------------ */

test("R16 enroll refuses HANDLE_TAKEN against every member's current handle and every handle a member held before", async () => {
  const w = await handleWorld();
  earlierHandle(w, "ann", "ann-new");
  for (const h of ["ann", "ann-new", "bob"])
    assert.deepEqual(await w.m.enroll({ invite: w.inv, handle: h, password: "cal-passphrase-x" }),
      { ok: false, reason: "HANDLE_TAKEN", handle: h }, h);
  assert.equal(w.row(`SELECT status FROM members WHERE member_id='cal'`).status, "invited", "nothing written");
  /* negative control: a handle never held enrols */
  assert.deepEqual(await w.m.enroll({ invite: w.inv, handle: "cal", password: "cal-passphrase-x" }),
    { ok: true, memberId: "cal", handle: "cal" });
});

test("R57 a handle history row is never deleted or rewritten: a revocation, a reactivation and a refused change leave it", async () => {
  const w = await handleWorld();
  earlierHandle(w, "ann", "ann-2");
  earlierHandle(w, "ann", "ann");
  const first = w.rows(`SELECT * FROM handle_history ORDER BY seq`);
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  w.m.memberSet({ memberId: "ann", status: "active", by: "admin" });
  w.m.handleChange({ handle: "ann-3", by: "ann" });
  w.m.migrate();
  assert.deepEqual(w.rows(`SELECT * FROM handle_history ORDER BY seq`), first, "unchanged, nothing appended");
  assert.equal(first.length, 2);
  assert.ok(w.declared[0].opts.exempt.includes("handle_history"), "exempt from purge with the members (R115)");
  /* negative control: the member row stays, with its handle (R57's first sentence) */
  assert.equal(w.row(`SELECT handle FROM members WHERE member_id='ann'`).handle, "ann");
});

test("R126 R112 the handle words name no plane, server, copy or instance", () => {
  for (const code of ["HANDLE_CHECK_PAUSED", "HANDLE_FIXED"])
    assert.doesNotMatch(MEMBERSHIP_CHECKS[code].translation, /\b(cop(y|ies)|instances?|planes?|servers?)\b/i, code);
  assert.equal(typeof Membership.HANDLE_CHECK_STATED, "string");
});

/* ---------------------------------------------------------------- R127 (K2404) ------------------------------------- */

test("R127 joinedParticipants lists every participant joined or leaving, whatever their status, with the owner flag and the instant they joined", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.UTC(2026, 9, 9, 12, 0, 0) });
  const w = await world().group("ann", "bob", "cal", "dee");
  w.project("PROJ-1");
  w.m.projectClaimOwner({ projectId: "PROJ-1", memberId: "ann" });
  const t0 = new Date().toISOString();
  for (const h of ["bob", "cal", "dee"]) w.m.projectInvite({ projectId: "PROJ-1", handle: h, by: "ann" });
  t.mock.timers.setTime(Date.UTC(2026, 9, 9, 13, 0, 0));
  const t1 = new Date().toISOString();
  w.m.projectJoin({ projectId: "PROJ-1", by: "bob" });
  w.m.projectJoin({ projectId: "PROJ-1", by: "cal" });
  w.m.projectLeave({ projectId: "PROJ-1", by: "cal" });
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  const before = snapshot(w);
  assert.deepEqual(w.m.joinedParticipants("PROJ-1"), [
    { member: "ann", owner: true, since: t0 },
    { member: "bob", owner: false, since: t1 },     // revoked, still listed: whatever the member's status
    { member: "cal", owner: false, since: t1 },     // leaving is listed (R54's set)
  ]);
  assert.deepEqual(snapshot(w), before, "writes nothing");
  /* a second join of a joined row keeps the instant it joined */
  t.mock.timers.setTime(Date.UTC(2026, 9, 9, 14, 0, 0));
  w.m.projectJoin({ projectId: "PROJ-1", by: "ann" });
  assert.equal(w.m.joinedParticipants("PROJ-1")[0].since, t0);
  /* a row joined before T40 recorded the instant reads null */
  w.sql.exec(`UPDATE project_participants SET joined_at=NULL WHERE member_id='ann'`);
  assert.equal(w.m.joinedParticipants("PROJ-1")[0].since, null);
  /* negative controls: an invited participant is not listed; an unknown project, and anything that is not an id, is [] */
  assert.ok(!w.m.joinedParticipants("PROJ-1").some((p) => p.member === "dee"), "invited, not joined");
  for (const id of ["PROJ-NONE", "", null, undefined, 7, {}]) assert.deepEqual(w.m.joinedParticipants(id), [], String(id));
  /* R118's rescue joins: the invited dee becomes a joined owner, joined at the act's instant */
  w.m.participationWrite("rescue", { projectId: "PROJ-1", memberId: "dee", by: "admin", at: "2026-10-09T15:00:00.000Z" });
  assert.deepEqual(w.m.joinedParticipants("PROJ-1").find((p) => p.member === "dee"),
    { member: "dee", owner: true, since: "2026-10-09T15:00:00.000Z" });
});
