/* A flow's basis naming a held standard (R39; K1446): refused through standards' one answer when the reader may see
   none, PORTION_UNKNOWN for a portion it does not hold; kept with the version, and answered on read with standards'
   in-force answer for the read's date, never a stored one. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MEMBER, portionUnknown } from "./fixture.mjs";
import { noSuchStandard } from "../../../src/standards/index.mjs";

const STD = "STD-2026-0001";
const stages = [{ key: "need", cardinality: "1", required: "always" }, { key: "award", after: "need", cardinality: "1", required: "always" }];
const D = (w, basis, extra = {}) =>
  w.p.defineProgression({ progressionKey: "proc", label: "Procurement", stages, declaredBy: "member:alice", basis, viewer: MEMBER, ...extra });

test("R39: a basis may name a held standard, {standard, portion?}; NO_SUCH_STANDARD and PORTION_UNKNOWN are standards' one answers; each writes nothing", () => {
  const w = world();
  w.std.held.set(STD, { portion: "sec 2.1", inForce: { state: "in_force", why: "its period covers the date" } });
  const before = w.snapshot();
  assert.deepEqual(D(w, { statement: "the code requires it", standard: "STD-2026-0099" }), noSuchStandard("STD-2026-0099"));
  // standards' own answer, field for field, with the portion it holds added (K1563 (10))
  assert.deepEqual(D(w, { statement: "the code requires it", standard: STD, portion: "sec 9" }),
                   portionUnknown(STD, "sec 9", { portion_held: "sec 2.1" }));
  // the member's statement is still required (R2): a standard alone is no basis statement
  assert.equal(D(w, { standard: STD }).code, "NO_BASIS");
  // the stage checks are heard first
  assert.equal(w.p.defineProgression({ progressionKey: "proc", label: "P", stages: [{ key: "a", cardinality: "1", required: "x" }],
                                       basis: { statement: "s", standard: "STD-2026-0099" } }).code, "BAD_REQUIRED");
  assert.deepEqual(w.snapshot(), before);
  // negative controls: the standard whole, and by the portion it holds
  const ok = D(w, { statement: "the code requires it", standard: STD });
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.basis.standard, { standard: STD, portion: null });
  const rev = D(w, { statement: "narrowed to its section", standard: STD, portion: "sec 2.1" },
                { stages: [stages[0], { ...stages[1], within: "30 days" }], citation: "Ord. 3" });
  assert.equal(rev.version, 2);
  assert.deepEqual(rev.basis.standard, { standard: STD, portion: "sec 2.1" });
  assert.deepEqual(w.rows(`SELECT version, basis_standard, basis_portion FROM progression_def_versions ORDER BY version`),
                   [{ version: 1, basis_standard: STD, basis_portion: null }, { version: 2, basis_standard: STD, basis_portion: "sec 2.1" }]);
  // a plain string basis still names none
  assert.equal(w.p.defineProgression({ progressionKey: "other", label: "O", stages, basis: "b" }).basis.standard, null);
});

test("R39 R5: the read answers the standard with standards.inForceAt on the read's date, its state and why, asked on every read and never stored", () => {
  const w = world();
  w.std.held.set(STD, { portion: null, inForce: { state: "in_force", why: "its period covers the date" } });
  D(w, { statement: "the code requires it", standard: STD });
  w.clock.now = "2026-09-10T12:00:00.000Z";
  const r = w.p.readProgression({ progressionKey: "proc", viewer: MEMBER });
  assert.deepEqual(r.basis.standard, { standard: STD, portion: null,
    in_force: { date: "2026-09-10T12:00:00Z", state: "in_force", why: "its period covers the date" } });
  assert.deepEqual(w.std.asked.at(-1), { standard: STD, portion: null, date: "2026-09-10T12:00:00Z", viewer: MEMBER });
  // the answer follows standards on the next read (a repeal held since), nothing of it is stored
  w.std.held.get(STD).inForce = { state: "not_in_force", why: "repealed on 2026-09-05" };
  assert.deepEqual(w.p.readProgression({ progressionKey: "proc", viewer: MEMBER }).basis.standard.in_force.state, "not_in_force");
  const cols = w.rows(`PRAGMA table_info(progression_def_versions)`).map((c) => c.name);
  assert.ok(!cols.some((c) => /force/.test(c)));
  // a version that names no standard reads with none; a standards failure reads undetermined, never in force
  assert.equal(w.p.readProgression({ progressionKey: "proc", version: 1 }).basis.standard.standard, STD);
  w.std.provider.inForceAt = () => { throw new Error("down"); };
  const u = w.p.readProgression({ progressionKey: "proc", viewer: MEMBER }).basis.standard.in_force;
  assert.equal(u.state, "undetermined");
  assert.match(u.why, /down/);
});
