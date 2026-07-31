#!/usr/bin/env node
/* plancheck — does the plan hang together, and has it actually been PUBLISHED?
 *
 * WHY THIS EXISTS. On 2026-07-31 a BOB session wrote a rule ("an area may not be
 * ACTIVE without a kickoff"), created the missing kickoff, and left it UNTRACKED.
 * Three worker worktrees were already live, pinned at an earlier commit. A git
 * worktree is a checkout of a COMMIT, so an untracked file in the main checkout is
 * invisible to every worker permanently — not merely until they refresh. The rule
 * and its fix reached nobody. In the same session a mechanism (the BOB INBOX) was
 * documented in two places and not added to the loop CONDUCT actually runs, so even
 * once published it would not have been read.
 *
 * Both failures are the class this repository keeps meeting and keeps closing the
 * same way: a list maintained by hand falls behind silently (D-113's purge table, the
 * `npm test` chain of 38 files against a directory of 41). Convention did not hold
 * there and will not hold here. So the discipline gets an instrument.
 *
 * THE PRINCIPLE IT ENFORCES: the repository is the channel between sessions. A change
 * is not made when it is written, it is made when it is committed and pushed. An
 * uncommitted file communicates nothing; an untracked one cannot even be reached.
 *
 *   node tools/plancheck.mjs            # full check; exit 1 on any FAIL
 *   node tools/plancheck.mjs --local    # skip the publication checks (mid-turn use)
 *
 * FAIL is a structural break. WARN is worth a look and never blocks.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEV = join(ROOT, "docs/development");
const LOCAL_ONLY = process.argv.includes("--local");

const fails = [], warns = [], notes = [];
const fail = (m) => fails.push(m);
const warn = (m) => warns.push(m);
const read = (p) => { try { return readFileSync(join(ROOT, p), "utf8"); } catch { return null; } };
const sh = (c) => { try { return execSync(c, { cwd: ROOT, encoding: "utf8" }).trim(); } catch { return null; } };

/* ------------------------------------------------------- 1. PUBLICATION */

if (!LOCAL_ONLY) {
  /* Only the planning surface is checked. A session legitimately holds uncommitted
     CODE mid-turn; what must never sit unpublished at a handoff is the plan, because
     the plan is how the next session learns what changed. */
  const dirty = sh("git status --porcelain -- docs/ CLAUDE.md tools/");
  if (dirty) {
    fail(`UNPUBLISHED — the planning surface has uncommitted changes. A worktree is a\n`
       + `        checkout of a COMMIT, so these reach no worker at all:\n`
       + dirty.split("\n").map((l) => `          ${l}`).join("\n"));
  }

  sh("git fetch -q origin");
  const head = sh("git rev-parse HEAD");
  const remote = sh("git rev-parse origin/main");
  if (head && remote && head !== remote) {
    const ahead = sh("git rev-list --count origin/main..HEAD");
    if (ahead && +ahead > 0) {
      fail(`UNPUSHED — ${ahead} commit(s) on local main are not on origin/main. Verify from\n`
         + `        the REMOTE, never from your own tree: a local commit is not a published one.`);
    } else {
      warn(`local main is behind origin/main — fetch and rebase before writing.`);
    }
  }
}

/* -------------------------------------------------- 2. THE PLAN COHERES */

const queue = read("docs/development/QUEUE.md");
const milestones = read("docs/development/MILESTONES.md");
const interfaces = read("docs/development/INTERFACES.md");
const register = read("docs/development/kickoffs/README.md");
const debt = read("docs/development/DEBT.md");

for (const [name, body] of [["QUEUE.md", queue], ["MILESTONES.md", milestones],
                            ["INTERFACES.md", interfaces], ["DEBT.md", debt]])
  if (!body) fail(`MISSING — docs/development/${name} does not exist.`);

if (queue && register) {
  /* An area may not be ACTIVE without a kickoff naming its paths. This is the exact
     hole that produced this script: RECORD was activated and a worker spawned for it
     would have had nothing to read. */
  for (const m of queue.matchAll(/^##\s+([A-Z][A-Z-]+)\s+—\s+ACTIVE/gm)) {
    const area = m[1];
    if (!existsSync(join(DEV, `kickoffs/${area}.md`)))
      fail(`NO KICKOFF — area ${area} is ACTIVE in QUEUE.md and `
         + `docs/development/kickoffs/${area}.md does not exist. A worker spawned for it\n`
         + `        has nothing to read. Activating an area and writing its kickoff are ONE act.`);
    if (!new RegExp(`\`${area}\``).test(register))
      fail(`NOT IN THE REGISTER — area ${area} is ACTIVE and absent from `
         + `kickoffs/README.md's thread table, so its owned paths are undefined.`);
  }
}

if (queue && interfaces) {
  const known = new Set([...interfaces.matchAll(/^##\s+(I\d+)\s+—/gm)].map((m) => m[1]));
  for (const m of queue.matchAll(/^behind-interface:\s*(.+)$/gm)) {
    for (const id of (m[1].match(/\bI\d+\b/g) || []))
      if (!known.has(id))
        fail(`UNREGISTERED INTERFACE — QUEUE.md has an item behind ${id}, which is not in\n`
           + `        INTERFACES.md. An interface not in the registry does not exist and nothing\n`
           + `        may be built against it (PARALLELISM.md).`);
  }
  notes.push(`interfaces registered: ${[...known].sort().join(", ") || "none"}`);
}

if (queue && milestones) {
  const known = new Set([...milestones.matchAll(/^###\s+(M\d+)\s+·/gm)].map((m) => m[1]));
  const used = new Set();
  for (const m of queue.matchAll(/^milestone:\s*(M\d+)/gm)) {
    used.add(m[1]);
    if (!known.has(m[1]))
      fail(`UNKNOWN MILESTONE — QUEUE.md names ${m[1]}, which MILESTONES.md does not define.`);
  }
  const idle = [...known].filter((k) => !used.has(k)).sort();
  if (idle.length)
    notes.push(`milestones with no queued item (normal for later rungs): ${idle.join(", ")}`);
}

if (debt) {
  /* Every OPEN row carries a disposition token, or it is invisible work — which is
     how a standing ruling went two design revisions with nothing scheduling it. */
  const TOKEN = /\|\s*(M\d+|DOCTRINE|ACCEPTED|WATCH|SUPERSEDED|NOT OURS|BOB's)/;
  const RESOLVED = /\|\s*(fixed|resolved|closed|guarded|amended|measured)/i;
  const bad = [];
  for (const line of debt.split("\n")) {
    if (!/^\|\s*D-\d+\s*\|/.test(line)) continue;
    const tail = line.replace(/\s+$/, "");
    const i = tail.lastIndexOf("|", tail.length - 2);
    const status = i >= 0 ? tail.slice(i) : "";
    if (TOKEN.test(status) || RESOLVED.test(status)) continue;
    bad.push((line.match(/^\|\s*(D-\d+)/) || [])[1]);
  }
  if (bad.length)
    fail(`NO DISPOSITION — ${bad.length} open debt row(s) carry no milestone or explicit\n`
       + `        DOCTRINE/ACCEPTED/WATCH token, so they are invisible work: ${bad.join(", ")}`);
}

/* ------------------------------------------- 3. THE DECISION CHANNEL */

const decisions = read("docs/development/DECISIONS.md");
if (!decisions) {
  fail(`MISSING — docs/development/DECISIONS.md does not exist, so a decision raised by`
     + ` a worker\n        or by CONDUCT has nowhere to go but a session window.`);
} else {
  /* Split into chunks rather than one lazy regex: with the `m` flag a trailing `$`
     alternative matches at the FIRST line end, so the body came back empty and every
     entry looked as though it had no fields. Caught by the check reporting a missing
     `provisional:` on two entries that plainly had one — which is the negative control
     doing its job on the instrument itself. */
  const entries = decisions.split(/^###\s+(?=DEC-)/m).slice(1).map((chunk) => {
    const head = chunk.match(/^(DEC-\d+)\s+·\s+(open|answered|enacted)\b/);
    return head ? [null, head[1], head[2], chunk] : null;
  }).filter(Boolean);
  const field = (body, name) => {
    const m = body.match(new RegExp(`^${name}:\\s*(.*)$`, "m"));
    if (!m) return null;
    /* a field's value may continue on indented following lines */
    const rest = body.slice(body.indexOf(m[0]) + m[0].length)
      .split("\n").slice(1);
    let v = m[1].trim();
    for (const l of rest) { if (!/^\s{2,}\S/.test(l)) break; v += " " + l.trim(); }
    return v;
  };
  let open = 0, answered = 0;
  for (const [, id, status, body] of entries) {
    if (status === "open") {
      open++;
      /* The productivity rule, made structural: an open decision must never be a
         stopped session. Bob, 2026-07-31: never block on getting my answer. */
      if (!field(body, "provisional"))
        fail(`${id} is open with no \`provisional:\` line — so either work is BLOCKED on\n`
           + `        Bob, or nobody said what is running meanwhile. Neither is acceptable:\n`
           + `        state what runs, or state that nothing is blocked.`);
    }
    if (status === "answered") {
      answered++;
      if (!field(body, "response"))
        fail(`${id} is marked answered and carries no \`response:\`.`);
    }
    if (status === "enacted") {
      const e = field(body, "enacted");
      /* The whole point of the file over a chat window: the REASONING lands
         somewhere durable, not just the verdict. */
      if (!e || !/\.md\b/.test(e))
        fail(`${id} is enacted and its \`enacted:\` line names no DOCUMENT carrying the\n`
           + `        reasoning. A verdict with no reasoning in the record is a transcript.`);
    }
  }
  if (answered) warn(`${answered} decision(s) answered and not yet enacted — CONDUCT owes`
                   + ` an enactment (DECISIONS.md).`);
  notes.push(`decisions: ${open} open, ${answered} awaiting enactment, ${entries.length} total`);

  const bobKick = read("docs/development/kickoffs/BOB.md");
  const conductKick = read("docs/development/kickoffs/CONDUCT.md");
  if (bobKick && !/DECISIONS\.md/.test(bobKick))
    fail(`MECHANISM NOT IN THE LOOP — DECISIONS.md exists and kickoffs/BOB.md never`
       + ` mentions it,\n        so nothing surfaces an open decision to Bob.`);
  if (conductKick && !/DECISIONS\.md/.test(conductKick))
    fail(`MECHANISM NOT IN THE LOOP — DECISIONS.md exists and kickoffs/CONDUCT.md never`
       + ` mentions\n        it, so nothing lifts items in or drains answers out.`);
}

/* --------------------------------------- 4. ORPHANED ARCHITECTURE (warn) */

if (interfaces && queue) {
  for (const m of interfaces.matchAll(/^##\s+(I\d+)\s+—([^\n]*)\n([\s\S]*?)(?=\n##\s+I\d+\s+—|$)/gm)) {
    const [, id, , body] = m;
    if (/\*\*Status:\*\*\s*PROVISIONAL/.test(body) && !new RegExp(`\\b${id}\\b`).test(queue))
      warn(`${id} is PROVISIONAL and no queue item references it — architecture with no\n`
         + `        path to work. Either queue what confirms it, or say in the registry why not.`);
  }
}

const inbox = queue && /##\s+BOB INBOX/.test(queue);
if (queue && !inbox)
  fail(`NO BOB INBOX — QUEUE.md has no inbox section, so a BOB session has no way to hand\n`
     + `        a change over without editing CONDUCT's file (ORCHESTRATION.md).`);

const conduct = read("docs/development/kickoffs/CONDUCT.md");
if (conduct && inbox && !/INBOX/.test(conduct))
  fail(`MECHANISM NOT IN THE LOOP — the BOB INBOX exists and kickoffs/CONDUCT.md never\n`
     + `        mentions it, so nothing drains it. A mechanism that is not in the loop the\n`
     + `        reader actually runs is not a mechanism.`);

/* ------------------------------------------------------------- report */

for (const n of notes) console.log(`  note  ${n}`);
for (const w of warns) console.log(`  WARN  ${w}`);
for (const f of fails) console.log(`  FAIL  ${f}`);

console.log(`\nplancheck: ${fails.length} fail, ${warns.length} warn`
  + (LOCAL_ONLY ? "  (--local: publication checks skipped)" : ""));
if (fails.length) {
  console.log(`\nA change is not made when it is written. It is made when it is committed and\n`
            + `pushed, because the repository is the channel between sessions.\n`);
}
process.exit(fails.length ? 1 : 0);
