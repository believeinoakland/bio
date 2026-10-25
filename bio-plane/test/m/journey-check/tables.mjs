/* journey-check, the walker's own model of a served plane (K3100, K5062): journey-check imports no module, so the answers its tests
   and its fake plane serve are its own tables (`// fixtures-own: harness`). What keeps a table the plane's and not an invention is
   this file: every op a table answers is an op the product declares, and every code a table gives is a code the product gives.
   Both are read as DATA from the product's source files (`op-declarations`, and any module that states the code), never
   imported. */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";

const SRC = join(import.meta.dirname, "..", "..", "..", "src");
const read = (f) => readFileSync(f, "utf8");

/* the declared ops: every key of the tables `op-declarations` holds, as its files write them (`op: {…}` or `op: "ground"`) */
let declared = null;
export function declaredOps() {
  if (declared) return declared;
  const dir = join(SRC, "op-declarations");
  const text = readdirSync(dir).filter((f) => f.endsWith(".mjs")).map((f) => read(join(dir, f))).join("\n");
  declared = (op) => new RegExp(`(?:^|[^A-Za-z0-9_])["']?${op}["']?\\s*:`, "m").test(text);
  return declared;
}

/* every product source file (not a test, not journey-check, not the generated word rows): the places a code is given */
let sources = null;
function productText() {
  if (sources) return sources;
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      if (e === "node_modules" || e === "journey-check" || e === "out") continue;
      const p = join(d, e);
      if (statSync(p).isDirectory()) walk(p);
      else if (e.endsWith(".mjs") && !/^rows(\.pseudo)?\.mjs$/.test(e) && !/words-unreviewed/.test(e)) out.push(read(p));
    }
  };
  walk(SRC);
  return (sources = out.join("\n"));
}

/* Every op named in `ops` (a table's keys, or a list) is declared by the plane. */
export function assertDeclared(ops, what = "the table") {
  const list = Array.isArray(ops) ? ops : Object.keys(ops);
  const isDeclared = declaredOps();
  assert.deepEqual(list.filter((op) => !isDeclared(op)), [], `${what} answers an op the plane does not declare`);
}

/* Every code named in `codes` is given by a product file, as a word (a code, a check number). */
export function assertGiven(codes, what = "the table") {
  const text = productText();
  const given = (c) => new RegExp(`(?<![A-Za-z0-9_])${String(c).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9_])`).test(text);
  assert.deepEqual([...codes].filter((c) => !given(c)), [], `${what} gives a code no product file gives`);
}
