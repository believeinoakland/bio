/* UI-51 — THE FIFTH CANONICAL TYPE'S SEVEN UI ENTRIES, AND WHICH OF THEM THE
 * UI IS ENTITLED TO HAVE AN OPINION ABOUT.
 *
 * ============================================================================
 * WHAT THIS FILE IS FOR, AND WHY `check-semantics.mjs` IS NOT ENOUGH ON ITS OWN.
 * ============================================================================
 * PL-12 / D-84 added `bias` to the catalogue. `check-semantics.mjs` requires an
 * entry for every canonical type in SEVEN tables inside `app.html` — `PREFIX`,
 * `FIRST_STATE`, `HEADINGS`, `SCHEMA_OF`, `STATE_EDGES`, `TYPE_LABEL` and
 * `SEMANTICS.types` — and it went red with eight `has no entry for the catalog
 * type 'bias'` lines the moment PL-12 merged.
 *
 * FIVE OF THE SEVEN ARE THE CATALOGUE'S OWN and this file re-derives every one
 * of them FROM THE PLANE rather than restating it: `OBJECT_TYPES`,
 * `STATES.bias.legal[0]`, `HEADINGS.bias`, `checkBundle`'s `knownSchemas` and
 * `STATES.bias.edges`. TWO ARE AUTHORED — `TYPE_LABEL.bias` and
 * `SEMANTICS.types.bias` — and this file deliberately pins NO WORD of either,
 * for the reason ARM O sets out.
 *
 * THE REASON THIS EXISTS BESIDE THE DRIFT GUARD, and it is measured rather than
 * argued. `check-semantics.mjs` asserted only that `SCHEMA_OF`'s value was a
 * member of `knownSchemas`, so `SCHEMA_OF.bias = 'action@1'` PASSED IT AT EXIT
 * 0 — planted, run, and restored by sha256 and by content on 2026-08-08. A
 * catalogue-sourced value that is WRONG BUT PLAUSIBLE is exactly the failure a
 * membership test cannot see, and `mdFor` writes that stamp permanently into
 * `bundle.md`. The guard is now tightened at its own site; this file is the
 * second, independent instrument over the same five values, because the project
 * has measured five times that a hand copy agrees at zero cost.
 *
 * ============================================================================
 * ONE FUNCTION, AND THE MUTATED PATH GOES THROUGH IT TOO.
 * ============================================================================
 * `sourcingVerdict(appText)` is the ONLY route to a verdict in this file. The
 * real arm calls it on the real `app.html`; every negative control calls the
 * SAME function on a MUTATED copy of that same text. There is no parallel
 * reader, so a control cannot pass by validating a path the product does not
 * use — which is how a sourcing arm elsewhere in this project passed a complete
 * hand copy of all 131 op names.
 *
 * ============================================================================
 * THE INSTRUMENT IS THE MOST LIKELY THING TO BE WRONG.
 * ============================================================================
 * A source walk anchored on a signature can take the WRONG SPAN and report a
 * clean verdict over bytes that could not have carried what it sought — sighted
 * twice this week, both passing loudly while asserting nothing. Two cheap arms
 * defend it and BOTH are here, because either alone would have caught only one:
 *   (i)  ARM S asserts each extracted span is NON-TRIVIAL — a length floor and
 *        the table names that must be inside it.
 *   (ii) ARM S then runs THE SAME READER over subjects that MUST trip it: a
 *        marker-less text, and a text whose markers survive with the body
 *        emptied. A reader that returns a clean verdict over either is broken.
 * Assertions ACCUMULATE, and the arms are FIREBREAKED into sections so a
 * TypeError is recorded as a failure NAMING ITS SECTION rather than ending the
 * module and hiding every arm behind it — an accumulating `ok` is only half of
 * that fix, because a throw never goes through `ok` at all (D-93's class; six
 * recorded sightings across this project).
 *
 * NEGATIVE CONTROL, RUN 2026-08-08, all four in-process over mutated copies —
 * the real `app.html` is never written by this file:
 *   (1) each of the seven entries deleted IN TURN -> the harness fails naming
 *       the table AND the type. Run for all seven, one at a time.
 *   (2) each of the five catalogue-sourced values HAND-TYPED to a plausible
 *       wrong value -> the sourcing arm fails naming the table. `SCHEMA_OF`'s
 *       arm is the one that mattered: `'action@1'` is a real schema the
 *       catalogue knows, and it passed before UI-51.
 *   (3) a sixth type added to the plane's `OBJECT_TYPES` -> the harness fails
 *       naming it, so the next type cannot arrive silently.
 *   (4) polarity on every pin: the unmutated text must pass the same arm.
 */
import fs from "fs";
import vm from "vm";
import {
  OBJECT_TYPES, LEGACY_TYPE_ALIASES, normalizeType, STATES, HEADINGS,
} from "../../bio-plane/checks/bio-checks.mjs";

const appPath = new URL("../app.html", import.meta.url).pathname;
const catalogPath = new URL("../../bio-plane/checks/bio-checks.mjs", import.meta.url).pathname;
const REAL = fs.readFileSync(appPath, "utf8");
const catalogSrc = fs.readFileSync(catalogPath, "utf8");

const fails = []; let n = 0;
const ok = (what, cond) => { n++; if (!cond) { fails.push(what); console.error("  FAIL " + what); } };
/* THE FIREBREAK. A section that throws is a FAILURE NAMING ITSELF, and the
   sections after it still run. */
function section(name, fn) {
  console.log("\n--- " + name + " ---");
  try { fn(); }
  catch (e) { n++; fails.push(`${name} THREW: ${e && e.message}`); console.error(`  FAIL ${name} THREW: ${e && e.message}`); }
}
const J = (v) => JSON.stringify(v);
const sameSet = (a, b) => J([...(a || [])].sort()) === J([...(b || [])].sort());

/* ============================================================
   THE READER — the one route from bytes to tables.
   ============================================================ */
const SPAN_FLOOR = { CATALOG: 1500, SEMANTICS: 3000 };
const SPAN_MUST_CONTAIN = {
  CATALOG: ["const PREFIX", "const FIRST_STATE", "const HEADINGS", "const SCHEMA_OF",
            "const STATE_EDGES", "const TYPE_LABEL"],
  SEMANTICS: ["const SEMANTICS", "types:"],
};
function span(appText, marker) {
  const re = new RegExp(`\\/\\*__${marker}_START__\\*\\/([\\s\\S]*?)\\/\\*__${marker}_END__\\*\\/`);
  const m = re.exec(appText);
  if (!m) throw new Error(`${marker} markers not found`);
  const body = m[1];
  /* (i) THE SPAN IS NON-TRIVIAL. A signature-anchored walk that took the wrong
     span would land here, not on a clean verdict. */
  if (body.length < SPAN_FLOOR[marker])
    throw new Error(`${marker} span is ${body.length} bytes, below the ${SPAN_FLOOR[marker]} floor — it cannot carry what is being read from it`);
  for (const needle of SPAN_MUST_CONTAIN[marker])
    if (!body.includes(needle))
      throw new Error(`${marker} span does not contain ${J(needle)} — the extraction took the wrong bytes`);
  return body;
}
function readCatalog(appText) {
  const names = ["PREFIX", "FIRST_STATE", "HEADINGS", "SCHEMA_OF", "STATE_EDGES", "TYPE_LABEL",
                 "NON_BUNDLE_KINDS", "normalizeType"];
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(span(appText, "CATALOG") + `;globalThis.__B={${names.join(",")}};`, ctx);
  const sctx = {}; vm.createContext(sctx);
  vm.runInContext(span(appText, "SEMANTICS") + `;globalThis.__S=SEMANTICS;`, sctx);
  return { ...ctx.__B, SEMANTICS: sctx.__S };
}

/* ============================================================
   THE PLANE'S OWN ANSWER for all five — derived, never restated.
   ============================================================ */
function knownSchemas(src) {
  const m = /knownSchemas:\s*opts\.knownSchemas\s*\?\?\s*\[([^\]]*)\]/.exec(src);
  if (!m) throw new Error("could not read the catalog's knownSchemas — the extraction needs updating");
  const list = [...m[1].matchAll(/'([^']+)'|"([^"]+)"/g)].map((x) => x[1] || x[2]);
  if (list.length < 6) throw new Error(`knownSchemas extracted only ${list.length} entries — the extraction needs updating`);
  return list;
}
/* The five, for ANY canonical type, so nothing here is bias-shaped and the same
   derivation answers for the sixth type the day it arrives.
 *
 * CORRECTED 2026-08-08, and the correction is the instrument's rather than the
 * product's — which is why it is recorded here rather than quietly applied. The
 * first draft asserted flat equality for all five over EVERY canonical type and
 * went red on `information` and `inquiry`. BOTH reds were the instrument:
 *   - `PREFIX.inquiry` — THREE catalogue prefixes map to `inquiry` (PROB, FOCUS,
 *     INQ) and the UI must mint under exactly one of them. Equality against a
 *     set is meaningless; membership is the real rule, and `check-semantics.mjs`
 *     has always encoded it that way.
 *   - `SCHEMA_OF.information` — the catalogue knows `information@1` AND
 *     `information@2`, and the UI deliberately stamps `@1` for typed intake
 *     because `@2` makes the provenance register mandatory and typed intake has
 *     no document to register. The reason is written at the table in app.html.
 *     So the rule is that the STEM must be the type and the stamp must be one
 *     the catalogue knows — not that it equals some arbitrarily chosen member.
 * A one-schema, one-prefix type such as `bias` is pinned exactly as tightly as
 * before: with a single candidate, membership and equality are the same claim.
 */
function deriveFromPlane(type, src = catalogSrc, objectTypes = OBJECT_TYPES, states = STATES, headings = HEADINGS) {
  const prefixes = Object.keys(objectTypes).filter((k) => objectTypes[k] === type);
  const schemas = knownSchemas(src).filter((s) => s.slice(0, s.indexOf("@")) === type);
  return {
    PREFIX: prefixes,                       /* a SET: the UI's value must be in it */
    FIRST_STATE: states[type] && states[type].legal[0],
    HEADINGS: headings[type],
    SCHEMA_OF: schemas,                     /* a SET: the UI's value must be in it */
    STATE_EDGES: states[type] && states[type].edges,
  };
}
/* Which of the five are compared by MEMBERSHIP in the plane's candidate set,
   and which by equality. Membership is not the weaker claim where the plane
   offers more than one legal answer — it is the only correct one. */
const BY_MEMBERSHIP = new Set(["PREFIX", "SCHEMA_OF"]);

/* ============================================================
   THE VERDICT — the ONLY route, taken by the real arm and by every control.
   ============================================================ */
const SOURCED = ["PREFIX", "FIRST_STATE", "HEADINGS", "SCHEMA_OF", "STATE_EDGES"];
const AUTHORED = ["TYPE_LABEL", "SEMANTICS.types"];
function sourcingVerdict(appText, type = "bias", opts = {}) {
  const out = [];
  let ui;
  try { ui = readCatalog(appText); }
  catch (e) { return [`the reader could not read app.html at all: ${e.message}`]; }
  const want = deriveFromPlane(type, opts.src ?? catalogSrc, opts.objectTypes ?? OBJECT_TYPES,
                               opts.states ?? STATES, opts.headings ?? HEADINGS);

  /* PRESENCE, in all seven — the class that made the harness red. */
  for (const t of [...SOURCED, ...AUTHORED]) {
    const table = t === "SEMANTICS.types" ? (ui.SEMANTICS && ui.SEMANTICS.types) : ui[t];
    if (!table || table[type] === undefined) out.push(`${t} has no entry for the catalog type '${type}'`);
  }
  /* SOURCING, for the five: the UI's value must BE the plane's. */
  for (const t of SOURCED) {
    if (!ui[t] || ui[t][type] === undefined) continue; /* already reported above */
    const got = ui[t][type];
    if (BY_MEMBERSHIP.has(t)) {
      const candidates = want[t] || [];
      if (!candidates.length)
        out.push(`${t}.${type} is ${J(got)}, and the plane offers NO candidate for '${type}' at all`);
      else if (!candidates.includes(got))
        out.push(`${t}.${type} is not one of the plane's: plane offers ${J(candidates)}, app.html says ${J(got)}`);
    } else if (J(got) !== J(want[t])) {
      out.push(`${t}.${type} is not the plane's value: plane says ${J(want[t])}, app.html says ${J(got)}`);
    }
  }
  /* THE THIRD COPY OF THE MACHINE. `SEMANTICS.types.<t>.states[s].next` is a
     SECOND copy of the edges inside the authored table, and nothing guarded it.
     It is pinned HERE and only for a type with NO legacy spelling: for
     `inquiry` and `focus` the semantics table deliberately omits `surfaced`
     from every `next` (offering a member two words for one state would be the
     collapse undone), so a global pin would be WRONG rather than strict.
     MEASURED 2026-08-08: eight such legitimate differences, all on
     inquiry/focus/problem, none on any type without a legacy spelling. */
  const row = ui.SEMANTICS && ui.SEMANTICS.types && ui.SEMANTICS.types[type];
  if (row && want.STATE_EDGES) {
    const legal = (opts.states ?? STATES)[type].legal;
    if (!sameSet(Object.keys(row.states || {}), legal))
      out.push(`SEMANTICS.types.${type} covers ${J(Object.keys(row.states || {}).sort())}, and the plane's legal set is ${J([...legal].sort())}`);
    /* THE LEGACY-SPELLING EXEMPTION, and it is a property of the TYPE rather
       than a list of types. A type is exempt when a legacy alias points AT it
       (`inquiry`) or when it IS a legacy spelling (`focus`, `problem`): for
       those the semantics table deliberately omits the legacy state from every
       `next`, because offering a member both `open` and `surfaced` would undo
       the collapse the rename was for. Written as a predicate over
       `LEGACY_TYPE_ALIASES` so a sixth type inherits the right answer without
       this file being edited — and so the exemption cannot silently widen. */
    const legacyInvolved = LEGACY_TYPE_ALIASES[type] !== undefined
      || Object.values(LEGACY_TYPE_ALIASES).includes(type);
    if (!legacyInvolved) {
      for (const [st, spec] of Object.entries(row.states || {}))
        if (want.STATE_EDGES[st] !== undefined && !sameSet(spec.next, want.STATE_EDGES[st]))
          out.push(`SEMANTICS.types.${type}.${st}.next is ${J(spec.next)}, and the plane's edges out of '${st}' are ${J(want.STATE_EDGES[st])} — a member's "what happens next" and the disposition pre-flight would disagree`);
    }
  }
  return out;
}

/* ============================================================
   ARM S · THE INSTRUMENT, BEFORE ANY PRODUCT CLAIM
   ============================================================ */
section("ARM S · the reader, and two subjects that MUST trip it", () => {
  const ui = readCatalog(REAL);
  ok("S1: the reader returns all six catalog tables and the semantics table over the real app.html",
     !!(ui.PREFIX && ui.FIRST_STATE && ui.HEADINGS && ui.SCHEMA_OF && ui.STATE_EDGES && ui.TYPE_LABEL
        && ui.SEMANTICS && ui.SEMANTICS.types));
  const cat = span(REAL, "CATALOG"), sem = span(REAL, "SEMANTICS");
  console.log(`  CORPUS: CATALOG span ${cat.length} bytes, SEMANTICS span ${sem.length} bytes`);
  ok(`S2: the CATALOG span is non-trivial (${cat.length} bytes, floor ${SPAN_FLOOR.CATALOG})`, cat.length >= SPAN_FLOOR.CATALOG);
  ok(`S3: the SEMANTICS span is non-trivial (${sem.length} bytes, floor ${SPAN_FLOOR.SEMANTICS})`, sem.length >= SPAN_FLOOR.SEMANTICS);

  /* (ii) THE MUST-TRIP SUBJECTS. A reader that reports clean over either of
     these would report clean over anything. */
  let tripped = 0;
  try { readCatalog(REAL.replace("/*__CATALOG_START__*/", "/*__CATALOG_GONE__*/")); }
  catch (_) { tripped++; }
  ok("S4: the SAME reader THROWS on a text whose markers are gone, rather than reporting a clean verdict over nothing", tripped === 1);

  const hollow = REAL.replace(/\/\*__CATALOG_START__\*\/[\s\S]*?\/\*__CATALOG_END__\*\//,
                              "/*__CATALOG_START__*/ const PREFIX={}; /*__CATALOG_END__*/");
  let tripped2 = 0;
  try { readCatalog(hollow); } catch (_) { tripped2++; }
  ok("S5: the SAME reader THROWS when the markers SURVIVE but the span is hollow — the wrong-span failure that "
     + "passes loudly while asserting nothing", tripped2 === 1);
  ok("S6 (polarity): the hollow subject really is different bytes from the real one", hollow !== REAL);
});

/* ============================================================
   ARM P · THE PLANE'S SIDE, before anything is compared to it
   ============================================================ */
section("ARM P · what the plane actually says", () => {
  const CANONICAL = [...new Set(Object.values(OBJECT_TYPES))].sort();
  console.log(`  CORPUS: ${CANONICAL.length} canonical types (${CANONICAL.join(", ")}); ` +
              `${STATES.bias ? STATES.bias.legal.length : 0} bias states; ` +
              `${SOURCED.length} plane-sourced tables + ${AUTHORED.length} authored`);
  /* A FLOOR AS WELL AS A CEILING. A ceiling alone ratchets one way: the day a
     type is dropped, a ceiling-only check goes quiet. */
  ok(`P1 (floor): the catalogue carries at least 5 canonical types, and does today (${CANONICAL.length})`, CANONICAL.length >= 5);
  ok("P2: `bias` is one of them", CANONICAL.includes("bias"));
  ok("P3: the plane's bias machine is draft -> proposed -> adopted -> retired",
     J(STATES.bias.legal) === J(["draft", "proposed", "adopted", "retired"]));
  ok("P4: there is NO draft -> adopted edge — the closure that makes `proposed` load-bearing rather than ceremonial",
     !STATES.bias.edges.draft.includes("adopted"));
  ok("P5: `adopted` leaves only to `retired` — an adopted set is pinned, and a case names the version it was held to",
     J(STATES.bias.edges.adopted) === J(["retired"]));
  /* CORRECTED 2026-08-08 alongside `deriveFromPlane` itself, never exempted:
     these two arms asserted `PREFIX` and `SCHEMA_OF` were SCALARS, which was
     true only for a type the catalogue gives exactly one of. `inquiry` has
     three prefixes and `information` two schemas, so the scalar assumption was
     wrong about the catalogue rather than strict about it. Both are now
     candidate SETS, and for `bias` each set holds exactly one member — which is
     the same pin as before, stated in terms that survive the next type. */
  ok("P6: the five derivations all resolve from the plane for `bias`, each candidate set holding exactly one member", (() => {
    const w = deriveFromPlane("bias");
    return J(w.PREFIX) === J(["BIAS"]) && w.FIRST_STATE === "draft" && Array.isArray(w.HEADINGS)
        && J(w.SCHEMA_OF) === J(["bias@1"]) && !!w.STATE_EDGES;
  })());
  /* POLARITY on the derivation itself: it must NOT answer for a type the plane
     does not have, or every comparison below would be against undefined. */
  const ghost = deriveFromPlane("nosuchtype");
  ok("P7 (polarity): the same derivation answers NOTHING for a type the plane does not have",
     ghost.FIRST_STATE === undefined && ghost.HEADINGS === undefined
     && ghost.PREFIX.length === 0 && ghost.SCHEMA_OF.length === 0);
});

/* ============================================================
   ARM R · THE REAL PATH
   ============================================================ */
section("ARM R · the real app.html, through sourcingVerdict", () => {
  const v = sourcingVerdict(REAL);
  ok("R1: the real app.html carries all seven entries for `bias`, and the five plane-sourced ones ARE the plane's",
     v.length === 0);
  if (v.length) for (const line of v) console.error("      " + line);
  /* Every canonical type goes through the SAME verdict, so this file does not
     become bias-shaped and the sixth type is measured the day it lands. */
  for (const t of [...new Set(Object.values(OBJECT_TYPES))].sort()) {
    const vt = sourcingVerdict(REAL, t);
    ok(`R2.${t}: the same verdict is clean for '${t}'`, vt.length === 0);
    if (vt.length) for (const line of vt) console.error("      " + line);
  }

  /* THE EXEMPTION IS GUARDED, because an exemption nobody enforces is a rule
     nobody remembers deleting. Three claims: it is NARROW (exactly the
     legacy-involved types), it does NOT cover `bias`, and the pin it suspends
     really does have teeth on `bias`. */
  const exempt = [...new Set(Object.values(OBJECT_TYPES))]
    .filter((t) => LEGACY_TYPE_ALIASES[t] !== undefined || Object.values(LEGACY_TYPE_ALIASES).includes(t));
  console.log(`  CORPUS: the next-pin is suspended for ${exempt.length} of 5 types (${exempt.join(", ") || "none"})`);
  ok(`R3: the next-pin is suspended for exactly the legacy-involved types (${J(exempt)})`, J(exempt.sort()) === J(["inquiry"]));
  ok("R4: `bias` is NOT exempt — its `next` really is pinned against the plane's edges", !exempt.includes("bias"));
  /* R5 is the teeth: break `next` for bias alone and the pin must fire. */
  const bent = REAL.replace(`enables:["write and revise its statements","offer it as proposed"],\n        forbids:[["adopting it","a set is offered as proposed before anybody adopts it"]], next:["proposed","retired"] },`,
                            `enables:["write and revise its statements","offer it as proposed"],\n        forbids:[["adopting it","a set is offered as proposed before anybody adopts it"]], next:["proposed","adopted","retired"] },`);
  ok("R5: the anchor for the teeth arm exists and the bytes changed", bent !== REAL);
  const vb = sourcingVerdict(bent);
  ok("R6 (teeth): offering `draft -> adopted` in the SEMANTICS row alone FAILS — the closure that makes `proposed` "
     + "load-bearing is pinned in the authored table too, not only in STATE_EDGES",
     vb.some((l) => l.includes("SEMANTICS.types.bias.draft.next")));
  if (vb.length) console.log(`      bias next bent -> ${vb.length} failure(s); first: ${vb[0]}`);
});

/* ============================================================
   ARM J · THE JUDGEMENT — a bias set is a GOVERNANCE OBJECT
   ============================================================ */
section("ARM J · `bias` is in PREFIX and is still not mintable from the add surface", () => {
  /* THE DELEGATION NAMED THIS RISK EXPLICITLY: "Adding it to PREFIX makes it
     mintable from wherever PREFIX is read." It is NOT mintable — the kind
     reaching the two `allocid` sites comes from ADD_TYPES or a proposal's own
     kind, never from PREFIX's key set — and that is pinned here rather than
     left true by accident. A bias set is written by instance admins and project
     managers, not minted from the add surface. */
  const m = /const ADD_TYPES = \[([\s\S]*?)\];/.exec(REAL);
  ok("J1: ADD_TYPES is readable from app.html", !!m);
  if (m) {
    const kinds = [...m[1].matchAll(/\["([a-z_]+)"/g)].map((x) => x[1]);
    console.log(`  CORPUS: the add surface offers ${kinds.length} kinds (${kinds.join(", ")})`);
    ok(`J2 (floor): the add surface still offers at least 4 kinds (${kinds.length}) — so J3 is not passing because the list emptied`,
       kinds.length >= 4);
    ok("J3: `bias` is NOT one of them — a governance object is not minted from the add surface", !kinds.includes("bias"));
    ok("J4 (polarity): the same read DOES find `inquiry`, so J3 is a measurement and not a regex that matches nothing",
       kinds.includes("inquiry"));
  }
});

/* ============================================================
   NEGATIVE CONTROLS — every one through sourcingVerdict, on mutated COPIES
   ============================================================ */
section("NC1 · each of the seven entries deleted IN TURN", () => {
  const cuts = {
    PREFIX: [`, bias:"BIAS" }`, ` }`],
    FIRST_STATE: [`, bias:"draft" }`, ` }`],
    HEADINGS: [`\n  bias:["## Statements","## Adoption","## What This Does Not Enforce","## Session Log","## Review Notes"],`, ``],
    SCHEMA_OF: [`, bias:"bias@1" }`, ` }`],
    STATE_EDGES: [`\n  bias:{ draft:["proposed","retired"], proposed:["draft","adopted","retired"], adopted:["retired"], retired:[] },`, ``],
    TYPE_LABEL: [`\n                     bias:"Bias set",`, ``],
  };
  for (const [table, [from, to]] of Object.entries(cuts)) {
    const hits = REAL.split(from).length - 1;
    ok(`NC1.${table}: the anchor exists EXACTLY ONCE, so the mutation is the one intended`, hits === 1);
    if (hits !== 1) continue;
    const mutated = REAL.replace(from, to);
    ok(`NC1.${table}: the bytes actually changed`, mutated !== REAL);
    const v = sourcingVerdict(mutated);
    ok(`NC1.${table}: removing it FAILS, naming the table AND the type`,
       v.some((l) => l.includes(table) && l.includes("bias")));
    console.log(`      ${table} removed -> ${v.length} failure(s); first: ${v[0] || "(none)"}`);
  }
  /* The seventh, SEMANTICS.types, needs the whole row cut. */
  const semAnchor = `    bias: { noun:"bias set", states: {`;
  ok("NC1.SEMANTICS.types: the anchor exists EXACTLY ONCE", REAL.split(semAnchor).length - 1 === 1);
  const semCut = REAL.replace(/\n    bias: \{ noun:"bias set", states: \{[\s\S]*?\n    \}\},/, "");
  ok("NC1.SEMANTICS.types: the bytes actually changed", semCut !== REAL);
  const vs = sourcingVerdict(semCut);
  ok("NC1.SEMANTICS.types: removing the row FAILS, naming the table AND the type",
     vs.some((l) => l.includes("SEMANTICS.types") && l.includes("bias")));
  console.log(`      SEMANTICS.types removed -> ${vs.length} failure(s); first: ${vs[0] || "(none)"}`);
});

section("NC2 · each catalogue-sourced value HAND-TYPED to a plausible wrong value", () => {
  /* Every replacement below is a value somebody could reasonably type: a real
     prefix, a real state, a real heading set, A SCHEMA THE CATALOGUE KNOWS, and
     a real edge added. None is nonsense, which is the point. */
  const swaps = {
    PREFIX:      [`, bias:"BIAS" }`, `, bias:"BIAS1" }`],
    FIRST_STATE: [`, bias:"draft" }`, `, bias:"proposed" }`],
    HEADINGS:    [`bias:["## Statements","## Adoption"`, `bias:["## Statements","## Adoptions"`],
    /* THE ONE THAT MATTERED. `action@1` IS in knownSchemas, so the pre-UI-51
       drift guard passed it at exit 0. */
    SCHEMA_OF:   [`, bias:"bias@1" }`, `, bias:"action@1" }`],
    STATE_EDGES: [`bias:{ draft:["proposed","retired"]`, `bias:{ draft:["proposed","adopted","retired"]`],
  };
  for (const [table, [from, to]] of Object.entries(swaps)) {
    const hits = REAL.split(from).length - 1;
    ok(`NC2.${table}: the anchor exists EXACTLY ONCE`, hits === 1);
    if (hits !== 1) continue;
    const mutated = REAL.replace(from, to);
    ok(`NC2.${table}: the bytes actually changed`, mutated !== REAL);
    const v = sourcingVerdict(mutated);
    ok(`NC2.${table}: a plausible hand-typed value FAILS the sourcing arm, naming the table`,
       v.some((l) => l.startsWith(`${table}.bias`)));
    console.log(`      ${table} hand-typed -> ${v.length} failure(s); first: ${v[0] || "(none)"}`);
    ok(`NC2.${table} (polarity): the UNMUTATED text passes the same arm`, sourcingVerdict(REAL).length === 0);
  }
});

section("NC3 · a SIXTH type added to the plane", () => {
  /* The plane is not written. The sixth type is injected into the derivation's
     own inputs, which is the same path `deriveFromPlane` takes for the real
     five — so this measures what would happen the day PL-n mints one. */
  const sixth = { ...OBJECT_TYPES, LENS: "lens" };
  const states6 = { ...STATES, lens: { legal: ["draft", "retired"], edges: { draft: ["retired"], retired: [] } } };
  const heads6 = { ...HEADINGS, lens: ["## Statements", "## Session Log", "## Review Notes"] };
  const canon = [...new Set(Object.values(sixth))].sort();
  ok(`NC3a: the injected catalogue really does carry a sixth type (${canon.length})`, canon.length === 6 && canon.includes("lens"));
  const v = sourcingVerdict(REAL, "lens", { objectTypes: sixth, states: states6, headings: heads6 });
  ok("NC3b: the harness FAILS for the new type, NAMING it, so a sixth type cannot arrive silently",
     v.length > 0 && v.every((l) => l.includes("lens")));
  ok("NC3c: and it names every one of the seven tables it is missing from",
     [...SOURCED, ...AUTHORED].every((t) => v.some((l) => l.startsWith(`${t} has no entry`))));
  console.log(`      sixth type 'lens' -> ${v.length} failure(s); first: ${v[0] || "(none)"}`);
  ok("NC3d (polarity): the same call over the REAL five-type catalogue is clean", sourcingVerdict(REAL).length === 0);
});

/* ============================================================
   ARM O · OVER-STRICTNESS — a correct alternative must PASS
   ============================================================ */
section("ARM O · the two AUTHORED entries are not frozen by this file", () => {
  /* THIS FILE PINS NO WORD OF EITHER AUTHORED ENTRY, and that is deliberate
     rather than an omission. DEC-49 owns member-facing wording; UI-51 lifted
     the record's existing noun and sentences rather than coining any, and a
     test that froze those sentences would make DEC-49's own ruling fail the
     build the day it lands. What is pinned is STRUCTURE — the row exists, it
     covers exactly the plane's legal states, and its `next` is the plane's
     edges. Reword every sentence tomorrow and this file stays green; drop a
     state, invent one, or contradict the machine and it fails. */
  const alien = REAL
    .replace(`bias:"Bias set",`, `bias:"Declared lens",`)
    .replace(/meaning:"Being written, and in force over nothing\.[^"]*"/,
             `meaning:"Nobody's work is read through this yet; it is still being written."`)
    .replace(/noun:"bias set"/, `noun:"declared lens"`);
  ok("O1: the alien text really is different bytes", alien !== REAL);
  const v = sourcingVerdict(alien);
  ok("O2: a label and a meaning phrased unlike anything this item wrote still PASS — the authored half is DEC-49's, not this file's",
     v.length === 0);
  if (v.length) for (const line of v) console.error("      " + line);
  /* And the polarity that keeps O2 honest: a STRUCTURAL break in the same
     authored table must still fail, so O2 is not passing because nothing in
     SEMANTICS is checked at all. */
  const broken = REAL.replace(/      retired:  \{ chip:"retired", mark:"R", quiet:true,[\s\S]*?next:\[\] \},\n/, "");
  ok("O3 (polarity): the same table with a STATE dropped still FAILS, so O2 is permissiveness about words and not about structure",
     broken !== REAL && sourcingVerdict(broken).length > 0);
});

console.log(`\nbias-vocabulary: ${n - fails.length} pass, ${fails.length} fail`);
if (fails.length) {
  console.error(`bias-vocabulary: ${fails.length} of ${n} assertions FAILED`);
  for (const f of fails) console.error("  - " + f);
  process.exit(1);
}
process.exit(0);
