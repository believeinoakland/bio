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
 * as affordances.mjs lets the affordances suite hold deriveActs. The plane's store (`src/plane/store.mjs`)
 * cannot be imported outside workerd (it imports cloudflare:workers), and a
 * rule that can only be exercised through a Durable Object is a rule that gets
 * exercised less.
 */

/* THE CONDITION-KIND VOCABULARY is `observation-log`'s (R5; K78 (3), N49, N114): the condition kinds a look may
 * carry (C-22.4) and the kinds a member may lawfully mute are one list, kept in one place, so the two cannot drift.
 * It is a VOCABULARY, not a producer. What it gives the mute is the set of kinds a member may lawfully mute, which
 * is what the fence needs in order to refuse anything else BY NAME rather than by silence. The list is larger than
 * the feed can emit (not every kind has a producer), which is the safe direction: the fence accepts a mute for
 * a kind whose generator is not built, and the mint refuses any CONDITION kind this list does not name. A surface
 * never keeps a copy of it; it reads it from the refusal or from op=queue's own answer. */
/* R5 (K608, K611): beside observation-log's kinds (twenty since T23, K1099), the one condition kind that is not a
 * look's: a deadline on one of the group's actions passed while its entry is still pending (`queue-producers` R15, from
 * `action-clocks.overdueClocks`).
 * A CONDITION and not a FINDING (K611): it is said once, when the date passes, and a member quiets it for themselves;
 * the action's own record is where the overdue entry is met or waived. It is queue's to add and not observation-log's,
 * because no look ever carries it (C-22.4 checks a look's condition against observation-log's list alone). */
import { CONDITION_KINDS } from "./observation-log/vocabulary.mjs";
export const QUEUE_CONDITION_KINDS = Object.freeze({
  ...CONDITION_KINDS,
  "action-clock-overdue":       "a deadline on one of the group's actions passed while its entry is still pending "
                              + "(DEC-94) — LIVE: queue-producers R15, from action-clocks' overdueClocks",
});

/* Every OTHER kind the catalogue names, with the class it belongs to — so a
 * refusal can say what the kind ACTUALLY is instead of only what it is not, and
 * so a suite can assert that every kind a live producer emits is classified.
 *
 * THE THREE LIVE SPELLINGS MATTER and are carried exactly as the producers emit
 * them: `authority-undetermined` is the kind `tasks`' drain routes (D-98);
 * `missing_predecessor` and `overdue_successor` are the two kinds
 * `queue-producers/proposals.mjs` emits from proposalsFeed. If one of those were absent here the fence would refuse it as
 * UNKNOWN rather than as MISCLASSED, which is a weaker and less true answer. */
export const QUEUE_OBLIGATION_KINDS = {
  "authority-undetermined":      "authority undetermined at capture (D-98, RULED: created automatically) — LIVE: capture's task kinds, drained by tasks",
  /* CORRECTED 2026-08-05 (REC-47 / DEC-46 (d), D-188). This read "blocks a
     transition", which is the PRE-DEC-20 blanket rule and the opposite of the
     doctrine: ordinary bias debt is DISCLOSED and travels; only an uncleared
     HUNCH disqualifies. DEC-20 narrowed the old state-transition gate to hunches
     too (that gate is since retired, K899 (3)), so nothing about this kind blocks
     anything. The producer is unbuilt
     (D-86's remaining half), which is why this is free to correct now — and
     exactly why it had to be, since the producer would have been built to the
     sentence. The identical wording in NOTIFICATIONS.md is corrected with it.
     LIVE from 2026-09-23 (D-86): the `bias-debt` consumer on the one alarm raises one item per run whose lens
     `moved`, read from aiRunRead and never compared again; queue-producers #obligationsBiasDebt serves it on op=queue. */
  "bias-debt":                   "a re-run is owed after a lens change (D-86) — DISCLOSED, never blocking (DEC-20) "
                              + "— LIVE: bias's debt sweep, served by queue-producers #obligationsBiasDebt",
  "endorsement-owed":            "an endorsement is owed on a pending administrator or owner vote",
  "expertise-confirmation-owed": "an expertise declaration awaits an administrator's confirmation",
  "membership-request":          "a membership request is at the doorbell",
  "project-owners-inactive":     "every owner of a project is inactive; rescue is available (D-47)",
  /* N345 (R1; DEC-84 item 2, DEC-85): a duty is never muted, dismissed or set aside, and it leaves only by resolution
     (contradiction R24), so both are OBLIGATIONs. Their producers are `queue-producers`' (its R4, R7). */
  "contradiction-duty":          "a conflict the record holds that a member of this project must resolve (N345)",
  "contradiction-duty-unseen":   "something this project rests on is in conflict with a record you cannot see; "
                              + "your project can ask to resolve it (DEC-85)",
  /* N375 (R1; membership R89, K535, K566): a key a member registered for themselves is a signer of the group's bundles
     until an administrator decides otherwise, so it is an OBLIGATION of the administrators, never muted. Its producer is
     `queue-producers`' (its R14), which offers membership's revoke. */
  "signer-self-registered":      "a member registered their own signing key; you may revoke it (N375)",
  /* The Action layer (R1; K608, K613, K614; BIO_Action_v0_1.md §4 rule 5): three OBLIGATIONs, each a judgement or an
     answer a named member owes, each leaving by its own act (R12's doors) and never by a mute. Their producers are
     `queue-producers`' (its R16, R17, R18). */
  "plan-checkpoint-due":         "a checkpoint your group set in an action plan has come; a member judges whether its "
                              + "condition was met (op=checkpointrecord) — LIVE: queue-producers R16",
  "escalation-stage-proposed":   "an escalation's next stage is proposed because its trigger was met; a member advances "
                              + "it or declines with a reason (op=escalationadvance, op=escalationdecline) "
                              + "— LIVE: queue-producers R17",
  "action-reminder":             "a reminder you asked for on one of the group's action deadlines; answer it with "
                              + "another reminder or none (op=reminderanswer, DEC-94) — LIVE: queue-producers R18",
  /* K899 (7), DEC-61, DEC-113 (R1; actions R52, R56): a reply the group marked as legal pressure asks the group whether
     to place a litigation hold; a member answers by placing the hold (op=actionhold) or releasing it
     (op=actionholdrelease, its own act since DEC-113), each with a reason, and those acts are the item's doors (R12). An
     OBLIGATION, never muted. Its producer is `queue-producers`' (its R19). */
  "litigation-hold":             "a reply the group marked as legal pressure: consider whether to place a litigation "
                              + "hold, and record it in place or released with a reason (op=actionhold to place it, "
                              + "op=actionholdrelease to release it; DEC-61, DEC-113) — LIVE: queue-producers R19",
  /* K921 (R1; filing-templates R9, local-facts R1): two more OBLIGATIONs a named member owes, each leaving by its own act
     (R12's doors) and never by a mute. Their producers are `queue-producers`' (its R20, R21). */
  "template-review-requested":   "a member asked you to review a filing template's version (op=templatereview) "
                              + "— LIVE: queue-producers R20",
  "local-fact-due":              "a holiday calendar or office hours one of the group's deadlines reads is unconfirmed "
                              + "or due for confirmation (op=factconfirm) — LIVE: queue-producers R21",
  /* DEC-102 item 3, K1019 (R1; publication R17): a case edition being prepared reaches an observation the member authored
     and they have chosen no credit level for it. Theirs alone to answer, by choosing one (R12's door, op=attribute), and
     never muted. Its producer is `queue-producers`' (its R23). */
  "attribution-unchosen":        "a case edition being prepared reaches an observation you authored and you have chosen "
                              + "no credit level for it; choose one (op=attribute) — LIVE: queue-producers R23",
  /* DEC-116 item 2 (R1, R50; docket R9): the docket's required core is a To-do for the case's manager until it is done,
     so it is an OBLIGATION, never muted; it leaves by placement or, for a submission, a decline (R50's doors). Its
     producer is `queue-producers`' (its R30). */
  "docket-core-due":             "a case you manage has an item its docket must list: a response or statement from its "
                              + "subject or a holder of standing, a newer edition, or a conflict on a load-bearing finding "
                              + "not disclosed; place it, or decline it (op=docketprepare, op=docketdecline; DEC-116) "
                              + "— LIVE: queue-producers R30",
};

export const QUEUE_FINDING_KINDS = {
  "missing_predecessor":        "a required predecessor stage is absent (D-73) — LIVE: queue-producers/proposals.mjs",
  "overdue_successor":          "a required successor is past its declared deadline (DEC-10) — LIVE: queue-producers/proposals.mjs",
  /* N107 (K147): progressions R31's finding, aggregated one per (progression, stage) by `queue-producers/proposals.mjs` in its
     own words, because it is not "required and absent". It decides nothing about which document belongs. */
  "cardinality_exceeded":       "a stage declared to hold at most one document holds more; noticed, which decides "
                              + "nothing about which of them belongs (framework 8.2) — LIVE: queue-producers/proposals.mjs",
  "temporal-expectation-due":   "a temporal expectation is coming due (framework 8.2, D-73)",
  "source-modified":            "a monitor tick found the source modified — LIVE: queue-producers #findingsSourceFlagged",
  "source-removed":             "a monitor tick found the source removed (404/410) — LIVE: queue-producers #findingsSourceFlagged",
  "duplicate-document":         "a duplicate document was detected (D-60)",
  "link-verdict-changed":       "a link verdict was established or changed when a target landed (LINK-FIDELITY 8)",
  "reused-asset-changed":       "a reused asset was later found changed, post-hoc (CAP-4)",
  "assistant-surfaced-focus":   "an assistant surfaced a question (D-78, D-82 — must LOOK derived)",
  "grade-improvable":           "a connection's grade is improvable (D-72)",
  "objective-gap":              "a gap derived from an objective's satisfaction condition (D-76) — LIVE: queue-producers #findingsObjectiveGap",
  "measure-decay":              "a bias statement's measure has decayed (D-87, D-90 — reports, never blocks)",
  /* D-52, LIVE 2026-09-23: queue-producers #findingsExportPerformed, derived on read from `export_log`
     and raised to every administrator and to nobody else (Membership v2 §8.1). */
  "export-performed":           "an export was performed; every administrator is notified (D-52 8.1) "
                              + "— LIVE: queue-producers #findingsExportPerformed",
  "audit-finding":              "op=audit found something about the record",
  "register-unbacked":          "a register entry's bytes are unbacked (D-9, D-45)",
  /* PL-15 / D-213, ANSWERED 2026-08-06 by Bob and LIVE from this item:
     queue-producers #findingsOutOfInquiryLead. Evidence bearing on inquiry B, met
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
                              + "— LIVE: queue-producers #findingsOutOfInquiryLead",
  /* PL-13 / IS-3, MINTED 2026-08-09, and BOTH ARRIVE WITH A PRODUCER. The plan
     row named these two slugs; UI-45 asserted them ABSENT so the gap would have
     an alarm on it rather than be a comment, and this is the item that sets the
     alarm off on purpose. Neither is a word without a generator: see queue-producers'
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
     other member's list; the old `test/current.test.mjs` (deleted in T20) drove exactly that — the mute
     accepted, personal, writing no disposition, the finding still on a second
     member's feed — where it used to drive a refusal; `test/m/queue/feed.test.mjs`' R16 test holds it now. */
  "stance-changed-here-not-elsewhere":
                                "a project moved what it stands on for a SHARED question and the other "
                              + "projects drawing on it did not: one question, two live readings, "
                              + "refused by nothing (§7, D-216 — per-project stance) "
                              + "— LIVE: queue-producers #findingsStanceDiverged",
  "new-version-arrived-from-another-team":
                                "a new reading of a question this project draws on was proposed under "
                              + "ANOTHER project's work, so it arrived without anybody here authoring it "
                              + "(§7, D-216 — one question beneath several projects) "
                              + "— LIVE: queue-producers #findingsVersionFromAnotherTeam",
  /* REC-124 / INVESTIGATIVE-SESSION.md §7.1 item 3. FINDING for §7's reason:
     another team concluding the question you share is a fact about the work,
     and no member may silence it for the team. */
  /* N172 (reevaluation R14): a newer capture of something a member's reference is pinned to was graded affected or
     undetermined; the member adopts the newer version or keeps the earlier one (reevaluation R15). */
  "newer-capture-affects-reference":
                                "a newer capture of something your reference is pinned to may change what it says; "
                              + "adopt the newer version or keep the earlier one (reevaluation R14, R15) "
                              + "— LIVE: queue-producers #findingsNewerCapture",
  "shared-inquiry-concluded-by-another-project":
                                "another project drawing on a SHARED question concluded it, adopting "
                              + "the claim of the reading it stands on; nothing this project stands on "
                              + "or concluded has moved (§7.1 — a conclusion is per-project) "
                              + "— LIVE: queue-producers #findingsConcludedElsewhere",
  /* N345 (R1; DEC-76 item 3, DEC-84 items 1, 3, 7, 13; DEC-85): what the record noticed about conflicts, each leaving a
     list by an attributed act (R46), never by one member's preference alone. Their producers are `queue-producers`'
     (its R4–R7). */
  "contradiction-lead":         "a lead the record noticed: two things it holds may be in conflict (N345)",
  "contradiction-plurality":    "two projects' conclusions that may not both hold (N345)",
  "contradiction-plurality-unseen":
                                "this project's conclusion may not hold together with a conclusion you cannot see (DEC-85)",
  "side-corrected":             "something a finding rests on was marked wrong (N345)",
  "tension-after-publication":  "a published case's finding rests on a conflict found since it was published (N345)",
  /* DEC-116 items 3, 7 (R1, R50; reevaluation R30, docket R12): what a case edition's docket did to something a
     finding rests on. Each leaves as `side-corrected` does, by a recorded re-evaluation (R50). Their producer is
     `queue-producers`' (its R31). */
  "edition-withdrawn":          "something a finding rests on is in a case edition its group has withdrawn (DEC-116) "
                              + "— LIVE: queue-producers R31",
  "edition-contested":          "a response the group filed contests a case edition this finding is part of (DEC-116) "
                              + "— LIVE: queue-producers R31",
  /* DEC-113 (R1; actions R56, R59): the administrators and whoever placed the hold are told once that it was released.
     Something the record noticed, which the recipient disposes of (R12's FINDING disposition). Its producer is
     `queue-producers`' (its R29). */
  "litigation-hold-released":   "a member released a litigation hold: the projects it alone covered may be purged again "
                              + "and their assistant transcripts deleted on schedule (DEC-113) — LIVE: queue-producers R29",
};

/* THE N-NUMBERS — the catalogue's STABLE IDS, allocated when a generator is built and not before
 * (NOTIFICATIONS.md §The catalogue; `N-<n>` beside `C-<n>`). A row here IS the allocation: a generator
 * built later takes the next free number by adding its row here (the old process's `tools/mintid.mjs`,
 * retired with `tools/` in T19, read these rows as its register for `N`).
 *
 * THE SLUG STAYS THE ITEM'S `kind`, AND THAT IS DELIBERATE RATHER THAN UNFINISHED. The item contract's
 * sketch puts the id in `kind`, but every reader of `kind` today — the mint's `classOfKind`, the mute
 * fence, `op=affordances`' vocabularies, the surface's rendered sentence — is keyed on the slug, so
 * moving the id into `kind` is an interface change to every consumer and not a numbering. The id is
 * published BESIDE the kind, as `catalogue_id`, by the producer that took it. A generator built later
 * takes the next number here; a kind with no generator takes none.
 *
 * NOT EXPORTED, AND THAT IS ITS SHAPE RATHER THAN AN ESCAPE (D-52 fix pass, 2026-09-23). Every
 * EXPORTED plain object of this module whose values are all strings is a MEMBER-FACING vocabulary —
 * the texts a surface renders in place of a machine word (R1: every kind has one sentence). This table
 * is not one: its value is a machine id published as `catalogue_id`, the item contract's "stable
 * catalogue id" (NOTIFICATIONS.md §The item contract), which no surface renders (`civicos-ui/` reads no
 * `catalogue_id`; a member reads `summary` and `detail`). Found by the old DEC-49 guard's arm E
 * (`civicos-ui/check-refusal-codes.mjs`, deleted in T20), which read it exported as a 23rd vocabulary
 * whose one term was the token "N-1". So the TABLE stays here, unexported, and what leaves the module is
 * the LOOKUP below, R2's `catalogueIdOf`, which `test/m/queue/catalogue.test.mjs`' R2 test drives. */
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
  OBLIGATION: "a to-do is something a named person must do for the record to proceed, and it leaves "
            + "every list only when it is DONE (op=taskresolve, or the act its item names as "
            + "`disposition.instead`): record state, not a preference. "
            + "Quieting it would remove it from the only list that routes it while `tasks` keeps no "
            + "per-member quiet, so the record would go on believing the question reached a person.",
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
