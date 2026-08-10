/* member-respect.control.mjs — UI-55's NEGATIVE CONTROL DRIVER.
 *
 * NOT A SUITE, and deliberately not named `*.test.mjs`: `civicos-ui/test/run.mjs`
 * DISCOVERS `.test.mjs` by filename and would run this, count it, and report a
 * suite that asserts nothing about the product. Run it by hand:
 *
 *     node civicos-ui/test/member-respect.control.mjs
 *
 * EACH ARM IS ARMED ALONE. The tree is patched, the sweep is run as a child, and
 * the file is RESTORED AND VERIFIED BY CONTENT AS WELL AS BY HASH before the next
 * arm is armed. That is ORCHESTRATION.md's PL-10 rule and UI-38's receipt: this
 * project has already met a harness that reported a byte-identical restore over a
 * file it had not restored. The pristine copy is held IN MEMORY and on disk beside
 * the file, inside this worktree — never in the shared scratchpad, which is shared
 * between concurrent workers and is how PL-10 lost a harness between arm and
 * restore.
 *
 * THE ARMS, AND WHY THESE THREE:
 *   (1) A RE-CONFIRMATION ON A REVERSIBLE ACT. `doCite` commits `op=cite`, which
 *       the plane's own RUNGS declares `reversible` — so DEC-69's first shape
 *       applies to it exactly. The sweep must fail NAMING the function, the op and
 *       the rung, because a failure that does not say which act is not actionable.
 *   (2) THE OVER-STRICTNESS ARM, AND IT IS THE ONE THIS ITEM MOST NEEDS. Three
 *       sub-arms strip, one at a time, DEC-51's grade note, DEC-39's fence, and the
 *       DEC-49 guard. Each must turn ARM P red. Their SURVIVAL is what the clean
 *       run asserts — a sweep that cannot tell inform-at-the-act-once from nagging
 *       would delete the record's own voice while reporting success.
 *   (3) BULK ONLY, NO SINGLE PATH. The per-kind mute UI-55 added is removed,
 *       leaving the whole-set control alone — the state this surface was in before
 *       this item. The amendment's arm must fail.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import crypto from "crypto";
import { execFileSync } from "child_process";

const APP   = new URL("../app.html", import.meta.url).pathname;
const SWEEP = new URL("./member-respect.test.mjs", import.meta.url).pathname;
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

const PRISTINE = fs.readFileSync(APP, "utf8");
const PRISTINE_SHA = sha(PRISTINE);
/* A SECOND, INDEPENDENT PRISTINE COPY ON DISK inside this worktree, so a restore is
   checked against something that is not the same variable that wrote the patch. */
const SAFE = APP + ".ui55-pristine";
fs.writeFileSync(SAFE, PRISTINE);

let armed = 0, correct = 0;
function run(){
  try { return { exit: 0, out: String(execFileSync("node", [SWEEP], { encoding: "utf8", stdio: "pipe" })) }; }
  catch(e){ return { exit: e.status == null ? 1 : e.status, out: String(e.stdout || "") + String(e.stderr || "") }; }
}
function restore(){
  fs.writeFileSync(APP, PRISTINE);
  const back = fs.readFileSync(APP, "utf8");
  const disk = fs.readFileSync(SAFE, "utf8");
  if(sha(back) !== PRISTINE_SHA) throw new Error("RESTORE FAILED by hash — the tree is dirty, stop and fix it by hand");
  if(back !== disk)              throw new Error("RESTORE FAILED by content — hash agreed and content did not, which is the case UI-38 met");
}
function arm(name, patch, mustSay){
  armed++;
  const patched = patch(PRISTINE);
  if(patched === PRISTINE) throw new Error(`ARM ${name}: the patch changed NOTHING — an arm that does not arm proves nothing, and this is the failure mode a control harness is most likely to have`);
  fs.writeFileSync(APP, patched);
  const r = run();
  restore();
  const red = r.exit !== 0;
  const said = mustSay.every(s => r.out.includes(s));
  const ok = red && said;
  if(ok) correct++;
  const tally = (r.out.match(/member-respect: (\d+) pass, (\d+) fail/) || [])[0] || "(no tally)";
  console.log(`\n${ok ? "CONTROL OK  " : "CONTROL BAD "} ${name}`);
  console.log(`  exit ${r.exit} · ${tally}`);
  if(!red) console.log(`  !! THE SWEEP STAYED GREEN UNDER THIS BREAK. It is not testing its subject.`);
  for(const s of mustSay)
    console.log(`  ${r.out.includes(s) ? "names" : "!! DOES NOT NAME"}: ${JSON.stringify(s.slice(0, 90))}`);
}

console.log("member-respect.control — three arms, each armed ALONE, every restore verified by hash AND by content.");
console.log(`pristine app.html sha256 ${PRISTINE_SHA.slice(0,16)}… (${PRISTINE.length} bytes)`);

/* ---- BASELINE: the clean tree must be GREEN, or every arm below is meaningless. */
{
  const r = run();
  console.log(`\nBASELINE  exit ${r.exit} · ${(r.out.match(/member-respect: (\d+) pass, (\d+) fail/) || ["(no tally)"])[0]}`);
  if(r.exit !== 0) throw new Error("the clean tree is already RED — arm nothing until that is understood");
}

/* ---- ARM 1 · a re-confirmation planted on a REVERSIBLE act. ---- */
arm("1 · re-confirmation on a REVERSIBLE act (doCite → op=cite, rung reversible)",
  (s) => s.replace(
    "async function doCite(){",
    'async function doCite(){\n  const _sure = "Are you sure you want to cite this?";'),
  ["ARM 1c", "doCite", "cite", "are you sure"]);

/* ---- ARM 2 · THE OVER-STRICTNESS ARM. Three sub-arms, each alone. ---- */
arm("2a · DEC-51's grade note stripped (addCapture stops calling addCaptureNote)",
  (s) => s.replace(/addCaptureNote\(acq\.note\);?/, "/* removed by control arm 2a */"),
  ["ARM P1"]);

/* ANCHORED ON THE DIALOG, AND THE FIRST BUILD OF THIS ARM WAS NOT — kept as the
   note rather than quietly corrected. `${attestFenceHtml()}` occurs THREE times
   (the document page's act bar, this dialog, and the receipt), so a bare
   `String.replace` armed the FIRST of them, which is outside `openAttestDialog`
   entirely — and the sweep stayed green, correctly, because the dialog it asserts
   over was untouched. **An arm that reports a green sweep while arming the wrong
   site is indistinguishable from a sweep that does not work**, which is the whole
   hazard a negative control exists to expose. The anchor is now the dialog's own
   preceding line. */
arm("2b · DEC-39's fence no longer RENDERED in the attest dialog",
  (s) => s.replace(
    '<div class="dz-choose">${choose}</div>\n     ${attestFenceHtml()}',
    '<div class="dz-choose">${choose}</div>\n     ${""}'),
  ["ARM P2"]);

arm("2c · DEC-49's guard removed from disk is not patchable here, so the SURFACE half is armed: the fence check that refuses to open the dialog without it",
  (s) => s.replace("if(!cact || !attestFence()) return null;", "if(!cact) return null;"),
  ["ARM P2"]);

/* ---- ARM 3 · BULK ONLY: the per-kind path removed, which is the state this
        surface was in before UI-55. The amendment's arm must fail. ---- */
arm("3 · the set of decisions offered in BULK ONLY (per-kind mute removed)",
  (s) => s.replace(/const each = kinds\.length > 1[\s\S]*?: "";/, 'const each = "";'),
  ["ARM 4d", "data-mute1"]);

/* ---- THE OVER-STRICTNESS ARM'S OTHER HALF, AND IT IS AN EQUALITY RATHER THAN AN
        ABSENCE. Arms 2a–2c prove the sweep NOTICES a strip. This proves it does not
        fire on the record's own voice LEFT IN PLACE: the clean tree is green, and
        the three protected publications are asserted PRESENT rather than merely
        not-complained-about. A sweep that passed because it looks at nothing would
        pass arm 2's absence half too. ---- */
{
  const r = run();
  const green = r.exit === 0;
  const names = ["DEC-51's grade note, DEC-39's fence and DEC-49's refusal reasons: all PRESENT"];
  const said = names.every(s => r.out.includes(s));
  armed++; if(green && said) correct++;
  console.log(`\n${green && said ? "CONTROL OK  " : "CONTROL BAD "} P · INFORM-AT-THE-ACT-ONCE IS NOT THE TARGET (over-strictness, the other half)`);
  console.log(`  exit ${r.exit} — the clean tree is green and ARM P states the three survivals positively rather than by silence.`);
}

fs.unlinkSync(SAFE);
const back = fs.readFileSync(APP, "utf8");
console.log(`\nFINAL RESTORE: sha256 ${sha(back).slice(0,16)}… ${sha(back) === PRISTINE_SHA ? "MATCHES pristine" : "!! DOES NOT MATCH"} · content ${back === PRISTINE ? "identical" : "!! DIFFERS"}`);
console.log(`\nmember-respect.control: ${correct} of ${armed} arm(s) behaved as a negative control must.`);
process.exit(correct === armed && sha(back) === PRISTINE_SHA ? 0 : 1);
