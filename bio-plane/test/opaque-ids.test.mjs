/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/opaque-ids.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS COPIES OF THE SOURCES while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/opaque-ids.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once), the real sources are hashed before and after, and what each arm MUST fail is declared in the driver before it arms.
   RESULTS, RUN 2026-09-19 in worktree agent-a59a4cdfa1b3d4dd3 on base 0cb784ab + REC-151 merged with origin/main at 20b7412f (real src/index.mjs 663,895 B sha256 b23d4325df07…, src/store.mjs 2,666,041 B sha256 05544429b20c…, untouched: YES), every arm AS DECLARED on the first run and again after the REVIEW_NO_SECRET pin was added (figures below are the second run): (a) baseline 35/0 · (b) counter-restored-case — THE ROW'S CONTROL, a new case's id taken from allocId's CASE counter again -> 31/4, exactly CASE's two NO COUNT arms and the two structural pins that see the site (the counter pin and the CASE-calls-the-minter pin); DRAFT, RVG, TASK and PROJ stay green · (c) math-random — the liar, Math.random for the CSPRNG -> 33/2, ONLY the two source-by-name arms; every behavioural arm stays green, which is why they exist · (d) counter-derived — the liar, the counter's value through a fixed permutation -> 34/1, ONLY `nothing weaker or counted` (the minter steps #nextSeq); the behavioural arms stay green · (e) allocid-open, the refusal removed -> 29/6, the five refusal arms and the dash arm · (f) allocid-overstrict, a prefix gated by its first letters -> 34/1, the PROJECTX arm · (g) csprng-other-spelling, a 32-bit CSPRNG draw — correct work -> 35/0.
 * =========================================================================
 * REC-151 / IC-164 — A MINTED ID CARRIES NO COUNT, FOR EVERY GATED PREFIX. Membership Architecture v2 §7, the
 * bullet *"A MINTED ID CARRIES NO COUNT"* (BOB #16, 2026-09-19): `allocId`'s sequence is PER PREFIX PER YEAR, so
 * a counted suffix tells a creator how many objects of that kind were minted before theirs, hidden ones
 * included. An id of a GATED object — one a read withholds from some caller — is minted OPAQUE: a random
 * suffix from the store's CSPRNG, checked unique, never a counter; and `op=allocid` REFUSES those prefixes.
 *
 * THE GATED PREFIXES, each with the read that withholds its objects (the per-prefix table is in IC-164):
 *   PROJ  — a project is out of an uninvited member's sight (`viewerPredicate`, §7.9) · REC-141's mint
 *   CASE  — an unratified case answers as absent to a caller without standing (REC-130)
 *   DRAFT — a draft is read by the producing project's editors only (§6A)
 *   RVG   — a grant is read by its project's owner only (§6A.2)
 *   TASK  — a task whose subject is a bundle the viewer cannot see is withheld (REC-30's `#bundleGate`)
 * SHARED, counter kept: INFO, ENT, REL (the evidence corpus, which `viewerPredicate` never filters) and every
 * caller-chosen bundle prefix `op=allocid` still serves (INQ, ACTN, FOCUS, PROB, BIAS …).
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (a) a suffix from `Math.random`, or one DERIVED from the counter (a hash of it, a permutation, the counter
 *       plus a constant): it passes a "consecutive mints do not differ by one" arm and is still predictable.
 *       So §1 asserts the SOURCE BY NAME: the one minter draws from `crypto.getRandomValues`, carries no
 *       `Math.random`, reads no `seq`, calls neither `allocId` nor `#nextSeq`; and every gated site calls that
 *       minter and nothing else. A structural pin, because no behavioural probe can tell a good PRNG from a CSPRNG.
 *   (b) refuse `op=allocid` for the gated prefixes while the plane itself still mints them from the counter.
 *       §2 drives each mint through its own op and reads the ids: on a FRESH store the counter's answer is
 *       `<P>-<year>-0001, 0002, 0003`, so three mints that are exactly that are the counter.
 *   (c) refuse `op=allocid` for EVERYTHING. §3 requires an INFO allocation (a shared prefix) to still count,
 *       and a prefix that merely BEGINS with a gated one's letters (`PROJECTX`) to still allocate.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.OPAQUE_IDS_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const STORE_SRC = readFileSync(join(SRC_DIR, "store.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec151", MEM = "mem-rec151";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const YEAR = new Date().toISOString().slice(0, 4);
const suffixOf = (id) => Number(String(id ?? "").split("-")[2]);
/* THE TWO BEHAVIOURAL QUESTIONS, asked of three consecutive mints of one prefix on a fresh store. A random
   four-digit suffix fails (i) with odds 10^-12 and (ii) with odds 10^-8 — never by chance. */
const countArms = (P, ids) => {
  t(`${P}: three mints were made and read back (the probe measured three real ids)`,
    [ids.length, ids.every((id) => typeof id === "string" && id.startsWith(`${P}-${YEAR}-`) && Number.isFinite(suffixOf(id)))],
    [3, true]);
  t(`${P} NO COUNT: the three ids are NOT the counter's answer on a fresh store (${P}-${YEAR}-0001, 0002, 0003)`,
    ids.map(suffixOf).join(",") === "1,2,3", false);
  t(`${P} NO COUNT: two mints in a row do NOT differ by one, pair after pair`,
    ids.map(suffixOf).slice(1).every((v, i) => v - suffixOf(ids[i]) === 1), false);
};

try {

/* ======================================================== 1. THE SOURCE, BY NAME */
console.log("\n--- 1. the CSPRNG source, by name: one minter, and every gated site calls it ---");
{
  const at = STORE_SRC.indexOf("  #mintOpaqueId(");
  const body = at === -1 ? "" : STORE_SRC.slice(at, STORE_SRC.indexOf("\n  }\n", at));
  t("the one opaque minter exists (`Store#mintOpaqueId`) and was read (a pin over an empty body pins nothing)",
    [at !== -1, body.length > 200], [true, true]);
  t("it draws from the CSPRNG BY NAME (`crypto.getRandomValues`)", /crypto\.getRandomValues\(/.test(body), true);
  t("and from nothing weaker or counted: no `Math.random`, no `allocId`, no `#nextSeq`, no read of `seq`",
    [/Math\.random/.test(body), /allocId\(/.test(body), /#nextSeq\(/.test(body), /\bFROM seq\b/i.test(body)],
    [false, false, false, false]);
  const gated = ["PROJ", "CASE", "DRAFT", "RVG", "TASK"];
  t("the gated set is ONE list in the store, and it is these five",
    (/static GATED_ID_PREFIXES = Object\.freeze\(\[([^\]]*)\]\)/.exec(STORE_SRC)?.[1] || "").replace(/["\s]/g, "").split(","),
    gated);
  /* Every call of the counter in the store, by prefix. A gated prefix must appear NOWHERE — including through
     `#nextSeq`, the counter's own step, which REC-141's first mint called directly. */
  const counted = [...STORE_SRC.matchAll(/(?:allocId|#nextSeq)\(\s*"([A-Z]+)"/g)].map((m) => m[1]);
  t("the corpus the counter pin reads is non-empty (INFO, ENT and REL still count)", counted.length >= 3, true);
  t("NO gated prefix is minted from the counter anywhere in the store (allocId or #nextSeq)",
    counted.filter((p) => gated.includes(p)), []);
  for (const P of gated.filter((p) => p !== "PROJ"))
    t(`the ${P} mint calls the one minter`, new RegExp(`#mintOpaqueId\\(\\s*"${P}"`).test(STORE_SRC), true);
  t("and REC-141's PROJ mint calls it too (one minter, not a second copy of the draw)",
    /#mintOpaqueId\(\s*"PROJ"/.test(STORE_SRC), true);
}

/* ======================================================== fixture */
const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en?.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)} after memberadd ${JSON.stringify(add)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg?.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await enrol("nadia", "nadia-passphrase-151", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "omar-passphrase-151", "admin", ["contribute", "publish"]);   /* ADMINS_FIRST: two administrators before any member */
const IRIS = await enrol("iris", "iris-passphrase-151", "member", ["contribute", "publish"]);
const PROJ = await makePublishingProject({ post: POST, mf, sha, machineToken: ADM, owner: "iris",
  name: "Opaque Ids", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });

let snapSeq = 0;
const promote = async (id, text, objectType, state) => rP(await POST(`op=promote&token=${ADM}`, {
  bundleId: id, base: null,
  snapKey: `20260919T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: objectType, group: "believe-in-oakland", title: `t ${id}`,
          current_state: state, created: "2026-07-01T00:00:00Z", last_updated: "2026-07-02T00:00:00Z" },
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: [],
}));
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
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
const inquiryMd = (id, question, info) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:", `  - target: ${info}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${info}`, "    role: supports", "    grade: D",
  "    grade_axis: connection", "    grade_source: testimony",
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const INFO = "INFO-2026-1510-memo";
const LEADS = ["INQ-2026-1511-first", "INQ-2026-1512-second", "INQ-2026-1513-third"];
if ((await promote(INFO, infoMd(INFO), "information", "collected"))?.ok === false) throw new Error("promote info");
for (const [i, id] of LEADS.entries()) {
  const r = await promote(id, withAdoptableReading(inquiryMd(id, `Question ${i + 1}?`, INFO)), "inquiry", "open");
  if (r?.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  const c = rP(await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(id)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${id} is on the memo.`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${id}.`)}` + adoptedVersionParam()));
  if (!c?.ok) throw new Error(`conclude ${id}: ${JSON.stringify(c)}`);
}
const args = (n, target) => {
  const b = { project: PROJ, scope: `Whether the transfer was authorised, case ${n}.`,
    statement: `This case covers the FY2024 transfer only, case ${n}.`,
    excluded: [{ target: null, description: `the FY2023 memo, case ${n}`, reason: "a records request is outstanding" }],
    subjectPosition: "sought_and_answered",
    subjectJustification: `We put the claims to the City Administrator for case ${n}.`,
    biasAcknowledgement: `This group holds that transfers should be adopted in public, case ${n}.`,
    targets: [target] };
  return { ...b, roles: allLoadBearing(b) };
};

/* ======================================================== 2. EACH GATED MINT, THROUGH ITS OWN OP */
console.log("\n--- 2. each gated prefix, minted three times in a row through its own op, carries no count ---");
{
  /* CASE — `op=publish` with no caseId mints a NEW case (Store#publishCase). */
  const cases = [];
  for (const [i, id] of LEADS.entries()) {
    const r = rP(await POST(`op=publish&token=${IRIS}`, args(i + 1, id)));
    if (r?.ok === false || !r?.minted) console.log(`         (publish ${id}: ${JSON.stringify(r).slice(0, 300)})`);
    cases.push(r?.caseId);
  }
  countArms("CASE", cases);

  /* DRAFT — `op=casedraft` with no draft= authors a NEW draft (Store#caseDraft). A draft's gates need not pass. */
  const drafts = [];
  for (const [i, id] of LEADS.entries()) {
    const r = rP(await POST(`op=casedraft&token=${IRIS}`, args(10 + i, id)));
    if (!r?.ok) console.log(`         (casedraft ${id}: ${JSON.stringify(r).slice(0, 300)})`);
    drafts.push(r?.draftId);
  }
  countArms("DRAFT", drafts);

  /* RVG — `op=reviewgrant` issues a grant on a draft, the owner's act (Store#reviewGrant). */
  const grants = [];
  for (const who of ["Dana Ruiz", "Sam Ortiz", "Lee Park"]) {
    const r = rP(await POST(`op=reviewgrant&token=${IRIS}`, { draft: drafts[0], recipient: who }));
    if (!r?.ok) console.log(`         (reviewgrant ${who}: ${JSON.stringify(r).slice(0, 300)})`);
    grants.push(r?.grantId);
  }
  countArms("RVG", grants);
  /* The RVG mint now has a refusal of its own behind it (MINT_EXHAUSTED), so the complaint in FRONT of it —
     a grant whose read secret's fingerprint was not stamped — is pinned here (machine-fences' shadow sweep asks
     for exactly that). The control plane always stamps it, so it is driven at the Durable Object's door, the one
     place an absent stamp can arrive; nothing is minted or issued. */
  {
    const ns0 = await mf.getDurableObjectNamespace("STORE");
    const door = ns0.get(ns0.idFromName("bio"));
    const r = rP(await (await door.fetch(`http://x/reviewgrant?author=iris`, { method: "POST",
      body: JSON.stringify({ draft: drafts[0], recipient: "No Stamp" }) })).json());
    t("a grant with no stamped secret fingerprint is refused REVIEW_NO_SECRET before any id is minted",
      [r?.ok, r?.reason, r?.grantId], [false, "REVIEW_NO_SECRET", undefined]);
  }

  /* TASK — `op=taskdrain` turns a queued capture event into a task (Store#taskDrain). The events are enqueued on
     the Durable Object directly because there is deliberately no control-plane enqueue (bounds.test.mjs's own
     fixture); the MINT is driven through the op. */
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  for (let i = 0; i < 3; i++) {
    const cap = sha(`rec151-capture-${i}`), id = `INFO-2026-152${i}-filed`;
    const md = `---\nid: ${id}\n---\n`;
    const r = rP(await POST(`op=promote&token=${ADM}`, {
      bundleId: id, base: null, snapKey: `20260919T20000${i}Z_task`, author: "ruth",
      meta: { object_type: "information", group: "believe-in-oakland", title: `Filed ${i}`,
              current_state: "collected", created: NOW, last_updated: NOW },
      files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
      register: [{ sha256: cap, path: `snapshots/doc${i}.pdf`, encoding: "binary", bytes: 10 }] }));
    if (r?.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
    await obj.fetch("http://x/taskenqueue", { method: "POST", body: JSON.stringify({
      kind: "authority-undetermined", captureSha: cap, subject: `https://example.gov/doc${i}.pdf`, at: NOW }) });
  }
  const tasks = [];
  for (let i = 0; i < 3; i++) {
    const r = rP(await POST(`op=taskdrain&token=${ADM}`, { limit: 1, now: NOW }));
    tasks.push(...(r?.created || []).map((c) => c.id));
  }
  countArms("TASK", tasks);
  t("TASK: each id still reads as the inbox grammar requires (C-19.1's TASK-<year>-<4 digits>-<slug>)",
    tasks.every((id) => /^TASK-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/.test(id)), true);

  /* PROJ — REC-141's mint, now through the one minter. */
  const projs = [];
  for (const n of ["Alpha", "Beta", "Gamma"])
    projs.push(await makePublishingProject({ post: POST, mf, sha, machineToken: ADM, owner: "iris",
      name: `Count ${n}`, created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" }));
  /* PROJ's fresh-store counter answer is off by one here — the fixture's own project was minted first — so the
     counter would have answered 0002, 0003, 0004; the pair arm is the one that reads it. */
  t("PROJ: three mints were made and read back", projs.filter((id) => /^PROJ-\d{4}-\d{4}-/.test(id)).length, 3);
  t("PROJ NO COUNT: two mints in a row do NOT differ by one, pair after pair",
    projs.map(suffixOf).slice(1).every((v, i) => v - suffixOf(projs[i]) === 1), false);
}

/* ======================================================== 3. op=allocid REFUSES EVERY GATED PREFIX */
console.log("\n--- 3. op=allocid refuses every gated prefix, and still counts a shared one ---");
{
  for (const P of ["PROJ", "CASE", "DRAFT", "RVG", "TASK"]) {
    const r = rP(await POST(`op=allocid&token=${ADM}&prefix=${P}&year=${YEAR}`));
    t(`op=allocid prefix=${P} is REFUSED by name (ALLOCID_PREFIX_GATED, C-59.5), with its translation, and allocates nothing`,
      [r?.ok, r?.code, r?.check, typeof r?.translation === "string" && r.translation.length > 40, r?.id],
      [false, "ALLOCID_PREFIX_GATED", "C-59.5", true, undefined]);
  }
  /* The refusal is decided on the counter's SCOPE, so a caller cannot reach a gated counter by moving the dash. */
  const dash = rP(await POST(`op=allocid&token=${MEM}&prefix=CASE-${YEAR}&year=x`));
  t("a gated scope reached another way (prefix=CASE-<year>) is refused the same way", dash?.code, "ALLOCID_PREFIX_GATED");
  /* OVER-STRICTNESS: a shared prefix still counts, and a prefix that only begins with a gated one's letters is
     not gated. */
  const i1 = rP(await POST(`op=allocid&token=${MEM}&prefix=INFO&year=${YEAR}`));
  const i2 = rP(await POST(`op=allocid&token=${MEM}&prefix=INFO&year=${YEAR}`));
  t("OVER-STRICTNESS: a SHARED prefix (INFO) still allocates from its counter, +1 each call",
    [typeof i1?.id, suffixOf(i2?.id) - suffixOf(i1?.id)], ["string", 1]);
  const px = rP(await POST(`op=allocid&token=${MEM}&prefix=PROJECTX&year=${YEAR}`));
  t("OVER-STRICTNESS: a prefix that merely begins with a gated one's letters (PROJECTX) still allocates",
    px?.id, `PROJECTX-${YEAR}-0001`);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nopaque-ids: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
