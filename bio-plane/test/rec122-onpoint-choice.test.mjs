/* NEGATIVE CONTROL: three arms, each armed ALONE on `src/store.mjs` by a harness that counts its anchor (each occurred exactly once, so each ARMED), each restored by `cp` from a uniquely named copy set aside and verified by sha256 AND `cmp` (pristine 9f37f5c3…51b213ca, 2,916,775 bytes, byte-identical after every arm; never `git checkout --`). Baseline 47/0. (a) `ignored` — in `connectionGradeForContent`, `const mine = choices[side];` -> `const mine = null;` (the READ ignores the stored choice, the liar's first route): DECLARED to fail every read-after-the-act assertion and nothing before the act. RESULT 37/10 AS DECLARED — page 9 REACHES, its grade, its reason, page 2 OUTSIDE and its reason, both 3b rows, both read-follows rows of section 5 and section 6's C-49.2 FAILED BY NAME; sections 0-2, the act's own returns, section 4 (the connections read publishes the choice through a different path) and sections 7-8 STAYED GREEN. (b) `machine` — in `chooseConnectionPair`, `if (!who || isMachineIdentity(who))` -> `if (!who)` (a machine credential allowed to choose): DECLARED to fail the four C-74.1 refusal arms, the translation arm and the read-unmoved arm, and downstream the assertions naming the member as chooser (the member TOKEN's choice lands first). RESULT 37/10 AS DECLARED — all six FAILED BY NAME, plus the four chooser assertions (`wrote`, `chosen_by` on the reach, on `on_point`, and on the superseded row). (c) `default` — `const mine = choices[side] || <the machine's pair ref>` (the liar's cheapest green: the strongest-graded mention stands as chosen for everyone): DECLARED to fail section 1's two UNDETERMINED arms and its no-`on_point` arm, section 3's A-C-nobody-chose arm, section 6's C-A arm and section 7's two byte-identity arms. RESULT 43/4, NOT AS DECLARED, and the arm was right: section 1's p.9 and p.2 arms, the no-`on_point` arm and the A-C arm FAILED BY NAME, while section 6's C-A arm and section 7's two byte-identity arms STAYED GREEN — each compares against a figure taken EARLIER IN THE SAME RUN, which the arm changes too, so a within-run golden cannot see an arm that moves both sides. The same arm run against `rec120-onpoint-undetermined.test.mjs`, whose one-mention golden was taken on the pristine tree, went 16/13 with page 5 and page 3 of B FAILING BY NAME — so the byte-identity half of this row's acceptance is held by REC-120's suite and not by this one, recorded here rather than re-worded after the fact. */

/* REC-122 / D-161 act (3) / IC-232 — A MEMBER CHOOSES THE ON-POINT MENTION OF A CONNECTION, AND THE
 * READ ANSWERS FROM THE CHOICE.
 *
 * REC-120 made every portion answer that rested on the machine's strongest-graded pair among several
 * mentions honestly UNDETERMINED (C-49.4). This is the act that settles it where a member has
 * established which mention is on point (Bob's 5.4 second pass: specificity is worked for).
 *
 * HOW A LIAR WOULD SATISFY THIS, stated before what it checks. (1) A choice the READ ignores: the act
 * answers ok and records a row, and `op=connections&content=` still answers REC-120's UNDETERMINED — so
 * every assertion here is on the READ after the act, never on the act's own return alone. (2) A default
 * that lets the strongest-graded mention stand as chosen for everyone: every answer definite again and
 * REC-120's overclaim back, wearing a member's name — so section 1 asserts that WITHOUT a choice p.9 is
 * still UNDETERMINED, and section 3 that a connection not chosen on stays UNDETERMINED beside one that
 * was. (3) A choice a machine or a bearer could make — so the member TOKEN, the PROBE token and an
 * `ai` credential are each refused C-74.1 BY NAME, and the read is shown unmoved by their attempts.
 *
 * EVERYTHING IS DRIVEN THROUGH THE OPS a member reaches — `op=promote`, `op=resolve`, `op=connect`,
 * `op=connectionchoose`, `op=connections&content=` and `op=connections&id=` — the act under a SIGNED-IN
 * member's session, because the act refuses every machine shape and a suite driving it under a token
 * would drive only the refusal.
 *
 * WHAT THIS CANNOT SEE, stated: (a) a chosen mention at a DIFFERENT grade from the other mentions — no
 * recogniser in this plane can be made to produce two grades in one capture on demand (REC-120's section
 * 6 has the same limit), so the composed-grade rule (the CHOSEN mention's grade, weaker-of-two with the
 * other end) is asserted only where both are A; (b) the `reading_refs` single-position limit — one
 * position per (capture, reference string), so the same string read on several pages is ONE mention and
 * a member cannot choose between its occurrences. That is a precondition of the schema (FW-17's
 * `INSERT OR REPLACE`), not something this act can fix or detect; section 7 pins what the act DOES see
 * (it names mentions by reference, and each reference has exactly one position).
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { CONNECTION_CHOICE_CHECKS, CONNECTION_PAIR_CHECKS } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r122", MEMBER_TOKEN: "mem-r122", PROBE_TOKEN: "prb-r122",
              AI_TOKEN: "ai-r122", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r122") => rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${tok}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs = "", tok = "mem-r122") => rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
/* NULL-TOLERANT, so an arm that breaks the answer's shape NAMES the assertions it broke. */
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;

try {

/* ------------------------------------------------------------------ a signed-in member */
const add = await post("memberadd", { memberId: "ruth", cover: "cover for ruth", role: "admin",
                                      capabilities: ["contribute", "publish"] }, "adm-r122");
const en = await post("enroll", { invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" });
const lg = await post("login", { role: "member:ruth", password: "ruth-passphrase-1" });
const RUTH = lg.token;
t("FIXTURE: a member is enrolled and signed in", [!!en.ok, typeof RUTH === "string"], [true, true]);

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
  const id = `INFO-2026-${String(8600 + (++bseq))}-r`; const md = infoMd(id);
  const prov = JSON.stringify({ documents: [{ capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW, entities, facts: {}, text_source: [{ step: "layer" }] } }] });
  const r = await post("promote", { bundleId: id, base: null,
    snapKey: `20260914T${String(310000 + bseq).slice(-6)}Z_${sha(String(bseq)).slice(0, 8)}`,
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
/* A citation of page `page` of `target` mints (or re-uses) that page's content row, once per (target, page). */
const cids = new Map();
let qseq = 0;
const contentOf = async (target, page) => {
  const k = `${target}#${page}`;
  if (cids.has(k)) return cids.get(k);
  const n = ++qseq; const id = `INQ-2026-${8700 + n}-r`;
  const md = legMd(id, target, page);
  const q = await post("promote", { bundleId: id, base: null, snapKey: `20260914T5${String(10000 + n)}Z_beef${String(1000 + n)}`,
    meta: { object_type: "inquiry", group: "believe-in-oakland", title: "Q", current_state: "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] });
  const cid = q.content?.[0]?.content_id;
  if (!cid) throw new Error(`no content row minted for ${id}: ${JSON.stringify(q).slice(0, 300)}`);
  cids.set(k, cid); return cid;
};
/* The READ a member reaches: a portion's connection grade. */
const grade = async (target, page) => get("connections", `content=${await contentOf(target, page)}`);
const pg = (n) => ({ kind: "pdf-page", ref: `p.${n}`, page: n - 1, rect: null });
const counts = (g) => [g?.connection_grade ?? null, g?.counts?.reaching, g?.counts?.undetermined, g?.counts?.outside];
const entryFor = (g, otherSha) => ["reaching", "undetermined", "outside"]
  .map((k) => [k, (g?.[k] || []).find((e) => e.other_capture_sha === otherSha)]).find(([, e]) => e) || [null, null];

/* ======================= 0. THE GROUND — M-51's fixture (REC-120's, re-used) ======================= */
console.log("\n--- 0. the ground: A mentions the ordinance on p.2 AND p.9 (both A), B once, C once placed + once unplaced ---");
const SA = sha("r122-A"), SB = sha("r122-B"), SC = sha("r122-C");
const A = await promoteReading(SA, [
  { ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance No. 13579", source: pg(2) },
  { ref: "ordinance:13579-amended", kind: "ordinance", key: "13579-amended", label: "Ord. 13579 as amended", source: pg(9) }]);
const B = await promoteReading(SB, [{ ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ord. No. 13,579", source: pg(5) }]);
const C = await promoteReading(SC, [
  { ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance No. 13579", source: pg(3) },
  { ref: "ordinance:13579-amended", kind: "ordinance", key: "13579-amended", label: "Ord. 13579 as amended", source: null }]);
const ent = await post("entitycreate", { kind: "ordinance", label: "Rent Adjustment Ordinance",
  aliases: ["ordinance:13579", "ordinance:13579-amended"] });
const E = ent.entity_id;
for (const s of [SA, SB, SC]) await post("resolve", { captureSha: s });
const d = await post("connect", { entityId: E });
t("GROUND: op=connect writes three connections (A-B, A-C, B-C)", [d.ok, d.count], [true, 3]);
const connsBefore = await get("connections", `id=${E}`);
const AB0 = (connsBefore.connections || []).find((c) => [c.a_capture_sha, c.b_capture_sha].sort().join() === [SA, SB].sort().join());
const aEnd = (c) => (c?.a_capture_sha === SA ? { ref: c?.determining_pair?.a_ref } : { ref: c?.determining_pair?.b_ref });
t("GROUND: the machine's pair keeps ordinance:13579 (p.2) on A's end of A-B, chosen: false",
  [aEnd(AB0).ref, AB0?.determining_pair?.selection?.chosen], ["ordinance:13579", false]);

/* ======================= 1. WITHOUT A CHOICE: REC-120's answers stand ======================= */
console.log("\n--- 1. no choice made: every answer is REC-120's (the liar's default would make them definite) ---");
const g9pre = await grade(A, 9), g2pre = await grade(A, 2), g7pre = await grade(A, 7);
const gB5pre = await grade(B, 5), gB3pre = await grade(B, 3), gC6pre = await grade(C, 6);
const gWholePre = await grade(A, null);
t("page 9 of A with no choice: UNDETERMINED under C-49.4, not reached", [counts(g9pre),
  [...new Set((g9pre.undetermined || []).map((u) => u.code))]], [[null, 0, 2, 0], ["CONNECTION_PAIR_MENTION_UNCHOSEN"]]);
t("page 2 of A with no choice: UNDETERMINED (a tie-break is not a basis)", counts(g2pre), [null, 0, 2, 0]);
t("page 7 of A with no choice: a definite OUTSIDE (it never mentions the subject)", counts(g7pre), [null, 0, 0, 2]);
t("no connection carries `on_point` while nobody has chosen (the read is REC-120's, byte for byte)",
  (connsBefore.connections || []).map((c) => "on_point" in c), [false, false, false]);
t("…and no portion entry carries one either",
  [g9pre, g2pre, g7pre].flatMap((g) => [...g.reaching, ...g.undetermined, ...g.outside]).some((e) => "on_point" in e), false);

/* ======================= 2. WHO MAY CHOOSE, AND WHAT ======================= */
console.log("\n--- 2. refusals: a machine or bearer, a connection that is not there, a mention the document does not carry ---");
const choice = (tok, body) => post("connectionchoose", { capture: SA, other: SB, entity: E, ...body }, tok);
const byMemberToken = await choice("mem-r122", { ref: "ordinance:13579-amended" });
t("the MEMBER deploy token (a bearer, stamped token:member) is refused C-74.1 BY NAME",
  [codeOf(byMemberToken), byMemberToken?.check], ["CONNECTION_CHOICE_NOT_A_MEMBER", CONNECTION_CHOICE_CHECKS.CONNECTION_CHOICE_NOT_A_MEMBER.check]);
const byProbe = await choice("prb-r122", { ref: "ordinance:13579-amended" });
t("the PROBE token is refused C-74.1 BY NAME", codeOf(byProbe), "CONNECTION_CHOICE_NOT_A_MEMBER");
const byAdminToken = await choice("adm-r122", { ref: "ordinance:13579-amended" });
t("the ADMIN deploy token is refused C-74.1 BY NAME (a token is not a person)", codeOf(byAdminToken), "CONNECTION_CHOICE_NOT_A_MEMBER");
const bySpoof = await post("connectionchoose", { capture: SA, other: SB, entity: E, ref: "ordinance:13579-amended",
                                                 author: "ruth" }, "mem-r122");
t("a bearer that NAMES a member in the body is still refused — the name is the control plane's stamp",
  codeOf(bySpoof), "CONNECTION_CHOICE_NOT_A_MEMBER");
t("the refusal carries its canned translation (DEC-49)",
  byMemberToken?.translation, CONNECTION_CHOICE_CHECKS.CONNECTION_CHOICE_NOT_A_MEMBER.translation);
const noMention = await choice(RUTH, { ref: "ordinance:99999" });
t("a mention the document does not carry is refused C-74.3 BY NAME", [codeOf(noMention), noMention?.check],
  ["CONNECTION_CHOICE_NOT_A_MENTION", "C-74.3"]);
const otherDocsMention = await post("connectionchoose", { capture: SB, other: SA, entity: E, ref: "ordinance:13579-amended" }, RUTH);
t("a reference another document carries, but THIS one does not, is refused C-74.3 (B has no -amended mention)",
  codeOf(otherDocsMention), "CONNECTION_CHOICE_NOT_A_MENTION");
const noRef = await choice(RUTH, {});
t("no ref at all is refused C-74.3", codeOf(noRef), "CONNECTION_CHOICE_NOT_A_MENTION");
const noConn = await post("connectionchoose", { capture: SA, other: sha("nobody"), entity: E, ref: "ordinance:13579" }, RUTH);
t("a connection the record does not hold is refused C-74.2 BY NAME", [codeOf(noConn), noConn?.check],
  ["CONNECTION_CHOICE_NO_CONNECTION", "C-74.2"]);
const wrongEntity = await choice(RUTH, { entity: "ENT-2026-9999", ref: "ordinance:13579" });
t("a subject the two documents are not connected through is refused C-74.2", codeOf(wrongEntity), "CONNECTION_CHOICE_NO_CONNECTION");
t("after every refusal the read has NOT moved: page 9 is still UNDETERMINED",
  JSON.stringify(await grade(A, 9)), JSON.stringify(g9pre));

/* ======================= 3. THE ACT, THEN THE READ ======================= */
console.log("\n--- 3. a member chooses the p.9 mention on A's end of A-B: p.9 REACHES at A, p.2 is OUTSIDE ---");
const chose = await choice(RUTH, { ref: "ordinance:13579-amended" });
t("op=connectionchoose as a signed-in member: recorded, on end A, in the member's name",
  [chose.ok, chose.wrote, chose.side, chose.chosen?.ref, chose.chosen?.position?.ref, chose.chosen?.chosen_by],
  [true, true, SA < SB ? "a" : "b", "ordinance:13579-amended", "p.9", "ruth"]);
t("the act says the machine's pair is kept beside the choice, unchanged", chose.machine_pair_ref, "ordinance:13579");
const g9 = await grade(A, 9);
const [k9, e9] = entryFor(g9, SB);
t("THE ACCEPTANCE: page 9 of A now REACHES through A-B, at grade A", [k9, e9?.grade], ["reaching", "A"]);
t("page 9: the reach names the member's choice and where the mention was read",
  [e9?.on_point?.ref, e9?.on_point?.position?.ref, e9?.on_point?.chosen_by, /chose ordinance:13579-amended/.test(e9?.why ?? ""), /p\.9/.test(e9?.why ?? "")],
  ["ordinance:13579-amended", "p.9", "ruth", true, true]);
t("page 9's connection grade is A (the chosen mention's grade, weaker-of-two with B's end)", g9.connection_grade, "A");
const [kAC9, eAC9] = entryFor(g9, SC);
t("page 9: A-C, which NOBODY chose on, is still UNDETERMINED under C-49.4 — a choice is per connection, never a default",
  [kAC9, eAC9?.code], ["undetermined", "CONNECTION_PAIR_MENTION_UNCHOSEN"]);
const g2 = await grade(A, 2);
const [k2, e2] = entryFor(g2, SB);
t("THE ACCEPTANCE: page 2 of A (the machine pair's own page) is now a definite OUTSIDE for A-B, under C-49.1",
  [k2, e2?.code, e2?.check], ["outside", "CONNECTION_PAIR_OUTSIDE_EXTENT", CONNECTION_PAIR_CHECKS.CONNECTION_PAIR_OUTSIDE_EXTENT.check]);
t("page 2: the outside names the member's choice and that it was read at p.9",
  [/chose ordinance:13579-amended/.test(e2?.why ?? ""), /p\.9/.test(e2?.why ?? "")], [true, true]);
const g7 = await grade(A, 7);
t("page 7 (no mention): still a definite OUTSIDE on both connections", counts(g7), [null, 0, 0, 2]);
const gWhole = await grade(A, null);
t("the WHOLE of A answers exactly as before the choice (no part named = every mention is inside)",
  JSON.stringify(gWhole), JSON.stringify(gWholePre));
t("…and reaches both connections at A", counts(gWhole), ["A", 2, 0, 0]);

console.log("\n--- 3b. choosing on A-C too makes every A answer definite ---");
const choseAC = await post("connectionchoose", { capture: SA, other: SC, entity: E, ref: "ordinance:13579-amended" }, RUTH);
t("the A-C choice is recorded", [choseAC.ok, choseAC.wrote], [true, true]);
t("page 9 of A: both connections REACH, grade A", counts(await grade(A, 9)), ["A", 2, 0, 0]);
t("page 2 of A: both connections are a definite OUTSIDE", counts(await grade(A, 2)), [null, 0, 0, 2]);

/* ======================= 4. THE CONNECTIONS READ PUBLISHES THE CHOICE ======================= */
console.log("\n--- 4. op=connections&id= publishes the choice BESIDE the machine's pair ---");
const connsAfter = await get("connections", `id=${E}`);
const AB1 = (connsAfter.connections || []).find((c) => c.a_capture_sha === AB0?.a_capture_sha && c.b_capture_sha === AB0?.b_capture_sha);
const sideA = SA < SB ? "a" : "b", sideB = sideA === "a" ? "b" : "a";
t("A-B carries on_point: A's end chosen by the member, B's end unchosen",
  [AB1?.on_point?.[sideA]?.ref, AB1?.on_point?.[sideA]?.chosen_by, AB1?.on_point?.[sideB]], ["ordinance:13579-amended", "ruth", null]);
t("…and its determining_pair is STILL the machine's, stated unchosen",
  [aEnd(AB1).ref, AB1?.determining_pair?.selection?.chosen], ["ordinance:13579", false]);
const BC1 = (connsAfter.connections || []).find((c) => [c.a_capture_sha, c.b_capture_sha].sort().join() === [SB, SC].sort().join());
t("B-C, which nobody chose on, carries no on_point", BC1 && "on_point" in BC1, false);

/* ======================= 5. RE-CHOOSING RETAINS THE OLD ======================= */
console.log("\n--- 5. a re-choice supersedes and retains; the same choice twice writes nothing ---");
const same = await choice(RUTH, { ref: "ordinance:13579-amended" });
t("choosing the same mention again writes nothing and says so", [same.ok, same.wrote, same.superseded], [true, false, null]);
const rechose = await choice(RUTH, { ref: "ordinance:13579" });
t("re-choosing the p.2 mention: recorded, and the answer names the p.9 choice it superseded",
  [rechose.wrote, rechose.superseded?.ref, rechose.superseded?.chosen_by], [true, "ordinance:13579-amended", "ruth"]);
t("…and the READ follows: page 2 of A now REACHES through A-B", entryFor(await grade(A, 2), SB)[0], "reaching");
t("…and page 9 of A is now a definite OUTSIDE for A-B", entryFor(await grade(A, 9), SB)[0], "outside");

/* ======================= 6. A CHOSEN MENTION THE READING COULD NOT PLACE ======================= */
console.log("\n--- 6. a chosen mention with no position is UNDETERMINED under C-49.2, never reached or outside ---");
const choseC = await post("connectionchoose", { capture: SC, other: SB, entity: E, ref: "ordinance:13579-amended" }, RUTH);
t("choosing C's UNPLACED mention is allowed (the document carries it) and says the reading did not record where",
  [choseC.ok, choseC.chosen?.position, /did not record where/.test(choseC.says ?? "")], [true, null, true]);
const gC6 = await grade(C, 6);
const [kC6, eC6] = entryFor(gC6, SB);
t("page 6 of C through C-B: UNDETERMINED under C-49.2 (the choice is known, where it was read is not)",
  [kC6, eC6?.code, eC6?.on_point?.ref], ["undetermined", "CONNECTION_PAIR_UNPLACED", "ordinance:13579-amended"]);
const [kC6A] = entryFor(gC6, SA);
t("page 6 of C through C-A (not chosen): still REC-120's C-49.4", [kC6A, entryFor(gC6, SA)[1]?.code],
  [entryFor(gC6pre, SA)[0], entryFor(gC6pre, SA)[1]?.code]);

/* ======================= 7. OVER-STRICTNESS: a document nobody chose on is unchanged ======================= */
console.log("\n--- 7. over-strictness: B's own portion answers are byte-identical (its end was never chosen) ---");
t("page 5 of B: byte-identical to its answer before any choice", JSON.stringify(await grade(B, 5)), JSON.stringify(gB5pre));
t("page 3 of B: byte-identical to its answer before any choice", JSON.stringify(await grade(B, 3)), JSON.stringify(gB3pre));
t("the act names mentions by reference, and each reference has ONE position (reading_refs' limit, pinned not fixed)",
  chose.chosen?.position?.ref, "p.9");

/* ======================= 8. PURGE TAKES THE CHOICES ======================= */
console.log("\n--- 8. a whole-store purge proves it took the choices (D-113) ---");
const pu = await get("purge", "confirm=bio", "adm-r122");
if (process.env.REC122_DUMP) console.log("PURGE " + JSON.stringify(pu).slice(0, 3000));
t("op=purge counted and took all four choice rows (three current, one superseded and retained until now)",
  [pu?.removed?.connectionPairChoices, pu?.after?.connectionPairChoices], [4, 0]);

} catch (err) {
  console.log(`  FAIL  the suite threw before its foot: ${err && err.stack || err}`);
  fail++;
}
await mf.dispose();
console.log(`\nrec122-onpoint-choice: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
