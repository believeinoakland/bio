/* R8 (K82 (4), K86): `checkSkillVersion` and `parseSkillVersion`, held here — ai-runs is earlier in the order than
 * `skills`, whose `skillpack.mjs` wrote them first and re-exports this copy at its job (K78 (3)'s pattern). The
 * refusal is C-22.7, built from the one row `AI_RUN_CHECKS` holds. */
import { AI_RUN_CHECKS } from "../airun.mjs";

function refusal(key, detail) {
  const row = AI_RUN_CHECKS[key];
  return { ok: false, code: key, check: row.check, translation: row.translation, detail };
}


/** C-22.7 — A RUN MAY NOT OPEN WITHOUT NAMING THE SKILL VERSION IT RUNS UNDER.
 *
 *  §11 lists the skill version among THE CONDITIONS THE RUN WAS FORMED UNDER,
 *  beside the bias manifest and the standard pair, for Bob's stated reason:
 *  *"everything can change at the drop of a hat"*, so a version is only
 *  interpretable against them. SK-1's row makes the recording a REQUIREMENT
 *  rather than an analogy — and a condition that may be omitted is not recorded,
 *  it is recorded by the runs that felt like it.
 *
 *  SO IT IS REFUSED AT THE OPEN, where the principals already are: `aiRunOpen`
 *  refuses a run that cannot say which plane credential acts and which level of
 *  the Claude cascade pays, and this is the third condition of the same kind.
 *  Refusing later would mean a run had already searched under instructions
 *  nobody can name.
 *
 *  TWO WAYS TO FAIL AND ONE CODE, because they are one fact — the run object
 *  cannot say what it ran under. Absent is the ordinary case. **Present but
 *  naming no pack is the worse one**: `3` reads as an answer, and the moment a
 *  second pack exists nobody can tell which `3` it was. That is the blank-
 *  principal shape PL-4 measured one field over (a run that names nobody while
 *  looking like it names somebody), applied to a condition rather than an
 *  identity.
 *
 *  DELIBERATELY NOT CHECKED HERE: whether the version is one this instance
 *  CURRENTLY renders. A rerun under vN+1 must be able to record vN+1 while the
 *  record still holds runs under vN, and pinning the open to the current pack
 *  would make the two indistinguishable by making the older one impossible —
 *  which is the property SK-1 is judged on, removed by its own guard. Any pack's
 *  well-formed version is accepted, including a pack this repository never
 *  wrote. */
export function checkSkillVersion(version) {
  const v = typeof version === "string" ? version.trim() : "";
  if (!v)
    return refusal("AI_RUN_SKILL_VERSION_UNNAMED",
      "this run named no skill version. §11 records the conditions a run was formed under — the "
      + "manifest in force, the standard pair, and the skill version it ran under — because a "
      + "version is only interpretable against them");
  if (!/^[^\s@]+@[^\s@]+$/.test(v))
    return refusal("AI_RUN_SKILL_VERSION_UNNAMED",
      `'${v.slice(0, 60)}' names no pack. A skill version is <pack>@<edition>, and a bare edition `
      + "cannot be read once a second pack exists — it looks like an answer and identifies nothing");
  return null;
}

/** The pack id and edition a recorded version names, or null if it names none.
 *  Exported so a reader RESOLVES a version it received rather than parsing one
 *  it computed — DEC-8's direction, one field over. */
export function parseSkillVersion(version) {
  const v = typeof version === "string" ? version.trim() : "";
  if (checkSkillVersion(v)) return null;
  const at = v.indexOf("@");
  const rest = v.slice(at + 1);
  const plus = rest.indexOf("+");
  return { pack: v.slice(0, at),
           edition: plus < 0 ? rest : rest.slice(0, plus),
           digest: plus < 0 ? null : rest.slice(plus + 1) };
}
