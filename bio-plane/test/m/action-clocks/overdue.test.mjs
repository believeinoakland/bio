/* action-clocks' overdue read and its invariants at its interface (R3, R7, R9). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, actionMd, CP, CLK } from "./fixture.mjs";
import * as clocks from "../../../src/action-clocks/index.mjs";
import { get as profile } from "../../../../jurisdictions/index.mjs";

const M = V("alice"), BOB = V("bob");
const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c", D = "ACTN-2026-0004-d";
const id = (i) => `ACTN-2026-${String(i).padStart(4, "0")}-z`;
const key = (x) => `${x.action}:${x.ord}`;
const counts = (w) => ["manifest", "files", "history", "action_reminders", "action_clock_proposals"]
  .map((t) => w.rows(`SELECT COUNT(*) AS n FROM ${t}`)[0].n);

test("R3 overdueClocks lists every overdue or past pending entry of open visible actions, with the action's project and its creator; met, waived and future entries and closed actions are not listed; writes nothing", () => {
  const w = world();
  w.action(A, ["clock:", ...CLK("2026-09-01"), ...CLK("2026-09-02", "met"), ...CLK("2026-09-03", "waived"),
               ...CLK("2026-12-01", "overdue"), ...CLK("2026-12-02")]);
  /* a later revision by another member: the creator is still the member whose write created it. */
  assert.equal(w.promote(A, w.text(A).replace("title: ", "title: x"), { author: BOB }).ok, true);
  w.action(B, ["clock:", ...CLK("2026-01-01")]);
  w.actions.actionMove({ target: B, to: "abandoned", reason: "dropped", viewer: M, author: M });
  w.action(C, ["clock:", ...CLK("2026-01-01")]);
  w.actions.actionMove({ target: C, to: "active", reason: "go", viewer: M, author: M });
  w.actions.actionMove({ target: C, to: "resolved", resolution: "complied", reason: "done", viewer: M, author: M });
  w.action(D, ["clock:", ...CLK("2026-01-01")]);
  w.actions.actionMove({ target: D, to: "active", reason: "go", viewer: M, author: M });
  const before = counts(w);
  const r = w.c.overdueClocks({ viewer: M });
  assert.deepEqual(r.items.map(key), [`${A}:0`, `${A}:3`, `${D}:0`]);
  assert.deepEqual(r.items[0], { action: A, ord: 0, date: "2026-09-01", basis: "Act s.2", text: "t", status: "pending", past: true,
                                 project: null, created_by: M });
  assert.equal(r.items[0].created_by, M, "the creator, not the later reviser");
  assert.deepEqual([r.as_of, r.limit, r.actions_limit, r.truncated, r.cursor], ["2026-09-28", 500, 500, false, null]);
  assert.deepEqual(counts(w), before, "writes nothing");
  assert.equal(w.c.overdueClocks({ viewer: "nobody" }).items.length, 0, "only visible actions");
  assert.equal(w.c.overdueClocks({ viewer: MACHINE }).items.length, 3, "a machine reads as any viewer the gate passes");
});

test("R3 a pending entry is past from the UTC day after its date: at the day boundary, the instance clock decides", () => {
  const w = world();
  w.action(A, ["clock:", ...CLK("2026-09-28")]);
  w.clock.ms = Date.parse("2026-09-28T23:59:59.999Z");
  assert.equal(w.c.overdueClocks({ viewer: M }).items.length, 0, "met by anything on its day");
  w.clock.ms = Date.parse("2026-09-29T00:00:00.000Z");
  assert.deepEqual(w.c.overdueClocks({ viewer: M }).items.map(key), [`${A}:0`]);
  assert.equal(w.c.overdueClocks({ viewer: M, now: Date.parse("2026-09-28T12:00:00Z") }).items.length, 0, "a caller's as-of");
});

test("R3 pages run in (action, position) order, at most 500 entries and 500 actions a page, `cursor` and `truncated` as R1's; every entry is reached", () => {
  const w = world();
  for (let i = 1; i <= 502; i++)
    w.promote(id(i), actionMd(id(i), [...CP, "action_kind: other", "clock:", ...CLK(i % 2 ? "2026-01-01" : "2027-01-01")]));
  const p1 = w.c.overdueClocks({ viewer: M });
  /* 500 actions read, 250 of them with a past entry: the page ends on the action bound, its cursor the last action read. */
  assert.deepEqual([p1.items.length, p1.truncated, p1.cursor], [250, true, `${id(500)}#0`]);
  const p2 = w.c.overdueClocks({ viewer: M, after: p1.cursor });
  assert.deepEqual([p2.items.map(key), p2.truncated, p2.cursor], [[`${id(501)}:0`], false, null]);
  const q = w.c.overdueClocks({ viewer: M, limit: 2 });
  assert.deepEqual([q.items.map(key), q.truncated, q.cursor], [[`${id(1)}:0`, `${id(3)}:0`], true, `${id(3)}#0`]);
  const seen = [];
  let after = null;
  for (let n = 0; n < 1000; n++) {
    const p = w.c.overdueClocks({ viewer: M, limit: 7, after });
    seen.push(...p.items.map(key));
    assert.equal(p.cursor === null, !p.truncated);
    if (!p.truncated) break;
    after = p.cursor;
  }
  assert.deepEqual(seen, Array.from({ length: 251 }, (_, i) => `${id(2 * i + 1)}:0`), "every entry once, in order");
  assert.deepEqual(w.c.overdueClocks({ viewer: M, after: id(501) }).items.length, 0, "an action id: after all its entries");
  assert.equal(w.c.overdueClocks({ viewer: M, limit: 9999 }).limit, 500);
});

test("R7 overdue is derived at the read and a stored status is reported beside the derivation, never in place of it; a proposal carries its basis and no date is written into the record", () => {
  const w = world();
  w.action(A, ["clock:", ...CLK("2026-12-01", "overdue"), ...CLK("2026-09-01")]);
  const at = (iso) => w.c.overdueClocks({ viewer: M, now: Date.parse(iso) }).items.map((x) => [x.ord, x.status, x.past]);
  /* a stored `overdue` not yet past is answered with both: the stored mark and the derivation. */
  assert.deepEqual(at("2026-09-28T00:00:00Z"), [[0, "overdue", false], [1, "pending", true]]);
  assert.deepEqual(at("2026-12-02T00:00:00Z"), [[0, "overdue", true], [1, "pending", true]]);
  assert.deepEqual(at("2026-08-01T00:00:00Z"), [[0, "overdue", false]], "pending and not past: not overdue");
  assert.deepEqual(w.c.pendingClocks({ before: "2026-09-02", viewer: M }).items.map((x) => [x.ord, x.past]), [[1, true]]);
  /* the document is the same before and after every read: nothing is computed into it. */
  const text = w.text(A);
  w.c.overdueClocks({ viewer: M }); w.c.pendingClocks({ before: "2027-01-01", viewer: M });
  w.actions.actionCorrespond({ target: A, direction: "received", at: "2026-09-01", account: "got it", viewer: M, author: M });
  const t2 = w.text(A);
  const p = w.c.clockPropose({ target: A, rule: "records_answer", proposer: MACHINE, viewer: MACHINE });
  assert.ok(p.proposal.entry.basis.length > 0 && /Test Stat/.test(p.proposal.entry.basis), "every deadline names its basis");
  assert.equal(w.text(A), t2, "a proposal writes no date into the record");
  assert.notEqual(text, t2);
});

test("R9 every read answers an invisible action as an absent one; the module's tables are keyed by bundle_id and purge with the action; no place is named; tests run on the test profile", () => {
  const w = world();
  w.action(A, ["clock:", ...CLK("2026-09-01")]);
  w.actions.actionCorrespond({ target: A, direction: "received", at: "2026-09-01", account: "got it", viewer: M, author: M });
  assert.equal(w.c.clockPropose({ target: A, rule: "records_answer", proposer: M, viewer: M }).ok, true);
  assert.equal(w.c.reminderSet({ target: A, entry: 0, on: "2026-09-20", author: M, viewer: M }).ok, true);
  const N = "nobody";
  assert.equal(w.c.pendingClocks({ before: "2027-01-01", viewer: N }).items.length, 0);
  assert.equal(w.c.overdueClocks({ viewer: N }).items.length, 0);
  assert.equal(w.c.remindersDue({ viewer: N }).items.length, 0);
  assert.equal(w.c.clockPropose({ target: A, rule: "records_answer", proposer: M, viewer: N }).reason, "NO_SUCH_BUNDLE");
  assert.equal(w.c.clockPropose({ target: "ACTN-2026-0404-q", rule: "records_answer", proposer: M, viewer: M }).reason, "NO_SUCH_BUNDLE");
  const hidden = w.c.remindersFor({ action: A, viewer: N }), absent = w.c.remindersFor({ action: "ACTN-2026-0404-q", viewer: M });
  assert.deepEqual([hidden.reason, hidden.detail], [absent.reason, absent.detail]);
  assert.equal(hidden.reason, "NO_SUCH_ACTION");
  for (const t of clocks.ACTION_CLOCKS_TABLES)
    assert.ok(w.rows(`PRAGMA table_info(${t})`).some((c) => c.name === "bundle_id"), `${t} keyed by bundle_id`);
  /* a second action's rows survive the first's purge; the whole-store purge clears both tables. */
  w.action(B, ["clock:", ...CLK("2026-09-01")]);
  w.c.reminderSet({ target: B, entry: 0, on: "2026-09-20", author: M, viewer: M });
  const r = w.record.purge({ bundleId: A });
  assert.equal(r.ok, true);
  assert.equal(r.removed.action_reminders, 1); assert.equal(r.removed.action_clock_proposals, 1);
  for (const t of clocks.ACTION_CLOCKS_TABLES) assert.equal(w.rows(`SELECT COUNT(*) AS n FROM ${t} WHERE bundle_id=?`, A)[0].n, 0, t);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_reminders WHERE bundle_id=?`, B)[0].n, 1);
  w.record.purge({});
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_reminders`)[0].n, 0);
  assert.ok(clocks.actionClocksOwns("action_reminders") && clocks.actionClocksOwns({ name: "action_clock_proposals" }));
  assert.ok(!clocks.actionClocksOwns("correspondence"));
  /* no place in outward text. */
  const oak = profile("oakland-alameda");
  const outward = JSON.stringify([clocks.ACTION_CLOCK_CHECKS, w.c.clockPropose({ target: B, rule: "x", proposer: M, viewer: M }),
    w.c.reminderSet({ target: B, entry: 9, on: "2026-09-20", author: M, viewer: M })]);
  for (const p of ["Oakland", "Alameda", "California", "CPRA", ...oak.covers]) assert.ok(!outward.includes(p), p);
  assert.equal(profile("test-port-ellery").test, true);
  assert.deepEqual(w.record.getSetting("jurisdiction_profiles"), ["test-port-ellery"]);
});

test("R3 R5 the action's project is the project of the first determination among its rests_on legs that the viewer may see, read through conformance; null when it rests on none (K702)", () => {
  const w = world();
  for (const x of ["INFO-2026-0001-d", "CONF-2026-0001-hidden", "CONF-2026-0002-seen", "CONF-2026-0003-later"]) w.doc(x);
  w.determinations.set("CONF-2026-0001-hidden", { project: "PROJ-2026-0009", sees: [BOB] });
  w.determinations.set("CONF-2026-0002-seen", { project: "PROJ-2026-0001", sees: [M, BOB] });
  w.determinations.set("CONF-2026-0003-later", { project: "PROJ-2026-0002", sees: [M, BOB] });
  const legs = (...l) => ["action_basis:", ...l.flatMap(([t, k]) => [`  - target: ${t}`, `    kind: ${k}`])];
  w.action(A, ["clock:", ...CLK("2026-09-01"), ...legs(["CONF-2026-0003-later", "advances"], ["INFO-2026-0001-d", "rests_on"],
    ["CONF-2026-0001-hidden", "rests_on"], ["CONF-2026-0002-seen", "rests_on"], ["CONF-2026-0003-later", "rests_on"])]);
  w.action(B, ["clock:", ...CLK("2026-09-01"), ...legs(["CONF-2026-0002-seen", "advances"])]);
  const proj = (viewer) => w.c.overdueClocks({ viewer }).items.map((x) => [x.action, x.project]);
  assert.deepEqual(proj(M), [[A, "PROJ-2026-0001"], [B, null]], "an advances leg, a document and an unseen determination are passed over");
  assert.deepEqual(proj(BOB), [[A, "PROJ-2026-0009"], [B, null]], "the first the viewer sees");
  w.c.reminderSet({ target: A, entry: 0, on: "2026-09-20", author: M, viewer: M });
  w.c.reminderSet({ target: B, entry: 0, on: "2026-09-20", author: M, viewer: M });
  assert.deepEqual(w.c.remindersDue({ viewer: M }).items.map((x) => [x.action, x.project]), [[A, "PROJ-2026-0001"], [B, null]]);
});
