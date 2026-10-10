/* consequences R1, R10, R13, R14: recording a part, its refusals in order, a person only as a document names them, the
   reads gated on the project's sight, append-only tables declared to purge, and the part a `CONS-` record object. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { noSuchDetermination, determinationSuperseded } from "../../../src/conformance/index.mjs";
import { consequencesOwns, CONSEQUENCES_TABLES, CONSEQUENCES_CHECKS, AFFECTED_KINDS, UNITS } from "../../../src/consequences/index.mjs";

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

test("R1 (D54): a valid part lands; each refusal holds in the requirement's order, with a negative control", () => {
  const w = setup();
  const ok = w.c.consequenceRecord(w.base);
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.match(ok.id, /^CONS-2026-\d{4}-fund$/);

  /* Each case breaks one thing and everything after it too, so the first refusal named is the one that must win. */
  const bad = { affected: { kind: "planet" }, measure: { unit: "joy" }, period: { from: "x" } };
  const Ds = w.determination("CONF-2026-0003-old", w.P, { [S]: "noncompliant" }, { superseded_by: "CONF-2026-0004-new" });
  /* D54 (K2408): P is hidden, so carol, an administrator neither invited nor joined, sees it only at EXISTENCE: every
     determination in it is answered to her as an absent one, ahead of every other refusal, and nothing is written. */
  for (const over of [{ determination: Ds, standard: S2 }, { standard: S2 }, {}, { ...w.base }]) {
    const before = w.snapshot();
    const r = w.c.consequenceRecord({ ...w.base, ...bad, ...over, author: V("carol") });
    assert.deepEqual(r, noSuchDetermination(over.determination ?? w.D), `carol at EXISTENCE: ${JSON.stringify(over)}`);
    assert.deepEqual(w.snapshot(), before);
  }
  /* Negative control: P set discoverable, carol sees it whole, and R1's order below holds for her. */
  w.discoverable();
  /* The determination's two conditions are conformance's (its R19, R20): answered through its helpers, exactly. */
  const theirs = [
    [{ determination: "CONF-2026-0099-none", standard: "STD-x", author: V("bob"), ...bad },
     noSuchDetermination("CONF-2026-0099-none")],
    [{ determination: Ds, standard: S2, author: V("carol"), ...bad }, determinationSuperseded(Ds, "CONF-2026-0004-new")],
  ];
  for (const [over, want] of theirs) {
    const before = w.snapshot();
    const r = w.c.consequenceRecord({ ...w.base, ...over });
    assert.deepEqual(r, want, `${want.code} is conformance's answer, whole`);
    assert.deepEqual(w.snapshot(), before, `${want.code} writes nothing`);
  }
  const notAPerson = w.entity("Harbour Supply");
  const doe = w.person("Jordan Doe");
  const elsewhere = w.figure("INFO-2026-0007-roll", "The roll names nobody");
  const cases = [
    ["CONSEQUENCE_NOT_NONCOMPLIANT", { standard: S2, author: V("carol"), ...bad }],
    ["CONSEQUENCE_NOT_NONCOMPLIANT", { standard: "STD-2026-0099-unnamed", author: V("carol"), ...bad }],
    /* carol, an administrator, sees the project and has not joined it: seeing is not acting (membership R55). */
    ["CONSEQUENCE_NOT_A_PARTICIPANT", { author: V("carol"), ...bad }],
    ["AFFECTED_UNKNOWN_KIND", { ...bad }],
    ["AFFECTED_NOT_A_PERSON", { affected: { kind: "person", description: "a vendor", person: { entity: notAPerson, named_in: "x" } },
                                measure: bad.measure, period: bad.period }],
    ["AFFECTED_PERSON_NOT_NAMED", { affected: { kind: "person", description: "a resident", person: { entity: doe, named_in: elsewhere } },
                                    measure: bad.measure, period: bad.period }],
    ["MEASURE_UNKNOWN_UNIT", { measure: bad.measure, period: bad.period }],
    ["MEASURE_INVALID", { measure: { unit: "money", value: "twelve" }, period: bad.period }],
    ["PERIOD_INVALID", { period: bad.period }],
  ];
  for (const [code, over] of cases) {
    const before = w.snapshot();
    const r = w.c.consequenceRecord({ ...w.base, ...over });
    assert.equal(r.ok, false, code);
    assert.equal(r.reason, code, `${code}: ${JSON.stringify(r)}`);
    assert.deepEqual([r.code, r.check, r.translation], [code, CONSEQUENCES_CHECKS[code].check, CONSEQUENCES_CHECKS[code].translation],
                     `${code} carries its own row (DEC-49)`);
    assert.deepEqual(w.snapshot(), before, `${code} writes nothing`);
  }
  /* One site per code (K275, K380): this module holds no row for conformance's two codes, C-114.1 is not reused, and
     R1's own two conditions are named for it (C-114.2, C-114.3). */
  for (const gone of ["NO_SUCH_DETERMINATION", "DETERMINATION_SUPERSEDED", "NOT_NONCOMPLIANT", "NOT_A_PARTICIPANT"])
    assert.equal(gone in CONSEQUENCES_CHECKS, false, gone);
  assert.equal(Object.values(CONSEQUENCES_CHECKS).some((r) => r.check === "C-114.1"), false);
  assert.deepEqual([CONSEQUENCES_CHECKS.CONSEQUENCE_NOT_NONCOMPLIANT.check, CONSEQUENCES_CHECKS.CONSEQUENCE_NOT_A_PARTICIPANT.check],
                   ["C-114.2", "C-114.3"]);
  /* NO_SUCH_DETERMINATION: an invisible determination is the same answer as an absent one. */
  const Dq = w.determination("CONF-2026-0002-theirs", w.Q, { [S]: "noncompliant" });
  const unseen = w.c.consequenceRecord({ ...w.base, determination: Dq });
  const absent = w.c.consequenceRecord({ ...w.base, determination: "CONF-2026-0098-none" });
  assert.deepEqual(unseen, noSuchDetermination(Dq));
  assert.deepEqual({ ...unseen, determination: null }, { ...absent, determination: null });
  /* DETERMINATION_SUPERSEDED holds though the superseded determination's outcome is noncompliant, and ahead of the
     standard; a live determination with the same outcome is the negative control. */
  assert.deepEqual(w.c.consequenceRecord({ ...w.base, determination: Ds }), determinationSuperseded(Ds, "CONF-2026-0004-new"));
  const Dl = w.determination("CONF-2026-0005-live", w.P, { [S]: "noncompliant" });
  assert.equal(w.c.consequenceRecord({ ...w.base, determination: Dl }).ok, true);
  /* MEASURE_INVALID's arms: a range bound not finite, a reversed range, a currency on a unit other than money. */
  /* MEASURE_INVALID's arms: a value or a range bound that does not read as an exact decimal through calc-grammar (not
     finite, an exponent, a currency mark, a qualifier, a range, words), a reversed range (compared exactly: 0.3 is not
     below 0.1 + 0.2's 0.3), a currency on a unit other than money. */
  for (const measure of [{ unit: "count", range: { low: 1, high: NaN } }, { unit: "money", value: Infinity }, { unit: "money", value: 1e21 },
                         { unit: "money", value: "$12" }, { unit: "count", value: "about 12" }, { unit: "count", value: "3 to 4" },
                         { unit: "count", value: "12%" }, { unit: "count", value: true }, { unit: "count", range: { low: "5", high: "2" } },
                         { unit: "count", range: { low: "0.30000000000000001", high: "0.3" } },
                         { unit: "time", currency: "USD", value: 3 }])
    assert.equal(w.c.consequenceRecord({ ...w.base, measure }).reason, "MEASURE_INVALID", JSON.stringify(measure));
  /* Negative controls: a decimal string or a JavaScript number, each read as the exact decimal it prints; a range whose
     bounds are equal. */
  for (const [measure, want] of [[{ unit: "money", value: "1,200.50" }, { value: "1200.50" }], [{ unit: "money", value: 0.1 }, { value: "0.1" }],
                                 [{ unit: "money", value: "(40)" }, { value: "-40" }], [{ unit: "count", range: [0.3, "0.30"] }, { range: { low: "0.3", high: "0.30" } }]]) {
    const r = w.c.consequenceRecord({ ...w.base, measure });
    assert.equal(r.ok, true, JSON.stringify([measure, r]));
    assert.deepEqual("value" in want ? { value: r.part.measure.value } : { range: r.part.measure.range }, want, JSON.stringify(measure));
  }
  /* PERIOD_INVALID's arms: missing, unreadable, reversed. */
  for (const period of [null, { from: "2026-01-01" }, { from: "soon", to: "later" }, { from: "2026-06-01", to: "2026-01-01" }])
    assert.equal(w.c.consequenceRecord({ ...w.base, period }).reason, "PERIOD_INVALID", JSON.stringify(period));
  /* Negative controls: every kind and every unit lands; a range and a currency on money land. */
  const named = w.figure("INFO-2026-0008-list", "The list names Jordan Doe");
  for (const kind of AFFECTED_KINDS)
    assert.equal(w.c.consequenceRecord({ ...w.base, affected: { kind, description: `a ${kind}`,
      ...(kind === "person" ? { person: { entity: doe, named_in: named } } : {}) } }).ok, true, kind);
  for (const unit of UNITS)
    assert.equal(w.c.consequenceRecord({ ...w.base, measure: { unit, range: { low: 1, high: 2 } } }).ok, true, unit);
});

test("R1 R3 (K171 (9), D54): a machine's computed part answers no project authority; a machine's anything else is refused", () => {
  const w = setup();
  const a = w.figure("INFO-2026-0001-budget", "Cut: 7,500");
  const r = w.c.consequenceRecord({ ...w.base, author: MACHINE, measure: { unit: "money", currency: "USD" },
                                    basis: { op: "sum", operands: [{ content: a, figure: "7,500" }] } });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.part.state, "computed");
  assert.equal(r.part.label.machine_work, true);
  /* A member who sees the project and has not joined is refused for the same computation: the exemption is the
     machine's alone. D54: carol, an administrator neither invited nor joined, sees hidden P only at EXISTENCE, so its
     determination is absent to her; invited (not joined), she sees it whole and is refused for not having joined. */
  const asCarol = () => w.c.consequenceRecord({ ...w.base, author: V("carol"), measure: { unit: "money" },
    basis: { op: "sum", operands: [{ content: a, figure: "7,500" }] } });
  assert.deepEqual(asCarol(), noSuchDetermination(w.D));
  w.invite("carol");
  assert.equal(asCarol().reason, "CONSEQUENCE_NOT_A_PARTICIPANT");
  /* R3: an assessment, or an undetermined judgment, is a member's alone; an empty author is a machine's. */
  for (const author of [MACHINE, "", null]) {
    assert.equal(w.c.consequenceRecord({ ...w.base, author }).reason, "MACHINE_CANNOT_ASSESS", `assessed by ${author}`);
    assert.equal(w.c.consequenceRecord({ ...w.base, author, measure: null, basis: null }).reason, "MACHINE_CANNOT_ASSESS",
                 `undetermined by ${author}`);
  }
});

test("R10: people are a class or an office, or a person a document in the record names; a kind is one of the list", () => {
  const w = setup();
  /* A kind outside the list, a role that is half an office, or a person named on a kind other than person, is refused. */
  for (const kind of ["individual", "resident", "employee", "planet"])
    assert.equal(w.c.consequenceRecord({ ...w.base, affected: { kind, description: "someone" } }).reason,
                 "AFFECTED_UNKNOWN_KIND", kind);
  assert.equal(w.c.consequenceRecord({ ...w.base, affected: { kind: "body", description: "the office",
    role: { role: "director" } } }).reason, "AFFECTED_UNKNOWN_KIND");
  const doe = w.person("Jordan Doe", ["J. Doe"]);
  const roll = w.figure("INFO-2026-0001-roll", "The waiting list names Jordan  DOE among those cut");
  assert.equal(w.c.consequenceRecord({ ...w.base, affected: { kind: "class", description: "tenants",
    person: { entity: doe, named_in: roll } } }).reason, "AFFECTED_UNKNOWN_KIND");
  /* Negative controls: a class of people, an office, and a person a passage names (white space and case folded). */
  const cls = w.c.consequenceRecord({ ...w.base, affected: { kind: "class", description: "families on the waiting list" } });
  assert.equal(cls.ok, true);
  const office = w.c.consequenceRecord({ ...w.base, affected: { kind: "body", description: "the department",
    role: { role: "director", body: "parks department" } } });
  assert.equal(office.ok, true);
  assert.deepEqual(office.part.affected.role, { role: "director", body: "parks department" });
  const named = w.c.consequenceRecord({ ...w.base, affected: { kind: "person", description: "a resident cut from the list",
    person: { entity: doe, named_in: roll } } });
  assert.equal(named.ok, true, JSON.stringify(named));
  assert.match(named.id, /-person$/);
  /* Held as the document names them (read internally: what a viewer is answered is R16's, person.test.mjs). */
  assert.deepEqual(w.c.consequenceRead({ id: named.id }).part.affected, { kind: "person", description: "a resident cut from the list",
                                                                          person: { entity: doe, named_in: roll } });
  /* An alias the entity holds names them too; the passage must hold the label or an alias. */
  const alias = w.figure("INFO-2026-0002-memo", "Memo: J. Doe was removed");
  assert.equal(w.c.consequenceRecord({ ...w.base, affected: { kind: "person", description: "r", person: { entity: doe, named_in: alias } } }).ok, true);
  /* Refusals, each with nothing written: an entity that is not a person, or not held; no passage, a passage not held,
     or one that does not name them. */
  const vendor = w.entity("Harbour Supply");
  const cases = [
    ["AFFECTED_NOT_A_PERSON", { entity: vendor, named_in: roll }], ["AFFECTED_NOT_A_PERSON", { entity: "ENT-2026-nobody", named_in: roll }],
    ["AFFECTED_NOT_A_PERSON", { named_in: roll }], ["AFFECTED_NOT_A_PERSON", null],
    ["AFFECTED_PERSON_NOT_NAMED", { entity: doe }], ["AFFECTED_PERSON_NOT_NAMED", { entity: doe, named_in: "f".repeat(64) }],
    ["AFFECTED_PERSON_NOT_NAMED", { entity: doe, named_in: w.figure("INFO-2026-0003-other", "The list names Pat Roe") }],
  ];
  for (const [code, person] of cases) {
    const before = w.snapshot();
    const r = w.c.consequenceRecord({ ...w.base, affected: { kind: "person", description: "someone", ...(person ? { person } : {}) } });
    assert.equal(r.reason, code, JSON.stringify([person, r]));
    assert.deepEqual([r.check, r.translation], [CONSEQUENCES_CHECKS[code].check, CONSEQUENCES_CHECKS[code].translation]);
    assert.deepEqual(w.snapshot(), before);
  }
  assert.deepEqual([CONSEQUENCES_CHECKS.AFFECTED_PERSON_NOT_NAMED.check, CONSEQUENCES_CHECKS.AFFECTED_NOT_A_PERSON.check],
                   ["C-114.21", "C-114.22"]);
  /* AFFECTED_INDIVIDUAL is retired, its row with it (C-114.5 is not reused). */
  assert.equal("AFFECTED_INDIVIDUAL" in CONSEQUENCES_CHECKS, false);
  assert.equal(Object.values(CONSEQUENCES_CHECKS).some((r) => r.check === "C-114.5"), false);
  assert.equal(AFFECTED_KINDS.includes("person"), true);
  /* The person never enters the part's record object, fenced by the project's sight alone (R16, DEC-78). */
  const md = w.record.readFile(named.id, "bundle.md").text;
  assert.equal(md.includes(doe) || md.includes(roll) || /doe/i.test(md), false);
});

test("R13 (D54): parts, revisions and addressed records are append-only, declared to purge, and unseen parts read as absent", () => {
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
  assert.equal(w.c.consequencesOf({ determination: w.D, viewer: V("bob") }).reason, "NO_SUCH_DETERMINATION");
  assert.equal(w.c.addressed({ determination: w.D, viewer: V("bob") }).reason, "NO_SUCH_DETERMINATION");
  assert.equal(w.c.addressedRecord({ id: r.id, state: "addressed", evidence: ["x"], reason: "r", author: V("bob") }).reason,
               "NO_SUCH_PART");
  assert.equal(w.c.consequenceRevise({ id: r.id, reason: "r", author: V("bob") }).reason, "NO_SUCH_PART");
  /* No place is named in this module's outward text: its answers carry only what the caller and the record gave. */
  const words = JSON.stringify([w.c.consequencesOf({ determination: w.D, viewer: V("alice") }),
                                w.c.addressed({ determination: w.D, viewer: V("alice") }), unseen]);
  for (const place of ["Oakland", "California", "Alameda", "Sacramento"]) assert.equal(words.includes(place), false, place);
  /* D54 (K2408): carol, an administrator neither invited nor joined, sees hidden P only at EXISTENCE, never its
     contents: every read answers its part as absent to her, as to bob. */
  const carol = V("carol");
  assert.deepEqual(w.c.consequenceRead({ id: r.id, viewer: carol }), unseen, "an administrator at EXISTENCE: absent");
  assert.deepEqual([w.c.consequencesOf({ determination: w.D, viewer: carol }), w.c.addressed({ determination: w.D, viewer: carol })],
                   [noSuchDetermination(w.D), noSuchDetermination(w.D)]);
  /* Negative control: P set discoverable, the administrator sees it whole; bob, a member outside it, still at
     EXISTENCE, is answered as before. */
  w.discoverable();
  assert.equal(w.c.consequenceRead({ id: r.id, viewer: carol }).ok, true, "an administrator sees a discoverable project");
  assert.equal(w.c.consequencesOf({ determination: w.D, viewer: carol }).ok, true);
  assert.deepEqual(w.c.consequenceRead({ id: r.id, viewer: V("bob") }), unseen);
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
