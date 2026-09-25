/* REC-218 — A CSV READING'S DIALECT, PERSISTED ON THE ACQUIRE DOCUMENT.
 *
 * FW-23's entry finds the delimiter and the encoding by signature and emits
 * them as `dialect` on `structure()` and `text()`; the acquire wire then built
 * the reading from a NAMED key list that did not include it, so the dialect was
 * FOUND AND DISCARDED and a re-read could not say which dialect it read (the
 * measured failure this row moves; IC-283's stated residue). BOB #33 ruled
 * option (b) at 2026-09-24 21:55Z: a `reading.dialect` key of its OWN,
 * `{delimiter, encoding}`, on the acquire document — not inside
 * `container_extent` — and suited to any text format with a decoding choice.
 *
 * WHAT THIS SUITE MEASURES, through the ops and nothing else: REAL bodies
 * served as `text/csv`, acquired through `op=acquire`, promoted through
 * `op=promote`, and read back through `op=reading`. Every body is built HERE
 * byte by byte, so the delimiter and the encoding are the FIXTURE'S OWN ground
 * truth and not an equality the code under test produced for itself.
 *
 * THE ROW'S PREMISE, CORRECTED RATHER THAN BUILT ON. The accepts-when reads "a
 * semicolon-delimited latin-1 CSV's acquire document reads `reading.dialect`
 * with both". At the code (964da679) FW-23's encoding signature has NO latin-1
 * outcome, deliberately: a high byte with no BOM that is not valid UTF-8 is
 * ENCODING UNDETERMINED (BOB #32's design — `0x96` is an en dash in
 * windows-1252 and n-tilde in Mac Roman, so the byte narrows the encoding and
 * does not tell it). So a latin-1 body reads BOTH KEYS, the delimiter NAMED
 * and the encoding NULL with its reason — and that is what is asserted. A
 * latin-1 body with no high byte is indistinguishable from US-ASCII and reads
 * as such, which is true of its bytes. Naming latin-1 would be this record
 * guessing, which the design refuses.
 *
 * WHAT IT CANNOT SEE: a real semicolon or latin-1 body. M-144 measured the
 * corpus (166 `.csv` keys) and none carried either, so both are FIXTURE ONLY.
 */
/* NEGATIVE CONTROL: three arms and a baseline in `test/nc-rec218.mjs`, re-runnable in one step with `node test/nc-rec218.mjs [arm]` from `bio-plane/`; each arm edits ONE real source ALONE, declares before it runs what MUST fail and what MUST NOT, checks BOTH halves, and restores from a uniquely-named per-arm pristine copy in the session scratchpad verified by sha256 AND by content with a byte count printed and a floor guarded. (1) `droppersist` — THE ROW'S DECLARED ARM: the wire keeps the dialect and never writes it onto the reading (what the record held before this item). MUST FAIL the acquire arms and the read-back arm BY NAME; MUST NOT move the HTML/PDF absence arms. (2) `inextent` — write the dialect INSIDE `container_extent` instead of beside it (the option BOB #33 did not take). MUST FAIL the acquire and read-back arms and the beside-not-inside arm; MUST NOT move the absence arms. (3) `guessencoding` — OVER-CLAIM: the projection fills a null encoding with "latin-1". MUST FAIL the undetermined-encoding arm and its read-back; MUST NOT move the determined bodies. (4) `wiresource` — drop the FORMAT WIRE's own source (`readDialect = readingDialect(i2text.dialect)`), so only the intake slot answers. MUST FAIL the wire arm and the two-sources arm; MUST NOT move the intake arms. OVER-STRICTNESS: `formats-csv` and `formats` (the registry) must be UNMOVED by every arm. RUN 2026-09-25 by the REC-218 worker, ALL FOUR AS DECLARED, 0 held-open assertions broken in any arm, siblings unmoved under every arm, every restore verified by sha256 AND `cmp` with a floor guarded (`src/index.mjs` 860,229 B sha256 392ad4f6216a…, `src/formats.mjs` 14,290 B sha256 082945811732…): baseline dialect 20/0 · csv 75/0 · registry 35/0 GREEN; droppersist 12/12 declared (12 failing); inextent 6/6 (14 — every dialect-reading arm, as the key is gone from the reading); wiresource 2/2 (2); guessencoding 2/2 (2). ONE CAME BACK WRONG ON THE FIRST RUN AND IS KEPT AT ITS SITE: `droppersist` did not fire the two-sources arm, because its first spelling compared `d && {...}` and two ABSENT dialects compared equal — an equality that costs nothing. The ASSERTION was the defect and was strengthened to require both present. */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { withSurfacingRun } from "./surfacing-run.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { csvEntry } from "../src/csv.mjs";
import { readingDialect } from "../src/formats.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* ---- the fixtures, built byte by byte ---- */
const latin1 = (s) => Uint8Array.from([...s].map((c) => c.charCodeAt(0) & 0xff));
const utf8Bom = (s) => new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode(s)]);
/* Semicolon-delimited, LATIN-1: "é" is the single byte 0xE9, which is not a
   valid UTF-8 sequence on its own. */
const SEMI_LATIN1 = latin1("nom;ville;montant\nRené;Oakland;12\nJosé;Berkeley;30\n");
/* Semicolon-delimited, UTF-8 with a BOM: both halves determinable. */
const SEMI_UTF8 = utf8Bom("name;city;amount\nRené;Oakland;12\nJosé;Berkeley;30\n");
/* AMBIGUOUS: comma and semicolon each occur a consistent, non-zero number of
   times on every line — the signature is TIED and names both. */
const TIED = latin1("a,b;c\nd,e;f\ng,h;i\n");
/* SERVED AS `application/csv` (FW-23's synonym): not a `text/*` type, so the plane
   does NOT read it as text at intake and it reaches the FORMAT WIRE and the entry's
   own text() — the second of the two sources the dialect can come from. MEASURED
   while building this suite: it is the ONLY route there. A `text/csv` body within
   PROFILE_TEXT_MAX (8 MiB) is read at intake, and one over it is streamed in 8 MiB
   PARTS, which neither path reads (`multipart`) — so a `text/csv` body never meets
   the entry at acquire at all (D-593 carries that). */
const WIRE = utf8Bom("id;name;amount\n1;Ren\u00e9;12\n2;Jos\u00e9;30\n");
const HTML = "<!doctype html><html><head><title>Calendar</title></head><body><p>No dialect here.</p></body></html>";

const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec218", MEMBER_TOKEN: "mem-rec218", PROBE_TOKEN: "prb-rec218",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const bin = (b, ct) => new Response(b, { headers: { "content-type": ct } });
    if (u.pathname === "/semi-latin1.csv") return bin(SEMI_LATIN1, "text/csv");
    if (u.pathname === "/semi-utf8.csv") return bin(SEMI_UTF8, "text/csv; charset=utf-8");
    if (u.pathname === "/tied.csv") return bin(TIED, "text/csv");
    if (u.pathname === "/wire.csv") return bin(WIRE, "application/csv");
    if (u.pathname === "/calendar.html") return bin(HTML, "text/html; charset=utf-8");
    return new Response("unscripted", { status: 500 });
  },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=mem-rec218`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=mem-rec218&${qs}`)).json());
const acquire = async (path) => (await (await mf.dispatchFetch(
  "http://x/api/?op=acquire&token=mem-rec218",
  { method: "POST", body: JSON.stringify({ locator: "https://www.oaklandca.gov" + path,
                                           authority: "City of Oakland" }) })).json());

const NOW = "2026-09-25T00:00:00Z";
const LATER = "2026-09-25T01:00:00Z";
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
let snapSeq = 0;
const mustPromote = async (id, reading) => {
  const text = infoMd(id);
  const prov = JSON.stringify({ documents: [reading] });
  const r = await post("promote", {
    bundleId: id, base: null,
    snapKey: `20260925T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    /* CORRECTED at the c22-batch29 union (CONDUCT #22), never exempted: this item was cut before D-563, whose C-86.3 refuses an envelope title the held document contradicts; the envelope title `Bundle <id>` is dropped as D-563 dropped it in its own fixtures, and promote derives it from the document. */
    meta: { object_type: "information", group: "believe-in-oakland",
            current_state: "collected", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: [] });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  return r;
};
const halves = (d) => (d ? [d.delimiter, d.encoding] : "NO DIALECT");

/* ===================== 1. ACQUIRE: the dialect is ON the reading ===================== */
console.log("\n--- 1. op=acquire: a csv reading carries `dialect`, a key of its own ---");

const semiL = (await acquire("/semi-latin1.csv")).document;
const semiU = (await acquire("/semi-utf8.csv")).document;
const tied = (await acquire("/tied.csv")).document;
/* The corpus this suite reaches, printed and floored: a headline assertion over
   an empty fixture has passed three times in this repository. */
const corpus = [semiL, semiU, tied].filter((d) => d && d.reading && d.profile);
console.log(`  corpus: ${corpus.length} csv bodies acquired (${SEMI_LATIN1.length} B latin-1 semicolon, `
  + `${SEMI_UTF8.length} B utf-8+BOM semicolon, ${TIED.length} B tied)`);
t("all three csv bodies acquired and were profiled as FORMAT csv (floor: 3)",
  corpus.map((d) => d.profile.format && d.profile.format.format), ["csv", "csv", "csv"]);

t("THE ROW'S ARM — the semicolon latin-1 body's acquire document reads `reading.dialect` with BOTH keys",
  semiL.reading && semiL.reading.dialect
    ? ["delimiter" in semiL.reading.dialect, "encoding" in semiL.reading.dialect] : "NO DIALECT",
  [true, true]);
t("its delimiter is NAMED semicolon and its encoding UNDETERMINED (null), never guessed as latin-1",
  halves(semiL.reading.dialect), ["semicolon", null]);
t("and the undetermined half carries the entry's own REASON",
  semiL.reading.dialect ? semiL.reading.dialect.undetermined : "NO DIALECT", ["encoding_undetermined"]);
t("the reason's evidence rides beside it (the encoding signals name the byte that could not be told)",
  semiL.reading.dialect ? semiL.reading.dialect.signals.encoding.some((s) => /not part of a valid utf-8/.test(s)) : "NO DIALECT",
  true);
t("a determinable body reads both halves NAMED, each with its confidence",
  semiU.reading.dialect
    ? [...halves(semiU.reading.dialect), semiU.reading.dialect.confidence.delimiter,
       semiU.reading.dialect.confidence.encoding, semiU.reading.dialect.undetermined]
    : "NO DIALECT",
  ["semicolon", "utf-8", "certain", "certain", []]);
t("THE AMBIGUOUS ARM — a tied signature reads the delimiter UNDETERMINED with its reason, never a comma",
  tied.reading.dialect ? [tied.reading.dialect.delimiter, tied.reading.dialect.undetermined] : "NO DIALECT",
  [null, ["delimiter_undetermined_tied"]]);
t("and the tie NAMES both candidates in its signal rather than picking one",
  tied.reading.dialect ? tied.reading.dialect.signals.delimiter.some((s) => /comma/.test(s) && /semicolon/.test(s)) : "NO DIALECT",
  true);
t("BESIDE, NOT INSIDE (BOB #33 option (b)): the container extent carries no dialect",
  [semiL, semiU, tied].map((d) => !!(d.reading.container_extent && "dialect" in d.reading.container_extent)),
  [false, false, false]);
t("the persisted key set is the PROJECTION's, not the entry's object verbatim",
  semiU.reading.dialect ? Object.keys(semiU.reading.dialect).sort() : "NO DIALECT",
  ["confidence", "delimiter", "encoding", "signals", "undetermined"]);

/* ===================== 2. READ BACK THROUGH THE OP ===================== */
console.log("\n--- 2. op=promote then op=reading: the dialect is PERSISTED and readable on the capture's read ---");

await mustPromote("INFO-2026-9218-semi-latin1", semiL);
await mustPromote("INFO-2026-9218-semi-utf8", semiU);
await mustPromote("INFO-2026-9218-tied", tied);
const rL = await get("reading", `sha256=${encodeURIComponent(semiL.capture.sha256)}`);
const rU = await get("reading", `sha256=${encodeURIComponent(semiU.capture.sha256)}`);
const rT = await get("reading", `sha256=${encodeURIComponent(tied.capture.sha256)}`);
t("the three persisted readings are found", [rL.found, rU.found, rT.found], [true, true, true]);
const pd = (r) => (r && r.reading && r.reading.dialect) || null;
t("THE READ-BACK ARM — each reads its dialect back THROUGH THE OP, as acquired",
  [halves(pd(rL)), halves(pd(rU)), halves(pd(rT))],
  [["semicolon", null], ["semicolon", "utf-8"], [null, "us-ascii"]]);
t("and each undetermined half reads back WITH its reason",
  [pd(rL) && pd(rL).undetermined, pd(rT) && pd(rT).undetermined],
  [["encoding_undetermined"], ["delimiter_undetermined_tied"]]);

/* ===================== 3. ABSENCE IS STATED, NOT INVENTED ===================== */
console.log("\n--- 3. a reading no decoding-choice entry produced carries NO dialect key ---");

const html = (await acquire("/calendar.html")).document;
t("an HTML page acquires with the key ABSENT (no entry with a decoding choice read it)",
  ["dialect" in html.reading, html.reading.dialect], [false, undefined]);

/* ===================== 4. TWO SOURCES, ONE BUILDER ===================== */
console.log("\n--- 4. the format wire's source and the intake source state ONE dialect ---");

const wire = (await acquire("/wire.csv")).document;
t("the `application/csv` body TOOK THE FORMAT WIRE (its reading carries the wire's container extent, "
  + "which an intake read never does)",
  wire && wire.reading && wire.reading.container_extent
    ? [wire.profile.format.format, wire.reading.container_extent.levels] : "NO EXTENT",
  ["csv", ["sheets", "images"]]);
t("THE WIRE ARM — a csv read by the format wire carries the dialect its own text() emitted",
  wire && wire.reading ? halves(wire.reading.dialect) : "NO READING", ["semicolon", "utf-8"]);
t("and on the wire the container extent still carries NO dialect: beside, not inside",
  wire && wire.reading && wire.reading.container_extent
    ? "dialect" in wire.reading.container_extent : "NO EXTENT", false);
/* BOTH MUST BE PRESENT: this assertion's first spelling compared the two with
   `d && {...}` and so read EQUAL when both were ABSENT — two missing dialects
   agree on nothing, and nc-rec218's `droppersist` arm caught it passing over a
   record that kept neither. Kept at its site rather than smoothed. */
const sansSignals = (d) => (d && typeof d === "object" ? JSON.stringify({ ...d, signals: null }) : null);
const wireD = sansSignals(wire && wire.reading && wire.reading.dialect);
const intakeD = sansSignals(semiU.reading && semiU.reading.dialect);
t("the wire's source and the intake source state the SAME dialect for the same head (semicolon, utf-8 BOM)",
  [wireD !== null, intakeD !== null, wireD === intakeD], [true, true, true]);
/* The slot and text() over the SAME bytes, projected by the SAME function:
   byte-identical, for every fixture above. Not an equality the code produces
   for free — the slot walks no records and text() walks them all. */
const same = [];
for (const b of [SEMI_LATIN1, SEMI_UTF8, TIED]) {
  const viaText = readingDialect((await csvEntry.text(b)).dialect);
  const viaSlot = readingDialect(await csvEntry.dialect(b));
  same.push(JSON.stringify(viaText) === JSON.stringify(viaSlot));
}
t("the entry's `dialect` slot and its text() state the SAME dialect for each of the 3 bodies", same, [true, true, true]);
t("an empty body has no signature, and the slot says so with null rather than a dialect",
  csvEntry.dialect(new Uint8Array(0)), null);

await mf.dispose();
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
