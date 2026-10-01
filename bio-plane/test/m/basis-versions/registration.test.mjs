/* basis-versions R43 at the module's interface: the version grammar registered through record-core's grammar seam
   (its R67) into record-grammar R28's C-2.8 slot after inquiry-grammar's, run at the sub-slot inquiry-grammar R6 offers.
   The corpus and its golden findings are inquiry-grammar's (`test/m/inquiry-grammar/corpus.mjs`, `golden.json`),
   recorded from the check catalogue's `checkBundle` before either module moved its grammar: for every bundle the whole
   finding list, and the version findings the catalogue's `checkInquiryBasis` added by calling `basisVersionFindings`.
   A fresh record per test. */
import test from "node:test";
import assert from "node:assert/strict";
import { recordOf } from "../../../src/record-core/index.mjs";
import { registerBasisVersionGrammar, BASIS_VERSION_GRAMMAR, basisVersionFindings, basisVersionsOf }
  from "../../../src/basis-versions/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import { BUNDLE_CASES, REGISTRY_VARIANTS, bundleFiles } from "../inquiry-grammar/corpus.mjs";
import { GOLDEN, judge } from "../inquiry-grammar/fixture.mjs";
import { world } from "./fixture.mjs";

const VARIANTS = Object.keys(REGISTRY_VARIANTS);
const fresh = () => recordOf({});
const slots = (record) => record.grammars().map((g) => [g.module, [...g.ids]]);

test("R43: one registration, `basis-versions`, claiming the C-2.8 slot whole after inquiry-grammar's, answered {ok: true}; reaching it again registers nothing more; a record with no seam is left alone", () => {
  assert.deepEqual([...BASIS_VERSION_GRAMMAR.ids], ["C-2.8"]);
  assert.ok(Object.isFrozen(BASIS_VERSION_GRAMMAR));
  const record = fresh();
  assert.deepEqual(registerBasisVersionGrammar(record), { ok: true, module: "basis-versions", ids: ["C-2.8"] });
  assert.equal(registerBasisVersionGrammar(record), null, "a second start registers nothing");
  assert.deepEqual(slots(record), [["inquiry-grammar", ["C-6.1"]], ["inquiry-grammar", ["C-15.1"]], ["inquiry-grammar", ["C-2.8"]]],
    "inquiry-grammar registered first, so the C-2.8 slot is its, with this module's grammar a later claimant");
  assert.equal(registerBasisVersionGrammar({}), null);
  assert.equal(registerBasisVersionGrammar(null), null);
});

test("R43: the module's factory registers the grammar once at start", () => {
  const w = world();
  assert.deepEqual(slots(w.record).find(([, ids]) => ids.includes("C-2.8")), ["inquiry-grammar", ["C-2.8"]]);
  assert.equal(basisVersionsOf(w.host) === w.bv, true);
  assert.equal(registerBasisVersionGrammar(w.record), null, "already registered by the factory");
});

test("R43: a refusal is a defect of the wiring and throws, naming record-core's reason and the holder", () => {
  const record = fresh();
  assert.equal(record.registerGrammar("basis-versions", { ids: ["C-25.1"], arm: () => {} }).ok, true);
  assert.throws(() => registerBasisVersionGrammar(record), /basis-versions: record-core refused the version grammar: GRAMMAR_DECLARED/);
});

test("R43: for every bundle of the corpus under every registry variant, checkBundle given record.grammars() answers the catalogue's findings before the move, identical in content and in order; each version finding is the one the catalogue's call added", async () => {
  const record = fresh();
  registerBasisVersionGrammar(record);
  let versions = 0, bundles = 0, direct = 0;
  for (const id of Object.keys(BUNDLE_CASES)) {
    const want = GOLDEN.bundles[id].versions;
    const md = bundleFiles(id).get("bundle.md");
    const fm = parseFrontmatter(typeof md === "string" ? md : new TextDecoder().decode(md)).data;
    for (const v of VARIANTS) {
      const got = await judge(id, v, record.grammars());
      assert.deepEqual(got, GOLDEN.bundles[id][v], `${id} (${v})`);
      for (const x of want) assert.ok(got.some((y) => JSON.stringify(y) === JSON.stringify(x)), `${id}: ${x.message}`);
      bundles++;
    }
    if (fm && /^(inquiry|problem|focus)$/.test(String(fm.object_type))) {
      const own = []; basisVersionFindings(fm, own);
      assert.deepEqual(JSON.parse(JSON.stringify(own)), want, `${id}: basisVersionFindings alone`);
      direct++;
    }
    versions += want.length;
  }
  assert.ok(versions > 0 && bundles > 0 && direct > 0, "the corpus carries version findings, so their place is tested");
  /* negative control: with inquiry-grammar alone, a bundle carrying a version block loses its version findings */
  const alone = fresh();
  (await import("../../../src/inquiry-grammar/index.mjs")).registerInquiryGrammar(alone);
  const id = Object.keys(BUNDLE_CASES).find((x) => GOLDEN.bundles[x].versions.length > 0);
  assert.notDeepEqual(await judge(id, "both", alone.grammars()), GOLDEN.bundles[id].both, `${id} without R43`);
});

test("R43: the version findings run at the sub-slot — after the entry, division and subject-entity findings, before the grounds and leg findings — and for any other type add nothing", () => {
  const findings = [];
  const fm = { object_type: "inquiry", basis_versions: [{ name: "", relationship: "xor" }] };
  BASIS_VERSION_GRAMMAR.arm({ fm }, findings);
  const direct = []; basisVersionFindings(fm, direct);
  assert.deepEqual(findings, direct, "for an inquiry, exactly basisVersionFindings' findings");
  assert.ok(findings.length > 0);
  for (const t of ["information", "project", "action", undefined]) {
    const f = [];
    BASIS_VERSION_GRAMMAR.arm({ fm: { ...fm, object_type: t } }, f);
    assert.deepEqual(f, [], `type ${t}: nothing`);
  }
  const legacy = []; BASIS_VERSION_GRAMMAR.arm({ fm: { ...fm, object_type: "problem" } }, legacy);
  assert.deepEqual(legacy, direct, "a legacy spelling of an inquiry is an inquiry");
});
