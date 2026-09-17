/* REC-92's NEGATIVE CONTROL DRIVER — `node test/nc-rec92.mjs [arm|all]`.
 *
 * INSIDE THIS WORKER'S OWN WORKTREE, never a shared scratchpad: two workers have
 * reported the shared one is not isolated between sessions, and a log under
 * `/tmp` with a generic name is not yours.
 *
 * EACH ARM ALONE, every other defence held open. Each mutation passes an
 * anchor-occurs-EXACTLY-ONCE guard and a bytes-really-changed guard. Every
 * restore is verified by sha256 AND by `cmp` against a PRISTINE copy named
 * UNIQUELY PER ARM, with a byte count printed and a minimum guarded — because
 * `git checkout --` restores to HEAD and has twice silently discarded a
 * session's own uncommitted work in this repository.
 *
 * AN OPENING AND A CLOSING BASELINE ROW BRACKET THE RUN. A harness that reported
 * the same answer for every arm INCLUDING the baseline is on record here, and
 * without a baseline row five reds read exactly like five arms working.
 *
 * EVERY ARM NAMES THE ASSERTIONS IT MUST TAKE DOWN **AND THE ONES IT MUST
 * LEAVE STANDING**, and the harness prints the actual set so the two can be
 * compared without anyone remembering. An arm that goes red in the right total
 * and the wrong places is the *break only the thing* failure, and this estate
 * has been burned by it twice — a control whose method perturbs a second
 * variable produces a refutation that looks more confident than the finding it
 * refutes.
 *
 * `overstrict` IS NOT AN ARM AND THAT IS DELIBERATE. It is section S9 of the
 * suite — six correct spellings this implementation was not written around —
 * and it is HELD OPEN under every arm below rather than armed on its own. A
 * fence tighter than its rule is an undeclared interface change wearing the
 * costume of caution, so what must be shown is that no arm here makes the
 * suite refuse something it should accept.
 */
import { readFileSync, writeFileSync, copyFileSync, statSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const QUERY = fileURLToPath(new URL("../src/query.mjs", import.meta.url));
const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./passage-arm.test.mjs", import.meta.url));
const MIN_BYTES = { [QUERY]: 60000, [STORE]: 500000 };
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* Each arm: [file, anchor, replacement, declared]. */
const ARMS = {
  /* §8: *a `passage:` hit inside a project the viewer is not in is withheld
     whole.* THE ARM IS NARROWED TO THIS ITEM'S OWN PATH ON PURPOSE. Replacing
     the gate in `from` outright would strip it from `rows=leg`, `rows=resolves`,
     `rows=concerns` AND `rows=content` as well — four arms this item did not
     write — and the resulting red would be a refutation about the whole
     projection wearing this item's name. Conditioning on `fts` moves ONE
     variable: the passage row shape with a term loses its predicate and nothing
     else does, so S98/S99 staying green is a real discriminator rather than a
     hope. */
  withhold: [QUERY,
    "               + `\\nWHERE ${gate.sql}${refSql}${ftsWhere}`;",
    "               + `\\nWHERE ${fts ? \"1=1\" : gate.sql}${refSql}${ftsWhere}`;",
    "MUST FAIL every read that goes through `rows=passage` WITH a term — because "
    + "`Store#runQuery`'s D-15 throw fires on a statement carrying no GATE_MARK and the op "
    + "answers ok:false rather than an ungated page. MUST NOT FAIL S91-S99 (`content:`, `leg:` "
    + "and the NO-TERM passage path all keep their gate, which is what shows the arm hit this "
    + "item's path and not the shared projection), and S1*, S2* except S24, S3* (registry, "
    + "compiler and bundle-grain reads). "
    + "*** DECLARATION CORRECTED AFTER RUNNING, TWICE, AND BOTH CORRECTIONS ARE THE RECORD. "
    + "(1) S24 was declared MUST-NOT-FAIL and it FAILED. THE ARM AND THE SUITE WERE BOTH RIGHT "
    + "AND THE DECLARATION WAS WRONG: S24 asserts every mode of the plan carries GATE_MARK, and "
    + "this arm removes GATE_MARK from one of those modes, so a pin naming that property MUST "
    + "go red when the property moves. Declaring otherwise was asking a structural pin to be "
    + "blind to a structural change — REC-109 recorded the identical mistake one construct "
    + "over. (2) The FIRST run of this arm reported only `S24 S41 S42` at 29 pass / 4 fail, and "
    + "that was NOT the arm being narrow — THE SUITE DIED at section 4 on a TypeError when "
    + "`a.rows` came back undefined, so sections 5 to 9 NEVER RAN and every discriminator this "
    + "arm rests on was UNTESTED while the run looked like a clean, narrow result. The suite's "
    + "row accesses were hardened and the arm re-run; the honest set is 34 assertions. An arm "
    + "destructive enough to blind the rest of the suite reads exactly like a precise one. *** "
    + "ACTUAL (hardened suite): S24 S41-S410 S51-S54 S61-S611 S72 S73 S75 S81 S82 S85 S86 S87 "
    + "— and S74, S83, S84, S88 and ALL of S9* stood, which is the discriminator"],

  /* §4.2's row shape returns *the indexed units MATCHED*. This arm leaves the
     ARM's own MATCH standing and removes only the ROW shape's, which is the
     precise question: is the match applied at BOTH grains, or only at the one
     that picks bundles? One variable — the row projection's `fts` — and the
     snippet goes with it because a `snippet()` with no MATCH in the statement is
     an FTS5 error rather than an empty string. */
  nomatch: [QUERY,
    "    const fts = passageOn(rowArm)",
    "    const fts = false && passageOn(rowArm)",
    "MUST FAIL S42 (the packet's ONE matching page widens to all three) and S44 (no snippet to "
    + "centre on). MUST NOT FAIL S32 S33 S34 S36 (the bundle-grain arm still narrows correctly "
    + "— which is exactly what proves the two grains are separate), S61-S611 (the tally is not "
    + "the rows), S91 S92 S93, S98 S99. "
    + "*** DECLARATION CORRECTED AFTER RUNNING, AND THE CORRECTION FOUND A REAL DEFECT IN THIS "
    + "ITEM'S OWN CODE. It was first declared to fail S410 and S51-S54 as well. Neither "
    + "happened, and the two reasons are different. S410 (`matched`) did not move because "
    + "`matched` and the row builder's `fts` were TWO SPELLINGS of one fact, so disabling the "
    + "builder left the envelope still announcing `matched: true` over rows that had not been "
    + "matched — the answer telling a member these are the passages that hit their term while "
    + "the statement had returned every unit in scope. THE ARM FOUND THAT; the shipped code was "
    + "corrected to one predicate (`passageOn`) with two callers, and S410 is consequently and "
    + "correctly no longer sensitive to this arm. S51-S54 did not move because section 5 is a "
    + "TRUNCATION-FLAG test over a two-unit capture whose units BOTH match the term, so "
    + "widening the answer cannot change what it contains — the section is insensitive to this "
    + "arm by construction and saying so is worth more than moving the fixture to manufacture a "
    + "red. *** ACTUAL: S42 S44 — which are precisely the two assertions that test *only the "
    + "matching units come back* and *the snippet centres on the term*"],

  /* §8: *the tally hard-coded → the observation-log arm catches it.* The call to
     `contentAxisFor` is left in place as a dead expression so the import and the
     shape are untouched and ONLY the decision moves — an arm that also deleted
     the call would be measuring whether the module still loads. */
  tallyhardcoded: [STORE,
    "      const axis = contentAxisFor({\n        observed: r.extract_state || null,",
    "      const axis = { state: Object.keys(CONTENT_AXIS_STATES)[0], determined: true };\n"
    + "      contentAxisFor({\n        observed: r.extract_state || null,",
    "AS DECLARED, EXACTLY. MUST FAIL S69 (nothing reads as the none-with-a-reason member any more) and S610 (the "
    + "capture NOBODY HAS READ is reported as fully indexed — the record claiming coverage it "
    + "does not have, which is the worst direction this surface has). "
    + "MUST NOT FAIL S41-S54 (the ROWS are not the tally — this is what separates the two), "
    + "S61-S66 (the tally still has its shape, its buckets and a sum: a shape-only assertion "
    + "CANNOT see this defect, which is why S69/S610 exist), S9*"],

  /* THE DESIGN GAP THIS ITEM CORRECTED, ARMED. §4.4 names four buckets;
     `contentAxisFor` has five answers. Folding the fifth into a neighbour is
     what this item declined to do, and on an instance predating REC-91 it would
     report a whole unindexed corpus as partly indexed. */
  foldundetermined: [STORE,
    "      [...Object.keys(CONTENT_AXIS_STATES), CONTENT_AXIS_UNDETERMINED].map((k) => [k, 0]));",
    "      [...Object.keys(CONTENT_AXIS_STATES)].map((k) => [k, 0]));",
    "AS DECLARED, EXACTLY (actual: S63 S66 S611). MUST FAIL S63 (the fifth bucket is simply gone), S611 (its honest zero becomes undefined) "
    + "and S66 (the buckets stop summing, because an unrecognised state now increments a key "
    + "that does not exist). "
    + "*** DECLARED STRUCTURAL-ONLY BEFORE RUNNING, AND THE DECLARATION IS THE POINT: this "
    + "fixture holds NO capture in the undetermined state, because every capture a suite can "
    + "create is either promoted through REC-91's writer or registered with no reading, and "
    + "both are DETERMINED. The undetermined state needs a capture whose extraction is recorded "
    + "and whose INDEX observation is absent — a pre-REC-91 promote, which this suite cannot "
    + "manufacture. So this arm proves the bucket EXISTS and is spelled from the constant; it "
    + "does NOT prove a real undetermined capture lands in it. Named rather than left for a "
    + "reader to mistake a structural green for a behavioural one. ***"],

  /* The bucket that says NOBODY LOOKED, folded into the one that says WE LOOKED
     AND THERE WAS NOTHING. These are the two the four-level search exists to
     keep apart: one is a fact about the document, the other is a fact about our
     coverage of it, and the second must never be read as the first. */
  foldnever: [STORE,
    "      if (Object.prototype.hasOwnProperty.call(counts, axis.state)) counts[axis.state] += 1;",
    "      if (Object.prototype.hasOwnProperty.call(counts, axis.state))\n"
    + "        counts[axis.state === Object.keys(CONTENT_AXIS_STATES)[3]\n"
    + "          ? Object.keys(CONTENT_AXIS_STATES)[2] : axis.state] += 1;",
    "AS DECLARED, EXACTLY (actual: S610 alone). MUST FAIL S610 — the capture nobody has ever read is counted as one we read and found "
    + "nothing indexable in, which turns an absence of looking into a finding about the "
    + "document. MUST NOT FAIL S66 (the total is unchanged: this arm MOVES a row between "
    + "buckets rather than losing it, so a sum-only assertion is blind to it — which is the "
    + "whole reason S610 is named separately), S68, S611, S41-S54, S9*"],
};

const run = () => {
  try {
    const out = execFileSync(process.execPath, [SUITE],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
    return { text: out, code: 0 };
  } catch (e) { return { text: `${e.stdout || ""}${e.stderr || ""}`, code: e.status ?? -1 }; }
};
const report = (label, r) => {
  const foot = /passage-arm: (-?\d+) pass, (\d+) fail/.exec(r.text);
  const failed = [...r.text.matchAll(/^ {2}FAIL {2}(S\d+):/gm)].map((m) => m[1]);
  console.log(`  ${label.padEnd(17)} exit=${String(r.code).padEnd(3)} `
    + `${foot ? `${foot[1]} pass / ${foot[2]} fail` : "NO FOOT — the suite did not reach its own tally (report -1, never 0)"}`);
  console.log(`  ${" ".repeat(17)} failing: ${failed.length ? failed.join(" ") : "(none)"}`);
  return failed;
};

const want = process.argv[2] || "all";
console.log(`REC-92 negative control · ${new Date().toISOString()}`);
console.log(`query.mjs ${statSync(QUERY).size} bytes · sha ${sha(QUERY).slice(0, 16)}`);
console.log(`store.mjs ${statSync(STORE).size} bytes · sha ${sha(STORE).slice(0, 16)}`);

console.log("\n  --- opening baseline ---");
report("BASELINE", run());

for (const [name, [file, anchor, repl, declared]] of Object.entries(ARMS)) {
  if (want !== "all" && want !== name) continue;
  const pristine = `${file}.pristine-rec92-${name}`;
  copyFileSync(file, pristine);
  const before = readFileSync(file, "utf8");
  const beforeSha = sha(file);
  if (statSync(pristine).size < MIN_BYTES[file])
    throw new Error(`REFUSED: pristine copy for ${name} is ${statSync(pristine).size} bytes, under the floor`);
  const n = before.split(anchor).length - 1;
  if (n !== 1) throw new Error(`REFUSED: arm ${name}'s anchor occurs ${n} times, not once — an arm that `
    + `patches zero sites or two is a finding about the arm, not about the subject`);
  writeFileSync(file, before.replace(anchor, repl));
  if (sha(file) === beforeSha) throw new Error(`REFUSED: arm ${name} changed no bytes`);
  console.log(`\n  ARM ${name}`);
  console.log(`  DECLARED: ${declared}`);
  report(name, run());
  copyFileSync(pristine, file);
  const ok = sha(file) === beforeSha;
  let cmpOk = false;
  try { execFileSync("cmp", ["-s", file, pristine]); cmpOk = true; } catch { cmpOk = false; }
  console.log(`  restored byte-identically: ${ok && cmpOk ? "YES" : "NO"} `
    + `(sha ${ok ? "match" : "MISMATCH"}, cmp ${cmpOk ? "match" : "MISMATCH"}, ${statSync(file).size} bytes)`);
  if (!ok || !cmpOk) throw new Error(`REFUSED: arm ${name} did not restore — STOP, the tree is dirty`);
  unlinkSync(pristine);
}

console.log("\n  --- closing baseline ---");
report("BASELINE", run());
