/* publication — the `captures:`, `capture_accounts:` and `sources:` blocks of a `/5` case document (requirements:
 * `build/requirements/publication.md` R2, R10, R20, R51, R52; N364: DEC-81 items 1 and 3, DEC-78 item 5; K497, K509,
 * K549, K552). `case-authoring` writes them (its R14, R35–R37) with the line builders here, so the bytes are written one
 * way, and this is the one reading of them, beside R20's predicates, so no module parses them a second way.
 *
 * THE BLOCKS, as a `/5` document's front matter carries them (arrays of flat rows, the only grammar `parseFrontmatter`
 * reads, so the nested acknowledgement and accounts are spelled flat, K552):
 *   captures:          one row per capture a member rests on: `capture`, `member`, `grade`, `grade_basis`,
 *                      `co_attested`, `timestamp_at`, `co_archive`, `late`, `self_attested_only`,
 *                      `acknowledgement_reason`, `acknowledged_by`, `acknowledged_at`, `accounts` (the count of its
 *                      signed accounts), `sentence` (case-authoring R36's fixed sentence); the acknowledgement's three
 *                      fields and `sentence` are null unless the capture is self-attested only.
 *   capture_accounts:  one row per signed account (`capture.captureAccountsOf`): `capture`, `seq`, `by`, `at`,
 *                      `key_b64`, `text` (on one line), `text_sha256`, `signature_sha256`. The text and the armored
 *                      signature are stated verbatim in the body, under `## Capture Accounts`, each in a fence
 *                      (`captureAccountsBodyLines`), so a stranger holds the exact bytes the signature covers.
 *   sources:           one row per statement about the source behind a capture: `capture`, `stated`, `basis`.
 *
 * WHAT A `sources:` ROW MAY SAY (R51, R52; DEC-78 item 5). Only what `sources.publishableAt({audience: "public"})`
 * answered, spelled by `sourceStatement`, with its basis (`consent` or `public_elsewhere`); or, with nothing publishable,
 * `unnamedSourceStatement` with `basis: null`. It names no source id and no entry id: either would let a reader tie two
 * captures, or two cases, to one person, which `publishableAt` never answered (K549). So the commit re-derives the
 * sources behind each capture and compares spellings (`sourceRowsStanding`). Pure; nothing here throws. */

import { parseFrontmatter, createSha256 } from "../../checks/bio-checks.mjs";
import { caseDocumentRequiresTensionSection } from "./checks.mjs";

/** R20: the fields of a `captures:` row, in the order they are written (K552). */
export const CAPTURE_FIELDS = Object.freeze(["capture", "member", "grade", "grade_basis", "co_attested", "timestamp_at",
  "co_archive", "late", "self_attested_only", "acknowledgement_reason", "acknowledged_by", "acknowledged_at", "accounts",
  "sentence"]);
/** R20: the fields of a `capture_accounts:` row (K552). */
export const CAPTURE_ACCOUNT_FIELDS = Object.freeze(["capture", "seq", "by", "at", "key_b64", "text", "text_sha256",
  "signature_sha256"]);
/** R20: the fields of a `sources:` row. */
export const SOURCE_FIELDS = Object.freeze(["capture", "stated", "basis"]);
/** R20: the bases a stated source row may carry (sources R8), and null for the unnamed statement. */
export const SOURCE_BASES = Object.freeze(["consent", "public_elsewhere"]);
/** R20: the body section that states each account's text and armored signature verbatim. */
export const CAPTURE_ACCOUNTS_HEAD = "## Capture Accounts";

/** R10, R28: why a document older than `/5` answers the blocks null. */
export const BLOCKS_PREDATE_SENTENCE = "this case document's format predates the statement of each capture's grade, "
  + "co-attestation and source, so it states none; that is not a statement that there were none";
/** R10, R28: a `/5` document that carries no readable block: what it stated is undetermined, never filled. */
export const BLOCK_UNREADABLE_SENTENCE = "this case document declares a format that states each capture's grade, "
  + "co-attestation and source, but carries no readable block for it, so what it stated is undetermined";
/** R51 (sources R4): how an entry recorded without its value is stated. */
export const NOT_RECORDED_STATED = "known to the group, not recorded";

/* A value on one front-matter line: line breaks folded, quotes and backslashes made apostrophes, trimmed (the store's
   `#fmSafe`); so the text written is the text read back, and a spelling compares equal to itself. */
const oneLine = (s) => String(s ?? "").replace(/[\r\n]+/g, " ").replace(/["\\]/g, "'").trim();
const quoted = (s) => `"${oneLine(s)}"`;
const scalar = (v) => (v === null || v === undefined ? "null" : typeof v === "boolean" ? String(v)
  : typeof v === "number" && Number.isFinite(v) ? String(v) : quoted(v));
const val = (v) => (v === undefined || v === null || v === "null" ? null : v);
const bool = (v) => (v === true || v === "true" ? true : v === false || v === "false" ? false : null);
const int = (v) => (Number.isInteger(v) ? v : null);
const sha256 = (s) => createSha256().update(new TextEncoder().encode(String(s))).hex();
const rowsBlock = (key, rows, fields) => (rows.length
  ? [`${key}:`, ...rows.flatMap((r) => fields.map((f, i) => `${i ? "   " : "  -"} ${f}: ${scalar(r[f])}`))]
  : [`${key}: []`]);
/* The accounts a capture row carries, each with its sequence (its own, else its place). */
const accountsOf = (r) => (Array.isArray(r && r.accounts) ? r.accounts : []).filter((x) => x && typeof x === "object")
  .map((x, i) => ({ ...x, seq: Number.isInteger(x.seq) ? x.seq : i + 1 }));
/* A fence longer than any run of backticks in the text, so the text is stated verbatim inside it. */
const fenceFor = (text) => "`".repeat(Math.max(3, ...[...String(text).matchAll(/`+/g)].map((m) => m[0].length + 1)));

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

/** R51 (case-authoring R37): the statement for a capture whose source has nothing publishable: an unnamed source,
 *  with the receipt's digest and time. */
export function unnamedSourceStatement({ capture = null, received = null } = {}) {
  return oneLine(`an unnamed source; received as ${capture ?? "an undetermined digest"} at ${received ?? "an undetermined time"}`);
}

/** R20: the `sources:` block's lines, from `[{capture, stated, basis}]`. */
export function sourceBlockLines(rows) {
  const list = (Array.isArray(rows) ? rows : []).filter((r) => r && typeof r === "object")
    .map((r) => ({ capture: r.capture ?? null, stated: r.stated ?? null, basis: r.basis ?? null }));
  return rowsBlock("sources", list, SOURCE_FIELDS);
}

/** R20 (K552): the `captures:` and `capture_accounts:` blocks' front-matter lines, from `[{capture, member, grade,
 *  grade_basis, co_attested, timestamp_at, co_archive, late, self_attested_only, acknowledgement?: {reason,
 *  acknowledged_by, at}, sentence?, accounts?: [{seq?, by, at, key_b64, text, signature}]}]`. The body section is
 *  `captureAccountsBodyLines` over the same rows. */
export function captureBlockLines(rows) {
  const list = (Array.isArray(rows) ? rows : []).filter((r) => r && typeof r === "object");
  const caps = list.map((r) => {
    const a = r.acknowledgement && typeof r.acknowledgement === "object" ? r.acknowledgement : null;
    return { capture: r.capture ?? null, member: r.member ?? null, grade: r.grade ?? null, grade_basis: r.grade_basis ?? null,
             co_attested: r.co_attested ?? null, timestamp_at: r.timestamp_at ?? null, co_archive: r.co_archive ?? null,
             late: r.late ?? null, self_attested_only: r.self_attested_only ?? null,
             acknowledgement_reason: a ? a.reason ?? null : null, acknowledged_by: a ? a.acknowledged_by ?? null : null,
             acknowledged_at: a ? a.at ?? null : null, accounts: accountsOf(r).length,
             sentence: r.sentence ?? (a ? a.sentence ?? null : null) };
  });
  const accounts = list.flatMap((r) => accountsOf(r).map((x) => ({
    capture: r.capture ?? null, seq: x.seq, by: x.by ?? null, at: x.at ?? null, key_b64: x.key_b64 ?? null,
    text: x.text ?? null, text_sha256: sha256(x.text ?? ""), signature_sha256: sha256(x.signature ?? "") })));
  return [...rowsBlock("captures", caps, CAPTURE_FIELDS),
          ...rowsBlock("capture_accounts", accounts, CAPTURE_ACCOUNT_FIELDS)];
}

/** R20 (K552): the body section stating each account's text and armored signature verbatim, in the order of the
 *  `capture_accounts:` rows: a `### Account <seq> of <capture>` heading, then the text and the signature each in a
 *  fence longer than any run of backticks it holds. No section when no capture carries an account. */
export function captureAccountsBodyLines(rows) {
  const list = (Array.isArray(rows) ? rows : []).filter((r) => r && typeof r === "object");
  const out = [];
  for (const r of list)
    for (const x of accountsOf(r)) {
      const text = String(x.text ?? ""), sig = String(x.signature ?? "");
      const ft = fenceFor(text), fs = fenceFor(sig);
      out.push(`### Account ${x.seq} of ${r.capture ?? "null"}`, "", `${ft}text`, ...text.split("\n"), ft, "",
               `${fs}signature`, ...sig.split("\n"), fs, "");
    }
  return out.length ? [CAPTURE_ACCOUNTS_HEAD, "",
    "Each signed account of a capture, its text and signature exactly as signed; each row of `capture_accounts` names "
    + "their SHA-256.", "", ...out] : [];
}

/* The verbatim text and signature of each account, from the body section: `capture#seq` → {text, signature}. */
function bodyAccounts(body) {
  const lines = String(body ?? "").split("\n");
  const out = new Map();
  let i = lines.indexOf(CAPTURE_ACCOUNTS_HEAD);
  if (i < 0) return out;
  let key = null;
  for (i += 1; i < lines.length; i++) {
    const l = lines[i];
    if (/^## /.test(l)) break;
    const h = /^### Account (\d+) of (\S+)$/.exec(l);
    if (h) { key = `${h[2]}#${Number(h[1])}`; continue; }
    const f = /^(`{3,})(text|signature)$/.exec(l);
    if (f && key) {
      const end = lines.indexOf(f[1], i + 1);
      if (end < 0) break;
      const got = out.get(key) || {};
      got[f[2]] = lines.slice(i + 1, end).join("\n");
      out.set(key, got);
      i = end;
    }
  }
  return out;
}

/** R2, R10, R20: the three blocks one case document's bytes state: `{captures, capture_accounts, sources, detail}`.
 *  Each null (with `detail`) for a document before `/5`; a `/5` document missing a block answers that block null and
 *  says so (R28). Each account answers its row, and beside it the verbatim `text` and `signature` from the body with
 *  `verbatim: true` when both hash to the row's `text_sha256` and `signature_sha256`; otherwise the body's copy is not
 *  the one signed, and the account answers `verbatim: false` with the row's one-line text and no signature. Pure;
 *  never throws. */
export function caseDocumentBlocks(text) {
  const none = (detail) => ({ captures: null, capture_accounts: null, sources: null, detail });
  try {
    const parsed = parseFrontmatter(String(text ?? ""));
    const fm = parsed.data || {};
    if (!caseDocumentRequiresTensionSection(fm)) return none(BLOCKS_PREDATE_SENTENCE);
    const captures = Array.isArray(fm.captures)
      ? fm.captures.filter((r) => r && typeof r === "object").map((r) => ({
          capture: val(r.capture), member: val(r.member), grade: val(r.grade), grade_basis: val(r.grade_basis),
          co_attested: bool(r.co_attested), timestamp_at: val(r.timestamp_at), co_archive: val(r.co_archive),
          late: bool(r.late), self_attested_only: bool(r.self_attested_only),
          acknowledgement_reason: val(r.acknowledgement_reason), acknowledged_by: val(r.acknowledged_by),
          acknowledged_at: val(r.acknowledged_at), accounts: int(r.accounts), sentence: val(r.sentence) }))
      : null;
    const verbatim = bodyAccounts(parsed.body);
    const accounts = Array.isArray(fm.capture_accounts)
      ? fm.capture_accounts.filter((r) => r && typeof r === "object").map((r) => {
          const row = { capture: val(r.capture), seq: int(r.seq), by: val(r.by), at: val(r.at), key_b64: val(r.key_b64),
                        text: val(r.text), text_sha256: val(r.text_sha256), signature_sha256: val(r.signature_sha256) };
          const v = verbatim.get(`${row.capture}#${row.seq}`);
          const ok = !!v && typeof v.text === "string" && typeof v.signature === "string"
            && sha256(v.text) === row.text_sha256 && sha256(v.signature) === row.signature_sha256;
          return ok ? { ...row, text: v.text, signature: v.signature, verbatim: true }
                    : { ...row, signature: null, verbatim: false };
        })
      : null;
    const sources = Array.isArray(fm.sources)
      ? fm.sources.filter((r) => r && typeof r === "object")
          .map((r) => ({ capture: val(r.capture), stated: val(r.stated), basis: val(r.basis) }))
      : null;
    return { captures, capture_accounts: accounts, sources,
             detail: captures && accounts && sources ? null : BLOCK_UNREADABLE_SENTENCE };
  } catch {
    return none(BLOCK_UNREADABLE_SENTENCE);
  }
}

/** R51, R52: which `sources:` rows no longer hold. `publishable(capture)` answers, for the capture, `{entries, received}`:
 *  every entry `publishableAt({audience: "public", at})` answers now over the sources behind it, and the receipt's
 *  time, or null when no source stands behind the capture. A row holds when its `stated` and `basis` are an answered
 *  entry's, or when it is the capture's unnamed statement with `basis: null`; every other row is answered, so nothing
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
