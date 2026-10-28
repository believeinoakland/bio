/* proto-mem/1f: merges several run-l1-plane.mjs result files into one (concatenating `results`, keeping the commands of each). node merge-results.mjs OUT IN1 IN2 ... */
import { readFileSync, writeFileSync } from "node:fs";
const [out, ...ins] = process.argv.slice(2); const ds = ins.map((f) => JSON.parse(readFileSync(f, "utf8")));
writeFileSync(out, JSON.stringify({ ...ds[0], command: ds.map((d) => d.command).join("  ;  "), results: ds.flatMap((d) => d.results) }, null, 1));
