/* The case document's text and the acknowledgement list's two renderings (requirements:
 * `build/requirements/case-authoring.md`, R14, R16, R17, R20, R21, R22, R26). Pure: nothing here touches a table, so a
 * suite can render a document without a store and the gate can be run against bytes this file produced. Moved from
 * `store.mjs` (`#caseDocumentText`, `CASE_CITATION_WORDS`, the `#ack…Lines` family, `#withheldWriterStated`,
 * `#statementSha`; `#fmSafe` is case-grammar's since N424); the comments moved with them, shortened where they only
 * restated the code.
 *
 * THE DOCUMENT IS A DOCUMENT RATHER THAN A SERIALISATION (CASE-5b / DEC-72). The frontmatter is what the gate and the
 * ratify committer read; the BODY is what a person reads, under canonical headings, because what is signed must be a
 * thing a member actually reviewed, and a member cannot review a block of key-value pairs they have to decode. Every
 * authored sentence appears in the body in the words it was authored in.
 *
 * THE GRAMMAR IS THE RESTRICTED FRONTMATTER GRAMMAR: scalars, a map of scalars, or an array of flat objects, never a
 * map holding an array. Hence `completeness` beside `completeness_excluded`, `searched` beside `searched_levels`,
 * `bias_manifest` beside `bias_manifest_bundles`. */

import { createSha256, EARNED_CAPTURE_CEILING } from "../record-grammar/index.mjs";
import { fmSafe, whatChangedBlockLines, whatChangedSectionLines, lensBlockLines,
         lensSectionLines, workingOnLines } from "../case-grammar/index.mjs";
import { CASE_DOCUMENT_FORMAT, attributionFrontmatterLines, attributionBodyLines, captureBlockLines,
         sourceBlockLines } from "../publication/index.mjs";
import { caseConclusionRowLines } from "../ratification/index.mjs";
import { barAxisWords } from "../strength/index.mjs";

/** Frontmatter-safe: the restricted grammar has no escapes, so a quote, a backslash or a line break in a DERIVED
 *  string (a strength detail, a bar's explanation) is sanitised; an AUTHORED field is refused by name at `op=publish`
 *  instead (R3's `BAD_COMPLETENESS`), which is the difference that matters. Idempotent. It is case-grammar's one
 *  spelling (N424), read rather than copied, and re-exported for this module's importers. */
export { fmSafe };

/** R20: the key an acknowledgement is recorded and matched by: the SHA-256 of the statement exactly as the case
 *  document prints it (`fmSafe`, so a draft's text, an unsigned document's and the act's hash alike). */
export function statementSha(s) {
  return createSha256().update(new TextEncoder().encode(fmSafe(s))).hex();
}

/* ===========================================================================
 * EACH DOCUMENT'S GRADE AND CO-ATTESTATION, AND ITS SOURCE (R35–R37; N364: DEC-81 items 1 and 3, DEC-78 item 5). The
 * `/5` blocks `captures:`, `capture_accounts:` and `sources:` are publication's spelling (its R20; K549, K552, K553),
 * written only through its line builders, so the bytes are written one way and read one way. The body, which a person
 * reads, is this module's: each capture's grade and co-attestation in words, and each signed account's text and
 * armored signature verbatim.
 * =========================================================================== */

/** R36: DEC-81 item 3's reader sentence, verbatim, carried by every self-attested document's block. */
export const SELF_ATTESTED_SENTENCE = "Without co-attestation an outsider can verify the copy has not changed since "
  + "capture and can follow the reasoning, but cannot independently verify that the source served those bytes, or when.";
const BASIS_WORDS = Object.freeze({ consent: "stated with the source's consent",
  public_elsewhere: "stated because it is already public, as cited" });

function captureBodyLines(captures, sources) {
  const byCapture = new Map();
  for (const c of captures) if (!byCapture.has(c.capture)) byCapture.set(c.capture, { ...c, members: [], accounts: [] });
  for (const c of captures) {
    const held = byCapture.get(c.capture);
    held.members.push(c.member);
    if (Array.isArray(c.accounts)) held.accounts.push(...c.accounts);
  }
  return ["## Each Document's Grade And Co-attestation", "",
    ...(byCapture.size
      ? ["Each document this case's findings rest on, one level deep, with the grade its capture earns and whether a "
         + "trusted timestamp and a third party's co-archive attest it. "
         + `A co-attested Grade ${EARNED_CAPTURE_CEILING} document is enough to publish on; `
         + "one that is not is published only as self-attested, by the owner's stated acknowledgement.", "",
         ...[...byCapture.values()].flatMap((c) => [
           `- ${c.capture} (under ${c.members.join(", ")}): `
             + (c.grade ? `grade ${c.grade} (${c.grade_basis ?? "basis not stated"})`
                        : `no capture letter (${c.grade_basis ?? "basis not stated"})`)
             + (c.co_attested
               ? `; co-attested: a timestamp${c.timestamp_at ? ` at ${c.timestamp_at}` : ""} and a co-archive at ${c.co_archive}`
                 + (c.late ? ", obtained LATE: it proves the bytes existed by then, not at capture" : "")
               : "; NOT CO-ATTESTED"
                 + (c.timestamp_at ? ` (a timestamp at ${c.timestamp_at}, no co-archive)` : "")
                 + (c.co_archive ? ` (a co-archive at ${c.co_archive}, no timestamp)` : ""))
             + ".",
           ...(c.grade_why ? [`  - ${c.grade_why}`] : []),
           ...(c.self_attested_only
             ? [`  - SELF-ATTESTED ONLY, acknowledged by ${c.acknowledgement.acknowledged_by} on ${c.acknowledgement.at}: `
                + `${c.acknowledgement.reason}`, `  - ${SELF_ATTESTED_SENTENCE}`]
             : []),
           ...c.accounts.flatMap((a, k) => [
             `  - The capturing member's signed account ${k + 1}, by ${a.by} on ${a.at}, in its own words:`, "",
             "```", a.text, "```", "", "    Its signature:", "", "```", a.signature ?? "(none held)", "```", ""])])]
      : ["This case's findings rest on no document the record holds a capture of, one level deep."]),
    "",
    "## Sources Of Material Given To The Group",
    "",
    ...(sources.length
      ? ["What may be said of whoever gave the group a document this case rests on: only what the source consented to, "
         + "or what is already public elsewhere. Nothing else is stated, and no identifier links this source to any "
         + "other case.", "",
         ...sources.map((x) => `- ${x.capture}: ${x.stated}` + (x.basis ? `, ${BASIS_WORDS[x.basis] ?? x.basis}.` : "."))]
      : ["No document this case rests on was given to the group by a source: each was fetched, or brought in by a member."]),
    ""];
}

/** R16: the words the document's prose gives each citation `version` (REC-219 / D-579(a)). */
export const CASE_CITATION_WORDS = Object.freeze({
  pinned: "cited at capture",
  only_capture: "no pin; the record held one capture at signing,",
  undetermined: "version UNDETERMINED — no pin, and the record held several captures, so which one was cited is not known",
  no_capture: "the record held no capture of it at signing",
  no_bytes: "a question, which has no bytes (DEC-21)",
});

/* ===========================================================================
 * THE TENSIONS DISCLOSED (R31, R33; N345: DEC-76 item 4, DEC-84 items 11–13, DEC-85). Fixed words: the templates a
 * member's block carries per tension, the highlight's sentence in the document, the ceremony's sentence before the act
 * (R32), and the words a refusal names a half-seen conflict with. A side the publisher could not see has no field here
 * to be written into: every entry that is highlighted carries its seen side only.
 * =========================================================================== */

/** R31: the member block's sentence per tension, by the candidate's standing (`template`). */
export const TENSION_TEMPLATES = Object.freeze({
  in_tension: "In tension, not yet resolved: ",
  explained: "Explained, not yet shown: ",
  irreconcilable: "Held irreconcilable by the group: ",
  unseen: "Rests on a side in conflict with a record not shown: ",
});
/** R31 (DEC-85): the highlighted entry's fixed sentence. */
export const HIGHLIGHT_SENTENCE = "This finding rests on a side in conflict with a record not shown here. The record and "
  + "who holds it are not named.";
/** R32 (DEC-85): what the ceremony shows before the act for a highlighted candidate. */
export const CEREMONY_HIGHLIGHT_SENTENCE = "A finding in this case rests on something in conflict with a record you "
  + "cannot see. You can still publish. The published case will highlight that this finding rests on a side in "
  + "conflict with a record not shown, and will not name that record or who holds it.";
/** R31 (C-120.1): how a refusal names a candidate whose other side the owner may not see. */
export const NOT_SHOWN_WORDS = "in conflict with a record not shown";
/** R31, from `contradiction` R29: the disclosure reaches one level (DEC-84 item 12). */
export const TENSIONS_DEPTH_STATED = "Each conflict disclosed here is on something a finding of this case rests on, "
  + "one level deep: a finding it rests on in turn discloses its own when that finding is published.";

/** A side as the document states it: its text verbatim (a claim's or stance's claim, a leg's note or reference, an
 *  extent's reference), its source, stated date, doctype and capture, each null where the record states none. */
export function tensionSide(side) {
  const s = side && typeof side === "object" ? side : {};
  const src = s.source && typeof s.source === "object" ? s.source : {};
  const text = s.text ?? s.claim ?? s.note ?? s.ref ?? s.content_id ?? null;
  return { kind: s.kind ?? null, text: text == null ? null : String(text),
           source: src.inquiry ?? src.bundle ?? s.inquiry ?? s.target ?? null,
           date: s.date ?? null, doctype: s.doctype ?? null, capture: s.capture_sha ?? null };
}

/** R31: which template a disclosed entry's member block carries. A highlighted entry carries the last one, and not its
 *  state's own sentence. */
export function tensionTemplate(t) {
  if (t.unseen_other_side) return "unseen";
  if (t.state === "resolved" && t.kind === "irreconcilable") return "irreconcilable";
  if (t.state === "explained_not_shown") return "explained";
  return "in_tension";
}

const quoted = (x) => (x.text == null ? "(no text stated)" : `'${x.text}'`) + (x.source ? ` (${x.source})` : "");

/** R31: the member block's sentence for one disclosed entry, from its template, attributed to who disclosed it. It names
 *  nothing of a side not seen (R33). */
export function tensionSentence(t) {
  const k = tensionTemplate(t);
  const what = k === "unseen" ? quoted(t.side)
    : k === "explained" ? `${t.explanation ?? "(no explanation stated)"} — ${quoted(t.a)} against ${quoted(t.b)}`
    : `${quoted(t.a)} against ${quoted(t.b)}`;
  return `${TENSION_TEMPLATES[k]}${what} (conflict ${t.candidate}). Disclosed by ${t.acknowledged_by} on `
    + `${t.acknowledged_at}.`;
}

const STATE_WORDS = Object.freeze({ open: "open", explained_not_shown: "explained, not yet shown",
  taken_up: "taken up as a question", resolved: "held irreconcilable, to be reopened by new evidence" });

/** R26: a leg a conflict could not be looked for on (it names no content row), stated per member, never filled. */
export function tensionsUnreadStated(unread) {
  return unread.map((u) => `${u.legs} leg(s) of ${u.finding} name no passage the record holds, so a conflict on `
    + "them could not be looked for; that is stated, not read as none.").join(" ");
}

function tensionFrontmatterLines(tensions, unread = []) {
  const q = (v) => (v == null ? "null" : `"${fmSafe(v)}"`);
  const sideLines = (prefix, x) => [
    `    ${prefix}_kind: ${x.kind ?? "null"}`, `    ${prefix}_text: ${q(x.text)}`, `    ${prefix}_source: ${q(x.source)}`,
    `    ${prefix}_date: ${q(x.date)}`, `    ${prefix}_doctype: ${q(x.doctype)}`, `    ${prefix}_capture: ${x.capture ?? "null"}`];
  return [
    `tensions_disclosed: ${tensions.length}`,
    `tensions_highlighted: ${tensions.filter((t) => t.unseen_other_side).length}`,
    `tensions_depth_stated: "${fmSafe(TENSIONS_DEPTH_STATED)}"`,
    "case_tensions_unread:",
    ...unread.flatMap((u) => [`  - target: ${u.finding}`, `    legs: ${u.legs}`]),
    "case_tensions:",
    ...tensions.flatMap((t) => [
      `  - candidate: ${t.candidate}`,
      `    finding: ${t.finding}`,
      `    state: ${t.state}`,
      `    kind: ${t.kind ?? "null"}`,
      `    unseen_other_side: ${!!t.unseen_other_side}`,
      "    depth: 1",
      `    acknowledged_by: ${t.acknowledged_by}`,
      `    acknowledged_at: "${t.acknowledged_at}"`,
      `    words: ${q(t.words)}`,
      ...(t.unseen_other_side
        ? [...sideLines("side", t.side), `    highlight: "${fmSafe(HIGHLIGHT_SENTENCE)}"`]
        : [`    explanation: ${q(t.explanation)}`, ...sideLines("a", t.a), ...sideLines("b", t.b)])]),
    "case_tension_sentences:",
    ...tensions.flatMap((t) => [
      `  - target: ${t.finding}`,
      `    candidate: ${t.candidate}`,
      `    template: ${tensionTemplate(t)}`,
      `    sentence: "${fmSafe(tensionSentence(t))}"`])];
}

function tensionBodyLines(tensions, unread = []) {
  const side = (label, x) => `  - ${label}: ${x.text == null ? "(no text stated)" : x.text}`
    + ` — source ${x.source ?? "not stated"}, dated ${x.date ?? "not stated"}, ${x.doctype ?? "doctype not stated"}`
    + (x.capture ? `, capture ${x.capture}` : "");
  return ["## Tensions Disclosed", "",
    ...(tensions.length
      ? ["Each unresolved conflict the record holds on what this case's findings rest on, disclosed by the "
         + "publisher. A case is published with its conflicts disclosed, and never refused because one exists "
         + "(DEC-76 item 4).", "",
         ...tensions.flatMap((t) => [
           `- **${t.finding}**, conflict ${t.candidate}: ${STATE_WORDS[t.state] ?? t.state}`
             + `${t.unseen_other_side ? " — HIGHLIGHTED" : ""}.`,
           ...(t.unseen_other_side
             ? [side("the side this case rests on", t.side), `  - ${HIGHLIGHT_SENTENCE}`]
             : [side("one side", t.a), side("the other side", t.b),
                ...(t.explanation != null ? [`  - The explanation recorded: ${t.explanation}`] : [])]),
           ...(t.words != null ? [`  - In the owner's words: ${t.words}`] : []),
           `  - Acknowledged by ${t.acknowledged_by} on ${t.acknowledged_at}.`]),
         "", TENSIONS_DEPTH_STATED]
      : ["The record held no unresolved conflict on what this case's findings rest on when it was published, "
         + "one level deep. " + TENSIONS_DEPTH_STATED]),
    ...(unread.length ? ["", tensionsUnreadStated(unread)] : []),
    ""];
}

/* ===========================================================================
 * THE TWO RENDERINGS OF THE ACKNOWLEDGEMENT LIST (R20), ONE SPELLING EACH: written into a document by
 * `caseDocumentText` when `op=publish` authors it, and spliced by `publication.reauthorSection` when an
 * acknowledgement lands on one authored and unsigned, so the list is never printed two ways. The frontmatter run starts
 * at `  statement_sha:` and ends before `completeness_excluded:`; the prose starts at `ACK_PROSE_HEAD` and ends before
 * the blank line that precedes `## What Was Searched`.
 * =========================================================================== */

export function ackFrontmatterLines(acks) {
  return [
    `  statement_sha: ${acks.statementSha ?? "null"}`,
    `  acknowledged: ${acks.rows.length}`,
    ...(acks.truncated ? ["  acknowledgements_truncated: true"] : []),
    "completeness_acknowledgements:",
    ...acks.rows.flatMap((a) => [
      `  - kind: ${a.kind}`,
      `    by: ${a.by}`,
      `    recipient: ${a.recipient == null ? "null" : `"${fmSafe(a.recipient)}"`}`,
      `    at: "${a.at}"`,
      /* REC-217: a reading this case holds BY THE PUBLISHER'S LINK carries the draft it was given on. */
      ...(a.draft ? [`    draft: ${a.draft}`] : [])])];
}

export const ACK_PROSE_HEAD = "**Who else read this statement.**";

/* REC-194 / §3 rule 13 — THE UNBINDABLE READINGS TRAVEL WITH THE LIST, WHATEVER THE LIST SAYS: counted, never named,
   because naming them is the claim that cannot be made. D-540: a draft-given participant reading while the WRITER is
   undetermined is two unknowns at once, counted in its own sentence and never folded into the first. */
function ackUnboundLines(acks, project) {
  const u = acks.unboundWriterUndetermined || 0;
  if (!acks.unbound && !u) return [];
  return [...(acks.unbound ? ["",
    `This record also holds ${acks.unbound} acknowledgement${acks.unbound === 1 ? "" : "s"} of this exact `
    + `statement in ${project} given for a case whose identity was not yet allocated — a draft — and whether `
    + "any of them is a reading of THIS case is UNDETERMINED: a case id is minted only by publication, and "
    + "none of them was given on a draft that any publisher named as a case's draft at publication, so a "
    + "reading of a draft is not a reading of this case. They "
    + "are counted here and deliberately not named, because naming them would claim they read THIS case's "
    + "statement, which this record does not establish (BIO_Publication §3 rule 13)."] : []),
    ...(u ? ["",
    `This record also holds ${u} acknowledgement${u === 1 ? "" : "s"} of this exact statement in ${project}, `
    + "given by a participant for a draft, of which it is UNDETERMINED both whether any is a reading of THIS "
    + "case and whether any is the statement's writer's own, because who wrote the statement is UNDETERMINED. "
    + "They are counted here, apart, and deliberately not named (BIO_Publication §3 rule 13)."] : [])];
}

/* REC-217 / §3 rule 13 (BOB #33): THE LINK, IN WORDS, whenever the publisher named a draft, whether or not any reading
   was given on it: the act happened either way and the owner who signs is signing it. */
function ackLinkLines(acks) {
  if (!acks.link) return [];
  return ["",
    `Readings given on draft ${acks.link.draft}, which ${acks.link.by} named as this case's draft at `
    + `publication on ${acks.link.at}, are readings of this case, and each one listed above says so. That `
    + `link is ${acks.link.by}'s act, recorded with the publication, and not an inference from the statement's `
    + `words: another draft or case carrying the same sentence binds nothing here (BIO_Publication §3 rule 13).`];
}

/* NOBODY AND UNDETERMINED ARE DIFFERENT FACTS (REC-194): `acknowledged: 0` is true of this case and is not the whole
   truth when the record holds readings of this exact sentence it cannot bind to this case. */
function ackBodyHeadLines(acks, project) {
  return acks.rows.length
    ? [`${ACK_PROSE_HEAD} Acknowledged, as a second reader of what this case leaves out, by:`, "",
       ...acks.rows.map((a) => (a.kind === "recipient"
         ? `- the recipient of review grant ${a.by}, addressed by its issuer as '${fmSafe(a.recipient)}', `
           + `on ${a.at}`
         : `- ${a.by}, a participant of ${project}, on ${a.at}`)
           + (a.draft ? ` — given on draft ${a.draft}` : "")),
       ...(acks.truncated ? ["- (the list stops here; more acknowledgements are recorded than this "
                              + "document lists)"] : [])]
    : (acks.unbound || acks.unboundWriterUndetermined)
      ? [`${ACK_PROSE_HEAD} Nobody acknowledged it FOR THIS CASE. An acknowledgement is never `
         + "required to publish — a group may be one person — and its absence is stated rather than left "
         + "for a reader to infer."]
      : [`${ACK_PROSE_HEAD} Nobody but its author acknowledged it. An acknowledgement is never `
         + "required to publish — a group may be one person — and its absence is stated rather than left "
         + "for a reader to infer."];
}

export function ackBodyLines(acks, project) {
  return [...ackBodyHeadLines(acks, project), ...ackLinkLines(acks), ...ackUnboundLines(acks, project)];
}

/** R20 (REC-213): what the review copy's list left out, in one sentence a reader reads. The case document's spelling of
 *  the same obligation is `ackBodyLines`; the two must never disagree about the FACT. Four states, none a fallback. A
 *  recipient's row is never withheld (a grant's holder is never the writer), so this speaks only of participants. */
export function withheldWriterStated(withheld, writerBy) {
  const n = Number(withheld) || 0;
  const rows = `${n} acknowledgement${n === 1 ? "" : "s"}`;
  if (!n)
    return writerBy
      ? `Nothing is withheld from this list: this record holds no acknowledgement of this statement by `
        + `${writerBy}, who wrote it.`
      : `Nothing is withheld from this list: this record holds no participant's acknowledgement of this `
        + `statement at this production, so there is none that might be its writer's own.`;
  return writerBy
    ? `${rows} of this statement ${n === 1 ? "is" : "are"} recorded and NOT listed above, by the `
      + `statement's writer, ${writerBy}: a reading by its own writer is not a SECOND reading of it `
      + `(BIO_Publication §3 rule 11). It is counted here rather than hidden — everything recorded is `
      + `shown or stated (§6A).`
    : `${rows} of this statement ${n === 1 ? "is" : "are"} recorded and NOT listed above, and the reason `
      + `is UNDETERMINED rather than the writer's own: this draft predates the recording of the `
      + `statement's author, so any participant's acknowledgement of it may be the writer's and this `
      + `list cannot rule that out (BIO_Publication §3 rule 11). They are counted here rather than `
      + `hidden — everything recorded is shown or stated (§6A).`;
}

/** R14: THE CASE DOCUMENT, `publication`'s `CASE_DOCUMENT_FORMAT` (`bio-case-document/5`, N345). Everything it asserts arrived as an argument (R22): the authored
 *  sentences as the publisher typed them, and every fact the caller read from the record at the act (`searched`,
 *  `conclusions`, `frozen`, `manifest`, `acks`, `citations`, `attributions`, the writer). Nothing here is composed,
 *  summarised or inferred, and no case-level strength has anywhere to be written (R24).
 *
 *  `statementBy` null is UNDETERMINED and is STATED, never filled in from `author` (R21, R26). `searched` is required:
 *  a document that cannot say what was searched fails the ceremony instead (R11). `frozen` maps each member to
 *  `{edition, pair, axes, grounds}` (rule 12 (b): stated once here instead of in the member). `manifest` absent is
 *  written as NOT IN FORCE with that sentence, never as a blank. `attributions` empty writes neither attribution run,
 *  so a case reaching no observation is authored byte for byte as before. `tensions` are the entries R31 disclosed,
 *  each `{candidate, finding, state, kind, unseen_other_side, a, b | side, explanation, words, acknowledged_by,
 *  acknowledged_at}` with its sides as `tensionSide` states them. `captures` are R35's rows (one per member and
 *  capture, with R36's acknowledgement and, on a capture's first row, its signed accounts), `sources` R37's
 *  `{capture, stated, basis}`. `workingOn` is R41's reference as `noticeReferenceOf` answered it, null for none. */
export function caseDocumentText({ caseId, edition, project, workingOn = null, scope, bias, bar, roster, roles, pins,
                                   statement, position, justification, excluded, author, at,
                                   statementBy = null, statementByStated = "",
                                   searched, conclusions = [], frozen, manifest = null,
                                   acks = { statementSha: null, truncated: false, rows: [] },
                                   citations = [], attributions = [], tensions = [],
                                   tensionsUnread = [], captures = [], sources = [], whatChanged = null,
                                   lens: lensRead = null }) {
  const roleOf = new Map((roles || []).map((r) => [r.target, r.role]));
  const lens = manifest && manifest.in_force === true ? manifest
    : { in_force: manifest && manifest.in_force === null ? null : false,
        scope: "project", scope_id: project, statements_sha: null, bundles: [], lock_violations: 0,
        stated: manifest && manifest.in_force === null ? manifest.stated : "no manifest was in force",
        pins_proposed: (manifest && manifest.pins_proposed) || [] };
  /* REC-219: the adoptions pinning a proposed revision at signing, and the sentence saying what the list is. It says
     nothing about when or whether the revision takes effect (BOB #34). An empty list is a statement, and says so. */
  const pending = Array.isArray(lens.pins_proposed) ? lens.pins_proposed : [];
  const pendingStated = pending.length === 0
    ? "no adoption in this scope pinned a proposed revision when this case was signed"
    : "each row is an adoption in this scope whose pinned revision the group had proposed and not "
      + "accepted when this case was signed; that revision was not in force at signing";
  const frozenOf = (m) => (frozen && frozen.get(m)) || null;
  const concOf = new Map((conclusions || []).map((c) => [c.target, c]));
  const fm = [
    "---",
    `format: ${CASE_DOCUMENT_FORMAT}`,
    `case_id: ${caseId}`,
    `case_edition: ${edition}`,
    `case_project: ${project}`,
    /* R41 (DEC-111; case-grammar R10): the project reference, through case-grammar's one writer (K1144). */
    ...workingOnLines(workingOn),
    `case_scope: "${fmSafe(scope)}"`,
    `bias_acknowledgement: "${fmSafe(bias)}"`,
    /* D-84 — THE BIAS MANIFEST, BESIDE THE ACKNOWLEDGEMENT AND NOT INSIDE IT (DEC-46). `in_force: false` carries "no
       manifest was in force" and an empty pair list: different facts from a lens with nothing in it. */
    "bias_manifest:",
    `  in_force: ${lens.in_force}`,
    `  scope: ${lens.scope}`,
    `  scope_id: ${lens.scope_id}`,
    `  statements_sha: ${lens.statements_sha ?? "null"}`,
    `  lock_violations: ${lens.lock_violations}`,
    `  stated: "${fmSafe(lens.stated)}"`,
    /* REC-219 / §3 rule 18: the count beside the list below, and its sentence (C-41.14). */
    `  pins_proposed: ${pending.length}`,
    `  pins_proposed_stated: "${fmSafe(pendingStated)}"`,
    "bias_manifest_bundles:",
    ...lens.bundles.flatMap((x) => [
      `  - bundle_id: ${x.bundle_id}`,
      `    revision: ${x.revision}`,
      `    scope: ${x.scope}`]),
    "bias_manifest_pins_proposed:",
    ...pending.flatMap((x) => [
      `  - bundle_id: ${x.bundle_id}`,
      `    revision: ${x.revision}`,
      `    scope: ${x.scope}`,
      `    pinned_state: ${x.pinned_state ?? "null"}`]),
    /* R40 (DEC-103): THE LENS, PRINTED WHOLE, in case-grammar R9's blocks: each statement in force and each citation
       that is public material, the rest only counted. Always present, empty with no manifest in force. */
    ...lensBlockLines(lensRead && lensRead.in_force === true ? lensRead.statements : []),
    /* R38 (DEC-101): an edition above 1 says what changed, in case-grammar R8's block; a first edition carries none. */
    ...(whatChanged ? whatChangedBlockLines({ statement: whatChanged.text, began_as: whatChanged.began_as,
                                              draft: whatChanged.draft ?? null,
                                              adopted_as_drafted: whatChanged.adopted_as_drafted ?? null }) : []),
    /* R16 (REC-219 / D-579(a) / §3 rule 18, C-41.15): THE CASE'S CITATION EDGES, EACH WITH THE VERSION IT RESTS ON.
       `capture` is a sha exactly where `pinned` or `only_capture` says one. */
    "case_citations:",
    ...citations.flatMap((x) => [
      `  - target: ${x.target}`,
      `    version: ${x.version}`,
      `    capture: ${x.capture ?? "null"}`]),
    `case_findings: [${roster.join(", ")}]`,
    "case_roles:",
    ...roster.flatMap((m) => [
      `  - target: ${m}`,
      `    role: ${roleOf.get(m) ?? "null"}`,
      `    version_sha: ${pins.get(m) ?? "null"}`,
      /* D-442: THE MEMBER'S OWN PUBLISHED EDITION of the pinned bytes, beside the pin it numbers (rule 12 (b)). */
      `    edition: ${frozenOf(m) ? frozenOf(m).edition : "null"}`]),
    /* REC-135 / §7.1 item 4 — THE CONCLUSION EACH MEMBER ENTERED THIS CASE ON, AND WHOSE IT WAS. A `no_project` row is
       a DISCLOSURE, not a defect; `claim_state: undetermined` is a first-class answer, never an empty claim. The rows
       are `ratification`'s one writer of them, so what an edition records and what `editionsRecordingConclusion`
       compares it with are written by one function. */
    "case_conclusions:",
    ...roster.flatMap((m) => caseConclusionRowLines(m, concOf.get(m) || null)),
    /* R31 (N345): THE TENSIONS DISCLOSED and each member's tension sentences; always present, zero included. */
    ...tensionFrontmatterLines(tensions, tensionsUnread),
    /* R35–R37 (N364): each document's grade and co-attestation, the signed accounts, and each source's statements;
       always present, empty included. */
    ...captureBlockLines(captures),
    ...sourceBlockLines(sources),
    "completeness:",
    `  statement: "${fmSafe(statement)}"`,
    `  subject_position: ${position}`,
    `  subject_justification: "${fmSafe(justification)}"`,
    `  author: ${author}`,
    /* R21 (REC-212 / §3 rule 13) — TWO ACTS, TWO NAMES, IN THE SIGNED BLOCK: `author` prepared and published the case;
       this is who wrote the sentence `statement` prints. It sits ABOVE `statement_sha` because the acknowledgement
       splice re-writes the run that STARTS there. */
    `  statement_by: ${statementBy ?? "null"}`,
    `  at: "${at}"`,
    /* REC-217 / R9: the draft the publisher named, who named it and when, above `statement_sha` for the same reason. */
    ...(acks.link ? [`  draft: ${acks.link.draft}`, `  draft_named_by: ${acks.link.by}`,
                     `  draft_named_at: "${acks.link.at}"`] : []),
    /* D-150 / §3 rule 11 (R20) — THE STATEMENT'S SECOND READERS, IN THE SIGNED BLOCK. ZERO is a statement. */
    ...ackFrontmatterLines(acks),
    "completeness_excluded:",
    ...(excluded || []).flatMap((r) => [
      ...(r.target ? [`  - target: ${r.target}`, `    description: "${fmSafe(r.description || "")}"`]
                   : [`  - description: "${fmSafe(r.description || "")}"`]),
      `    reason: "${fmSafe(r.reason || "")}"`]),
    /* R17 (REC-96 / D-196) — THE `searched` SECTION, IN THE SIGNED BYTES, as two top-level keys (the grammar). */
    "searched:",
    `  computed_at: "${fmSafe(searched.summary.computed_at)}"`,
    `  subject_source: ${searched.summary.subject_source}`,
    `  subjects: ${searched.summary.subjects}`,
    `  looked: ${searched.summary.looked}`,
    `  unidentified: ${searched.summary.unidentified}`,
    `  levels_reported: ${searched.summary.levels_reported}`,
    "searched_levels:",
    ...searched.levels.flatMap((l) => [
      `  - level: ${l.level}`,
      `    subject_kind: ${l.subject_kind}`,
      `    outcome: ${l.outcome}`,
      `    subjects: ${l.subjects}`,
      `    looked: ${l.looked}`,
      `    never_looked: ${l.never_looked}`,
      `    undetermined: ${l.undetermined}`,
      `    unidentified: ${l.unidentified}`,
      `    evidence_one_sided: ${l.evidence_one_sided}`,
      `    detail: "${fmSafe(l.detail)}"`]),
    /* D-442 / rule 12 (b) — THE FROZEN STRENGTH PAIR, PER MEMBER AND PER AXIS, STATED ONCE HERE (R24: never composed;
       there is no case-level row). */
    "case_strength:",
    ...roster.flatMap((m) => {
      const z = frozenOf(m);
      return !z ? [] : z.axes.flatMap((axis) => {
        const a = z.pair[axis];
        return [`  - target: ${m}`,
                `    axis: ${axis}`,
                `    state: ${a.state}`,
                `    grade: ${a.grade ?? "null"}`,
                `    weakest: ${a.weakest ? a.weakest.target_id : "null"}`,
                `    load_bearing: ${a.load_bearing}`,
                `    population: ${a.population}`,
                `    detail: "${fmSafe(a.detail)}"`];
      });
    }),
    /* REC-42 / DEC-32 clause (e): the frozen grounds, per member. The field is always written. */
    "case_strength_grounds:",
    ...roster.flatMap((m) => {
      const z = frozenOf(m);
      return !z ? [] : z.grounds.flatMap(([axis, g]) => [
        `  - target: ${m}`,
        `    axis: ${axis}`,
        `    ground: ${g.ground === null ? "null" : `"${fmSafe(String(g.ground))}"`}`,
        `    state: ${g.state}`,
        `    grade: ${g.grade ?? "null"}`,
        `    weakest: ${g.weakest ? g.weakest.target_id : "null"}`,
        `    load_bearing: ${g.load_bearing}`,
        `    population: ${g.population}`]);
    }),
    /* MK-7 / §4.3 — each reached observation's level, as this edition's statement (`publication`'s one spelling). */
    ...(attributions.length ? attributionFrontmatterLines(attributions) : []),
    "required_strength:",
    `  declared: ${bar.declared}`,
    `  source: ${bar.source}`,
    `  project: ${project}`,
    `  capture: ${bar.capture ?? "null"}`,
    `  connection: ${bar.connection ?? "null"}`,
    `  detail: "${fmSafe(bar.detail)}"`,
    "---",
    "",
  ];
  const body = [
    `# Case ${caseId} — edition ${edition}`,
    "",
    /* R38 (DEC-101): what changed in this edition, and why, at the top of the edition, in case-grammar R8's section. */
    ...(whatChanged ? whatChangedSectionLines(whatChanged.text) : []),
    "## Scope",
    "",
    scope,
    "",
    "## Findings In This Case",
    "",
    ...roster.flatMap((m, i) => [
      `${i + 1}. ${m} — ${roleOf.get(m) === "load_bearing" ? "LOAD-BEARING" : "supporting"}, `
      + `frozen at version ${pins.get(m) ?? "(unpinned)"}`,
      /* R31: its tension sentences, in its own block. */
      ...tensions.filter((t) => t.finding === m).map((t) => `   - ${tensionSentence(t)}`)]),
    "",
    /* DEC-72 clause 4, in prose: a reader is told, in the document that asserts it, which half claims what. */
    "A LOAD-BEARING finding is one this case rests on, and the standard of evidence below was asked of it.",
    "A SUPPORTING finding travels with the case and is not presented as carrying it.",
    "",
    "## The Conclusions This Case Records",
    "",
    "A conclusion belongs to a PROJECT'S RELATIONSHIP with a question, never to the question alone "
    + "(INVESTIGATIVE-SESSION.md §7.1): an inquiry can be shared, and one team concluding it does not "
    + "move another team's stance. Each member below is named with the relationship whose conclusion "
    + "this case rests on, and with the claim that relationship adopted, frozen as it stood at "
    + "publication.",
    "",
    ...roster.map((m) => {
      const c = concOf.get(m) || null;
      const whose = !c ? "NO CONCLUSION WAS RECORDED FOR THIS MEMBER"
        : c.relationship === "project"
        ? `concluded by ${c.project}${c.by ? ` (${c.by})` : ""}${c.at ? ` on ${c.at}` : ""} on reading `
          + `'${c.version ?? "(unnamed)"}'`
        : "concluded in the question's own bytes, naming no project — read as the NO-PROJECT "
          + "relationship's conclusion, which is not this project's (§7.1 item 5)";
      const claim = !c || !c.claim ? "" : c.claim.state === "adopted"
        ? ` The claim adopted: ${c.claim.text}`
        : ` The claim is UNDETERMINED: ${c.claim.detail
            || "this conclusion names no reading, so which claim was concluded cannot be established "
             + "from the record. It is stated rather than filled in."}`;
      const fals = !c ? "" : c.falsifier
        ? ` What would falsify it: ${c.falsifier}`
        : c.falsifier_override
        ? ` NO FALSIFIER STATED — recorded by ${c.falsifier_override.by} at ${c.falsifier_override.at}.`
        : " NO FALSIFIER IS RECORDED for this conclusion.";
      return `- **${m}** — ${whose}.${claim}${fals}`;
    }),
    "",
    roster.every((m) => (concOf.get(m) || {}).relationship === "project")
      ? `Every conclusion this case records is ${project}'s own.`
      : "AT LEAST ONE MEMBER ENTERED THIS CASE ON A CONCLUSION THAT IS NOT THIS PROJECT'S OWN. That is "
        + "disclosed rather than smoothed: a conclusion written in a question's own bytes names no "
        + "project, so the relationship that drew it cannot be established and it is read as the "
        + "no-project relationship's. A reader weighing this case should know which findings this "
        + "project concluded for itself and which it took as the record already answered.",
    "",
    ...tensionBodyLines(tensions, tensionsUnread),
    ...captureBodyLines(captures, sources),
    ...(attributions.length ? attributionBodyLines(attributions) : []),
    "## What This Excludes",
    "",
    statement,
    "",
    ...((excluded || []).length
      ? (excluded || []).map((r) =>
          `- ${r.target ? r.target + " — " : ""}${r.description || "(named above)"}: ${r.reason}`)
      : ["Nothing material was excluded from this case."]),
    "",
    `Position on putting this case to its subject: ${position}. ${justification}`,
    "",
    /* R21: WHERE the name came from as well as the name, which makes UNDETERMINED readable rather than blank. ABOVE
       the acknowledgement prose, whose head the splice starts from, so a later acknowledgement leaves it alone. */
    `**Who wrote this statement.** ${statementByStated}`,
    "",
    ...ackBodyLines(acks, project),
    "",
    /* R17, in prose: a completeness claim discharged only in machine-readable fields would be D-196 closed in form
       and open in substance; the reader outside this project reads the body. */
    "## What Was Searched",
    "",
    "This section is computed from the observation log over THIS CASE'S OWN SUBJECTS — the documents "
    + "its findings rest on, reached through each member's basis legs — and never over the log's own "
    + "contents. That direction is the whole of its value: a coverage section computed over everything "
    + "the log happens to hold is 100% complete by construction, with every number in it true, while "
    + "saying nothing whatever about this case.",
    "",
    "It is a record of WHAT WAS LOOKED FOR, not a measure of how much exists. No recall figure is "
    + "offered and none is computable: the denominator — everything that might have been found — is "
    + "not knowable, and a number that looked like one would be worse than this prose.",
    "",
    ...searched.levels.map((l) =>
      `- **${l.level} level** (${l.subject_kind}): ${l.outcome.replace(/_/g, " ").toUpperCase()} — `
      + `${l.subjects} subject(s), ${l.looked} with a recorded observation, `
      + `${l.never_looked} established as never looked at, ${l.undetermined} undetermined`
      + (l.unidentified ? `, ${l.unidentified} referent(s) this case rests on that could not be `
                        + `resolved to a subject at all` : "")
      + `. ${l.detail}`),
    "",
    searched.summary.subjects === 0
      ? "**THIS CASE NAMES NO SUBJECT THIS RECORD COULD COMPUTE COVERAGE OVER.** That is not a "
        + "statement that nothing was searched, and it is emphatically not a statement that "
        + "everything was: it means the question could not be asked of this record. A reader should "
        + "treat this case's completeness claim as resting on its author's prose alone."
      : "A level reported as UNDETERMINED is not a level reported as empty. It means this record "
        + "cannot exclude that the looking happened before the log carried that level, or that a "
        + "purge removed what described it — different facts from nobody having looked, and stated "
        + "rather than resolved in whichever direction would read better.",
    "",
    /* D-442 / rule 12 (b), in prose: per finding, per axis, never composed (R24). */
    "## What Each Finding Reached, As Read For This Case",
    "",
    "Each finding's strength is its own, on each axis separately, frozen as this case read it at the "
    + "version pinned above. This case has no strength of its own: two findings that reached different "
    + "grades have two answers, and no letter here combines them.",
    "",
    ...roster.flatMap((m) => {
      const z = frozenOf(m);
      if (!z) return [`- **${m}** — NO FROZEN STRENGTH WAS RECORDED FOR THIS MEMBER.`];
      return [`- **${m}** (its edition ${z.edition}):`,
        ...z.axes.map((axis) => {
          const a = z.pair[axis];
          return `  - ${axis}: ${a.state === "graded" ? `grade ${a.grade}` : a.state.toUpperCase()}`
            + `${a.weakest ? `, no stronger than ${a.weakest.target_id}` : ""}. ${a.detail || ""}`.trimEnd();
        }),
        ...z.grounds.map(([axis, g]) => `  - ${axis}, group '${g.ground ?? "(unnamed)"}': `
          + `${g.state === "graded" ? `grade ${g.grade}` : String(g.state).toUpperCase()}`)];
    }),
    "",
    /* D-84 — THE MANIFEST IN PROSE, named by its pairs and its hash, as it stood at this act. */
    "## Bias Manifest",
    "",
    ...(lens.in_force
      ? [`This case was produced under the bias set in force for ${lens.scope_id} when it was published, `
         + "computed by the plane and frozen here. A lens adopted afterwards does not change this "
         + "document: the manifest names the revisions this case was made under, not the ones in force now.",
         "",
         ...lens.bundles.map((x) => `- ${x.bundle_id} (${x.scope}) at revision ${x.revision}`),
         "",
         `Hash of the effective statement set: ${lens.statements_sha}.`,
         ...(lens.lock_violations
           ? ["", `${lens.lock_violations} project override(s) named a LOCKED instance statement and were `
                 + "refused their effect; the instance statement stands in the set hashed above."]
           : [])]
      : lens.in_force === null
      ? [`THE MANIFEST IS UNDETERMINED for ${lens.scope_id}: ${lens.stated}. Nothing is claimed either way.`]
      : [`NO MANIFEST WAS IN FORCE for ${lens.scope_id} when this case was published: no bias set stood `
         + "adopted for this instance or this project. That is stated, not left blank — it is a different "
         + "fact from a lens with nothing in it."]),
    /* REC-219 / §3 rule 18: the second fact, in prose, when there is something to say. */
    ...(pending.length
      ? ["",
         `AN ADOPTION PINNED A PROPOSED REVISION when this case was signed: ${pending.length === 1 ? "one adoption" : `${pending.length} adoptions`} `
         + "in this scope pinned a revision the group had proposed and not accepted. It was not in force at "
         + "signing, and it is not part of any lens this document names.",
         "",
         ...pending.map((x) => `- ${x.bundle_id} (${x.scope}) pinned revision ${x.revision}, `
           + `standing at ${x.pinned_state ?? "an unrecorded state"}`)]
      : []),
    "",
    "## Citations",
    "",
    ...(citations.length
      ? ["What this case cites, and the version of each it cites — pinned where the record holds the capture "
         + "the citation was made against, and stated where it does not:",
         "",
         ...citations.map((x) => `- ${x.target}: ${CASE_CITATION_WORDS[x.version] ?? x.version}`
           + (x.capture ? ` ${x.capture}` : ""))]
      : ["This case's project cited nothing when it was published."]),
    "",
    /* R40 (DEC-103): case-grammar R9's section, which prints the bias acknowledgement first and then the lens; it
       stands where the acknowledgement's own section stood, so the acknowledgement is printed once. */
    ...lensSectionLines({ acknowledgement: bias,
                          statements: lensRead && lensRead.in_force === true ? lensRead.statements : [],
                          inForce: lensRead ? lensRead.in_force : false,
                          stated: lensRead ? lensRead.stated : null }),
    "## Standard Of Evidence",
    "",
    /* THE ABSENT BAR IS PRINTED AS ABSENT, IN A SENTENCE (R26): an absent bar is not a bar of zero. */
    bar.declared
      ? `This case is ${project}'s production and was held to that project's declared standard: `
        + `${barAxisWords(bar)}. `
        + `${bar.detail || ""}`.trim()
      : `This case is ${project}'s production. NO STANDARD OF EVIDENCE WAS DECLARED for it. `
        + `An absent bar is not a bar of zero: this case claims no cleared standard, and a reader `
        + `weighs each finding's own frozen strength on its own. ${bar.detail || ""}`.trim(),
    "",
    "## Session Log",
    "",
    `### Session ${at} | Case published | ${author}`,
    `Trigger: op=publish, case ${caseId} edition ${edition}`,
    `Published by: ${project} (this case is that project's production, DEC-72)`,
    `Findings in this case: ${roster.join(", ")}`,
    `Load-bearing: ${roster.filter((m) => roleOf.get(m) === "load_bearing").join(", ")}`,
    `Supporting: ${roster.filter((m) => roleOf.get(m) !== "load_bearing").join(", ") || "none"}`,
    `Excluded: ${(excluded || []).length} item(s).`,
    /* D-442 / rule 12 (b): THE PUBLISH RECEIPT IS THE CASE DOCUMENT'S HISTORY, never the finding's (R23). */
    ...roster.map((m) => `Pinned: ${m} at ${pins.get(m) ?? "(unpinned)"}`
      + `${frozenOf(m) ? `, its edition ${frozenOf(m).edition}` : ""}; nothing was written on it.`),
    "",
  ];
  return fm.join("\n") + body.join("\n");
}
