/* D-443 — THE NEGATIVE CONTROL FOR `frontier-chunk.test.mjs`'s D-443 block, RUN.
 *
 * `node test/frontier-chunk.control.mjs [arm]` from `bio-plane/`.
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS `src/store.mjs` while it runs, so the battery must not collect it
 * (the precedent of every `*.control.mjs` here). The suite loads `src/index.mjs` directly, so an arm needs no
 * rebuild of the bundle.
 *
 * WHAT EACH ARM DOES: it restores ONE spread `IN (${marks})` — one bound variable per id, the shape before
 * D-443 — in ONE read, and runs the suite. Declared BEFORE running: the assertions that MUST fail (the read's
 * own arm, by name, plus the arms downstream of the same op refusing) and those that MUST NOT (every arm on a
 * different op). A baseline row runs first. Every arm is armed ALONE; its anchor must occur EXACTLY ONCE and
 * the bytes must change; every restore is verified by sha256 AND by byte comparison against a pristine copy
 * named for that arm, with its byte count printed and floored.
 *
 * `overstrict` is the other direction: an aliased json_each spelling nobody would choose, applied to the one
 * read D443-7 pins structurally. Correct work in an unanticipated spelling must stay GREEN.
 *
 * D-445 (2026-09-24) ADDED THE DRIVEN TWIN TO `casereg`'s DECLARATION. That arm used to be able to fail one
 * assertion only — D443-7, a regex over the source — so it proved the pin was coupled to the SHAPE and
 * nothing more. With D443-7b in the suite the same restored spread must also stop a real op: 120 ratified
 * cases pinning one version of one finding, gated through op=ratify. A control that can only break a
 * matcher is the case `CLAUDE.md` §5 names — a suite coupled to shape surviving a change to behaviour —
 * and this is that gap closed from the other side.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const STORE = join(PLANE, "src/store.mjs");
/* THE PEN IS OUTSIDE THE WORKTREE — CORRECTED 2026-09-24 (D-445), on BOB #32's ruling of the same day.
   It was `bio-plane/.d443-control`, and its comment said "inside this worktree, never a shared /tmp name":
   the second half was right and the first was the trap. A file in the worktree is not inert — repository
   walkers walk it, `gates.mjs` §2e counts it, and it makes the tree DIRTY so D-293 refuses to record a
   green verdict; three items paid for that in one night. `mkdtempSync` answers the shared-name half
   properly: a directory nobody else can collide with, named for this control, and removed on the way out. */
const SAFE = mkdtempSync(join(tmpdir(), "d443-control-"));
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const J = "IN (SELECT value FROM json_each(?))";
const ALL = ["D390-0", "D390-1", "D390-2", "D390-3", "D390-4", "D390-5",
             "D443-0", "D443-1", "D443-2", "D443-3", "D443-4", "D443-5", "D443-6", "D443-7",
             /* D-445: the driven half of D443-7 and its own liar's clause. */
             "D443-0b", "D443-7b"];

/* Each arm: [anchor as it stands, the spread it restores], mustFail, and mustNotFail = ALL minus the
   downstream set named in `mayFail` (arms of the SAME op, which refuses whole). */
const ARMS = {
  baseline: { edits: [], mustFail: [], mayFail: [] },
  standings: {   /* `#contentStandings`, reached by op=promote of Q_T and Q_C: both promotes refuse, so every
                    arm reading Q_T or Q_C goes with it. D443-6 and D443-7 do not read either. */
    edits: [[`        WHERE content_id ${J}\`, JSON.stringify(ids));`,
             "        WHERE content_id IN (${ids.map(() => \"?\").join(\",\")})`, ...ids);"]],
    mustFail: ["D443-1"], mayFail: ["D443-0", "D443-2", "D443-3", "D443-4", "D443-5"] },
  earned: {      /* `#contentEarned`, reached by op=earnedbasis on Q_C (120 ids); Q_T's 120 go the same way. */
    edits: [[`         FROM content WHERE content_id ${J} LIMIT ?\`, JSON.stringify(ids), ids.length);`,
             "         FROM content WHERE content_id IN (${ids.map(() => \"?\").join(\",\")}) LIMIT ?`, ...ids, ids.length);"]],
    mustFail: ["D443-2"], mayFail: ["D443-0", "D443-3", "D443-4", "D443-5"] },
  attest: {      /* `#attestationsOver`: Q_C's 120 captures refuse; Q_T stands on ONE capture, so D443-4 must hold. */
    edits: [[`         FROM text_attestations WHERE capture_sha ${J}`,
             "         FROM text_attestations WHERE capture_sha IN (${ids.map(() => \"?\").join(\",\")})"],
            ["        ORDER BY capture_sha, at, attestor LIMIT ?`, JSON.stringify(ids), cap + 1);",
             "        ORDER BY capture_sha, at, attestor LIMIT ?`, ...ids, cap + 1);"]],
    mustFail: ["D443-3"], mayFail: ["D443-0", "D443-2", "D443-5"] },
  txrows: {      /* `#transcriptionsOver`'s FIRST list: every earnedbasis read hands it its content ids. */
    edits: [[`        WHERE content_id ${J} LIMIT ?\`, JSON.stringify(ids), ids.length);`,
             "        WHERE content_id IN (${ids.map(() => \"?\").join(\",\")}) LIMIT ?`, ...ids, ids.length);"]],
    mustFail: ["D443-4"], mayFail: ["D443-0", "D443-2", "D443-3", "D443-5"] },
  txatts: {      /* its SECOND list: only rows that ARE typings — Q_C has none, so only Q_T's read refuses. */
    edits: [[`        WHERE content_id ${J} ORDER BY content_id, at, attestor LIMIT ?\`,
      JSON.stringify(rows.map((r) => r.content_id)), cap + 1);`,
             "        WHERE content_id IN (${rows.map(() => \"?\").join(\",\")}) ORDER BY content_id, at, attestor LIMIT ?`,\n      ...rows.map((r) => r.content_id), cap + 1);"]],
    mustFail: ["D443-4"], mayFail: [] },
  union: {       /* `earnedBasisRegistry`'s union, bound twice: Q_C's read asks for 120 targets. */
    edits: [[`         SELECT bundle_id, capture_sha FROM register WHERE bundle_id ${J}
         UNION
         SELECT bundle_id, capture_sha FROM readings WHERE bundle_id ${J}`,
             "         SELECT bundle_id, capture_sha FROM register WHERE bundle_id IN (${ids.map(() => \"?\").join(\",\")})\n         UNION\n         SELECT bundle_id, capture_sha FROM readings WHERE bundle_id IN (${ids.map(() => \"?\").join(\",\")})"],
            ["      JSON.stringify(ids), JSON.stringify(ids))) {", "      ...ids, ...ids)) {"]],
    mustFail: ["D443-5"], mayFail: ["D443-0", "D443-2", "D443-3"] },
  supmax: {      /* the superseded-by MAX: op=reevaluations alone reads it. */
    edits: [[`        \`SELECT MAX(last_updated) AS m FROM bundles WHERE bundle_id ${J}\`,
        JSON.stringify(sup));`,
             "        `SELECT MAX(last_updated) AS m FROM bundles WHERE bundle_id IN (${sup.map(() => \"?\").join(\",\")})`,\n        ...sup);"]],
    mustFail: ["D443-6"], mayFail: [] },
  casereg: {     /* `publishedCaseRegistryFor`: pinned structurally (D443-7) AND driven (D443-7b, D-445).
                    D443-0b is read BEFORE the drive and through ops that never reach this function
                    (op=publishedcase, op=list, op=casedocument), so it must HOLD — that is what tells a
                    broken read apart from a fixture that never built its 120 cases. */
    edits: [[`       WHERE case_id ${J} AND ratified_at IS NOT NULL ORDER BY case_id, edition\`, JSON.stringify(ids))) {`,
             "       WHERE case_id IN (${ids.map(() => \"?\").join(\",\")}) AND ratified_at IS NOT NULL ORDER BY case_id, edition`, ...ids)) {"]],
    mustFail: ["D443-7", "D443-7b"], mayFail: [] },
  overstrict: {  /* a CORRECT aliased spelling of the same bind; declared GREEN — D443-7b included, since
                    an aliased `json_each` binds one variable too and the BEHAVIOUR is unmoved. */
    edits: [[`       WHERE case_id ${J} AND ratified_at IS NOT NULL`,
             "       WHERE case_id IN (SELECT j.value FROM json_each(?) AS j) AND ratified_at IS NOT NULL"]],
    mustFail: [], mayFail: [] },
};

const run = () => {
  let out = "", code = 0;
  try { out = execFileSync("node", ["test/frontier-chunk.test.mjs"], { cwd: PLANE, encoding: "utf8",
                                                                       maxBuffer: 64 * 1024 * 1024 }); }
  catch (e) { out = (e.stdout || "") + (e.stderr || ""); code = e.status ?? -1; }
  const failed = new Set(), passed = new Set();
  for (const L of out.split("\n")) {
    /* D-445: the trailing letter of a driven twin (`D443-7b`). Without it the new arms were harvested as
       neither passed nor failed, which this file scores UNSEEN — the right answer, reached for the wrong
       reason, and one that would have read as the suite not running them. */
    const m = /^\s+(PASS|FAIL)\s+(D\d+-\d+[a-z]?):/.exec(L);
    if (m) (m[1] === "PASS" ? passed : failed).add(m[2]);
  }
  const foot = /frontier-chunk: (\d+) passed, (\d+) failed(.*)$/m.exec(out);
  return { code, failed, passed, foot: foot ? foot[0] : "NO FOOT", reached: !!foot && !/DID NOT REACH/.test(foot[0]) };
};

const want = process.argv[2] ? [process.argv[2]] : Object.keys(ARMS);
const pristineSha = sha(STORE);
const pristineBytes = readFileSync(STORE).length;
if (pristineBytes < 2_000_000) throw new Error(`store.mjs is ${pristineBytes} B — not the file this control expects`);
console.log(`subject src/store.mjs ${pristineBytes} B sha256 ${pristineSha.slice(0, 16)}…`);
let bad = 0;
for (const name of want) {
  const arm = ARMS[name];
  const copy = join(SAFE, `store.${name}.pristine.mjs`);
  copyFileSync(STORE, copy);
  let armed = true;
  try {
    let src = readFileSync(STORE, "utf8");
    for (const [anchor, repl] of arm.edits) {
      const n = src.split(anchor).length - 1;
      if (n !== 1) { armed = false; console.log(`  ${name}: anchor occurs ${n}× — ARM DID NOT ARM`); break; }
      src = src.replace(anchor, () => repl);
    }
    if (armed && arm.edits.length) {
      writeFileSync(STORE, src);
      if (sha(STORE) === pristineSha) { armed = false; console.log(`  ${name}: bytes unchanged — ARM DID NOT ARM`); }
    }
    const r = armed ? run() : null;
    if (r) {
      const missed = arm.mustFail.filter((a) => !r.failed.has(a));
      const mustNot = ALL.filter((a) => !arm.mustFail.includes(a) && !arm.mayFail.includes(a));
      const over = mustNot.filter((a) => r.failed.has(a));
      const unseen = ALL.filter((a) => !r.failed.has(a) && !r.passed.has(a));
      const ok = r.reached && !missed.length && !over.length && !unseen.length;
      if (!ok) bad++;
      console.log(`  ${ok ? "AS DECLARED" : "NOT AS DECLARED"}  ${name}  failed=[${[...r.failed].join(",")}]  `
        + `${r.foot}${missed.length ? `  MISSED ${missed}` : ""}${over.length ? `  OVER ${over}` : ""}`
        + `${unseen.length ? `  UNSEEN ${unseen}` : ""}`);
    } else bad++;
  } finally {
    copyFileSync(copy, STORE);
    const back = readFileSync(STORE), orig = readFileSync(copy);
    const same = back.length === orig.length && back.equals(orig) && sha(STORE) === pristineSha;
    console.log(`    restore ${name}: ${back.length} B, sha256 ${sha(STORE).slice(0, 16)}…, cmp ${same ? "identical" : "DIFFERS"}`);
    if (!same) { console.log("RESTORE FAILED — stopping"); process.exit(2); }
  }
}
rmSync(SAFE, { recursive: true, force: true });
console.log(bad ? `\nfrontier-chunk.control: ${bad} arm(s) NOT AS DECLARED` : `\nfrontier-chunk.control: ${want.length}/${want.length} arms as declared`);
process.exit(bad ? 1 : 0);
