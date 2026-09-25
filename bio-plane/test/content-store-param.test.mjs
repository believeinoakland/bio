/* NEGATIVE CONTROL: the four arms live in `test/nc-d675.mjs` and are re-run in one step with `node test/nc-d675.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE, and is restored from a uniquely-named per-arm pristine copy in a `controlPen` outside the worktree, verified by sha256 AND by cmp with a byte count printed and a minimum guarded. Declared before arming: (a) `baseline` — nothing armed; MUST be green. (b) `passthrough` — THE ROW'S OWN ARM: in src/index.mjs's generic DO forward, pass `store` into the inner URL again; the scratch arm and the bio arm MUST FAIL BY NAME ("store=scratch answers THE SCRATCH ROW", "store=bio answers THE BIO ROW"), and so MUST the predicate refusal (it then names ["store","where"] — DECLARATION CORRECTED after the first run, which had declared it held open; the assertion was not touched), while the front-door NAMESPACE_UNKNOWN refusal and the no-store= default MUST STAY GREEN. (c) `swallow` — THE WRONG FIX: make the forward drop EVERY parameter but `id` and the stamps, which also makes `store=` answerable; the scratch and bio arms MUST STAY GREEN and the predicate refusal ("a PREDICATE beside store=scratch is still refused, and ONLY the predicate is named") MUST FAIL — the suite tells stripping the edge's own parameter from silently dropping a caller's filter. (d) `onestore` — make `scopeFor` answer `bio` for every non-probe class whatever `store=` says, so both seeds land in one Durable Object and a no-refusal answer proves nothing about namespaces; the isolation assertions MUST FAIL ("the SCRATCH row is not in bio", "and the BIO row is not in scratch"). OVER-STRICTNESS is held by section 3: `store=` spelled FIRST in the query, and the default (no `store=`) addressing bio, must pass under every arm but `onestore`. */
/* RESULTS, run 2026-09-25 by the D-675 worker, each arm ALONE, every restore byte-identical by sha256 AND content (src/index.mjs 888,558 bytes, sha256 231c3dbb256e… each time): baseline 9/0 green · passthrough 3/6 (3/3 declared failures, 2/2 held open) · swallow 8/1 (1/1, 2/2) · onestore 7/2 (2/2, 2/2) — ALL FOUR AS DECLARED. ONE CAME BACK WRONG ON THE FIRST RUN AND IS RECORDED AT ITS SITE IN nc-d675.mjs: `passthrough` had declared the predicate refusal HELD OPEN, and it failed because the refusal then names ["store","where"]; the DECLARATION moved, the assertion did not. */

/* D-675 — op=content CAN BE CALLED WITH `store=`, AND IT ANSWERS FROM THE NAMESPACE NAMED.
 *
 * THE DEFECT, MEASURED THROUGH THE OP on origin/main 5e8a65a8 (2026-09-25): `op=content&id=<row>&store=scratch`
 * and `...&store=bio` BOTH answered `{ ok:false, reason:"FIXED_KEY_ONLY", rejected:["store"] }`. The generic DO
 * forward in src/index.mjs copied every query parameter but `token` and `op` into the store's URL, and
 * `Store.contentRead` declares its grammar as an ACCEPT set (`CONTENT_READ_PARAMS = {id, viewer}`) and refuses
 * everything else by name. So the one parameter CLAUDE.md §5 requires on every live-verification call made the
 * read uncallable, and a live check of op=content could only be made against the real record.
 *
 * THE FIX IS AT THE FORWARD, not in the accept set: `store` is consumed by the EDGE (`scopeFor` turns it into
 * the Durable Object the request is sent to) and no DO route reads it, so it is stripped with `token` and `op`.
 * Admitting it to `CONTENT_READ_PARAMS` would make the store claim to understand a parameter it ignores.
 *
 * Every assertion is THROUGH THE OP (CLAUDE.md §5: a store-level test is not evidence a caller can reach it),
 * and each namespace holds its OWN row so that "answered" is distinguishable from "answered from the right place".
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
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
  bindings: { ADMIN_TOKEN: "adm-d675", MEMBER_TOKEN: "mem-d675", PROBE_TOKEN: "prb-d675",
              AI_TOKEN: "ai-d675", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok, qs = "") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs}`, { method: "POST", body: JSON.stringify(body) })).json());
const raw = async (qs) => rP(await (await mf.dispatchFetch(`http://x/api/?${qs}`)).json());

const NOW = "2026-09-25T00:00:00Z", LATER = "2026-09-25T01:00:00Z";
const session = async (memberId) => {
  const add = await post("memberadd", { memberId, cover: `cover for ${memberId}`, role: "admin",
                                        capabilities: ["contribute", "publish", "create_projects"] }, "adm-d675");
  const en = await post("enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en).slice(0, 300)}`);
  const lg = await post("login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg).slice(0, 300)}`);
  return lg.token;
};
const RUTH = await session("ruth");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

/* One captured document and one `document` content row, written INTO the namespace named. */
const seed = async (ns, id, shaDoc) => {
  const text = infoMd(id);
  const prov = JSON.stringify({ documents: [{ capture: { sha256: shaDoc, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
               entities: [], facts: {}, text_source: [] } }] });
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) },
                 { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }];
  const pr = await post("promote", {
    bundleId: id, base: null, snapKey: `20260925T000001Z_${sha(ns).slice(0, 8)}`,
    /* CORRECTED at c22-batch30 (CONDUCT #22), never exempted: this item was cut before D-563, whose C-86.3 refuses an
       envelope title the held document contradicts (`Bundle <id>` against the document's own `title:`); the envelope
       title is dropped as D-563 dropped it in its own fixtures, and promote derives it from the document. */
    meta: { object_type: "information", group: "believe-in-oakland",
            current_state: "collected", created: NOW, last_updated: LATER },
    files, register: [{ path: "snapshots/d.bin", sha256: shaDoc, encoding: "binary", bytes: 10 }] },
    RUTH, `&store=${ns}`);
  if (pr.ok === false) throw new Error(`promote ${id} in ${ns}: ${JSON.stringify(pr).slice(0, 400)}`);
  const m = await post("contentmint", { bundleId: id, extent: { kind: "document" } }, RUTH, `&store=${ns}`);
  if (!m.ok || !m.content_id) throw new Error(`contentmint ${id} in ${ns}: ${JSON.stringify(m).slice(0, 400)}`);
  return m.content_id;
};

console.log("\n--- 0. the ground: one content row in `bio`, a DIFFERENT one in `scratch` ---");
const BIO_DOC = "INFO-2026-8675-in-bio", SCR_DOC = "INFO-2026-8675-in-scratch";
const BIO_ROW = await seed("bio", BIO_DOC, sha("d675-the-bio-document"));
const SCR_ROW = await seed("scratch", SCR_DOC, sha("d675-the-scratch-document"));
t("the two rows are two ids (a fixture where they coincide could not tell the namespaces apart)",
  [typeof BIO_ROW, typeof SCR_ROW, BIO_ROW !== SCR_ROW], ["string", "string", true]);

const read = (qs) => raw(`op=content&token=${RUTH}&${qs}`);
const shape = (r) => [r.ok, r.reason ?? null, r.rejected ?? null, r.bundle_id ?? null];

console.log("\n--- 1. D-675: `store=` is the edge's parameter and op=content answers with it ---");
t("store=scratch answers THE SCRATCH ROW, through the op",
  shape(await read(`id=${SCR_ROW}&store=scratch`)), [true, null, null, SCR_DOC]);
t("store=bio answers THE BIO ROW, through the op",
  shape(await read(`id=${BIO_ROW}&store=bio`)), [true, null, null, BIO_DOC]);

console.log("\n--- 2. the namespace NAMED is the namespace READ — isolation, both directions ---");
t("the SCRATCH row is not in bio: named from bio it answers NO_SUCH_CONTENT",
  shape(await read(`id=${SCR_ROW}&store=bio`)), [false, "NO_SUCH_CONTENT", null, null]);
t("and the BIO row is not in scratch: named from scratch it answers NO_SUCH_CONTENT",
  shape(await read(`id=${BIO_ROW}&store=scratch`)), [false, "NO_SUCH_CONTENT", null, null]);

console.log("\n--- 3. OVER-STRICTNESS: spellings the fix did not anticipate still answer ---");
t("store= spelled FIRST in the query answers the scratch row the same",
  shape(await raw(`store=scratch&op=content&id=${SCR_ROW}&token=${RUTH}`)), [true, null, null, SCR_DOC]);
t("no store= at all still addresses bio, the default",
  shape(await read(`id=${BIO_ROW}`)), [true, null, null, BIO_DOC]);

console.log("\n--- 4. what the fix must NOT loosen ---");
t("a PREDICATE beside store=scratch is still refused, and ONLY the predicate is named",
  shape(await read(`id=${SCR_ROW}&store=scratch&where=extent_kind%3Ddocument`)),
  [false, "FIXED_KEY_ONLY", ["where"], null]);
t("a namespace that does not exist is still refused at the front door (D-456), not stripped into bio",
  (await (async () => { const r = await read(`id=${BIO_ROW}&store=Scratch`); return [r.ok, r.reason]; })()),
  [false, "NAMESPACE_UNKNOWN"]);

/* ===================== FOOT ============================================ */
console.log(`\n  ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
