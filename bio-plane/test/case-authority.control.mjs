/* case-authority.control.mjs — the NEGATIVE CONTROL for `test/case-authority.test.mjs`
 * (REC-137 / IC-154 / C-57). NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/case-authority.control.mjs            every arm
 *   node test/case-authority.control.mjs <arm>      one arm
 *
 * HOW IT ARMS, and why it never edits a real source (`project-authority.control.mjs`'s
 * method, kept). Each arm copies `src/` and `checks/` into a uniquely-named temporary
 * tree, applies its patches there (asserting each anchor occurs EXACTLY ONCE — an arm
 * that did not arm is a finding, not a pass), and runs the suite with CASE_AUTHORITY_SRC
 * pointed at the copy. The real `src/index.mjs` and `src/store.mjs` are hashed before
 * the first arm and after the last, and the run fails loudly if either moved.
 *
 * EACH ARM BREAKS ONE THING. DECLARED BEFORE ARMING — what MUST fail (by label
 * fragment); every other assertion MUST stay green.
 *
 * RESULTS: see the header of `test/case-authority.test.mjs` and IC-154.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "case-authority.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* REC-140 (2026-09-18): the two REC-137 questions MOVED into `#caseAuthority`, which
   `op=ratify` asks too, so the anchors are the helper's. `DELIVERY` is the helper's
   delivery question; `DELIVERY_AT_CASERATIFY` is the same question spelled at
   `ratifyCaseDocument`'s scope, used only by the arm that re-inserts it BELOW the retry. */
const DELIVERY = "    if (project && deliveredBy !== \"founder\") {\n"
  + "      const denied = this.#projectAuthority(project, deliveredBy, \"joined\", act);\n"
  + "      if (denied) return denied;\n    }\n";
const DELIVERY_AT_CASERATIFY = "      if (project && deliveredBy !== \"founder\") {\n"
  + "        const denied = this.#projectAuthority(project, deliveredBy, \"joined\", \"caseratify\");\n"
  + "        if (denied) return denied;\n      }\n";

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE BRIEF'S CONTROL 1: the owner-signer check dropped. A non-owner's signature commits. */
  "no-owner-signer": {
    patches: [["store.mjs", "    if (!project || !this.#isProjectOwner(project, signer))",
               "    if (!project)"]],
    mustFail: ["NON-OWNERS:"],
  },

  /* THE BRIEF'S CONTROL 2: the delivery check dropped. The outside administrator commits A
     with iris's valid signature; the invited-not-joined arm then meets an already-ratified
     edition carrying the same bytes (a retry), and the outside retry answers `existed`. */
  "no-delivery-check": {
    patches: [["store.mjs", DELIVERY, "    /* armed: the delivery check removed */\n"]],
    mustFail: ["OUTSIDE ADMINISTRATOR:", "INVITED, NOT JOINED:", "RETRY: ruth re-sends"],
  },

  /* THE LIAR THE ROW NAMES: every administrator refused as a deliverer, the founder included.
     The refusal is still built by the REAL `#projectAuthority` (asked of a member who holds no
     position), so its code and translation are unchanged and only the liar's behaviour moves.
     The refusal arms stay green; the FOUNDER's and the joined administrator's deliveries must go
     red — and so does the founder-delivers-a-non-owner arm, whose answer becomes the delivery
     refusal instead of the signer refusal. */
  "refuse-every-admin": {
    patches: [["store.mjs", DELIVERY,
               "    if (project) {\n"
               + "      const liarWho = deliveredBy === \"founder\" ? \"admin\" : String(deliveredBy ?? \"\").replace(/^member:/, \"\");\n"
               + "      const denied = this.#projectAuthority(project, this.#isAdminMember(liarWho) ? \"member:__nobody__\" : deliveredBy, \"joined\", act);\n"
               + "      if (denied) return denied;\n    }\n"]],
    mustFail: ["ALLOWED: the FOUNDER delivers", "ALLOWED (founder):", "ALLOWED: ruth, an enrolled administrator JOINED",
               "ALLOWED (joined administrator):", "NON-OWNERS: the FOUNDER delivering ruth's signature"],
  },

  /* The delivery check moved BELOW the idempotent retry: an outside administrator re-sending a
     committed signature is answered `existed: true`. Only the retry arm may go red. */
  "delivery-after-retry": {
    patches: [["store.mjs", DELIVERY, "    /* armed: the delivery check moved below the retry */\n"],
              ["store.mjs", "      const now = new Date().toISOString();\n      /* CASE-2's INVARIANT, UNCHANGED AND NOW ASKED ONCE.",
               DELIVERY_AT_CASERATIFY + "      const now = new Date().toISOString();\n      /* CASE-2's INVARIANT, UNCHANGED AND NOW ASKED ONCE."]],
    mustFail: ["RETRY: ruth re-sends"],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `case-authority-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, "bio-plane", "src", file);
      const s = readFileSync(p, "utf8");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.replace(from, to));
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, CASE_AUTHORITY_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /case-authority: (\d+) pass, (\d+) fail/.exec(out);
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
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected)}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]);
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-1)[0]} ${after[i]}`).join(" · ")} — untouched: ${untouched ? "YES" : "NO"}`);
if (!untouched) bad++;
process.exit(bad ? 1 : 0);
