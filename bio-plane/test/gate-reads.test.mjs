/* NEGATIVE CONTROL: (run 2026-08-03, rec25-agent) TWO arms, both required because the store FAILS CLOSED. (a) Remove `op === "list"` from the viewer-stamp condition in src/index.mjs (the REC-25 stamp block) -> 6 assertions fail, ALL naming op=list, across every viewer (empty answers: a missing stamp is an outage, never a leak — the doctrinal failure mode). (b) Neuter the DO gate instead — in src/store.mjs listBundles, replace the gate predicate with 1=1 -> 3 assertions fail naming op=list as THE LEAK (dave receives the project row). Restored -> 36 pass. Detail below. */
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
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "t-admin-rec25", MEMBER_TOKEN: "mem-rec25", PROBE_TOKEN: "prb-rec25", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* Reads keep status AND body: the no-disclosure assertions compare both, so a
   refusal that says the right thing with the wrong code cannot pass. The DO
   envelope's `ms` timing field is stripped BEFORE comparison — it measures the
   wall clock, not the answer, and a 0ms-vs-1ms pair made the byte-identical
   assertions flake (~1 run in 20, observed while running the negative
   control). Everything else in the answer is compared exactly. */
const GET = async (q) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`);
  const body = await r.json();
  delete body.ms;
  return { status: r.status, body };
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

const md = (id, type, refs = "") => `---\nid: ${id}\nobject_type: ${type}\ncurrent_state: ${type === "project" ? "forming" : "collected"}\ncreated: "2026-07-01T00:00:00Z"\nlast_updated: "2026-07-01T00:00:00Z"\n${refs}---\n\n## Summary\n\nSecret plan.\n`;
const mk = async (id, type, tok, refs = "") => {
  const text = md(id, type, refs);
  const r = await POST(`op=promote&token=${tok}`, {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "suite",
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    meta: { object_type: type, group: "believe-in-oakland", title: id,
            current_state: type === "project" ? "forming" : "collected",
            created: "2026-07-01T00:00:00Z", last_updated: "2026-07-01T00:00:00Z" } });
  if (!r.result?.ok) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
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
const PROJ = "PROJ-2026-0001-secret";
const MISSING = "PROJ-2026-9999-none";   // never created: the no-disclosure yardstick
const SHARED = [INFO, PROB];

await mk(INFO, "information", "mem-rec25");
await mk(PROB, "problem", "mem-rec25");
/* The project cites the shared evidence in its own frontmatter — `cites` lives
   on the citing object — so the reverse edge INTO the information is exactly
   the edge 7.9 says must be filtered by the viewer's position. */
await mk(PROJ, "project", carol,
  `references:\n  - target: ${INFO}\n    rel: cites\n    status: confirmed\n    note: evidence\n`);

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
  t("no field of the paged answer discloses a withheld count",
    Object.keys(paged.body.result).sort(), ["bundles", "cursor", "total"]);
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
  const enumd = await GET(`op=projection&token=${dave}`);
  t("the projection enumeration carries only the shared corpus",
    (enumd.body.result || []).map((b) => b.bundle_id).sort(), SHARED);
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
