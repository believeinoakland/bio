/* consequences R1, R10, R13, R14: recording a part, its refusals in order, people never singled out, the reads gated
   on the project's sight, append-only tables declared to purge, and the part a `CONS-` record object. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { consequencesOwns, CONSEQUENCES_TABLES, AFFECTED_KINDS, UNITS } from "../../../src/consequences/index.mjs";

const S = "STD-2026-0001-law";
const S2 = "STD-2026-0002-other";

function setup(opts) {
  const w = world(opts);
  w.D = w.determination("CONF-2026-0001-act", w.P, { [S]: "noncompliant", [S2]: "compliant" });
  w.base = { determination: w.D, standard: S, affected: { kind: "fund", description: "the parks fund" },
             measure: { unit: "money", currency: "USD", value: 5000 }, period: { from: "2026-01-01", to: "2026-06-30" },
             basis: { rationale: "the budget table shows the cut" }, author: V("alice") };
  return w;
}

test("R1: a valid part lands; each refusal holds in the requirement's order, with a negative control", () => {
  const w = setup();
  const ok = w.c.consequenceRecord(w.base);
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.match(ok.id, /^CONS-2026-\d{4}-fund$/);

  /* Each case breaks one thing and everything after it too, so the first refusal named is the one that must win. */
  const bad = { affected: { kind: "planet" }, measure: { unit: "joy" }, period: { from: "x" } };
  const cases = [
    ["NO_SUCH_DETERMINATION", { determination: "CONF-2026-0099-none", standard: "STD-x", author: V("bob"), ...bad }],
    ["NOT_NONCOMPLIANT", { standard: S2, author: V("carol"), ...bad }],
    ["NOT_NONCOMPLIANT", { standard: "STD-2026-0099-unnamed", author: V("carol"), ...bad }],
    /* carol, an administrator, sees the project and has not joined it: seeing is not acting (membership R55). */
    ["NOT_A_PARTICIPANT", { author: V("carol"), ...bad }],
    ["AFFECTED_UNKNOWN_KIND", { ...bad }],
    ["AFFECTED_INDIVIDUAL", { affected: { kind: "person", description: "a named resident" }, measure: bad.measure, period: bad.period }],
    ["MEASURE_UNKNOWN_UNIT", { measure: bad.measure, period: bad.period }],
    ["MEASURE_INVALID", { measure: { unit: "money", value: Infinity }, period: bad.period }],
    ["PERIOD_INVALID", { period: bad.period }],
  ];
  for (const [code, over] of cases) {
    const before = w.snapshot();
    const r = w.c.consequenceRecord({ ...w.base, ...over });
    assert.equal(r.ok, false, code);
    assert.equal(r.reason, code, `${code}: ${JSON.stringify(r)}`);
    assert.deepEqual(w.snapshot(), before, `${code} writes nothing`);
  }
  /* NO_SUCH_DETERMINATION: an invisible determination is the same answer as an absent one. */
  const Dq = w.determination("CONF-2026-0002-theirs", w.Q, { [S]: "noncompliant" });
  const unseen = w.c.consequenceRecord({ ...w.base, determination: Dq });
  const absent = w.c.consequenceRecord({ ...w.base, determination: "CONF-2026-0098-none" });
  assert.equal(unseen.reason, "NO_SUCH_DETERMINATION");
  assert.deepEqual(Object.keys(unseen).sort(), Object.keys(absent).sort());
  assert.equal(unseen.detail, absent.detail);
  /* NOT_NONCOMPLIANT: a superseded determination refuses new parts, though its outcome is noncompliant. */
  const Ds = w.determination("CONF-2026-0003-old", w.P, { [S]: "noncompliant" }, { superseded_by: "CONF-2026-0004-new" });
  assert.equal(w.c.consequenceRecord({ ...w.base, determination: Ds }).reason, "NOT_NONCOMPLIANT");
  /* MEASURE_INVALID's arms: a range bound not finite, a reversed range, a currency on a unit other than money. */
  for (const measure of [{ unit: "count", range: { low: 1, high: NaN } }, { unit: "count", range: { low: 5, high: 2 } },
                         { unit: "time", currency: "USD", value: 3 }, { unit: "money", value: "12" }])
    assert.equal(w.c.consequenceRecord({ ...w.base, measure }).reason, "MEASURE_INVALID", JSON.stringify(measure));
  /* PERIOD_INVALID's arms: missing, unreadable, reversed. */
  for (const period of [null, { from: "2026-01-01" }, { from: "soon", to: "later" }, { from: "2026-06-01", to: "2026-01-01" }])
    assert.equal(w.c.consequenceRecord({ ...w.base, period }).reason, "PERIOD_INVALID", JSON.stringify(period));
  /* Negative controls: every kind and every unit lands; a range and a currency on money land. */
  for (const kind of AFFECTED_KINDS)
    assert.equal(w.c.consequenceRecord({ ...w.base, affected: { kind, description: `a ${kind}` } }).ok, true, kind);
  for (const unit of UNITS)
    assert.equal(w.c.consequenceRecord({ ...w.base, measure: { unit, range: { low: 1, high: 2 } } }).ok, true, unit);
});

test("R1 R3 (K171 (9)): a machine's computed part answers no project authority; a machine's anything else is refused", () => {
  const w = setup();
  const a = w.figure("INFO-2026-0001-budget", "Cut: 7,500");
  const r = w.c.consequenceRecord({ ...w.base, author: MACHINE, measure: { unit: "money", currency: "USD" },
                                    basis: { op: "sum", operands: [{ content: a, figure: "7,500" }] } });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.part.state, "computed");
  assert.equal(r.part.label.machine_work, true);
  /* A member who sees the project and has not joined is refused for the same computation: the exemption is the
     machine's alone. */
  assert.equal(w.c.consequenceRecord({ ...w.base, author: V("carol"), measure: { unit: "money" },
    basis: { op: "sum", operands: [{ content: a, figure: "7,500" }] } }).reason, "NOT_A_PARTICIPANT");
  /* R3: an assessment, or an undetermined judgment, is a member's alone; an empty author is a machine's. */
  for (const author of [MACHINE, "", null]) {
    assert.equal(w.c.consequenceRecord({ ...w.base, author }).reason, "MACHINE_CANNOT_ASSESS", `assessed by ${author}`);
    assert.equal(w.c.consequenceRecord({ ...w.base, author, measure: null, basis: null }).reason, "MACHINE_CANNOT_ASSESS",
                 `undetermined by ${author}`);
  }
});

test("R10: people are a class or an office, never singled out", () => {
  const w = setup();
  for (const kind of ["person", "individual", "resident", "employee", "PERSON"])
    assert.equal(w.c.consequenceRecord({ ...w.base, affected: { kind, description: "someone" } }).reason,
                 "AFFECTED_INDIVIDUAL", kind);
  /* A name on the affected or on its role singles a person out, whatever the kind says. */
  assert.equal(w.c.consequenceRecord({ ...w.base, affected: { kind: "class", description: "tenants", name: "J. Doe" } }).reason,
               "AFFECTED_INDIVIDUAL");
  assert.equal(w.c.consequenceRecord({ ...w.base, affected: { kind: "body", description: "the office",
    role: { role: "director", body: "parks department", person: "J. Doe" } } }).reason, "AFFECTED_INDIVIDUAL");
  /* A role is an office {role, body}; half of one is refused. */
  assert.equal(w.c.consequenceRecord({ ...w.base, affected: { kind: "body", description: "the office",
    role: { role: "director" } } }).reason, "AFFECTED_INDIVIDUAL");
  /* Negative controls: a class of people, and an office. */
  const cls = w.c.consequenceRecord({ ...w.base, affected: { kind: "class", description: "families on the waiting list" } });
  assert.equal(cls.ok, true);
  const office = w.c.consequenceRecord({ ...w.base, affected: { kind: "body", description: "the department",
    role: { role: "director", body: "parks department" } } });
  assert.equal(office.ok, true);
  assert.deepEqual(office.part.affected.role, { role: "director", body: "parks department" });
  assert.equal(AFFECTED_KINDS.includes("person"), false);
});

test("R13: parts, revisions and addressed records are append-only, declared to purge, and unseen parts read as absent", () => {
  const w = setup();
  const r = w.c.consequenceRecord(w.base);
  const before = w.rows(`SELECT * FROM consequence_parts WHERE bundle_id=?`, r.id)[0];
  const rev = w.c.consequenceRevise({ id: r.id, reason: "the table was misread", measure: { unit: "money", value: 6000 },
                                      author: V("alice") });
  assert.equal(rev.ok, true, JSON.stringify(rev));
  w.c.addressedRecord({ id: rev.id, state: "not_addressed", reason: "nothing yet", author: V("alice") });
  w.c.addressedRecord({ id: rev.id, state: "not_addressed", reason: "still nothing", author: V("alice") });
  assert.deepEqual(w.rows(`SELECT * FROM consequence_parts WHERE bundle_id=?`, r.id)[0], before, "the earlier row is unchanged");
  assert.equal(w.count("consequence_addressed"), 2, "a later record is a new row");
  /* Declared to purge, and a purge of one part's bundle clears only its rows. */
  assert.deepEqual(CONSEQUENCES_TABLES.map((t) => (typeof t === "string" ? t : t.name)),
                   ["consequence_parts", "consequence_operands", "consequence_addressed"]);
  assert.equal(CONSEQUENCES_TABLES.every((t) => consequencesOwns(t)), true);
  assert.equal(w.record.declarePurge("other", ["consequence_parts"]).reason, "TABLE_DECLARED");
  const p = w.record.purge({ bundleId: rev.id });
  assert.equal(p.ok !== false, true);
  assert.equal(w.rows(`SELECT 1 FROM consequence_parts WHERE bundle_id=?`, rev.id).length, 0);
  assert.equal(w.rows(`SELECT 1 FROM consequence_addressed WHERE part_id=?`, rev.id).length, 0);
  assert.equal(w.rows(`SELECT 1 FROM consequence_parts WHERE bundle_id=?`, r.id).length, 1);
  /* Every read answers a part in a project the viewer may not see as absent. */
  const seen = w.c.consequenceRead({ id: r.id, viewer: V("alice") });
  assert.equal(seen.ok, true);
  const unseen = w.c.consequenceRead({ id: r.id, viewer: V("bob") });
  const absent = w.c.consequenceRead({ id: "CONS-2026-0999-fund", viewer: V("bob") });
  assert.equal(unseen.reason, "NO_SUCH_PART");
  assert.deepEqual({ ...unseen, id: null }, { ...absent, id: null });
  assert.equal(w.c.consequenceRead({ id: r.id, viewer: V("carol") }).ok, true, "an administrator sees the project");
  assert.equal(w.c.consequencesOf({ determination: w.D, viewer: V("bob") }).reason, "NO_SUCH_DETERMINATION");
  assert.equal(w.c.addressed({ determination: w.D, viewer: V("bob") }).reason, "NO_SUCH_DETERMINATION");
  assert.equal(w.c.addressedRecord({ id: r.id, state: "addressed", evidence: ["x"], reason: "r", author: V("bob") }).reason,
               "NO_SUCH_PART");
  assert.equal(w.c.consequenceRevise({ id: r.id, reason: "r", author: V("bob") }).reason, "NO_SUCH_PART");
  /* No place is named in this module's outward text: its answers carry only what the caller and the record gave. */
  const words = JSON.stringify([w.c.consequencesOf({ determination: w.D, viewer: V("alice") }),
                                w.c.addressed({ determination: w.D, viewer: V("alice") }), unseen]);
  for (const place of ["Oakland", "California", "Alameda", "Sacramento"]) assert.equal(words.includes(place), false, place);
});

test("R14: a part is a CONS- record object promoted through promotion, with history, audit and export", async () => {
  const w = setup();
  const r = w.c.consequenceRecord(w.base);
  const head = w.record.head(r.id);
  assert.equal(head.type, "consequence");
  assert.equal(head.currentState, "recorded");
  const md = w.record.readFile(r.id, "bundle.md").text;
  assert.match(md, /^id: CONS-2026-\d{4}-fund$/m);
  assert.match(md, /"rationale": "the budget table shows the cut"/);
  const image = w.record.readImage(r.id);
  assert.ok(image, "exported as an image");
  const manifest = Object.entries(image).find(([k]) => /manifest/.test(k));
  assert.ok(manifest && /promotion/.test(JSON.stringify(manifest[1])), "its promotion is in its manifest (history)");
  const audit = await w.record.auditPass({ limit: 50 });
  const mine = (audit.offenders || []).filter((o) => o.bundleId === r.id);
  assert.deepEqual(mine, [], `the catalogue finds nothing wrong with a part: ${JSON.stringify(mine)}`);
  /* R6's rule holds for the object: a revision is a successor, a second CONS- object; the first stays `recorded`. */
  const rev = w.c.consequenceRevise({ id: r.id, reason: "corrected", measure: { unit: "money", value: 1 }, author: V("alice") });
  assert.notEqual(rev.id, r.id);
  assert.equal(w.record.head(rev.id).type, "consequence");
  assert.equal(w.record.head(r.id).currentState, "recorded");
  assert.equal(w.record.head(r.id).bundleSha, head.bundleSha, "the earlier object is not rewritten");
  /* The type's machine has one state: a promotion moving a part elsewhere is refused by promotion. */
  const moved = w.promotion.promote({ bundleId: r.id, base: head.bundleSha, snapKey: "move1", author: V("alice"),
    files: [{ path: "bundle.md", text: md.replace("current_state: recorded", "current_state: retired") }], meta: {} });
  assert.equal(moved.ok, false);
});
