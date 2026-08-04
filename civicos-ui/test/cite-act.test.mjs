/* UI-20 — `op=cite` GETS ITS CALLER, and `retire` / `sever` / `reinstate` get
 * theirs. The never-built U9 half.
 *
 * This harness drives the document page's plane-published act strip and all
 * four flows over a mock plane that mirrors `store.mjs`'s OWN refusal order for
 * `cite()`, `#edgeTransition()` and `retire()` — because the order is what the
 * pre-flight design turns on, and a mock that answered in a friendlier order
 * would be proving something the plane does not do.
 *
 * ================= CORRECTED 2026-08-04 BY REC-37 =================
 *
 * FACTS (i) AND (ii) BELOW WERE TRUE WHEN THIS HARNESS WAS WRITTEN AND ARE NOW
 * WRONG, and they are corrected here rather than exempted, because the GAP THEY
 * NAMED IS CLOSED. UI-20 measured it and queued it; REC-37 built the plane half.
 * What is true as of REC-37, measured in source the same way:
 *
 *   (i')  `op=cite`'s citing object MAY BE A QUESTION. The store refuses only an
 *         object that is neither a case nor a question (`NOT_A_PROJECT`, its
 *         name deliberately unchanged — nothing previously admitted is now
 *         refused), and on the question arm a member may be information OR
 *         another inquiry (`NOT_CITABLE`, a new refusal on a newly legal arm).
 *         The leg lands on `inquiry_basis` THROUGH THE DOCUMENT: the act splices
 *         `basis[]` and promotes, so D-21 holds and the projection is still a
 *         projection. `op=affordances` publishes `cite` for
 *         `["information","project","inquiry"]`, and publishes the BASIS ROLES
 *         as a vocabulary beside it.
 *
 *   (ii') THE ACT STILL HAS NO CYCLE CHECK OF ITS OWN, and that has become the
 *         point rather than the gap: the leg now REACHES REC-11's guard at the
 *         write, so a cycle-closing cite is refused `BASIS_CYCLE` / `SELF_BASIS`
 *         WITH THE FULL PATH NAMED. The control UI-20 recorded as impossible to
 *         run as written — "remove the cycle pre-flight and the harness reaches
 *         the plane with a cyclic cite" — is now run for real below, in the one
 *         direction that was missing: onto a question.
 *
 *   (iii') TWO SURFACE GAPS WERE MEASURED AND NAMED HERE, AND UI-21 CLOSED BOTH
 *         (2026-08-05). The plane half landed with NO edit to `app.html` — that
 *         was REC-37's own acceptance clause and this file was the cross-check —
 *         so for one day the surface was honestly one step behind the record it
 *         fronts: `citeCandidates()` filtered the candidate list to `project`,
 *         so a question was never OFFERED as a citing object; and the flow sent
 *         no `role`, so a cite driven onto a question reached the plane and came
 *         back `NO_ROLE`, rendered in the plane's own words with DEC-8 intact.
 *         Both were asserted POSITIVELY as the measured state rather than
 *         papered over, which is why closing them shows up here as INVERTED
 *         assertions with their history kept rather than as a silent green.
 *         WHAT IS ASSERTED NOW: a question IS offered as a citing object;
 *         choosing one raises the ROLE control, whose options are the plane's
 *         published `vocabularies.basis_roles`; the commit is ABSENT until a
 *         role is stated, so the act is never sent incomplete and the flow no
 *         longer meets NO_ROLE at all; there is NO grade control anywhere on
 *         this path; and the receipt renders the plane's own per-leg grades with
 *         its own filled/undetermined counts. The CASE arm raises no role
 *         control and sends none, so ROLE_NOT_APPLICABLE is never provoked.
 *
 * The ORIGINAL facts, kept because the reasoning around them is still what this
 * file is built on:
 *
 *   (i)   `op=cite` cites INTO A PROJECT. `store.mjs:3907` refuses any other
 *         object_type NOT_A_PROJECT, and `:3930` refuses any selection member
 *         that is not `information` NOT_INFORMATION. `affordances.mjs:309`
 *         publishes `cite` for types `["information","project"]`. So CITING AN
 *         `INQ-` ONTO AN INQUIRY IS PLANE WORK THAT DOES NOT EXIST: an
 *         inquiry's basis is `inquiry_basis`, which REC-11 built as a
 *         PROJECTION of the document's own `basis:` block written by
 *         `op=promote`, and no op appends a leg to it. This harness therefore
 *         proves the inquiry half NEGATIVELY and asserts the gap rather than
 *         mocking a plane that would answer differently — a mock agreeing with
 *         a plane that does not exist agrees on nothing.  [SUPERSEDED — (i')]
 *
 *   (ii)  `cite()` HAS NO CYCLE CHECK. The record's DAG guard is REC-11's, on
 *         the basis write path (`SELF_BASIS` / `BASIS_CYCLE`, both of which name
 *         the full path), and `op=cite` never reaches it. The one cycle a cite
 *         can close today is a Project citing ITSELF, which the store catches
 *         inside NOT_INFORMATION deliberately (`store.mjs:3925`: "This also
 *         catches a Project citing itself, which is a cycle with nothing to
 *         mean"). So the cycle-closing cite below is driven for real, and what
 *         is asserted is that the surface renders THE PLANE'S answer and names
 *         every id the plane handed back. DEC-8 forbids the alternative.
 *         [SUPERSEDED IN PART — (ii'): the case arm is exactly as described and
 *         is still driven; the question arm now reaches the real guard.]
 *
 *   (iii) THERE IS NO CITE DRY RUN. UI-12's target-withheld pre-flight works
 *         only where the store judges the authored field BEFORE it resolves the
 *         selection. Measured: `retire()` checks its reason FIRST (`:2199`), so
 *         it has a real pre-flight and this harness drives it. `cite()`,
 *         `sever()` and `reinstate()` resolve the selection first, so no probe
 *         can reach their authored field without also being able to run the
 *         act. Those three take UI-22's stated shape instead: the commit
 *         control is ABSENT until the act has what it needs (an absent control
 *         is not a computed refusal), and everything that survives to the
 *         commit is worded by the plane. The publication half still does real
 *         work and is asserted: the control exists only because
 *         `op=affordances` published the act.
 *
 *   (iv)  `cite` PUBLISHES `rung: null` — it is not in `affordances.mjs`'s
 *         RUNGS, which holds the seven sourced rungs and no others. C-7 derives
 *         `reversible` for it, and FW-14 is the item that ASSIGNS it. Until
 *         then the surface renders the absence as an absence, and this harness
 *         asserts it does not render `reversible` from a document nobody wrote.
 *
 * NEGATIVE CONTROL, RE-RUN 2026-08-04 AFTER REC-37 (rec37-agent), arm (c) — the
 * one whose subject the widening changed most, because the new assertions are
 * all about a refusal sentence a member reads. Same edit, same file, restored
 * byte-identically to app.html sha256
 * e007522835e84f964a09ea7f2708b749c8bca961f56dfb8fd7cbe0e28e179cb3.
 * -> 10 of 131 failed (was 10 of 116), and the NEW assertion is among them:
 * "MEASURED GAP (UI): it sends no role, so the plane refuses NO_ROLE — and the
 * refusal is the plane's sentence". The invented sentence was named nine times
 * by the file-wide provenance check. So the widened arm is held to DEC-8 by the
 * same instrument as every other refusal here, and it is not passing on an
 * equality that costs nothing.
 * WHAT THE OLD ARMS' NOTES NO LONGER SAY, corrected rather than exempted: arm
 * (a)'s finding read "the inquiry_basis assertion STAYED GREEN, because the
 * plane still refuses NOT_A_PROJECT" — the plane does not refuse it any more, so
 * what keeps that assertion honest now is that a cite into a CASE still reaches
 * no basis at all, which is what it is asserting. And arm (b)'s note that the
 * item's literal cycle control "CANNOT BE RUN AS WRITTEN" is superseded: it can,
 * onto a question, and it is run below.
 *
 * NEGATIVE CONTROL, four arms, RUN 2026-08-04 and restored byte-identical after
 * each — app.html's sha256 was taken before, after the break and after the
 * restore on every arm, and all four returned to
 * c09049068108ba98c1dd323a235d023cec7dce2d1d3bb16497a20854cf4b134b. Each arm is
 * one edit in civicos-ui/app.html; the runner is one script per arm and every
 * count below is what it printed.
 *
 *   (a) THE TWO TARGETS CONFLATED. In `citeCandidates`, drop the object-type
 *       filter so a question and a document are offered as citing objects:
 *         if(normalizeType(b.object_type) !== "project") continue;
 *       ->  /* removed *\/
 *       -> RUN: 2 of 116 failed — "every citing object offered is one the
 *       record reports as a case" and "no document is offered as a citing
 *       object". WORTH KNOWING, and it is the arm's whole point: the
 *       inquiry_basis assertion STAYED GREEN, because the plane still refuses
 *       NOT_A_PROJECT and a refused cite writes nothing anywhere. A suite
 *       asserting only "nothing landed on inquiry_basis" would have called a
 *       surface that offers a question as a case CORRECT. The two targets not
 *       being conflated has to be asserted where the choice is OFFERED as well
 *       as where it lands, and this arm is why both assertions exist.
 *
 *   (b) THE IDS THE PLANE NAMED, DROPPED. In `citeRefusalHtml`, stop rendering
 *       the record's own `offenders`:
 *         if(r.offenders != null && …) parts.push(…)
 *       ->  /* removed *\/
 *       -> RUN: 4 of 116 failed — "the severed-edge refusal names the edge the
 *       plane named", "the cycle-closing cite names the offending id the plane
 *       handed back", "an INQ- member in the selection is named by id" and
 *       "retire refused CITED names the case that still cites it".
 *       THIS ARM CORRECTED ITS OWN INSTRUMENT, and the correction is the most
 *       useful thing in this file: on the first run only ONE of those four
 *       failed. The other three asserted `dialog.includes(id)`, and the very
 *       same ids also sit in the dialog's subject line and in its list of
 *       citing objects — so three assertions about NAMING were passing on an
 *       equality that costs nothing (CLAUDE.md). `namedIn()` now scopes them to
 *       the block the plane's `offenders` and `path` fields render into, and
 *       all four fail.
 *       THE ITEM'S LITERAL CONTROL — "remove the cycle pre-flight and the
 *       harness reaches the plane with a cyclic cite" — CANNOT BE RUN AS
 *       WRITTEN, and the reason is fact (ii) above rather than an omission:
 *       there is no surface cycle pre-flight to remove, because `cite()` has no
 *       cycle rule for a surface to front and DEC-8 forbids inventing one. The
 *       surface DOES reach the plane with a cyclic cite, today, by design —
 *       asserted positively below — so this arm breaks what that clause was
 *       protecting: the NAMING of the path the plane found.
 *
 *   (c) A SURFACE-COMPUTED REFUSAL. In `citeRefusalHtml`, keep the plane's
 *       reason CODE and substitute a sentence the surface wrote:
 *         return actRefusalHtml(r) + (parts.length …
 *       ->  return actRefusalHtml({reason:r.reason, detail:"That case cannot cite this material."}) + (parts.length …
 *       -> RUN: 10 of 116 failed, across every refused path in the file and led
 *       by "every refusal sentence rendered is one the plane returned", which
 *       named the invented sentence nine times. WORTH KNOWING: the reason CODE
 *       stayed correct on all ten, so a suite checking codes would have been
 *       entirely green — UI-12's arm (d) finding, reproduced in a second region
 *       against a different op.
 *
 *   (d) RETIRE'S WITHHELD HANDLE, RESTORED. In `retirePreflight`, make a real
 *       selection and probe with it instead of withholding it:
 *         const a = await actAsk("retire", { handle:"", reason: RETIRE.reason });
 *       ->  const s = await recPost("select", { ids:[RETIRE.id] }, { kind:"enumerated" });
 *           const a = await actAsk("retire", { handle: s.handle, reason: RETIRE.reason });
 *       -> RUN: 5 of 116 failed — "the pre-flight withheld the selection", "the
 *       pre-flight clears on NO_SUCH_SELECTION and on nothing else", "a cleared
 *       pre-flight renders no refusal at all", "A CLEARED PRE-FLIGHT HAS STILL
 *       WRITTEN NOTHING: the document has not moved" and "the reason the
 *       receipt shows is the one the record wrote back". The fourth is the one
 *       that matters and it is placed deliberately: the same assertion taken
 *       BEFORE the member writes a reason stays green under this break, because
 *       every probe was going to be refused NO_REASON anyway. A pre-flight only
 *       has to be proven harmless at the moment it stops being refused.
 */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

const APP = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");

/* ================= THE MOCK PLANE =================
   Its refusal SENTENCES are deliberately NOT the store's. What this harness
   proves is PROVENANCE — that every sentence a member reads came back over the
   wire — so wording the surface could not possibly have transcribed is the
   right instrument. Its refusal ORDER, by contrast, IS the store's exactly. */
const CALLS = [];
const SAID  = [];                    // every refusal sentence the plane returned

/* op=affordances' `acts`, in the producer's own shape (index.mjs decorateAct).
   `cite` publishes rung null — it is not in affordances.mjs's RUNGS — and the
   labels are the plane's, moved off the store's real wording so a transcription
   would be visible. */
const PUBLISHED = {
  /* CORRECTED 2026-08-04 (REC-37): the published label is type-neutral now,
     because one act publishing itself as "in a project" beside a question would
     be the publication disagreeing with the op it fronts. */
  cite:      { id:"cite",      label:"Cite material into a case or a question", weight:"report",
               needs:"contribute", mode:"session", rung:null, prompt:null },
  retire:    { id:"retire",    label:"Retire", weight:"refuse",
               needs:"contribute", mode:"session", rung:"terminal", prompt:null },
  sever:     { id:"sever",     label:"Sever a citation", weight:"refuse",
               needs:"contribute", mode:"session", rung:"reasoned", prompt:null },
  reinstate: { id:"reinstate", label:"Reinstate a severed citation", weight:"refuse",
               needs:"contribute", mode:"session", rung:"reasoned", prompt:null },
  release:   { id:"release",   label:"Release (verify)", weight:"refuse",
               needs:"contribute", mode:"session", rung:"reasoned", prompt:null },
  attest:    { id:"attest",    label:"Co-attest this capture", weight:"single",
               needs:"contribute", mode:"session", rung:"attested", prompt:null },
  conclude:  { id:"conclude",  label:"Conclude", weight:"single",
               needs:"contribute", mode:"session", rung:null, prompt:null },
};

const CASE_1 = "PROJ-2026-0001", CASE_2 = "PROJ-2026-0002", QUESTION = "INQ-2026-0700";
/* REC-37: a SECOND question, so a leg can point at one — basis recursion is
   REC-11's design and it is half of what the widened act had to reach. */
const QUESTION_SUB = "INQ-2026-0701";
const DOCS4  = ["INFO-2026-0401","INFO-2026-0402","INFO-2026-0403","INFO-2026-0404"];
const SEVERED_DOC = "INFO-2026-0405";
const CITED_DOC   = "INFO-2026-0406";     // already cited by CASE_1, and so un-retirable
const LOOSE_DOC   = "INFO-2026-0407";     // cited by nobody, so retire has something to run on

/* THE RECORD. `object_type` is the plane's own word for each row. */
const BUNDLES = {};
for(const id of [...DOCS4, SEVERED_DOC, CITED_DOC, LOOSE_DOC])
  BUNDLES[id] = { bundle_id:id, object_type:"information", title:`Ledger page ${id.slice(-4)}`,
                  current_state:"verified", last_updated:"2026-07-30" };
BUNDLES[DOCS4[3]].current_state = "verified";
BUNDLES[CASE_1] = { bundle_id:CASE_1, object_type:"project", title:"Sewer franchise diversion",
                    current_state:"forming", last_updated:"2026-07-31" };
BUNDLES[CASE_2] = { bundle_id:CASE_2, object_type:"project", title:"Marina construction spend",
                    current_state:"forming", last_updated:"2026-07-31" };
BUNDLES[QUESTION] = { bundle_id:QUESTION, object_type:"inquiry", title:"Did the sewer fund pay for the marina?",
                      current_state:"open", last_updated:"2026-07-31" };
BUNDLES[QUESTION_SUB] = { bundle_id:QUESTION_SUB, object_type:"inquiry",
                          title:"What did the transfer ordinance authorise?",
                          current_state:"open", last_updated:"2026-07-31" };

/* A PROJECT'S OWN references block — what `op=cite` edits, and the ONLY thing
   it edits. Seeded so the report outcome is genuinely per-item: one of the four
   is already cited, so a cite of all four writes three and retains one. */
const PROJECT_REFS = {
  [CASE_1]: [ { rel:"cites", target:DOCS4[1], status:"confirmed", note:"the budgeted transfers" },
              { rel:"cites", target:SEVERED_DOC, status:"severed",  note:"withdrawn 2026-07-28" },
              { rel:"cites", target:CITED_DOC, status:"confirmed", note:null } ],
  [CASE_2]: [],
};
/* THE QUESTION'S BASIS — REC-11's `inquiry_basis`, here as the projection a
   surface can see (op=projection's fm_json.basis), which IS the document's own
   `basis:` block: the two are the same bytes by D-21, so a mock holding one
   holds both.
   CORRECTED 2026-08-04 (REC-37), never exempted: the old comment read "NOTHING
   in this mock ever writes it, and the harness proves the cite flow does not
   reach it". That was the GAP, and it is closed — `op=cite` onto a question now
   appends a leg here, through the document, and the block below mirrors the
   store's own order for it. What the harness proves has changed with the plane:
   a cite into a CASE still reaches none of this (asserted, unchanged), and a
   cite onto a QUESTION reaches it only with a role the surface does not yet
   send. */
const INQUIRY_BASIS = {
  [QUESTION]: [ { target:DOCS4[0], role:"supports", grade:"B", grade_axis:"capture", grade_source:"resolution" } ],
};
const basisSnapshot = () => JSON.stringify(INQUIRY_BASIS);
/* The two roles the plane publishes as a vocabulary (affordances.mjs
   VOCABULARIES.basis_roles, imported there from the catalog that enforces them).
   Spelled here because this file IS the plane for the surface under test. */
const ROLES = ["supports", "cuts_against"];
/* What the record EARNS for a target, as op=earnedbasis would answer it. The
   act FILLS from this; there is no grade control anywhere. A target absent here
   earns nothing and its leg lands ungraded — undetermined and stated. */
/* UI-21 adds a SECOND earned target, so the flow driven through the SURFACE can
   land one graded leg and one ungraded one in the same act — which is the only
   way to assert that the receipt renders the plane's `gradesFilled` AND
   `gradesUndetermined` rather than one of them and a shrug. */
const EARNED = { [DOCS4[2]]: "A", [DOCS4[1]]: "B" };
/* REC-11's DAG guard, at the WRITE and not in the act: is `from` reachable from
   any of `targets` along stored legs? Mirrored so the refusal ORDER and the
   named path are the store's. */
function cyclePath(from, targets){
  const walk = (at, path, seen) => {
    for(const l of (INQUIRY_BASIS[at] || [])){
      if(!String(l.target).startsWith("INQ-")) continue;
      if(l.target === from) return [...path, from];
      if(seen.has(l.target)) continue;
      seen.add(l.target);
      const f = walk(l.target, [...path, l.target], seen);
      if(f) return f;
    }
    return null;
  };
  for(const t of targets){
    const f = walk(t, [from, t], new Set([t]));
    if(f) return f;
  }
  return null;
}

/* Selections: the plane's own lease. */
const SELECTIONS = {};
let SEL_SEQ = 0;

const REF = {
  NO_SUCH_SELECTION: "that selection is unknown to the record, or it has been released or has expired.",
  NO_SUCH_PROJECT:   "the citing object has to exist before it can point at anything.",
  /* CORRECTED 2026-08-04 (REC-37): the code is unchanged and the sentence is
     not — it fires now only for an object that is NEITHER a case nor a question,
     which is strictly less than it used to refuse. */
  NOT_A_PROJECT:     "citations live on the citing object, and this is neither a case nor a question. A case keeps them in its references; a question keeps them in the basis its answer rests on.",
  NOT_CITABLE:       "a question rests on material or on another question, and nothing else in the record can be a leg of its basis. These members of the set are neither.",
  NO_ROLE:           "a leg of a question's basis says what the material DOES for the answer, and this call does not say. A leg that cuts against the case is first-class here, so it is never assumed.",
  BAD_ROLE:          "that is not a role a basis leg can carry; the set is closed and the record publishes it beside the act.",
  ROLE_NOT_APPLICABLE:"a role says what material does for a QUESTION's answer, and the thing being cited into here is a case. A case's citation edge carries no role.",
  SELF_BASIS:        "a question cannot rest on itself: it is not evidence for its own answer.",
  BASIS_CYCLE:       "this would close a loop. What a question rests on is a one-way graph, and the chain named above already leans on this one.",
  BAD_NOTE:          "the record's frontmatter grammar has no escapes, and a note has a ceiling; what you wrote does not fit inside it.",
  NOT_INFORMATION:   "citing material means material. These members of the set are not, and the whole call is handed back rather than trimmed to the ones that are.",
  SEVERED_EDGE:      "these were cut loose on purpose once, with a reason, and that is a decision rather than an absence. Putting one back is its own act.",
  EMPTY_SELECTION:   "this set resolves to nobody, so there is nothing here to point at.",
  CITATION_TOO_LARGE:"every edge is written into the case's own document, and this many would push it past what a document may hold inline.",
  NO_REASON:         "this one only goes one way, so the record keeps WHY in the words of whoever did it.",
  BAD_REASON:        "a reason has a ceiling and cannot carry a quote, a backslash or a line break.",
  CITED:             "something is still leaning on these. Cut the edge with a reason first, then this will go through.",
  ILLEGAL_TRANSITION:"nobody has looked at this yet, and moving it out now would skip the step where somebody does.",
  NO_SUCH_BUNDLE:    "nothing by that name is visible to this credential.",
};
const refuse = (reason, extra) => { SAID.push(REF[reason]); return { ok:false, reason, detail:REF[reason], ...(extra||{}) }; };

function md(b){
  const fm = [`---`, `object_type: ${b.object_type}`, `current_state: ${b.current_state}`,
              `title: ${b.title}`, `---`].join("\n");
  return b.object_type === "inquiry"
    ? `${fm}\n## Question\n\nDid it?\n\n## What Would Falsify This\n\nA ledger export.\n`
    : `${fm}\nOne page of the record.\n\n## Summary\n\nOne line.\n`;
}

/* THE PUBLISHED ACTS FOR ONE OBJECT, derived here the way affordances.mjs
   derives them — from the object's TYPE and its citation edges — so the
   surface's control set follows the plane's rules and not a fixture. */
function actsForTarget(id){
  const b = BUNDLES[id];
  if(!b) return null;
  const acts = [];
  if(b.object_type === "information"){
    const into = citesInto(id);
    acts.push(PUBLISHED.cite);
    if(b.current_state === "collected") acts.push(PUBLISHED.release);
    if(b.current_state === "verified" && into.confirmed.length === 0) acts.push(PUBLISHED.retire);
    if(into.confirmed.length) acts.push(PUBLISHED.sever);
    if(into.severed.length)   acts.push(PUBLISHED.reinstate);
    acts.push(PUBLISHED.attest);
  } else if(b.object_type === "project"){
    acts.push(PUBLISHED.cite);
  } else if(b.object_type === "inquiry"){
    /* CORRECTED 2026-08-04 (REC-37): a question publishes `cite` now — it is the
       act by which a record becomes a case, and affordances.mjs derives it from
       the object's TYPE alone, exactly as it does for a case. */
    acts.push(PUBLISHED.cite);
    acts.push(PUBLISHED.conclude);
  }
  return acts;
}
function citesInto(id){
  const out = { confirmed:[], severed:[] };
  for(const [proj, refs] of Object.entries(PROJECT_REFS))
    for(const r of refs)
      if(r.rel === "cites" && r.target === id) out[r.status === "severed" ? "severed" : "confirmed"].push(proj);
  return out;
}

let TOO_LARGE = false;                  // arm for CITATION_TOO_LARGE, driven below
let AS_READER = false;                  // Q12

function mockFetch(u, opts){
  const url = new URL(u, "https://plane.test");
  const op = url.searchParams.get("op");
  const p = Object.fromEntries(url.searchParams.entries());
  let body = null; try{ body = opts && opts.body ? JSON.parse(opts.body) : null; }catch(_){}
  CALLS.push({ op, params:p, body });
  const R = o => ({ ok:true, json:async()=>o });
  const W = r => R({ ok:true, result:r });        // the envelope the plane really sends (D-173)

  if(op === "list") return W(Object.values(BUNDLES));
  if(op === "image"){
    const b = BUNDLES[p.id]; if(!b) return W(null);
    return W({ "bundle.md": md(b) });
  }
  if(op === "projection"){
    const b = BUNDLES[p.id]; if(!b) return W(null);
    const fm = {};
    if(PROJECT_REFS[p.id]) fm.references = PROJECT_REFS[p.id];
    if(INQUIRY_BASIS[p.id]) fm.basis = INQUIRY_BASIS[p.id];
    return W({ ...b, fm_json: JSON.stringify(fm) });
  }
  if(op === "affordances"){
    if(!p.target)
      return W({ target:null, catalog:Object.values(PUBLISHED),
                 vocabularies:{ dispositions:["deferred","dismissed"], basis_roles:ROLES.slice() } });
    const acts = actsForTarget(p.target);
    if(!acts) return W(refuse("NO_SUCH_BUNDLE", { target:p.target }));
    return W({ target:p.target, object_type:BUNDLES[p.target].object_type,
               current_state:BUNDLES[p.target].current_state, acts,
               vocabularies:{ dispositions:["deferred","dismissed"], basis_roles:ROLES.slice() } });
  }
  if(op === "backlinks"){
    const out = [];
    for(const [proj, refs] of Object.entries(PROJECT_REFS))
      for(const r of refs)
        if(r.target === p.target)
          out.push({ from:proj, from_type:"project", from_title:BUNDLES[proj].title,
                     from_state:BUNDLES[proj].current_state, rel:r.rel, status:r.status, note:r.note });
    return W({ ok:true, target:p.target, backlinks:out });
  }
  if(op === "select"){
    /* CORRECTED 2026-08-05 (UI-23), never exempted. This answered `R({ok:true,
       handle, …})` — UNWRAPPED — and so agreed with the defect in `doCite`,
       which read `s.handle` straight off the answer. `op=select` has no
       dedicated handler in index.mjs, so it comes back through the generic
       passthrough as `{ok:true, result:{handle,…}, store, tokenClass}`: against
       the real plane the handle was `undefined` and `op=cite` was sent no
       selection at all, while these 131 assertions stayed green. The mock now
       answers the wire shape, which is what makes the corrected `recPostR` read
       provable — and what makes re-introducing the old read FAIL here. */
    const ids = Array.isArray(body && body.ids) ? body.ids : [];
    const handle = `SEL-${++SEL_SEQ}`;
    SELECTIONS[handle] = { handle, ids: ids.slice() };
    return W({ handle, kind:"enumerated", n:ids.length });
  }
  if(op === "cite"){
    /* THE STORE'S OWN ORDER (store.mjs cite()), mirrored exactly — REC-37's
       widened order included, arm by arm and in the same sequence. */
    const sel = SELECTIONS[p.handle];
    if(!sel) return W(refuse("NO_SUCH_SELECTION"));
    const proj = BUNDLES[p.project];
    if(!proj) return W(refuse("NO_SUCH_PROJECT", { project:p.project }));
    const onto = proj.object_type === "inquiry";
    if(proj.object_type !== "project" && !onto)
      return W(refuse("NOT_A_PROJECT", { project:p.project, got:proj.object_type }));
    const note = String(p.note ?? "");
    if(note.length > 200 || /["\\\r\n]/.test(note)) return W(refuse("BAD_NOTE"));
    /* THE ROLE, judged before the members: a member who has not said what the
       material DOES is told that first. Required on the question arm, refused
       rather than dropped on the case arm. */
    const role = p.role == null || p.role === "" ? null : String(p.role);
    if(onto){
      if(role === null)
        return W(refuse("NO_ROLE", { project:p.project, handle:p.handle, roles:ROLES.slice() }));
      if(!ROLES.includes(role))
        return W(refuse("BAD_ROLE", { project:p.project, handle:p.handle, got:role, roles:ROLES.slice() }));
    } else if(role !== null){
      return W(refuse("ROLE_NOT_APPLICABLE", { project:p.project, handle:p.handle, got:role }));
    }
    const offenders = sel.ids.filter(id => !BUNDLES[id] || (onto
      ? !["information","inquiry"].includes(BUNDLES[id].object_type)
      : BUNDLES[id].object_type !== "information"));
    if(offenders.length)
      return W(refuse(onto ? "NOT_CITABLE" : "NOT_INFORMATION",
        { project:p.project, handle:p.handle, offenders:offenders.slice().sort() }));
    if(onto){
      /* THE QUESTION ARM. ALREADY means "already carries a LEG", and the leg
         lands THROUGH THE DOCUMENT — INQUIRY_BASIS here IS the document's own
         `basis:` block, which is what makes the projection a projection. */
      const legs = INQUIRY_BASIS[p.project] || (INQUIRY_BASIS[p.project] = []);
      const legged = new Set(legs.map(l => l.target));
      const already = sel.ids.filter(id => legged.has(id));
      const add = sel.ids.filter(id => !legged.has(id));
      if(!sel.ids.length) return W(refuse("EMPTY_SELECTION", { project:p.project, handle:p.handle }));
      if(!add.length)
        return W({ ok:true, project:p.project, handle:p.handle, weight:"report", moved:false,
                   cited:[], alreadyCited:already.slice().sort(), severed:[], citingObjectType:"inquiry",
                   role, bundleSha:"a".repeat(64),
                   detail:"every member of the selection was already a leg; nothing was written" });
      /* THE DAG GUARD IS AT THE WRITE (promote), which is what this act reaches
         rather than fronting — REC-11's, naming the FULL path. */
      if(add.includes(p.project))
        return W(refuse("SELF_BASIS", { project:p.project, path:[p.project, p.project] }));
      const cyc = cyclePath(p.project, add.filter(id => BUNDLES[id].object_type === "inquiry"));
      if(cyc) return W(refuse("BASIS_CYCLE", { project:p.project, path:cyc }));
      const made = add.map(target => ({ target, role,
        ...(EARNED[target] ? { grade:EARNED[target], grade_axis:"connection", grade_source:"resolution" } : {}),
        note }));
      for(const l of made) legs.push(l);
      return W({ ok:true, project:p.project, handle:p.handle, weight:"report", moved:false,
                 cited:add.slice().sort(), alreadyCited:already.slice().sort(), severed:[],
                 citingObjectType:"inquiry", role,
                 legs: made.map(l => ({ target:l.target, role:l.role, grade:l.grade ?? null,
                                        grade_axis:l.grade_axis ?? null, grade_source:l.grade_source ?? null })),
                 gradesFilled: made.filter(l => l.grade).length,
                 gradesUndetermined: made.filter(l => !l.grade).length,
                 bundleSha:"e".repeat(64), rowVersion:8 });
    }
    const refs = PROJECT_REFS[p.project];
    const byTarget = new Map(refs.filter(r=>r.rel==="cites").map(r=>[r.target, r.status]));
    const severed = sel.ids.filter(id => byTarget.get(id) === "severed");
    if(severed.length)
      return W(refuse("SEVERED_EDGE", { project:p.project, handle:p.handle, offenders:severed.slice().sort() }));
    if(!sel.ids.length) return W(refuse("EMPTY_SELECTION", { project:p.project, handle:p.handle }));
    const already = sel.ids.filter(id => byTarget.has(id));
    const add     = sel.ids.filter(id => !byTarget.has(id));
    if(!add.length)
      return W({ ok:true, project:p.project, handle:p.handle, weight:"report", moved:false,
                 cited:[], alreadyCited:already.slice().sort(), severed:[], bundleSha:"a".repeat(64),
                 detail:"every member of the selection was already cited; nothing was written" });
    if(TOO_LARGE)
      return W(refuse("CITATION_TOO_LARGE", { project:p.project, handle:p.handle,
                 requested:add.length, bytes:1070846, limit:1048576, roomFor:12556 }));
    for(const t of add) refs.push({ rel:"cites", target:t, status:"confirmed", note });
    return W({ ok:true, project:p.project, handle:p.handle, weight:"report",
               moved:true, drift:{ revised:[{ bundleId:add[0], was:"b".repeat(64), now:"c".repeat(64) }],
                                   purged:[], hidden:[], added:0, removed:0, kind:"enumerated" },
               cited:add.slice().sort(), alreadyCited:already.slice().sort(), severed:[],
               bundleSha:"d".repeat(64), rowVersion:7 });
  }
  if(op === "retire"){
    /* store.mjs retire(): THE REASON IS JUDGED FIRST, before the selection. */
    const why = String(p.reason ?? "").trim();
    if(!why) return W(refuse("NO_REASON"));
    if(why.length > 160 || /["\\\r\n]/.test(why)) return W(refuse("BAD_REASON"));
    const sel = SELECTIONS[p.handle];
    if(!sel) return W(refuse("NO_SUCH_SELECTION"));
    if(!sel.ids.length) return W(refuse("EMPTY_SELECTION", { handle:p.handle }));
    const notInfo = sel.ids.filter(id=>!BUNDLES[id] || BUNDLES[id].object_type !== "information");
    if(notInfo.length) return W(refuse("NOT_INFORMATION", { offenders:notInfo.slice().sort() }));
    const illegal = sel.ids.filter(id=>BUNDLES[id].current_state !== "verified")
                           .map(id=>({ id, from:BUNDLES[id].current_state }));
    if(illegal.length) return W(refuse("ILLEGAL_TRANSITION", { to:"retired", offenders:illegal }));
    const cited = sel.ids.map(id=>({ id, citedBy:citesInto(id).confirmed })).filter(x=>x.citedBy.length);
    if(cited.length) return W(refuse("CITED", { offenders:cited }));
    for(const id of sel.ids) BUNDLES[id].current_state = "retired";
    return W({ ok:true, reason:why, handle:p.handle, retired:sel.ids.slice().sort(), weight:"refuse" });
  }
  if(op === "sever" || op === "reinstate"){
    /* store.mjs #edgeTransition(): SELECTION FIRST, then project, THEN reason —
       the order that makes a withheld-field probe impossible here. */
    const sel = SELECTIONS[p.handle];
    if(!sel) return W(refuse("NO_SUCH_SELECTION"));
    const proj = BUNDLES[p.project];
    if(!proj) return W(refuse("NO_SUCH_PROJECT", { project:p.project }));
    if(proj.object_type !== "project") return W(refuse("NOT_A_PROJECT", { project:p.project, got:proj.object_type }));
    const why = String(p.reason ?? "").trim();
    if(!why) return W(refuse("NO_REASON"));
    if(why.length > 160 || /["\\\r\n]/.test(why)) return W(refuse("BAD_REASON"));
    if(!sel.ids.length) return W(refuse("EMPTY_SELECTION", { project:p.project, handle:p.handle }));
    const from = op === "sever" ? "confirmed" : "severed";
    const to   = op === "sever" ? "severed"   : "confirmed";
    const refs = PROJECT_REFS[p.project] || [];
    const moved = [];
    for(const r of refs)
      if(r.rel === "cites" && sel.ids.includes(r.target) && r.status === from){ r.status = to; moved.push(r.target); }
    return W({ ok:true, project:p.project, handle:p.handle, reason:why, weight:"refuse",
               [op === "sever" ? "severed" : "reinstated"]: moved.slice().sort() });
  }
  if(op === "whoami") return W({ member:"m_alice", session:true, capabilities:["contribute"] });
  return W({});
}

/* ---- a DOM stub good enough for innerHTML inspection ---- */
const els = new Map();
function el(){ const e={ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", _html:"", textContent:"", scrollTop:0, disabled:false, offsetHeight:100, addEventListener(){},
  querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(p,h){ e._html += h; }, focus(){}, click(){},
  remove(){}, closest:()=>null, onclick:null };
  Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}}); return e; }

const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
  document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}}, getElementById:()=>el(),
    hidden:false, createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch:async(u,opts)=>mockFetch(u,opts) };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() +
  ";globalThis.__PLANE=PLANE;globalThis.__openBundle=openBundle;globalThis.__openInquiry=openInquiry;" +
  "globalThis.__actsFor=actsFor;globalThis.__actGo=actGo;globalThis.__ACTS=()=>ACTS_HERE;" +
  "globalThis.__openCite=openCite;globalThis.__citeOverSelection=citeOverSelection;" +
  "globalThis.__citeChoose=citeChoose;globalThis.__citeRole=citeRole;globalThis.__citeNote=citeNote;globalThis.__doCite=doCite;" +
  "globalThis.__CITE=()=>CITE;globalThis.__openRetire=openRetire;globalThis.__retireReason=retireReason;" +
  "globalThis.__doRetire=doRetire;globalThis.__RETIRE=()=>RETIRE;globalThis.__openEdgeAct=openEdgeAct;" +
  "globalThis.__edgeChoose=edgeChoose;globalThis.__edgeReason=edgeReason;globalThis.__doEdgeAct=doEdgeAct;" +
  "globalThis.__EDGE=()=>EDGE;globalThis.__loadActSource=loadActSource;" +
  "globalThis.__reset=()=>{RECORD_CACHE=null;PROJ_CACHE.clear();IMG_CACHE.clear();};", ctx);

ctx.__PLANE.session = true;
ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };

const page = () => els.get("#content")._html;
const dlg  = () => els.get("#dlg")._html;
async function openDoc(id){ ctx.__reset(); await ctx.__openBundle(id, true); return page(); }
async function openQ(id){ ctx.__reset(); await ctx.__openInquiry(id, true); return page(); }
const citeAct = () => ({ ...PUBLISHED.cite });
/* Every refusal SENTENCE this surface painted, collected as it was painted. */
const RENDERED = [];
function snap(h){ for(const m of String(h).matchAll(/class="intent-ref-why">([^<]*)</g)) RENDERED.push(m[1]); return h; }
/* AN ID IS "NAMED" ONLY IF IT IS NAMED IN THE REFUSAL, and this instrument
   exists because the loose version was not one. Asserting `dialog.includes(id)`
   stayed green under negative-control arm (b) with the whole named-ids block
   deleted, because the very same ids also sit in the dialog's subject line and
   in its list of citing objects — an equality that costs nothing. So the check
   is scoped to the block the plane's own `offenders` / `path` fields render
   into. */
function namedIn(h, id, key){
  const i = String(h).indexOf(key || "Named by the record");
  return i !== -1 && String(h).slice(i, i + 700).includes(id);
}

/* ============ (0) STRUCTURAL: NO REFUSAL OF THIS SURFACE'S OWN ============ */
/* SCOPED TO THIS ITEM'S REGION, and the scope is stated rather than quietly
   chosen. CORRECTED 2026-08-05 (UI-22), never exempted: this note used to say
   that `disposePreflight` still computed and worded its own NO_REASON /
   BAD_REASON / ILLEGAL_TRANSITION elsewhere in the file, reported here rather
   than asserted away. UI-22 closed it — the function is deleted and the flow
   asks the plane with the handle withheld (act-dispose.test.mjs carries the
   proof) — so the exception is gone and the scoping is now about REGION
   OWNERSHIP alone. Everything between the two region markers below is this
   item's, and it names no refusal of its own. */
const REGION = APP.slice(APP.indexOf("/*__CITE_ACT_START__*/"), APP.indexOf("/*__CITE_ACT_END__*/"));
ok("the cite region exists and is marked", REGION.length > 2000);
/* Every reason code the four acts refuse with belongs to the plane. The ONLY
   codes this file may name are the one it withholds a field to provoke
   (NO_SUCH_SELECTION) and the two that are not about the record at all
   (PREFLIGHT_NOT_REFUSED, NO_ANSWER — the surface saying its own probe or its
   own transport misbehaved and that nothing was committed). */
/* REC-37, 2026-08-04: the six refusals the widened act adds join the list. The
   rule is unchanged — this surface may name none of them — and the list grows
   with the op's contract so a new refusal cannot arrive unguarded. */
for(const code of ["NOT_A_PROJECT","NOT_INFORMATION","SEVERED_EDGE","CITATION_TOO_LARGE",
                   "UNSPLICEABLE_REFERENCES","EMPTY_SELECTION","BAD_NOTE","NO_REASON","BAD_REASON",
                   "CITED","ILLEGAL_TRANSITION","NO_SUCH_PROJECT",
                   "NOT_CITABLE","NO_ROLE","BAD_ROLE","ROLE_NOT_APPLICABLE","SELF_BASIS","BASIS_CYCLE"])
  ok(`the cite region names no ${code} refusal of its own`,
     !new RegExp(`reason:\\s*"${code}"`).test(REGION));
ok("the ONE reason code the cite region knows is the field retire withholds, and it is a read not a render",
   REGION.includes('a.refusal.reason === "NO_SUCH_SELECTION"'));
/* SCOPED to the four acts this item gives call sites to. `Co-attest this
   capture` IS spelled in app.html — it is UI-6's own dialog heading, written
   before op=affordances existed and driven by a surface-side bar rather than by
   a published act. UPDATED 2026-08-05 (UI-22), and the update is a MEASUREMENT
   rather than a deferral: `attest` is a NON_ACT in affordances.mjs, deliberately
   ("capture-directed: co-attestation of a capture's existence in time"), so the
   plane publishes NO label, NO `needs` and NO `rung` for it on any object and
   there is nothing here to read. UI-22 rewired that bar's AVAILABILITY onto the
   record's own facts and left the label as the ONE standing residue, raised as
   a DELEGATION to RECORD rather than papered over. The four acts below, which
   the plane does publish, carry no label of their own anywhere in the file. */
for(const a of [PUBLISHED.cite, PUBLISHED.sever, PUBLISHED.reinstate])
  ok(`the published label "${a.label}" is nowhere in app.html`, !APP.includes(a.label));
ok("and no label of this surface's own is rendered for a published act",
   !/>Retire&hellip;</.test(REGION) && !/dz-verb">Cite/.test(REGION));
ok("the note field copies no length rule from the plane",
   !/id="cx-note"[^>]*maxlength/i.test(REGION));
ok("the note field offers no placeholder, no template and no suggested wording",
   !/id="cx-note"[^>]*placeholder/i.test(REGION) && /id="cx-note"[^>]*><\/textarea>/.test(REGION));
ok("the reason fields offer no drafted text either",
   /id="cx-reason"[^>]*><\/textarea>/.test(REGION) && /id="cx-edge-reason"[^>]*><\/textarea>/.test(REGION));
ok("no rung word is written down for an act the record leaves unassigned",
   !/"reversible"/.test(REGION));

/* ============ (1) THE DOCUMENT PAGE'S ACT STRIP IS THE PLANE'S ============ */
const d1 = await openDoc(DOCS4[0]);
ok("op=affordances was asked for the document's own acts",
   CALLS.some(c=>c.op==="affordances" && c.params.target===DOCS4[0]));
ok("the document page names what can be done here", /What can be done here/.test(d1));
ok("the strip renders the producer's own label for cite", d1.includes(PUBLISHED.cite.label));
ok("the strip renders the producer's own label for retire", d1.includes(PUBLISHED.retire.label));
ok("an act the page carries in a section of its own is named as carried there, not as absent",
   !/<b>Co-attest this capture<\/b>[^<]*<\/p>\s*$/.test(d1));
ok("the strip adds no act the plane did not publish",
   (d1.match(/actGo\(/g)||[]).length === (actsForTarget(DOCS4[0]).filter(a=>["cite","retire","sever","reinstate"].includes(a.id)).length));
/* THE BEHAVIOURAL HALF: move the plane's own label to something nobody would
   write down and watch the surface repeat it. A surface-side map cannot pass. */
PUBLISHED.cite.label = "Point a case at this page";
const d1b = await openDoc(DOCS4[0]);
ok("the surface repeats a label it has never seen, because it reads it",
   d1b.includes("Point a case at this page"));
ok("and the old label is gone — nothing here remembers a name of its own",
   !d1b.includes(">Cite information in a project&hellip;<"));
PUBLISHED.cite.label = "Cite information in a project";

/* a document with a live citation publishes sever, and no retire */
const d2 = await openDoc(CITED_DOC);
ok("a cited document publishes sever", d2.includes(PUBLISHED.sever.label));
ok("a cited document does not publish retire, and the strip invents no control for it",
   !d2.includes(">Retire&hellip;<"));
/* a document with a severed edge publishes reinstate */
const d3 = await openDoc(SEVERED_DOC);
ok("a document with a severed edge publishes reinstate", d3.includes(PUBLISHED.reinstate.label));

/* ============ (2) Q12: A READ-ONLY CREDENTIAL SEES NO CONTROL AT ALL ============ */
ctx.__PLANE.me = { member:"m_vera", session:true, administer:false, capabilities:["view"] };
const ro = await openDoc(DOCS4[0]);
const roStrip = ro.slice(ro.indexOf("What can be done here"));
ok("a read-only credential is offered NO act control in the strip", !/<button/.test(roStrip));
ok("no control in the strip is greyed instead of omitted", !/disabled/.test(roStrip));
ok("the acts the record publishes are still NAMED to a reader",
   roStrip.includes(PUBLISHED.cite.label) && roStrip.includes(PUBLISHED.retire.label));
ok("one credential sentence, not a narration per control",
   (ro.match(/This credential can read this/g)||[]).length === 1);
ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };

/* ============ (3) THE CITE FLOW OVER A FOUR-DOCUMENT SELECTION ============ */
const basisBefore = basisSnapshot();
const qBefore = await openQ(QUESTION);
ok("the question page shows the one basis leg the record holds before any cite",
   qBefore.includes(DOCS4[0]));

ctx.__reset();
const selBefore = SEL_SEQ;
await ctx.__citeOverSelection("SEL-FINDER", DOCS4, citeAct(), null);
SELECTIONS["SEL-FINDER"] = { handle:"SEL-FINDER", ids: DOCS4.slice() };
let c1 = dlg();
ok("the cite dialog offers the record's own cases as citing objects",
   c1.includes(CASE_1) && c1.includes(CASE_2));
const offered = [...c1.matchAll(/citeChoose\(&quot;([^&]+)&quot;\)/g)].map(m=>m[1]);
/* ============ CORRECTED 2026-08-05 BY UI-21, NEVER EXEMPTED ============
   THE MEASURED GAP THIS BLOCK PINNED IS CLOSED, so the assertion is inverted
   and the history is kept, because the sequence is the useful part.

   It read: *"MEASURED GAP (UI): a question is still not OFFERED as a citing
   object, because the candidate list filters to cases"* — with `every citing
   object offered is one the record reports as a case` above it. Both were TRUE
   and both were correct to assert. UI-20 wrote them when the plane refused a
   question outright (NOT_A_PROJECT), so offering one would have been the
   surface proposing an act the record would decline. REC-37 then widened the
   plane and landed with `app.html` BYTE-UNTOUCHED — its own acceptance clause —
   which left the candidate list one step behind the record it fronts, and this
   file recorded that as a fact rather than papering it.

   UI-21 closes it: `citeCandidates()` admits both CITING types, through
   `normalizeType` so a legacy `focus` row lands on the question arm exactly as
   the store's own widening does. What is asserted now is the same property from
   the other side — every offered object is one the record reports as a citing
   KIND, a question among them, and no DOCUMENT is ever offered as one, which is
   the clause that was always doing the real work and is unchanged. */
ok("every citing object offered is one the record reports as a case or a question",
   offered.length > 0 && offered.every(id => BUNDLES[id]
     && ["project","inquiry","focus","problem"].includes(BUNDLES[id].object_type)));
ok("a question IS offered as a citing object now that the record accepts one",
   offered.includes(QUESTION));
ok("no document is offered as a citing object", !offered.some(id=>DOCS4.includes(id)));
ok("each candidate says which KIND it is, so the arms are not met only as a refusal",
   /Inquiry|Question|Finding|Case/.test(c1) && /Project|Case/.test(c1));
ok("the report weight is stated from the act's own published word", /at <b>report<\/b> weight/.test(c1));
ok("the report weight's semantics are stated exactly: per item, and never a quiet narrowing",
   /per item/.test(c1) && /never quietly narrows/.test(c1));
ok("the record's rung absence is rendered as an absence, not as the lightest rung",
   /declares no weight for this act yet/.test(c1) && !/reversible<\/b>/.test(c1));
ok("THE COMMIT IS ABSENT until a case is chosen — not present and greyed",
   !/id="cx-cite"/.test(c1));
ok("and nothing stands in its place claiming the record refused anything",
   !/intent-ref-why/.test(c1));
ok("the surface reached the plane with no cite while nothing was chosen",
   !CALLS.some(c=>c.op==="cite"));

ctx.__citeChoose(CASE_1);
c1 = dlg();
ok("choosing a case brings the commit into being", /id="cx-cite"/.test(c1));

await ctx.__doCite();
const rec1 = dlg();
ok("the plane was asked to cite, with the finder's own handle and no second lease",
   CALLS.some(c=>c.op==="cite" && c.params.handle==="SEL-FINDER" && c.params.project===CASE_1)
   && SEL_SEQ === selBefore);
ok("THE REPORT OUTCOME IS PER ITEM: the record cited 3 and retained 1",
   /cited <b>3<\/b>/.test(rec1) && /retained <b>1<\/b>/.test(rec1));
for(const id of [DOCS4[0], DOCS4[2], DOCS4[3]])
  ok(`the receipt names ${id} among the ones cited now`, rec1.includes(id));
ok("the one already cited is named as retained, not as written", rec1.includes(DOCS4[1]));
ok("the receipt reports the drift the record reported, because report weight ran anyway",
   /The set moved/.test(rec1) && rec1.includes("Revised since you picked them"));
ok("the receipt uses the record's own weight word", /at <b>report<\/b> weight/.test(rec1));
ok("the four documents now carry confirmed edges on the case",
   DOCS4.every(id=>PROJECT_REFS[CASE_1].some(r=>r.target===id && r.status==="confirmed")));

/* NEGATIVE CONTROL (a), asserted positively: THE TWO TARGETS ARE NOT CONFLATED. */
ok("NOTHING landed on the question's basis: inquiry_basis is byte-identical after a cite into a case",
   basisSnapshot() === basisBefore);
ok("the flow never reaches the plane with a cite onto a question unless it was driven there",
   !CALLS.some(c=>c.op==="cite" && c.params.project===QUESTION));
ok("and no promote — the only op that writes a basis leg — was called at all",
   !CALLS.some(c=>c.op==="promote"));
const qAfter = await openQ(QUESTION);
ok("the question page shows exactly the legs it showed before; a cite into a case grows none",
   (qAfter.match(/INFO-2026-04\d\d/g)||[]).join(",") === (qBefore.match(/INFO-2026-04\d\d/g)||[]).join(","));

/* the case's own page now shows what it cites — the surface a cite is FOR */
const caseAfter = await openDoc(CASE_1);
ok("the case's page now carries the new citation edges", DOCS4.every(id=>caseAfter.includes(id)));

/* ============ (4) THE NOTE: OPTIONAL, AND BOUNDED BY THE PLANE ============ */
ctx.__reset();
SELECTIONS["SEL-NOTE"] = { handle:"SEL-NOTE", ids:[DOCS4[0]] };
await ctx.__citeOverSelection("SEL-NOTE", [DOCS4[0]], citeAct(), null);
ctx.__citeChoose(CASE_2);
await ctx.__doCite();
ok("THE NOTE IS OPTIONAL: a cite with no note at all succeeds",
   /cited <b>1<\/b>/.test(dlg()));
ok("and the record received an empty note rather than one this page composed",
   CALLS.filter(c=>c.op==="cite").pop().params.note === "");

ctx.__reset();
SELECTIONS["SEL-NOTE2"] = { handle:"SEL-NOTE2", ids:[DOCS4[1]] };
await ctx.__citeOverSelection("SEL-NOTE2", [DOCS4[1]], citeAct(), null);
ctx.__citeChoose(CASE_2);
ctx.__citeNote("x".repeat(201));
ok("an over-long note is not refused by this page: the commit is still there to press",
   /id="cx-cite"/.test(dlg()));
await ctx.__doCite();
snap(dlg());
ok("THE NOTE IS BOUNDED BY THE PLANE, in the plane's words", dlg().includes(REF.BAD_NOTE));
ok("and the plane's own reason code travels with it", /BAD_NOTE/.test(dlg()));

/* ============ (5) THE SEVERED EDGE, REFUSED AND NAMED ============ */
ctx.__reset();
SELECTIONS["SEL-SEV"] = { handle:"SEL-SEV", ids:[DOCS4[0], SEVERED_DOC] };
await ctx.__citeOverSelection("SEL-SEV", [DOCS4[0], SEVERED_DOC], citeAct(), null);
ctx.__citeChoose(CASE_1);
await ctx.__doCite();
const sev = snap(dlg());
ok("a severed edge is refused in the record's own words", sev.includes(REF.SEVERED_EDGE));
ok("the severed-edge refusal names the edge the plane named", namedIn(sev, SEVERED_DOC));
ok("and the whole call was refused: the good member was not quietly cited",
   !PROJECT_REFS[CASE_1].some(r=>r.target===SEVERED_DOC && r.status==="confirmed"));
ok("the commit is still offered after a refusal — the record refused, this page did not",
   /id="cx-cite"/.test(sev));

/* ============ (6) THE CYCLE-CLOSING CITE, AND THE PATH THE PLANE NAMED ============
   `cite()` has no cycle rule of its own; the one cycle a cite can close is a
   case citing ITSELF, and the store catches it inside NOT_INFORMATION on
   purpose. So this drives the real thing and asserts the surface renders the
   plane's answer with every id it handed back. There is no surface pre-flight
   here BY DESIGN, and that is asserted rather than assumed. */
ctx.__reset();
SELECTIONS["SEL-CYC"] = { handle:"SEL-CYC", ids:[DOCS4[0], CASE_1] };
await ctx.__citeOverSelection("SEL-CYC", [DOCS4[0], CASE_1], citeAct(), null);
ctx.__citeChoose(CASE_1);
await ctx.__doCite();
const cyc = snap(dlg());
ok("a cite that would close a cycle DOES reach the plane — there is no surface rule in front of it",
   CALLS.some(c=>c.op==="cite" && c.params.handle==="SEL-CYC"));
ok("and the plane refuses it, in the plane's own words", cyc.includes(REF.NOT_INFORMATION));
ok("the cycle-closing cite names the offending id the plane handed back", namedIn(cyc, CASE_1));
ok("the case did not cite itself", !PROJECT_REFS[CASE_1].some(r=>r.target===CASE_1));

/* an INQ- member is refused by the plane for the same reason, and named */
ctx.__reset();
SELECTIONS["SEL-INQ"] = { handle:"SEL-INQ", ids:[DOCS4[0], QUESTION] };
await ctx.__citeOverSelection("SEL-INQ", [DOCS4[0], QUESTION], citeAct(), null);
ctx.__citeChoose(CASE_1);
await ctx.__doCite();
snap(dlg());
ok("an INQ- member in the selection is named by id", namedIn(dlg(), QUESTION));
ok("the INQ- member refusal is the plane's sentence, not this page's", dlg().includes(REF.NOT_INFORMATION));

/* CITING ONTO A QUESTION — CORRECTED TWICE, never exempted, and the two
   corrections are the whole history of this edge.

   UI-20 wrote it as *"citing onto a question is refused BY THE PLANE"* with
   NOT_A_PROJECT: the record-becomes-a-case edge did not exist.
   REC-37 (2026-08-04) built the plane half and this block became *"the surface
   reaches the plane and is refused NO_ROLE, because the flow sends no role —
   there is no role control on it"*: TRUE, and the second of the two measured UI
   gaps REC-37 deliberately left.
   UI-21 (2026-08-05) closes it. There is a role control now, its options come
   from the plane's published `vocabularies.basis_roles`, and the COMMIT IS
   ABSENT until a role is chosen — an absent control, not a computed NO_ROLE.
   So the assertion inverts: the flow no longer meets that refusal, because it
   no longer sends an incomplete act. NO_ROLE is still the record's to give and
   still renders in the record's own words if the record ever gives it; what
   changed is that this surface stopped walking into it. */
ctx.__reset();
/* Taken BEFORE the dialog opens, so "nothing was sent" below is a real
   measurement over this block and not an equality that costs nothing: the
   suite's CALLS log accumulates across every arm in this file. */
const citesAtOpen = CALLS.filter(c=>c.op==="cite").length;
/* One target the record EARNS a grade for and one it does not, in one act, so
   the receipt has to report both halves of the plane's own count. */
const ONQ_IDS = [DOCS4[1], LOOSE_DOC];
SELECTIONS["SEL-ONQ"] = { handle:"SEL-ONQ", ids:ONQ_IDS.slice() };
await ctx.__citeOverSelection("SEL-ONQ", ONQ_IDS, citeAct(), null);
ctx.__citeChoose(QUESTION);
const onq = snap(dlg());
ok("choosing a question raises the ROLE control, and the case arm never had one",
   /name="cx-role"/.test(onq));
ok("the role options are the PLANE's published vocabulary, not a list written here",
   ROLES.every(r => onq.includes(`citeRole(&quot;${r}&quot;)`)));
ok("THE COMMIT IS ABSENT until the role is stated — absent, not present and greyed",
   !/id="cx-cite"/.test(onq) && !/disabled/.test(onq));
ok("NO GRADE CONTROL IS OFFERED ANYWHERE ON THIS PATH",
   !/name="cx-grade"/.test(onq) && !/citeGrade\(/.test(onq));
ok("and the page says the record FILLS the grade rather than asking for one",
   /fills each leg/i.test(onq));
ok("nothing has been sent while the act does not have what it needs",
   CALLS.filter(c=>c.op==="cite").length === citesAtOpen);
ctx.__citeRole("supports");
const onq2 = snap(dlg());
ok("with the role stated the commit appears", /id="cx-cite"/.test(onq2));
await ctx.__doCite();
const onq3 = snap(dlg());
ok("the flow REACHES the plane with a cite onto a question, carrying the role",
   CALLS.some(c=>c.op==="cite" && c.params.project===QUESTION && c.params.role==="supports"));
ok("and it is NOT refused NO_ROLE any more — the gap UI-20 measured and REC-37 left is closed",
   !onq3.includes(REF.NO_ROLE) && !/NO_ROLE/.test(onq3));
ok("the legs landed on the question's own basis, through the document",
   ONQ_IDS.every(id => (INQUIRY_BASIS[QUESTION]||[]).some(l => l.target === id)));
ok("the receipt states the grade the RECORD earned, per leg, and never a letter this page chose",
   /What each leg carries/.test(onq3) && /Grade B/.test(onq3));
ok("an unearned leg is shown as UNDETERMINED and not-yet-load-bearing, never as a weak grade",
   /No grade/.test(onq3) && /not yet load-bearing/.test(onq3));
ok("the filled and undetermined counts are the PLANE's, rendered as they arrived",
   /Legs the record graded/.test(onq3) && /Legs left undetermined/.test(onq3));
ok("and there is still no grade control on the receipt either",
   !/citeGrade\(/.test(onq3) && !/name="cx-grade"/.test(onq3));

/* THE CASE ARM STILL HAS NO ROLE CONTROL, and that is not cosmetic: the store
   refuses a role on a case BY NAME (ROLE_NOT_APPLICABLE) rather than dropping
   it, so a surface that offered one there would be inviting a refusal it could
   have avoided — and a field authored in one place and honoured nowhere is the
   D-21 class in miniature. */
ctx.__reset();
const citesBeforeCase = CALLS.filter(c=>c.op==="cite").length;
SELECTIONS["SEL-NOROLE"] = { handle:"SEL-NOROLE", ids:[DOCS4[1]] };
await ctx.__citeOverSelection("SEL-NOROLE", [DOCS4[1]], citeAct(), null);
ctx.__citeChoose(CASE_2);
const onCase = snap(dlg());
ok("no role control is raised for a CASE", !/name="cx-role"/.test(onCase));
ok("the commit is present for a case with no role, because a case needs none",
   /id="cx-cite"/.test(onCase));
await ctx.__doCite();
ok("and no role is sent on the case arm, so ROLE_NOT_APPLICABLE is never provoked",
   CALLS.filter(c=>c.op==="cite").slice(citesBeforeCase).every(c => c.params.role === undefined));

/* THE WIDENED PATH, DRIVEN AT THE PLANE DIRECTLY. Kept after UI-21 gave the
   surface a role control, because what this arm proves is the RECORD's
   behaviour over a MIXED set (a document AND another question as legs) and the
   earned/unearned grade fill — properties of the plane, asserted against the
   plane, exactly as the blank-reason severance below is. */
{
  SELECTIONS["SEL-LEG"] = { handle:"SEL-LEG", ids:[DOCS4[2], QUESTION_SUB] };
  const r = (await mockFetch(
    `https://plane.test/api/?op=cite&project=${QUESTION}&handle=SEL-LEG&role=supports&note=`).json()).result;
  ok("a document AND another question land on the question's basis through the one widened act",
     r.ok && r.cited.length === 2 && r.citingObjectType === "inquiry" && r.role === "supports");
  ok("THE LEGS ARE IN THE QUESTION'S OWN DOCUMENT — the projection a surface reads IS the document's basis block",
     (INQUIRY_BASIS[QUESTION]||[]).filter(l => [DOCS4[2], QUESTION_SUB].includes(l.target)).length === 2);
  ok("THE GRADE IS FILLED BY THE RECORD, from what it earns — never offered as a control",
     r.legs.find(l=>l.target===DOCS4[2]).grade === "A"
     && r.legs.find(l=>l.target===DOCS4[2]).grade_source === "resolution");
  ok("and a target the record earns nothing for lands UNGRADED, stated rather than guessed",
     r.legs.find(l=>l.target===QUESTION_SUB).grade === null
     && r.gradesFilled === 1 && r.gradesUndetermined === 1);
  /* THE CONTROL UI-20 RECORDED AS IMPOSSIBLE TO RUN, now run: a cycle-closing
     cite onto a question reaches REC-11's guard at the write and is refused with
     the FULL PATH named. */
  SELECTIONS["SEL-BACK"] = { handle:"SEL-BACK", ids:[QUESTION] };
  const back = (await mockFetch(
    `https://plane.test/api/?op=cite&project=${QUESTION_SUB}&handle=SEL-BACK&role=supports&note=`).json()).result;
  ok("a cycle-closing cite onto a question is refused at the WRITE, by REC-11's guard and not by any rule of the act's",
     back.ok === false && back.reason === "BASIS_CYCLE");
  ok("and the refusal NAMES THE FULL PATH the record walked",
     Array.isArray(back.path) && back.path[0] === QUESTION_SUB
     && back.path[back.path.length-1] === QUESTION_SUB && back.path.includes(QUESTION));
  ok("a question citing ITSELF is refused SELF_BASIS, named as itself",
     await (async () => {
       SELECTIONS["SEL-SELF"] = { handle:"SEL-SELF", ids:[QUESTION] };
       const s = (await mockFetch(
         `https://plane.test/api/?op=cite&project=${QUESTION}&handle=SEL-SELF&role=supports&note=`).json()).result;
       return s.ok === false && s.reason === "SELF_BASIS";
     })());
}

/* ============ (7) CITATION_TOO_LARGE, with the record's own numbers ============ */
TOO_LARGE = true;
ctx.__reset();
SELECTIONS["SEL-BIG"] = { handle:"SEL-BIG", ids:[DOCS4[2]] };
await ctx.__citeOverSelection("SEL-BIG", [DOCS4[2]], citeAct(), null);
ctx.__citeChoose(CASE_2);
await ctx.__doCite();
const big = snap(dlg());
ok("an oversized citation is refused in the plane's words", big.includes(REF.CITATION_TOO_LARGE));
ok("and the record's own numbers are spelled out rather than summarised",
   big.includes("1070846") && big.includes("1048576") && big.includes("12556"));
TOO_LARGE = false;

/* ============ (8) THE SINGLE-DOCUMENT ROUTE, from the document page ============ */
ctx.__reset();
await openDoc(DOCS4[2]);
const seq0 = SEL_SEQ;
await ctx.__actGo("cite", DOCS4[2], BUNDLES[DOCS4[2]].title);
ok("the document page's cite control opens the flow over that one document",
   ctx.__CITE() && ctx.__CITE().ids.length === 1 && ctx.__CITE().ids[0] === DOCS4[2]);
ok("no lease is taken merely by opening the dialog", SEL_SEQ === seq0);
ctx.__citeChoose(CASE_2);
await ctx.__doCite();
ok("the lease is taken at the commit, from the ids the member was shown",
   SEL_SEQ === seq0 + 1 && CALLS.filter(c=>c.op==="select").pop().body.ids.join() === DOCS4[2]);
ok("and the act ran through op=cite", /cited <b>1<\/b>/.test(dlg()));

/* ============ (9) RETIRE: THE ONE REAL PRE-FLIGHT, AND IT WRITES NOTHING ============ */
ctx.__reset();
const stateBefore = BUNDLES[LOOSE_DOC].current_state;
const retireAct = { ...PUBLISHED.retire };
await ctx.__openRetire(LOOSE_DOC, BUNDLES[LOOSE_DOC].title, retireAct);
let r1 = snap(dlg());
ok("the pre-flight refuses NO_REASON before the member has written one, in the plane's words",
   r1.includes(REF.NO_REASON));
ok("the commit is absent while the record still refuses", !/id="cx-retire"/.test(r1));
ok("A RETIRE PRE-FLIGHT WRITES NOTHING: the document did not move",
   BUNDLES[LOOSE_DOC].current_state === stateBefore);
ok("and the pre-flight withheld the selection — the last thing the store needs",
   CALLS.filter(c=>c.op==="retire").every(c=>c.params.handle === ""));
await ctx.__retireReason("x".repeat(161));
snap(dlg());
ok("a malformed reason is refused by the plane, in the plane's words", dlg().includes(REF.BAD_REASON));
await ctx.__retireReason("superseded by the 2026 adopted budget");
r1 = dlg();
ok("THE PRE-FLIGHT CLEARS ON NO_SUCH_SELECTION AND ON NOTHING ELSE — the commit appears",
   /id="cx-retire"/.test(r1));
ok("a cleared pre-flight renders no refusal at all", !/intent-ref-why/.test(r1));
/* AND IT STILL WROTE NOTHING — checked HERE, after the reason cleared, which is
   the only moment a probe carrying a real selection could have committed. The
   same assertion before the reason was written costs nothing: every call was
   going to be refused NO_REASON anyway. */
ok("A CLEARED PRE-FLIGHT HAS STILL WRITTEN NOTHING: the document has not moved",
   BUNDLES[LOOSE_DOC].current_state === stateBefore);
ok("the rung is the plane's own word for this act", /declares this act <b>terminal<\/b>/.test(r1));
await ctx.__doRetire();
ok("the act ran and the record's own retired list is what the receipt names",
   dlg().includes(LOOSE_DOC) && BUNDLES[LOOSE_DOC].current_state === "retired");
ok("the reason the receipt shows is the one the record wrote back",
   dlg().includes("superseded by the 2026 adopted budget"));
BUNDLES[LOOSE_DOC].current_state = "verified";

/* retire refused CITED, with the case that still cites it NAMED */
ctx.__reset();
await ctx.__openRetire(CITED_DOC, BUNDLES[CITED_DOC].title, { ...PUBLISHED.retire });
await ctx.__retireReason("no longer relied on");
await ctx.__doRetire();
snap(dlg());
ok("retire refused CITED is the plane's sentence", dlg().includes(REF.CITED));
ok("retire refused CITED names the case that still cites it", namedIn(dlg(), CASE_1));
ok("and nothing moved", BUNDLES[CITED_DOC].current_state === "verified");

/* ============ (10) SEVER AND REINSTATE: THE EDGE, THE REASON, THE RECORD'S WORDS ============ */
ctx.__reset();
await ctx.__openEdgeAct(CITED_DOC, BUNDLES[CITED_DOC].title, { ...PUBLISHED.sever });
let e1 = snap(dlg());
ok("the edges offered come from the record's reverse index", e1.includes(CASE_1));
ok("each edge carries the record's own word for its status", /&middot; confirmed/.test(e1));
ok("THE COMMIT IS ABSENT with no edge and no reason", !/id="cx-edge-go"/.test(e1));
ok("and nothing stands in its place claiming a refusal", !/intent-ref-why/.test(e1));
ctx.__edgeChoose(CASE_1);
ok("the commit is still absent with an edge but no reason", !/id="cx-edge-go"/.test(dlg()));
ctx.__edgeReason("the 2025 figures were superseded");
ok("the commit appears once the act has what it needs", /id="cx-edge-go"/.test(dlg()));
ok("the rung is the plane's own word", /declares this act <b>reasoned<\/b>/.test(dlg()));
await ctx.__doEdgeAct();
ok("the edge moved to severed and was not deleted",
   PROJECT_REFS[CASE_1].some(r=>r.target===CITED_DOC && r.status==="severed"));
ok("the receipt shows the reason the record wrote back", dlg().includes("the 2025 figures were superseded"));

ctx.__reset();
await ctx.__openEdgeAct(CITED_DOC, BUNDLES[CITED_DOC].title, { ...PUBLISHED.reinstate });
ok("reinstate offers only the edges the record calls severed", /&middot; severed/.test(dlg()));
ctx.__edgeChoose(CASE_1);
ctx.__edgeReason("the figures were re-checked and stand");
await ctx.__doEdgeAct();
ok("the edge came back to confirmed",
   PROJECT_REFS[CASE_1].some(r=>r.target===CITED_DOC && r.status==="confirmed"));

/* the plane is still the authority on the reason: force a blank one past the surface */
ctx.__reset();
SELECTIONS["SEL-NR"] = { handle:"SEL-NR", ids:[CITED_DOC] };
const forced = await (async()=>{
  const j = await mockFetch(`https://plane.test/api/?op=sever&project=${CASE_1}&handle=SEL-NR&reason=`).json();
  return j.result;
})();
ok("the plane refuses a severance with no reason, and the surface never has to", forced.reason === "NO_REASON");

/* ============ (11) DEC-8: NO REFUSAL SENTENCE ORIGINATES IN THIS SURFACE ============
   Every sentence rendered in a refusal slot across every path driven above is
   checked against the exact set of sentences the mock plane returned. The
   mock's wording is deliberately not the store's, so a surface that had
   transcribed a store sentence fails here rather than agreeing with itself. */
/* SNAPPED AT EVERY REFUSAL AS IT WAS PAINTED (see `snap()` above), so the check
   is over what a member actually read on each path rather than over whichever
   dialog happened to be on screen last. */
const SURFACE_OWN = new Set([
  "The record accepted a check that was supposed to be incomplete. Nothing was committed from this surface.",
  "The record said nothing further.",
]);
const decode = s => String(s).replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
                             .replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&mdash;/g,"—");
const strayed = RENDERED.map(decode).filter(s => s && !SAID.includes(s) && !SURFACE_OWN.has(s));
ok("every refusal sentence rendered is one the plane returned" + (strayed.length?`: ${strayed.join(" | ")}`:""),
   strayed.length === 0);
ok("and the harness actually saw refusals to check", RENDERED.length >= 5);

/* ============ (12) THE PLUMBING IS GENERAL, AND NOTHING WAS ADDED TO IT ============ */
ok("ACT_FLOW carries one entry per act with a call site here",
   /cite:\s*\(id, title, act\)/.test(APP) && /retire:\s*\(id, title, act\)/.test(APP)
   && /sever:\s*\(id, title, act\)/.test(APP) && /reinstate:\s*\(id, title, act\)/.test(APP));
ok("the act bar's holder is no longer named for its first caller",
   !/let CONCLUDE_ACTS/.test(APP) && !/actNamed\(CONCLUDE_ACTS/.test(APP)
   && /let ACTS_HERE = \[\]/.test(APP));

if(fails.length){ console.error(`cite-act: ${n} assertions, ${fails.length} failed`); console.error(fails.join("\n")); process.exit(1); }
console.log(`cite-act: ${n} assertions, all green — a four-document selection cited onto a case through op=cite with the outcome stated per item (3 cited, 1 retained), the note optional and bounded BY THE PLANE, a severed edge and a cycle-closing cite refused in the record's own words with every id it named, retire pre-flighted through the plane's own reason grammar with the selection withheld and nothing written, sever and reinstate moving an edge without deleting it, and no refusal sentence originating in this surface; and, with UI-21's surface half landed on REC-37's widened plane, a QUESTION is now OFFERED as a citing object, choosing one raises the ROLE control from the plane's published vocabulary, the commit is ABSENT until the role is stated (so the flow no longer walks into NO_ROLE — the gap UI-20 measured and REC-37 left is closed), NO GRADE CONTROL exists anywhere on the path, and the receipt renders the record's own per-leg grades with its own filled/undetermined counts; the case arm still raises no role control and sends none, so ROLE_NOT_APPLICABLE is never provoked; and the widened act driven directly at the plane lands a document AND another question as legs of the question's own document, fills the earned grade from the record, leaves an unearned one undetermined, and refuses a cycle-closing cite at the write with the full path named`);
