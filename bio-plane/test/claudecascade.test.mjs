/* DS-3 — the account cascade's third level: the instance's own Claude account.
 *
 * The first two levels (member, project) are rows a member wrote and are read
 * from the record; FL-6 resolves the three at runtime. This suite covers the
 * CONFIGURATION level DIST owns: what the instance holds, what it reports when
 * it holds nothing, and — the part that is a fence rather than a value — that
 * nothing an agent can call sets it.
 *
 * NEGATIVE CONTROL: RUN 2026-09-12, six arms — (a) an unset binding reports a
 * STATED unavailability with a reason a surface can render, never an empty
 * success, because a silent no-op is indistinguishable from a run that found
 * nothing; (b) an empty string is the same case as absent, so a blank line in
 * a config cannot read as "configured"; (c) A PUBLISHED VALUE IS TREATED AS NOT
 * SET and the token accessor returns null, which is DS-3's own stated control —
 * publication is revocation, driven here against a value really on the denylist
 * rather than a fabricated one; (d) the STATUS object carries no secret, asserted
 * by searching its serialisation for the configured value, so it is safe to log,
 * record, or put in a run object; (e) status and token CANNOT DISAGREE, because
 * the token accessor is derived from the status rather than re-reading the
 * environment — the arm sets a published value and requires both to refuse;
 * (f) THE FENCE — the binding name appears in the plane's source ONLY where it
 * is READ, so there is no op, no store row and no setter that writes it, and an
 * agent-initiated scope widening is refused because the surface does not exist.
 * Arm (f) fails the moment somebody adds one.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";
import "./sandbox.mjs";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  instanceClaudeStatus, instanceClaudeToken, INSTANCE_CLAUDE_BINDING,
  CASCADE_UNSET, CASCADE_PUBLISHED, PUBLISHED_TOKEN_HASHES,
} from "../src/tokens.mjs";

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) console.log(`        got ${statedJSON(got)} want ${statedJSON(want)}`);
};

console.log("\n--- claude cascade: the instance level, and the fence around it ---");

/* A value genuinely on the denylist, read from the file that put it there
   rather than typed here — a fabricated "published" value would test the test. */
const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const publishedValue = readFileSync(join(SRC, "..", "dist", "SECRETS.txt"), "utf8")
  .split("\n").find((l) => l.startsWith("ADMIN_TOKEN=")).split("=")[1].trim();

/* ARM (a) — unset is STATED. */
{
  const st = await instanceClaudeStatus({});
  t("(a) an unset instance account reports a stated unavailability, not an empty success",
    [st.configured, st.reason, typeof st.detail === "string" && st.detail.length > 40],
    [false, CASCADE_UNSET, true]);
}

/* ARM (b) — empty is the same case as absent. */
{
  const st = await instanceClaudeStatus({ [INSTANCE_CLAUDE_BINDING]: "" });
  t("(b) an empty value is absent, so a blank config line cannot read as configured",
    [st.configured, st.reason], [false, CASCADE_UNSET]);
}

/* ARM (c) — DS-3's own control: publication is revocation. */
{
  const env = { [INSTANCE_CLAUDE_BINDING]: publishedValue };
  const st = await instanceClaudeStatus(env);
  t("(c) a PUBLISHED value is treated as NOT SET — revocation by publication",
    [st.configured, st.reason, await instanceClaudeToken(env)],
    [false, CASCADE_PUBLISHED, null]);
}

/* ARM (d) — the status carries no secret. */
{
  const secret = "sk-ant-fixture-value-that-must-not-appear-anywhere";
  const st = await instanceClaudeStatus({ [INSTANCE_CLAUDE_BINDING]: secret });
  t("(d) the STATUS object carries no secret, so it is safe to log or record",
    [st.configured, JSON.stringify(st).includes(secret)], [true, false]);
  t("(d2) and the token accessor does return the value to the one caller that spends it",
    await instanceClaudeToken({ [INSTANCE_CLAUDE_BINDING]: secret }) === secret, true);
}

/* ARM (e) — the two answers cannot disagree. */
{
  const env = { [INSTANCE_CLAUDE_BINDING]: publishedValue };
  const st = await instanceClaudeStatus(env);
  const tok = await instanceClaudeToken(env);
  t("(e) status and token cannot disagree: refused status implies no spendable token",
    [st.configured, tok === null], [false, true]);
}

/* ARM (f) — THE FENCE. Minting is a MEMBER act (D-199.3): the binding must be
   READ and never WRITTEN anywhere in the plane's source. This is the assertion
   that makes "an agent cannot widen scope" structural rather than stated — it
   fails the moment an op, a store row or a setter appears. */
{
  /* ENUMERATED FROM GIT, NOT FROM THE DIRECTORY, and that is the difference
     between a fence and a guess. A `readdirSync` here would see whatever is
     lying in the working tree — including another worker's untracked residue,
     which `git stash` can deposit across worktrees (D-238) — so the same fence
     would answer differently in two checkouts of the same commit. `git ls-files`
     answers for the COMMIT, which is what another session actually gets. It also
     keeps this suite out of hygiene's walking-file census, where it would
     otherwise be a new unguarded walk: a new walk is a decision, not a silence,
     and the honest decision here is not to walk. */
  const files = execFileSync("git", ["ls-files", "bio-plane/src"], { cwd: REPO, encoding: "utf8" })
    .split("\n").filter((f) => f.endsWith(".mjs")).map((f) => f.slice("bio-plane/src/".length));
  const mentions = [];
  for (const f of files) {
    const text = readFileSync(join(SRC, f), "utf8");
    for (const [i, line] of text.split("\n").entries()) {
      if (!line.includes(INSTANCE_CLAUDE_BINDING)) continue;
      mentions.push({ file: f, line: i + 1, text: line.trim() });
    }
  }
  /* Every mention must be inside tokens.mjs, the module that READS it. A mention
     anywhere else is a second place this credential is handled, which is the
     thing being fenced against. */
  const outside = mentions.filter((m) => m.file !== "tokens.mjs");
  t("(f) the instance Claude account is handled in exactly one module — no op, no "
    + "store row, no setter: minting stays a member act",
    outside.map((m) => `${m.file}:${m.line}`), []);
  t("(f2) and it IS present there, so the arm above is not passing on absence",
    mentions.length > 0, true);
  /* An assignment INTO the binding, anywhere, would be a write path. */
  const assigns = mentions.filter((m) => new RegExp(
    `${INSTANCE_CLAUDE_BINDING}\\s*\\]?\\s*=[^=]`).test(m.text));
  t("(f3) and nothing assigns to it, in any module",
    assigns.map((m) => `${m.file}:${m.line}`), []);
}

t("(g) the denylist this rests on is non-empty, so arm (c) cannot pass vacuously",
  PUBLISHED_TOKEN_HASHES.size > 0, true);

console.log(`\nclaude-cascade: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
