/* D-255 — IS A FIELD READ BY ANYBODY? THE INSTRUMENT, AND ITS NEGATIVE CONTROLS.
 *
 *     cd bio-plane && node test/fieldread.control.mjs            (sweep + arms)
 *     cd bio-plane && node test/fieldread.control.mjs --sweep     (the sweep only)
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

function instrument(src) {
  let s = src;
  for (const [label, from, to] of WRAPS) s = s.replace(uniq(s, from, label), to);
  /* The helper goes in AFTER the last import, so it is defined before any call. */
  const anchor = uniq(s, `\n/* ---------------------------------------------------------------------------\n * Parser:`, "probe-anchor");
  return s.replace(anchor, `\n${PROBE}${anchor}`);
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

/* -------------------------------------------------------------- THE SWEEP RUN */
const SUBJECT = "bio-plane/src/query.mjs";
if (!existsSync(SNAP)) mkdirSync(SNAP, { recursive: true });

const pristineBuf = readFileSync(ROOT + SUBJECT);
const pristineSha = sha(pristineBuf);
writeFileSync(SNAP + `PRISTINE__query.mjs`, pristineBuf);
console.log(`pristine  ${SUBJECT}  sha256 ${pristineSha.slice(0, 12)}…  ${pristineBuf.length} bytes`);
if (pristineBuf.length < 20000) { console.log("!! PRISTINE IS IMPLAUSIBLY SMALL — refusing to run"); process.exit(2); }

const restore = (snapPath, label) => {
  writeFileSync(ROOT + SUBJECT, readFileSync(snapPath));
  const after = readFileSync(ROOT + SUBJECT);
  const shaOk = sha(after) === pristineSha;
  let cmpOk = false;
  try { execFileSync("cmp", [ROOT + SUBJECT, snapPath]); cmpOk = true; } catch { cmpOk = false; }
  console.log(`RESTORE ${label}: sha256 ${shaOk ? "EQUAL" : "DIFFERENT"} · cmp ${cmpOk ? "IDENTICAL" : "DIFFERS"} · ${after.length} bytes`);
  if (!shaOk || !cmpOk || after.length !== pristineBuf.length) { console.log("!! RESTORE FAILED"); process.exit(2); }
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
const arm = ({ id, what, mustFail, mustNotFail, edit, expectGreen, expectSuites, suite }) => {
  if (ONLY && ONLY !== id) return;
  console.log(`\n================ ARM ${id} ================`);
  console.log(`WHAT:          ${what}`);
  console.log(`MUST FAIL:     ${mustFail}`);
  console.log(`MUST NOT FAIL: ${mustNotFail}`);
  const before = readFileSync(ROOT + SUBJECT);
  if (sha(before) !== pristineSha) { console.log("!! TREE IS NOT PRISTINE AT ARM START — aborting"); process.exit(2); }
  const snapPath = SNAP + `${id}__query.mjs`;
  writeFileSync(snapPath, before);
  const armed = edit ? edit(before.toString("utf8")) : before.toString("utf8");
  if (edit && armed === before.toString("utf8")) { console.log("!! ARM NEVER ARMED — the edit changed nothing"); wrong++; return; }
  writeFileSync(ROOT + SUBJECT, armed);
  console.log(`ARMED: ${before.length} -> ${Buffer.byteLength(armed)} bytes${edit ? "" : "  (BASELINE — nothing is broken in this arm, on purpose)"}`);
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
      restore(snapPath, `arm ${id}`);
      armsRun++;
      return;
    }
  }
  console.log(line);
  console.log(`  DECLARED ${expectGreen ? "GREEN" : "RED"} · ACTUAL ${green ? "GREEN" : "RED"} · ${green === expectGreen ? "AS DECLARED" : "*** NOT AS DECLARED — THIS IS A FINDING ***"}`);
  if (green !== expectGreen) wrong++;
  restore(snapPath, `arm ${id}`);
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

const SWEEP_ONLY = process.argv.includes("--sweep");
const dead = sweep();

if (!SWEEP_ONLY) {
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
    id: "C", expectGreen: true,
    what: "THE CLASS — arm the tripwire on `plan.meaning.columns`, the OTHER never-read field the sweep found, which this item deliberately did NOT delete",
    mustFail: "nothing, which is what makes it the same class as `atom.phrase` rather than the same class as `plan.meaning.table` above",
    mustNotFail: "any suite",
    edit: trip("plan.meaning", "columns", `columns: MEANING[rowArm].row,`),
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
}

console.log(`\n================ RESULT ================`);
console.log(`arms run ${armsRun} · not as declared ${wrong}`);
console.log(`never-read constructed fields: ${dead.length ? dead.join(", ") : "NONE"}`);
const finalBuf = readFileSync(ROOT + SUBJECT);
const clean = sha(finalBuf) === pristineSha;
console.log(`final tree: ${SUBJECT} sha256 ${sha(finalBuf).slice(0, 12)}… ${finalBuf.length} bytes · ${clean ? "PRISTINE" : "*** NOT PRISTINE ***"}`);
/* The snapshot directory is REMOVED on a clean run, and kept on a dirty one so
   the pristine copy is still there to restore from by hand. A harness that
   leaves untracked files under `test/` is one `.test.mjs` away from the hazard
   REC-68 measured: an untracked suite discovered by `battery.mjs`, counted into
   a total, and invisible to `git status` as anything but `??`. */
if (clean && wrong === 0) rmSync(SNAP, { recursive: true, force: true });
else console.log(`  snapshots KEPT at ${SNAP} — restore by hand from PRISTINE__query.mjs`);
process.exit(clean && wrong === 0 ? 0 : 1);
