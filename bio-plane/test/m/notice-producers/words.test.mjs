/* R16, R17 (DEC-188 (6), (7); DEC-189 (2), (5)–(7); N856; K2704): every sentence and fill this module says is read by key
   from the design stream's `words.json`, its `en` verbatim; a key the file lacks fails, never a fallback sentence. The
   keys DEC-189's owed line names for this module are each held, and the retired `act.owed_exploreapprove.label.queue`
   is not. Each with its negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { WORDS } from "../ai-use/fixture.mjs";
import { NOTICE_WORDS, wordsOf, hasWords, monthName, dayMonth } from "../../../src/notice-producers/words.mjs";
import { EXPLORE_APPROVE } from "../../../src/notice-producers/index.mjs";

const KINDS = ["question-find", "step-later-found", "step-date-due", "step-reminder", "step-cost-shared", "step-cost-message",
  "milestone-overdue", "milestone-reminder", "project-quiet", "review-comment-left-out"];
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
/* DEC-189's owed line, (5)–(7), for notice-producers (draft-T43-words §N856 (c)); the uses `words.json` names on main */
const OWED = ["ai.queue.limitreached", "ai.queue.limitreached.overall", "ai.queue.limitreached.member", "ai.queue.exploreask",
  "ai.queue.suspended", ...["group", "project", "own"].flatMap((k) => [`ai.account.${k}`, `ai.account.${k}.inline`]),
  ...["ask", "draft", "run", "standing", "transcribe", "explore", "suggestions"].map((u) => `ai.use.${u}.inline`),
  "ai.scope.group", "ai.scope.own", "ai.period.day", "ai.period.month", "ai.when.day", "ai.when.month",
  ...MONTHS.map((m) => `date.month.${m}`), "ai.label.explored", "ai.label.explored.member",
  ...KINDS.flatMap((k) => [`queue.${k}.summary`, `queue.${k}.detail`])];

test("R16 R17 every word this module holds is words.json's own en, verbatim; every key DEC-189 names for it is held and in words.json", () => {
  for (const [key, en] of Object.entries(NOTICE_WORDS)) assert.equal(en, WORDS[key], `${key} is words.json's own sentence`);
  for (const key of OWED) {
    assert.equal(typeof WORDS[key], "string", `${key} is in words.json`);
    assert.equal(NOTICE_WORDS[key], WORDS[key], `${key} is held`);
  }
  assert.equal(KINDS.length, 10, "R17's ten kinds");
  /* negative control: a key the file lacks is no word here, and asking for it fails rather than answering a sentence */
  assert.equal(WORDS["ai.queue.nosuchword"], undefined);
  assert.equal(hasWords("ai.queue.nosuchword"), false);
  assert.throws(() => wordsOf("ai.queue.nosuchword", {}), /no words for ai\.queue\.nosuchword/);
  assert.equal(wordsOf("ai.queue.suspended", { project: "S" }), WORDS["ai.queue.suspended"].replace("{project}", "S"));
});

test("R16 the Ask's act reads act.exploreapprove.label.queue; the retired act.owed_exploreapprove.label.queue and the pre-DEC-189 fills ({for_use}, {Uses}) are gone", () => {
  assert.equal(EXPLORE_APPROVE.label, WORDS["act.exploreapprove.label.queue"]);
  assert.equal(WORDS["act.owed_exploreapprove.label.queue"], undefined, "retired in words.json");
  assert.equal(NOTICE_WORDS["act.owed_exploreapprove.label.queue"], undefined, "and not held here");
  for (const en of Object.values(NOTICE_WORDS)) assert.doesNotMatch(en, /\{(for_use|Uses)\}/, en);
});

test("R16 {date}: the local day as day then month, the month named from date.month.*; R16 {when}'s month by date.month.*; nothing for no day", () => {
  assert.equal(dayMonth("2026-10-09"), `9 ${WORDS["date.month.october"]}`);
  assert.equal(dayMonth("2026-01-31"), `31 ${WORDS["date.month.january"]}`);
  for (let m = 1; m <= 12; m++) assert.equal(monthName(m), WORDS[`date.month.${MONTHS[m - 1]}`]);
  for (const bad of [null, "", "2026-13-01", "9 October", "2026-10-09T12:00:00Z"]) assert.equal(dayMonth(bad), null, String(bad));
  assert.equal(monthName(0), null);
});
