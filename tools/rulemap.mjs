#!/usr/bin/env node
/* rulemap — a kickoff cut to one line per rule loses no rule and no ruling (M0-194, BOB #34 2026-09-24 22:50Z).
 *
 * BOB #34's rule: a kickoff states each CURRENT rule in one or two lines naming its ruling; the receipts move VERBATIM
 * to `docs/archive/`, where `decided.mjs` finds them; nothing is deleted. A rewrite that shortens a file can drop a rule
 * and read as a success, so the map is a TABLE in the row's measurement and this tool checks it three ways:
 *   1. every old rule's ANCHOR (a phrase quoted from the old text) is in the archive, verbatim  -> nothing deleted;
 *   2. every old rule's TAG (`W<n>`) is a line of the new kickoff                                -> nothing dropped;
 *   3. every ruling id the old text cited is still answered by `decided.mjs` wherever it was before.
 * Whitespace is collapsed before comparing, because the old text wrapped its sentences across lines.
 *
 * THE TABLE (in the measurement): `| R<n> | <old heading> | <anchor> | W<n> |`. A line of the new text with no old rule
 * behind it (a ruling that never reached the old file) is a row `| NEW | … | … | W<n> |`, and its anchor is not sought.
 * The ruling list is a second table, `| ruling | decided before | … |`: an id found before must be found now.
 *
 * WHAT IT CANNOT SEE: whether a new line says what the old rule MEANT. The tag proves a line exists, not that it is
 * faithful — that is the reviewer's reading of the table, which prints both sides for exactly that.
 *
 * NEGATIVE CONTROL: `bio-plane/test/rulemap.test.mjs` drops one mapped line from the new text (in memory) and the check
 * must NAME its R and W; it deletes an anchor's sentence from the archive text and the check must name that R. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DEFAULTS = {
  map: "docs/development/measurements/M-147.md",
  current: "docs/development/kickoffs/WORKER.md",
  archive: "docs/archive/WORKER-kickoff-2026-09-24.md",
};

const squash = (s) => s.replace(/\s+/g, " ");

/* The map's rule rows and ruling rows, parsed from the measurement's markdown tables. */
export function parseMap(text) {
  const rules = [], rulings = [];
  for (const line of text.split("\n")) {
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length === 4 && /^(R\d+|NEW)$/.test(cells[0]) && /^W\d+$/.test(cells[3]))
      rules.push({ r: cells[0], heading: cells[1], anchor: cells[2], w: cells[3] });
    else if (cells.length >= 2 && /^`[^`]+`$/.test(cells[0]) && /^\d+$/.test(cells[1]))
      rulings.push({ id: cells[0].slice(1, -1), before: Number(cells[1]) });
  }
  return { rules, rulings };
}

/* The check itself, on texts handed in, so a control can break an input without touching a file. `found(id)` answers
   how many rulings `decided.mjs` holds for an id; the CLI passes the real index. */
export function check({ mapText, currentText, archiveText, found = () => 1 }) {
  const { rules, rulings } = parseMap(mapText);
  const arch = squash(archiveText);
  const tags = new Set([...currentText.matchAll(/^- \*\*(W\d+)\*\* ·/gm)].map((m) => m[1]));
  const missing = [];
  for (const x of rules) {
    if (x.r !== "NEW" && !arch.includes(squash(x.anchor)))
      missing.push({ kind: "ANCHOR NOT IN ARCHIVE", r: x.r, w: x.w, what: x.anchor });
    if (!tags.has(x.w)) missing.push({ kind: "LINE NOT IN KICKOFF", r: x.r, w: x.w, what: x.heading });
  }
  const mapped = new Set(rules.map((x) => x.w));
  for (const w of tags) if (!mapped.has(w)) missing.push({ kind: "LINE NOT IN MAP", r: "-", w, what: "" });
  for (const x of rulings)
    if (x.before > 0 && found(x.id) < 1) missing.push({ kind: "RULING NO LONGER FOUND", r: "-", w: "-", what: x.id });
  return { rules: rules.length, oldRules: rules.filter((x) => x.r !== "NEW").length, lines: tags.size,
           rulings: rulings.length, missing };
}

if (process.argv[1] && process.argv[1].endsWith("rulemap.mjs")) {
  const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : DEFAULTS[k]; };
  const rd = (p) => readFileSync(join(ROOT, p), "utf8");
  const { query, scan } = await import("./decided.mjs");
  const rows = scan();
  const res = check({ mapText: rd(arg("map")), currentText: rd(arg("current")), archiveText: rd(arg("archive")),
                      found: (id) => query(id, rows).hits.length });
  for (const m of res.missing) console.log(`MISSING  ${m.kind}  ${m.r} -> ${m.w}  ${m.what}`);
  console.log(`rulemap: ${res.oldRules} old rule(s) and ${res.rules - res.oldRules} new, onto ${res.lines} line(s); `
            + `${res.rulings} ruling(s) checked; ${res.missing.length} missing`);
  process.exit(res.missing.length ? 1 : 0);
}
