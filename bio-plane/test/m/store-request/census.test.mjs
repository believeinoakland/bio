/* store-request R21, R22: what the module imports, and the split's second half. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const SRC = join(ROOT, "bio-plane/src/store-request");
const MODULES = JSON.parse(readFileSync(join(ROOT, "build/modules.json"), "utf8")).modules;
const order = MODULES.map((m) => m.id);
const ownerOf = (file) => {
  const rel = relative(ROOT, file);
  const hit = MODULES.filter((m) => m.paths.some((p) => (p.endsWith("/") ? rel.startsWith(p) : rel === p)));
  return hit.length === 1 ? hit[0].id : null;
};
const importsOf = (text) => [...text.matchAll(/(?:^|\n)\s*(?:import|export)[^"'`;]*?from\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1] ?? m[2]);
const census = (files) => {
  const out = [];
  for (const f of files) for (const spec of importsOf(readFileSync(f, "utf8"))) {
    if (!spec.startsWith(".")) { out.push({ file: f, spec, module: spec.startsWith("node:") ? "node" : `platform:${spec}` }); continue; }
    const target = resolve(dirname(f), spec);
    if (target.startsWith(SRC)) continue;
    out.push({ file: f, spec, module: ownerOf(target) });
  }
  return out;
};

test("R21: store-request imports only modules earlier than itself in build/modules.json, and no module of the platform", () => {
  const files = readdirSync(SRC).filter((f) => f.endsWith(".mjs")).map((f) => join(SRC, f));
  assert.ok(files.length >= 1);
  const me = order.indexOf("store-request");
  assert.ok(me > order.indexOf("store-assembly"));
  const found = census(files);
  assert.ok(found.length >= 4);
  for (const { spec, module } of found) {
    assert.ok(module && !module.startsWith("platform:") && module !== "node", `${spec}: ${module}`);
    assert.ok(order.indexOf(module) < me, `${spec} is ${module}, not earlier than store-request`);
  }
  assert.deepEqual([...new Set(found.map((x) => x.module))].sort(), ["admission", "op-declarations", "record-grammar", "subresources"]);
});

test("R21 (control): an import of a later module or of the platform is named by the census", () => {
  const probe = join(SRC, "index.mjs");
  const later = importsOf('import { makeFetch } from "../control-plane/index.mjs";\nimport { DurableObject } from "cloudflare:workers";');
  const named = later.map((spec) => (spec.startsWith(".") ? ownerOf(resolve(dirname(probe), spec)) : `platform:${spec}`));
  assert.deepEqual(named, ["control-plane", "platform:cloudflare:workers"]);
  assert.ok(order.indexOf("control-plane") > order.indexOf("store-request"));
});

/* R22 is met by control-plane's Wave B job (K624, K5146 (1)): control-plane calls innerRequest for every store request and deletes
   its own copy of the rules; this job leaves control-plane untouched. */
test.todo("R22: control-plane/index.mjs holds none of the rules of R2 to R13 and R23 and calls innerRequest for every store request (control-plane's Wave B job)");
