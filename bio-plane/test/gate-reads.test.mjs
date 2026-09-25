/* NEGATIVE CONTROL: (run 2026-08-03, rec25-agent) TWO arms, both required because the store FAILS CLOSED. (a) Remove `op === "list"` from the viewer-stamp condition in src/index.mjs (the REC-25 stamp block) -> 6 assertions fail, ALL naming op=list, across every viewer (empty answers: a missing stamp is an outage, never a leak — the doctrinal failure mode). (b) Neuter the DO gate instead — in src/store.mjs listBundles, replace the gate predicate with 1=1 -> 3 assertions fail naming op=list as THE LEAK (dave receives the project row). Restored -> 36 pass. Detail below. */
/* NEGATIVE CONTROL (REC-30, run 2026-08-03, rec30-agent): THREE arms, one per mechanism the sweep added, each restored after running. (a) THE ITEM'S OWN — restore the dangling leak: in src/store.mjs danglingRefs, change the WHERE to `AND (1=1 OR ${seen.sql})` -> 3 assertions fail NAMING op=dangling, and the got carries PROJ-2026-0001-secret (the citing project's id, the measured leak) -> restored, 96 pass. (b) THE FAIL-CLOSED ARM — delete "dangling" from REC30_VIEWER_READS in src/index.mjs -> 5 assertions fail naming op=dangling, every answer EMPTY for every viewer including the machine credential (a missing stamp is an outage, never a leak) AND the impostor assertion flips, proving the caller-supplied `viewer=class:member` is HONOURED the moment the server stops overwriting it — REC-29's carried lesson, demonstrated. (c) THE BACK-REFERENCE ARM — neuter the projection: make src/store.mjs's #bundleRedactor return the identity (`return (id) => id ?? null;` as its first line) -> 8 assertions fail across op=reading, op=readingref, op=resolutions, op=concerns, op=connections, op=instance and op=exceptions, every one of them handing the uninvited member the secret project's id -> restored, 96 pass. */
/* NEGATIVE CONTROL, RE-RUN ON THE MERGED TREE (2026-08-04, rec30-agent, after origin/main b6e957c brought REC-14's published/editions in), all four arms restored after running: (a) 3 failures naming op=dangling; (b) 5 failures, every answer empty, the impostor assertion flipping; (c) now 12 failures, because REC-14's op=strengthbarof shares #bundleRedactor and joins the same class; and NEW (d) THE BAR ARM — restore REC-14's leak by making src/store.mjs's strengthBarOf return the raw bar (`if (true) return { ok: true, target, bar };` in place of the `!Array.isArray(bar.projects)` early return) -> 4 assertions fail, the uninvited member receiving `projects: ["PROJ-2026-0001-secret"]` and the same ids interpolated into the bar's prose -> restored, 110 pass. */
/* REC-25 / F-8 / D-135 / D-141: the D-15 viewer gate stamped on ALL read paths.
 *
 * WHAT THIS CLOSES. index.mjs stamped the viewer for op=search, op=select and
 * the edge actions only. op=list, op=index, op=projection, op=image, op=file
 * and (since REC-19) op=affordances bypassed the stamp, so an uninvited
 * member's SESSION read every project's id, title and state — and op=image
 * handed over the project's entire document. Measured before the fix
 * (MEASUREMENTS.md, 2026-08-03, rec25-agent): all six ops leaked; op=search
 * alone was gated. §7.9 names the derived index as "the one place the graph
 * could escape".
 *
 * WHAT THIS SUITE HOLDS THE PLANE TO (the accepts-when, verbatim):
 *   - a member uninvited to a project gets that project from NONE of op=list,
 *     op=index, op=projection, op=image, op=search, op=affordances or a
 *     backlink — not its id, not its title, not its state;
 *   - NO MESSAGE DISCLOSES that anything was hidden: every id-addressed read
 *     of an invisible bundle is asserted BYTE-IDENTICAL (status and body) to
 *     the same read of a bundle that does not exist, and every enumeration is
 *     asserted equal to the exact visible set (totals included);
 *   - the invited member (the owner) still sees everything, an administrator
 *     sees everything (7.3), and a machine credential is not filtered (D-15's
 *     own deliberate carve-out — no person, no participation to check);
 *   - op=backlinks (NEW, this item): the plane-side gated reverse-edge read
 *     that lets the UI delete its client-side reverseRefs walk (app.html),
 *     which rebuilt the leak by walking every project's projection. The
 *     citing bundle is filtered by the VIEWER'S position; an invisible target
 *     answers NO_SUCH_BUNDLE exactly as an absent one.
 *
 * WHAT REC-30 ADDS (the sweep of the reads REC-25 did not address):
 *   - every REMAINING read op is swept against the same predicate, through the
 *     same single compilation point, and the leak the item was written from —
 *     op=dangling naming a citing project — is closed and controlled for;
 *   - the rule the sweep applies is stated once at the section head below: the
 *     ROW is withheld where the bundle is its subject, the REFERENCE alone where
 *     the row is about a capture or an entity, and the DERIVATION never changes
 *     with the reader;
 *   - every read op in the OPS table is CLASSIFIED, gated or deliberately
 *     ungated with its reason, and the classification is asserted structurally,
 *     so a read op added later fails this suite until somebody answers for it;
 *   - REC-29's carried lesson: every gate-like store parameter is asserted
 *     SERVER-STAMPED, because the passthrough copies each caller parameter into
 *     the inner URL and any gate driven by one is an impostor hole otherwise;
 *   - the DO envelope's `ms` field is gone at its source, and this suite's own
 *     client-side strip is CORRECTED away rather than exempted.
 *
 * NEGATIVE CONTROL RUN 2026-08-03 (rec25-agent), both arms:
 *   (a) stamp removed from op=list alone -> 6 assertions failed, all naming
 *       op=list (the uninvited, owner, admin, machine AND invited sections;
 *       every answer empty — nobody leaked, which is the fail-closed posture
 *       working) -> restored, 36 pass.
 *   (b) DO gate neutered in listBundles (predicate replaced with 1=1) ->
 *       3 assertions failed naming op=list as THE LEAK (dave received the
 *       project's full row; "op=list does not name the project" want false
 *       got true) -> restored, 36 pass, stable across 10 consecutive runs.
 */
import { statedJSON } from "./stated.mjs";
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "t-admin-rec25", MEMBER_TOKEN: "mem-rec25", PROBE_TOKEN: "prb-rec25", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* Reads keep status AND body: the no-disclosure assertions compare both, so a
   refusal that says the right thing with the wrong code cannot pass. Everything
   in the answer is compared exactly.

   CORRECTED BY REC-30, never exempted: this helper used to `delete body.ms`
   before comparing. The strip was right about the hazard and wrong about where
   to fix it — the DO envelope's `ms` measured the wall clock, not the answer, so
   a 0ms-vs-1ms pair made "hidden and absent answer byte-identically" flake about
   one run in twenty, and every future byte-comparison would have inherited the
   same trap. REC-30 removed the field at its source (store.mjs's DO envelope);
   nothing read it. So the strip is gone and the assertions below compare the
   WHOLE answer — and the `ms` assertions further down hold the plane to it. */
const GET = async (q) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`);
  return { status: r.status, body: await r.json() };
};
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

/* ------------------------------------------------------------------ fixture */

const member = async (id, caps, role = "member") => {
  const add = await POST("op=memberadd&token=t-admin-rec25",
    { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add.result?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.result.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en.result?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg.result?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.result.token;
};

/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane
   (Membership v2 §7). A null id builds CREATION bytes with no `id:` line (refused
   PROJECT_ID_IN_BYTES otherwise); mk then sends no bundleId (refused
   PROJECT_ID_SUPPLIED otherwise) and returns the minted id. */
const md = (id, type, refs = "") => `---\n${id === null ? "" : `id: ${id}\n`}object_type: ${type}\ncurrent_state: ${type === "project" ? "forming" : "collected"}\ncreated: "2026-07-01T00:00:00Z"\nlast_updated: "2026-07-01T00:00:00Z"\n${refs}---\n\n## Summary\n\nSecret plan.\n`;
/* REC-30 extends the fixture: a bundle may now also carry a CAPTURE — registered
   (so the task consumer can resolve an event back to it) and read (so FW-5's
   provenance reading lands in `readings`/`reading_refs`, which is what the whole
   recogniser and progression axis is built on). Everything REC-25 asserted is
   unchanged by it: the same three bundles, the same bundle.md. */
const mk = async (id, type, tok, refs = "", capture = null, label = id) => {
  const text = md(id, type, refs);
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  const register = [];
  if (capture) {
    const prov = JSON.stringify({ documents: [{
      capture: { sha256: capture.sha, encoding: "binary", bytes: 10 },
      reading: { content_type: "meeting_calendar", reader_version: 1, found: true,
                 at: "2026-07-01T00:00:00Z", entities: capture.entities } }] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
    register.push({ sha256: capture.sha, path: "captures/doc.pdf", encoding: "binary", bytes: 10 });
  }
  const r = await POST(`op=promote&token=${tok}`, {
    ...(id === null ? {} : { bundleId: id }), base: null, snapKey: `${label}-new`, author: "suite", files, register,
    meta: { object_type: type, group: "believe-in-oakland", title: label,
            current_state: type === "project" ? "forming" : "collected",
            created: "2026-07-01T00:00:00Z", last_updated: "2026-07-01T00:00:00Z" } });
  if (!r.result?.ok) throw new Error(`promote ${label}: ${JSON.stringify(r)}`);
  return r.result;
};

/* 4.2/4.3: the first two roster members must be administrators. ruth is the
   in-app administrator the 7.3 assertions use; carol OWNS the project (her
   session creates it, so the control plane stamps her ownerMemberId); dave is
   the uninvited member the whole item is about. */
const ruth = await member("ruth", ["contribute"], "admin");
await member("gus", ["contribute"], "admin");
const carol = await member("carol", ["contribute", "create_projects"]);
const dave = await member("dave", ["contribute"]);

const INFO = "INFO-2026-0001-shared";
const PROB = "PROB-2026-0001-shared";
/* CORRECTED 2026-09-18 (REC-141, IC-158): PROJ is the id the plane MINTS when carol
   creates the project below, no longer a chosen literal. */
let PROJ = null;
const MISSING = "PROJ-2026-9999-none";   // never created: the no-disclosure yardstick
const SHARED = [INFO, PROB];

/* REC-30: two references whose targets DO NOT EXIST, one on the shared evidence
   and one on the secret project. This is the measured leak the item names —
   op=dangling reported the CITING bundle, so a project that cited a target
   which was never created handed an uninvited member its own id. The shared
   one is the control: dave must still receive it, or a passing suite would only
   be proving that the answer was emptied. */
const PHANTOM_I = "INFO-2026-9999-phantom";
const PHANTOM_P = "PROB-2026-9999-phantom";
const dangle = (target) => `  - target: ${target}\n    rel: cites\n    status: confirmed\n    note: not yet captured\n`;
/* The capture each bundle files, and the entity reference its reading carries.
   Both documents name the SAME contract, which is what makes them resolve to one
   registry entity, connect to each other, and thread into one progression. */
const ISHA = sha("rec30-shared-capture");
const PSHA = sha("rec30-secret-capture");
const REF = { ref: "contract:C-2026-30", kind: "contract", key: "C-2026-30", label: "hauling contract" };

await mk(INFO, "information", "mem-rec25", `references:\n${dangle(PHANTOM_I)}`, { sha: ISHA, entities: [REF] });
await mk(PROB, "problem", "mem-rec25");
/* The project cites the shared evidence in its own frontmatter — `cites` lives
   on the citing object — so the reverse edge INTO the information is exactly
   the edge 7.9 says must be filtered by the viewer's position. */
/* REC-14's `required_strength` on the SECRET project, so op=strengthbarof has a
   real bar to report about the SHARED information the project cites — and a real
   project id to withhold while reporting it. */
{
  const projRefs = `references:\n  - target: ${INFO}\n    rel: cites\n    status: confirmed\n    note: evidence\n${dangle(PHANTOM_P)}`
    + `required_strength:\n  capture: B\n  connection: C\n`;
  const made = await mk(null, "project", carol, projRefs, { sha: PSHA, entities: [REF] }, "PROJ-2026-0001-secret");
  PROJ = made.bundleId;
  /* CORRECTED 2026-09-18 (REC-141): the fixture's title WAS its id, and every
     leak guard below that asks "does the answer contain PROJ" therefore caught a
     leaked TITLE as well as a leaked id. The minted id cannot be known before the
     creation, so the same bytes are revised once (base = the returned bundleSha)
     under the title PROJ — restoring title == id, so no guard is weakened. */
  const text = md(PROJ, "project", projRefs);
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: PSHA, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: true,
               at: "2026-07-01T00:00:00Z", entities: [REF] } }] });
  const rv = await POST(`op=promote&token=${carol}`, {
    bundleId: PROJ, base: made.bundleSha, snapKey: `${PROJ}-title`, author: "suite",
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: [{ sha256: PSHA, path: "captures/doc.pdf", encoding: "binary", bytes: 10 }],
    meta: { object_type: "project", group: "believe-in-oakland", title: PROJ, current_state: "forming",
            created: "2026-07-01T00:00:00Z", last_updated: "2026-07-01T00:00:00Z" } });
  if (!rv.result?.ok) throw new Error(`retitle ${PROJ}: ${JSON.stringify(rv)}`);
}

const ids = (r) => (r.body.result || []).map((b) => b.bundle_id).sort();

/* ------------------------------------------- the uninvited member sees NOTHING */

console.log("\n--- op=list: an uninvited member's list simply does not contain the project ---");
{
  const r = await GET(`op=list&token=${dave}`);
  t("op=list still answers the shared corpus", ids(r), SHARED);
  t("op=list does not name the project", ids(r).includes(PROJ), false);
  const typed = await GET(`op=list&token=${dave}&type=project`);
  t("op=list&type=project is empty, not refused", typed.body.result, []);
  const paged = await GET(`op=list&token=${dave}&limit=50`);
  t("the paged total counts what the viewer may see — a bigger total would say something is hidden",
    paged.body.result.total, 2);
  /* CORRECTED 2026-08-05 (REC-57, IC-23), not exempted, and the reason matters
     because this pin is a LEAK GUARD and widening one carelessly is how a leak
     gets in. `limit` joined the paged answer: it is the BOUND THIS OP APPLIED
     after clamping — a property of the request, identical for every viewer, and
     derivable by the caller from the number it just sent. It counts nothing and
     it is not viewer-dependent, so it cannot carry a withheld figure. The
     assertion still enumerates the WHOLE key set rather than allow-listing, so
     the next key added still has to come past this line. */
  t("no field of the paged answer discloses a withheld count",
    Object.keys(paged.body.result).sort(), ["bundles", "cursor", "limit", "total"]);
  /* The correction's own control: `limit` is the same for a viewer who may see
     everything and one who may see two of four, while `total` is not. That is
     the property that makes it safe here, asserted rather than asserted-about. */
  const pagedAdmin = await GET("op=list&token=t-admin-rec25&limit=50");
  t("REC-57: `limit` is viewer-INDEPENDENT — it is the bound applied, never a count of anything",
    [paged.body.result.limit, pagedAdmin.body.result.limit], [50, 50]);
  t("REC-57: while `total` IS viewer-dependent, which is why one is safe here and the other is gated",
    paged.body.result.total !== pagedAdmin.body.result.total, true);
}

console.log("\n--- op=index: §7.9's 'one place the graph could escape' ---");
{
  const r = await GET(`op=index&token=${dave}`);
  t("op=index carries only the shared corpus",
    (r.body.result.bundles || []).map((b) => b.id).sort(), SHARED);
  t("op=index does not name the project",
    (r.body.result.bundles || []).some((b) => b.id === PROJ), false);
}

console.log("\n--- op=projection / op=image / op=file: an invisible bundle IS an absent bundle ---");
{
  const [pHid, pAbs] = [await GET(`op=projection&token=${dave}&id=${PROJ}`),
                        await GET(`op=projection&token=${dave}&id=${MISSING}`)];
  t("op=projection: hidden and absent answer byte-identically", pHid, pAbs);
  const [iHid, iAbs] = [await GET(`op=image&token=${dave}&id=${PROJ}`),
                        await GET(`op=image&token=${dave}&id=${MISSING}`)];
  t("op=image: hidden and absent answer byte-identically", iHid, iAbs);
  t("op=image hands over no document", JSON.stringify(iHid.body).includes("Secret plan"), false);
  const [fHid, fAbs] = [await GET(`op=file&token=${dave}&id=${PROJ}&path=bundle.md`),
                        await GET(`op=file&token=${dave}&id=${MISSING}&path=bundle.md`)];
  t("op=file: hidden and absent answer byte-identically", fHid, fAbs);
  /* SUPERSEDED PIN, CORRECTED 2026-08-07 (REC-59 / IC-24), not exempted. This
     read walked the enumeration as a BARE ARRAY. That arm was capped at 200 and
     an array can carry no key, so it could publish neither the bound nor whether
     it bit — IC-24, now landed. The rows moved under `.bundles` in `op=list`'s
     own envelope, and this suite's subject (WHAT dave may see) is unchanged. */
  /* READ DEFENSIVELY, and this is not decoration: the negative control for this
     change (revert the op to a bare array) made `result.bundles` undefined, and
     the first draft of these arms THREW on `.length` — killing the suite and
     hiding every assertion behind it, which is D-93's class inside a control.
     A control must NAME what it broke, so each arm reports its own failure. */
  const enumd = await GET(`op=projection&token=${dave}`);
  const enumRows = (r) => (r && r.body && r.body.result && r.body.result.bundles) || [];
  t("the projection enumeration carries only the shared corpus",
    enumRows(enumd).map((b) => b.bundle_id).sort(), SHARED);
  /* AND THE NEW KEYS TAKE THIS SUITE'S GATE, which is the whole reason the
     migration is asserted HERE and not only in bounds.test.mjs. `total` is a
     COUNT and a count over rows the caller cannot read would say "something is
     hidden" — half the leak, and D-15's own argument. It must therefore be
     VIEWER-DEPENDENT, exactly as REC-57 established for op=list's `total`,
     while `limit` is a property of the request and must NOT be. */
  const enumCarol = await GET(`op=projection&token=${carol}`);
  t("op=projection: `total` counts what THIS viewer may see — the uninvited member's total is the shared corpus, "
  + "and it does not count the project he cannot read",
    [enumd.body.result?.total, enumRows(enumd).length], [SHARED.length, SHARED.length]);
  t("op=projection: and a viewer who CAN see the project counts one more — the total moves with position, "
  + "so it is gated and not a corpus-wide figure handed to everyone",
    enumCarol.body.result?.total > enumd.body.result?.total, true);
  t("op=projection: `limit` is a property of the REQUEST and is viewer-INDEPENDENT — the two positions "
  + "are told the same bound and differ only in what they may read",
    enumd.body.result?.limit !== undefined && enumd.body.result?.limit === enumCarol.body.result?.limit, true);
}

console.log("\n--- op=affordances (the 2026-08-03 amendment): existence and state stay invisible ---");
{
  const [aHid, aAbs] = [await GET(`op=affordances&token=${dave}&target=${PROJ}`),
                        await GET(`op=affordances&token=${dave}&target=${MISSING}`)];
  t("hidden answers NO_SUCH_BUNDLE", aHid.body.reason, "NO_SUCH_BUNDLE");
  t("and is byte-identical to absent, target aside",
    { ...aHid, body: { ...aHid.body, target: "X" } },
    { ...aAbs, body: { ...aAbs.body, target: "X" } });
  t("no state escapes through the refusal", "current_state" in aHid.body, false);
}

console.log("\n--- op=search: the compiled-query gate still holds through the control plane ---");
{
  const r = await GET(`op=search&token=${dave}&q=&facets=none&limit=50`);
  t("search does not name the project",
    (r.body.result.hits || []).map((h) => h.bundle_id).filter((x) => x === PROJ), []);
}

console.log("\n--- op=backlinks: the reverse edge into shared evidence is filtered by position ---");
{
  const r = await GET(`op=backlinks&token=${dave}&target=${INFO}`);
  t("the read answers", r.body.result.ok, true);
  t("but the uninvited member gets NO backlink from the project", r.body.result.backlinks, []);
  t("and no field counts what was withheld",
    Object.keys(r.body.result).sort(), ["backlinks", "ok", "target"]);
  const [bHid, bAbs] = [await GET(`op=backlinks&token=${dave}&target=${PROJ}`),
                        await GET(`op=backlinks&token=${dave}&target=${MISSING}`)];
  t("backlinks of a hidden target and an absent one answer byte-identically, target aside",
    { ...bHid, body: { ...bHid.body, result: { ...bHid.body.result, target: "X" } } },
    { ...bAbs, body: { ...bAbs.body, result: { ...bAbs.body.result, target: "X" } } });
}

/* --------------------------------------------- the invited member sees EVERYTHING */

console.log("\n--- the owner (carol) still sees everything ---");
{
  t("op=list names her project", ids(await GET(`op=list&token=${carol}`)).includes(PROJ), true);
  const idx = await GET(`op=index&token=${carol}`);
  t("op=index carries it", (idx.body.result.bundles || []).some((b) => b.id === PROJ), true);
  const p = await GET(`op=projection&token=${carol}&id=${PROJ}`);
  t("op=projection answers with title and state",
    [p.body.result.title, p.body.result.current_state], [PROJ, "forming"]);
  const img = await GET(`op=image&token=${carol}&id=${PROJ}`);
  t("op=image hands the document back", /Secret plan/.test(img.body.result["bundle.md"]), true);
  const f = await GET(`op=file&token=${carol}&id=${PROJ}&path=bundle.md`);
  t("op=file reads it", typeof f.body.result.text, "string");
  const aff = await GET(`op=affordances&token=${carol}&target=${PROJ}`);
  t("op=affordances reports the object", [aff.body.result.target, aff.body.result.object_type], [PROJ, "project"]);
  const s = await GET(`op=search&token=${carol}&q=&facets=none&limit=50`);
  t("op=search finds it", (s.body.result.hits || []).some((h) => h.bundle_id === PROJ), true);
  const b = await GET(`op=backlinks&token=${carol}&target=${INFO}`);
  t("op=backlinks shows the citing project, with the edge's own facts",
    b.body.result.backlinks.map((x) => [x.from, x.from_type, x.from_title, x.from_state, x.rel, x.status, x.note]),
    [[PROJ, "project", PROJ, "forming", "cites", "confirmed", "evidence"]]);
}

console.log("\n--- an administrator sees all projects (7.3), uninvited ---");
{
  t("op=list names it for ruth", ids(await GET(`op=list&token=${ruth}`)).includes(PROJ), true);
  const b = await GET(`op=backlinks&token=${ruth}&target=${INFO}`);
  t("op=backlinks shows the edge to ruth", b.body.result.backlinks.map((x) => x.from), [PROJ]);
}

console.log("\n--- a machine credential is not filtered: D-15's own deliberate carve-out ---");
{
  t("op=list under MEMBER_TOKEN carries the project",
    ids(await GET(`op=list&token=mem-rec25`)).includes(PROJ), true);
  const b = await GET(`op=backlinks&token=mem-rec25&target=${INFO}`);
  t("op=backlinks under MEMBER_TOKEN shows the edge", b.body.result.backlinks.map((x) => x.from), [PROJ]);
}

/* ========================================================================== *
 *  REC-30 · THE POSTURE SWEEP OF THE REMAINING READ SURFACES
 *
 *  REC-25 gated the reads ADDRESSED to a bundle. This is the sweep of the reads
 *  addressed to something else — a dangling edge, a task, a capture, an entity,
 *  a progression — that NAME a bundle on the way past. op=dangling was the
 *  measured one; the rest had never been asked the question.
 *
 *  THE RULE, one sentence, and it is what the store's own comments say:
 *  a read never NAMES a bundle the viewer may not see. Where the bundle IS the
 *  row's subject the ROW is withheld (op=backlinks' posture: no count of what
 *  was withheld, because that count is the leak). Where the bundle is a BACK-
 *  REFERENCE on a row about a capture or an entity, the reference alone is
 *  withheld and the row stands — its capture sha, its grade and every
 *  derivation over it are the RECORD's facts, and a record that got stronger
 *  for the uninvited would be claiming more than it can support, which is worse
 *  than the leak being closed.
 * ========================================================================== */

/* ---------------------------------------------------------------- fixture 2
   The framework axis, built through the real chain (FW-5 reading -> FW-6 entity
   -> FW-7 resolution -> FW-8 connection -> FW-9 instance -> FW-10 discharge) so
   every table that carries a bundle_id carries the SECRET PROJECT's, beside the
   shared evidence's. Built under the machine credential, which is unfiltered by
   design, so the store genuinely holds the rows the reads must not disclose. */
const ent = await POST("op=entitycreate&token=mem-rec25",
  { kind: "contract", label: "Hauling Contract C-2026-30",
    aliases: ["contract:C-2026-30", "Hauling Contract C-2026-30"] });
const ENT = ent.result.entity_id;
if (!ENT) throw new Error(`entitycreate: ${JSON.stringify(ent)}`);
for (const s of [ISHA, PSHA]) {
  const r = await POST(`op=resolve&token=mem-rec25`, { captureSha: s });
  if (!r.result?.resolved?.length) throw new Error(`resolve ${s}: ${JSON.stringify(r)}`);
}
const conn = await POST(`op=connect&token=mem-rec25`, { entityId: ENT });
if (!conn.result?.count) throw new Error(`connect: ${JSON.stringify(conn)}`);
const prog = await POST("op=progressiondefine&token=mem-rec25", {
  progressionKey: "sweep", label: "Sweep",
  stages: [
    { key: "need", label: "staff report", cardinality: "0..n", required: "sometimes" },
    { key: "award", label: "council resolution", after: "need", cardinality: "1", required: "always" },
    { key: "contract", label: "signed agreement", after: "award", cardinality: "1", required: "always" },
    /* missing, required and NOT discharged — the one open finding, so op=queue
       has a real FINDING item to carry subjects on. */
    { key: "closeout", label: "closeout report", after: "contract", cardinality: "1", required: "always" },
  ] });
if (!prog.result?.ok) throw new Error(`progressiondefine: ${JSON.stringify(prog)}`);
const thr = await POST("op=thread&token=mem-rec25", {
  progressionKey: "sweep", entityId: ENT,
  placements: [{ stage: "need", captureSha: ISHA }, { stage: "award", captureSha: PSHA }] });
if (!thr.result?.ok) throw new Error(`thread: ${JSON.stringify(thr)}`);
/* the SECRET project's capture discharges the missing `contract` stage, so
   progression_exceptions carries its bundle id too. */
const dis = await POST("op=discharge&token=mem-rec25", {
  progressionKey: "sweep", entityId: ENT, stage: "contract", captureSha: PSHA,
  reason: "the contract was executed under a standing agreement",
  citation: "council rule 5.2" });
if (!dis.result?.ok) throw new Error(`discharge: ${JSON.stringify(dis)}`);

/* Two tasks, one per bundle. The producer reaches the queue only through the
   Durable Object (there is deliberately no control-plane enqueue), so the
   events are put there directly and drained through the real op. The secret
   project's task is then FORWARDED to dave: a routed obligation about a project
   he was never invited to is exactly the case op=queue has to withhold. */
const ns = await mf.getDurableObjectNamespace("STORE");
const doStub = ns.get(ns.idFromName("bio"));
for (const [s, subj] of [[ISHA, "https://example.gov/shared.pdf"], [PSHA, "https://example.gov/secret.pdf"]])
  await doStub.fetch("http://x/taskenqueue", { method: "POST", body: JSON.stringify({
    kind: "authority-undetermined", captureSha: s, subject: subj, locator: subj,
    at: "2026-07-02T00:00:00Z" }) });
const drained = await POST("op=taskdrain&token=mem-rec25", { limit: 10 });
if (drained.result?.created?.length !== 2) throw new Error(`taskdrain: ${JSON.stringify(drained)}`);
const secretTask = drained.result.created.find((c) => c.refers_to === PROJ).id;
const sharedTask = drained.result.created.find((c) => c.refers_to === INFO).id;
const fwd = await POST(`op=taskforward&token=${ruth}`, { id: secretTask, to: "dave" });
if (!fwd.result?.ok) throw new Error(`taskforward: ${JSON.stringify(fwd)}`);

console.log("\n--- op=dangling: THE MEASURED LEAK — a project that cited a target that does not exist ---");
{
  const d = await GET(`op=dangling&token=${dave}`);
  const cite = (r) => (r.body.result.dangling || []).map((x) => [x.bundle_id, x.target_id]);
  t("the uninvited member still receives the shared corpus's dangling edge",
    cite(d), [[INFO, PHANTOM_I]]);
  t("and op=dangling does not name the project", JSON.stringify(d.body).includes(PROJ), false);
  t("no field counts what was withheld — that count IS the leak",
    Object.keys(d.body.result).sort(), ["dangling"]);
  t("the owner sees both edges", (await GET(`op=dangling&token=${carol}`)).body.result.dangling.length, 2);
  t("the administrator sees both (7.3)", (await GET(`op=dangling&token=${ruth}`)).body.result.dangling.length, 2);
  t("a machine credential is not filtered (D-15's carve-out)",
    (await GET(`op=dangling&token=mem-rec25`)).body.result.dangling.length, 2);
}

console.log("\n--- op=tasks: a task's refers_to IS a bundle id ---");
{
  const mine = await GET(`op=tasks&token=${dave}`);
  t("the uninvited member's inbox carries only the task about shared evidence",
    mine.body.result.tasks.map((x) => x.refers_to), [INFO]);
  t("and the counts count what he may see, not what exists",
    mine.body.result.counts.open + mine.body.result.counts.forwarded, 1);
  const [hid, abs] = [await GET(`op=tasks&token=${dave}&refers=${PROJ}`),
                      await GET(`op=tasks&token=${dave}&refers=${MISSING}`)];
  t("asking BY the hidden bundle answers exactly as asking by an absent one", hid, abs);
  t("the owner's inbox carries both", (await GET(`op=tasks&token=${carol}`)).body.result.tasks.length, 2);
  t("a machine credential is not filtered",
    (await GET(`op=tasks&token=mem-rec25`)).body.result.tasks.length, 2);
}

console.log("\n--- op=queue: the OBLIGATION's subject and the FINDING's bundles ---");
{
  const q = await GET(`op=queue&token=${dave}`);
  t("the obligation forwarded to him about an invisible project is not in his feed",
    q.body.result.items.some((i) => i.id === secretTask), false);
  t("and nothing in the feed names the project", JSON.stringify(q.body).includes(PROJ), false);
  const finding = q.body.result.items.find((i) => i.class === "FINDING");
  t("the FINDING still reaches him — it is the RECORD's question, not a project's",
    !!finding, true);
  t("but the bundles behind it name only what he may see",
    finding.subject.bundles, [INFO]);
  const qc = await GET(`op=queue&token=${carol}`);
  t("the owner's feed carries the same finding naming BOTH bundles",
    qc.body.result.items.find((i) => i.class === "FINDING").subject.bundles.sort(), [INFO, PROJ].sort());
  /* the machine credential's whole-live-set view: the obligation about the
     project is intact in the record — it was withheld from a reader, not lost. */
  t("a machine credential's feed still carries the obligation about the project",
    (await GET(`op=queue&token=mem-rec25`)).body.result.items
      .some((i) => i.class === "OBLIGATION" && i.subject.id === PROJ), true);
}

console.log("\n--- the capture-addressed reads: the row stands, the back-reference is withheld ---");
{
  const r = await GET(`op=reading&token=${dave}&sha256=${PSHA}`);
  t("op=reading still answers the reading of a capture filed in a hidden project",
    [r.body.result.found, r.body.result.entity_count], [true, 1]);
  t("but it does not name the bundle", r.body.result.bundle_id, null);
  t("the owner gets the back-reference",
    (await GET(`op=reading&token=${carol}&sha256=${PSHA}`)).body.result.bundle_id, PROJ);
  const rr = await GET(`op=readingref&token=${dave}&ref=${encodeURIComponent(REF.ref)}`);
  t("the reverse index still returns BOTH documents — a count of captures is not identity",
    rr.body.result.count, 2);
  t("and names only the visible bundle",
    rr.body.result.documents.map((d) => d.bundle_id).sort(), [INFO, null]);
  const res = await GET(`op=resolutions&token=${dave}&sha256=${PSHA}`);
  t("op=resolutions keeps the resolution and its grade, and withholds the bundle",
    [res.body.result.count, res.body.result.resolutions[0].grade, res.body.result.resolutions[0].bundle_id],
    [1, "A", null]);
  const con = await GET(`op=concerns&token=${dave}&id=${ENT}`);
  t("op=concerns names no hidden bundle", JSON.stringify(con.body).includes(PROJ), false);
  t("and still reports both documents that concern the entity", con.body.result.count, 2);
  const cx = await GET(`op=connections&token=${dave}&id=${ENT}`);
  t("op=connections keeps the connection and its weaker-end grade",
    [cx.body.result.count, cx.body.result.connections[0].grade], [1, "A"]);
  t("and names only the end he may see",
    [cx.body.result.connections[0].a_bundle_id, cx.body.result.connections[0].b_bundle_id].sort(),
    [INFO, null]);
}

console.log("\n--- op=instance / op=exceptions: the DERIVATION is the record's, identical for both ---");
{
  const dv = (await GET(`op=instance&token=${dave}&key=sweep&id=${ENT}`)).body.result;
  const cl = (await GET(`op=instance&token=${carol}&key=sweep&id=${ENT}`)).body.result;
  t("op=instance does not name the hidden bundle to the uninvited member",
    JSON.stringify(dv).includes(PROJ), false);
  t("the grade, the placed count and the finding count are IDENTICAL for both readers",
    [dv.grade, dv.placed_count, dv.finding_count, dv.discharge_count],
    [cl.grade, cl.placed_count, cl.finding_count, cl.discharge_count]);
  t("the award stage still reports its document and its grade, with the id withheld",
    dv.stages.filter((s) => s.stage_key === "award")
      .map((s) => [s.document_count, s.documents[0].capture_sha, s.documents[0].bundle_id]),
    [[1, PSHA, null]]);
  t("and the owner sees the same document WITH its bundle",
    cl.stages.find((s) => s.stage_key === "award").documents[0].bundle_id, PROJ);
  const ex = await GET(`op=exceptions&token=${dave}&key=sweep&id=${ENT}`);
  t("op=exceptions keeps the discharge, its reason and its citation",
    [ex.body.result.exception_count, ex.body.result.exceptions[0].reason.slice(0, 3)], [1, "the"]);
  t("and withholds the discharging document's bundle", ex.body.result.exceptions[0].bundle_id, null);
  t("the owner sees it", (await GET(`op=exceptions&token=${carol}&key=sweep&id=${ENT}`))
    .body.result.exceptions[0].bundle_id, PROJ);
}

console.log("\n--- the two paging integrity sweeps: their findings NAME bundles ---");
{
  const a = await GET(`op=audit&token=${dave}`);
  t("op=audit's total counts what the viewer may see (REC-25's rule for a paged total)",
    a.body.result.total, 2);
  t("and it names no hidden bundle", JSON.stringify(a.body).includes(PROJ), false);
  t("the owner's audit covers three", (await GET(`op=audit&token=${carol}`)).body.result.total, 3);
  const s = await GET(`op=searchindexcheck&token=${dave}`);
  t("op=searchindexcheck checks only what the viewer may see",
    [s.body.result.checked, s.body.result.counts.bundles], [2, 2]);
  t("and names no hidden bundle", JSON.stringify(s.body).includes(PROJ), false);
  t("a machine credential still checks the whole corpus — the operator view the token exists for",
    (await GET(`op=searchindexcheck&token=mem-rec25`)).body.result.counts.bundles, 4);
  /* CORRECTED 2026-09-23 by REC-171 (§11 item 5, "Rule 2's reach", BOB #30): this read 3. The member TOKEN's problem
     is now surfaced inside a run it holds (`surfacing-run.mjs`), and that run is over a project the token created —
     a FOURTH bundle, real, and visible to neither dave nor carol (their counts above did not move). The operator
     view the token exists for counts it, which is the point of this assertion. */
}

console.log("\n--- op=projectownerarith: an owner count IS existence ---");
{
  const [hid, abs] = [await GET(`op=projectownerarith&token=${dave}&projectId=${PROJ}`),
                      await GET(`op=projectownerarith&token=${dave}&projectId=${MISSING}`)];
  t("a hidden project's live arithmetic is byte-identical to a project that does not exist",
    { ...hid, body: { ...hid.body, result: { ...hid.body.result, projectId: "X" } } },
    { ...abs, body: { ...abs.body, result: { ...abs.body.result, projectId: "X" } } });
  t("the owner is told the truth about her own project",
    (await GET(`op=projectownerarith&token=${carol}&projectId=${PROJ}`)).body.result.live.owners, 1);
}

console.log("\n--- REC-14's reads, swept at the merge (2026-08-04) ---");
{
  /* ==== CORRECTED 2026-08-10 BY CASE-2 UNDER DEC-72, NEVER EXEMPTED. ========
     SIX ASSERTIONS STOOD HERE AND EVERY ONE WAS RIGHT WHEN WRITTEN. They swept
     REC-30's measured leak: `#requiredStrengthFor` reported `projects: [...]`
     and interpolated the same ids into its prose, so an uninvited member asking
     the bar of a SHARED information learned the ids of the SECRET projects
     citing it — §7.9's reverse-edge walk arriving by a new door. They asserted
     that the VALUE was identical for both readers, that the NAMES were withheld,
     and that the withholding was STATED without a count.

     **THE EXPOSURE DISSOLVED; IT WAS NOT RE-GATED, AND THE DIFFERENCE MATTERS
     TO ANYONE READING THIS BLOCK LATER.** DEC-72 makes a bar a property of a
     PROJECT, so there is no cross-citer walk, no `projects[]` array, and no
     prose naming a citer — REC-30's own residual (*"`source: "project"` on a
     target only invisible projects cite still says that SOME project declares a
     bar on it"*) is gone with the machinery that produced it.

     WHAT REPLACES THEM IS A NARROWER GATE, ASSERTED HERE: the read now takes a
     PROJECT, and a project the viewer may not see is answered byte-identically
     to one that does not exist — this suite's standing posture, and strictly
     stronger than withholding a name from an answer that still admits the
     project exists. */
  const dv = (await GET(`op=strengthbarof&token=${dave}&target=${INFO}`)).body.result;
  const cl = (await GET(`op=strengthbarof&token=${carol}&target=${INFO}`)).body.result;
  t("THE LEAK'S PATH IS GONE: a bar is not a property of a document, so the target arm answers "
  + "BOTH readers the same refusal and there is no walk left to leak a citer from",
    [dv.ok, dv.reason, cl.ok, cl.reason],
    [false, "BAR_IS_A_PROJECT_PROPERTY", false, "BAR_IS_A_PROJECT_PROPERTY"]);
  t("and neither answer names the secret project ANYWHERE — REC-30's leak shape, re-asserted over "
  + "the new shape rather than retired with the old one",
    [JSON.stringify(dv).includes(PROJ), JSON.stringify(cl).includes(PROJ)], [false, false]);
  t("nor does either carry the composed array at all, so there is nothing left to filter",
    [("projects" in (dv.bar || {})), ("projects" in (cl.bar || {}))], [false, false]);
  /* THE NEW GATE, AND IT IS THE ONE THAT MATTERS NOW. The bar lives on the
     project, so asking for a SECRET project's bar is asking about a bundle the
     viewer may not see — and the answer is the absent one, byte for byte. */
  const secretBar = (await GET(`op=strengthbarof&token=${dave}&project=${PROJ}`)).body.result;
  const absentBar = (await GET(`op=strengthbarof&token=${dave}&project=PROJ-2026-9999-nope`)).body.result;
  /* THE ID THE CALLER SUPPLIED IS NORMALISED OUT OF BOTH ANSWERS BEFORE THEY ARE
     COMPARED — `op=projectownerarith`'s arm twenty lines up does exactly this,
     for exactly this reason: echoing back the id a caller asked about tells them
     nothing they did not already type, and leaving it in would make every
     absent-vs-hidden comparison in this file impossible to write. What must be
     identical is EVERYTHING ELSE. */
  const flatten = (r, id) => JSON.parse(JSON.stringify(r).split(id).join("<ASKED>"));
  t("A HIDDEN PROJECT'S BAR IS BYTE-IDENTICAL TO ONE THAT DOES NOT EXIST — withheld WHOLE, which is "
  + "stronger than the old posture of answering a value while withholding a name",
    flatten(secretBar, PROJ), flatten(absentBar, "PROJ-2026-9999-nope"));
  t("and the OWNER is told her own project's bar, so the gate is a gate and not a wall",
    [(await GET(`op=strengthbarof&token=${carol}&project=${PROJ}`)).body.result.bar.declared,
     (await GET(`op=strengthbarof&token=${carol}&project=${PROJ}`)).body.result.bar.capture],
    [true, "B"]);
  t("a machine credential is not filtered — the operator view the token exists for",
    (await GET(`op=strengthbarof&token=mem-rec25&project=${PROJ}`)).body.result.bar.declared, true);
  t("the GROUP arm names no bundle at all, for anybody",
    "projects" in ((await GET(`op=strengthbarof&token=${dave}`)).body.result.bar || {}), false);

  /* op=excludedby: REC-14 gated it at birth. Asserted STRUCTURALLY as well as
     behaviourally, and the reason is honesty about what a fixture can prove
     here: inquiry_exclusions rows are written by op=publish, publishable cases
     are INQUIRIES, and an inquiry is shared corpus — so no fixture in this suite
     can make the gate BITE, and an empty answer from a target nobody excluded
     would be an outcome that costs nothing to produce. What IS checkable is that
     the read carries the predicate from the one compilation point and binds the
     alias the predicate is written over. */
  const store = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
  /* One method's BODY, bounded by class-member indentation. Not `indexOf(name)`:
     a method is CALLED long before it is declared, so slicing between two first
     mentions ran backwards and silently produced an empty string — an assertion
     that passes on nothing is the failure this whole suite is about. */
  const methodSrc = (name) => {
    const lines = store.split("\n");
    const at = lines.findIndex((l) => new RegExp(`^ {2}(async )?${name}\\(`).test(l));
    if (at < 0) return "";
    const end = lines.findIndex((l, i) => i > at && /^ {2}[A-Za-z#*]/.test(l));
    return lines.slice(at, end < 0 ? lines.length : end).join("\n");
  };
  const fn = methodSrc("excludedBy");
  t("the excludedBy body was actually located (an empty slice would pass on nothing)",
    fn.includes("inquiry_exclusions"), true);
  t("op=excludedby compiles its gate at the ONE compilation point",
    /viewerPredicate\(viewer\)/.test(fn), true);
  t("and binds the alias that predicate is written over (REC-25's landed lesson)",
    /JOIN bundles b\b/.test(fn) && /\$\{gate\.sql\}/.test(fn), true);
  const [xHid, xAbs] = [await GET(`op=excludedby&token=${dave}&id=${PROJ}`),
                        await GET(`op=excludedby&token=${dave}&id=${MISSING}`)];
  t("and a hidden id answers exactly as an absent one, targetId aside",
    { ...xHid, body: { ...xHid.body, result: { ...xHid.body.result, targetId: "X" } } },
    { ...xAbs, body: { ...xAbs.body, result: { ...xAbs.body.result, targetId: "X" } } });

  /* op=publishededitions: the published projection, and the contrast that makes
     the classification a judgment rather than a habit — it reads
     published_bundles and joins NOTHING. */
  const pe = methodSrc("publishedEditions");
  t("op=publishededitions consults the published projection only",
    /FROM published_bundles/.test(pe) && !/JOIN bundles\b/.test(pe) && !/current_state/.test(pe), true);
  t("an unpublished bundle has no editions to disclose, to anybody",
    (await GET(`op=publishededitions&token=${dave}&id=${PROJ}`)).body.result.editions, []);
}

console.log("\n--- REC-29's inherited lesson: EVERY gate-like store param is SERVER-STAMPED ---");
/* The passthrough copies every caller parameter into the inner URL, so any
   store-side gate driven by a param is an impostor hole unless the control plane
   OVERWRITES it after the copy. REC-29 measured this on `administer`; this is the
   audit of the whole set, one assertion per param, in members.test.mjs's shape
   ("a member cannot stamp itself an administrator"). Each pair asks the same
   question: dave supplies the parameter that would make him someone else, and
   the answer must be the one he gets without it. */
{
  const plain = await GET(`op=list&token=${dave}`);
  t("`viewer`: a caller cannot compile a query for somebody else's position",
    await GET(`op=list&token=${dave}&viewer=class:admin`), plain);
  /* CORRECTED 2026-08-10 by CASE-2 (DEC-72): there is no `projects[]` to forge a
     name out of any more, so the impostor arm moves to the read that CAN now be
     forged — the PROJECT arm, where a forged class:admin would buy the bar of a
     project dave was never invited to. Same question, at the door that exists. */
  t("`viewer` on REC-14's bar read: a forged class:admin buys no hidden project's bar",
    [(await GET(`op=strengthbarof&token=${dave}&project=${PROJ}&viewer=class:admin`)).body.result.ok,
     (await GET(`op=strengthbarof&token=${dave}&project=${PROJ}&viewer=class:admin`)).body.result.reason],
    [false, "NO_SUCH_PROJECT"]);
  t("`viewer` on the swept reads either: op=dangling under a forged class:member",
    (await GET(`op=dangling&token=${dave}&viewer=class:member`)).body.result.dangling.map((x) => x.bundle_id),
    [INFO]);
  t("`administer` (D-157): a member cannot stamp itself an administrator",
    (await GET(`op=memberlist&token=${dave}&administer=1`)).body.result.members.some((m) => "cover" in m), false);
  t("`member`: a caller cannot read another member's queue",
    (await GET(`op=queue&token=${dave}&member=carol`)).body.result.member, "dave");
  t("`owner`: a caller cannot claim another member's selections",
    (await GET(`op=selectionlist&token=${dave}&owner=member:carol`)).body.result.selections.length, 0);
  t("`by`: a caller cannot act on a project roster as somebody else",
    (await GET(`op=projectparticipants&token=${dave}&projectId=${PROJ}&by=carol`)).body.result.reason,
    "NO_SUCH_PROJECT");
  const lease = await GET(`op=lease&token=${dave}&id=${INFO}&actor=carol`);
  t("`actor`: a lease is taken by the caller, never by the name they send",
    lease.body.result.actor ?? lease.body.result.holder, "dave");
  const cited = await POST(`op=cite&token=${carol}&project=${PROJ}&handle=none&author=dave`);
  t("`author`: an authorship a caller can address to someone else is not authorship",
    /dave/.test(JSON.stringify(cited)), false);
}

console.log("\n--- the DO envelope's `ms` is gone at the SOURCE, not stripped at the reader ---");
{
  const store = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
  t("store.mjs's DO envelope no longer mints a timing field",
    /ok:\s*true,\s*ms:/.test(store), false);
  for (const q of [`op=list&token=${dave}`, `op=dangling&token=${dave}`, `op=tasks&token=${dave}`,
                   `op=projection&token=${dave}&id=${INFO}`, `op=stats&token=mem-rec25`])
    t(`no control-plane response carries ms: ${q.split("&")[0]}`,
      "ms" in (await GET(q)).body, false);
}

/* ------------------------------------------------------------------------- *
 *  THE DELIBERATELY UNGATED READS, AND WHY — recorded here rather than in a
 *  document, because a rule that is not in the loop the reader runs is not a
 *  rule. The assertion below is STRUCTURAL: it parses index.mjs's OPS table and
 *  requires EVERY read op to be in one of the two lists. A read op added later
 *  fails this suite until somebody classifies it, which is the whole point —
 *  REC-25's leak existed because six read ops were added over months and nobody
 *  was ever asked the question.
 *
 *  (COORDINATION, and the mechanism has already earned its keep: REC-14 landed
 *  on main while this item was in flight, and at the merge this assertion named
 *  its three new read ops. op=strengthbarof turned out to reintroduce §7.9's
 *  reverse-edge walk by a new door and was GATED; op=excludedby was already
 *  gated, correctly, and is NOT the published class — it joins the live table;
 *  op=publishededitions IS the published class and stays ungated. Three ops,
 *  three different answers, none of them a formality.)
 * ------------------------------------------------------------------------- */
console.log("\n--- every read op is classified: gated, or ungated for a stated reason ---");
{
  const src = readFileSync(fileURLToPath(new URL("../src/index.mjs", import.meta.url)), "utf8");
  const from = src.indexOf("const OPS");
  const reads = [];
  for (const m of src.slice(from).matchAll(/^\s{2}([a-z0-9_]+):\s*\{([^}]*)\}/gm)) {
    const spec = m[2].replace(/\s+/g, " ");
    if (/classes:/.test(spec) && /mutating: false/.test(spec)) reads.push(m[1]);
  }
  t("the OPS table still has a read surface to sweep", reads.length > 40, true);

  /* GATED: the answer is filtered or projected by the D-15 predicate, through
     query.mjs's one compilation point. */
  const GATED = {
    list: "REC-25", index: "REC-25", projection: "REC-25", image: "REC-25", file: "REC-25",
    /* D-525: the Drive shell sweep walks `bundles` under `viewerPredicate` exactly as
       op=index does and names bundle ids, so it is gated for REC-25's reason. */
    driveshells: "D-525: Store#driveShells selects from `bundles` under viewerPredicate(viewer), op=index's gate",
    search: "the first gated read", backlinks: "REC-25", affordances: "REC-25",
    /* CORRECTED 2026-09-18 BY REC-130 / IC-141, NEVER EXEMPTED: MOVED HERE FROM
       THE UNGATED LIST, and the entry it replaces was wrong. It read "An UNRATIFIED
       one is answered too, deliberately … touches no working material, so there is
       no working material for a missing predicate to leak." An unsigned case
       document IS working material — scope, roster, exclusions, bias
       acknowledgement, before anyone signed — and it was answered to anybody over
       ids that come off a sequence. That sentence was CASE-5b's mechanism choice
       with no ruling behind it. */
    casedocument: "REC-130: the UNSIGNED half is gated by the D-15 predicate run against the OWNING "
      + "PROJECT's bundle (Store#hasCaseStanding), and a caller without standing is answered exactly "
      + "as for a case that does not exist. The SIGNED half stays public on op=publishedcase's reasoning "
      + "— a stranger verifies it — which is why the op keeps `classes: null`.",
    /* REC-126 / IC-145, 2026-09-18. `classes: null` because its recipient holds no
       credential of this instance, and GATED all the same — by a live grant's read
       secret or by standing in the producing project. */
    reviewcopy: "REC-126: a DRAFT case is working material. It answers a RECIPIENT only through a LIVE grant's "
      + "read secret (unrevoked, and bound to the edition the draft still stands at), and a MEMBER only with "
      + "standing in the producing project (the D-15 predicate, as Store#hasCaseStanding asks it); every other "
      + "caller receives ONE byte-identical NO_REVIEW_COPY, whatever the cause.",
    /* PL-9 / D-222 option C, 2026-08-07. It is a SEVENTH STATEMENT SHAPE on
       op=search's own compiler, so it inherits op=search's gate rather than
       carrying one — D-15's single compilation point, enforced by the throw in
       Store#runQuery. Its posture is REC-36's STRONGER one, like op=readingname
       and for §14c's stated reason: a meaning-layer answer is a CANDIDATE LIST,
       so a row whose bundle the viewer may not see is WITHHELD ENTIRELY rather
       than answered with a redacted reference, and no count of what was withheld
       is published because that count is the leak. `total` is counted through
       the same joins and the same predicate as the rows, so a total larger than
       the pages — the way hidden stops being identical to absent — cannot
       arise. */
    meaningrows: "PL-9: the meaning-GRAIN read. Same compiler, same gate, and REC-36's withhold-the-row "
      + "posture because the answer is a candidate list rather than a back-reference.",
    selection: "viewer + owner, both server-stamped",
    selectionlist: "owner, server-stamped: a selection is readable only by the credential that made it",
    dangling: "REC-30: the citing bundle is the row's subject",
    tasks: "REC-30: refers_to is a bundle id",
    queue: "REC-30: the obligation's subject and the finding's bundles (the case set was gated at birth)",
    reading: "REC-30: the bundle back-reference on a capture's reading",
    readingref: "REC-30: the bundle back-reference on the reverse reference index",
    /* CPDF-10, 2026-08-08. Classified by the item that adds them, and BOTH are
       gated for REC-30's reason exactly rather than by resemblance: each answer
       names the bundle a capture is filed in, so an ungated one would disclose
       that a document sits in a project the caller was never invited to — by
       telling them what produced its text, which is a new door onto the same
       fact. `textprovenance` additionally ENUMERATES, so it takes the redactor
       on every row rather than on one. */
    /* CPDF-13 / D-183, 2026-09-10. Classified by the item that adds it, and
       gated for REC-30's reason and not by resemblance: the drift obligation
       JOINS the calibrations to `reading_text_source`, so every row NAMES the
       bundle an affected capture is filed in. An ungated one would tell a caller
       that a document sits in a project they were never invited to, by way of
       "this transcription rests on a measurement that has since moved". A row
       about a bundle the viewer may not see is WITHHELD WHOLE, with no count of
       what was withheld, because that count is the leak. Its sibling
       op=calibrations is deliberately UNGATED and the difference between the two
       is the whole test — that one answers about ENGINES and names no bundle at
       all. */
    calibrationdrift: "CPDF-13 / REC-30: the bundle back-reference on every row of the drift obligation",
    textprovenance: "CPDF-10 / REC-30: the bundle back-reference on every row of the transcription index",
    textattest: "CPDF-10 / REC-30: the bundle back-reference on each attestation over a capture",
    /* REC-83 / IC-84 (4), 2026-09-14. Classified by the item that adds it, and
       GATED for REC-30's reason rather than by resemblance to its neighbours —
       the row names the bundle its capture is filed in, and the answer carries
       that bundle in a field AND in prose. It takes the STRONGER of this
       sweep's two postures (op=readingname's, not op=reading's): the whole
       answer is withheld as NO_SUCH_CONTENT rather than the bundle reference
       nulled, because a content id is hash(capture, canonical extent, chain) —
       a caller who can compute an address must not be able to learn from a
       redacted-but-present answer that the passage exists in a project they
       were never invited to. Hidden and absent are byte-identical here, which
       is the only posture that makes the address safe to be guessable. */
    content: "REC-83: one content row by content_id — GATED on the row's own bundle, and the whole "
      + "answer is WITHHELD (NO_SUCH_CONTENT, byte-identical to an id that does not exist) rather than "
      + "the reference redacted, because the id is CONTENT-ADDRESSED and therefore computable by a "
      + "caller who never saw the row",
    /* SK-8's read, classified by the item that adds it. It takes the ROW-FILTER
       shape rather than `content`'s withhold-the-whole-answer one, and the
       difference is the key: this read is scoped to a RUN or a DOCUMENT, so an
       answer can legitimately contain rows about several documents and the
       honest posture is to drop the ones the viewer may not see. The gate is
       `#viewerSees` per row, and it fails closed on an absent stamp. */
    extractproposals: "SK-8: what an EXTRACT run PROPOSED, scoped to a run or a document — GATED per "
      + "ROW on `#viewerSees(bundle_id)`, because one run's productions may span documents in more "
      + "than one project and a proposal about a document the viewer may not see is not a redacted "
      + "row, it is not a row. The minted-to-cited ratio beside it is computed over the SAME scope, "
      + "so the instrument cannot become an oracle for a corpus the caller cannot read",
    /* REC-36's read, classified by the item that adds it (2026-08-04,
       rec36-agent). It is the FIRST reading read to take the WITHHOLD-THE-ROW
       shape rather than the redact-the-reference one, and the distinction is
       worth stating because its two siblings above take the other. */
    readingname: "REC-36: the CANDIDATE list for a name-only mention, and it takes the STRONGER of this "
      + "sweep's two postures — the ROW is withheld in SQL at the lookup (#bundleGate), not the bundle "
      + "reference redacted. op=reading and op=readingref answer questions ABOUT A CAPTURE and merely point "
      + "back at where it is filed, so their rows stand with the reference nulled. This read's rows ARE the "
      + "offer: a candidate a member cannot open is not a candidate, and a nameless one would still disclose "
      + "that a document naming their subject sits in a project they were not invited to. No count of the "
      + "withheld is reported, because that count is the leak (op=backlinks' rule). The section 8.1 grade a "
      + "resolution later earns is NOT reader-dependent and nothing here makes it so: this read writes "
      + "nothing and grades nothing.",
    resolutions: "REC-30: the bundle back-reference on a resolution",
    concerns: "REC-30: the bundle back-reference on the reverse index",
    connections: "REC-30: both ends' bundle back-references, independently",
    instance: "REC-30: the threaded documents' back-references; the derivation is reader-independent",
    exceptions: "REC-30: the discharging document's back-reference",
    audit: "REC-30: offenders name bundles, and the paged total is REC-25's rule",
    searchindexcheck: "REC-30: findings name bundles",
    projectownerarith: "REC-30: an owner count is existence",
    projectparticipants: "7.8, gated by PARTICIPATION on the server-stamped `by`: a non-participant "
      + "is told what a nonexistent project would tell them",
    /* REC-149 (Membership v2 §7.14), classified at birth. */
    projectvisibility: "REC-149: the setting and its history are answered only through `#inSight` (FULL sight, "
      + "the D-15 predicate); a caller without it is told what a nonexistent project would tell them",
    projectdirectory: "REC-149: every row is asked through `Store#sight` and listed only at EXISTENCE — a "
      + "DISCOVERABLE project the caller is outside; it names the id and name and nothing else, and a hidden "
      + "project is never in it (driven in project-discoverable.test.mjs §2-§3)",
    /* REC-14's reads, classified at the merge (2026-08-04, rec30-agent). The
       classifications are security judgments and they are this item's to make. */
    excludedby: "REC-14 gated it at birth, correctly and through the same one compilation point. It is "
      + "NOT the published-projection class: it JOINS the live `bundles` table and reports each case's "
      + "CURRENT STATE, so it can name an unpublished case — which is exactly why the gate belongs on it.",
    /* REC-17's read, classified by the item that adds it (2026-08-04,
       rec17-agent). BOTH of this sweep's shapes appear in one answer, which is
       why the classification is worth stating rather than assuming. */
    reevaluations: "REC-17: the obligation row IS ABOUT the dependent inquiry, so a dependent the viewer "
      + "may not see is WITHHELD whole and no count of the withheld is reported (op=backlinks' posture). "
      + "The SUPERSEDING ids inside a visible row are back-references and are REDACTED to null, while the "
      + "record's own facts in that row — the source, the date, both derived strengths — stand unchanged "
      + "for every reader: a derivation that got weaker or stronger with the reader would be the record "
      + "claiming something different to different people, which is worse than the leak.",
    /* IS-6's two reads, classified by the item that adds them (2026-08-07,
       is6-agent). This sweep did its job at the merge again: both were written
       gated, and being made to say WHY in the strong form is what settled that
       the WHOLE ROW is withheld rather than the context id redacted. */
    airun: "IS-6: the run's SUBJECT is the inquiry or project it runs in, so a run over a project the "
      + "viewer was never invited to is WITHHELD WHOLE and byte-identically to an absent one — the surface "
      + "shows NO INDICATOR either way (INVESTIGATIVE-SESSION.md §14a), so the leak and the honest answer "
      + "are already the same shape and nothing is lost by withholding. The REDACT posture would be wrong "
      + "here: `context` is the whole point of the answer (the surface renders an indicator only when the "
      + "run is in the context of the object in view), so a row with its context nulled is not a weaker "
      + "answer, it is an answer that says a job is running and refuses to say where. No count of the "
      + "withheld is reported (op=backlinks' rule) — a count is exactly the disclosure that somebody is "
      + "investigating something you cannot see.",
    /* REC-93 / IC-92, 2026-09-14 — THE FRONTIER, classified by the item that
       adds it. `OBSERVATION-LOG-DESIGN.md` section 6 says it in one line:
       *"a subject discloses a project's interest, so REC-36's withholding
       applies row-whole across the fence."* */
    frontier: "REC-93: the observation log's frontier — what this instance has looked for at a level "
      + "and what came of it. It is `op=airunlog`'s disclosure WITHOUT the run id in front of it, and "
      + "that is what makes it the sharper case of the two: a run read needs an address the caller "
      + "already holds, while this one takes a level name anybody can type and answers with every "
      + "subject the group has ever gone looking for. A list of addresses a project fetched, and of "
      + "ones it looked for and did not find, IS the line of inquiry — the thing OBSERVATION-LOG-DESIGN "
      + "section 6 says REC-36's withholding applies to ROW-WHOLE rather than by redacting a column, "
      + "because a subject with its authority nulled still names what was looked for. "
      + "It is stamped with the same fail-closed viewer as op=airun and op=airunlog, in the same list "
      + "in index.mjs, so an absent stamp refuses rather than answers. "
      + "CORRECTED 2026-09-16 BY REC-103, NEVER EXEMPTED, AND THE REASON THE OLD ENTRY WAS WRONG IS "
      + "THE USEFUL PART: this classification said GATED from the day the op landed, and at the "
      + "DOCUMENT level it was not true. Store#frontier accepted a `viewer` and the document arm "
      + "never read it — a signature ADVERTISING a fence that was not there, which is worse than an "
      + "absent parameter because a reader of the signature stops asking, and worse than an ungated "
      + "op because this file said it was gated. DRIVEN, not read: an uninvited member received the "
      + "PROJECT BUNDLE ID VERBATIM in `authority` (ratify passes `bundleId`), the capture sha of a "
      + "document filed in that project in `result_ref`, and that sha again as `from_document` on a "
      + "never-looked row. All three are now withheld ROW-WHOLE, and observation-log.test.mjs "
      + "section I DRIVES the fence at every one of them with a real member viewer through the "
      + "Durable Object, plus the over-strictness direction and an inversion arm over every member "
      + "of OBSERVATION_AUTHORITY_KINDS. A fence named in this file and absent from the store is "
      + "exactly the defect this file is least able to see — REC-94 wrote that sentence one entry "
      + "down about this very op, and it was right. "
      + "NOTE what is NOT here and never will be, for the reason op=airunlog gives one entry up: a "
      + "MEMBER'S OWN SEARCH is not in this table at all. Section 4.6's provisional keeps it out at the "
      + "vocabulary — there is no `authority_kind` a member's ad hoc search could take — so the "
      + "strongest form of this classification is again that the material does not exist here to leak.",

    /* REC-116 / IC-120, 2026-09-17 — THE STANDING-MARKER ROSTER, classified by
       the item that adds it. It is the first READ this table has ever had: for
       39 days `op=provenanceroute` was `mutating: true` and nothing read the
       marks at all. */
    contradictionpairs: "REC-146: the CONTRADICTION pairing read — which of the record's own assertions are "
      + "worth comparing, by the four keys of CONTRADICTION-IDENTIFY-DESIGN.md section 4. GATED, and this is "
      + "the widest ENUMERATION this table has classified: it reads across every question, every accepted "
      + "reading and every cited document at once, and answers with pairs naming both. Section 6 of its own "
      + "design requires it — the pairing runs AS A MEMBER, pairs only what that member can see, and never "
      + "enters a project's contents uninvited (Membership v2 section 7.9, section 7 item 7.14). It takes the "
      + "fail-closed viewer stamp beside op=narrowcandidates in index.mjs, and EVERY bundle column on EVERY "
      + "side of EVERY key goes through Store#bundleGate — the ONE compilation point — rather than through a "
      + "predicate written per key, because four keys each carrying their own copy of the gate is four places "
      + "for one of them to be written without it. "
      + "WHAT AN ABSENT STAMP DOES HERE IS THE PART WORTH READING, because on this op the fail-closed posture "
      + "could produce a LIE rather than an outage. `viewerPredicate` answers DENY, every key returns nothing "
      + "— and an empty pair list on a contradiction detector reads as THE RECORD HOLDS NO CONTRADICTIONS, "
      + "which is the record claiming more than it can support. So the answer does not merely go empty: "
      + "`viewer_scope` is published as DENY, every key's `absence.level` is `viewer`, and `says` states that "
      + "the read compared NOTHING and that this is an outage and not a statement about the record. "
      + "NO COUNT OF THE WITHHELD IS REPORTED (op=backlinks' rule): a count of pairs a caller may not see "
      + "would say that somebody's project holds material about a subject they were never invited to.",
    actionquotes: "D-148: the FEE QUOTES the record holds, set side by side by counterparty or by request. "
      + "GATED: it ENUMERATES across actions when read by counterparty, so it takes the fail-closed viewer "
      + "stamp beside op=contradictionpairs in index.mjs and joins every quote to its action through "
      + "viewerPredicate — an action the caller may not see contributes no row, and read by request it "
      + "answers NO_SUCH_BUNDLE exactly as an absent one. No count of withheld quotes is reported.",
    casedrafts: "REC-198: the LIST of a project's review-copy DRAFTS — each draft's id, its case identity, who "
      + "made and last edited it, and the read that opens it. GATED, and fenced EXACTLY like reading one draft "
      + "(BOB #32, 2026-09-23 23:08Z): the store's Store#caseDraftList CALLS #seesProjectDrafts, the very "
      + "predicate op=reviewcopy's member door calls, fed the fail-closed viewer stamp beside "
      + "op=contradictionpairs in index.mjs — D-15's predicate over the producing project, so a draft is its "
      + "project's working material and a member without standing there reads nothing of it. Every caller the "
      + "fence refuses, and every project that does not exist, reads the single read's own dead answer "
      + "(NO_REVIEW_COPY), byte for byte, so the list is no oracle for which projects exist or hold drafts. It "
      + "has no RECIPIENT door: a grant reads the one draft it names and cannot list.",
    narrowcandidates: "REC-86: the machine's proposals for making ONE leg of ONE reading more specific. "
      + "GATED: it names a QUESTION and answers about the document its leg rests on, so it takes the "
      + "fail-closed viewer stamp beside op=narrow in index.mjs and answers a question the caller may not "
      + "see exactly as an absent one (NARROW_NO_INQUIRY), before any leg or candidate is read. The "
      + "candidates are drawn only from the capture that one leg already rests on, so a caller who can "
      + "see the question can already read that leg's document; nothing wider is reached.",
    versionnotice: "D-394: whether the document a citation rests on has a NEWER version at its address, and "
      + "whether a passage at the same extent is in it (framework section 18.1). GATED TWICE: the subject — a "
      + "question or a passage — through Store#viewerSees, refused byte-identically to an absent one "
      + "(VERSION_NOTICE_NO_INQUIRY, VERSION_NOTICE_NO_CONTENT); and the chain through op=versionchain's own "
      + "#bundleGate, by CALLING that method rather than copying its join, so a newer version filed in a "
      + "project the caller was never invited to is not in the chain this caller reads. It takes the "
      + "fail-closed viewer stamp beside op=versionchain in index.mjs. The answer names a newer capture's "
      + "bundle only when versionChain would have named it to this caller. It writes nothing.",
    transcription:"REC-87: one member's TYPING of a portion of a document, by content id — its text, who "
      + "typed it and who attested it. GATED: the typing is filed in a DOCUMENT, so it takes the fail-closed "
      + "viewer stamp beside op=transcribe and op=transcriptionattest in index.mjs and answers a typing in a "
      + "document the caller may not see exactly as an absent one (TRANSCRIPTION_NOT_FOUND). The id is a hash "
      + "of capture, extent and chain, so an answer that told hidden from absent would confirm a passage exists "
      + "in a project the caller was never invited to — op=content's reason.",
    leadread: "MK-4: one member's LEAD by id — their words, where they suggested looking, and every look "
      + "recorded against it. GATED, and more narrowly than a bundle: a lead names no bundle "
      + "(MEMBER-KNOWLEDGE-DESIGN.md §5), so it is readable by its AUTHOR, by the JOINED participants of a project "
      + "the author SHARED it to, and by a machine credential only within a member's minted scope (BOB #14, "
      + "2026-09-18) — never by an unfiltered one; it takes the fail-closed viewer stamp beside op=leadlook in index.mjs. A lead the "
      + "caller may not read answers exactly as an absent one (LEAD_NOT_FOUND), and a look's referent the "
      + "caller can no longer see is not published — the lead discloses what a member was told and where they "
      + "went looking, which is a line of inquiry.",
    themeread: "D-162: one THEME by id — a member's declared idea, its test, its declarer, and the documents "
      + "and passages placed in it (members) or proposed for it (hunches) — or the list of themes, searchable. "
      + "GATED PER PLACEMENT: a theme itself is not existence-private (framework §8.4: it may be searched, shown "
      + "and followed), but every placement names a DOCUMENT, so the read takes the fail-closed viewer stamp beside "
      + "op=themeplace in index.mjs and asks viewerPredicate of the placed document INSIDE the statement; a "
      + "placement the caller cannot see is omitted with no count and no label, so the theme is no oracle for a "
      + "document in a project the caller was never invited to. An unrecognised viewer reads no theme at all.",
    provenanceroutes: "REC-116: which documents in this instance carry a STANDING LOOKED_INDETERMINATE "
      + "marker — the roster REC-69's 2026-08-09 delegation asked for and nobody built. GATED, and the "
      + "disclosure is worth naming precisely: each row names a DOCUMENT the group holds and says the "
      + "record itself doubts that document's route. That is a statement about the group's own evidence, "
      + "which is why the row is WITHHELD WHOLE rather than redacted when the viewer cannot see the "
      + "bundle — REC-103's row-whole rule at the document level, and op=airuns' rule for a collection "
      + "read: absent, byte-identically to a row that never existed. It is stamped with the same "
      + "fail-closed viewer as op=provenanceroute beside it, in the same list in index.mjs, so an "
      + "absent stamp answers empty rather than answering at all. "
      + "MEASURED RATHER THAN ASSERTED, because it changes what this fence is DOING and REC-103's "
      + "entry one above is the receipt for why that distinction matters: viewerPredicate filters "
      + "PROJECT bundles and NOTHING ELSE, and a route mark can only ever name an `information` bundle "
      + "(the write refuses every other type with ROUTE_MARK_NOT_A_DOCUMENT). So for any RECOGNISED "
      + "viewer this gate withholds nothing today, and the case it is load-bearing for is the "
      + "UNRECOGNISED one. It is applied anyway rather than reasoned away — the gate is the only place "
      + "that rule lives, and an op that skipped it would be correct today and wrong the day the "
      + "predicate widens. rec116-route-marked.test.mjs section E DRIVES both directions through the "
      + "Durable Object rather than resting on that reasoning. "
      + "AND WHAT IS DELIBERATELY NOT PUBLISHED: the count of rows WITHHELD. A roster that said `3 "
      + "documents are marked but you may not see them` would leak exactly what the withholding "
      + "exists to withhold, so the census is computed THROUGH the same gate and no ungated total is "
      + "compared against it anywhere in the op.",
    /* REC-94 / IC-95, 2026-09-15 — THE PER-CAPTURE CONTENT AXIS, classified by
       the item that adds it, and it is `frontier`'s disclosure one capture at a
       time. */
    contentaxis: "REC-94: the content axis of ONE capture — has this document's text ever been "
      + "extracted, how much of it, and if not then why not. The disclosure is the same one "
      + "op=frontier makes and it arrives by a narrower door: an answer of anything other than "
      + "`capture not held` tells the caller THIS RECORD HOLDS THIS DOCUMENT, and which documents a "
      + "group holds is the line of inquiry section 6 says REC-36's withholding applies to. So the "
      + "read resolves the capture to its bundle and runs `#bundleRedactor` over it, and a capture in "
      + "a bundle this viewer may not see answers BYTE-IDENTICALLY to one this record does not hold "
      + "(REC-25/REC-30: a read that distinguishes 'not yours' from 'does not exist' has told the "
      + "caller the thing it was refusing to tell them). It is stamped with the same fail-closed "
      + "viewer as op=frontier, in the same list in index.mjs. "
      + "AND THE GATE IS DRIVEN RATHER THAN DECLARED — `observation-content.test.mjs` arm D asks for "
      + "a real capture with a viewer who cannot see its bundle and asserts the answer is the "
      + "not-held one, because REC-94 measured `Store#frontier` accepting a `viewer` it never reads "
      + "and a classification here saying it was gated. A fence named in this file and absent from "
      + "the store is exactly the defect this file is least able to see.",
    biasdebt: "REC-207: the BIAS DEBT on one run — what the lens change left owed, and which of the three "
      + "acts settled it. Gated on `bias_debts.context_id` through the same `#bundleGate` op=airun and "
      + "op=airunlog compile over the run's context, because it is the same disclosure one table over: "
      + "the answer names the run, the context it ran in, and the two lens hashes the obligation was "
      + "raised between. The posture is WITHHOLD THE ROW and it is sharper here than at its siblings, "
      + "because this read has a SECOND absence to be confused with — a run that never carried a debt. "
      + "Those two are answered by ONE object built at a single place in the method (`absent`), so a debt "
      + "the viewer may not see and a run that never owed one are byte-identical by construction rather "
      + "than by two branches that must be kept in step. The REFUSING door beside it, op=biasdebtresolve, "
      + "is gated through the same predicate and answers BIAS_DEBT_NO_SUCH_DEBT for both cases for the "
      + "same reason. Stamped fail-closed in the same list in index.mjs as op=biasmanifest.",
    airunlog: "IS-6: the observation log, gated on the same column and for the same reason as op=airun. "
      + "This one carries MORE than the run row does and is the sharper case: an entry's `subject` names "
      + "what the run went looking for, so a log a viewer could read for a project they were not invited "
      + "to would disclose the group's line of inquiry rather than merely its existence. The row-withhold "
      + "is at the RUN, before any entry is read, so no entry of an invisible run is ever assembled. "
      + "NOTE what is NOT here and never will be: the model's reasoning. DEC-61 puts the transcript "
      + "device-local with a TTL and out of the record store, so there is no transcript for any gate to "
      + "protect — the strongest form of this classification is that the material does not exist here.",
    /* REC-69's read, classified by the item that adds it (2026-08-08,
       rec69-agent). It is the FIRST `ai_runs` read keyed by the CONTEXT rather
       than by the run, which inverts what the gate is protecting against, so
       the classification is written out rather than inherited from its three
       siblings above. */
    airuns: "REC-69: the CONTEXT-KEYED run list, and it is the sharpest of this table's four run reads "
      + "because it is the only one a caller can drive from an id they can already see. op=airun, "
      + "op=airunlog and op=airunspawn all take a RUN ID — a caller must already hold the address, and "
      + "UI-49 measured that the browser never learns one by opening a run — so their gate refuses a "
      + "lookup somebody guessed. This one takes the INQUIRY OR PROJECT ID a member is looking at and "
      + "answers with everything hanging off it, so a missing or wrong gate here would not leak one run, "
      + "it would enumerate a group's whole line of investigation for anyone who could name the object. "
      + "The gate is `#bundleGate` on `context_id`, THE SAME PREDICATE COMPILED AT THE SAME ONE POINT "
      + "(D-15) as its three siblings — no second predicate is written, deliberately, because "
      + "viewerPredicate's MACHINE alternation returns an unfiltered `1=1` and its DENY arm fails "
      + "closed, and a hand-rolled gate getting either wrong is the difference between an outage and a "
      + "leak. The posture is WITHHOLD THE ROW (REC-36), so a run over a project the viewer was never "
      + "invited to is absent BYTE-IDENTICALLY to a run that does not exist, and NO COUNT of what was "
      + "withheld is reported — op=backlinks' rule, and here the count is the disclosure that somebody "
      + "is investigating something you cannot see. THE BOUND IS APPLIED AFTER THE GATE for the same "
      + "reason: `truncated` computed over rows the viewer may not see would be that count arriving as "
      + "a flag. It follows that a real context holding no visible runs answers an ordinary EMPTY LIST — "
      + "'no runs here' and 'no runs you may see' are ONE answer by construction. What IS refused is "
      + "the malformed QUESTION (C-36.1-3), never the invisible answer.",
    /* REC-34's read, classified by the item that adds it (2026-08-04,
       rec34-agent). op=reevaluations' posture is the model and both of the
       sweep's shapes appear here too, with one addition the earlier reads did
       not need. */
    inquirystrength: "REC-34: the OWNING INQUIRY is the answer's SUBJECT, so an inquiry the viewer may "
      + "not see is WITHHELD WHOLE and byte-identically to an absent one (op=backlinks' posture, no count). "
      + "The ids NAMED INSIDE a visible answer — weakest, not_load_bearing[], undetermined_at[] and their "
      + "inherited_from/through — are back-references and are REDACTED to null while every RECORD fact "
      + "stands unchanged for every reader: the axis, the grade, the state, the role, the counts and the "
      + "depth bound, because a derivation that got weaker or stronger with the reader would be the record "
      + "claiming something different to different people. AND THE PROSE IS SWEPT with the same predicate, "
      + "which is REC-14's measured leak shape (ids interpolated into a detail sentence) and is worse here: "
      + "an inherited-undetermined leg's `why` embeds the sub-walk's detail, naming where the walk stopped "
      + "several levels down — ids no field in the answer holds. The withholding is stated without a count.",
    /* REC-18's read, classified by the item that adds it (2026-08-04,
       rec18-agent). op=inquirystrength's posture is the model. */
    earnedbasis: "REC-18: the OWNING INQUIRY is the answer's SUBJECT (it supplies the subject entity every "
      + "grade is earned against), so an inquiry the viewer may not see is WITHHELD WHOLE and byte-identically "
      + "to an absent one. The TARGETS are supplied by the caller and named back in the answer, so each one is "
      + "passed through the same predicate and an invisible one is DROPPED — with `out_of_view: true` stated "
      + "and NO id and NO count, because the count is the leak. The GRADES themselves are not gated and must "
      + "not be: what a document earned against a subject is a record fact, and a grade that moved with the "
      + "reader would be the record claiming something different to different people.",
    /* CORRECTED 2026-08-10 by CASE-2 (DEC-72), never exempted. The classification
       below described a walk that no longer exists, and a classification table
       describing removed machinery is how a reader concludes a gate is doing
       work nothing does. */
    strengthbarof: "CASE-2 / DEC-72: a bar is a property of a PROJECT, so this read takes a project and "
      + "the whole cross-citer walk is gone. REC-30's measured leak — #requiredStrengthFor reporting "
      + "`projects: [...]` and interpolating the same ids into its detail, §7.9's reverse-edge walk "
      + "arriving by a new door — DISSOLVED with the composition rather than being re-gated, and so did "
      + "its own stated residual (`source: \"project\"` still admitting SOME project declared a bar). What "
      + "is gated now is narrower and stronger: a project the viewer may not see is answered "
      + "byte-identically to one that does not exist, withheld WHOLE. The bar VALUE of a VISIBLE project is "
      + "deliberately NOT reader-dependent (DEC-17's surviving stake: it is never set by who a reader is), "
      + "and the finding arm is refused by name rather than answered, because no bar attaches to a finding.",
    /* PL-10 / D-220, 2026-08-07: the document-version chain. Classified here by
       the item that adds it, on op=meaningrows' precedent. */
    versionchain: "PL-10: EVERY VERSION AT AN ADDRESS NAMES A BUNDLE, so a capture filed inside a project "
      + "the viewer was never invited to must be absent from their chain exactly as it is absent from "
      + "op=list — REC-25/REC-30's leak arriving at the document's own history. Gated at `register.bundle_id` "
      + "through #bundleGate, the same predicate every read here compiles, and `total` is counted through the "
      + "SAME join and the SAME predicate as the rows, so a total larger than the pages cannot arise. A "
      + "withheld version is withheld WHOLE, never returned with its bundle nulled; an anchor naming one "
      + "refuses IDENTICALLY to an anchor naming a capture the record does not hold at all; and nothing "
      + "publishes how many were withheld, because that count is the leak.",
    /* PL-1 / IS-1, 2026-08-07: the basis versions of one inquiry. Classified
       here by the item that adds it, on op=versionchain's precedent — AND WITH
       THE HONEST BOUND STATED RATHER THAN IMPLIED BY MEMBERSHIP OF THIS LIST,
       because a classification that overstates what a gate buys is worse for the
       next reader than none. */
    basisversions: "PL-1: the answer names an INQUIRY and every bundle its versions rest on, so it is "
      + "gated at the inquiry through #bundleGate — the same predicate every read here compiles (D-15's "
      + "one compilation point) — and `total` is counted BEHIND that gate rather than beside it, so a "
      + "total larger than the pages cannot arise. WHAT THE GATE ACTUALLY BUYS HERE IS THE FAIL-CLOSED "
      + "ARM, and saying so is the point: `viewerPredicate` filters PROJECT bundles and nothing else "
      + "(Membership 7.9 — the evidence corpus stays deliberately shared), and an inquiry is not a "
      + "project, so the participation arm cannot bite on this subject today. An absent or unrecognised "
      + "viewer stamp compiles to DENY and the read answers empty, which is the arm that can and does. "
      + "`inquiry_present` is published ONLY when the gate admits the bundle, so a viewer who can already "
      + "see the inquiry can tell 'no readings yet' from 'no such question' and a viewer who cannot "
      + "learns nothing either way; nothing states how many rows the gate removed, because that count is "
      + "the leak. If inquiries are ever compartmented, this op inherits it with no edit.",

    /* PL-12 / §14, 2026-08-07: the run's spawn payload. Classified here by the
       item that adds it; op=airun's and op=airunlog's posture, on the same
       column and for the same reason. */
    airunspawn: "PL-12: THE SAME GATE AS ITS TWO SIBLINGS, on the run's `context_id`. A spawn payload "
      + "names the inquiry or project the run is working in, so a payload a viewer could read for a "
      + "project they were not invited to would disclose the group's line of inquiry — REC-25/REC-30's "
      + "leak, and the identical classification op=airunlog carries one line up. The row is withheld at "
      + "the RUN, before any payload is assembled, so an invisible run's payload is never built. NOTE the "
      + "second fence this op carries, which is NOT a viewer gate and must not be confused with one: the "
      + "SEARCH half's payload omits the bias manifest by CONSTRUCTION (§14). That is a fence between two "
      + "halves of one run and applies identically to every viewer, including the run's own member.",
    /* PL-12 / D-84, 2026-08-07: the bias manifest read. Classified here by the
       item that adds it, on op=versionchain's precedent. */
    biasmanifest: "PL-12: A PROJECT-SCOPED MANIFEST NAMES A PROJECT BUNDLE, and the sets it reports are "
      + "bundles too, so a caller who was never invited to the project must be answered exactly as they "
      + "are for a project that does not exist — REC-25/REC-30's leak arriving at the LENS a group works "
      + "under, which is a sharper case than most: a manifest discloses not only that a project exists "
      + "but what its members believe about named institutions. Two predicates and both are the plane's "
      + "own: `#viewerSees` on the project scope, and `#bundleGate` on each adopted bias bundle, so a set "
      + "adopted inside an invisible project is absent from the answer exactly as it is absent from "
      + "op=list. An unseen project and an absent one answer BYTE-IDENTICALLY — `in_force: false` with "
      + "the same stated absence a scope with no adoption gets — and nothing publishes how many bundles "
      + "the gate removed, because that count is the leak.",
    /* PL-4 / IS-4, 2026-08-08: the capture-request queue. Classified here by the
       item that adds it, on op=basisversions' precedent and with the same honest
       bound stated. */
    capturerequests: "PL-4: EVERY ROW NAMES THE QUESTION IT WAS ASKED UNDER, so the queue is gated at "
      + "`target` through #bundleGate — the same predicate every read here compiles (D-15's one "
      + "compilation point) — and `count` is counted BEHIND the gate rather than beside it, so a total "
      + "larger than the rows cannot arise. What the answer would otherwise disclose is sharper than a "
      + "title: an ADDRESS this group is about to go and fetch, which is the group's line of inquiry "
      + "stated as a URL before anything has been captured. As with op=basisversions the participation "
      + "arm cannot bite on an inquiry today (viewerPredicate filters PROJECT bundles, Membership 7.9), "
      + "so what the gate buys HERE is the fail-closed arm: an absent or unrecognised stamp compiles to "
      + "DENY and the read answers empty. Nothing publishes how many rows the gate removed, because that "
      + "count is the leak, and if inquiries are ever compartmented this op inherits it with no edit.",
    /* PL-14 / IS-7, 2026-08-08: the strength pair over one reading. Classified
       here by the item that adds it, on op=basisversions' precedent and with the
       same honest bound stated rather than implied by membership of this list. */
    versionstrength: "PL-14: A STRENGTH NAMES THE QUESTION AND EVERY DOCUMENT ITS READING RESTS ON, so it "
      + "is gated at the inquiry through #bundleGate — the same predicate every read here compiles "
      + "(D-15's one compilation point) — and the gate is applied ONCE, BEFORE any leg is read, so an "
      + "invisible question's legs are never fetched rather than fetched and then withheld. What this "
      + "answer would otherwise disclose is not only that a question exists but WHAT IT RESTS ON and HOW "
      + "WELL, which is the group's line of inquiry with its weak points marked. A question the caller "
      + "may not see refuses IDENTICALLY to one that does not exist (both C-30.2, same sentence), so "
      + "hidden and absent are one answer. As with op=basisversions the participation arm cannot bite on "
      + "an inquiry today (viewerPredicate filters PROJECT bundles, Membership 7.9), so what the gate "
      + "buys HERE is the fail-closed arm: an absent or unrecognised stamp compiles to DENY and the read "
      + "refuses. THE PROJECT POINTER IS GATED SEPARATELY and by the same predicate — #currentVersionOf "
      + "returns null for a project the gate hides, exactly as it does for one that named no reading — so "
      + "naming somebody else's project cannot be used to learn what they stand on. Nothing publishes how "
      + "many rows any gate removed, because that count is the leak, and if inquiries are ever "
      + "compartmented this op inherits it with no edit.",
    /* REC-161 / §12 clause (c), 2026-09-23: independence over a PROPOSED partition. Classified here by
       the item that adds it, on op=versionstrength's precedent and with the same honest bound stated. */
    partitionindependence: "REC-161: A PARTITION NAMES THE QUESTION AND EVERY DOCUMENT ITS REASONS REST "
      + "ON, and says which of them share an upstream source, so it is gated at the inquiry through "
      + "#bundleGate — the one compilation point — ONCE, BEFORE any reason is read. A question the caller "
      + "may not see refuses IDENTICALLY to one that does not exist (both C-71.2, same sentence), driven "
      + "byte-for-byte in partitionindependence.test.mjs ARM F3. As with op=versionstrength the "
      + "participation arm cannot bite on an inquiry today (viewerPredicate filters PROJECT bundles, "
      + "Membership 7.9), so what the gate buys HERE is the fail-closed arm; if inquiries are ever "
      + "compartmented this op inherits it with no edit.",
  };

  /* DELIBERATELY UNGATED, each with the reason it is not a leak. */
  const UNGATED = {
    /* the published projection — REC-22's class, credential-free BY DESIGN */
    publishedlist: "PUBLISHED PROJECTION: reads published_bundles and never the working corpus. "
      + "Publishing is a deliberate ratified act; gating it would gate the thing the doorbell exists "
      + "to serve. REC-22's ops join this class and this sweep must not pre-gate them.",
    publishedmanifest: "PUBLISHED PROJECTION: verifiable by anyone with ssh-keygen and the doorbell, "
      + "without this instance's cooperation. Nothing unpublished appears, by construction.",
    verify: "PUBLISHED PROJECTION: answers only from published_shas — a hash never ratified is "
      + "indistinguishable from one that never existed.",
    publishededitions: "PUBLISHED PROJECTION (REC-14, classified at the merge by REC-30): reads "
      + "published_bundles and NOTHING else — no join to the working corpus, no current_state, no title "
      + "beyond the one frozen into the edition. Every row is there because somebody ratified and "
      + "published it, which is the deliberate act of making it public; gating it would gate the thing "
      + "the doorbell exists to serve. Its sibling op=excludedby is gated precisely BECAUSE it does join "
      + "the live table — the difference between the two is the whole test.",
    /* REC-22's two, classified by REC-22 and NOT by this sweep's author — the
       sweep's own instruction was that the published-projection class must not
       get gated when it lands, and these are the ops it was written about. */
    publishedcase: "PUBLISHED PROJECTION, and credential-free BY DESIGN (REC-22). It reads "
      + "published_bundles, published_edges and the PUBLISHED bucket and NOTHING else — asserted "
      + "structurally in publishedcase.test.mjs block 7: no join to `bundles`, no current_state, and no "
      + "viewer parameter, because there is no working material for a predicate to filter. A SERVE edge is "
      + "admitted only when its target is itself published; a division's parent and siblings are NAMED and "
      + "never served (R4), and a name-only edge carries an id and a kind and nothing else. Gating this "
      + "would gate the thing the doorbell exists to serve.",
    publishedbytes: "PUBLISHED PROJECTION (REC-22): streams from the published bucket if and ONLY if a "
      + "published_shas row names the hash, and answers BY HASH and never by path, so the corpus cannot "
      + "be walked. A sha that was never ratified 404s identically to one that never existed. The guard is "
      + "not redundant with the bucket boundary and the suite proves it: an object planted in the published "
      + "bucket that no published_shas row names is still refused.",
    /* CASE-4 / DEC-72, 2026-09-10: the revision flags on a published case. */
    caseflags: "PUBLISHED PROJECTION (CASE-4 / DEC-72), on op=publishedcase's own reasoning and not a "
      + "new one. Every fact in the answer is ALREADY on the public surface: the case editions and their "
      + "rosters come out of op=publishedcase, the PINNED hash is inside the case container manifest a "
      + "stranger verifies against, and the REVISED hash is a published version's own. It reads one table "
      + "written only from two hashes this plane already holds and touches no working material, so there "
      + "is no working material for a missing predicate to leak. Gating it would withhold from a member "
      + "exactly what the published record already tells anybody — and the whole point of a flag that is "
      + "SET AND NEVER CLEARED is that it stays visible until an owning project acts.",
    /* CPDF-13 / D-183, 2026-09-10: the calibration READ. */
    calibrations: "NAMES NO BUNDLE — it answers about ENGINES. Every row is a dated fidelity "
      + "measurement of a named derivation engine and version, plus the probe inputs and scores "
      + "behind it; no capture, no bundle and no document appears anywhere in the answer, so there "
      + "is no identity for a predicate to filter. Its SIBLING op=calibrationdrift IS gated, and the "
      + "difference between the two is the whole test: drift joins the measurements to "
      + "reading_text_source and its rows NAME the bundle each affected capture is filed in, which "
      + "is REC-30's disclosure exactly — telling a caller which of their documents rest on a "
      + "superseded measurement would tell them a document sits in a project they were never "
      + "invited to.",

    /* names no bundle: there is no identity in the answer to gate */
    stats: "COUNTS ONLY, an operator surface. A count that names nothing is not identity — and the "
      + "counts REC-25 did gate were the TOTALS OF AN ENUMERATION, where a total bigger than the "
      + "list says something is hidden. These enumerate nothing.",
    selftest: "the plane's own wiring; names no bundle.",
    searchfields: "the projected field vocabulary; names no bundle.",
    whoami: "what THIS caller is and may do; names no bundle.",
    memberlist: "the handle roster (REC-29's projection governs cover, not bundles); names no bundle.",
    adminarith: "section 4.7 arithmetic over the ADMIN roster; names no bundle.",
    expertiselist: "declared expertise, a member fact; names no bundle.",
    inbox: "the doorbell inbox — material submitted from OUTSIDE, filed against no bundle.",
    inboxget: "one such submission; filed against no bundle.",
    links: "outbound links by capture sha and inbound by address; names no bundle.",
    sourcereach: "reachability of a document ADDRESS; names no bundle.",
    archivelookup: "a CDX lookup against an external archive; names no bundle.",
    pdfstructure: "the structure of a captured PDF, by sha; names no bundle.",
    runtime: "measured runtime observations; names no bundle.",
    governorstate: "per-HOST fetch accounting; names no bundle.",
    signerlist: "the active signer set; names no bundle.",
    exportlog: "who exported and when — an export can never happen silently; names no bundle.",
    /* D-436, 2026-09-21. Classified by the item that adds it. EXTENDED 2026-09-22 by REC-163 (IC-174), which made
       the op PUBLIC (`classes: null`) on BIO_Publication_v0_1.md §7 point 1 — the classification is unchanged and
       its reason is only stronger, so the entry gains the second half rather than moving. */
    instancegroup: "HOLDS NO CORPUS MATERIAL: the instance's ONE producing-group slug (D-436) — the name every "
      + "document this store writes carries in its own bytes, and the worker's own hostname besides. No bundle id, "
      + "no row a viewer predicate could filter, and nothing a hidden project could leak through. AND PUBLIC since "
      + "REC-163 (Publication §7 point 1): a caller with no credential is answered the slug alone, which every "
      + "published bundle's signed `group` already carries, and never the row's provenance.",
    /* CLASSIFIED at integration by c19-unionfix, 2026-09-24: REC-164's op arrived unclassified because its
       worker gated only its own suites, and this sweep reads the whole OPS table. */
    groupidentity: "HOLDS NO CORPUS MATERIAL: REC-164's group identity (Publication §7 points 2 and 3) — the "
      + "slug, the group's display name and its claimed domain, with the domain's dated check verdicts. No bundle "
      + "id and no row a viewer predicate could filter. PUBLIC on point 1's reasoning and split by the ADMISSION "
      + "gate exactly as op=instancegroup: a caller with no credential is answered the slug, the display name only "
      + "beside it, and the domain only while its latest verdict is `verified` (what the group asserts to the world); "
      + "only a credential the gate admits is answered the claim, its state and both dated histories.",
    progression: "a progression DEFINITION: a member's constitutive claim about how an institution "
      + "ought to behave. It names stages, not documents.",
    proposals: "the DERIVED findings feed. Aggregated per (progression, stage) over entities and "
      + "carries NO bundle id — op=queue is where a finding acquires subjects, and that is gated.",
    captureprogressions: "which progressions a CAPTURE sits in, by sha: progression keys, entity "
      + "labels, stages and findings. Carries no bundle id.",
    entity: "the subject registry: an entity, its kind and its label.",
    entitybyalias: "the subject registry, resolved by one of an entity's aliases.",
    relation: "a declared constitutive relation between two entities.",
    /* class-fenced or scratch-confined: there is no member session to filter */
    registeraudit: "CLASS-FENCED to admin and probe (no member class), so no member session reaches "
      + "it; probe is confined by scopeFor to the scratch namespace, a different Durable Object.",
    /* REC-175, 2026-09-23. Classified by the item that adds it. */
    digestcensus: "CLASS-FENCED to admin and probe (no member class), so no member session reaches it — "
      + "registeraudit's fence, and for its reason: it is an audit of the working corpus that lists bundle ids "
      + "and paths whose stored digest disagrees with their bytes; probe is confined by scopeFor to the scratch "
      + "namespace, a different Durable Object. It writes nothing.",
    /* REC-190, 2026-09-24. Classified by the item that adds it. */
    homecensus: "CLASS-FENCED to admin and probe (no member class), so no member session reaches it — "
      + "registeraudit's fence, and for its reason: it is an audit of the working corpus that lists bundle ids and "
      + "paths whose bytes the register assigns to another bundle; probe is confined by scopeFor to the scratch "
      + "namespace, a different Durable Object. It writes nothing.",
    /* REC-176, 2026-09-23. Classified by the item that adds it. */
    snapkeycensus: "CLASS-FENCED to admin and probe (no member class), so no member session reaches it — "
      + "registeraudit's fence, and for its reason: it is an audit of the working corpus that lists bundle ids whose "
      + "manifest lost a row to a repeated snap key; probe is confined by scopeFor to the scratch namespace, a "
      + "different Durable Object. It writes nothing.",
    /* D-256, 2026-09-23. Classified by the item that adds it. */
    changedfromaudit: "CLASS-FENCED to admin and probe (no member class), so no member session reaches it — "
      + "registeraudit's fence, and for its reason: it is an audit of the working corpus that lists bundle ids whose "
      + "body carries addGo's changed-from sentence; probe is confined by scopeFor to the scratch namespace, a "
      + "different Durable Object. It writes nothing.",
    /* PL-4 / IS-4, 2026-08-08. Classified by the item that adds it. */
    capturerequestdraining: "CLASS-FENCED to admin, probe and daemon (NO MEMBER CLASS), so no member "
      + "session reaches it, and probe is confined by scopeFor to the scratch namespace. It exists for "
      + "ONE caller — op=acquire's capture-request arm, asking whether a named request is being drained "
      + "right now so it can admit the drain and refuse everybody else. It answers about ONE request the "
      + "caller already names and enumerates nothing, so there is no list whose total could betray a "
      + "hidden row. Gating it on the request's inquiry would put a member predicate in front of a "
      + "question only the daemon asks, which protects nothing and would make the fence harder to read.",
    /* PL-11 / IS-5 / D-199, 2026-08-08. Classified by the item that adds it. */
    aicredentials: "HOLDS NO CORPUS MATERIAL: the roster of agent credentials this group has minted "
      + "— an identity, a principal, a declared task scope, and who authored it. No bundle id appears "
      + "in the table, so there is nothing for the D-15 viewer predicate to filter and a gate here "
      + "would be a gate over nothing, the `biasinhale` entry's reasoning arriving from the other "
      + "direction. It is CLASS-FENCED to admin and member and is deliberately wider than the acts "
      + "beside it: what agents are running here, under whose name, and what they may touch is "
      + "exactly the sort of thing a member should not have to ask an administrator for, and D-199 (2) "
      + "put the scope on the record so it could be READ. It publishes no value and no hash.",
    /* the pre-auth surface */
    bootstrap: "PRE-AUTH: answers whether this instance has been claimed. Never reaches the store's "
      + "gated reads.",
    login: "PRE-AUTH: exchanges a password for a session.",
    invitelook: "PRE-AUTH: reads one invite by its own secret.",
    /* PL-12 / D-84, 2026-08-07: the policy inhale, classified by the item that
       adds it. This is the only entry in either table whose reason is that the
       op TOUCHES NO RECORD AT ALL. */
    biasinhale: "READS NO RECORD: op=biasinhale is a pure function over a policy document the CALLER "
      + "posted. It opens no table, joins nothing, and holds no write path — DEC-54 (c) is that reading "
      + "a policy PROPOSES and never installs, and test/bias.test.mjs asserts the absence of a write off "
      + "store.mjs's own bytes rather than trusting this sentence. There is no record material here for "
      + "a viewer predicate to filter, so gating it would be a gate over the caller's own input, which "
      + "protects nothing and would make the ungated set harder to read by putting a gate where there "
      + "is nothing behind it.",
  };

  const unclassified = reads.filter((op) => !(op in GATED) && !(op in UNGATED));
  t("EVERY read op is classified — an unclassified one is named here", unclassified, []);
  t("every ungated op states a reason",
    Object.entries(UNGATED).filter(([, why]) => typeof why !== "string" || why.length < 20).map(([k]) => k), []);
  t("no op is in both lists", Object.keys(GATED).filter((k) => k in UNGATED), []);
}

console.log("\n--- invitation flips visibility (7.4), through the same ops ---");
{
  const inv = await POST(`op=projectinvite&token=${carol}&projectId=${PROJ}&handle=dave`);
  t("the owner invites by handle", inv.result.state, "invited");
  t("now op=list names the project for dave", ids(await GET(`op=list&token=${dave}`)).includes(PROJ), true);
  const aff = await GET(`op=affordances&token=${dave}&target=${PROJ}`);
  t("and op=affordances answers him", aff.body.result.target, PROJ);
  const b = await GET(`op=backlinks&token=${dave}&target=${INFO}`);
  t("and the backlink appears", b.body.result.backlinks.map((x) => x.from), [PROJ]);
}

await mf.dispose();
console.log(`\ngate-reads: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
