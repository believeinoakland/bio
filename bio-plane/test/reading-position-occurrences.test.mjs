/* NEGATIVE CONTROL: four arms, run 2026-09-25 by the D-454 worker, each armed ALONE by a driver that counts its anchor (each occurred exactly once, so each ARMED), each restored by `cp` from a uniquely named per-arm pristine copy and verified by sha256 AND `cmp` with the byte count printed (schema.mjs d7d9e53a…ee8c8dbb 253,440 B; bio-checks.mjs 9d042d84…7733cf20 959,460 B; store.mjs f73020ab…42ae5f6d 3,341,911 B; meeting-agenda.mjs 613b9999…adb84644 16,012 B; every restore byte-identical). Baseline 39/0. (a) `twokey` — THE ROW'S OWN CONTROL: schema.mjs `PRIMARY KEY (capture_sha, ref, occurrence)` -> `PRIMARY KEY (capture_sha, ref)`, the two-column key restored. DECLARED: section 1's three-places arm and section 3's acceptance arms FAIL BY NAME; section 0 (the readers, which never touch the table) STAYS GREEN. RESULT 17/22: the three-occurrences arm FAILED BY NAME ("A read it on three pages…" got one place), and so did every section 3 acceptance arm, section 4's lapse, and the migration's key/choice arms — section 0 STAYED GREEN. NOT PREDICTED, and recorded rather than smoothed: section 2's GROUND (op=connect wrote 0) also failed, because under the two-column key INSERT OR REPLACE keeps the LAST write (seq 2) and no seq-0 row survives, so op=resolve (which reads seq 0) resolved nothing — the seq-0 convention the per-reference reads rest on holds only under the three-column key, which this arm proves the suite would catch. On the first run of this arm the suite THREW (tally -1: `withStore` left the instance disposed when its callback threw on an empty connections table); the suite was made null-robust (try/finally, a guarded insert) and the arm re-run to the figure above. (b) `pairexclude` — bio-checks.mjs `checkConnectionMentionUnchosen` reverted to excluding EVERY mention with the pair's ref (the pre-D-454 rule). DECLARED: page 9 of A (a second read of the pair's own string) stops being UNDETERMINED and its mention list empties; page 3's tie arm fails. RESULT 35/4 AS DECLARED, plus section 5's AMBIGUOUS arm, whose fallback is the same check. (c) `noindexdrop` — store.mjs `#migrate`, the two `DROP INDEX IF EXISTS` after the rename removed. DECLARED: the both-indexes-on-the-new-table arm FAILS and nothing else (the table works without its indexes, which is why this trap fails nothing else). RESULT 38/1 AS DECLARED. (d) `reader` — meeting-agenda.mjs's repeat branch back to `continue` (a repeat dropped). DECLARED: section 0's `occurrences` arm FAILS, everything else STAYS (the plane is fed by provenance documents). RESULT 38/1 AS DECLARED. Over-strictness is held in-suite, not by an arm: the place's human form ('p.9') must name the occurrence, and a reference read ONCE must still record with none named (REC-122's shape). Driver: the D-454 worker's scratchpad `d454-nc/drive.py`, not committed. D-625 ADDED TWO ARMS, run 2026-09-25 by the D-625 worker, each ALONE (anchor counted exactly once), each restored by `cp` from a per-arm pristine copy and verified by sha256 AND `cmp` (store.mjs b3b54c3b… 3,472,474 B, byte-identical both times); baseline 47/0. (e) `collapse` — THE ROW'S OWN CONTROL: the act's `named` given back its `|| null`, so an empty occurrence is none named. DECLARED: section 6's acceptance, portion-grade, query-spelling, whitespace and no-unplaced-read arms FAIL; its fixture and absent arms and sections 0-5 STAY. RESULT 41/6: those five FAILED BY NAME, plus the placed-key arm (its `superseded` names the '' choice the act could no longer record, a knock-on, not a sixth cause); everything else stayed green. (f) `plumbing` — the op's argument line back to `(body && body.occurrence) || …`, so a body's "" falls through to an absent query key. DECLARED: the body-spelled acceptance, portion-grade and no-unplaced-read arms FAIL; the query-spelling arm STAYS (it never used the body key), and so does the whitespace arm ("  " is truthy). RESULT 43/4 AS DECLARED plus the same placed-key knock-on. Driver: the D-625 worker's scratchpad `d625-nc/drive.py`, not committed. */

/* D-454 — ONE STRING READ ON SEVERAL PAGES IS SEVERAL MENTIONS, AND A MEMBER CAN CHOOSE BETWEEN THEM.
 *
 * `reading_refs` was keyed (capture_sha, ref), and every reader kept only a reference's FIRST sighting,
 * so a file number printed on pages 3, 9 and 14 was recorded as read on page 3 alone. REC-122 let a
 * member choose which mention a connection rests on, and the choice could not name page 9: its mentions
 * were reference STRINGS, one position each. Worse, REC-120's unchosen-mention check (C-49.4) excluded
 * every mention sharing the pair's reference, so a second read of the pair's own string could never
 * unsettle a portion answer — page 9 answered a definite OUTSIDE while the subject was printed on it.
 *
 * WHAT IS ASSERTED, driven through the ops a member reaches (`op=promote`, `op=readingref`, `op=resolve`,
 * `op=connect`, `op=connections&content=`, `op=connectionchoose`):
 *   0. THE READERS KEEP EVERY SIGHTING (`occurrences`), and a reference read once keeps its old shape.
 *   1. THE PROJECTION WRITES ONE ROW PER PLACE — three places, three rows; one place read twice, one row.
 *   2. THE READ SEES THE OTHER OCCURRENCES as other mentions: page 9 is UNDETERMINED (C-49.4), not outside.
 *   3. THE ACCEPTANCE: a ref read on three pages yields three mentions, EACH CHOOSABLE — by its key or by
 *      the place's human form — and naming only the string is refused C-74.4, never defaulted.
 *   4. A CHOICE OF A PLACE THE READING NO LONGER READS LAPSES; it never slides to another occurrence.
 *   5. THE MIGRATION KEEPS EVERY ROW (M-155): a store in the pre-D-454 shape, and one in the pre-FW-17
 *      shape, re-keyed on boot with every row kept at seq 0 and both lookup indexes on the new table; a
 *      choice from before D-454 (no occurrence) answers while its reference has one place and is stated
 *      AMBIGUOUS once it has several.
 *   6. THE UNPLACED OCCURRENCE IS CHOOSABLE (D-625): an `occurrence=` PRESENT and empty names the one ''
 *      read, an ABSENT one is still none named, and the portion grade answers from the chosen read.
 *
 * WHAT THIS CANNOT SEE, stated: a real PDF through the pdf worker (the readers are driven over
 * `flattenText`'s page map, the seam `reading-position.test.mjs` pins); a store written by the OLD CODE
 * (the old shape is re-created from its own DDL, quoted below from FW-17's schema, on a store this code
 * wrote — the migration reads only the table's shape, so that is the input it would meet).
 */
import { statedJSON } from "./stated.mjs";
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync, mkdtempSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { flattenText, makeLocator } from "../../docprofile/readtext.mjs";
import meetingAgenda from "../../docprofile/doctypes/meeting-agenda.mjs";
import regulation from "../../docprofile/doctypes/regulation.mjs";
import { readingOccurrenceKey } from "../src/textchain.mjs";
import { CONNECTION_CHOICE_CHECKS, CONNECTION_PAIR_CHECKS } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const PERSIST = mkdtempSync(join(tmpdir(), "d454-persist-"));
const mk = () => withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d454", MEMBER_TOKEN: "mem-d454", PROBE_TOKEN: "prb-d454",
              AI_TOKEN: "ai-d454", VERSION: "test" },
  defaultPersistRoot: PERSIST,
}));
let mf = mk();

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-d454") => rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${tok}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs = "", tok = "mem-d454") => rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;

/* THE STORE'S SQLITE, OPENED WITH THE INSTANCE DOWN — the one store holding `reading_refs` rows. */
const withStore = async (fn) => {
  await mf.dispose();
  const dbs = [];
  const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : /\.sqlite$/.test(n) && dbs.push(p); } };
  walk(PERSIST);
  let out, found = 0;
  /* The instance comes back up WHATEVER `fn` does: a control arm that empties a table must fail the
     assertions after this BY NAME, never end the suite short of its foot on a disposed instance. */
  try {
    for (const p of dbs) {
      const db = new DatabaseSync(p);
      try {
        const has = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='reading_refs'").get();
        if (has && db.prepare("SELECT count(*) c FROM reading_refs").get().c > 0) { found++; out = fn(db); }
      } finally { db.close(); }
    }
  } finally { mf = mk(); }
  if (found !== 1) throw new Error(`expected exactly one store holding reading_refs rows, found ${found}`);
  return out;
};

try {

/* ======================= 0. THE READERS KEEP EVERY SIGHTING ======================= */
console.log("\n--- 0. the readers: a reference read on three pages is ONE entity with THREE occurrences ---");
const PAGES = [
  { page: 0, text: "Rules and Legislation Committee\nThursday, July 16, 2026" },
  { page: 1, text: "Subject:\nGrand Performance Mural\nFrom:\nCouncilmember Wang\n3.1\n26-0910" },
  { page: 2, text: "Page 3\n2\n26-0844" },
  { page: 3, text: "Continued from item 3.1\n26-0910" },
  { page: 4, text: "Page 5\nNothing here" },
  { page: 5, text: "Supplemental\n26-0910" },
];
const flat = flattenText({ pages: PAGES });
console.log(`  corpus: ${PAGES.length} pages, ${flat.text.length} characters flattened, ${flat.segments.length} segments`);
t("the fixture is non-empty (floored)", [PAGES.length >= 6, flat.segments.length >= 6], [true, true]);
const ag = meetingAgenda.parse({ text: flat.text, locate: makeLocator(flat.segments) });
const e910 = ag.entities.find((e) => e.key === "26-0910"), e844 = ag.entities.find((e) => e.key === "26-0844");
t("agenda: 26-0910 is still ONE entity (the reader keys by file number), 26-0844 another",
  ag.entities.map((e) => e.key), ["26-0910", "26-0844"]);
t("agenda: its `source` is still the FIRST sighting (p.2), unchanged", e910?.source?.ref, "p.2");
t("agenda: `occurrences` is every sighting in reading order — p.2, p.4, p.6",
  (e910?.occurrences || []).map((s) => s && s.ref), ["p.2", "p.4", "p.6"]);
t("agenda: a reference read ONCE carries no `occurrences` (the old shape, byte for byte)",
  [e844 && "occurrences" in e844, e844?.source?.ref], [false, "p.3"]);
const REG = [{ page: 0, text: "ORDINANCE NO. 13600 C.M.S.\nAN ORDINANCE AMENDING Ordinance No. 13579" },
             { page: 1, text: "WHEREAS, Ordinance No. 13579 set the rate; now, therefore\nBE IT ORDAINED" }];
const rflat = flattenText({ pages: REG });
const rg = regulation.parse({ text: rflat.text, locate: makeLocator(rflat.segments) });
const r579 = (rg.entities || []).find((e) => e.key === "ordinance:13579");
t("regulation (the `take` readers' shape): Ordinance No. 13579 on two pages is one entity, two occurrences",
  [(rg.entities || []).filter((e) => e.key === "ordinance:13579").length, (r579?.occurrences || []).map((s) => s && s.ref)],
  [1, ["p.1", "p.2"]]);

/* ======================= 1. THE PROJECTION: ONE ROW PER PLACE ======================= */
console.log("\n--- 1. op=promote projects one reading_refs row per place the reference was read ---");
const NOW = "2026-09-25T00:00:00Z", LATER = "2026-09-25T01:00:00Z";
let bseq = 0;
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Doc ${id}"`, "current_state: collected", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged", "source:", "  locator: in hand",
  "  authority: synthetic", `  retrieved: ${NOW}`, "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "A captured document.", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const promoteReading = async (captureSha, entities) => {
  const id = `INFO-2026-${String(8800 + (++bseq))}-o`; const md = infoMd(id);
  const prov = JSON.stringify({ documents: [{ capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW, entities, facts: {}, text_source: [{ step: "layer" }] } }] });
  const r = await post("promote", { bundleId: id, base: null,
    snapKey: `20260925T${String(310000 + bseq).slice(-6)}Z_${sha(String(bseq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland", title: `Doc ${id}`, current_state: "collected", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }], register: [] });
  if (r.ok === false) throw new Error(JSON.stringify(r).slice(0, 400)); return id;
};
const pg = (n) => ({ kind: "pdf-page", ref: `p.${n}`, page: n - 1, rect: null });
const ORD = { ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance No. 13579" };
const SA = sha("d454-A"), SB = sha("d454-B"), SD = sha("d454-D");
const A = await promoteReading(SA, [{ ...ORD, source: pg(3), occurrences: [pg(3), pg(9), pg(14)] }]);
const B = await promoteReading(SB, [{ ...ORD, source: pg(5) }]);
await promoteReading(SD, [{ ...ORD, source: pg(4), occurrences: [pg(4), pg(4), null, null] }]);
const rr = await get("readingref", `ref=${encodeURIComponent(ORD.ref)}`);
const docA = (rr.documents || []).find((d) => d.capture_sha === SA), docB = (rr.documents || []).find((d) => d.capture_sha === SB);
const docD = (rr.documents || []).find((d) => d.capture_sha === SD);
t("op=readingref still answers per DOCUMENT: three documents, count 3", [rr.count, (rr.documents || []).length], [3, 3]);
t("THE ACCEPTANCE'S SUBSTRATE: A read it on three pages, and the read lists all three places",
  [docA?.position?.ref, (docA?.occurrences || []).map((p) => p && p.ref)], ["p.3", ["p.3", "p.9", "p.14"]]);
t("B read it once: the old shape exactly (a position, no `occurrences`)", [docB?.position?.ref, docB && "occurrences" in docB], ["p.5", false]);
t("one place read twice is ONE occurrence, and every unplaced read is ONE unplaced occurrence (D: p.4 + unplaced)",
  (docD?.occurrences || []).map((p) => p && p.ref), ["p.4", null]);

/* ======================= 2. THE OTHER OCCURRENCES ARE OTHER MENTIONS ======================= */
console.log("\n--- 2. with no choice, page 9 of A is UNDETERMINED (C-49.4) — before D-454 it was a definite OUTSIDE ---");
const legMd = (id, target, extent) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Q ${id}"`, "current_state: open", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland",
  "references:", `  - target: ${target}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""', "recheck_triggers:", "  - text: Revisit", "    description: d.",
  "basis:", `  - target: ${target}`, "    role: supports",
  ...(extent == null ? [] : ["    extent_kind: pdf-page", `    extent_page: ${extent - 1}`, `    extent_ref: "page ${extent}"`]),
  "---", "", "## Question", "", "Q", "", "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
const cids = new Map();
let qseq = 0;
const contentOf = async (target, page) => {
  const k = `${target}#${page}`;
  if (cids.has(k)) return cids.get(k);
  const n = ++qseq; const id = `INQ-2026-${8900 + n}-o`;
  const md = legMd(id, target, page);
  const q = await post("promote", { bundleId: id, base: null, snapKey: `20260925T5${String(10000 + n)}Z_d454${String(1000 + n)}`,
    meta: { object_type: "inquiry", group: "believe-in-oakland", title: "Q", current_state: "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] });
  const cid = q.content?.[0]?.content_id;
  if (!cid) throw new Error(`no content row minted for ${id}: ${JSON.stringify(q).slice(0, 300)}`);
  cids.set(k, cid); return cid;
};
const grade = async (target, page) => get("connections", `content=${await contentOf(target, page)}`);
const entryFor = (g, otherSha) => ["reaching", "undetermined", "outside"]
  .map((k) => [k, (g?.[k] || []).find((e) => e.other_capture_sha === otherSha)]).find(([, e]) => e) || [null, null];
const ent = await post("entitycreate", { kind: "ordinance", label: "Rent Adjustment Ordinance", aliases: [ORD.ref] });
const E = ent.entity_id;
for (const s of [SA, SB]) await post("resolve", { captureSha: s });
const d = await post("connect", { entityId: E });
t("GROUND: op=connect writes the one A-B connection", [d.ok, d.count], [true, 1]);
const conns = await get("connections", `id=${E}`);
const AB = (conns.connections || [])[0];
const aSide = SA < SB ? "a" : "b";
t("GROUND: the machine's pair on A is the FIRST read (p.3) — the row every store held before the re-key",
  AB?.determining_pair?.[`${aSide}_position`]?.ref, "p.3");
const [k9, e9] = entryFor(await grade(A, 9), SB);
t("page 9 of A (a second read of the pair's OWN string): UNDETERMINED under C-49.4 BY NAME, never a definite outside",
  [k9, e9?.code, e9?.check], ["undetermined", "CONNECTION_PAIR_MENTION_UNCHOSEN", CONNECTION_PAIR_CHECKS.CONNECTION_PAIR_MENTION_UNCHOSEN.check]);
t("…and it names the p.9 read as the mention inside, carrying the occurrence a member would choose",
  (e9?.mentions || []).map((m) => [m.ref, m.position?.ref, m.occurrence, m.inside]),
  [[ORD.ref, "p.9", readingOccurrenceKey(pg(9)), true]]);
const [k3] = entryFor(await grade(A, 3), SB);
t("page 3 of A (the pair's page): UNDETERMINED — equal-grade reads elsewhere, kept by a tie-break", k3, "undetermined");
const [k7] = entryFor(await grade(A, 7), SB);
t("page 7 of A (no read of it there): still a definite OUTSIDE — every occurrence is placed elsewhere", k7, "outside");

/* ======================= 3. THE ACCEPTANCE: THREE MENTIONS, EACH CHOOSABLE ======================= */
console.log("\n--- 3. a member chooses among the three occurrences; naming only the string is refused C-74.4 ---");
const add = await post("memberadd", { memberId: "ines", cover: "cover for ines", role: "admin",
                                      capabilities: ["contribute", "publish"] }, "adm-d454");
const en = await post("enroll", { invite: add.invite, handle: "ines", password: "ines-passphrase-1" });
const INES = (await post("login", { role: "member:ines", password: "ines-passphrase-1" })).token;
t("FIXTURE: a member is enrolled and signed in", [!!en.ok, typeof INES === "string"], [true, true]);
const choose = (body, capture = SA, other = SB) => post("connectionchoose", { capture, other, entity: E, ref: ORD.ref, ...body }, INES);
const unnamed = await choose({});
t("naming only the string on A is refused C-74.4 BY NAME, with its canned translation",
  [codeOf(unnamed), unnamed?.check, unnamed?.translation === CONNECTION_CHOICE_CHECKS.CONNECTION_CHOICE_OCCURRENCE_UNNAMED.translation],
  ["CONNECTION_CHOICE_OCCURRENCE_UNNAMED", "C-74.4", true]);
t("…and the refusal LISTS the three occurrences, in reading order, so the member can name one",
  (unnamed?.occurrences || []).map((o) => o.position?.ref), ["p.3", "p.9", "p.14"]);
const pages = [3, 9, 14];
for (const p of pages) {
  const c = await choose({ occurrence: readingOccurrenceKey(pg(p)) });
  const g = await grade(A, p);
  const [k, e] = entryFor(g, SB);
  const others = pages.filter((q) => q !== p);
  const outs = [];
  for (const q of others) outs.push(entryFor(await grade(A, q), SB)[0]);
  t(`THE ACCEPTANCE — choose the p.${p} occurrence by its key: recorded at p.${p}, page ${p} REACHES, pages ${others.join(" and ")} are OUTSIDE`,
    [c.ok, c.wrote, c.chosen?.occurrence === readingOccurrenceKey(pg(p)), c.chosen?.position?.ref, k, e?.on_point?.position?.ref, outs],
    [true, true, true, `p.${p}`, "reaching", `p.${p}`, ["outside", "outside"]]);
}
const byForm = await choose({ occurrence: "p.9" });
t("OVER-STRICTNESS: the place's human form ('p.9') names the occurrence too, and supersedes the p.14 choice",
  [byForm.ok, byForm.wrote, byForm.chosen?.position?.ref, byForm.superseded?.occurrence === readingOccurrenceKey(pg(14))],
  [true, true, "p.9", true]);
const again = await choose({ occurrence: readingOccurrenceKey(pg(9)) });
t("the same occurrence named again, by the other spelling, writes nothing", [again.ok, again.wrote], [true, false]);
const bogus = await choose({ occurrence: "p.10" });
t("a place the document does not read the reference at is refused C-74.3 BY NAME, listing where it does",
  [codeOf(bogus), bogus?.check, (bogus?.occurrences || []).length], ["CONNECTION_CHOICE_NOT_A_MENTION", "C-74.3", 3]);
const onceB = await choose({}, SB, SA);
t("B, read ONCE: naming only the string is REC-122's shape and still records, at its one place",
  [onceB.ok, onceB.wrote, onceB.chosen?.position?.ref], [true, true, "p.5"]);

/* ======================= 4. A CHOSEN PLACE THE READING NO LONGER READS ======================= */
console.log("\n--- 4. a re-read that drops the chosen place LAPSES the choice; it never slides to another occurrence ---");
await promoteReading(SA, [{ ...ORD, source: pg(3), occurrences: [pg(3), pg(14)] }]);
const g9l = await grade(A, 9);
const [k9l, e9l] = entryFor(g9l, SB);
t("the p.9 choice is LAPSED on the read, and names the place it chose",
  [e9l?.on_point?.lapsed, e9l?.on_point?.occurrence === readingOccurrenceKey(pg(9))], [true, true]);
t("…and page 9 is no longer reached (the choice does not move to p.3 or p.14)", k9l === "reaching", false);

/* ======================= 5. THE MIGRATION KEEPS EVERY ROW ======================= */
console.log("\n--- 5. a store in the pre-D-454 shape is re-keyed on boot, keeping every row (M-155) ---");
/* FW-17's shape, verbatim from schema.mjs before D-454, and a choice with no occurrence column. */
const OLD_DDL = `CREATE TABLE reading_refs (capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL, ref TEXT NOT NULL,
  ref_kind TEXT, ref_key TEXT, label TEXT, pos_kind TEXT, pos TEXT, pos_ref TEXT, PRIMARY KEY (capture_sha, ref))`;
const before = await withStore((db) => {
  /* The old store held ONE row per (capture, ref): the first read. Re-create exactly that. */
  const rows = db.prepare("SELECT capture_sha,bundle_id,ref,ref_kind,ref_key,label,pos_kind,pos,pos_ref FROM reading_refs WHERE seq=0 ORDER BY capture_sha, ref").all().map((r) => ({ ...r }));
  db.exec("BEGIN");
  db.exec("DROP TABLE reading_refs");
  db.exec(OLD_DDL);
  db.exec("CREATE INDEX reading_refs_ref ON reading_refs(ref)");
  db.exec("CREATE INDEX reading_refs_bundle ON reading_refs(bundle_id)");
  const ins = db.prepare("INSERT INTO reading_refs VALUES (?,?,?,?,?,?,?,?,?)");
  for (const r of rows) ins.run(r.capture_sha, r.bundle_id, r.ref, r.ref_kind, r.ref_key, r.label, r.pos_kind, r.pos, r.pos_ref);
  db.exec("UPDATE connection_pair_choices SET superseded_at='2026-09-25T00:00:00Z' WHERE superseded_at IS NULL");
  db.exec("ALTER TABLE connection_pair_choices DROP COLUMN occurrence");
  /* One current pre-D-454 choice: A's end, the string alone. */
  const c = db.prepare("SELECT a_capture_sha,b_capture_sha,entity_id,a_bundle_id,b_bundle_id FROM connections LIMIT 1").get();
  if (c) db.prepare(`INSERT INTO connection_pair_choices (a_capture_sha,b_capture_sha,entity_id,side,ref,a_bundle_id,b_bundle_id,chosen_by,at)
              VALUES (?,?,?,?,?,?,?,?,?)`).run(c.a_capture_sha, c.b_capture_sha, c.entity_id, SA === c.a_capture_sha ? "a" : "b",
                                             ORD.ref, c.a_bundle_id, c.b_bundle_id, "member:ines", "2026-09-25T00:00:01Z");
  db.exec("COMMIT");
  return { rows, count: db.prepare("SELECT count(*) c FROM reading_refs").get().c,
           cols: db.prepare("PRAGMA table_info(reading_refs)").all().map((r) => r.name) };
});
console.log(`  M-155 BEFORE: ${before.count} reading_refs rows in the pre-D-454 shape (columns ${before.cols.join(",")})`);
t("FIXTURE: the old shape is in place, non-empty (floored), with no occurrence column",
  [before.count >= 3, before.cols.includes("occurrence")], [true, false]);
await get("readingref", `ref=${encodeURIComponent(ORD.ref)}`);   /* any op boots the DO, which migrates */
const after = await withStore((db) => ({
  rows: db.prepare("SELECT capture_sha,bundle_id,ref,ref_kind,ref_key,label,pos_kind,pos,pos_ref,occurrence,seq FROM reading_refs ORDER BY capture_sha, ref").all().map((r) => ({ ...r })),
  pk: db.prepare("PRAGMA table_info(reading_refs)").all().filter((r) => r.pk > 0).sort((x, y) => x.pk - y.pk).map((r) => r.name),
  idx: db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='reading_refs' AND name LIKE 'reading_refs_%' ORDER BY name").all().map((r) => r.name),
  interim: db.prepare("SELECT count(*) c FROM sqlite_master WHERE name='reading_refs_preoccurrence'").get().c,
  choiceCols: db.prepare("PRAGMA table_info(connection_pair_choices)").all().map((r) => r.name),
}));
console.log(`  M-155 AFTER:  ${after.rows.length} reading_refs rows, key (${after.pk.join(", ")}), indexes ${after.idx.join(",")}`);
t("M-155: EVERY row kept — the count before equals the count after", after.rows.length, before.count);
t("…and every row's own columns are unchanged, byte for byte",
  JSON.stringify(after.rows.map(({ occurrence, seq, ...r }) => r)), JSON.stringify(before.rows));
t("…each at seq 0, its occurrence computed from its own position (the rule readingOccurrenceKey states)",
  after.rows.every((r) => r.seq === 0 && r.occurrence === (r.pos_kind && r.pos ? `${r.pos_kind}:${r.pos}` : "")), true);
t("the table is keyed (capture_sha, ref, occurrence)", after.pk, ["capture_sha", "ref", "occurrence"]);
t("BOTH lookup indexes are on the NEW table (a rename carries them off; the migration drops and recreates)",
  after.idx, ["reading_refs_bundle", "reading_refs_ref"]);
t("no interim table survives, and the choices table gained its occurrence column",
  [after.interim, after.choiceCols.includes("occurrence")], [0, true]);
const g14m = await grade(A, 14);
t("the pre-D-454 choice (no occurrence) ANSWERS while its reference has one place in A — page 3 reaches",
  entryFor(await grade(A, 3), SB)[0], "reaching");
await promoteReading(SA, [{ ...ORD, source: pg(3), occurrences: [pg(3), pg(9), pg(14)] }]);
const [k3a, e3a] = entryFor(await grade(A, 3), SB);
t("…and once A reads it at three places the same choice is stated AMBIGUOUS, and page 3 is no longer reached",
  [e3a?.on_point?.ambiguous, (e3a?.on_point?.occurrences || []).length, k3a === "reaching"], [true, 3, false]);
t("(the page-14 read before the re-read answered — the store is serving after the migration)", g14m?.ok, true);

console.log("\n--- 5b. a store OLDER than FW-17 (no position columns) is re-keyed too, every row unplaced ---");
const beforeOld = await withStore((db) => {
  const rows = db.prepare("SELECT capture_sha,bundle_id,ref,ref_kind,ref_key,label FROM reading_refs WHERE seq=0 ORDER BY capture_sha, ref").all().map((r) => ({ ...r }));
  db.exec("BEGIN");
  db.exec("DROP TABLE reading_refs");
  db.exec(`CREATE TABLE reading_refs (capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL, ref TEXT NOT NULL,
    ref_kind TEXT, ref_key TEXT, label TEXT, PRIMARY KEY (capture_sha, ref))`);
  const ins = db.prepare("INSERT INTO reading_refs VALUES (?,?,?,?,?,?)");
  for (const r of rows) ins.run(r.capture_sha, r.bundle_id, r.ref, r.ref_kind, r.ref_key, r.label);
  db.exec("COMMIT");
  return rows;
});
await get("readingref", `ref=${encodeURIComponent(ORD.ref)}`);
const afterOld = await withStore((db) => db.prepare("SELECT capture_sha,bundle_id,ref,ref_kind,ref_key,label,pos_kind,occurrence,seq FROM reading_refs ORDER BY capture_sha, ref").all().map((r) => ({ ...r })));
console.log(`  M-155 pre-FW-17: ${beforeOld.length} rows before, ${afterOld.length} after`);
t("pre-FW-17: every row kept, each unplaced ('' occurrence, no position) at seq 0",
  [afterOld.length, afterOld.every((r) => r.occurrence === "" && r.pos_kind === null && r.seq === 0),
   JSON.stringify(afterOld.map(({ pos_kind, occurrence, seq, ...r }) => r))],
  [beforeOld.length, true, JSON.stringify(beforeOld)]);

/* ======================= 6. THE UNPLACED OCCURRENCE IS CHOOSABLE (D-625) ======================= */
console.log("\n--- 6. a string read at a place AND unplaced: the unplaced read is chosen by its '' key (D-625) ---");
/* Every unplaced read is the one '' occurrence, and the record LISTS it by that key. Before D-625 the act
   read a present-but-empty `occurrence=` as NONE NAMED, so this read could never be chosen and the member
   was refused C-74.4 for a place the plane itself had listed. Last in the suite: it adds connections,
   and section 5 re-creates a pre-D-454 choice on the FIRST connection it finds. */
const SU = sha("d625-U");
const U = await promoteReading(SU, [{ ...ORD, source: pg(2), occurrences: [pg(2), null] }]);
await post("resolve", { captureSha: SU });
const d6 = await post("connect", { entityId: E });
const chooseU = (body) => choose(body, SU, SB);
const unnamedU = await chooseU({});
t("FIXTURE: U reads the string at p.2 and UNPLACED, and the act with none named lists both, the unplaced by its '' key",
  [d6.ok, codeOf(unnamedU), (unnamedU?.occurrences || []).map((o) => [o.occurrence, o.position?.ref ?? null])],
  [true, "CONNECTION_CHOICE_OCCURRENCE_UNNAMED", [[readingOccurrenceKey(pg(2)), "p.2"], ["", null]]]);
t("an ABSENT occurrence is still none named: `occurrence: null` is refused C-74.4, never defaulted",
  [codeOf(await chooseU({ occurrence: null })), codeOf(await chooseU({ occurrence: undefined }))],
  ["CONNECTION_CHOICE_OCCURRENCE_UNNAMED", "CONNECTION_CHOICE_OCCURRENCE_UNNAMED"]);
const emptyU = await chooseU({ occurrence: "" });
t("THE ACCEPTANCE — an EMPTY occurrence names the unplaced read: recorded, keyed '', at no place",
  [emptyU.ok, emptyU.wrote, emptyU.chosen?.occurrence, emptyU.chosen?.position ?? null, codeOf(emptyU)],
  [true, true, "", null, null]);
const [ku2, eu2] = entryFor(await grade(U, 2), SB);
t("…and the portion grade ANSWERS FROM IT: page 2 of U is undetermined C-49.2 (the chosen read has no place), on_point the '' read, the member's",
  [ku2, eu2?.check, eu2?.on_point?.occurrence, eu2?.on_point?.position ?? null, eu2?.on_point?.chosen_by, !!eu2?.on_point?.lapsed],
  ["undetermined", CONNECTION_PAIR_CHECKS.CONNECTION_PAIR_UNPLACED.check, "", null, "ines", false]);
const p2U = await chooseU({ occurrence: readingOccurrenceKey(pg(2)) });
const [kp2] = entryFor(await grade(U, 2), SB);
t("the placed read is still chosen by its key, superseding the unplaced choice, and page 2 then REACHES",
  [p2U.ok, p2U.wrote, p2U.superseded?.occurrence, kp2], [true, true, "", "reaching"]);
/* The query-string spelling: `occurrence=` present and empty, no body key. `searchParams.get` answers ""
   for it and null for an absent one, which is the distinction the act now keeps. */
const viaQuery = rP(await (await mf.dispatchFetch(`http://x/api/?op=connectionchoose&token=${INES}&occurrence=`,
  { method: "POST", body: JSON.stringify({ capture: SU, other: SB, entity: E, ref: ORD.ref }) })).json());
t("OVER-STRICTNESS: the other spelling, `&occurrence=` empty in the query, names the unplaced read too",
  [viaQuery.ok, viaQuery.wrote, viaQuery.chosen?.occurrence, viaQuery.superseded?.occurrence],
  [true, true, "", readingOccurrenceKey(pg(2))]);
const sameU = await chooseU({ occurrence: "  " });
t("…and whitespace alone is the same '' key: the same choice again writes nothing", [sameU.ok, sameU.wrote], [true, false]);
/* B is re-read at its one place first: 5b's pre-FW-17 migration left every earlier row unplaced. */
await promoteReading(SB, [{ ...ORD, source: pg(5) }]);
const onceP = await choose({ occurrence: "" }, SB, SU);
t("an empty occurrence where the document has NO unplaced read is refused C-74.3 BY NAME, never slid to its one place",
  [codeOf(onceP), onceP?.check], ["CONNECTION_CHOICE_NOT_A_MENTION", "C-74.3"]);

} catch (err) {
  console.log(`  FAIL  the suite threw before its foot: ${err && err.stack || err}`);
  fail++;
}
await mf.dispose();
console.log(`\nreading-position-occurrences: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
