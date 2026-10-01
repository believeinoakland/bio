/* inquiry-grammar's test helpers: the golden findings (`golden.json`, recorded from the check catalogue before the move,
   see `corpus.mjs`), a bundle judged by record-grammar's `checkBundle` with a given grammar list, and a fresh record
   whose grammar seam (record-core R67) the registration tests drive. No network, no clock read by the module. */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { checkBundle } from "../../../src/record-grammar/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { bundleFiles, REGISTRY_VARIANTS } from "./corpus.mjs";

export const GOLDEN = JSON.parse(readFileSync(new URL("./golden.json", import.meta.url), "utf8"));
export const NOW = Date.parse("2026-07-02T00:00:00Z");
const sha256 = async (b) => createHash("sha256").update(typeof b === "string" ? Buffer.from(b) : Buffer.from(b)).digest("hex");

/** The findings `fn(findings)` pushes, and what it answers. */
export function run(fn) {
  const findings = [];
  const answer = fn(findings);
  return { findings, answer };
}
/** JSON's view of a finding list, so a comparison with the golden file sees exactly what it holds. */
export const plain = (v) => JSON.parse(JSON.stringify(v));

/** A bundle case judged by record-grammar's `checkBundle` under a registry variant, with `grammars`. */
export async function judge(id, variant, grammars) {
  const [publishedRegistry, earnedRegistry] = REGISTRY_VARIANTS[variant];
  const input = { folderName: id, files: bundleFiles(id), sha256, nowMs: NOW, publishedRegistry, earnedRegistry };
  return plain((await checkBundle(input, { grammars })).findings);
}

/** A fresh record (record-core), with no storage behind it: the grammar seam keeps its registrations in memory. */
export const freshRecord = () => recordOf({});

/** A stand-in for `basis-versions`' grammar (its R43): registered into the C-2.8 slot after this module's, it pushes
 *  the version findings the catalogue's `basisVersionFindings` pushed for that bundle (`golden.json`), so the whole
 *  list can be compared with the catalogue's in content and order. `seen` records each call's `object_type`. */
export function versionStandIn(record, seen = []) {
  return record.registerGrammar("basis-versions", { ids: ["C-2.8"], arm: (ctx, findings) => {
    seen.push(ctx.fm ? ctx.fm.object_type : null);
    for (const x of GOLDEN.bundles[ctx.folderName].versions) findings.push(x);
  } });
}
