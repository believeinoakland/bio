/* plane R10 (K842): code moved whole from `store.mjs`, its behaviour unchanged, whose owners' layers had closed when
   `legacy-store` was emptied. Each block is headed with its owner and is held until that owner's T20 job registers its
   share under its own name (record-core R63, retrieval's `registerLegGrades`, promotion's `registerStep`) and deletes it
   here; this file is deleted with the last. Each is registered under the name `plane-held`, at the place in the
   composition root (R2) where `store.mjs` registered it as `legacy-store`. */
import { stepContext } from "../promotion/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { membershipOf, hiddenBundles } from "../membership/index.mjs";
import { runProductionsOf } from "../run-productions/index.mjs";
import { recordOf } from "../record-core/index.mjs";
import { inquiryOf, legCapped } from "../inquiry/index.mjs";
import { extractionOf } from "../extraction/index.mjs";
import { hiddenRuns } from "../ai-runs/index.mjs";

/* The name every held share is registered under. */
export const HELD = "plane-held";

const rows = (ctx, q, ...a) => [...ctx.storage.sql.exec(q, ...a)];
const one = (ctx, q, ...a) => { const r = rows(ctx, q, ...a); return r.length ? r[0] : null; };

/* ===== The stats figures: membership, run-productions, inquiry, basis-versions, observation-log and record-core's
   bundle, file, history, ref and text-index counts (record-core R63, R65). Held until each owner's T20 job (K842). =====

   `counts` registered as the instance's stats source, `({viewer, proof})` answering through the caller's sight. */
export function registerHeldCounts(ctx) {
  return recordOf(ctx).registerStatsSource(HELD, ({ viewer, proof }) => counts(ctx, { proof, viewer }));
}

/** The one body behind both answers, so the wire's counts and purge's proof cannot drift apart
 *  on any key but the ones the ruling names. `proof` is PRIVATE: only `purge` passes it, because
 *  its before/after ARE D-113's proof that it took what it says it took, and that proof stays
 *  WHOLE (§5: *the purge proof's own count stays whole*) — `observations` over the whole log,
 *  `leads`, and `dbBytes`, exactly as `op=purge` has always answered. No route reaches it. */
function counts(ctx, { proof, viewer }) {
  /* D-464 — A COUNT IS TAKEN THROUGH THE CALLER'S OWN SIGHT (Membership v2 §7.9, *"Not its existence"*).
   *
   * WHAT WAS WRONG, measured at the op (`project-sight.test.mjs` §8; MEASUREMENTS M-122 first saw it): every
   * counter here was `count(*)` over the whole table, so a member diffing their own `op=stats` across a colleague's
   * work learned that a project they were never invited to had been CREATED (`bundles`, `files`, `refs`, `indexed`,
   * `projectParticipants`) and REVISED (`history`, `files`, `refs`). BOB #15's rule (MEMBER-KNOWLEDGE-DESIGN §5, *A
   * COUNT IS A DISCLOSURE OF EXISTENCE*) is the same sentence: a count over rows the caller could not all read.
   *
   * THE FIX IS SUBTRACTION, NEVER A SECOND RULE. `hid` is every bundle the caller's `viewerPredicate` does NOT pass
   * — the complement of the one compiled gate, interpolated (a use, not a mint) — and every counter whose rows NAME
   * a bundle drops the rows naming one in `hid`. Today the gate hides PROJECTS only, so `hid` is the projects the
   * caller cannot see; were the gate ever to hide more, these counts follow it without an edit. A key is named per
   * counter below (which column names a bundle); a counter with no such column counts rows that name no bundle —
   * an instance fact (REC-110) — and is untouched.
   *
   * WHO IS FILTERED IS THE GATE'S WORD, NOT THIS FUNCTION'S. A credential the gate does not filter (scope `member`:
   * the four token classes and an organisation `ai` key) gets `hid` = nothing, i.e. exactly the count it always got,
   * and an enrolled ADMINISTRATOR's session passes every project (§7.9). A viewer SENT but not
   * recognised (an empty stamp included) is DENY, so `hid` is every bundle — fails closed. A viewer NEVER SENT
   * (`undefined`: the DO route passes one only when the parameter is present) is a direct INTERNAL call and stays
   * WHOLE — purge's proof, and the suites that read the store's own counters — `Store#rosterInSight`'s never-sent
   * precedent. So the stamp is LOAD-BEARING at the control plane: every door (`op=stats`, `op=selftest`,
   * `op=livefire`) sets it, and the `stats-stamp-dropped` control arm measures what dropping it discloses.
   * CORRECTED before landing: the first draft read an absent parameter as DENY, which zeroed the counters four
   * store-level suites read straight off the DO route (projects, search, selection, status) — a direct internal
   * call is not a caller. */
  /* D-464's bundle subtraction is membership's `hiddenBundles` (its R88, N352); D-486's run subtraction is ai-runs'
     R42 (N191), for `observationsNonLead`. Both keep D-464's
     reading of the never-sent stamp: `undefined` is a direct internal call and stays WHOLE, so it is not asked. */
  const hid = viewer === undefined ? null : hiddenBundles(viewer);
  const runTail = viewer === undefined ? { sql: "", args: [] } : hiddenRuns(viewer);
  /* `COALESCE(k, '')`: a NULL key names no bundle, and `NULL NOT IN (…)` is NULL — the row would be dropped. */
  const nx = (t, where, keys = []) => {
    const conds = where ? [where] : [], args = [];
    if (hid) for (const k of keys) { conds.push(`COALESCE(${k}, '') NOT IN ${hid.sql}`); args.push(...hid.args); }
    return one(ctx, `SELECT count(*) c FROM ${t}${conds.length ? ` WHERE ${conds.join(" AND ")}` : ""}`, ...args).c;
  };
  const n = (t, ...keys) => nx(t, null, keys);
  /* Each provider's counts asked once per answer, not once per key. The figures a module registers with record-core
     (its R63) are its own, spread after these: provenance, extraction, capture, content, entities, connections,
     progressions, bias, retrieval, ai-runs, capture-requests and monitoring take none here. */
  const prod = runProductionsOf(ctx).counts(hid);
  return {
    bundles: n("bundles", "bundle_id"), files: n("files", "bundle_id"), history: n("history", "bundle_id"),
    refs: n("refs", "bundle_id", "target_id"),
    textIndexOk: extractionOf(ctx).textIndexOk(),
    /* REC-27 / D-137: the participation graph and the pending owner-governance
       votes, reported so a purge can PROVE it took them (both are keyed on
       project_id, a bundle id, and were the silent-leftover the D-113 check
       could not see). */
    projectParticipants: n("project_participants", "project_id"),
    projectOwnerVotes: n("project_owner_votes", "project_id"),
    /* SK-8: the EXTRACT role's proposed readings, reported so a purge can
       PROVE it took them (D-113) and — the part that is not housekeeping — so
       an operator can see the assistant's production volume beside the content
       axis it feeds, without opening one. A COUNT AND NOTHING ELSE: what a
       machine proposed is not an operator surface, the same line `queueState`
       and `aiRuns` draw. The minted-to-cited ratio §7.3 (6) asks for is NOT
       here and is deliberately not: it is scoped to a run or a document
       (`op=extractproposals`), and an instance-wide fraction would average
       across projects that have nothing to do with each other. */
    proposedReadings: prod.proposedReadings,
    /* REC-173: the questions whose creation was a verified migration replay, counted for D-85's reason one line up. */
    inquiryMigrationReplays: n("inquiry_migration_replays", "bundle_id"),
    /* REC-131 / IC-148 — `leads` IS NOT ON THE WIRE FOR ANY CLASS, AND THE WIRE'S LOG COUNT IS A
       DIFFERENT KEY FROM PURGE'S. BOB #15's CORRECTED ruling (`MEMBER-KNOWLEDGE-DESIGN.md` §5, *A
       COUNT IS A DISCLOSURE OF EXISTENCE*): a counter over rows a caller could not all read goes
       only to a caller who could read them all, and for leads THAT CALLER DOES NOT EXIST —
       `#leadVisibleTo` reaches no `class:*` credential and skips the administrator arm on purpose,
       so the admin token reads no lead either. REC-129 (IC-144) handed both keys to the admin
       class; that was the overclaim, and this supersedes it.
       *
       * ONE KEY NEVER CARRIES TWO MEANINGS (BOB.md rule 7, BOB #15 resuming REC-131). The wire's
       * count EXCLUDES lead looks, so it is published as `observationsNonLead` — a name that
       * states its predicate (`authority_kind <> 'lead'`), so that a later construct ruled
       * existence-private cannot join the exclusion without a rename, i.e. without an IC. Purge's
       * `observations` keeps the WHOLE-log meaning it has always had. The wire carries no
       * `observations` key at all, so no reader can compare the two under one name. It stays on
       * the wire because OBSERVATION-LOG-DESIGN §6's REC-110 ruling rests on it (premise 1): the
       * three built frontier levels' tallies count no lead row either. `aiRunLog` above is
       * untouched: no lead act writes a 'run' row. */
    ...(proof
      ? { observations: n("observation_log") }   /* PURGE'S PROOF: the WHOLE log. The TABLE it counts is `observation_log` — renamed at integration on BOB #11's correction, because one word over three unrelated things is the defect, not the noun */
      : { observationsNonLead: one(ctx,
            /* D-486 / BOB #32: the wire's log count subtracts a hidden project's RUN rows for the same reason
               `aiRunLog` does — and ONLY those. The lead exclusion and this one are two predicates over one
               table and are deliberately not folded: `authority_kind <> 'lead'` states the key's NAME (REC-131:
               a key never carries two meanings), while the run subtraction is the CALLER's sight and moves with
               the viewer. A rename would be an IC; this is a subtraction inside the name the key already has. */
            `SELECT count(*) c FROM observation_log WHERE authority_kind <> 'lead'${runTail.sql}`, ...runTail.args).c }),
    /* MK-4 / IC-136: a COUNT of members' leads and nothing else, so a purge can
       PROVE it took them (D-113). What any lead says is not an operator fact —
       and since REC-131, neither is how many there are: purge's proof only. */
    ...(proof ? { leads: n("leads") } : {}),
    /* PL-1 / IS-1: the inquiry's alternative accounts of its evidence and
       their legs, reported so a purge can PROVE it took them (D-113). A COUNT
       AND NOTHING ELSE, the same line queueState and aiRuns draw: how many
       readings of the evidence exist is an operator fact, and what they say is
       not an operator surface. */
    basisVersions: n("inquiry_basis_versions", "bundle_id"),
    basisVersionLegs: n("inquiry_basis_version_legs", "bundle_id", "target_id"),
    /* PL-3 / IS-4: F10's stored refusals, reported so a purge can PROVE it
       took them (D-113) and so an operator can see that a run is looping
       against a refusal without opening one. A COUNT AND NOTHING ELSE — the
       same line queueState, aiRuns and basisVersions draw. */
    suggestRefusals: prod.suggestRefusals,
    /* N342 (K445): every module's registered figures (record-core R63), after the literal keys: queue's `tasks`,
       `findingDispositions`, `queueState` and `queueItemMutes` (its R42) among them. */
    ...recordOf(ctx).counts(hid),
  };
}

/* ===== The leg grades: inquiry's (its R13, R14), the earned capture ceiling capping each leg. Held until inquiry's T20
   job (K842). ===== */
export function registerHeldLegGrades(ctx, retrieval) {
  return retrieval.registerLegGrades(HELD, heldLegGrades(ctx));
}

/** The resolver itself: each leg's capture letter capped by the earned capture ceiling of its target. */
export function heldLegGrades(ctx) {
  return (legs) => {
    const cap = inquiryOf(ctx).earned(null, [...new Set(legs.map((l) => l.target_id))])?.earned?.capture || {};
    return legs.map((l) => legCapped(l.grade, cap[l.target_id], l.target_id));
  };
}

/* ===== The promotion step: provenance's testimony slot (its R52) and membership's sight index (D-497) with the
   answer's keys. Held until provenance's T20 job (K842; control-plane R42 holds the slot's rank). ===== */
export function registerHeldStep(ctx, promotion) {
  return promotion.registerStep(HELD, { check: (c) => promoteChecks(ctx, c), project: (c) => promoteProjections(ctx, c) });
}

/* K31 (promotion R39): the held share of every promotion's checks. A refusal here refuses the whole promotion.
   Provenance's testimony slot (its R52) runs its registered checks (content's C-45 extent check, asked before anything
   is written) where that check stood. */
function promoteChecks(ctx, c) {
  return provenanceOf(ctx).testimonySlot().check(c);
}

/* K31 (promotion R39): the held share of every promotion's projections, run after `record-core.commit` inside the
   same transaction. The answer's keys promotion does not already carry are added to its answer. */
function promoteProjections(ctx, c) {
  const { bundleId, meta, owner } = stepContext(c);
  const cur = c.head;
  /* D-497: the SIGHT INDEX follows the bundle row that decides whether this is a project at all. ONE call
     covers all three arrivals — a project created here gains a row carrying the derivation's default, a
     bundle promoted INTO a project gains one, and a bundle promoted OUT of `project` loses its row rather
     than leaving a sight row standing over something that is no longer a project. It is a derivation, so
     it is idempotent: a revision that changes neither recomputes the same row. */
  membershipOf(ctx).reindexProjectSight(bundleId);

  /* MK-1 / D-184: the testimony path's own writes (extraction's index, content's row, observation-log's look),
     provenance's testimony slot (its R52), IN THIS TRANSACTION, so an authored bundle never exists without the
     content its readers expect. A refusal throws to roll the whole promotion back rather than return a half. */
  const slot = provenanceOf(ctx).testimonySlot().project(c);
  if (slot && slot.ok === false)
    throw new Error(`MK-1: the observation's testimony work was refused: ${slot.code || slot.reason}`);

  const after = one(ctx, `SELECT bundle_sha, row_version FROM bundles WHERE bundle_id=?`, bundleId);
  return { ok: true, bundleId, bundleSha: after.bundle_sha, rowVersion: after.row_version, owner,
    /* REC-197: present ONLY on a project's creation — the setting it was created with, READ BACK through
       membership's `visibilityOf` (the one reader) rather than echoed from the request, so an absent field
       answers `hidden` because the record says so. */
    ...(!cur && meta.object_type === "project" ? { visibility: membershipOf(ctx).visibilityOf(bundleId) } : {}),
    /* MK-1: present ONLY on the testimony path, so no other caller's answer gains a key. */
    ...(slot && slot.testimony ? { testimony: slot.testimony } : {}),
  };
}
