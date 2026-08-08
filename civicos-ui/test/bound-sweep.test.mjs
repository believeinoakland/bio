/* UI-39 · THE PLANE PUBLISHED A BOUND AND THE SURFACE DROPPED IT.
 * UI-41 · AND WHERE IT PUBLISHED NONE, THE SURFACE STOPPED AUTHORING ITS OWN.
 * ============================================================================
 *
 * UI-41's half, stated first because it SUPERSEDES part of what follows. UI-39
 * shipped two bound sentences the SURFACE composed — `op=readingname`'s and the
 * resolutions feed's — because those ops published no bound, and DEC-58 was
 * raised to license exactly that. REC-57 ended the exception: eleven capped ops
 * now publish `limit` (the cap AFTER clamping, never the number asked for) and a
 * truncation signal in each op's own vocabulary. So ARM B and ARM C below are
 * CORRECTED — the numbers come off the wire, and a hand-typed figure FAILS —
 * and ARM E sweeps the class rather than trusting the two the item named.
 * DEC-58's exception is retired: no surface here authors a bound any more.
 *
 * UI-25 fixed five sites of this class and REPORTED four more that sat outside
 * its claim. This suite drives those four, and it sweeps for the class rather
 * than trusting the four.
 *
 * WHAT MAKES ONE OF THESE DIFFERENT FROM THE OTHER THREE, and it is the whole
 * reason this item exists: (b), (c) and (d) narrow a DISPLAY. (a) narrows a
 * WRITE. `heldMatch` read `op=search` at the plane's LIMIT_DEFAULT of 50, and
 * `addGo` uses that read to decide whether to call `op=promote`. A capture whose
 * match sat past the fiftieth row at its address was therefore invisible to the
 * check, so the record grew a SECOND BUNDLE for one document — and, because
 * `CHANGED_FROM` stayed null, it grew one carrying none of the "a second capture
 * rather than a repeat of the first" sentence that makes a legitimate re-capture
 * legible. C-18.3's ring-once rule cannot catch it: it compares hashes WITHIN a
 * single bundle, so nothing at all stopped the duplicate except this read.
 *
 * SO ARM A ASSERTS THE WRITE, NOT THE DISPLAY. It plants a real match past the
 * plane's default, runs the REAL `addGo` end to end against a wire mock, and
 * asserts `op=promote` NEVER REACHES THE WIRE — naming the write it prevented.
 * It also proves the fixture actually arms the trap, by asserting that the page
 * the OLD code would have read does NOT contain the match: without that, "no
 * promote" is an outcome that costs nothing (CLAUDE.md), because a fixture whose
 * match sat at row 3 would pass with the bound still dropped.
 *
 * THE SWEEP IS TWO WALKS AND EACH ONE'S REACH IS ASSERTED AS A DELTA.
 * Asserting "0 unbounded call sites" is worthless on its own — a walk that
 * matches nothing reports zero and passes forever (UI-25 measured this class
 * eight times). So each walk is also run over a DELIBERATELY BROKEN COPY of the
 * same source, and must report MORE. The difference is the evidence; the
 * absolute is not.
 *
 *   WALK 1 — THE WIRE. `bio-plane/src/store.mjs` and `src/query.mjs` are read
 *     TEXTUALLY (store.mjs opens with `import … from "cloudflare:workers"` and
 *     cannot be imported — the same reason `preauth-vocabulary.test.mjs` reads
 *     it textually). Every store method carrying a `limit = N` default is
 *     extracted, and every op in the dispatch table that forwards `limit` to
 *     one. So the roster of BOUNDED OPS is the plane's own fact, not this
 *     file's list, and an op that grows a cap tomorrow joins the walk with
 *     nobody editing anything here.
 *
 *   WALK 2 — THE CALL SITES, found in `app.html` through that roster. Every
 *     `recR("<bounded op>"` must pass an explicit `limit:`. Anchored on the OP
 *     NAME — a wire string a reword cannot move — for the reason
 *     `identifier-vocabulary.test.mjs` gives: a site discovered through the wire
 *     cannot vanish from the walk the moment somebody rewords the screen.
 *
 * WHAT THIS SUITE DOES NOT MEASURE, stated so nobody trusts it for more. It
 * sweeps ops that carry a NUMERIC cap. It says nothing about ops that bound an
 * answer some other way (a depth walk, a gate, a time window), and it cannot
 * see a surface that renders a count it computed itself from a complete answer.
 *
 * NEGATIVE CONTROL (UI-39): four arms, each RUN and recorded in the report.
 *   (1) restore each dropped bound in app.html (remove `limit:` from the four
 *       call sites) -> WALK 2 fails naming the file and the figure.
 *   (2) ARM A's own: the planted match sits past the plane's default and the
 *       first page provably does not contain it, so a surface that did not walk
 *       would have promoted; strip the walk from app.html and `op=promote`
 *       appears on the wire.
 *   (3) neuter either walk's matcher -> its REACH assertion fails AS A DELTA,
 *       because the broken-copy count stops exceeding the clean-copy count.
 *   (4) polarity checked on every pin: each is RED for the defect and GREEN for
 *       the fix, never the reverse.
 *
 * NEGATIVE CONTROL (UI-41, run 2026-08-05 by ui41-agent): three arms, each RUN,
 * every file restored byte-identically afterwards with sha256 compared.
 *   (1) THE NUMBER IS READ, NOT COPIED. In app.html replace
 *       `const planeBound = Number(ans.limit);` with
 *       `const planeBound = RESOLVE_CAND_LIMIT;` — a hand copy, which is the
 *       defect exactly -> 9 FAIL, headed by "THE BOUND IS THE RECORD'S" and
 *       "IT MOVES WITH THE RECORD". This is the arm that matters: the ask and
 *       the plane's ceiling are BOTH 500, so a hand copy agrees with the wire
 *       for free on the real plane and every arm would pass without it.
 *   (2) NO FALLBACK. In `queueBoundHtml` replace
 *       `const cut = r && r.truncated === true;` with the pre-REC-57 arithmetic
 *       `Number(r.counts.resolved) > r.tasks.length` -> 4 FAIL, headed by
 *       "A CUT ANSWER WHOSE COUNTS AGREE IS STILL REPORTED", which is the arm
 *       that measures the difference between the record's flag and the
 *       inference it replaced.
 *   (3) NEUTER THE SWEEP. Make `authoredBounds` return `[]` -> 3 FAIL including
 *       "REACH IS A DELTA" and the over-strictness instrument arm, so a walk
 *       that finds nothing can no longer report zero and pass.
 *   (4) polarity checked on every new pin: RED for the defect, GREEN for the fix.
 *
 * NEGATIVE CONTROL (UI-42, run 2026-08-07 by ui42-agent): five arms, each RUN,
 * every file restored afterwards and verified BY CONTENT AS WELL AS BY sha256 —
 * UI-38's finding was an NC harness reporting a byte-identical restore over a file
 * that had not been restored.
 *   (1) RESTORE THE SENTENCE THAT SHIPPED. In app.html put the verbatim clause
 *       " (Documents already resolved to this subject are added separately and
 *       are not capped.)" back on `alreadyBound` -> 4 FAIL, headed by ARM F
 *       printing `civicos-ui/app.html:11927 — loadResolveCandidates() claims
 *       ["are not capped"] while reading op=readingname, op=concerns, which the
 *       plane caps` — file, LINE, surface and the op — plus ARM B and ARM B2's
 *       three falsehood pins.
 *   (2) THE NUMBER IS READ, NOT COPIED. In `concernsBoundHtml` replace
 *       `const bound = Number(ans && ans.limit);` with
 *       `const bound = MEANING_ASK_LIMIT;` — a hand copy, which is the defect
 *       exactly -> 8 FAIL headed by "THE BOUND IS THE RECORD'S", "A HAND-TYPED
 *       NUMBER FAILS THIS" and "IT MOVES WITH THE RECORD". This is the arm that
 *       matters: the ask and the plane's `#MEANING_LIMIT_DEFAULT` are BOTH 500,
 *       so a hand copy agrees with the wire FOR FREE on the real plane and every
 *       arm would pass without it.
 *   (3) THE REPLACEMENT OVERCLAIM. Report the bound over the WRONG SET — swap
 *       `${bound} resolutions read` for `${bound} documents` in
 *       `concernsBoundHtml` -> 5 FAIL headed by "NOT OVER THE WRONG SET", because
 *       a bound reported over `documents` when the plane bounds the RESOLUTION
 *       ROWS the join reads is a second overclaim replacing the first (REC-60's
 *       own distinction, and the failure available to this item).
 *   (4) NEUTER THE SWEEP, both walks, and BOTH WAYS for WALK 1.
 *       (4a) `unconditional()` returns false -> 18 FAIL with the roster PRINTED
 *            AS EMPTY on every corpus line: UNCONDITIONAL (0), ARM F reading 0
 *            functions against 0 ops, both REACH deltas 0 -> 0. A green ARM F
 *            over an empty roster can never be mistaken for a clean result.
 *       (4b) ONLY REC-57/REC-60's `Number(limit) || <default>` clause neutered,
 *            leaving REC-59's ternary -> 14 FAIL and the roster collapses to
 *            UNCONDITIONAL (1): projection. Run because a partial arm is what the
 *            first draft of (4a) accidentally was — `false && A || B || C` only
 *            neuters A — and the difference between 18 and 14 is the measure of
 *            how much of this walk rests on the idiom the item is about.
 *       (4c) `completenessFindings` pushes no findings -> 3 FAIL: ARM F's REACH
 *            as a DELTA, the naming arm, and the over-strictness INSTRUMENT arm
 *            that proves the walk is not passing because it is blind.
 *   (5) polarity checked on every new pin: RED for the defect, GREEN for the fix,
 *       plus three over-strictness arms in ARM F and three in WALK 1.
 *   Every file restored afterwards and verified BY CONTENT AND BY sha256, both
 *   reported identical on every arm.
 *
 *   AND TWO INSTRUMENT FAULTS THE CONTROLS FOUND, each caught by a guard of its
 *   own rather than by inspection, and both recorded because the instrument is
 *   the most likely thing to be wrong:
 *     - ARM F's REACH injection was first anchored on the very line the defect
 *       removes, so under (1) the injection silently became a NO-OP and the delta
 *       arm went red for the wrong reason. The "the regression copy really was
 *       modified" guard is what said so. Re-anchored on a DIFFERENT surface that
 *       reads the same op, because measuring REACH and catching the defect are
 *       two different jobs.
 *     - The finding's line number was searched from position ZERO and landed on
 *       the block comment that RECORDS this defect (11270) rather than on the
 *       code (11927), sending a reader to the explanation instead of the site.
 *       Now searched forward from the function's own declaration.
 */
import fs from "fs";
import vm from "vm";
import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0, bad = 0;
const ok = (what, cond) => { n++; if(!cond){ bad++; console.error("  NOT OK:", what); } };

const SRC = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
const STORE = fs.readFileSync(new URL("../../bio-plane/src/store.mjs", import.meta.url), "utf8");
const QUERY = fs.readFileSync(new URL("../../bio-plane/src/query.mjs", import.meta.url), "utf8");

/* ==========================================================================
 * WALK 1 — THE WIRE. The roster of bounded ops is the PLANE'S fact.
 * ========================================================================== */

/* WALK 1 IS REBUILT, AND THIS IS THE FINDING UI-42 DID NOT EXPECT (2026-08-07).
 * ---------------------------------------------------------------------------
 * WHAT STOOD HERE AND WHY IT WAS WRONG — corrected, never exempted. UI-39 read
 * the roster of capped store methods with
 *
 *     /^\s{2}([a-zA-Z][a-zA-Z0-9]*)\(\{[^}]*\blimit\s*=\s*\d+/gm
 *
 * — a method is capped IF ITS `limit` PARAMETER CARRIES A NUMERIC DEFAULT. That
 * was true of every capped method in the plane on the day it was written, and
 * REC-59 and REC-60 then capped six more reads USING THE OTHER IDIOM: `limit =
 * null` in the signature and the clamp computed inside the body. `op=concerns`,
 * `op=resolutions`, `op=connections`, `op=projection` and `op=exportlog` were
 * therefore INVISIBLE TO THIS WALK from the moment they were capped — the roster
 * read 4 ops where the plane had 9 — so WALK 2 never asked their call sites for
 * anything, and the whole UI battery stayed green while a member was being told
 * `op=concerns` was uncapped. THE INSTRUMENT WAS THE REASON THE DEFECT DID NOT
 * ANNOUNCE ITSELF, which is more than the stale fixture pin at ARM B was.
 *
 * AND A SECOND FAULT IN THE SAME WALK, of a class this file has already met once
 * (a ceiling-extraction window of 800 characters against an 887-character gap):
 * the dispatch matcher read at most 400 characters of an entry's arguments with
 * `[\s\S]{0,400}?`. `op=projection`'s `limit:` sits past that behind REC-59's
 * comment, so the op fell out of the roster for a reason that had nothing to do
 * with whether it is capped. Both matchers are now BRACE-BALANCED, per this
 * file's own rule about `[^}]*` reading nesting wrong in the safe direction.
 *
 * WHAT THE WALK ASKS NOW, and it is a PROPERTY OF THE PLANE rather than a
 * spelling: does an answer come back BOUNDED WHEN THE CALLER SENT NO LIMIT? A
 * method computes `const cap = <expr>` and the expression either names a value to
 * use when the caller sent none — `Number(limit) || <default>`, or REC-59's
 * ternary falling to a `_DEFAULT` — or it does not. Three buckets, ALL PRINTED
 * every run, because a walk that reports only what it judged is claiming reach it
 * does not have:
 *
 *   UNCONDITIONAL   — the answer is always bounded. A call site must state its ask.
 *   CALLER-OPTIONAL — bounded only if asked. `op=list`'s bare arm, which REC-60
 *                     DECIDED to keep and whose completeness its own suite pins.
 *                     This bucket is DERIVED from store.mjs, not hand-listed, so
 *                     the decision is honoured by measurement rather than by an
 *                     exemption somebody has to remember.
 *   UNJUDGED        — has a wire `limit` this walk cannot classify. `op=search`
 *                     (its cap lives in query.mjs and is confirmed below by its
 *                     own name) and `op=audit`. Printed rather than suppressed.
 */
const methodBodies = (text) => {
  const heads = []; const re = /^ {2}(?:static\s+)?([a-zA-Z#][a-zA-Z0-9]*)\s*\(/gm;
  let m; while((m = re.exec(text))) heads.push({ name: m[1], at: m.index });
  const out = new Map();
  heads.forEach((h, i) => { if(!out.has(h.name))
    out.set(h.name, text.slice(h.at, i + 1 < heads.length ? heads[i + 1].at : text.length)); });
  return out;
};
/* Dispatch entries that forward `limit` from the wire, arguments read
   BRACE-BALANCED and with comments stripped so a comment can neither hide a
   `limit:` past a window nor invent one. */
const forwardsLimit = (text) => {
  const out = new Map();
  const re = /^\s+([a-z][a-z0-9]*):\s*\(\)\s*=>\s*this\.([a-zA-Z][a-zA-Z0-9]*)\(\{/gm;
  let m; while((m = re.exec(text))){
    const [, op, meth] = m;
    let i = re.lastIndex - 1, depth = 0, start = -1;
    for(; i < text.length; i++){
      const c = text[i];
      if(c === "{"){ if(depth === 0) start = i + 1; depth++; }
      else if(c === "}"){ depth--; if(depth === 0) break; }
    }
    if(start < 0) continue;
    if(/\blimit:/.test(text.slice(start, i).replace(/\/\*[\s\S]*?\*\//g, ""))) out.set(op, meth);
  }
  return out;
};
const capStatement = (body) => {
  const i = body.indexOf("const cap ="); if(i < 0) return null;
  const j = body.indexOf(";", i);
  return j < 0 ? null : body.slice(i, j + 1).replace(/\s+/g, " ").trim();
};
/* THE ONE QUESTION: does the cap expression name a value to use when the caller
   sent nothing? */
const unconditional = (cap) =>
  /Number\(\s*limit\s*\)\s*\|\|/.test(cap)
  || /:\s*(?:Store\.)?[A-Z][A-Z0-9_]*DEFAULT\s*;$/.test(cap)
  || /:\s*\d+\s*;$/.test(cap);

const classifyOps = (text) => {
  const bodies = methodBodies(text);
  const uncond = new Map(), optional = new Map(), unjudged = new Map();
  for(const [op, meth] of forwardsLimit(text)){
    const cap = capStatement(bodies.get(meth) || "");
    (!cap ? unjudged : unconditional(cap) ? uncond : optional).set(op, meth);
  }
  return { uncond, optional, unjudged, methods: bodies };
};

const CLASS = classifyOps(STORE);
const OPS = CLASS.uncond;
const METHODS = new Set(OPS.values());

console.log(`  WALK 1 CORPUS: store.mjs ${STORE.split("\n").length} lines · ${CLASS.methods.size} method segments · ` +
  `${OPS.size + CLASS.optional.size + CLASS.unjudged.size} ops forward a wire \`limit\``);
console.log(`     UNCONDITIONAL (${OPS.size}): ${[...OPS.keys()].join(" ") || "(none)"}`);
console.log(`     CALLER-OPTIONAL (${CLASS.optional.size}): ${[...CLASS.optional.keys()].join(" ") || "(none)"}`);
console.log(`     UNJUDGED (${CLASS.unjudged.size}): ${[...CLASS.unjudged.keys()].join(" ") || "(none)"}`);

/* THE EXTRACTION IS GUARDED. A regex that silently yielded nothing would make
   every assertion below vacuous — the failure mode `identifier-vocabulary`
   names, and the one that makes a sweep worthless without anyone noticing. */
ok("WALK 1 GUARD: the store yields a non-trivial roster of methods to classify",
   CLASS.methods.size >= 100);
ok("WALK 1 GUARD: and the dispatch maps ops onto them",
   OPS.size >= 3);
ok("WALK 1: the three ops UI-39 named are on the plane's own roster, found through the wire and not listed here",
   OPS.has("readingname") && OPS.has("queue") && OPS.has("tasks"));
/* RED FOR THE BLIND SPOT UI-42 FOUND. The old extractor read 4; these five were
   capped by REC-59/REC-60 with `limit = null` and an internal clamp, and it could
   not see one of them. */
ok("WALK 1: AND THE FIVE THE OLD EXTRACTOR COULD NOT SEE — REC-59's and REC-60's `limit = null` idiom is a cap like any other",
   OPS.has("concerns") && OPS.has("resolutions") && OPS.has("connections")
   && OPS.has("projection") && OPS.has("exportlog"));
ok("WALK 1: `op=concerns` in particular, the op this item exists for, reaches the roster THROUGH THE PLANE'S SOURCE and is not named into it here",
   OPS.get("concerns") === "documentsConcerning");
/* INSTRUMENT: the superseded matcher is kept, RUN, and asserted to be BLIND — so
   the correction above is a measurement and not a claim about a regex nobody
   ran. It is the only use of the old shape in this file. */
const OLD_MATCHER = (text) => {
  const out = new Set(); const re = /^\s{2}([a-zA-Z][a-zA-Z0-9]*)\(\{[^}]*\blimit\s*=\s*\d+/gm;
  let m; while((m = re.exec(text))) out.add(m[1]);
  return out;
};
const OLD_BLIND = [...METHODS].filter(m => !OLD_MATCHER(STORE).has(m));
ok("WALK 1 · THE INSTRUMENT WAS THE DEFECT, MEASURED: UI-39's `limit = <digits>` matcher, run here against today's plane, MISSES capped methods that this walk finds",
   OLD_BLIND.length >= 5 && OLD_BLIND.includes("documentsConcerning"));
console.log(`     UI-39's matcher is blind to ${OLD_BLIND.length} of the ${METHODS.size} capped methods: ${OLD_BLIND.join(" ")}`);

/* op=list's BARE ARM: REC-60 DECIDED to keep it, and the decision is honoured by
   MEASUREMENT rather than by an exemption. If listBundles ever caps
   unconditionally, it moves buckets here and WALK 2 starts asking its call sites
   for an ask — with nobody editing this file. */
ok("WALK 1: `op=list` is CALLER-OPTIONAL, derived from store.mjs — its bare arm applies no cap, so it has no bound to publish and its call site owes no ask (REC-60's decided rider, measured rather than allowlisted)",
   CLASS.optional.has("list") && !OPS.has("list"));
ok("WALK 1: the UNJUDGED bucket is PRINTED and NON-EMPTY, because a walk that judged everything would be claiming reach it does not have",
   CLASS.unjudged.size >= 1);

/* OVER-STRICTNESS, on the classifier itself: three caps phrased unlike anything
   in store.mjs must land in the right buckets, or this walk is testing its
   author's habits rather than the property. */
ok("WALK 1 · OVER-STRICTNESS: an unconditional cap written in a style this plane never uses is still called UNCONDITIONAL",
   unconditional("const cap = Math.min(9, Number(limit) || 3);"));
ok("WALK 1 · OVER-STRICTNESS: a ternary falling to a named default is too",
   unconditional("const cap = ok ? Math.min(MAXX, n) : Store.SOME_DEFAULT;"));
ok("WALK 1 · INSTRUMENT: and a caller-optional cap is NOT, so the classifier is not simply answering yes",
   !unconditional("const cap = Math.min(5000, Math.floor(limit));"));
/* op=search's cap lives in query.mjs, not as a `limit = N` parameter default,
   so it is confirmed separately and by its own name. */
const LIMIT_DEFAULT = Number((/LIMIT_DEFAULT\s*=\s*(\d+)/.exec(QUERY) || [])[1]);
const LIMIT_MAX = Number((/LIMIT_MAX\s*=\s*(\d+)/.exec(QUERY) || [])[1]);
ok("WALK 1: op=search's default page is the plane's published LIMIT_DEFAULT, read from query.mjs",
   LIMIT_DEFAULT === 50);
ok("WALK 1: and its ceiling is the plane's LIMIT_MAX",
   LIMIT_MAX === 500 && LIMIT_MAX > LIMIT_DEFAULT);

/* REACH, AS A DELTA. Run the same classifier over a copy with the FALLBACKS
   removed — the caps stay, but none of them applies when the caller sends
   nothing — and the UNCONDITIONAL roster must SHRINK. An extractor that matched
   nothing would report the same number both times and this fails. */
const strippedStore = STORE
  .replace(/Number\(\s*limit\s*\)\s*\|\|\s*[A-Za-z0-9_.#]+/g, "Number(limit)")
  .replace(/:\s*Store\.[A-Z][A-Z0-9_]*DEFAULT\s*;/g, ": Math.floor(asked);");
const STRIPPED = classifyOps(strippedStore);
ok("WALK 1 · INSTRUMENT: the stripped copy really was modified, so the delta below compares two different things",
   strippedStore !== STORE);
ok("WALK 1 REACH IS A DELTA: taking the caller-sent-nothing fallbacks out of a copy of store.mjs shrinks the UNCONDITIONAL roster this walk finds",
   STRIPPED.uncond.size < OPS.size);
ok("WALK 1 REACH IS A DELTA: and the ops it loses move to CALLER-OPTIONAL rather than vanishing, so the walk is reclassifying rather than going blind",
   STRIPPED.optional.size > CLASS.optional.size);
console.log(`     REACH DELTA: fallbacks stripped -> UNCONDITIONAL ${OPS.size} -> ${STRIPPED.uncond.size}, CALLER-OPTIONAL ${CLASS.optional.size} -> ${STRIPPED.optional.size}`);

/* ==========================================================================
 * WALK 2 — THE CALL SITES in app.html, anchored on the op name.
 * ========================================================================== */

/* Every `recR("op", …)` call for a bounded op, with its argument text.
   BRACE-BALANCED rather than `[^}]*`: the first draft of this walk used the lazy
   character class and stopped at the `}` inside `...(extra||{})`, so it read a
   call's arguments as ending halfway through and reported a bound that was
   there as missing. A matcher that mis-reads nesting is a matcher that will
   eventually mis-read it in the safe direction instead. */
const callSites = (text, ops) => {
  const found = [];
  for(const op of ops){
    const head = new RegExp(`recR\\("${op}"\\s*(,?)`, "g");
    let m; while((m = head.exec(text))){
      if(!m[1]){ found.push({ op, args: "" }); continue; }   // `recR("op")` — no arguments at all
      let i = head.lastIndex, depth = 0, start = -1;
      for(; i < text.length && i < head.lastIndex + 4000; i++){
        const c = text[i];
        if(c === "{"){ if(depth === 0) start = i + 1; depth++; }
        else if(c === "}"){ depth--; if(depth === 0){ found.push({ op, args: text.slice(start, i) }); break; } }
        else if(depth === 0 && c === ")"){ found.push({ op, args: "" }); break; }
      }
    }
  }
  return found;
};
const unbounded = (sites) => sites.filter(s => !/\blimit\s*:/.test(s.args));

/* op=search is walked alongside the dispatch-derived roster, because its cap is
   real and is the one that governs the write. */
const WALKED = [...OPS.keys(), "search"];
const SITES = callSites(SRC, WALKED);

/* THE ONE CLASSIFIED SITE, AND IT IS CLASSIFIED RATHER THAN EXEMPTED (UI-42).
   `op=projection` joined this roster today, and `getProjection(id)` states no
   ask. That is CORRECT and the reason is a fact about the PLANE, so the fact is
   what is asserted: `projection()` has a single-bundle arm keyed on `bundleId`
   that returns the row BEFORE `const cap` is ever computed, so this call reaches
   no page and has no bound to state. The day that arm goes, or the day this site
   starts passing a corpus selector, these pins go red — which an allowlist entry
   would not. */
/* THE METHOD NAME IS HELD IN A CONSTANT RATHER THAN WRITTEN INSIDE `.get(...)`,
   AND THE REASON IS A REAL FAILURE THIS ITEM CAUSED AND MEASURED (2026-08-07).
   `bio-plane/test/bounds.test.mjs`'s REC-59 consumer walk scans every file in the
   repository for `op=projection` call sites and anchors the helper form on
   `(?:recR|rec|call|DO|get|j|GET)\(` immediately before the literal `"projection"`.
   `CLASS.methods.get("projection")` — a Map read of a METHOD BODY, not a request
   to anything — matched that anchor, was classified as a `corpus-bare` call site
   IN `civicos-ui/`, and turned the plane's assertion that "civicos-ui reaches
   op=projection ONLY through the `&id=` arm" RED. The battery went 106/106 to
   105/106 with `bio-plane/**` never opened.
   This line is not a call site, so it is written so as not to look like one; the
   plane's matcher is nonetheless loose and is raised to RECORD as a DELEGATION
   rather than edited here, because `bio-plane/**` is not UI's to change. It
   failed in the ALARMING direction, which is the safe one — but a walk that
   invents a consumer will one day invent one that hides a real answer. */
const PROJECTION_METHOD = "projection";
const PROJECTION_BODY = CLASS.methods.get(PROJECTION_METHOD) || "";
const PROJ_SITES = SITES.filter(s => s.op === "projection");
const IS_SINGLE_BUNDLE = (args) => /\bid\b/.test(args) && !/jsonPath|jsonEquals|after/.test(args);
ok("WALK 2 · INSTRUMENT: the walk finds the one `op=projection` call site in app.html",
   PROJ_SITES.length === 1);
ok("WALK 2 · CLASSIFIED, NOT EXEMPTED: that site selects ONE bundle by id and asks for no page",
   PROJ_SITES.every(s => IS_SINGLE_BUNDLE(s.args)));
ok("WALK 2 · AND THE PLANE'S OWN FACT IS WHAT LICENSES IT: `projection()`'s single-bundle arm returns the row BEFORE the cap is computed, asserted against store.mjs so removing that arm turns this red",
   PROJECTION_BODY.indexOf("if (bundleId)") >= 0
   && PROJECTION_BODY.indexOf("if (bundleId)") < PROJECTION_BODY.indexOf("const cap =")
   && /if \(bundleId\) \{[\s\S]{0,1500}?return row/.test(PROJECTION_BODY));

const UNBOUNDED = unbounded(SITES).filter(s => !(s.op === "projection" && IS_SINGLE_BUNDLE(s.args)));

ok("WALK 2 GUARD: the walk actually reaches call sites in app.html",
   SITES.length >= 5);
console.log(`  WALK 2 CORPUS: app.html ${SRC.split("\n").length} lines · ${WALKED.length} ops walked · ${SITES.length} call sites found`);
ok("WALK 2: EVERY call to a bounded op passes an explicit limit — no surface inherits a cap it never stated",
   UNBOUNDED.length === 0);
if(UNBOUNDED.length)
  for(const u of UNBOUNDED) console.error(`         civicos-ui/app.html: recR("${u.op}") drops the plane's published bound`);
/* RED FOR TODAY'S DEFECT. These six sites read a REC-59/REC-60-capped op and, until
   UI-42, stated no ask at all — invisible because WALK 1 could not see the cap. */
ok("WALK 2: the six sites reading REC-60's three meaning-layer ops now state their ask — the finder, the subject view, the resolve-candidates list, the progression and the document page",
   SITES.filter(s => ["concerns","connections","resolutions"].includes(s.op)).length >= 8
   && SITES.filter(s => ["concerns","connections","resolutions"].includes(s.op))
           .every(s => /\blimit\s*:/.test(s.args)));
/* AND `op=list`'s BARE ARM IS NOT ASKED FOR ONE, because it is CALLER-OPTIONAL —
   the classifier's bucket, not a rule written here. */
ok("WALK 2: `op=list`'s bare call is NOT walked, because the plane's own classification says it applies no cap to it",
   !WALKED.includes("list") && /recR\("list"\)/.test(SRC));

/* REACH, AS A DELTA — the control this suite would be worthless without.
   Remove the limits from a COPY of app.html and the same matcher must find
   them. If it reports zero both times, it is matching nothing. */
const strippedSrc = SRC.replace(/\blimit\s*:\s*String\([A-Za-z_]+\)\s*,?/g, "")
                       .replace(/\blimit\s*:\s*"[0-9]+"\s*,?/g, "");
const strippedUnbounded = unbounded(callSites(strippedSrc, WALKED));
ok("WALK 2 REACH IS A DELTA: the same matcher over a copy with the limits removed finds STRICTLY MORE unbounded sites",
   strippedUnbounded.length > UNBOUNDED.length);
ok("WALK 2 REACH: and what it then finds includes this item's own four sites, so the walk covers the ground the item claims",
   ["search","readingname","queue","tasks"].every(op => strippedUnbounded.some(s => s.op === op)));

/* ==========================================================================
 * THE RUNTIME. One VM, one wire mock, every op answered in its REAL envelope
 * shape (D-173: a mock that agrees with itself agrees on nothing).
 * ========================================================================== */
const FLAT = new Set(["links","acquire","attest","monitor","archivelookup","linkproject",
                      "governorstate","governorconfig","knock","verify","publishedcase"]);
const CALLS = [];
let ROUTER = () => ({});

const els = new Map();
const el = () => ({ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", innerHTML:"", textContent:"", disabled:false, checked:false, _on:{},
  addEventListener(ev, fn){ this._on[ev] = fn; }, click(){ if(this._on.click) this._on.click(); },
  querySelectorAll(){return[]}, querySelector(){return el()}, insertAdjacentHTML(){}, focus(){} });

const SERVE = new Map();
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp,
  Promise, Uint8Array, Map, Set, TextEncoder, TextDecoder, crypto: webcrypto,
  btoa: (s) => Buffer.from(s, "binary").toString("base64"), Blob: class {},
  setInterval:()=>1, clearInterval(){}, setTimeout:()=>1, requestAnimationFrame:fn=>fn(),
  document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}},
    getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{appendChild(){},removeChild(){}} },
  location:{protocol:"https:"}, history:{pushState(){},back(){}},
  localStorage:{getItem:()=>null,setItem(){}}, window:{addEventListener(){},open:()=>null},
  fetch: async (u, init) => {
    const url = new URL(String(u), "https://x.test");
    const q = url.searchParams;
    const op = q.get("op");
    if(op === "capture"){
      const b = SERVE.get(q.get("sha256"));
      if(!b) return { ok:false, json: async () => ({ ok:false, reason:"NOT_FOUND" }) };
      return { ok:true, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) };
    }
    const body = init && init.body ? JSON.parse(init.body) : null;
    CALLS.push({ op, params: Object.fromEntries(q.entries()), body });
    const r = await ROUTER(op, Object.fromEntries(q.entries()), body);
    /* THE ENVELOPE IS THE WIRE'S, PER OP. */
    return { ok:true, json: async () => FLAT.has(op) ? { ok:true, ...r } : { ok:true, result:r } };
  } };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(appScript() + `;globalThis.__U={heldMatch,addGo,PLANE,HELD_PAGE,HELD_PAGES_MAX,
  heldBounded:()=>HELD_BOUNDED, loadResolveCandidates,INTENT_SUBJ,RESOLVE_CAND_LIMIT,
  queueRun,queuePaint,queueBoundHtml,QUEUE_LIMIT,lookupSubject,registryNameBoundHtml,
  finderSubjectsPanelHtml,PROJ_CACHE,
  concernsBoundHtml,subjConcernsHtml,MEANING_ASK_LIMIT};`, ctx);
const U = ctx.__U;
U.PLANE.base = "https://plane.test";
U.PLANE.token = "t";
U.PLANE.session = true;
U.PLANE.me = { member:"dana", handle:"dana", session:true, can:{} };

const html = (sel) => (els.get(sel) || {}).innerHTML || "";

/* ==========================================================================
 * ARM A — THE WRITE. The item's centre.
 * ========================================================================== */

const DOC = Buffer.from("%PDF-1.7 sewer fund transfers, as published");
const DOC_SHA = Array.from(new Uint8Array(await webcrypto.subtle.digest("SHA-256", DOC)))
  .map(x=>x.toString(16).padStart(2,"0")).join("");
SERVE.set(DOC_SHA, DOC);
const ADDRESS = "https://data.oaklandca.gov/report.pdf";

/* THE TRAP, ARMED DELIBERATELY. The record holds 700 captures at this address
   and the one that matches sits at index 600 — past the plane's default of 50,
   and past its LIMIT_MAX of 500 as well, so this fixture drives BOTH halves of
   the fix: asking for more than the default, and PAGING past the ceiling. */
const HELD_AT = 600, ROWS_N = 700;
const ROWS = Array.from({length:ROWS_N}, (_,i) => ({
  bundle_id: `INFO-2026-${String(1000+i)}-report`, title: `Report capture ${i}`,
  object_type:"information", current_state:"collected" }));
const HELD_ID = ROWS[HELD_AT].bundle_id;

const planeRouter = async (op, p) => {
  if(op === "search"){
    const q = p.q || "";
    /* The hash arm is answered EMPTY on purpose, to isolate the ADDRESS arm —
       which is the arm the bound governs. That the hash arm still short-circuits
       when it does hit is asserted on its own below, so the isolation is not
       hiding a regression. */
    if(/^hash:sha256:/.test(q)) return { hits:[], total:0, limit:LIMIT_DEFAULT, offset:0 };
    if(/^locator:/.test(q)){
      /* CLAMPED EXACTLY AS THE PLANE CLAMPS, and it publishes the clamp. A mock
         that served whatever it was asked for would let a surface that asked for
         a million look correct. */
      const asked = Number(p.limit) || LIMIT_DEFAULT;
      const lim = Math.max(1, Math.min(LIMIT_MAX, asked));
      const off = Number(p.offset) || 0;
      return { hits: ROWS.slice(off, off+lim), total: ROWS.length, limit: lim, offset: off };
    }
    return { hits:[], total:0, limit:LIMIT_DEFAULT, offset:0 };
  }
  if(op === "projection")
    /* Only the planted row carries a content hash; the rest are captures whose
       projection never recorded one, which is why the walk has to keep going. */
    return p.id === HELD_ID ? { bundle_id:HELD_ID, title:"Report capture 600", content_hash:`sha256:${DOC_SHA}` }
                            : { bundle_id:p.id, title:"a capture with no recorded hash" };
  if(op === "acquire") return { document:{
      file:"snapshots/report.pdf", locator:ADDRESS, authority:"City of Oakland",
      retrieved:"2026-08-05T10:00:00Z",
      capture:{ method:"bio-plane acquire, https fetch, hashed at receipt", grade:"B",
                actor_class:"member", sha256:DOC_SHA, encoding:"binary", bytes:DOC.length,
                content_type:"application/pdf" },
      origin:{ kind:"named_request" }, attestation_attempts:[] } };
  if(op === "attest") return { attempts:[], attestation:null, archive:null };
  if(op === "allocid") return { id:"INFO-2026-9999" };
  if(op === "promote") return { ok:true, bundleId:"INFO-2026-9999-x" };
  return {};
};

const runAdd = async () => {
  CALLS.length = 0;
  U.PROJ_CACHE.clear();
  els.clear();
  ROUTER = planeRouter;
  const set = (sel, v) => { const e = ctx.document.querySelector(sel); e.value = v; return e; };
  set("#a-type","information"); set("#a-title","Sewer fund transfers");
  set("#a-body","What the report shows."); set("#a-loc", ADDRESS); set("#a-auth","City of Oakland");
  await U.addGo();
};

await runAdd();

const promotes = CALLS.filter(c => c.op === "promote");
const searches = CALLS.filter(c => c.op === "search" && /^locator:/.test(c.params.q||""));

/* THE ASSERTION THE ITEM ASKS FOR, AND IT NAMES THE WRITE. */
ok("ARM A · THE WRITE IS PREVENTED: a match past the plane's default produces NO op=promote — the record does not grow a second bundle for one document",
   promotes.length === 0);

/* AND THE PROOF THE TRAP WAS ARMED. Without this the assertion above costs
   nothing: a fixture whose match sat at row 3 would pass it with the bound
   still dropped. This asserts the match is NOT in the page the old code read. */
const oldPage = ROWS.slice(0, LIMIT_DEFAULT);
ok("ARM A · THE DUPLICATE WOULD HAVE BEEN WRITTEN: the match is absent from the page op=search answers at its default, so the unpaged read reported 'not held' and addGo would have promoted",
   oldPage.findIndex(r => r.bundle_id === HELD_ID) === -1 && HELD_AT >= LIMIT_DEFAULT);
ok("ARM A · and absent from the FIRST PAGE the fixed code reads too, so this is a paging fix and not merely a bigger ask",
   HELD_AT >= LIMIT_MAX);
/* An ABSENT offset is offset 0 on the wire, and leaving it off the first call is
   correct rather than a gap — the plane's own default is 0. */
const offsets = searches.map(c => Number(c.params.offset || 0));
ok("ARM A · THE WALK PAGED: op=search was asked more than once for this address, with a moving offset",
   searches.length >= 2 && offsets.some(o => o > 0));
ok("ARM A · it asked for the plane's ceiling rather than accepting the default",
   searches.every(c => Number(c.params.limit) === U.HELD_PAGE) && U.HELD_PAGE === LIMIT_MAX);
ok("ARM A · the offsets advance by what the plane SERVED, so a clamp cannot make the walk skip rows",
   offsets.join(",") === `0,${LIMIT_MAX}`);
ok("ARM A · the member is told it is already held, and sent to the document that holds it",
   /already in the record/i.test(html("#a-err")));
ok("ARM A · no attestation was requested either — nothing on the write path ran for a document the record already has",
   !CALLS.some(c => c.op === "attest"));

/* THE HASH ARM STILL SHORT-CIRCUITS. The isolation above must not have cost the
   cheap key. */
CALLS.length = 0; U.PROJ_CACHE.clear();
ROUTER = async (op, p) => {
  if(op === "search" && /^hash:sha256:/.test(p.q||""))
    return { hits:[{ bundle_id:"INFO-2026-0001-report", title:"the one already held" }],
             total:1, limit:LIMIT_DEFAULT, offset:0 };
  return planeRouter(op, p);
};
const exact = await U.heldMatch(DOC_SHA, ADDRESS, "application/pdf", "report.pdf");
ok("ARM A · the cheap key is unchanged: an exact hash hit answers without walking the address at all",
   exact && exact.identical === true
   && !CALLS.some(c => c.op==="search" && /^locator:/.test(c.params.q||"")));

/* A WALK THAT CANNOT REACH THE END SAYS SO, AND `null` IS NOT THAT ANSWER.
   The plane publishes no total here, so the check is not entitled to call one
   page the whole answer. */
CALLS.length = 0; U.PROJ_CACHE.clear();
ROUTER = async (op, p) => {
  if(op === "search"){
    if(/^hash:sha256:/.test(p.q||"")) return { hits:[], total:0, limit:LIMIT_DEFAULT, offset:0 };
    const lim = Math.max(1, Math.min(LIMIT_MAX, Number(p.limit) || LIMIT_DEFAULT));
    return { hits: ROWS.slice(0, lim) };            // a full page and NO total published
  }
  return planeRouter(op, p);
};
const short = await U.heldMatch("f".repeat(64), ADDRESS, "application/pdf", "report.pdf");
ok("ARM A · NOT FOUND AND NOT HELD ARE DIFFERENT ANSWERS: a walk the plane published no count for reports its bound instead of answering null",
   short && short.bounded === true && short.total === null && short.examined === LIMIT_MAX);

/* AND THE BOUND REACHES THE RECORD, not a progress line the next repaint wipes. */
CALLS.length = 0; U.PROJ_CACHE.clear(); els.clear();
const boundedRouter = ROUTER;
ROUTER = async (op, p, b) => op === "promote" ? { ok:true, bundleId:"INFO-2026-9999-x" } : boundedRouter(op, p, b);
{
  const set = (sel, v) => { const e = ctx.document.querySelector(sel); e.value = v; return e; };
  set("#a-type","information"); set("#a-title","Sewer fund transfers");
  set("#a-body","What the report shows."); set("#a-loc", ADDRESS); set("#a-auth","City of Oakland");
  await U.addGo();
}
const promoted = CALLS.find(c => c.op === "promote");
const bodyMd = promoted && (promoted.body.files||[]).find(f => f.path === "bundle.md");
ok("ARM A · a bounded check that DOES write says so IN THE BUNDLE, through the same mechanism the changed-from note uses",
   !!bodyMd && /NOT established before this was written/.test(bodyMd.text));
ok("ARM A · and it states which bound stopped it rather than implying completeness",
   !!bodyMd && /could not reach the end of that list/.test(bodyMd.text)
   && /nothing here says it is not/.test(bodyMd.text));

/* ==========================================================================
 * ARM A2 — THE CARRY. Found by this item, not brought by it.
 *
 * `CHANGED_FROM` is assigned ONLY inside addGo's `if(loc)` branch, so a typed
 * intake with no address inherited whatever the previous add left there and
 * wrote "The record already holds an earlier capture of this same address
 * (INFO-…)" into a document that has no address at all. A false sentence about
 * the record, in a document's own body, naming an unrelated bundle.
 *
 * TWO ADDS IN SEQUENCE, which is the only way to see it: the first is a CHANGED
 * re-capture that legitimately sets the carry, the second is a typed inquiry.
 * ========================================================================== */
{
  /* (1) A GENUINELY CHANGED RE-CAPTURE, run through the REAL classifier rather
     than short-circuited: the record holds the OLD bytes at this address, the
     source now serves the NEW ones, and `identify`+`compare` return an
     evidentiary change, which is what sets `proceed` and therefore the carry.
     THE FIRST DRAFT OF THIS ARM DID NOT DO THIS — it answered the address search
     with no hits, so `heldMatch` returned null, the carry was never set, and the
     arm passed with the defect PRESENT. It is here because its own negative
     control caught it (CLAUDE.md: an outcome that costs nothing is not
     evidence). */
  const OLD_B = Buffer.from("<html><body><h1>Sewer fund report</h1><p>The sewer fund transferred 1,000,000 dollars in March.</p></body></html>");
  const NEW_B = Buffer.from("<html><body><h1>Sewer fund report</h1><p>The sewer fund transferred 4,500,000 dollars in March and April, plus a further 2,000,000 in May.</p></body></html>");
  const dg = async (b) => Array.from(new Uint8Array(await webcrypto.subtle.digest("SHA-256", b)))
    .map(x=>x.toString(16).padStart(2,"0")).join("");
  const OLD_SHA = await dg(OLD_B), NEW_SHA = await dg(NEW_B);
  SERVE.set(OLD_SHA, OLD_B); SERVE.set(NEW_SHA, NEW_B);
  const HELD2 = "INFO-2026-0500-sewer-report";

  const carryRouter = async (op, p) => {
    if(op === "search"){
      if(/^locator:/.test(p.q||""))
        return { hits:[{ bundle_id:HELD2, title:"Sewer fund report" }], total:1,
                 limit:Number(p.limit)||LIMIT_MAX, offset:Number(p.offset)||0 };
      return { hits:[], total:0, limit:1, offset:0 };
    }
    if(op === "projection")
      return { bundle_id:HELD2, title:"Sewer fund report", content_hash:`sha256:${OLD_SHA}` };
    if(op === "acquire") return { document:{
        file:"snapshots/report.html", locator:ADDRESS, authority:"City of Oakland",
        retrieved:"2026-08-05T10:00:00Z",
        capture:{ method:"bio-plane acquire, https fetch, hashed at receipt", grade:"B",
                  actor_class:"member", sha256:NEW_SHA, encoding:"utf-8", bytes:NEW_B.length,
                  content_type:"text/html" },
        origin:{ kind:"named_request" }, attestation_attempts:[] } };
    if(op === "attest") return { attempts:[], attestation:null, archive:null };
    if(op === "allocid") return { id:"INFO-2026-8888" };
    if(op === "promote") return { ok:true, bundleId:"INFO-2026-8888-x" };
    return {};
  };

  CALLS.length = 0; U.PROJ_CACHE.clear(); els.clear();
  ROUTER = carryRouter;
  const set = (sel, v) => { const e = ctx.document.querySelector(sel); e.value = v; return e; };
  set("#a-type","information"); set("#a-title","Sewer fund transfers");
  set("#a-body","What the report shows."); set("#a-loc", ADDRESS); set("#a-auth","City of Oakland");
  await U.addGo();
  const firstMd = (CALLS.find(c => c.op === "promote")?.body.files||[]).find(f => f.path === "bundle.md");
  /* THE ARM IS ARMED ONLY IF THE CARRY WAS ACTUALLY SET. Asserted, not assumed. */
  ok("ARM A2 · INSTRUMENT: the changed re-capture DID set the carry — the first document says it follows an earlier capture, naming it",
     !!firstMd && /earlier capture of this same address/.test(firstMd.text)
     && firstMd.text.includes(HELD2));

  /* (2) THE TYPED INTAKE — no address at all, written straight after. */
  CALLS.length = 0; U.PROJ_CACHE.clear(); els.clear();
  set("#a-type","inquiry"); set("#a-title","Why were the transfers made");
  set("#a-body","The question."); set("#a-loc",""); set("#a-auth","");
  await U.addGo();
  const typedMd = (CALLS.find(c => c.op === "promote")?.body.files||[]).find(f => f.path === "bundle.md");
  ok("ARM A2 · INSTRUMENT: the typed intake really was written, so this arm reads a document and not an absence",
     !!typedMd && /Why were the transfers made/.test(typedMd.text));
  ok("ARM A2 · THE CARRY IS CLEARED: a typed intake with no address does not inherit the previous add's changed-from sentence",
     !!typedMd && !/earlier capture of this same address/.test(typedMd.text));
  ok("ARM A2 · and it names no bundle it has nothing to do with",
     !!typedMd && !typedMd.text.includes(HELD2));
  ok("ARM A2 · and it carries no bounded-check sentence either, because no address was checked",
     !!typedMd && !/NOT established before this was written/.test(typedMd.text));
}

/* ==========================================================================
 * ARM B — op=readingname's bound, THE RECORD'S OWN (UI-41).
 *
 * SUPERSEDED AND CORRECTED, NOT EXEMPTED (2026-08-05). UI-39 wrote this block to
 * assert the sentence stated the number the SURFACE ASKED FOR — `at most 500` —
 * because `op=readingname` published no bound and DEC-58 licensed exactly that
 * as the only honest half available. REC-57 ended the exception: `limit` (the cap
 * AFTER clamping, never the number asked for) and `truncated` are on the wire, so
 * every arm below now asserts the RECORD's figure and the old assertions are
 * rewritten rather than deleted or allowed to stand.
 *
 * THE HAZARD THIS ARM IS BUILT AROUND, and it is the reason for the odd numbers.
 * This screen asks for 500 and `documentsNamingEntity` clamps to a ceiling of 500,
 * so ON THE REAL PLANE THE ASK AND THE APPLIED CAP AGREE — a hand-typed 500 in the
 * surface would satisfy any arm driven at the real ceiling, at zero cost, with the
 * defect fully present. So the fixture serves a bound that is NOT the ask, and the
 * sentence must carry the wire's number and must NOT carry the ask's.
 * ========================================================================== */
const CAND_ASK = U.RESOLVE_CAND_LIMIT;

/* THE PLANE'S REAL CEILING, READ OFF ITS OWN SOURCE rather than typed — UI-35's
   class, where a fixture that invents a value makes a dead branch render alive.
   This is not used as a fixture value; it is used to PROVE the hazard above is
   real, which is what justifies driving the arms off-ceiling. */
const RN_CEILING = Number((/documentsNamingEntity\(\{[\s\S]{0,2000}?Math\.min\(Number\(limit\)\s*\|\|\s*\d+,\s*(\d+)\)/.exec(STORE)||[])[1]);
ok("ARM B · INSTRUMENT: the plane's own ceiling for this op is read out of store.mjs, not typed here",
   Number.isFinite(RN_CEILING) && RN_CEILING > 0);
ok("ARM B · THE HAZARD IS REAL, MEASURED: what this screen asks for and what the plane clamps to are the SAME NUMBER, so an arm driven at the real ceiling would pass over a hand-typed figure — which is why every arm below is driven off it",
   CAND_ASK === RN_CEILING);

const candRouter = (count, wire, concernsWire, concernsDocs) => async (op, p) => {
  if(op === "readingname")
    return { ok:true, entity_id:"ENT-1", count,
             documents: Array.from({length:count}, (_,i)=>({
               capture_sha:`${i}`.padStart(64,"0"), bundle_id:`INFO-${i}`, ref:`R${i}`,
               label:"Oakland Police Department", correspondence:"name", grade_if_resolved:"C" })),
             names_unusable:[], detail:"",
             /* THE WIRE'S OWN BOUND KEYS, spread LAST and only when the arm
                supplies them — an arm that supplies none drives the branch where
                the record published nothing, which is NC (2)'s permanent home. */
             ...(wire || {}) };
  /* op=concerns's OWN wire keys, spread LAST and only when an arm supplies them.
     An arm that supplies none drives the branch where the record published no
     bound — which is where `op=concerns` was until REC-60 landed on 2026-08-07,
     and is the permanent home of this half's no-fallback control. The document
     list is supplied separately so an arm can make `count` and `limit` DISAGREE:
     a bound reported over the wrong set is the replacement overclaim. */
  if(op === "concerns") return {
    ok:true, entity_id:"ENT-1", found:true,
    documents: Array.from({length: concernsDocs || 0}, (_,i)=>({
      capture_sha:`c${i}`.padStart(64,"9"), bundle_id:`RES-${i}`, ref:`X${i}`,
      grade:"B", established:true, needs_confirmation:false })),
    count: concernsDocs || 0,
    ...(concernsWire || {}) };
  return {};
};
const loadCands = async (count, wire, concernsWire, concernsDocs) => {
  els.clear(); ROUTER = candRouter(count, wire, concernsWire, concernsDocs);
  U.INTENT_SUBJ.entity = { entity_id:"ENT-1", label:"Oakland Police Department" };
  await U.loadResolveCandidates();
  return html("#res-cands");
};

/* Deliberately unlike the ask, unlike the plane's ceiling, and unlike any figure
   in app.html — so the only way it can reach the screen is off the wire. */
const WIRE_BOUND = 137;
ok("ARM B · INSTRUMENT: the fixture's bound differs from the number this screen asks for, so a hand copy cannot agree with it for free",
   WIRE_BOUND !== CAND_ASK && WIRE_BOUND !== RN_CEILING);

const few = await loadCands(3, { limit: WIRE_BOUND, truncated: false });
ok("ARM B · THE BOUND IS THE RECORD'S: the sentence states the cap the plane APPLIED, read off the wire",
   new RegExp(`bound of ${WIRE_BOUND} documents`).test(few));
ok("ARM B · A HAND-TYPED NUMBER FAILS THIS: the figure this screen ASKED FOR appears nowhere in what a member reads",
   !new RegExp(`\\b${CAND_ASK}\\b`).test(few));
ok("ARM B · THE BOUND IS STATED ON EVERY ANSWER, not only when it bites — a bound a member is told about sometimes is one they cannot rely on",
   /bound of/.test(few));
/* SUPERSEDED AND CORRECTED, NEVER EXEMPTED (UI-42, 2026-08-07). THE OLD PIN READ:
 *
 *   ok("ARM B · and it says WHICH HALF it bounds, because op=concerns is uncapped
 *       and reporting the bound over the wrong set would be its own overclaim",
 *      /already resolved to this subject are added separately and are not capped/.test(few));
 *
 * WHY IT WAS WRONG. Its own text states the reason it went stale: *"because
 * op=concerns is uncapped"*. REC-60 capped `op=concerns` on 2026-08-07 at a default
 * of 500 and a ceiling of 5000, so the sentence this pin REQUIRED the screen to
 * show — "(Documents already resolved to this subject are added separately and are
 * not capped.)", printed on BOTH branches — became FALSE TO A MEMBER'S FACE. The
 * pin drove a FIXTURE, so it went on passing and held the falsehood in place: it
 * was not merely blind to the defect, it was the thing REQUIRING it. That is the
 * worst shape a pin can take and it is why this block is rewritten rather than
 * deleted, so the next reader meets the correction and not a gap.
 *
 * WHAT SURVIVES, and it is the half that was always right: reporting the bound
 * over the WRONG SET would be its own overclaim. `op=concerns` bounds the
 * RESOLUTION ROWS its join reads and then COLLAPSES them to distinct captures, so
 * a sentence reporting that number as a count of DOCUMENTS would replace one
 * overclaim with another. Every arm below is driven with `limit` and the document
 * count DELIBERATELY DIFFERENT so that the two cannot be confused for free. */
ok("ARM B · THE OTHER HALF'S BOUND IS NOW STATED TOO, because REC-60 capped `op=concerns` and an unstated bound reads as completeness",
   /bound of \d+ resolutions read/.test(few) || /did not say what bound it applied to the documents already resolved/.test(few));
ok("ARM B · AND THE FALSEHOOD IS GONE: no branch tells a member the already-resolved half is not capped",
   !/are not capped/.test(few));
ok("ARM B · an answer the record did not cut does not claim to have been cut",
   !/was CUT/.test(few));
/* UI-26's four SEMANTIC claims are untouched — UI-39 added a fifth and UI-41
   re-sourced it; neither replaced the four. Corrected pins, never exempted. */
ok("ARM B · UI-26's four semantic claims all survive: normalisation, the alias join, accents unfolded, absence-says-nothing",
   /ignores capitalisation and punctuation/.test(few)
   && /every name this subject is registered under/.test(few)
   && /does <b>not<\/b> ignore accents/.test(few)
   && /neither absence says anything about whether such a document exists/.test(few));

/* THE ARM THAT PROVES THE NUMBER IS READ RATHER THAN COPIED. Same screen, same
   call, a plane publishing a DIFFERENT bound — and the sentence must MOVE. */
const moved = await loadCands(3, { limit: WIRE_BOUND * 2, truncated: false });
ok("ARM B · IT MOVES WITH THE RECORD: a plane publishing a different bound moves the member's sentence with it",
   new RegExp(`bound of ${WIRE_BOUND * 2} documents`).test(moved));
ok("ARM B · and the previous answer's figure does NOT survive into it, which is what a copy would do",
   !new RegExp(`bound of ${WIRE_BOUND} documents`).test(moved));

const cutAns = await loadCands(WIRE_BOUND, { limit: WIRE_BOUND, truncated: true });
ok("ARM B · the record's own `truncated` is read and said, in place of this screen deciding it from a full page",
   /The record says this answer was CUT/.test(cutAns));

/* `truncated` IS NOT `count >= limit`, AND THIS ARM IS RED FOR THE OLD CODE.
   The plane sets it on `merged.length > cap || aliasPageFilled` — so a SHORT
   answer can still have been cut, at the alias page. UI-39's inference was
   FALSE here (3 >= 137 is false) and reported nothing at all. */
const aliasCut = await loadCands(3, { limit: WIRE_BOUND, truncated: true });
ok("ARM B · A SHORT ANSWER CAN STILL BE CUT: the plane also sets `truncated` when the ALIAS page filled, and the old `count >= limit` inference could never report that and never did",
   /The record says this answer was CUT/.test(aliasCut));

/* NC (2), PERMANENT: the record publishes no bound. */
const silent = await loadCands(3, null);
ok("ARM B · NO FALLBACK: where the record published no bound, the screen SAYS it does not know",
   /did not say what bound it applied to this lookup/.test(silent));
ok("ARM B · and it does not quietly substitute the number it asked for, which would read exactly as an answered bound does",
   !new RegExp(`\\b${CAND_ASK}\\b`).test(silent));
ok("ARM B · nor does it claim the answer was cut on an absent flag",
   !/was CUT/.test(silent));

ok("ARM B · and the call still carries a limit onto the wire, so the record has something to clamp",
   CALLS.some(c => c.op === "readingname" && Number(c.params.limit) === CAND_ASK));

/* ==========================================================================
 * ARM B2 — op=concerns's BOUND, THE RECORD'S OWN (UI-42, 2026-08-07).
 *
 * THE SAME SCREEN, THE OTHER HALF. This is the half that carried the live
 * overclaim, and the mechanism is the one UI-41 built for `op=readingname` beside
 * it — read `limit`/`truncated` off the wire, no fallback, three-way.
 *
 * THE HAZARD IS THE ONE THIS FILE KEEPS MEASURING AND IT IS WORSE HERE. The screen
 * asks `MEANING_ASK_LIMIT` = 500 and the plane's `#MEANING_LIMIT_DEFAULT` is ALSO
 * 500, so on the real plane a HAND-TYPED 500 in the surface would satisfy any arm
 * driven at the default, at zero cost, with the defect fully present. So the
 * fixture serves a bound that is neither the ask nor the plane's default nor its
 * ceiling, and both are READ OUT OF store.mjs rather than typed here.
 *
 * AND THE REPLACEMENT OVERCLAIM IS ARMED FOR SEPARATELY. `limit` is the ROWS the
 * join reads; `count` is the DOCUMENTS they collapse to, and REC-60 says at the
 * site that the two are not the same number for this op. So every arm below is
 * driven with `limit` and the document count DIFFERENT, and the sentence must
 * carry the rows figure attached to the word "resolutions" — a screen reporting
 * the bound over `documents` fails here, which is NC (3).
 * ========================================================================== */
const CONCERNS_ASK = Number((/const MEANING_ASK_LIMIT\s*=\s*(\d+)/.exec(SRC) || [])[1]);
/* THE PLANE'S OWN default and ceiling for op=concerns, read off its source. */
const MEANING_DEFAULT = Number((/#MEANING_LIMIT_DEFAULT\s*=\s*(\d+)/.exec(STORE) || [])[1]);
const MEANING_MAX = Number((/#MEANING_LIMIT_MAX\s*=\s*(\d+)/.exec(STORE) || [])[1]);
ok("ARM B2 · INSTRUMENT: the plane's own default and ceiling for the meaning-layer reads are read out of store.mjs, not typed here",
   Number.isFinite(MEANING_DEFAULT) && MEANING_DEFAULT > 0 && MEANING_MAX > MEANING_DEFAULT);
ok("ARM B2 · INSTRUMENT: and the surface's ask is read out of app.html, not typed here",
   Number.isFinite(CONCERNS_ASK) && CONCERNS_ASK > 0);
ok("ARM B2 · THE HAZARD IS REAL, MEASURED: what this screen asks op=concerns for and what the plane defaults to are the SAME NUMBER, so an arm driven at the default would pass over a hand-typed figure — which is why every arm below is driven off it",
   CONCERNS_ASK === MEANING_DEFAULT);

const C_BOUND = 271;          /* not the ask, not the default, not the ceiling */
const C_DOCS = 4;             /* and NOT the bound — rows collapse to documents */
ok("ARM B2 · INSTRUMENT: the fixture's bound is unlike the ask, the plane's default and its ceiling, so nothing in this file or that one can agree with it for free",
   C_BOUND !== CONCERNS_ASK && C_BOUND !== MEANING_DEFAULT && C_BOUND !== MEANING_MAX);
ok("ARM B2 · INSTRUMENT: and the rows bound differs from the document count, so a sentence reporting the bound over the WRONG SET cannot pass by coincidence",
   C_BOUND !== C_DOCS);

const cFew = await loadCands(3, { limit: WIRE_BOUND, truncated: false },
                                { limit: C_BOUND, truncated: false }, C_DOCS);
ok("ARM B2 · THE BOUND IS THE RECORD'S: op=concerns's own published `limit` reaches the member's sentence",
   new RegExp(`bound of ${C_BOUND} resolutions read`).test(cFew));
ok("ARM B2 · A HAND-TYPED NUMBER FAILS THIS: what this screen ASKED op=concerns for appears nowhere in what a member reads",
   !new RegExp(`bound of ${CONCERNS_ASK}\\b`).test(cFew));
ok("ARM B2 · A HAND-WRITTEN \"not capped\" FAILS THIS: no branch of this screen tells a member the already-resolved half is uncapped",
   !/not capped/.test(cFew) && !/uncapped/.test(cFew));
/* NC (3): THE REPLACEMENT OVERCLAIM. REC-60's distinction, asserted rather than
   trusted — the bound is over the rows the join READS, not over the documents
   they COLLAPSE TO, and both spellings of getting that wrong are pinned. */
ok("ARM B2 · NOT OVER THE WRONG SET: the bound is attached to RESOLUTIONS, never presented as a number of documents",
   !new RegExp(`bound of ${C_BOUND} documents`).test(cFew));
ok("ARM B2 · NOR IS THE DOCUMENT COUNT PRESENTED AS THE BOUND: `count` is what the rows collapsed to and is a different fact",
   !new RegExp(`bound of ${C_DOCS}\\b`).test(cFew));
ok("ARM B2 · and the sentence SAYS which set it bounds, in the record's own distinction, so a member is not left to infer it",
   /over the resolutions the record reads, not over the documents they collapse to/.test(cFew));
ok("ARM B2 · an answer the record did not cut does not claim to have been cut",
   !/that answer was CUT/.test(cFew));

/* THE ARM THAT PROVES THE NUMBER IS READ RATHER THAN COPIED (NC 2). */
const cMoved = await loadCands(3, { limit: WIRE_BOUND, truncated: false },
                                  { limit: C_BOUND * 3, truncated: false }, C_DOCS);
ok("ARM B2 · IT MOVES WITH THE RECORD: a plane publishing a different bound for op=concerns moves the member's sentence with it",
   new RegExp(`bound of ${C_BOUND * 3} resolutions read`).test(cMoved));
ok("ARM B2 · and the previous answer's figure does NOT survive into it, which is what a copy would do",
   !new RegExp(`bound of ${C_BOUND} resolutions`).test(cMoved));

const cCut = await loadCands(3, { limit: WIRE_BOUND, truncated: false },
                                { limit: C_BOUND, truncated: true }, C_DOCS);
ok("ARM B2 · the record's own `truncated` is read and said, in place of this screen deciding it from a full page",
   /The record says that answer was CUT/.test(cCut));
ok("ARM B2 · A SHORT ANSWER CAN STILL BE CUT: four documents came back against a bound of 271 rows, and the record still says it held rows back — an inference from the document count could never report that",
   C_DOCS < C_BOUND && /that answer was CUT/.test(cCut));

/* NC (2), PERMANENT: op=concerns publishes no bound — its shape before REC-60. */
const cSilent = await loadCands(3, { limit: WIRE_BOUND, truncated: false }, null, C_DOCS);
ok("ARM B2 · NO FALLBACK: where the record published no bound for this half, the screen SAYS it does not know",
   /did not say what bound it applied to the documents already resolved to this subject/.test(cSilent));
ok("ARM B2 · and it does not quietly substitute the number it asked for",
   !new RegExp(`bound of ${CONCERNS_ASK}\\b`).test(cSilent));
ok("ARM B2 · nor does it fall back to the OTHER half's bound, which is on the same screen and would read exactly like an answer",
   !new RegExp(`${WIRE_BOUND} resolutions`).test(cSilent));
ok("ARM B2 · nor does it claim that half was cut on an absent flag",
   !/that answer was CUT/.test(cSilent));
/* AND IT DOES NOT SAY "not capped" THERE EITHER — the branch the old code shared
   the falsehood across. Both branches, which is how it reached a member whether
   or not the plane had spoken. */
ok("ARM B2 · THE FALSEHOOD IS GONE FROM BOTH BRANCHES, which is how it reached a member whether or not the record had stated a bound",
   !/not capped/.test(cSilent) && !/not capped/.test(cFew));

ok("ARM B2 · and the call carries an explicit ask onto the wire, so the record has something to clamp and the surface is not inheriting a cap in silence",
   CALLS.some(c => c.op === "concerns" && Number(c.params.limit) === CONCERNS_ASK));

/* THE SAME FUNCTION, THE OTHER SCREEN. ARM D's pattern: no wording is asserted
   here, only that the two screens cannot drift into saying different things about
   one op's bound, so a DEC-49 ruling moves both by editing one place. */
const SUBJ_CONCERNS = U.subjConcernsHtml({ documents:[], count:0, limit:C_BOUND, truncated:false });
ok("ARM B2 · ONE FUNCTION, BOTH SCREENS: the subject view states op=concerns's bound off the same wire keys through the same function",
   SUBJ_CONCERNS.includes(U.concernsBoundHtml({ limit:C_BOUND, truncated:false }, "this list")));
ok("ARM B2 · and the subject view's figure moves with the record too",
   U.subjConcernsHtml({ documents:[], limit:C_BOUND*2, truncated:false })
     .includes(`bound of ${C_BOUND*2} resolutions read`));
ok("ARM B2 · the shared sentence is composed ONCE: `concernsBoundHtml` is declared once and called from both screens",
   (SRC.match(/^function concernsBoundHtml\(/gm)||[]).length === 1
   && (SRC.match(/concernsBoundHtml\(/g)||[]).length >= 3);
ok("ARM B2 · and a read that FAILED says nothing about a bound, rather than inventing one over an answer nobody gave",
   !/bound of/.test(U.subjConcernsHtml({ _err:true, documents:[] })));

/* ==========================================================================
 * ARM C — op=queue / op=tasks: `truncated` and `counts`, published and now read.
 * ========================================================================== */
const queueRouter = (truncated, resolvedTotal, resolvedRows, tasksWire) => async (op) => {
  if(op === "queue") return { ok:true, member:"dana", items:[], item_count:2, truncated,
                              classes:["OBLIGATION","FINDING","CONDITION"], classes_deferred:[],
                              ancestor_depth_bound:3,
                              mute:{ personal:true, cases:[], suppressed:[], suppressed_count:0, detail:"" },
                              counts:{ obligation:1, finding:1, condition:0, ungrouped:0,
                                       case_undetermined:0, suppressed:0 } };
  if(op === "tasks") return { ok:true, tasks: Array.from({length:resolvedRows},(_,i)=>({
                                id:`T${i}`, status:"resolved", kind:"authority_undetermined",
                                assignee:"dana", created:"2026-08-01T00:00:00Z", history:[] })),
                              counts:{ open:0, forwarded:0, resolved:resolvedTotal, queued:0 },
                              /* Spread LAST, and only where the arm supplies it:
                                 an arm that supplies none drives the branch where
                                 `op=tasks` published no truncation signal at all,
                                 which is what it did before REC-57. */
                              ...(tasksWire || {}) };
  return {};
};
const paintQueue = async (truncated, resolvedTotal, resolvedRows, tasksWire) => {
  els.clear(); ROUTER = queueRouter(truncated, resolvedTotal, resolvedRows, tasksWire);
  await U.queueRun(["queue","resolutions"]);
  return html("#q");
};

/* THE SWEEP'S OWN FIND (UI-41), and this block is CORRECTED rather than exempted
   (2026-08-05). UI-39 wrote the arm below to assert the resolutions bound was
   INFERRED from `counts.resolved` against the rows delivered, and worded as the
   inference it then was — because `op=tasks` published no truncation flag. REC-57
   gave it `limit` and `truncated` in `op=queue`'s spelling exactly, so the
   inference is retired here and the arms assert the RECORD's flag.
   The plane says in its own words why the inference was never equivalent:
   `counts` is per STATUS over the whole visible set and takes no notice of
   `assignee` or `refers`, so it answers a question about a population the page's
   rows are not always drawn from. */
const TASKS_WIRE_BOUND = 89;   /* not RESOLUTIONS_LIMIT, not any figure in app.html */
ok("ARM C · INSTRUMENT: the resolutions fixture's bound differs from what the screen asks for, so a hand copy cannot agree with it for free",
   TASKS_WIRE_BOUND !== U.QUEUE_LIMIT);

const clean = await paintQueue(false, 2, 2, { limit: TASKS_WIRE_BOUND, truncated: false });
ok("ARM C · a complete answer states no bound, so the line means something when it appears",
   !/This is not the whole queue/.test(clean) && !/Not everything that was answered is listed/.test(clean));
ok("ARM C · and a record that SAID it did not cut the answer earns silence, rather than an 'it did not say' line",
   !/did not say whether it held resolved items back/.test(clean));
ok("ARM C · and both feeds carried their limit onto the wire",
   CALLS.some(c => c.op==="queue" && Number(c.params.limit) === U.QUEUE_LIMIT)
   && CALLS.some(c => c.op==="tasks" && Number(c.params.limit) > 0));

const cut = await paintQueue(true, 731, 200, { limit: TASKS_WIRE_BOUND, truncated: true });
ok("ARM C · the plane's own `truncated` is READ and SAID: this screen no longer shows a page as the queue",
   /This is not the whole queue/.test(cut) && /held items back/.test(cut));
ok("ARM C · THE RESOLUTIONS BOUND IS THE RECORD'S FLAG NOW, not this screen's arithmetic",
   /Not everything that was answered is listed/.test(cut) && /held resolved items back/.test(cut));
ok("ARM C · and the bound it names is the one the RECORD applied, read off the wire — a hand-typed figure fails this",
   new RegExp(`at a bound of ${TASKS_WIRE_BOUND}`).test(cut));
ok("ARM C · IT MOVES WITH THE RECORD: a plane publishing a different bound moves the sentence",
   new RegExp(`at a bound of ${TASKS_WIRE_BOUND * 3}`).test(
     await paintQueue(true, 731, 200, { limit: TASKS_WIRE_BOUND * 3, truncated: true })));
ok("ARM C · `counts.resolved` is still stated beside it, because it is the record's own count of the whole visible set and a different fact",
   /counts <b>731<\/b> resolved in all/.test(cut));

/* RED FOR THE OLD INFERENCE, and this is the arm that measures the difference.
   The record says it CUT the answer while `counts.resolved` EQUALS the rows
   delivered — so UI-39's `total > got` is FALSE here and would have reported
   nothing at all, on an answer the record itself says was cut. */
const equalCounts = await paintQueue(false, 200, 200, { limit: TASKS_WIRE_BOUND, truncated: true });
ok("ARM C · A CUT ANSWER WHOSE COUNTS AGREE IS STILL REPORTED: `counts.resolved` equals the rows sent, so the old `total > got` arithmetic said nothing — the record's own flag says it was cut, and the screen now says so",
   /Not everything that was answered is listed/.test(equalCounts));

/* NC (2), PERMANENT: `op=tasks` publishes no truncation signal — its pre-REC-57
   shape. The screen must say it does not know, NOT fall back to the arithmetic. */
const noFlag = await paintQueue(false, 731, 200, null);
/* Anchored on the CUT HEADLINE, not on "held resolved items back" — the
   does-not-know sentence contains that phrase too, and this suite's first draft
   asserted its absence and went RED against correct behaviour. A pin that
   measures a substring where the CLAIM is what matters is the D-160 shape. */
ok("ARM C · NO FALLBACK TO ARITHMETIC: with no `truncated` on the wire the screen does not manufacture a bound out of `counts` against the rows",
   !/Not everything that was answered is listed/.test(noFlag));
ok("ARM C · IT SAYS IT DOES NOT KNOW instead, because an unstated bound reads as completeness",
   /did not say whether it held resolved items back/.test(noFlag));

/* ==========================================================================
 * ARM D — the FALSEHOOD, and DEC-49 held OPEN.
 * ========================================================================== */
const lookupHtml = async (entities) => {
  els.clear();
  ROUTER = async (op) => op === "entitybyalias" ? { ok:true, entities, count:entities.length } : {};
  ctx.document.querySelector("#subj-q").value = "Sheng Thao";
  await U.lookupSubject();
  return html("#subj-res");
};
const none = await lookupHtml([]);

/* THE FALSEHOOD IS GONE. This is the pin that is RED for the defect. */
ok("ARM D · THE AFFIRMATIVE FALSE STATEMENT IS DELETED: the screen no longer tells a member that a name it did not find has not been entered",
   !/has not been entered yet/.test(none));
/* SWEPT OVER THE CODE, NOT OVER THE COMMENTS — and the distinction is D-160's,
   which UI-27 met in exactly this shape. The two block comments that record WHY
   this sentence was deleted necessarily quote it; a guard that forbade that would
   force the next reader to dig the correction out of git. Comments are stripped
   and the CODE — every string a member can reach — is what is swept. */
const SRC_CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, "");
ok("ARM D · INSTRUMENT: stripping comments leaves the file's actual code, not an empty string",
   SRC_CODE.length > SRC.length * 0.4 && /function lookupSubject/.test(SRC_CODE));
ok("ARM D · and no member-facing string anywhere else in the file says it either",
   !/has not been entered yet/.test(SRC_CODE));
ok("ARM D · INSTRUMENT: the sweep still SEES the sentence when it is in code — it is not passing because it strips everything",
   /has not been entered yet/.test(SRC));
ok("ARM D · what replaces it says what the lookup CANNOT tell you, which is the true fact",
   /cannot tell you it exists/.test(none));
ok("ARM D · the clause that was TRUE is kept rather than thrown out with the false one",
   /registry holds only subjects a member has declared/.test(none));

/* HELD OPEN AS A RELATION. This asserts NO WORDING — only that the two screens
   say the SAME thing. DEC-49 can rule any wording it likes and this pin stays
   green; what it cannot do is let the two drift apart again. */
const finderPanel = U.finderSubjectsPanelHtml({ asked:true, byId:false, entities:[], documents:[] }, []);
const SHARED = U.registryNameBoundHtml();
ok("ARM D · RELATION, NOT A RULING: the subject screen and the finder render the SAME sentence about what a name lookup cannot establish — no particular wording is asserted here",
   none.includes(SHARED) && finderPanel.includes(SHARED) && SHARED.length > 80);
ok("ARM D · and it travels through ONE function, so a DEC-49 ruling moves both screens by editing one place",
   (SRC.match(/registryNameBoundHtml\(\)/g)||[]).length >= 3
   && (SRC.match(/^function registryNameBoundHtml\(/gm)||[]).length === 1);
ok("ARM D · the sentence is not composed twice: the literal appears once in the file",
   (SRC.match(/A subject spelled differently in the record/g)||[]).length === 1);

/* THE FOUR-LEVEL RULE. Absence in the registry is not absence in the record.
   CORRECTED FROM THIS SUITE'S OWN FIRST DRAFT, which asserted `!/does not exist/`
   and went RED against a sentence that is TRUE — "the reverse read that would
   widen it does not exist yet" is a statement about a MISSING CAPABILITY, not
   about the subject. The pin was measuring a substring where the claim is what
   matters, so it is written as the claim: the screen must never say the SUBJECT
   is absent from the record, in any of the three shapes it could take. */
const CLAIMS_SUBJECT_ABSENT =
  /(subject|name)[^.]{0,60}(does not exist|is not in the record|has never been)/i.test(none)
  || /has not been entered/i.test(none)
  || /no such subject exists/i.test(none);
ok("ARM D · absence at one level is not offered as evidence about the next: the screen states what it CANNOT establish and never that the subject is absent",
   /cannot tell you it exists/.test(none) && !CLAIMS_SUBJECT_ABSENT);
ok("ARM D · INSTRUMENT: and that pin bites — the sentence it replaced trips it",
   /has not been entered/i.test("a name that is not here has not been entered yet"));

/* ==========================================================================
 * ARM E — THE CLASS SWEEP (UI-41): every surface that composes a bound sentence,
 * not the two this item named.
 *
 * THE RULE THIS WALK ENFORCES, in one line: a number a member reads as a BOUND
 * must have come off the wire. A bound constant this file declares is a REQUEST
 * PARAMETER — legitimate in a call, never in a sentence — so the walk flags any
 * such constant that reaches a TEMPLATE INTERPOLATION, which is the only way a
 * value in this file becomes text a member can read.
 *
 * WHY IT IS ANCHORED THIS WAY RATHER THAN ON WORDING. Anchoring on phrases ("at
 * most", "the first N") would make the walk a test of its author's vocabulary,
 * and the next screen to state a bound in different words would pass while doing
 * exactly the thing this item exists to stop. The constant is the wire-side fact.
 *
 * WHAT IT DOES NOT MEASURE, stated so nobody trusts it for more: it cannot see a
 * bound written as a LITERAL directly inside a sentence (no constant to catch),
 * and it says nothing about ops bounded some other way. It is one walk, and its
 * reach is asserted as a DELTA rather than as a zero.
 * ========================================================================== */

/* Bound constants this file declares. `const A = 500, B = 500;` yields both. */
const boundConsts = (text) => {
  const out = new Set();
  const re = /\b([A-Z][A-Z0-9_]*(?:LIMIT|MAX|CAP|PAGE))\s*=\s*\d+/g;
  let m; while((m = re.exec(text))) out.add(m[1]);
  return out;
};

/* Is offset `i` inside a `${ ... }` interpolation? Scanned backwards counting
   braces, NEVER with `[^}]*` — UI-39 measured that class of matcher stopping at
   a `}` that was not the one it wanted, and reading a bound that was there as
   missing. Brace-balanced, per CLAUDE.md's own instruction. */
const insideInterpolation = (text, i) => {
  let depth = 0;
  for(let j = i; j > 1; j--){
    const ch = text[j];
    if(ch === "}") depth++;
    else if(ch === "{"){
      if(depth === 0) return text[j-1] === "$";
      depth--;
    }
  }
  return false;
};
ok("ARM E · INSTRUMENT: the interpolation detector says YES inside `${...}`",
   insideInterpolation("x = `a ${FOO} b`", "x = `a ${F".length - 1));
ok("ARM E · INSTRUMENT: and NO outside it, so it is not simply answering yes",
   !insideInterpolation("const FOO = 5; call(FOO);", "const FOO = 5; call(F".length - 1));
ok("ARM E · INSTRUMENT: and it is not fooled by a `}` that closes something else first",
   !insideInterpolation("f({a:1}); FOO;", "f({a:1}); F".length - 1));

/* Every bound constant that reaches member-facing text. */
const authoredBounds = (text) => {
  const consts = boundConsts(text);
  const out = [];
  for(const c of consts){
    const re = new RegExp("\\b" + c + "\\b", "g");
    let m; while((m = re.exec(text)))
      if(insideInterpolation(text, m.index)) out.push(c);
  }
  return out;
};

const SURFACE_CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
ok("ARM E · INSTRUMENT: stripping comments leaves real code, so the walk is not passing over an empty string",
   SURFACE_CODE.length > SRC.length * 0.4 && /function loadResolveCandidates/.test(SURFACE_CODE));
ok("ARM E · WALK GUARD: the file really does declare bound constants, so the walk has something to find",
   boundConsts(SURFACE_CODE).size >= 4);

const AUTHORED = authoredBounds(SURFACE_CODE);
if(AUTHORED.length) console.error("  bound constants reaching member-facing text:", [...new Set(AUTHORED)].join(", "));
ok("ARM E · THE CLASS IS CLEAR: no bound constant this file declares reaches a sentence a member reads — every stated bound comes off the wire",
   AUTHORED.length === 0);

/* REACH AS A DELTA. A walk that matches nothing reports zero and passes forever.
   So the same walk is run over a copy carrying UI-39's OWN authored sentence,
   restored verbatim, and must find MORE. The absolute is worthless; the
   difference is the evidence. */
const REGRESSED = SURFACE_CODE.replace(
  "const planeBound = Number(ans.limit);",
  "const planeBound = Number(ans.limit);\n  const candBoundOld = ` This screen asks the record for at most ${RESOLVE_CAND_LIMIT} documents by name.`;");
ok("ARM E · INSTRUMENT: the regression copy really was modified, so the delta below compares two different things",
   REGRESSED !== SURFACE_CODE && REGRESSED.length > SURFACE_CODE.length);
ok("ARM E · REACH IS A DELTA: restoring UI-39's authored bound makes this walk find MORE than it finds on the file as it stands",
   authoredBounds(REGRESSED).length > AUTHORED.length);
ok("ARM E · and it names the constant it caught, rather than merely counting",
   authoredBounds(REGRESSED).includes("RESOLVE_CAND_LIMIT"));

/* OVER-STRICTNESS. A genuinely correct alternative, phrased unlike anything in
   this file and reading fields in a different style, must PASS — otherwise the
   walk is testing its author's habits rather than the property. */
const HONEST_ALT = "const MY_PAGE = 20;\n"
  + "call({limit:String(MY_PAGE)});\n"
  + "const s = `the record capped this answer at ${a.limit} rows`;\n"
  + "const u = `it reports ${a.truncated ? 'more beyond this page' : 'nothing held back'}`;\n"
  + "const v = `${b.remaining} still to go`;";
ok("ARM E · OVER-STRICTNESS: a correct alternative that reads the wire in words this file never uses PASSES the walk",
   authoredBounds(HONEST_ALT).length === 0);
ok("ARM E · INSTRUMENT: and the same alternative with its bound AUTHORED instead is caught, so the arm above is not passing because the walk is blind",
   authoredBounds(HONEST_ALT.replace("${a.limit} rows", "${MY_PAGE} rows")).length === 1);

/* THE TWO SITES, PINNED ON THE FIELDS THEY READ — asserting no wording, so
   DEC-49 can rule any way it likes and these hold. */
ok("ARM E · op=readingname's surface reads the record's own `limit` and `truncated`, and derives neither",
   /Number\(ans\.limit\)/.test(SURFACE_CODE) && /ans\.truncated === true/.test(SURFACE_CODE));
ok("ARM E · and it no longer decides truncation from a full page, which was never what the plane's flag meant",
   !/Number\(ans\.count\)\s*>=\s*RESOLVE_CAND_LIMIT/.test(SURFACE_CODE));
ok("ARM E · op=tasks's surface reads the record's own `truncated`, and no longer infers a bound from `counts` arithmetic",
   /r\.truncated === true/.test(SURFACE_CODE)
   && !/Number\.isFinite\(total\) && got != null && total > got/.test(SURFACE_CODE));

/* ==========================================================================
 * ARM F — THE COMPLETENESS-CLAIM SWEEP (UI-42, 2026-08-07).
 *
 * WHAT ARM E CANNOT SEE, AND IT IS WHAT BIT. ARM E walks BOUND CONSTANTS reaching
 * member-facing text — a NUMBER a member reads must have come off the wire. The
 * sentence that made this item necessary carried NO NUMBER AT ALL:
 *
 *   "(Documents already resolved to this subject are added separately and are not
 *    capped.)"
 *
 * It is a completeness claim in WORDS, so ARM E was structurally incapable of
 * seeing it, and it was TRUE when written — the defect was created two hours
 * earlier by a change on the PLANE, with nothing in this repository edited. An
 * unstated bound reads as completeness; a STATED-AND-NOW-FALSE one is worse,
 * because a member has been told a thing rather than left to assume it.
 *
 * THE RULE THIS WALK ENFORCES, in one line: a member-facing sentence may not
 * assert that something is uncapped, unlimited or unbounded inside a surface that
 * READS AN UNCONDITIONALLY-CAPPED OP. The op roster is WALK 1's — the plane's own
 * fact — so the day the plane caps a tenth read, every surface that reads it is
 * re-checked with nobody editing this file. That is the whole point: this defect
 * was created by a plane change and no UI suite could see it.
 *
 * WHY IT IS ANCHORED ON THE CLAIM AND NOT ON THE OP'S NAME. A sentence naming its
 * op would be a test of this file's habits. The vocabulary is instead the small
 * set of ways English asserts non-limitation, and it is deliberately NARROW: only
 * ASSERTIONS, never the negations this file is full of ("this list is not read as
 * the whole of what exists" is the honest form and must PASS).
 *
 * WHAT IT DOES NOT MEASURE, stated so nobody trusts it for more. It cannot see a
 * completeness claim phrased with no word from its vocabulary ("this is the list"),
 * it judges by FUNCTION and so cannot see a claim rendered by a helper several
 * calls from the read, and it says nothing about ops bounded some other way. Its
 * reach is asserted as a DELTA and its corpus is PRINTED, never as a zero.
 * ========================================================================== */
const UI_DIR = new URL("../", import.meta.url);
const UI_FILES = fs.readdirSync(UI_DIR)
  .filter(f => /\.(html|mjs|js)$/.test(f))
  .map(f => ({ file: f, text: fs.readFileSync(new URL(f, UI_DIR), "utf8") }));

/* ASSERTIONS of non-limitation only. Negations — "not read as the whole of what
   exists", "cannot tell you whether all of them are here" — are the HONEST form
   and are not claims; a walk that flagged them would push a surface toward saying
   less about what it does not know, which is the opposite of the rule. */
const COMPLETENESS_CLAIM =
  /\buncapped\b|\b(?:are|is|was|were)\s+not\s+capped\b|\bnot\s+capped\b|\bno\s+cap\b|\b(?:are|is|was|were)\s+not\s+limited\b|\b(?:are|is|was|were)\s+not\s+bounded\b/gi;

/* Comments stripped: the two block comments recording WHY the sentence was
   deleted necessarily quote it, and a guard forbidding that would force the next
   reader to dig the correction out of git. D-160's distinction, ARM D's precedent. */
const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const functionsOf = (code) => {
  const out = [];
  const re = /^(?:async\s+)?function\s+([A-Za-z0-9_$]+)/gm;
  let m; while((m = re.exec(code))) out.push({ name: m[1], at: m.index });
  return out.map((f, i) => ({ name: f.name,
    body: code.slice(f.at, i + 1 < out.length ? out[i + 1].at : code.length) }));
};
/* THE ONE FUNCTION BOTH THE REAL PATH AND THE MUTATED PATH GO THROUGH. A sourcing
   arm went green over a complete hand copy two items ago precisely because the
   mutated copy was validated by a parallel reader; here the regression copy below
   is fed to THIS function and nothing else. */
const completenessFindings = (files, cappedOps) => {
  const findings = [];
  let functions = 0, reading = 0, claimsAnywhere = 0;
  for(const { file, text } of files){
    const code = stripComments(text);
    for(const f of functionsOf(code)){
      functions++;
      const ops = cappedOps.filter(o => new RegExp(`recR\\("${o}"`).test(f.body));
      if(ops.length) reading++;
      const hits = f.body.match(COMPLETENESS_CLAIM);
      if(!hits) continue;
      claimsAnywhere += hits.length;
      if(!ops.length) continue;
      /* THE LINE IN THE FILE AS IT SITS ON DISK, not in the comment-stripped copy
         the walk reads — a line number a reader cannot open is not a location.
         SEARCHED FROM THE FUNCTION'S OWN DECLARATION FORWARD, never from the top
         of the file: the block comments that RECORD this defect quote the
         sentence, so a search from position zero reports the comment's line and
         sends the reader to the explanation instead of the code. Measured: it
         did exactly that on the first draft. `null` when the claim cannot be
         located in the original, which is STATED rather than guessed. */
      const claims = [...new Set(hits)];
      const head = text.search(new RegExp(`^(?:async\\s+)?function\\s+${f.name}\\b`, "m"));
      const at = text.indexOf(claims[0], head < 0 ? 0 : head);
      findings.push({ file, fn: f.name, ops, claims,
        line: at < 0 ? null : text.slice(0, at).split("\n").length });
    }
  }
  return { findings, functions, reading, claimsAnywhere };
};

const CAPPED_OPS = [...OPS.keys()];
const F = completenessFindings(UI_FILES, CAPPED_OPS);
console.log(`  ARM F CORPUS: ${UI_FILES.length} files in civicos-ui/ · ` +
  `${UI_FILES.reduce((a,x)=>a+stripComments(x.text).length,0)} chars of code after comments stripped · ` +
  `${F.functions} functions · ${F.reading} of them read one of the ${CAPPED_OPS.length} unconditionally-capped ops · ` +
  `${F.claimsAnywhere} completeness claims anywhere in the corpus`);

ok("ARM F GUARD: the walk reaches a real corpus — files, functions, and functions that actually read a capped op",
   UI_FILES.length >= 3 && F.functions >= 200 && F.reading >= 3);
ok("ARM F GUARD: and the op roster it checks against is WALK 1's, the plane's own fact, not a list written here",
   CAPPED_OPS.includes("concerns") && CAPPED_OPS.length === OPS.size);

const nameFinding = (x) =>
  `civicos-ui/${x.file}:${x.line ?? "?"} — ${x.fn}() claims ${JSON.stringify(x.claims)} while reading op=${x.ops.join(", op=")}, which the plane caps`;
if(F.findings.length) for(const x of F.findings) console.error(`         ${nameFinding(x)}`);
ok("ARM F · THE CLASS IS CLEAR: no member-facing surface asserts something is uncapped, unlimited or unbounded while reading an op the plane bounds",
   F.findings.length === 0);

/* REACH AS A DELTA, and the regression copy is the REAL SENTENCE restored
   VERBATIM — the one that shipped, not a paraphrase of it.
   INJECTED AT A DIFFERENT SURFACE FROM THE ONE THE DEFECT LIVED AT, and that is
   deliberate: the first draft of this arm anchored its injection on the very line
   the defect removes, so with the defect restored the injection silently became a
   no-op and the delta arm went red for the WRONG REASON. Measuring REACH and
   catching the defect are two different jobs, and the class arm above does the
   second. `progPaintInstance` READS op=concerns — which the first draft's chosen
   host, `subjConcernsHtml`, does NOT: it renders the answer another function
   fetched, so the injected claim landed somewhere the rule does not apply and the
   delta read 0 -> 0. That was the walk correctly declining to flag a surface that
   reads nothing, and it is recorded because it is the same distinction the rule
   itself turns on. */
const OVERCLAIM = " (Documents already resolved to this subject are added separately and are not capped.)";
const REGRESSED_FILES = UI_FILES.map(x => x.file !== "app.html" ? x : ({ file: x.file,
  text: x.text.replace("async function progPaintInstance(){",
                       "async function progPaintInstance(){ const claim = `" + OVERCLAIM + "`;") }));
ok("ARM F · INSTRUMENT: the regression copy really was modified, so the delta below compares two different things",
   REGRESSED_FILES.find(x=>x.file==="app.html").text !== SRC);
const FR = completenessFindings(REGRESSED_FILES, CAPPED_OPS);
ok("ARM F · REACH IS A DELTA: restoring the sentence that shipped makes this walk find MORE than it finds on the file as it stands",
   FR.findings.length > F.findings.length);
ok("ARM F · AND IT NAMES THE FILE, THE LINE, THE SURFACE AND THE OP THAT CAPS, rather than merely counting",
   FR.findings.some(x => x.file === "app.html" && x.fn === "progPaintInstance"
                      && x.ops.includes("concerns") && Number.isFinite(x.line) && x.line > 0
                      && x.claims.some(c => /not capped/i.test(c))));
console.log(`     ARM F REACH DELTA: the shipped sentence injected -> findings ${F.findings.length} -> ${FR.findings.length}` +
  (FR.findings.length ? ` · ${FR.findings.map(nameFinding).join(" · ")}` : ""));

/* NEUTERED-WALK CONTROL, PERMANENT: an empty roster must make the walk find
   NOTHING even with the overclaim restored — so a green ARM F over a roster that
   silently emptied can never be mistaken for a clean result. This is the failure
   mode that made a ceiling test pass trivially over nothing. */
ok("ARM F · A NEUTERED ROSTER FINDS NOTHING, which is why the delta above and not the absolute is the evidence",
   completenessFindings(REGRESSED_FILES, []).findings.length === 0);

/* OVER-STRICTNESS. Two correct alternatives, phrased unlike anything in this file
   and reading the wire in a different style, must PASS. */
const ALT_HONEST = [{ file:"alt.mjs", text:
    "function altPanel(){ const r = await recR(\"concerns\", { id, limit:\"7\" });\n"
  + "  return `the record read ${r.limit} rows here and ${r.truncated ? 'held some back' : 'held none back'}`; }" }];
ok("ARM F · OVER-STRICTNESS: a surface that reads a capped op and states its bound in words this file never uses PASSES",
   completenessFindings(ALT_HONEST, CAPPED_OPS).findings.length === 0);
const ALT_NEGATED = [{ file:"alt.mjs", text:
    "function altPanel2(){ const r = await recR(\"concerns\", { id, limit:\"7\" });\n"
  + "  return `this list is not read as the whole of what exists, and nothing here says every one that exists is present`; }" }];
ok("ARM F · OVER-STRICTNESS: and an HONEST NEGATION — a surface saying it is NOT complete — passes, because flagging it would push surfaces toward saying less about what they do not know",
   completenessFindings(ALT_NEGATED, CAPPED_OPS).findings.length === 0);
const ALT_CLAIM = [{ file:"alt.mjs", text:
    "function altPanel3(){ const r = await recR(\"connections\", { id, limit:\"7\" });\n"
  + "  return `these are all of them; the list is not limited`; }" }];
ok("ARM F · INSTRUMENT: and the same alternative CLAIMING non-limitation IS caught, so the two arms above are not passing because the walk is blind",
   completenessFindings(ALT_CLAIM, CAPPED_OPS).findings.length === 1);
/* FRESH regexes on both sides: `COMPLETENESS_CLAIM` carries /g, and `.test` on a
   global regex advances `lastIndex` — a polarity arm that shared one instance
   would be testing from wherever the previous call stopped. */
const claimRe = () => new RegExp(COMPLETENESS_CLAIM.source, "i");
ok("ARM F · POLARITY: the claim detector is RED on the sentence that shipped and GREEN on the honest form, never the reverse",
   claimRe().test("added separately and are not capped")
   && !claimRe().test("the record answered this at a bound of 271 resolutions read"));

console.log(`bound-sweep: ${n} assertions${bad?`, ${bad} FAILED`:", all green"} — THREE WALKS whose reach is asserted AS A DELTA (the plane's own capped-op roster read off store.mjs/query.mjs, then every app.html call site anchored on the wire name) · ARM A drives the REAL addGo over a match planted at row ${HELD_AT} of ${ROWS_N} and asserts op=promote NEVER REACHES THE WIRE, with the trap proved armed (the match is absent from the page the unpaged read saw) · a bounded walk reports its bound instead of answering null, and that bound lands IN THE BUNDLE · ARM B states op=readingname's bound as the RECORD's own limit/truncated, driven at a bound the screen never asked for so a hand-typed figure FAILS, and with no fallback when the record publishes none · ARM C does the same for op=tasks, retiring the counts arithmetic UI-39 had to infer from, with an arm RED for that inference (a cut answer whose counts agree) · ARM E sweeps the CLASS: no bound constant this file declares reaches a sentence a member reads, proved as a DELTA against UI-39's restored wording and with an over-strictness arm · ARM D deletes an affirmative falsehood and holds DEC-49 OPEN as a RELATION, asserting no wording · ARM B2 states op=concerns's bound as the RECORD's own limit/truncated after REC-60 capped it, driven at a bound that is neither the ask nor the plane's default nor its ceiling and with the row bound DIFFERENT from the document count, so both a hand-typed figure AND a bound reported over the wrong set FAIL · ARM F sweeps the CLASS THE NUMBER WALKS CANNOT SEE: no member-facing surface asserts something is uncapped, unlimited or unbounded while reading an op the plane bounds, proved as a DELTA against the sentence that actually shipped and with three over-strictness arms · and WALK 1 is REBUILT, because UI-39's \`limit = <digits>\` matcher was blind to five capped methods and was itself the reason this defect did not announce itself`);
if(bad) process.exit(1);
