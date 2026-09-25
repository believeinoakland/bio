/* NEGATIVE CONTROL: the six arms live in `test/nc-rec83.mjs` and are re-run in one step with `node test/nc-rec83.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by cmp with a byte count printed and a minimum guarded (never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work). Declared before arming, and every one RUN — results recorded in this file's own RESULTS line and in the item's report. (a) `baseline` — nothing armed; MUST be green, and it is the row that distinguishes six-arms-working from six-arms-broken. (b) `docattest` — in src/store.mjs `Store.#contentTarget`, make the `document` arm answer `{ page: 0 }` instead of `{}`, so a PAGE attestation over page 0 would then cover a whole-document row; the assertion that a page attestation does NOT raise a `document` row's ceiling MUST FAIL, and the assertion that a DOCUMENT attestation DOES raise it MUST STAY GREEN — the arm is driven in both directions because a target that covers nothing would also pass the first half. (c) `fixedkey` — in src/store.mjs `contentRead`, neuter the unknown-parameter refusal (`const unknown = []`); the predicate arm and the paging arm MUST FAIL, and the plain fixed-key read MUST STAY GREEN. (d) `portion` — in src/store.mjs `#contentStanding`, answer a PORTION row's connection axis from the whole document (`r.extent_kind === "document"` -> `true`, so every row borrows `connectionByBundle`); the UNDETERMINED assertions MUST FAIL — this is Bob's 5.1 ruling and the statement IS the assertion, so an arm that leaves them green would mean the suite is testing something else. (e) `unwired` — in src/store.mjs `earnedBasis`, delete the `#backfillLegContent` call; the legacy-leg arm MUST FAIL BY NAME, reporting a leg still carrying NULL after the read that was supposed to mint its row — which is the gap `content-extent.test.mjs` declared and left open for this item. (f) `pin` — THE OVER-STRICTNESS DIRECTION, and its held-open half is the whole point: a `document` leg's earned basis is pinned field-for-field AND by sha256 digest against the answer MEASURED on the pristine pre-item tree (`test/rec83-baseline-probe.mjs`, run against `origin/main` at 8f2023f — a hand copy agrees for free, so the literal in this file is a printout). The arm makes `#contentEarned` MUTATE the `earned.connection` entry it was handed instead of copying it, which is the ordinary way a new reader silently changes what an old one answers; the pinned comparison and its digest MUST FAIL and every content-grain assertion MUST STAY GREEN. The over-strictness ASSERTIONS that must survive every arm above are separate and live in section 7: an inquiry with no legs asked about a candidate target still gets the pre-item answer with NO content block at all, which is the path the write path, the ratification gate and the shipped composer are all on. */
/* RESULTS, run 2026-09-14 by the REC-83 worker, each arm ALONE, every restore byte-identical by sha256 AND cmp (1,947,657 bytes, sha256 ffd7b2553f99… each time): baseline 69/0 green · docattest 66/3 · fixedkey 65/4 · portion 65/4 · unwired 57/12 · pin 67/2 — ALL SIX AS DECLARED on the final tree. TWO CAME BACK WRONG ON THE FIRST RUN AND BOTH ARE RECORDED AT THEIR SITES RATHER THAN SMOOTHED: (1) `docattest`'s declared held-open half was an assertion the arm ALSO breaks — it pinned `by` as `["rosa"]`, and the arm makes the page attestation cover the document row so `by` gains "hollis"; the direction claim is now the RAISING itself and the `by` membership is a third declared failure. (2) `unwired` read `-1 pass / -1 fail` because the suite indexed `earned.content` directly and THREW a TypeError when the arm left it absent — no assertion ran, the module ended, and two of six declared failures were visible; the read is now defensive and the arm reports all six. REC-82's `overstrict` arm found the identical throw-instead-of-fail shape one item earlier. */

/* REC-83 / IC-84 (3) and (4) / IC-83's "What a leg may now claim" — THE READS
 * AT CONTENT GRAIN.
 *
 * WHAT IS BEING ASSERTED, and every one of them THROUGH `op=earnedbasis` and
 * `op=content` rather than against the store, because a store-level test and a
 * passing battery are not evidence that a caller can reach the feature
 * (`op=invitelook` shipped with a ReferenceError while 1,276 assertions passed):
 *
 *   1. THE TRANSCRIPTION CEILING IS PER EXTENT. An attestation covering the
 *      extent raises it to B; A PAGE ATTESTATION DOES NOT COVER A `document`
 *      ROW. Driven BOTH WAYS — the page attestation that must not raise it, and
 *      the document attestation that must.
 *   2. THE CONNECTION AXIS OF A PORTION IS UNDETERMINED AND STATED (Bob, 5.1),
 *      never borrowed from the whole document — and the LEVEL that is empty is
 *      named (position within the reading; I2/FW-17), which is CLAUDE.md's
 *      sparse-is-normal rule as an obligation rather than a diagnostic.
 *   3. A `document` ROW EARNS WHAT ITS DOCUMENT EARNS, from the same map, and a
 *      `document` leg's earned basis is BYTE-IDENTICAL to the pre-item answer.
 *   4. THE FIXED-KEY `content` READ answers every field on a minted row — the
 *      row, its `ref`, its chain and cap, `stale`, and the attestations
 *      COVERING it — refuses an unknown id BY NAME, and refuses a predicate or
 *      paging because it is fixed-key (D-222 puts the query arm in stage C).
 *   5. `ensureLegContent` IS WIRED AND DRIVEN: a legacy leg carrying NULL is
 *      minted its `document` row by the first read that meets it, at exactly
 *      the id the hash answers for it.
 *   6. THE TWO LEGITIMATE NULLS ARE STATED AS WHICH AND NEVER COLLAPSED
 *      (IC-83's AMENDMENT 2): an INQUIRY target has no capture and no part to
 *      point at, and a target this record holds no bytes of has nothing to
 *      address. Two codes, two sentences, one shape.
 *   7. D-15 AT CONTENT GRAIN: a row the viewer may not see answers EXACTLY as
 *      one that does not exist, and an absent viewer fails closed.
 *
 * WHAT IS DELIBERATELY NOT HERE. The writer is REC-82's (`content-extent`). The
 * frontmatter and version-leg grammar are REC-84's. The other three extent
 * arms' `covers` is REC-85's — asserted here only as the refusal they are today.
 * The content-grain QUERY arm is D-222 stage C and is asserted ABSENT, by the
 * fixed-key refusal, rather than left unmentioned.
 */
import { statedJSON } from "./stated.mjs";
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { contentIdFor } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r83", MEMBER_TOKEN: "mem-r83", PROBE_TOKEN: "prb-r83",
              AI_TOKEN: "ai-r83", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r83") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r83") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
/* SK-7: A SIGNED-IN MEMBER, and why this suite grew one.
   *
   * REC-83 drove `op=attesttext` with the MEMBER_TOKEN machine credential and
   * named the attestor in the BODY, because the store read it from there. That
   * is the hole SK-7 measured: the same credential could put any member's name
   * on testimony, and C-35.10 refused only a caller that named itself a
   * machine. The attestor is now stamped from the credential that
   * authenticated, so an attestation that must LAND needs a session — and the
   * attestor this suite pins (`hollis`, `rosa`) is now the signed-in member
   * rather than a string the fixture chose, which is a stronger pin and not a
   * weaker one. The assertions below are otherwise UNCHANGED.
   * Both members are administrators: 4.2/4.3 has no ordinary members until two
   * exist, and this fixture needs exactly two. */
const session = async (memberId, role = "admin") => {
  const add = await post("memberadd", { memberId, cover: `cover for ${memberId}`, role,
                                        capabilities: ["contribute"] }, "adm-r83");
  const en = await post("enroll", { invite: add.invite, handle: memberId,
                                    password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en).slice(0, 300)}`);
  const lg = await post("login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg).slice(0, 300)}`);
  return lg.token;
};
const HOLLIS = await session("hollis");
const ROSA = await session("rosa");

const NOW = "2026-09-14T00:00:00Z";
const LATER = "2026-09-14T01:00:00Z";

/* ------------------------------------------------------------- documents */

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
      `    role: ${l.role ?? "supports"}`,
      ...(l.kind ? [`    extent_kind: ${l.kind}`] : []),
      ...(l.page !== undefined ? [`    extent_page: ${l.page}`] : []),
      ...(l.rect ? [`    extent_rect: [${l.rect.join(", ")}]`] : []),
      ...(l.eref ? [`    extent_ref: "${l.eref}"`] : [])])]
  : [];

const inquiryMd = (id, { subject = null, refs = [], legs = [] } = {}) => ["---",
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
  ...(subject ? [`subject_entity: ${subject}`] : []),
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
    snapKey: `20260914T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register });
};
const HEAD = new Map();
const mustPromote = async (id, text, type, opts = {}) => {
  const r = await promote(id, text, type,
    { ...opts, base: opts.base !== undefined ? opts.base : (HEAD.get(id) ?? null) });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

/* A D-252 SCOPED chain: a three-page document whose pages each name themselves,
   which is what gives this capture a PAGE SET the record can see (D-345 — this
   plane persists no PDF page count, so a scoped chain is the only shape that
   produces one, and this suite measures the mechanism as built). */
const scopedChain = (pages, cap = "C") => [
  { step: "pixels", extent: { kind: "pages", pages } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap, confidence: { basis: "none" },
    extent: { kind: "pages", pages } },
];
const readingOf = (captureSha, chain, entities = []) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
             at: NOW, entities, facts: {},
             ...(chain === undefined ? {} : { text_source: chain }) } });

const legOfOrd = (r, ord) => (r.legs || []).find((l) => l.ord === ord) || null;

/* ===================== 0. THE GROUND ==================================== */

console.log("\n--- 0. the ground: a registered subject, a captured and read document, an inquiry citing it twice ---");

const eOrd = await post("entitycreate",
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:24680"] });
const ORD = eOrd.entity_id;
t("a subject entity is registered", /^ENT-/.test(ORD || ""), true);

const SHA_DOC = sha("rec83-doc-with-a-page-set");
const DOC = "INFO-2026-8300-paged";
const CHAIN = scopedChain([0, 1, 2]);

await mustPromote(DOC, infoMd(DOC), "information", {
  reading: readingOf(SHA_DOC, CHAIN,
    [{ ref: "ordinance:24680", kind: "ordinance", key: "24680", label: "Ordinance No. 24680" }]),
  register: [{ path: "snapshots/d.bin", sha256: SHA_DOC, encoding: "binary", bytes: 10 }] });

const rr = await post("resolve", { captureSha: SHA_DOC });
t("the recogniser matches the composite key and the document resolves to the subject at A",
  [rr.resolved_count, rr.resolved[0].grade, rr.resolved[0].entity_id], [1, "A", ORD]);

/* ONE INQUIRY, TWO LEGS ON ONE DOCUMENT — the shape the whole item is about:
   the same document cited once WHOLE and once at a PAGE, so the two answers sit
   side by side in one response and cannot be confused for one another. */
const INQ = "INQ-2026-8300-two-grains";
const rInq = await mustPromote(INQ, inquiryMd(INQ, { subject: ORD, refs: [DOC],
  legs: [{ target: DOC },
         { target: DOC, kind: "pdf-page", page: 1, rect: [10, 20, 100, 200],
           eref: "page 2, the transfer table" }] }), "inquiry");
t("both legs projected a content row — one `document`, one `pdf-page`",
  (rInq.content || []).map((c) => c.extent_kind), ["document", "pdf-page"]);
const DOC_ROW = rInq.content[0].content_id;
const PAGE_ROW = rInq.content[1].content_id;
t("and the two rows are different rows — a document is content, and so is a page of it",
  DOC_ROW !== PAGE_ROW, true);

/* ===================== 1. THE CEILING IS PER EXTENT ===================== */

console.log("\n--- 1. the transcription ceiling, per extent: a PAGE attestation does not cover a DOCUMENT row ---");

const eb0 = await get("earnedbasis", `id=${INQ}`);
t("op=earnedbasis answers at content grain, keyed by content row",
  [eb0.ok, Object.keys(eb0.earned.content || {}).sort().join() === [DOC_ROW, PAGE_ROW].sort().join()],
  [true, true]);
t("with no attestation, BOTH rows are bounded by the derivation — the OCR pass's measured letter",
  [eb0.earned.content[DOC_ROW].transcription.ceiling,
   eb0.earned.content[DOC_ROW].transcription.determinant,
   eb0.earned.content[PAGE_ROW].transcription.ceiling,
   eb0.earned.content[PAGE_ROW].transcription.determinant],
  ["C", "derivation", "C", "derivation"]);

/* A member checks ONE PAGE against the image. */
const att1 = await post("attesttext",
  { captureSha: SHA_DOC, at: NOW, extent: { kind: "page", page: 1 } }, HOLLIS);
t("a member attests PAGE 1 and the act lands", att1.ok, true);

const eb1 = await get("earnedbasis", `id=${INQ}`);
t("THE PAGE ROW IS RAISED TO B BY THE ATTESTATION COVERING IT, and the determinant says so",
  [eb1.earned.content[PAGE_ROW].transcription.ceiling,
   eb1.earned.content[PAGE_ROW].transcription.determinant,
   eb1.earned.content[PAGE_ROW].transcription.by], ["B", "attestation", ["hollis"]]);
t("AND THE `document` ROW IS NOT — a page attestation does not cover the whole document",
  [eb1.earned.content[DOC_ROW].transcription.ceiling,
   eb1.earned.content[DOC_ROW].transcription.determinant,
   eb1.earned.content[DOC_ROW].transcription.by], ["C", "derivation", []]);

/* DRIVEN THE OTHER WAY, and it is not decoration: a `#contentTarget` that
   covered NOTHING would also leave the document row at C, so the assertion
   above passes for the wrong reason unless a DOCUMENT attestation is shown to
   raise it. */
const att2 = await post("attesttext",
  { captureSha: SHA_DOC, at: LATER, extent: { kind: "document" } }, ROSA);
t("a member attests the WHOLE DOCUMENT and the act lands", att2.ok, true);
const eb2 = await get("earnedbasis", `id=${INQ}`);
/* SPLIT IN TWO AFTER THE `docattest` ARM SAID SO, and the first draft is worth
   recording because the arm found the INSTRUMENT rather than the subject. One
   assertion pinned `[ceiling, determinant, by]` as `["B","attestation",["rosa"]]`
   and was declared MUST PASS under the arm — the "other direction" that stops
   the first assertion passing over a target that covers nothing. It FAILED
   under the arm, because the arm makes the page-1 attestation cover the
   document row too and `by` gains "hollis": the assertion was not independent
   of the arm, so it could not serve as the arm's held-open half. The direction
   claim is now the raising itself, which the arm genuinely leaves intact; the
   membership of `by` is its own assertion and is a THIRD declared failure. */
t("NOW the `document` row is raised to B — the coverage rule works in both directions",
  [eb2.earned.content[DOC_ROW].transcription.ceiling,
   eb2.earned.content[DOC_ROW].transcription.determinant,
   eb2.earned.content[DOC_ROW].transcription.by.includes("rosa")], ["B", "attestation", true]);
t("and the document row's covering set names ONLY the document attestor — the page attestation "
+ "still does not cover it",
  eb2.earned.content[DOC_ROW].transcription.by, ["rosa"]);
t("and the page row now names BOTH covering members — a document attestation covers a page too",
  eb2.earned.content[PAGE_ROW].transcription.by.sort(), ["hollis", "rosa"]);

/* ===================== 2. THE CONNECTION AXIS (Bob 5.1) ================= */

console.log("\n--- 2. the connection axis: a portion is UNDETERMINED and STATED, never borrowed ---");

t("the `document` row earns the DOCUMENT's connection grade — its portion IS the document",
  [eb2.earned.content[DOC_ROW].connection.determined,
   eb2.earned.content[DOC_ROW].connection.grain,
   eb2.earned.content[DOC_ROW].connection.grade], [true, "document", "A"]);
t("and it is the SAME entry the document-grain answer carries, not a second computation",
  eb2.earned.content[DOC_ROW].connection.grade, eb2.earned.connection[DOC].grade);
t("THE PORTION ROW IS UNDETERMINED — it does not borrow the document's A (Bob, 2026-09-14)",
  [eb2.earned.content[PAGE_ROW].connection.determined,
   eb2.earned.content[PAGE_ROW].connection.grain,
   eb2.earned.content[PAGE_ROW].connection.grade,
   eb2.earned.content[PAGE_ROW].connection.undetermined_because],
  [false, "portion", null, "READING_POSITION_ABSENT"]);
/* CLAUDE.md's sparse-is-normal rule as an OBLIGATION: saying which level is
   empty is first-class, not a diagnostic detail. */
t("and the LEVEL THAT IS EMPTY is named — readings record THAT, never WHERE (I2, FW-17)",
  [/position within the reading/.test(eb2.earned.content[PAGE_ROW].connection.empty_level),
   /FW-17/.test(eb2.earned.content[PAGE_ROW].connection.empty_level)], [true, true]);
t("the portion's own sentence says it refers only to its portion, and points at where the "
+ "DOCUMENT's answer lives rather than repeating it",
  [/refers only to that portion/.test(eb2.earned.content[PAGE_ROW].connection.why),
   /never borrowed from the whole document/.test(eb2.earned.content[PAGE_ROW].connection.why),
   Object.prototype.hasOwnProperty.call(eb2.earned.content[PAGE_ROW].connection, "document_grade")],
  [true, true, false]);
/* THE STRUCTURAL FORM OF THE SAME CLAIM, which is what an arm can break: no
   portion row anywhere in the answer carries a connection GRADE. */
t("STRUCTURAL: not one non-`document` row in the whole answer carries a connection grade",
  Object.values(eb2.earned.content)
    .filter((c) => c.extent_kind !== "document")
    .filter((c) => c.connection.grade !== null || c.connection.determined !== false).length, 0);

console.log("\n--- 2b. the capture axis is DOCUMENT-GRAIN and unchanged — answered once, not per portion ---");
t("every content row points at the document's capture entry rather than restating a letter",
  Object.values(eb2.earned.content).map((c) => [c.capture.grain, c.capture.from]),
  [["document", `earned.capture[${DOC}]`], ["document", `earned.capture[${DOC}]`]]);
/* CORRECTED BY REC-88 / D-349 — AND THE OLD ASSERTION WAS WRONG ABOUT THE
   RECORD, NOT MERELY STALE. It read `["ceiling", "B"]` and was labelled "exactly
   what it has always been". What it had always been was an OVERCLAIM: `DOC`'s
   chain is `scopedChain([0,1,2])`, a tesseract 5.3.4 OCR pass measured at C over
   every page, and the record was answering that a leg on it could earn B — one
   letter stronger than DEC-4's own doctrine allows, because `captureBound` had
   no caller (D-349). The ceiling is now C, which is the weakest link of byte
   provenance (B) and transcription fidelity (C), with no third scale. The claim
   this line exists to make — that the axis is document-GRAIN and answered once —
   is unchanged and is what it now asserts, alongside the letter that is true. */
t("and the document-grain capture ceiling is the weakest link of bytes and fidelity, answered once",
  [eb2.earned.capture[DOC].mode, eb2.earned.capture[DOC].grade,
   eb2.earned.capture[DOC].bounded_by],
  ["ceiling", "C", "CAPTURE_BOUNDED_BY_FIDELITY"]);

/* ===================== 3. THE FIXED-KEY `content` READ ================== */

console.log("\n--- 3. op=content: one row by content_id, no predicate, no paging (D-222's fixed-key rule) ---");

const cPage = await get("content", `id=${PAGE_ROW}`);
t("the read answers the ROW — its id, its bundle, its capture, its extent",
  [cPage.ok, cPage.content_id, cPage.bundle_id, cPage.capture_sha, cPage.extent_kind,
   cPage.extent.page],
  [true, PAGE_ROW, DOC, SHA_DOC, "pdf-page", 1]);
t("and the human `ref` the member authored, which is IC-1's REQUIRED form",
  cPage.ref, "page 2, the transfer table");
t("the CHAIN it was minted under, and the cap asked about THAT extent (D-252)",
  [Array.isArray(cPage.chain), cPage.chain.length, cPage.derivation_cap], [true, 2, "C"]);
t("`stale` — the transcription has not moved, so it is false and says so",
  [cPage.stale, /as this record holds it/.test(cPage.says)], [false, true]);
t("THE ATTESTATIONS COVERING IT, and only those: the page attestation and the document one",
  cPage.attestations.covering.map((a) => a.attestor).sort(), ["hollis", "rosa"]);
t("its transcription ceiling is the same letter op=earnedbasis reported — one rule, one answer",
  [cPage.transcription.ceiling, cPage.transcription.determinant], ["B", "attestation"]);

const cDoc = await get("content", `id=${DOC_ROW}`);
t("the `document` row's covering set holds the DOCUMENT attestation and NOT the page one",
  cDoc.attestations.covering.map((a) => a.attestor), ["rosa"]);
t("while `all` still names every attestation over the capture — withheld from `covering`, "
+ "never hidden from the reader",
  cDoc.attestations.all.map((a) => a.attestor).sort(), ["hollis", "rosa"]);
t("the connection axis is NAMED AS ABSENT here rather than omitted — this read names no inquiry",
  [cDoc.connection.determined, cDoc.connection.grade, cDoc.connection.undetermined_because],
  [false, null, "NO_SUBJECT_IN_THIS_READ"]);

t("an unknown id is refused BY NAME",
  await (async () => { const r = await get("content", `id=${sha("nothing-cites-this")}`);
                       return [r.ok, r.reason]; })(), [false, "NO_SUCH_CONTENT"]);
t("and so is no id at all",
  await (async () => { const r = await get("content", ""); return [r.ok, r.reason]; })(),
  [false, "NO_ID"]);

console.log("\n--- 3b. FIXED-KEY: a predicate or a page is REFUSED, not ignored ---");
t("a PREDICATE is refused by name — the content-grain query arm is D-222 stage C",
  await (async () => { const r = await get("content", `id=${PAGE_ROW}&where=extent_kind%3Dpdf-page`);
                       return [r.ok, r.reason, r.rejected]; })(),
  [false, "FIXED_KEY_ONLY", ["where"]]);
t("PAGING is refused the same way, and every offending name is listed",
  await (async () => { const r = await get("content", `id=${PAGE_ROW}&limit=10&cursor=abc`);
                       return [r.ok, r.reason, r.rejected]; })(),
  [false, "FIXED_KEY_ONLY", ["cursor", "limit"]]);
/* THE INVERSION IS THE POINT (WORKER.md: invert, do not lengthen a list). A
   parameter nobody has thought of yet is refused too, which a denylist of
   `q`/`where`/`limit`/`cursor` could never do. */
t("a parameter this op has never heard of is refused too — the rule is an ACCEPT set, not a denylist",
  await (async () => { const r = await get("content", `id=${PAGE_ROW}&orderByRelevanceDescending=1`);
                       return [r.ok, r.reason, r.rejected]; })(),
  [false, "FIXED_KEY_ONLY", ["orderByRelevanceDescending"]]);
t("and the refusal says WHY it refuses rather than ignoring the parameter",
  await (async () => { const r = await get("content", `id=${PAGE_ROW}&limit=1`);
                       return /a parameter silently dropped is a filter the caller believes was applied/
                         .test(r.detail); })(), true);

/* ===================== 4. D-15 AT CONTENT GRAIN ========================= */

console.log("\n--- 4. D-15: a row the viewer may not see answers EXACTLY as one that does not exist ---");
{
  /* The DO route reached WITHOUT the control plane's stamp — the shape the
     store must fail closed on. `#viewerSees` answers false for an absent
     viewer, so the row is withheld as an absent one. */
  const unknownId = sha("nothing-cites-this");
  const hidden = await get("content", `id=${PAGE_ROW}`, "prb-r83");
  const absent = await get("content", `id=${unknownId}`, "prb-r83");
  /* The probe class reaches its own scratch namespace, a different Durable
     Object with its own tables — so from there BOTH ids are absent, and the two
     answers must be indistinguishable. */
  t("from a namespace that holds neither, the hidden row and the absent one answer identically",
    JSON.stringify({ ...hidden, target: null }), JSON.stringify({ ...absent, target: null }));
  t("and both are the same named refusal, with no field distinguishing them",
    [hidden.reason, absent.reason, Object.keys(hidden).sort().join()],
    ["NO_SUCH_CONTENT", "NO_SUCH_CONTENT", Object.keys(absent).sort().join()]);
}

/* ===================== 5. THE BACKFILL, WIRED AND DRIVEN ================ */

console.log("\n--- 5. ensureLegContent is WIRED: a legacy leg gets its document row from the FIRST READ ---");

/* A leg written while the record held NO capture of its target is exactly the
   state every leg written before the `content_id` column existed is in: the
   column is NULL and no migration has run. REC-82 landed the function and left
   it UNCALLED, and said so in its own suite. This is the arm that closes it. */
const DOC_LATE = "INFO-2026-8300-captured-later";
const INQ_LATE = "INQ-2026-8300-legacy-leg";
await mustPromote(DOC_LATE, infoMd(DOC_LATE), "information");
const rLate = await mustPromote(INQ_LATE,
  inquiryMd(INQ_LATE, { refs: [DOC_LATE], legs: [{ target: DOC_LATE }] }), "inquiry");
t("the leg lands with NO referent — the record holds no bytes to address", rLate.content, undefined);

const SHA_LATE = sha("rec83-captured-after-the-leg-was-written");
const CHAIN_LATE = scopedChain([0, 1]);
await mustPromote(DOC_LATE, infoMd(DOC_LATE), "information", {
  reading: readingOf(SHA_LATE, CHAIN_LATE),
  register: [{ path: "snapshots/l.bin", sha256: SHA_LATE, encoding: "binary", bytes: 10 }] });

/* THE READ — and nothing has re-promoted the INQUIRY, which is the whole point:
   without the wiring the leg would stay NULL until somebody happened to
   re-promote the question. */
const ebLate = await get("earnedbasis", `id=${INQ_LATE}`);
const legLate = legOfOrd(ebLate, 0);
t("THE FIRST READ MINTS THE ROW — the leg that arrived NULL now carries its `document` row",
  [legLate.content_id != null, legLate.backfilled], [true, true]);
t("at exactly the id the hash answers for it — a pure function, not a migration",
  legLate.content_id, contentIdFor(SHA_LATE, { kind: "document" }, CHAIN_LATE));
/* READ DEFENSIVELY, AND THE REASON IS A MEASUREMENT RATHER THAN STYLE. The
   first draft indexed `ebLate.earned.content[...]` directly, and under the
   `unwired` control arm — where no content id exists, so `earned.content` is
   absent — it threw a TypeError, which goes through NO ASSERTION AT ALL and
   ends the module while the tally reads clean. The harness reported `-1 pass,
   -1 fail` and two of six declared failures, which is a correct and useless
   reading: an arm has to show WHICH assertions break, and a suite that aborts
   says only that something did. REC-82's `overstrict` arm found the identical
   shape one item earlier (`mustPromote` THREW instead of failing), which is why
   this is written out here rather than quietly fixed. */
t("and the read answers for it at content grain in the same breath",
  [((ebLate.earned.content || {})[legLate.content_id] || {}).extent_kind ?? null,
   ((ebLate.earned.content || {})[legLate.content_id] || {}).bundle_id ?? null],
  ["document", DOC_LATE]);
t("the second read finds it rather than minting it again — `backfilled` is false the next time",
  await (async () => { const r = await get("earnedbasis", `id=${INQ_LATE}`);
                       const l = legOfOrd(r, 0);
                       return [l.content_id === legLate.content_id, !!l.backfilled]; })(),
  [true, false]);
t("and op=content resolves the row the backfill minted, through the op a caller reaches",
  await (async () => { const r = await get("content", `id=${legLate.content_id}`);
                       return [r.ok, r.extent_kind, r.bundle_id]; })(),
  [true, "document", DOC_LATE]);

/* ===================== 5b. THE BACKFILL'S BOUND, DRIVEN ================= */

console.log("\n--- 5b. the backfill is BOUNDED, the bound is PUBLISHED, and the next read continues ---");

/* A BOUND NOBODY DRIVES IS A MECHANISM BELIEVED ON ITS EXISTENCE, which is the
   defect this project meets most. The backfill WRITES, and a write behind a
   member-callable read is REC-66 / D-227's amplification at a new door, so it
   is capped at `Store.LEG_BACKFILL_MAX` (50). The cap is only honest if a read
   that hits it SAYS SO and the next read continues — and that is only a fact if
   something makes the cap bite. `LEG_BACKFILL_MAX + 1` legs on one uncaptured
   document, captured afterwards, is the cheapest fixture that does: the legs
   land NULL, the capture arrives, and the first read has 51 to mint. */
{
  const OVER = 51;   /* Store.LEG_BACKFILL_MAX is 50; one more than the cap is what makes it bite. */
  const DOC_MANY = "INFO-2026-8300-many-legs";
  const INQ_MANY = "INQ-2026-8300-over-the-bound";
  await mustPromote(DOC_MANY, infoMd(DOC_MANY), "information");
  const manyLegs = Array.from({ length: OVER }, () => ({ target: DOC_MANY }));
  await mustPromote(INQ_MANY,
    inquiryMd(INQ_MANY, { refs: [DOC_MANY], legs: manyLegs }), "inquiry");
  const SHA_MANY = sha("rec83-captured-after-fifty-one-legs");
  await mustPromote(DOC_MANY, infoMd(DOC_MANY), "information", {
    reading: readingOf(SHA_MANY, scopedChain([0])),
    register: [{ path: "snapshots/m.bin", sha256: SHA_MANY, encoding: "binary", bytes: 10 }] });

  const first = await get("earnedbasis", `id=${INQ_MANY}`);
  const filled = (first.legs || []).filter((l) => l.content_id).length;
  t(`the first read mints exactly the bound — ${OVER} legs waiting, LEG_BACKFILL_MAX minted`,
    [first.legs.length, filled], [OVER, OVER - 1]);
  t("and the read SAYS it stopped at its bound rather than answering short in silence",
    first.backfill_truncated, true);
  t("the leg it did not reach is named as NOT_YET_RESOLVED — not as either legitimate NULL",
    (first.legs.find((l) => !l.content_id) || {}).null_case, "NOT_YET_RESOLVED");
  t("and its sentence says nothing is wrong with the leg and no cursor is needed",
    /needs no cursor/.test((first.legs.find((l) => !l.content_id) || {}).why_no_content || ""), true);

  const second = await get("earnedbasis", `id=${INQ_MANY}`);
  t("THE NEXT READ CONTINUES — every leg now carries its row, and the flag is gone",
    [second.legs.filter((l) => l.content_id).length, second.backfill_truncated ?? false],
    [OVER, false]);
  /* ONE ROW FOR ALL OF THEM, which is REC-82's content address doing its work
     from a direction that suite could not reach: fifty-one legs naming the same
     whole document are fifty-one edges onto ONE referent. */
  t("and all 51 legs point at ONE content row — the address dedups by construction",
    new Set(second.legs.map((l) => l.content_id)).size, 1);
}

/* ===================== 6. THE TWO LEGITIMATE NULLS ====================== */

console.log("\n--- 6. the two legitimate NULL content_ids, STATED AS WHICH and never collapsed ---");

const INQ_TARGET = "INQ-2026-8300-a-question-cited";
const DOC_NOBYTES = "INFO-2026-8300-never-captured";
const INQ_NULLS = "INQ-2026-8300-two-nulls";
await mustPromote(INQ_TARGET, inquiryMd(INQ_TARGET), "inquiry");
await mustPromote(DOC_NOBYTES, infoMd(DOC_NOBYTES), "information");
await mustPromote(INQ_NULLS, inquiryMd(INQ_NULLS,
  { refs: [INQ_TARGET, DOC_NOBYTES],
    legs: [{ target: INQ_TARGET }, { target: DOC_NOBYTES }] }), "inquiry");

const ebNulls = await get("earnedbasis", `id=${INQ_NULLS}`);
const legInq = legOfOrd(ebNulls, 0), legNoBytes = legOfOrd(ebNulls, 1);
t("BOTH legs carry a NULL referent — and they are NOT the same fact",
  [legInq.content_id ?? null, legNoBytes.content_id ?? null], [null, null]);
t("(1) an INQUIRY target: no capture and no part to point at (DEC-21), named by its own code",
  legInq.null_case, "INQUIRY_TARGET");
t("    and the sentence says why an inquiry has no part rather than only that it has none",
  [/an inquiry rather than a/.test(legInq.why_no_content),
   /DEC-21/.test(legInq.why_no_content)], [true, true]);
t("(2) a document this record holds NO BYTES of: nothing to address, named by its own code",
  legNoBytes.null_case, "NO_BYTES_HELD");
t("    and the sentence says absence here is about what was CAPTURED, never about what the "
+ "document says (CLAUDE.md's sparse rule)",
  [/holds no capture of/.test(legNoBytes.why_no_content),
   /never evidence about what the document says/.test(legNoBytes.why_no_content)], [true, true]);
t("THE TWO CODES ARE DISTINCT — a read that collapsed them would answer one code twice",
  new Set([legInq.null_case, legNoBytes.null_case]).size, 2);
t("and a leg with a referent carries NO null case at all — the field is the exception, not a default",
  [legOfOrd(eb2, 0).null_case ?? null, legOfOrd(eb2, 1).null_case ?? null], [null, null]);

/* ===================== 7. OVER-STRICTNESS =============================== */

console.log("\n--- 7. OVER-STRICTNESS: a `document` leg's earned basis is BYTE-IDENTICAL to the pre-item answer ---");

/* THE PIN IS A MEASUREMENT, NOT A HAND COPY. `test/rec83-baseline-probe.mjs`
   builds this exact fixture against a PRISTINE pre-item source tree and prints
   the `earned` object `op=earnedbasis` answered with; the literal below is that
   printout for the whole-document-leg case, measured on `origin/main` at
   8f2023f. A hand copy agrees for free — measured five times in this estate —
   so the probe is kept beside this suite and the comparison is against what it
   PRINTED.
   *
   * WHAT IS PINNED, precisely: every key the pre-item answer HAD. The response
   * additionally gains `legs` and `earned.content`, which is IC-84 (3) landing
   * and is asserted above; what must not move is what a whole-document leg
   * EARNS. Pinning the whole envelope would assert that the item did nothing. */
const PRE_ITEM_EARNED_FOR_A_DOCUMENT_LEG = {
  connection: {
    grade: "A", captures: 1, mode: "value",
    why: `${DOC} resolves to ${ORD} (Sewer Fund Transfer Ordinance) at grade A — the strongest of the `
       + `1 capture(s) of that document the recogniser matched to this subject. Grade states HOW it `
       + `was matched (framework 8.1) and nothing about how credible the document is.`,
  },
  /* ============ MOVED BY REC-88 / D-349, AND HERE IS WHY IT MOVED ==========
   *
   * IT IS NOT EXEMPTED AND IT IS NOT SLACK. This literal read
   * `{ mode: "ceiling", grade: "B", … }` and its heading called it "the pre-item
   * answer". THE PRE-ITEM ANSWER WAS AN OVERCLAIM, and this fixture is the
   * clearest possible instance of it: `DOC`'s chain is `scopedChain([0,1,2])` —
   * a tesseract 5.3.4 OCR pass measured at C over all three pages — and the
   * record was answering that a leg citing it could earn a capture grade of B.
   * DEC-4 rules that transcription fidelity BOUNDS the capture axis as its
   * weakest link with no third scale, `textchain.mjs`'s `captureBound` is that
   * rule in code, and until REC-88 it had ZERO CALLERS under `src/` (D-349). So
   * the pin was pinning the defect.
   *
   * WHAT REPLACES IT IS A MEASUREMENT, NOT A HAND EDIT. `test/rec88-baseline-probe.mjs`
   * builds three documents — publisher-typed, OCR'd-at-C, and an UNMEASURED
   * transcription — and prints each one's `earned.capture` entry and digest. Run
   * against the PRISTINE pre-item tree (`origin/main` at 6e88e35) it prints B
   * for all three, including the unmeasured Moondream chain. Run against this
   * tree it prints B, C and a null grade with the empty level named — and the
   * PUBLISHER-TYPED digest is BYTE-IDENTICAL across the two trees
   * (2aac4721c679dd6d…), which is the over-strictness direction this section
   * exists for, now measured on two checkouts rather than asserted on one.
   * `content-capture-bound.test.mjs` §5 pins that cross-tree digest.
   *
   * WHAT THIS SECTION STILL GUARDS, unchanged: the CONNECTION entry, which this
   * item does not touch and whose pristine digest below is untouched. */
  capture: {
    mode: "ceiling", grade: "C", captures: 1,
    bounded_by: "CAPTURE_BOUNDED_BY_FIDELITY",
    why: `${DOC} holds 1 capture(s) in the record, and the bytes as this instance fetched them would be `
       + `worth B — but this document's TEXT was derived by a machine and that derivation is measured at `
       + `C. The capture axis is bounded by the weakest link of byte provenance and transcription `
       + `fidelity, with no third scale (DEC-4), so the strongest capture grade this document can earn `
       + `is C. Transcription never RAISES a capture grade, and it is not a separate measurement a `
       + `member can cite instead.`,
    ceiling: `Grade A is not reachable on the capture axis at all: it needs a chain-of-custody web `
           + `archive, which this plane cannot produce and does not claim (CAPTURE-FIDELITY.md).`,
  },
};
/* THE DIGESTS THE PROBE PRINTED on the pristine tree, 2026-09-14, over
   `origin/main` at 8f2023f — sha256 of `JSON.stringify(entry)`, which pins KEY
   ORDER as well as values. The literal object above is readable; these two
   lines are what makes it a MEASUREMENT: a reader who doubts the object can
   re-run `node test/rec83-baseline-probe.mjs <pristine>/src/index.mjs` and
   compare two hex strings instead of two paragraphs. */
const PRISTINE_CONNECTION_DIGEST = "6a4289680a5b368b01414259b6ee7f6c17633e846a0d8ff74d6ec00ca0a3fe47";
/* MOVED BY REC-88 (see the block above for why the old figure was wrong rather
   than stale). This is no longer a PRE-ITEM digest and is not called one: it is
   what an OCR'd-at-C document's capture entry hashes to once DEC-4's bound is
   actually asked, printed by this suite's own run on 2026-09-15. The pre-item
   figure it replaces was b626e0d83af4cee6…, and that value is kept here in prose
   so a reader bisecting this line lands on the reason and not on a mystery. */
const BOUNDED_CAPTURE_DIGEST = "e369111fa99a879d4f3fff0ea477452ffe02d502c8a76e166ca468912dc37b38";
{
  const conn = { ...eb2.earned.connection[DOC] };
  delete conn.capture_sha;   /* the fixture's own sha, not a claim about grade */
  t("the CONNECTION entry a document leg earns is unchanged, field for field",
    conn, PRE_ITEM_EARNED_FOR_A_DOCUMENT_LEG.connection);
  t("and byte-for-byte against the digest the PROBE printed on the pristine tree — key order included",
    sha(JSON.stringify(conn)), PRISTINE_CONNECTION_DIGEST);
  t("the CAPTURE entry is BOUNDED BY FIDELITY and hashes to the bounded digest (REC-88)",
    sha(JSON.stringify(eb2.earned.capture[DOC])), BOUNDED_CAPTURE_DIGEST);
  t("the CAPTURE entry a document leg earns states C, the weakest link, field for field",
    eb2.earned.capture[DOC], PRE_ITEM_EARNED_FOR_A_DOCUMENT_LEG.capture);
  /* THE DIRECTION, ASSERTED STRUCTURALLY RATHER THAN BY THE LETTER: whatever the
     fixture's measured fidelity, the answer may never be STRONGER than the byte
     ceiling. `captureBound` never raises, and a change that made it raise would
     pass both pins above if it also moved them. */
  t("and it is never STRONGER than the byte-provenance ceiling, whatever the fidelity is",
    ["A", "B"].indexOf(eb2.earned.capture[DOC].grade) === 0, false);
  t("and the answer still carries exactly the pre-item top-level keys, plus this item's two",
    Object.keys(eb2).sort(),
    ["asked", "bundleId", "detail", "earned", "legs", "ok",
     "subject_entity", "subject_known", "subject_label"].sort());
  t("`earned` gained `content` and lost nothing",
    Object.keys(eb2.earned).sort(), ["capture", "connection", "content"]);
}

/* AND THE OTHER DIRECTION OF OVER-STRICTNESS: a caller who asks nothing about
   content gets an answer with NO content block at all, byte-identically to
   before. Every existing consumer — the write path, the ratification gate, the
   shipped composer — is on this path. */
{
  const INQ_NOLEGS = "INQ-2026-8300-no-legs-yet";
  await mustPromote(INQ_NOLEGS, inquiryMd(INQ_NOLEGS, { subject: ORD }), "inquiry");
  const r = await get("earnedbasis", `id=${INQ_NOLEGS}&targets=${DOC}`);
  t("an inquiry with no legs asked about a candidate target carries NO content block",
    [r.ok, Object.keys(r.earned).sort(), r.legs], [true, ["capture", "connection"], []]);
  /* CORRECTED BY REC-88: the capture letter here was "B" and, like the §7 pin
     above, that was the overclaim rather than the baseline — `DOC` is OCR'd at C.
     WHAT THIS ASSERTION IS ACTUALLY FOR is unchanged and is the reason it still
     stands: a caller that asks nothing about content must get the SAME
     document-grain answer as the caller that does, so the two grains cannot
     disagree. It is therefore compared against the §7 pin rather than against a
     second literal, which is what made the old pair drift-prone in the first
     place. */
  t("and its document-grain answer is the same one the leg-carrying read gave, both axes",
    [r.earned.capture[DOC], r.earned.connection[DOC].grade],
    [PRE_ITEM_EARNED_FOR_A_DOCUMENT_LEG.capture, "A"]);
}

/* ===================== 8. STALENESS AT CONTENT GRAIN ==================== */

console.log("\n--- 8. the document is re-read: the row goes stale, the citation does not move, and the read SAYS SO ---");

await mustPromote(DOC, infoMd(DOC), "information", {
  reading: readingOf(SHA_DOC, scopedChain([0, 1, 2], "B"),
    [{ ref: "ordinance:24680", kind: "ordinance", key: "24680", label: "Ordinance No. 24680" }]),
  register: [{ path: "snapshots/d.bin", sha256: SHA_DOC, encoding: "binary", bytes: 10 }] });

const cStale = await get("content", `id=${PAGE_ROW}`);
t("the row the citation points at is STALE, still resolves, and says what happened",
  [cStale.ok, cStale.stale, /has since been re-read/.test(cStale.says)], [true, true, true]);
t("and the attestations made against the OLD transcription no longer raise its ceiling — "
+ "they are kept and marked, never deleted",
  [cStale.attestations.all.length, cStale.attestations.covering.length,
   cStale.transcription.determinant], [2, 2, "attestation"]);
/* The attestations were made against the chain the row was minted under, so
   they are NOT stale RELATIVE TO THE ROW — which is the right comparison: a
   member checked the text this citation points at. What moved is the
   document's CURRENT transcription, and that is what `stale` on the row says. */
t("the comparison is against the ROW's own chain, which is the text the member actually checked",
  cStale.attestations.all.map((a) => a.stale), [false, false]);

const ebStale = await get("earnedbasis", `id=${INQ}`);
t("op=earnedbasis reports the same staleness for the same row — one rule, two doors",
  [ebStale.earned.content[PAGE_ROW].stale, ebStale.earned.content[DOC_ROW].stale], [true, true]);

/* ===================== FOOT ============================================ */

console.log(`\n  ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
