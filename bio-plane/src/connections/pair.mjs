/* connections — WHAT A PORTION MAY EARN FROM A CONNECTION'S PAIR (R8, R9; C-49.1, C-49.2, C-49.4). The two pair
 * predicates, moved from the check catalogue (`bio-checks.mjs`, FW-17 and REC-120) at this module's extraction: no
 * catalogue code calls them. Their rows (`CONNECTION_PAIR_CHECKS`, C-49) stay in the catalogue while its shared
 * refusal helper reads them (K138 Q7's pattern); this file mints each refusal from them. Pure; never throws. */

import { CONNECTION_PAIR_CHECKS } from "../../checks/bio-checks.mjs";
import { describeExtent } from "../content/index.mjs";

/** DEC-49's refusal helper for this family. The name is exactly `refusal` and every code a double-quoted literal at
 *  its call site, which is what `civicos-ui/check-refusal-codes.mjs` matches inside a region. */
function refusal(key, detail, extra = null) {
  const row = CONNECTION_PAIR_CHECKS[key];
  return { ok: false, code: key, check: row.check, translation: row.translation, detail,
           ...(extra && typeof extra === "object" ? extra : {}) };
}

/** May this connection's determining pair grade THIS content row's extent?
 *
 *  `pair` is the row's own `{a_ref, a_position, b_ref, b_position}` (the
 *  `determining_pair` a connection view carries). `side` is which end of the
 *  pair is the content row's own capture — 'a' or 'b'. `extentKind`/`extent`
 *  are the content row's columns, and `covers` is the ONE predicate that
 *  decides containment (`readingPositionInExtent`, passed in rather than
 *  imported so this file keeps holding no opinion about the extent vocabulary —
 *  the same discipline `checkAnchor` records about not defining a rival shape).
 *
 *  Returns null when the pair MAY grade the extent, a refusal otherwise. Null
 *  is the permissive answer and it is reached only by a position that was
 *  recorded and was inside — never by an absence.
 *
 *  A CONNECTION WITH NO PAIR AT ALL IS NOT THIS FUNCTION'S CASE and the caller
 *  handles it before calling: that row predates the pair writer, and "this row
 *  does not record its reference" is a third state that must not be collapsed
 *  into "its reference is unplaced". */
export function checkConnectionPairCovers(pair, side, extentKind, extent, covers) {
  /* DEC-49 REGION is-connection-pair-covering */
  const p = pair && typeof pair === 'object' ? pair : null;
  const position = p ? (side === 'b' ? p.b_position : p.a_position) : null;
  const ref = p ? (side === 'b' ? p.b_ref : p.a_ref) : null;
  if (!position)
    return refusal("CONNECTION_PAIR_UNPLACED",
      `the determining reference on end ${side === 'b' ? 'B' : 'A'}`
      + `${ref ? ` (${ref})` : ''} carries no position, so whether it was read inside `
      + `${describeExtent({ kind: extentKind, ...(extent || {}) })} is undetermined`);
  if (typeof covers !== 'function' || !covers(position, extentKind, extent))
    return refusal("CONNECTION_PAIR_OUTSIDE_EXTENT",
      `the determining reference on end ${side === 'b' ? 'B' : 'A'}`
      + `${ref ? ` (${ref})` : ''} was read at ${position.ref}, which is outside `
      + `${describeExtent({ kind: extentKind, ...(extent || {}) })}`);
  /* END DEC-49 REGION is-connection-pair-covering */
  return null;
}

/** REC-120 / D-161 act (1): may this connection's answer at THIS extent be a
 *  definite one, given EVERY mention of the subject in the cited document?
 *
 *  `pairReached` is `checkConnectionPairCovers`' verdict on the stored pair
 *  (true = the pair was read inside the extent). `mentions` is every
 *  resolution of the same capture to the same entity — `{ref, grade, position}`,
 *  position null where the reading could not say; the pair's own reference is
 *  dropped here. `cut` is true when the caller's bounded read of them was
 *  truncated, and an unread mention counts as unplaced, never as absent.
 *  `pairGrade` is the grade the pair's end carries, `rank` the store's grade
 *  ranking, `covers` the ONE containment predicate (passed in, as above).
 *
 *  Returns null when the definite answer stands, else a C-49.4 refusal carrying
 *  `mentions`: each one that bears on the verdict, with `inside` true/false, or
 *  null where it cannot be placed.
 *
 *  THE TWO DIRECTIONS ARE NOT SYMMETRIC, AND ON PURPOSE. "Outside" is a claim
 *  about the SUBJECT — nothing that ties this document to it is in the part — so
 *  ANY other mention inside (of any grade), or any that cannot be placed,
 *  unsettles it. "Reaches" is a claim about the PAIR, and grade is the stated
 *  basis the pair was selected on (FW-17), so only a mention the pair did not
 *  beat on grade — a TIE, or a stronger one from a resolution raised after the
 *  derivation — unsettles it, and only when it is not itself inside the part. */
export function checkConnectionMentionUnchosen({ pairRef = null, pairOccurrence = null, pairGrade = null,
                                                 pairReached = false,
                                                 mentions = [], cut = false, extentKind, extent,
                                                 covers, rank } = {}) {
  /* DEC-49 REGION is-mention-unchosen */
  const r = typeof rank === 'function' ? rank : () => 0;
  const place = (m) => (m && m.position && typeof covers === 'function')
    ? !!covers(m.position, extentKind, extent) : null;
  /* D-454: the pair is ONE OCCURRENCE of its reference, not the reference. Excluding every mention
     with the pair's ref — the rule until this — made a second read of the SAME string (page 9 of a
     file number whose pair was read on page 3) invisible to the one check whose job is to notice
     another mention bears on the part. With `pairOccurrence` named, only the pair's own place is
     excluded and every other place its string was read at is another mention. A caller naming no
     occurrence gets the old exclusion, which is what it could say. `occurrence` rides each mention
     the check names so a member can choose it (C-74.4). */
  const isPair = (m) => m.ref === pairRef
    && (pairOccurrence == null || (m.occurrence ?? '') === pairOccurrence);
  const others = (Array.isArray(mentions) ? mentions : [])
    .filter((m) => m && !isPair(m))
    .map((m) => ({ ref: m.ref, ...(m.occurrence !== undefined ? { occurrence: m.occurrence } : {}),
                   grade: m.grade ?? null, position: m.position ?? null, inside: place(m) }));
  const part = describeExtent({ kind: extentKind, ...(extent || {}) });
  const name = (list) => list.map((m) => `${m.ref} (${m.position
    ? `read at ${m.position.ref}` : 'where it was read is not recorded'})`).join(', ');
  if (!pairReached) {
    const bearing = others.filter((m) => m.inside !== false);
    if (!bearing.length && !cut) return null;
    const inside = bearing.filter((m) => m.inside === true);
    return refusal("CONNECTION_PAIR_MENTION_UNCHOSEN",
      `the connection's pair (${pairRef ?? 'unnamed'}) is this document's strongest-graded mention of the `
      + `subject and was read outside ${part}, but `
      + (inside.length
          ? `another mention of the same subject, ${name(inside)}, was read inside it`
          : bearing.length
            ? `another mention of the same subject, ${name(bearing)}, cannot be placed and may be inside it`
            : `not every mention of the subject in this document was read, and one may be inside it`)
      + `. Nobody chose which mention is on point, so whether this connection reaches the citation is `
      + `undetermined`,
      { mentions: bearing });
  }
  const tied = others.filter((m) => r(m.grade) >= r(pairGrade) && m.inside !== true);
  if (!tied.length && !cut) return null;
  return refusal("CONNECTION_PAIR_MENTION_UNCHOSEN",
    `the connection's pair (${pairRef ?? 'unnamed'}) was read inside ${part}, but it was kept over `
    + (tied.length
        ? `an equal-grade mention of the same subject, ${name(tied)}, that is not inside it,`
        : `mentions of the subject that were not all read,`)
    + ` by a tie-break — sort order, which says nothing about which mention is on point — so whether `
    + `this connection reaches the citation is undetermined`,
    { mentions: tied });
  /* END DEC-49 REGION is-mention-unchosen */
}
