/* T40 (T40-M; N797, N799, N812; DEC-184, DEC-186; K1881, K2373, K2376, K2394): R122 `notTheOwner` and R55's owner
   refusal through it; R123 `handleCheck`, R124 `handleChange` with the handle history, R125 `registerHandleGuard`, R126's
   rows; R16, R17 and R57 as amended. Each id is tested here explicitly, with a negative control (K874: older tests name
   some of these ids already). Every test drives the module at its interface. */
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
  for (const k of ["handle.free", "handle.taken", "handle.characters", "handle.fixed"]) assert.equal(HANDLE_WORDS[k], en(k), k);
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
  assert.equal(w.m.handleChange({ handle: "ann-new", by: "ann" }).ok, true);   // "ann" is now ann's earlier handle
  const current = await w.m.handleCheck({ invite: w.inv, handle: "bob" });
  const earlier = await w.m.handleCheck({ invite: w.inv, handle: "ann" });
  assert.deepEqual({ ...earlier, handle: "x", suggestion: "x" }, { ...current, handle: "x", suggestion: "x" });
  for (const a of [current, earlier]) assert.doesNotMatch(JSON.stringify(a), /"(member|memberId|member_id|by|holder|formerly)"/);
  /* a member's own earlier handle is free to them (they may take it back), taken to everyone else */
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

/* ---------------------------------------------------------------- R124, R125 --------------------------------------- */

test("R124 handleChange refuses in order, each refusal writing nothing", async () => {
  const w = await handleWorld();
  const before = snapshot(w);
  const row = (code) => MEMBERSHIP_CHECKS[code];
  for (const by of [null, "", "admin", `${MACHINE_CLASS_PREFIX}admin`, "nobody", "cal"]) {
    const r = w.m.handleChange({ handle: "Bad!", by });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
      [false, "HANDLE_CHANGE_NOT_A_MEMBER", "HANDLE_CHANGE_NOT_A_MEMBER", "C-96.49", row("HANDLE_CHANGE_NOT_A_MEMBER").translation],
      String(by));
  }
  assert.equal(w.m.handleChange({ handle: "  ", by: "ann" }).reason, "NO_HANDLE");
  assert.equal(w.m.handleChange({ handle: "Ann!", by: "ann" }).reason, "BAD_HANDLE");
  assert.equal(w.m.handleChange({ handle: "a", by: "ann" }).reason, "BAD_HANDLE");
  assert.equal(w.m.handleChange({ handle: "bob", by: "ann" }).reason, "HANDLE_TAKEN");
  assert.deepEqual(snapshot(w), before, "nothing written");
  /* a revoked member is no longer a member who may change */
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  assert.equal(w.m.handleChange({ handle: "bob-x", by: "bob" }).reason, "HANDLE_CHANGE_NOT_A_MEMBER");
  /* negative control: the same call from an active member with a free handle succeeds */
  assert.equal(w.m.handleChange({ handle: "ann-x", by: "ann" }).ok, true);
});

test("R124 R125 a member whose work is in a published case is refused HANDLE_FIXED naming the case; with no guard, or one that cannot answer, HANDLE_CHANGE_UNCHECKED (fail closed)", async () => {
  const words = await wordsJson();
  let answer = { case: "CASE-7", edition: 2 };
  const asked = [];
  const w = await handleWorld({ guard: (a) => { asked.push(a); return typeof answer === "function" ? answer() : answer; } });
  const before = snapshot(w);
  const f = w.m.handleChange({ handle: "ann-x", by: "ann" });
  assert.deepEqual([f.ok, f.reason, f.code, f.check, f.case, f.edition],
    [false, "HANDLE_FIXED", "HANDLE_FIXED", "C-96.50", "CASE-7", 2]);
  assert.equal(f.translation, words.find((x) => x.key === "handle.fixed").en, "handle.fixed, read by key");
  assert.match(f.detail, /CASE-7/);
  assert.deepEqual(asked, [{ memberId: "ann" }], "the guard is asked with the member, once");
  /* HANDLE_FIXED comes before HANDLE_TAKEN */
  assert.equal(w.m.handleChange({ handle: "bob", by: "ann" }).reason, "HANDLE_FIXED");
  for (const a of [{ unreadable: true }, undefined, 0, false, "CASE-7", {}, { case: "" }, { edition: 1 },
                   { case: "CASE-7", unreadable: true }, () => { throw new Error("down"); }, () => Promise.resolve(null)]) {
    answer = a;
    const u = w.m.handleChange({ handle: "ann-x", by: "ann" });
    assert.deepEqual([u.reason, u.code, u.check, u.translation],
      ["HANDLE_CHANGE_UNCHECKED", "HANDLE_CHANGE_UNCHECKED", "C-96.51", MEMBERSHIP_CHECKS.HANDLE_CHANGE_UNCHECKED.translation],
      String(a));
  }
  assert.deepEqual(snapshot(w), before, "nothing written");
  const none = await handleWorld({ omitGuard: true });
  assert.equal(none.m.handleChange({ handle: "ann-x", by: "ann" }).reason, "HANDLE_CHANGE_UNCHECKED", "no guard registered");
  /* negative control: the guard answering null lets the change through */
  answer = null;
  assert.equal(w.m.handleChange({ handle: "ann-x", by: "ann" }).ok, true);
});

test("R124 a change: one act, the history appended, earlier handles kept for their member, unchanged writes nothing; the next request reads the new handle", async () => {
  const w = await handleWorld();
  const before = snapshot(w);
  assert.deepEqual(w.m.handleChange({ handle: " ann ", by: "ann" }), { ok: true, unchanged: true });
  assert.deepEqual(snapshot(w), before, "unchanged writes nothing");
  const c = w.m.handleChange({ handle: "mai-k", by: "ann" });
  assert.deepEqual(c, { ok: true, handle: "mai-k", formerly: ["ann"] });
  const h = w.rows(`SELECT member_id, from_handle, to_handle, at FROM handle_history`);
  assert.equal(h.length, 1);
  assert.deepEqual([h[0].member_id, h[0].from_handle, h[0].to_handle], ["ann", "ann", "mai-k"]);
  assert.ok(!Number.isNaN(Date.parse(h[0].at)));
  assert.equal(w.m.sessionRights("member:ann").handle, "mai-k", "credentials R5 reads R92 at each call");
  assert.deepEqual(w.m.memberFacts("ann").handle, "mai-k");
  assert.equal(w.m.memberByHandle("mai-k").member_id, "ann");
  assert.equal(w.m.memberByHandle("ann"), null, "R119 answers the current handle only");
  /* an earlier handle stays taken for every other member, at a change and at enrolment */
  assert.equal(w.m.handleChange({ handle: "ann", by: "bob" }).reason, "HANDLE_TAKEN");
  assert.equal((await w.m.enroll({ invite: w.inv, handle: "ann", password: "cal-passphrase-x" })).reason, "HANDLE_TAKEN");
  /* and its member may take it back */
  assert.deepEqual(w.m.handleChange({ handle: "ann", by: "ann" }), { ok: true, handle: "ann", formerly: ["mai-k"] });
  /* negative control: a handle no one held is free to another */
  assert.equal(w.m.handleChange({ handle: "bob-2", by: "bob" }).ok, true);
});

test("R124 op=handlechange takes the handle from the body and `by` from the control plane's stamp", async () => {
  const w = await handleWorld();
  assert.equal(w.ops("by=ann", { handle: "ann-z", by: "bob" }).handlechange().ok, true);
  assert.equal(w.m.memberFacts("ann").handle, "ann-z");
  assert.equal(w.m.memberFacts("bob").handle, "bob", "a body's `by` is never the stamp");
  /* negative control: with no stamp the caller is no member */
  assert.equal(w.ops("", { handle: "bob-z", by: "bob" }).handlechange().reason, "HANDLE_CHANGE_NOT_A_MEMBER");
});

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

test("R126 the handle codes are rows of C-96, the next free numbers (C-96.48 to C-96.51), each answered at its act", async () => {
  const words = await wordsJson();
  const want = { HANDLE_CHECK_PAUSED: "C-96.48", HANDLE_CHANGE_NOT_A_MEMBER: "C-96.49", HANDLE_FIXED: "C-96.50",
                 HANDLE_CHANGE_UNCHECKED: "C-96.51" };
  for (const [code, check] of Object.entries(want)) {
    const row = MEMBERSHIP_CHECKS[code];
    assert.ok(Object.isFrozen(row), code);
    assert.equal(row.check, check, code);
    assert.match(row.where, /^src\/membership\/index\.mjs (handleCheck|handleChange) > is-/, code);
    assert.ok(typeof row.translation === "string" && row.translation.length > 20, code);
  }
  assert.equal(MEMBERSHIP_CHECKS.HANDLE_FIXED.translation, words.find((x) => x.key === "handle.fixed").en);
  assert.equal(MEMBERSHIP_CHECKS.HANDLE_FIXED.translation, "Your handle is fixed: your work is in a published case ({case}).");
  assert.equal(MEMBERSHIP_CHECKS.HANDLE_CHANGE_UNCHECKED.translation,
    "Whether your work is in a published case could not be checked, so your handle was not changed. Try again.");
  /* negative control: no other row of this module holds those numbers, and C-96.47 is still NO_SUCH_MEMBER's */
  const all = Object.entries(MEMBERSHIP_CHECKS);
  for (const check of Object.values(want)) assert.equal(all.filter(([, r]) => r.check === check).length, 1, check);
  assert.equal(MEMBERSHIP_CHECKS.NO_SUCH_MEMBER.check, "C-96.47");
});

/* ---------------------------------------------------------------- R16, R17, R57 ------------------------------------ */

test("R16 enroll refuses HANDLE_TAKEN against every member's current handle and every handle a member held before", async () => {
  const w = await handleWorld();
  w.m.handleChange({ handle: "ann-new", by: "ann" });
  for (const h of ["ann", "ann-new", "bob"])
    assert.deepEqual(await w.m.enroll({ invite: w.inv, handle: h, password: "cal-passphrase-x" }),
      { ok: false, reason: "HANDLE_TAKEN", handle: h }, h);
  assert.equal(w.row(`SELECT status FROM members WHERE member_id='cal'`).status, "invited", "nothing written");
  /* negative control: a handle never held enrols */
  assert.deepEqual(await w.m.enroll({ invite: w.inv, handle: "cal", password: "cal-passphrase-x" }),
    { ok: true, memberId: "cal", handle: "cal" });
});

test("R17 memberList's rows carry `formerly`, the member's earlier handles latest first, [] for none, to every caller", async () => {
  const w = await handleWorld();
  w.m.handleChange({ handle: "ann-2", by: "ann" });
  w.m.handleChange({ handle: "ann-3", by: "ann" });
  w.m.handleChange({ handle: "ann", by: "ann" });   // back to the first: it is current, so not "formerly"
  for (const administer of [undefined, true]) {
    const rows = w.m.memberList({ administer }).members;
    const of = (id) => rows.find((r) => r.member_id === id);
    assert.deepEqual(of("ann").formerly, ["ann-3", "ann-2"], String(administer));
    assert.deepEqual(of("bob").formerly, [], "none");
    assert.deepEqual(of("cal").formerly, [], "an invitee holds none");
  }
  assert.deepEqual(w.ops("").memberlist().members.find((r) => r.member_id === "ann").formerly, ["ann-3", "ann-2"]);
  /* negative control: formerly never names another member's handle, and R92 and R68 answer the current handle only */
  assert.ok(!w.m.memberList({}).members.find((r) => r.member_id === "bob").formerly.includes("ann-2"));
  assert.equal(w.m.sessionRights("member:ann").handle, "ann");
  assert.equal("formerly" in w.m.memberFacts("ann"), false);
});

test("R57 a handle history row is never deleted or rewritten: a revocation, a reactivation and later changes leave it", async () => {
  const w = await handleWorld();
  w.m.handleChange({ handle: "ann-2", by: "ann" });
  const first = w.rows(`SELECT * FROM handle_history ORDER BY seq`);
  w.m.handleChange({ handle: "ann", by: "ann" });
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  w.m.memberSet({ memberId: "ann", status: "active", by: "admin" });
  const after = w.rows(`SELECT * FROM handle_history ORDER BY seq`);
  assert.deepEqual(after.slice(0, first.length), first, "earlier rows unchanged");
  assert.equal(after.length, 2, "appended, never replaced");
  assert.ok(w.declared[0].opts.exempt.includes("handle_history"), "exempt from purge with the members (R115)");
  /* negative control: the member row stays, with its handle (R57's first sentence) */
  assert.equal(w.row(`SELECT handle FROM members WHERE member_id='ann'`).handle, "ann");
});

test("R126 R124 the handle words name no plane, server, copy or instance (R112)", () => {
  for (const code of ["HANDLE_CHECK_PAUSED", "HANDLE_CHANGE_NOT_A_MEMBER", "HANDLE_FIXED", "HANDLE_CHANGE_UNCHECKED"])
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
