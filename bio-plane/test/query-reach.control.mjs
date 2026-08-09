/* REC-68 / D-228 — BRANCH REACHABILITY OF THE SELECTOR LANGUAGE, COMMITTED SO
 * THE MEASUREMENT RE-RUNS IN ONE STEP.
 *
 *     cd bio-plane && node test/query-reach.control.mjs
 *
 * DELIBERATELY NOT A `.test.mjs`: it re-executes itself as a subprocess under
 * NODE_V8_COVERAGE and writes a coverage directory, so `scripts/battery.mjs`
 * must not discover it. `suggest.control.mjs` and `register.control.mjs` are
 * the precedent.
 *
 * WHY THIS IS A REAL MEASUREMENT HERE AND NOWHERE ELSE IN THE PLANE.
 * `VERIFICATION.md` declines to report line coverage because the plane runs
 * inside workerd, where NODE_V8_COVERAGE instruments the harness and not the
 * subject. `query.mjs` is the exception and says so in its own header: it is
 * deliberately pure and holds no database handle, so it runs in node and the
 * instrument measures the SUBJECT. DO NOT quote this technique as if it
 * extended to `store.mjs` or `index.mjs` — it does not.
 *
 * WHAT IT CANNOT SEE, so nobody has to rediscover it. V8 range coverage is
 * per-BLOCK, not per-CONDITION: `a && b` reports as entered whenever the block
 * runs, so an UNSATISFIABLE CONJUNCT inside an otherwise-entered block does not
 * appear. D-228's guard was found by READING; this instrument confirmed it and
 * could not have found it alone. A range this driver does not happen to reach
 * is also indistinguishable from an unreachable one without reading it, which
 * is why the reporter prints each range's SOURCE TEXT rather than a count.
 *
 * MEASURED 2026-08-08 (the table is in MEASUREMENTS.md): six passes took the
 * never-entered set 43 -> 11, and the residue is SIX genuinely unreachable
 * branches of which exactly ONE mattered — D-228's, now fixed. `tokenize` has
 * ZERO. The other five are belt-and-braces returns at points where the input
 * cannot arrive; none changes an answer and none is a promise to a reader.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { rmSync } from "node:fs";

const HERE = fileURLToPath(new URL("./", import.meta.url));
const COV = HERE + ".query-reach-cov/";
if (process.env.QUERY_REACH_CHILD !== "1") {
  rmSync(COV, { recursive: true, force: true });
  const self = fileURLToPath(import.meta.url);
  const child = spawnSync(process.execPath, [self], { stdio: "inherit",
    env: { ...process.env, QUERY_REACH_CHILD: "1", NODE_V8_COVERAGE: COV } });
  if (child.status !== 0) process.exit(child.status ?? 1);
  const rep = spawnSync(process.execPath, [HERE + "query-reach.report.mjs"], { stdio: "inherit" });
  rmSync(COV, { recursive: true, force: true });
  process.exit(rep.status ?? 0);
}

import { compile, FIELDS, MEANING, textOf, viewerPredicate,
         ambiguousBareWords, meaningVocabulary, SORTABLE, DEFAULT_FACETS } from "../src/query.mjs";

/* THE VIEWER IS A STRING. The first version of this driver passed the object
   shape the suites' fixtures use elsewhere, and `viewerPredicate` coerces a
   non-string to "" — so every one of 43,400 compilations ran against the DENY
   gate and the participant branch could not possibly have been entered. The
   harness was wrong before the subject was; recorded rather than smoothed. */
const viewers = ["class:member", "member:m-1", "admin", "class:admin", "class:probe",
                 "class:daemon", "class:ai", null, "", "nobody", undefined, 7];

const qs = [];
/* every field, every shape a value can take */
for (const [name, f] of Object.entries(FIELDS)) {
  qs.push(`${name}:x`, `${name}:"x"`, `${name}:`, `${name}:*`, `has:${name}`,
          `${name}:>1`, `${name}:<1`, `${name}:>=1`, `${name}:<=1`, `${name}:1..2`,
          `${name}:X*`, `sort:${name}`, `sort:-${name}`, `sort:${name}:desc`, `sort:${name}:asc`);
}
for (const name of Object.keys(MEANING)) {
  qs.push(`${name}:hunch`, `${name}:"hunch"`, `${name}:`, `${name}:*`, `has:${name}`,
          `${name}:role=cuts_against`, `${name}:ground=*`, `${name}:>=B`, `${name}:<=B`,
          `${name}:nosuchsub=1`, `${name}:capture`, `${name}:A`);
}
qs.push(
  /* the tokenizer's own surface */
  "", " ", "\t\n\r", "(", ")", "()", "(a", "a)", "(a OR b)", "a AND b", "a OR b", "NOT a",
  "-a", "-", "- ", "a -b", "--a", "a-b",
  '"two words"', '"two words" AND x', '"unclosed', 'x "unclosed',
  "AND", "OR", "NOT", "and", "or", "not", "aNd",
  "a b c", "a  b", "x*", "*", "**", "-*",
  /* selectors */
  'state:"open"', "state:open", 'title:"two words"', "title:two words",
  "has:nosuchfield", "nosuchfield:v", 'nosuchfield:"v"',
  "text:sewer", 'text:"two words"', "text:", "text:*",
  "fm:a.b=c", 'fm:a.b="c"', 'fm:"a.b"=c', 'fm:"a.b"="c"', "fm:a.b", "fm:not a path!=1", "fm:",
  'state:"a"b', 'title:"a" b', 'title:"a"(b)',
  "sort:", "sort::", "-sort:", "sort:nosuch", "sort:relevance", "sort:-relevance", "sort:relevance:d",
  "type:problem", "type:focus", "monitored:yes", "monitored:no", "monitored:maybe",
  "legs:notanumber", "created:notatime",
  ":", "::", "a:", ":b", "a::b", "a:b:c",
  /* punctuation-only atoms */
  "---", "!!!", "[]", "&&",
  /* mixed text + metadata, which is the only way past the pure-text short
     circuit at setSql's head and therefore the only way into the set algebra */
  "a -state:open", "state:open -type:x", "-state:open -type:x", "-a -b",
  "state:open -a", "a AND state:open", "a OR state:open",
  "state:a state:b state:c state:d state:e state:f -type:x",
  /* exactly five and exactly nine arms: the regrouping leaves a group of ONE,
     which is the only way into chain()'s non-compound regroup tail */
  "state:a state:b state:c state:d state:e",
  "state:a OR state:b OR state:c OR state:d OR state:e",
  "state:a state:b state:c state:d state:e state:f state:g state:h state:i",
  "state:a -type:x -type:y -type:z -type:w -type:v",
  /* the parser's own corners */
  "-)", "-AND x", "-OR x", "(sort:relevance)", "(sort:relevance) a", "( )",
  "state:open AND (b OR sort:relevance)",
  /* deep nesting for MAX_COMPOUND */
  "(a OR b) AND (c OR d) AND (e OR f) AND (g OR h) AND (i OR j) AND (k OR l)",
  Array.from({ length: 40 }, (_, i) => `state:s${i}`).join(" OR "),
);

let n = 0;
qs.push(null, undefined);
for (const q of qs) {
  for (const v of viewers) {
    for (const implicitOp of ["and", "or"]) {
      for (const rows of [null, "leg", "resolves", "concerns", "nosuch"]) {
        try {
          const c = compile({ q, viewer: v, implicitOp, rows,
            ids: n % 7 === 0 ? ["B-1", "B-2"] : null,
            facets: n % 5 === 0 ? DEFAULT_FACETS : n % 5 === 1 ? ["nosuchfacet"] : n % 5 === 2 ? [] : null,
            sort: n % 3 === 0 ? "created" : n % 3 === 1 ? "relevance" : null,
            dir: n % 4 === 0 ? "asc" : n % 4 === 1 ? "desc" : n % 4 === 2 ? "" : null,
            limit: n % 11 === 0 ? 100000 : n % 11 === 1 ? 0 : n % 11 === 2 ? NaN : 50, offset: n % 13,
            rowLimit: n % 17 === 0 ? 100000 : n % 17 === 1 ? 0 : 200, rowOffset: n % 19,
            snippetChars: n % 23 === 0 ? 1000 : 12 });
          for (const k of Object.keys(c.statements || {})) {
            try { c.statements[k](); } catch {}
            /* the meaning shape takes a MODE, and a statement called with no
               argument only ever drives its default — the count arm sat
               unentered until this line existed */
            try { c.statements[k]({ mode: "count" }); } catch {}
          }
          n++;
        } catch { /* a throw is a measurement too */ }
      }
    }
  }
}
/* the non-compiler exports, so their branches are driven too */
for (const v of viewers) { try { viewerPredicate(v); } catch {} }
textOf("B-1", [{ path: "bundle.md", text: "---\ntitle: T\n---\nprose", inline: true }]);
textOf("B-1", []);
textOf("B-1", null);
textOf("B-1", [{ path: "d.json", text: "{}", inline: true }, { path: "x.txt", text: "t", inline: true },
               { path: "big.md", text: "z".repeat(200000), inline: true }, { path: "n.pdf", text: "", inline: false }]);
/* the shapes the first pass never built, each one aimed at a named range */
textOf("B-1", [{ path: "bundle.md", content: "---\ntitle: T\n---\nbody" }]);          // 522 `content` fallback
textOf("B-1", [{ path: "bundle.md", text: "---\n\ttitle: [unclosed\n---\nx" }]);      // 527 the parse throw
textOf("B-1", [{ path: "bundle.md", text: "no frontmatter at all" }]);               // 528/529 no data, no body
textOf("B-1", [{ path: "bundle.md", text: "---\ntags:\n  - a\n  - b\n---\nx" }]);     // 534 an array in frontmatter
textOf("B-1", [{ path: "bundle.md", text: "x" }, { path: "b.md", text: "1" },
               { path: "a.md", text: "2" }, { path: "a.md", text: "3" }]);           // 541 both sort legs incl. equal
textOf("B-1", [{ path: "bundle.md", text: "---\ntitle: T\nsource: null\n---\nx" }]);  // 545 nested null
textOf("B-1", [{ path: "bundle.md", text: "---\nsource:\n  - a\n---\nx" }]);          // 545 nested array
textOf("B-1", [{ path: "bundle.md", text: "---\nsource: plain\n---\nx" }]);           // 545 nested scalar
textOf("B-1", [{ path: "bundle.md", text: "---\nsource:\n  locator: L\n---\nx" }]);   // 545 the taken leg
textOf("B-1", [{ path: "bundle.md", text: null }]);                                  // 542 cap(null)
textOf("B-1", [{ path: "bundle.md" }]);
ambiguousBareWords(); meaningVocabulary();

console.log(`driven: ${n} compile() calls over ${qs.length} query strings · ${Object.keys(SORTABLE).length} sortable keys`);
