#!/usr/bin/env node
/* d465-search-bench.mjs — D-465: what D-447's viewer-visible relevance costs a search, at the sizes that matter.
 *
 * D-447's worker measured `q=culvert` at 210 ms against 74 ms on `main` over 2,000 visible documents, every one
 * matching (M-122), with a scratch bench it did not keep. This is that bench, KEPT, so the figure can be re-taken:
 * the same op (`op=search` as an enrolled member, `facets=none`), the same worst case (the term in every document),
 * the same three queries, driven through the control plane in miniflare against any copy of the plane's sources.
 *
 * It WRITES NOTHING outside miniflare's own temporary store, and reaches no deployed instance: the real instance's size
 * is read separately, by a read-only op, and recorded in the measurement with where it came from.
 *
 * Usage (from anywhere; paths are resolved from this file):
 *   node tools/d465-search-bench.mjs [--src DIR] [--sizes 31,250,2000] [--runs 7] [--label NAME]
 *     --src    a directory holding the plane's `src/` sources (default: bio-plane/src). The directory's parent must
 *              also hold `checks/` (index.mjs imports ../checks/bio-checks.mjs), as `git archive <rev> bio-plane/src
 *              bio-plane/checks docprofile` lays it out.
 *     --sizes  the visible-document counts to measure at, ascending; the corpus GROWS between sizes in one store.
 *     --runs   timed runs per query per size, after one untimed warm-up.
 *     --words  filler words per document body (default 60): what `highlight()` re-reads per matching row.
 *     --digest print a sha256 of each query's answer body at each size (for a byte-identity comparison between trees).
 *
 * THE FOOT: a run that reaches its end prints `d465-search-bench: FOOT sizes=… runs=…`. A run without it did not
 * finish and its figures are void. Every size asserts its own corpus is live: vera's `q=culvert` must find exactly
 * the documents promoted so far, or the run exits 1 naming the size (a timing over an empty answer is free).
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join, dirname, resolve } from "node:path";
import { performance } from "node:perf_hooks";
import "../bio-plane/test/sandbox.mjs";   /* D-186: owns $TMPDIR for this process and removes it on exit */

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(HERE, "../bio-plane/package.json"));
const { Miniflare } = require("miniflare");

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; };
const SRC = resolve(opt("--src", join(HERE, "../bio-plane/src")));
const SIZES = opt("--sizes", "31,250,2000").split(",").map(Number);
const RUNS = Number(opt("--runs", "7"));
const LABEL = opt("--label", SRC);
const DIGEST = argv.includes("--digest");
const WORDS = Number(opt("--words", "60"));
if (!SIZES.every((n, i) => Number.isInteger(n) && n > 0 && (i === 0 || n > SIZES[i - 1]))) {
  console.error("--sizes must be ascending positive integers"); process.exit(2);
}
const IDX = join(SRC, "index.mjs");
const srcSha = createHash("sha256").update(readFileSync(join(SRC, "query.mjs"))).digest("hex").slice(0, 12);
console.log(`d465-search-bench: src ${LABEL} (query.mjs sha256 ${srcSha}…) sizes ${SIZES.join(",")} runs ${RUNS} words ${WORDS} node ${process.version}`);

const ADM = "adm-d465", MEM = "mem-d465";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const RAW = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, body: await res.text() };
};
const parse = (r) => { try { return rP(JSON.parse(r.body)); } catch { return null; } };
const POST = async (q, body) => parse(await RAW(q, body ?? {}));
const must = (l, r) => { if (!r || r.ok === false) throw new Error(`${l}: ${JSON.stringify(r).slice(0, 500)}`); return r; };
const E = encodeURIComponent;
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

let code = 0;
try {
  must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-d465" }));
  const enrol = async (memberId, role) => {
    const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role,
                                                          capabilities: ["contribute"] });
    must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-d465` }));
    const tok = (await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-d465` }))?.token;
    if (!tok) throw new Error(`${memberId} could not log in`);
    return tok;
  };
  await enrol("ruth", "admin");   /* the founder is the first administrator; the second must be one too (ADMINS_FIRST) */
  const VERA = await enrol("vera", "member");   /* the reader: an enrolled member, as in D-447's bench */

  /* The corpus: every document says `culvert` (1-3 times, so the order is a real ranking), half say `levy`, a fifth
     `audit`, over `--words` of filler (60 by default) — D-447's worst case, a term in every document. */
  const filler = (i) => Array.from({ length: WORDS }, (_, k) => `word${(i * 7 + k) % 97}`).join(" ");
  const body = (i) => `${"culvert ".repeat(1 + (i % 3))}${i % 2 ? "" : "levy "}${i % 5 ? "" : "audit "}${filler(i)}`;
  const infoMd = (id, text) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
    `title: "Info ${id}"`, "current_state: collected", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
    "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland", "references: []",
    "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
    "visuals: []", "---", "", "## Summary", "", text, "", "## Provenance Notes", "",
    "## Session Log", "", "## Review Notes", ""].join("\n");
  const promote = (i) => {
    const id = `INFO-2026-${String(10000 + i)}-d465`, text = infoMd(id, body(i));
    return POST(`op=promote&token=${ADM}`, { bundleId: id, base: null, snapKey: `${id}-1`,
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
      register: [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }],
      meta: { object_type: "information", group: "believe-in-oakland", title: `Bundle ${id}`,
              current_state: "collected", created: NOW, last_updated: LATER } });
  };

  const QUERIES = ["q=culvert", `q=${E("culvert OR levy OR audit")}`, "q=culvert&mode=ids"];
  const stat = (xs) => { const s = [...xs].sort((a, b) => a - b), m = s.length >> 1;
    return { median: s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2, min: s[0], max: s[s.length - 1] }; };
  const f = (x) => x.toFixed(1);
  let have = 0;
  for (const N of SIZES) {
    const t0 = performance.now();
    for (; have < N; have++) must(`promote ${have}`, await promote(have));
    console.log(`\n  size ${N}: corpus promoted (${f((performance.now() - t0) / 1000)} s)`);
    /* THE CORPUS IS LIVE: vera sees every document, and `culvert` matches every one. */
    const live = parse(await RAW(`op=search&token=${VERA}&q=culvert&facets=none&mode=count`));
    const total = live?.total ?? live?.count ?? null;
    if (total !== N) throw new Error(`size ${N}: vera's q=culvert counts ${JSON.stringify(total)}, want ${N} — `
                                    + `the corpus is not what is being timed (${JSON.stringify(live).slice(0, 300)})`);
    for (const q of QUERIES) {
      const url = `op=search&token=${VERA}&${q}&facets=none`;
      const warm = await RAW(url);
      if (warm.status !== 200 || parse(warm)?.ok === false) throw new Error(`size ${N} ${q}: ${warm.body.slice(0, 300)}`);
      const ms = [];
      for (let r = 0; r < RUNS; r++) {
        const a = performance.now(); const res = await RAW(url); ms.push(performance.now() - a);
        if (res.body !== warm.body) throw new Error(`size ${N} ${q}: the answer moved between runs`);
      }
      const s = stat(ms);
      console.log(`  size ${N}  ${q.padEnd(40)} median ${f(s.median).padStart(7)} ms  min ${f(s.min).padStart(7)}  max ${f(s.max).padStart(7)}`
                  + `  runs [${ms.map(f).join(", ")}]${DIGEST ? `  body sha256 ${sha(warm.body).slice(0, 16)}` : ""}`);
    }
  }
  console.log(`\nd465-search-bench: FOOT sizes=${SIZES.join(",")} runs=${RUNS} words=${WORDS} src=${LABEL}`);
} catch (e) {
  console.error(`d465-search-bench: FAILED — ${e.message}`); code = 1;
} finally {
  await mf.dispose();
}
process.exit(code);
