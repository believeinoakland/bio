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
 * CORRECTED 2026-09-22 by BOB #26's ruling (D-125, NOTIFICATIONS.md "MARKED AS
 * HANDLED"), built by D-125's landing: a member may PERSONALLY stop being
 * notified of a FINDING too — DEC-10's (b) per item and (c) per case over the
 * kinds named. That does not touch the rule above: a mute is keyed on the
 * MEMBER, so it removes nothing from any other member's list, and a finding
 * still leaves the TEAM's list only by the authored disposition, which a mute
 * never writes. The sentence below said "CONDITION KINDS ONLY" and guarded the
 * right hazard with the wrong key; it now reads OBLIGATION-free.
 *
 * SO `muted_kinds` MAY CONTAIN NO OBLIGATION KIND, and the fence is at the
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
 * D-523 (2026-09-25) added a TWELFTH kind WITH its producer, `render-deferred`,
 * so four of the twelve are now emitted by op=queue and the other eight are not.
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
  /* D-523, LIVE from its landing: store.mjs #conditionsRenderDeferred, derived on read from
     `capture_requests`. BOB #33 RULED 2026-09-24 19:54Z (CLIENT-RENDERED.md, "RULED 2026-09-24 by BOB #33"):
     a render held under a C-83 reason is SHOWN with that reason, and at its request's `expires` it is
     recorded UNDETERMINED and released. A CONDITION and not a FINDING: our own renderer, allowance or
     pacing is what holds it, a fact about our machinery and never about the page. */
  "render-deferred":              "a render this instance could not do is held under its C-83 reason until its "
                              + "request expires, and is then recorded undetermined (D-491, D-523) "
                              + "— LIVE: store.mjs #conditionsRenderDeferred",
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
  /* CORRECTED 2026-08-05 (REC-47 / DEC-46 (d), D-188). This read "blocks a
     transition", which is the PRE-DEC-20 blanket rule and the opposite of the
     doctrine: ordinary bias debt is DISCLOSED and travels; only an uncleared
     HUNCH disqualifies. DEC-20 narrowed the workproduct_state half to hunches
     too, so nothing about this kind blocks anything. The producer is unbuilt
     (D-86's remaining half), which is why this is free to correct now — and
     exactly why it had to be, since the producer would have been built to the
     sentence. The identical wording in NOTIFICATIONS.md is corrected with it.
     LIVE from 2026-09-23 (D-86): the `bias-debt` consumer on the one alarm raises one item per run whose lens
     `moved`, read from aiRunRead and never compared again; store.mjs #obligationsBiasDebt serves it on op=queue. */
  "bias-debt":                   "a re-run is owed after a lens change (D-86) — DISCLOSED, never blocking (DEC-20) "
                              + "— LIVE: store.mjs #biasDebtSweep",
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
  /* D-52, LIVE 2026-09-23: store.mjs #findingsExportPerformed, derived on read from `export_log`
     and raised to every administrator and to nobody else (Membership v2 §8.1). */
  "export-performed":           "an export was performed; every administrator is notified (D-52 8.1) "
                              + "— LIVE: store.mjs #findingsExportPerformed",
  "audit-finding":              "op=audit found something about the record",
  "register-unbacked":          "a register entry's bytes are unbacked (D-9, D-45)",
  /* PL-15 / D-213, ANSWERED 2026-08-06 by Bob and LIVE from this item:
     store.mjs #findingsOutOfInquiryLead. Evidence bearing on inquiry B, met
     while a run was working inquiry A, is CAPTURED — an entry to the store, and
     deliberately NOT an entry to any leg of any claim — and the OBSERVATION
     becomes this item.

     FINDING AND NOT CONDITION, and the distinction is doctrine rather than
     taxonomy. A CONDITION is a fact about our own machinery and is personally
     MUTABLE (D-125, DEC-16); a lead is a fact about the WORLD that a team must
     see, and one member's inbox hygiene must not be able to make it disappear
     for everybody with nothing recorded. It leaves the list the way every
     finding does — adopted, deferred or dismissed through op=proposedispose,
     an authored record act carrying its author and its reason. */
  "out-of-inquiry-lead":        "evidence for ANOTHER question was met while working this one: captured, "
                              + "and deliberately not made part of any claim (D-213, DEC-60) "
                              + "— LIVE: store.mjs #findingsOutOfInquiryLead",
  /* PL-13 / IS-3, MINTED 2026-08-09, and BOTH ARRIVE WITH A PRODUCER. The plan
     row named these two slugs; UI-45 asserted them ABSENT so the gap would have
     an alarm on it rather than be a comment, and this is the item that sets the
     alarm off on purpose. Neither is a word without a generator: see store.mjs
     `#findingsStanceDiverged` and `#findingsVersionFromAnotherTeam`.

     THEY EXIST BECAUSE D-216's ANSWER IS **PER-PROJECT** (measured 2026-08-08,
     driven through twelve ops, not read). An inquiry shared across projects
     holds NO stance in its own bytes; each project authors its own dated
     pointer, and two projects may stand on two different readings of one
     question SIMULTANEOUSLY with the plane refusing neither. That is the right
     model and it has a cost, which is exactly what these two kinds carry: the
     divergence is now INVISIBLE unless somebody is told, because nothing
     refuses it and nothing reconciles it. A model that permits divergence
     silently is a model that lets a team build a case on a reading its partners
     abandoned a month ago.

     FINDING AND NOT CONDITION, and it is doctrine rather than taxonomy — the
     plan row's own second negative-control arm turns on it. A CONDITION is a
     fact about OUR OWN MACHINERY and is personally MUTABLE (D-125, DEC-16). A
     divergence of stance is a fact about the WORLD OF THE WORK: another team
     reads the shared question differently. One member's inbox hygiene must not
     be able to make that disappear for everybody with nothing recorded.
     Both leave a list the way every finding does — by an authored, attributed
     act. CORRECTED 2026-09-23 (D-125, BOB #26's ruling): a member MAY now mute
     either one for THEMSELVES, because a mute is keyed on the member and moves no
     other member's list; `test/current.test.mjs` drives exactly that — the mute
     accepted, personal, writing no disposition, the finding still on a second
     member's feed — where it used to drive a refusal. */
  "stance-changed-here-not-elsewhere":
                                "a project moved what it stands on for a SHARED question and the other "
                              + "projects drawing on it did not: one question, two live readings, "
                              + "refused by nothing (§7, D-216 — per-project stance) "
                              + "— LIVE: store.mjs #findingsStanceDiverged",
  "new-version-arrived-from-another-team":
                                "a new reading of a question this project draws on was proposed under "
                              + "ANOTHER project's work, so it arrived without anybody here authoring it "
                              + "(§7, D-216 — one question beneath several projects) "
                              + "— LIVE: store.mjs #findingsVersionFromAnotherTeam",
  /* REC-124 / INVESTIGATIVE-SESSION.md §7.1 item 3. FINDING for §7's reason:
     another team concluding the question you share is a fact about the work,
     and no member may silence it for the team. */
  "shared-inquiry-concluded-by-another-project":
                                "another project drawing on a SHARED question concluded it, adopting "
                              + "the claim of the reading it stands on; nothing this project stands on "
                              + "or concluded has moved (§7.1 — a conclusion is per-project) "
                              + "— LIVE: store.mjs #findingsConcludedElsewhere",
};

/* THE N-NUMBERS — the catalogue's STABLE IDS, allocated when a generator is built and not before
 * (NOTIFICATIONS.md §The catalogue; `N-<n>` beside `C-<n>`). A row here IS the allocation: it is the
 * site `tools/mintid.mjs` registers for `N`, and a number is taken only with `node tools/mintid.mjs N`.
 *
 * THE SLUG STAYS THE ITEM'S `kind`, AND THAT IS DELIBERATE RATHER THAN UNFINISHED. The item contract's
 * sketch puts the id in `kind`, but every reader of `kind` today — the mint's `classOfKind`, the mute
 * fence, `op=affordances`' vocabularies, the surface's rendered sentence — is keyed on the slug, so
 * moving the id into `kind` is an interface change to every consumer and not a numbering. The id is
 * published BESIDE the kind, as `catalogue_id`, by the producer that took it. A generator built later
 * takes the next number here; a kind with no generator takes none.
 *
 * NOT EXPORTED, AND THAT IS ITS SHAPE RATHER THAN AN ESCAPE (D-52 fix pass, 2026-09-23). The DEC-49
 * guard's arm E (`civicos-ui/check-refusal-codes.mjs`) harvests every EXPORTED plain object of this
 * module whose values are all strings as a MEMBER-FACING vocabulary — the texts a surface renders in
 * place of a machine word. This table is not one: its value is a machine id published as
 * `catalogue_id`, the item contract's "stable catalogue id" (NOTIFICATIONS.md §The item contract),
 * which no surface renders (`civicos-ui/` reads no `catalogue_id`; a member reads `summary` and
 * `detail`). Exported, it read as a 23rd vocabulary whose one term was the token "N-1" and failed the
 * guard for a reason that was not true of it. So the TABLE stays here, where `tools/mintid.mjs N` reads
 * its rows as text, and what leaves the module is the LOOKUP below — a function, which arm E does not
 * harvest, exactly as it does not harvest `classOfKind`. */
const QUEUE_KIND_IDS = {
  "export-performed": "N-1",
};

/* The catalogue id a kind was allocated, or null for a kind that has none — which is most of them
 * (a kind takes an id when its generator is built). Null is not an error: it says no generator has
 * taken a number, and a producer publishes it as such rather than inventing one. */
export function catalogueIdOf(kind) {
  return Object.prototype.hasOwnProperty.call(QUEUE_KIND_IDS, kind) ? QUEUE_KIND_IDS[kind] : null;
}

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
/* D-125 (BOB #26, 2026-09-22): the FINDING sentence is GONE, because a FINDING is
 * no longer refused — a member may mute one for themselves (DEC-10's (b) and (c)).
 * What it guarded, one member erasing the group's question, a MEMBER-keyed mute
 * cannot do: the finding stays on every other feed and in op=proposals, and it
 * leaves the team's list only by op=proposedispose. OBLIGATION alone is refused. */
export const MUTE_REFUSAL_DETAIL = {
  OBLIGATION: "an OBLIGATION is something a named person must do for the record to proceed, and it leaves "
            + "every list only when it is RESOLVED (op=taskresolve) — record state, not a preference. "
            + "Muting it would remove it from the only surface that routes it while `tasks` carries no "
            + "per-member mute, so the record would go on believing the question reached a person.",
};

/* The classes a PERSONAL mute may reach, in either form (D-125). A CONDITION and
 * a FINDING; never an OBLIGATION. One list, read by the one write. */
export const PERSONALLY_MUTABLE_CLASSES = ["CONDITION", "FINDING"];

/* D-125's ITEM form (DEC-10 (b)) and D-170's widening: the class of a queue item
 * named by its published id, or null. The id is the item's STABLE IDENTITY as
 * op=queue mints it — `FINDING::<progression>::<stage>` (the key
 * proposal_dispositions already uses), `FINDING::<kind>::…`,
 * `CONDITION::<kind>::…` — so the class is its first segment and nothing is
 * inferred. An OBLIGATION's id is an opaque task id with no class segment, so it
 * answers null here and the store asks `tasks` to name it (the refusal must say
 * OBLIGATION, not merely "unknown"). A segment with nothing after it is not an
 * item id. */
export function itemClassOf(id) {
  if (typeof id !== "string") return null;
  const m = /^(FINDING|CONDITION)::(.+)$/.exec(id.trim());
  return m && m[2].trim() ? m[1] : null;
}

/* The ITEM half of the admission decision: is THIS item muted by id for this
 * member? `itemMutes` is a Set of item ids. An OBLIGATION is never matched even
 * if its id were somehow in the set — the write refuses one, and this read does
 * not trust the column to have been written by that write alone (D-125: an
 * OBLIGATION stays unmutable). Returns true or false. */
export function mutedAsItem(item, itemMutes) {
  if (!item || !itemMutes || itemMutes.size === 0) return false;
  if (!PERSONALLY_MUTABLE_CLASSES.includes(item.class)) return false;
  return typeof item.id === "string" && itemMutes.has(item.id);
}

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
 * AN UNGROUPED ITEM CANNOT BE MUTED BY CASE, and that is not an oversight.
 * queue_state is keyed (member_id, case_id); an item with no home has no case to
 * mute against, and inventing a pseudo-case for it would be the same invented
 * home REC-20 refuses to give it. Its way out is the ITEM form (`mutedAsItem`
 * above, D-125/D-170), keyed on the item's own id and on no case. */
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
