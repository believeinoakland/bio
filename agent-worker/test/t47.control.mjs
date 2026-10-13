/* T47-24 and T47-80's NEGATIVE CONTROL DRIVER (K874) for `t47.test.mjs`: each arm breaks the source in one place T47's
 * ids (R56, R81–R85) depend on, runs the suite, and requires it to FAIL in lines it did not fail before the break,
 * naming the requirement ids those lines carry (a line red on the baseline, such as R82's first-frame arms until
 * agent-model R16 merges, proves nothing about an arm).
 *
 *     node test/t47.control.mjs          # every arm, in order
 *     node test/t47.control.mjs 3        # one arm
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
const SUITE = join(DIR, "t47.test.mjs");
const INDEX = join(MEMBER, "src/index.mjs");
const SIGNIN = join(MEMBER, "src/signin.mjs");
const DRAFT = join(MEMBER, "src/draft.mjs");
const sha = (b) => createHash("sha256").update(b).digest("hex");

const ARMS = [
  { name: "the token relayed without the door's hold", file: SIGNIN, ids: ["R81"], from: `if (hold) held = true;`, to: `if (true) held = true;` },
  { name: "valid_for kept when the token is dropped", file: SIGNIN, ids: ["R81"],
    from: `const { token: _token, valid_for: _validFor, ...rest } = answer;`, to: `const { token: _token, ...rest } = answer;` },
  { name: "a sign-in with no secret taken (SIGNIN_NOT_HELD dropped)", file: INDEX, ids: ["R82"],
    from: `if (a.kind === "signin" && !(typeof a.secret === "string" && a.secret.length > 0))`, to: `if (false)` },
  { name: "a sign-in's secret of another type taken", file: INDEX, ids: ["R82"],
    from: `((a.secret !== undefined && a.secret !== null && typeof a.secret !== "string")`, to: `((false)` },
  { name: "the trace header not passed on to the runner", file: SIGNIN, ids: ["R83"],
    from: `const headers = { "content-type": "application/json", [TRACE_HEADER]: trace,`, to: `const headers = { "content-type": "application/json",` },
  { name: "no line written", file: SIGNIN, ids: ["R83"], from: `log(JSON.stringify({ ...line, ...fields }));`, to: `` },
  { name: "the text head not scrubbed of token-shaped runs", file: SIGNIN, ids: ["R83"],
    from: `    .replace(/[A-Za-z0-9._-]{32,}/g, "[token]");`, to: `;` },
  { name: "trace not added to a relayed answer", file: SIGNIN, ids: ["R84"],
    from: `const relayed = typeof out.trace === "string" ? out : { ...out, trace };`, to: `const relayed = out;` },
  { name: "a refusal's detail in the old words (the place named)", file: SIGNIN, ids: ["R84"],
    from: `  BAD_BODY: "Your group's Civicsmith could not read`, to: `  BAD_BODY: "The plane instance could not read` },
  { name: "a runner code left out of SIGNIN_CODES", file: SIGNIN, ids: ["R84", "R85"],
    from: `"BAD_CODE", "SIGNIN_REFUSED", "SIGNOUT_FAILED",`, to: `"BAD_CODE", "SIGNIN_REFUSED",` },
  { name: "the attempt not passed on", file: SIGNIN, ids: ["R85"],
    from: `body.attempt.length <= ATTEMPT_MAX ? { attempt: body.attempt } : {}`, to: `false ? {} : {}` },
  { name: "a draft's suggestions layer loaded whatever the switch", file: DRAFT, ids: ["R56"],
    from: `const suggestionsOn = account.suggestions === true;`, to: `const suggestionsOn = true;` },
];

/* The suite's failing lines before any break: an arm is credited only with lines it newly fails. */
const base = spawnSync("node", [SUITE], { cwd: MEMBER, encoding: "utf8" });
const baseline = new Set(((base.stdout || "") + (base.stderr || "")).split("\n").filter((l) => l.startsWith("  FAIL")));
console.log(`  baseline: ${baseline.size} failing line(s)`);
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
  const failing = out.split("\n").filter((l) => l.startsWith("  FAIL") && !baseline.has(l));
  const named = arm.ids.filter((id) => failing.some((l) => new RegExp(`\\b${id}\\b`).test(l)));
  const ok = status !== 0 && failing.length > 0 && named.length === arm.ids.length;
  console.log(`  ${ok ? "PASS" : "FAIL"}  arm ${n} (${arm.name}): the suite fails ${failing.length} line(s), naming ${named.join(", ") || "none"}`
    + (ok ? "" : ` (want every one of ${arm.ids.join(", ")})`));
  if (!ok) bad++;
}
console.log(`\nt47 control: ${pick.length - bad} pass, ${bad} fail`);
process.exit(bad ? 1 : 0);
