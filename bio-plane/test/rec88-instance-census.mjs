/* REC-88 · THE CONSUMER-IMPACT CENSUS, MEASURED ON THE PROJECT INSTANCE'S OWN
 * DATA AND NOT ON A FIXTURE.
 *
 * IC-96's consumer impact is "a leg's earned capture grade can FALL for legs
 * that already exist", and a number for that is only worth anything if it comes
 * from the record rather than from an estimate. This probe asks the live
 * instance named by `BIO_INSTANCE` two questions, both READ-ONLY (every op it
 * calls is `mutating: false` in the OPS table, and it writes nothing anywhere):
 *
 *   1. Which BUNDLES' `earned.capture` ceiling moves off `EARNED_CAPTURE_CEILING`
 *      once `captureBound` is asked — and to what.
 *   2. Which existing BASIS LEGS state a capture grade that the bound would now
 *      refuse, and how many of those move because the bound is UNDETERMINED
 *      rather than because it is a weaker letter.
 *
 * THE BOUND IS RECOMPUTED HERE FROM THE PUBLISHED PROJECTION COLUMNS
 * (`transcribed`, `derivation_cap`) rather than imported, because this probe
 * runs against a DEPLOYED build that does not yet carry the change: importing
 * the new `captureBound` would measure this worktree, not the instance. The two
 * must agree, and they agree BY CONSTRUCTION — `reading_text_source.derivation_cap`
 * IS `derivationCap(chain)` and `transcribed` IS `isTranscribed(chain)`, both
 * written by textchain.mjs at projection time, which is exactly the pair
 * `captureBound` branches on. That equivalence is asserted in the battery
 * (`content-capture-bound.test.mjs` section 6) rather than left to this comment.
 *
 * Run: `node test/rec88-instance-census.mjs` from `bio-plane/`. */
/* THE CREDENTIAL LOADER AND THE REDACTOR ARE `vf4-call.mjs`'s, reused rather
   than rewritten: it already knows the origin's shape and already redacts every
   secret out of anything printed, which a hand-rolled loader in this file did
   not — the first draft of this probe threw an `ERR_INVALID_URL` whose message
   carried the token, which is exactly the accident CLAUDE.md's rule exists for.
   STORE `bio` IS THE REAL RECORD and this probe only ever READS it. */
import { loadEnv, ORIGIN, redact } from "./vf4-call.mjs";

const env = loadEnv();
const TOK = env.BIO_ADMIN_TOKEN || env.BIO_MEMBER_TOKEN;
const STORE = process.argv[2] || "bio";
if (!env.BIO_INSTANCE || !TOK) { console.error("no BIO_INSTANCE / token in .env"); process.exit(2); }

const get = async (op, qs = "") => {
  const u = `${ORIGIN}/api/?op=${encodeURIComponent(op)}&token=${encodeURIComponent(TOK)}`
          + `&store=${encodeURIComponent(STORE)}${qs ? `&${qs}` : ""}`;
  let text;
  try {
    const r = await fetch(u, { cache: "no-store" });
    text = await r.text();
  } catch (e) { console.error("fetch failed:", redact(String(e && e.message))); process.exit(4); }
  let j = null;
  try { j = JSON.parse(text); } catch { console.error(`op=${op} did not answer JSON:`, redact(text).slice(0, 300)); return null; }
  return j && typeof j === "object" && "result" in j ? j.result : j;
};

const GRADES = ["A", "B", "C", "D"];
const CEILING = "B";
const weaker = (a, b) => {
  const ra = GRADES.indexOf(a), rb = GRADES.indexOf(b);
  if (ra < 0 || rb < 0) return null;
  return ra >= rb ? a : b;
};
/* captureBound, in the projection's terms. See the header. */
const boundOf = (row) => {
  if (!row || !row.transcribed) return CEILING;
  if (row.derivation_cap == null) return null;
  return weaker(CEILING, row.derivation_cap);
};

/* THE BUILD THAT ANSWERED, named first — "if a live probe contradicts the suite,
   establish which build answered before believing either" (CLAUDE.md). `/version`
   is a ROUTE and not an op, and asking the api endpoint for a `version` OP answers
   "unknown op" — which the first draft of this probe printed as though it were a
   version number. Written WITHOUT the `op=` spelling on purpose: `op-claims.test.mjs`
   refuses prose naming an op the dispatch table does not hold, and it caught this
   very sentence on this item's own run. The guard is right and the sentence moved. */
let ver = "unavailable";
try {
  const r = await fetch(`${ORIGIN}/version`, { cache: "no-store" });
  ver = redact(await r.text()).trim().slice(0, 120);
} catch (e) { ver = `unavailable (${redact(String(e && e.message)).slice(0, 60)})`; }
console.log("instance:", ORIGIN.replace(/^https?:\/\//, ""), "· store:", STORE, "· build serving:", ver);

/* ---- 1. every transcription this record holds ------------------------- */
const tp = await get("textprovenance", "limit=500");
if (!tp || tp.ok === false) { console.error("textprovenance:", redact(JSON.stringify(tp)).slice(0, 400)); process.exit(3); }
console.log(`\ntextprovenance: ${tp.count} capture(s) carry a text chain · truncated=${tp.truncated} · limit=${tp.limit}`);
const byBundle = new Map();
for (const d of tp.documents) {
  if (!d.bundle_id) continue;
  if (!byBundle.has(d.bundle_id)) byBundle.set(d.bundle_id, []);
  byBundle.get(d.bundle_id).push(d);
}
const capHist = {};
for (const d of tp.documents) {
  const k = `${d.transcribed ? "transcribed" : "not-transcribed"}/cap=${d.derivation_cap ?? "null"}`;
  capHist[k] = (capHist[k] || 0) + 1;
}
console.log("  histogram:", JSON.stringify(capHist));

/* The DOCUMENT-grain bound: the STRONGEST over the document's captures, which is
   the collapse `earnedBasisRegistry` already makes on the connection axis. */
const bundleBound = new Map();
for (const [bid, rows] of byBundle) {
  let best = null, sawNull = false;
  for (const r of rows) {
    const b = boundOf(r);
    if (b == null) { sawNull = true; continue; }
    best = best == null ? b : (GRADES.indexOf(b) < GRADES.indexOf(best) ? b : best);
  }
  bundleBound.set(bid, { bound: best, sawNull, captures: rows.length });
}
let moves = 0, movesNull = 0;
const movers = [];
for (const [bid, e] of bundleBound) {
  if (e.bound === CEILING) continue;
  moves++;
  if (e.bound == null) movesNull++;
  movers.push(`${bid} -> ${e.bound ?? "UNDETERMINED"} (${e.captures} capture(s))`);
}
console.log(`\nBUNDLES whose earned.capture ceiling MOVES off ${CEILING}: ${moves} of ${bundleBound.size} that carry a chain`
  + ` (${movesNull} of them to UNDETERMINED)`);
for (const m of movers.slice(0, 60)) console.log("   ", m);

/* ---- 2. the legs already written -------------------------------------- */
const idx = await get("list", "limit=500");
const items = (idx && (idx.bundles || idx.items || idx.rows)) || [];
console.log(`\nop=list: ${items.length} bundle(s)${idx && idx.truncated ? " (TRUNCATED)" : ""}`);
const inquiries = items
  .filter((b) => (b.object_type || b.type) === "inquiry")
  .map((b) => b.bundle_id || b.id);
console.log(`  of which inquiries: ${inquiries.length}`);

let legsTotal = 0, legsCapture = 0, legsMoved = 0, legsUndet = 0, unreadable = 0, noBasis = 0;
const moved = [];
const bytesRead = [];
/* THE PARSER SELF-CHECK, AND IT IS HERE BECAUSE A ZERO COSTS NOTHING TO
   PRODUCE. This probe is expected to answer 0 on an instance that has read none
   of its documents, and a parser that can see nothing answers 0 too. So the
   SAME parser is run first over a synthetic frontmatter carrying two capture
   legs; if it does not count them, this run is a finding about the instrument
   and the probe says so and exits rather than printing a zero. */
const SELFCHECK = ["---", "id: INQ-SELFCHECK", "object_type: inquiry", "basis:",
  "  - target: INFO-selfcheck-a", "    role: supports", "    grade: B",
  "    grade_axis: capture", "    grade_source: capture",
  "  - target: INFO-selfcheck-b", "    role: supports", "    grade: C",
  "    grade_axis: capture", "    grade_source: capture",
  "  - target: INFO-selfcheck-c", "    role: supports", "    grade: D",
  "    grade_axis: connection", "    grade_source: testimony",
  "references: []", "---", "", "## Question", ""].join("\n");

for (const src of [{ inq: "__selfcheck__", text: SELFCHECK },
                   ...(await Promise.all(inquiries.map(async (inq) => {
                     const f = await get("file", `id=${encodeURIComponent(inq)}&path=bundle.md`);
                     return { inq, text: f && (f.text || f.content || f.body) };
                   })))]) {
  const selfcheck = src.inq === "__selfcheck__";
  const before = { legsTotal, legsCapture, legsMoved };
  const inq = src.inq;
  const text = src.text;
  if (typeof text !== "string") { unreadable++; continue; }
  if (!selfcheck) bytesRead.push(`${inq}: ${text.length} bytes`);
  const fm = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!fm) { unreadable++; continue; }
  const lines = fm[1].split("\n");
  let i = lines.findIndex((l) => /^basis:\s*$/.test(l));
  if (i < 0) { if (!selfcheck) noBasis++; continue; }
  let cur = null;
  const flush = () => {
    if (!cur) return;
    legsTotal++;
    if (cur.grade_source === "capture" && cur.grade) {
      legsCapture++;
      const e = bundleBound.get(cur.target);
      const bound = e ? e.bound : CEILING;
      if (bound == null) {
        legsMoved++; legsUndet++;
        moved.push(`${inq} -> ${cur.target}: states ${cur.grade}, bound UNDETERMINED`);
      } else if (GRADES.indexOf(cur.grade) < GRADES.indexOf(bound)) {
        legsMoved++;
        moved.push(`${inq} -> ${cur.target}: states ${cur.grade}, bound ${bound}`);
      }
    }
    cur = null;
  };
  for (i++; i < lines.length; i++) {
    const l = lines[i];
    if (/^[a-z_]+:/.test(l)) break;
    const m = /^\s*-\s*target:\s*(\S+)/.exec(l);
    if (m) { flush(); cur = { target: m[1] }; continue; }
    if (!cur) continue;
    const kv = /^\s+([a-z_]+):\s*(.+?)\s*$/.exec(l);
    if (kv) cur[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  flush();
  if (selfcheck) {
    /* The synthetic carries THREE legs, TWO of them grade_source: capture, and
       one of those two claims B against a target this instance does not hold —
       which means no bound, which means the ceiling, which means it does NOT
       move. So the parser must count 3 legs, 2 capture legs and 0 movers. Any
       other triple is a defect in the PARSER and the instance's zero below
       would mean nothing. */
    const got = [legsTotal - before.legsTotal, legsCapture - before.legsCapture, legsMoved - before.legsMoved];
    const want = [3, 2, 0];
    const ok = JSON.stringify(got) === JSON.stringify(want);
    console.log(`\nPARSER SELF-CHECK over a synthetic basis block: ${ok ? "PASS" : "FAIL"}`
      + ` — legs/capture-legs/movers = ${got.join("/")}, want ${want.join("/")}`);
    if (!ok) { console.error("the parser cannot see a leg it was handed; this probe's zero would be meaningless"); process.exit(5); }
    legsTotal = before.legsTotal; legsCapture = before.legsCapture; legsMoved = before.legsMoved;
    continue;
  }
}
console.log(`\nLEGS: ${legsTotal} basis leg(s) across ${inquiries.length} inquiry(ies)`
  + `${unreadable ? ` · ${unreadable} inquiry bundle(s) whose bundle.md this probe could not read` : ""}`
  + `${noBasis ? ` · ${noBasis} inquiry bundle(s) carry NO basis block at all` : ""}`);
for (const b of bytesRead) console.log(`    read ${b}`);
console.log(`  with grade_source: capture AND a stated grade: ${legsCapture}`);
console.log(`  whose stated grade MOVES (would now be refused): ${legsMoved}`
  + ` (${legsUndet} because the bound is UNDETERMINED rather than a weaker letter)`);
for (const m of moved.slice(0, 60)) console.log("   ", m);

console.log("\nWHAT THIS PROBE CANNOT SEE, stated: any bundle past the `limit` it asked for"
  + " (truncated is printed above); any leg in an inquiry whose bundle.md it could not read;"
  + " and any document whose text was never read at all, which carries NO reading_text_source row"
  + " and is therefore untranscribed by construction and unmoved by this item.");
