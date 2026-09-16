/* THE ESTATE HOLD PREDICATE — one MACHINE develops this repository at a time.
 *
 * A MODULE rather than an inline arm for the reason `plancheck.mjs` already
 * states of its other predicates: plancheck self-executes and cannot be
 * imported, so an inline predicate would have to be COPIED into whatever drives
 * it, and two readers of one question is how two answers were allowed to differ.
 * `rowdesign.mjs` and `corpuscheck.mjs` are the shape.
 *
 * The rule it enforces, and why it is an instrument and not a convention:
 * claims keep two SESSIONS out of one tree and worktrees keep two out of one
 * checkout, and NEITHER KNOWS A SECOND MACHINE EXISTS. The file's first version
 * relied on a session releasing the hold at stand-down — a voluntary act by a
 * session that may be suspended before it gets there, which is what happened
 * within hours: the integrator was suspended mid-flight and the hold outlived
 * the machine's work by sixteen hours. An instrument that exists and is
 * OPTIONAL is the failure M0-41 measured; this one is not optional.
 *
 * TIME IS ISO 8601 UTC WITH THE Z. A bare date let two machines in different
 * zones disagree by a day about whether a hold had expired, and an expiry that
 * is not a fact in one clock is not an expiry.
 *
 * ONE LINE, because two claimants must COLLIDE. Spread across a table, two
 * machines claiming at once edit different rows and git auto-merges BOTH into a
 * file naming one machine and another's expiry — a textual merge of a semantic
 * conflict. One line forces the conflict git is good at. */
export const HOLD_RE =
  /^\s*HOLD:\s*machine=([^|]+?)\s*\|\s*account=([^|]+?)\s*\|\s*status=([A-Z]+)\s*\|\s*through=(\S+)\s*$/m;

/** Pure: text in, verdict out, so a control can drive every arm without a repository.
 *  Kinds: theirs · ours · ours-expired · free · unreadable · unparseable · badtime. */
export function estateVerdict(holdText, thisHolder, nowIso) {
  if (!holdText) return { kind: "unreadable" };
  const m = HOLD_RE.exec(holdText);
  if (!m) return { kind: "unparseable" };
  const [, machine, account, status, through] = m;
  /* STRICT, and the control is why. `Date.parse` accepts a date-time with NO zone
     and reads it as LOCAL time, so two machines in different zones would disagree
     about the same string — the very disagreement the Z was added to remove, coming
     back through the parser rather than through the prose. A bare DATE is unambiguous
     by spec (UTC) and still refused, because one form is cheaper to get right than
     two and the file states one. */
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?Z$/.test(through))
    return { kind: "badtime", through };
  const t = Date.parse(through);
  if (Number.isNaN(t)) return { kind: "badtime", through };
  const expired = t <= Date.parse(nowIso);
  /* THE UNIT IS THE ACCOUNT, RULED BY BOB 2026-09-16, correcting this module's
     first version — which keyed on the MACHINE and would therefore have refused
     one account's SECOND session its own estate. His words: "the estate gate is
     held per account, not per session." The consequence runs the other way too,
     and it retires a "defect" this module was written to fix: two cloud
     containers of ONE account reading each other's hold as `ours` is CORRECT,
     not a fail-open. What was genuinely wrong was that the load-bearing field
     was never derived from anything — `account=` was a hand-typed literal while
     `machine=` carried a hostname that identifies no account at all.
     `machine=` is now INFORMATIONAL, for a human reading the line, and the
     account is what the lock turns on. */
  if (status === "RELEASED" || expired) {
    if (account === thisHolder && status !== "RELEASED")
      return { kind: "ours-expired", machine, account, through };
    return { kind: "free", machine, account, status, through };
  }
  return account === thisHolder
    ? { kind: "ours", machine, account, through }
    : { kind: "theirs", machine, account, through };
}

/* ============================================================================
 * WHO "THIS MACHINE" IS — added 2026-09-16 by the first CLOUD machine, because
 * the predicate above was correct and the IDENTITY FED TO IT WAS NOT.
 *
 * THE DEFECT, MEASURED RATHER THAN REASONED ABOUT. `plancheck` derived this
 * machine's name inline as `scutil --get ComputerName` || `hostname -s`, and on
 * the Claude Code cloud image `hostname -s` is literally `vm` for EVERY
 * container. Driven through `estateVerdict` before any of this was written:
 *
 *   a hold written as machine=vm, read by the Mac Mini      -> theirs  (refused, right)
 *   a hold written as machine=vm, read by ANOTHER cloud VM  -> OURS    (the defect)
 *   a hold written under a distinguishing name, read here   -> theirs  (refuses itself)
 *
 * Row 2 is the whole lock failing open: a second cloud session reads the first
 * one's hold as its own, is told NOTHING — not a refusal, not even a warning,
 * just a note saying it holds the estate — and develops. Two machines believing
 * they hold it is the one collision `ESTATE-HOLD.md` exists to prevent, and it
 * was reachable the moment the estate moved to a platform where the hostname is
 * a constant. Row 3 is why a better STRING cannot fix it: identity is an exact
 * match against a value the TOOL computes, so the tool is what had to change.
 *
 * WHY A PERSISTED PER-CLONE ID AND NOT A PLATFORM FACT. `/etc/machine-id`,
 * `CLAUDE_CODE_CONTAINER_ID` and the session id were all available here and all
 * rejected as the primary: the first may be baked into an image and shared by
 * every container from it — WHICH THIS SESSION COULD NOT MEASURE, having only
 * one container, so relying on it would rest the lock on an unverified premise
 * of exactly the kind that produced the defect — and the other two are
 * Claude-specific, so the Mac and the cloud would derive identity by different
 * rules and only one of them would be tested. A random id persisted in the
 * COMMON gitdir is uniform across platforms, provably distinct per clone (it is
 * minted, not observed), stable across turns and suspensions, and SHARED BY
 * EVERY WORKTREE of one clone — which is the correct grain, because one machine
 * is one identity however many lanes it runs. It is the pattern `mintid.mjs`
 * already trusts for the id ledger, whose own comment notes that two machines do
 * not share a common gitdir.
 *
 * AND THE CONSEQUENCE IS STATED RATHER THAN HIDDEN: an ephemeral container gets
 * a NEW identity every session, because a re-clone is a new machine. That is the
 * honest answer and it is why `claimWindowHours` is short on a remote session —
 * see below. */

import { execFileSync } from "node:child_process";
import { randomBytes, createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, isAbsolute, resolve } from "node:path";

/** The HOLD grammar splits on `|` and the line is one line, so a machine name
 *  that carries either would break the very collision the one-line form buys.
 *  A Mac's ComputerName is routinely "Bob's Mac Mini" — spaces and an
 *  apostrophe — so this is the normal case and not a hostile one. */
export function sanitizeName(raw) {
  const s = String(raw || "").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-{2,}/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  return s || "unknown";
}

function sh(cmd, args) {
  try {
    return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch { return ""; }
}

/** The COMMON gitdir — the one `.git` every worktree of a clone shares.
 *  `--git-common-dir` answers a RELATIVE `.git` in the main checkout, which is
 *  the trap `mintid.ledgerRoot` documents, so it is resolved against the repo. */
export function machineIdFile({ repo = process.cwd() } = {}) {
  const common = sh("git", ["-C", repo, "rev-parse", "--git-common-dir"]);
  if (!common) return null;
  return join(isAbsolute(common) ? common : resolve(repo, common), "bio-machine");
}

/** Stable, discriminating, and it SAYS WHICH RULE APPLIED, because a reader who
 *  cannot see how identity was derived cannot judge whether it discriminates.
 *  `discriminating: false` is the honest report when nothing could be persisted:
 *  the caller must say so rather than pretend the bare hostname is an identity. */
export function machineIdentity({ repo = process.cwd(), env = process.env } = {}) {
  const base = sanitizeName(sh("scutil", ["--get", "ComputerName"]) || sh("hostname", ["-s"]) || "unknown");
  if (env.BIO_MACHINE_ID)
    return { id: sanitizeName(env.BIO_MACHINE_ID), base, source: "BIO_MACHINE_ID", discriminating: true };
  const file = machineIdFile({ repo });
  if (!file)
    return { id: base, base, source: "hostname-only (no gitdir)", discriminating: false };
  let suffix = "";
  try {
    suffix = readFileSync(file, "utf8").trim();
  } catch {
    /* EXCLUSIVE create, so two sessions racing on one machine agree on one id
       rather than each minting its own — the same reason `mintid` creates
       exclusively. On EEXIST the winner's value is read back. */
    const minted = randomBytes(4).toString("hex");
    try {
      mkdirSync(join(file, ".."), { recursive: true });
      writeFileSync(file, minted + "\n", { flag: "wx" });
      suffix = minted;
    } catch {
      try { suffix = readFileSync(file, "utf8").trim(); } catch { suffix = ""; }
    }
  }
  if (!/^[0-9a-f]{8}$/.test(suffix))
    return { id: base, base, source: "hostname-only (id file unusable)", discriminating: false };
  return { id: `${base}-${suffix}`, base, suffix, source: file, discriminating: true };
}

/* WHO THE HOLDER IS — the ACCOUNT, ruled by Bob 2026-09-16.
 *
 * Derived from `CLAUDE_CODE_ACCOUNT_UUID`, which is authoritative, stable across
 * every session and every container of one account, and different for a different
 * account — which is the collision this lock actually exists to prevent. It is
 * HASHED to 8 hex rather than written out, because the HOLD line lives in a
 * repository and an account UUID in it would be an identifier disclosed for no
 * benefit: the lock needs the two accounts to DIFFER, not to be readable.
 *
 * FALLBACKS, in order, each NAMED in the result so a reader can see which applied:
 * `BIO_HOLD_ACCOUNT` for an explicit value and for controls; then the per-clone id
 * persisted in the common gitdir, which is not account-scoped but IS stable and
 * distinct, so the two-accounts collision is still caught on a machine where the
 * account uuid is not in the environment; then nothing, reported as
 * `discriminating: false` so the caller refuses to claim rather than claiming
 * under a key that cannot discriminate. */
export function accountIdentity({ repo = process.cwd(), env = process.env } = {}) {
  if (env.BIO_HOLD_ACCOUNT)
    return { key: sanitizeName(env.BIO_HOLD_ACCOUNT), source: "BIO_HOLD_ACCOUNT", discriminating: true };
  if (env.CLAUDE_CODE_ACCOUNT_UUID) {
    const d = createHash("sha256").update(env.CLAUDE_CODE_ACCOUNT_UUID).digest("hex").slice(0, 8);
    return { key: `acct-${d}`, source: "CLAUDE_CODE_ACCOUNT_UUID (hashed)", discriminating: true };
  }
  const m = machineIdentity({ repo, env });
  return m.discriminating
    ? { key: `clone-${m.suffix || m.id}`, source: `per-clone id (${m.source}) — NOT account-scoped`, discriminating: true }
    : { key: m.id, source: m.source, discriminating: false };
}

/* THE WINDOW IS BOB'S 48 h, ONE NUMBER, AND THE ARGUMENT FOR SHORTENING IT WAS
 * WRONG — recorded rather than deleted, because it was wrong for an instructive
 * reason. This module's first version cut the window to 4 h on an ephemeral
 * machine, reasoning that a container which suspends between turns and is
 * reclaimed when idle cannot be relied on to release, so a 48 h hold would
 * outlive the machine that took it with nobody working.
 *
 * THAT ARGUMENT ASSUMED THE HOLDER DIES WITH THE CONTAINER, and under Bob's
 * ruling the holder is the ACCOUNT, which does not. The account's next session
 * reads `ours` and refreshes inside an act it already performs, so nothing is
 * stranded and there is nothing for a shorter window to rescue. The 4 h would
 * have bought only a hold expiring under a working account — the very failure the
 * file says a short window causes. One window, and it is his.
 *
 * It stays overridable by `BIO_HOLD_HOURS` for controls and for a genuinely
 * unusual case, which is what the suite drives it with. */
export function claimWindowHours({ env = process.env } = {}) {
  if (env.BIO_HOLD_HOURS) {
    const n = Number(env.BIO_HOLD_HOURS);
    if (Number.isFinite(n) && n > 0) return { hours: n, kind: "BIO_HOLD_HOURS" };
  }
  return { hours: 48, kind: "the one window — the holder is an ACCOUNT, which outlives any container" };
}

/** ISO 8601 UTC with the Z and to the MINUTE, which is the one form the
 *  predicate accepts and the file states. */
export function throughIso(fromMs, hours) {
  return new Date(fromMs + hours * 3600 * 1000).toISOString().replace(/:\d\d\.\d+Z$/, "Z");
}

export function holdLine({ machine, account, status, through }) {
  return `    HOLD: machine=${machine} | account=${account} | status=${status} | through=${through}`;
}

/** Rewrite the WHOLE line — never a field — because the file's own first failure
 *  was a shape where two claimants could edit different parts and git would
 *  auto-merge both claims into one incoherent line. Throws rather than appending
 *  when there is no line to replace: a second HOLD line would make the predicate
 *  read whichever came first, silently. */
export function rewriteHold(text, fields) {
  if (!HOLD_RE.test(text)) throw new Error("no HOLD line to rewrite");
  const line = holdLine(fields);
  if (!HOLD_RE.test(line + "\n")) throw new Error(`the rewritten line does not parse: ${line}`);
  return text.replace(HOLD_RE, line);
}

/* ============================================================================
 * THE CLI — `node tools/estatehold.mjs show|claim|refresh|release`.
 *
 * IT EXISTS BECAUSE THE PROTOCOL WAS PROSE AND A PROSE PROTOCOL IS PERFORMED
 * DIFFERENTLY BY EVERY READER. `ESTATE-HOLD.md` told a session to "rewrite the
 * WHOLE line" with four fields, one of them a timestamp in a format the
 * predicate refuses three ways, one of them an identity the session had no way
 * to compute correctly — and then to push, and to read the rejection as a lost
 * race rather than rebasing. That is five chances to get it wrong per claim, and
 * `CLAUDE.md`'s own rule is that a mechanism not in the loop the reader actually
 * runs is not a mechanism. So the acts are a command now, and the prose points
 * at the command rather than describing the edit.
 *
 * IT DOES THE PUSH, because the push IS the allocator and a tool that leaves the
 * load-bearing half to the caller has moved the hazard rather than removed it.
 * It refuses on any `plancheck` FAIL first — the claim is a one-line docs change
 * whose gate is `plancheck`, not the battery, which is the ordering ruled below
 * in `ESTATE-HOLD.md` — and it commits ONLY this file by path, so it can be run
 * safely in a tree with unrelated work in it. On a rejected push it fetches,
 * names the winner and STOPS; it never rebases and re-pushes, which is the one
 * reflex that defeats the lock. */

const RELEASED_THROUGH = "1970-01-01T00:00Z";

function repoRoot() {
  return sh("git", ["rev-parse", "--show-toplevel"]) || process.cwd();
}

function remoteHoldText(repo) {
  sh("git", ["-C", repo, "fetch", "origin", "main"]);
  return sh("git", ["-C", repo, "show", "origin/main:docs/development/ESTATE-HOLD.md"]);
}

function plancheckClean(repo) {
  try {
    const out = execFileSync("node", ["tools/plancheck.mjs"],
      { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { ok: !/^plancheck: [1-9]/m.test(out), out };
  } catch (e) {
    return { ok: false, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
}

function writeAndPush(repo, fields, { push, subject }) {
  const rel = "docs/development/ESTATE-HOLD.md";
  const path = join(repo, rel);
  const next = rewriteHold(readFileSync(path, "utf8"), fields);
  writeFileSync(path, next);
  console.log(`  ${holdLine(fields).trim()}`);
  if (!push) { console.log("  --no-push: written but NOT pushed, so nothing is allocated yet."); return 0; }
  const pc = plancheckClean(repo);
  if (!pc.ok) {
    console.log("  REFUSED: plancheck reports a FAIL, so this is not a tree to push from.");
    console.log(pc.out.split("\n").filter((l) => /FAIL|plancheck:/.test(l)).map((l) => `    ${l.trim()}`).join("\n"));
    return 1;
  }
  sh("git", ["-C", repo, "add", "--", rel]);
  try {
    execFileSync("git", ["-C", repo, "commit", "-m", subject, "--", rel],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    console.log(`  nothing to commit (the line may already say this): ${(e.stdout || "").trim().split("\n")[0]}`);
  }
  try {
    execFileSync("git", ["-C", repo, "push", "origin", "HEAD:main"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch {
    console.log("  PUSH REJECTED — you lost the race. Not rebasing: that is the reflex that defeats the lock.");
    const v = estateVerdict(remoteHoldText(repo), accountIdentity({ repo }).key, new Date().toISOString());
    console.log(`  the remote now says: ${JSON.stringify(v)}`);
    console.log("  STOP. Do not develop, spawn or push.");
    return 1;
  }
  const after = estateVerdict(remoteHoldText(repo), accountIdentity({ repo }).key, new Date().toISOString());
  console.log(`  pushed, and VERIFIED FROM THE REMOTE rather than from this tree: ${after.kind}`);
  return after.kind === "ours" || (fields.status === "RELEASED" && after.kind === "free") ? 0 : 1;
}

async function main(argv) {
  const cmd = argv[0] || "show";
  const push = !argv.includes("--no-push");
  const hoursArg = (() => {
    const i = argv.indexOf("--hours");
    return i >= 0 && argv[i + 1] ? Number(argv[i + 1]) : null;
  })();
  const repo = repoRoot();
  const me = machineIdentity({ repo });
  const holder = accountIdentity({ repo });
  const win = hoursArg ? { hours: hoursArg, kind: "--hours" } : claimWindowHours();
  const text = remoteHoldText(repo);
  const v = estateVerdict(text, holder.key, new Date().toISOString());

  /* BOTH are printed, and the distinction is the whole point: the ACCOUNT is what
     the lock turns on, the machine is a label so a human reading the line knows
     where the work was happening. */
  console.log(`  this holder:  "${holder.key}" (${holder.source})`
    + (holder.discriminating ? "" : "  <- NOT DISCRIMINATING: two holders could share this key"));
  console.log(`  this machine: "${me.id}" (informational only)`);
  console.log(`  origin/main says: ${v.kind}${v.machine ? ` — machine="${v.machine}" through ${v.through}` : ""}`);

  if (cmd === "show") {
    if (!me.discriminating)
      console.log("  WARNING: identity could not be persisted, so this machine cannot hold the estate safely.");
    return 0;
  }
  if (cmd === "release")
    return v.kind === "ours" || v.kind === "ours-expired" || v.kind === "free"
      ? writeAndPush(repo, { machine: "none", account: "none", status: "RELEASED", through: RELEASED_THROUGH },
          { push, subject: "estate: RELEASED at stand-down" })
      : (console.log(`  REFUSED: this is not yours to release — "${v.machine}" holds it.`), 1);

  if (cmd === "claim" || cmd === "refresh") {
    if (v.kind === "theirs") {
      console.log(`  REFUSED: "${v.machine}" (${v.account}) holds the estate through ${v.through}.`);
      console.log("  ONE MACHINE DEVELOPS AT A TIME: do not commit, push, spawn or deploy.");
      console.log("  It EXPIRES on its own; breaking it early is Bob's call.");
      /* INFORMATIVE, NEVER PERMISSIVE. A machine crossing the 2026-09-16 identity
         change finds its OWN hold unrecognisable, because the hold carries the bare
         name the old rule computed and this rule computes name+suffix. Saying so
         beats letting the reader conclude a second machine appeared — but it does
         NOT unlock anything: the two ways across are the holder rewriting the line
         in the same change that upgrades the rule, or waiting out the expiry. */
      if (!/^(acct|clone)-/.test(v.account || ""))
        console.log(`  note: that hold's account field ("${v.account}") is not a DERIVED holder key, so it`
          + ` predates the 2026-09-16 account rule and may be your own. That is NOT authority to take`
          + ` it: let it expire, or rewrite it in the commit that upgrades the rule.`);
      return 1;
    }
    if (cmd === "refresh" && v.kind === "free" && v.machine !== me.id)
      console.log("  note: nothing was held, so this refresh is a fresh claim.");
    if (!holder.discriminating) {
      console.log("  REFUSED: the holder key is not discriminating, so a hold under it would not be a lock.");
      return 1;
    }
    return writeAndPush(repo,
      { machine: me.id, account: holder.key, status: "HELD", through: throughIso(Date.now(), win.hours) },
      { push, subject: `estate: ${cmd === "claim" ? "CLAIMED" : "refreshed"} by ${holder.key} on ${me.id} for ${win.hours}h` });
  }
  console.log(`  unknown command "${cmd}" — one of show, claim, refresh, release.`);
  return 1;
}

if (import.meta.url === `file://${process.argv[1]}`)
  main(process.argv.slice(2)).then((c) => process.exit(c));
