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

test("R43 (rule 1, K786): the catalogue file and legacy-checks' tests are gone, CHECK_FAMILIES has no catalogue source, and no product module's file or module test imports `checks/bio-checks.mjs` — text-chain's parity test alone excepted, accepted red by name until its T20 job (N446) (negative control: the scan finds an import written in either quote form)", async () => {
  const { existsSync, readdirSync, statSync } = await import("node:fs");
  const { join, dirname } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
  assert.equal(existsSync(join(REPO, "bio-plane/checks/bio-checks.mjs")), false);
  assert.equal(existsSync(join(REPO, "bio-plane/test/m/legacy-checks")), false);
  assert.equal(M.CHECK_FAMILY_FILES.some(([p]) => /bio-checks/.test(p)), false);
  const IMPORT = /(?:from\s*|import\s*\(\s*|import\s+)["'][^"']*bio-checks(?:\.mjs)?["']/;
  const ACCEPTED = new Set(["bio-plane/test/m/text-chain/extent.test.mjs"]);   /* N446, K786 */
  const MODULES = JSON.parse(readFileSync(join(REPO, "build/modules.json"), "utf8")).modules.filter((m) => !m.legacy);
  const found = [];
  const walk = (p) => {
    const abs = join(REPO, p);
    if (!existsSync(abs)) return;
    if (statSync(abs).isDirectory()) { for (const f of readdirSync(abs)) if (!["node_modules", "dist"].includes(f)) walk(join(p, f)); }
    else if (/\.(mjs|js)$/.test(p) && IMPORT.test(readFileSync(abs, "utf8"))) found.push(p);
  };
  for (const m of MODULES) for (const p of [...(m.paths || []), ...(m.tests || [])]) walk(p);
  assert.deepEqual(found.filter((p) => !ACCEPTED.has(p)), []);
  /* negative control: the pattern sees both quote forms and a dynamic import */
  const NAME = ["bio", "checks"].join("-");   /* assembled, so this file is not itself an importer */
  for (const t of [`import * as c from "../../checks/${NAME}.mjs";`, `import { a } from '../checks/${NAME}.mjs'`, `await import("../checks/${NAME}.mjs")`])
    assert.ok(IMPORT.test(t), t);
  assert.equal(IMPORT.test("/* moved from `checks/bio-checks.mjs` */"), false);
});
