#!/usr/bin/env node
/* DIST-12 — THE RELEASE LIVE VERIFICATION'S URL PREFLIGHT, RECORDED AS A DATED MEASUREMENT ENTRY.
 *
 * Why (SCHEDULER #18's row, on BOB #32's ruling of 2026-09-24 03:45Z, cite until folded; `BIO_Distribution_v0_1.md`
 * §6, the deploy-to-serve ladder): the CPDF-5 tier-1 corpus rests on real Oakland URLs that go stale, and D-166 gave
 * `bio-plane/test/tier1-coverage-probe.mjs --urls` to name each URL's fate apart — LIVE / NOT_PDF / NOT_FOUND /
 * REFUSED. Nobody ran it on a schedule, so a rotted URL was found only when a corpus run failed. DIST already takes a
 * live step at every release; this runs the preflight there and writes its verdict where the record keeps numbers.
 *
 * THIS TOOL CLASSIFIES NOTHING. The verdicts are the preflight's own; a second classifier here would be a second
 * normaliser that could agree on the fixture and disagree in the field. It runs the preflight as the release would
 * (a child process, the session's own network), reads its per-URL rows, and REFUSES (FORMAT_DRIFT) unless the rows it
 * read agree with the preflight's own summary line — so a change to the preflight's printout fails here by name rather
 * than yielding a short or empty entry.
 *
 * REFUSED is written as refused AT THIS HOUR, never as rotted: it says the request did not reach the origin (or the
 * origin refused it) from this session. Only NOT_FOUND means "re-point me", and each NOT_FOUND is listed as owing a
 * plan row naming the fixture (the preflight's document id) that depends on it.
 *
 * usage: node tools/urlpreflight-entry.mjs --release X.Y.Z [--id M-NNN] [--out <file>]
 *   prints the entry (or writes it to --out); exits 0 when an entry was produced — whatever the verdicts, since the
 *   entry IS the artifact — and 2 on FORMAT_DRIFT or a preflight that could not run.
 */
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
export const VERDICTS = ["LIVE", "NOT_PDF", "NOT_FOUND", "REFUSED"];

/** Parse the preflight's stdout. Returns { at, rows, live, total } or throws FORMAT_DRIFT naming what disagreed. */
export function parsePreflight(stdout) {
  const lines = stdout.split("\n");
  const at = (stdout.match(/^date: (\S+) ·/m) || [])[1] || null;
  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\S+)\s+(LIVE|NOT_PDF|NOT_FOUND|REFUSED)\s+(.*)$/);
    if (!m) continue;
    const src = (lines[i + 1] || "").trim();
    rows.push({ id: m[1], verdict: m[2], detail: m[3].trim(), src });
  }
  const sum = stdout.match(/^\s*(\d+)\/(\d+) LIVE \(bytes begin %PDF\) at (\S+)/m);
  if (!sum) throw new Error("FORMAT_DRIFT: the preflight printed no summary line (`N/M LIVE (bytes begin %PDF) at …`)");
  const live = Number(sum[1]), total = Number(sum[2]);
  const liveRead = rows.filter((r) => r.verdict === "LIVE").length;
  if (rows.length !== total || liveRead !== live)
    throw new Error(`FORMAT_DRIFT: read ${rows.length} rows (${liveRead} LIVE) but the preflight's summary says ${live}/${total}`);
  if (rows.some((r) => !/^https?:\/\//.test(r.src)))
    throw new Error("FORMAT_DRIFT: a row is not followed by its URL line");
  return { at: at || sum[3], rows, live, total };
}

/** Render the dated entry. One table line per URL. */
export function renderEntry({ at, rows, live, total }, { release = "UNSTATED", id = "M-<id>", exit = null } = {}) {
  const count = (v) => rows.filter((r) => r.verdict === v).length;
  const esc = (s) => String(s).replace(/\|/g, "\\|");
  const note = { LIVE: "", NOT_PDF: "bytes arrived and are not a PDF", NOT_FOUND: "ROTTED: the origin says it has no such document",
                 REFUSED: "refused AT THIS HOUR from this session — NOT evidence the document moved" };
  const rotted = rows.filter((r) => r.verdict === "NOT_FOUND");
  return [
    `## ${id} · ${String(at).slice(0, 10)} · DIST-12 — the tier-1 corpus URL preflight at release ${release}'s live verification`,
    "",
    `Instrument: \`node bio-plane/test/tier1-coverage-probe.mjs --urls\` (D-166: range GET of the first KiB, verdicts its own), run by`,
    `\`node tools/urlpreflight-entry.mjs\` at ${at} from the releasing session's network (node ${process.version}); preflight exit ${exit ?? "not recorded"}.`,
    `**${live}/${total} LIVE** · NOT_PDF ${count("NOT_PDF")} · NOT_FOUND ${count("NOT_FOUND")} · REFUSED ${count("REFUSED")}.`,
    "",
    "| fixture (preflight id) | verdict | detail | url |",
    "| --- | --- | --- | --- |",
    ...rows.map((r) => `| ${esc(r.id)} | **${r.verdict}** | ${esc(r.detail)}${note[r.verdict] ? " — " + note[r.verdict] : ""} | ${esc(r.src)} |`),
    "",
    rotted.length
      ? `**Owed:** each NOT_FOUND becomes a plan row naming the fixture that depends on it (to SCHEDULER): ${rotted.map((r) => r.id).join(", ")}.`
      : "Nothing rotted: no NOT_FOUND, so no plan row is owed." + (count("REFUSED") ? " The REFUSED rows say nothing about the documents." : ""),
    "",
  ].join("\n");
}

export function runPreflight(env = process.env) {
  const r = spawnSync(process.execPath, ["test/tier1-coverage-probe.mjs", "--urls"],
    { cwd: join(REPO, "bio-plane"), env, encoding: "utf8", timeout: 300_000 });
  return { stdout: r.stdout || "", stderr: r.stderr || "", exit: r.status };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = (n) => { const i = process.argv.indexOf(n); return i === -1 ? null : process.argv[i + 1]; };
  const run = runPreflight();
  let parsed;
  try { parsed = parsePreflight(run.stdout); }
  catch (e) { console.error(e.message); console.error(run.stderr.slice(0, 2000)); process.exit(2); }
  const entry = renderEntry(parsed, { release: arg("--release") || "UNSTATED", id: arg("--id") || "M-<id>", exit: run.exit });
  if (arg("--out")) { writeFileSync(arg("--out"), entry); console.log(`wrote ${arg("--out")}: ${parsed.live}/${parsed.total} LIVE`); }
  else process.stdout.write(entry);
}
