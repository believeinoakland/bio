/* T41-57 (was T40-22; N812, K2373, K2400): R65's and R67's T40 amendments at the module's interface. The account a
   draft runs on, and its limits for `draft`, are resolved at the door (store-door R10: `credentials.accountFor`, R56,
   and `ai-use.useCheck`, R3), which answers credentials' NO_ACCOUNT (relayed as given, K2577), AI_USE_SWITCHED_OFF
   and AI_LIMIT_REACHED in place of the retired ceiling codes; this module mints none of them, and a draft carries no project: a project's account handed in
   serves no draft, and nothing this module hands on or answers names a project. Each case has its negative control. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot } from "./fixture.mjs";
import { world as aiAccountsWorld } from "../ai-accounts/fixture.mjs";
import { INSTANCE_SETUP_CHECKS } from "../../../src/setup.mjs";
import { localize } from "../../../src/setup-words/index.mjs";
import { WIZARD_SCRIPTS_CHECKS } from "../../../src/wizard-scripts/index.mjs";

/* The door's codes (T40) and the retired ceiling codes they replace. */
const DOOR = ["NO_ACCOUNT", "AI_NO_ACCOUNT", "AI_USE_SWITCHED_OFF", "AI_LIMIT_REACHED"];
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

test("R65 (T40: N812, K2373) the door's NO_ACCOUNT (credentials', K2577; or AI_NO_ACCOUNT), AI_USE_SWITCHED_OFF and AI_LIMIT_REACHED are answered there: this module holds no row for them nor for the retired ceiling codes, and no request answers one, at any stage of its own refusals or past them; its own order stands (NOT_AN_ADMIN, AI_KEPT_AWAY, then the answers' GROUP_DRAFT_NO_ANSWERS)", async () => {
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
    assert.equal(r.detail, localize("instance-setup.setup.a_draft_carries_no_project", "a draft carries no project, and the account resolved for this one is a project's, so nothing was drafted and {what}.", { what: localize("instance-setup.setup.fields_as_they_were", "the fields are as they were") }));
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
