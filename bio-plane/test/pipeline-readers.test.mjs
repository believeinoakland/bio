/* pipeline-readers — D-430: every checker of the plan's rows reads cache ∪ backlog, through ONE lister.
 *
 * NEGATIVE CONTROL: (D-430, run 2026-09-18, worktree agent-ae83cc9dbe0276399) driven by
 * `node bio-plane/test/pipeline-readers.control.mjs` from the repo root — COMMITTED, so it re-runs in one
 * step. **30 of 30 checks as declared, FIRST RUN, a baseline, the plant and four arms**, all in a SCRATCH
 * `git worktree` (the live BACKLOG.md is never planted), each arm ALONE, every restore verified by sha256
 * AND `cmp` AND a floored byte count. BASELINE: plancheck names no ZZ row; this suite 36 pass 0 fail.
 * PLANT (ZZ-41..45 in the scratch BACKLOG.md): plancheck FAILS naming ZZ-41 (ROW NAMES NO DESIGN, as
 * `BACKLOG.md:<line>`), ZZ-42 (UNKNOWN MILESTONE), ZZ-43 (UNREGISTERED INTERFACE), WARNS naming ZZ-44
 * (UNKNOWN ROW STATE), names the correct ZZ-45 nowhere; this suite 33/3, its three live arms by name.
 * (NC1) THE DECLARED CONTROL — rowdesign's reader reverted to QUEUE-only -> the planted ZZ-41 PASSES
 * plancheck and this suite FAILS naming it ("a BACKLOG row naming no design FAILS by name"), 23/13.
 * (NC2) plancheck §2's field checks reverted to QUEUE-only -> ZZ-42 and ZZ-43 PASS plancheck; this suite
 * FAILS by name ("plancheck's milestone and interface checks read every row the lister reads"), 32/4.
 * (NC3) THE LIAR — a copy of the QUEUE reader pointed at the backlog -> DECLARED TO PASS behaviourally and
 * did (plancheck still names ZZ-41; the backlog fixture arms green), and §6 FAILS naming the copy (its
 * grammar, its ledger-file literal, its own read), 30/6 = the plant's three live arms + three structural.
 * (NC4) OVER-STRICTNESS — only the correct ZZ-45 planted -> plancheck names no ZZ row, this suite 36/0.
 * M0-73 (D-430's two same-class readers, §6's owed arms and §7) — RUN 2026-09-19 by the M0-73 worker, same
 * driver, **61 of 61 checks, exit 0**, baseline 49/0, NC1–NC4 re-run unchanged in effect. M0-73 PLANT (ZZ-60,
 * spaced ZZ-61, correct ZZ-63 citing DEC-4242/IC-4243/M-424 in the scratch BACKLOG.md): `owed.mjs BOB` lists
 * ZZ-60 and ZZ-61, `mintid --list` reads DEC 75 -> 4242, IC 159 -> 4243, M 65 -> 424, this suite 49/0.
 * (NC5) owed.mjs's own pre-M0-73 walk restored -> on disk ZZ-60 STILL listed (the old walk already read the
 * backlog) and ZZ-61 LOST; this suite FAILS naming "owed's blocked rows ARE the lister's" and §6's owed
 * grammar and import arms, 46/3.
 * (NC6a) mintid's DEC corpus without BACKLOG.md -> DEC floor 4242 -> 75; FAILS naming "DEC: an id mentioned
 * ONLY in BACKLOG.md raises the floor" and THE CLASS arm, 47/2.
 * (NC6b) the same for IC -> 4243 -> 159; FAILS naming "IC: …" and THE CLASS, 47/2.
 * (NC6c) the same for M -> 424 -> 65; FAILS naming "M: …" and THE CLASS, 47/2. Every restore byte-identical.
 *
 * THE DEFECT (DEBT D-430, found by LED-6's tool-half worker): `tools/rowdesign.mjs` and `plancheck` §2's
 * MILESTONE, INTERFACE and UNKNOWN-ROW-STATE checks read `QUEUE.md` only. WORK-PIPELINE §1–§2 make
 * `QUEUE.md` a cache of at most 8 rows and put everything else in `BACKLOG.md`, so once LED-6's step (4)
 * moves the open rows there, a backlog row naming no design, an unknown milestone, an unregistered
 * interface or an unknown state would pass every gate. The rules would still be written; nothing would
 * read them — the *mechanism not in the loop* shape.
 *
 * THE FIX: each reader takes its rows from `ledger.mjs`' `pipelineRows` — the lister the archiver, the
 * refill and the five invariants already use — and from nothing else. `tools/rowsubstrate.mjs` (§2e) is
 * the same reader one arm over and was pointed at it too (the class sweep).
 *
 * HOW A LIAR PASSES THE BEHAVIOURAL ARMS, and why section 6 exists: a COPY of the QUEUE reader pointed
 * at the backlog finds every planted row below exactly as the lister does — today. It drifts the day
 * either file's grammar moves, and nothing would say so. So section 6 asserts STRUCTURE: the readers
 * carry no row grammar and read no ledger file of their own, and their rows ARE the lister's rows.
 *
 * SECTION 7 (M0-73) is the same class one reader further: `tools/owed.mjs` read the plan's BLOCKED rows with
 * a heading grammar of its own, and `tools/mintid.mjs`' DEC, IC and M corpora read `QUEUE.md` but not
 * `BACKLOG.md`, so after LED-6's split an id mentioned only in the backlog would set no floor.
 *
 * The fixtures use the synthetic namespace `ZZ`, which allocates nothing (`mintid`'s corpora are
 * `docs/` files; this is not one). No row is ever written into the live `BACKLOG.md`: the planted rows
 * reach the readers through the lister's injectable `texts`, and the on-disk plant is the control
 * driver's, in a scratch worktree.
 */
import "./stdio.mjs";      /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";    /* D-186: the temp directory section 1 mints is owned and swept */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const { pipelineRows, strayHeadings, PIPELINE } = await import(join(REPO, "tools/ledger.mjs"));
const { rowDesignAudit, rowMessage, planRows, planFieldAudit } = await import(join(REPO, "tools/rowdesign.mjs"));
const { substrateAudit } = await import(join(REPO, "tools/rowsubstrate.mjs"));
const { owedFor, SOURCES } = await import(join(REPO, "tools/owed.mjs"));
const { corpusFloor, NAMESPACES } = await import(join(REPO, "tools/mintid.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const read = (p) => readFileSync(join(REPO, p), "utf8");
const MILESTONES = read("docs/development/MILESTONES.md");
const INTERFACES = read("docs/development/INTERFACES.md");
const BACKLOG_PATH = "docs/development/BACKLOG.md", QUEUE_PATH = "docs/development/QUEUE.md";

/* ----------------------------------------------------------------------------- fixtures */
const CACHE = [
  `# QUEUE — fixture`,
  ``,
  `### ZZ-40 · running — a cache row, correct in every field`,
  `milestone: M0 (fixture)`,
  `behind-interface: I3`,
  `design: \`docs/development/VERIFICATION.md\` §"The negative-control register"`,
  ``,
].join("\n");
const BACKLOG = [
  `# BACKLOG — fixture`,
  ``,
  `### ZZ-41 · queued — a backlog row naming NO design`,
  `milestone: M8`,
  `interface: none`,
  ``,
  `### ZZ-42 · queued — a backlog row naming an UNKNOWN milestone`,
  `milestone: M99`,
  `design: \`docs/architecture/BIO_System_Design.md\` §3`,
  ``,
  `### ZZ-43 · queued — a backlog row behind an UNREGISTERED interface`,
  `milestone: M8`,
  `behind-interface: I99`,
  `design: \`docs/architecture/BIO_System_Design.md\` §3`,
  ``,
  `### ZZ-44 · pending — a backlog row in an UNKNOWN state`,
  `milestone: M8`,
  `design: \`docs/architecture/BIO_System_Design.md\` §3`,
  ``,
  `### ZZ-45 · queued — a CORRECT backlog row: must pass every arm (over-strictness)`,
  `milestone: M8`,
  `behind-interface: I3`,
  `design: \`docs/architecture/BIO_System_Design.md\` §3`,
  ``,
  `### ZZ-46 · blocked — a blocked backlog row with no design: not judged, exactly as in the cache`,
  `milestone: M8`,
  ``,
].join("\n");
const lineOf = (text, id) => text.split("\n").findIndex((l) => l.startsWith(`### ${id} `)) + 1;
const verdicts = (a, f) => ({
  noDesign: a.findings.map((x) => x.id).sort(),
  unknownState: a.unknownState.map((x) => `${x.id} · ${x.state}`),
  skipped: a.skipped.map((x) => x.id),
  unknownMilestone: f.unknownMilestone.map((x) => `${x.id} ${x.milestone}`),
  unregistered: f.unregisteredInterface.map((x) => `${x.id} ${x.interface}`),
});
const judge = (queue, backlog) => {
  const a = rowDesignAudit({ queue, backlog });
  const f = planFieldAudit(planRows({ queue, backlog }).rows, { milestones: MILESTONES, interfaces: INTERFACES });
  return { a, f, v: verdicts(a, f) };
};

/* --------------------------------------------------------------------- 1. the lister */
console.log("\n--- 1. the ONE lister reads the cache AND the backlog ---");
{
  const p = pipelineRows({ texts: { QUEUE: CACHE, BACKLOG } });
  t("PIPELINE is the cache then the backlog, and nothing else",
    PIPELINE.map((l) => l.live), [QUEUE_PATH, BACKLOG_PATH]);
  t("every fixture row is read, each tagged with the file it is in",
    p.rows.map((r) => `${r.id}@${r.where}`),
    ["ZZ-40@cache", "ZZ-41@backlog", "ZZ-42@backlog", "ZZ-43@backlog", "ZZ-44@backlog", "ZZ-45@backlog", "ZZ-46@backlog"]);
  t("the counts are per file", [p.cacheRows, p.backlogRows], [1, 6]);
  const none = mkdtempSync(join(tmpdir(), "d430-empty-"));
  const u = pipelineRows({ repo: none });
  rmSync(none, { recursive: true, force: true });
  t("an UNREADABLE file is named, never read as an empty one", [u.unreadable, u.rows.length], [[QUEUE_PATH, BACKLOG_PATH], 0]);
  const s = strayHeadings("### ZZ-47b · queued — an id the grammar cannot read\nmilestone: M99\n\n### ZZ-48 · done\n");
  t("a ROW-SHAPED heading the grammar cannot read is NAMED (its fields reach no arm)",
    s.map((x) => [x.line, x.closed]), [[1, false]]);
}

/* ------------------------------------------------ 2. the row-design check (§4.7) */
console.log("\n--- 2. a backlog row naming no design FAILS by name ---");
const J = judge(CACHE, BACKLOG);
{
  t("a BACKLOG row naming no design FAILS by name, and it is the only one", J.v.noDesign, ["ZZ-41"]);
  t("the finding says which FILE the row is in", J.a.findings.map((f) => f.file), [BACKLOG_PATH]);
  t("the gate's message names the row, its state and BACKLOG.md with its line",
    rowMessage(J.a.findings).includes(`ZZ-41 (queued, BACKLOG.md:${lineOf(BACKLOG, "ZZ-41")})`), true);
  t("a BACKLOG row in an unknown state is NAMED, never silently unjudged", J.v.unknownState, ["ZZ-44 · pending"]);
  t("a blocked BACKLOG row is not judged, exactly as in the cache", J.v.skipped, ["ZZ-46"]);
  t("the correct rows (ZZ-40 in the cache, ZZ-45 in the backlog) pass (over-strictness)",
    J.a.open.filter((r) => ["ZZ-40", "ZZ-45"].includes(r.id)).map((r) => r.ok), [true, true]);
}

/* ------------------------------------------ 3. plancheck §2's milestone and interface checks */
console.log("\n--- 3. a backlog row naming an unknown milestone or an unregistered interface FAILS by name ---");
{
  t("an UNKNOWN milestone in a BACKLOG row is named", J.v.unknownMilestone, ["ZZ-42 M99"]);
  t("an UNREGISTERED interface in a BACKLOG row is named", J.v.unregistered, ["ZZ-43 I99"]);
  t("each names BACKLOG.md and the FIELD's own line",
    [...J.f.unknownMilestone, ...J.f.unregisteredInterface].map((x) => `${x.file}:${x.line}`),
    [`${BACKLOG_PATH}:${lineOf(BACKLOG, "ZZ-42") + 1}`, `${BACKLOG_PATH}:${lineOf(BACKLOG, "ZZ-43") + 2}`]);
  t("the registries are read, not listed (M0–M10 and I1–I9 today; floored, not pinned)",
    [J.f.knownMilestones.size >= 11, J.f.knownInterfaces.size >= 9], [true, true]);
}

/* -------------------------------------------------- 4. EXACTLY as it would in QUEUE.md */
console.log("\n--- 4. the same rows in the CACHE get the same verdicts ---");
{
  const asCache = judge(CACHE + "\n" + BACKLOG.replace(/^# BACKLOG — fixture\n/, ""), "");
  t("every verdict is identical whichever file the rows are in", asCache.v, J.v);
  t("and it is the cache the findings then name", asCache.a.findings.map((f) => f.file), [QUEUE_PATH]);
}

/* -------------------------------------------------- 5. the live plan, and the gate in the loop */
console.log("\n--- 5. the LIVE plan, through the lister, and plancheck reading it the same way ---");
const LIVE = pipelineRows({ repo: REPO });
const LA = rowDesignAudit({ repo: REPO });
const LF = planFieldAudit(planRows({ repo: REPO }).rows, { milestones: MILESTONES, interfaces: INTERFACES });
{
  console.log(`  live plan: cache ${LIVE.cacheRows} row(s), backlog ${LIVE.backlogRows} row(s); `
    + `${LA.open.length} judged; ${LIVE.strays.length} row-shaped heading(s) the grammar cannot read: `
    + (LIVE.strays.map((s) => `${s.heading.slice(4, 40)} (${s.file.split("/").pop()}:${s.line})`).join("; ") || "none"));
  t("both live files were READ (an unreadable ledger is not an empty one)", LIVE.unreadable, []);
  t("the plan has rows to judge (a totality assertion over an empty corpus proves nothing)", LIVE.rows.length >= 5, true);
  t("the row-design check's rows ARE the lister's rows — same ids, same files, same lines",
    LA.rows.map((r) => `${r.id}@${r.file}:${r.line}`), LIVE.rows.map((r) => `${r.id}@${r.file}:${r.line}`));
  t("§2e's substrate check reads the same rows (the class sweep)",
    (() => { const s = substrateAudit({ repo: REPO }); return s.judged.length + s.unjudged.length; })(),
    LA.open.length);
  t("every live row, cache and backlog, names a design", LA.findings.map((f) => `${f.id} (${f.file}:${f.line})`), []);
  t("every live row state is recognised", LA.unknownState.map((r) => `${r.id} · ${r.state} (${r.file})`), []);
  t("every live milestone is defined and every live interface registered",
    [...LF.unknownMilestone, ...LF.unregisteredInterface].map((x) => `${x.id} (${x.file}:${x.line})`), []);
  t("no OPEN row hides under a heading the grammar cannot read (it would be judged by no arm)",
    LIVE.strays.filter((s) => !s.closed).map((s) => `${s.file}:${s.line}`), []);

  /* THE MECHANISM IS IN THE LOOP: plancheck is RUN and its own report read, because grepping its
     text is satisfied by a comment. Its figures must be the lister's figures. */
  const pc = spawnSync(process.execPath, [join(REPO, "tools/plancheck.mjs"), "--local"], { cwd: REPO, encoding: "utf8" });
  const out = pc.stdout || "";
  const fields = out.match(/plan fields: (\d+) row\(s\) read \(cache (\d+), backlog (\d+)\)/);
  t("plancheck's milestone and interface checks read every row the lister reads, in both files",
    fields ? fields.slice(1, 4).map(Number) : null, [LIVE.rows.length, LIVE.cacheRows, LIVE.backlogRows]);
  const design = out.match(/queue design pointers: (\d+) open row\(s\) judged of (\d+) \(cache (\d+), backlog (\d+)\)/);
  t("plancheck's row-design check reads every row the lister reads, in both files",
    design ? design.slice(1, 5).map(Number) : null, [LA.open.length, LIVE.rows.length, LIVE.cacheRows, LIVE.backlogRows]);
}

/* ------------------------------ 6. THE LIAR: the one lister is the only reader (structure) */
console.log("\n--- 6. no reader carries a row grammar or reads a ledger file of its own ---");
{
  /* Comments are stripped first: a header may QUOTE the grammar it no longer carries. */
  const code = (p) => read(p).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const ITEM_GRAMMAR = /\[A-Z\]\[A-Z0-9\]\*-\\d\+/;           // the QUEUE item-heading pattern, as source text
  const LEDGER_FILE = /["'`]docs\/development\/(?:QUEUE|BACKLOG)\.md["'`]/;
  for (const p of ["tools/rowdesign.mjs", "tools/rowsubstrate.mjs"]) {
    const c = code(p);
    t(`${p} carries NO row-heading grammar of its own`, ITEM_GRAMMAR.test(c), false);
    t(`${p} names NO ledger file to read`, LEDGER_FILE.test(c), false);
  }
  const rd = code("tools/rowdesign.mjs");
  t("rowdesign.mjs takes its rows from ledger.mjs' pipelineRows",
    /import\s*\{[^}]*\bpipelineRows\b[^}]*\}\s*from\s*"\.\/ledger\.mjs"/.test(rd), true);
  t("rowdesign.mjs reads NO file itself (the lister does the reading)", /\breadFileSync\b/.test(rd), false);
  const pc = code("tools/plancheck.mjs");
  t("plancheck.mjs scans no ledger text for `milestone:` or `behind-interface:` itself",
    [/\/\^milestone:/.test(pc), /\/\^behind-interface:/.test(pc)], [false, false]);
  t("plancheck.mjs names no BACKLOG.md to read (it reaches the backlog only through the lister)",
    /BACKLOG\.md/.test(pc), false);
  t("plancheck.mjs's §2 goes through planRows and planFieldAudit",
    [/\bplanRows\(/.test(pc), /\bplanFieldAudit\(/.test(pc)], [true, true]);
  /* M0-73: owed.mjs is the same reader one arm over — it reads the plan's BLOCKED rows. Its own grammar
     was spelled differently from the lister's (`[A-Z0-9-]+`), so ITEM_GRAMMAR alone cannot see it; the
     arm asks what makes it a walk in principle — a heading pattern of its own over `###`. The one it
     keeps, `### DEC-n ·`, reads DECISIONS.md, which is not the plan. */
  const ow = code("tools/owed.mjs");
  t("owed.mjs carries NO plan-row heading grammar of its own (only DECISIONS.md's `### DEC-n`)",
    [ITEM_GRAMMAR.test(ow), /\/\^###(?! \(DEC-)/.test(ow)], [false, false]);
  t("owed.mjs names NO plan ledger file to read (its paths are ledger.mjs')", LEDGER_FILE.test(ow), false);
  t("owed.mjs takes the plan's rows from ledger.mjs' pipelineRows",
    [/import\s*\{[^}]*\bpipelineRows\b[^}]*\}\s*from\s*"\.\/ledger\.mjs"/.test(ow), /\bpipelineRows\(/.test(ow)], [true, true]);
}

/* ------------------------------ 7. D-430's TWO SAME-CLASS READERS (M0-73): owed and mintid */
console.log("\n--- 7. owed's blocked rows and mintid's DEC, IC and M floors read the backlog (M0-73) ---");
{
  /* (a) owed. A plain blocked backlog row was already read before M0-73 (LED-6 added the backlog to owed's
     own walk), so it cannot discriminate the fix. The two rows that DO are the edges where owed's old
     grammar and the lister's disagreed: ZZ-51 is spaced as the lister reads it and the old walk missed it;
     ZZ-52-1 is a heading the lister cannot read (NAMED as a stray) and the old walk attributed it. */
  const OB = [
    `# BACKLOG — fixture`, ``,
    `### ZZ-50 · blocked — waits on a design ruling. Routed to BOB.`, `milestone: M8`, ``,
    `### ZZ-51  ·  blocked — spaced as the lister reads it. Routed to BOB.`, `milestone: M8`, ``,
    `### ZZ-52-1 · blocked — a heading the lister cannot read. Routed to BOB.`, `milestone: M8`, ``,
    `### ZZ-53 · blocked — waits on RECORD's other item`, `milestone: M8`, ``,
    `### ZZ-54 · queued — blocked on BOB is only prose here`, `milestone: M8`, ``,
  ].join("\n");
  const files = { [SOURCES.debt]: "| id | type | date | body | disposition |", [SOURCES.decisions]: "",
                  [SOURCES.queue]: "", [SOURCES.backlog]: OB };
  const o = owedFor("BOB", { reader: (p) => (p in files ? files[p] : null) });
  t("a blocked BACKLOG row routed to the lane appears in owed, sourced BACKLOG",
    o.attributed.filter((i) => i.id === "ZZ-50").map((i) => `${i.source} ${i.id}`), ["BACKLOG ZZ-50"]);
  t("owed's blocked rows ARE the lister's — the spaced ZZ-51 in, the unreadable ZZ-52-1 out",
    o.attributed.map((i) => i.id), ["ZZ-50", "ZZ-51"]);
  const lp = pipelineRows({ texts: { QUEUE: "", BACKLOG: OB } });
  t("...and the lister NAMES the heading it cannot read, so it is not silently lost",
    [lp.rows.filter((r) => r.state === "blocked").map((r) => r.id), lp.strays.map((s) => s.heading.slice(4, 11))],
    [["ZZ-50", "ZZ-51", "ZZ-53"], ["ZZ-52-1"]]);
  t("an unreadable BACKLOG is still NAMED by owed (the reader, not the lister, reads the file)",
    owedFor("BOB", { reader: (p) => (p === SOURCES.backlog ? null : (files[p] ?? null)) }).unreadable, [SOURCES.backlog]);
  const live = owedFor("BOB", { repo: REPO });
  const blocked = new Set(LIVE.rows.filter((r) => r.state === "blocked").map((r) => `${r.ledger} ${r.id}`));
  t("LIVE: every plan item owed lists is a blocked row the lister reads",
    live.items.filter((i) => i.source === "QUEUE" || i.source === "BACKLOG").map((i) => `${i.source} ${i.id}`)
      .filter((k) => !blocked.has(k)), []);

  /* (b) mintid. A scratch repo holding ONLY a BACKLOG.md that mentions one id of each namespace: every
     other corpus file is absent (and reported `missing`), so the floor can come from nowhere else. */
  const root = mkdtempSync(join(tmpdir(), "m073-mintid-"));
  mkdirSync(join(root, "docs/development"), { recursive: true });
  writeFileSync(join(root, BACKLOG_PATH), "# BACKLOG — fixture\n\n### ZZ-60 · queued — cites DEC-4242, IC-4243 and M-424\n");
  for (const [ns, want] of [["DEC", 4242], ["IC", 4243], ["M", 424]]) {
    const f = corpusFloor(ns, { repo: root });
    t(`${ns}: an id mentioned ONLY in BACKLOG.md raises the floor`, [f.floor, f.from], [want, BACKLOG_PATH]);
  }
  rmSync(root, { recursive: true, force: true });
  t("THE CLASS: no mintid corpus names the cache without the backlog",
    Object.entries(NAMESPACES).filter(([, s]) => s.corpus.includes(QUEUE_PATH) && !s.corpus.includes(BACKLOG_PATH))
      .map(([ns]) => ns), []);
  t("...over a corpus that is not empty: this many namespaces read the cache",
    Object.values(NAMESPACES).filter((s) => s.corpus.includes(QUEUE_PATH)).length >= 20, true);
}

console.log(`\npipeline-readers: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
