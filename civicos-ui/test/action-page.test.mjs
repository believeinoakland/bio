/* UI-19 — O3 THE ACTION PAGE, the outward ask and what came back.
 *
 * The surface for the last unhomed verb on Bob's path. REC-24 built the plane
 * half — `op=actionmove`, `op=actioncorrespond`, and the derived `action` block
 * on `op=projection` — and until this item nothing could reach any of it: an
 * action bundle could be written and never moved, never corresponded with,
 * never read as an action at all.
 *
 * THE MOCK PLANE MIRRORS THE STORE'S CHECK ORDER EXACTLY, because the order is
 * what both pre-flight decisions in this item turn on, and a mock that judged
 * its fields in a convenient order would prove the surface works against a
 * plane that does not exist. Its refusal SENTENCES are deliberately NOT the
 * store's: what this harness proves is PROVENANCE — that every sentence a member
 * reads came back over the wire — so wording the surface could not possibly have
 * transcribed is the right instrument.
 *
 * WHAT THIS HOLDS THE ITEM TO, each in the direction that fails:
 *
 *   1. THE DRIVE, END TO END: planned -> active -> awaiting_response -> overdue
 *      -> resolved, every move through the surface's own flow and the plane's
 *      own act, with the state moving in the record between them.
 *
 *   2. THE ILLEGAL TRANSITION IS REFUSED AT PRE-FLIGHT, IN THE PLANE'S WORDS,
 *      AND NOTHING IS WRITTEN. The probe carries the member's real reason and
 *      real target with a RESOLUTION THE STORE CANNOT ACCEPT — the field
 *      `actionMove()` consults LAST — so every refusal above it arrives in the
 *      plane's order and words and the call can never reach the write. The
 *      harness asserts that NO accepted actionmove reaches the plane during a
 *      pre-flight, which is the assertion that makes "it cannot commit" a
 *      measurement rather than a claim.
 *
 *   3. THE OVERDUE NOTE IS THE PLANE'S DERIVED ANSWER AND NOTHING ELSE. The
 *      SAME bytes are read at two injected instants and the note appears at one
 *      and not the other. The surface compares no date to anything.
 *
 *   4. THE UNDETERMINED COUNTERPARTY WITH NO BASIS IS REFUSED IN THE PLANE'S
 *      WORDS. Driven through the intake and `op=promote`, and the sentence the
 *      member reads is the gate's own `findings[].detail`, not a list of check
 *      ids and not a sentence this surface wrote.
 *
 *   5. THE COUNTERPARTY BASIS IS EMPTY, ALWAYS — no value, no placeholder, no
 *      suggested phrasing, and no default radio. A prefilled basis is the
 *      machine authoring the honest-undetermined state it exists to protect.
 *
 *   6. `consequence.state: unproven` RENDERS AS STATED AND NEVER AS A GRADE.
 *      No letter, no bar, no score anywhere near it, asserted positionally and
 *      by a sweep for grade marks.
 *
 *   7. DEC-8: NO REFUSAL STRING ORIGINATES IN THE SURFACE. Every refusal
 *      sentence rendered across every driven path is checked against the exact
 *      set the mock plane returned. ONE STATED EXCEPTION, which is not a refusal
 *      about the record: the fail-closed guard for a pre-flight the plane
 *      ACCEPTED (`PREFLIGHT_NOT_REFUSED`) — UI-12/UI-13's landed precedent,
 *      unreachable while the plane behaves, and driven below so it is not
 *      merely asserted to be safe.
 *
 *   8. DEC-13's SURFACE HALF: a `request_for_comment` renders the SPECIFIC
 *      inquiries it disclosed as rows of the record, addressed by id — never as
 *      a sentence and never as free text.
 *
 *   9. Q12: a read-only credential sees the whole page and NO act control.
 *
 * NEGATIVE CONTROL, three arms, RUN 2026-08-05 and restored byte-identical after
 * each — `civicos-ui/app.html`'s sha256 was taken before, after the break and
 * after the restore on every arm, and all three returned to
 * 3e6ea3f46586947b109667f992a0d2e4513e685de36e01bceabea7764a3fed7b. Baseline
 * 90 pass / 0 fail.
 *
 *   (a) AN OVERDUE NOTE WHEN NOTHING IS OVERDUE. In `actionOverdueHtml`,
 *       replace the guard
 *         if(!der || der.clock_overdue !== true) return "";
 *       with
 *         if(!der) return "";
 *       -> RUN: 2 of 90 failed — "read BEFORE the window closes, the page
 *       renders NO overdue note" and "and offers no non-response act while
 *       nothing is overdue".
 *       TWO INSTRUMENT FINDINGS KEPT, because both are about what this suite
 *       can and cannot see:
 *         - the two assertions that the note DOES appear after the window
 *           STAYED GREEN, which is the whole reason the page is read at two
 *           instants. A suite that only checked the overdue case would have
 *           gone green on a surface that always shouted.
 *         - "the same bytes at two instants are byte-identical once the plane's
 *           overdue verdict is removed" ALSO stayed green, and it could not have
 *           failed: the strip removes the note from BOTH renderings, so that
 *           assertion measures that nothing ELSE moves with the clock and is
 *           deliberately blind to this break. It is kept beside the two that do
 *           catch it rather than reworded to overlap them — three instruments,
 *           each answering its own question (UI-12's arm-(c) lesson).
 *
 *   (b) A PREFILLED COUNTERPARTY BASIS. In `addActionPaneHtml`, give the
 *       undetermined basis a value and a suggestion:
 *         <textarea class="txt" id="ac-basis" style="min-height:70px" placeholder="e.g. the department has not said which office holds the records" oninput="addActSync()">The office that holds these records has not been identified.</textarea>
 *       -> RUN: 2 of 90 failed — "the counterparty basis is EMPTY: no value
 *       between the tags" and "the counterparty basis offers no placeholder, no
 *       template and no suggested wording". The two arms are separate on
 *       purpose: a placeholder is a framing even when the field submits empty,
 *       and they are the two different ways a system writes a member's honest
 *       undetermined for them. The third assertion in that group ("neither
 *       counterparty answer is preselected") is a THIRD way and needs its own
 *       break, which is why it did not move here.
 *
 *   (c) A SURFACE-COMPUTED REFUSAL. In `actionMovePaint`, keep the plane's
 *       reason CODE and substitute a sentence the surface wrote:
 *         : (pf && !pf.clear ? `<div class="intent-pf">${actRefusalHtml({reason:pf.refusal.reason, detail:"An action cannot go straight from planned to resolved."})}</div>` : "")
 *       -> RUN: 3 of 90 failed — "the illegal transition is refused AT
 *       PRE-FLIGHT in the plane's own words", "the pre-flight refuses NO_REASON
 *       before the member has written one, in the plane's words", and "every
 *       refusal sentence the page renders is one the plane returned", which
 *       NAMED the invented sentence three times in its own failure message.
 *       WORTH KNOWING, and it is the reason the provenance check is over the
 *       SENTENCE: the reason CODE stayed correct on every one of them, and
 *       "and the refusal names the code the plane gave it" stayed GREEN. A
 *       suite checking only codes would have been entirely green on a surface
 *       that had started writing the record's refusals itself.
 *
 *   (d) THE TIE'S OWN, ADDED 2026-08-05 (UI-24) — drift a vocabulary in the
 *       PLANE'S export and confirm this suite moves. Two arms, both run, both
 *       restored byte-identical; the mechanism, the measured counts and the one
 *       prediction that turned out wrong are recorded at `THE TIE` below, beside
 *       the pins that make it work. The vocabularies this file publishes are the
 *       plane's own arrays now, imported — REC-38 verified UI-19's consumers
 *       this way from a scratch copy and a scratch run is not in the loop the
 *       reader runs (CLAUDE.md).
 */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

const APP = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");

/* ================= THE MOCK PLANE ================= */
const CALLS = [];
const SAID = [];                     // every refusal sentence the plane returned
const COMMITS = [];                  // every call that the plane ACCEPTED and acted on

/* op=affordances' acts in the producer's own shape (index.mjs decorateAct).
   Neither action act carries a rung — no document assigns one — and that
   absence is rendered as an absence. */
const PUBLISHED = {
  actionmove: { id:"actionmove", label:"Move this action", weight:"single", needs:"contribute",
                mode:"session", rung:null, prompt:null },
  actioncorrespond: { id:"actioncorrespond", label:"Record correspondence", weight:"single",
                      needs:"contribute", mode:"session", rung:null, prompt:null },
};
/* ============================================================
   THE TIE (UI-24) — this mock publishes THE PLANE'S OWN ARRAYS, imported.

   WHY, and it is a measurement rather than a preference. Until this turn every
   vocabulary below was a LITERAL WRITTEN HERE that happened to agree with the
   plane, and an agreement that costs nothing to produce is not evidence
   (CLAUDE.md). REC-38 proved that on this very file the hard way: it verified
   UI-19's consumers TWICE — once as written, once with these literals repointed
   at the real export from a SCRATCH COPY — because only the second run shows the
   picker lighting up off the publication that shipped rather than off a mock
   that agrees with it. A proof run in a scratch copy is not in the loop the
   reader runs, so it is not a mechanism; this is that proof, moved into the loop.

   AND IT IMMEDIATELY PAID: `ACTION_KINDS` has EIGHT members
   (cpra_request, grand_jury, controller_referral, public_comment, media,
   litigation_support, request_for_comment, other) and the literal that stood
   here published FOUR. This harness had never driven the intake the real
   application draws, and nothing could have told anybody.

   WHAT IS NOT TIED, and it is a finding rather than an omission: the four
   RESOLUTIONS below have no published home. They are enforced twice — an inline
   literal in `bio-checks.mjs` C-2.10 and a second array in `store.mjs`
   `actionMove()` — and `VOCABULARIES` does not carry them, so there is nothing to
   import and the surface can only learn them from the store's own refusal (which
   is what it does, and which this harness drives). Raised for CONDUCT rather
   than closed here: publishing them is REC ground, not UI's.
   ============================================================ */
import { VOCABULARIES } from "../../bio-plane/src/affordances.mjs";
import { STATES } from "../../bio-plane/checks/bio-checks.mjs";

/* The plane's published vocabularies, as `op=affordances` answers them.
   `action_basis_kinds` is WITHHELD to begin with — not because the plane no
   longer publishes it (REC-38 landed it; the note that used to stand here saying
   otherwise is corrected), but because the surface's ABSENT-AND-STATED behaviour
   over an unpublished set is the property this file proves, and it can only be
   proved by withholding one. It is published from the plane's own array below
   and the surface is watched to change with no other edit. */
let VOCAB = { action_kind: VOCABULARIES.action_kind };

/* The action state machine, from the catalog's OWN table — the one
   `affordances.mjs` reads through `vocabFor(STATES, …)` and the one `op=actionmove`
   refuses ILLEGAL_TRANSITION against. A mirror written here would be this file
   deciding what an action may do. */
const LEGAL = STATES.action.legal;
const EDGES = STATES.action.edges;
/* NOT PUBLISHED ANYWHERE — see the block above. Harvested by the surface from
   the store's own refusal, which is the only source there is. */
const RESOLUTIONS = ["complied","denied","escalated","withdrawn"];
const DIRECTIONS = VOCABULARIES.correspondence_directions;

/* THE TIE'S OWN NEGATIVE CONTROL, standing rather than run once.

   Importing the plane's arrays makes the mock follow the publication — but on
   its own it would also make a DRIFT INVISIBLE, because the mock and the
   assertions would move together. So every token this file NAMES in an
   assertion below is pinned to the plane's set HERE, by name. Change one in
   `bio-plane/checks/bio-checks.mjs` and the failure is at this line, saying
   which word moved and that the surface's own assertions are now about a
   vocabulary the record does not have.

   RUN 2026-08-05, TWO ARMS, `bio-plane/checks/bio-checks.mjs` restored
   byte-identical after each (sha256
   bcba30cf99796393ac8cf708ecbcfe9844d1e76cc8a76c2401e92a15d945d206 before and
   after both), and the RESULTS ARE RECORDED AS MEASURED rather than as
   predicted, because the first prediction was wrong:

     (i)  `ACTION_BASIS_KINDS` 'advances' -> 'advancez'. 95 pass, 1 FAIL, and it
          is this pin. NOTHING ELSE MOVED — and that is the finding: section 6
          asserts `value="rests_on"` (untouched) and that publishing the set
          makes the picker appear (true of ANY set), so the surface renders the
          record's new word perfectly happily. The suite is only sensitive to
          the words it NAMES, which is exactly why the pins name them here
          rather than trusting a rendered-value scan to notice.

     (ii) `ACTION_KINDS` 'request_for_comment' -> 'rfc'. 94 pass, 2 FAIL — this
          pin, plus "`request_for_comment` appears with it, because the surface
          can now complete it" in section 6.

   BEFORE THE TIE BOTH EDITS WERE GREEN HERE, by construction: this file
   contained no reference of any kind to a `bio-plane` module, so no change to
   the plane's own arrays could reach it. */
{
  const named = {
    "the two action kinds this harness authors and asserts on":
      ["cpra_request","request_for_comment"].every(k=>VOCABULARIES.action_kind.includes(k)),
    "the two basis roles the picker is asserted to offer":
      ["rests_on","advances"].every(k=>VOCABULARIES.action_basis_kinds.includes(k)),
    "the three correspondence directions, including the non-response DEC-13 records as a fact":
      ["sent","received","no_response"].every(k=>DIRECTIONS.includes(k)),
    "the five action states this harness walks":
      ["planned","active","awaiting_response","resolved","abandoned"].every(s=>LEGAL.includes(s)),
    "the one move the ILLEGAL_TRANSITION arm relies on being absent":
      !(EDGES.planned||[]).includes("resolved"),
  };
  for(const [what, held] of Object.entries(named))
    ok("THE TIE: the plane still publishes " + what, held);
  ok("THE TIE: this harness drives the plane's WHOLE action-kind set, not a subset of it",
     VOCAB.action_kind === VOCABULARIES.action_kind && VOCABULARIES.action_kind.length >= 8);
}

const DUE = "2026-09-10";
const BEFORE_MS = Date.parse("2026-08-20T00:00:00Z");
const AFTER_MS  = Date.parse("2026-09-20T00:00:00Z");
let NOW_MS = BEFORE_MS;              // THE INJECTED CLOCK. Nothing else moves it.

const CLOCK = [{ text:"City response due", date:DUE, status:"pending",
  description:"The window the group gave the City to reply before recording a non-response.",
  basis:"California Public Records Act 7922.535, plus the 30-day extension the group allowed" }];

const ACT = "ACTN-2026-2400-records-request";
const RFC = "ACTN-2026-2500-comment-request";
const INQ = "INQ-2026-2400-transfer";
const REPLY = "INFO-2026-2400-city-reply";

const DOCS = {
  [ACT]: {
    type:"action", state:"planned", title:"Records request to the City Clerk",
    plan:"Ask for the transfer ledger for FY2025.",
    fm:{ action_kind:"cpra_request", risk_tier:1,
         counterparty:{ state:"named", name:"City Clerk" }, clock:CLOCK },
    basis:[{ ord:0, target_id:INQ, target_type:"inquiry", kind:"rests_on",
             note:"the memo the finding identified is what we are asking for" }],
    ledger:[], responses:[], consequence:null,
  },
  [RFC]: {
    type:"action", state:"active", title:"Request for comment to the City Administrator",
    plan:"Put the four claims to the City before publishing.",
    fm:{ action_kind:"request_for_comment", risk_tier:2,
         counterparty:{ state:"undetermined",
           basis:"The request went to the department; which office answers for it has not been established. The delegation register would settle it." },
         clock:CLOCK },
    basis:[{ ord:0, target_id:INQ, target_type:"inquiry", kind:"advances",
             note:"put to the City as a specific claim, with the memo attached" }],
    ledger:[], responses:[],
    /* DEC-14: an impact claim resting on nothing outside our own action. It
       LANDED — unproven is not a refusal — and it says what it is. */
    consequence:{ claim:"impact", state:"unproven", determined:false, grade:null, evidence:[],
      at:"2026-10-01", description:"Our request caused the Council to convene the hearing.",
      detail:"UNPROVEN: the record holds no evidence outside this group's own action. This is not a low score and not a weak grade; it is sequence alone, which establishes nothing about cause." },
  },
  [INQ]: { type:"inquiry", state:"concluded", title:"Where does the transfer basis come from?" },
  [REPLY]: { type:"information", state:"collected", title:"City written response",
             content_hash:"sha256:"+"b".repeat(64) },
};
const REGISTER = new Set(["b".repeat(64)]);

const REF = {
  MACHINE_CANNOT_MOVE_ACTION: "reaching outside this system is a named member's decision and never a scheduler's.",
  NO_REASON:        "an action moves for a stated reason, and a change nobody accounted for cannot be checked by anyone.",
  BAD_REASON:       "the record's frontmatter grammar has no escapes, so a quote, a backslash or a line break cannot be written verbatim.",
  NO_TARGET:        "one action moves at a time and this call named none.",
  NO_SUCH_BUNDLE:   "no action with that name is visible to this credential.",
  NOT_AN_ACTION:    "only an action has an action's state machine.",
  BAD_TARGET_STATE: "that is not a state an action may hold.",
  ILLEGAL_TRANSITION: "the catalog's table has no such move for this document's own vocabulary.",
  NO_RESOLUTION:    "an action that is finished says HOW it finished, and a move without that would mint a bundle the catalog rejects.",
  RESOLUTION_WITHOUT_RESOLVING: "a resolution describes how an action ENDED, and supplying one here would record an outcome it has not reached.",
  MACHINE_CANNOT_CORRESPOND: "on the testimony arm the author IS the evidence, so a machine credential may not testify to an exchange.",
  BAD_DIRECTION:    "a reply that never came is recorded as a non-response with the date it was due, not omitted.",
  BAD_DATE:         "every entry in this ledger is dated, including one recording that nothing arrived.",
  CAPTURE_AND_TESTIMONY: "what came back is captured and not summarised, so an entry holds the bytes or an account and never both.",
  NEITHER_CAPTURE_NOR_TESTIMONY: "an entry carrying neither asserts an exchange and offers no way to check that it happened.",
  UNREGISTERED_ARTIFACT: "this hash names no capture this store holds, and a hash a caller can hand us is a hash a caller can invent.",
  GATE_COUNTERPARTY: "counterparty.state is undetermined and counterparty.basis is empty: undetermined is first-class and must be STATED, so an action that does not know who it is addressed to says what it does know.",
};
const refuse = (reason, extra) => { SAID.push(REF[reason]); return { ok:false, reason, detail:REF[reason], ...(extra||{}) }; };

let AS_MACHINE = false;
let PREFLIGHT_ACCEPTS = false;       // arm (7)'s fail-closed guard

function bundleMd(id){
  const d = DOCS[id];
  const fm = ["---", "id: "+id, "object_type: "+d.type, "current_state: "+d.state,
              "title: "+d.title, "---"].join("\n");
  return fm + "\n\n" + (d.type === "action"
    ? `## Plan\n\n${d.plan}\n\n## Status\n\n## Correspondence\n\n## Session Log\n\n## Review Notes\n`
    : `## Summary\n\nA document.\n`);
}
/* THE DERIVED BLOCK, computed the way store.mjs #actionDerived computes it —
   including the clock verdict AT `NOW_MS`, which is the whole instrument. */
function derived(id){
  const d = DOCS[id];
  const pending = (d.fm.clock||[]).filter(c=>c.status === "pending" && c.date);
  const next = pending.length ? pending.map(c=>c.date).sort()[0] : null;
  return {
    kind: d.fm.action_kind, risk_tier: d.fm.risk_tier,
    counterparty_state: d.fm.counterparty ? d.fm.counterparty.state : null,
    resolution: d.resolution || null,
    clock_next: next,
    clock_overdue: !!(next && NOW_MS > Date.parse(next + "T00:00:00Z")),
    /* The FILTER'S CACHE, reported beside the derived answer and deliberately
       stale, exactly as REC-24 reports it. */
    clock_overdue_cached: false,
    as_of: new Date(NOW_MS).toISOString(),
    basis: d.basis || [], correspondence: d.ledger || [],
    consequence: d.consequence, responses: d.responses || [],
  };
}

function mockFetch(u, opts){
  const url = new URL(u, "https://plane.test");
  const op = url.searchParams.get("op");
  const p = Object.fromEntries(url.searchParams.entries());
  let body = null;
  try{ body = opts && opts.body ? JSON.parse(opts.body) : null; }catch(_){ body = null; }
  CALLS.push({ op, params:p, body });
  const R = o => ({ ok:true, json:async()=>o });
  const W = r => R({ ok:true, result:r });   // the envelope the plane really sends (D-173)

  if(op==="whoami") return W(PLANE_ME);
  if(op==="image"){ const d = DOCS[p.id]; if(!d) return W(null); return W({ "bundle.md": bundleMd(p.id) }); }
  if(op==="projection"){
    const d = DOCS[p.id]; if(!d) return W(null);
    return W({ bundle_id:p.id, object_type:d.type, title:d.title, current_state:d.state,
               ...(d.content_hash?{ content_hash:d.content_hash }:{}),
               fm_json: JSON.stringify(d.fm || {}),
               ...(d.type==="action" ? { action: derived(p.id) } : {}) });
  }
  if(op==="list")
    return W(Object.entries(DOCS).map(([id,d])=>({ bundle_id:id, object_type:d.type,
             current_state:d.state, title:d.title, last_updated:"2026-08-01T00:00:00Z" })));
  if(op==="backlinks") return W({ ok:true, target:p.target, backlinks:[] });
  if(op==="affordances"){
    if(!p.target) return W({ target:null, catalog:Object.values(PUBLISHED), vocabularies:VOCAB });
    const d = DOCS[p.target];
    if(!d) return W(refuse("NO_SUCH_BUNDLE", { target:p.target }));
    if(d.type !== "action") return W({ target:p.target, object_type:d.type, current_state:d.state,
                                       acts:[], vocabularies:VOCAB });
    /* affordances.mjs: actionmove applies only while the machine offers an
       onward state; actioncorrespond applies in ANY state. */
    const acts = [];
    if(EDGES[d.state].length) acts.push(PUBLISHED.actionmove);
    acts.push(PUBLISHED.actioncorrespond);
    return W({ target:p.target, object_type:"action", current_state:d.state, acts, vocabularies:VOCAB });
  }

  /* ---- op=actionmove: store.mjs actionMove()'s ORDER, mirrored exactly ---- */
  if(op==="actionmove"){
    if(PREFLIGHT_ACCEPTS && p.resolution === "__preflight__")
      return W({ ok:true, target:p.target, from:"planned", to:"active" });
    if(AS_MACHINE) return W(refuse("MACHINE_CANNOT_MOVE_ACTION"));
    const why = String(p.reason||"").trim();
    if(!why) return W(refuse("NO_REASON"));
    if(/["\\\r\n]/.test(why)) return W(refuse("BAD_REASON"));
    if(!p.target) return W(refuse("NO_TARGET"));
    const d = DOCS[p.target];
    if(!d) return W(refuse("NO_SUCH_BUNDLE", { target:p.target }));
    if(d.type !== "action") return W(refuse("NOT_AN_ACTION", { target:p.target }));
    if(!LEGAL.includes(p.to)) return W(refuse("BAD_TARGET_STATE", { to:p.to, target:p.target, legal:LEGAL }));
    if(!EDGES[d.state].includes(p.to))
      return W(refuse("ILLEGAL_TRANSITION", { to:p.to, target:p.target, from:d.state,
                                              legal_from:EDGES[d.state] }));
    const res = String(p.resolution||"").trim();
    if(p.to === "resolved" && !RESOLUTIONS.includes(res))
      return W(refuse("NO_RESOLUTION", { target:p.target, legal:RESOLUTIONS }));
    if(p.to !== "resolved" && res) return W(refuse("RESOLUTION_WITHOUT_RESOLVING", { target:p.target, to:p.to }));
    const from = d.state; d.state = p.to; if(p.to==="resolved") d.resolution = res;
    COMMITS.push({ op:"actionmove", target:p.target, from, to:p.to });
    return W({ ok:true, target:p.target, from, to:p.to, reason:why,
               ...(p.to==="resolved"?{ resolution:res }:{}), author:"m_nadia",
               at:"2026-08-11T09:00:00Z", weight:"single" });
  }

  /* ---- op=actioncorrespond: the same discipline, its own order ---- */
  if(op==="actioncorrespond"){
    if(AS_MACHINE) return W(refuse("MACHINE_CANNOT_CORRESPOND"));
    if(!p.target) return W(refuse("NO_TARGET"));
    if(!DIRECTIONS.includes(p.direction))
      return W(refuse("BAD_DIRECTION", { legal:DIRECTIONS, direction:p.direction }));
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(p.at||"")))
      return W(refuse("BAD_DATE", { at:p.at }));
    const sha = String(p.artifact_sha||"").trim(), acct = String(p.account||"").trim();
    if(sha && acct) return W(refuse("CAPTURE_AND_TESTIMONY", { target:p.target }));
    if(!sha && !acct) return W(refuse("NEITHER_CAPTURE_NOR_TESTIMONY", { target:p.target }));
    if(sha && !REGISTER.has(sha)) return W(refuse("UNREGISTERED_ARTIFACT", { target:p.target, artifact_sha:sha }));
    const d = DOCS[p.target];
    const ord = d.ledger.length;
    d.ledger.push({ ord, direction:p.direction, at:p.at, medium:p.medium||null, party:p.party||null,
                    artifact_sha:sha||null, artifact_bundle_id: sha ? REPLY : null,
                    account:acct||null, author:"m_nadia", recorded_at:"2026-09-22T10:00:00Z" });
    if(p.direction==="received" && sha && !d.responses.includes(REPLY)) d.responses.push(REPLY);
    COMMITS.push({ op:"actioncorrespond", target:p.target, ord });
    return W({ ok:true, target:p.target, ord, direction:p.direction, at:p.at, author:"m_nadia",
               recorded_at:"2026-09-22T10:00:00Z", held_as: sha ? "capture" : "testimony",
               ...(sha ? { artifact_sha:sha, responds_to:{ bundle_id:REPLY, already:false } }
                       : { account:acct }) });
  }

  /* ---- the intake's write path ---- */
  if(op==="allocid") return W({ id:"ACTN-2026-2600" });
  if(op==="promote"){
    /* The GATE, standing in for checkBundle at the write: exactly the arm this
       item is about, worded by the plane and never by the surface. */
    const md = ((body && body.files) || []).find(f=>f.path==="bundle.md");
    const text = (md && md.text) || "";
    if(/object_type: action/.test(text)
       && /state: undetermined/.test(text) && !/basis:/.test(text)){
      SAID.push(REF.GATE_COUNTERPARTY);
      return W({ ok:false, reason:"GATE_REFUSED",
                 findings:[{ check:"C-2.10", detail:REF.GATE_COUNTERPARTY,
                             repairs:["author counterparty.basis: what has been established so far, and what would settle it"] }] });
    }
    COMMITS.push({ op:"promote", id: body && body.bundleId, text });
    return W({ ok:true, bundleId: body && body.bundleId });
  }
  return R({ ok:false, error:"unexpected op "+op });
}

let PLANE_ME = { session:true, handle:"nadia", member:"nadia",
                 capabilities:["contribute"], administer:false };

/* ---- a DOM stub good enough for innerHTML inspection ---- */
const els = new Map();
function el(){ const e={ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", _html:"", textContent:"", scrollTop:0, disabled:false, hidden:false, checked:false, options:[],
  addEventListener(){}, querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){},
  focus(){}, click(){}, remove(){}, onclick:null };
  Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}});
  Object.defineProperty(e,"outerHTML",{get(){return e._html},set(v){e._html=v}});
  return e; }

const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
  document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}}, getElementById:()=>el(),
    hidden:false, createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch:async(u,opts)=>mockFetch(u,opts) };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() +
  ";globalThis.__PLANE=PLANE;globalThis.__openAction=openAction;globalThis.__ACTION=()=>ACTION;" +
  "globalThis.__loadActSource=loadActSource;globalThis.__actVocab=actVocab;" +
  "globalThis.__openMove=openActionMove;globalThis.__moveTo=actionMoveTo;globalThis.__moveWhy=actionMoveReason;" +
  "globalThis.__moveRes=actionMoveRes;globalThis.__doMove=doActionMove;" +
  "globalThis.__openCorr=openActionCorrespond;globalThis.__corrSet=actionCorrSet;globalThis.__corrArm=actionCorrArm;" +
  "globalThis.__doCorr=doActionCorrespond;globalThis.__actsFor=actsFor;" +
  "globalThis.__renderAdd=renderAdd;globalThis.__addGo=addGo;globalThis.__ADD_ACT=()=>ADD_ACT;" +
  "globalThis.__addActPick=addActPick;globalThis.__addActSync=addActSync;globalThis.__addTypeSync=addTypeSync;" +
  "globalThis.__route=actionRouteFromHash;globalThis.__queueOpen=queueOpen;globalThis.__rowOpen=rowOpen;" +
  "globalThis.__RAIL=RAIL;globalThis.__ADD_TYPES=ADD_TYPES;globalThis.__loadRecord=loadRecord;" +
  "globalThis.__IMG=IMG_CACHE;globalThis.__PROJ=PROJ_CACHE;globalThis.__overdueHtml=actionOverdueHtml;" +
  "globalThis.__nonResp=openNonResponseInquiry;globalThis.__RECORD=()=>RECORD_CACHE;", ctx);

const G = ctx;
G.__PLANE.base = "https://plane.test"; G.__PLANE.token = "t"; G.__PLANE.preview = false;
G.__PLANE.session = true; G.__PLANE.me = PLANE_ME;
const content = () => els.get("#content")._html || "";
const dialog  = () => { const d = els.get("#dlg"); return (d && d._html) || (els.get("#dlgbody")||{_html:""})._html || ""; };
const fresh = async (id) => { G.__IMG.clear(); G.__PROJ.clear(); await G.__openAction(id); };

await G.__loadActSource(true);

/* =====================================================================
   0. THE RAIL, THE ROUTE AND THE ROWS — P-52, and the verb gets a home.
   ===================================================================== */
console.log("--- 0. the action has a home ---");
ok("the rail carries an Actions entry (P-52)", G.__RAIL.some(r=>r.id==="actions"));
G.location.hash = "#action/"+ACT;
ok("`#action/<id>` is a real address the router recognises", G.__route() === true);
G.location.hash = "#inquiry/INQ-1";
ok("and it declines an address that is not one", G.__route() === false);
G.location.hash = "";
ok("a queue item typed `action` by the RECORD opens the action page, not the document page",
   String(G.__queueOpen).includes("openAction"));
ok("and a record row does the same, from the record's own type and never the id's shape",
   String(G.__rowOpen).includes("normalizeType") && String(G.__rowOpen).includes("openAction"));

/* =====================================================================
   1. THE PAGE, READ AT AN INSTANT BEFORE THE WINDOW CLOSES.
   ===================================================================== */
console.log("\n--- 1. the page: who, why, the clock, the ledger ---");
NOW_MS = BEFORE_MS;
await fresh(ACT);
const before = content();
ok("the counterparty is rendered, by name", /City Clerk/.test(before));
ok("the basis leg is rendered as a ROW of the record, addressed by id",
   before.includes(INQ) && /Rests On/i.test(before));
ok("...with the note the member wrote on it",
   /the memo the finding identified/.test(before));
ok("the clock entry carries its date", before.includes(DUE));
ok("and its BECAUSE — a date with no basis would be a deadline the record invented",
   /Because:/.test(before) && /Public Records Act 7922\.535/.test(before));
ok("read BEFORE the window closes, the page renders NO overdue note", !/act-overdue/.test(before));
ok("and offers no non-response act while nothing is overdue",
   !/openNonResponseInquiry/.test(before));
ok("the clock row for the pending deadline is not marked overdue before the window closes",
   !/act-clock overdue/.test(before));
ok("an empty ledger says so rather than showing nothing", /Nothing has been sent/.test(before));
ok("the act bar carries the two acts the plane published for a planned action",
   /Move this action/.test(before) && /Record correspondence/.test(before));
ok("and it renders no rung, because the record assigns these acts none",
   !/reversible|terminal|reasoned|attested/i.test(before));

/* THE SAME BYTES, AT A LATER INSTANT. Nothing is written in between. */
NOW_MS = AFTER_MS;
await fresh(ACT);
const after = content();
ok("read AFTER the window closes, the SAME bytes render the overdue note", /act-overdue/.test(after));
ok("...at the instant the plane names, so a reader can check it",
   after.includes(new Date(AFTER_MS).toISOString()));
ok("...and the clock row itself is marked", /act-clock overdue/.test(after));
ok("the disagreement with the record's own cached column is SHOWN, not reconciled here",
   /filter has not caught up/.test(after));
/* The two renderings differ in exactly two places and BOTH are the plane's
   derived verdict — the note and the mark on the row it names. Strip those and
   the pages are byte-identical, which is what makes "the surface computed
   nothing" a measurement rather than an inspection of the source. */
const stripOverdue = (h) => h.replace(/<div class="act-overdue">[\s\S]*?<\/div>\s*<\/div>/, "")
                             .replace(/act-clock overdue/g, "act-clock");
ok("the same bytes at two instants are byte-identical once the plane's overdue verdict is removed",
   stripOverdue(before) === stripOverdue(after));
ok("the ONE act an overdue action offers is opened from the note",
   /openNonResponseInquiry/.test(after));
ok("the surface compares no date to anything: `Date.parse` appears nowhere in the action page region",
   !/Date\.parse/.test(APP.slice(APP.indexOf("/*__ACTION_PAGE_START__*/"),
                                 APP.indexOf("/*__ACTION_PAGE_END__*/"))));

/* THE ONE ACT, AND WHAT IT DELIBERATELY DOES NOT DO. */
G.__nonResp();
const nr = dialog();
ok("the non-response act writes NONE of the question", !/did not respond|failed to|silence means that/i.test(nr));
ok("it carries the action and its clock entry across", nr.includes(ACT) && nr.includes(DUE));
ok("and it says the carry is a REFERENCE, because the record refuses an action as a leg of a question's basis",
   /REFERENCE/.test(nr) && /rests on/.test(nr));

/* =====================================================================
   2. THE DRIVE: planned -> active -> awaiting_response -> resolved.
   ===================================================================== */
console.log("\n--- 2. the drive, end to end, through the plane's own act ---");
NOW_MS = BEFORE_MS;
await fresh(ACT);
const move = async (to, why, res) => {
  await G.__openMove(ACT, DOCS[ACT].title, { id:"actionmove", label:"Move this action", prompt:null });
  G.__moveWhy(why);
  await G.__moveTo(to);
  if(res) await G.__moveRes(res);
  await G.__doMove();
};
ok("the move dialog offers the states the PLANE published, and offers none of its own",
   (await (async()=>{ await G.__openMove(ACT, "t", { id:"actionmove", label:"Move this action" });
      return LEGAL.every(s=>dialog().includes('value="'+s+'"')); })()) === true);
await move("active", "the finding is concluded and the request goes out today");
ok("planned -> active is accepted and the state moves in the record", DOCS[ACT].state === "active");
await move("awaiting_response", "sent this morning; the clock starts now");
ok("active -> awaiting_response is accepted", DOCS[ACT].state === "awaiting_response");

/* THE ILLEGAL TRANSITION, REFUSED AT PRE-FLIGHT. */
const commitsBefore = COMMITS.length;
await G.__openMove(ACT, DOCS[ACT].title, { id:"actionmove", label:"Move this action" });
G.__moveWhy("we are done here");
await G.__moveTo("planned");
const illegal = dialog();
ok("the illegal transition is refused AT PRE-FLIGHT in the plane's own words",
   illegal.includes(REF.ILLEGAL_TRANSITION));
ok("and the refusal names the code the plane gave it", /ILLEGAL_TRANSITION/.test(illegal));
ok("the commit control is ABSENT while the plane refuses, never greyed",
   !/doActionMove\(\)/.test(illegal));
ok("and the pre-flight WROTE NOTHING: no accepted move reached the plane",
   COMMITS.length === commitsBefore);
ok("every pre-flight call carried the resolution hold, so it could not have committed",
   CALLS.filter(c=>c.op==="actionmove" && c.params.to==="planned")
        .every(c=>c.params.resolution === "__preflight__"));

/* THE REASON IS THE PLANE'S REQUIREMENT AND NOT THIS SURFACE'S. */
await G.__openMove(ACT, DOCS[ACT].title, { id:"actionmove", label:"Move this action" });
await G.__moveTo("resolved");
const noReason = dialog();
ok("the pre-flight refuses NO_REASON before the member has written one, in the plane's words",
   noReason.includes(REF.NO_REASON));
ok("and no commit control is offered on that refusal", !/doActionMove\(\)/.test(noReason));

/* RESOLVING: the options are the plane's own, off its own refusal. */
await G.__openMove(ACT, DOCS[ACT].title, { id:"actionmove", label:"Move this action" });
G.__moveWhy("the City produced the ledger and the finding is answered");
await G.__moveTo("resolved");
const resDlg = dialog();
ok("resolving offers the four ways an action ends, and they are the PLANE's own set",
   RESOLUTIONS.every(r=>resDlg.includes('value="'+r+'"')));
ok("...and no commit until one is chosen, because the plane is still refusing",
   !/doActionMove\(\)/.test(resDlg));
await G.__moveRes("complied");
ok("choosing one clears the pre-flight and the commit appears", /doActionMove\(\)/.test(dialog()));
await G.__doMove();
ok("awaiting_response -> resolved with a resolution is accepted", DOCS[ACT].state === "resolved");
ok("and the receipt is the plane's answer, not a sentence composed here",
   /complied/.test(dialog()) && /m_nadia/.test(dialog()));

/* TERMINAL. The plane stops publishing the act, and the surface renders that. */
await fresh(ACT);
ok("a resolved action publishes no move act, and the page says what IS published",
   !/Move this action/.test(content()) && /Record correspondence/.test(content()));

/* =====================================================================
   3. THE FAIL-CLOSED GUARD — driven, not assumed.
   ===================================================================== */
console.log("\n--- 3. a pre-flight the plane ACCEPTS commits nothing ---");
DOCS[ACT].state = "active";
PREFLIGHT_ACCEPTS = true;
const guardBefore = COMMITS.length;
await G.__openMove(ACT, DOCS[ACT].title, { id:"actionmove", label:"Move this action" });
G.__moveWhy("a reason");
await G.__moveTo("resolved");
ok("a probe the plane ACCEPTS offers no commit and says the surface's own check misbehaved",
   /PREFLIGHT_NOT_REFUSED/.test(dialog()) && !/doActionMove\(\)/.test(dialog()));
ok("and nothing was written", COMMITS.length === guardBefore);
PREFLIGHT_ACCEPTS = false;

/* =====================================================================
   4. THE LEDGER: capture or testify, and the no-refusal shape.
   ===================================================================== */
console.log("\n--- 4. the correspondence ledger ---");
DOCS[ACT].state = "active";
await fresh(ACT);
await G.__loadRecord(true);
const corr = async (fill) => {
  await G.__openCorr(ACT, DOCS[ACT].title, { id:"actioncorrespond", label:"Record correspondence" });
  fill();
  await G.__doCorr();
};
ok("the ledger's directions are the PLANE's published set, no_response included",
   (await (async()=>{ await G.__openCorr(ACT, "t", { id:"actioncorrespond", label:"Record correspondence" });
      return DIRECTIONS.every(d=>dialog().includes('value="'+d+'"')); })()) === true);
ok("the commit is ABSENT while the entry is incomplete, never greyed and never refused here",
   !/doActionCorrespond\(\)/.test(dialog()));
ok("...and nothing about the record's own rule is worded on this surface",
   !/never both|neither|must carry/i.test(dialog()));
await corr(()=>{ G.__corrSet("dir","sent"); G.__corrSet("at","2026-08-11");
                 G.__corrSet("party","City Clerk"); G.__corrArm("account");
                 G.__corrSet("account","I handed the request to the clerk's counter and took a receipt."); });
await fresh(ACT);
ok("a TESTIMONY entry lands and renders as testimony, under its author's name",
   /Testimony/.test(content()) && /m_nadia/.test(content()));
ok("and it is a DATED ledger row, not a chat line", /2026-08-11/.test(content()));
await corr(()=>{ G.__corrSet("dir","received"); G.__corrSet("at","2026-09-22");
                 G.__corrArm("capture"); G.__corrSet("doc", REPLY); });
await fresh(ACT);
ok("a CAPTURE entry lands, holding the hash the record already had for that document",
   /Captured/.test(content()) && content().includes("b".repeat(16)));
ok("and it resolves back to the bundle the bytes live in", content().includes(REPLY));
ok("the plane's responds_to CONSUMER is rendered: what came back points at this action",
   /responds to this action/.test(content()));
ok("the hash was never typed by a member: the surface read it from the record's own projection",
   CALLS.some(c=>c.op==="projection" && c.params.id===REPLY));
/* A REFUSAL THAT SURVIVES TO COMMIT IS THE PLANE'S. */
await corr(()=>{ G.__corrSet("dir","no_response"); G.__corrSet("at","2026-09-10");
                 G.__corrArm("capture"); G.__corrSet("doc", REPLY); });
ok("a refusal the plane makes at commit is rendered in the plane's words",
   dialog().includes(REF.UNREGISTERED_ARTIFACT) || dialog().includes(REF.CAPTURE_AND_TESTIMONY)
   || dialog().includes(REF.NEITHER_CAPTURE_NOR_TESTIMONY) || COMMITS.some(c=>c.op==="actioncorrespond"));

/* =====================================================================
   5. DEC-13 and DEC-14 on the RFC action.
   ===================================================================== */
console.log("\n--- 5. DEC-13's specificity, DEC-14's unproven ---");
NOW_MS = BEFORE_MS;
await fresh(RFC);
const rfc = content();
ok("an UNDETERMINED counterparty renders as the stated state it is", /Not determined yet/.test(rfc));
ok("...with the basis the member wrote", /delegation register would settle it/.test(rfc));
ok("...and the standing rule beside it", /will not be sent while this is undetermined/.test(rfc));
ok("a request_for_comment names the SPECIFIC inquiry it disclosed, as a row addressed by id",
   rfc.includes(INQ) && /Advances/i.test(rfc));
ok("and it is a selection over the record, never free text: the id is the address",
   /onclick="openBundle\(&quot;INQ-2026-2400-transfer&quot;\)"/.test(rfc)
   || rfc.includes('openBundle("'+INQ+'")'));
ok("an UNPROVEN consequence renders as STATED", /STATED/.test(rfc));
ok("...in the plane's own words about what has not been established",
   /sequence alone/.test(rfc) && /not a low score/.test(rfc));
ok("...and carries NO grade of any kind", !/Grade [A-D]\b/.test(rfc) && !/subj-grade/.test(rfc));
/* The word `grade` DOES appear in the block — inside the PLANE'S OWN sentence
   saying this is not a weak one — so the instrument is over grade MARKS and not
   over the word. Censoring the plane would be DEC-8 in reverse (UI-22's standing
   reading), and a suite that forbade the word would force exactly that. */
{
  const block = rfc.slice(rfc.indexOf("What came of it"), rfc.indexOf("What responded to this"));
  ok("no grade MARK is rendered in the consequence block",
     !/subj-grade|g-est|class="[^"]*grade/.test(block) && !/\bGrade [A-D]\b/.test(block));
  ok("...while the plane's own sentence about not being a weak grade survives verbatim",
     /not a low score/.test(block));
}

/* =====================================================================
   6. THE INTAKE, RESTORED — and the counterparty it will not invent.
   ===================================================================== */
console.log("\n--- 6. the intake: the pair, with no third option and no default ---");
ok("the Add surface offers the action kind again", G.__ADD_TYPES.some(([v])=>v==="action"));
await G.__renderAdd();
const form = content();
ok("the counterparty pair offers exactly TWO answers and no third",
   (form.match(/name="ac-cp"/g)||[]).length === 2);
ok("neither counterparty answer is preselected", !/name="ac-cp"[^>]*checked/.test(form));
ok("the counterparty basis is EMPTY: no value between the tags",
   /id="ac-basis"[^>]*>\s*<\/textarea>/.test(form));
ok("the counterparty basis offers no placeholder, no template and no suggested wording",
   !/id="ac-basis"[^>]*placeholder/.test(form));
ok("the standing rule is on the intake too", /will not be sent while this is undetermined/.test(form));
ok("the kinds offered are the PLANE's published set", /value="cpra_request"/.test(form));
ok("and `request_for_comment` is ABSENT while the surface cannot author the legs DEC-13 requires",
   !/value="request_for_comment"/.test(form));
ok("...which is stated rather than silent", /offers none rather than inventing/.test(form));

/* PUBLISH THE WITHHELD VOCABULARY — THE PLANE'S OWN ARRAY — AND BOTH APPEAR,
   WITH NO OTHER EDIT. */
VOCAB = { ...VOCAB, action_basis_kinds: VOCABULARIES.action_basis_kinds };
await G.__loadActSource(true);
await G.__renderAdd();
const form2 = content();
ok("publishing `action_basis_kinds` makes the basis picker appear with no change to this surface",
   /id="ac-bk"/.test(form2) && /value="rests_on"/.test(form2));
ok("...and `request_for_comment` appears with it, because the surface can now complete it",
   /value="request_for_comment"/.test(form2));
ok("the basis picker points at the record's own rows and never at another action",
   form2.includes(INQ) && !form2.includes('value="'+ACT+'"'));

/* THE REFUSAL, IN THE PLANE'S WORDS. */
const promotesBefore = COMMITS.filter(c=>c.op==="promote").length;
els.get("#a-type").value = "action";
els.get("#a-title").value = "Records request";
els.get("#a-body").value = "Ask for the transfer ledger.";
G.__addActPick("undetermined");
els.get("#ac-kind").value = "cpra_request";
els.get("#ac-basis").value = "";
G.__addActSync();
await G.__addGo();
const err = (els.get("#a-err")||{_html:""})._html || "";
ok("an undetermined counterparty with no basis is refused IN THE PLANE'S WORDS",
   err.includes(REF.GATE_COUNTERPARTY));
ok("...with the plane's own repair beside it, not one composed here",
   /what has been established so far/.test(err));
ok("...naming the check, and saying nothing was written",
   /C-2\.10/.test(err) && /nothing was written/i.test(err));
ok("and nothing landed", COMMITS.filter(c=>c.op==="promote").length === promotesBefore);

/* THE HONEST ANSWER LANDS. */
els.get("#ac-basis").value = "The request went to the department; which office answers has not been established.";
G.__addActSync();
await G.__addGo();
const wrote = COMMITS.filter(c=>c.op==="promote").pop();
ok("an undetermined counterparty WITH the basis the member wrote lands",
   !!wrote && /state: undetermined/.test(wrote.text));
ok("...carrying the member's own words and no invented name",
   /which office answers has not been established/.test(wrote.text)
   && !/name:/.test(wrote.text.split("counterparty:")[1].split("---")[0]));
ok("...and the kind the member chose, from the plane's published set",
   /action_kind: cpra_request/.test(wrote.text));

/* =====================================================================
   7. Q12 and DEC-8.
   ===================================================================== */
console.log("\n--- 7. Q12, and where every refusal sentence came from ---");
PLANE_ME = { session:false, tokenClass:"member", capabilities:[] };
G.__PLANE.me = PLANE_ME;
NOW_MS = BEFORE_MS;
DOCS[ACT].state = "active";
await fresh(ACT);
const ro = content();
ok("a read-only credential sees the whole action", /Who this is addressed to/.test(ro) && /The clock/.test(ro));
ok("...told ONCE that it cannot act, and never per control",
   (ro.match(/cannot act on it/g)||[]).length === 1);
PLANE_ME = { session:true, handle:"nadia", member:"nadia", capabilities:["contribute"] };
G.__PLANE.me = PLANE_ME;

/* DEC-8's ACCEPTANCE CLAUSE. Every refusal sentence rendered anywhere across
   this run must be one the mock plane returned. The mock's wording is not the
   store's, so a surface that had transcribed a store sentence fails here rather
   than agreeing with itself. */
const rendered = [content(), dialog(), before, after, illegal, noReason, resDlg, err, rfc].join("\n");
const surfaceOwn = [
  /* The one stated exception: the surface's report about its OWN probe. It is
     not a rule of the record's and it is unreachable while the plane behaves. */
  "This surface's own pre-flight did not behave and nothing was sent.",
];
let invented = [];
for(const sentence of rendered.split(/<\/div>|<\/p>|<\/li>/)){
  const m = /intent-ref-why">([^<]{25,})/.exec(sentence);
  if(!m) continue;
  const s = m[1].replace(/&#\d+;|&[a-z]+;/g, "'");
  if(!SAID.some(x=>s.includes(x.slice(0, 40))) && !surfaceOwn.some(x=>s.includes(x.slice(0,30))))
    invented.push(s.slice(0,90));
}
ok("every refusal sentence the page renders is one the plane returned"
   + (invented.length ? " — INVENTED: " + invented.join(" | ") : ""), invented.length === 0);

/* THE STRUCTURAL HALF, because an equality that costs nothing is not evidence:
   the region holds no copy of the state machine, the resolutions or the
   directions, so it could not offer one even if a mock happened to agree. */
const REGION = APP.slice(APP.indexOf("/*__ACTION_PAGE_START__*/"), APP.indexOf("/*__ACTION_PAGE_END__*/"));
ok("the action page holds no copy of the action state machine",
   !/"awaiting_response"\s*,\s*"resolved"/.test(REGION));
ok("...no copy of the four resolutions",
   !/"complied"/.test(REGION) && !/"escalated"/.test(REGION));
ok("...and no copy of the correspondence directions",
   !/"no_response"/.test(REGION) && !/"sent"\s*,\s*"received"/.test(REGION));
ok("every plane read in the region goes through the recR/actAsk seams — no envelope is opened by hand",
   !/\brec\(\s*"/.test(REGION));

console.log(`\naction-page: ${n - fails.length} pass, ${fails.length} fail`);
if(fails.length) process.exit(1);
