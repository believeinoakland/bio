/* D-255 / D-258 — IS A FIELD READ BY ANYBODY? THE INSTRUMENT, AND ITS CONTROLS.
 *
 *     cd bio-plane && node test/fieldread.control.mjs               (sweep + 12 arms)
 *     cd bio-plane && node test/fieldread.control.mjs --sweep       (the node sweep only)
 *     cd bio-plane && node test/fieldread.control.mjs --tripwire-sweep
 *                                       (a VERDICT for every plan.meaning.* field)
 *     …                                 --tripwire-sweep --tripwire-row=refs   (one row)
 *     cd bio-plane && node test/fieldread.control.mjs --digest      (the answer digest)
 *     …                                 --emit-armed=<field> / --restore  (diagnosis)
 *
 * WHAT D-258 ADDED, and every one of them is a lesson this file paid for rather
 * than a tidy-up:
 *   - A SECOND SUBJECT (`src/store.mjs`), because a field is BUILT in one file
 *     and READ in another, and an arm that must inject or respell a read has to
 *     reach the reader. Restores verify every subject, not the edited one.
 *   - `--tripwire-sweep`: the node sweep ends in a CANDIDATE LIST, and a
 *     candidate list is where D-255 nearly deleted five live fields. This gives
 *     each candidate a verdict by driving it through the whole battery.
 *   - `--digest`: D-255's "no answer moved" digest was a one-off that left
 *     nothing re-runnable, so D-258 had to rebuild it. It is a mode now.
 *   - A GUARD against snapshotting an ALREADY-ARMED tree. Interrupt a run
 *     between arming and restoring and the next run took the armed file as
 *     "pristine", overwrote the good snapshot, and reported
 *     `sha256 EQUAL · cmp IDENTICAL` while restoring the instrument. Every check
 *     passed while it happened; the equality was real and against the wrong file.
 *   - RE-DRIVING each failing suite ALONE before counting it as a read. A red
 *     battery is not evidence of a read: `plan.meaning.refs` — the field whose
 *     whole disposition hung on the verdict — came back LIVE on its first pass
 *     because `daemon-token.test.mjs` failed under six concurrent batteries, and
 *     that suite passed 56/0 alone against the identical armed tree with the
 *     tripwire never firing.
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS `src/query.mjs` while it runs, so
 * `scripts/battery.mjs` must not discover it. `query.control.mjs`,
 * `suggest.control.mjs` and `register.control.mjs` are the precedent, and the
 * arm/restore machinery below is `query.control.mjs`'s, reused deliberately
 * rather than re-derived.
 *
 * WHY AN INSTRUMENT AND NOT A GREP, WHICH IS THE WHOLE POINT OF THIS ITEM.
 * D-255 is "a field computed and read by nobody". That is a KIND, and the
 * obvious way to find instances of it — grep for `.name` — grades a SPELLING.
 * `a["ph" + "rase"]`, `const { phrase } = atom`, `{ ...atom }` into a published
 * envelope and `JSON.stringify(plan)` are all reads that no list of spellings
 * catches, and a classifier that misses them REPORTS A LIVE FIELD DEAD. So the
 * question is asked of the field itself: every object the query language
 * constructs is wrapped in a Proxy whose `get` trap RECORDS, the corpus and the
 * real suites are driven through it, and a field nothing ever asked for is what
 * the sweep reports. The trap sees every spelling there is, because a property
 * read is what it traps — including `in`, spread, destructuring and
 * serialisation.
 *
 * WHAT IT CANNOT SEE, so nobody has to rediscover it.
 *   1. IT IS NODE-ONLY. `query.mjs` is pure and runs in node (its own header
 *      says so, and `query-reach.control.mjs` depends on the same fact), but
 *      its OUTPUT is consumed by `store.mjs` INSIDE WORKERD, where this
 *      recorder cannot be read back out. A field this sweep calls never-read is
 *      therefore a CANDIDATE, and the whole-battery TRIPWIRE arm below — a
 *      getter that THROWS — is what settles it, because a throw does not need
 *      to be read back: the battery goes red.
 *   2. It grades the objects the query language CONSTRUCTS. The exported static
 *      registries (`FIELDS`, `MEANING`, `SORTABLE`, `DEFAULT_FACETS`,
 *      `PROVENANCE_COLS`) are a different population, read by lookup from other
 *      modules; they are swept separately and the result is in the report.
 *   3. A field read ONLY by code no corpus reaches is indistinguishable from a
 *      dead one. That is why the corpus is PRINTED with its size, and why the
 *      real suites are driven as well as the synthetic queries.
 *
 * WHAT IT FOUND, 2026-08-09, and the arms are declared in `query.test.mjs`'s own
 * NEGATIVE CONTROL block with the counts each produced. Reach: 41,580
 * compilations plus three real suites, 59 distinct constructed fields before the
 * fix and 58 after. `atom.phrase`: written 6,517, read 0. Seven `plan.meaning.*`
 * fields also read 0 IN NODE — and FIVE OF THOSE ARE LIVE, read by `store.mjs`
 * inside workerd and published by `op=meaningrows`. That is not a footnote about
 * the instrument; it is the single most important thing in this file, and ARM O2
 * exists so the next reader meets it as a measurement rather than as a caveat.
 *
 * WHAT D-258 THEN SETTLED, by driving all nine rows of `--tripwire-sweep`:
 * `arm`, `table`, `grain`, `identity`, `limit` and `offset` are LIVE — the five
 * D-255 could only assert are now MEASURED, plus `arm` — and `columns` and
 * `refs` are DEAD. Both were deleted. After the deletion the node sweep reports
 * 56 constructed fields and FIVE never-read candidates, every one of them a
 * field this sweep has already proven LIVE in workerd; there is no candidate on
 * this descriptor left undecided.
 *
 * THE TECHNIQUE GENERALISES AND THE SCOPE HERE DOES NOT. Any module pure enough
 * to run in node can be swept this way; the wrap sites below are hand-written
 * for `query.mjs` and nothing here reaches `store.mjs`, `index.mjs` or the
 * exported static registries (`FIELDS`, `MEANING`, `SORTABLE`, …), whose entry
 * fields are read by lookup from other modules. A name-based scan over those
 * reports every one of them as read, and CANNOT DO OTHERWISE: `key`, `row`,
 * `type` and `col` collide with unrelated reads in 297 files, so that scan
 * cannot find a dead field there even in principle. Saying so is the point.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL("./", import.meta.url));
const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const SELF = fileURLToPath(import.meta.url);
const SNAP = HERE + ".fieldread-pristine/";
const sha = (b) => createHash("sha256").update(b).digest("hex");

/* ------------------------------------------------------------------ THE PROBE
 * Injected into `src/query.mjs` for the duration of the sweep. It uses NO node
 * API, because the file it lands in is also bundled for workerd. */
const PROBE = `
/* __FIELDREAD_PROBE__ — transient, installed by test/fieldread.control.mjs. */
const __FR = (globalThis.__FIELDREAD ||= { read: {}, made: {}, enumerated: {} });
const __FRTAG = Symbol.for("fieldread.probed");
const __bump = (m, k) => { m[k] = (m[k] || 0) + 1; };
function __probe(shape, o) {
  if (o === null || typeof o !== "object" || o[__FRTAG]) return o;
  for (const k of Reflect.ownKeys(o)) if (typeof k === "string") __bump(__FR.made, shape + "." + k);
  return new Proxy(o, {
    get(t, k, r) {
      if (k === __FRTAG) return true;
      if (typeof k === "string") __bump(__FR.read, shape + "." + k);
      return Reflect.get(t, k, r);
    },
    has(t, k) { if (typeof k === "string") __bump(__FR.read, shape + "." + k); return Reflect.has(t, k); },
    ownKeys(t) { __bump(__FR.enumerated, shape); return Reflect.ownKeys(t); },
  });
}
`;

/* The wrap sites. Every object the query language constructs passes through one
   of them. Each anchor is COUNTED before it is used — `query.control.mjs` paid
   for arming blind against a pattern that occurred twice, and that lesson is
   carried here rather than re-learned. */
const WRAPS = [
  ["atom",  `const atom = { op: "text", column, value: v, prefix };`,
            `const atom = __probe("atom", { op: "text", column, value: v, prefix });`],
  ["token", `\n  return out;\n}`, `\n  return out.map((o) => __probe("token", o));\n}`],
  ["not",   `{ op: "not", kid: k }`, `__probe("not", { op: "not", kid: k })`],
  ["and",   `    return { op: implicitOp, kids };`, `    return __probe("and", { op: implicitOp, kids });`],
  ["or",    `    return { op: "or", kids };`, `    return __probe("or", { op: "or", kids });`],
  ["sel",   `    if (t.k === "sel") { eat(); return selector(t, ctx); }`,
            `    if (t.k === "sel") { eat(); return __probe("sel", selector(t, ctx)); }`],
  ["ctx",   `  const ctx = { warnings: [], textAtoms: [], sort: null, meaningArms: [] };`,
            `  const ctx = __probe("ctx", { warnings: [], textAtoms: [], sort: null, meaningArms: [] });`],
  ["plan",  `  return {\n    ast, warnings: ctx.warnings,`, `  return __probe("plan", {\n    ast, warnings: ctx.warnings,`],
  ["plan/", `    statements: { page, count, ids: idsStmt, snapshot, facets: facets_, facetScan, meaning },\n  };`,
            `    statements: __probe("plan.statements", { page, count, ids: idsStmt, snapshot, facets: facets_, facetScan, meaning }),\n  });`],
  ["sort",  `    sort: { field: sortField, dir: sortDir }, limit: lim, offset: off,`,
            `    sort: __probe("plan.sort", { field: sortField, dir: sortDir }), limit: lim, offset: off,`],
  ["mean",  `    meaning: rowArm ? {\n`, `    meaning: rowArm ? __probe("plan.meaning", {\n`],
  ["mean/", `      limit: mLim, offset: mOff,\n    } : null,`, `      limit: mLim, offset: mOff,\n    }) : null,`],
];

const uniq = (src, needle, label) => {
  const n = src.split(needle).length - 1;
  if (n !== 1) {
    console.log(`!! ANCHOR IS NOT UNIQUE (${n} occurrence(s)) for ${label}: ${JSON.stringify(needle.slice(0, 70))}`);
    process.exit(3);
  }
  return needle;
};

function instrument(src, probeText = PROBE) {
  let s = src;
  for (const [label, from, to] of WRAPS) s = s.replace(uniq(s, from, label), to);
  /* The helper goes in AFTER the last import, so it is defined before any call. */
  const anchor = uniq(s, `\n/* ---------------------------------------------------------------------------\n * Parser:`, "probe-anchor");
  return s.replace(anchor, `\n${probeText}${anchor}`);
}


/* ------------------------------------------------------------------- THE CORPUS
 * Printed, and floored. A totality assertion over an empty corpus has passed in
 * this project three times; this one states its size and refuses to be small. */
function corpus(FIELDS, MEANING, SORTABLE) {
  const qs = [
    "", "   ", "sewer", "sewer fund", '"sewer fund"', "sewer*", "-sewer", "sewer OR water",
    "sewer AND water", "(sewer OR water) AND fund", "NOT sewer", "-", '"unclosed', 'stray" quote',
    "sewer:fund", "text:sewer", 'text:"two words"', "fm:a.b", 'fm:a.b="c"', 'fm:"a.b"="c"',
    "has:state", "sort:created", 'sort:"created"', "!!!", "((", "))", "a b c d e f",
    '"a" "b"', 'title:"Fund general"', "-state:collected", '-state:"collected"',
  ];
  for (const f of Object.keys(FIELDS)) { qs.push(`${f}:x`, `${f}:>1`, `${f}:>="2026-01-01"`, `has:${f}`, `sort:${f}`); }
  for (const m of Object.keys(MEANING)) { qs.push(`${m}:x`, `has:${m}`, `${m}:>0`); }
  const viewers = ["class:member", "member:m-1", "admin", "class:admin", "class:daemon",
                   "class:ai", "class:probe", null, "", "nobody", 7];
  const opts = [
    {}, { implicitOp: "or" }, { limit: 1 }, { limit: 99999 }, { offset: 7 },
    { facets: ["type", "state"] }, { facets: [] }, { ids: ["b-1", "b-2"] },
    { sort: "created", dir: "desc" }, { sort: "relevance" }, { snippetChars: 40 },
    ...Object.keys(MEANING).map((m) => ({ rows: m, rowLimit: 5, rowOffset: 2 })),
    ...Object.keys(SORTABLE).slice(0, 4).map((s) => ({ sort: s, dir: "asc" })),
  ];
  return { qs, viewers, opts };
}

/* --------------------------------------------------------------- CHILD MODES */
const CHILD = process.env.FIELDREAD_CHILD || "";
if (CHILD) {
  const OUT = process.env.FIELDREAD_OUT;
  const dump = () => {
    const fr = globalThis.__FIELDREAD || { read: {}, made: {}, enumerated: {} };
    writeFileSync(OUT, JSON.stringify(fr));
  };
  if (CHILD === "corpus") {
    const Q = await import("../src/query.mjs");
    const { qs, viewers, opts } = corpus(Q.FIELDS, Q.MEANING, Q.SORTABLE);
    let n = 0;
    for (const q of qs) for (const viewer of viewers) for (const o of opts) {
      const plan = Q.compile({ q, viewer, ...o });
      n++;
      /* DRIVE THE PLAN THE WAY A CONSUMER DOES, or the sweep measures compile()
         alone and calls every published field dead. `store.mjs` reads these. */
      void plan.warnings.length; void plan.terms.length; void plan.match;
      void plan.limit; void plan.offset; void plan.widenable; void plan.gate;
      void plan.viewer; void plan.sort.field; void plan.sort.dir;
      void plan.facetFields; void plan.facetCols; void plan.restricted;
      void plan.meaningArms; if (plan.meaning) void plan.meaning.arm;
      for (const k of ["page", "count", "ids", "snapshot", "facets", "facetScan", "meaning"]) {
        const st = plan.statements[k];
        if (typeof st === "function") { try { st(); } catch { /* a builder may refuse its input */ } }
      }
    }
    console.log(`corpus: ${qs.length} queries × ${viewers.length} viewers × ${opts.length} option sets = ${n} compilations`);
    if (n < 5000) { console.log(`!! CORPUS FLOOR: ${n} compilations is too few to trust a never-read result`); process.exit(4); }
    dump();
    process.exit(0);
  }
  if (CHILD.startsWith("suite:")) {
    process.on("exit", dump);
    await import("./" + CHILD.slice(6));
  }
}

/* ------------------------------------------------- D-258: THE ANSWER DIGEST
 * `cd bio-plane && node test/fieldread.control.mjs --digest`
 *
 * D-255 proved that deleting `atom.phrase` moved no answer with a digest over
 * 360 compilations — and that digest was a ONE-OFF that left nothing behind, so
 * D-258 could not re-run it and had to rebuild it. It is a MODE now. What goes
 * into it is everything a caller can observe about a compiled plan that is not
 * the field under test: the ranking expression, the terms, the warnings, the
 * widenable flag, the PAGE statement's SQL and bound arguments, the MEANING
 * statement's SQL and bound arguments (this is the half D-258 moves, so leaving
 * it out would be grading the wrong thing), and the six meaning-descriptor
 * fields `op=meaningrows` actually publishes.
 *
 * WHAT IT IS NOT. It cannot see a field that nothing reads — that is the whole
 * premise of the item, and it is why the digest is EVIDENCE THAT NO ANSWER
 * MOVED and never evidence that the field was dead. The tripwire arms are what
 * establish the second, and confusing the two would be this item's own mistake. */
if (process.argv.includes("--digest")) {
  const Q = await import("../src/query.mjs");
  const h = createHash("sha256");
  let n = 0;
  const qs = ["", "sewer", '"sewer fund"', "sewer*", "-sewer", "sewer OR water",
              "(sewer OR water) AND fund", "has:leg", "leg:hunch", "leg:ground=*",
              "resolves:>=B", "concerns:ENT-1", "type:inquiry -leg:hunch"];
  for (const f of Object.keys(Q.FIELDS)) qs.push(`${f}:x`, `has:${f}`, `sort:${f}`);
  const viewers = ["class:member", "member:m-1", "class:admin", null];
  const opts = [{}, { limit: 5, offset: 2 },
                ...Object.keys(Q.MEANING).map((m) => ({ rows: m, rowLimit: 5, rowOffset: 2 })),
                ...Object.keys(Q.MEANING).map((m) => ({ rows: m, rowLimit: 99999 }))];
  for (const q of qs) for (const viewer of viewers) for (const o of opts) {
    const p = Q.compile({ q, viewer, ...o });
    n++;
    const page = (() => { try { return p.statements.page(); } catch (e) { return { err: String(e) }; } })();
    const mean = (() => { try { return p.statements.meaning?.() ?? null; } catch (e) { return { err: String(e) }; } })();
    const meanCount = (() => { try { return p.statements.meaning?.({ mode: "count" }) ?? null; } catch (e) { return { err: String(e) }; } })();
    h.update(JSON.stringify([
      p.match, p.terms, p.warnings, p.widenable, p.gate, p.limit, p.offset,
      p.sort.field, p.sort.dir, p.facetFields, p.facetCols, p.restricted, p.meaningArms,
      page, mean, meanCount,
      /* THE SIX THE OP PUBLISHES, named one by one rather than by spreading the
         descriptor — a spread would fold the two fields under test INTO the
         digest and make it disagree for the one reason that is not an answer. */
      p.meaning && [p.meaning.arm, p.meaning.table, p.meaning.grain,
                    p.meaning.identity, p.meaning.limit, p.meaning.offset],
    ]));
  }
  if (n < 300) { console.log(`!! DIGEST CORPUS FLOOR: ${n} compilations is too few`); process.exit(4); }
  console.log(`ANSWER DIGEST over ${n} compilations (${qs.length} queries × ${viewers.length} viewers × ${opts.length} option sets): ${h.digest("hex")}`);
  process.exit(0);
}

/* -------------------------------------------------------------- THE SWEEP RUN */
const SUBJECT = "bio-plane/src/query.mjs";
/* D-258 ADDS A SECOND SUBJECT, and the reason is what decides this whole class:
   `query.mjs` is where a field is BUILT, `store.mjs` is where its only plausible
   reader LIVES, and an arm that must inject a read in a spelling nobody
   anticipated — or rewrite a genuine one — has to reach the reader's own file.
   So the snapshot/restore machinery is per-FILE now, and EVERY restore verifies
   EVERY subject by sha256 AND `cmp` AND byte count. A two-file arm that restored
   only one of them would leave the tree dirty in precisely the way the old
   single-file check could not see. */
const READER = "bio-plane/src/store.mjs";
const SUBJECTS = { query: { path: SUBJECT, floor: 20000 }, store: { path: READER, floor: 200000 } };
if (!existsSync(SNAP)) mkdirSync(SNAP, { recursive: true });

/* `--restore` IS HANDLED BEFORE THE GUARD BELOW, ON PURPOSE. The guard refuses
   to run against an armed tree, and an armed tree is exactly the state in which
   somebody needs `--restore` — a recovery path locked behind the check that
   detects the thing it recovers from is not a recovery path. */
if (process.argv.includes("--restore")) {
  const snap = SNAP + "PRISTINE__query.mjs";
  if (!existsSync(snap)) { console.log(`!! no snapshot at ${snap} — restore from git instead`); process.exit(2); }
  const good = readFileSync(snap);
  if (/__FIELDREAD_PROBE__|__FIELDREAD_TRIPWIRE__|D-25[58] TRIPWIRE/.test(good.toString("utf8"))) {
    console.log(`!! THE SNAPSHOT ITSELF IS ARMED — restoring it would launder the instrument in. Use git.`);
    process.exit(2);
  }
  writeFileSync(ROOT + SUBJECT, good);
  console.log(`RESTORED ${SUBJECT} from snapshot · sha256 ${sha(readFileSync(ROOT + SUBJECT)).slice(0, 12)}… · ${readFileSync(ROOT + SUBJECT).length} bytes`);
  process.exit(0);
}

/* THIS GUARD IS A DEFECT THIS HARNESS SHIPPED WITH, FOUND BY PAYING FOR IT
   (D-258, 2026-08-09). The snapshot below runs unconditionally at startup, so a
   run against a tree that is STILL ARMED — because an earlier run was
   interrupted between arming and restoring — takes the ARMED file as "pristine",
   overwrites the good snapshot with it, and then cheerfully reports
   `RESTORE: sha256 EQUAL · cmp IDENTICAL` while restoring the instrument. Every
   check in this file passed while it happened: the equality was real and it was
   an equality against the wrong file, which is this project's oldest lesson in
   the shape of a restore. The instrument leaves a marker in the file it edits,
   so the cheap decisive test is to look for it. */
for (const [key, s] of Object.entries(SUBJECTS)) {
  s.buf = readFileSync(ROOT + s.path);
  s.sha = sha(s.buf);
  if (/__FIELDREAD_PROBE__|__FIELDREAD_TRIPWIRE__|D-25[58] TRIPWIRE/.test(s.buf.toString("utf8"))) {
    console.log(`!! ${s.path} STILL CARRIES AN INSTRUMENT MARKER — this tree is ARMED, not pristine.`);
    console.log(`!! Refusing to snapshot it. Restore it from ${SNAP} (or from git) and re-run.`);
    process.exit(2);
  }
  writeFileSync(SNAP + `PRISTINE__${key}.mjs`, s.buf);
  console.log(`pristine  ${s.path}  sha256 ${s.sha.slice(0, 12)}…  ${s.buf.length} bytes`);
  if (s.buf.length < s.floor) { console.log(`!! PRISTINE ${key} IS IMPLAUSIBLY SMALL (floor ${s.floor}) — refusing to run`); process.exit(2); }
}
/* Kept under their old names so D-255's own arms below read exactly as they did. */
const pristineBuf = SUBJECTS.query.buf, pristineSha = SUBJECTS.query.sha;

const restoreOne = (key, snapPath, label) => {
  const s = SUBJECTS[key];
  writeFileSync(ROOT + s.path, readFileSync(snapPath));
  const after = readFileSync(ROOT + s.path);
  const shaOk = sha(after) === s.sha;
  let cmpOk = false;
  try { execFileSync("cmp", [ROOT + s.path, snapPath]); cmpOk = true; } catch { cmpOk = false; }
  console.log(`RESTORE ${key} ${label}: sha256 ${shaOk ? "EQUAL" : "DIFFERENT"} · cmp ${cmpOk ? "IDENTICAL" : "DIFFERS"} · ${after.length} bytes`);
  if (!shaOk || !cmpOk || after.length !== s.buf.length) { console.log("!! RESTORE FAILED"); process.exit(2); }
};
const restore = (snapPath, label) => restoreOne("query", snapPath, label);
/* Restores EVERY subject from that run's own uniquely-named snapshots. */
const restoreAll = (tag, label) => {
  for (const key of Object.keys(SUBJECTS)) restoreOne(key, SNAP + `${tag}__${key}.mjs`, label);
};

const child = (mode, extra = {}) => {
  const out = SNAP + `read__${mode.replace(/[^a-z0-9]+/gi, "_")}.json`;
  rmSync(out, { force: true });
  const r = spawnSync(process.execPath, [SELF], {
    cwd: ROOT + "bio-plane", encoding: "utf8",
    env: { ...process.env, FIELDREAD_CHILD: mode, FIELDREAD_OUT: out, ...extra },
  });
  const data = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : null;
  return { code: r.status, stdout: (r.stdout || "") + (r.stderr || ""), data };
};

/* The suites driven THROUGH the probe, alongside the synthetic corpus. These are
   the node-side consumers of `compile()`; every other consumer is in workerd and
   the tripwire arm is what reaches it. */
const NODE_SUITES = ["query.test.mjs", "meaningquery.test.mjs", "bounds.test.mjs"];

function sweep() {
  console.log("\n================ SWEEP: which fields does anything READ? ================");
  writeFileSync(ROOT + SUBJECT, instrument(pristineBuf.toString("utf8")));
  console.log(`INSTRUMENTED: ${pristineBuf.length} -> ${readFileSync(ROOT + SUBJECT).length} bytes`);
  const runs = [];
  try {
    const c = child("corpus");
    console.log(c.stdout.trim().split("\n").filter((l) => l.startsWith("corpus:")).join("\n"));
    if (c.code !== 0 || !c.data) { console.log(`!! CORPUS CHILD FAILED (exit ${c.code})\n${c.stdout.slice(0, 2000)}`); process.exit(5); }
    runs.push(["corpus", c.data]);
    for (const s of NODE_SUITES) {
      const r = child("suite:" + s);
      const m = r.stdout.match(/(\d+) pass, (\d+) fail/);
      console.log(`  through the probe: ${s.padEnd(24)} exit ${r.code} ${m ? `${m[1]} pass, ${m[2]} fail` : "(no tally — reported as -1)"}`);
      if (!r.data) { console.log(`!! ${s} PRODUCED NO READ MAP — its reads are UNMEASURED, not zero`); process.exit(5); }
      runs.push([s, r.data]);
    }
  } finally {
    restore(SNAP + "PRISTINE__query.mjs", "after sweep");
  }

  const made = {}, read = {}, enumerated = {};
  for (const [, d] of runs) {
    for (const [k, v] of Object.entries(d.made)) made[k] = (made[k] || 0) + v;
    for (const [k, v] of Object.entries(d.read)) read[k] = (read[k] || 0) + v;
    for (const [k, v] of Object.entries(d.enumerated)) enumerated[k] = (enumerated[k] || 0) + v;
  }
  const fields = Object.keys(made).sort();
  console.log(`\nCORPUS REACH: ${fields.length} distinct constructed fields observed across ${runs.length} runs`);
  if (!fields.length) { console.log("!! EMPTY CORPUS — this sweep measured nothing"); process.exit(6); }
  const dead = [];
  for (const f of fields) {
    const r = read[f] || 0;
    console.log(`  ${r === 0 ? "NEVER READ  " : "read        "} ${f.padEnd(26)} written ${String(made[f]).padStart(8)} · read ${String(r).padStart(8)}`);
    if (r === 0) dead.push(f);
  }
  const enumOnly = Object.keys(enumerated);
  console.log(`\n  SHAPES ENUMERATED (Object.keys / spread / JSON of the whole object): ${enumOnly.length ? enumOnly.join(", ") : "NONE"}`);
  console.log(`  A shape that is enumerated somewhere carries EVERY field into that enumeration, so a`);
  console.log(`  never-read field on it is still OBSERVABLE and its removal is a shape change. None of`);
  console.log(`  the shapes below are enumerated unless this line names them.`);
  console.log(`\n  NEVER READ BY ANYTHING IN THIS SWEEP (${dead.length}): ${dead.length ? dead.join(", ") : "NONE"}`);
  console.log(`  THESE ARE CANDIDATES, NOT A VERDICT. This sweep runs in node; a field read only`);
  console.log(`  inside workerd reads as never-read here. On 2026-08-09 that was FIVE of the seven`);
  console.log(`  \`plan.meaning.*\` fields listed above — live, read by store.mjs, published by`);
  console.log(`  op=meaningrows. ARM O2 is the arm that catches it. What settles a candidate is the`);
  console.log(`  TRIPWIRE — a getter that throws — driven through the WHOLE battery.`);
  return dead;
}

/* ------------------------------------------------------------------ THE ARMS */
const runBattery = () => {
  const r = spawnSync("npm", ["run", "test:battery"], { cwd: ROOT + "bio-plane", encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(/(\d+)\/(\d+) suites green · (\d+) assertions passing/);
  /* WHICH suites failed, not just how many. A boolean red/green cannot tell
     "nothing reads this field" from "this field is read in four places", and
     ARM D below is the arm that needed the difference. */
  const suites = [...new Set(out.split("\n")
    .map((l) => (l.match(/^\s*FAIL\s+(\S+\.test\.mjs)/) || [])[1]).filter(Boolean))].sort();
  return { code: r.status, out, suitesFailed: suites,
           green: m ? +m[1] : -1, suites: m ? +m[2] : -1, assertions: m ? +m[3] : -1,
           failed: out.split("\n").filter((l) => /^\s*(FAIL|fail)\b/.test(l) || /\bFAILED\b/.test(l)).slice(0, 8) };
};

let armsRun = 0, wrong = 0;
const ONLY = (process.argv.find((a) => a.startsWith("--arm=")) || "").slice(6);
const arm = ({ id, what, mustFail, mustNotFail, edit, editStore, expectGreen, expectSuites, expectBeyond, suite }) => {
  if (ONLY && ONLY !== id) return;
  console.log(`\n================ ARM ${id} ================`);
  console.log(`WHAT:          ${what}`);
  console.log(`MUST FAIL:     ${mustFail}`);
  console.log(`MUST NOT FAIL: ${mustNotFail}`);
  /* EVERY subject is checked pristine and snapshotted, whether this arm edits it
     or not — a restore that verifies only the file an arm meant to touch cannot
     see the file it touched by accident. */
  const before0 = {};
  for (const [key, s] of Object.entries(SUBJECTS)) {
    const b = readFileSync(ROOT + s.path);
    if (sha(b) !== s.sha) { console.log(`!! TREE IS NOT PRISTINE AT ARM START (${key}) — aborting`); process.exit(2); }
    writeFileSync(SNAP + `${id}__${key}.mjs`, b);
    before0[key] = b;
  }
  let armedAny = false;
  for (const [key, fn] of [["query", edit], ["store", editStore]]) {
    if (!fn) continue;
    const from = before0[key].toString("utf8");
    const to = fn(from);
    if (to === from) {
      console.log(`!! ARM NEVER ARMED (${key}) — the edit changed nothing`);
      wrong++; restoreAll(id, `arm ${id} (never armed)`); return;
    }
    writeFileSync(ROOT + SUBJECTS[key].path, to);
    console.log(`ARMED ${key}: ${before0[key].length} -> ${Buffer.byteLength(to)} bytes`);
    armedAny = true;
  }
  if (!armedAny) console.log(`ARMED: nothing  (BASELINE — nothing is broken in this arm, on purpose)`);
  let green, line;
  if (suite) {
    const r = spawnSync(process.execPath, [`test/${suite}`], { cwd: ROOT + "bio-plane", encoding: "utf8" });
    const out = (r.stdout || "") + (r.stderr || "");
    const m = out.match(/(\d+) pass, (\d+) fail/);
    green = r.status === 0;
    line = `  ${suite} exit ${r.status} · ${m ? `${m[1]} pass, ${m[2]} fail` : "NO TALLY (reported as -1, never 0)"}`;
    for (const f of out.split("\n").filter((l) => l.includes("FAIL")).slice(0, 4)) line += `\n      ${f.trim().slice(0, 150)}`;
  } else {
    const b = runBattery();
    green = b.code === 0;
    line = `  BATTERY exit ${b.code} · ${b.green}/${b.suites} suites green · ${b.assertions} assertions`;
    for (const f of b.failed) line += `\n      ${f.slice(0, 160)}`;
    if (expectSuites) {
      /* A boolean red/green cannot carry this arm's claim. "Nothing reads this
         field" is the statement that every suite EXCEPT the structural pins is
         untouched, so the declaration is the SET of suites that may fail and
         the comparison is on that set. Declaring only RED would be satisfied by
         a field read in forty places, which is the opposite of the claim. */
      const got = b.suitesFailed.join(", ") || "(none)";
      const want = [...expectSuites].sort().join(", ") || "(none)";
      console.log(line);
      console.log(`  SUITES THAT FAILED: ${got}`);
      console.log(`  DECLARED EXACTLY:   ${want}`);
      const ok = got === want;
      console.log(`  ${ok ? "AS DECLARED" : "*** NOT AS DECLARED — THIS IS A FINDING ***"}`);
      if (!ok) wrong++;
      restoreAll(id, `arm ${id}`);
      armsRun++;
      return;
    }
    if (expectBeyond) {
      /* THE SAME CORRECTION IN THE OTHER DIRECTION, and D-258 needed it. A
         POSITIVE control for a field that must first be PUT BACK cannot declare
         merely RED: this item's structural ratchet fires on the field's presence
         alone, so RED is already guaranteed before the injected read does
         anything, and the arm would pass while proving nothing. What it has to
         show is a failure BEYOND the ratchet — and each such suite is re-driven
         alone, because a battery under contention produces reds that are not
         reads (measured here on `daemon-token.test.mjs`, 2026-08-09). */
      const beyond = b.suitesFailed.filter((s) => !expectBeyond.includes(s));
      console.log(line);
      console.log(`  SUITES THAT FAILED: ${b.suitesFailed.join(", ") || "(none)"}`);
      console.log(`  FREE (declared to fail on PRESENCE alone, so they prove nothing here): ${expectBeyond.join(", ")}`);
      console.log(`  BEYOND THEM:        ${beyond.join(", ") || "(nothing)"}`);
      const reproduced = [];
      for (const s of beyond) {
        const r = spawnSync(process.execPath, [`test/${s}`], { cwd: ROOT + "bio-plane", encoding: "utf8" });
        if (r.status !== 0) reproduced.push(s);
        console.log(`  re-driven ALONE: ${s.padEnd(30)} exit ${r.status} · ${r.status === 0 ? "DID NOT REPRODUCE — a flake, not a read" : "REPRODUCED"}`);
      }
      const ok = reproduced.length > 0;
      console.log(`  DECLARED: at least one suite beyond the ratchet, REPRODUCED alone · ACTUAL ${reproduced.length}`);
      console.log(`  ${ok ? "AS DECLARED" : "*** NOT AS DECLARED — THIS IS A FINDING ***"}`);
      if (!ok) wrong++;
      restoreAll(id, `arm ${id}`);
      armsRun++;
      return;
    }
  }
  console.log(line);
  console.log(`  DECLARED ${expectGreen ? "GREEN" : "RED"} · ACTUAL ${green ? "GREEN" : "RED"} · ${green === expectGreen ? "AS DECLARED" : "*** NOT AS DECLARED — THIS IS A FINDING ***"}`);
  if (green !== expectGreen) wrong++;
  restoreAll(id, `arm ${id}`);
  armsRun++;
};

/* THE TRIPWIRE. The field stops being a value and becomes a getter that THROWS.
   Any read, in ANY spelling and in ANY runtime — a spread, a destructure, an
   `in`, a JSON serialisation on the way out of an op — turns into a failure the
   battery can see. It does not need to be read back out of workerd, which is
   exactly why it reaches where the sweep cannot. */
const trip = (owner, field, from) => (s) =>
  s.replace(uniq(s, from, `tripwire ${owner}.${field}`),
            `get ${field}() { throw new Error("D-255 TRIPWIRE: ${owner}.${field} WAS READ"); },`);

/* `phrase` IS GONE from the source — that is what this item did. So every arm
   about it PUTS IT BACK FIRST, which keeps the whole control re-runnable
   against the tree as it now stands instead of against a tree that no longer
   exists. An arm that can only run against a file the fix deleted is an arm
   nobody will ever re-run. */
const withPhrase = (s) =>
  s.replace(uniq(s, `  const atom = { op: "text", column, value: v, prefix };`, "re-add phrase"),
            `  const atom = { op: "text", column, value: v, phrase: quoted && /\\s/.test(v), prefix };`);
const PHRASE_LIT = `phrase: quoted && /\\s/.test(v),`;

/* D-258's two fields are GONE from the source for exactly the same reason, so
   every arm about them PUTS THEM BACK FIRST — `withPhrase`'s pattern, and for
   `withPhrase`'s reason. */
const MEANING_ANCHOR = `      grain: MEANING[rowArm].rowGrain, identity: MEANING[rowArm].identity,\n`;
const COLUMNS_LIT = `columns: MEANING[rowArm].row,`;
const REFS_LIT = `refs: MEANING[rowArm].refs,`;
const withMeaningFields = (s) =>
  s.replace(uniq(s, MEANING_ANCHOR, "re-add columns/refs"),
            MEANING_ANCHOR + `      ${COLUMNS_LIT} ${REFS_LIT}\n`);

/* The store-side edits. `uniq` counts every one of these before it is used, so
   an anchor that stops matching announces itself instead of arming nothing —
   this project has an arm on its record that patched zero times and reported a
   result anyway. */
const injectRead = (field) => (s) => {
  const at = uniq(s, `    const rows = this.#runQuery(plan.statements.meaning(), tally);`, `inject ${field}`);
  const spelled = `"${field.slice(0, 3)}" + "${field.slice(3)}"`;
  return s.replace(at, `    if (plan.meaning[${spelled}]) { /* D-258 arm: deliberately unanticipated spelling */ }\n${at}`);
};
const respellGrain = (s) =>
  s.replace(uniq(s, `      grain: plan.meaning.grain, identity: plan.meaning.identity,`, "respell grain"),
            `      grain: plan.meaning["gr" + "ain"], identity: plan.meaning.identity,`);

/* ------------------------------------------- D-258: THE CLASS, WITH A VERDICT
 * `cd bio-plane && node test/fieldread.control.mjs --tripwire-sweep`
 *
 * THE SWEEP ABOVE ENDS IN A CANDIDATE LIST, AND A CANDIDATE LIST IS WHERE D-255
 * NEARLY DELETED FIVE LIVE FIELDS. Its own note says so: seven `plan.meaning.*`
 * fields read 0 in node and five of them are read by `store.mjs` inside workerd.
 * D-255 settled ONE of the seven by hand (ARM O2, `table`) and left the rest as a
 * sentence. This mode settles EVERY one of them, by driving it: the field becomes
 * a getter that THROWS on any read in any spelling, and the WHOLE battery decides.
 *
 * THE FIRST VERSION OF THIS MODE WAS THE WRONG INSTRUMENT AND IS RECORDED HERE
 * RATHER THAN QUIETLY REPLACED. It aimed a generic recording Proxy at a field by
 * NAME, which is more general and needs no per-field anchor. Its BASELINE row —
 * the identical instrument aimed at a field that does not exist — came back
 * failing `meaningread.test.mjs` as well as the expected ratchet, and the cause
 * was not workerd and not the Proxy's behaviour: `meaningread.test.mjs:100` pins
 * the LITERAL SOURCE TEXT `statements: { page, count, ids: idsStmt, … }` to one
 * occurrence in `query.mjs`, and the Proxy wrap rewrites exactly that line. So
 * the instrument perturbed a suite for a reason having nothing to do with reads.
 * THAT MATTERED, AND NOT COSMETICALLY: the verdict was "fails more suites than
 * the baseline did", and `meaningread.test.mjs` is also the suite that drives the
 * reads of `grain` and `identity` — so a live, published field whose only reader
 * is that suite would have been scored DEAD by a floor its own contamination
 * hid it behind. That is the deletion this item exists to prevent, arrived at
 * through the instrument instead of through the subject.
 *
 * THE MECHANISM IS THEREFORE D-255's `trip()` — a throwing GETTER, one field at
 * a time — which changes no line any suite reads as text. It is less general and
 * it is CORRECT, and that trade is the finding. The generality is bought back a
 * different way: the row list below is derived from the descriptor's own fields,
 * so a field added to the plan is a row here without editing this table.
 *
 * WHAT EACH ROW DECLARES, before it runs:
 *   - BASELINE: a throwing getter for a field NOTHING can read, ADDED beside the
 *     others and removing nothing. It IS a shape change, so it is declared to
 *     fail EXACTLY the structural ratchet and nothing else. If it fails anything
 *     more, the arming mechanism itself is not inert and every verdict below it
 *     is void rather than merely surprising — which is precisely how the first
 *     version of this mode was caught.
 *   - A field already in the source: armed alone, nothing else changed, so the
 *     descriptor's SHAPE is untouched and the ratchet cannot fire. Any failure is
 *     therefore a READ. LIVE ⟺ something failed.
 *   - `columns`/`refs`: these had to be PUT BACK first (`withPhrase`'s pattern),
 *     which the structural ratchet in `query.test.mjs` sees as PRESENCE. So the
 *     declaration for them is the exact set `[query.test.mjs]` — presence and
 *     nothing more. DEAD ⟺ exactly that set. Declaring merely "RED" would be
 *     satisfied by a field read in forty places, which is the opposite claim. */
const TRIP_ROWS = [
  { field: "__no_such_field__", add: true, declare: "DEAD" },
  { field: "arm",      lit: `arm: rowArm,` ,                        declare: "LIVE" },
  { field: "table",    lit: `table: MEANING[rowArm].table,`,        declare: "LIVE" },
  { field: "grain",    lit: `grain: MEANING[rowArm].rowGrain,`,     declare: "LIVE" },
  { field: "identity", lit: `identity: MEANING[rowArm].identity,`,  declare: "LIVE" },
  { field: "limit",    lit: `limit: mLim,`,                         declare: "LIVE" },
  { field: "offset",   lit: `offset: mOff,`,                        declare: "LIVE" },
  { field: "columns",  lit: COLUMNS_LIT, readd: true,               declare: "DEAD" },
  { field: "refs",     lit: REFS_LIT,    readd: true,               declare: "DEAD" },
];
/* The ONLY suite a re-added field may disturb: this item's own structural pin. */
const RATCHET_SUITE = "query.test.mjs";

/* Builds the armed source for one row. Every anchor goes through `uniq`. */
const tripArm = (row) => (src) => {
  const base = row.readd ? withMeaningFields(src) : src;
  if (row.add) {
    const a = uniq(base, `      arm: rowArm, table: MEANING[rowArm].table,\n`, "baseline getter");
    return base.replace(a, a + `      get ${row.field}() { throw new Error("D-258 TRIPWIRE: plan.meaning.${row.field} WAS READ"); },\n`);
  }
  return trip("plan.meaning", row.field, row.lit)(base);
};

function tripwireSweep() {
  console.log("\n========== TRIPWIRE SWEEP: a VERDICT per candidate, not a candidate list ==========");
  console.log(`  ${TRIP_ROWS.length} rows, one WHOLE-BATTERY run each, each armed ALONE.`);
  console.log(`  BASELINE ROW FIRST (plan.meaning.${TRIP_ROWS[0].field}); if it is not clean, nothing below stands.`);
  const out = [];
  let baselineClean = null;
  /* `--tripwire-row=<field>` runs ONE row. Nine whole-battery passes is the
     right instrument and the wrong debugging loop; a row that comes back
     surprising has to be re-drivable on its own. */
  const ONE = (process.argv.find((a) => a.startsWith("--tripwire-row=")) || "").slice(15);
  for (const row of (ONE ? TRIP_ROWS.filter((r) => r.field === ONE) : TRIP_ROWS)) {
    const target = `plan.meaning.${row.field}`;
    const tag = "TS_" + row.field.replace(/[^a-z0-9]+/gi, "_");
    for (const [key, s] of Object.entries(SUBJECTS)) {
      const b = readFileSync(ROOT + s.path);
      if (sha(b) !== s.sha) { console.log(`!! TREE NOT PRISTINE BEFORE ${target} (${key}) — aborting`); process.exit(2); }
      writeFileSync(SNAP + `${tag}__${key}.mjs`, b);
    }
    const armed = tripArm(row)(pristineBuf.toString("utf8"));
    if (armed === pristineBuf.toString("utf8")) { console.log(`!! ROW ${target} NEVER ARMED`); wrong++; continue; }
    writeFileSync(ROOT + SUBJECT, armed);
    const b = runBattery();
    const got = b.suitesFailed;
    console.log(`\n  ${target.padEnd(34)} ${b.green}/${b.suites} suites · ${b.assertions} assertions · exit ${b.code}`);
    console.log(`      suites that failed: ${got.join(", ") || "(none)"}`);
    /* WHICH ASSERTIONS, not only which suites — the first version of this mode
       printed suite names alone and a surprising row could not be diagnosed
       without another whole pass. */
    for (const f of b.failed.slice(0, 4)) console.log(`      ${f.trim().slice(0, 150)}`);
    /* A row that CHANGES THE SHAPE — the baseline getter, or the two fields put
       back — is seen by this item's structural ratchet, which fires on PRESENCE
       and cannot care whether anything reads. That suite is therefore permitted
       for those rows and for no others, and the verdict is what happens BEYOND
       it. Declaring merely "RED" would be satisfied by a field read in forty
       places, which is the opposite of the claim (D-255's ARM D, corrected). */
    const permitted = (row.readd || row.add) ? [RATCHET_SUITE] : [];
    const beyond = got.filter((s) => !permitted.includes(s));
    console.log(`      permitted without meaning a read: ${permitted.join(", ") || "(nothing — the shape is untouched in this row)"}`);
    console.log(`      beyond that: ${beyond.join(", ") || "(nothing)"}`);
    /* A RED BATTERY IS NOT BY ITSELF EVIDENCE OF A READ, AND THIS PROJECT PAID
       FOR THAT SENTENCE HERE (D-258, 2026-08-09). The `refs` row — the field
       whose whole disposition hangs on this verdict — came back LIVE on its
       first run because `daemon-token.test.mjs` failed, and `daemon-token` had
       nothing to do with `refs`: it is timing-sensitive, it took 4,760ms in that
       pass with SIX concurrent batteries from other worktrees on the machine,
       and driven alone against the identical armed tree it passed 56/0 with the
       tripwire never firing. A whole-battery boolean cannot tell a read from a
       flake, and under real contention flakes happen — so every suite that fails
       BEYOND the permitted set is now RE-DRIVEN ALONE, and only a failure that
       REPRODUCES counts toward LIVE. Cheap (one suite), and it is exactly the
       procedure that resolved the original surprise, automated rather than
       remembered. A red that does not reproduce is reported as what it is. */
    const confirmed = [], flaked = [];
    for (const s of beyond) {
      const r = spawnSync(process.execPath, [`test/${s}`], { cwd: ROOT + "bio-plane", encoding: "utf8" });
      (r.status === 0 ? flaked : confirmed).push(s);
      console.log(`      re-driven ALONE: ${s.padEnd(30)} exit ${r.status} · ${r.status === 0 ? "DID NOT REPRODUCE — not a read" : "REPRODUCED"}`);
    }
    if (flaked.length) console.log(`      *** ${flaked.join(", ")} FAILED IN THE BATTERY AND PASSED ALONE — recorded as a flake, NOT counted as a read ***`);
    const verdict = confirmed.length ? "LIVE" : "DEAD";
    if (row.add) {
      baselineClean = got.join(",") === RATCHET_SUITE;
      console.log(`      CALIBRATION — declared to fail EXACTLY: ${RATCHET_SUITE} (presence, nothing else).`);
      console.log(`      ${baselineClean ? "AS DECLARED — arming a field NOTHING can read disturbs only the ratchet, so the mechanism is inert and the verdicts below stand"
                                         : "*** NOT AS DECLARED — THE MECHANISM IS NOT INERT; EVERY VERDICT BELOW IS VOID ***"}`);
      if (!baselineClean) wrong++;
    }
    const okd = verdict === row.declare;
    console.log(`      VERDICT: ${verdict}${verdict === "LIVE" ? " — something READS it" : " — nothing in the whole battery reads it"}` +
                ` · declared ${row.declare} · ${okd ? "AS DECLARED" : "*** NOT AS DECLARED — THIS IS A FINDING ***"}`);
    if (!okd) wrong++;
    out.push([target, row.declare, verdict, got.join(" ")]);
    restoreAll(tag, `tripwire ${target}`);
  }
  console.log(`\n  LIVE  : ${out.filter((r) => r[2] === "LIVE").map((r) => r[0]).join(", ") || "none"}`);
  console.log(`  DEAD  : ${out.filter((r) => r[2] === "DEAD").map((r) => r[0]).join(", ") || "none"}`);
  console.log(`  BASELINE ROW CLEAN: ${baselineClean === null ? "NOT RUN — the verdicts above are UNCALIBRATED" : baselineClean}`);
  console.log(`  WHAT THIS CANNOT SEE, and it bounds every DEAD above: a reader no suite in the`);
  console.log(`  battery drives. A DEAD verdict is a statement about the estate AS TESTED, not about`);
  console.log(`  the universe — which is why the battery's own suite count is printed on every row.`);
  console.log(`  It also reaches only fields on this ONE descriptor: the rows are hand-anchored to`);
  console.log(`  \`compile()\`'s meaning block and nothing here reaches store.mjs's own constructions,`);
  console.log(`  index.mjs, or the exported static registries.`);
  armsRun += out.length;
}

/* `--emit-armed <target>` installs ONE tripwire row's exact armed file and stops,
   so a row that comes back surprising can be reproduced against a single suite in
   seconds instead of another whole-battery pass. It reuses the sweep's own code
   path rather than reconstructing it — a debug aid that armed the file slightly
   differently would diagnose a tree nobody ran. `--restore` puts it back. */
const EMIT = (process.argv.find((a) => a.startsWith("--emit-armed=")) || "").slice(13);
if (EMIT) {
  const row = TRIP_ROWS.find((r) => r.field === EMIT);
  if (!row) { console.log(`!! no tripwire row named ${EMIT}. Rows: ${TRIP_ROWS.map((r) => r.field).join(", ")}`); process.exit(3); }
  writeFileSync(ROOT + SUBJECT, tripArm(row)(pristineBuf.toString("utf8")));
  console.log(`ARMED FOR DIAGNOSIS: plan.meaning.${EMIT} — run one suite, then re-run with --restore`);
  process.exit(0);
}
if (process.argv.includes("--restore")) { restoreOne("query", SNAP + "PRISTINE__query.mjs", "manual"); process.exit(0); }

const SWEEP_ONLY = process.argv.includes("--sweep");
const TRIPSWEEP = process.argv.includes("--tripwire-sweep");
const dead = sweep();

if (TRIPSWEEP) tripwireSweep();
else if (!SWEEP_ONLY) {
  arm({
    id: "BASE", expectGreen: true, edit: null,
    what: "BASELINE — the tree exactly as it stands, nothing armed",
    mustFail: "nothing",
    mustNotFail: "anything. A harness whose first run reported the same answer for every arm INCLUDING the baseline is on this project's record; only a baseline row tells six-arms-broken from six-arms-working",
  });

  arm({
    id: "P", expectGreen: false,
    what: "POSITIVE CONTROL FOR THE INSTRUMENT — put `phrase` back as a THROWING getter AND inject a read of it in a spelling no grep anticipates (`a[\"ph\" + \"rase\"]`) inside `ftsAtom`, which every text atom passes through",
    mustFail: "the battery, loudly, naming D-255 TRIPWIRE — otherwise the tripwire proves nothing and every green below it is free",
    mustNotFail: "nothing; this arm is about the instrument, not the subject",
    edit: (s) => {
      const withField = trip("atom", "phrase", PHRASE_LIT)(withPhrase(s));
      return withField.replace(uniq(withField, `  const lit = ftsLiteral(a.value) + (a.prefix ? "*" : "");`, "P/ftsAtom"),
        `  if (a["ph" + "rase"]) { /* deliberately unanticipated spelling */ }\n  const lit = ftsLiteral(a.value) + (a.prefix ? "*" : "");`);
    },
  });

  arm({
    id: "O1", expectGreen: true,
    what: "OVER-STRICTNESS, SPELLING — rewrite the GENUINE read of `prefix` in `ftsAtom` into `a[\"pre\" + \"fix\"]` and leave the field itself alone",
    mustFail: "nothing. A classifier that grades spellings would now call `prefix` dead; correct work in a spelling nobody anticipated must stay green",
    mustNotFail: "any suite — the behaviour is identical, only the spelling moved",
    edit: (s) => s.replace(uniq(s, `(a.prefix ? "*" : "")`, "O1/prefix"), `(a["pre" + "fix"] ? "*" : "")`),
  });

  arm({
    id: "O2", expectGreen: false,
    what: "OVER-STRICTNESS, RUNTIME — arm the tripwire on `plan.meaning.table`, which THE SWEEP ABOVE REPORTS AS NEVER READ because its only reader (`store.mjs`'s `meaningRows`) runs inside workerd where the recorder cannot be read back",
    mustFail: "the battery — and that is the whole point of this arm. A live field the node sweep cannot see must NOT be reported dead, and this is what stops the sweep's blind spot from becoming a deletion",
    mustNotFail: "nothing, but WHICH suites fail is the measurement: only the ones that drive op=meaningrows",
    edit: trip("plan.meaning", "table", `table: MEANING[rowArm].table,`),
  });

  /* ARM D CAME BACK NOT AS DECLARED ON ITS FIRST RUN, AND THE DECLARATION WAS
     WRONG RATHER THAN THE SUBJECT. It was declared GREEN — "if `atom.phrase`
     had a reader anywhere this goes red" — and it went RED: **137/138 suites
     green, 8,832 assertions, and the ONLY failures were `query.test.mjs`'s four
     D-255 pins.** Those pins are STRUCTURAL: they read `Object.keys(ast)`, so
     they fire on the field's PRESENCE and cannot care whether anything reads
     it. Re-adding the field is exactly what they exist to catch, so a green
     here was never possible once this item shipped its own ratchet.

     The declaration is corrected rather than the result smoothed, and it is
     corrected into something STRONGER than the boolean it replaced: the arm now
     declares the exact SET of suites permitted to fail. `RED` alone would be
     satisfied by a field read in forty places; "every suite except the four
     structural pins is untouched" is the claim the item actually makes, and it
     is now the thing being checked. The original declaration is left here
     because an arm that came back wrong is a finding about the arm. */
  arm({
    id: "D", expectSuites: ["query.test.mjs"],
    what: "THE SUBJECT — put `phrase` back as a THROWING getter, with no injected read",
    mustFail: "EXACTLY `query.test.mjs`, and in it EXACTLY the four D-255 structural pins, which see the field's PRESENCE. (DECLARED ON THE FIRST RUN AS: nothing at all. That was wrong — see the note above.)",
    mustNotFail: "any other suite in the battery. 137 suites and 8,832 assertions run against a `phrase` that throws on any read, and none of them notices: THAT is the measurement",
    edit: (s) => trip("atom", "phrase", PHRASE_LIT)(withPhrase(s)),
  });

  arm({
    id: "C", expectSuites: ["query.test.mjs"],
    /* CORRECTED BY D-258, NOT EXEMPTED, AND THE CORRECTION IS THE ITEM. When
       D-255 wrote this arm, `columns` was still on the plan, so the arm could
       aim at it directly and GREEN was the right declaration. D-258 DELETED it,
       which broke this arm twice over: its anchor no longer occurs (`uniq` would
       have exited 3 and taken the whole run with it — an arm that cannot arm is
       worse than an arm that fails), and re-adding the field to aim at it is
       seen by D-258's own structural ratchet. So the arm now puts the field back
       first, exactly as the `phrase` arms do, and declares the exact SET of
       suites permitted to fail instead of a boolean. The claim it makes is
       unchanged and is still the one that matters: nothing READS `columns`. */
    what: "THE CLASS — put `columns` back and arm the tripwire on it, the field D-255 found and deliberately did NOT delete, and D-258 did",
    mustFail: "EXACTLY `query.test.mjs`, and in it exactly the three D-258 shape pins, which see PRESENCE. (DECLARED BY D-255 AS: nothing at all, GREEN — correct against the tree D-255 left, and wrong against this one.)",
    mustNotFail: "any other suite — that is what makes it `atom.phrase`'s class rather than `plan.meaning.table`'s",
    edit: (s) => trip("plan.meaning", "columns", COLUMNS_LIT)(withMeaningFields(s)),
  });

  arm({
    id: "R", expectGreen: false, suite: "query.test.mjs",
    /* Deliberately NOT the whole battery: ARM D already ran the battery with
       the field present, so what is left to establish is that the PLAIN field —
       no getter, no throw, byte-for-byte what stood here before this item — is
       caught by the same pins. Running the battery again for that would buy a
       number this file already has. */
    what: "THE RATCHET — re-add `phrase` as an ORDINARY field, exactly as it was before this item, and change nothing else",
    mustFail: "`query.test.mjs`'s three D-255 SHAPE pins, because a field with no consumer is invisible to every behavioural assertion there is and a structural pin is the only thing that can see it come back",
    mustNotFail: "any other assertion in that suite — the compiled expression is identical either way, which is the reason the field was undetectable in the first place",
    edit: withPhrase,
  });

  /* ================================ D-258 ================================
   * FOUR ARMS, and between them they answer the two things the D-258 row said
   * were still owed: `refs` had NO tripwire arm at all, and the reason five of
   * seven sibling fields survived D-255 is that the sweep runs in node while the
   * reader runs in workerd. R2 gives `refs` its arm. P2 and P3 prove the arm
   * would have FIRED — for these exact two fields, in spellings nothing
   * anticipated — so their greens are not free. O3 is the over-strictness arm
   * and it is aimed at a READ rather than at a presence, which is where D-255's
   * ARM D went wrong. C2 is the ratchet.
   * ====================================================================== */

  arm({
    id: "R2", expectSuites: ["query.test.mjs"],
    what: "THE ARM THE D-258 ROW SAYS IS MISSING — put `refs` back and arm the tripwire on it. Until this ran, `refs` rested on a read sweep and on somebody having read `store.mjs:1348-1354`, which is exactly the evidence that was NOT good enough for its five live siblings",
    mustFail: "EXACTLY `query.test.mjs`, and in it exactly the three D-258 shape pins, which see the field's PRESENCE because this arm has to put it back. (DECLARED ON THE FIRST DRAFT AS: nothing at all, GREEN. That was wrong for the same reason D-255's ARM D was wrong — the ratchet this item ships fires on presence — and it is corrected into the exact SET rather than a boolean.)",
    mustNotFail: "any other suite in the battery. If anything at all READS `plan.meaning.refs` — in node or in workerd, by spread, destructure, `in` or serialisation — some other suite goes red and D-258 must be closed as PUBLISH rather than DELETE",
    edit: (s) => trip("plan.meaning", "refs", REFS_LIT)(withMeaningFields(s)),
  });

  arm({
    id: "P2", expectBeyond: ["query.test.mjs"],
    what: "POSITIVE CONTROL FOR THE COLUMNS VERDICT — tripwire `columns` AND inject a read of it inside `store.mjs`'s `meaningRows`, in workerd, spelled `plan.meaning[\"col\" + \"umns\"]`",
    mustFail: "the battery. ARM C's green says nothing reads `columns`; this says the arm CAN see a read of `columns` where a reader would actually live, in a spelling no grep would find. Without it, ARM C's green is free",
    mustNotFail: "nothing — this arm is about the instrument's reach, not about the subject",
    edit: (s) => trip("plan.meaning", "columns", COLUMNS_LIT)(withMeaningFields(s)),
    editStore: injectRead("columns"),
  });

  arm({
    id: "P3", expectBeyond: ["query.test.mjs"],
    what: "POSITIVE CONTROL FOR THE REFS VERDICT — the same for `refs`, spelled `plan.meaning[\"ref\" + \"s\"]` inside `meaningRows`",
    mustFail: "the battery. `refs` is the WEAKER of D-258's two claims by its own row, so its green needs its own positive control rather than borrowing `columns`'",
    mustNotFail: "nothing",
    edit: (s) => trip("plan.meaning", "refs", REFS_LIT)(withMeaningFields(s)),
    editStore: injectRead("refs"),
  });

  arm({
    id: "O3", expectGreen: false,
    what: "OVER-STRICTNESS, A GENUINE READ RESPELLED — take `plan.meaning.grain`, which IS read and IS published, rewrite `store.mjs`'s real read of it into `plan.meaning[\"gr\" + \"ain\"]`, and arm the tripwire on it",
    mustFail: "the battery. THIS IS THE ARM THAT STOPS A LIVE FIELD BEING DELETED: a verdict mechanism that graded spellings would now see no read of `grain` anywhere and report it dead, and `grain` is published to every caller of op=meaningrows. It fires on the READ and not on the field's presence, which is the correction D-255's ARM D earned",
    mustNotFail: "nothing. A green here would mean this item's whole method is blind to exactly the case it claims to cover, and the DELETE decision would have to be withdrawn",
    edit: trip("plan.meaning", "grain", `grain: MEANING[rowArm].rowGrain,`),
    editStore: respellGrain,
  });

  arm({
    id: "C2", expectGreen: false, suite: "query.test.mjs",
    what: "THE RATCHET — re-add `columns` and `refs` as ORDINARY fields, exactly as they stood before this item, and change nothing else",
    mustFail: "`query.test.mjs`'s D-258 shape pin. A field with no consumer is invisible to every behavioural assertion there is — that is how these two survived PL-9, D-222 and D-255 — so a STRUCTURAL pin is the only thing that can see them come back",
    mustNotFail: "any other assertion in that suite. The compiled statements are identical either way, which is the whole reason the fields were undetectable",
    edit: withMeaningFields,
  });
}

console.log(`\n================ RESULT ================`);
console.log(`arms run ${armsRun} · not as declared ${wrong}`);
console.log(`never-read constructed fields: ${dead.length ? dead.join(", ") : "NONE"}`);
/* EVERY subject, not just the one an arm meant to touch. */
let clean = true;
for (const [key, s] of Object.entries(SUBJECTS)) {
  const finalBuf = readFileSync(ROOT + s.path);
  const ok = sha(finalBuf) === s.sha;
  clean &&= ok;
  console.log(`final tree: ${s.path} sha256 ${sha(finalBuf).slice(0, 12)}… ${finalBuf.length} bytes · ${ok ? "PRISTINE" : "*** NOT PRISTINE ***"}`);
}
/* The snapshot directory is REMOVED on a clean run, and kept on a dirty one so
   the pristine copy is still there to restore from by hand. A harness that
   leaves untracked files under `test/` is one `.test.mjs` away from the hazard
   REC-68 measured: an untracked suite discovered by `battery.mjs`, counted into
   a total, and invisible to `git status` as anything but `??`. */
if (clean && wrong === 0) rmSync(SNAP, { recursive: true, force: true });
else console.log(`  snapshots KEPT at ${SNAP} — restore by hand from PRISTINE__query.mjs`);
process.exit(clean && wrong === 0 ? 0 : 1);
