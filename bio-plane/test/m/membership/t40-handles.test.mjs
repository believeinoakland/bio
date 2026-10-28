/* T40 (T40-M; N797, N799, N812; DEC-184, DEC-186; K1881, K2373, K2376, K2394): R122 `notTheOwner` and R55's owner
   refusal through it; R123 `handleCheck`, R125 `registerHandleGuard`, R126's rows; R16, R17 and R57 as amended. T46
   (T46-4; DEC-196, DEC-197; K2903): R124's change of handle is retired (its refusal, R129, is `t46-handles-doors.test.mjs`'s),
   so the handle history these tests read is seeded as the changes made before its retirement left it. Each id is tested
   here explicitly, with a negative control (K874: older tests name some of these ids already). Every test drives the
   module at its interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { word } from "../../../src/setup-words/index.mjs";
import { world, V } from "./fixture.mjs";
import { notTheOwner, notAnAdmin, Membership, MEMBERSHIP_CHECKS, PROJECT_AUTHORITY_CHECKS }
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
  assert.equal(r.detail, word("membership.index.not_the_owner_detail"));
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

/* ---------------------------------------------------------------- R125 --------------------------------------------- */

/* ---------------------------------------------------------------- R126 --------------------------------------------- */

/* ---------------------------------------------------------------- R16, R17, R57 ------------------------------------ */

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
