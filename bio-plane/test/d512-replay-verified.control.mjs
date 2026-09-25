/* d512-replay-verified.control.mjs — the NEGATIVE CONTROL for `test/d512-replay-verified.test.mjs`
 * (D-512, INVESTIGATIVE-SESSION.md §11 item 5, "`replay` IS THE SERVER'S WORD, NEVER THE CALLER'S", BOB #33 step (2)).
 *
 * Deliberately NOT a `.test.mjs`: it patches COPIES of `src/` while it runs, and the battery must not discover it.
 * Run from `bio-plane/`: `node test/d512-replay-verified.control.mjs [arm]`. REC-173's driver's shape: every arm
 * patches a COPY of `src/` and `checks/` in a fresh temporary tree, asserting each anchor occurs EXACTLY ONCE (or the
 * arm reports it did not arm), runs the suite against the copy, and compares the failing arms with what was DECLARED
 * before arming — missing and unexpected failures are both printed. The real sources are hashed (byte count and
 * sha256) before and after; nothing real is ever edited. Each arm breaks ONE thing — where one thing is written in
 * two places (the verification's two halves; the class test's two sites) the arm patches both and says so.
 *
 * RESULTS: recorded on the suite's `NEGATIVE CONTROL:` line.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { anchorTable } from "../scripts/anchortable.mjs";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "d512-replay-verified.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* THE SUBJECTS, each an anchor in `index.mjs`'s `op=promote` stamp block or in `migrationReplayOf`. */
const REFUSE = "        if (replayAsserted && !proven)\n";
const HONOUR = "        if (proven) b.replay = true;\n";
const SHA_CHECK = '    && p.record.files.some((f) => f && f.name === "bundle.md" && f.sha256 === mdSha));\n';
const BUNDLE_CHECK = "    && p.record.target === b.bundleId\n";
const REGISTER_CHECK = "  if (!registered) return null;\n";
const CLASS_DELETE = '        if (viaSession || cls !== "admin") delete b.replay;\n';
const CLASS_ASK = '(!viaSession && cls === "admin" && (replayAsserted || creatingInquiry))';

const U = ["ARM U1 ", "ARM U2 ", "ARM U3 ", "ARM U4 ", "ARM U5 ", "ARM U6 ", "ARM U0 "];
const ARMS = {
  baseline: { patches: [], mustFail: [] },
  /* THE ROW'S CONTROL, in the QUEUE row's words: "skip the verification and the unverified arm is admitted, failing by
     name". The flag is honoured on the caller's word — its refusal removed and its honouring unconditioned, which is
     the verification's two halves. Every U arm is then ADMITTED as a replay (each carries the legacy queue a replay is
     exempt from), and the witness counts what they wrote. C1 must NOT fail (the class delete still runs first); V1
     and V2 must NOT fail (a verified replay is a replay either way). */
  "skip-verification": { patches: [["index.mjs", REFUSE, "        if (false)\n"],
                                   ["index.mjs", HONOUR, "        if (proven || replayAsserted) b.replay = true;\n"]],
                         mustFail: U },
  /* THE SHA CHECK alone: a record naming this bundle at ANY bytes verifies. U4 by name, and the witness. */
  "no-sha": { patches: [["index.mjs", SHA_CHECK, '    && p.record.files.some((f) => f && f.name === "bundle.md"));\n']],
              mustFail: ["ARM U4 ", "ARM U0 "] },
  /* THE BUNDLE CHECK alone: another bundle's capture listing these bytes verifies. U3 by name, and the witness. */
  "no-bundle": { patches: [["index.mjs", BUNDLE_CHECK, ""]], mustFail: ["ARM U3 ", "ARM U0 "] },
  /* THE REGISTRATION alone: a held capture this promotion does not register verifies. U6 by name, and the witness. */
  "no-register": { patches: [["index.mjs", REGISTER_CHECK, ""]], mustFail: ["ARM U6 ", "ARM U0 "] },
  /* THE SECOND CONDITION, the class test, dropped at BOTH its sites (D-511's delete, and the class asked before the
     verification): the member token carrying a valid capture is admitted as a replay. C1 by name, and nothing else. */
  "no-class": { patches: [["index.mjs", CLASS_DELETE, "        if (false) delete b.replay;\n"],
                          ["index.mjs", CLASS_ASK, "(!viaSession && (replayAsserted || creatingInquiry))"]],
                mustFail: ["ARM C1 "] },
  /* OVER-STRICTNESS, A FENCE TIGHTER THAN THE RULE: the verification asked of an inquiry's CREATION only — REC-173's
     scope before this item. Every replay here is refused, so the V arms fail by name; every U arm stays GREEN, the
     direction that would otherwise hide it. */
  "creation-only": { patches: [["index.mjs", CLASS_ASK, '(!viaSession && cls === "admin" && creatingInquiry)']],
                     mustFail: ["ARM V1 ", "ARM V2 "] },
  /* OVER-STRICTNESS, the same rule respelled: nothing may fail. */
  "respelled": { patches: [["index.mjs", REFUSE, "        if (!proven && replayAsserted === true)\n"]], mustFail: [] },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read); each arm patches a copy of src/. */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.patches.map(([file, find, put]) => ({ arm, file: join(PLANE, "src", file), find, put }))));

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d512-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, "bio-plane", "src", file);
      const s = readFileSync(p, "latin1");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.split(from).join(to), "latin1");
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, D512_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /d512-replay-verified: (\d+) pass, (\d+) fail/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.includes(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.includes(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 };
  } finally { rmSync(root, { recursive: true, force: true }); }
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm ${want}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
let bad = 0;
for (const n of names) {
  const r = run(n);
  if (!r.armed) { console.log(`  ARM DID NOT ARM  ${n}: ${r.why}`); bad++; continue; }
  console.log(`  ${r.asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}  ${n}  pass/fail ${r.tally}`
    + (r.missing.length ? `\n      declared to fail but passed: ${JSON.stringify(r.missing)}` : "")
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected.map((u) => u.slice(0, 60)))}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]);
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-1)[0]} ${after[i]}`).join(" · ")} — untouched: ${untouched ? "YES" : "NO"}`);
process.exit(bad || !untouched ? 1 : 0);
