/* INTERIM: the providers `run-productions` reads that are not yet extracted, built from what the legacy store hands
 * over (K120's rule: a user builds against its provider's Provides, taking it injected until the provider merges). Each
 * arm below is written to the service its provider's requirements name, and is deleted by the CHANGE that brings that
 * provider (K78 (3)'s pattern, bias's `interim.mjs` precedent):
 *
 *   aiRuns         ai-runs R28 `runFor`, R29 `boundOf` and `consumeBound`     over `ai_runs` and `ai_run_bounds`
 *   basisVersions  basis-versions R5 `basisVersionsOf`, R8–R9 `basisVersions`, R28 `appendVersion`, and `asWritten`
 *                  (the scalar the write stores; basis-versions' `versionAsWritten` replaces it, K182)
 *
 * `h`, from the store:
 *   aiRunInSight(run, viewer)   whether the viewer may see the run (`op=airun`'s own predicate)
 *   basisVersionsOf(fm), basisVersions(args), promote(pkg)
 *   fmSafe(s), appendFmRows(text, key, rows), setScalar(text, key, value), appendSessionLog(text, entry) */

import { parseFrontmatter } from "../../checks/bio-checks.mjs";
import { fileDigestOf, inlineBytesOf } from "../record-core/index.mjs";

const rowsOf = (sql, q, ...a) => [...sql.exec(q, ...a)];
const oneOf = (sql, q, ...a) => rowsOf(sql, q, ...a)[0] ?? null;
const isCount = (n) => Number.isSafeInteger(n) && n >= 0;

const random4 = () => [...crypto.getRandomValues(new Uint8Array(4))].map((b) => b.toString(16).padStart(2, "0")).join("");

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
    const basisVersions = {
      basisVersionsOf: (fm) => h.basisVersionsOf(fm),
      basisVersions: (a) => h.basisVersions(a),
      asWritten: (s) => h.fmSafe(s),
      /** basis-versions R28's call: one version in `suggested`, its grounds and legs appended to the question's
       *  document in the caller's field order (`state` and `hidden` after `relationship`; `author` and `at` after
       *  `run`), the Session Log entry `log` appended, and the document promoted so the promotion judges it. Nothing is
       *  written on `NO_DOCUMENT` or `UNSPLICEABLE_BASIS`. */
      appendVersion({ target, version = {}, grounds = [], legs = [], author = null, at = null, log = null }) {
        const md = oneOf(sql, `SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
        const b = oneOf(sql, `SELECT object_type, current_state, bundle_sha FROM bundles WHERE bundle_id=?`, target);
        if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE" };
        if (!md || md.content === null) return { ok: false, reason: "NO_DOCUMENT" };
        const fm0 = parseFrontmatter(md.content).data || {};
        const when = at || new Date().toISOString().replace(/\.\d+Z$/, "Z");
        const q = (x) => `"${h.fmSafe(String(x ?? ""))}"`;
        const lines = [];
        for (const [k, val] of Object.entries(version)) {
          if (k === "state" || k === "hidden" || k === "author" || k === "at") continue;
          lines.push(k === "derived_from" && (val === null || val === undefined) ? `${k}: null` : `${k}: ${q(val)}`);
          if (k === "relationship") lines.push(`state: "suggested"`, `hidden: false`);
          if (k === "run") lines.push(...(author ? [`author: ${q(author)}`] : []), `at: ${q(when)}`);
        }
        if (!("run" in version)) lines.push(...(author ? [`author: ${q(author)}`] : []), `at: ${q(when)}`);
        const vRow = lines.map((l, i) => (i === 0 ? `  - ${l}` : `    ${l}`)).join("\n");
        const rowOf = (o) => [`  - version: ${q(version.name)}`,
                              ...Object.entries(o).map(([k, val]) => `    ${k}: ${q(val)}`)].join("\n");
        let text = h.appendFmRows(md.content, "basis_versions", [vRow]);
        if (text !== null && grounds.length) text = h.appendFmRows(text, "basis_version_grounds", grounds.map(rowOf));
        if (text !== null && legs.length) text = h.appendFmRows(text, "basis_version_legs", legs.map(rowOf));
        if (text === null) return { ok: false, reason: "UNSPLICEABLE_BASIS" };
        text = h.setScalar(text, "last_updated", `"${when}"`);
        if (log) text = h.appendSessionLog(text, log);
        const carried = rowsOf(sql,
          `SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=? AND path<>'bundle.md'`, target)
          .map((r) => (r.content !== null ? { path: r.path, text: r.content, bytes: r.bytes, sha256: r.sha256 }
                                           : { path: r.path, blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes }));
        const file = { path: "bundle.md", text };
        return h.promote({
          bundleId: target, base: b.bundle_sha, snapKey: `${when.replace(/[-:]/g, "")}_${random4()}`,
          author: author || version.run || null,
          files: [{ ...file, bytes: inlineBytesOf(file), sha256: fileDigestOf(file) }, ...carried],
          meta: { object_type: fm0.object_type ?? b.object_type, title: fm0.title, current_state: b.current_state,
                  prior_state: fm0.prior_state ?? null, created: fm0.created, last_updated: when,
                  criticality: fm0.criticality ?? null },
        });
      },
    };
    return { aiRuns, basisVersions };
  };
}
