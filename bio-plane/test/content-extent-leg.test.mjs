/* NEGATIVE CONTROL: the eight arms live in `test/nc-rec84.mjs` and are re-run in one step with `node test/nc-rec84.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by cmp with a byte count printed and a minimum guarded (never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work). Declared before arming, and every one RUN — results recorded in this file's own report and in the item's report. (a) `baseline` — nothing armed; MUST be green, and it is the row that distinguishes eight-arms-working from eight-arms-broken. (b) `grammar` — THE CHECKER NEUTERED: in checks/bio-checks.mjs make `checkLegExtentGrammar` return immediately, so no extent grammar runs at either gate; a MALFORMED extent then LANDS and the arm MUST FAIL naming it, while the store-side arms (an unlanded kind, an unknown row) stay green — they are a different gate and the point of the split. (c) `unlanded` — in `CONTENT_EXTENT_KINDS` flip `sheet-cell` to `landed: true`; the "refused BY NAME as unlanded, never minted" arm MUST FAIL, and the content-row COUNT assertion beside it MUST FAIL TOO, because an unlanded arm admitted is an arm that mints. (d) `rowid` — in store.mjs neuter `#contentRowFor`'s `if (!row)` so an unknown content id resolves; the C-45.5 arm MUST FAIL BY NAME and nothing else may move. (e) `crossdoc` — neuter `#contentRowFor`'s `row.bundle_id !== targetId`; the C-45.6 arm MUST FAIL BY NAME. (f) `inquirypart` — in store.mjs's `#contentLegRefusals` neuter the `!p.isInfo` arm's condition to `false`; a leg naming a PART of an inquiry then lands and the arm MUST FAIL. (g) `vwriter` — THE ARM'S OWN ARM: in store.mjs's `INSERT INTO inquiry_basis_version_legs` pass `null` instead of `vContentId`; the version-leg writer arms MUST FAIL NAMING THE NULL COLUMN, and they must fail on the READ-BACK rather than on a value the insert was handed — `version_content[]` is selected out of the table for exactly this reason. (h) `overstrict` — the OVER-STRICTNESS direction: make `checkLegExtentGrammar` refuse a leg carrying NO extent at all (treat an absent `extent_kind` as malformed); every legacy-shaped leg in this suite and in the battery would then be refused, and the over-strictness arm MUST FAIL while every refusal arm above stays green — a fence tighter than its rule is not a safer fence, and an absent extent means the WHOLE DOCUMENT (Bob's 5.3, no `unstated`).
 *
 * REC-84 — IC-84 (1) and (2): the basis leg names its EXTENT in `bundle.md`
 * frontmatter, C-2.8 and C-25.10 admit the grammar through ONE checker, a named
 * content row is resolved or refused BY NAME, the VERSION-LEG WRITER fills
 * `inquiry_basis_version_legs.content_id`, and the investigative run's suggested
 * legs say `document`.
 *
 * WHAT THIS SUITE IS FOR, beyond the arms. REC-82 landed the `content` table and
 * the writer on the LIVE basis; the two halves it deliberately did not land are
 * the ones a reader cannot tell from "forgotten" without a suite that drives
 * them: the version-leg column arrived NULLABLE AND UNWRITTEN, and the extent
 * grammar was enforced at the WRITE and nowhere in the catalogue. Both are
 * driven here THROUGH `op=promote`, because a store-level test and a passing
 * battery are not evidence that a caller can reach a feature.
 *
 * THE TWO GATES ARE ASSERTED SEPARATELY AND THAT IS THE ITEM'S OWN SHAPE. The
 * catalogue judges what one document's bytes can answer (a kind nobody can
 * evaluate, a malformed id, a leg stating its referent twice); the store judges
 * what only the record holds (the page set, the chain, whether the named row
 * exists and is about this document). A suite that asserted only through
 * `op=promote` could not tell which gate fired, and the split is the thing most
 * likely to collapse in a later edit.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkInquiryBasis, basisVersionFindings, checkLegExtentGrammar,
         legExtent, legHasAuthoredExtent, legContentId, contentIdFor,
         CONTENT_ID_RE, CONTENT_EXTENT_CHECKS, CONTENT_EXTENT_KINDS,
         CONTENT_EXTENT_DOCUMENT_ONLY } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r84", MEMBER_TOKEN: "mem-r84", PROBE_TOKEN: "prb-r84",
              AI_TOKEN: "ai-r84", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r84") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r84") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const NOW = "2026-09-14T00:00:00Z";
const LATER = "2026-09-14T01:00:00Z";
const checks = (r) => [...new Set((r.findings || []).map((f) => f.check))].sort();
const codesOf = (r) => [...new Set((r.findings || []).map((f) => f.code).filter(Boolean))].sort();
const detail = (r) => (r.findings || []).map((f) => f.detail || f.message || "").join(" || ");

/* ------------------------------------------------------------- documents */

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];

/* THE EXTENT AS THE RESTRICTED GRAMMAR CARRIES IT — flat scalars on the leg,
   because an array element's properties are SCALARS at four spaces and a nested
   object does not parse at all (`versions.test.mjs` measures that directly).
   This is `legExtent`'s reading spelled out at the bytes, and block 1 asserts
   the parser needs no change to hold it. */
const extentLines = (l, pad = "    ") => [
  ...(l.kind ? [`${pad}extent_kind: ${l.kind}`] : []),
  ...(l.page !== undefined ? [`${pad}extent_page: ${l.page}`] : []),
  ...(l.rect ? [`${pad}extent_rect: [${l.rect.join(", ")}]`] : []),
  ...(l.eref ? [`${pad}extent_ref: "${l.eref}"`] : []),
  ...(l.cell ? [`${pad}extent_cell: "${l.cell}"`] : []),
  ...(l.cid ? [`${pad}content_id: "${l.cid}"`] : []),
];

const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
      `    role: ${l.role ?? "supports"}`, ...extentLines(l)])]
  : [];

/* The version block, three sibling arrays joined by name — `versions.test.mjs`'s
   own shape, reduced to what this item needs and carrying the extent fields. */
const versionLines = (versions) => {
  if (!versions || !versions.length) return [];
  const rows = versions.map((v) => [`  - name: "${v.name}"`,
    `    description: "${v.description}"`,
    `    relationship: "${v.relationship ?? "and"}"`,
    `    state: "suggested"`, `    derived_from: null`, `    hidden: false`,
    `    author: "ruth"`, `    at: "${NOW}"`].join("\n"));
  const grounds = versions.flatMap((v) => (v.grounds ?? []).map((g) =>
    [`  - version: "${v.name}"`, `    ground: "${g}"`,
     `    asserted_by: "ruth"`, `    at: "${NOW}"`].join("\n")));
  const legs = versions.flatMap((v) => (v.legs ?? []).map((l) =>
    [`  - version: "${v.name}"`, `    target: "${l.target}"`,
     `    role: "${l.role ?? "supports"}"`,
     ...(l.ground ? [`    ground: "${l.ground}"`] : []),
     ...extentLines(l)].join("\n")));
  return ["basis_versions:", ...rows,
    ...(grounds.length ? ["basis_version_grounds:", ...grounds] : []),
    ...(legs.length ? ["basis_version_legs:", ...legs] : [])];
};

const inquiryMd = (id, { refs = [], legs = [], versions = null } = {}) => ["---",
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
  ...legLines(legs), ...versionLines(versions),
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
const promote = async (id, text, type, { base = null, reading = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return post("promote", {
    bundleId: id, base,
    snapKey: `20260914T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files });
};
const HEAD = new Map();
const mustPromote = async (id, text, type, opts = {}) => {
  const r = await promote(id, text, type,
    { ...opts, base: opts.base !== undefined ? opts.base : (HEAD.get(id) ?? null) });
  if (r.ok === false)
    throw new Error(`promote ${id} was REFUSED and the arm expected it to land: ${JSON.stringify(r).slice(0, 900)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};
/* The refusal path, which must NOT throw — `mustPromote` is the wrong tool for
   an arm that expects a refusal, and REC-82 recorded a control reading -1/-1
   because a throwing helper stood where a named assertion belonged. */
const refusedPromote = async (id, text, type, opts = {}) => {
  const r = await promote(id, text, type,
    { ...opts, base: opts.base !== undefined ? opts.base : (HEAD.get(id) ?? null) });
  if (r.ok !== false) HEAD.set(id, r.bundleSha);
  return r;
};

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

/* ===================== 0. THE GROUND ==================================== */

console.log("\n--- 0. the ground: two captured documents with page sets, and an inquiry to rest on ---");

const SHA_A = sha("rec84-doc-a");
const SHA_B = sha("rec84-doc-b");
const DOC_A = "INFO-2026-8400-alpha";
const DOC_B = "INFO-2026-8400-beta";
const INQ_TARGET = "INQ-2026-8400-target";

await mustPromote(DOC_A, infoMd(DOC_A), "information",
  { reading: readingOf(SHA_A, scopedChain([0, 1, 2])) });
await mustPromote(DOC_B, infoMd(DOC_B), "information",
  { reading: readingOf(SHA_B, scopedChain([0, 1])) });
await mustPromote(INQ_TARGET, inquiryMd(INQ_TARGET), "inquiry");

const c0 = (await get("stats")).content;
t("the ground holds no content rows yet — nothing has cited anything", c0, 0);
/* THE CORPUS THIS SUITE REACHES, PRINTED. A headline assertion over an empty
   fixture has passed three times in this repository; the count is floored. */
console.log(`  corpus: 2 captured documents (page sets 3 and 2) + 1 inquiry target; `
          + `extent kinds in the grammar: ${Object.keys(CONTENT_EXTENT_KINDS).join(", ")}`);
t("the grammar names five kinds and exactly two of them are LANDED (the other three are REC-85's)",
  [Object.keys(CONTENT_EXTENT_KINDS).length,
   Object.entries(CONTENT_EXTENT_KINDS).filter(([, v]) => v.landed).map(([k]) => k).sort()],
  [5, ["document", "pdf-page"]]);

/* ===================== 1. THE FRONTMATTER GRAMMAR ======================= */

console.log("\n--- 1. the extent arrives as FLAT SCALARS and the restricted grammar already carries it ---");

/* THE PARSER NEEDED NO CHANGE AND THAT IS A MEASUREMENT, not an assumption: the
   restricted grammar reads an array element's four-space properties as scalars,
   so `extent_kind` / `extent_page` / `extent_rect` / `extent_ref` / `content_id`
   parse today. Measured through the real parser rather than asserted, because
   "the parser already does this" is exactly the kind of belief this project
   requires driven. */
const parsed = (await import("../checks/bio-checks.mjs")).parseFrontmatter(
  ["---", "id: INQ-2026-8400-x", "basis:",
   `  - target: ${DOC_A}`, "    role: supports",
   "    extent_kind: pdf-page", "    extent_page: 1",
   "    extent_rect: [10, 20, 100, 200]", '    extent_ref: "page 2, the table"',
   "---", ""].join("\n"));
t("MEASURED: the restricted frontmatter grammar carries the extent as flat scalars, unchanged",
  parsed.data?.basis?.[0],
  { target: DOC_A, role: "supports", extent_kind: "pdf-page", extent_page: 1,
    extent_rect: [10, 20, 100, 200], extent_ref: "page 2, the table" });
t("and `legExtent` reads exactly that into IC-1's shape",
  legExtent(parsed.data.basis[0]),
  { kind: "pdf-page", ref: "page 2, the table", page: 1, rect: [10, 20, 100, 200] });
t("a leg with NO extent field reads `document` and says it authored none (Bob 5.3, never `unstated`)",
  [legExtent({ target: DOC_A }).kind, legHasAuthoredExtent({ target: DOC_A })],
  ["document", false]);
t("an EMPTY extent_kind is not an authored extent either — the grammar writes '' for a bare key",
  [legExtent({ extent_kind: "" }).kind, legHasAuthoredExtent({ extent_kind: "" })],
  ["document", false]);

console.log("\n--- 1b. C-2.8 ADMITS THE EXTENT GRAMMAR, at the pure catalogue gate ---");

const pureBasis = (legs) => {
  const out = [];
  checkInquiryBasis({ id: "INQ-2026-8400-pure",
    references: legs.map((l) => ({ target: l.target })), basis: legs }, out, null, null);
  return out;
};

t("a malformed extent kind is refused BY C-2.8 over one document's bytes, with no store in sight",
  pureBasis([{ target: DOC_A, role: "supports", extent_kind: "pdf-pge" }])
    .filter((x) => x.check === "C-2.8" && /cannot evaluate/.test(x.message)).length, 1);
t("an UNLANDED arm is refused by name as unlanded rather than as unknown — a member citing a cell is not confused",
  /named in the grammar and this plane cannot yet evaluate/.test(
    pureBasis([{ target: DOC_A, role: "supports", extent_kind: "sheet-cell", extent_cell: "B14" }])
      .map((x) => x.message).join(" ")), true);
t("`dom` is refused BY NAME while no producer exists, at the catalogue too",
  /Nothing in this plane produces a dom address yet/.test(
    pureBasis([{ target: DOC_A, role: "supports", extent_kind: "dom" }])
      .map((x) => x.message).join(" ")), true);
t("a pdf-page extent with a non-integer page is refused",
  pureBasis([{ target: DOC_A, role: "supports", extent_kind: "pdf-page", extent_page: "two" }])
    .filter((x) => x.check === "C-2.8").length, 1);
t("a malformed content_id is refused BY C-2.8, and the shape is the minter's own 64 hex",
  [pureBasis([{ target: DOC_A, role: "supports", content_id: "not-an-id" }])
     .filter((x) => x.check === "C-2.8" && /is not a content id/.test(x.message)).length,
   CONTENT_ID_RE.test(contentIdFor("s", { kind: "document" }, null))],
  [1, true]);
t("a leg naming BOTH a content_id and an extent is refused: one fact written twice, and they can disagree",
  pureBasis([{ target: DOC_A, role: "supports", content_id: "a".repeat(64),
               extent_kind: "pdf-page", extent_page: 1 }])
    .filter((x) => x.check === "C-2.8" && /BOTH a content_id and an extent/.test(x.message)).length, 1);

/* THE OVER-STRICTNESS DIRECTION, AND IT IS THE HALF THAT MATTERS MOST HERE. The
   catalogue cannot see the record, so it must NOT answer the two questions only
   the store can — a page set and a chain. A pure check that refused a legal
   pdf-page leg would be a second gate holding a second answer, and every
   existing fixture with a portion citation would start failing `op=audit` while
   promoting perfectly well. */
t("OVER-STRICTNESS: a well-formed pdf-page leg is NOT refused by the pure catalogue, which holds no chain",
  pureBasis([{ target: DOC_A, role: "supports", extent_kind: "pdf-page", extent_page: 1 }])
    .filter((x) => /cannot evaluate/.test(x.message)).length, 0);
t("OVER-STRICTNESS: a leg with no extent at all raises nothing — an unstated part means the whole document",
  pureBasis([{ target: DOC_A, role: "supports" }])
    .filter((x) => x.check === "C-2.8").length, 0);
t("and the document-only context is a VALUE, so the skip is visible at the call site rather than implied",
  CONTENT_EXTENT_DOCUMENT_ONLY.known, false);

/* ===================== 2. THROUGH THE OP ================================ */

console.log("\n--- 2. the same grammar at op=promote: refused before anything lands, and nothing minted ---");

const INQ_BAD = "INQ-2026-8400-malformed";
const rBad = await refusedPromote(INQ_BAD,
  inquiryMd(INQ_BAD, { refs: [DOC_A], legs: [{ target: DOC_A, kind: "pdf-pge" }] }), "inquiry");
t("a malformed extent is REFUSED at the write, by C-2.8, through op=promote's own envelope",
  [rBad.ok, rBad.reason, checks(rBad)], [false, "BASIS_REFUSED", ["C-2.8"]]);
t("and nothing was minted for it", (await get("stats")).content, 0);

const INQ_CELL = "INQ-2026-8400-cell";
const rCell = await refusedPromote(INQ_CELL,
  inquiryMd(INQ_CELL, { refs: [DOC_A], legs: [{ target: DOC_A, kind: "sheet-cell", cell: "B14" }] }), "inquiry");
t("AN UNLANDED KIND IS REFUSED BY NAME (C-45.3's sentence at C-2.8) AND NEVER MINTED — REC-85's arm, not silently accepted",
  [rCell.ok, checks(rCell), /REC-85/.test(detail(rCell))], [false, ["C-2.8"], true]);
t("still nothing minted: an extent nobody can evaluate covers nothing and mints nothing",
  (await get("stats")).content, 0);

const INQ_OK = "INQ-2026-8400-ok";
const rOk = await mustPromote(INQ_OK,
  inquiryMd(INQ_OK, { refs: [DOC_A], legs: [{ target: DOC_A, kind: "pdf-page", page: 1,
                                              rect: [10, 20, 100, 200] }] }), "inquiry");
t("a well-formed pdf-page leg promotes and resolves to its content row",
  [rOk.ok, rOk.content?.length, rOk.content?.[0].extent_kind, rOk.content?.[0].minted],
  [true, 1, "pdf-page", true]);
const PAGE_ROW_A = rOk.content[0].content_id;

const INQ_PLAIN = "INQ-2026-8400-plain";
const rPlain = await mustPromote(INQ_PLAIN,
  inquiryMd(INQ_PLAIN, { refs: [DOC_A], legs: [{ target: DOC_A }] }), "inquiry");
t("a leg WITHOUT an extent promotes and resolves to the `document` row (Bob 5.3)",
  [rPlain.content?.length, rPlain.content?.[0].extent_kind], [1, "document"]);
const DOC_ROW_A = rPlain.content[0].content_id;
t("two rows: the page and the whole document are different referents of one document",
  [(await get("stats")).content, PAGE_ROW_A !== DOC_ROW_A], [2, true]);

/* ===================== 3. A NAMED ROW =================================== */

console.log("\n--- 3. a leg may NAME its row, and the two ways that name can be wrong are refused BY NAME ---");

const INQ_NAMED = "INQ-2026-8400-named";
const rNamed = await mustPromote(INQ_NAMED,
  inquiryMd(INQ_NAMED, { refs: [DOC_A], legs: [{ target: DOC_A, cid: PAGE_ROW_A }] }), "inquiry");
t("a leg naming an existing row resolves to exactly that row, and mints nothing",
  [rNamed.content?.[0].content_id === PAGE_ROW_A, rNamed.content?.[0].minted,
   (await get("stats")).content],
  [true, false, 2]);
t("and the row it resolved to is the PAGE row, so the leg's referent is the part and not the document",
  rNamed.content?.[0].extent_kind, "pdf-page");

const GHOST = "0".repeat(64);
const INQ_GHOST = "INQ-2026-8400-ghost";
const rGhost = await refusedPromote(INQ_GHOST,
  inquiryMd(INQ_GHOST, { refs: [DOC_A], legs: [{ target: DOC_A, cid: GHOST }] }), "inquiry");
t("A CONTENT ID WHOSE ROW DOES NOT EXIST IS REFUSED BY NAME — C-45.5, with its code and translation on the wire",
  [rGhost.ok, checks(rGhost), codesOf(rGhost),
   (rGhost.findings || [])[0]?.translation === CONTENT_EXTENT_CHECKS.CONTENT_ROW_UNKNOWN.translation],
  [false, ["C-45.5"], ["CONTENT_ROW_UNKNOWN"], true]);

/* A row that EXISTS and belongs to another document. This is the arm a
   shape-only check cannot reach and the one that matters: the id is perfectly
   well formed and the record holds it. */
const INQ_BROW = "INQ-2026-8400-brow";
const rBrow = await mustPromote(INQ_BROW,
  inquiryMd(INQ_BROW, { refs: [DOC_B], legs: [{ target: DOC_B, kind: "pdf-page", page: 0 }] }), "inquiry");
const PAGE_ROW_B = rBrow.content[0].content_id;
const INQ_CROSS = "INQ-2026-8400-cross";
const rCross = await refusedPromote(INQ_CROSS,
  inquiryMd(INQ_CROSS, { refs: [DOC_A], legs: [{ target: DOC_A, cid: PAGE_ROW_B }] }), "inquiry");
t("A ROW OF ANOTHER DOCUMENT IS REFUSED BY NAME — C-45.6: the leg and the part are about two documents",
  [rCross.ok, checks(rCross), codesOf(rCross)],
  [false, ["C-45.6"], ["CONTENT_ROW_NOT_THIS_TARGET"]]);

/* ===================== 4. AN INQUIRY HAS NO PARTS ======================= */

console.log("\n--- 4. a leg naming a PART of an inquiry is refused — an inquiry has no bytes (DEC-21) ---");

const INQ_PART = "INQ-2026-8400-part";
const rPart = await refusedPromote(INQ_PART,
  inquiryMd(INQ_PART, { refs: [INQ_TARGET], legs: [{ target: INQ_TARGET, kind: "pdf-page", page: 0 }] }),
  "inquiry");
t("a pdf-page extent on an INQUIRY leg is refused, and the sentence says why rather than numbering it",
  [rPart.ok, codesOf(rPart), /An inquiry has no bytes and no pages/.test(detail(rPart))],
  [false, ["CONTENT_EXTENT_UNREADABLE"], true]);

const INQ_PARTID = "INQ-2026-8400-partid";
const rPartId = await refusedPromote(INQ_PARTID,
  inquiryMd(INQ_PARTID, { refs: [INQ_TARGET], legs: [{ target: INQ_TARGET, cid: DOC_ROW_A }] }), "inquiry");
t("and naming a part of an inquiry BY ID meets the same refusal — the precise spelling is the same act",
  [rPartId.ok, codesOf(rPartId)], [false, ["CONTENT_EXTENT_UNREADABLE"]]);

const INQ_WHOLE = "INQ-2026-8400-wholeinq";
const rWhole = await mustPromote(INQ_WHOLE,
  inquiryMd(INQ_WHOLE, { refs: [INQ_TARGET], legs: [{ target: INQ_TARGET }] }), "inquiry");
t("OVER-STRICTNESS: a leg resting on the WHOLE inquiry is legal and its content_id is honestly absent",
  [rWhole.ok, rWhole.content === undefined], [true, true]);

/* ===================== 5. THE VERSION LEGS ============================== */

console.log("\n--- 5. C-25.10 admits the extent grammar at the VERSION's grain ---");

const pureVersions = (fm) => { const out = []; basisVersionFindings(fm, out); return out; };
const vfm = (legs) => ({ id: "INQ-2026-8400-pure-v",
  basis_versions: [{ name: "a reading", description: "A reading of the evidence for this.",
                     relationship: "and", state: "suggested", derived_from: null, hidden: false }],
  basis_version_legs: legs.map((l) => ({ version: "a reading", role: "supports", ...l })) });

t("a malformed extent on a VERSION leg is refused at C-25.10, over one document's bytes",
  pureVersions(vfm([{ target: DOC_A, extent_kind: "pdf-pge" }]))
    .filter((x) => x.check === "C-25.10" && /cannot evaluate/.test(x.message)).length, 1);
t("a malformed content_id on a version leg is refused at C-25.10",
  pureVersions(vfm([{ target: DOC_A, content_id: "short" }]))
    .filter((x) => x.check === "C-25.10").length, 1);
t("both at once on a version leg is refused at C-25.10",
  pureVersions(vfm([{ target: DOC_A, content_id: "b".repeat(64), extent_kind: "pdf-page", extent_page: 0 }]))
    .filter((x) => x.check === "C-25.10" && /BOTH a content_id and an extent/.test(x.message)).length, 1);
t("OVER-STRICTNESS: a version leg with no extent raises nothing at all",
  pureVersions(vfm([{ target: DOC_A }])).filter((x) => x.check === "C-25.10").length, 0);
/* READ WITH `?.` AND NOT `[0].message`, AND THAT IS A CONTROL FINDING RATHER
   THAN STYLE. The `grammar` arm neuters this very function, so the direct
   spelling threw `Cannot read properties of undefined` — the suite ended at that
   line, reported -1/-1, and every assertion AFTER it went unrun, including the
   arm's own MUST-PASS claim that the store's gate was untouched. REC-82 recorded
   the identical shape one item earlier (a throwing helper standing where a named
   assertion belonged). An assertion about a function must survive that function
   returning nothing, or the arm that breaks it cannot say what else it broke. */
t("ONE CHECKER, TWO CHECK IDS: the same function produces both, and the id is the only thing that differs",
  (() => { const a = [], b = [];
    checkLegExtentGrammar({ extent_kind: "nope" }, "x", "C-2.8", a);
    checkLegExtentGrammar({ extent_kind: "nope" }, "x", "C-25.10", b);
    return [a.length, b.length, a[0]?.message === b[0]?.message && a.length === 1,
            a[0]?.check ?? null, b[0]?.check ?? null]; })(),
  [1, 1, true, "C-2.8", "C-25.10"]);

console.log("\n--- 5b. THE VERSION-LEG WRITER: content_id populated, keyed exactly as the basis leg is ---");

const INQ_V = "INQ-2026-8400-versioned";
const rV = await mustPromote(INQ_V, inquiryMd(INQ_V, { refs: [DOC_A], versions: [{
  name: "the page reading", description: "This reading rests on one page of the report.",
  grounds: ["the page"],
  legs: [{ target: DOC_A, ground: "the page", kind: "pdf-page", page: 1, rect: [10, 20, 100, 200] },
         { target: DOC_A, ground: "the page" }] }] }), "inquiry");
/* READ BACK OUT OF THE TABLE — `version_content[]` is a SELECT after the
   projection, never the variable the INSERT was handed, which is what makes the
   `vwriter` arm able to fail. */
t("EVERY version leg carries a content_id, and NONE is null — the column arrived at REC-82 with no writer",
  [(rV.version_content || []).length,
   (rV.version_content || []).filter((r) => r.content_id === null).length],
  [2, 0]);
t("the page leg resolves to the SAME row a basis leg citing that passage got — one row, no second allocator",
  (rV.version_content || []).find((r) => r.ord === 0)?.content_id, PAGE_ROW_A);
t("the extentless version leg resolves to the DOCUMENT row, the same one a plain basis leg got",
  (rV.version_content || []).find((r) => r.ord === 1)?.content_id, DOC_ROW_A);
t("and nothing new was minted: both passages were already cited, so both were FOUND",
  (await get("stats")).content, 3);

const INQ_VNAMED = "INQ-2026-8400-vnamed";
const rVN = await mustPromote(INQ_VNAMED, inquiryMd(INQ_VNAMED, { refs: [DOC_A], versions: [{
  name: "the named reading", description: "This reading names the part it rests on outright.",
  grounds: ["the part"],
  legs: [{ target: DOC_A, ground: "the part", cid: PAGE_ROW_A }] }] }), "inquiry");
t("a version leg NAMING its row is taken at its word",
  (rVN.version_content || [])[0]?.content_id, PAGE_ROW_A);

const INQ_VGHOST = "INQ-2026-8400-vghost";
const rVG = await refusedPromote(INQ_VGHOST, inquiryMd(INQ_VGHOST, { refs: [DOC_A], versions: [{
  name: "the ghost reading", description: "This reading names a part nothing ever minted.",
  grounds: ["the part"],
  legs: [{ target: DOC_A, ground: "the part", cid: GHOST }] }] }), "inquiry");
t("A VERSION LEG WHOSE content_id NAMES NO ROW IS REFUSED BY NAME, under the version envelope",
  [rVG.ok, rVG.reason, checks(rVG), codesOf(rVG)],
  [false, "BASIS_VERSION_REFUSED", ["C-45.5"], ["CONTENT_ROW_UNKNOWN"]]);

const INQ_VOOB = "INQ-2026-8400-voob";
const rVO = await refusedPromote(INQ_VOOB, inquiryMd(INQ_VOOB, { refs: [DOC_B], versions: [{
  name: "the impossible page", description: "This reading cites a page the document does not have.",
  grounds: ["the page"],
  legs: [{ target: DOC_B, ground: "the page", kind: "pdf-page", page: 9 }] }] }), "inquiry");
t("and the page-set refusal reaches a version leg too — C-45.1, the store's own arm, at the version grain",
  [rVO.ok, checks(rVO), codesOf(rVO)],
  [false, ["C-45.1"], ["CONTENT_EXTENT_OUT_OF_RANGE"]]);

/* ===================== 6. THE FREEZE ==================================== */

console.log("\n--- 6. the referent is INSIDE the freeze, and every composition written before it is unmoved ---");

/* `op=basisversions` is keyed `id=`, and the first draft of this helper passed
   `target=` — which answered nothing and made every assertion below it
   BLIND-BY-CONSTRUCTION: `/leg_referent/.test(String(undefined))` is false, so
   the over-strictness arm passed over an empty answer. Recorded rather than
   quietly fixed, because it is the exact failure this repository has measured
   three times (a headline assertion passing over an empty corpus), and it was
   caught only because a sibling arm asked for the version BY NAME. The helper
   now THROWS on an answer it did not get, so the arms cannot pass over nothing. */
const composeOf = async (id, name) => {
  const a = await get("basisversions", `id=${encodeURIComponent(id)}&limit=1000`);
  const v = (a.versions || []).find((x) => x.name === name);
  if (!v) throw new Error(`op=basisversions returned no version '${name}' for ${id}: `
                        + `${JSON.stringify(a).slice(0, 400)}`);
  if (!v.composition) throw new Error(`version '${name}' came back with no composition`);
  return v;
};
/* A version whose leg is narrowed IN PLACE must be refused by C-25.11: the
   composition moved. Without the `leg_referent` line the plane would accept it
   silently, which is a reading changing under a member who already read it. */
const INQ_FREEZE = "INQ-2026-8400-freeze";
await mustPromote(INQ_FREEZE, inquiryMd(INQ_FREEZE, { refs: [DOC_A], versions: [{
  name: "first pass", description: "This reading rests on the whole report.",
  grounds: ["the report"], legs: [{ target: DOC_A, ground: "the report" }] }] }), "inquiry");
const rFreeze = await refusedPromote(INQ_FREEZE, inquiryMd(INQ_FREEZE, { refs: [DOC_A], versions: [{
  name: "first pass", description: "This reading rests on the whole report.",
  grounds: ["the report"],
  legs: [{ target: DOC_A, ground: "the report", kind: "pdf-page", page: 1 }] }] }), "inquiry");
t("NARROWING A VERSION LEG IN PLACE IS REFUSED BY THE FREEZE (C-25.11): a version is frozen once written",
  [rFreeze.ok, rFreeze.reason], [false, "VERSION_FROZEN"]);
t("and the refusal NAMES the field that moved rather than saying only that something did",
  /leg_referent/.test(JSON.stringify(rFreeze)), true);

/* OVER-STRICTNESS, and this is the arm that protects every version already in
   the record: a version whose legs name no extent must compose to a string with
   NO referent line at all, which is byte-identically what PL-1 froze. */
const INQ_STILL = "INQ-2026-8400-still";
await mustPromote(INQ_STILL, inquiryMd(INQ_STILL, { refs: [DOC_A], versions: [{
  name: "unchanged", description: "A reading that names no part of anything.",
  grounds: ["the report"], legs: [{ target: DOC_A, ground: "the report" }] }] }), "inquiry");
const still = await composeOf(INQ_STILL, "unchanged");
t("OVER-STRICTNESS: a version with no extent anywhere composes with NO referent line — every stored composition is unmoved",
  /leg_referent/.test(String(still?.composition ?? "")), false);
/* And re-promoting the identical bytes is not refused, which is the property a
   changed composition would have broken for every version in the record. */
const rAgain = await promote(INQ_STILL, inquiryMd(INQ_STILL, { refs: [DOC_A], versions: [{
  name: "unchanged", description: "A reading that names no part of anything.",
  grounds: ["the report"], legs: [{ target: DOC_A, ground: "the report" }] }] }), "inquiry",
  { base: HEAD.get(INQ_STILL) });
t("OVER-STRICTNESS: and re-promoting an extentless version still passes the freeze",
  rAgain.ok !== false, true);
if (rAgain.ok !== false) HEAD.set(INQ_STILL, rAgain.bundleSha);

/* ===================== 7. THE SUGGESTED LEGS ============================ */

console.log("\n--- 7. the investigative run's suggested legs say `document`, and say it in the bytes ---");

/* A REAL MEMBER, because `op=suggest` runs behind the admission gate and stamps
   its author from the SESSION rather than from the request (the same rule
   `asserted_by` takes). The extent default this block measures is written as a
   LITERAL and is the same whoever calls, which is the point: no caller reaches
   it, machine or member. */
const RUTH = await (async () => {
  const add = await post("memberadd", { memberId: "ruth", cover: "cover for ruth",
    role: "admin", capabilities: ["contribute", "publish"] }, "adm-r84");
  const en = await post("enroll", { invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" });
  if (!en.ok) throw new Error(`enroll: ${JSON.stringify(en)}`);
  const lg = await post("login", { role: "member:ruth", password: "ruth-passphrase-1" });
  if (!lg.token) throw new Error(`login: ${JSON.stringify(lg)}`);
  return lg.token;
})();

const INQ_SUG = "INQ-2026-8400-suggested";
await mustPromote(INQ_SUG, inquiryMd(INQ_SUG, { refs: [DOC_A] }), "inquiry");
const RUN = "RUN-2026-0914-rec84";
const opened = await post("airunopen", {
  run: RUN, contextType: "inquiry", contextId: INQ_SUG,
  label: "REC-84 fixture — the run whose suggested legs must say document", mode: "check",
  principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1", biasManifest: null,
  bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000 }, RUTH);
t("the investigative run is open, so the suggestion has a run to name", opened?.started, true);

const sug = await post("suggest", {
  target: INQ_SUG, name: "the run reading", kind: "basis-version",
  relationship: "and",
  description: "The run proposes the report as the basis for this question.",
  run: RUN,
  grounds: [{ ground: "the report" }],
  legs: [{ target: DOC_A, role: "supports", ground: "the report" }],
}, RUTH);
if (sug.ok === false) console.log("    SUGGEST REFUSAL:", JSON.stringify(sug).slice(0, 900));
t("op=suggest lands a reading", [sug.ok !== false, sug.code ?? null], [true, null]);
const sugV = await composeOf(INQ_SUG, "the run reading");
t("the suggested version is in the record", sugV?.name, "the run reading");
const sugPromoted = await get("stats");
t("and the run's leg minted (or found) the DOCUMENT row for the report — never a portion it did not look at",
  typeof sugPromoted.content === "number" && sugPromoted.content >= 3, true);

/* THE BYTES, because the default has to be VISIBLE and not merely effective:
   "the run cited the whole document" and "the run said nothing" must not be the
   same bytes. Read back through the audit surface's own image of the document. */
const sugText = (await get("image", `id=${encodeURIComponent(INQ_SUG)}`, RUTH))?.["bundle.md"] ?? "";
if (!sugText) throw new Error("op=image returned no bundle.md for the suggested inquiry — the byte arm "
                            + "below would otherwise pass over an empty string");
t("MEASURED IN THE BYTES: the emitted suggested leg carries `extent_kind: \"document\"`",
  /extent_kind: "document"/.test(String(sugText)), true);
t("and the run wrote exactly one leg, so the default is stated once per leg and not sprinkled",
  (String(sugText).match(/extent_kind: "document"/g) || []).length, 1);

/* ===================== 8. THE OVER-STRICTNESS SWEEP ===================== */

console.log("\n--- 8. the class: every leg-bearing shape the plane already writes still promotes ---");

/* A REGRESSION OVER THE SHAPES RATHER THAN OVER ONE FIXTURE. The class this item
   could break is "a leg written before the extent existed", and there are three
   spellings of it in the record: a bare basis leg, a graded basis leg, and a
   version leg. All three are driven, and the battery's own 187 other suites are
   the wider corpus — this arm is the one that names the class. */
const INQ_LEGACY = "INQ-2026-8400-legacy";
const rLegacy = await mustPromote(INQ_LEGACY, inquiryMd(INQ_LEGACY, {
  refs: [DOC_A, DOC_B, INQ_TARGET],
  legs: [{ target: DOC_A }, { target: DOC_B, role: "cuts_against" }, { target: INQ_TARGET }],
  versions: [{ name: "legacy shape", description: "Three legs, none of them naming a part.",
               grounds: ["all of it"],
               legs: [{ target: DOC_A, ground: "all of it" },
                      { target: INQ_TARGET, ground: "all of it" }] }] }), "inquiry");
t("OVER-STRICTNESS: a document with three extentless basis legs and two extentless version legs promotes",
  rLegacy.ok, true);
t("its information legs resolve to document rows and its inquiry leg to none, each stated",
  [(rLegacy.content || []).length,
   (rLegacy.version_content || []).map((r) => r.content_id === null)],
  [2, [false, true]]);

/* WHAT THIS SUITE CANNOT SEE, stated plainly. It drives the two LANDED arms
   (`document`, `pdf-page`); the other three kinds are refused as unlanded and
   REC-85 is what makes them evaluable, so no arm here can tell a correct
   `sheet-cell` reader from a missing one. It drives the catalogue and the store;
   it does not drive `op=audit`'s tally, and a C-2.8 finding's appearance THERE
   is asserted by `audit`'s own suites over their own corpora. And it measures
   the freeze through `op=basisversions`' served composition, so a change to the
   composition that both the writer and that read agreed on would be invisible
   to it — the `leg_referent` refusal arm above is what makes that direction
   loud, because the freeze compares a STORED string against a fresh assembly. */

/* THE FOOT. `mf.dispose()` is not optional here and the first draft omitted it:
   this suite opens an investigative RUN with a lease, and the process then never
   exited — a suite that prints its tally and hangs is indistinguishable from one
   still running, and the battery would have waited on it forever. The exit is on
   the suite's OWN RESULT and never under a conditional (`hygiene.test.mjs`
   catches that shape). */
console.log(`\ncontent-extent-leg: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
