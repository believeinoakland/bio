/* actions' T46 entry at its interface (T46-32; N922, N913; DEC-194; K2874, K2953): R98, the mechanical clock write
   admitting a timed entry once its instant has passed in its zone (amending R33), and R99, the keyed sentences
   answered with their keys and the words `words.json` holds for them, read by key (amending R74, R82, R87, R92, R93; four
   since T47, R87's moved to `action-records`).
   Each refusal beside its control; the jurisdiction view is the test profile's (America/Halifax, UTC-3 in September). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world, V, MACHINE, actionMd, CP } from "./fixture.mjs";
import * as actions from "../../../src/actions/index.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c", D = "ACTN-2026-0004-d";
const M = V("alice");
const WORDS = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json",
  import.meta.url), "utf8")).words;
const en = (key) => {
  const w = WORDS.find((x) => x.key === key);
  assert.ok(w, `words.json holds ${key}`);
  return w.en;
};

/* ================================================================ R98: the mechanical write of a timed entry */

const recheck = { writer: "mechanical", operation: "deadline-recheck" };
/* A pending entry due on 28 September, at a time of day when `at` is given (and in `zone` when that is given). */
const entry = ({ at = null, zone = null, date = "2026-09-28" } = {}) => ["clock:", '  - text: "reply"', '    description: "d"',
  `    date: ${date}`, "    basis: Act s.2", "    status: pending", ...(at ? [`    due_at: ${at}`] : []), ...(zone ? [`    due_zone: ${zone}`] : [])];
const overdue = (w, id, opts = {}) => w.promote(id, w.text(id).replace("status: pending", opts.to || "status: overdue"),
  { author: MACHINE, extra: recheck });

test("R98 a pending entry carrying due_at is moved to overdue by the mechanical recheck once its instant has passed in the office's zone, and refused before it; a date-only entry is still refused on its own day", () => {
  const w = world();
  w.action(A, entry({ at: "2026-09-28T17:00" }));           /* 17:00 in Halifax is 20:00 UTC */
  w.action(B, entry());
  w.clock.ms = Date.parse("2026-09-28T19:59:00Z");
  const early = overdue(w, A);
  assert.deepEqual([early.ok, early.reason, early.check], [false, "CLOCK_STATUS_NOT_MECHANICAL", "C-117.1"], "before its instant");
  assert.deepEqual(early.moves, [{ ord: 0, from: "pending", to: "overdue" }]);
  assert.equal(w.fm(A).clock[0].status, "pending", "nothing was written");
  w.clock.ms = Date.parse("2026-09-28T20:00:00Z");
  const moved = overdue(w, A);
  assert.equal(moved.ok, true, JSON.stringify(moved).slice(0, 300));
  assert.deepEqual([w.fm(A).clock[0].status, w.fm(A).clock[0].due_at], ["overdue", "2026-09-28T17:00"], "moved on its own day");
  /* the control: a date-only entry on its own day is refused at the same instant, and moved once the local day ends */
  assert.equal(overdue(w, B).reason, "CLOCK_STATUS_NOT_MECHANICAL", "a date only: its day has not passed");
  w.clock.ms = Date.parse("2026-09-29T03:00:00Z");
  assert.equal(overdue(w, B).ok, true, "a date only: moved as before, once its date has passed");
});

test("R98 the entry's due_zone governs where it states one; else the office's zone (R12); with no zone held a timed entry without due_zone is never moved", () => {
  const w = world();
  w.action(A, entry({ at: "2026-09-28T17:00", zone: "UTC" }));
  w.action(B, entry({ at: "2026-09-28T17:00" }));
  w.clock.ms = Date.parse("2026-09-28T17:30:00Z");
  assert.equal(overdue(w, A).ok, true, "17:00 in UTC has passed");
  assert.equal(overdue(w, B).reason, "CLOCK_STATUS_NOT_MECHANICAL", "17:00 in Halifax has not");
  /* no profile active: no office zone; an entry stating its zone is still read in it */
  const nz = world({ profiles: null });
  nz.action(C, entry({ at: "2026-09-28T17:00", zone: "America/Halifax" }));
  nz.action(D, entry({ at: "2026-09-28T17:00" }));
  nz.clock.ms = Date.parse("2026-09-28T20:00:00Z");
  assert.equal(overdue(nz, C).ok, true);
  nz.clock.ms = Date.parse("2026-12-01T00:00:00Z");
  assert.equal(overdue(nz, D).reason, "CLOCK_STATUS_NOT_MECHANICAL", "no zone: undetermined, never moved");
});

test("R98 R33 the timed arm admits pending to overdue and nothing else: met, waived, a re-dated or re-timed entry, a time of day on another date, a wall time the zone skips, a write not the recheck, are refused", () => {
  const w = world();
  w.clock.ms = Date.parse("2026-09-28T21:00:00Z");
  w.action(A, entry({ at: "2026-09-28T17:00" }));
  for (const to of ["status: met", "status: waived"])
    assert.equal(overdue(w, A, { to }).reason, "CLOCK_STATUS_NOT_MECHANICAL", to);
  const retimed = w.text(A).replace("status: pending", "status: overdue").replace("due_at: 2026-09-28T17:00", "due_at: 2026-09-28T09:00");
  assert.equal(w.promote(A, retimed, { author: MACHINE, extra: recheck }).reason, "CLOCK_STATUS_NOT_MECHANICAL", "never re-timed");
  assert.equal(w.promote(A, w.text(A).replace("status: pending", "status: overdue"), { author: MACHINE }).reason,
    "CLOCK_STATUS_NOT_MECHANICAL", "a machine write that is not the recheck");
  /* a time of day not on the entry's own date is read by the date alone */
  w.action(B, entry({ at: "2026-09-27T17:00" }));
  assert.equal(overdue(w, B).reason, "CLOCK_STATUS_NOT_MECHANICAL");
  /* 02:30 on 8 March 2026 does not occur in Halifax (the clocks go from 02:00 to 03:00): read by its date alone */
  w.action(C, entry({ date: "2026-03-08", at: "2026-03-08T02:30" }).map((l) => l.replace("2026-09-28", "2026-03-08")));
  w.clock.ms = Date.parse("2026-03-08T12:00:00Z");
  assert.equal(overdue(w, C).reason, "CLOCK_STATUS_NOT_MECHANICAL", "a skipped wall time never moves it early");
  /* the control: the same entry moved by the recheck once its instant has passed */
  w.clock.ms = Date.parse("2026-09-28T21:00:00Z");
  assert.equal(overdue(w, A).ok, true);
});

test("R98 dueInstant reads an entry's time of day as action-clocks' dueAtOf does: its due_zone, else the zone given; null for a date only", () => {
  const e = { date: "2026-09-28", due_at: "2026-09-28T17:00" };
  assert.equal(actions.dueInstant(e, "America/Halifax"), Date.parse("2026-09-28T20:00:00Z"));
  assert.equal(actions.dueInstant({ ...e, due_zone: "UTC" }, "America/Halifax"), Date.parse("2026-09-28T17:00:00Z"));
  assert.equal(actions.dueInstant({ ...e, due_at: "2026-09-28T17:00:30" }, "UTC"), Date.parse("2026-09-28T17:00:30Z"), "seconds");
  for (const none of [[{ date: "2026-09-28" }, "UTC"], [e, null], [{ ...e, due_at: "17:00" }, "UTC"], [{ ...e, due_at: "2026-09-29T17:00" }, "UTC"],
                      [{ ...e, due_zone: "Mars/Olympus" }, "UTC"], [null, "UTC"]])
    assert.equal(actions.dueInstant(...none), null, JSON.stringify(none));
});

/* ================================================================ R99: the keyed sentences, read by key */

const KEYS = ["actions.override.ground_not_stated", "actions.reply.not_owed", "actions.openitems.not_office",
              "actions.recognition.promise_only"];
/* R87's key moved with its act to action-records (its R14; T47, N961). */
const SCOPE_KEY = "actions.scope.published_stays";
/* The sentences as T45 worded them, which none of these answers any longer. */
const T45 = ["This override was stated before a ground was asked for; it reads as written, with its reason alone.",
  "This body owes the team no reply, so silence is never recorded as a non-response.",
  "This changes what is published from now on; anything already signed and published stays as it was.",
  "This action is not addressed to an office, so no open items with an office are shown.",
  "This recognition rests on no compliant determination or success record: the fix is only promised."];
const said = (x, key) => {
  assert.deepEqual([x.key, x.says], [key, en(key)], key);
  assert.equal(x.says, actions.ACTIONS_WORDS[key], `${key} read from ACTIONS_WORDS`);
};

test("R99 ACTIONS_WORDS holds exactly the four keys this module answers, each words.json's en verbatim, read by key; T45_SENTENCES answers each key with them", () => {
  assert.ok(Object.isFrozen(actions.ACTIONS_WORDS));
  assert.deepEqual(Object.keys(actions.ACTIONS_WORDS).sort(), [...KEYS].sort());
  for (const k of KEYS) assert.equal(actions.ACTIONS_WORDS[k], en(k), `${k} verbatim`);
  assert.deepEqual(Object.values(actions.T45_SENTENCES).map((s) => s.key).sort(), [...KEYS].sort());
  for (const s of Object.values(actions.T45_SENTENCES)) said(s, s.key);
  for (const old of T45) assert.ok(!Object.values(actions.ACTIONS_WORDS).includes(old), old);
});

test("R99 R74 an override written before T45 answers ground_not_stated with words.json's words; one stating a ground answers none", () => {
  const w = world({ conformance: { determinationRead: () => ({ ok: false }) } });
  w.promote(A, actionMd(A, [...CP, "action_kind: other", "breach: true", "premise_override:", '  reason: "old"']), { extra: { replay: true } });
  said(w.a.actionRead({ id: A, viewer: M }).premise_override.ground_not_stated, KEYS[0]);
  /* the control: a ground stated, no sentence */
  assert.equal(w.promote(B, actionMd(B, [...CP, "action_kind: other", "breach: true", "premise_override:", '  reason: "r"',
    "  ground_kind: legal_deadline", '  ground_citation: "Records Act s.6"', "  ground_date: 2026-10-30"])).ok, true);
  assert.equal(w.a.actionRead({ id: B, viewer: M }).premise_override.ground_not_stated, undefined);
});

test("R99 R82 reply_owed: false answers actions.reply.not_owed with its words, {reason} left for the screen and the member's reason beside it, in the read and beside NO_REPLY_OWED; an owed reply answers none", () => {
  const w = world();
  assert.equal(w.promote(A, actionMd(A, [...CP, "action_kind: other", "reply_owed: false", 'reply_owed_reason: "a public statement"'])).ok, true);
  const r = w.a.actionRead({ id: A, viewer: M }).reply_owed;
  said(r, KEYS[1]);
  assert.deepEqual([r.owed, r.reason], [false, "a public statement"]);
  assert.match(r.says, /\{reason\}/, "the placeholder is the screen's to fill");
  const refused = w.a.actionCorrespond({ target: A, direction: "no_response", at: "2026-09-20", account: "silence", viewer: M, author: M });
  assert.deepEqual([refused.reason, refused.code, refused.reply_owed, refused.reply_owed_reason], ["NO_REPLY_OWED", "NO_REPLY_OWED", false,
    "a public statement"]);
  said(refused, KEYS[1]);
  /* the control: absent reads owed, no sentence, and the no_response lands */
  w.action(B);
  const owed = w.a.actionRead({ id: B, viewer: M }).reply_owed;
  assert.deepEqual([owed.owed, owed.key, owed.says, owed.reason], [true, undefined, undefined, undefined]);
  assert.equal(w.a.actionCorrespond({ target: B, direction: "no_response", at: "2026-09-20", account: "silence", viewer: M, author: M }).ok, true);
});

test("R99 (T47) actions.scope.published_stays moved with R87 to action-records (its R14): this module holds and answers none of it, and the scope's act answers it there", () => {
  assert.equal(SCOPE_KEY in actions.ACTIONS_WORDS, false);
  assert.ok(!Object.values(actions.T45_SENTENCES).some((x) => x.key === SCOPE_KEY));
  const w = world();
  w.action(A);
  const set = w.a.records.actionScope({ target: A, confidential: true, reason: "a source's safety", viewer: M, author: M });
  assert.deepEqual([set.ok, set.published.key, set.published.says], [true, SCOPE_KEY, en(SCOPE_KEY)], "answered by action-records");
  /* the control: no answer of this module carries the key, the read of a confidential action included */
  assert.ok(!JSON.stringify(w.a.actionRead({ id: A, viewer: M })).includes(SCOPE_KEY));
});

test("R99 R92 openItemsWith a non-office addressee answers actions.openitems.not_office with its words; an office answers none", () => {
  const w = world();
  w.action(A);
  const aud = w.a.openItemsWith({ counterparty: { state: "audience", description: "readers" }, viewer: M });
  assert.deepEqual(aud.items, []);
  said(aud, KEYS[2]);
  const office = w.a.openItemsWith({ counterparty: { state: "named", role: "Town Clerk", body: "Town of Port Ellery" }, viewer: M });
  assert.deepEqual([office.items.map((x) => x.action), office.key], [[A], undefined]);
});

test("R99 R93 a recognition resting on nothing answers actions.recognition.promise_only with its words; one on a compliant determination answers none", () => {
  const CO = "CONF-2026-0002-compliant";
  const w = world({ conformance: { determinationRead: ({ id }) => (id === CO
    ? { ok: true, id: CO, live: true, superseded_by: null, outcomes: [{ standard: "STD-2026-0001-standard", outcome: "compliant" }], findings: [] }
    : { ok: false }) } });
  assert.equal(w.promote(CO, ["---", `id: ${CO}`, "object_type: determination", `title: ${CO}`, "current_state: recorded",
    'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"), { extra: { replay: true } }).ok, true);
  assert.equal(w.promote(A, actionMd(A, [...CP, "action_kind: recognition_letter"])).ok, true);
  assert.equal(w.promote(B, actionMd(B, [...CP, "action_kind: recognition_letter", "action_basis:", `  - target: ${CO}`, "    kind: rests_on"])).ok, true);
  const basis = w.a.actionRead({ id: A, viewer: M }).recognition_basis;
  assert.equal(basis.basis, "promise_only");
  said(basis, KEYS[3]);
  assert.deepEqual(w.a.actionRead({ id: B, viewer: M }).recognition_basis, { basis: "compliant" });
});

test("R99 no answer of this module carries the sentences T45 worded", () => {
  const w = world();
  w.promote(A, actionMd(A, [...CP, "action_kind: other", "reply_owed: false", 'reply_owed_reason: "r"', "premise_override:", '  reason: "old"',
    "breach: true"]), { extra: { replay: true } });
  const text = JSON.stringify([w.a.actionRead({ id: A, viewer: M }),
    w.a.openItemsWith({ counterparty: { state: "audience", description: "x" }, viewer: M }),
    w.a.actionCorrespond({ target: A, direction: "no_response", at: "2026-09-20", account: "s", viewer: M, author: M })]);
  for (const old of T45) assert.ok(!text.includes(old), old);
  for (const k of KEYS.slice(0, 3)) assert.ok(text.includes(JSON.stringify(en(k)).slice(1, -1)), k);
});

/* ================================================================ R110: an entry stored overdue keeps the flag */

test("R110 R12 R33 clock_overdue is also true when any clock entry is stored overdue; clock_next is unchanged; controls: none stored overdue, a met entry", () => {
  const w = world();
  const two = ["clock:", '  - text: "first"', '    description: "d"', "    date: 2026-09-28", "    basis: Act s.2", "    status: pending",
    '  - text: "second"', '    description: "d"', "    date: 2026-10-30", "    basis: Act s.2", "    status: pending"];
  w.action(A, two);
  w.action(B, entry());
  w.action(C, entry());
  w.clock.ms = Date.parse("2026-10-25T12:00:00Z");
  const flags = (id) => { const r = w.a.actionRead({ id, viewer: M }); return [r.clock_next, r.clock_overdue]; };
  assert.deepEqual(flags(A), [null, null].map((_, i) => i ? true : "2026-09-28"), "both pending, the first passed: overdue as before");
  /* the mechanical recheck stores the first entry overdue; the second stays pending and not yet due */
  const text = w.text(A).replace("status: pending", "status: overdue");
  assert.equal(w.promote(A, text, { author: MACHINE, extra: recheck }).ok, true);
  assert.deepEqual(flags(A), ["2026-10-30", true], "the stored overdue entry keeps the flag; clock_next is the pending one");
  /* only the overdue entry left */
  assert.equal(overdue(w, B).ok, true);
  assert.deepEqual(flags(B), [null, true], "no pending entry: clock_next null, clock_overdue true");
  /* control: a met entry (no entry overdue, none pending) is not overdue */
  assert.equal(w.promote(C, w.text(C).replace("status: pending", "status: met"), { author: M }).ok, true);
  assert.deepEqual(flags(C), [null, false], "met: not overdue");
  /* control: a pending entry not yet due, none stored overdue */
  const later = world();
  later.action(D, entry({ date: "2026-12-01" }));
  later.clock.ms = Date.parse("2026-10-25T12:00:00Z");
  assert.deepEqual([later.a.actionRead({ id: D, viewer: M }).clock_next, later.a.actionRead({ id: D, viewer: M }).clock_overdue], ["2026-12-01", false]);
});
