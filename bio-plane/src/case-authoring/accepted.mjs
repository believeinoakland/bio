/* Another group's work a case rests on (requirements: `build/requirements/case-authoring.md`, R50–R53; DEC-96 item 4,
 * DEC-112 (6); N522). Pure: what `case-import` answered is handed in, so the rules here read no store. Kept apart from
 * `index.mjs` so the case's disclosures can leave this module whole along that seam (K617).
 *
 * THE STATEMENT (R51): for each leg a member's chain reaches on an imported finding reference, who accepted which edition,
 * when and why, the recreation result and the gaps stated; `checked` stays inside the group. THE FLAGS (R52): disclosed,
 * never blocked, R31's pattern (DEC-96 item 4: "as it must disclose an open contradiction"); the flagging member is not
 * named (K1273 reading 1). */

const COMPLETENESS_MAX = 2000;
const str = (v) => String(v ?? "").trim();

/** R52: the plain sentence a member's block gains for each open flag disclosed on work it rests on, until the UX design
 *  stream gives the words. */
export const FLAG_SENTENCE = "Rests on another group's work that carries an open flag, disclosed with this case: ";
/** R52, R53: what the ceremony says of the flags beside R32's tensions. */
export const FLAGS_SAY = "publishing discloses each of these flags, and is never blocked by one (DEC-96 item 4): list each "
  + "in flagsDisclosed at op=publish, with your own words if you choose.";

/** R52's input: `flagsDisclosed`, `[{flag, words?}]`, as a map by flag (a flag listed twice is disclosed once, its first
 *  words kept). Absent or null is none. A malformed shape is R3's `BAD_COMPLETENESS` naming the field, as
 *  `tensionsDisclosed`'s (K498). */
export function flagsListed(list) {
  const byFlag = new Map();
  const bad = (field, detail) => ({ ok: false, reason: "BAD_COMPLETENESS", field, detail });
  if (list == null) return { ok: true, byFlag };
  if (!Array.isArray(list)) return bad("flagsDisclosed", "flagsDisclosed is a list of {flag, words?}, one per open flag disclosed");
  for (let i = 0; i < list.length; i++) {
    const d = list[i];
    const flag = d && typeof d === "object" && !Array.isArray(d) && (typeof d.flag === "string" || Number.isInteger(d.flag))
      ? str(d.flag) : "";
    if (!flag) return bad(`flagsDisclosed[${i}]`, `flagsDisclosed[${i}] is not {flag, words?} naming a flag`);
    if (d.words != null && typeof d.words !== "string")
      return bad(`flagsDisclosed[${i}].words`, `flagsDisclosed[${i}].words is the owner's words, a string`);
    const words = typeof d.words === "string" ? d.words.trim() || null : null;
    if (words !== null && (words.length > COMPLETENESS_MAX || /["\\\r\n]/.test(words)))
      return bad(`flagsDisclosed[${i}].words`, `flagsDisclosed[${i}].words is at most ${COMPLETENESS_MAX} characters and `
        + `cannot contain a quote, a backslash, or a newline: the restricted frontmatter grammar has no escapes`);
    if (!byFlag.has(flag)) byFlag.set(flag, { flag, ord: i, words });
  }
  return { ok: true, byFlag };
}

/** R51: one `accepted_work:` row (`case-grammar` R16) from a leg on a ref, the acceptance in force and the imported
 *  edition's facts for that finding. `edition` is the imported edition `importedCase` answered (or null), `found` its
 *  finding's entry (or null). */
export function acceptedWorkRow(leg, parsed, acceptance, edition, found) {
  return { member: leg.member, leg_of: leg.leg_of, ref: leg.ref,
           group: edition ? edition.group ?? null : null, case: edition ? edition.case ?? null : null,
           edition: leg.target_edition, finding: parsed.finding,
           manifest_sha: edition ? edition.manifest_sha ?? null : null,
           pair: found ? found.pair ?? null : null, result: found ? found.result ?? null : null,
           gaps: acceptance.gaps ?? null, accepted_by: acceptance.by ?? null, accepted_at: acceptance.at ?? null,
           reason: acceptance.reason ?? null };
}

/** R52: the flags a case over `editions` must disclose, judged against the owner's list. `reads` is one entry per
 *  (import, edition) the rows name, `{import, edition, refs, answer}` with `case-import.openFlagsOn`'s answer (or a
 *  thrown read, as `{failed: why}`). Answers `{failed, open, undisclosed, notStanding}`: `failed` each read that failed or
 *  was incomplete (C-120.12, alone), else `open` every open flag `{flag, finding, issue, at, import, edition, ref}`,
 *  `undisclosed` those the list does not name (C-120.11) and `notStanding` listed flags that are not open (C-120.13). */
export function flagsJudged(reads, listed) {
  const failed = [];
  const open = [];
  for (const r of reads) {
    const a = r.answer;
    const flags = a && !a.failed && Array.isArray(a.flags) ? a.flags : Array.isArray(a) ? a : null;
    if (!flags || (a && (a.failed || a.ok === false || a.complete === false || a.truncated))) {
      failed.push({ import: r.import, edition: r.edition, why: a && a.failed ? a.failed
        : !a ? "no answer" : a.complete === false || a.truncated ? "the read was incomplete" : a.reason || "the read failed" });
      continue;
    }
    for (const f of flags) {
      const finding = f.finding ?? null;
      const ref = (finding && r.refs.find((x) => x.finding === finding)?.ref) || r.refs[0].ref;
      open.push({ flag: str(f.flag ?? f.id), finding, issue: f.issue ?? null, at: f.at ?? null,
                  import: r.import, edition: r.edition, ref });
    }
  }
  if (failed.length) return { failed, open: [], undisclosed: [], notStanding: [] };
  const standing = new Set(open.map((f) => f.flag));
  return { failed, open,
           undisclosed: open.filter((f) => !listed.byFlag.has(f.flag)),
           notStanding: [...listed.byFlag.values()].filter((d) => !standing.has(d.flag)) };
}
