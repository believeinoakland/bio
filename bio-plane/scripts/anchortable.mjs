/* anchortable.mjs — M0-197: A NEGATIVE-CONTROL DRIVER'S PATCH ANCHORS, EXPOSED AS DATA.
 *
 * THE DEFECT THIS SERVES. A control driver arms by quoting a line of its subject and patching it. When the
 * subject is reworded the quote matches nothing and the arm never arms — and nothing saw it until a worker ran
 * the driver: four in one hour on 2026-09-25 (D-535's statepaths arm b, D-600's nc-cap12 dropslides, D-601's
 * default-discoverable, D-235's suggest.control arms). BOB #35 (04:25Z) ruled a standalone instrument,
 * `tools/anchordrift.mjs`, that reads every driver's arm table AS DATA and counts each anchor in its subject
 * without editing anything, in every gate profile.
 *
 * THE CONVENTION, and it is the whole interface:
 *
 *   import { anchorTable } from "<rel>/bio-plane/scripts/anchortable.mjs";
 *   anchorTable([{ arm: "b", file: ABS_PATH, find: "the quoted line", put: "its replacement", sites: 1 }, ...]);
 *
 * called ONCE, after the arm table is built and BEFORE the driver's first side effect (a write, a temp dir, a
 * spawn). In a normal run it does nothing and returns the rows. Under the reader (`BIO_ANCHOR_TABLE=1`, with
 * `anchordry.mjs` preloaded so any write or spawn before this call is TRAPPED and the driver named UNREADABLE)
 * it prints one `ANCHOR-TABLE <json>` line and exits 0 — the arms never run.
 *
 *   arm    the arm's name, as the driver reports it;
 *   file   the ABSOLUTE path the anchor is counted in (derive it from import.meta.url, as the driver does);
 *   find   a string, or a RegExp (counted with the global flag);
 *   put    optional — the string the arm writes in its place. When given, the reader applies it IN MEMORY so a
 *          LATER row of the same arm on the same file is counted against the text the arm really patches;
 *   sites  1 (the default: the arm edits ONE site, so 0 or >1 matches is drift), a number n (exactly n), or
 *          "any" (a replace-all arm: only 0 is drift).
 *   none   instead of file/find: the arm quotes no file of the tree (it patches a fixture it composes, or writes a
 *          file whole) — the reason, which the reader prints. Never a way to hide an anchor that exists.
 *
 * `anchorRows(rows)` collects rows from an IMPERATIVE driver (one whose arms are calls, not a table): its arm
 * function records in dry mode and returns instead of arming, and a final `anchorTable()` prints them all.
 *
 * `anchorPatch(file, find, put, sites)` + `anchorEach(ARMS, invoke)` serve a driver whose arms are CLOSURES over a
 * patch primitive (`patch: () => arm(FILE, find, replace)`): the primitive's first line records in dry mode and
 * returns as if it had armed, and `anchorEach` calls every closure under its arm's name, then prints. The anchors
 * are then read FROM THE ARMS THEMSELVES, so no table can disagree with them.
 *
 * WHY A CALL AND NOT A SIDECAR FILE: the rows are built from the SAME constants the arms patch with, in the same
 * file, so a table that no longer describes its arms is one edit away, not two files away (M0-25's objection to
 * a `--dry-anchors` table, met by construction wherever the driver maps its own arm table into rows).
 */
export const ANCHOR_DRY = !!process.env.BIO_ANCHOR_TABLE;
export const MARK = "ANCHOR-TABLE ";

const collected = [];

function norm(r) {
  if (!r || typeof r !== "object") throw new Error(`anchorTable: a row must be an object, got ${JSON.stringify(r)}`);
  if (r.none) return { arm: String(r.arm), none: String(r.none) };
  const find = r.find instanceof RegExp ? { re: r.find.source, flags: r.find.flags } : r.find;
  return { arm: String(r.arm), file: r.file, find, ...(typeof r.put === "string" ? { put: r.put } : {}),
           sites: r.sites === undefined ? 1 : r.sites };
}

let current = null;
export function anchorPatch(file, find, put, sites) {
  if (ANCHOR_DRY) collected.push(norm({ arm: current ?? "(outside anchorEach)", file, find, put, sites }));
}

export function anchorEach(arms, invoke) {
  if (!ANCHOR_DRY) return;
  for (const [name, a] of Array.isArray(arms) ? arms.map((a, i) => [a.id ?? a.name ?? String(i), a]) : Object.entries(arms)) {
    current = name;
    invoke(a, name);
  }
  current = null;
  anchorTable();
}

export function anchorRows(rows) {
  if (ANCHOR_DRY) collected.push(...rows.map(norm));
  return rows;
}

export function anchorTable(rows = []) {
  if (!ANCHOR_DRY) return rows;
  const all = [...collected, ...rows.map(norm)];
  process.stdout.write(`${MARK}${JSON.stringify(all)}\n`);
  process.exit(0);
}
