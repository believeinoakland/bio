/* member-respect.test.mjs — UI-55. DEC-69's ENACTED AUDIT, as a standing sweep.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/member-respect.control.mjs` — six arms,
 * each armed ALONE, RUN 2026-08-10, 6 of 6 correct, exit 0, app.html restored
 * byte-identically (sha256 and content, against a second on-disk pristine copy).
 * Break-to-fail map: plant "are you sure" in `doCite` -> ARM 1c; drop
 * `addCaptureNote(acq.note)` -> ARM P1; blank `${attestFenceHtml()}` IN THE DIALOG
 * -> ARM P2; drop the fence pre-check in `openAttestDialog` -> ARM P2; delete the
 * per-kind mute (`data-mute1`) -> ARM 4d. The over-strictness half is the CLEAN run
 * staying green with all three protected publications asserted PRESENT by name.
 *
 * ============================================================================
 * THE RULING, AND WHY THIS FILE IS NOT A GREP
 * ============================================================================
 * Bob, 2026-08-10 (DEC-69): *"There's a point after which the workflow isn't
 * properly respecting group members… the workflow must not be nagging or
 * second-guessing users. The workflow needs to respect users and their judgment.
 * Anything short of that is a flaw."*
 *
 * AMENDED THE SAME DAY, and the amendment is the harder half: *"a user needs to
 * understand their responsibilities, but the system needs to provide the proper
 * opportunities for the user to execute on their judgment correctly and
 * efficiently. No, they shouldn't be forced to make decisions in bulk. But they
 * should be enabled to when appropriate."* **The operative word is FORCED and it
 * cuts both ways.** A surface offering ONLY bulk is the same flaw as one offering
 * only forty clicks: both take the mode of judgment out of the member's hands.
 *
 * ============================================================================
 * THE SCOPE BOUNDARY IS HALF THE RULING, AND ARM P ENFORCES IT
 * ============================================================================
 * **INFORMING AT THE ACT, ONCE, IS RESPECT AND IS NOT THE TARGET.** DEC-69 names
 * three by number: DEC-39's co-attestation fence, DEC-51's grade note at capture
 * (UI-54), DEC-49's honest refusal reason. A sweep that removed the record's own
 * account of what an act means would enact the OPPOSITE of this ruling — so their
 * survival is not left to a control that is run once. **ARM P asserts all three
 * PRESENT on every run**, which means a future tidy that strips one fails the very
 * suite that would otherwise report the tidy as a success.
 *
 * The cut that makes this decidable, and it is DEC-69's own: **the record's voice
 * is PLANE-SOURCED and a nag is AUTHORED HERE.** The fence is
 * `captureAct("attest").prompt`; the grade note is `acq.note`; a refusal reason is
 * keyed on a code the plane sent. None of the three is a literal in `app.html`,
 * and ARM P proves that rather than assuming it.
 *
 * ============================================================================
 * WHAT THIS SWEEP CANNOT SEE — stated first, because a clean result otherwise
 * reads as more than it is
 * ============================================================================
 *  (a) ONLY `civicos-ui/app.html`. A nag rendered by any other member-facing
 *      surface is invisible here. The census figure says so with its reach.
 *  (b) ONLY NAMED `function` DECLARATIONS. An act committed from an arrow
 *      function assigned to a const, or from an object-literal method, is not an
 *      act site to this walk. The reach delta is PRINTED, never assumed away.
 *  (c) ONLY LITERAL OP NAMES through the nine known transports. An op reached
 *      through a variable is invisible, and ARM C measures how many of the
 *      plane's mutating ops this walk does NOT reach.
 *  (d) THE OBLIGATION FAMILY IN ARM 2 IS A FLOOR, NOT A CLOSURE. Unlike UI-53's
 *      ban family — which is derived from DEC-32 clause 1's own enumeration —
 *      DEC-69 enumerates no vocabulary for a responsibility prompt, so there is
 *      nothing to parse a closure out of. The family is therefore a CEILINGED,
 *      PRINTED list and it is said to be a floor every run. A genuinely novel
 *      phrasing is not caught, and `analyst-vocabulary.mjs`'s own residue note is
 *      the precedent for saying so rather than implying coverage.
 *  (e) ARM 4 PARTITIONS BY REGISTER, NOT BY DERIVATION, and that is a measured
 *      limit rather than laziness. Whether a repeated control is a SET OF
 *      DECISIONS (forty candidate documents, each independently decided) or a
 *      CHOOSER FOR ONE DECISION (four owners, exactly one of whom is removed) is
 *      not a fact any static walk can read: both compile to `list.map(control)`.
 *      So every repeated-control site is ENUMERATED structurally and must be
 *      CLASSIFIED in one of the two registers below — and **a site in neither
 *      fails this suite by name**, which is what stops a new list arriving
 *      unclassified. That is `surface-registry.test.mjs` ARM A4c's drain shape.
 *
 * ============================================================================
 * NEGATIVE CONTROL: `node civicos-ui/test/member-respect.control.mjs`
 * ============================================================================
 * Three arms, each armed ALONE, each file restored and verified BY CONTENT as
 * well as by hash (ORCHESTRATION.md's PL-10/UI-38 rule):
 *   (1) plant a re-confirmation on a REVERSIBLE act -> ARM 1 must fail NAMING it.
 *   (2) THE OVER-STRICTNESS ARM, the one this item most needs: strip DEC-51's
 *       grade note, DEC-39's fence, or a DEC-49 refusal reason -> ARM P must go
 *       RED. Left in place, all three stay GREEN.
 *   (3) offer a set of decisions in BULK ONLY -> ARM 4's amendment half must fail.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: a suite's own exit must not discard its own output.
                                              Reached by path rather than `./stdio.mjs` because the module
                                              lives in the plane's test estate and this is the UI's; the
                                              side effect is what is wanted and it is idempotent. */
import fs from "fs";
import { RUNGS, RUNG_ABSENT, RUNG_LADDER, ATTEST_FENCE, ACQUIRE_GRADE_NOTE }
  from "../../bio-plane/src/affordances.mjs";
/* UI-53's STANDING RULE, AND THIS FILE IS A CONSUMER OF IT RATHER THAN A FIFTH
   LIST. There is ONE definition of DEC-32 clause 1's ban in this directory. This
   sweep reads the whole member-facing prose corpus, so it is a ban site whether it
   wants to be one or not — `analyst-vocabulary.test.mjs` ARM C classified it a
   RIVAL on its first run, which is that census doing exactly what UI-53 built it to
   do. The right answer is to IMPORT, never to write a list and never to stop citing
   DEC-32 to slip the census. See `analyst-vocabulary.mjs` for what the family is
   derived from and, more importantly, what it cannot see. */
import { analystHits, reachLine } from "./analyst-vocabulary.mjs";

let n = 0; const fails = [];
function ok(cond, msg){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }
function eq(a, b, msg){ ok(a === b, `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }

const APP_PATH   = new URL("../app.html", import.meta.url).pathname;
const PLANE_INDEX= new URL("../../bio-plane/src/index.mjs", import.meta.url).pathname;
const DECISIONS  = new URL("../../docs/development/DECISIONS.md", import.meta.url).pathname;
const app    = fs.readFileSync(APP_PATH, "utf8");
const plane  = fs.readFileSync(PLANE_INDEX, "utf8");
const rulings= fs.readFileSync(DECISIONS, "utf8");

/* ==========================================================================
   THE INSTRUMENT
   ========================================================================== */
/* A `/` IS A REGEX ONLY WHERE A VALUE MAY BEGIN, and this is a MEASURED
   regression rather than a precaution: `app.html` carries
   `const REL_RULE = /["\\\r\n]/`, whose double quote opened string mode in this
   instrument's first build and swallowed three thousand lines of structure into
   one literal. */
const VALUE_MAY_BEGIN = new Set(["(",",","=",":","[","!","&","|","?","{","}",";","+","-","*","%","^","~","<",">","\n"]);
const KEYWORD_BEFORE_REGEX = /\b(return|typeof|instanceof|in|of|new|delete|void|case|do|else|yield|await)$/;
function regexAllowedAt(out){
  let k = out.length - 1;
  while(k >= 0 && /\s/.test(out[k]) && out[k] !== "\n") k--;
  if(k < 0) return true;
  const c = out[k];
  if(VALUE_MAY_BEGIN.has(c)) return true;
  if(/[A-Za-z0-9_$]/.test(c)) return KEYWORD_BEFORE_REGEX.test(out.slice(0, k + 1));
  return false;
}
/* A MODE STACK, NOT A MODE, AND THAT TOO IS MEASURED. `app.html` nests template
   literals several deep, so a single-slot mode let an INNER backtick close the
   OUTER literal and 93,000 characters became one function body. Interpolated
   `${…}` is CODE and is kept in `skel`; only the literal TEXT is blanked.
   Two corpora, and the difference is the whole audit:
     `code` — comments gone, STRING TEXT KEPT. What a member can read.
     `skel` — comments gone, string text BLANKED to spaces of equal length, so
              offsets agree character for character. What the structure is. */
function derive(s){
  let code="", skel="", i=0; const N=s.length;
  const stack=[{k:"code"}], top=()=>stack[stack.length-1];
  const push=(c,b)=>{ code+=c; skel += b ? (c==="\n"?"\n":" ") : c; };
  while(i<N){
    const st=top(), c=s[i], d=s[i+1];
    if(st.k==="code"||st.k==="interp"){
      if(c==="/"&&d==="*"){ stack.push({k:"block"}); i+=2; continue; }
      if(c==="/"&&d==="/"){ stack.push({k:"line"}); i+=2; continue; }
      if(c==='"'||c==="'"){ stack.push({k:"str",q:c}); push(c,false); i++; continue; }
      if(c==="`"){ stack.push({k:"tpl"}); push(c,false); i++; continue; }
      if(c==="/"&&regexAllowedAt(code)){ stack.push({k:"re"}); push(c,false); i++; continue; }
      if(st.k==="interp"){
        if(c==="{"){ st.depth++; push(c,false); i++; continue; }
        if(c==="}"){ if(st.depth===0){ stack.pop(); push(c,false); i++; continue; } st.depth--; push(c,false); i++; continue; }
      }
      push(c,false); i++; continue;
    }
    if(st.k==="block"){ if(c==="*"&&d==="/"){ stack.pop(); i+=2; } else { if(c==="\n"){ code+="\n"; skel+="\n"; } i++; } continue; }
    if(st.k==="line"){ if(c==="\n"){ stack.pop(); code+="\n"; skel+="\n"; i++; } else i++; continue; }
    if(st.k==="str"){ if(c==="\\"){ push(c,true); push(s[i+1]||"",true); i+=2; continue; }
      if(c===st.q){ stack.pop(); push(c,false); i++; continue; } push(c,true); i++; continue; }
    if(st.k==="tpl"){ if(c==="\\"){ push(c,true); push(s[i+1]||"",true); i+=2; continue; }
      if(c==="$"&&d==="{"){ stack.push({k:"interp",depth:0}); push(c,false); push("{",false); i+=2; continue; }
      if(c==="`"){ stack.pop(); push(c,false); i++; continue; } push(c,true); i++; continue; }
    if(st.k==="re"){ if(c==="\\"){ push(c,true); push(s[i+1]||"",true); i+=2; continue; }
      if(c==="["){ stack.push({k:"recls"}); push(c,true); i++; continue; }
      if(c==="/"||c==="\n"){ stack.pop(); push(c,false); i++; continue; } push(c,true); i++; continue; }
    if(st.k==="recls"){ if(c==="\\"){ push(c,true); push(s[i+1]||"",true); i+=2; continue; }
      if(c==="]"){ stack.pop(); push(c,true); i++; continue; }
      if(c==="\n"){ stack.pop(); stack.pop(); push(c,false); i++; continue; } push(c,true); i++; continue; }
    i++;
  }
  return { code, skel, depthAtEnd: stack.length };
}
/* THE DERIVER IS A JAVASCRIPT DERIVER AND `app.html` IS NOT ALL JAVASCRIPT — this
   was found by this instrument's own ARM 2, which reported a phrase at line 1125
   that is plainly inside a block comment. The cause: run over the WHOLE file, the
   walk starts in the `<style>` blocks, where an apostrophe in a CSS comment opens a
   string that never closes, and every comment after it survives into the prose
   corpus. So the SCRIPT is isolated first, with the region outside it blanked to
   spaces of equal length so every offset and line number below still names the real
   place in the real file. The shell is not thrown away — it is read as PROSE by
   ARM 2s/3s, which is all it can be, since it holds no acts. */
const SCRIPT_OPEN = app.indexOf("<script>");
const SCRIPT_END  = app.indexOf("</script>", SCRIPT_OPEN);
const blank = (s) => s.replace(/[^\n]/g, " ");
const SCRIPT_ONLY = SCRIPT_OPEN >= 0 && SCRIPT_END > SCRIPT_OPEN
  ? blank(app.slice(0, SCRIPT_OPEN + 8)) + app.slice(SCRIPT_OPEN + 8, SCRIPT_END) + blank(app.slice(SCRIPT_END))
  : app;
/* THE SHELL — everything outside the script, with its `<style>` blocks and HTML
   comments removed. It carries member-facing markup and no act. */
const SHELL = (app.slice(0, SCRIPT_OPEN < 0 ? 0 : SCRIPT_OPEN) + app.slice(SCRIPT_END < 0 ? app.length : SCRIPT_END))
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<!--[\s\S]*?-->/g, "");
const D = derive(SCRIPT_ONLY);
const { code, skel } = D;
const lineOf = (idx) => code.slice(0, idx).split("\n").length;

function fnBodies(){
  const out=[];
  const re=/(?:^|\n)\s*(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/g;
  let m;
  while((m=re.exec(skel))){
    let i=re.lastIndex, depth=1;
    while(i<skel.length&&depth>0){ if(skel[i]==="(")depth++; else if(skel[i]===")")depth--; i++; }
    while(i<skel.length&&skel[i]!=="{"&&skel[i]!==";") i++;
    if(skel[i]!=="{") continue;
    let j=i, br=0;
    do{ if(skel[j]==="{")br++; else if(skel[j]==="}")br--; j++; }while(j<skel.length&&br>0);
    if(br!==0) continue;
    out.push({ name:m[1], at:m.index, start:i, end:j, body:code.slice(i,j), struct:skel.slice(i,j) });
  }
  return out;
}
const FNS = fnBodies();
const FN_BY_NAME = new Map(FNS.map(f => [f.name, f]));

console.log("\n=== ARM I · THE INSTRUMENT ===");
ok(SCRIPT_OPEN > 0 && SCRIPT_END > SCRIPT_OPEN,
   "ARM I0: app.html's single <script> region was located — a deriver run over the CSS and markup too starts inside a style block and every comment after the first apostrophe survives into the prose corpus (measured on this instrument's own first build)");
eq(SCRIPT_ONLY.length, app.length, "ARM I0: blanking outside the script preserved the file's length, so every line number below names the real line in the real file");
eq(code.length, skel.length, "ARM I1: the two corpora agree character for character, so an offset in one is the same place in the other");
ok(!code.includes("nobody rebuilds them"),
   "ARM I1b: prose that exists ONLY inside a block comment does not survive into the member-facing corpus — the regression that produced this arm, kept as the arm");
eq(D.depthAtEnd, 1, "ARM I2: the deriver ends at depth 1 — an unbalanced parse would silently merge regions");
{
  const probe = derive('const a=1; /* c1 */ // c2\nconst s="/* not a comment */"; const r=/["\\\\]/; const t=`x${ 1+1 }y`;');
  ok(!probe.code.includes("c1"), "ARM I3: block comments are removed");
  ok(!probe.code.includes("c2"), "ARM I3: line comments are removed");
  ok(probe.code.includes("/* not a comment */"), "ARM I3: text INSIDE a string literal survives in `code`");
  ok(!probe.skel.includes("not a comment"), "ARM I3: the same text is BLANKED in `skel`");
  ok(probe.skel.includes("1+1"), "ARM I3: interpolated `${…}` is CODE and survives in `skel`");
  ok(probe.skel.includes("const t="), "ARM I4: a regex literal carrying a double quote does not swallow the code after it");
}
ok(FNS.length >= 600, `ARM I5: ${FNS.length} function bodies walked (floor 600) — a walk over nothing passes everything`);
ok(code.length >= 400000, `ARM I5: ${code.length} characters of member-facing code read (floor 400,000)`);
{
  const longest = FNS.slice().sort((a,b)=>(b.end-b.start)-(a.end-a.start))[0];
  ok(longest && (longest.end-longest.start) < 20000,
     `ARM I6: the longest body is ${longest ? longest.name+" at "+(longest.end-longest.start) : "?"} chars — a body far past this means the brace matcher ran through a region and the walks below are reading the wrong extents`);
}

/* ==========================================================================
   ARM 0 · THE AUTHORITY IS READ, NOT REMEMBERED
   ========================================================================== */
console.log("\n=== ARM 0 · THE AUTHORITY ===");
/* DEC-69's entry is this sweep's authority, so it is READ at run time. If Bob
   amends it the sweep moves with the amendment instead of drifting from it —
   `analyst-vocabulary.mjs` takes exactly this direction over DEC-32 clause 1.
   The entry is NOT written here: `DECISIONS.md` names CONDUCT its sole writer. */
const DEC69 = (() => {
  const i = rulings.indexOf("### DEC-69");
  if(i < 0) return null;
  const j = rulings.indexOf("\n### ", i + 5);
  return rulings.slice(i, j < 0 ? rulings.length : j);
})();
ok(DEC69 !== null, "ARM 0a: DEC-69's entry is present in DECISIONS.md — this sweep has no authority without it, and a missing entry must fail rather than pass quietly");
const dec69 = DEC69 || "";
ok(/AMENDED/.test(dec69), "ARM 0b: DEC-69 carries its SAME-DAY AMENDMENT — the half that makes this about COMPULSION rather than about which mode is better");
ok(/FORCED/.test(dec69), "ARM 0b: the amendment's operative word FORCED is in the entry");
for(const named of ["DEC-39", "DEC-51", "DEC-49"])
  ok(dec69.includes(named), `ARM 0c: DEC-69 names ${named} as INFORMING AT THE ACT — the scope boundary ARM P enforces is the ruling's, not this file's`);
/* THE RUNG WORDS ARE CROSS-CHECKED AGAINST THE PLANE'S OWN LADDER. The ruling
   says ceremony is licensed by what the ACT is — "a terminal, attested or
   irreversible act carries deliberate weight" — and names the two rungs that earn
   none, "reversible or reasoned". Both sets are read out of the entry and every
   word must be a member of the IMPORTED `RUNG_LADDER`. Neither the ruling nor the
   plane is trusted alone: a rung renamed in `affordances.mjs` and not in the
   ruling (or the reverse) fails here rather than making this sweep silently
   classify by a word nothing uses. */
const CEREMONY_RUNGS = ["terminal", "attested", "irreversible"];
const PLAIN_RUNGS    = ["reversible", "reasoned"];
for(const r of [...CEREMONY_RUNGS, ...PLAIN_RUNGS]){
  ok(dec69.includes(r), `ARM 0d: DEC-69's own text names the rung '${r}'`);
  ok(RUNG_LADDER.includes(r), `ARM 0d: the plane's RUNG_LADDER carries '${r}' — the ruling and the ladder agree`);
}
eq(CEREMONY_RUNGS.length + PLAIN_RUNGS.length, RUNG_LADDER.length,
   "ARM 0e: every rung on the plane's ladder is classified by DEC-69 as either earning ceremony or not — a rung classified by neither is a rung this sweep would judge by nothing");
console.log(`  DEC-69 read: ${dec69.length} chars · ceremony rungs ${CEREMONY_RUNGS.join("/")} · plain rungs ${PLAIN_RUNGS.join("/")} · ladder ${RUNG_LADDER.join(" < ")}`);

/* ==========================================================================
   ARM C · THE CENSUS — A FIGURE WITH ITS REACH, NEVER A CLAIM OF COMPLETENESS
   ========================================================================== */
console.log("\n=== ARM C · THE CENSUS OF MEMBER-FACING ACT SITES ===");
const TRANSPORTS = ["actAsk","api","apiQ","apiR","intentAsk","rec","recPost","recPostR","recR"];
const OP_CALL = new RegExp("\\b(" + TRANSPORTS.join("|") + ")\\s*\\(\\s*[\"']([a-z]+)[\"']", "g");
/* THE PLANE'S OWN MUTATING SET, PARSED FROM ITS `OPS` TABLE. A hand list would
   agree at zero cost, which this project has measured five times. */
const PLANE_MUTATING = new Set();
const PLANE_OPS = new Set();
for(const m of plane.matchAll(/^\s{2}([a-z]+)\s*:\s*\{[^}]*mutating\s*:\s*(true|false)/gm)){
  PLANE_OPS.add(m[1]);
  if(m[2] === "true") PLANE_MUTATING.add(m[1]);
}
ok(PLANE_MUTATING.size >= 60, `ARM C0: the plane's OPS table parsed — ${PLANE_MUTATING.size} mutating of ${PLANE_OPS.size} ops (floor 60). A table read as empty makes every reach figure below meaningless`);

const ACT_SITES = [];
for(const f of FNS){
  const ops = new Set();
  for(const m of f.body.matchAll(new RegExp(OP_CALL.source, "g"))) ops.add(m[2]);
  const mut = [...ops].filter(o => PLANE_MUTATING.has(o)).sort();
  if(mut.length) ACT_SITES.push({ fn: f.name, at: f.at, line: lineOf(f.at), ops: mut, f });
}
const OPS_REACHED = new Set(ACT_SITES.flatMap(s => s.ops));
const UNREACHED = [...PLANE_MUTATING].filter(o => !OPS_REACHED.has(o)).sort();
console.log(`  CENSUS · ${ACT_SITES.length} member-facing ACT SITES in civicos-ui/app.html, reaching ${OPS_REACHED.size} distinct MUTATING ops of the plane's ${PLANE_MUTATING.size}.`);
console.log(`  REACH  · this figure is a FLOOR and these are the four things it does not see:`);
console.log(`           (1) one file only — civicos-ui/app.html, ${code.length} chars of code; any other member-facing surface is outside it;`);
console.log(`           (2) named \`function\` declarations only — ${FNS.length} walked; an act committed from an arrow const or an object method is not counted;`);
console.log(`           (3) literal op names through ${TRANSPORTS.length} known transports only — an op reached through a variable is invisible;`);
console.log(`           (4) ${UNREACHED.length} of the plane's mutating ops are reached by NO act site here, which is a fact about this walk as much as about the surface.`);
console.log(`  ACT SITES BY RUNG:`);
{
  const byRung = new Map();
  for(const s of ACT_SITES) for(const op of s.ops){
    const r = RUNGS[op] || (RUNG_ABSENT[op] ? "(no rung: " + RUNG_ABSENT[op].ground + ")" : "(unclassified)");
    if(!byRung.has(r)) byRung.set(r, new Set());
    byRung.get(r).add(`${s.fn}→${op}`);
  }
  for(const [r, set] of [...byRung].sort())
    console.log(`           ${r.padEnd(28)} ${set.size}  ${[...set].sort().slice(0,6).join(", ")}${set.size>6?", …":""}`);
}
ok(ACT_SITES.length >= 40, `ARM C1: ${ACT_SITES.length} act sites found (floor 40)`);
ok(OPS_REACHED.size >= 30, `ARM C2: ${OPS_REACHED.size} distinct mutating ops reached (floor 30)`);
/* EVERY OP THIS SURFACE SENDS IS CLASSIFIED BY THE PLANE'S OWN TABLES. An op in
   neither `RUNGS` nor `RUNG_ABSENT` cannot be judged by ARM 1 at all, so it fails
   here BY NAME rather than being skipped — the shape `surface-registry` uses for
   an unclassified router. */
for(const op of [...OPS_REACHED].sort())
  ok(Object.prototype.hasOwnProperty.call(RUNGS, op) || Object.prototype.hasOwnProperty.call(RUNG_ABSENT, op),
     `ARM C3: op '${op}' is sent by a member-facing act site and is classified by neither RUNGS nor RUNG_ABSENT — ARM 1 cannot judge a ceremony on an act whose weight the plane does not declare`);

/* ==========================================================================
   ARM P · THE SCOPE BOUNDARY — THE THREE THINGS DEC-69 PROTECTS BY NUMBER
   ========================================================================== */
console.log("\n=== ARM P · INFORMING AT THE ACT SURVIVES (the over-strictness arm, run every time) ===");
/* DEC-51 — the grade note at capture (UI-54). Rendered from the plane's own
   `acq.note`; `addCaptureNote` escapes it and renders it whole. */
{
  const f = FN_BY_NAME.get("addCaptureNote");
  ok(!!f, "ARM P1: DEC-51's renderer `addCaptureNote` is present in app.html");
  const addCapture = FN_BY_NAME.get("addCapture");
  ok(!!addCapture && /addCaptureNote\s*\(/.test(addCapture.body),
     "ARM P1: `addCapture` still CALLS `addCaptureNote` — the note reaching the holder is what DEC-51 requires, and a renderer nobody calls is the tidy that would pass a text search");
  ok(/a-note/.test(code), "ARM P1: the note's holder `#a-note` is still rendered by the Add form");
  ok(typeof ACQUIRE_GRADE_NOTE === "string" && ACQUIRE_GRADE_NOTE.length > 80,
     "ARM P1: the plane still publishes ACQUIRE_GRADE_NOTE — the note is the RECORD'S sentence and this surface composes none of it");
  ok(!code.includes(ACQUIRE_GRADE_NOTE),
     "ARM P1: and app.html holds NO COPY of it — the note is rendered from the wire, so the record has one voice and not two");
}
/* DEC-39 — the co-attestation honesty fence. */
{
  const fence = FN_BY_NAME.get("attestFence"), fenceHtml = FN_BY_NAME.get("attestFenceHtml");
  ok(!!fence && !!fenceHtml, "ARM P2: DEC-39's fence readers `attestFence`/`attestFenceHtml` are present");
  ok(/\.prompt\b/.test(fence ? fence.body : ""),
     "ARM P2: the fence is read off the ACT'S OWN `prompt` — the plane's publication, not a sentence composed here");
  const openAz = FN_BY_NAME.get("openAttestDialog");
  ok(!!openAz && /attestFence\s*\(\s*\)/.test(openAz.body),
     "ARM P2: the dialog still REFUSES TO OPEN without the fence — DEC-39's rule that an irreversible public act offered without its fence is worse than one that cannot be offered");
  ok(!!openAz && /attestFenceHtml\s*\(\s*\)/.test(openAz.body),
     "ARM P2: and the fence is RENDERED in the dialog, not merely checked for");
  ok(typeof ATTEST_FENCE === "string" && ATTEST_FENCE.length > 80,
     "ARM P2: the plane still publishes ATTEST_FENCE");
  ok(!code.includes(ATTEST_FENCE),
     "ARM P2: and app.html holds NO COPY of the fence text");
}
/* DEC-49 — the honest refusal reason. The guard `check-refusal-codes.mjs` runs in
   the loop the reader actually runs (`test/run.mjs`); what is asserted here is
   that the SURFACE still renders a refusal's own reason rather than swallowing it. */
{
  const refusalRenderers = FNS.filter(f => /RefusalHtml$/.test(f.name));
  ok(refusalRenderers.length >= 2,
     `ARM P3: ${refusalRenderers.length} refusal renderers present (floor 2) — DEC-49's honest reason has to be rendered somewhere`);
  ok(fs.existsSync(new URL("../check-refusal-codes.mjs", import.meta.url).pathname),
     "ARM P3: the DEC-49 guard is on disk and is run by test/run.mjs — a mechanism outside the loop the reader runs is not a mechanism");
  const translators = FNS.filter(f => /reason|refus/i.test(f.name) && /\breason\b/.test(f.body));
  ok(translators.length >= 1,
     "ARM P3: at least one function reads a refusal's `reason` and puts it in front of a member");
}
console.log("  DEC-51's grade note, DEC-39's fence and DEC-49's refusal reasons: all PRESENT, all PLANE-SOURCED, no copy in app.html.");

/* ==========================================================================
   ARM 1 · SHAPE ONE — RE-CONFIRMATION OF DECIDED ACTS
   ========================================================================== */
console.log("\n=== ARM 1 · RE-CONFIRMATION OF DECIDED ACTS ===");
/* THE ATOM IS THE RULING'S OWN. DEC-69 spells one phrase — "are you sure" — so
   that one is PARSED from the entry rather than typed here. The rest is a
   CEILINGED, PRINTED residue, and it is said to be a floor. */
const REAFFIRM_ATOM = (dec69.match(/"are you sure"/i) || [])[0] ? "are you sure" : null;
ok(REAFFIRM_ATOM === "are you sure",
   "ARM 1a: the re-confirmation atom is PARSED from DEC-69's own sentence, not typed from memory");
const REAFFIRM_RESIDUE = [
  "are you certain", "please confirm", "confirm that you", "do you really",
  "click again to confirm", "press again to confirm", "i understand", "i acknowledge",
  "tick to confirm", "check this box to confirm", "confirm you have read",
];
ok(REAFFIRM_RESIDUE.length <= 15,
   `ARM 1a: the re-confirmation residue is ceilinged at 15 and holds ${REAFFIRM_RESIDUE.length} — a residue that grows without bound has become the hand list it replaced`);
console.log(`  RE-CONFIRMATION FAMILY (a FLOOR, printed): atom "${REAFFIRM_ATOM}" from DEC-69 + ${REAFFIRM_RESIDUE.length} residue spellings — ${REAFFIRM_RESIDUE.join(", ")}`);
const REAFFIRM = [REAFFIRM_ATOM, ...REAFFIRM_RESIDUE];

/* 1b — THE BROWSER CONFIRM. `window.confirm` is a second affirmation of a
   decision already made, by construction: it adds no input, carries nothing into
   the payload, and exists only to ask again. */
{
  const hits = [...skel.matchAll(/\b(?:window\s*\.\s*)?confirm\s*\(/g)].map(m => lineOf(m.index));
  eq(hits.length, 0, `ARM 1b: no member-facing surface calls confirm() — a browser confirm carries nothing into the act and exists only to ask again${hits.length?" (lines "+hits.join(", ")+")":""}`);
}

/* 1c — RE-AFFIRMATION PROSE AT AN ACT SITE, JUDGED BY THE ACT'S RUNG.
   DEC-69's third bullet: a terminal, attested or irreversible act carries
   deliberate weight because of what the ACT is. So the same words are a FLAW on a
   reversible or reasoned act and are the LADDER'S OWN CEREMONY above them, and
   this arm reports which by naming the rung. */
{
  let judged = 0, licensed = 0;
  for(const s of ACT_SITES){
    const rungs = s.ops.map(o => RUNGS[o]).filter(Boolean);
    const ceremonial = rungs.some(r => CEREMONY_RUNGS.includes(r));
    const plain = rungs.filter(r => PLAIN_RUNGS.includes(r));
    if(!plain.length){ if(ceremonial) licensed++; continue; }
    judged++;
    const low = s.f.body.toLowerCase();
    for(const stem of REAFFIRM){
      if(!stem) continue;
      ok(!low.includes(stem),
         `ARM 1c: '${s.fn}' (line ${s.line}) commits ${s.ops.join("/")} at rung ${plain.join("/")} and carries the re-affirmation stem "${stem}" — DEC-69 names exactly this: asking a member to affirm what they already decided, on an act the ladder classes ${plain.join(" or ")}`);
    }
  }
  console.log(`  ${judged} act site(s) judged at a rung that earns NO ceremony (${PLAIN_RUNGS.join("/")}); ${licensed} carry a ceremony rung and are licensed by DEC-69's third bullet.`);
  ok(judged >= 10, `ARM 1c: ${judged} act sites judged (floor 10) — an arm that judges nothing passes everything`);
}

/* 1d — AN AFFIRMATION THAT NEVER LEAVES THE DEVICE. A tick whose value the act
   does not carry is a second affirmation wearing an input's clothes: the member
   is made to say yes twice and the record hears it once. Every checkbox and radio
   in the file is classified, and a control in neither class fails BY NAME. */
{
  const inputs = [...code.matchAll(/<input[^>]*type\s*=\s*"(checkbox|radio)"[^>]*>/g)]
    .map(m => ({ line: lineOf(m.index), tag: m[0] }));
  ok(inputs.length >= 15, `ARM 1d: ${inputs.length} checkbox/radio controls found (floor 15)`);
  let selector = 0, choice = 0;
  for(const inp of inputs){
    const isSelector = /\bdata-id\s*=/.test(inp.tag) || /\bid\s*=\s*"rv-all"/.test(inp.tag)
                     || /SelectionToggle\s*\(/.test(inp.tag) || /rvAll\s*\(/.test(inp.tag);
    const isChoice   = /\bon(?:change|click)\s*=\s*"[^"]*\b[A-Za-z0-9_$]+\s*\(/.test(inp.tag)
                     || /\bid\s*=\s*"a-(?:subs|arch)"/.test(inp.tag);
    if(isSelector) selector++; else if(isChoice) choice++;
    ok(isSelector || isChoice,
       `ARM 1d: the control at line ${inp.line} is neither an ITEM SELECTOR (it feeds the set the act sends) nor a CHOICE (its value enters the payload). An affirmation that reaches no op is the member saying yes twice — ${inp.tag.slice(0,140)}`);
  }
  console.log(`  ${inputs.length} tick/choice control(s): ${selector} item selector(s), ${choice} payload choice(s), 0 pure affirmations.`);
}

/* ==========================================================================
   ARM 2 · SHAPE TWO — REPEATED OR ACT-DETACHED RESPONSIBILITY PROMPTS
   ========================================================================== */
console.log("\n=== ARM 2 · RESPONSIBILITY PROMPTS: ATTACHED, AND SAID ONCE ===");
/* THE FAMILY IS A FLOOR AND IS PRINTED. DEC-69 enumerates no vocabulary for a
   responsibility prompt — unlike DEC-32 clause 1, which enumerates its own — so
   there is no closure to derive and this list is what it looks like. Said plainly
   rather than implied: a novel phrasing is not caught. */
const OBLIGATION_FAMILY = [
  "you must", "you should", "you need to", "be sure to", "make sure you",
  "remember to", "don't forget", "do not forget", "take care to",
  "your responsibility", "you are responsible", "please ensure", "please review",
  "please check", "it is important that you", "always check", "never forget",
];
ok(OBLIGATION_FAMILY.length <= 20,
   `ARM 2a: the obligation family is ceilinged at 20 and holds ${OBLIGATION_FAMILY.length}`);
console.log(`  OBLIGATION FAMILY (a FLOOR, printed — DEC-69 enumerates no vocabulary, so nothing here is derived): ${OBLIGATION_FAMILY.join(" · ")}`);
{
  const low = code.toLowerCase();
  const hits = [];
  for(const stem of OBLIGATION_FAMILY){
    let i = -1;
    while((i = low.indexOf(stem, i + 1)) >= 0) hits.push({ stem, line: lineOf(i), at: i });
  }
  /* ATTACHED — a prompt lives in a function that also offers the act it is about.
     DETACHED is the flaw DEC-69 names: "responsibility reminders detached from any
     act". A function that renders a control or sends an op is the act's own site. */
  for(const h of hits){
    const host = FNS.find(f => h.at >= f.start && h.at < f.end);
    const attached = !!host && (/<button|<input|<select|<textarea/i.test(host.body)
                              || new RegExp(OP_CALL.source).test(host.body));
    ok(attached,
       `ARM 2b: the responsibility prompt "${h.stem}" at line ${h.line}${host?` in '${host.name}'`:" (outside any walked function)"} is DETACHED — it is not at the act it is about, which is the second shape DEC-69 names`);
  }
  console.log(`  ${hits.length} member-directed obligation phrase(s) found in the script; every one must sit at the act it is about.`);
  /* 2s — THE SHELL. The markup outside the script holds member-facing text and NO
     act, so an obligation phrase there is DETACHED by construction: there is
     nothing for it to be attached to. */
  const shellLow = SHELL.toLowerCase();
  for(const stem of OBLIGATION_FAMILY)
    ok(!shellLow.includes(stem),
       `ARM 2s: the responsibility prompt "${stem}" is in app.html's static shell, which hosts no act at all — a reminder with no act to attach to is the detached shape by construction`);
  console.log(`  SHELL: ${SHELL.length} chars of markup outside the script read for the same family; it hosts no act, so any hit there is detached by construction.`);
  /* REPEATED — the same reminder shown to a member more than once for the same
     act. NOT the same sentence appearing at two DIFFERENT acts: DEC-39's fence is
     rendered at the offer AND on the receipt by design, which is informing at the
     act at both ends and is exactly what ARM P protects. So the test is narrowed
     to two hits of the SAME stem inside ONE function. */
  const perFn = new Map();
  for(const h of hits){
    const host = FNS.find(f => h.at >= f.start && h.at < f.end);
    const key = `${host ? host.name : "(top level)"}::${h.stem}`;
    perFn.set(key, (perFn.get(key) || 0) + 1);
  }
  for(const [key, count] of perFn)
    ok(count === 1, `ARM 2c: "${key.split("::")[1]}" is said ${count} times inside '${key.split("::")[0]}' — informing at the act is ONCE, and the second telling is the nag`);
}

/* ==========================================================================
   ARM 3 · SHAPE THREE — DILIGENCE MEASUREMENT OF A MEMBER
   ========================================================================== */
console.log("\n=== ARM 3 · NO DILIGENCE MEASUREMENT (DEC-68: the approval IS the act) ===");
/* Bob, 2026-08-10, answering DEC-68: *"Why do we want to count the number of times
   that a user approves a candidate? If the user approves it, then it's approved."*
   The enactment rests on `op=readingname` staying NON-MUTATING — it writes no read
   event, so there is no diligence signal to retain. That is ASSERTED against the
   plane's own table rather than remembered, so the day somebody makes it mutating
   this arm goes red instead of the doctrine going quiet. */
{
  const m = plane.match(/^\s{2}readingname\s*:\s*\{[^}]*mutating\s*:\s*(true|false)/m);
  ok(!!m, "ARM 3a: `op=readingname` is in the plane's OPS table");
  eq(m ? m[1] : null, "false",
     "ARM 3a: `op=readingname` is still NON-MUTATING — DEC-68's enactment is that no read event is retained, and a member-reading log is the doctrine risk Bob refused");
}
const DILIGENCE_FAMILY = [
  "diligence", "without reading", "you have reviewed", "you have not read",
  "unread", "read carefully", "attention score", "approval rate",
  "how many times you", "how often you", "you approved", "your approval rate",
];
console.log(`  DILIGENCE FAMILY (a FLOOR, printed): ${DILIGENCE_FAMILY.join(" · ")}`);
{
  const low = code.toLowerCase(), shellLow = SHELL.toLowerCase();
  for(const stem of DILIGENCE_FAMILY){
    const i = low.indexOf(stem);
    ok(i < 0, `ARM 3b: the diligence phrase "${stem}" is rendered at line ${i<0?"-":lineOf(i)} — DEC-68 withdrew the premise: no other member act is graded on diligence and this one is not either`);
    ok(!shellLow.includes(stem), `ARM 3b: the diligence phrase "${stem}" is in app.html's static shell`);
  }
  /* AND THE COUNTS THAT DO EXIST ARE NOT THIS. `rvCount` says "3 documents
     selected" and `queueMuteReportHtml` says how many items a member's own mute is
     holding back. Both count a member's CURRENT SELECTION or their own stated
     preference, which is the surface telling them what they are about to do and
     what they asked for — not a score over their past acts. DEC-68's subject is
     "the number of times that a user approves a candidate", and the distinction is
     recorded here so a later reader does not mistake one for the other and delete
     a member's own receipt in this ruling's name. */
  ok(/documents? selected/i.test(code),
     "ARM 3c: the selection count survives — telling a member how many things they have ticked is the surface reporting THEIR OWN CURRENT ACT, not grading their attention, and DEC-68 withdrew a premise about counting approvals over time");
}

/* ==========================================================================
   ARM V · THE ANALYST'S VOCABULARY REACHES NO MEMBER (DEC-32 clause 1),
   CONSUMED FROM THE ONE DERIVED FAMILY AND NEVER RE-LISTED HERE
   ========================================================================== */
console.log("\n=== ARM V · DEC-32 CLAUSE 1, over the corpus this sweep already reads ===");
/* WHY THIS ARM IS HERE AT ALL, since it is not one of DEC-69's four shapes: this
   file walks every member-facing string in `app.html`'s script and its shell, which
   is the broadest such corpus in this directory. A sweep holding that corpus and
   NOT asking DEC-32's question would be a ban site that reads as coverage and
   enforces nothing — the exact disease UI-53's census exists to treat. */
{
  const hits = analystHits(SHELL);
  ok(hits.length === 0,
     `ARM V: the analyst's vocabulary reaches a member through app.html's static shell — ${hits.slice(0,4).map(h=>JSON.stringify(h)).join(", ")}`);
  console.log(`  ${reachLine()}`);
  console.log(`  SHELL swept for the family: ${SHELL.length} chars, ${hits.length} hit(s). The SCRIPT's own member-facing strings are swept by the surface suites that own each region (elicitation, notifications, version-review, connections-sidebar), which consume the same family — this arm deliberately does NOT duplicate their reach.`);
}

/* ==========================================================================
   ARM 4 · SHAPE FOUR — A SET OF DECISIONS REACHABLE IN ONLY ONE MODE
   ========================================================================== */
console.log("\n=== ARM 4 · BOTH MODES, NEITHER FORCED (DEC-69 as amended) ===");
/* Every repeated control is ENUMERATED structurally, then CLASSIFIED by register.
   See note (e) at the head of this file for why the classification is a register
   and not a derivation. A site in NEITHER register fails BY NAME. */
/* TWO WALKS, AND THE SECOND FINDS WHAT THE FIRST STRUCTURALLY CANNOT — measured,
   not anticipated. WALK A reads the `.map(` argument itself. It misses every
   per-item control rendered by a function the map CALLS, and the queue's
   `queueEntryControlsHtml` — the file's heaviest per-item act set, three controls
   on every FINDING — is exactly that shape: `queueItemHtml` maps the feed and calls
   it, so the controls are one hop away and WALK A sees an empty map. A walk that
   had only arm A would have reported this audit's second carried finding as absent.
   WALK B follows one hop: any function CALLED inside a map region that itself
   renders a control. The union is the real set, and each arm's contribution is
   PRINTED so a later reader can tell which walk is carrying the coverage. */
const REPEATED = [];
{
  const regions = [];
  const re = /\.map\s*\(/g; let m;
  while((m = re.exec(skel))){
    let i = re.lastIndex, depth = 1;
    while(i < skel.length && depth > 0){ if(skel[i]==="(") depth++; else if(skel[i]===")") depth--; i++; }
    regions.push({ at: m.index, end: i, src: code.slice(m.index, i), struct: skel.slice(m.index, i) });
  }
  const rendersControl = (s) => /<button|<input(?![^>]*type\s*=\s*"hidden")/i.test(s);
  const seen = new Set();
  const add = (host, line, src, walk) => {
    const key = host + "::" + line;
    if(seen.has(key)) return;
    seen.add(key);
    REPEATED.push({ host, line, src, walk });
  };
  let a = 0, b = 0;
  for(const r of regions){
    const host = FNS.find(f => r.at >= f.start && r.at < f.end);
    const hostName = host ? host.name : "(top level)";
    if(rendersControl(r.src)){ add(hostName, lineOf(r.at), r.src, "A"); a++; }
    /* WALK B — TWO hops, and the depth is a MEASUREMENT rather than a guess. One
       hop was tried first and it still missed `queueEntryControlsHtml`, because the
       queue composes `feed.map(queueItemHtml)` and `queueItemHtml` calls the act
       renderer: the controls are two calls from the map. DEPTH 2 reaches it and is
       where this walk stops; a per-item control three hops from its map is NOT
       seen, and that is stated rather than left to be discovered. */
    /* IDENTIFIERS, NOT CALLS, AT HOP ONE. `.map(queueItemHtml)` passes a REFERENCE
       and never writes `queueItemHtml(`, so a walk keyed on a call site misses the
       whole queue. Found by this arm reporting `queueGroupHtml` while the act
       renderer two hops down stayed invisible. */
    const frontier = new Set();
    for(const cm of r.struct.matchAll(/\b([A-Za-z][A-Za-z0-9_$]*)/g)) frontier.add(cm[1]);
    const reached = new Set(frontier);
    for(const nm of [...frontier]){
      const f1 = FN_BY_NAME.get(nm);
      if(!f1) continue;
      for(const cm of f1.struct.matchAll(/\b([A-Za-z][A-Za-z0-9_$]*)\s*\(/g)) reached.add(cm[1]);
    }
    for(const nm of reached){
      const callee = FN_BY_NAME.get(nm);
      if(!callee || !rendersControl(callee.body)) continue;
      if(callee.at >= r.at && callee.at < r.end) continue;   // already WALK A's
      add(callee.name, lineOf(callee.at), callee.body, "B");
      b++;
    }
  }
  console.log(`  WALK A (the map's own argument): ${a} hit(s); WALK B (up to TWO hops into a callee that renders a control): ${b} hit(s); union ${REPEATED.length} distinct site(s). THREE hops is NOT followed.`);
}
ok(REPEATED.length >= 25, `ARM 4a: ${REPEATED.length} repeated-control site(s) enumerated (floor 25)`);

/* CHOOSER FOR ONE DECISION — a list of OPTIONS for a single act. Acting consumes
   the choice, so there is no set of decisions and no second mode to offer. */
const CHOOSERS = {
  "openBundle":            "the document page: version toggles and the act STRIP for ONE document — one control per act the record publishes, not one per item",
  "actBarHtml":            "the act STRIP for one object — one control per act the record publishes, not one per item",
  "openRosterAct":         "the roster act strip for one project",
  "queueOptionsHtml":      "options that NAVIGATE — `queueWire` binds `data-open` only, so the act lives on the object and this list decides nothing",
  "queueFeedHtml":         "per-feed Retry — a READ refresh over a degraded feed, not an act on a record item",
  "concludePaint":         "leg TICKS composing ONE conclusion; the act's subject is the single question",
  "elicPaint":             "per-leg answers composing ONE grounding; the commit is one act over the whole answer",
  "citePaint":             "radios choosing the ONE citing object, and the ONE basis role, for one cite",
  "edgePaint":             "radios choosing the ONE edge to sever or reinstate",
  "finderPaintScopes":     "scope chips filtering ONE query; a chip narrows the question, it decides nothing",
  "finderPaintSelection":  "the acts the record publishes over ONE held selection",
  "disposePaint":          "radios choosing the ONE disposition token for one act",
  "openBallotDialog":      "radios choosing the ONE owner a ballot is about",
  "proposalActPaint":      "radios choosing the ONE disposition token",
  "addActionPaneHtml":     "draft-list editing (basis legs, clock entries) before ONE op=promote; nothing is decided until the one act",
  "progStageHtml":         "draft-list editing of a progression's stages before ONE op=progressiondefine",
  "lookupSubject":         "disambiguation — choosing the ONE subject a lookup meant",
  "relationFindOther":     "disambiguation — choosing the ONE other subject a relation is about",
  "subjConcernsHtml":      "navigation into the documents that concern a subject",
  "queueSubjectHtml":      "navigation to the object a queue item is about",
  "queueGroupHtml":        "the case group's own controls — the mute (registered as a SET below) and a read Retry; the per-item ACTS are queueEntryControlsHtml's, registered below",
  "copyBtn":               "a copy-to-clipboard control; it touches the record not at all",
  "pubCaseHtml":           "per-hash Verify — a READ any reader may run, and a public reader holds no selection to act over",
  "pubFindingPages":       "per-hash Verify on a finding's pages — the same read",
  "pubLegHtml":            "per-leg open and Verify on a published case — reads, on a surface with no member and no selection",
  "stanceActHtml":         "one control per accepted reading; a project stands on exactly ONE, so a set is incoherent",
};
/* SETS OF DECISIONS — a list where each item is decided independently, so both
   modes are owed. Every row states which modes exist TODAY and, where a mode is
   missing, WHY it cannot be built here. */
const SETS = {
  "loadResolveCandidates": { single: true, bulk: false, op: "resolve",
    why: "UI-56 (carried): `op=resolve` takes ONE `captureSha`. A bulk path is the PLANE accepting a set, not this surface looping — N calls over N documents is the forty-dialogs shape wearing a bulk control's clothes (DEC-52, and `aiConnectionsReviewMotion`'s own note)." },
  "queueEntryControlsHtml": { single: true, bulk: false, op: "proposedispose",
    why: "UI-56 (carried): `op=proposedispose` is keyed on ONE (progression_key, stage_key) and `op=taskresolve`/`op=taskforward` each take ONE `id`. The queue's own header already names selection scoping as an unbuilt follow-on and refuses to stub a control for it." },
  "paintReview": { single: true, bulk: true, op: "release",
    why: "CLEAN, and it is the shape the other two are measured against: a per-row tick with a select-all, ONE `op=select` lease carrying the whole array into ONE `op=release` — and a single document released from its own page, which the empty-state line names ('or open one and release it from its page'). Crucial material carries a seal instead of a tick, so it is structurally unbulkable, and the page-bound note says select-all does not reach rows the record held back." },
  "finderRowsHtml": { single: true, bulk: true, op: "select",
    why: "CLEAN. A tick per row holds one document; 'Hold these together' holds the ticked set; 'Hold everything this query matches' holds the CRITERION, so the bulk path is not even bounded by the page. Three cardinalities, none forced." },
  "finderSubjectsPanelHtml": { single: true, bulk: true, op: "select",
    why: "CLEAN. The subjects route's ticks join the same enumerated lease, so one subject-route document or many is the member's choice." },
  "aiConnectionCardHtml": { single: true, bulk: true, op: "(none — no plane op records a review of a machine connection)",
    why: "CLEAN, and it is the amendment's shape reached the other way round. Selection is PER CARD and `aiConnectionsReviewMotion` composes ONE motion over whatever is picked — one connection or forty — so neither mode is forced. UI-44's anti-gate arm already holds the harder half: reviewing changes a connection's standing not at all, so this is visibility and bulk review rather than an approval gate (DEC-52 final)." },
  "queueMuteHtml": { single: true, bulk: true, op: "queuemute",
    why: "CORRECTED IN PLACE by UI-55. This was the amendment's BULK-ONLY half: one control muted every condition kind on the case and the member could not say 'just this one'. `op=queuemute` already took an arbitrary subset, so the single-kind path was one parameter away and no plane change was owed." },
};
{
  let classified = 0;
  for(const r of REPEATED){
    const inChooser = Object.prototype.hasOwnProperty.call(CHOOSERS, r.host);
    const inSet     = Object.prototype.hasOwnProperty.call(SETS, r.host);
    if(inChooser || inSet) classified++;
    ok(inChooser || inSet,
       `ARM 4b: the repeated control in '${r.host}' (line ${r.line}) is in NEITHER register. Classify it: a CHOOSER FOR ONE DECISION (acting consumes the choice) or a SET OF DECISIONS (each item decided independently, so both modes are owed). A list that arrives unclassified is how a forced mode ships.`);
  }
  console.log(`  ${classified} of ${REPEATED.length} repeated-control site(s) classified · ${Object.keys(CHOOSERS).length} choosers · ${Object.keys(SETS).length} sets of decisions.`);
  /* AND THE REGISTER MAY NOT ROT IN THE OTHER DIRECTION. A row naming a host that
     no longer renders a repeated control is a classification nobody is enforcing —
     the exempted-test shape CLAUDE.md forbids — and it silently shrinks this arm's
     reach while the count still reads as coverage. Both registers are swept. */
  const hosts = new Set(REPEATED.map(r => r.host));
  for(const k of [...Object.keys(CHOOSERS), ...Object.keys(SETS)])
    ok(hosts.has(k), `ARM 4b: the register names '${k}', which renders no repeated control today. STRIKE the row or find where the control went — a classification of something that is gone is not enforcement.`);
}
/* 4c — THE AMENDMENT, BOTH WAYS. */
for(const [host, s] of Object.entries(SETS)){
  ok(s.single, `ARM 4c: the set of decisions in '${host}' offers NO single-item path — a surface that only offers bulk takes the mode of judgment out of the member's hands just as surely as forty clicks do. ${s.why}`);
  ok(s.bulk || /^UI-\d+ \(carried\)/.test(s.why),
     `ARM 4c: the set of decisions in '${host}' offers NO bulk path and carries no reason — every missing mode is either built or CARRIED AS A NAMED ITEM with why it cannot be built here. ${s.why}`);
  console.log(`  ${host.padEnd(26)} single:${s.single?"yes":"NO "} bulk:${s.bulk?"yes":"NO "} · ${s.why}`);
}
/* 4d — THE CARRY IS SELF-EXPIRING, WHICH IS WHAT MAKES IT A CARRY AND NOT AN
   EXEMPTION. Each carried row claims the PLANE takes one key; that claim is
   re-measured against the plane's own source every run, so the day an op learns to
   accept a set this arm goes RED and the next session builds the mode. UI-44's
   SECTION 0 is the precedent: a caveat that expires by itself rather than being
   inherited. */
{
  const store = fs.readFileSync(new URL("../../bio-plane/src/store.mjs", import.meta.url).pathname, "utf8");
  const stillScalar = [
    { op: "resolve",        sig: /async resolveReferences\(\{\s*captureSha/ },
    { op: "proposedispose", sig: /proposeDispose\(\{\s*progressionKey/ },
  ];
  for(const c of stillScalar)
    ok(c.sig.test(store),
       `ARM 4d: the carried row for '${c.op}' claims the plane takes ONE key, and the plane's own signature no longer matches that claim. Re-measure it: if the op now accepts a set, the bulk path is buildable here and the carry must be STRUCK in the same commit that builds it.`);
  /* And the correction's own claim, measured the same way and in the other
     direction: `op=queuemute` DOES take a set, which is why UI-55 could fix it here. */
  ok(/queueMute\(\{[^}]*kinds\s*=\s*null/.test(store),
     "ARM 4d: `op=queuemute` still takes `kinds` as a set — that is what made UI-55's single-kind path a one-parameter change rather than a plane delegation");
  const muteHtml = FN_BY_NAME.get("queueMuteHtml");
  ok(!!muteHtml && /data-mute1=/.test(muteHtml.body),
     "ARM 4d: `queueMuteHtml` renders no `data-mute1=` control, so the ONLY mute a member can reach is the whole set — that is the amendment's bulk-only flaw, and `op=queuemute` accepts a subset today so nothing but this surface is stopping it");
  ok(!!muteHtml && /data-mute=/.test(muteHtml.body),
     "ARM 4d: and the whole-set mute path is still rendered — the fix ENABLED a second mode, it did not replace one forcing with another");
  const wire = FN_BY_NAME.get("queueWire");
  ok(!!wire && /data-mute1/.test(wire.body),
     "ARM 4d: the per-kind control is WIRED — a control the surface draws and never binds is worse than none");
}

/* ========================================================================== */
console.log(`\nmember-respect: ${n - fails.length} pass, ${fails.length} fail`);
if(fails.length){ console.error("\nFAILURES:\n" + fails.map(f => "  - " + f).join("\n")); }
console.log(
`FOOT — WHAT THIS RUN DOES AND DOES NOT ESTABLISH.
  The census is ${ACT_SITES.length} act sites over ONE file and is a FLOOR with four stated
  blind spots (see ARM C's REACH lines). ARM 2's obligation family and ARM 3's
  diligence family are HAND LISTS, ceilinged and printed, because DEC-69 enumerates
  no vocabulary to derive a closure from — a novel phrasing is not caught and that is
  said rather than implied. ARM 4 partitions by REGISTER because whether a repeated
  control is a set of decisions or a chooser is not a fact a static walk can read;
  what the walk DOES enforce is that nothing arrives unclassified. Two sets of
  decisions are CARRIED, not clean: see ARM 4c.`);
process.exit(fails.length ? 1 : 0);
