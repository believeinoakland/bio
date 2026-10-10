/* T41-57 (was T40-22; N812, K2373, K2400): R65's and R67's T40 amendments at the module's interface. The account a
   draft runs on, and its limits for `draft`, are resolved at the door (store-door R10: `credentials.accountFor`, R56,
   and `ai-use.useCheck`, R3), which answers AI_NO_ACCOUNT, AI_USE_SWITCHED_OFF and AI_LIMIT_REACHED in place of the
   retired ceiling codes; this module mints none of them, and a draft carries no project: a project's account handed in
   serves no draft, and nothing this module hands on or answers names a project. Each case has its negative control. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot } from "./fixture.mjs";
import { world as credentialsWorld } from "../credentials/fixture.mjs";
import { INSTANCE_SETUP_CHECKS, INTERFACE_WORDS } from "../../../src/setup.mjs";
import { WIZARD_SCRIPTS_CHECKS } from "../../../src/wizard-scripts/index.mjs";

/* The door's codes (T40) and the retired ceiling codes they replace. */
const DOOR = ["AI_NO_ACCOUNT", "AI_USE_SWITCHED_OFF", "AI_LIMIT_REACHED"];
const RETIRED = ["AI_USE_CEILING_REACHED", "AI_USE_COPY_CEILING_REACHED"];
const ANSWERS = [{ question: "What does your group work on?", text: "We watch the port's budget." }];
const GROUP = { kind: "apikey", level: "group" };
const MEMBER = { kind: "signin", level: "member", member: "admin" };
const PROJECT_ACCOUNTS = [{ kind: "apikey", level: "project" }, { kind: "apikey", level: "project", project: "p-1" },
                          { kind: "apikey", level: "group", project: "p-1" }, { kind: "signin", level: "member", member: "admin", project: "p-1" }];
const writes = (w) => w.st.statements.filter((q) => /^\s*(INSERT|UPDATE|DELETE|REPLACE)/i.test(q)).length;
const names = (x) => JSON.stringify(x).includes('"project"');

async function groupWorld() {
  const asked = [];
  const w = await boot({ env: { INSTANCE_NAME: "river-town" },
    more: { groupDraftTurn: async (a) => { asked.push(a); return { focus: "We watch the port's budget.", purpose: "We watch the port's budget.", readLog: [] }; } } });
  w.prov.admins = new Set(["admin"]);
  return { ...w, asked };
}

test("R65 (T40: N812, K2373) the door's AI_NO_ACCOUNT, AI_USE_SWITCHED_OFF and AI_LIMIT_REACHED are answered there: this module holds no row for them nor for the retired ceiling codes, and no request answers one, at any stage of its own refusals or past them; its own order stands (NOT_AN_ADMIN, AI_KEPT_AWAY, then the answers' GROUP_DRAFT_NO_ANSWERS)", async () => {
  for (const code of [...DOOR, ...RETIRED]) {
    assert.equal(Object.hasOwn(INSTANCE_SETUP_CHECKS, code), false, code);
    assert.equal(Object.hasOwn(WIZARD_SCRIPTS_CHECKS, code), false, `${code}: not the draft rows' either`);
  }
  const w = await groupWorld();
  const seen = new Set();
  const ask = async (req) => {
    const r = await w.m.groupDescriptionDraft({ answers: ANSWERS, assistant: { on: true, account: GROUP }, viewer: "admin", by: "admin", ...req });
    seen.add(r.reason ?? "ok");
    return r;
  };
  assert.equal((await ask({ by: "ruth", answers: [] })).reason, "NOT_AN_ADMIN");
  w.prov.keepAway = { on: true, reason: "Our material stays here.", set_by: "admin", set_at: "2026-10-10T09:00:00Z" };
  assert.equal((await ask({ answers: [] })).reason, "AI_KEPT_AWAY", "keep-away before the answers");
  w.prov.keepAway = { on: false, reason: null, set_by: null, set_at: null };
  assert.equal((await ask({ answers: [] })).reason, "GROUP_DRAFT_NO_ANSWERS");
  assert.equal((await ask({ answers: "x" })).reason, "GROUP_DRAFT_ANSWERS_MALFORMED");
  assert.equal((await ask({ assistant: { on: false } })).reason, "ASSISTANT_DRAFT_UNAVAILABLE");
  assert.equal((await ask({ assistant: null })).ok, true, "no account named: the turn's own");
  assert.equal((await ask({})).ok, true, "negative control: a draft is answered");
  for (const reason of seen) assert.equal([...DOOR, ...RETIRED].includes(reason), false, reason);
  assert.deepEqual([...seen].sort(), ["AI_KEPT_AWAY", "ASSISTANT_DRAFT_UNAVAILABLE", "GROUP_DRAFT_ANSWERS_MALFORMED",
                                      "GROUP_DRAFT_NO_ANSWERS", "NOT_AN_ADMIN", "ok"]);
});

test("R65 (T40) a draft carries no project: a project's account handed in (level project, or naming a project) serves no draft, answering ASSISTANT_DRAFT_UNAVAILABLE with the turn never asked and nothing written, after NOT_AN_ADMIN and AI_KEPT_AWAY; the account a draft runs on (the group's key or the administrator's own) reaches the turn as the door resolved it, carrying no project; the answer names none", async () => {
  const w = await groupWorld();
  const mark = writes(w);
  for (const account of PROJECT_ACCOUNTS) {
    const r = await w.m.groupDescriptionDraft({ answers: ANSWERS, assistant: { on: true, account }, viewer: "admin", by: "admin" });
    assert.deepEqual([r.ok, r.reason, r.check], [false, "ASSISTANT_DRAFT_UNAVAILABLE", WIZARD_SCRIPTS_CHECKS.ASSISTANT_DRAFT_UNAVAILABLE.check], JSON.stringify(account));
    assert.match(r.detail, /a draft carries no project/);
    assert.equal("focus" in r || "purpose" in r, false);
  }
  assert.equal(w.asked.length, 0, "the turn is never asked on a project's account");
  /* its place: after the module's first refusals */
  const project = { on: true, account: PROJECT_ACCOUNTS[1] };
  assert.equal((await w.m.groupDescriptionDraft({ answers: ANSWERS, assistant: project, by: "ruth" })).reason, "NOT_AN_ADMIN");
  w.prov.keepAway = { on: true, reason: "Our material stays here.", set_by: "admin", set_at: "2026-10-10T09:00:00Z" };
  assert.equal((await w.m.groupDescriptionDraft({ answers: ANSWERS, assistant: project, by: "admin" })).reason, "AI_KEPT_AWAY");
  w.prov.keepAway = { on: false, reason: null, set_by: null, set_at: null };
  assert.equal(writes(w), mark, "nothing written");
  /* negative controls: the group's key and the administrator's own account are drafted on, as resolved, with no project */
  for (const account of [GROUP, MEMBER, { ...GROUP, project: null }]) {
    const r = await w.m.groupDescriptionDraft({ answers: ANSWERS, assistant: { on: true, account }, viewer: "admin", by: "admin" });
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.equal(names(r), false, "the answer names no project");
  }
  assert.deepEqual(w.asked.map((a) => a.account), [GROUP, MEMBER, GROUP]);
  assert.equal(w.asked.some((a) => Object.hasOwn(a, "project") || Object.hasOwn(a.account, "project")), false);
  assert.equal(writes(w), mark);
});

async function translationWorld() {
  const c = credentialsWorld();
  await c.group("ruth", "sam");
  const w = await boot({ more: { membership: c.m, credentials: c.c } });
  w.m.translationGrant({ member: "ruth", language: "es", by: "admin" });
  return { ...w, c };
}

test("R67 (T40: N812, K2373) store-door R10's AI_NO_ACCOUNT, AI_USE_SWITCHED_OFF and AI_LIMIT_REACHED follow R67's first refusals and are answered at the door: no request to translationDraft, translationDraftRefusal or translationDraftRecord answers one or a retired ceiling code, in either direction; the module's own order stands (direction, tag, machine, grant, word, then AI_KEPT_AWAY)", async () => {
  const w = await translationWorld();
  const PROTECTED = INTERFACE_WORDS.find((x) => x.protected && !/\{/.test(x.en));
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
  w.c.c.aiKeepAwaySet({ on: true, reason: "Our material stays here.", by: "admin" });
  assert.equal(note(w.m.translationDraft({ language: "es", direction: "to_language", by: "sam", assistant })).reason, "TRANSLATION_NOT_GRANTED");
  assert.equal(note(w.m.translationDraft({ language: "es", direction: "to_language", by: "ruth", assistant })).reason, "AI_KEPT_AWAY");
  for (const reason of seen) assert.equal([...DOOR, ...RETIRED].includes(reason), false, reason);
  assert.deepEqual([...seen].sort(), ["AI_KEPT_AWAY", "ASSISTANT_DRAFT_UNAVAILABLE", "LANGUAGE_MALFORMED", "MACHINE_CANNOT_TRANSLATE",
                                      "NOT_AN_ADMIN", "NO_SUCH_WORD", "TRANSLATION_DIRECTION_UNKNOWN", "TRANSLATION_NOT_GRANTED", "null"]);
});

test("R67 (T40) a translation draft carries no project: a project's account handed in answers ASSISTANT_DRAFT_UNAVAILABLE with no words (nothing for the door to send), after the first refusals and keep-away, writing nothing; the group's or the member's own account answers the words to draft; nothing answered or recorded names a project", async () => {
  const w = await translationWorld();
  const mark = writes(w);
  for (const account of PROJECT_ACCOUNTS) for (const req of [{ direction: "to_language", by: "ruth" }, { direction: "to_language", by: "admin" }]) {
    const r = w.m.translationDraft({ language: "es", ...req, assistant: { on: true, account } });
    assert.deepEqual([r.ok, r.reason], [false, "ASSISTANT_DRAFT_UNAVAILABLE"], JSON.stringify(account));
    assert.equal("words" in r, false, "no words: nothing is sent");
    assert.match(r.detail, /a draft carries no project/);
  }
  const project = { on: true, account: PROJECT_ACCOUNTS[1] };
  assert.equal(w.m.translationDraft({ language: "es", direction: "to_language", by: "sam", assistant: project }).reason, "TRANSLATION_NOT_GRANTED");
  assert.equal(writes(w), mark, "nothing written");
  /* negative controls: the words to draft, on the group's key or the member's own account; none names a project */
  for (const account of [GROUP, { kind: "signin", level: "member", member: "ruth" }, { ...GROUP, project: null }]) {
    const r = w.m.translationDraft({ language: "es", direction: "to_language", keys: [INTERFACE_WORDS[0].key], by: "ruth", assistant: { on: true, account } });
    assert.deepEqual([r.reason, r.words.map((x) => x.key)], ["ASSISTANT_DRAFT_UNAVAILABLE", [INTERFACE_WORDS[0].key]]);
    assert.equal(names(r), false);
  }
  const first = INTERFACE_WORDS[0];
  const asked = w.m.translationDraft({ language: "es", direction: "to_language", keys: [first.key], by: "ruth", assistant: { on: true, account: GROUP } });
  const rec = await w.m.translationDraftRecord({ language: "es", direction: "to_language", keys: [first.key], words: asked.words,
                                                 draft: { words: [{ key: first.key, text: `ES ${first.en}` }] }, by: "ruth" });
  assert.equal(rec.drafted.length, 1);
  assert.equal(names(rec), false);
  for (const t of ["translation_drafts", "translation_readings"])
    assert.equal(w.st.db.prepare(`PRAGMA table_info(${t})`).all().some((c) => /project/.test(c.name)), false, `${t} holds no project`);
});

test("R65 each draft's label names who asked by their handle (`asked_by: <handle>`), as membership answers it; the founder, who has none, by their id (negative control)", async () => {
  const facts = { "m-7": { handle: "harbour-ruth" } };
  const w2 = await boot({ env: { INSTANCE_NAME: "river-town" }, more: {
    groupDraftTurn: async () => ({ focus: "We watch the port's budget.", purpose: "We watch the port's budget.", readLog: [] }),
    membership: { isAdministrator: (id) => id === "admin" || id === "m-7", memberFacts: (id) => facts[id] ?? null } } });
  const r = await w2.m.groupDescriptionDraft({ answers: ANSWERS, assistant: { on: true, account: GROUP }, viewer: "m-7", by: "m-7" });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual([r.focus.label, r.purpose.label], [{ kind: "machine", asked_by: "harbour-ruth" }, { kind: "machine", asked_by: "harbour-ruth" }]);
  const founder = await w2.m.groupDescriptionDraft({ answers: ANSWERS, assistant: { on: true, account: GROUP }, viewer: "admin", by: "admin" });
  assert.equal(founder.focus.label.asked_by, "admin");
});
