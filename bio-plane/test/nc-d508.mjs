/* D-508 — THE NEGATIVE CONTROL FOR THE DOORBELL'S DEC-49 CODES.
 *
 * THE ROW'S OWN NAMED CONTROL: *"return the bare reason and the guard names it."*
 * That is one arm, and it is the one that matters, because the whole claim of
 * this item is that a refusal at the public door can no longer go out as a token
 * with no sentence. If the DEC-49 guard stays green over a bare
 * `{ ok: false, reason: "RATE_IP" }` inside the governed region, then the region
 * is decorative and the claim is false.
 *
 * TWO INSTRUMENTS, RUN PER ARM, because the two halves of this item fail in
 * different places and one run cannot tell them apart:
 *   GUARD — `civicos-ui/check-refusal-codes.mjs --strict`, the DEC-49 harness.
 *           It judges the SHAPE: is a refusal inside a governed region carrying a
 *           code with a row behind it.
 *   SUITE — `bio-plane/test/doorbell.test.mjs`, which drives `op=knock` end to
 *           end. It judges what a CALLER receives. A store-level equality would
 *           not be evidence a caller can reach the feature (CLAUDE.md §5).
 *
 * WHAT THE FIRST RUN MEASURED, AND IT CHANGED THE ARMS RATHER THAN BEING
 * SMOOTHED (2026-09-24, D-508's own worker). The first draft declared that
 * returning the BARE REASON would take the four `per-source:` suite arms down.
 * IT DID NOT: the suite came back 57/0, fully green, over a store that had gone
 * back to `{ ok: false, reason: "RATE_IP" }`. **The reason is a mechanism this
 * item did not know about and no reader of the row could have: `src/index.mjs`
 * already carries a GENERIC DEC-49 DECORATOR** — `dec49Decorate`, reached from
 * `dec49Attach` — which walks every `ok:false` answer the control plane sends,
 * looks its `reason` up across EVERY `*_CHECKS` family by the reserved suffix,
 * and fills in `code`, `check` and `translation` when they are absent. So the
 * moment `KNOCK_CHECKS` existed in the catalogue, the sentence reached the wire
 * whether or not the store minted it.
 *
 * THAT IS A FINDING ABOUT THE ARM AND ABOUT THE ITEM, and it is recorded here
 * rather than tidied away: **two independent mechanisms now deliver this
 * sentence, so NO SINGLE behavioural arm can see either one.** That is the
 * `behaviourally invisible revert` class (kickoffs/WORKER.md) and it is why the
 * arms below are what they are — each of the two is disabled alone to show the
 * OTHER still carries the paper, then BOTH are disabled together to show the
 * suite can see the absence at all. An assertion that cannot fail is worse than
 * none, and arm (d) is the one that establishes these four can.
 *
 * DECLARED BEFORE THE RE-RUN — each arm ALONE, the others held open:
 *
 * (a) BASELINE — nothing armed. GUARD exit 0, SUITE fully green. This row exists
 *     because a driver whose every arm reports "failed" cannot be told from one
 *     whose every arm is broken (kickoffs/WORKER.md: have a baseline row).
 *
 * (b) BARE-REASON — replace the per-source mint with the code as it stood before
 *     this item, `return { ok: false, reason: "RATE_IP" };`, inside the region.
 *     GUARD MUST FAIL. SUITE MUST STAY FULLY GREEN, and that green is the
 *     measured statement above: the decorator carries it. **The guard fails on
 *     the `outcomeReturns` FLOOR and NOT as a codeless refusal**, which is a
 *     second finding and is stated at arm (b)'s declaration below rather than
 *     read as the arm working.
 *
 * (c) DECORATOR-OFF — make `dec49Decorate` return before it decorates anything,
 *     leaving only what the store itself put in the answer. GUARD MUST STAY
 *     GREEN (the decorator is not a governed DEC-49 site; the catalogue and the
 *     region are untouched). SUITE MUST STAY FULLY GREEN — which is the POSITIVE
 *     demonstration that the region is load-bearing and not decoration: with the
 *     decorator gone the paper still arrives, because `knock > is-knock-rate`
 *     minted it.
 *
 * (d) BOTH-OFF — (b) and (c) together, the FALSIFIABILITY arm. SUITE MUST FAIL
 *     exactly the four `per-source:` arms: no mint and no decorator, so there is
 *     no code, no check and no sentence to read. The four `instance-wide:` arms
 *     MUST STAND — `RATE_GLOBAL` is still minted through the helper — and that
 *     split is what says these arms read the refusal in front of them rather
 *     than a global fact. The arms that read `reason` and `stated` must also
 *     stand: `reason` and `code` are different claims and this proves the suite
 *     can tell them apart.
 *
 * (e) MARKERS-OFF — move the region's closing marker above the two returns,
 *     leaving a well-formed, non-trivial, correctly nested span containing no
 *     refusal. GUARD MUST FAIL naming the region. SUITE MUST STAY FULLY GREEN —
 *     the wire does not move at all — and that is the arm's whole content: a
 *     `where` that has drifted off its refusal is invisible to every behavioural
 *     assertion in this repository, and only the structural pin can see it.
 *
 * (f) BLANK-TRANSLATION — empty `RATE_GLOBAL`'s canned sentence in the
 *     catalogue. The row still exists and still carries its check. GUARD MUST
 *     FAIL (a code in the census with no canned translation moves the
 *     `untranslated` floor). SUITE MUST FAIL the instance-wide arms: the helper
 *     THROWS on an empty translation, so the store does not answer and the
 *     control plane says so instead of naming a rate limit — and the decorator
 *     skips an empty row too, which is why this arm cannot be carried by it.
 *     The four `per-source:` arms MUST STAND. This is the arm that stops the
 *     catalogue comparison passing for free over two empty strings: an equality
 *     that costs nothing to produce is not evidence (CLAUDE.md §5).
 *
 * (g) OVER-STRICTNESS — correct work in a spelling this item did not anticipate:
 *     the per-source mint rewritten with extra whitespace inside the call, on ONE
 *     LINE so the region's line count does not move (the first draft spread it
 *     over three lines and the guard failed on the `regionLines` floor — the
 *     guard was right and the arm was wrong, and that is recorded rather than
 *     the floor being loosened). GUARD MUST STAY GREEN and SUITE MUST STAY FULLY
 *     GREEN. A guard that fails here would be tighter than DEC-49's rule.
 *
 * WHAT THIS DRIVER CANNOT SEE, stated rather than left to be inferred: whether
 * either canned sentence is a GOOD sentence, and whether a surface renders it.
 * No suite judges prose, and no first-party surface reads these keys yet
 * (measured: `knock` occurs 0 times in `civicos-ui/app.html`).
 *
 * RESTORES are verified by sha256, by `Buffer.equals` (byte-for-byte) and by
 * size against a UNIQUELY-NAMED per-arm pristine copy with a floor, and every
 * copy lives in a pen OUTSIDE any directory the battery or `coverage.mjs` walks
 * — `nc-d487.mjs`'s rule, and for its reason: a loose copy of `src/store.mjs`
 * under `test/` is a second plane source for the next walk to enrol.
 */
import { readFileSync, writeFileSync, copyFileSync, statSync, unlinkSync, mkdirSync, rmdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";

const PLANE = fileURLToPath(new URL("../", import.meta.url));
const REPO = fileURLToPath(new URL("../../", import.meta.url));
const SUITE = fileURLToPath(new URL("./doorbell.test.mjs", import.meta.url));
const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const INDEX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const CATALOG = fileURLToPath(new URL("../checks/bio-checks.mjs", import.meta.url));
const GUARD = fileURLToPath(new URL("../../civicos-ui/check-refusal-codes.mjs", import.meta.url));

const DIR = `${controlPen("d508")}/`;
mkdirSync(DIR, { recursive: true });
process.on("exit", () => { try { rmdirSync(DIR); } catch { /* not empty: the evidence stays */ } });

const MIN_BYTES = 6000;
const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
/* latin1, byte-exact: `src/store.mjs` carries a stray byte (CLAUDE.md §7) and a
   utf8 round trip replaces it with U+FFFD. A control that corrupts its own
   subject on the way in refutes nothing. */
const readBytes = (f) => readFileSync(f).toString("latin1");
const writeBytes = (f, s) => writeFileSync(f, Buffer.from(s, "latin1"));

/* The assertions D-508 added, declared here so an arm that silently RENAMES one
   is caught rather than scored as "did not fail". */
const D508_ARMS = [
  "per-source: the refusal carries its DEC-49 code",
  "per-source: it names the check the code belongs to",
  "per-source: the canned translation is a real sentence, not an empty string",
  "per-source: and it is the CATALOGUE's sentence, not an inline copy in the plane",
  "instance-wide: the refusal carries its DEC-49 code",
  "instance-wide: it names the check the code belongs to",
  "instance-wide: the canned translation is a real sentence, not an empty string",
  "instance-wide: and it is the CATALOGUE's sentence, not an inline copy in the plane",
  "the two rate refusals do not share one sentence",
];

const MINT_IP = 'if (est(ipBucket, ipPrevBucket) >= perIpLimit) return refusal("RATE_IP");';
const BARE_IP = 'if (est(ipBucket, ipPrevBucket) >= perIpLimit) return { ok: false, reason: "RATE_IP" };';
const REGION_OPEN = "      /* DEC-49 REGION is-knock-rate";
const REGION_CLOSE = "      /* END DEC-49 REGION is-knock-rate */\n";
const PRUNE_LINE = "      for (const b of [ipBucket, globalBucket])\n";
const DECORATE_OPEN = 'function dec49Decorate(r) {\n  if (!r || typeof r !== "object" || Array.isArray(r)) return;';
/* ONE LINE, so the arm does not move `regionLines` — see (c) in the header: the
   decorator's body is not a governed span, but a line added anywhere inside
   `index.mjs` is cheap to avoid and a floor moved by an ARM is noise. */
const DECORATE_OFF = 'function dec49Decorate(r) {\n  if (r || !r) return;  /* nc-d508 arm */';

/* The subjects are read as LATIN1 (byte-exact — `src/store.mjs` carries a stray
   byte, CLAUDE.md §7), so an anchor containing a NON-ASCII character must be
   written in the same encoding or it matches zero times and the arm silently
   does not arm. Measured: the em dashes in RATE_GLOBAL's sentence made this
   anchor occur 0 times on the first attempt. */
const lat1 = (x) => Buffer.from(x, "utf8").toString("latin1");

const RATE_GLOBAL_TEXT = lat1(
  "    translation: 'This group\\'s inbox is not taking any more material from anyone just now. The whole '\n"
+ "      + 'instance is at its limit rather than you — the cap exists so that no one sender can fill '\n"
+ "      + 'the inbox — and it lifts on its own shortly; the bound is published beside this message. '\n"
+ "      + 'Nothing was stored and nothing was read, so send the same material again a little later. '\n"
+ "      + 'If it keeps happening, the group\\'s members can be told the doorbell is saturated.',");

const PER_SOURCE = D508_ARMS.slice(0, 4);
const INSTANCE_WIDE = D508_ARMS.slice(4, 8);

const ARMS = {
  "bare-reason": {
    why: "Mint the per-source refusal as a BARE STORE REASON, the code exactly as it stood before D-508. The decorator in index.mjs is left in place.",
    edits: [{ file: STORE, anchor: MINT_IP, patch: BARE_IP }],
    /* DECLARED, and the SHAPE of the failure is declared too, because "the guard
       goes red" is not the same claim as "the guard names it". It fails on the
       `outcomeReturns` FLOOR — one more return-position outcome at a governed
       site — and does NOT report a CODELESS REFUSAL, because arm C reads a
       `reason:` literal as the code and `RATE_IP` still has a row. The driver
       prints both flags so the distinction is on the record. */
    guardMustFail: true,
    suiteMustFail: [],
  },
  "decorator-off": {
    why: "Disable index.mjs's GENERIC DEC-49 decorator, so only what the store itself put in the answer reaches the wire.",
    edits: [{ file: INDEX, anchor: DECORATE_OPEN, patch: DECORATE_OFF }],
    guardMustFail: false,
    suiteMustFail: [],
  },
  "both-off": {
    why: "THE FALSIFIABILITY ARM: the bare reason AND the decorator disabled together, so nothing at all supplies the per-source paper.",
    edits: [{ file: STORE, anchor: MINT_IP, patch: BARE_IP },
            { file: INDEX, anchor: DECORATE_OPEN, patch: DECORATE_OFF }],
    guardMustFail: true,
    suiteMustFail: PER_SOURCE,
  },
  "markers-off": {
    why: "Move the region's CLOSING marker above the two returns, so the span is well formed, non-trivial and correctly nested and contains no refusal at all.",
    edits: [{ file: STORE, anchor: REGION_CLOSE + PRUNE_LINE, patch: PRUNE_LINE },
            { file: STORE, anchor: REGION_OPEN, patch: REGION_CLOSE + REGION_OPEN }],
    guardMustFail: true,
    suiteMustFail: [],
  },
  "blank-translation": {
    why: "Empty RATE_GLOBAL's canned sentence in the catalogue: the row still exists and still carries its check, and the sentence behind it is gone.",
    edits: [{ file: CATALOG, anchor: RATE_GLOBAL_TEXT, patch: "    translation: ''," }],
    guardMustFail: true,
    suiteMustFail: ["the instance-wide refusal is named",
                    "it publishes the instance-wide bound in words",
                    ...INSTANCE_WIDE],
  },
  "overstrict-spelling": {
    why: "OVER-STRICTNESS: correct work in a spelling nobody anticipated — the same mint with extra whitespace inside the call, on one line so the region's line count does not move.",
    edits: [{ file: STORE, anchor: MINT_IP,
              patch: 'if (est(ipBucket, ipPrevBucket) >= perIpLimit) return refusal(  "RATE_IP"  , {} );' }],
    guardMustFail: false,
    suiteMustFail: [],
  },
};

function runGuard(tag) {
  const r = spawnSync(process.execPath, [GUARD, "--strict"], { cwd: REPO, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const fails = [...out.matchAll(/^FAIL: (.+)$/gm)].map((m) => m[1].trim());
  const foot = /^check-refusal-codes: /m.test(out);
  return { tag, exit: r.status, fails, foot,
           namesRegion: fails.some((f) => f.includes("is-knock-rate")),
           namesCodeless: fails.some((f) => /CODELESS REFUSAL/.test(f)) };
}

function runSuite(tag) {
  const started = Date.now();
  const r = spawnSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1].trim());
  const passed = [...out.matchAll(/^ {2}PASS {2}(.+)$/gm)].map((m) => m[1].trim());
  const tally = /^doorbell: (\d+) pass, (\d+) fail$/m.exec(out);
  /* No tally means the module ended before its own foot — a TypeError inside an
     assertion goes through no assertion at all. Report -1, never 0. */
  return { exit: r.status, ms: Date.now() - started,
           pass: tally ? Number(tally[1]) : -1, fail: tally ? Number(tally[2]) : -1,
           failed, passed, reachedFoot: Boolean(tally) };
}

function baseline(when) {
  const g = runGuard(`baseline-${when}`);
  const s = runSuite(`baseline-${when}`);
  console.log(`\nBASELINE (${when})`);
  console.log(`  GUARD exit=${g.exit} fails=${g.fails.length} foot=${g.foot}`);
  console.log(`  SUITE exit=${s.exit} ${s.pass} pass, ${s.fail} fail, foot=${s.reachedFoot}, ${s.ms}ms`);
  if (g.exit !== 0 || g.fails.length || !g.foot || s.exit !== 0 || s.fail !== 0 || !s.reachedFoot)
    console.log("  !! BASELINE IS NOT GREEN — every arm below is uninterpretable until this is.");
  const missing = D508_ARMS.filter((a) => !s.passed.includes(a));
  if (missing.length) console.log(`  !! D-508 arms absent from the run: ${JSON.stringify(missing)}`);
  return { g, s };
}

function arm(name) {
  const a = ARMS[name];
  const files = [...new Set(a.edits.map((e) => e.file))];
  const pens = new Map();
  for (const f of files) {
    const pristine = `${DIR}.nc-d508-pristine-${name}-${f.split("/").pop()}`;
    copyFileSync(f, pristine);
    pens.set(f, { pristine, before: sha(f), bytes: statSync(f).size });
  }
  console.log(`\nARM ${name}: ${a.why}`);
  for (const f of files) console.log(`  subject ${f.split("/").slice(-2).join("/")} (${pens.get(f).bytes} bytes)`);
  const undo = () => {
    for (const f of files) {
      const pen = pens.get(f);
      copyFileSync(pen.pristine, f);
      const after = sha(f), size = statSync(f).size;
      const same = readFileSync(pen.pristine).equals(readFileSync(f));
      console.log(`  restore ${f.split("/").pop()}: sha256 ${after === pen.before ? "MATCHES" : "DIFFERS"}`
                + ` · byte-for-byte ${same ? "identical" : "DIFFERENT"} · ${size} bytes (floor ${MIN_BYTES})`);
      if (after !== pen.before || !same || size < MIN_BYTES)
        console.log("  !! RESTORE FAILED — STOP AND FIX BY HAND BEFORE ANYTHING ELSE.");
      unlinkSync(pen.pristine);
    }
  };
  if (files.some((f) => pens.get(f).bytes < MIN_BYTES)) {
    console.log(`  !! a subject is under the ${MIN_BYTES}-byte floor — refusing to arm`); undo(); return;
  }
  /* EVERY edit must arm, and an arm that did not arm is a finding, never a pass. */
  const texts = new Map(files.map((f) => [f, readBytes(f)]));
  for (const e of a.edits) {
    const src = texts.get(e.file);
    const n = src.split(e.anchor).length - 1;
    if (n !== 1) {
      console.log(`  !! ANCHOR OCCURS ${n} TIMES, NOT 1 in ${e.file.split("/").pop()} — ARM DID NOT ARM, `
                + "and an arm that did not arm is a finding.");
      undo(); return;
    }
    const next = src.replace(e.anchor, e.patch);
    if (next === src) { console.log("  !! PATCH CHANGED NOTHING — ARM DID NOT ARM."); undo(); return; }
    texts.set(e.file, next);
  }
  for (const f of files) writeBytes(f, texts.get(f));
  let g, s2;
  try { g = runGuard(name); s2 = runSuite(name); }
  finally { undo(); }
  const guardOk = a.guardMustFail ? (g.exit !== 0 && g.fails.length > 0) : (g.exit === 0 && g.fails.length === 0);
  console.log(`  GUARD  declared ${a.guardMustFail ? "MUST FAIL" : "MUST STAY GREEN"} · exit=${g.exit} `
            + `fails=${g.fails.length} foot=${g.foot} · names the region: ${g.namesRegion} `
            + `· names a codeless refusal: ${g.namesCodeless}`);
  for (const f of g.fails) console.log(`         ${JSON.stringify(f.slice(0, 180))}`);
  console.log(`  GUARD  ${guardOk ? "AS DECLARED" : "!! NOT AS DECLARED"}`);
  const want = a.suiteMustFail.slice().sort(), got = s2.failed.slice().sort();
  const suiteOk = JSON.stringify(want) === JSON.stringify(got);
  console.log(`  SUITE  exit=${s2.exit} ${s2.pass} pass, ${s2.fail} fail, foot=${s2.reachedFoot}, ${s2.ms}ms`);
  console.log(`  SUITE  MUST FAIL  ${JSON.stringify(want)}`);
  console.log(`  SUITE  ACTUALLY   ${JSON.stringify(got)}`);
  console.log(`  SUITE  ${suiteOk ? "AS DECLARED" : "!! NOT AS DECLARED — read this before believing the suite"}`);
  const standing = D508_ARMS.filter((x) => !a.suiteMustFail.includes(x));
  const knocked = standing.filter((x) => s2.failed.includes(x));
  console.log(`  MUST STAND  ${standing.length} D-508 arms · ${knocked.length ? `!! ALSO DOWN: ${JSON.stringify(knocked)}` : "all standing"}`);
}

const which = process.argv[2] || "all";
baseline("open");
for (const name of Object.keys(ARMS)) if (which === "all" || which === name) arm(name);
baseline("close");
