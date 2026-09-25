/* setup-signeradd.control.mjs — the NEGATIVE CONTROL for `test/setup-signeradd.test.mjs` (D-605: a signing key
 * registered from the setup page). NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/setup-signeradd.control.mjs            every arm
 *   node test/setup-signeradd.control.mjs <arm>      one arm
 *
 * `group-identity.control.mjs`'s method exactly: each arm copies `src/` and `checks/` (and the repo's `docprofile/`) into
 * a uniquely-named temporary tree, applies its patch THERE (asserting each anchor occurs EXACTLY ONCE — an arm that did
 * not arm is a finding, not a pass), and runs the suite with SETUP_SIGNERADD_SRC pointed at the copy. The real sources
 * are hashed (sha256 and byte length) before the first arm and after the last; the run fails if any moved. What each
 * arm MUST fail (by the assertion's label prefix) is DECLARED below before it arms; every other assertion MUST stay green.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "setup-signeradd.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/setup.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* Anchors, each a line of src/setup.mjs quoted verbatim. */
const KEY = "  const body = { keyB64: isLine ? t[1] : raw, memberId: String(who||\"\").trim().toLowerCase() };";
const LABEL = "  if (label) body.comment = label;";
const HANDLER = "  const r = await post(\"signeradd\", signerAddBody($(\"#k-key\").value, $(\"#k-who\").value));";
const SPLIT = "  const t = raw.split(/\\\\s+/).filter(function(x){ return x; });\n"
            + "  const isLine = t.length >= 2 && t[0] === \"ssh-ed25519\";";

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL — THE WHOLE LINE POSTED AGAIN as keyB64, the builder otherwise standing: every registration
     reads BAD_KEY, so the arms that register a pasted line (K3, K4, K5), the body arm (K2) and the roster (K7) fail BY
     NAME. K1 (the op refuses a whole line) and K6 (a non-line sent as pasted) stay green. */
  "whole-line": {
    patches: [["setup.mjs", KEY, "  const body = { keyB64: raw, memberId: String(who||\"\").trim().toLowerCase() };"]],
    mustFail: ["K2:", "K3:", "K4:", "K5:", "K7:"],
  },

  /* THE HANDLER BYPASSES THE BUILDER — the pre-D-605 call restored verbatim beside a correct builder. Only the
     structural pin can see it: no behavioural arm clicks a button. */
  "handler-bypasses": {
    patches: [["setup.mjs", HANDLER, "  const r = await post(\"signeradd\", { keyB64: $(\"#k-key\").value.trim(),\n"
                                   + "    memberId: $(\"#k-who\").value.trim().toLowerCase() });"]],
    mustFail: ["K0:"],
  },

  /* THE LABEL DROPPED: the key registers but the label is lost. K5 (no label) stays green. */
  "label-dropped": {
    patches: [["setup.mjs", LABEL, "  if (label && false) body.comment = label;"]],
    mustFail: ["K2:", "K3:", "K4:"],
  },

  /* OVER-STRICTNESS: the split in D-134's own spelling (civicos-ui/app.html custodialBody), which keeps a label's
     inner spacing. Nothing may fail. */
  "respelled": {
    patches: [["setup.mjs", SPLIT, "  const m = /^ssh-ed25519\\\\s+(\\\\S+)(?:\\\\s+(.+))?$/.exec(raw);\n"
                                 + "  const t = m ? [\"ssh-ed25519\", m[1]].concat(m[2] ? [m[2].trim()] : []) : [];\n"
                                 + "  const isLine = !!m;"]],
    mustFail: [],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `setup-signeradd-control-${name}-`));
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
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, SETUP_SIGNERADD_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /setup-signeradd: (\d+) passed, (\d+) failed/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.startsWith(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.startsWith(m)));
    const k3 = /K3:[^\n]*\n\s+want[^\n]*\n\s+got\s+([^\n]*)/.exec(out);
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             k3: k3 ? k3[1] : null, asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 };
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
    + (r.k3 ? `\n      K3 got ${r.k3}` : "")
    + (r.missing.length ? `\n      declared to fail but passed: ${JSON.stringify(r.missing)}` : "")
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected)}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]);
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-1)[0]} ${after[i]}`).join(" · ")} — untouched: ${untouched ? "YES" : "NO"}`);
if (!untouched) bad++;
process.exit(bad ? 1 : 0);
