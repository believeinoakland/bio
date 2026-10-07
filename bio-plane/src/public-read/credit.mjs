/* public-read — the credit page (requirements: `build/requirements/public-read.md` R30; DEC-146 (1)–(3), K1774, N660).
 *
 * The page the "Made with Civicsmith" credit links to, served on the public path with no credential (R10), as
 * `op=credit` (`./door.mjs`; op-declarations declares it and control-plane routes it, L11). It says what Civicsmith
 * is in DEC-146's one description line, with its second line for where there is room. The two lines are held here
 * once and exported, so another module (the installer, T35-50) copies them with a test of equality rather than
 * retyping them; no other line describing Civicsmith is served on the public path.
 *
 * It reads nothing of the group's record and takes no argument, so its answer is the same bytes for every group's
 * Civicsmith and every caller; it names no place (R15) and writes nothing. How the page is drawn is the UX stream's
 * (`legacy-ui`, K633): this gives it the words. */

/* R30 (DEC-146): the one line saying what Civicsmith is. */
export const CIVICSMITH_DESCRIPTION = "Free software for groups that check whether government keeps its own rules and promises.";

/* R30 (DEC-146): the second line, for where there is room. */
export const CIVICSMITH_WHO = "Neighbourhood and issue groups, newsrooms, professional associations, and public offices "
  + "checking their own work.";

/** R30: the credit page's answer, `{ok: true, name: "Civicsmith", description, who}`, a fresh object each call. */
export function creditPage() {
  return { ok: true, name: "Civicsmith", description: CIVICSMITH_DESCRIPTION, who: CIVICSMITH_WHO };
}
