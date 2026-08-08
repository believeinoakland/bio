/* REC-68 / D-228 — THE NEGATIVE CONTROLS, COMMITTED SO THEY RE-RUN IN ONE STEP.
 *
 *     cd bio-plane && node test/query.control.mjs
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES while it runs, so
 * `scripts/battery.mjs` must not discover it. `suggest.control.mjs`,
 * `register.control.mjs` and `strengthpair.control.mjs` are the precedent.
 *
 * The arms are DECLARED in `query.test.mjs`'s own NEGATIVE CONTROL block with
 * the counts each produced; this file is what produces them.
 *
 * Each arm is armed ALONE with every other held open, each DECLARES BEFORE IT
 * RUNS what must fail and what must NOT, and every restore is verified against
 * a PRISTINE pre-arm copy by sha256 AND by content (`cmp`).
 *
 * THE SNAPSHOT NAMES ARE UNIQUE PER ARM, NOT DERIVED FROM THE PATH. A harness
 * that named two snapshots of one file from the path alone had the second
 * overwrite the first, and `cmp` caught what sha256 could not. Every snapshot
 * here is `<arm>__<basename>` and the pristine set is taken ONCE, before any
 * arm runs, so a restore is compared against the tree as it was at the start
 * rather than against whatever the previous arm left.                          */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const SNAP = fileURLToPath(new URL("./.query-control-pristine/", import.meta.url));
if (!existsSync(SNAP)) mkdirSync(SNAP, { recursive: true });

const SUBJECTS = {
  query: "bio-plane/src/query.mjs",
  schema: "bio-plane/src/schema.mjs",
};
const sha = (b) => createHash("sha256").update(b).digest("hex");

/* THE PRISTINE SET, taken ONCE. */
const pristine = {};
for (const [k, rel] of Object.entries(SUBJECTS)) {
  const buf = readFileSync(ROOT + rel);
  pristine[k] = { rel, buf, sha: sha(buf) };
  writeFileSync(SNAP + `PRISTINE__${k}__${rel.split("/").pop()}`, buf);
  console.log(`pristine  ${rel}  sha256 ${pristine[k].sha.slice(0, 12)}…  ${buf.length} bytes`);
}

/* REFUSE TO ARM BLIND. `String.replace` with a string pattern silently patches
   the FIRST occurrence, and this harness's first version paid for it: the
   pattern ` && src[i] !== '"') s += src[i++];` occurs TWICE in `tokenize` —
   once in the QUOTED run's loop (line 574) and once in the BARE run's (579) —
   so arms (b) and (d) patched the quoted reader, not the bare one. They failed
   16 assertions and looked convincing while measuring something else entirely.
   Every anchor is now COUNTED, and an arm whose anchor is not unique refuses
   rather than guessing which one the author meant. PL-10's harness reached the
   same rule from the same direction, one component over. */
const uniq = (src, needle) => {
  const n = src.split(needle).length - 1;
  if (n !== 1) { console.log(`!! ANCHOR IS NOT UNIQUE (${n} occurrence(s)): ${JSON.stringify(needle.slice(0, 70))}`); process.exit(3); }
  return needle;
};

const count = (src, needle, want) => {
  const n = src.split(needle).length - 1;
  if (n !== want) { console.log(`!! ANCHOR COUNT ${n}, EXPECTED ${want}: ${JSON.stringify(needle.slice(0, 70))}`); process.exit(3); }
  return needle;
};

const run = (cmd, args) => {
  try {
    const out = execFileSync(cmd, args, { cwd: ROOT + "bio-plane", encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { code: 0, out };
  } catch (e) { return { code: e.status ?? -1, out: (e.stdout || "") + (e.stderr || "") }; }
};
const counts = (out) => {
  const m = out.match(/(\d+) pass, (\d+) fail/);
  return m ? { pass: +m[1], fail: +m[2] } : { pass: null, fail: null };
};
const firstFails = (out, n = 3) => out.split("\n").filter((l) => l.includes("FAIL")).slice(0, n).map((l) => l.trim());

let armsRun = 0, wrong = 0;
const arm = ({ id, what, subject, edit, mustFail, mustNotFail, suites }) => {
  console.log(`\n================ ARM ${id} ================`);
  console.log(`WHAT:          ${what}`);
  console.log(`MUST FAIL:     ${mustFail}`);
  console.log(`MUST NOT FAIL: ${mustNotFail}`);
  const p = pristine[subject];
  const before = readFileSync(ROOT + p.rel);
  if (sha(before) !== p.sha) { console.log("!! TREE IS NOT PRISTINE AT ARM START — aborting"); process.exit(2); }
  /* the UNIQUE pre-arm snapshot for this arm */
  const snapPath = SNAP + `${id}__${p.rel.split("/").pop()}`;
  writeFileSync(snapPath, before);

  const armed = edit(before.toString("utf8"));
  if (armed === before.toString("utf8")) { console.log("!! ARM NEVER ARMED — the edit changed nothing"); wrong++; return; }
  writeFileSync(ROOT + p.rel, armed);
  console.log(`ARMED: ${p.rel} ${before.length} -> ${Buffer.byteLength(armed)} bytes`);

  for (const s of suites) {
    const r = run("node", [`test/${s}`]);
    const c = counts(r.out);
    console.log(`  ${s.padEnd(26)} exit ${String(r.code).padEnd(3)} ${c.pass} pass, ${c.fail} fail`);
    for (const f of firstFails(r.out)) console.log(`      ${f.slice(0, 150)}`);
  }

  /* RESTORE, verified two ways against the UNIQUE snapshot AND the pristine set. */
  writeFileSync(ROOT + p.rel, readFileSync(snapPath));
  const after = readFileSync(ROOT + p.rel);
  const shaOk = sha(after) === p.sha;
  let cmpOk = false;
  try { execFileSync("cmp", [ROOT + p.rel, snapPath]); cmpOk = true; } catch { cmpOk = false; }
  console.log(`RESTORE: sha256 ${shaOk ? "EQUAL" : "DIFFERENT"} · cmp ${cmpOk ? "IDENTICAL" : "DIFFERS"}`);
  if (!shaOk || !cmpOk) { console.log("!! RESTORE FAILED"); process.exit(2); }
  armsRun++;
};

/* ---------------------------------------------------------------------- */

arm({
  id: "b", subject: "query", suites: ["query.test.mjs", "meaningquery.test.mjs", "search.test.mjs"],
  what: "RESTORE THE QUOTE-STRIPPING DEFECT — drop `&& src[i] !== '\"'` from the bare reader's terminator set",
  mustFail: "query.test.mjs (the value, the phrase and the reachability blocks), meaningquery.test.mjs's flipped pins, and search.test.mjs — the LAST of which is the measurement of what the broken spelling MATCHED",
  mustNotFail: "nothing outside the quoted-value blocks; the AND-semantics and gate assertions must stay green",
  edit: (s) => s.replace(uniq(s, `&& src[i] !== ")" && src[i] !== '"') s += src[i++];`),
                         `&& src[i] !== ")") s += src[i++];`),
});

arm({
  id: "c", subject: "query", suites: ["query.test.mjs"],
  what: "MAKE THE BRANCH UNREACHABLE AGAIN — re-guard it with the original unsatisfiable conjunction, LEAVING the reader's quote terminator in place",
  mustFail: "the REACHABILITY block, because reachability is the subject and is asserted rather than assumed",
  mustNotFail: "nothing else should even be reachable to fail — but see the note printed below the result",
  edit: (s) => s.replace(`      if (src[i] === '"') {`, `      if (rest === "" && src[i] === '"' && false) {`),
});

/* ARM d, FIRST ATTEMPT, RECORDED BECAUSE IT CAME BACK GREEN AND THAT IS A
   FINDING ABOUT THE ARM RATHER THAN ABOUT THE SUBJECT.

   It set `quoted: false` on the selector token, expecting phrase detection to
   die while the value round-tripped. `query.test.mjs` stayed 115 pass, 0 fail.
   CAUSE, measured rather than guessed: `textAtom` writes `phrase: quoted &&
   /\s/.test(v)` onto the atom and NOTHING IN `src/` EVER READS IT — one write
   site, zero read sites across the whole plane and the UI. The compiled FTS5
   literal is `ftsLiteral(value)` either way, and FTS5 treats a multi-word
   string literal as a phrase on its own. So the arm was armed against a field
   with no consumer and COULD NEVER HAVE BEEN HONOURED. It is left here rather
   than deleted, because "the arm could not have fired" is the result.

   It also found a second instance of this item's own class, one layer along:
   `atom.phrase` is a DEAD FIELD — computed, documented by its name, and read by
   nobody. Reported, not fixed: removing it is not REC-68's scope. */
arm({
  id: "d0", subject: "query", suites: ["query.test.mjs"],
  what: "THE ARM THAT COULD NOT FIRE (kept as a record) — drop the `quoted` flag the branch sets",
  mustFail: "DECLARED: the phrase assertions. ACTUAL: nothing — `atom.phrase` has no reader, so this arm measured nothing",
  mustNotFail: "the value-equality assertions",
  edit: (s) => s.replace(uniq(s, `value: rest, quoted: onlyQuoted && pieces === 1 });`),
                         `value: rest, quoted: false });`),
});

/* ARM d, REBUILT so it actually tests what it claims: a revert that keeps the
   VALUE round-tripping correctly for the single-word case while making the
   documented branch unreachable again. The original bare reader is restored
   (so the quote is swallowed) and the quotes are stripped downstream in
   `selector()` instead — a DIFFERENT mechanism reaching the same answer, which
   is precisely the shape a later author would call a harmless refactor. */
arm({
  id: "d", subject: "query", suites: ["query.test.mjs"],
  what: "AN EQUIVALENT-MECHANISM REVERT — restore the swallowing bare reader and strip the quotes in `selector()` instead, so single-word values round-trip while the branch goes unreachable again",
  mustFail: "the STRUCTURAL reachability pins (only they can see this), AND the multi-word PHRASE assertions — because no downstream strip can reassemble a value the tokenizer already split at the space",
  mustNotFail: "the SINGLE-WORD value equalities on enumerations, which round-trip perfectly — that is what makes this revert look harmless",
  edit: (s) => s
    .replace(uniq(s, `&& src[i] !== ")" && src[i] !== '"') s += src[i++];`),
             `&& src[i] !== ")") s += src[i++];`)
    /* DELIBERATELY BOTH: `let raw = String(tok.value);` occurs twice — in
       `selector()` and in `meaningAtom()` — and the uniqueness guard caught it,
       which is the second ambiguous anchor this harness has been saved from. A
       faithful equivalent-mechanism revert strips in both, because a revert
       that fixed only the projected fields would fail the arm for a reason
       other than the one declared. */
    .replace(count(s, `  let raw = String(tok.value);\n`, 2),
             `  let raw = String(tok.value).replace(/^"(.*)"$/, "$1");\n`)
    .replace(`  let raw = String(tok.value);\n`, `  let raw = String(tok.value).replace(/^"(.*)"$/, "$1");\n`),
});

arm({
  id: "s1", subject: "schema", suites: ["hygiene.test.mjs"],
  what: "DROP A GRADE SOURCE FROM THE COMMENT — delete `| 'capture'` from the grade_source line",
  mustFail: "hygiene's correspondence arm, NAMING `capture`, and the REACH delta at 4 against 5",
  mustNotFail: "the schema-literal arms, migrate, and every other hygiene block",
  edit: (s) => s.replace(`  grade_source TEXT,            -- 'resolution' | 'testimony' | 'hunch' | 'inherited' | 'capture'`,
                         `  grade_source TEXT,            -- 'resolution' | 'testimony' | 'hunch' | 'inherited'`),
});

arm({
  id: "s2", subject: "schema", suites: ["hygiene.test.mjs"],
  what: "INVENT A GRADE SOURCE — add `| 'guess'` to the comment",
  mustFail: "the invention arm, NAMING `guess` — a comment that can omit a value can also make one up",
  mustNotFail: "the omission arm, which must stay green so the two directions are distinguishable",
  edit: (s) => s.replace(`| 'inherited' | 'capture'\n`, `| 'inherited' | 'capture' | 'guess'\n`),
});

arm({
  id: "s3", subject: "schema", suites: ["hygiene.test.mjs", "migrate.test.mjs"],
  what: "PUT THE `#migrate` TRAP BACK — a semicolon inside the inline comment",
  mustFail: "hygiene's semicolon arm — and this is the arm that CAUGHT THE AUTHOR in the same turn",
  mustNotFail: "nothing else in hygiene; migrate is run to show what the trap actually costs",
  edit: (s) => s.replace(`-- GRADE_SOURCES in checks/bio-checks.mjs is the authority (DEC-15)`,
                         `-- GRADE_SOURCES in checks/bio-checks.mjs is the authority; DEC-15`),
});

/* The pre-arm snapshots are removed once every restore has been verified
   against them. They exist to be compared, not to be kept, and a control
   that leaves working files behind is one the next session has to clean up
   before it can read `git status`. */
rmSync(SNAP, { recursive: true, force: true });

console.log(`\n\n================ SUMMARY ================`);
console.log(`arms run: ${armsRun} · arms that never armed: ${wrong}`);
for (const [k, p] of Object.entries(pristine)) {
  const now = readFileSync(ROOT + p.rel);
  console.log(`${p.rel}: sha256 ${sha(now) === p.sha ? "EQUAL to pristine" : "!! DIFFERENT"} (${p.sha.slice(0, 12)}…)`);
}
