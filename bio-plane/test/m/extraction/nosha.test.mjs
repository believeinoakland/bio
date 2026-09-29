/* extraction: the one `NO_SHA` answer (R63, N285), at the module's interface: `noSha` itself, its row, and this
   module's R27 answering through it. Each test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh } from "./fixture.mjs";
import { noSha, NO_SHA_DETAIL, EXTRACTION_CHECKS, REEXTRACT_CHECKS, extractionOps } from "../../../src/extraction/index.mjs";

const TRANSLATION = "This read is about one captured document, named by its fingerprint, and none was named.";
const KEYS = ["check", "code", "detail", "ok", "reason", "translation"];

test("R63: noSha answers {ok: false, reason: NO_SHA, code, check, translation, detail}: exactly those keys, its own row's check and translation, the caller's sentence as detail", () => {
  const a = noSha("progression membership is read for a captured document");
  assert.deepEqual(Object.keys(a).sort(), KEYS);
  assert.deepEqual(a, { ok: false, reason: "NO_SHA", code: "NO_SHA", check: "C-51.6", translation: TRANSLATION,
                        detail: "progression membership is read for a captured document" });
});

test("R63: with no sentence (absent, null, not a string, empty or blank) the detail is the one fixed default; it never throws", () => {
  assert.equal(typeof NO_SHA_DETAIL, "string");
  assert.ok(NO_SHA_DETAIL.trim().length > 0);
  const hostile = { toString() { throw new Error("no"); } };
  for (const d of [undefined, null, "", "   ", 7, {}, [], hostile, Symbol("s"), () => "x"]) {
    let a;
    assert.doesNotThrow(() => { a = noSha(d); }, String(typeof d));
    assert.deepEqual(a, { ok: false, reason: "NO_SHA", code: "NO_SHA", check: "C-51.6", translation: TRANSLATION, detail: NO_SHA_DETAIL });
  }
  assert.deepEqual(noSha(), noSha(null));
  assert.notEqual(noSha(), noSha(), "a fresh answer each call, so no caller can alter another's");
});

test("R63: its one row is this module's: C-51.6, carrying C-100.19's translation, its `where` naming noSha, kept apart from the re-read's family", () => {
  assert.deepEqual(Object.keys(EXTRACTION_CHECKS), ["NO_SHA"]);
  const row = EXTRACTION_CHECKS.NO_SHA;
  assert.deepEqual([row.check, row.translation], ["C-51.6", TRANSLATION]);
  assert.match(row.where, /^src\/extraction\/checks\.mjs noSha > is-capture-named$/);
  assert.equal(Object.isFrozen(EXTRACTION_CHECKS) && Object.isFrozen(row), true, "no caller can change the row");
  assert.equal("NO_SHA" in REEXTRACT_CHECKS, false);
  assert.ok(!Object.values(REEXTRACT_CHECKS).some((r) => r.check === row.check), "no other row of this module holds its number");
});

test("R63 R27: a reading request naming no capture digest (absent, not a string, empty) answers through noSha, with R27's sentence, and writes nothing", () => {
  const w = fresh();
  const tables = () => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
    .map(({ name }) => [name, w.rows(`SELECT count(*) n FROM "${name}"`)[0].n]));
  const before = tables();
  for (const s of [undefined, null, "", 7, {}, ["a"]]) {
    const a = w.x.readingFor(s, "class:admin");
    assert.deepEqual(a, noSha("a reading is read by its capture sha256"), JSON.stringify(s));
  }
  /* through the Durable Object's route: op=reading with no sha256 */
  const r = extractionOps(w.x, new URL("http://x/reading?viewer=class:admin"), null, {}).reading();
  assert.deepEqual(r, noSha("a reading is read by its capture sha256"));
  assert.equal(tables(), before, "nothing is written");
});
