/* REC-82's NEGATIVE CONTROL HARNESS. Declared in `test/content-extent.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-rec82.mjs            # every arm, in order, baseline first
 *     node test/nc-rec82.mjs oob        # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it (the `owed-controls.control.mjs` / `d249-port.control.mjs`
 * precedent). It is named `nc-rec82.mjs` rather than `.control.mjs` for the same
 * reason and to the same effect.
 *
 * THE RULES THIS HARNESS OBEYS, each with its receipt in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing. A harness whose first run reported the
 *     same verdict for every arm INCLUDING the baseline is why this exists: it
 *     is the only row that distinguishes eight-arms-broken from eight-working.
 *   - EVERY ARM DECLARES, BEFORE IT RUNS, what MUST fail and what MUST NOT.
 *   - EVERY ARM REPORTS WHETHER IT ARMED (the patch's match count, and a count
 *     that is not exactly 1 is a FINDING, not a retry).
 *   - EVERY RESTORE is verified against a UNIQUELY-NAMED per-arm pristine copy
 *     by sha256 AND by CONTENT, with a byte count printed and a minimum
 *     guarded. `git checkout --` is never used: it restores to HEAD, not to
 *     what was there, and has twice discarded a session's own uncommitted work.
 *   - A SURPRISING GREEN IS A FINDING ABOUT THE ARM and is printed, not smoothed.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* The pristine copies live INSIDE this worktree, in a DOT-directory so neither
   the battery's discovery nor the fleet walk can enrol what it holds — and never
   in the shared scratchpad, which is NOT isolated between sessions and has had a
   harness overwritten mid-turn by a concurrent worker. */
const SAFE = join(REPO, ".rec82-control-pristine");
mkdirSync(SAFE, { recursive: true });

const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const STORE = join(PLANE, "src/store.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;   // both files are hundreds of KB; a restore over a stub must fail loudly.

/* The subject: this item's own suite, run alone. Captured to a FILE and not a
   pipe — D-282: a suite that calls process.exit() discards unflushed PIPE
   writes, and a control whose tally reads -1 because of it reports the wrong
   arm as wrong. */
const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/content-extent.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  /* A TypeError inside an assertion goes through no assertion at all and ends
     the module while the tally reads clean, so a MISSING tally is reported as
     -1 and never as 0 — the suite did not reach its own FOOT. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
};

/** Apply exactly one textual patch, reporting the match count. */
function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes eight-arms-broken from eight-arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  oob: {
    files: [CHECKS],
    why: "neuter the page-set comparison, so an extent outside the capture's page set is accepted",
    mustFail: ["an extent outside the capture's page set is REFUSED BY NAME"],
    mustPass: "every other refusal",
    patch: () => arm(CHECKS,
      "if (Number.isInteger(ctx.pageCount) && ctx.pageCount > 0 && e.page >= ctx.pageCount)",
      "if (false)"),
  },
  nochain: {
    files: [CHECKS],
    why: "neuter the chain requirement, so an address into text nobody produced is accepted",
    mustFail: ["an extent with no extraction chain is REFUSED"],
    mustPass: "every other refusal, and the over-strictness arm",
    patch: () => arm(CHECKS,
      `if (e.kind !== 'document' && !(Array.isArray(ctx.chain) && ctx.chain.length))`,
      `if (false)`),
  },
  dom: {
    files: [CHECKS],
    why: "remove the by-name `dom` branch so it falls through to the unknown-kind arm — the refusal STILL happens, and the arm asserts it happens BY NAME",
    mustFail: ["`dom` is REFUSED BY NAME while no producer exists", "`dom` is not in the vocabulary either"],
    mustPass: "every other refusal — a dom extent is still refused, just not as itself",
    patch: () => arm(CHECKS,
      "  if (e.kind === CONTENT_EXTENT_KIND_NO_PRODUCER)",
      "  if (false && e.kind === CONTENT_EXTENT_KIND_NO_PRODUCER)"),
  },
  stale: {
    files: [STORE],
    why: "neuter the stale sweep's UPDATE, so a re-extraction marks nothing",
    mustFail: ["the rows minted against the OLD chain now read stale",
               "the edge still RESOLVES and says the document has since been re-read"],
    mustPass: "nothing was deleted — the row count is unchanged (the arm asserts BOTH halves, and this half must survive)",
    /* RE-ANCHORED 2026-09-14 after the derivation-bounds ratchet made
       `#markContentStale` one set-based UPDATE instead of a select-and-loop. The
       arm's original anchor was the per-row UPDATE inside that loop, and when
       the loop went the anchor matched ZERO times — the harness reported
       `ARMED NO (patch matched 0×)` and the arm read 59 pass / 0 fail, which is
       indistinguishable from a subject that cannot be broken. AN ARM THAT DID
       NOT ARM IS A FINDING, which is why the match count is printed and why the
       verdict is computed rather than eyeballed; without it this arm would have
       been recorded as green. */
    patch: () => arm(STORE,
      "    if (n) this.sql.exec(\n      `UPDATE content SET stale=1",
      "    if (false) this.sql.exec(\n      `UPDATE content SET stale=1"),
  },
  address: {
    files: [CHECKS],
    why: "THE ARM'S OWN ARM — make the content address ignore the extent, so every passage of one capture collides",
    mustFail: ["but a DIFFERENT page is a different row",
               "a page leg mints its own row, distinct from the document row"],
    mustPass: "nothing in particular — this arm exists to show the dedup assertion CAN fail, because a dedup true for every input is true for no reason",
    patch: () => arm(CHECKS,
      "    extent: canonicalExtent(extent),",
      "    extent: 'CONSTANT',"),
  },
  carry: {
    files: [STORE],
    why: "neuter the carry-forward, so a re-promotion re-mints from the LIVE chain and silently re-points an authored citation (Bob's 5.8)",
    mustFail: ["the citation still points at the row it was authored against, carried not re-minted",
               "and re-projecting minted no new row"],
    mustPass: "every refusal, and the stale arm's not-deleted half",
    patch: () => arm(STORE,
      "            const carried = priorContent.get(`${leg.target}\\u0000${canonicalExtent(ext)}`);",
      "            const carried = null;"),
  },
  overstrict: {
    files: [CHECKS],
    why: "THE OVER-STRICTNESS DIRECTION — require a chain for a `document` extent too, so a whole-document leg on an unread capture is refused. A fence tighter than its rule is not a safer fence",
    mustFail: ["a whole-document leg on an UNREAD capture mints — the row is a referent, not a claim"],
    mustPass: "every refusal above — the arm must break correct work and nothing else",
    patch: () => arm(CHECKS,
      `if (e.kind !== 'document' && !(Array.isArray(ctx.chain) && ctx.chain.length))`,
      `if (!(Array.isArray(ctx.chain) && ctx.chain.length))`),
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
  /* Pristine copies, UNIQUELY NAMED PER ARM, taken before the patch. */
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
  if (!armed.armed && name !== "baseline") {
    console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`);
    finding++;
  }
  const r = runSuite();
  console.log(`  RESULT     ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  for (const l of r.failing) console.log(`             ${l}`);
  /* Restore, and MEASURE the restore. */
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const sameBytes = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && sameBytes ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && sameBytes)) { console.log("  FINDING    restore FAILED — stopping before the next arm measures the wrong tree"); process.exit(2); }
  }
  /* The declared verdict, checked. */
  if (name === "baseline") {
    const ok = r.fail === 0 && r.pass > 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED — green" : "NOT AS DECLARED"}`);
    if (!ok) finding++;
  } else {
    const hit = a.mustFail.filter((m) => r.failing.some((l) => l.includes(m)));
    const ok = r.fail > 0 && hit.length === a.mustFail.length;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, ${r.fail} total failing`);
    if (!ok) finding++;
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
