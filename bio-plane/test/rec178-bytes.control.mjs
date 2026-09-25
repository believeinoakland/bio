/* NEGATIVE CONTROL for rec178-bytes.test.mjs — REC-178.
 *
 * Run:  node test/rec178-bytes.control.mjs [armId ...]      (default: all)
 *
 * DELIBERATELY NOT A `.test.mjs`: `scripts/battery.mjs` discovers by that suffix and this driver EDITS
 * src/store.mjs while it runs. Each arm is armed ALONE; each DECLARES before it runs what must fail and what must
 * not; a BASELINE arm exists; every restore is verified by sha256 AND a byte comparison against a uniquely named
 * per-arm pristine copy, with the byte count printed and floored; a patch matching zero times is reported DID NOT
 * ARM; a run that does not reach the suite's own foot line is reported -1, never 0.
 *
 * RESULT: recorded on the NEGATIVE CONTROL line at the head of rec178-bytes.test.mjs (run 2026-09-23: every arm
 * as declared; keepgiven also failed one undeclared arm, explained there).
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { ANCHOR_DRY, anchorTable } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const STORE = join(PLANE, "src", "store.mjs");
const SUITE = join(PLANE, "test", "rec178-bytes.test.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

const runSuite = () => {
  let out = "";
  try {
    out = execFileSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
                                                    stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) { out = `${e.stdout || ""}${e.stderr || ""}`; }
  const m = out.match(/\nrec178-bytes: (\d+) passed, (\d+) failed/);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].trim());
  return m ? { pass: Number(m[1]), fail: Number(m[2]), failed } : { pass: -1, fail: -1, failed, tail: out.slice(-2000) };
};

const NONASCII = "the non-ASCII arm: a REVISION adding a file 1,200,000 UTF-8 bytes long (600,000 units) is refused OVERSIZE_INLINE";
const STORED = "the stored bytes of every file is its UTF-8 length (text.length sent, a lie sent, none sent)";
const OVERSTRICT = ["an ASCII file of EXACTLY INLINE_MAX bytes lands", "a non-ASCII file UNDER the limit in bytes (1,000,000) lands"];

const ARMS = [
  { id: "baseline", what: "NO EDIT — the row that makes every other row interpretable",
    expect: "GREEN, 23 pass / 0 fail.",
    patch: null, ok: (r) => r.fail === 0 && r.pass >= 23 },
  { id: "textlength", what: "JUDGE text.length AGAIN at OVERSIZE_INLINE (the original defect's measure)",
    expect: `MUST FAIL by name: "${NONASCII}", and the creation arm. MUST NOT FAIL: the over-strictness arms, and `
          + "section 3's stored-bytes arms (the override still stores UTF-8).",
    patch: (s) => {
      const a = "        const inlineBytes = Store.#inlineBytesOf(f);\n";
      return s.split(a).length === 2 ? s.replace(a, "        const inlineBytes = typeof f.text === \"string\" ? f.text.length : null;\n") : null;
    },
    ok: (r) => r.failed.includes(NONASCII) && r.failed.includes("the non-ASCII arm on a CREATION is refused OVERSIZE_INLINE")
            && !OVERSTRICT.some((x) => r.failed.includes(x)) && !r.failed.includes(STORED) },
  { id: "keepgiven", what: "DROP THE OVERRIDE — store `bytes` as supplied (the original defect's store)",
    expect: `MUST FAIL by name: "${STORED}", the clean census, and the carried-forward arm's zero. MUST NOT FAIL: `
          + "section 1 (the judge measures UTF-8 on its own) and the over-strictness arms.",
    patch: (s) => {
      const a = "      return n === null || f.bytes === n ? f : { ...f, bytes: n };\n";
      return s.split(a).length === 2 ? s.replace(a, "      return f;\n") : null;
    },
    ok: (r) => r.failed.includes(STORED) && !r.failed.includes(NONASCII) && !OVERSTRICT.some((x) => r.failed.includes(x)) },
];

/* M0-197: under tools/anchordrift.mjs's dry read each arm's OWN patch is handed a recorder for the text, so its
   anchor is read from it (the arm demands exactly one site: `split(a).length === 2`). */
if (ANCHOR_DRY) anchorTable(ARMS.filter((a) => a.patch).map((a) => { const r = { arm: a.id, file: STORE };
  a.patch({ split: (find) => (r.find = find, ["", ""]), replace: (_, put) => (r.put = put, "") }); return r; }));

const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const origSha = sha(STORE);
const origLen = readFileSync(STORE).length;
if (origLen < 1_000_000) { console.error(`store.mjs is ${origLen} bytes — not the file this control expects`); process.exit(2); }
console.log(`subject src/store.mjs sha256 ${origSha} (${origLen} bytes)`);
let bad = 0;
for (const arm of ARMS.filter((a) => !only.length || only.includes(a.id))) {
  const pristine = join(tmpdir(), `rec178-control-${arm.id}-${process.pid}.pristine`);
  copyFileSync(STORE, pristine);
  let armed = true;
  if (arm.patch) {
    const next = arm.patch(readFileSync(STORE, "utf8"));
    if (next === null) armed = false; else writeFileSync(STORE, next);
  }
  const r = armed ? runSuite() : null;
  copyFileSync(pristine, STORE);
  const restored = sha(STORE) === origSha && Buffer.compare(readFileSync(STORE), readFileSync(pristine)) === 0;
  unlinkSync(pristine);
  const verdict = !armed ? "DID NOT ARM" : arm.ok(r) ? "AS DECLARED" : "NOT AS DECLARED";
  if (verdict !== "AS DECLARED" || !restored) bad++;
  console.log(`\n[${arm.id}] ${arm.what}\n  declared: ${arm.expect}`);
  if (r) console.log(`  actual: ${r.pass} pass, ${r.fail} fail${r.failed.length ? `; first FAIL "${r.failed[0]}"` : ""}`
                   + `${r.failed.length ? `\n  all FAIL: ${JSON.stringify(r.failed)}` : ""}${r.tail ? `\n  tail: ${r.tail}` : ""}`);
  console.log(`  verdict: ${verdict}; restored sha256 ${sha(STORE).slice(0, 12)}… (${readFileSync(STORE).length} bytes) `
            + `${restored ? "IDENTICAL" : "DIFFERS — STOP"}`);
  if (!restored) process.exit(3);
}
console.log(`\nrec178-bytes.control: ${bad ? `${bad} arm(s) not as declared` : "every arm as declared"}`);
process.exit(bad ? 1 : 0);
