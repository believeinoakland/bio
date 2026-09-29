/* queue's own refusal rows (requirements: `build/requirements/queue.md`, R11, R19, R25, R28, R29, R35). DEC-49: every
 * refusal this module answers carries its code, its row's check id and the member's translation, spread at its site, so
 * a surface shows the same sentence wherever the act is reached.
 *
 * Moved from the check catalogue (`checks/bio-checks.mjs`) at the module's extraction (T12; K6, K64's pattern): the
 * queue mint's family C-31 whole, `TASK_ACTOR_CHECKS` (C-76.1) whole, and four single rows split out of the families
 * that held them (`MACHINE_FENCE_CHECKS`' C-32.10 and C-32.11, `ACT_SHAPE_CHECKS`' C-33.27 and C-33.44), each keeping
 * its check id and its words. `NO_PROJECT_SCOPE` is new with R29 (D-623): the one code both of the project arm's
 * no-scope refusals answer, numbered C-33.50, the next free row of the act-shape family (K107 (3): the job names a new
 * code's row; K174: a module holds its new rows). C-19.1 (`checkInboxGrammar`) is still the catalogue's: its gate runs
 * it over every bundle's `data/inbox.json` (QUEUE #2's record, Q1).
 *
 * N301 (K356): the class `FINDING` keeps its code and its meaning and is shown to members as **Noticed**; "finding" is
 * reserved for a concluded question. So no translation below calls a queue item a finding. */

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
    translation: 'Your list could not be assembled: something on it does not say what sort of item '
      + 'it is, and showing it without that would put an entry in front of you that nobody can act '
      + 'on. Nothing has been lost and nothing about the record has changed — this is a fault on '
      + 'our side, not something you did.',
  }),
  NO_SUCH_KIND: Object.freeze({
    check: 'C-31.2',
    where: at("queueFeed", "is-queue-mint"),
    translation: 'Your list could not be assembled: something on it is described in a word this '
      + 'record does not know, so there is no sentence to show you in place of it. Rather than '
      + 'showing you a line you could not read, the list refuses whole. Nothing has been lost.',
  }),
  KIND_MISCLASSED: Object.freeze({
    check: 'C-31.3',
    where: at("queueFeed", "is-queue-mint"),
    translation: 'Your list could not be assembled: something on it is filed one way and described '
      + 'another, and the difference decides whether setting it aside is a private choice of yours '
      + 'or a change to the record everyone shares. That is not a difference to guess at, so the '
      + 'list refuses until it is right. Nothing has been lost.',
  }),
});

/* C-32.10, C-32.11 — the machine fence on the two task acts (REC-28 / D-151): a machine credential may surface a task
 * and route it at drain time, and may neither re-address nor close one. Checked by shape before the row is read. */
export const QUEUE_MACHINE_CHECKS = Object.freeze({
  MACHINE_CANNOT_FORWARD: Object.freeze({
    check: 'C-32.10',
    where: at("taskForward", "is-machine-forward"),
    translation: 'Forwarding hands an obligation to a named person, and deciding who is better '
      + 'placed to answer it is a judgement about people rather than about records. The credential '
      + 'that asked here is an automated one: it can surface the work and route it as it arrives, '
      + 'and cannot re-address it. Sign in to forward it.',
  }),
  MACHINE_CANNOT_RESOLVE: Object.freeze({
    check: 'C-32.11',
    where: at("taskResolve", "is-machine-resolve"),
    translation: 'Closing an obligation says the thing the record asked for has been answered, and '
      + 'somebody has to be willing to say that. The credential that asked here is an automated '
      + 'one — it may surface the work and prepare what it needs, and closing work that is '
      + 'nobody\'s is still closing it. Sign in to resolve it.',
  }),
});

/* C-33.27, C-33.44, C-33.50 — the act-shape rows of the personal half and of the dispose dispatch. */
export const QUEUE_ACT_CHECKS = Object.freeze({
  /* REC-64 / C-33.27: an OBLIGATION is never muted (R19, R31). */
  KIND_NOT_PERSONAL: Object.freeze({
    check: 'C-33.27',
    where: at("queueMute", "is-mute-class"),
    translation: 'Setting this aside would be a change everybody sees rather than a private choice '
      + 'of yours, and that is a decision the group takes together rather than one this control '
      + 'makes. The kinds you can quiet for yourself are listed beside the refusal.',
  }),
  /* REC-205 / C-33.44: a CONDITION or an OBLIGATION named to the dispose act (R28). The translation names the act that
     does reach the item, since a member holding a selection needs the next move. N301: what the record NOTICED. */
  CLASS_NOT_DISPOSED: Object.freeze({
    check: 'C-33.44',
    where: at("proposeDispose", "is-dispose-class"),
    translation: 'This is not something the record disposes of. Deferring and dismissing are decisions '
      + 'about something the record NOTICED — its own question — and this item is a different kind of thing: a '
      + 'CONDITION is a fact about our machinery that you silence for yourself, and an OBLIGATION is work '
      + 'a named person owes and leaves every list when it is resolved. Nothing about it was changed, and '
      + 'it is still in your list. The answer names the act that does reach it.',
  }),
  /* R29 (D-623) / C-33.50: the project arm with no project, and the bridge's FINDING key (R27, R28). One code, one
     sentence at both sites: setting a noticed item aside is one team's decision, and the team was not named. */
  NO_PROJECT_SCOPE: Object.freeze({
    check: 'C-33.50',
    where: at("#noProjectScope", "is-dispose-scope"),
    translation: 'Setting this aside is a decision one project takes for its own list, and no project was named '
      + 'for it. Choose the project you are acting for (the item lists the ones it is filed under) and ask again. '
      + 'Nothing was written, and no team\'s list moved.',
  }),
});

/* D-126 / C-76 — THE TASK-ACTOR FENCE'S REFUSAL (REC-4): a member who is neither a task's assignee nor an administrator
 * may not resolve or forward it, unless it is `unassigned` (R25). A selection can meet it, so it carries its sentence.
 * The `detail` names who holds the task; the translation does not, because it is canned. */
export const TASK_ACTOR_CHECKS = Object.freeze({
  NOT_YOURS: Object.freeze({
    check: 'C-76.1',
    where: at("#refuseNotYours", "is-task-actor-fence"),
    translation: 'This task is not yours to act on: it is with another member now, so nothing was done to it. '
      + 'The record says below who holds it. Ask them, or an administrator, if it still needs you.',
  }),
});

/** A refusal carrying its row: `{ok: false, reason, code, check, translation, …extra}`. `row` is one of the rows
 *  above; the code is the caller's string literal, so the DEC-49 guard can read it at the site. */
export function queueRefusal(code, row, extra = {}) {
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, ...extra };
}
