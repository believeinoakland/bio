/* structured-text-reader R7: a calendar file of more events than the limit is refused whole with the limit named; one
 * of exactly the limit is read. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "../../../src/structured-text-reader/index.mjs";
import { generatedText, walk, CALENDAR_EVENTS_MAX } from "./fixtures.mjs";

const EVENT = "BEGIN:VEVENT\r\nSUMMARY:e@@@@@@@@@\r\nDTSTART:20261101\r\nEND:VEVENT\r\n";
const HEAD = "BEGIN:VCALENDAR\r\n", TAIL = "END:VCALENDAR\r\n";
const calendar = (events) => generatedText({ head: HEAD, record: EVENT, tail: TAIL, size: HEAD.length + TAIL.length + events * EVENT.length });

test("R7 a calendar of the limit plus one events is refused whole, naming the limit", async () => {
  const r = await walk(S.icsEntry, calendar(CALENDAR_EVENTS_MAX + 1), { bytes: 1 << 20 });
  assert.equal(r.answer.ok, false);
  assert.equal(r.answer.reason, "EVENTS_OVER_LIMIT");
  assert.equal(r.answer.failure, "final");
  assert.equal(r.answer.bound, CALENDAR_EVENTS_MAX);
  assert.equal(r.answer.whole, true);
  assert.ok(r.answer.detail.includes(String(CALENDAR_EVENTS_MAX)));
});

test("R7 control: a calendar of exactly the limit is read whole", async () => {
  const src = calendar(CALENDAR_EVENTS_MAX);
  const r = await walk(S.icsEntry, src, { bytes: 1 << 20 });
  assert.equal(r.answer.ok, true);
  assert.equal(r.answer.final.whole, true);
  assert.equal(r.units, CALENDAR_EVENTS_MAX);
  assert.equal(r.answer.final.facts.events, CALENDAR_EVENTS_MAX);
  assert.equal(r.last.summary, `e${src.lastToken}`);
});
