#!/usr/bin/env node
/* proto-mem/1f (THROWAWAY): removes what deploy.mjs made. Same account/name guard. Without --go it only prints the commands.
   node teardown.mjs --name=plat-s1-probe --bucket=plat-s1-probe-files [--go]
   Note: `wrangler delete` of a Worker with containers removes the Worker and its Durable Object classes; whether the pushed container images in the account's registry are removed too is NOT known here -
   BOB checks the dashboard (Containers) or `npx wrangler containers list` and `npx wrangler containers delete <id>` for leftovers. A bucket must be emptied before deletion: run `node run-remote.mjs --scenario=wipe` first. */
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
const PERMITTED = "20b533579290b9b93168345edd3b7f72"; const here = dirname(fileURLToPath(import.meta.url));
const a = Object.fromEntries(process.argv.slice(2).map((x) => { const [k, ...v] = x.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const refuse = (m) => { console.error("REFUSED: " + m); process.exit(3); };
if (process.env.CLOUDFLARE_ACCOUNT_ID !== PERMITTED) refuse("CLOUDFLARE_ACCOUNT_ID must be exactly the permitted account.");
const name = a.name || "plat-s1-probe", bucket = a.bucket || "plat-s1-probe-files";
if (!/^plat-s1(-[a-z0-9]+)*$/.test(name) || !/^plat-s1(-[a-z0-9]+)*$/.test(bucket)) refuse("only plat-s1 or plat-s1-<suffix> names.");
for (const s of [["npx", "wrangler", "delete", "--config", "wrangler.generated.json"], ["npx", "wrangler", "r2", "bucket", "delete", bucket]]) {
  console.log((a.go ? "RUN  " : "WOULD RUN  ") + s.join(" ")); if (a.go) { try { execFileSync(s[0], s.slice(1), { cwd: here, stdio: "inherit", env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: PERMITTED } }); } catch { console.error("step failed (continuing): " + s.join(" ")); } }
}
