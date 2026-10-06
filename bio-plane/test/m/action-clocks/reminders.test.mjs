/* action-clocks' reminders at its interface (R4, R5, R6, R8; DEC-94, K613–K615, K624 (3)), and its two ops. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, actionMd, CP, CLK } from "./fixture.mjs";
import * as clocks from "../../../src/action-clocks/index.mjs";
import * as actions from "../../../src/actions/index.mjs";
import { get as profile } from "../../../../jurisdictions/index.mjs";

const M = V("alice"), BOB = V("bob");
const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b";
const rowOf = (code) => clocks.ACTION_CLOCK_CHECKS[code];
/* An action with two dated entries, the first past and the second ahead (instance clock 2026-09-28). */
function setUp() {
  const w = world();
  w.action(A, ["clock:", ...CLK("2026-09-01"), ...CLK("2026-12-01")]);
  return w;
}
const set = (w, x) => w.c.reminderSet({ target: A, entry: 1, on: "2026-11-20", author: M, viewer: M, ...x });

test("R4 reminderSet: a member sets, changes and removes their own reminder; it is a row of this module's table and the action's document is byte-identical before and after", () => {
  const w = setUp();
  const doc = w.text(A), head = w.record.head(A).bundleSha;
  const s = set(w, {});
  assert.deepEqual(s, { ok: true, target: A, entry: 1, on: "2026-11-20", from: null });
  assert.deepEqual(set(w, { on: "2026-11-25", entry: "1" }), { ok: true, target: A, entry: 1, on: "2026-11-25", from: null }, "an entry as the wire's string");
  const ch = set(w, { from: "2026-11-20", on: "2026-11-22" });
  assert.deepEqual(ch, { ok: true, target: A, entry: 1, on: "2026-11-22", from: "2026-11-20" });
  const list = () => w.c.remindersFor({ action: A, viewer: M }).reminders.map((r) => [r.entry, r.on, r.set_by, r.state]);
  assert.deepEqual(list(), [[1, "2026-11-22", M, "waiting"], [1, "2026-11-25", M, "waiting"]]);
  assert.deepEqual(set(w, { from: "2026-11-25", on: null }), { ok: true, target: A, entry: 1, on: null, from: "2026-11-25" });
  assert.deepEqual(list(), [[1, "2026-11-22", M, "waiting"]], "removed");
  assert.equal(w.text(A), doc, "the document is byte-identical");
  assert.equal(w.record.head(A).bundleSha, head, "no revision of the action");
  const rows = w.rows(`SELECT bundle_id, entry, day, set_by, set_at, removed_at FROM action_reminders ORDER BY rid`);
  assert.deepEqual(rows.map((r) => [r.day, r.removed_at !== null]), [["2026-11-20", true], ["2026-11-25", true], ["2026-11-22", false]]);
  assert.ok(rows.every((r) => r.bundle_id === A && r.set_by === M && r.set_at === "2026-09-28T12:00:00Z"));
  /* a reminder on a past entry, or for a past day, is the member's own choice: set as asked. */
  assert.equal(w.c.reminderSet({ target: A, entry: 0, on: "2026-09-01", author: M, viewer: M }).ok, true);
  /* another member's reminder on the same entry and day is theirs, apart from this one. */
  assert.equal(set(w, { on: "2026-11-22", author: BOB, viewer: BOB }).ok, true);
});

test("R4 refusals in order: MACHINE_CANNOT_SET_REMINDER, NO_SUCH_ACTION (absent, invisible, not an action alike), then REMINDER_REFUSED naming each arm", () => {
  const w = setUp();
  const doc = w.text(A);
  for (const author of [MACHINE, "token:ai", "daemon", "", null, undefined]) {
    const r = set(w, { author, target: "ACTN-2026-0404-x" });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "MACHINE_CANNOT_SET_REMINDER", "MACHINE_CANNOT_SET_REMINDER",
      "C-123.1", rowOf("MACHINE_CANNOT_SET_REMINDER").translation], String(author));
  }
  const absent = set(w, { target: "ACTN-2026-0404-x", entry: 99 });
  assert.deepEqual(absent, actions.noSuchAction("ACTN-2026-0404-x"), "actions' one answer (its R43)");
  assert.deepEqual(set(w, { viewer: "nobody", entry: 99 }), actions.noSuchAction(A), "invisible as absent");
  w.doc("INFO-2026-0001-d");
  assert.equal(set(w, { target: "INFO-2026-0001-d" }).reason, "NO_SUCH_ACTION");
  assert.equal(set(w, { target: "" }).reason, "NO_SUCH_ACTION");
  const arm = (x) => { const r = set(w, x); assert.equal(r.reason, "REMINDER_REFUSED", JSON.stringify(r)); assert.equal(r.check, "C-123.2"); return r.arm; };
  for (const entry of [2, -1, "x", "1.5", null, undefined]) assert.equal(arm({ entry }), "entry", String(entry));
  for (const on of ["soon", "2026-02-30", "2026-1-1", "2026-11-20T00:00:00Z"]) assert.equal(arm({ on }), "on", on);
  assert.equal(arm({ on: null }), "on", "null without from");
  assert.equal(arm({ on: "" }), "on");
  assert.equal(arm({ from: "2026-11-01" }), "from", "from naming no reminder");
  set(w, {});
  assert.equal(arm({}), "held", "a day already held");
  assert.equal(arm({ from: "2026-11-20", on: "2026-11-20" }), "held");
  assert.equal(arm({ from: "2026-11-20", author: BOB, viewer: BOB }), "from", "only their own");
  assert.equal(set(w, { from: "2026-11-20", on: null, author: BOB, viewer: BOB }).arm, "from", "nor remove another's");
  /* an entry with no YYYY-MM-DD date (held only by replay) is not one a reminder is set on. */
  const x = world();
  assert.equal(x.promote(B, actionMd(B, [...CP, "action_kind: other", "clock:", '  - text: "t"', '    description: "d"',
    "    date: someday", "    basis: Act s.2", "    status: pending"]), { extra: { replay: true } }).ok, true);
  assert.equal(x.c.reminderSet({ target: B, entry: 0, on: "2026-11-20", author: M, viewer: M }).arm, "entry");
  /* the bound: 50 standing reminders on one action, the 51st refused; a change at the bound is not a 51st. */
  const y = setUp();
  for (let i = 0; i < 50; i++)
    assert.equal(y.c.reminderSet({ target: A, entry: i % 2, on: `2027-01-${String(1 + (i % 25)).padStart(2, "0")}`,
      author: V(`m${Math.floor(i / 25)}`), viewer: M }).ok, true, `reminder ${i + 1}`);
  const over = y.c.reminderSet({ target: A, entry: 1, on: "2027-02-01", author: M, viewer: M });
  assert.deepEqual([over.reason, over.arm, over.max], ["REMINDER_REFUSED", "bound", 50]);
  assert.equal(y.c.reminderSet({ target: A, entry: 0, from: "2027-01-01", on: "2027-02-01", author: V("m0"), viewer: M }).ok, true);
  assert.equal(y.c.reminderSet({ target: A, entry: 0, from: "2027-02-01", on: null, author: V("m0"), viewer: M }).ok, true);
  assert.equal(y.c.reminderSet({ target: A, entry: 1, on: "2027-02-01", author: M, viewer: M }).ok, true, "a removal frees a place");
  assert.equal(w.text(A), doc, "no refusal touched the document");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_reminders WHERE bundle_id=?`, A)[0].n, 1, "nothing written by a refusal");
});

test("R4 remindersFor answers an action's reminders with their entry, day, member and state (waiting, due, answered); an absent or invisible action answers actions.noSuchAction", () => {
  const w = setUp();
  set(w, { entry: 0, on: "2026-09-20" });
  set(w, { entry: 0, on: "2026-09-28" });
  set(w, { on: "2026-11-20", author: BOB, viewer: BOB });
  w.c.reminderAnswer({ target: A, entry: 0, author: M, viewer: M });
  set(w, { entry: 0, on: "2026-10-05" });
  const r = w.c.remindersFor({ action: A, viewer: M });
  assert.equal(r.ok, true);
  assert.deepEqual(r.reminders.map((x) => [x.entry, x.on, x.set_by, x.state]),
    [[0, "2026-09-20", M, "answered"], [0, "2026-09-28", M, "answered"], [0, "2026-10-05", M, "waiting"], [1, "2026-11-20", BOB, "waiting"]]);
  assert.equal(r.reminders[0].answered_at, "2026-09-28T12:00:00Z");
  /* due on the action's local day (America/Halifax): 2026-10-05T00:00Z is still the 4th there. */
  assert.deepEqual(w.c.remindersFor({ action: A, viewer: M, now: Date.parse("2026-10-05T00:00:00Z") }).reminders[2].state, "waiting");
  assert.deepEqual(w.c.remindersFor({ action: A, viewer: M, now: Date.parse("2026-10-05T03:00:00Z") }).reminders[2].state, "due");
  assert.equal(w.c.remindersFor({ action: A, viewer: M, now: Date.parse("2026-10-05T03:00:00Z") }).as_of, "2026-10-05");
  assert.deepEqual(w.c.remindersFor({ action: A, viewer: "nobody" }), actions.noSuchAction(A));
  assert.deepEqual(w.c.remindersFor({ action: "ACTN-2026-0404-x", viewer: M }), actions.noSuchAction("ACTN-2026-0404-x"));
  assert.deepEqual([r.limit, r.truncated], [500, false]);
});

test("R5 remindersDue lists each unanswered reminder whose day has come, on a pending entry of an open visible action: due on its local day and not before, gone once answered", () => {
  const w = setUp();
  set(w, { entry: 1, on: "2026-10-01" });
  set(w, { entry: 0, on: "2026-09-29", author: BOB, viewer: BOB });
  const at = (iso, x = {}) => w.c.remindersDue({ nowMs: Date.parse(iso), viewer: M, ...x });
  assert.deepEqual(at("2026-09-28T23:59:59Z").items, [], "not before its day");
  assert.deepEqual(at("2026-09-29T02:59:59Z").items, [], "not on the UTC day: the action's local day is still the 28th");
  const d = at("2026-09-29T03:00:00Z");
  assert.deepEqual(d.items, [{ action: A, ord: 0, date: "2026-09-01", basis: "Act s.2", text: "t", on: "2026-09-29", set_by: BOB,
                               project: null, zone: "America/Halifax" }], "N609: the zone its reminder was judged due in");
  assert.deepEqual(at("2026-10-01T08:00:00Z").items.map((x) => [x.ord, x.on]), [[0, "2026-09-29"], [1, "2026-10-01"]]);
  /* answered: gone. */
  w.clock.ms = Date.parse("2026-10-01T09:00:00Z");
  assert.equal(w.c.reminderAnswer({ target: A, entry: 1, author: M, viewer: M }).ok, true);
  assert.deepEqual(at("2026-10-02T00:00:00Z").items.map((x) => x.ord), [0]);
  /* an entry no longer pending (a member's revision marks it met) is not reminded of. */
  assert.equal(w.promote(A, w.text(A).replace("status: pending", "status: met")).ok, true);
  assert.deepEqual(at("2026-10-02T00:00:00Z").items, []);
  /* a closed action is not reminded of; nor an action the viewer may not see. */
  const x = setUp();
  x.c.reminderSet({ target: A, entry: 0, on: "2026-09-20", author: M, viewer: M });
  assert.equal(x.c.remindersDue({ viewer: "nobody" }).items.length, 0);
  assert.equal(x.c.remindersDue({ viewer: M }).items.length, 1, "at the instance clock when no nowMs is named");
  x.actions.actionMove({ target: A, to: "abandoned", reason: "dropped", viewer: M, author: M });
  assert.equal(x.c.remindersDue({ viewer: M }).items.length, 0);
});

test("R5 (N609) each due item carries `zone`, the zone whose local day its reminder was judged due on; an action whose zone is not held is never due, so carries none", () => {
  const w = setUp();
  set(w, { entry: 0, on: "2026-09-29" });
  const at = (iso) => w.c.remindersDue({ nowMs: Date.parse(iso), viewer: M }).items.map((x) => [x.on, x.zone]);
  assert.deepEqual(at("2026-09-29T02:59:59Z"), [], "not yet the 29th in America/Halifax");
  assert.deepEqual(at("2026-09-29T03:00:00Z"), [["2026-09-29", "America/Halifax"]]);
  const noZone = structuredClone(profile("test-port-ellery"));
  delete noZone.time_zone;
  const x = world({ override: { "test-port-ellery": noZone } });
  x.action(A, ["clock:", ...CLK("2026-09-01")]);
  x.c.reminderSet({ target: A, entry: 0, on: "2026-09-01", author: M, viewer: M });
  assert.deepEqual(x.c.remindersDue({ viewer: M, nowMs: Date.parse("2027-01-01T00:00:00Z") }).items, []);
});

test("R5 pages run in (action, entry, day) order, at most 500, `cursor` and `truncated` as R1's; every due reminder is reached once; writes nothing", () => {
  const w = world();
  const ids = Array.from({ length: 30 }, (_, i) => `ACTN-2026-${String(i + 1).padStart(4, "0")}-z`);
  for (const id of ids) w.promote(id, actionMd(id, [...CP, "action_kind: other", "clock:", ...CLK("2026-09-01"), ...CLK("2026-09-02", "met"), ...CLK("2026-12-01")]));
  const want = [];
  for (const id of ids) for (const entry of [2, 1, 0]) for (const day of ["2026-09-21", "2026-09-20"]) {
    assert.equal(w.c.reminderSet({ target: id, entry, on: day, author: M, viewer: M }).ok, true);
    if (entry !== 1) want.push(`${id}:${entry}:${day}`);
  }
  w.c.reminderSet({ target: ids[0], entry: 0, on: "2026-09-20", author: BOB, viewer: BOB });
  want.splice(1, 0, `${ids[0]}:0:2026-09-20`);
  want.sort();
  const k = (x) => `${x.action}:${x.ord}:${x.on}`;
  const before = w.rows(`SELECT COUNT(*) AS n FROM action_reminders WHERE answered_at IS NOT NULL OR removed_at IS NOT NULL`)[0].n;
  for (const limit of [1, 7, 500]) {
    const seen = [];
    let after = null;
    for (let n = 0; n < 1000; n++) {
      const p = w.c.remindersDue({ viewer: M, limit, after });
      assert.ok(p.items.length <= limit);
      seen.push(...p.items.map(k));
      assert.equal(p.cursor === null, !p.truncated);
      if (!p.truncated) break;
      const t = p.items[p.items.length - 1];
      assert.equal(p.cursor, `${t.action}#${t.ord}#${t.on}#${t.set_by}`);
      after = p.cursor;
    }
    assert.deepEqual(seen, want, `limit ${limit}: in order, once each, a met entry's reminders passed over`);
  }
  const p = w.c.remindersDue({ viewer: M, limit: 3 });
  assert.deepEqual(p.items.map((x) => [x.ord, x.on, x.set_by]), [[0, "2026-09-20", M], [0, "2026-09-20", BOB], [0, "2026-09-21", M]],
    "the member breaks a tie on the day");
  assert.deepEqual(w.c.remindersDue({ viewer: M, after: ids[0] }).items[0].action, ids[1], "an action id: after all its reminders");
  assert.equal(w.c.remindersDue({ viewer: M, limit: 9999 }).limit, 500);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_reminders WHERE answered_at IS NOT NULL OR removed_at IS NOT NULL`)[0].n, before, "writes nothing");
});

test("R6 reminderAnswer: the member answers a due reminder with another later day, or with none; a second answer is refused; the document is unchanged", () => {
  const w = setUp();
  const doc = w.text(A);
  set(w, { entry: 0, on: "2026-09-20" });
  set(w, { entry: 0, on: "2026-09-25" });
  set(w, { entry: 0, on: "2026-10-10" });
  /* refusals in order. */
  const r1 = w.c.reminderAnswer({ target: "ACTN-2026-0404-x", entry: 0, author: MACHINE, viewer: M });
  assert.deepEqual([r1.reason, r1.check], ["MACHINE_CANNOT_SET_REMINDER", "C-123.1"]);
  assert.deepEqual(w.c.reminderAnswer({ target: A, entry: 0, author: M, viewer: "nobody" }), actions.noSuchAction(A));
  const none = (x) => w.c.reminderAnswer({ target: A, entry: 0, author: M, viewer: M, ...x });
  for (const x of [{ entry: 1 }, { entry: 5 }, { entry: "x" }, { author: BOB, viewer: BOB }]) {
    const r = none(x);
    assert.deepEqual([r.reason, r.code, r.check, r.translation], ["NO_SUCH_REMINDER", "NO_SUCH_REMINDER", "C-123.3", rowOf("NO_SUCH_REMINDER").translation], JSON.stringify(x));
  }
  assert.equal(none({ entry: 1, on: "soon" }).reason, "NO_SUCH_REMINDER", "NO_SUCH_REMINDER before REMINDER_REFUSED");
  for (const on of ["soon", "2026-09-28", "2026-09-01"]) {
    const r = none({ on });
    assert.deepEqual([r.reason, r.arm], ["REMINDER_REFUSED", "on"], on);
  }
  /* with `on`: every due reminder of the member's on that entry answered, and the new one waits. */
  const a = none({ on: "2026-10-03" });
  assert.deepEqual(a, { ok: true, target: A, entry: 0, answered: ["2026-09-20", "2026-09-25"], next: "2026-10-03" });
  assert.deepEqual(w.c.remindersFor({ action: A, viewer: M }).reminders.map((x) => [x.on, x.state]),
    [["2026-09-20", "answered"], ["2026-09-25", "answered"], ["2026-10-03", "waiting"], ["2026-10-10", "waiting"]]);
  /* a second answer: nothing is due any more. */
  assert.equal(none({}).reason, "NO_SUCH_REMINDER");
  /* without `on`: no further reminder. */
  w.clock.ms = Date.parse("2026-10-03T09:00:00Z");
  assert.deepEqual(none({}), { ok: true, target: A, entry: 0, answered: ["2026-10-03"], next: null });
  assert.equal(w.c.remindersDue({ viewer: M }).items.length, 0);
  assert.equal(none({}).reason, "NO_SUCH_REMINDER");
  /* answering onto a day already held keeps one reminder on it. */
  w.clock.ms = Date.parse("2026-10-10T09:00:00Z");
  set(w, { entry: 0, on: "2026-10-12" });
  assert.equal(none({ on: "2026-10-12" }).ok, true);
  assert.equal(w.c.remindersFor({ action: A, viewer: M }).reminders.filter((x) => x.on === "2026-10-12").length, 1);
  assert.equal(w.text(A), doc, "the action's document is unchanged");
});

test("R8 nothing reminds that no member asked for; a machine never sets, changes or answers a reminder; this module never adds, removes or re-dates a clock entry", () => {
  const w = setUp();
  w.action(B, ["clock:", ...CLK("2026-01-01"), ...CLK("2026-09-27")]);
  const doc = [w.text(A), w.text(B)];
  /* entries overdue and nearing, and no member asked: nothing is due, nothing is held. */
  for (const iso of ["2026-09-28T12:00:00Z", "2026-11-30T12:00:00Z", "2027-06-01T00:00:00Z"])
    assert.deepEqual(w.c.remindersDue({ nowMs: Date.parse(iso), viewer: M }).items, [], iso);
  w.c.overdueClocks({ viewer: M }); w.c.pendingClocks({ before: "2027-01-01", viewer: M });
  w.c.clockPropose({ target: A, rule: "records_answer", proposer: MACHINE, viewer: MACHINE });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_reminders`)[0].n, 0, "no reminder minted unasked");
  /* a machine: refused on every arm, nothing written. */
  set(w, { entry: 0, on: "2026-09-20" });
  for (const r of [set(w, { author: MACHINE, on: "2026-11-01" }), set(w, { author: MACHINE, entry: 0, from: "2026-09-20", on: "2026-11-01" }),
                   set(w, { author: MACHINE, entry: 0, from: "2026-09-20", on: null }),
                   w.c.reminderAnswer({ target: A, entry: 0, author: MACHINE, viewer: MACHINE }),
                   w.c.reminderAnswer({ target: A, entry: 0, author: "token:ai", on: "2026-11-01", viewer: MACHINE })])
    assert.equal(r.reason, "MACHINE_CANNOT_SET_REMINDER");
  assert.deepEqual(w.rows(`SELECT day, answered_at, removed_at FROM action_reminders`), [{ day: "2026-09-20", answered_at: null, removed_at: null }]);
  /* every act and read of this module leaves the actions' documents as they were. */
  w.c.reminderAnswer({ target: A, entry: 0, on: "2026-10-01", author: M, viewer: M });
  assert.deepEqual([w.text(A), w.text(B)], doc);
  assert.equal(w.fm(A).clock.length, 2);
});

test("R4 R6 the ops reminderset and reminderanswer read the control plane's stamps from the query, never the body's", () => {
  const w = setUp();
  const op = (name, qs, body = null) => clocks.actionClocksOps(w.c, new URL(`https://x/?${qs}`), body)[name]();
  const r = op("reminderset", `target=${A}&entry=0&on=2026-09-20&author=${M}&viewer=${M}`);
  assert.deepEqual(r, { ok: true, target: A, entry: 0, on: "2026-09-20", from: null });
  assert.equal(op("reminderset", `viewer=${M}`, { target: A, entry: 1, on: "2026-11-01", author: M }).reason, "MACHINE_CANNOT_SET_REMINDER",
    "an author in the body is not the stamp");
  assert.deepEqual(op("reminderset", `author=${M}&viewer=${M}`, { target: A, entry: 1, on: "2026-11-01" }).ok, true, "the body carries the request");
  assert.deepEqual(op("reminderset", `target=${A}&entry=1&from=2026-11-01&on=&author=${M}&viewer=${M}`).on, null, "an empty on removes");
  const a = op("reminderanswer", `target=${A}&entry=0&on=2026-10-01&author=${M}&viewer=${M}`);
  assert.deepEqual(a, { ok: true, target: A, entry: 0, answered: ["2026-09-20"], next: "2026-10-01" });
  assert.deepEqual(Object.keys(clocks.actionClocksOps(w.c, new URL("https://x/"), null)).sort(),
    ["clockadopt", "clocklateness", "clocksics", "reminderanswer", "reminderset"]);
});

test("R4 (N427) reminderRefused(arm, detail, extra?) is exported, the one answer REMINDER_REFUSED is minted through: its row, its arm and detail, a caller's extra fields never replacing them; it writes nothing and never throws", () => {
  const row = rowOf("REMINDER_REFUSED");
  const fixed = (arm, detail) => ({ ok: false, reason: "REMINDER_REFUSED", code: "REMINDER_REFUSED", check: row.check,
                                    translation: row.translation, detail, arm });
  assert.equal(typeof clocks.reminderRefused, "function");
  for (const arm of ["entry", "on", "from", "held", "bound"])
    assert.deepEqual(clocks.reminderRefused(arm, `d ${arm}`), fixed(arm, `d ${arm}`), arm);
  assert.deepEqual(clocks.reminderRefused("on", "d", { target: A, entry: 1 }), { ...fixed("on", "d"), target: A, entry: 1 });
  assert.deepEqual(clocks.reminderRefused("on", "d", { ok: true, reason: "X", code: "X", check: "C-0", translation: "t",
                                                      detail: "other", arm: "other", option: 2 }),
    { ...fixed("on", "d"), option: 2 }, "extra adds, never replaces");
  /* the acts answer through it: a refusal of reminderSet and reminderAnswer is exactly its answer. */
  const w = setUp();
  set(w, { entry: 0, on: "2026-09-20" });
  const counts = () => w.rows(`SELECT COUNT(*) AS n FROM action_reminders`)[0].n;
  const n = counts();
  for (const r of [set(w, { entry: 9 }), set(w, { on: "soon" }), set(w, { from: "2026-01-01" }), set(w, { entry: 0, on: "2026-09-20" }),
                   w.c.reminderAnswer({ target: A, entry: 0, on: "2026-01-01", author: M, viewer: M })]) {
    const { ok, reason, code, check, translation, detail, arm, ...extra } = r;
    assert.deepEqual(r, clocks.reminderRefused(arm, detail, extra), JSON.stringify(r));
  }
  /* never throws, on any input; writes nothing. */
  const hostile = [undefined, null, 0, Symbol("s"), { toString() { throw new Error("x"); } },
    new Proxy({}, { ownKeys() { throw new Error("x"); } }), { get a() { throw new Error("x"); } }, [1, 2], "str"];
  for (const a of hostile) for (const e of hostile) {
    const r = clocks.reminderRefused(a, a, e);
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "REMINDER_REFUSED", "REMINDER_REFUSED", row.check, row.translation]);
  }
  assert.deepEqual(clocks.reminderRefused(), fixed(null, null));
  assert.equal(counts(), n, "nothing written");
  assert.equal(row.where, "src/action-clocks/index.mjs reminderRefused > is-reminder-refused");
});
