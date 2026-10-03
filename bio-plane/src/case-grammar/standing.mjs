/* case-grammar — a finding's standing against the bar the case records (requirements:
 * `build/requirements/case-grammar.md` R15; DEC-112 (4)(1), `BIO_Publication_v0_1.md` §5C "The public page"). One line
 * per finding naming its role and the bar with its per-axis grades, never a bare "meets", and never a case-level
 * strength (DEC-44): `public-read` R22 answers it on the public page, R14's complete edition opens each finding with it,
 * and `case-checker` asks the same question of a recomputed pair. Pure; nothing here throws.
 *
 * THE WORDS are the UX stream's. Until it gives them, DEC-112's example is the pattern: "Relied on · meets this
 * project's bar (capture B, connection C)". */

import { BASIS_GRADES } from "../record-grammar/index.mjs";

/** R15: the axes a bar declares, in order (`strength` R14's two). */
export const BAR_AXES = Object.freeze(["capture", "connection"]);
/** R15: the roles a member holds in a case (`ratification`'s `CASE_MEMBER_ROLES`), and how a line names each. */
export const STANDING_ROLE_WORDS = Object.freeze({ load_bearing: "Relied on", supporting: "Supporting" });

const letter = (v) => (BASIS_GRADES.includes(v) ? v : null);
/* An axis of the pair as a letter: a letter, or `{grade}` graded (or with no state); anything else reaches nothing. */
const pairGrade = (a) => {
  if (typeof a === "string") return letter(a);
  if (a && typeof a === "object" && (a.state == null || a.state === "graded")) return letter(a.grade);
  return null;
};
const reaches = (got, bar) => got !== null && BASIS_GRADES.indexOf(got) <= BASIS_GRADES.indexOf(bar);
const barWords = (bar) => BAR_AXES.map((x) => `${x} ${bar[x] ?? "not set"}`).join(", ");

/** R15: `{role, bar, meets, short, line}` for one member. `bar` is `{capture, connection}`, each the declared letter or
 *  null (a bar handed as `required_strength`, with `declared: false`, declares nothing). `meets` is `true` when a
 *  load-bearing member's pair reaches the bar on every declared axis, `false` when it falls short (`short` naming each
 *  such axis, in order), `"not_asked"` for a supporting member, and `"no_bar"` with no axis declared; a role that is
 *  neither is null, stated in the line. An axis the pair leaves ungraded (unrated, undetermined or absent) falls short.
 *  Pure; never throws. */
export function standingOf(given) {
  try {
    const { role = null, bar = null, pair = null } = given && typeof given === "object" ? given : {};
    const b = bar && typeof bar === "object" && bar.declared !== false ? bar : {};
    const p = pair && typeof pair === "object" ? pair : {};
    const declared = Object.fromEntries(BAR_AXES.map((x) => [x, letter(b[x])]));
    const anyBar = BAR_AXES.some((x) => declared[x] !== null);
    const r = Object.hasOwn(STANDING_ROLE_WORDS, role) ? role : null;
    const who = r ? STANDING_ROLE_WORDS[r] : "Its role in this case is not stated";
    if (!anyBar)
      return { role: r, bar: declared, meets: "no_bar", short: [], line: `${who} · this project declared no bar` };
    if (r === "supporting")
      return { role: r, bar: declared, meets: "not_asked", short: [],
               line: `${who} · not asked to meet this project's bar (${barWords(declared)})` };
    if (r === null)
      return { role: r, bar: declared, meets: null, short: [],
               line: `${who} · this project's bar is (${barWords(declared)})` };
    const short = BAR_AXES.filter((x) => declared[x] !== null && !reaches(pairGrade(p[x]), declared[x]));
    return { role: r, bar: declared, meets: short.length === 0, short,
             line: short.length === 0
               ? `${who} · meets this project's bar (${barWords(declared)})`
               : `${who} · short of this project's bar on ${short.join(" and ")} (${barWords(declared)})` };
  } catch {
    return { role: null, bar: { capture: null, connection: null }, meets: null, short: [],
             line: "Its standing against this project's bar could not be read" };
  }
}
