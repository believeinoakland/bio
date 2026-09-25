/* REC-218's NEGATIVE CONTROL HARNESS — `reading.dialect`, persisted on the
 * acquire document. Declared on the suite it drives
 * (`reading-dialect.test.mjs`'s NEGATIVE CONTROL line), run from `bio-plane/`:
 *
 *     node test/nc-rec218.mjs                # every arm, baseline first
 *     node test/nc-rec218.mjs droppersist    # one arm
 *
 * NOT a `.test.mjs`, deliberately: it EDITS A REAL SOURCE while it runs, so the
 * battery's discovery must not find it (the `nc-fw23.mjs` precedent, whose
 * runner this file carries). One arm at a time, every other defence held OPEN;
 * a BASELINE row; each arm declares BEFORE it runs what MUST fail AND what MUST
 * NOT, and BOTH halves are checked; an arm that did not match EXACTLY ONCE is a
 * FINDING; every restore is verified against a uniquely-named per-arm pristine
 * copy by sha256 AND by content, with a byte count printed and a floor guarded.
 * The pristine copies go to the SESSION SCRATCHPAD (BOB #32), `REC218_PEN` to
 * override.
 *
 * THE ARMS, each the item's doctrine inverted:
 *  - `droppersist`   — THE ROW'S DECLARED ARM: the dialect is found and never
 *    written onto the reading, which is what the record held before this item.
 *  - `inextent`      — the dialect written INSIDE `container_extent`: option
 *    (a), the one BOB #33 did not take.
 *  - `wiresource`    — the format wire's own source dropped, so only the intake
 *    slot answers: proves the wire path is its own live source.
 *  - `guessencoding` — OVER-CLAIM: the projection fills an undetermined encoding
 *    with "latin-1", which is the record guessing.
 *  - OVER-STRICTNESS — the determined bodies and the HTML absence must be
 *    UNMOVED by the arms that do not concern them, and the sibling csv and
 *    registry suites UNMOVED by every arm.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const PEN = process.env.REC218_PEN
  || "/tmp/claude-0/-home-user-bio/4b5d43ce-ed54-5037-af17-e5a2ea7fb2ba/scratchpad/rec218/nc-pristine";
mkdirSync(PEN, { recursive: true });

const INDEX = join(PLANE, "src/index.mjs");
const FORMATS = join(PLANE, "src/formats.mjs");
const FLOOR = { [INDEX]: 400000, [FORMATS]: 5000 };
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

const SUITES = {
  dialect: "test/reading-dialect.test.mjs",
  csv: "test/formats-csv.test.mjs",
  registry: "test/formats.test.mjs",
};
const SIBLINGS = ["csv", "registry"];

function runSuite(key) {
  const r = spawnSync(process.execPath, [SUITES[key]],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) passe?d?, (\d+) faile?d?/.exec(out);
  return { key, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
}
function armPatch(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

/* The sites this item landed, quoted VERBATIM. */
const SITE_WRITE = `      if (reading && readDialect !== undefined) reading.dialect = readDialect;`;
const SITE_WIRE = `                readDialect = readingDialect(i2text.dialect);`;
const SITE_ENC = `    encoding: str(emitted.encoding),`;

const L = {
  row: "THE ROW'S ARM — the semicolon latin-1 body's acquire document",
  latin: "its delimiter is NAMED semicolon and its encoding UNDETERMINED",
  reason: "and the undetermined half carries the entry's own REASON",
  evidence: "the reason's evidence rides beside it",
  determined: "a determinable body reads both halves NAMED",
  tied: "THE AMBIGUOUS ARM — a tied signature reads the delimiter",
  tiename: "and the tie NAMES both candidates",
  beside: "BESIDE, NOT INSIDE (BOB #33 option (b))",
  keys: "the persisted key set is the PROJECTION's",
  readback: "THE READ-BACK ARM — each reads its dialect back THROUGH THE OP",
  readreason: "and each undetermined half reads back WITH its reason",
  html: "an HTML page acquires with the key ABSENT",
  tookwire: "the `application/csv` body TOOK THE FORMAT WIRE",
  wire: "THE WIRE ARM — a csv read by the format wire carries the dialect",
  wirebeside: "and on the wire the container extent still carries NO dialect",
  samesrc: "the wire's source and the intake source state the SAME dialect",
  slot: "the entry's `dialect` slot and its text() state the SAME dialect",
  empty: "an empty body has no signature",
};

const ARMS = {
  droppersist: {
    file: INDEX, why: "the dialect is found and never written onto the reading",
    patch: [SITE_WRITE, `      if (false && reading && readDialect !== undefined) reading.dialect = readDialect;`],
    mustFail: [L.row, L.latin, L.reason, L.evidence, L.determined, L.tied, L.tiename, L.keys,
               L.readback, L.readreason, L.wire, L.samesrc],
    mustNotFail: [L.html, L.beside, L.tookwire, L.wirebeside, L.slot, L.empty],
  },
  inextent: {
    file: INDEX, why: "the dialect is written INSIDE container_extent (option (a), not taken)",
    patch: [SITE_WRITE, `      if (reading && readDialect !== undefined) reading.container_extent = { ...(reading.container_extent || {}), dialect: readDialect };`],
    mustFail: [L.row, L.latin, L.beside, L.readback, L.wire, L.wirebeside],
    mustNotFail: [L.html, L.tookwire, L.slot, L.empty],
  },
  wiresource: {
    file: INDEX, why: "the format wire's own dialect source is dropped",
    patch: [SITE_WIRE, `                readDialect = undefined;`],
    mustFail: [L.wire, L.samesrc],
    mustNotFail: [L.row, L.latin, L.determined, L.tied, L.readback, L.html, L.tookwire, L.slot],
  },
  guessencoding: {
    file: FORMATS, why: "an undetermined encoding is filled with latin-1 by the projection",
    patch: [SITE_ENC, `    encoding: str(emitted.encoding) ?? "latin-1",`],
    mustFail: [L.latin, L.readback],
    mustNotFail: [L.row, L.determined, L.wire, L.html, L.tookwire],
  },
};

const only = process.argv[2];
const names = only ? [only] : Object.keys(ARMS);
if (only && !ARMS[only]) { console.error(`no arm "${only}"; have: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

console.log("=== REC-218 NEGATIVE CONTROL — reading.dialect on the acquire document ===\n");
console.log(`pristine ${PEN}  (session scratchpad, NOT the worktree — BOB #32)\n`);

const baseline = {};
for (const k of ["dialect", ...SIBLINGS]) baseline[k] = runSuite(k);
console.log("BASELINE  " + Object.values(baseline).map((r) => `${r.key} ${r.pass}/${r.fail}`).join(" · "));
if (Object.values(baseline).some((r) => r.fail !== 0 || r.exit !== 0 || r.pass < 1)) {
  console.error("\nBASELINE IS NOT GREEN — every arm below would be unreadable. Stopping.");
  process.exit(1);
}

const fired = (failing, lbl) => failing.some((f) => f.includes(lbl));
let findings = 0;
for (const name of names) {
  const arm = ARMS[name];
  const base = arm.file.split("/").pop();
  const pristine = join(PEN, `${base}.${name}.pristine`);
  copyFileSync(arm.file, pristine);
  const before = sha(arm.file), beforeBytes = statSync(arm.file).size;
  console.log(`\n--- ARM ${name} (${base}): ${arm.why}`);
  console.log(`    DECLARED must fail ${arm.mustFail.length} · must NOT fail ${arm.mustNotFail.length} · siblings ${SIBLINGS.join(", ")} unmoved`);

  const got = armPatch(arm.file, arm.patch[0], arm.patch[1]);
  if (!got.armed) {
    console.log(`    *** THE ARM DID NOT ARM: the site matched ${got.matches} time(s), not once. THIS IS A FINDING.`);
    findings++;
    copyFileSync(pristine, arm.file);
    continue;
  }
  const armed = runSuite("dialect");
  const hit = arm.mustFail.filter((l) => fired(armed.failing, l));
  const missed = arm.mustFail.filter((l) => !hit.includes(l));
  const broke = arm.mustNotFail.filter((l) => fired(armed.failing, l));
  const unexpected = armed.failing.filter((f) => !arm.mustFail.some((l) => f.includes(l)) && !arm.mustNotFail.some((l) => f.includes(l)));
  const sib = SIBLINGS.map((k) => runSuite(k));
  const moved = sib.filter((r) => r.fail !== baseline[r.key].fail || r.pass !== baseline[r.key].pass);

  console.log(`    ARMED    dialect ${armed.pass}/${armed.fail} (baseline ${baseline.dialect.pass}/${baseline.dialect.fail}) · ${hit.length}/${arm.mustFail.length} declared failures fired · ${broke.length} held-open broken`);
  if (armed.pass < 0) { console.log("    *** THE SUITE DID NOT REACH ITS FOOT under this arm (tally -1). THIS IS A FINDING."); findings++; }
  if (missed.length) { console.log(`    *** DECLARED BUT DID NOT FIRE: ${missed.map((s) => `"${s}"`).join(", ")}`); findings++; }
  if (broke.length) { console.log(`    *** HELD-OPEN ASSERTION BROKE: ${broke.map((s) => `"${s}"`).join(", ")}`); findings++; }
  if (unexpected.length) console.log(`    also failing (undeclared either way, recorded rather than smoothed): ${unexpected.length} — ${unexpected.map((s) => s.slice(6, 70)).join(" | ")}`);
  console.log(`    SIBLINGS ${sib.map((r) => `${r.key} ${r.pass}/${r.fail}`).join(" · ")}`);
  if (moved.length) { console.log(`    *** OVER-STRICTNESS BREACH: ${moved.map((r) => r.key).join(", ")} moved. THIS IS A FINDING.`); findings++; }

  copyFileSync(pristine, arm.file);
  const after = sha(arm.file), afterBytes = statSync(arm.file).size;
  const identical = readFileSync(arm.file).equals(readFileSync(pristine));
  const ok = after === before && identical && afterBytes === beforeBytes && afterBytes >= FLOOR[arm.file];
  console.log(`    RESTORED ${base} ${afterBytes} B sha256 ${after.slice(0, 12)}…  ${ok ? "verified (sha256 + cmp + floor)" : "*** RESTORE NOT VERIFIED"}`);
  if (!ok) { findings++; process.exit(1); }
}
console.log(`\n=== ${names.length} arm(s) run · ${findings} finding(s) ===`);
process.exit(findings ? 1 : 0);
