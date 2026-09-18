/* NEGATIVE CONTROL: RUN 2026-09-18 with `node test/nc-mk4.mjs [arm]` from `bio-plane/`, THIRTEEN arms, every one ALONE with the others held open, each EDITING A REAL SOURCE and restored from a uniquely-named per-arm pristine copy verified by sha256 AND cmp (bio-checks.mjs 749,665 B, store.mjs 2,450,533 B, index.mjs 618,516 B; every restore byte-identical; never `git checkout --`). Final-tree results, each AS DECLARED: (a) `baseline` 69/0. (b) `legonly` — THE ROW'S CONTROL, C-54.1 removed: 64/5, every BY-NAME arm fails while the id shape still keeps the lead out (the second fence, wrong name). (c) `liar` — a lead made citable AND C-54.1 removed: the lead LANDS AS A BASIS LEG, 63/6. First run left "the refused inquiry was not written" GREEN because it asked for a `bundle` op that does not exist — corrected to op=list with a positive control. (d) `stamp` 5/20. (e) `logatauthor` 63/6. (f) `rollup` 68/1 — first run GREEN (a second fence also refused it), re-armed at both. (g) BOB #14's RULING, `machinewide` — the machine read widened back to UNFILTERED (MK-4's first provisional): 64/5, failing NAMING the member token, the admin token and an organisation-scoped ai key reading a lead nobody minted them a scope over, before and after the share. The probe row stays green under it: the probe is confined to the scratch store and is blind to this rule, which its label says. (h) `aiscope` — THE OVER-STRICTNESS arm: every ai key stamped `class:ai`, so a key whose minted scope DOES include the lead loses it: 67/2. (i) `noshare` 66/3. (j) `sharewide` — the share reaches an INVITED-only member: 68/1. (k) `shareauthor` 68/1. (l) `sharepart` 67/2. (m) `overstrict` — C-54.1 claims anything containing "lead": 67/2, first declared against an arm that cannot see it and corrected.
 *
 * MK-4 / IC-135 / IC-136 — THE LEAD (D-194, `MEMBER-KNOWLEDGE-DESIGN.md` §5):
 * the same member knowledge BEFORE the search. An authored row that is NEVER
 * evidence; following it is a look in `observation_log` under
 * `authority_kind = 'lead'`; a lead that finds nothing records `LOOKED_ABSENT`
 * against itself; and a lead cited as a basis leg is refused BY NAME (§7).
 *
 * WHAT THIS SUITE IS FOR. The row's accepts-when, every half THROUGH THE OPS
 * against the real plane in miniflare, under SIGNED-IN members — the acts are
 * refused to every machine credential by shape, so a suite driven under the
 * member TOKEN would drive only the refusal:
 *
 *   1. a lead authored through op=lead writes its row, stamped with its author
 *      (a body `author` is NOT honoured) — and writes NOTHING to the log, since
 *      nobody has looked (NEVER_LOOKED is never stored);
 *   2. op=leadlook writes ONE `observation_log` row with `authority_kind =
 *      'lead'`, `authority = <lead_id>`, level `internet`, subject kind
 *      `description`; `LOOKED_ABSENT` against the lead is recorded AND READ BACK;
 *   3. a lead cited as a leg is refused BY NAME (C-54.1) — through op=promote at
 *      basis[].target and basis[].content_id, and at the version-leg and
 *      action-basis grammars;
 *   3b. VISIBILITY, BOB #14's ruling (2026-09-18): the author; a project's JOINED
 *      participants once the author SHARES it there (op=leadshare, authored and
 *      dated); a machine credential only within a member's MINTED scope; nobody
 *      else — and every refused viewer answers exactly as for an absent lead;
 *   4. THE LIAR: a lead is not an unlabelled observation — no bundle and no
 *      content row answers for its id, so nothing can cite it as evidence;
 *   5. a lead's looks do NOT fall into the run-rollup rules (op=stats' run slice,
 *      op=frontier's document tally, the internet level still not-built);
 *   6. OVER-STRICTNESS: an ordinary INFO leg still lands, and a leg whose target
 *      merely CONTAINS the word "LEAD" is not refused as a lead.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { LEAD_CHECKS, LEAD_ID_RE, BUNDLE_ID_RE, leadLegFindings, basisVersionFindings,
         actionBasisFindings } from "../checks/bio-checks.mjs";

const SRC_DIR = process.env.MK4_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-mk4", MEMBER_TOKEN: "mem-mk4", PROBE_TOKEN: "prb-mk4",
              AI_TOKEN: "ai-mk4", VERSION: "test" },
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
const findingsOf = (r) => {
  const out = [];
  const walk = (x) => {
    if (Array.isArray(x)) { x.forEach(walk); return; }
    if (x && typeof x === "object") {
      if (typeof x.check === "string" && (typeof x.message === "string" || typeof x.detail === "string"))
        out.push({ ...x, message: x.message ?? x.detail });
      Object.values(x).forEach(walk);
    }
  };
  walk(r);
  return out;
};

const NOW = "2026-09-18T00:00:00Z";
const LATER = "2026-09-18T01:00:00Z";

try {

/* ------------------------------------------------------------------ fixture */
const enrol = async (memberId, role = "admin") => {
  const add = await post("memberadd", { memberId, cover: `cover for ${memberId}`, role,
                                        capabilities: ["contribute", "publish"] }, "adm-mk4");
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
/* `legs` are { target, cid? }; references[] carries every target, so the ONLY
   thing that can refuse a lead leg is the lead rule rather than C-6.3. */
const inquiryMd = (id, legs = []) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(legs.length ? ["references:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
                     "    rel: cites", "    status: confirmed"])] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(legs.length ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
                     ...(l.cid ? [`    content_id: "${l.cid}"`] : [])])] : []),
  "---", "", "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const HEAD = new Map();
const promote = async (id, text, type, { readings = [] } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (readings.length) {
    const prov = JSON.stringify({ documents: readings });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260918T${String(400000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
    register: readings.map((d) => ({ sha256: d.capture.sha256, path: "captures/doc.pdf",
                                     encoding: "binary", bytes: 10 })),
    files }, RUTH);
  if (r && r.ok !== false && r.bundleSha) HEAD.set(id, r.bundleSha);
  return r;
};
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (!r || r.ok === false) throw new Error(`promote ${a[0]} REFUSED: ${JSON.stringify(r).slice(0, 900)}`);
  return r;
};
const readingOf = (captureSha) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW, entities: [] } });

const SHA_AGENDA = sha("mk4-the-clerks-march-agenda");
const DOC = "INFO-2026-0918-agenda";
await mustPromote(DOC, infoMd(DOC), "information", { readings: [readingOf(SHA_AGENDA)] });
const WORDS = "I was told the contract was amended; look at the Clerk's March agenda.";
const LOCATOR = "https://example.org/clerk/agendas/2026-03";
console.log("  corpus: 1 document at one capture; members ruth and sam; the member, admin and probe tokens");

const statsOf = async () => get("stats", "", "adm-mk4");
const s0 = await statsOf();
t("the ground: op=stats counts leads (0) and the observation log exists to be written to",
  [s0 && s0.leads, typeof (s0 && s0.observations)], [0, "number"]);

/* ===================== 1. THE ACT: op=lead ================================ */
console.log("\n--- 1. ruth writes a lead ---");
const L1 = await post("lead", { words: WORDS, locator: LOCATOR, author: "sam" }, RUTH);
const LID = L1 && L1.lead_id;
t("op=lead lands: a LEAD- id, ruth's words as written, her locator, evidence false, NEVER_LOOKED",
  [L1 && L1.ok, typeof LID === "string" && LEAD_ID_RE.test(LID), L1 && L1.words, L1 && L1.locator,
   L1 && L1.evidence, L1 && L1.state, L1 && L1.looks],
  [true, true, WORDS, LOCATOR, false, "NEVER_LOOKED", 0]);
t("§7: the author is SERVER-STAMPED — a body `author: sam` is not honoured; ruth is the author",
  L1 && L1.author, "ruth");
const L1q = await post("lead", { words: "a second lead, to test the query-string door" }, RUTH, "&author=sam");
t("§7: nor is a QUERY-STRING `author=sam` — the control plane overwrites it with the session's member",
  [L1q && L1q.ok, L1q && L1q.author], [true, "ruth"]);
const LID2 = L1q && L1q.lead_id;
const s1 = await statsOf();
t("the rows are written (leads 0 -> 2) and NOTHING is written to the log: nobody has looked, and "
  + "NEVER_LOOKED is never stored",
  [s1 && s1.leads, s1 && s1.observations - s0.observations], [2, 0]);
const r0 = await get("leadread", `id=${LID}`, RUTH);
t("op=leadread reads it back with no looks, and says NEVER_LOOKED as an ESTABLISHED fact",
  [r0 && r0.ok, r0 && r0.author, r0 && r0.words, r0 && r0.looks && r0.looks.length, r0 && r0.state,
   r0 && r0.evidence], [true, "ruth", WORDS, 0, "NEVER_LOOKED", false]);

console.log("\n--- 1b. the act's refusals ---");
const mTok = await post("lead", { words: WORDS }, "mem-mk4");
t("the MEMBER token is a machine credential: refused BY NAME (C-54.2), and nothing is written",
  [codeOf(mTok), mTok && mTok.check, mTok && mTok.translation === LEAD_CHECKS.LEAD_NOT_A_MEMBER.translation],
  ["LEAD_NOT_A_MEMBER", "C-54.2", true]);
const aTok = await post("lead", { words: WORDS }, "adm-mk4");
t("the ADMIN token is a machine credential too: refused BY NAME (C-54.2)", codeOf(aTok), "LEAD_NOT_A_MEMBER");
const empty = await post("lead", { words: "   " }, RUTH);
t("an empty lead is refused (C-54.3)", [codeOf(empty), empty && empty.check], ["LEAD_NO_WORDS", "C-54.3"]);
const big = await post("lead", { words: "x".repeat(128 * 1024 + 1) }, RUTH);
t("a lead over one passage is refused rather than cut (C-54.4)", codeOf(big), "LEAD_TOO_LONG");
t("none of the refused acts wrote a row", (await statsOf()).leads, 2);

/* ===================== 2. FOLLOWING IT: op=leadlook ======================= */
console.log("\n--- 2. ruth follows her lead and finds nothing ---");
const lk1 = await post("leadlook", { lead: LID, state: "LOOKED_ABSENT",
  detail: "searched the Clerk's agenda archive for March; no amendment item" }, RUTH);
t("op=leadlook records LOOKED_ABSENT against the lead, at the internet level, in ruth's name",
  [lk1 && lk1.ok, lk1 && lk1.lead_id, lk1 && lk1.state, lk1 && lk1.level, lk1 && lk1.looked_by,
   typeof (lk1 && lk1.seq)], [true, LID, "LOOKED_ABSENT", "internet", "ruth", "number"]);
const s2 = await statsOf();
t("exactly ONE observation_log row was written, and it is NOT a run's (aiRunLog unchanged)",
  [s2.observations - s1.observations, s2.aiRunLog - s0.aiRunLog], [1, 0]);
const r1 = await get("leadread", `id=${LID}`, RUTH);
const look = r1 && r1.looks && r1.looks[0];
t("READ BACK: the row carries authority_kind 'lead', authority = the lead id, level internet, "
  + "subject kind description, state LOOKED_ABSENT",
  look && [look.authority_kind, look.authority, look.level, look.subject_kind, look.state, look.looked_by,
           look.seq === lk1.seq],
  ["lead", LID, "internet", "description", "LOOKED_ABSENT", "ruth", true]);
t("the lead's state is now LOOKED_ABSENT, and a LOOKED_ABSENT row owes no referent (coverage none_owed)",
  [r1 && r1.state, look && look.coverage, look && look.result_ref], ["LOOKED_ABSENT", "none_owed", null]);

console.log("\n--- 2b. the look's refusals ---");
const never = await post("leadlook", { lead: LID, state: "NEVER_LOOKED" }, RUTH);
t("NEVER_LOOKED is never stored: refused BY NAME (C-54.6)",
  [codeOf(never), never && never.check, /never stored/.test(never && never.detail || "")],
  ["LEAD_LOOK_STATE", "C-54.6", true]);
t("an unknown state is refused (C-54.6)", codeOf(await post("leadlook", { lead: LID, state: "FOUND" }, RUTH)),
  "LEAD_LOOK_STATE");
const bare = await post("leadlook", { lead: LID, state: "PRESENT" }, RUTH);
t("PRESENT naming nothing is refused by the LOG's own rule (C-22.10, OBS_PRESENT_NO_REFERENT) — "
  + "the one append site judges the look, and no lead rule restates it",
  [codeOf(bare), bare && bare.check], ["OBS_PRESENT_NO_REFERENT", "C-22.10"]);
t("a referent that is not held is refused (C-54.7)",
  codeOf(await post("leadlook", { lead: LID, state: "PRESENT", resultKind: "capture",
                                  resultRef: sha("nothing-captured") }, RUTH)), "LEAD_LOOK_REFERENT");
t("an OBSERVATION referent — a rollup's — is refused for a member's look (C-54.7), so the rollup "
  + "arm of C-22.10 cannot be reached through a lead",
  codeOf(await post("leadlook", { lead: LID, state: "PRESENT", resultKind: "observation",
                                  resultRef: String(lk1.seq) }, RUTH)), "LEAD_LOOK_REFERENT");
t("a LOOKED_ABSENT look pointing at something it found is refused (C-54.7)",
  codeOf(await post("leadlook", { lead: LID, state: "LOOKED_ABSENT", resultKind: "capture",
                                  resultRef: SHA_AGENDA }, RUTH)), "LEAD_LOOK_REFERENT");
t("the MEMBER token cannot record a member's look (C-54.8)",
  codeOf(await post("leadlook", { lead: LID, state: "LOOKED_ABSENT" }, "mem-mk4")), "LEAD_LOOK_NOT_A_MEMBER");
t("none of the refused looks wrote a row", (await statsOf()).observations, s2.observations);

console.log("\n--- 2c. a look that finds it ---");
const lk2 = await post("leadlook", { lead: LID, state: "PRESENT", resultKind: "capture",
                                     resultRef: SHA_AGENDA, detail: "found in the April packet" }, RUTH);
t("PRESENT pointing at a capture the record holds lands, and the lead is STILL not evidence",
  [lk2 && lk2.ok, lk2 && lk2.result_kind, lk2 && lk2.result_ref, lk2 && lk2.evidence],
  [true, "capture", SHA_AGENDA, false]);
const r2 = await get("leadread", `id=${LID}`, RUTH);
t("read back: two looks in order, the latest PRESENT and backed",
  [r2 && r2.looks.map((l) => l.state), r2 && r2.state, r2 && r2.looks[1].coverage],
  [["LOOKED_ABSENT", "PRESENT"], "PRESENT", "backed"]);

/* ===================== 3. VISIBILITY — BOB #14's RULING ==================
   CORRECTED 2026-09-18 on BOB #14's ruling of MK-4's design gap, and the old arm
   is kept here in words because it asserted the opposite: it read "a machine
   credential reads it (D-15's operator carve-out)" and PASSED with the member
   TOKEN, an UNFILTERED machine credential nobody minted for this lead. The
   ruling: the author; a project's joined participants once the author SHARES
   it; a machine only within a member's minted scope; nobody else — and every
   refused viewer gets EXACTLY the answer for a lead that does not exist. */
console.log("\n--- 3. who may read a lead ---");
const ghost = "LEAD-2026-0918-000000000000";
const norm = (r, id) => JSON.stringify(r).split(id).join("<id>");
const mintAi = async (tokenId, principalKind, principalMember, by) => {
  const r = await post("aicredentialmint", { tokenId, principalKind, principalMember, taskScope: "investigative",
    writes: [], note: "MK-4: a read-only key, to measure what a minted scope reaches" }, by);
  if (!r || !r.token) throw new Error(`mint ${tokenId}: ${JSON.stringify(r).slice(0, 400)}`);
  return r.token;
};
const AI_RUTH = await mintAi("mk4-ruth", "member", "ruth", RUTH);
const AI_SAM = await mintAi("mk4-sam", "member", "sam", SAM);
const AI_ORG = await mintAi("mk4-org", "organisation", null, RUTH);
const aiOwn = await get("leadread", `id=${LID}`, AI_RUTH);
t("OVER-STRICTNESS: ruth's member-scoped ai key reads ruth's lead — the minted scope reaches it",
  [aiOwn && aiOwn.ok, aiOwn && aiOwn.author], [true, "ruth"]);
/* THE REFUSED VIEWERS, and every one answers the ghost's answer byte for byte. */
const refused = { "sam (a member, no share)": SAM, "the member TOKEN (unfiltered, nobody minted it)": "mem-mk4",
                  "the admin TOKEN": "adm-mk4",
                  /* The probe is CONFINED TO THE SCRATCH STORE (`scopeFor`), a different store holding
                     no lead, so it answers not-found by NAMESPACE: the `machinewide` arm cannot see
                     this row, and it is kept only as a check that the door answers identically. */
                  "the probe TOKEN (scratch store; blind to the visibility rule)": "prb-mk4",
                  "an ORGANISATION-scoped ai key": AI_ORG, "sam's member-scoped ai key": AI_SAM };
for (const [who, tok] of Object.entries(refused)) {
  const r = await get("leadread", `id=${LID}`, tok);
  const g = await get("leadread", `id=${ghost}`, tok);
  t(`NO EXISTENCE LEAK: ${who} reading ruth's lead answers EXACTLY as a lead that does not exist (C-54.5)`,
    [codeOf(r), norm(r, LID) === norm(g, ghost)], ["LEAD_NOT_FOUND", true]);
}
t("sam cannot record a look against ruth's lead (C-54.5)",
  codeOf(await post("leadlook", { lead: LID, state: "LOOKED_ABSENT" }, SAM)), "LEAD_NOT_FOUND");

console.log("\n--- 3b. the SHARE: an authored, dated act to one project ---");
/* `member`, not `admin`: a THIRD administrator needs the consensus of the existing ones (4.7). */
const VERA = await enrol("vera", "member"), OTTO = await enrol("otto", "member");
const projMd = (id) => ["---", `id: ${id}`, "object_type: project", "current_state: forming",
  `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []",
  "---", "", "## Summary", "", "A case.", "", "## Session Log", ""].join("\n");
const mkProject = async (id, tok) => {
  const md = projMd(id);
  const r = await post("promote", { bundleId: id, base: null,
    snapKey: `20260918T${String(500000 + (++snapSeq)).slice(-6)}Z_${sha(id).slice(0, 8)}`,
    meta: { object_type: "project", group: "believe-in-oakland", title: `title for ${id}`,
            current_state: "forming", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] }, tok);
  if (!r || r.ok === false) throw new Error(`project ${id}: ${JSON.stringify(r).slice(0, 400)}`);
};
const P1 = "PROJ-2026-0918-contract", P2 = "PROJ-2026-0918-elsewhere";
await mkProject(P1, RUTH);
await mkProject(P2, SAM);
const inv = async (owner, p, handle) => get("projectinvite", `projectId=${p}&handle=${handle}`, owner);
const join = async (tok, p) => get("projectjoin", `projectId=${p}`, tok);
const i1 = await inv(RUTH, P1, "sam"), j1 = await join(SAM, P1);
const i2 = await inv(RUTH, P1, "vera");            /* invited, never joins: skeleton only */
t("FIXTURE: sam invited and JOINED to P1, vera invited only — through the acts, not by hand",
  [i1 && i1.ok, j1 && j1.state, i2 && i2.ok], [true, "joined", true]);
const before = await get("leadread", `id=${LID}`, SAM);
t("before any share, sam — a JOINED participant of ruth's project — still cannot read it (no share, no reach)",
  [codeOf(before), norm(before, LID) === norm(await get("leadread", `id=${ghost}`, SAM), ghost)],
  ["LEAD_NOT_FOUND", true]);
const shSam = await post("leadshare", { lead: LID, project: P1 }, SAM);
t("sam cannot share ruth's lead (C-54.5 — he cannot even see it yet)", codeOf(shSam), "LEAD_NOT_FOUND");
const shP2 = await post("leadshare", { lead: LID, project: P2 }, RUTH);
const shNone = await post("leadshare", { lead: LID, project: "PROJ-2026-0918-nosuch" }, RUTH);
t("ruth cannot share to a project she has not joined (C-54.9), and a project that does not exist gets "
  + "the SAME code — the act is no oracle for which projects exist",
  [codeOf(shP2), shP2 && shP2.check, codeOf(shNone)],
  ["LEAD_SHARE_NOT_A_PARTICIPANT", "C-54.9", "LEAD_SHARE_NOT_A_PARTICIPANT"]);
const sh = await post("leadshare", { lead: LID, project: P1, sharer: "sam" }, RUTH);
t("ruth SHARES her lead to P1: authored (stamped ruth, a body `sharer` is not honoured) and dated",
  [sh && sh.ok, sh && sh.project, sh && sh.shared_by, typeof (sh && sh.at), sh && sh.evidence],
  [true, P1, "ruth", "string", false]);
const again = await post("leadshare", { lead: LID, project: P1 }, RUTH);
t("sharing twice finds the same row — the date does not move", [again && again.ok, again && again.at],
  [true, sh && sh.at]);
const samAfter = await get("leadread", `id=${LID}`, SAM);
t("AFTER the share, sam (joined to P1) reads the lead, and sees the share that reached him",
  [samAfter && samAfter.ok, samAfter && samAfter.author,
   samAfter && samAfter.shared_to && samAfter.shared_to.map((x) => x.project)], [true, "ruth", [P1]]);
const aiSamAfter = await get("leadread", `id=${LID}`, AI_SAM);
t("and sam's member-scoped ai key reaches it too — exactly as far as sam's own scope, no further",
  [aiSamAfter && aiSamAfter.ok], [true]);
for (const [who, tok] of Object.entries({ "vera (invited, not joined)": VERA, "otto (no position in P1)": OTTO,
                                          "the member TOKEN": "mem-mk4", "an ORGANISATION-scoped ai key": AI_ORG })) {
  const r = await get("leadread", `id=${LID}`, tok);
  t(`AFTER the share, ${who} still answers EXACTLY as for a lead that does not exist`,
    [codeOf(r), norm(r, LID) === norm(await get("leadread", `id=${ghost}`, tok), ghost)], ["LEAD_NOT_FOUND", true]);
}
const reshare = await post("leadshare", { lead: LID, project: P2 }, SAM);
t("sam, who can now READ it, still cannot SHARE it: only its author does (C-54.10)",
  [codeOf(reshare), reshare && reshare.check], ["LEAD_SHARE_NOT_AUTHOR", "C-54.10"]);
t("an UNSHARED lead of ruth's stays out of sam's reach even after another lead was shared to him",
  codeOf(await get("leadread", `id=${LID2}`, SAM)), "LEAD_NOT_FOUND");

/* ===================== 4. THE REFUSAL (§7) AND THE LIAR ==================== */
console.log("\n--- 4. a lead cited as a basis leg ---");
const Q1 = "INQ-2026-0918-leadleg";
const p1 = await promote(Q1, inquiryMd(Q1, [{ target: LID }]), "inquiry");
const f1 = findingsOf(p1).filter((x) => x.check === "C-54.1");
t("op=promote REFUSES an inquiry whose basis[].target is a LEAD — BY NAME (C-54.1, LEAD_NOT_EVIDENCE)",
  [p1 && p1.ok === false, f1.length >= 1, f1[0] && f1[0].code], [true, true, "LEAD_NOT_EVIDENCE"]);
t("and the lead leg is answered ONCE, by its name — not also as 'not a canonical bundle id'",
  findingsOf(p1).filter((x) => /basis\[0\]\.target/.test(x.message) && x.check !== "C-54.1").length, 0);
/* CORRECTED 2026-09-18 BY THIS ITEM'S OWN `liar` ARM: this asked for a `bundle` op, and THERE IS NO SUCH OP, so it
   answered "not ok" for every id and the assertion could never fail — the liar landed a lead as a leg
   and this line stayed green. It now reads op=list and carries its POSITIVE control (DOC is listed). */
const listed = async () => JSON.stringify(await get("list", "", "mem-mk4"));
t("the refused inquiry was not written — op=list names the document and NOT the inquiry",
  [(await listed()).includes(DOC), (await listed()).includes(Q1)], [true, false]);
const p2 = await promote(Q1, inquiryMd(Q1, [{ target: DOC, cid: LID }]), "inquiry");
t("citing the lead through basis[].content_id is refused BY NAME too (C-54.1)",
  [p2 && p2.ok === false, findingsOf(p2).some((x) => x.check === "C-54.1" && x.code === "LEAD_NOT_EVIDENCE")],
  [true, true]);
const vf = []; basisVersionFindings({ id: Q1, basis_versions: [{ name: "v1", description: "a reading",
  relationship: "and", state: "suggested" }], basis_version_legs: [{ version: "v1", target: LID, role: "supports" }] }, vf);
t("the VERSION-LEG grammar refuses a lead BY NAME (C-54.1)",
  vf.some((x) => x.check === "C-54.1" && x.code === "LEAD_NOT_EVIDENCE"), true);
const af = []; actionBasisFindings({ action_basis: [{ target: LID, kind: "rests_on" }] }, af);
t("the ACTION-BASIS grammar refuses a lead BY NAME (C-54.1)",
  [af.length, af[0] && af[0].check, af[0] && af[0].code], [1, "C-54.1", "LEAD_NOT_EVIDENCE"]);

console.log("\n--- 4b. THE LIAR: a lead is not an unlabelled observation ---");
t("a lead id is NOT a bundle id and NOT a content id, by shape",
  [BUNDLE_ID_RE.test(LID), /^[0-9a-f]{64}$/.test(LID)], [false, false]);
t("no bundle answers for the lead id — op=list names the document and NOT the lead",
  [(await listed()).includes(DOC), (await listed()).includes(LID)], [true, false]);
const asContent = await get("content", `id=${LID}`, RUTH);
t("no content row answers for the lead id", !!(asContent && asContent.ok === true), false);

console.log("\n--- 4c. OVER-STRICTNESS ---");
await mustPromote(Q1, inquiryMd(Q1, [{ target: DOC }]), "inquiry");
t("an ordinary INFO leg still lands", HEAD.has(Q1), true);
const near = []; leadLegFindings("basis[0]", { target: "INFO-2026-0918-lead-notes" }, near);
t("a document whose id merely contains 'lead' is NOT refused as a lead", near.length, 0);
const near2 = []; leadLegFindings("basis[0]", { target: "LEAD-notes" }, near2);
t("a malformed LEAD- string is left to the target grammar, not claimed by this rule", near2.length, 0);

/* ===================== 5. THE ROLLUP RULES ARE NOT REACHED ================ */
console.log("\n--- 5. a lead's looks are not a run's ---");
const s5 = await statsOf();
t("op=stats' run slice (aiRunLog) never moved across every lead act", s5.aiRunLog, s0.aiRunLog);
const fd = await get("frontier", "level=document", "mem-mk4");
t("the document frontier's tally holds no internet-level row",
  fd && fd.tally && Object.values(fd.tally).reduce((a, b) => a + b, 0), 0);
const fi = await get("frontier", "level=internet", "mem-mk4");
t("the internet level's READ is still stated not-built (not an empty list), and names the lead's writer",
  [fi && fi.built, fi && fi.found, /op=leadlook/.test(fi && fi.note || "")], [false, false, true]);

/* ===================== 7. THE BOUND (bounds.test.mjs's DRIVEN_ELSEWHERE) === */
console.log("\n--- 7. op=leadread is capped, and says so ---");
const b1 = await get("leadread", `id=${LID}&limit=1`, RUTH);
t("a bite of 1 against two looks: one look, `limit` 1, `truncated` TRUE",
  [b1 && b1.looks && b1.looks.length, b1 && b1.limit, b1 && b1.truncated], [1, 1, true]);
t("and the lead's STATE is still the LATEST look's, not the page's last row",
  b1 && b1.state, "PRESENT");
const bAll = await get("leadread", `id=${LID}`, RUTH);
t("at the default bound: both looks, `truncated` FALSE, `limit` 200",
  [bAll && bAll.looks.length, bAll && bAll.truncated, bAll && bAll.limit], [2, false, 200]);
const bOver = await get("leadread", `id=${LID}&limit=999999`, RUTH);
t("an over-ask is answered at the ceiling (2000), never beyond it", bOver && bOver.limit, 2000);
t("the second lead, never followed, reads NEVER_LOOKED",
  (await get("leadread", `id=${LID2}`, RUTH) || {}).state, "NEVER_LOOKED");

/* ===================== 6. PURGE =========================================== */
console.log("\n--- 6. the whole-store purge takes leads and their looks together ---");
const pg = await post("purge", {}, "adm-mk4", "&confirm=bio");
t("op=purge ALL reports the leads it took", [pg && pg.ok, pg && pg.removed && pg.removed.leads], [true, 2]);
t("and the lead no longer reads", codeOf(await get("leadread", `id=${LID}`, RUTH)), "LEAD_NOT_FOUND");

} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nlead: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
