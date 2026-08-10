/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/refusal-wire.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (PL-3's, PL-4's, PL-11's and REC-73's precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in the shared scratchpad, every restore is verified BY sha256 AND BY CONTENT (`cmp`) against a UNIQUELY-NAMED per-arm pristine copy, and a BASELINE arm runs first so a run in which every arm reports the same thing is distinguishable from a run in which the arms worked.
   DECLARED BEFORE ARMING — what MUST fail and what MUST NOT. Actual figures are written into the control driver's header when it runs, including any arm that came back other than declared.
   (a) BASELINE — nothing armed. MUST be green, and its assertion count is what every other arm's figure is read against.
   (b) THE SUBJECT, REMOVED — delete the `dec49Attach(o)` call from `json()` in `src/index.mjs`, leaving the helper defined and every refusal site untouched. MUST FAIL, naming the eleven fences and every other catalogued code that then arrives bare. This is the state `main` was in before D-262 and it is the arm that proves this suite watches the WIRE.
   (c) THE DIVERGENCE — a REAL refusal site (`MACHINE_CANNOT_CONCLUDE` in `src/store.mjs`) is given a translation the catalogue does NOT hold. MUST FAIL naming it. ONE arm testing TWO properties: that the grade is an EQUALITY against the row and not a presence check, and that the decoration FILLS rather than OVERWRITES — an overwriting decoration would silently correct the planted sentence into agreement and this arm would come back GREEN.
   (d) THE CATALOGUE WALK GOES BLIND — make the `_CHECKS$` family harvest match nothing in THIS FILE. MUST FAIL on the corpus FLOOR, before any membership claim is made over the empty set. A gate that passes over an empty corpus is this project's three-times-measured failure and the floor is the whole defence.
   (e) THE OP WALK GOES BLIND — neuter the `OPS` parse in THIS FILE. MUST FAIL on the op-corpus FLOOR for the same reason, and MUST NOT be able to report "0 violations" as good news.
   (f) A THIRTEENTH FENCE ARRIVES UNMEASURED — drop one code out of the harvested machine-fence set. MUST FAIL naming the code and the count (the set is harvested from `store.mjs`, never typed).
   (g) OVER-STRICTNESS, and it is the arm this file exists to survive: a REAL site is rewritten to carry its row itself, in a SHAPE THIS SUITE WAS NOT WRITTEN AROUND — the code spelled in `code` with NO `reason` at all, the row IMPORTED rather than hand-copied (an equality that costs nothing is not evidence), an extra key the grader has never seen. It MUST PASS. A grader that reports correct work as bare is worse than no grader, because it teaches the next author to route around it.
   RUN 2026-08-09 IN WORKTREE agent-a0afb13cbfcc0d6b9, THREE TIMES, and the figures are the ones the driver PRINTED. FIRST RUN (suite at 22 assertions): six of seven as declared — a GREEN 22/0, b RED 18/4, c RED 19/3, e RED 15/7, f RED 21/1, g GREEN 22/0. **ARM (d) CAME BACK `NO TALLY` RATHER THAN RED, AND IT IS RECORDED HERE RATHER THAN SMOOTHED: the arm was right and the INSTRUMENT was wrong.** A blind catalogue made every later block read `ROWS.get(code).translation` on `undefined`, so a `TypeError` ended the module while the tally read clean — WORKER.md's named failure, arriving inside the file built to find that class. Corrected in two ways at once (every `ROWS.get` read is null-tolerant, and a corpus below its floor HALTS at the floor with its tally printed) and RE-RUN: all seven as declared. THIRD RUN against the FINAL suite (23 assertions, after the static-class block landed) — re-run rather than adjusted on paper, because a figure carried forward across an edit is a figure nobody measured: **ALL SEVEN AS DECLARED — (a) GREEN 23/0 · (b) RED 19/4 · (c) RED 20/3 · (d) RED 1/2 · (e) RED 16/7 · (f) RED 22/1 · (g) GREEN 23/0**, all three files byte-identical to their pristine-of-record by sha256 and by `cmp`.
 * =========================================================================
 * refusal-wire.test.mjs — D-262. **THE RESPONSE, GRADED AGAINST THE CATALOGUE.**
 *
 * WHAT NOTHING ELSE DOES, AND IT IS THE WHOLE REASON THIS FILE EXISTS.
 *
 * `civicos-ui/check-refusal-codes.mjs` (VF-2, the DEC-49 guard) grades the SITE
 * against the CATALOGUE: does every refusable condition name a code, does every
 * code resolve to a row, is every governed span real. It says so itself — *"it
 * says nothing about a LIVE plane"*. `test/machinefences-dec49.test.mjs` grades
 * the CATALOGUE against its RENDERER. `test/machine-fences.test.mjs` (REC-73)
 * grades the FENCE against the ACT: each of the twelve refuses a machine by NAME
 * under a payload that would otherwise succeed.
 *
 * **NOT ONE OF THEM GRADES THE RESPONSE A CALLER ACTUALLY RECEIVES.** So a fence
 * could be perfectly declared, perfectly catalogued, pass every guard, refuse by
 * name under a complete payload — and still hand a member the bare string
 * `MACHINE_CANNOT_RELEASE`. That is exactly what eleven of the twelve did, for
 * as long as they have existed, with four instruments watching. **A mechanism
 * believed on its EXISTENCE rather than its BEHAVIOUR is this project's
 * most-repeated defect, and here the mechanism was a checker.**
 *
 * WHY THE CONSEQUENCE IS REAL AND NOT AESTHETIC. A counter-reading says a
 * consumer holding the catalogue can resolve a bare code, so the wire need not
 * carry the sentence. **The agent worker deliberately holds no catalogue.**
 * `agent-worker/src/index.mjs` says it three times in its own words — *"the
 * plane's refusal carries its C-number and its DEC-49 canned translation; this
 * member passes it through UNCHANGED"* — and it is right to: a component that
 * paraphrases a refusal is the thirteen-surfaces drift DEC-49 exists to close.
 * A pass-through that receives nothing passes nothing through. So for the one
 * consumer built since DEC-49, "the catalogue can resolve it" resolves nothing.
 *
 * ------------------------------------------------------------- WHAT IT DOES
 *
 * It drives the plane's OWN op surface and grades every refusal that comes back.
 *
 *   1. THE CATALOGUE, harvested by the `_CHECKS` suffix — the same rule the
 *      DEC-49 guard harvests by, so a family minted tomorrow is in the corpus
 *      with no edit here. FLOORED and PRINTED.
 *   2. THE OPS, parsed out of `index.mjs`'s own table. FLOORED and PRINTED.
 *      A hand list of ops would go stale the day a new one lands, which is the
 *      staleness that produced this defect in the first place.
 *   3. THE DRIVE. Every op the surface admits, called with an EMPTY payload,
 *      under a signed-in MEMBER and again under an `ai` credential whose
 *      declared scope names every mutating op a member reaches. An empty
 *      payload is not a weakness here: what is being graded is the ENVELOPE a
 *      refusal travels in, and a refusal that arrives is a refusal whatever
 *      provoked it. The machine fences sit ABOVE the payload complaints (that
 *      is what D-229 measured), so the machine pass reaches them.
 *   4. THE GRADE — **the gate**. Every refusal whose code has a catalogue row
 *      must carry `check` and `translation`, and they must EQUAL the row. Not
 *      "carry something": equal it, because a surface rendering a sentence the
 *      catalogue does not hold is DEC-8's defect wearing DEC-49's clothes.
 *   5. THE CENSUS — **reported, not gated**. Codes received with NO row are
 *      REC-64's remaining sweep, not this item's, and gating them here would
 *      fail on work somebody else is doing. **That is the boundary between the
 *      two items, drawn by the instrument rather than by an agreement.**
 *   6. WHAT IT COULD NOT CLASSIFY — printed BY NAME. A thing this walk does not
 *      understand must be named, never silently scored zero.
 *
 * WHAT THIS SUITE CAN AND CANNOT SEE, and the sentence is load-bearing:
 *   - IT CAN SEE any refusal that leaves the control plane through `json()` in
 *     an op response, at the top level or under the Durable Object's `result`.
 *   - IT CANNOT SEE a refusal returned as a raw `new Response(...)` (bytes,
 *     HTML, 204, the version string — measured: 7 such returns, none of them a
 *     refusal carrier); a refusal nested deeper than `result` (deliberately out
 *     of the decoration's reach too, and for the same reason: those are data);
 *     a refusal a payload richer than empty would be needed to provoke; or a
 *     refusal shape that does not say `ok: false`. The last of those is the
 *     interesting one and it is COUNTED and PRINTED rather than assumed absent.
 *   - IT IS NOT A LIVE PROBE. A green harness is not a serving build (D-108).
 * ========================================================================= */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as CHECK_CATALOGUE from "../checks/bio-checks.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);
const INDEX_SRC = readFileSync(SRC("index.mjs"), "utf8");
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* Comments blanked length-preservingly before any source walk: this file's
   subject is named in dozens of comments inside the spans it reads, and a walk
   over raw source would read a fence's own explanation as a refusal site. */
const decomment = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
  .replace(/(^|[^:])\/\/[^\n]*/gm, (m, p) => p + " ".repeat(m.length - p.length));
const STORE_BARE = decomment(STORE_SRC);

/* ====================================================================== 1
 * THE CATALOGUE — HARVESTED, FLOORED, PRINTED.
 * ==================================================================== */
console.log("\n=== D-262 · the RESPONSE a caller receives, graded against the catalogue ===");
console.log("\n--- 1. the catalogue, harvested by the `_CHECKS` suffix (the DEC-49 guard's own rule) ---");

const FAMILIES = Object.keys(CHECK_CATALOGUE).filter((k) => /_CHECKS$/.test(k)).sort();
/* code -> {check, translation, family}, plus every code seen more than once. */
const ROWS = new Map();
const DUPLICATED = [];
let untranslatedRows = 0;
for (const family of FAMILIES) {
  const rows = CHECK_CATALOGUE[family];
  if (!rows || typeof rows !== "object") continue;
  for (const [code, row] of Object.entries(rows)) {
    if (!row || typeof row !== "object") continue;
    if (typeof row.translation !== "string" || row.translation === "") { untranslatedRows++; continue; }
    if (ROWS.has(code)) { DUPLICATED.push(code); continue; }
    ROWS.set(code, { check: row.check ?? null, translation: row.translation, family });
  }
}
console.log(`    CORPUS: ${FAMILIES.length} DEC-49 families · ${ROWS.size} codes carrying a canned translation`);
console.log(`            ${untranslatedRows} catalogue entr(ies) in those families carry NO translation and are not gradable here`);

/* THE FLOOR IS THE DEFENCE, and it comes before every claim made over the set.
   A totality assertion that passed over an empty corpus is a thing this project
   has measured THREE TIMES.

   THE FIGURES ARE MEASURED, AND THEY AGREE WITH THE DEC-49 GUARD AT A COST.
   `civicos-ui/check-refusal-codes.mjs` floors at 16 families / 166 rows; this
   walk reported 16 / 166 on 2026-08-09 without being told either number. That
   agreement is NOT free and is therefore worth something: the guard PARSES
   `bio-checks.mjs` as text, and this IMPORTS the module and reads its exported
   objects. Two different mechanisms over one source agreeing is evidence; a hand
   copy of the guard's constants would have agreed for nothing.

   Floored AT the measured figures rather than below them, on purpose: these are
   the DEC-49 guard's own floor, so a family or row that vanishes fails there
   too, and this file adds a second reader rather than a second, laxer standard.
   It is not a ratchet on REC-64 — the sweep only ever ADDS rows. */
t("the catalogue walk found real families and did not go blind", FAMILIES.length >= 16, true);
t("the catalogue walk found real translated rows — the floor is asserted BEFORE anything is "
+ "claimed over the set, because a gate that passes over an empty corpus passes over anything",
  ROWS.size >= 166, true);
/* `dec49Attach` in index.mjs resolves a code against exactly this set, so a code
   living in two families would make the wire's answer depend on module order.
   The DEC-49 guard's arm A refuses a duplicated CHECK NUMBER; this is the same
   property one level over, on the CODE, and it is what the decoration rests on. */
t("no code is minted in two families — the property the one-place decoration rests on", DUPLICATED, []);

/* HALT ON A BLIND CORPUS, AND THIS LINE WAS EARNED BY THE CONTROL RATHER THAN
   FORESEEN. ARM d (the catalogue harvest made to match nothing) was DECLARED to
   come back RED and came back **NO TALLY**: every later block reads
   `ROWS.get(code).translation`, so a blind harvest threw a `TypeError` and the
   module ENDED — the exact shape WORKER.md names, where an assertion that throws
   goes through no assertion at all. The arm was right and the instrument was
   wrong. Two corrections, both here: the reads below are null-tolerant, and a
   corpus that fails its floor STOPS at the floor with its tally printed, so
   "the corpus went blind" is reported as a RED with a number rather than as a
   silence. Recorded rather than smoothed. */
if (FAMILIES.length < 16 || ROWS.size < 166) {
  console.log("\n  HALTED: the catalogue corpus is below its floor. Nothing below can mean anything "
            + "over a corpus this walk cannot see, so nothing below is claimed.");
  console.log(`\nFAILED  ${pass} pass, ${fail} fail`);
  process.exit(1);
}

/* ====================================================================== 2
 * THE OPS — PARSED OUT OF THE PLANE'S OWN TABLE, FLOORED, PRINTED.
 * ==================================================================== */
console.log("\n--- 2. the op surface, parsed out of `index.mjs`'s OPS table (never typed here) ---");
const OPS_BLOCK = INDEX_SRC.slice(INDEX_SRC.indexOf("const OPS = {"),
                                  INDEX_SRC.indexOf("\n};", INDEX_SRC.indexOf("const OPS = {")));
/* `[a-z0-9]+` and NOT `[a-z]+`: an op name carrying a digit is invisible to the
   narrower spelling, and a walk that silently drops rows is the blind-classifier
   shape this repository names most. Both yields are printed so a collapse shows. */
const OP_ROWS = [...OPS_BLOCK.matchAll(/^ {2}([a-z0-9]+):\s*\{\s*classes:\s*(null|\[([^\]]*)\]),\s*mutating:\s*(true|false)/gm)]
  .map((m) => ({
    op: m[1],
    classes: m[2] === "null" ? null : m[3].split(",").map((s) => s.trim().replace(/"/g, "")).filter(Boolean),
    mutating: m[4] === "true",
  }));
const MEMBER_OPS = OP_ROWS.filter((r) => r.classes && r.classes.includes("member"));
const MUTATING_MEMBER_OPS = MEMBER_OPS.filter((r) => r.mutating).map((r) => r.op);
console.log(`    CORPUS: ${OP_ROWS.length} op row(s) parsed · ${MEMBER_OPS.length} admit the member class `
          + `· ${MUTATING_MEMBER_OPS.length} of those are mutating`);
t("the OPS table was actually read — a silent parse failure would make every drive below vacuous, "
+ "and would report ZERO VIOLATIONS as good news", OP_ROWS.length >= 120, true);
t("and the member-reachable subset is real too", MEMBER_OPS.length >= 100, true);

/* ====================================================================== 2b
 * THE STATIC CLASS — HOW BIG THE DEFECT WAS, AND WHY IT IS A DECORATION.
 *
 * REPORTED AND NOT GATED, on purpose and permanently. The drive below can only
 * see refusals an EMPTY payload provokes; this walk sees every SITE that names a
 * catalogued code as a string literal and builds an object carrying no
 * `translation` of its own. **That number is expected to stay above zero
 * forever** — sites are written by hand and always will be — which is exactly
 * the argument for attaching the row at ONE place rather than at each of them.
 * Gating it would be a ratchet demanding eleven, then forty-seven, then a
 * hundred site edits nobody has any reason to make.
 *
 * WHAT THIS MATCHER CAN AND CANNOT SEE, stated because the sentence is what
 * lets the next reader tell a clean result from a walk looking in the wrong
 * place: it reads the enclosing OBJECT LITERAL of a `reason:`/`code:` string
 * literal, so it CANNOT see a refusal assembled across statements, one built by
 * a helper (the twelfth fence is exactly that and is correctly counted as
 * CARRYING), or one whose code is in a variable. Every one of those still
 * leaves through `json()`, so the decoration covers what this walk cannot.
 * ==================================================================== */
console.log("\n--- 2b. the STATIC class: sites naming a catalogued code and carrying no translation ---");
const enclosingObject = (src, at) => {
  let depth = 0, start = -1;
  for (let k = at; k >= 0 && k > at - 4000; k--) {
    if (src[k] === "}") depth++;
    else if (src[k] === "{") { if (depth === 0) { start = k; break; } depth--; }
  }
  if (start === -1) return null;
  depth = 0;
  for (let k = start; k < src.length && k < start + 6000; k++) {
    if (src[k] === "{") depth++;
    else if (src[k] === "}") { depth--; if (depth === 0) return src.slice(start, k + 1); }
  }
  return null;
};
const STATIC = { carried: 0, bare: 0, bareCodes: new Set(), uncatalogued: 0, unreadable: 0 };
for (const src of [STORE_BARE, decomment(INDEX_SRC)]) {
  for (const m of src.matchAll(/\b(?:reason|code)\s*:\s*"([A-Z][A-Z0-9_]{2,})"/g)) {
    const body = enclosingObject(src, m.index);
    if (body === null) { STATIC.unreadable++; continue; }
    if (!ROWS.has(m[1])) { STATIC.uncatalogued++; continue; }
    if (/\btranslation\s*:/.test(body)) STATIC.carried++;
    else { STATIC.bare++; STATIC.bareCodes.add(m[1]); }
  }
}
console.log(`    ${STATIC.carried} site(s) name a catalogued code and carry the row THEMSELVES`);
console.log(`    ${STATIC.bare} site(s) name a catalogued code and carry NO translation of their own `
          + `(${STATIC.bareCodes.size} distinct code(s)) — every one of them reaches a caller translated`);
console.log(`    ONLY because of the one attach in json(); this is the size of what eleven site edits`);
console.log(`    would have had to become, and it grows on its own every time a refusal is written.`);
console.log(`    ${STATIC.uncatalogued} site(s) name a code with NO catalogue row (REC-64's sweep) · `
          + `${STATIC.unreadable} site(s) this matcher could not read an object literal around`);
t("the static walk found real sites and did not go blind — the figures above are a MEASUREMENT and "
+ "not a reassurance, and this is the floor that tells the two apart",
  STATIC.carried + STATIC.bare + STATIC.uncatalogued >= 300, true);

/* ====================================================================== 3
 * THE TWELVE — HARVESTED FROM `store.mjs`, SO A THIRTEENTH CANNOT ARRIVE
 * UNMEASURED. (REC-73's harvest, for REC-73's reason.)
 * ==================================================================== */
const FENCES = [...new Set([...STORE_BARE.matchAll(/"(MACHINE_CANNOT_[A-Z_]+)"/g)].map((m) => m[1]))].sort();
console.log(`    the machine-fence family, harvested from store.mjs: ${FENCES.length} code(s)`);
t("the fence harvest found a REAL family and not an empty set", FENCES.length >= 12, true);
t("every harvested fence has a catalogue row with a canned translation — REC-64's work, and the "
+ "precondition for asking whether it reaches anybody",
  FENCES.filter((c) => !ROWS.has(c)), []);

/* ====================================================================== 4
 * THE DRIVE.
 * ==================================================================== */
let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d262", MEMBER_TOKEN: "mem-d262", PROBE_TOKEN: "prb-d262",
              DAEMON_TOKEN: "dmn-d262", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-d262",
              GOVERNOR_APPETITE_PER_MIN: "600000",
              /* The DO's own drain alarm would race the sweep below and change
                 what an op answers mid-walk. task-fence.test.mjs pins it for the
                 same reason. */
              TASK_DRAIN_DELAY_MS: "600000",
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  outboundService() { return new Response(new Uint8Array(2048), { headers: { "content-type": "application/pdf" } }); },
});
MF = mf;

/* THE RAW BODY, NOT THE UNWRAPPED RESULT. Every other suite in this directory
   unwraps `result` before looking, and unwrapping is exactly what hides this
   item's defect: the question here is what the WIRE carried. */
const RAW = async (q, body) => {
  const res = body === undefined
    ? await mf.dispatchFetch(`http://x/api/?${q}`)
    : await mf.dispatchFetch(`http://x/api/?${q}`, { method: "POST", body: JSON.stringify(body) });
  let parsed = null;
  try { parsed = await res.json(); } catch { parsed = null; }
  return { status: res.status, body: parsed };
};
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP((await RAW(q, body ?? {})).body);

try {

console.log("\n--- 3. the drive: every admitted op, empty payload, as a MEMBER and as a MACHINE ---");

const enrol = async (memberId, role, capabilities) => {
  const add = await POST(`op=memberadd&token=adm-d262`,
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* 4.2/4.3: the second member of a group must be an administrator, and there are
   no ordinary members until TWO exist. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
await enrol("gus", "admin", ["contribute", "publish"]);

/* THE MACHINE. Its declared scope is HARVESTED — every mutating op a member
   reaches — so the credential layer is held OPEN and what answers these calls is
   the identity fence rather than the gate in front of it (PL-11's block 8
   reasoning, REC-73's restatement). Member-scoped so its viewer stamp is
   `member:ruth` and it sees what she sees. */
const minted = await POST(`op=aicredentialmint&token=${RUTH}`, {
  tokenId: "d262-wire-grader", principalKind: "member", principalMember: "ruth",
  taskScope: "D-262's own: grade the refusal a caller RECEIVES against the catalogue",
  writes: MUTATING_MEMBER_OPS,
  note: "D-262. A member authored this scope so the credential gate is open and the identity fences "
      + "below are what refuse — the same instrument REC-73 used, pointed at the envelope." });
if (!minted?.ok) throw new Error(`mint: ${JSON.stringify(minted).slice(0, 600)}`);
const AI = minted.token;
t("the machine credential's declared scope was HARVESTED from the OPS table and accepted whole — "
+ "so nothing below is refused by the gate in front of the fence",
  [minted.ok, Array.isArray(minted.credential?.writes) ? minted.credential.writes.length : null],
  [true, MUTATING_MEMBER_OPS.length]);

/* --------------------------------------------------------------- the sweep */
/* Every refusal observed, keyed by code, with the FIRST full envelope seen for
   it and the op that produced it. `seen` is deliberately a Map and not a count:
   a violation must be nameable, and a count cannot be argued with. */
const OBSERVED = new Map();      /* code -> { code, check, translation, op, who, envelope } */
const NO_CODE = [];              /* ok:false with no string code at all */
const NOT_CLASSIFIED = [];       /* a body this walk does not understand */
let calls = 0, refusals = 0;

const record = (op, who, wire) => {
  if (!wire || typeof wire !== "object") { NOT_CLASSIFIED.push({ op, who, why: "no JSON body" }); return; }
  /* TWO PLACES A REFUSAL LIVES ON THIS WIRE and no more: the control plane's
     own, at the top level, and the store's, under the DO envelope's `result`.
     Anything else is named rather than counted as clean. */
  const candidates = [];
  if (wire.ok === false) candidates.push(wire);
  if (wire.result && typeof wire.result === "object" && !Array.isArray(wire.result)
      && wire.result.ok === false) candidates.push(wire.result);
  if (candidates.length === 0) {
    if (wire.ok !== true && !(wire.result && typeof wire.result === "object"))
      NOT_CLASSIFIED.push({ op, who, why: `body says neither ok:true nor ok:false (keys: ${Object.keys(wire).slice(0, 6).join(",")})` });
    return;
  }
  for (const r of candidates) {
    refusals++;
    const code = typeof r.reason === "string" ? r.reason
               : typeof r.code === "string" ? r.code : null;
    if (!code) {
      NO_CODE.push({ op, who, keys: Object.keys(r).slice(0, 8),
                     /* the words the caller actually got, so the residue is a
                        finding somebody can act on rather than a tally */
                     said: typeof r.error === "string" ? r.error.slice(0, 90) : null });
      continue;
    }
    if (!OBSERVED.has(code))
      OBSERVED.set(code, { code, check: r.check, translation: r.translation, op, who });
  }
};

for (const who of ["member", "machine"]) {
  const token = who === "member" ? RUTH : AI;
  for (const row of MEMBER_OPS) {
    /* A machine credential may only be handed a mutating op it declared; the
       non-mutating ones it reaches by the floor. Both are driven. */
    const wire = row.mutating
      ? (await RAW(`op=${row.op}&token=${token}`, {})).body
      : (await RAW(`op=${row.op}&token=${token}`)).body;
    calls++;
    record(row.op, who, wire);
  }
}
console.log(`    DRIVEN: ${calls} call(s) over ${MEMBER_OPS.length} op(s) × 2 credentials · `
          + `${refusals} refusal envelope(s) · ${OBSERVED.size} distinct code(s) received`);
t("the drive actually reached the plane and refusals actually came back — floored before any "
+ "claim is made over what came back", [calls >= 200, OBSERVED.size >= 40], [true, true]);

/* ====================================================================== 5
 * THE GRADE — THE GATE.
 * ==================================================================== */
console.log("\n--- 4. the grade: every catalogued code RECEIVED must carry its row on the wire ---");

const BARE = [];        /* catalogued, but the wire carried no translation */
const NO_CHECK = [];    /* catalogued, but the wire carried no C-number */
const DIVERGENT = [];   /* the wire carried a translation the catalogue does not hold */
const CENSUS = [];      /* received with NO catalogue row — REC-64's sweep, reported not gated */
for (const got of [...OBSERVED.values()].sort((a, b) => a.code.localeCompare(b.code))) {
  const row = ROWS.get(got.code);
  if (!row) { CENSUS.push(got.code); continue; }
  if (typeof got.translation !== "string" || got.translation === "") BARE.push(got.code);
  else if (got.translation !== row.translation) DIVERGENT.push(got.code);
  if (got.check !== row.check) NO_CHECK.push(got.code);
}
const graded = OBSERVED.size - CENSUS.length;
console.log(`    GRADED: ${graded} received code(s) have a catalogue row · ${CENSUS.length} do not (census below)`);

t("EVERY catalogued refusal a caller RECEIVED carried its canned translation on the wire — this is "
+ "the assertion nothing in this repository made before D-262, and it is the one the eleven fences "
+ "failed for as long as they have existed", BARE, []);
t("...and its C-NUMBER, equal to the catalogue's — a member who cannot name the check cannot look "
+ "it up, and a wrong number is worse than none", NO_CHECK, []);
t("...and the sentence is the CATALOGUE'S, not a second copy that has drifted from it. DEC-8 says "
+ "a surface may render what it RECEIVED; that protection is worth nothing if what it received was "
+ "invented upstream", DIVERGENT, []);
t("something was actually graded — an empty graded set would satisfy all three assertions above by "
+ "accident, which is the only way they could read as good news while meaning nothing",
  graded >= 30, true);

/* ====================================================================== 6
 * THE TWELVE, PINNED BY NAME.
 * ==================================================================== */
console.log("\n--- 5. the twelve machine fences, each pinned on the WIRE ---");
const fenceWire = FENCES.map((c) => {
  const got = OBSERVED.get(c);
  return { code: c, reached: !!got, translated: !!got && got.translation === (ROWS.get(c)?.translation ?? null) };
});
const unreached = fenceWire.filter((f) => !f.reached).map((f) => f.code);
const untranslated = fenceWire.filter((f) => f.reached && !f.translated).map((f) => f.code);
for (const f of fenceWire)
  console.log(`      ${f.reached ? (f.translated ? "wire+row" : "WIRE BARE") : "not reached"}  ${f.code}`
            + (f.reached ? `  (via op=${OBSERVED.get(f.code).op}, as ${OBSERVED.get(f.code).who})` : ""));
t("every machine fence this sweep REACHED carries its canned translation to the caller", untranslated, []);
/* NOT an emptiness claim: the set of fences an empty payload cannot reach is
   NAMED, so a fence that stops being reachable is a change to this line rather
   than a silent shrink of the corpus.

   ELEVEN OF THE TWELVE ARE REACHED BY AN EMPTY PAYLOAD, AND THAT WAS NOT WHAT
   THIS ITEM PREDICTED — it expected two or three to sit behind acts an empty
   call cannot address. It is the same fact D-229 measured from the other side:
   these fences sit ABOVE the payload complaints, so the thinnest possible call
   reaches them. **`MACHINE_CANNOT_MOVE_VERSION` is the single exception, and it
   is the one fence that was never broken** — it is reached through the six
   version acts, whose dispatch needs `target=` and `version=` before the fence,
   so an empty call is refused by the subject complaint first. The fence with the
   helper is the fence an empty payload cannot see; recorded because it is a
   coincidence worth not mistaking for a cause. */
t("the fences this empty-payload sweep does not reach are NAMED rather than counted, so the corpus "
+ "cannot quietly shrink — REC-73 drives all twelve under complete payloads and is the instrument "
+ "for reachability; this one is the instrument for the envelope",
  unreached, ["MACHINE_CANNOT_MOVE_VERSION"]);

/* ====================================================================== 7
 * TWO PRODUCERS, ONE CODE — AND THE `detail` IS WHAT TELLS THEM APART.
 * ==================================================================== */
console.log("\n--- 6. `AI_BEYOND_TASK_SCOPE` has TWO producers and the code does not say which fired ---");
/* VF-5 pinned this pair by `detail` because the code cannot distinguish them.
   A decoration that attached the catalogue row could have flattened the two into
   one indistinguishable answer; it does not, and this is what says so. */
const beyondReach = (await RAW(`op=capturerequestdrain&token=${AI}`, {})).body;
const beyondScope = (await RAW(`op=memberadd&token=${AI}`, {})).body;
const detailOf = (b) => (b && typeof b.detail === "string") ? b.detail : null;
t("producer 1 — an op NO MEMBER reaches is refused AI_BEYOND_TASK_SCOPE",
  [beyondReach?.reason ?? beyondReach?.code, beyondReach?.ok], ["AI_BEYOND_TASK_SCOPE", false]);
t("producer 2 — an op the credential DID NOT DECLARE is refused with the SAME code",
  [beyondScope?.reason ?? beyondScope?.code, beyondScope?.ok], ["AI_BEYOND_TASK_SCOPE", false]);
t("both carry the catalogue's one sentence for that code — one code, one canned translation",
  [beyondReach?.translation === (ROWS.get("AI_BEYOND_TASK_SCOPE")?.translation ?? null),
   beyondScope?.translation === (ROWS.get("AI_BEYOND_TASK_SCOPE")?.translation ?? null)], [true, true]);
t("AND THE TWO REMAIN DISTINGUISHABLE BY `detail`, which is the only thing that tells a reader "
+ "which producer fired — the canned translation is the same sentence for both BY DESIGN, so if "
+ "`detail` ever collapsed too, the answer would name a condition without naming its cause",
  [detailOf(beyondReach) !== null, detailOf(beyondScope) !== null,
   detailOf(beyondReach) !== detailOf(beyondScope)], [true, true, true]);

/* ====================================================================== 8
 * THE OVER-STRICTNESS ARM, BUILT IN. A correct refusal in a shape this file did
 * not anticipate must be graded CLEAN.
 * ==================================================================== */
console.log("\n--- 7. over-strictness: correct work in an unanticipated spelling must NOT be reported bare ---");
{
  const row = ROWS.get("MACHINE_CANNOT_RELEASE") ?? { check: null, translation: null };
  /* Four things this suite's grader was not written around, all at once: the
     code spelled in `code` and NOT in `reason`; the row built at the site rather
     than attached by the decoration; the `detail` worded unlike anything REC-64
     wrote; and extra keys the grader has never seen. It must pass. */
  const exotic = { ok: false, code: "MACHINE_CANNOT_RELEASE", check: row.check,
                   translation: row.translation,
                   detail: "Nope — not from a robot, thanks.", weight: "refuse", sigil: 7 };
  const before = { bare: BARE.length, divergent: DIVERGENT.length };
  const probe = new Map();
  const saved = OBSERVED.get("MACHINE_CANNOT_RELEASE");
  OBSERVED.delete("MACHINE_CANNOT_RELEASE");
  /* The label is NOT spelled `op=<something>`: `test/op-claims.test.mjs` reads
     every `op=` mention in this repository and fails on one the dispatch table
     does not hold, which is exactly right — a fixture inventing an op name is
     how a planning document comes to reference a verb nobody built. Caught by
     that suite on this file's first battery run. */
  record("(over-strictness fixture, not an op)", "member", { ok: true, result: exotic });
  const got = OBSERVED.get("MACHINE_CANNOT_RELEASE");
  probe.set("graded", got && ROWS.has(got.code) && got.translation === (ROWS.get(got.code)?.translation ?? null)
                       && got.check === (ROWS.get(got.code)?.check ?? null));
  if (saved) OBSERVED.set("MACHINE_CANNOT_RELEASE", saved); else OBSERVED.delete("MACHINE_CANNOT_RELEASE");
  t("a refusal that DOES carry its row, spelled in `code` rather than `reason`, built at its own "
  + "site, worded unlike anything in the catalogue and carrying keys this grader has never seen, "
  + "is graded CLEAN — a grader that reported correct work as bare would teach the next author to "
  + "route around it", [probe.get("graded"), before.bare, before.divergent], [true, 0, 0]);
}

/* ====================================================================== 9
 * THE CENSUS AND THE RESIDUE — REPORTED, NAMED, NOT GATED.
 * ==================================================================== */
console.log("\n--- 8. the census: what came back with NO catalogue row (REC-64's remaining sweep) ---");
console.log(`    ${CENSUS.length} received code(s) have no DEC-49 row and are therefore not gradable here.`);
console.log(`    THIS IS THE BOUNDARY between D-262 and REC-64, drawn by the instrument: REC-64 owns codes`);
console.log(`    with NO translation; D-262 owns translations that exist and do not reach the caller. A row`);
console.log(`    REC-64 writes moves a code from this list into the GRADED set with no edit to this file.`);
for (const c of CENSUS) console.log(`      census  ${c}  (via op=${OBSERVED.get(c).op})`);
console.log(`    REFUSALS CARRYING NO CODE AT ALL: ${NO_CODE.length}`);
for (const n of NO_CODE) console.log(`      no-code  op=${n.op} (${n.who}) keys: ${n.keys.join(",")}`
                                   + (n.said ? `  said: "${n.said}"` : ""));
/* THE RESIDUE, PINNED AS A SET AND NOT A COUNT — D-270's subject, RAISED by this
   item and deliberately NOT fixed here.
   These refusals carry no code of any kind, so DEC-49 cannot reach them at all:
   they are not "a code with no translation" (REC-64's sweep) but "a refusal with
   no code", one layer further out. TWO KINDS, both QUOTED in the lines printed
   above rather than described, because the words are the finding: (1) the
   SESSION GATE — `{ok:false, error:"this operation requires a machine
   credential, not a signed-in session", op}` — which is what a signed-in member
   meets on every unattended verb; and (2) three ops refusing a missing argument
   with a bare `error` string (`"capture requires sha256=<64 lowercase hex>"` and
   its two siblings).
   A SET rather than a count, so it fails in BOTH directions: a new codeless
   refusal fails this line and must be looked at, and one of these being given a
   code fails it too and must be struck WITH its reason. That is what stops a
   known gap from becoming a permanent one. */
t("the ops answering a caller with NO code at all are NAMED — D-270, raised by this item and not "
+ "fixed by it, because giving the session gate a code is an interface decision and not a translation",
  [...new Set(NO_CODE.map((n) => n.op))].sort(),
  /* STRUCK AT INTEGRATION 2026-08-09 by CONDUCT, WITH THE REASON, exactly as the
     comment above requires: `provenancechain`, `provenanceroute` and `taskdrain`
     were the SESSION-GATE three, and REC-64's remaining sweep gave that gate a code
     in its admission-gate family (C-38) — so they answer a code now and this line
     failed in the GOOD direction. That is the pin working as designed: it was
     written to fail when one of the six was fixed, not only when a seventh arrived.
     THREE REMAIN, and they are the other kind D-270 names: ops refusing a MISSING
     ARGUMENT with a bare `error` string. Giving those a code is still an interface
     decision rather than a translation, so D-270 stays open on a smaller corpus. */
  ["capture", "monitor", "pdfstructure"]);
console.log(`    BODIES THIS WALK COULD NOT CLASSIFY: ${NOT_CLASSIFIED.length}`);
for (const n of NOT_CLASSIFIED.slice(0, 20)) console.log(`      unclassified  op=${n.op} (${n.who}) — ${n.why}`);
/* The census is REPORTED and NOT GATED, deliberately: gating it would fail this
   suite on REC-64's unfinished work, and a gate set above the current state gets
   switched off. What IS gated is that the census is not the whole answer — a
   walk in which EVERYTHING is uncatalogued has almost certainly gone blind. */
t("the census is not the whole corpus — a run in which nothing at all resolved to a row would be a "
+ "blind walk reporting zero violations, and this is what tells the two apart",
  CENSUS.length < OBSERVED.size, true);

console.log(`\n${fail === 0 ? "OK" : "FAILED"}  ${pass} pass, ${fail} fail`);
} finally {
  await mf.dispose();
}
process.exit(fail === 0 ? 0 : 1);
