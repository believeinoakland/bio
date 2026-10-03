/* case-grammar — the `captures:` and `sources:` blocks of a `/5` or `/6` case document (requirements:
 * `build/requirements/case-grammar.md` R1, R6; copied from `publication/blocks.mjs` (K651), whose ids the comments below
 * keep: publication R20 is this module's R1, and R2, R10, R28, R51, R52 are publication's readers of it; N364: DEC-81
 * items 1 and 3, DEC-78 item 5; K497, K509).
 * `case-authoring` writes them (its R14, R35–R37) with the line builders here, so the bytes are written one way, and
 * this is the one reading of them, beside R20's predicates, so no module parses them a second way.
 *
 * THE BLOCKS, as a `/5` document's front matter carries them (arrays of flat rows, the only grammar `parseFrontmatter`
 * reads, so a nested list is a block of its own keyed by its capture):
 *   captures:          one row per capture a member rests on: `capture`, `member`, `grade`, `grade_basis`,
 *                      `co_attested`, `timestamp_at`, `co_archive`, `late`, `self_attested_only`; an acknowledged
 *                      capture adds `acknowledgement_reason`, `acknowledged_by`, `acknowledged_at` and `sentence`.
 *   capture_accounts:  one row per signed account of a capture (`capture.captureAccountsOf`): `capture`, `by`, `at`,
 *                      `text_b64`, `signature_b64`, base64 of the exact bytes, so the signature still verifies.
 *   sources:           one row per statement about the source behind a capture: `capture`, `stated`, `basis`.
 *
 * WHAT A `sources:` ROW MAY SAY (R51, R52; DEC-78 item 5). Only what `sources.publishableAt({audience: "public"})`
 * answered, spelled by `sourceStatement`, with its basis (`consent` or `public_elsewhere`); or, with nothing publishable,
 * `unnamedSourceStatement` with `basis: null`. It names no source id and no entry id: either would let a reader tie two
 * captures, or two cases, to one person, which `publishableAt` never answered. So the commit re-derives the sources
 * behind each capture and compares spellings (`sourceRowsStanding`). Pure; nothing here throws. */

import { parseFrontmatter } from "../record-grammar/index.mjs";
import { caseDocumentRequiresTensionSection } from "./formats.mjs";

/** R20: the fields of a `captures:` row, in the order they are written. */
export const CAPTURE_FIELDS = Object.freeze(["capture", "member", "grade", "grade_basis", "co_attested", "timestamp_at",
  "co_archive", "late", "self_attested_only"]);
/** R20: the fields an acknowledged (self-attested only) capture adds. */
export const ACKNOWLEDGEMENT_FIELDS = Object.freeze(["acknowledgement_reason", "acknowledged_by", "acknowledged_at",
  "sentence"]);
/** R20: the fields of a `sources:` row. */
export const SOURCE_FIELDS = Object.freeze(["capture", "stated", "basis"]);
/** R20: the bases a stated source row may carry (sources R8), and null for the unnamed statement. */
export const SOURCE_BASES = Object.freeze(["consent", "public_elsewhere"]);

/** R10, R28: why a document older than `/5` answers both blocks null. */
export const BLOCKS_PREDATE_SENTENCE = "this case document's format predates the statement of each capture's grade, "
  + "co-attestation and source, so it states none; that is not a statement that there were none";
/** R10, R28: a `/5` document that carries no readable block: what it stated is undetermined, never filled. */
export const BLOCK_UNREADABLE_SENTENCE = "this case document declares a format that states each capture's grade, "
  + "co-attestation and source, but carries no readable block for it, so what it stated is undetermined";
/** R51 (sources R4): how an entry recorded without its value is stated. */
export const NOT_RECORDED_STATED = "known to the group, not recorded";

/* A value on one front-matter line (R2): line breaks folded, quotes and backslashes made apostrophes, trimmed (as the
   deleted store's `#fmSafe` was); so the text written is the text read back, and a spelling compares equal to itself.
   One spelling for the blocks, the attribution run and R8's and R9's blocks (`./index.mjs` re-exports it). */
export const fmSafe = (s) => String(s ?? "").replace(/[\r\n]+/g, " ").replace(/["\\]/g, "'").trim();
const oneLine = fmSafe;
const quoted = (s) => `"${oneLine(s)}"`;
const scalar = (v) => (v === null || v === undefined ? "null" : typeof v === "boolean" ? String(v)
  : typeof v === "number" && Number.isFinite(v) ? String(v) : quoted(v));
const val = (v) => (v === undefined || v === null || v === "null" ? null : v);
const bool = (v) => (v === true || v === "true" ? true : v === false || v === "false" ? false : null);
const b64 = (s) => Buffer.from(String(s ?? ""), "utf8").toString("base64");
const unb64 = (s) => { try { return typeof s === "string" && s ? Buffer.from(s, "base64").toString("utf8") : null; } catch { return null; } };
const rowsBlock = (key, rows, fields) => (rows.length
  ? [`${key}:`, ...rows.flatMap((r) => fields.filter((f) => f in r).map((f, i) => `${i ? "   " : "  -"} ${f}: ${scalar(r[f])}`))]
  : [`${key}: []`]);

/** R51, R52: the one spelling of what the public may be told of one entry `sources.publishableAt` answered: its kind
 *  (and attribute), then its value, or that it is known without its value; a pseudonym link names the other source as
 *  answered; a hostile entry adds the exposer's claim sentence. Null for anything that is not an entry. */
export function sourceStatement(entry) {
  if (!entry || typeof entry !== "object" || typeof entry.kind !== "string" || !entry.kind) return null;
  const label = entry.attribute ? `${entry.kind} ${entry.attribute}` : entry.kind;
  const what = entry.kind === "pseudonym_link" ? `the same person as ${entry.to ?? "another source"}`
    : typeof entry.value === "string" && entry.value.trim() ? entry.value
    : NOT_RECORDED_STATED;
  return oneLine(`${label}: ${what}${entry.how === "hostile" && entry.claim ? ` (${entry.claim})` : ""}`);
}

/** R1, R14 (DEC-112 (5), DEC-119 (1); `case-authoring` R37, K1134 reading 6): how a source whose identity a case
 *  withholds is labelled, and the reason it states. The reason names the source's lack of consent and of a public
 *  record (`sources` R8), never what was withheld. The words are the UX stream's; until it gives them, these. */
export const WITHHELD_SOURCE_LABEL = "Withheld";
export const WITHHELD_SOURCE_REASON = "the source has not consented to being named, and no public record names them";

/** R51 (case-authoring R37; K1315 (8)): the statement for a capture whose source has nothing publishable, its identity
 *  withheld: the label, its reason, and the receipt's digest and time. The one spelling (it was "an unnamed source"). */
export function unnamedSourceStatement(given) {
  const { capture = null, received = null } = given && typeof given === "object" ? given : {};
  return oneLine(`${WITHHELD_SOURCE_LABEL}: ${WITHHELD_SOURCE_REASON}; received as `
    + `${capture ?? "an undetermined digest"} at ${received ?? "an undetermined time"}`);
}
/** R1: the same statement by the name case-authoring R37 gives it. */
export const withheldSourceStatement = unnamedSourceStatement;

/** R1, R14: whether a `sources:` row states its source's identity withheld: a row with no basis, which is the withheld
 *  statement (or the unnamed one an older preparation wrote). */
export const sourceRowWithheld = (row) => !!row && typeof row === "object" && (row.basis ?? null) === null
  && typeof row.stated === "string" && row.stated.length > 0;

/** R20: the `sources:` block's lines, from `[{capture, stated, basis}]`. */
export function sourceBlockLines(rows) {
  const list = (Array.isArray(rows) ? rows : []).filter((r) => r && typeof r === "object")
    .map((r) => ({ capture: r.capture ?? null, stated: r.stated ?? null, basis: r.basis ?? null }));
  return rowsBlock("sources", list, SOURCE_FIELDS);
}

/** R20: the `captures:` and `capture_accounts:` blocks' lines, from `[{capture, member, grade, grade_basis,
 *  co_attested, timestamp_at, co_archive, late, self_attested_only, acknowledgement?: {reason, acknowledged_by, at,
 *  sentence}, accounts?: [{by, at, text, signature}]}]`. */
export function captureBlockLines(rows) {
  const list = (Array.isArray(rows) ? rows : []).filter((r) => r && typeof r === "object");
  const caps = list.map((r) => {
    const row = Object.fromEntries(CAPTURE_FIELDS.map((f) => [f, r[f] ?? null]));
    const a = r.acknowledgement && typeof r.acknowledgement === "object" ? r.acknowledgement : null;
    return a ? { ...row, acknowledgement_reason: a.reason ?? null, acknowledged_by: a.acknowledged_by ?? null,
                 acknowledged_at: a.at ?? null, sentence: a.sentence ?? null } : row;
  });
  const accounts = list.flatMap((r) => (Array.isArray(r.accounts) ? r.accounts : [])
    .filter((x) => x && typeof x === "object")
    .map((x) => ({ capture: r.capture ?? null, by: x.by ?? null, at: x.at ?? null, text_b64: b64(x.text),
                   signature_b64: b64(x.signature) })));
  return [...rowsBlock("captures", caps, [...CAPTURE_FIELDS, ...ACKNOWLEDGEMENT_FIELDS]),
          ...rowsBlock("capture_accounts", accounts, ["capture", "by", "at", "text_b64", "signature_b64"])];
}

/** R2, R10, R20: the two blocks one case document's bytes state: `{captures, sources, detail}`. Both null (with
 *  `detail`) for a document before `/5`; a `/5` document missing a block answers that block null and says so (R28).
 *  Each capture carries its `accounts` (decoded, exact) and, when acknowledged, its `acknowledgement`. Pure; never
 *  throws. */
export function caseDocumentBlocks(text) {
  try {
    const fm = parseFrontmatter(String(text ?? "")).data || {};
    if (!caseDocumentRequiresTensionSection(fm)) return { captures: null, sources: null, detail: BLOCKS_PREDATE_SENTENCE };
    const accounts = new Map();
    for (const a of Array.isArray(fm.capture_accounts) ? fm.capture_accounts : []) {
      if (!a || typeof a !== "object" || typeof a.capture !== "string") continue;
      if (!accounts.has(a.capture)) accounts.set(a.capture, []);
      accounts.get(a.capture).push({ by: val(a.by), at: val(a.at), text: unb64(a.text_b64), signature: unb64(a.signature_b64) });
    }
    const captures = Array.isArray(fm.captures)
      ? fm.captures.filter((r) => r && typeof r === "object").map((r) => {
          const out = { capture: val(r.capture), member: val(r.member), grade: val(r.grade), grade_basis: val(r.grade_basis),
                        co_attested: bool(r.co_attested), timestamp_at: val(r.timestamp_at), co_archive: val(r.co_archive),
                        late: bool(r.late), self_attested_only: bool(r.self_attested_only),
                        accounts: accounts.get(r.capture) || [] };
          if ("acknowledgement_reason" in r || "acknowledged_by" in r)
            out.acknowledgement = { reason: val(r.acknowledgement_reason), acknowledged_by: val(r.acknowledged_by),
                                    at: val(r.acknowledged_at), sentence: val(r.sentence) };
          return out;
        })
      : null;
    const sources = Array.isArray(fm.sources)
      ? fm.sources.filter((r) => r && typeof r === "object")
          .map((r) => ({ capture: val(r.capture), stated: val(r.stated), basis: val(r.basis) }))
      : null;
    return { captures, sources,
             detail: captures && sources ? null : BLOCK_UNREADABLE_SENTENCE };
  } catch {
    return { captures: null, sources: null, detail: BLOCK_UNREADABLE_SENTENCE };
  }
}

/** R51, R52: which `sources:` rows no longer hold. `publishable(capture)` answers, for the capture, `{entries, received}`:
 *  every entry `publishableAt({audience: "public", at})` answers now over the sources behind it, and the receipt's
 *  time, or null when no source stands behind the capture. A row holds when its `stated` and `basis` are an answered
 *  entry's, or when it is the capture's withheld statement (`unnamedSourceStatement`) with `basis: null`; every other row is answered, so nothing
 *  is stated that `publishableAt` did not answer at the commit. */
export function sourceRowsStanding(rows, publishable) {
  const failed = [];
  const cache = new Map();
  for (const r of Array.isArray(rows) ? rows : []) {
    const capture = r && typeof r.capture === "string" ? r.capture : null;
    if (!cache.has(capture)) {
      let p = null;
      try { p = capture ? publishable(capture) : null; } catch { p = null; }
      cache.set(capture, p);
    }
    const p = cache.get(capture);
    const stated = r && typeof r.stated === "string" ? oneLine(r.stated) : null;
    const basis = r ? r.basis ?? null : null;
    const holds = !!p && stated !== null && (basis === null
      ? stated === unnamedSourceStatement({ capture, received: p.received })
      : SOURCE_BASES.includes(basis)
        && (p.entries || []).some((e) => e && e.basis === basis && sourceStatement(e) === stated));
    if (!holds) failed.push({ capture, stated, basis });
  }
  return failed;
}
