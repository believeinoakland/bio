/* NEGATIVE CONTROL: the eight arms live in `test/nc-rec82.mjs` and are re-run in one step with `node test/nc-rec82.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by cmp with a byte count printed and a minimum guarded (never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work). Declared before arming, and every one RUN — results recorded in this file's own report and in the item's report. (a) `baseline` — nothing armed; MUST be green, and it is the row that distinguishes eight-arms-working from eight-arms-broken. (b) `oob` — in checks/bio-checks.mjs checkContentExtent, neuter the page-set comparison `e.page >= ctx.pageCount` to `false`; MUST fail the out-of-range arm BY NAME (C-45.1) and MUST NOT move any other refusal. (c) `nochain` — neuter `!(Array.isArray(ctx.chain) && ctx.chain.length)` to `false`; MUST fail the no-chain arm (C-45.2) alone. (d) `dom` — remove the `CONTENT_EXTENT_KIND_NO_PRODUCER` branch so `dom` falls through to the unknown-kind arm; MUST fail the by-name assertion (the code must be C-45.4 and not C-45.3) while the refusal itself still happens, which is the whole point of refusing it BY NAME. (e) `stale` — neuter `#markContentStale`'s UPDATE so a re-extraction marks nothing; MUST fail the stale arm, and MUST NOT make any row disappear, because the arm asserts BOTH that the row went stale AND that it was not deleted. (f) `address` — THE ARM'S OWN ARM: neuter the content-address hash so `contentIdFor` ignores the extent (returns a constant per capture); the two-citers-one-row assertion MUST FAIL, because a dedup that is true for every input is true for no reason. (g) `carry` — neuter the carry-forward map in store.mjs's projection so a re-promotion re-mints from the live chain; MUST fail the "an authored citation does not move when the document is re-read" arm, which is Bob's 5.8 ruling and the only thing standing between it and a silent re-point. (h) `overstrict` — the OVER-STRICTNESS direction: make the chain requirement apply to a `document` extent too; a `document` leg on a capture with no text layer would then be refused, and the over-strictness arm MUST FAIL while every refusal arm above stays green — a fence tighter than its rule is not a safer fence. */
/* RESULTS, run 2026-09-14 by the REC-82 worker, each arm alone. See the report and `nc-rec82.mjs`'s own printout. */

/* REC-82 / IC-83 / DEC-23 / D-164 — THE CONTENT ROW ON THE `pdf-page` AND
 * `document` ARMS: the table, the writer, the backfill, `stale`, purge and the
 * four catalogue refusals.
 *
 * WHAT IS BEING ASSERTED, and every one of them THROUGH `op=promote` /
 * `op=stats` / `op=purge` rather than against the store, because a store-level
 * test and a passing battery are not evidence that a caller can reach the
 * feature (`op=invitelook` shipped with a ReferenceError while 1,276 assertions
 * passed):
 *
 *   1. A WHOLE-DOCUMENT LEG MINTS A `document`-EXTENT ROW. Bob, 5.3: a citation
 *      with no stated part means the whole document and reads `document`, never
 *      `unstated`. So every leg has one target vocabulary.
 *   2. A `pdf-page` LEG MINTS A PAGE ROW, carrying the derivation cap asked
 *      about THAT EXTENT (D-252) rather than about the document.
 *   3. TWO CITERS OF ONE PASSAGE GET ONE ROW BY CONSTRUCTION. Two inquiries,
 *      one passage, one row — no allocator and no dedup pass. Arm (f) neuters
 *      the address to prove this assertion can fail.
 *   4. THE FOUR REFUSALS, each BY NAME and each driven through the op: an
 *      extent outside the capture's page set (C-45.1), an extent with no
 *      extraction chain (C-45.2), an unknown or unlanded kind (C-45.3), `dom`
 *      while no producer exists (C-45.4).
 *   5. RE-EXTRACTION MARKS THE ROW STALE, NEVER DELETES IT, and the authored
 *      edge still resolves and SAYS SO — and does not MOVE, which is Bob's 5.8.
 *   6. THE LEGACY BACKFILL is deterministic, because the id is a hash.
 *   7. PURGE CLEARS CONTENT ROWS IN BOTH ARMS (D-113).
 *   8. A MACHINE CREDENTIAL MAY MINT AND MAY NEVER ATTEST — C-35.10 UNCHANGED,
 *      asserted here so that "unchanged" is measured rather than assumed.
 *   9. OVER-STRICTNESS: a `document` leg on a capture with NO text layer still
 *      mints. The row is a REFERENT, not a claim.
 *  10. THE SYNCHRONOUS SHA-256 the content address needs AGREES WITH
 *      `crypto.subtle` over a length sweep. Driven, not trusted: its first
 *      draft mis-padded every input of length 55 mod 64 and agreed with itself
 *      perfectly, which is why the sweep pins the block boundaries by name.
 *
 * WHAT IS DELIBERATELY NOT HERE. The reads (`earnedBasisRegistry` keyed by row,
 * the `content` read op) are REC-83's; the frontmatter and version-leg grammar
 * are REC-84's; the `sheet-cell` / `slide-shape` / `doc-para` arms are REC-85's
 * and live in `content-extent-arms.test.mjs`. This paragraph used to end "and
 * are asserted here ONLY as refusals, which is what they are today" — CORRECTED
 * 2026-09-14 when REC-85 landed them, together with the (4b) pair below, whose
 * correction carries its own reasoning at the site.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkAttestation } from "../src/textchain.mjs";
import { sha256HexSync, contentIdFor, checkContentExtent, legExtent,
         canonicalExtent, describeExtent, CONTENT_EXTENT_CHECKS,
         CONTENT_EXTENT_KINDS, MACHINE_AUTHOR_PREFIX } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r82", MEMBER_TOKEN: "mem-r82", PROBE_TOKEN: "prb-r82",
              AI_TOKEN: "ai-r82", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r82") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r82") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const NOW = "2026-09-14T00:00:00Z";
const LATER = "2026-09-14T01:00:00Z";
const codes = (r) => (r.findings || []).map((f) => f.check).sort();
const detail = (r) => (r.findings || []).map((f) => f.detail).join(" || ");
/* REC-84: the WIRE CODE, beside the check number. A refusal now carries both —
   the RULE that refused it and the NAME it was refused by — and the arms below
   assert both rather than collapsing them. */
const codeNames = (r) => [...new Set((r.findings || []).map((f) => f.code).filter(Boolean))].sort();

/* ------------------------------------------------------------- documents */

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];

/* The extent arrives as FLAT SCALARS on the leg, because the restricted
   frontmatter grammar carries no nested object inside an array element. That
   spelling is REC-84's to bless as C-2.8 grammar; it is exercised here because
   the WRITER has to be drivable through the op it lives on, and a writer nobody
   can reach is a mechanism believed on its existence. */
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
      `    role: ${l.role ?? "supports"}`,
      ...(l.kind ? [`    extent_kind: ${l.kind}`] : []),
      ...(l.page !== undefined ? [`    extent_page: ${l.page}`] : []),
      ...(l.rect ? [`    extent_rect: [${l.rect.join(", ")}]`] : []),
      ...(l.eref ? [`    extent_ref: "${l.eref}"`] : []),
      ...(l.cell ? [`    extent_cell: "${l.cell}"`] : [])])]
  : [];

const inquiryMd = (id, { refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "",
  "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

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
const promote = async (id, text, type, { base = null, register = [], reading = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return post("promote", {
    bundleId: id, base,
    snapKey: `20260914T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register });
};
/* The CAS base, tracked from the promote response rather than read back — the
   response is the authority on what it just wrote, and a read-back would be a
   second answer waiting to disagree with it. */
const HEAD = new Map();
const mustPromote = async (id, text, type, opts = {}) => {
  const r = await promote(id, text, type,
    { ...opts, base: opts.base !== undefined ? opts.base : (HEAD.get(id) ?? null) });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

/* A D-252 SCOPED chain: a three-page document whose pages each name themselves,
   which is what gives this capture a PAGE SET the record can actually see. It is
   the only shape that does — nothing in this plane persists a PDF page count
   (D-345), and this suite measures the mechanism as built rather than the one
   the design would prefer. */
const scopedChain = (pages, cap = "C") => [
  { step: "pixels", extent: { kind: "pages", pages } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap, confidence: { basis: "none" },
    extent: { kind: "pages", pages } },
];
const readingOf = (captureSha, chain) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW,
             entities: [], facts: {},
             ...(chain === undefined ? {} : { text_source: chain }) } });

/* ===================== 0. THE DOCUMENTS AND THEIR CAPTURES ============== */

console.log("\n--- 0. the ground: captured documents, one with a page set and one with no text at all ---");

const SHA_PAGED = sha("doc-with-a-page-set");
const SHA_BARE = sha("doc-with-no-text-layer");
const DOC_PAGED = "INFO-2026-8200-paged";
const DOC_BARE = "INFO-2026-8200-bare";
const DOC_NOCAP = "INFO-2026-8200-uncaptured";

await mustPromote(DOC_PAGED, infoMd(DOC_PAGED), "information",
  { reading: readingOf(SHA_PAGED, scopedChain([0, 1, 2])) });
/* A capture the record holds and has NEVER READ: no chain at all. This is the
   ordinary condition of a freshly acquired scan, not an edge case. */
await mustPromote(DOC_BARE, infoMd(DOC_BARE), "information",
  { reading: readingOf(SHA_BARE, undefined) });
await mustPromote(DOC_NOCAP, infoMd(DOC_NOCAP), "information");

const s0 = await get("stats");
t("the store starts with no content rows", [s0.content, s0.contentStale], [0, 0]);

/* ===================== 1. THE DOCUMENT ARM ============================= */

console.log("\n--- 1. a whole-document leg mints a document-extent row (Bob 5.3: never `unstated`) ---");

const INQ_DOC = "INQ-2026-8200-whole";
const rDoc = await mustPromote(INQ_DOC,
  inquiryMd(INQ_DOC, { refs: [DOC_PAGED], legs: [{ target: DOC_PAGED }] }), "inquiry");
t("the leg names no extent and the writer reports a `document` row",
  [rDoc.content?.length, rDoc.content?.[0].extent_kind, rDoc.content?.[0].minted,
   rDoc.content?.[0].carried, rDoc.content?.[0].stale],
  [1, "document", true, false, false]);
t("the row's human form is DERIVED and says what it is",
  rDoc.content?.[0].says, "the whole document, as this record holds it");
const DOC_ROW = rDoc.content[0].content_id;
t("the content id is a sha256 hex string", /^[0-9a-f]{64}$/.test(DOC_ROW || ""), true);
t("one content row exists", (await get("stats")).content, 1);

/* ===================== 2. THE pdf-page ARM ============================= */

console.log("\n--- 2. a pdf-page leg mints a page row, with the cap asked about THAT extent (D-252) ---");

const INQ_PAGE = "INQ-2026-8200-page";
const rPage = await mustPromote(INQ_PAGE,
  inquiryMd(INQ_PAGE, { refs: [DOC_PAGED],
    legs: [{ target: DOC_PAGED, kind: "pdf-page", page: 1, rect: [10, 20, 100, 200] }] }), "inquiry");
t("a page leg mints its own row, distinct from the document row",
  [rPage.content?.length, rPage.content?.[0].extent_kind,
   rPage.content?.[0].content_id !== DOC_ROW],
  [1, "pdf-page", true]);
t("the derived human form counts pages from ONE for a reader, not from zero",
  rPage.content?.[0].says, "page 2, a region of it, as this record holds it");
const PAGE_ROW = rPage.content[0].content_id;
t("two content rows exist — a document is content too, and so is a page of it",
  (await get("stats")).content, 2);

/* ===================== 3. TWO CITERS, ONE ROW ========================== */

console.log("\n--- 3. two citers of one passage get ONE row by construction (no allocator) ---");

const INQ_PAGE2 = "INQ-2026-8200-page-too";
const rPage2 = await mustPromote(INQ_PAGE2,
  inquiryMd(INQ_PAGE2, { refs: [DOC_PAGED],
    legs: [{ target: DOC_PAGED, kind: "pdf-page", page: 1, rect: [10, 20, 100, 200],
             eref: "page 2, the table" }] }), "inquiry");
t("a SECOND inquiry citing the same passage FINDS the row rather than minting one",
  [rPage2.content?.[0].content_id === PAGE_ROW, rPage2.content?.[0].minted],
  [true, false]);
t("and the store still holds exactly two content rows", (await get("stats")).content, 2);
/* The two citers worded the human reference differently and are still citing one
   passage — which is why `ref` is deliberately NOT part of the address. */
t("a differently-worded human reference does not fork the row",
  contentIdFor("s", { kind: "pdf-page", page: 1, ref: "page 2, the table" }, [{ step: "layer" }])
  === contentIdFor("s", { kind: "pdf-page", page: 1, ref: "top of page two" }, [{ step: "layer" }]),
  true);
/* And a rect given the other way round is the same region. An inverted spelling
   forking the row is the failure `normRect`'s own hazard points at, mirrored. */
t("an inverted rect is the same region and not a second row",
  contentIdFor("s", { kind: "pdf-page", page: 1, rect: [10, 20, 100, 200] }, null)
  === contentIdFor("s", { kind: "pdf-page", page: 1, rect: [100, 200, 10, 20] }, null),
  true);
t("but a DIFFERENT page is a different row",
  contentIdFor("s", { kind: "pdf-page", page: 1 }, null)
  !== contentIdFor("s", { kind: "pdf-page", page: 2 }, null), true);

/* ===================== 4. THE FOUR REFUSALS, BY NAME ==================== */

console.log("\n--- 4. the four refusals, each driven THROUGH op=promote and each named ---");

const refuseLeg = async (id, leg, target = DOC_PAGED) => promote(id,
  inquiryMd(id, { refs: [target], legs: [{ target, ...leg }] }), "inquiry");

const rOob = await refuseLeg("INQ-2026-8200-oob", { kind: "pdf-page", page: 9 });
t("(1) an extent outside the capture's page set is REFUSED BY NAME",
  [rOob.ok, rOob.reason, codes(rOob)], [false, "BASIS_REFUSED", ["C-45.1"]]);
t("    and the refusal names the page set it was checked against",
  /3 page\(s\) \(0-2\).*page 9/.test(detail(rOob)), true);

const rNoChain = await refuseLeg("INQ-2026-8200-nochain", { kind: "pdf-page", page: 0 }, DOC_BARE);
t("(2) an extent with no extraction chain is REFUSED",
  [rNoChain.ok, codes(rNoChain)], [false, ["C-45.2"]]);

/* ---------------------------------------------------------------------------
 * CORRECTED 2026-09-14 BY REC-84, NEVER EXEMPTED, AND THE REASON IS THE RULE
 * CHANGE ITSELF.
 *
 * Arms (3) and (4a-c) asserted a CHECK NUMBER of `C-45.x` for a MALFORMED
 * EXTENT. When REC-82 wrote them that was the only gate that could judge one:
 * the extent grammar ran at the WRITE and nowhere in the catalogue, so the
 * store's own arm was the first and only thing to see a bad kind.
 *
 * IC-84 MOVED THE GATE. The extent grammar is now part of the LEG grammar —
 * `checkInquiryBasis` (C-2.8) and `basisVersionFindings` (C-25.10) run it over
 * one document's bytes, at the catalogue AND at the write, through the same
 * `checkContentExtent` these arms exercise directly one block up. So a
 * malformed extent is now refused by the LEG rule and never reaches the store's
 * arm, and the number a member sees is the leg grammar's.
 *
 * WHAT IS NOT SUPERSEDED, and is why these arms are corrected rather than
 * deleted: `dom` must still be refused BY NAME rather than as an unknown kind,
 * and an unlanded arm by name rather than as a typo. That distinction is what
 * arms (3) and (4b) exist for, and it now lives in the CODE — which travels on
 * the finding, carries the canned translation, and is minted in exactly the
 * place it always was. Each arm therefore asserts BOTH halves: the rule that
 * refused it, and the name it was refused by.
 *
 * Every arm below was RUN in both shapes: red against REC-82's expectation on
 * the REC-84 tree, green after correction, and `nc-rec84.mjs`'s `grammar` arm
 * (which neuters the new gate) shows the store's own C-45 arms still standing
 * behind it.
 * ------------------------------------------------------------------------- */
const rDom = await refuseLeg("INQ-2026-8200-dom", { kind: "dom" });
t("(3) `dom` is REFUSED BY NAME while no producer exists — the leg grammar's rule, the content family's name",
  [rDom.ok, codes(rDom), codeNames(rDom)], [false, ["C-2.8"], ["CONTENT_EXTENT_NO_PRODUCER"]]);
t("    and its canned translation travels with it, so the code is named to a member and not merely numbered",
  (rDom.findings || [])[0]?.translation === CONTENT_EXTENT_CHECKS.CONTENT_EXTENT_NO_PRODUCER.translation, true);

const rUnknown = await refuseLeg("INQ-2026-8200-unknown", { kind: "paragraph-ish" });
t("(4a) an UNKNOWN kind covers nothing and mints nothing",
  [rUnknown.ok, codes(rUnknown), codeNames(rUnknown)], [false, ["C-2.8"], ["CONTENT_EXTENT_UNREADABLE"]]);
/* CORRECTED 2026-09-14 BY REC-85, NEVER EXEMPTED, and the correction is the
   whole reason this pair is kept rather than deleted. As REC-82 wrote it, this
   leg (`sheet-cell` with a cell and no sheet) was refused because the ARM had
   not landed — `CONTENT_EXTENT_KINDS['sheet-cell'].landed` was false — and the
   assertion pinned that sentence by name so an unlanded arm could not be
   silently admitted. REC-85 landed the arm, so the old assertion is now WRONG
   ABOUT THE REASON while being right about the outcome, which is exactly the
   shape a test has to be corrected out of rather than left to pass by accident.

   The leg is STILL REFUSED, and at REC-84's own check id and code — it names a
   cell and no sheet, which is not an address — and that is what this pair now
   pins: the same fixture, the same relay through C-2.8, the reason moved from
   "this plane cannot evaluate this kind" to "this is not a well-formed cell
   address". Keeping the fixture unchanged is deliberate: it measures that
   landing the arm did not turn an incomplete address into an accepted one,
   which is the direction that would have mattered.

   RESOLVED AT THE REC-85 x REC-84 MERGE, 2026-09-14, and NEITHER SIDE ALONE WAS
   RIGHT: REC-84's shape wins (the finding relays through C-2.8 and `codeNames`
   reports the underlying code — its landing, untouched here) and REC-85's reason
   wins (the arm landed, so "refused for being unlanded" is now a false sentence).
   Taking either side whole would have left one of those two wrong. The arm's own
   in-range/out-of-range behaviour is `content-extent-arms.test.mjs`. */
const rUnlanded = await refuseLeg("INQ-2026-8200-cell", { kind: "sheet-cell", cell: "B7" });
t("(4b) a LANDED arm still refuses an incomplete address — a cell with no sheet is not an address",
  [rUnlanded.ok, codes(rUnlanded), codeNames(rUnlanded)], [false, ["C-2.8"], ["CONTENT_EXTENT_UNREADABLE"]]);
t("     and it is refused for naming no sheet rather than for being an unlanded kind (REC-85 landed it)",
  [/names which sheet, as the workbook spells it/.test(detail(rUnlanded)),
   /named in the grammar and this plane cannot yet/.test(detail(rUnlanded))], [true, false]);
const rNoPage = await refuseLeg("INQ-2026-8200-nopage", { kind: "pdf-page" });
t("(4c) a pdf-page extent naming no page is unreadable, not page zero",
  [rNoPage.ok, codes(rNoPage), codeNames(rNoPage)], [false, ["C-2.8"], ["CONTENT_EXTENT_UNREADABLE"]]);

t("no refused promotion minted anything", (await get("stats")).content, 2);

/* Every refusal carries its canned translation with it (DEC-49), which is what
   makes it named to a member rather than merely numbered. */
t("each refusal's code has a canned translation in the catalogue",
  Object.values(CONTENT_EXTENT_CHECKS).every((r) => typeof r.translation === "string"
    && r.translation.length > 80 && typeof r.where === "string"), true);

/* ===================== 5. OVER-STRICTNESS ============================== */

console.log("\n--- 5. OVER-STRICTNESS: a document leg on a capture with no text layer STILL MINTS ---");

const INQ_BARE = "INQ-2026-8200-bare-doc";
/* `promote` AND NOT `mustPromote`, DELIBERATELY, and it is the over-strictness
   arm's own requirement rather than a style choice. `mustPromote` THROWS on a
   refusal, which ends the module — so under the `overstrict` control arm the
   suite died at this line and the harness reported `-1 pass, -1 fail` instead of
   the one named assertion failing. That reading was correct and useless: an
   over-strictness arm has to show WHICH correct work the tighter fence breaks,
   and a suite that aborts says only that something did. Measured on the first
   run of `nc-rec82.mjs overstrict`, 2026-09-14, and corrected here. */
const rBare = await promote(INQ_BARE,
  inquiryMd(INQ_BARE, { refs: [DOC_BARE], legs: [{ target: DOC_BARE }] }), "inquiry");
t("a whole-document leg on an UNREAD capture mints — the row is a referent, not a claim",
  [rBare.ok, rBare.content?.[0].extent_kind, rBare.content?.[0].minted],
  [true, "document", true]);
t("and its derivation cap is UNDETERMINED rather than invented",
  checkContentExtent({ kind: "document" }, { chain: null, pageCount: null }), null);
t("a document leg on a document with NO CAPTURE AT ALL is still legal, and mints nothing",
  await (async () => {
    const id = "INQ-2026-8200-nocap";
    const r = await promote(id, inquiryMd(id, { refs: [DOC_NOCAP], legs: [{ target: DOC_NOCAP }] }),
      "inquiry");
    return [r.ok, r.content === undefined];
  })(), [true, true]);
t("but a PART of a document this record holds no bytes of is refused",
  await (async () => {
    const r = await refuseLeg("INQ-2026-8200-nocap-part", { kind: "pdf-page", page: 0 }, DOC_NOCAP);
    return [r.ok, codes(r)];
  })(), [false, ["C-45.2"]]);

/* ===================== 6. RE-EXTRACTION: STALE, NOT DELETED ============ */

console.log("\n--- 6. re-extraction marks the row stale, never deletes it, and the edge does not move ---");

const beforeRe = await get("stats");
/* A better engine re-reads the SAME capture. The chain moves; the bytes do not. */
await mustPromote(DOC_PAGED, infoMd(DOC_PAGED), "information",
  { reading: readingOf(SHA_PAGED, scopedChain([0, 1, 2], "B")) });
const afterRe = await get("stats");
t("nothing was deleted — the row count is unchanged",
  afterRe.content, beforeRe.content);
t("and the rows minted against the OLD chain now read stale",
  afterRe.contentStale > 0, true);

/* THE AUTHORED EDGE DOES NOT MOVE (Bob, 5.8). Re-promote the CITING inquiry,
   which re-projects every leg: the referent must be the SAME row, now stale and
   saying so — never a freshly minted row against a transcription the member
   never saw. */
const rAfter = await mustPromote(INQ_PAGE,
  inquiryMd(INQ_PAGE, { refs: [DOC_PAGED],
    legs: [{ target: DOC_PAGED, kind: "pdf-page", page: 1, rect: [10, 20, 100, 200] }] }), "inquiry");
t("the citation still points at the row it was authored against, carried not re-minted",
  [rAfter.content?.[0].content_id === PAGE_ROW, rAfter.content?.[0].carried,
   rAfter.content?.[0].minted], [true, true, false]);
t("the edge still RESOLVES and says the document has since been re-read",
  [rAfter.content?.[0].stale,
   /re-read and the text may have changed/.test(rAfter.content?.[0].says || "")], [true, true]);
t("and re-projecting minted no new row", (await get("stats")).content, afterRe.content);

/* ===================== 7. NARROWING IS AN AUTHORED ACT ================= */

console.log("\n--- 7. a member NARROWING a citation is the one act that DOES move the referent (5.3) ---");

const rNarrow = await mustPromote(INQ_DOC,
  inquiryMd(INQ_DOC, { refs: [DOC_PAGED],
    legs: [{ target: DOC_PAGED, kind: "pdf-page", page: 2, eref: "page 3, the table" }] }), "inquiry");
t("narrowing from the whole document to a page mints a new row and does not carry the old one",
  [rNarrow.content?.[0].extent_kind, rNarrow.content?.[0].carried,
   rNarrow.content?.[0].content_id !== DOC_ROW], ["pdf-page", false, true]);
t("and the OLD document row is not deleted — nothing rewrites a first-class row",
  (await get("stats")).content > afterRe.content, true);

/* ===================== 8. THE MACHINE FENCE, UNCHANGED ================= */

console.log("\n--- 8. a machine credential may MINT and may never ATTEST (C-35.10, unchanged) ---");

/* CORRECTED 2026-09-14 (SK-7), AND THE PARAGRAPH THIS REPLACES WAS WRONG IN A
   WAY WORTH KEEPING. It read: *"driving it through op=attesttext with a machine
   token answers NOT_AUTHENTICATED (C-38.1) from the credential layer BEFORE
   checkAttestation is ever reached, so an op-level arm would be asserting the
   token check and reporting it as the attestation fence."* That was measured
   with `ai-r82` — a string that is not a credential at all, so of course it
   answered NOT_AUTHENTICATED. With a REAL minted `ai` credential the op IS
   reached, and SK-7 measured what happened there: the store took the attestor
   from the request BODY, so C-35.10 fired only for a caller that named itself a
   machine, and the same credential naming a member had its attestation LAND in
   that member's name. The op-level arm was not impossible; it was never driven,
   and the belief that it could not be driven is why.
   SK-7 stamps the attestor server-side and drives every credential class
   through the op in `content-machine-mint.test.mjs` §4. THIS suite keeps the
   arm it should keep — C-35.10 asserted UNCHANGED against the catalogue
   function both doors call, which is REC-82's own obligation and is a different
   proposition from "the op enforces it". */
/* A machine identity in the spelling the CONTROL PLANE actually mints
   (`MACHINE_AUTHOR_PREFIX`), taken from the catalogue rather than typed. A
   hand-typed one is how the first draft of this arm asserted nothing at all:
   `ai:run-1` is not a machine identity by this record's own definition, so
   `checkAttestation` correctly answered null and the arm would have read as a
   pass of the wrong proposition had it not thrown. REC-46's eleven-copies
   finding, arriving in a suite instead of in source. */
const attMachine = checkAttestation({ member: `${MACHINE_AUTHOR_PREFIX}run-1`, at: NOW,
  extent: { kind: "page", page: 0 } });
t("attesting as a machine identity is refused, by the code it has always been refused by",
  [attMachine.ok, attMachine.code, attMachine.check],
  [false, "TEXT_ATTEST_MACHINE", "C-35.10"]);
t("and a member attesting the same extent is not",
  checkAttestation({ member: "hollis", at: NOW, extent: { kind: "page", page: 0 } }), null);
/* AND THE ARM THIS ONE ALWAYS WAS, now labelled honestly (SK-7): `ai-r82` is
   not a credential this plane holds, so what is measured here is the TOKEN
   CHECK refusing an unrecognised string — which is worth asserting and is not
   the attestation fence. The attestation fence at the op is driven in
   `content-machine-mint.test.mjs` §4, through credentials that authenticate. */
t("an UNRECOGNISED token is refused by the credential layer, before any store fence is reached — "
+ "this asserts C-38.1's door and NOT C-35.10, which the arm above asserts where it lives",
  await (async () => {
    const r = await post("attesttext",
      { captureSha: SHA_PAGED, member: `${MACHINE_AUTHOR_PREFIX}run-1`,
        extent: { kind: "page", page: 0 } }, "ai-r82");
    return r.ok;
  })(), false);
t("and nothing in the content family duplicates that fence",
  Object.keys(CONTENT_EXTENT_CHECKS).some((k) => /MACHINE|ATTEST/.test(k)), false);

/* ===================== 9. THE ADDRESS ITSELF =========================== */

console.log("\n--- 9. the synchronous SHA-256 the address needs, DRIVEN against crypto.subtle ---");

{
  const enc = new TextEncoder();
  const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
  /* THE BLOCK BOUNDARIES ARE PINNED BY NAME. The first draft of `sha256HexSync`
     mis-padded exactly the inputs of length 55 mod 64 — a spurious empty block,
     which is valid-looking padding that is not SHA-256's — and it agreed with
     itself for every one of them. A sweep that hashed "abc" would have passed. */
  const lens = [0, 1, 54, 55, 56, 63, 64, 65, 118, 119, 120, 127, 128, 129, 200];
  let agree = 0;
  for (const n of lens) {
    const v = "a".repeat(n);
    if (hex(await crypto.subtle.digest("SHA-256", enc.encode(v))) === sha256HexSync(v)) agree++;
  }
  t(`sha256HexSync agrees with crypto.subtle across every block boundary (${lens.length} lengths)`,
    agree, lens.length);
  t("including the non-ASCII case, where the byte length is not the string length",
    sha256HexSync("pagina 14, oberste Halfte"),
    hex(await crypto.subtle.digest("SHA-256", enc.encode("pagina 14, oberste Halfte"))));
  t("the empty string hashes to the value this repository already recognises",
    sha256HexSync(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
}
t("the address is stable across calls — it is a pure function of its inputs",
  contentIdFor("cap", { kind: "pdf-page", page: 3 }, [{ step: "layer" }])
  === contentIdFor("cap", { kind: "pdf-page", page: 3 }, [{ step: "layer" }]), true);
t("a MOVED chain is a different address — which is why a re-extraction is a new row",
  contentIdFor("cap", { kind: "pdf-page", page: 3 }, [{ step: "layer" }])
  !== contentIdFor("cap", { kind: "pdf-page", page: 3 }, [{ step: "ocr", engine: "t" }]), true);
t("no chain and an EMPTY chain are different addresses — two different facts, never collapsed",
  contentIdFor("cap", { kind: "document" }, null)
  !== contentIdFor("cap", { kind: "document" }, []), true);

/* ===================== 10. THE GRAMMAR'S OWN DEFAULTS ================== */

console.log("\n--- 10. the leg reader: absent means `document`, and `unstated` is not a value ---");

t("a leg with no extent fields reads `document`", legExtent({ target: "X" }).kind, "document");
t("an EMPTY extent_kind reads `document` too, never a blank that covers nothing",
  legExtent({ extent_kind: "" }).kind, "document");
t("`unstated` is not in the vocabulary at all (Bob, 5.3)",
  Object.prototype.hasOwnProperty.call(CONTENT_EXTENT_KINDS, "unstated"), false);
t("`dom` is not in the vocabulary either — it is refused BY NAME, not by omission",
  [Object.prototype.hasOwnProperty.call(CONTENT_EXTENT_KINDS, "dom"),
   checkContentExtent({ kind: "dom" }, {}).check], [false, "C-45.4"]);
t("the canonical extent of a document is one fixed string, whatever else the leg carries",
  canonicalExtent(legExtent({ extent_kind: "document", extent_page: 4, extent_ref: "x" })),
  canonicalExtent({ kind: "document" }));
t("describeExtent prefers the member's own words when they authored them",
  describeExtent({ kind: "pdf-page", page: 13, ref: "page 14, top half" }), "page 14, top half");

/* ===================== 11. PURGE, BOTH ARMS (D-113) ==================== */

console.log("\n--- 11. purge clears content rows in BOTH arms (D-113) ---");

const beforePurge = (await get("stats")).content;
t("there are content rows to take", beforePurge > 0, true);
/* PER-BUNDLE: purging the DOCUMENT takes the addresses into it. The content row
   carries the document's bundle_id, not the citing inquiry's — the row is the
   leg's REFERENT and the document is what it is about. */
/* `op=purge` refuses unless the caller NAMES the store it resolved to, so a
   purge can never land somewhere the caller did not mean. */
const pOne = await get("purge", `confirm=bio&bundleId=${DOC_PAGED}`, "adm-r82");
t("the per-bundle arm reports the content rows it took",
  [pOne.ok, pOne.before.content - pOne.after.content > 0], [true, true]);
t("and the rows addressing OTHER documents survive it",
  (await get("stats")).content > 0, true);
/* WHOLE-STORE: scope ALL and nothing left behind. */
const pAll = await get("purge", `confirm=bio`, "adm-r82");
t("the whole-store arm reports scope ALL and clears every content row",
  [pAll.ok, pAll.scope, pAll.after.content, pAll.after.contentStale], [true, "ALL", 0, 0]);

/* ===================== 12. THE LEGACY BACKFILL ========================= */

console.log("\n--- 12. a legacy leg is backfilled to its document row, deterministically ---");

/* THE BACKFILL IS DETERMINISTIC BECAUSE THE ID IS A HASH, and that is asserted
   as a PROPERTY rather than by running a migration: the id a legacy leg would be
   backfilled to is the id its next promotion mints, computed from the same
   inputs by the same function. Re-promote the document and the inquiry into the
   purged store and the SAME address comes back. */
/* The store was purged to empty above, so every bundle is a CREATION again and
   the tracked head must not be offered as a base. */
HEAD.clear();
await mustPromote(DOC_PAGED, infoMd(DOC_PAGED), "information",
  { reading: readingOf(SHA_PAGED, scopedChain([0, 1, 2])) });
const rReborn = await mustPromote("INQ-2026-8200-reborn",
  inquiryMd("INQ-2026-8200-reborn", { refs: [DOC_PAGED], legs: [{ target: DOC_PAGED }] }), "inquiry");
t("the document row minted in a freshly purged store has the id it had before",
  rReborn.content?.[0].content_id, DOC_ROW);
t("which is what makes the legacy backfill a pure function and not a migration",
  contentIdFor(SHA_PAGED, { kind: "document" }, scopedChain([0, 1, 2])), DOC_ROW);

/* THE LEGACY SHAPE, DRIVEN. A leg promoted while the record held NO capture of
   its target carries `content_id` NULL — which is exactly the state every leg
   written before this column existed is in. When the document is later captured,
   the leg's next projection mints the `document` row it should always have had,
   at the id `contentIdFor` answers for it, with no migration having run.
   *
   * WHAT THIS DOES NOT DRIVE — AND THE GAP IS NOW CLOSED, WHICH IS RECORDED HERE
   * RATHER THAN QUIETLY DELETED (CLAUDE.md: correct a superseded statement and
   * say why the old one was wrong). This paragraph used to read "the OTHER half
   * of the backfill — `Store.ensureLegContent`, which does the same thing on
   * FIRST READ rather than on next promotion — has no caller yet, because the
   * reads are REC-83's … its BEHAVIOUR is undriven in this battery". That was
   * true when REC-82 landed and is FALSE as of REC-83, which wired the call
   * into `op=earnedbasis`'s leg pass and drives it end to end in
   * `test/content-reads.test.mjs` §5 — including the arm (`nc-rec83.mjs
   * unwired`) that deletes the call and shows this battery going red by name.
   * What THIS suite still does not drive is unchanged: it asserts the backfill's
   * ARITHMETIC as a property (the id a legacy leg would get is the id its next
   * promotion mints), and the read-path BEHAVIOUR is one file over. */
const LEG_LATE = "INQ-2026-8200-late-capture";
const DOC_LATE = "INFO-2026-8200-captured-later";
await mustPromote(DOC_LATE, infoMd(DOC_LATE), "information");
const rLate1 = await mustPromote(LEG_LATE,
  inquiryMd(LEG_LATE, { refs: [DOC_LATE], legs: [{ target: DOC_LATE }] }), "inquiry");
t("a leg on an uncaptured document lands with NO referent — undetermined, stated",
  rLate1.content, undefined);
const SHA_LATE = sha("captured-after-the-leg-was-written");
await mustPromote(DOC_LATE, infoMd(DOC_LATE), "information",
  { reading: readingOf(SHA_LATE, scopedChain([0, 1])) });
const rLate2 = await mustPromote(LEG_LATE,
  inquiryMd(LEG_LATE, { refs: [DOC_LATE], legs: [{ target: DOC_LATE }] }), "inquiry");
t("once the document is captured the leg's next projection mints its document row",
  [rLate2.content?.length, rLate2.content?.[0].extent_kind, rLate2.content?.[0].minted,
   rLate2.content?.[0].carried], [1, "document", true, false]);
t("at exactly the id the backfill function answers for it — no migration, a hash",
  rLate2.content?.[0].content_id, contentIdFor(SHA_LATE, { kind: "document" }, scopedChain([0, 1])));

/* ===================== FOOT ============================================ */

console.log(`\n  ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
