/* UI-72 — THE NEGATIVE CONTROL for `refusal-translation-surface.test.mjs`, driven and re-runnable in
 * one step:
 *
 *     node civicos-ui/test/refusal-translation-surface.control.mjs
 *
 * Each arm mutates `civicos-ui/app.html` ALONE — one anchored replacement, asserted to match EXACTLY
 * once, because an arm that did not arm is a finding and never a pass — runs the suite against the
 * mutated file, then restores from a PER-ARM pristine copy and verifies the restore by sha256 AND by
 * `cmp`, guarding a minimum byte count so an empty copy cannot "match". Declared BEFORE arming, per arm:
 * RED or GREEN, and for a RED arm the text its failing lines must NAME.
 *
 * WHAT MAKES THESE ARMS SPECIFIC RATHER THAN FOUR READINGS OF ONE FACT: each breaks ONE thing, and each
 * declares what must STAY GREEN. (A) breaks the shared helper and must leave the structural arm and the
 * over-strictness arm standing; (B) breaks ONLY the twin and must leave the version-review surface
 * standing — that is the assertion that the twin has an arm of its own rather than inheriting one; (C)
 * breaks nothing a happy path can see and is caught only by the shape that would reach a member as
 * `[object Object]`; (D) changes the spelling and not the rule, and must be GREEN.
 *
 *   BASELINE  unmutated                                                                  -> GREEN
 *   (A) THE ROW'S OWN — `refusalWords` loses its translation branch (UI-72 reverted)
 *                     -> RED, the failing lines naming THE CALLER'S SENTENCE — the one a member would
 *                        wrongly read — and the canned translation ABSENT from the whole run. ARM 2
 *                        (structure), ARM 4 (the blanking shapes) and ARM 5 (over-strictness) STAY GREEN.
 *
 *       **THIS DECLARATION WAS WRONG ON ITS FIRST RUN AND THE ARM IS WHAT SAID SO — recorded rather than
 *       smoothed.** It first declared that arm (A) must NAME C-25.18's canned translation, and the arm came
 *       back RED with the four right failures and `names it: false`. The declaration had the direction
 *       backwards: when the preference is broken the canned sentence is exactly what VANISHES, and what the
 *       failing line carries is the sentence the member is wrongly shown. A control that had been "fixed" by
 *       deleting the naming requirement would have lost the receipt entirely; it is now TWO-SIDED — the
 *       caller's sentence PRESENT and the canned one ABSENT — which is a stronger claim than either half and
 *       is the shape that caught the error.
 *   (B) THE TWIN — only `intentRefusalHtml` reverted to `r.detail || r.error || ""`
 *                     -> RED at ARM 3 and at ARM 2's intentRefusalHtml lines. ARM 1 must STAY GREEN.
 *   (C) THE TRUTHY TEST, the spelling that looks right — `if(r.translation) return r.translation;`
 *                     -> RED at ARM 4's non-string shape ONLY (`[object Object]` reaches a member).
 *                        ARMS 1, 3 and 5 must STAY GREEN, which is what makes it a one-shape arm.
 *   (D) OVER-STRICTNESS — the same rule with its two conditions swapped
 *                     -> GREEN, all 29 assertions.
 *
 * RESULTS, RUN 2026-09-19 by UI-72 against app.html `3916f88ae780dd5036d88eca43b00a3351d2e09f4fb0c00c7349cd1aabeb6e57`
 * (1,405,511 bytes), every arm restored and verified by sha256 AND `cmp`, the file IDENTICAL to pristine at
 * the end — **5/5 AS DECLARED**:
 *   BASELINE GREEN 29 asserted / 0 failed ·
 *   (A) RED, 4 failing — the two version-review lines and the two twin lines, each carrying the CALLER'S
 *       sentence as the page rendered it, and the canned sentence absent from the whole run ·
 *   (B) RED, 5 failing — ARM 3's three and ARM 2's two intentRefusalHtml lines, with ARM 1 green, which is
 *       the fact that makes the twin's coverage its own rather than inherited ·
 *   (C) RED, 2 failing — ARM 4's non-string shape, the failing line carrying the literal `[object Object]`
 *       a member would have read, with ARMS 1, 3 and 5 green ·
 *   (D) GREEN 29 / 0.
 * RESULTS ARE PRINTED ON EVERY RUN and this file's own exit is 0 only when every arm came back AS DECLARED.
 *
 * UI-73, 2026-09-23 — THREE MORE ARMS, one per SHAPE of site ARM 6 covers, each restoring ONE site to the
 * `detail` read it had before UI-73 and declared to fail ONLY at that site (`only`: every failing line
 * names it, so a site's arm is its own and not a second reading of the helper):
 *   (E) a FUNCTION site — `queueReason` -> RED at `SITE queueReason` alone
 *   (F) a LINE site, structural only — the leg pre-flight's `subj-how` -> RED at that site alone
 *   (G) THE GATE — `teach()` -> RED at `SITE teach` alone (the signIn drive stays green: SIGN_IN_REFUSED
 *       has no canned translation, so the old line and the new print the same sentence there)
 * RESULTS, RUN 2026-09-23 by UI-73 against app.html `dca2888693b79a74beccd5bf1b98b87958c043fb9994ba4ea103ad419a5b5bc8`
 * (1,434,733 bytes), every arm restored and verified by sha256 AND `cmp`, IDENTICAL at the end — **8/8 AS
 * DECLARED**: BASELINE GREEN 89/0 · (A) RED 18 — UI-72's four PLUS both behavioural lines of all seven of
 * UI-73's callable sites, which is the helper's deletion reaching every one of them and so the evidence
 * they go THROUGH it at runtime, not only in shape · (B) RED 5 · (C) RED 2 · (D) GREEN 89/0 ·
 * (E) RED 4, all `SITE queueReason` · (F) RED 2, all `SITE the leg pre-flight's subj-how` · (G) RED 4,
 * all `SITE teach`.
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
const SUITE = path.join(HERE, "refusal-translation-surface.test.mjs");
const SCRATCH = path.join(HERE, ".ui72-control");
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

/* The sentence a RED arm's failing line must NAME. Read from the plane's own catalogue row, never typed
   here: a string typed in a control agrees with the suite that typed the same string, for free. */
const { BASIS_VERSION_CHECKS } = await import("../../bio-plane/checks/bio-checks.mjs");
const CANNED = BASIS_VERSION_CHECKS.BASIS_VERSIONS_NOT_AN_INQUIRY.translation;
/* THE CALLER'S SENTENCE — the one a member reads when the preference is broken — READ OUT OF THE STORE'S
   OWN `refuse(...)` CALL rather than typed here. A control that types the string it looks for agrees with
   itself for free, and this project has measured a complete hand copy passing. The literal is a template
   with the id interpolated into it, so the fragment taken is the part after the interpolation. */
const STORE = fs.readFileSync(new URL("../../bio-plane/src/store.mjs", import.meta.url), "utf8");
const CALLER = (() => {
  const at = STORE.indexOf('refuse("BASIS_VERSIONS_NOT_AN_INQUIRY"');
  if(at < 0) throw new Error("the store's BASIS_VERSIONS_NOT_AN_INQUIRY refusal was not found — this control cannot read its subject");
  const lit = /`([^`]*)`/.exec(STORE.slice(at, at + 600));
  if(!lit) throw new Error("the refusal's own sentence could not be read out of store.mjs");
  const frag = lit[1].replace(/^.*\}/, "").trim();
  if(frag.length < 30) throw new Error(`the fragment read from store.mjs is ${frag.length} chars — too short to discriminate`);
  return frag;
})();
const HELPER = `  if(typeof r.translation === "string" && r.translation) return r.translation;\n`;
const TWIN = `function intentRefusalHtml(r){\n  if(!r) return "";\n  const words = refusalWords(r);`;

const ARMS = [
  { name: "BASELINE", declared: "GREEN" },
  { name: "(A) the row's own: refusalWords loses its translation branch", declared: "RED",
    names: CALLER, namesNot: CANNED.slice(0, 60), green: ["one helper decides the order", "over-strictness"],
    from: HELPER, to: "" },
  { name: "(B) the twin alone: intentRefusalHtml reverted", declared: "RED",
    names: "one rule, rendered the same way twice", green: ["the version-review surface"],
    from: TWIN,
    to: `function intentRefusalHtml(r){\n  if(!r) return "";\n  const words = r.detail || r.error || "";` },
  { name: "(C) the truthy test — the spelling that looks right", declared: "RED",
    names: "NON-STRING translation", green: ["the version-review surface", "over-strictness"],
    from: HELPER, to: `  if(r.translation) return r.translation;\n` },
  { name: "(D) over-strictness: the same rule, conditions swapped", declared: "GREEN",
    from: HELPER, to: `  if(r.translation && typeof r.translation === "string") return r.translation;\n` },
  /* UI-73's arms — ONE SITE each restored to the `detail` read it had before UI-73, and each must fail
     ONLY at that site's own lines (`only`): every failing line names it, and no other site goes red. */
  { name: "(E) UI-73, a function site: queueReason reads `detail` again", declared: "RED",
    names: "SITE queueReason", only: true,
    from: `  return [e.reason, refusalWords(e)].filter(Boolean).join(" · ");`,
    to:   `  return [e.reason, e.detail || e.error].filter(Boolean).join(" · ");` },
  { name: "(F) UI-73, a line site: the leg pre-flight reads `detail` again", declared: "RED",
    names: "SITE the leg pre-flight's subj-how", only: true,
    from: '`<div class="subj-how">${esc(refusalWords(lp.refusal))}</div>`',
    to:   '`<div class="subj-how">${esc(lp.refusal.detail || lp.refusal.error || "")}</div>`' },
  { name: "(G) UI-73, the gate: teach() reads `detail` again", declared: "RED",
    names: "SITE teach", only: true,
    from: `  const words = refusalWords(err);\n  const msg = err && (words || err.reason) ? [err.reason, words].filter(Boolean).join(" · ") :`,
    to:   `  const msg = err && (err.error || err.reason || err.detail) ? [err.reason,err.error,err.detail].filter(Boolean).join(" · ") :` },
];
/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.filter((a) => a.from).map((a) => ({ arm: a.name.split(" ")[0], file: APP, find: a.from, put: a.to })));

fs.mkdirSync(SCRATCH, { recursive: true });
const origSha = sha(APP);
const origBytes = fs.statSync(APP).size;
if(origBytes < 100000) throw new Error(`app.html is ${origBytes} bytes — too small to be the subject`);
console.log(`app.html pristine sha256 ${origSha} (${origBytes} bytes)`);
console.log(`the CANNED sentence, from the plane's own check row: ${JSON.stringify(CANNED.slice(0, 70))}…`);
console.log(`the CALLER'S sentence, read out of store.mjs's own refuse() call: ${JSON.stringify(CALLER.slice(0, 70))}…`);
const rows = [];
let allAsDeclared = true;
try{
  for(const [i, arm] of ARMS.entries()){
    const pristine = path.join(SCRATCH, `app.pristine.arm${i}.html`);
    fs.copyFileSync(APP, pristine);
    if(sha(pristine) !== origSha || fs.statSync(pristine).size !== origBytes)
      throw new Error(`arm ${arm.name}: pristine copy differs`);
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
    const tally = (/refusal-translation-surface: (\d+) assertions, (\d+) failed/.exec(out) || []).slice(1).join(" asserted / ") || "-1";
    const got = r.status === 0 ? "GREEN" : "RED";
    const named = arm.names ? out.includes(arm.names) : null;
    /* THE OTHER HALF: the sentence that must have VANISHED. An arm that only checks what is present
       cannot tell a broken preference from a page that renders both. */
    const absent = arm.namesNot ? !out.includes(arm.namesNot) : null;
    /* THE ARMS THAT MUST STAY GREEN, checked by section rather than by count: a control that only counts
       failures cannot tell six-arms-broken from one. */
    const stillGreen = (arm.green || []).every(sec => !failLines.some(l => l.includes(sec)));
    /* UI-73: a one-site arm is specific only if EVERY failing line is that site's. */
    const onlyItsOwn = arm.only ? failLines.length > 0 && failLines.every(l => l.includes(arm.names)) : null;
    const asDeclared = armed && got === arm.declared && (named === null || named === true)
      && (absent === null || absent === true) && stillGreen && (onlyItsOwn === null || onlyItsOwn === true);
    if(!asDeclared) allAsDeclared = false;
    fs.copyFileSync(pristine, APP);
    const restoredSha = sha(APP);
    let cmpOk = false;
    try{ execFileSync("cmp", ["-s", pristine, APP]); cmpOk = true; }catch(_){ cmpOk = false; }
    if(restoredSha !== origSha || !cmpOk || fs.statSync(APP).size !== origBytes)
      throw new Error(`arm ${arm.name}: RESTORE FAILED (sha ${restoredSha}, cmp ${cmpOk})`);
    rows.push({ arm: arm.name, declared: arm.declared, got, tally, asDeclared });
    console.log(`${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"} · ${arm.name} · declared ${arm.declared} · got ${got} `
      + `(exit ${r.status}, ${tally})${arm.names ? ` · names its declared text: ${named}` : ""}`
      + `${arm.namesNot ? ` · the canned sentence is absent: ${absent}` : ""}`
      + `${arm.green ? ` · declared-green sections still green: ${stillGreen}` : ""}`
      + `${arm.only ? ` · every failing line is its own site's: ${onlyItsOwn}` : ""} · restored ${restoredSha.slice(0, 12)} cmp ok`);
    for(const l of failLines) console.log("      " + l.trim().slice(0, 200));
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
console.log(`\nrefusal-translation-surface.control: ${rows.filter(r => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
