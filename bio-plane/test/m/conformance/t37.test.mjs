/* T37-36 (N770): every row of this module's table names, in its `where`, the function that holds its region, and that
   region inside it (R28's C-113.34 and C-113.35 named `#comparedActor`; the function is `#comparedAct`). The row's
   `where` is read against the module's source as a surface or an auditor would follow it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CONFORMANCE_CHECKS } from "../../../src/conformance/index.mjs";

const PLANE = join(dirname(fileURLToPath(import.meta.url)), "../../..");

/* The lines of function `fn` in the file `where` names: from its definition (`fn(`, `#fn(`, `async fn(`,
   `function fn(`) to the closing brace at the definition's own indentation; null when the file or function is absent. */
function functionLines(file, fn) {
  const path = join(PLANE, file);
  if (!existsSync(path)) return null;
  const lines = readFileSync(path, "utf8").split("\n");
  const name = fn.replace(/[$#]/g, "\\$&");
  const def = new RegExp(`^(\\s*)(?:export\\s+)?(?:async\\s+)?(?:function\\s+|static\\s+)?${name}\\s*\\(`);
  for (let i = 0; i < lines.length; i++) {
    const m = def.exec(lines[i]);
    if (!m || /^\s*(?:return|if|for|while|const|let)\b/.test(lines[i])) continue;
    const close = lines.findIndex((l, j) => j > i && l.startsWith(`${m[1]}}`));
    return close < 0 ? null : lines.slice(i, close + 1);
  }
  return null;
}

/* What is wrong with a row's `where`, or null when its function holds its region. */
function whereFault(row) {
  const m = /^(\S+) (\S+) > (\S+)$/.exec(row.where ?? "");
  if (!m) return `where ${JSON.stringify(row.where)} is not "<file> <function> > <region>"`;
  const [, file, fn, region] = m;
  const body = functionLines(join(file), fn);
  if (!body) return `${file} defines no function ${fn}`;
  const open = body.findIndex((l) => l.includes(`/* DEC-49 REGION ${region} */`));
  const end = body.findIndex((l) => l.includes(`/* END DEC-49 REGION ${region} */`));
  if (open < 0 || end < open) return `${fn} holds no region ${region}`;
  return null;
}

test("R28 R23: every row of the table names in its where the function that holds its region, and the region inside it: C-113.34 and C-113.35 name #comparedAct; a row naming an absent function or a region its function does not hold is found (the negative controls)", () => {
  const rows = Object.entries(CONFORMANCE_CHECKS);
  assert.ok(rows.length >= 30, `${rows.length} rows`);
  for (const [code, row] of rows) assert.equal(whereFault(row), null, `${code} (${row.check}): ${row.where}`);
  /* R28's two rows, their numbers and translations unchanged */
  assert.deepEqual([CONFORMANCE_CHECKS.ACTOR_IS_A_PERSON.check, CONFORMANCE_CHECKS.ACTOR_IS_A_PERSON.where],
    ["C-113.34", "src/conformance/index.mjs #comparedAct > is-actor-not-a-person"]);
  assert.deepEqual([CONFORMANCE_CHECKS.ACTOR_NOT_AN_OFFICE_OR_ORGANISATION.check, CONFORMANCE_CHECKS.ACTOR_NOT_AN_OFFICE_OR_ORGANISATION.where],
    ["C-113.35", "src/conformance/index.mjs #comparedAct > is-actor-office-or-organisation"]);
  assert.match(CONFORMANCE_CHECKS.ACTOR_IS_A_PERSON.translation, /^An act is compared as the act of an office or an organisation\. /);
  assert.equal(CONFORMANCE_CHECKS.ACTOR_NOT_AN_OFFICE_OR_ORGANISATION.translation, "Name the office or organisation whose act this is. Nothing was written.");
  /* R23: one row per code, no number held twice */
  const numbers = rows.map(([, r]) => r.check);
  assert.equal(new Set(numbers).size, numbers.length);
  /* the negative controls */
  assert.match(whereFault({ where: "src/conformance/index.mjs #comparedActor > is-actor-not-a-person" }), /defines no function #comparedActor/);
  assert.match(whereFault({ where: "src/conformance/index.mjs #comparedAct > is-standard-binding" }), /holds no region is-standard-binding/);
  assert.match(whereFault({ where: "src/conformance/absent.mjs #comparedAct > is-actor-not-a-person" }), /defines no function/);
});
