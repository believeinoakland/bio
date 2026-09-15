// UI-59's OWN COMPLETENESS CHECK, and the subject of this item's negative control.
//
// The question: does every UI item that LANDED A MEMBER SURFACE since `v33` have an
// entry in `CIVICOS_UI_STATE.md` naming its commit and its surface?
//
// The corpus is built two ways and the two must agree, because either alone is a
// list that goes stale:
//   (a) the ID SET — every `### UI-<n>` heading in QUEUE.md's UI section and its
//       CLOSED ITEMS register. This is what the brief names as "the list".
//   (b) the FACT — git history over `civicos-ui/`, which says whether that id ever
//       moved a member surface. `civicos-ui/**` is the fact; the register is the index.
//
// OVER-STRICTNESS IS BUILT IN, NOT BOLTED ON: an id whose landings touched only
// `civicos-ui/test/**`, or which never landed at all, is a MEASUREMENT or an unlanded
// row and is NOT required to have an entry. The check prints those by name with the
// reason, so an exemption is a stated result rather than a silent zero.
//
// NEGATIVE CONTROL: delete one SURFACE item's `vNN, … UI-<n>.` first line from
// CIVICOS_UI_STATE.md -> this must exit 1 naming that id as MISSING.
// OVER-STRICTNESS ARM: delete an exempt item's entry (UI-53, UI-52, UI-36, UI-31 —
// harness-only) -> this must still exit 0, because none of them is required.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const ROOT = "/Users/sparky/ClaudeCodeBIO/bio/.claude/worktrees/agent-a4ad9b33f45a32657";
const git = (a) => execFileSync("git", ["-C", ROOT, ...a], { encoding: "utf8", maxBuffer: 1 << 28 });
const LEDGER = `${ROOT}/docs/development/CIVICOS_UI_STATE.md`;
const QUEUE = `${ROOT}/docs/development/QUEUE.md`;

// ---- (a) the ID SET, from QUEUE.md's own headings -------------------------------
const queue = readFileSync(QUEUE, "utf8");
const idRows = new Map(); // id -> state word
for (const m of queue.matchAll(/^### (UI-\d+[a-z]?) · (\w+)/gm)) idRows.set(m[1], m[2]);
if (idRows.size === 0) {
  console.error("FATAL: the id set is EMPTY — the heading grammar moved. Refusing to");
  console.error("report a clean sweep over an empty corpus (WORKER.md: three times).");
  process.exit(2);
}

// ---- (b) the FACT, from git over civicos-ui/ ------------------------------------
const log = git(["log", "--format=%H|%h|%s"]).split("\n").filter(Boolean)
  .map((l) => { const [full, short, ...r] = l.split("|"); return { full, short, subj: r.join("|") }; });
const cache = new Map();
const filesOf = (sha) => {
  if (!cache.has(sha)) cache.set(sha, git(["show", "--format=", "--name-only", sha]).split("\n").filter(Boolean));
  return cache.get(sha);
};
// ids renumbered mid-flight: the landing commit spells the id it was renumbered FROM
const RENUMBERED = { "UI-46": "52bc9cf" };

const fact = new Map(); // id -> "surface" | "harness" | "none"
for (const id of idRows.keys()) {
  const n = id.slice(3);
  const re = new RegExp(`(^|[^0-9A-Za-z-])UI-${n}([^0-9A-Za-z]|$)`, "i");
  const owns = (c) => {
    const m = c.subj.match(/(^|[^0-9A-Za-z-])(UI-\d+[a-z]?)/i);
    return m && m[2].toLowerCase() === id.toLowerCase();
  };
  let shas = log.filter((c) => re.test(c.subj) && owns(c)).map((c) => c.full);
  if (RENUMBERED[id]) shas = [log.find((c) => c.short === RENUMBERED[id]).full];
  let kind = "none";
  for (const s of shas) {
    const ui = filesOf(s).filter((f) => f.startsWith("civicos-ui/"));
    if (ui.some((f) => !f.startsWith("civicos-ui/test/"))) { kind = "surface"; break; }
    if (ui.length) kind = "harness";
  }
  fact.set(id, kind);
}

// ---- the ledger's own entries ---------------------------------------------------
const ledger = readFileSync(LEDGER, "utf8");
const entries = new Map(); // id -> {v, line}
for (const m of ledger.matchAll(/^(v\d+), ([\d-]+) session, thread UI, (UI-\d+[a-z]?)\./gm)) {
  entries.set(m[3], { v: m[1], date: m[2] });
}

// ---- judge ----------------------------------------------------------------------
const required = [], exemptHarness = [], exemptUnlanded = [];
for (const [id, kind] of fact) {
  if (kind === "surface") required.push(id);
  else if (kind === "harness") exemptHarness.push(id);
  else exemptUnlanded.push(id);
}
const byN = (a, b) => Number(a.replace(/\D+/g, "")) - Number(b.replace(/\D+/g, ""));
required.sort(byN); exemptHarness.sort(byN); exemptUnlanded.sort(byN);

const missing = required.filter((id) => !entries.has(id));
// an entry must NAME a commit: a backtick-wrapped short sha on its first paragraph
const noCommit = required.filter((id) => {
  if (!entries.has(id)) return false;
  const blk = ledger.split(new RegExp(`^v\\d+, [\\d-]+ session, thread UI, ${id}\\.`, "m"))[1] || "";
  return !/`[0-9a-f]{7,40}`/.test(blk.split(/\n\nv\d+, /)[0]);
});

// ---- INVERT THE LIST: which UI ids does the REGISTER not carry at all? ----------
// The brief names QUEUE.md's UI section + CLOSED ITEMS register as "the list". It is
// not complete, and a check keyed on it would score the gap zero in silence. So ask
// the history the opposite question: which ids landed a surface WITHOUT ever getting
// a `### UI-<n>` heading? (Measured answer: UI-42, UI-44, UI-45 — rowed in
// `IS-BUILD-PLAN.md`, which was archived, so the register never learned them.)
const blind = [];
for (const c of log) {
  const m = c.subj.match(/(^|[^0-9A-Za-z-])(UI-\d+[a-z]?)/i);
  if (!m) continue;
  const id = m[2].toUpperCase().replace(/([0-9])([A-Z])/, "$1$2".toLowerCase());
  const norm = m[2].toLowerCase().replace("ui-", "UI-");
  if (idRows.has(norm) || blind.includes(norm)) continue;
  const ui = filesOf(c.full).filter((f) => f.startsWith("civicos-ui/") && !f.startsWith("civicos-ui/test/"));
  if (ui.length) blind.push(norm);
  void id;
}
blind.sort(byN);

console.log(`CORPUS: ${idRows.size} UI ids with a \`### UI-<n>\` heading in QUEUE.md`);
console.log(`  landed a MEMBER SURFACE (entry REQUIRED): ${required.length}`);
console.log(`  landed only under civicos-ui/test/ (EXEMPT, a measurement): ${exemptHarness.length} — ${exemptHarness.join(", ")}`);
console.log(`  never landed under civicos-ui/ at all (EXEMPT): ${exemptUnlanded.length} — ${exemptUnlanded.join(", ")}`);
console.log(`REGISTER BLIND SPOT: ${blind.length} id(s) landed a member surface with NO \`### UI-<n>\` heading`);
console.log(`  anywhere in QUEUE.md — ${blind.join(", ") || "(none)"}. These are NOT scored above;`);
console.log(`  a check keyed on the register cannot see them, and the ledger carries them anyway.`);
console.log(`LEDGER: ${entries.size} thread-UI entries present`);
const blindMissing = blind.filter((id) => !entries.has(id));
console.log(`  of the blind-spot ids, ${blind.length - blindMissing.length}/${blind.length} have a ledger entry` +
  (blindMissing.length ? ` — MISSING: ${blindMissing.join(", ")}` : ""));
console.log("");
if (missing.length) {
  console.log(`FAIL — ${missing.length} landed surface item(s) with NO ledger entry:`);
  for (const id of missing) console.log(`   MISSING  ${id}`);
}
if (noCommit.length) {
  console.log(`FAIL — ${noCommit.length} entr(y|ies) name no commit:`);
  for (const id of noCommit) console.log(`   NO COMMIT NAMED  ${id}`);
}
const fails = missing.length + noCommit.length;
if (!fails) console.log("PASS — every landed surface item has an entry, and every entry names a commit.");
process.exit(fails ? 1 : 0);
