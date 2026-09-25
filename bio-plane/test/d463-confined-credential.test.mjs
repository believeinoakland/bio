/* NEGATIVE CONTROL: RUN 2026-09-24 by the D-463 worker, `node test/nc-d463.mjs` — EIGHT arms, each ALONE against a
   uniquely-named pristine copy of `src/index.mjs`, restore verified by sha256 AND by byte comparison (819,476 bytes,
   sha256 c5fae8c6b03d), every arm AS DECLARED. (A) THE BRIEF'S ARM, the confinement removed entirely -> FAIL 36/49 at
   the ACCEPTS-WHEN and the bio witness BY NAME; (B) A PARTIAL FIX, a named `store=bio` still refused but the ABSENT
   case no longer set to scratch -> FAIL 41/49 at the ACCEPTS-WHEN and the witness, with section 5's refusal STILL
   GREEN — the arm that separates the two halves of the confinement, which a suite driving only the refusal could not
   see; (C) OVER-STRICTNESS, the gate refuses any named store, `scratch` included -> FAIL 48/49 at `op=whoami ·
   store=scratch · confined credential -> answered from scratch`; (D) OVER-STRICTNESS, every `ai` credential confined
   whether its row says so or not -> FAIL 45/49 at section 4's unconfined credential landing in bio; (E) the mint's
   declaration accepts whatever it is handed -> FAIL 40/49 at section 2's `bio` refusal; (F) OVER-STRICTNESS, the
   declaration refuses `scratch` too -> FAIL 36/49 at section 2's successful mint; (G) the gate moved AFTER D-461's pin
   -> FAIL 47/49 at section 7 (a confined credential files a knock in the REAL record's inbox) and at section 8's
   structural pin, so the ORDER is load-bearing and not incidental; (0) BASELINE, nothing patched -> GREEN 49/49.
   The driver is deliberately NOT a `.test.mjs`: it EDITS REAL SOURCES while it runs and the battery must not discover
   it (PL-3's and PL-4's precedent).
   D-620 ARMS, RUN 2026-09-25 by WORKER D-620 by hand (not in nc-d463.mjs), each ALONE, restores sha256 AND cmp MATCH
   (src/index.mjs 887,726 B sha256 18ff08d6383a; this file 26,795 B sha256 8e2d51effc8f). BASELINE -> 49 passed, 0
   failed. (H) THE DROPPED KEY: op=whoami's `confinedTo` for a non-`ai` credential written `undefined` instead of
   `null`, so the key is ABSENT on the wire -> FAIL 47/49 by name: "op=whoami from the ADMIN binding says confinedTo
   null and store bio" and "the PROBE binding still reads scratch by its CLASS, with confinedTo null". DECLARED three;
   the unconfined credential's arm stayed GREEN because it is an `ai` credential, whose null comes from
   `aiCred.confinedTo ?? null`, which the arm did not touch — a finding about the ARM, not the comparator. (H0) THE
   SAME DROPPED KEY read by the suite's pre-D-620 comparator (`JSON.stringify` equality) -> 49 passed, 0 failed: the
   defect D-620 closes, an absent key passing as a stated null. */
/* D-463 · A CREDENTIAL MINTED CONFINED TO `scratch` ADDRESSES `scratch` ON EVERY CALL, AND A `store=` NAMING
 * ANYTHING ELSE IS REFUSED BY NAME (C-78.3 / C-29.10).
 *
 * THE DEFECT, AND IT WAS WRITTEN IN THE RULES BEFORE IT WAS BUILT. `CLAUDE.md` §5 ends its live-verify rule with
 * *"RESIDUE: no credential binds to scratch for life; a sticky confinement is RECORD's and is NOT built"*, and
 * `BIO_Distribution_v0_1.md` §6 rung 6 carried the same sentence as a stated LIMITATION. So the whole no-write
 * guarantee of a live verification was the DISCIPLINE of naming `store=scratch` on every call plus the WITNESS
 * afterwards — and BOB #22 (2026-09-21) named the one condition on which a sticky confinement would be raised:
 * *"raised only if a live verification is measured writing the real record despite the naming and the witness."*
 * IT WAS MEASURED TWICE: D-456 (`store=biosmoke-pdf`, a namespace that never existed, answered from `bio`) and
 * D-461 (`op=knock&store=scratch` filed a knock in the REAL record's inbox). Both were found by workers whose
 * every call was disciplined. A property re-asserted per call is one an instrument omits once.
 *
 * WHAT THIS SUITE ASSERTS, and how a weaker one would pass:
 *   1. the two ROWS, C-78.3 and C-29.10, judged by code, C-number and the row's own sentence (IMPORTED, never typed);
 *   2. THE MINT: a confined credential is authored on the record and READS BACK confined, through the op and through
 *      the roster; a confinement that is not `scratch` — `bio` included, which is the decision — is refused by name
 *      and NOTHING is created;
 *   3. THE ACCEPTS-WHEN, first and alone: the confined credential WRITES WITHOUT `store=`, the write lands in
 *      `scratch`, and `bio`'s counters do not move;
 *   4. THE WITNESS IS SENSITIVE — the SAME write from an UNCONFINED credential DOES move `bio`, so an unmoved
 *      counter in (3) is evidence rather than a counter that could not have moved;
 *   5. `store=bio` and every other named namespace from the confined credential: 403 NAMESPACE_CONFINED, nothing moved;
 *   6. OVER-STRICTNESS: `store=scratch` NAMED by the confined credential works; the unconfined credential is
 *      untouched in both directions; the four BINDING classes are untouched (admin reaches `bio`, probe keeps its
 *      CLASS confinement and its own refusal); and the confined credential's READS answer from scratch;
 *   7. the deliberate consequence: a confined credential meeting one of D-461's bio-pinned public ops is told
 *      NAMESPACE_PINNED and writes nothing — `op=knock`, the write D-461 measured;
 *   8. STRUCTURE: the gate runs before the unauthenticated block, before `classify` and before `scopeFor`'s call
 *      site (a gate that can be reached around is a mechanism believed on the strength of its existence), and
 *      `scopeFor` holds NO confinement of its own — one decider, not two that can age apart.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { NAMESPACE_CHECKS, AI_CREDENTIAL_CHECKS } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL(`../src/${f}`, import.meta.url));
const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");

let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d463", MEMBER_TOKEN: "mem-d463", PROBE_TOKEN: "prb-d463",
              DAEMON_TOKEN: "dmn-d463", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-d463",
              GOVERNOR_APPETITE_PER_MIN: "600000",
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  outboundService() { return new Response("no outbound in this suite", { status: 599 }); },
});
MF = mf;

const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const RAW = async (q, body) => await (await mf.dispatchFetch(`http://x/api/?${q}`,
  body === undefined ? { method: "GET" } : { method: "POST", body: JSON.stringify(body) })).json();
const GET = async (q) => rP(await RAW(q));
const POST = async (q, body) => rP(await RAW(q, body ?? {}));
const STATUS = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? { method: "GET" } : { method: "POST", body: JSON.stringify(body) });
  let j = null; try { j = await res.json(); } catch { j = null; }
  return { status: res.status, body: j };
};

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};

try {

/* ------------------------------------------------------------------- 1 · the rows */
const CONFINED_ROW = NAMESPACE_CHECKS.NAMESPACE_CONFINED;
const MINT_ROW = AI_CREDENTIAL_CHECKS.AI_CONFINEMENT_NOT_SCRATCH;
console.log(`\n--- 1 · the two rows: NAMESPACE_CHECKS ${Object.keys(NAMESPACE_CHECKS).length} row(s), `
          + `AI_CREDENTIAL_CHECKS ${Object.keys(AI_CREDENTIAL_CHECKS).length} row(s) ---`);
t("NAMESPACE_CONFINED is C-78.3, names a REGION in its `where`, and carries a sentence of at least eight words",
  [!!CONFINED_ROW, CONFINED_ROW?.check, / > /.test(CONFINED_ROW?.where ?? ""),
   (CONFINED_ROW?.translation ?? "").trim().split(/\s+/).length >= 8],
  [true, "C-78.3", true, true]);
t("AI_CONFINEMENT_NOT_SCRATCH is C-29.10, likewise",
  [!!MINT_ROW, MINT_ROW?.check, / > /.test(MINT_ROW?.where ?? ""),
   (MINT_ROW?.translation ?? "").trim().split(/\s+/).length >= 8],
  [true, "C-29.10", true, true]);
{
  const src = readFileSync(SRC("index.mjs"), "utf8");
  t("both regions the two `where`s name are declared in the source",
    [CONFINED_ROW, MINT_ROW].map((r) => r.where.split(" > ")[1])
      .filter((r) => !src.includes(`DEC-49 REGION ${r}`)), []);
}

/* ------------------------------------------------------------------- fixture */
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
/* The mint is a MEMBER act (D-199 (3)), so the fixture needs a member session; and `ai_credentials` lives in the
   `bio` store alone, so the credential is minted there whatever it is later confined to — which is the shape of the
   thing being tested, not a convenience. The same two members are enrolled in SCRATCH, so that a write landing there
   meets the same group rules and an arm cannot pass because scratch refused it for an unrelated reason. */
const enrol = async (memberId, role, capabilities, store) => {
  const q = store ? `&store=${store}` : "";
  const add = await POST(`op=memberadd&token=adm-d463${q}`,
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST(`op=enroll${q}`, { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId} in ${store ?? "bio"}: ${JSON.stringify(en).slice(0, 400)}`);
  /* `op=login` is PINNED to `bio` by D-461 — an instance has ONE identity and there is nothing to sign in to in a
     scratch namespace — so a scratch member is enrolled and never logged in. That is the plane's rule and not a
     shortcut: what scratch needs for the write arm below is a MEMBER ROSTER, which enrolment gives it. */
  if (store) return null;
  const lg = await POST(`op=login${q}`, { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId} in ${store ?? "bio"}: ${JSON.stringify(lg).slice(0, 400)}`);
  return lg.token;
};
/* 4.2/4.3: the second member of a group must be an administrator, and there are no ordinary members until two exist. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
await enrol("gus", "admin", ["contribute"]);
await enrol("ruth", "admin", ["contribute", "publish", "create_projects"], "scratch");
await enrol("gus", "admin", ["contribute"], "scratch");
t("fixture: a member session exists in bio, and the same two members exist in scratch", typeof RUTH, "string");

/* ------------------------------------------------------------------- 2 · the mint */
console.log("\n--- 2 · a credential is MINTED confined, and a confinement that is not scratch is refused by name ---");
let mintSeq = 0;
const mint = async (over = {}) => POST(`op=aicredentialmint&token=${RUTH}`, {
  tokenId: over.tokenId ?? `agent-d463-${++mintSeq}`,
  principalKind: "member", principalMember: "ruth",
  taskScope: "investigative", writes: ["entitycreate", "allocid"],
  note: "D-463: an agent that may name a subject and take an id, and nothing else", ...over });

const CONFINED = await mint({ tokenId: "confined-to-scratch", confinedTo: "scratch" });
t("a member mints a credential CONFINED to scratch, and the record says so — the value is shown once and the "
+ "record holds the confinement, never the value",
  [CONFINED?.ok, CONFINED?.credential?.confinedTo, typeof CONFINED?.token === "string",
   CONFINED?.credential?.tokenId],
  [true, "scratch", true, "confined-to-scratch"]);
const FREE = await mint({ tokenId: "not-confined" });
t("a mint that says nothing about confinement is UNCONFINED, stated as a value and not as an absent key",
  [FREE?.ok, "confinedTo" in (FREE?.credential ?? {}), FREE?.credential?.confinedTo], [true, true, null]);
{
  const roster = await GET(`op=aicredentials&token=${RUTH}`);
  const byId = Object.fromEntries((roster?.credentials ?? []).map((c) => [c.tokenId, c.confinedTo]));
  t("the roster a member reads carries each credential's confinement — the property is READABLE, or nobody can "
  + "know what an agent may reach", [byId["confined-to-scratch"], byId["not-confined"]], ["scratch", null]);
  const before = (roster?.credentials ?? []).length;
  for (const asked of ["bio", "biosmoke-pdf", "Scratch", "SCRATCH", " ", "scratch\n", "scratch ", ""]) {
    const r = await STATUS(`op=aicredentialmint&token=${RUTH}`,
      { tokenId: `confined-wrongly-${asked.trim() || "blank"}`, principalKind: "member", principalMember: "ruth",
        taskScope: "investigative", writes: [], confinedTo: asked });
    const b = rP(r.body) ?? r.body ?? {};
    t(`a mint confined to ${JSON.stringify(asked)} is refused 403 AI_CONFINEMENT_NOT_SCRATCH with the row's sentence`,
      [r.status, b.reason, b.check, b.translation === MINT_ROW.translation],
      [403, "AI_CONFINEMENT_NOT_SCRATCH", "C-29.10", true]);
  }
  const after = await GET(`op=aicredentials&token=${RUTH}`);
  t("and NOTHING was created by any of them — a refused declaration must not enter the record at all",
    (after?.credentials ?? []).length, before);
  /* MEASURED RATHER THAN DECLARED, AND THE ARM WAS WRONG FIRST — recorded rather than smoothed, because a
     surprising green is a finding about the arm. This suite's first draft declared a whitespace-only confinement a
     refusal and the plane answered 200: `aiConfinementDeclaration` TRIMMED, so a lone space read as silence. The
     PLANE was changed and not the arm, on D-456's own stated rule — a namespace name is matched exactly, and folding
     it is the code guessing what the caller meant. ABSENT is now the only silence, and it is the case every caller
     written before this item is in. */
  t("a credential minted with NO confinement field at all is unconfined — the case every caller written before this "
  + "item is in", (await mint({ tokenId: "field-absent" }))?.credential?.confinedTo, null);
  t("and an explicit null is the same silence",
    (await mint({ tokenId: "explicit-null", confinedTo: null }))?.credential?.confinedTo, null);
}

/* ------------------------------------------------------------------- the witness */
/* THE RECORD'S COUNTERS IN BOTH NAMESPACES, read before and after every arm (CLAUDE.md §5). `op=stats` is taken
   WHOLE and compared as a string, so a counter this item never thought about is in the witness too; `entities` is
   pulled out beside it because it is the one the write below moves and a difference of one has to be readable as
   one. The witness is shown SENSITIVE in section 4 — an unmoved counter that could not have moved is no evidence. */
const counters = async (store) => {
  const s = await GET(`op=stats&token=adm-d463&store=${store}`);
  return { stats: JSON.stringify(s), entities: s?.entities ?? `unreadable:${JSON.stringify(s)}` };
};
const bioBefore = await counters("bio"), scrBefore = await counters("scratch");
t("witness: stats is readable in both namespaces and its entity counter is a number (a witness that cannot read is "
+ "no witness)", [typeof bioBefore.stats, typeof bioBefore.entities, typeof scrBefore.entities],
  ["string", "number", "number"]);

/* THE WRITE. `op=entitycreate` is the arm because it is a REAL corpus write a member could make, it is in the
   credential's declared scope, and it needs no run and no prior object — so a red arm here is about the namespace and
   never about a fixture the two namespaces could differ on. */
const named = async (tok, label, q = "") => {
  const res = await mf.dispatchFetch(`http://x/api/?op=entitycreate&token=${tok}${q}`,
    { method: "POST", body: JSON.stringify({ label, kind: "institution", note: "D-463" }) });
  let body = null; try { body = await res.json(); } catch { body = null; }
  /* THE INNER `ok`, NEVER THE ENVELOPE'S — and this suite paid for the distinction while it was being written: its
     first write arm read the envelope's `ok:true` over an inner `{ok:false, reason:"SURFACE_NO_RUN"}` and reported a
     write that never happened. The envelope's `ok` says the op ANSWERED (D-506's rule, one document over). */
  return { status: res.status, store: body?.store, ok: rP(body)?.ok === true, inner: rP(body), reason: rP(body)?.reason ?? body?.reason };
};

/* ------------------------------------------------------------------- 3 · the accepts-when */
console.log("\n--- 3 · THE ACCEPTS-WHEN: the confined credential writes with NO store= and the write lands in scratch ---");
{
  const w = await named(CONFINED.token, "D-463 Confined Subject");
  t("the write ANSWERS, the INNER ok is true, and the envelope says which namespace answered — scratch, with no "
  + "store= anywhere in the request", [w.status, w.ok, w.store], [200, true, "scratch"]);
  t("the subject is READABLE in scratch and is NOT in bio — read back through the op from each namespace",
    [(await GET(`op=entitybyalias&token=adm-d463&store=scratch&alias=${encodeURIComponent("D-463 Confined Subject")}`))?.count,
     (await GET(`op=entitybyalias&token=adm-d463&store=bio&alias=${encodeURIComponent("D-463 Confined Subject")}`))?.count],
    [1, 0]);
  const bioNow = await counters("bio"), scrNow = await counters("scratch");
  t("WITNESS: bio's counters did not move at all across the confined write", bioNow.stats, bioBefore.stats);
  t("and scratch's entity counter moved by exactly one — the write went somewhere",
    scrNow.entities - scrBefore.entities, 1);
}

/* ------------------------------------------------------------------- 4 · the witness is sensitive */
console.log("\n--- 4 · the SAME write from an UNCONFINED credential moves bio, so section 3's unmoved witness is evidence ---");
{
  const before = await counters("bio");
  const w = await named(FREE.token, "D-463 Unconfined Subject");
  t("an UNCONFINED credential with no store= lands in bio, exactly as it did before this item",
    [w.status, w.ok, w.store], [200, true, "bio"]);
  t("and bio's entity counter moved by exactly one — so the unmoved witness in section 3 COULD have moved",
    (await counters("bio")).entities - before.entities, 1);
}

/* ------------------------------------------------------------------- 5 · a named store is refused by name */
console.log("\n--- 5 · store= naming anything but scratch, from the confined credential: refused BY NAME ---");
{
  const bioNow = await counters("bio"), scrNow = await counters("scratch");
  const r = await STATUS(`op=whoami&token=${CONFINED.token}&store=bio`);
  t("op=whoami · store=bio · confined credential -> 403 NAMESPACE_CONFINED (C-78.3) with the row's own sentence, "
  + "naming the credential and what it asked for",
    [r.status, r.body?.ok, r.body?.reason, r.body?.check, r.body?.translation === CONFINED_ROW.translation,
     r.body?.tokenId, r.body?.asked, r.body?.confinedTo],
    [403, false, "NAMESPACE_CONFINED", "C-78.3", true, "confined-to-scratch", "bio", "scratch"]);
  const ok = await STATUS(`op=whoami&token=${CONFINED.token}&store=scratch`);
  t("op=whoami · store=scratch · confined credential -> answered from scratch: naming its OWN namespace is not a "
  + "refusal", [ok.status, ok.body?.ok, ok.body?.store], [200, true, "scratch"]);
  const w = await named(CONFINED.token, "D-463 Subject That Must Not Exist", "&store=bio");
  t("the WRITE naming bio — the act the confinement exists to stop — is refused 403 NAMESPACE_CONFINED, and it is "
  + "the CREDENTIAL's refusal and not the op's", [w.status, w.reason], [403, "NAMESPACE_CONFINED"]);
  t("WITNESS: neither namespace moved across the refused calls",
    [(await counters("bio")).stats, (await counters("scratch")).stats], [bioNow.stats, scrNow.stats]);
  t("and the subject it tried to write exists in NEITHER namespace",
    [(await GET(`op=entitybyalias&token=adm-d463&store=bio&alias=${encodeURIComponent("D-463 Subject That Must Not Exist")}`))?.count,
     (await GET(`op=entitybyalias&token=adm-d463&store=scratch&alias=${encodeURIComponent("D-463 Subject That Must Not Exist")}`))?.count],
    [0, 0]);
  /* D-456's gate still runs FIRST: a namespace that does not exist is NAMESPACE_UNKNOWN and never this item's code,
     from a confined credential too — the two rows answer different facts and the ORDER decides which is true. */
  const unknown = await STATUS(`op=whoami&token=${CONFINED.token}&store=biosmoke-pdf`);
  t("a namespace that does not exist is still D-456's refusal, from a confined credential as from anybody",
    [unknown.status, unknown.body?.reason], [400, "NAMESPACE_UNKNOWN"]);
  /* AND THE ID DOOR, because a second op in the declared scope is a second chance to reach the record. */
  const alloc = await STATUS(`op=allocid&token=${CONFINED.token}`, { objectType: "inquiry" });
  t("op=allocid from the confined credential also answers from scratch — the confinement is the CREDENTIAL's and "
  + "not one op's", [alloc.status, alloc.body?.store], [200, "scratch"]);
}

/* ------------------------------------------------------------------- 6 · over-strictness */
console.log("\n--- 6 · what is NOT confined: the unconfined credential, the four binding classes, and reads ---");
{
  const who = await STATUS(`op=whoami&token=${CONFINED.token}`);
  t("op=whoami from the confined credential says confinedTo scratch AND store scratch — two different facts, "
  + "both answered", [who.body?.result?.confinedTo, who.body?.store], ["scratch", "scratch"]);
  const whoFree = await STATUS(`op=whoami&token=${FREE.token}`);
  t("op=whoami from the unconfined credential says confinedTo null and store bio",
    [whoFree.body?.result?.confinedTo, whoFree.body?.store], [null, "bio"]);
  const whoAdmin = await STATUS("op=whoami&token=adm-d463");
  t("op=whoami from the ADMIN binding says confinedTo null and store bio — a binding class carries no row and so "
  + "cannot be confined", [whoAdmin.body?.result?.confinedTo, whoAdmin.body?.store], [null, "bio"]);
  const whoProbe = await STATUS("op=whoami&token=prb-d463");
  t("the PROBE binding still reads scratch by its CLASS, with confinedTo null: `scopeFor`'s confinement is "
  + "untouched and is a different mechanism", [whoProbe.body?.result?.confinedTo, whoProbe.body?.store],
    [null, "scratch"]);
  const probeBio = await STATUS("op=whoami&token=prb-d463&store=bio");
  t("and the probe class's own refusal is still SCOPE_REFUSED and not this item's code",
    [probeBio.status, probeBio.body?.reason], [403, "SCOPE_REFUSED"]);
  const adminScr = await STATUS("op=whoami&token=adm-d463&store=scratch");
  t("an ADMIN naming scratch still reaches scratch — the per-call posture is unchanged for every binding class",
    [adminScr.status, adminScr.body?.store], [200, "scratch"]);
  const read = await STATUS(`op=entity&token=${CONFINED.token}&id=ENT-2026-0001`);
  t("a READ from the confined credential answers from scratch — reads are the credential's floor and the "
  + "confinement is about WHERE, never about what", [read.status, read.body?.store], [200, "scratch"]);
  /* THE ESCAPE THE CONFINEMENT MUST NOT LEAVE OPEN: a confined credential cannot mint an unconfined one. */
  const grab = await STATUS(`op=aicredentialmint&token=${CONFINED.token}`,
    { tokenId: "the-way-out", principalKind: "organisation", writes: [] });
  t("a confined credential cannot mint an UNCONFINED one — the mint is a member act, so the way out is shut by "
  + "the fence that was already there", [grab.status, rP(grab.body)?.reason ?? grab.body?.reason],
    [403, "AI_BEYOND_TASK_SCOPE"]);
  t("and no such credential exists",
    ((await GET(`op=aicredentials&token=${RUTH}`))?.credentials ?? []).some((c) => c.tokenId === "the-way-out"), false);
}

/* ------------------------------------------------------------------- 7 · the deliberate consequence */
console.log("\n--- 7 · a confined credential meeting a bio-PINNED public op is told which fence stopped it ---");
{
  const bioNow = await counters("bio");
  const k = await STATUS(`op=knock&token=${CONFINED.token}`,
    { contentText: "D-463: a knock a confined credential must not be able to file", note: "d463" });
  t("op=knock with NO store= from a confined credential -> 400 NAMESPACE_PINNED: the confinement set scratch and "
  + "D-461's pin refused it, which is the right outcome and the reason the gates run in this order",
    [k.status, k.body?.reason, k.body?.check], [400, "NAMESPACE_PINNED", "C-78.2"]);
  t("WITNESS: bio's counters did not move — the knock the confined credential could not file",
    JSON.stringify(await counters("bio")), JSON.stringify(bioNow));
  const kFree = await STATUS("op=knock", { contentText: "D-463: an ordinary knock still works", note: "d463" });
  t("and an ordinary knock with no credential still lands, so the pin was not widened",
    [kFree.status, kFree.body?.ok], [200, true]);
}

/* ------------------------------------------------------------------- 8 · structure */
console.log("\n--- 8 · one decider, and it cannot be reached around ---");
{
  const src = readFileSync(SRC("index.mjs"), "utf8");
  const g = src.indexOf("const confinedNamespace = confinedNamespaceGate(url, presentedAi.cred);");
  t("the confinement gate runs AFTER D-456's unknown-namespace gate and BEFORE D-461's pin, the unauthenticated "
  + "block, `classify` and `scopeFor`'s call site",
    [g > 0, g > src.indexOf("const unknownNamespace = namespaceGate(url);"),
     g < src.indexOf("const pinnedNamespace = pinnedNamespaceGate(url, op, spec);"),
     g < src.indexOf("if (spec.classes === null) {"),
     g < src.indexOf("let cls = await classify("),
     g < src.indexOf('if (scope.error) return json({ ok: false, reason: "SCOPE_REFUSED"')],
    [true, true, true, true, true, true]);
  const at = src.indexOf("function scopeFor(cls, url) {");
  const body = src.slice(at, src.indexOf("\n}", at));
  t("(the scopeFor span the walk read is a real body)", body.length > 200, true);
  t("`scopeFor` says NOTHING about a per-credential confinement — ONE decider, so the two answers cannot age "
  + "apart (REC-46's measured defect, PL-4's duplicated predicate)",
    /confinedTo|confinedNamespace/.test(body), false);
  const gate = src.slice(src.indexOf("function confinedNamespaceGate(url, cred) {"),
                         src.indexOf("function aiCredentialPresented(url, env) {"));
  t("the gate reads the credential's own field and names the code as a STRING LITERAL at its site",
    [/cred\.confinedTo !== SCRATCH/.test(gate), /reason: "NAMESPACE_CONFINED"/.test(gate)], [true, true]);
  t("and the lookup it reads is made ONCE per request: no second `aicredentiallook` in the admission block",
    (src.match(/aicredentiallook\?sha=/g) || []).length, 2);
}

} finally {
  await mf.dispose();
}

console.log(`\nd463-confined-credential: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
