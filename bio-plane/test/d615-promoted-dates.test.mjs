/* NEGATIVE CONTROL: DECLARED AND RUN BY `test/d615-promoted-dates.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS COPIES OF THE SOURCES while it runs. Re-run from `bio-plane/`: `node test/d615-promoted-dates.control.mjs [arm]`. Each anchor asserted to occur EXACTLY ONCE; the real sources hashed before and after. RESULTS, RUN 2026-09-25 by D-615's worker on land/worker/D-546 b690552a + D-615 (real `src/store.mjs` 3,498,790 B sha256 550b5376..., UNCHANGED before and after): 7/7 AS DECLARED, exit 0. (a) baseline -> 16/0 · (b) projection-envelope — THE ROW'S OWN ARM, the bundles row written from `meta.created`/`meta.last_updated` again -> 7/7, failing BY NAME at section 1's UNLABELLED "projection shows the document's created and last_updated", the respelling arm and section 2's UNLABELLED revision; RECORDED, NOT SMOOTHED: with the envelope's dates projected, an unlabelled creation meets the NOT NULL `bundles.created` (D-628's raw error), so section 4's origin project throws before its foot and the manifest arms fail downstream of a creation that never landed · (c) manifest-envelope, both manifest rows dated by `meta.last_updated` again -> 14/2 at the creation's and the revision's manifest arms · (d) no-refusal, C-86.7 disarmed -> 9/7 at every MISLABELLED arm and "…and nothing landed" / "…and nothing was written" · (e) exact-compare — OVER-STRICTNESS, a respelling of one instant treated as a contradiction -> 15/1 at the respelling arm · (f) fork-unstamped, the fork's bytes keep the origin's `created` -> 13/3: the fork is REFUSED ENVELOPE_DATES_DISAGREE (its own label contradicts its bytes) · (g) spelling — the derivation written another way -> 16/0. BASELINE ON THE UNFIXED SOURCES (b690552a via D615_SRC): 4 pass / 10 fail — both mislabelled dates LANDED, the projection showed the envelope's dates, and the fork section threw at the origin's NOT NULL `created` (that suite's envelope-less creation). */
/* D-615 — `op=promote` TAKES A BUNDLE'S `created` AND `last_updated` FROM THE DOCUMENT, NOT THE ENVELOPE.
 * `docs/architecture/BIO_Case_Making_v0_1.md` §2, with C-2.5 and D-510/D-563's derivation: the document states what it
 * is, and the envelope is a label. D-563 derived the title and the state; this item derives the last two CORE_FIELDS,
 * the two dates, and every site that recorded them off `meta` — `bundles.created`, `bundles.last_updated`, the manifest
 * row's `created` (the document's own `last_updated`, the order REC-182, C-12.1 and #revisionKind read) and a minted
 * content row's `at`. A non-replay envelope contradicting the document is refused by name: ENVELOPE_DATES_DISAGREE
 * (C-86.7), after every fence, before the first write. Two spellings of one instant agree.
 *
 * MEASURED FIRST (M-181, read-only, op=stats equal before/after): 0 of 31 head rows in `bio` differ from their documents
 * on either date; `scratch` holds none. So nothing live stands for the refusal to meet.
 *
 * WHAT THIS SUITE CANNOT SEE: a REPLAY's exemption from the refusal (not from the derivation) needs a verified replay
 * creation (REC-173) and is not driven, as in D-563's suite. A minted content row's `at` is changed by the same token
 * and is not read back here. D-674 (the manifest's `created` is the writer's own `last_updated`, so a writer can steer
 * REC-182's order) is NOT this item's and is not changed by it: the writer authors the document too. A promotion whose
 * document and envelope BOTH state no date meets the NOT NULL column (D-628), not this item.
 * A REVISION whose bytes restate `created` lands and the row keeps the creation's (D-692, minted by this item, not
 * fixed here): section 2 revises `last_updated` alone.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.D615_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const ADM = "adm-d615", MTOK = "mem-d615";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const NL = "\n", E = encodeURIComponent;
/* The document's dates, and a label's: each pair differs, so an arm that records the wrong one reads differently. */
const DOC_CREATED = "2026-07-24T00:00:00Z", DOC_UPDATED = "2026-07-25T00:00:00Z", DOC_REVISED = "2026-07-27T00:00:00Z";
const ENV_CREATED = "2026-01-01T00:00:00Z", ENV_UPDATED = "2026-01-02T00:00:00Z";

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: ADM, MEMBER_TOKEN: MTOK, VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const must = (label, r) => { if (!r || r.ok === false) throw new Error(`${label}: ${JSON.stringify(r).slice(0, 600)}`); return r; };
const reasonOf = (r) => r?.ok === true ? "LANDED" : (r?.reason ?? JSON.stringify(r).slice(0, 160));

/* `created`/`last_updated` null → the line is left out: the document states no such date. */
const infoMd = (id, { created = DOC_CREATED, updated = DOC_UPDATED } = {}) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Council minutes ${id}"`, "current_state: collected", "prior_state: null",
  ...(created === null ? [] : [`created: "${created}"`]), ...(updated === null ? [] : [`last_updated: "${updated}"`]),
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "source_status: unchanged",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join(NL);
const projectMd = (title) => ["---", "object_type: project", `title: "${title}"`, "current_state: forming",
  `created: "${DOC_CREATED}"`, `last_updated: "${DOC_UPDATED}"`, "references: []", "---", "",
  "## Thesis Summary", "", "A project.", "", "## Open Questions", "", "## Ruled Out", "",
  "## Session Log", "", "## Review Notes", ""].join(NL);

let seq = 0;
/* `env` is the envelope's date fields, spread over the type; a key absent says nothing. */
const promote = async (tok, { id = null, base = null, text, type = "information", env = {}, register = null }) =>
  POST(`op=promote&token=${tok}`, {
    ...(id ? { bundleId: id } : {}), base, snapKey: `20260724T06${String(++seq).padStart(4, "0")}Z_d615`, author: "x",
    meta: { object_type: type, ...env },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: register ?? (id ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : []) });
const listed = async (id) => ((await GET(`op=list&token=${ADM}&limit=1000`)) || {}).bundles?.find((b) => b.bundle_id === id) ?? null;
const proj = async (id) => GET(`op=projection&token=${ADM}&id=${E(id)}`);
const dates = async (id) => { const r = await proj(id); return r ? [r.created ?? null, r.last_updated ?? null] : null; };
/* The manifest rows' `created`, in write order, from the image's `_history/manifest.json`. */
const manifestCreated = async (id) => {
  const img = await GET(`op=image&token=${ADM}&id=${E(id)}`);
  const m = (img?.image || img?.files || img || {})["_history/manifest.json"];
  try { return JSON.parse(m).entries.map((e) => e.created); } catch { return null; }
};

try {

must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-615" }));
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role,
    capabilities: ["contribute", "publish", "create_projects"] });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-615` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-615` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin");

/* ======================================================== 1. a creation: the projection shows the document's dates */
console.log("\n--- 1. a creation: a label contradicting either date is refused by name; the projection takes the document's ---");
const I = "INFO-2026-0615-dated";
{
  const mc = await promote(RUTH, { id: I, text: infoMd(I), env: { created: ENV_CREATED, last_updated: DOC_UPDATED } });
  t("MISLABELLED created: refused ENVELOPE_DATES_DISAGREE (C-86.7), naming the field and both dates",
    [reasonOf(mc), mc?.check, mc?.field, mc?.document_value, mc?.envelope_value],
    ["ENVELOPE_DATES_DISAGREE", "C-86.7", "created", DOC_CREATED, ENV_CREATED]);
  const mu = await promote(RUTH, { id: I, text: infoMd(I), env: { created: DOC_CREATED, last_updated: ENV_UPDATED } });
  t("MISLABELLED last_updated: refused ENVELOPE_DATES_DISAGREE on last_updated",
    [reasonOf(mu), mu?.field, mu?.document_value, mu?.envelope_value],
    ["ENVELOPE_DATES_DISAGREE", "last_updated", DOC_UPDATED, ENV_UPDATED]);
  t("…and nothing landed", await listed(I), null);
  const ul = await promote(RUTH, { id: I, text: infoMd(I), env: {} });
  t("UNLABELLED: LANDS, and the projection shows the document's created and last_updated",
    [reasonOf(ul), await dates(I)], ["LANDED", [DOC_CREATED, DOC_UPDATED]]);
  t("…and the creation's manifest row is dated by the document's last_updated", await manifestCreated(I), [DOC_UPDATED]);

  /* OVER-STRICTNESS: a label naming the SAME INSTANTS in another spelling is no contradiction. */
  const J = "INFO-2026-0615-respelled";
  const rs = await promote(RUTH, { id: J, text: infoMd(J),
    env: { created: "2026-07-24T00:00:00.000Z", last_updated: " 2026-07-25T00:00:00+00:00 " } });
  t("OVER-STRICTNESS: a label RESPELLING the document's instants LANDS, and the projection keeps the document's spelling",
    [reasonOf(rs), await dates(J)], ["LANDED", [DOC_CREATED, DOC_UPDATED]]);
  const K = "INFO-2026-0615-labelled";
  const lb = await promote(RUTH, { id: K, text: infoMd(K), env: { created: DOC_CREATED, last_updated: DOC_UPDATED } });
  t("LABELLED truly: LANDS with the document's dates", [reasonOf(lb), await dates(K)], ["LANDED", [DOC_CREATED, DOC_UPDATED]]);
}

/* ======================================================== 2. a revision */
console.log("\n--- 2. a revision: last_updated and the manifest row follow the document; created stays the creation's ---");
{
  const head = (await listed(I))?.bundle_sha;
  const revised = infoMd(I, { updated: DOC_REVISED });
  const mr = await promote(RUTH, { id: I, base: head, text: revised, env: { last_updated: DOC_UPDATED } });
  t("MISLABELLED (the label keeps the OLD last_updated): refused ENVELOPE_DATES_DISAGREE",
    [reasonOf(mr), mr?.field, mr?.document_value, mr?.envelope_value],
    ["ENVELOPE_DATES_DISAGREE", "last_updated", DOC_REVISED, DOC_UPDATED]);
  t("…and nothing was written (head and dates unchanged)", [(await listed(I))?.bundle_sha, await dates(I)],
    [head, [DOC_CREATED, DOC_UPDATED]]);
  const ur = await promote(RUTH, { id: I, base: head, text: revised, env: {} });
  t("UNLABELLED revision LANDS; the projection shows the document's last_updated, created unchanged",
    [reasonOf(ur), await dates(I)], ["LANDED", [DOC_CREATED, DOC_REVISED]]);
  t("…and the revision's manifest row is dated by the document's last_updated", await manifestCreated(I),
    [DOC_UPDATED, DOC_REVISED]);
}

/* ======================================================== 3. the envelope is the fallback where the bytes state none */
console.log("\n--- 3. a document stating no date: the envelope's is recorded, as before ---");
{
  const N = "INFO-2026-0615-undated";
  const nd = await promote(RUTH, { id: N, text: infoMd(N, { created: null, updated: null }),
    env: { created: ENV_CREATED, last_updated: ENV_UPDATED } });
  t("a document stating neither date LANDS under the envelope's two dates", [reasonOf(nd), await dates(N)],
    ["LANDED", [ENV_CREATED, ENV_UPDATED]]);
  t("…and its manifest row is dated by the envelope's last_updated", await manifestCreated(N), [ENV_UPDATED]);
}

/* ======================================================== 4. an internal writer: the fork */
console.log("\n--- 4. op=projectfork: the fork's bytes say it was created now, and the projection shows that ---");
{
  const o = must("origin project", await promote(RUTH, { text: projectMd("Harbor Lease"), type: "project", register: [] }));
  const f = await GET(`op=projectfork&token=${RUTH}&projectId=${E(o.bundleId)}&title=${E("Harbor Lease fork")}`);
  t("the fork LANDS", reasonOf(f), "LANDED");
  const img = await GET(`op=image&token=${ADM}&id=${E(f?.newId ?? "none")}`);
  const md = (img?.image || img?.files || img || {})["bundle.md"] || "";
  const docCreated = (/^created:\s*"?([^"\n]+)"?\s*$/m.exec(md) || [])[1] ?? null;
  const row = await dates(f?.newId ?? "none");
  t("the fork's document states its OWN creation, not the origin's", [docCreated !== null, docCreated !== DOC_CREATED],
    [true, true]);
  t("…and the projection's created is the one the fork's document states", row?.[0], docCreated);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nd615-promoted-dates: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
