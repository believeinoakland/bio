/* filings — the counsel packet's chronology as a timeline read (R33; EVENTS 2a, K1494). Driven at the module's
   interface over the real modules, `events` and `conformance` (its R25: the act is an event) among them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, F, CASE, WHY, sha } from "./fixture.mjs";
import { CHRONOLOGY_MAX, LANE_WORDS, counselMarking, Filings } from "../../../src/filings/index.mjs";

const COUNSEL = { name: "A. Counsel", organisation: "Test Chambers" };
const OFFICE_ARM = { state: "named", role: "Selectboard", body: "Port Ellery Selectboard", level: "city" };

const pack = (f, action, who = "olive") => f.counselPacket({ reason: WHY, action, counsel: COUNSEL, author: V(who), viewer: V(who) });

test("R33 the chronology is events' timeline over the act's event, the counterparty office entity and the entities the findings concern, from the act's date to the assembly: the world's lane and each registered source's lane apart, never interleaved, each in events' order; an order undetermined shown with its bounds; an item placed nowhere listed apart; each item naming its record source; an event outside the set or the dates left out", async () => {
  const x = world();
  const ACT = x.ACT_EVENT;   /* the determination's act: an adoption on 2026-03-02 (conformance R25) */
  const e1 = x.event({ value: "2026-03-05", concerns: [x.OFFICE] });
  const e2 = x.event({ kind: "statement", value: "2026-04-10", concerns: [x.SUBJECT] });
  const e3 = x.event({ kind: "payment", value: "2026-04-10T10:00", concerns: [x.SUBJECT] });
  const nowhere = x.event({ kind: "statement", concerns: [x.OFFICE] });
  const before = x.event({ value: "2026-02-01", concerns: [x.OFFICE] });
  const after = x.event({ value: "2026-10-05", concerns: [x.SUBJECT] });
  const elsewhere = x.event({ value: "2026-03-06", concerns: [x.ELSEWHERE] });
  /* the "what we did" lane: each registered source apart (actions' own registers with its T33-73 job) */
  const asked = [];
  x.events.registerEventSource("test-ours", (q) => {
    asked.push(q);
    return [{ at: "2026-03-20", label: "a letter sent", ref: "REF-2", kind: "sent" },
            { at: "2026-03-10", label: "a request sent", ref: "REF-1", kind: "sent" },
            { at: null, label: "a note", ref: "REF-3", kind: "note" }];
  });
  x.events.registerEventSource("test-broken", () => { throw new Error("the source is down"); });
  const A = x.action({ kind: "commitment_claim", counterparty: { ...OFFICE_ARM, entity_id: x.OFFICE } });
  const f = x.f;
  const p = pack(f, A);
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  const ch = p.sections.chronology;
  /* the set, each member naming what it is and the record it was read from */
  assert.deepEqual(ch.set, [{ id: ACT, is: "the act's event", source: x.D }, { id: x.OFFICE, is: "the counterparty office", source: A },
                            { id: x.SUBJECT, is: "an entity a finding concerns", source: `${F}@${CASE}/1` }]);
  assert.deepEqual([ch.title, ch.marking, ch.from, ch.to], ["Chronology", counselMarking(COUNSEL), "2026-03-02", "2026-09-28"]);
  /* the world's lane: events' own answer for that set and those dates, in its order, each item naming its source */
  const ids = ch.set.map((i) => i.id);
  const dated = x.events.timeline({ set: ids, from: "2026-03-02", to: "2026-09-28", limit: CHRONOLOGY_MAX, viewer: V("olive") });
  const w = ch.lanes.world;
  assert.deepEqual(w, { label: LANE_WORDS.world, items: dated.world.items.map((i) => ({ ...i, source: i.event_id })),
                        placed_nowhere: dated.world.placed_nowhere.map((i) => ({ ...i, placed_nowhere: true, source: i.event_id })),
                        truncated: false });
  assert.deepEqual(w.items.map((i) => i.event_id), [ACT, e1, e2, e3], "events' order");
  assert.deepEqual(w.placed_nowhere.map((i) => i.event_id), [nowhere], "placed nowhere, listed apart");
  const band = w.items.find((i) => i.event_id === e2);
  assert.deepEqual([band.order.undetermined, band.order.with], [true, [e3]], "a day and a time within it: their order is undetermined");
  assert.ok(band.order.band.start && band.order.band.end, "shown with its bounds");
  assert.equal(w.items.find((i) => i.event_id === e1).order.undetermined, false);
  for (const left of [before, after, elsewhere]) assert.equal(JSON.stringify(ch).includes(left), false, `${left} is outside the set or the dates`);
  /* the "what we did" lane: each source apart, in events' order, each item naming its source; a broken one beside */
  const ours = Object.fromEntries(ch.lanes.ours.sources.map((s) => [s.source, s]));
  assert.equal(ch.lanes.ours.label, LANE_WORDS.ours);
  assert.deepEqual(ours["test-ours"], { source: "test-ours", truncated: false, items: [
    { at: "2026-03-10", label: "a request sent", ref: "REF-1", kind: "sent", order: { undetermined: false }, source: "test-ours:REF-1" },
    { at: "2026-03-20", label: "a letter sent", ref: "REF-2", kind: "sent", order: { undetermined: false }, source: "test-ours:REF-2" },
    { at: null, label: "a note", ref: "REF-3", kind: "note", placed_nowhere: true, source: "test-ours:REF-3" }] });
  assert.deepEqual(asked.at(-1), { set: ids, from: "2026-03-02", to: "2026-09-28", limit: CHRONOLOGY_MAX, viewer: V("olive") },
                   "asked for the same set and dates, with the packet's reader (events R30)");
  assert.deepEqual([ours["test-broken"].error, ours["test-broken"].items], ["the source is down", undefined]);
  assert.ok(ours.docket, "docket's registered source is answered beside the others");
  /* never interleaved: the world's lane holds events only, the sources' lane none */
  assert.ok([...w.items, ...w.placed_nowhere].every((i) => i.event_id && !("ref" in i)));
  assert.ok(ch.lanes.ours.sources.flatMap((s) => s.items || []).every((i) => !("event_id" in i)));
  assert.match(ch.says, /never interleaved/);
  /* R9: the captures attesting each listed event are exhibits, cited by that event */
  const ledger = p.sections.exhibits.items.find((e) => e.sha256 === sha("the text of INFO-2026-0002-ledger"));
  for (const id of [ACT, e1, e2, e3, nowhere]) assert.ok(ledger.cited_by.includes(id), id);
  assert.equal(ledger.cited_by.includes(elsewhere), false);
  /* the export: each lane's items under the chronology, the lane named on each */
  const e = await x.f.counselPacketExport({ id: p.id, author: V("olive"), viewer: V("olive") });
  const lines = e.bytes.split("\n").filter((l) => l.startsWith("- {\"lane\""));
  assert.deepEqual(lines.map((l) => JSON.parse(l.slice(2))).map((i) => [i.lane, i.event_id ?? i.ref ?? i.error]),
                   [...[ACT, e1, e2, e3, nowhere].map((id) => [LANE_WORDS.world, id]),
                    ...ch.lanes.ours.sources.flatMap((s) => (s.error ? [[LANE_WORDS.ours, s.error]] : s.items.map((i) => [LANE_WORDS.ours, i.ref])))]);
  assert.equal(e.bytes.split("\n")[e.bytes.split("\n").indexOf("## Chronology") + 2], counselMarking(COUNSEL));
  /* read back unchanged */
  assert.deepEqual(f.counselPacketRead({ id: p.id, version: 1, viewer: V("bo") }).sections.chronology, ch);
  /* negative control: without an office entity on the addressee or the act, the set is the act's event and the subject */
  const B = x.action({ kind: "commitment_claim" });
  assert.deepEqual(pack(f, B).sections.chronology.set.map((i) => i.id), [ACT, x.SUBJECT]);
});

test("R33 R27 an event of the set the reader may not see is withheld whole, dated or placed nowhere: left out of the lane, never stood in for, named nowhere, and the lane states out_of_view: true; a reader who sees it gets it, with no such key", async () => {
  const x = world();
  const docks = x.project("Docks", "cy");
  const hiddenCapture = x.capture("INFO-2026-0099-docks", "the docks' own minutes", { project: docks, author: V("cy") });
  const seen = x.event({ value: "2026-03-05", concerns: [x.OFFICE] });
  const hidden = x.event({ value: "2026-03-07", concerns: [x.OFFICE], capture: hiddenCapture, by: V("cy") });
  const hiddenNowhere = x.event({ kind: "statement", concerns: [x.SUBJECT], capture: hiddenCapture, by: V("cy") });
  const A = x.action({ kind: "commitment_claim", counterparty: { ...OFFICE_ARM, entity_id: x.OFFICE } });
  const olive = pack(x.f, A, "olive");
  const w = olive.sections.chronology.lanes.world;
  assert.deepEqual([w.items.map((i) => i.event_id), w.placed_nowhere, w.out_of_view], [[x.ACT_EVENT, seen], [], true]);
  for (const id of [hidden, hiddenNowhere, hiddenCapture]) assert.equal(JSON.stringify(olive).includes(id), false, `${id} is named nowhere`);
  /* negative control: cy sees the docks' capture */
  const cy = pack(x.f, A, "cy");
  const wc = cy.sections.chronology.lanes.world;
  assert.deepEqual([wc.items.map((i) => i.event_id), wc.placed_nowhere.map((i) => i.event_id), "out_of_view" in wc],
                   [[x.ACT_EVENT, seen, hidden], [hiddenNowhere], false]);
});

test("R33 a truncated lane says so; a set the record cannot name, a timeline no module answers, and one that refuses are each said in words, never an empty list passed as whole", async () => {
  const x = world();
  const A = x.action({ kind: "commitment_claim", counterparty: { ...OFFICE_ARM, entity_id: x.OFFICE } });
  /* events answering as its R27, R29 and R30 state, with a lane cut at the bound */
  const real = x.events;
  const cut = { timeline: (q) => {
    const r = real.timeline(q);
    return { ...r, world: { ...r.world, truncated: true }, ...(r.ours ? { ours: { ...r.ours, sources: r.ours.sources.map((s) => ({ ...s, truncated: true })) } } : {}) };
  }, readEvent: (q) => real.readEvent(q) };
  const t = pack(x.filingsWith({ events: cut }), A).sections.chronology.lanes;
  assert.deepEqual([t.world.truncated, t.world.says], [true, `more events than the ${CHRONOLOGY_MAX} this lane lists are held: the lane is truncated`]);
  assert.ok(t.ours.sources.length && t.ours.sources.every((s) => s.truncated && /truncated/.test(s.says)));
  /* no module answering the timeline, and one refusing */
  for (const [events, says] of [[{}, /no module answers the timeline/], [{ timeline: () => ({ ok: false, reason: "BAD_DATE" }) }, /could not be read \(BAD_DATE\)/],
                                [{ timeline: () => { throw new Error("down"); } }, /could not be read/]]) {
    const c = pack(x.filingsWith({ events }), A).sections.chronology;
    assert.deepEqual([c.unread, c.lanes.world.items, c.lanes.ours.sources], [true, [], []]);
    assert.match(c.says, says);
  }
  /* an overridden premise with an addressee carrying no office entity: no set, said so, and nothing read */
  let calls = 0;
  const counting = { timeline: (q) => { calls++; return real.timeline(q); }, readEvent: (q) => real.readEvent(q) };
  const O = x.action({ kind: "commitment_claim", legs: [], breach: true, override: "The act is not yet established." });
  const c = pack(x.filingsWith({ events: counting }), O).sections.chronology;
  assert.deepEqual([c.set, c.from, c.lanes.world.items, calls], [[], null, [], 0]);
  assert.match(c.says, /no set to read/);
  assert.match(c.from_says, /earliest event/);
  /* negative control: the same reader with an office entity reads the timeline */
  pack(x.filingsWith({ events: counting }), A);
  assert.ok(calls > 0);
});

test("R33 the chronology is assembled into the version and kept: a later event changes no version already assembled, and the next version reads it", async () => {
  const x = world();
  const A = x.action({ kind: "commitment_claim", counterparty: { ...OFFICE_ARM, entity_id: x.OFFICE } });
  const v1 = pack(x.f, A);
  const later = x.event({ value: "2026-05-01", concerns: [x.OFFICE] });
  assert.deepEqual(x.f.counselPacketRead({ id: v1.id, version: 1, viewer: V("olive") }).sections.chronology, v1.sections.chronology);
  const v2 = pack(x.f, A);
  assert.deepEqual([v2.version, v2.sections.chronology.lanes.world.items.map((i) => i.event_id)], [2, [x.ACT_EVENT, later]]);
  assert.ok(Filings.render(x.f.counselPacketRead({ id: v1.id, version: 1, viewer: V("olive") })).includes(later) === false);
});

test("R33 the chronology is one dated timeline read per reader (N602): every read names the act's date and the assembly, and the placed-nowhere items come from that same read, never from a second undated one", async () => {
  const x = world();
  const nowhere = x.event({ kind: "statement", concerns: [x.OFFICE] });
  const A = x.action({ kind: "commitment_claim", counterparty: { ...OFFICE_ARM, entity_id: x.OFFICE } });
  const reads = [];
  const real = x.events;
  const logged = { timeline: (q) => { reads.push(q); return real.timeline(q); }, readEvent: (q) => real.readEvent(q) };
  const w = pack(x.filingsWith({ events: logged }), A).sections.chronology.lanes.world;
  assert.deepEqual(w.placed_nowhere.map((i) => i.event_id), [nowhere]);
  assert.ok(reads.length > 0 && reads.every((q) => q.from === "2026-03-02" && q.to === "2026-09-28"), JSON.stringify(reads));
  assert.deepEqual(reads.map((q) => q.viewer), [V("olive"), "class:admin"], "one read as the reader, one as the plane (R27)");
  /* negative control: a timeline that drops the placed-nowhere items from a dated read (as before N602) leaves none */
  const dropping = { timeline: (q) => { const r = real.timeline(q); return q.from ? { ...r, world: { ...r.world, placed_nowhere: [] } } : r; },
                     readEvent: (q) => real.readEvent(q) };
  assert.deepEqual(pack(x.filingsWith({ events: dropping }), A).sections.chronology.lanes.world.placed_nowhere, []);
});
