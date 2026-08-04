/* NEGATIVE CONTROL: (REC-22's three arms, each broken ALONE and restored; 72 pass when whole; ALL RUN 2026-08-04, rec22-agent, and the numbers below are what they MEASURED) (a) THE published_shas GUARD IS REMOVED — in src/index.mjs op=publishedbytes replace `if (!v || !v.published) return notFound();` with `if (false) return notFound();` -> 70 pass, 2 FAIL: the object PLANTED in the published bucket that no published_shas row names STREAMS 200 to an anonymous caller and the assertion reports the working capture's own sha where it wanted a 404. NOTE WHAT ELSE THIS MEASURED, because it is the reason block 3 has an adversary in it at all: "a working capture that was never ratified is not reachable" STILL PASSES under the broken guard, because the working corpus lives under <store>/captures/ and the published corpus under <store>/published/ — the key is not there to fetch. BUILD-ORDER's wording ("a working-corpus capture sha streams") is therefore unreachable by removing the guard alone, and what the guard actually defends is anything in the published bucket that ratification did not put there. (b) THE NAME-ONLY EDGE IS ADMITTED TO THE SERVED SET, two arms, because the classification and the restriction are two different rules and each is breakable alone. (b1) at the CLASSIFICATION — in src/index.mjs's edges[] change the two division arms from `disclosure: "name"` to `disclosure: "serve"` -> 69 pass, 3 FAIL: the published child names NEITHER its parent NOR its sibling, because the store's restriction then drops both (neither is published) — R4's disclosure vanishes from the exact surface R4 was written for, which is RECONCILED R4-e reproduced. (b2) at the RESTRICTION — in src/store.mjs #publishEdges replace `if (!nameOnly && !this.#one(` with `if (false && !nameOnly && !this.#one(` -> 71 pass, 1 FAIL naming all three working targets admitted as SERVE edges, the terminal parent among them (supersedes -> INQ-...-mixed): the published graph starts asserting it can serve material that was never published. (b2) FAILED TO FAIL ON THE FIRST RUN and that is why unresolved[] exists: serves[] was empty either way, so "every served edge names a published edition" passed on an empty list — an outcome that costs nothing to produce. The store now REPORTS an edge it classified servable and cannot resolve instead of dropping it, and the control bites. Restore after each. */
/* REC-22: `op=publishedcase` and `op=publishedbytes` — the public read path, over EDITIONS.
 *
 * This is the surface a STRANGER meets, and the only one in the plane that
 * answers with no credential of any kind. So the suite is organised around the
 * two questions that surface has to survive rather than around the code:
 *
 *   WHAT DOES IT GIVE AWAY THAT IT SHOULD NOT?  Blocks 1, 3, 6 and 7. An
 *   anonymous caller gets the case, its bytes and its container, and gets
 *   NOTHING from op=list, op=search, op=projection or op=image. A hash that was
 *   never ratified answers exactly as one that never existed. A published child
 *   NAMES its parent and its siblings and can serve neither, and an unpublished
 *   sibling's bytes are not reachable by any route this op offers.
 *
 *   WHAT DOES IT CLAIM THAT THE RECORD CANNOT SUPPORT?  Blocks 2, 4 and 5. The
 *   rendered body comes from the SAME BYTES as the frozen strength (D-1), both
 *   axes are returned as their own frozen facts with the declared bar beside
 *   them (R2/DEC-17, and an absent bar SAYS absent rather than reading as zero),
 *   a basis leg the surface can only NAME says so, and the container is
 *   tamper-EVIDENT and never claimed tamper-proof (DEC-34).
 *
 * FOUR THINGS THIS SUITE MEASURED THAT ARE WORTH THE NEXT SESSION'S TIME:
 *
 *   1. THE published_shas GUARD IS NOT REDUNDANT WITH THE BUCKET FENCE, and it
 *      took building the adversary to show it. The working corpus lives under
 *      `<store>/captures/` and the published corpus under `<store>/published/`,
 *      so the literal wording of BUILD-ORDER's negative control ("a working-
 *      corpus capture sha streams") cannot fire by simply deleting the guard:
 *      the key is not there to fetch. What the guard actually defends is the
 *      case where SOMETHING IS IN THE PUBLISHED BUCKET THAT RATIFICATION DID
 *      NOT PUT THERE — a restored backup, an operator's copy, a future writer's
 *      bug. Block 3 constructs exactly that, by planting the working capture's
 *      own bytes at its published key, and the guard refuses it. That is the
 *      stronger claim and it is the one the negative control now breaks.
 *   2. NO PAGE-SHAPED RENDERING IS PRODUCED HERE, and block 4 asserts it
 *      structurally. DEC-34's per-page brazening (case id, edition, authors,
 *      declared bias, both floors, hash, verification pointer on EVERY page) is
 *      a property of a RENDERER, and the plane serves the container rather than
 *      rendering it — so that control belongs to UI-18, which is the item that
 *      will have pages to put a header on. An assertion here that no source file
 *      in the plane emits a page is what stops a rendering appearing later
 *      without the header rule following it.
 *   3. THE ZIP IS DETERMINISTIC BY CONSTRUCTION, because it is served BY HASH.
 *      Stored entries (method 0) and a fixed DOS timestamp; no clock, no
 *      compressor. Block 4 reads the container back through the plane's OWN
 *      reader (ooxml.mjs's readContainer/readPart, which verify each member's
 *      length AND its CRC-32 against the central directory), so what this plane
 *      writes and what it reads agree by construction rather than by agreement.
 *   4. AN EMPTY SERVED SET SATISFIES "EVERY SERVED EDGE IS PUBLISHED" WHETHER
 *      THE RESTRICTION HOLDS OR WAS NEVER APPLIED, and the negative control
 *      found that rather than review. Block 6's second edge assertion reads
 *      `unresolved[]` — the store reporting an edge it classified servable and
 *      cannot resolve — because that is the only thing in the answer that MOVES
 *      when the write-time restriction is broken. The first version of the
 *      control passed, which is what a control is for.
 *
 * Every assertion that ratifies signs a real `bio-ratify` statement with stock
 * ssh-keygen, so this suite SKIPS LOUDLY WITH A NAMED REASON when ssh-keygen is
 * not on PATH rather than dying mid-run (ratify.test.mjs's precedent, D-93).
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readContainer, readPart } from "../src/ooxml.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- publishedcase ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("publishedcase: SKIPPED — ssh-keygen not on PATH; the public read path answers only for "
    + "RATIFIED editions and every edition here carries a real bio-ratify signature");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec22", MEMBER_TOKEN: "mem-rec22", PROBE_TOKEN: "prb-rec22", VERSION: "test" },
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

/* THE ANONYMOUS CALLER. No token parameter, no session cookie, no header —
   there is no credential in this function to forget to remove, which is the
   point: every assertion about the public surface is made by a caller who
   demonstrably holds nothing. The ops are written out literally (`op=
   publishedcase`, `op=publishedbytes`) so coverage.mjs credits them at the
   CONTROL PLANE, which is a real caller's only route (D-43). */
const anonRaw = async (q) => await mf.dispatchFetch(`http://x/api/?${q}`);
const anonJson = async (q) => (await anonRaw(q)).json();
const anonCase = async (args) => rP(await anonJson(`op=publishedcase&${args}`));
const anonBytes = async (args) => await anonRaw(`op=publishedbytes&${args}`);

const publish = async (tok, body) => rP(await POST(`op=publish&token=${tok}`, body));
const conclude = async (tok, { target, conclusion, falsifier }) =>
  rP(await GET(`op=conclude&token=${tok}&target=${encodeURIComponent(target)}`
    + `&conclusion=${encodeURIComponent(conclusion)}&falsifier=${encodeURIComponent(falsifier)}`));
const divide = async (tok, { target, ...body }) =>
  rP(await POST(`op=inquirydivide&token=${tok}&target=${encodeURIComponent(target)}`, body));
const reopen = async (tok, target, reason) =>
  rP(await GET(`op=reopen&token=${tok}&target=${encodeURIComponent(target)}&reason=${encodeURIComponent(reason)}`));
const listRow = async (id) => ((await GET("op=list&token=mem-rec22")).result || [])
  .find((b) => b.bundle_id === id);
const shaOf = async (id) => (await listRow(id))?.bundle_sha;
const stateOf = async (id) => (await listRow(id))?.current_state;

/* ---- keys and roster ---- */
const dir = mkdtempSync(join(tmpdir(), "publishedcase-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "vera", "-f", join(dir, "vera"), "-q"]);
const keyB64 = readFileSync(join(dir, "vera.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "vera"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST("op=memberadd&token=adm-rec22", { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* TWO administrators before any ordinary member, because the roster refuses
   otherwise (ADMINS_FIRST: administrative access is shared so that losing one
   person does not lose the group). vera is the ordinary member who publishes. */
const NADIA = await enrol("nadia", "nadia-passphrase-22", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "omar-passphrase-22", "admin", ["contribute", "publish"]);
const VERA = await enrol("vera", "vera-passphrase-22", "member", ["contribute", "publish"]);
rP(await POST("op=signeradd&token=adm-rec22", { keyB64, memberId: "vera", comment: "vera laptop" }));

const ratify = async (id) => {
  const bundleSha = await shaOf(id);
  return rP(await POST(`op=ratify&token=${VERA}`,
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
      /* REC-18: a hunch announces itself with an author and a date (DEC-15). */
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
const promote = async (id, md, type, state, tok = VERA, base = null, extra = {}) => rP(await POST(`op=promote&token=${tok}`, {
  bundleId: id, base, snapKey: `20260804T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
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

const INFO_CAP = "INFO-2026-2200-capture-b";
const INFO_CONN = "INFO-2026-2200-connection-c";
const INFO_LEFTOUT = "INFO-2026-2200-left-out";
const CASE = "INQ-2026-2200-case";
const PARENT = "INQ-2026-2200-mixed";
const KID_A = "INQ-2026-2200-authority";
const KID_B = "INQ-2026-2200-signature";

/* A CAPTURED PART, so the container carries a blob and not only text: the file
   manifest states per-file sha AND bytes, and a capture is the one part whose
   length is not in the image. */
const CAPTURE = new Uint8Array(512).map((_, i) => (i * 7) % 251);
const CAP_SHA = sha(CAPTURE);
await mf.dispatchFetch(`http://x/api/capture?token=mem-rec22&sha256=${CAP_SHA}`,
  { method: "PUT", body: CAPTURE });

/* A WORKING capture that is never part of anything ratified. It is the subject
   of block 3's adversary: its bytes are in the working bucket, its sha is in no
   published_shas row, and the whole question is whether an anonymous caller can
   ever reach it. */
const WORKING = new Uint8Array(256).map((_, i) => (i * 13) % 241);
const WORKING_SHA = sha(WORKING);
await mf.dispatchFetch(`http://x/api/capture?token=mem-rec22&sha256=${WORKING_SHA}`,
  { method: "PUT", body: WORKING });

/* CORRECTED 2026-08-04 (REC-18), never exempted: INFO_CAP REGISTERS the capture
   whose bytes are already in the bucket above. It always should have — the case
   below carries a capture-axis grade over this document, and under REC-18 that
   grade is EARNED from the capture record rather than authored, so a document
   with no registered bytes has nothing for the axis to measure. The old fixture
   registered the capture against the CASE and left the DOCUMENT empty, which
   put the bytes one object away from the grade that claimed them. */
/* A capture sha OF ITS OWN, and not CAP_SHA: `register.capture_sha` is the
   table's PRIMARY KEY, so registering one sha against a second bundle REPLACES
   the first row rather than adding one. The document's capture and the copy that
   travels inside the published container are two registrations and must be two
   shas. */
const DOC_CAP_SHA = sha("publishedcase-INFO_CAP-bytes");
await mustPromote(INFO_CAP, infoMd(INFO_CAP), "information", "collected", VERA, null,
  { register: [{ path: "snapshots/source.bin", sha256: DOC_CAP_SHA, bytes: 512, encoding: "binary" }] });
await mustPromote(INFO_CONN, infoMd(INFO_CONN), "information", "collected");
await mustPromote(INFO_LEFTOUT, infoMd(INFO_LEFTOUT), "information", "collected");

/* The case rests on one CAPTURE-graded leg at B and one CONNECTION-graded leg at
   C, so its frozen pair is two DIFFERENT letters on two axes — which is what
   makes "both frozen strengths, never one" checkable rather than agreeable. */
await mustPromote(CASE, inquiryMd(CASE, { question: "Was the sewer transfer authorised?",
  refs: [INFO_CAP, INFO_CONN],
  /* CORRECTED 2026-08-04 (REC-18), never exempted. The frozen pair is unchanged
     at (capture B, connection C); what changed is where each letter comes from.
     `resolution` is now EARNED against the inquiry's subject entity and this
     question names none, so the capture leg says `capture` (earning B from the
     capture INFO_CAP now registers — the doctrine's own value for a direct
     capture) and the connection leg says `hunch`, the honest name for an
     authored connection grade and the only authored source above D (DEC-15). */
  legs: [{ target: INFO_CAP, grade: "B", axis: "capture", source: "capture" },
         { target: INFO_CONN, grade: "C", axis: "connection", source: "hunch",
           author: "vera", date: "2026-08-04" }] }), "inquiry", "open",
  VERA, null, {
    /* THE CAPTURED PART TRAVELS WITH THE CASE, so the published container holds
       a blob and not only text — the file manifest states per-file sha AND
       bytes, and a capture is the one part whose length is not in the image. */
    files: [{ path: "snapshots/memo.bin", blobSha: CAP_SHA, bytes: CAPTURE.length, sha256: CAP_SHA }],
    register: [{ path: "snapshots/memo.bin", sha256: CAP_SHA, bytes: CAPTURE.length, encoding: "binary" }],
  });
const concluded = await conclude(VERA, { target: CASE,
  conclusion: "The transfer rests on a memo nobody adopted.",
  falsifier: "An adopted resolution naming the transfer would overturn this." });
/* ADDED 2026-08-04 (REC-18): the result is CHECKED. It was not, and a conclude
   that silently failed surfaced six blocks later as an ILLEGAL_TRANSITION at
   publish — the setup step reporting nothing while the assertion that depended
   on it read as a defect in the thing under test. */
if (!concluded.ok) throw new Error(`conclude ${CASE}: ${JSON.stringify(concluded)}`);

const STMT1 = "This case covers the FY2024 sewer fund transfer only, on the documents in hand at edition 1.";
const JUST1 = "We put the four claims to the City Administrator on 2026-06-20 and printed what came back.";
const e1 = await publish(VERA, { target: CASE, statement: STMT1,
  excluded: [{ target: INFO_LEFTOUT, description: "the FY2023 comparison memo",
               reason: "a records request for it is still outstanding with the City Clerk" }],
  subjectPosition: "sought_and_answered", subjectJustification: JUST1 });
if (!e1.ok) throw new Error(`publish edition 1: ${JSON.stringify(e1)}`);
const SHA1 = await shaOf(CASE);
const rat1 = await ratify(CASE);
if (!rat1.ok) throw new Error(`ratify edition 1: ${JSON.stringify(rat1)}`);
const MANIFEST1 = rat1.container.manifest_sha;

/* ========================================================= 1. the anonymous caller */
console.log("\n--- 1. an anonymous caller reads the case, and NOTHING of the working record ---");
{
  const c = await anonCase(`id=${CASE}`);
  t("op=publishedcase answers a caller holding NO credential of any kind",
    [c.ok, c.bundleId, c.edition], [true, CASE, 1]);
  t("and it answers the LATEST edition by default", c.latest_edition, 1);
  /* The contrast is the whole safety argument: the SAME caller, the same
     instance, the same moment. */
  const gated = {};
  for (const q of [`op=list`, `op=search&q=transfer`, `op=projection&id=${CASE}`, `op=image&id=${CASE}`]) {
    const r = await anonRaw(`${q}`);
    gated[q.split("&")[0]] = [r.status, (await r.json()).error];
  }
  t("the same caller gets NOTHING from the working ops — one answer, and it is not about this case",
    gated, { "op=list": [401, "unauthenticated"], "op=search": [401, "unauthenticated"],
             "op=projection": [401, "unauthenticated"], "op=image": [401, "unauthenticated"] });
  t("a case that was never published answers NOT_PUBLISHED, and so does an id that never existed",
    [(await anonCase(`id=${PARENT}`)).reason, (await anonCase("id=INQ-2026-9999-nothing")).reason],
    ["NOT_PUBLISHED", "NOT_PUBLISHED"]);
  t("and those two answers are byte-identical: the public surface cannot be used to test for existence",
    JSON.stringify(await anonCase(`id=${PARENT}`)) === JSON.stringify(await anonCase("id=INQ-2026-9999-nothing")),
    true);
  t("an edition that does not exist is the same answer again",
    (await anonCase(`id=${CASE}&edition=7`)).reason, "NOT_PUBLISHED");
  t("neither id nor sha is a 400 that tells the caller HOW to ask, not what exists",
    (await anonJson("op=publishedcase")).error.includes("requires id="), true);
}

/* =============================================== 2. what the published case SAYS */
console.log("\n--- 2. both frozen axes, the declared bar beside them, and the body from the SAME bytes (D-1) ---");
{
  const c = await anonCase(`id=${CASE}`);
  t("BOTH frozen axis objects come back — never one letter, and never a composed score",
    c.strength.map((a) => [a.axis, a.state, a.grade]),
    [["capture", "graded", "B"], ["connection", "graded", "C"]]);
  t("each axis carries its OWN weakest leg and its own sentence",
    [c.strength[0].weakest, c.strength[1].weakest, c.strength[0].detail.includes("capture B")],
    [INFO_CAP, INFO_CONN, true]);
  t("DEC-17's declared bar is beside them, and an ABSENT bar says absent rather than reading as zero",
    [c.required.declared, c.required.source, c.required.detail.includes("not a bar of zero")],
    [false, "none", true]);
  t("the attestation is public: attestor, key, gate version and the armored signature itself",
    [c.attestor.member, /^[A-Za-z0-9+/=]+$/.test(c.attestor.key_b64), typeof c.gate_version,
     c.sig_armored.startsWith("-----BEGIN SSH SIGNATURE-----")], ["vera", true, "string", true]);
  t("the body is rendered FROM THE EDITION'S OWN BYTES, named by the sha the signature covers (D-1)",
    [c.body.state, c.body.from_sha], ["published", SHA1]);
  /* The document says its conclusion in TWO places and they are not the same
     statement: op=conclude authors the gated claim into the frontmatter, and the
     canonical headings carry the prose beside it. Both come back, labelled,
     because returning one would either drop what the gate holds the case to or
     drop the account a person reads. */
  t("the conclusion and the falsifier of record come back as AUTHORED, which is what the gate holds",
    [c.body.authored.conclusion, c.body.authored.falsifier.startsWith("An adopted resolution")],
    ["The transfer rests on a memo nobody adopted.", true]);
  t("and the canonical sections are parsed out of the signed bytes beside them",
    [typeof c.body.conclusion, c.body.question.includes("Was the sewer transfer authorised?"),
     c.body.excludes.includes("FY2023 comparison memo")], ["string", true, true]);
  t("the completeness assertion travels with its position and its justification (DEC-13)",
    [c.completeness.statement, c.completeness.subject_position, c.completeness.author],
    [STMT1, "sought_and_answered", "vera"]);
  t("the file manifest states every part with its sha AND its bytes, the capture included",
    c.files.filter((f) => f.kind === "capture").map((f) => [f.path, f.sha256, f.bytes]),
    [["snapshots/memo.bin", CAP_SHA, CAPTURE.length]]);
  t("and every part of it is answerable by hash",
    c.files.every((f) => /^[0-9a-f]{64}$/.test(f.sha256)), true);
  t("the verification pointers are PUBLISHED, so a reader is not told to work out how to check us",
    [c.verification.bytes.includes(SHA1), c.verification.container.includes(MANIFEST1),
     c.verification.detail.includes("tamper-EVIDENT")], [true, true, true]);
  t("and the claim is tamper-EVIDENT, never tamper-proof — the word 'prevent' appears only as a denial",
    /Nothing here prevents a modified copy/.test(c.verification.detail), true);
  t("a basis leg on UNPUBLISHED material is NAMED and not served, and says which it is",
    c.basis.map((l) => [l.target, l.served, l.grade, l.grade_axis]),
    [[INFO_CAP, false, "B", "capture"], [INFO_CONN, false, "C", "connection"]]);
  t("and the naming is stated in words, not left to a boolean nobody renders",
    c.basis[0].detail.includes("can hand over nothing of it"), true);
}

/* ================================================== 3. bytes, BY HASH and only by hash */
console.log("\n--- 3. op=publishedbytes: answer by hash, never by path, and the guard is the authority ---");
{
  const r = await anonBytes(`sha256=${SHA1}`);
  const got = new Uint8Array(await r.arrayBuffer());
  t("the ratified bundle.md streams to an anonymous caller, and its bytes hash to what was asked for",
    [r.status, sha(got)], [200, SHA1]);
  t("the response names the part it served and offers a filename",
    [r.headers.get("x-published-kind"), r.headers.get("content-disposition")],
    ["bundle", 'attachment; filename="bundle.md"']);
  const cap = await anonBytes(`sha256=${CAP_SHA}`);
  t("a CAPTURED part of the published case streams too — the container is self-contained",
    [cap.status, sha(new Uint8Array(await cap.arrayBuffer()))], [200, CAP_SHA]);

  const never = sha("a document this instance has never seen");
  const [a, b] = [await anonBytes(`sha256=${WORKING_SHA}`), await anonBytes(`sha256=${never}`)];
  const [aj, bj] = [await a.json(), await b.json()];
  t("a WORKING capture that was never ratified is not reachable",
    [a.status, aj.reason], [404, "NOT_FOUND"]);
  t("and it answers IDENTICALLY to a hash that never existed — status and body, sha aside",
    [a.status === b.status, JSON.stringify({ ...aj, sha256: "X" }) === JSON.stringify({ ...bj, sha256: "X" })],
    [true, true]);
  t("a malformed hash is refused as a SHAPE, and the refusal says the surface cannot be walked",
    (await (await anonBytes("sha256=nonsense")).json()).error.includes("never by path"), true);
  t("there is no path parameter to try: the op takes a hash and nothing else",
    (await (await anonBytes(`path=bundle.md&id=${CASE}`)).json()).error.includes("requires sha256="), true);

  /* THE ADVERSARY, and it is the reason the guard exists. Something is in the
     published bucket that RATIFICATION DID NOT PUT THERE — here, the working
     capture's own bytes at its published key, which is what a restored backup,
     an operator's copy or a future writer's bug looks like. The bucket boundary
     cannot catch this, because the bytes ARE in the published bucket. Only
     published_shas can, and it does. */
  const bucket = await mf.getR2Bucket("PUBLISHED");
  await bucket.put(`bio/published/${WORKING_SHA}`, WORKING);
  /* Read DEFENSIVELY. The negative control for this block removes the guard, and
     what then comes back is the working capture's BYTES — so a suite that
     assumed JSON would crash here and report a parse error where the finding is
     "an anonymous caller just received unratified bytes". That has to be
     legible as what it is (publish.test.mjs's precedent, same reason). */
  const readAnswer = async (r) => {
    const raw = new Uint8Array(await r.arrayBuffer());
    let body = null;
    try { body = JSON.parse(new TextDecoder().decode(raw)); } catch { body = null; }
    return { status: r.status, reason: body?.reason ?? null, detail: body?.detail ?? null,
             served: body === null ? sha(raw) : null };
  };
  const planted = await readAnswer(await anonBytes(`sha256=${WORKING_SHA}`));
  t("an object in the PUBLISHED bucket that no published_shas row names is STILL not servable",
    [planted.status, planted.reason, planted.served], [404, "NOT_FOUND", null]);
  t("the table is the authority on what was published; the bucket only holds what somebody put there",
    planted.detail?.includes("never existed are the same answer") ?? planted.served, true);
}

/* ============================================ 4. DEC-34: the container, serialised */
console.log("\n--- 4. DEC-34: the container is a zip, served by the MANIFEST's hash, and it round-trips ---");
{
  const m = await anonBytes(`sha256=${MANIFEST1}`);
  const manifest = JSON.parse(new TextDecoder().decode(new Uint8Array(await m.arrayBuffer())));
  t("the manifest itself answers by its own hash, to anyone",
    [m.status, manifest.format, manifest.case, manifest.edition], [200, "bio-case-container/1", CASE, 1]);

  const z = await anonBytes(`sha256=${MANIFEST1}&format=zip`);
  const zipBytes = new Uint8Array(await z.arrayBuffer());
  t("the container serialises to a zip and is served as one",
    [z.status, z.headers.get("content-type")], [200, "application/zip"]);
  t("the response carries the container's own hash, so a copy anywhere can be matched against this one",
    [/^[0-9a-f]{64}$/.test(z.headers.get("x-container-sha256")),
     z.headers.get("x-container-sha256") === sha(zipBytes)], [true, true]);

  /* Read back through THE PLANE'S OWN READER, which verifies each member's
     length and its CRC-32 against the central directory before handing bytes
     over — so what this plane writes and what it reads agree by construction. */
  const c = readContainer(zipBytes);
  t("the plane's own container reader walks it: a real central directory, not a blob we called a zip",
    [c.ok, c.count >= 3], [true, true]);
  const names = c.entries.map((e) => e.name);
  t("MANIFEST.json is at the ROOT and every part sits under the case's own directory (the layout block)",
    [names[0], names.slice(1).every((n) => n.startsWith(`${CASE}/`))], ["MANIFEST.json", true]);
  t("the parts are the manifest's parts, at their own paths",
    names.slice(1).sort(), manifest.parts.map((p) => `${CASE}/${p.path}`).sort());
  let mismatched = [];
  for (const p of manifest.parts) {
    const got = await readPart(zipBytes, c, `${CASE}/${p.path}`);
    if (!got.ok || sha(got.bytes) !== p.sha256) mismatched.push(p.path);
  }
  t("EVERY part in the container hashes to what the manifest says it does, CRC-checked on the way out",
    mismatched, []);
  const mp = await readPart(zipBytes, c, "MANIFEST.json");
  t("and the manifest inside the container is byte-identical to the one that answers by hash",
    sha(mp.bytes), MANIFEST1);

  const z2 = await anonBytes(`sha256=${MANIFEST1}&format=zip`);
  t("the serialisation is DETERMINISTIC — it is served by hash, so twice must mean the same bytes",
    sha(new Uint8Array(await z2.arrayBuffer())), sha(zipBytes));
  t("format=zip on a hash that is a PART rather than a manifest is refused by name, never quietly served",
    (await (await anonBytes(`sha256=${SHA1}&format=zip`)).json()).reason, "NOT_A_CONTAINER");
  t("the manifest states the protection honestly: tamper-EVIDENT, and it says what it does not do",
    [manifest.verify.includes("tamper-EVIDENT"), manifest.verify.includes("nothing here prevents")],
    [true, true]);

  /* DEC-34's negative control seam, and the answer is that it lives ELSEWHERE.
     This item produces NO page-shaped rendering, so there is no page here that
     could be missing a header; the per-page brazening is a property of the
     RENDERER and belongs to UI-18, which will have pages. This assertion is what
     stops a rendering appearing in the plane later without the header rule
     following it: the day one does, it fails here and somebody has to decide
     where the control lives. */
  const srcDir = fileURLToPath(new URL("../src/", import.meta.url));
  const emitted = readdirSync(srcDir).filter((f) => f.endsWith(".mjs")).filter((f) => {
    const s = readFileSync(join(srcDir, f), "utf8");
    return /%PDF-|application\/pdf["'`]\s*[,}]|renderPage|drawPage/.test(s)
        && !/pdfstructure|docx|pptx|formats/.test(f);
  });
  t("the plane produces NO page-shaped rendering artifact, so DEC-34's per-page header control is UI-18's",
    emitted, []);
  t("and the manifest reserves where a rendering would join, so the shape does not change under readers",
    manifest.layout.note.includes("Renderings (REC-22) join parts[] as kind: rendering"), true);
}

/* ================================== 5. DEC-12: a second edition, and BOTH answer */
console.log("\n--- 5. DEC-12: edition 2 publishes and edition 1 stays fetchable AND verifiable ---");
{
  await reopen(VERA, CASE, "the FY2023 comparison memo arrived and the finding has to be re-worked");
  await conclude(VERA, { target: CASE,
    conclusion: "The transfer rests on a memo nobody adopted, and the comparison memo confirms the pattern.",
    falsifier: "An adopted resolution naming the transfer would overturn this." });
  const STMT2 = "This case covers the FY2024 transfer and, as of edition 2, the FY2023 comparison memo.";
  const e2 = await publish(VERA, { target: CASE, statement: STMT2,
    excluded: [{ description: "any 2019 council minutes", reason: "outside the period at issue" }],
    subjectPosition: "sought_and_answered",
    subjectJustification: "We put the revised claims to the City Administrator on 2026-07-05 and print the reply." });
  const SHA2 = await shaOf(CASE);
  const rat2 = await ratify(CASE);
  t("edition 2 publishes and ratifies", [e2.ok, e2.edition, rat2.ok, rat2.edition], [true, 2, true, 2]);

  const latest = await anonCase(`id=${CASE}`);
  t("a bundle id alone now answers with edition 2", [latest.edition, latest.bundle_sha], [2, SHA2]);
  t("and it names every edition, so a reader holding an older hash learns a newer one exists",
    latest.editions, [1, 2]);
  const byHash = await anonCase(`sha256=${SHA1}`);
  t("A HASH RESOLVES TO ITS OWN EDITION, never to the current one (DEC-12)",
    [byHash.edition, byHash.bundle_sha, byHash.completeness.statement], [1, SHA1, STMT1]);
  t("edition 1 is still reachable by number too, and still says what it said",
    (await anonCase(`id=${CASE}&edition=1`)).completeness.statement, STMT1);
  t("edition 1's BYTES are still fetchable after edition 2 lands",
    (await anonBytes(`sha256=${SHA1}`)).status, 200);
  t("and still VERIFIABLE through the doorbell, which is what 'edition 1 answers forever' means",
    rP(await anonJson(`op=verify&sha256=${SHA1}`)).published, true);
  t("each edition keeps its OWN signature and its own attestation",
    [byHash.sig_armored !== latest.sig_armored, byHash.ratified_at !== latest.ratified_at], [true, true]);
  t("each edition has its own CONTAINER, and edition 1's still assembles",
    [byHash.manifest_sha !== latest.manifest_sha,
     (await anonBytes(`sha256=${byHash.manifest_sha}&format=zip`)).status], [true, 200]);
  t("both editions state their frozen pair and their declared bar, per edition",
    [byHash.strength.map((a) => a.grade), latest.strength.map((a) => a.grade),
     byHash.required.declared, latest.required.declared],
    [["B", "C"], ["B", "C"], false, false]);
  t("and the body of edition 1 is edition 1's body, not the current document's",
    [byHash.body.from_sha, byHash.body.conclusion.includes("comparison memo confirms")], [SHA1, false]);
}

/* ================================ 6. R4: named, and served to nobody */
console.log("\n--- 6. R4: a published child NAMES its parent and its siblings and can serve neither ---");
{
  await mustPromote(PARENT, inquiryMd(PARENT, {
    question: "Was the sewer transfer authorised, and did anyone with authority sign it?",
    refs: [INFO_CAP, INFO_CONN],
    legs: [{ target: INFO_CAP, role: "supports" }, { target: INFO_CONN, role: "cuts_against" }] }),
    "inquiry", "open");
  await conclude(VERA, { target: PARENT,
    conclusion: "The transfer rests on a memo nobody adopted and the signature question is unresolved.",
    falsifier: "An adopted resolution, or a signature page with a delegation on it." });
  const WHY = "This was two questions: whether the transfer was authorised at all, and who signed it. "
            + "The answer to the first does not settle the second, and mixing them held both down.";
  const d = await divide(VERA, { target: PARENT, reason: WHY, children: [
    { id: KID_A, question: "Was the FY2024 sewer fund transfer authorised?", legs: [0, 1] },
    { id: KID_B, question: "Did anyone with delegated authority sign the transfer memo?", legs: [1] }] });
  if (!d.ok) throw new Error(`divide: ${JSON.stringify(d)}`);
  t("the parent is TERMINAL and its two children exist", [await stateOf(PARENT), d.ok], ["divided", true]);

  await conclude(VERA, { target: KID_A,
    conclusion: "The transfer was not authorised by any adopted instrument.",
    falsifier: "An adopted resolution naming the transfer would overturn this." });
  const pk = await publish(VERA, { target: KID_A,
    statement: "This case covers the authorisation question only; the signature question is its sibling.",
    excluded: [{ description: "the signature question", reason: "it is the sibling case and is not weighed here" }],
    subjectPosition: "sought_no_answer",
    subjectJustification: "We put the authorisation claim to the City Administrator on 2026-07-10 and had no reply." });
  if (!pk.ok) throw new Error(`publish child: ${JSON.stringify(pk)}`);
  const KID_SHA = await shaOf(KID_A);
  const ratK = await ratify(KID_A);
  if (!ratK.ok) throw new Error(`ratify child: ${JSON.stringify(ratK)}`);

  const c = await anonCase(`id=${KID_A}`);
  t("the published child NAMES its parent and every sibling",
    [c.division.parent, c.division.siblings], [PARENT, [KID_B]]);
  t("and SERVES neither: nothing in the served set is the parent or the sibling",
    c.serves.filter((e) => e.to === PARENT || e.to === KID_B), []);
  t("a name-only edge carries an id and a kind and NOTHING else — no title, no state, no sha",
    [...new Set(c.names.map((n) => Object.keys(n).sort().join(",")))], ["kind,to"]);
  t("the disclosure states WHY it is a name and not a door",
    c.division.detail.includes("the other half exists"), true);
  t("EVERY served edge names a bundle with a published edition — the restriction, asserted from the public side",
    c.serves.filter((e) => !Number.isInteger(e.edition)), []);
  /* THE RESTRICTION AT THE WRITE, which the assertion above cannot reach: an
     empty serves[] satisfies "every served edge is published" whether the
     restriction holds or was never applied, and an outcome that costs nothing to
     produce is not evidence. unresolved[] is the store REPORTING an edge it
     classified servable and cannot resolve — empty when the restriction holds,
     and naming the working targets the moment it does not. */
  t("and NO edge is classified servable with nothing published behind it, on the child or on the case",
    [c.unresolved, (await anonCase(`id=${CASE}`)).unresolved], [[], []]);

  const parentSha = await shaOf(PARENT), sibSha = await shaOf(KID_B);
  const [ps, ss] = [await anonBytes(`sha256=${parentSha}`), await anonBytes(`sha256=${sibSha}`)];
  t("the UNPUBLISHED sibling's bytes are NOT reachable, and neither are the terminal parent's",
    [ps.status, ss.status], [404, 404]);
  t("and naming them bought the caller nothing: op=publishedcase refuses them too",
    [(await anonCase(`id=${PARENT}`)).reason, (await anonCase(`id=${KID_B}`)).reason],
    ["NOT_PUBLISHED", "NOT_PUBLISHED"]);
  /* The child's OWN signed bytes say it was divided out of the parent — that is
     R4's disclosure written for a person to read and it belongs there. What must
     not appear is the parent's CURRENT STATE, which is a fact about the working
     record: the published graph has no state column to leak, and this asserts it
     over the edges rather than over the prose. */
  t("no edge carries a state, a title or a sha for anything the surface may only NAME",
    [...new Set([...c.names, ...(c.division.parent ? [{ to: c.division.parent }] : [])]
      .flatMap((n) => Object.keys(n)))].sort(), ["kind", "to"]);
  t("every value in the name-only set is an id or a kind — there is no state in it to leak",
    c.names.flatMap((n) => Object.values(n)).filter((v) => ![PARENT, KID_B, "division_parent", "division_sibling"].includes(v)),
    []);
}

/* ====================================== 7. structural: the class, and the fence */
console.log("\n--- 7. structural: credential-free BY DESIGN, and reading the published projection ONLY ---");
{
  const idx = readFileSync(fileURLToPath(new URL("../src/index.mjs", import.meta.url)), "utf8");
  const store = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
  const schema = readFileSync(fileURLToPath(new URL("../src/schema.mjs", import.meta.url)), "utf8");
  const opSpec = (op) => (new RegExp(`^\\s{2}${op}:\\s*\\{([^}]*)\\}`, "m").exec(idx) || [])[1] || "";
  t("both ops are declared `classes: null` and non-mutating in the OPS table itself",
    ["publishedcase", "publishedbytes"].map((o) => [/classes: null/.test(opSpec(o)), /mutating: false/.test(opSpec(o))]),
    [[true, true], [true, true]]);

  /* The METHOD's own body, bounded by class-member indentation — not
     indexOf(name), which runs backwards from a call site and silently yields an
     empty string that passes on nothing (REC-30's instrument lesson). */
  const methodSrc = (name) => {
    const lines = store.split("\n");
    const at = lines.findIndex((l) => new RegExp(`^ {2}(async )?${name}\\(`).test(l));
    if (at < 0) return "";
    const end = lines.findIndex((l, i) => i > at && /^ {2}[A-Za-z#*]/.test(l));
    return lines.slice(at, end < 0 ? lines.length : end).join("\n");
  };
  const fn = methodSrc("publishedCase");
  t("the publishedCase body was actually located (an empty slice would pass on nothing)",
    fn.includes("published_bundles"), true);
  t("it reads the PUBLISHED PROJECTION ONLY — no join to the working corpus, no current_state",
    [/FROM published_bundles/.test(fn), /FROM published_edges/.test(fn),
     /\bFROM bundles\b/.test(fn), /current_state/.test(fn)], [true, true, false, false]);
  t("and it takes no viewer, because there is no working material for a predicate to filter",
    /viewerPredicate/.test(fn), false);
  const edges = methodSrc("#publishEdges");
  t("the SERVE restriction is enforced in the store against published_bundles, not asserted by the caller",
    [/nameOnly && !this\.#one\(/.test(edges), /FROM published_bundles WHERE bundle_id=\?/.test(edges)],
    [true, true]);

  t("published_edges is declared BEFORE the host_governor block (the standing trap)",
    schema.indexOf("CREATE TABLE IF NOT EXISTS published_edges") < schema.indexOf("CREATE TABLE IF NOT EXISTS host_governor"),
    true);
  const pStart = store.indexOf("purge({ bundleId");
  const purgeSrc = store.slice(pStart, store.indexOf("\n  #", pStart) > -1 ? store.indexOf("\n  #", pStart) : pStart + 6000);
  t("and it is cleared in BOTH arms of op=purge — an index that outlives what it indexes is D-113",
    (purgeSrc.match(/DELETE FROM published_edges/g) || []).length, 2);
}

await mf.dispose();
console.log(`\npublishedcase: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
