/* The disclosures' lines in the case document (requirements: `build/requirements/case-disclosures.md`, R1, R3, R5, R7,
 * R10, R13, R14; K1333). Pure: nothing here touches a table. Moved from `case-authoring/document.mjs` unchanged, one
 * spelling (P15): `case-authoring`'s `caseDocumentText` imports these and keeps no copy, so a case document is byte
 * for byte what it was before the split (N529). The comments moved with them, their requirement ids re-pointed to
 * this module's.
 *
 * THE GRAMMAR IS THE RESTRICTED FRONTMATTER GRAMMAR: scalars, a map of scalars, or an array of flat objects, never a
 * map holding an array; a quote, a backslash or a line break in a derived string is sanitised by `case-grammar`'s
 * `fmSafe`. */

import { EARNED_CAPTURE_CEILING } from "../record-grammar/index.mjs";
import { fmSafe, pairLine, ANONYMOUS_ATTESTATION_LEVELS } from "../case-grammar/index.mjs";

/* ===========================================================================
 * EACH DOCUMENT'S GRADE AND CO-ATTESTATION, AND ITS SOURCE (R2–R4; N364: DEC-81 items 1 and 3, DEC-78 item 5). The
 * `/5` blocks `captures:`, `capture_accounts:` and `sources:` are publication's spelling (its R20; K549, K552, K553),
 * written only through its line builders, so the bytes are written one way and read one way. The body, which a person
 * reads, is this module's: each capture's grade and co-attestation in words, and each signed account's text and
 * armored signature verbatim.
 * =========================================================================== */

/** R3: DEC-81 item 3's reader sentence, verbatim, carried by every self-attested document's block. */
export const SELF_ATTESTED_SENTENCE = "Without co-attestation an outsider can verify the copy has not changed since "
  + "capture and can follow the reasoning, but cannot independently verify that the source served those bytes, or when.";
const BASIS_WORDS = Object.freeze({ consent: "stated with the source's consent",
  public_elsewhere: "stated because it is already public, as cited" });

export function captureBodyLines(captures, sources) {
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
           ...c.accounts.flatMap((a, k) => (a.by === null && a.signature === null
             /* R10: an off-the-record capture's attesting member not named: the account's words, nothing of who. */
             ? [`  - The attesting member's account ${k + 1}, on ${a.at}, in its own words; the member is not named, as `
                + "their credit allows:", "", "```", a.text, "```", ""]
             : [`  - The capturing member's signed account ${k + 1}, by ${a.by} on ${a.at}, in its own words:`, "",
                "```", a.text, "```", "", "    Its signature:", "", "```", a.signature ?? "(none held)", "```", ""]))])]
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

/* ===========================================================================
 * WHAT THE CASE CARRIES (R5, R7, R10; DEC-112 (3)(4)(5), DEC-119) AND ANOTHER GROUP'S WORK IT RESTS ON (R13, R14;
 * DEC-96 item 4). The blocks are case-grammar's spelling (its R11, R12, R16), written only through its line builders;
 * the body, which a person reads, is this module's, in plain sentences until the UX design stream gives the words.
 * =========================================================================== */

const MATERIAL_KIND_WORDS = Object.freeze({ document: "a document", observation: "a member's firsthand observation" });

/* R10: who attests a material, as the row states them, never more. */
function attesterWords(a, group) {
  if (a.by_kind === "group") return `${group ?? "the group"} vouches for it by signing this case`;
  if (a.by_kind === "project") return `the record of ${a.by} holds it, registered ${a.at ?? "at a time not stated"}, in ${a.recorded_in}`;
  if (a.by_kind === "co_attestation")
    return a.by === "timestamp" ? `a trusted timestamp of ${a.at ?? "a time not stated"}` : `a third party's co-archive at ${a.by}`;
  if (ANONYMOUS_ATTESTATION_LEVELS.includes(a.level))
    return `a member of the ${a.level}, not named, as they chose`;
  if (!a.level && !a.by) return "a member who has not yet chosen how they are credited, so not named";
  return `${a.by}${a.level ? `, credited at the ${a.level} level as they chose` : ""}${a.at ? `, on ${a.at}` : ""}`
    + (a.signature ? ", with their signature" : "");
}

export function carriesBodyLines(method, materials, group) {
  const rows = materials && Array.isArray(materials.rows) ? materials.rows : [];
  const att = materials && Array.isArray(materials.attestations) ? materials.attestations : [];
  return ["## How This Case Was Graded And Checked", "",
    `Each grade in this case was reached by the grading method ${method ? method.grading ?? "(not stated)" : "(not stated)"}, `
    + `and the case was checked under the publication checks ${method ? method.checks ?? "(not stated)" : "(not stated)"}. `
    + "Both versions are inside what is signed, so anybody can recompute each grade by the stated method.", "",
    "## What This Case Carries", "",
    ...(rows.length
      ? ["Every document and observation this case's findings reach. One a load-bearing finding relies on travels whole "
         + "with the case. One that only a supporting finding reaches, and that this copy does not hold whole, is listed "
         + "with its fingerprint, origin and archived copy.", "",
         ...rows.flatMap((m) => [
           `- ${m.ref}, ${MATERIAL_KIND_WORDS[m.kind] ?? m.kind}, fingerprint ${m.sha}: `
             + (m.included ? "travels whole with this case" : "NOT INCLUDED: only its fingerprint, origin and archived copy travel")
             + `; relied on by ${m.rests_under === "load_bearing" ? "a load-bearing" : "only a supporting"} finding`
             + `; origin ${m.origin ?? "not stated"}; archived copy ${m.archived_copy ?? "none held"}`
             + (m.text_sha ? `; extracted text ${m.text_sha}` : "") + ".",
           ...att.filter((a) => a.ref === m.ref).map((a) => `  - Attested: ${attesterWords(a, group)}.`)])]
      : ["This case's findings reach no document or observation the record holds."]),
    ""];
}

export function acceptedBodyLines(accepted) {
  const rows = accepted && Array.isArray(accepted.rows) ? accepted.rows : [];
  const flags = accepted && Array.isArray(accepted.flags) ? accepted.flags : [];
  if (!rows.length) return [];
  return ["## Another Group's Work This Case Rests On", "",
    "A finding of this case rests on a finding of another group's published case, which this group accepted. That "
    + "work, and everything it rests on, is the other group's, in its own case file: check it there.", "",
    ...rows.map((r) => `- ${r.member} rests, through ${r.leg_of}, on ${r.finding} of ${r.group ?? "another group"}'s case `
      + `${r.case ?? "(not stated)"}, edition ${r.edition}: accepted by ${r.accepted_by} on ${r.accepted_at}, because: `
      + `${r.reason}. It was ${String(r.result ?? "not recorded").replace(/_/g, " ")} from that case file`
      + (r.gaps ? `, with the gaps stated: ${r.gaps}` : "") + `. Its grades as that edition publishes them: ${pairLine(r.pair)}. `
      + `Its case file's manifest is ${r.manifest_sha ?? "not stated"}.`),
    ...(flags.length
      ? ["", "Each open flag on that work is disclosed here, and never blocks the case (DEC-96 item 4):", "",
         ...flags.map((f) => `- Flag ${f.flag} on ${f.ref}, edition ${f.edition}, raised ${f.flagged_at ?? "at a time not stated"}: `
           + `${f.issue}.` + (f.words ? ` In the owner's words: ${f.words}.` : "")
           + ` Disclosed by ${f.acknowledged_by} on ${f.acknowledged_at}.`)]
      : ["", "No flag was open on that work when this case was published."]),
    ""];
}

/* ===========================================================================
 * THE TENSIONS DISCLOSED (R1, R17; N345: DEC-76 item 4, DEC-84 items 11–13, DEC-85). Fixed words: the templates a
 * member's block carries per tension, the highlight's sentence in the document, and the words a refusal names a
 * half-seen conflict with (the ceremony's sentence before the act stays `case-authoring`'s, its R32). A side the
 * publisher could not see has no field here to be written into: every entry that is highlighted carries its seen side
 * only.
 * =========================================================================== */

/** R1: the member block's sentence per tension, by the candidate's standing (`template`). */
export const TENSION_TEMPLATES = Object.freeze({
  in_tension: "In tension, not yet resolved: ",
  explained: "Explained, not yet shown: ",
  irreconcilable: "Held irreconcilable by the group: ",
  unseen: "Rests on a side in conflict with a record not shown: ",
});
/** R1 (DEC-85): the highlighted entry's fixed sentence. */
export const HIGHLIGHT_SENTENCE = "This finding rests on a side in conflict with a record not shown here. The record and "
  + "who holds it are not named.";
/** R1 (C-120.1): how a refusal names a candidate whose other side the owner may not see. */
export const NOT_SHOWN_WORDS = "in conflict with a record not shown";
/** R1, from `contradiction` R29: the disclosure reaches one level (DEC-84 item 12). */
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

/** R1: which template a disclosed entry's member block carries. A highlighted entry carries the last one, and not its
 *  state's own sentence. */
export function tensionTemplate(t) {
  if (t.unseen_other_side) return "unseen";
  if (t.state === "resolved" && t.kind === "irreconcilable") return "irreconcilable";
  if (t.state === "explained_not_shown") return "explained";
  return "in_tension";
}

const quoted = (x) => (x.text == null ? "(no text stated)" : `'${x.text}'`) + (x.source ? ` (${x.source})` : "");

/** R1: the member block's sentence for one disclosed entry, from its template, attributed to who disclosed it. It names
 *  nothing of a side not seen (R17). */
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

/** R18: a leg a conflict could not be looked for on (it names no content row), stated per member, never filled. */
export function tensionsUnreadStated(unread) {
  return unread.map((u) => `${u.legs} leg(s) of ${u.finding} name no passage the record holds, so a conflict on `
    + "them could not be looked for; that is stated, not read as none.").join(" ");
}

export function tensionFrontmatterLines(tensions, unread = []) {
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

export function tensionBodyLines(tensions, unread = []) {
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
