/* consequences R1 (T45; l9a doubt 8; conformance R33): no new part, nor a revision, on a void determination, answered
   through conformance's one site `determinationVoided`, writing nothing; the parts already recorded stand and are read
   as before. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { determinationVoided, determinationSuperseded } from "../../../src/conformance/index.mjs";

const S = "STD-2026-0001-law";
const CAUSES = [{ finding: "INQ-2026-0001-held", cause: "check_voided", at: "2026-09-27" }];

test("R1 (T45): a void determination refuses a new part and a revision through conformance.determinationVoided; held parts stand; control", () => {
  const w = world();
  const D = w.determination("CONF-2026-0001-act", w.P, { [S]: "noncompliant" });
  const base = { determination: D, standard: S, affected: { kind: "fund", description: "the parks fund" },
    measure: { unit: "money", value: 5000 }, period: { from: "2026-01-01", to: "2026-06-30" }, basis: { rationale: "r" },
    author: V("alice") };
  const held = w.c.consequenceRecord(base);
  assert.equal(held.ok, true, JSON.stringify(held));
  w.c.addressedRecord({ id: held.id, state: "not_addressed", reason: "not yet", author: V("alice") });
  const read = () => [w.c.consequenceRead({ id: held.id, viewer: V("alice") }), w.c.consequencesOf({ determination: D, viewer: V("alice") }),
                      w.c.addressed({ determination: D, viewer: V("alice") })];
  const beforeVoid = read();
  w.determinations.get(D).void = CAUSES;
  const before = w.snapshot();
  /* After DETERMINATION_SUPERSEDED, ahead of CONSEQUENCE_NOT_NONCOMPLIANT (a void determination's outcomes read
     undetermined) and every shape refusal. */
  for (const over of [{}, { measure: { unit: "joy" } }, { standard: "STD-2026-0099-x" }])
    assert.deepEqual(w.c.consequenceRecord({ ...base, ...over }), determinationVoided(D, CAUSES), JSON.stringify(over));
  assert.deepEqual(w.c.consequenceRevise({ id: held.id, reason: "recounted", measure: { unit: "money", value: 1 }, author: V("alice") }),
                   determinationVoided(D, CAUSES));
  assert.deepEqual(w.snapshot(), before, "nothing is written");
  assert.deepEqual(read(), beforeVoid, "the parts already recorded stand and are read as before");
  /* Superseded wins over void (R1's order); an absent determination is conformance's one answer still. */
  w.determinations.get(D).superseded_by = "CONF-2026-0009-new";
  assert.deepEqual(w.c.consequenceRecord(base), determinationSuperseded(D, "CONF-2026-0009-new"));
  /* Control: the same part on a determination not void lands. */
  const L = w.determination("CONF-2026-0002-live", w.P, { [S]: "noncompliant" });
  assert.equal(w.c.consequenceRecord({ ...base, determination: L }).ok, true);
});
