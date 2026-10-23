/* ratification — the case-file sweep (R57; T51 fix round 6, G54). A complete published edition whose case file was not
 * built, or whose manifest was recorded and its bytes never stored, is owed (publication's ledger, `caseFilesOwed`), and this
 * is what builds it: per tick it takes a few of the oldest owed editions, one at a time, copies the materials first
 * (`copyMaterials`, R39), and runs public-read's one assembly (its R6) with what the copy found (`prior`). The assembly
 * records every attempt and its cause; this module records only what it decides itself (an edition too large to attempt,
 * an edition stopped for a material the evidence store confirms it no longer holds). It is idempotent (the assembly's `head`
 * guards skip stored files; a manifest of the same hash is recorded once) and bounded, so a tick never holds more than one
 * edition's bytes and never passes the platform's limits. `./index.mjs` reaches it as `caseFileSweep` and `caseFileWake`;
 * `plane` registers those as a scheduler consumer (its R75). */

import { copyMaterialsDetailed } from "./ops.mjs";
import { assembleEdition, priorOf, errorText } from "./finding.mjs";

/* The tick's bounds, PROVISIONAL until the platform check P measured them (`build/plan/diagnosis-R6-g54-cause.md` 7.3; pinned by
   `g54-paths.test.mjs`): the editions a tick takes, and the files and bytes after which it takes no further edition. The
   edition too large to attempt (`TOO_LARGE`) is public-read's (its R6), and the stopping rule (the sixth `MATERIAL_MISSING`
   with the absence confirmed) is publication's writer's alone (its R15): this module only says what it found. */
export const CASEFILE_SWEEP_EDITIONS = 2;
export const CASEFILE_SWEEP_FILES = 400;
export const CASEFILE_SWEEP_BYTES = 16 * 1024 * 1024;

const reach = (w) => !!(w && w.env && w.storeName && w.stub);
const caseOf = (e) => String(e.case ?? e.case_id ?? e.caseId ?? "");

/** R57: whether an assembly's statement says the case file was built: it names its manifest and does not say `ok: false`. */
export const builtOf = (c) => !!(c && typeof c === "object" && c.ok !== false && typeof c.manifest_sha === "string" && c.manifest_sha);

/** R57, R42: one edition's outcome as the scheduled publisher states it, `{case, edition, built, code?}`, `code` the
 *  assembly's own for an edition not built. */
export const outcomeOf = (cs, container) => ({
  case: String(cs.caseId ?? cs.case_id ?? ""), edition: Number(cs.edition), built: builtOf(container),
  ...(builtOf(container) ? {} : { code: String((container && (container.code ?? container.reason)) ?? "NOT_ATTEMPTED") }) });

/** R57: the sweep's tick at `now` (ms). `host` reads the store: `publication` (the ledger: `caseFilesOwed`,
 *  `recordCaseFileAttempt`), `stateOf(case, edition)` (the edition's state, with its publishing group), `materialsOf(case,
 *  edition)` (the materials the commit held outside the record's text); `worker` is the Worker's reach (`env`, `stub`,
 *  `storeName`); `assemble` and `recordFailure` public-read's. Answers what the tick did, never throws: an edition that
 *  fails in an unforeseen way is recorded and the tick goes on. */
export async function sweepCaseFiles({ publication, stateOf, materialsOf, worker, now, assemble, recordFailure }) {
  const at = typeof now === "number" && Number.isFinite(now) ? now : Date.now();
  const out = { ok: true, ran: false, built: [], failed: [], files: 0, bytes: 0 };
  if (!reach(worker)) return out;
  out.ran = true;
  let owed;
  try {
    const read = publication.caseFilesOwed({ now: at, limit: CASEFILE_SWEEP_EDITIONS });
    owed = Array.isArray(read) ? read : Array.isArray(read && read.editions) ? read.editions : [];
  } catch (e) { return { ...out, ok: false, reason: "OWED_UNREADABLE", detail: errorText(e) }; }
  const iso = new Date(at).toISOString();
  for (const e of owed.slice(0, CASEFILE_SWEEP_EDITIONS)) {
    if (out.files >= CASEFILE_SWEEP_FILES || out.bytes >= CASEFILE_SWEEP_BYTES) break;
    const id = caseOf(e), ed = Number(e.edition);
    try {
      const cs = stateOf(id, ed);
      if (!cs || !cs.complete) continue;
      /* The materials first. What the evidence store ANSWERED absent is told to the assembly (`prior.absent`), which records
         `failed` `MATERIAL_MISSING` and lets the ledger's writer stop the edition at the bound; a copy that failed is not
         an absence and never counts toward it. */
      const copy = await copyMaterialsDetailed(worker.env, worker.storeName, materialsOf(id, ed));
      const container = await assembleEdition({ assemble, recordFailure, env: worker.env, stub: worker.stub,
        storeName: worker.storeName, cs, via: "casefilesweep", prior: priorOf({ missing: copy.missing, absent: copy.absent }) });
      const outcome = outcomeOf(cs, container);
      (outcome.built ? out.built : out.failed).push(outcome);
      out.files += Number(container && container.files) || 0;
      out.bytes += Array.isArray(container && container.part_addresses)
        ? container.part_addresses.reduce((n, p) => n + (Number(p && p.bytes) || 0), 0) : 0;
    } catch (x) {
      try { publication.recordCaseFileAttempt({ caseId: id, edition: ed, state: "failed", at: iso,
                                                why: { code: "UNKNOWN", step: "build", error: errorText(x) } }); } catch { /* the edition stays owed */ }
      out.failed.push({ case: id, edition: ed, built: false, code: "UNKNOWN" });
    }
  }
  return out;
}

/** R57: when the sweep next has work, in ms: now while an owed edition is due, else the ledger's earliest next try, else
 *  null (nothing owed, or no reach to the published bucket from here). Never throws. */
export function wakeOfCaseFiles({ publication, worker, now }) {
  try {
    if (!reach(worker)) return null;
    const at = typeof now === "number" && Number.isFinite(now) ? now : Date.now();
    const due = publication.caseFilesOwed({ now: at, limit: 1 });
    if ((Array.isArray(due) ? due : Array.isArray(due && due.editions) ? due.editions : []).length) return at;
    const next = publication.caseFileNextAt();
    const t = typeof next === "number" ? next : Date.parse(next);
    return Number.isFinite(t) ? t : null;
  } catch { return null; }
}
