/* NEGATIVE CONTROL for `test/project-join-request.test.mjs` (REC-150 / C-95 / IC-320). Deliberately NOT a
 * `.test.mjs`: it edits COPIES of the sources while it runs and the battery must not discover it.
 *
 * REC-149's driver's shape (`project-discoverable.control.mjs`), reused: each arm copies `src/` and `checks/` into
 * a temporary tree, applies its patch there (asserting each anchor occurs EXACTLY ONCE — an arm that did not arm is
 * a finding, never a pass), runs the suite against the copy, and compares what failed with what the arm DECLARED
 * before arming: `mustFail` fragments must each match a FAIL line, `mayFail` are declared consequences, anything
 * else that fails is UNDECLARED and the arm is NOT AS DECLARED. The real sources are hashed before and after.
 *
 * Run from `bio-plane/`: `node test/project-join-request.control.mjs [arm]`. */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "project-join-request.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/schema.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const ARMS = {
  baseline: { patches: [], mustFail: [], mayFail: [] },

  /* THE ROW'S OWN NEGATIVE CONTROL — "let a grant write `joined`, and the invited-not-joined arm fails". The grant's
     participation row is written `joined` instead of `invited`; NOTHING ELSE moves, the act's own RETURN included
     (it still says `participation: "invited"`). DECLARED: §3c, the read-back through op=projectparticipants, MUST
     fail by name. §3b MUST NOT — it reads the act's return, which is exactly the claim a liar keeps; that it stays
     green is the reason §3c reads the record rather than the answer. §3c'' (P leaves the directory) and §3d (the
     join) stay green too: a joined member also has FULL sight, and projectJoin is idempotent. */
  "grant-writes-joined": {
    patches: [["store.mjs", "         VALUES (?,?,'invited',0,?,?,?)`, projectId, target.member_id, by, at, at);",
               "         VALUES (?,?,'joined',0,?,?,?)`, projectId, target.member_id, by, at, at);"]],
    mustFail: ["3c: THE ROW'S ACCEPTANCE"],
    mayFail: [],
  },

  /* AN ADMINISTRATOR ANSWERS — sight of every project read as authority over one (the row's third acceptance
     clause). The owner fence also admits an administrator and the founder. DECLARED: §3a (ruth's grant now
     succeeds) and §3a' (vera is then a participant) MUST fail. Consequences, declared: §3b (iris then finds no
     open request to grant) and §3c' (the answering owner reads ruth, with no comment). */
  "admin-answers": {
    patches: [["store.mjs", "    if (!this.#isProjectOwner(projectId, by))\n      return refusal(\"PROJECT_REQUEST_ANSWER_NOT_THE_OWNER\"",
               "    if (!this.#isProjectOwner(projectId, by) && !this.#isAdminMember(by))\n      return refusal(\"PROJECT_REQUEST_ANSWER_NOT_THE_OWNER\""]],
    mustFail: ["3a: AN ADMINISTRATOR", "3a':"],
    mayFail: ["3b:", "3c':"],
  },

  /* THE LAPSE FORGOTTEN — hiding a project leaves its open requests open. DECLARED: §5a (nothing lapsed), §5b (pam's
     request still reads open) and §5e (the owner's view shows no lapse) MUST fail. Consequences, declared: §5b' (the
     states list), §5f (the directory shows `open` again once P is discoverable), §5g (her next ask meets her own
     still-open request, C-95.3) and §8's counts, which rest on §5g's request existing. §5d MUST NOT fail: every act
     at a hidden project answers through SIGHT, which the lapse never touches. */
  "lapse-dropped": {
    patches: [["store.mjs", "      ? this.#lapseJoinRequests(projectId, by, at) : 0;", "      ? 0 : 0;"]],
    mustFail: ["5a:", "5b: A LAPSED", "5e:"],
    mayFail: ["5b':", "5f:", "5g:", "5h:", "8a:", "8b:", "8c:", "8d:"],
  },

  /* THE ABSENT ANSWER REPLACED BY A FALSE ONE — the ask's NONE branch answers C-95.2 ("you can already see this
     project") instead of `#noSuchProject`. DECLARED BEFORE ARMING: §1c' (the answer at a hidden id must BE the absent
     one) MUST fail. §1c, §1d and §5d's ask row MUST NOT: they compare a hidden id with a never-minted one, and under
     this arm BOTH take the NONE branch and answer the same wrong thing, so the pair still agrees. That is the arm's
     finding about the instrument, recorded rather than smoothed: a byte comparison between two ids proves they are
     INDISTINGUISHABLE, never that the answer is TRUE — which is why §1c' exists beside §1c. */
  "hidden-answered-positionally": {
    patches: [["store.mjs", "    if (sight === Store.SIGHT_NONE) return Store.#noSuchProject(projectId);\n    if (sight === Store.SIGHT_FULL)",
               "    if (sight === Store.SIGHT_NONE) return refusal(\"PROJECT_REQUEST_NOT_OUTSIDE\", \"leak\");\n    if (sight === Store.SIGHT_FULL)"]],
    mustFail: ["1c':"],
    mayFail: [],
  },

  /* OVER-STRICTNESS: the one-open-request test in a spelling the suite did not anticipate (a direct statement with
     its predicates reordered, in place of `#openJoinRequest`). Correct work in another form — nothing may fail. */
  "one-open-respelled": {
    patches: [["store.mjs", "    const open = this.#openJoinRequest(projectId, me.member_id);\n    if (open)",
               "    const open = this.#one(`SELECT seq, asked_at FROM project_join_requests WHERE state='open' AND member_id=? AND project_id=?`, me.member_id, projectId);\n    if (open)"]],
    mustFail: [], mayFail: [],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `project-join-request-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    cpSync(join(REPO, "jurisdictions"), join(tree, "jurisdictions"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, "bio-plane", "src", file);
      const s = readFileSync(p, "utf8");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.replace(from, () => to));
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, PROJECT_JOIN_REQUEST_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /project-join-request\.test\.mjs: (\d+) pass, (\d+) fail/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.includes(m)));
    const unexpected = failed.filter((f) => ![...arm.mustFail, ...arm.mayFail].some((m) => f.includes(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             asDeclared: !!tally && missing.length === 0 && unexpected.length === 0
                         && (arm.mustFail.length > 0 || failed.length === 0) };
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
