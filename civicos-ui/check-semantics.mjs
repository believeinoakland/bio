#!/usr/bin/env node
/* check-semantics.mjs — THE DRIFT GUARD, and as of UI-10 it is a real one.
 *
 * WHAT IT USED TO BE, and why that mattered. This check read `app.html` and
 * `store.mjs` and NEVER opened `checks/bio-checks.mjs`, while `app.html` said
 * in a comment that it *"fails the build if they drift from
 * checks/bio-checks.mjs."* DATA-MODEL.md §2.7 measured the claim false (D-138):
 * `PREFIX`, `FIRST_STATE`, `HEADINGS` and `SCHEMA_OF` were entirely unguarded,
 * and only state TOKENS were compared. A guard that is documented and not in
 * the loop the reader runs is not a mechanism (CLAUDE.md) — worse, it makes the
 * next session skip a check it believes is already running. That is exactly how
 * the UI's copies became the part that drifted through the SECOND rename.
 *
 * WHAT IT IS NOW. It IMPORTS the catalog as a module and compares, by name:
 *
 *   1. the CATALOG BLOCK in app.html — `LEGACY_TYPE_ALIASES`, `PREFIX`,
 *      `FIRST_STATE`, `HEADINGS`, `SCHEMA_OF`, `STATE_EDGES`, `PHASE`,
 *      `TYPE_LABEL` — against `OBJECT_TYPES` / `LEGACY_TYPE_ALIASES` /
 *      `STATES` / `HEADINGS` and the catalog's own known-schema list. A table
 *      the catalog moved and the UI did not FAILS, naming the table and the key.
 *   2. the SEMANTICS block — every state the catalog calls legal has a
 *      semantics row (a state with no row renders an invented first-letter seal
 *      over an empty explanation), and every state the UI declares is legal for
 *      the type that declares it (the UI invents nothing).
 *   3. the store's own literals, as a SECOND and INDEPENDENT instrument: a
 *      state the store writes or gates on must also have a row. The catalog is
 *      the authority on what is legal; this catches a store that writes
 *      something the catalog never blessed.
 *   4. the flattened docprofile copy against the package.
 *
 * Textual extraction is deliberately conservative: the two marked blocks are
 * evaluated in a vm, and the catalog's known-schema list — the one table
 * `bio-checks.mjs` keeps as a default argument rather than an export — is read
 * from its source. Run from civicos-ui/:
 *
 *     node check-semantics.mjs [path-to-store.mjs]
 *
 * NEGATIVE CONTROL, RUN 2026-08-04 and restored byte-identical (the catalog's
 * sha256 was compared before and after each arm), two arms:
 *
 *   (a) change `HEADINGS.inquiry` in `bio-plane/checks/bio-checks.mjs` ALONE —
 *       `## Conclusion` -> `## The Answer` — and this check FAILS with
 *         FAIL: HEADINGS.inquiry has drifted from the catalog
 *       printing both spellings, and `node civicos-ui/test/run.mjs` fails with
 *       it (add-surface.test.mjs catches the same edit through its own import,
 *       which is two independent instruments on one drift). BEFORE UI-10 THE
 *       SAME EDIT LEFT THIS CHECK GREEN — it never opened the catalog — and
 *       that is the whole reason the item exists.
 *
 *   (c) UI-11's arm, over the basis vocabulary, RUN 2026-08-04 (both files
 *       restored byte-identical, sha256 compared): drop `inherited` from
 *       `GRADE_SOURCES` in app.html alone ->
 *         FAIL: GRADE_SOURCES has drifted from the catalog
 *       and, the other direction, ADD a fifth source to `GRADE_SOURCES` in the
 *       catalog alone ->
 *         FAIL: GRADE_SOURCES has drifted from the catalog
 *         FAIL: GRADE_SOURCE_WORD has no member-facing word for 'estimate'
 *       — which is the failure that matters: a new grade source with no word
 *       renders a blank sentence beside a leg's grade on the inquiry page, and
 *       nothing else in the suite would have noticed.
 *
 *   (b) delete `divided` from `STATES.inquiry.legal` in the catalog alone and
 *       this check FAILS twice, naming the UI as the inventor:
 *         FAIL: PHASE names 'divided', which is not a legal inquiry state
 *         FAIL: SEMANTICS.types.inquiry declares the state 'divided', ...
 *       so the guard runs in BOTH directions, not only catalog -> UI.
 */
import fs from "fs";
import vm from "vm";
import {
  OBJECT_TYPES, LEGACY_TYPE_ALIASES, normalizeType, STATES, HEADINGS,
  BASIS_ROLES, BASIS_GRADES, GRADE_AXES, GRADE_SOURCES, STRENGTH_STATES,
} from "../bio-plane/checks/bio-checks.mjs";

const appPath = new URL("./app.html", import.meta.url).pathname;
const storePath = process.argv[2] || new URL("../bio-plane/src/store.mjs", import.meta.url).pathname;
const catalogPath = new URL("../bio-plane/checks/bio-checks.mjs", import.meta.url).pathname;

const app = fs.readFileSync(appPath, "utf8");
let fail = false;
const bad = (msg) => { fail = true; console.error("FAIL: " + msg); };
const J = (v) => JSON.stringify(v);

/* ---- extract the two marked blocks from the single-file runtime ---- */
function block(marker, exportNames) {
  const re = new RegExp(`\\/\\*__${marker}_START__\\*\\/([\\s\\S]*?)\\/\\*__${marker}_END__\\*\\/`);
  const m = re.exec(app);
  if (!m) { console.error(`FAIL: ${marker} markers not found in app.html`); process.exit(1); }
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(m[1] + `;globalThis.__B={${exportNames.join(",")}};`, ctx);
  return ctx.__B;
}
const C = block("CATALOG", ["LEGACY_TYPE_ALIASES", "normalizeType", "vocabFor", "PREFIX",
  "FIRST_STATE", "HEADINGS", "SCHEMA_OF", "STATE_EDGES", "PHASE", "PHASE_LABEL",
  "TYPE_LABEL", "NON_BUNDLE_KINDS",
  /* UI-11: REC-11/REC-12's basis and strength vocabulary. */
  "BASIS_ROLES", "BASIS_GRADES", "GRADE_AXES", "GRADE_SOURCES", "STRENGTH_STATES",
  "ROLE_WORD", "AXIS_WORD", "AXIS_SHORT", "GRADE_SOURCE_WORD", "STRENGTH_STATE_WORD",
  /* UI-16: the project readiness ladder. */
  "WORKPRODUCT_STATES", "WORKPRODUCT_WORD"]);
const S = block("SEMANTICS", ["SEMANTICS"]).SEMANTICS;

/* The canonical types: what OBJECT_TYPES maps its prefixes onto, deduplicated.
   Three prefixes point at `inquiry` and that is the whole point of the collapse. */
const CANONICAL = [...new Set(Object.values(OBJECT_TYPES))].sort();

/* ---- 1. the catalog block IS the catalog ---- */

/* the alias map, flattened and identical */
if (J(C.LEGACY_TYPE_ALIASES) !== J(LEGACY_TYPE_ALIASES))
  bad(`LEGACY_TYPE_ALIASES has drifted from the catalog.\n       catalog: ${J(LEGACY_TYPE_ALIASES)}\n       app.html: ${J(C.LEGACY_TYPE_ALIASES)}`);

/* every canonical type is reachable in every table the UI writes through */
for (const [name, table] of [["PREFIX", C.PREFIX], ["FIRST_STATE", C.FIRST_STATE],
                             ["HEADINGS", C.HEADINGS], ["SCHEMA_OF", C.SCHEMA_OF],
                             ["STATE_EDGES", C.STATE_EDGES], ["TYPE_LABEL", C.TYPE_LABEL],
                             ["SEMANTICS.types", S.types]])
  for (const t of CANONICAL)
    if (table[t] === undefined) bad(`${name} has no entry for the catalog type '${t}'`);

/* PREFIX: the id prefix a member's new bundle is minted under must be one the
   catalog's own BUNDLE_ID_RE family maps back onto that same type. */
for (const [t, prefix] of Object.entries(C.PREFIX)) {
  if (OBJECT_TYPES[prefix] === undefined) bad(`PREFIX.${t} is '${prefix}', which the catalog's OBJECT_TYPES does not know`);
  else if (OBJECT_TYPES[prefix] !== normalizeType(t))
    bad(`PREFIX.${t} is '${prefix}', which the catalog maps to '${OBJECT_TYPES[prefix]}' and not to '${normalizeType(t)}'`);
}
/* and the canonical type mints under the prefix that means only it: `inquiry`
   is INQ, never a legacy spelling's prefix, or a new question would be born
   wearing the name the collapse retired. */
for (const t of CANONICAL) {
  const p = C.PREFIX[t];
  if (p !== undefined && normalizeType(String(OBJECT_TYPES[p])) === t && LEGACY_TYPE_ALIASES[String(OBJECT_TYPES[p])] === undefined) {
    const canonicalPrefixes = Object.keys(OBJECT_TYPES).filter((k) => OBJECT_TYPES[k] === t);
    if (canonicalPrefixes.length > 1 && !canonicalPrefixes.includes(p))
      bad(`PREFIX.${t} is '${p}', which is not one of the catalog's prefixes for it (${canonicalPrefixes.join(", ")})`);
  }
}

/* FIRST_STATE and HEADINGS and STATE_EDGES: key for key, over the UNION, so a
   key either side gained is a failure rather than a silent pass. */
const union = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
for (const t of union(C.FIRST_STATE, STATES)) {
  const want = STATES[t] && STATES[t].legal[0];
  if (want === undefined) bad(`FIRST_STATE.${t} names a type the catalog does not have`);
  else if (C.FIRST_STATE[t] !== want)
    bad(`FIRST_STATE.${t} has drifted from the catalog: catalog says '${want}', app.html says '${C.FIRST_STATE[t]}'`);
}
for (const t of union(C.HEADINGS, HEADINGS)) {
  if (HEADINGS[t] === undefined) bad(`HEADINGS.${t} names a type the catalog does not have`);
  else if (J(C.HEADINGS[t]) !== J(HEADINGS[t]))
    bad(`HEADINGS.${t} has drifted from the catalog.\n       catalog:  ${J(HEADINGS[t])}\n       app.html: ${J(C.HEADINGS[t])}`);
}
for (const t of union(C.STATE_EDGES, STATES)) {
  if (STATES[t] === undefined) bad(`STATE_EDGES.${t} names a type the catalog does not have`);
  else if (J(C.STATE_EDGES[t]) !== J(STATES[t].edges))
    bad(`STATE_EDGES.${t} has drifted from the catalog's state machine.\n       catalog:  ${J(STATES[t].edges)}\n       app.html: ${J(C.STATE_EDGES[t])}`);
}

/* SCHEMA_OF: every value must be a schema the catalog will accept. That list is
   a default argument inside checkBundle rather than an export, so it is read
   from the source — textually, and stated as such. */
const catalogSrc = fs.readFileSync(catalogPath, "utf8");
const ksm = /knownSchemas:\s*opts\.knownSchemas\s*\?\?\s*\[([^\]]*)\]/.exec(catalogSrc);
if (!ksm) bad("could not read the catalog's known-schema list (knownSchemas in checkBundle) — the extraction needs updating");
else {
  const known = [...ksm[1].matchAll(/'([^']+)'|"([^"]+)"/g)].map((m) => m[1] || m[2]);
  for (const [t, schema] of Object.entries(C.SCHEMA_OF))
    if (!known.includes(schema))
      bad(`SCHEMA_OF.${t} is '${schema}', which the catalog does not know (it knows ${known.join(", ")})`);
}

/* UI-16 · WORKPRODUCT_STATES: the project readiness ladder the workspace
   renders. C-2.9's legal set is a LOCAL inside `checkProjectExtension` rather
   than an export, so it is read from the source textually — the same shape and
   the same stated caveat as the knownSchemas pin above. The order matters as
   well as the membership: the ladder is drawn in it, so a catalog that reorders
   the rungs must reorder them here too. */
const wsm = /const WS = \[([^\]]*)\]/.exec(catalogSrc);
if (!wsm) bad("could not read the catalog's workproduct_state list (WS in checkProjectExtension) — the extraction needs updating");
else {
  const ws = [...wsm[1].matchAll(/'([^']+)'|"([^"]+)"/g)].map((m) => m[1] || m[2]);
  if (J(C.WORKPRODUCT_STATES) !== J(ws))
    bad(`WORKPRODUCT_STATES has drifted from the catalog's C-2.9 ladder.\n       catalog:  ${J(ws)}\n       app.html: ${J(C.WORKPRODUCT_STATES)}`);
  for (const s of ws)
    if (!C.WORKPRODUCT_WORD[s])
      bad(`WORKPRODUCT_WORD has no member-facing word for the readiness rung '${s}'`);
}
for (const k of Object.keys(C.WORKPRODUCT_WORD))
  if (!C.WORKPRODUCT_STATES.includes(k))
    bad(`WORKPRODUCT_WORD.${k} is not one of the catalog's readiness rungs`);

/* TYPE_LABEL may name kinds that are not bundle types (a search hit's
   annotation or source), and nothing else. */
for (const k of Object.keys(C.TYPE_LABEL))
  if (!CANONICAL.includes(k) && !C.NON_BUNDLE_KINDS.includes(k))
    bad(`TYPE_LABEL.${k} is neither a catalog type nor one of the declared non-bundle kinds`);

/* PHASE: the member-facing name is DERIVED from current_state and stored
   nowhere, so every state an inquiry can legally stand in — under the canonical
   machine and under the legacy one it is read through — must have a phase. */
const inquiryStates = [...new Set([...STATES.inquiry.legal, ...STATES.focus.legal])].sort();
for (const st of inquiryStates)
  if (C.PHASE[st] === undefined) bad(`PHASE has no member-facing name for the inquiry state '${st}'`);
for (const [st, phase] of Object.entries(C.PHASE)) {
  if (!inquiryStates.includes(st)) bad(`PHASE names '${st}', which is not a legal inquiry state in the catalog`);
  if (C.PHASE_LABEL[phase] === undefined) bad(`PHASE.${st} is '${phase}', which PHASE_LABEL does not name`);
}

/* ---- 1b. the BASIS and STRENGTH vocabulary IS the catalog's (UI-11) ----
   The same guarantee UI-10 established over the type tables, extended to the
   five arrays REC-11 and REC-12 introduced. Both directions: an array that
   drifts fails naming it, and every value in it must have a member-facing word
   in app.html — a new grade source with no word renders a blank sentence on the
   inquiry page, which is exactly the silent failure this guard exists for. */
for (const [name, ui, cat] of [
  ["BASIS_ROLES", C.BASIS_ROLES, BASIS_ROLES],
  ["BASIS_GRADES", C.BASIS_GRADES, BASIS_GRADES],
  ["GRADE_AXES", C.GRADE_AXES, GRADE_AXES],
  ["GRADE_SOURCES", C.GRADE_SOURCES, GRADE_SOURCES],
  ["STRENGTH_STATES", C.STRENGTH_STATES, STRENGTH_STATES],
]) {
  if (J(ui) !== J(cat))
    bad(`${name} has drifted from the catalog.\n       catalog:  ${J(cat)}\n       app.html: ${J(ui)}`);
}
for (const [wordTable, values, label] of [
  [C.ROLE_WORD, BASIS_ROLES, "ROLE_WORD"],
  [C.AXIS_WORD, GRADE_AXES, "AXIS_WORD"],
  [C.AXIS_SHORT, GRADE_AXES, "AXIS_SHORT"],
  [C.GRADE_SOURCE_WORD, GRADE_SOURCES, "GRADE_SOURCE_WORD"],
  [C.STRENGTH_STATE_WORD, STRENGTH_STATES, "STRENGTH_STATE_WORD"],
]) {
  for (const v of values)
    if (!wordTable || wordTable[v] === undefined)
      bad(`${label} has no member-facing word for '${v}', which the catalog declares`);
  for (const k of Object.keys(wordTable || {}))
    if (!values.includes(k)) bad(`${label} names '${k}', which the catalog does not declare`);
}
/* D-160 is ABSOLUTE: the retired word for the boundary case means the OPPOSITE
   in SB-OUTPUT §5.1, so it must not appear in the member-facing runtime at all.
   The literal is assembled from halves here for the same reason the plane's own
   guard does it — a guard that spells the word is an occurrence of the word. */
{
  const retired = "susp" + "end";
  const hits = [...app.matchAll(new RegExp(retired + "[a-z]*", "gi"))].map((m) => m[0]);
  if (hits.length) bad(`the retired strength word appears in app.html ${hits.length} time(s) (${[...new Set(hits)].join(", ")}): UNRATED is the word (D-160)`);
}

/* ---- 2. the semantics table covers the catalog, and invents nothing ---- */
const uiStates = new Set();
for (const t of Object.values(S.types)) for (const s of Object.keys(t.states)) uiStates.add(s);
const uiCrit = new Set(Object.keys(S.criticality));

for (const [t, spec] of Object.entries(STATES)) {
  const row = S.types[t] !== undefined ? S.types[t] : S.types[normalizeType(t)];
  if (!row) { bad(`SEMANTICS.types has no entry for the catalog type '${t}'`); continue; }
  for (const st of spec.legal)
    if (!row.states[st]) bad(`SEMANTICS.types.${t} has no row for the state '${st}', which the catalog calls legal — it would render an invented seal over an empty explanation`);
}
for (const [t, row] of Object.entries(S.types)) {
  const spec = STATES[t] !== undefined ? STATES[t] : STATES[normalizeType(t)];
  if (!spec) { bad(`SEMANTICS.types.${t} is a type the catalog does not have`); continue; }
  for (const st of Object.keys(row.states))
    if (!spec.legal.includes(st)) bad(`SEMANTICS.types.${t} declares the state '${st}', which the catalog does not call legal for it`);
}

/* ---- 3. the store's literals, as a second instrument ---- */
const store = fs.readFileSync(storePath, "utf8");
const planeStates = new Set();
// explicit state arrays, e.g. INQUIRY_STATES = ["open", ...]
for (const arr of store.matchAll(/_STATES\s*=\s*\[([^\]]*)\]/g))
  for (const w of arr[1].matchAll(/"([a-z_]+)"/g)) planeStates.add(w[1]);
// literals the store writes or gates on
for (const w of store.matchAll(/current_state\s*[!=]==?\s*"([a-z_]+)"/g)) planeStates.add(w[1]);
for (const w of store.matchAll(/#setScalar\([^,]+,\s*"current_state",\s*"([a-z_]+)"\)/g)) planeStates.add(w[1]);
for (const w of store.matchAll(/to_state:\s*"([a-z_]+)"/g)) planeStates.add(w[1]);
for (const w of store.matchAll(/from_state:\s*"([a-z_]+)"/g)) planeStates.add(w[1]);
const planeCrit = new Set();
for (const w of store.matchAll(/criticality\s*[!=]==?\s*"([a-z_]+)"/g)) planeCrit.add(w[1]);

const missingInUi = [...planeStates].filter((s) => !uiStates.has(s));
const critMissing = [...planeCrit].filter((c) => !uiCrit.has(c));

console.log("catalog types:       ", CANONICAL.join(", "));
console.log("catalog states:      ", [...new Set(Object.values(STATES).flatMap((s) => s.legal))].sort().join(", "));
console.log("ui states declared:  ", [...uiStates].sort().join(", "));
console.log("store literals seen: ", [...planeStates].sort().join(", "));
if (missingInUi.length) bad("states the store writes with no semantics row: " + missingInUi.join(", "));
if (critMissing.length) bad("plane criticality values with no semantics row: " + critMissing.join(", "));

/* ---- 4. docprofile ----
   docprofile is shared: the package is canonical and the plane imports it as
   modules, while app.html carries a flattened copy because its runtime is one
   self-contained file. Two copies drift, so the build refuses any difference. */
const { bundle } = await import("../tools/bundle-docprofile.mjs");
const want = bundle(new URL("../", import.meta.url)).trim();
const got = /\/\*__DOCPROFILE_START__\*\/\n([\s\S]*?)\n\/\*__DOCPROFILE_END__\*\//.exec(app);
if (!got) bad("the flattened docprofile is missing from app.html");
else if (!got[1].includes(want))
  bad("app.html's docprofile copy has drifted. Run tools/bundle-docprofile.mjs and paste the result between the markers.");
else console.log("OK: the docprofile copy in app.html matches the package exactly.");

if (!fail) console.log("OK: app.html's catalog block IS the catalog, and the semantics table covers it and invents nothing.");
process.exit(fail ? 1 : 0);
