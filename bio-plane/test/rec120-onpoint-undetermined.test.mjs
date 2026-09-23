/* NEGATIVE CONTROL: two arms, each armed ALONE on `src/store.mjs`, each restored by `cp` from a copy set aside and verified by sha256 (never `git checkout --`). Re-run from `bio-plane/` with `node test/rec120-onpoint-undetermined.test.mjs` after arming. HOW A LIAR WOULD SATISFY THIS, stated before what it checks: the cheapest green is to answer UNDETERMINED for EVERY multi-mention document wherever the cited part falls - no overclaim, and a member told nothing where the record genuinely knows (page 7, which never mentions the subject). So both directions are asserted, and page 7 MUST stay a definite `outside` under C-49.1. (a) `nobranch` - in `connectionGradeForContent`, replace the call to `checkConnectionMentionUnchosen` with `null` so the undetermined branch is never taken: page 9 answers `outside` again and the page-9 assertions FAIL BY NAME (fixture: document A, ordinance read at p.2 and p.9, both grade A), while page 7, the one-mention document and the whole-document citation STAY GREEN. (b) `tiebreak` - FW-21's own control, in `deriveConnections`' collapse change `Store.#GRADE_RANK[r.grade] > Store.#GRADE_RANK[cur.grade]` to `>=`: the stored pair moves from p.2 to p.9, and page 9 MUST STILL answer UNDETERMINED (not reached) and page 2 MUST STILL answer UNDETERMINED - an answer that flips on a tie-break carries no relevance - while only the pair-identity assertions (which reference and page the pair names) fail. RESULTS are recorded on the next line. */
/* RESULTS, run 2026-09-18 by the REC-120 worker, each arm ALONE, store.mjs restored by `cp` from a copy set aside, sha256 e18eafcf…3f0bf before and after each arm (byte-identical): baseline 29/0. (a) nobranch 18/11 - every page-9, page-2 and document-C verdict FAILED BY NAME (page 9 answered `outside` again, [null,0,0,2]) while page 7, the whole-document citation, the one-mention golden and act (2) STAYED GREEN; the eleventh failure is the portion answer's pair statement, which is read off the page-9 undetermined entry the arm removed. (b) tiebreak 22/7 - the pair moved to ordinance:13579-amended at p.9 as FW-21 measured, and page 9 STILL answered UNDETERMINED [null,0,2,0] under C-49.4 and page 2 STILL answered UNDETERMINED: the verdicts did not move. The seven failures are all PAIR IDENTITY - which mention a reason names, document C's pair moving to its unplaced mention (so C-49.2 answers where C-49.4 did, still undetermined), and document B's golden, which embeds the OTHER end's pair reference. Declared as "only the pair-identity assertions fail", and that is what failed; the declaration understated how many assertions carry pair identity, which is recorded rather than re-worded after the fact. */

/* REC-120 / D-161 acts (1) and (2) / M-51 — A CONNECTION'S GRADE AT A CITED PART MUST NOT SAY
 * A DEFINITE "OUTSIDE" WHILE THE RECORD HOLDS ANOTHER MENTION OF THE SAME SUBJECT INSIDE IT, AND
 * THE PAIR MUST SAY IT IS THE STRONGEST-GRADED MENTION RATHER THAN THE ON-POINT ONE.
 *
 * FW-21 measured it by driving the ops (M-51, `tools/fw21-onpoint-probe.mjs`): document A
 * mentions one ordinance on p.2 and on p.9, both at grade A; the connection kept p.2; a citation
 * of p.9 (where the ordinance really is) and a citation of p.7 (which never mentions it) returned
 * IDENTICAL counts and the same firm "none of them reaches this citation". That is the record
 * claiming more than it can support.
 *
 * EVERYTHING BELOW IS DRIVEN THROUGH THE OPS A MEMBER REACHES — `op=promote`, `op=resolve`,
 * `op=connect`, `op=connections&content=` and `op=connections&id=` — and never against the store,
 * with one pure section (6) for the one branch no recogniser in this plane can be made to produce
 * on demand (two mentions at DIFFERENT grades).
 *
 * WHAT IS DELIBERATELY NOT HERE: act (3), the member CHOOSING the on-point pair. It changes I5 and
 * I3 again, is RECORD + UI, and is its own row.
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { readingPositionInExtent } from "../src/textchain.mjs";
import * as CHECKS from "../checks/bio-checks.mjs";
const { checkConnectionMentionUnchosen, CONNECTION_PAIR_CHECKS } = CHECKS;

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r120", MEMBER_TOKEN: "mem-r120", PROBE_TOKEN: "prb-r120",
              AI_TOKEN: "ai-r120", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body) => rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=mem-r120`,
  { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "") => rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=mem-r120&${qs}`)).json());

const NOW = "2026-09-14T00:00:00Z", LATER = "2026-09-14T01:00:00Z";
let bseq = 0;
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Doc ${id}"`, "current_state: collected", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged", "source:", "  locator: in hand",
  "  authority: synthetic", `  retrieved: ${NOW}`, "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "A captured document.", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const promoteReading = async (captureSha, entities) => {
  const id = `INFO-2026-${String(7600 + (++bseq))}-r`; const md = infoMd(id);
  const prov = JSON.stringify({ documents: [{ capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW, entities, facts: {}, text_source: [{ step: "layer" }] } }] });
  const r = await post("promote", { bundleId: id, base: null,
    snapKey: `20260914T${String(210000 + bseq).slice(-6)}Z_${sha(String(bseq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland", title: `Doc ${id}`, current_state: "collected", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }], register: [] });
  if (r.ok === false) throw new Error(JSON.stringify(r).slice(0, 400)); return id;
};
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
let qseq = 0;
/* A member's citation of page `page` of `target` (null = the whole document), through op=promote,
   then the portion's connection grade through op=connections&content= — the read a member reaches. */
const cite = async (target, page) => {
  const n = ++qseq; const id = `INQ-2026-${7700 + n}-r`;
  const md = legMd(id, target, page);
  const q = await post("promote", { bundleId: id, base: null, snapKey: `20260914T4${String(10000 + n)}Z_cafe${String(1000 + n)}`,
    meta: { object_type: "inquiry", group: "believe-in-oakland", title: "Q", current_state: "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] });
  const cid = q.content?.[0]?.content_id;
  if (!cid) throw new Error(`no content row minted for ${id}: ${JSON.stringify(q).slice(0, 300)}`);
  return get("connections", `content=${cid}`);
};
const pg = (n) => ({ kind: "pdf-page", ref: `p.${n}`, page: n - 1, rect: null });
const counts = (g) => [g.connection_grade ?? null, g.counts?.reaching, g.counts?.undetermined, g.counts?.outside];

/* ======================= THE GROUND — M-51's fixture, plus two ======================= */
console.log("\n--- 0. the ground: M-51's two documents, a third with an unplaced mention ---");
const SA = sha("r120-A"), SB = sha("r120-B"), SC = sha("r120-C");
/* A: the ordinance on p.2 AND p.9, both grade A (M-51 exactly). */
const A = await promoteReading(SA, [
  { ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance No. 13579", source: pg(2) },
  { ref: "ordinance:13579-amended", kind: "ordinance", key: "13579-amended", label: "Ord. 13579 as amended", source: pg(9) }]);
/* B: ONE mention (p.5) — the over-strictness document. */
const B = await promoteReading(SB, [{ ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ord. No. 13,579", source: pg(5) }]);
/* C: one mention placed on p.3, a second the reading could NOT place. */
const C = await promoteReading(SC, [
  { ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance No. 13579", source: pg(3) },
  { ref: "ordinance:13579-amended", kind: "ordinance", key: "13579-amended", label: "Ord. 13579 as amended", source: null }]);
const e = await post("entitycreate", { kind: "ordinance", label: "Rent Adjustment Ordinance",
  aliases: ["ordinance:13579", "ordinance:13579-amended"] });
for (const s of [SA, SB, SC]) await post("resolve", { captureSha: s });
const resA = await get("resolutions", `sha256=${SA}`);
t("GROUND: A resolves to the one entity TWICE, both at grade A (M-51's fixture holds)",
  (resA.resolutions || []).map((r) => [r.ref, r.entity_id === e.entity_id, r.grade]).sort(),
  [["ordinance:13579", true, "A"], ["ordinance:13579-amended", true, "A"]]);
const d = await post("connect", { entityId: e.entity_id });
t("GROUND: op=connect writes three connections (A-B, A-C, B-C)", [d.ok, d.count], [true, 3]);
const conns = (await get("connections", `id=${e.entity_id}`)).connections;
const endOf = (c, s) => c.a_capture_sha === s ? { ref: c.determining_pair?.a_ref, at: c.determining_pair?.a_position?.ref }
                                              : { ref: c.determining_pair?.b_ref, at: c.determining_pair?.b_position?.ref };
const AB = conns.find((c) => [c.a_capture_sha, c.b_capture_sha].sort().join() === [SA, SB].sort().join());
t("PAIR IDENTITY: A's end of A-B keeps ordinance:13579 read at p.2 (the tie-break's winner)",
  endOf(AB, SA), { ref: "ordinance:13579", at: "p.2" });

/* ============== 1. ACT (1): p.9 UNDETERMINED, p.7 STILL OUTSIDE ============== */
console.log("\n--- 1. act (1): the citation of a real unchosen mention is UNDETERMINED, a page with none stays OUTSIDE ---");
const g9 = await cite(A, 9), g7 = await cite(A, 7);
t("page 9 of A (a genuine grade-A mention the pair did not keep): UNDETERMINED, not outside",
  counts(g9), [null, 0, 2, 0]);
const u9 = (g9.undetermined || []).find((u) => u.other_capture_sha === SB);
t("page 9: the A-B connection is undetermined under C-49.4 CONNECTION_PAIR_MENTION_UNCHOSEN",
  [u9?.code, u9?.check], ["CONNECTION_PAIR_MENTION_UNCHOSEN", CONNECTION_PAIR_CHECKS.CONNECTION_PAIR_MENTION_UNCHOSEN?.check ?? "C-49.4"]);
t("page 9: the reason NAMES the mention inside the part and where it was read",
  [(u9?.mentions || []).map((m) => [m.ref, m.position?.ref, m.inside]), /ordinance:13579-amended/.test(u9?.why ?? ""), /p\.9/.test(u9?.why ?? "")],
  [[["ordinance:13579-amended", "p.9", true]], true, true]);
t("page 9: the answer's own sentence says UNDETERMINED and says the pair was never chosen as on point",
  [/UNDETERMINED/.test(g9.why ?? ""), /strongest-graded/.test(g9.why ?? ""), /on point/.test(g9.why ?? "")], [true, true, true]);
t("page 9: it carries the canned translation (DEC-49), not machine vocabulary",
  typeof u9?.translation === "string" && u9.translation.length > 40, true);
t("page 7 of A (NO mention at all): still a definite OUTSIDE — the over-strict liar would say undetermined here",
  counts(g7), [null, 0, 0, 2]);
t("page 7: under C-49.1, unchanged", [...new Set((g7.outside || []).map((o) => o.code))], ["CONNECTION_PAIR_OUTSIDE_EXTENT"]);
t("page 7: the sentence is the pre-item one, byte for byte",
  g7.why, "all 2 of this document's connections were established by references read outside page 7, so none of them reaches this citation");
t("THE ACCEPTANCE: page 9 and page 7 no longer answer the same", JSON.stringify(counts(g9)) === JSON.stringify(counts(g7)), false);

/* ============== 2. THE TIE: page 2 is not "reached" on a tie-break ============== */
console.log("\n--- 2. the tie-break is not a basis: page 2 no longer reaches on it ---");
const g2 = await cite(A, 2);
t("page 2 of A: the pair is here, but it won only a TIE against an equal-grade mention read outside — UNDETERMINED",
  counts(g2), [null, 0, 2, 0]);
const u2 = (g2.undetermined || []).find((u) => u.other_capture_sha === SB);
t("page 2: C-49.4, naming the tied mention outside the part",
  [u2?.code, (u2?.mentions || []).map((m) => [m.ref, m.position?.ref, m.inside])],
  ["CONNECTION_PAIR_MENTION_UNCHOSEN", [["ordinance:13579-amended", "p.9", false]]]);
const gWholeA = await cite(A, null);
t("the WHOLE of A still reaches every connection it has (5.3: no part named = the whole document)",
  counts(gWholeA), ["A", 2, 0, 0]);

/* ============== 3. AN UNPLACED SECOND MENTION ============== */
console.log("\n--- 3. a second mention the reading could not place makes a definite answer unsupportable ---");
const gC6 = await cite(C, 6), gC3 = await cite(C, 3);
const uC6 = (gC6.undetermined || []).find((u) => u.other_capture_sha === SB);
t("page 6 of C (the pair is on p.3, another mention has no position): UNDETERMINED, not outside",
  [counts(gC6), uC6?.code, (uC6?.mentions || []).map((m) => [m.ref, m.position, m.inside])],
  [[null, 0, 2, 0], "CONNECTION_PAIR_MENTION_UNCHOSEN", [["ordinance:13579-amended", null, null]]]);
t("page 3 of C (the pair is here, tied with an unplaced mention that may be elsewhere): UNDETERMINED",
  [counts(gC3), (gC3.undetermined || []).every((u) => u.code === "CONNECTION_PAIR_MENTION_UNCHOSEN")],
  [[null, 0, 2, 0], true]);

/* ============== 4. OVER-STRICTNESS: a one-mention document is unchanged ============== */
console.log("\n--- 4. over-strictness: a document with ONE mention answers exactly as before ---");
const gB5 = await cite(B, 5), gB3 = await cite(B, 3);
/* The pre-item answers, captured by running THIS suite's fixture on the pristine tree (`2026-09-18`,
   `origin/main` at 694f0a7f, before any REC-120 edit) with REC120_DUMP=1. The ONLY addition the item
   makes to them is `determining_pair.selection` (act 2), which is stripped here and asserted in 5. */
const GOLDEN = {"p5":{"ok":true,"content_id":"99c0b416170a5ccab82a172178f03916bf4f070f76784ceebe959191b0a40fe0","capture_sha":"f937bdfb503b78dec20ae2dba2a40a04e6bbd7e594a9d32c1fa671f89dfa4014","bundle_id":"INFO-2026-7602-r","extent_kind":"pdf-page","ref":"page 5","stale":false,"connection_grade":"A","established":true,"needs_confirmation":false,"reaching":[{"entity_id":"ENT-2026-0001","grade":"A","side":"b","other_capture_sha":"59675bcb1d21d4c8ac64d94efb22d3662feb4943c1c806420dcead3f123133e6","other_bundle_id":"INFO-2026-7603-r","determining_pair":{"a_ref":"ordinance:13579","a_position":{"kind":"pdf-page","ref":"p.3","page":2,"rect":null},"b_ref":"ordinance:13579","b_position":{"kind":"pdf-page","ref":"p.5","page":4,"rect":null},"positioned":true,"why":"both ends record where in their document the determining reference was read"},"why":"the determining reference was read at p.5, inside page 5"},{"entity_id":"ENT-2026-0001","grade":"A","side":"b","other_capture_sha":"9045a6e93bea87eef371d622e7520569f2ddb933ee8542fe5ab2d658d6dcaf04","other_bundle_id":"INFO-2026-7601-r","determining_pair":{"a_ref":"ordinance:13579","a_position":{"kind":"pdf-page","ref":"p.2","page":1,"rect":null},"b_ref":"ordinance:13579","b_position":{"kind":"pdf-page","ref":"p.5","page":4,"rect":null},"positioned":true,"why":"both ends record where in their document the determining reference was read"},"why":"the determining reference was read at p.5, inside page 5"}],"undetermined":[],"outside":[],"counts":{"connections":2,"reaching":2,"undetermined":0,"outside":0},"limit":500,"truncated":false,"why":"2 connection(s) were established by a reference read inside page 5; the grade is the strongest of them (A), which states how that connection was established and nothing about how credible either document is"},"p3":{"ok":true,"content_id":"f3cd0641d697612a02c155e81f9b67cf82525c63c08a1786ff647ca8424db3f4","capture_sha":"f937bdfb503b78dec20ae2dba2a40a04e6bbd7e594a9d32c1fa671f89dfa4014","bundle_id":"INFO-2026-7602-r","extent_kind":"pdf-page","ref":"page 3","stale":false,"connection_grade":null,"established":false,"needs_confirmation":false,"reaching":[],"undetermined":[],"outside":[{"entity_id":"ENT-2026-0001","grade":"A","side":"b","other_capture_sha":"59675bcb1d21d4c8ac64d94efb22d3662feb4943c1c806420dcead3f123133e6","other_bundle_id":"INFO-2026-7603-r","determining_pair":{"a_ref":"ordinance:13579","a_position":{"kind":"pdf-page","ref":"p.3","page":2,"rect":null},"b_ref":"ordinance:13579","b_position":{"kind":"pdf-page","ref":"p.5","page":4,"rect":null},"positioned":true,"why":"both ends record where in their document the determining reference was read"},"code":"CONNECTION_PAIR_OUTSIDE_EXTENT","check":"C-49.1","translation":"This connection was established by a reference somewhere else in the document, not in the part you cited. A citation that points at a passage stands on what is IN that passage, so it cannot borrow a link the record found elsewhere in the same file. Cite the part where the reference actually appears, or cite the document as a whole and say so.","why":"the determining reference on end B (ordinance:13579) was read at p.5, which is outside page 3"},{"entity_id":"ENT-2026-0001","grade":"A","side":"b","other_capture_sha":"9045a6e93bea87eef371d622e7520569f2ddb933ee8542fe5ab2d658d6dcaf04","other_bundle_id":"INFO-2026-7601-r","determining_pair":{"a_ref":"ordinance:13579","a_position":{"kind":"pdf-page","ref":"p.2","page":1,"rect":null},"b_ref":"ordinance:13579","b_position":{"kind":"pdf-page","ref":"p.5","page":4,"rect":null},"positioned":true,"why":"both ends record where in their document the determining reference was read"},"code":"CONNECTION_PAIR_OUTSIDE_EXTENT","check":"C-49.1","translation":"This connection was established by a reference somewhere else in the document, not in the part you cited. A citation that points at a passage stands on what is IN that passage, so it cannot borrow a link the record found elsewhere in the same file. Cite the part where the reference actually appears, or cite the document as a whole and say so.","why":"the determining reference on end B (ordinance:13579) was read at p.5, which is outside page 3"}],"counts":{"connections":2,"reaching":0,"undetermined":0,"outside":2},"limit":500,"truncated":false,"why":"all 2 of this document's connections were established by references read outside page 3, so none of them reaches this citation"}};
const stripSel = (g) => JSON.parse(JSON.stringify(g, (k, v) => (k === "selection" ? undefined : v)));
if (process.env.REC120_DUMP) { console.log("GOLDEN " + JSON.stringify({ p5: gB5, p3: gB3 })); await mf.dispose(); process.exit(0); }
t("page 5 of B (its one mention, inside): byte-identical to the pre-item answer, less act (2)'s field",
  JSON.stringify(stripSel(gB5)), JSON.stringify(GOLDEN?.p5));
t("page 3 of B (no mention there): byte-identical to the pre-item answer, less act (2)'s field",
  JSON.stringify(stripSel(gB3)), JSON.stringify(GOLDEN?.p3));
t("…and the one-mention answers are a definite REACH at A and a definite OUTSIDE", [counts(gB5), counts(gB3)],
  [["A", 2, 0, 0], [null, 0, 0, 2]]);

/* ============== 5. ACT (2): THE PAIR SAYS WHAT IT IS ============== */
console.log("\n--- 5. act (2): the pair states it is the strongest-graded mention, with its tie-break named ---");
const sel = AB?.determining_pair?.selection;
t("op=connections&id=: determining_pair.selection states method, tie-break and that nobody chose it",
  [sel?.method, sel?.tie_break, sel?.chosen], ["strongest-graded", "first-reference-by-sort", false]);
t("selection.says names the tie-break and says the pair is NOT the on-point pair",
  [/tie/.test(sel?.says ?? ""), /not .*on point|never .*on point/.test(sel?.says ?? "")], [true, true]);
t("the row's own basis says so too (the row's account agrees with its columns)",
  /strongest-graded/.test(AB?.basis ?? ""), true);
t("the pair carried into a portion answer carries the same statement",
  u9?.determining_pair?.selection?.method, "strongest-graded");

/* ============== 6. PURE: the branch no recogniser here can produce on demand ============== */
console.log("\n--- 6. the check itself, over mentions at DIFFERENT grades ---");
const RANK = { A: 4, B: 3, C: 2, D: 1 };
const rank = (g) => RANK[g] || 0;
const chk = (pairReached, mentions, page) => checkConnectionMentionUnchosen({
  pairRef: "x", pairGrade: "A", pairReached, mentions, extentKind: "pdf-page", extent: { page: page - 1 },
  covers: readingPositionInExtent, rank })?.code ?? null;
t("pair inside, a WEAKER mention outside: the grade decided it (a stated basis), so it still REACHES",
  chk(true, [{ ref: "y", grade: "C", position: pg(9) }], 2), null);
t("pair inside, an EQUAL mention outside: a tie-break decided it, UNDETERMINED",
  chk(true, [{ ref: "y", grade: "A", position: pg(9) }], 2), "CONNECTION_PAIR_MENTION_UNCHOSEN");
t("pair outside, a WEAKER mention inside: the subject IS in the part, so not a definite outside",
  chk(false, [{ ref: "y", grade: "C", position: pg(9) }], 9), "CONNECTION_PAIR_MENTION_UNCHOSEN");
t("pair outside, every other mention placed outside too: a definite outside stands",
  chk(false, [{ ref: "y", grade: "A", position: pg(9) }], 7), null);
t("pair outside, NO other mention: nothing to say (the one-mention document)", chk(false, [], 7), null);

await mf.dispose();
console.log(`\nrec120-onpoint-undetermined: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
