/* NEGATIVE CONTROL: (NINE ARMS. REC-44's four (a)-(d) and REC-49's five (i-a), (i-b), (ii-a), (ii-b), (ii-b'). The suite is 58 assertions whole. REC-44's four were ALL RE-RUN 2026-08-05 by rec49-agent against THIS file, so every count below agrees with the file it names rather than with the file it was written against; each one's FAIL count reproduced exactly except (c), which gained one and the gain is recorded on its own line. Each arm is broken ALONE and every file is restored BYTE-IDENTICALLY, sha256 compared before and after each arm and equal to: src/store.mjs 346985395796036fcdbd51004766e935221d6919bf26a0221583df23666ed12f, src/index.mjs 765333552f24a56a12529445affe113ca739236eb275cffb0d35a58ecaf2fffc, checks/bio-checks.mjs d8da7b9d51dd5634aabe9fa5a0861d07bf48c5b8b2998d80f28796851a9a659f (the (ii-b') arm also edits THIS file; no sha is quoted for it because a file cannot state its own, and it is restored byte-identically to whatever it was before that arm ran). The arms are scripted and re-runnable in one step; each is a single unique string replacement at the site quoted with it.) (a) THE SINGLE CASE-LEVEL STRENGTH -- THIS IS BOB'S OWN CONTROL, carried verbatim off DEC-44 onto REC-44: in src/store.mjs publishedCase() add `strength: state.findings[0].strength,` to the returned object -> 57 pass, 1 FAIL (RE-RUN 2026-08-05: 46 -> 57 pass with the FAIL count unchanged), in block 5, and the sweep NAMES all four surfaces it appeared on: publishedcase(by case id).strength, publishedcase(by finding id).strength, publishedcase(by edition).strength, publishedcase(by hash).strength. The composed letter it advertises is FIND_A's (capture B / connection C) while FIND_B froze (capture UNRATED / connection D) -- so the case would be presenting one of two different answers as though it were the case's, which is R2's forbidden composition arriving at case altitude. NOTE WHAT THIS MEASURED THAT REVIEW WOULD NOT: blocks 1-4 stay ENTIRELY GREEN under it, because a spurious case-level key breaks no per-finding assertion anywhere -- the surface goes on answering correctly and ADDITIONALLY answers wrongly. That is why the control is a STRUCTURAL SWEEP over whole responses rather than a value comparison, and why a value comparison would have passed. (b) THE SAME BUG IN THE EXPORT -- in src/index.mjs's case manifest add `strength: cs.findings[0].strength,` after `ratified_at:` -> 56 pass, 2 FAIL (RE-RUN 2026-08-05: 45 -> 56 pass, FAIL count unchanged): the sweep names manifest.strength and the four publishedcase(...).manifest.strength echoes, AND the separate container assertion fires, because the ZIP a stranger downloads then carries the composed claim inside the signed-hash artifact itself -- the worst place for it, since that copy travels without this instance. Two arms rather than one, deliberately: the read path and the exported container are two places a reader meets the claim and either can be broken alone. (c) THE MEMBERSHIP IS NOT CHECKED -- in src/store.mjs publish() guard the CASE_MEMBERSHIP_DIVERGED refusal with `if (false) &&` -> 55 pass, 3 FAIL in block 2b (RE-RUN 2026-08-05: 45 -> 55 pass and 2 -> 3 FAIL, and the THIRD is REC-49's and is worth keeping — block 6's fixture assertion counts the case editions, the rostered members and the ratified rows, so a member ratified into a case that never declared it now moves numbers a roster-shaped assertion cannot miss; the arm reaches one more instrument than it did): the member whose signed bytes name a roster of ONE is ratified into a case whose other members signed a roster of two, and the second adversary then reports EDITION_EXISTS -- a raw collision where a named refusal belongs. THIS ARM IS THE REASON BLOCK 2b EXISTS. The first version of this suite had no adversary at all and arm (c) measured 47 pass, 0 fail: every member of a case published by op=publish carries the same roster BY CONSTRUCTION, so both divergence refusals could have been deleted outright with the whole suite green. That is the inbox-grammar failure mode exactly (CLAUDE.md), found by running the control rather than by review. (d) C-21.1 AT THE WRONG ALTITUDE -- in checks/bio-checks.mjs checkCompletenessFreshness read `ctx.publishedRegistry` and `reg[ctx.fm.id]` again instead of the CASE registry, AND in src/store.mjs publishCase() guard the COMPLETENESS_CARRIED_FORWARD refusal with `if (false) &&` -> 54 pass, 4 FAIL in block 3 (RE-RUN 2026-08-05: 43 -> 54 pass, FAIL count unchanged): edition 2 of the case republishes edition 1's completeness statement BYTE FOR BYTE, both members move to published on it, and the case then answers edition 2 with edition 1's limits. Both halves must go together, as REC-13 found and REC-14 recorded: breaking one alone leaves the other refusing. Restore after each. ---- REC-49's five, RUN 2026-08-05 by rec49-agent. The item is the INDEX (op=publishedmanifest), and the two directions it can lie in need two instruments, exactly as REC-44's (a) and UI-29's (m)/(m2) needed two.  (i-a) THE INDEX UNDERSTATES A CASE THAT HAS A PAIR -- in src/store.mjs publishedManifest(), drop `, p.strength, p.required` from the published[] SELECT (leave the line `                p.gate_version`). RUN: 53 pass, 5 FAIL, and the sweep NAMES the understatement in both windows rather than reporting a shape mismatch: "publishedmanifest(awaiting) CASE-2026-0001@1 INQ-2026-4400-authorisation: RATIFIED member has NO frozen pair on the index -- the index UNDERSTATES a case that HAS one", and the same for both members of both complete editions. THIS IS THE ARM THE ITEM EXISTS FOR: a green battery did not catch REC-44's move because NO suite anywhere asserted that this op still answers a pair for a case that has one. Block 5 sweeps for a pair that must NOT be there and passes perfectly on an answer carrying no pairs at all -- the empty-body-digest shape. Block 5 and block 6 are complements and are useless apart.  (i-b) THE CONTAINER MANIFEST DROPPED OFF THE INDEX AGAIN -- in the same function, drop `, manifest` from the cases[] SELECT. RUN: 57 pass, 1 FAIL, naming the case editions whose container manifest went missing. It is a SEPARATE arm from (i-a) because after REC-49 the index has two independent pair-bearing surfaces -- the member's own ratified row and the case's container copy -- and either can be removed alone. Before REC-49 there was only the second, which is why the awaiting window showed nothing.  (ii-a) A CASE-LEVEL PAIR ON AN INDEX ROW -- DEC-44's own control, at the index. In the same function, map the cases[] rows to carry the FIRST member's `strength` as the case's. RUN: 57 pass, 1 FAIL in BLOCK 5, naming ["publishedmanifest.cases[0].strength","publishedmanifest.cases[1].strength"] -- while every block 6 assertion stays GREEN, because the index goes on answering every finding's pair correctly and ADDITIONALLY answers a composed one. REC-44's (a) and UI-29's (m) measured the same thing at their own altitudes.  (ii-b) THE SAME PAIR PLANTED INSIDE THE MANIFEST THE INDEX EMBEDS -- map the cases[] rows to re-stringify the manifest with `strength: <first member's>` added at its top level. RUN: 57 pass, 1 FAIL, naming ["publishedmanifest.cases[0].manifest.strength","publishedmanifest.cases[1].manifest.strength"].  (ii-b') THE SAME DEFECT WITH THE INSTRUMENT AS IT WAS BEFORE REC-49 -- (ii-b) again, plus `const expandIndex = (idx) => idx;` in this file. RUN: 57 pass, 1 FAIL -- AND BLOCK 5 IS SILENT. The one failure is block 6's manifest-PRESENCE assertion, which fires only because an unparsed manifest is a string. THAT IS THE FINDING: op=publishedmanifest hands its container manifest over as a JSON STRING, and a structural sweep that walks a response object stops dead at a string -- so the copy of the manifest a reader of the PUBLIC INDEX meets first was the one surface DEC-44's own control could not see inside. Measured, not supposed. The correction is `expandIndex`, and this arm is what earns it. */
/* REC-44 / DEC-44 / D-187: A PUBLISHED CASE HOLDS MULTIPLE FINDINGS.
 *
 * This suite exists because the shipped model was never chosen. Measured against
 * source on 2026-08-04, `store.mjs` refused with "publishing publishes ONE case",
 * `published` was a state of an INQUIRY, `published_bundles` was keyed
 * (bundle_id, edition), and the container was built as `case: body.bundleId`.
 * Bob's definition is the opposite and was RULED (DEC-44): a case is one or MORE
 * findings, scoped to the project that gathered them. Nobody argued the singular
 * shape; every item in the chain assumed it (D-187).
 *
 * THE TWO ALTITUDES ARE THE SUBJECT, and every block is organised around keeping
 * them apart, because collapsing them IS the defect:
 *
 *   THE FINDING IS THE UNIT OF TRUTH. One proposition, one falsifier (DEC-32).
 *   Its own basis, its own frozen PAIR, its own signature over its own bytes.
 *   C-21.2's per-axis inheritance lives here and DEC-44 leaves it exactly where
 *   REC-14 put it — block 4.
 *
 *   THE CASE IS THE UNIT OF PUBLICATION. Its own identity, its own EDITIONS, its
 *   own authored scope statement and completeness assertion. C-21.1's byte-check
 *   lives here — block 3.
 *
 * AND THE ONE THING A CASE MAY NEVER HAVE IS A STRENGTH. Two findings whose
 * strengths differ have two answers; one letter over the case is R2's forbidden
 * composition arriving at a new altitude, and it is the "one letter" this project
 * has refused four times. Block 5 is the sweep that enforces it and it is Bob's
 * own negative control, carried verbatim from DEC-44 onto the item.
 *
 * THE FIXTURE MAKES THE TWO STRENGTHS DIFFER ON PURPOSE, and on BOTH axes:
 *   FIND_A  capture GRADED B (an earned capture leg) / connection GRADED C
 *   FIND_B  capture UNRATED  (no capture leg at all) / connection GRADED D
 * A surface that composed them would have to pick, drop or average something,
 * and every one of those is visible against a fixture where nothing matches.
 * `unrated` beside a graded axis is deliberate too: it is not a low score, it is
 * nothing established, and a composition that treated it as one would be caught.
 *
 * Every assertion that ratifies signs a real `bio-ratify` statement with stock
 * ssh-keygen, so this suite SKIPS LOUDLY WITH A NAMED REASON when ssh-keygen is
 * not on PATH rather than dying mid-run (ratify.test.mjs's precedent, D-93).
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readContainer, readPart } from "../src/ooxml.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- multifinding ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("multifinding: SKIPPED — ssh-keygen not on PATH; a case edition is only complete when every "
    + "member finding carries a real bio-ratify signature");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec44", MEMBER_TOKEN: "mem-rec44", PROBE_TOKEN: "prb-rec44", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const anonRaw = async (q) => await mf.dispatchFetch(`http://x/api/?${q}`);
const anonJson = async (q) => (await anonRaw(q)).json();
const anonCase = async (args) => rP(await anonJson(`op=publishedcase&${args}`));
const anonBytes = async (args) => await anonRaw(`op=publishedbytes&${args}`);

/* The ops are written out literally so coverage.mjs credits them at the CONTROL
   PLANE, which is a real caller's only route (D-43). */
const publish = async (tok, body) => rP(await POST(`op=publish&token=${tok}`, body));
const conclude = async (tok, { target, conclusion, falsifier }) =>
  rP(await GET(`op=conclude&token=${tok}&target=${encodeURIComponent(target)}`
    + `&conclusion=${encodeURIComponent(conclusion)}&falsifier=${encodeURIComponent(falsifier)}`));
const reopen = async (tok, target, reason) =>
  rP(await GET(`op=reopen&token=${tok}&target=${encodeURIComponent(target)}&reason=${encodeURIComponent(reason)}`));
const listRow = async (id) => ((await GET("op=list&token=mem-rec44")).result || [])
  .find((b) => b.bundle_id === id);
const shaOf = async (id) => (await listRow(id))?.bundle_sha;
const stateOf = async (id) => (await listRow(id))?.current_state;
const imageOf = async (id) => (await GET(`op=image&token=mem-rec44&id=${id}`)).result?.["bundle.md"]
  ?? (await GET(`op=image&token=mem-rec44&id=${id}`))["bundle.md"];

/* ---- keys and roster ---- */
const dir = mkdtempSync(join(tmpdir(), "multifinding-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "wren", "-f", join(dir, "wren"), "-q"]);
const keyB64 = readFileSync(join(dir, "wren.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "wren"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST("op=memberadd&token=adm-rec44", { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await enrol("nadia", "nadia-passphrase-44", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "omar-passphrase-44", "admin", ["contribute", "publish"]);
const WREN = await enrol("wren", "wren-passphrase-44", "member", ["contribute", "publish"]);
rP(await POST("op=signeradd&token=adm-rec44", { keyB64, memberId: "wren", comment: "wren laptop" }));

const ratify = async (id) => {
  const bundleSha = await shaOf(id);
  return rP(await POST(`op=ratify&token=${WREN}`,
    { bundleId: id, expectedSha: bundleSha, sig: signRatify(id, bundleSha) }));
};

/* ---- documents ---- */
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role ?? "supports"}`,
      ...(l.grade !== undefined ? [`    grade: ${l.grade}`] : []),
      ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
      ...(l.source ? [`    grade_source: ${l.source}`] : []),
      ...(l.author ? [`    author: ${l.author}`] : []),
      ...(l.date ? [`    date: ${l.date}`] : []),
      ...(l.edition !== undefined ? [`    target_edition: ${l.edition}`] : [])])]
  : [];
const inquiryMd = (id, { question = `What does ${id} rest on?`, state = "open",
                         refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const promote = async (id, md, type, state, base = null, extra = {}) => rP(await POST(`op=promote&token=${WREN}`, {
  bundleId: id, base, snapKey: `20260804T${String(300000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`,
          current_state: state, created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }, ...(extra.files || [])],
  register: extra.register || [],
}));
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (r.ok === false) throw new Error(`promote ${a[0]}: ${JSON.stringify(r)}`);
  return r;
};

const INFO_CAP = "INFO-2026-4400-capture-b";
const INFO_CONN = "INFO-2026-4400-connection-c";
const INFO_TEST = "INFO-2026-4400-testimony-d";
const FIND_A = "INQ-2026-4400-authorisation";
const FIND_B = "INQ-2026-4400-signature";
const FIND_C = "INQ-2026-4400-notice";
const DOWNSTREAM = "INQ-2026-4400-downstream";

/* A captured part on FIND_A, so the container carries a blob and not only text
   — and so the two findings differ in what they contribute to it as well as in
   what they are worth. */
const CAPTURE = new Uint8Array(384).map((_, i) => (i * 11) % 253);
const CAP_SHA = sha(CAPTURE);
await mf.dispatchFetch(`http://x/api/capture?token=mem-rec44&sha256=${CAP_SHA}`,
  { method: "PUT", body: CAPTURE });
const DOC_CAP_SHA = sha("multifinding-INFO_CAP-bytes");

await mustPromote(INFO_CAP, infoMd(INFO_CAP), "information", "collected", null,
  { register: [{ path: "snapshots/source.bin", sha256: DOC_CAP_SHA, bytes: 512, encoding: "binary" }] });
await mustPromote(INFO_CONN, infoMd(INFO_CONN), "information", "collected");
await mustPromote(INFO_TEST, infoMd(INFO_TEST), "information", "collected");

/* FIND_A: capture GRADED B (earned from the capture record) and connection
   GRADED C (a hunch, announced with its author and date — DEC-15). */
await mustPromote(FIND_A, inquiryMd(FIND_A, { question: "Was the FY2024 sewer transfer authorised?",
  refs: [INFO_CAP, INFO_CONN],
  legs: [{ target: INFO_CAP, grade: "B", axis: "capture", source: "capture" },
         { target: INFO_CONN, grade: "C", axis: "connection", source: "hunch",
           author: "wren", date: "2026-08-04" }] }), "inquiry", "open", null, {
  files: [{ path: "snapshots/memo.bin", blobSha: CAP_SHA, bytes: CAPTURE.length, sha256: CAP_SHA }],
  register: [{ path: "snapshots/memo.bin", sha256: CAP_SHA, bytes: CAPTURE.length, encoding: "binary" }],
});
/* FIND_B: NO capture leg at all, so its capture axis is UNRATED — which is not
   a low score, it is nothing established on that axis — and one connection leg
   at D, the honest grade for testimony. Its pair matches FIND_A's on neither
   axis, on neither STATE and on neither GRADE, which is the whole point of the
   fixture. */
await mustPromote(FIND_B, inquiryMd(FIND_B, { question: "Did anyone with delegated authority sign it?",
  refs: [INFO_TEST],
  legs: [{ target: INFO_TEST, grade: "D", axis: "connection", source: "testimony",
           author: "wren", date: "2026-08-04" }] }), "inquiry", "open");

for (const [id, conclusion, falsifier] of [
  [FIND_A, "The transfer rests on a memo nobody adopted.",
   "An adopted resolution naming the transfer would overturn this."],
  [FIND_B, "No delegation covering the signatory has been produced.",
   "A delegation instrument naming the signatory would overturn this."]]) {
  const c = await conclude(WREN, { target: id, conclusion, falsifier });
  if (!c.ok) throw new Error(`conclude ${id}: ${JSON.stringify(c)}`);
}

const SCOPE1 = "Whether the FY2024 sewer fund transfer was properly authorised and properly signed — the two "
             + "questions the transfer file raises together.";
const STMT1 = "This case covers the FY2024 transfer only, on the documents in hand at edition 1.";
const JUST1 = "We put both claims to the City Administrator on 2026-06-20 and printed what came back.";

/* ============================================================ 1. THE ACT TAKES A SET */
console.log("\n--- 1. op=publish takes a SET: two findings, one case, one edition ---");
{
  t("the one-case refusal is GONE and its replacement says a case is one or MORE findings",
    (await publish(WREN, { targets: [], scope: SCOPE1, statement: STMT1, excluded: [],
                           subjectPosition: "sought_and_answered", subjectJustification: JUST1 })).detail
      .includes("CONTAINER over ONE OR MORE FINDINGS"), true);
  t("a case with no authored SCOPE is refused by name: scope says what the case is ABOUT",
    (await publish(WREN, { targets: [FIND_A, FIND_B], scope: "", statement: STMT1, excluded: [],
                           subjectPosition: "sought_and_answered", subjectJustification: JUST1 })).reason,
    "NO_SCOPE");
  t("a finding listed twice is refused: the ordinal would mean nothing and the container would hold two copies",
    (await publish(WREN, { targets: [FIND_A, FIND_A], scope: SCOPE1, statement: STMT1, excluded: [],
                           subjectPosition: "sought_and_answered", subjectJustification: JUST1 })).reason,
    "DUPLICATE_MEMBER");
  /* EVERY MEMBER IS JUDGED BEFORE ANY MEMBER MOVES. A case that published two
     of three findings and then refused the third would leave the record
     asserting a case that does not exist. */
  await mustPromote(FIND_C, inquiryMd(FIND_C, { question: "Was notice given?", refs: [INFO_TEST],
    legs: [{ target: INFO_TEST, grade: "D", axis: "connection", source: "testimony",
             author: "wren", date: "2026-08-04" }] }), "inquiry", "open");
  const partial = await publish(WREN, { targets: [FIND_A, FIND_C], scope: SCOPE1, statement: STMT1,
    excluded: [], subjectPosition: "sought_and_answered", subjectJustification: JUST1 });
  t("one unpublishable member refuses the WHOLE act, naming the member — and nothing moved",
    [partial.reason, partial.target, await stateOf(FIND_A)], ["ILLEGAL_TRANSITION", FIND_C, "concluded"]);

  const e1 = await publish(WREN, { targets: [FIND_A, FIND_B], scope: SCOPE1, statement: STMT1,
    excluded: [{ target: INFO_TEST, description: "the FY2023 comparison memo",
                 reason: "a records request for it is still outstanding with the City Clerk" }],
    subjectPosition: "sought_and_answered", subjectJustification: JUST1 });
  if (!e1.ok) throw new Error(`publish edition 1: ${JSON.stringify(e1)}`);
  globalThis.__E1 = e1;
  t("TWO findings publish as ONE edition of ONE case",
    [e1.ok, e1.edition, e1.findings.map((f) => f.target)], [true, 1, [FIND_A, FIND_B]]);
  t("the case identity is MINTED and is distinct from every member's bundle id",
    [/^CASE-\d{4}-\d{4}$/.test(e1.caseId), e1.minted,
     e1.caseId !== FIND_A, e1.caseId !== FIND_B], [true, true, true, true]);
  t("a multi-finding case answers NO single bundle sha: reading one member's sha as the case's is the confusion",
    ["bundleSha" in e1, "target" in e1], [false, false]);
  t("both members moved to published in the one act", [await stateOf(FIND_A), await stateOf(FIND_B)],
    ["published", "published"]);

  const [mdA, mdB] = [await imageOf(FIND_A), await imageOf(FIND_B)];
  /* THE CASE IS IN THE BYTES EACH MEMBER SIGNS, in every member and not in one
     designated one: a stranger holding ONE finding must be able to read which
     case it was published in, what that case was about and what else it rests
     on, without contacting this instance (DEC-44 determination 3). */
  t("every member carries the case id, the scope and the WHOLE roster in the bytes it will sign",
    [mdA, mdB].map((md) => [new RegExp(`^case_id: ${e1.caseId}$`, "m").test(md),
                            md.includes(`case_scope: "${SCOPE1}"`),
                            new RegExp(`^case_findings: \\[${FIND_A}, ${FIND_B}\\]$`, "m").test(md),
                            /^edition: 1$/m.test(md)]),
    [[true, true, true, true], [true, true, true, true]]);
  t("and the completeness assertion is the CASE's — one claim, carried by both members",
    [mdA.includes(`statement: "${STMT1}"`), mdB.includes(`statement: "${STMT1}"`)], [true, true]);

  /* THE FIXTURE'S WHOLE POINT, asserted rather than assumed: the two findings
     are worth different things, on both axes, in both STATE and GRADE. */
  t("the two findings' frozen pairs DIFFER on both axes — which is what makes block 5 mean anything",
    e1.findings.map((f) => f.strength.map((a) => [a.axis, a.state, a.grade])),
    [[["capture", "graded", "B"], ["connection", "graded", "C"]],
     [["capture", "unrated", null], ["connection", "graded", "D"]]]);
  t("and the ACT reports NO case-level strength",
    ["strength" in e1, "required" in e1], [false, false]);
}
const E1 = globalThis.__E1;
const CASE_ID = E1.caseId;

/* ================================================ 2. MEMBERSHIP, AND THE CONTAINER */
console.log("\n--- 2. a case edition is COMPLETE when its last member ratifies, and the container carries them all ---");
{
  const shaA = await shaOf(FIND_A);
  const r1 = await ratify(FIND_A);
  t("the first member ratifies on its OWN bytes — the finding is the unit of truth",
    [r1.ok, r1.caseId, r1.edition], [true, CASE_ID, 1]);
  t("and the case edition states itself INCOMPLETE, naming what it is waiting for, rather than pretending",
    [r1.case.complete, r1.case.awaiting, r1.container], [false, [FIND_B], null]);
  const mid = await anonCase(`id=${CASE_ID}`);
  t("the public surface says so too: one finding answers, the container does not yet exist",
    [mid.complete, mid.awaiting, mid.manifest_sha, mid.findings.map((f) => f.bundle_id)],
    [false, [FIND_B], null, [FIND_A]]);

  /* REC-49: THE ONE INSTANT THE AWAITING WINDOW EXISTS in this fixture, kept for
     block 6's index sweep. On a real instance this state lasts as long as it
     takes the remaining members to ratify — hours or days — and it is precisely
     the state in which the case has NO container manifest for the public index
     to read a pair out of. Captured rather than reconstructed, so block 6 sweeps
     the answer the plane actually gave at that moment. */
  globalThis.__IDX_AWAITING = rP(await anonJson("op=publishedmanifest"));
  {
    const idx = globalThis.__IDX_AWAITING;
    const rowOf = (id) => (idx.published || []).find((p) => p.bundle_id === id && p.edition === 1);
    const csRow = (idx.cases || []).find((c) => c.case_id === CASE_ID && c.edition === 1);
    /* Written to REPORT rather than to throw: the negative control for this item
       removes the pair-bearing columns, and a TypeError names nothing while a
       failed assertion names the finding whose pair went missing. */
    t("REC-49: the INDEX already carries the ratified member's OWN frozen pair, with no container to read one from",
      [(rowOf(FIND_A).strength || []).map((a) => [a.axis, a.state, a.grade]),
       (rowOf(FIND_A).required || {}).declared ?? "NO BAR STATED", csRow.manifest, csRow.manifest_sha],
      [[["capture", "graded", "B"], ["connection", "graded", "C"]], false, null, null]);
    t("and NOTHING in the index states a pair for the member that has not ratified: nothing was signed for it",
      [!!rowOf(FIND_B), (idx.caseMembers || []).filter((m) => m.case_id === CASE_ID && m.edition === 1)
        .map((m) => m.bundle_id)],
      [false, [FIND_A, FIND_B]]);
  }

  const shaB = await shaOf(FIND_B);
  const r2 = await ratify(FIND_B);
  t("the LAST member completes the edition and the container is assembled then and not before",
    [r2.ok, r2.case.complete, r2.case.awaiting, r2.container.findings, r2.container.parts],
    [true, true, [], 2, 3]);

  const c = await anonCase(`id=${CASE_ID}`);
  t("an anonymous caller gets the CASE, with BOTH findings and both frozen pairs",
    [c.ok, c.complete, c.findings.map((f) => [f.bundle_id, f.strength.map((a) => a.grade)])],
    [true, true, [[FIND_A, ["B", "C"]], [FIND_B, [null, "D"]]]]);
  t("each finding's body is rendered from ITS OWN signed bytes (D-1), never from another member's",
    c.findings.map((f) => [f.body.state, f.body.from_sha]),
    [["published", shaA], ["published", shaB]]);
  t("each finding carries its OWN signature and its own attestation",
    [c.findings[0].sig_armored !== c.findings[1].sig_armored,
     c.findings.every((f) => f.sig_armored.startsWith("-----BEGIN SSH SIGNATURE-----"))], [true, true]);
  t("a MEMBER's bundle id resolves to the case it was published in, and says which one was asked for",
    [(await anonCase(`id=${FIND_B}`)).caseId, (await anonCase(`id=${FIND_B}`)).asked], [CASE_ID, FIND_B]);

  /* THE CONTAINER. DEC-44 determination 3: naming the other findings is not
     enough — a stranger holding the zip must be able to CHECK every finding the
     case rests on without contacting this instance. */
  const m = await anonBytes(`sha256=${c.manifest_sha}`);
  const manifest = JSON.parse(new TextDecoder().decode(new Uint8Array(await m.arrayBuffer())));
  t("the manifest describes the CASE and carries every member finding with its own signature and pair",
    [manifest.format, manifest.case, manifest.edition,
     manifest.findings.map((f) => f.bundle_id),
     manifest.findings.every((f) => f.signature.armored.startsWith("-----BEGIN SSH SIGNATURE-----"))],
    ["bio-case-container/2", CASE_ID, 1, [FIND_A, FIND_B], true]);
  t("every part is namespaced by the finding it belongs to — two members both carry a bundle.md",
    manifest.parts.map((p) => [p.finding, p.path]).sort(),
    [[FIND_A, `${FIND_A}/bundle.md`], [FIND_A, `${FIND_A}/snapshots/memo.bin`],
     [FIND_B, `${FIND_B}/bundle.md`]].sort());

  const z = await anonBytes(`sha256=${c.manifest_sha}&format=zip`);
  const zipBytes = new Uint8Array(await z.arrayBuffer());
  const zc = readContainer(zipBytes);
  t("the container serialises and the plane's own reader walks it",
    [z.status, zc.ok, zc.count], [200, true, 4]);
  let missing = [];
  for (const p of manifest.parts) {
    const got = await readPart(zipBytes, zc, `${CASE_ID}/${p.path}`);
    if (!got.ok || sha(got.bytes) !== p.sha256) missing.push(p.path);
  }
  t("EVERY part of EVERY finding hashes to what the manifest says, CRC-checked on the way out",
    missing, []);
  const inZip = await readPart(zipBytes, zc, `${CASE_ID}/${FIND_B}/bundle.md`);
  t("the SECOND finding's whole document is inside the container a stranger downloads (DEC-44 det. 3)",
    [inZip.ok, new TextDecoder().decode(inZip.bytes).includes("No delegation covering the signatory")],
    [true, true]);

  t("a bundle whose signed bytes name no case publishes no case row, and answers as what it is",
    (await anonCase(`id=${INFO_CAP}`)).reason, "NOT_PUBLISHED");
}

/* ============================== 2b. THE ROSTER AND THE ASSERTION ARE WHAT EACH MEMBER SIGNED */
console.log("\n--- 2b. two members who disagree about the case are REFUSED, never reconciled ---");
{
  /* WHY AN ADVERSARY IS NEEDED HERE AT ALL, stated because the first version of
     this suite did NOT have one and the negative control found that rather than
     review: every member of a case published by op=publish carries the same
     roster and the same assertion BY CONSTRUCTION, so the divergence refusals
     could be deleted outright with all of blocks 1-5 still green. That is the
     inbox-grammar failure mode exactly — a suite testing something else because
     every input it generates is well-formed. So the disagreement is
     MANUFACTURED, through op=promote's hand-written door, which is the one route
     a document can reach `published` without this act having written it. */
  const publishedMd = await imageOf(FIND_A);
  /* A frontmatter block runs from its own key to the next key at column 0. */
  const blockOf = (md, key) => {
    const m = new RegExp(`^${key}:.*(?:\\n[ -].*)*`, "m").exec(md);
    return m ? m[0] : null;
  };
  const swap = (md, key, replacement) => {
    const was = blockOf(md, key);
    return was ? md.replace(was, replacement) : md;
  };

  const cc = await conclude(WREN, { target: FIND_C,
    conclusion: "No notice of the transfer was published before it was executed.",
    falsifier: "A published agenda item naming the transfer before its date." });
  if (!cc.ok) throw new Error(`conclude FIND_C: ${JSON.stringify(cc)}`);
  const own = await publish(WREN, { targets: [FIND_C], scope: "Whether notice was given at all.",
    statement: "This case covers the notice question only.", excluded: [],
    subjectPosition: "not_sought",
    subjectJustification: "Notice would let the record be revised before it is captured; we say so." });
  if (!own.ok) throw new Error(`publish FIND_C: ${JSON.stringify(own)}`);
  t("(fixture) FIND_C publishes into a case of its OWN, which is minted separately",
    [own.ok, own.minted, own.caseId !== CASE_ID], [true, true, true]);
  const cMd = await imageOf(FIND_C);

  /* ADVERSARY 1 — the SET disagrees. Everything the case asserts is copied from
     a member that really is in it, so the ONLY difference is the roster. */
  const rosterLie = swap(swap(swap(swap(cMd,
    "case_id", `case_id: ${CASE_ID}`), "edition", "edition: 1"),
    "case_scope", `case_scope: "${SCOPE1}"`),
    "completeness", blockOf(publishedMd, "completeness"))
    .replace(/^completeness_excluded:.*(?:\n[ -].*)*/m, blockOf(publishedMd, "completeness_excluded"));
  await mustPromote(FIND_C, rosterLie, "inquiry", "published", (await listRow(FIND_C)).bundle_sha);
  const rl = await ratify(FIND_C);
  t("a member whose signed bytes name a DIFFERENT roster is refused by name, never reconciled",
    [rl.reason, rl.declared, rl.signed], ["CASE_MEMBERSHIP_DIVERGED", [FIND_A, FIND_B], [FIND_C]]);

  /* ADVERSARY 2 — the ASSERTION disagrees. The roster now matches; what differs
     is the scope the member signed, which is the other half of what makes a
     case edition ONE claim rather than whatever the last ratification said. */
  const scopeLie = swap(swap(swap(cMd,
    "case_id", `case_id: ${CASE_ID}`), "edition", "edition: 1"),
    "case_findings", `case_findings: [${FIND_A}, ${FIND_B}, ${FIND_C}]`);
  await mustPromote(FIND_C, scopeLie, "inquiry", "published", (await listRow(FIND_C)).bundle_sha);
  const sl = await ratify(FIND_C);
  t("and a member whose signed bytes state a DIFFERENT scope or completeness claim is refused by name",
    [sl.reason, sl.caseId, sl.edition], ["CASE_ASSERTION_DIVERGED", CASE_ID, 1]);
  t("neither adversary reached the case: its edition still holds exactly the two findings that signed it",
    (await anonCase(`id=${CASE_ID}`)).findings.map((f) => f.bundle_id), [FIND_A, FIND_B]);
}

/* ================================== 3. C-21.1 IS PER CASE PER EDITION */
console.log("\n--- 3. C-21.1: the completeness assertion is authored PER CASE PER EDITION ---");
{
  for (const id of [FIND_A, FIND_B]) {
    const r = await reopen(WREN, id, "New material arrived: the delegation file was released on 2026-07-10.");
    if (!r.ok) throw new Error(`reopen ${id}: ${JSON.stringify(r)}`);
  }
  await conclude(WREN, { target: FIND_A,
    conclusion: "The transfer rests on a memo nobody adopted, and the delegation file confirms it.",
    falsifier: "An adopted resolution naming the transfer would overturn this." });
  await conclude(WREN, { target: FIND_B,
    conclusion: "The delegation file names no authority covering the signatory.",
    falsifier: "A delegation instrument naming the signatory would overturn this." });

  const carried = await publish(WREN, { targets: [FIND_A, FIND_B], caseId: CASE_ID, scope: SCOPE1,
    statement: STMT1, excluded: [{ description: "any 2019 minutes", reason: "outside the period at issue" }],
    subjectPosition: "sought_and_answered",
    subjectJustification: "We put the revised claims to the City Administrator on 2026-07-12." });
  t("edition 2 reprinting edition 1's STATEMENT byte-for-byte is REFUSED, and the refusal names the CASE",
    [carried.reason, carried.field, carried.caseId, carried.prior],
    ["COMPLETENESS_CARRIED_FORWARD", "statement", CASE_ID, 1]);
  t("and nothing moved: a refusal at the case level leaves every member concluded",
    [await stateOf(FIND_A), await stateOf(FIND_B)], ["concluded", "concluded"]);

  /* THE SCOPE IS DELIBERATELY NOT UNDER THAT BYTE-CHECK, and this is the
     assertion that pins the judgement. A case's scope is the project's own
     question and legitimately does not move when a finding is revised;
     requiring it to change every edition would pressure a member into inventing
     a difference, which is a bug in a gate rather than a gate. It is REQUIRED
     and never prefilled, which is the arm that fits the claim it makes. */
  const STMT2 = "Edition 2 covers the FY2024 transfer and the delegation file released on 2026-07-10.";
  const e2 = await publish(WREN, { targets: [FIND_A, FIND_B], caseId: CASE_ID, scope: SCOPE1,
    statement: STMT2, excluded: [{ description: "any 2019 minutes", reason: "outside the period at issue" }],
    subjectPosition: "sought_and_answered",
    subjectJustification: "We put the revised claims to the City Administrator on 2026-07-12." });
  t("a FRESH statement publishes edition 2 of the SAME case, with the scope UNCHANGED and legal",
    [e2.ok, e2.edition, e2.caseId, e2.minted, e2.scope === SCOPE1], [true, 2, CASE_ID, false, true]);

  await ratify(FIND_A);
  await ratify(FIND_B);
  const c1 = await anonCase(`id=${CASE_ID}&edition=1`);
  const c2 = await anonCase(`id=${CASE_ID}`);
  t("BOTH editions of the case answer, each with its own completeness claim (DEC-12)",
    [c2.edition, c2.editions, c1.completeness.statement, c2.completeness.statement],
    [2, [1, 2], STMT1, STMT2]);
  t("each edition has its OWN container, and edition 1's still assembles after edition 2 lands",
    [c1.manifest_sha !== c2.manifest_sha,
     (await anonBytes(`sha256=${c1.manifest_sha}&format=zip`)).status], [true, 200]);
}

/* ================================ 4. C-21.2 STAYS PER FINDING */
console.log("\n--- 4. C-21.2: the inheritance rule is checked PER FINDING, at the other altitude ---");
{
  /* THE TWO ALTITUDES, IN ONE BLOCK. A basis leg rests on a FINDING — one
     proposition with one falsifier (DEC-32) — so what it inherits is that
     finding's frozen pair on that axis at that edition. It does NOT rest on the
     case, and there is nothing at case level for it to inherit: that is why
     C-21.1 moved up and C-21.2 did not. */
  let probeN = 0;
  const tryLeg = async (leg) => {
    const id = `${DOWNSTREAM}-${++probeN}`;
    return await promote(id, inquiryMd(id, { question: "Does the pattern hold city-wide?",
      refs: [leg.target], legs: [leg] }), "inquiry", "open");
  };
  const checksOf = (r) => (r.findings || []).map((f) => f.check).sort();

  const capA = await tryLeg({ target: FIND_A, grade: "A", axis: "capture", source: "inherited", edition: 1 });
  t("inheriting CAPTURE A from a FINDING whose frozen capture is B is REFUSED",
    [capA.ok, capA.reason, checksOf(capA)], [false, "BASIS_REFUSED", ["C-21.2"]]);
  const capB = await tryLeg({ target: FIND_A, grade: "B", axis: "capture", source: "inherited", edition: 1 });
  t("inheriting CAPTURE B, that finding's frozen capture grade, is ACCEPTED", capB.ok, true);
  const connC = await tryLeg({ target: FIND_A, grade: "C", axis: "connection", source: "inherited", edition: 1 });
  t("inheriting CONNECTION C from the SAME finding is accepted independently, per axis",
    connC.ok, true);
  /* THE SECOND FINDING IS A DIFFERENT ANSWER AND THE RULE MEETS IT SEPARATELY.
     A case-level comparison would have to pick one of the two pairs, and either
     choice is wrong for the other member — which is what "the two altitudes must
     not be collapsed" means when it costs something. */
  const connD = await tryLeg({ target: FIND_B, grade: "D", axis: "connection", source: "inherited", edition: 1 });
  t("inheriting CONNECTION D from the OTHER finding is accepted at ITS OWN frozen grade", connD.ok, true);
  const connCfromB = await tryLeg({ target: FIND_B, grade: "C", axis: "connection", source: "inherited", edition: 1 });
  t("but inheriting CONNECTION C from that same finding is REFUSED — C is legal beneath A and not beneath B",
    [connCfromB.ok, connCfromB.reason, checksOf(connCfromB)], [false, "BASIS_REFUSED", ["C-21.2"]]);
  const capFromB = await tryLeg({ target: FIND_B, grade: "D", axis: "capture", source: "inherited", edition: 1 });
  t("and inheriting ANY capture grade from a finding whose capture axis is UNRATED is REFUSED: nothing was established there",
    [capFromB.ok, checksOf(capFromB)], [false, ["C-21.2"]]);
  const noCase = await tryLeg({ target: CASE_ID, grade: "B", axis: "capture", source: "inherited", edition: 1 });
  t("a leg naming the CASE rather than a finding resolves to nothing: legs rest on findings, never on cases",
    noCase.ok, false);
}

/* REC-49: op=publishedmanifest EMBEDS each complete case edition's container
   manifest as a JSON **STRING** on its `cases[]` row, and a structural sweep
   that walks a response object stops dead at a string. So the copy of the
   manifest a reader of the PUBLIC INDEX meets first was the one surface DEC-44's
   sweep could not see inside — measured, not supposed: negative control (ii-b)
   below plants a case-level pair there and the uncorrected sweep reports
   nothing. Expanded here so the index is swept like every other surface.
   CORRECTED 2026-08-05 (REC-49) and never exempted: block 5 passed
   `publishedmanifest` in raw, which was not wrong about anything it could see
   and was blind to a whole surface. */
const expandIndex = (idx) => ({ ...idx,
  cases: (idx.cases || []).map((cs) => ({ ...cs,
    manifest: typeof cs.manifest === "string"
      ? (() => { try { return JSON.parse(cs.manifest); } catch (_) { return { UNPARSEABLE: cs.manifest }; } })()
      : cs.manifest })) });

/* ======================= 5. BOB'S NEGATIVE CONTROL: no single case-level strength */
console.log("\n--- 5. DEC-44's own control: NO surface, rendering or export states a case-level strength ---");
{
  /* THE SWEEP, and it is a SWEEP rather than a value comparison on purpose. A
     spurious case-level strength breaks nothing else: every per-finding
     assertion in blocks 1-4 goes on passing while the surface additionally
     answers a composed letter, which is precisely why review would not catch it
     and why the negative controls in this file's header measured 4 and 5
     failures HERE and none anywhere else.

     What it looks for: any key named `strength`, `published_strength`,
     `required` or `required_strength` that is NOT attached to a finding. An
     object is finding-scoped when it names a `bundle_id` of its own or sits
     under a `findings` array — which is what a finding is and what a CASE, by
     construction, is not: a case names a `case_id` and has no bundle id to
     give. That is deliberately the rule rather than "the path contains
     findings[]", so that op=publishededitions — which is addressed to ONE
     finding and answers with that finding's own editions — is swept honestly
     instead of being excused from the sweep. An excused surface is exactly
     where the next case-level strength would appear. */
  const CASE_LEVEL = new Set(["strength", "published_strength", "required", "required_strength"]);
  const caseLevelStrengths = (root, label) => {
    const hits = [];
    const walk = (node, path, underFinding) => {
      if (Array.isArray(node)) {
        node.forEach((v, i) => walk(v, `${path}[${i}]`, underFinding));
        return;
      }
      if (!node || typeof node !== "object") return;
      const isFinding = underFinding || Object.prototype.hasOwnProperty.call(node, "bundle_id");
      for (const [k, v] of Object.entries(node)) {
        const p = path ? `${path}.${k}` : k;
        if (CASE_LEVEL.has(k) && v !== null && !isFinding) hits.push(p);
        walk(v, p, isFinding || k === "findings");
      }
    };
    walk(root, label, false);
    return hits;
  };

  /* EVERY SURFACE A READER CAN REACH, and the export and the rendering with
     them — DEC-44 names all three. */
  const byCase = await anonCase(`id=${CASE_ID}`);
  const byFinding = await anonCase(`id=${FIND_A}`);
  const byEdition = await anonCase(`id=${CASE_ID}&edition=1`);
  const byHash = await anonCase(`sha256=${await shaOf(FIND_B)}`);
  const list = rP(await GET("op=publishedlist&token=mem-rec44"));
  const editions = rP(await GET(`op=publishededitions&token=mem-rec44&id=${FIND_A}`));
  /* EXPANDED (REC-49) — see the note above `expandIndex`. Unexpanded, the index
     was swept only down to the JSON string its `cases[]` rows carry, so the
     container manifest the public index hands out was excused from DEC-44's own
     control. An excused surface is exactly where the next case-level strength
     appears, which is this suite's own stated rule. */
  const pubManifest = expandIndex(rP(await anonJson("op=publishedmanifest")));
  const mBytes = new Uint8Array(await (await anonBytes(`sha256=${byCase.manifest_sha}`)).arrayBuffer());
  const manifest = JSON.parse(new TextDecoder().decode(mBytes));

  const surfaces = [
    ["publishedcase(by case id)", byCase], ["publishedcase(by finding id)", byFinding],
    ["publishedcase(by edition)", byEdition], ["publishedcase(by hash)", byHash],
    ["publishedlist", list], ["publishededitions", editions],
    ["publishedmanifest", pubManifest], ["manifest", manifest],
  ];
  t("the fixture still holds: the two findings are worth DIFFERENT things, so a composition has to show",
    byCase.findings.map((f) => f.strength.map((a) => [a.state, a.grade])),
    [[["graded", "B"], ["graded", "C"]], [["unrated", null], ["graded", "D"]]]);
  t("NO surface, rendering or export states a strength above the finding — the sweep names any that does",
    surfaces.flatMap(([label, root]) => caseLevelStrengths(root, label)), []);
  t("and each finding's own pair IS there, so the sweep is not passing on an empty answer",
    [byCase.findings.length, byCase.findings.every((f) => Array.isArray(f.strength) && f.strength.length === 2),
     manifest.findings.every((f) => Array.isArray(f.strength) && f.strength.length === 2)],
    [2, true, true]);
  /* The zip is the copy that travels WITHOUT this instance, so the manifest
     inside it is checked as its own artifact rather than trusted to match. */
  const z = await anonBytes(`sha256=${byCase.manifest_sha}&format=zip`);
  const zipBytes = new Uint8Array(await z.arrayBuffer());
  const zc = readContainer(zipBytes);
  const inner = JSON.parse(new TextDecoder().decode((await readPart(zipBytes, zc, "MANIFEST.json")).bytes));
  t("and the CONTAINER a stranger downloads carries no case-level strength either",
    caseLevelStrengths(inner, "container/MANIFEST.json"), []);
  t("the manifest says in words what it is refusing to do, so the next reader does not add one back",
    inner.verify.includes("there is no case-level strength"), true);
}

/* ============ 6. REC-49: THE PUBLIC INDEX TELLS THE TRUTH ABOUT A CASE'S STRENGTHS */
console.log("\n--- 6. REC-49: the INDEX carries every RATIFIED member's own frozen pair, awaiting window or not ---");
{
  /* WHY THIS BLOCK EXISTS, and the reason is a measurement rather than a design
     preference. REC-44 moved `completeness`/`manifest`/`manifest_sha` off
     `published_bundles` onto `published_cases`; the battery stayed green; and
     NOTHING ANYWHERE ASSERTED THAT op=publishedmanifest STILL ANSWERS A PAIR FOR
     A CASE THAT HAS ONE. Block 5 sweeps for a pair that must NOT be there, and
     block 5 passes perfectly on an answer carrying no pairs at all — the
     empty-body-digest shape CLAUDE.md names: an outcome that costs nothing to
     produce is not evidence. This block is its complement and the two are
     useless apart. A surface can fail in two directions and one instrument sees
     one of them.

     AND IT SWEEPS BOTH WINDOWS, because they are two different answers. A case
     edition is ratified one member at a time and the container is assembled only
     when the last member lands, so there is a real window — potentially days on
     a live instance — in which `cases[].manifest` is null. CONDUCT'S
     DETERMINATION (REC-49), implemented here: the index carries the per-finding
     pair for every RATIFIED member THROUGH that window. It composes nothing —
     `published_bundles.strength` is the member's own signed, ratified pair, and
     REC-44 already ruled that the findings which ratified are published and
     answerable now. What the index must never carry is a pair for the CASE, and
     that is block 5's job, not this one's.

     STRUCTURAL, OVER WHOLE RESPONSES, AND NEVER A VALUE COMPARISON. REC-44's
     control (a) and UI-29's control (m) both measured the same thing one
     altitude apart: a value comparison goes on passing while the surface answers
     correctly AND additionally answers wrongly. The mirror holds here — an
     assertion that FIND_A's index row says B/C would go on passing while the
     index quietly stopped answering for every other case on the instance. So the
     sweep asks a question about the WHOLE response: for every member of every
     case edition the index holds, is that member's pair stated, and whose is
     it? */
  const PAIR_KEYS = new Set(["strength", "required", "required_strength", "published_strength"]);
  const pairSites = (root, label) => {
    const sites = [];
    const walk = (node, path, owner) => {
      if (Array.isArray(node)) { node.forEach((v, i) => walk(v, `${path}[${i}]`, owner)); return; }
      if (!node || typeof node !== "object") return;
      /* Whose pair it is, by the same rule block 5 uses to decide what a finding
         is: an object naming a `bundle_id` of its own is a finding, and anything
         beneath it belongs to that finding. */
      const own = Object.prototype.hasOwnProperty.call(node, "bundle_id") ? node.bundle_id : owner;
      for (const [k, v] of Object.entries(node)) {
        const p = `${path}.${k}`;
        if (PAIR_KEYS.has(k) && v !== null) sites.push({ path: p, owner: own ?? null });
        walk(v, p, own);
      }
    };
    walk(root, label, null);
    return sites;
  };
  const understated = (idx, label) => {
    const out = [];
    const sites = pairSites(idx, label);
    for (const cs of idx.cases || []) {
      const roster = (idx.caseMembers || [])
        .filter((m) => m.case_id === cs.case_id && Number(m.edition) === Number(cs.edition));
      for (const m of roster) {
        const row = (idx.published || [])
          .find((p) => p.bundle_id === m.bundle_id && Number(p.edition) === Number(cs.edition));
        const where = `${label} ${cs.case_id}@${cs.edition} ${m.bundle_id}`;
        if (!row) {
          /* DECLARED AND NOT YET RATIFIED. Nothing has been signed for it, so
             nothing may state a pair for it — an invented pair here is the same
             defect pointing the other way, and the worse of the two. */
          if (sites.some((s) => s.owner === m.bundle_id))
            out.push(`${where}: AWAITED member carries a pair nobody signed for it`);
          continue;
        }
        if (!Array.isArray(row.strength) || row.strength.length !== 2
            || !row.strength.every((a) => a && a.axis && a.state))
          out.push(`${where}: RATIFIED member has NO frozen pair on the index — the index UNDERSTATES a case that HAS one`);
        if (!row.required || typeof row.required.declared !== "boolean")
          out.push(`${where}: RATIFIED member states no declared-bar fact on the index`);
      }
    }
    return out;
  };

  const nowIdx = expandIndex(rP(await anonJson("op=publishedmanifest")));
  const midIdx = expandIndex(globalThis.__IDX_AWAITING);

  t("THE AWAITING WINDOW: every ratified member's pair is stated and no awaited member's is",
    understated(midIdx, "publishedmanifest(awaiting)"), []);
  t("THE COMPLETE EDITIONS: the same sweep over the same answer once every container exists",
    understated(nowIdx, "publishedmanifest"), []);

  /* AND THE SWEEP IS NOT PASSING ON AN EMPTY ANSWER — the fixture is asserted
     rather than assumed, because a sweep over zero cases returns [] and would
     look identical. */
  t("the fixture the sweep ran over: two case editions, two members each, four ratified findings",
    [(nowIdx.cases || []).map((c) => `${c.case_id}@${c.edition}`),
     (nowIdx.caseMembers || []).length, (nowIdx.published || []).length],
    [[`${CASE_ID}@1`, `${CASE_ID}@2`], 4, 4]);

  const pairOf = (idx, id, ed) => ((idx.published || [])
    .find((p) => p.bundle_id === id && Number(p.edition) === ed) || {}).strength;
  const grades = (s) => (s || []).map((a) => [a.axis, a.state, a.grade]);
  /* THE TWO MEMBERS DIFFER ON BOTH AXES AND THE INDEX KEEPS THEM APART. This is
     not a check that a value round-tripped — it is the check that the index did
     not hand one member's pair to the other, which is the cheapest way for a
     surface to look right while composing. The fixture makes any mix-up visible
     because nothing about the two pairs matches. */
  t("each member's index pair is ITS OWN, and the two do not resemble each other",
    [grades(pairOf(nowIdx, FIND_A, 1)), grades(pairOf(nowIdx, FIND_B, 1))],
    [[["capture", "graded", "B"], ["connection", "graded", "C"]],
     [["capture", "unrated", null], ["connection", "graded", "D"]]]);
  /* THE INDEX AND THE CASE PAGE ARE THE SAME PAIR. Cheap agreement on its own
     (both read one column), so it is asserted for what it can actually catch: a
     reader who quotes the index and a reader who quotes the case page must not
     be able to come away with different letters for one finding. */
  t("and it is the same pair op=publishedcase publishes for that finding, so the two surfaces cannot diverge",
    (await anonCase(`id=${CASE_ID}&edition=1`)).findings.map((f) => JSON.stringify(f.strength)),
    [FIND_A, FIND_B].map((id) => JSON.stringify(pairOf(nowIdx, id, 1))));
  /* THE CONTAINER MANIFEST IS STILL ON THE INDEX and still names every member.
     A reconstruction needs it — it is the case's own record of what it carried —
     and this is the assertion that fails if the column is dropped again. */
  t("the complete editions still carry their CONTAINER MANIFEST on the index, naming every member with its pair",
    (nowIdx.cases || []).filter((c) => c.manifest_sha)
      .map((c) => [c.manifest && c.manifest.format,
                   (c.manifest && c.manifest.findings || []).map((f) => f.bundle_id),
                   (c.manifest && c.manifest.findings || []).every((f) => Array.isArray(f.strength))]),
    [["bio-case-container/2", [FIND_A, FIND_B], true], ["bio-case-container/2", [FIND_A, FIND_B], true]]);
  /* THE THIRD STATE, AND WHAT THE FIXTURE MEASURED ABOUT IT rather than what the
     item assumed. FIND_C was PUBLISHED into a case of its own in block 2b and
     never ratified — and that case appears on the index NOWHERE, because
     `published_cases` is written at the first RATIFICATION out of that member's
     signed bytes, exactly like the roster and for the same reason. So the index
     can never hold a case edition with an empty roster, and a surface drawing
     one would be drawing a case that nothing signed. Both halves are asserted,
     because it is the pair of them that makes the state unreachable rather than
     merely unobserved. */
  t("a case PUBLISHED but never ratified is not on the public index at all: nothing was signed, so there is nothing to state",
    (nowIdx.cases || []).some((c) => c.case_id !== CASE_ID), false);
  t("and every case edition the index DOES hold has a roster, so it can never present a case of nought findings",
    (nowIdx.cases || []).filter((c) => !(nowIdx.caseMembers || [])
      .some((m) => m.case_id === c.case_id && Number(m.edition) === Number(c.edition)))
      .map((c) => `${c.case_id}@${c.edition}`), []);
  /* THE PLANE SAYS AT WHICH ALTITUDE A PAIR LIVES, in the answer itself, so a
     surface built against this op does not have to infer it from the shape. */
  t("and the answer states the rule it is keeping, where a consumer will read it",
    [/frozen strength pair belongs to a FINDING/.test(nowIdx.altitudes || ""),
     /DECLARED AND NOT YET RATIFIED/.test(nowIdx.altitudes || "")], [true, true]);
}

await mf.dispose();
console.log(`\nmultifinding: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
