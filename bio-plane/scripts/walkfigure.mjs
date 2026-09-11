/* A WALK'S FIGURE CARRIES ITS OWN CLASSIFICATION, SO A FLOOR ON AN UNGUARDED
 * CORPUS IS IMPOSSIBLE TO WRITE RATHER THAN MERELY DETECTABLE AFTERWARDS.
 * D-265.  The shape the row asked for, and the argument for choosing it is below.
 *
 * ------------------------------------------------------------------ the defect
 *
 * M0-16's class census in `test/hygiene.test.mjs` grades a file by whether THAT
 * FILE contains a `readdirSync(`.  M0-21 / D-268 closed the co-location half with
 * `scripts/walkfloor.mjs`, which asks the question by DATA FLOW: does a value
 * produced by a walk reach a comparison, across a module boundary.  That is a real
 * inversion and it found a fifth floor no brief had named.
 *
 * IT IS STILL A DETECTOR, AND D-265 IS ABOUT WHAT A DETECTOR CANNOT REACH.  The
 * row named two shapes and preferred the second:
 *
 *   (a) extend the census to a second question — does this file import an
 *       identifier from a walking module, and does a floor here derive from it;
 *   (b) make the exported walks themselves carry the classification, so a floor
 *       computed from an unguarded corpus is impossible to WRITE.
 *
 * THIS MODULE IS (b), AND THE REASON IS MEASURED RATHER THAN PREFERRED.
 * `walkfloor.mjs`'s own header states five things it cannot see, and two of them
 * are PINNED AS ARMS in `test/walkfloor.test.mjs` — a RE-EXPORT CHAIN, and FLOW
 * THROUGH A DATA STRUCTURE.  Those are not hedges.  They are shapes in which a
 * real floor on a real unguarded corpus is SCORED CLEAN today: not UNKNOWN, not
 * NAMED, not printed — absent from the output entirely, because the analyser never
 * connects the binding to the walk.  `require()`, `await import()`, a walk reached
 * through a value passed as an ARGUMENT, and flow through a function PARAMETER are
 * the other three.
 *
 * That is exactly D-265's negative-control arm: *a NEW file that floors on an
 * imported walk in a spelling you did not anticipate.*  A static analyser will
 * always have such a set, and lengthening its list of understood shapes is
 * WORKER.md's *invert, do not lengthen a list* pointed the wrong way — the fourth
 * spelling is written the day after the third is understood.
 *
 * A RUNTIME BRAND HAS NO SUCH SET, and the reason is one sentence: the
 * classification travels WITH THE VALUE.  It goes through a data structure because
 * the array holds the value.  It goes through a function parameter because the
 * parameter is bound to the value.  It survives a re-export chain, a dynamic
 * import, a rename and an arithmetic hop, because none of those is a place where
 * the value stops being itself.  The five gaps `walkfloor.mjs` states are not
 * five gaps here; they are not a category.
 *
 * ------------------------------------------------ what "impossible to write" means
 *
 * `result.files >= 300` evaluates `ToPrimitive(result.files, number)`.  A figure
 * from an unguarded corpus THROWS there, naming the file and line that wrote it.
 * So the floor is not written-and-detected; it is written-and-refused, at the site,
 * the first time the line runs.
 *
 * The hint matters and is chosen deliberately:
 *   - hint "number"  (`>=`, `<`, `Math.max`, `Number(x)`, unary `+`)  THROWS.
 *   - hint "default" (`+`, `==`)                                     THROWS.
 *     Arithmetic is how a floor escapes a brand: `(x + 0) >= 300` would otherwise
 *     launder an unguarded figure into a bare number one character early.
 *   - hint "string"  (`${x}`, `String(x)`)                           PRINTS the
 *     number.  A REPORT is not a floor.  D-257 established that direction already:
 *     a walk that only reports fails safe, and making reports unreadable is how a
 *     check gets switched off.  `console.log(x)` goes through inspect, not
 *     ToPrimitive, and is handled below for the same reason.
 *
 * THE ONE WAY OUT IS NAMED AT THE SITE.  `.overWorkingTree(why)` returns the bare
 * number and requires a stated reason.  That is the whole escape surface — not a
 * list of shapes a matcher might recognise, but the single chokepoint the value
 * itself enforces.  The difference is the point: a list of spellings can be walked
 * around by writing a sixth; a chokepoint can only be walked THROUGH, and every
 * passage through it says why in the source.  `test/hygiene.test.mjs` ratchets the
 * set of passages, so a new one is a DECISION rather than a silence.
 *
 * ------------------------------------------------------- collections, and why not
 *
 * The measured instance floors on `names.length >= 150` as well as on three scalar
 * figures, so a brand that covered only scalars would leave the real shape open.
 * A branded ARRAY is not available: `Array.prototype.filter`, `.map`, spread and
 * the array iterator all read `length` and `ToLength` it, so a `length` that throws
 * breaks every legitimate use of the array — MEASURED, not assumed, and it is why
 * `walkSet` is a different shape rather than a proxied array.  `walkSet` exposes a
 * `count` (a figure, so a floor on it throws) and NO `length` and NO iterator, so
 * `set.length >= 150` is `undefined >= 150` — false, never silently true — and the
 * raw array is reachable only through the same named chokepoint.
 *
 * ------------------------------------------- WHAT THIS CAN AND CANNOT DO, STATED
 *
 * That sentence is load-bearing, and a brand that hides its limits is read as
 * though it had none.
 *
 * CAN:
 *  - refuse a floor written on a walk figure through ANY route the value travels:
 *    a data structure, a function parameter, a rename, a re-export chain, a
 *    dynamic import, arithmetic, `Math.*`, `Number()`, or the comparison written
 *    backwards.  Each of those is a planted arm in `test/walkfigure.test.mjs` and
 *    a count, not a claim.
 *  - name the file and line of the offending comparison, from the throw site.
 *  - keep reports, template literals and `console.log` working unchanged.
 *
 * CANNOT, and each is real:
 *  - reach a walking module that does not USE it.  The brand is applied at an
 *    export boundary by that module's author; `hygiene.test.mjs` ratchets which
 *    walk-derived exports are BRANDED and which are NAMED, and that ratchet — not
 *    this module — is what makes a new unbranded walk visible.  This is the one
 *    place where the static census remains load-bearing, and the two halves are
 *    complementary rather than redundant.
 *  - see a floor on a line that never RUNS.  A brand is dynamic; an unreached
 *    branch is unjudged.  `walkfloor.mjs` reads source and does not care whether a
 *    line runs, which is precisely why it is kept rather than replaced.
 *  - judge whether the directory walked is a repository tree or a `mkdtemp`
 *    sandbox.  That is the same human judgement M0-16's named list carries.
 *  - stop a caller who has already unwrapped through `.overWorkingTree(why)` from
 *    flooring on the bare number afterwards.  The unwrap is the DECISION; the
 *    ratchet in `hygiene.test.mjs` is what keeps the set of decisions honest.
 */

/* This module contains no walk of its own — deliberately.  It is the thing a walk
   is classified WITH, and giving it a `readdirSync` would put it in the census it
   exists to serve.  Measured: zero discovery primitives below this line. */

export const WALK_BRAND = Symbol.for("civicos.walkfigure");

/* Every unwrap this process performed, in order, with the site that performed it.
   A LEDGER rather than a check: it is what lets a suite say which passages through
   the chokepoint actually happened, instead of grepping for a spelling. */
export const ESCAPES = [];

export class WalkFloorError extends Error {
  constructor(message, detail) {
    super(message);
    this.name = "WalkFloorError";
    Object.assign(this, detail);
  }
}

/* The first stack frame outside this module — the line that wrote the floor.  A
   refusal that cannot say WHERE is a refusal somebody disables. */
function callSite(skip = 0) {
  const lines = String(new Error().stack || "").split("\n").slice(1);
  const out = [];
  for (const l of lines) {
    if (l.includes("walkfigure.mjs")) continue;
    out.push(l.trim().replace(/^at\s+/, ""));
    if (out.length > skip) break;
  }
  return out[out.length - 1] || "<site unknown>";
}

const REASON_MIN = 12;

/* `about` is what the figure is a count OF, and it travels in the refusal so the
   message names the corpus rather than only the line. */
function describe(about) {
  return typeof about === "string" && about.trim() ? about.trim() : "an unguarded walk";
}

/* --------------------------------------------------------------- a scalar figure */

export function walkFigure(n, about) {
  if (typeof n !== "number" || !Number.isFinite(n))
    throw new TypeError(`walkFigure() takes a finite number (got ${typeof n}: ${String(n)})`);
  const what = describe(about);

  const fig = {
    [WALK_BRAND]: "figure",
    about: what,

    /* THE REFUSAL.  `>=` lands here with hint "number"; `+` and `==` with
       "default"; only ToString is let through, because a report is not a floor. */
    [Symbol.toPrimitive](hint) {
      if (hint === "string") return String(n);
      throw new WalkFloorError(
        `a FLOOR on an unguarded walk figure (${what}) — ${callSite()}\n`
        + `      This number counts the WORKING TREE, so a file nobody committed moves it, and a\n`
        + `      floor set beside a phantom is permanently too high (D-238's payload).\n`
        + `      Floor on the figure your walk reproduces over 'git ls-tree HEAD' instead, or, if\n`
        + `      this really is not a floor, say so: .overWorkingTree("<why>") — and expect\n`
        + `      hygiene.test.mjs to ask you to NAME it.`,
        { figure: what, site: callSite(), hint });
    },

    toString() { return String(n); },
    toJSON() { return { walkFigure: n, about: what }; },
    [Symbol.for("nodejs.util.inspect.custom")]() { return `walkFigure(${n} — ${what})`; },

    /* THE ONE WAY OUT, AND IT SAYS WHY IN THE SOURCE. */
    overWorkingTree(why) {
      if (typeof why !== "string" || why.trim().length < REASON_MIN)
        throw new WalkFloorError(
          `.overWorkingTree() needs a stated reason of at least ${REASON_MIN} characters `
          + `— ${callSite()}. An unwrap with no reason is the silence this exists to remove.`,
          { figure: what, site: callSite() });
      ESCAPES.push({ kind: "figure", about: what, why: why.trim(), site: callSite(), value: n });
      return n;
    },
  };
  return Object.freeze(fig);
}

/* ----------------------------------------------------- a working-tree collection */

export function walkSet(arr, about) {
  if (!Array.isArray(arr)) throw new TypeError("walkSet() takes an array");
  const what = describe(about);
  const set = {
    [WALK_BRAND]: "set",
    about: what,
    /* A floor on the size lands on a figure, so it throws the same way. */
    count: walkFigure(arr.length, `${what} (count)`),
    toJSON() { return { walkSet: arr.length, about: what }; },
    [Symbol.for("nodejs.util.inspect.custom")]() { return `walkSet(${arr.length} — ${what})`; },
    overWorkingTree(why) {
      if (typeof why !== "string" || why.trim().length < REASON_MIN)
        throw new WalkFloorError(
          `.overWorkingTree() needs a stated reason of at least ${REASON_MIN} characters `
          + `— ${callSite()}.`, { figure: what, site: callSite() });
      ESCAPES.push({ kind: "set", about: what, why: why.trim(), site: callSite(), value: arr.length });
      return arr.slice();
    },
  };
  /* No `length`, no `Symbol.iterator`: `set.length >= 150` is `undefined >= 150`,
     which is FALSE. A floor that cannot be written is better than one that reads
     true by accident, and the false direction is the safe one (D-257). */
  return Object.freeze(set);
}

/* ------------------------------------------------------------------- predicates */

export const isWalkFigure = (v) => !!v && typeof v === "object" && v[WALK_BRAND] === "figure";
export const isWalkSet = (v) => !!v && typeof v === "object" && v[WALK_BRAND] === "set";
export const isClassified = (v) => isWalkFigure(v) || isWalkSet(v);

/* Which keys of a returned walk result carry the classification, and which do not.
   `hygiene.test.mjs`'s ratchet asks this of a DRIVEN result rather than of source
   text — a mechanism believed on the strength of its existence rather than its
   behaviour is the defect this project meets most. */
export function classificationOf(result) {
  const classified = [], bare = [];
  for (const [k, v] of Object.entries(result || {})) {
    if (isClassified(v)) classified.push(k);
    else if (typeof v === "number") bare.push(k);
  }
  return { classified: classified.sort(), bare: bare.sort() };
}

/* ------------------------------------------------------------- the result builder
 *
 * BRANDING SOME FIGURES IS NOT A RATCHET.  A module that brands one field and
 * leaves the other four bare passes "is this export branded?" while carrying the
 * exact exposure the row is about, which is a mechanism believed on the strength of
 * its existence.  So the boundary is built rather than decorated: EVERY number and
 * EVERY array a walk publishes is declared into exactly one of four buckets, the
 * declaration travels ON the result, and `hygiene.test.mjs` asserts TOTALITY over a
 * DRIVEN result — an undeclared figure fails BY NAME.
 *
 *   workingTree  — counted over the working tree.  BRANDED; a floor here throws.
 *   reproducible — the same count restricted to `git ls-tree HEAD`.  Bare, because
 *                  flooring on it is the CORRECT thing to do: that is D-257's
 *                  two-line pattern and the whole point of having the pair.
 *   safe         — working-tree derived, but every caller PINS it exactly or
 *                  asserts it EMPTY, so a phantom turns the assertion RED rather
 *                  than quietly green.  D-257's safe direction, stated per key.
 *   data         — payloads that are not figures at all.
 *
 * `safe` carries a REASON per key for the same purpose `.overWorkingTree()` does:
 * a bucket that can be reached without saying why is a bucket everything ends up in.
 */

export const WALK_DECLARATION = Symbol.for("civicos.walkdeclaration");

export function walkResult({ about, workingTree = {}, reproducible = {}, safe = {}, data = {} }) {
  const what = describe(about);
  const out = {};
  const decl = { about: what, workingTree: [], reproducible: [], safe: [], data: [] };

  for (const [k, v] of Object.entries(workingTree)) {
    out[k] = Array.isArray(v) ? walkSet(v, `${what}: ${k}`)
      : typeof v === "number" ? walkFigure(v, `${what}: ${k}`)
        : (() => { throw new TypeError(`walkResult: workingTree.${k} must be a number or an array`); })();
    decl.workingTree.push(k);
  }
  for (const [k, v] of Object.entries(reproducible)) { out[k] = v; decl.reproducible.push(k); }
  for (const [k, entry] of Object.entries(safe)) {
    if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[1] !== "string"
        || entry[1].trim().length < REASON_MIN)
      throw new TypeError(`walkResult: safe.${k} must be [value, "<why a floor here fails safe>"] `
        + `with a reason of at least ${REASON_MIN} characters`);
    out[k] = entry[0];
    decl.safe.push(k);
  }
  for (const [k, v] of Object.entries(data)) { out[k] = v; decl.data.push(k); }

  const seen = new Set();
  for (const list of [decl.workingTree, decl.reproducible, decl.safe, decl.data])
    for (const k of list) {
      if (seen.has(k)) throw new TypeError(`walkResult: '${k}' declared in two buckets`);
      seen.add(k);
    }

  decl.safeReasons = Object.fromEntries(Object.entries(safe).map(([k, e]) => [k, e[1].trim()]));
  Object.defineProperty(out, WALK_DECLARATION, { value: Object.freeze(decl), enumerable: false });
  return out;
}

/* The ratchet's question, asked of a DRIVEN result.  `undeclared` is the finding:
   a number or an array the walk publishes that nobody classified.  `laundered` is
   the second one — a key DECLARED `workingTree` that came back bare anyway, which
   is how a brand silently stops being applied. */
export function declarationOf(result) {
  const decl = result && result[WALK_DECLARATION];
  if (!decl) return { declared: false, undeclared: [], laundered: [] };
  const all = new Set([...decl.workingTree, ...decl.reproducible, ...decl.safe, ...decl.data]);
  const undeclared = [], laundered = [];
  for (const [k, v] of Object.entries(result)) {
    const figureShaped = typeof v === "number" || Array.isArray(v) || isClassified(v);
    if (figureShaped && !all.has(k)) undeclared.push(k);
    if (decl.workingTree.includes(k) && !isClassified(v)) laundered.push(k);
  }
  return { declared: true, about: decl.about, buckets: decl,
    undeclared: undeclared.sort(), laundered: laundered.sort() };
}

