/* NEGATIVE CONTROL: RAN 2026-09-23 by the D-394 worker, driver `test/nc-d394.mjs`, SIX ARMS PLUS A BASELINE, each armed ALONE (anchor matched exactly once) with every other defence held open, every restore of src/store.mjs verified by sha256 AND byte comparison against a uniquely-named per-arm pristine copy (2922466 bytes, 8ff7a4a5ab02…), and each arm declaring BY NAME what MUST fail and what MUST NOT. ALL SIX AS DECLARED. Baseline 40/0. (1) persist — the read mints its matched candidate as a content row -> 38/2, failing at NOTHING WRITTEN (the counters) and NOTHING WRITTEN (the whole store), certainty/silence/label arms green. ITS FIRST RUN CAME BACK GREEN, AND THAT WAS A FINDING ABOUT THE INSTRUMENT: the witness window opened after section 1's read, which had already minted the row, and a content row is INSERT OR IGNORE'd by its hash, so every read inside the window wrote nothing new; the window now opens before the first notice read. (2) nochain — the newer-version check dropped (`after = 0`) -> 27/13, failing at all four CERTAINTY arms (and every arm resting on a newer capture), while the chain-of-one and no-address arms and both nothing-written arms stay green. (3) unreadlie — `newer` answered false for a chain never read -> 38/2, failing at NO ADDRESS by name. (4) identity — a candidate labelled the same passage -> 38/2, failing at THE CANDIDATE IS LABELLED A CANDIDATE. (5) unheld — an unheld bound read as a fit -> 39/1, failing at UNDETERMINED, bound NOT HELD alone. (6) overstrict, THE OVER-STRICTNESS DIRECTION — a positive extent test never admitted -> 37/3, failing at the MATCHED arm while every UNDETERMINED arm, the whole-document arm and the certainty arms stay green.
 *
 * D-394 — THE CROSS-VERSION NOTICE (`BIO_Content_Framework_v0_10.md` §18.1).
 *
 * A member whose case rests on a passage was never told that a newer version of
 * its document exists. The record held BOTH captures and said nothing. §18.1
 * designed the answer: computed lazily at READ, attached to nothing persistent,
 * in three states — no newer capture (silence, EARNED), a newer capture with a
 * passage at the same extent (a CANDIDATE, never a move), and a newer capture
 * whose passage is UNDETERMINED — plus the state the design's table does not
 * list and this read must not lie about: a chain that could not be READ.
 *
 * HOW A LIAR PASSES THIS, and the arm that catches each:
 *   (a) it WRITES the candidate somewhere  -> section 4: every table of the store,
 *       hashed whole with the instance down, is byte-identical across the reads,
 *       and so is every counter op=stats reports.
 *   (b) it calls a match THE SAME PASSAGE   -> section 2: every candidate is
 *       `candidate_only`, `identity: "not_established"`, and says CANDIDATE.
 *   (c) it answers "no newer version" for a chain it never READ -> section 3: a
 *       capture with no recorded address answers `newer: null`, `chain_unread`,
 *       and a sentence, never `no_newer_capture`.
 *   (d) it drops the newer-version check -> section 1: the certainty arm names
 *       the address whose newer version it failed to report.
 *
 * WHAT THIS SUITE CANNOT SEE, stated. It drives the pdf-page and document arms
 * of the extent test end to end; the office arms reach the same checker through
 * `#extentBoundUnheld`'s per-kind switch and are NOT driven here with office
 * captures. It does not measure the read's cost. It does not decide §18.1's own
 * open question — whether the notice reaches a member whose case is already
 * PUBLISHED — and no surface renders it yet (UI).
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, readdirSync, statSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { VERSION_NOTICE_CHECKS } from "../checks/bio-checks.mjs";
import { normalizeAddress } from "../src/subresources.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const PERSIST = mkdtempSync(join(tmpdir(), "d394-persist-"));
const mk = () => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d394", MEMBER_TOKEN: "mem-d394", PROBE_TOKEN: "prb-d394", VERSION: "test" },
  defaultPersistRoot: PERSIST,
});
let mf = mk();

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-d394") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs = "", tok = "mem-d394") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const notice = (qs, tok) => get("versionnotice", qs, tok);
/* NULL-TOLERANT, so an arm that breaks the answer's shape NAMES the assertions it
   broke instead of ending the module on a TypeError. */
const legOf = (r, ord) => ((r && r.notices) || []).find((n) => n.ord === ord) || {};

const NOW = "2026-09-23T00:00:00Z", LATER = "2026-09-23T01:00:00Z";

try {

/* ------------------------------------------------------------------ fixture */
const member = async (id, caps, role = "member") => {
  const add = await post("memberadd", { memberId: id, cover: `cover for ${id}`, role, capabilities: caps }, "adm-d394");
  const en = await post("enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await member("ruth", ["contribute"], "admin");
await member("gus", ["contribute"], "admin");
const CAROL = await member("carol", ["contribute", "create_projects"]);
const DAVE = await member("dave", ["contribute"]);

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: mechanical", "  capability_tier: daemon",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: City Clerk", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const projectMd = () => ["---", "object_type: project",
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "---", "", "## Summary", "", "A project the uninvited must not learn about.", ""].join("\n");
const extentLines = (l) => [
  ...(l.kind ? [`    extent_kind: ${l.kind}`] : []),
  ...(l.page !== undefined ? [`    extent_page: ${l.page}`] : [])];
const inquiryMd = (id, legs) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(legs.length ? ["references:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    rel: cites",
                                                            "    status: confirmed"])] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(legs.length ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
                                                        ...extentLines(l)])] : []),
  "---", "", "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

const chainOf = (pages) => [
  { step: "pixels", extent: { kind: "pages", pages } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" },
    extent: { kind: "pages", pages } }];
const readingOf = (captureSha, pages) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 4096 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW,
             entities: [], facts: {},
             text_source: pages === "unscoped" ? [{ step: "layer" }] : chainOf(pages) } });

let snapSeq = 0;
const HEAD = new Map();
/* A capture is REGISTERED (the chain joins `register`) and, where `pages` is
   given, READ (the extent test's page set comes from the reading). */
const mustPromote = async (id, text, type, { captures = [], tok = "mem-d394" } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  const read = captures.filter((c) => c.pages);
  if (read.length) {
    const prov = JSON.stringify({ documents: read.map((c) => readingOf(c.sha, c.pages)) });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    ...(id === null ? {} : { bundleId: id }), base: id === null ? null : (HEAD.get(id) ?? null),
    snapKey: `20260923T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : type === "project" ? "forming" : "collected",
            created: NOW, last_updated: LATER },
    files,
    register: captures.map((c) => ({ sha256: c.sha, path: `documents/${c.sha.slice(0, 8)}.pdf`,
                                     encoding: "binary", bytes: 4096 })) }, tok);
  if (r?.ok === false) throw new Error(`promote ${id} REFUSED: ${JSON.stringify(r).slice(0, 900)}`);
  if (id !== null) HEAD.set(id, r.bundleSha);
  return r;
};
const locate = async (address, captureSha, retrieved) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const r = rP(await (await ns.get(ns.idFromName("bio")).fetch("http://x/recordcapturedlocator",
    { method: "POST", body: JSON.stringify({ address, addressNorm: address, captureSha, retrieved }) })).json());
  if (r?.ok === false) throw new Error(`recordcapturedlocator ${address}: ${JSON.stringify(r)}`);
};

console.log("\n--- 0. the ground: six documents, each a shape of version history, and one question citing a passage of each ---");
const A = (p) => normalizeAddress(`https://www.oaklandca.gov/d394/${p}.pdf`);
const ADDR = { M: A("minutes"), U: A("budget"), N: A("staff-report"), S: A("charter"), W: A("agenda"), G: A("contract"),
               P: A("resolution") };
const S = (k) => sha(`d394 capture ${k}`);
/* THE GROUND TRUTH, written here and never read back out of the op. */
const V = {
  M1: { sha: S("M1"), doc: "INFO-2026-3940-m1", at: "2026-01-01T09:00:00Z", pages: [0, 1, 2] },
  M2: { sha: S("M2"), doc: "INFO-2026-3940-m2", at: "2026-02-01T09:00:00Z", pages: [0, 1, 2] },
  M3: { sha: S("M3"), doc: "INFO-2026-3940-m3", at: "2026-03-01T09:00:00Z", pages: [0, 1, 2, 3] },
  U1: { sha: S("U1"), doc: "INFO-2026-3940-u1", at: "2026-01-02T09:00:00Z", pages: [0, 1, 2, 3, 4] },
  U2: { sha: S("U2"), doc: "INFO-2026-3940-u2", at: "2026-03-02T09:00:00Z", pages: [0, 1] },
  N1: { sha: S("N1"), doc: "INFO-2026-3940-n1", at: "2026-01-03T09:00:00Z", pages: [0, 1, 2] },
  N2: { sha: S("N2"), doc: "INFO-2026-3940-n2", at: "2026-03-03T09:00:00Z", pages: null },
  S1: { sha: S("S1"), doc: "INFO-2026-3940-s1", at: "2026-01-04T09:00:00Z", pages: [0, 1] },
  X1: { sha: S("X1"), doc: "INFO-2026-3940-x1", at: null, pages: [0, 1] },
  W1: { sha: S("W1"), doc: "INFO-2026-3940-w", at: "2026-01-05T09:00:00Z", pages: [0] },
  W2: { sha: S("W2"), doc: "INFO-2026-3940-w", at: "2026-03-05T09:00:00Z", pages: null },
  G1: { sha: S("G1"), doc: "INFO-2026-3940-g1", at: "2026-01-06T09:00:00Z", pages: [0, 1] },
  G2: { sha: S("G2"), doc: null, at: "2026-03-06T09:00:00Z", pages: [0, 1] },
  /* P2 is READ, by an UNSCOPED chain (the text layer over the whole file), so the
     record holds its text and NO page set: the extent test's bound is unheld. */
  P1: { sha: S("P1"), doc: "INFO-2026-3940-p1", at: "2026-01-07T09:00:00Z", pages: [0, 1, 2] },
  P2: { sha: S("P2"), doc: "INFO-2026-3940-p2", at: "2026-03-07T09:00:00Z", pages: "unscoped" },
};
t("GROUND TRUTH GUARD: fifteen distinct capture shas (a collision would make every arm below measure less)",
  new Set(Object.values(V).map((v) => v.sha)).size, 15);

for (const k of ["M1", "M2", "M3", "U1", "U2", "N1", "N2", "S1", "X1", "G1", "P1", "P2"])
  await mustPromote(V[k].doc, infoMd(V[k].doc), "information", { captures: [V[k]] });
/* W: ONE bundle re-captured — the second capture registered on the SAME bundle. */
await mustPromote(V.W1.doc, infoMd(V.W1.doc), "information", { captures: [V.W1] });
await mustPromote(V.W1.doc, infoMd(V.W1.doc).replace("A captured document.", "Re-captured."), "information",
  { captures: [V.W1, V.W2] });   /* W1 again, so its reading is carried forward rather than dropped */
/* G2: the newer contract filed INSIDE a project carol owns and dave was never invited to. */
{
  const r = await mustPromote(null, projectMd(), "project", { captures: [V.G2], tok: CAROL });
  t("MEASURED, not assumed: a project bundle carries the newer capture, so the gate arm is live", r?.ok, true);
}
for (const [k, addr] of [["M1", "M"], ["M2", "M"], ["M3", "M"], ["U1", "U"], ["U2", "U"], ["N1", "N"],
                         ["N2", "N"], ["S1", "S"], ["W1", "W"], ["W2", "W"], ["G1", "G"], ["G2", "G"],
                         ["P1", "P"], ["P2", "P"]])
  await locate(ADDR[addr], V[k].sha, V[k].at);
/* X1 has NO locator: the record holds its bytes and no address they came from. */

const SUB = "INQ-2026-3940-sub", INQ = "INQ-2026-3940-main";
await mustPromote(SUB, inquiryMd(SUB, []), "inquiry", { tok: RUTH });
const LEGS = [
  { target: V.M1.doc, kind: "pdf-page", page: 1 },   // 0 matched, two versions after it
  { target: V.U1.doc, kind: "pdf-page", page: 3 },   // 1 newer, extent OUTSIDE the newer capture
  { target: V.N1.doc, kind: "pdf-page", page: 1 },   // 2 newer, the newer capture never READ
  { target: V.S1.doc, kind: "pdf-page", page: 0 },   // 3 a chain of one: silence, earned
  { target: V.X1.doc, kind: "pdf-page", page: 0 },   // 4 no address: the chain CANNOT be read
  { target: V.W1.doc },                               // 5 the whole document, re-captured into its own bundle
  { target: SUB },                                    // 6 another question: no passage to ask about
  { target: V.G1.doc, kind: "pdf-page", page: 1 },   // 7 the newer version is inside a project
  { target: V.P1.doc, kind: "pdf-page", page: 1 },   // 8 newer, read, and its page set NOT HELD
];
const pInq = await mustPromote(INQ, inquiryMd(INQ, LEGS), "inquiry", { tok: RUTH });
const cidAt = (ord) => (pInq.content || []).find((c) => c.ord === ord)?.content_id ?? null;
t("the ground: every leg that cites a document resolves to a content row, and the sub-question's does not",
  [0, 1, 2, 3, 4, 5, 6, 7, 8].map((o) => !!cidAt(o)), [true, true, true, true, true, true, false, true, true]);
console.log(`  corpus: ${Object.keys(V).length} captures at ${Object.keys(ADDR).length} addresses (+1 capture with no `
          + `address), 1 question resting on ${LEGS.length} legs`);

/* THE WITNESS WINDOW OPENS BEFORE THE FIRST NOTICE READ OF ANY SHAPE, and that
   is a correction this item's own control forced (2026-09-23): the window first
   opened AFTER section 1's read, and the `persist` arm came back GREEN — the
   candidate it minted was minted by that first read, outside the window, and a
   content row is INSERT OR IGNORE'd by its hash, so every read inside the window
   re-minted the same id and wrote nothing new. A write that happens once is only
   seen by a witness that encloses the first time. So the window encloses EVERY
   notice read this suite makes before section 4's assertions. */
/* THE WITNESS. The instance is disposed so the SQLite file is quiescent, every
   table the store holds is read whole and hashed, and the instance is brought
   back. A read that persists ANYTHING — a candidate row, a cached answer, a log
   line — moves at least one table's hash. */
const witness = async () => {
  await mf.dispose();
  const dbs = [];
  const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n);
    statSync(p).isDirectory() ? walk(p) : /\.sqlite$/.test(n) && dbs.push(p); } };
  walk(PERSIST);
  const out = {};
  for (const p of dbs) {
    const db = new DatabaseSync(p);
    for (const { name } of db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all()) {
      let h;
      try {
        const rows = db.prepare(`SELECT * FROM "${name.replace(/"/g, '""')}"`).all()
          .map((r) => JSON.stringify(r, (k, v) => (v instanceof Uint8Array ? Buffer.from(v).toString("hex")
                                                   : typeof v === "bigint" ? String(v) : v))).sort();
        h = `${rows.length}:${sha(rows.join("\n"))}`;
      } catch (e) { h = `UNREADABLE:${String(e.message).slice(0, 60)}`; }
      out[`${p.slice(PERSIST.length)}#${name}`] = h;
    }
    db.close();
  }
  mf = mk();
  await get("stats");                        /* boot the instance so the next request is not the first */
  return out;
};
const statsA = await get("stats");
const W0 = await witness();
const W1 = await witness();
const tables = Object.keys(W0);
const contentKey = tables.find((k) => /#content$/.test(k));
console.log(`  witness reach: ${tables.length} table(s) across ${new Set(tables.map((k) => k.split("#")[0])).size} `
          + `SQLite file(s); ${tables.filter((k) => /^UNREADABLE/.test(W0[k])).length} unreadable; content table ${contentKey ? W0[contentKey] : "ABSENT"}`);
t("WITNESS FLOOR: the witness reads the store's SQLite (at least 40 tables, the content table among them, none unreadable)",
  [tables.length >= 40, !!contentKey, tables.filter((k) => /^UNREADABLE/.test(W0[k]))], [true, true, []]);
t("WITNESS QUIET: a restart and a stats read alone move no table (the instrument cannot blame the read for noise)",
  tables.filter((k) => W0[k] !== W1[k]), []);
const all = await notice(`target=${INQ}`);
const leg = (o) => legOf(all, o);
/* THE READS, every shape this op answers — the question, a passage, a refusal,
   the gated caller — so a write on ANY branch of the op moves the witness. */
const ASK = [
  () => notice(`target=${INQ}`), () => notice(`target=${INQ}`, CAROL), () => notice(`target=${INQ}`, DAVE),
  () => notice(`content=${cidAt(0)}`), () => notice(`content=${cidAt(1)}`), () => notice(`content=${cidAt(4)}`),
  () => notice(`target=${INQ}`, "adm-d394"), () => notice(""),
];
for (const ask of ASK) await ask();
const statsB = await get("stats");
const W2 = await witness();

/* ====================================================================== 1
 * THE CERTAINTY: a newer capture at the address is STATED, and it is the right one.
 * ==================================================================== */
console.log("\n--- 1. a newer version at the address is stated with certainty ---");
t("the read answers, for the question, one notice per leg in basis order",
  [all?.ok, all?.target, (all?.notices || []).map((n) => n.ord)], [true, INQ, [0, 1, 2, 3, 4, 5, 6, 7, 8]]);
t(`CERTAINTY: ${ADDR.M} gained two captures after the cited one, and the read says a newer version exists`,
  [leg(0).newer, leg(0).chain_read, leg(0).chains?.[0]?.newer_count, leg(0).chains?.[0]?.versions],
  [true, true, 2, 3]);
t("and it names the NEWEST capture, by the ground truth written above (not the middle one, not the cited one)",
  [leg(0).chains?.[0]?.newest?.capture_sha, leg(0).chains?.[0]?.newest?.bundle_id, leg(0).candidates?.length],
  [V.M3.sha, V.M3.doc, 1]);
t("CERTAINTY holds where the passage is not matched: the outside-extent and unheld-bound legs still say a newer version exists",
  [leg(1).newer, leg(1).chains?.[0]?.newest?.capture_sha, leg(2).newer, leg(2).chains?.[0]?.newest?.capture_sha],
  [true, V.U2.sha, true, V.N2.sha]);
t("a re-capture into the SAME bundle is a newer version too (the chain is by address, not by bundle)",
  [leg(5).newer, leg(5).chains?.[0]?.newest?.capture_sha, leg(5).chains?.[0]?.newest?.bundle_id],
  [true, V.W2.sha, V.W1.doc]);

/* ====================================================================== 2
 * THE PASSAGE: a CANDIDATE or UNDETERMINED, and a candidate is never the same passage.
 * ==================================================================== */
console.log("\n--- 2. the passage: a labelled candidate, or UNDETERMINED with its reason ---");
t("page 1 exists in the newest capture's page set: the state is MATCHED and the candidate carries the extent",
  [leg(0).state, leg(0).candidates?.[0]?.matched, leg(0).candidates?.[0]?.extent, leg(0).candidates?.[0]?.reason],
  ["newer_capture_matched", true, { kind: "pdf-page", page: 1, rect: null }, "extent_in_newer_capture"]);
t("THE CANDIDATE IS LABELLED A CANDIDATE: candidate_only, identity not established, and it SAYS candidate",
  [leg(0).candidates?.[0]?.candidate_only, leg(0).candidates?.[0]?.identity,
   /CANDIDATE/.test(leg(0).candidates?.[0]?.says ?? ""), /never evidence of identity/.test(leg(0).candidates?.[0]?.says ?? "")],
  [true, "not_established", true, true]);
t("and nothing on the answer calls it the SAME passage — the word appears only to deny it",
  (JSON.stringify(all).match(/same passage/gi) || []).length === (JSON.stringify(all).match(/(not|never)[^"]{0,40}same passage/gi) || []).length,
  true);
t("UNDETERMINED, extent OUTSIDE: page 3 is not in the newer two-page capture, and the reason says the passage may have moved",
  [leg(1).state, leg(1).candidates?.[0]?.matched, leg(1).candidates?.[0]?.reason, leg(1).candidates?.[0]?.extent,
   /may have moved/.test(leg(1).candidates?.[0]?.why ?? "")],
  ["newer_capture_undetermined", false, "outside_newer_capture", null, true]);
t("UNDETERMINED, newer capture UNREAD: nobody read it, and the reason is about the record — it does NOT say the passage moved",
  [leg(2).state, leg(2).candidates?.[0]?.matched, leg(2).candidates?.[0]?.reason,
   /not about the document/.test(leg(2).candidates?.[0]?.why ?? ""), /may have moved/.test(leg(2).candidates?.[0]?.why ?? "")],
  ["newer_capture_undetermined", false, "newer_capture_unread", true, false]);
t("UNDETERMINED, bound NOT HELD: the newer capture was read with no page set, and an unheld bound is NOT read as a fit",
  [leg(8).state, leg(8).newer, leg(8).candidates?.[0]?.matched, leg(8).candidates?.[0]?.reason,
   /no page set/.test(leg(8).candidates?.[0]?.why ?? "")],
  ["newer_capture_undetermined", true, false, "bound_not_held", true]);
t("the undetermined notice SAYS a newer version exists and that survival is undetermined",
  [/newer version of this document exists/.test(leg(1).says ?? ""), /UNDETERMINED/.test(leg(1).says ?? "")], [true, true]);
t("the whole document is at the same extent in every version: matched, on its own stated reason",
  [leg(5).state, leg(5).candidates?.[0]?.reason, leg(5).candidates?.[0]?.candidate_only],
  ["newer_capture_matched", "whole_document", true]);
t("no existing row is claimed where none was minted (existing_content_id is a FIND, never a mint)",
  [leg(0).candidates?.[0]?.existing_content_id, leg(5).candidates?.[0]?.existing_content_id], [null, null]);

/* ====================================================================== 3
 * SILENCE IS EARNED, AND "NO NEWER VERSION" IS SAID ONLY WHEN THE CHAIN WAS READ.
 * ==================================================================== */
console.log("\n--- 3. 'no newer capture' only where the chain was read; UNDETERMINED where it was not ---");
t("a chain of one: no_newer_capture, the chain was read, and the notice says NOTHING",
  [leg(3).state, leg(3).newer, leg(3).chain_read, leg(3).says, leg(3).candidates], ["no_newer_capture", false, true, null, []]);
t("NO ADDRESS: the chain could not be read, so newer is NULL and the state is chain_unread — never 'no newer capture'",
  [leg(4).state, leg(4).newer, leg(4).chain_read, leg(4).addresses_asked], ["chain_unread", null, false, 0]);
t("and it SAYS so, in a sentence that denies being a statement that there is none",
  [/UNDETERMINED/.test(leg(4).says ?? ""), /not a statement that there is none/.test(leg(4).says ?? ""),
   /no address/.test(leg(4).why ?? "")], [true, true, true]);
t("a leg citing another question names no passage: not_asked, with its reason, and no newer claim either way",
  [leg(6).state, leg(6).newer, leg(6).content_id, typeof leg(6).why], ["not_asked", null, null, "string"]);
t("the answer publishes its four states with the sentence each says (the vocabulary travels with the answer)",
  Object.keys(all?.states || {}).sort(), ["chain_unread", "newer_capture_matched", "newer_capture_undetermined", "no_newer_capture"]);

/* ====================================================================== 4
 * NOTHING IS WRITTEN — witnessed across the WHOLE store, with the instance down.
 * ==================================================================== */
console.log("\n--- 4. nothing written: every table byte-identical, every counter unchanged ---");
t("NOTHING WRITTEN (the counters): every count op=stats reports is byte-identical across the reads",
  JSON.stringify(statsB) === JSON.stringify(statsA) ? "identical" : { before: statsA, after: statsB }, "identical");
t("NOTHING WRITTEN (the whole store): no table's rows moved — not the leg, not the content row, not the edge, not a candidate",
  tables.filter((k) => W1[k] !== W2[k]).map((k) => `${k.split("#")[1]} ${W1[k]} -> ${W2[k]}`), []);
t("and the answer SAYS it wrote nothing and is a proposal only",
  [all?.wrote, all?.proposal_only], [false, true]);

/* ====================================================================== 5
 * ONE PASSAGE, THE GATE, AND THE REFUSALS.
 * ==================================================================== */
console.log("\n--- 5. content=, the gate, and the refusals ---");
const one = await notice(`content=${cidAt(0)}`);
t("content= answers for ONE passage, the same notice the question's leg carries",
  [one?.ok, one?.count, one?.notices?.[0]?.state, one?.notices?.[0]?.chains?.[0]?.newest?.capture_sha],
  [true, 1, "newer_capture_matched", V.M3.sha]);
const asCarol = legOf(await notice(`target=${INQ}`, CAROL), 7);
const asDave = await notice(`target=${INQ}`, DAVE);
t("THE GATE, positive: carol owns the project holding the newer contract, and is told a newer version exists",
  [asCarol.newer, asCarol.chains?.[0]?.newest?.capture_sha], [true, V.G2.sha]);
t("THE GATE, negative: dave was never invited, and the chain he may read holds nothing after the cited capture",
  [legOf(asDave, 7).state, legOf(asDave, 7).chains?.[0]?.versions], ["no_newer_capture", 1]);
t("and nothing in dave's answer names the hidden capture or the project bundle holding it",
  [JSON.stringify(asDave).includes(V.G2.sha), /PROJ-/.test(JSON.stringify(asDave))], [false, false]);
t("and the answer states whose chain it read (visible_to), so dave's silence is not a claim about the record",
  typeof asDave?.visible_to === "string" && /not in them/.test(asDave.visible_to), true);
const codeOf = (r) => (r && (r.code || r.reason)) || null;
t("neither subject: refused VERSION_NOTICE_NO_SUBJECT (C-74.1) with its translation",
  [codeOf(await notice("")), (await notice(""))?.check, typeof (await notice(""))?.translation],
  ["VERSION_NOTICE_NO_SUBJECT", "C-74.1", "string"]);
t("both subjects: refused VERSION_NOTICE_NO_SUBJECT — one subject per notice",
  codeOf(await notice(`target=${INQ}&content=${cidAt(0)}`)), "VERSION_NOTICE_NO_SUBJECT");
t("a question that does not exist, and a document id given as a question: VERSION_NOTICE_NO_INQUIRY (C-74.2)",
  [codeOf(await notice("target=INQ-2026-3940-nosuch")), codeOf(await notice(`target=${V.M1.doc}`)),
   (await notice("target=INQ-2026-3940-nosuch"))?.check], ["VERSION_NOTICE_NO_INQUIRY", "VERSION_NOTICE_NO_INQUIRY", "C-74.2"]);
t("a passage that does not exist: VERSION_NOTICE_NO_CONTENT (C-74.3)",
  [codeOf(await notice(`content=${"0".repeat(64)}`)), (await notice(`content=${"0".repeat(64)}`))?.check],
  ["VERSION_NOTICE_NO_CONTENT", "C-74.3"]);
t("the refusal family is three rows, all C-74, each with a translation a member can read",
  [Object.keys(VERSION_NOTICE_CHECKS).length,
   Object.values(VERSION_NOTICE_CHECKS).every((r) => /^C-74\.\d+$/.test(r.check) && r.translation.length > 60)],
  [3, true]);
const cut = await notice(`target=${INQ}&limit=2`);
t("THE BOUND: limit=2 answers the first two legs, publishes the 2 it applied, and says it was cut",
  [cut?.count, cut?.limit, cut?.truncated, (cut?.notices || []).map((n) => n.ord), all?.truncated, all?.limit],
  [2, 2, true, [0, 1], false, 200]);
t("an over-ask is clamped to the published ceiling, and the ceiling is what is published",
  (await notice(`target=${INQ}&limit=99999`))?.limit, 200);
t("the read reaches every class that may read (admin token, member token, a signed-in member)",
  [(await notice(`target=${INQ}`, "adm-d394"))?.ok, all?.ok, asDave?.ok], [true, true, true]);

} catch (e) {
  /* A THROW IS A FAILURE AND IS COUNTED AS ONE, and the stack is printed, so an
     arm that breaks the fixture names what it broke rather than reading clean. */
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack : e}`);
  fail++;
}

/* THE FOOT. The exit is on the suite's OWN RESULT and never under a conditional. */
console.log(`\nversionnotice: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
