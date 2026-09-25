/* D-686's NEGATIVE CONTROL HARNESS. Declared in `test/content-chain-kind.test.mjs`'s `NEGATIVE CONTROL:`
 * header, run from `bio-plane/` in one step:
 *
 *     node test/nc-d686.mjs             # every arm, in order, baseline first
 *     node test/nc-d686.mjs generated   # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES while it runs, so neither
 * the battery's discovery nor `coverage.mjs`'s fleet walk must find it. `nc-rec104.mjs`'s shape and its
 * rules, a deliberate COPY rather than an import (a harness that shares machinery with another item's
 * harness shares that harness's defects): ONE ARM AT A TIME; a BASELINE row; every arm DECLARES before it
 * runs what MUST fail and what MUST NOT; every arm reports whether it ARMED (a match count that is not
 * exactly 1 is a FINDING); every restore is verified against a uniquely-named per-arm pristine copy by
 * sha256 AND by content, with the byte count printed and a minimum guarded (`git checkout --` is never
 * used); a surprising green is a finding about the ARM.
 *
 * THE ROW'S OWN ARM IS `generated`: "revert to the generated whole-chain column and the text-layer arm
 * fails by name". It swaps in `schema.mjs` and `store.mjs` exactly as they stood at the commit D-686 was
 * built on (read with `git show`, never typed) — the generated column, and a minter that does not write it.
 * `overstrict` is the over-strictness arm: `chainKindFor` spelled differently and correctly must PASS.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* THE PEN IS OUTSIDE THE WORKTREE (M0-182, BOB #32), through the one spelling. */
const SAFE = controlPen("d686");
mkdirSync(SAFE, { recursive: true });

/* THE COMMIT D-686 WAS BUILT ON (land/worker/D-635). Pinned, never a moving ref. */
const PRE_ITEM = "d31c52bf765135494d09f3d6ec9c9855a73b0719";

const STORE = join(PLANE, "src/store.mjs");
const SCHEMA = join(PLANE, "src/schema.mjs");
const TEXTCHAIN = join(PLANE, "src/textchain.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;

/* Each suite captured whole, not through a pipe — D-282. A MISSING tally is -1, never 0. */
const runSuite = (file) => {
  const r = spawnSync(process.execPath, [file],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  return { file, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()),
           tail: m ? [] : out.trimEnd().split("\n").slice(-6) };
};
const SUITES = ["test/content-chain-kind.test.mjs", "test/content-arm.test.mjs"];

function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const TEXT_LAYER_OP = "a TEXT-LAYER page's unit reads `layer` on a partitioned mixed document";

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes arms-broken from arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  generated: {
    files: [SCHEMA, STORE],
    why: "THE ROW'S ARM: schema.mjs and store.mjs as at D-686's base — REC-104's GENERATED whole-chain "
       + "column, and a minter that does not write it. Every unit of a mixed document then reads `ocr`",
    mustFail: [TEXT_LAYER_OP, "and on D-635's overlapping parts, a page only the layer read reads `layer`"],
    mustPass: "section 1b (the pure function, which this arm does not touch) and `content-arm.test.mjs` "
            + "entire — its fixture has no mixed document, so the generated column answers it identically",
    patch: () => {
      for (const f of [SCHEMA, STORE])
        writeFileSync(f, execFileSync("git", ["show", `${PRE_ITEM}:bio-plane/src/${f.split("/").pop()}`],
          { cwd: REPO, maxBuffer: 64 * 1024 * 1024 }));
      return { armed: true, matches: 2 };
    },
  },
  wholechain: {
    files: [TEXTCHAIN],
    why: "`chainKindFor` IGNORES THE PAGE — the defect D-686 closes, put back inside the one function. "
       + "Every reader and writer calls it, so the pure answer, the migration's recompute and the minted "
       + "rows must all fail on a text-layer page, BY NAME",
    mustFail: ["a TEXT-LAYER page of a mixed document reads `layer`",
               "every row is RECOMPUTED per unit", TEXT_LAYER_OP],
    mustPass: "every OCR'd-page and document-level arm — the whole chain's last step IS their answer",
    patch: () => arm(TEXTCHAIN, "    if (ext === \"all\" || ext.includes(page)) return derivations[i].step;",
                                "    return derivations[i].step;"),
  },
  nowrite: {
    files: [STORE],
    why: "A PLAIN COLUMN THE MINTER DOES NOT WRITE — the stale state a plain column risks, and the one "
       + "REC-104's generated column made impossible. Minted rows read NULL",
    mustFail: [TEXT_LAYER_OP, "an OCR'd page's unit reads `ocr`"],
    mustPass: "sections 1b, 2 and 2b — the migration writes the column itself, through the same function",
    patch: () => arm(STORE, "        chainKindFor(chain, unitTargetOf(extent)));", "        null);"),
  },
  nomigrate: {
    files: [STORE],
    why: "THE RECOMPUTE REMOVED: the column is converted but no existing row is given its value",
    mustFail: ["the rows the store ALREADY HELD carry their kind", "every row is RECOMPUTED per unit"],
    mustPass: "section 3 — a store created today mints every value and never needs the recompute",
    patch: () => arm(STORE, "        for (const r of [...this.sql.exec(`SELECT content_id, chain, extent FROM content`)])",
                            "        for (const r of [])"),
  },
  xinfo: {
    files: [STORE],
    why: "THE GUARD READS table_info — a GENERATED column is hidden from it, so a REC-104 store reads as "
       + "having no column, the ADD duplicates it, and the Durable Object bricks on that store's first boot",
    mustFail: ["the reboot REPLACES the generated column with a plain one"],
    mustPass: "section 2 (a pre-REC-104 store has no column to hide) and section 3",
    patch: () => arm(STORE, "PRAGMA table_xinfo(content)", "PRAGMA table_info(content)"),
  },
  lastkind: {
    files: [TEXTCHAIN],
    why: "BOB #35's ARM (09:35Z): the OLD answer for a unit with no page — the chain's last derivation step — "
       + "put back in place of the single-kind-or-`mixed` rule. A mixed document's whole-document unit then "
       + "reads the kind its chain happens to end on, and must fail BY NAME",
    mustFail: ["a WHOLE-DOCUMENT unit of a mixed document reads `mixed`",
               "the whole-document unit of a mixed document reads `mixed`",
               "every row is RECOMPUTED per unit"],
    mustPass: "every per-page arm and capture_text's `CHAIN_LAST` arm — the page question is untouched",
    patch: () => arm(TEXTCHAIN, "    return kinds.size === 1 ? [...kinds][0] : CHAIN_KIND_MIXED;",
                                "    return derivations[derivations.length - 1].step;"),
  },
  overstrict: {
    files: [TEXTCHAIN],
    why: "OVER-STRICTNESS: the page question rewritten as a FORWARD scan keeping the last covering (or "
       + "unreadable) step — a different, correct spelling. The suites test what the function answers, "
       + "not how it walks, so everything MUST PASS",
    mustFail: [], mustPass: "everything", passArm: true,
    patch: () => arm(TEXTCHAIN,
      "  for (let i = derivations.length - 1; i >= 0; i--) {\n"
    + "    const ext = extentOf(derivations[i]);\n"
    + "    if (ext === \"unreadable\") return null;\n"
    + "    if (ext === \"all\" || ext.includes(page)) return derivations[i].step;\n"
    + "  }\n  return null;",
      "  let kind = null;\n  for (const step of derivations) {\n"
    + "    const ext = extentOf(step);\n"
    + "    if (ext === \"unreadable\") kind = null;\n"
    + "    else if (ext === \"all\" || ext.includes(page)) kind = step.step;\n"
    + "  }\n  return kind;"),
  },
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let finding = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST PASS  ${a.mustPass}`);
  const saved = a.files.map((f) => {
    const dest = join(SAFE, `${name}.${f.split("/").pop()}`);
    copyFileSync(f, dest);
    return { f, dest, sha: sha(f), bytes: statSync(f).size };
  });
  for (const s of saved) {
    console.log(`  PRISTINE   ${s.f.replace(REPO + "/", "")}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 12)}…`);
    if (s.bytes < MIN_BYTES) { console.log(`  FINDING    pristine copy is under ${MIN_BYTES} bytes — refusing to proceed`); process.exit(2); }
  }
  const armed = a.patch();
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches}×)`);
  if (!armed.armed) { console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`); finding++; }
  const results = SUITES.map(runSuite);
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const same = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && same ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && same)) { console.log("  FINDING    restore FAILED — stopping before the next arm measures the wrong tree"); process.exit(2); }
  }
  let fails = 0;
  const failing = [];
  for (const r of results) {
    console.log(`  RESULT     ${r.file}: ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`
              );
    for (const l of r.failing) console.log(`             ${l}`);
    for (const l of r.tail) console.log(`             NO FOOT | ${l}`);
    fails += Math.max(r.fail, 0) + (r.pass < 0 ? 1 : 0);
    failing.push(...r.failing);
  }
  let ok;
  if (name === "baseline" || a.passArm) {
    ok = fails === 0 && results.every((r) => r.pass > 0);
  } else {
    const hit = a.mustFail.filter((m) => failing.some((l) => l.includes(m)));
    ok = fails > 0 && hit.length === a.mustFail.length;
    for (const m of a.mustFail.filter((x) => !failing.some((l) => l.includes(x))))
      console.log(`  MISSING    declared failure did NOT occur: ${m}`);
  }
  console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"}`);
  if (!ok) finding++;
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);

/* MEASURED 2026-09-25 by D-686's worker, on the final sources (after BOB #35's 09:35Z `mixed` ruling), the
 * whole harness in one run — content-chain-kind / content-arm, pass/fail:
 *   baseline    48/0  · 110/0   AS DECLARED
 *   generated   36/12 · 110/0   AS DECLARED  (both text-layer op arms and the `mixed` arms by name)
 *   wholechain  36/12 · 110/0   AS DECLARED  (1b, 2b, 3 text-layer arms by name)
 *   nowrite     42/6  · 104/6   AS DECLARED
 *   nomigrate   39/9  · 110/0   AS DECLARED  (sections 2 and 2b's recomputed rows)
 *   xinfo       43/5  · 110/0   AS DECLARED  (2b: the REC-104 store bricks)
 *   lastkind    44/4  · 110/0   AS DECLARED  (exactly the four whole-document `mixed` arms)
 *   overstrict  48/0  · 110/0   AS DECLARED
 * Every restore byte-identical (store.mjs 3474857 bytes, schema.mjs 259517, textchain.mjs 95758).
 * RECORDED, NOT SMOOTHED: the first run after the `mixed` ruling read baseline NOT AS DECLARED — content-arm's
 * pin that the `chain` vocabulary is exactly STEP_KINDS failed on the new word. That pin was superseded by the
 * ruling and is corrected at its site, and this run is the one after the correction. */
