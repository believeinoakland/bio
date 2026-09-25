/* NEGATIVE CONTROL: DECLARED AND RUN BY `test/d726-revision-regroups.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS COPIES OF THE SOURCES while it runs. Re-run from `bio-plane/`: `node test/d726-revision-regroups.control.mjs [arm]`. RESULTS, RUN 2026-09-25 by WORKER D-726 on land/worker/D-726 over land/worker/D-707 95839afa (real `src/store.mjs` 3,512,179 B sha256 d2b8c449..., UNCHANGED before and after): 5/5 AS DECLARED, exit 0. (a) baseline -> 11/0 · (b) no-regroup-refusal — THE ROW'S ARM, C-86.14 disarmed -> 5/6, failing BY NAME at REGROUPED, SAYS BOTH GROUPS, the detail, NOTHING WAS WRITTEN, QUOTED and STAMPED, every LANDS arm green · (c) regroup-any-statement — OVER-STRICTNESS, a fence tighter than its rule (any group stated in a revision refused) -> 10/1, at the SAME-group revision alone · (d) regroup-no-replay-exemption -> 10/1, the REPLAY arm alone · (e) regroup-spelling — the fence written another way -> 11/0. UNFIXED SOURCES (95839afa): 5 pass / 6 fail — the regrouped revision LANDED, the row kept believe-in-oakland while the head bytes said some-other-group, and the manifest grew to 2. */
/* D-726 — A REVISION DOES NOT REGROUP ITS BUNDLE (C-86.14 REVISION_REGROUPS_BUNDLE), D-692's C-86.9 one column over.
 * `bundles.group_id` is written by the creation alone (D-436: the ON CONFLICT arm never touches it), and nothing
 * compared a revision's document `group:` with the head's: a revision whose bytes restated a DIFFERENT group LANDED and
 * the row kept the creation's, so the row and the head bytes disagreed (measured through op=promote on
 * land/worker/D-707 95839afa: row group_id believe-in-oakland, head bytes `group: some-other-group`). Moving the row
 * instead would let any writer re-attribute a document to another producer, which D-436 decides is the instance's to
 * state, never the caller's; so the revision is refused by name, after the compare-and-swap and before the first
 * write. A revision stating no group carries the head's and is not asked. Replay is exempt (D-510's reason).
 *
 * WHAT THIS SUITE CANNOT SEE: a head ALREADY disagreeing with its bytes (the live count is the report's, not this
 * suite's); an envelope `meta.group` on a revision, which D-436 reads nowhere and this fence does not ask.
 */
import { withReplayProof } from "./replay-proof.mjs";    /* D-512: a replay is honoured only over provenance the plane verifies */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.D726_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { PROMOTED_TYPE_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));
const ADM = "adm-d726", MTOK = "mem-d726";
const HOME = "believe-in-oakland", OTHER = "some-other-group";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const NL = "\n", E = encodeURIComponent;

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: HOME, ADMIN_TOKEN: ADM, MEMBER_TOKEN: MTOK, VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const must = (label, r) => { if (!r || r.ok === false) throw new Error(`${label}: ${JSON.stringify(r).slice(0, 600)}`); return r; };
const reasonOf = (r) => r?.ok === true ? "LANDED" : (r?.reason ?? JSON.stringify(r).slice(0, 160));

/* `group` is the line's text after `group: `, or null to leave the line out (the document states no group). */
const infoMd = (id, { group = HOME, updated = "2026-07-25T00:00:00Z" } = {}) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Council minutes ${id}"`, "current_state: collected", "prior_state: null",
  `created: "2026-07-24T00:00:00Z"`, `last_updated: "${updated}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  ...(group === null ? [] : [`group: ${group}`]), "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "source_status: unchanged",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join(NL);

let seq = 0, day = 25;
const nextUpdated = () => `2026-07-${String(++day).padStart(2, "0")}T00:00:00Z`;
const promote = async (tok, { id, base = null, text }) =>
  POST(`op=promote&token=${tok}`, {
    bundleId: id, base, snapKey: `20260724T07${String(++seq).padStart(4, "0")}Z_d726`, author: "x",
    meta: { object_type: "information" },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: base === null ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [] });
const listed = async (id) => ((await GET(`op=list&token=${ADM}&limit=1000`)) || {}).bundles?.find((b) => b.bundle_id === id) ?? null;
const headOf = async (id) => (await listed(id))?.bundle_sha;
const rowGroup = async (id) => (await GET(`op=projection&token=${ADM}&id=${E(id)}`))?.group_id ?? null;   /* instance-group.test.mjs's reader */
const headBytesGroup = async (id) => {
  const img = await GET(`op=image&token=${ADM}&id=${E(id)}`);
  const md = (img?.image || img?.files || img || {})["bundle.md"] || "";
  return (/^group:\s*"?([^"\n]*?)"?\s*$/m.exec(md) || [])[1] ?? null;
};
const manifestLen = async (id) => {
  const img = await GET(`op=image&token=${ADM}&id=${E(id)}`);
  const m = (img?.image || img?.files || img || {})["_history/manifest.json"];
  try { return JSON.parse(m).entries.length; } catch { return null; }
};

try {

must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-726" }));
const add = await POST(`op=memberadd&token=${ADM}`, { memberId: "ruth", cover: "cover for ruth", role: "admin",
  capabilities: ["contribute", "publish", "create_projects"] });
must("enroll ruth", await POST("op=enroll", { invite: add && add.invite, handle: "ruth", password: "ruth-pass-726" }));
const lg = await POST("op=login", { role: "member:ruth", password: "ruth-pass-726" });
if (!lg || !lg.token) throw new Error(`login ruth: ${JSON.stringify(lg)}`);
const RUTH = lg.token;

console.log("\n--- 1. a revision restating a DIFFERENT group is refused by name; nothing is written ---");
const R = "INFO-2026-0726-regrouped";
{
  must("fixture R", await promote(RUTH, { id: R, text: infoMd(R) }));
  const head = await headOf(R);
  t("FIXTURE: the creation is held, its row and its bytes both saying the instance's group (the corpus is non-empty)",
    [typeof head, await rowGroup(R), await headBytesGroup(R)], ["string", HOME, HOME]);
  const rg = await promote(RUTH, { id: R, base: head, text: infoMd(R, { group: OTHER, updated: nextUpdated() }) });
  t("REGROUPED: a revision whose bytes say another group is REFUSED REVISION_REGROUPS_BUNDLE (C-86.14)",
    [reasonOf(rg), rg?.code, rg?.check], ["REVISION_REGROUPS_BUNDLE", "REVISION_REGROUPS_BUNDLE", "C-86.14"]);
  t("…and the refusal carries the catalogue's canned translation and SAYS BOTH GROUPS",
    [rg?.translation === PROMOTED_TYPE_CHECKS.REVISION_REGROUPS_BUNDLE?.translation && typeof rg?.translation === "string",
     rg?.head_group, rg?.revision_group], [true, HOME, OTHER]);
  t("…and its detail says nothing was written", /Nothing was written\./.test(rg?.detail ?? ""), true);
  t("…and NOTHING WAS WRITTEN: the head, the row's group, the head bytes' group and the manifest are unchanged",
    [await headOf(R), await rowGroup(R), await headBytesGroup(R), await manifestLen(R)], [head, HOME, HOME, 1]);
  const qg = await promote(RUTH, { id: R, base: await headOf(R), text: infoMd(R, { group: `"${OTHER}"`, updated: nextUpdated() }) });
  t("QUOTED: the other group in a quoted spelling is refused by the same name", reasonOf(qg), "REVISION_REGROUPS_BUNDLE");
}

console.log("\n--- 2. over-strictness: the same group, or none, lands ---");
{
  const same = await promote(RUTH, { id: R, base: await headOf(R), text: infoMd(R, { group: ` "${HOME}" `, updated: nextUpdated() }) });
  t("OVER-STRICTNESS: a revision restating the SAME group (quoted, padded) LANDS, and the row keeps it",
    [reasonOf(same), await rowGroup(R)], ["LANDED", HOME]);
  const none = await promote(RUTH, { id: R, base: await headOf(R), text: infoMd(R, { group: null, updated: nextUpdated() }) });
  t("OVER-STRICTNESS: a revision stating no group LANDS, and the row keeps the creation's",
    [reasonOf(none), await rowGroup(R)], ["LANDED", HOME]);
}

console.log("\n--- 3. a creation stamped over the caller's own group: revising the caller's copy is a regrouping ---");
{
  /* D-436 stamps a creation with the instance's group whatever its bytes said; a caller revising from its OWN copy
     restates the group it sent, which is not the one the record holds. */
  const S = "INFO-2026-0726-stamped";
  must("fixture S", await promote(RUTH, { id: S, text: infoMd(S, { group: OTHER }) }));
  t("FIXTURE: the creation's bytes were stamped with the instance's group", [await rowGroup(S), await headBytesGroup(S)], [HOME, HOME]);
  const rv = await promote(RUTH, { id: S, base: await headOf(S), text: infoMd(S, { group: OTHER, updated: nextUpdated() }) });
  t("STAMPED: revising with the caller's pre-stamp group is refused REVISION_REGROUPS_BUNDLE", reasonOf(rv), "REVISION_REGROUPS_BUNDLE");
}

console.log("\n--- 4. replay is exempt ---");
{
  const P = "INFO-2026-0726-replayed";
  const rpk = async (base, text) => {
    const pkg = { bundleId: P, base, snapKey: `20260724T07${String(++seq).padStart(4, "0")}Z_d726`, author: "x",
      meta: { object_type: "information" }, replay: true,
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [] };
    return POST(`op=promote&token=${ADM}`, await withReplayProof(mf, `token=${ADM}`, pkg));
  };
  must("fixture P (replayed creation)", await rpk(null, infoMd(P)));
  const rp = await rpk(await headOf(P), infoMd(P, { group: OTHER, updated: nextUpdated() }));
  t("REPLAY: a REPLAYED revision restating a different group is not refused by this fence",
    [reasonOf(rp) === "REVISION_REGROUPS_BUNDLE", reasonOf(rp)], [false, "LANDED"]);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nd726-revision-regroups: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
