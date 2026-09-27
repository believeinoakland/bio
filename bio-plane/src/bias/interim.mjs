/* INTERIM, and `ai-runs`' (its R30): the AI run as a work product of the bias debt (R33), until `ai-runs` is extracted
 * and registers its own runs (T6). The legacy store holds the runs and may add only calls to this module's names, so
 * the shape of a run is read here, from the three readers the store hands over; `ai-runs`' job then registers its
 * own source and this file is deleted (K78 (3)'s pattern, through a CHANGE to this module).
 *
 * `readers`:
 *   list(after, limit)   run ids after `after`, ascending, at most `limit` (synchronous).
 *   row(run)             the run's stored row (its `rerun_of`), or null.
 *   read(run, viewer)    `aiRunRead`'s answer for that viewer: `{found, session}`, the session carrying `context`,
 *                        `principal.plane` and the `bias` block (`moved_basis`, `at_open`, `manifest`, `in_force`).
 */

const MEMBER_PRINCIPAL = /^member:([A-Za-z0-9._:-]{1,128}?)(?:\/.*)?$/;

export function aiRunWorkProducts({ list, row, read }) {
  return {
    list: (after, limit) => list(String(after ?? ""), limit).map(String),
    async read(run) {
      const r = row(run);
      if (!r) return null;
      const a = await read(run, "admin");
      const s = a && a.found === true ? a.session : null;
      if (!s) return null;
      const bias = s.bias || {};
      /* The lens recorded when the run began: the lens in force at its open when the open recorded one, else the
         manifest it was handed; the reader's `moved_basis` says which, and null means neither can be read. */
      const lens = bias.moved_basis === "at_open"
        ? { basis: "at_open", statements_sha: bias.at_open && typeof bias.at_open.statements_sha === "string"
            ? bias.at_open.statements_sha : null }
        : bias.moved_basis === "handed"
          ? { basis: "handed", statements_sha: bias.manifest && typeof bias.manifest.statements_sha === "string"
              ? bias.manifest.statements_sha : null }
          : null;
      const pm = MEMBER_PRINCIPAL.exec(String((s.principal && s.principal.plane) || ""));
      return {
        context: s.context ? { type: s.context.type, id: s.context.id } : null,
        principal: pm ? pm[1] : null,
        lens,
        ranUnder: bias.in_force === true && bias.manifest && typeof bias.manifest.statements_sha === "string"
          ? bias.manifest.statements_sha : null,
        rerunOf: r.rerun_of != null && String(r.rerun_of).trim() ? String(r.rerun_of).trim() : null,
      };
    },
    async visible(run, viewer) {
      const a = await read(run, viewer);
      return !!a && a.found === true;
    },
  };
}
