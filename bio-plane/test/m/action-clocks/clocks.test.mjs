/* action-clocks' reads across actions and its proposal, at its interface (R1, R2, R7). Moved from `actions`' tests with
   the split (K617, K624 (1)), their assertions kept and their ids renamed: `read.test.mjs` "R31 …" and "R32 …",
   `t11.test.mjs` "R31 …" and `t12.test.mjs` "R31 (N311) …" (R31 → R1, R32 → R2); R35's share of "R25 R26 R35 …" is R7's
   test in `overdue.test.mjs`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, actionMd, CP, CLK } from "./fixture.mjs";
import * as clocks from "../../../src/action-clocks/index.mjs";
import { get as profile } from "../../../../jurisdictions/index.mjs";

const M = V("alice");
const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c";
const id = (i) => `ACTN-2026-${String(i).padStart(4, "0")}-z`;
const key = (x) => `${x.action}:${x.ord}`;
/* Every entry, by paging from the start through each `cursor` to null. */
function pages(w, opts) {
  const out = [], seen = [];
  let after = opts.after ?? null;
  for (let n = 0; n < 5000; n++) {
    const p = w.c.pendingClocks({ before: "2026-10-01", viewer: M, ...opts, after });
    assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
    assert.ok(!("cut_inside" in p), "cut_inside retires (K380)");
    assert.ok(p.items.length <= p.limit);
    out.push(...p.items); seen.push(p);
    assert.equal(p.cursor === null, !p.truncated, "a cursor exactly when truncated");
    if (!p.truncated) return { items: out, pages: seen };
    assert.equal(p.cursor, `${p.items[p.items.length - 1].action}#${p.items[p.items.length - 1].ord}`, "the last entry answered");
    after = p.cursor;
  }
  throw new Error("paging did not reach a null cursor");
}

test("R1 pendingClocks lists pending entries dated before `before` across visible actions, at most 500; a bad `before` is its own refusal", () => {
  const w = world();
  w.action(A, ["clock:", ...CLK("2026-09-01"), ...CLK("2026-09-05", "met"), ...CLK("2026-12-01")]);
  const r = w.c.pendingClocks({ before: "2026-10-01", viewer: M });
  assert.deepEqual(r.items, [{ action: A, ord: 0, date: "2026-09-01", basis: "Act s.2", text: "t", past: true }]);
  assert.equal(r.limit, 500); assert.equal(r.truncated, false);
  assert.equal(w.c.pendingClocks({ before: "2026-10-01", viewer: "nobody" }).items.length, 0);
  const bad = w.c.pendingClocks({ before: "soon", viewer: M });
  assert.deepEqual([bad.ok, bad.reason, bad.code, bad.check, bad.before], [false, "PENDING_CLOCKS_BAD_BEFORE", "PENDING_CLOCKS_BAD_BEFORE", "C-117.5", "soon"],
    "its own code, not C-33.6's");
  assert.equal(bad.translation, clocks.ACTION_CLOCK_CHECKS.PENDING_CLOCKS_BAD_BEFORE.translation);
  assert.equal(clocks.ACTION_CLOCK_CHECKS.PENDING_CLOCKS_BAD_BEFORE.where, "src/action-clocks/index.mjs pendingClocks > is-pending-before");
  for (const before of [undefined, null, "", "2026-1-01"]) assert.equal(w.c.pendingClocks({ before, viewer: M }).reason, "PENDING_CLOCKS_BAD_BEFORE");
  w.action(B, ["clock:", ...CLK("2026-01-01"), ...CLK("2026-01-02")]);
  assert.deepEqual([w.c.pendingClocks({ before: "2026-10-01", limit: 2, viewer: M }).truncated], [true]);
  /* an entry dated on `before` is not before it. */
  assert.deepEqual(w.c.pendingClocks({ before: "2026-09-01", viewer: M }).items.map(key), [`${B}:0`, `${B}:1`]);
});

test("R1 pendingClocks reads at most 500 actions a page in id order after `after`; `cursor` is the last entry answered when `truncated`, else null; no entry is lost across pages", () => {
  const w = world();
  for (let i = 1; i <= 501; i++) w.promote(id(i), actionMd(id(i), [...CP, "action_kind: other", "clock:", ...CLK("2026-01-01")]));
  const p1 = w.c.pendingClocks({ before: "2026-10-01", viewer: M });
  assert.deepEqual([p1.items.length, p1.truncated, p1.cursor, p1.actions_limit, p1.limit], [500, true, `${id(500)}#0`, 500, 500]);
  const p2 = w.c.pendingClocks({ before: "2026-10-01", after: p1.cursor, viewer: M });
  assert.deepEqual([p2.items.length, p2.items[0].action, p2.truncated, p2.cursor], [1, id(501), false, null]);
  /* The seek is the projection's clock: an action whose next pending date is not before `before` is not among the 500
     read, so a page of such actions does not hide one that has an entry. */
  const x = world();
  for (let i = 1; i <= 501; i++)
    x.promote(id(i), actionMd(id(i), [...CP, "action_kind: other", "clock:", ...CLK(i === 501 ? "2026-01-01" : "2026-02-01")]));
  const q1 = x.c.pendingClocks({ before: "2026-01-15", viewer: M });
  assert.deepEqual([q1.items.map((e) => e.action), q1.truncated, q1.cursor], [[id(501)], false, null]);
  /* and a page that reads no action says so: no cursor, nothing follows. */
  assert.deepEqual([x.c.pendingClocks({ before: "2026-01-15", viewer: M, after: id(501) }).cursor,
                    x.c.pendingClocks({ before: "2026-01-15", viewer: M, after: id(501) }).truncated], [null, false]);
});

test("R1 (N311) a page runs in (action, position) order and may end inside an action: its cursor `<action>#<position>` resumes after that entry, at the page bound and across it", () => {
  const w = world();
  w.action(A, ["clock:", ...CLK("2026-09-01")]);
  w.action(B, ["clock:", ...CLK("2026-01-01"), ...CLK("2026-01-05", "met"), ...CLK("2026-01-02"), ...CLK("2026-12-01"), ...CLK("2026-01-03")]);
  w.action(C, ["clock:", ...CLK("2026-02-01")]);
  const all = [`${A}:0`, `${B}:0`, `${B}:2`, `${B}:4`, `${C}:0`];
  const p1 = w.c.pendingClocks({ before: "2026-10-01", limit: 2, viewer: M });
  assert.deepEqual([p1.items.map(key), p1.truncated, p1.cursor], [[`${A}:0`, `${B}:0`], true, `${B}#0`]);
  const p2 = w.c.pendingClocks({ before: "2026-10-01", limit: 2, after: p1.cursor, viewer: M });
  assert.deepEqual([p2.items.map(key), p2.truncated, p2.cursor], [[`${B}:2`, `${B}:4`], true, `${B}#4`]);
  const p3 = w.c.pendingClocks({ before: "2026-10-01", limit: 2, after: p2.cursor, viewer: M });
  assert.deepEqual([p3.items.map(key), p3.truncated, p3.cursor], [[`${C}:0`], false, null]);
  const exact = w.c.pendingClocks({ before: "2026-10-01", limit: 5, viewer: M });
  assert.deepEqual([exact.items.map(key), exact.truncated, exact.cursor], [all, false, null]);
  const one = w.c.pendingClocks({ before: "2026-10-01", limit: 4, viewer: M });
  assert.deepEqual([one.items.length, one.truncated, one.cursor], [4, true, `${B}#4`]);
  for (let k = 1; k <= 6; k++) assert.deepEqual(pages(w, { limit: k }).items.map(key), all, `limit ${k}`);
  assert.deepEqual(pages(w, { limit: 2, after: A }).items.map(key), all.slice(1));
  assert.deepEqual(pages(w, { limit: 2, after: B }).items.map(key), [`${C}:0`]);
  assert.deepEqual(p2.items[0], { action: B, ord: 2, date: "2026-01-02", basis: "Act s.2", text: "t", past: true });
});

test("R1 (N311) an action with more pending clock entries than a page (500) is read whole across pages", () => {
  const w = world();
  const many = (n) => ["clock:", ...Array.from({ length: n }, (_, i) => CLK(`2026-0${1 + (i % 9)}-0${1 + (i % 9)}`)).flat()];
  w.action(A, many(501));
  w.action(B, ["clock:", ...CLK("2026-03-03")]);
  const p1 = w.c.pendingClocks({ before: "2026-10-01", viewer: M });
  assert.deepEqual([p1.items.length, new Set(p1.items.map((x) => x.action)).size, p1.truncated, p1.cursor, p1.limit],
    [500, 1, true, `${A}#499`, 500]);
  const p2 = w.c.pendingClocks({ before: "2026-10-01", after: p1.cursor, viewer: M });
  assert.deepEqual([p2.items.map(key), p2.truncated, p2.cursor], [[`${A}:500`, `${B}:0`], false, null]);
  const whole = pages(w, {}).items;
  assert.equal(whole.length, 502);
  assert.deepEqual(whole.map(key), [...Array.from({ length: 501 }, (_, i) => `${A}:${i}`), `${B}:0`], "every entry, once, in order");
  const x = world();
  x.action(A, many(500));
  const q = x.c.pendingClocks({ before: "2026-10-01", viewer: M });
  assert.deepEqual([q.items.length, q.truncated, q.cursor], [500, false, null]);
  assert.equal(w.c.pendingClocks({ before: "2026-10-01", viewer: "nobody" }).items.length, 0);
  assert.deepEqual(pages(w, { before: "2026-01-02" }).items.map(key), [`${A}:0`, `${A}:9`, `${A}:18`].concat(
    Array.from({ length: 501 }, (_, i) => i).filter((i) => i % 9 === 0 && i > 18).map((i) => `${A}:${i}`)));
});

test("R2 clockPropose computes from the profile's deadline, stored apart and labelled; refusals in order; never written into clock[]", () => {
  const w = world();
  const pe = profile("test-port-ellery");
  const dl = pe.deadlines.find((d) => d.applies_to === "records_request");
  w.action(A);
  const P = (x) => w.c.clockPropose({ target: A, rule: dl.rule, proposer: MACHINE, viewer: MACHINE, ...x });
  const und = P({});
  assert.equal(und.ok, true); assert.equal(und.proposal.entry.date, null, "no start event in the ledger");
  assert.ok(und.proposal.undetermined);
  const ev = dl.starts === "filed" ? "sent" : "received";
  assert.equal(w.actions.actionCorrespond({ target: A, direction: ev, at: "2026-09-01", account: "got it", viewer: M, author: M }).ok, true);
  const before = w.text(A);
  const p = P({});
  assert.equal(p.ok, true); assert.equal(p.evidence, false); assert.equal(p.proposal.machine_work, true);
  assert.equal(p.proposal.state, "machine_proposed"); assert.match(p.proposal.says, /machine work/);
  assert.equal(p.proposal.counted_from, "the day after 2026-09-01", "counted from the day after the start event (B4)");
  assert.match(p.proposal.entry.basis, new RegExp(dl.citation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(p.proposal.entry.basis, /profile basis: TEST/);
  assert.deepEqual(Object.keys(p.proposal.entry).sort(), ["basis", "date", "description", "status", "text"]);
  assert.equal(w.text(A), before, "the action's document is unchanged");
  assert.equal(w.fm(A).clock, undefined, "never written into clock[]");
  const row = w.rows(`SELECT * FROM action_clock_proposals WHERE bundle_id=?`, A);
  assert.equal(row.length, 1, "a restatement replaces the proposer's own row");
  assert.equal(row[0].proposed_by, MACHINE); assert.deepEqual(JSON.parse(row[0].entry_json), p.proposal.entry);
  /* a member's proposal is labelled as one, and is a second row. */
  const mine = w.c.clockPropose({ target: A, rule: dl.rule, proposer: M, viewer: M });
  assert.deepEqual([mine.proposal.state, mine.proposal.machine_work], ["member_proposed", false]);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_clock_proposals WHERE bundle_id=?`, A)[0].n, 2);
  /* refusals in order: NO_AUTHOR, NO_TARGET, NO_SUCH_BUNDLE (absent and invisible alike), NOT_AN_ACTION, NO_SUCH_RULE. */
  assert.equal(P({ proposer: "" }).reason, "NO_AUTHOR");
  assert.equal(P({ proposer: "", target: "" }).reason, "NO_AUTHOR");
  assert.equal(P({ rule: undefined, target: "" }).reason, "NO_TARGET");
  assert.equal(P({ rule: undefined, target: "ACTN-2026-0404-x" }).reason, "NO_SUCH_BUNDLE", "after NO_SUCH_BUNDLE, in order");
  assert.equal(P({ viewer: "nobody" }).reason, "NO_SUCH_BUNDLE", "invisible answers as absent");
  w.doc("INFO-2026-0001-d");
  assert.equal(P({ target: "INFO-2026-0001-d", rule: undefined }).reason, "NOT_AN_ACTION");
  const no = P({ rule: "no_such" });
  assert.equal(no.reason, "NO_SUCH_RULE"); assert.match(no.detail, /no_such/); assert.match(no.detail, /records_request/);
  /* N246: an absent rule has no code of its own; it is answered NO_SUCH_RULE at that code's place. */
  for (const rule of [undefined, null, ""]) assert.equal(P({ rule }).reason, "NO_SUCH_RULE");
  assert.ok(!("NO_RULE" in clocks.ACTION_CLOCK_CHECKS));
  /* a rule of the profile for another kind does not apply to this action's. */
  assert.equal(P({ rule: "claim_notice" }).reason, "NO_SUCH_RULE");
  /* no active profile: no rule applies. */
  const bare = world({ profiles: null });
  bare.action(A);
  assert.equal(bare.c.clockPropose({ target: A, rule: dl.rule, proposer: M, viewer: M }).reason, "NO_SUCH_RULE");
});

test("R2 a business-day count runs on the profile's holiday calendar, and is undetermined, with why, where it reaches a year the calendar does not list; a calendar count adds days", () => {
  const d = { rule: "r", days: 5, count: "business", starts: "received" };
  const view = { holidays: profile("test-port-ellery").holidays };
  const fm = (at, dir = "received") => ({ correspondence: [{ direction: "sent", at: "2026-06-01" }, { direction: dir, at }] });
  /* Wednesday 2026-07-01: Thursday, (Friday 3 July a holiday), Monday to Thursday. */
  const ds = ({ date, start }) => ({ date, start });   /* R10's `calendar` statement is its own test's (calendar.test.mjs) */
  assert.deepEqual(ds(clocks.computeDeadline(d, fm("2026-07-01"), view)), { date: "2026-07-09", start: "2026-07-01" });
  /* across the weekend with no holiday. */
  assert.deepEqual(ds(clocks.computeDeadline(d, fm("2026-09-04"), view)), { date: "2026-09-11", start: "2026-09-04" });
  /* past the calendar's last year (2027): undetermined, naming the year. */
  const far = clocks.computeDeadline(d, fm("2027-12-28"), view);
  assert.deepEqual([far.date, far.start], [null, "2027-12-28"]); assert.match(far.why, /2028/);
  assert.match(clocks.computeDeadline(d, fm("2026-07-01"), null).why, /2026/, "no calendar at all: undetermined");
  assert.deepEqual(clocks.computeDeadline({ ...d, count: "calendar", days: 30 }, fm("2026-09-01"), null), { date: "2026-10-01", start: "2026-09-01" });
  assert.deepEqual(clocks.computeDeadline({ ...d, starts: "filed", count: "calendar", days: 1 }, fm("2026-09-01"), null), { date: "2026-06-02", start: "2026-06-01" });
  assert.match(clocks.computeDeadline({ ...d, starts: "known" }, fm("2026-09-01"), view).why, /known/);
  assert.match(clocks.computeDeadline(d, fm("2026-09-01", "no_response"), view).why, /no received entry/);
  assert.match(clocks.computeDeadline({ ...d, count: "lunar" }, fm("2026-09-01"), view).why, /neither calendar nor business/);
  assert.match(clocks.computeDeadline({ ...d, days: 1.5 }, fm("2026-09-01"), view).why, /whole number/);
  /* through the act: the proposal says why it is undetermined. */
  const w = world();
  w.action(A);
  w.actions.actionCorrespond({ target: A, direction: "received", at: "2027-12-28", account: "got it", viewer: M, author: M });
  const p = w.c.clockPropose({ target: A, rule: "records_answer", proposer: M, viewer: M });
  assert.deepEqual([p.ok, p.proposal.entry.date], [true, null]); assert.match(p.proposal.undetermined, /2028/);
  assert.equal(w.rows(`SELECT date, why FROM action_clock_proposals WHERE bundle_id=?`, A)[0].date, null);
});
