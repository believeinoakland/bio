/* The words members read (R29; DEC-149, Bob's "S4: B"; K1779, K1785), at the interface: every translation of this
   module's rows, and every refusal's detail and not-held reason it answers, call the group's own Civicsmith "your
   group's Civicsmith" or need no name, never "copy", "instance", "plane" or "server". The sweep's five rows
   (`build/plan/draft-T35-dec149-l1-l7.md`): checks.mjs:26 (C-135.6), :30 (C-135.8), index.mjs:202, rules.mjs:60, :83. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { answersWorld, V } from "./fixture.mjs";
import { ANSWERS_CHECKS } from "../../../src/answers/index.mjs";

const BANNED = /\b(?:copy|copies|instance|instances|plane|planes|server|servers)\b/i;
const OURS = "your group's Civicsmith";
/* Every member-facing string of an answer, deep: translations, details, reasons and conditions. */
function said(v, out = []) {
  if (Array.isArray(v)) for (const x of v) said(x, out);
  else if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) {
      if (["translation", "detail", "reason", "condition"].includes(k) && typeof x === "string") out.push(x);
      else said(x, out);
    }
  return out;
}

test("R29 every row's translation names the group's Civicsmith as \"your group's Civicsmith\" or not at all, never copy, instance, plane or server; C-135.6 and C-135.8 as the sweep words them", () => {
  for (const [code, row] of Object.entries(ANSWERS_CHECKS)) assert.doesNotMatch(row.translation, BANNED, code);
  assert.equal(ANSWERS_CHECKS.RULE_SERVICE_UNKNOWN.check, "C-135.6");
  assert.equal(ANSWERS_CHECKS.RULE_SERVICE_UNKNOWN.translation, `No rule service of that name is held in ${OURS}. Nothing was read.`);
  assert.equal(ANSWERS_CHECKS.RULE_SERVICES_OFF.check, "C-135.8");
  assert.equal(ANSWERS_CHECKS.RULE_SERVICES_OFF.translation,
    `The record's rule services are switched off in ${OURS} until the assistant's measured bar is met. Nothing was read.`);
});

test("R29 the refusals' details and the not-held reasons it answers: the rule services switched off (index.mjs:202), no profile active for profiles (rules.mjs:60) and for deadlinecompute (rules.mjs:83)", async () => {
  const off = answersWorld({ rules: false });
  const r = await off.a.ruleAnswer({ service: "profiles", args: { section: "deadlines" }, viewer: V("bob") });
  assert.equal(r.code, "RULE_SERVICES_OFF");
  assert.equal(r.detail, `the rule services are switched off in ${OURS}`);
  const unknown = await answersWorld().a.ruleAnswer({ service: "nosuch", viewer: V("bob") });
  for (const s of said(unknown)) assert.doesNotMatch(s, BANNED, s);
  /* no profile active: jurisdictions' combine answers no view */
  const none = answersWorld({ deps: { combine: () => ({ ok: false, reason: "NO_PROFILES" }) } });
  for (const [service, args] of [["profiles", { section: "deadlines", key: "x" }], ["deadlinecompute", { rule: "x", start: "2026-01-05" }]]) {
    const got = await none.a.ruleAnswer({ service, args, viewer: V("bob") });
    assert.equal(got.not_held.reason, `no jurisdiction profile is active in ${OURS}`, service);
  }
  /* the standing questions' refusals, and the held-back conditions of a run */
  const w = answersWorld();
  const answers = [
    w.a.standingQuestionSet({ author: "class:ai" }),
    w.a.standingQuestionSet({ author: V("bob"), query: "title:x", find: {}, cadence: "daily", ends: "2026-12-31" }),
    w.a.standingQuestionSet({ author: V("bob"), query: "title:x", cadence: "hourly", ends: "2026-12-31" }),
    w.a.standingQuestionSet({ author: V("bob"), query: "title:x", cadence: "daily", ends: "2026-01-01" }),
    w.a.standingQuestionRead({ id: "STQ-2026-0999", viewer: V("bob") }),
    w.a.tallies({ viewer: V("bob") }),
  ];
  for (const a of answers) for (const s of said(a)) assert.doesNotMatch(s, BANNED, s);
  /* (T37; N765) the kept_away condition and the translation it carries, credentials' row (its R35), as a run answers it */
  assert.equal(w.a.standingAiSwitch({ on: true, by: V("alice") }).ok, true);
  w.a.registerStandingAnswerer("agent-worker", async () => null);
  assert.equal((await w.credentials.aiKeepAwaySet({ on: true, reason: "A review of the assistant.", by: V("alice") })).ok, true);
  const q = w.a.standingQuestionSet({ author: V("bob"), question: "q", query: "title:budget", cadence: "daily", ends: "2026-12-31" });
  await w.a.standingTick(w.clock.now);
  w.document("budget one", { title: "Budget one" });
  w.at("2026-10-06T15:00:00.000Z");
  const run = (await w.a.standingTick(w.clock.now)).ran.find((x) => x.id === q.id);
  assert.equal(run.held_back.condition, "kept_away");
  const words = said([run, w.a.standingAnswersFor({ member: V("bob") })]);
  assert.ok(words.includes(run.held_back.translation) && words.length >= 2);
  for (const s of words) assert.doesNotMatch(s, BANNED, s);
});
