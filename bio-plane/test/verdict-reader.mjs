/* THE VERDICT READER — REC-76's, AND THIS FILE IS ITS ONE HOME (D-240; single-homed by D-254).
 * ============================================================================
 *
 * REC-76 closed D-236 by INVERTING the DEC-49 guard's arm C: instead of matching
 * one spelling of "this is a refusal", it takes the object literal an answer is
 * built from and reads its VERDICT — **the FIRST BOOLEAN-SHAPED top-level
 * property** — then grades by whether the outcome DECLARES ITSELF A SUCCESS.
 * The half that goes stale is the FIELD NAME (`ok`, `started`, `found`,
 * `proposed`, `preview` are five in this plane today and there will be a sixth);
 * the half that does not is JavaScript's own set of boolean-producing operators.
 *
 * THREE INSTRUMENTS READ VERDICTS THROUGH THIS ONE FILE, AND ALL THREE IMPORT IT:
 *   - `civicos-ui/check-refusal-codes.mjs` — the DEC-49 guard's arm C (REC-76);
 *   - `meaning-bounds.test.mjs`'s `declaresRefusal` — the EXCLUDER that decides
 *     which returns a bounds walk has no business grading (D-240);
 *   - `plane-envelope.test.mjs`'s DETECTOR A gate — which `json()` answers can
 *     report a success to a caller (D-240).
 *
 * **ONE MECHANISM AND NOT THREE.** A verdict reader copied into a second
 * instrument is a second thing that can go dark differently, and "the next
 * component goes dark differently" is the failure D-236, D-233, REC-70 and D-240
 * are all one instance of.
 *
 * WHY THE GUARD IMPORTS FROM HERE, AND NOT THE REVERSE (D-254, 2026-09-21).
 * From D-240 (2026-08-08) until D-254 this file held a COPY of the guard's
 * functions, pinned byte-identical by a drift pin, because the guard is a SCRIPT
 * with no exports whose work runs at the top level and ends in `process.exit` —
 * importing it would run the whole DEC-49 guard as a side effect of loading a
 * test. D-254 inverted the dependency instead of changing the guard's shape:
 * this file has NO side effects, so the GUARD imports the reader from here and
 * its own copy was deleted. **Never the reverse** (D-240's delegation, and the
 * reason is the same hazard pointing the other way): a plane suite importing the
 * guard would run the guard at import. `origin/worktree-agent-a61e489de171ae6c5`
 * built the reverse (the guard made importable) in August; it was read as
 * evidence and not taken.
 *
 * SO A CHANGE HERE CHANGES THREE INSTRUMENTS AT ONCE — that is the point of one
 * home, not a hazard of it. After any edit below run the UI harness (it runs the
 * guard), `meaning-bounds.test.mjs` and `plane-envelope.test.mjs`. The READINGS
 * at the foot of this file pin what each function answers, so a change in what
 * the reader ANSWERS fails both plane suites NAMING the function until its
 * reading is deliberately updated in the same turn.
 *
 * ---------------------------------------------------------------------------
 * WHAT A VERDICT IS, AND WHAT EACH INSTRUMENT MAY DO WITH IT.
 *
 * `verdictOf(objText)` — `objText` MUST begin at the object's own `{` — answers
 * one of four things, and the fourth is first-class:
 *
 *   { kind: "true"  }   the outcome DECLARES ITSELF A SUCCESS.
 *   { kind: "false" }   the outcome DECLARES ITSELF A REFUSAL.
 *   { kind: "expr"  }   the verdict is COMPUTED (`!x`, `Boolean(x)`, `a === b`).
 *                       **It is neither declaration — it is decided at runtime.**
 *   null                NO boolean-shaped property at all. UNCLASSIFIED, and it
 *                       must be NAMED by its reader, never silently scored zero.
 *
 * **THE `expr` KIND IS WHERE THE INSTRUMENTS DIFFER, AND THAT IS A POLICY AND
 * NOT A SECOND MECHANISM.** REC-76's guard asks *does this refusal owe a code*,
 * so it treats a computed verdict as a refusal — the safe direction when the cost
 * of being wrong is an unjudged refusal. `plane-envelope`'s detector A asks *can
 * this answer report a SUCCESS to a caller*, and a computed verdict CAN evaluate
 * true, so it must be graded — the safe direction there is the opposite one.
 * `meaning-bounds`' excluder takes a DECLARED refusal only, because a comparison
 * is how this plane spells a cursor and a truncation flag (D-240 measured it).
 * Same reading, different consequence, and each site says which it takes and
 * why. What is NOT allowed is a second reader that computes the verdict
 * differently; that is what the IMPORT PIN at the foot of this file refuses.
 *
 * WHAT THIS READER CANNOT SEE, carried over from REC-76 rather than re-learned:
 *   - an outcome built into a VARIABLE and returned later (it reads literals);
 *   - a NEGATIVE-POLARITY verdict (`failed: true`), which reads as a success by
 *     construction. Each instrument states its own cross-check for that.
 *   - a verdict below the top level of the object.
 *   - A COMPARISON SPELLED `<=` OR `>=` (and `instanceof`, `in`). `verdictKind`
 *     reads `n >= cap` as NOT boolean-shaped although the language guarantees a
 *     boolean: the rule above says "boolean-producing operators" and the code
 *     implements `==`, `!=`, `===`, `!==`, `<` and `>`. MEASURED 2026-09-21 by
 *     D-254 over every return-position outcome in `bio-plane/src` (1,798): 6
 *     properties, 3 of which would change which property is the verdict. And
 *     the same `<`/`>` branch reads the numeric SHIFTS (`a >> 2`) AS boolean —
 *     the error in the other direction. D-437 carries the fix; it is NOT made
 *     here, because it moves figures in all three instruments and is its own
 *     measured change.
 */
import path from "node:path";

const CLOSE_COMMENT = "*" + "/";

/* ---------------------------------------------------------------------------
 * THE READER. Every function from here down to THE PIN is REC-76's, MOVED here
 * by D-254 from `civicos-ui/check-refusal-codes.mjs` WITH THE GUARD'S OWN
 * COMMENTS, so the one home carries the reasoning as well as the code. The
 * BODIES are byte-identical to both copies they replace — measured at the move,
 * function by function — and nothing below is held byte-identical to anything
 * any more: edit it like any other code, then run the three instruments.
 * ------------------------------------------------------------------------ */

/* ---------------------------------------------------------------------------
 * THE OUTCOME WALK (REC-76 / D-236) — three small readers, and every one of
 * them is about SHAPE rather than about a field name.
 *
 * `outcomeReturns`  — the CORPUS: every object literal in RETURN POSITION.
 * `topLevelProps`   — its depth-0 `key: value` pairs, strings and comments skipped.
 * `verdictOf`       — the FIRST boolean-shaped one, which is the verdict.
 * ------------------------------------------------------------------------ */

/* Skip a quoted string starting at `i`; returns the index of its closing quote. */
function skipString(text, i) {
  const q = text[i];
  for (let j = i + 1; j < text.length; j++) {
    if (text[j] === "\\") { j++; continue; }
    if (text[j] === q) return j;
  }
  return text.length - 1;
}

/* The `}` matching the `{` at `open`, with strings and block comments skipped —
 * a brace inside a comment or a sentence is not a brace. */
function matchBrace(text, open) {
  let d = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === "`") { i = skipString(text, i); continue; }
    if (c === "/" && text[i + 1] === "*") { const j = text.indexOf(CLOSE_COMMENT, i + 2); i = j < 0 ? text.length : j + 1; continue; }
    if (c === "{") d++;
    else if (c === "}") { d--; if (!d) return i; }
  }
  return -1;
}

/* RETURN POSITION, and the three forms the plane actually writes:
 *   return { … }                  — including `return (\n  { … })`
 *   return cond ? { … } : { … }   — both branches are outcomes
 *   return WRAPPER({ … }, 403)    — the outcome handed to a TRANSPORT
 *
 * THE THIRD FORM IS REC-79's, AND ITS ABSENCE WAS A BLIND SPOT THE SIZE OF THE
 * CONTROL PLANE. `bio-plane/src/index.mjs` answers every caller with
 * `return json({ ok: false, … }, 403)` — 77 refusals in that one shape,
 * MEASURED — and this reader stopped at the `j` of `json`, because the scan
 * below admitted only whitespace, `(` and `{` before breaking. So arm C could
 * not see a single refusal in the control plane, and no `where` could ever have
 * governed one: a region placed over the admission gate would have resolved,
 * been well-formed, been correctly nested, and reported `0 judged` — which is
 * the WRONG SPAN failure the guard's own region rules exist to catch, arriving
 * through the reader instead of through the markers. It was found the way this
 * project keeps finding these: by trying to govern a real site and watching the
 * instrument report nothing to govern.
 *
 * THE RULE INVERTS RATHER THAN NAMING `json` (REC-70's lesson, and D-236's).
 * A wrapper in return position is a TRANSPORT, not a consumer: whatever object
 * it is handed is still the outcome the function hands back. So the rule is
 * positional — **the FIRST ARGUMENT of a call in return position, when that
 * argument is an object literal** — and it holds for `json(…)`, for
 * `Response.json(…)`, for `new Response(…)` and for the fourth wrapper nobody
 * has written yet. Naming `json` would have gone stale the moment a second
 * transport was written, which is exactly how a list of spellings fails.
 *
 * AND IT DOES NOT WIDEN THE DETAIL-OBJECT EXCLUSION BELOW, which is the
 * over-strictness this reader was measured into. `refusal("CODE", detail, { … })`
 * is untouched because its first argument is a STRING, not an object literal;
 * only argument ONE is ever read, so a detail object in argument two or three
 * stays outside the corpus exactly as before. MEASURED: widening this reader
 * moved the unclassified count not at all and added no site to the existing 67.
 *
 * An object literal handed to a HELPER (`refusal("CODE", detail, { … })`) is an
 * ARGUMENT and not an outcome; it is deliberately outside this corpus, because
 * grading detail objects is exactly the over-strictness that would flood the
 * guard with false sites. The helper's own call is judged separately, by the
 * guard's arm C.
 * MEASURED before that decision: taking every object literal in the span instead
 * graded FIVE detail objects at real governed sites as refusals.
 *
 * THE BOUNDS ARE THE OBJECT'S OWN BRACES, and the receipt is kept from the
 * `objectLiteralAround` reader this replaced — which itself replaced a FIXED
 * 400-CHARACTER WINDOW that failed in the GENEROUS direction: a codeless refusal
 * followed within 400 characters by a properly coded one read as coded, because
 * the window ran past the end of its own statement and found the NEXT refusal's
 * code. Arm 3 of `civicos-ui/test/refusal-codes.test.mjs` is that fixture and it was
 * RED on the first run of the guard's own suite. */
function outcomeReturns(text) {
  const out = [];
  const seen = new Set();
  const push = (s, e) => { if (e > s && !seen.has(s)) { seen.add(s); out.push([s, e]); } };
  for (const m of text.matchAll(/\breturn\b/g)) {
    /* the direct form: only whitespace and opening parens may sit in front.
       `lead` is how many of those parens there were, and it is what the
       conditional reader below measures its own depth against. */
    let lead = 0;
    for (let i = m.index + 6; i < text.length; i++) {
      const c = text[i];
      if (/\s/.test(c)) continue;
      if (c === "(") { lead++; continue; }
      if (c === "{") { const e = matchBrace(text, i); if (e > 0) push(i, e); }
      else {
        /* THE WRAPPED FORM (REC-79) — see the header. A call in return position
           is a transport; its FIRST argument, and only its first, is the
           outcome. Anchored at `i` so it cannot drift past the call it read. */
        const w = /^(?:new\s+)?[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\s*\(\s*/.exec(text.slice(i, i + 120));
        if (w) {
          const argAt = i + w[0].length;
          if (text[argAt] === "{") { const e = matchBrace(text, argAt); if (e > 0) push(argAt, e); }
        }
      }
      break;
    }
    /* the conditional form: `return cond ? { … } : { … }` — both branches are
       outcomes. THE DEPTH TEST IS LOAD-BEARING and was added after measuring
       what its absence cost: without it, a `pair ? { … } : null` sitting inside
       a DETAIL ARGUMENT four calls deep was read as a returned branch and
       reported as an outcome the walk could not classify. A branch of the
       returned expression sits at the return's OWN depth and nowhere else. */
    const seg = text.slice(m.index, Math.min(text.length, m.index + 6000));
    if (!/^return\s*[^;{]{0,240}\?/.test(seg)) continue;
    let d = 0;
    for (let k = 6; k < seg.length; k++) {
      const c = seg[k];
      if (c === '"' || c === "'" || c === "`") { k = skipString(seg, k); continue; }
      if (c === "(" || c === "[") { d++; continue; }
      if (c === ")" || c === "]") { d--; continue; }
      if (c === ";" && d <= lead) break;
      if (c === "{" && d === lead && /[?:]\s*$/.test(seg.slice(Math.max(0, k - 40), k))) {
        const e = matchBrace(seg, k);
        if (e > 0) { push(m.index + k, m.index + e); k = e; }
      }
    }
  }
  return out.sort((a, b) => a[0] - b[0]);
}

/* The depth-0 PARTS of an object literal — split out of `topLevelProps` by
 * REC-79 so `topLevelSpreads` reads the same split. Strings, block comments
 * and line comments are skipped, so a `,` or a `:` inside a member-facing
 * sentence — and this plane's refusals are full of them — does not split a
 * property. */
function topLevelParts(objText) {
  const parts = [];
  let buf = "", depth = 0;
  for (let i = 1; i < objText.length - 1; i++) {
    const c = objText[i];
    if (c === '"' || c === "'" || c === "`") { const j = skipString(objText, i); buf += objText.slice(i, j + 1); i = j; continue; }
    if (c === "/" && objText[i + 1] === "*") { const j = objText.indexOf(CLOSE_COMMENT, i + 2); i = j < 0 ? objText.length : j + 1; continue; }
    if (c === "/" && objText[i + 1] === "/") { const j = objText.indexOf("\n", i); i = j < 0 ? objText.length : j; continue; }
    if (c === "{" || c === "[" || c === "(") depth++;
    else if (c === "}" || c === "]" || c === ")") depth--;
    if (c === "," && depth === 0) { parts.push(buf); buf = ""; continue; }
    buf += c;
  }
  parts.push(buf);
  return parts;
}

/* The depth-0 `key: value` pairs of an object literal. */
function topLevelProps(objText) {
  const props = [];
  for (const p of topLevelParts(objText)) {
    const m = /^\s*([A-Za-z_$][\w$]*)\s*:([\s\S]*)$/.exec(p);
    if (m) props.push({ key: m[1], value: m[2] });
  }
  return props;
}

/* THE SPREAD SOURCES of an object literal — `{ ...promoted, code: … }` (REC-79).
 *
 * WHY THIS IS A CATEGORY AND NOT A KIND OF "UNCLASSIFIED", and the distinction
 * is this item's whole thesis applied to its own instrument. `unclassified`
 * means THE WALK DOES NOT UNDERSTAND THIS SHAPE — a new spelling, a new place a
 * codeless refusal could hide, and rightly a ceiling that may only fall. An
 * outcome that spreads a value is a shape the walk understands PERFECTLY: its
 * verdict is INHERITED from a value that does not exist until run time. Those
 * are two different facts about the walk and lumping them together makes the
 * ceiling mean two things at once — which is exactly what this item found the
 * census doing to 248 codes.
 *
 * SO THEY ARE SEPARATED, and separating them LOWERED the unclassified ceiling
 * from 3 to 1 rather than raising anything: three of the four were spreads.
 *
 * AND THEY ARE DELIBERATELY NOT SUBJECTED TO THE CODELESS TEST. `#moveVersionState`
 * returns `{ ...promoted, act, target, version }` — promote's own refusal, code
 * and all, handed back unwrapped and on purpose, because re-stating promote's
 * rules there is the second implementation §14b.4 forbids. Demanding a LITERAL
 * code on top of an inherited one would be a fence tighter than its rule: it
 * would force a second copy of the very code the spread already carries. What
 * they get instead is to be NAMED and COUNTED every run, so a spread that starts
 * hiding a refusal nobody coded is visible rather than absent. */
function topLevelSpreads(objText) {
  const out = [];
  for (const p of topLevelParts(objText)) {
    const m = /^\s*\.\.\.\s*([A-Za-z_$][\w$]*)/.exec(p);
    if (m) out.push(m[1]);
  }
  return out;
}

/* IS THIS VALUE BOOLEAN-SHAPED? The two literals, or an expression whose DEPTH-0
 * operator is one the LANGUAGE guarantees produces a boolean. That distinction is
 * the whole reason this is not a list that goes stale: `ok`, `started`, `found`,
 * `proposed`, `preview` are five field names in this plane and there will be a
 * sixth next week, but the set of boolean-producing operators is fixed by
 * JavaScript's grammar and cannot grow when somebody writes a new refusal.
 * `=>` is excluded explicitly — an arrow is not a comparison, and reading one as
 * a verdict is how the first draft of this walk graded five detail objects.
 * **THE CODE IMPLEMENTS SIX OF THOSE OPERATORS, NOT ALL OF THEM:** `<=`, `>=`,
 * `instanceof` and `in` read as NOT boolean-shaped, and the shifts `<<`, `>>`,
 * `>>>` read AS boolean (D-437, measured in this file's header — the fix is
 * named there and not made here). */
function verdictKind(value) {
  const s = value.trim();
  if (s === "true") return "true";
  if (s === "false") return "false";
  if (/^!/.test(s)) return "expr";
  if (/^Boolean\s*\(/.test(s)) return "expr";
  let d = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"' || c === "'" || c === "`") { i = skipString(s, i); continue; }
    if (c === "(" || c === "[" || c === "{") { d++; continue; }
    if (c === ")" || c === "]" || c === "}") { d--; continue; }
    if (d) continue;
    if (c === "=" && s[i + 1] === ">") { i++; continue; }
    if ((c === "=" || c === "!") && s[i + 1] === "=") return "expr";
    if ((c === "<" || c === ">") && s[i - 1] !== "=" && s[i + 1] !== "=") return "expr";
  }
  return null;
}

/* THE VERDICT IS THE FIRST BOOLEAN-SHAPED TOP-LEVEL PROPERTY, and that ordering
 * is load-bearing rather than incidental: `{ ok: false, terminal: true }` is a
 * refusal carrying a datum, and reading ANY `true` as a success would have
 * un-judged seven of `#captureRequestConduct`'s refusals that the old one-literal
 * matcher did judge. Measured over all 60 governed sites when this landed: no
 * outcome leads with a datum. **THAT IS A PROPERTY OF THE GOVERNED-SITE CORPUS
 * AND NOT OF THE PLANE** (D-240, measured over `store.mjs`'s 843 returns): two
 * SUCCESS returns lead with a boolean DATUM (`#sessionRights` `rootOfTrust:
 * false`, `#conditionHomes` `ungrouped: false`), pinned by name in
 * `meaning-bounds.test.mjs`. An instrument that reads beyond governed sites
 * meets them. */
function verdictOf(objText) {
  for (const p of topLevelProps(objText)) {
    const kind = verdictKind(p.value);
    if (kind) return { key: p.key, kind };
  }
  return null;
}

/* ---------------------------------------------------------------------------
 * THE PIN — ONE HOME, ONE BEHAVIOUR. D-240's drift pin, re-derived by D-254.
 *
 * WHAT IT WAS. Two copies of the eight functions — one here, one in the guard —
 * and `readerDrift()` extracted both and compared them byte for byte. Its arm (3)
 * put ONE CHARACTER of drift inside `verdictKind` in one copy, and both plane
 * suites failed naming the function.
 *
 * WHY IT COULD NOT STAY AS IT WAS. There is one copy now. Comparing it with
 * itself is an equality that costs nothing to produce — it agrees over any
 * reader, an empty one included — so keeping that comparison would be deleting
 * the pin and leaving its name on the door, which is the one way D-254's row
 * says a liar passes it.
 *
 * WHAT IT BECAME. "One mechanism" was always two claims, and each is a half:
 *
 *   (1) ONE HOME. The DEC-49 guard IMPORTS every name in SHARED_FNS from this
 *       file and DECLARES NONE OF THEM ITSELF, at any depth. Drift now needs a
 *       second copy, and the one place a copy can grow back is the guard — a
 *       merge of a pre-D-254 branch, a revert, a local "fix". Binding all eight
 *       names also turns a same-name copy BESIDE the import into a LOAD error (a
 *       duplicate declaration), so the stale-merge shape cannot even run; a copy
 *       that drops its name from the import to get past that is exactly what
 *       this half names. Arm (3) of `verdict-excluder.control.mjs` is that copy,
 *       with one character of drift inside `verdictKind`.
 *
 *   (2) ONE BEHAVIOUR. The READINGS below: what each function answers for inputs
 *       that exercise its own documented rules. THE OLD PIN NEVER PINNED
 *       BEHAVIOUR — it failed when ONE copy moved, and it passed REC-79's
 *       widening, made to both copies in the same turn, by design. With one
 *       copy, "one character inside `verdictKind`" can only mean a change to the
 *       reader all three instruments read, and a reading is what makes that
 *       change fail NAMING the function instead of passing through every
 *       instrument whose own corpus never exercises the changed branch. That
 *       last clause is measured, not argued: no property anywhere in
 *       `bio-plane/src` is spelled `Boolean(…)`, so D-240's own arm-(3) edit,
 *       applied to this file, moves no figure in the guard or in meaning-bounds
 *       — arm (3c) of `verdict-excluder.control.mjs` records what it does.
 *
 * BOTH HALVES ARE COUNTED AND FLOORED, so an empty reader, an import that binds
 * nothing and an emptied readings table cannot agree for free (`e3b0c442…`).
 * ------------------------------------------------------------------------ */

/* The list is what makes "shared" a fact. REC-79 grew it by two IN THE SAME TURN
   as it grew the reader; a function added to the reader and not to this list is
   one the pin has quietly stopped checking, and one added here with no READING
   is named by `unread` below. */
const SHARED_FNS = ["skipString", "matchBrace", "outcomeReturns", "topLevelParts", "topLevelProps",
                    "topLevelSpreads", "verdictKind", "verdictOf"];
/* A FLOOR on what the one home's extraction reads — not a target. It may rise
   when the reader grows, and it exists so an emptied or collapsed reader cannot
   pass. The eight bodies measured 5,208 chars at D-254, unchanged by the move. */
const DRIFT_MIN_CHARS = 4000;
/* Where the guard lives and where this file lives, so the guard's import
   specifier is RESOLVED rather than pattern-matched. */
const GUARD_HOME = "civicos-ui";
const READER_PATH = "bio-plane/test/verdict-reader.mjs";

/* A top-level declaration, from `\nfunction NAME(` to the next `\n}` in column
   zero — the dumbest extractor that cannot be wrong about a brace inside a
   string. A MISSING function answers null and is counted, never skipped. */
function fnSource(src, name) {
  const i = src.indexOf(`\nfunction ${name}(`);
  if (i < 0) return null;
  const j = src.indexOf("\n}\n", i);
  return j < 0 ? null : src.slice(i + 1, j + 3);
}

/* THE GUARD'S IMPORT OF THIS FILE, read from its source. An import statement
   begins at column zero — the rule `fnSource` uses for a declaration — so an
   import QUOTED in a comment or a string is never read as the real thing, and a
   clause may hold no quote and no semicolon, so one statement cannot swallow the
   next. The specifier is RESOLVED from the guard's own directory and must name
   READER_PATH. A name counts by what it IMPORTS (`verdictOf as v` imports
   `verdictOf`); a namespace import binds every export.
   WHAT IT CANNOT SEE, and every one reads as NOT IMPORTED, which is the loud
   direction: a dynamic `import()`, a statement not beginning in column zero, and
   a comment inside the braces (the name after it is not read). */
function readerImports(guardSrc) {
  const names = new Set();
  let statements = 0;
  for (const m of guardSrc.matchAll(/^import\s+([^;"'`]*?)\s*\bfrom\s*(["'])([^"'\n]+)\2/gm)) {
    if (!m[3].startsWith(".")) continue;
    if (path.posix.normalize(path.posix.join(GUARD_HOME, m[3])) !== READER_PATH) continue;
    statements++;
    const clause = m[1].trim();
    if (/^\*\s*as\s+[A-Za-z_$][\w$]*$/.test(clause)) { for (const n of SHARED_FNS) names.add(n); continue; }
    const braces = /^\{([\s\S]*)\}$/.exec(clause);
    if (!braces) continue;
    for (const part of braces[1].split(",")) {
      const p = /^\s*([A-Za-z_$][\w$]*)(?:\s+as\s+[A-Za-z_$][\w$]*)?\s*$/.exec(part);
      if (p) names.add(p[1]);
    }
  }
  return { names, statements };
}

/* A DECLARATION OF THE NAME ANYWHERE IN THE GUARD — top-level or nested,
   `function NAME(` or `const|let|var NAME =`. A nested one would SHADOW the
   import where it sits: a second reader in use that no top-level extractor sees.
   CANNOT SEE: a destructured or parameter binding of the name. */
function declares(src, name) {
  return new RegExp(`\\bfunction\\s*\\*?\\s*${name}\\s*\\(|\\b(?:const|let|var)\\s+${name}\\s*=`).test(src);
}

/* THE READINGS — each one a documented rule of the function it names, in the
   words of that function's own comment above. A reading is NOT a place to pin a
   blind spot as correct: `verdictKind("n >= cap")` is deliberately ABSENT
   (D-437). Comment tokens are BUILT, never written, for the reason
   CLOSE_COMMENT is. */
const OPEN_COMMENT = "/" + "*";
const LINE_COMMENT = "/" + "/";
const slices = (t) => outcomeReturns(t).map(([s, e]) => t.slice(s, e + 1));
const READINGS = [
  /* an escaped quote does not close a string */
  ["skipString", () => skipString('"a\\"b" + c', 0), 5],
  /* a brace inside a string or a block comment is not a brace; unbalanced answers -1 */
  ["matchBrace", () => matchBrace(`{ a: "}", ${OPEN_COMMENT} } ${CLOSE_COMMENT} b: { c: 1 } } tail`, 0), 30],
  ["matchBrace", () => matchBrace("{ a: 1", 0), -1],
  /* RETURN POSITION: every direct return, a parenthesised one, BOTH branches of a
     conditional, REC-79's WRAPPED form — and NOT a helper's detail argument, NOT
     a branch four calls deep, NOT a word that merely begins with `return` */
  ["outcomeReturns", () => slices('function f(x) { if (!x) return { ok: false, code: "A" }; return { ok: true }; }'),
    ['{ ok: false, code: "A" }', "{ ok: true }"]],
  ["outcomeReturns", () => slices("return (\n  { ok: true, n });"), ["{ ok: true, n }"]],
  ["outcomeReturns", () => slices('return x ? { ok: true } : { ok: false, code: "B" };'),
    ["{ ok: true }", '{ ok: false, code: "B" }']],
  ["outcomeReturns", () => slices('return json({ ok: false, code: "C" }, 403);'), ['{ ok: false, code: "C" }']],
  ["outcomeReturns", () => slices('return refusal("D", detail, { at });'), []],
  ["outcomeReturns", () => slices("return f(g(pair ? { a: 1 } : null)); const returned = { ok: true };"), []],
  /* the depth-0 split: a line comment skipped, a string and an array kept whole */
  ["topLevelParts", () => topLevelParts(`{ a: 1, ${LINE_COMMENT} x, y\n b: "p, q", c: [1, 2] }`),
    [" a: 1", '  b: "p, q"', " c: [1, 2] "]],
  /* depth-0 `key: value` pairs only: not a nested key, not a shorthand, not a key inside a comment */
  ["topLevelProps", () => topLevelProps('{ a: 1, b: { c: true }, d: [1, 2], e: "x, y: z", f }').map((p) => p.key),
    ["a", "b", "d", "e"]],
  ["topLevelProps", () => topLevelProps(`{ ${OPEN_COMMENT} ok: true, ${CLOSE_COMMENT} found: false }`).map((p) => p.key),
    ["found"]],
  /* the spread SOURCES, at the top level only */
  ["topLevelSpreads", () => topLevelSpreads('{ ...promoted, act, code: "X", ...rest }'), ["promoted", "rest"]],
  ["topLevelSpreads", () => topLevelSpreads("{ ok: false, detail: { ...inner } }"), []],
  /* the two literals, and every DEPTH-0 operator the language guarantees is
     boolean that this reader implements — and NOT an arrow, NOT an operator below
     depth 0, NOT one inside a string, NOT a bare value */
  ["verdictKind", () => verdictKind("true"), "true"],
  ["verdictKind", () => verdictKind(" false "), "false"],
  ["verdictKind", () => verdictKind("!stopped"), "expr"],
  ["verdictKind", () => verdictKind("Boolean(r.result)"), "expr"],
  ["verdictKind", () => verdictKind("a === b"), "expr"],
  ["verdictKind", () => verdictKind("a !== b"), "expr"],
  ["verdictKind", () => verdictKind("rows.length > cap"), "expr"],
  ["verdictKind", () => verdictKind("n < 0"), "expr"],
  ["verdictKind", () => verdictKind("(x) => x.ok"), null],
  ["verdictKind", () => verdictKind("f(a === b)"), null],
  ["verdictKind", () => verdictKind('"a === b"'), null],
  ["verdictKind", () => verdictKind("rows"), null],
  /* the FIRST boolean-shaped top-level property, in ANY field name; none is null */
  ["verdictOf", () => verdictOf("{ ok: false, terminal: true }"), { key: "ok", kind: "false" }],
  ["verdictOf", () => verdictOf("{ run, started: true }"), { key: "started", kind: "true" }],
  ["verdictOf", () => verdictOf('{ reason: "NO_SUCH_RUN", detail: "a: b, c" }'), null],
  ["verdictOf", () => verdictOf('{ ok: !stopped, code: "SET_MOVED" }'), { key: "ok", kind: "expr" }],
  ["verdictOf", () => verdictOf(`{ ${OPEN_COMMENT} ok: true, ${CLOSE_COMMENT} found: false }`), { key: "found", kind: "false" }],
];
/* THE READINGS FLOOR — the count at D-254. A reading deleted to make a changed
   reader pass is the liar's pass one level down, so the table may grow and never
   shrink without its reason at this site. */
const READINGS_MIN = 31;

/* THE PIN. `differing` names every shared function that is NOT single-homed —
   missing from this file, not imported by the guard, or declared by the guard
   itself; `misread` names every function whose READING no longer holds; `unread`
   every shared function with no reading at all. All three empty, with every
   count at its floor, is the pin green. A reading that THROWS is a misreading,
   never a skip — a TypeError inside a check goes through no check at all. */
function readerDrift(guardSrc, readerSrc) {
  const { names, statements } = readerImports(guardSrc);
  const differing = [], missing = [], notImported = [], localCopies = [];
  let chars = 0, read = 0, imported = 0;
  for (const name of SHARED_FNS) {
    const home = fnSource(readerSrc, name);
    if (home) { chars += home.length; read++; } else missing.push(name);
    const bound = names.has(name);
    if (bound) imported++; else notImported.push(name);
    const local = declares(guardSrc, name);
    if (local) localCopies.push(name);
    if (!home || !bound || local) differing.push(name);
  }
  const misread = [];
  let held = 0;
  for (const [name, reading, want] of READINGS) {
    let got;
    try { got = reading(); } catch (e) { got = `THREW ${e && e.message}`; }
    if (JSON.stringify(got) === JSON.stringify(want)) held++;
    else if (!misread.includes(name)) misread.push(name);
  }
  const unread = SHARED_FNS.filter((n) => !READINGS.some(([name]) => name === n));
  return { differing, missing, notImported, localCopies, statements, chars, read, imported,
           misread, unread, readings: READINGS.length, held, minReadings: READINGS_MIN,
           expected: SHARED_FNS.length, minChars: DRIFT_MIN_CHARS };
}

export { skipString, matchBrace, outcomeReturns, topLevelParts, topLevelProps, topLevelSpreads,
         verdictKind, verdictOf, readerDrift, readerImports, fnSource, SHARED_FNS, DRIFT_MIN_CHARS,
         READINGS_MIN, READER_PATH };
