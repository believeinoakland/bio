/* adoptable-reading.mjs — REC-136's ONE fixture helper for concluding an
 * inquiry with NO project (INVESTIGATIVE-SESSION.md §7.1 item 6, BOB #15,
 * 2026-09-18).
 *
 * WHY THIS EXISTS. Until REC-136 an inquiry concluded outside any project
 * adopted no claim at all, and every suite that concluded one did it with
 * `target`, `conclusion` and `falsifier` alone. §7.1 item 6 rules that such a
 * conclusion NAMES the accepted reading whose claim it adopts; unnamed is
 * refused NO_CLAIM and nothing is written. So each of those suites was
 * CORRECTED AT ITS SITE — its concluded inquiry now carries an accepted reading
 * with a claim, and its conclude call names it — never exempted.
 *
 * ONE helper rather than thirty hand-written readings, because a reading
 * copied thirty times is thirty places for the fixture to drift from what the
 * catalogue accepts (C-25's rules), and the drift would read as a plane defect.
 *
 * WHAT IT WRITES, and what it deliberately does not:
 *   - ONE `basis_versions` row, ACCEPTED by a named member (`state_by`,
 *     `state_at`), with a description, `relationship: and`, and a CLAIM.
 *   - ONE ground, asserted by that member, and one leg per target in the
 *     document's own `basis:` block — so the reading rests on exactly what the
 *     inquiry already cites and adds no reference the suite did not author.
 *   - NO GRADE on any leg. Absent is undetermined and is STATED as such by the
 *     catalogue; a grade here would be a strength claim the suite never made,
 *     and it would move strength reads the suite is not about.
 * It refuses (throws) on a document with no `basis:` targets or one that
 * already carries `basis_versions`, rather than guessing — both mean the suite
 * needs its own reading, written where it can be seen.
 */
export const ADOPTED_READING = "the concluded reading";
export const ADOPTED_CLAIM = "The record the inquiry cites answers its question as concluded.";

export function withAdoptableReading(md, { name = ADOPTED_READING, claim = ADOPTED_CLAIM,
                                           by = "ruth", at = "2026-07-01T00:00:00Z" } = {}) {
  const lines = String(md).split("\n");
  if (lines[0] !== "---") throw new Error("withAdoptableReading: no frontmatter");
  const end = lines.indexOf("---", 1);
  if (end === -1) throw new Error("withAdoptableReading: unterminated frontmatter");
  const fm = lines.slice(1, end);
  if (fm.some((l) => /^basis_versions:/.test(l)))
    throw new Error("withAdoptableReading: the document already carries basis_versions — write its reading by hand");
  const at0 = fm.findIndex((l) => /^basis:\s*$/.test(l));
  if (at0 === -1) throw new Error("withAdoptableReading: the document has no basis: block to rest a reading on");
  const targets = [];
  for (let i = at0 + 1; i < fm.length && /^\s+/.test(fm[i]); i++) {
    const m = /^\s+-\s+target:\s*"?([^"\s]+)"?\s*$/.exec(fm[i]);
    if (m) targets.push(m[1]);
  }
  if (!targets.length) throw new Error("withAdoptableReading: the basis: block names no target");
  const q = (s) => `"${s}"`;
  const add = [
    "basis_versions:",
    `  - name: ${q(name)}`,
    `    description: ${q("The reading the inquiry's own basis states, adopted when it was concluded.")}`,
    `    relationship: "and"`, `    state: "accepted"`, `    state_by: ${q(by)}`, `    state_at: ${q(at)}`,
    `    derived_from: null`, `    hidden: false`, `    claim: ${q(claim)}`,
    `    author: ${q(by)}`, `    at: ${q(at)}`,
    "basis_version_grounds:",
    `  - version: ${q(name)}`, `    ground: "the cited record"`, `    asserted_by: ${q(by)}`, `    at: ${q(at)}`,
    "basis_version_legs:",
    ...targets.flatMap((t) => [`  - version: ${q(name)}`, `    target: ${q(t)}`, `    role: "supports"`,
                               `    ground: "the cited record"`]),
  ];
  return [...lines.slice(0, end), ...add, ...lines.slice(end)].join("\n");
}

/* The query-string fragment a no-project conclude now owes. */
export const adoptedVersionParam = (name = ADOPTED_READING) => `&version=${encodeURIComponent(name)}`;
