/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/aicredential.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (PL-3's and PL-4's precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad. Every arm is armed ALONE against a whole tree, every restore is verified BY sha256 AND BY CONTENT, and every arm names what MUST fail AND what MUST NOT.
   OWED CONTROL 1 IS DEC-55.5 AND IT HAS TWO HALVES. The first half is in THIS suite, block 8, and needs no source edit: a member authors a BROAD scope on the record, the gate admits it, and every MACHINE_CANNOT_* fires BY NAME on `token:ai`. The second half is arm (1) below and IT HAS NEVER BEEN RUN IN THIS PROJECT.
   (1) DEC-55.5'S SECOND HALF — REMOVE THE PREDICATE AND THEY ALL STOP FIRING. In checks/bio-checks.mjs make `isMachineStamp` return false. `isMachineIdentity` is `isMachineStamp` OR a bare class word OR a NON_MEMBER_AUTHORS name, and `token:ai` is none of the latter two, so ONE edit disarms all twelve — which is D-199 (5)'s claim about REC-46 stated as a measurement rather than as prose.
   (2) THE SCOPE IS READ FROM THE RECORD. In src/index.mjs make `aiTaskScope`'s declared-writes test read a literal array instead of `cred.writes`.
   (3) THE SHAPE FENCE. In src/index.mjs make `aiReachesAsMember` return true.
   (4) THE MINT IS A MEMBER ACT (D-199 (3)). In src/store.mjs guard `aiCredentialMint`'s identity refusal with `false &&`.
   (5) THE STATED VIEWER. In src/index.mjs stamp `class:ai` for every ai credential instead of the record's principal.
   (6) OVER-STRICTNESS, and these PASS rather than fail — see block 9.
 * ========================================================================= */
/* IS-BUILD-PLAN PL-11 / IS-5 — THE `ai` CREDENTIAL CLASS, D-199's FIVE
 * DETERMINATIONS WHOLE.
 *
 * WHAT IS ASSERTED HERE, in the order the blocks run:
 *
 *  1. ONE CLASS, AND ITS SCOPE COMES FROM THE RECORD (D-199 (1), (2)). The four
 *     existing classes are env bindings; this one is a ROW. Asserted over
 *     source as well as by driving, because "not a settings row" is a claim
 *     about what the code CANNOT do.
 *  2. MINTING IS A MEMBER ACT (D-199 (3)), refused for every machine credential
 *     this plane has — INCLUDING an `ai` credential whose authored scope names
 *     the mint, which is the arm that proves the credential layer and the
 *     identity layer do not absorb each other.
 *  3. THE RECORD NAMES IDENTITY AND PRINCIPAL (D-199 (4)) and never the value.
 *  4. THE DECLARED TASK SCOPE, ENFORCED AT THE GATE in `scopeFor`'s shape.
 *  5. THE FENCE IS A SHAPE, NOT A CLASS LIST — PL-4's delegated constraint,
 *     driven over EVERY op in the table rather than over a chosen few.
 *  6. THE STATED VIEWER: a member-scoped credential and an organisation-scoped
 *     one read DIFFERENTLY, which is what makes D-199 (4) a measurement.
 *  7. REVOKING, and what a withdrawn credential is told.
 *  8. DEC-55.5, FIRST HALF: every MACHINE_CANNOT_* fires by name on `token:ai`,
 *     with a SWEEP-COMPLETENESS arm so a partial grading cannot read as a full
 *     one.
 *  9. OVER-STRICTNESS: the investigative credential DOES its work — a real
 *     `suggested` version and a real capture request land.
 * 10. DEC-49: the driven code set EQUALS the registry, floor as well as ceiling.
 * ========================================================================= */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { AI_CREDENTIAL_CHECKS, isMachineIdentity, isMachineStamp } from "../checks/bio-checks.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const INDEX_SRC = readFileSync(SRC("index.mjs"), "utf8");
const SCHEMA_SRC = readFileSync(SRC("schema.mjs"), "utf8");
const QUERY_SRC = readFileSync(SRC("query.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* NULL-TOLERANT (PL-1's discipline, PL-4's restatement): an arm that throws on
   `.code` of undefined takes every arm behind it with it and reports one defect
   as none. */
const codeOf = (r) => (r && typeof r.code === "string") ? r.code
                    : (r && typeof r.reason === "string") ? r.reason : null;

/* Comments BLANKED length-preservingly before any source walk. This file's
   subject is named in dozens of comments inside the very spans it walks — the
   string `ai` and the phrase `capturerequestdrain` both appear in prose
   explaining why they are absent from the code — so a walk over raw source
   would read the fence's own explanation as a breach of it. PL-1 measured that
   false positive one family over. */
const decomment = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
  .replace(/(^|[^:])\/\/[^\n]*/gm, (m, p) => p + " ".repeat(m.length - p.length));
const INDEX_BARE = decomment(INDEX_SRC);
const STORE_BARE = decomment(STORE_SRC);

let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-pl11", MEMBER_TOKEN: "mem-pl11", PROBE_TOKEN: "prb-pl11",
              DAEMON_TOKEN: "dmn-pl11", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-pl11",
              GOVERNOR_APPETITE_PER_MIN: "600000",
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  outboundService() { return new Response(new Uint8Array(2048), { headers: { "content-type": "application/pdf" } }); },
});
MF = mf;

const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const RAW = async (q) => await (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const GET = async (q) => rP(await RAW(q));
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const POSTRAW = async (q, body) => await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

try {

/* ---------------------------------------------------------------- fixture */
const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-pl11",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* 4.2/4.3: the second member of a group must be an administrator, and there are
   no ordinary members until TWO exist. `gus` is that second admin and does
   nothing else here. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
const GUS = await enrol("gus", "admin", ["contribute"]);
const ANNA = await enrol("anna", "member", ["contribute"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

const inquiryMd = (id, question = `What does ${id} rest on?`) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const promote = async (id, text, type, tok = RUTH, extraMeta = {}) => POST(`op=promote&token=${tok}`, {
  bundleId: id, base: null,
  snapKey: `${id}-${Math.random().toString(36).slice(2, 8)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: [],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : "collected",
          created: NOW, last_updated: LATER, ...extraMeta } });

const INQ = "INQ-2026-5100-ai-credential";
{
  const a = await promote(INQ, inquiryMd(INQ), "inquiry");
  if (!a.ok) throw new Error(`promote ${INQ}: ${JSON.stringify(a).slice(0, 600)}`);
}
/* RUTH'S PRIVATE PROJECT — Anna is not a participant, which is what block 6
   measures the stated viewer against. */
const PRJ = "PRJ-2026-5100-ruths-own";
{
  const md = ["---", `id: ${PRJ}`, "object_type: project", "schema: project@1",
    `title: "Ruth's own project"`, "current_state: collected", "prior_state: null",
    `created: "${NOW}"`, `last_updated: "${LATER}"`, "group: believe-in-oakland",
    "references: []", "state_history: []", "---", "", "## Notes", ""].join("\n");
  const a = await promote(PRJ, md, "project");
  if (!a.ok) throw new Error(`promote ${PRJ}: ${JSON.stringify(a).slice(0, 600)}`);
}

const DRIVEN = new Set(), WIRE = new Map();
const drive = (r) => { const c = codeOf(r); if (c && c in AI_CREDENTIAL_CHECKS) { DRIVEN.add(c); WIRE.set(c, r.check); } return r; };

/* THE ONE MINT, so no arm can quietly differ in what it asked for. */
let mintSeq = 0;
const mint = async (over = {}, tok = RUTH) => drive(await POST(`op=aicredentialmint&token=${tok}`, {
  tokenId: over.tokenId ?? `agent-${++mintSeq}`,
  principalKind: "member", principalMember: "ruth",
  taskScope: "investigative", writes: ["suggest", "capturerequest"],
  note: "the investigative session: reads across the project, writes only the suggest endpoint "
      + "and the capture-request door", ...over }));

/* ====================================================================== 1
 * ONE CLASS, AND ITS SCOPE COMES FROM THE RECORD — NEVER A SETTINGS ROW.
 * ====================================================================== */
console.log("\n--- 1. one class, and D-199 (2): the scope is a ROW, not a binding ---");
{
  const tbl = SCHEMA_SRC.indexOf("CREATE TABLE IF NOT EXISTS ai_credentials");
  const gov = SCHEMA_SRC.indexOf("CREATE TABLE IF NOT EXISTS host_governor");
  t("ai_credentials exists in schema.mjs", tbl > -1, true);
  t("and is declared BEFORE the host_governor block (CLAUDE.md's trap)", tbl > -1 && gov > -1 && tbl < gov, true);
  const body = SCHEMA_SRC.slice(tbl, SCHEMA_SRC.indexOf("\n);", tbl));
  t("the row names WHO minted it and WHEN — an authored, dated act, which is what a settings row "
  + "is not (D-199 (2), DEC-17 transplanted)",
    [/minted_by\s+TEXT NOT NULL/.test(body), /minted_at\s+TEXT NOT NULL/.test(body)], [true, true]);
  t("it names the PRINCIPAL KIND and the PRINCIPAL, both NOT NULL (D-199 (4))",
    [/principal_kind\s+TEXT NOT NULL/.test(body), /principal\s+TEXT NOT NULL/.test(body)], [true, true]);
  t("and it holds NO column a token VALUE could go in — only an identity and a verifier",
    /token_id/.test(body) && /secret_sha/.test(body) && !/\btoken_value\b|\bsecret\s+TEXT\b/.test(body), true);

  /* THE CLAIM THAT NEEDS A SOURCE ARM: `classify()` compares FOUR bindings and
     none of them is an AI one. A fifth binding would be exactly the settings row
     D-199 (2) refuses, and it would be invisible to every behavioural arm here
     because it would simply work. */
  const cl = INDEX_BARE.indexOf("async function classify(token, env)");
  const clBody = INDEX_BARE.slice(cl, INDEX_BARE.indexOf("\n}", cl));
  const bindings = [...clBody.matchAll(/env\.([A-Z_]+_TOKEN)/g)].map((m) => m[1]);
  t("classify() resolves EXACTLY the four env-binding classes", [...new Set(bindings)].sort(),
    ["ADMIN_TOKEN", "DAEMON_TOKEN", "MEMBER_TOKEN", "PROBE_TOKEN"]);
  t("and NO AI_TOKEN binding exists anywhere in the plane's sources — a fifth binding IS the "
  + "settings row D-199 (2) rules out, and nothing behavioural could see it",
    /\bAI_TOKEN\b/.test(decomment(INDEX_SRC) + decomment(STORE_SRC)), false);
  /* The span is non-trivial: a walk over an empty body would report "no
     bindings" triumphantly. */
  t("(the classify() span the walk read is a real body, not a collapsed match)", clBody.length > 200, true);

  /* AND THE POSITIVE HALF: the class resolves against the STORE. */
  t("the ai branch resolves by asking the Durable Object, not by comparing a binding",
    /AI_TOKEN_SHAPE\.test\(t\)/.test(INDEX_BARE) && /aicredentiallook\?sha=/.test(INDEX_BARE), true);
}

/* ====================================================================== 2
 * MINTING IS A MEMBER ACT (D-199 (3)) — AND NOT AN AI ACT, WHICH IS THE HALF
 * THAT MATTERS.
 * ====================================================================== */
console.log("\n--- 2. D-199 (3): minting is a MEMBER act, never an AI act ---");
const AGENT = await mint({ tokenId: "investigator" });
{
  t("a signed-in member mints", AGENT?.ok, true);
  t("and the value is returned EXACTLY ONCE, in the mint's own answer",
    typeof AGENT?.token === "string" && /^aik-[0-9a-f]{64}$/.test(AGENT.token), true);
  t("the answer says plainly that it will not be shown again",
    typeof AGENT?.tokenIsShownOnce === "string" && AGENT.tokenIsShownOnce.length > 40, true);

  /* EVERY MACHINE CREDENTIAL THIS PLANE HAS, refused BY NAME. The MEMBER_TOKEN
     arm is the one REC-45 measured going the other way: `token:member` is a
     MACHINE and a word list once let it through. */
  const byMember = drive(await POST("op=aicredentialmint&token=mem-pl11",
    { tokenId: "by-a-machine", principalKind: "organisation", writes: [] }));
  t("the MEMBER_TOKEN machine credential is refused BY NAME", codeOf(byMember), "AI_CREDENTIAL_MINT_NOT_A_MEMBER");
  t("with its C-number and its canned translation, not a bare code (DEC-49)",
    [byMember.check, typeof byMember.translation === "string" && byMember.translation.length > 40],
    ["C-29.1", true]);
  const byAdmin = drive(await POST("op=aicredentialmint&token=adm-pl11",
    { tokenId: "by-the-root", principalKind: "organisation", writes: [] }));
  t("and so is the ADMIN_TOKEN root-of-trust credential — being the root of trust is not being a person",
    codeOf(byAdmin), "AI_CREDENTIAL_MINT_NOT_A_MEMBER");
  const byProbe = await POSTRAW("op=aicredentialmint&token=prb-pl11", { tokenId: "by-probe" });
  t("the PROBE class does not reach the op at all — admitting it so the surface were exercisable is "
  + "the hole DEC-52 measured at index.mjs:668, arriving at the act that decides what machines may do",
    byProbe?.error, "forbidden for token class");
  t("(and the store's fence would have refused it anyway — neither is load-bearing alone)",
    isMachineIdentity("token:probe"), true);

  t("nothing was written by any of them", (await GET(`op=aicredentials&token=${RUTH}`)).credentials
    .map((c) => c.tokenId), ["investigator"]);
}

/* ====================================================================== 3
 * THE RECORD NAMES THE IDENTITY AND THE PRINCIPAL — AND NEVER THE VALUE.
 * ====================================================================== */
console.log("\n--- 3. D-199 (4): the identity, the principal, and never the value ---");
const ORG = await mint({ tokenId: "org-agent", principalKind: "organisation", principalMember: null });
{
  t("an ORGANISATION-scoped key records that it acts for the group with nobody individual behind it",
    [ORG?.credential?.principalKind, ORG?.credential?.principal], ["organisation", "class:ai"]);
  t("a MEMBER-scoped key is attributable to that member",
    [AGENT?.credential?.principalKind, AGENT?.credential?.principal], ["member", "member:ruth"]);
  t("both name the MINTING member and the date", [AGENT.credential.mintedBy, typeof AGENT.credential.mintedAt],
    ["ruth", "string"]);

  const nokind = await mint({ tokenId: "unstated", principalKind: null });
  t("a credential that says NEITHER is refused by name — an act must say which (D-199 (4))",
    codeOf(nokind), "AI_CREDENTIAL_PRINCIPAL_UNSTATED");
  t("with its C-number and translation", [nokind.check, nokind.translation.length > 40], ["C-29.2", true]);
  const dup = await mint({ tokenId: "investigator" });
  t("and an identity already in use is refused rather than rebound — acts CITE the identity, so "
  + "rebinding would re-attribute work already done", codeOf(dup), "AI_CREDENTIAL_IDENTITY_TAKEN");
  t("with its C-number", dup.check, "C-29.3");

  /* THE VALUE IS NOWHERE. Three arms, because "we do not log it" is a promise
     and "nothing here has ever held it" is a property. */
  const list = await GET(`op=aicredentials&token=${RUTH}`);
  const fields = [...new Set(list.credentials.flatMap((c) => Object.keys(c)))].sort();
  t("the list publishes the identity, the principal, the scope and the authorship — and no value "
  + "and no hash", fields,
    ["mintedAt", "mintedBy", "note", "principal", "principalKind", "revoked", "revokedAt", "revokedBy",
     "taskScope", "tokenId", "writes"]);
  t("no credential value appears in the serialised list", /aik-[0-9a-f]{64}/.test(JSON.stringify(list)), false);
  /* THE CLAIM NARROWED TO WHAT IS TRUE, and the narrowing is a finding rather
     than a softening: `store.mjs` DOES hold a random generator — it mints
     session tokens at line ~13264 — so a whole-file arm would have been a
     confident assertion about the wrong span, which is this repository's
     most-repeated instrument defect. What is true and what matters is that the
     FOUR ai-credential methods never see a value: no generator inside them, no
     value shape, and the control plane hands them a hash. */
  const credSpan = STORE_BARE.slice(STORE_BARE.indexOf("aiCredentialMint({"),
                                    STORE_BARE.indexOf("#aiCredentialPublic(row) {"));
  t("(the ai-credential span the walk read is a real body, not a collapsed match)", credSpan.length > 2000, true);
  t("the ai-credential methods cannot print a credential because none has ever held one — no "
  + "generator and no value shape in the span, and the control plane hands them a HASH",
    [/getRandomValues/.test(credSpan), /aik-/.test(credSpan), /secretSha/.test(credSpan)],
    [false, false, true]);
  t("(and the walk finds the generator that IS in this file, so it is not blind)",
    /getRandomValues/.test(STORE_BARE), true);
}

/* ====================================================================== 4
 * THE DECLARED TASK SCOPE, ENFORCED AT THE GATE IN `scopeFor`'s SHAPE.
 * ====================================================================== */
console.log("\n--- 4. D-199 (1): class plus a declared task scope, enforced at the gate ---");
const AK = AGENT.token;
{
  const acc = drive(await POST(`op=versionaccept&token=${AK}`, { target: INQ, version: "v1" }));
  t("an `ai` credential calling op=versionaccept is refused BY NAME at the gate",
    codeOf(acc), "AI_BEYOND_TASK_SCOPE");
  t("with its C-number and its canned translation", [acc.check, acc.translation.length > 40], ["C-29.6", true]);
  t("and the refusal NAMES the declared scope, so the member reading it can see what would have to "
  + "be amended", [acc.taskScope, acc.declared], ["investigative", ["capturerequest", "suggest"]]);
  t("op=versioncurrent likewise", codeOf(await POST(`op=versioncurrent&token=${AK}`,
    { target: INQ, version: "v1" })), "AI_BEYOND_TASK_SCOPE");
  t("op=publish likewise", codeOf(await POST(`op=publish&token=${AK}`, { target: INQ })), "AI_BEYOND_TASK_SCOPE");
  t("op=conclude likewise", codeOf(await POST(`op=conclude&token=${AK}`, { id: INQ })), "AI_BEYOND_TASK_SCOPE");

  /* THE SCOPE IS READ FROM THE RECORD AND NOT FROM A CONSTANT, and the only way
     to show that is to write a DIFFERENT row and watch the gate change its
     mind. A second credential authored with `versionreject` in its writes now
     PASSES the gate — and is refused one layer down by the store, which is the
     two-layer separation this whole item rests on. */
  const wider = await mint({ tokenId: "wider", writes: ["suggest", "versionreject"], taskScope: "review" });
  const rej = await POST(`op=versionreject&token=${wider.token}`, { target: INQ, version: "v1" });
  t("a credential whose RECORD declares op=versionreject is admitted by the gate — the scope is read "
  + "from the row, not from anything compiled in", codeOf(rej) !== "AI_BEYOND_TASK_SCOPE", true);
  t("and the store refuses it at the identity layer instead, which is the point: two layers, "
  + "neither absorbing the other", codeOf(rej), "MACHINE_CANNOT_MOVE_VERSION");
  t("while the SAME op under the investigative credential is still refused at the gate",
    codeOf(await POST(`op=versionreject&token=${AK}`, { target: INQ, version: "v1" })), "AI_BEYOND_TASK_SCOPE");

  /* D-199 (3)'S SHARPEST CONSEQUENCE, DRIVEN. A member may legitimately author
     a scope naming the mint — a member CAN reach it, so the floor admits it —
     and the agent holding that credential is STILL refused, by the store, on
     REC-46's one predicate. If an agent could request a broader token the
     scoping would be theatre; this is the arm that proves it cannot. */
  const selfMint = await mint({ tokenId: "bootstrapper", writes: ["aicredentialmint"], taskScope: "self-extending" });
  t("a member may author a scope naming the mint itself — the floor admits it, because a member "
  + "reaches it", selfMint?.ok, true);
  const grab = drive(await POST(`op=aicredentialmint&token=${selfMint.token}`,
    { tokenId: "the-broader-one", principalKind: "organisation", writes: [] }));
  t("and the AGENT holding it is refused anyway, by the STORE, on REC-46's one predicate — "
  + "*if an agent can request a broader token, the scoping is theatre*",
    codeOf(grab), "AI_CREDENTIAL_MINT_NOT_A_MEMBER");
  t("no broader credential was written", (await GET(`op=aicredentials&token=${RUTH}`))
    .credentials.some((c) => c.tokenId === "the-broader-one"), false);
}

/* ====================================================================== 5
 * THE FENCE IS A SHAPE, NOT A CLASS LIST — PL-4's DELEGATED CONSTRAINT.
 * ====================================================================== */
console.log("\n--- 5. the fence is a SHAPE: driven over EVERY op in the table ---");
{
  /* THE OP TABLE, PARSED FROM SOURCE rather than typed here. Producing the set
     by DRIVING is the rule; producing the QUESTION by typing would be the same
     defect one step earlier. */
  const opsAt = INDEX_BARE.indexOf("const OPS = {");
  const opsSrc = INDEX_BARE.slice(opsAt, INDEX_BARE.indexOf("\n};", opsAt));
  const OPS = {};
  for (const m of opsSrc.matchAll(/^\s*([a-z][a-z0-9]*)\s*:\s*\{\s*classes:\s*(\[[^\]]*\]|null)\s*,\s*mutating:\s*(true|false)/gm))
    OPS[m[1]] = { classes: m[2] === "null" ? null : JSON.parse(m[2].replace(/'/g, '"')),
                  mutating: m[3] === "true" };
  const names = Object.keys(OPS);
  /* THE SPAN IS NON-TRIVIAL, and the walk is run over a subject that MUST trip
     it: a parser that had gone blind would report a small clean set. */
  t("the OPS table parsed out of source is the whole table, not a fragment", names.length >= 150, true);
  t("(and the parser is not accepting anything: it finds none of these in the same span)",
    ["notanop", "definitelynotanop"].filter((n) => n in OPS), []);

  t("NO ROW OF THE OPS TABLE NAMES THE `ai` CLASS — admission is a shape over this table and never "
  + "membership in it, so adding the class to a row would grant nothing",
    names.filter((n) => Array.isArray(OPS[n].classes) && OPS[n].classes.includes("ai")), []);

  const memberReach = names.filter((n) => Array.isArray(OPS[n].classes) && OPS[n].classes.includes("member"));
  const beyond = names.filter((n) => !memberReach.includes(n));
  t("the two sets partition the table and both are substantial",
    [memberReach.length + beyond.length === names.length, memberReach.length > 100, beyond.length > 10],
    [true, true, true]);

  /* PL-4'S CONSTRAINT, NAMED. */
  t("op=capturerequestdrain carries NO member class, BY CONSTRUCTION (PL-4), so it is outside every "
  + "scope anybody can author — and nobody had to remember it",
    beyond.includes("capturerequestdrain"), true);

  /* EVERY op outside the floor, DRIVEN through the mint one at a time. A single
     mint naming all of them would refuse on the first and grade one. */
  const refusedBeyond = [], leaked = [];
  for (const op of beyond) {
    const r = drive(await mint({ tokenId: `probe-${op}`, writes: [op] }));
    if (codeOf(r) === "AI_SCOPE_BEYOND_MEMBER_REACH") refusedBeyond.push(op);
    else leaked.push([op, codeOf(r) || (r?.ok ? "MINTED" : "?")]);
  }
  t(`every one of the ${beyond.length} ops no member reaches is refused at the mint, by name`,
    [refusedBeyond.length === beyond.length, leaked], [true, []]);
  const drainRefusal = await mint({ tokenId: "drain-grab", writes: ["capturerequestdrain"] });
  t("and PL-4's own verb carries C-29.9 off the wire, with its canned translation — pinned against "
  + "what the plane SENT rather than against the registry the number was read from",
    [drainRefusal.check, drainRefusal.translation.length > 40, drainRefusal.classes],
    ["C-29.9", true, ["admin", "probe", "daemon"]]);

  /* AND THE FLOOR ADMITS THE WHOLE OF ITS OWN SIDE — the over-strictness half
     of the same sweep, because a fence that refuses correct work is a defect. */
  const wholeFloor = await mint({ tokenId: "everything-a-member-can-do",
    writes: memberReach.filter((n) => OPS[n].mutating), taskScope: "the whole member surface" });
  t("a scope naming EVERY mutating op a member reaches is authorable — the floor is the member "
  + "surface and not a shorter list somebody chose", wholeFloor?.ok, true);

  const unknown = await mint({ tokenId: "fictional", writes: ["nosuchop"] });
  t("a scope naming something that is not an op at all is refused by name — an entry nothing "
  + "enforces is what declaring the scope on the record was for", codeOf(unknown), "AI_SCOPE_UNKNOWN_OP");
  t("with its C-number", unknown.check, "C-29.8");

  /* THE RULE HAS NO OP NAMES IN IT. A shape with an exception list in it is a
     list, so this is asserted over the function's own source. */
  const gAt = INDEX_BARE.indexOf("function aiTaskScope(cred, op, spec)");
  const gBody = INDEX_BARE.slice(gAt, INDEX_BARE.indexOf("\n}", gAt));
  t("(the aiTaskScope span the walk read is a real body)", gBody.length > 400, true);
  const opLiterals = [...gBody.matchAll(/["']([a-z][a-z0-9]{3,})["']/g)].map((m) => m[1])
    .filter((s) => s in OPS);
  t("aiTaskScope names NO op — the fence is a shape, and a shape with an exception list in it is a "
  + "list", opLiterals, []);
}

/* ====================================================================== 6
 * THE STATED VIEWER: THE PRINCIPAL IS WHAT THE CREDENTIAL SEES.
 * ====================================================================== */
console.log("\n--- 6. the STATED viewer, and why D-199 (4) is a measurement rather than a label ---");
{
  const annaKey = await mint({ tokenId: "annas-agent", principalKind: "member", principalMember: "anna" });
  const orgSees = await GET(`op=list&token=${ORG.token}`);
  const annaSees = await GET(`op=list&token=${annaKey.token}`);
  const ruthSees = await GET(`op=list&token=${AK}`);
  /* op=list's uncapped arm answers a BARE ARRAY (REC-60/D-225's recorded
     licence), so the reader takes that shape rather than inventing an envelope
     that is not there. */
  const ids = (r) => (Array.isArray(r) ? r : (r?.bundles || r?.items || [])).map((b) => b.bundle_id || b.id).sort();
  t("Ruth's project is visible to the ORGANISATION-scoped credential: it acts for the group, and "
  + "there is no individual behind it whose participation could be checked", ids(orgSees).includes(PRJ), true);
  t("and to a credential whose principal is RUTH, who owns it", ids(ruthSees).includes(PRJ), true);
  t("and NOT to a credential whose principal is ANNA, who was never invited — the participation "
  + "filter applies to the agent because the record's principal IS the stamped viewer",
    ids(annaSees).includes(PRJ), false);
  t("while the shared evidence corpus is visible to all three (7.9: what participation scopes is "
  + "the group's THINKING, not its evidence)",
    [ids(orgSees).includes(INQ), ids(annaSees).includes(INQ), ids(ruthSees).includes(INQ)],
    [true, true, true]);
  t("viewerPredicate recognises class:ai — leaving it out would not have been narrower, it would "
  + "have made an organisation key read ABSENT for every bundle (REC-33's arm (b))",
    /admin\|member\|probe\|daemon\|ai/.test(QUERY_SRC), true);
}

/* ====================================================================== 7
 * REVOKING.
 * ====================================================================== */
console.log("\n--- 7. withdrawing a credential, and what it is then told ---");
{
  const doomed = await mint({ tokenId: "temporary" });
  /* `tokenId` rides the QUERY and not the body, because `who` does — the store
     reads both off the URL the control plane stamped, so a caller cannot name
     either. */
  const byMachine = drive(await POST("op=aicredentialrevoke&token=adm-pl11&tokenId=temporary"));
  t("a machine credential cannot withdraw one either — the row carries revoked_by, and a machine "
  + "name there would record a decision nobody made", codeOf(byMachine), "AI_CREDENTIAL_REVOKE_NOT_A_MEMBER");
  t("with its C-number", byMachine.check, "C-29.4");
  const missing = drive(await POST(`op=aicredentialrevoke&token=${RUTH}&tokenId=no-such-agent`));
  t("withdrawing something that does not exist SAYS SO — believing an authority is gone when it is "
  + "not is the worse outcome", codeOf(missing), "AI_CREDENTIAL_UNKNOWN");
  t("with its C-number", missing.check, "C-29.5");

  t("the credential works before", codeOf(await POST(`op=capturerequest&token=${doomed.token}`,
    { target: INQ, run: "no-such-run" })) !== "AI_CREDENTIAL_REVOKED", true);
  const rev = await POST(`op=aicredentialrevoke&token=${RUTH}&tokenId=temporary`);
  t("a member withdraws it", [rev?.ok, rev?.credential?.revoked, rev?.credential?.revokedBy],
    [true, true, "ruth"]);
  const after = drive(await POST(`op=capturerequest&token=${doomed.token}`, { target: INQ, run: "x" }));
  t("and it now reaches nothing, refused BY NAME", codeOf(after), "AI_CREDENTIAL_REVOKED");
  t("with its C-number and translation", [after.check, after.translation.length > 40], ["C-29.7", true]);
  t("the entry and the date are KEPT rather than deleted, so what it did while live stays readable",
    (await GET(`op=aicredentials&token=${RUTH}`)).credentials
      .filter((c) => c.tokenId === "temporary").map((c) => [c.revoked, typeof c.revokedAt]),
    [[true, "string"]]);
}

/* ====================================================================== 8
 * DEC-55.5, FIRST HALF — OWED CONTROL 1. EVERY `MACHINE_CANNOT_*` FIRES BY
 * NAME ON `token:ai`, AND THE SWEEP SAYS WHAT IT DID NOT REACH.
 * ====================================================================== */
console.log("\n--- 8. DEC-55.5 (owed control 1), first half: every MACHINE_CANNOT_* fires on token:ai ---");
{
  /* THE TRAP THE DESIGN ALREADY RECORDED: a credential refused at the CREDENTIAL
     layer absorbs a control aimed at a lower one. So this block does NOT use the
     investigative credential — it uses one a MEMBER AUTHORED with a broad scope,
     which is legitimate (every op named is one a member reaches) and which
     passes the gate. What is being measured here is the IDENTITY layer, with the
     credential layer deliberately held open. PL-2 ran the three-layer version of
     this one item over; this is the two-layer version of the same discipline. */
  const ACTS = {
    MACHINE_CANNOT_RELEASE:      ["release", { handle: "believe-in-oakland", acknowledgment: "x", mitigation: "y" }],
    MACHINE_CANNOT_CONCLUDE:     ["conclude", { id: INQ, disposition: "supported", statement: "s" }],
    MACHINE_CANNOT_REOPEN:       ["reopen", { id: INQ, reason: "r" }],
    MACHINE_CANNOT_PUBLISH:      ["publish", { target: INQ, scope: "s", statement: "st" }],
    MACHINE_CANNOT_MOVE_ACTION:  ["actionmove", { id: INQ, to_state: "sent" }],
    MACHINE_CANNOT_CORRESPOND:   ["actioncorrespond", { id: INQ, direction: "outbound", summary: "s" }],
    MACHINE_CANNOT_DIVIDE:       ["inquirydivide", { id: INQ, into: [] }],
    MACHINE_CANNOT_GROUND:       ["inquiryground", { target: INQ, groups: [] }],
    MACHINE_CANNOT_DECLARE:      ["strengthbar", { group: "believe-in-oakland", capture: "B" }],
    MACHINE_CANNOT_MOVE_VERSION: ["versionaccept", { target: INQ, version: "v1" }],
    MACHINE_CANNOT_FORWARD:      ["taskforward", { id: "TASK-2026-0001-x", to: "anna" }],
    MACHINE_CANNOT_RESOLVE:      ["taskresolve", { id: "TASK-2026-0001-x" }],
  };
  const broad = await mint({ tokenId: "held-open", taskScope: "the negative control's own",
    writes: [...new Set(Object.values(ACTS).map(([op]) => op))] });
  t("a member may author this scope — every op in it is one a member reaches, so the CREDENTIAL "
  + "layer is deliberately held open and what is measured below is the IDENTITY layer", broad?.ok, true);

  const fired = {}, absorbed = [];
  for (const [want, [op, body]] of Object.entries(ACTS)) {
    const r = await POST(`op=${op}&token=${broad.token}`, body);
    fired[want] = codeOf(r);
    if (codeOf(r) === "AI_BEYOND_TASK_SCOPE" || codeOf(r) === "AI_CREDENTIAL_REVOKED") absorbed.push(op);
  }
  t("NO refusal was absorbed by the credential layer — every one of these calls reached the store",
    absorbed, []);
  t("and every MACHINE_CANNOT_* fires BY NAME on `token:ai`, through REC-46's ONE predicate, with "
  + "nothing in this item having touched any of those sites",
    Object.entries(fired).filter(([want, got]) => want !== got), []);

  /* THE SWEEP-COMPLETENESS ARM. A walk that graded 55 of 156 ops once read as a
     complete sweep in this repository. So the set above is compared against the
     refusals the plane ACTUALLY MINTS, harvested from source — a family that
     grows without an arm here fails immediately rather than being silently
     ungraded. */
  const minted = [...new Set([...STORE_BARE.matchAll(/"(MACHINE_CANNOT_[A-Z_]+)"/g)].map((m) => m[1]))].sort();
  t("(the harvest found a real family, not an empty one)", minted.length >= 12, true);
  t("EVERY MACHINE_CANNOT_* the plane can mint was driven under an `ai` credential — this is a "
  + "complete sweep and it says so because it was checked, not because it looks like one",
    minted.filter((c) => !(c in ACTS)), []);
  t("and nothing was graded that the plane does not mint", Object.keys(ACTS).filter((c) => !minted.includes(c)), []);

  /* D-199 (5)'s CLAIM, STATED AS A PROPERTY OF THE PREDICATE. The control's
     second half breaks exactly this and every arm above must go green. */
  t("`token:ai` is caught by the ONE predicate and by nothing else — not by the bare-class arm and "
  + "not by the author word list, which is why removing the stamp arm disarms all twelve at once",
    [isMachineStamp("token:ai"), isMachineIdentity("token:ai"), isMachineIdentity("ai")],
    [true, true, true]);
}

/* ====================================================================== 9
 * OVER-STRICTNESS: THE CREDENTIAL DOES ITS WORK.
 * ====================================================================== */
console.log("\n--- 9. over-strictness: a fence that refuses correct work is a defect in the fence ---");
{
  const run = await POST(`op=airunopen&token=${AK}`, {
    run: "RUN-2026-0808-pl11", contextType: "inquiry", contextId: INQ,
    label: "the investigative session", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1",
    bounds: [{ bound: "fetches", allowed: 50, unit: "requests" }], leaseMs: 900000 });
  t("the investigative credential does NOT open its own run — op=airunopen mutates and is not in "
  + "its declared writes, so the member starts the session and the agent works inside it",
    codeOf(run), "AI_BEYOND_TASK_SCOPE");

  /* So the run is opened by the MEMBER, which is the design: the member starts
     the session and the agent works inside it. */
  const opened = await POST(`op=airunopen&token=${RUTH}`, {
    run: "RUN-2026-0808-pl11", contextType: "inquiry", contextId: INQ,
    label: "the investigative session", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1",
    bounds: [{ bound: "fetches", allowed: 50, unit: "requests" }], leaseMs: 900000 });
  t("the member opens it instead", opened?.started, true);

  const sug = await POST(`op=suggest&token=${AK}`, {
    target: INQ, run: "RUN-2026-0808-pl11", kind: "level-empty",
    name: "nothing on the open internet", relationship: "and",
    description: "We searched the open internet for a superseding award notice and found none in this window.",
    level: "internet", observed_at: "observation:pl11-internet-1" });
  t("PL-3's endpoint is REACHED and a real `suggested` version lands under `token:ai`",
    [sug?.ok, sug?.state], [true, "suggested"]);
  t("and it is attributed to the machine, honestly named, never borrowing a person's",
    sug?.author, "token:ai");

  const req = await POST(`op=capturerequest&token=${AK}`, {
    target: INQ, run: "RUN-2026-0808-pl11", purpose: "investigate",
    address: "https://www.oaklandca.gov/files/assets/fy25-27-budget.pdf" });
  t("PL-4's door is REACHED and a request row lands", req?.ok, true);
  /* MEASURED, NOT PREDICTED, AND IT IS A FINDING THIS ITEM'S BRIEF DID NOT
     ANTICIPATE. PL-4 copies the plane principal OFF THE RUN, and under the
     investigative task scope the AI cannot open a run — op=airunopen is
     mutating and is not in its declared writes — so the run is the MEMBER'S and
     the capture's attribution names the member, NOT the credential identity.
     That is correct as far as it goes (a named person did authorise the
     session) and it is INCOMPLETE against D-199 (4): the act the agent actually
     performed is attributed to its principal without saying which of that
     principal's credentials performed it. Asserted as it IS rather than as the
     brief expected, and delegated. */
  t("the request's plane principal is the RUN's, which under the investigative scope is the "
  + "MEMBER who opened it — the credential identity does not reach it (finding, delegated)",
    req?.principals?.plane, "member:ruth");

  /* AND THE COMPOSITE STAMP IS DRIVEN WHERE IT DOES APPLY, so the mechanism is
     proved rather than assumed absent: a credential whose RECORD declares
     op=airunopen opens its own run, and that run names the principal AND the
     identity — which is what carries into every capture requested under it. */
  const opener = await mint({ tokenId: "session-opener", taskScope: "runs and requests",
    writes: ["airunopen", "capturerequest"] });
  const ownRun = await POST(`op=airunopen&token=${opener.token}`, {
    run: "RUN-2026-0808-pl11-own", contextType: "inquiry", contextId: INQ,
    label: "a run the agent opened itself", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    bounds: [], leaseMs: 900000 });
  t("an agent whose record declares op=airunopen opens its own run", ownRun?.started, true);
  const ownReq = await POST(`op=capturerequest&token=${opener.token}`, {
    target: INQ, run: "RUN-2026-0808-pl11-own", purpose: "investigate",
    address: "https://www.oaklandca.gov/files/assets/audit-2026.pdf" });
  t("and THEN the capture's attribution names the principal AND the token identity — never the "
  + "value (D-199 (4))", ownReq?.principals?.plane, "member:ruth/session-opener");

  const reads = await GET(`op=basisversions&token=${AK}&id=${INQ}`);
  t("reads across the project are the floor and need no declaration at all",
    Array.isArray(reads?.versions), true);
  t("and the suggestion the agent just wrote is IN that read — the write it holds is real",
    (reads?.versions || []).some((v) => v.state === "suggested"), true);
}

/* ===================================================================== 10
 * DEC-49: THE DRIVEN SET EQUALS THE REGISTRY — FLOOR AS WELL AS CEILING.
 * ===================================================================== */
console.log("\n--- 10. DEC-49: every allocated code driven, and nothing driven that is not allocated ---");
{
  const registry = Object.keys(AI_CREDENTIAL_CHECKS).sort();
  t("every code this family allocates was DRIVEN out of the plane — an undrivable code is a refusal "
  + "nobody can prove fires (PL-4's rule)", registry.filter((c) => !DRIVEN.has(c)), []);
  t("and nothing was driven that the family does not allocate", [...DRIVEN].filter((c) => !registry.includes(c)), []);
  t("every driven code carried the C-NUMBER its row declares, taken off the wire rather than out of "
  + "the registry it came from",
    [...DRIVEN].sort().filter((c) => WIRE.get(c) !== AI_CREDENTIAL_CHECKS[c].check), []);
  const wheres = [...new Set(registry.map((c) => AI_CREDENTIAL_CHECKS[c].where))].sort();
  t("every `where` names a REGION and never a whole function (REC-71)",
    wheres.filter((w) => !/ > /.test(w)), []);
  t("and the regions it names are the ones the sources actually declare",
    wheres.map((w) => w.split(" > ")[1]).sort().filter((r, i, a) => a.indexOf(r) === i)
      .filter((r) => !(INDEX_SRC + STORE_SRC).includes(`DEC-49 REGION ${r}`)), []);
}

} finally {
  await mf.dispose();
}

console.log(`\n${fail === 0 ? "OK" : "FAILED"}  ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
