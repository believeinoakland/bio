/* T41-57 (was T40-22; N812, K2373, K2400): R1's T40 amendments at the module's interface. The account a draft runs on,
   and its limits for `draft`, are resolved at the door (store-door R10: `credentials.accountFor`, R56, and
   `ai-use.useCheck`, R3), which answers credentials' NO_ACCOUNT (relayed as given, K2577), AI_USE_SWITCHED_OFF and
   AI_LIMIT_REACHED in place of the retired ceiling codes; this module mints none of them, and a draft carries no project:
   a project's account handed in serves no draft, and nothing this module hands on or answers names a project. Each case
   has its negative control. The keep-away gate is `ai-accounts`' (its R7), asked directly (R1). */
import test from "node:test";
import assert from "node:assert/strict";
import { boot } from "./fixture.mjs";
import { world as aiAccountsWorld } from "../ai-accounts/fixture.mjs";
import { interfaceWords } from "../../../src/translations/index.mjs";
import { TRANSLATIONS_CHECKS } from "../../../src/translations/checks.mjs";
import { WIZARD_SCRIPTS_CHECKS } from "../../../src/wizard-scripts/index.mjs";

/* The door's codes (T40) and the retired ceiling codes they replace. */
const DOOR = ["NO_ACCOUNT", "AI_NO_ACCOUNT", "AI_USE_SWITCHED_OFF", "AI_LIMIT_REACHED"];
const RETIRED = ["AI_USE_CEILING_REACHED", "AI_USE_COPY_CEILING_REACHED"];
const GROUP = { kind: "apikey", level: "group" };
const PROJECT_ACCOUNTS = [{ kind: "apikey", level: "project" }, { kind: "apikey", level: "project", project: "p-1" },
                          { kind: "apikey", level: "group", project: "p-1" }, { kind: "signin", level: "member", member: "admin", project: "p-1" }];
const writes = (w) => w.st.statements.filter((q) => /^\s*(INSERT|UPDATE|DELETE|REPLACE)/i.test(q)).length;
const names = (x) => JSON.stringify(x).includes('"project"');

async function translationWorld(more = {}) {
  const c = aiAccountsWorld();
  await c.group("ruth", "sam");
  const w = boot({ more: { membership: c.m, aiAccounts: c.a, ...more } });
  w.m.translationGrant({ member: "ruth", language: "es", by: "admin" });
  return { ...w, c };
}

test("R1 (T40: N812, K2373) store-door R10's NO_ACCOUNT (credentials', K2577; or AI_NO_ACCOUNT), AI_USE_SWITCHED_OFF and AI_LIMIT_REACHED follow R1's first refusals and are answered at the door: no request to translationDraft, translationDraftRefusal or translationDraftRecord answers one or a retired ceiling code, in either direction, and this module holds no row for any; the module's own order stands (direction, tag, machine, grant, word, then AI_KEPT_AWAY)", async () => {
  for (const code of [...DOOR, ...RETIRED]) {
    assert.equal(Object.hasOwn(TRANSLATIONS_CHECKS, code), false, code);
    assert.equal(Object.hasOwn(WIZARD_SCRIPTS_CHECKS, code), false, `${code}: not the draft rows' either`);
  }
  const w = await translationWorld();
  const PROTECTED = interfaceWords().find((x) => x.protected && !/\{/.test(x.en));
  w.m.translationAdopt({ language: "es", key: PROTECTED.key, text: "Escrito", by: "ruth" });
  const seen = new Set();
  const note = (r) => { seen.add(r === null ? "null" : r.reason ?? "ok"); return r; };
  const assistant = { on: true, account: GROUP };
  const requests = [
    { language: "es", direction: "up", by: "ruth" }, { language: "bad tag", direction: "to_language", by: "ruth" },
    { language: "es", direction: "to_language", by: "class:ai" }, { language: "es", direction: "to_language", by: "sam" },
    { language: "es", direction: "to_language", keys: ["no.such"], by: "ruth" },
    { language: "es", direction: "to_english", key: PROTECTED.key, by: "ruth" },
    { language: "es", direction: "to_language", by: "ruth" }, { language: "es", direction: "to_english", key: PROTECTED.key, by: "admin" },
  ];
  for (const req of requests) {
    note(w.m.translationDraftRefusal(req));
    const asked = note(w.m.translationDraft({ ...req, assistant }));
    if (asked.words) note(await w.m.translationDraftRecord({ ...req, words: asked.words, draft: null }));
  }
  w.c.a.aiKeepAwaySet({ on: true, reason: "Our material stays here.", by: "admin" });
  assert.equal(note(w.m.translationDraft({ language: "es", direction: "to_language", by: "sam", assistant })).reason, "TRANSLATION_NOT_GRANTED");
  assert.equal(note(w.m.translationDraft({ language: "es", direction: "to_language", by: "ruth", assistant })).reason, "AI_KEPT_AWAY");
  for (const reason of seen) assert.equal([...DOOR, ...RETIRED].includes(reason), false, reason);
  assert.deepEqual([...seen].sort(), ["AI_KEPT_AWAY", "ASSISTANT_DRAFT_UNAVAILABLE", "LANGUAGE_MALFORMED", "MACHINE_CANNOT_TRANSLATE",
                                      "NOT_AN_ADMIN", "NO_SUCH_WORD", "TRANSLATION_DIRECTION_UNKNOWN", "TRANSLATION_NOT_GRANTED", "null"]);
});

test("R1 (T40) a translation draft carries no project: a project's account handed in answers ASSISTANT_DRAFT_UNAVAILABLE with no words (nothing for the door to send), after the first refusals and keep-away, writing nothing; the group's or the member's own account answers the words to draft; nothing answered or recorded names a project", async () => {
  const w = await translationWorld();
  const mark = writes(w);
  for (const account of PROJECT_ACCOUNTS) for (const req of [{ direction: "to_language", by: "ruth" }, { direction: "to_language", by: "admin" }]) {
    const r = w.m.translationDraft({ language: "es", ...req, assistant: { on: true, account } });
    assert.deepEqual([r.ok, r.reason], [false, "ASSISTANT_DRAFT_UNAVAILABLE"], JSON.stringify(account));
    assert.equal(r.check, WIZARD_SCRIPTS_CHECKS.ASSISTANT_DRAFT_UNAVAILABLE.check);
    assert.equal("words" in r, false, "no words: nothing is sent");
    assert.match(r.detail, /a draft carries no project/);
  }
  const project = { on: true, account: PROJECT_ACCOUNTS[1] };
  assert.equal(w.m.translationDraft({ language: "es", direction: "to_language", by: "sam", assistant: project }).reason, "TRANSLATION_NOT_GRANTED");
  assert.equal(writes(w), mark, "nothing written");
  /* negative controls: the words to draft, on the group's key or the member's own account; none names a project */
  for (const account of [GROUP, { kind: "signin", level: "member", member: "ruth" }, { ...GROUP, project: null }]) {
    const r = w.m.translationDraft({ language: "es", direction: "to_language", keys: [interfaceWords()[0].key], by: "ruth", assistant: { on: true, account } });
    assert.deepEqual([r.reason, r.words.map((x) => x.key)], ["ASSISTANT_DRAFT_UNAVAILABLE", [interfaceWords()[0].key]]);
    assert.equal(names(r), false);
  }
  const first = interfaceWords()[0];
  const asked = w.m.translationDraft({ language: "es", direction: "to_language", keys: [first.key], by: "ruth", assistant: { on: true, account: GROUP } });
  const rec = await w.m.translationDraftRecord({ language: "es", direction: "to_language", keys: [first.key], words: asked.words,
                                                 draft: { words: [{ key: first.key, text: `ES ${first.en}` }] }, by: "ruth" });
  assert.equal(rec.drafted.length, 1);
  assert.equal(names(rec), false);
  for (const t of ["translation_drafts", "translation_readings"])
    assert.equal(w.st.db.prepare(`PRAGMA table_info(${t})`).all().some((c) => /project/.test(c.name)), false, `${t} holds no project`);
});

test("R1 the keep-away gate is ai-accounts' aiKeptAway (its R7), asked directly and answered as given with its row and keep_away; a provider that throws is STORE_DID_NOT_ANSWER, never an open gate and never a throw, writing nothing, and says your team, not your group; control: a provider that answers null leaves the gate open", async () => {
  const kept = { ok: false, reason: "AI_KEPT_AWAY", code: "AI_KEPT_AWAY", check: "C-29.99", translation: "kept", keep_away: { reason: "r", set_by: "admin", set_at: "t" } };
  const c = aiAccountsWorld();
  await c.group("ruth");
  const req = { language: "es", direction: "to_language", by: "ruth" };
  const open = boot({ more: { membership: c.m, aiAccounts: { aiKeptAway: () => null } } });
  open.m.translationGrant({ member: "ruth", language: "es", by: "admin" });
  assert.equal(open.m.translationDraft(req).reason, "ASSISTANT_DRAFT_UNAVAILABLE", "control: an open gate reaches the draft");
  const given = boot({ more: { membership: c.m, aiAccounts: { aiKeptAway: () => kept } } });
  given.m.translationGrant({ member: "ruth", language: "es", by: "admin" });
  assert.deepEqual(given.m.translationDraft(req), kept, "as given");
  const mark = writes(given);
  const thrown = boot({ more: { membership: c.m, aiAccounts: { aiKeptAway() { throw new Error("no answer"); } } } });
  thrown.m.translationGrant({ member: "ruth", language: "es", by: "admin" });
  const t = thrown.m.translationDraft(req);
  assert.deepEqual([t.ok, t.reason, t.code], [false, "STORE_DID_NOT_ANSWER", "STORE_DID_NOT_ANSWER"]);
  assert.match(t.detail, /^whether your team keeps its material away from every assistant did not answer \(no answer\)/);
  assert.equal(writes(given), mark);
});
