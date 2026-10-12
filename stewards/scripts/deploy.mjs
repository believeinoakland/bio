/* stewards: the deploy (R2, R21). It reads the Worker's secret names (never their values), refuses on anything that
   would leave the service not yet open or deploy it outside the project's pinned account, and only then runs
   `wrangler deploy`. Usage, from `stewards/`: `npm run deploy` (or `node scripts/deploy.mjs [--config <file>]`). */
import { readFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkOpen, checkAccount } from "../src/config.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const at = args.indexOf("--config");
const config = resolve(at >= 0 ? args[at + 1] : join(here, "..", "wrangler.jsonc"));
const cwd = dirname(config);
const wrangler = process.env.WRANGLER || "wrangler";

const refuse = (lines) => {
  console.error("Refused: nothing was deployed.");
  for (const l of lines) console.error(`  ${l.name} ${l.problem}`);
  process.exit(1);
};

let text;
try { text = readFileSync(config, "utf8"); } catch { refuse([{ name: config, problem: "could not be read" }]); }
const account = checkAccount(text);
if (account) refuse([account]);

let secretNames;
try {
  const out = execFileSync(wrangler, ["secret", "list", "--format", "json", "--config", config], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  secretNames = JSON.parse(out).map((s) => s.name);
} catch {
  refuse([{ name: "secrets", problem: "could not be listed (is wrangler signed in to the project's account?)" }]);
}
const problems = checkOpen({ wranglerJsonc: text, secretNames });
if (problems) refuse(problems);

const r = spawnSync(wrangler, ["deploy", "--config", config], { cwd, stdio: "inherit" });
process.exit(r.status ?? 1);
