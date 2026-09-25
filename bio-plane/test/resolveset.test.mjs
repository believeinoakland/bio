/* NEGATIVE CONTROL: declared before arming 2026-09-24 by the D-291 worker. ONE arm: delete `op=resolve`'s set branch (the `if (items !== undefined) { ... }` block at the head of `resolveReferences`), so a body carrying `items` falls through to the single act, which reads no `captureSha` -> MUST FAIL, BY NAME: block 1 (every outcome, the counts, READ BACK), block 2 (ok over a clean set), block 4 (the set-shape refusals), block 5 (the sweep armed once) and block 7 (a set resolves exactly what the single act resolves). MUST NOT FAIL: block 3 (the single form never reaches the branch) and block 6 (the published table is `affordances.mjs`'s, not the branch). The result is recorded on the CONTROL RESULT line below from the run, never from this declaration.
 * CONTROL RESULT 2026-09-24 (D-291 worker): armed by `cp` of src/store.mjs aside (sha256 bc1c89ca90fb5b33…, 2,961,122
 * bytes) and ONE splice replacing the six-line set branch with a marker (anchor matched once; marker count 1). RED, exit
 * 1, 7 pass / 15 fail — every MUST-FAIL arm of blocks 1, 2, 5 and block 7's "same decision" arm, and block 4's two
 * set-shape refusals. Blocks 3 and 6 GREEN as declared. NOT AS DECLARED, and correctly: block 4's "READ BACK: the
 * document in the refused set was not resolved" and "neither refusal armed the connection sweep" stayed GREEN — with
 * the branch gone the set is refused NO_SHA and still resolves nothing and arms nothing, so those two arms cannot see
 * the branch (they guard the refusal's WHOLENESS, not its presence); and block 7's "…a name correspondence at C"
 * reads the SINGLE document only. Restored by `cp`; sha256 and `cmp` equal to the per-arm pristine copy (marker
 * count 0); suite re-run green.
 *
 * D-291 — `op=resolve` TAKES A SET, IN ONE MOTION (BIO_Interaction_Constructs_v0_1.md §S "SELECTION-SCOPED ACTION —
 * how any act goes bulk, safely", named by BOB #32's ruling of 2026-09-23 23:30Z). The row: *"bulk and single both
 * reach the op in one motion."* The plane half is here; the surface half (`resolveCandPaint`, one call per
 * selection) is `civicos-ui/test/resolve-set.test.mjs`, which carries the row's own control (a client-side loop).
 *
 * THE SHAPE, and why it is D-126's and not a second one: the set rides D-126's `per-item` weight (`store.mjs
 * #perItem`, IC-235) — each document is resolved by `#resolveOne`, the SAME code the single act runs, and each
 * one that code refuses is RETAINED with that refusal, none stopping the others.
 *
 * HOW A LIAR PASSES, and the arm aimed at each:
 *   - ALL-OR-NOTHING RELABELLED — block 1 puts the refused document in the MIDDLE and asserts the one after it
 *     was APPLIED and READ BACK.
 *   - A SET PATH THAT IS A DIFFERENT RECOGNISER — block 7 resolves two documents with identical references, one
 *     by the single act and one inside a set, and demands the same resolutions (grade, method, basis, entity).
 *   - A STAMP AN ITEM CAN OVERRIDE — block 1's items name their own `resolvedBy`; the record keeps the plane's.
 *   - N SWEEPS FOR ONE MOTION, or NONE — block 5 reads the alarm: armed after a set that resolved something,
 *     and NOT armed by a set that resolved nothing.
 *
 * WHAT THIS CANNOT SEE: whether a SURFACE sends one call or loops — that is a fact about the caller and it is
 * the UI suite's. `SET_ITEM_FAILED` (C-75.4) is not driven here either (`#resolveOne` throws on nothing this
 * suite can send); D-126's `peritem.test.mjs` pins it structurally for the one helper both use.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const script = readFileSync(IDX, "utf8");
const makeMf = () => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rs", MEMBER_TOKEN: "mem-rs", PROBE_TOKEN: "prb-rs", VERSION: "test",
              CONNECTION_DERIVE_DELAY_MS: "600000" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const mkApi = (mf) => ({
  post: async (op, body, tok = "mem-rs") => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json()),
  get: async (op, qs, tok = "mem-rs") => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}&token=${tok}${qs ? "&" + qs : ""}`)).json()),
});
const getObj = async (mf) => { const ns = await mf.getDurableObjectNamespace("STORE"); return ns.get(ns.idFromName("bio")); };

const NOW = "2026-09-24T00:00:00Z";
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Resolve set ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "Resolve set bundle.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
let bseq = 0;
const promoteReading = async (post, captureSha, entities) => {
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-rs`;
  const md = bundleMd(id);
  const doc = { capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
                reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
                           at: NOW, entities } };
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("promote", {
    bundleId: id, base: null, snapKey: "20260924T010000Z_aaaa1111", author: "rs",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Resolve set ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [],
  });
  return { id, ok: r.ok !== false };
};
const ORD = [{ ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance No. 13579" }];
const byName = [{ ref: "ordinance:99999", kind: "ordinance", key: "99999", label: "Rent Adjustment Ordinance" }];
/* A resolution with the document's own identity taken off, so two documents can be compared on what the
   recogniser DECIDED about them. */
const decided = (rs) => (rs?.resolutions || []).map((r) => [r.ref, r.entity_id, r.grade, r.method, r.basis]);

const mf = makeMf();
try {
  const { post, get } = mkApi(mf);
  const obj = await getObj(mf);

  console.log("\n--- seed: one subject, seven documents that name it ---");
  const e = await post("entitycreate",
    { kind: "ordinance", label: "Rent Adjustment Ordinance", aliases: ["ordinance:13579", "Rent Adjustment Ordinance"] });
  const ent = e.entity_id;
  const [dA, dB, dC, dD, dE, dF, dG] = ["A", "B", "C", "D", "E", "F", "G"].map((x) => sha("rs-doc-" + x));
  for (const d of [dA, dB, dC, dD, dE]) await promoteReading(post, d, ORD);
  await promoteReading(post, dF, byName);
  await promoteReading(post, dG, byName);
  t("the subject is registered and seven documents carry a reading", [e.ok, bseq], [true, 7]);
  t("and no alarm is armed before any resolve", await obj.schedAlarmAt(), null);

  /* ================================================================ 4 (first, on a quiet store)
   * The SET's own refusals come before any document is read, so nothing moves. */
  console.log("\n--- 4 · the set's own shape is refused WHOLE, and nothing moves ---");
  const none = await post("resolve", { items: [] });
  t("an empty set is refused SET_NO_ITEMS (C-75.1), under the per-item weight",
    [none.ok, none.code, none.check, none.op, none.weight], [false, "SET_NO_ITEMS", "C-75.1", "resolve", "per-item"]);
  const big = await post("resolve", { items: Array.from({ length: 101 }, () => ({ captureSha: dE })) });
  t("a set over the published bound is refused SET_TOO_LARGE (C-75.2) with the bound",
    [big.ok, big.code, big.check, big.max], [false, "SET_TOO_LARGE", "C-75.2", 100]);
  t("READ BACK: the document in the refused set was not resolved",
    (await get("resolutions", `sha256=${dE}`))?.count, 0);
  t("and neither refusal armed the connection sweep", await obj.schedAlarmAt(), null);

  /* ================================================================ 1
   * The row's own case: a selection of three, the refused one in the MIDDLE. */
  console.log("\n--- 1 · a set of three, one refused in the middle, in ONE call ---");
  const set = await post("resolve", { items: [
    { captureSha: dA, resolvedBy: "forged-by-item" },
    { captureSha: dB, ref: "ordinance:not-in-this-document" },
    { captureSha: dC, resolvedBy: "forged-by-item" },
  ] });
  t("one outcome per document, at its own index: applied, RETAINED, applied",
    (set.items || []).map((o) => [o.index, o.outcome]), [[0, "applied"], [1, "retained"], [2, "applied"]]);
  t("the answer counts the set: count 3, applied 2, retained 1, weight per-item",
    [set.op, set.weight, set.count, set.applied, set.retained], ["resolve", "per-item", 3, 2, 1]);
  t("a mixed set is NOT ok: C-75.5's summary, with items[] beside it",
    [set.ok, set.code, set.check], [false, "SET_ITEMS_RETAINED", "C-75.5"]);
  t("the retained document carries op=resolve's OWN refusal for it, verbatim",
    [set.items?.[1]?.reason, set.items?.[1]?.capture_sha, set.items?.[1]?.ref],
    ["NO_SUCH_REFERENCE", dB, "ordinance:not-in-this-document"]);
  t("an applied item answers what the single act answers (references read, resolved at A)",
    [set.items?.[0]?.ok, set.items?.[0]?.references, set.items?.[0]?.resolved?.[0]?.grade], [true, 1, "A"]);
  const rA = await get("resolutions", `sha256=${dA}`), rB = await get("resolutions", `sha256=${dB}`),
        rC = await get("resolutions", `sha256=${dC}`);
  t("READ BACK: the two applied documents are resolved to the subject, the retained one is not",
    [rA?.resolutions?.[0]?.entity_id, rB?.count, rC?.resolutions?.[0]?.entity_id], [ent, 0, ent]);
  t("READ BACK: an item cannot name its own resolver — the plane's stamp is on the record",
    [rA?.resolutions?.[0]?.resolved_by !== "forged-by-item", rC?.resolutions?.[0]?.resolved_by !== "forged-by-item",
     typeof rA?.resolutions?.[0]?.resolved_by], [true, true, "string"]);

  /* ================================================================ 5
   * ONE motion arms the sweep ONCE; a set that resolved nothing arms nothing. */
  console.log("\n--- 5 · the connection sweep is armed by the set that resolved something ---");
  t("after block 1's set, the connection sweep is armed", (await obj.schedAlarmAt()) !== null, true);
  t("and the subject is on the dirty-set exactly once", (await get("stats", "", "adm-rs"))?.connectionDirty, 1);

  /* ================================================================ 2 */
  console.log("\n--- 2 · a clean set answers ok ---");
  const clean = await post("resolve", { items: [{ captureSha: dD }, { captureSha: dE }] });
  t("every document applied: ok, applied 2, retained 0", [clean.ok, clean.applied, clean.retained, clean.weight],
    [true, 2, 0, "per-item"]);
  t("READ BACK: both resolved", [(await get("resolutions", `sha256=${dD}`))?.count,
    (await get("resolutions", `sha256=${dE}`))?.count], [1, 1]);
  const again = await post("resolve", { items: [{ captureSha: dD }] });
  t("a re-run is idempotent: the resolution is KEPT, not duplicated",
    [again.ok, again.items?.[0]?.resolved?.[0]?.kept, (await get("resolutions", `sha256=${dD}`))?.count], [true, true, 1]);

  /* ================================================================ 3 */
  console.log("\n--- 3 · without `items`, the single act is unchanged ---");
  const single = await post("resolve", { captureSha: dF });
  t("single resolve answers as it always did, with no weight key",
    [single.ok, single.capture_sha, single.references, single.weight, single.items], [true, dF, 1, undefined, undefined]);

  /* ================================================================ 7 */
  console.log("\n--- 7 · a set resolves EXACTLY what the single act resolves ---");
  const inSet = await post("resolve", { items: [{ captureSha: dG }] });
  const one = decided(await get("resolutions", `sha256=${dF}`)), many = decided(await get("resolutions", `sha256=${dG}`));
  t("two documents with identical references: the single act's resolutions and the set's are the same decision",
    [inSet.ok, many, many.length > 0], [true, one, true]);
  t("…and that decision is the recogniser's, a name correspondence at C",
    one.map((r) => r[2]), ["C"]);

  /* ================================================================ 6 */
  console.log("\n--- 6 · op=affordances publishes resolve's set form ---");
  const aff = await get("affordances", "");
  const res = (aff?.set_acts || []).find((a) => a.id === "resolve");
  t("set_acts carries resolve under per-item, keyed by items, with the store's bound",
    res && [res.weight, res.set_key, res.max_items, res.item_keys], ["per-item", "items", 100, [["captureSha"], ["captureSha", "ref"]]]);
} finally {
  await mf.dispose();
}

console.log(`\nresolveset: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
