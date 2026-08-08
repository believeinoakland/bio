/* REC-72's NEGATIVE-CONTROL HARNESS. Run it: `node bio-plane/test/nc-rec72.mjs`
 *
 * SIX ARMS PLUS A BASELINE, each broken ALONE with the other five held open,
 * each DECLARED before it is armed, each restored and the restore VERIFIED by
 * sha256 AND by `cmp` against a per-arm pristine copy that is named for its arm
 * so two arms can never share one backup.
 *
 * WHY THERE IS A BASELINE ROW, and it is not decoration: a harness whose first
 * run reported the same thing for every arm INCLUDING the baseline is one of
 * this week's receipts, and only the baseline row distinguished six-arms-broken
 * from six-arms-working. Arm 0 edits nothing and must be GREEN.
 *
 * WHY EACH ARM REFUSES TO ARM BLIND: an anchor that does not occur EXACTLY ONCE
 * is a planter scoring a delta against nothing. The harness throws by name
 * rather than reporting a meaningless zero (REC-54/REC-55's precedent, and
 * D-216's harness did the same on a twice-occurring anchor). REC-72's two
 * predicates are now BYTE-IDENTICAL lines in two methods, which is exactly the
 * trap: every anchor here carries the following lines that tell them apart.
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const P = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const STORE = P("../src/store.mjs");
const AFF = P("../src/affordances.mjs");
const SUITE = P("./citeproject-inquiry.test.mjs");
const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");

/* THE SIX ARMS, DECLARED HERE BEFORE ANY OF THEM IS ARMED. `mustFail` is what
   the arm claims will break; `mustNotFail` is the over-strictness half — what
   must STILL pass, so an arm that simply destroys the suite is not mistaken for
   an arm that proves something. */
const ARMS = [
  { id: "0-BASELINE", file: null,
    declared: "nothing is edited. The suite must be GREEN, or every row below is measuring a "
            + "broken tree rather than a broken subject." },
  { id: "a-cite-case-arm", file: STORE,
    declared: "put `cite`'s CASE arm back to Information-only. THE RULING ARM: the whole item is "
            + "downstream of this one predicate, so most of the suite must fail and the FIRST "
            + "failure must be the act itself.",
    from: `      if (!(ty === "information" || ty === "inquiry")) offenders.push(id);
    }
    if (offenders.length)
      return ontoInquiry`,
    to: `      if (ontoInquiry ? !(ty === "information" || ty === "inquiry") : ty !== "information") offenders.push(id);
    }
    if (offenders.length)
      return ontoInquiry` },
  { id: "b-sever-mirror", file: STORE,
    declared: "put `#edgeTransition`'s member test back to Information-only, leaving `cite` widened. "
            + "THE ASYMMETRY ARM: a case could then JOIN a question and never LEAVE it, which is "
            + "the shape this item exists to prevent, so the WITHDRAWAL arms must fail and the "
            + "citing arms must not.",
    from: `      if (!(ty === "information" || ty === "inquiry")) offenders.push(id);
    }
    if (offenders.length)
      return { ok: false, reason: "NOT_INFORMATION", project, handle, offenders: offenders.sort(),`,
    to: `      if (!(ty === "information")) offenders.push(id);
    }
    if (offenders.length)
      return { ok: false, reason: "NOT_INFORMATION", project, handle, offenders: offenders.sort(),` },
  { id: "c-over-strict", file: STORE,
    declared: "widen `cite`'s member test to admit ANY type. THE OVER-STRICTNESS ARM, and it is the "
            + "one that proves the widening is EXACTLY ONE TYPE WIDE rather than simply open: the "
            + "action, the case-cites-case and the case-cites-itself arms must fail.",
    from: `      if (!(ty === "information" || ty === "inquiry")) offenders.push(id);
    }
    if (offenders.length)
      return ontoInquiry`,
    to: `      if (false && ty === null) offenders.push(id);
    }
    if (offenders.length)
      return ontoInquiry` },
  { id: "d-dec8-fact", file: AFF,
    declared: "derive `sever`/`reinstate` from `cites_in` again instead of `cited_by_case`. The "
            + "DEC-8 arm must fail: an Information cited only by a QUESTION would publish an act "
            + "`op=sever` refuses.",
    from: `    applies: (f, ty) => ((ty === "information" || ty === "inquiry") && (f.cited_by_case?.confirmed ?? 0) > 0)`,
    to: `    applies: (f, ty) => ((ty === "information" || ty === "inquiry") && f.cites_in.confirmed.length > 0)` },
  { id: "e-published-types", file: AFF,
    declared: "drop `inquiry` from `sever`/`reinstate`'s published types. The op would still work; "
            + "the PUBLICATION arms must fail, because an act no surface is told about is an act "
            + "no member can be offered.",
    from: `    types: ["information", "inquiry", "project"],`,
    to: `    types: ["information", "project"],`, all: true },
  { id: "f-readback", file: STORE,
    declared: "make `op=backlinks` report every edge as `confirmed`. THE READ-BACK ARM: the "
            + "withdrawal is asserted RECORDED through a different op from the one that wrote it, "
            + "so blinding that op must fail those arms and only those.",
    from: `                 status: status ?? "confirmed", note });`,
    to: `                 status: "confirmed", note });` },
];

const runSuite = () => {
  try {
    const out = execFileSync(process.execPath, [SUITE], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { out, code: 0 };
  } catch (e) { return { out: `${e.stdout ?? ""}${e.stderr ?? ""}`, code: e.status ?? -1 }; }
};
const tally = (out) => {
  const mm = /cite-project-inquiry: (\d+) pass, (\d+) fail/.exec(out);
  /* A suite that never reached its own FOOT reports NO tally, and that is a
     different claim from "0 fail". Reported as `null`, never as zero — the
     D-233 rule one level down. */
  return mm ? { pass: +mm[1], fail: +mm[2] } : { pass: null, fail: null };
};
const firstFailures = (out, n) => out.split("\n").filter((l) => l.includes("FAIL  ")).slice(0, n)
  .map((l) => l.replace(/^\s*FAIL\s+/, "").slice(0, 96));

const rows = [];
for (const arm of ARMS) {
  console.log(`\n=== ARM ${arm.id} ===\n  DECLARED: ${arm.declared}`);
  let before = null, backup = null;
  if (arm.file) {
    backup = `${arm.file}.pristine.${arm.id}`;
    copyFileSync(arm.file, backup);
    before = sha(arm.file);
    const src = readFileSync(arm.file, "utf8");
    const hits = src.split(arm.from).length - 1;
    if (arm.all ? hits < 2 : hits !== 1)
      throw new Error(`ARM ${arm.id} REFUSED TO ARM: its anchor occurs ${hits} time(s) in `
        + `${arm.file}, so this arm would score a delta against nothing.`);
    const armed = arm.all ? src.split(arm.from).join(arm.to) : src.replace(arm.from, arm.to);
    writeFileSync(arm.file, armed);
    if (sha(arm.file) === before) throw new Error(`ARM ${arm.id} NEVER ARMED: the file did not change.`);
    console.log(`  ARMED: ${hits} site(s) edited in ${arm.file.split("/").pop()}`);
  }

  const { out, code } = runSuite();
  const { pass, fail } = tally(out);
  console.log(`  ACTUAL: exit ${code} · ${pass === null ? "NO TALLY (the suite did not reach its own foot)" : `${pass} pass, ${fail} fail`}`);
  for (const f of firstFailures(out, 4)) console.log(`     first failures: ${f}`);
  rows.push({ arm: arm.id, code, pass, fail, failed: firstFailures(out, 3) });

  if (arm.file) {
    copyFileSync(backup, arm.file);
    const after = sha(arm.file);
    let cmpOk = true;
    try { execFileSync("cmp", ["-s", arm.file, backup]); } catch { cmpOk = false; }
    console.log(`  RESTORED: sha256 ${after === before ? "IDENTICAL" : "*** DIFFERS ***"} · `
      + `cmp ${cmpOk ? "identical" : "*** DIFFERS ***"}`);
    if (after !== before || !cmpOk) throw new Error(`ARM ${arm.id}: restore FAILED. Stopping.`);
    unlinkSync(backup);
  }
}

console.log("\n=== SUMMARY ===");
for (const r of rows)
  console.log(`  ${r.arm.padEnd(20)} exit ${String(r.code).padStart(2)} · `
    + `${r.pass === null ? "NO TALLY" : `${r.pass} pass / ${r.fail} fail`}`);
