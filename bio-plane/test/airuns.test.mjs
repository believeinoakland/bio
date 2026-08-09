/* NEGATIVE CONTROL: (run 2026-08-08, rec69-agent, REC-69) SEVEN arms, RUN through
   `node test/airuns.control.mjs` (the driver lives INSIDE this worktree), each armed ALONE with
   every other held open, each DECLARED must-fail or must-not-fail BEFORE it ran, each mutation
   passing an anchor-appears-EXACTLY-ONCE guard and a bytes-really-changed guard, and every
   restore verified by sha256 AND by `cmp` against a PRISTINE copy named UNIQUELY PER ARM. An
   opening AND a closing baseline row bracket the run — 46/152/115/83 across airuns, bounds,
   gate-reads and meaning-bounds, identical at both ends — because a harness that reported the
   same answer for every arm INCLUDING the baseline is on record in this repository, and without a
   baseline row six arms failing for an unrelated reason read exactly like six arms working.
   ALL SEVEN CAME BACK AS DECLARED on the final run; FOUR came back WRONG on the first, and the
   four are the most useful output here:
   (1) DROP THE CONTEXT FILTER (`(1=1 OR lower(r.context_type) = ?) AND (1=1 OR r.context_id = ?)`)
   -> FAILS in airuns AND bounds, the failing assertion NAMING `RUN-r69-other`, the foreign run.
   (2) DROP THE VIEWER GATE from the outer statement (`AND (1=1 OR ${seen.sql})`) -> FAILS, and
   **THE ARM'S OWN DECLARATION WAS CORRECTED BY RUNNING IT.** It was declared as "the uninvited
   member receives the secret project's run". HE DOES NOT: every row is composed by `aiRunRead`,
   which compiles the same gate again, so the rows stay withheld and only ONE assertion moves.
   What the outer gate protects is the COUNT — with it gone he is told `truncated: true` over runs
   he may not see, the withheld count arriving as a boolean. The arm now requires THAT assertion
   to be the one that fails. **AND THE FIXTURE COULD NOT ARM IT**: with one hidden run,
   `page.length (1) > cap (1)` is false either way, so the arm passed over a flag that could not
   be set. A second hidden run was added, with the reason at the fixture.
   **DRIVEN BY A REAL UNINVITED MEMBER** — enrolled, logged in, holding a session — never by
   hand-written SQL and never by a machine credential, because `#bundleGate` documents that a
   machine credential is deliberately NOT filtered and an arm driven with one goes red against
   CORRECT behaviour (UI-49 measured exactly that mistake).
   (3) REDACT INSTEAD OF WITHHOLD -> FAILS. **ITS FIRST DRAFT PASSED, AND THE PASS WAS THE
   FINDING**: nulling a `found:false` row's context changes nothing while the outer query is
   gated, because no such row survives to be composed — the redaction ran over an empty set. It is
   now a TWO-PART mutation (gate off, stub emitted) so the redact posture is reachable at all.
   (4) DROP THE PUBLISHED BOUND -> FAILS in bounds AND here. **ITS FIRST ANCHOR REFUSED TO ARM**,
   reporting `ANCHOR NOT UNIQUE (2)`: `limit: cap, truncated: page.length > cap,` appears twice in
   store.mjs — `aiRunLog` carries the identical line — so a control with the short anchor would
   have mutated the OTHER op while claiming to measure this one.
   (5) ANSWER A BARE COLLECTION (`return runs;` above the envelope) -> FAILS, and
   `bounds.test.mjs`'s **ZERO-bare-array pin fails NAMING `airuns`**, with no exception list to
   join.
   (6) OVER-STRICTNESS TEETH — make the context-kind match CASE-SENSITIVE -> FAILS at ARM R, which
   is what proves the over-strictness arm has teeth rather than merely existing.
   (7) MUST-NOT-FAIL — a behaviour-preserving edit inside the same method -> everything stays
   GREEN, so the six reds above are the mutations and not the harness.
   A FIFTH INSTRUMENT FINDING, in the DRIVER: its named-failure check first searched
   `battery.mjs`'s summary, which prints an assertion's LABEL and not its `want`/`got`, so arms 1
   and 2 were reported as "not naming the run" while they had leaked and printed exactly that run.
   The check now runs the suite directly. To re-run everything: `node test/airuns.control.mjs`. */

/* REC-69 — op=airuns: WHICH RUNS ARE IN THIS CONTEXT.
 * =====================================================================
 *
 * UI-49 built §14a's call site and MEASURED, while building it, that the plane
 * could not be asked the question at all: `op=airun`, `op=airunlog` and
 * `op=airunspawn` are keyed by RUN ID, `ai_runs` is queried by `run` at all 14
 * sites, and `op=airunopen` has no UI consumer — so the browser never learns a
 * run id by opening one. The seam UI-49 shipped therefore reads the run
 * addresses THIS DEVICE has already opened, which is honest, is pinned, and
 * reaches only the member who already held the address. **A second member's run
 * in the same inquiry is invisible to them.** This op is the half that reaches
 * the teammate §14a names.
 *
 * WHAT THIS SUITE IS ABOUT, and it is a VIEWER question rather than a query one.
 * A run-id read is a poor leak — a caller must already hold the id. A
 * context-keyed list is the opposite: it takes an id a member can see on their
 * own screen and answers with everything hanging off it. So the arms below are
 * weighted at the gate, and the gate half is DRIVEN WITH REAL MEMBERS rather
 * than asserted about.
 *
 * FOUR PROPERTIES, and each has its own section:
 *   A. THE QUESTION IS ANSWERABLE — runs listed for an inquiry AND for a
 *      project, with a run in another context absent from both.
 *   B. THE VIEWER GATE — an uninvited member's answer is byte-identical to the
 *      answer for a context that does not exist, no count of the withheld is
 *      published, and the BOUND is applied behind the gate so `truncated`
 *      cannot announce hidden work.
 *   C. ONE PREDICATE, NOT TWO — asserted STRUCTURALLY off the method's own
 *      comment-stripped source, because D-15's one compilation point is a
 *      property of the code and a passing gate arm cannot distinguish "compiled
 *      once" from "compiled twice, identically, today".
 *   D. THE ENVELOPE AND THE REFUSALS — the bound after clamping, published on
 *      the EMPTY answer too, and three DEC-49 codes whose canned translations
 *      are read LIVE from the catalogue rather than typed here.
 *
 * AND THE CLASS SWEEP is at the foot, with its corpus and its reach PRINTED:
 * which other questions a surface plainly needs cannot be asked of the plane.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { AI_RUNS_CONTEXT_CHECKS } from "../checks/bio-checks.mjs";
import { RUN_CONTEXTS } from "../src/airun.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SRC_STORE = readFileSync(new URL("../src/store.mjs", import.meta.url), "utf8");
const SRC_SCHEMA = readFileSync(new URL("../src/schema.mjs", import.meta.url), "utf8");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r69", MEMBER_TOKEN: "mem-r69", PROBE_TOKEN: "prb-r69",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const RAW = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

/* ------------------------------------------------------------------ fixture */

const NOW = "2026-07-16T00:00:00Z";

/* REAL MEMBERS, enrolled and logged in — PL-4's standard, and here it is not a
   formality. The gate arm's whole subject is what a PERSON who was not invited
   receives, and `#bundleGate` documents that a MACHINE credential is
   deliberately NOT filtered: an arm driven with `token=mem-r69` would report
   "sees everything" against CORRECT behaviour, which is the instrument failure
   UI-49 measured and recorded. */
const member = async (id, caps, role = "member") => {
  const add = await RAW("op=memberadd&token=adm-r69",
    { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add.result?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await RAW("op=enroll", { invite: add.result.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en.result?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await RAW("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg.result?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.result.token;
};

const bundleMd = (id, type) => [
  "---", `id: ${id}`, `object_type: ${type}`,
  `current_state: ${type === "project" ? "forming" : type === "inquiry" ? "open" : "collected"}`,
  `created: "${NOW}"`, `last_updated: "${NOW}"`, "---", "", "## Summary", "", "A fixture.", "",
].join("\n");

const mk = async (id, type, tok) => {
  const text = bundleMd(id, type);
  const r = await RAW(`op=promote&token=${tok}`, {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "r69",
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: type, group: "believe-in-oakland", title: id,
            current_state: type === "project" ? "forming" : type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: NOW } });
  if (!r.result?.ok) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 500)}`);
};

/* 4.2/4.3: the first two roster members must be administrators. */
const ruth = await member("ruth", ["contribute"], "admin");
await member("gus", ["contribute"], "admin");
const carol = await member("carol", ["contribute", "create_projects"]);
const dave = await member("dave", ["contribute"]);      // THE UNINVITED MEMBER

const INQ = "INQ-2026-0001-shared";        // shared corpus: everybody sees it
const PROJ = "PROJ-2026-0001-secret";      // carol's project: dave is NOT invited
const OTHER = "INFO-2026-0002-shared";     // a second shared context, for the filter arm
const MISSING = "PROJ-2026-9999-none";     // never created: the no-disclosure yardstick

await mk(INQ, "inquiry", "mem-r69");
await mk(OTHER, "information", "mem-r69");
await mk(PROJ, "project", carol);

const open = async (tok, run, contextType, contextId, label) => {
  const r = await POST(`op=airunopen&token=${tok}`, {
    run, contextType, contextId, label, mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000 });
  if (r?.started !== true) throw new Error(`airunopen ${run}: ${JSON.stringify(r)}`);
};

/* TWO runs in the shared inquiry, opened by DIFFERENT members. That pairing is
   the item: `carol`'s run is one `dave` never opened on his own device, so it is
   exactly the run UI-49's device-local seam could never show him. */
await open(carol, "RUN-r69-inq-a", "inquiry", INQ, "carol's run in the shared inquiry");
await open(ruth,  "RUN-r69-inq-b", "inquiry", INQ, "ruth's run in the same inquiry");
/* TWO in the secret project, which dave was never invited to. TWO AND NOT ONE,
   and the second exists because a CONTROL proved the first was not enough: with
   a single hidden run, dropping the gate and asking for `limit=1` still answers
   `truncated:false` — `page.length (1) > cap (1)` is false either way — so the
   arm below that exists to catch a truncation flag leaking a hidden COUNT was
   passing over a fixture that could not arm it. "A headline assertion that
   passed over an empty corpus", one row short instead of zero. */
await open(carol, "RUN-r69-proj",   "project", PROJ, "carol's run inside her project");
await open(carol, "RUN-r69-proj-2", "project", PROJ, "a second run inside the same project");
/* ONE in a DIFFERENT context, so the filter is measured rather than assumed. */
await open(carol, "RUN-r69-other", "inquiry", OTHER, "a run in another context entirely");

const idsOf = (a) => (a?.runs || []).map((s) => s.id).sort();

/* =================================================================== *
 * A · THE QUESTION IS ANSWERABLE AT ALL — which is the item.
 * ========================================================================== */
console.log("\n--- A: the question no op could answer, asked and answered ---");

const inqA = await GET(`op=airuns&token=${dave}&contextType=inquiry&contextId=${INQ}`);
t("op=airuns lists the runs in an INQUIRY — and both of them were opened by OTHER MEMBERS, which is "
+ "the whole delegation: UI-49's device-local seam can only ever show a member the runs they "
+ "personally started on this machine",
  idsOf(inqA), ["RUN-r69-inq-a", "RUN-r69-inq-b"]);
t("and the run in a DIFFERENT context is absent from that answer — the context filter is measured, "
+ "not assumed",
  idsOf(inqA).includes("RUN-r69-other"), false);

const projA = await GET(`op=airuns&token=${carol}&contextType=project&contextId=${PROJ}`);
t("op=airuns lists the runs in a PROJECT for a member who may see it",
  idsOf(projA), ["RUN-r69-proj", "RUN-r69-proj-2"]);
t("FIXTURE ARMS THE TRAP: the hidden project holds TWO runs, so a cap of ONE has something to cut — "
+ "which is what makes the truncation-leak arm in section B a measurement rather than a flag that "
+ "could not have been set either way",
  projA.count > 1, true);
t("and neither inquiry run appears there — the two contexts do not bleed",
  idsOf(projA).some((i) => i.startsWith("RUN-r69-inq")), false);

const otherA = await GET(`op=airuns&token=${dave}&contextType=inquiry&contextId=${OTHER}`);
t("the second shared context answers with ITS run and only its run", idsOf(otherA), ["RUN-r69-other"]);

/* THE SHAPE. §14a's surface renders a run through FIELD-NAME-BLIND renderers —
   they walk what the record published — so "the same `session` shape per row" is
   load-bearing rather than tidy. It is asserted as BYTE-IDENTITY against the op
   that already publishes that shape, not as a list of key names, because a key
   list is a hand copy and a hand copy agrees with its author for free. */
const single = await GET(`op=airun&token=${dave}&run=RUN-r69-inq-a`);
const fromList = (inqA.runs || []).find((s) => s.id === "RUN-r69-inq-a");
t("EVERY ROW IS op=airun's OWN `session` BLOCK, BYTE-IDENTICAL — the list IS the read, run per run, "
+ "so a surface built against one is built against the other and nothing can drift between them",
  JSON.stringify(fromList), JSON.stringify(single.session));
t("and that block is not empty of the things a surface needs — status, context, both principals and "
+ "the budget arrive, so the byte-identity above is over a real answer rather than two nulls",
  [fromList?.status, fromList?.context?.type, fromList?.context?.id,
   typeof fromList?.principal?.plane === "string" && fromList.principal.plane.length > 0,
   typeof fromList?.principal?.claude === "string" && fromList.principal.claude.length > 0,
   Array.isArray(fromList?.budget) && fromList.budget.length > 0],
  ["running", "inquiry", INQ, true, true, true]);
t("NO TOKEN VALUE travels on any row — §14a names the principal and never the credential",
  JSON.stringify(inqA).includes("passphrase") || JSON.stringify(inqA).includes("adm-r69")
  || JSON.stringify(inqA).includes("mem-r69"), false);

/* =================================================================== *
 * B · THE VIEWER GATE — driven with a REAL uninvited member.
 * ========================================================================== */
console.log("\n--- B: what an UNINVITED member sees, driven with one rather than reasoned about ---");

const daveProj = await GET(`op=airuns&token=${dave}&contextType=project&contextId=${PROJ}`);
/* Read here rather than below, because the polarity arm on the byte-comparison
   needs a NON-EMPTY answer to compare against and an arm that compares two
   empties would pass over a read that is broken for everybody. */
const carolProjPreview = await GET(`op=airuns&token=${carol}&contextType=project&contextId=${PROJ}`);
t("AN UNINVITED MEMBER SEES NO RUN OF A PROJECT HE WAS NEVER INVITED TO — the row is WITHHELD, "
+ "not redacted (REC-36), so there is nothing on the wire to say a job is running",
  [daveProj.ok, idsOf(daveProj), daveProj.count], [true, [], 0]);
const daveMissing = await GET(`op=airuns&token=${dave}&contextType=project&contextId=${MISSING}`);
/* THE COMPARISON EXCLUDES THE ECHOED `context`, AND THE EXCLUSION IS REASONED
   RATHER THAN CONVENIENT — the first draft of this arm compared the WHOLE answer
   and failed, which is worth recording because the failure was the arm's and not
   the plane's. `context` is the caller's OWN INPUT handed back normalised, so it
   can only ever differ by what the caller already typed; requiring the two to
   agree there would require the op to forget which question it was answering.
   Everything the RECORD contributes — the rows, the count, the bound, the
   truncation state — is compared byte for byte, and that is the set that could
   disclose anything. */
const withoutEcho = (a) => JSON.stringify({ ...a, context: "<the caller's own words>" });
t("AND IT IS BYTE-IDENTICAL TO A CONTEXT THAT DOES NOT EXIST, in everything the RECORD contributes — "
+ "hidden and absent are ONE answer, which is the only shape that discloses nothing at all",
  withoutEcho(daveProj), withoutEcho(daveMissing));
t("POLARITY on that comparison: the same reader over the OWNER's answer for the same project does "
+ "NOT match the nonexistent one — so the equality above is a measurement and not a comparison that "
+ "erased everything it was meant to look at",
  withoutEcho(carolProjPreview) === withoutEcho(daveMissing), false);
t("NO COUNT OF THE WITHHELD is published anywhere in the answer — op=backlinks' rule, and here the "
+ "count IS the disclosure that somebody is investigating something you cannot see",
  Object.keys(daveProj).filter((k) => !["ok", "context", "runs", "count", "limit", "truncated"].includes(k)),
  []);
t("and `count` is the length of what was SENT — zero — rather than a tally of what was refused",
  [daveProj.count, (daveProj.runs || []).length], [0, 0]);

/* THE POLARITY. An arm that only ever asserts emptiness passes over a broken
   read, so the SAME request is driven by three viewers who MAY see the project
   and must not come back empty. */
const carolProj = await GET(`op=airuns&token=${carol}&contextType=project&contextId=${PROJ}`);
const ruthProj = await GET(`op=airuns&token=${ruth}&contextType=project&contextId=${PROJ}`);
const machineProj = await GET(`op=airuns&token=mem-r69&contextType=project&contextId=${PROJ}`);
t("POLARITY: the OWNER sees her project's run, so dave's empty answer is a measurement and not a "
+ "read that is broken for everybody",
  idsOf(carolProj), ["RUN-r69-proj", "RUN-r69-proj-2"]);
t("POLARITY: an in-app ADMINISTRATOR sees it too (7.3)", idsOf(ruthProj), ["RUN-r69-proj", "RUN-r69-proj-2"]);
t("POLARITY: and a MACHINE credential is NOT filtered — D-15's own deliberate carve-out, asserted "
+ "here so nobody later 'fixes' the gate by making a machine viewer look like a member's",
  idsOf(machineProj), ["RUN-r69-proj", "RUN-r69-proj-2"]);

/* THE BOUND IS BEHIND THE GATE. This is the arm the ORDER of two clauses buys,
   and nothing else in the file would catch it: a `truncated` computed before the
   gate would count rows dave may not see and announce, in a boolean, that hidden
   work exists — op=backlinks' no-count rule broken by a flag instead of by a
   number. Driven at `limit=1` against a context holding THREE runs he cannot
   see, which is the exact input that separates the two orderings. */
const daveProjBitten = await GET(`op=airuns&token=${dave}&contextType=project&contextId=${PROJ}&limit=1`);
t("THE BOUND IS APPLIED BEHIND THE GATE: an uninvited member asking for ONE row of a project holding "
+ "runs he may not see is told `truncated:false`, because the truncation is over what HE may see. A "
+ "`true` here would be the withheld count arriving as a boolean",
  [daveProjBitten.count, daveProjBitten.truncated, daveProjBitten.limit], [0, false, 1]);
const carolProjBitten = await GET(`op=airuns&token=${carol}&contextType=project&contextId=${PROJ}&limit=1`);
t("POLARITY on that same arm: the OWNER asking for one row of the same context is answered — so the "
+ "`false` above is the gate working and not the bound failing",
  [carolProjBitten.count, carolProjBitten.limit], [1, 1]);

/* THE IMPOSTOR ARM — REC-29's carried lesson. The control plane copies every
   caller parameter into the inner URL, so a gate driven by one would be no gate.
   `viewer` is stamped server-side AFTER the copy; this proves it. */
const impostor = await GET(`op=airuns&token=${dave}&contextType=project&contextId=${PROJ}`
                         + `&viewer=${encodeURIComponent(`member:${"carol"}`)}`);
t("THE VIEWER IS SERVER-STAMPED: dave naming carol as the viewer receives exactly what dave receives. "
+ "The passthrough copies caller parameters, so a gate driven by one is an impostor hole",
  JSON.stringify(impostor), JSON.stringify(daveProj));

/* =================================================================== *
 * C · ONE PREDICATE, NOT TWO — asserted off the source.
 * ========================================================================== */
console.log("\n--- C: D-15's one compilation point, asserted STRUCTURALLY ---");
/* A passing gate arm cannot tell "compiled once" from "compiled twice,
   identically, today", and the second decays into the first defect the day one
   copy is edited. So the method's own comment-stripped segment is read. */
const decomment = (text) => text.split("\n").map(((state) => (L) => {
  let out = "", i = 0;
  while (i < L.length) {
    if (state.block) { const e = L.indexOf("*/", i); if (e < 0) { i = L.length; } else { state.block = false; i = e + 2; } continue; }
    const b = L.indexOf("/*", i), s = L.indexOf("//", i);
    if (b >= 0 && (s < 0 || b < s)) { out += L.slice(i, b); state.block = true; i = b + 2; continue; }
    if (s >= 0 && (b < 0 || s < b)) { out += L.slice(i, s); i = L.length; continue; }
    out += L.slice(i); i = L.length;
  }
  return out;
})({ block: false })).join("\n");
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
const CODE = decomment(SRC_STORE);
const SEGS = segments(CODE);
const SEG = SEGS.get("aiRunsInContext") || "";
t("SEGMENT GUARD: the walk below actually found the method, and found a plausible amount of it — a "
+ "segment this reader could not locate would make every assertion in this section vacuous",
  [SEG.length > 400, /aiRunsInContext\(\{/.test(SEG)], [true, true]);
t("SEGMENT GUARD: and the segmenter is bounded by the NEXT method rather than running into it",
  /#biasForRun/.test(SEG), false);
t("THE GATE IS `#bundleGate` ON `context_id` — the same call its three run-id-keyed siblings make",
  (SEG.match(/this\.#bundleGate\("r\.context_id", viewer\)/g) || []).length, 1);
t("AND NO SECOND PREDICATE IS COMPILED HERE: the method never calls `viewerPredicate`, never writes "
+ "its own `EXISTS (SELECT … FROM bundles` and never restates the MACHINE carve-out or the "
+ "FAIL-CLOSED deny. PL-11 measured that viewerPredicate's machine alternation returns an "
+ "unfiltered `1=1`, so a hand-rolled copy that got either arm wrong is the difference between an "
+ "outage and handing an agent the whole store",
  [/viewerPredicate\s*\(/.test(SEG), /FROM bundles\b/.test(SEG),
   /scope\s*===\s*["']member["']/.test(SEG), /["']DENY["']/.test(SEG)],
  [false, false, false, false]);
t("STRUCTURAL POLARITY: the same reader over a source that DOES compile a second predicate FINDS it "
+ "— so the four `false`s above are a measurement rather than a matcher that never matches",
  [/viewerPredicate\s*\(/.test("const g = viewerPredicate(viewer);"),
   /FROM bundles\b/.test("EXISTS (SELECT 1 FROM bundles b WHERE b.bundle_id = x)")],
  [true, true]);
t("THE WHOLE PLANE STILL COMPILES THE PREDICATE IN ONE PLACE — `viewerPredicate` is called only by "
+ "the three helpers that exist for it, and this op added no fourth caller",
  (CODE.match(/viewerPredicate\(/g) || []).length,
  (readFileSync(new URL("../src/store.mjs", import.meta.url), "utf8"), (CODE.match(/viewerPredicate\(/g) || []).length));
t("and the gate is inside the SAME statement as the LIMIT, which is what makes `truncated` a fact "
+ "about what this viewer may see — pinned off the source because D-227 measured that an honest "
+ "envelope can sit over a scan whose clause was removed",
  /WHERE lower\(r\.context_type\) = \? AND r\.context_id = \? AND \$\{seen\.sql\}[^]{0,200}LIMIT \?/.test(SEG),
  true);

/* =================================================================== *
 * D · THE ENVELOPE AND THE THREE REFUSALS.
 * ========================================================================== */
console.log("\n--- D: the bound published after clamping, and DEC-49's three codes ---");

const overAsk = await GET(`op=airuns&token=${dave}&contextType=inquiry&contextId=${INQ}&limit=99999`);
t("AN OVER-ASK IS CLAMPED AND THE CLAMP IS WHAT IS PUBLISHED — answering 99999 to a caller who asked "
+ "99999 and got 1000 is a second way of lying about the same fact",
  overAsk.limit, 1000);
const bite = await GET(`op=airuns&token=${dave}&contextType=inquiry&contextId=${INQ}&limit=1`);
t("a cut answer says so and publishes the bound it APPLIED", [bite.limit, bite.truncated, bite.count],
  [1, true, 1]);
t("DELTA — a complete answer and a cut one do NOT read alike over the same store",
  [overAsk.truncated, bite.truncated], [false, true]);
t("THE BOUND IS PUBLISHED ON THE EMPTY ANSWER TOO: a reader who sees nothing must not have to guess "
+ "which bound they would have been answered at",
  [Object.hasOwn(daveProj, "limit"), Object.hasOwn(daveProj, "truncated"), daveProj.limit],
  [true, true, 200]);
t("THE ANSWER IS AN ENVELOPE AND NOT A BARE COLLECTION (IC-25/IC-26) — `bounds.test.mjs` pins ZERO "
+ "capped ops answering with a bare array and there is no exception list to join",
  Array.isArray(await GET(`op=airuns&token=${dave}&contextType=inquiry&contextId=${INQ}`)), false);
t("the context is echoed NORMALISED, so a caller reads what was actually asked",
  [overAsk.context?.type, overAsk.context?.id], ["inquiry", INQ]);

/* THE THREE REFUSALS. Every expected string is read LIVE from the catalogue —
   typing one here would be the hand copy DEC-49's own acceptance forbids. */
const noType = await GET(`op=airuns&token=${dave}&contextId=${INQ}`);
t("C-34.1 — no context KIND named: refused with its code, its C-number and the CANNED TRANSLATION "
+ "read from the one row, never composed here",
  [noType.ok, noType.reason, noType.code, noType.check, noType.translation],
  [false, "AI_RUNS_NO_CONTEXT_TYPE", "AI_RUNS_NO_CONTEXT_TYPE",
   AI_RUNS_CONTEXT_CHECKS.AI_RUNS_NO_CONTEXT_TYPE.check,
   AI_RUNS_CONTEXT_CHECKS.AI_RUNS_NO_CONTEXT_TYPE.translation]);
const badType = await GET(`op=airuns&token=${dave}&contextType=meeting&contextId=${INQ}`);
t("C-34.2 — an UNRECOGNISED kind is REFUSED, never answered empty. An empty list here would tell a "
+ "member nothing is running, on the strength of a word the record did not recognise: a claim about "
+ "the record manufactured out of a typo, which is REC-52/D-197's class arriving by the front door",
  [badType.ok, badType.reason, badType.check, badType.translation],
  [false, "AI_RUNS_UNKNOWN_CONTEXT_TYPE",
   AI_RUNS_CONTEXT_CHECKS.AI_RUNS_UNKNOWN_CONTEXT_TYPE.check,
   AI_RUNS_CONTEXT_CHECKS.AI_RUNS_UNKNOWN_CONTEXT_TYPE.translation]);
t("and its DETAIL names the kinds the record DOES hold, taken from the plane's own live vocabulary "
+ "rather than typed at the site — a two-word hand copy agrees with itself for free",
  Object.keys(RUN_CONTEXTS).every((k) => badType.detail.includes(k)
                                      && badType.detail.includes(RUN_CONTEXTS[k])), true);
const noId = await GET(`op=airuns&token=${dave}&contextType=inquiry`);
t("C-34.3 — a kind but no WHICH ONE: refused, because the gate compiles over the context's own id "
+ "and a blank one asks about every context at once",
  [noId.ok, noId.reason, noId.check, noId.translation],
  [false, "AI_RUNS_NO_CONTEXT_ID", AI_RUNS_CONTEXT_CHECKS.AI_RUNS_NO_CONTEXT_ID.check,
   AI_RUNS_CONTEXT_CHECKS.AI_RUNS_NO_CONTEXT_ID.translation]);
t("EVERY row in the family is DRIVEN here — a code added tomorrow fails until somebody drives it, "
+ "which is what stops this section covering less than the family claims",
  [...new Set([noType.reason, badType.reason, noId.reason])].sort(),
  Object.keys(AI_RUNS_CONTEXT_CHECKS).sort());
t("and each row's `where` names a REGION rather than the whole method — DEC-49's smallest-span rule, "
+ "and the region markers really are in the plane",
  [Object.values(AI_RUNS_CONTEXT_CHECKS).every((r) => / > is-airuns-context\b/.test(r.where)),
   /* ANCHORED ON THE OPENING COMMENT, not on the bare phrase: `END DEC-49
      REGION is-airuns-context` CONTAINS the opening spelling, so a naive count
      reads 2 for one correctly-formed pair. The first draft of this arm did
      exactly that and failed against a correct region — recorded rather than
      quietly fixed, because a matcher that counts its own closing marker is how
      a guard starts disagreeing with the thing it guards. */
   (SRC_STORE.match(/\/\* DEC-49 REGION is-airuns-context/g) || []).length,
   (SRC_STORE.match(/END DEC-49 REGION is-airuns-context/g) || []).length],
  [true, 1, 1]);

/* ARM R · OVER-STRICTNESS. A correctly formed request in a spelling this file
   did not anticipate must still be ANSWERED. Named as its own arm because the
   two refusals above are the kind of guard that gets tightened until it refuses
   real callers, and nothing else here would notice. */
console.log("\n--- ARM R: over-strictness — a correct request phrased unlike anything above ---");
const shouty = await GET(`op=airuns&token=${dave}&contextType=${encodeURIComponent("  INQUIRY  ")}`
                       + `&contextId=${encodeURIComponent(` ${INQ} `)}`);
t("ARM R: `  INQUIRY  ` with padding, and a padded id, is ANSWERED — not refused — and answers "
+ "exactly what the tidy spelling answered",
  [shouty.ok, idsOf(shouty)], [true, ["RUN-r69-inq-a", "RUN-r69-inq-b"]]);
t("ARM R: and the WRITE's own casing is honoured on the way back. `aiRunOpen` stores the kind "
+ "VERBATIM, so a run opened as `Inquiry` is in the record — a case-sensitive match here would "
+ "answer 'nothing is running' over a run that plainly is",
  await (async () => {
    await open(carol, "RUN-r69-case", "Inquiry", OTHER, "opened with a capitalised kind");
    const a = await GET(`op=airuns&token=${dave}&contextType=inquiry&contextId=${OTHER}`);
    return idsOf(a);
  })(), ["RUN-r69-case", "RUN-r69-other"]);

/* =================================================================== *
 * THE CLASS SWEEP — printed with its corpus and its reach, and it says
 * plainly what it can and cannot see.
 * ========================================================================== */
console.log("\n--- SWEEP: an ACCESS PATH the schema built for a question no op asks ---");
/* WHY THIS IS THE RIGHT FINGERPRINT, and it is REC-69's own history rather than
   a guess. `schema.mjs` carried `CREATE INDEX ai_runs_context ON ai_runs(context_id)`
   from the day IS-6 landed, and NOT ONE statement in the plane filtered
   `ai_runs` by `context_id`. Somebody built the access path for the question
   §14a promises and no op ever asked it. An index whose leading column no
   statement filters on is therefore a cheap, mechanical signal of exactly the
   gap UI-49 found by hand — and unlike "read every op and imagine a surface",
   it can be run every build.
 *
 * WHAT THIS SWEEP CAN AND CANNOT SEE, stated rather than discovered later:
 *   CAN   — an index on a table this plane queries, whose leading column appears
 *           in no `WHERE`/`AND` clause naming it anywhere in store.mjs or query.mjs.
 *   CANNOT — an index used only through a JOIN's ON clause, an index whose column
 *           is filtered through a dynamically composed fragment, or a missing
 *           question that has NO index behind it. The last is the big one: this
 *           finds paths built and unused, never questions nobody prepared for.
 *           It is a FLOOR on the class, not a census of it. */
const SQLSRC = decomment(SRC_STORE) + "\n"
             + decomment(readFileSync(new URL("../src/query.mjs", import.meta.url), "utf8"));
const INDEXES = [...SRC_SCHEMA.matchAll(/CREATE INDEX IF NOT EXISTS\s+(\w+)\s+ON\s+(\w+)\s*\(([^)]*)\)/g)]
  .map((m) => ({ index: m[1], table: m[2], lead: m[3].split(",")[0].trim() }));
const filtersOn = (col) =>
  new RegExp(`(?:WHERE|AND|OR)\\s+(?:\\w+\\.)?${col}\\s*(?:=|IN|>|<|LIKE|IS)`, "i").test(SQLSRC)
  || new RegExp(`\\blower\\((?:\\w+\\.)?${col}\\)\\s*=`, "i").test(SQLSRC);
const unread = INDEXES.filter((ix) => !filtersOn(ix.lead));
console.log(`  SWEEP CORPUS: ${INDEXES.length} indexes declared in schema.mjs, read against `
          + `${SQLSRC.length} chars of comment-stripped SQL in store.mjs + query.mjs`);
console.log(`  SWEEP REACH: ${INDEXES.length - unread.length} of ${INDEXES.length} indexes have a `
          + `statement filtering their leading column; ${unread.length} do not`);
for (const ix of unread) console.log(`    UNREAD  ${ix.index}  ->  ${ix.table}(${ix.lead})`);
t("SWEEP GUARD: the corpus is REAL — schema.mjs declares a plausible number of indexes and the SQL "
+ "corpus is non-empty. A walk over nothing reports a beautiful zero",
  [INDEXES.length > 20, SQLSRC.length > 100000], [true, true]);
t("SWEEP GUARD: and the reader can SEE a filtered column when there is one — polarity, so the "
+ "unread list below is a measurement rather than a matcher that never matches",
  [filtersOn("context_id"), filtersOn("zzz_no_such_column_anywhere")], [true, false]);
t("SWEEP: `ai_runs_context` — THE INDEX THIS ITEM WAS ABOUT — now has a reader. It was declared the "
+ "day IS-6 landed and nothing filtered `ai_runs` by `context_id` until op=airuns, which is the "
+ "access path having been built for a question no op asked",
  unread.some((ix) => ix.index === "ai_runs_context"), false);
/* WHAT THE SWEEP ACTUALLY FOUND, MEASURED 2026-08-08 by REC-69 and printed
   above every run: ELEVEN indexes whose leading column no statement filters on.
   Three were read by hand before this figure was pinned, so it is a measurement
   rather than a regex's opinion:
     `links(source_bundle)`     — `source_bundle` appears in this plane ONLY in an
                                  INSERT's column list and in one projected field.
                                  Nothing asks "which links start at this bundle".
     `tasks(assignee)`          — `assignee` appears ONLY as a field set to null.
                                  Nothing asks "what is assigned to me", which is
                                  a question an inbox surface plainly needs.
     `inquiry_basis(grade_source)` — appears only where a row is PROJECTED. Nothing
                                  asks "which legs got their grade from a
                                  resolution rather than from a member".
   Each is REC-69's own shape: an access path built for a question, and no op that
   asks it. They are NOT fixed here — this item builds one op, and eleven ops on
   one battery is how a diff stops being reviewable — they are DELEGATED with this
   list, which is the whole output of a sweep. */
t("SWEEP: and the finding is RATCHETED as a CEILING — an index added tomorrow with no statement "
+ "filtering its leading column pushes this over and fails HERE, naming the index, which is the "
+ "one thing UI-49 had to find by trying to build a surface",
  unread.length <= 11, true);
t("SWEEP: a FLOOR beside the ceiling — the list shrinking without this figure being moved means the "
+ "READER lost sight of indexes, not that the plane got better. REC-70's ratchet spent two days "
+ "reporting 27 over a corpus it could not see",
  unread.length >= 11, true);

await mf.dispose();
console.log(`\nairuns: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
