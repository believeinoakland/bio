/* Ported from credentials' seam.test.mjs (T48-10; split map §6, K874): its table arms for this module's eleven tables,
   under R28 (credentials R30's share: the declarations, the project tables and the history included) and R29
   (credentials R18's share: the group and member tables exempt from purge). The revocation listener's sessions and
   keys (credentials R16), the claim fact (R17) and the password setter (R20) stay credentials'. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, realWorld, SIGNIN_TOKEN } from "./fixture.mjs";
import { tableDeclarationRefusals } from "../record-core/fixtures.mjs";
import { aiAccountsOf, AI_ACCOUNTS_TABLES, AI_ACCOUNTS_PROJECT_TABLES, AI_ACCOUNTS_HISTORY_TABLE }
  from "../../../src/ai-accounts/index.mjs";

const EXEMPT = AI_ACCOUNTS_TABLES.map((t) => t.name);

test("R29 R28 (credentials R18's and R30's shares): every group and member table of this module is declared exempt from purge, and a whole-store purge clears none of them (through the real record-core)", async () => {
  const w = realWorld();
  w.fact.claimed = true;
  const a = await w.m.memberAdd({ memberId: "second", cover: "c", role: "admin", by: "admin" });
  assert.equal((await w.m.enroll({ invite: a.invite, handle: "second", password: "second-passphrase-x" })).ok, true);
  assert.equal((await w.a.subscriptionTokenHold({ member: "second", token: SIGNIN_TOKEN("second") })).ok, true);   /* T47: R19 */
  assert.equal((await w.a.accountReferenceSet({ member: "second", kind: "apikey", secret: "sk-test", by: "second" })).ok, true);
  assert.equal((await w.a.groupKeySet({ key: "sk-group", by: "second" })).ok, true);
  assert.equal(w.a.groupKeyNoticeSeen({ member: "second", by: "second" }).ok, true);
  assert.equal(w.a.aiKeepAwaySet({ on: true, reason: "a review", by: "second" }).ok, true);   /* T36: R20's table */
  const count = () => Object.fromEntries(EXEMPT.map((t) => [t, w.row(`SELECT COUNT(*) AS n FROM ${t}`).n]));
  const before = count();
  assert.deepEqual(before, { account_references: 1, group_key: 1, group_key_acts: 1, group_key_notices: 1,
    subscription_connections: 1, ai_keep_away: 1 });
  assert.equal(w.rc.purge({}).ok, true);
  assert.deepEqual(count(), before, "a whole-store purge clears none of them");
  assert.equal(w.rc.purge({ bundleId: "second" }).ok, true);
  assert.deepEqual(count(), before);
  /* still held and still in force at the interface */
  assert.equal(w.a.accountReferenceState({ member: "second", viewer: "second" }).held, true);
  assert.equal(w.a.aiKeepAwayState().on, true);
  assert.equal(w.a.aiKeepAwaySet({ on: false, by: "second" }).ok, true);
  assert.equal((await w.a.accountFor({ member: "second", act: { kind: "ask", member: "second" } })).key, "sk-test", "still served");
});

test("R28 R29 (credentials R18's, R30's and R34's shares): the declaration: every table declared once by ai-accounts through declareTable, with its classes, the project tables and the history included; any refusal is thrown", () => {
  const w = world();
  const mine = [...w.core.declared.entries()].filter(([, d]) => d.module === "ai-accounts");
  assert.deepEqual(mine.map(([n]) => n).sort(), [...EXEMPT, ...AI_ACCOUNTS_PROJECT_TABLES.map((t) => t.name),
    AI_ACCOUNTS_HISTORY_TABLE.name].sort(), "every table this module owns, and only those");
  assert.equal(mine.length, 11, "its eleven tables");
  const cls = Object.fromEntries(mine.map(([n, d]) => [n, d.classes]));
  for (const t of EXEMPT)
    assert.deepEqual([cls[t].purge, cls[t].expunge, cls[t].derive, cls[t].version_chain], ["exempt", "none", "stored", false], t);
  /* account references and the group key's tables never exported; account references seen by their owner alone */
  for (const t of ["account_references", "group_key", "group_key_acts", "group_key_notices", "subscription_connections"])
    assert.equal(cls[t].export, "never", t);
  assert.equal(cls.account_references.sight, "owner");
  /* the group key never exported; record-core's R21 offers no administrator sight, so its tables are the group's and the
     key is answered by no read (K1760) */
  assert.deepEqual([cls.group_key.export, cls.group_key.sight], ["never", "group"]);
  /* the project tables: cleared with their project, keyed by project_id; the material limits administrators only */
  for (const t of ["project_accounts", "project_account_acts", "project_key_notices", "project_keep_away"]) {
    assert.deepEqual([cls[t].purge, cls[t].keys, cls[t].sight], ["clear", ["project_id"], "group"], t);
    assert.equal(cls[t].export, t === "project_keep_away" ? "admin-only" : "never", t);
  }
  assert.equal(cls.ai_keep_away.export, "admin-only");
  /* the history: cleared with a project, the whole-store purge clearing only a project's rows; never exported */
  assert.deepEqual([cls.account_changes.purge, cls.account_changes.keys, cls.account_changes.whole, cls.account_changes.export],
    ["clear", ["project_id"], "project_id IS NOT NULL", "never"]);
  /* once */
  assert.equal(w.a.declareTables(), false, "once");
  /* a refusal is a fault: thrown, never silently left purgeable or exportable */
  const sqlStub = { exec() { return []; } };
  const membership = { onRevoked() { return { ok: true }; } };
  const refused = tableDeclarationRefusals("group_key", { by: "membership" });
  const held = { declareTable() { return refused.declaredAgainByTable; } };
  assert.throws(() => aiAccountsOf({ storage: { sql: sqlStub } }, { record: held, membership }).declareTables(),
    /refused its table declaration: TABLE_DECLARED \(group_key\)/);
  const bad = { declareTable() { return refused.unknownClass; } };
  assert.throws(() => aiAccountsOf({ storage: { sql: sqlStub } }, { record: bad, membership }).declareTables(), /TABLE_CLASS_UNKNOWN/);
});
