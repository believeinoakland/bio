/* lines at its interface: recordLine's refusals and its write (R1), end kinds (R2), bounds (R3), the machine's writes
   (R4) and a register row's own record instant (R5). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, sha, ANN, MACHINE } from "./fixture.mjs";
import { LINE_KINDS, CAPACITIES, ROLES } from "../../../src/lines/index.mjs";

const T = { statement: "I attended the meeting where this was said" };
const count = (w) => w.one(`SELECT COUNT(*) AS n FROM lines`).n;

test("R1 recordLine refuses in order: UNKNOWN_LINE_KIND (naming the closed list, the detail saying money is a money fact), NO_ENDS, SELF_LINE, NO_SUCH_ENTITY per end, BAD_ROLE, NO_CAPACITY/UNKNOWN_CAPACITY/BAD_CAPACITY, NO_BASIS and each basis form's own refusal; a refusal writes nothing", () => {
  const w = world();
  const p = w.ent("person", "Ada Example"), o = w.ent("office", "Harbour Master"), b = w.ent("body", "Port Board");
  const u = w.l.recordLine({ kind: "gave_to", from: p, to: o, basis: T, by: ANN });
  assert.equal(u.reason, "UNKNOWN_LINE_KIND");
  for (const k of LINE_KINDS) assert.ok(u.detail.includes(k), k);
  assert.match(u.detail, /money fact/);
  assert.equal(w.l.recordLine({ from: p, basis: T, by: ANN }).reason, "UNKNOWN_LINE_KIND", "the kind is asked first");
  assert.equal(w.l.recordLine({ kind: "part_of", from: o, basis: T, by: ANN }).reason, "NO_ENDS");
  assert.equal(w.l.recordLine({ kind: "part_of", to: o, basis: T, by: ANN }).reason, "NO_ENDS");
  assert.equal(w.l.recordLine({ kind: "part_of", from: o, to: o, basis: T, by: ANN }).reason, "SELF_LINE");
  const nf = w.l.recordLine({ kind: "part_of", from: "ENT-2026-7777", to: o, basis: T, by: ANN });
  assert.deepEqual([nf.reason, nf.entity_id, nf.end], ["NO_SUCH_ENTITY", "ENT-2026-7777", "from"]);
  const nt = w.l.recordLine({ kind: "part_of", from: o, to: "ENT-2026-7777", basis: T, by: ANN });
  assert.deepEqual([nt.reason, nt.end], ["NO_SUCH_ENTITY", "to"]);
  assert.equal(w.l.recordLine({ kind: "reports_to", from: o, to: b, role: "spiritual", basis: T, by: ANN }).reason, "BAD_ROLE");
  assert.equal(w.l.recordLine({ kind: "part_of", from: o, to: b, role: "administrative", basis: T, by: ANN }).reason, "BAD_ROLE", "a role on a kind that takes none");
  assert.equal(w.l.recordLine({ kind: "holds", from: p, to: o, basis: T, by: ANN }).reason, "NO_CAPACITY");
  assert.equal(w.l.recordLine({ kind: "holds", from: p, to: o, capacity: "king", basis: T, by: ANN }).reason, "UNKNOWN_CAPACITY");
  assert.equal(w.l.recordLine({ kind: "part_of", from: o, to: b, capacity: "elected", basis: T, by: ANN }).reason, "BAD_CAPACITY");
  assert.equal(w.l.recordLine({ kind: "part_of", from: o, to: b, by: ANN }).reason, "NO_BASIS");
  assert.equal(w.l.recordLine({ kind: "part_of", from: o, to: b, basis: { what: 1 }, by: ANN }).reason, "NO_BASIS");
  assert.equal(w.l.recordLine({ kind: "part_of", from: o, to: b, basis: { statement: "  " }, by: ANN }).reason, "NO_STATEMENT");
  assert.equal(w.l.recordLine({ kind: "part_of", from: o, to: b, basis: { captureSha: "", extent: { kind: "document" } }, by: ANN }).reason, "NO_SHA");
  assert.equal(w.l.recordLine({ kind: "part_of", from: o, to: b, basis: { captureSha: sha("nowhere"), extent: { kind: "document" } }, by: ANN }).reason, "CAPTURE_NOT_HELD");
  const s = w.held("INFO-2026-0001", sha("doc"));
  assert.equal(w.l.recordLine({ kind: "part_of", from: o, to: b, basis: { captureSha: s }, by: ANN }).reason, "NO_EXTENT");
  assert.equal(w.l.recordLine({ kind: "part_of", from: o, to: b, basis: { captureSha: s, extent: { kind: "nonsense" } }, by: ANN }).reason, "EXTENT_NOT_IN_CAPTURE");
  assert.equal(w.l.recordLine({ kind: "part_of", from: o, to: b, basis: { rule: "", source: s }, by: ANN }).reason, "NO_BASIS");
  assert.equal(w.l.recordLine({ kind: "part_of", from: o, to: b, basis: { rule: "seat", source: sha("gone") }, by: ANN }).reason, "CAPTURE_NOT_HELD");
  assert.equal(count(w), 0, "no refusal wrote a line");
  assert.equal(w.one(`SELECT COUNT(*) AS n FROM line_bound_cache`).n, 0);
});

test("R1 otherwise it allocates LIN-<year>-<16-char tail> and writes the line with its bound_cache in one transaction", () => {
  const w = world();
  const o = w.ent("office", "Harbour Master"), b = w.ent("body", "Port Board");
  const r = w.l.recordLine({ kind: "post_in", from: o, to: b, valid: { from: "2020-01-01" }, basis: T, by: ANN });
  assert.equal(r.ok, true);
  assert.match(r.line_id, /^LIN-2026-[a-z0-9]{16}$/);
  assert.equal(w.one(`SELECT kind FROM lines WHERE line_id=?`, r.line_id).kind, "post_in");
  assert.equal(w.one(`SELECT from_instant FROM line_bound_cache WHERE line_id=?`, r.line_id).from_instant, "2020-01-01");
  assert.ok(w.one(`SELECT 1 AS x FROM minted_ids WHERE id=?`, r.line_id), "the id is in record-core's ledger");
  /* every passage, rule and testimony basis is held */
  const s = w.held("INFO-2026-0001", sha("doc"));
  assert.equal(w.l.recordLine({ kind: "part_of", from: o, to: b, basis: { captureSha: s, extent: { kind: "document" } }, by: ANN }).ok, true);
  assert.equal(w.l.recordLine({ kind: "part_of", from: o, to: b, basis: { rule: "profile office", source: { profile: "test-port-ellery", entry: 0 } }, by: ANN }).ok, true);
  assert.equal(count(w), 3);
});

test("R2 seat_on runs from an office to a body only (SEAT_ON_ENDS); party_to's to and both ends of appeal_of, consolidated_with and remanded_to are proceedings (PROCEEDING_ENDS); other kinds take any registered kinds", () => {
  const w = world();
  const p = w.ent("person", "Ada Example"), o = w.ent("office", "Harbour Master"), b = w.ent("body", "Port Board");
  const c1 = w.ent("proceeding", "Case one"), c2 = w.ent("proceeding", "Case two");
  assert.equal(w.l.recordLine({ kind: "seat_on", from: p, to: b, basis: T, by: ANN }).reason, "SEAT_ON_ENDS");
  assert.equal(w.l.recordLine({ kind: "seat_on", from: o, to: p, basis: T, by: ANN }).reason, "SEAT_ON_ENDS");
  assert.equal(w.l.recordLine({ kind: "seat_on", from: o, to: b, basis: T, by: ANN }).ok, true);
  assert.equal(w.l.recordLine({ kind: "party_to", from: p, to: b, basis: T, by: ANN }).reason, "PROCEEDING_ENDS");
  assert.equal(w.l.recordLine({ kind: "party_to", from: p, to: c1, role: "plaintiff", basis: T, by: ANN }).ok, true);
  for (const k of ["appeal_of", "consolidated_with", "remanded_to"]) {
    assert.equal(w.l.recordLine({ kind: k, from: c1, to: b, basis: T, by: ANN }).reason, "PROCEEDING_ENDS", k);
    assert.equal(w.l.recordLine({ kind: k, from: b, to: c1, basis: T, by: ANN }).reason, "PROCEEDING_ENDS", k);
    assert.equal(w.l.recordLine({ kind: k, from: c1, to: c2, basis: T, by: ANN }).ok, true, k);
  }
  assert.equal(w.l.recordLine({ kind: "arises_from", from: c1, to: b, basis: T, by: ANN }).ok, true, "arises_from takes any ends");
  for (const k of ["part_of", "funds", "related_to", "educated_at", "acts_for"])
    assert.equal(w.l.recordLine({ kind: k, from: p, to: b, basis: T, by: ANN }).ok, true, k);
});

test("R3 bounds: BOUND_BOTH, NO_SUCH_EVENT, BAD_EDGE, BAD_DATE (civil-time's calendar), BOUNDS_REVERSED; precision and zone carried, the zone by default the profile's", () => {
  const w = world();
  const o = w.ent("office", "Harbour Master"), b = w.ent("body", "Port Board");
  const rec = (valid) => w.l.recordLine({ kind: "part_of", from: o, to: b, valid, basis: T, by: ANN });
  const e = w.event("2021-03-04");
  assert.equal(rec({ from: { value: "2020-01-01", event: e, edge: "start" } }).reason, "BOUND_BOTH");
  assert.equal(rec({ from: { event: "EVT-2026-zzzzzzzzzzzzzzzz", edge: "start" } }).reason, "NO_SUCH_EVENT");
  assert.equal(rec({ from: { event: e, edge: "middle" } }).reason, "BAD_EDGE");
  assert.equal(rec({ from: "2026-02-31" }).reason, "BAD_DATE");
  assert.equal(rec({ from: "2026-13-01" }).reason, "BAD_DATE");
  assert.equal(rec({ from: "2020-01-01", precision: "fortnight" }).reason, "BAD_DATE");
  assert.equal(rec({ from: "2022-01-01", to: "2021-01-01" }).reason, "BOUNDS_REVERSED");
  assert.equal(rec({ from: { event: e, edge: "start" }, to: "2021-01-01" }).reason, "BOUNDS_REVERSED", "an event bound settles the order too");
  const ok = rec({ from: "2020-01-01T09:30", precision: "minute" });
  assert.equal(ok.ok, true);
  const line = w.l.readLine({ lineId: ok.line_id, viewer: ANN }).line;
  assert.deepEqual([line.bounds.given.precision, line.bounds.given.zone], ["minute", "America/Halifax"], "the profile's zone");
  const z = rec({ from: "2020-01-01", zone: "Europe/Paris" });
  assert.equal(w.l.readLine({ lineId: z.line_id, viewer: ANN }).line.bounds.given.zone, "Europe/Paris");
  assert.equal(rec({ from: "2020-01-01", to: "2020-01-01" }).ok, true, "one day is not reversed");
  const none = world({ profiles: null });
  const o2 = none.ent("office", "A"), b2 = none.ent("body", "B");
  assert.equal(none.l.recordLine({ kind: "part_of", from: o2, to: b2, valid: { from: "2020-01-01" }, basis: T, by: ANN }).reason, "BAD_DATE",
               "no zone given and none in the active profiles");
});

test("R4 the machine records a line only from a system rule whose two ends its scheme identifiers name; any other machine line is MACHINE_NEEDS_IDENTIFIERS; ends so identified grade A", () => {
  const w = world();
  const p = w.ent("person", "Ada Example"), o = w.ent("office", "Harbour Master"), b = w.ent("body", "Port Board");
  const s = w.held("INFO-2026-0001", sha("legistar officerecords"));
  w.identify(p, "ellery_person", "P101");
  w.identify(b, "test_org", "7");
  const base = { kind: "belongs_to", from: p, to: b, by: MACHINE };
  assert.equal(w.l.recordLine({ ...base, basis: T }).reason, "MACHINE_NEEDS_IDENTIFIERS", "testimony");
  assert.equal(w.l.recordLine({ ...base, basis: { captureSha: s, extent: { kind: "document" } } }).reason, "MACHINE_NEEDS_IDENTIFIERS", "a passage");
  assert.equal(w.l.recordLine({ ...base, basis: { rule: "seat", source: s } }).reason, "MACHINE_NEEDS_IDENTIFIERS", "no identifiers");
  const ids = { from: { scheme: "ellery_person", id: "P101" }, to: { scheme: "test_org", id: "7" } };
  assert.equal(w.l.recordLine({ ...base, basis: { rule: "seat", source: s, ids: { ...ids, to: { scheme: "test_org", id: "8" } } } }).reason,
               "MACHINE_NEEDS_IDENTIFIERS", "an identifier naming no end");
  assert.equal(w.l.recordLine({ ...base, to: o, basis: { rule: "seat", source: s, ids } }).reason, "MACHINE_NEEDS_IDENTIFIERS", "an identifier naming another entity");
  const r = w.l.recordLine({ ...base, basis: { rule: "seat", source: s, ids } });
  assert.equal(r.ok, true);
  assert.deepEqual(r.ends, { from: "A", to: "A" });
  assert.equal(w.l.recordLine({ ...base, basis: T, by: ANN }).ok, true, "a member's act from a name match or testimony is the member's");
});

test("R5 a line whose basis is a register row records the source's own record instant and answers its bounds 'as recorded by <system> on <instant>', never as the record's finding", () => {
  const w = world();
  const p = w.ent("person", "Ada Example"), o = w.ent("office", "Harbour Master");
  const s = w.held("INFO-2026-0001", sha("officerecords page"));
  w.identify(p, "ellery_person", "P101");
  w.identify(o, "test_org", "55");
  const basis = { rule: "seat", source: s, system: "Legistar", ids: { from: { scheme: "ellery_person", id: "P101" }, to: { scheme: "test_org", id: "55" } } };
  assert.equal(w.l.recordLine({ kind: "holds", from: p, to: o, capacity: "elected", basis, by: MACHINE }).reason, "NO_BASIS", "a register row states its instant");
  assert.equal(w.l.recordLine({ kind: "holds", from: p, to: o, capacity: "elected", basis: { ...basis, recorded_at: "yesterday" }, by: MACHINE }).reason, "NO_BASIS");
  const r = w.l.recordLine({ kind: "holds", from: p, to: o, capacity: "elected", valid: { from: "2023-01-09" },
                             basis: { ...basis, recorded_at: "2026-09-01T12:00:00Z" }, by: MACHINE });
  assert.equal(r.ok, true);
  const line = w.l.readLine({ lineId: r.line_id, viewer: ANN }).line;
  assert.equal(line.recorded, "as recorded by Legistar on 2026-09-01T12:00:00Z");
  assert.equal(line.bounds.label, "as recorded by Legistar on 2026-09-01T12:00:00Z");
  assert.equal(line.recorded_at, "2026-09-01T12:00:00Z");
  const n = w.l.neighbours({ node: o, at: "2024-01-01T00:00:00Z", viewer: ANN });
  assert.equal(n.items[0].evidence[0].label, "as recorded by Legistar on 2026-09-01T12:00:00Z");
  const plain = w.l.readLine({ lineId: w.say("part_of", o, w.ent("body", "Board")), viewer: ANN }).line;
  assert.equal(plain.recorded, undefined, "a line not from a register row carries no such label");
});

test("R1 the vocabulary of the refusals: each role list is the kind's own", () => {
  const w = world();
  const a = w.ent("institution", "Harbour Authority"), c = w.ent("institution", "Dredging Co"), o = w.ent("office", "Harbour Master");
  for (const role of ROLES.contracts_with) assert.equal(w.l.recordLine({ kind: "contracts_with", from: a, to: c, role, basis: T, by: ANN }).ok, true, role);
  for (const role of ROLES.reports_to) assert.equal(w.l.recordLine({ kind: "reports_to", from: o, to: a, role, basis: T, by: ANN }).ok, true, role);
  const p = w.ent("person", "Ada Example");
  for (const capacity of CAPACITIES) assert.equal(w.l.recordLine({ kind: "holds", from: p, to: o, capacity, basis: T, by: ANN }).ok, true, capacity);
});
