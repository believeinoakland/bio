/* control-plane R135 (fix round 9, G126, G135f; K4831 (5); plane R97, R80): THE READING'S JOB STATE, answered from the job row. `op=reading` answers, beside the stored
   reading's units and `completeness`, `job`: `state` (the row's: `queued`, `fetching`, `reading`, `partial`, `refused`, `finished`, `final`), the counters (`written`,
   `skipped`, `owed`, `failed`) with `failed_why`, the cursor as a position (`{at, of}` where the row states the total), `last_progress_at`, `priority`, and the
   refusal's `verdict` (`size`, `limit`, `bound_key`) when the state is `refused`; with no row, `state: null` and the stored reading alone. The rows are plane's
   (`owedwork`'s `view`, whose `job_state` is R97's state); the owner of a reading is never asked what its state is. Pure. */

const KINDS = Object.freeze(["reading", "ocr"]);
const COUNT = (v) => (Number.isSafeInteger(v) && v >= 0 ? v : 0);
const plain = (v) => !!v && typeof v === "object" && !Array.isArray(v);

/** The cursor of a row as a position: `{at, of}` (`of` only where the row states the total), else null. */
export function positionOf(row) {
  const c = plain(row?.cursor) ? row.cursor : plain(row?.detail?.cursor) ? row.detail.cursor : null;
  if (!c) return null;
  const at = [c.page, c.pages_done, c.at, c.next, c.offset].find((x) => Number.isSafeInteger(x) && x >= 0);
  if (at === undefined) return null;
  const of = [c.pages, c.total, c.of, c.size].find((x) => Number.isSafeInteger(x) && x > 0);
  return { at, ...(of !== undefined ? { of } : {}) };
}

/** `jobStateOf(rows)` -> the `job` object for one digest, from the rows plane lists for it (any kinds); the `reading` row speaks, else the `ocr` row; `state: null` with none. */
export function jobStateOf(rows) {
  const list = Array.isArray(rows) ? rows.filter(plain) : [];
  const row = KINDS.map((k) => list.find((r) => r.kind === k)).find(Boolean);
  if (!row) return { state: null };
  const state = typeof row.job_state === "string" ? row.job_state : typeof row.state === "string" && row.state !== "owed" && row.state !== "final" ? row.state : row.state === "final" ? "final" : "queued";
  const position = positionOf(row);
  const verdict = plain(row.verdict) ? row.verdict : null;
  return {
    state, kind: row.kind,
    written: COUNT(row.written), skipped: COUNT(row.skipped), owed: COUNT(row.owed), failed: COUNT(row.failed),
    failed_why: plain(row.failed_why) ? row.failed_why : {},
    cursor: position,
    last_progress_at: Number.isFinite(row.last_progress_at) ? row.last_progress_at : null,
    priority: row.priority === "raised" ? "raised" : null,
    ...(state === "refused" && verdict ? { verdict: { size: verdict.size ?? null, limit: verdict.limit ?? null, bound_key: verdict.bound_key ?? null } } : {}),
  };
}
