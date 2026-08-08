/* surface-registry-a4.control.mjs — UI-52's NEGATIVE CONTROLS, 2026-08-08.
 *
 * NOT a `.test.mjs`, so `civicos-ui/test/run.mjs`'s discovery does not collect
 * it (PL-2's `bio-plane/test/versionstate.control.mjs` is the precedent). It is
 * committed so the next session can RE-RUN the controls in one step instead of
 * re-deriving how to break the subject, which is CLAUDE.md's rule for a
 * `NEGATIVE CONTROL:` line.
 *
 *     node civicos-ui/test/surface-registry-a4.control.mjs
 *
 * WHAT IT PROVES, and the split is the whole item:
 *
 *   (1a) FICTION, ROUTE — a surface describing a route the runtime does not
 *        have. UNCONDITIONAL. This is the arm proving UI-52's narrowing did NOT
 *        blind the guard.
 *   (1b) FICTION, ACT — a surface hosting an act the plane does not publish.
 *        UNCONDITIONAL, and the act register is not consulted.
 *   (2)  THE CEILING — a SEVENTH published act with no surface and no register
 *        row. Must fail NAMING it, so the gap cannot grow silently.
 *   (3a) THE FLOOR, catalogue — the plane's act catalogue neutered. The ceiling
 *        would otherwise pass trivially over nothing (REC-70).
 *   (3b) THE FLOOR, walk — the registry's act placements neutered.
 *   (4)  THE DRAIN — one register row's act given a surface. The ceiling must
 *        FALL: the suite REQUIRES the row be struck, so the bill drains rather
 *        than becoming permanent furniture.
 *   (5)  POLARITY — every arm is confirmed GREEN on the intact tree with its
 *        expected message ABSENT before it is confirmed RED with the defect
 *        present, in that order and never the reverse.
 *
 * EVERY MUTATION IS MADE ON DISK AND RESTORED, and every restore is verified BY
 * CONTENT as well as by sha256 — an earlier run of these controls in this
 * harness reported a byte-identical restore over a file that had not been
 * restored, so the sha comparison alone is not trusted here.
 *
 * `--pl2 <dir>` swaps `<dir>/affordances.PL2MERGED.mjs` and
 * `<dir>/bio-checks.PL2MERGED.mjs` in for the duration of every arm. It was
 * needed on 2026-08-08 ONLY because UI-52 was built on a branch that did not yet
 * carry PL-2 — the six acts the register names had not landed, so arms (2) and
 * (4) had nothing real to bite on. Once PL-2 is integrated the flag is dead
 * weight: run it with no arguments and the controls bite on the real tree.
 */
import fs from "fs";
import crypto from "crypto";
import { spawnSync } from "child_process";

const ROOT = new URL("../..", import.meta.url).pathname;
const APP = "civicos-ui/app.html";
const AFF = "bio-plane/src/affordances.mjs";
const CHK = "bio-plane/checks/bio-checks.mjs";
const SUITE = "civicos-ui/test/surface-registry.test.mjs";

const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const argPl2 = (() => { const i = process.argv.indexOf("--pl2"); return i > 0 ? process.argv[i + 1] : null; })();

let fails = 0, arms = 0;
const bad = (m) => { fails++; console.error("  CONTROL FAILED —", m); };

/* ---------------------------------------------------------------- the vice
   Applies a set of [path, transform] edits, runs the suite, restores. The
   restore runs in a `finally` and verifies twice; a failed restore THROWS
   rather than being reported, because a dirty tree makes every later arm a lie. */
function withMutations(edits, label){
  const saved = [];
  for(const [p] of edits){
    const buf = fs.readFileSync(ROOT + p);
    saved.push({ p, buf, sha: sha(buf) });
  }
  let res;
  try{
    for(const [p, fn] of edits){
      const before = fs.readFileSync(ROOT + p, "utf8");
      const after = fn(before);
      if(after === before) throw new Error(`ARM '${label}': the mutation of ${p} changed NOTHING — an arm that changes nothing proves nothing (the anchor has moved; fix the anchor, do not delete the arm)`);
      fs.writeFileSync(ROOT + p, after);
    }
    const r = spawnSync("node", [ROOT + SUITE], { encoding: "utf8" });
    res = { status: r.status, out: (r.stdout || "") + (r.stderr || "") };
  } finally {
    for(const s of saved){
      fs.writeFileSync(ROOT + s.p, s.buf);
      const back = fs.readFileSync(ROOT + s.p);
      if(sha(back) !== s.sha || !back.equals(s.buf))
        throw new Error(`RESTORE FAILED for ${s.p} — sha ${sha(back) === s.sha}, content ${back.equals(s.buf)}`);
    }
  }
  return res;
}

/* The PL-2 swap, applied as an ordinary mutation so it goes through the same
   verified restore as everything else. */
const pl2Edits = argPl2 ? [
  [AFF, () => fs.readFileSync(`${ROOT}${argPl2}/affordances.PL2MERGED.mjs`, "utf8")],
  [CHK, () => fs.readFileSync(`${ROOT}${argPl2}/bio-checks.PL2MERGED.mjs`, "utf8")],
] : [];

/* ------------------------------------------------------------ the mutations */
const INQ_ROUTES = `routes: ["object:inquiry", "hash:inquiry"],`;
const INQ_ACTS = `acts: ["conclude", "reopen", "inquirydivide", "inquiryground", "publish"],`;

const once = (needle, replacement) => (src) => {
  const n = src.split(needle).length - 1;
  if(n !== 1) throw new Error(`anchor matched ${n} times, expected exactly 1: ${needle.slice(0, 60)}`);
  return src.replace(needle, replacement);
};

/* Neuter the plane's act catalogue WITHOUT deleting it — the arrays still parse,
   they are simply no longer what is exported, which is how a walk goes blind in
   practice rather than by a syntax error somebody would notice. */
const neuterCatalogue = (src) =>
  src.replace("export const ACTS = [", "export const ACTS = []; const __DEAD_ACTS = [")
     .replace("export const CAPTURE_ACTS = [", "export const CAPTURE_ACTS = []; const __DEAD_CAPTURE = [");

/* Neuter the registry walk: every surface keeps its entry, its routes, its
   levels and its purpose, and simply describes no acts. */
const neuterWalk = (src) => {
  const a = src.indexOf("/*__SURFACES_START__*/"), b = src.indexOf("/*__SURFACES_END__*/");
  if(a < 0 || b < 0) throw new Error("SURFACES markers not found");
  return src.slice(0, a) + src.slice(a, b).replace(/acts:\s*\[[^\]]*\]/g, "acts: []") + src.slice(b);
};

const SEVENTH = `export const ACTS = [
  { id: "versionseventhcontrol", label: "A seventh unsurfaced act, added by the CEILING control", weight: "single", types: ["inquiry"],
    applies: (f, ty) => ty === "inquiry" },`;

/* ----------------------------------------------------------------- the arms */
const ARMS = [
  { id: "1a", name: "FICTION, ROUTE — a surface describes a route the runtime does not have",
    expect: "ARM E2",
    also: "nosuchsurfacecontrol",
    edits: [[APP, once(INQ_ROUTES, `routes: ["object:inquiry", "hash:inquiry", "screen:nosuchsurfacecontrol"],`)]] },

  { id: "1b", name: "FICTION, ACT — a surface hosts an act the plane does not publish",
    expect: "ARM A4a",
    also: "notanactcontrol",
    edits: [[APP, once(INQ_ACTS, `acts: ["conclude", "reopen", "inquirydivide", "inquiryground", "publish", "notanactcontrol"],`)]] },

  { id: "2", name: "THE CEILING — a SEVENTH published act with no surface and no register row",
    expect: "ARM A4b (CEILING)",
    also: "versionseventhcontrol",
    edits: [[AFF, once("export const ACTS = [", SEVENTH)]] },

  { id: "3a", name: "THE FLOOR, catalogue — the plane's act catalogue neutered",
    expect: "ARM A4d (FLOOR)",
    also: "holds 0 act(s)",
    edits: [[AFF, neuterCatalogue]] },

  { id: "3b", name: "THE FLOOR, walk — the registry's act placements neutered",
    expect: "ARM A4e (FLOOR)",
    also: "found 0 distinct hosted act(s) across 0 placement(s)",
    edits: [[APP, neuterWalk]] },

  { id: "4", name: "THE DRAIN — a register row's act is given a surface; the ceiling must FALL",
    expect: "ARM A4c (DRAIN)",
    also: "STRIKE THE ROW",
    needsRegisterAct: true,
    edits: [[APP, once(INQ_ACTS, `acts: ["conclude", "reopen", "inquirydivide", "inquiryground", "publish", "versionhide"],`)]] },
];

/* ------------------------------------------------------- POLARITY, FIRST
   GREEN with the tree intact, and every arm's expected message ABSENT — before
   any arm is confirmed RED. Never the reverse: a control confirmed red first
   can be red for a reason nobody checked. */
console.log(`UI-52 ARM A4 negative controls${argPl2 ? ` (PL-2 swapped in from ${argPl2})` : ""}\n`);
const intact = withMutations(pl2Edits.length ? pl2Edits : [[APP, (s) => s + "\n"]], "polarity");
console.log(`POLARITY · the tree intact: exit ${intact.status}`);
if(intact.status !== 0) bad(`the intact tree does not pass — every arm below would be red for a reason that has nothing to do with its subject.\n${intact.out.slice(-2000)}`);
for(const a of ARMS){
  arms++;
  if(intact.out.includes(a.expect))
    bad(`POLARITY arm ${a.id}: '${a.expect}' is ALREADY present on the intact tree, so its appearance below proves nothing.`);
}
const registerPublished = /ACT REGISTER totals: (\d+) owed/.exec(intact.out);
const owed = registerPublished ? Number(registerPublished[1]) : 0;
console.log(`POLARITY · the act register reads ${owed} owed on the intact tree\n`);

/* --------------------------------------------------------------- THE ARMS */
for(const a of ARMS){
  if(a.needsRegisterAct && owed === 0){
    console.log(`ARM ${a.id} · ${a.name}\n  SKIPPED — this tree publishes none of the register's acts, so there is nothing to drain. Re-run with --pl2, or after PL-2 is integrated.\n`);
    continue;
  }
  const r = withMutations([...pl2Edits, ...a.edits], a.id);
  const lines = r.out.split("\n").filter(l => l.includes(a.expect)).map(l => l.trim());
  const hit = lines.length > 0;
  const alsoHit = !a.also || r.out.includes(a.also);
  console.log(`ARM ${a.id} · ${a.name}`);
  console.log(`  exit ${r.status} · '${a.expect}' reported: ${hit} · names its subject ('${a.also}'): ${alsoHit}`);
  if(lines.length) console.log(`  IN ITS OWN WORDS: ${lines[0].slice(0, 400)}`);
  if(r.status === 0) bad(`ARM ${a.id}: the suite PASSED with the defect present — the assertion is not testing its subject.`);
  if(!hit) bad(`ARM ${a.id}: expected '${a.expect}' in the output and it was not there.`);
  if(!alsoHit) bad(`ARM ${a.id}: the failure did not NAME its subject ('${a.also}') — a bare 'wrong' tells the next reader nothing.`);
  console.log("");
}

/* ------------------------------------------------- THE TREE IS AS WE FOUND IT */
const after = spawnSync("node", [ROOT + SUITE], { encoding: "utf8" });
console.log(`AFTER ALL ARMS · the suite on the restored tree: exit ${after.status}`);
if(after.status !== 0) bad("the tree did not come back clean — a restore silently failed.");

console.log(`\nsurface-registry-a4.control.mjs: ${arms} arms, ${fails} control failure(s)`);
process.exit(fails ? 1 : 0);
