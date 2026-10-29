#!/usr/bin/env node
/* proto-mem/1f (THROWAWAY): BOB's deploy of the probe Worker. Refuses anything but account 20b533579290b9b93168345edd3b7f72 and a Worker name that is plat-s1 or plat-s1-<suffix>.
   It never runs wrangler unless --go is given; without --go it writes wrangler.generated.json (git-ignored) and prints the commands it WOULD run. It never prints a secret.
   Usage (from proto-mem/1f/probe, on a machine with docker running, network, and `npm install` done here):
     export CLOUDFLARE_ACCOUNT_ID=20b533579290b9b93168345edd3b7f72        # the guard compares this to the permitted account; a different value is refused
     node deploy.mjs --name=plat-s1-probe --bucket=plat-s1-probe-files --instance-type=standard-1 [--which=reader] [--sleep-after=5m] [--go]
   Steps the --go run performs, in order, each stopping the script on failure:
     1. npx wrangler r2 bucket create <bucket>                          (skipped with --bucket-exists)
     2. npx wrangler deploy --config wrangler.generated.json            (with --which=reader: no image is built; the Worker and ReaderProbe on the published digest)
   Then BOB sets the secret by hand (never in a file, never printed):  npx wrangler secret put PROBE_TOKEN --config wrangler.generated.json   (paste `openssl rand -hex 24`; keep it for PROBE_TOKEN in the run commands) */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const PERMITTED = "20b533579290b9b93168345edd3b7f72";
const here = dirname(fileURLToPath(import.meta.url));
const a = Object.fromEntries(process.argv.slice(2).map((x) => { const [k, ...v] = x.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const refuse = (m) => { console.error("REFUSED: " + m); process.exit(3); };
if (process.env.CLOUDFLARE_ACCOUNT_ID !== PERMITTED) refuse(`CLOUDFLARE_ACCOUNT_ID must be exactly ${PERMITTED} (got ${process.env.CLOUDFLARE_ACCOUNT_ID ? "a different value" : "nothing"}). Only that account is permitted.`);
if (process.env.CS_TEST_CF_ACCOUNT_ID && process.env.CLOUDFLARE_ACCOUNT_ID === process.env.CS_TEST_CF_ACCOUNT_ID) refuse("the throwaway rehearsal account is for the new-team rehearsal alone.");
const name = a.name || "plat-s1-probe", bucket = a.bucket || "plat-s1-probe-files", itype = a["instance-type"] || "standard-1";
if (!/^plat-s1(-[a-z0-9]+)*$/.test(name)) refuse(`Worker name ${name} is not plat-s1 or plat-s1-<suffix>.`);
if (!/^plat-s1(-[a-z0-9]+)*$/.test(bucket)) refuse(`bucket name ${bucket} is not plat-s1 or plat-s1-<suffix>.`);
if (a["sleep-after"] && !/^\d+[smh]$/.test(a["sleep-after"])) refuse("--sleep-after must look like 90s, 5m or 2h.");
if (!["standard-1", "standard-4"].includes(itype)) refuse(`instance type ${itype}: only standard-1 and standard-4 are measured.`);
const cfg = readFileSync(join(here, "wrangler.template.json"), "utf8").replaceAll("__NAME__", name).replaceAll("__BUCKET__", bucket).replaceAll("__ITYPE__", itype).replaceAll("__SLEEP__", a["sleep-after"] || "5m");
const parsed = JSON.parse(cfg);
/* --which=reader (BOB, K5800): ReaderProbe only, on the published reader digest; no MinProbe class, binding or migration entry (its image would be built, and no image is built in a session, K1898) */
const which = a.which || "all";
if (!["all", "reader"].includes(which)) refuse(`--which must be reader or all (got ${which}).`);
if (which === "reader") {
  parsed.containers = parsed.containers.filter((c) => c.class_name === "ReaderProbe");
  parsed.durable_objects.bindings = parsed.durable_objects.bindings.filter((b) => b.class_name === "ReaderProbe");
  parsed.migrations = parsed.migrations.map((m) => ({ ...m, new_sqlite_classes: m.new_sqlite_classes.filter((c) => c === "ReaderProbe") }));
  if (parsed.containers.some((c) => !/^docker\.io\/civicsmith\/reader-container@sha256:[0-9a-f]{64}$/.test(c.image))) refuse("ReaderProbe must name the published reader digest.");
}
if (parsed.account_id !== PERMITTED) refuse("the template's account_id is not the permitted account.");
writeFileSync(join(here, "wrangler.generated.json"), JSON.stringify(parsed, null, 2) + "\n");
const steps = [...(a["bucket-exists"] ? [] : [["npx", "wrangler", "r2", "bucket", "create", bucket]]), ["npx", "wrangler", "deploy", "--config", "wrangler.generated.json"]];
console.log(`account ${PERMITTED} ok; Worker ${name}; bucket ${bucket}; instance type ${itype}; containers ${parsed.containers.map((c) => c.class_name).join(", ")}; config written to wrangler.generated.json`);
for (const s of steps) {
  console.log((a.go ? "RUN  " : "WOULD RUN  ") + s.join(" "));
  if (a.go) { try { execFileSync(s[0], s.slice(1), { cwd: here, stdio: "inherit", env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: PERMITTED } }); } catch { refuse(`step failed: ${s.join(" ")}`); } }
}
console.log(a.go ? "deployed. Next: set the secret PROBE_TOKEN (see the header of this file), then run run-remote.mjs." : "dry run only; add --go to run the steps.");
