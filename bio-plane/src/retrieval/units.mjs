/* retrieval — the reads of extraction's unit rows that name a part's kind (R95), locate a hit (R96) and say how far a
 * reading had got (R97). They are keyed reads over rows the viewer's gate already passed (a statement `query-language`
 * compiled), as R92's `#documentsOf` is; none searches, none writes. `rows` is the module's own `(sql, ...args) => rows`. */

/** R95: the closed list of a part's kind (`extraction` R107, `reading-pipeline` R47). */
export const PART_KINDS = Object.freeze(["body", "footnote", "endnote", "header", "footer", "comment", "tracked_deletion",
  "text_box", "speaker_note", "master_text", "cell_note"]);

/** R95, R96: the pages of passage rows (`query-language`'s row bound each) read to find the unit a hit's snippet is cut
 *  from; a hit whose matching units pass the bound says its unit is undetermined (null), never a guess. */
export const HIT_UNIT_PAGES_MAX = 8;

/** R97: the partial readings a tally lists by name; the count is of all of them. */
export const PARTIAL_LISTED_MAX = 20;

const IN_CHUNK = 100;

/** The unit's address, as `capture_text`'s own key. */
export const unitKey = (u) => `${u.capture_sha}\u0000${u.extent_kind}\u0000${u.extent}`;

/** R95: the order a hit's snippet takes its unit in (`query-language` R33): capture, reading order, extent. */
export const unitBefore = (a, b) => {
  const k = (u) => [u.capture_sha, Number(u.seq), u.extent_kind, u.extent];
  const x = k(a), y = k(b);
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] < y[i];
  return false;
};

/** R95: each unit's part kind, by its address: a Map from `unitKey` to a kind of `PART_KINDS`, or null where the unit was
 *  stored before the kind (the column is absent, or empty, or outside the list): undetermined, never read as `body`. */
export function kindsOf(rows, units) {
  const out = new Map();
  const want = [...new Map(units.filter((u) => u && u.capture_sha != null).map((u) => [unitKey(u), u])).values()];
  for (const u of want) out.set(unitKey(u), null);
  if (!want.length) return out;
  if (!rows(`PRAGMA table_info(capture_text)`).some((c) => c.name === "kind")) return out;
  for (let i = 0; i < want.length; i += IN_CHUNK) {
    const part = want.slice(i, i + IN_CHUNK);
    const found = rows(`SELECT capture_sha, extent_kind, extent, kind FROM capture_text
                         WHERE (capture_sha, extent_kind, extent) IN (VALUES ${part.map(() => "(?,?,?)").join(",")})`,
      ...part.flatMap((u) => [u.capture_sha, u.extent_kind, u.extent]));
    for (const r of found) out.set(unitKey(r), PART_KINDS.includes(r.kind) ? r.kind : null);
  }
  return out;
}

/** R97: of the captures `shas`, those whose reading is not whole by extraction's index state (`capture_text_state`, its R36:
 *  `partial`, or pieces still to follow), each `{capture_sha, through, total}` (the position and the extent of the read, null
 *  where the state holds none), in capture order. A capture with no state row is never indexed, not partial; one whose
 *  index holds nothing is `none`, not partial. */
export function partialReads(rows, shas) {
  const out = [];
  const uniq = [...new Set(shas.filter((s) => typeof s === "string" && s))];
  for (let i = 0; i < uniq.length; i += IN_CHUNK) {
    const part = uniq.slice(i, i + IN_CHUNK);
    for (const r of rows(`SELECT capture_sha, state, more, truncated, read_through, total FROM capture_text_state
                           WHERE capture_sha IN (${part.map(() => "?").join(",")})`, ...part))
      if (r.more || r.state === "partial" || r.truncated)
        out.push({ capture_sha: r.capture_sha, through: r.read_through ?? null, total: r.total ?? null });
  }
  return out.sort((a, b) => (a.capture_sha < b.capture_sha ? -1 : a.capture_sha > b.capture_sha ? 1 : 0));
}
