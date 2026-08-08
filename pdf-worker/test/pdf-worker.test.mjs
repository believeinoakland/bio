/* pdf-worker (I6) — the fleet member's OWN test estate, driven THROUGH workerd.
 *
 * It runs the COMMITTED bundle under miniflare (workerd), because that is the
 * runtime the Worker actually serves in — and it is where `unpdf`/pdf.js's
 * Math.sumPrecise resolves natively (node v26.5.0 lacks it; the guarded polyfill
 * covers node). Running the raw source would not resolve `unpdf`'s bare
 * specifier — the exact breakage the fleet split exists to avoid — so the bundle
 * is the subject, exactly as the plane's op suites drive src through miniflare.
 *
 * The unpdf version is PINNED (package.json: unpdf 1.8.0) and VERIFIED here on
 * workerd: the tier-2 assertion below is a live extraction on workerd, so a
 * version that regressed on the Workers runtime would fail this suite, not ship.
 *
 * RUN 2026-07-31: added `await env.CAPTURES.put(store+"/x", bytes)` in
 * handleStructure, rebuilt, the unchanged-key-set assertion went 1 fail; removed
 * and rebuilt, back to 0. (Recorded in the report.)
 *
 * MINIFLARE IS RESOLVED FROM THE PLANE'S INSTALL WHEN THIS DIRECTORY HAS NONE,
 * and that is CPDF-9 / D-232's open half rather than a convenience. This suite
 * imported `miniflare` bare and `pdf-worker/` has no `node_modules` in a fresh
 * checkout, so from 2026-07-31 to 2026-08-08 IT WAS RUN BY NOTHING — first
 * because the battery discovered only `bio-plane/test/`, and then, once FL-2/VF-3
 * taught the battery to discover fleet members by manifest, because the import
 * threw and the member was reported as a NAMED SKIP: `DARK: pdf-worker` on every
 * run. Throughout, `scripts/coverage.mjs` credited this member's surface as
 * REACHED, because reach there is read out of this file's SOURCE. A coverage
 * figure standing on a suite nobody executed is D-93's defect one directory out
 * and D-117's own failure mode inside D-117's instrument.
 *
 * The mechanism is COPIED FROM `agent-worker/test/agent-worker.test.mjs` (I8) and
 * is deliberately not a second one: try this directory's own install, fall back
 * to resolving through `bio-plane/package.json`, which is present wherever the
 * battery can run at all. Two mechanisms for one job is how the next member goes
 * dark differently.
 */
/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/pdf-worker.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and neither the battery nor the fleet walk must discover it (PL-3/PL-4/PL-11/FL-2's precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad, which a concurrent worker overwrote between ARM and RESTORE once already. Every arm is armed ALONE with the other defences held OPEN, every restore is verified BY sha256 AND BY CONTENT (`cmp`) against a pristine pre-arm copy, and every arm names what MUST fail AND what MUST NOT.
   ALL SEVEN ARMS RUN 2026-08-08 (CPDF-9), baseline 48 pass / 0 fail before each, every one AS DECLARED on the recorded pass. Figures below are MEASURED.
   (A1) THE ORIGINAL, STILL THE SUBJECT'S OWN: have the worker call env.CAPTURES.put() beside its read, rebuild -> **45 pass, 3 FAIL** — both "R2 is byte-for-byte unchanged" arms AND the `.put(` source scan. Tier 2, the envelope, the refusals and the version arms all HELD. (First run 2026-07-31: put, rebuilt, 1 fail; removed, rebuilt, 0.)
   (A2) THE BATTERY ACTUALLY RUNS THIS SUITE (CPDF-9's reason for existing). Break one assertion here -> `battery.mjs pdf-worker` **EXITS 1** and NAMES this suite in FAILED, not as a skip. Before CPDF-9 the identical edit changed nothing anywhere, because nothing executed the file.
   (A3) RE-ARM THE DEPENDENCY FAILURE. Point the plane-install fallback at a package that does not exist -> battery **exit 0 with the member NAMED TWICE**: `SKIPPED (named): … cannot resolve …` and `fleet: … 0 member(s) actually RAN · DARK: pdf-worker`. Never counted among the suites that ran green. The generous direction stays closed.
   (A4) THE COMMENT STRIPPER EATS A URL AGAIN. Restore the naive `//`-to-end-of-line idiom -> **46 pass, 2 FAIL**, both anchored-stripper arms by name; the `THE TRAP, DRIVEN` arms HELD, because they describe the naive form rather than the fix.
   (A5) FLEET RULE 4. Remove `GET /version` from the worker, rebuild -> **44 pass, 4 FAIL**, the version arms by name. `coverage.mjs --strict` STILL EXITED 0, as declared: fleet reach is read from the SUITE's source and not the worker's, so the two halves are independent.
   (A6) THE SURFACE ROW WITHOUT ITS REACH, two stages. Stage 1 (delete the driven /version arms, keep the SURFACE row) -> `--strict` **exit 0, 4/4 reached** — DECLARED IN ADVANCE AS DOUBTFUL and it came back exactly as doubted: **the fleet reach matcher counts `/version` MENTIONED IN A COMMENT as reach.** Stage 2 (remove every textual `/version` too) -> `--strict` **EXIT 1, 3/4 reached**, naming the unreached op, fleet FLOOR silent. The gate has teeth; what it cannot see is a mention versus a driven call. Delegated, not narrowed here (REC-67's class).
   (O1) OVER-STRICTNESS, nothing broken: a correct fleet suite under a filename this session did not anticipate is DISCOVERED, RUN and `ok`, battery exit 0, member still reported as RAN.
   Every declared-versus-actual line, and the two arms that came back wrong on the FIRST pass (A1 and A5 could not be honoured at all until the harness learned to provide `esbuild` for a rebuild — recorded, not smoothed), are in `test/pdf-worker.control.mjs`'s header. */

/* D-186: owns $TMPDIR for this process and removes it on exit. Miniflare's
   `dispose()` disarms its own exit hook and then does not wait for the removal,
   so the leak is on the SUCCESS path; the battery leaked 41.0 GB that way and
   filled the machine's disk. A fleet suite the battery now RUNS must own its
   ground like every plane suite does — and this suite mints one miniflare
   sandbox per `newMf()`, four of them, so it is not a hypothetical debt. */
import "../../bio-plane/test/sandbox.mjs";

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

/* Prefer this directory's own install; fall back to the PLANE's, which is
   present wherever the battery can run at all. Neither path is a guess: both are
   resolved and the one that answers is used. */
const { Miniflare } = await (async () => {
  try { return await import("miniflare"); } catch { /* fall through */ }
  const planePkg = fileURLToPath(new URL("../../bio-plane/package.json", import.meta.url));
  const resolved = createRequire(planePkg).resolve("miniflare");
  return await import(pathToFileURL(resolved).href);
})();

const BUNDLE = fileURLToPath(new URL("../dist/pdf-worker.bundled.mjs", import.meta.url));
const WORKER_SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const hex = (b) => createHash("sha256").update(b).digest("hex");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* A VALID PDF (proper xref + trailer, so pdf.js accepts it) whose one font is
   base-14 Helvetica, WinAnsiEncoding, NO /ToUnicode — the `no_tounicode` residue
   class (CPDF-5's largest Tier-2-recoverable class). Tier 1 marks it undetermined
   naming the font; pdf.js decodes it via the standard encoding. */
function buildPdf(bodies) {
  let pdf = "%PDF-1.7\n%\xe2\xe3\xcf\xd3\n";
  const offsets = [];
  bodies.forEach((body, i) => { offsets[i] = pdf.length; pdf += `${i + 1} 0 obj\n${body}\nendobj\n`; });
  const xrefStart = pdf.length;
  const n = bodies.length + 1;
  let xref = `xref\n0 ${n}\n0000000000 65535 f \n`;
  for (let i = 0; i < bodies.length; i++) xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += xref + `trailer\n<< /Size ${n} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(pdf, "latin1"));
}
const STREAM = "BT /F1 24 Tf 72 700 Td (Hello Oakland 2026) Tj ET";
const CID_BYTES = buildPdf([
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
  `<< /Length ${STREAM.length} >>\nstream\n${STREAM}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
]);
const CID_SHA = hex(CID_BYTES);
const STORE = "scratch";
const KEY = `${STORE}/captures/${CID_SHA}`;

const newMf = (vars = {}) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: BUNDLE, script: readFileSync(BUNDLE, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  r2Buckets: ["CAPTURES"],
  bindings: { VERSION: "test", ...vars },
});
const call = (mf, body) => mf.dispatchFetch("http://pdf-worker/structure", { method: "POST", body: JSON.stringify(body) });

/* ---- Tier 2 recovers text Tier 1 could not decode (the reason this exists) ---- */
console.log("\n--- Tier 2: a no-/ToUnicode font PDF, decoded on workerd through unpdf ---");
{
  const mf = newMf();
  const bucket = await mf.getR2Bucket("CAPTURES");
  await bucket.put(KEY, CID_BYTES);
  const before = (await bucket.list()).objects.map((o) => o.key).sort();

  const res = await call(mf, { capture_sha: CID_SHA, store: STORE });
  t("200", res.status, 200);
  const out = await res.json();
  t("ok", out.ok, true);
  t("container pdf", out.container, "pdf");
  t("tier 2 produced the text", out.tier, 2);
  t("recovered the real text Tier 1 marked undetermined", out.text.document, "Hello Oakland 2026");
  t("per-page text present", out.text.pages[0].text, "Hello Oakland 2026");
  t("chars counted", out.text.counts.chars, "Hello Oakland 2026".length);

  console.log("\n--- WRITES NOTHING: R2 is byte-for-byte unchanged after a call ---");
  const after = (await bucket.list()).objects.map((o) => o.key).sort();
  t("the CAPTURES key set is unchanged (no put)", after, before);
  t("only the seeded object exists", after, [KEY]);
  const still = await bucket.get(KEY);
  t("the seeded bytes are untouched", hex(new Uint8Array(await still.arrayBuffer())), CID_SHA);
  await mf.dispose();
}

/* ---- The write-nothing property, structurally, from the source ---------------
 *
 * THE STRIPPER IS AN INSTRUMENT, AND THIS ONE WAS A TRAP (CPDF-9, D-232's rider).
 * These scans read the source with its comments removed, because the comments
 * carry this project's reasoning at length and a scan that read them would match
 * its own explanation of what must not appear. The idiom used here was `//` to
 * END OF LINE — correct over this file today and silently wrong the moment any
 * source it reads holds a URL literal, because `"http://…"` CONTAINS those two
 * slashes: the naive form deletes the literal AND THE REST OF ITS LINE. FL-2
 * copied this idiom into `agent-worker`'s suite, where the source does hold a
 * URL, and its only-one-absolute-URL arm then read 6,029 characters of a 17,265
 * character file and came back GREEN over a source truncated by two thirds. A
 * walk that has gone blind reads exactly like a subject that is clean.
 *
 * Requiring a NON-COLON before the two slashes keeps every real line comment and
 * every scheme-bearing string literal. The fix is asserted BOTH DIRECTIONS below
 * over a fixture that DOES carry a URL — this member's own source carries none
 * today, so a fixture is the only way to drive the failing direction at all —
 * and the corpus size is PRINTED, because an instrument that quietly reads less
 * than its corpus reports a clean verdict over bytes it never saw. */
const stripNaive = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
const strip      = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
const schemes = (s) => (s.match(/:\/\//g) || []).length;

console.log("\n--- THE COMMENT STRIPPER MUST NOT EAT A URL (D-232's rider, driven both directions) ---");
{
  /* Spelled by concatenation so this fixture is not itself mistaken for a URL
     literal by any walk reading THIS file (PL-11's finding: a source scan could
     not see a token spelled by concatenation — here that property is wanted). */
  const FIXTURE = [
    "const PLANE = " + JSON.stringify("http:" + "//plane/structure") + ";",
    "// a real line comment that MUST be removed",
    "const KEEP = " + JSON.stringify("https:" + "//example.gov/doc.pdf") + "; // trailing comment removed",
  ].join("\n");
  t("the fixture is non-empty and carries two schemes", [FIXTURE.length > 0, schemes(FIXTURE)], [true, 2]);
  t("THE TRAP, DRIVEN: the naive idiom loses the URL literal", stripNaive(FIXTURE).includes("plane/structure"), false);
  t("THE TRAP, DRIVEN: the naive idiom truncates that line mid-literal",
    stripNaive(FIXTURE).split("\n")[0], "const PLANE = \"http:");
  t("the naive idiom leaves 0 of the 2 schemes", schemes(stripNaive(FIXTURE)), 0);
  t("the anchored stripper keeps both schemes", schemes(strip(FIXTURE)), 2);
  t("the anchored stripper keeps the URL literal whole", strip(FIXTURE).includes("//example.gov/doc.pdf"), true);
  t("...and still removes a whole-line comment", strip(FIXTURE).includes("a real line comment"), false);
  t("...and still removes a trailing comment", strip(FIXTURE).includes("trailing comment removed"), false);
}

console.log("\n--- WRITES NOTHING: no put/delete anywhere in the Worker source, no STORE/PUBLISHED binding ---");
{
  const src = readFileSync(WORKER_SRC, "utf8");
  const codeOnly = strip(src);
  /* The guard against the OTHER failure: a walk over an empty or truncated
     corpus reports its verdict triumphantly. Both figures are printed and the
     floor is asserted, so a scan that silently stopped reading FAILS instead of
     passing. The floor is a DELTA-style lower bound, not the exact size, which
     would turn every edit to the Worker into a red suite. */
  console.log(`  corpus: src/index.mjs ${src.length} chars -> ${codeOnly.length} chars of code`
    + ` (the naive idiom would have read ${stripNaive(src).length})`);
  t("the scan read a real corpus, not an empty string", [src.length > 4000, codeOnly.length > 1500], [true, true]);
  t("no scheme-bearing literal was lost from this source", schemes(codeOnly), schemes(src));
  t("no .put( call in source", /\.put\s*\(/.test(codeOnly), false);
  t("no .delete( call in source", /\.delete\s*\(/.test(codeOnly), false);
  const wr = readFileSync(fileURLToPath(new URL("../wrangler.jsonc", import.meta.url)), "utf8");
  const cfg = strip(wr);
  console.log(`  corpus: wrangler.jsonc ${wr.length} chars -> ${cfg.length} chars of config`);
  t("the config scan read a real corpus", [wr.length > 500, cfg.length > 200], [true, true]);
  t("no PUBLISHED binding declared", /PUBLISHED/.test(cfg), false);
  t("no durable_objects (STORE) binding declared", /durable_objects/.test(cfg), false);
  t("holds the CAPTURES read binding", /CAPTURES/.test(cfg), true);
  t("declares the VERSION var the /version endpoint reports", /"VERSION"/.test(cfg), true);
}

/* ---- Fleet rule 4: which build ANSWERED (CPDF-9, IC-33) ----------------------
 *
 * *"A verification must establish which build ANSWERED, for the member as well as
 * the plane."* That was UNVERIFIABLE for this member until CPDF-9: nothing on its
 * wire named its build, so DS-4's rollout gate would have discovered it at deploy
 * time — which is D-108 one component out, and D-108 is the afternoon lost to a
 * byte-identical verification of 0.52.0 followed by `/version` answering 0.51.0.
 *
 * The value is asserted to come FROM THE BINDING and not from a constant beside
 * it: a version endpoint that reports a compiled-in string would answer the same
 * thing whichever build was serving, which is an equality that costs nothing to
 * produce. */
console.log("\n--- VERSION: the member says which build is answering, from its binding ---");
{
  const mf = newMf({ VERSION: "9.9.9-probe" });
  const res = await mf.dispatchFetch("http://pdf-worker/version", { method: "GET" });
  t("GET /version is 200", res.status, 200);
  const body = await res.json();
  t("ok", body.ok, true);
  t("names the member", body.name, "pdf-worker");
  t("reports the BOUND build, not a compiled-in constant", body.version, "9.9.9-probe");
  const wr = strip(readFileSync(fileURLToPath(new URL("../wrangler.jsonc", import.meta.url)), "utf8"));
  t("and the deployed binding is a real version, not the 0.0.0 fallback",
    /"VERSION"\s*:\s*"(?!0\.0\.0")[0-9]+\.[0-9]+\.[0-9]+"/.test(wr), true);
  const post = await mf.dispatchFetch("http://pdf-worker/version", { method: "POST" });
  t("POST /version is not the version endpoint (404)", post.status, 404);
  const src = strip(readFileSync(WORKER_SRC, "utf8"));
  t("the SURFACE table declares version", /version\s*:\s*\{[^}]*method:\s*"GET"/.test(src), true);
  t("fleet rule 2: no surface op declares mutating: true", /mutating:\s*true/.test(src), false);
  await mf.dispose();
}

/* ---- Over the envelope: text-UNDETERMINED, never truncated (I6) ---- */
console.log("\n--- ENVELOPE: a document over MAX_PDF_BYTES returns text-undetermined, not truncated text ---");
{
  const mf = newMf({ MAX_PDF_BYTES: "100" }); // the fixture is ~400 bytes, over the cap
  const bucket = await mf.getR2Bucket("CAPTURES");
  await bucket.put(KEY, CID_BYTES);
  const out = await (await call(mf, { capture_sha: CID_SHA, store: STORE })).json();
  t("ok structure still returned", out.ok, true);
  t("tier 2 was NOT attempted (declined)", out.tier, 1);
  t("text.document is empty, not truncated", out.text.document, "");
  t("one undetermined marker", out.text.undetermined.length, 1);
  t("the marker names the cause: over_envelope", out.text.undetermined[0].reason, "over_envelope");
  t("the marker states the size and the limit", [out.text.undetermined[0].bytes > 100, out.text.undetermined[0].limit], [true, 100]);
  t("a declined-over-envelope note is recorded", out.notes.includes("tier2_declined_over_envelope"), true);
  await mf.dispose();
}

/* ---- Refusals are stated, not faked ---- */
console.log("\n--- refusals: absence, bad input ---");
{
  const mf = newMf();
  const miss = await call(mf, { capture_sha: "f".repeat(64), store: STORE });
  t("unknown sha is 404", miss.status, 404);
  t("reason NOT_FOUND", (await miss.json()).reason, "NOT_FOUND");
  const bad = await call(mf, { capture_sha: "zz", store: STORE });
  t("malformed sha is 400", bad.status, 400);
  t("reason BAD_SHA", (await bad.json()).reason, "BAD_SHA");
  const badStore = await call(mf, { capture_sha: CID_SHA, store: "" });
  t("missing store is 400", badStore.status, 400);
  const notFound = await mf.dispatchFetch("http://pdf-worker/nope", { method: "GET" });
  t("a non-structure path is 404", notFound.status, 404);
  await mf.dispose();
}

console.log(`\npdf-worker: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
