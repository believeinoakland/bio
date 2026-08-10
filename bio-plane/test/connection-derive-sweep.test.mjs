/* REC-5 / D-122: CONNECTIONS AUTO-DERIVE on the SCHEDULED sweep.
 *
 * FW-8 made op=connect DERIVE and persist a graded connection from the shared-entity
 * collapse, but op=connect was a manual `contribute` mutation nothing called, so the
 * entity axis stayed empty (UI-4's subject view usually blank). REC-5 closes that gap:
 * a CONSUMER on REC-1's reconciling DO alarm (#schedConsumers, due/wake/tick,
 * self-terminating) that on each tick runs deriveConnections for the entities whose
 * resolutions CHANGED since the last sweep. The change-set is a WATERMARK: the
 * `connection_dirty` table, stamped at op=resolve / op=resolvetestify ONLY when a
 * resolution is INSERTED or grade-RAISED (a kept idempotent re-resolve dirties nothing),
 * keyed by entity_id so it is bounded by the count of DISTINCT changed entities, not by
 * resolve volume.
 *
 * This suite is the ACCEPTS-WHEN. It drives resolve/connections/connect THROUGH the
 * control plane (a real caller's only route, the D-43 class) and drives the alarm the
 * way scheduler.test.mjs does — pin CONNECTION_DERIVE_DELAY_MS far out of the test window
 * so the real alarm never races, then call onAlarm() by hand. It proves:
 *
 *   1. ACCEPTS-WHEN: after a document RESOLVES to an entity, the connections among that
 *      entity's documents appear WITHOUT a manual op=connect — via the alarm tick — and
 *      are visible through op=connections, asserted_by 'system' (a scheduled derivation
 *      is a MACHINE act, never a member's).
 *   2. a resolve ARMS the alarm, and once the dirty-set drains the alarm SELF-TERMINATES
 *      (schedAlarmAt -> null), so an idle instance carries no timer.
 *   3. BOUNDED per tick and self-terminating overall: with the batch pinned to 1, a
 *      three-entity dirty-set drains one entity per tick, RE-ARMING while more remain and
 *      stopping when caught up — not a full-store re-derive every tick.
 *   4. IDEMPOTENT: re-deriving after a grade RAISE upserts the connection IN PLACE (still
 *      the same keyed rows, no duplicates), and a tick on an empty dirty-set is a no-op.
 *
 * NEGATIVE CONTROL: in src/store.mjs #deriveConnectionsSweep, neuter the sweep by forcing an empty batch (`const batch = [];` above the real query) -> onAlarm derives nothing, so after the tick the connections for an entity known to have resolved documents stay EMPTY and the dirty-set never drains. RUN 2026-07-31 record-agent-5: 15 of 26 fail (connderive.entities 2->0, op=connections id=ORD 3->0, the raise/idempotence + batch=1 bounded-drain + self-terminate assertions) while the two MANUAL op=connect assertions in Part 3 still PASS (op=connect derives the pair by hand, unaffected); restored -> 26 pass, 0 fail. Confirms the connections seen in (1)-(4) came from the SCHEDULED sweep and nothing else, and that op=connect itself was not what filled them.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const script = readFileSync(IDX, "utf8");
const makeMf = (extra = {}) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r5", MEMBER_TOKEN: "mem-r5", PROBE_TOKEN: "prb-r5", VERSION: "test", ...extra },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const mkApi = (mf) => ({
  post: async (op, body, tok = "mem-r5") => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json()),
  get: async (op, qs, tok = "mem-r5") => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}&token=${tok}${qs ? "&" + qs : ""}`)).json()),
});
const getObj = async (mf) => { const ns = await mf.getDurableObjectNamespace("STORE"); return ns.get(ns.idFromName("bio")); };

const NOW = "2026-07-24T00:00:00Z";
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Resolution ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "Resolution bundle.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
let bseq = 0;
const promoteReading = async (post, captureSha, entities) => {
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-r5`;
  const md = bundleMd(id);
  const doc = { capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
                reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
                           at: NOW, entities } };
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("promote", {
    bundleId: id, base: null, snapKey: "20260724T010000Z_aaaa1111", author: "r5",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Resolution ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [],
  });
  return { id, ok: r.ok !== false };
};

/* ===================================================================== *
 * PART 1 — accepts-when + arm/self-terminate + idempotence.             *
 * Delay pinned far out so the real alarm never fires inside the test;   *
 * onAlarm is driven by hand.                                            *
 * ===================================================================== */
{
  const mf = makeMf({ CONNECTION_DERIVE_DELAY_MS: "600000" });
  try {
    const { post, get } = mkApi(mf);
    const obj = await getObj(mf);

    const shaA = sha("r5-doc-A");   // concerns the ordinance (A) AND the contract (B)
    const shaB = sha("r5-doc-B");   // concerns the ordinance (A)
    const shaC = sha("r5-doc-C");   // concerns the ordinance by NAME only (C), later raised to A

    console.log("\n--- seed the registry (FW-6) and resolutions (FW-7) the sweep will derive from ---");
    const eOrd = await post("entitycreate",
      { kind: "ordinance", label: "Rent Adjustment Ordinance", aliases: ["ordinance:13579", "Rent Adjustment Ordinance"] });
    const ordId = eOrd.entity_id;
    const eCon = await post("entitycreate", { kind: "contract", label: "Recology Waste Contract", aliases: ["C-2024-88"] });
    const conId = eCon.entity_id;
    t("two entities registered", [eOrd.ok, eCon.ok], [true, true]);

    await promoteReading(post, shaA, [
      { ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance No. 13579" },
      { ref: "contract:C-2024-88", kind: "contract", key: "C-2024-88", label: "Recology Contract" },
    ]);
    await promoteReading(post, shaB, [{ ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance 13579" }]);
    await promoteReading(post, shaC, [{ ref: "ordinance:99999", kind: "ordinance", key: "99999", label: "Rent Adjustment Ordinance" }]);

    console.log("\n--- op=resolve dirties the entity and ARMS the sweep, but does NOT derive synchronously ---");
    const before = await get("stats", "", "adm-r5");
    t("nothing pending before any resolve (dirty-set empty)", before.connectionDirty, 0);
    t("and no alarm is armed on a store with nothing to do", await obj.schedAlarmAt(), null);

    await post("resolve", { captureSha: shaA });
    await post("resolve", { captureSha: shaB });
    await post("resolve", { captureSha: shaC });

    /* The heart of the SCHEDULED choice (vs derive-on-resolve): connections do NOT
       appear the instant a document resolves — the resolve only stamps + arms. */
    t("op=connections is EMPTY immediately after the resolves (the sweep has not fired)",
      (await get("connections", "id=" + ordId)).count, 0);
    const dirtied = await get("stats", "", "adm-r5");
    t("the resolves dirtied exactly the two DISTINCT entities they touched (bounded by entities, not resolves)",
      dirtied.connectionDirty, 2);
    t("and a resolve ARMED the alarm for the sweep", typeof (await obj.schedAlarmAt()) === "number", true);

    console.log("\n--- the alarm TICK auto-derives the connections — no manual op=connect ---");
    const a = await obj.onAlarm();
    t("the connection-derive consumer ran on the tick and swept both dirtied entities",
      [a.connderive.entities, a.connderive.remaining], [2, 0]);
    const byEnt = await get("connections", "id=" + ordId);
    t("ACCEPTS-WHEN: the three pairwise connections among the ordinance's documents now exist, WITHOUT any op=connect",
      byEnt.count, 3);
    t("a single-document subject (the contract) yields no connection, honestly",
      (await get("connections", "id=" + conId)).count, 0);
    t("every auto-derived connection is asserted_by the SYSTEM (a scheduled derivation is a machine act, not a member's)",
      [...new Set(byEnt.connections.map((c) => c.asserted_by))], ["system"]);
    const key = (c) => [c.a_capture_sha, c.b_capture_sha].sort().join("|");
    const byPair = Object.fromEntries(byEnt.connections.map((c) => [key(c), c]));
    const pAC = byPair[[shaA, shaC].sort().join("|")];
    t("the A—C connection carries the WEAKER end's grade C and is NOT established (§8.1 weakest link), auto-derived intact",
      [pAC?.grade ?? null, pAC?.established ?? null], ["C", false]);

    console.log("\n--- once the dirty-set drains, the alarm SELF-TERMINATES ---");
    t("the dirty-set is empty after the sweep", (await get("stats", "", "adm-r5")).connectionDirty, 0);
    t("and the alarm is cleared (no idle timer left running)", await obj.schedAlarmAt(), null);
    const a2 = await obj.onAlarm();
    t("a tick on an empty dirty-set derives nothing and re-arms nothing (idempotent no-op)",
      [a2.connderive.entities, a2.rearmed], [0, false]);
    t("op=connections is UNCHANGED after the empty tick (no duplicates on re-run)",
      (await get("connections", "id=" + ordId)).count, 3);

    console.log("\n--- IDEMPOTENT re-derivation: a grade RAISE re-dirties, the sweep upserts IN PLACE ---");
    await post("entityalias", { entityId: ordId, alias: "ordinance:99999" });   // now shaC's ref resolves at A
    const rC2 = await post("resolve", { captureSha: shaC });
    t("shaC now resolves the ordinance at A (identifier registered), so its resolution is RAISED",
      rC2.resolved[0].grade, "A");
    t("the raise re-dirtied the ordinance (a changed grade needs re-derivation)",
      (await get("stats", "", "adm-r5")).connectionDirty, 1);
    await obj.onAlarm();
    const byEnt2 = await get("connections", "id=" + ordId);
    const pAC2 = Object.fromEntries(byEnt2.connections.map((c) => [key(c), c]))[[shaA, shaC].sort().join("|")];
    t("the A—C connection is RAISED to A and established, IN PLACE — still exactly 3 connections, no duplicate row",
      [byEnt2.count, pAC2?.grade ?? null, pAC2?.established ?? null], [3, "A", true]);
  } finally {
    await mf.dispose();
  }
}

/* ===================================================================== *
 * PART 2 — the sweep is BOUNDED per tick and self-terminates over ticks. *
 * Batch pinned to 1 so a three-entity dirty-set drains one per tick.     *
 * ===================================================================== */
{
  const mf = makeMf({ CONNECTION_DERIVE_DELAY_MS: "600000", CONNECTION_DERIVE_BATCH: "1" });
  try {
    const { post, get } = mkApi(mf);
    const obj = await getObj(mf);

    console.log("\n--- BOUNDED: with batch=1, three dirtied entities drain one per self-re-arming tick ---");
    const ids = [];
    for (let i = 1; i <= 3; i++) {
      const e = await post("entitycreate", { kind: "ordinance", label: `Ordinance ${i}`, aliases: [`ordinance:${i}00`] });
      ids.push(e.entity_id);
    }
    /* Two documents, each concerning all three entities, so every entity has a
       derivable pair — the sweep does real work for each, not just a dequeue. */
    const refs = ids.map((_, i) => ({ ref: `ordinance:${i + 1}00`, kind: "ordinance", key: `${i + 1}00`, label: `Ordinance ${i + 1}` }));
    const shaP = sha("r5-bounded-P"), shaQ = sha("r5-bounded-Q");
    await promoteReading(post, shaP, refs);
    await promoteReading(post, shaQ, refs);
    await post("resolve", { captureSha: shaP });
    await post("resolve", { captureSha: shaQ });
    t("all three entities are dirty and pending one sweep", (await get("stats", "", "adm-r5")).connectionDirty, 3);

    const tick1 = await obj.onAlarm();
    t("tick 1 derives ONE entity only (bounded per tick, not a full-store pass) and RE-ARMS for the rest",
      [tick1.connderive.entities, tick1.connderive.remaining, tick1.rearmed], [1, 2, true]);
    const tick2 = await obj.onAlarm();
    t("tick 2 derives one more, one still remaining, still re-armed",
      [tick2.connderive.entities, tick2.connderive.remaining, tick2.rearmed], [1, 1, true]);
    const tick3 = await obj.onAlarm();
    t("tick 3 derives the last and, caught up, SELF-TERMINATES (nothing left to wake for)",
      [tick3.connderive.entities, tick3.connderive.remaining, tick3.rearmed], [1, 0, false]);
    t("the alarm is actually cleared once the sweep caught up", await obj.schedAlarmAt(), null);
    t("every entity's connection was derived across the ticks (each pair among P,Q present)",
      await Promise.all(ids.map(async (id) => (await get("connections", "id=" + id)).count)), [1, 1, 1]);
  } finally {
    await mf.dispose();
  }
}

/* ===================================================================== *
 * PART 3 — the manual op=connect path still works (the sweep did not     *
 * replace it), the counterpart the NEGATIVE CONTROL leans on.           *
 * ===================================================================== */
{
  const mf = makeMf({ CONNECTION_DERIVE_DELAY_MS: "600000" });
  try {
    const { post, get } = mkApi(mf);

    console.log("\n--- the manual op=connect still derives by hand, alongside the automatic sweep ---");
    const e = await post("entitycreate", { kind: "ordinance", label: "Manual Ordinance", aliases: ["ordinance:777"] });
    const eid = e.entity_id;
    const shaX = sha("r5-manual-X"), shaY = sha("r5-manual-Y");
    const refM = [{ ref: "ordinance:777", kind: "ordinance", key: "777", label: "Ordinance 777" }];
    await promoteReading(post, shaX, refM);
    await promoteReading(post, shaY, refM);
    await post("resolve", { captureSha: shaX });
    await post("resolve", { captureSha: shaY });
    /* No onAlarm here: derive by HAND, proving op=connect is untouched by REC-5. */
    const c = await post("connect", { entityId: eid });
    t("op=connect still derives the pair by hand", [c.documents, c.count], [2, 1]);
    t("and op=connections reads the manually-derived connection", (await get("connections", "id=" + eid)).count, 1);
  } finally {
    await mf.dispose();
  }
}

console.log(`\nconnection-derive-sweep: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
