/* REC-116 — THE NEGATIVE-CONTROL DRIVER. Six arms, each armed ALONE with the
 * others held open, each asserting it ARMED, each restored from a PRISTINE copy
 * named uniquely for that arm and verified by sha256 AND by `cmp`.
 *
 * NOT A SUITE. Deliberately not named `.test.mjs`; run by hand and its results
 * recorded in the suite's own `NEGATIVE CONTROL:` line.
 *
 * THE RULES THIS DRIVER IS BUILT TO OBEY, each one bought with real time by
 * somebody in this repository:
 *
 *  - **BREAK ONLY THE THING.** A control whose method perturbs a second variable
 *    produces a refutation that looks more confident than the finding it
 *    refutes. Every arm here is a patch to ONE source, restored before the next.
 *  - **NEVER `git checkout -- <file>`.** It restores to HEAD, not to what you
 *    had, and exits 0 either way — it has silently destroyed a session's own
 *    uncommitted work twice in this repository. Restores here are `cp` from a
 *    per-arm pristine copy, VERIFIED by hash and by content.
 *  - **AN ARM THAT DID NOT ARM IS A FINDING.** Every patch anchor is asserted to
 *    occur EXACTLY ONCE before the patch, and the patched source is asserted to
 *    DIFFER from the pristine one after it.
 *  - **HAVE A BASELINE ROW.** Without one, six-arms-broken and six-arms-working
 *    are indistinguishable. It is the first row printed.
 *  - **AN OVER-STRICTNESS ARM**, and here it is the arm that decides the item is
 *    safe to ship: this row ADDS a reader and must change NOTHING already
 *    answered. It is driven against a PRE-ITEM BUILD rather than self-pinned,
 *    because a build compared to itself agrees at zero cost.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const STORE = join(ROOT, "src", "store.mjs");
const PRISTINE_DIR = join(HERE, ".rec116-nc");   /* INSIDE this worktree, never a shared scratchpad */

/* The base commit this branch built on — the PRE-ITEM build for arm (f). Read
   from git rather than hard-coded to a sha, so a rebase cannot silently make the
   comparison meaningless. */
const BASE = execFileSync("git", ["-C", ROOT, "merge-base", "HEAD", "origin/main"],
  { encoding: "utf8" }).trim();

const OPENING_STORE_SHA = createHash("sha256").update(readFileSync(join(HERE, "..", "src", "store.mjs"))).digest("hex");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

try { rmSync(PRISTINE_DIR, { recursive: true, force: true }); } catch {}
mkdirSync(PRISTINE_DIR, { recursive: true });

/* ===================================================================== *
 * THE SUITE RUNNER. Reports the suite's OWN tally read from its OWN foot
 * line, never the wrapper's exit status — a run that ends without its
 * completion line did not finish, whatever the shell said.
 * ===================================================================== */
const runSuite = (file) => {
  let out = "";
  try {
    out = execFileSync("node", [join(HERE, file)], { encoding: "utf8", cwd: ROOT, timeout: 600000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  const foot = out.match(/([\d]+) passing, ([\d]+) failing/);
  /* A MISSING TALLY IS REPORTED AS -1 AND NEVER AS 0. A TypeError inside an
     assertion goes through no assertion at all and ends the module while the
     count still reads clean; reporting 0 failures for a suite that never
     reached its foot is exactly how an armed control reads as a pass. */
  if (!foot) return { pass: -1, fail: -1, reachedFoot: false, out };
  return { pass: Number(foot[1]), fail: Number(foot[2]), reachedFoot: true, out };
};
const failedLabels = (out) => (out.match(/^ {2}FAIL {2}(.*)$/gm) || []).map((l) => l.slice(8, 60));

/* ===================================================================== *
 * ARMING — one file, one anchor, asserted to occur EXACTLY ONCE.
 * ===================================================================== */
const armOnce = (arm, file, anchor, replacement) => {
  const pristine = join(PRISTINE_DIR, `${arm}.${file.split("/").pop()}.pristine`);
  copyFileSync(file, pristine);
  const before = readFileSync(file, "utf8");
  const hits = before.split(anchor).length - 1;
  const armed = hits === 1;
  if (armed) writeFileSync(file, before.replace(anchor, replacement));
  return {
    pristine, armed, hits,
    changed: armed && readFileSync(file, "utf8") !== before,
    bytes: Buffer.byteLength(before),
  };
};
const restore = (arm, file, info) => {
  copyFileSync(info.pristine, file);
  const same = sha(file) === sha(info.pristine);
  let cmpOk = false;
  try { execFileSync("cmp", ["-s", file, info.pristine]); cmpOk = true; } catch { cmpOk = false; }
  /* FLOORED. Two harnesses in this repository reported a restore byte-identical
     OVER AN EMPTY MANIFEST, caught only because a digest read e3b0c442… — the
     sha256 of the empty string. */
  const big = Buffer.byteLength(readFileSync(file)) > 100000;
  console.log(`    restore(${arm}): byte-identical ${same && cmpOk ? "YES" : "NO"} · `
            + `sha ${sha(file).slice(0, 12)} · ${Buffer.byteLength(readFileSync(file))} bytes`);
  return same && cmpOk && big;
};

/* ===================================================================== *
 * THE BASELINE ROW. Without it, six-arms-broken and six-arms-working are
 * indistinguishable.
 * ===================================================================== */
console.log("\n=== BASELINE — the subject suite with NOTHING armed ===");
const base = runSuite("rec116-route-marked.test.mjs");
console.log(`    rec116-route-marked.test.mjs: ${base.pass} passing, ${base.fail} failing, `
          + `reached its FOOT: ${base.reachedFoot}`);
t("BASELINE: the suite reaches its own FOOT — a suite that dies before its foot reports a clean "
+ "tally over assertions that never ran", base.reachedFoot, true);
t("BASELINE: and is GREEN with a non-trivial assertion count", [base.fail, base.pass > 50], [0, true]);
const BASE_PASS = base.pass;

const ARMS = [
  {
    id: "a", name: "THE OP NEUTERED — the page is emptied after the SELECT",
    file: STORE,
    anchor: "    const documents = [];\n    for (const m of page) {",
    patch: "    const documents = [];\n    for (const m of []) {",
    mustFail: /^B: /,
    declared: "every section-B arm — a document carrying a standing marker is NOT returned",
  },
  {
    id: "b", name: "THE TWO ABSENCES COLLAPSED — an empty answer cannot say WHY",
    file: STORE,
    anchor: "    let cause = null;\n    if (!documents.length) {",
    patch: "    let cause = null;\n    if (false && !documents.length) {",
    mustFail: /^C[123]: /,
    declared: "every section-C arm — never_assessed and none_standing become indistinguishable",
  },
  {
    id: "c", name: "THE LIAR THE ROW NAMES — the standing clause dropped, so EVER-marked is returned",
    file: STORE,
    anchor: "        AND m.seq = (SELECT MAX(x.seq) FROM provenance_route_marks x WHERE x.bundle_id = m.bundle_id)\n      ORDER BY m.bundle_id",
    patch: "        AND 1 = 1\n      ORDER BY m.bundle_id",
    mustFail: /^D1: /,
    declared: "section D1 — a document CORRECTED FORWARD is published as still doubted",
  },
  {
    id: "d", name: "THE SECOND LIAR — every document with any route row at all",
    file: STORE,
    anchor: "      WHERE m.finding = ?\n        AND m.bundle_id > ?",
    patch: "      WHERE (m.finding = ? OR 1 = 1)\n        AND m.bundle_id > ?",
    mustFail: /^(B: |D[12]: )/,
    declared: "section B's over-strictness arm and section D2 — a document assessed PRESENT and "
            + "never doubted appears on a roster of doubted documents",
  },
  {
    id: "e", name: "THE FENCE — the gate resolution made unconditional",
    file: STORE,
    anchor: "      const b = seen.get(m.bundle_id);\n      if (!b) continue;",
    patch: "      const b = seen.get(m.bundle_id) || { current_state: \"verified\", object_type: \"information\" };\n      if (!b) continue;",
    mustFail: /^E: /,
    declared: "section E's deny arm — an unrecognised viewer is answered rather than withheld",
  },
];

for (const arm of ARMS) {
  console.log(`\n=== ARM (${arm.id}) ${arm.name} ===`);
  console.log(`    DECLARED MUST-FAIL: ${arm.declared}`);
  const info = armOnce(arm.id, arm.file, arm.anchor, arm.patch);
  t(`ARM (${arm.id}): THE ARM ARMED — its anchor occurs EXACTLY ONCE and the source really changed`,
    [info.hits, info.armed, info.changed], [1, true, true]);
  if (!info.armed) { restore(arm.id, arm.file, info); continue; }

  const r = runSuite("rec116-route-marked.test.mjs");
  const labels = failedLabels(r.out);
  console.log(`    ACTUAL: ${r.pass} passing, ${r.fail} failing, reached FOOT: ${r.reachedFoot}`);
  console.log(`    FAILED BY NAME: ${labels.length ? labels.join(" | ") : "(none)"}`);
  t(`ARM (${arm.id}): the subject suite FAILS`, r.fail > 0, true);
  t(`ARM (${arm.id}): and it fails BY NAME in the declared section, not by dying — the suite still `
  + `reached its own foot`, [r.reachedFoot, labels.some((l) => arm.mustFail.test(l))], [true, true]);

  t(`ARM (${arm.id}): RESTORED byte-identically, verified by sha256 AND by cmp, floored`,
    restore(arm.id, arm.file, info), true);
}

/* ===================================================================== *
 * ARM (f) — THE OVER-STRICTNESS ARM, AND IT IS THE ONE THAT DECIDES THIS
 * ITEM IS SAFE TO SHIP. This row ADDS a reader and must change NOTHING
 * already answered. Driven against a PRE-ITEM BUILD extracted from the
 * merge-base, never against this build compared to itself.
 * ===================================================================== */
console.log("\n=== ARM (f) OVER-STRICTNESS — every EXISTING provenance-route answer byte-identical ===");
console.log(`    DECLARED MUST-NOT-FAIL: anything. Pre-item build taken from merge-base ${BASE.slice(0, 12)}`);

/* THE PRE-ITEM `src/` IS WRITTEN AS A SIBLING OF THE REAL ONE, INSIDE
   `bio-plane/`, AND THAT PLACEMENT IS THE WHOLE TRICK. `src/index.mjs` imports
   `../checks/bio-checks.mjs` and `../docprofile/registry.mjs` — packages OUTSIDE
   `src/`. Extracted into a scratch directory those `..` hops resolve to nothing
   and miniflare dies bundling, which is how the first run of this arm failed.
   Placed here, they resolve to `bio-plane/checks` and `bio-plane/docprofile` on
   the CURRENT tree.
   THAT MAKES IT A MIXED BUILD — pre-item `src/`, current everything else — AND
   THE MIX IS VERIFIED RATHER THAN ASSUMED, because an unverified mixed build
   would turn this arm into a comparison of something nobody can name. The
   assertion below requires that NOTHING outside `src/` and `test/` has moved
   since the merge-base, which is exactly this item's claimed footprint. If that
   ever stops holding, this arm fails LOUDLY instead of quietly comparing two
   builds that differ somewhere the arm is not looking. */
const preDir = join(ROOT, ".rec116-preitem-src");
try { rmSync(preDir, { recursive: true, force: true }); } catch {}
mkdirSync(preDir, { recursive: true });

const REPO = execFileSync("git", ["-C", ROOT, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const movedSinceBase = execFileSync("git", ["-C", REPO, "diff", "--name-only", BASE, "--", "bio-plane"],
  { encoding: "utf8" }).trim().split("\n").filter(Boolean)
  .filter((p) => !p.startsWith("bio-plane/src/") && !p.startsWith("bio-plane/test/"));
t("ARM (f) GUARD: the MIXED BUILD is legitimate — nothing outside `src/` and `test/` has moved "
+ "since the merge-base, so the current `checks/` and `docprofile/` the pre-item `src/` resolves "
+ "against ARE the pre-item ones. Verified, never assumed",
  movedSinceBase, []);

/* The pathspec is relative to `ROOT` (`bio-plane/`); `git show` takes the FULL
   path from the repository root. Getting that wrong is how this arm first listed
   ZERO files. The count is asserted so a silent zero cannot happen again. */
const tracked = execFileSync("git", ["-C", ROOT, "ls-tree", "-r", "--name-only", BASE, "src"],
  { encoding: "utf8" }).trim().split("\n").filter(Boolean);
t("ARM (f): THE EXTRACTION ARMED — the pre-item build really lists sources, rather than listing "
+ "nothing and leaving the comparison to die later",
  tracked.length > 5, true);
for (const rel of tracked) {
  /* THE LEADING `src/` IS STRIPPED so the pre-item modules sit DIRECTLY under
     `bio-plane/`, exactly as the real `src/` does. That is what makes their
     `../checks/` and `../docprofile/` hops land on the real siblings. Nesting
     them one level deeper is how the second run of this arm died. */
  const out = join(preDir, rel.replace(/^src\//, ""));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, execFileSync("git", ["-C", REPO, "show", `${BASE}:bio-plane/${rel}`], { maxBuffer: 1 << 28 }));
}
t("ARM (f): the pre-item build really was extracted — its index.mjs exists and does NOT know the "
+ "new op, which is what makes it a pre-item build rather than a copy of this one",
  [existsSync(join(preDir, "index.mjs")),
   readFileSync(join(preDir, "index.mjs"), "utf8").includes("provenanceroutes:")],
  [true, false]);
t("ARM (f): and THIS build does know it — the polarity, so the line above is a measurement",
  readFileSync(join(ROOT, "src", "index.mjs"), "utf8").includes("provenanceroutes:"), true);

writeFileSync(join(PRISTINE_DIR, "answers.mjs"), ANSWER_PROBE());
const answersNow = JSON.parse(execFileSync("node",
  [join(PRISTINE_DIR, "answers.mjs"), join(ROOT, "src", "index.mjs")],
  { encoding: "utf8", cwd: ROOT, timeout: 600000 }));
const answersPre = JSON.parse(execFileSync("node",
  [join(PRISTINE_DIR, "answers.mjs"), join(preDir, "index.mjs")],
  { encoding: "utf8", cwd: ROOT, timeout: 600000 }));
try { rmSync(preDir, { recursive: true, force: true }); } catch {}
t("ARM (f): the scratch pre-item tree is REMOVED — an untracked directory left inside bio-plane "
+ "is a dirty tree the next gate reports as this item's",
  existsSync(preDir), false);

t("ARM (f) GUARD: both probes really ANSWERED — a byte-identity over two empty objects agrees on "
+ "nothing, which this repository has measured twice",
  [Object.keys(answersNow).length > 3, JSON.stringify(answersNow).length > 500,
   Object.keys(answersPre).length > 3], [true, true, true]);
for (const key of Object.keys(answersPre)) {
  t(`ARM (f): \`${key}\` is BYTE-IDENTICAL to the pre-item build`,
    JSON.stringify(answersNow[key]), JSON.stringify(answersPre[key]));
}

try { rmSync(PRISTINE_DIR, { recursive: true, force: true }); } catch {}
t("CLOSING BASELINE: re-measured EQUAL to the opening one, so no arm leaked into another",
  runSuite("rec116-route-marked.test.mjs").pass, BASE_PASS);
/* CORRECTED, NOT RELAXED, AND THE ORIGINAL WAS WRONG IN AN INSTRUCTIVE WAY.
   This assertion first read *`git diff` over src/ is EMPTY* — the closing check
   items that touch NO plane source use. It failed, correctly: REC-116 DOES
   change `store.mjs`, and an assertion demanding otherwise was asserting the
   item had not happened. What the closing check is actually for is that NO ARM
   LEAKED — that five arms which each edited this file and restored it left it
   exactly as the driver found it. So it is pinned to the OPENING SHA, which is
   a statement about the arms rather than about the item. */
t("CLOSING: NO ARM LEAKED — store.mjs is byte-identical to what this driver found at its start, "
+ "after five arms that each edited it and restored it", sha(STORE), OPENING_STORE_SHA);

console.log(`\nREC-116 NEGATIVE CONTROL: ${pass} passing, ${fail} failing`);
process.exit(fail ? 1 : 0);

/* The probe is written out rather than inlined so BOTH builds run the SAME
   driver bytes against a DIFFERENT worker script — the variable under test is
   the build and nothing else. */
function ANSWER_PROBE() {
  return `
import "${join(HERE, "stdio.mjs")}";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const IDX = process.argv[2];
const sha = (v) => createHash("sha256").update(v).digest("hex");
const mf = new Miniflare({ modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { ADMIN_TOKEN: "adm-p", MEMBER_TOKEN: "mem-p", PROBE_TOKEN: "prb-p", VERSION: "test", INSTANCE_NAME: "testinstance" } });
const post = async (op, b, qs = "") => (await mf.dispatchFetch(\`http://x/api/?op=\${op}&token=mem-p\${qs}\`, { method: "POST", body: JSON.stringify(b || {}) })).json();
const get = async (op, qs = "") => (await mf.dispatchFetch(\`http://x/api/?op=\${op}&token=mem-p\${qs}\`)).json();
const md = (id) => \`---\\nid: \${id}\\nobject_type: information\\ncurrent_state: verified\\n---\\n\\n# \${id}\\n\`;
const DER = { file: "s/d.pdf", locator: "https://www.example.gov/r.pdf", authority: "A", retrieved: "2026-07-19T19:15:50Z", capture: { method: "daemon-fetch", grade: "B", actor_class: "daemon", sha256: "a".repeat(64) } };
const NR = { file: "s/m.pdf", locator: "", capture: { grade: "C" } };
const seed = async (id, docs) => {
  const body = md(id);
  const files = [{ path: "bundle.md", text: body, bytes: body.length, sha256: sha(body) }];
  const prov = JSON.stringify({ documents: docs }, null, 2);
  files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  return post("promote", { bundleId: id, base: null, snapKey: "20260917T000000Z_aaaa1111", author: "m-riley",
    meta: { object_type: "information", group: "g", title: id, current_state: "verified", created: "2026-09-17T00:00:00Z", last_updated: "2026-09-17T00:00:00Z" }, files, register: [] });
};
/* STRIP the fields that move between two runs for reasons that are not this
   item — wall-clock stamps and content hashes over them. Everything else is
   compared verbatim. */
const norm = (v) => JSON.parse(JSON.stringify(v, (k, x) => (k === "at" || k === "last_updated" || k === "generated" || k === "ts") ? "<stamp>" : x));
await seed("Z-noroute", [NR]);
await seed("Z-good", [DER]);
const out = {};
out.assess_noroute = norm((await post("provenanceroute", {}, "&bundleId=Z-noroute")).result);
out.assess_good = norm((await post("provenanceroute", {}, "&bundleId=Z-good")).result);
out.assess_repeat = norm((await post("provenanceroute", {}, "&bundleId=Z-noroute")).result);
out.assess_missing = norm((await post("provenanceroute", {}, "&bundleId=NOPE")).result);
out.list = norm((await get("list")).result);
out.list_paged = norm((await get("list", "&limit=50")).result);
out.audit = norm((await get("audit")).result);
out.chain = norm((await post("provenancechain", {}, "&bundleId=Z-noroute")).result);
out.stats_routeMarks = norm((await get("stats")).result).routeMarks;
process.stdout.write(JSON.stringify(out));
await mf.dispose();
process.exit(0);
`;
}
