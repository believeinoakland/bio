/* action-grammar at T47 (T47-36; N959, N961; K2982): R27, `clockMovesNotMechanical` stated as R33's date rule, the time of
   day `actions`' own arm (its R98); and R28, the `where`s of the rows `action-records` now raises, with the census arm's
   control that every row's `where` names a region in the file it names. Each at the module's interface with its negative
   controls (K874). Pure functions; the day is handed in. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import * as AG from "../../../src/action-grammar/index.mjs";
import { GOLDEN, ROW_NAMES } from "./fixture.mjs";
import { ROWS_NOW } from "./t45-rows.mjs";

/* ------------------------------------------------------------------------------------------------ R27 */

const TODAY = "2026-07-02";
const entry = (status, date, o = {}) => ({ text: "reply due", description: "the reply is due", date, basis: "s.1", status, ...o });
const moves = (held, next, today = TODAY) => AG.clockMovesNotMechanical(held, next, today);

test("R27: a pending entry whose held date is before todayIso's day, moved to overdue, is not answered, by a day or an instant; [] when every change is such a move or nothing changed; control: the same entry dated yesterday moved to overdue is not answered", () => {
  assert.deepEqual(moves([entry("pending", "2026-07-01")], [entry("overdue", "2026-07-01")]), []);
  for (const today of ["2026-07-02", "2026-07-02T00:00:00Z", "2026-07-02T23:59:59Z", "2026-07-02T09:30"])
    assert.deepEqual(moves([entry("pending", "2026-07-01")], [entry("overdue", "2026-07-01")], today), [], today);
  assert.deepEqual(moves([entry("pending", "2025-12-31")], [entry("overdue", "2025-12-31")]), [], "a year before");
  /* several such moves, and entries left as they were */
  const held = [entry("pending", "2026-06-01"), entry("met", "2026-06-05"), entry("pending", "2026-07-01"), entry("pending", "2026-08-01")];
  const next = [entry("overdue", "2026-06-01"), entry("met", "2026-06-05"), entry("overdue", "2026-07-01"), entry("pending", "2026-08-01")];
  assert.deepEqual(moves(held, next), []);
  assert.deepEqual(moves(held, structuredClone(held)), [], "nothing changed");
  assert.deepEqual(moves([], []), []);
});

test("R27: every other change of status is answered as {ord, from, to}, compared by position: a pending entry dated today or later moved to overdue (with or without due_at: no time of day is read), and any other move; controls: the same entry dated today is answered, with or without due_at, and a met entry changed is answered", () => {
  /* dated today: its day has not ended, by the date rule alone */
  assert.deepEqual(moves([entry("pending", TODAY)], [entry("overdue", TODAY)]), [{ ord: 0, from: "pending", to: "overdue" }]);
  assert.deepEqual(moves([entry("pending", TODAY)], [entry("overdue", TODAY)], "2026-07-02T23:59:59Z"), [{ ord: 0, from: "pending", to: "overdue" }]);
  /* a timed entry (action-clocks R3's due_at) moved on its own day, its instant long past: answered here like any other;
     admitting it is actions' own arm (its R98), which filters this answer */
  for (const due_at of ["00:01", "09:00", "close_of_business"])
    assert.deepEqual(moves([entry("pending", TODAY, { due_at })], [entry("overdue", TODAY, { due_at })], "2026-07-02T23:00:00Z"),
      [{ ord: 0, from: "pending", to: "overdue" }], due_at);
  /* the same timed entry dated yesterday: the date rule admits it, its time unread */
  assert.deepEqual(moves([entry("pending", "2026-07-01", { due_at: "23:59" })], [entry("overdue", "2026-07-01", { due_at: "23:59" })]), []);
  assert.deepEqual(moves([entry("pending", "2026-07-03")], [entry("overdue", "2026-07-03")]), [{ ord: 0, from: "pending", to: "overdue" }], "a date to come");
  /* a met entry changed, and every other move, even of an entry whose date has passed */
  assert.deepEqual(moves([entry("met", "2026-07-01")], [entry("pending", "2026-07-01")]), [{ ord: 0, from: "met", to: "pending" }]);
  for (const [from, to] of [["pending", "met"], ["pending", "waived"], ["overdue", "pending"], ["overdue", "met"], ["met", "overdue"], ["waived", "overdue"], ["pending", "late"]])
    assert.deepEqual(moves([entry(from, "2026-06-01")], [entry(to, "2026-06-01")]), [{ ord: 0, from, to }], `${from} → ${to}`);
  /* an entry added or removed reads its missing side as null */
  assert.deepEqual(moves([], [entry("pending", "2026-06-01")]), [{ ord: 0, from: null, to: "pending" }]);
  assert.deepEqual(moves([entry("met", "2026-06-01"), entry("pending", "2026-06-01")], [entry("met", "2026-06-01")]), [{ ord: 1, from: "pending", to: null }]);
  /* several, in position order, the admitted move left out */
  const held = [entry("pending", "2026-06-01"), entry("pending", TODAY), entry("met", "2026-06-01")];
  const next = [entry("overdue", "2026-06-01"), entry("overdue", TODAY), entry("waived", "2026-06-01")];
  assert.deepEqual(moves(held, next), [{ ord: 1, from: "pending", to: "overdue" }, { ord: 2, from: "met", to: "waived" }]);
});

test("R27: the held entry's date is the one read: an entry re-dated into the past by the write is answered; one whose held date is not YYYY-MM-DD is answered; control: the held date passed and the next one re-dated is not answered by this rule (its re-dating is actions' shape check)", () => {
  assert.deepEqual(moves([entry("pending", TODAY)], [entry("overdue", "2026-06-01")]), [{ ord: 0, from: "pending", to: "overdue" }]);
  for (const date of [undefined, null, "", "Jul 1", "2026-7-1", "2026-07-01T09:00", 20260701])
    assert.deepEqual(moves([entry("pending", date)], [entry("overdue", "2026-07-01")]), [{ ord: 0, from: "pending", to: "overdue" }], String(date));
  assert.deepEqual(moves([entry("pending", "2026-06-01")], [entry("overdue", "2026-08-01")]), []);
});

test("R27: a todayIso that names no day passes no entry, so every change is answered; control: the same move with a day named is not answered", () => {
  const held = [entry("pending", "2026-07-01")], next = [entry("overdue", "2026-07-01")];
  assert.deepEqual(moves(held, next, "2026-07-02"), []);
  for (const today of [undefined, null, "", "today", "null", "undefined", "Thu Jul 02 2026", "2026-7-2", 20260702, new Date("2026-07-02T12:00:00Z"), {}, []])
    assert.deepEqual(AG.clockMovesNotMechanical(held, next, today), [{ ord: 0, from: "pending", to: "overdue" }], String(today));
  assert.deepEqual(AG.clockMovesNotMechanical(held, next), [{ ord: 0, from: "pending", to: "overdue" }], "none handed in");
});

test("R27, R10: pure: frozen inputs read unchanged, the same answers each time, never a throw on junk", () => {
  const freeze = (o) => { if (o && typeof o === "object") { Object.values(o).forEach(freeze); Object.freeze(o); } return o; };
  const held = freeze([entry("pending", "2026-07-01"), entry("pending", TODAY)]), next = freeze([entry("overdue", "2026-07-01"), entry("overdue", TODAY)]);
  const first = moves(held, next);
  assert.deepEqual(first, [{ ord: 1, from: "pending", to: "overdue" }]);
  assert.deepEqual(moves(held, next), first);
  const junk = [undefined, null, 0, "x", {}, [], [null], [5, "x", []], [{ status: {} }], [{ status: "pending", date: {} }]];
  for (const a of junk) for (const b of junk) for (const t of [undefined, TODAY, 5, {}])
    assert.doesNotThrow(() => AG.clockMovesNotMechanical(a, b, t), JSON.stringify([a, b, t]));
});

/* ------------------------------------------------------------------------------------------------ R28 */

/* R28's rows and the sites action-records raises them at, as the requirement names them. */
const MOVED = {
  GOVERNING_LAW_CHECKS: {
    NO_LAWS: ["C-73.2", "lawEntries > is-laws-entry"], BAD_LAW_LEVEL: ["C-73.3", "lawEntries > is-laws-entry"],
    BAD_CITATION: ["C-73.4", "lawEntries > is-laws-entry"], TOO_MANY_LAWS: ["C-73.5", "lawEntries > is-laws-entry"],
  },
  RISK_TIER_REVISION_CHECKS: {
    BAD_RISK_TIER: ["C-90.2", "badRiskTier > is-bad-risk-tier"], RISK_PROPOSAL_BASIS_REFUSED: ["C-90.6", "actionRiskPropose > is-risk-propose-basis"],
  },
  ACTION_CATALOGUE_CHECKS: {
    RECEIPT_NOT_ON_SENT: ["C-117.39", "actionReceipt > is-receipt-on-sent"], MACHINE_CANNOT_SET_SCOPE: ["C-117.48", "actionScope > is-scope"],
    SCOPE_NO_REASON: ["C-117.49", "actionScope > is-scope"], SCOPE_UNCHANGED: ["C-117.50", "actionScope > is-scope"],
    MACHINE_CANNOT_RECORD_PROMISE: ["C-117.51", "actionPromise > is-promise"], PROMISE_REFUSED: ["C-117.52", "actionPromise > is-promise"],
  },
};
const RECORDS_FILE = "src/action-records/index.mjs";
/* The sites each row named before T47 (as the rows read at T46's close). */
const BEFORE = {
  NO_LAWS: "#lawEntries > is-laws-entry", BAD_LAW_LEVEL: "#lawEntries > is-laws-entry", BAD_CITATION: "#lawEntries > is-laws-entry",
  TOO_MANY_LAWS: "#lawEntries > is-laws-entry", BAD_RISK_TIER: "#badRiskTier > is-bad-risk-tier",
  RISK_PROPOSAL_BASIS_REFUSED: "actionRiskPropose > is-risk-propose-basis", RECEIPT_NOT_ON_SENT: "actionReceipt > is-receipt-on-sent",
  MACHINE_CANNOT_SET_SCOPE: "actionScope > is-scope", SCOPE_NO_REASON: "actionScope > is-scope", SCOPE_UNCHANGED: "actionScope > is-scope",
  MACHINE_CANNOT_RECORD_PROMISE: "actionPromise > is-promise", PROMISE_REFUSED: "actionPromise > is-promise",
};
const allRows = () => ROW_NAMES.flatMap((t) => Object.entries(AG[t]).map(([code, row]) => ({ table: t, code, row })));

test("R28: the twelve rows whose raising site moved to action-records (C-73.2–.5, C-90.2, C-90.6, C-117.39, C-117.48–.52) name that site, src/action-records/index.mjs, each in its own table under its own code, its number and translation unchanged", () => {
  let n = 0;
  for (const [table, rows] of Object.entries(MOVED)) for (const [code, [check, site]] of Object.entries(rows)) {
    const row = AG[table][code];
    assert.deepEqual(Object.keys(row), ["check", "where", "translation"], code);
    assert.equal(row.check, check, code);
    assert.equal(row.where, `${RECORDS_FILE} ${site}`, code);
    const was = table === "ACTION_CATALOGUE_CHECKS" ? ROWS_NOW[code] : GOLDEN.rows[table][code];
    assert.equal(row.translation, was.translation, `${code}: translation unmoved`);
    n++;
  }
  assert.equal(n, 12);
  /* the translations of the six catalogue rows are words.json's, read by key (R26), as before */
  for (const code of Object.keys(MOVED.ACTION_CATALOGUE_CHECKS)) assert.equal(AG.ACTION_CATALOGUE_CHECKS[code].translation, AG.ACTION_GRAMMAR_WORDS[`refusal.${code}`], code);
});

test("R28: no other row moves: exactly those twelve name action-records, every other row's where names actions' or this module's site as before; control: C-32.21 stays actions' #seeksFence (its R72) and C-73.1, C-73.6, C-90.1 stay where they were", () => {
  const moved = new Set(Object.values(MOVED).flatMap((rows) => Object.keys(rows)));
  /* T48 (R29) adds five rows to those naming action-records; they are pinned in t48.test.mjs */
  const T48_MOVED = ["MACHINE_CANNOT_CORRESPOND", "BAD_DATE", "CAPTURE_AND_TESTIMONY", "NEITHER_CAPTURE_NOR_TESTIMONY", "UNREGISTERED_ARTIFACT"];
  const naming = allRows().filter(({ row }) => row.where.startsWith(`${RECORDS_FILE} `)).map(({ code }) => code).sort();
  assert.deepEqual(naming, [...moved, ...T48_MOVED].sort());
  for (const { code, row } of allRows()) if (!moved.has(code) && !T48_MOVED.includes(code)) assert.match(row.where, /^src\/(actions\/index|action-grammar\/checks)\.mjs /, code);
  assert.equal(AG.RECORDS_LAW_FENCE_CHECKS.MACHINE_CANNOT_STATE_SEEKS.where, "src/actions/index.mjs #seeksFence > is-machine-state-seeks");
  assert.equal(AG.GOVERNING_LAW_CHECKS.GOVERNING_LAWS_REWRITTEN.where, "src/actions/index.mjs #lawsFence > is-promote-governing-laws");
  assert.equal(AG.GOVERNING_LAW_CHECKS.RECORDS_LAW_REFUSED.where, "src/action-grammar/checks.mjs recordsLawRefusal > is-records-law");
  assert.equal(AG.RISK_TIER_REVISION_CHECKS.RISK_TIER_REWRITTEN.where, "src/actions/index.mjs #tierFence > is-promote-risk-tier");
  /* each moved row named its actions site before, the same region */
  for (const code of moved) {
    const row = allRows().find((r) => r.code === code).row;
    assert.equal(row.where.split(" > ")[1], BEFORE[code].split(" > ")[1], `${code}: the same region`);
  }
});

test("R28: golden.json and t45-rows.mjs follow the changed wheres: the recorded rows hold the new sites and none of the old ones; control: every other recorded where is as recorded", () => {
  const recorded = readFileSync(new URL("./golden.json", import.meta.url), "utf8");
  const t45 = readFileSync(new URL("./t45-rows.mjs", import.meta.url), "utf8");
  for (const [table, rows] of Object.entries(MOVED)) for (const [code, [, site]] of Object.entries(rows)) {
    const want = `${RECORDS_FILE} ${site}`;
    if (table === "ACTION_CATALOGUE_CHECKS") assert.equal(ROWS_NOW[code].where, want, code);
    else assert.equal(GOLDEN.rows[table][code].where, want, code);
  }
  for (const site of new Set(Object.values(BEFORE))) {
    assert.ok(!recorded.includes(`src/actions/index.mjs ${site}`), `golden.json still names ${site}`);
    assert.ok(!t45.includes(`src/actions/index.mjs ${site}`), `t45-rows.mjs still names ${site}`);
  }
  assert.equal(GOLDEN.rows.GOVERNING_LAW_CHECKS.GOVERNING_LAWS_REWRITTEN.where, "src/actions/index.mjs #lawsFence > is-promote-governing-laws");
  assert.equal(GOLDEN.rows.RISK_TIER_REVISION_CHECKS.RISK_TIER_REASON_REFUSED.where, "src/actions/index.mjs actionRiskTier > is-risk-tier-act");
});

test("R28 (the census arm): every row's where names a region that exists in the file it names: the file is held, it opens and closes the DEC-49 region, and it holds the function the where names; negative control: a where naming a region the file lacks, or a file not held, is caught", () => {
  const ROOT = new URL("../../../", import.meta.url);
  const fault = (where) => {
    const m = /^(\S+) (#?)([A-Za-z_$][\w$]*) > (is-[a-z0-9-]+)$/.exec(where);
    if (!m) return "not of the form <file> <function> > <region>";
    const file = new URL(m[1], ROOT);
    if (!existsSync(file)) return `${m[1]} is not held`;
    const src = readFileSync(file, "utf8");
    /* a region opens `DEC-49 REGION <name>` (its comment may go on, `actions`' do) and closes `END DEC-49 REGION <name>` */
    const opens = new RegExp(`(^|[^D])DEC-49 REGION ${m[4]}(?![a-z0-9-])`), closes = new RegExp(`END DEC-49 REGION ${m[4]}(?![a-z0-9-])`);
    if (!opens.test(src.replace(/END DEC-49 REGION/g, "")) || !closes.test(src)) return `${m[1]} holds no region ${m[4]}`;
    const fn = m[3].replace(/\$/g, "\\$");
    const defined = new RegExp(`(function\\s+${fn}\\s*\\(|(^|\\s)(static\\s+)?(async\\s+)?${m[2] === "#" ? "#" : "#?"}${fn}\\s*\\(|(const|let)\\s+${fn}\\s*=)`, "m");
    if (!defined.test(src)) return `${m[1]} defines no ${m[2]}${m[3]}`;
    return null;
  };
  /* the arm's own controls */
  assert.equal(fault("src/action-grammar/checks.mjs seeksFindings > is-seeks"), null);
  assert.match(fault("src/action-grammar/checks.mjs seeksFindings > is-nowhere"), /holds no region/);
  assert.match(fault("src/action-grammar/checks.mjs noSuchFunction > is-seeks"), /defines no/);
  assert.match(fault("src/nowhere/index.mjs f > is-seeks"), /is not held/);
  /* every row */
  const faults = allRows().map(({ code, row }) => [code, row.where, fault(row.where)]).filter(([, , f]) => f);
  assert.deepEqual(faults, []);
});
