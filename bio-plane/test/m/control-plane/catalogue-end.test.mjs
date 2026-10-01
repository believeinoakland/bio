/* control-plane R43 (rule 1, K648): the catalogue's end. Every code this door decorated before R43, read from
   `rows-before-r43.json` (its check, and a digest of its translation, taken with the catalogue still the first source),
   is decorated with the same check and the same words from the modules' own families, and the published machine fences
   (R41) keep every code; a code the snapshot never held is not invented. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { M } from "./harness.mjs";
import { machineFences } from "../../../src/skillpack.mjs";

const SNAP = JSON.parse(readFileSync(new URL("./rows-before-r43.json", import.meta.url), "utf8"));
const digest = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

test("R43, R22: every code decorated before the catalogue's end reads the same check and translation, and every published fence (R41) stays published (negative control: a changed word or a missing code is seen)", () => {
  const codes = Object.keys(SNAP.rows);
  assert.ok(codes.length > 900, String(codes.length));
  for (const code of codes) {
    const got = M.dec49Row(code);
    assert.ok(got, `${code} lost its row`);
    assert.deepEqual([got.check, digest(got.translation)], SNAP.rows[code], code);
  }
  const fences = machineFences(M.CHECK_FAMILIES).map((f) => f.code);
  for (const code of SNAP.fences) assert.ok(fences.includes(code), `fence ${code} is no longer published`);
  /* negative controls: the comparison would see a changed sentence, and a code no source holds has no row */
  const [one] = codes;
  assert.notDeepEqual([M.dec49Row(one).check, digest(M.dec49Row(one).translation + " ")], SNAP.rows[one]);
  assert.equal(M.dec49Row("NO_SUCH_CODE_ANYWHERE"), null);
});
