/* The acknowledgement list's two renderings and the key it is recorded by (requirements: `build/requirements/case-inputs.md`,
 * R2). Pure: nothing here touches a table. Copied from `case-authoring`'s `document.mjs` (K624; N908), the comments with
 * them; `case-authoring`'s `caseDocumentText` imports these, never a copy (K1333), so the signed document is byte-identical
 * before and after the split. `fmSafe` is case-grammar's one spelling (N424). */

import { createSha256 } from "../record-grammar/index.mjs";
import { fmSafe } from "../case-grammar/index.mjs";

/** R2: the key an acknowledgement is recorded and matched by: the SHA-256 of the statement exactly as the case
 *  document prints it (`fmSafe`, so a draft's text, an unsigned document's and the act's hash alike). */
export function statementSha(s) {
  return createSha256().update(new TextEncoder().encode(fmSafe(s))).hex();
}

/* ===========================================================================
 * THE TWO RENDERINGS OF THE ACKNOWLEDGEMENT LIST (R2), ONE SPELLING EACH: written into a document by
 * `case-authoring`'s `caseDocumentText` when `op=publish` authors it, and spliced by `publication.reauthorSection` when an
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

/** R2 (REC-213): what the review copy's list left out, in one sentence a reader reads. The case document's spelling of
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
