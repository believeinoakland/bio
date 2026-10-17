/* admission: R28 (T49; K3366, K3368; DEC-257, DEC-258) — words by key. The module holds no member-facing English: each
   refusal's sentence is the word `refusal.<CODE>`, read through setup-words' `word`. The keys it reads are the `reads`
   list for admission in the design lane's words-reads.json; this file asserts each with `hasWord` and that what the
   module answers equals `word(key, vars)`, and holds no sentence's text. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";
import { A, C, world, gate, refused, member, hex64 } from "./harness.mjs";

const READS = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words-reads.json", import.meta.url), "utf8"))
  .modules.admission.reads;
const SESSION_KEY = "refusal.DOOR_RATE_LIMITED.session";
const ROW_CODES = Object.values(C).flatMap((rows) => Object.keys(rows));

/* R31 (T50; N1146; DEC-278): the eight keys the list names that no row of this module holds, each with why. Five are the
   refusals this module only counts (R22's tally), one it relays (R25's, credentials'), two the generator's join
   over-reaches to; their sentences are their owners' and this module reads none of them. */
const NAMED_NOT_READ = Object.freeze({
  "refusal.NO_SUCH_INVITATION": "counted (R22): membership's refusal of an expired or unknown invitation",
  "refusal.NO_SUCH_JOIN_LINK": "counted (R22): membership's refusal of an unknown join link",
  "refusal.WEBSITE_KEY_UNKNOWN": "counted (R22): membership's refusal of an unknown website key",
  "refusal.WEBSITE_DAILY_CAP": "counted (R22): membership's daily cap of the website door, relayed",
  "refusal.JOIN_LINK_DAILY_CAP": "counted (R22): membership's daily cap of the join link, relayed",
  "refusal.REAUTH_DUE": "relayed (R25): credentials' refusal, given as it gives it",
  "refusal.EXISTS": "the generator's join over-reaches to it: a record-core refusal this module never answers",
  "refusal.TABLE_DECLARED": "the generator's join over-reaches to it: a record-core refusal this module never answers",
});
/* a code the module answers with no key in the list: the keys that are missing, by name */
const keysMissing = (codes, reads) => codes.map((code) => `refusal.${code}`).filter((key) => !reads.includes(key));

test("R31 (R28): the key list is the design's regenerated one, 31 keys: every key is a word (hasWord); every code this module's rows hold is among them as refusal.<CODE>; so is the session window's own; the other eight are each named here with their reason; a code answered with no key in the list fails by name", () => {
  assert.ok(Array.isArray(READS));
  assert.equal(READS.length, 31, "31 keys at DEC-278's regeneration");
  assert.equal(new Set(READS).size, READS.length, "no key twice");
  for (const key of READS) assert.equal(hasWord(key), true, key);
  assert.deepEqual(keysMissing(ROW_CODES, READS), [], "every code of the module's rows has its key");
  assert.equal(ROW_CODES.length, 22, "the module's rows: 22 codes");
  assert.ok(READS.includes(SESSION_KEY));
  assert.equal(hasWord(SESSION_KEY), true);
  /* the eight that are neither a row's nor the session window's: exactly those named here, each with a reason */
  const others = READS.filter((key) => !ROW_CODES.some((code) => key === `refusal.${code}`) && key !== SESSION_KEY).sort();
  assert.deepEqual(others, Object.keys(NAMED_NOT_READ).sort());
  for (const [key, why] of Object.entries(NAMED_NOT_READ)) assert.ok(why.length > 0 && hasWord(key), key);
  /* no row of this module is one of the eight: it reads none of their sentences */
  for (const key of Object.keys(NAMED_NOT_READ)) assert.equal(ROW_CODES.includes(key.slice("refusal.".length)), false, key);
  /* control: a code the module answers with no key in the list is named, so the test fails by it */
  assert.deepEqual(keysMissing([...ROW_CODES, "A_CODE_WITH_NO_KEY"], READS), ["refusal.A_CODE_WITH_NO_KEY"]);
  assert.deepEqual(keysMissing(ROW_CODES, READS.filter((k) => k !== "refusal.NOT_CAPABLE")), ["refusal.NOT_CAPABLE"]);
  /* control: a key nobody holds is no word, and reading it is a loud failure, never a fallback */
  assert.equal(hasWord("refusal.NO_SUCH_CODE_ANYWHERE"), false);
  assert.throws(() => word("refusal.NO_SUCH_CODE_ANYWHERE"), (e) => e.code === "UNKNOWN_WORD" || /UNKNOWN_WORD/.test(String(e.message)));
});

test("R28: over fixtures, what each gate answers as `translation` equals word(key, vars) — the wire carries the word of its code, DOOR_RATE_LIMITED's {minutes} filled from the wait — and a row's sentence is read once from the one key (the same code answered at two sites gives one sentence)", async () => {
  const lack = hex64();
  const { env, S, K } = world({ sessions: { [lack]: member("bea", []) } });
  const expectWord = (r, code, vars = {}) => assert.equal(r.translation, word(`refusal.${code}`, vars), code);
  expectWord(refused(await gate(env, { op: "index" }), 401, "NOT_AUTHENTICATED", "C-38.1"), "NOT_AUTHENTICATED");
  expectWord(refused(await gate(env, { op: "index", params: { store: "nope" } }), 400, "NAMESPACE_UNKNOWN", "C-78.1"), "NAMESPACE_UNKNOWN");
  expectWord(refused(await gate(env, { op: "index", token: env.MEMBER_TOKEN, method: "GET" }), 401, "MEMBER_TOKEN_RETIRED", "C-38.11"), "MEMBER_TOKEN_RETIRED");
  expectWord(refused(await gate(env, { op: "adminendorse", token: env.ADMIN_TOKEN }), 403, "OPERATOR_TOKEN_CANNOT_GOVERN", "C-32.17"), "OPERATOR_TOKEN_CANNOT_GOVERN");
  expectWord(refused(await gate(env, { op: "purge", token: K.ann }), 403, "AI_BEYOND_TASK_SCOPE", "C-29.6"), "AI_BEYOND_TASK_SCOPE");
  const capable = refused(await gate(env, { op: "promote", token: lack }), 403, "NOT_CAPABLE", "C-38.5");
  expectWord(capable, "NOT_CAPABLE");
  /* the same code from its second site is the same sentence */
  assert.equal(refused({ refusal: A.projectCreationGate(new Set()) }, 403, "NOT_CAPABLE", "C-38.5").translation, capable.translation);
  /* the one placeholder: whole minutes of the wait */
  for (const [seconds, minutes] of [[1, 1], [60, 1], [61, 2], [225, 4], [600, 10], [0, 1]]) {
    const body = refused({ refusal: A.doorRateLimited(seconds) }, 429, "DOOR_RATE_LIMITED", "C-38.9");
    assert.equal(body.minutes, minutes, String(seconds));
    expectWord(body, "DOOR_RATE_LIMITED", { minutes });
  }
  const sessionBody = refused({ refusal: A.doorRateLimited(225, { session: true }) }, 429, "DOOR_RATE_LIMITED", "C-38.9");
  assert.equal(sessionBody.translation, word(SESSION_KEY, { minutes: 4 }));
  assert.notEqual(sessionBody.translation, word("refusal.DOOR_RATE_LIMITED", { minutes: 4 }));
  /* controls: a session's sentence, and the mint's refusals, are words too */
  expectWord(refused(A.aiScopeDeclaration(["nosuchop"]), 403, "AI_SCOPE_UNKNOWN_OP", "C-29.8"), "AI_SCOPE_UNKNOWN_OP");
  expectWord(refused(await gate(env, { op: "governorconfig", token: S.ann }), 403, "SESSION_ROLE_CANNOT_REACH_OP", "C-38.7"), "SESSION_ROLE_CANNOT_REACH_OP");
});
