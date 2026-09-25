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
   Every declared-versus-actual line, and the two arms that came back wrong on the FIRST pass (A1 and A5 could not be honoured at all until the harness learned to provide `esbuild` for a rebuild — recorded, not smoothed), are in `test/pdf-worker.control.mjs`'s header.
   **RE-MEASURED 2026-09-24 BY D-478 (cloud worker, base `e9b21be6`), because D-478 changed this suite and the baseline above went stale the moment it did — corrected, never left standing. THE PEN RAN OUTSIDE THE WORKTREE** — `mkdtempSync(tmpdir())`, moved there by this item on BOB #32's ruling of the same day; reasoning at the `PRISTINE` line. **AND THE PRISTINE SET GAINED `dist/pdf-worker.bundle.json`, WHICH IS A DEFECT THIS HARNESS HAD.** `scripts/build.mjs` writes the manifest as well as the bundle and this harness restored only the bundle, so every arm that rebuilt left the manifest describing the ARMED build. No arm here reads it, so nothing noticed — `bio-plane/test/fleetbundles.test.mjs` did, going RED on this item's own first gate with three findings that were one cause. `ocr-worker.control.mjs` already had it right. **The briefed/held figure of 48 was NOT stale — measured on `origin/main` @ `e9b21be6` at 48/0 and reported as right rather than assumed.** New BASELINE **67 pass / 0 fail** (+19 assertions, all D-478's).
   (N1) **D-478'S NAMED CONTROL — WIDEN THE SHAPE AGAIN.** The member's namespace test goes back to `/^[a-z0-9_-]+$/i`, the constant left intact -> **59 pass, 8 FAIL**, 6 of 6 declared names among them: `store=biosmoke` BY NAME, its detail row, the refusal-lists-that-set row, the hyphenated / underscored / `Scratch` / `BIO` rows and the 400-vs-404 distinguishability arm — **the widened member SERVED a document from a namespace no instance holds**, which this suite can say because it seeds the bytes under that very prefix rather than refusing over an empty bucket. All 8 must-nots held: the set-equals-the-plane's pin, both BAD_STORE arms, tier 2 and the R2-unchanged arm.
   **DECLARED WRONG ON THE FIRST PASS AND CORRECTED INTO SOMETHING STRONGER RATHER THAN SMOOTHED.** The first declaration demanded the named-empty, `a b` and trailing-space rows fail too; they did not, and the run came back **4 of 5 named** on an arm otherwise exactly as declared. The cause is a real property of the arm: it swaps the CONDITION and leaves the REFUSAL BODY standing, so a name failing `/^[a-z0-9_-]+$/i` never reaches R2 under either shape and keeps answering NAMESPACE_UNKNOWN. **That is what makes the SHAPE and the SET separately visible, and why N1 and N2 are two arms: N1 can only reach the names the OLD SHAPE ACCEPTED.** Those three rows are MUST-NOTs now, where an arm reaching them would itself be the finding — and the corrected declaration was carried straight into `ocr-worker`'s N1 before it was first run, where it held.
   (N2) THE COPY AGES. This member's NAMESPACES gains `biosmoke` -> **62 pass, 5 FAIL**, 3 of 3 by name: the set-EQUALS-the-plane pin, the refusal-lists-that-set arm and the `store=biosmoke` row (ACCEPTED now, answering 200 from the seeded bytes). Held: the plane-set-was-READ arm, both BAD_STORE arms, the OTHER unknown names and the NOT_FOUND arm.
   **AND THE SIX UNKNOWN-NAME ROWS' LABELS ARE LITERALS PER ROW rather than composed through a `${…}` slot, because `m025-arm-anchor-witness.test.mjs` caught the composed form on this item's first gate and named all six: a driver that quotes a label it can only match by eating the slot goes stale the moment the value moves. `agent-worker` §3 is the shape they should have had.** Both arms re-measured after the change: N1 6 of 6 named with all 8 must-nots held, N2 3 of 3, every restore verified by sha256 AND `cmp` including the manifest, tree re-green at 67/0. */

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
/* D-478: the PLANE's own declaration, read from its source so this member's copy is pinned to the authority
   rather than to a second copy typed here — `agent-worker`'s §3 does the same and its A2 note is about exactly
   the failure a retyped value produces. */
const PLANE_INDEX = readFileSync(fileURLToPath(new URL("../../bio-plane/src/index.mjs", import.meta.url)), "utf8");
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
  /* D-478: `store: ""` IS A NAMED VALUE, not a missing one, so it now meets NAMESPACE_UNKNOWN with every other
     name no instance holds — the line `agent-worker` draws (IC-253) and the reason this arm's old label
     ("missing store") was wrong: it never drove a MISSING store at all, because the handler coerced an absent
     field and an empty string to the same `""`. Both conditions are driven separately now. */
  const namedEmpty = await call(mf, { capture_sha: CID_SHA, store: "" });
  t("a namespace named EMPTY is 400 NAMESPACE_UNKNOWN", [namedEmpty.status, (await namedEmpty.json()).reason],
    [400, "NAMESPACE_UNKNOWN"]);
  const noStore = await call(mf, { capture_sha: CID_SHA });
  t("store ABSENT is 400 BAD_STORE", [noStore.status, (await noStore.json()).reason], [400, "BAD_STORE"]);
  const numStore = await call(mf, { capture_sha: CID_SHA, store: 7 });
  t("store that is not a string is 400 BAD_STORE", [numStore.status, (await numStore.json()).reason],
    [400, "BAD_STORE"]);
  const notFound = await mf.dispatchFetch("http://pdf-worker/nope", { method: "GET" });
  t("a non-structure path is 404", notFound.status, 404);
  await mf.dispose();
}

/* ---- D-478: an unknown namespace is REFUSED BY NAME, never answered NOT_FOUND ---- */
console.log("\n--- D-478: *not found* is not *absent* — the namespace this member reads from is exactly `bio` or `scratch` ---");
{
  const mf = newMf();
  const bucket = await mf.getR2Bucket("CAPTURES");
  /* THE ARM THAT COSTS SOMETHING TO PRODUCE. An empty bucket refusing an unknown namespace proves NOTHING — the
     refusal and the absence are indistinguishable. So the bytes ARE put under the unknown prefix: if the member
     still spent the name on R2 it would find them and answer 200, and if the fence fired for the wrong reason
     (an empty bucket) this arm would go green for free. It must refuse a namespace whose bytes are right there. */
  await bucket.put(`biosmoke/captures/${CID_SHA}`, CID_BYTES);
  await bucket.put(KEY, CID_BYTES);
  const keysBefore = (await bucket.list()).objects.map((o) => o.key).sort();

  const unknown = await call(mf, { capture_sha: CID_SHA, store: "biosmoke" });
  const u = await unknown.json();
  t("store=biosmoke -> 400 NAMESPACE_UNKNOWN, naming what was asked and what exists",
    [unknown.status, u.reason, u.asked, u.namespaces], [400, "NAMESPACE_UNKNOWN", "biosmoke", ["bio", "scratch"]]);
  t("  and it is refused EVEN THOUGH the bytes sit under that very prefix — the fence is the NAME, not an empty bucket",
    (await bucket.get(`biosmoke/captures/${CID_SHA}`)) !== null, true);
  t("  a detail a reader can act on", (u.detail ?? "").length > 40, true);

  /* THE DISCRIMINATION THIS ROW IS ABOUT. The two answers must not be the same answer. */
  const absent = await call(mf, { capture_sha: "f".repeat(64), store: "scratch" });
  t("a capture genuinely absent from a namespace that EXISTS still reads 404 NOT_FOUND",
    [absent.status, (await absent.json()).reason], [404, "NOT_FOUND"]);
  t("  so the two are distinguishable on the wire: 400 NAMESPACE_UNKNOWN vs 404 NOT_FOUND",
    [unknown.status, absent.status], [400, 404]);

  /* THE LABEL IS A LITERAL PER ROW, NOT COMPOSED THROUGH A `${…}` SLOT, and that is M025's rule rather than
     taste: a driver that quotes a label it can only match by eating the slot goes stale the moment the value
     moves. This loop was written the composed way and `m025-arm-anchor-witness.test.mjs` caught it on this
     item's own first gate, naming all six rows. `agent-worker` §3 is the shape it should have had. */
  for (const [label, name] of [
    ["a hyphenated one (biosmoke-fleet) -> 400 NAMESPACE_UNKNOWN",        "biosmoke-fleet"],
    ["an underscored one (bio_smoke) -> 400 NAMESPACE_UNKNOWN",           "bio_smoke"],
    ["a case variant (Scratch) -> 400 NAMESPACE_UNKNOWN",                 "Scratch"],
    ["a case variant (BIO) -> 400 NAMESPACE_UNKNOWN",                     "BIO"],
    ["a namespace that is not a token (a b) -> 400 NAMESPACE_UNKNOWN",    "a b"],
    ["a namespace with a trailing space -> 400 NAMESPACE_UNKNOWN",        "scratch "],
  ]) {
    const r = await call(mf, { capture_sha: CID_SHA, store: name });
    t(label, [r.status, (await r.json()).reason], [400, "NAMESPACE_UNKNOWN"]);
  }

  /* OVER-STRICTNESS. Correct work must still pass: both real namespaces are accepted and answered. A fence
     tighter than its rule is an undeclared interface change wearing the costume of caution. */
  for (const [label, name] of [
    ["the namespace `bio` EXISTS and is answered, not refused",     "bio"],
    ["the namespace `scratch` EXISTS and is answered, not refused", "scratch"],
  ]) {
    await bucket.put(`${name}/captures/${CID_SHA}`, CID_BYTES);
    const r = await call(mf, { capture_sha: CID_SHA, store: name });
    const o = await r.json();
    t(label, [r.status, o.ok, o.tier], [200, true, 2]);
  }

  /* THE COPY AGES. This member cannot import the plane's `index.mjs`, so its set is a copy; the copy is pinned to
     the plane's own declaration READ FROM ITS SOURCE, never to a value retyped here. */
  const scratchName = (PLANE_INDEX.match(/^const SCRATCH = "([^"]+)";$/m) || [])[1];
  const planeSet = ((PLANE_INDEX.match(/^const NAMESPACES = Object\.freeze\(\[([^\]]*)\]\);$/m) || [])[1] || "")
    .split(",").map((x) => x.trim()).filter(Boolean)
    .map((x) => (x === "SCRATCH" ? scratchName : JSON.parse(x)));
  const memberSet = JSON.parse(((strip(readFileSync(WORKER_SRC, "utf8"))
    .match(/const NAMESPACES = Object\.freeze\((\[[^\]]*\])\);/) || [])[1]) || "null");
  t("the plane's namespace set was READ from its source (not an empty corpus)", planeSet.length >= 2, true);
  t("this member's namespace set EQUALS the plane's `namespaceGate` set", memberSet, planeSet);
  t("and the refusal lists exactly that set", u.namespaces, planeSet);

  t("R2 is byte-for-byte unchanged across every refusal above — a refusal writes nothing either",
    (await bucket.list()).objects.map((o) => o.key).sort(),
    [...new Set([...keysBefore, `bio/captures/${CID_SHA}`, `scratch/captures/${CID_SHA}`])].sort());
  await mf.dispose();
}

/* D-419 (2026-09-25) ADDED 15 ASSERTIONS BELOW, so this suite's baseline is now 82 pass / 0 fail, measured; the 67
   in the header above is D-478's figure on its own tree and is superseded here rather than edited in place. The
   row's negative control for the route (answer the whole page, and the crop-dimensions arm fails by name) is run
   through the plane in `bio-plane/test/d419-content-crop.test.mjs`, whose header holds its figures; it was not run
   against this suite. */
/* ---- D-419: POST /crop — the crop of a cited image, asked for over the member's surface ----
 *
 * `cropImage` (CPDF-18) is driven by name in `bio-plane/test/cpdf18-pdf-images.test.mjs`; what was never driven,
 * because it did not exist, is a ROUTE to it. These arms are the route's: the capture read from R2 as `/structure`
 * reads it, the extent handed to the module unchanged, the crop's bytes carried back as base64, the module's named
 * refusal at 422, and nothing written. The plane's half (op=contentcrop) is `bio-plane/test/d419-content-crop.test.mjs`.
 *
 * THE FIXTURE PAINTS TWO IMAGES ON ONE PAGE, and that is what makes the dimensions arm cost something: a DCT image
 * declared 40x30 and a 2x2 DeviceGray one. A route that answered the WHOLE PAGE (the row's negative control)
 * cannot hand back the 2x2 at its rectangle — the page is neither 2x2 nor one image. */
function imgPdf(objs) {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) {
      chunks.push(Buffer.from(`<< ${o.dict} /Length ${o.stream.length} >>\nstream\n`, "latin1"), o.stream,
                  Buffer.from("\nendstream\n", "latin1"));
    } else chunks.push(Buffer.from(o.body + "\n", "latin1"));
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}
const CROP_JPG = Buffer.from("\xff\xd8\xff\xe0D-419 fixture: a site plan\xff\xd9", "latin1");
const CROP_GREY = Buffer.from([0x00, 0x40, 0x80, 0xff]);
const CROP_PDF = imgPdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im1 4 0 R /Im2 5 0 R >> >> /Contents 6 0 R >>" },
  { num: 4, dict: "/Type /XObject /Subtype /Image /Width 40 /Height 30 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode", stream: CROP_JPG },
  { num: 5, dict: "/Type /XObject /Subtype /Image /Width 2 /Height 2 /ColorSpace /DeviceGray /BitsPerComponent 8", stream: CROP_GREY },
  { num: 6, dict: "", stream: Buffer.from("q 200 0 0 100 50 600 cm /Im1 Do Q\nq 100 0 0 100 300 100 cm /Im2 Do Q", "latin1") },
]);
const CROP_SHA = hex(CROP_PDF);
const cropCall = (mf, body) => mf.dispatchFetch("http://pdf-worker/crop", { method: "POST", body: JSON.stringify(body) });
console.log("\n--- D-419: POST /crop hands back the cited image, derived, and refuses by name ---");
{
  const mf = newMf();
  const bucket = await mf.getR2Bucket("CAPTURES");
  await bucket.put(`${STORE}/captures/${CROP_SHA}`, CROP_PDF);
  const before = (await bucket.list()).objects.map((o) => o.key).sort();

  const gr = await cropCall(mf, { capture_sha: CROP_SHA, store: STORE, extent: { kind: "image", page: 0, rect: [300, 100, 400, 200] } });
  const g = await gr.json();
  t("POST /crop of the grey image's rectangle is 200 and says it is a DERIVED crop of that extent",
    [gr.status, g.ok, g.derived, g.rendition, g.of], [200, true, true, "crop", { kind: "image", page: 0, rect: [300, 100, 400, 200] }]);
  t("D-419 crop dimensions: the grey image's own 2x2, not the page and not the other image", [g.width, g.height], [2, 2]);
  t("  and it names the bytes it cropped FROM — the capture's sha256", g.capture_sha256, CROP_SHA);
  const gBytes = Buffer.from(g.bytes_base64 || "", "base64");
  t("  the base64 decodes to exactly the bytes its file_sha256 names, and byte_length counts them",
    [hex(gBytes), gBytes.length], [g.file_sha256, g.byte_length]);

  const jr = await (await cropCall(mf, { capture_sha: CROP_SHA, store: STORE, extent: { kind: "image", page: 0, rect: [50, 600, 250, 700] } })).json();
  t("a DCT image's crop is the publisher's JPEG byte for byte, through the wire",
    [jr.route, jr.mediaType, Buffer.from(jr.bytes_base64 || "", "base64").equals(CROP_JPG), [jr.width, jr.height]],
    ["passthrough-dct", "image/jpeg", true, [40, 30]]);
  /* OVER-STRICTNESS: an extent carrying fields the module does not read (the row's `cited_as`, a null `part`) and a
     rectangle written corner-reversed is the same citation, and must crop. */
  const loose = await (await cropCall(mf, { capture_sha: CROP_SHA, store: STORE,
    extent: { kind: "image", cited_as: "bytes", part: null, page: 0, rect: [400, 200, 300, 100] } })).json();
  t("an extent as a content row stores it (cited_as, part: null), rect corner-reversed, still crops the same image",
    [loose.ok, loose.width, loose.height, loose.file_sha256], [true, 2, 2, g.file_sha256]);

  const noRect = await cropCall(mf, { capture_sha: CROP_SHA, store: STORE, extent: { kind: "image", page: 0 } });
  t("the rect DROPPED -> 422 RECT_REQUIRED, the module's own named refusal", [noRect.status, (await noRect.json()).reason], [422, "RECT_REQUIRED"]);
  const nowhere = await cropCall(mf, { capture_sha: CROP_SHA, store: STORE, extent: { kind: "image", page: 0, rect: [0, 0, 10, 10] } });
  t("a rectangle the page paints no image at -> 422 NO_IMAGE_AT_RECT", [nowhere.status, (await nowhere.json()).reason], [422, "NO_IMAGE_AT_RECT"]);
  const noExt = await cropCall(mf, { capture_sha: CROP_SHA, store: STORE });
  t("no extent at all -> 422 NOT_AN_IMAGE_EXTENT", [noExt.status, (await noExt.json()).reason], [422, "NOT_AN_IMAGE_EXTENT"]);
  const notPdf = await cropCall(mf, { capture_sha: CID_SHA, store: STORE, extent: { kind: "image", page: 0, rect: [0, 0, 1, 1] } });
  t("a capture absent from the namespace -> 404 NOT_FOUND, the same read /structure makes", [notPdf.status, (await notPdf.json()).reason], [404, "NOT_FOUND"]);
  const badNs = await cropCall(mf, { capture_sha: CROP_SHA, store: "biosmoke", extent: { kind: "image", page: 0, rect: [300, 100, 400, 200] } });
  t("the namespace fence holds on /crop too -> 400 NAMESPACE_UNKNOWN", [badNs.status, (await badNs.json()).reason], [400, "NAMESPACE_UNKNOWN"]);
  const getCrop = await mf.dispatchFetch("http://pdf-worker/crop", { method: "GET" });
  t("GET /crop is not the route (404)", getCrop.status, 404);
  const src = strip(readFileSync(WORKER_SRC, "utf8"));
  t("the SURFACE table declares crop as a non-mutating POST", /crop\s*:\s*\{[^}]*method:\s*"POST",\s*mutating:\s*false/.test(src), true);
  t("WRITES NOTHING: the CAPTURES key set is unchanged across every /crop call", (await bucket.list()).objects.map((o) => o.key).sort(), before);
  await mf.dispose();
}
{
  const mf = newMf({ MAX_PDF_BYTES: "100" });
  const bucket = await mf.getR2Bucket("CAPTURES");
  await bucket.put(`${STORE}/captures/${CROP_SHA}`, CROP_PDF);
  const over = await cropCall(mf, { capture_sha: CROP_SHA, store: STORE, extent: { kind: "image", page: 0, rect: [300, 100, 400, 200] } });
  const o = await over.json();
  t("a document over the envelope -> 413 OVER_ENVELOPE, declined by name rather than loaded", [over.status, o.reason, o.limit], [413, "OVER_ENVELOPE", 100]);
  await mf.dispose();
}

console.log(`\npdf-worker: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
