#!/usr/bin/env node
/* M0-37's NEGATIVE CONTROL DRIVER — six arms plus a baseline — over the DELEGATION-register
 * check in `tools/delegations.mjs`, its arm in `tools/plancheck.mjs` (section 8) and its arm
 * in `test/planning-hygiene.test.mjs` (section 5).
 *
 *   node bio-plane/test/delegations.control.mjs        (from the repo root)
 *
 * COMMITTED so the next session re-runs it in ONE step instead of re-deriving how to break the
 * subject. Every arm is armed ALONE with the others held open, against a UNIQUELY-NAMED
 * pristine copy in a pen OUTSIDE this worktree (`controlPen("m037")` from `test/pen.mjs`; M0-182,
 * BOB #32 — it was `.m037-harness/`, which no `.gitignore` line covered), and
 * every restore is verified by sha256 AND by `cmp` AND by a floored byte count — because
 * `git checkout --` restores to HEAD, which in a tree with uncommitted work is "throw mine
 * away" and exits 0 either way (CLAUDE.md, measured twice in two days).
 *
 * DELIBERATELY NOT A `.test.mjs`: the battery discovers `*.test.mjs`, and a driver that
 * rewrites `CLAIMS.md` under a battery running against the same checkout would be measuring a
 * moving target for every other suite. The `m025-arm-census.mjs` / `nc-m036.mjs` precedent.
 *
 * THE BASELINE ROW IS NOT DECORATION. A harness once reported `null` for every arm including
 * the baseline, and only the baseline row distinguished six-arms-broken from six-arms-working.
 *
 * THE ARMS, each with what MUST fail and what MUST NOT, DECLARED BEFORE ARMING:
 *
 *   A1  roll ONE block's `open as of` date back past the threshold
 *         -> plancheck FAILS naming THAT block as STALE, and names no other block.
 *         The arm that proves the check reads the DATE and not merely the line's presence.
 *
 *   A2  delete the DISCHARGED line from a block the tree HAS discharged
 *         -> plancheck FAILS naming THAT block as SILENT.
 *         **THE ARM THIS ROW EXISTS FOR.** It proves the check cannot be satisfied by the
 *         register agreeing with itself: the delegation is genuinely closed in the tree, and
 *         the instrument still fails, because what it grades is the REGISTER'S STATEMENT and
 *         not the world. A check that could read the world would not need the register.
 *
 *   A3  OVER-STRICTNESS. A `## CLAIM` block, a `### AMENDMENT` block and a DISCHARGED
 *       `DELEGATION` are left exactly as they are
 *         -> none of the three is named, and plancheck's OTHER arms print BYTE-IDENTICALLY
 *         to the baseline. A fence tighter than its rule is not a safer fence.
 *
 *   A4  delete section 8 from `plancheck.mjs`
 *         -> the SUITE fails by name ("plancheck RUNS the delegation-register check").
 *         The mechanism-in-the-loop arm: a rule that lives only in the battery never reaches
 *         the act that writes a delegation.
 *
 *   A5  make `tools/delegations.mjs` UNLOADABLE
 *         -> plancheck FAILS. Declared as a FAIL rather than a warn on purpose: M0-41
 *         measured that this estate's sibling arms degrade to `0 fail, 2 warn, exit 0` when
 *         their predicate cannot load, and this arm is written closed. **The method matters
 *         and is the reason this arm is here twice over**: renaming the file DIRTIES THE TREE,
 *         so a bare `plancheck` fails on UNPUBLISHED and exits 1 with a NAMED failure while
 *         the subject is never exercised — a refutation that looks more confident than the
 *         finding it refutes (CLAUDE.md's control-perturbs-a-second-variable rule, which was
 *         found by exactly this arm on exactly this file). So A5 runs `--local`, which skips
 *         the publication half, and the unloadability is injected by writing a syntax error
 *         into a COPY-RESTORED file rather than by renaming or chmod.
 *
 *   A6  FORGERY, and its RED is the finding. Blanket-stamp every open block with today's date
 *       in one edit, touching nothing else
 *         -> plancheck PASSES. **Declared to PASS.** The instrument cannot tell a blanket
 *         stamp from an honest sweep and says so in its own header; this arm DRIVES that
 *         limit instead of conceding it in prose, because a limit conceded and never driven
 *         is how an instrument gets believed past its reach (M0-42's arm 9, same shape). The
 *         cohort note is what a reader gets instead, and this arm asserts the note APPEARS.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const PEN = controlPen("m037");
const CLAIMS = join(REPO, "docs/development/CLAIMS.md");
const PLANCHECK = join(REPO, "tools/plancheck.mjs");
const MODULE = join(REPO, "tools/delegations.mjs");
const SUITE = join(REPO, "bio-plane/test/planning-hygiene.test.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`
    + (ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`));
  ok ? pass++ : fail++;
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* A pristine copy per arm, UNIQUELY NAMED, with its size floored. Two harnesses in this
   project once reported a restore byte-identical over an EMPTY manifest, caught only because
   a digest read `e3b0c442…`, the sha256 of the empty string. */
mkdirSync(PEN, { recursive: true });
const pristine = new Map();
const keep = (arm, file) => {
  const dst = join(PEN, `${arm}.${file.split("/").pop()}.pristine`);
  const bytes = readFileSync(file);
  if (bytes.length < 400) throw new Error(`REFUSING to keep a ${bytes.length}-byte pristine of ${file}`);
  writeFileSync(dst, bytes);
  pristine.set(arm + file, { dst, sha: sha(file), bytes: bytes.length });
  return dst;
};
const restore = (arm, file) => {
  const p = pristine.get(arm + file);
  writeFileSync(file, readFileSync(p.dst));
  const back = sha(file), size = statSync(file).size;
  const cmp = spawnSync("cmp", ["-s", file, p.dst]).status === 0;
  const ok = back === p.sha && cmp && size === p.bytes;
  console.log(`         restore ${file.replace(REPO, ".")}: ${ok ? "byte-identical" : "NOT RESTORED"}`
    + ` (${size} B, sha ${back.slice(0, 12)}, cmp ${cmp ? "same" : "DIFFERS"})`);
  if (!ok) { console.log("         ABORTING — a control that does not restore has damaged the tree."); process.exit(2); }
};

const plancheck = (local = true) => {
  const r = spawnSync(process.execPath, [PLANCHECK, ...(local ? ["--local"] : [])],
    { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return { status: r.status, out: (r.stdout || "") + (r.stderr || "") };
};
/* The delegation arm's own lines, isolated from the rest of plancheck's report, so an
   assertion about THIS arm cannot be satisfied by another arm's noise. */
const named = (out) => [...out.matchAll(/CLAIMS\.md:(\d+)/g)].map((m) => Number(m[1])).sort((a, b) => a - b);
const otherArms = (out) => out.split("\n")
  .filter((l) => /^\s{2}note\s/.test(l) && !/delegation (register|cohort|git arm|perennials)/.test(l))
  .join("\n");

console.log("M0-37 control — the DELEGATION register states its own state, dated.\n");

/* ---------------------------------------------------------------- BASELINE */
const B = plancheck();
const BASE_NAMED = named(B.out);
const BASE_OTHER = otherArms(B.out);
const BASE_CORPUS = (B.out.match(/delegation register: (\d+) DELEGATION block\(s\)/) || [])[1];
console.log(`  BASELINE  plancheck --local exit ${B.status} · corpus ${BASE_CORPUS} block(s) · `
  + `${BASE_NAMED.length} block(s) named`);
t("BASELINE: plancheck --local passes on the tree as it stands", B.status, 0);
t("BASELINE: the register walk is non-empty (an arm over an empty corpus proves nothing)",
  Number(BASE_CORPUS) >= 40, true);
t("BASELINE: no block is named as failing", BASE_NAMED, []);

/* Pick the live subjects from the register itself rather than from a hand-written line
   number, which goes stale the moment a block is appended above it. */
const { delegationAudit } = await import("../../tools/delegations.mjs");
const LIVE = delegationAudit({ repo: REPO, git: false });
const openBlock = LIVE.affirmed[0];
const dischargedBlock = LIVE.discharged[0];
if (!openBlock || !dischargedBlock) {
  console.log("\n  ABORT — the harness needs at least one affirmed-open and one discharged block\n"
    + `         and found ${LIVE.affirmed.length} / ${LIVE.discharged.length}. That is a finding about\n`
    + "         the register, not about this driver: state it rather than skipping the arms.");
  process.exit(2);
}
console.log(`  subjects: open block CLAIMS.md:${openBlock.line} (affirm line ${openBlock.newest.at}), `
  + `discharged block CLAIMS.md:${dischargedBlock.line}\n`);

/* ---------------------------------------------- A1 · the date is READ, not merely present */
{
  keep("A1", CLAIMS);
  const lines = readFileSync(CLAIMS, "utf8").split("\n");
  const i = openBlock.newest.at - 1;
  const before = lines[i];
  lines[i] = before.replace(/20\d\d-\d\d-\d\d/, "2026-01-01");
  if (lines[i] === before) { console.log("  A1 DID NOT ARM — no date replaced."); fail++; }
  writeFileSync(CLAIMS, lines.join("\n"));
  const r = plancheck();
  t("A1 · an `open as of` rolled back past the threshold FAILS", r.status, 1);
  /* DECLARED PRECISELY RATHER THAN LOOSENED AFTER THE FACT. The first writing of this arm
     expected the block's line alone and got [157, 161] — because the STALE message names the
     BLOCK and, deliberately, the AFFIRMING LINE a reader has to go and rewrite. That is the
     message doing its job, and the arm was wrong about what it was measuring. The expectation
     is corrected to the exact pair rather than relaxed to a substring, because an arm that
     names the wrong element is an arm that did not arm. */
  t("A1 · it is named as STALE, and the ONLY lines named are that block and its affirming line",
    [/STALE/.test(r.out), named(r.out)],
    [true, [openBlock.line, openBlock.newest.at].sort((a, b) => a - b)]);
  restore("A1", CLAIMS);
}

/* --------------------- A2 · THE ARM THIS ROW EXISTS FOR — the register cannot self-satisfy */
{
  keep("A2", CLAIMS);
  const lines = readFileSync(CLAIMS, "utf8").split("\n");
  const at = dischargedBlock.discharges.find((d) => d.date).at - 1;
  const removed = lines[at];
  lines.splice(at, 1);
  writeFileSync(CLAIMS, lines.join("\n"));
  const r = plancheck();
  t("A2 · a DISCHARGED line deleted from a block the TREE has discharged still FAILS", r.status, 1);
  t("A2 · it is named as SILENT — the check grades the register's STATEMENT, and a delegation\n"
  + "       closed in the world but silent in the register has communicated nothing",
    [/SILENT/.test(r.out), named(r.out).includes(dischargedBlock.line)], [true, true]);
  t("A2 · the deleted line was a real discharge and not an empty pick",
    /DISCHARGED/.test(removed || ""), true);
  restore("A2", CLAIMS);
}

/* ------------------------------------------------------------- A3 · OVER-STRICTNESS */
{
  /* Nothing is armed. The assertion is that the untouched neighbours are untouched, and that
     every OTHER arm of plancheck prints byte-identically — an arm that also perturbs a second
     variable produces a refutation more confident than the finding it refutes. */
  const r = plancheck();
  const src = readFileSync(CLAIMS, "utf8");
  const claims = (src.match(/^## CLAIM /gm) || []).length;
  const amendments = (src.match(/^### AMENDMENT /gm) || []).length;
  /* THE THREE BLOCK TYPES M0-37's ROW NAMED, and `DESIGN GAP` is here because the row named
     it and the first writing of this arm covered only the other two — a control that checks
     two of three declared subjects is a control that did not fully arm. */
  const designGaps = (src.match(/^## DESIGN GAP /gm) || []).length;
  t("A3 · CLAIM, AMENDMENT and DESIGN GAP blocks exist in quantity and NONE is judged",
    [claims >= 100, amendments >= 20, designGaps >= 4, named(r.out)], [true, true, true, []]);
  t("A3 · a DISCHARGED delegation, however old, is not named",
    named(r.out).includes(dischargedBlock.line), false);
  t("A3 · plancheck's OTHER arms print byte-identically to the baseline",
    otherArms(r.out) === BASE_OTHER, true);
  t("A3 · and the tree is byte-identical to where the baseline measured it",
    sha(CLAIMS), pristine.get("A1" + CLAIMS).sha);
}

/* ----------------------------------------------- A4 · the mechanism is IN THE LOOP */
{
  keep("A4", PLANCHECK);
  const src = readFileSync(PLANCHECK, "utf8");
  const ANCHOR = "8. A DELEGATION STATES ITS OWN STATE, DATED";
  const hits = src.split(ANCHOR).length - 1;
  t("A4 · the section anchor is UNIQUE before arming (an anchor occurring twice is how an arm\n"
  + "       mutates a comment and reads green)", hits, 1);
  const cut = src.replace(
    /\/\* -+ 8\. A DELEGATION STATES ITS OWN STATE, DATED[\s\S]*?\n\/\* -+ report/,
    "/* ------------------------------------------------------------- report");
  t("A4 · the excision changed the file", cut !== src, true);
  writeFileSync(PLANCHECK, cut);
  const r = spawnSync(process.execPath, [SUITE], { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = (r.stdout || "") + (r.stderr || "");
  t("A4 · with section 8 gone, the SUITE fails by name",
    /FAIL\s+plancheck RUNS the delegation-register check/.test(out), true);
  restore("A4", PLANCHECK);
}

/* ------------------------------------- A5 · an unloadable predicate is a FAIL, not a warn */
{
  keep("A5", MODULE);
  /* Injected as a syntax error into a file RESTORED FROM A COPY — never by renaming and never
     by chmod. Both of those dirty the tree, and a bare plancheck then fails on UNPUBLISHED
     with a NAMED failure while the subject is never exercised. `--local` skips that half. */
  writeFileSync(MODULE, readFileSync(MODULE, "utf8") + "\nexport const ((( = 1;\n");
  const r = plancheck();
  t("A5 · an unloadable predicate module FAILS rather than degrading to a warn", r.status, 1);
  t("A5 · and it says UNVERIFIED rather than reporting a clean register",
    /COULD NOT BE LOADED[\s\S]*UNVERIFIED/.test(r.out), true);
  t("A5 · the run does NOT report a delegation corpus figure it cannot have measured",
    /delegation register: \d+ DELEGATION/.test(r.out), false);
  restore("A5", MODULE);
}

/* ---------------- A6 · FORGERY. Declared to PASS. Its red would be the finding. */
{
  keep("A6", CLAIMS);
  /* THE ARM'S FIRST WRITING DID NOT ARM, AND WHY IS WORTH KEEPING. It stamped today's date
     onto lines that already carried today's date, so `stamped` was 0 and the "forgery" was a
     no-op — the honest register and the forged one were byte-identical, which is the arm's
     own thesis arriving as a bug in the arm. Corrected to drive the round trip: first make
     every affirmation STALE and confirm the gate FAILS, then defeat it with one blanket
     re-date and confirm the gate PASSES over a register nobody read. */
  const OLD = "2026-01-01";
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const restamp = (to) => {
    const lines = readFileSync(CLAIMS, "utf8").split("\n");
    let n = 0;
    for (const b of LIVE.affirmed) for (const a of b.affirms) {
      const i = a.at - 1, next = lines[i].replace(/20\d\d-\d\d-\d\d/, to);
      if (next !== lines[i]) { lines[i] = next; n++; }
    }
    writeFileSync(CLAIMS, lines.join("\n"));
    return n;
  };
  const aged = restamp(OLD);
  const red = plancheck();
  t("A6 · the arm ARMED — every affirmation aged, and the gate goes RED over the whole register",
    [aged, red.status, (red.out.match(/STALE/g) || []).length >= aged], [LIVE.affirmed.length, 1, true]);
  const stamped = restamp(iso);
  const r = plancheck();
  t("A6 · one blanket re-date, reading nothing, restores every block it aged", stamped, aged);
  t("A6 · **DECLARED TO PASS** — a blanket stamp defeats the staleness arm, exactly as the\n"
  + "       module's header says it does. This red would be the finding, not the green.",
    r.status, 0);
  t("A6 · what a reader gets instead is the COHORT, printed on the run",
    new RegExp(`delegation cohort: \\d+ of \\d+ open block\\(s\\) were affirmed on ${iso}`).test(r.out), true);
  restore("A6", CLAIMS);
}

/* ------------------------------------------------------------------- close */
const F = plancheck();
t("CLOSE: the tree is back where the baseline found it — plancheck --local exit 0, no block named",
  [F.status, named(F.out)], [0, []]);
t("CLOSE: CLAIMS.md, plancheck.mjs and delegations.mjs are byte-identical to their pristines",
  [sha(CLAIMS) === pristine.get("A1" + CLAIMS).sha,
   sha(PLANCHECK) === pristine.get("A4" + PLANCHECK).sha,
   sha(MODULE) === pristine.get("A5" + MODULE).sha], [true, true, true]);

rmSync(PEN, { recursive: true, force: true });
console.log(`\nm037-control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
