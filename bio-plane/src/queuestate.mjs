/* REC-21 — the PERSONAL half of the queue, kept structurally distinct from the
 * record half, and the one doctrine rule that keeps them apart.
 *
 * THE RULE, and it is doctrine rather than preference (D-125's first-named
 * hazard, restated by DEC-16): **muting is PERSONAL and dismissing is a RECORD
 * ACT, and they must never be one control.** An OBLIGATION leaves everyone's
 * list when it is RESOLVED, which is record state. A FINDING leaves the list
 * when it is adopted, deferred or dismissed, which is an authored record act
 * carrying its author and reason (op=proposedispose). A CONDITION — a fact
 * about our own machinery rather than about the world — is acknowledged or
 * MUTED, and that is personal only: the condition persists and every other
 * member still sees it (NOTIFICATIONS.md, "MARKED AS HANDLED", which calls this
 * "the rule most likely to be lost when someone implements a delete button").
 *
 * SO `muted_kinds` MAY CONTAIN CONDITION KINDS ONLY, and the fence is at the
 * WRITE, in queueMute, which is the ONE place the column is ever authored. The
 * concrete failure it prevents is stated by CRITIQUE.md and is worth carrying
 * here where the fence lives: an OBLIGATION is something a NAMED PERSON must do
 * for the record to proceed; a muted case would remove it from the only surface
 * that routes it; and `tasks` carries no per-member mute, so the record would go
 * on believing a question reached a person it cannot reach. Under DEC-16 that
 * is worse rather than better, because one member's resolution now clears every
 * other member's queue: the mute/resolve boundary is what stands between SHARED
 * RESOLUTION and SILENT DISAPPEARANCE.
 *
 * WHY THE CLASS IS CHECKED AT THE WRITE AND NOT AGAIN AT THE READ. A second
 * copy of a rule is a second place for it to drift (C-5, and the reason
 * op=dispose's duplicated state machine is named as the hazard not to repeat).
 * `muted_kinds` is written by exactly one method, which refuses anything that is
 * not a CONDITION kind, so membership in that column already MEANS "a condition
 * kind this member muted". The read therefore asks one question — is this
 * item's kind muted for one of the homes it appears under — and asks it of
 * every item, whatever its class. That is also what makes the failure OBSERVABLE:
 * remove the fence and a real obligation genuinely disappears from a real feed,
 * which is negative control (b) and is the whole point of running it.
 *
 * WHY THIS IS ITS OWN MODULE. It is PURE — no storage, no clock, no viewer — so
 * a suite can hold the decision to the store's own behaviour directly, exactly
 * as affordances.mjs lets the affordances suite hold deriveActs. store.mjs
 * cannot be imported outside workerd (it imports cloudflare:workers), and a
 * rule that can only be exercised through a Durable Object is a rule that gets
 * exercised less.
 */

/* THE CONDITION-KIND VOCABULARY, transcribed from NOTIFICATIONS.md's catalogue
 * ("The catalogue", the entries marked [CONDITION]) and from nowhere else. It
 * is a VOCABULARY, not a producer. What it gives the mute is the set of kinds a
 * member may lawfully mute — which is what the fence needs in order to refuse
 * anything else BY NAME rather than by silence.
 *
 * CORRECTED 2026-08-04 (REC-32). This block used to say "nothing in this plane
 * emits a CONDITION item today (store.mjs QUEUE_CLASSES_DEFERRED declares that
 * absence, HOLE-1)". That was true when REC-21 landed and is now false: three
 * of the eleven kinds below — `governor-holding-host`,
 * `partial-capture-outstanding` and `capture-completed-unattended` — are
 * emitted by op=queue, derived on read from the governor's cool-off, the
 * capture-session ledger and the manifest's machine-writer stamp respectively,
 * and QUEUE_CLASSES_DEFERRED is empty. The other EIGHT still have no producer,
 * so this list remains larger than the feed can emit, which is the correct
 * direction: the fence must be able to accept a mute for a kind whose generator
 * has not been built, or the first generator would silently widen what a member
 * may already have muted. store.mjs refuses at the MINT any CONDITION kind this
 * file does not name, so the two can only ever disagree in the safe direction.
 *
 * The keys are the catalogue's own slugs. NOTIFICATIONS.md is explicit that
 * "Ids are assigned when generators are built, in the catalogue, the way
 * C-numbers are", so a generator that later allocates an N-number replaces its
 * slug here and nowhere else — a surface never keeps a copy of this list, it
 * reads it from the refusal or from op=queue's own answer.
 */
export const QUEUE_CONDITION_KINDS = {
  "monitoring-recheck-due":       "a monitoring recheck or deadline sweep has come due (S-7)",
  "archive-fallback-eligible":    "the archive fallback became eligible: three failures or fourteen days (D-104)",
  "capture-session-ttl-expiring": "a capture session is expiring with work outstanding (CAPTURE-SCALING)",
  "source-unreachable-governed":  "the source was unreachable because OUR pacing governed it, distinguishably from theirs (D-104)",
  "capture-completed-unattended": "a capture the member walked away from has completed (D-61)",
  "partial-capture-outstanding":  "a capture did not finish and subresources are outstanding",
  "text-undetermined":            "no text layer, CID fonts, or over the envelope (CPDF, D-121)",
  "client-rendered-shell":        "a client-rendered shell was captured and is not citable (D-64)",
  "invitation-spent-or-expired":  "an invitation was spent, or expired unused",
  "governor-holding-host":        "the per-host governor is holding a host: the capture is PACED, not broken (D-103)",
  "runtime-ceiling-reached":      "a CPU or subrequest ceiling was reached (D-54, D-56)",
};

/* Every OTHER kind the catalogue names, with the class it belongs to — so a
 * refusal can say what the kind ACTUALLY is instead of only what it is not, and
 * so a suite can assert that every kind a live producer emits is classified.
 *
 * THE THREE LIVE SPELLINGS MATTER and are carried exactly as the producers emit
 * them: `authority-undetermined` is store.mjs TASK_KINDS' only member and the
 * one OBLIGATION any caller can actually raise today (D-98); `missing_predecessor`
 * and `overdue_successor` are the two kinds queueFeed's FINDING half emits from
 * proposalsFeed. If one of those were absent here the fence would refuse it as
 * UNKNOWN rather than as MISCLASSED, which is a weaker and less true answer. */
export const QUEUE_OBLIGATION_KINDS = {
  "authority-undetermined":      "authority undetermined at capture (D-98, RULED: created automatically) — LIVE: store.mjs TASK_KINDS",
  "bias-debt":                   "bias debt owed after a lens change (D-86) — blocks a transition",
  "endorsement-owed":            "an endorsement is owed on a pending administrator or owner vote",
  "expertise-confirmation-owed": "an expertise declaration awaits an administrator's confirmation",
  "membership-request":          "a membership request is at the doorbell",
  "project-owners-inactive":     "every owner of a project is inactive; rescue is available (D-47)",
};

export const QUEUE_FINDING_KINDS = {
  "missing_predecessor":        "a required predecessor stage is absent (D-73) — LIVE: queueFeed's FINDING half",
  "overdue_successor":          "a required successor is past its declared deadline (DEC-10) — LIVE: queueFeed's FINDING half",
  "temporal-expectation-due":   "a temporal expectation is coming due (framework 8.2, D-73)",
  "source-modified":            "a monitor tick found the source modified",
  "source-removed":             "a monitor tick found the source removed (404/410)",
  "duplicate-document":         "a duplicate document was detected (D-60)",
  "link-verdict-changed":       "a link verdict was established or changed when a target landed (LINK-FIDELITY 8)",
  "reused-asset-changed":       "a reused asset was later found changed, post-hoc (CAP-4)",
  "assistant-surfaced-focus":   "an assistant surfaced a question (D-78, D-82 — must LOOK derived)",
  "grade-improvable":           "a connection's grade is improvable (D-72)",
  "objective-gap":              "a gap derived from an objective's satisfaction condition (D-76)",
  "measure-decay":              "a bias statement's measure has decayed (D-87, D-90 — reports, never blocks)",
  "export-performed":           "an export was performed; every administrator is notified (D-52 8.1)",
  "audit-finding":              "op=audit found something about the record",
  "register-unbacked":          "a register entry's bytes are unbacked (D-9, D-45)",
};

/* The ONE class lookup. Returns "CONDITION" | "OBLIGATION" | "FINDING", or null
 * for a kind the catalogue does not name — three-valued in the same sense the
 * rest of this record is: unknown is not the same as wrong, and the refusals
 * below say which one happened. */
export function classOfKind(kind) {
  if (typeof kind !== "string" || !kind) return null;
  if (Object.prototype.hasOwnProperty.call(QUEUE_CONDITION_KINDS, kind)) return "CONDITION";
  if (Object.prototype.hasOwnProperty.call(QUEUE_OBLIGATION_KINDS, kind)) return "OBLIGATION";
  if (Object.prototype.hasOwnProperty.call(QUEUE_FINDING_KINDS, kind)) return "FINDING";
  return null;
}

/* How a member is told, in the plane's own words, why a kind may not be muted.
 * Named per class rather than one generic string, because the ANSWER differs:
 * an obligation is resolved and a finding is dismissed, and each of those is a
 * real act on a real surface the member can reach. A refusal that only says no
 * is the gate that pressures somebody into inventing a way past it. */
export const MUTE_REFUSAL_DETAIL = {
  OBLIGATION: "an OBLIGATION is something a named person must do for the record to proceed, and it leaves "
            + "every list only when it is RESOLVED (op=taskresolve) — record state, not a preference. "
            + "Muting it would remove it from the only surface that routes it while `tasks` carries no "
            + "per-member mute, so the record would go on believing the question reached a person.",
  FINDING:   "a FINDING is something that may become evidence, and it leaves the list when it is adopted, "
           + "deferred or dismissed (op=proposedispose) — an AUTHORED RECORD ACT carrying its author and "
           + "reason, which stays in the record. Muting it would let one member's inbox hygiene erase the "
           + "group's question with nothing recorded about who did it or why.",
};

/* muted_kinds is ONE TEXT column holding a set. Stored as a sorted,
 * comma-separated list: sorted so the same set has one representation and a
 * suite can compare bytes, comma-separated because every kind is a slug and no
 * kind may contain a comma (the write refuses one). JSON would be the other
 * choice and buys nothing here except a parse that can throw. */
export function serializeMutedKinds(kinds) {
  return [...new Set((kinds || []).filter((k) => typeof k === "string" && k))].sort().join(",");
}
export function parseMutedKinds(text) {
  if (typeof text !== "string" || !text) return [];
  return [...new Set(text.split(",").map((k) => k.trim()).filter(Boolean))].sort();
}

/* THE ADMISSION DECISION, and the ONLY one. Given a queue item (its kind and
 * the homes REC-20's every-ancestor walk gave it) and this member's mute rows,
 * answer WHICH case suppresses it, or null.
 *
 * `mutes` is a Map case_id -> Set(kind). It is deliberately not the raw rows:
 * building it is the store's business (it reads the table), deciding is this
 * function's, and the separation is what lets the suite ask the question
 * without a Durable Object.
 *
 * THE SCOPE RULE — a mute is scoped to the KINDS PRESENT WHEN IT WAS MADE. It
 * is enforced HERE by the plainest possible mechanism: membership. The mute
 * stores the kinds the member named; a kind that was not named is not in the
 * set; a NEW kind arriving on a muted case is therefore not suppressed and
 * still reaches them. There is no wildcard and no "mute the case" — muting a
 * CASE rather than its kinds is precisely the delete button the doctrine
 * forbids, and the shape of this column is what makes it unavailable.
 *
 * AN UNGROUPED ITEM CANNOT BE MUTED, and that is not an oversight. queue_state
 * is keyed (member_id, case_id); an item with no home has no case to mute
 * against, and inventing a pseudo-case for it would be the same invented home
 * REC-20 refuses to give it. */
export function suppressedBy(item, mutes) {
  if (!item || !mutes || mutes.size === 0) return null;
  const kind = item.kind;
  if (typeof kind !== "string" || !kind) return null;
  const homes = (item.case && Array.isArray(item.case.ancestors)) ? item.case.ancestors : [];
  for (const a of homes) {
    const set = mutes.get(a && a.id);
    if (set && set.has(kind)) return a.id;
  }
  return null;
}
