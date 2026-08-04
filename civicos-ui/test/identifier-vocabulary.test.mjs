/* UI-34 — THE WORD THIS PRODUCT USES, IN FRONT OF A MEMBER, FOR THE IDENTIFIER
 * A MEMBER SIGNS IN WITH AND IS NAMED BY.
 *
 * ============================================================================
 * WHY THIS FILE EXISTS, AND WHAT IT DELIBERATELY DOES NOT ASSERT.
 * ============================================================================
 * UI-31 measured `handle` standing on the sign-in gate and classed it
 * INCIDENTAL — this surface's own word, which no answer to DEC-49 would ever
 * remove. UI-33 KEPT it, on the only ground a single-surface item had: it is the
 * name of that identifier everywhere else in the product, so rewording it at the
 * gate alone would give a member one word before signing in and another after.
 *
 * That reasoning says what the real item is. The word is renamed EVERYWHERE or
 * NOWHERE, and UI-34 decided: **NOWHERE. `handle` is KEPT, product-wide.** The
 * argument is recorded at the gate in `app.html` and at `pubVerifyPanel`, where
 * the next reader will meet the word; it is not repeated here.
 *
 * **THIS FILE PINS NO VALUE, AND THAT IS THE WHOLE DESIGN.** It never asserts
 * that the word is "handle". It asserts that there is EXACTLY ONE of it: every
 * member-visible site that names that identifier uses the same word as every
 * other. So the decision this file enforces is not "keep handle" — it is
 * "rename it everywhere or nowhere", which is the decision that was actually
 * made and the one that survives being reversed. Rename all of them tomorrow and
 * this file stays green. Rename SOME of them and it fails NAMING the sites that
 * did not move.
 *
 * A VALUE COMPARISON WOULD NOT DO THIS, and the reason is measured rather than
 * argued: three times in this project a surface has gone on answering correctly
 * at the site a test pinned while ADDITIONALLY answering wrongly somewhere the
 * test could not see (UI-30's instrument, REC-49's zero-firing arm, UI-28's
 * source-region read). `ok(label === "Member handle")` passes for all three of
 * those worlds. A check over a DISCOVERED SET, asserting that the set agrees
 * with itself, does not.
 *
 * ============================================================================
 * WHY THE WIRE FIELD IS THE ANCHOR.
 * ============================================================================
 * `handle` is the PLANE's field name — on `op=whoami`'s answer, and as a
 * parameter of `op=projectinvite`, `op=projectremove`, `op=projectowneradd` and
 * `op=projectownerrescue`. DEC-8 territory: a surface reword does not touch it,
 * an I3 interface change is what moves it, and UI-34 did not propose one. That
 * makes it the one name in this system that a wording change CANNOT move, so it
 * is what the site walk is anchored on. A site discovered through the wire field
 * cannot vanish from the walk at the moment somebody rewords it — which is
 * precisely how a rename gets to reach some sites and not others unnoticed.
 *
 * The DOM ids (`g-handle`, `ra-handle`) are the same kind of anchor one layer
 * out: code identifiers a wording change does not touch either.
 *
 * ============================================================================
 * THE THREE WALKS, AND EACH ONE'S OWN REACH IS ASSERTED.
 * ============================================================================
 *   WALK 1 — THE WIRE. `bio-plane/src/store.mjs` is read textually (it opens
 *     with `import … from "cloudflare:workers"` and cannot be imported, the same
 *     reason `preauth-vocabulary.test.mjs` and `check-semantics.mjs` read it
 *     textually). The field name is confirmed to be the plane's on the roster
 *     ops, so this file's anchor is the plane's fact and not this file's
 *     assumption. The read is GUARDED: an extraction that silently yielded
 *     nothing would make the anchor meaningless and everything below vacuous.
 *
 *   WALK 2 — THE DECLARED SITES, found in `app.html` through that anchor: the
 *     gate's `<label for="g-handle">`, and every act-catalog field whose WIRE
 *     name is the anchor. Add a sixth form that takes the field and this walk
 *     finds it with nobody editing a list; reword one and the walk still finds
 *     it, because it is anchored on the name that did not move.
 *
 *   WALK 3 — WHAT A MEMBER ACTUALLY READS. The four surfaces that name the
 *     identifier are RENDERED in a VM and harvested — the gate as served, the
 *     members & governance screen, the project workspace, and each roster act
 *     dialog that declares the field. Source is where a site is DECLARED;
 *     rendered HTML is where a member MEETS it, and the two are cross-checked
 *     against each other rather than either being trusted alone.
 *
 * THE LEXICON is a list of ALTERNATIVES — the words a rename would plausibly
 * choose — and it is NOT a list of forbidden words and NOT a pin on the chosen
 * one. Its only job is to recognise "this site names the identifier". Because a
 * rename could pick a word outside it, arm 3 below turns that into a LOUD
 * failure rather than a silent pass: a declared site that matches nothing in the
 * lexicon fails BY NAME, so the renamer extends the lexicon once, in one place,
 * and every other assertion here keeps working. That is the honest way to make a
 * word list not become the instrument's blind spot.
 *
 * WHAT THIS DOES NOT MEASURE, stated so nobody trusts it for more. It is scoped
 * to the member-visible naming of ONE identifier. It says nothing about the
 * OTHER thing this product calls a `handle` on the wire — the selection lease
 * (`op=select` answers one, `op=release` and `op=dispose` take one). That word
 * is never printed to a member: `finderPaintSelection` labels it "The record's
 * name for this set". That is the pattern this product already uses and it is
 * the right one — the wire keeps one word, and a surface names the thing in the
 * reader's terms only where the reader's framing differs from the wire's — but
 * it is a second subject and this file does not guard it.
 *
 * Run alone: `node test/identifier-vocabulary.test.mjs`.
 *
 * ============================================================================
 * A STATED LIMIT, MEASURED BY ARM (e) BELOW RATHER THAN GUESSED.
 * ============================================================================
 * A site reworded to a word OUTSIDE the lexicon is caught only where the guard
 * can tell the site should be there: at a DECLARED site (arm 1 names it), or on
 * a surface that then carries no identifier word at all (arm 2 names the
 * surface). A PROSE site reworded to an unknown word, on a surface that still
 * carries the word elsewhere, passes. Measured: with the participants table's
 * column header alone changed to "Sigil", this file runs GREEN, because that
 * surface's other sentence still says `handle`.
 * Closing that would mean every member-visible identifier label composing from
 * one declaration — and the gate's label is SERVED MARKUP, static HTML a member
 * reads before any script runs, which is a property worth more than this guard.
 * So it is a limit and is stated, not exempted. What it costs is bounded: the
 * word can drift on one surface that still uses it correctly elsewhere, which is
 * the smallest version of the defect and not the one UI-34 was queued for.
 *
 * NEGATIVE CONTROL: RUN 2026-08-04, seven arms, `app.html` restored
 * BYTE-IDENTICALLY after every one of them with sha256 compared before and after
 * (64fc94c6… each time). The arms are the drift shape this item exists for.
 *   (a) THE ITEM'S OWN — A RENAME THAT REACHES SOME SITES AND NOT OTHERS. The
 *       gate's label alone is reworded "Member handle" -> "Member username",
 *       which is exactly the change UI-33 declined to make at one surface.
 *       RUN: **1 of 18 FAILS**, and it NAMES both groups — "username" at 2 (the
 *       gate's declared label and the gate SURFACE) against "handle" at 10 (the
 *       four act-catalog labels by file and line, plus the members screen, the
 *       project workspace and all four act forms as rendered).
 *   (b) THE OTHER DIRECTION — the four act-catalog labels reworded while the
 *       gate is left alone. RUN: **1 of 18 FAILS**, "username" at 8 against
 *       "handle" at 5, naming the gate and the two prose surfaces as the ones
 *       that did not move. (a) and (b) together are why the assertion is
 *       agreement-among-a-set and not equality-to-a-constant: neither site is
 *       privileged, and the failure reads the same from either end.
 *   (c) A COMPLETE RENAME STAYS GREEN, which is what makes this a guard on the
 *       DECISION and not cement on the word — **AND THIS ARM FOUND A NINTH SITE
 *       NOBODY HAD COUNTED.** Run first over the eight sites a careful read of
 *       `app.html` had produced, it FAILED 1 of 18 with "handle" still standing
 *       at one place: `RENDERED · the project workspace`. The site is
 *       `projectParticipantsHtml`'s own COLUMN HEADER, `<th>Handle</th>` — which
 *       a hand inventory keyed on lowercase phrasings ("their handle", "a
 *       handle", "the handles of") cannot see, and which is a bare capitalised
 *       word in a template literal that no anchor reaches. **That is this item's
 *       own subject arriving in its own preparation**: a rename would have
 *       reached eight sites and left the ninth, and only the RENDER walk saw it.
 *       With all NINE reworded: **18 of 18 GREEN**, the report printing
 *       `username` at all twelve discovered sites and surfaces.
 *   (c2) THE SAME NINE IN TITLE CASE ("Username"), because a header and a label
 *       are capitalised differently and a case-sensitive guard would have made
 *       one of the two impossible. RUN: **18 of 18 GREEN**.
 *   (d) A RENAME TO A WORD THE LEXICON DOES NOT KNOW — the gate's label becomes
 *       "Member sigil". RUN: **2 of 18 FAIL**: the declared-site arm names
 *       app.html:777 as naming the identifier with a word this guard cannot
 *       recognise, and the gate SURFACE arm names it as having stopped carrying
 *       any identifier word at all. This is the arm that keeps the lexicon from
 *       being the blind spot — an unknown word is loud, not silent.
 *   (e) THE LIMIT ABOVE, MEASURED. The COLUMN HEADER alone becomes "Sigil".
 *       RUN: **18 of 18 GREEN** — it is not a declared site, and its surface
 *       still says `handle` in the sentence below it. Recorded as the arm that
 *       establishes what this guard does not cover, rather than left for a later
 *       session to discover as a surprise.
 */
import fs from "fs"; import vm from "vm"; import path from "path";
import { webcrypto } from "crypto";
import { fileURLToPath } from "url";
import { appScript } from "./extract.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const UIROOT = path.dirname(HERE);

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

const APP_SRC = fs.readFileSync(path.join(UIROOT, "app.html"), "utf8");
const SCRIPT  = appScript();
const lineOf  = i => APP_SRC.slice(0, i).split("\n").length;

/* THE LEXICON — alternatives, not a pin and not a denylist. See the header.
   Longest first, so "member name" is never read as two shorter matches. Bare
   "name" is deliberately absent: this product uses it for a legal name, a
   project's name and the record's name for a selection, and a lexicon that
   matched it would report those as identifier sites. */
const LEXICON = [
  "sign-in name", "signin name", "screen name", "member name", "account name",
  "login name", "user name", "username", "nickname", "member id", "memberid",
  "moniker", "handle",
];
/* WHOLE WORDS, and this was MEASURED rather than assumed: the first draft matched
   substrings the way every sibling sweep does, and `member id` duly matched the
   gate's own phrase "it carries no member IDENTITY" — a sentence about tokens
   that names no identifier at all. A sweep whose subject is which WORD is used
   has to match words. */
const RE = w => new RegExp("(^|[^a-z])" + w.replace(/[-]/g, "\\-") + "(s?)($|[^a-z])", "i");
/* WHAT A MEMBER READS, not what the markup carries. UI-31's report already draws
   this line — "a term with 0 visible stands in an attribute or a class name" —
   and it is load-bearing here for a reason found by running this file: the gate's
   input carries `autocomplete="username"`, which is a BROWSER hint and not a word
   any member reads. Reported as a second word in use, it would have made this
   guard fail on a file nobody had changed. */
const visible = html => String(html || "").replace(/<[^>]*>/g, " ")
  .replace(/&[a-z]+;|&#\d+;/g, " ").replace(/\s+/g, " ");

/* The noun a piece of member-visible text uses for the identifier, or null. */
function identifierNoun(text){
  for(const w of LEXICON) if(RE(w).test(String(text || ""))) return w;
  return null;
}
function allIdentifierNouns(text){
  const t = String(text || "");
  const found = new Set();
  for(const w of LEXICON){
    if(!RE(w).test(t)) continue;
    /* A longer entry already claimed this span; do not also report its tail. */
    if([...found].some(f => f.includes(w))) continue;
    found.add(w);
  }
  return [...found];
}

/* ============================================================
   WALK 1 — THE WIRE FIELD, WHICH IS THE PLANE'S AND IS THE ANCHOR
   ============================================================ */
const WIRE_FIELD = "handle";
/* `store.mjs` carries a stray byte that makes plain grep treat it as binary
   (CLAUDE.md's trap list); read as text here, the way `check-semantics.mjs` and
   `preauth-vocabulary.test.mjs` already read it. */
const STORE_SRC = fs.readFileSync(path.join(UIROOT, "..", "bio-plane", "src", "store.mjs"), "utf8");
/* THE STORE'S OWN METHOD SIGNATURES declare the field — `projectInvite({
   projectId, handle, by })` and its twelve siblings. Read out of the plane
   rather than typed here, and GUARDED: an extraction that silently yielded
   nothing would leave this file's anchor asserted by this file about itself. */
const STORE_METHODS_WITH_FIELD = [...new Set(
  [...STORE_SRC.matchAll(new RegExp("^  ([a-zA-Z]+)\\(\\{[^}]*\\b" + WIRE_FIELD + "\\b", "gm"))].map(m => m[1])
)].sort();
ok("WALK 1 REACH: the plane's own source was read and is the real thing — store.mjs "
   + STORE_SRC.length + " characters", STORE_SRC.length > 100000);
ok("WALK 1: `" + WIRE_FIELD + "` is the PLANE's field name and not this surface's word — it stands in "
   + "bio-plane/src/store.mjs " + (STORE_SRC.split(WIRE_FIELD).length - 1) + " times and is a declared "
   + "PARAMETER of " + STORE_METHODS_WITH_FIELD.length + " store methods [" + STORE_METHODS_WITH_FIELD.join(", ")
   + "]. Moving it is an I3 interface change (INTERFACE-CHANGES.md), not a reword — which is exactly why "
   + "this walk is anchored on it and why UI-34 did not propose moving it.",
   (STORE_SRC.split(WIRE_FIELD).length - 1) > 100 && STORE_METHODS_WITH_FIELD.length >= 8);

/* ============================================================
   WALK 2 — THE DECLARED SITES IN app.html, FOUND THROUGH THAT ANCHOR
   ============================================================
   A site is (where it is, what a member reads there). Both discovery rules are
   anchored on a name a wording change does not touch: the DOM id the gate binds,
   and the WIRE field name the act catalog declares. */
const SITES = [];

/* 2a THE GATE. `<label … for="g-<field>">TEXT</label>` — the id is `g-` plus the
   wire field, which is how the gate's own control is named, and the label's text
   is what a member reads before signing in. */
{
  const re = new RegExp('<label[^>]*for="g-' + WIRE_FIELD + '"[^>]*>([^<]*)</label>');
  const m = re.exec(APP_SRC);
  if(m) SITES.push({ where: "app.html:" + lineOf(m.index) + " the sign-in gate's field label",
                     text: m[1], surface: "gate" });
  ok("WALK 2 REACH (a): the gate's own label for the identifier field was found in the served markup — "
     + (m ? '"' + m[1] + '"' : "NOT FOUND, and every assertion below would be vacuous"), !!m);
}

/* 2b THE ACT CATALOG. Every declared field whose WIRE name is the anchor; its
   LABEL is what the member reads on the form. `["<field>","<label>"` is the
   catalog's own grammar, so a fifth form that takes the field is found here the
   day it is written. */
{
  const re = new RegExp('\\["' + WIRE_FIELD + '","([^"]*)"', "g");
  let m, found = 0;
  while((m = re.exec(APP_SRC))){
    found++;
    SITES.push({ where: "app.html:" + lineOf(m.index) + " an act form's field label",
                 text: m[1], surface: "roster-act-form" });
  }
  ok("WALK 2 REACH (b): the act catalog declares " + found + " forms that take the identifier field, "
     + "each with its own member-facing label", found >= 4);
}

/* 2c THE ACTS THEMSELVES, named, so the render walk below is driven from what the
   catalog declares rather than from a list kept here — and so the store's own
   signatures can be checked against them. Each entry runs from its own key to
   the next key at the same indent, which is the catalog's own grammar. */
const CATALOG = APP_SRC.slice(APP_SRC.indexOf("const ROSTER_ACTS = {"));
const ENTRIES = [...CATALOG.matchAll(/\n {2}([a-z]+): \{/g)];
const ACTS_WITH_FIELD = ENTRIES.filter((e, i) =>
    new RegExp('\\["' + WIRE_FIELD + '","').test(CATALOG.slice(e.index, ENTRIES[i+1] ? ENTRIES[i+1].index : e.index + 900)))
  .map(e => e[1]).sort();
ok("WALK 2 REACH (c): the " + ENTRIES.length + " acts in the catalog were read, and the ones that take "
   + "the identifier are [" + ACTS_WITH_FIELD.join(", ") + "]",
   ENTRIES.length >= 7 && ACTS_WITH_FIELD.length >= 4);
/* AND THE SURFACE'S FIELD NAME IS THE STORE'S PARAMETER NAME, checked rather than
   assumed. This is what makes walk 2 an anchor and not a coincidence: the word
   the catalog declares as the wire field is the word the plane's own method
   signature declares, so a surface reword cannot move it without an I3 change. */
{
  const unbound = ACTS_WITH_FIELD.filter(op =>
    !STORE_METHODS_WITH_FIELD.some(mth => mth.toLowerCase() === op.toLowerCase()));
  ok("WALK 2 REACH (d): every act that declares the field binds to a STORE METHOD declaring the same "
     + "parameter — UNBOUND: [" + (unbound.length ? unbound.join(", ") : "none, all " + ACTS_WITH_FIELD.length
     + " bound") + "]", unbound.length === 0 && ACTS_WITH_FIELD.length > 0);
}

ok("WALK 2 REACH: the source walk found " + SITES.length + " DECLARED member-visible sites, "
   + "each anchored on a name a reword cannot move", SITES.length >= 5);

/* ============================================================
   WALK 3 — WHAT A MEMBER ACTUALLY READS, RENDERED
   ============================================================
   Source says where a site is DECLARED. This says where a member MEETS one, and
   it is the half that sees PROSE — a sentence naming the identifier is declared
   nowhere and anchored to nothing, so only rendering finds it. */
const SURFACES = new Map();   // key -> harvested member-visible html

/* the gate, as served: no script has run, which is the state a member meets */
{
  const s = APP_SRC.indexOf('<div id="gate">');
  let i = s, depth = 0, m; const tag = /<\/?div\b[^>]*>/g; tag.lastIndex = s;
  while((m = tag.exec(APP_SRC))){ depth += m[0][1] === "/" ? -1 : 1; i = m.index + m[0].length; if(!depth) break; }
  SURFACES.set("the sign-in gate, as served", APP_SRC.slice(s, i));
}

/* ---- the mock plane. Faithful at the wire SHAPE the surface reads through, and
   nothing more: the subject here is what this product CALLS the identifier, not
   what any op decides. ---- */
const PID = "PROJ-2026-0001", TITLE = "Sewer fund and the marina";
const ROWS = [
  { handle:"alice", owner:1, state:"joined", comment:null },
  { handle:"bella", owner:1, state:"joined", comment:null },
  { handle:"dan",   owner:0, state:"joined", comment:null },
];
const MEMBERS = [
  { member_id:"m_alice", handle:"alice", cover:"Alice Ng", role:"admin", status:"active",
    capabilities:["contribute","publish"], invite_pending:0 },
  { member_id:"m_bob", handle:"bob", cover:"Bob R", role:"member", status:"active",
    capabilities:["contribute"], invite_pending:0 },
];
function adminMath(k){
  const votesNeeded = Math.floor(k/2)+1, eligibleVoters = Math.max(0, k-1);
  return { administrators:k, votesNeeded, eligibleVoters, possible: votesNeeded<=eligibleVoters };
}
function ownerMath(k){
  const votesNeeded = Math.floor(k/2)+1, eligibleVoters = Math.max(0, k-1);
  return { owners:k, votesNeeded, eligibleVoters, possible: votesNeeded<=eligibleVoters };
}
const FM_JSON = JSON.stringify({ objective:"Whether the sewer fund paid for the marina.",
  workproduct_state:"internally_checked", evaluations:[], references:[] });
const BUNDLE_MD = `---\nobject_type: project\ncurrent_state: investigating\ntitle: ${TITLE}\n---\n`
  + `## Thesis Summary\n\nThe fund moved money it was not permitted to move.\n`;

function mockFetch(u, opts){
  const url = new URL(String(u), "https://plane.test");
  const op = url.searchParams.get("op");
  const params = Object.fromEntries(url.searchParams.entries());
  const R = o => ({ ok:true, json:async()=>o });
  const W = o => R({ ok:true, result:o, store:"bio", tokenClass:"member" });
  if(op === "memberlist")   return W({ ok:true, members: MEMBERS });
  if(op === "adminarith")   return W({ ok:true, table:[1,2,3].map(adminMath), live: adminMath(1) });
  if(op === "projectparticipants") return W({ ok:true, projectId: params.projectId, participants: ROWS });
  if(op === "projectownerarith")   return W({ ok:true, projectId: params.projectId || null,
    table:[1,2,3].map(ownerMath), live: params.projectId ? ownerMath(2) : null });
  if(op === "image")      return R({ ok:true, result:{ "bundle.md": BUNDLE_MD } });
  if(op === "projection") return R({ ok:true, result:{ bundle_id:PID, object_type:"project",
    title:TITLE, current_state:"investigating", fm_json:FM_JSON } });
  if(op === "backlinks")  return W({ ok:true, target: params.target, backlinks: [] });
  if(op === "list")       return R({ ok:true, result:[
    { bundle_id:PID, object_type:"project", title:TITLE, current_state:"investigating", last_updated:"2026-07-20" }] });
  return R({ ok:false, error:"unexpected op " + op });
}

function makeCtx(){
  const els = new Map();
  function el(){
    const classes = new Set();
    const e = { classList:{ add:(...c)=>c.forEach(x=>classes.add(x)), remove:(...c)=>c.forEach(x=>classes.delete(x)),
                            toggle(){}, contains:c=>classes.has(c) },
      style:{}, dataset:{}, value:"", _html:"", textContent:"", scrollTop:0, disabled:false,
      addEventListener(){}, removeEventListener(){}, querySelector:()=>el(), querySelectorAll:()=>[],
      insertAdjacentHTML(p,h){ e._html += h; }, focus(){}, click(){}, remove(){}, setAttribute(){},
      getAttribute:()=>null, onclick:null, oninput:null };
    Object.defineProperty(e,"innerHTML",{ get(){ return e._html; }, set(v){ e._html = v; } });
    return e;
  }
  const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{},
    IntersectionObserver:undefined, setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;},
    clearTimeout(){}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({ matches:false }),
    document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
      querySelectorAll:()=>[], addEventListener(){}, documentElement:{ setAttribute(){}, getAttribute:()=>null },
      getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{ appendChild(){} } },
    location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){}, replaceState(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch:async(u,o)=>mockFetch(u,o) };
  ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(SCRIPT
    + ";globalThis.__PLANE=PLANE;globalThis.__renderMembers=renderMembers;"
    + "globalThis.__openWorkspace=openProjectWorkspace;globalThis.__openRosterAct=openRosterAct;"
    + "globalThis.__ACTS=()=>ROSTER_ACTS;", ctx);
  ctx.__els = els;
  return ctx;
}
const CTX = makeCtx();
const q = sel => CTX.document.querySelector(sel)._html;
CTX.__PLANE.session = true;
CTX.__PLANE.me = { member:"m_alice", handle:"alice", session:true, administer:true,
                   capabilities:["contribute","create_projects","publish"] };

/* the members & governance screen — the screen whose subject is who holds power,
   and the one that tells a member what they sign in with */
await CTX.__renderMembers();
SURFACES.set("the members & governance screen", q("#content") + q("#mm-gov") + q("#mm"));

/* the project workspace — "who is working on this" */
await CTX.__openWorkspace(PID);
SURFACES.set("the project workspace", q("#content"));

/* every roster act dialog that takes the identifier field — the forms a member
   types it into. Driven from the catalog's own act names, not from a list here. */
for(const act of ACTS_WITH_FIELD){
  CTX.__openRosterAct(act);
  SURFACES.set("the `" + act + "` form", q("#dlg"));
}

ok("WALK 3 REACH: " + SURFACES.size + " member-visible surfaces rendered and harvested — ["
   + [...SURFACES.keys()].join(", ") + "]", SURFACES.size >= 6);
{
  const chars = [...SURFACES.values()].join("").length;
  ok("WALK 3 REACH: the render harvested " + chars + " characters of member-visible surface, so the "
     + "sweep below is reading real screens rather than empty holders", chars > 12000);
}
/* AND EVERY SURFACE RENDERED ITS OWN SUBJECT, not an error pane — the zero-cost
   outcome arriving in the instrument, which this project has now met four times. */
ok("WALK 3 REACH: the members screen rendered the roster rather than an error pane",
   /Members &amp; governance/.test(SURFACES.get("the members & governance screen"))
   && SURFACES.get("the members & governance screen").includes("alice"));
ok("WALK 3 REACH: the project workspace rendered this project's participants rather than an error pane",
   SURFACES.get("the project workspace").includes(TITLE)
   && SURFACES.get("the project workspace").includes("Who is working on this"));
ok("WALK 3 REACH: every act form that takes the identifier rendered its own field and label",
   ACTS_WITH_FIELD.every(a => {
     const h = SURFACES.get("the `" + a + "` form") || "";
     return h.includes('id="ra-' + WIRE_FIELD + '"') && h.includes("<label");
   }));

/* ============================================================
   THE SWEEP — every place a member MEETS the identifier's name
   ============================================================ */
const READERS = [];   // { where, noun, sample }
for(const s of SITES) READERS.push({ where: s.where, noun: identifierNoun(s.text), sample: s.text.trim() });
for(const [key, html] of SURFACES){
  const nouns = allIdentifierNouns(visible(html));
  for(const w of nouns) READERS.push({ where: "RENDERED · " + key, noun: w, sample: null });
  if(!nouns.length) READERS.push({ where: "RENDERED · " + key, noun: null, sample: null });
}

/* ARM 1 — EVERY DECLARED SITE NAMES THE IDENTIFIER WITH A WORD THIS GUARD CAN
   RECOGNISE. A site that matches nothing in the lexicon has been reworded to
   something the guard has stopped covering, and it says so BY NAME rather than
   passing silently, which is what keeps the lexicon from being the blind spot. */
{
  const blind = SITES.filter(s => !identifierNoun(s.text));
  ok("EVERY DECLARED SITE NAMES THE IDENTIFIER IN A WORD THIS GUARD KNOWS — UNRECOGNISED: ["
     + (blind.length ? blind.map(s => s.where + ' ("' + s.text.trim() + '")').join(" · ") : "none, all "
        + SITES.length) + "]. An unrecognised word means a rename reached this site and the lexicon at "
     + "the head of this file was not extended with it; extend it there, once.",
     blind.length === 0);
}

/* ARM 2 — EVERY RENDERED SURFACE STILL CARRIES THE IDENTIFIER'S NAME. This is
   the arm that covers PROSE, which is declared nowhere and so cannot be walked
   from source. A sentence reworded to a word outside the lexicon drops its
   surface to zero here and is named. */
{
  const silent = [...SURFACES.keys()].filter(k => !allIdentifierNouns(visible(SURFACES.get(k))).length);
  ok("EVERY MEMBER-VISIBLE SURFACE THAT NAMES THE IDENTIFIER STILL DOES — STOPPED NAMING IT: ["
     + (silent.length ? silent.join(" · ") : "none, all " + SURFACES.size) + "]",
     silent.length === 0);
}

/* ============================================================
   ARM 3 — THE DRIFT ASSERTION. THIS IS THE ITEM.
   ============================================================
   Renamed EVERYWHERE or NOWHERE. The set of words in use across every declared
   site and every rendered surface must have exactly one member. It does not
   matter which one — that is UI-34's decision and it is recorded in `app.html`,
   not here. What this refuses is the half-rename, and the failure NAMES the
   sites that did not move beside the ones that did. */
{
  const used = new Map();     // noun -> [where …]
  for(const r of READERS){ if(!r.noun) continue;
    if(!used.has(r.noun)) used.set(r.noun, []); used.get(r.noun).push(r.where); }
  const words = [...used.keys()].sort();
  const detail = words.map(w => '"' + w + '" at ' + used.get(w).length + ": " + used.get(w).join(" ; ")).join("  ||  ");
  ok("RENAMED EVERYWHERE OR NOWHERE — this product names the member identifier with EXACTLY ONE word "
     + "in front of a member. IN USE: " + detail,
     words.length === 1);
  if(words.length === 1)
    console.log("IDENTIFIER VOCABULARY: this product's word for the member identifier is \"" + words[0]
      + '", used at all ' + used.get(words[0]).length + " member-visible sites and surfaces this guard "
      + "discovered. UI-34 decided to KEEP it product-wide; the argument is at the gate in app.html. "
      + "This assertion pins the CONSISTENCY, never the word — rename all of them and it stays green.");
}

/* ARM 4 — THE DECLARED AND THE RENDERED AGREE. A label declared in the catalog
   that no surface renders is a site the render walk is blind to; the delta is
   asserted rather than the absolute, which is this project's sixth encounter
   with covered-on-paper (UI-30, REC-49, UI-28, REC-48, UI-31, UI-32). */
{
  const rendered = [...SURFACES.values()].join("\n");
  const unrendered = SITES.filter(s => !rendered.includes(s.text));
  ok("EVERY DECLARED SITE IS ACTUALLY RENDERED TO A MEMBER — DECLARED BUT NEVER SHOWN: ["
     + (unrendered.length ? unrendered.map(s => s.where).join(" · ") : "none, all " + SITES.length
        + " declared labels found in the rendered surfaces") + "]",
     unrendered.length === 0);
}

/* ARM 5 — AND THE DECISION IS RECORDED WHERE THE NEXT READER MEETS THE WORD.
   UI-34's accepts-when: kept DELIBERATELY, with the decision recorded at the
   gate — not left as it is by default. A decision recorded only in a queue entry
   is one the next reader re-opens, so this asserts the reasoning stands in
   `app.html` beside the gate itself, and names this file as its enforcement. */
{
  const gateNote = /UI-34[\s\S]{0,4000}?rename(d)? it (EVERYWHERE|everywhere) or (NOWHERE|nowhere)/i.test(APP_SRC);
  ok("THE DECISION IS RECORDED AT THE GATE IN app.html, not only in the queue — a kept word with no "
     + "reason beside it reads to the next session like one that was missed, and gets re-opened",
     gateNote && /identifier-vocabulary\.test\.mjs/.test(APP_SRC));
}

/* ---- the selection lease, named as a SECOND subject and left alone. Not a
   vocabulary assertion: it pins that the product's existing pattern is still in
   place, so a later session does not "unify" the two by printing the wire word
   to a member on the finder. ---- */
ok("the OTHER thing the wire calls a `handle` — the selection lease — is still never printed to a "
   + "member by that word: the finder labels it in the reader's terms",
   /The record&rsquo;s name for this set/.test(SCRIPT));

console.log("identifier-vocabulary: " + n + " assertions, " + (fails.length ? fails.length + " FAILED" : "all green")
  + " — the word this product uses in front of a member for the identifier a member signs in with is "
  + "asserted CONSISTENT across every site the walks discovered, and its VALUE is asserted NOWHERE. "
  + "UI-34 decided to KEEP `handle` product-wide and the four-part argument is recorded at the GATE in "
  + "app.html, where the next reader meets the word: it is the PLANE's field name, a declared parameter "
  + "of thirteen store methods, so a surface-only rename would give the product two names for one field "
  + "and moving the wire is an I3 change; every candidate replacement is wrong and two are harmful "
  + "(`username`/`member name` collide with `op=whoami`'s DISTINCT `member` field and with the members "
  + "screen's own \"a cover is a label, not a legal name\"; `member id` is more jargon than what it "
  + "replaces and is false besides; `sign-in name` is right at the gate and wrong on an invite form); "
  + "unlike MEMBER_TOKEN, CORS, R2 and manifest — the four UI-33 closed — it is not our implementation "
  + "leaking but vocabulary the audience already holds; and the word's real overloading (the selection "
  + "lease) is already solved by never printing it, which a rename here would undo. Sites discovered "
  + "through the WIRE FIELD and the DOM ids, which a reword cannot move, plus a render walk over "
  + SURFACES.size + " surfaces for the prose that is declared nowhere; ONE STATED LIMIT at the head of "
  + "this file, measured by arm (e) rather than guessed. NEGATIVE CONTROL: RUN, seven arms — (a) the "
  + "gate reworded ALONE fails 1/18 naming \"username\" at 2 against \"handle\" at 10, by file and line "
  + "and by rendered surface (b) the four catalog labels reworded alone fails 1/18 the other way round, "
  + "8 against 5, so neither site is privileged (c) ALL NINE sites reworded stays 18/18 GREEN — and this "
  + "arm FOUND THE NINTH, `<th>Handle</th>` in projectParticipantsHtml, which the hand inventory missed "
  + "and only the render walk saw (c2) the same nine in title case, 18/18 GREEN (d) a rename to a word "
  + "outside the lexicon fails 2/18 rather than passing silently (e) the stated limit measured: the "
  + "column header alone to an unknown word runs GREEN — app.html restored byte-identically after every "
  + "arm, sha256 64fc94c6… before and after.");
if(fails.length){ console.error("identifier-vocabulary FAILURES:\n - " + fails.join("\n - ")); process.exit(1); }
