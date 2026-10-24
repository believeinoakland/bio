/* retrieval — the reads of extraction's unit rows that name a part's kind (R95), locate a hit (R96) and say how far a
 * reading had got (R97). They are keyed reads over rows the viewer's gate already passed (a statement `query-language`
 * compiled), as R92's `#documentsOf` is; none searches, none writes. `rows` is the module's own `(sql, ...args) => rows`. */

/** R95: the closed list of a part's kind (`extraction` R107, `reading-pipeline` R47). */
export const PART_KINDS = Object.freeze(["body", "footnote", "endnote", "header", "footer", "comment", "tracked_deletion",
  "text_box", "speaker_note", "master_text", "cell_note"]);

/** R97: the partial readings a tally lists by name; the count is of all of them. */
export const PARTIAL_LISTED_MAX = 20;

const IN_CHUNK = 100;
const PROGRESS_CALL = 500;   // extraction R108: at most this many shas a call

/** The unit's address, as `capture_text`'s own key. */
export const unitKey = (u) => `${u.capture_sha}\u0000${u.extent_kind}\u0000${u.extent}`;

const hasKind = (rows) => rows(`PRAGMA table_info(capture_text)`).some((c) => c.name === "kind");

/** R95: each unit's part kind, by its address: a Map from `unitKey` to a kind of `PART_KINDS`, or null where the unit was
 *  stored before the kind (the column is absent, or empty, or outside the list): undetermined, never read as `body`. */
export function kindsOf(rows, units) {
  const out = new Map();
  const want = [...new Map(units.filter((u) => u && u.capture_sha != null).map((u) => [unitKey(u), u])).values()];
  for (const u of want) out.set(unitKey(u), null);
  if (!want.length || !hasKind(rows)) return out;
  for (let i = 0; i < want.length; i += IN_CHUNK) {
    const part = want.slice(i, i + IN_CHUNK);
    const found = rows(`SELECT capture_sha, extent_kind, extent, kind FROM capture_text
                         WHERE (capture_sha, extent_kind, extent) IN (VALUES ${part.map(() => "(?,?,?)").join(",")})`,
      ...part.flatMap((u) => [u.capture_sha, u.extent_kind, u.extent]));
    for (const r of found) out.set(unitKey(r), PART_KINDS.includes(r.kind) ? r.kind : null);
  }
  return out;
}

/** R95, R96 (`query-language` R34): the unit rows by `rowid`, as a hit's `snippet_unit` names them: a Map from rowid to
 *  `{capture_sha, extent_kind, extent, ref, kind}`, `kind` null where the unit was stored before it. */
export function unitsByRowid(rows, rowids) {
  const out = new Map();
  const ids = [...new Set(rowids.filter((n) => Number.isInteger(n)))];
  if (!ids.length) return out;
  const held = hasKind(rows);
  for (let i = 0; i < ids.length; i += IN_CHUNK) {
    const part = ids.slice(i, i + IN_CHUNK);
    for (const r of rows(`SELECT rowid AS id, capture_sha, extent_kind, extent, ref${held ? ", kind" : ""} FROM capture_text
                           WHERE rowid IN (${part.map(() => "?").join(",")})`, ...part))
      out.set(r.id, { capture_sha: r.capture_sha, extent_kind: r.extent_kind, extent: r.extent, ref: r.ref,
                      kind: held && PART_KINDS.includes(r.kind) ? r.kind : null });
  }
  return out;
}

/** R97: of the captures `shas`, those whose reading is not whole, each `{capture_sha, through, total, owed}` (the position
 *  and the extent of the read, null where none is stated; `owed` the pages or windows still owed), in capture order. Asked
 *  of extraction's `progressOf` (its R108, which never answers `whole` while anything is owed) in calls of at most 500;
 *  where the provider has none, of its index state (`capture_text_state`, R36: `partial`, pieces to follow, or truncated),
 *  which cannot see what is owed. A capture never indexed, or indexed to nothing, is not partial. */
export function partialReads(rows, shas, progressOf = null) {
  const out = [];
  const uniq = [...new Set(shas.filter((s) => typeof s === "string" && s))];
  if (typeof progressOf === "function") {
    for (let i = 0; i < uniq.length; i += PROGRESS_CALL) {
      const asked = uniq.slice(i, i + PROGRESS_CALL);
      const got = progressOf(asked) || {};
      for (const sha of asked) {
        const r = got[sha];
        if (r && (r.state === "partial" || Number(r.owed) > 0))
          out.push({ capture_sha: sha, through: r.read_through ?? null, total: r.total ?? null, owed: Number(r.owed) || 0 });
      }
    }
  } else {
    for (let i = 0; i < uniq.length; i += IN_CHUNK) {
      const part = uniq.slice(i, i + IN_CHUNK);
      for (const r of rows(`SELECT capture_sha, state, more, truncated, read_through, total FROM capture_text_state
                             WHERE capture_sha IN (${part.map(() => "?").join(",")})`, ...part))
        if (r.more || r.state === "partial" || r.truncated)
          out.push({ capture_sha: r.capture_sha, through: r.read_through ?? null, total: r.total ?? null, owed: 0 });
    }
  }
  return out.sort((a, b) => (a.capture_sha < b.capture_sha ? -1 : a.capture_sha > b.capture_sha ? 1 : 0));
}
