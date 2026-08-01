/* NEGATIVE CONTROL: (run 2026-07-31) strip the M7 token from open DEBT row D-50 (cell -> "open") -> 2 fail (the D-50 row + the aggregate); AND strip the BUILT(FW-3) marker from CONSTRUCTS "The plan" Step 1 -> 2 fail (the Step 1 item + the aggregate); each restored, 154 pass 0 fail. */
/* Planning-drift hygiene: the M0-6 gate, on D-113's precedent.
 *
 * The repository is the channel between sessions (CLAUDE.md). The PLAN is how a
 * session learns what changed, and a plan drifts the same way every hand-kept
 * list in this repo has drifted: silently, and rediscovered weeks later by a
 * session doing an audit rather than by the session that drifted it. D-113's
 * purge table, the 38-of-41 `npm test` chain, the embedded-version skew — all one
 * class, all closed the same way: an instrument that fails IN THE SESSION THAT
 * DRIFTS, not at the next audit.
 *
 * `tools/plancheck.mjs` already checks the DEBT dispositions below at pre-push
 * time. That is necessary and not sufficient: a session that never runs plancheck
 * still cannot be allowed to drift the plan, so the same invariants are enforced
 * HERE, in the standing battery gate, where every session's `npm run test:battery`
 * runs them. Two checks in two places for one invariant is not duplication — it is
 * the cheap-and-early copy plus the cannot-be-bypassed copy, the same reasoning the
 * D-106 version check and the D-113 purge check already use.
 *
 * The three invariants (MILESTONES.md "How this file stays true", items 1, 2 and
 * the QUEUED cross-reference the status vocabulary carries):
 *
 *   1. Every OPEN row in DEBT.md carries a DISPOSITION TOKEN — a leading
 *      `M<n> | DOCTRINE | ACCEPTED | WATCH | SUPERSEDED | NOT OURS | BOB's`
 *      (or a RESOLVED verb), so the row can be sorted out of the ledger into
 *      work. A row with no disposition is invisible work, which is how a standing
 *      ruling went two design revisions with nothing scheduling it.
 *
 *   2. Every `QUEUED <ID>` cross-reference names an ID that ACTUALLY EXISTS as a
 *      queue item in QUEUE.md — a status marker pointing at a queue id that was
 *      renamed or never created is a dangling reference that reads as scheduled.
 *
 *   3. Every design-doc ORDER-OF-WORK item carries a STATUS MARKER
 *      (`BUILT <version>` | `QUEUED <ID>` | `UNSCHEDULED` | `BLOCKED <what>`).
 *      `CAPTURE-SCALING.md` is why the rule exists: five of its six items were
 *      built while its header still said nothing was.
 *
 * This suite reads the planning surface as text, on purpose: it is cheap, needs no
 * runtime, and catches the drift at the moment it is made.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const DIR = fileURLToPath(new URL(".", import.meta.url));
const REPO = join(DIR, "..", "..");            // bio-plane/test -> repo root
const DEV = join(REPO, "docs/development");
const ARCH = join(REPO, "docs/architecture");
const read = (p) => readFileSync(p, "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* Every .md under docs/development and docs/architecture, walked (not hand-listed)
   so a new doc carrying a QUEUED reference or an Order-of-work heading is seen. */
function allDocs() {
  const out = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith(".md")) out.push({ file: p, body: readFileSync(p, "utf8") });
    }
  };
  walk(DEV); walk(ARCH);
  return out;
}

/* ------------------------------------------------------------------ inventory */

const queue = read(join(DEV, "QUEUE.md"));
const debt = read(join(DEV, "DEBT.md"));

/* The queue ids, read out of QUEUE.md's own item headings (`### <ID> · <state>`)
   rather than hand-listed, so an id renamed there is seen here without a second
   edit — the same reason coverage.mjs reads the OPS table from source. */
const QUEUE_IDS = new Set(
  [...queue.matchAll(/^###\s+([A-Z][A-Z0-9]*-\d+)\s+·/gm)].map((m) => m[1]));
t("QUEUE.md declares a non-trivial set of item ids", QUEUE_IDS.size >= 10, true);

/* --------------------------------------- 1. every open DEBT row has a token */
/* The exact predicate plancheck.mjs enforces, ported so a session that runs only
   the battery gets the identical gate. A row is fine if its LAST cell begins with
   a disposition token OR reads as resolved. */
console.log("\n--- every open DEBT row carries a disposition token ---");
{
  const TOKEN = /\|\s*(M\d+|DOCTRINE|ACCEPTED|WATCH|SUPERSEDED|NOT OURS|BOB's)/;
  const RESOLVED = /\|\s*(fixed|resolved|closed|guarded|amended|measured)/i;
  const rows = [];
  for (const line of debt.split("\n")) {
    if (!/^\|\s*D-\d+\s*\|/.test(line)) continue;
    const id = (line.match(/^\|\s*(D-\d+)/) || [])[1];
    const tail = line.replace(/\s+$/, "");
    const i = tail.lastIndexOf("|", tail.length - 2);
    const status = i >= 0 ? tail.slice(i).replace(/^\|\s*|\s*\|$/g, "").trim() : "";
    const ok = TOKEN.test(`| ${status}`) || RESOLVED.test(`| ${status}`);
    rows.push({ id, ok, status });
  }
  t("DEBT.md has debt rows to check", rows.length >= 20, true);
  const bad = rows.filter((r) => !r.ok).map((r) => `${r.id} found:"${r.status.slice(0, 40)}"`);
  t(`every one of ${rows.length} DEBT rows carries a disposition token`, bad, []);
  /* Name each row so a break points at the exact D-number, not just a count. */
  for (const r of rows) t(`${r.id} carries a disposition token`, r.ok, true);
}

/* ---------------------------- 2. every QUEUED <ID> reference names a real item */
/* A status marker's `QUEUED <ID>` (and the prose "QUEUED as <ID>") must point at
   an item that exists in QUEUE.md. The literal template `QUEUED <ID>` in the rule
   text is excluded — an angle-bracketed placeholder is not a reference. */
console.log("\n--- every QUEUED <ID> cross-reference names a real queue item ---");
{
  const refs = [];
  for (const { file, body } of allDocs()) {
    for (const m of body.matchAll(/\bQUEUED\s+(?:as\s+)?([A-Z][A-Z0-9]*-\d+)\b/g))
      refs.push({ file, id: m[1] });
  }
  t("there is at least one concrete QUEUED reference to check", refs.length >= 1, true);
  const dangling = refs.filter((r) => !QUEUE_IDS.has(r.id))
    .map((r) => `${r.id} in ${r.file.slice(REPO.length + 1)}`);
  t(`every QUEUED reference (${refs.length}) names an existing queue item`, dangling, []);
}

/* --------------------------- 3. every order-of-work item carries a marker */
/* GOVERNED forward order-of-work lists — the ones that adopt the status-per-item
   convention. Registered explicitly (few, and each a deliberate forward plan), the
   way the D-113 purge exemptions are registered; the DISCOVERY GUARD below makes a
   NEW list titled "Order of work" impossible to add without triaging it here. */
const ORDER_OF_WORK = [
  { file: join(DEV, "CAPTURE-SCALING.md"), heading: "Order of work" },
  { file: join(ARCH, "CONSTRUCTS.md"), heading: "The plan: bottom up, and each step has a consumer" },
];
/* HISTORICAL order-of-work lists that predate the convention and are CLOSED: every
   step executed and superseded. Retro-stamping build versions on them would
   fabricate a ledger the doc never kept, so they are exempt WITH A REASON rather
   than red-lit — a judgment recorded, not guessed. */
const EXEMPT_ORDER_OF_WORK = [
  { file: join(DEV, "CONFORMANCE-AND-INTAKE-ARC.md"), heading: "5. Order of work",
    reason: "closed migration architecture; all eight steps executed and superseded by the live plane" },
];

const MARKER = /\b(BUILT|QUEUED|UNSCHEDULED|BLOCKED)\b/;
const ITEM = /^(?:\*\*Step\s+\d+[a-z]?|\d+[a-z]?\.)/;

/* The body of one `## <heading>` section, up to the next `## ` heading or EOF. */
function section(body, heading) {
  const lines = body.split("\n");
  const esc = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${esc}\\s*$`).test(l));
  if (start < 0) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++)
    if (/^##\s/.test(lines[i])) { end = i; break; }
  return lines.slice(start + 1, end);
}
/* Top-level items in a section: a numbered line or a `**Step N` line. Sub-items
   (`**(a)`, `-`) and prose are not items. Each carries its FIRST physical line,
   which is where the marker lives (`1. **BUILT.** …`, `**Step 0 — BUILT …**`). */
const itemsOf = (lines) => lines.filter((l) => ITEM.test(l));

console.log("\n--- every design-doc order-of-work item carries a status marker ---");
for (const { file, heading } of ORDER_OF_WORK) {
  const rel = file.slice(REPO.length + 1);
  const lines = section(read(file), heading);
  t(`${rel} · "${heading}" section is present (renaming it must not silently disable the check)`, lines != null, true);
  if (!lines) continue;
  const items = itemsOf(lines);
  t(`${rel} · "${heading}" has order-of-work items`, items.length > 0, true);
  const unmarked = items.filter((l) => !MARKER.test(l))
    .map((l) => l.replace(/^\*\*/, "").slice(0, 40).trim());
  t(`${rel} · every item under "${heading}" carries a status marker`, unmarked, []);
  for (const l of items) {
    const label = (l.match(/^\*\*Step\s+\d+[a-z]?|^\d+[a-z]?\./) || ["?"])[0].replace(/[.*]/g, "").trim();
    t(`${rel} · "${heading}" item "${label}" carries a status marker`, MARKER.test(l), true);
  }
}

/* DISCOVERY GUARD. Any heading titled "Order of work" anywhere in the design docs
   must be either GOVERNED or EXEMPT — so the canonical form cannot be added, or an
   exempt one un-exempted, without a decision here. This is the mechanism that keeps
   the hand-kept registry above from falling behind the way D-113's list did. */
console.log("\n--- no unregistered 'Order of work' list escapes the check ---");
{
  const governed = new Set(ORDER_OF_WORK.map((o) => `${o.file}::${o.heading}`));
  const exempt = new Set(EXEMPT_ORDER_OF_WORK.map((o) => `${o.file}::${o.heading}`));
  const found = [];
  for (const { file, body } of allDocs()) {
    for (const m of body.matchAll(/^#{2,3}\s+((?:\d+\.\s*)?Order of work)\b.*$/gim))
      found.push({ file, heading: m[1].trim() });
  }
  t("the discovery guard finds the known 'Order of work' headings", found.length >= 2, true);
  const orphan = found
    .filter((f) => !governed.has(`${f.file}::${f.heading}`) && !exempt.has(`${f.file}::${f.heading}`))
    .map((f) => `${f.file.slice(REPO.length + 1)} · "${f.heading}"`);
  t("every 'Order of work' heading is governed or explicitly exempt", orphan, []);
  /* An exemption for a list that does not exist is stale; keep the allowlist honest. */
  for (const e of EXEMPT_ORDER_OF_WORK) {
    const present = section(read(e.file), e.heading) != null;
    t(`exemption "${e.file.slice(REPO.length + 1)} · ${e.heading}" names a real section`, present, true);
  }
}

console.log(`\nplanning-hygiene: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
