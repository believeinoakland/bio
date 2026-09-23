/* NEGATIVE CONTROL: (RUN 2026-09-23 by the D-220 worker through `test/versions.control.mjs` — NOT a `.test.mjs`, it edits real sources; each arm armed ALONE by an exact-string replacement that THROWS if it matches nothing, every restore verified by sha256 AND by content with a byte floor, printed per arm. BASELINE, same run: 22 pass, 0 fail.) (1) THE ARM THE ROW NAMES — drop the chain read (`const chain = { result: null };` in place of the `op=versionchain` call in `src/index.mjs`'s `collect` row) -> 15/7, and the one-document arm FAILS BY NAME: "B2a: ONE DOCUMENT — the three captures of https://www.oaklandca.gov/city-council/calendar and its address read as ONE document with its three versions, not four documents", with B2b, B2c, B2e, B3 and B3b. DECLARED WRONG IN ONE ARM, AND IT IS THE DECLARATION THAT WAS WRONG: B2d was declared MUST-NOT and went red — with no chain read EVERY citation is unchained, so the unchained list is six items and not the one uncaptured bundle; the subject behaved correctly. PART A, B0 and B1 held, as declared. (2) THE LIAR — the document keyed by what the five bundles SHARE (a constant standing for their common title) in `src/subsession.mjs` -> 16/6: A1 and B2b red as declared ("two DIFFERENT documents sharing a title and a summary count as TWO"), and B3b. DECLARED WRONG: A2 and B2a were declared to hold and went red — merging the two documents puts the planning calendar's version into the council calendar's list, which is the liar's merge seen from the version side; B0, B1, A3 and A4 held. (3) NO DEDUP — every citation its own document (keyed by the citation) -> 15/7: A1, A2, B2a, B2b, B2c red as declared, and B2e, which was not declared (the spelt address no longer meets its document); A3, A4, A5, B0, B1, B2d and B3 held, as declared. OVER-STRICTNESS is IN the suite rather than an arm: B2e cites the council calendar's address in a spelling nobody normalised and it must reach the same document, which it does because the PLANE normalises it. All three restores printed content=true sha256=true.) */
/* D-220 — THE RUN READS DOCUMENT VERSIONS AS VERSIONS. Consumer (3).
 *
 * `INVESTIGATIVE-SESSION.md` §3: *"AND IT MUST READ DOCUMENT VERSIONS AS VERSIONS
 * (D-220, Bob 2026-08-06). Sixty captures of one calendar are sixty document
 * versions of ONE document, not sixty documents. A run that counts them as sixty
 * has a distorted picture of what the record holds — the false-coverage hazard
 * `STORE-AS-CACHE.md` names … The session is consumer (3) on that row."*
 *
 * THE ROW'S ACCEPTS-WHEN, and each clause is an arm below by name:
 *   - a fixture holding several captures of one address reads as ONE document
 *     with its versions, and a run's coverage counts it once;
 *   - HOW A LIAR PASSES IT: deduplicating by title or text, which merges
 *     different documents — so the fixture carries TWO DIFFERENT DOCUMENTS
 *     SHARING A TITLE (and a summary), and they must count as two;
 *   - NEGATIVE CONTROL: drop the chain read, and the one-document arm fails by name.
 *
 * TWO PARTS, and neither implies the other:
 *
 *   PART A · `documentHoldings`, PURE — every outcome a citation can have
 *     (chained, unchained, undetermined, truncated), driven without a plane.
 *
 *   PART B · THROUGH `POST /run`, INSIDE WORKERD, and the two reads D-220 adds go
 *     to the REAL plane (`bio-plane/src/index.mjs` with its Durable Object), whose
 *     record holds the fixture written through `op=promote` and the capture
 *     path's own locator writer. Everything else goes to a small mock, because
 *     what is under test is the `collect` row and not the rest of the table. A
 *     mock answering `op=versionchain` would be a fixture that agrees with the
 *     member for free; the REAL join is what decides what one document is.
 *
 * WHAT THIS SUITE DOES NOT CLAIM. The real plane is reached with its MEMBER
 * token, not an `ai` credential — minting one is a member act with its own
 * fixtures (`aicredential.test.mjs`). What an `ai` credential may reach is a
 * SHAPE over the OPS table (`aiTaskScope`: every non-mutating op a member
 * reaches), and section B0 asserts both reads have that shape; the credential
 * itself is not driven here.
 */

/* D-186: owns $TMPDIR for this process and removes it on exit. */
import "../../bio-plane/test/sandbox.mjs";

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

import { PLANE_OPS } from "../src/harness.mjs";
import { documentHoldings, holdingsNote } from "../src/subsession.mjs";
import { meaningRowsBranch } from "./plane-meaning.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  if (ok) pass += 1; else fail += 1;
};
const sha = (s) => createHash("sha256").update(s).digest("hex");

/* ================================================================
 * PART A · documentHoldings, PURE
 * ================================================================ */
console.log("\n=== PART A · documentHoldings: the document is the chain's address, never a title ===");
{
  const chainA = { address_norm: "https://a.example/cal", total: 3, truncated: false,
    versions: [{ bundle_id: "A1" }, { bundle_id: "A2" }, { bundle_id: "A3" }] };
  const chainB = { address_norm: "https://b.example/cal", total: 1, truncated: false,
    versions: [{ bundle_id: "B1" }] };
  const h = documentHoldings([
    { citation: "A1", bundle: "A1", address: "https://a.example/cal", chain: chainA },
    { citation: "A2", bundle: "A2", address: "https://a.example/cal", chain: chainA },
    { citation: "A3", bundle: "A3", address: "https://a.example/cal", chain: chainA },
    { citation: "https://a.example/cal", bundle: null, address: "https://a.example/cal", chain: chainA },
    { citation: "B1", bundle: "B1", address: "https://b.example/cal", chain: chainB },
  ]);
  t("A1: five citations, TWO documents — three versions and the address of one, and one of another",
    [h.citations, h.documents], [5, 2]);
  t("A2: the versions cited are the chain's own, counted once each, and the address citation adds no version",
    [h.versions_cited, h.versions_held, h.by_document.map((d) => d.versions_cited.length)], [4, 4, [3, 1]]);

  const none = documentHoldings([
    { citation: "X", bundle: "X", address: "https://x.example/", chain: { address_norm: "https://x.example/", total: 0, versions: [] } },
    { citation: "Y", bundle: "Y", address: "https://y.example/", chain: { address_norm: "https://y.example/", total: 0, versions: [] } },
  ]);
  t("A3: an item in NO chain counts as ITSELF — two unchained citations are two items and zero documents, "
    + "never merged, because no chain is not evidence of sameness", [none.documents, none.unchained], [0, 2]);

  const refused = documentHoldings([{ citation: "Z", refused: { at: "versionchain", code: "SOME_CODE", check: "C-0.0" } }]);
  t("A4: a REFUSED read is UNDETERMINED and STATED — neither a document nor an item, and the plane's code travels",
    [refused.documents, refused.unchained, refused.undetermined, refused.undetermined_items[0].code],
    [0, 0, 1, "SOME_CODE"]);
  t("A4b: …and the note says so in words that cannot be read as a zero",
    /UNDETERMINED/.test(holdingsNote(refused)), true);

  const trunc = documentHoldings([{ citation: "P9", bundle: "P9", address: "https://p.example/",
    chain: { address_norm: "https://p.example/", total: 1500, truncated: true, versions: [{ bundle_id: "P1" }] } }]);
  t("A5: a TRUNCATED chain still counts its document once, and a bundle past the page is named, not claimed",
    [trunc.documents, trunc.by_document[0].truncated, trunc.by_document[0].cited_not_listed], [1, true, ["P9"]]);

  t("A6: identity is the plane's key, and the answer says which key",
    /versionchain's address_norm/.test(h.identity), true);
}

/* ================================================================
 * PART B · THROUGH POST /run, with the REAL plane answering the chain
 * ================================================================ */
console.log("\n=== PART B · the collect row, through the op, over the REAL plane's version chain ===");

const { Miniflare } = await (async () => {
  try { return await import("miniflare"); } catch { /* fall through */ }
  const planePkg = fileURLToPath(new URL("../../bio-plane/package.json", import.meta.url));
  const resolved = createRequire(planePkg).resolve("miniflare");
  return await import(pathToFileURL(resolved).href);
})();

const WORKER_SRC_PATH = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const WORKER_SRC = readFileSync(WORKER_SRC_PATH, "utf8");
const PLANE_IDX_PATH = fileURLToPath(new URL("../../bio-plane/src/index.mjs", import.meta.url));
const PLANE_INDEX = readFileSync(PLANE_IDX_PATH, "utf8");

console.log("\n--- B0 · the two reads are ones an `ai` credential can reach, by the plane's own shape ---");
{
  const row = (op) => new RegExp(String.raw`^  ${op}:\s*\{ classes: \[([^\]]*)\],\s*mutating: (true|false)`, "m").exec(PLANE_INDEX);
  const rows = ["search", "versionchain"].map((op) => row(op));
  t("B0: the plane's OPS table holds both rows (guard: an unparsed row would pass the next arm free)",
    rows.map((r) => r !== null), [true, true]);
  t("B0b: both are NON-mutating and reached by the member class — `aiTaskScope`'s floor, so no scope must "
    + "declare them", rows.map((r) => r && [/"member"/.test(r[1]), r[2]]), [[true, "false"], [true, "false"]]);
  t("B0c: and this member declares both as reads", [PLANE_OPS.search?.mutating, PLANE_OPS.versionchain?.mutating],
    [false, false]);
}

const AIK = "aik-" + "d".repeat(64);
const MEM = "mem-d220-aw";

/* THE FRONT: `search` and `versionchain` go to the REAL plane under its member
   token, and are counted; everything else goes to the mock. */
const FRONT = `
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const op = url.searchParams.get("op") || "";
    if (url.pathname === "/__front/state") return Response.json({ real: globalThis.__real || [] });
    if (op !== "search" && op !== "versionchain") return env.MOCK.fetch(req);
    (globalThis.__real = globalThis.__real || []).push({ op, q: url.searchParams.get("q"),
      address: url.searchParams.get("address") });
    url.searchParams.set("token", env.MEMBER);
    return env.REAL.fetch("http://real/api/?" + url.searchParams.toString());
  },
};`;

const PLANE_MOCK = `
export default {
  async fetch(req, env) {
    if (!globalThis.__S) globalThis.__S = { log: [] };
    const S = globalThis.__S;
    const url = new URL(req.url);
    const op = url.searchParams.get("op") || "";
    let body = null;
    if (req.method === "POST") { try { body = await req.json(); } catch { body = null; } }
    S.log.push(op);
    if (op === "whoami")
      return Response.json({ ok: true, result: { tokenClass: "ai", session: false, member: null }, tokenClass: "ai" });
    if (op === "airun")
      return Response.json({ ok: true, result: { session: {
        id: url.searchParams.get("run"), mode: "check", status: "running",
        context: { type: "inquiry", id: "INQ-1" }, max_passes: 1,
        budget: [{ bound: "fetches", allowed: 50, consumed: 0 },
                 { bound: "subsessions", allowed: 50, consumed: 0 },
                 { bound: "wallclock", allowed: 500000, consumed: 0 },
                 { bound: "runtime", allowed: 5000, consumed: 0 }],
      } } });
    if (op === "airunlog")
      return Response.json({ ok: true, result: { entries: [], limit: 200, truncated: false } });
    if (op === "airunspawn")
      return Response.json({ ok: true, result: { half: "search", payload: {
        run: url.searchParams.get("run"), context: { type: "inquiry", id: "INQ-1" }, mode: "check",
        skill: "pack-1.0.0", standard_pair: null, standard: { in_force: false, basis: "context-has-no-project" } } } });
    ${meaningRowsBranch("[]")}
    if (op === "basisversions")
      return Response.json({ ok: true, result: { versions: [], limit: 50, truncated: false } });
    if (op === "airuntick")
      return Response.json({ ok: true, result: { ticked: true, appended: (body && body.log || []).length, status: "running" } });
    if (op === "airunclose")
      return Response.json({ ok: true, result: { terminated: true, bound: (body && body.bound) || null } });
    return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
  },
};`;

const mf = new Miniflare({
  workers: [
    { name: "agent-worker", modules: true, modulesRoot: "/", scriptPath: WORKER_SRC_PATH, script: WORKER_SRC,
      modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      bindings: { VERSION: "test" }, serviceBindings: { PLANE: "plane-front" } },
    { name: "plane-front", modules: true, script: FRONT,
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      bindings: { MEMBER: MEM }, serviceBindings: { MOCK: "plane-mock", REAL: "real-plane" } },
    { name: "plane-mock", modules: true, script: PLANE_MOCK,
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"] },
    { name: "real-plane", modules: true, modulesRoot: "/", scriptPath: PLANE_IDX_PATH, script: PLANE_INDEX,
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      durableObjects: { STORE: { className: "Store", useSQLite: true } },
      r2Buckets: ["CAPTURES", "PUBLISHED"],
      bindings: { ADMIN_TOKEN: "adm-d220-aw", MEMBER_TOKEN: MEM, PROBE_TOKEN: "prb-d220-aw",
                  VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" } },
  ],
});

/* The run below names `store: "scratch"`, so the fixture is written there too:
   the same namespace the run's reads are addressed to, named on every call. */
const STORE = "scratch";
const real = await mf.getWorker("real-plane");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body) => rP(await (await real.fetch(
  `http://real/api/?op=${op}&store=${STORE}&token=${MEM}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs) => rP(await (await real.fetch(
  `http://real/api/?op=${op}&store=${STORE}&token=${MEM}&${qs}`)).json());
const doStub = (await mf.getDurableObjectNamespace("STORE", "real-plane")).get(
  (await mf.getDurableObjectNamespace("STORE", "real-plane")).idFromName(STORE));
const recordLocator = async (b) => rP(await (await doStub.fetch("http://x/recordcapturedlocator",
  { method: "POST", body: JSON.stringify(b) })).json());

/* THE FIXTURE. Two DIFFERENT documents that SHARE A TITLE AND A SUMMARY — the
   liar's merge — one captured three times and one once; and a third bundle whose
   address the record holds no captured version at. */
const TITLE = "City Council Calendar";
const SAME_PROSE = "The calendar of public meetings.";
const ADDR_A = "https://www.oaklandca.gov/city-council/calendar";
const ADDR_B = "https://www.oaklandca.gov/planning-commission/calendar";
const ADDR_C = "https://www.oaklandca.gov/never-captured/calendar";
const NOW = "2026-09-01T00:00:00Z";
const infoMd = (id, locator) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "${TITLE}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: mechanical", "  capability_tier: daemon",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", `  locator: ${locator}`, "  authority: City Clerk", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", SAME_PROSE, "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const promoteInfo = async (id, locator, captureSha) => {
  const text = infoMd(id, locator);
  const r = await post("promote", {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "d220",
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    meta: { object_type: "information", group: "believe-in-oakland", title: TITLE,
            current_state: "collected", created: NOW, last_updated: NOW },
    register: captureSha ? [{ sha256: captureSha, path: "documents/calendar.html", encoding: "utf8", bytes: 2048 }] : [],
  });
  if (r?.ok !== true) throw new Error(`promote ${id} refused: ${JSON.stringify(r).slice(0, 600)}`);
};

const A = [0, 1, 2].map((k) => ({ id: `INFO-2026-2201-council-cal-${k}`,
  capture: sha(`the council calendar, revision ${k}\n`), first: `2026-0${k + 6}-01T09:00:00Z` }));
const B = { id: "INFO-2026-2202-planning-cal", capture: sha("the planning commission calendar\n"),
  first: "2026-07-15T09:00:00Z" };
const C = { id: "INFO-2026-2203-uncaptured-cal" };
for (const v of A) {
  await promoteInfo(v.id, ADDR_A, v.capture);
  await recordLocator({ address: ADDR_A, addressNorm: ADDR_A, captureSha: v.capture, retrieved: v.first });
}
await promoteInfo(B.id, ADDR_B, B.capture);
await recordLocator({ address: ADDR_B, addressNorm: ADDR_B, captureSha: B.capture, retrieved: B.first });
await promoteInfo(C.id, ADDR_C, null);

console.log("\n--- B1 · the fixture ARMED, read off the REAL plane before the run ---");
{
  const chainA = await get("versionchain", `address=${encodeURIComponent(ADDR_A)}`);
  const chainB = await get("versionchain", `address=${encodeURIComponent(ADDR_B)}`);
  const hits = await get("search", `q=${encodeURIComponent(`title:"${TITLE}"`)}&limit=10&facets=none`);
  t("B1: the record holds THREE versions at the council address and ONE at the planning address (guard: an "
    + "empty chain would make every arm below free)", [chainA?.total, chainB?.total], [3, 1]);
  t("B1b: THE LIAR'S FIXTURE — all FIVE held bundles share ONE title, so a title-keyed count reads one",
    (hits?.hits || []).map((h) => h.title).filter((x) => x === TITLE).length, 5);
}

const runOp = (body) => mf.dispatchFetch("http://agent-worker/run", { method: "POST", body: JSON.stringify(body) });
const base = { run_id: "run-d220", store: STORE, credential: AIK };

/* The DOCUMENT level's sub-session cites every capture of the council calendar,
   the council calendar's ADDRESS in a spelling nobody normalised (the
   over-strictness arm), the planning calendar and the uncaptured bundle. */
const ADDR_A_SPELT = "HTTPS://WWW.OAKLANDCA.GOV/city-council/calendar";
const reports = [
  { level: "meaning", state: "LOOKED_ABSENT", observed_at: "log:1" },
  { level: "content", state: "LOOKED_ABSENT", observed_at: "log:2" },
  { level: "document", state: "PRESENT", observed_at: "log:3", summary: "the calendars name the meeting",
    citations: [...A.map((v) => ({ address: v.id })), { address: ADDR_A_SPELT }, { address: B.id }, { address: C.id }] },
  { level: "internet", state: "LOOKED_ABSENT", observed_at: "log:4" },
];

console.log("\n--- B2 · several captures of one address read as ONE document with its versions ---");
const res = await runOp({ ...base, judgements: [{ targets: [] }, { reports }, { candidates: [] }, {}] });
const out = await res.json();
const h = out.holdings || {};
const docA = (h.by_document || []).find((d) => d.versions_cited?.includes(A[0].id)) || null;
{
  t("B2: 200 and ok, and the run published its holdings", [res.status, out.ok, typeof out.holdings], [200, true, "object"]);
  t(`B2a: ONE DOCUMENT — the three captures of ${ADDR_A} and its address read as ONE document with its three `
    + "versions, not four documents",
    docA && [docA.versions_held, [...docA.versions_cited].sort(), docA.cited.length],
    [3, A.map((v) => v.id).sort(), 4]);
  t("B2b: THE LIAR'S ARM — two DIFFERENT documents sharing a title and a summary count as TWO, and six "
    + "citations are two documents and one item in no chain",
    [h.citations, h.documents, h.unchained], [6, 2, 1]);
  t("B2c: the run's coverage counts each document ONCE: four held versions, all four cited",
    [h.versions_held, h.versions_cited], [4, 4]);
  t("B2d: the uncaptured bundle is counted as ITSELF, with the reason, never merged into a document",
    (h.unchained_items || []).map((u) => u.citation), [C.id]);
  t("B2e: OVER-STRICTNESS — an address cited in a spelling nobody normalised still reaches its document, "
    + "because the PLANE normalises it", docA ? docA.cited.includes(ADDR_A_SPELT) : false, true);
  /* The level-empty candidates `compose` adds go to `suggest`, which this mock does not hold; that
     refusal is the mock's and not under test. The READS this row makes are. */
  t("B2f: nothing is UNDETERMINED here, and none of the collect row's reads was refused",
    [h.undetermined, (out.refusals || []).filter((r) => ["search", "versionchain", "meaningrows"].includes(r?.at))],
    [0, []]);
}

console.log("\n--- B3 · it is the RECORD's chain that decided, observed at the plane ---");
{
  const front = await (await (await mf.getWorker("plane-front")).fetch("http://front/__front/state")).json();
  t("B3: every citation was resolved through the REAL plane — one `search` and, where a source address "
    + "exists, one `versionchain` each", [front.real.filter((r) => r.op === "search").length,
     front.real.filter((r) => r.op === "versionchain").length], [6, 6]);
  const note = (out.trace || []).find((x) => x.step === "collect")?.note ?? "";
  t("B3b: the observation entry says what was counted, in documents", /2 document\(s\) held across 6 citation\(s\)/.test(note), true);
  t("B3c: and the reads count stays a count of READS — all six answered", out.citations_reread, 6);
}

await mf.dispose();
console.log(`\nversions: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
