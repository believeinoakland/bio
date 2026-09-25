/* group-identity.control.mjs — the NEGATIVE CONTROL for `test/group-identity.test.mjs` (REC-164: the group's display
 * name and its verified domain, `BIO_Publication_v0_1.md` §7 points 2 and 3). NOT a `.test.mjs`: the battery must not
 * discover it.
 *
 *   node test/group-identity.control.mjs            every arm
 *   node test/group-identity.control.mjs <arm>      one arm
 *
 * `group-public.control.mjs`'s method exactly: each arm copies `src/` and `checks/` (and the repo's `docprofile/`) into
 * a uniquely-named temporary tree, applies its patch THERE (asserting each anchor occurs EXACTLY ONCE — an arm that did
 * not arm is a finding, not a pass), and runs the suite with GROUP_IDENTITY_SRC pointed at the copy. The real
 * `src/index.mjs`, `src/store.mjs`, `src/schema.mjs` and `checks/bio-checks.mjs` are hashed (sha256 and byte length)
 * before the first arm and after the last; the run fails if any moved. What each arm MUST fail (by the assertion's
 * label prefix) is DECLARED below before it arms; every other assertion MUST stay green.
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
const SUITE = join(PLANE, "test", "group-identity.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/schema.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* Anchors, each a line of the subject quoted verbatim. */
const GATE = "    const verified = !!(slug && dom && last && last.verdict === \"verified\");";
const TICK = "        tick: ()    => this.#groupDomainTick() },";
const FENCE = "    if (IDENTITY_ACTIONS.includes(op) && !viaSession)";
const STAMP = "      inner.searchParams.set(\"by\", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);\n"
            + "      inner.searchParams.set(\"origin\", url.origin);";
const ROSTER = "    if (!by || !this.#activeAdmins().includes(by))\n      return refusal(\"GROUP_IDENTITY_NOT_ADMIN\",";

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL — THE VERDICT GATE SKIPPED on the public read: a claimed domain is shown whatever its verdict.
     Declared to fail every arm in which a stranger must NOT see an unverified claim — absent (D1), undetermined (D2),
     another instance (D3), another group (D3b) — and the liar's L3, where the alarm's `mismatched` must take the
     domain down. Every verified arm stays green: the gate only ever REMOVES a domain. */
  "verdict-gate-skipped": {
    patches: [["store.mjs", GATE, "    const verified = !!(slug && dom);"]],
    mustFail: ["D1:", "D2:", "D3:", "D3b:", "L3:"],
  },

  /* THE LIAR THE ROW NAMES — VERIFIED ONCE AT SET TIME: the alarm consumer stays registered and re-checks nothing.
     Every set-time arm stays green; only the arms that change the file after `verified` can see it. */
  "set-time-only": {
    patches: [["store.mjs", TICK, "        tick: ()    => ({ groupdomain: null }) },"]],
    mustFail: ["L2:", "L3:", "L4:"],
  },

  /* THE BEARER FENCE DROPPED, the stamp and the roster left standing: a bearer reaches the store as `class:<cls>`,
     which is on no roster, so it is STILL refused — by C-64.5, not C-64.4. Every A1 fails at its code; A2b stays
     green, because nothing a bearer asked for lands: the fence supplies the sentence, the roster the refusal. */
  "fence-dropped": {
    patches: [["index.mjs", FENCE, "    if (IDENTITY_ACTIONS.includes(op) && !viaSession && false)"]],
    mustFail: ["A1:"],
  },

  /* THE STAMP HONOURS A CALLER'S `by`: cai names ruth and is let through; ruth names gus and the record names gus. */
  "stamp-dropped": {
    patches: [["index.mjs", STAMP, "      inner.searchParams.set(\"by\", inner.searchParams.get(\"by\") || (viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`));\n"
                                  + "      inner.searchParams.set(\"origin\", url.origin);"]],
    /* P1 CORRECTED after the first run, which read it NOT AS DECLARED: cai's forged domain claim LANDS in this arm and
       verifies, so the stranger's "no domain (none claimed)" read shows it. A finding about the declaration. */
    mustFail: ["A2:", "A2b:", "A3:", "A4:", "A5:", "D7:", "P1:"],
  },

  /* THE STAMP RECORDED AND NEVER READ: the store's roster check removed, the fence and stamp left standing. A bearer
     is still refused at the fence (A1 green); cai's own session now sets both values. */
  "roster-unread": {
    patches: [["store.mjs", ROSTER, "    if (!by)\n      return refusal(\"GROUP_IDENTITY_NOT_ADMIN\","]],
    /* A3 and P1 CORRECTED after the first run, which read them NOT AS DECLARED: cai's own set LANDS here, so the
       history ruth's act reads back starts with cai (A3), and cai's verified domain claim reaches the stranger (P1). */
    mustFail: ["A2:", "A2b:", "A3:", "A4:", "A5:", "D7:", "P1:"],
  },

  /* THE GATE TOO TIGHT — it never opens. The unverified arms stay green (nothing is ever shown); every arm that
     demands a VERIFIED domain be shown fails. The direction a fence tighter than its rule goes. */
  "gate-never-opens": {
    patches: [["store.mjs", GATE, "    const verified = false;"]],
    mustFail: ["D5:", "L1:", "L4:", "O1:"],
  },

  /* OVER-STRICTNESS OF THE SUITE: the same gate in a spelling it did not anticipate. Nothing may fail. */
  "gate-respelled": {
    patches: [["store.mjs", GATE, "    const verified = Boolean(slug) && Boolean(dom) && [\"verified\"].includes(last?.verdict);"]],
    mustFail: [],
  },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). The arms patch a COPY of src/. */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.patches.map(([file, find, put]) => ({ arm, file: join(PLANE, "src", file), find, put }))));

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `group-identity-control-${name}-`));
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
      writeFileSync(p, s.replace(from, () => to), "latin1");
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, GROUP_IDENTITY_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /group-identity: (\d+) passed, (\d+) failed/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.startsWith(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.startsWith(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 };
  } finally { rmSync(root, { recursive: true, force: true }); }
};

const wanted = process.argv[2];
const names = wanted ? [wanted] : Object.keys(ARMS);
if (wanted && !ARMS[wanted]) { console.error(`unknown arm ${wanted}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
let bad = 0;
for (const n of names) {
  const r = run(n);
  if (!r.armed) { console.log(`  ARM DID NOT ARM  ${n}: ${r.why}`); bad++; continue; }
  console.log(`  ${r.asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}  ${n}  pass/fail ${r.tally}`
    + (r.missing.length ? `\n      declared to fail but passed: ${JSON.stringify(r.missing)}` : "")
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected)}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]);
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-1)[0]} ${after[i]}`).join(" · ")} — untouched: ${untouched ? "YES" : "NO"}`);
if (!untouched) bad++;
process.exit(bad ? 1 : 0);
