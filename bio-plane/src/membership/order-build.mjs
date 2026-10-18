/* membership's generator for R146: `build/modules.json` as it stands in the product tree becomes
   `bio-plane/src/membership/order.mjs`, the ids in the file's order. Run from the repository root:
     node bio-plane/src/membership/order-build.mjs            write order.mjs
     node bio-plane/src/membership/order-build.mjs --check    exit 1, naming the first difference, when order.mjs is stale
   `--modules <file>` and `--out <file>` name other paths (the tests' fixtures). Never imported by the module, so never
   bundled (a plane bundled for the Worker cannot read the file at run time, R146). */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { localize } from "../setup-words/index.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
export const MODULES_PATH = join(ROOT, "build/modules.json");
export const ORDER_PATH = join(ROOT, "bio-plane/src/membership/order.mjs");

/* The ids of a parsed copy of the file, in the file's order; the file's own mistakes are named, never written out. */
export function idsOf(file) {
  const list = Array.isArray(file) ? file : file?.modules;
  if (!Array.isArray(list)) throw new Error("membership order build: the file holds no modules list");
  const seen = new Set();
  return list.map((m) => {
    if (typeof m?.id !== "string" || !m.id) throw new Error("membership order build: a module without an id");
    if (seen.has(m.id)) throw new Error(`membership order build: module ${m.id} is not distinct`);
    seen.add(m.id);
    return m.id;
  });
}

/* The text of order.mjs for the file's bytes. */
export function render(bytes) {
  const ids = idsOf(JSON.parse(bytes.toString("utf8")));
  const body = ids.map((id) => `  ${JSON.stringify(id)},`).join("\n");
  return `/* GENERATED: do not edit by hand. membership R146 (N1115, N1171; K657, K3268): the ids of build/modules.json (${ids.length}
   modules) in the order the file holds them. Written by \`node bio-plane/src/membership/order-build.mjs\` from the
   repository root (\`--check\` finds it stale); bio-plane/test/m/membership/module-order.test.mjs holds it equal to the file. */
export const MODULE_IDS = Object.freeze([
${body}
]);
`;
}

/* The first difference between the file on disk and what the generator writes, or null. */
export function firstDifference(have, want) {
  if (have === want) return null;
  const a = have.split("\n"), b = want.split("\n");
  for (let i = 0; i < Math.max(a.length, b.length); i++)
    if (a[i] !== b[i]) return localize("membership.order-build.line_v1_have_stringify_the", "line {v1}: have {stringify}, the file gives {stringify_2}", { v1: String(i + 1), stringify: String(JSON.stringify(a[i] ?? null)), stringify_2: String(JSON.stringify(b[i] ?? null)) });
  return "differs";
}

function main(argv) {
  const opt = (name, dflt) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : dflt; };
  const bytes = readFileSync(opt("--modules", MODULES_PATH));
  const out = opt("--out", ORDER_PATH);
  const want = render(bytes);
  if (argv.includes("--check")) {
    let have = null;
    try { have = readFileSync(out, "utf8"); } catch { /* absent */ }
    const d = have === null ? "the generated list is absent" : firstDifference(have, want);
    if (d) { process.stderr.write(localize("membership.order-build.membership_out_is_stale_d", "membership: {out} is stale: {d}\n", { out: String(out), d: String(d) })); return 1; }
    process.stdout.write("membership: order.mjs matches modules.json\n");
    return 0;
  }
  writeFileSync(out, want);
  process.stdout.write(`membership: wrote ${out}\n`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
