/* T14 (N327, N329, N335): R28's `remedy` and `message` (DEC-83) at R18 (the rescue's, R75 of `membership`, is its own
   test; R41's went to `project-roster`, its R5, T38; R62's to `credentials` with its R13, T19); R29 `activeAdmins` in its
   stated order; the row of R3. At the interface only. (`notAParticipant` and R35 through it are `membership`'s.) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, snapshot, actOf } from "./fixture.mjs";
import { notAnAdmin } from "../../../src/member-roster/index.mjs";
import { MEMBER_ROSTER_ROWS } from "../../../src/member-roster/checks.mjs";
const { MEMBERSHIP_CHECKS } = MEMBER_ROSTER_ROWS;
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const ADMIN = MEMBERSHIP_CHECKS.NOT_AN_ADMIN;

test("R28 remedy (DEC-83): a caller's fixed remedy is kept as `remedy`, and `message` is the translation, a space, then the remedy; without one there is neither; never replaced by extra", () => {
  const plain = notAnAdmin("ann", "an act");
  assert.equal("remedy" in plain, false);
  assert.equal("message" in plain, false);
  const r = notAnAdmin("ann", "an act", { remedy: "Ask an administrator.", finding: "F-1" });
  assert.deepEqual(r, { ...plain, finding: "F-1", remedy: "Ask an administrator.",
                        message: `${ADMIN.translation} Ask an administrator.` });
  /* `message` is the function's own: a caller's copy never replaces it, with or without a remedy. */
  assert.equal(notAnAdmin("ann", "x", { remedy: "Do y.", message: "forged" }).message, `${ADMIN.translation} Do y.`);
  assert.deepEqual(notAnAdmin("ann", "x", { message: "forged" }), notAnAdmin("ann", "x"));
  /* A remedy is a sentence: anything else under that name adds neither field. */
  for (const bad of [null, undefined, "", "   ", 7, {}, ["a"], true])
    assert.deepEqual(notAnAdmin("ann", "x", { remedy: bad }), notAnAdmin("ann", "x"), `remedy ${String(bad)}`);
  const hostile = { remedy: "Do y." };
  Object.defineProperty(hostile, "boom", { enumerable: true, get() { throw new Error("no"); } });
  assert.doesNotThrow(() => notAnAdmin("ann", "x", hostile));
});

test("R28 R18: the site refuses a non-administrator NOT_AN_ADMIN (C-96.1) with its own fixed detail and remedy, message the translation then the remedy; writes nothing", async () => {
  const w = await world().group("ann", "bob");
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  const seen = new Set();
  for (const by of ["ann", "bob", "ghost"]) {
    const before = snapshot(w);
    const r = w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by });
    assert.deepEqual(Object.keys(r).sort(), ["by", "check", "code", "detail", "message", "ok", "reason", "remedy",
      "translation"], `by ${by}: R28's fields with its remedy`);
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.by],
      [false, "NOT_AN_ADMIN", "NOT_AN_ADMIN", "C-96.1", ADMIN.translation, by], `by ${by}`);
    assert.equal(r.message, `${ADMIN.translation} ${r.remedy}`, "the standard sentence, then the remedy");
    const act = actOf(r.detail);
    assert.deepEqual(r, notAnAdmin(by, act, { remedy: r.remedy }), `by ${by}: notAnAdmin's answer, byte for byte`);
    assert.equal(snapshot(w), before, `by ${by}: nothing written`);
    seen.add(JSON.stringify([act, r.remedy]));
  }
  assert.equal(seen.size, 1, "one fixed act and remedy, whoever asks");
  /* An administrator passes: the refusal is the caller's standing, not the act's. */
  assert.equal(w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "second" }).ok, true);
});

test("R28 R18: the refusal order is unchanged: R18 asks the caller first", async () => {
  const w = await world().group("ann", "bob");
  /* R22: NOT_AN_ADMIN before NO_SUCH_MEMBER and NOT_DECLARED, so a caller with no standing learns nothing. */
  assert.equal(w.m.expertiseConfirm({ memberId: "nobody", label: "CPA", by: "ann" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.m.expertiseConfirm({ memberId: "bob", label: "never", by: "ann" }).reason, "NOT_AN_ADMIN");

});

test("R29 activeAdmins: the founder first once claimed, then active administrators in the order their rows were created, ties by member id; writes nothing, never throws", async () => {
  const w = world();
  assert.deepEqual(w.m.activeAdmins(), [], "an unclaimed instance with no administrator");
  /* Rows created in the reverse of member-id order, one tie, a revoked and an ordinary member among them. */
  const put = (id, created, role = "admin", status = "active") => w.sql.exec(
    `INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
     VALUES (?,?,?,?,?,'[]',?,?)`, id, `c-${id}`, id, role, status, created, created);
  put("zoe", "2026-01-01T00:00:00Z");
  put("yan", "2026-02-01T00:00:00Z");
  put("mia", "2026-03-01T00:00:00Z");
  put("kim", "2026-03-01T00:00:00Z");                 // ties with mia: the id decides
  put("abe", "2026-04-01T00:00:00Z", "admin", "revoked");
  put("ann", "2025-01-01T00:00:00Z", "member");
  assert.deepEqual(w.m.activeAdmins(), ["zoe", "yan", "kim", "mia"], "unclaimed: no founder");
  await w.claim();
  const before = snapshot(w);
  assert.deepEqual(w.m.activeAdmins(), ["admin", "zoe", "yan", "kim", "mia"], "the founder first once claimed");
  assert.equal(snapshot(w), before, "writes nothing");
  /* The order is the created order, not the order rows were inserted nor the id order. */
  put("bea", "2025-06-01T00:00:00Z");
  assert.deepEqual(w.m.activeAdmins(), ["admin", "bea", "zoe", "yan", "kim", "mia"]);
  /* R2's live row counts the same administrators. */
  assert.deepEqual(w.m.adminArithmetic().live.administrators, 6);
});

test("R3: NOT_PROPOSED (C-96.14) carries its row at its one site", async () => {
  const where = (fn, region) => `src/member-roster/index.mjs ${fn} > ${region}`;
  const row = MEMBERSHIP_CHECKS.NOT_PROPOSED;
  assert.deepEqual([row.check, row.where], ["C-96.14", where("adminEndorse", "is-endorse-proposed")]);
  assert.ok(Object.isFrozen(row) && typeof row.translation === "string" && row.translation.length > 40);
  const carries = (r, label) => {
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "NOT_PROPOSED", "NOT_PROPOSED", row.check, row.translation], label);
    assert.match(r.detail, /\S/, label);
  };
  const w = await world().group("ann");
  /* an ordinary member, and a proposed administrator whose endorsement completed, are not proposed. */
  const before = snapshot(w);
  carries(await w.m.adminEndorse({ memberId: "ann", by: "admin" }), "an ordinary member");
  assert.equal(snapshot(w), before, "nothing written by a refusal");
  const p = await w.m.memberAdd({ memberId: "third", cover: "c3", role: "admin", by: "second" });
  assert.equal(p.reason, "CONSENSUS_REQUIRED");
  assert.equal((await w.m.adminEndorse({ memberId: "third", by: "admin" })).ok, true);
  const again = await w.m.adminEndorse({ memberId: "third", by: "second" });
  carries(again, "once invited");
  assert.equal(again.status, "invited");
  /* R3's order (T38, K2276): the caller's standing (R28) first, then NO_SUCH_MEMBER, then NOT_PROPOSED, so no one who
     may not act learns whether a member exists. */
  assert.equal((await w.m.adminEndorse({ memberId: "nobody", by: "ann" })).reason, "NOT_AN_ADMIN");
  assert.equal((await w.m.adminEndorse({ memberId: "ann", by: "ann" })).reason, "NOT_AN_ADMIN");
  assert.equal((await w.m.adminEndorse({ memberId: "ann", by: `${MACHINE_CLASS_PREFIX}admin` })).reason, "NOT_AN_ADMIN");
  assert.equal((await w.m.adminEndorse({ memberId: "nobody", by: "second" })).reason, "NO_SUCH_MEMBER");
  assert.equal((await w.m.adminEndorse({ memberId: "ann", by: "second" })).reason, "NOT_PROPOSED");
});
