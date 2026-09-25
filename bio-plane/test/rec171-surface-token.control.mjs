/* rec171-surface-token.control.mjs — the NEGATIVE CONTROL for `test/rec171-surface-token.test.mjs`
 * (REC-171, INVESTIGATIVE-SESSION.md §11 item 5, "Rule 2's reach", BOB #30).
 *
 * Deliberately NOT a `.test.mjs`: it patches COPIES of `src/` while it runs, and the battery must not discover it.
 * Run from `bio-plane/`: `node test/rec171-surface-token.control.mjs [arm]`. D-85's driver's shape: every arm patches a
 * COPY of `src/` and `checks/` in a fresh temporary tree, asserting its anchor occurs EXACTLY ONCE (or the arm reports
 * it did not arm), runs the suite against the copy, and compares the failing arms with what was DECLARED before
 * arming — missing and unexpected failures are both printed. The real sources are hashed (byte count and sha256)
 * before and after; nothing real is ever edited. Each arm breaks ONE thing.
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
const SUITE = join(PLANE, "test", "rec171-surface-token.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/airun.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* THE SUBJECT: the stamp's condition in `op=promote`'s stamp block, one anchor. */
const STAMP = "        if (!viaSession)\n"
  + "          b.assistantPrincipal = cls === \"ai\" ? `${aiCred.principal}/${aiCred.tokenId}` : `${MACHINE_CLASS_PREFIX}${cls}`;\n";
const stampWhen = (cond) => STAMP.replace("if (!viaSession)", `if (${cond})`);
/* D-78's restamp, for the arm that "fixes" the rule the refused way. */
const RESTAMP = "            const want = viaSession ? \"human\" : \"agent\";\n";

const DEPLOY = (K) => [`ARM ${K}1 `, `ARM ${K}2 `, `ARM ${K}2b `, `ARM ${K}3 `, `ARM ${K}3b `, `ARM ${K}4 `];
const ALL_DEPLOY = [...DEPLOY("ADMIN"), ...DEPLOY("MEMBER"), ...DEPLOY("PROBE")];
/* ARM H2 reads the ADMIN run's bound as [3, 1] — spent by ARM ADMIN3. Any arm under which ADMIN3 does not land
   inside its run takes H2 down with it: that is the missing landing read from the member's arm, not a second cause. */
const H2 = "ARM H2:";

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL: restore D-85's `cls === "ai"` condition. Every deploy-token arm fails BY ITS CLASS's NAME —
     the refusals land, the landings carry no run. 3c must NOT fail (the bytes still say agent: D-78 is untouched),
     and neither may the member's session arms. */
  "ai-only": { patches: [["index.mjs", STAMP, stampWhen("!viaSession && cls === \"ai\"")]], mustFail: [...ALL_DEPLOY, H2] },

  /* A FENCE THAT FORGETS ONE CLASS, three arms: each must take down that class's arms and no other's. */
  "forget-admin":  { patches: [["index.mjs", STAMP, stampWhen("!viaSession && cls !== \"admin\"")]],  mustFail: [...DEPLOY("ADMIN"), H2] },
  "forget-member": { patches: [["index.mjs", STAMP, stampWhen("!viaSession && cls !== \"member\"")]], mustFail: DEPLOY("MEMBER") },
  "forget-probe":  { patches: [["index.mjs", STAMP, stampWhen("!viaSession && cls !== \"probe\"")]],  mustFail: DEPLOY("PROBE") },

  /* THE LIAR: the fence keyed on the LABEL the caller wrote instead of the credential. A deploy token writing
     `surfaced_by: human` escapes the run check — ARM <C>2 of every class must fail BY NAME. <C>3 writes `human` too,
     so under the liar it also lands UNSTAMPED — outside the run it named, no row, no bound spent — and fails with
     3b and H2; <C>1 and <C>4 write `agent` and must stay green. */
  "gate-by-claimed-label": {
    patches: [["index.mjs", STAMP,
      stampWhen("!viaSession && !JSON.stringify(b.files ?? []).includes(\"surfaced_by: human\")")]],
    mustFail: ["ARM ADMIN2 ", "ARM ADMIN2b ", "ARM MEMBER2 ", "ARM MEMBER2b ", "ARM PROBE2 ", "ARM PROBE2b ",
               "ARM ADMIN3 ", "ARM ADMIN3b ", "ARM MEMBER3 ", "ARM MEMBER3b ", "ARM PROBE3 ", "ARM PROBE3b ", H2],
  },

  /* THE REFUSED ALTERNATIVE: D-78 restamps a deploy token's creation `human` (inventing a person) — the rule is then
     kept for `ai` alone, which is the only way that "fix" reads coherently. Every deploy arm fails, and 3c by name. */
  "restamp-human": {
    patches: [["index.mjs", STAMP, stampWhen("!viaSession && cls === \"ai\"")],
              ["index.mjs", RESTAMP, "            const want = viaSession || cls !== \"ai\" ? \"human\" : \"agent\";\n"]],
    mustFail: [...ALL_DEPLOY, "ARM ADMIN3c ", "ARM MEMBER3c ", "ARM PROBE3c ", H2],
  },

  /* THE STAMP IN THE WRONG FORM for a deploy token (the `author` prefix `token:` instead of the run verbs'
     `class:`): the run's principal and the caller stop being one, so every landing is refused NOT_PRINCIPAL. */
  "wrong-prefix": {
    patches: [["index.mjs", STAMP, STAMP.replace("`${MACHINE_CLASS_PREFIX}${cls}`", "`${MACHINE_AUTHOR_PREFIX}${cls}`")]],
    mustFail: ["ARM ADMIN3 ", "ARM ADMIN3b ", "ARM ADMIN3c ", "ARM MEMBER3 ", "ARM MEMBER3b ", "ARM MEMBER3c ",
               "ARM PROBE3 ", "ARM PROBE3b ", "ARM PROBE3c ", H2],
  },

  /* OVER-STRICTNESS: the same rule in a spelling the suite did not anticipate — an explicit list of every class that
     can reach this line. Nothing may fail. */
  "listed-classes": {
    patches: [["index.mjs", STAMP,
      stampWhen("!viaSession && [\"ai\", \"admin\", \"member\", \"probe\", \"daemon\"].includes(cls)")]],
    mustFail: [],
  },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read); each arm patches a copy of src/. */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.patches.map(([file, find, put]) => ({ arm, file: join(PLANE, "src", file), find, put }))));

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `rec171-${name}-`));
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
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, REC171_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /rec171-surface-token: (\d+) pass, (\d+) fail/.exec(out);
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
