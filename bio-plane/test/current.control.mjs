/* PL-13 / IS-3 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — PL-3's `suggest.control.mjs` precedent, taken
 * up by PL-4, PL-14 and PL-15.
 *
 * THE PEN LIVES INSIDE THIS WORKTREE and never in a shared scratchpad. On
 * 2026-08-07 a worker's harness was OVERWRITTEN MID-TURN by another running
 * worker, and a harness silently replaced between ARM and RESTORE reports a
 * restore it never performed. `.pl13-harness/` is gitignored for its own reason,
 * written at the ignore line: an interrupted driver must not leave an untracked
 * file that becomes somebody else's corpus.
 *
 * EVERY RESTORE IS VERIFIED THREE WAYS — by sha256, by CONTENT, and by `cmp`
 * against a per-arm pristine copy named with the ARM ID as well as the path,
 * plus a pristine-of-record taken before any arm ran. The per-arm naming is
 * UI-50's finding paid forward: a driver that named its copies from the PATH
 * ALONE took two snapshots of one file and the second overwrote the first, and
 * `cmp` caught what the sha256 could not.
 *
 * EVERY ARM IS ARMED **ALONE**, with every other defence HELD OPEN, and every
 * arm DECLARES BEFORE IT RUNS what must fail and what must NOT. Arm (2b) is the
 * declared exception and says so in its own title: it takes two edits together
 * deliberately, because the harm of a misclassified kind is only reachable once
 * the mint has been satisfied.
 *
 * AND AN ARM THAT COMES BACK GREEN WHEN RED WAS PREDICTED IS A FINDING ABOUT
 * THE ARM, recorded rather than smoothed.
 *
 * Run it:  node test/current.control.mjs
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = {
  store: ROOT + "src/store.mjs",
  queuestate: ROOT + "src/queuestate.mjs",
};
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));

/* THE FLOOR ON THE PRISTINE COPIES. A harness has reported a restore
   byte-identical over an EMPTY manifest, caught only because a digest read
   `e3b0c442…` — the sha256 of the empty string. So the sizes are printed and
   floored before anything is armed. */
for (const [k, v] of Object.entries(ORIGINAL)) {
  console.log(`  pristine ${k}: ${v.length} bytes · sha256 ${ORIGINAL_SHA[k].slice(0, 16)}…`);
  if (v.length < 2000) { console.log(`  ** ${k} is implausibly small; refusing to arm over it`); process.exit(1); }
}

const PEN = ROOT + "../.pl13-harness";
rmSync(PEN, { recursive: true, force: true });
mkdirSync(PEN, { recursive: true });
/* THE PRISTINE OF RECORD, taken once, before any arm. */
for (const [k, p] of Object.entries(F)) copyFileSync(p, join(PEN, `record.${k}`));

let armsRun = 0, armsWrong = 0;

function runSuite(name) {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/" + name], { encoding: "utf8", timeout: 900000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  /* BOTH REPORT SPELLINGS, because suites here end on `N pass, M fail` and on
     `<name>: N passed, M failed`, and a matcher that knows one reads a healthy
     suite as UNREADABLE. A suite that THREW has NO tally, and it is reported as
     `-1` rather than `0`: a thrown module and a module with zero failures are
     different claims, and a `TypeError` inside an assertion goes through no
     assertion at all while the tally reads clean. */
  const m = /(\d+) pass(?:ed)?, (\d+) (?:FAIL|fail(?:ed)?)/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 150));
  return m ? { pass: +m[1], fail: +m[2], named, out }
           : { pass: -1, fail: -1, named, out };
}

function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 70)}…' occurs ${n} times in `
    + `${key}. An unguarded edit would have armed ${n} sites, and a control armed in more places than `
    + `it claims is not the control it reports.`);
  writeFileSync(F[key], src.replace(from, to));
}

function restoreAll(armId) {
  for (const [k, p] of Object.entries(F)) writeFileSync(p, ORIGINAL[k]);
  for (const [k, p] of Object.entries(F)) {
    const now = readFileSync(p, "utf8");
    if (sha(now) !== ORIGINAL_SHA[k]) throw new Error(`RESTORE FAILED BY HASH: ${k} (arm ${armId})`);
    if (now !== ORIGINAL[k]) throw new Error(`RESTORE FAILED BY CONTENT: ${k} (arm ${armId})`);
    /* TWO READERS THAT ARE NOT THIS PROCESS: the arm's own copy and the
       pristine of record. The arm id is IN THE FILENAME, so two arms over one
       path cannot overwrite each other's evidence. */
    execFileSync("cmp", ["-s", p, join(PEN, `arm${armId}.${k}`)]);
    execFileSync("cmp", ["-s", p, join(PEN, `record.${k}`)]);
    console.log(`    ${k}: ${now.length} bytes restored, verified by sha256, by content, and by cmp x2`);
  }
}

function arm(id, title, edits, mustFail, mustNotFail = [], expectGreen = false) {
  armsRun++;
  console.log(`\n=== (${id}) ${title}`);
  for (const [k] of edits) copyFileSync(F[k], join(PEN, `arm${id}.${k}`));
  /* An arm over a file it never edits still needs its own copy, or the restore
     verification below has nothing to compare against. */
  for (const k of Object.keys(F)) {
    try { readFileSync(join(PEN, `arm${id}.${k}`)); }
    catch { copyFileSync(F[k], join(PEN, `arm${id}.${k}`)); }
  }
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const r = runSuite("current.test.mjs");
    console.log(`  MEASURED: ${r.pass} pass, ${r.fail} fail${r.fail === -1 ? "  ** NO TALLY — the suite THREW rather than failing, reported as -1" : ""}`);
    for (const n of r.named) console.log(`    FAILED: ${n}`);
    const hit = (frag) => r.named.some((n) => n.includes(frag));
    let wrong = false;
    for (const frag of mustFail)
      if (!hit(frag) && r.fail !== -1) { console.log(`  ** WRONG: expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
    for (const frag of mustNotFail)
      if (hit(frag)) { console.log(`  ** WRONG: "${frag}" failed, and this arm must leave it GREEN`); wrong = true; }
    if (expectGreen) {
      if (r.fail !== 0) { console.log("  ** WRONG: this is an OVER-STRICTNESS arm and MUST stay green — correct work in a spelling the item did not anticipate must PASS"); wrong = true; }
      else console.log("  as declared: GREEN. Correct work in an unanticipated spelling is not refused.");
    } else if (r.fail === 0) {
      console.log("  ** WRONG: the suite stayed GREEN. A control that cannot fail proves nothing.");
      wrong = true;
    }
    if (wrong) armsWrong++; else console.log("  as declared.");
  } finally {
    restoreAll(id);
  }
}

console.log("\nPL-13 / IS-3 — negative controls. THE BASELINE FIRST, so every arm is a DELTA and so a\n"
          + "run in which every arm is broken is distinguishable from one in which every arm works.");
const base = runSuite("current.test.mjs");
console.log(`  BASELINE current.test.mjs: ${base.pass} pass, ${base.fail} fail`);
if (base.fail !== 0) {
  console.log("  ** the tree is not whole; every arm below would measure the wrong thing");
  process.exit(1);
}

/* ============ (1) THE PLAN ROW'S ARM A — CURRENT AS A SETTINGS ROW ======== */

arm("1", "THE PLAN ROW'S ARM A — WRITE CURRENT VIA A SETTINGS ROW. `#setProjectCurrentVersion` stops "
  + "PROMOTING the project and writes a table instead, which is DEC-17's forbidden shape exactly: a "
  + "way to change what a project stands on WITH NOTHING TO READ AFTERWARDS. "
  + "DECLARED: the dated-frontmatter arm, the append-only-history arm and the structural "
  + "no-table-write arm MUST fail. The vocabulary arms MUST stay green — and note what this arm "
  + "does NOT break, because it is the whole argument for asserting four ways: a settings row "
  + "SERVES A READ PERFECTLY WELL, so any suite that only checked op=basisversions would have "
  + "passed over this.",
  [["store", `    text = Store.#setScalar(text, "last_updated", \`"\${when}"\`);
    text = Store.#appendSessionLog(text,
      \`### Session \${when} | Stands on | \${who}\\n\``,
                  `    this.sql.exec("CREATE TABLE IF NOT EXISTS project_current (project TEXT NOT NULL, inquiry TEXT NOT NULL, version TEXT NOT NULL, by TEXT, at TEXT, PRIMARY KEY (project, inquiry))");
    this.sql.exec("INSERT OR REPLACE INTO project_current (project,inquiry,version,by,at) VALUES (?,?,?,?,?)", pid, inquiryId, vname, who, when);
    if (pid) return { ok: true, bundleId: pid, settingsRow: true };
    text = Store.#setScalar(text, "last_updated", \`"\${when}"\`);
    text = Store.#appendSessionLog(text,
      \`### Session \${when} | Stands on | \${who}\\n\``]],
  ["ARM 1 — the pointer is a DATED FRONTMATTER ROW",
   "ARM 2 — the act is in the project's APPEND-ONLY HISTORY",
   "ARM 4 — STRUCTURALLY, the ONE writer performs NO table write"],
  ["PL-13's two slugs are in the catalogue and are FINDING",
   "a member CANNOT mute 'stance-changed-here-not-elsewhere'"]);

/* ====== (2) THE PLAN ROW'S ARM B — THE SHARP ONE: A MUTEABLE FINDING ====== */

arm("2", "THE PLAN ROW'S ARM B, AND IT IS THE SHARP ONE — SUPPRESS THE NOTIFICATION AS A "
  + "PERSONALLY-MUTABLE CONDITION. `stance-changed-here-not-elsewhere` is MOVED out of "
  + "QUEUE_FINDING_KINDS and into QUEUE_CONDITION_KINDS, one key, nothing else. A member may then "
  + "MUTE a real divergence and it vanishes from their feed with nothing recorded about who "
  + "silenced it or why — which is the collapse D-125 and DEC-16 exist to prevent. "
  + "DECLARED: the FINDING-class assertion MUST fail and the DRIVEN mute refusal MUST fail. The "
  + "mint also refuses the whole feed with KIND_MISCLASSED, because the producer still mints the "
  + "kind as a FINDING — that is the fence working and it is why arm 2b exists.",
  [["queuestate", `  "stance-changed-here-not-elsewhere":
                                "a project moved what it stands on for a SHARED question and the other "`,
                  `  "x-moved-aside-stance-changed-here-not-elsewhere":
                                "a project moved what it stands on for a SHARED question and the other "`],
   ["queuestate", `  "runtime-ceiling-reached":      "a CPU or subrequest ceiling was reached (D-54, D-56)",`,
                  `  "runtime-ceiling-reached":      "a CPU or subrequest ceiling was reached (D-54, D-56)",
  "stance-changed-here-not-elsewhere": "MOVED BY THE CONTROL ARM — a divergence a member may silence",`]],
  ["PL-13's two slugs are in the catalogue and are FINDING",
   "a member CANNOT mute 'stance-changed-here-not-elsewhere'"],
  ["ARM 1 — the pointer is a DATED FRONTMATTER ROW",
   "ARM 2 — the act is in the project's APPEND-ONLY HISTORY"]);

arm("2b", "THE HALF ARM 2 CANNOT REACH, AND IT TAKES TWO EDITS TOGETHER ON PURPOSE. Move the kind "
  + "into CONDITION **and** flip the producer's own `class:` to match, so the mint is satisfied and "
  + "no refusal fires at all — and a real divergence between two teams is now something ONE member "
  + "can silence for themselves. This is the harm; arm 2 is only the alarm. "
  + "DECLARED: the FINDING-class arms and the mute-refusal arm MUST fail, and the feed MUST still "
  + "answer OK — that last part is the point, because a suite that only watched for a refusal would "
  + "see nothing wrong here.",
  [["queuestate", `  "stance-changed-here-not-elsewhere":
                                "a project moved what it stands on for a SHARED question and the other "`,
                  `  "x-moved-aside-stance-changed-here-not-elsewhere":
                                "a project moved what it stands on for a SHARED question and the other "`],
   ["queuestate", `  "runtime-ceiling-reached":      "a CPU or subrequest ceiling was reached (D-54, D-56)",`,
                  `  "runtime-ceiling-reached":      "a CPU or subrequest ceiling was reached (D-54, D-56)",
  "stance-changed-here-not-elsewhere": "MOVED BY THE CONTROL ARM — a divergence a member may silence",`],
   ["store", `          id: \`FINDING::stance-changed-here-not-elsewhere::\${inq}::\${p.id}\`,
          class: "FINDING",`,
             `          id: \`FINDING::stance-changed-here-not-elsewhere::\${inq}::\${p.id}\`,
          class: "CONDITION",`]],
  ["PL-13's two slugs are in the catalogue and are FINDING",
   "a member CANNOT mute 'stance-changed-here-not-elsewhere'"],
  []);

/* ================= (3) DIVERGENCE IS A COMPARISON, NOT A COUNT =========== */

arm("3", "THE SPINE OF SLUG ONE — DIVERGENCE IS A COMPARISON AND NOT A COUNT. The `elsewhere` "
  + "filter stops comparing versions, so the item fires whenever two projects draw on one question "
  + "whatever they stand on. "
  + "DECLARED: the CONVERGENCE arm MUST fail — two projects on ONE reading must produce silence. "
  + "The divergence arms MUST stay green, which is exactly what makes this defect invisible without "
  + "an arm pointed at AGREEMENT rather than at disagreement.",
  [["store", `                      && (!q.current || q.current.version !== p.current.version))`,
             `                      && (true || q.current.version !== p.current.version))`]],
  ["when B moves ONTO A's reading the divergence is GONE"],
  ["now TWO items, one per dated act"]);

/* ================== (4) THE SEVERED-STATUS CONFIRMATION ================== */

arm("4", "THE SEVERED-STATUS CONFIRMATION. `#projectsDrawingOn` stops honouring `status: severed`, "
  + "so a project that WITHDREW from a question is counted as drawing on it and contributes a "
  + "stance to everybody's divergence. "
  + "DECLARED: the severed arm MUST fail. This arm exists because `refs` carries `rel` and DROPS "
  + "`status`, so trusting the table alone is a defect that looks exactly like a working walk — and "
  + "because `versionAct` refuses to MOVE such a project's stance, which would leave the feed and "
  + "the act disagreeing about who is even in the conversation.",
  [["store", `                                  && x.status !== "severed"
                                  && String(x.target ?? "").trim() === inq);`,
             `                                  && String(x.target ?? "").trim() === inq);`]],
  ["the SEVERED project is not in the conversation at all"],
  ["and neither is the project that never cited the question"]);

/* ================= (5) THE TEAM IS READ, NEVER INFERRED ================== */

/* **THIS ARM CAME BACK GREEN ON ITS FIRST RUN WHEN RED WAS DECLARED, AND THE
   FINDING IS ABOUT THE ARM RATHER THAN ABOUT THE SUBJECT.** The first version
   fell back to the version's `author` ("ruth"), and the very next line —
   `if (!ids.has(src)) continue;` — drops any source that is not one of the
   projects drawing on the question. A member id never is. So the arm changed a
   line and changed no behaviour: **an arm that could never have been honoured**,
   which is a shape this project has met before and which reports as a healthy
   green. Re-declared to fall back to a PROJECT that really is in the set, which
   is the defect the guard actually prevents: manufacturing a team for a version
   that has none. Kept here rather than smoothed away, because the corrected arm
   is only trustworthy if the reason it needed correcting is on the record. */
arm("5", "THE TEAM IS READ, NEVER INFERRED. `#findingsVersionFromAnotherTeam` stops requiring the "
  + "run's context to be a PROJECT and falls back to the first project drawing on the question, so "
  + "a version composed BY HAND acquires a team it does not have. "
  + "DECLARED: the run-less arm MUST fail — a version with no run must mint NOTHING. The two "
  + "correctly-attributed arms MUST stay green, so the arm distinguishes *attributes correctly* "
  + "from *attributes at all*.",
  [["store", `           FROM inquiry_basis_versions WHERE bundle_id=? AND run IS NOT NULL AND run <> ''`,
             `           FROM inquiry_basis_versions WHERE bundle_id=?`],
   ["store", `        if (!runRow || runRow.context_type !== "project") continue;
        const src = String(runRow.context_id ?? "").trim();`,
             `        const src = String((runRow && runRow.context_type === "project" && runRow.context_id)
                          || (drawing[0] && drawing[0].id) || "").trim();`]],
  ["TWO items and not three"],
  []);

/* ============ (6) THE SOURCE IS NOT A HOME OF ITS OWN ITEM =============== */

arm("6", "THE SOURCE IS NOT A HOME OF ITS OWN ITEM. The exclusion is removed, so the team that "
  + "PROPOSED a reading is told it arrived from another team. "
  + "DECLARED: the excluded-home arms MUST fail. The item still exists and still says everything "
  + "else it said, which is the defect's whole camouflage — nothing errors, nothing is missing, and "
  + "one sentence is simply false for one audience.",
  [["store", `        const kept = homes.ancestors.filter((a) => a.id !== src);`,
             `        const kept = homes.ancestors;`]],
  ["A's reading is NOT filed under A"],
  ["the run-less version is absent for a REASON THE PRODUCER PUBLISHES"]);

/* ====== (7) THE DISPOSITION PUBLICATION IS A MEASUREMENT OF THE ACT ====== */

arm("7", "THE DISPOSITION PUBLICATION MUST BE A MEASUREMENT OF THE ACT AND NOT A CLAIM ABOUT IT. "
  + "`#dispositionOf`'s final return advertises the act on items that carry no key, which is "
  + "exactly the live defect UI-45 found one surface over — three controls that could only ever "
  + "have been refused. "
  + "DECLARED: the undispositionable arms MUST fail. The arms about the two proposal kinds MUST "
  + "stay green, because those were already true — which is what proves the publication is not "
  + "trivially true either.",
  [["store", `    return { available: false, op: null, keyed_on: KEYED_ON, key: null,
             reason: "no_disposition_identity",`,
             `    return { available: true, op: "proposedispose", keyed_on: KEYED_ON, key: null,
             reason: "no_disposition_identity",`]],
  ["NEITHER of this item's two kinds is dispositionable"],
  ["DRIVEN — the pair the plane publishes as `keyed_on` is the pair the act ACCEPTS"]);

/* ============= (8) THE PURGE GUARD, WHICH THIS ITEM'S OWN ARM FOUND ====== */

arm("8", "THE QUESTION MUST STILL EXIST. `#queueSharedInquiry`'s guard is removed, which is the "
  + "state this item SHIPPED IN until the purge-by-consequence arm caught it: the sharing edge "
  + "lives in the CITING project's own bytes and OUTLIVES the target, so both producers went on "
  + "announcing a divergence about a question `op=purge` had removed. "
  + "DECLARED: the purge arm MUST fail. Recorded as an arm rather than as a quiet fix, because a "
  + "defect found by a control is the best evidence that the control is real.",
  [["store", `      const q = this.#queueSharedInquiry(inq, viewer);
      if (!q) continue;
      const drawing = this.#projectsDrawingOn(inq, viewer);
      if (drawing.length < 2) continue;
      const qname = q.title || inq;
      for (const p of drawing) {`,
             `      const q = this.#queueSharedInquiry(inq, viewer) || { title: null };
      const drawing = this.#projectsDrawingOn(inq, viewer);
      if (drawing.length < 2) continue;
      const qname = q.title || inq;
      for (const p of drawing) {`]],
  ["PURGE THE SHARED QUESTION AND BOTH ITEMS GO QUIET"],
  ["both producers are live on the shared question before the purge"]);

/* ================== (9) OVER-STRICTNESS — THESE MUST PASS ================ */

arm("9", "OVER-STRICTNESS. A NEW FINDING KIND arrives in the catalogue that this item did not "
  + "anticipate, and a THIRD project cites the shared question in a spelling with extra whitespace "
  + "around the target. Correct work in an unanticipated shape must NOT be refused. "
  + "DECLARED: the suite MUST STAY FULLY GREEN. A fence that refuses correct work is a defect in "
  + "the fence, and this is the arm that would catch one.",
  [["queuestate", `  "register-unbacked":          "a register entry's bytes are unbacked (D-9, D-45)",`,
                  `  "register-unbacked":          "a register entry's bytes are unbacked (D-9, D-45)",
  "x-control-arm-unanticipated-kind": "a kind minted by a later item that this one never saw",`]],
  [], [], true);

console.log(`\n=== ${armsRun} arms run · ${armsWrong} NOT as declared`);
console.log("Every arm was armed ALONE with every other defence held open; every restore verified by");
console.log("sha256, by content, and by cmp against BOTH a per-arm pristine copy and the pristine of");
console.log("record. The BASELINE row above is what distinguishes all-arms-broken from all-arms-working.");
rmSync(PEN, { recursive: true, force: true });
process.exit(armsWrong ? 1 : 0);
