/* connections-sidebar.test.mjs — UI-44, and its governing decision is DEC-52
 * as FINALLY RULED on 2026-08-07.
 *
 * ============================================================================
 * READ THIS FIRST: THIS SURFACE IS VERIFIED AGAINST FIXTURES, NOT AGAINST LIVE
 * MACHINE CONNECTIONS, AND THAT IS SAID HERE RATHER THAN LEFT TO BE INFERRED.
 * ============================================================================
 * The post-processing task scope that would produce LIVE machine connections
 * HAS NO ITEM and does not exist. `IS-BUILD-PLAN.md`'s own verdict says so —
 * *"the post-processing task scope that produces live machine connections for
 * UI-44 (DEC-52-final's write half) has no item and must be scoped"* — and
 * `QUEUE.md` carries it as THE ONE FLAGGED FOLLOW-UP. The plan's instruction is
 * that UI-44 either waits for it or ships FIXTURE-VERIFIED. It ships
 * fixture-verified.
 *
 * SO BE PRECISE ABOUT WHAT IS AND IS NOT PROVED HERE.
 *   PROVED: how this surface TREATS a machine-attributed connection — that the
 *     attribution is found by the control plane's own mint shape wherever it
 *     sits, that it is rendered before anything else and named verbatim, that
 *     review is one act over a set, and that nothing here gates a write.
 *   NOT PROVED: that any machine connection exists to treat. No op publishes
 *     one. Nothing below drives a plane.
 * A surface verified against fixtures is a real result. One that READS as
 * verified against live data is the overclaim class this project ranks worst,
 * which is why SECTION 0 does not merely say the producer is absent — it
 * MEASURES it, out of `bio-plane/src/store.mjs` and out of the plan. **When a
 * producer lands, SECTION 0 GOES RED and the next session must re-take this
 * claim rather than inherit it.** A caveat that cannot expire is a caveat
 * nobody re-reads.
 *
 * ============================================================================
 * WHAT DEC-52 FINALLY RULED, AND THE PROVISIONAL THIS SUITE CORRECTS
 * ============================================================================
 * Bob, 2026-08-07: *"allowing the machine to rule doesn't go against doctrine.
 * So it can rule."* A machine credential MAY declare a relation, resolve a
 * reference and thread a progression directly into the record.
 *
 * **THE SUPERSEDED PROVISIONAL, CORRECTED HERE AND NEVER EXEMPTED.** Until that
 * ruling, and recorded as `[BOB-4 — RULED 2026-08-07, PROVISIONAL]` in
 * `INVESTIGATIVE-SESSION.md` §14a, the standing rule was: *"the sidebar approval
 * (identify -> present -> member approves) remains the act of record for the
 * constitutive fields"*. DEC-52's decided entry reverses it in its own words:
 * *"The earlier provisional (sidebar approval as the act of record) is
 * SUPERSEDED as a gate; the sidebar remains a visibility and bulk-review
 * surface, not a required approval."*
 *
 * So the assertion UI-44 was carrying — *no machine connection stands until a
 * member approves it on this sidebar* — is FALSE as of 2026-08-07, and SECTION 3
 * asserts its INVERSE rather than dropping it: a connection's standing in the
 * record does not move when a member reviews it, and this surface holds no
 * control that could make it move. The old rule is written out here, with its
 * date and its reversal, because an assertion that is simply deleted is a rule
 * nobody is enforcing and nobody remembers deleting.
 *
 * **AND THE DESIGN DOC HAS NOT CAUGHT UP.** `INVESTIGATIVE-SESSION.md` still
 * carries the superseded `[BOB-4]` text at two sites. That is F9 in
 * `FINDINGS-WORKPLAN.md`, the plan places it on W0's lanes rather than on this
 * item, and it is DELEGATED in `CLAIMS.md`. SECTION 0 pins that it is still
 * stale, so the delegation cannot be quietly forgotten either.
 *
 * ============================================================================
 * WHAT THIS SUITE CAN AND CANNOT SEE — stated, because that sentence is what
 * lets the next reader tell a clean result from a walk looking in the wrong place
 * ============================================================================
 *   IT CAN see everything the renderers put in front of a member, because it
 *     drives the real functions out of the shipped `app.html` in a vm, and it
 *     compares rendered output rather than reading source for most arms.
 *   IT CAN see the mint prefixes drifting from the plane, because
 *     `MACHINE_STAMP_PREFIXES` is IMPORTED LIVE and compared, never retyped.
 *   IT CANNOT see whether a real producer would publish a connection in the
 *     shape these fixtures use. Nothing publishes one, so there is no shape to
 *     check against; the renderers are field-name-blind for exactly that reason
 *     and SECTION 2's over-strictness arm is the defence that matters.
 *   IT CANNOT see a defect in `aiSessionBlockHtml`, which renders a connection's
 *     values. That is UI-38's renderer, graded by `ai-session-wire.test.mjs`.
 *   IT CANNOT see CSS. A dress that a stylesheet undid would still pass the
 *     class arm, which is why the dress is pinned as a SENTENCE a member reads
 *     and not only as a class name.
 *
 * ============================================================================
 * EVERY FIXTURE VALUE IS DRAWN AT RUNTIME AND PRINTED
 * ============================================================================
 * "A hand copy agrees at ZERO COST" has cost this project several instruments.
 * No literal below is a value a renderer could match by having been written
 * with it. The principals, the ids and the payload values all come from
 * `Math.random()` and are PRINTED, so an assertion that passes did so against a
 * value that did not exist when `app.html` was written.
 *
 * ============================================================================
 * NEGATIVE CONTROL: seven arms — (1) strip the derived dress from a machine connection; (2) re-introduce approval as a write gate (the superseded provisional); (3) make bulk review N acts instead of one over the set; (4) neuter the attribution predicate; (5) drift the surface's mint prefixes from the plane's; (6) delete the carve-out marker that holds ai-session-wire's ARM S correction honest; (7) an over-strictness arm that must PASS. Every arm declared BEFORE it was armed, RUN through
 * `node civicos-ui/test/run.mjs` from the REPO ROOT (the WHOLE harness, never
 * this suite alone), each arm ALONE with the others held open, `app.html`
 * restored from a UNIQUELY-NAMED per-arm pristine copy and verified by sha256
 * AND by `cmp` with a byte-count floor after each.
 * See `NEGATIVE CONTROL RESULTS` at the FOOT of this file — it is written after
 * the arms were run, and the declaration and the result are deliberately kept
 * apart so a prediction cannot be edited to match an outcome.
 * ============================================================================
 */
import fs from "fs";
import vm from "vm";
import { appScript } from "./extract.mjs";
/* LIVE-IMPORTED, NEVER RETYPED. The control plane's own mint prefixes. A browser
   cannot import this module, so `app.html` holds a copy — and this import is
   what makes the copy safe: mint a third spelling in the plane and this suite
   fails rather than a machine quietly losing its attribution on the surface.
   The pattern is `ai-session-context.test.mjs`'s, over `RUN_STATUS`. */
import {
  MACHINE_STAMP_PREFIXES, MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX,
} from "../../bio-plane/checks/bio-checks.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }
function eq(msg, got, want){
  const same = JSON.stringify(got) === JSON.stringify(want);
  ok(`${msg}${same ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`, same);
}
/* THE FIREBREAK. A `TypeError` inside an assertion goes through NO assertion at
   all — it ends the module while the tally reads clean, and this project has
   six recorded sightings. A section that throws is a FAILURE NAMING ITSELF and
   the sections after it still run. The FOOT of this file also prints, so a
   missing tally is visible as a missing tally rather than as a pass. */
function section(name, fn){
  console.log("\n--- " + name + " ---");
  try{ fn(); }
  catch(e){ n++; fails.push(`${name} THREW: ${e && e.message}`); console.error(`  FAIL ${name} THREW: ${e && e.message}`); }
}

/* ============================================================
   THE SURFACE, IN A VM. The shipped `app.html`, its own functions, no mocks of
   anything this suite grades.
   ============================================================ */
const els = new Map();
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
    querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){},
    remove(){}, onclick:null, onchange:null };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}
const $$ = (s) => { if(!els.has(s)) els.set(s, el()); return els.get(s); };
/* NO `fetch`. Not an oversight and not a convenience: this item adds no plane
   read and no plane write, so a transport in this context would be a door
   nothing walks through. If any renderer below ever reaches for one, it throws
   here and the section names itself. */
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Map, Set, TextEncoder, Blob:class{}, IntersectionObserver:undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "SURFACES", "AI_CONNECTIONS_KEY", "AI_CONNECTION_MINT_PREFIXES",
  "aiConnectionMachinePrincipals", "aiConnectionAttribution", "aiConnectionDressHtml",
  "aiConnectionCardHtml", "aiConnectionsSelected", "aiConnectionsSelectionBind",
  "aiConnectionsSelectionToggle", "aiConnectionsReviewMotion", "aiConnectionsSidebarHtml",
  "aiConnectionsReviewGo", "aiSessionPanelHtml",
].join(",") + "};", ctx);
const U = ctx.__U;

const APP = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
const STORE = fs.readFileSync(new URL("../../bio-plane/src/store.mjs", import.meta.url), "utf8");
const PLAN = fs.readFileSync(new URL("../../docs/development/IS-BUILD-PLAN.md", import.meta.url), "utf8");
const ISDOC = fs.readFileSync(new URL("../../docs/development/INVESTIGATIVE-SESSION.md", import.meta.url), "utf8");

/* THE REGION. Every source-reading arm below reads THIS and nothing wider, and
   its own reach is asserted, because a span-anchored walk that took the wrong
   bytes reports clean over bytes that could not have carried what it sought. */
const REGION = (() => {
  const m = /\/\*__AI_CONNECTIONS_START__\*\/([\s\S]*?)\/\*__AI_CONNECTIONS_END__\*\//.exec(APP);
  return m ? m[1] : "";
})();

/* ---- fixtures, DRAWN AT RUNTIME AND PRINTED ---- */
const R = () => Math.random().toString(36).slice(2, 10);
const RUN_A = "RUN-" + R(), RUN_B = "RUN-" + R();
/* The machine principals. Composed from the PLANE'S OWN prefixes so a renamed
   prefix moves the fixture too — a fixture that hard-coded `token:ai` would
   keep passing over a surface that had stopped recognising it. */
const P_TOKEN = MACHINE_AUTHOR_PREFIX + "ai";
const P_CLASS = MACHINE_CLASS_PREFIX + R();
const MEMBER_ID = "m_" + R();
const V1 = R(), V2 = R(), V3 = R(), V4 = R(), V5 = R();

/* THE MACHINE CONNECTION. Its principal sits under a key NOTHING in `app.html`
   anticipates and NESTED, which is the whole point of finding an identity by
   the shape of its value rather than by the name of its field. */
const CONN_MACHINE = { subject: V1, relation: V2, ruled: { by_whom_exactly: P_TOKEN, at: V3 } };
/* THE NOT-MACHINE CONNECTION. A member id is NOT a control-plane mint, so this
   surface must not dress it as the machine's — and must not claim a person
   either, because it cannot see that. */
const CONN_MEMBER = { subject: V4, relation: V2, stated_by: MEMBER_ID };
/* THE OVER-STRICTNESS FIXTURE: a mint spelling nobody here anticipated, buried
   inside an ARRAY of objects. Correct work in a shape this file did not
   predict must PASS. */
const CONN_ODD = { subject: V5, chain: [{ hop: 1, who: P_CLASS }, { hop: 2, note: V2 }] };

const SESSION_A = { id: RUN_A, context: { type: "inquiry", id: "INQ-" + R() },
                    [U.AI_CONNECTIONS_KEY]: [CONN_MACHINE, CONN_MEMBER, CONN_ODD] };
const SESSION_B = { id: RUN_B, context: { type: "inquiry", id: "INQ-" + R() },
                    [U.AI_CONNECTIONS_KEY]: [CONN_MACHINE] };

console.log("connections-sidebar (UI-44) — FIXTURE-VERIFIED; no plane is driven and no op publishes a connection today");
console.log(`  fixtures drawn at runtime: runs ${RUN_A} / ${RUN_B}; machine principals ${P_TOKEN} and ${P_CLASS}; `
          + `member id ${MEMBER_ID}; payload values ${[V1,V2,V3,V4,V5].join(" ")}`);

/* The one route from a session to what a member sees. Every render arm goes
   through THIS, so no arm can pass against a path the product does not use. */
const render = (session) => U.aiConnectionsSidebarHtml(session);
const text = (h) => String(h).replace(/<[^>]*>/g, " ");

/* ============================================================
   SECTION 0 · FIXTURE-VERIFIED, AND IT IS MEASURED RATHER THAN ASSERTED
   ============================================================ */
section("SECTION 0 · the producer does not exist, measured", () => {
  /* `aiRunRead` is the ONE op this surface's session object comes from. Its span
     is taken by brace-matching from its own signature, and the span's reach is
     asserted before anything is concluded from it. */
  const at = STORE.indexOf("async aiRunRead(");
  ok("ARM P0 (REACH): `aiRunRead` was located in bio-plane/src/store.mjs — an arm that cannot find its subject "
     + "must not report a clean answer about it", at >= 0);
  let span = "";
  if(at >= 0){
    /* PAST THE PARAMETER LIST FIRST. The signature destructures — `async
       aiRunRead({ run, viewer = null } = {})` — so the first `{` after the name
       is the PARAMETER's, and a brace walk started there takes 38 bytes and
       concludes, cleanly and wrongly, that the run reader publishes nothing.
       That is precisely the wrong-span failure ARM P0b exists to catch, and it
       caught its own author on the first run rather than being reasoned about. */
    let p = STORE.indexOf("(", at), pd = 0, afterParams = p;
    for(let j = p; j < STORE.length; j++){
      if(STORE[j] === "(") pd++;
      else if(STORE[j] === ")"){ pd--; if(pd === 0){ afterParams = j; break; } }
    }
    let i = STORE.indexOf("{", afterParams), depth = 0, end = i;
    for(; i < STORE.length; i++){
      if(STORE[i] === "{") depth++;
      else if(STORE[i] === "}"){ depth--; if(depth === 0){ end = i; break; } }
    }
    span = STORE.slice(at, end + 1);
  }
  console.log(`  ARM P corpus: ${span.length} chars of aiRunRead's own body`);
  ok(`ARM P0b (REACH): the span is ${span.length} chars and carries the run reader's own published blocks, floor 800 — `
     + `a span-anchored walk that took the wrong bytes would report a clean answer over bytes that could not have `
     + `carried a connection either`,
     span.length >= 800 && span.includes("standard:") && span.includes("principal"));
  /* THE MEASUREMENT. `op=airun` publishes no connections collection, so nothing
     this sidebar renders can have come from the record today. */
  ok(`ARM P1: op=airun publishes NO '${U.AI_CONNECTIONS_KEY}' collection, so this surface is verified against fixtures `
     + `and could not have been verified against live machine connections. WHEN A PRODUCER LANDS THIS ARM GOES RED, `
     + `and that is the point — the next session re-takes the claim instead of inheriting it`,
     span.length > 0 && !new RegExp(`\\b${U.AI_CONNECTIONS_KEY}\\s*:`).test(span));
  /* AND THE PLAN STILL SAYS SO. Two independent sources for one fact: the code
     and the record of what is scheduled. */
  ok("ARM P2: IS-BUILD-PLAN.md still records that the post-processing task scope producing live machine connections "
     + "for UI-44 HAS NO ITEM. If it is ever scoped, this arm fails and the fixture caveat above must be re-taken",
     /post-processing task scope[\s\S]{0,200}has no item/i.test(PLAN));
  /* F9, PINNED SO THE DELEGATION CANNOT BE LOST. The design doc still carries
     the provisional this suite corrects. */
  ok("ARM P3: INVESTIGATIVE-SESSION.md STILL carries the superseded `[BOB-4]` provisional (the sidebar approval as the "
     + "act of record). That is F9, it belongs to the design-doc lane rather than to this item, and it is DELEGATED "
     + "in CLAIMS.md — pinned here so a stale doc beside a corrected surface stays visible rather than forgotten",
     ISDOC.includes("[BOB-4") && /sidebar approval/i.test(ISDOC));
});

/* ============================================================
   SECTION 1 · THE MINT PREFIXES ARE THE PLANE'S, NOT THIS FILE'S OPINION
   ============================================================ */
section("SECTION 1 · the machine is recognised by the control plane's own mint", () => {
  ok(`ARM M0 (REACH): ${MACHINE_STAMP_PREFIXES.length} mint prefixes were imported LIVE from `
     + `bio-plane/checks/bio-checks.mjs, floor 2 — an empty import would make M1 vacuous`,
     MACHINE_STAMP_PREFIXES.length >= 2);
  eq("ARM M1: app.html's `AI_CONNECTION_MINT_PREFIXES` is the SAME SET as the plane's `MACHINE_STAMP_PREFIXES`. A "
     + "browser cannot import the catalogue, so the copy is unavoidable — this arm is what makes it safe. Mint a third "
     + "spelling in the plane and the build FAILS here rather than a machine silently losing its attribution",
     [...U.AI_CONNECTION_MINT_PREFIXES].sort(), [...MACHINE_STAMP_PREFIXES].sort());
  ok("ARM M2: and the surface holds NO list of class words. REC-46 measured that a word list let `token:member` through "
     + "the door that refused `agent`; the fix was one predicate over the mint SHAPE, and this surface asks the same "
     + "question the same way",
     !/NON_MEMBER_AUTHORS|ACTOR_CLASSES/.test(REGION)
     && !/\bdaemon\b|\bapps-script\b|\baccelerator\b/.test(REGION));
});

/* ============================================================
   SECTION 2 · D-82 — A MACHINE CONNECTION IS VISIBLY THE MACHINE'S
   This is the item's headline and the first negative control's subject.
   ============================================================ */
const MACHINE_SENTENCE_HEAD = "Identified by the machine and written into the record as the machine";
const MACHINE_SENTENCE_TAIL = "No member judged it. It stands in the record now, and reviewing it here does not change whether it stands.";
const UNATTRIBUTED_SENTENCE = "The record published no machine identity on this one, so this surface does not say who stated it. "
  + "That is what it can see, not a judgement that a person did.";

section("SECTION 2 · D-82, the derived dress", () => {
  const machineCard = U.aiConnectionCardHtml(CONN_MACHINE, 0, false);
  const memberCard = U.aiConnectionCardHtml(CONN_MEMBER, 1, false);
  const oddCard = U.aiConnectionCardHtml(CONN_ODD, 2, false);
  console.log(`  ARM D corpus: three cards rendered, ${machineCard.length} / ${memberCard.length} / ${oddCard.length} chars`);
  ok("ARM D0 (REACH): all three cards rendered markup, floor 200 chars each — a renderer answering nothing would make "
     + "every arm below pass for free",
     machineCard.length > 200 && memberCard.length > 200 && oddCard.length > 200);

  /* THE PINS ARE ON THE SENTENCES A MEMBER READS, not on a class name. A dress
     carried only by CSS is a dress a stylesheet can undo. */
  ok("ARM D1: the machine connection carries the machine dress, VERBATIM — the sentence is pinned rather than swept, "
     + "because a token sweep would accept any rewording of the one thing a member must not misread",
     text(machineCard).includes(MACHINE_SENTENCE_HEAD) && text(machineCard).includes(MACHINE_SENTENCE_TAIL));
  /* THE PRINCIPAL IS ASSERTED INSIDE THE DRESS, NOT MERELY SOMEWHERE ON THE
     CARD. `aiSessionBlockHtml` prints every published value, so the principal
     appears on the card anyway — an arm that only asked "is it on the card"
     would stay GREEN with the whole dress deleted, which is an outcome that
     costs nothing to produce. Measured: it did exactly that on the first pass of
     negative control (1). */
  const dressOnly = U.aiConnectionDressHtml(CONN_MACHINE);
  ok(`ARM D2: and THE DRESS ITSELF names the principal the record named, verbatim (${P_TOKEN}) — DEC-55 det 4 / `
     + `D-199.4: the record names the machine principal, never a person's name`,
     dressOnly.includes(P_TOKEN) && dressOnly.includes(MACHINE_SENTENCE_HEAD));
  ok("ARM D3: the machine card also carries the structural dress (`ai-conn-machine`), so the distinction survives a "
     + "reader who is scanning rather than reading", /class="ai-conn ai-conn-machine"/.test(machineCard));
  /* PRESENT **AND** BEFORE. A bare `indexOf(a) < indexOf(b)` is TRUE when `a` is
     missing entirely (-1 is less than everything), so the ordering arm would
     have passed with the dress deleted — the arm's own subject gone and the arm
     reporting clean. Corrected before the control was run rather than after it. */
  ok("ARM D4: THE ATTRIBUTION IS READ FIRST. The dress is present AND stands BEFORE the connection's values, so a "
     + "member cannot take in what the connection says before learning who said it",
     machineCard.indexOf(MACHINE_SENTENCE_HEAD) >= 0 && machineCard.indexOf(V1) >= 0
     && machineCard.indexOf(MACHINE_SENTENCE_HEAD) < machineCard.indexOf(V1));
  ok("ARM D5: a machine connection NEVER carries the unattributed sentence — the two states are exclusive and a card "
     + "carrying both would say the record both did and did not name a machine",
     !text(machineCard).includes(UNATTRIBUTED_SENTENCE));

  /* THE OTHER STATE, AND UNDETERMINED IS STATED RATHER THAN BLANK. */
  ok("ARM D6: a connection carrying no control-plane mint gets NO machine dress — neither the sentence nor the class. "
     + "A member's id is not a mint and must never be dressed as one",
     !text(memberCard).includes(MACHINE_SENTENCE_HEAD) && !/ai-conn-machine/.test(memberCard));
  ok("ARM D7: and it is not left BLANK either. The record published no machine identity, that is STATED in the surface's "
     + "own words, and the words stop short of claiming a person did it — undetermined is first-class and must be said "
     + "(CLAUDE.md). A blank here would let an unattributed connection read as a member's by default, which is the exact "
     + "confusion D-82 exists to prevent",
     text(memberCard).includes(UNATTRIBUTED_SENTENCE));
  ok(`ARM D8 (POLARITY): the member id itself still reaches the member as a published value (${MEMBER_ID}), so D6's `
     + `clean answer is the attribution rule working rather than the card rendering nothing`,
     memberCard.includes(MEMBER_ID));

  /* OVER-STRICTNESS. Correct work in a spelling this file did not anticipate
     must PASS — an arm this project requires of every control set. */
  ok(`ARM D9 (OVER-STRICTNESS): a mint spelling nobody here anticipated (${P_CLASS}), nested inside an ARRAY OF `
     + `OBJECTS under a key nothing in app.html knows, is STILL attributed and STILL named. A surface that recognised `
     + `only the shapes its author imagined would go blind the day a producer chose another one`,
     text(oddCard).includes(MACHINE_SENTENCE_HEAD) && oddCard.includes(P_CLASS)
     && /ai-conn-machine/.test(oddCard));
  eq("ARM D10: the predicate answers with the record's own words for the principal, verbatim and de-duplicated, and "
     + "answers EMPTY where there is no mint — one function, three subjects, no branch over any field name",
     [U.aiConnectionMachinePrincipals(CONN_MACHINE), U.aiConnectionMachinePrincipals(CONN_MEMBER),
      U.aiConnectionMachinePrincipals(CONN_ODD)],
     [[P_TOKEN], [], [P_CLASS]]);
});

/* ============================================================
   SECTION 3 · DEC-52 FINAL — NO APPROVAL GATE.
   THIS IS THE CORRECTED PROVISIONAL. See the header: until 2026-08-07 the rule
   was that the sidebar's approval WAS the act of record, and the assertion UI-44
   carried was that no connection stands until a member approves it here. That
   is now FALSE. It is corrected — its inverse is asserted — and not exempted.
   ============================================================ */
const PENDING_WORDS = [
  [/\bpending\b/i, "the superseded provisional's own word for a connection waiting on a member"],
  [/\bawaiting\b/i, "the same claim, one word over"],
  [/\bnot yet (?:in|part of|recorded)\b/i, "a claim that the record does not hold it"],
  [/\bunconfirmed\b/i, "a claim that somebody still has to confirm it"],
  [/\bproposed\b/i, "the proposal vocabulary — a proposal decides nothing, and a machine ruling does"],
  [/\bapprove\b/i, "the gate the ruling removed"],
];

section("SECTION 3 · the sidebar is visibility and review, never a gate", () => {
  const none = render(SESSION_A);
  /* Select EVERYTHING, then render again. */
  U.aiConnectionsSelectionToggle(0, true);
  U.aiConnectionsSelectionToggle(1, true);
  U.aiConnectionsSelectionToggle(2, true);
  const all = render(SESSION_A);
  ok(`ARM G0 (REACH): both renders produced a sidebar, ${none.length} and ${all.length} chars, floor 400 — two empty `
     + `strings would be "identical" for free`, none.length > 400 && all.length > 400);

  /* THE ANTI-GATE ARM, AND IT IS THE ITEM'S SECOND NEGATIVE CONTROL. Strip the
     selection out of both renders and what is left — every word about what the
     connection is and who made it — must be BYTE-IDENTICAL. A surface where
     review changed a connection's standing could not pass this. */
  const stripSel = (h) => String(h).replace(/<label class="ai-conn-sel">[\s\S]*?<\/label>/g, "");
  eq("ARM G1 (THE CORRECTED PROVISIONAL, 2026-08-07): reviewing changes NOTHING about how the record's holding of a "
     + "connection is presented. With nothing selected and with everything selected, every word about what each "
     + "connection is and who made it is byte-identical. Under the SUPERSEDED provisional this arm would have been the "
     + "opposite assertion — that an unapproved connection reads as not yet standing — and that rule was reversed by "
     + "DEC-52's decided entry, so it is corrected here rather than removed",
     stripSel(none), stripSel(all));
  ok("ARM G1b (POLARITY): the two renders DO differ before the selection is stripped, so G1's equality is the standing "
     + "being independent of review and not the comparison being vacuous", none !== all);

  /* NO WRITE EXISTS TO GATE. Read the region's source: this sidebar reaches no
     transport at all, so it could not condition a write even if it wanted to. */
  const transports = [...REGION.matchAll(/\b(recPostR|recPost|recR|rec|apiR|apiQ|api|actAsk|intentAsk|fetch)\s*\(/g)]
    .map(m => m[1]);
  ok(`ARM G2 (REACH): the connections region is ${REGION.length} chars, floor 1500 — a region the matcher could not `
     + `find would report no transports for free`, REGION.length >= 1500);
  eq("ARM G2b: the connections sidebar reaches NO transport. It performs no read and no write, so there is no write "
     + "for a review to gate — the superseded provisional could not walk back in here even by accident",
     transports, []);

  /* AND IT DOES NOT SAY THE OLD RULE IN WORDS EITHER. */
  /* SWEPT OVER BOTH RENDERS, AND THE REASON IS A MEASUREMENT RATHER THAN
     CAUTION. The first draft swept only the all-selected render, and negative
     control (2) — the superseded provisional walked back in as *"Pending: this
     connection does not stand until it is approved here"* — DID NOT TRIP IT,
     because the planted gate only spoke about the UNREVIEWED state, which is the
     only state a gate ever speaks about. An arm looking exclusively at the
     reviewed render is looking in the one place a gate never appears. G1 caught
     the arm anyway; this is now caught twice, by two different rules. */
  const hits = [];
  for(const [where, h] of [["nothing selected", none], ["everything selected", all]])
    for(const [re, what] of PENDING_WORDS){
      const m = re.exec(text(h));
      if(m) hits.push(`${where}: ${what} — '${m[0]}'`);
    }
  eq("ARM G3: not one word on this surface tells a member the record is waiting for them. A connection the machine was "
     + "licensed to rule on is IN the record, and a member who believes otherwise will not go looking for what is "
     + "already there: " + (hits.join(" | ") || "clean"), hits, []);
  ok("ARM G3b (POLARITY): the same matcher DOES catch those words when they are there, so G3's clean answer is a "
     + "measurement rather than a broken regex",
     PENDING_WORDS.some(([re]) => re.test("this connection is pending approval")));

  /* THE COMMIT SAYS SO AND WRITES NOTHING. */
  const note = $$("#ai-conns-note");
  const count = U.aiConnectionsReviewGo();
  ok("ARM G4 (REACH): the review control ran over the selected set and reported its size", count === 3);
  ok("ARM G4b: with no op to record a review, the commit SAYS SO and writes nothing — and it says the part that "
     + "matters, that these connections are already in the record. A control that looked like it recorded something "
     + "is the defect this project ranks worst",
     /nothing was written/i.test(note.textContent) && /already in the record/i.test(note.textContent));
});

/* ============================================================
   SECTION 4 · BULK REVIEW IS THE SAME ACT OVER A SET
   DEC-52, Bob 2026-08-06: *"bulk approval is not a weaker act than individual
   approval — it is the same act over a set."*
   ============================================================ */
section("SECTION 4 · one act, over a set", () => {
  const rows = SESSION_A[U.AI_CONNECTIONS_KEY];
  const many = U.aiConnectionsReviewMotion(rows, [0, 2]);
  const one = U.aiConnectionsReviewMotion(rows, [1]);
  console.log(`  ARM B corpus: ${rows.length} published connections; motions over 2 and over 1`);
  ok("ARM B0 (REACH): the fixture carries more than one connection, floor 2 — a set arm over a single row proves "
     + "nothing about sets", rows.length >= 2);
  ok("ARM B1: reviewing a SET produces ONE motion naming every member of it — never one motion per connection. N "
     + "motions over N connections is the forty-dialogs shape wearing a bulk control's clothes",
     Object.keys(many).length === 1 && Array.isArray(many.reviewed) && many.reviewed.length === 2);
  eq("ARM B2: and the motion carries the RECORD'S OWN published objects, whole — not an index, not an id this surface "
     + "invented, not a summary it composed", many.reviewed, [rows[0], rows[2]]);
  eq("ARM B3: a set of one takes the SAME route and produces the SAME shape. Bulk review is not a second, weaker act "
     + "and there is not a second code path in which it could become one",
     Object.keys(one), Object.keys(many));
  eq("ARM B4: the published ORDER is the record's, whatever order the member happened to tick things in",
     U.aiConnectionsReviewMotion(rows, [2, 0]).reviewed, [rows[0], rows[2]]);
  eq("ARM B5: a selection naming something the record did not publish is DROPPED rather than fabricated into a row",
     U.aiConnectionsReviewMotion(rows, [99, -1, 0, "x"]).reviewed, [rows[0]]);
  eq("ARM B6: an empty selection is an empty motion, and it is a real answer rather than an error",
     U.aiConnectionsReviewMotion(rows, []).reviewed, []);
});

/* ============================================================
   SECTION 5 · A SELECTION IS NOT AN ATTRIBUTION EITHER
   ============================================================ */
section("SECTION 5 · the selection belongs to the run it was made on", () => {
  /* Start on the OTHER run so this section owns its own starting state. Section
     3 left a selection on run A, and an arm that silently inherited it read
     `[0,1,2]` where it declared `[0,1]` — caught by ARM X0, which is a REACH arm
     and did its job on its author. */
  render(SESSION_B);
  render(SESSION_A);
  U.aiConnectionsSelectionToggle(0, true);
  U.aiConnectionsSelectionToggle(1, true);
  eq("ARM X0 (REACH): the selection really was made on run A", U.aiConnectionsSelected().sort(), [0, 1]);
  render(SESSION_B);
  eq("ARM X1: rendering a DIFFERENT run drops the selection. A position is meaningless against another answer, so a "
     + "carried-over tick would put a mark beside a connection nobody chose — the surface asserting a member's choice "
     + "they did not make, which is the same class of defect as asserting an attribution nobody made",
     U.aiConnectionsSelected(), []);
  render(SESSION_A);
  eq("ARM X2 (POLARITY): and coming back to run A does not resurrect it either — the reset is a reset, not a stash",
     U.aiConnectionsSelected(), []);
});

/* ============================================================
   SECTION 6 · DEC-32 CLAUSE 1 / D-226 — THE ANALYST'S VOCABULARY REACHES NO
   MEMBER. The patterns are `elicitation.test.mjs`'s, deliberately, so the ban
   has ONE spelling in this directory and a second surface is judged by the same
   rule rather than by a copy of it.
   ============================================================ */
section("SECTION 6 · no analyst vocabulary on any surface this item renders", () => {
  const BANNED = [
    [/\bground/i,             "the analyst's noun for a set of reasons"],
    [/\bdisjunct/i,           "the analyst's word for the relationship"],
    [/\bbranch/i,             "the analyst's word for one of them"],
    [/\b(AND|OR)\b/,          "the connective, as vocabulary"],
    [/\b(and|or)-related\b/i, "the relationship, named"],
    [/\bpartition/i,          "DEC-32's banned noun, named by D-226"],
  ];
  const SURF = [
    ["the sidebar, nothing selected", render(SESSION_A)],
    ["one machine connection", U.aiConnectionCardHtml(CONN_MACHINE, 0, false)],
    ["one unattributed connection", U.aiConnectionCardHtml(CONN_MEMBER, 1, true)],
    ["one connection whose mint nobody anticipated", U.aiConnectionCardHtml(CONN_ODD, 2, false)],
    ["the machine dress alone", U.aiConnectionDressHtml(CONN_MACHINE)],
    ["the unattributed dress alone", U.aiConnectionDressHtml(CONN_MEMBER)],
    ["the whole running-session panel with the sidebar in it", U.aiSessionPanelHtml(SESSION_A, null)],
  ];
  const hits = [];
  for(const [where, h] of SURF){
    const t = text(h);
    for(const [re, what] of BANNED) if(re.test(t)) hits.push(`${where}: ${what} — ${(re.exec(t)||[])[0]}`);
  }
  console.log(`  ARM V corpus: ${SURF.length} rendered surfaces, ${SURF.reduce((a,[,h])=>a+String(h).length,0)} chars`);
  ok(`ARM V0 (REACH): ${SURF.length} surfaces were swept and every one is non-empty, floor 6 — a sweep over nothing `
     + `reports clean`, SURF.length >= 6 && SURF.every(([, h]) => String(h).length > 0));
  eq("ARM V1: not one analyst word reaches a member on any surface this item renders: " + (hits.join(" | ") || "clean"),
     hits, []);
  ok("ARM V2 (POLARITY): the same matcher catches a planted hit, so V1 is a measurement rather than a silence",
     BANNED.some(([re]) => re.test("the ground partition of this OR-related set")));
});

/* ============================================================
   SECTION 7 · THE SIDEBAR IS PART OF THE RUNNING-SESSION SURFACE, AND THE
   REGISTRY STILL SAYS THERE IS EXACTLY ONE OF ITS KIND
   ============================================================ */
section("SECTION 7 · one surface, and the sidebar is on it", () => {
  const panel = U.aiSessionPanelHtml(SESSION_A, null);
  ok("ARM K0: the sidebar reaches a member THROUGH the running-session panel. A renderer with no call site is the "
     + "undelivered-promise shape UI-47's sweep found one item over, and it is what this arm exists to refuse",
     panel.includes("ai-conns") && panel.includes(P_TOKEN));
  ok("ARM K1: a run publishing NO connections renders NO sidebar and no notice — a 'nothing found' line would be a "
     + "claim about the record made by a surface that asked nothing, and it would be doubly wrong while no producer "
     + "exists at all",
     U.aiConnectionsSidebarHtml({ id: RUN_A, context: SESSION_A.context }) === ""
     && !U.aiSessionPanelHtml({ id: RUN_A, context: SESSION_A.context }, null).includes("ai-conns"));
  const kinds = Object.values(U.SURFACES).filter(s => s && s.kind === "ai-session");
  eq("ARM K2: there is still EXACTLY ONE surface of kind `ai-session`. DEC-52's sidebar is the second CONSUMER of the "
     + "one running-session surface, never a second surface — and `surface-registry.test.mjs` fails a second one "
     + "independently of this arm", kinds.length, 1);
  ok("ARM K3: and the registry entry SAYS the sidebar is there, so the described surface still equals the real one",
     /connections/i.test(U.SURFACES["ai-session"].purpose));
  eq("ARM K4: the sidebar added NO plane read to the registry entry, because it added none to the surface — it renders "
     + "the run object `op=airun` already answered", U.SURFACES["ai-session"].reads, ["airun"]);
  eq("ARM K5: and it declares NO act. There is no plane act for reviewing a machine connection, and naming one that "
     + "does not exist is what the registry's own validator refuses", U.SURFACES["ai-session"].acts, []);
});

/* ============================================================
   THE FOOT. It prints on every path, so a tally that is MISSING is visible as
   missing rather than as a pass — a `TypeError` inside an assertion goes through
   no assertion at all, and this project has paid for that six times.
   ============================================================ */
console.log(`\nconnections-sidebar: ${n - fails.length}/${n} assertions`);
console.log("connections-sidebar: FIXTURE-VERIFIED — no plane was driven; no op publishes a machine connection today "
          + "(SECTION 0 measures this, and goes RED when a producer lands)");
if(fails.length){ console.error(`connections-sidebar: ${fails.length} FAILED`); process.exit(1); }

/* ============================================================================
 * NEGATIVE CONTROL RESULTS — written AFTER the arms were run, deliberately kept
 * apart from the declaration in the header so a prediction could not be edited
 * to match an outcome. Each arm was armed ALONE with the others held open, run
 * through `node civicos-ui/test/run.mjs` from the REPO ROOT, and `app.html`
 * restored from a uniquely-named per-arm pristine copy verified by sha256 AND by
 * `cmp`, with a byte-count floor.
 *
 * RUN 2026-08-09 by ui44-agent. Clean tree FIRST: exit 0, 42 harnesses, this
 * suite 47/47. Then each arm RED, never the reverse. `app.html`'s sha256 before
 * the whole harness and after every restore:
 * `cfa21e76605618ac4f5b8128e3298e2185ed038e1b91cccfd85c5327b38917d3`.
 *
 * (1) STRIP THE DERIVED DRESS FROM A MACHINE CONNECTION — the plan row's own
 *     first control. `aiConnectionDressHtml` returns "" on the machine branch.
 *     DECLARED must fail: D1, D2, D4, D9. ACTUAL: **exit 1, 42/47 — D1, D2, D4,
 *     D9 and, UNDECLARED, ARM V0.** V0 is the vocabulary sweep's REACH arm and it
 *     is right to fire: one of the surfaces it sweeps is the machine dress alone,
 *     which is now the empty string, and a sweep over an empty surface reports
 *     clean. Recorded rather than smoothed — an undeclared failure that is
 *     CORRECT is worth more written down than tidied into the prediction.
 *     **AND THE ARM THAT STAYED GREEN IS THE FINDING: D3 passed.** The
 *     `ai-conn-machine` CLASS survives the dress being deleted, so a member
 *     scanning sees a rule down the side of a card that now says nothing about
 *     who acted. That is exactly why D1/D2 pin the SENTENCE and not the class.
 *     **A SECOND FINDING, FOUND BY RUNNING THIS ARM AND FIXED BEFORE IT WAS
 *     RE-RUN:** D2 originally asked whether the principal appeared ANYWHERE on
 *     the card and D4 compared two `indexOf` results. Both passed with the dress
 *     deleted — the principal is a published value so the panel's own renderer
 *     prints it regardless, and `-1 < n` is true. Both are corrected in place
 *     (D2 is now scoped to the dress; D4 requires PRESENT AND BEFORE) and the
 *     arm re-run against the corrected suite, which is where the result above
 *     comes from.
 *
 * (2) RE-INTRODUCE APPROVAL AS A WRITE GATE — the SUPERSEDED provisional walked
 *     back in. An unreviewed card gains *"Pending: this connection does not
 *     stand until it is approved here."*
 *     DECLARED must fail: G1 and G3. ACTUAL, FIRST RUN: **exit 1, 46/47 — G1
 *     ONLY. G3 DID NOT FIRE, AND THAT IS THIS CONTROL'S REAL RESULT.** G3 swept
 *     only the render with everything selected, and a gate by its nature speaks
 *     only about the UNREVIEWED state — so the arm was looking in the one place
 *     a gate never appears. G3 is widened to sweep BOTH renders, with the reason
 *     at its site, and the arm RE-RUN: **exit 1, G1 AND G3, G3 naming
 *     `nothing selected` and quoting the planted word.** Two independent rules
 *     on one defect now: a structural equality and a vocabulary sweep.
 *
 * (3) BULK REVIEW AS N ACTS RATHER THAN ONE OVER THE SET. `aiConnectionsReviewMotion`
 *     returns an array of one-connection motions.
 *     DECLARED must fail: B1..B6. ACTUAL: **exit 1, 41/47 — B1, B2, B3, B4, B5,
 *     B6, exactly as declared.** Nothing outside SECTION 4 moved, which is the
 *     containment those arms claim.
 *
 * (4) NEUTER THE ATTRIBUTION PREDICATE. `aiConnectionMachinePrincipals` answers
 *     `[]` for everything.
 *     DECLARED must fail: D1, D3, D4, D5, D9, D10; must NOT fail: D6, D7, D8.
 *     ACTUAL: **exit 1, 40/47 — D1, D2, D3, D4, D5, D9, D10** (D2 additionally,
 *     because it is now dress-scoped) **and D6, D7, D8 GREEN**, correctly: the
 *     unattributed state is unchanged, so the polarity of the whole partition
 *     holds while the machine half collapses.
 *
 * (5) MINT DRIFT — the surface's copy of the control plane's prefixes loses
 *     `class:`. DECLARED must fail: M1 and D9; must NOT fail: D1.
 *     ACTUAL: **exit 1, 44/47 — M1, D9 and, undeclared, D10** (its expected
 *     principal list for the odd fixture becomes empty). **D1 GREEN**, correctly:
 *     the `token:` half still works, which is what makes this a DRIFT rather than
 *     a break and is exactly the silent half-failure M1 exists to catch.
 *
 * (6) DELETE THE CARVE-OUT MARKER `__AI_CONNECTIONS_END__` — the arm that proves
 *     the correction made to `ai-session-wire.test.mjs`'s ARM S is not an
 *     exemption. DECLARED must fail: that suite's S7 and S5.
 *     ACTUAL: **exit 1 — `ai-session-wire` 81 pass / 2 fail with S5 AND S7**,
 *     so a deleted marker widens nothing silently: the whole block falls back
 *     under the sweep and the reach arm names the missing region. This suite's
 *     G2 fails too (its region read is gone), which is correct.
 *     **AND THE ARM THAT STAYED GREEN IS A FINDING: S8 PASSED.** With the region
 *     missing there are no held-out functions, so "every held-out function is
 *     graded" is vacuously true. S7's floors are what carry that case, and S8 is
 *     load-bearing only while S7 is green. Written down rather than smoothed.
 *
 * (7) OVER-STRICTNESS, REQUIRED OF EVERY CONTROL SET HERE. `aiConnectionsReviewMotion`
 *     rewritten in a correct alternative spelling nobody here wrote — a `Set` of
 *     positions and an index walk instead of filter/sort/map.
 *     DECLARED: must PASS. ACTUAL: **exit 0, every suite green.** It must pass,
 *     and it does.
 *
 * ONE LIMIT OF THE NC HARNESS ITSELF, stated so a reader does not mistake it for
 * a missing tally: `test/run.mjs` captures a suite's stdout only when the suite
 * FAILS, so on the green rows above the harness could not read this suite's
 * `47/47` line. That is the reader's blind spot, not an absent foot — the suite
 * prints its tally on every path, and it was read directly on the clean tree.
 * ============================================================================ */
