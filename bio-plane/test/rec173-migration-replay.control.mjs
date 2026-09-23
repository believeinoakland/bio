/* rec173-migration-replay.control.mjs — the NEGATIVE CONTROL for `test/rec173-migration-replay.test.mjs`
 * (REC-173, INVESTIGATIVE-SESSION.md §11 item 5, "A MIGRATION IS A REPLAY, NOT A SURFACING", BOB #30).
 *
 * Deliberately NOT a `.test.mjs`: it patches COPIES of `src/` while it runs, and the battery must not discover it.
 * Run from `bio-plane/`: `node test/rec173-migration-replay.control.mjs [arm]`. REC-171's driver's shape: every arm
 * patches a COPY of `src/` and `checks/` in a fresh temporary tree, asserting its anchor occurs EXACTLY ONCE (or the arm
 * reports it did not arm), runs the suite against the copy, and compares the failing arms with what was DECLARED before
 * arming — missing and unexpected failures are both printed. The real sources are hashed (byte count and sha256) before
 * and after; nothing real is ever edited. Each arm breaks ONE thing.
 *
 * RESULTS: recorded on the suite's `NEGATIVE CONTROL:` line.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "rec173-migration-replay.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/schema.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* THE SUBJECTS, each one anchor in `index.mjs`'s `migrationReplayOf` or `op=promote`'s stamp block. */
const SHA_CHECK = '    && p.record.files.some((f) => f && f.name === "bundle.md" && f.sha256 === mdSha));\n';
const BUNDLE_CHECK = "    && p.record.target === b.bundleId\n";
const ADMIN_CHECK = '(!viaSession && cls === "admin" && b.base === null';
const REGISTER_CHECK = "  if (!registered) return null;\n";
const COMPUTED_SHA = "  const mdSha = createSha256().update(new TextEncoder().encode(bm.text)).hex();\n"
  + "  if (bm.sha256 !== mdSha) return null;\n";
const NO_RESTAMP = "        if (b.base === null && b.meta && !replayed ";
const NO_GATE = "        if (replayed) delete b.assistantPrincipal;\n";
const STAMP_DELETE = "        delete b.migrationReplay;\n";
const MATCH = '  const match = records.find((p) => p && p.record && typeof p.record === "object"\n';

const R = ["ARM R1 ", "ARM R1b ", "ARM R1c ", "ARM R1d ", "ARM R2 "];
const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL: drop the SHA-256 check. The arm replaying ALTERED bytes (N3) must fail BY NAME; the altered
     replay is then admitted as a replay, so N0 counts one row too many, and N7's failed replay lands as a replay
     instead of inside its run. N3b must NOT fail: the computed-sha guard still refuses a lying `sha256` field. */
  "no-sha": { patches: [["index.mjs", SHA_CHECK, '    && p.record.files.some((f) => f && f.name === "bundle.md"));\n']],
              mustFail: ["ARM N3 ", "ARM N0:", "ARM N7 "] },
  /* THE BUNDLE CHECK: another bundle's capture listing these very bytes is admitted. */
  "no-bundle": { patches: [["index.mjs", BUNDLE_CHECK, ""]], mustFail: ["ARM N2 ", "ARM N0:"] },
  /* THE LIAR WITH THE WRONG CREDENTIAL: any deploy class is admitted, not the admin alone. */
  "any-class": { patches: [["index.mjs", ADMIN_CHECK, "(!viaSession && b.base === null"]],
                 mustFail: ["ARM N4 ", "ARM N4b ", "ARM N0:"] },
  /* THE CALLER-MADE CAPTURE: a held capture that is not registered as the Drive provenance is admitted. */
  "no-register": { patches: [["index.mjs", REGISTER_CHECK, ""]], mustFail: ["ARM N5b ", "ARM N5c ", "ARM N0:"] },
  /* THE STALE SHA: the caller's `sha256` field is trusted instead of the text's own hash. */
  "trust-caller-sha": { patches: [["index.mjs", COMPUTED_SHA, "  const mdSha = bm.sha256;\n"]],
                        mustFail: ["ARM N3b ", "ARM N0:"] },
  /* (b) BROKEN: D-78 restamps the verified replay — its Drive-era `surfaced_by: human` is rewritten `agent`. */
  "restamp-replay": { patches: [["index.mjs", NO_RESTAMP, "        if (b.base === null && b.meta "]], mustFail: ["ARM R1b "] },
  /* (a) BROKEN: the replay is still stamped for rule 2 — every replay is refused SURFACE_NO_RUN. */
  "gate-replay": { patches: [["index.mjs", NO_GATE, ""]], mustFail: R },
  /* THE FORGED STAMP: the server's `migrationReplay` is not deleted first, so a session's own copy is recorded. */
  "trust-caller-stamp": { patches: [["index.mjs", STAMP_DELETE, ""]], mustFail: ["ARM N6 "] },
  /* A FENCE TIGHTER THAN THE RULE: only the FIRST preserved record is asked — the truncated history's matching second
     record is refused. */
  "first-record-only": { patches: [["index.mjs", MATCH,
    '  const match = records.slice(0, 1).find((p) => p && p.record && typeof p.record === "object"\n']], mustFail: ["ARM R2 "] },
  /* OVER-STRICTNESS: the same rule in a spelling the suite did not anticipate — the records searched last-first.
     Nothing may fail. */
  "reversed-search": { patches: [["index.mjs", MATCH,
    '  const match = [...records].reverse().find((p) => p && p.record && typeof p.record === "object"\n']], mustFail: [] },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `rec173-${name}-`));
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
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, REC173_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /rec173-migration-replay: (\d+) pass, (\d+) fail/.exec(out);
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
