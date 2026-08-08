/* SK-1 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so
 * `scripts/battery.mjs` (which discovers `.endsWith(".test.mjs")` and nothing
 * else) must not collect it. PL-2's `versionstate.control.mjs` and VF-2's
 * `refusal-codes.control.mjs` are the precedents, and this file is that shape.
 *
 * IT LIVES INSIDE THIS WORKTREE and never in a shared scratchpad. On 2026-08-07
 * a worker's harness was OVERWRITTEN MID-TURN by another running worker, and a
 * harness silently replaced between ARM and RESTORE reports a restore it never
 * performed.
 *
 * EVERY RESTORE IS VERIFIED BY CONTENT AS WELL AS BY HASH. A sha256 comparison
 * answers "the bytes are the same" only if the reader that produced both digests
 * was the same reader; a byte comparison of the strings answers it outright.
 *
 * THE ROW'S OWN CONTROL IS RUN IN BOTH DIRECTIONS, and that is not thoroughness
 * for its own sake. "Strip the version from a run's conditions" has two
 * meanings and they fail differently: strip the GUARD and a run opens under
 * instructions nobody can name; strip the RECORDING and the run says what it ran
 * under while the record forgets. Only the first is visible at the door, and
 * only the second collapses vN and vN+1 onto each other — which is the property
 * SK-1 is judged on.
 *
 * Run it:  node test/skillpack.control.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = {
  store: ROOT + "src/store.mjs",
  index: ROOT + "src/index.mjs",
  pack:  ROOT + "src/skillpack.mjs",
  /* THE SUITE ITSELF IS ARMABLE, and arm (8) arms it. An instrument its own
     controls cannot reach is an instrument nobody has shown can go red — VF-2's
     guard found two defects in ITSELF, which is the precedent for this line. */
  test:  ROOT + "test/skillpack.test.mjs",
};
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));

let armsRun = 0, armsWrong = 0;

function runSuite(name = "skillpack.test.mjs") {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/" + name], { encoding: "utf8", timeout: 300000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  const m = [...out.matchAll(/(\d+)\s+pass,\s+(\d+)\s+fail/g)].pop();
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 110));
  /* A suite that THREW before its tail line reports no count. That is not zero
     failures and must never read as a green arm — it is reported as UNKNOWN and
     counted as a wrong arm below, because a control whose subject crashed proves
     nothing about the assertion it claims to have broken. */
  return m ? { pass: +m[1], fail: +m[2], named, out, crashed: false }
           : { pass: null, fail: null, named, out, crashed: true };
}

function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 60)}…' occurs ${n} times in `
    + `${key}. An unguarded edit would have armed ${n} sites, and a control armed in more places than `
    + `it claims is not the control it reports.`);
  writeFileSync(F[key], src.replace(from, to));
}

function restoreAll() {
  for (const [k, p] of Object.entries(F)) writeFileSync(p, ORIGINAL[k]);
  for (const [k, p] of Object.entries(F)) {
    const now = readFileSync(p, "utf8");
    if (sha(now) !== ORIGINAL_SHA[k]) throw new Error(`RESTORE FAILED BY HASH: ${k}`);
    if (now !== ORIGINAL[k]) throw new Error(`RESTORE FAILED BY CONTENT: ${k}`);
  }
}

/** An arm states which assertions MUST fail, by a fragment of their label, and
 *  may state which must be ABSORBED. An arm that fails "somewhere" proves the
 *  suite is sensitive to something; an arm that fails AT ITS OWN ASSERTION
 *  proves that assertion is doing the work. */
function arm(title, edits, mustFail, mustNotFail = []) {
  armsRun++;
  console.log(`\n=== ${title}`);
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const r = runSuite();
    console.log(`  MEASURED: ${r.crashed ? "UNKNOWN (the suite did not reach its tail line)" : `${r.pass} pass, ${r.fail} fail`}`);
    for (const n of r.named) console.log(`    FAILED: ${n}`);
    const hit = (frag) => r.named.some((n) => n.includes(frag));
    let wrong = false;
    if (r.crashed) { console.log("  ** WRONG: the suite crashed rather than failing an assertion; this arm measured nothing"); wrong = true; }
    for (const frag of mustFail)
      if (!hit(frag)) { console.log(`  ** WRONG: expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
    for (const frag of mustNotFail)
      if (hit(frag)) { console.log(`  ** WRONG: "${frag}" failed, and this arm must be ABSORBED there`); wrong = true; }
    if (!r.crashed && !r.fail) { console.log("  ** WRONG: the suite stayed GREEN. A control that cannot fail proves nothing."); wrong = true; }
    if (wrong) armsWrong++;
  } finally {
    restoreAll();
    console.log("  restored: every file verified by sha256 AND by content");
  }
}

console.log("SK-1 — negative controls. Whole-tree baseline first, so every arm is a DELTA.");
const base = runSuite();
console.log(`  BASELINE: ${base.pass} pass, ${base.fail} fail`);
if (base.fail !== 0) { console.log("  ** the tree is not whole; arms below would measure the wrong thing"); process.exit(1); }

/* ------------------------------------------------------------------- (1) */
arm("(1) THE ROW'S OWN, DIRECTION ONE — STRIP THE VERSION FROM A RUN'S CONDITIONS AT THE DOOR. "
  + "Remove the guard, so a run may open without naming the pack it ran under. The column still "
  + "exists and the read still publishes it; what is gone is the requirement, which is exactly the "
  + "difference between 'every run records it' and 'the runs that felt like it did'.",
  [["store", `    const badSkill = checkSkillVersion(skillVersion);
    if (badSkill)
      return { run, started: false, code: badSkill.code, check: badSkill.check,
               translation: badSkill.translation, note: badSkill.detail };`, ``]],
  ["ARM E1", "ARM E3", "ARM E4", "ARM E6"]);

/* ------------------------------------------------------------------- (2) */
arm("(2) THE ROW'S OWN, DIRECTION TWO — STRIP THE RECORDING RATHER THAN THE GUARD. The run still "
  + "SAYS what it ran under and is still refused if it cannot; the record simply does not keep the "
  + "answer. This is the direction the door cannot see, and it collapses vN and vN+1 onto each other.",
  [["store", `        String(skillVersion).trim(),`, `        null,`]],
  ["ARM D2", "ARM D3", "ARM D4", "ARM D5"],
  ["ARM E1"]);

/* ------------------------------------------------------------------- (3) */
arm("(3) THE SOURCING CONTROL — A HAND COPY OF A DRIVEN VOCABULARY, which is the failure "
  + "ASSISTANT-PILOT §1 is built against and the one this repository has measured most often. The "
  + "vocabulary layer stops being what the plane published and becomes what somebody typed.",
  [["pack", `      body: vocabularies,`,
            `      body: { action_kind: ["cpra_request", "public_comment", "other"] },`]],
  ["ARM A6", "ARM B2a"]);

/* ------------------------------------------------------------------- (4) */
arm("(4) THE EMPTY CASE. Remove the four render guards. THE ARMS THAT FAIL ARE THE LEAST "
  + "interesting part: what matters is that A6's EQUALITY still passes over an empty published "
  + "answer, because `{}` equals `{}`. The non-empty guard is the evidence, not the equality "
  + "(D-216's arm 3, measured again in a different family).",
  [["pack", `  if (!vocabularies || Object.keys(vocabularies).length === 0)
    throw new Error("the pack renders the plane's PUBLISHED vocabulary and invents none, so it "
      + "cannot be rendered against an empty one: op=affordances published no vocabularies");
  if (!catalog || catalog.length === 0)
    throw new Error("the pack renders the plane's PUBLISHED act catalogue and invents none, so it "
      + "cannot be rendered against an empty one: op=affordances published no acts");`, ``],
   ["pack", `  if (fences.length === 0)
    throw new Error("the machine/member boundary is rendered from the check catalogue's own canned "
      + "translations and this pack writes none of its own: no fence row was harvested");`, ``],
   ["pack", `  if (memberOnly.length === 0)
    throw new Error("the machine/member boundary names the acts a machine credential cannot reach, "
      + "read from the published \`mode\`: the catalogue published none");`, ``]],
  ["ARM C4a", "ARM C4b", "ARM C4c"]);

/* ------------------------------------------------------------------- (5) */
arm("(5) THE VERSION DERIVATION. A hand-bumped version discloses what somebody REMEMBERED to bump. "
  + "Drop the digest and the pack version stops depending on what was rendered — two packs built "
  + "from two different published vocabularies then carry the same version, and no run object can "
  + "tell them apart.",
  [["pack", "return `${SKILL_PACK_ID}@${DOCTRINE_EDITION}+${digest(canonical(rest))}`;",
            "return `${SKILL_PACK_ID}@${DOCTRINE_EDITION}`;"]],
  ["ARM C2"]);

/* ------------------------------------------------------------------- (6) */
arm("(6) THE PIN ON THE ONE PUBLISHED TOKEN THIS PACK NAMES. Rename the machine mode where the "
  + "plane MINTS it. Nothing else in the battery yields that value today — A9 measures zero "
  + "machine-reachable acts — so without this pin a rename would move the boundary's meaning with "
  + "nothing to notice.",
  [["index", `      : SESSION_OPS.admin.has(a.id) ? "admin-session" : "machine",`,
              `      : SESSION_OPS.admin.has(a.id) ? "admin-session" : "unattended",`]],
  ["ARM A10"]);

/* ------------------------------------------------------------------- (7) */
arm("(7) THE AUTHORED LAYER. Change one word of the objective. The slowest-drifting layer is the "
  + "one nobody re-reads, which is exactly why it is held to the document it was quoted from.",
  [["pack", `  "Formulate claims and legs SUPPORTED BY EVIDENCE. The goal is not to support or disprove a position.";`,
            `  "Formulate claims and legs SUPPORTED BY EVIDENCE. The goal is not to support or refute a position.";`]],
  ["ARM F1"]);

/* ------------------------------------------------------------------- (8) */
arm("(8) THE INSTRUMENT ITSELF — NEUTER THE SOURCING SCANNER. Make the comment stripper return "
  + "nothing, so `literalsOf` reads no literals at all. B2a and B2b then pass over an EMPTY corpus "
  + "of literals, which is the shape of every walk that has gone blind while reporting green. B0 "
  + "(the stripper's own fixture) and B3 (the scanner run over a hand copy that must trip it) are in "
  + "the suite precisely so this arm has something to fail, and they are what stops B2a/B2b being a "
  + "green light nobody has shown can go red.",
  [["test", `function stripComments(src) {\n  let out = "", i = 0;`,
            `function stripComments(src) {\n  if (src) return "";\n  let out = "", i = 0;`]],
  ["ARM B0", "ARM B3"],
  ["ARM B2a", "ARM B2b"]);

/* ------------------------------------------------------------------ (4b) */
/* A DEMONSTRATION RATHER THAN AN ARM, because the thing worth showing is what
   stays GREEN, and no assertion in the suite fails on it — that is the whole
   point. Arm (4) removes the render guards; this then renders a pack over an
   EMPTY published answer and asks A6's own question of it. If the answer is
   "identical", the equality arm is satisfied by nothing at all.
   Written as a demonstration and not an assertion so it cannot be mistaken for
   a guarantee this suite provides: what the suite provides is the guard. */
{
  armsRun++;
  console.log("\n=== (4b) DEMONSTRATION — with the guards gone, does A6's EQUALITY still pass over "
    + "an EMPTY published answer? This is D-216's arm 3 asked in this family.");
  try {
    edit("pack", `  if (!vocabularies || Object.keys(vocabularies).length === 0)
    throw new Error("the pack renders the plane's PUBLISHED vocabulary and invents none, so it "
      + "cannot be rendered against an empty one: op=affordances published no vocabularies");
  if (!catalog || catalog.length === 0)
    throw new Error("the pack renders the plane's PUBLISHED act catalogue and invents none, so it "
      + "cannot be rendered against an empty one: op=affordances published no acts");`, ``);
    edit("pack", `  if (memberOnly.length === 0)
    throw new Error("the machine/member boundary names the acts a machine credential cannot reach, "
      + "read from the published \`mode\`: the catalogue published none");`, ``);
    const script = `
      import { renderPack } from ${JSON.stringify(F.pack)};
      const published = { vocabularies: {}, catalog: [] };
      const pack = renderPack(published, await import(${JSON.stringify(ROOT + "checks/bio-checks.mjs")}));
      const identical = JSON.stringify(pack.disclosed.vocabularies.body)
                     === JSON.stringify(published.vocabularies);
      console.log("  rendered over an EMPTY published answer: " + (identical ? "A6's EQUALITY HOLDS" : "equality broken"));
      console.log("  terms in the pack's vocabulary layer: "
        + Object.keys(pack.disclosed.vocabularies.body || {}).length
        + " · acts: " + (pack.disclosed.acts.body.catalog || []).length
        + " · version still rendered: " + pack.version);
    `;
    let out = "";
    try {
      out = execFileSync(process.execPath, ["--input-type=module", "-e", script],
                         { encoding: "utf8", timeout: 120000 });
    } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
    console.log(out.trimEnd());
    if (out.includes("A6's EQUALITY HOLDS"))
      console.log("  READ THIS: the equality is satisfied by NOTHING. The non-empty guard (ARM A1) and "
        + "the render's own throw are the evidence — the equality never was.");
    else { console.log("  ** UNEXPECTED: the demonstration did not reproduce; report it rather than dropping it"); armsWrong++; }
  } finally {
    restoreAll();
    console.log("  restored: every file verified by sha256 AND by content");
  }
}

console.log(`\n${armsRun} arm(s) run, ${armsWrong} WRONG.`);
if (armsWrong) process.exitCode = 1;
