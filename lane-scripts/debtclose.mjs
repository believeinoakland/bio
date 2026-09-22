// SCHEDULER #12: rewrite the dispositions of DEBT rows leaving by door 1 (in fact) or door 2 (placed); the
// prior disposition moves VERBATIM into the description cell. Then `ledger.mjs archive <ID>` moves each row.
// Usage: node debtclose.mjs <repo> [--write]
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const REPO = process.argv[2];
const WRITE = process.argv.includes("--write");
const { isClosedDebtRow, debtDisposition } = await import(join(REPO, "tools/owed.mjs"));
const P = join(REPO, "docs/development/DEBT.md");
const fail = (m) => { console.error("ABORT: " + m); process.exit(1); };
const V = "`7c967f09`";
const PLACED = (m, id, owner, where, evidence) =>
  `${m} · CLOSED 2026-09-22 AS A DEBT ROW by LED-7 (SCHEDULER #12) — PLACED as a BACKLOG task under its own id, ${id} (owner ${owner}, ${m}), ${where}. Verified before placing, on ${V}: ${evidence}`;
const DISP = {
  "D-152": `M2 · CLOSED 2026-09-22 IN FACT, ruled by BOB #26 (the BOB INBOX entry of 2026-09-22, drained by SCHEDULER #12): DEC-4's *an OCR citation carries its image region* is met at the leg by a CAP, never a refusal (\`BIO_Content_Framework_v0_10.md\` §14.4). Evidence, spot-read on ${V}: \`checkEarnedLeg\` bounds a leg's capture letter by \`captureBound\` (C-2.8, REC-88); \`gradeCeiling\` lets only a covering attestation raise a content row and \`extentCovers\` gives a rect-less target no region's (\`textchain.mjs\`); the text index carries \`chain_kind\`. A refusal would press a member to invent a region.`,
  "D-164": `M4 · CLOSED 2026-09-22 IN FACT, ruled by BOB #26 (the BOB INBOX entry of 2026-09-22, drained by SCHEDULER #12): Bob's reopening condition of 2026-09-15 is met (\`BIO_Content_Framework_v0_10.md\` §18): Part II reviewed by Bob on 2026-09-14, the six pieces designed in their homes, and the primitive BUILT (\`node tools/status.mjs 4\` on ${V}: 4.edge BUILT, the central gap CLOSED). What remains is rowed or delegated: REC-122 and D-394 in \`BACKLOG.md\`, the TRANSCRIBE surface delegated to UI by REC-87.`,
  "D-65": PLACED("M3", "D-65", "RECORD", "directly after D-60, the same op", "no caller of docprofile's `assess` or `events.mjs` in `bio-plane/src`."),
  "D-74": PLACED("M4", "D-74", "CAPTURE", "first of the M4 product rows after D-126, a measurement before anything built on it", "`node tools/status.mjs 6` reads 6.identifier-spaces ABSENT."),
  "D-86": PLACED("M4", "D-86", "RECORD", "after D-394 and before D-162", "`queuestate.mjs` registers `bias-debt` and no sweep raises one (`store.mjs` states it DEFERRED)."),
  "D-66": PLACED("M2", "D-66", "FRAMEWORK", "directly after FW-20, EXTRACTION-BREADTH §2's order", "neither `tools/m032-class-census.py` nor `docprofile/doctypes/registry.mjs` knows a budget or dataset class."),
  "D-169": PLACED("M7", "D-169", "RECORD", "after D-65, first of the honesty batch with D-171 and D-179", "`dispose` writes `disposition_reason` with `#setScalar`, `mdFor` writes no such line for an inquiry, and `dispose` calls `promote` directly; the fix is `#setOrAddScalar` at that site."),
  "D-171": PLACED("M7", "D-171", "RECORD", "directly after D-169", "`#revisionKind` orders `created DESC, snap_key DESC` where REC-32's derivation orders `rowid DESC`; the fix takes REC-32's."),
  "D-179": PLACED("M7", "D-179", "RECORD", "directly after D-171, ruled by BOB #26 (`BIO_Intake_Doctrine_v1_1.md` §8: one capture, one home)", "`register.capture_sha` is the primary key (`schema.mjs`) and the promote write upserts on it (`store.mjs`)."),
  "D-125": PLACED("M8", "D-125", "RECORD", "last of the M8 corrections after D-82, ruled by BOB #26 (`NOTIFICATIONS.md` \"MARKED AS HANDLED\")", "`queueMute` (`store.mjs`) refuses every FINDING kind `KIND_NOT_PERSONAL`."),
  "D-178": PLACED("M10", "D-178", "RECORD", "after D-182 and above the features", "the audit sweep passes `earnedRegistry` alone, so `checkInheritedLeg` finds no published target: an inherited leg reads C-2.8 and neither C-21 arm runs; the fix injects `publishedRegistryFor` after a corpus count."),
};
const lines = readFileSync(P, "utf-8").split("\n");
for (const [id, nd] of Object.entries(DISP)) {
  const i = lines.findIndex((l) => l.startsWith(`| ${id} |`));
  if (i < 0) fail(`${id} not in DEBT.md`);
  if (nd.includes("|")) fail(`${id}: new disposition contains a pipe`);
  if (!isClosedDebtRow(nd)) fail(`${id}: new disposition does not read CLOSED`);
  const line = lines[i].replace(/\s+$/, "");
  const prior = debtDisposition(line);
  const cells = line.replace(/\|$/, "").split(" | ");
  if (cells.length !== 5) fail(`${id}: ${cells.length} cells`);
  cells[3] = `${cells[3]} — PRIOR DISPOSITION, moved verbatim at the close: ${prior}`;
  cells[4] = nd;
  const out = cells.join(" | ") + " |";
  if (debtDisposition(out) !== nd) fail(`${id}: read-back disposition differs`);
  if (!isClosedDebtRow(debtDisposition(out))) fail(`${id}: read-back not closed`);
  lines[i] = out;
  console.log(id, "ok", Buffer.byteLength(out), "B");
}
if (WRITE) { writeFileSync(P, lines.join("\n")); console.log("WRITTEN"); }
