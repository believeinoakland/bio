/* T50 (T50-4; N1116, N1132, N1171; DEC-258, DEC-259, DEC-260, K3366): ai-accounts holds no member-facing English. Every
   sentence its refusals and notices answer is read by key through setup-words' `word`, from `words.json`; the keys it
   reads are exactly its `reads` in `words-reads.json`. Replaces the stale "words.json holds none of my words" check
   (T49 audit item 5). Every arm drives the module at its interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { world } from "./fixture.mjs";
import { AI_ACCOUNT_CHECKS, AI_WORDS, AiAccounts } from "../../../src/ai-accounts/index.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";

const SCREENS = new URL("../../../../docs/development/ux-substrate/screens/", import.meta.url);
const WORDS = Object.fromEntries(JSON.parse(readFileSync(new URL("words.json", SCREENS), "utf8")).words.map((w) => [w.key, w.en]));
const READS = JSON.parse(readFileSync(new URL("words-reads.json", SCREENS), "utf8")).modules["ai-accounts"].reads;

/* the key each row's translation is, by its code: the six rows of T41 keep their `ai.refused.*` key, every other row its
   `refusal.<CODE>` */
const SIX = { PROJECT_NOT_SOLE_MEMBER: "ai.refused.notsole", SIGNIN_NOT_CONNECTED: "ai.refused.signinnotconnected",
  SWITCH_VALUE_INVALID: "ai.refused.switchvalue", AI_USE_SWITCHED_OFF: "ai.refused.off",
  PROJECT_AI_KEPT_AWAY: "ai.refused.projectkeptaway", PROJECT_KEY_NOTICE_DUE: "ai.refused.noticedue" };
const keyOf = (code) => SIX[code] ?? `refusal.${code}`;

test("R1 R2 R5 R7 R10 R11 R12 R14 R18 R19 R20 R22 R23 (words): every row's translation is the English of its key in words.json, verbatim, and the keys the module reads are exactly its reads in words-reads.json, each held by setup-words", () => {
  const codes = Object.keys(AI_ACCOUNT_CHECKS);
  assert.equal(codes.length, 21);
  for (const code of codes) {
    assert.equal(hasWord(keyOf(code)), true, keyOf(code));
    assert.equal(AI_ACCOUNT_CHECKS[code].translation, WORDS[keyOf(code)], code);
  }
  const read = new Set([...codes.map(keyOf), "ai-accounts.fault", "ai-accounts.group_key_notice_text", "ai.disclosure.projectkey"]);
  assert.deepEqual([...read].sort(), [...READS].sort());
  for (const key of READS) assert.equal(hasWord(key), true, key);
  assert.ok(Object.isFrozen(AI_WORDS));
  for (const [key, text] of Object.entries(AI_WORDS)) assert.equal(text, WORDS[key], key);
  /* control: no translation is empty or still names the group where words.json says the team */
  for (const code of codes) assert.match(AI_ACCOUNT_CHECKS[code].translation, /\S/, code);
  for (const [code, r] of Object.entries(AI_ACCOUNT_CHECKS)) assert.doesNotMatch(r.translation, /\bgroup\b/i, code);
});

test("R1 R3 R5 R10 R20 (words): the refusals as answered at the interface carry words.json's sentence for their code (control: an answer that is not a refusal carries none)", async () => {
  const w = await world().group("ann", "bob");
  const ok = await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann-sentinel", by: "ann" });
  assert.equal(ok.ok, true);
  assert.equal("translation" in ok, false);
  const cases = [
    [await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk", by: "bob" }), "NOT_YOUR_ACCOUNT"],
    [await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk", by: null }), "MACHINE_CANNOT_HOLD_ACCOUNT"],
    [await w.c.accountReferenceSet({ member: "ann", kind: "oauth", secret: "sk", by: "ann" }), "UNKNOWN_ACCOUNT_KIND"],
    [await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "", by: "ann" }), "NO_SECRET"],
    [await w.c.accountReferenceFor({ member: "bob", act: { kind: "ask", member: "bob" } }), "NO_ACCOUNT"],
    [w.c.accountUsesSet({ owner: "member:ann", switch: "bogus", on: true, by: "ann" }), "UNKNOWN_SWITCH"],
    [w.c.aiKeepAwaySet({ on: true, by: "admin" }), "AI_KEEP_AWAY_NO_REASON"],
    [w.c.subscriptionConnected({ member: "ann", login: "x" }), "SUBSCRIPTION_LOGIN_REFUSED"],
    [await w.c.subscriptionTokenHold({ member: "ann", token: "short" }), "SUBSCRIPTION_TOKEN_MALFORMED"],
  ];
  for (const [r, code] of cases) {
    assert.equal(r.ok, false, code);
    assert.equal(r.code, code);
    assert.equal(r.translation, WORDS[keyOf(code)], code);
  }
});

test("R8 R12 (words): the group key's notice is words.json's ai-accounts.group_key_notice_text, the project key's disclosure its ai.disclosure.projectkey with {project} filled; a material limit's uses fault names ai-accounts.fault", async () => {
  const w = await world().group("ann");
  assert.equal(AiAccounts.GROUP_KEY_NOTICE_TEXT, WORDS["ai-accounts.group_key_notice_text"]);
  assert.equal(w.c.groupKeyNotice({ member: "ann" }).text, WORDS["ai-accounts.group_key_notice_text"]);
  assert.match(w.c.groupKeyNotice({ member: "ann" }).text, /^This team has its own Claude account/);
  w.project("P", "ann");
  assert.equal(w.c.projectKeyNotice({ member: "ann", project: "P" }).text,
    WORDS["ai.disclosure.projectkey"].replaceAll("{project}", "Project P"));
  const bad = w.c.aiKeepAwaySet({ on: false, uses: ["bogus"], by: "admin" });
  assert.equal(bad.code, "SWITCH_VALUE_INVALID");
  assert.ok(bad.detail.startsWith(WORDS["ai-accounts.fault"]), bad.detail);
  /* control: a valid set answers no fault */
  assert.equal(w.c.aiKeepAwaySet({ on: false, uses: ["ask"], by: "admin" }).ok, true);
});
