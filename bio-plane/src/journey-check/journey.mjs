/* journey-check R1: `npm run journey` (the local arm), or `npm run journey -- --live <address>` (the live arm, with its
   credentials in the environment). Prints the report, whose every value is redacted, and exits 1 on any failure. The
   screenshots and the report are written to `out/<arm>/`, generated and never committed. */
import { runLocal, runLive } from "./run.mjs";

const args = process.argv.slice(2);
const at = args.indexOf("--live");
const r = at >= 0 ? await runLive({ base: args[at + 1] }) : await runLocal();
process.stdout.write(r.report);
process.exit(r.ok ? 0 : 1);
