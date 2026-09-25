/* NEGATIVE CONTROL: RUN 2026-09-18 with `node test/nc-mk1.mjs [arm]` from `bio-plane/`, every arm ALONE with the others held open, each EDITING A REAL SOURCE and restored from a uniquely-named per-arm pristine copy verified by sha256 AND by content (store.mjs 2,464,219 B sha256 b38fdab43118…, index.mjs 621,496 B cc5e4a97367c…, bio-checks.mjs 753,055 B be929828d9ac…; 17 of 17 restores byte-identical; never `git checkout --`). Figures are the FINAL tree's run, after CONDUCT #4's corrections (A) and (B). Declared BEFORE arming, and the result: (a) `baseline` — nothing armed, MUST be green: 56/0. (b) `unearned` — THE LIAR, a document CLAIMING authored accepted without the testimony path: "THE LIAR" and "ANY truthy spelling" MUST FAIL — 53/3 (the forged bundle LANDS). (c) `hijack` — an authored observation's bytes re-filed under another bundle: MUST FAIL — 46/10; the re-filing moves the register row, so the observation stops being one and every later arm that rests on it fails too, the harm the refusal prevents, measured. (d) `origin` — C-53.7 removed: both arms MUST FAIL — 54/2. (e) `dropped` — both C-53.9 sites removed: both MUST FAIL — 54/2. (f) `stamp` — THE AUTHOR STAMP REMOVED at the control plane: "THE STAMP" MUST FAIL — 7/24; re-driven by hand (index.mjs cp-aside/cp-back, `cmp` same) the stamp assertion read got [true,"mallory"] — a caller-supplied author LANDED; the rest are unstamped calls refused C-53.1. (g) `supplied` — C-53.2 removed: both body-author arms MUST FAIL — 54/2, THE STAMP stays green. (h) `machine` — C-53.1 removed: MUST FAIL — 55/1. (i) `axis` — an authored capture counted as a capture: the capture-axis arm and the B-leg refusal MUST FAIL — 52/4. (j) `extractrow` — the extraction observation not written: op=contentaxis MUST FAIL — 55/1; by hand it read missing_cause "never_looked". (k) `header` — BOB #14's ruling undone, the bytes the words alone: "canonical bytes" and "TWO MEMBERS, IDENTICAL WORDS" MUST FAIL — 42/14 (the second testimony collides and every later arm meets its register row). (l) `pubbundle` — (A) the fence for the observation ITSELF removed: MUST FAIL — 51/5; re-driven by hand (index.mjs cp-aside/cp-back, sha cc5e4a97… before and after, `cmp` same) the bucket read {words:1, authored:1, handle:1} and the words verified PUBLISHED — the path the probe found, crossing; the finding and case arms then fail too because the observation is now a published target. THIS ARM'S FIRST DRAFT CAME BACK WRONG AND IT IS THE FINDING: the "nothing published" half asked op=verify about the sha of op=image's provenance text, which is a rendering and not the stored file, so it answered false for free while the provenance document WAS in the bucket — the assertion now reads the bucket object by object. (m) `pubcited` — the cited-finding fence removed: both C-53.11 arms MUST FAIL — 54/2. (n) `pubcase` — the case fence removed: MUST FAIL — 55/1. (o) `pubdirect` — the walk made direct-only: "THROUGH ANOTHER FINDING" MUST FAIL — 55/1. (p) `pubover` — THE OVER-STRICTNESS DIRECTION, every ratification refused: the ordinary-document arm MUST FAIL while the observation's own refusal stays green — 53/3. (q) `c181` — C-18.1's authored arm removed: MUST FAIL — 53/3. (r) `overstrict` — every member-origin document treated as a claim: the member-UPLOADED and `authored: false` arms MUST FAIL, THE LIAR green — 51/5. EVERY ARM AS DECLARED. RE-RUN 2026-09-19 by the D-431 worker (testify's over-strictness arm re-ordered: case document, then finding, then the document as evidence): all 18 arms, restores byte-identical (store.mjs 2,647,601 B 8cf9feabd6a6…, index.mjs 663,888 B 7d80fc4e243a…), every arm AS DECLARED except (l) `pubbundle`, 55/1, whose "nothing published" half now STAYS GREEN because D-431's C-58.3 refuses the observation in the committer (no ratified case rests on it) — defence in depth, measured; its declaration was corrected in the driver with that reason and the arm re-run AS DECLARED, 55/1, naming the fence. THE PUBLICATION PROBE (`node test/mk1-publish-probe.mjs`) is the measurement (A) rests on and is re-runnable in one step. D-598 (2026-09-25, WORKER D-598; BOB #34 03:00Z, BIO_Publication_v0_1.md §3 rule 5), two arms each ALONE, run with `node test/testify.test.mjs` from `bio-plane/`, each restored from a uniquely-named per-arm pristine copy verified by sha256 AND `cmp` (src/store.mjs 3,351,291 B sha256 97cb3926e3f4…; checks/bio-checks.mjs 965,524 B sha256 ee7e247846a1…; every restore byte-identical). Baseline 58/0. (d598-a) THE ROW'S CONTROL — drop the `object_type` key from `publishedRegistryFor`'s entry: declared the evidence arm MUST FAIL with F4 refused C-21.2 BY NAME and the published-INQUIRY arm MUST NOT — 57/1, got `[false,["C-21.2"],false]` on the evidence arm, as declared. (d598-b) THE OVER-STRICTNESS ARM — checkInheritedLeg sees NO published inquiry (`pub = null`): declared the published-INQUIRY arm MUST FAIL (F5's own grade accepted) and the evidence arm MUST NOT — 57/1, got `[true,null,[]]`, as declared.
 *
 * MK-1 / D-184 / IC-133 / IC-134 — THE AUTHORED BUNDLE: a member's firsthand
 * observation IS a document (`docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §2, §7).
 *
 * WHAT THIS SUITE IS FOR. The row's accepts-when, every half of it THROUGH THE OPS
 * against the real plane in miniflare, under SIGNED-IN members:
 *
 *   1. an observation authored through `op=testify` lands as an INFO bundle whose
 *      bytes are a canonical header then exactly the member's words, registered, flagged `authored`, with
 *      a content row over it — and every EXISTING reader serves it unchanged:
 *      `op=image` (the bytes), `op=content` (the row), `op=search passage:` (the
 *      text index), `op=registeraudit` (the register is sound);
 *   2. the author is the SESSION'S MEMBER whatever the caller sends — a
 *      query-string author is overwritten by the stamp, a body author is refused
 *      by name (C-53.2), a machine credential is refused by name (C-53.1);
 *   3. each §7 refusal that falls to MK-1 fires by name THROUGH op=promote, the one
 *      write path: a non-authored bundle claiming `authored` (C-53.8 — THE LIAR),
 *      an authored bundle whose register entry claims an origin or actor other
 *      than `member` (C-53.7), an authored bundle that stops saying so (C-53.9),
 *      and an authored capture's bytes re-filed under another bundle (C-53.8);
 *   4. HOW IT READS ON THE AXES THAT EXIST TODAY: the capture axis earns NO letter
 *      for an authored document (undetermined, `CAPTURE_AXIS_AUTHORED`), where an
 *      ordinary registered capture earns the fetch ceiling — and C-18.1 carries the
 *      authored arm the gate will read at release;
 *   5. OVER-STRICTNESS: a member-uploaded document (origin `member`, NOT authored)
 *      stays exactly what it is today, and a revision of an authored bundle that
 *      keeps its register entry is accepted and keeps the flag;
 *   6. BOB #14's RULING: the bytes are a canonical header (id, observed_at, no
 *      author) then the words, so two members' identical words land as TWO bundles;
 *   7. THE PUBLICATION FENCE (C-53.10–.12): an observation, a finding resting on
 *      one (directly or through another finding), and a case over such a finding
 *      are refused at op=ratify / op=caseratify under a real member's signature,
 *      and nothing of the observation reaches the published bucket — while an
 *      ordinary document, its finding and its case publish exactly as before.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";
import { ATTRIBUTION_CHECKS } from "../checks/bio-checks.mjs";
import { TESTIMONY_CHECKS, EARNED_CAPTURE_CEILING, checkBundle, BUNDLE_ID_RE } from "../checks/bio-checks.mjs";

const SRC_DIR = fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  /* CORRECTED 2026-09-21 BY D-436 (IC-172), never exempted: INSTANCE_NAME is bound because every install binds it
     (`newgroup`'s upload, D-102), and a store records its producing group from it at its FIRST BOOT. Unbound, the
     store records none and op=testify (the plane composes the observation and must name its producer) is refused by name (C-64.1) where it used to be handed a literal
     group. 'believe-in-oakland' is this project's own group, the one these fixtures' documents already name. */
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: "adm-mk1", MEMBER_TOKEN: "mem-mk1", PROBE_TOKEN: "prb-mk1", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok, qs = "") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
/* NULL-TOLERANT, so an arm that breaks an answer's shape NAMES the assertions it
   broke instead of ending the module on a TypeError. */
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const refusedAs = (r, code) => [codeOf(r), r && r.check,
  !!(r && TESTIMONY_CHECKS[code] && r.translation === TESTIMONY_CHECKS[code].translation)];
const want = (code) => [code, TESTIMONY_CHECKS[code].check, true];
/* MK-7: the attribution gate's refusals (C-92), which replaced three of this section's fence refusals. */
const refusedAsA = (r, code) => [codeOf(r), r && r.check,
  !!(r && ATTRIBUTION_CHECKS[code] && r.translation === ATTRIBUTION_CHECKS[code].translation)];
const wantA = (code) => [code, ATTRIBUTION_CHECKS[code].check, true];

const NOW = "2026-09-18T00:00:00Z";
const WORDS = "On 10 September at the Clerk's counter I watched the deputy clerk stamp the amended "
            + "contract RECEIVED before the council had voted on it. I was the next person in line.";
const WORDS2 = "At the 12 September meeting the vendor's representative sat with staff at the dais, "
             + "not in the public seating. I was in the third row.";
const OBSERVED = "2026-09-10";

try {

/* ------------------------------------------------------------------ fixture */
const enrol = async (memberId) => {
  const add = await post("memberadd", { memberId, cover: `cover for ${memberId}`, role: "admin",
                                        capabilities: ["contribute", "publish"] }, "adm-mk1");
  const en = await post("enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth");
const SAM = await enrol("sam");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const fileOf = (path, text) => ({ path, text, bytes: Buffer.byteLength(text), sha256: sha(text) });
let snapSeq = 0;
const snapKey = () => `20260918T${String(400000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`;
/* A caller's own promote of an INFO bundle carrying a provenance document and a
   register entry — the ordinary route a member-uploaded document takes. */
const promoteDoc = async (id, { base = null, docs, register = [], extra = {}, bundleMd = null,
                                 files = null, tok = RUTH } = {}) => {
  const text = bundleMd ?? infoMd(id);
  const prov = JSON.stringify({ documents: docs });
  return post("promote", {
    bundleId: id, base, snapKey: snapKey(),
    meta: { object_type: "information", group: "believe-in-oakland",
            current_state: "collected", created: NOW, last_updated: NOW },
    files: files ?? [fileOf("bundle.md", text), fileOf("data/provenance.json", prov)],
    register, ...extra }, tok);
};
const uploadDoc = (s, extra = {}) => ({
  file: "snapshots/upload.pdf", locator: "handed to a member", retrieved: NOW,
  authority: "synthetic", authority_state: "determined", authority_basis: "fixture",
  capture: { method: "uploaded by a member", grade: "C", actor_class: "member", sha256: s,
             encoding: "binary", bytes: 10 },
  origin: { kind: "member" }, attestation_attempts: [], ...extra });

/* ===================== 1. A MEMBER TESTIFIES ============================== */
console.log("\n--- 1. ruth records what she saw; every existing reader serves it unchanged ---");
const tx = await post("testify", { words: WORDS, observedAt: OBSERVED,
                                   title: "Contract stamped received before the vote" }, RUTH);
const OBS = tx && tx.bundle_id;
/* THE CANONICAL BYTES, written out HERE in ASCII rather than taken from
   `Store.testimonyBytes` — an expectation read off the thing under test agrees
   with it for free. BOB #14's ruling, 2026-09-18: a header holding the
   testimony's own id and observed_at, then the words; NO author in the bytes. */
const canon = (id, observed, words) => `bio-testimony/1\nid: ${id}\nobserved_at: ${observed}\n\n${words}`;
const OBYTES = canon(OBS, OBSERVED, WORDS);
const OSHA = sha(OBYTES);
t("op=testify lands: an INFO bundle under a CANONICAL id, authored, origin and actor member, the author RUTH, both dates apart",
  [tx && tx.ok, typeof OBS === "string" && BUNDLE_ID_RE.test(OBS) && OBS.startsWith("INFO-"), tx && tx.authored, tx && tx.origin,
   tx && tx.actor_class, tx && tx.author, tx && tx.observed_at,
   typeof (tx && tx.recorded_at) === "string" && tx.recorded_at !== OBSERVED],
  [true, true, true, "member", "member", "ruth", OBSERVED, true]);
t("the capture IS the canonical bytes: the header (format, id, observed_at) then EXACTLY the words ruth sent — its sha, its sizes, a file",
  [tx && tx.capture_sha, tx && tx.bytes, tx && tx.words_bytes,
   typeof (tx && tx.file) === "string" && tx.file.startsWith("snapshots/")],
  [OSHA, Buffer.byteLength(OBYTES), Buffer.byteLength(WORDS), true]);
/* CORRECTED BY MK-2 (IC-142), never exempted. This asserted testimony `null`,
   "not yet carried", which was TRUE while the axis did not exist and is FALSE
   now that it does: the observation's testimony axis is D, on the observing
   member's trust. The capture half is unchanged — still no letter, still
   CAPTURE_AXIS_AUTHORED. MK-2's own suite (testimonyaxis.test.mjs) drives the
   axis through the write and the strength derivation; this line only keeps
   op=testify's answer honest about it. */
t("its axes are STATED: capture undetermined (CAPTURE_AXIS_AUTHORED), testimony D on the member's trust (MK-2)",
  [tx && tx.axes && tx.axes.capture.grade, tx && tx.axes && tx.axes.capture.undetermined_because,
   tx && tx.axes && tx.axes.testimony.grade, typeof (tx && tx.axes && tx.axes.testimony.why)],
  [null, "CAPTURE_AXIS_AUTHORED", "D", "string"]);

const img = await get("image", `id=${encodeURIComponent(OBS)}`, RUTH);
const prov = img && typeof img["data/provenance.json"] === "string" ? JSON.parse(img["data/provenance.json"]) : null;
const d0 = prov && prov.documents && prov.documents[0];
t("READER op=image: the file holds EXACTLY the canonical header and what ruth wrote — byte-identical, nothing cleaned",
  img && tx ? img[tx.file] : null, OBYTES);
t("…and NO AUTHOR IDENTITY is in the bytes (the attribution level governs that, §4)",
  img && tx && typeof img[tx.file] === "string" ? /ruth/.test(img[tx.file].split("\n\n")[0]) : null, false);
/* CORRECTED 2026-09-23 by MK-6 (MEMBER-KNOWLEDGE-DESIGN.md §4.1, BOB #19), never exempted. This asserted
   `author: "ruth"` in data/provenance.json, which was the design until §4.1: a ratified bundle's files are what
   the published bucket receives, so a file naming the member would publish them at every attribution level.
   The provenance document now names the author by the opaque `observer:<testimony id>`, and the stamped member
   is in the register alone (op=testify's answer above still says ruth). */
t("the register entry declares authored, origin member, actor member, the author as observer:<id>, observed_at — and NO capture grade",
  d0 ? [d0.authored, d0.origin && d0.origin.kind, d0.capture && d0.capture.actor_class, d0.author,
        d0.observed_at, d0.capture && d0.capture.sha256, "grade" in (d0.capture || {})] : null,
  [true, "member", "member", `observer:${OBS}`, OBSERVED, OSHA, false]);
t("bundle.md is a well-formed INFO document the catalogue accepts, and the words are not in it",
  img ? [typeof img["bundle.md"], img["bundle.md"].includes("object_type: information"),
         img["bundle.md"].includes(WORDS)] : null, ["string", true, false]);

const c0 = await get("content", `id=${tx && tx.content_id}`, RUTH);
t("READER op=content: the content row over the observation resolves — the whole document, minted by ruth",
  [c0 && c0.ok, c0 && c0.capture_sha, c0 && c0.bundle_id, c0 && c0.extent_kind, c0 && c0.minted_by,
   c0 && c0.stale], [true, OSHA, OBS, "document", "ruth", false]);

const hits = (await get("search", `q=${encodeURIComponent("passage:deputy")}&mode=ids`, RUTH))?.ids ?? [];
t("READER op=search passage: the words are in the content-grain text index and find the observation",
  hits.includes(OBS), true);

const ax = await get("contentaxis", `captureSha=${OSHA}`, RUTH);
t("READER op=contentaxis: the words are recorded as EXTRACTED WHOLE by the member — not explained away as "
  + "'nobody looked' — and the index row is PRESENT",
  [ax && ax.found, ax && ax.extraction && ax.extraction.state, ax && ax.extraction && ax.extraction.actor,
   ax && ax.missing_cause, ax && ax.index && ax.index.state],
  [true, "PRESENT", "ruth", null, "PRESENT"]);

const ra = await get("registeraudit", "", "adm-mk1");
t("READER op=registeraudit: the register row resolves to bytes in the bundle image — sound, nothing unbacked",
  [ra && ra.sound, ra && ra.unbacked], [true, 0]);

/* ===================== 2. WHOSE WORD IT IS ================================= */
console.log("\n--- 2. the author is the session's member, whatever the caller sends ---");
const qa = await post("testify", { words: WORDS2, observedAt: "2026-09-12" }, RUTH, "&author=mallory");
t("THE STAMP: a caller's own ?author=mallory is OVERWRITTEN — the observation is ruth's",
  [qa && qa.ok, qa && qa.author], [true, "ruth"]);
const qaImg = qa && qa.ok ? await get("image", `id=${encodeURIComponent(qa.bundle_id)}`, RUTH) : null;
const qaDoc = qaImg ? JSON.parse(qaImg["data/provenance.json"]).documents[0] : null;
/* CORRECTED 2026-09-23 by MK-6 (§4.1), never exempted: the provenance document no longer names a member at
   all, so it cannot say ruth. What this arm is for is unchanged: mallory, the caller's claim, is nowhere. */
t("…and mallory is nowhere in the record's files: the provenance names observer:<id>, and neither file says mallory",
  [qaDoc && qaDoc.author === `observer:${qa && qa.bundle_id}`, qaImg ? qaImg["bundle.md"].includes("mallory") : null,
   qaImg ? qaImg["data/provenance.json"].includes("mallory") : null], [true, false, false]);
const ba = await post("testify", { words: "I saw it myself, said nobody.", observedAt: OBSERVED,
                                   author: "mallory" }, RUTH);
t("a caller-supplied author in the BODY is REFUSED BY NAME (C-53.2) — never silently overridden",
  refusedAs(ba, "TESTIMONY_AUTHOR_SUPPLIED"), want("TESTIMONY_AUTHOR_SUPPLIED"));
const bo = await post("testify", { words: "I saw it myself, said nobody.", observedAt: OBSERVED,
                                   observer: "ruth" }, SAM);
t("…under a synonym too (`observer`), even naming a real member (C-53.2)",
  refusedAs(bo, "TESTIMONY_AUTHOR_SUPPLIED"), want("TESTIMONY_AUTHOR_SUPPLIED"));
const mt = await post("testify", { words: "A machine saw it.", observedAt: OBSERVED }, "mem-mk1");
const at = await post("testify", { words: "An admin token saw it.", observedAt: OBSERVED }, "adm-mk1");
t("a MACHINE credential (the member token, the admin token) is refused BY NAME (C-53.1)",
  [refusedAs(mt, "TESTIMONY_NOT_A_MEMBER"), refusedAs(at, "TESTIMONY_NOT_A_MEMBER")],
  [want("TESTIMONY_NOT_A_MEMBER"), want("TESTIMONY_NOT_A_MEMBER")]);

/* ===================== 3. THE WORDS AND THE DATE =========================== */
console.log("\n--- 3. the words and the date the member says they saw it ---");
t("an EMPTY observation is refused (C-53.3) — nothing is prefilled",
  refusedAs(await post("testify", { words: "   \n ", observedAt: OBSERVED }, RUTH), "TESTIMONY_NO_WORDS"),
  want("TESTIMONY_NO_WORDS"));
t("words over one passage are refused, never cut (C-53.4)",
  refusedAs(await post("testify", { words: "x".repeat(128 * 1024 + 1), observedAt: OBSERVED }, RUTH),
            "TESTIMONY_WORDS_TOO_LONG"), want("TESTIMONY_WORDS_TOO_LONG"));
const badDates = ["", "yesterday", "2026-02-31", "2999-01-01", "2026-09-10T25:00Z"];
const dated = [];
for (const d of badDates) dated.push(codeOf(await post("testify", { words: `Seen, dated ${d}.`, observedAt: d }, RUTH)));
t("observedAt missing, prose, a date that does not exist, a future date, a bad time — each refused (C-53.5)",
  dated, badDates.map(() => "TESTIMONY_OBSERVED_AT_INVALID"));
const noDate = await post("testify", { words: "Seen, undated." }, RUTH);
t("…and an observation with NO date at all is refused rather than dated for the member (C-53.5)",
  refusedAs(noDate, "TESTIMONY_OBSERVED_AT_INVALID"), want("TESTIMONY_OBSERVED_AT_INVALID"));
const instant = await post("testify", { words: "Seen at a stated instant.", observedAt: "2026-09-10T14:05Z" }, SAM);
t("OVER-STRICTNESS: a UTC instant is accepted as well as a calendar date, and is kept as written",
  [instant && instant.ok, instant && instant.observed_at, instant && instant.author],
  [true, "2026-09-10T14:05Z", "sam"]);
/* BOB #14's RULING (2026-09-18): two members' IDENTICAL observations are TWO
   testimonies (§3). Superseded here, not exempted: this arm used to assert the
   second one was REFUSED (C-53.6), because the register is keyed by bytes and
   the bytes were the words alone. The header makes the bytes unique per
   testimony, so the second lands as its own bundle. */
const dup = await post("testify", { words: WORDS, observedAt: OBSERVED }, SAM);
t("TWO MEMBERS, IDENTICAL WORDS, TWO TESTIMONIES: sam's lands as its OWN bundle, its own bytes, its own author",
  [dup && dup.ok, dup && dup.bundle_id !== OBS, dup && dup.capture_sha !== OSHA, dup && dup.author,
   dup && dup.capture_sha === sha(canon(dup.bundle_id, OBSERVED, WORDS))],
  [true, true, true, "sam", true]);
const both = (await get("search", `q=${encodeURIComponent("passage:deputy")}&mode=ids`, RUTH))?.ids ?? [];
t("…and both are found by the same words, each an authored document — ruth's is unmoved",
  [both.includes(OBS), both.includes(dup && dup.bundle_id),
   (await get("content", `id=${tx && tx.content_id}`, RUTH))?.minted_by], [true, true, "ruth"]);
/* C-53.6, NARROWED: the one way left to collide is somebody registering, in
   advance, the exact bytes the NEXT testimony will have — the id is sequential,
   so it can be predicted. */
const nextId = dup && dup.bundle_id
  ? dup.bundle_id.replace(/^(INFO-\d{4}-)(\d{4})(-observation)$/, (_, a, n, c) => `${a}${String(+n + 1).padStart(4, "0")}${c}`)
  : null;
const W3 = "I saw the agenda posted on the door at 4:55 pm, five minutes before the deadline.";
const PRE = sha(canon(nextId, OBSERVED, W3));
const squat = await promoteDoc("INFO-2026-5301-squatter", { docs: [uploadDoc(PRE)],
  register: [{ sha256: PRE, path: "snapshots/upload.pdf", encoding: "binary", bytes: 10 }] });
const pre = await post("testify", { words: W3, observedAt: OBSERVED }, RUTH);
t("PRE-REGISTERED BYTES: somebody who registered the next testimony's exact bytes in advance cannot make it re-file their row — REFUSED (C-53.6)",
  [squat && squat.ok, ...refusedAs(pre, "TESTIMONY_WORDS_REGISTERED")], [true, ...want("TESTIMONY_WORDS_REGISTERED")]);
t("…naming no bundle (the squatter may be one the caller cannot see) — and the retry lands under a new id",
  [JSON.stringify(pre).includes("squatter"), (await post("testify", { words: W3, observedAt: OBSERVED }, RUTH))?.ok],
  [false, true]);

/* ===================== 4. THE FENCE, THROUGH op=promote ==================== */
console.log("\n--- 4. the §7 refusals, through the one write path ---");
/* THE LIAR: a document claiming `authored` that the testimony path did not write. */
const FORGED = "INFO-2026-5301-forged";
const SF = sha("mk1-forged-bytes");
const forged = await promoteDoc(FORGED, {
  docs: [uploadDoc(SF, { authored: true, author: "ruth", observed_at: OBSERVED })],
  register: [{ sha256: SF, path: "snapshots/upload.pdf", encoding: "binary", bytes: 10, authored: true }],
  extra: { authored: true, testimony: true } });
t("THE LIAR: a promote claiming authored (in the document, the register entry AND the package) is REFUSED (C-53.8)",
  refusedAs(forged, "TESTIMONY_AUTHORED_UNEARNED"), want("TESTIMONY_AUTHORED_UNEARNED"));
const forgedGone = await get("image", `id=${FORGED}`, RUTH);
t("…and nothing landed: the forged bundle does not exist",
  !!(forgedGone && forgedGone["bundle.md"]), false);
const forgedString = await promoteDoc("INFO-2026-5301-forged2",
  { docs: [uploadDoc(sha("mk1-forged-2"), { authored: "yes" })] });
t("…the flag in ANY truthy spelling is the claim (authored: \"yes\") (C-53.8)",
  codeOf(forgedString), "TESTIMONY_AUTHORED_UNEARNED");

/* OVER-STRICTNESS: a member UPLOADING a document they obtained stays what it is. */
const UP = "INFO-2026-5301-upload";
const SU = sha("mk1-upload-bytes");
const up = await promoteDoc(UP, { docs: [uploadDoc(SU)],
  register: [{ sha256: SU, path: "snapshots/upload.pdf", encoding: "binary", bytes: 10 }] });
t("OVER-STRICTNESS: a member-UPLOADED document (origin member, NOT authored) is accepted as today",
  [up && up.ok], [true]);
const upF = await promoteDoc("INFO-2026-5301-upload-false", { docs: [uploadDoc(sha("mk1-up-f"), { authored: false })] });
t("OVER-STRICTNESS: `authored: false` on an ordinary document is not a claim and is accepted",
  [upF && upF.ok], [true]);

/* Revisions of the AUTHORED bundle through op=promote. */
const head0 = img && tx ? await get("image", `id=${encodeURIComponent(OBS)}`, RUTH) : null;
let OBS_BASE = tx && tx.bundle_sha;
const reviseObs = async (mutate, { register = [] } = {}) => {
  const p = JSON.parse(head0["data/provenance.json"]);
  mutate(p.documents[0]);
  const files = [fileOf("bundle.md", head0["bundle.md"]), fileOf("data/provenance.json", JSON.stringify(p)),
                 fileOf(tx.file, head0[tx.file])];
  return post("promote", {
    bundleId: OBS, base: OBS_BASE, snapKey: snapKey(),
    meta: { object_type: "information", group: "believe-in-oakland",
            current_state: "collected", created: tx.recorded_at, last_updated: tx.recorded_at },
    files, register }, RUTH);
};
const orig = await reviseObs((d) => { d.origin = { kind: "named_request" }; });
t("an AUTHORED bundle whose register entry now claims origin named_request is REFUSED (C-53.7)",
  refusedAs(orig, "TESTIMONY_ORIGIN_NOT_MEMBER"), want("TESTIMONY_ORIGIN_NOT_MEMBER"));
const actr = await reviseObs((d) => { d.capture.actor_class = "daemon"; });
t("…and one whose actor class is now daemon (C-53.7)",
  refusedAs(actr, "TESTIMONY_ORIGIN_NOT_MEMBER"), want("TESTIMONY_ORIGIN_NOT_MEMBER"));
const drop = await reviseObs((d) => { delete d.authored; });
t("an AUTHORED bundle whose revision stops saying authored is REFUSED (C-53.9)",
  refusedAs(drop, "TESTIMONY_AUTHORED_DROPPED"), want("TESTIMONY_AUTHORED_DROPPED"));
const gone = await post("promote", {
  bundleId: OBS, base: OBS_BASE, snapKey: snapKey(),
  meta: { object_type: "information", group: "believe-in-oakland",
          current_state: "collected", created: tx.recorded_at, last_updated: tx.recorded_at },
  files: [fileOf("bundle.md", head0["bundle.md"]), fileOf(tx.file, head0[tx.file])] }, RUTH);
t("…and one whose revision drops data/provenance.json altogether (C-53.9)",
  refusedAs(gone, "TESTIMONY_AUTHORED_DROPPED"), want("TESTIMONY_AUTHORED_DROPPED"));
const hijack = await promoteDoc("INFO-2026-5301-hijack", { docs: [uploadDoc(OSHA)],
  register: [{ sha256: OSHA, path: "snapshots/upload.pdf", encoding: "binary", bytes: 10 }] });
t("a DIFFERENT bundle registering an authored observation's bytes is REFUSED (C-53.8) — no re-filing",
  refusedAs(hijack, "TESTIMONY_AUTHORED_UNEARNED"), want("TESTIMONY_AUTHORED_UNEARNED"));
const keep = await reviseObs(() => {},
  { register: [{ sha256: OSHA, path: tx.file, encoding: "utf8", bytes: Buffer.byteLength(OBYTES) }] });
t("OVER-STRICTNESS: a revision of the authored bundle that keeps its register entry — and re-sends the register row — is ACCEPTED",
  [keep && keep.ok], [true]);
if (keep && keep.ok) OBS_BASE = keep.bundleSha;

/* ===================== 5. HOW IT READS ON THE AXES THAT EXIST ============== */
console.log("\n--- 5. the existing axes, stated honestly ---");
/* `op=earnedbasis` answers for an INQUIRY's candidate targets, so a question is
   written first — the member asking "what would this observation earn my leg?". */
const qMd = (id, legs = []) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What did the clerk do?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland",
  ...(legs.length ? ["references:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
                     "    rel: cites", "    status: confirmed"])] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next meeting",
  "    description: The minutes may say otherwise.",
  ...(legs.length ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
                     ...(l.grade ? [`    grade: ${l.grade}`, "    grade_axis: capture",
                                    "    grade_source: capture"] : [])])] : []),
  "---", "", "## Question", "", "What did the clerk do?", "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "", `### Session ${NOW} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
const promoteQ = (id, legs) => post("promote", { bundleId: id, base: null, snapKey: snapKey(),
  meta: { object_type: "inquiry", group: "believe-in-oakland",
          current_state: "open", created: NOW, last_updated: NOW },
  files: [fileOf("bundle.md", qMd(id, legs))] }, RUTH);
const Q = "INQ-2026-5301-q";
const qp = await promoteQ(Q, []);
if (!(qp && qp.ok)) console.log(`  note  the question fixture was refused: ${JSON.stringify(qp).slice(0, 300)}`);
const eb = await get("earnedbasis", `id=${Q}&targets=${encodeURIComponent(`${OBS},${UP}`)}`, RUTH);
const capOf = (id) => eb && eb.earned && eb.earned.capture ? eb.earned.capture[id] : undefined;
const ec = capOf(OBS);
t("the CAPTURE axis earns NO letter for the observation — present, null, CAPTURE_AXIS_AUTHORED, and it says why",
  ec ? [ec.grade, ec.determined, ec.undetermined_because, ec.captures, typeof ec.why] : ec,
  [null, false, "CAPTURE_AXIS_AUTHORED", 0, "string"]);
t("…STILL after the accepted revision re-sent its register row: the flag was not cleared by a writer",
  ec && ec.authored, 1);
t("CONTRAST: the member-UPLOADED document earns the fetch ceiling exactly as before",
  capOf(UP) ? capOf(UP).grade : capOf(UP), EARNED_CAPTURE_CEILING);
t("the CONNECTION axis earns nothing for the observation (no reader ran over it)",
  eb && eb.earned && eb.earned.connection ? eb.earned.connection[OBS] : "no-answer", undefined);
/* THROUGH THE WRITE: a leg citing the observation may not claim a capture letter. */
const legB = await promoteQ("INQ-2026-5301-legb", [{ target: OBS, grade: EARNED_CAPTURE_CEILING }]);
const legBf = legB && Array.isArray(legB.findings) ? legB.findings[0] : null;
t(`a leg citing the observation and claiming capture ${EARNED_CAPTURE_CEILING} is REFUSED at the write (C-2.8), saying it is an authored observation`,
  [legB && legB.reason, legBf && legBf.check, !!(legBf && /is a member's authored observation/.test(legBf.detail))],
  ["BASIS_REFUSED", "C-2.8", true]);
t("…and its repairs do NOT send the member to measure a transcription that does not exist",
  legBf && Array.isArray(legBf.repairs) ? legBf.repairs.some((r) => /transcription measured/.test(r)) : null, false);
const legNone = await promoteQ("INQ-2026-5301-legnone", [{ target: OBS }]);
t("…while a leg citing it with NO capture grade is accepted — the axis suspended and named, not refused",
  [legNone && legNone.ok], [true]);
const legUp = await promoteQ("INQ-2026-5301-legup", [{ target: UP, grade: EARNED_CAPTURE_CEILING }]);
t(`CONTRAST: the same ${EARNED_CAPTURE_CEILING} leg on the member-UPLOADED document is accepted as before`,
  [legUp && legUp.ok], [true]);

/* C-18.1's authored arm, the gate's reading of the same register entry. */
/* Driven over the bundle AS op=testify WROTE IT (read back through op=image),
   with only the provenance document varied — so the arm judges the real shape. */
const c181 = async (doc) => {
  const files = new Map(Object.entries(head0 || {}));
  files.set("data/provenance.json", JSON.stringify({ documents: [doc] }));
  const { findings } = await checkBundle({ folderName: OBS, files,
    sha256: async (v) => createHash("sha256").update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex"),
    sha512: async (b) => new Uint8Array(await (await import("node:crypto")).webcrypto.subtle.digest("SHA-512", b)),
    resolveTarget: () => true });
  return { c181: findings.filter((x) => x && x.check === "C-18.1").map((x) => x.message),
           errors: findings.filter((x) => x && x.severity === "error").map((x) => `${x.check}: ${x.message}`) };
};
if (d0 && head0) {
  const whole = await c181(JSON.parse(JSON.stringify(d0)));
  t("THE WHOLE CATALOGUE over the bundle op=testify wrote: NO error finding of any check (a well-formed INFO document)",
    whole.errors, []);
  t("C-18.1: the authored register entry, as op=testify wrote it, carries no C-18.1 finding",
    whole.c181, []);
  const graded = JSON.parse(JSON.stringify(d0)); graded.capture.grade = "B";
  t("C-18.1: an authored document carrying a capture grade is an error",
    (await c181(graded)).c181.some((m) => /carries capture\.grade 'B'/.test(m)), true);
  const named = JSON.parse(JSON.stringify(d0)); named.origin = { kind: "named_request" };
  t("C-18.1: an authored document whose origin is not member is an error",
    (await c181(named)).c181.some((m) => /origin\.kind is 'named_request', not 'member'/.test(m)), true);
  const plain = JSON.parse(JSON.stringify(d0)); delete plain.authored;
  t("C-18.1: the SAME document without the flag is held to the ordinary grade rule (no letter => error)",
    (await c181(plain)).c181.some((m) => /capture\.grade 'undefined' is not one of/.test(m)), true);
} else {
  console.log("  FAIL  the C-18.1 arm had no bundle to judge (op=testify or op=image did not answer)");
  fail++;
}

/* ===================== 6. THE PUBLICATION FENCE (A) ======================= */
/* CORRECTED 2026-09-25 by MK-7: the section's claim was "nothing crosses" under C-53.10–.12. MK-7 lifted those for
   an observation in §4.1's form, so the claim is now "nothing crosses WITHOUT ITS AUTHOR'S CHOSEN ATTRIBUTION"; the
   crossing itself, per level, is `mk7-attribution.test.mjs`'s. */
console.log("\n--- 6. nothing carrying an observation crosses into the published record without its author's attribution (C-92, C-58.2) ---");
/* MEASURED BEFORE THE FENCE EXISTED (`test/mk1-publish-probe.mjs`): op=ratify
   on an observation whose bytes were in the working bucket PUBLISHED its words,
   its provenance document and the observer's handle; a finding resting on one
   ratified; a case over that finding ratified. Each is driven here as a REAL
   member's REAL signature, because a refusal over a signature nobody could
   present proves nothing. */
if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("  SKIP  section 6 — ssh-keygen is not on PATH; ratification needs a real member signature");
} else {
  const kdir = mkdtempSync(join(tmpdir(), "mk1-pub-"));
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "ruth", "-f", join(kdir, "ruth"), "-q"]);
  const signBytes = (text) => {
    const f = join(kdir, `stmt-${Math.random().toString(36).slice(2)}`);
    writeFileSync(f, text);
    execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(kdir, "ruth"), "-n", "bio-ratify", f],
      { stdio: ["ignore", "ignore", "ignore"] });
    return readFileSync(f + ".sig", "utf8");
  };
  const keyB64 = readFileSync(join(kdir, "ruth.pub"), "utf8").trim().split(/\s+/)[1];
  const sr = await post("signeradd", { keyB64, memberId: "ruth", comment: "ruth laptop" }, "adm-mk1");
  const shaOf = async (id) => {
    const l = await get("list", "limit=1000", RUTH);
    return (Array.isArray(l) ? l : (l && l.bundles) || []).find((b) => b.bundle_id === id)?.bundle_sha ?? null;
  };
  const ratify = async (id) => {
    const s = await shaOf(id);
    return post("ratify", { bundleId: id, expectedSha: s, sig: signBytes(`bio-ratify ${id} ${s}\n`) }, RUTH);
  };
  const published = async (s) => (await get("verify", `sha256=${s}`, RUTH))?.published ?? null;
  /* THE WORDS PUT INTO THE WORKING BUCKET FIRST, by the ordinary capture route
     any member has — the probe measured this is what let an observation through
     the gate, so the fence is tested on the path that actually crossed. */
  const put = await (await mf.dispatchFetch(`http://x/api/?op=capture&token=${RUTH}&sha256=${OSHA}`,
    { method: "PUT", body: new TextEncoder().encode(OBYTES) })).json();
  const r1 = await ratify(OBS);
  /* CORRECTED 2026-09-25 by MK-7, never exempted: MK-7 LIFTED C-53.10 for an observation in §4.1's form (this one
     names nobody in its files, MK-6) and narrowed it to one that still names its author, so TESTIMONY_UNPUBLISHABLE
     is no longer this observation's answer and asserting it would pin the fence MK-7 exists to lift. What still
     holds — and is what the fence protected — is that its words do NOT cross outside a signed case: op=ratify
     refuses ATTRIBUTION_UNSTATED (C-92.12), because no ratified case document states whose words they are. The
     narrowed C-53.10 is driven by `mk7-attribution.test.mjs` section 8, on an observation in the pre-§4.1 form. */
  t("op=ratify on the OBSERVATION ITSELF (its bytes in the working bucket, a real member's signature): REFUSED BY NAME — ATTRIBUTION_UNSTATED (C-92.12), no signed case states whose words they are",
    [sr && sr.ok, put && put.ok, ...refusedAsA(r1, "ATTRIBUTION_UNSTATED")],
    [true, true, ...wantA("ATTRIBUTION_UNSTATED")]);
  /* READ THE PUBLISHED BUCKET ITSELF, object by object, rather than asking
     op=verify about a provenance sha: `op=image` hands back a rendering of
     data/provenance.json whose digest is not the stored file's, so a verify on
     it answers false for free — measured when this arm's first draft stayed
     green under the `pubbundle` control while the provenance document WAS in the
     bucket. What is asserted is the thing the fence protects: no published object
     carries the words, an authored provenance document, or the author's handle. */
  const bucket = await mf.getR2Bucket("PUBLISHED");
  const carried = { words: 0, authored: 0, handle: 0 };
  for (const o of (await bucket.list()).objects) {
    const body = await (await bucket.get(o.key)).text();
    if (body.includes("deputy clerk stamp")) carried.words++;
    if (/"authored":\s*true/.test(body)) carried.authored++;
    /* CORRECTED 2026-09-23 by MK-6 (§4.1): the provenance document's author is `observer:<id>` now, so the old
       pattern (`"author": "ruth"`) could no longer match and the count would be 0 for free. Both spellings. */
    if (/"author":\s*"(ruth|observer:[^"]*)"/.test(body)) carried.handle++;
  }
  t("…and NOTHING of it is published: the words' bytes do not verify, and no published object carries the words, an authored provenance document or the author's handle",
    [await published(OSHA), carried], [false, { words: 0, authored: 0, handle: 0 }]);

  const legMd = (id, target, grade = true) => qMd(id, []).replace("references: []",
      ["references:", `  - target: ${target}`, "    rel: cites", "    status: confirmed"].join("\n"))
    .replace("---\n\n## Question", ["basis:", `  - target: ${target}`, "    role: supports",
      ...(grade ? ["    grade: D", "    grade_axis: connection", "    grade_source: testimony"] : []),
      "---", "", "## Question"].join("\n"));
  /* CORRECTED 2026-09-18 (REC-136, INVESTIGATIVE-SESSION.md §7.1 item 6): a
     conclusion drawn with no project NAMES the accepted reading whose claim it
     adopts, and an unnamed one is refused NO_CLAIM. Every finding made here is
     concluded, and it was concluded with no reading because the act took none;
     each now carries one (`withAdoptableReading`, a leg on its one basis target)
     and the call names it. Fixture, not subject: the fence asserted below is
     unchanged. */
  const makeFinding = async (id, target, grade = true) => {
    const md = withAdoptableReading(legMd(id, target, grade));
    const p = await post("promote", { bundleId: id, base: null, snapKey: snapKey(),
      meta: { object_type: "inquiry", group: "believe-in-oakland",
              current_state: "open", created: NOW, last_updated: NOW },
      files: [fileOf("bundle.md", md)] }, RUTH);
    const c = await get("conclude", `target=${id}&conclusion=${encodeURIComponent("It was stamped first.")}`
      + `&falsifier=${encodeURIComponent("A received-log showing a later stamp would overturn this.")}`
      + adoptedVersionParam(), RUTH);
    return [p && p.ok, c && c.ok];
  };
  const F1 = "INQ-2026-5301-rests-on-obs", F2 = "INQ-2026-5301-rests-on-f1";
  const PLAIN = "INFO-2026-5301-plain", F3 = "INQ-2026-5301-rests-on-plain";
  const mk = [await makeFinding(F1, OBS), await makeFinding(F2, F1, false)];
  const r2 = await ratify(F1);
  /* CORRECTED 2026-09-25 by MK-7, never exempted: C-53.11 is LIFTED for a finding resting on an observation in
     §4.1's form (narrowed to one resting on an observation that still names its author). Such a finding now
     crosses on the ordinary rule — only as a member of a RATIFIED case (D-431 (a)) — and op=caseratify refuses that
     case until every observation it reaches is chosen (C-92.10, driven in r4 below). So the loose finding is
     refused by D-431's C-58.2, which is the true first refusal now; asserting C-53.11 would pin the lifted fence. */
  t("op=ratify on a FINDING whose basis cites the observation, in no ratified case: REFUSED BY NAME (C-58.2, D-431) — it crosses only with a signed case",
    [mk, codeOf(r2)], [[[true, true], [true, true]], "RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE"]);
  const r3 = await ratify(F2);
  t("…and one that rests on it THROUGH ANOTHER FINDING (F2 -> F1 -> the observation): REFUSED (C-58.2)",
    codeOf(r3), "RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE");
  /* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7); the fixture takes a name and returns the minted id. */
  const PROJECT = await makePublishingProject({ post: (q, b) => rP(mf.dispatchFetch(`http://x/api/?${q}`,
      { method: "POST", body: JSON.stringify(b ?? {}) }).then((r) => r.json())), mf, sha, machineToken: "adm-mk1",
    owner: "ruth", name: "PROJ-2026-5301-publisher", created: NOW, updated: NOW });
  const pubBody = (targets) => ({ project: PROJECT, targets, roles: allLoadBearing({ targets }),
    scope: "Whether the contract was stamped before the vote, on the documents in hand.",
    statement: "This case covers the stamp only, on the documents in hand at edition 1.",
    excluded: [], subjectPosition: "sought_and_answered",
    subjectJustification: "We put the claim to the Clerk on 2026-06-20 and printed what came back.",
    biasAcknowledgement: "This group holds that contracts should be adopted in public session." });
  const caseRatify = async (targets) => {
    const p = await post("publish", pubBody(targets), RUTH);
    const D = p && p.caseDocument;
    if (!D) return { authored: p };
    return post("caseratify", { caseId: D.case_id, edition: D.edition, expectedSha: D.doc_sha,
      sig: signBytes(`bio-ratify-case ${D.case_id} ${D.edition} ${D.doc_sha}\n`) }, RUTH);
  };
  const r4 = await caseRatify([F1]);
  /* CORRECTED 2026-09-25 by MK-7, never exempted: C-53.12 is LIFTED for a case over an observation in §4.1's form
     and replaced by the attribution gate. The case is still refused, now because its observation's author has
     chosen no level (C-92.10, §4.4), and the refusal names the observation. */
  t("op=caseratify on a CASE whose finding rests on the observation: REFUSED BY NAME — ATTRIBUTION_UNCHOSEN (C-92.10), naming it",
    [...refusedAsA(r4, "ATTRIBUTION_UNCHOSEN"), r4 && Array.isArray(r4.unchosen) ? r4.unchosen.map((u) => u.observation) : null],
    [...wantA("ATTRIBUTION_UNCHOSEN"), [OBS]]);
  const pubObs = await post("publish", pubBody([OBS]), RUTH);
  t("…and the observation itself cannot be a case member at all (op=publish: NOT_AN_INQUIRY, the existing rule)",
    codeOf(pubObs), "NOT_AN_INQUIRY");
  /* OVER-STRICTNESS: an ordinary, non-authored document and a finding and case over it still publish. */
  const pp = await promoteDoc(PLAIN, { files: [fileOf("bundle.md", infoMd(PLAIN))] });
  const mk3 = await makeFinding(F3, PLAIN);
  /* ORDER MATTERS AND IS THE CEREMONY'S, NOT THE FENCE'S: the finding and its case go first.
     CORRECTED 2026-09-25 by D-598 (BOB #34 03:00Z, BIO_Publication_v0_1.md §3 rule 5), at its site and not
     exempted: this comment used to give the reason as the record's rule — "once the plain document is itself
     published, a leg carrying its own grade on it is C-21.2's to refuse (it must inherit)". That was WRONG.
     C-21.2's inheritance rule is over published INQUIRIES only: a document published as a case's EVIDENCE
     (D-431(b)) froze no strength, so there is nothing to inherit from it and a later leg on it keeps its own
     grade. The sentence recorded what C-21.2 then DID (it read every published bundle as a finding), not a
     rule anybody ruled; the arm below D-598's asserts the corrected behaviour. The order that remains is
     D-431's: a finding publishes only inside a ratified case, and its evidence publishes as that case's.
     CORRECTED 2026-09-19 by the D-431 worker (BIO_Publication_v0_1.md §3 rule 2, BOB #16), at its site and not
     exempted: the FINDING was ratified before its CASE DOCUMENT — a finding prepared into no ratified case,
     published loose, which D-431 closes (C-58.2). The ceremony's own order is followed: the case document is
     signed first, then its finding, then the document the finding rests on (as that case's evidence). What
     this arm asserts — nothing ordinary is over-fenced by the testimony fence — is unchanged. */
  const r7 = await caseRatify([F3]);
  const r6 = await ratify(F3);
  const r5 = await ratify(PLAIN);
  t("OVER-STRICTNESS: a finding resting on an ORDINARY document, a case over it, and the document itself all RATIFY exactly as before",
    [pp && pp.ok, mk3, r6 && r6.ok, codeOf(r7), r7 && r7.ok, r5 && r5.ok],
    [true, [true, true], true, null, true, true]);
  /* D-598 (BOB #34, 2026-09-25 03:00Z; BIO_Publication_v0_1.md §3 rule 5): C-21.2 IS OVER PUBLISHED INQUIRIES
     ONLY. PLAIN is now published as F3's case's EVIDENCE and F3 as its finding. A SECOND finding over the
     published document lands WITH ITS OWN GRADE (the leg is testimony at D on connection, exactly F3's leg,
     and nothing about it is inherited); a leg carrying its own grade onto the published INQUIRY F3 is still
     refused by C-21.2 by name, because a case built on a finding cannot be stronger than the finding beneath
     it. Both through op=promote, the write that runs checkInquiryBasis with the published registry. */
  const F4 = "INQ-2026-5301-second-on-plain", F5 = "INQ-2026-5301-own-grade-on-f3";
  const promoteLeg = (id, target) => post("promote", { bundleId: id, base: null, snapKey: snapKey(),
    meta: { object_type: "inquiry", group: "believe-in-oakland", title: "What did the clerk do?",
            current_state: "open", created: NOW, last_updated: NOW },
    files: [fileOf("bundle.md", withAdoptableReading(legMd(id, target)))] }, RUTH);
  const checksOf = (r) => (r && r.findings || []).map((x) => x.check).sort();
  const p4 = await promoteLeg(F4, PLAIN);
  const c4 = await get("conclude", `target=${F4}&conclusion=${encodeURIComponent("It was stamped first.")}`
    + `&falsifier=${encodeURIComponent("A received-log showing a later stamp would overturn this.")}`
    + adoptedVersionParam(), RUTH);
  const p5 = await promoteLeg(F5, F3);
  t("D-598: a SECOND finding over a document published as EVIDENCE lands with its OWN grade (testimony D, not inherited)",
    [p4 && p4.ok, checksOf(p4), c4 && c4.ok], [true, [], true]);
  t("…and a leg with its own grade onto a published INQUIRY is still refused, by C-21.2 by name",
    [p5 && p5.ok, p5 && p5.reason, checksOf(p5)], [false, "BASIS_REFUSED", ["C-21.2"]]);
}

console.log(`\n  corpus: 5 observations authored (ruth x3, sam x2), 4 member-uploaded documents, 1 squatter, `
  + `1 forged promote, 4 refused revisions of one observation, 1 accepted revision; `
  + `publication: 1 observation, 3 findings, 2 cases, 1 plain document; D-598: 1 finding over published evidence, 1 refused leg onto a published finding; members ruth and sam`);
console.log(`\n${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack || e}`);
  console.log(`\n${pass} pass, ${fail + 1} fail`);
  await mf.dispose().catch(() => {});
  process.exit(1);
}
