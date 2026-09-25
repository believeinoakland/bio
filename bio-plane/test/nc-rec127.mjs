/* REC-127's NEGATIVE CONTROL HARNESS. Declared in `test/rec127-cap-bytes.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-rec127.mjs             # every arm, in order, baseline first
 *     node test/nc-rec127.mjs noexclude   # one arm (digest comparison needs the whole run)
 *
 * NOT a `.test.mjs` and NOT a fleet suite: it EDITS A REAL SOURCE while it runs.
 * `nc-rec121.mjs`'s shape (itself `nc-rec104.mjs`'s), COPIED rather than imported —
 * a control harness that shares machinery with another item's harness shares that
 * harness's defects. It drives `rec121-chain-bytes.test.mjs` too, because that
 * suite's §4 is the assertion this item CORRECTED and must fail when the
 * exclusion is removed.
 *
 * THE RULES: one arm at a time, everything else held open; a BASELINE run twice
 * (the second is the A/A arm for the answer digest); every arm declares before it
 * runs what MUST fail and what MUST NOT; every arm reports whether it ARMED (a
 * match count other than 1 is a finding, never a retry); every restore verified
 * against a uniquely-named per-arm pristine copy by sha256 AND content, byte count
 * printed and a minimum guarded. `git checkout --` is never used.
 *
 * THE OVER-STRICTNESS ARM IS `preitem`: `src/query.mjs` exactly as it stood at the
 * commit this item was built on, and `content-arm.test.mjs` §11's digest — REC-104's
 * 40-question pin over a fixture with NO bytes row — must be IDENTICAL to this
 * tree's. Every question on that fixture is a question "not involving a bytes row",
 * so none of their answers may move.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";
import { ANCHOR_DRY, anchorPatch, anchorEach, anchorRows } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* THE PEN IS OUTSIDE THE WORKTREE (M0-182, BOB #32). `controlPen` is `mkdtempSync` under the system
   temp root, so neither the battery's discovery nor the fleet walk can enrol what it holds, and the
   tree stays CLEAN while the control runs — which matters because since D-293 a gate on a dirty tree
   RECORDS NOTHING. `mkdtemp`, not a fixed name, is what keeps it isolated: the shared scratchpad and
   `/tmp` are not isolated between sessions, and a harness there was once overwritten mid-turn by a
   concurrent worker. */
const SAFE = controlPen("rec127");
mkdirSync(SAFE, { recursive: true });

/* THE COMMIT THIS ITEM WAS BUILT ON. Pinned, never `origin/main`. */
const PRE_ITEM = "2c4a5c11";

const QUERY = join(PLANE, "src/query.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;

const runSuite = (file) => {
  const r = spawnSync(process.execPath, [file],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  const d = /REPORT content-answers sha256 ([0-9a-f]{64}) over (\d+) queries/.exec(out);
  return { file, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           digest: d ? d[1] : null, queries: d ? +d[2] : 0,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()),
           tail: m ? [] : out.trimEnd().split("\n").slice(-6) };
};
/* content-arm FIRST: its digest is results[0]. */
const SUITES = ["test/content-arm.test.mjs", "test/rec127-cap-bytes.test.mjs",
                "test/rec121-chain-bytes.test.mjs"];

function arm(file, find, replace) {
  if (ANCHOR_DRY) return (anchorPatch(file, find, replace), { armed: true, matches: 1 });   /* M0-197: read, never armed */
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const ARMS = {
  baseline: {
    why: "nothing armed — the row that distinguishes arms-broken from arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  baseline2: {
    why: "nothing armed, AGAIN — the A/A arm: the §11 digest must be identical across two untouched runs",
    mustFail: [], mustPass: "everything, and the SAME digest as `baseline`",
    patch: () => ({ armed: true, matches: 0 }),
  },
  noexclude: {
    why: "THE ROW'S DECLARED CONTROL: the exclusion removed, `cap:undetermined` back to bare "
       + "`derivation_cap IS NULL`. The bytes rows reappear under undetermined and the arm must FAIL naming them",
    mustFail: ["at BUNDLE grain, `content:cap=undetermined` names ONLY the documents holding a text row with no cap",
               "through `op=meaningrows&rows=content`, the answer is ONLY the two text rows",
               "the FILTER and the ROW LABEL agree for every document on every cap answer",
               "CORRECTED by REC-127: `content:cap=undetermined` no longer returns the bytes rows"],
    mustPass: "section 2's does-not-apply arms, section 3 entire, and content-arm's §11 digest IDENTICAL "
            + "to baseline (its fixture holds no bytes row, so it cannot see this — which is why this suite exists)",
    digestMustMatch: true,
    patch: () => arm(QUERY, "{ sql: `derivation_cap IS NULL AND cited_as <> ?`, args: [CONTENT_CITED_AS_BYTES] }",
                            "{ sql: `derivation_cap IS NULL`, args: [] }"),
  },
  dropall: {
    why: "THE LIAR ARMED: every bytes row dropped from EVERY `content:` answer (the arm's table becomes "
       + "a view without them). `cap=undetermined` goes green for free; the image disappears",
    mustFail: ["ARMED: five content rows over four documents",
               "`has:content` still names all four documents",
               "`content:image` names both documents holding an image",
               "`content:cap=does-not-apply` names the documents holding an image cited as bytes"],
    mustPass: "section 1's two undetermined arms — the liar's green, which is exactly why they alone "
            + "cannot be the acceptance",
    /* REC-121 MEASURED THIS METHOD'S SECOND VARIABLE and it is carried rather than
       re-discovered: swapping the table name for a view breaks content-arm's
       structural pins and its `cited`/`uncited` arms too, so content-arm is NOT
       required green under this arm, and only the declared failures are the verdict. */
    contentArmMayFail: true,
    patch: () => arm(QUERY, `table: "content", key: "bundle_id", bare: "kind",`,
                            `table: "(SELECT * FROM content WHERE cited_as <> 'bytes')", key: "bundle_id", bare: "kind",`),
  },
  nolabel: {
    why: "the row projection ignores `rowLabel`, so `derivation_cap` is projected bare: the filter answers "
       + "does-not-apply while the row list shows a NULL a reader takes for undetermined",
    mustFail: ["`rows=content` LABELS each row's `derivation_cap`",
               "the FILTER and the ROW LABEL agree for every document on every cap answer"],
    mustPass: "every filter arm in sections 1-3, and the §11 digest",
    digestMustMatch: true,
    patch: () => arm(QUERY, "m.row.map((c2) => m.rowLabel?.[c2] ? `(${m.rowLabel[c2]}) AS ${c2}` : `m.${c2} AS ${c2}`)",
                            "m.row.map((c2) => `m.${c2} AS ${c2}`)"),
  },
  preitem: {
    why: "OVER-STRICTNESS: `src/query.mjs` exactly as it stood at the commit this item was built on. "
       + "content-arm's §11 digest must EQUAL baseline's, while this item's own arms FAIL",
    mustFail: ["at BUNDLE grain, `content:cap=undetermined` names ONLY the documents holding a text row with no cap",
               "`content:cap=does-not-apply` names the documents holding an image cited as bytes",
               "`rows=content` LABELS each row's `derivation_cap`"],
    mustPass: "content-arm entire, and its section-11 answer digest byte-identical to `baseline`'s",
    digestMustMatch: true,
    patch: () => {
      writeFileSync(QUERY, execFileSync("git", ["show", `${PRE_ITEM}:bio-plane/src/query.mjs`],
        { cwd: REPO, maxBuffer: 64 * 1024 * 1024 }));
      return { armed: true, matches: 1 };
    },
  },
};

/* M0-197: tools/anchordrift.mjs reads the arms' anchors (a no-op otherwise); `preitem` writes query.mjs WHOLE, so it is not invoked. */
anchorRows([{ arm: "preitem", none: `writes src/query.mjs WHOLE from git show ${PRE_ITEM}; quotes no line` }]);
anchorEach(ARMS, (a, name) => name !== "preitem" && a.patch());


const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let finding = 0, baseDigest = null;
for (const name of names) {
  const a = ARMS[name];
  const files = name.startsWith("baseline") ? [] : [QUERY];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST PASS  ${a.mustPass}`);
  const saved = files.map((f) => {
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
              + (r.digest ? `  digest ${r.digest.slice(0, 16)}… over ${r.queries} queries` : ""));
    for (const l of r.failing) console.log(`             ${l}`);
    for (const l of r.tail) console.log(`             NO FOOT | ${l}`);
    fails += Math.max(r.fail, 0) + (r.pass < 0 ? 1 : 0);
    failing.push(...r.failing);
  }
  const digest = results[0].digest;
  if (name === "baseline") baseDigest = digest;
  let ok;
  if (name === "baseline" || name === "baseline2") {
    ok = fails === 0 && results.every((r) => r.pass > 0) && !!digest
      && (name === "baseline" || !baseDigest || digest === baseDigest);
    if (name === "baseline2" && baseDigest) console.log(`  A/A        digest ${digest === baseDigest ? "IDENTICAL" : "DIFFERENT"} across two untouched runs`);
  } else {
    const hit = a.mustFail.filter((m) => failing.some((l) => l.includes(m)));
    ok = armed.armed && fails > 0 && hit.length === a.mustFail.length;
    for (const m of a.mustFail.filter((x) => !failing.some((l) => l.includes(x))))
      console.log(`  MISSING    declared failure did NOT occur: ${m}`);
    /* content-arm must stay GREEN under every arm but the liar's (see `dropall`'s
       note: its METHOD breaks content-arm's structural pins) — a failure there
       would be this item moving an answer it must not move. */
    if (!a.contentArmMayFail && (results[0].fail !== 0 || results[0].pass < 0)) {
      console.log(`  FINDING    content-arm did not stay green under this arm`);
      ok = false;
    }
    if (a.digestMustMatch) {
      const same = !!digest && digest === baseDigest;
      console.log(`  DIGEST     ${digest ? digest.slice(0, 16) + "…" : "(none printed)"} vs baseline ${baseDigest ? baseDigest.slice(0, 16) + "…" : "(not run — run the harness whole)"}: ${same ? "IDENTICAL" : "DIFFERENT"}`);
      ok = ok && same;
    }
  }
  console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"}`);
  if (!ok) finding++;
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
