/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/mint-ledger.control.mjs` — deliberately NOT a `.test.mjs`, because it builds ARMED COPIES of the sources while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/mint-ledger.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once), the real sources are hashed before and after, and what each arm MUST fail is declared in the driver before it arms.
   RESULTS, RUN 2026-09-21 in worktree agent-ae1b7eca4d2254b16 on D-432 merged with origin/main cb2ab270 (real src/store.mjs 2,754,915 B sha256 81eb16670709…, untouched: YES), all nine AS DECLARED, the same figures as the first full run before the seed's counter half became one SQL statement: (a) baseline 26/0 · (b) no-ledger-read — THE ROW'S CONTROL, the ledger dropped from the minter's `taken` -> 14/12, S2 and every forced collision after a purge (F4–F9, U3–U7) fail BY NAME. ITS FIRST RUN WAS NOT AS DECLARED (11/2): the purged id was not reissued but REFUSED by the ledger's PRIMARY KEY inside the act, and the suite died at its fixture instead of failing at F4 — the arm was right and the SUITE was wrong; it now reports a thrown act at its own assertion, and the key is recorded as the ledger's second defence · (c) no-ledger-write -> 20/6, F4–F9: every purged id REISSUED silently, which is REC-151's behaviour, while the seeded U3–U7 stay green · (d) ledger-purged, the table cleared by purge's whole-store arm -> 15/11, S4, F4–F8 and U3–U7, F9 (single-bundle) green · (e) outside-the-transaction, the liar that defers the write past the act -> 25/1, ONLY F2 (the rollback) · (f) no-seed -> 21/5, U3–U7 · (g) no-counter-seed -> 25/1, ONLY U7 · (h) no-live-seed -> 22/4, U3–U6 · (i) lookup-other-spelling, correct work the source pin did not anticipate -> 26/0.
 * =========================================================================
 * D-432 / IC-170 — AN OPAQUE ID IS NEVER DRAWN AGAIN, PURGE OR NOT. Membership Architecture v2 §7:
 * the minted-id rules (*"A MINTED ID CARRIES NO COUNT"*, BOB #16), the `op=purge` comment's own rule extended —
 * *"allocid must never reissue an identifier that has already existed"* — and the legacy-residue bullet's
 * *"citations must keep resolving"*.
 *
 * THE DEFECT. `allocId`'s counter never reissued an id, because `purge` keeps `seq`. The gated prefixes (PROJ, CASE,
 * DRAFT, RVG, TASK) have no counter: `Store#mintOpaqueId` draws four digits from the CSPRNG and checked them against
 * the LIVE rows of their kind only — and a purge deletes those rows (a whole-store purge every one of them, a
 * single-bundle purge a project's). So an id minted before a purge could be drawn after it, and a citation of the
 * purged object would silently resolve to the NEW one: the record answering for the wrong object, with nothing to
 * say so. THE FIX: a purge-exempt ledger, `minted_ids`, beside `seq`; every id the minter hands out is recorded there
 * in the minting act's own transaction, and every draw asks it as well as the live rows. A boot seed teaches it the
 * ids that existed before it did.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (a) exempt the table from purge and never READ it in the minter. A random draw collides with a purged id once in
 *       10,000, so "mint, purge, mint again, compare" passes a minter that ignores the ledger 9,999 times in 10,000.
 *       So §2 FORCES the collision: the build under test is `src/` with ONE line changed — the draw in
 *       `#mintOpaqueId`, whose FIRST attempt for a prefix returns a suffix the suite chose (an env binding), every
 *       later attempt the real CSPRNG. Mint, purge, and the forced first draw IS the purged id; only the ledger can
 *       refuse it, and the minter then draws again from the CSPRNG. Without the ledger in `taken` the purged id is
 *       handed out again — the row's own negative control, `no-ledger-read`.
 *   (b) keep the ledger OUTSIDE the calling act's transaction (an in-memory set, a write deferred past the act). It
 *       passes every purge arm, and it records ids that never existed: an act that ROLLS BACK keeps its row. The
 *       review copy's dry run of the publish gates (`#reviewGates`) mints a case id inside a transaction that is
 *       ALWAYS rolled back, so F2 asserts the real publish that follows is handed that same id — the ledger kept no
 *       row for it. `outside-the-transaction` is that liar, and F2 is the only arm that can see it.
 *   (c) seed nothing, so every id minted BEFORE this landing — REC-141's, REC-151's, and every counter-era id — stays
 *       exactly as reissuable as before. §3 cuts a LEGACY build (REC-151's minter: no ledger write, no seed, and the
 *       pre-REC-151 `op=allocid` that still served CASE), mints through it onto a PERSISTED store, boots THIS build on
 *       that store, purges it, and forces the draws at the legacy ids.
 *   (d) count or list the ledger somewhere. Nothing reads it but the minter, and every read is a point lookup keyed
 *       on one id (§1): a count of gated ids is how many gated objects were ever minted, hidden ones included — the
 *       disclosure the opaque suffix exists to close (BOB #16). F3 asserts purge's proof and op=stats carry no key
 *       for it.
 *
 * WHAT THIS CANNOT SEE, stated: an id that left every live table BEFORE this landing and that no counter recorded —
 * a PROJ or TASK counter id whose slug is gone, or an opaque id minted and then purged before the ledger existed.
 * Nothing in the store remembers those, so no seed can; an exact reissue of one needs its slug AND its four digits
 * again. And the forcing is a patch of a COPY: this suite proves the ledger's logic under a forced draw, and that the
 * real draw is the CSPRNG is `opaque-ids.test.mjs` §1's pin, not this suite's.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, readdirSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";
import { codeOnly } from "../scripts/declared-source.mjs";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const REAL_SRC = join(PLANE, "src");
/* The control driver points this at an ARMED copy. The LEGACY build (§3) is always cut from the REAL sources: an
   arm changes the build under test, never the build it is upgraded from. */
const SRC_DIR = process.env.MINT_LEDGER_SRC || REAL_SRC;
const STORE_SRC = readFileSync(join(SRC_DIR, "store.mjs"), "utf8");
const SCHEMA_SRC = readFileSync(join(SRC_DIR, "schema.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-d432", MEM = "mem-d432";
const FORCE = "7316";
const YEAR = new Date().toISOString().slice(0, 4);
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const suffixOf = (id) => String(id ?? "").split("-")[2] ?? null;

/* THE ONE EDIT THAT FORCES A DRAW, and the anchors the legacy build removes. Each is asserted to occur EXACTLY ONCE
   in the tree it patches — an arm that did not arm is a finding, not a pass. */
const DRAW_LINE = "      const id = `${prefix}-${year}-${draw()}${tail}`;";
const DRAW_FORCED = "      const id = `${prefix}-${year}-${(i === 0 && this.env && this.env[\"MINT_LEDGER_FORCE_\" + prefix]) || draw()}${tail}`;";
const LEDGER_WRITE = "      this.sql.exec(`INSERT INTO minted_ids (id,recorded_at,source) VALUES (?,?,'mint')`, id, new Date().toISOString());";
const SEED_CALL = "    this.#seedMintLedger();";
const ALLOCID_GATE = "    if (gated) {\n      const row = PROJECT_ID_CHECKS.ALLOCID_PREFIX_GATED;";

/* A copy of the plane with its patches applied to `store.mjs`, in a directory this process owns. */
const cutTree = (fromSrc, patches, label) => {
  const root = mkdtempSync(join(tmpdir(), `mint-ledger-${label}-`));
  cpSync(fromSrc, join(root, "bio-plane", "src"), { recursive: true });
  cpSync(join(PLANE, "checks"), join(root, "bio-plane", "checks"), { recursive: true });
  cpSync(join(REPO, "docprofile"), join(root, "docprofile"), { recursive: true });
  const storePath = join(root, "bio-plane", "src", "store.mjs");
  let s = readFileSync(storePath, "utf8");
  const counts = patches.map(([from]) => s.split(from).length - 1);
  for (const [from, to] of patches) s = s.replace(from, () => to);
  writeFileSync(storePath, s);
  return { root, idx: join(root, "bio-plane", "src", "index.mjs"), counts };
};

/* Every Miniflare this suite builds, built here — so one constructor site and one dispose per instance. */
const planeAt = (idx, force, persist = null) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: idx, script: readFileSync(idx, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  ...(persist ? { durableObjectsPersist: persist } : {}),
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test",
              ...Object.fromEntries(Object.entries(force).map(([p, v]) => [`MINT_LEDGER_FORCE_${p}`, v])) },
});

/* The control plane and the Durable Object's own door, for one instance. */
const door = (mf) => ({
  mf,
  POST: async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json()),
  GET: async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json()),
  DO: async (path, body) => {
    const ns = await mf.getDurableObjectNamespace("STORE");
    return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`,
      { method: "POST", body: JSON.stringify(body ?? {}) })).json());
  },
});

/* ---------------------------------------------------------------- the fixture, borrowed from opaque-ids.test.mjs */
const PW = (id) => `${id}-passphrase-d432`;
const login = async (D, memberId) => {
  const lg = await D.POST("op=login", { role: `member:${memberId}`, password: PW(memberId) });
  if (!lg?.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const enrol = async (D, memberId, role, capabilities) => {
  const add = await D.POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await D.POST("op=enroll", { invite: add?.invite, handle: memberId, password: PW(memberId) });
  if (!en?.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)} after memberadd ${JSON.stringify(add)}`);
  return login(D, memberId);
};
/* ADMINS_FIRST: two administrators before any member. Returns the publishing member's session. */
const roster = async (D) => {
  await enrol(D, "nadia", "admin", ["contribute", "publish", "create_projects"]);
  await enrol(D, "omar", "admin", ["contribute", "publish"]);
  return enrol(D, "iris", "member", ["contribute", "publish"]);
};
const project = (D, name) => makePublishingProject({ post: D.POST, mf: D.mf, sha, machineToken: ADM, owner: "iris",
  name, created: NOW, updated: LATER });
/* A project minted where the ledger is what decides the answer: an act that THROWS (the fixture throws on any refusal)
   is returned as its message, so the assertion that asked reports it BY NAME instead of the suite ending there. */
const tryProject = (D, name) => project(D, name).catch((e) => `THREW: ${String(e && e.message || e).slice(0, 200)}`);
/* The acceptance, one assertion per prefix: the purged id is not handed out again, AND the act still minted a
   well-formed fresh id — a thrown act, a refused act and a reissued id all fail it, each visibly. */
const refused = (tag, before, after, shape) =>
  t(`${tag}: an id minted, purged, then redrawn under a FORCED collision is REFUSED BY THE LEDGER, not reissued — `
    + `the purged ${before} is not handed out again, and the act still minted a fresh id`,
    [shape.test(String(after)), after !== before, suffixOf(after) !== FORCE], [true, true, true]);

let snapSeq = 0;
const promote = async (D, id, text, objectType, state) => {
  const r = await D.POST(`op=promote&token=${ADM}`, {
    bundleId: id, base: null,
    snapKey: `20260921T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: objectType, group: "believe-in-oakland", title: `t ${id}`,
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: [],
  });
  if (r?.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  return r;
};
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
const INFO = "INFO-2026-4325-memo", LEAD = "INQ-2026-4326-question";
/* A finding a case can be published on: the document, the question resting on it, concluded by the member. */
const concludedFinding = async (D, token) => {
  await promote(D, INFO, infoMd(INFO), "information", "collected");
  await promote(D, LEAD, withAdoptableReading(inquiryMd(LEAD, "Was the transfer authorised?", INFO)), "inquiry", "open");
  const c = await D.GET(`op=conclude&token=${token}&target=${encodeURIComponent(LEAD)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${LEAD} is on the memo.`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${LEAD}.`)}` + adoptedVersionParam());
  if (!c?.ok) throw new Error(`conclude ${LEAD}: ${JSON.stringify(c)}`);
};
const caseArgs = (projectId, n) => {
  const b = { project: projectId, scope: `Whether the transfer was authorised, case ${n}.`,
    statement: `This case covers the FY2024 transfer only, case ${n}.`,
    excluded: [{ target: null, description: `the FY2023 memo, case ${n}`, reason: "a records request is outstanding" }],
    subjectPosition: "sought_and_answered",
    subjectJustification: `We put the claims to the City Administrator for case ${n}.`,
    biasAcknowledgement: `This group holds that transfers should be adopted in public, case ${n}.`,
    targets: [LEAD] };
  return { ...b, roles: allLoadBearing(b) };
};
/* A TASK: a capture filed in a bundle, its event queued on the Durable Object (there is deliberately no control-plane
   enqueue — bounds.test.mjs's own fixture), and the MINT driven through `op=taskdrain`. The same `k` always files the
   same capture under the same subject, so the task's slug — and therefore its full id — is the same every time. */
const task = async (D, k) => {
  const cap = sha(`d432-capture-${k}`), id = `INFO-2026-432${k}-filed`;
  const md = `---\nid: ${id}\n---\n`;
  const r = await D.POST(`op=promote&token=${ADM}`, {
    bundleId: id, base: null, snapKey: `20260921T2${String(10000 + (++snapSeq)).slice(-5)}Z_task`, author: "ruth",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Filed ${k}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register: [{ sha256: cap, path: `snapshots/d432-${k}.pdf`, encoding: "binary", bytes: 10 }] });
  if (r?.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  await D.DO("taskenqueue", { kind: "authority-undetermined", captureSha: cap,
                              subject: `https://example.gov/d432-${k}.pdf`, at: NOW });
  const dr = await D.POST(`op=taskdrain&token=${ADM}`, { limit: 1, now: NOW });
  return (dr?.created || [])[0]?.id ?? null;
};
const draft = async (D, token, projectId, n) =>
  (await D.POST(`op=casedraft&token=${token}`, caseArgs(projectId, n)))?.draftId ?? null;
const grant = async (D, token, draftId, who) =>
  (await D.POST(`op=reviewgrant&token=${token}`, { draft: draftId, recipient: who }))?.grantId ?? null;

/* Every `this.#mintOpaqueId(` CALL in the store (the definition is not a call), with its top-level arguments split —
   template literals, quoted strings and nested parentheses respected, so a year expression holding a comma does not
   split an argument. Read out of CODE: comments are blanked first. */
const mintCalls = (src) => {
  const code = codeOnly(src), out = [];
  for (const m of code.matchAll(/this\.#mintOpaqueId\(/g)) {
    let i = m.index + m[0].length, depth = 1, start = i;
    const args = [];
    for (; i < code.length; i++) {
      const ch = code[i];
      if (ch === "`" || ch === '"' || ch === "'") {
        for (i++; i < code.length && code[i] !== ch; i++) if (code[i] === "\\") i++;
        continue;
      }
      if (ch === "(") depth++;
      else if (ch === ")") { if (--depth === 0) { args.push(code.slice(start, i)); break; } }
      else if (ch === "," && depth === 1) { args.push(code.slice(start, i)); start = i + 1; }
    }
    out.push({ prefix: (/^\s*"([A-Z]+)"/.exec(args[0] || "") || [])[1] || "(unreadable)", args,
               text: code.slice(m.index, i + 1) });
  }
  return out;
};

const trees = [];
const live = [];
try {

/* ======================================================== 1. THE SOURCE */
console.log("\n--- 1. the ledger at the source: beside seq, read only as a point lookup, named by no op ---");
{
  const iSeq = SCHEMA_SRC.indexOf("CREATE TABLE IF NOT EXISTS seq (");
  const iLedger = SCHEMA_SRC.indexOf("CREATE TABLE IF NOT EXISTS minted_ids (");
  const iGov = SCHEMA_SRC.indexOf("CREATE TABLE IF NOT EXISTS host_governor (");
  t("S1: `minted_ids` is declared in schema.mjs BESIDE `seq` (no table between them) and BEFORE the `host_governor` "
    + "block (the standing schema rule)",
    [iSeq > -1, iLedger > iSeq, iGov > iLedger,
     iSeq > -1 && iLedger > iSeq && !/CREATE TABLE IF NOT EXISTS/.test(SCHEMA_SRC.slice(iSeq + 12, iLedger))],
    [true, true, true, true]);
  /* Every statement naming the ledger, read out of CODE and widened to its enclosing template literal. */
  const code = codeOnly(STORE_SRC);
  const stmts = [];
  for (const m of code.matchAll(/\bminted_ids\b/g)) {
    const a = code.lastIndexOf("`", m.index), b = code.indexOf("`", m.index);
    stmts.push(a < 0 || b < 0 ? "(no enclosing template)" : code.slice(a + 1, b).replace(/\s+/g, " ").trim());
  }
  const reads = stmts.filter((s) => /^SELECT\b/i.test(s));
  const writes = stmts.filter((s) => /^INSERT\b/i.test(s));
  const other = stmts.filter((s) => !/^(SELECT|INSERT)\b/i.test(s));
  console.log(`         (corpus: ${stmts.length} code occurrence(s) of the ledger in store.mjs — ${reads.length} read(s), `
    + `${writes.length} write(s); not a read or an insert: ${JSON.stringify(other)})`);
  t("S2: the ledger is READ and WRITTEN in the store's code (a pin over an empty corpus pins nothing)",
    [reads.length >= 1, writes.length >= 1], [true, true]);
  t("S3: every READ of it is a point lookup keyed on ONE id — nothing counts it, lists it or ranges over it",
    reads.filter((s) => !/^SELECT .+? FROM minted_ids WHERE id\s*=\s*\?(?:\s+LIMIT\s+1)?$/i.test(s)), []);
  t("S4: and nothing UPDATEs or DELETEs it: every statement naming it is a point read or an insert, so no purge arm "
    + "and no act clears it", other, []);
  const elsewhere = readdirSync(SRC_DIR).filter((f) => f.endsWith(".mjs") && f !== "store.mjs" && f !== "schema.mjs")
    .filter((f) => /\bminted_ids\b/.test(codeOnly(readFileSync(join(SRC_DIR, f), "utf8"))));
  t("S5: and no other module of the plane names it in code — no op, no surface, no count", elsewhere, []);

  const calls = mintCalls(STORE_SRC);
  t("S6: the five gated mint sites are found and read (a pin over no call pins nothing)",
    calls.map((c) => c.prefix).sort(), ["CASE", "DRAFT", "PROJ", "RVG", "TASK"]);
  const untailed = calls.filter((c) => (c.args[2] || "").trim() === '""').map((c) => c.prefix).sort();
  const declared = ((/static UNTAILED_GATED_PREFIXES = Object\.freeze\(\[([^\]]*)\]\)/.exec(STORE_SRC) || [])[1] || "")
    .replace(/["\s]/g, "").split(",").filter(Boolean).sort();
  t(`S7: the COUNTER seed's prefixes are EXACTLY the mint sites that pass no tail (${JSON.stringify(untailed)}) — an id `
    + "the counter issued for those is an id this minter can draw, and one with a slug is not",
    declared, untailed);
  const seedBlock = (/static #MINT_LEDGER_LIVE = Object\.freeze\(\[([\s\S]*?)\]\);/.exec(STORE_SRC) || [])[1] || "";
  const seedPairs = [...seedBlock.matchAll(/\["([A-Z]+)",\s*"(\w+)",\s*"(\w+)"\]/g)]
    .map((m) => `${m[1]} ${m[2]}.${m[3]}`).sort();
  const sitePairs = calls.flatMap((c) => [...c.text.matchAll(/FROM\s+(\w+)\s+WHERE\s+(\w+)\s*=\s*\?/g)]
    .map((m) => `${c.prefix} ${m[1]}.${m[2]}`)).sort();
  console.log(`         (the five sites' live reads: ${JSON.stringify(sitePairs)})`);
  t("S8: the LIVE seed reads EXACTLY the tables and columns each mint site's own `taken` reads, prefix by prefix — a "
    + "site that learns a table and a seed that does not fail here", [seedPairs.length > 0, seedPairs], [true, sitePairs]);
}

/* ======================================================== 2. THE FORCED COLLISION */
console.log("\n--- 2. an id minted, purged, then redrawn under a FORCED collision is refused by the ledger ---");
const THIS = cutTree(SRC_DIR, [[DRAW_LINE, DRAW_FORCED]], "this");
trees.push(THIS.root);
t("F0: the build under test is `src/` with ONE line forced — the draw in `#mintOpaqueId`, found exactly once",
  THIS.counts, [1]);
{
  const mf = planeAt(THIS.idx, { PROJ: FORCE, CASE: FORCE, DRAFT: FORCE, RVG: FORCE, TASK: FORCE });
  live.push(mf);
  const D = door(mf);
  const IRIS = await roster(D);
  const P1 = await project(D, "Ledger One");
  await concludedFinding(D, IRIS);
  const D1 = await draft(D, IRIS, P1, 1);
  /* THE DRY RUN FIRST, so the case id it mints is the first CASE draw this store ever makes. */
  const dry = await D.GET(`op=reviewcopy&draft=${D1}&token=${IRIS}`);
  const pub = await D.POST(`op=publish&token=${IRIS}`, caseArgs(P1, 1));
  const C1 = pub?.caseId ?? null;
  const G1 = await grant(D, IRIS, D1, "Dana Ruiz");
  const T1 = await task(D, 0);
  console.log(`         (minted before the purge: ${JSON.stringify({ P1, C1, D1, G1, T1 })})`);
  t("F1: each gated prefix's first mint carries the forced suffix — PROJ, DRAFT, RVG and TASK (the forcing ARMED; CASE "
    + "is F2's)", [P1, D1, G1, T1].map(suffixOf), [FORCE, FORCE, FORCE, FORCE]);
  t("F2: THE ROLLBACK — the review copy's dry run MINTED a case id inside the publish gates' rolled-back transaction "
    + "(every gate passed, so the act ran to its end), and the real publish that followed was handed THAT SAME id: "
    + "the ledger kept no row for an act that rolled back",
    [dry?.gates, pub?.ok, C1], ["passed", true, `CASE-${YEAR}-${FORCE}`]);

  const pg = await D.GET(`op=purge&token=${ADM}&confirm=bio`);
  const stats = await D.GET(`op=stats&token=${ADM}`);
  t("F3: the whole-store purge took the live rows every `taken` reads — no bundle, no task, and the draft and the "
    + "unratified case document answer as absent — and its PROOF is purge's own, unchanged: no key of it, and no key "
    + "of op=stats, counts the ledger",
    [pg?.ok, pg?.scope, pg?.after?.bundles, pg?.after?.tasks,
     (await D.GET(`op=reviewcopy&draft=${D1}&token=${IRIS}`))?.reason,
     (await D.GET(`op=casedocument&case=${C1}&edition=1&token=${IRIS}`))?.reason,
     Object.keys(pg?.before || {}).filter((k) => /mint|ledger/i.test(k)),
     Object.keys(stats || {}).filter((k) => /mint|ledger/i.test(k))],
    [true, "ALL", 0, 0, "NO_REVIEW_COPY", "NO_CASE_DOCUMENT", [], []]);

  /* The same objects again, under the same names and slugs, so the forced first draw IS each purged id. Each act is
     its own: the case, the draft and the grant ride a project under a NEW name ("Ledger Two"), whose slug no purged
     id carries, so a PROJ outcome cannot decide theirs — and a project mint that THROWS is reported at F4 by name
     rather than ending the suite (the control's `no-ledger-read` arm is where that happens: see the driver). */
  const P2 = await tryProject(D, "Ledger One");
  const PX = await project(D, "Ledger Two");
  await concludedFinding(D, IRIS);
  const pub2 = await D.POST(`op=publish&token=${IRIS}`, caseArgs(PX, 2));
  const D2 = await draft(D, IRIS, PX, 3);
  const G2 = await grant(D, IRIS, D2, "Sam Ortiz");
  const T2 = await task(D, 0);
  console.log(`         (minted after the purge: ${JSON.stringify({ P2, C2: pub2?.caseId ?? pub2, D2, G2, T2 })})`);
  refused("F4 PROJ", P1, P2, /^PROJ-\d{4}-\d{4}-project-ledger-one$/);
  refused("F5 CASE", C1, pub2?.caseId ?? null, /^CASE-\d{4}-\d{4}$/);
  refused("F6 DRAFT", D1, D2, /^DRAFT-\d{4}-\d{4}$/);
  refused("F7 RVG", G1, G2, /^RVG-\d{4}-\d{4}$/);
  refused("F8 TASK", T1, T2, /^TASK-\d{4}-\d{4}-[a-z0-9-]+$/);

  /* The row's second sentence: a SINGLE-BUNDLE purge does the same for its PROJ id. */
  const P3 = await tryProject(D, "Ledger Solo");
  const pb = await D.GET(`op=purge&token=${ADM}&confirm=bio&bundleId=${encodeURIComponent(P3)}`);
  const P4 = await tryProject(D, "Ledger Solo");
  console.log(`         (single-bundle: ${JSON.stringify({ P3, P4 })})`);
  t("F9 PROJ, SINGLE-BUNDLE PURGE: a project purged by itself leaves its id spent — the same name minted again under "
    + "the forced draw is handed a fresh id, not the purged one",
    [suffixOf(P3), pb?.ok, pb?.removed?.bundles, /^PROJ-\d{4}-\d{4}-project-ledger-solo$/.test(String(P4)),
     P4 !== P3, suffixOf(P4) !== FORCE],
    [FORCE, true, 1, true, true, true]);
  await mf.dispose();
  live.splice(live.indexOf(mf), 1);
}

/* ======================================================== 3. THE UPGRADE: ids that existed before the ledger did */
console.log("\n--- 3. ids minted before the ledger existed are learned at boot, and refused after a purge ---");
const LEGACY = cutTree(REAL_SRC, [
  [DRAW_LINE, DRAW_FORCED],
  [LEDGER_WRITE, "      /* the legacy build: REC-151's minter recorded nothing */"],
  [SEED_CALL, "    /* the legacy build: no seed */"],
  [ALLOCID_GATE, "    if (false) {\n      const row = PROJECT_ID_CHECKS.ALLOCID_PREFIX_GATED;"],
], "legacy");
trees.push(LEGACY.root);
t("U0: the LEGACY build is armed — the forced draw, REC-151's minter (no ledger write, no seed) and the pre-REC-151 "
  + "op=allocid that still served CASE — each anchor found exactly once in the REAL sources", LEGACY.counts, [1, 1, 1, 1]);
const persist = mkdtempSync(join(tmpdir(), "mint-ledger-persist-"));
trees.push(persist);
const legacyIds = {};
{
  const mf = planeAt(LEGACY.idx, { PROJ: FORCE, DRAFT: FORCE, RVG: FORCE, TASK: FORCE }, persist);
  live.push(mf);
  const D = door(mf);
  const IRIS = await roster(D);
  legacyIds.PROJ = await project(D, "Legacy One");
  legacyIds.DRAFT = await draft(D, IRIS, legacyIds.PROJ, 4);
  legacyIds.RVG = await grant(D, IRIS, legacyIds.DRAFT, "Lee Park");
  legacyIds.TASK = await task(D, 1);
  legacyIds.COUNTER = [];
  for (let k = 0; k < 3; k++) legacyIds.COUNTER.push((await D.POST(`op=allocid&token=${ADM}&prefix=CASE&year=${YEAR}`))?.id);
  await mf.dispose();
  live.splice(live.indexOf(mf), 1);
}
console.log(`         (the legacy build minted: ${JSON.stringify(legacyIds)})`);
t("U1: the legacy build minted the ids the seed must learn — PROJ, DRAFT, RVG and TASK at the forced suffix, and "
  + "CASE-<year>-0001..0003 off the counter, the way op=allocid served CASE before REC-151",
  [legacyIds.PROJ, legacyIds.DRAFT, legacyIds.RVG, legacyIds.TASK].map(suffixOf).concat(legacyIds.COUNTER),
  [FORCE, FORCE, FORCE, FORCE, `CASE-${YEAR}-0001`, `CASE-${YEAR}-0002`, `CASE-${YEAR}-0003`]);
{
  /* THIS build on the legacy build's store: its boot seeds the ledger. CASE's first draw is forced to an id the
     COUNTER issued; every other prefix's to the id the legacy build minted. */
  const mf = planeAt(THIS.idx, { PROJ: FORCE, DRAFT: FORCE, RVG: FORCE, TASK: FORCE, CASE: "0002" }, persist);
  live.push(mf);
  const D = door(mf);
  const IRIS = await login(D, "iris");
  const pg = await D.GET(`op=purge&token=${ADM}&confirm=bio`);
  t("U2: THIS build booted on the legacy build's store (the roster survived: iris signed in), and a whole-store purge "
    + "then took every live row the legacy ids stood in",
    [typeof IRIS, pg?.ok, pg?.scope, pg?.removed?.bundles > 0, pg?.after?.bundles, pg?.after?.tasks],
    ["string", true, "ALL", true, 0, 0]);
  /* As in §2, each act is its own: the draft, the grant and the case ride a project under a NEW name ("Legacy Two"),
     so only "Legacy One" is asked the PROJ question, and a thrown project mint is reported at U3 by name. */
  const P = await tryProject(D, "Legacy One");
  const PY = await project(D, "Legacy Two");
  const Dr = await draft(D, IRIS, PY, 5);
  const G = await grant(D, IRIS, Dr, "Kim Wu");
  const T = await task(D, 1);
  await concludedFinding(D, IRIS);
  const pub = await D.POST(`op=publish&token=${IRIS}`, caseArgs(PY, 6));
  console.log(`         (minted after the upgrade and the purge: ${JSON.stringify({ P, Dr, G, T, C: pub?.caseId ?? pub })})`);
  const learned = (tag, before, after, shape) =>
    t(`${tag}, LIVE SEED: an id the pre-ledger build minted — learned at boot from its live row, which the purge then `
      + `deleted — is REFUSED under the forced draw, not reissued (${before}), and the act still minted a fresh id`,
      [shape.test(String(after)), after !== before, suffixOf(after) !== FORCE], [true, true, true]);
  learned("U3 PROJ", legacyIds.PROJ, P, /^PROJ-\d{4}-\d{4}-project-legacy-one$/);
  learned("U4 DRAFT", legacyIds.DRAFT, Dr, /^DRAFT-\d{4}-\d{4}$/);
  learned("U5 RVG", legacyIds.RVG, G, /^RVG-\d{4}-\d{4}$/);
  learned("U6 TASK", legacyIds.TASK, T, /^TASK-\d{4}-\d{4}-[a-z0-9-]+$/);
  t("U7 CASE, COUNTER SEED: the counter issued CASE-<year>-0002 before REC-151 moved CASE to this minter, and a draw "
    + "forced to it is REFUSED — an allocation handed out is an identifier that has existed, used or not",
    [pub?.ok, /^CASE-\d{4}-\d{4}$/.test(String(pub?.caseId)), legacyIds.COUNTER.includes(pub?.caseId)],
    [true, true, false]);
  await mf.dispose();
  live.splice(live.indexOf(mf), 1);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  for (const mf of live) await mf.dispose();
  for (const root of trees) rmSync(root, { recursive: true, force: true });
}
console.log(`\nmint-ledger: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
