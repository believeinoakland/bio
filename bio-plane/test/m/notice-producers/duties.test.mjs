/* R5: duty occurrences come due, over the real `duties` (its R7–R11) and `civil-time`, on duties' own test world (a
   fictional profile in America/Halifax: a records-response rule of 10 days, rolled on court days, and a monthly rule). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, E, BOB, ZONE } from "../duties/fixture.mjs";
import { world as followingWorld, MEMBER, T0 } from "../following/fixture.mjs";
import { WORDS } from "../ai-use/fixture.mjs";
import { producers, fresh, reader, ofKind, sentences, JUDGMENT, notHintFailures } from "./fixture.mjs";
import { HINT_MARK } from "../../../src/notice-producers/index.mjs";

/* `words.json`'s sentence of `key`, its placeholders filled (a key the file lacks fails here, never a fallback) */
const say = (key, fills = {}) => {
  assert.equal(typeof WORDS[key], "string", `${key} is in words.json`);
  return WORDS[key].replace(/\{([A-Za-z_]+)\}/g, (m, k) => (k in fills ? fills[k] : m));
};

const day = (value) => ({ value, precision: "day", zone: ZONE });
const KIND = "temporal-expectation-due";
function setup() {
  const w = world();
  const n = producers(w.host, { membership: w.membership, duties: w.duties, entities: w.entities });
  return { w, n, ...reader(n) };
}

test("R5: an adopted duty's occurrence the record shows overdue is one FINDING temporal-expectation-due, keyed by duty and occurrence, to the member who adopted it, `due` its local day; pending before", () => {
  const { w, read } = setup();
  const a = w.declare();                                     /* trigger 2026-02-02, due 2026-02-12 */
  assert.equal(a.ok, true);
  assert.deepEqual(ofKind(read("bob", { now: "2026-02-11T12:00:00Z" }), KIND), [], "pending: no item");
  /* 22:00 on the 12th in Halifax is still the due day: no item on the UTC day */
  assert.deepEqual(ofKind(read("bob", { now: "2026-02-13T02:00:00Z" }), KIND), []);
  const items = ofKind(read("bob", { now: "2026-02-13T12:00:00Z" }), KIND);
  assert.equal(items.length, 1);
  const occ = w.duties.occurrencesOf({ dutyId: a.duty_id, asOf: "2026-02-13T12:00:00Z", viewer: BOB }).occurrences[0];
  const it = items[0];
  assert.equal(it.id, `FINDING::${KIND}::${a.duty_id}::${occ.key}::overdue`);
  assert.equal(it.class, "FINDING");
  assert.equal(it.label, "noticed");
  assert.equal(it.due, "2026-02-12");
  assert.deepEqual(it.recipients, ["bob"]);
  assert.equal(it.basis.recipients_rule, "adopter");
  assert.equal(it.subject.kind, "duty");
  assert.equal(it.subject.id, a.duty_id);
  assert.equal(it.subject.occurrence, occ.key);
  assert.deepEqual(it.subject.due, day("2026-02-12"));
  assert.equal(it.subject.basis_kind, "rule");
  assert.deepEqual(it.subject.derivation, occ.derivation);
  /* carol adopted nothing: no item */
  assert.deepEqual(ofKind(read("carol", { now: "2026-02-13T12:00:00Z" }), KIND), []);
});

test("R5: never a violation: the detail says what the record shows, not a finding that a rule was broken, with its derivation; it says nothing of a breach", () => {
  const { w, read } = setup();
  w.declare();
  const it = ofKind(read("bob", { now: "2026-02-20T12:00:00Z" }), KIND)[0];
  assert.match(it.detail, /This is what the record shows, not a finding that a rule was broken\.$/);
  assert.match(it.summary, /^Nothing recorded by /);
  for (const s of sentences(it)) assert.doesNotMatch(s, JUDGMENT, s);
  assert.equal(it.basis.state, "overdue");
  assert.ok(it.basis.derivation.source_in_force, "the source in force, the trigger date, the due date stated");
});

test("R5: an uncertain due date: between the candidates the item reads possibly overdue: undetermined, because …; after the latest, overdue, a fresh item keyed by its state; before the first, nothing (K1444 (i), K1676)", () => {
  const { w, read } = setup();
  const a = w.declare({ trigger: { kind: "date", date: "2026-01-31" }, time: { basis: "rule", rule: "monthly_report", applies_to: "claim" } });
  assert.deepEqual(ofKind(read("bob", { now: "2026-02-28T16:00:00Z" }), KIND), []);
  const between = ofKind(read("bob", { now: "2026-03-01T16:00:00Z" }), KIND);
  assert.equal(between.length, 1);
  assert.match(between[0].detail, /^Possibly overdue: undetermined, because /);
  assert.equal(between[0].subject.state, "possibly overdue");
  assert.equal(between[0].due, "2026-03-01", "a body's due: the latest candidate");
  assert.deepEqual(between[0].subject.due.candidates.map((c) => c.value), ["2026-02-28", "2026-03-01"]);
  const after = ofKind(read("bob", { now: "2026-03-02T16:00:00Z" }), KIND);
  assert.equal(after.length, 1);
  assert.match(between[0].id, /::undetermined$/);
  assert.equal(after[0].id, between[0].id.replace(/::undetermined$/, "::overdue"), "a change of state raises a fresh item (K1676)");
  assert.deepEqual(ofKind(read("bob", { now: "2026-03-09T16:00:00Z" }), KIND).map((i) => i.id), [after[0].id], "raised once per occurrence and state");
  assert.equal(after[0].subject.state, "overdue");
  assert.ok(a.ok);
});

test("R5: it leaves when the occurrence is met or met late, or no longer overdue", () => {
  const { w, read } = setup();
  const a = w.declare({ trigger: { kind: "event", event_kind: "communication", entity: E.clerk } });
  const req = w.event({ value: day("2026-02-02"), concerns: [E.clerk] });
  const resp = w.event({ value: day("2026-02-20"), concerns: [E.group] });
  assert.ok(req);
  const at = "2026-03-03T12:00:00Z";      /* after the fixture clock the match is recorded at */
  const items = ofKind(read("bob", { now: at }), KIND);
  assert.equal(items.length, 1);
  w.duties.matchEvent({ dutyId: a.duty_id, occurrenceKey: items[0].subject.occurrence, eventId: resp, reason: "the late response", by: BOB });
  assert.deepEqual(ofKind(read("bob", { now: at }), KIND), [], "met late: it leaves");
});

test("R5: an occurrence of the group's own checkpoint is never an item (D234; action-plans R23)", () => {
  const { w, read } = setup();
  w.duties.registerTriggerSource("action-plans", () => [{ ref: "PLN-1#checkpoint", date: "2026-02-02", group_checkpoint: true },
                                                           { ref: "ACT-2026-0001-req", date: "2026-02-02" }]);
  w.declare({ trigger: { kind: "source", source: "action-plans" } });
  const items = ofKind(read("bob", { now: "2026-03-01T12:00:00Z" }), KIND);
  assert.deepEqual(items.map((i) => i.basis.trigger.ref), ["ACT-2026-0001-req"]);
  /* and a provider that answered one anyway is refused here as well */
  const n = fresh(w.host, { membership: w.membership, duties: { ...w.duties,
    dutiesOf: (a) => w.duties.dutiesOf(a),
    occurrencesOf: (a) => { const o = w.duties.occurrencesOf(a); return { ...o, occurrences: o.occurrences.map((x) => ({ ...x, trigger: { ...x.trigger, group_checkpoint: true } })) }; } } });
  assert.deepEqual(ofKind(reader(n).read("bob", { now: "2026-03-01T12:00:00Z" }), KIND), []);
});

test("R5: recipients: the adopting member, else the duty's project's owners, else the administrators; nobody else", () => {
  const { w } = setup();
  const duty = (by, project) => ({ duty_id: "DUT-2026-0042", project, adoption: { by }, performance: { act: "post the minutes" } });
  const occ = { key: "OCC-1", trigger: { kind: "date", ref: "2026-02-02" }, due: { date: day("2026-02-12"), basis_kind: "rule" },
                state: "overdue", why: "the due date has passed", evidence: [], question: "Was it done by 2026-02-12?" };
  const membership = { participation: () => null, projectOwners: (p) => (p === "PROJ-2026-0001-own" ? ["member:olga"] : []),
                       activeAdmins: () => ["ada"] };
  const make = (d) => fresh(w.host, { membership, duties: { dutiesOf: () => ({ ok: true, duties: [d], truncated: false }),
                                                           occurrencesOf: () => ({ ok: true, occurrences: [occ] }) } });
  w.st.sql.exec(`INSERT INTO duties (duty_id, modality, obligor, version, adopted_by, adopted_at, clause) VALUES ('DUT-2026-0042','duty','ENT-x',1,'class:ai','2026-02-01T00:00:00Z','c')`);
  const who = (d) => ["olga", "ada", "bob", "zed"].filter((m) => ofKind(reader(make(d)).read(m, { now: "2026-03-01T12:00:00Z" }), KIND).length);
  assert.deepEqual(who(duty("member:zed", "PROJ-2026-0001-own")), ["zed"]);
  assert.deepEqual(who(duty("class:ai", "PROJ-2026-0001-own")), ["olga"]);
  assert.deepEqual(who(duty("class:ai", null)), ["ada"]);
});

test("R5: its age runs from the start of the due day in the due's own zone, never the UTC midnight (K1444 (iii), K1688)", () => {
  const { w, read } = setup();
  w.declare();                                               /* due 2026-02-12 in America/Halifax (UTC-4 in February) */
  const it = ofKind(read("bob", { now: "2026-02-13T04:00:00Z" }), KIND)[0];
  assert.deepEqual(it.age, { state: "determined", since: "2026-02-12", ms: 86_400_000 }, "from 04:00Z, Halifax's midnight");
});

test("R11: a duty's item, overdue or possibly overdue, is no hint: it carries no \"Hint · machine work\" mark and never calls itself a hint or a signal", () => {
  const { w, read } = setup();
  w.declare();
  const overdue = ofKind(read("bob", { now: "2026-02-20T12:00:00Z" }), KIND);
  assert.equal(overdue.length, 1);
  const u = setup();
  u.w.declare({ trigger: { kind: "date", date: "2026-01-31" }, time: { basis: "rule", rule: "monthly_report", applies_to: "claim" } });
  const between = ofKind(u.read("bob", { now: "2026-03-01T16:00:00Z" }), KIND);
  assert.equal(between.length, 1);
  for (const it of [...overdue, ...between]) assert.deepEqual(notHintFailures(it, HINT_MARK), [], it.id);
});

/* R5 (T45; N855; Actions D6d; v0.2 rule 17; following R25, R28): a duty is told only up to the day
   `following.dutyWatchEndAt` answers for it (a plan's watch kept until, or stopped on, that day); null is R5 as before.
   `following` is a stand-in in its R28 shape, `{day, at}`: the end day per duty, answered at noon UTC of that day (`at`,
   before any occurrence these tests read came due after it), every duty it is asked about recorded. */
function watched(ends = {}) {
  const w = world();
  const asked = [];
  const following = { policyChanges: () => ({ ok: true, changes: [], cursor: null }),
                      dutyWatchEndAt: (duty) => { asked.push(duty); return Object.prototype.hasOwnProperty.call(ends, duty) ? { day: ends[duty], at: `${ends[duty]}T12:00:00Z` } : null; } };
  const read = (n) => (member, opts) => ofKind(reader(n).read(member, opts), KIND);
  return { w, asked, ends, items: read(fresh(w.host, { membership: w.membership, duties: w.duties, following })),
           plain: read(fresh(w.host, { membership: w.membership, duties: w.duties })) };
}

test("R5 (T45): a duty stopped today raises no item for an occurrence due tomorrow; control: the same duty with no link (dutyWatchEndAt null) raises it; the duty stays held and its occurrence readable", () => {
  const { w, asked, ends, items, plain } = watched();
  const a = w.declare();                                     /* due 2026-02-12 */
  const at = "2026-02-20T12:00:00Z";
  const control = plain("bob", { now: at });
  assert.equal(control.length, 1, "control: no link, told as before");
  assert.equal(control[0].due, "2026-02-12");
  assert.deepEqual(items("bob", { now: at }).map((i) => i.id), control.map((i) => i.id), "control: dutyWatchEndAt answering null is R5 as before");
  assert.ok(asked.includes(a.duty_id), "the end is read through following.dutyWatchEndAt(duty)");
  ends[a.duty_id] = "2026-02-11";                            /* stopped on the 11th: the occurrence falls due the day after */
  assert.deepEqual(items("bob", { now: at }), [], "stopped: no item for an occurrence due after the end day");
  const occ = w.duties.occurrencesOf({ dutyId: a.duty_id, asOf: "2026-02-20T12:00:00Z", viewer: BOB });
  assert.equal(occ.ok, true);
  assert.equal(occ.occurrences.length, 1, "the duty stays held and its occurrence readable (duties R10): only the telling stops");
  ends[a.duty_id] = "2026-02-12";                            /* an end on the due day itself: the occurrence is not after it */
  assert.deepEqual(items("bob", { now: at }).map((i) => i.id), control.map((i) => i.id), "control: due on the end day, still told");
});

test("R5 (T45): a duty kept until a day raises items up to that day and none after; the item already raised for the earlier occurrence is unchanged", () => {
  const { w, ends, items, plain } = watched();
  const a = w.declare({ trigger: { kind: "event", event_kind: "communication", entity: E.clerk } });
  w.event({ value: day("2026-02-02"), concerns: [E.clerk] });
  w.event({ value: day("2026-03-02"), concerns: [E.clerk] });
  const at = "2026-04-01T12:00:00Z";
  const both = plain("bob", { now: at });
  assert.equal(both.length, 2, "control: with no end, both occurrences are told");
  const [first, second] = [...both].sort((x, y) => (x.due < y.due ? -1 : 1));
  assert.ok(first.due < "2026-03-01" && second.due > "2026-03-01", `${first.due}, ${second.due}`);
  ends[a.duty_id] = "2026-03-01";                            /* kept until 1 March */
  const kept = items("bob", { now: at });
  assert.deepEqual(kept, [first], "the earlier occurrence's item, unchanged; none for the one due after the end day");
  ends[a.duty_id] = second.due;
  assert.deepEqual(items("bob", { now: at }).map((i) => i.id).sort(), both.map((i) => i.id).sort(), "control: kept until the later due day, both told");
});

test("R5 (T45): an undetermined due date is compared by its latest candidate: an end between the candidates tells nothing, an end on the latest tells the possibly-overdue item", () => {
  const { w, ends, items } = watched();
  const a = w.declare({ trigger: { kind: "date", date: "2026-01-31" }, time: { basis: "rule", rule: "monthly_report", applies_to: "claim" } });
  const at = "2026-03-01T16:00:00Z";                         /* between the candidates 2026-02-28 and 2026-03-01 */
  ends[a.duty_id] = "2026-02-28";
  assert.deepEqual(items("bob", { now: at }), [], "the latest candidate falls after the end day");
  ends[a.duty_id] = "2026-03-01";
  const told = items("bob", { now: at });
  assert.equal(told.length, 1, "control: the latest candidate on the end day");
  assert.equal(told[0].subject.state, "possibly overdue");
});

test("R5 (T45) R21 R1: a following whose dutyWatchEndAt throws contributes no duty item and is named in facts.failed; an answer that is no {day, at} is read as no end (the duty still told); the read writes nothing", () => {
  const w = world();
  w.declare();
  const at = Date.parse("2026-02-20T12:00:00Z");
  const run = (dutyWatchEndAt) => reader(fresh(w.host, { membership: w.membership, duties: w.duties,
    following: { policyChanges: () => ({ ok: true, changes: [], cursor: null }), dutyWatchEndAt } })).read("bob", { now: at });
  const down = run(() => { throw new Error("down"); });
  assert.deepEqual(ofKind(down, KIND), []);
  assert.deepEqual(down.facts.failed, ["following"]);
  for (const odd of [undefined, 42, "", "2026-02-11", {}, { day: "12 February", at: "2026-02-11T12:00:00Z" }, { day: "2026-02-11" },
                     { day: "2026-02-11", at: "yesterday" }, { at: "2026-02-11T12:00:00Z" }]) {
    const r = run(() => odd);
    assert.equal(ofKind(r, KIND).length, 1, JSON.stringify(odd));
    assert.deepEqual(r.facts.failed, [], JSON.stringify(odd));
  }
  assert.deepEqual(ofKind(run(() => ({ day: "2026-02-11", at: "2026-02-11T12:00:00Z" })), KIND), [], "control: a {day, at} before it was told ends its telling");
  const before = w.st.sql.exec(`SELECT COUNT(*) AS n FROM duties`).one().n;
  run(() => ({ day: "2026-02-11", at: "2026-02-11T12:00:00Z" }));
  assert.equal(w.st.sql.exec(`SELECT COUNT(*) AS n FROM duties`).one().n, before);
});

/* R18 (T46; N927; amends R5; queue R16; following R25; K2996): an occurrence already told keeps its item until its
   recipient disposes of it (queue's, by its key: the same key on every read) or it is met, met late or no longer overdue; a
   later end of the duty's watch never removes it. R5's end of telling holds only for an occurrence not yet told. Over the
   real `following` (its R24–R25 on its own test world, the profile's zone America/Halifax): a plan's watch on the duty,
   the plan closed, the watch stopped on the day of the answer, `dutyWatchEnd` answering that day. `duties` answers one
   occurrence undetermined between 2026-10-01 and 2026-10-20 (UTC), possibly overdue from the start of 2 October. (T47,
   R21) Told means its told state began at or before the instant the end took hold (`dutyWatchEndAt`'s `at`). */
const PRJ = "PRJ-2026-0001-a";
function stopped(answeredAt) {
  const fw = followingWorld();
  fw.project(PRJ);
  fw.plan("PL-1", { project: PRJ });
  fw.duty("DUT-R18", { project: PRJ, met: [null] });
  const link = fw.f.watchLink({ plan: "PL-1", watch: { kind: "duty", id: "DUT-R18" }, author: MEMBER, viewer: MEMBER });
  assert.equal(link.ok, true, JSON.stringify(link));
  if (answeredAt) {
    fw.t = Date.parse(answeredAt);
    fw.close("PL-1", answeredAt);
    const a = fw.f.watchAnswer({ link: link.link, stop: true, author: MEMBER });
    assert.equal(a.ok, true, JSON.stringify(a));
  }
  return fw.f;
}
function toldWorld(following) {
  const w = world();
  w.declare();                                             /* one obligor row for dutiesOf's walk */
  const occ = { key: "OCC-R18", trigger: { kind: "date", ref: "2026-09-01" }, state: "undetermined", evidence: [],
                due: { date: { candidates: [{ value: "2026-10-01", precision: "day", zone: "UTC" }, { value: "2026-10-20", precision: "day", zone: "UTC" }] }, basis_kind: "rule" },
                why: "possibly overdue: undetermined, because the due date is uncertain" };
  const duty = { duty_id: "DUT-R18", adoption: { by: BOB }, performance: { act: "answer the request" } };
  const duties = { dutiesOf: () => ({ ok: true, duties: [duty], truncated: false }), occurrencesOf: () => ({ ok: true, occurrences: [occ] }) };
  const read = (now, f = following) => reader(fresh(w.host, { membership: w.membership, duties, following: f })).read("bob", { now });
  return { occ, read, items: (now, f) => ofKind(read(now, f), KIND) };
}

test("R18 an occurrence told while undetermined, then a stop whose end day falls before its latest candidate, still answers its item, the same key on every read until disposed; control: the same stop before the occurrence was told raises no item", () => {
  const unlinked = stopped(null);
  assert.equal(unlinked.dutyWatchEnd("DUT-R18"), null, "linked, unanswered: no end");
  const { items } = toldWorld(unlinked);
  const now = "2026-10-08T12:00:00Z";
  const told = items(now);
  assert.equal(told.length, 1, "told with no end");
  assert.match(told[0].id, /::DUT-R18::OCC-R18::undetermined$/);
  const after = stopped("2026-10-06T12:00:00Z");                        /* stopped on 6 October, after it was told */
  assert.equal(after.dutyWatchEnd("DUT-R18"), "2026-10-06");
  const kept = toldWorld(after);
  assert.deepEqual(kept.items(now).map((i) => i.id), told.map((i) => i.id), "still answered, the same key: it leaves only by its disposition");
  assert.deepEqual(kept.items("2026-10-15T12:00:00Z").map((i) => i.id), told.map((i) => i.id), "and on later reads");
  assert.deepEqual(kept.items(now)[0].basis.watch_end, { day: "2026-10-06", at: "2026-10-06T12:00:00Z", told_before: true });
  assert.deepEqual(kept.read(now).facts.failed, []);
  const before = stopped("2026-09-28T12:00:00Z");                       /* control: stopped before it came due */
  assert.equal(before.dutyWatchEnd("DUT-R18"), "2026-09-28");
  assert.deepEqual(toldWorld(before).items(now), [], "control: not yet told when the stop took hold: no item (R5)");
  const onFirst = stopped("2026-10-01T12:00:00Z");                      /* control: stopped on its first candidate */
  assert.deepEqual(toldWorld(onFirst).items(now), [], "control: possibly overdue only from the next day: not told");
  const onSecond = stopped("2026-10-02T12:00:00Z");                     /* possibly overdue from the start of that day */
  assert.equal(toldWorld(onSecond).items(now).length, 1, "told on the end day itself: kept");
  void T0;
});

test("R18 a told occurrence is exempt from the end of telling whole: once overdue after its latest candidate its overdue item is raised, as R5 raises it; control: an occurrence not told raises none", () => {
  const kept = toldWorld(stopped("2026-10-06T12:00:00Z"));
  kept.occ.state = "overdue";
  const now = "2026-10-22T12:00:00Z";
  assert.deepEqual(kept.items(now).map((i) => i.id), ["FINDING::temporal-expectation-due::DUT-R18::OCC-R18::overdue"]);
  const none = toldWorld(stopped("2026-09-28T12:00:00Z"));
  none.occ.state = "overdue";
  assert.deepEqual(none.items(now), [], "control");
});

test("R18 a told occurrence still leaves when it is met, met late or no longer overdue, whatever the end", () => {
  const kept = toldWorld(stopped("2026-10-06T12:00:00Z"));
  assert.equal(kept.items("2026-10-08T12:00:00Z").length, 1, "control: kept while possibly overdue");
  for (const state of ["met", "met_late", "pending"]) {
    kept.occ.state = state;
    assert.deepEqual(kept.items("2026-10-08T12:00:00Z"), [], state);
  }
});

/* R21 (T47; N967; amends R18; following R28): "already told" is read from `following.dutyWatchEndAt(duty)`'s instant, the
   answer that made the end hold, in place of the end day alone, for a `keep` as for a `stop`. Over the real `following`:
   the plan closed and its watch on the duty kept until a day, answered at a given instant. */
function kept(answeredAt, until) {
  const fw = followingWorld();
  fw.project(PRJ);
  fw.plan("PL-1", { project: PRJ });
  fw.duty("DUT-R18", { project: PRJ, met: [null] });
  const link = fw.f.watchLink({ plan: "PL-1", watch: { kind: "duty", id: "DUT-R18" }, author: MEMBER, viewer: MEMBER });
  assert.equal(link.ok, true, JSON.stringify(link));
  fw.t = Date.parse(answeredAt);
  fw.close("PL-1", answeredAt);
  const a = fw.f.watchAnswer({ link: link.link, keep: { until }, author: MEMBER });
  assert.equal(a.ok, true, JSON.stringify(a));
  return fw.f;
}

test("R21 a keep answered after an occurrence became possibly overdue leaves its item standing though its latest candidate falls after the kept day; control: the same occurrence becoming possibly overdue only after the answer raises none, though its first candidate falls before the kept day", () => {
  const now = "2026-10-08T12:00:00Z";
  const after = kept("2026-10-06T12:00:00Z", "2026-10-07");               /* told from 2 October; answered on the 6th */
  assert.deepEqual(after.dutyWatchEndAt("DUT-R18"), { day: "2026-10-07", at: "2026-10-06T12:00:00Z" }, "following R28's answer");
  const standing = toldWorld(after).items(now);
  assert.deepEqual(standing.map((i) => i.id), ["FINDING::temporal-expectation-due::DUT-R18::OCC-R18::undetermined"], "told before the keep took hold: kept");
  assert.deepEqual(standing[0].basis.watch_end, { day: "2026-10-07", at: "2026-10-06T12:00:00Z", told_before: true });
  assert.ok(standing[0].due > "2026-10-07", "its latest candidate falls after the kept day");
  const early = kept("2026-09-28T12:00:00Z", "2026-10-05");                /* answered before the first candidate passed */
  assert.deepEqual(early.dutyWatchEndAt("DUT-R18"), { day: "2026-10-05", at: "2026-09-28T12:00:00Z" });
  assert.deepEqual(toldWorld(early).items(now), [], "control: told only after the keep took hold, its latest candidate after the kept day: no item (R5), though the kept day (5 October) falls after its told state began (2 October)");
  /* and once overdue after its latest candidate, the told occurrence's overdue item is raised; the untold one's is not */
  const k = toldWorld(after); k.occ.state = "overdue";
  assert.deepEqual(k.items("2026-10-22T12:00:00Z").map((i) => i.id), ["FINDING::temporal-expectation-due::DUT-R18::OCC-R18::overdue"]);
  const e = toldWorld(early); e.occ.state = "overdue";
  assert.deepEqual(e.items("2026-10-22T12:00:00Z"), [], "control");
});

test("R21 told means at or before the end's instant: an occurrence possibly overdue from the start of 2 October (UTC) is told by a stop answered at that instant, and not by one a second before", () => {
  const at = (instant) => ({ policyChanges: () => ({ ok: true, changes: [], cursor: null }), dutyWatchEndAt: () => ({ day: "2026-10-02", at: instant }) });
  const { items } = toldWorld(null);
  const now = "2026-10-08T12:00:00Z";
  assert.equal(items(now, at("2026-10-02T00:00:00Z")).length, 1, "at the instant its told state began: told, kept");
  assert.deepEqual(items(now, at("2026-10-01T23:59:59Z")), [], "control: a second before: not told, no item");
});

/* R20 (T47; N889; DEC-198 (3)): R5's sentences by key, `.overdue.*` or `.undetermined.*`, the item answering the keys
   beside its text, the placeholders filled from duties' own facts; every date as R16's `{date}`. */
test("R20 R5: an overdue occurrence's summary and detail are queue.temporal-expectation-due.overdue.summary and .detail filled: {duty} and {what} the duty's act, {office} its obligor's registered name (K3144), {basis} its due's citation, {date} the due day by date.daymonth; an undetermined one's .undetermined.*, {reason} duties' reason.says (R22) and {from}, {to} its candidates", () => {
  const { w, read } = setup();
  const a = w.declare();
  const it = ofKind(read("bob", { now: "2026-02-20T12:00:00Z" }), KIND)[0];
  const obligor = w.duties.readDuty({ dutyId: a.duty_id, viewer: BOB }).duty.obligor;
  assert.equal(obligor, E.clerk);
  assert.equal(w.entities.readEntity({ entityId: obligor }).entity.label, "Town Clerk");
  const fills = { duty: "respond to the records request", what: "respond to the records request", office: "Town Clerk", basis: "Test Code §7922",
                  date: say("date.daymonth", { day: "12", month: say("date.month.february") }) };
  assert.equal(it.summary_key, "queue.temporal-expectation-due.overdue.summary");
  assert.equal(it.detail_key, "queue.temporal-expectation-due.overdue.detail");
  assert.equal(it.summary, say(it.summary_key, fills));
  assert.equal(it.detail, say(it.detail_key, fills));
  assert.equal(it.summary, "Nothing recorded by 12 February: respond to the records request");
  assert.equal(it.detail, "Town Clerk was due to respond to the records request by 12 February (Test Code §7922). Nothing in the record shows it was done. This is what the record shows, not a finding that a rule was broken.");
  /* control (K3144): an obligor the registry answers no entity for is named by its id */
  const bare = ofKind(reader(fresh(w.host, { membership: w.membership, duties: w.duties })).read("bob", { now: "2026-02-20T12:00:00Z" }), KIND)[0];
  assert.equal(bare.fills.office, obligor);
  assert.ok(!/\{/.test(it.summary + it.detail), "every placeholder filled");
  /* negative control (K874): not the undetermined sentence */
  assert.notEqual(it.detail, say("queue.temporal-expectation-due.undetermined.detail", fills));
  const u = setup();
  u.w.declare({ trigger: { kind: "date", date: "2026-01-31" }, time: { basis: "rule", rule: "monthly_report", applies_to: "claim" } });
  const b = ofKind(u.read("bob", { now: "2026-03-01T16:00:00Z" }), KIND)[0];
  assert.equal(b.summary_key, "queue.temporal-expectation-due.undetermined.summary");
  assert.equal(b.detail_key, "queue.temporal-expectation-due.undetermined.detail");
  assert.equal(b.fills.from, say("date.daymonth", { day: "28", month: say("date.month.february") }));
  assert.equal(b.fills.to, say("date.daymonth", { day: "1", month: say("date.month.march") }));
  /* R22 (T48): {reason} is duties' member-facing reason, never its why */
  const says = u.w.duties.occurrencesOf({ dutyId: b.subject.id, asOf: "2026-03-01T16:00:00Z", viewer: BOB }).occurrences.find((x) => x.key === b.subject.occurrence).reason.says;
  assert.equal(b.fills.reason, says.replace(/\.$/, ""), "duties' reason.says");
  assert.notEqual(b.fills.reason, b.basis.why.replace(/^possibly overdue: undetermined, because /, "").replace(/\.$/, ""), "control: not the why");
  assert.equal(b.summary, say(b.summary_key, b.fills));
  assert.equal(b.detail, say(b.detail_key, b.fills));
  assert.equal(b.summary, `Possibly overdue: ${b.fills.duty}`);
  assert.ok(!/\{/.test(b.summary + b.detail), "every placeholder filled");
  assert.notEqual(b.detail, say("queue.temporal-expectation-due.overdue.detail", b.fills), "control: not the overdue sentence");
});

test("R20 R5: an occurrence due last year names its year (date.daymonthyear); control: one due this year does not", () => {
  const { w, read } = setup();
  w.declare();                                               /* due 2026-02-12 */
  const thisYear = ofKind(read("bob", { now: "2026-02-20T12:00:00Z" }), KIND)[0];
  assert.equal(thisYear.fills.date, "12 February");
  const nextYear = ofKind(read("bob", { now: "2027-01-05T12:00:00Z" }), KIND)[0];
  assert.equal(nextYear.fills.date, say("date.daymonthyear", { day: "12", month: say("date.month.february"), year: "2026" }));
  assert.equal(nextYear.fills.date, "12 February 2026");
  assert.equal(nextYear.summary, say("queue.temporal-expectation-due.overdue.summary", nextYear.fills));
});

/* R22 (T48; N1044; K3150, K3203; duties R33): `{reason}` is the occurrence's member-facing reason, `reason.says`, never `why`;
   `reason: null` fills nothing and draws no clause; the item also answers `reason_code`. Over duties' answers in their
   R33 shape (a trigger placed nowhere leaves no candidate dates, so the real duties raises this reason only for an
   occurrence it cannot tell as an item; the stand-in answers the shape R33 publishes). */
function reasoned(reason, why = "the trigger 2026-01-31 in America/Halifax is undetermined (K1444, R10)") {
  const { w } = setup();
  const duty = { duty_id: "DUT-2026-0042", project: null, adoption: { by: "member:bob" }, performance: { act: "post the minutes" } };
  const occ = { key: "OCC-1", trigger: { kind: "date", ref: "2026-01-31" }, state: "undetermined", why: `possibly overdue: undetermined, because ${why}`,
                evidence: [], question: "?", reason,
                due: { basis_kind: "rule", date: { candidates: [day("2026-02-28"), day("2026-03-01")] } } };
  w.st.sql.exec(`INSERT INTO duties (duty_id, modality, obligor, version, adopted_by, adopted_at, clause) VALUES ('DUT-2026-0042','duty','ENT-x',1,'member:bob','2026-02-01T00:00:00Z','c')`);
  const n = fresh(w.host, { membership: { participation: () => null, projectOwners: () => [], activeAdmins: () => ["ada"] },
    duties: { dutiesOf: () => ({ ok: true, duties: [duty], truncated: false }), occurrencesOf: () => ({ ok: true, occurrences: [occ] }) } });
  return ofKind(reader(n).read("bob", { now: "2026-03-01T16:00:00Z" }), KIND)[0];
}

test("R22 an undetermined occurrence whose trigger is undated answers the words of trigger_undated in {reason}, naming no ISO date, zone id or ruling number, and its reason_code; control: its why text appears nowhere in the item's summary or detail", () => {
  const says = "What starts the clock has no date in the record.";
  const it = reasoned({ code: "trigger_undated", says });
  assert.ok(it, "the item is raised");
  assert.equal(it.fills.reason, "What starts the clock has no date in the record", "reason.says, its closing full stop left to the sentence");
  assert.equal(it.reason_code, "trigger_undated");
  assert.equal(it.detail_key, "queue.temporal-expectation-due.undetermined.detail");
  assert.equal(it.detail, say(it.detail_key, it.fills));
  assert.match(it.detail, /^Possibly overdue: undetermined, because What starts the clock has no date in the record\. /);
  for (const t of [it.summary, it.detail]) {
    assert.doesNotMatch(t, /\d{4}-\d{2}-\d{2}/, "no ISO date");
    assert.doesNotMatch(t, /America\/Halifax/, "no zone id");
    assert.doesNotMatch(t, /\bK\d+|\bR\d+/, "no ruling or requirement number");
    assert.ok(!t.includes("is undetermined (K1444"), "control: the why's text appears nowhere");
  }
  assert.ok(it.basis.why.includes("K1444"), "the why stays the record's derivation, in the basis");
  assert.ok(!/\{/.test(it.summary + it.detail), "every placeholder filled");
});

test("R22 each of duties' codes is answered as reason_code and its says fills {reason}; control: another code's words are not used", () => {
  const codes = { trigger_undated: "What starts the clock has no date in the record.", due_between_days: "The due date depends on a day the record does not settle.",
                  deadline_not_held: "Your group's Civicsmith holds no rule for this deadline yet.", due_not_computed: "The due date could not be worked out.",
                  match_undated: "The event that met it has no settled date.", order_unsettled: "The dates held are not precise enough to say whether it was on time." };
  for (const [code, says] of Object.entries(codes)) {
    const it = reasoned({ code, says });
    assert.equal(it.reason_code, code);
    assert.equal(it.fills.reason, says.replace(/\.$/, ""));
    for (const [other, ow] of Object.entries(codes)) if (other !== code) assert.ok(!it.detail.includes(ow.replace(/\.$/, "")), `${code} is not ${other}`);
  }
});

test("R22 an occurrence answering reason: null fills {reason} with nothing and draws no reason clause, and answers reason_code null; control: with a reason the clause is drawn", () => {
  const it = reasoned(null);
  assert.equal(it.fills.reason, "");
  assert.equal(it.reason_code, null);
  assert.doesNotMatch(it.detail, /because/, "no reason clause");
  assert.doesNotMatch(it.detail, /K1444|2026-01-31|Halifax/, "and never the why");
  assert.match(it.detail, /^Possibly overdue: undetermined\. /);
  assert.ok(!/\{/.test(it.detail), "no placeholder left");
  assert.match(reasoned({ code: "due_not_computed", says: "The due date could not be worked out." }).detail, /because The due date could not be worked out\./, "control");
});

test("R22 over the real duties: a possibly overdue occurrence answers duties' reason code and says, in the item and its {reason}; an overdue one answers reason_code null", () => {
  const u = setup();
  u.w.declare({ trigger: { kind: "date", date: "2026-01-31" }, time: { basis: "rule", rule: "monthly_report", applies_to: "claim" } });
  const b = ofKind(u.read("bob", { now: "2026-03-01T16:00:00Z" }), KIND)[0];
  const r = u.w.duties.occurrencesOf({ dutyId: b.subject.id, asOf: "2026-03-01T16:00:00Z", viewer: BOB }).occurrences.find((x) => x.key === b.subject.occurrence).reason;
  assert.equal(r.code, "due_between_days");
  assert.equal(b.reason_code, r.code);
  assert.ok(b.detail.includes(r.says.replace(/\.$/, "")), "duties' says in the sentence");
  const o = setup();
  o.w.declare();
  assert.equal(ofKind(o.read("bob", { now: "2026-02-20T12:00:00Z" }), KIND)[0].reason_code, null, "control: an overdue occurrence has no reason");
});
