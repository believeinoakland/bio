/* journey-check R1: `npm run journey` (the local arm), or `npm run journey -- --live <address>` (the live arm, with its
   credentials in the environment); `--out <directory>` writes elsewhere than `out/<arm>/`. Prints the report, whose
   every value is redacted, and exits 1 on any failure. The screenshots and the report are generated, never committed.
   R4: the walk runs only when this file is the process's entry; importing it starts nothing. */
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { runLocal, runLive } from "./run.mjs";

/* The walk `args` (the command line after the script) asks for: answers `{ ok, report }`. */
export async function main(args) {
  const opt = (name) => { const at = args.indexOf(name); return at >= 0 ? args[at + 1] : undefined; };
  const out = opt("--out");
  return args.includes("--live")
    ? runLive({ base: opt("--live"), ...(out ? { out } : {}) })
    : runLocal(out ? { out } : {});
}

/* Whether `entry` (the process's `argv[1]`) is this file, through any link. */
export function isEntry(entry, self = fileURLToPath(import.meta.url)) {
  if (!entry) return false;
  try { return realpathSync(entry) === realpathSync(self); } catch { return false; }
}

if (isEntry(process.argv[1])) {
  const r = await main(process.argv.slice(2));
  process.stdout.write(r.report);
  process.exit(r.ok ? 0 : 1);
}
