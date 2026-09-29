/* T14 (N327, N329, N335; N128's rows are asserted with R81 in `t9-notice-sight-bounds.test.mjs`): R84's `remedy` and
   `message` (DEC-83) at R22, R41 (and R75) and R62; R86 `activeAdmins` in its stated order; R87 `notAParticipant` and
   R35 through it; the rows of R36, R39 and R6. At the interface only. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { notAnAdmin, notAParticipant, MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../checks/bio-checks.mjs";

const ADMIN = MEMBERSHIP_CHECKS.NOT_AN_ADMIN;
const SHA = (c) => c.repeat(64);
/* Every table, read whole, to show an answer wrote nothing. */
const snapshot = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));

test("R84 remedy (DEC-83): a caller's fixed remedy is kept as `remedy`, and `message` is the translation, a space, then the remedy; without one there is neither; never replaced by extra", () => {
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

test("R84 R22 R41 R75 R62: each site refuses a non-administrator NOT_AN_ADMIN (C-96.1) with its own fixed detail and remedy, message the translation then the remedy; writes nothing", async () => {
  const w = await world().group("ann", "bob");
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  w.project("PROJ-P");
  w.m.projectClaimOwner({ projectId: "PROJ-P", memberId: "ann" });
  w.m.projectInvite({ projectId: "PROJ-P", handle: "bob", by: "ann", viewer: V("ann") });
  const sites = {
    R22: (by) => w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by }),
    R41: (by) => w.m.projectOwnerRescue({ projectId: "PROJ-P", handle: "bob", by, reason: "r", viewer: "admin" }),
    R75: (by) => w.m.rescueRefusal("PROJ-P", by),
    R62: (by) => w.m.aiCredentialMint({ tokenId: `o-${by}`, secretSha: SHA("e"), principalKind: "organisation", who: by }),
  };
  const seen = {};
  for (const [id, run] of Object.entries(sites)) {
    for (const by of ["ann", "bob", "ghost"]) {
      const before = snapshot(w);
      const r = run(by);
      assert.deepEqual(Object.keys(r).sort(), ["by", "check", "code", "detail", "message", "ok", "reason", "remedy",
        "translation"], `${id} by ${by}: R84's fields with its remedy`);
      assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.by],
        [false, "NOT_AN_ADMIN", "NOT_AN_ADMIN", "C-96.1", ADMIN.translation, by], `${id} by ${by}`);
      assert.equal(r.message, `${ADMIN.translation} ${r.remedy}`, `${id}: the standard sentence, then the remedy`);
      const act = r.detail.slice(0, r.detail.indexOf(" is an administrator's act"));
      assert.deepEqual(r, notAnAdmin(by, act, { remedy: r.remedy }), `${id} by ${by}: notAnAdmin's answer, byte for byte`);
      assert.equal(snapshot(w), before, `${id} by ${by}: nothing written`);
      seen[id] = seen[id] ?? new Set();
      seen[id].add(JSON.stringify([act, r.remedy]));
    }
    assert.equal(seen[id].size, 1, `${id}: one fixed act and remedy, whoever asks`);
  }
  assert.deepEqual(seen.R41, seen.R75, "R75 answers as R41 does");
  assert.notDeepEqual(seen.R22, seen.R62);
  assert.match([...seen.R62][0], /member-scoped/, "R62's remedy names the member-scoped credential");
  /* An administrator passes each: the refusal is the caller's standing, not the act's. */
  assert.equal(w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "second" }).ok, true);
  assert.equal(w.m.rescueRefusal("PROJ-P", "second").reason, "OWNERS_ARE_ACTIVE");
  assert.equal(w.m.aiCredentialMint({ tokenId: "o-admin", secretSha: SHA("f"), principalKind: "organisation", who: "admin" }).ok, true);
});

test("R84 R22 R41: the refusal order is unchanged: R22 asks the caller first; R41 asks sight first (R61)", async () => {
  const w = await world().group("ann", "bob");
  /* R22: NOT_AN_ADMIN before NO_SUCH_MEMBER and NOT_DECLARED, so a caller with no standing learns nothing. */
  assert.equal(w.m.expertiseConfirm({ memberId: "nobody", label: "CPA", by: "ann" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.m.expertiseConfirm({ memberId: "bob", label: "never", by: "ann" }).reason, "NOT_AN_ADMIN");
  /* R41: a caller who cannot see the project is answered as for one that does not exist, before NOT_AN_ADMIN. */
  w.project("PROJ-H");
  w.m.projectClaimOwner({ projectId: "PROJ-H", memberId: "ann" });
  const hidden = w.m.projectOwnerRescue({ projectId: "PROJ-H", handle: "bob", by: "bob", reason: "r", viewer: V("bob") });
  const never = w.m.projectOwnerRescue({ projectId: "PROJ-NEVER", handle: "bob", by: "bob", reason: "r", viewer: V("bob") });
  assert.equal(hidden.reason, "NO_SUCH_PROJECT");
  assert.deepEqual({ ...hidden, project: null }, { ...never, project: null });
  /* A participant sees it, so the caller's standing is what refuses. */
  w.m.projectInvite({ projectId: "PROJ-H", handle: "bob", by: "ann", viewer: V("ann") });
  assert.equal(w.m.projectOwnerRescue({ projectId: "PROJ-H", handle: "bob", by: "bob", reason: "r", viewer: V("bob") }).reason,
    "NOT_AN_ADMIN");
});

test("R86 activeAdmins: the founder first once claimed, then active administrators in the order their rows were created, ties by member id; writes nothing, never throws", async () => {
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
  /* R5's live row counts the same administrators. */
  assert.deepEqual(w.m.adminArithmetic().live.administrators, 6);
});

test("R87 notAParticipant: {ok, reason, code, check, translation, project, detail}, row C-56.3, one fixed sentence; extra beside and never replacing; writes nothing, never throws", async () => {
  const row = MEMBERSHIP_CHECKS.NOT_A_PARTICIPANT;
  assert.deepEqual({ ...row }, { check: "C-56.3", where: "src/membership/index.mjs notAParticipant > is-not-a-participant",
                                 translation: row.translation });
  assert.ok(Object.isFrozen(row) && row.translation.length > 40);
  const r = notAParticipant("PROJ-P", "ann");
  assert.deepEqual(r, { ok: false, reason: "NOT_A_PARTICIPANT", code: "NOT_A_PARTICIPANT", check: "C-56.3",
                        translation: row.translation, project: "PROJ-P", detail: r.detail });
  assert.match(r.detail, /Nothing was changed\.$/);
  /* One sentence for every caller and every project; the id as asked, null when none. */
  assert.equal(notAParticipant("PROJ-Q", "bob").detail, r.detail);
  for (const id of [null, undefined]) assert.equal(notAParticipant(id, "ann").project, null);
  const e = notAParticipant("PROJ-P", "ann", { handle: "ann", ok: true, reason: "X", code: "X", check: "C-0",
                                                translation: "forged", project: "other", detail: "mine" });
  assert.deepEqual(e, { ...r, handle: "ann" });
  const hostile = {};
  Object.defineProperty(hostile, "boom", { enumerable: true, get() { throw new Error("no"); } });
  for (const extra of [null, 7, "s", [1], hostile]) assert.deepEqual(notAParticipant("PROJ-P", "ann", extra), r);
  for (const [p, by] of [[{}, []], [42, 7], [["a"], {}]]) assert.doesNotThrow(() => notAParticipant(p, by));
  const w = await world().group("ann");
  const before = snapshot(w);
  notAParticipant("PROJ-P", "ann", { a: 1 });
  assert.equal(snapshot(w), before, "writes nothing");
});

test("R87 R35: projectLeave by a caller holding no participation answers notAParticipant byte for byte, and writes nothing", async () => {
  const w = await world().group("ann", "bob", "cal");
  w.project("PROJ-P");
  w.m.projectClaimOwner({ projectId: "PROJ-P", memberId: "ann" });
  for (const [by, viewer] of [["bob", V("bob")], ["cal", null], ["second", V("second")], ["ghost", V("ghost")]]) {
    const before = snapshot(w);
    assert.deepEqual(w.m.projectLeave({ projectId: "PROJ-P", by, viewer }), notAParticipant("PROJ-P", by), by);
    assert.equal(snapshot(w), before, `${by}: nothing written`);
  }
  /* An absent project and a hidden one answer alike (R61). */
  const absent = w.m.projectLeave({ projectId: "PROJ-NEVER", by: "bob", viewer: V("bob") });
  assert.deepEqual(absent, notAParticipant("PROJ-NEVER", "bob"));
});

test("R36 R39 R6: TARGET_NOT_A_PARTICIPANT (C-56.4), TARGET_NOT_JOINED (C-56.5) and NOT_PROPOSED (C-96.14) carry their rows at their one site", async () => {
  const where = (fn, region) => `src/membership/index.mjs ${fn} > ${region}`;
  const rows = {
    TARGET_NOT_A_PARTICIPANT: ["C-56.4", where("projectRemove", "is-remove-target-participant")],
    TARGET_NOT_JOINED: ["C-56.5", where("projectOwnerAdd", "is-owner-target-joined")],
    NOT_PROPOSED: ["C-96.14", where("adminEndorse", "is-endorse-proposed")],
  };
  for (const [code, [check, w]] of Object.entries(rows)) {
    const row = MEMBERSHIP_CHECKS[code];
    assert.deepEqual([row.check, row.where], [check, w], code);
    assert.ok(Object.isFrozen(row) && typeof row.translation === "string" && row.translation.length > 40, code);
  }
  const carries = (r, code, label) => {
    const row = MEMBERSHIP_CHECKS[code];
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, row.check, row.translation], label);
    assert.match(r.detail, /\S/, label);
  };
  const w = await world().group("ann", "bob", "cal", "dee", "eve");
  w.project("PROJ-P");
  w.m.projectClaimOwner({ projectId: "PROJ-P", memberId: "ann" });
  w.m.projectInvite({ projectId: "PROJ-P", handle: "bob", by: "ann", viewer: V("ann") });           // invited
  w.m.projectInvite({ projectId: "PROJ-P", handle: "cal", by: "ann", viewer: V("ann") });
  w.m.projectJoin({ projectId: "PROJ-P", by: "cal", viewer: V("cal") });
  w.m.projectInvite({ projectId: "PROJ-P", handle: "dee", by: "ann", viewer: V("ann") });
  w.m.projectJoin({ projectId: "PROJ-P", by: "dee", viewer: V("dee") });
  w.m.projectLeave({ projectId: "PROJ-P", by: "dee", viewer: V("dee") });                              // leaving
  /* R36: the named member holds no participation. */
  const before = snapshot(w);
  const rm = w.m.projectRemove({ projectId: "PROJ-P", handle: "eve", by: "ann", viewer: V("ann") });
  carries(rm, "TARGET_NOT_A_PARTICIPANT", "R36");
  assert.equal(rm.handle, "eve");
  /* R39: invited, leaving and absent targets are not joined; a joined one is added. */
  for (const [h, state] of [["bob", "invited"], ["dee", "leaving"], ["eve", undefined]]) {
    const r = w.m.projectOwnerAdd({ projectId: "PROJ-P", handle: h, by: "ann", viewer: V("ann") });
    carries(r, "TARGET_NOT_JOINED", `R39 ${h}`);
    assert.deepEqual([r.handle, r.state], [h, state], h);
  }
  assert.equal(snapshot(w), before, "nothing written by a refusal");
  assert.equal(w.m.projectOwnerAdd({ projectId: "PROJ-P", handle: "cal", by: "ann", viewer: V("ann") }).ok, true);
  /* R6: an ordinary member, and a proposed administrator whose endorsement completed, are not proposed. */
  carries(await w.m.adminEndorse({ memberId: "ann", by: "admin" }), "NOT_PROPOSED", "R6 an ordinary member");
  const p = await w.m.memberAdd({ memberId: "third", cover: "c3", role: "admin", by: "admin" });
  assert.equal(p.reason, "CONSENSUS_REQUIRED");
  assert.equal((await w.m.adminEndorse({ memberId: "third", by: "second" })).ok, true);
  const again = await w.m.adminEndorse({ memberId: "third", by: "admin" });
  carries(again, "NOT_PROPOSED", "R6 once invited");
  assert.equal(again.status, "invited");
  /* R6's order: NO_SUCH_MEMBER first, then NOT_PROPOSED, before the caller's standing (R84). */
  assert.equal((await w.m.adminEndorse({ memberId: "nobody", by: "ann" })).reason, "NO_SUCH_MEMBER");
  assert.equal((await w.m.adminEndorse({ memberId: "ann", by: "ann" })).reason, "NOT_PROPOSED");
  assert.equal((await w.m.adminEndorse({ memberId: "ann", by: `${MACHINE_CLASS_PREFIX}admin` })).reason, "NOT_PROPOSED");
});
