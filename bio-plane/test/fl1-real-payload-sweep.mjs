#!/usr/bin/env node
/* FL-1 step 1 — SWEEP THE REAL SOURCE, and THROW if the assumption is absent.
 *
 * The CPU an investigative run spends outside its waits is spent on ONE thing
 * above all: carrying a growing transcript of TOOL RESULTS across turns. Those
 * tool results are the plane's REAL op responses. Two days before FL-1 a probe
 * reported a 97% saving from an index the product already had, because its
 * synthetic fixture omitted what the real source carried — so this probe refuses
 * to invent the payloads. It reads them off the LIVE plane.
 *
 * It calls only NON-MUTATING ops, read-only, against the instance named in .env,
 * and writes nothing. The token is never printed.
 *
 * THROWS (exit 3) if: fewer than MIN_OPS ops answered, or the median real
 * response is smaller than MIN_MEDIAN_BYTES. Either means the corpus would not
 * represent what a run actually parses, and a probe built on it would measure
 * something else — which is exactly the failure this file exists to prevent.
 *
 * usage:  node bio-plane/test/fl1-real-payload-sweep.mjs [--json out.json]
 */
import { writeFileSync } from "node:fs";
import { loadEnv } from "./fl1-billing-surface-check.mjs";

const env = loadEnv();
const INSTANCE = env.BIO_INSTANCE;
const TOKEN = env.BIO_ADMIN_TOKEN || env.BIO_MEMBER_TOKEN;
if (!INSTANCE || !TOKEN) { console.error("no BIO_INSTANCE / BIO_*_TOKEN in .env"); process.exit(2); }
const ORIGIN = `https://${INSTANCE}.believeinoakland.workers.dev`;

/* Non-mutating ops an investigative run would actually call while working:
 * orienting in the record, searching it, reading what it found, and checking
 * what it is allowed to do. Every one is `mutating: false` in src/index.mjs. */
const READ_OPS = [
  "version", "whoami", "affordances", "stats", "runtime", "audit", "index",
  "list", "search", "searchfields", "meaningrows", "projection", "tasks",
  "dangling", "reevaluations", "exportlog", "selectionlist", "expertiselist",
  "archivelookup", "sourcereach", "backlinks", "links", "earnedbasis",
  "inquirystrength", "publishededitions", "projectparticipants", "selftest",
];

const MIN_OPS = 8;              // fewer than this and there is no corpus
const MIN_MEDIAN_BYTES = 200;   // a corpus of empty envelopes measures nothing

async function callOp(op) {
  const url = `${ORIGIN}/api/?op=${encodeURIComponent(op)}&token=${encodeURIComponent(TOKEN)}`;
  const t0 = Date.now();
  let r;
  try { r = await fetch(url, { cache: "no-store" }); }
  catch (e) { return { op, error: e.name }; }        // never the message: it can carry the URL (D-205)
  const text = await r.text();
  /* D-205: a real body is only carried forward if it demonstrably contains no
   * credential. A body that echoes one is dropped, never printed, never embedded. */
  const clean = !SECRETS.some((s) => s && text.includes(s));
  return { op, status: r.status, bytes: Buffer.byteLength(text, "utf8"), wall_ms: Date.now() - t0,
           credential_free: clean, body: clean ? text : undefined,
           ok: (() => { try { return JSON.parse(text)?.ok !== false; } catch { return false; } })() };
}

const SECRETS = [env.BIO_ADMIN_TOKEN, env.BIO_MEMBER_TOKEN, env.CF_TOKEN,
                 env.CLOUDFLARE_API_TOKEN, env.GITHUB_TOKEN,
                 env.BIO_RELEASE_SEED, env.BIO_RATIFY_SEED].filter(Boolean);

const rows = [];
for (const op of READ_OPS) rows.push(await callOp(op));

const answered = rows.filter((r) => r.status === 200 && r.bytes > 0);
const sizes = answered.map((r) => r.bytes).sort((a, b) => a - b);
const median = sizes.length ? sizes[sizes.length >> 1] : 0;
const sum = sizes.reduce((a, b) => a + b, 0);

const report = {
  instrument: "live plane HTTP, read-only ops, node fetch on this machine",
  origin: ORIGIN, date: new Date().toISOString().slice(0, 10),
  ops_attempted: READ_OPS.length, ops_answered: answered.length,
  bytes: { min: sizes[0] ?? 0, median, max: sizes[sizes.length - 1] ?? 0, sum },
  per_op: rows.map(({ body, ...r }) => r),
  /* The REAL bodies, kept for the probe to parse. Only credential-free ones. */
  corpus: answeredBodies(),
};
function answeredBodies() {
  return rows.filter((r) => r.status === 200 && r.body).map((r) => ({ op: r.op, body: r.body }));
}

console.log(JSON.stringify({ ...report, corpus: `[${report.corpus.length} real bodies]` }, null, 2));

const jsonArg = process.argv.indexOf("--json");
if (jsonArg > -1 && process.argv[jsonArg + 1]) {
  writeFileSync(process.argv[jsonArg + 1], JSON.stringify(report, null, 2));
}

const dirty = rows.filter((r) => r.credential_free === false).map((r) => r.op);
if (dirty.length) {
  console.error(`\nTHROW: ${dirty.length} op response(s) echoed a credential (${dirty.join(", ")}). ` +
    `Not embedded, not printed. This is a D-205 finding in its own right.`);
  process.exit(4);
}

if (answered.length < MIN_OPS) {
  console.error(`\nTHROW: only ${answered.length} real ops answered (floor ${MIN_OPS}). ` +
    `There is no real corpus, so any payload used would be invented. No probe is built on this.`);
  process.exit(3);
}
if (median < MIN_MEDIAN_BYTES) {
  console.error(`\nTHROW: median real response ${median} B is below the ${MIN_MEDIAN_BYTES} B floor. ` +
    `A corpus of empty envelopes would measure the harness, not the work.`);
  process.exit(3);
}
console.log(`\nCORPUS OK: ${answered.length} real op responses, median ${median} B, max ` +
  `${sizes[sizes.length - 1]} B, total ${sum} B.`);
