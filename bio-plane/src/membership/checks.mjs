/* membership's own refusal rows (requirements: `build/requirements/membership.md`). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation, so a surface shows the same sentence wherever the act
 * is reached.
 *
 * The rest of this module's rows are still in the check catalogue (C-29, C-55, C-56, C-57, C-63, C-70.1–.4, C-95,
 * C-96), until those checks move here. The row below is new with R78 (N208, N146, K275: `NO_SUCH_PROJECT` is one
 * condition, a project absent or unseen, answered as absent, so it is minted at one site, `noSuchProject`, and every
 * module answering that condition calls it). It takes the next free number of C-70, the sight family it belongs to
 * (K107 (3)'s rule: the job names a new code's row; K174: a module holds its new rows). Intent's C-111.2 and
 * conformance's C-113.2 give way to it.
 *
 * EXPERTISE_NO_LABEL is new with N285 (K275, K343): R21's no-label refusal was minted as the shared `NO_LABEL`, which
 * progressions and entities mint for conditions of their own; it gets its own code and this row. Membership's
 * expertise acts had no family in the catalogue, so it takes the next free number of C-96, this module's family for
 * the acts on a member's own row (K107 (3), K174). */

const at = (fn, region) => `src/membership/index.mjs ${fn} > ${region}`;

export const MEMBERSHIP_CHECKS = Object.freeze({
  NO_SUCH_PROJECT: Object.freeze({
    check: 'C-70.5', where: at("noSuchProject", "is-project-seen"),
    translation: 'No project answers to that id here. A project you cannot see is answered exactly as one that does '
      + 'not exist, so this is not a hint either way.',
  }),
  EXPERTISE_NO_LABEL: Object.freeze({
    check: 'C-96.13', where: at("expertiseDeclare", "is-expertise-labelled"),
    translation: "An expertise is declared by a name a person can read, such as 'CPA', and this one has none. "
      + 'Nothing was written.',
  }),
});
