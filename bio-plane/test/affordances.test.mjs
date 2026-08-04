/* NEGATIVE CONTROL: STRUCTURAL, the item's own (REC-19) — add an op to NEEDS in src/index.mjs (e.g. `frobnicate: "contribute",`) WITHOUT adding it to the affordances derivation -> the totality assertion here fails NAMING `frobnicate` as the unpublished op; restored -> green. Recorded as run below in the suite header. */
/* op=affordances (REC-19, standing doctrine DEC-8): the plane publishes what may
 * be DONE to an object, so an act surface renders options it RECEIVED and never
 * computes one. whoami publishes capabilities, searchfields publishes the query
 * language; this extends the pattern to the act construct and mints no new one.
 *
 * What this suite holds the op to:
 *
 *   EXACTLY THE ACTS THE PLANE WOULD PERMIT. Every published act is then
 *   PERFORMED through the very op it names, and every unpublished act is
 *   ATTEMPTED and refused by the store — so the publication and the refusal are
 *   held together in both directions, on the same objects, in the same run:
 *     - a `collected` information bundle publishes {cite, release} — release is
 *       then actually run (by a named member) and succeeds; retire is attempted
 *       and refused ILLEGAL_TRANSITION;
 *     - a `verified` bundle carrying a LIVE cites edge does NOT publish retire —
 *       and retire, attempted anyway, is refused CITED naming the citing
 *       project (the accepts-when headline);
 *     - severing the edge makes retire appear, and retire then succeeds — a
 *       severed edge is a recorded decision, not a live dependency;
 *     - an `elevated` focus and an `action` bundle publish an EMPTY act list,
 *       and the empty list is proven honest by the store's own refusal.
 *
 *   NOTHING DRIFTS. Every op in NEEDS is either a published act or named in
 *   NON_ACTS with its reason — the totality assertion parses NEEDS out of the
 *   index.mjs source (the capability suite's own technique) and fails NAMING
 *   the op, which is the negative control above. The disposition vocabulary is
 *   the ONE array: store.mjs imports it (REC-11's folded chore — the old pin
 *   of two identical literals is superseded, corrected below), and the
 *   action_kind vocabulary is identical to the array C-2.10 enforces.
 *
 *   DECLARED, NOT GUESSED. rung is null for every op no document assigns one
 *   (cite above all); the seven sourced rungs are the only ones RUNGS carries.
 *   weight is cross-checked against what the acting ops themselves report.
 *
 * NEGATIVE CONTROL RUN 2026-08-03 (rec19-agent): added `frobnicate: "contribute",`
 * to NEEDS in src/index.mjs, ran this suite -> the totality assertion FAILED with
 * got ["frobnicate"] (the unpublished op named); removed the line -> suite green.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { ACTS, ACT_IDS, NON_ACTS, RUNGS, VOCABULARIES, DISPOSITIONS, deriveActs }
  from "../src/affordances.mjs";
import { ACTION_KINDS } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec19", MEMBER_TOKEN: "mem-rec19", PROBE_TOKEN: "prb-rec19", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
/* THE op under test, through the control plane (a real caller's only route),
   the literal `op=affordances` uninterpolated so coverage credits it there. */
const affordances = async (target, tok = "mem-rec19") =>
  await GET(`op=affordances&token=${tok}${target ? `&target=${encodeURIComponent(target)}` : ""}`);
const actIds = (r) => (r.result?.acts ?? []).map((a) => a.id).sort();

/* ------------------------------------------------------------- structural */
/* NEEDS and OPS are read out of the SOURCE, the capability suite's technique,
   so an op added later cannot pass by not being mentioned. */
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");
function tableKeys(src, name) {
  const m = new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*\\{`).exec(src);
  if (!m) throw new Error(`${name} table not found`);
  let i = src.indexOf("{", m.index), depth = 0, end = -1;
  for (let p = i; p < src.length; p++) {
    if (src[p] === "{") depth++;
    else if (src[p] === "}") { depth--; if (depth === 0) { end = p; break; } }
  }
  const body = stripComments(src.slice(i + 1, end));
  return [...body.matchAll(/^\s{2}([a-z][a-zA-Z0-9_]*)\s*:/gm)].map((x) => x[1]);
}
const indexSrc = readFileSync(IDX, "utf8");
const storeSrc = readFileSync(STORE_SRC, "utf8");
const needsKeys = tableKeys(indexSrc, "NEEDS");
const opsKeys = tableKeys(indexSrc, "OPS");

console.log("\n--- structural: the derivation is TOTAL over NEEDS (the drift guard) ---");
t("every op in NEEDS is a published act or a named NON_ACT — an op in neither is UNPUBLISHED and fails here by name",
  needsKeys.filter((k) => !ACT_IDS.has(k) && !(k in NON_ACTS)), []);
t("NON_ACTS names only ops that exist in NEEDS (the registry cannot hold ghosts)",
  Object.keys(NON_ACTS).filter((k) => !needsKeys.includes(k)), []);
t("no op is both an act and a NON_ACT",
  [...ACT_IDS].filter((k) => k in NON_ACTS), []);
t("every published act is a real op in the OPS table",
  [...ACT_IDS].filter((k) => !opsKeys.includes(k)), []);
t("every published act carries a NEEDS entry (all seven are mutating session acts)",
  [...ACT_IDS].filter((k) => !needsKeys.includes(k)), []);

console.log("\n--- structural: vocabularies and rungs are the enforcing tables, not copies ---");
/* Superseded 2026-08-03 (REC-11's folded chore): the old assertion pinned
   dispose()'s LITERAL copy of the disposition set identical to the published
   one — right while two arrays existed, wrong once REC-11 flipped the
   direction and made store.mjs IMPORT the published set. The pin's subject
   (a second array that could drift) no longer exists by design, so the
   corrected assertion is structural: the import is present and no literal
   copy survives anywhere in the write path for it to drift against. */
/* Corrected 2026-08-03 (REC-20): the regex pinned the WHOLE import clause
   (`{ DISPOSITIONS }`), so it failed the moment store.mjs took a SECOND named
   binding from the same module — REC-20 imports deriveActs from here so
   op=queue's options[] are this file's derivation and not a copy of it. The
   old form measured the clause; the rule is about the BINDING and the absence
   of a literal, so it now matches DISPOSITIONS wherever it sits in the list. */
t("dispose() enforces the PUBLISHED set: store.mjs imports DISPOSITIONS from affordances.mjs and keeps no literal copy",
  /import \{[^}]*\bDISPOSITIONS\b[^}]*\} from "\.\/affordances\.mjs"/.test(storeSrc)
    && !/const DISPOSITIONS = \[/.test(storeSrc), true);
t("the published action_kind vocabulary IS the array C-2.10 enforces (one import, no copy)",
  VOCABULARIES.action_kind, ACTION_KINDS);
t("action_kind is the seven-value suite",
  ACTION_KINDS, ["cpra_request", "grand_jury", "controller_referral", "public_comment", "media", "litigation_support", "other"]);
t("RUNGS carries EXACTLY the seven documented assignments — nothing invented (FW-14 assigns the rest)",
  Object.entries(RUNGS).sort(),
  [["attest", "attested"], ["dispose", "reasoned"], ["ratify", "attested"], ["reinstate", "reasoned"],
   ["release", "reasoned"], ["retire", "terminal"], ["sever", "reasoned"]].sort());

/* ------------------------------------------------------------- fixtures */
const NOW = "2026-07-01T00:00:00Z";
const infoMd = (id, state, contentHash) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@2",
  `title: "Info ${id}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  ...(contentHash ? [`content_hash: "${contentHash}"`] : []),
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "criticality: supporting",
  "source:", `  locator: "https://oaklandca.opengov.com/${id}"`,
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "---", "", "## Summary", "", "Record body.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
const projMd = (id) => [
  "---", `id: ${id}`, "object_type: project", "schema: project@1",
  `title: "Project ${id}"`, "current_state: forming", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "---", "", "## Thesis Summary", "", "X.", "", "## Open Questions", "",
  "## Ruled Out", "", "## Session Log", "", "## Review Notes", "",
].join("\n");
const focusMd = (id, state) => [
  "---", `id: ${id}`, "object_type: focus", "schema: focus@1",
  `title: "Focus ${id}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "surfaced_by: human", 'disposition_reason: ""',
  "---", "", "## Statement", "", "S.", "", "## Why It Matters", "",
  "## Open Questions", "", "## Session Log", "", "## Review Notes", "",
].join("\n");
const actnMd = (id) => [
  "---", `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "Action ${id}"`, "current_state: planned", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "action_kind: cpra_request", "risk_tier: 1", "counterparty: City Clerk",
  "---", "", "## Plan", "", "P.", "", "## Status", "", "## Correspondence", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");

const promote = async (id, md, type, state, extraFiles = [], tok = "mem-rec19") => {
  const r = rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base: null, snapKey: "20260701T000000Z_aaaa1111", author: "seed",
    meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`,
            current_state: state, created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }, ...extraFiles],
    register: [],
  }));
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  return r;
};
const selectIds = async (ids, tok = "mem-rec19") => {
  const r = rP(await POST(`op=select&token=${tok}&kind=enumerated`, { ids }));
  if (!r.handle) throw new Error(`select: ${JSON.stringify(r)}`);
  return r.handle;
};

/* A NAMED member, because release is a member's decision (MACHINE_CANNOT_RELEASE)
   and "exactly the acts the plane would permit" is proven by performing them. */
const add = rP(await POST("op=memberadd&token=adm-rec19",
  { memberId: "ruth", cover: "cover for ruth", role: "admin", capabilities: ["contribute"] }));
const en = rP(await POST("op=enroll", { invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" }));
if (!en.ok) throw new Error("enroll: " + JSON.stringify(en));
const lg = rP(await POST("op=login", { role: "member:ruth", password: "ruth-passphrase-1" }));
const RUTH = lg.token;

/* ------------------------------------------------------- catalogue + gates */
console.log("\n--- the catalogue call: the full act table and the vocabularies, once ---");
const cat = await affordances(null);
/* Superseded 2026-08-03 (REC-13): six acts became SEVEN when `conclude` was
   published. The old count was not wrong when written — it was the whole
   catalogue then — and correcting it rather than loosening it is the point:
   this assertion exists so a published act cannot appear or vanish without a
   turn saying so, and a `>= 6` would have made it stop doing that. */
/* CORRECTED 2026-08-04 (REC-14), never exempted: the count is the point of
   this assertion — a published act may not appear or vanish without a turn
   saying so — so it MOVES to eight with `publish` rather than being loosened
   to a >=, which is exactly what the note above warns against. */
t("no target -> the whole catalogue: eight acts, each with id/label/weight/needs/mode/rung",
  [cat.ok, cat.result.catalog.length,
   cat.result.catalog.every((a) => ["id", "label", "weight", "needs", "mode", "rung"].every((k) => k in a))],
  [true, 8, true]);
t("the catalogue publishes the object vocabularies (searchfields' pattern): dispositions and the seven action kinds",
  [cat.result.vocabularies.dispositions, cat.result.vocabularies.action_kind.length],
  [["deferred", "dismissed"], 7]);
/* CORRECTED 2026-08-04 (REC-14), never exempted. The old assertion said every
   act needs `contribute`, which was true while every act was a corpus-shaping
   one. `publish` is not: concluding says what the record shows, publishing puts
   the group's name on it and states in the group's voice what it does not cover
   and whether it was put to its subject — that is the PUBLICATION surface, the
   same capability op=ratify carries, and a member who may not publish may not
   author the case either. Still composed rather than hand-listed: `mode` comes
   from SESSION_OPS for every act, and exactly one act names the other
   capability. */
t("every act is session-reachable, and each carries the capability its own NEEDS entry names — publish rides the publication surface, not the contribute one",
  cat.result.catalog.map((a) => [a.needs, a.mode]),
  cat.result.catalog.map((a) => [a.id === "publish" ? "publish" : "contribute", "session"]));
t("rung is DECLARED: cite is null (no document assigns one — FW-14's, not ours), retire is terminal",
  [cat.result.catalog.find((a) => a.id === "cite").rung,
   cat.result.catalog.find((a) => a.id === "retire").rung], [null, "terminal"]);
const unauth = await (await mf.dispatchFetch("http://x/api/?op=affordances")).json();
t("unauthenticated is refused: the act surface reads the working corpus", unauth.ok, false);
const missing = await affordances("INFO-2026-9999-ghost");
t("an unknown target is NO_SUCH_BUNDLE, not an empty act list",
  [missing.ok, missing.reason], [false, "NO_SUCH_BUNDLE"]);

/* -------------------------------------------- collected information bundle */
console.log("\n--- a COLLECTED information bundle: exactly {cite, release}, then PROVEN ---");
const A = "INFO-2026-0001-rec19";
const ds = JSON.stringify({ rows: [] });
const snap = "<html>snapshot</html>";
await promote(A, infoMd(A, "collected", `sha256:${sha("body A")}`), "information", "collected", [
  { path: "data/dataset.json", text: ds, bytes: ds.length, sha256: sha(ds) },
  { path: "snapshots/page.html", text: snap, bytes: snap.length, sha256: sha(snap) },
]);
const affA0 = await affordances(A);
t("collected information publishes EXACTLY the acts the plane would permit: cite and release",
  actIds(affA0), ["cite", "release"]);
t("each act carries its needs (the capability the gate will actually ask for)",
  affA0.result.acts.map((a) => a.needs), ["contribute", "contribute"]);
t("release's rung is its sourced `reasoned`; cite's is null — published distinctly from weight (C-6)",
  affA0.result.acts.map((a) => [a.id, a.rung, a.weight]).sort(),
  [["cite", null, "report"], ["release", "reasoned", "refuse"]].sort());

/* retire is UNPUBLISHED for a collected bundle — and the store agrees by name. */
const hA1 = await selectIds([A], RUTH);
const retA = rP(await GET(`op=retire&token=${RUTH}&handle=${hA1}&reason=too+early`));
t("retire, attempted on the collected bundle anyway, is refused ILLEGAL_TRANSITION — the unpublished act is the refused act",
  [retA.ok, retA.reason], [false, "ILLEGAL_TRANSITION"]);

/* release, the PUBLISHED act, performed by a named member: it succeeds, and its
   reported weight is the published one. */
const hA2 = await selectIds([A], RUTH);
const rel = rP(await GET(`op=release&token=${RUTH}&handle=${hA2}`
  + `&acknowledgment=${encodeURIComponent("homogeneous batch of one, risks weighed")}`
  + `&mitigation=${encodeURIComponent("sender domain verified by hand")}`));
t("release — the published act — succeeds for the named member, at the published weight",
  [rel.ok, rel.released, rel.weight],
  [true, [A], cat.result.catalog.find((a) => a.id === "release").weight]);
const affA1 = await affordances(A);
t("now verified and uncited: retire appears, release leaves — the state machine drives the list",
  actIds(affA1), ["cite", "retire"]);

/* --------------------------- verified bundle carrying a LIVE cites edge */
console.log("\n--- a VERIFIED bundle with a LIVE cites edge: retire is NOT published (DEC-8's headline) ---");
const B = "INFO-2026-0002-rec19";
const P = "PROJ-2026-0001-rec19";
await promote(B, infoMd(B, "verified", `sha256:${sha("body B")}`), "information", "verified");
await promote(P, projMd(P), "project", "forming");
const hB1 = await selectIds([B]);
const cited = rP(await GET(`op=cite&token=mem-rec19&project=${P}&handle=${hB1}&note=basis`));
t("cite — published for any information bundle — succeeds at the published report weight",
  [cited.ok, cited.cited, cited.weight],
  [true, [B], cat.result.catalog.find((a) => a.id === "cite").weight]);
const affB0 = await affordances(B);
t("the LIVE-cited verified bundle does NOT publish retire — and sever appears, because the edge exists",
  actIds(affB0), ["cite", "sever"]);
t("retire absent is the derivation, not luck: the state machine ALLOWS verified->retired here",
  affB0.result.current_state, "verified");
const hB2 = await selectIds([B]);
const retB = rP(await GET(`op=retire&token=mem-rec19&handle=${hB2}&reason=obsolete`));
t("retire, attempted anyway, is refused CITED naming the citing project — publication and refusal agree",
  [retB.ok, retB.reason, retB.offenders.map((o) => o.citedBy).flat()], [false, "CITED", [P]]);
const affP0 = await affordances(P);
t("the citing project publishes {cite, sever}: its own live edge is what sever would move",
  actIds(affP0), ["cite", "sever"]);

/* severing clears the block: a severed edge is a recorded decision, not a live
   dependency, so retire APPEARS and then SUCCEEDS. */
const hB3 = await selectIds([B]);
const sev = rP(await GET(`op=sever&token=mem-rec19&project=${P}&handle=${hB3}&reason=superseded+by+later+capture`));
t("sever succeeds with its reason", [sev.ok, sev.severed], [true, [B]]);
const affB1 = await affordances(B);
t("after severing: retire appears (the severed edge no longer blocks) and reinstate appears (the edge is recorded)",
  actIds(affB1), ["cite", "reinstate", "retire"]);
const affP1 = await affordances(P);
t("the project now publishes {cite, reinstate}: nothing live to sever, one severed edge to reinstate",
  actIds(affP1), ["cite", "reinstate"]);
const hB4 = await selectIds([B]);
const retB2 = rP(await GET(`op=retire&token=mem-rec19&handle=${hB4}&reason=superseded`));
t("retire — now published — succeeds at the published refuse weight",
  [retB2.ok, retB2.retired, retB2.weight],
  [true, [B], cat.result.catalog.find((a) => a.id === "retire").weight]);
const affB2 = await affordances(B);
t("retired is terminal: only cite (the store checks type, not state — published honestly) and reinstate remain",
  actIds(affB2), ["cite", "reinstate"]);

/* --------------------------------------------------------------- focus */
console.log("\n--- a focus: dispose while an edge exists, EMPTY when elevated — and the empty list is honest ---");
const F = "FOCUS-2026-0001-rec19";
const F2 = "FOCUS-2026-0002-rec19";
await promote(F, focusMd(F, "surfaced"), "focus", "surfaced");
await promote(F2, focusMd(F2, "elevated"), "focus", "elevated");
/* This list became LOAD-BEARING at REC-13. `conclude` is published for an
   inquiry offering the `concluded` edge, and a legacy focus document's row
   says `inquiry` (promote projects the NORMALIZED type) while its own machine
   has no `concluded` in it — so the derivation only answers `{dispose}` here
   because it consults vocabFor over the DECLARED spelling. Conclude's own
   suite proves the store refuses the same document by name. */
t("a surfaced focus publishes exactly {dispose}; the disposition TARGETS come from the vocabulary, not a UI copy",
  actIds(await affordances(F)), ["dispose"]);
const affF2 = await affordances(F2);
t("an elevated focus publishes NO acts: elevated has no legal edge and elevation is not a bulk flip",
  actIds(affF2), []);
const hF2 = await selectIds([F2]);
const dispF2 = rP(await GET(`op=dispose&token=mem-rec19&handle=${hF2}&to=deferred&reason=not+now`));
t("the empty list is honest: disposing the elevated focus is refused ILLEGAL_TRANSITION by the store",
  [dispF2.ok, dispF2.reason], [false, "ILLEGAL_TRANSITION"]);

/* --------------------------------------------------------------- action */
console.log("\n--- an action bundle: EMPTY, stated — nothing operates one until REC-24 ---");
const ACTN = "ACTN-2026-0001-rec19";
await promote(ACTN, actnMd(ACTN), "action", "planned");
const affActn = await affordances(ACTN);
t("an action bundle publishes an empty act list (REC-24 builds its ops); inventing one here would be the forbidden map",
  [affActn.ok, actIds(affActn)], [true, []]);

/* ----------------------------------------- rung honesty across everything */
console.log("\n--- rung honesty: null wherever no document assigns one ---");
const everyAct = [affA0, affA1, affB0, affB1, affB2, affP0, affP1].flatMap((r) => r.result.acts);
t("across every response: rung is a sourced value or null, and cite is ALWAYS null",
  [everyAct.every((a) => [null, "reasoned", "terminal", "attested"].includes(a.rung)),
   everyAct.filter((a) => a.id === "cite").every((a) => a.rung === null)], [true, true]);
t("the derivation module agrees with the wire (no second copy in the handler)",
  deriveActs({ object_type: "information", current_state: "collected",
               cites_in: { confirmed: [], severed: [] }, cites_out: { confirmed: 0, severed: 0 } })
    .map((a) => a.id).sort(), ["cite", "release"]);

/* probe class reaches it, confined to scratch as everywhere. */
const prb = await affordances(null, "prb-rec19");
t("probe class reaches the catalogue (the surface is exercisable against scratch)", prb.ok, true);

await mf.dispose();
console.log(`\naffordances: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
