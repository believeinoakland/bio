/* The words members see (R63, R96; DEC-149, DEC-329 (11); T34-87's rows for this module), at the module's interface: each
   re-worded string is named and read where a member or founder reads it, from the answer that carries it, by key: the answer
   equals `word(key, vars)` or `localize(id, en, vars)`, and no test holds a sentence's text (K3810). Every member-facing
   string this module answers is swept for the words DEC-149 retires. Codes, op names, element ids, binding names and
   comments are not member-facing and are not read. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot } from "./fixture.mjs";
import { word, localize } from "../../../src/setup-words/index.mjs";
import { INSTANCE_SETUP_CHECKS } from "../../../src/setup.mjs";
import { TRANSLATIONS_CHECKS } from "../../../src/translations/checks.mjs";
import { HOSTING_CONTROL } from "../../../src/setup-fleet.mjs";

/* The words DEC-149 retires for the group's own Civicsmith. "copy" keeps its other meanings, none of which this
   module's member-facing text uses, so any "copy" here is the retired one. */
const RETIRED = /\b(?:copy|copies|instance|plane|server)\b/i;
const OURS = word("queue.capture-completed-unattended.who");

const world = async () => {
  const w = await boot({ env: { INSTANCE_NAME: "river-town" } });
  w.prov.admins = new Set(["admin"]);
  return w;
};

test("R63 (T50; N1116, N1160) every check row's translation is its word by key, `refusal.<CODE>` of setup-words, never a copy held here, and no row says copy, instance, plane or server for the group's own Civicsmith", () => {
  assert.equal("ASSISTANT_OFF" in INSTANCE_SETUP_CHECKS, false, "T37 (N765): C-119.5 retired; the gate answers ai-accounts' row");
  /* the rows still carried for `answer-envelope` (R94) are `translations`' own R15's: swept there */
  for (const [code, row] of Object.entries(INSTANCE_SETUP_CHECKS).filter(([code]) => !(code in TRANSLATIONS_CHECKS) || code === "LANGUAGE_MALFORMED")) {
    assert.equal(row.translation, word(`refusal.${code}`), code);
    assert.doesNotMatch(row.translation, RETIRED, code);
  }
});

test("R63 R47 R97 the hosting block's words say your team's Civicsmith, never the copy", () => {
  assert.equal(HOSTING_CONTROL.heading, word(HOSTING_CONTROL.keys.heading));
  for (const s of [HOSTING_CONTROL.heading, ...HOSTING_CONTROL.sentences]) assert.doesNotMatch(s, RETIRED, s);
});

test("R63 R53 R55 R96 the assistant's sentences (T36: the keep-away state and its refusal, set and unread) are read by key and say your team's material or your team's Civicsmith, never the retired words", async () => {
  const w = await world();
  w.prov.keepAway = { on: true, reason: "Kept here.", set_by: "admin", set_at: "2026-10-08T09:00:00Z" };
  const kept = w.m.assistantGate();
  assert.equal(kept.reason, "AI_KEPT_AWAY", "T37: ai-accounts' refusal, as given");
  assert.equal(kept.detail, localize("ai-accounts.index.the_team_keeps_its_material", "the team keeps its material away from every assistant, so no account was read or used. Nothing was sent."));
  w.prov.keepAway = { on: null, reason: null, set_by: null, set_at: null };
  const stateDetail = w.m.assistantState().detail;
  assert.equal(stateDetail, word("instance-setup.assistant.detail.keep_away_unread"));
  const unread = w.m.assistantGate();
  assert.equal(unread.detail, localize("ai-accounts.index.whether_the_team_keeps_its", "whether the team keeps its material away from every assistant could not be read, so no account was read or used. Nothing was sent."));
  /* this module's own sentence on the gate: a provider that throws is the store's silence */
  const thrown = (await boot({ prov: { ...w.prov, aiAccounts: { aiKeptAway() { throw new Error("x"); } } } })).m.assistantGate();
  assert.equal(thrown.detail, localize("instance-setup.setup.whether_your_team_keeps_its", "whether your team keeps its material away from every assistant did not answer ({String}), so no ask is put to an assistant and no run starts.", { String: "x" }));
  for (const s of [kept.detail, stateDetail, unread.detail, kept.translation, thrown.detail]) assert.doesNotMatch(s, RETIRED, s);
});

test("R63 R96 the profiles' and the group identity's sentences are read by key and say your team's Civicsmith", async () => {
  const w = await world();
  assert.equal(w.m.profiles().detail, word("instance-setup.profiles.detail.none_active"));
  assert.equal(w.m.profilesSet({ profiles: [], by: "ruth" }).detail, localize("instance-setup.setup.choosing_the_jurisdiction_profiles_is", "choosing the jurisdiction profiles is an administrator's act, and your team's Civicsmith stamps who is asking from the signed-in session. This caller is not one of the active administrators."));
  assert.equal(w.m.profilesSet({ profiles: ["nowhere"], by: "admin" }).detail, localize("instance-setup.setup.your_teams_civicsmith_holds_no", "your team's Civicsmith holds no profile {map}. Nothing was changed.", { map: JSON.stringify("nowhere") }));
  assert.equal(w.m.groupNameSet({ name: "x", by: "ruth" }).detail, localize("instance-setup.setup.setting_the_teams_display_name", "setting the team's display name or claiming its domain is an administrator's act (Publication §7), and your team's Civicsmith stamps who is asking from the signed-in session rather than taking it from the caller. This caller is not one of the active administrators."));
  const bound = await boot({ env: { JURISDICTION_PROFILES: "nowhere-profile" } });
  assert.equal(bound.m.profiles().boot.why, word("setup.why.installer_bound_group", { x: JSON.stringify("nowhere-profile") }));
  for (const s of [w.m.profiles().detail, bound.m.profiles().boot.why]) assert.doesNotMatch(s, RETIRED, s);
});

test("R63 R96 the domain check's verdict details are the website check's keys (instance-setup.domain.detail.*), filled, and never call the team's Civicsmith this plane or this instance", async () => {
  const ADDR = "https://river.example";
  const PATH = "/.well-known/civicsmith-group.json", EARLIER = "/.well-known/civicos-group.json";
  const verdict = async (answer) => {
    const w = await world();
    w.prov.answer = answer;
    return (await w.m.groupDomainSet({ domain: "river.example.org", by: "admin", origin: ADDR })).check.detail;
  };
  const json = (o) => () => new Response(JSON.stringify(o), { status: 200 });
  const verified = await verdict(json({ instance: ADDR, group: "river-town" }));
  assert.equal(verified, word("instance-setup.domain.detail.verified", { path: PATH, address: ADDR, slug: "river-town" }));
  assert.match(verified, new RegExp(OURS.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\'/g, "'")), "the team's Civicsmith is named as the words name it");
  const notObject = await verdict(() => new Response("[1]", { status: 200 }));
  assert.equal(notObject, word("instance-setup.domain.detail.not_json", { path: PATH }));
  const other = await verdict(json({ instance: "https://elsewhere.example", group: "x" }));
  assert.equal(other, word("instance-setup.domain.detail.mismatch", { path: PATH, found_address: JSON.stringify("https://elsewhere.example"), found_team: JSON.stringify("x"), address: ADDR, slug: "river-town" }));
  const unfinished = await verdict(() => { throw new Error("connection refused"); });
  assert.equal(unfinished, word("instance-setup.domain.detail.not_finished", { path: PATH }));
  /* absent on the current file's name, then on the earlier file's: both answers, the second deciding */
  const absent = await verdict(() => new Response("", { status: 404 }));
  assert.equal(absent, word("instance-setup.domain.detail.both_paths", {
    first: word("instance-setup.domain.detail.no_file", { path: PATH, status: 404 }),
    second: word("instance-setup.domain.detail.no_file", { path: EARLIER, status: 404 }) }));
  for (const s of [verified, notObject, other, unfinished, absent]) assert.doesNotMatch(s.replace(/\{ instance, group \}/, ""), RETIRED, s);
});

test("R63 every sentence the new acts answer (R60, R62, R64, R65) is free of the retired words", async () => {
  const w = await world();
  const said = [];
  const take = (r) => {
    for (const k of ["detail", "note", "translation"]) if (typeof r[k] === "string") said.push(r[k]);
    return r;
  };
  take(w.m.placeWantedSet({ name: "", by: "admin" }));
  take(w.m.placeWantedSet({ name: "Lake Shore", by: "admin" }));
  take(w.m.placeWantedSet({ name: null, by: "admin" }));
  take(w.m.placeWantedSet({ name: "Lake Shore", by: "ruth" }));
  take(w.m.memberLanguageSet({ language: "es", by: "class:ai" }));
  take(w.m.memberLanguageSet({ language: "es es", by: "ruth" }));
  take(w.m.memberLanguageSet({ language: "es", by: "ruth" }));
  take(w.m.memberLanguageSet({ language: null, by: "ruth" }));
  take(await w.m.groupDescriptionDraft({ answers: [], by: "ruth" }));
  take(await w.m.groupDescriptionDraft({ answers: [], by: "admin" }));
  take(await w.m.groupDescriptionDraft({ answers: "x", by: "admin" }));
  take(await w.m.groupDescriptionDraft({ answers: [{ question: "q", text: "" }], by: "admin" }));
  assert.ok(said.length >= 12);
  for (const s of said) assert.doesNotMatch(s, RETIRED, s);
});
