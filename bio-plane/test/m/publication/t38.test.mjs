/* publication — T38 (T38-29): C-122.6 `PHOTO_MARKS_CHANGED_SINCE` takes `words.json`'s `photo.refused.changed`,
   verbatim (R33; DEC-183 (4), K2291), and the commit answers it with that translation (R57). The words file is read
   here by key, so a re-wording there is a red here until the row follows it. Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { planeWorld as world, infoMd } from "./fixture.mjs";
import { rowOf, CASE_SOURCES_CHECKS } from "../../../src/publication/checks.mjs";
import { caseCarriageOf } from "../../../src/case-carriage/index.mjs";

const WORDS = new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url);
const word = (key) => {
  const list = JSON.parse(readFileSync(WORDS, "utf8"));
  const hits = (Array.isArray(list) ? list : list.words || []).filter((w) => w && w.key === key);
  assert.equal(hits.length, 1, `${key} is one word in words.json`);
  return hits[0];
};

test("R33 (T38) C-122.6 PHOTO_MARKS_CHANGED_SINCE's translation is words.json's photo.refused.changed, verbatim and protected, held once in the C-122 family", () => {
  const w = word("photo.refused.changed");
  assert.equal(w.protected, true);
  assert.equal(w.note, "PHOTO_MARKS_CHANGED_SINCE");
  assert.deepEqual(rowOf("PHOTO_MARKS_CHANGED_SINCE"), { code: "PHOTO_MARKS_CHANGED_SINCE", check: "C-122.6", translation: w.en });
  assert.equal(w.en, "A mark changed after this case was prepared. Prepare it again before signing.");
  assert.equal(Object.values(CASE_SOURCES_CHECKS).filter((x) => x.check === "C-122.6").length, 1, "held once");
});

test("R57 (T38) R33 every row case-carriage answers lapsed (a mark withdrawn since preparation, a photo carried whole, marks that cannot be read) refuses the commit with words.json's photo.refused.changed, naming each, and nothing is committed", () => {
  const en = word("photo.refused.changed").en;
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  const p = w.promote("INFO-2026-0101-first", infoMd("INFO-2026-0101-first"), "information");
  assert.equal(p.ok, true, JSON.stringify(p));
  const roles = [{ target: "INFO-2026-0101-first", version_sha: p.bundleSha }];
  const roster = roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha }));
  const cc = caseCarriageOf(w.host);
  const sha = "ab".repeat(32);
  const lapses = [
    [{ ref: "INFO-2026-0020-photo", sha, why: "a mark was withdrawn since the case was prepared" }],
    [{ ref: "INFO-2026-0020-photo", sha, why: "a photo carried whole" }],
    null,
  ];
  w.prepare("CASE-2026-0001", 1, { project: proj, roles });
  const before = w.snapshot();
  for (const answer of lapses) {
    cc.marksLapsed = () => answer;
    const r = w.signCase("CASE-2026-0001", 1, { project: proj, roster });
    assert.equal(r.ok, false);
    assert.deepEqual({ reason: r.reason, code: r.code, check: r.check, translation: r.translation },
                     { reason: "PHOTO_MARKS_CHANGED_SINCE", code: "PHOTO_MARKS_CHANGED_SINCE", check: "C-122.6", translation: en });
    assert.deepEqual(r.photos, answer ?? [{ ref: null, sha: null, why: "the photos' marks could not be read" }]);
    assert.deepEqual(w.snapshot(), before, "nothing is committed");
  }
  cc.marksLapsed = () => [];
  assert.equal(w.signCase("CASE-2026-0001", 1, { project: proj, roster }).ok, true, "none lapsed commits");
});
