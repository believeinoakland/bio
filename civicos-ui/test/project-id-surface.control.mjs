/* UI-66 — THE NEGATIVE CONTROL for `project-id-surface.test.mjs`, driven and re-runnable in one step:
 *
 *     node civicos-ui/test/project-id-surface.control.mjs
 *
 * Each arm mutates `civicos-ui/app.html` ALONE (one anchored replacement, asserted to match EXACTLY once —
 * an arm that did not arm is a finding, never a pass), runs the suite against the mutated file, then restores
 * the file from a per-arm pristine copy and verifies the restore by sha256 AND by `cmp`, guarding a minimum
 * byte count so an empty copy cannot "match". Declared BEFORE arming, per arm: RED or GREEN, and for a RED
 * arm the text its failing lines must NAME — for (A)–(C) that is the plane's own C-59 sentence as the
 * surface rendered it, which is the row's control: *"restore the id field, and the plane's refusal is
 * rendered as its own sentence and the harness fails naming it"*.
 *
 *   BASELINE  unmutated                                                         -> GREEN
 *   (A) the fork form's id field restored (`["newId","The new project's id","required"]`)
 *                                                                               -> RED, naming C-59.3's translation
 *   (B) the Add surface's client-side project id restored (`minted = false`: allocid, `bundleId`, `id:` line)
 *                                                                               -> RED, naming C-59.1's translation
 *   (C) THE LIAR — a client-generated id written ONLY into the bytes (no field, no `bundleId`)
 *                                                                               -> RED, naming C-59.2's translation
 *   (D) OVER-STRICTNESS — `bundleId: minted ? undefined : id` (a spelling JSON drops, so nothing is sent)
 *                                                                               -> GREEN
 *
 * RESULTS, RUN 2026-09-19 by UI-66 against app.html 21bcfa63… (1394064 bytes), every arm restored and
 * verified by sha256 and `cmp`, the file IDENTICAL to pristine at the end — 5/5 AS DECLARED:
 *   BASELINE GREEN 29/29 · (A) RED 20/29, 9 failing, the fork-refusal line naming C-59.3's sentence ·
 *   (B) RED 9/29, the creation-refusal line naming C-59.1's sentence (the fork arms fail downstream: no
 *   project exists to fork) · (C) RED 11/29, naming C-59.2's sentence · (D) GREEN 29/29.
 * This file prints them on every run, and its own exit is 0 only when every arm came back AS DECLARED.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import path from "path";
import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { anchorTable } from "../../bio-plane/scripts/anchortable.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "..", "app.html");
const SUITE = path.join(HERE, "project-id-surface.test.mjs");
const SCRATCH = path.join(HERE, ".ui66-control");
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const T = {
  fork: "A fork is given its id by the record; it is not chosen.",
  create: "A new project is given its id by the record; it is not chosen.",
  bytes: "document must not carry an id line: the record writes",
};
const ARMS = [
  { name: "BASELINE", declared: "GREEN" },
  { name: "(A) restore the fork form's id field", declared: "RED", names: T.fork,
    from: `projectfork: { label:"Fork this project", op:"projectfork", fields:[["title","Its name","required"]],`,
    to:   `projectfork: { label:"Fork this project", op:"projectfork", fields:[["newId","The new project's id","required"],["title","Its name","required"]],` },
  { name: "(B) restore the Add surface's client-side project id", declared: "RED", names: T.create,
    from: `const minted = normalizeType(type) === "project";`,
    to:   `const minted = false;` },
  { name: "(C) the liar: a client-generated id in the bytes only", declared: "RED", names: T.bytes,
    from: `const text = mdFor(id, type, vocabFor(FIRST_STATE, type), title, bodyText, now, !!doc,`,
    to:   `const text = mdFor(id || ("PROJ-" + new Date().getFullYear() + "-9000-" + title.toLowerCase().replace(/[^a-z0-9]+/g,"-")), type, vocabFor(FIRST_STATE, type), title, bodyText, now, !!doc,` },
  { name: "(D) over-strictness: bundleId spelled as undefined", declared: "GREEN",
    from: `...(minted ? {} : { bundleId: id }), base: null, snapKey: stamp(), author: who,`,
    to:   `bundleId: minted ? undefined : id, base: null, snapKey: stamp(), author: who,` },
];

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.filter((a) => a.from).map((a) => ({ arm: a.name, file: APP, find: a.from, put: a.to })));

fs.mkdirSync(SCRATCH, { recursive: true });
const origSha = sha(APP);
const origBytes = fs.statSync(APP).size;
if(origBytes < 100000) throw new Error(`app.html is ${origBytes} bytes — too small to be the subject`);
console.log(`app.html pristine sha256 ${origSha} (${origBytes} bytes)`);
const rows = [];
let allAsDeclared = true;
try{
  for(const [i, arm] of ARMS.entries()){
    const pristine = path.join(SCRATCH, `app.pristine.arm${i}.html`);
    fs.copyFileSync(APP, pristine);
    if(sha(pristine) !== origSha || fs.statSync(pristine).size !== origBytes) throw new Error(`arm ${arm.name}: pristine copy differs`);
    let armed = true;
    if(arm.from){
      const src = fs.readFileSync(APP, "utf8");
      const hits = src.split(arm.from).length - 1;
      if(hits !== 1){ armed = false; console.error(`  ARM DID NOT ARM: ${arm.name} — anchor matched ${hits} time(s)`); }
      else fs.writeFileSync(APP, src.replace(arm.from, arm.to));
    }
    const r = spawnSync("node", [SUITE], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const out = String(r.stdout || "") + String(r.stderr || "");
    const failLines = out.split("\n").filter(l => /^\s*FAIL /.test(l));
    const tally = (/project-id-surface: (\d+)\/(\d+) assertions passed/.exec(out) || []).slice(1).join("/") || "-1";
    const got = r.status === 0 ? "GREEN" : "RED";
    const named = arm.names ? failLines.some(l => l.includes(arm.names)) : null;
    const asDeclared = armed && got === arm.declared && (named === null || named === true);
    if(!asDeclared) allAsDeclared = false;
    /* RESTORE, then verify by hash AND by content. */
    fs.copyFileSync(pristine, APP);
    const restoredSha = sha(APP);
    let cmpOk = false;
    try{ execFileSync("cmp", ["-s", pristine, APP]); cmpOk = true; }catch(_){ cmpOk = false; }
    if(restoredSha !== origSha || !cmpOk || fs.statSync(APP).size !== origBytes)
      throw new Error(`arm ${arm.name}: RESTORE FAILED (sha ${restoredSha}, cmp ${cmpOk})`);
    rows.push({ arm: arm.name, declared: arm.declared, got, tally, exit: r.status, named, asDeclared, failLines });
    console.log(`${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"} · ${arm.name} · declared ${arm.declared} · got ${got} `
      + `(exit ${r.status}, passed ${tally})${arm.names ? ` · names the plane's sentence: ${named}` : ""} · restored ${restoredSha.slice(0, 12)} cmp ok`);
    for(const l of failLines) console.log("      " + l.trim().slice(0, 220));
  }
}finally{
  if(sha(APP) !== origSha){
    const p0 = path.join(SCRATCH, "app.pristine.arm0.html");
    if(fs.existsSync(p0)) fs.copyFileSync(p0, APP);
  }
  const final = sha(APP);
  console.log(`app.html final sha256 ${final} — ${final === origSha ? "IDENTICAL to pristine" : "DIFFERS FROM PRISTINE"}`);
  if(final === origSha) fs.rmSync(SCRATCH, { recursive: true, force: true });
}
console.log(`\nproject-id-surface.control: ${rows.filter(r => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
