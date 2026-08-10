/* NEGATIVE CONTROL: REC-56, RUN 2026-08-05 (rec56-agent). FIVE ARMS, each broken ALONE against the FINAL files, each re-run against those final files so every count agrees with the file it names, and every file restored BYTE-IDENTICALLY with sha256 compared before and after: checks/bio-checks.mjs 87b4c9cea2af41f7… (this file's own sha is not quoted, because a file cannot state its own). WHOLE = 39 pass, 0 fail.  (a) RESTORE `return the bundle to collected` — put the old string back over C-18.8's unsigned-release arm -> **5 FAIL**, and A1 names the check, the line and the transition in its own words: `C-18.8@4853: directs a move to 'collected', which no transition in the information machine enters`, with A2 adding `directs a move to 'collected' without naming a legal edge that reaches it`. The three REACH arms fail TOO and they fail AS DELTAS — `[0,1,true]` becomes `[1,2,true]` — because the real corpus now carries an offender, which is the delta doing exactly its job rather than an extra failure.  (a2) THE SAME STRING RESTORED AT THE REACH ANCHOR instead -> the three direct assertions fail first (A1, A2, and the behavioural `NOT ONE of its repairs still says 'to collected'`) and then **the planter THROWS BY DESIGN** — `REACH ARM BROKEN (A1): the anchor text is not in checks/bio-checks.mjs, so this arm would score a delta against nothing` — rather than report a meaningless zero. REC-54's and REC-55's precedent, and the arms behind it are unrun rather than silently green; reported rather than smoothed.  (b) NEUTER THE WALK — `repairStrings` returns `[]` -> **29 pass, 10 FAIL**, and THE FINDING IS WHAT STAYED GREEN: **all five direct judgements A1, A2, A3, A4 and A5 PASSED AT ZERO COST over a walk covering nothing.** That is the nine-sighting failure mode reproduced inside the instrument built to prevent it. Only the six REACH deltas and the two coverage assertions bit. It is the whole argument for asserting reach as a delta and never as an absolute.  (c) DROP ONE D-206 CODE — remove `'chain-empty'` from C-18.9's empty-chain arm -> **2 FAIL**, one at EACH LAYER: `LAYER 1: a chain recorded and empty is coded differently` in the catalogue and `LAYER 2: and tallyDetail says WHICH THREE FACTS they are` at `op=audit`. Both are asserted because the code is minted in one file and consumed in another and the two can diverge — VERIFICATION.md 3a, and REC-54's own receipt for a rule enforced at one layer and silent at the other.  (d) THE POLARITY ARM, over-strictness in the other direction — swap a corrected string for a DIFFERENT but genuinely reachable repair, `'or move it to retired instead (verified -> retired, op=retire)'`, which is the PHRASE form of a directive rather than the arrow form -> **39 pass, 0 fail**. The pins go RED for the defect and GREEN for a correct alternative, including one phrased unlike anything this item wrote. Corrected three times in four items this week; checked here. */
/* REC-56 / D-203 — A REPAIR STRING MUST NAME AN ACT THAT CAN ACTUALLY BE DONE.
 *
 * THE DEFECT, measured by REC-54 and routed here. `checks/bio-checks.mjs` told
 * an operator, in five places, to "return the bundle to collected" or "set
 * current_state to collected". `STATES.information.edges` is
 * `{ collected: ['verified'], verified: ['retired'], retired: [] }` — there is
 * no `verified -> collected` edge — and C-4.2 refuses the move BY NAME. So the
 * catalogue's own advice produced a SECOND error on top of the first, which is
 * worse than no advice: it spends the operator's trust and leaves them further
 * from a clean record than when they started.
 *
 * MEASURED HERE AND NOT PREDICTED BY THE ROUTING: the advice was unfollowable in
 * BOTH readings, not one. Appending the transition fires C-4.2's edge arm;
 * setting `current_state` without appending fires C-4.2's agreement arm
 * (`current_state 'collected' disagrees with last transition to 'verified'`).
 * There was no careful way to comply.
 *
 * WHAT THE SWEEP FOUND BEYOND THE FOUR STRINGS IT WAS SENT FOR — the brief
 * predicted four and there are SEVEN sites in THREE machines, and the extra
 * three are a different and harder shape:
 *
 *   1. C-2.8 `checkPublishedExtension` advised "move the inquiry back to
 *      concluded". `published: ['open', 'surfaced']` — that edge does not
 *      exist. Same class as `collected`, a different machine.
 *   2. C-2.8 `checkDividedExtension` advised "move the inquiry back to open"
 *      from `divided`, which is `[]` — TERMINAL, and terminal structurally
 *      rather than by policy.
 *   3. C-2.8 `checkConcludedExtension` advised "move the inquiry back to open"
 *      from `concluded`, AND THAT EDGE IS LEGAL. The state machine permits it.
 *      THE OP SURFACE REFUSES IT BY NAME: `REOPENABLE_FROM` is
 *      `[...DISPOSITIONS, "published"]`, `deriveActs` does not publish `reopen`
 *      on a concluded inquiry, and `store.reopen()` answers NOT_SET_DOWN.
 *      **A walk that read repair strings against `STATES` alone would have
 *      passed this one.** It is the reason this suite asks TWO questions of
 *      every move directive — is the edge in the machine, and is there an act
 *      that travels it — rather than one.
 *
 * `src/affordances.mjs` already states the principle from the other side, on
 * REOPENABLE_FROM: *"an act the catalog permits that no caller can perform is
 * the state machine lying."* This item is that sentence read backwards.
 *
 * NOTHING HERE RULES ON DEC-56, and it is built so it cannot. DEC-56 asks
 * whether the record may un-say a verification (a `verified -> collected`
 * retraction edge) or must carry the doubt at `verified`. Every assertion below
 * DERIVES what is reachable from `STATES` and `deriveActs` at the moment it
 * runs, so if Bob rules a retraction route, the walk permits a repair naming it
 * WITHOUT ONE LINE CHANGING HERE — and if he rules the other way, the strings
 * stay exactly as true as they are today. The corrected strings state the
 * FENCE (C-4.2 refuses a transition that is not an edge in this machine) rather
 * than an inventory of routes, because the fence holds under either answer and
 * an inventory would go stale on the day of the ruling.
 *
 * WHAT THIS SUITE HOLDS THE CATALOGUE TO:
 *   A1  a repair that directs an object INTO a state must name a state its
 *       machine can be entered at all;
 *   A2  it must name the EDGE it is using, and that edge must be legal;
 *   A3  it must name the ACT, and `deriveActs` must offer that act at the FROM
 *       state — the op-surface half, which A1 and A2 cannot see;
 *   A4  every `X -> Y` written in ANY repair string, directive or not, must be
 *       a legal edge somewhere in the catalogue's own tables;
 *   A5  every `op=<id>` named anywhere in a repair must be an op the control
 *       plane actually declares.
 *
 * AND WHAT IT DELIBERATELY DOES NOT COVER, stated rather than left to be
 * discovered (D-209): the walk judges MOVE DIRECTIVES. A repair that names an
 * op WITHOUT directing a state move is checked for EXISTENCE (A5) and not
 * against the state its arm is guarded on — that would need the guard state
 * extracted statically from the enclosing `current_state === '...'`, which is
 * not built here. Two such strings were read BY HAND in this item and left
 * standing on purpose, because both state where an artefact legitimately COMES
 * FROM rather than directing an act now: `publish through op=publish, which
 * stamps the edition` (C-2.8, on a document already published) and `divide
 * through op=inquirydivide, which authors the block` (C-2.8, on a document
 * already divided). They are C-20.1's `re-produce the creation at collected`
 * shape, and reading them as directives would be the instrument measuring the
 * prose rather than the plane.
 *
 * THE REACH OF EVERY WALK IS ASSERTED AS A DELTA, never as an absolute, by
 * MECHANICALLY PLANTING a defect into a COPY of the real source and requiring
 * the walk to find it there and not in the real one. A walk that covers nothing
 * passes everything, and that failure mode has nine sightings in this
 * repository — including one at REC-55's own site, where three direct
 * assertions passed at zero cost over walks matching nothing.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle, STATES, normalizeType } from "../checks/bio-checks.mjs";
import { deriveActs } from "../src/affordances.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const CHECKS = fileURLToPath(new URL("../checks/bio-checks.mjs", import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");
const shaHex = async (v) => sha(typeof v === "string" ? v : Buffer.from(v));
const sha512Hex = async (b) => new Uint8Array(createHash("sha512").update(Buffer.from(b)).digest());

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const CHECKS_SRC = readFileSync(CHECKS, "utf8");
const INDEX_SRC = readFileSync(SRC("index.mjs"), "utf8");

/* =====================================================================
   THE WALK — every repair string in the catalogue, with its check and line
   =====================================================================
   A hand-written scanner rather than a regex, because a repair array holds
   apostrophes, brackets and template literals and a regex over that is the
   kind of instrument that quietly matches nothing. It tracks quote state and
   BLOCK-COMMENT state: REC-55 measured a walk reading a CONTINUATION LINE of a
   real comment as code, and fixed the walk rather than rewording the comment,
   which is the precedent this follows.

   Reads are defensive throughout (D-93's class inside one suite, reproduced at
   REC-55's own site): a control that dies at the first surprise hides every arm
   behind it, so nothing here indexes into a value it has not proved is there. */
function repairStrings(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    /* Skip a block comment wholesale, so a `f(` written inside prose is never
       read as a call — the REC-55 correction. */
    if (src.startsWith("/*", i)) { const e = src.indexOf("*/", i + 2); i = e === -1 ? src.length : e + 2; continue; }
    if (src.startsWith("//", i)) { const e = src.indexOf("\n", i); i = e === -1 ? src.length : e + 1; continue; }
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") { i = skipString(src, i); continue; }
    if (c !== "f" || src[i + 1] !== "(") { i++; continue; }
    if (i > 0 && /[A-Za-z0-9_$.]/.test(src[i - 1])) { i++; continue; }
    const call = readCall(src, i + 1);
    if (!call) { i++; continue; }
    const args = call.args;
    if (args.length >= 4) {
      const check = (args[0] || "").trim().replace(/^['"`]|['"`]$/g, "");
      for (const s of stringLiterals(args[3] || "")) {
        out.push({ check, line: src.slice(0, i).split("\n").length, text: s });
      }
    }
    i = call.end;
  }
  return out;
}

function skipString(src, i) {
  const q = src[i];
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === "\\") { j++; continue; }
    if (src[j] === q) return j + 1;
  }
  return src.length;
}

/* Balanced-paren read of one f(...) call, splitting top-level arguments. */
function readCall(src, open) {
  let depth = 0, bracket = 0, cur = "", args = [];
  for (let j = open; j < src.length; j++) {
    const c = src[j];
    if (c === '"' || c === "'" || c === "`") { const e = skipString(src, j); cur += src.slice(j, e); j = e - 1; continue; }
    if (src.startsWith("/*", j)) { const e = src.indexOf("*/", j + 2); j = (e === -1 ? src.length : e + 1); continue; }
    if (c === "(") { depth++; if (depth === 1) continue; }
    if (c === ")") { depth--; if (depth === 0) { args.push(cur); return { args, end: j + 1 }; } }
    if (c === "[" || c === "{") bracket++;
    if (c === "]" || c === "}") bracket--;
    if (c === "," && depth === 1 && bracket === 0) { args.push(cur); cur = ""; continue; }
    cur += c;
  }
  return null;
}

/* The individual string literals out of a repairs array literal, with escapes
   resolved so `\'` in `member's` does not truncate the string being judged. */
function stringLiterals(chunk) {
  const out = [];
  for (let j = 0; j < chunk.length; j++) {
    const c = chunk[j];
    if (c !== '"' && c !== "'" && c !== "`") continue;
    const e = skipString(chunk, j);
    out.push(chunk.slice(j + 1, e - 1).replace(/\\(.)/g, "$1"));
    j = e - 1;
  }
  return out;
}

/* ---------------------------------------------------------------------
   The state vocabulary, DERIVED from STATES rather than written here.
   --------------------------------------------------------------------- */
const MACHINES = Object.keys(STATES);
const legalIn = (state) => MACHINES.filter((m) => (STATES[m].legal || []).includes(state));
const enterableIn = (m) => new Set(Object.values(STATES[m].edges || {}).flat());
const edgeLegal = (from, to) => MACHINES.some((m) => ((STATES[m].edges || {})[from] || []).includes(to));

/* A MOVE DIRECTIVE: an imperative that places an object in a named state. Both
   halves are required — a move verb AND a destination phrase — so that
   `re-produce the creation at collected` (C-20.1) is correctly NOT a directive
   on two independent grounds: `re-produce` is a creation verb and `at` is
   locative rather than directional. A creation entering an initial state is how
   objects begin; only a TRANSITION into one is the defect. That exclusion falls
   out of the rule rather than being carved out for the string, which is the
   difference between an instrument and a fitted one.

   Destinations are matched CASE-SENSITIVELY against the lowercase state
   vocabulary, which is load-bearing: `move claim to Open Questions` (C-8.1)
   names a document HEADING, not the inquiry state `open`, and a
   case-insensitive walk would report it as a defect forever. */
const MOVE_VERB = /\b(return|returns|returned|returning|revert|reverts|reverted|restore|restores|restored|move|moves|moved|moving|put|puts|send|sends|roll|rolls|rolled|reset|resets)\b|set\s+current_state/;
const DEST = /(?:\bback\s+)?\b(?:to|into)\s+'?([a-z_]+)'?/g;

/* A directive is recognised TWO ways, and the second was added after the first
   draft measured itself: once the corrected strings landed, NOT ONE repair in
   the catalogue matched verb-plus-destination any more, so A2 and A3 were
   passing over an empty set — the nine-sighting failure mode appearing inside
   the instrument built to prevent it, on this suite's own first run. The
   corrected strings do describe moves; they describe them as EDGES
   (`verified -> retired, op=retire`) rather than as English destinations. So an
   arrow whose target is a state is a directive too, and A2 (which exists to
   demand an arrow) is scoped to the phrase form, where alone it has work to do. */
function moveDirectives(strings) {
  const out = [];
  for (const r of strings) {
    const text = String(r && r.text || "");
    const seen = new Set();
    if (MOVE_VERB.test(text)) {
      for (const m of text.matchAll(DEST)) {
        const dest = m[1];
        if (!legalIn(dest).length) continue; // not a state name at all
        seen.add(dest);
        out.push({ ...r, dest, form: "phrase" });
      }
    }
    for (const [, to] of arrowsIn(text)) {
      if (!legalIn(to).length || seen.has(to)) continue;
      seen.add(to);
      out.push({ ...r, dest: to, form: "arrow" });
    }
  }
  return out;
}

/* The FROM state a repair names, and the act it names. Both are required of a
   directive by A2/A3, so the walk never has to guess either. */
const arrowsIn = (text) => [...String(text).matchAll(/\b([a-z_]+)\s*->\s*([a-z_]+)\b/g)].map((m) => [m[1], m[2]]);
const opsIn = (text) => [...String(text).matchAll(/\bop=([a-z]+)\b/g)].map((m) => m[1]);

/* The op-surface oracle, and it is the plane's OWN published derivation rather
   than a list kept here. The probe facts are the MOST PERMISSIVE non-state
   facts the shape allows — no live citations, one basis leg, nothing rested on
   — so an act can only be absent from the answer for a STATE reason. Anything
   else would let a fixture detail masquerade as an unreachable act. */
const probeFacts = (machine, state) => ({
  ok: true, object_type: normalizeType(machine), declared_type: machine, current_state: state,
  cites_in: { confirmed: [], severed: [] }, cites_out: { confirmed: 0, severed: 0 },
  /* REC-72: `cited_by_case` is what `sever`/`reinstate` are now derived over.
     Stated rather than left to the rule's `?? 0` default — see the arm below
     that asserts `actsAt` did not silently swallow a throw. */
  cited_by_case: { confirmed: 0, severed: 0 },
  basis_legs: 1, rested_on: { working: 0, frozen: 0, severed: 0 },
});
/* THE SWALLOW IS RECORDED, NOT SILENT (REC-72, and it is a finding about this
   instrument rather than about its subject). This helper used to be
   `try { … } catch { return []; }`. When REC-72 added a fact the probe object
   did not carry, `deriveActs` threw a TypeError on EVERY call, the catch turned
   it into "the plane offers no act at any state", and A3 then reported SIX
   offenders that do not exist — a wrong number, which is harder to notice than
   a zero. The catch is kept, because a throw here must not take the suite's
   other judgements down with it, but every throw is now COUNTED and the foot of
   the file asserts the count is zero. */
const ACTS_THREW = [];
const actsAt = (machine, state) => {
  try { return deriveActs(probeFacts(machine, state)).map((a) => a.id); }
  catch (e) { ACTS_THREW.push(`${machine}@${state}: ${e && e.message}`); return []; }
};

const DECLARED_OPS = new Set([...INDEX_SRC.matchAll(/^ {2}([a-z][a-z0-9]*):\s*\{\s*classes:/gm)].map((m) => m[1]));

/* ---------------------------------------------------------------------
   The five judgements, each returning the OFFENDERS it found so a failure
   names the check and the transition rather than reporting a bare count.
   --------------------------------------------------------------------- */
const a1Offenders = (strings) => moveDirectives(strings)
  .filter((d) => !legalIn(d.dest).some((m) => enterableIn(m).has(d.dest)))
  .map((d) => `${d.check}@${d.line}: directs a move to '${d.dest}', which no transition in the ${legalIn(d.dest).join("/")} machine enters`);

const a2Offenders = (strings) => moveDirectives(strings)
  .filter((d) => d.form === "phrase")
  .filter((d) => !arrowsIn(d.text).some(([from, to]) => to === d.dest && edgeLegal(from, to)))
  .map((d) => `${d.check}@${d.line}: directs a move to '${d.dest}' without naming a legal edge that reaches it`);

const a3Offenders = (strings) => moveDirectives(strings).flatMap((d) => {
  const edge = arrowsIn(d.text).find(([from, to]) => to === d.dest && edgeLegal(from, to));
  if (!edge) return []; // A2 already reports this one; do not double-count
  const named = opsIn(d.text);
  const machine = legalIn(d.dest).find((m) => ((STATES[m].edges || {})[edge[0]] || []).includes(d.dest));
  const offered = machine ? actsAt(machine, edge[0]) : [];
  const ok = named.some((op) => offered.includes(op));
  return ok ? [] : [`${d.check}@${d.line}: ${edge[0]} -> ${edge[1]} names {${named.join(",") || "no act"}}, but the plane offers {${offered.join(",") || "nothing"}} at '${edge[0]}'`];
});

const a4Offenders = (strings) => strings.flatMap((r) => arrowsIn(r.text)
  .filter(([from, to]) => legalIn(from).length && legalIn(to).length && !edgeLegal(from, to))
  .map(([from, to]) => `${r.check}@${r.line}: writes '${from} -> ${to}', which is not an edge in any machine`));

const a5Offenders = (strings) => strings.flatMap((r) => opsIn(r.text)
  .filter((op) => !DECLARED_OPS.has(op))
  .map((op) => `${r.check}@${r.line}: names op=${op}, which the control plane does not declare`));

/* =====================================================================
   (1) THE CATALOGUE AS IT STANDS
   ===================================================================== */
console.log("\n--- every repair string in the catalogue names an act that can be performed ---");
const REAL = repairStrings(CHECKS_SRC);
/* Reported, never gated — the register's own posture for arm counts. A corpus
   that SHRANK is the thing worth seeing, and a floor on it would be strictness
   this instrument cannot justify. */
console.log(`  corpus: ${REAL.length} repair strings across ${new Set(REAL.map((r) => r.check)).size} checks · `
  + `${moveDirectives(REAL).length} move directives`);

t("the walk reads the catalogue at all (a walk covering nothing passes everything)",
  REAL.length > 100, true);
t("and it reaches the check families this item corrected",
  [...new Set(REAL.map((r) => r.check))].filter((c) => ["C-18.1", "C-18.8", "C-18.9", "C-2.8"].includes(c)).sort(),
  ["C-18.1", "C-18.8", "C-18.9", "C-2.8"]);

t("A1 · no repair directs a move into a state no transition enters", a1Offenders(REAL), []);
t("A2 · every move directive names the legal edge it travels", a2Offenders(REAL), []);
t("A3 · every move directive names an act the plane offers at the FROM state", a3Offenders(REAL), []);
t("A4 · every edge written in a repair string is legal in some machine", a4Offenders(REAL), []);
t("A5 · every op named in a repair string is one the control plane declares", a5Offenders(REAL), []);

/* The structural facts the corrections rest on. These are RELATIONS and not
   rulings: none of them asserts what DEC-56 should decide, and each is read out
   of the tables rather than written down, so the day a table changes these move
   with it instead of going quietly stale. */
console.log("\n--- the tables the corrections were derived from ---");
t("`collected` is entered by no transition in the information machine (the D-203 fact)",
  enterableIn("information").has("collected"), false);
t("and `retired` IS, which is why op=retire is the act the corrected strings name",
  enterableIn("information").has("retired"), true);
t("`divided` is terminal, so no repair can move an inquiry off it",
  (STATES.inquiry.edges.divided || []).length, 0);
t("`published -> concluded` is not an edge, and `published -> open` is",
  [edgeLegal("published", "concluded"), edgeLegal("published", "open")], [false, true]);
t("THE OP-SURFACE HALF: `concluded -> open` is a LEGAL edge that NO act travels",
  [edgeLegal("concluded", "open"), actsAt("inquiry", "concluded").includes("reopen")], [true, false]);
t("while at `published` the same act IS offered, so the corrected C-2.8 string names a real route",
  actsAt("inquiry", "published").includes("reopen"), true);
t("and at `verified` the plane offers retire", actsAt("information", "verified").includes("retire"), true);

/* =====================================================================
   (2) THE CORRECTED STRINGS, THROUGH THE CHECKS THEMSELVES
   =====================================================================
   Source text is not behaviour. These drive the real catalogue over real
   bundles so the repairs an operator actually receives are the corrected ones. */
console.log("\n--- the findings an operator receives carry the corrected advice ---");

const bundleMd = (id, extra = "") =>
  `---\nid: ${id}\nobject_type: information\ncurrent_state: verified\nprior_state: collected\n`
  + `state_history:\n  - timestamp: "2026-07-20T00:00:00Z"\n    from_state: collected\n    to_state: verified\n`
  + `    blurb: "b"\n    author: "class:daemon"\n${extra}---\n\n# ${id}\n`;

const runChecks = async (files) => (await checkBundle({
  folderName: "INFO-2026-0099-x", files, sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true,
})).findings;

{
  const files = new Map([
    ["bundle.md", bundleMd("INFO-2026-0099-x")],
    ["data/provenance.json", JSON.stringify({ documents: [{
      file: "snapshots/a.pdf", capture: { method: "daemon-fetch", grade: "B", actor_class: "daemon" },
      origin: { kind: "sweep", matched_sweep: "s", deeming_actor: "a" },
      provenance_chain: [{ who: "us" }], authority_state: "undetermined", authority_basis: "x",
    }] })],
  ]);
  const found = await runChecks(files);
  const c181 = found.filter((x) => x.check === "C-18.1" && Array.isArray(x.repairs));
  const all = c181.flatMap((x) => x.repairs).join(" | ");
  t("C-18.1 fires on the machine-authored release and the sweep fence", c181.length >= 1, true);
  t("and NOT ONE of its repairs still says 'to collected'", /to collected/.test(all), false);
  t("while it does name op=retire with the edge it travels",
    /verified -> retired/.test(all) && /op=retire/.test(all), true);
}

{
  const inq = (state, extra) => new Map([["bundle.md",
    `---\nid: INQ-2026-0001-x\nobject_type: inquiry\ncurrent_state: ${state}\nprior_state: null\n`
    + `state_history: []\n${extra || ""}---\n\n# q\n`]]);

  const conc = (await checkBundle({ folderName: "INQ-2026-0001-x", files: inq("concluded"),
    sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true })).findings
    .filter((x) => x.check === "C-2.8" && Array.isArray(x.repairs)).flatMap((x) => x.repairs).join(" | ");
  t("C-2.8 at `concluded` no longer advises the move op=reopen refuses",
    /back to open/.test(conc), false);
  t("and it says WHY, so the operator is not left guessing", /NOT_SET_DOWN/.test(conc), true);

  const div = (await checkBundle({ folderName: "INQ-2026-0002-x", files: inq("divided"),
    sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true })).findings
    .filter((x) => x.check === "C-2.8" && Array.isArray(x.repairs)).flatMap((x) => x.repairs).join(" | ");
  t("C-2.8 at `divided` no longer advises a move off a terminal state",
    /back to open/.test(div), false);

  const pub = (await checkBundle({ folderName: "INQ-2026-0003-x", files: inq("published"),
    sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true })).findings
    .filter((x) => x.check === "C-2.8" && Array.isArray(x.repairs)).flatMap((x) => x.repairs).join(" | ");
  t("C-2.8 at `published` no longer advises the edge the machine lacks",
    /back to concluded/.test(pub), false);
  t("and names the route that DOES exist, with its edge and its act",
    /published -> open/.test(pub) && /op=reopen/.test(pub), true);
}

/* =====================================================================
   (3) D-206 — THE AUDIT TALLY CARRIES THE DISTINCTION, AT BOTH LAYERS
   =====================================================================
   REC-54 split one C-18.9 finding into three because they are three different
   facts about the record. The tally is keyed by CHECK ID, so all three landed
   on `C-18.9` and reached a reader only through the offender detail, bounded at
   20 bundles against a page of up to 1,000 — the conflation re-created in the
   report after being removed from the data.
   Decided inside this item: the tally carries it, through an optional `code` on
   the finding and a derived `tallyDetail` beside `tally`. The code is minted in
   the CATALOGUE and consumed in the STORE, and the two can diverge, so both are
   asserted (VERIFICATION.md 3a, and REC-54's own receipt for a rule enforced at
   one layer and silent at the other). */
console.log("\n--- D-206: the three chain facts are distinguishable in the REPORT, not only in the data ---");

const provDoc = (chain) => {
  const d = { file: "snapshots/a.pdf", capture: { method: "daemon-fetch", grade: "B", actor_class: "daemon" },
              origin: { kind: "direct" }, authority_state: "undetermined", authority_basis: "x" };
  if (chain !== undefined) d.provenance_chain = chain;
  return d;
};

{
  const codeFor = async (chain) => {
    const files = new Map([
      ["bundle.md", bundleMd("INFO-2026-0099-x")],
      ["data/provenance.json", JSON.stringify({ documents: [provDoc(chain)] })],
    ]);
    return (await runChecks(files)).filter((x) => x.check === "C-18.9").map((x) => x.code);
  };
  t("LAYER 1, the catalogue: a chain never recorded is coded", await codeFor(undefined), ["chain-absent"]);
  t("LAYER 1: a chain recorded and empty is coded differently", await codeFor([]), ["chain-empty"]);
  t("LAYER 1: a chain field that is not a chain is coded differently again", await codeFor(null), ["chain-not-an-array"]);

  const codes = REAL.length && CHECKS_SRC.match(/'chain-[a-z-]+'/g) || [];
  t("and every code is unique within its check, so a second arm cannot reuse a first arm's",
    codes.length === new Set(codes).size, true);
  t("codes are stable-shaped (lowercase kebab), so the key space cannot drift into prose",
    codes.every((c) => /^'[a-z]+(-[a-z]+)*'$/.test(c)), true);
}

const STORE = SRC("store.mjs");
const mf = new Miniflare({
  modules: true, script: readFileSync(STORE, "utf8"),
  modulesRoot: "/", scriptPath: STORE,
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const scall = async (p, body) => (await (await mf.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json()).result;

{
  const NOW = "2026-08-05T00:00:00Z";
  const mk = async (id, chain) => {
    const body = `---\nid: ${id}\nobject_type: information\nschema: information@2\ntitle: "T"\n`
      + `current_state: verified\nprior_state: null\ncreated: "${NOW}"\nlast_updated: "${NOW}"\n`
      + `state_history: []\ngroup: believe-in-oakland\nreferences: []\n---\n\n## Summary\n\nX.\n`;
    const prov = JSON.stringify({ documents: [provDoc(chain)] }, null, 2);
    await scall("/promote", {
      bundleId: id, base: null, snapKey: "20260805T000000Z_aaaa1111", author: "m-riley",
      meta: { object_type: "information", group: "believe-in-oakland", title: "T",
              current_state: "verified", created: NOW, last_updated: NOW },
      files: [
        { path: "bundle.md", text: body, bytes: body.length, sha256: sha(body) },
        { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
      ],
      register: [],
    });
  };
  await mk("INFO-2026-0031-absent", undefined);
  await mk("INFO-2026-0032-empty", []);
  await mk("INFO-2026-0033-notarray", null);

  const a = await scall("/audit?viewer=class:member") || {};
  const tally = a.tally || {};
  const detail = a.tallyDetail || {};
  t("LAYER 2, op=audit: the tally still says only how many C-18.9 errors there are",
    tally["C-18.9"], 3);
  t("LAYER 2: and tallyDetail says WHICH THREE FACTS they are",
    [detail["C-18.9/chain-absent"], detail["C-18.9/chain-empty"], detail["C-18.9/chain-not-an-array"]],
    [1, 1, 1]);
  t("the existing tally shape is untouched, so every existing reader keeps what it reads",
    typeof tally["C-18.9"] === "number" && !("tallyDetail" in tally), true);
}

/* =====================================================================
   (4) REACH, AS A DELTA — the guard MECHANICALLY PLANTED into a COPY
   =====================================================================
   Every assertion in block (1) passed. That is worth exactly nothing until the
   walk is shown to FAIL on the real defect, because a walk matching nothing
   passes everything. Each arm below takes the REAL catalogue source, plants
   back a string this item removed (or a fresh one of the same class), and
   requires the SAME judgement to fire there and stay silent on the real file —
   a delta, never an absolute. The planter refuses to score an arm whose anchor
   text is absent, so a stale fixture cannot report a meaningless zero. */
console.log("\n--- REACH: each judgement fails on a planted defect and not on the real catalogue ---");

const plant = (why, anchor, replacement) => {
  if (!CHECKS_SRC.includes(anchor)) {
    throw new Error(`REACH ARM BROKEN (${why}): the anchor text is not in checks/bio-checks.mjs, so this arm `
      + `would score a delta against nothing. Fix the anchor rather than the assertion.`);
  }
  return CHECKS_SRC.replace(anchor, replacement);
};

{
  /* (i) the exact string the item removed, put back. */
  const anchor = "'retire this bundle with the reason recorded (verified -> retired, op=retire), if the release cannot stand as it is'";
  const armed = plant("A1", anchor, "'return the bundle to collected pending member ratification'");
  const got = a1Offenders(repairStrings(armed));
  t("REACH A1, as a delta: restore `return the bundle to collected` and A1 names it",
    [a1Offenders(REAL).length, got.length, /C-18\.1/.test(got[0] || "") && /collected/.test(got[0] || "")],
    [0, 1, true]);
}

{
  /* (ii) a move directive onto a state that IS enterable but by an edge that
     does not exist — A1 cannot see this one and A2 must. */
  const anchor = "'author completeness.statement and the exclusion list'";
  const armed = plant("A2", anchor, "'move the inquiry back to concluded'");
  const got = a2Offenders(repairStrings(armed));
  t("REACH A2, as a delta: an unnamed edge fires A2 while A1 stays silent",
    [a2Offenders(REAL).length, got.length, a1Offenders(repairStrings(armed)).length], [0, 1, 0]);
}

{
  /* (iii) THE OP-SURFACE ARM, and it is the one that matters most: a LEGAL edge
     that no act travels. A1 and A2 both pass it. Only A3 bites. */
  const anchor = "'author the conclusion where the document stands: reopening does not pick a concluded inquiry back up (op=reopen answers NOT_SET_DOWN), so there is no act that undoes the conclusion and the repair is made in place'";
  const armed = plant("A3", anchor, "'move the inquiry back to open (concluded -> open, op=reopen)'");
  const strings = repairStrings(armed);
  const got = a3Offenders(strings);
  t("REACH A3, as a delta: a LEGAL edge with no act fires A3 and NOTHING ELSE",
    [a3Offenders(REAL).length, got.length, a1Offenders(strings).length, a2Offenders(strings).length],
    [0, 1, 0, 0]);
  t("and A3 names the act the plane refuses, not a bare count",
    /concluded -> open/.test(got[0] || "") && /reopen/.test(got[0] || ""), true);
}

{
  /* (iv) an illegal edge written in a repair that is NOT a directive. */
  const anchor = "'record the release under one identity'";
  const armed = plant("A4", anchor, "'the retired -> collected transition is recorded'");
  t("REACH A4, as a delta: an illegal edge in non-directive prose still fires",
    [a4Offenders(REAL).length, a4Offenders(repairStrings(armed)).length], [0, 1]);
}

{
  /* (v) an op that does not exist. */
  const anchor = "'restore the registry root signature'";
  const armed = plant("A5", anchor, "'restore it through op=unverify'");
  t("REACH A5, as a delta: an op the control plane never declared fires",
    [a5Offenders(REAL).length, a5Offenders(repairStrings(armed)).length], [0, 1]);
}

{
  /* (vi) THE WALK ITSELF. Neuter the extractor and every judgement above
     passes at zero cost — the failure mode this whole block exists for, with
     nine sightings in this repository. */
  const blind = [];
  t("REACH of the WALK, as a delta: with the extractor returning nothing, all five judgements pass",
    [a1Offenders(blind).length, a2Offenders(blind).length, a3Offenders(blind).length,
     a4Offenders(blind).length, a5Offenders(blind).length].every((n) => n === 0), true);
  t("which is why the walk's own coverage is asserted rather than assumed",
    [REAL.length > 100, moveDirectives(REAL).length > 0], [true, true]);
  t("and A3 in particular runs over REAL strings, not only planted ones",
    moveDirectives(REAL).filter((d) => opsIn(d.text).length).length > 0, true);
}

/* REC-72: THE ORACLE ANSWERED, IT DID NOT MERELY FAIL TO OBJECT. Every A3
   judgement above rests on `actsAt`, and `actsAt` returns the same empty list
   for "this state offers nothing" as it would for "the derivation crashed". The
   two are different claims and this arm is what keeps them apart. */
t("the act oracle never threw: A3's answers are the plane's derivation and not a swallowed crash",
  ACTS_THREW, []);

await mf.dispose();
console.log(`\nrepair-reachability: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
