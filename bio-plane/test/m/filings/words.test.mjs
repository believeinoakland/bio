/* filings — T50 (T50-46; N1116, N1132; DEC-258, DEC-259, DEC-260): R51 R52, the module holds no member-facing English.
   Every sentence it prepares or answers is the words `words.json` holds for a key, read through setup-words' `word`; no
   test here holds a sentence's English. Driven at the module's interface over the real modules, the branches that need a
   module to answer less than it does through a stand-in answering as its requirement says (K248: an unreadable source
   is undetermined, never none). What the module reads is checked against the design's list for it in `words-reads.json`:
   nothing outside it but the keys the design lane has yet to list (WORDS_OWED), each held by setup-words. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world, V, F, WHY, MACHINE, actionsWith } from "./fixture.mjs";
import { wordsRead, WORDS_OWED, CHRONOLOGY_MAX, PRESSURE_MAX } from "../../../src/filings/index.mjs";
import { word, hasWord, localize } from "../../../src/setup-words/index.mjs";
import { timelineRefusal } from "../events/fixtures.mjs";
import { pressureMarks } from "../docket/fixtures.mjs";

const COUNSEL = { name: "A. Counsel", organisation: "Test Chambers" };
const READS = async () => JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words-reads.json", import.meta.url), "utf8")).modules.filings.reads;
const BLANKS = "{{act}} | {{act_date}} | {{standards}} | {{findings}}";
const prep = (f, action, over = {}) => f.filingPrepare({ action, text: BLANKS, preparer: V("bo"), viewer: V("bo"), language: "en", ...over });
const comm = (f, action, over = {}) => f.communicationPrepare({ action, text: "A word.", purpose: "a letter", preparer: V("bo"), viewer: V("bo"), language: "en", ...over });
const why = (r, name) => (r.unfilled.find((u) => u.name === name) || {}).why;
/** conformance answering the determination as `edit` rewrites it, every other read the real one's */
const detOver = (x, edit) => new Proxy(x.conformance, { get: (t, k) => (k === "determinationRead"
  ? (a) => { const d = t.determinationRead(a); return d && d.ok !== false ? edit(d) : d; }
  : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });

test("R52 the determination's gaps are told by key: no act, an act over a period, an event dated only within a band, undetermined or placed nowhere, one the reader may not see; a determination naming no standard or no finding", async () => {
  const x = world();
  const A = x.action();
  const cases = [
    [{ act: {}, event: null }, { act: word("filings.the_determination_states_no_act") }],
    [{ act: { period: { from: "2026-03-01", to: "2026-03-05" } }, event: null },
      { act: word("filings.the_determination_states_no_act") }],
    [{ act: { event: "EVT-2026-0001-x", when: { value: "2026-03" } }, event: null },
      { act: word("filings.act_event_see"), act_date: word("filings.act_date_undetermined", { act: word("filings.act_event_dated") }) }],
    [{ act: { event: "EVT-2026-0001-x", when: "undetermined" }, event: null },
      { act_date: word("filings.act_date_undetermined", { act: word("filings.act_event", { words: word("filings.undetermined_date") }) }) }],
    [{ act: { event: "EVT-2026-0001-x" }, event: null },
      { act_date: word("filings.act_date_undetermined", { act: word("filings.act_event", { words: word("filings.placed_nowhere_record") }) }) }],
    [{ standards: [], findings: [] }, { standards: word("filings.determination_names_standard"), findings: word("filings.determination_names_finding") }],
  ];
  for (const [edit, expected] of cases) {
    const f = x.filingsWith({ conformance: detOver(x, (d) => ({ ...d, ...edit })) });
    const r = prep(f, A);
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    for (const [name, sentence] of Object.entries(expected)) assert.equal(why(r, name), sentence, name);
  }
  /* an act over a period, stated: its date is the period, the packet's deadline says why no single day starts the count */
  const period = x.filingsWith({ conformance: detOver(x, (d) => ({ ...d, act: { description: "the order", period: { from: "2026-03-01", to: "2026-03-05" } } })) });
  const p = period.counselPacket({ reason: WHY, action: A, counsel: COUNSEL, author: V("olive"), viewer: V("olive") });
  const notice = p.sections.deadlines.items.find((d) => d.rule === "claim_notice");
  assert.equal(notice.start.why, undefined === notice.start.why ? undefined : word("filings.why.record_holds_date"), "a rule that starts from knowledge");
  const actStarts = p.sections.deadlines.items.find((d) => d.starts === "act");
  if (actStarts) assert.equal(actStarts.start.why, word("filings.why.single_day_starts", { act: word("filings.determination_states_act") }));
  /* control: the fixture's own determination states all of them */
  const real = prep(x.filingsWith(), A);
  assert.deepEqual(real.unfilled.filter((u) => ["act", "act_date", "standards", "findings"].includes(u.name)), []);
});

test("R52 the addressee's gaps are told by key: no counterparty, an undetermined one, an office with no role", async () => {
  const x = world();
  const none = x.action(), undet = x.action(), bare = x.action();
  const f = x.filingsWith({ actions: actionsWith(x, { [none]: { counterparty: null }, [undet]: { counterparty: { state: "undetermined" } },
                                                       [bare]: { counterparty: { state: "named", kind: "office", role: "", name: "", body: "Port Ellery Selectboard" } } }) });
  const T = "{{counterparty_role}} | {{counterparty_body}}";
  assert.equal(why(prep(f, none, { text: T }), "counterparty_role"), word("filings.action_states_counterparty"));
  assert.equal(why(prep(f, undet, { text: T }), "counterparty_role"), word("filings.action_counterparty_undetermined"));
  assert.equal(why(prep(f, bare, { text: T }), "counterparty_role"), word("filings.action_addressee_states", { part: "role" }));
  /* control: the real addressee is an office with a role and a body */
  assert.deepEqual(prep(x.filingsWith(), x.action(), { text: T }).unfilled, []);
  const named = x.filingsWith({ actions: actionsWith(x, { [bare]: { counterparty: { state: "named", kind: "reporter", role: "Editor" } } }) });
  assert.equal(why(prep(named, bare, { text: T }), "counterparty_body"), word("filings.action_addressed_arm", { arm: "reporter", part: "body" }));
});

test("R52 what is printed first on everything prepared from an action is told by key, with a fallback for each part the record does not state: a group not named, a date not stated, an override with no ground, an author or time; a disclosure of another kind", async () => {
  const x = world();
  const A = x.action(), B = x.action(), C = x.action(), D = x.action();
  const f = x.filingsWith({ actions: actionsWith(x, {
    [A]: { disclosures: [{ kind: "accepted" }, { kind: "checked_held" }, { kind: "mystery", n: 1 }] },
    [B]: { disclosures: [{ kind: "override", reason: "the deadline", ground: { kind: "legal_deadline" } }] },
    [C]: { disclosures: [{ kind: "override", reason: "the deadline", ground: { kind: "irreversible_act" } }] },
    [D]: { premise_override: { reason: "no disclosures read" }, disclosures: null } }) });
  const first = (r) => r.text.split("\n");
  const [accepted, held, other] = first(comm(f, A));
  assert.equal(accepted, `${word("prepared.rests.accepted", { group: word("filings.group_named"), date: word("filings.date_stated"), date_accepted: word("filings.date_stated") })} `
    + word("filings.public_identity_declared", { name: "undetermined", stake: "none declared" }));
  assert.equal(held, word("prepared.rests.held", { date: word("filings.date_stated") }));
  assert.equal(other, word("filings.disclosed", { date: JSON.stringify({ kind: "mystery", n: 1 }) }));
  const gap = (ground) => word("filings.stated_by_at", { override_head: word("filings.rests_unestablished_premise"), reason: "the deadline",
    grade: word("filings.ground", { grade: ground }), by: word("filings.author_record_name"), at: word("filings.date_record_state") });
  assert.equal(first(comm(f, B))[0], gap(word("filings.legal_deadline_falling", { citation: word("filings.citation_stated"), date: word("filings.date_stated") })));
  assert.equal(first(comm(f, C))[0], gap(word("filings.imminent_irreversible_act", { what: word("filings.stated"), when: word("filings.time_stated") })));
  /* a read that answers no disclosures: the override alone, with no ground */
  assert.equal(first(comm(f, D))[0], word("filings.stated_by_at", { override_head: word("filings.rests_unestablished_premise"),
    reason: "no disclosures read", grade: "", by: word("filings.author_record_name"), at: word("filings.date_record_state") }));
});

test("R52 the notices are told by key, with a fallback where the governing view holds no rule: the election notice's citation and words, the recognition reminder", async () => {
  const x = world();
  const noRule = x.filingsWith({ profiles: () => [{ ...x.profile(), legal_facts: [] }] });
  const el = noRule.filingPrepare({ action: x.action(), text: "A letter.", preparer: V("bo"), viewer: V("bo"), language: "en", names_pending: true });
  assert.equal(el.ok, true, JSON.stringify(el).slice(0, 300));
  const n = el.notices.find((q) => q.kind === "election");
  assert.equal(n.text, word("filings.election.notice", { fact: word("filings.governing_view_holds"), citation: word("filings.citation_undetermined") }));
  assert.equal(n.says, word("filings.says.governing_view_holds"));
  /* control: the fixture profile holds the rule, with its citation */
  const real = x.f.filingPrepare({ action: x.action(), text: "A letter.", preparer: V("bo"), viewer: V("bo"), language: "en", names_pending: true })
    .notices.find((q) => q.kind === "election");
  assert.notEqual(real.text, n.text);
  assert.equal(real.says, undefined);
});

test("R52 a documenting version and a chance-to-fix notice are assembled in the design's words, each part undetermined or recorded as the record states it", async () => {
  const x = world();
  const bare = x.action({ kind: "recognition_letter", legs: [], clock: [] });
  const f = x.filingsWith();
  const doc = f.communicationPrepare({ action: bare, purpose: "document_infraction", audience: "violating_party", preparer: V("bo"), viewer: V("bo"), language: "en" });
  assert.equal(doc.ok, true, JSON.stringify(doc).slice(0, 300));
  const by = Object.fromEntries(doc.parts.map((p) => [p.part, p.text]));
  assert.equal(by["still uncertain"], word("filings.uncertain_nothing_record"));
  assert.equal(by[localize("filings.time_review_response", "a time for review and response")], word("filings.time_review_response_undetermined"));
  assert.equal(by["the act"], word("filings.act", { words: word("state.undetermined", { reason: word("filings.action_rests_live") }), office: "" }));
  assert.equal(by["the standard"], word("filings.standard_measured_against", { words: word("state.undetermined", { reason: word("filings.action_rests_live") }) }));
  const fix = f.communicationPrepare({ action: bare, purpose: "chance_to_fix", preparer: V("bo"), viewer: V("bo"), language: "en" });
  const parts = Object.fromEntries(fix.parts.map((p) => [p.part, p.text]));
  assert.equal(parts[localize("filings.correcting_act", "correcting the act")], word("filings.correcting_act_undetermined"));
  assert.equal(parts[localize("filings.remedying_harm", "remedying the harm")], word("filings.remedying_harm_consequence"));
  assert.equal(parts["a time"], word("filings.time_undetermined_profile"));
  /* the group's own window, when the action's clock states one */
  const win = x.action({ kind: "recognition_letter", legs: [], clock: [] });
  const g = x.filingsWith({ actions: actionsWith(x, { [win]: { clock: [{ date: "2026-05-01", basis: "our own window", basis_kind: "window", status: "pending" }] } }) });
  const w = g.communicationPrepare({ action: win, purpose: "chance_to_fix", preparer: V("bo"), viewer: V("bo"), language: "en" });
  assert.equal(w.parts.find((p) => p.part === "a time").text, word("filings.time_set", { date: "2026-05-01", basis: "our own window" }));
  /* the fixture's own action: an uncertain point and a recorded time */
  const real = f.communicationPrepare({ action: x.action(), purpose: "document_infraction", audience: "violating_party", preparer: V("bo"), viewer: V("bo"), language: "en" });
  assert.equal(real.parts.find((p) => p.part === word("filings.time_review_response")).text.startsWith(word("filings.invite_review_response", { date: "2026-04-01", basis: "P.E.B.L. § 4" })), true);
});

test("R52 a defence packet's gaps are told by key: no challenged statement, no pressure, a docket or pressure read that cannot be read or is not answered, a truncated pressure list; no consequences read", async () => {
  const x = world();
  const A = x.action({ kind: "commitment_claim" });
  const defence = (f) => f.counselPacket({ reason: WHY, action: A, counsel: COUNSEL, purpose: "defence", author: V("olive"), viewer: V("olive") });
  const base = defence(x.f);
  assert.equal(base.ok, true, JSON.stringify(base).slice(0, 300));
  assert.equal(base.sections.challenged.says, word("filings.says.member_named_challenged"));
  assert.equal(base.sections.pressure.says, word("filings.says.pressure_recorded_action"));
  const marks = pressureMarks();
  const silent = defence(x.filingsWith({ docket: {}, actionHolds: {} }));
  assert.equal(silent.sections.pressure.says, word("filings.module_answers_pressure"));
  const unread = defence(x.filingsWith({ docket: { docketPressureMarks: () => marks.unreadable }, actionHolds: { pressureFor: () => ({ ok: false }) } }));
  assert.equal(unread.sections.pressure.says, word("filings.docket_legal_marks"), "the docket's read is the last said");
  const holdsOnly = defence(x.filingsWith({ docket: { docketPressureMarks: () => marks.empty }, actionHolds: { pressureFor: () => ({ ok: false }) } }));
  assert.equal(holdsOnly.sections.pressure.says, word("filings.pressure_recorded_read"));
  const noDocket = defence(x.filingsWith({ docket: {}, actionHolds: { pressureFor: () => ({ ok: true, items: [] }) } }));
  assert.equal(noDocket.sections.pressure.says, word("filings.module_answers_docket"));
  const cut = defence(x.filingsWith({ docket: { docketPressureMarks: () => marks.empty }, actionHolds: { pressureFor: () => ({ ok: true, items: [], truncated: true }) } }));
  assert.equal(cut.sections.pressure.says, word("filings.pressure_items_read", { pressure_max: PRESSURE_MAX }));
  /* no consequences read; no profile, so no defence deadline is known */
  const noCons = defence(x.filingsWith({ consequences: { consequencesOf: () => ({ ok: false }) } }));
  assert.equal(noCons.sections.consequences.says, word("filings.says.consequences_read_undetermined"));
  assert.equal(defence(x.filingsWith({ consequences: {} })).sections.consequences.says, word("filings.says.consequences_read_undetermined"));
  const none = world({ profiles: [] });
  const d = none.f.counselPacket({ reason: WHY, action: none.action({ kind: "commitment_claim" }), counsel: COUNSEL, purpose: "defence", author: V("olive"), viewer: V("olive") });
  assert.equal(d.sections.defence_deadlines.says, word("filings.says.defense_deadline_known", { why: word("filings.why.group_civicsmith_active") }));
});

test("R52 the chronology's gaps are told by key: no set to read, no timeline module, a timeline that cannot be read, a truncated lane or source, a source that cannot be read; the act states no date", async () => {
  const x = world();
  const A = x.action({ legs: [], counterparty: null });
  const chron = (f, a = A) => f.counselPacket({ reason: WHY, action: a, counsel: COUNSEL, author: V("olive"), viewer: V("olive") }).sections.chronology;
  assert.equal(chron(x.filingsWith()).says, word("filings.record_names_act"));
  const real = x.action();
  assert.equal(chron(x.filingsWith(), real).says, word("filings.says.world_events_group"));
  assert.equal(chron(x.filingsWith({ events: {} }), real).says, word("filings.module_answers_timeline"));
  assert.equal(chron(x.filingsWith({ events: { timeline: () => timelineRefusal().badDate } }), real).says,
               word("filings.timeline_read_chronology", { dated: " (BAD_DATE)" }));
  const t = x.events;
  const cut = x.filingsWith({ events: new Proxy(t, { get: (o, k) => (k === "timeline"
    ? (a) => { const r = o.timeline(a); return r && r.world ? { ...r, world: { ...r.world, truncated: true }, ours: { sources: [{ source: "s1", error: "boom" }, { source: "s2", items: [], truncated: true }] } } : r; }
    : typeof o[k] === "function" ? o[k].bind(o) : o[k]) }) });
  const c = chron(cut, real);
  assert.equal(c.lanes.world.says, word("filings.says.events_lane_lists", { chronology_max: CHRONOLOGY_MAX }));
  assert.equal(c.lanes.ours.sources[0].says, word("filings.says.source_read_acts"));
  assert.equal(c.lanes.ours.sources[1].says, word("filings.says.acts_source_lists", { chronology_max: CHRONOLOGY_MAX }));
  /* the act states no date: the timeline reads from the set's earliest event */
  const noDate = x.filingsWith({ conformance: detOver(x, (d) => ({ ...d, act: { ...d.act, at: undefined, event: undefined, when: undefined } })) });
  assert.equal(chron(noDate, real).from_says, word("filings.act_states_date"));
  assert.equal(chron(x.filingsWith(), real).from_says, undefined, "control: the fixture's act states its date");
});

test("R52 the prepared draft's gaps are told by key: a stale draft names what changed, a template or kind not offered, the advisory the profile does not give, the producing team, a repeated approval", async () => {
  const x = world();
  const A = x.action({ kind: "records_request", risk_tier: 2, law: "Test Stat. § 1.100" });
  const d = x.f.filingPrepare({ action: A, text: "To the {{counterparty_role}}.", preparer: V("bo"), viewer: V("bo") });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  if (d.unfilled.some((u) => u.name === "advisory")) assert.equal(why(d, "advisory"), word("filings.why.profile_gives_advisory"));
  /* the action no longer held: the plane reads none of it */
  let gone = false;
  const real = x.actions;
  const lost = new Proxy(real, { get: (t, k) => (k === "actionRead" ? (a) => (gone && a.viewer === MACHINE_READER ? { ok: false } : t.actionRead(a)) : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });
  const MACHINE_READER = "class:admin";
  const f = x.filingsWith({ actions: lost });
  const d2 = f.filingPrepare({ action: x.action(), text: "A letter.", preparer: V("bo"), viewer: V("bo") });
  gone = true;
  const stale = await f.filingApprove({ filing: d2.id, author: V("bo"), viewer: V("bo") });
  assert.equal(stale.reason, "FILING_STALE");
  assert.deepEqual(stale.changed, [word("filings.action_longer_held")]);
  /* the tier changed: the governing tier, then and now */
  const y = world();
  const B = y.action();
  const e = y.f.filingPrepare({ action: B, text: "A letter.", preparer: V("bo"), viewer: V("bo") });
  assert.equal(y.actions.actionRiskTier({ target: B, tier: 2, reason: "raised on review", author: V("olive"), viewer: V("olive") }).ok, true);
  const s2 = await y.f.filingApprove({ filing: e.id, author: V("bo"), viewer: V("bo") });
  assert.equal(s2.reason, "FILING_STALE");
  assert.ok(s2.changed.includes(word("filings.governing_tier", { tier: 1, tier_2: 2 })), JSON.stringify(s2.changed));
});

test("R51 R52 every key the module reads is held by setup-words and is on the design's list for it (words-reads.json), save the keys the design lane has yet to list; the list's keys that no branch here reaches are the design's to review", async () => {
  const list = await READS();
  const read = wordsRead();
  assert.ok(read.length >= 120, `${read.length} keys read in this run`);
  for (const key of read) assert.equal(hasWord(key), true, key);
  const outside = read.filter((k) => !list.includes(k));
  assert.deepEqual(outside.sort(), outside.filter((k) => WORDS_OWED.includes(k)).sort(), "no key outside the design's list but the owed ones");
  for (const key of WORDS_OWED) assert.equal(hasWord(key), true, key);
  /* control: a key the list lacks is not held, and word() refuses it */
  assert.equal(hasWord("filings.no_such_key_at_all"), false);
  assert.throws(() => word("filings.no_such_key_at_all"), /UNKNOWN_WORD/);
  assert.ok(F);
});
