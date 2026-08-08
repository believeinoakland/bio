/* REC-65's NEGATIVE-CONTROL HARNESS. Not a `.test.mjs`: it EDITS REAL SOURCES while it
 * runs and the battery must not discover it (PL-3 / PL-4 / PL-11 / REC-73 precedent).
 *
 *     node test/identity-claims.control.mjs
 *
 * THE THING THIS HARNESS HAS TO SAY BEFORE IT RUNS AN ARM: **REC-65's diff is COMMENTS.
 * An ordinary behavioural arm passes no matter what this item writes** — delete every
 * corrected sentence and all 124 suites stay green. That property is exactly what let
 * six false comments stand for months, so the arms below break the CLAIM and the
 * INSTRUMENT rather than the behaviour, and only arm (5) touches behaviour at all.
 *
 * EACH ARM RUNS ALONE with the others held open, is DECLARED before it runs, and every
 * restore is verified by sha256 AND by a byte comparison against a PRISTINE COPY MADE
 * PER ARM and named for that arm. A restore verified only by re-reading what you wrote
 * is not verified.
 */
import { readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const P = (f) => join(DIR, "..", f);
const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");

const runSuite = () => {
  try {
    const out = execFileSync(process.execPath, [join(DIR, "identity-claims.test.mjs")],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return out;
  } catch (e) { return String(e.stdout || "") + String(e.stderr || ""); }
};
const tally = (out) => {
  const m = out.match(/(\d+) pass, (\d+) fail\s*$/m);
  /* A SUITE THAT DID NOT REACH ITS FOOT REPORTS NO TALLY, AND THAT IS NOT ZERO FAILURES.
     A TypeError inside an assertion goes through no assertion at all and ends the module
     while the count reads clean — measured in this project this week. */
  return m ? { pass: +m[1], fail: +m[2] } : { pass: null, fail: null, note: "NO FOOT REACHED" };
};
const named = (out, needle) => out.split("\n").filter((l) => l.startsWith("  FAIL") || l.includes(needle))
  .filter((l) => l.includes(needle)).length;
/* WHICH assertions failed, not how many. "6 fail" is a number; the labels are the
   finding, and an arm that cannot say what it broke has not been run. */
const failed = (out) => out.split("\n").filter((l) => l.startsWith("  FAIL")).map((l) => l.slice(8).trim());

const arms = [];
const arm = (id, file, declared, mutate, check) => arms.push({ id, file, declared, mutate, check });

/* ---------------------------------------------------------------- the arms */

/* (1) PLANT A FENCE THAT DOES NOT EXIST. The pre-DEC-52 condition, reconstructed: drop
   the marker line from the FW-6 stamp site and "a member's constitutive statement"
   stands again over three ops nothing refuses. MUST FAIL, naming the file and the
   field. */
arm("1-plant-a-false-fence", "src/index.mjs",
  "block 1 FAILS: declaredBy@src/index.mjs reported DEFECT by name, and the RULED set loses a member",
  (src) => src.replace(
    "       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may declare a relation, and\n       the record names it.\n\n", ""),
  (out) => ({ tally: tally(out), namedByField: named(out, "declaredBy@src/index.mjs"), failed: failed(out) }));

/* (2) THE INVERSE — A LYING MARKER MUST NOT BUY SILENCE. Keep the marker, delete the
   naming half the ruling depends on. Permission is granted against a NAMED actor, so a
   RULED site that stops naming the machine is no longer ruled. MUST FAIL. */
arm("2-marker-without-the-naming", "src/index.mjs",
  "the marker check fails and the site falls to DEFECT rather than to a softer verdict",
  (src) => {
    /* THE WHOLE BLOCK, not one sentence. The first draft of this arm removed a single
       `class:<cls>` and the edit "applied" while the block still carried another one two
       paragraphs up — the arm would have reported a pass that meant nothing. It is
       reported here because an arm whose anchor is too narrow is the same defect as a
       matcher whose corpus is too narrow. */
    const a = src.indexOf("FW-6: the SUBJECT REGISTRY");
    const b = src.indexOf("/* FW-7", a);
    if (a < 0 || b < 0) return src;
    const block = src.slice(a, b);
    if (!block.includes("class:<cls>")) return src;
    return src.slice(0, a) + block.replaceAll("class:<cls>", "a class name") + src.slice(b);
  },
  (out) => ({ tally: tally(out), namedByField: named(out, "declaredBy@src/index.mjs"), failed: failed(out) }));

/* (3) NEUTER THE SWEEP. Make the stamp-site matcher match nothing. MUST FAIL at the
   CORPUS FLOOR — not report a clean estate. A matcher narrowed to nothing reports a
   beautiful zero defects, and this project has measured a headline assertion PASSING
   over a walk that read zero files. */
arm("3-blind-the-sweep", "scripts/identity-claims.mjs",
  "caught by the corpus FLOOR as a delta, with the corpus size printed — never a clean estate",
  (src) => src.replace('const STAMP = /MACHINE_(?:CLASS|AUTHOR)_PREFIX/;',
                       'const STAMP = /MACHINE_NOTHING_AT_ALL_XYZZY/;'),
  (out) => ({ tally: tally(out), corpusLine: (out.match(/corpus: \d+ identity STAMP SITES[^\n]*/) || [""])[0] }));

/* (4) OVER-STRICTNESS, IN A SPELLING THIS ITEM DID NOT ANTICIPATE. No edit: arm (4) is
   the assertion that already sits in the suite and must stay GREEN under arms 1 and 2.
   `op=taskforward`/`op=taskresolve` say "MEMBER actions performed by a PERSON" — a
   member-actor claim in wording nothing here was written for, carrying NO marker — and
   it must read TRUE off the store's own fence. A sweep that flagged it would be wrong in
   the ACCUSING direction, which looks like diligence and is harder to notice. */

/* (5) POLARITY, AND THE ONE BEHAVIOURAL ARM. Strip the machine principal: the FW-6 stamp
   writes "" instead of `class:<cls>`. THE ACT IS PERMITTED; THE ANONYMITY IS NOT. Block 2
   MUST FAIL naming the field, while every source-sweep assertion stays green — which is
   the whole argument for having both blocks. */
arm("5-strip-the-machine-principal", "src/index.mjs",
  /* DECLARED: block 2 FAILS naming the field; block 1 unmoved. **MEASURED: block 1 MOVED
     TOO, and the declaration was wrong** — removing the stamp removes the SITE from the
     sweep's corpus, so the RULED set lost a member and (c) failed alongside block 2's
     four. Reported rather than smoothed: the instrument was stricter than its author
     predicted, which is the direction to be surprised in but is still a surprise. */
  "block 2 FAILS: declared_by empty on the registry and progression acts (block 1 ALSO moves — see the note)",
  (src) => src.replace(
    '        b.declaredBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;\n        passBody = JSON.stringify(b);\n      } catch { /* the DO will refuse the malformed body with its own words */ }\n    }\n    /* FW-7',
    '        b.declaredBy = viaSession ? sessMember : "";\n        passBody = JSON.stringify(b);\n      } catch { /* the DO will refuse the malformed body with its own words */ }\n    }\n    /* FW-7'),
  (out) => ({ tally: tally(out), namedPrincipal: named(out, "names the machine principal"), failed: failed(out) }));

/* ------------------------------------------------------------------- runner */

console.log("BASELINE (no arm) — the row that distinguishes six-broken from six-working.");
const base = tally(runSuite());
console.log(`  baseline: ${JSON.stringify(base)}\n`);
if (base.fail !== 0) { console.log("BASELINE IS NOT GREEN — stopping. Nothing below would mean anything."); process.exit(1); }

for (const a of arms) {
  const target = P(a.file);
  const pristine = P(`test/.pristine.${a.id}.${a.file.replace(/[^a-z0-9]+/gi, "_")}`);
  copyFileSync(target, pristine);
  const before = sha(target);
  const src = readFileSync(target, "utf8");
  const mutated = a.mutate(src);
  if (mutated === src) {
    console.log(`ARM ${a.id}: **THE EDIT DID NOT APPLY** — the anchor moved. NOT RUN, and reported as such.`);
    rmSync(pristine); continue;
  }
  writeFileSync(target, mutated);
  console.log(`ARM ${a.id}`);
  console.log(`  declared MUST-FAIL: ${a.declared}`);
  const out = runSuite();
  console.log(`  actual: ${JSON.stringify(a.check(out))}`);
  /* restore, then verify BOTH ways */
  copyFileSync(pristine, target);
  const after = sha(target);
  let cmpOk = true;
  try { execFileSync("cmp", ["-s", target, pristine]); } catch { cmpOk = false; }
  console.log(`  restored: sha256 ${after === before ? "MATCHES" : "**DIFFERS**"} · cmp ${cmpOk ? "identical" : "**DIFFERS**"}`);
  rmSync(pristine);
  const post = tally(runSuite());
  console.log(`  after restore: ${JSON.stringify(post)}\n`);
}
console.log("ARM 4-over-strictness: no edit. It is the assertion block (f) inside the suite, which must");
console.log("  stay GREEN under arms 1 and 2 — reported from their runs above rather than re-run here.");
