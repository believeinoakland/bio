/* queue's own refusal rows (requirements: `build/requirements/queue.md`, R11, R19, R28, R29, R35). DEC-49: every refusal
 * this module answers carries its code, its row's check id and the member's translation, spread at its site, so a
 * surface shows the same sentence wherever the act is reached.
 *
 * Moved from the check catalogue (`checks/bio-checks.mjs`) at the module's extraction (T12; K6, K64's pattern): the
 * queue mint's family C-31 whole, and two single rows split out of `ACT_SHAPE_CHECKS` (C-33.27 and C-33.44), each
 * keeping its check id and its words. `NO_PROJECT_SCOPE` is new with R29 (D-623), numbered C-33.50, the next free row of
 * the act-shape family (K107 (3); K174: a module holds its new rows). The inbox's rows (C-19.1's grammar, C-19.2,
 * C-32.10, C-32.11, C-76.1) moved to `tasks/checks.mjs` with the inbox (N363; `tasks` R7).
 *
 * N301 (K356): the class `FINDING` keeps its code and its meaning and is shown to members as **Noticed**; "finding" is
 * reserved for a concluded question. So no translation below calls a queue item a finding. R48 (DEC-107): nor a to-do an
 * obligation, nor a status item a condition or a signal (DEC-131). R49 (DEC-110 (1)): `QUEUE_SORT_UNKNOWN` is C-33.51, the row after C-33.50. */

import { word } from "../setup-words/index.mjs";

const at = (fn, region) => `src/queue/index.mjs ${fn} > ${region}`;

/* C-31 — THE QUEUE MINT: every item carries a class, and a kind the catalogue names under that class (PL-15 / D-213,
 * NOTIFICATIONS.md). NO_SUCH_KIND is a kind the catalogue does not name at all; KIND_MISCLASSED is a real kind filed
 * under a DIFFERENT class, the dangerous one, since the class decides whether leaving a member's list is a personal
 * mute or an authored record act (D-125, DEC-16). No translation asks a member to understand `kind`, `class`, `mint`,
 * `producer` or `catalogue`: they are read by somebody whose list just failed to load. */
export const QUEUE_MINT_CHECKS = Object.freeze({
  NO_CLASS: Object.freeze({
    check: 'C-31.1',
    where: at("queueFeed", "is-queue-mint"),
    translation: word("refusal.NO_CLASS"),
  }),
  NO_SUCH_KIND: Object.freeze({
    check: 'C-31.2',
    where: at("queueFeed", "is-queue-mint"),
    translation: word("refusal.NO_SUCH_KIND"),
  }),
  KIND_MISCLASSED: Object.freeze({
    check: 'C-31.3',
    where: at("queueFeed", "is-queue-mint"),
    translation: word("refusal.KIND_MISCLASSED"),
  }),
});

/* C-33.27, C-33.44, C-33.50 — the act-shape rows of the personal half and of the dispose dispatch. */
export const QUEUE_ACT_CHECKS = Object.freeze({
  /* REC-64 / C-33.27: an OBLIGATION is never muted (R19, R31). */
  KIND_NOT_PERSONAL: Object.freeze({
    check: 'C-33.27',
    where: at("queueMute", "is-mute-class"),
    translation: word("refusal.KIND_NOT_PERSONAL"),
  }),
  /* REC-205 / C-33.44: a CONDITION or an OBLIGATION named to the dispose act (R28). The translation names the act that
     does reach the item, since a member holding a selection needs the next move. N301: what the record NOTICED. */
  CLASS_NOT_DISPOSED: Object.freeze({
    check: 'C-33.44',
    where: at("proposeDispose", "is-dispose-class"),
    translation: word("refusal.CLASS_NOT_DISPOSED"),
  }),
  /* R29 (D-623) / C-33.50: the project arm with no project, and the bridge's FINDING key (R27, R28). One code, one
     sentence at both sites: setting a noticed item aside is one team's decision, and the team was not named. */
  NO_PROJECT_SCOPE: Object.freeze({
    check: 'C-33.50',
    where: at("#noProjectScope", "is-dispose-scope"),
    translation: word("refusal.NO_PROJECT_SCOPE"),
  }),
  /* R49 (DEC-110 (1)) / C-33.51: the feed asked for in an order it does not keep, refused before anything is read. */
  QUEUE_SORT_UNKNOWN: Object.freeze({
    check: 'C-33.51',
    where: at("queueFeed", "is-queue-sort"),
    translation: word("refusal.QUEUE_SORT_UNKNOWN"),
  }),
});

/** A refusal carrying its row: `{ok: false, reason, code, check, translation, …extra}`. `row` is one of the rows
 *  above; the code is the caller's string literal at the site (the module's tests compare code, check and translation). */
export function queueRefusal(code, row, extra = {}) {
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, ...extra };
}
