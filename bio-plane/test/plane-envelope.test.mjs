/* NEGATIVE CONTROL: RUN 2026-08-05 (rec52-agent), NINE ARMS, each broken ALONE against the FINAL files and every file restored BYTE-IDENTICALLY — sha256 index.mjs 469c2af3b2e1af0a…, plane-envelope.test.mjs 719222e59aead07e…, do-fail-worker.mjs 77be03389e432c26… before and after ALL of them. Whole = 46/46. (a) THE ITEM'S SITE (a) — section 7a's `const out = await r.json(); return json({ok:true, ...out.result}, 200)` restored -> 43 pass, 3 FAIL: the SOURCE sweep names the site ("1628:out"), the unconverted-set arm goes with it, and the DRIVEN arm reports the lie in the words of the defect ("got 200 true"). (b) THE ITEM'S SITE (b) — `(c || { reason: "NOT_PUBLISHED" })` restored -> 43 pass, 3 FAIL: detector B names line 1786, its own REACH DELTA fails because only 2 of the 3 fallbacks are now plantable, and the drive reports `got "NOT_PUBLISHED"` for a store that never answered. (c) op=publishedmanifest's `result: (await r.json()).result` restored -> 45/1, the published INDEX indistinguishable from an empty record. (d) op=publishedbytes' `if (!v || !v.published)` restored as ONE test -> 44/2, and DETECTOR C fires too because `verify` rejoins the unconverted path set — two independent instruments on one edit. (e) the session lookup's silence restored -> 45/1. (f) THE OTHER DIRECTION, and it is the arm that keeps this from collapsing the wrong way: `answered` made to require a NON-EMPTY result -> 44/2, the chokepoint's own arm plus "a bundle that genuinely is not there still answers ABSENT" — a real absence read as a silence, which UI-37 measured is one character away. (g) THE SWEEP'S OWN, AND IT HAD TO BE CORRECTED MID-RUN, REPORTED RATHER THAN SMOOTHED: the first version neutered `handlerRegion` to return the whole file and the suite stayed 46/46 GREEN, so it measured NOTHING — with every guard removed by the reach delta there is no `.answered` anywhere and a whole-file region gives the same answer as a scoped one. The property the bound actually protects is that a guard in ONE handler must not vouch for a spread in ANOTHER, and `out` is the identifier in BOTH op=verify and op=bootstrap. Corrected to two paired arms: (g1) op=verify's guard removed ALONE with the sweep intact -> 43 pass, 3 FAIL, detector A naming "1627:out"; (g2) THE SAME single guard removed AND `handlerRegion` neutered -> 45 pass, 1 FAIL — the source sweep goes BLIND and only the live drive still bites, because op=bootstrap's own `out.answered` vouches for op=verify's missing one. The delta between (g1) and (g2) is the whole value of the handler bound. (h) THE INSTRUMENT'S OWN — `fixtures/do-fail-worker.mjs`'s injection disarmed (`if (false && …)`) so the store is asked to fail and does not -> 29 pass, 17 FAIL, every driven arm in the file naming its own site, which is what proves the drives are answering an actual Durable Object failure and not a belief about one. To re-run: node the arms in the order above, one file mutated at a time, restoring from a pristine copy and comparing sha256 after each. */
/* NEGATIVE CONTROL: RUN 2026-08-05 (rec53-agent), REC-53's ELEVEN ARMS over this file and `ratify-envelope.test.mjs`, each broken ALONE against the FINAL files and every file restored BYTE-IDENTICALLY with sha256 compared before and after — index.mjs 8b8515b42b882f9f…, plane-envelope.test.mjs 163292ca7cdbe63e…, ratify-envelope.test.mjs 7d9180199be94898…, do-fail-worker.mjs 77be03389e432c26…. (index.mjs and do-fail-worker.mjs are the SHIPPED shas; the two test files' are their shas AS RUN, before their own NEGATIVE CONTROL headers were appended — a file cannot state its own sha, and REC-52's line above has the same property. The shipped test files are plane-envelope 18190d7f… and ratify-envelope fa2d83e8….) **THE WHOLE FOR THIS FILE IS NOW 53/53, CORRECTED FROM REC-52's 46/46 ABOVE** — +5 for REC-53's corrected pins and detector D, +2 for detector D2, and the line above is left as REC-52 measured it rather than rewritten. The arms are stated in full in `ratify-envelope.test.mjs`'s own NEGATIVE CONTROL line, because seven of them are edits to `src/index.mjs`'s publish/ratify block that BOTH files see; what they do to THIS file: (a) `do/list` restored -> 47/6 (CLOSED (i) and its other-direction arm, detector C, detector D naming "4027:list", and both D reach arms); (b) `do/reusedparts` restored -> 48/5 (CLOSED (ii) plus the same four); (c) `do/image` -> 50/3; (d) `do/gatefacts` -> 50/3; (e) `do/publish`'s guard removed -> 51/2, **and this arm is why detector D2 exists: run before D2 it left this file 51/51 FULLY GREEN while the live drive reported `PUBLISH_FAILED`, because D proves an envelope is OPENED through the chokepoint and says nothing about the handler ACTING on the answer, and A is correctly silent since `pub` is spread into a REFUSAL rather than a success envelope**; (f) `capturelimit`'s `ceilingRead` forced true -> 52/1, D2 naming "limOut"; (g) `recordreuseverdicts` back to fire-and-forget -> 50/3; (h) `recordcasemanifest`'s branches swapped -> **53/53 SILENT here**, the one arm this file cannot see — D2 passes because the binding IS read with `.answered`, only in the wrong order — and it is `ratify-envelope.test.mjs`'s ordering pin that bites; (i) the other direction, a genuinely empty reused-part set treated as a silence -> 52/1; (j) the injector disarmed -> **36/17, REC-52's own seventeen reproduced exactly**; (k) detector D's region bound neutered to the whole file -> 50/3, D reporting 23 violations ALL OUTSIDE the block, so an unbounded detector stops being a claim about the BLOCK. */
/* REC-52 — THE PLANE MUST NOT CONVERT ITS OWN FAILURE INTO A CLAIM ABOUT THE RECORD.
 *
 * D-197 one layer down. UI-37 fixed three public surfaces that rendered a plane
 * refusal as a substantive negative, and while doing it measured WHY it could
 * not fix its own defect the obvious way: `index.mjs` section 7a answered
 * `json({ ok: true, ...out.result }, 200)` WITHOUT LOOKING AT `out.ok`, so a
 * Durable Object failure left the plane as an HTTP 200 SUCCESS carrying
 * nothing — and there was no `ok:false` for any transport seam to throw on.
 * The motivating case sailed straight past. A second site, `op=publishedcase`,
 * SYNTHESISED `reason:"NOT_PUBLISHED"` when the store returned no result: the
 * plane manufacturing a claim about the record out of a failure to answer.
 *
 * That is the defect this project ranks worst, at the layer where NO SURFACE
 * CAN CORRECT IT — a surface that faithfully renders what it received will
 * faithfully render a lie.
 *
 * =====================================================================
 * WHAT THE SWEEP FOUND, because the item named two sites and asked for the
 * CLASS. Eleven caller-facing conversions, of which nine were not in scope:
 *
 *   1  op=verify                  {ok:true} at 200 carrying nothing   [named]
 *   2  op=publishedcase           reason:"NOT_PUBLISHED" invented     [named]
 *   3  op=publishedmanifest       {ok:true, result:undefined} -> JSON.stringify
 *                                 DROPS an undefined value, so `{ok:true}` at
 *                                 200 again by a DIFFERENT route from 7a's
 *                                 spread. This is the op that fills the
 *                                 published INDEX, so the rendered consequence
 *                                 is the WHOLE record rather than one hash —
 *                                 the shape UI-37 measured as the worst of its
 *                                 three ("This group has not published any case
 *                                 files yet").
 *   4  op=publishedbytes          `if (!v || !v.published) return notFound()`
 *                                 was ONE test, so a silence answered "no
 *                                 published part answers to that hash. A hash
 *                                 that was never ratified and a hash that never
 *                                 existed are the same answer here,
 *                                 deliberately." — D-197's own sentence,
 *                                 minted here rather than at the surface.
 *   5  publishedcase/publishedtargets  `registry = (rt && rt.registry) || {}`
 *                                 made every basis leg of every finding read
 *                                 "this leg is NAMED and not served: what it
 *                                 rests on is not in the published record".
 *                                 THE ARGUMENT FOR SWEEPING, in one line: it is
 *                                 site 2's defect written with a `||` on a
 *                                 different line, and it renders on the page a
 *                                 stranger arrives at.
 *   6  op=bootstrap               the 7a spread again; newgroup reads this op
 *   7  op=affordances             reason:"NO_FACTS" invented — a claim that
 *                                 there are no facts about an object, which
 *                                 decides what acts a member is offered
 *   8  op=queue                   reason:"NO_QUEUE" invented
 *   9  op=knock                   a bare {ok:false} at HTTP 429 — TOO MANY
 *                                 REQUESTS is itself a claim, and nobody counted
 *  10  op=monitor                 reason:"ABSENT" invented — the plane saying a
 *                                 bundle does not exist when it failed to look,
 *                                 and ABSENT is deliberately also the
 *                                 fail-closed answer for a bundle the viewer
 *                                 may not SEE, which made it convincing
 *  11  the SESSION lookup         a silence swallowed into `undefined`, after
 *                                 which the caller is refused BY NAME — a store
 *                                 that could not be reached reported to a
 *                                 signed-in member as a fact about their
 *                                 credential
 *
 * Plus five WRITES and MEASUREMENTS that reported success over nothing:
 * op=linkproject, op=governorconfig, op=governorstate, op=links (both arms),
 * op=runtime (a measurement op answering ok:true with no measurement — this
 * class at its most literal), op=selftest (a health check that read only a
 * THROWN fetch, so an `ok:false` store left `out.ok` true), and two that
 * CRASHED rather than lied (op=registeraudit, op=cpuprobe) and were converted
 * anyway because what they answer is a soundness verdict and a ceiling.
 *
 * =====================================================================
 * THE FIX IS A CHOKEPOINT. `doAnswer` in index.mjs is the ONLY place that opens
 * a Durable Object envelope; `storeSilent` is the only thing a handler may say
 * when it did not get one. Twenty-four remembered checks would have been
 * twenty-four chances to forget the twenty-fifth, which is how eleven of these
 * got here. Part 1 below asserts that STRUCTURALLY over the source. Part 2
 * drives it: the store is made to FAIL FOR REAL at each site (see
 * `fixtures/do-fail-worker.mjs` — a subclass of the shipped `Store` that
 * answers the store's own catch-block envelope; nothing on disk is mutated),
 * and every arm is paired with the SAME op against the SAME store with the
 * injection off, because these must not collapse the other way either: a
 * GENUINE not-published answer must still read as not-published, and UI-37
 * measured that the opposite collapse is one character away.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC_PATH = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const RAW = readFileSync(SRC_PATH, "utf8");

let pass = 0, fail = 0;
const ok = (label, cond) => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${label}`);
  cond ? pass++ : fail++;
};
const t = (label, got, want) => {
  const good = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${good ? "PASS" : "FAIL"}  ${label}`
    + (good ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`));
  good ? pass++ : fail++;
};

/* =====================================================================
   PART 1 — THE SOURCE-LEVEL SWEEP
   =====================================================================
   Comments are stripped BLANKED rather than removed, so every line number this
   suite reports is the line number in the real file. The line-comment strip is
   anchored to the start of a line (REC-48's lesson: an unanchored `//` strip
   eats everything after `https:` inside a string literal, and a sweep that
   silently reaches LESS than it claims is worse than no sweep). */
const blank = (s) => s
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
  .replace(/^([ \t]*)\/\/.*$/gm, (m) => " ".repeat(m.length));

/* Every `json(...)` call in the file, as its balanced argument text with the
   line it starts on. Bracket-matched rather than regexed, because these
   arguments run to twenty lines and contain nested objects and template
   literals. */
function jsonCalls(src) {
  const out = [];
  const re = /\bjson\(/g;
  let m;
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length, depth = 1;
    while (i < src.length && depth > 0) {
      const ch = src[i];
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      i++;
    }
    out.push({ start: m.index, line: src.slice(0, m.index).split("\n").length,
               arg: src.slice(m.index + m[0].length, i - 1) });
  }
  return out;
}

/* The handler a site sits in, for the guard search. Bounded by the nearest
   preceding `if (op === "..."` / `if (op ===` / arrow-function head, which is
   how this file is actually organised. The bound MATTERS: identifiers here are
   one or two letters and are reused in every handler, so an unscoped search for
   `r.answered` would let a guard in one handler vouch for a spread in another.
   The reach delta below is what proves this bound reaches every site. */
function handlerRegion(src, at) {
  const before = src.slice(0, at);
  const marks = [...before.matchAll(/\n\s*(?:if \(op ===|const renderFinding =|if \(req\.method ===)/g)];
  const from = marks.length ? marks[marks.length - 1].index : 0;
  return src.slice(from, at);
}

/* ---- DETECTOR A: THE SUCCESS ENVELOPE ------------------------------------
   No handler may spread a Durable Object result into `json({ ok: true, … })`
   without having checked that the store answered. `.answered` is the ONLY way
   `ok` is ever checked, because `doAnswer` is the only thing that reads it —
   which is what makes a textual search for it a real check and not a guess. */
function detectA(src) {
  const bad = [];
  for (const c of jsonCalls(src)) {
    if (!/^\s*\{\s*ok:\s*true\b/.test(c.arg)) continue;
    const region = handlerRegion(src, c.start);
    for (const r of c.arg.matchAll(/(?:\.\.\.)?\b([A-Za-z_$][\w$]*)\s*(?:\?)?\.result\b/g)) {
      const id = r[1];
      if (!new RegExp(`\\b${id}\\.answered\\b`).test(region))
        bad.push({ line: c.line, id, why: `json({ok:true, …${id}.result…}) with no ${id}.answered check` });
    }
  }
  return bad;
}

/* ---- DETECTOR B: THE INVENTED REASON -------------------------------------
   No answer may take its `reason` or `error` from a fallback over a Durable
   Object value. This is the exact shape of all four found instances —
   `(c || { reason: "NOT_PUBLISHED" })`, `(r || { reason: "NO_QUEUE" })`,
   `(facts || { reason: "NO_FACTS" })`, `(rt && rt.registry) || {}` in the
   `json()` it feeds — and it is deliberately NOT "index.mjs may never mint a
   reason code the store also mints". THAT RULE WAS TRIED AND IS WRONG:
   measured, seven codes are minted in both files (NOT_FOUND, TOO_LARGE, EMPTY,
   NO_BODY, BAD_SHA, ABSENT, MALFORMED), and the control plane's copies are
   about the REQUEST — a body too large, a malformed sha — which is its own
   business to refuse. Forbidding them would push a true refusal into a
   euphemism, which is the same defect wearing modesty. */
function detectB(src) {
  const bad = [];
  for (const c of jsonCalls(src)) {
    for (const m of c.arg.matchAll(/(?:\|\||\?\?)\s*\{\s*(reason|error)\s*:/g))
      bad.push({ line: c.line + c.arg.slice(0, m.index).split("\n").length - 1,
                 why: `a ${m[1]} supplied by a fallback rather than by the store` });
  }
  return bad;
}

/* ---- DETECTOR C: THE UNOPENED ENVELOPE -----------------------------------
   Every Durable Object fetch whose BODY is consumed must be consumed through
   `doAnswer`. This is the assertion that makes A and B hold in the future
   rather than today: a new handler cannot read `.result` off a raw envelope at
   all without appearing here.

   ITS LIMIT IS STATED RATHER THAN EXEMPTED. The remaining sites are NOT
   converted, and the list is EXACT — a site that leaves it or joins it fails
   this suite. One region and one deliberate design choice:
     - `op=acquire`'s capture path (CAPTURE's ground, not this item's), where a
       silence yields a `subs.*` diagnostic field that is undefined or a
       TypeError that throws — a crash, not a claim;
     - `governoradmit`, which fails OPEN by an explicit documented decision
       ("ungoverned is better than unfetched"). That is a ruling already made
       and not an oversight, so it is named here and left alone.

   CORRECTED 2026-08-05 (REC-53): SIX PATHS LEFT THIS LIST — `gatefacts`,
   `image`, `list`, `publish`, `recordcasemanifest` and `reusedparts`. REC-52
   named them here because the publish/ratify block was REC-47's ground and held
   concurrently; REC-47 has landed and REC-53 converted the block, so they now
   go through `doAnswer` and appear in `converted` instead. `capturelimit` STAYS
   on the list and the reason matters: REC-53 converted op=ratify's read of it,
   but `op=acquire` reads the same path in CAPTURE's ground and this set is keyed
   by PATH, so one site leaving does not take the path with it. Removing it here
   would have been the easy wrong edit and detector C's own delta arm is what
   would have caught it.
   The classification is a RELATION assertion: this suite asserts the SET, and
   asserts that none of them sits inside a `json({ ok: true` — it rules on
   nothing else about them. */
const UNCONVERTED = [
  "sourcereach", "governoradmit",
  "loadcapturesession", "capturelimit", "siteassets", "governorstate",
  "recordcapturelimit", "savecapturesession", "recordruntime", "recordsiteassets",
];
/* Bracket-match the argument list of every call to `name(`, and return the
   spans. Used for both `doAnswer(` and `.fetch(`. */
function callSpans(src, pattern) {
  const out = [];
  const re = new RegExp(pattern, "g");
  let m;
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length, depth = 1;
    while (i < src.length && depth > 0) {
      const ch = src[i];
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      i++;
    }
    out.push({ start: m.index, argStart: m.index + m[0].length, end: i, args: src.slice(m.index + m[0].length, i - 1) });
  }
  return out;
}

function doFetchSites(src) {
  /* A LINE WINDOW WAS TRIED FIRST AND WAS WRONG IN BOTH DIRECTIONS, which is
     why this is bracket-matched: op=publish's fetch argument runs past any
     window and read as fire-and-forget, while `dropcapturesession` — which
     genuinely IS fire-and-forget — swallowed a LATER statement's `.json()` and
     read as consumed. A sweep that miscounts its own subject in both
     directions is not a sweep, and neither error would have shown up as a
     failure: both make the sweep quietly reach something other than what it
     says it reaches. */
  const wrappers = callSpans(src, "\\bdoAnswer\\(");
  const out = [];
  for (const f of callSpans(src, "\\.fetch\\(")) {
    const url = /http:\/\/(?:do|x)\/([a-z]+)/.exec(f.args);
    if (!url) continue;
    /* What is done with the RESPONSE, read from the characters that FOLLOW the
       call rather than guessed: `).json()` consumes the envelope, anything
       else leaves it unread and there is nothing to lie with. */
    const viaDoAnswer = wrappers.some((w) => w.argStart <= f.start && f.end <= w.end);
    const rawConsumed = /^\)?\s*\.json\(\)/.test(src.slice(f.end, f.end + 24));
    /* A converted site has NO `.json()` at the site at all — that is the whole
       point of the chokepoint, and it is why "consumed" means either. */
    if (!viaDoAnswer && !rawConsumed) continue;
    out.push({ line: src.slice(0, f.start).split("\n").length, path: url[1], viaDoAnswer });
  }
  return out;
}

const SRC = blank(RAW);

console.log("\n--- PART 1: the source-level sweep over src/index.mjs ---");

const aBad = detectA(SRC);
t(`DETECTOR A — no handler spreads a Durable Object result into a success envelope `
  + `without checking that the store answered (violations: ${JSON.stringify(aBad.map((x) => x.line + ":" + x.id))})`,
  aBad.length, 0);

const bBad = detectB(SRC);
t(`DETECTOR B — no answer takes its reason or error from a fallback over a Durable Object value `
  + `(violations: ${JSON.stringify(bBad.map((x) => x.line))})`,
  bBad.length, 0);

const sites = doFetchSites(SRC);
const converted = sites.filter((s) => s.viaDoAnswer);
const unconverted = sites.filter((s) => !s.viaDoAnswer);
ok(`the sweep found Durable Object reads at all — ${sites.length} sites whose body is consumed, `
   + `${converted.length} through doAnswer and ${unconverted.length} named as unconverted`,
   sites.length >= 30 && converted.length >= 15);
t("DETECTOR C — the unconverted set is EXACTLY the list this item states, so a site cannot "
  + "join or leave it silently",
  [...new Set(unconverted.map((s) => s.path))].sort(), [...new Set(UNCONVERTED)].sort());

/* Every unconverted site is a read whose failure crashes or is swallowed
   internally — none of them reaches a caller through a success envelope. That
   is what A already proves, and it is asserted HERE against the unconverted
   list specifically so the stated limit is a measured claim rather than a
   promise. */
ok("and NONE of the unconverted sites spreads into a success envelope — which is what makes "
   + "leaving them a limit rather than a hole",
   detectA(SRC).length === 0);

/* ---- THE SWEEP'S OWN REACH, AS A DELTA -----------------------------------
   A walk that covers nothing passes everything. This has eight sightings in
   this project, including a reach assertion that compared a PLANTED COUNT TO 1
   and so read as deaf on a file that already had hits (REC-48, corrected). So
   reach is asserted as a DELTA and never against an absolute.

   AND THE PLANT IS THE REAL DEFECT, NOT A SYNTHETIC ONE: the guard lines are
   mechanically REMOVED from a copy of the shipped source, which restores every
   converted site to exactly the shape it had before this item. So the delta
   measures the detector against the actual defect at every actual site, and it
   proves each guard is load-bearing rather than decorative. */
const GUARD = /^[ \t]*if \(![A-Za-z_$][\w$]*(?:Out)?\.answered.*$\n/gm;
const guardsRemoved = (SRC.match(GUARD) || []).length;
const noGuards = SRC.replace(GUARD, "");
const aPlanted = detectA(noGuards);
ok(`REACH (A), AS A DELTA — removing all ${guardsRemoved} answered-guards from a copy of the source `
   + `takes detector A from ${aBad.length} to ${aPlanted.length} violations, so every guarded spread `
   + `is one this detector can see and every guard is load-bearing`,
   guardsRemoved >= 15 && aPlanted.length - aBad.length >= 7);
ok(`REACH (A) names the sites rather than counting them — ${JSON.stringify(aPlanted.map((x) => x.line + ":" + x.id))}`,
   aPlanted.length > 0 && aPlanted.every((x) => Number.isFinite(x.line)));

/* Detector B's reach, planted with the four fallbacks this item removed,
   written back at their own sites rather than appended to the end of the file —
   a plant at the end proves only that the regex fires somewhere. */
const B_PLANTS = [
  ['if (!c.ok) return json({ ok: false, ...c }, 404);',
   'if (!c.ok) return json({ ok: false, ...(c || { reason: "NOT_PUBLISHED" }) }, 404);'],
  ['return json({ ok: false, ...r, store: storeName, tokenClass: cls }, 400);',
   'return json({ ok: false, ...(r || { reason: "NO_QUEUE" }), store: storeName, tokenClass: cls }, 400);'],
  ['return json({ ok: false, ...facts, store: storeName, tokenClass: cls },',
   'return json({ ok: false, ...(facts || { reason: "NO_FACTS" }), store: storeName, tokenClass: cls },'],
];
let bSrc = SRC, bPlantedCount = 0;
for (const [from, to] of B_PLANTS) {
  if (bSrc.includes(from)) { bSrc = bSrc.replace(from, to); bPlantedCount++; }
}
const bPlanted = detectB(bSrc);
t(`REACH (B), AS A DELTA — writing the ${bPlantedCount} removed fallbacks back at their own sites `
  + `takes detector B from ${bBad.length} to ${bPlanted.length}`,
  [bPlantedCount, bPlanted.length - bBad.length], [3, 3]);

/* Detector C's reach: a new unconverted DO read must fail the set assertion in
   BOTH directions — one that appears, and one that disappears. */
const cPlantAdd = SRC + `\n      const q9 = (await (await st.fetch("http://x/newthing")).json()).result;\n`;
const addedPaths = [...new Set(doFetchSites(cPlantAdd).filter((s) => !s.viaDoAnswer).map((s) => s.path))].sort();
ok(`REACH (C), AS A DELTA — a NEW unconverted Durable Object read appears in the set `
   + `(${unconverted.length} sites -> ${doFetchSites(cPlantAdd).filter((s) => !s.viaDoAnswer).length}, `
   + `and "newthing" joins the paths)`,
   addedPaths.includes("newthing")
   && addedPaths.length === [...new Set(unconverted.map((s) => s.path))].length + 1);

/* ---- WAS HELD OPEN; (i) AND (ii) ARE NOW CLOSED --------------------------
   Three of REC-52's sixteen unconverted sites turned out to be a DIFFERENT
   question rather than the same one, and the honest thing was to pin the
   RELATION rather than collapse them into that item. A relation assertion states
   no value and so is not a ruling; what it buys is that the site cannot change
   shape without somebody being told.

   CORRECTED 2026-08-05 (REC-53), AND THE POLARITY IS THE WHOLE POINT. Pins (i)
   and (ii) were written by REC-52 to hold a DEFECT open, so as written they
   REQUIRED THE DEFECT TO BE PRESENT: `listSite` matched `.result || []` on the
   raw envelope, and `reusedSite` matched the raw `do/reusedparts` read. Left
   alone they would have gone RED FOR THIS FIX AND GREEN FOR THE BUG — which is
   the trap UI-36 wrote into a pin whole, that REC-52 then found UI-37 had
   repeated, and that is twice in three items. They are INVERTED here with the
   date and the reason, never deleted, and they now assert the FIX: each site
   reads through `doAnswer` and refuses through `storeSilent`, so restoring
   either defect turns the pin red. Verified by running exactly that (arms (a)
   and (b) of this file's negative control).

   What each one was:
     (i)  `do/list`'s `.result || []` gave `runGate` an EMPTY known-id set, so
          a store silence made every reference in the bundle read as
          unresolved and the ratification was refused for a reason about the
          RECORD ("does not resolve in the store") rather than about the
          exchange. The worst reachable form of this class.
     (ii) `do/reusedparts`' silence read as "no parts were reused", which is a
          statement about what the group did.

   (iii) `governoradmit` fails OPEN — `(a && a.result) || null` and a `catch`
   whose comment says "ungoverned is better than unfetched". That is a DECISION
   already taken and written down, not an oversight, and it is not this class:
   nothing is told to a caller. It STAYS held open, unchanged. */
{
  const listSite = /const listOut = await doAnswer\(stub\.fetch\(`http:\/\/do\/list\?viewer=\$\{ratViewer\}`\)\);/.test(SRC)
    && /if \(!listOut\.answered\) return storeSilent\("ratify\/list"\);/.test(SRC);
  ok("CLOSED (i) — op=ratify derives its known-id set from an `.answered`-guarded `do/list` read and "
     + "REFUSES on a silence, so the gate is never handed an empty known-id set that makes every "
     + "reference read as \"does not resolve in the store\". POLARITY INVERTED 2026-08-05 (REC-53): "
     + "REC-52 wrote this pin to require the DEFECT, so unchanged it would have failed for the fix",
     listSite);
  /* AND THE OTHER DIRECTION AT THE SAME SITE, because a guard that also threw
     away a real empty list would be REC-52's arm (f) collapse reversed: a viewer
     who can genuinely see no bundles is a real answer, and `|| []` must survive
     BEHIND the guard rather than in front of it. */
  ok("CLOSED (i), THE OTHER DIRECTION — the `|| []` survives BEHIND the answered-guard, so a "
     + "genuinely empty list is still a real answer and is not itself treated as a silence",
     /if \(!listOut\.answered\) return storeSilent\("ratify\/list"\);\s*\n\s*const known = new Set\(\(listOut\.result \|\| \[\]\)/.test(SRC));
  const reusedSite = /const reusedOut = await doAnswer\(stub\.fetch\(`http:\/\/do\/reusedparts/.test(SRC)
    && /if \(!reusedOut\.answered\) \{/.test(SRC)
    && /op: "ratify\/reusedparts"/.test(SRC);
  ok("CLOSED (ii) — op=ratify's reuse report STATES an unread reuse set instead of omitting the key, "
     + "so a silence no longer reads as \"nothing was reused\". Post-commit, so it states the "
     + "undetermined rather than refusing: the ratification genuinely landed. POLARITY INVERTED "
     + "2026-08-05 (REC-53) for the same reason as (i)",
     reusedSite);
  ok("HELD OPEN (iii), UNCHANGED: the governor's admission check fails OPEN by an explicit written "
     + "decision (\"ungoverned is better than unfetched\"), which is a ruling already made and not "
     + "this class",
     /ungoverned is better than unfetched/.test(RAW) && /const g = \(a && a\.result\) \|\| null;/.test(SRC));
}

/* ---- DETECTOR D: THE PUBLISH/RATIFY BLOCK, WHOLE (REC-53) ----------------
   Detectors A, B and C are file-wide and each has a blind spot this block
   walked straight into, measured rather than supposed:
     - A looks for a `.result` spread inside `json({ ok: true`, and
       `recordcasemanifest`'s invented `MANIFEST_NOT_RECORDED` reached the caller
       in a LOCAL VARIABLE (`container`) spread twelve lines later;
     - B looks for a `||`/`??` fallback, and `do/publish`'s invented
       `PUBLISH_FAILED` was a TERNARY;
     - C only sees a body that is CONSUMED, and `recordreuseverdicts` was
       FIRE-AND-FORGET, so a write that never landed was invisible to it while
       the answer told the caller its outcomes.
   So the block gets ONE property covering all three blind spots at once: inside
   `if (op === "ratify")` there is no raw Durable Object read AT ALL — every
   `.fetch(` in the region sits inside a `doAnswer(`. That is checkable without
   knowing what any site does with its answer, which is exactly why it survives
   a shape the three detectors above have not met yet. */
function ratifyRegion(src) {
  const from = src.indexOf('if (op === "ratify") {');
  if (from < 0) return null;
  let i = src.indexOf("{", from), depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) return { from, to: i + 1, text: src.slice(from, i + 1) };
  }
  return null;
}
function rawInRatify(src) {
  const region = ratifyRegion(src);
  if (!region) return null;
  const wrappers = callSpans(src, "\\bdoAnswer\\(");
  const out = [];
  for (const f of callSpans(src, "\\.fetch\\(")) {
    if (f.start < region.from || f.end > region.to) continue;
    if (!/http:\/\/(?:do|x)\//.test(f.args)) continue;
    if (wrappers.some((w) => w.argStart <= f.start && f.end <= w.end)) continue;
    out.push({ line: src.slice(0, f.start).split("\n").length,
               path: (/http:\/\/(?:do|x)\/([a-z]+)/.exec(f.args) || [])[1] || "?" });
  }
  return out;
}
{
  const region = ratifyRegion(SRC);
  const raw = rawInRatify(SRC);
  const inBlock = callSpans(SRC, "\\.fetch\\(").filter((f) => f.start >= region.from && f.end <= region.to);
  ok(`the ratify region is found and is the whole handler — ${region.text.split("\n").length} lines `
     + `carrying ${inBlock.length} Durable Object fetches`,
     region && inBlock.length === 8);
  t(`DETECTOR D — NO raw Durable Object read anywhere in the publish/ratify block; all eight go `
    + `through the chokepoint (violations: ${JSON.stringify((raw || []).map((x) => x.line + ":" + x.path))})`,
    (raw || []).length, 0);

  /* REACH (D), AS A DELTA, and by REC-52's method: the REAL guards are removed
     from a copy of the REAL source, so what the detector is measured against is
     the actual defect at every actual site rather than a planted specimen. Here
     the plant must ALSO restore the raw envelope reads, because detector D's
     subject is the `doAnswer` wrapper itself and not the guard line. */
  const dPlant = SRC
    .replace("const listOut = await doAnswer(stub.fetch(`http://do/list?viewer=${ratViewer}`));",
             "const listOut = { result: (await (await stub.fetch(`http://do/list?viewer=${ratViewer}`)).json()).result };")
    .replace("const reusedOut = await doAnswer(stub.fetch(`http://do/reusedparts?id=${encodeURIComponent(body.bundleId)}`));",
             "const reusedOut = { result: (await (await stub.fetch(`http://do/reusedparts?id=${encodeURIComponent(body.bundleId)}`)).json()).result };")
    .replace("const vOut = await doAnswer(stub.fetch(new Request(\"http://do/recordreuseverdicts\", {",
             "const vOut = { answered: true, result: await stub.fetch(new Request(\"http://do/recordreuseverdicts\", {");
  const dPlanted = rawInRatify(dPlant);
  ok(`REACH (D), AS A DELTA — un-converting the two sites this item was NAMED for plus the `
     + `fire-and-forget write takes detector D from ${(raw || []).length} to ${dPlanted.length} `
     + `violations, and it names them: ${JSON.stringify(dPlanted.map((x) => x.path))}`,
     dPlanted.length - (raw || []).length === 3
     && ["list", "recordreuseverdicts", "reusedparts"].every((p) => dPlanted.some((x) => x.path === p)));
  /* And the bound is load-bearing in the other direction: a raw read OUTSIDE the
     block must NOT make detector D fire, or "the block is clean" would be a
     claim about the file. `op=acquire`'s raw reads are the standing proof. */
  ok("REACH (D), THE BOUND — the ten raw reads that remain OUTSIDE this block do not make detector D "
     + "fire, so a clean block is a claim about the BLOCK and not about the file",
     unconverted.length >= 10 && (raw || []).length === 0);

  /* ---- DETECTOR D2: OPENED IS NOT THE SAME AS CHECKED ------------------
     ADDED 2026-08-05 (REC-53) BECAUSE ITS OWN NEGATIVE CONTROL EXPOSED THE
     GAP, and it is reported rather than smoothed. Arm (e) deletes `do/publish`'s
     `if (!pubOut.answered) return storeSilent(…)` line and NOTHING in this file
     moved — 51/51 green — while the live drive reported `PUBLISH_FAILED` for a
     store that never answered. Detector D proves the envelope is OPENED through
     the chokepoint; it says nothing about the handler ACTING on the answer. And
     detector A cannot cover it either, by design: `pub` is spread into a
     REFUSAL (`json({ ok: false, … })`), not into a success envelope, so A is
     correctly silent.
     So: every identifier bound from a `doAnswer(` inside this block must be
     read with `.answered` somewhere in the block. That is the property arm (e)
     showed was missing, and it is deliberately scoped to this region for the
     same reason `handlerRegion` is — REC-52's arm (g) measured that an unscoped
     search lets one handler's guard vouch for another's. */
  const bound = [...region.text.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*=\s*await doAnswer\(/g)]
    .map((m) => m[1]);
  const unchecked = bound.filter((id) => !new RegExp(`\\b${id}\\.answered\\b`).test(region.text));
  t(`DETECTOR D2 — every opened envelope in the block is also CHECKED: all ${bound.length} `
    + `doAnswer bindings are read with .answered (unchecked: ${JSON.stringify(unchecked)})`,
    unchecked, []);
  /* Reach, as a delta and against the real defect: drop the real guard line at
     the site arm (e) drops it at, and D2 must name that binding. */
  const d2Plant = SRC.replace('if (!pubOut.answered) return storeSilent("ratify/publish");\n      ', "");
  const d2Region = ratifyRegion(d2Plant);
  const d2Unchecked = [...d2Region.text.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*=\s*await doAnswer\(/g)]
    .map((m) => m[1])
    .filter((id) => !new RegExp(`\\b${id}\\.answered\\b`).test(d2Region.text));
  ok(`REACH (D2), AS A DELTA — removing the REAL guard at the commit site takes D2 from `
     + `${unchecked.length} to ${d2Unchecked.length} and names it: ${JSON.stringify(d2Unchecked)}`,
     d2Unchecked.length - unchecked.length === 1 && d2Unchecked.includes("pubOut"));
}

/* ---- THE CHOKEPOINT IS ONE PLACE, AND SAYS THE RIGHT THING --------------- */
ok("`doAnswer` is the only thing in index.mjs that reads `ok` off a Durable Object envelope",
   (SRC.match(/out\.ok === true/g) || []).length === 1
   && /async function doAnswer\(res\)/.test(SRC));
ok("`answered` is `ok === true` AND NOTHING ELSE — it does not require a non-empty result, "
   + "because a store may legitimately answer null, [] or {} and treating a real empty answer as a "
   + "non-answer is this same collapse running the other way",
   /return \(out && out\.ok === true\)\s*\n\s*\? \{ answered: true, result: out\.result \}/.test(SRC));
ok("the refusal states the state of the EXCHANGE and makes no claim about the record",
   /It is NOT a claim that what you asked for is absent, unpublished, unknown or refused/.test(SRC));
ok("and it does not echo the Durable Object's `error`, which is a raw stack trace on ops "
   + "reachable with no credential at all",
   !/error: out\.error/.test(SRC) && !/store_error/.test(SRC));

/* =====================================================================
   PART 2 — DRIVEN: THE STORE IS MADE TO FAIL, FOR REAL
   ===================================================================== */
const WORKER = fileURLToPath(new URL("./fixtures/do-fail-worker.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: WORKER, script: readFileSync(WORKER, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec52", MEMBER_TOKEN: "mem-rec52", PROBE_TOKEN: "prb-rec52", VERSION: "test" },
});

const GET = async (q) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`);
  return { status: r.status, body: await r.json() };
};
const POST = async (q, body) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`, { method: "POST", body: JSON.stringify(body ?? {}) });
  return { status: r.status, body: await r.json() };
};
const poison = async (...paths) => {
  const r = await mf.dispatchFetch(`http://x/__failpaths?paths=${encodeURIComponent(paths.join(","))}`);
  return (await r.json()).result.failing;
};

const HEX = "a".repeat(64);
const SILENT = "STORE_DID_NOT_ANSWER";

/* The two properties every arm asserts, named once so each arm reads as what it
   is rather than as three lines of shape-checking:
   - a silence is NEVER a success, and
   - a silence NEVER carries a substantive word the store did not say. */
const isSilence = (r) => r.body && r.body.ok === false && r.body.reason === SILENT && r.status === 502;

console.log("\n--- PART 2: the injection control ---");
t("the injector arms and disarms, and reports what it is holding",
  [await poison("verify", "publishedcase"), await poison()],
  [["verify", "publishedcase"], []]);

console.log("\n--- site 1: op=verify (section 7a — the item's site (a)) ---");
{
  await poison();
  const good = await GET(`op=verify&sha256=${HEX}`);
  t("THE TRUE NEGATIVE FIRST: an unpublished hash answers `published:false` at 200, which is a real "
    + "answer and must keep reading as one",
    [good.status, good.body.ok, good.body.published, good.body.sha256], [200, true, false, HEX]);

  await poison("verify");
  const bad = await GET(`op=verify&sha256=${HEX}`);
  ok("a Durable Object failure reaches the caller AS A FAILURE — not `{ok:true}` at HTTP 200 with "
     + `nothing in it (got ${bad.status} ${JSON.stringify(bad.body.reason || bad.body.ok)})`,
     isSilence(bad));
  ok("and the refusal carries NO `published` field, so no surface can read an absence out of it — "
     + "which is the exact route D-197 took",
     !("published" in bad.body) && !("matches" in bad.body));
  await poison();
}

console.log("\n--- site 2: op=publishedcase (the item's site (b)) ---");
{
  await poison();
  const good = await GET("op=publishedcase&id=CASE-2026-nothing");
  t("THE GENUINE NOT-PUBLISHED ANSWER, PRESERVED: the store's own NOT_PUBLISHED reaches the caller "
    + "at 404 with the store's own sentence",
    [good.status, good.body.ok, good.body.reason, /published projection/.test(good.body.detail || "")],
    [404, false, "NOT_PUBLISHED", true]);

  await poison("publishedcase");
  const bad = await GET("op=publishedcase&id=CASE-2026-nothing");
  ok("a Durable Object failure is NOT reported as NOT_PUBLISHED — the plane no longer manufactures "
     + `a claim about the record out of a failure to answer (got ${JSON.stringify(bad.body.reason)})`,
     bad.body.reason !== "NOT_PUBLISHED" && isSilence(bad));
  ok("and it carries none of the store's not-published sentence",
     !/published projection/.test(JSON.stringify(bad.body)));
  await poison();
}

console.log("\n--- site 3: op=publishedmanifest (the published INDEX — not in scope, found by the sweep) ---");
{
  await poison();
  const good = await GET("op=publishedmanifest");
  t("an empty published record answers ok:true with an EMPTY LIST — a real answer about a group "
    + "that has published nothing",
    [good.status, good.body.ok, Array.isArray(good.body.result.published), good.body.result.published.length],
    [200, true, true, 0]);

  await poison("publishedmanifest");
  const bad = await GET("op=publishedmanifest");
  ok("a Durable Object failure is not an empty index — the two were indistinguishable and the "
     + "surface rendered the second as \"this group has not published any case files yet\"",
     isSilence(bad) && !("result" in bad.body));
  await poison();
}

console.log("\n--- site 4: op=publishedbytes (D-197's own sentence, minted in the plane) ---");
{
  await poison();
  const good = await GET(`op=publishedbytes&sha256=${HEX}`);
  t("THE TRUE NEGATIVE: a hash the published projection does not hold answers NOT_FOUND with the "
    + "deliberate-indistinguishability clause, which is TRUE of a real absence",
    [good.status, good.body.reason, /deliberately/.test(good.body.detail || "")],
    [404, "NOT_FOUND", true]);

  await poison("verify");
  const bad = await GET(`op=publishedbytes&sha256=${HEX}`);
  ok("a Durable Object failure does NOT answer NOT_FOUND, and does not carry the sentence whose "
     + "second clause is exactly what made D-197 convincing",
     bad.body.reason !== "NOT_FOUND" && !/deliberately/.test(JSON.stringify(bad.body)) && isSilence(bad));
  await poison();
}

console.log("\n--- site 5: op=bootstrap ---");
{
  await poison();
  const good = await GET("op=bootstrap");
  t("an instance answers what it is", [good.status, good.body.ok, good.body.service], [200, true, "bio-plane"]);

  await poison("bootstrap");
  const bad = await GET("op=bootstrap");
  ok("an instance that cannot consult its own store does not answer `{ok:true}` with a service "
     + "name and nothing else — newgroup reads this op to decide whether an instance is ready",
     isSilence(bad));
  await poison();
}

console.log("\n--- site 6: op=affordances (reason:\"NO_FACTS\" invented) ---");
{
  await poison();
  const good = await GET("op=affordances&target=INQ-nope&token=adm-rec52");
  t("THE GENUINE ANSWER: an object the store does not hold answers the store's own NO_SUCH_BUNDLE",
    [good.status, good.body.reason], [404, "NO_SUCH_BUNDLE"]);

  await poison("affordancefacts");
  const bad = await GET("op=affordances&target=INQ-nope&token=adm-rec52");
  ok("a Durable Object failure is neither NO_FACTS nor NO_SUCH_BUNDLE — a member is not told an "
     + "object does not exist, nor offered a set of acts derived from facts nobody read",
     bad.body.reason !== "NO_FACTS" && bad.body.reason !== "NO_SUCH_BUNDLE" && isSilence(bad));
  await poison();
}

console.log("\n--- site 7: op=queue (reason:\"NO_QUEUE\" invented) ---");
{
  await poison("queue");
  const bad = await GET("op=queue&token=adm-rec52");
  ok("a Durable Object failure is not reported as there being no queue",
     bad.body.reason !== "NO_QUEUE" && isSilence(bad));
  await poison();
  const good = await GET("op=queue&token=adm-rec52");
  t("and the real queue still answers", [good.status, good.body.ok], [200, true]);
}

console.log("\n--- site 8: op=monitor (reason:\"ABSENT\" invented) ---");
{
  await poison("image");
  const bad = await POST("op=monitor&token=adm-rec52", { bundleId: "INQ-nope" });
  ok("a Durable Object failure is NOT reported as the bundle being absent — ABSENT is also the "
     + "fail-closed answer for a bundle the viewer may not see, which is what made it convincing",
     bad.body.reason !== "ABSENT" && isSilence(bad));
  await poison();
  const good = await POST("op=monitor&token=adm-rec52", { bundleId: "INQ-nope" });
  t("and a bundle that genuinely is not there still answers ABSENT",
    [good.status, good.body.reason], [404, "ABSENT"]);
}

console.log("\n--- site 9: op=knock (a bare ok:false at HTTP 429) ---");
{
  await poison();
  const good = await POST("op=knock", { contentText: "a document a stranger wants the group to see" });
  t("A GENUINE KNOCK still lands", [good.status, good.body.ok], [200, true]);

  await poison("knock");
  const bad = await POST("op=knock", { contentText: "a document a stranger wants the group to see" });
  ok("a Durable Object failure is not reported to an anonymous member of the public as their "
     + `having knocked too often (status ${bad.status}, was 429)`,
     bad.status !== 429 && isSilence(bad));
  await poison();
}

console.log("\n--- site 10: the SESSION lookup (a store silence read as a verdict on a credential) ---");
{
  await poison("session");
  const bad = await GET(`op=whoami&token=${"b".repeat(64)}`);
  ok("a store that could not be reached is not reported to a signed-in member as a fact about "
     + "their credential",
     isSilence(bad));
  await poison();
  const good = await GET(`op=whoami&token=${"b".repeat(64)}`);
  ok("and a token that genuinely names no session is still refused as one",
     good.body.ok === false && good.body.reason !== SILENT);
}

console.log("\n--- sites 11-15: the writes and the measurements ---");
{
  await poison("linksto");
  const l = await GET("op=links&address=https://example.gov/a&token=adm-rec52");
  ok("op=links: a silence is not \"nothing points at that address\"", isSilence(l));

  await poison("governorconfig");
  const g = await GET("op=governorconfig&host=example.gov&appetite_per_min=12&token=adm-rec52");
  ok("op=governorconfig: a WRITE that never landed is not reported as done — an operator would "
     + "otherwise believe a courtesy limit is in force on somebody else's server", isSilence(g));

  await poison("projectlinks");
  const p = await GET(`op=linkproject&capture=${HEX}&token=adm-rec52`);
  ok("op=linkproject: a projection that never ran is not reported as a successful projection",
     isSilence(p));

  await poison("runtimeobservations");
  const r = await GET("op=runtime&token=adm-rec52");
  ok("op=runtime: a MEASUREMENT op does not answer ok:true carrying no measurement", isSilence(r));

  await poison("stats");
  const s = await GET("op=selftest&token=adm-rec52");
  ok("op=selftest: a health check reports UNHEALTHY when the store answers ok:false, not only when "
     + `the fetch throws (ok=${s.body.ok}, store=${JSON.stringify(s.body.store)})`,
     s.body.ok === false && /did not answer/.test(String(s.body.store)));

  await poison();
  const ok2 = await GET("op=selftest&token=adm-rec52");
  ok("and a healthy instance still reports healthy", ok2.body.ok === true);
}

console.log("\n--- the collapse must not run the other way ---");
{
  await poison();
  const v = await GET(`op=verify&sha256=${HEX}`);
  const c = await GET("op=publishedcase&id=CASE-2026-nothing");
  const b = await GET(`op=publishedbytes&sha256=${HEX}`);
  const m = await GET("op=publishedmanifest");
  ok("with NOTHING poisoned, every genuine negative on the public read path still reads as the "
     + "negative it is, and NONE of them reads as a silence — UI-37 measured that this collapse is "
     + "one character away in the other direction",
     v.body.published === false && v.body.ok === true
     && c.body.reason === "NOT_PUBLISHED" && b.body.reason === "NOT_FOUND"
     && m.body.ok === true && m.body.result.published.length === 0
     && ![v, c, b, m].some((x) => x.body.reason === SILENT));
}

await mf.dispose();
console.log(`\nplane-envelope: ${pass} pass, ${fail} fail`);
console.log(`REC-52: eleven caller-facing conversions found where the item named two; the sweep's reach `
  + `asserted as a delta by removing every answered-guard from a copy of the source and re-running `
  + `the detector; the unconverted set pinned EXACTLY at ${UNCONVERTED.length} paths with its limit `
  + `stated rather than exempted.`);
process.exit(fail ? 1 : 0);
