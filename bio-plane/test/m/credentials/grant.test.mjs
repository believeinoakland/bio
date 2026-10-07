/* The ask grant (R27, R28, R31; Q1-3, K1450, K1505 (14), K1685) and a standing question's (R32; N580, K1609), at the
   interface: an ask's minted at the member's own act under their own live session, a standing question's for answers
   with no session; each short-lived and read-only, writing no run row, no observation row and no read log; admitting
   only the ops on its class's list, only as reads; ending with its time, its session (an ask's), the member's
   revocation and, for a standing question's, the member's removal of their reference. A member served by the group's
   key (R35) is granted once they have read its notice (R36). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD, sha } from "./fixture.mjs";
import { ACCOUNT_CHECKS, AI_GRANT_OPS, AI_GRANT_TTL_SECONDS } from "../../../src/credentials/index.mjs";

const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const refusal = (code) => ({ ok: false, reason: code, code, check: ACCOUNT_CHECKS[code].check, translation: ACCOUNT_CHECKS[code].translation });

async function grantWorld() {
  const w = await world().group("ann", "bob", "dee");
  for (const id of ["ann", "bob", "dee"])
    assert.equal((await w.c.accountReferenceSet({ member: id, kind: "apikey", secret: `sk-${id}`, by: id })).ok, true);
  w.session = {};
  for (const id of ["ann", "bob", "dee"]) w.session[id] = (await w.c.login({ role: `member:${id}`, password: PASSWORD(id) })).token;
  w.session.second = (await w.c.login({ role: "member:second", password: PASSWORD("second") })).token;
  return w;
}

test("R27 aiGrantMint: refusals as R22 and NO_ACCOUNT, each minting nothing; minted once at the member's act, `{token, expires}`, expiring AI_GRANT_TTL_SECONDS on; no run row, no observation row, no read log", async () => {
  const w = await grantWorld();
  w.c.accountReferenceRemove({ member: "bob", by: "bob" });
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  const before = w.snapshot();
  for (const [member, by, session, code] of [
    ["ann", null, w.session.ann, "MACHINE_CANNOT_HOLD_ACCOUNT"], ["ann", "class:ai", w.session.ann, "MACHINE_CANNOT_HOLD_ACCOUNT"],
    ["ann", "bob", w.session.ann, "NOT_YOUR_ACCOUNT"], ["ann", "second", w.session.second, "NOT_YOUR_ACCOUNT"],
    ["ann", "admin", w.session.ann, "NOT_YOUR_ACCOUNT"],
    ["ann", "ann", w.session.bob, "NOT_YOUR_ACCOUNT"],          // another member's session
    ["ann", "ann", null, "NOT_YOUR_ACCOUNT"], ["ann", "ann", "no-such-session", "NOT_YOUR_ACCOUNT"],
    ["dee", "dee", w.session.dee, "ACCOUNT_MEMBER_NOT_ACTIVE"], ["bob", "bob", w.session.bob, "NO_ACCOUNT"]])
    assert.deepEqual(shape(await w.c.aiGrantMint({ member, by, session })), refusal(code), `${member} ${by}`);
  assert.equal(w.snapshot(), before, "no refusal mints");
  assert.equal(AI_GRANT_TTL_SECONDS, 900);
  const t0 = Date.now();
  const g = await w.c.aiGrantMint({ member: "ann", by: "member:ann", session: w.session.ann });
  const t1 = Date.now();
  assert.deepEqual(Object.keys(g).sort(), ["expires", "ok", "token"]);
  assert.match(g.token, /^[0-9a-f]{64}$/);
  assert.ok(g.expires >= t0 + AI_GRANT_TTL_SECONDS * 1000 && g.expires <= t1 + AI_GRANT_TTL_SECONDS * 1000);
  /* the token answered once: only its digest is kept */
  assert.ok(!w.snapshot().includes(g.token));
  /* it writes only its own grant row: no run row, no observation row, no read log */
  const after = JSON.parse(w.snapshot());
  const was = Object.fromEntries(JSON.parse(before));
  const changed = after.filter(([name, rows]) => JSON.stringify(rows) !== JSON.stringify(was[name] ?? [])).map(([n]) => n);
  assert.deepEqual(changed, ["ai_grants"]);
  assert.equal((await w.c.aiGrantAdmit({ token: g.token, op: "search" })).viewer, "member:ann", "its viewer is the member");
  assert.deepEqual(JSON.parse(w.snapshot()), after, "admitting reads keeps no read log");
  /* a grant never outlives the session it was minted under */
  w.sql.exec(`UPDATE sessions SET expires=? WHERE token_sha=?`, Date.now() + 5000, sha(w.session.ann));
  const short = await w.c.aiGrantMint({ member: "ann", by: "ann", session: w.session.ann });
  assert.ok(short.expires <= Date.now() + 5000);
});

test("R27 a grant ends at its time, with its session, and with the member's revocation (R16)", async () => {
  const w = await grantWorld();
  const mint = async (id) => (await w.c.aiGrantMint({ member: id, by: id, session: w.session[id] })).token;
  const [a, b, d] = [await mint("ann"), await mint("bob"), await mint("dee")];
  for (const t of [a, b, d]) assert.equal((await w.c.aiGrantAdmit({ token: t, op: "search" })).ok, true);
  w.sql.exec(`UPDATE ai_grants SET expires=? WHERE member_id='ann'`, Date.now() - 1);
  assert.deepEqual(shape(await w.c.aiGrantAdmit({ token: a, op: "search" })), refusal("GRANT_NOT_HELD"), "expired");
  w.sql.exec(`DELETE FROM sessions WHERE token_sha=?`, sha(w.session.bob));         // its session gone
  assert.deepEqual(shape(await w.c.aiGrantAdmit({ token: b, op: "search" })), refusal("GRANT_NOT_HELD"), "its session ended");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  assert.deepEqual(shape(await w.c.aiGrantAdmit({ token: d, op: "search" })), refusal("GRANT_NOT_HELD"), "revoked");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM ai_grants WHERE member_id='dee'`).n, 0);
  for (const t of [null, "", "nope", 7]) assert.deepEqual(shape(await w.c.aiGrantAdmit({ token: t, op: "search" })), refusal("GRANT_NOT_HELD"));
});

test("R28 AI_GRANT_OPS names each op as the plane routes it: `rule` held, the six renamed ops held by their routed names (`linesof` and `structureat` for `lines`), the old names gone; 27 entries, every other entry unchanged", () => {
  assert.deepEqual([...AI_GRANT_OPS], [
    "calculation", "career", "committedagainstpaid", "dutiesof", "dutyoccurrences", "entity", "entitybyalias",
    "eventsfor", "explore", "frontier", "holderat", "linesof", "meaningrows", "money", "moneyof", "profiles", "relation",
    "resolutions", "rule", "search", "searchfields", "standard", "standardinforce", "standards", "strengthbarof",
    "structureat", "timeline"]);
  for (const gone of ["careerof", "occurrences", "lines", "duties", "calculations", "moneyfacts"])
    assert.ok(!AI_GRANT_OPS.includes(gone), gone);
  for (const held of ["rule", "career", "dutyoccurrences", "linesof", "structureat", "dutiesof", "calculation", "money"])
    assert.ok(AI_GRANT_OPS.includes(held), held);
});

test("R28 AI_GRANT_OPS is frozen and sorted; a request under a grant is admitted only for an op on it and only as a read; anything else GRANT_OP_REFUSED naming the op", async () => {
  const w = await grantWorld();
  const g = (await w.c.aiGrantMint({ member: "ann", by: "ann", session: w.session.ann })).token;
  assert.ok(Object.isFrozen(AI_GRANT_OPS));
  assert.deepEqual([...AI_GRANT_OPS], [...AI_GRANT_OPS].sort());
  assert.equal(new Set(AI_GRANT_OPS).size, AI_GRANT_OPS.length);
  const before = w.snapshot();
  for (const op of AI_GRANT_OPS) {
    const r = await w.c.aiGrantAdmit({ token: g, op });
    assert.deepEqual({ ...r, expires: null }, { ok: true, member: "ann", viewer: "member:ann", expires: null }, op);
    const asWrite = await w.c.aiGrantAdmit({ token: g, op, write: true });
    assert.deepEqual([shape(asWrite), asWrite.op], [refusal("GRANT_OP_REFUSED"), op], `${op} as a write`);
  }
  for (const op of ["promote", "capture", "export", "memberlist", "sourcereadlog", "airunopen", "accountreference", "login", "",
                    null, "Search"]) {
    const r = await w.c.aiGrantAdmit({ token: g, op });
    assert.deepEqual([shape(r), r.op], [refusal("GRANT_OP_REFUSED"), typeof op === "string" ? op : null], String(op));
  }
  assert.equal(w.snapshot(), before, "admission writes nothing");
  /* the list holds no sources op, no member history, no administrative and no export op (answers R1) */
  assert.deepEqual(AI_GRANT_OPS.filter((op) => /^source|^member|^admin|export|purge|audit|aicredential/.test(op)), []);
});

test("R27 R35 R36 a member with no reference of their own is granted under the group's key only while it is held and on, and once they have read its notice; NO_ACCOUNT only when no account serves them", async () => {
  const w = await grantWorld();
  w.c.accountReferenceRemove({ member: "bob", by: "bob" });
  const mint = (id) => w.c.aiGrantMint({ member: id, by: id, session: w.session[id] });
  assert.deepEqual(shape(await mint("bob")), refusal("NO_ACCOUNT"), "no key at all");
  await w.c.groupKeySet({ key: "sk-group-1", by: "admin" });
  assert.deepEqual(shape(await mint("bob")), refusal("NO_ACCOUNT"), "the group key held but off");
  w.c.groupKeySwitch({ on: true, by: "second" });
  const before = w.snapshot();
  assert.deepEqual(shape(await mint("bob")), refusal("GROUP_KEY_NOTICE_DUE"), "served by the group key, its notice unread");
  assert.equal(w.snapshot(), before, "a refusal mints nothing");
  /* ann holds her own reference: the group key's notice never holds her back */
  assert.equal((await mint("ann")).ok, true);
  assert.deepEqual(w.c.groupKeyNoticeSeen({ member: "bob", by: "bob" }), { ok: true, seen: true, already: false });
  const g = await mint("bob");
  assert.equal(g.ok, true);
  assert.equal((await w.c.aiGrantAdmit({ token: g.token, op: "search" })).viewer, "member:bob");
  /* the refusals R22 names still come first */
  assert.deepEqual(shape(await w.c.aiGrantMint({ member: "bob", by: "second", session: w.session.second })), refusal("NOT_YOUR_ACCOUNT"));
  w.c.groupKeySwitch({ on: false, by: "admin" });
  assert.deepEqual(shape(await mint("bob")), refusal("NO_ACCOUNT"), "switched off again");
});

test("R31 aiGrantHeld answers {ok, member, viewer, expires} exactly when R28 would admit a listed read under the token, asking about no op; else GRANT_NOT_HELD (C-29.24); it writes nothing and never throws", async () => {
  const w = await grantWorld();
  const mint = async (id) => (await w.c.aiGrantMint({ member: id, by: id, session: w.session[id] })).token;
  const [a, b, d] = [await mint("ann"), await mint("bob"), await mint("dee")];
  await w.c.groupKeySet({ key: "sk-g", by: "admin" });
  w.c.groupSwitchSet({ switch: "standing", on: true, by: "admin" });
  w.c.accountSwitchSet({ member: "ann", switch: "standing", on: true, by: "ann" });
  const st = (await w.c.aiGrantMintStanding({ member: "ann", question: "what changed?" })).token;
  const agree = async (token, label) => {
    const held = await w.c.aiGrantHeld({ token });
    const admitted = await w.c.aiGrantAdmit({ token, op: AI_GRANT_OPS[0] });
    if (admitted.ok) assert.deepEqual(held, admitted, label);
    else assert.deepEqual(shape(held), refusal("GRANT_NOT_HELD"), label);
    for (const op of AI_GRANT_OPS) assert.equal((await w.c.aiGrantAdmit({ token, op })).ok, held.ok, `${label} ${op}`);
    return held;
  };
  const before = w.snapshot();
  for (const [t, who] of [[a, "ann"], [b, "bob"], [d, "dee"], [st, "ann"]]) {
    const h = await agree(t, who);
    assert.deepEqual(Object.keys(h).sort(), ["expires", "member", "ok", "viewer"]);
    assert.deepEqual([h.ok, h.member, h.viewer], [true, who, `member:${who}`]);
  }
  assert.equal(w.snapshot(), before, "it writes nothing, keeps no read log");
  w.sql.exec(`UPDATE ai_grants SET expires=? WHERE member_id='ann' AND kind='ask'`, Date.now() - 1);
  assert.equal((await agree(a, "expired")).ok, false);
  w.sql.exec(`DELETE FROM sessions WHERE token_sha=?`, sha(w.session.bob));
  assert.equal((await agree(b, "signed out")).ok, false);
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  assert.equal((await agree(d, "revoked")).ok, false);
  assert.equal((await agree(st, "a standing grant needs no session")).ok, true);
  for (const t of [null, undefined, "", "nope", 7, {}, ["x"]]) assert.deepEqual(shape(await w.c.aiGrantHeld({ token: t })), refusal("GRANT_NOT_HELD"), String(t));
  assert.deepEqual(shape(await w.c.aiGrantHeld()), refusal("GRANT_NOT_HELD"));
  /* never throws: a store it cannot read answers not held */
  const broken = Object.create(Object.getPrototypeOf(w.c));
  assert.deepEqual(shape(await w.c.aiGrantHeld.call(broken, { token: a })), refusal("GRANT_NOT_HELD"));
});

test("R32 aiGrantMintStanding: refusals in order (not active, NO_ACCOUNT, STANDING_SWITCH_OFF, NO_QUESTION), each with its row and minting nothing; a grant shaped as R27's with no session, admitted only for AI_GRANT_OPS as reads; ended by revocation (R16) and by removing the reference (R22); R27 unchanged", async () => {
  const w = await grantWorld();
  await w.m.memberAdd({ memberId: "cal", cover: "c", by: "admin" });
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  w.c.accountReferenceRemove({ member: "bob", by: "bob" });
  const standing = (member, question = "what is new on the budget?") => w.c.aiGrantMintStanding({ member, question });
  const before = w.snapshot();
  for (const member of ["dee", "cal", "ghost", "admin", "class:ai", null, ""])
    assert.deepEqual(shape(await standing(member)), refusal("ACCOUNT_MEMBER_NOT_ACTIVE"), String(member));
  assert.deepEqual(shape(await standing("bob")), refusal("NO_ACCOUNT"), "no reference, no group key");
  assert.deepEqual(shape(await standing("ann")), refusal("STANDING_SWITCH_OFF"), "her own account's switch is off");
  assert.equal(w.snapshot(), before, "no refusal mints");
  w.c.accountSwitchSet({ member: "ann", switch: "standing", on: true, by: "ann" });
  const on = w.snapshot();
  for (const question of [null, undefined, "", "   ", 7])
    assert.deepEqual(shape(await w.c.aiGrantMintStanding({ member: "ann", question })), refusal("NO_QUESTION"), String(question));
  assert.equal(w.snapshot(), on, "no refusal mints");
  /* the group key's own switch governs a member it serves (R37), not the member's */
  await w.c.groupKeySet({ key: "sk-g", by: "admin" });
  w.c.groupKeySwitch({ on: true, by: "admin" });
  assert.deepEqual(shape(await standing("bob")), refusal("STANDING_SWITCH_OFF"), "the group key's standing switch is off");
  w.c.groupSwitchSet({ switch: "standing", on: true, by: "second" });
  const gb = await standing("bob");
  assert.equal(gb.ok, true, "R32 names no notice refusal: the model call itself goes through accountFor (R35, R36)");
  /* ann's own switch governs her, whatever the group key's says */
  w.c.groupSwitchSet({ switch: "standing", on: false, by: "admin" });
  const snap = w.snapshot();
  const t0 = Date.now();
  const g = await standing("ann");
  const t1 = Date.now();
  assert.deepEqual(Object.keys(g).sort(), ["expires", "ok", "token"]);
  assert.match(g.token, /^[0-9a-f]{64}$/);
  assert.ok(g.expires >= t0 + AI_GRANT_TTL_SECONDS * 1000 && g.expires <= t1 + AI_GRANT_TTL_SECONDS * 1000);
  /* only its digest kept, in its own grant row: no run row, no observation row, no read log */
  assert.ok(!w.snapshot().includes(g.token));
  const after = JSON.parse(w.snapshot()), was = Object.fromEntries(JSON.parse(snap));
  assert.deepEqual(after.filter(([n, rows]) => JSON.stringify(rows) !== JSON.stringify(was[n] ?? [])).map(([n]) => n), ["ai_grants"]);
  assert.deepEqual(w.row(`SELECT member_id, session, kind FROM ai_grants WHERE member_id='ann' AND kind='standing'`),
    { member_id: "ann", session: "", kind: "standing" });
  /* admitted as R27's: its viewer the author, only listed ops, only as reads */
  for (const op of AI_GRANT_OPS) assert.equal((await w.c.aiGrantAdmit({ token: g.token, op })).viewer, "member:ann", op);
  for (const [op, write] of [["search", true], ["promote", false], ["accountreference", false]])
    assert.equal((await w.c.aiGrantAdmit({ token: g.token, op, write })).reason, "GRANT_OP_REFUSED", op);
  /* it ends at once when its member removes their reference (R22); an ask's grant of theirs is not a standing one */
  const ask = (await w.c.aiGrantMint({ member: "ann", by: "ann", session: w.session.ann })).token;
  w.c.accountReferenceRemove({ member: "ann", by: "ann" });
  assert.deepEqual(shape(await w.c.aiGrantAdmit({ token: g.token, op: "search" })), refusal("GRANT_NOT_HELD"));
  assert.equal((await w.c.aiGrantAdmit({ token: ask, op: "search" })).ok, true);
  /* and when its member is revoked (R16) */
  assert.equal((await w.c.aiGrantAdmit({ token: gb.token, op: "search" })).ok, true);
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  assert.deepEqual(shape(await w.c.aiGrantAdmit({ token: gb.token, op: "search" })), refusal("GRANT_NOT_HELD"));
  /* an expired one ends at its time */
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann-2", by: "ann" });
  w.c.accountSwitchSet({ member: "ann", switch: "standing", on: true, by: "ann" });
  const late = (await standing("ann")).token;
  w.sql.exec(`UPDATE ai_grants SET expires=? WHERE kind='standing'`, Date.now() - 1);
  assert.deepEqual(shape(await w.c.aiGrantAdmit({ token: late, op: "search" })), refusal("GRANT_NOT_HELD"));
  /* R27 unchanged: no `by` but the member's own act mints an ask's grant, and it is not routed */
  for (const by of [null, "class:ai", "class:daemon", "second"])
    assert.ok(["MACHINE_CANNOT_HOLD_ACCOUNT", "NOT_YOUR_ACCOUNT"].includes((await w.c.aiGrantMint({ member: "ann", by, session: w.session.ann })).reason), String(by));
  assert.ok(!Object.keys(w.ops()).some((op) => /standing/i.test(op)), "R32 is reached from answers only, never routed");
});
