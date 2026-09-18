/* NEGATIVE CONTROL: RUN 2026-09-18 with `node test/nc-mk1.mjs [arm]` from `bio-plane/`, every arm ALONE with the others held open, each EDITING A REAL SOURCE and restored from a uniquely-named per-arm pristine copy verified by sha256 AND by content (store.mjs 2,457,775 B sha256 5ef52ef67584…, index.mjs 614,575 B 017d8d3e37b3…, bio-checks.mjs 747,630 B 496bb173c2c1…; 11 of 11 restores byte-identical; never `git checkout --`). Figures are the FINAL tree's run. Declared BEFORE arming, and the result: (a) `baseline` — nothing armed, MUST be green: 46/0. (b) `unearned` — THE LIAR, the fence stops refusing a document that CLAIMS authored without the testimony path: "THE LIAR" and "ANY truthy spelling" MUST FAIL — 43/3, the forged bundle LANDS (the third failure is "nothing landed"). (c) `hijack` — a register entry re-filing an authored observation's bytes under another bundle: MUST FAIL — 41/5; the re-filing then moves the register row, so the observation's own later revision and its capture-axis entry fail too, which is the harm the refusal prevents, measured. (d) `origin` — §7's first refusal removed: both C-53.7 arms MUST FAIL — 44/2. (e) `dropped` — both C-53.9 sites removed: both MUST FAIL — 44/2. (f) `stamp` — THE AUTHOR STAMP REMOVED at the control plane: "THE STAMP" MUST FAIL — 8/20, and the failure is the one declared rather than a cascade standing in for it: re-driven by hand with a cp-aside/cp-back of index.mjs (sha 017d8d3e… before and after, `cmp` same), the stamp assertion read got [true,"mallory"] — a caller-supplied author LANDED; the rest are every unstamped call arriving with no author and being refused C-53.1. (g) `supplied` — C-53.2 removed: both body-author arms MUST FAIL — 44/2, while THE STAMP stays green (the store reads the stamp). (h) `machine` — C-53.1 removed: the machine-credential arm MUST FAIL — 45/1. (i) `axis` — an authored capture counted as a capture again: the capture-axis arm and the B-leg refusal MUST FAIL — 42/4, the leg claiming B on a member's own words is ACCEPTED under the arm. (j) `extractrow` — the authored capture's extraction observation not written: the op=contentaxis arm MUST FAIL — 45/1, and re-driven by hand (store.mjs cp-aside/cp-back, sha 5ef52ef6… before and after, `cmp` same) it read missing_cause "never_looked" — the record saying nobody looked at a document whose words ARE its text, which is why the row is written. (k) `c181` — C-18.1's authored arm removed: the whole-catalogue arm and the graded arm MUST FAIL — 43/3. (l) `overstrict` — THE OVER-STRICTNESS DIRECTION, every member-origin document treated as a claim: the member-UPLOADED and `authored: false` arms MUST FAIL while THE LIAR stays green — 42/4, as declared. EVERY ARM AS DECLARED.
 *
 * MK-1 / D-184 / IC-133 / IC-134 — THE AUTHORED BUNDLE: a member's firsthand
 * observation IS a document (`docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §2, §7).
 *
 * WHAT THIS SUITE IS FOR. The row's accepts-when, every half of it THROUGH THE OPS
 * against the real plane in miniflare, under SIGNED-IN members:
 *
 *   1. an observation authored through `op=testify` lands as an INFO bundle whose
 *      bytes are exactly the member's words, registered, flagged `authored`, with
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
 *      keeps its register entry is accepted and keeps the flag.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { TESTIMONY_CHECKS, EARNED_CAPTURE_CEILING, checkBundle, BUNDLE_ID_RE } from "../checks/bio-checks.mjs";

const SRC_DIR = fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-mk1", MEMBER_TOKEN: "mem-mk1", PROBE_TOKEN: "prb-mk1", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
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
    meta: { object_type: "information", group: "believe-in-oakland", title: `Info ${id}`,
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
const OSHA = sha(WORDS);
t("op=testify lands: an INFO bundle under a CANONICAL id, authored, origin and actor member, the author RUTH, both dates apart",
  [tx && tx.ok, typeof OBS === "string" && BUNDLE_ID_RE.test(OBS) && OBS.startsWith("INFO-"), tx && tx.authored, tx && tx.origin,
   tx && tx.actor_class, tx && tx.author, tx && tx.observed_at,
   typeof (tx && tx.recorded_at) === "string" && tx.recorded_at !== OBSERVED],
  [true, true, true, "member", "member", "ruth", OBSERVED, true]);
t("the capture IS the words: capture_sha is sha256 of exactly the bytes ruth sent, and it names a file",
  [tx && tx.capture_sha, tx && tx.bytes, typeof (tx && tx.file) === "string" && tx.file.startsWith("snapshots/")],
  [OSHA, Buffer.byteLength(WORDS), true]);
t("its axes are STATED, not shown: capture undetermined (CAPTURE_AXIS_AUTHORED), testimony not yet carried",
  [tx && tx.axes && tx.axes.capture.grade, tx && tx.axes && tx.axes.capture.undetermined_because,
   tx && tx.axes && tx.axes.testimony.grade, typeof (tx && tx.axes && tx.axes.testimony.why)],
  [null, "CAPTURE_AXIS_AUTHORED", null, "string"]);

const img = await get("image", `id=${encodeURIComponent(OBS)}`, RUTH);
const prov = img && typeof img["data/provenance.json"] === "string" ? JSON.parse(img["data/provenance.json"]) : null;
const d0 = prov && prov.documents && prov.documents[0];
t("READER op=image: the words file holds EXACTLY what ruth wrote — byte-identical, nothing cleaned",
  img && tx ? img[tx.file] : null, WORDS);
t("the register entry declares authored, origin member, actor member, the stamped author, observed_at — and NO capture grade",
  d0 ? [d0.authored, d0.origin && d0.origin.kind, d0.capture && d0.capture.actor_class, d0.author,
        d0.observed_at, d0.capture && d0.capture.sha256, "grade" in (d0.capture || {})] : null,
  [true, "member", "member", "ruth", OBSERVED, OSHA, false]);
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
t("…and the record says ruth, not mallory, in the register entry and the revision's author",
  [qaDoc && qaDoc.author, qaImg ? qaImg["bundle.md"].includes("mallory") : null], ["ruth", false]);
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
const dup = await post("testify", { words: WORDS, observedAt: OBSERVED }, SAM);
t("the EXACT bytes already registered are refused (C-53.6) — re-registering would re-file ruth's row",
  refusedAs(dup, "TESTIMONY_WORDS_REGISTERED"), want("TESTIMONY_WORDS_REGISTERED"));
t("…and the refusal does not name the bundle that holds them (it may be one the caller cannot see)",
  JSON.stringify(dup).includes(OBS), false);

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
    meta: { object_type: "information", group: "believe-in-oakland", title: "revised",
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
  meta: { object_type: "information", group: "believe-in-oakland", title: "revised",
          current_state: "collected", created: tx.recorded_at, last_updated: tx.recorded_at },
  files: [fileOf("bundle.md", head0["bundle.md"]), fileOf(tx.file, head0[tx.file])] }, RUTH);
t("…and one whose revision drops data/provenance.json altogether (C-53.9)",
  refusedAs(gone, "TESTIMONY_AUTHORED_DROPPED"), want("TESTIMONY_AUTHORED_DROPPED"));
const hijack = await promoteDoc("INFO-2026-5301-hijack", { docs: [uploadDoc(OSHA)],
  register: [{ sha256: OSHA, path: "snapshots/upload.pdf", encoding: "binary", bytes: 10 }] });
t("a DIFFERENT bundle registering an authored observation's bytes is REFUSED (C-53.8) — no re-filing",
  refusedAs(hijack, "TESTIMONY_AUTHORED_UNEARNED"), want("TESTIMONY_AUTHORED_UNEARNED"));
const keep = await reviseObs(() => {},
  { register: [{ sha256: OSHA, path: tx.file, encoding: "utf8", bytes: Buffer.byteLength(WORDS) }] });
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
  meta: { object_type: "inquiry", group: "believe-in-oakland", title: "What did the clerk do?",
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

console.log(`\n  corpus: 3 observations authored (ruth x2, sam x1), 3 member-uploaded documents, `
  + `1 forged promote, 4 refused revisions of one observation, 1 accepted revision; members ruth and sam`);
console.log(`\n${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack || e}`);
  console.log(`\n${pass} pass, ${fail + 1} fail`);
  await mf.dispose().catch(() => {});
  process.exit(1);
}
