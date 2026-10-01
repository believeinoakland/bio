/* plane R10 (K842, K861): code moved whole from `store.mjs`, its behaviour unchanged, whose owners' layers had closed when
   `legacy-store` was emptied. The stats figures and the leg grades are registered under their owners' names since plane's
   T20 job; what is left is the promotion step, held until `control-plane` exports it (its R42), registered under the name
   `plane-held` at the place in the composition root (R2) where `store.mjs` registered it as `legacy-store`. This file is
   deleted with it. */
import { stepContext } from "../promotion/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { membershipOf } from "../membership/index.mjs";

/* The name every held share is registered under. */
export const HELD = "plane-held";

const rows = (ctx, q, ...a) => [...ctx.storage.sql.exec(q, ...a)];
const one = (ctx, q, ...a) => { const r = rows(ctx, q, ...a); return r.length ? r[0] : null; };

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
