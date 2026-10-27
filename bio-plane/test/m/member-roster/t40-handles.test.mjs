/* T40 (T40-M; N797, N799, N812; DEC-184, DEC-186; K1881, K2373, K2376, K2394): R50 `handleCheck`, R51 `registerHandleGuard`,
   R52's rows; R13, R14 and R21 as amended. (`notTheOwner` and `joinedParticipants` are `membership`'s.) T46
   (T46-4; DEC-196, DEC-197; K2903): `membership` R124's change of handle is retired (its refusal, R53, is `t46-handles-doors.test.mjs`'s),
   so the handle history these tests read is seeded as the changes made before its retirement left it. Each id is tested
   here explicitly, with a negative control (K874: older tests name some of these ids already). Every test drives the
   module at its interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world, V } from "./fixture.mjs";
import { Members, MEMBER_EXEMPT_TABLES } from "../../../src/member-roster/index.mjs";
import { MEMBER_ROSTER_ROWS } from "../../../src/member-roster/checks.mjs";
const { MEMBERSHIP_CHECKS } = MEMBER_ROSTER_ROWS;
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

/* ---------------------------------------------------------------- R50 ---------------------------------------------- */

test("R50 handleCheck with a live invitation: free, taken (with the smallest free suggestion) or not allowed (naming each problem), with the words of handle.free, handle.taken and handle.characters read by key", async () => {
  const w = await handleWorld();
  const words = await wordsJson();
  const en = (k) => words.find((x) => x.key === k).en;
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

test("R50 handleCheck never says who holds a handle or that it was someone's earlier one: taken is one answer", async () => {
  const w = await handleWorld();
  earlierHandle(w, "ann", "ann-new");   // "ann" is ann's earlier handle, from a change made before T46
  const current = await w.m.handleCheck({ invite: w.inv, handle: "bob" });
  const earlier = await w.m.handleCheck({ invite: w.inv, handle: "ann" });
  assert.deepEqual({ ...earlier, handle: "x", suggestion: "x" }, { ...current, handle: "x", suggestion: "x" });
  for (const a of [current, earlier]) assert.doesNotMatch(JSON.stringify(a), /"(member|memberId|member_id|by|holder|formerly)"/);
  /* R142 (1) (T47): a member's own earlier handle, and their current one, read taken to them as to everyone else */
  assert.equal((await w.m.handleCheck({ viewer: V("ann"), handle: "ann" })).state, "taken");
  assert.equal((await w.m.handleCheck({ viewer: V("ann"), handle: "ann-new" })).state, "taken");
  assert.equal((await w.m.handleCheck({ viewer: V("bob"), handle: "ann" })).state, "taken");
  /* negative control: a handle nobody held is free */
  assert.equal((await w.m.handleCheck({ invite: w.inv, handle: "zed" })).state, "free");
});

test("R50 handleCheck is asked with a live invitation or by an active member; anything else answers R12's NO_SUCH_INVITATION byte for byte, writing nothing", async (t) => {
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

test("R50 R52 handleCheck's window: 60 checks in any 10 minutes per invitation or member, then HANDLE_CHECK_PAUSED before the handle is read; it writes only its count", async (t) => {
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

test("R50 op=handlecheck reads the invitation and the handle from the body and the viewer from the control plane's stamp", async () => {
  const w = await handleWorld();
  assert.equal((await w.ops("", { invite: w.inv, handle: "ann" }).handlecheck()).state, "taken");
  assert.equal((await w.ops(`viewer=${encodeURIComponent(V("ann"))}`, { handle: "bob" }).handlecheck()).state, "taken");
  /* negative control: a viewer in the body is never the stamp; an invitation in the address is never read */
  assert.equal((await w.ops("", { viewer: V("ann"), handle: "bob" }).handlecheck()).reason, "NO_SUCH_INVITATION");
  assert.equal((await w.ops(`invite=${w.inv}&handle=bob`, null).handlecheck()).reason, "NO_SUCH_INVITATION");
});

/* ---------------------------------------------------------------- R51 ---------------------------------------------- */

test("R51 registerHandleGuard: one registration whoever makes it, refusals through R26", async () => {
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

/* ---------------------------------------------------------------- R52 ---------------------------------------------- */

test("R52 HANDLE_CHECK_PAUSED is C-96.48, answered at its act; T46: C-96.49, C-96.50 and C-96.51 are retired, their numbers never reused, and HANDLE_FIXED holds C-96.52", async () => {
  const row = MEMBERSHIP_CHECKS.HANDLE_CHECK_PAUSED;
  assert.ok(Object.isFrozen(row));
  assert.deepEqual([row.check, row.where], ["C-96.48", "src/member-roster/index.mjs handleCheck > is-handle-check-window"]);
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

test("R13 enroll refuses HANDLE_TAKEN against every member's current handle and every handle a member held before", async () => {
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

test("R21 a handle history row is never deleted or rewritten: a revocation, a reactivation and a refused change leave it", async () => {
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
  assert.ok(MEMBER_EXEMPT_TABLES.includes("handle_history"), "exempt from purge with the members (R66)");
  /* negative control: the member row stays, with its handle (R57's first sentence) */
  assert.equal(w.row(`SELECT handle FROM members WHERE member_id='ann'`).handle, "ann");
});

test("R52 R65 the handle words name no plane, server, copy or instance", () => {
  for (const code of ["HANDLE_CHECK_PAUSED", "HANDLE_FIXED"])
    assert.doesNotMatch(MEMBERSHIP_CHECKS[code].translation, /\b(cop(y|ies)|instances?|planes?|servers?)\b/i, code);
  assert.equal(typeof Members.HANDLE_CHECK_STATED, "string");
});
