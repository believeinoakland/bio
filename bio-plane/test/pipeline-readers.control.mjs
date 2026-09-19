#!/usr/bin/env node
/* D-430's NEGATIVE CONTROL DRIVER — a baseline, the plant, and four arms over the plan's row readers
 * (`tools/rowdesign.mjs`, `plancheck` §2's milestone/interface checks) and their suite
 * `bio-plane/test/pipeline-readers.test.mjs`.
 *
 *   node bio-plane/test/pipeline-readers.control.mjs        (from the repo root)
 *
 * NOTHING IN THIS WORKTREE IS ARMED. Every arm runs in a SCRATCH `git worktree` (a fresh `mkdtemp`
 * under the OS temp dir, detached at HEAD, with this tree's modified and untracked files copied over
 * it), because the plant is a row in `BACKLOG.md` and a planted row must never touch the live one.
 * Each armed file is restored from a uniquely-named pristine copy taken ONCE, verified by sha256 AND
 * `cmp` AND a floored byte count, before the next arm; the scratch worktree is removed at the end.
 *
 * Declared before arming — what MUST fail and what MUST NOT:
 *   BASELINE  nothing planted                      -> plancheck names no ZZ row; the suite is green.
 *   PLANT     ZZ-41..ZZ-45 planted in BACKLOG.md   -> plancheck FAILS naming ZZ-41 (no design), ZZ-42
 *                                                     (M99), ZZ-43 (I99), WARNS naming ZZ-44 (state
 *                                                     `pending`), and names ZZ-45 (correct) NOWHERE;
 *                                                     the suite FAILS at its live arms, by name.
 *   NC1       rowdesign's reader reverted to QUEUE-only, plant in place
 *                                                  -> THE DECLARED CONTROL: the planted ZZ-41 PASSES
 *                                                     plancheck, and the suite FAILS naming it
 *                                                     ("a BACKLOG row naming no design FAILS by name").
 *   NC2       plancheck §2's field checks reverted to QUEUE-only, plant in place
 *                                                  -> ZZ-42 and ZZ-43 PASS plancheck; the suite FAILS
 *                                                     by name ("plancheck's milestone and interface
 *                                                     checks read every row the lister reads").
 *   NC3       THE LIAR: rowdesign reads QUEUE.md and BACKLOG.md with a COPY of the grammar, plant in place
 *                                                  -> declared to PASS behaviourally (plancheck still
 *                                                     names ZZ-41) and FAIL structurally: the suite's
 *                                                     section 6 names the copy.
 *   NC4       OVER-STRICTNESS: only the correct row ZZ-45 planted
 *                                                  -> plancheck names no ZZ row; the suite's fixture and
 *                                                     structural arms stay green.
 *
 * M0-73 — D-430's two same-class readers, added 2026-09-19 (a second plant, four more arms):
 *   M0-73 PLANT  ZZ-60 and ZZ-61 (blocked, Routed to BOB; ZZ-61 spaced `  ·  `) and a correct ZZ-63 citing
 *                DEC-4242, IC-4243 and M-424, in the scratch BACKLOG.md
 *                                                  -> `owed.mjs BOB` lists ZZ-60 and ZZ-61; `mintid --list`
 *                                                     reads DEC 4242, IC 4243, M 424; the suite is GREEN
 *                                                     (the plant is correct work — over-strictness).
 *   NC5       owed.mjs's OWN pre-M0-73 walk restored, plant in place
 *                                                  -> declared: the plain ZZ-60 STILL appears (the old walk
 *                                                     already read the backlog — LED-6 put it there), the
 *                                                     spaced ZZ-61 is LOST; the suite FAILS naming "owed's
 *                                                     blocked rows ARE the lister's" and §6's owed grammar arm.
 *   NC6a/b/c  mintid's DEC / IC / M corpus without BACKLOG.md, each ALONE, plant in place
 *                                                  -> that namespace's floor falls back to the live one, the
 *                                                     other two keep the plant's; the suite FAILS naming
 *                                                     "<NS>: an id mentioned ONLY in BACKLOG.md raises the
 *                                                     floor" and THE CLASS arm.
 */
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, copyFileSync, statSync, existsSync, realpathSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const git = (args, cwd = REPO) => spawnSync("git", args, { cwd, encoding: "utf8" });
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* ------------------------------------------------------------------ the scratch worktree */
const WT = mkdtempSync(join(tmpdir(), "d430-control-"));
const add = git(["worktree", "add", "--detach", WT, "HEAD"]);
if (add.status !== 0) { console.error(`could not add the scratch worktree: ${add.stderr}`); process.exit(2); }
/* This tree's work over it: modified and untracked (not ignored) files, copied as they stand. */
const changed = git(["ls-files", "-m", "-o", "--exclude-standard"]).stdout.split("\n").filter(Boolean);
for (const f of changed) {
  if (!existsSync(join(REPO, f))) continue;
  mkdirSync(dirname(join(WT, f)), { recursive: true });
  copyFileSync(join(REPO, f), join(WT, f));
}
console.log(`  scratch worktree ${WT} at HEAD, ${changed.length} working file(s) overlaid: ${changed.join(", ") || "none"}`);

const W = (p) => join(WT, p);
const BACKLOG = W("docs/development/BACKLOG.md"), ROWDESIGN = W("tools/rowdesign.mjs"), PLANCHECK = W("tools/plancheck.mjs");
const OWED = W("tools/owed.mjs"), MINTID = W("tools/mintid.mjs");
const MIN_BYTES = { [BACKLOG]: 200, [ROWDESIGN]: 8000, [PLANCHECK]: 30000, [OWED]: 8000, [MINTID]: 40000 };
const PEN = mkdtempSync(join(tmpdir(), "d430-pen-"));
const pristine = new Map();
for (const [name, p] of [["backlog", BACKLOG], ["rowdesign", ROWDESIGN], ["plancheck", PLANCHECK], ["owed", OWED], ["mintid", MINTID]]) {
  const copy = join(PEN, `pristine.d430.${name}`);
  copyFileSync(p, copy);
  pristine.set(p, { copy, sha: sha(p), bytes: statSync(p).size });
  console.log(`  pristine ${name}: ${statSync(p).size} bytes, sha256 ${sha(p).slice(0, 8)}…`);
}
function restore(p) {
  const { copy, sha: want, bytes } = pristine.get(p);
  copyFileSync(copy, p);
  const got = sha(p), size = statSync(p).size;
  const cmp = spawnSync("cmp", ["-s", p, copy]).status === 0;
  const ok = got === want && cmp && size === bytes && size >= MIN_BYTES[p];
  console.log(`  restored ${p.slice(WT.length + 1)}: ${size} bytes, sha256 ${got.slice(0, 8)}…, cmp ${cmp ? "identical" : "DIFFERS"} — byte-identical: ${ok ? "YES" : "NO"}`);
  return ok;
}
/* Replace ONE anchor, which must occur exactly once — an arm that did not arm is a finding. */
function arm(p, anchor, replacement) {
  const before = readFileSync(p, "utf8");
  const n = before.split(anchor).length - 1;
  t(`the arm ARMED (${p.slice(WT.length + 1)}: anchor found exactly once)`, n, 1);
  writeFileSync(p, before.replace(anchor, replacement));
}

const PLANT = [
  ``,
  `### ZZ-41 · queued — planted: names NO design`, `milestone: M8`, `interface: none`, ``,
  `### ZZ-42 · queued — planted: an UNKNOWN milestone`, `milestone: M99`,
  `design: \`docs/architecture/BIO_System_Design.md\` §3`, ``,
  `### ZZ-43 · queued — planted: an UNREGISTERED interface`, `milestone: M8`, `behind-interface: I99`,
  `design: \`docs/architecture/BIO_System_Design.md\` §3`, ``,
  `### ZZ-44 · pending — planted: an UNKNOWN state`, `milestone: M8`,
  `design: \`docs/architecture/BIO_System_Design.md\` §3`, ``,
].join("\n");
const CORRECT = [
  ``, `### ZZ-45 · queued — planted: CORRECT in every field`, `milestone: M8`, `behind-interface: I3`,
  `design: \`docs/architecture/BIO_System_Design.md\` §3`, ``,
].join("\n");
const plant = (text) => writeFileSync(BACKLOG, readFileSync(BACKLOG, "utf8") + text);

const plancheck = () => {
  const r = spawnSync(process.execPath, [PLANCHECK, "--local"], { cwd: WT, encoding: "utf8" });
  const out = r.stdout || "";
  /* One ENTRY is a `  FAIL  ` / `  WARN  ` line and its indented continuation. Notes are not verdicts
     (§2e's substrate note may ask a question about any row), so only FAIL and WARN entries count. */
  const entries = out.split(/\n(?=  (?:note|WARN|FAIL)  )/).filter((e) => /^\s*(?:WARN|FAIL)  /.test(e));
  const block = (head) => entries.filter((e) => e.includes(head)).join("\n");
  const ids = (s) => [...new Set(s.match(/\bZZ-4\d\b/g) || [])].sort();
  return { out, noDesign: ids(block("ROW NAMES NO DESIGN")), milestone: ids(block("UNKNOWN MILESTONE")),
           iface: ids(block("UNREGISTERED INTERFACE")), state: ids(block("UNKNOWN ROW STATE")),
           any: ids(entries.join("\n")) };
};
const suite = () => {
  const r = spawnSync(process.execPath, [W("bio-plane/test/pipeline-readers.test.mjs")], { cwd: WT, encoding: "utf8" });
  const out = r.stdout || "";
  const tally = out.match(/pipeline-readers: (\d+) pass, (\d+) fail/);
  const failed = [...out.matchAll(/^\s+FAIL\s+(.+)$/gm)].map((m) => m[1]);
  return { out, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1, reachedFoot: !!tally, failed };
};
const failedNaming = (s, re) => s.failed.some((l) => re.test(l));

try {
  console.log("\n--- BASELINE · nothing planted ---");
  {
    const p = plancheck();
    t("baseline · plancheck names no ZZ row", p.any, []);
    const s = suite();
    t("baseline · the suite reached its own FOOT", s.reachedFoot, true);
    t("baseline · the suite is green", [s.pass > 30, s.fail], [true, 0]);
    console.log(`  baseline suite: ${s.pass} pass, ${s.fail} fail`);
  }

  console.log("\n--- PLANT · ZZ-41..ZZ-44 planted in the scratch BACKLOG.md ---");
  {
    plant(PLANT + CORRECT);
    const p = plancheck();
    t("PLANT · ROW NAMES NO DESIGN names ZZ-41, and only it", p.noDesign, ["ZZ-41"]);
    t("PLANT · UNKNOWN MILESTONE names ZZ-42", p.milestone, ["ZZ-42"]);
    t("PLANT · UNREGISTERED INTERFACE names ZZ-43", p.iface, ["ZZ-43"]);
    t("PLANT · UNKNOWN ROW STATE names ZZ-44", p.state, ["ZZ-44"]);
    t("PLANT · the correct ZZ-45 is named NOWHERE (over-strictness)", p.any.includes("ZZ-45"), false);
    t("PLANT · the failures name BACKLOG.md", /ZZ-41 \(queued, BACKLOG\.md:\d+\)/.test(p.out), true);
    const s = suite();
    t("PLANT · the suite FAILS at its live arm naming the planted row",
      [s.reachedFoot, failedNaming(s, /every live row, cache and backlog, names a design/), /ZZ-41 \(docs\/development\/BACKLOG\.md/.test(s.out)],
      [true, true, true]);
    console.log(`  planted suite: ${s.pass} pass, ${s.fail} fail`);
    /* The plant stays for NC1–NC3; the backlog is restored after NC3. */
  }

  console.log("\n--- NC1 · rowdesign's reader reverted to QUEUE-only (plant in place; armed ALONE) ---");
  {
    arm(ROWDESIGN, "const rows = p.rows.map(asRow);", "const rows = p.rows.filter((r) => r.where === \"cache\").map(asRow);");
    const p = plancheck();
    t("NC1 · the planted ZZ-41 PASSES plancheck (no design finding names it)", p.noDesign, []);
    const s = suite();
    t("NC1 · the suite FAILS naming it — \"a BACKLOG row naming no design FAILS by name\"",
      [s.reachedFoot, failedNaming(s, /a BACKLOG row naming no design FAILS by name/)], [true, true]);
    console.log(`  NC1 suite: ${s.pass} pass, ${s.fail} fail — failed: ${s.failed.map((l) => l.slice(0, 70)).join(" | ")}`);
    t("NC1 · RESTORED byte-identically", restore(ROWDESIGN), true);
  }

  console.log("\n--- NC2 · plancheck §2's field checks reverted to QUEUE-only (plant in place; armed ALONE) ---");
  {
    arm(PLANCHECK, "planFieldAudit(plan.rows,", "planFieldAudit(plan.rows.filter((r) => r.where === \"cache\"),");
    const p = plancheck();
    t("NC2 · the planted ZZ-42 and ZZ-43 PASS plancheck", [p.milestone, p.iface], [[], []]);
    const s = suite();
    t("NC2 · the suite FAILS by name — plancheck's field checks do not read every row",
      [s.reachedFoot, failedNaming(s, /plancheck's milestone and interface checks read every row the lister reads/)], [true, true]);
    console.log(`  NC2 suite: ${s.pass} pass, ${s.fail} fail`);
    t("NC2 · RESTORED byte-identically", restore(PLANCHECK), true);
  }

  console.log("\n--- NC3 · THE LIAR: a COPY of the QUEUE reader pointed at the backlog (plant in place; armed ALONE) ---");
  {
    const LIAR = [
      "const p = (() => {",
      "    const fs = process.getBuiltinModule(\"node:fs\");",
      "    const rows = [];",
      "    for (const [file, where] of [[\"docs/development/QUEUE.md\", \"cache\"], [\"docs/development/BACKLOG.md\", \"backlog\"]]) {",
      "      const text = texts ? (texts[where === \"cache\" ? \"QUEUE\" : \"BACKLOG\"] ?? \"\") : fs.readFileSync(join(repo, file), \"utf8\");",
      "      const lines = text.split(\"\\n\");",
      "      lines.forEach((l, i) => {",
      "        const m = /^###\\s+([A-Z][A-Z0-9]*-\\d+)\\s+·\\s+([A-Za-z-]+)/.exec(l);",
      "        if (!m) return;",
      "        let end = i + 1; while (end < lines.length && !/^#{1,3}\\s/.test(lines[end])) end++;",
      "        rows.push({ id: m[1], state: m[2], start: i, line: i + 1, body: lines.slice(i, end).join(\"\\n\"), file, where });",
      "      });",
      "    }",
      "    return { rows, strays: [], unreadable: [], cacheRows: rows.filter((r) => r.where === \"cache\").length, backlogRows: rows.filter((r) => r.where === \"backlog\").length };",
      "  })();",
    ].join("\n");
    arm(ROWDESIGN, "const p = pipelineRows({ repo, texts });", LIAR);
    const p = plancheck();
    t("NC3 · declared to PASS behaviourally: plancheck still names the planted ZZ-41", p.noDesign, ["ZZ-41"]);
    const s = suite();
    t("NC3 · the suite's behavioural arms for the backlog still pass (the liar agrees today)",
      failedNaming(s, /a BACKLOG row naming no design FAILS by name/), false);
    t("NC3 · and the STRUCTURAL arm names the copy",
      [s.reachedFoot, failedNaming(s, /rowdesign\.mjs carries NO row-heading grammar of its own/),
       failedNaming(s, /rowdesign\.mjs names NO ledger file to read/)], [true, true, true]);
    console.log(`  NC3 suite: ${s.pass} pass, ${s.fail} fail`);
    t("NC3 · RESTORED byte-identically", restore(ROWDESIGN), true);
    t("the planted BACKLOG.md RESTORED byte-identically", restore(BACKLOG), true);
  }

  console.log("\n--- NC4 · OVER-STRICTNESS: only the correct ZZ-45 planted ---");
  {
    plant(CORRECT);
    const p = plancheck();
    t("NC4 · plancheck names no ZZ row", p.any, []);
    const s = suite();
    t("NC4 · the suite is green with a correct backlog row in the plan", [s.reachedFoot, s.fail], [true, 0]);
    console.log(`  NC4 suite: ${s.pass} pass, ${s.fail} fail`);
    t("NC4 · RESTORED byte-identically", restore(BACKLOG), true);
  }

  /* ------------------------------------------------ M0-73: D-430's two same-class readers, on disk */
  const M073 = [
    ``,
    `### ZZ-60 · blocked — planted: waits on a design ruling. Routed to BOB.`, `milestone: M8`, ``,
    `### ZZ-61  ·  blocked — planted: spaced as the lister reads it. Routed to BOB.`, `milestone: M8`, ``,
    `### ZZ-63 · queued — planted: CORRECT, and cites DEC-4242, IC-4243 and M-424 nowhere else`, `milestone: M8`,
    `behind-interface: I3`, `design: \`docs/architecture/BIO_System_Design.md\` §3`, ``,
  ].join("\n");
  const owedIds = () => {
    const r = spawnSync(process.execPath, [OWED, "BOB"], { cwd: WT, encoding: "utf8" });
    return [...new Set([...(r.stdout || "").matchAll(/\b(?:QUEUE|BACKLOG) (ZZ-6\d)\b/g)].map((m) => m[1]))].sort();
  };
  const floors = () => {
    /* BY REALPATH, AND THE FIRST RUN IS WHY: the OS temp dir is a symlink on macOS (`/var` -> `/private/var`),
       and mintid's main-guard compares `resolve(argv[1])` with `import.meta.url`, which node realpaths — so
       spawned through the link it ran NOTHING and exited 0, and this parser read `{}` (M0-73, 2026-09-19). */
    const r = spawnSync(process.execPath, [realpathSync(MINTID), "--list", "DEC", "IC", "M"], { cwd: WT, encoding: "utf8" });
    if (!/^\s+DEC\s+floor/m.test(r.stdout || "")) console.log(`  mintid --list printed no DEC floor (exit ${r.status}): ${(r.stdout + r.stderr).slice(0, 300)}`);
    return Object.fromEntries([...(r.stdout || "").matchAll(/^\s+(DEC|IC|M)\s+floor (\d+)/gm)].map((m) => [m[1], +m[2]]));
  };
  /* Replace the span between two markers, each of which must occur exactly once. */
  function armSpan(p, open, close, replacement) {
    const s = readFileSync(p, "utf8");
    const n = [s.split(open).length - 1, s.split(close).length - 1];
    t(`the arm ARMED (${p.slice(WT.length + 1)}: both span markers found exactly once)`, n, [1, 1]);
    const a = s.indexOf(open), b = s.indexOf(close) + close.length;
    writeFileSync(p, s.slice(0, a) + replacement + s.slice(b));
  }
  const suiteFailed = (re) => { const s = suite(); return { s, hit: s.reachedFoot && failedNaming(s, re) }; };

  let liveFloors;
  console.log("\n--- M0-73 PLANT · ZZ-60, ZZ-61 (blocked, routed to BOB) and ZZ-63 (cites DEC/IC/M) in the scratch BACKLOG.md ---");
  {
    liveFloors = floors();
    console.log(`  floors before the plant: ${JSON.stringify(liveFloors)}`);
    t("M0-73 · the live floors were READ (three namespaces)", Object.keys(liveFloors).sort(), ["DEC", "IC", "M"]);
    t("M0-73 · nothing planted: owed names no ZZ row", owedIds(), []);
    plant(M073);
    t("M0-73 PLANT · `owed.mjs BOB` lists BOTH planted blocked rows", owedIds(), ["ZZ-60", "ZZ-61"]);
    t("M0-73 PLANT · `mintid --list` raises DEC, IC and M to the backlog-only ids", floors(), { DEC: 4242, IC: 4243, M: 424 });
    const s = suite();
    t("M0-73 PLANT · the suite stays green with the plant in place (the plant is correct work)", [s.reachedFoot, s.fail], [true, 0]);
    console.log(`  M0-73 planted suite: ${s.pass} pass, ${s.fail} fail`);
  }

  console.log("\n--- NC5 · owed.mjs's OWN walk restored (the pre-M0-73 reader; plant in place; armed ALONE) ---");
  {
    const OLD = [
      "  for (const [src, label] of [[SOURCES.queue, \"QUEUE\"], [SOURCES.backlog, \"BACKLOG\"]]) {",
      "    const q = read(src);",
      "    if (q === null) unreadable.push(src);",
      "    else for (const m of q.matchAll(/^### ([A-Z0-9-]+) · blocked(.*)$/gm))",
      "      if (owner.test(m[2])) items.push({ source: label, id: m[1], attributed: true,",
      "                                         why: `blocked on ${lane}`, text: m[2].trim().slice(0, 160) });",
      "  }",
      "",
    ].join("\n");
    armSpan(OWED, "  /* M0-73 BLOCKED-ROWS", "  /* END M0-73 BLOCKED-ROWS */\n", OLD);
    const got = owedIds();
    t("NC5 · on disk the plain ZZ-60 still appears (the old walk read the backlog too) and the spaced ZZ-61 is LOST",
      got, ["ZZ-60"]);
    const { s, hit } = suiteFailed(/owed's blocked rows ARE the lister's/);
    t("NC5 · the suite FAILS naming it — \"owed's blocked rows ARE the lister's\"", hit, true);
    t("NC5 · ...and §6 names the grammar the old walk carries", failedNaming(s, /owed\.mjs carries NO plan-row heading grammar/), true);
    console.log(`  NC5 suite: ${s.pass} pass, ${s.fail} fail — failed: ${s.failed.map((l) => l.slice(0, 60)).join(" | ")}`);
    t("NC5 · RESTORED byte-identically", restore(OWED), true);
  }

  for (const [nc, ns, file] of [["NC6a", "DEC", "DECISIONS.md"], ["NC6b", "IC", "INTERFACE-CHANGES.md"], ["NC6c", "M", "MEASUREMENTS.md"]]) {
    console.log(`\n--- ${nc} · mintid's ${ns} corpus without BACKLOG.md (plant in place; armed ALONE) ---`);
    const q = `"docs/development/${file}", "docs/development/QUEUE.md"`;
    arm(MINTID, `${q}, "docs/development/BACKLOG.md"]`, `${q}]`);
    const f = floors();
    t(`${nc} · on disk the ${ns} floor FALLS back to the live one — the backlog-only id sets no floor`,
      f[ns], liveFloors[ns]);
    t(`${nc} · ...and the other two namespaces keep the planted floor (the arm moved one variable)`,
      Object.entries(f).filter(([k]) => k !== ns).map(([, v]) => v > 400), [true, true]);
    const { s, hit } = suiteFailed(new RegExp(`^${ns}: an id mentioned ONLY in BACKLOG\\.md raises the floor`));
    t(`${nc} · the suite FAILS naming it — "${ns}: an id mentioned ONLY in BACKLOG.md raises the floor"`, hit, true);
    t(`${nc} · ...and THE CLASS arm names it`, failedNaming(s, /THE CLASS: no mintid corpus names the cache without the backlog/), true);
    console.log(`  ${nc} suite: ${s.pass} pass, ${s.fail} fail`);
    t(`${nc} · RESTORED byte-identically`, restore(MINTID), true);
  }
  t("the M0-73 planted BACKLOG.md RESTORED byte-identically", restore(BACKLOG), true);

  console.log("\n--- every armed file, after every arm ---");
  for (const [p, { sha: want }] of pristine) t(`${p.slice(WT.length + 1)} is pristine at the end`, sha(p), want);
} finally {
  const rm = git(["worktree", "remove", "--force", WT]);
  console.log(`  scratch worktree removed: ${rm.status === 0 ? "yes" : `NO — ${rm.stderr.trim()}`}`);
  if (!fail) for (const { copy } of pristine.values()) spawnSync("rm", ["-f", copy]);
  console.log(fail ? `  pristine copies KEPT in ${PEN} — a red run's copies are evidence` : `  pristine copies removed`);
}

console.log(`\npipeline-readers.control: ${pass} pass, ${fail} fail  (a baseline, two plants, eight arms; ${pass + fail} checks)`);
process.exit(fail ? 1 : 0);
