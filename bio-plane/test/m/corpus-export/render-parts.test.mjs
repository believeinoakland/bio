/* corpus-export — a rendering past RENDER_MAX records of a source is continued by part, and says so in its own body (R10,
   R14; fix round 6 G22, K4571). Driven through the op arm `exportrender`, over the real owners, with one record more than
   the bound. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { rich, ANN } from "./rich.mjs";
import { corpusExportOps, FORMATS, RENDER_MAX } from "../../../src/corpus-export/index.mjs";

const TOTAL = RENDER_MAX + 1;

/* One world holding TOTAL events, TOTAL persons and TOTAL money facts, each the real owner's act. `source` is each source's
   record ids in the order a part reads them (id order), as the store holds them: events, entities (the persons, the board
   they are paid by and the world's own) and money facts. */
function crowded() {
  const w = rich();
  const open = w.capture("minutes");
  const events = [], persons = [], facts = [];
  const board = w.entity("institution", "Harbour Board", { sector: "government" });
  const master = w.entity("office", "Harbour Master");
  for (let i = 0; i < TOTAL; i++) {
    events.push(w.eventOn(open, "meeting"));
    persons.push(w.person(`Person ${i}`));
    facts.push(w.factOn(open, { from: { entity: board, as_written: "Harbour Board" }, to: { entity: persons[i], as_written: `Person ${i}` } }));
  }
  /* a membership whose person is the last entity (part 2) and whose post and organization are in part 1 */
  const late = persons.at(-1);
  const holds = w.line("holds", late, master, { from: "2020-01-01" });
  w.line("post_in", master, board, {});
  const ids = (table, col) => w.rows(`SELECT ${col} AS id FROM ${table} ORDER BY ${col}`).map((r) => r.id);
  return { w, late, master, board, holds, source: { events: ids("events", "event_id"), entities: ids("entities", "entity_id"), facts: ids("money_facts", "fact_id") },
           events: new Set(events), persons: new Set(persons), facts: new Set(facts) };
}
const part = (w, format, n) => corpusExportOps(w.ce, (k) => ({ format, viewer: ANN, part: n })[k] ?? null).exportrender();
/* The items a rendering holds of the record kind the crowded world made 5,001 of. */
const mine = (format, body, ids) => {
  const all = format === "ocel2" ? body.events : format === "popolo" ? body.persons : format === "ocds" ? body.releases
    : format === "fdp" ? body.resources[0].data : body.entities;
  const key = format === "fdp" ? "fact_id" : "id";
  return all.filter((x) => ids.has(x[key]));
};
const noteOf = (format, body) => body[format === "fdp" ? "description" : "note"];

test("R10 R14 a rendering of RENDER_MAX + 1 records of a source: the first part states it is part 1 and names the next, the next part holds the last record, in every format", () => {
  const c = crowded();
  /* the source each format reads, and which of its records the format renders as its own items */
  const reads = { "ftm-event": ["events", c.events], ocel2: ["events", c.events], popolo: ["entities", c.persons],
                  "ftm-people": ["entities", c.persons], ftm: ["facts", c.facts], ocds: ["facts", c.facts], fdp: ["facts", c.facts] };
  for (const format of FORMATS) {
    const [name, only] = reads[format];
    const order = c.source[name];
    const own = new Set(order.filter((id) => only.has(id)));
    const want = (ids) => ids.filter((id) => own.has(id));
    const first = part(c.w, format, null);
    assert.equal(first.ok, true, format);
    /* an entity a line names is rendered in the part that names it too (by id, one entity): ftm-people's late person */
    const named = (ids) => ids.filter((id) => !(format === "ftm-people" && id === c.late));
    const a = named(mine(format, first.rendering, own).map((x) => x.id ?? x.fact_id));
    assert.deepEqual(a, named(want(order.slice(0, RENDER_MAX))), `${format}: the first part holds the first RENDER_MAX of the source`);
    assert.equal(a.includes(order.at(-1)) && own.has(order.at(-1)), false, `${format}: the last record is not in the first part`);
    const note = noteOf(format, first.rendering);
    assert.equal(typeof note, "string", `${format}: the first part's own body states the cut`);
    assert.match(note, /\b1\b/, `${format}: it says it is part 1`);
    assert.match(note, /\b2\b/, `${format}: it names the next part`);
    assert.deepEqual([first.part, first.next, first.truncated], [1, 2, true], format);
    const second = part(c.w, format, "2");
    assert.equal(second.ok, true, format);
    const b = named(mine(format, second.rendering, own).map((x) => x.id ?? x.fact_id));
    assert.deepEqual(b, named(want(order.slice(RENDER_MAX))), `${format}: part 2 holds the rest of the source, its last record among it`);
    assert.ok(b.length > 0 && b.at(-1) === named([...own].sort()).at(-1), `${format}: the last record of its kind is in part 2`);
    assert.equal(typeof noteOf(format, second.rendering), "string", `${format}: the last part says it is the last`);
    assert.deepEqual([second.part, second.next, second.truncated], [2, null, false], format);
    assert.deepEqual([...a, ...b].sort(), named([...own].sort()), `${format}: the two parts hold every record once`);
    if (format === "popolo") {
      /* a reference to a record in another part is resolved by id: the membership of a part-2 person is whole, and once */
      const m = [first, second].flatMap((r) => r.rendering.memberships).filter((x) => x.id === c.holds);
      assert.equal(m.length, 1, "the membership appears in exactly one part");
      assert.deepEqual([m[0].person_id, m[0].post_id, m[0].organization_id], [c.late, c.master, c.board]);
      assert.equal(first.rendering.posts.find((x) => x.id === c.master).organization_id, c.board);
    }
  }
});

test("R10 R14 a rendering within the bound is whole and carries no cut: part 1, no next, no note; a part that is not a whole number is refused", () => {
  const w = rich();
  const open = w.capture("minutes");
  w.eventOn(open, "meeting");
  for (const format of ["ftm-event", "fdp"]) {
    const r = part(w, format, null);
    assert.deepEqual([r.ok, r.part, r.next, r.truncated], [true, 1, null, false], format);
    assert.equal(noteOf(format, r.rendering), undefined, `${format}: nothing cut, nothing said`);
  }
  for (const bad of ["0", "-1", "1.5", "x"]) {
    const r = part(w, "ftm-event", bad);
    assert.deepEqual([r.ok, r.reason], [false, "EXPORT_PART_MALFORMED"], bad);
  }
});
