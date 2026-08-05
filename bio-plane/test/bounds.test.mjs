/* NEGATIVE CONTROL: (run 2026-08-05, rec57-agent) FOUR arms, each RUN. (1) DROP THE PUBLISHED BOUND — in src/store.mjs delete `limit: cap,` from any roster op's return block (e.g. taskList) -> the LIVE arm for that op fails naming it and what a consumer can no longer tell. (2) COUNT WHAT IT SENT — in documentsNamingEntity replace `truncated: merged.length > cap || aliasPageFilled` with `truncated: false` (the pre-REC-57 behaviour: `count` is the length of what was SENT and nothing says more exists) -> the DELTA arm fails, because a bitten call and a complete call read alike. (3) NEUTER THE ROSTER WALK — replace the body of `cappedMethods` with `return new Map()` -> the three REACH assertions fail AS DELTAS and the roster-vs-driven pin fails. (4) OVER-STRICTNESS — a correct answer phrased unlike anything this file wrote must not fail; asserted in the last block. */
/* REC-57 · EVERY CAPPED OP PUBLISHES THE BOUND IT APPLIED, AND WHETHER IT BIT.
 * ============================================================================
 *
 * UI-39 measured this one layer up: a plane that caps and does not say so forces
 * every consumer to guess or to author its own bound. It named two ops. THE
 * ITEM IS NOT THE TWO OPS — it is the CLASS, so the roster is read off
 * `store.mjs`/`query.mjs` here rather than listed, and the list UI-39 could see
 * is the smaller half of it.
 *
 * WHY THIS IS NOT COSMETIC. The consumer is a COMPLETENESS CLAIM in every case.
 * UI-25 existed because a member with more than 500 hits could cite only the
 * first 500 into a case and nothing said so. `op=audit` publishes `ok` over ONE
 * PAGE; `op=exportlog` shows an administrator the newest 200 rows of a log the
 * export manifest describes to them as append-only and complete. A count of what
 * was SENT and a count of what EXISTS are different claims, and a producer that
 * publishes only the first has said the second.
 *
 * THE TWO QUESTIONS A CAPPED ANSWER MUST SETTLE, and they are separate:
 *   (1) WHAT BOUND DID YOU APPLY?  -> `limit`, the cap AFTER clamping. Never the
 *       number the caller asked for: answering 5000 to a caller who asked 5000
 *       and got 500 is a second way of lying about the same fact.
 *   (2) IS THIS ALL OF IT?         -> whatever this op already says it with.
 *
 * (2) IS DELIBERATELY NOT ONE WORD, and that is the REC-55 rule rather than
 * sloppiness. The plane already answers it in four spellings, each of which
 * gives the caller something a bare flag would not: `truncated` (op=queue),
 * `cursor` (op=audit, op=list, op=searchindexcheck — non-null means "more, and
 * resume HERE"), `remaining` (op=taskdrain, op=reproject — "run me again, this
 * many left"), and `total` beside `limit`/`offset` (op=search, which had this
 * right all along and is the model the rest were brought to). Minting a fifth
 * word and pasting it beside the four would be two spellings of one fact, which
 * is the drift REC-55 explicitly declined to add. So this suite asserts the
 * PROPERTY — a caller can tell "this is all of it" from "this is the first N" —
 * and reads each op in its own vocabulary.
 *
 * WHAT WAS ACTUALLY WRONG, per op, measured and not assumed. Five published no
 * bound and no truncation signal at all (`readingname`, `tasks`, `exportlog`,
 * `reindexnames`, and the orphan list inside `searchindexcheck`); five published
 * the truncation signal and not the bound (`queue`, `audit`, `list`,
 * `taskdrain`, `reproject`, `searchindexcheck`'s page); one — `search` — was
 * already right. Nothing that already published a fact had a second spelling of
 * it added.
 *
 * THE WALK, AND WHY IT IS WIDER THAN UI-39'S. UI-39 found FOUR capped ops. It
 * matched a dispatch entry only when the entry forwarded `limit:` inside a
 * 400-character window, and four of these ops pass `body || {}` instead, so they
 * were invisible to it; and it looked only for a `limit = N` parameter default,
 * so a cap that lived in a named constant or a SQL literal was invisible too.
 * The walk here matches on the METHOD NAME off the dispatch and recognises four
 * cap shapes. It finds ELEVEN. The detector was widened rather than the source
 * reworded to suit it.
 *
 * THE WALK RUNS ON CODE, NOT ON PROSE, AND THIS COST A DRAFT. The first version
 * matched `LIMIT 200` inside a COMMENT THIS VERY ITEM HAD JUST WRITTEN and
 * reported two methods as capped that carry no cap at all — UI-35's class,
 * reproduced inside the instrument built to prevent it. Block comments are
 * blanked before any anchor is matched, and the blanking is itself guarded in
 * BOTH directions: a known code line must survive it and a known prose line must
 * not.
 *
 * REACH IS ASSERTED AS A DELTA, THREE TIMES. A walk that matches nothing reports
 * zero and passes forever; REC-56 neutered its own walk and found all five
 * direct judgements passing at zero cost over an empty corpus. So the corpus
 * size is PRINTED every run, and each walk is re-run over a MECHANICALLY BROKEN
 * copy of the same source and must find FEWER. The difference is the evidence.
 *
 * AND THE ROSTER DRIVES THE LIVE ARMS. The set of ops this file exercises is
 * asserted EQUAL to the set the walk found, so an op that grows a cap tomorrow
 * fails this suite until somebody drives it. That pin is what stops the live
 * half from silently covering less than the sweep claims.
 *
 * WHAT THIS SUITE DOES NOT MEASURE, stated so nobody trusts it for more. It
 * sweeps ops whose answer is bounded by a COUNT. It says nothing about an answer
 * bounded some other way (a depth walk, a gate, a time window), and `op=queue`'s
 * ancestor walk is bounded by depth and reports `undetermined` on its own terms.
 * One roster op — `op=projection` — answers its capped arms with a BARE ARRAY,
 * which can carry no key at all; that is measured, named, pinned to exactly one
 * op, and filed as IC-23, because it cannot be fixed additively.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ==========================================================================
 * WALK — THE ROSTER OF CAPPED OPS, READ OFF THE PLANE'S OWN SOURCE.
 * ========================================================================== */
const SRC_STORE = readFileSync(new URL("../src/store.mjs", import.meta.url), "utf8");
const SRC_QUERY = readFileSync(new URL("../src/query.mjs", import.meta.url), "utf8");

/* Blank block comments. See the header: an anchor that matches prose measures
   the prose. `//` line comments are left alone deliberately — blanking them
   would have to reason about `https://` inside the SQL template literals, and
   no cap in this file lives in one. */
const decomment = (text) => text.split("\n").map(((state) => (L) => {
  let out = "", i = 0;
  while (i < L.length) {
    if (state.block) {
      const e = L.indexOf("*/", i);
      if (e < 0) { i = L.length; } else { state.block = false; i = e + 2; }
      continue;
    }
    const b = L.indexOf("/*", i), s = L.indexOf("//", i);
    if (b >= 0 && (s < 0 || b < s)) { out += L.slice(i, b); state.block = true; i = b + 2; continue; }
    if (s >= 0 && (b < 0 || s < b)) { out += L.slice(i, s); i = L.length; continue; }
    out += L.slice(i); i = L.length;
  }
  return out;
})({ block: false })).join("\n");

/* Split the class into METHOD SEGMENTS on signature lines at exactly two spaces
   of indent. Bounded by the NEXT signature rather than by brace matching: UI-35
   lost a draft to a brace matcher that did not skip comments and swallowed
   27,059 characters, and a boundary that cannot run past the next method cannot
   make that mistake. Comments are already blanked, so a prose line cannot open
   a segment either. */
const segments = (code) => {
  const lines = code.split("\n");
  const sig = /^ {2}(?:static\s+|async\s+)?(#?[A-Za-z_$][\w$]*)\s*\(/;
  const heads = [];
  for (let i = 0; i < lines.length; i++) { const m = sig.exec(lines[i]); if (m) heads.push([i, m[1]]); }
  const out = new Map();
  for (let k = 0; k < heads.length; k++) {
    const j = k + 1 < heads.length ? heads[k + 1][0] : lines.length;
    out.set(heads[k][1], lines.slice(heads[k][0], j).join("\n"));
  }
  return out;
};

/* FOUR CAP SHAPES. Each earned its place: `param-default` is the only one UI-39
   looked for; `named-cap` is how `op=exportlog` and the orphan list carry theirs
   after this item named their literals; `sql-literal` is how they carried them
   BEFORE, and is kept so a new literal cannot slip in unnamed; `clamp` catches a
   method that decides a bound in code without any of the other three. */
const CAP_CONST = /\b(?:LIMIT_DEFAULT|LIMIT_MAX|[A-Z][A-Z0-9_]*_MAX|[A-Z][A-Z0-9_]*_LIMIT(?:_DEFAULT|_MAX)?)\b/;
const cappedMethods = (code) => {
  const out = new Map();
  for (const [name, body] of segments(code)) {
    const why = [];
    if (/\(\{[^)]*\blimit\s*=\s*\d+/.test(body)) why.push("param-default");
    if (/\bLIMIT\s+([2-9]|\d{2,})\b/.test(body)) why.push("sql-literal");
    if (/\bLIMIT\s+\?/.test(body) && CAP_CONST.test(body)) why.push("named-cap");
    if (/Math\.min\([^)]*\blimit/i.test(body) || /\blimit[^\n]*Math\.min\(/i.test(body)) why.push("clamp");
    if (why.length) out.set(name, why);
  }
  return out;
};
/* op -> method, off the dispatch, ANCHORED ON THE METHOD NAME. UI-39's version
   required the entry to forward `limit:` in its argument text and therefore
   missed every entry that forwards `body || {}`. */
const cappedOps = (code, methods) => {
  const out = new Map();
  const re = /^\s+([a-z][a-z0-9]*):\s*(?:async\s*)?\(\)\s*=>\s*(?:await\s+)?this\.([A-Za-z_$][\w$]*)\(/gm;
  let m; while ((m = re.exec(code))) if (methods.has(m[2])) out.set(m[1], m[2]);
  return out;
};

const CODE = decomment(SRC_STORE);
const METHODS = cappedMethods(CODE);
const OPS = cappedOps(CODE, METHODS);

console.log("\n--- WALK: the roster, read off the plane's own source ---");
console.log(`  CORPUS: store.mjs ${SRC_STORE.split("\n").length} lines, ${segments(CODE).size} method segments, ` +
            `${METHODS.size} carrying a cap, reaching ${OPS.size} ops`);
for (const [op, meth] of [...OPS].sort()) console.log(`    op=${op.padEnd(20)} -> ${meth}`);

/* GUARDS. A regex that silently yielded nothing makes every assertion below
   vacuous, which is the failure the whole sweep exists to prevent. */
t("WALK GUARD: block comments are blanked, and a known CODE line SURVIVES it",
  /static SEARCH_ORPHAN_MAX = 100;/.test(CODE), true);
t("WALK GUARD: and a known PROSE line does NOT — the anchor cannot match this item's own comments",
  /buried in its statement/.test(CODE), false);
t("WALK GUARD: the segmenter partitions the class into a plausible number of methods",
  segments(CODE).size > 250, true);
t("WALK GUARD: a segment is bounded by the NEXT method and does not run into it",
  [/const cap = Math\.max\(1, Math\.min\(1000/.test(segments(CODE).get("taskList")),
   /taskDrain\(\{/.test(segments(CODE).get("taskList"))], [true, false]);
t("WALK GUARD: the roster is non-trivial", METHODS.size >= 10, true);
t("WALK GUARD: and it reaches ops through the dispatch", OPS.size >= 8, true);

/* THE TWO OPS THE ITEM NAMED ARE ON THE PLANE'S OWN ROSTER — found through the
   source, never listed here. */
t("WALK: op=readingname and op=tasks, the two the item named, are on the roster the source yields",
  [OPS.get("readingname"), OPS.get("tasks")], ["documentsNamingEntity", "taskList"]);
/* AND THE ITEM'S PREMISE IS WIDENED BY THE MEASUREMENT: nine more. */
t("WALK: the class is NINE ops wider than the two named — the sweep is the item, not the pair",
  OPS.size, 11);

/* op=search's cap lives in query.mjs as a module constant, not as a parameter
   default, so it is confirmed by its own name — and it is the op the others were
   brought into line WITH. */
const LIMIT_DEFAULT = Number((/LIMIT_DEFAULT\s*=\s*(\d+)/.exec(SRC_QUERY) || [])[1]);
const LIMIT_MAX = Number((/LIMIT_MAX\s*=\s*(\d+)/.exec(SRC_QUERY) || [])[1]);
t("WALK: op=search's bound is query.mjs's own published pair, and it is the model",
  [LIMIT_DEFAULT, LIMIT_MAX, LIMIT_MAX > LIMIT_DEFAULT], [50, 500, true]);

/* ---------------------------------------------------------- REACH, AS DELTAS.
   Each walk re-run over a MECHANICALLY BROKEN copy of the same source, which
   must yield FEWER. The absolute number is not the evidence; the difference is. */
const strippedCaps = CODE.replace(/\blimit\s*=\s*\d+/g, "limit = null")
                         .replace(/Math\.min\(/g, "Number(")
                         .replace(/\bLIMIT\s+\d+/g, "LIMIT ?")
                         .replace(CAP_CONST, "zzz");
const strippedMethods = cappedMethods(strippedCaps);
t("REACH IS A DELTA (methods): stripping the caps from a copy of store.mjs shrinks the roster the walk finds",
  strippedMethods.size < METHODS.size, true);
t("REACH IS A DELTA (ops): and shrinks the ops it reaches",
  cappedOps(strippedCaps, strippedMethods).size < OPS.size, true);
/* The dispatch walk has its own reach, independent of the method walk: break the
   ARROW SHAPE it anchors on and it must find fewer even with the roster intact. */
t("REACH IS A DELTA (dispatch): breaking the dispatch arrow shape shrinks the ops found, with the roster unchanged",
  cappedOps(CODE.replace(/\)\s*=>\s*this\./g, ") => that."), METHODS).size < OPS.size, true);

/* ==========================================================================
 * LIVE — every roster op driven through its real route, twice: once with the
 * bound BITING and once with it NOT. The pair is the assertion.
 * ========================================================================== */
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  /* The automatic drain is pushed far out so the taskdrain arm below is never
     raced by the alarm — task-fence.test.mjs's precedent. */
  bindings: { ADMIN_TOKEN: "adm-r57", MEMBER_TOKEN: "mem-r57", PROBE_TOKEN: "prb-r57",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const ns = await mf.getDurableObjectNamespace("STORE");
const doStub = ns.get(ns.idFromName("bio"));
const DO = async (p, body) => rP(await (await doStub.fetch("http://x/" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json());

const NOW = "2026-07-16T00:00:00Z";
const LABEL = "Coliseum Payment Allocation";
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`, "produced_by:", "  mode: assisted",
  "  capability_tier: session", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false",
  "  since: null", "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:", "  locator: in hand",
  "  authority: synthetic", `  retrieved: ${NOW}`, "monitoring:", "  enabled: false",
  "  frequency: none", "---", "", "## Summary", "", "An agenda item.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", "",
].join("\n");

/* THREE captured documents, each with a reading NAMING the same subject, so one
   registered alias reaches all three and a cap of 1 provably bites. */
const CAPS = [];
for (let i = 1; i <= 3; i++) {
  const id = `INFO-2026-000${i}-r57`;
  const md = bundleMd(id);
  const capture = sha(`r57-${i}`);
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: capture, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW,
               entities: [{ ref: `legislation:26-090${i}`, kind: "legislation", key: `26-090${i}`, label: LABEL }] } }] });
  const files = [
    { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
    { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
  ];
  const r = await POST("op=promote&token=mem-r57", {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "r57", files,
    register: [{ sha256: capture, path: "captures/doc.pdf", encoding: "binary", bytes: 10 }],
    meta: { object_type: "information", group: "believe-in-oakland", title: id,
            current_state: "collected", created: NOW, last_updated: NOW } });
  if (r?.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  CAPS.push(capture);
}
const ENT = (await POST("op=entitycreate&token=mem-r57", { kind: "contract", label: LABEL })).entity_id;
if (!ENT) throw new Error("entitycreate failed");

/* Three task EVENTS on the three registered captures (there is deliberately no
   control-plane enqueue), and two exports, so every roster op has more than one
   of whatever it counts. */
for (let i = 0; i < 3; i++)
  await DO("taskenqueue", { kind: "authority-undetermined", captureSha: CAPS[i],
                            subject: `https://example.gov/doc${i}.pdf`,
                            locator: `https://example.gov/doc${i}.pdf`, at: NOW });
/* THE FIXTURE IS PROVED TO ARM THE TRAP, rather than assumed to. A corpus that
   never exceeds a cap would let every `truncated:false` below pass at zero cost
   — the "green first time with the defect present" shape that caught two arms
   today. Three of everything, against caps of one. */
t("FIXTURE ARMS THE TRAP: three captured documents exist, so a cap of 1 has something to cut",
  (await GET("op=list&token=mem-r57&limit=100")).total, 3);
t("FIXTURE ARMS THE TRAP: three task events are queued, so a drain of 1 leaves work behind",
  (await GET("op=tasks&token=mem-r57")).counts.queued, 3);

/* op=taskdrain is driven HERE rather than in the loop below, because draining is
   what CREATES the tasks the op=tasks and op=queue arms then read: its two calls
   are this suite's fixture as well as its own pin. `remaining` is its own
   'this is not all of it' — see the header on why no `truncated` is minted. */
console.log("\n--- LIVE: op=taskdrain, whose two calls are also the task fixture ---");
const td1 = await POST("op=taskdrain&token=mem-r57", { limit: 1, now: NOW });
t("op=taskdrain: publishes the bound this pass applied", td1.limit, 1);
t("op=taskdrain: and `remaining` says the queue is not drained — its own 'this is the first N'",
  [td1.drained, td1.remaining], [1, 2]);
const td2 = await POST("op=taskdrain&token=mem-r57", { limit: 500, now: NOW });
t("op=taskdrain: DELTA — a pass that emptied the queue reads differently from one that was cut",
  [td2.limit, td2.remaining > 0, td1.remaining > 0], [500, false, true]);
t("FIXTURE ARMS THE TRAP: three tasks now exist, so op=tasks and op=queue have something to cut",
  (await GET("op=tasks&token=mem-r57&limit=500")).tasks.length, 3);

/* TWO EXPORTS, so the append-only export log has more than one row and a cap of
   1 provably bites it. */
for (const note of ["first", "second"]) {
  const e = await GET(`op=export&token=adm-r57&note=${note}`);
  if (e?.ok === false) throw new Error(`export ${note}: ${JSON.stringify(e)}`);
}
t("FIXTURE ARMS THE TRAP: the append-only export log carries two rows, so a cap of 1 cuts it",
  (await GET("op=exportlog&token=adm-r57&limit=200")).exports.length, 2);

/* ------------------------------------------------------------------ the pins.
   ONE DESCRIPTOR PER ROSTER OP: how to drive it, and how IT says "there is
   more". The `more` reader is each op's OWN vocabulary — see the header on why
   a fifth spelling is not minted. */
const DRIVEN = [
  { op: "readingname", bite: 1, whole: 500,
    drive: (n) => GET(`op=readingname&token=mem-r57&entity=${ENT}&limit=${n}`),
    more: (a) => a.truncated, says: "`truncated`",
    lost: "whether `count` is the number that EXIST or only the number it SENT" },
  { op: "tasks", bite: 1, whole: 500,
    drive: (n) => GET(`op=tasks&token=mem-r57&limit=${n}`),
    more: (a) => a.truncated, says: "`truncated`",
    lost: "whether the inbox is empty of further work or merely cut, which its sibling op=queue always said" },
  { op: "queue", bite: 1, whole: 500,
    drive: (n) => GET(`op=queue&token=mem-r57&limit=${n}`),
    more: (a) => a.truncated, says: "`truncated`",
    lost: "which bound produced a feed it already admits is truncated" },
  { op: "audit", bite: 1, whole: 1000,
    drive: (n) => GET(`op=audit&token=adm-r57&limit=${n}`),
    more: (a) => a.cursor !== null, says: "a non-null `cursor`",
    lost: "whether `ok` is a verdict over the record or over one page of it" },
  { op: "list", bite: 1, whole: 5000,
    drive: (n) => GET(`op=list&token=mem-r57&limit=${n}`),
    more: (a) => a.cursor !== null, says: "a non-null `cursor`",
    lost: "that a request for 100000 was silently answered at 5000" },
  { op: "searchindexcheck", bite: 1, whole: 1000,
    drive: (n) => GET(`op=searchindexcheck&token=mem-r57&limit=${n}`),
    more: (a) => a.cursor !== null, says: "a non-null `cursor`",
    lost: "whether index parity was checked over the record or over one page" },
  { op: "exportlog", bite: 1, whole: 200,
    drive: (n) => GET(`op=exportlog&token=adm-r57&limit=${n}`),
    more: (a) => a.truncated, says: "`truncated`",
    lost: "that an append-only log described as complete was shown newest-first and cut" },
];

console.log("\n--- LIVE: every roster op, driven twice — the bound biting, and not ---");
for (const d of DRIVEN) {
  const bitten = await d.drive(d.bite);
  const whole = await d.drive(d.whole);
  t(`op=${d.op}: publishes the bound it APPLIED, and it is the clamped cap and not the number asked for`,
    bitten.limit, d.bite);
  t(`op=${d.op}: a cut answer says so, in this op's own vocabulary (${d.says})`,
    d.more(bitten), true);
  t(`op=${d.op}: a complete answer says the opposite — ${d.lost} is READABLE, not inferred`,
    d.more(whole), false);
  /* THE DELTA. This is the accepts-when clause in one line: the two must not be
     able to read alike. Asserted as a difference on the SAME store, so it cannot
     pass by both calls happening to answer the same way. */
  t(`op=${d.op}: DELTA — 'this is all of it' and 'this is the first N' do NOT read alike`,
    d.more(bitten) !== d.more(whole), true);
}

/* An over-ask is CLAMPED and the clamp is what is published — the half a caller
   could not see, and the reason echoing the request back would be a new lie. */
const over = await GET(`op=readingname&token=mem-r57&entity=${ENT}&limit=99999`);
t("op=readingname: an over-ask is answered at the ceiling and the CEILING is what is published",
  over.limit, 500);
const overList = await GET("op=list&token=mem-r57&limit=99999");
t("op=list: likewise — 99999 asked, 5000 applied, 5000 published",
  overList.limit, 5000);

/* THE ITEM'S OWN (a), IN ITS OWN TERMS: `count` is the length of what was SENT
   and always was. What changed is that the answer now says which that is. */
const one = await GET(`op=readingname&token=mem-r57&entity=${ENT}&limit=1`);
const all = await GET(`op=readingname&token=mem-r57&entity=${ENT}&limit=500`);
t("op=readingname: `count` is STILL the length of what was sent — unchanged, and that was never the defect",
  [one.count, one.documents.length, all.count, all.documents.length], [1, 1, 3, 3]);
t("op=readingname: the defect was that 1-of-3 and 3-of-3 published the same shape; now they do not",
  [one.truncated, all.truncated], [true, false]);
t("op=readingname: and a cut answer SAYS SO IN WORDS, so a member reading the detail is not left to the flags",
  [/THIS IS THE FIRST 1 AND NOT ALL OF THEM/.test(one.detail), /NOT ALL OF THEM/.test(all.detail)],
  [true, false]);

/* THE ITEM'S OWN (b): the two siblings on one surface now answer in ONE shape. */
t("op=tasks and op=queue: the two siblings publish the SAME two keys, so a consumer that reads one reads the other",
  [Object.hasOwn(one, "limit"), ...["tasks", "queue"].map(() => true)].length > 0
  && ["limit", "truncated"].every((k) => Object.hasOwn(all, k)), true);
const tk1 = await GET("op=tasks&token=mem-r57&limit=1"), q1 = await GET("op=queue&token=mem-r57&limit=1");
t("op=tasks answers the completeness question in op=queue's OWN shape — not a new one beside it",
  [["limit", "truncated"].every((k) => k in tk1), ["limit", "truncated"].every((k) => k in q1)], [true, true]);

/* ---------------------------------------------------- the two backfills, LAST,
   because both CLEAR a derived structure to arm themselves. `op=reindexnames`
   is not on the control plane at all (there is no OPS entry), so it and the two
   clear paths are driven at the Durable Object — projection.test.mjs's
   precedent. */
console.log("\n--- LIVE: the two bounded BACKFILLS, which say 'run me again' rather than 'truncated' ---");
await DO("projectionclear", {});
const rp1 = await DO("reproject", { limit: 1 });
t("op=reproject: publishes the bound this pass applied", rp1.limit, 1);
t("op=reproject: and `remaining` says work is left — its own 'this is not all of it'", rp1.remaining > 0, true);
const rp2 = await DO("reproject", { limit: 500 });
t("op=reproject: DELTA — a pass that finished reads differently from one that was cut",
  [rp2.limit, rp2.remaining > 0, rp1.remaining > 0], [500, false, true]);

await DO("readingtermsclear", {});
const rn1 = await DO("reindexnames", { limit: 1 });
t("op=reindexnames: publishes the bound this pass applied", rn1.limit, 1);
/* THIS ONE WAS NOT IN THE ITEM'S BRIEF. It published `examined` — the count of
   what it TOOK, which EQUALS the cap on exactly the run where more is left —
   and no remainder, while its own sibling `#backfillProjection` published one.
   The op=tasks/op=queue defect, between two backfills, one layer down. */
t("op=reindexnames: `remaining` now says work is left, in its SIBLING's word rather than a third spelling",
  rn1.remaining > 0, true);
t("op=reindexnames: and `examined` alone could NOT have said it — it equals the cap on exactly that run",
  rn1.examined, rn1.limit);
const rn2 = await DO("reindexnames", { limit: 500 });
t("op=reindexnames: DELTA — a finished pass reads differently from a cut one",
  [rn2.remaining > 0, rn1.remaining > 0], [false, true]);

/* ------------------------------------------- the orphan list inside op=searchindexcheck.
   A SECOND, SEPARATE bound inside one op, hard-coded in the statement and named
   by nothing. `ok:false` on this op is a completeness claim about index parity,
   so an operator clearing a truncated orphan list would repair all of them and
   watch the op keep reporting findings. */
const sic = await GET("op=searchindexcheck&token=mem-r57&limit=1000");
t("op=searchindexcheck: the ORPHAN list carries its own bound and its own truncation flag, said separately",
  [sic.orphans_limit, sic.orphans_truncated], [100, false]);
t("op=searchindexcheck: and that bound is NOT the page's — two lists, two bounds, resumed differently",
  sic.orphans_limit !== sic.limit, true);

/* ==========================================================================
 * THE ROSTER DRIVES THE SUITE — the pin that stops this file covering less
 * than the sweep claims.
 * ========================================================================== */
console.log("\n--- PIN: the ops driven are the ops the walk found ---");
/* Driven above the loop rather than inside it — `taskdrain` because its calls are
   also the task fixture, the two backfills because each must CLEAR a derived
   structure to arm itself and `reindexnames` has no control-plane entry at all. */
const DRIVEN_ELSEWHERE = new Set(["taskdrain", "reindexnames", "reproject"]);
/* ONE ROSTER OP ANSWERS ITS CAPPED ARMS WITH A BARE ARRAY, which can carry no
   key at all, so it cannot be fixed additively and is filed as IC-23 rather than
   quietly reshaped. MEASURED, NAMED and PINNED TO EXACTLY ONE: a second op
   answering this way fails here rather than joining a growing exception. */
const ARRAY_SHAPED = new Set(["projection"]);
t("PIN: op=projection's capped corpus arm really does answer with a bare ARRAY — measured, not asserted",
  Array.isArray(await GET("op=projection&token=mem-r57&jsonPath=$.group&jsonEquals=believe-in-oakland")), true);
t("PIN: and it is the ONLY roster op that does — the exception is one op wide and pinned at one",
  ARRAY_SHAPED.size, 1);
const covered = new Set([...DRIVEN.map((d) => d.op), ...DRIVEN_ELSEWHERE, ...ARRAY_SHAPED]);
const uncovered = [...OPS.keys()].filter((o) => !covered.has(o));
t("PIN: every capped op the walk found is DRIVEN here — an op that grows a cap tomorrow fails until somebody drives it",
  uncovered, []);
t("PIN: and nothing is driven that the walk did NOT find — the roster is the source's, not this file's",
  [...covered].filter((o) => !OPS.has(o)), []);

/* ==========================================================================
 * OVER-STRICTNESS. A pin that only accepts the phrasing its author wrote is
 * measuring its author. These are answers that are GENUINELY HONEST and look
 * nothing like what this file emits, and they must NOT fail.
 * ========================================================================== */
console.log("\n--- OVER-STRICTNESS: a correct answer phrased unlike anything here must pass ---");
const honestAlternatives = [
  /* page/of/hasMore, a shape no op here uses */
  { page: { size: 25, index: 0 }, hasMore: true, records: [] },
  /* RFC-5988-ish: a next link is a truncation signal and a perfectly good one */
  { items: [], links: { next: "?after=INFO-9" }, bound_applied: 25 },
  /* the plane's own fifth spelling, `bounded`, from #conditionBundlesForHost */
  { ids: [], bounded: true, cap: 16 },
];
/* The PROPERTY, not the vocabulary: an answer is honest if some key states the
   bound and some key settles completeness. Read structurally. */
const statesBound = (a) => Object.entries(a).some(([k, v]) =>
  /limit|cap|bound|size/i.test(k) ? true : (v && typeof v === "object" && statesBound(v)));
const settlesCompleteness = (a) => Object.entries(a).some(([k, v]) =>
  /truncated|remaining|cursor|total|hasMore|next|bounded/i.test(k) ? true : (v && typeof v === "object" && settlesCompleteness(v)));
t("OVER-STRICTNESS: three genuinely honest answers in vocabularies this file never emits are all accepted",
  honestAlternatives.filter((a) => !(statesBound(a) && settlesCompleteness(a))).length, 0);
/* And the same reader REFUSES the pre-REC-57 shape, so it is not simply
   permissive — an over-strictness arm that accepts everything proves nothing. */
t("OVER-STRICTNESS: and the reader still REFUSES the shape this item existed to fix",
  [statesBound({ ok: true, count: 3, documents: [] }),
   settlesCompleteness({ ok: true, count: 3, documents: [] })], [false, false]);

await mf.dispose();

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
