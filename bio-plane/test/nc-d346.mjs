/* D-346's NEGATIVE CONTROL HARNESS — meta.xml into `core-properties` and the
 * manifest into sha256 `intra` on the three OpenDocument entries. Declared on
 * the suite it drives (`formats-odf.test.mjs`'s NEGATIVE CONTROL line), run
 * from `bio-plane/` in one step:
 *
 *     node test/nc-d346.mjs              # every arm, baseline first
 *     node test/nc-d346.mjs skipmeta     # one arm
 *
 * NOT a `.test.mjs`, deliberately: it EDITS A REAL SOURCE while it runs (the
 * `nc-fw23.mjs` precedent, whose rules it carries): one arm at a time; a
 * BASELINE row; each arm declares BEFORE it runs what MUST fail and what MUST
 * NOT, and both halves are checked; an arm that does not match EXACTLY ONCE is
 * a finding; every restore is verified against a per-arm pristine copy by
 * sha256 AND by content, with a byte count printed and a minimum guarded. */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const PEN = process.env.D346_PEN
  || "/tmp/claude-0/-home-user-bio/e84a0bfb-8dfb-584a-b7d5-11f450033504/scratchpad/d346/nc-pristine";
mkdirSync(PEN, { recursive: true });

const ODF = join(PLANE, "src/odf.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 80000;   // odf.mjs is ~89 KB; a restore over a stub must fail loudly

const SUITES = {
  odf: "test/formats-odf.test.mjs",
  docx: "test/formats-docx.test.mjs",
  xlsx: "test/formats-xlsx.test.mjs",
  pptx: "test/formats-pptx.test.mjs",
  ooxml: "test/ooxml.test.mjs",
  registry: "test/formats.test.mjs",
};
const SIBLINGS = ["docx", "xlsx", "pptx", "ooxml", "registry"];
const PER = (label) => ["odt", "ods", "odp"].map((f) => `${f}: ${label}`);

function runSuite(key) {
  const r = spawnSync(process.execPath, [SUITES[key]],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) passe?d?, (\d+) faile?d?/.exec(out);
  return { key, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim().replace(/^FAIL\s+/, "")) };
}

function armPatch(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const SITE_META = `  if (hasMember(container, META_PART)) {\n    const read = await readPart(b, container, META_PART);`;
const SITE_CREATOR = `    creator: field("initial-creator"),`;
const SITE_FONT = `    if (fonts.has(name)) continue;\n`;

const ARMS = {
  skipmeta: {
    why: "the meta.xml read is skipped (the row's declared arm)",
    patch: [SITE_META, SITE_META.replace("if (hasMember(container, META_PART))", "if (false)")],
    mustFail: PER("the planted creator appears as a core-properties item"),
    mustNotFail: [...PER("without meta.xml, no core-properties item — and the absence is STATED by part"),
      ...PER("each embedded member is an intra link content-addressed by sha256 of its bytes")],
  },
  mapbyname: {
    why: "ODF's dc:creator (the LAST EDITOR) is mapped by name into `creator`",
    patch: [SITE_CREATOR, `    creator: field("creator"),`],
    mustFail: PER("the planted creator appears as a core-properties item"),
    mustNotFail: PER("without meta.xml, no core-properties item — and the absence is STATED by part"),
  },
  fontexempt: {
    why: "a font face content.xml names is linked as intra (D-612's judgment dropped)",
    patch: [SITE_FONT, ``],
    mustFail: PER("images, font faces, thumbnails and the package's own parts are NOT intra"),
    mustNotFail: PER("the planted creator appears as a core-properties item"),
  },
};

const only = process.argv[2];
const names = only ? [only] : Object.keys(ARMS);
if (only && !ARMS[only]) { console.error(`no arm "${only}"; have: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

console.log("=== D-346 NEGATIVE CONTROL — meta.xml and the manifest on the ODF entries ===\n");
let findings = 0;
const base = Object.keys(SUITES).map(runSuite);
console.log(`BASELINE ${base.map((r) => `${r.key} ${r.pass}/${r.fail}`).join(" · ")}`);
if (base.some((r) => r.fail !== 0 || r.pass < 1)) { console.log("*** BASELINE NOT GREEN — every arm below would be meaningless."); process.exit(1); }

for (const name of names) {
  const arm = ARMS[name];
  const pristine = join(PEN, `odf.pristine.${name}.mjs`);
  copyFileSync(ODF, pristine);
  const before = sha(ODF), beforeBytes = statSync(ODF).size;
  console.log(`\n--- ${name}: ${arm.why}`);
  const a = armPatch(ODF, ...arm.patch);
  if (!a.armed) { console.log(`    *** NEVER ARMED (${a.matches} matches). THIS IS A FINDING.`); findings++; continue; }
  const odf = runSuite("odf");
  const sib = SIBLINGS.map(runSuite);
  const missing = arm.mustFail.filter((l) => !odf.failing.includes(l));
  const wrong = arm.mustNotFail.filter((l) => odf.failing.includes(l));
  console.log(`    odf ${odf.pass}/${odf.fail} · MUST FAIL ${arm.mustFail.length - missing.length}/${arm.mustFail.length} · MUST NOT FAIL moved ${wrong.length}/${arm.mustNotFail.length}`);
  for (const l of odf.failing) console.log(`      FAIL  ${l}`);
  if (missing.length) { console.log(`    *** DID NOT FAIL: ${missing.join(" | ")}`); findings++; }
  if (wrong.length) { console.log(`    *** OVER-REACH: ${wrong.join(" | ")}`); findings++; }
  const moved = sib.filter((r) => r.fail !== 0 || r.pass < 1);
  console.log(`    SIBLINGS ${sib.map((r) => `${r.key} ${r.pass}/${r.fail}`).join(" · ")}`);
  if (moved.length) { console.log(`    *** SIBLING MOVED: ${moved.map((r) => r.key).join(", ")}`); findings++; }
  copyFileSync(pristine, ODF);
  const after = sha(ODF), afterBytes = statSync(ODF).size;
  const identical = readFileSync(ODF).equals(readFileSync(pristine));
  const ok = after === before && identical && afterBytes === beforeBytes && afterBytes >= MIN_BYTES;
  console.log(`    RESTORED ${afterBytes} B sha256 ${after.slice(0, 12)}…  ${ok ? "verified (sha256 + cmp + floor)" : "*** RESTORE NOT VERIFIED"}`);
  if (!ok) { findings++; process.exit(1); }
}

console.log(`\n=== ${names.length} arm(s) run · ${findings} finding(s) ===`);
process.exit(findings ? 1 : 0);
