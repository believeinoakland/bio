/* basis-versions at the factory: `basisVersionsOf` registers the version grammar (`basis-version-grammar`'s
   `registerBasisVersionGrammar`, its R6) through record-core's grammar seam once at start, as `basis-versions`, after
   inquiry-grammar's. The grammar's own registration tests are that module's (`test/m/basis-version-grammar/`). */
import test from "node:test";
import assert from "node:assert/strict";
import { registerBasisVersionGrammar, basisVersionsOf } from "../../../src/basis-versions/index.mjs";
import { world } from "./fixture.mjs";

const slots = (record) => record.grammars().map((g) => [g.module, [...g.ids]]);

test("R6: the module's factory registers the version grammar once at start, as `basis-versions`, after inquiry-grammar's", () => {
  const w = world();
  assert.deepEqual(slots(w.record).find(([, ids]) => ids.includes("C-2.8")), ["inquiry-grammar", ["C-2.8"]]);
  assert.equal(basisVersionsOf(w.host) === w.bv, true);
  assert.equal(registerBasisVersionGrammar(w.record), null, "already registered by the factory");
});
