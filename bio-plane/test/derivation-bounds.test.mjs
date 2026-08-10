/* NEGATIVE CONTROL: (run 2026-08-08, rec66-agent, REC-66) FIVE armed arms and one armed by
   construction, each armed ALONE with every other held open, driven by `test/nc-rec66.mjs`
   (`cd bio-plane && node test/nc-rec66.mjs`), every file restored from a PRISTINE pre-arm
   copy named UNIQUELY PER ARM and verified by sha256 AND by `cmp`. BASELINE ROW FIRST, and
   it is not decoration: derivation-bounds **42/0**, meaning-bounds **85/0**, bounds
   **151/0**.
   (1) RESTORE THE UNBOUNDED DERIVATION — in src/store.mjs `deriveConnections`, put the
   bound-free scan back (`SELECT capture_sha, bundle_id, grade FROM resolutions WHERE
   entity_id=? ORDER BY capture_sha`) and derive over every distinct capture (`const ends =
   distinct;`). MEASURED: **derivation-bounds 29/13, and meaning-bounds 85/0 and bounds
   151/0 — BOTH SIBLINGS FULLY GREEN.** The 13 are this file's: the store holds 780
   connection rows where the bound admits 496, the scan returned 40 rows where it may return
   33, `documents` reads 40 against a `document_limit` of 32, the class walk puts
   `connect->deriveConnections` back on its roster and the ratchet fails at 30 of 29.
   **THE ARM THAT DECIDES THE ITEM — and the two green siblings are the finding beside it:
   an envelope stays perfectly honest over an unbounded scan, which is D-227 reproduced one
   step earlier and the whole reason this file exists.**
   (2) THE NAIVE FIX — the one a review passes and this suite must not: leave the derivation
   unbounded and CUT THE ANSWER instead (`connections.slice(0, cap)`, `count` and
   `documents` clamped, `limit`/`truncated` still published honestly). MEASURED:
   **derivation-bounds 33/9, meaning-bounds 85/0, bounds 151/0.** The RESPONSE arms pass —
   the answer is the right size and says it was cut — and every DERIVATION arm fails: 780
   rows in the store, 40 documents read, `resolution_rows` 40. **This is the arm that proves
   the two fixes are distinguishable at all.**
   (3) BREAK THE TAINT PROPAGATION — in this file, the `if (mentions(m[2], tainted))
   tainted.add(m[1])` pass deleted, so a collection DERIVED from an unbounded scan is no
   longer unbounded. MEASURED: **37/5**, headed by the SUBJECT-SHAPE arm: the walk stops
   seeing the pre-REC-66 `deriveConnections` shape at all (its amplifying loops iterate
   `ends`, never `rows`), the class FLOOR fails and the by-name pin fails. **The cause of
   the first draft's blindness, named — a longer list of loop spellings would never have
   found it.**
   (3a) AND THIS ARM FOUND A DEFECT IN THE INSTRUMENT RATHER THAN CONFIRMING IT, which is
   why the numbers above are the SECOND run's. On the first run the SUBJECT-SHAPE arm STAYED
   GREEN under a broken taint: a BRACE-LESS loop body (`for (const r of rows) byKey.set(…);`)
   was given an extent that ran to the next block in the method and SWALLOWED the quadratic
   loops. The walk was right for the wrong reason. `loopBodyEnd` was written for that, and a
   second reading of the same run found the mirror defect — a `for…of` whose iterable
   contains a `)` (`mine.slice(0, Math.max(0, n))`) ended its header early and DROPPED the
   loop, taking `selectionCreate` off the roster. Both are corrected and both corrections
   are stated at the site.
   (4) NEUTER THE WALK — `if (1) return out;` at the head of `classMembers`. MEASURED:
   **33/9**, corpus PRINTED AS ZERO, every REACH-AS-A-DELTA arm among the failures together
   with the FLOOR and both SUBJECT-SHAPE arms. **The CEILING stays green over the empty
   roster**, which is exactly why the floor is there.
   (5) OVER-STRICTNESS — five arms, all PASSING on the clean tree and all RED under (4) or
   (3), which is what makes them armed rather than decorative: a bounded scan with the same
   nested loops is NOT in the class; a LINEAR read over an unbounded scan is NOT (this class
   is amplification, not size); quadratic work over a CALLER-SUPPLIED array with no scan is
   NOT; a per-row scan phrased with `.map` and no `for` anywhere IS; and live, a small
   subject is derived WHOLE — neither truncated nor refused.
   (6) UNARM THE FIXTURE — `BIG_K = 3`, a quadratic subject too small for the bound to bite.
   MEASURED: **32/10.** The fixture arm fails first and every `truncated: true` arm with it,
   which is the proof that those arms are not passing at zero cost over a fixture that could
   never have cut. */
/* REC-66 · D-224 / D-227 — THE BOUND ON THE DERIVATION, AND THE WALK FOR ITS CLASS.
 * ============================================================================
 *
 * `op=connect` was D-225's class one step earlier and strictly worse than the three REC-60
 * fixed. Those three returned an unbounded ANSWER over rows that already existed. This one
 * READ THE ENTITY'S RESOLUTIONS WITH NO LIMIT and then did k(k-1)/2 work to produce the
 * answer — so **the derivation was unbounded, not merely the response**, and a cap on the
 * array it returned would have left the scan and the write exactly where they were.
 *
 * THAT DISTINCTION IS THIS FILE'S SUBJECT, and it is why the file exists beside
 * `bounds.test.mjs` (which pins the published envelope) and `meaning-bounds.test.mjs`
 * (which grades what a method publishes). **Neither of them can see it**: D-227 measured an
 * envelope staying perfectly honest over a scan whose `LIMIT` had been removed, and the
 * negative control (2) above reproduces that here on purpose. What proves a derivation
 * bounded is not the answer's shape but **the work the store actually did** — how many rows
 * the scan returned, how many documents were read, how many rows were WRITTEN.
 *
 * THE WALK ASKS A THIRD QUESTION, and it is not the bare-collection roster's:
 *   REC-60 asked  *what does this method PUBLISH, and is it bounded?*
 *   REC-70 asked  *which dispatched ops does that walk not reach at all?*
 *   THIS asks     **which methods DERIVE — do work amplified per row — over a scan that is
 *                   itself unbounded?** A read may answer a small number after doing an
 *                   enormous amount of work, and every instrument above it reads clean.
 *
 * THE MECHANISM, AND IT IS TAINT PROPAGATION RATHER THAN A LIST OF SPELLINGS. The first
 * draft of this walk looked for a loop iterating a local assigned straight from an
 * unbounded `#rows(` call, plus a nested loop or a write inside it. **IT DID NOT SEE ITS
 * OWN SUBJECT.** `deriveConnections` collapsed `rows` into a Map, took `ends` out of the
 * Map, and looped over `ends` — so the amplifying loops never mentioned the scan's local at
 * all. Lengthening a list of loop shapes would not have found that in a hundred years; what
 * finds it is the property itself: **a collection GROWN inside a loop over an unbounded
 * collection, or ASSIGNED from an expression mentioning one, IS unbounded**, iterated to a
 * fixed point. The synthetic SUBJECT-SHAPE arm below is that draft's failure kept as a
 * test, and negative control (3) re-arms it.
 *
 * WHAT THIS WALK CANNOT SEE, stated here rather than discovered later:
 *   - It reads ONE FILE, `store.mjs`, and one method at a time. Work done in a HELPER the
 *     method calls is invisible; the helper is judged on its own body, and if the helper
 *     receives the unbounded collection as an ARGUMENT the taint does not cross into it.
 *   - It cannot see amplification inside SQL. A JOIN that fans out, or a correlated
 *     subquery, is one `#rows(` call to this reader.
 *   - It reads `LIMIT` as the only bound. A scan bounded by a `WHERE` over a key that
 *     happens to be unique reads as unbounded here — the safe direction, and it is why the
 *     class roster is a CEILING that may fall rather than a list of defects.
 *   - Recursion is invisible, and so is a loop whose iterable is rebuilt through a function
 *     call the taint cannot follow (`JSON.parse(JSON.stringify(rows))`).
 *   - `.map`/`.forEach`/`.filter`/`.reduce`/`.flatMap` on a tainted receiver ARE followed;
 *     any other callback form is not.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ==========================================================================
 * THE WALK — every method that derives over an unbounded scan.
 * ========================================================================== */
const SRC_STORE = readFileSync(new URL("../src/store.mjs", import.meta.url), "utf8");

/* Comments blanked before any anchor is matched — the siblings' reader, reused because it
   was measured there. A walk whose anchors match PROSE measures the prose, and this file's
   header names its own subject a dozen times. */
const decomment = (text) => text.split("\n").map(((state) => (L) => {
  let out = "", i = 0;
  while (i < L.length) {
    if (state.block) {
      const e = L.indexOf("*/", i);
      if (e < 0) { i = L.length; } else { state.block = false; i = e + 2; }
      continue;
    }
    const b = L.indexOf("/*", i), s = L.indexOf("//", i);
    if (b >= 0 && (s < 0 || b < s)) { out += L.slice(i, b); state.block = true; i = b + 2; continue; }
    if (s >= 0 && (b < 0 || s < b)) { out += L.slice(i, s); i = L.length; continue; }
    out += L.slice(i); i = L.length;
  }
  return out;
})({ block: false })).join("\n");

/* Method segments bounded by the NEXT signature — `bounds.test.mjs`'s segmenter. */
const segments = (code) => {
  const lines = code.split("\n");
  const sig = /^ {2}(?:static\s+|async\s+)?(#?[A-Za-z_$][\w$]*)\s*\(/;
  const heads = [];
  for (let i = 0; i < lines.length; i++) { const m = sig.exec(lines[i]); if (m) heads.push([i, m[1]]); }
  const out = new Map();
  for (let k = 0; k < heads.length; k++) {
    const j = k + 1 < heads.length ? heads[k + 1][0] : lines.length;
    out.set(heads[k][1], lines.slice(heads[k][0], j).join("\n"));
  }
  return out;
};

const closeParen = (s, from) => {
  let i = s.indexOf("(", from), d = 0;
  for (; i >= 0 && i < s.length; i++) { if (s[i] === "(") d++; else if (s[i] === ")") { d--; if (!d) return i + 1; } }
  return s.length;
};
/* THE EXTENT OF A LOOP BODY, and this reader was WRONG in its first draft in a way only a
   negative control could have shown. It used to be "brace-match from the next `{`" — and a
   BRACE-LESS loop body (`for (const r of rows) byKey.set(r.a, r);`) has no `{` of its own,
   so the extent ran forward to the NEXT block in the method and swallowed it. That made
   negative control (3) pass for the wrong reason: with the taint propagation deleted, the
   subject-shape arm STAYED GREEN because the collapse loop's extent had absorbed the
   quadratic loops it was never supposed to reach. **A control finding the instrument wrong
   rather than the subject, for the sixth recorded time in this estate.** A single-statement
   body now ends at its own `;`, at depth zero, exactly as the language says. */
const loopBodyEnd = (s, headEnd) => {
  let i = headEnd;
  while (i < s.length && /\s/.test(s[i])) i++;
  if (s[i] !== "{") {
    let d = 0;
    for (; i < s.length; i++) {
      if ("{[(".includes(s[i])) d++;
      else if ("}])".includes(s[i])) { if (!d) return i; d--; }
      else if (s[i] === ";" && !d) return i + 1;
    }
    return s.length;
  }
  let d = 0;
  for (; i < s.length; i++) { if (s[i] === "{") d++; else if (s[i] === "}") { d--; if (!d) return i + 1; } }
  return s.length;
};
/* Every `#rows(` call and whether its SQL carries a LIMIT. The same reader
   `meaning-bounds.test.mjs` uses for its verdicts, deliberately, so the two files cannot
   disagree about what "bounded" means at the row source. */
const scans = (body) => {
  const out = []; const re = /#rows\(/g; let m;
  while ((m = re.exec(body))) {
    const end = closeParen(body, m.index + m[0].length - 1);
    out.push({ from: m.index, to: end, bounded: /\bLIMIT\b/i.test(body.slice(m.index, end)) });
  }
  return out;
};
const mentions = (expr, ids) =>
  [...ids].some((id) => new RegExp(`\\b${id.replace(/\$/g, "\\$")}\\b`).test(expr));

/* THE ANALYSIS. Seeds, fixed-point taint, tainted loops, amplification. */
const analyse = (body) => {
  const sc = scans(body);
  const unbounded = sc.filter((s) => !s.bounded);
  const tainted = new Set();
  /* SEED: a local assigned straight from an UNBOUNDED scan. */
  { const re = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*[^;]*/g; let m;
    while ((m = re.exec(body)))
      if (unbounded.some((s) => s.from > m.index && s.from < m.index + m[0].length)) tainted.add(m[1]); }
  const loopsOver = (ids) => {
    const out = []; let m;
    /* THE HEADER IS READ WITH BALANCED PARENTHESES, not with `[^)]*`, and that too is a
       correction the controls forced. `for (const old of mine.slice(0, Math.max(0, n)))`
       has a `)` inside its iterable, so a non-balanced reader ended the header early, took
       the wrong body extent, and DROPPED the loop — `selectionCreate` left the class roster
       for no reason but a regex. One reader for both `for…of` and the counted `for`. */
    const forHead = /\bfor\s*\(/g;
    while ((m = forHead.exec(body))) {
      const end = closeParen(body, m.index);
      const head = body.slice(m.index, end);
      const of = head.indexOf(" of ");
      const iterable = of >= 0 ? head.slice(of + 4, -1)
                     : head.includes(";") ? head.split(";")[1] : "";
      if (!iterable.trim()) continue;
      if (mentions(iterable, ids) || unbounded.some((s) => s.from > m.index && s.from < end))
        out.push({ from: m.index, to: loopBodyEnd(body, end) });
    }
    for (const id of ids) {
      const cb = new RegExp(`\\b${id.replace(/\$/g, "\\$")}\\s*\\.\\s*(?:map|forEach|flatMap|filter|reduce)\\s*\\(`, "g");
      let x; while ((x = cb.exec(body))) out.push({ from: x.index, to: closeParen(body, x.index + x[0].length - 1) });
    }
    return out;
  };
  /* THE FIXED POINT, and it is the whole reason this walk sees its own subject: a
     collection ASSIGNED FROM a tainted expression is tainted, and a collection GROWN
     inside a loop over a tainted one is tainted. `deriveConnections` reached its pairs
     through a Map and an array spread, two hops from the scan. */
  for (let round = 0; round < 8; round++) {
    const before = tainted.size;
    const loops = loopsOver(tainted);
    const inLoop = (i) => loops.some((L) => i > L.from && i < L.to);
    { const re = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]*)/g; let m;
      while ((m = re.exec(body))) if (mentions(m[2], tainted)) tainted.add(m[1]); }
    { const re = /\b([A-Za-z_$][\w$]*)\s*\.\s*(?:push|set|add|unshift|concat)\s*\(/g; let m;
      while ((m = re.exec(body))) if (inLoop(m.index)) tainted.add(m[1]); }
    if (tainted.size === before) break;
  }
  const loops = loopsOver(tainted);
  const inLoop = (i) => loops.some((L) => i > L.from && i < L.to);
  /* AMPLIFICATION: work whose cost is a MULTIPLE of the unbounded scan — another loop, a
     write, or another scan, per row. A single linear pass is not this class and must not
     be called one; that is an over-strictness arm below. */
  const nested = [...body.matchAll(/\b(?:for|while)\s*\(/g)].filter((x) => inLoop(x.index)).length;
  const writes = [...body.matchAll(/this\.sql\.exec\(/g)].filter((x) => inLoop(x.index)).length;
  const perRowScan = sc.filter((s) => inLoop(s.from)).length;
  return { scans: sc.length, unbounded: unbounded.length, tainted: [...tainted],
           loops: loops.length, nested, writes, perRowScan, amplified: nested + writes + perRowScan };
};

const classMembers = (code) => {
  const out = new Map();
  for (const [name, body] of segments(code)) {
    const a = analyse(body);
    if (!a.unbounded || !a.loops || !a.amplified) continue;
    out.set(name, a);
  }
  return out;
};
/* op -> method, off the dispatch arrow. The siblings' reader, reused. */
const dispatchedOps = (code) => {
  const out = new Map();
  const re = /^\s+([a-z][a-z0-9]*):\s*(?:async\s*)?\(\)\s*=>\s*(?:await\s+)?this\.([A-Za-z_$][\w$]*)\(/gm;
  let m; while ((m = re.exec(code))) out.set(m[1], m[2]);
  return out;
};

const CODE = decomment(SRC_STORE);
const SEGMENTS = segments(CODE);
const CLASS = classMembers(CODE);
const DISPATCHED = dispatchedOps(CODE);
const SCANNING = [...SEGMENTS].filter(([, b]) => scans(b).some((s) => !s.bounded)).length;
const CLASS_OPS = [...DISPATCHED].filter(([, meth]) => CLASS.has(meth))
  .map(([op, meth]) => `${op}->${meth}`).sort();

console.log("\n--- WALK: every method that DERIVES over an unbounded scan (REC-66's class) ---");
console.log(`  CORPUS: store.mjs ${SRC_STORE.split("\n").length} lines, ${SEGMENTS.size} method segments, `
          + `${SCANNING} scanning UNBOUNDED, ${CLASS.size} in the class, reaching ${CLASS_OPS.length} of `
          + `${DISPATCHED.size} DISPATCHED ops`);
for (const [name, a] of CLASS)
  console.log(`    ${name.padEnd(30)} unbounded=${a.unbounded} loops=${a.loops} `
            + `nested=${a.nested} writes=${a.writes} scans-per-row=${a.perRowScan}`);
console.log(`  CLASS OPS: ${CLASS_OPS.join(", ")}`);

/* ------------------------------------------------------------------- GUARDS. */
t("WALK GUARD: comments are blanked, and a known CODE line SURVIVES it",
  /static SEARCH_ORPHAN_MAX = 100;/.test(CODE), true);
t("WALK GUARD: and a known PROSE line does NOT — this file's own subject is named in the source's comments",
  /the DERIVATION was unbounded, not merely the response/.test(CODE), false);
t("WALK GUARD: the segmenter partitions the class into a plausible number of methods",
  SEGMENTS.size > 250, true);
t("WALK GUARD: the corpus is NON-EMPTY at every level the verdict depends on — methods, unbounded "
+ "scans, class members, dispatched ops. A headline assertion over an empty corpus is how three "
+ "walks congratulated themselves this week",
  [SEGMENTS.size > 0, SCANNING > 0, CLASS.size > 0, DISPATCHED.size > 100], [true, true, true, true]);

/* ---------------------------------------------- THE SUBJECT SHAPE, BOTH DIRECTIONS.
   The pre-REC-66 `deriveConnections` in miniature, kept as a fixture rather than as a
   memory: an unbounded scan, a collapse into a Map, an array taken OUT of the Map, and the
   quadratic loops over THAT — so the amplifying loops never mention the scan's own local.
   The first draft of this walk found nothing here, which is the whole reason the taint
   propagates. Negative control (3) deletes the propagation and this arm goes red. */
const SUBJECT_UNBOUNDED = `class Z {
  ncDerive({ id } = {}) {
    const rows = this.#rows(\`SELECT a, b FROM t WHERE id=? ORDER BY a\`, id);
    const byKey = new Map();
    for (const r of rows) byKey.set(r.a, r);
    const ends = [...byKey.values()];
    const out = [];
    for (let i = 0; i < ends.length; i++) {
      for (let j = i + 1; j < ends.length; j++) {
        this.sql.exec(\`INSERT INTO pairs (a,b) VALUES (?,?)\`, ends[i].a, ends[j].a);
        out.push({ a: ends[i].a, b: ends[j].a });
      }
    }
    return { ok: true, count: out.length, out };
  }
  end() { return 1; }
}`;
/* The same shape with the scan BOUNDED — the fix, phrased as a fixture. */
const SUBJECT_BOUNDED = SUBJECT_UNBOUNDED
  .replace("WHERE id=? ORDER BY a`, id)", "WHERE id=? ORDER BY a LIMIT ?`, id, cap + 1)");
t("SUBJECT SHAPE: the walk SEES the pre-REC-66 derivation — an unbounded scan collapsed through a "
+ "Map and a quadratic loop over what came OUT of the Map, which is the exact shape whose amplifying "
+ "loops never mention the scan's own local",
  [classMembers(SUBJECT_UNBOUNDED).has("ncDerive"),
   classMembers(SUBJECT_UNBOUNDED).get("ncDerive")?.amplified > 0], [true, true]);
t("SUBJECT SHAPE (the other direction): the SAME shape with the scan bounded is NOT in the class — "
+ "so the arm above measures the bound and not the loops",
  classMembers(SUBJECT_BOUNDED).has("ncDerive"), false);
t("SUBJECT SHAPE: and the taint reached it through TWO hops — the Map it was collapsed into and the "
+ "array taken out of it. A reader that followed only the scan's own local finds nothing here, which "
+ "is what the first draft of this walk did",
  ["byKey", "ends", "out"].filter((v) => !(classMembers(SUBJECT_UNBOUNDED).get("ncDerive")?.tainted || []).includes(v)),
  []);

/* -------------------------------------------------------------- THE ITEM'S OWN OP. */
t("REC-66: `op=connect` is OFF this class roster — the derivation's scan is bounded, and this is "
+ "measured off the source by the walk that would otherwise name it",
  CLASS_OPS.filter((e) => e.startsWith("connect->")), []);
t("REC-66: and `deriveConnections` scans rows and has NO unbounded scan left in it — stated "
+ "positively, so the arm fails if the method is ever returned to the state this item found it in",
  (() => { const a = analyse(SEGMENTS.get("deriveConnections") || ""); return [a.scans > 0, a.unbounded]; })(),
  [true, 0]);
/* D-227's PIN, one step earlier than D-227 wrote it. The published envelope cannot stand in
   for the SQL bound — CONDUCT measured an honest envelope over an unbounded scan at REC-60's
   integration — so both bounds are pinned off this method's own comment-stripped segment. */
t("REC-66 / D-227: the SQL bounds themselves, pinned off `deriveConnections`' comment-stripped "
+ "segment — the scan is bounded by DOCUMENTS (the inner select) and by ROWS (the outer LIMIT), "
+ "and both ask for one more than they may use so the answer can tell that more existed",
  [/SELECT capture_sha FROM resolutions WHERE entity_id=\? GROUP BY capture_sha\s+ORDER BY capture_sha LIMIT \?/
     .test(SEGMENTS.get("deriveConnections") || ""),
   /ORDER BY capture_sha LIMIT \?`, entityId, entityId, endsCap \+ 1, rowCap \+ 1\)/
     .test(SEGMENTS.get("deriveConnections") || "")], [true, true]);
t("REC-66: the bound is the plane's OWN pair and is not a literal at the call site — the document "
+ "bound is DERIVED from the pair bound by #maxEndsForPairs, so the two can never disagree",
  [/Store\.#MEANING_LIMIT_DEFAULT/.test(SEGMENTS.get("deriveConnections") || ""),
   /Store\.#MEANING_LIMIT_MAX/.test(SEGMENTS.get("deriveConnections") || ""),
   /Store\.#maxEndsForPairs\(cap\)/.test(SEGMENTS.get("deriveConnections") || "")], [true, true, true]);

/* ------------------------------------------------------------------ THE RATCHET.
   The class is REAL and this item does not pretend to have emptied it: 29 methods derive
   over an unbounded scan and 10 of them are reachable through the control plane. What is
   pinned is that it cannot GROW, and — separately — that it cannot SHRINK without somebody
   moving the figure, because a roster that shrank because the READER broke is the failure
   every walk in this estate has now met at least once. */
/* MOVED 29 -> 30 AT INTEGRATION 2026-08-08 by CONDUCT, and the ratchet EARNED ITSELF
   ON ITS FIRST DAY. REC-66 landed this pin in the morning; by the evening REC-63 had
   landed `op=provenanceroute`, whose marker walk derives over `auditPass`'s unbounded
   scan — so `audit->auditPass` JOINED THE CLASS and the ceiling fired, naming it.
   Neither worker could see the other: REC-66 measured 29 correctly on its own tree and
   REC-63 added a method that qualifies, and a class membership count is a property of
   the MERGED source exactly as `regionLines` and the register floor are.
   BOTH HALVES MOVE TOGETHER AND THE BY-NAME ROSTER GAINS ITS MEMBER, because the pin's
   own text says a bare count is satisfied by ANY ten — moving the number without naming
   the arrival would leave the pin asserting a size over a set nobody checked, which is
   the shape REC-66 wrote it to prevent. THIS IS NOT A REGRESSION AND IS NOT LICENSED AS
   ONE: `auditPass` is bounded at 20 with `markedTotal` published, so the new op reads a
   bounded page; it qualifies for the class because the DERIVATION walks the scan, which
   is precisely the distinction REC-66 established when it proved that capping the answer
   would leave the scan in place. Whether it needs its own bound is REC-66's question one
   op later, and it is delegated rather than answered here. */
const CLASS_MEASURED_2026_08_08 = 30;
console.log(`  RATCHET: ${CLASS.size} methods derive over an unbounded scan, `
          + `${CLASS_OPS.length} of them dispatched — measured 2026-08-08`);
t("RATCHET: the class is a CEILING — a NEW method that amplifies work over an unbounded scan pushes "
+ "this over the figure measured on 2026-08-08 and fails here, with the roster printed above so the "
+ "failure names it",
  CLASS.size <= CLASS_MEASURED_2026_08_08, true);
t("RATCHET: and a FLOOR beside it — the roster shrinking without this figure being moved means the "
+ "READER lost sight of methods, not that the plane got better. REC-60's 27 was a shrunken "
+ "measurement nobody could distinguish from progress, and it went unnoticed for two days",
  CLASS.size >= CLASS_MEASURED_2026_08_08, true);
t("RATCHET: the dispatched members are pinned BY NAME, not merely counted — a bare count of ten is "
+ "satisfied by ANY ten, and what a caller can reach is the half that matters",
  CLASS_OPS, ["audit->auditPass", "biasmanifest->biasManifest", "export->exportManifest", "proposals->proposalsFeed",
              "publishedcase->publishedCase", "queue->queueFeed", "readingname->documentsNamingEntity",
              "reevaluations->reevaluations", "select->selectionCreate", "selection->selectionResolve",
              "selectionrelease->selectionRelease"]);

/* ------------------------------------------------ REACH, AS DELTAS.
   A walk that matches nothing reports zero and passes forever. Each reader is re-run over a
   MECHANICALLY BROKEN copy of the same source and must find FEWER. */
const strippedScans = CODE.replace(/#rows\(/g, "#norows(");
t("REACH IS A DELTA (the scan anchor): a copy of store.mjs with no `#rows(` in it yields NO class "
+ "members — every verdict here begins at a row source",
  [classMembers(strippedScans).size, CLASS.size > 0], [0, true]);
const strippedLoops = CODE.replace(/\bfor\s*\(/g, "forx (");
t("REACH IS A DELTA (the loop anchor): a copy with the `for` keyword broken finds FEWER, because "
+ "amplification is read off loops and not off the scan alone",
  classMembers(strippedLoops).size < CLASS.size, true);
const emptyClass = classMembers("");
console.log(`  REACH CONTROL: the same reader over an EMPTY corpus — 0 lines, `
          + `${segments("").size} segments, ${emptyClass.size} class members`);
t("REACH IS A DELTA (empty corpus): the same reader over NOTHING finds NOTHING, while over the real "
+ "source it does not — and the empty corpus is PRINTED above",
  [emptyClass.size, CLASS.size > 0], [0, true]);
t("REACH: THE FAILURE MODE NAMED — over that same empty corpus, `op=connect is off the roster` STILL "
+ "READS TRUE. That is exactly how a covering-nothing walk congratulates itself, and it is asserted "
+ "here so the reason the deltas and the FLOOR exist cannot be forgotten",
  [...dispatchedOps("")].filter(([, meth]) => emptyClass.has(meth)).length, 0);

/* ==========================================================================
 * LIVE — the op driven through its real route, over a fixture LARGE ENOUGH that the
 * bound bites at the DERIVATION. A quadratic subject needs a big fixture or the arms
 * prove nothing: at k=3 every `truncated: true` below would pass at zero cost.
 * ========================================================================== */
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r66", MEMBER_TOKEN: "mem-r66", PROBE_TOKEN: "prb-r66",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

const NOW = "2026-07-16T00:00:00Z";
const BIG_LABEL = "Coliseum Payment Allocation";
const SMALL_LABEL = "A Subject With Three Documents";
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`, "produced_by:", "  mode: assisted",
  "  capability_tier: session", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false",
  "  since: null", "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:", "  locator: in hand",
  "  authority: synthetic", `  retrieved: ${NOW}`, "monitoring:", "  enabled: false",
  "  frequency: none", "---", "", "## Summary", "", "An agenda item.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", "",
].join("\n");

/* FORTY documents on ONE subject, and the number is chosen rather than convenient: the
   default pair bound of 500 admits 32 documents (496 pairs), so 40 is the smallest round
   figure that CUTS the derivation while still forming 780 pairs unbounded — enough that
   "the store holds 496 rows, not 780" is a real difference and not a rounding one. THREE
   on a second subject, for the over-strictness arm. */
const BIG_K = 40, SMALL_K = 3;
const promote = async (i, label) => {
  const id = `INFO-2026-${String(i).padStart(4, "0")}-r66`;
  const md = bundleMd(id);
  const capture = sha(`r66-${i}`);
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: capture, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW,
               entities: [{ ref: `legislation:26-${String(i).padStart(4, "0")}`, kind: "legislation",
                            key: String(i), label }] } }] });
  const files = [
    { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
    { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
  ];
  const r = await POST("op=promote&token=mem-r66", {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "r66", files,
    register: [{ sha256: capture, path: "captures/doc.pdf", encoding: "binary", bytes: 10 }],
    meta: { object_type: "information", group: "believe-in-oakland", title: id,
            current_state: "collected", created: NOW, last_updated: NOW } });
  if (r?.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 300)}`);
  return capture;
};
const BIG_CAPS = [], SMALL_CAPS = [];
for (let i = 1; i <= BIG_K; i++) BIG_CAPS.push(await promote(i, BIG_LABEL));
for (let i = BIG_K + 1; i <= BIG_K + SMALL_K; i++) SMALL_CAPS.push(await promote(i, SMALL_LABEL));
const BIG = (await POST("op=entitycreate&token=mem-r66", { kind: "contract", label: BIG_LABEL })).entity_id;
const SMALL = (await POST("op=entitycreate&token=mem-r66", { kind: "contract", label: SMALL_LABEL })).entity_id;
if (!BIG || !SMALL) throw new Error("entitycreate failed");
for (const c of [...BIG_CAPS, ...SMALL_CAPS]) {
  const r = await POST("op=resolve&token=mem-r66", { captureSha: c, resolvedBy: "r66" });
  if (r?.ok === false) throw new Error(`resolve ${c}: ${JSON.stringify(r).slice(0, 300)}`);
}

console.log("\n--- LIVE: the fixture, proved ARMED and proved LARGE ENOUGH before anything is asserted ---");
const bigConcerns = await GET(`op=concerns&token=mem-r66&id=${BIG}&limit=5000`);
t("FIXTURE ARMED: forty documents concern the big subject, and the answer that says so is itself "
+ "COMPLETE — the number is measured, not assumed",
  [bigConcerns.count, bigConcerns.truncated], [BIG_K, false]);
t("FIXTURE ARMED: three concern the small one, so the over-strictness arm is over a real subject",
  (await GET(`op=concerns&token=mem-r66&id=${SMALL}&limit=5000`)).count, SMALL_K);
t("FIXTURE IS LARGE ENOUGH FOR A QUADRATIC SUBJECT: 40 documents exceed the 32 the default bound "
+ "admits, so the bound BITES — at k=3 every `truncated: true` below would pass at zero cost, which "
+ "is exactly how a green suite has twice been recorded over a defect this week",
  [BIG_K > 32, (BIG_K * (BIG_K - 1)) / 2 > 500], [true, true]);

console.log("\n--- LIVE: the DERIVATION is bounded — the work the store DID, not the answer's shape ---");
const cut = await POST("op=connect&token=mem-r66", { entityId: BIG, assertedBy: "r66" });
t("op=connect: publishes the bound it APPLIED and the DOCUMENT bound derived from it — 500 pairs "
+ "admits 32 documents, and 32 is what the scan was allowed to read",
  [cut.limit, cut.document_limit], [500, 32]);
t("op=connect: a cut derivation SAYS SO — whether the record worked out the connections among ALL "
+ "the documents or among the first N is READABLE, not inferred",
  cut.truncated, true);
t("op=connect: the DERIVATION read 32 documents of the 40 that concern the subject — the bound is on "
+ "the SCAN, and this is the number a response-only cap could not have changed",
  [cut.documents, cut.document_limit, bigConcerns.count], [32, 32, 40]);
t("op=connect: and the SCAN ITSELF returned 33 rows against the 40 the record holds — one more than "
+ "it may use, which is how the answer learns that more existed. THIS IS THE ROW SOURCE BOUND D-227 "
+ "asked for: a store driven with more rows than the ceiling, and the query cannot return them",
  [cut.resolution_rows, cut.resolution_rows < bigConcerns.count], [33, true]);
t("op=connect: the pairs are 496 — 32*31/2 — and never more than the bound asked for, because the "
+ "document bound is the INVERSE of the quadratic rather than a second figure beside it",
  [cut.count, cut.count <= cut.limit, (cut.document_limit * (cut.document_limit - 1)) / 2], [496, true, 496]);
/* THE ARM THAT DISTINGUISHES THE FIX FROM THE NAIVE ONE, and it is the item. A derivation
   that ran whole and then cut its answer would publish EVERY figure above identically. What
   it could not do is leave 496 rows in the table where 780 pairs exist. */
const afterCut = await GET(`op=connections&token=mem-r66&id=${BIG}&limit=5000`);
t("THE WORK, MEASURED IN THE RECORD: the store holds 496 connection rows for the subject and not the "
+ "780 that k(k-1)/2 would produce — a derivation that ran whole and then SLICED its answer would "
+ "publish every figure above identically and leave 780 rows here. This is the arm that decides it",
  [afterCut.count, afterCut.truncated, (BIG_K * (BIG_K - 1)) / 2], [496, false, 780]);

console.log("\n--- LIVE: the bound NOT biting, at the ceiling and at a small subject ---");
const whole = await POST("op=connect&token=mem-r66", { entityId: BIG, assertedBy: "r66", limit: 5000 });
t("op=connect: at the ceiling the SAME subject is derived WHOLE — 100 documents admitted, 40 read, "
+ "780 pairs, and `truncated: false` said rather than implied",
  [whole.limit, whole.document_limit, whole.documents, whole.count, whole.truncated],
  [5000, 100, 40, 780, false]);
t("op=connect: DELTA — 'this is all of it' and 'this is the first N' do NOT read alike on the same "
+ "record, which is the whole reason `truncated` is published rather than inferred from `count`",
  [cut.truncated !== whole.truncated, cut.count !== whole.count], [true, true]);
t("THE WORK, AGAIN: the store now holds all 780 rows — the derivation was RESUMABLE by asking for a "
+ "wider bound, so a bounded derivation loses nothing permanently",
  (await GET(`op=connections&token=mem-r66&id=${BIG}&limit=5000`)).count, 780);
const small = await POST("op=connect&token=mem-r66", { entityId: SMALL, assertedBy: "r66" });
t("OVER-STRICTNESS: a small subject is derived WHOLE and is neither truncated nor refused — a bound "
+ "that turned away a legitimate three-document subject would be a worse defect than the one this "
+ "item fixed",
  [small.count, small.documents, small.truncated, small.ok], [3, 3, false, true]);

console.log("\n--- LIVE: the two answers of the SAME COUNT, one cut and one complete ---");
const cut3 = await POST("op=connect&token=mem-r66", { entityId: BIG, assertedBy: "r66", limit: 3 });
const whole3 = await POST("op=connect&token=mem-r66", { entityId: SMALL, assertedBy: "r66", limit: 3 });
t("SAME-COUNT DELTA: two derivations answer `count: 3` — one CUT from forty documents, one COMPLETE "
+ "over three — and `count` cannot tell them apart while `truncated` can",
  [cut3.count, whole3.count, cut3.truncated, whole3.truncated], [3, 3, true, false]);
t("SAME-COUNT DELTA: and `count === limit` is NOT the test either — it is true of BOTH here, so a "
+ "consumer inferring truncation from the arithmetic gets it wrong on the complete answer",
  [cut3.count === cut3.limit, whole3.count === whole3.limit], [true, true]);

console.log("\n--- LIVE: the clamp, the doors, and the inverse of the quadratic ---");
const over = await POST("op=connect&token=mem-r66", { entityId: SMALL, limit: 99999 });
t("op=connect: an over-ask is answered at the CEILING and the ceiling is what is published — echoing "
+ "99999 back would be a second way of lying about the same fact",
  [over.limit, over.document_limit], [5000, 100]);
const viaQuery = await POST(`op=connect&token=mem-r66&limit=2`, { entityId: BIG });
t("op=connect: the bound is reachable from the QUERY STRING as well as the body — this op has two "
+ "real doors (the surface POSTs a body, a probe passes `&id=`) and a bound only one of them could "
+ "ask for would be half a bound",
  [viaQuery.limit, viaQuery.document_limit, viaQuery.count], [2, 2, 1]);
const viaId = await POST(`op=connect&token=mem-r66&id=${SMALL}`, {});
t("op=connect: and the ENTITY is still reachable from `&id=` with an empty body — the door this op "
+ "shipped with, unmoved",
  [viaId.ok, viaId.entity_id, viaId.count], [true, SMALL, 3]);
const inverse = [];
for (const n of [1, 2, 3, 10, 100, 500, 5000]) {
  const r = await POST("op=connect&token=mem-r66", { entityId: SMALL, limit: n });
  inverse.push([n, r.limit, r.document_limit]);
}
t("THE INVERSE OF THE QUADRATIC, driven rather than argued: for every bound the plane accepts, the "
+ "documents admitted form NO MORE pairs than the bound — and one more document would form MORE, so "
+ "it is the largest honest figure and not a cautious one",
  inverse.map(([, lim, d]) => [(d * (d - 1)) / 2 <= lim, ((d + 1) * d) / 2 > lim]),
  inverse.map(() => [true, true]));
t("THE INVERSE OF THE QUADRATIC: and the pairs the ceiling admits are 4,950 against a 5,000 bound — "
+ "MEASURED at 798 bytes and 65ms per derivation at that size (test/connections-growth.measure.mjs, "
+ "2026-08-08), which is the figure the ceiling was chosen from rather than a round number",
  inverse.find(([n]) => n === 5000).slice(1), [5000, 100]);

/* ==========================================================================
 * OVER-STRICTNESS, at the WALK. A classifier that calls everything a defect is as
 * useless as one that finds nothing, and this class is AMPLIFICATION rather than SIZE.
 * ========================================================================== */
console.log("\n--- OVER-STRICTNESS: shapes that are NOT this class must be graded out ---");
const NOT_THE_CLASS = [
  /* A LINEAR read over an unbounded scan. It is REC-60's class and not this one: the answer
     may be enormous, but the work is one pass. Calling it this class would make the roster
     unholdable, which is PL-15's finding one instrument over. */
  ["ncLinear", `  ncLinear({ id } = {}) {
    const rows = this.#rows(\`SELECT a FROM t WHERE id=?\`, id);
    return { ok: true, count: rows.length, rows: rows.map((r) => r.a) };
  }`],
  /* Nested loops, but over a BOUNDED scan — the fix's shape. */
  ["ncBoundedNest", `  ncBoundedNest({ id, cap } = {}) {
    const rows = this.#rows(\`SELECT a FROM t WHERE id=? LIMIT ?\`, id, cap);
    for (const x of rows) for (const y of rows) this.sql.exec(\`INSERT INTO p VALUES (?,?)\`, x.a, y.a);
    return { ok: true, count: rows.length };
  }`],
  /* Quadratic work over a CALLER-SUPPLIED array and no scan at all. Unbounded input is a
     different defect with a different fix (a refusal, as op=suggest's caps are), and this
     walk deliberately reaches no verdict on it. */
  ["ncNoScan", `  ncNoScan({ items } = {}) {
    for (const x of items) for (const y of items) this.sql.exec(\`INSERT INTO p VALUES (?,?)\`, x, y);
    return { ok: true, count: items.length };
  }`],
];
for (const [name, src] of NOT_THE_CLASS)
  t(`OVER-STRICTNESS: \`${name}\` is NOT in the class, and the reason is in this file's header`,
    classMembers(`class Z {\n${src}\n  end() { return 1; }\n}`).has(name), false);
/* And the classifier must still SEE the class in a phrasing this file never wrote — an
   over-strictness block that only rejects proves nothing about what it accepts. */
const ALT_MEMBER = `  ncPerRow({ id } = {}) {
    const hits = this.#rows(\`SELECT k FROM t WHERE id=?\`, id);
    const keys = hits.map((h) => h.k);
    const out = keys.map((k) => this.#rows(\`SELECT v FROM u WHERE k=? LIMIT ?\`, k, 10));
    return { ok: true, count: out.length, out };
  }`;
t("OVER-STRICTNESS (the other direction): a per-row SCAN off an unbounded scan — a query per row, "
+ "phrased with `.map` and never a `for` — IS in the class, so the arms above measure the property "
+ "and not the spelling",
  classMembers(`class Z {\n${ALT_MEMBER}\n  end() { return 1; }\n}`).has("ncPerRow"), true);

await mf.dispose();

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
