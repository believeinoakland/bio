/* NEGATIVE CONTROL: RUN 2026-09-19 (rec146-record), SIX arms, all SIX AS DECLARED, every arm armed ALONE with every other held open and every file restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by `cmp` with a byte count printed and a minimum guarded (never `git checkout --`). The arms live in `test/nc-rec146.mjs` and re-run in one step with `cd bio-plane && node test/nc-rec146.mjs [arm]`; each declares BEFORE arming what MUST fail and what MUST NOT, and the harness checks BOTH — an arm that takes the whole suite down proves nothing about what it broke. An arm whose anchor matches other than once is reported as ARM DID NOT ARM and is SKIPPED rather than run.
 * BASELINE ROW FIRST, and it is not decoration: **baseline 43/0** (nothing armed) is the row that tells six-arms-working from six-arms-broken.
 *   (a) `viewer` — THE FAIL-CLOSED ARM: `|| op === "contradictionpairs"` removed from index.mjs's viewer-stamp condition, so the op arrives with no viewer and `viewerPredicate` answers DENY. MEASURED **16/27**, `must fail` ALL FOUR KEYS FORM = true, `must pass` AN UNKNOWN KEY IS REFUSED BY NAME = true (a missing stamp is an outage, never a leak). AND THE ARM CHECKS WHAT THE DENIED ANSWER SAID rather than only that it went empty: the S0 assertion comes back `["viewer","viewer","viewer","viewer"]`, so the four keys name the OUTAGE and not a sparse record — which is this op's whole hazard, because an empty contradiction report that does not say it compared nothing reads as A RECORD WITH NO CONTRADICTIONS. Restored 666610 B, sha cfe27b4c9357.
 *   (b) `level` — THE ITEM'S OWN ARM: in store.mjs `contradictionPairs`, `const empty = ladder.find((r) => !r.present)` replaced by the constant `{ level: "inquiry" }`, so every key names the same level whatever the record holds. MEASURED **36/7**, `must fail` THE WALK, AS A SET = true, `must pass` ALL FOUR KEYS FORM = true. **THAT SECOND HALF IS THE FINDING AND IT IS WHY THIS ARM EXISTS: every pair-forming assertion stays GREEN.** A detector can be exactly right about what it compared and lying about what it found nothing in, and nothing but an assertion about the LEVEL can see the difference.
 *   (c) `undetermined` — THE GUESS: the `datesKnown &&` guard dropped from `#contradictionK4`'s discriminator, so a date nobody stated counts as a date that differs and the pair forms on an absence. MEASURED **38/5**, `must fail` THE PAIR WITH A DATE NOBODY STATED = true, `must pass` OVER-STRICTNESS, ASKED BY IDENTITY = true. **THIS ARM'S FIRST RUN CAME BACK NOT AS DECLARED AND THE ARM WAS RIGHT — THE DECLARATION WAS WRONG.** The over-strictness assertion as first written asserted the COUNT of K4 pairs, and a LOOSENING adds pairs, so it fell too: one assertion could not tell a fence too TIGHT from one too LOOSE, which are opposite defects. The suite gained an over-strictness assertion asked BY IDENTITY (does the legitimate pair survive?) beside the count one, and the declaration was corrected to name it. Recorded rather than smoothed.
 *   (d) `dedup` — `d2.bundle_id > d1.bundle_id` weakened to `<>` in K2, so one pair is counted twice, once from each side. MEASURED **37/6**, `must fail` no pair is counted twice = true, `must pass` S0 EMPTY STORE = true. The finding beside it: a figure that is exactly DOUBLE is still a figure, and only an assertion about the SET of pairs can see it.
 *   (e) `overstrict` — THE OVER-STRICTNESS DIRECTION, a fence tighter than its rule wearing the costume of caution: `v1.name = v2.name` added to `#contradictionK3Same`, i.e. "compare like with like", which drops the legitimate K3 pair. MEASURED **38/5**, `must fail` ALL FOUR KEYS FORM = true, `must pass` S0 EMPTY STORE = true. **AND IT SURFACED SOMETHING WORTH CARRYING: a join narrowed too far does not merely lose pairs — it makes the ABSENCE STATEMENT LIE.** K3 then reports `shared_referent`, i.e. "no two claims read the same text", over a record where two of them do. The honesty mechanism is only as honest as the join beneath it, and no arm in this file can see that on its own.
 *   (f) `baseline` — see above.
 *
 * REC-146 / IC-167 — CONTRADICTION'S IDENTIFY, 1 of 3: THE PAIRING READ.
 * `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` section 9 item 1, beneath
 * `BIO_Case_Making_v0_1.md` section CONTRADICTION.
 *
 * WHAT THIS SUITE IS FOR, and it is NOT "the op returns pairs".
 *
 * The row's own words: *the plane forms candidate pairs by the four keys,
 * viewer-gated and bounded per key, and STATES WHICH LEVEL WAS EMPTY. No
 * judgement and no write.* The last clause of the first sentence is the item.
 * `CLAUDE.md`: *sparse is normal at every level, and absence at one level is not
 * evidence of absence at the next. Saying WHICH is true is a first-class
 * obligation.* An answer that says "no pairs found" without saying which level
 * was empty is the defect this row exists to prevent, and it is a defect that
 * makes the RECORD CLAIM MORE THAN IT CAN SUPPORT — on a contradiction detector,
 * a bare zero reads as THE RECORD IS CONSISTENT.
 *
 * SO EVERY ACCEPTANCE ASSERTION BELOW WAS WRITTEN AGAINST THE CHEAPEST LIE THAT
 * WOULD MAKE IT GREEN, and where the cheap lie would also pass, the assertion is
 * stronger than it looks. The four that matter:
 *
 *   1. "IT FORMS PAIRS" is cheapest satisfied by a hardcoded list. So no pair is
 *      asserted by a literal this suite typed: every id in an expected pair is one
 *      the FIXTURE minted at run time, and section 2 asserts the pair counts MOVE
 *      when the fixture grows (1 -> 3 on two keys). A constant cannot move.
 *
 *   2. "IT STATES WHICH LEVEL WAS EMPTY" is cheapest satisfied by one canned
 *      sentence. So section 3 walks ONE store through SIX states and demands SIX
 *      DIFFERENT level names out of the same op — empty, documents-only,
 *      question-with-no-legs, legs-all-one-way, both-sides-no-resolution, and
 *      formed. A canned sentence fails at the second state.
 *
 *   3. "IT IS BOUNDED" is cheapest satisfied by a bound nothing ever reaches. So
 *      section 4 drives truncation ON and OFF over the SAME corpus and asserts
 *      both directions: `truncated` true with the page cut to the bound, and
 *      false at the default with every pair present. A constant fails one.
 *
 *   4. "A DATE IT DOES NOT HOLD IS UNDETERMINED" is cheapest satisfied by a zero
 *      counter, or by forming the pair anyway. So section 5 asserts BOTH — the
 *      counter is non-zero AND the pair is absent from `pairs` — over a fixture
 *      where the only thing missing is the date, beside a pair of the same shape
 *      whose dates ARE stated, which MUST form. One arm cannot pass both.
 *
 * AND THE VIEWER ARM IS THE NEGATIVE CONTROL'S, not this file's, for a reason
 * worth stating: the control plane STAMPS the viewer on every op in its
 * fail-closed list, so no call this suite can make reaches `scope: DENY`. Arm (a)
 * removes the op from that list, which is the only door to it — and the assertion
 * it fails on is not "the answer is empty" but "the answer SAYS it compared
 * nothing", because an empty contradiction report that does not say so is the
 * lie this whole item is built against.
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { CONTRADICTION_PAIR_CHECKS } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r146", MEMBER_TOKEN: "mem-r146", PROBE_TOKEN: "prb-r146", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "adm-r146", qs = "") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs = "", tok = "adm-r146") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const NOW = "2026-09-19T00:00:00Z";
const LATER = "2026-09-19T01:00:00Z";

/* NULL-TOLERANT READERS, so an arm that breaks the answer's SHAPE names the
   assertions it broke instead of ending the module on a TypeError — the
   `-1`-never-`0` rule in kickoffs/WORKER.md, applied to the reader rather than
   to the tally. */
const keyOf = (r, k) => (r && Array.isArray(r.keys) ? r.keys.find((x) => x && x.key === k) : null) ?? null;
const levelOf = (r, k) => { const x = keyOf(r, k); return x ? (x.absence ? x.absence.level : null) : "NO-SUCH-KEY"; };
const formedOf = (r, k) => { const x = keyOf(r, k); return x ? x.formed : -1; };
const pairsOf = (r, k) => (r && Array.isArray(r.pairs) ? r.pairs.filter((p) => p && p.key === k) : []);
/* A pair as an ORDER-FREE identity, so an assertion is about WHICH two things
   were paired and never about which came back first. */
const idOf = (p) => [p.a, p.b].map((s) => [s.inquiry, s.version, s.ord, s.content_id]
  .map((v) => (v === undefined || v === null ? "-" : String(v))).join("|")).sort().join(" <> ");
const idsOf = (r, k) => pairsOf(r, k).map(idOf).sort();

try {

/* ------------------------------------------------------------------ fixture */
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role || "supports"}`])]
  : [];
const versionLines = (versions) => versions.length ? [
  "basis_versions:",
  ...versions.map((v) => [`  - name: "${v.name}"`,
    `    description: "A reading of this question, written by the fixture."`,
    `    relationship: "and"`, `    state: "${v.state || "accepted"}"`,
    ...(v.state === "suggested" ? [] : [`    state_by: "ruth"`, `    state_at: "${NOW}"`]),
    `    derived_from: null`, `    hidden: ${v.hidden ? "true" : "false"}`,
    ...(v.claim === null ? [] : [`    claim: "${v.claim}"`]),
    `    author: "ruth"`, `    at: "${NOW}"`].join("\n")),
  "basis_version_grounds:",
  ...versions.map((v) => [`  - version: "${v.name}"`, `    ground: "the record"`,
    `    asserted_by: "ruth"`, `    at: "${NOW}"`].join("\n")),
  "basis_version_legs:",
  ...versions.flatMap((v) => v.legs.map((l) => [`  - version: "${v.name}"`,
    `    target: "${l.target}"`, `    role: "${l.role || "supports"}"`,
    `    ground: "the record"`].join("\n"))),
] : [];

const inquiryMd = (id, { refs = [], legs = [], versions = [], subject = null } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(refs.length ? ["references:", ...refs.flatMap((x) => [`  - target: ${x}`, "    rel: cites",
                                                            "    status: confirmed"])] : ["references: []"]),
  "state_history: []",
  ...(subject ? [`subject_entity: ${subject}`] : []),
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs), ...versionLines(versions),
  "---", "", "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const HEAD = new Map();
const mustPromote = async (id, text, type, { readings = [] } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (readings.length) {
    const prov = JSON.stringify({ documents: readings });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260919T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
    files }, "adm-r146");
  if (r.ok === false) throw new Error(`promote ${id} REFUSED: ${JSON.stringify(r).slice(0, 900)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

const chain = (pages) => [{ step: "pixels", extent: { kind: "pages", pages } }];
/* A READING, WITH ITS DOCTYPE AND ITS DATE AS THE READER WOULD STATE THEM — and
   each independently OMITTABLE, because the undetermined arms are the item and a
   fixture that could not leave a field out could not drive them. */
const readingOf = (captureSha, { doctype = "meeting_agenda", date = null, refs = [] } = {}) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { ...(doctype === null ? {} : { content_type: doctype }), reader_version: 1,
             found: refs.length > 0, at: NOW, ...(date === null ? {} : { date }),
             entities: refs, text_source: chain([0, 1]) } });
const entRef = (key, kind, label) => ({ ref: `${kind}:${key}`, kind, key, label,
                                        source: { kind: "pdf-page", ref: "page 1", page: 0 } });
const pairsRead = (qs = "", tok = "adm-r146") => get("contradictionpairs", qs, tok);

/* ===== 1. THE EMPTY-LEVEL STATEMENT, WALKED THROUGH SIX STATES OF ONE STORE ===
 *
 * THE CENTRAL SECTION. `CLAUDE.md`: absence at one level is not evidence of
 * absence at the next, and saying WHICH is true is a first-class obligation.
 * The SAME op is asked SIX times of ONE store as the record fills, and it must
 * give a DIFFERENT answer each time. A canned "nothing found" passes state 0 and
 * fails state 1; a level derived from the corpus cannot be faked cheaply.
 */
console.log("\n--- 1. which level was empty, walked through six states of one store ---");

const s0 = await pairsRead();
t("S0 EMPTY STORE: K1/K2/K3 say the QUESTION level is empty, K4 says the CONTENT level is — "
+ "four keys, and they do NOT all say the same thing about the same empty store",
  [levelOf(s0, "K1"), levelOf(s0, "K2"), levelOf(s0, "K3"), levelOf(s0, "K4")],
  ["inquiry", "inquiry", "inquiry", "content"]);
t("S0: and the sentence says SPARSE rather than CONSISTENT — it names what the absence is NOT "
+ "evidence of",
  [/EMPTY at the question level/.test(keyOf(s0, "K1")?.absence?.says ?? ""),
   /says nothing whatever/.test(keyOf(s0, "K1")?.absence?.says ?? ""),
   /SPARSE there, not that it is consistent/.test(s0.says ?? "")],
  [true, true, true]);

/* S1 — two documents, read, with nothing resting on them. */
const ENT = (await post("entitycreate",
  { kind: "ordinance", label: "Sewer Fund Transfer", aliases: ["ordinance:24680"] }, "adm-r146")).entity_id;
const ENT2 = (await post("entitycreate",
  { kind: "fund", label: "Park Maintenance Fund", aliases: ["fund:5150"] }, "adm-r146")).entity_id;
const SHA_RULE = sha("r146-rule"), SHA_MIN = sha("r146-minutes");
const DOC_RULE = "INFO-2026-1460-rule", DOC_MIN = "INFO-2026-1460-minutes";
const ordRef = entRef("24680", "ordinance", "Ordinance No. 24680");
await mustPromote(DOC_RULE, infoMd(DOC_RULE), "information",
  { readings: [readingOf(SHA_RULE, { doctype: "regulation", date: "2026-03-02", refs: [ordRef] })] });
await mustPromote(DOC_MIN, infoMd(DOC_MIN), "information",
  { readings: [readingOf(SHA_MIN, { doctype: "meeting_minutes", date: "2026-10-05", refs: [ordRef] })] });

const s1 = await pairsRead();
t("S1 TWO DOCUMENTS READ, NOTHING RESTING ON THEM: the question level is STILL the empty one for "
+ "K1, and K4 still says CONTENT — holding documents is not holding content (DEC-23)",
  [levelOf(s1, "K1"), levelOf(s1, "K4")], ["inquiry", "content"]);

/* S2 — a question that rests on nothing. */
const INQ_BARE = "INQ-2026-1460-bare";
await mustPromote(INQ_BARE, inquiryMd(INQ_BARE), "inquiry");
const s2 = await pairsRead();
t("S2 A QUESTION THAT RESTS ON NOTHING: K1 moves off `inquiry` to `leg`, K3 to `reading`, and K2 "
+ "to `subject` — three keys, three DIFFERENT next-empty levels over one store",
  [levelOf(s2, "K1"), levelOf(s2, "K2"), levelOf(s2, "K3")], ["leg", "subject", "reading"]);

/* S3 — a question resting on both documents, both legs the SAME way. */
const INQ_ONE = "INQ-2026-1460-one";
await mustPromote(INQ_ONE, inquiryMd(INQ_ONE, { refs: [DOC_RULE, DOC_MIN], subject: ENT,
  legs: [{ target: DOC_RULE, role: "supports" }, { target: DOC_MIN, role: "supports" }] }), "inquiry");
const s3 = await pairsRead();
t("S3 BOTH LEGS THE SAME WAY: K1 moves to `role` — the legs exist and NONE of them cuts against. "
+ "That is a fact about how the question is argued, not about the world",
  levelOf(s3, "K1"), "role");
t("S3: and K4 moves to `resolution` — passages are now cited, and nobody has established what "
+ "either document is ABOUT, so there is no entity to pair them under",
  levelOf(s3, "K4"), "resolution");

/* S4 — the same question, one leg turned round. */
await mustPromote(INQ_ONE, inquiryMd(INQ_ONE, { refs: [DOC_RULE, DOC_MIN], subject: ENT,
  legs: [{ target: DOC_RULE, role: "supports" }, { target: DOC_MIN, role: "cuts_against" }] }), "inquiry");
const s4 = await pairsRead();
t("S4 ONE LEG TURNED ROUND: K1 FORMS ITS PAIR and its absence is null — and K4 is still stuck at "
+ "`resolution`, which is the whole point: one key filling does not fill another",
  [formedOf(s4, "K1"), levelOf(s4, "K1"), levelOf(s4, "K4")], [1, null, "resolution"]);

/* S5 — the documents resolved to the subject they are both about. */
const rr = await post("resolve", { captureSha: SHA_RULE }, "adm-r146");
const rm = await post("resolve", { captureSha: SHA_MIN }, "adm-r146");
t("S5 GROUND: both documents resolve to the SAME registered subject, established (grade A/B)",
  [(rr.resolved || []).some((r) => r.entity_id === ENT && r.established),
   (rm.resolved || []).some((r) => r.entity_id === ENT && r.established)], [true, true]);
const s5 = await pairsRead();
t("S5 RESOLVED: K4 forms its pair and its absence goes null — SIX states of one store, and the "
+ "level this op names moved at every one of them",
  [formedOf(s5, "K4"), levelOf(s5, "K4")], [1, null]);
t("THE WALK, AS A SET: six readings of ONE op over ONE filling store named SEVEN DIFFERENT levels "
+ "as the empty one. A canned sentence names one, and this assertion is the whole reason the walk is "
+ "six states long rather than one",
  [...new Set([s0, s1, s2, s3, s4, s5].flatMap((r) => ["K1", "K2", "K3", "K4"].map((k) => levelOf(r, k))))]
    .filter((x) => x !== null).sort().join(","),
  "content,inquiry,leg,reading,resolution,role,subject");
/* `claim` IS NOT IN THAT SET AND ITS ABSENCE IS A MEASURED FINDING, not a gap: this
   fixture cannot reach it, because the only route to an accepted reading here writes a
   claim with it. A reading accepted with no claim would land on `claim`, and the rung
   is kept for that record rather than deleted for being unwalked by this corpus. */

/* ===== 2. THE FOUR KEYS FORM, AND THE ANSWER IS DERIVED RATHER THAN RECITED == */
console.log("\n--- 2. the four keys, each pair carrying the key that brought it together ---");

const C1 = "The ordinance requires the transfer be reported quarterly.";
const C2 = "The ordinance requires no reporting of the transfer at all.";
const C3 = "The ordinance requires the transfer be reported once a year.";
const INQ_TWO = "INQ-2026-1460-two", INQ_THREE = "INQ-2026-1460-three";
const oneWithReading = () => inquiryMd(INQ_ONE, { refs: [DOC_RULE, DOC_MIN], subject: ENT,
  legs: [{ target: DOC_RULE, role: "supports" }, { target: DOC_MIN, role: "cuts_against" }],
  versions: [{ name: "reading one", claim: C1, legs: [{ target: DOC_RULE }] }] });
await mustPromote(INQ_ONE, oneWithReading(), "inquiry");
await mustPromote(INQ_TWO, inquiryMd(INQ_TWO, { refs: [DOC_RULE], subject: ENT,
  legs: [{ target: DOC_RULE, role: "supports" }],
  versions: [{ name: "reading two", claim: C2, legs: [{ target: DOC_RULE }] }] }), "inquiry");

const full = await pairsRead();
t("ALL FOUR KEYS FORM, one pair each, over a corpus of two documents and three questions",
  ["K1", "K2", "K3", "K4"].map((k) => formedOf(full, k)), [1, 1, 1, 1]);
t("AND EVERY PAIR CARRIES ITS KEY — section 4: the member judging it needs to know WHY these two "
+ "were put side by side",
  full.pairs.map((p) => p.key).sort(), ["K1", "K2", "K3", "K4"]);
t("K2's pair is the two questions sharing the registered subject, NAMED BY IDS THE FIXTURE MINTED "
+ "— not a literal this suite typed",
  idsOf(full, "K2"),
  [[`${INQ_ONE}|reading one|-|-`, `${INQ_TWO}|reading two|-|-`].sort().join(" <> ")]);
t("and it quotes BOTH claims verbatim, with the reading each is held on",
  pairsOf(full, "K2").flatMap((p) => [p.a.claim, p.b.claim, p.a.version, p.b.version]),
  [C1, C2, "reading one", "reading two"]);
t("K3's pair is the two ACCEPTED readings resting on the same passage, and the passage is named",
  [pairsOf(full, "K3")[0]?.referent_grain ?? null,
   typeof pairsOf(full, "K3")[0]?.content_id === "string"], ["passage", true]);
t("K1's two sides are the SUPPORTING and the CUTTING leg of ONE question, each resolved to the "
+ "passage it rests on (a content id alone tells a reader nothing)",
  [pairsOf(full, "K1")[0]?.a?.role ?? null, pairsOf(full, "K1")[0]?.b?.role ?? null,
   pairsOf(full, "K1")[0]?.a?.capture_sha ?? null, pairsOf(full, "K1")[0]?.b?.capture_sha ?? null],
  ["supports", "cuts_against", SHA_RULE, SHA_MIN]);
t("K4's pair is the two documents established on one subject, and it SAYS which discriminator "
+ "formed it — a regulation against minutes, Bob's first example",
  [pairsOf(full, "K4")[0]?.discriminator ?? null,
   [pairsOf(full, "K4")[0]?.a?.doctype ?? null, pairsOf(full, "K4")[0]?.b?.doctype ?? null].sort()],
  ["doctype", ["meeting_minutes", "regulation"]]);

/* THE COUNTS MOVE. A hardcoded answer cannot. */
await mustPromote(INQ_THREE, inquiryMd(INQ_THREE, { refs: [DOC_RULE], subject: ENT,
  legs: [{ target: DOC_RULE, role: "supports" }],
  versions: [{ name: "reading three", claim: C3, legs: [{ target: DOC_RULE }] }] }), "inquiry");
const grown = await pairsRead();
t("A THIRD QUESTION ON THE SAME SUBJECT: K2 and K3 go 1 -> 3 (every unordered pair of three), and "
+ "K1 and K4 do NOT move — the keys are independent joins, not one query wearing four names",
  ["K1", "K2", "K3", "K4"].map((k) => formedOf(grown, k)), [1, 3, 3, 1]);
t("and no pair is counted twice: three questions give THREE distinct unordered pairs, never six",
  [idsOf(grown, "K2").length, new Set(idsOf(grown, "K2")).size], [3, 3]);

/* ===== 3. THE BOUND, DRIVEN IN BOTH DIRECTIONS ========================== */
console.log("\n--- 3. bounded per key, and the bound is stated — both directions over one corpus ---");

const cut = await pairsRead("limit=1");
t("AT limit=1 OVER THE SAME CORPUS: K2 and K3 are CUT to one pair and SAY SO; K1 and K4 hold one "
+ "pair each and are NOT truncated — a bound that were always true would fail here",
  ["K1", "K2", "K3", "K4"].map((k) => [formedOf(cut, k), keyOf(cut, k)?.truncated ?? null]),
  [[1, false], [1, true], [1, true], [1, false]]);
t("AND AT THE DEFAULT, THE SAME CORPUS IS NOT TRUNCATED — the over-strictness direction, which a "
+ "bound that were always TRUE would fail",
  ["K1", "K2", "K3", "K4"].map((k) => keyOf(grown, k)?.truncated ?? null), [false, false, false, false]);
t("the answer publishes the bound it was read at AND the plane's own ceiling, so a capped answer "
+ "can never be mistaken for a complete one",
  [cut.limit, cut.bound, cut.bounded, grown.limit], [1, 50, true, 50]);
t("a limit above the ceiling is CLAMPED and the clamp is published, never refused",
  (await pairsRead("limit=99999")).limit, 50);

/* ===== 4. UNDETERMINED IS COUNTED, AND THE PAIR IS NOT FORMED ON A GUESS === */
console.log("\n--- 4. a date or a doctype the reader never stated: counted, never guessed ---");

/* Three agenda documents about ONE second subject. Two state a date and one does
   not; two state the SAME date. So the same key, over one entity, must produce
   all three outcomes at once — a pair FORMED on a date that differs, a pair left
   UNFORMED for a date nobody stated, and a pair that is simply not a candidate
   because the two are indistinguishable. An arm that returned zero for the
   counter, and an arm that formed the pair anyway, each fail a different one. */
const SHA_AG1 = sha("r146-ag1"), SHA_AG2 = sha("r146-ag2"), SHA_AG3 = sha("r146-ag3");
const AG1 = "INFO-2026-1460-ag1", AG2 = "INFO-2026-1460-ag2", AG3 = "INFO-2026-1460-ag3";
const progRef = entRef("5150", "fund", "Park Maintenance Fund 5150");
await mustPromote(AG1, infoMd(AG1), "information",
  { readings: [readingOf(SHA_AG1, { doctype: "meeting_agenda", date: "2026-05-01", refs: [progRef] })] });
await mustPromote(AG2, infoMd(AG2), "information",
  { readings: [readingOf(SHA_AG2, { doctype: "meeting_agenda", date: null, refs: [progRef] })] });
await mustPromote(AG3, infoMd(AG3), "information",
  { readings: [readingOf(SHA_AG3, { doctype: "meeting_agenda", date: "2026-05-01", refs: [progRef] })] });
const INQ_PARK = "INQ-2026-1460-park";
await mustPromote(INQ_PARK, inquiryMd(INQ_PARK, { refs: [AG1, AG2, AG3],
  legs: [{ target: AG1 }, { target: AG2 }, { target: AG3 }] }), "inquiry");
for (const s of [SHA_AG1, SHA_AG2, SHA_AG3]) await post("resolve", { captureSha: s }, "adm-r146");

const und = await pairsRead("key=K4");
const k4 = keyOf(und, "K4");
t("GROUND: the three agendas are cited, established on one subject, and the pairing sees all "
+ "three unordered pairs of them (plus the original regulation/minutes pair)",
  [k4?.formed ?? -1, (k4?.undetermined ?? -1) + (k4?.indistinct ?? -1) + (k4?.formed ?? -1)], [1, 4]);
t("THE PAIR WITH A DATE NOBODY STATED IS **NOT FORMED**, and it is COUNTED — two of them, both "
+ "against the agenda whose reader stated no date",
  [k4?.undetermined ?? -1, k4?.undetermined_detail?.no_date ?? -1], [2, 2]);
t("AND THE PAIR OF THE SAME KIND ON THE SAME DATE IS A THIRD ANSWER AGAIN — not a candidate, and "
+ "not counted as undetermined either: nothing was missing, the two simply cannot be told apart",
  k4?.indistinct ?? -1, 1);
t("the note says so IN WORDS and refuses the inference — `that is not evidence the two agree`",
  /NOT formed because a doctype or a document date their readers never stated/.test(
    (k4?.notes ?? []).join(" ")) && /not evidence the two agree/.test((k4?.notes ?? []).join(" ")), true);
t("OVER-STRICTNESS, ASKED BY IDENTITY AND NOT BY COUNT: the pair whose kinds ARE both stated and "
+ "DIFFER is still among the formed pairs. **This assertion is the correction the negative control "
+ "forced, and the mistake is worth keeping**: the first version asserted the COUNT, which also "
+ "falls when a broken guess ADDS pairs — so it could not tell a fence that is too TIGHT from one "
+ "that is too LOOSE, which are opposite defects. An over-strictness arm must ask whether the "
+ "legitimate work SURVIVED, never how much work there was",
  pairsOf(und, "K4").some((p) => p.discriminator === "doctype"
    && [p.a.doctype, p.b.doctype].sort().join(",") === "meeting_minutes,regulation"), true);
t("and the loose direction is asked separately: exactly ONE pair is formed over this corpus, so a "
+ "guess that formed pairs on an unstated date would be caught HERE and not by the arm above",
  [pairsOf(und, "K4").length, pairsOf(und, "K4")[0]?.discriminator ?? null], [1, "doctype"]);
t("and the answer's own sentence carries the undetermined count, so a reader of the headline "
+ "cannot miss it",
  /2 further pair\(s\) were NOT formed/.test(und.says ?? ""), true);

/* ===== 5. NO JUDGEMENT, AND NO WRITE ==================================== */
console.log("\n--- 5. it judges nothing and writes nothing, and says both ---");

const before = await get("stats");
const again = await pairsRead();
const after = await get("stats");
t("NOTHING WAS WRITTEN: every count the plane reports is byte-identical across the read",
  JSON.stringify(before) === JSON.stringify(after), true);
t("and the answer SAYS it wrote nothing rather than leaving a reader to assume it",
  again.wrote, false);
t("NO PAIR CARRIES A LABEL, A VERDICT OR A SCORE — not one of section 5's five words appears on "
+ "any pair, because assigning one is work this plane has not done",
  again.pairs.some((p) => ["label", "verdict", "score", "conflict", "kind_of_conflict"]
    .some((f) => Object.prototype.hasOwnProperty.call(p, f))
    || /\b(world|record|precision|unrelated|undetermined)\b/.test(String(p.label ?? ""))), false);
t("the answer states the judgement step is NOT REACHED and names the item that will reach it — an "
+ "empty verdict column would have read as a detector that declined to label",
  [again.judgement?.state ?? null, /section 9 item 3/.test(again.judgement?.item ?? "")],
  ["NOT_REACHED", true]);
t("and it says in words that a pair is a claim that two things are WORTH COMPARING and nothing more",
  /WORTH COMPARING, by the named key, and nothing more/.test(again.judgement?.why ?? ""), true);

/* ===== 6. THE KEY IS SELECTED, AND A KEY THE RECORD HAS NOT IS REFUSED == */
console.log("\n--- 6. keys are added, not tuned: an unknown key is refused by name ---");

const bad = await pairsRead("key=K5");
t("AN UNKNOWN KEY IS REFUSED BY NAME, with its C-number and its canned translation from the "
+ "catalogue — never answered from a different key",
  [bad.ok, bad.code, bad.check, bad.translation === CONTRADICTION_PAIR_CHECKS.CONTRADICTION_KEY_UNKNOWN.translation],
  [false, "CONTRADICTION_KEY_UNKNOWN", "C-60.1", true]);
t("and the refusal NAMES the keys the record holds, so the caller is not left guessing",
  bad.keys, ["K1", "K2", "K3", "K4"]);
t("the family is ONE row, all C-60, with a translation worth reading",
  [Object.keys(CONTRADICTION_PAIR_CHECKS).length,
   Object.values(CONTRADICTION_PAIR_CHECKS).every((r) => /^C-60\.\d+$/.test(r.check) && r.translation.length > 60)],
  [1, true]);
const only2 = await pairsRead("key=K2");
t("A NAMED KEY RUNS ALONE, and the three that did not run SAY SO — `not_run` is a fifth answer "
+ "and must never read as `found nothing`",
  [only2.keys.map((k) => k.ran), levelOf(only2, "K1"), levelOf(only2, "K3")],
  [[false, true, false, false], "not_run", "not_run"]);
t("and the not-run sentence refuses the inference explicitly",
  /Nothing here is a statement about what K1 would have found/.test(keyOf(only2, "K1")?.absence?.says ?? ""),
  true);

/* ===== 7. THE VOCABULARY TRAVELS, AND WHAT THIS SUITE CANNOT SEE ======== */
console.log("\n--- 7. the keys are published as a vocabulary, with what each can feed ---");
t("every key publishes its NAME, its JOIN and the CASE it can feed, so a surface renders what the "
+ "plane holds instead of a literal it learned once (PL-17)",
  again.keys.map((k) => [k.key, k.feeds, typeof k.join === "string" && k.join.length > 30]),
  [["K1", "world", true], ["K2", "record", true], ["K3", "record", true], ["K4", "world", true]]);
t("K3 publishes BOTH ARMS separately — a passage arm and a whole-document arm — because one figure "
+ "over two joins that mean different things is the figure the per-key census exists to keep apart",
  [Object.keys(keyOf(again, "K3")?.arms ?? {}), typeof keyOf(again, "K3")?.arms?.passage?.formed],
  [["passage", "document"], "number"]);
t("and every key's level ladder is PUBLISHED, not only its conclusion — so a reader can see which "
+ "rungs were full and disagree with the one this plane picked",
  [Array.isArray(keyOf(again, "K1")?.levels), keyOf(again, "K1")?.levels?.[0]?.level ?? null],
  [true, "viewer"]);

/* WHAT THIS SUITE CANNOT SEE, stated plainly rather than left to be discovered.
 *
 *  - IT DRIVES NO JUDGEMENT, because none exists. Nothing here can tell a
 *    detector with a good false-conflict rate from one with a terrible one:
 *    that is section 7's fixture and the measurement decomposition item 2 owes,
 *    and until it lands NO FIGURE IN THIS FILE IS A STATEMENT ABOUT RECALL OR
 *    ABOUT PRECISION. It is a statement about what was COMPARED.
 *  - IT CANNOT REACH `scope: DENY` THROUGH THE OPS, because the control plane
 *    stamps the viewer on every op in its fail-closed list. The viewer arm is
 *    negative-control arm (a) and lives in `test/nc-rec146.mjs`; this file
 *    asserts the `viewer` rung EXISTS and is first, and nothing more.
 *  - THE `never_read` BUCKET OF K4's UNDETERMINED COUNT IS NOT DRIVEN AND IS
 *    NOT REACHABLE TODAY, and that is a finding rather than a gap in the suite:
 *    an ESTABLISHED resolution is written from a document's own reading refs, so
 *    a capture that carries one has a reading BY CONSTRUCTION. The bucket is kept
 *    because `read` is honestly three-valued and a member-asserted established
 *    resolution would reach it; folding it into `no_doctype` would report a
 *    document nobody has opened as a document whose reader said nothing.
 *  - IT DRIVES ONE VIEWER. Every call here is the administrator's, which
 *    `viewerPredicate` does not filter. That the gate FILTERS is
 *    `gate-reads.test.mjs`' ground and this op is classified there; that it is
 *    COMPILED AT ONE POINT is structural and is arm (e) of the control.
 */
console.log(`\ncontradictionpairs: ${pass} pass, ${fail} fail`);

} finally {
  /* D-186 / the battery's temp fence: the sandbox is this process's own and the
     Durable Object's workerd must be told to go, or a green suite leaks a
     runtime the next run's census will attribute to somebody else. */
  await mf.dispose();
}

process.exit(fail ? 1 : 0);
