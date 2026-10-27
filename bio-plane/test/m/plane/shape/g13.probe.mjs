/* G13 at the platform's shape (K4426 (4); plan G13 (4) L): the walker's 12,000,060 B text and a 24 MiB text, uploaded by the member's path and
 * read whole in pieces by the real plane's ledger (`harness.mjs`), the child's old space 128 MB less the file's bytes (no "idle +").
 *   node g13.probe.mjs [bytes:capMB ...]     extra runs after the two real-cap ones, e.g. 25165824:96 (one run at a time)
 * Prints per tick: ms, peak, rows, units; then ENDMARKER in the index (`capture_text_fts`), the state, the last unit, and the search op's answer. */
import { shapeRun, capFor, textDoc, report } from "./harness.mjs";
const runs = [12_000_060, 24 * 1048576].map((b) => [b, capFor(b / 1048576)]);
for (const a of process.argv.slice(2)) { const [b, c] = a.split(":").map(Number); if (b && c) runs.push([b, c]); }
for (const [bytes, cap] of runs) console.log(report(`G13 text ${bytes} B`, await shapeRun({ doc: textDoc(bytes), search: ["ENDMARKER"] }, { capMB: cap })));
process.exit(0);
