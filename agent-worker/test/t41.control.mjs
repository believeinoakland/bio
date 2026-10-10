/* T41-31's NEGATIVE CONTROL DRIVER (K874) for `t41.test.mjs`: each arm breaks the source in one place the T41 rules
 * depend on, runs the suite, and requires it to FAIL, naming the requirement ids the failing lines carry.
 *
 *     node test/t41.control.mjs          # every arm, in order
 *     node test/t41.control.mjs 3        # one arm
 *
 * DELIBERATELY NOT A `.test.mjs`: it edits real sources while it runs (cascade.control.mjs' rules): snapshots are held
 * in memory and written back in a `finally`, every restore is verified by sha256, and the suite's exit status is read
 * from `spawnSync().status`. `git checkout` is never used.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const MEMBER = join(DIR, "..");
const SUITE = join(DIR, "t41.test.mjs");
const INDEX = join(MEMBER, "src/index.mjs");
const CASCADE = join(MEMBER, "src/cascade.mjs");
const sha = (b) => createHash("sha256").update(b).digest("hex");

const ARMS = [
  { name: "the project level holds no kind (a project's account refused)", file: CASCADE, ids: ["R32", "R71", "R6"],
    from: "project: ACCOUNT_KINDS, member: ACCOUNT_KINDS,", to: "project: Object.freeze([]), member: ACCOUNT_KINDS," },
  { name: "a project's sign-in handed on carrying its project", file: CASCADE, ids: ["R33", "R71"],
    from: `reference: account.kind === "signin" ? { kind: "signin", member: memberOf(account) }`,
    to: `reference: account.kind === "signin" ? { kind: "signin", member: memberOf(account), ...(account.project ? { project: account.project } : {}) }` },
  { name: "a project's account taken naming no project", file: CASCADE, ids: ["R32", "R71"],
    from: `if (account.level === "project" && !projectOf(account)) return LEVEL_UNSET;`, to: "" },
  { name: "the project left out of claude_account", file: INDEX, ids: ["R29", "R71"],
    from: `...(cascade.level === "project" ? { project: cascade.project } : {}) },`, to: "}," },
  { name: "the payer check skipped at the project level", file: INDEX, ids: ["R10", "R57", "R71"],
    from: "if (account && recordedPayer !== account.member)",
    to: `if (account && account.level !== "project" && recordedPayer !== account.member)` },
  { name: "a sign-in refused on an ask (a standing AI half refused for being a sign-in)", file: INDEX, ids: ["R57"],
    from: "async function accountOf(body) {",
    to: `async function accountOf(body) {\n  if (body.question && body.account?.kind === "signin") return { refusal: refusal("BAD_ACCOUNT", "x", 400) };` },
  { name: "a project carried at another level taken", file: INDEX, ids: ["R6", "R71"],
    from: ": a.project !== undefined)", to: ": false)" },
  { name: "the payer compared against principal.claude (who pays) instead of principal.ref (whose act)", file: INDEX,
    ids: ["R10", "R57"], from: "const recordedPayer = session.principal?.ref ?? null;",
    to: "const recordedPayer = session.principal?.claude ?? null;" },
  { name: "a tick answered `found: false` (no such run) counted as landed (T41 B6)", file: INDEX, ids: ["R26"],
    from: "const noRun = !tickAnswer.refused && tickAnswer.result?.found === false;", to: "const noRun = false;" },
];

const pick = process.argv[2] ? [Number(process.argv[2])] : ARMS.map((_, i) => i + 1);
let bad = 0;
for (const n of pick) {
  const arm = ARMS[n - 1];
  const before = readFileSync(arm.file, "utf8");
  const hash = sha(before);
  if (before.split(arm.from).length !== 2) { console.log(`  ARM ${n} NOT ARMED: its anchor is not in the source once`); bad++; continue; }
  let out = "", status = null;
  try {
    writeFileSync(arm.file, before.replace(arm.from, arm.to));
    const r = spawnSync("node", [SUITE], { cwd: MEMBER, encoding: "utf8" });
    out = (r.stdout || "") + (r.stderr || ""); status = r.status;
  } finally {
    writeFileSync(arm.file, before);
    if (sha(readFileSync(arm.file, "utf8")) !== hash) { console.log(`  RESTORE FAILED for ${arm.file}`); process.exit(2); }
  }
  const failing = out.split("\n").filter((l) => l.startsWith("  FAIL"));
  const named = arm.ids.filter((id) => failing.some((l) => new RegExp(`\\b${id}\\b`).test(l)));
  const ok = status !== 0 && failing.length > 0 && named.length === arm.ids.length;
  console.log(`  ${ok ? "PASS" : "FAIL"}  arm ${n} (${arm.name}): the suite fails ${failing.length} line(s), naming ${named.join(", ") || "none"}`
    + (ok ? "" : ` (want every one of ${arm.ids.join(", ")})`));
  if (!ok) bad++;
}
console.log(`\nt41 control: ${pick.length - bad} pass, ${bad} fail`);
process.exit(bad ? 1 : 0);
