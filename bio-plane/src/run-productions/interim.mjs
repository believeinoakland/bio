/* INTERIM: the provider `run-productions` reads that is not yet extracted, built from what the legacy store hands over
 * (K120's rule: a user builds against its provider's Provides, taking it injected until the provider merges). It is
 * written to the services its provider's requirements name, and is deleted by the CHANGE that brings that provider
 * (K78 (3)'s pattern, bias's `interim.mjs` precedent):
 *
 *   aiRuns         ai-runs R28 `runFor`, R29 `boundOf` and `consumeBound`     over `ai_runs` and `ai_run_bounds`
 *
 * `h`, from the store:
 *   aiRunInSight(run, viewer)   whether the viewer may see the run (`op=airun`'s own predicate) */

const rowsOf = (sql, q, ...a) => [...sql.exec(q, ...a)];
const oneOf = (sql, q, ...a) => rowsOf(sql, q, ...a)[0] ?? null;
const isCount = (n) => Number.isSafeInteger(n) && n >= 0;

export function runProductionsInterim(h) {
  return (host) => {
    const sql = host.storage.sql;
    const aiRuns = {
      runFor(run, viewer) {
        const id = typeof run === "string" ? run.trim() : "";
        if (!id) return null;
        const r = oneOf(sql, `SELECT run, status, mode, context_type, context_id, principal_plane FROM ai_runs WHERE run = ?`, id);
        return r && h.aiRunInSight(id, viewer) ? { ...r } : null;
      },
      boundOf(run, bound) {
        const r = oneOf(sql, `SELECT allowed, consumed FROM ai_run_bounds WHERE run = ? AND bound = ?`, run, bound);
        return r ? { allowed: Number(r.allowed), consumed: Number(r.consumed) } : null;
      },
      /* ai-runs R29: inside the caller's transaction; 0 writes nothing; the row made (allowed 0) when none was declared. */
      consumeBound(run, bound, n) {
        if (!isCount(n)) return { ok: false, reason: "AI_RUN_CONSUME_INVALID", code: "AI_RUN_CONSUME_INVALID" };
        if (n === 0) return null;
        sql.exec(`INSERT INTO ai_run_bounds (run, bound, allowed, consumed) VALUES (?, ?, 0, ?)
                  ON CONFLICT(run, bound) DO UPDATE SET consumed = consumed + ?`, run, bound, n, n);
        return null;
      },
    };
    return { aiRuns };
  };
}
