/* D-271 / D-195 — THE INDEPENDENCE DERIVATION, ON THE READ THE ACCEPT CEREMONY MAKES.
 *
 * WHAT THIS SUITE IS FOR. `op=suggest`'s CHECK 4 carried a sentence saying the
 * derivation is *"PUBLISHED on every version that passes, so the member affirming
 * independence at §12's accept ceremony is affirming it against what the record
 * can see."* UI-43 found it false from the surface side while building that
 * ceremony; this item measured both halves from the plane and found the sentence
 * true of the WRITE and false of the READ — and the write half true only in a way
 * that carried no information, because CHECK 4 refuses every outcome except the
 * empty one. The arms below are what make the corrected sentence checkable.
 *
 * NEGATIVE CONTROL: seven arms, EVERY ONE RUN on 2026-08-09 by d271-independence, each armed ALONE with every other defence held OPEN, against a mechanically broken copy of the subject; every restore verified by sha256 AND by `cmp` (content) against a per-arm UNIQUELY-NAMED pristine copy, with a byte count printed and a minimum guarded. Re-run in one step: `node test/independence.control.mjs` from bio-plane/. The harness and its pen live INSIDE THIS WORKTREE and never in a shared scratchpad. CLEAN TREE: measured by the driver's own opening and closing BASELINE rows.
 *   CLEAN TREE: 14 pass, 0 fail — measured at the driver's OPENING and CLOSING baseline rows, which AGREE.
 *   (0) BASELINE, armed with nothing, run FIRST and LAST -> **14 pass, 0 fail.** Without it a harness reporting the same number for every arm cannot be told from six-arms-broken, which is a failure this repository has measured.
 *   (1) DROP THE PUBLICATION. In src/store.mjs delete the `independence:` key from `versionStrength`'s returned answer -> **exit 1, 5 pass, 9 FAIL: A1 A2 A3 A4 A5 B1 B3 B4 C1.** With nothing published there is nothing to distinguish. ARM B2, C2 and D1 stay GREEN, which is the half that matters: the write gate and the publication are separate mechanisms, and an arm set that took the gate down with the field would not have shown that.
 *   (2) REPLAY THE WRITE INSTEAD OF RECOMPUTING — make `versionStrength` publish a frozen `{checked:true,parts:0,shared:[],complete:true}` rather than calling `#independenceOf` -> **exit 1, 7 pass, 7 FAIL: A1 A2 A3 A5 B3 B4 C1. ARM B3 IS THE ONE THIS ITEM EXISTS FOR** — a shared origin recorded AFTER the write goes invisible again, which is exactly the defect. **THE DECLARATION FOR THIS ARM WAS WRONG IN TWO DIRECTIONS AND IS CORRECTED RATHER THAN SMOOTHED.** It predicted B1 would fail: B1 stayed GREEN, because the frozen literal happens to carry `shared: []` and `checked: true`, which is what B1 asserts — a surprising green, and it is a finding about the ARM. It also missed B4 and C1: C1 fails because freezing the value removes the second CALL SITE, which is the structural pin doing its job from an angle the declaration had not considered.
 *   (3) COLLAPSE `checked` INTO A CONSTANT `true` -> **exit 1, 12 pass, 2 FAIL: A2 and A3, exactly as declared.** `checked:false` is the D-129 half — *there was nothing to look for* is a different fact from *looked and found nothing* — and a constant erases it while every other field stays right.
 *   (4) COLLAPSE `complete` FROM `null` TO `true` WHEN NOTHING WAS WALKED -> **exit 1, 13 pass, 1 FAIL: A3 alone, exactly as declared.** A bound nothing tested did not hold. This is the narrowest arm and the one that proves A3 is load-bearing on its own rather than riding on A2.
 *   (5) BREAK THE ONE IMPLEMENTATION — give CHECK 4 its own inlined copy of the origin walk rather than calling `#independenceOf` -> **exit 1, 11 pass, 3 FAIL: B2, C1 and D1, exactly as declared.** Behaviour would be identical the day it was written, which is precisely the condition under which two implementations drift; C-22.4's receipt is a rule with two implementations leaving its suite green at 98 of 98 while one absorbed the other's control. Note B2 and D1 fall with C1: a drifted second walk stops REFUSING, so the gate goes with the pin.
 *   (6) OVER-STRICTNESS: make `#independenceOf` report a shared origin whenever two parts cite anything, ignoring provenance -> **exit 1, 5 pass, 9 FAIL**, including **ARM B1** (a genuinely independent reading reported as sharing) and the FIXTURE arm itself, because the write gate now refuses the correct submission the fixture is built on. **THE DECLARATION UNDERSTATED THIS ARM** — it named B1 only. That the fixture cannot even be built is the sharper result and is recorded as such: a fence this wide does not merely mis-report, it makes correct work unwritable. Correct work refused is the opposite defect and the worse one, and without this arm every other arm here is satisfied by a function that always answers "shared".
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* NULL-TOLERANT. An arm that throws on `.checked` of undefined takes every arm
   behind it with it and reports one defect as none — D-93's class, which this
   repository has now recorded inside a control nine times. */
const ind = (r) => (r && typeof r === "object" && r.independence && typeof r.independence === "object")
  ? r.independence : null;

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d271", MEMBER_TOKEN: "mem-d271", PROBE_TOKEN: "prb-d271", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const ns = await mf.getDurableObjectNamespace("STORE");
const doStub = ns.get(ns.idFromName("bio"));
const DO = async (p, body) => rP(await (await doStub.fetch("http://x/" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json());

try {

/* ------------------------------------------------------------------ fixture */
const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-d271",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const inquiryMd = (id) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "---", "",
  "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

const promote = async (id, text, type, register = []) => POST(`op=promote&token=${RUTH}`, {
  bundleId: id, base: null,
  snapKey: `${id}-${Math.random().toString(36).slice(2, 8)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register,
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : "collected",
          created: NOW, last_updated: LATER } });
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (!r.ok) throw new Error(`promote ${a[0]}: ${JSON.stringify(r).slice(0, 600)}`);
  return r;
};

const LEDGER = "INFO-2026-5000-ledger", MINUTES = "INFO-2026-5000-minutes";
const AUDIT = "INFO-2026-5000-audit", MIRROR = "INFO-2026-5000-mirror";
const CORPUS = [LEDGER, MINUTES, AUDIT, MIRROR];
for (const d of CORPUS)
  await mustPromote(d, infoMd(d), "information",
    [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${d}`), encoding: "binary", bytes: 10 }]);

/* D-195's SUBJECT: two DIFFERENT documents with two DIFFERENT captures retrieved
   from ONE address. Not one document cited twice — that would be caught by the
   bundle identity alone and would prove nothing about content-addressed
   provenance. The locator table is what says they came from the same place. */
const SHARED_ADDR = "https://example.gov/audit-2026.pdf";
for (const d of [AUDIT, MIRROR])
  await DO("recordcapturedlocator", { address: SHARED_ADDR, addressNorm: SHARED_ADDR,
                                      captureSha: sha(`capture-of-${d}`), retrieved: NOW });

const INQ = "INQ-2026-5000-sewer-transfers";
await mustPromote(INQ, inquiryMd(INQ), "inquiry");
const RUN = "RUN-2026-0809-d271";
{
  const opened = await POST(`op=airunopen&token=${RUTH}`, {
    run: RUN, contextType: "inquiry", contextId: INQ,
    label: "D-271 independence fixture", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000 });
  if (opened?.started !== true) throw new Error(`airunopen: ${JSON.stringify(opened)}`);
}
const suggest = async (body) => POST(`op=suggest&token=${RUTH}`, { target: INQ, run: RUN, ...body });
const strength = async (version) => GET(`op=versionstrength&token=${RUTH}&id=${INQ}`
  + `&version=${encodeURIComponent(version)}&states=suggested`);

/* THE FIXTURE IS ASSERTED NON-EMPTY AND ITS REACH PRINTED. A headline arm over
   an empty corpus has passed triumphantly three times in this repository. */
console.log(`  corpus: ${CORPUS.length} documents, ${CORPUS.length} captures, 1 shared upstream address`);
t("FIXTURE IS NON-EMPTY AND ARMS D-195's TRAP: four documents with four DISTINCT captures, two of "
+ "them retrieved from one upstream address — so a shared origin is a fact the record DERIVES rather "
+ "than one the bundle ids give away",
  [CORPUS.length, new Set(CORPUS.map((d) => sha(`capture-of-${d}`))).size,
   sha(`capture-of-${AUDIT}`) === sha(`capture-of-${MIRROR}`)],
  [4, 4, false]);

const ONE = "one route only", TWO = "two separate routes";
const landedOne = await suggest({ kind: "basis-version", name: ONE,
  description: "A single route to the answer, resting on the ledger the record already holds.",
  relationship: "and",
  grounds: [{ ground: "the ledger route" }],
  legs: [{ target: LEDGER, role: "supports", ground: "the ledger route" }] });
const landedTwo = await suggest({ kind: "basis-version", name: TWO,
  description: "Two routes to the answer, each resting on material the record can show came from a different place.",
  relationship: "or",
  grounds: [{ ground: "the ledger route" }, { ground: "the minutes route" }],
  legs: [{ target: LEDGER, role: "supports", ground: "the ledger route" },
         { target: MINUTES, role: "supports", ground: "the minutes route" }] });
t("FIXTURE LANDED BOTH SHAPES — one reading declaring a single separately sufficient part and one "
+ "declaring two with no shared origin. Without both, every arm below is about one case",
  [landedOne.ok, landedTwo.ok], [true, true]);

/* ====================================================================== A
 * THE THREE CASES THE OLD FIELD COULD NOT TELL APART.
 * ==================================================================== */
console.log("\n--- A. did the plane look, and what did it find ---");
{
  const a = ind(await strength(ONE)), b = ind(await strength(TWO));

  t("ARM A1 — `independence` IS PUBLISHED ON THE READ, which is the half CHECK 4's sentence claimed "
  + "and did not provide: the derivation went out on `op=suggest`'s own WRITE answer and on no read, "
  + "so a member at the ceremony affirmed against nothing",
    [a === null, b === null, a?.parts, b?.parts], [false, false, 1, 2]);

  t("ARM A2 — DID THE PLANE LOOK. A reading declaring ONE part has no independence to claim, so the "
  + "walk never runs and `checked:false` says exactly that. The shape this replaced published `[]` "
  + "here, which reads as LOOKED AND FOUND NOTHING — D-129 at the field grain",
    [a?.checked, b?.checked], [false, true]);

  t("ARM A3 — AND `complete` IS `null` RATHER THAN `true` WHEN NOTHING WAS WALKED. A bound nothing "
  + "tested did not hold, and `true` there would be the answer claiming a completed walk it never made",
    [a?.complete, b?.complete], [null, true]);

  t("ARM A4 — the bound APPLIED is PUBLISHED rather than left for a consumer to infer, on both "
  + "shapes, so a reader can tell a clean answer from one that ran out of room",
    [a?.limit, b?.limit, typeof a?.limit], [200, 200, "number"]);

  t("ARM A5 — AND THE THREE CASES ARE DISTINGUISHABLE, which is the whole point: the one-part and "
  + "the two-part answers are not byte-identical. The field this replaced WAS byte-identical across "
  + "exactly these two readings, measured",
    JSON.stringify(a) === JSON.stringify(b), false);
}

/* ====================================================================== B
 * THE READ IS NOT A REPLAY OF THE WRITE.
 * ==================================================================== */
console.log("\n--- B. recomputed against the record, not frozen at the write ---");
{
  t("ARM B1 — a two-part reading with genuinely separate origins reports NO shared origin. This is "
  + "the arm a function that always answered `shared` would fail",
    [ind(await strength(TWO))?.shared, ind(await strength(TWO))?.checked], [[], true]);

  const shared = await suggest({ kind: "basis-version", name: "two routes one origin",
    description: "Two routes that look separate and rest on material retrieved from a single upstream place.",
    relationship: "or",
    grounds: [{ ground: "the audit route" }, { ground: "the mirror route" }],
    legs: [{ target: AUDIT, role: "supports", ground: "the audit route" },
           { target: MIRROR, role: "supports", ground: "the mirror route" }] });
  t("ARM B2 — OVER-STRICTNESS, THE WRITE GATE'S SIDE: the shared-origin submission is REFUSED by "
  + "C-number while the genuinely independent one above LANDED. D-195 refuses a derived overlap, not "
  + "the practice of offering alternatives, and both halves are needed to say so",
    [shared.ok, shared.code, landedTwo.ok],
    [false, "SUGGEST_BRANCHES_NOT_INDEPENDENT", true]);

  /* THE ARM THIS ITEM EXISTS FOR. `TWO` passed CHECK 4 at its write. Provenance
     recorded AFTERWARDS ties both of its parts to one upstream address — the
     case the write gate cannot reach by construction, and the one a member at
     the ceremony most needs to be shown. */
  const before = ind(await strength(TWO));
  const LATE_ADDR = "https://example.gov/one-upstream-source.pdf";
  for (const d of [LEDGER, MINUTES])
    await DO("recordcapturedlocator", { address: LATE_ADDR, addressNorm: LATE_ADDR,
                                        captureSha: sha(`capture-of-${d}`), retrieved: NOW });
  const after = ind(await strength(TWO));
  t("ARM B3 — THE READ RECOMPUTES AGAINST THE RECORD AS IT STANDS. A locator recorded AFTER the "
  + "write ties both parts of an already-landed reading to one upstream address, and the ceremony's "
  + "read SAYS SO. No write-time snapshot could carry this: CHECK 4 cannot refuse what did not exist "
  + "when it ran, and a stored verdict would still read `clear` while the record shows otherwise",
    [(before?.shared ?? []).length, (after?.shared ?? []).length,
     after?.shared?.[0]?.through?.[0]],
    [0, 1, `address:${LATE_ADDR}`]);

  t("ARM B4 — and the shared origin is NAMED rather than merely counted, on the READ as it already "
  + "was on the write's refusal: a member deciding whether to affirm has to be told WHICH material "
  + "the two parts have in common",
    [after?.shared?.[0]?.a, after?.shared?.[0]?.b],
    ["the ledger route", "the minutes route"]);
}

/* ====================================================================== C
 * ONE IMPLEMENTATION, TWO CONSUMERS.
 * ==================================================================== */
console.log("\n--- C. the gate and the ceremony cannot come to disagree ---");
{
  /* STRUCTURAL, and it needs to be. The write gate and the read agree on every
     input the suite can reach TODAY, which is exactly the condition under which
     a second implementation drifts unnoticed — IS-6's C-22.4 receipt is a rule
     with two implementations leaving its suite green at 98 of 98 because one
     absorbed the other's control. Only a pin on the COUNT can see it. */
  const decomment = (src) => src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/gm, (m, p) => p + " ".repeat(m.length - p.length));
  const CODE = decomment(STORE_SRC);
  const defs = (CODE.match(/#independenceOf\s*\(/g) || []).length;
  const calls = (CODE.match(/this\.#independenceOf\s*\(/g) || []).length;
  const walks = (CODE.match(/FROM captured_locators WHERE capture_sha=\?/g) || []).length;
  console.log(`  reach: 1 definition expected, ${calls} call site(s) found, ${walks} locator walk(s) in the file`);
  t("ARM C1 — ONE DEFINITION, TWO CALL SITES, AND EXACTLY ONE ORIGIN WALK IN THE FILE. The write "
  + "gate and the ceremony's read are the two consumers, and a second inlined walk is what this pin "
  + "exists to catch — behaviour would be identical the day it was written",
    [defs - calls, calls, walks], [1, 2, 1]);

  t("ARM C2 — and what the walk can and cannot see, stated rather than implied: it derives from "
  + "`register` (capture shas) and `captured_locators` (addresses), so it sees a shared BUNDLE, a "
  + "shared CAPTURE and a shared ADDRESS. It cannot see two documents that came from one place "
  + "without the record holding a locator saying so — absence here is D-129's `did not look`",
    [CODE.includes("FROM register WHERE bundle_id=?"),
     CODE.includes("FROM captured_locators WHERE capture_sha=?")],
    [true, true]);
}

/* ====================================================================== D
 * THE GATE IS STILL A GATE.
 * ==================================================================== */
console.log("\n--- D. publishing the derivation did not soften the refusal ---");
{
  const again = await suggest({ kind: "basis-version", name: "another shared pair",
    description: "A second submission whose two routes rest on material retrieved from the same upstream place.",
    relationship: "or",
    grounds: [{ ground: "route p" }, { ground: "route q" }],
    legs: [{ target: AUDIT, role: "supports", ground: "route p" },
           { target: MIRROR, role: "supports", ground: "route q" }] });
  t("ARM D1 — DERIVED INFORMS, AUTHORED BINDS, both halves intact: the derivation is REFUSED to a "
  + "machine composing at volume and PUBLISHED to the member who has to affirm it. Publishing it on "
  + "the read must not have turned the write gate into a warning",
    [again.ok, again.code], [false, "SUGGEST_BRANCHES_NOT_INDEPENDENT"]);
}

} catch (e) {
  console.log(`  FAIL  BLOCK DIED: ${e && e.stack ? e.stack : e}`);
  fail++;
} finally {
  await mf.dispose();
}

/* THE FOOT. A `TypeError` inside an assertion goes through no assertion at all —
   it ends the module while the tally reads clean — so this line existing in the
   output is what says the suite reached its own end. */
console.log(`\nindependence: ${pass} pass, ${fail} fail`);
/* EXITS ON ITS OWN RESULT, never implicitly — `hygiene.test.mjs` enforces this
   over the last 400 bytes of every suite, and it caught this file on its first
   full battery run written as `if (fail) process.exit(1)`. That spelling exits 0
   by falling off the end, and a suite whose green is the ABSENCE of an exit
   cannot be told from one that died before reaching here. */
process.exit(fail ? 1 : 0);
