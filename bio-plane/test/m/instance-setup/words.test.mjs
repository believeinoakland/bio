/* The words members see (R63; DEC-149, Bob's "S4: B"; T34-87's rows for this module), at the module's interface: each
   re-worded string is named and read where a member or founder reads it, from the answer that carries it, and every
   member-facing string this module answers is swept for the words DEC-149 retires. Codes, op names, element ids,
   binding names and comments are not member-facing and are not read. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot } from "./fixture.mjs";
import { INSTANCE_SETUP_CHECKS } from "../../../src/setup.mjs";
import { HOSTING_CONTROL } from "../../../src/setup-fleet.mjs";

/* The words DEC-149 retires for the group's own Civicsmith. "copy" keeps its other meanings, none of which this
   module's member-facing text uses, so any "copy" here is the retired one. */
const RETIRED = /\b(?:copy|copies|instance|plane|server)\b/i;
const OURS = "your group's Civicsmith";

const world = async () => {
  const w = await boot({ env: { INSTANCE_NAME: "river-town" } });
  w.prov.admins = new Set(["admin"]);
  return w;
};

test("R63 the check rows' translations (T34-87: setup.mjs :1701, :1731, :1742, :1755; and C-119.4) say your group's Civicsmith, and no translation of this module's rows says copy, instance, plane or server", () => {
  const T = (k) => INSTANCE_SETUP_CHECKS[k].translation;
  assert.match(T("GROUP_ALREADY_RECORDED"), /^Your group's Civicsmith has its group recorded already, and it is recorded once/);   // :1701
  assert.match(T("PROFILES_NOT_ADMIN"), /profiles your group's Civicsmith reads its local facts from\. Nothing was changed\.$/);  // :1731
  assert.match(T("UNKNOWN_PROFILE"), /^Your group's Civicsmith holds no jurisdiction profile by that name/);                       // :1742
  assert.match(T("ASSISTANT_OFF"), /^The assistant is switched off for your group's Civicsmith, so no question is put to it/);    // :1755
  assert.match(T("PROFILE_IS_TEST"), /so no group's Civicsmith reads local facts from it\./);
  for (const [code, row] of Object.entries(INSTANCE_SETUP_CHECKS)) assert.doesNotMatch(row.translation, RETIRED, code);
});

test("R63 R47 the hosting block's words (T34-87: setup-fleet.mjs :22, :24, :25, :31) say your group's Civicsmith, never the copy", () => {
  assert.equal(HOSTING_CONTROL.heading, "Before you choose a password: who controls your group's Civicsmith");                    // :22
  assert.match(HOSTING_CONTROL.sentences[0], /^Whoever can sign in to the hosting account your group's Civicsmith runs in \(its Cloudflare account\) controls it\./); // :24
  assert.match(HOSTING_CONTROL.sentences[0], /They can replace the one-time password, claim it again, read everything in it/);    // :25
  assert.match(HOSTING_CONTROL.sentences.at(-1), /and your group's Civicsmith can be claimed again\.$/);                            // :31
  for (const s of [HOSTING_CONTROL.heading, ...HOSTING_CONTROL.sentences]) assert.doesNotMatch(s, RETIRED, s);
});

test("R63 R53 R55 the assistant's sentences (T34-87: setup.mjs :2925, :2933, :2945, :2947, :2958, :2959) say your group's Civicsmith", async () => {
  const w = await world();
  const stateDetail = w.m.assistantState().detail;
  assert.match(stateDetail, /never been switched on for your group's Civicsmith, so it is off/);                                    // :2925
  const never = w.m.assistantGate();
  assert.match(never.detail, /never been switched on for your group's Civicsmith; no ask is put to it/);                          // :2959
  const refused = w.m.assistantSet({ on: true, by: "ruth" });
  assert.match(refused.detail, /switching the assistant on or off for your group's Civicsmith/);                                  // :2933
  const on = w.m.assistantSet({ on: true, by: "admin" });
  assert.match(on.note, /^the assistant is on for your group's Civicsmith\./);                                                    // :2945
  const off = w.m.assistantSet({ on: false, by: "admin" });
  assert.match(off.note, /^the assistant is off for your group's Civicsmith: no ask is put to it/);                               // :2947
  assert.match(w.m.assistantGate().detail, /switched the assistant off for your group's Civicsmith on /);                         // :2958
  /* NOT_AN_ADMIN's sentence after the act's phrase is membership's (its R84; its DEC-149 share is N664, T35) */
  for (const s of [stateDetail, never.detail, refused.detail.split(" is an administrator's act")[0], on.note,
                   off.note, w.m.assistantGate().detail])
    assert.doesNotMatch(s, RETIRED, s);
});

test("R63 the profiles' and the group identity's sentences (T34-87: setup.mjs :2245, :2451, :2479, :2493, :2502) say your group's Civicsmith", async () => {
  const w = await world();
  assert.match(w.m.profiles().detail, /^no active profile: your group's Civicsmith reads no local facts/);                         // :2479
  assert.match(w.m.profilesSet({ profiles: [], by: "ruth" }).detail, /an administrator's act, and your group's Civicsmith stamps who is asking/); // :2493
  assert.match(w.m.profilesSet({ profiles: ["nowhere"], by: "admin" }).detail, /^your group's Civicsmith holds no profile "nowhere"/); // :2502
  assert.match(w.m.groupNameSet({ name: "x", by: "ruth" }).detail, /your group's Civicsmith stamps who is asking from the signed-in session/); // :2245
  const bound = await boot({ env: { JURISDICTION_PROFILES: "nowhere-profile" } });
  assert.match(bound.m.profiles().boot.why, /which your group's Civicsmith does not hold$/);                                        // :2451
  for (const s of [w.m.profiles().detail, bound.m.profiles().boot.why]) assert.doesNotMatch(s, RETIRED, s);
});

test("R63 the domain check's verdict details (T34-87: setup.mjs :2351, :2368, :2371, :2373) never call the group's Civicsmith this plane or this instance", async () => {
  const ADDR = "https://river.example";
  const verdict = async (answer) => {
    const w = await world();
    w.prov.answer = answer;
    return (await w.m.groupDomainSet({ domain: "river.example.org", by: "admin", origin: ADDR })).check.detail;
  };
  const json = (o) => () => new Response(JSON.stringify(o), { status: 200 });
  const verified = await verdict(json({ instance: ADDR, group: "river-town" }));
  assert.match(verified, new RegExp(`names ${OURS} \\(${ADDR.replace(/\./g, "\\.")}\\) and its slug \\(river-town\\)`));               // :2368
  const notObject = await verdict(() => new Response("[1]", { status: 200 }));
  assert.match(notObject, /is not the JSON object your group's Civicsmith reads/);                                                // :2371
  const other = await verdict(json({ instance: "https://elsewhere.example", group: "x" }));
  assert.match(other, /gives the address "https:\/\/elsewhere\.example" and the group "x"/);
  assert.match(other, new RegExp(`; ${OURS} is ${ADDR.replace(/\./g, "\\.")} and its slug is river-town$`));                      // :2373
  const unfinished = await verdict(() => { throw new Error("connection refused"); });
  assert.match(unfinished, /did not complete, and why was not recorded/);                                                         // :2351
  for (const s of [verified, notObject, other, unfinished]) assert.doesNotMatch(s.replace(/\{ instance, group \}/, ""), RETIRED, s);
});

test("R63 every sentence the new acts answer (R60, R62, R64, R65) is free of the retired words", async () => {
  const w = await world();
  const said = [];
  /* NOT_AN_ADMIN's sentence after the act's phrase, and its translation, are membership's (its R84, C-96.1; N664) */
  const take = (r) => {
    for (const k of ["detail", "note", "translation"]) if (typeof r[k] === "string")
      said.push(r.reason === "NOT_AN_ADMIN" ? (k === "detail" ? r[k].split(" is an administrator's act")[0] : "") : r[k]);
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
  w.m.assistantSet({ on: true, by: "admin" });
  take(await w.m.groupDescriptionDraft({ answers: "x", by: "admin" }));
  take(await w.m.groupDescriptionDraft({ answers: [{ question: "q", text: "" }], by: "admin" }));
  assert.ok(said.length >= 12);
  for (const s of said) assert.doesNotMatch(s, RETIRED, s);
});
