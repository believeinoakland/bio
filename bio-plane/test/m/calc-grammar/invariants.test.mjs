/* calc-grammar's invariants (R18, R19): no eval and no user code; pure and exact. The battery runs in a child process
   where code generation from strings is disallowed, every module load after start-up is recorded, and the clock,
   randomness and the network throw; its answers must equal an ordinary run's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as c from "../../../src/calc-grammar/index.mjs";
import { battery } from "./fixtures/battery.mjs";

const locked = () => JSON.parse(execFileSync(process.execPath, ["--disallow-code-generation-from-strings",
  fileURLToPath(new URL("./fixtures/locked.mjs", import.meta.url))], { encoding: "utf8" }));

test("R18 no eval, no Function, no dynamic import: every service answers with code generation disallowed and no module loaded after start-up; a recipe is data only", () => {
  const { answers, late, evalBlocked } = locked();
  assert.equal(evalBlocked, true, "the child really disallows code generation");
  assert.deepEqual(late, [], "no module was imported while the services ran");
  assert.deepEqual(answers, JSON.parse(JSON.stringify(battery(c))));
  assert.equal(answers.check.ok, false);
  const code = { method: c.METHOD, inputs: [{ name: "t", kind: "table" }], steps: [{ op: "select", as: "s", from: "t", where: [{ field: "a", test: "eq", value: "x" }], expr: "process.exit(1)" }], output: "s" };
  assert.equal(c.evaluate(code, { t: { fields: [], rows: [] } }).refused, "RECIPE_INVALID");
});

test("R19 pure: no clock, no randomness and no network are read (they throw in the locked run), and the answers are the same; exact decimals throughout", () => {
  const { answers } = locked();
  assert.deepEqual(answers.arith.map((f) => f.value), ["0.3", "2", "2.25", "0.66667", "2"]);
  assert.deepEqual(answers.z.result, { value: "0.90", sign: "-", precision: "exact" });
  assert.equal(answers.c.result.value, "2");
  assert.deepEqual(answers, JSON.parse(JSON.stringify(battery(c))));
});
