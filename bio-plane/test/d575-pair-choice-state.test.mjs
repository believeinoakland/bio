/* NEGATIVE CONTROL: two arms, run 2026-09-25 by the D-575 worker, each armed ALONE on `src/store.mjs` by a driver that counts its anchor (each occurred exactly once, so each ARMED), each restored by copy from a uniquely named per-arm pristine copy and verified by sha256 AND `cmp` (pristine 72f8051f…de872ef8, 3,474,796 bytes, byte-identical after every arm). Baseline 23/0. (a) `nostate` — THE ROW'S OWN CONTROL: in `#connectionView`, `Store.#pairSelection(r.pair_rule, states)` -> `Store.#pairSelection(r.pair_rule)` (the choice state dropped from the sentence). DECLARED: every sentence assertion after the act FAILS BY NAME on the id=, sha256=, content= arms and op=connect; section 0 and every `on_point` shape assertion STAY GREEN. RESULT 14/9 AS DECLARED — section 1's two chosen-pair sentence arms on id= and on sha256=, the content= sentence arm, section 2's two lapse-sentence arms, the content= LAPSED arm and section 3 FAILED BY NAME; the `on_point` arms and the A-C over-strictness arms STAYED GREEN. `rec122-onpoint-choice.test.mjs` under the same arm: 47/1, its D-575 sentence assertion failing by name. (b) `rawchoice` — `withChoice` publishing the raw choice row (`st.a && st.a.choice`) instead of `#onPointView` (the pre-D-575 id/sha arm, which stated no lapse). DECLARED: the two `lapsed: false` arms and the two LAPSED-with-why arms FAIL; every sentence arm STAYS GREEN. RESULT 19/4 AS DECLARED. Over-strictness is held in-suite, not by an arm: a connection nobody chose on keeps REC-120's sentence byte for byte (A-C on both arms, and op=connect). Driver: the D-575 worker's scratchpad `d575-nc.py`, not committed. */
/* D-575 — A CONNECTION'S PAIR STATES THE MEMBER'S CHOICE, AND A LAPSED CHOICE SAYS SO, ON EVERY ARM.
 *
 * `Store#pairSelection` was static over the row's `pair_rule` alone, so `determining_pair.selection.says`
 * ended "…which nobody has chosen" on every connection — including one carrying a member's current
 * `on_point` beside it: the record contradicting itself about a member's act (CLAUDE.md §2). And the
 * id/sha arm of `op=connections` published `on_point` straight from the choice row, so a choice whose
 * occurrence the document no longer reads (D-454's lapse) was served there as standing; only the
 * `content=` arm said it had lapsed.
 *
 * WHAT IS ASSERTED, driven through the ops a member reaches (`op=promote`, `op=resolve`, `op=connect`,
 * `op=connectionchoose`, `op=connections` by `id=`, `sha256=` and `content=`):
 *   0. GROUND: nobody has chosen — the sentence is REC-120's, byte for byte, and no `on_point` appears.
 *   1. A CURRENT CHOICE: on the id= and sha256= arms, the chosen connection's sentence names the member,
 *      the mention and where it was read, says the OTHER end is unchosen, and no longer says "which
 *      nobody has chosen"; `on_point[side]` carries `lapsed: false`. The content= arm's sentence says the
 *      same. A connection nobody chose on keeps REC-120's sentence (over-strictness).
 *   2. A LAPSED CHOICE: a re-read drops the chosen place; the id= and sha256= arms carry `lapsed: true`
 *      and its why on `on_point[side]`, and the sentence states the lapse — as the content= arm does.
 *   3. op=connect's own answer (the third reader of the pair view) states the lapse too.
 *
 * WHAT THIS CANNOT SEE, stated: the UI's rendering of the sentence (UI-91's page suppresses it beside a
 * choice today; UI-112 owns that surface); an AMBIGUOUS pre-D-454 choice through these arms (it takes a
 * store rewritten to the old shape, which `reading-position-occurrences.test.mjs` drives on the content
 * arm; the resolution is now ONE function, `#resolvePairChoice`, for every arm).
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { readingOccurrenceKey } from "../src/textchain.mjs";

/* D-620 (stated-null sweep, corrected at the c23-batch30 union): a stated null is told from a dropped key. */
import { statedJSON } from "./stated.mjs";
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d575", MEMBER_TOKEN: "mem-d575", PROBE_TOKEN: "prb-d575",
              AI_TOKEN: "ai-d575", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-d575") => rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${tok}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs = "", tok = "mem-d575") => rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const NOBODY = /which nobody has chosen$/;
const REC120_SAYS = "each end is the strongest-graded mention of the subject in its document; between equal "
  + "grades the tie goes to the first reference by sort order, which says nothing about relevance. It is a "
  + "machine selection and not the mention on point, which nobody has chosen";

try {

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
  const id = `INFO-2026-${String(7500 + (++bseq))}-d`; const md = infoMd(id);
  const prov = JSON.stringify({ documents: [{ capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW, entities, facts: {}, text_source: [{ step: "layer" }] } }] });
  const r = await post("promote", { bundleId: id, base: null,
    snapKey: `20260925T${String(510000 + bseq).slice(-6)}Z_${sha(String(bseq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland", title: `Doc ${id}`, current_state: "collected", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }], register: [] });
  if (r.ok === false) throw new Error(JSON.stringify(r).slice(0, 400)); return id;
};
const legMd = (id, target, page) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Q ${id}"`, "current_state: open", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland",
  "references:", `  - target: ${target}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""', "recheck_triggers:", "  - text: Revisit", "    description: d.",
  "basis:", `  - target: ${target}`, "    role: supports",
  "    extent_kind: pdf-page", `    extent_page: ${page - 1}`, `    extent_ref: "page ${page}"`,
  "---", "", "## Question", "", "Q", "", "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
let qseq = 0;
const cids = new Map();
const contentOf = async (target, page) => {
  const k = `${target}#${page}`;
  if (cids.has(k)) return cids.get(k);
  const n = ++qseq; const id = `INQ-2026-${7600 + n}-d`;
  const md = legMd(id, target, page);
  const q = await post("promote", { bundleId: id, base: null, snapKey: `20260925T6${String(10000 + n)}Z_d575${String(1000 + n)}`,
    meta: { object_type: "inquiry", group: "believe-in-oakland", title: "Q", current_state: "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] });
  const cid = q.content?.[0]?.content_id;
  if (!cid) throw new Error(`no content row minted for ${id}: ${JSON.stringify(q).slice(0, 300)}`);
  cids.set(k, cid); return cid;
};
const pg = (n) => ({ kind: "pdf-page", ref: `p.${n}`, page: n - 1, rect: null });
const ORD = { ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance No. 13579" };
const SA = sha("d575-A"), SB = sha("d575-B"), SC = sha("d575-C");
const A = await promoteReading(SA, [{ ...ORD, source: pg(3), occurrences: [pg(3), pg(9), pg(14)] }]);
await promoteReading(SB, [{ ...ORD, source: pg(5) }]);
await promoteReading(SC, [{ ...ORD, source: pg(2) }]);
const ent = await post("entitycreate", { kind: "ordinance", label: "Rent Adjustment Ordinance", aliases: [ORD.ref] });
const E = ent.entity_id;
for (const s of [SA, SB, SC]) await post("resolve", { captureSha: s });
const d = await post("connect", { entityId: E });
console.log(`  corpus: 3 documents, op=connect wrote ${d.count} connection(s)`);
t("GROUND: op=connect writes the three connections A-B, A-C, B-C (floored, non-empty)", [d.ok, d.count], [true, 3]);

const pair = (x, s1, s2) => (x?.connections || []).find((c) =>
  [c.a_capture_sha, c.b_capture_sha].sort().join() === [s1, s2].sort().join());
const says = (c) => c?.determining_pair?.selection?.says ?? null;
const sideOf = (c, s) => (c?.a_capture_sha === s ? "a" : "b");
const byId = () => get("connections", `id=${E}`);
const bySha = () => get("connections", `sha256=${SA}`);
const byContent = async (page, otherSha) => {
  const g = await get("connections", `content=${await contentOf(A, page)}`);
  for (const k of ["reaching", "undetermined", "outside"]) {
    const e = (g?.[k] || []).find((x) => x.other_capture_sha === otherSha);
    if (e) return [k, e];
  }
  return [null, null];
};

/* ======================= 0. GROUND: NOBODY HAS CHOSEN ======================= */
console.log("\n--- 0. nobody has chosen: REC-120's sentence byte for byte, no on_point ---");
const id0 = await byId(), sha0 = await bySha();
t("id= arm: every connection's sentence is REC-120's, byte for byte",
  (id0.connections || []).map(says), [REC120_SAYS, REC120_SAYS, REC120_SAYS]);
t("sha256= arm: A's two connections the same, and neither carries on_point",
  [(sha0.connections || []).map(says), (sha0.connections || []).map((c) => "on_point" in c)],
  [[REC120_SAYS, REC120_SAYS], [false, false]]);
const [, c0] = await byContent(9, SB);
t("content= arm: the pair's sentence is REC-120's", says(c0), REC120_SAYS);

/* ======================= 1. A CURRENT CHOICE IS NAMED ======================= */
console.log("\n--- 1. a member chooses A's p.9 on A-B: the sentence names the choice on every arm ---");
const add = await post("memberadd", { memberId: "ines", cover: "cover for ines", role: "admin",
                                      capabilities: ["contribute", "publish"] }, "adm-d575");
const en = await post("enroll", { invite: add.invite, handle: "ines", password: "ines-passphrase-1" });
const INES = (await post("login", { role: "member:ines", password: "ines-passphrase-1" })).token;
t("FIXTURE: a member is enrolled and signed in", [!!en.ok, typeof INES === "string"], [true, true]);
const chose = await post("connectionchoose", { capture: SA, other: SB, entity: E, ref: ORD.ref,
                                               occurrence: readingOccurrenceKey(pg(9)) }, INES);
t("the act records A's p.9 occurrence", [chose.ok, chose.wrote, chose.chosen?.position?.ref], [true, true, "p.9"]);
const who = chose.chosen?.chosen_by ?? chose.chosen_by ?? "";
console.log(`  chosen_by: ${JSON.stringify(who)}`);
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const namesChoice = (c, side) => new RegExp(`on end ${side} a member \\(${esc(who)}\\) chose ordinance:13579 \\(read at p\\.9\\) as the mention on point`).test(says(c) ?? "");
for (const [arm, read] of [["id=", byId], ["sha256=", bySha]]) {
  const x = await read();
  const ab = pair(x, SA, SB), ac = pair(x, SA, SC);
  const sa = sideOf(ab, SA), sb = sa === "a" ? "b" : "a";
  t(`${arm} arm: THE CHOSEN PAIR'S SENTENCE NAMES THE CHOICE (member, mention, place) and not "which nobody has chosen"`,
    [namesChoice(ab, sa), NOBODY.test(says(ab) ?? "")], [true, false]);
  t(`${arm} arm: …and says the other end is unchosen`, new RegExp(`on end ${sb} nobody has chosen(;|$)`).test(says(ab) ?? ""), true);
  t(`${arm} arm: on_point on A's end is the choice, lapsed: false; the other end null`,
    [ab?.on_point?.[sa]?.ref, ab?.on_point?.[sa]?.occurrence === readingOccurrenceKey(pg(9)), ab?.on_point?.[sa]?.lapsed, ab?.on_point?.[sb]],
    [ORD.ref, true, false, null]);
  t(`${arm} arm: OVER-STRICTNESS — A-C, which nobody chose on, keeps REC-120's sentence byte for byte and no on_point`,
    [says(ac), ac && "on_point" in ac], [REC120_SAYS, false]);
  t(`${arm} arm: the machine's pair is unchanged (chosen: false; A's end still the first read, p.3)`,
    [ab?.determining_pair?.selection?.chosen, ab?.determining_pair?.[`${sa}_position`]?.ref], [false, "p.3"]);
}
const [k9, c9] = await byContent(9, SB);
t("content= arm: page 9 reaches from the choice, and the pair's sentence names it too",
  [k9, c9?.on_point?.position?.ref, namesChoice(c9, c9?.side), NOBODY.test(says(c9) ?? "")], ["reaching", "p.9", true, false]);

/* ======================= 2. A LAPSED CHOICE SAYS SO ======================= */
console.log("\n--- 2. a re-read drops p.9: every arm states the lapse with its why ---");
await promoteReading(SA, [{ ...ORD, source: pg(3), occurrences: [pg(3), pg(14)] }]);
const LAPSE_WHY = /no longer carries it at that place for this subject/;
for (const [arm, read] of [["id=", byId], ["sha256=", bySha]]) {
  const x = await read();
  const ab = pair(x, SA, SB), sa = sideOf(ab, SA);
  const op = ab?.on_point?.[sa];
  t(`${arm} arm: THE LAPSED CHOICE READS LAPSED WITH ITS WHY on on_point[A's end], naming the place it chose`,
    [op?.lapsed, LAPSE_WHY.test(op?.why ?? ""), op?.ref, op?.occurrence === readingOccurrenceKey(pg(9)), op?.chosen_by === who],
    [true, true, ORD.ref, true, true]);
  t(`${arm} arm: …and the pair's sentence states the lapse, with its why, not "which nobody has chosen"`,
    [new RegExp(`on end ${sa} a member \\(${esc(who)}\\) chose ordinance:13579 as the mention on point, and that choice has LAPSED: `).test(says(ab) ?? ""),
     LAPSE_WHY.test(says(ab) ?? ""), NOBODY.test(says(ab) ?? "")], [true, true, false]);
}
const [k9l, c9l] = await byContent(9, SB);
t("content= arm: the entry's on_point is lapsed (D-454's shape) and the pair's sentence says LAPSED too",
  [k9l === "reaching", c9l?.on_point?.lapsed, /that choice has LAPSED/.test(says(c9l) ?? "")], [false, true, true]);

/* ======================= 3. op=connect's OWN ANSWER ======================= */
console.log("\n--- 3. re-deriving: op=connect's answer (the third reader of the pair view) states the lapse ---");
const d2 = await post("connect", { entityId: E });
const ab2 = pair(d2, SA, SB);
t("op=connect: the A-B pair's sentence states the lapsed choice; A-C's stays REC-120's",
  [/that choice has LAPSED/.test(says(ab2) ?? ""), says(pair(d2, SA, SC))], [true, REC120_SAYS]);

} catch (err) {
  console.log(`  FAIL  the suite threw before its foot: ${err && err.stack || err}`);
  fail++;
}
await mf.dispose();
console.log(`\nd575-pair-choice-state: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
