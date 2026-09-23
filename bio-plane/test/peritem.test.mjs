/* NEGATIVE CONTROL: one arm, declared before arming 2026-09-23 by the D-126 worker. (1) make `#perItem` ABORT AT THE FIRST REFUSAL — `break` out of its loop after pushing the first retained outcome, the all-or-nothing shape relabelled -> MUST FAIL, BY NAME: block 1's "item 2 (after the drifted one) was APPLIED" and its count/`applied` arms, block 2's third item, block 4's item after the malformed one, and block 5's third item. MUST NOT FAIL: block 3 (all applied — there is no refusal to stop at), block 6 (the set-shape refusals come before the loop) and block 7 (the single form never reaches the helper). The result is recorded on the CONTROL RESULT line below from the run, never from this declaration.
 * CONTROL RESULT 2026-09-23 (D-126 worker, run BEFORE the over-strictness item was added to block 5): armed by
 * `cp` of src/store.mjs aside (sha256 5ab12778…2aac) and a two-site patch — `break` after a retained outcome and
 * in place of the malformed item's `continue` (grep counted the arm present). RED, exit 1, 19 pass / 12 fail, every
 * failure in a MUST-FAIL block: block 1 (one outcome per item; item 2 APPLIED; the counts; READ BACK the two
 * applied; the acting member's queue cleared), block 2 (outcomes; shared `to`; the echo), block 4 (the item after
 * the malformed one), block 5 (outcomes; item 3's own disposition; READ BACK). Blocks 3, 6, 7 and 8 stayed GREEN
 * as declared. NOT AS DECLARED, and correctly: block 1's "the retained item is still listed in nate's queue" and
 * the C-75.5 summary arm stayed green — the item that stopped the set is untouched either way and a set with a
 * refusal is still not ok:true, so neither can see an abort. Restored by `cp`; sha256 and `cmp` equal to the
 * pristine copy (2,910,108 bytes, arm marker count 0); suite re-run green.
 * RE-RUN 2026-09-23 AFTER THE SUBJECT MOVED (the set branch moved from the dispatch map into each act's own method,
 * and `#perItem` gained `items: undefined` last): the same two-site arm, over the over-strictness-extended block 5.
 * RED, exit 1, 19 pass / 12 fail — the SAME twelve MUST-FAIL arms, blocks 3, 6, 7, 8 green. Restored by `cp`;
 * `cmp` equal and sha256 equal to the per-arm pristine copy (2,911,131 bytes, marker count 0).
 *
 * D-126 — THE PER-ITEM WEIGHT, DRIVEN THROUGH THE OPS (NOTIFICATIONS.md §Applying a handler to a selection).
 *
 * The rule: *"each item independently succeeds or is RETAINED WITH A REASON"*, the reason being the act's
 * own named refusal for that item. The row's accepts-when: *"a selection of three where one item drifted
 * leaves exactly that one listed with its reason and clears the other two, through the ops."*
 *
 * HOW A LIAR PASSES, and the arm aimed at each:
 *   - ALL-OR-NOTHING RELABELLED — every block below MIXES applied and retained items in ONE set and asserts
 *     EVERY item's own outcome, with an applied item AFTER the refused one (the control above).
 *   - SILENT SKIPPING — `items[]` must carry exactly one outcome per item sent, at its own index, and the
 *     record is READ BACK after the act (op=tasks, op=proposals) so a claimed outcome is a measured one.
 *   - `ok: true` OVER A MIXED SET — a mixed set answers `ok: false` with C-75.5's summary AND `items[]`.
 *   - A STAMP AN ITEM CAN OVERRIDE — an item naming its own actor/decider is overwritten.
 *
 * WHAT THIS CANNOT SEE: `SET_ITEM_FAILED` (C-75.4) is not driven — no act here throws on any input this
 * suite can send, which is the property that code guards against losing. It is pinned structurally in
 * block 8 (the catch exists and routes to the code) and said so rather than implied.
 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const AT = "2026-09-23T12:00:00Z";
const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { ADMIN_TOKEN: "t-admin", MEMBER_TOKEN: "t-member", PROBE_TOKEN: "t-probe", VERSION: "test",
              TASK_DRAIN_DELAY_MS: "600000" },
});
const POST = async (q, body) => (await mf.dispatchFetch("http://x/api/?" + q,
  { method: "POST", body: JSON.stringify(body) })).json();
const GET = async (q) => (await mf.dispatchFetch("http://x/api/?" + q)).json();
const R = (j) => (j && j.result !== undefined) ? j.result : j;

try {
  const stub = await mf.getDurableObjectNamespace("STORE");
  const obj = stub.get(stub.idFromName("bio"));
  const doPost = async (op, body) => (await obj.fetch(`http://x/${op}`,
    { method: "POST", body: JSON.stringify(body) })).json();
  const doGet = async (path) =>
    (await obj.fetch(`http://x/${path}${path.includes("?") ? "&" : "?"}viewer=class:member`)).json();
  const rowOf = async (id) => (await doGet("tasks")).result.tasks.find((x) => x.id === id);

  let n = 0;
  const makeTask = async () => {
    n++;
    const sha = (0xd126000 + n).toString(16).padStart(64, "0");
    const bundle = `INFO-2026-09${String(10 + n).padStart(2, "0")}-peritem-fixture-${n}`;
    await doPost("taskenqueue", { kind: "authority-undetermined", captureSha: sha,
      subject: "https://www.oaklandca.gov/documents/agenda.pdf", at: AT });
    await doPost("promote", {
      bundleId: bundle, base: null, snapKey: `20260923T120000Z_peritem_${n}`, author: "consumer",
      meta: { object_type: "information", group: "believe-in-oakland", title: "Per-item fixture",
              current_state: "collected", created: AT, last_updated: AT },
      files: [{ path: "bundle.md", text: "---\nid: " + bundle + "\n---\n", bytes: 10 }],
      register: [{ sha256: sha, path: "snapshots/agenda.pdf", encoding: "binary", bytes: 10 }],
    });
    const d = (await doPost("taskdrain", { actor: "consumer", now: AT })).result;
    const made = d.created.find((c) => c.refers_to === bundle);
    if (!made) throw new Error(`drain created no task for ${bundle}: ${JSON.stringify(d)}`);
    return made.id;
  };
  const addMember = async (memberId, role) => {
    const a = await POST(`op=memberadd&token=t-admin`, { memberId, cover: memberId, role });
    if (!a.result.ok) throw new Error(`memberadd ${memberId}: ${JSON.stringify(a.result)}`);
    const e = await POST("op=enroll", { invite: a.result.invite, handle: memberId, password: `${memberId}-passphrase-x` });
    if (!e.result.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(e.result)}`);
    const l = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-x` });
    if (!l.result.ok) throw new Error(`login ${memberId}: ${JSON.stringify(l.result)}`);
    return "token=" + l.result.token;
  };
  const S_iris = await addMember("iris", "admin");
  await addMember("adam", "admin");
  const S_mona = await addMember("mona", "member");
  const S_nate = await addMember("nate", "member");
  const assignTo = async (memberId) => {
    const id = await makeTask();
    const fwd = R(await POST(`op=taskforward&${S_iris}`, { id, to: memberId, now: AT }));
    if (!fwd.ok) throw new Error(`seed-forward to ${memberId}: ${JSON.stringify(fwd)}`);
    return id;
  };
  /* `reason` is read only on a RETAINED item: on an applied proposedispose item it is the MEMBER'S
     reason (the act's own success field), so `outcome` — never `reason` — is the discriminator. */
  const outcomes = (r) => (r && Array.isArray(r.items))
    ? r.items.map((i) => [i.index, i.outcome, i.outcome === "retained" ? (i.reason ?? null) : null]) : null;

  /* ================================================================ 1
   * THE ROW'S OWN ACCEPTS-WHEN: three of mona's obligations, one DRIFTS (an administrator forwards it to
   * nate after mona saw it), mona resolves all three as ONE set. Exactly the drifted one is retained,
   * with the plane's own reason, and the other two are cleared. */
  console.log("\n--- 1 · a selection of three where one drifted: taskresolve ---");
  const [a1, a2, a3] = [await assignTo("mona"), await assignTo("mona"), await assignTo("mona")];
  const drift = R(await POST(`op=taskforward&${S_iris}`, { id: a2, to: "nate", now: AT }));
  t("fixture: the middle item DRIFTED — an administrator moved it to nate", [drift.ok, drift.assignee], [true, "nate"]);
  const r1 = R(await POST(`op=taskresolve&${S_mona}`, { items: [{ id: a1 }, { id: a2 }, { id: a3 }], now: AT }));
  t("the set answers under the per-item weight, naming the op", [r1.weight, r1.op], ["per-item", "taskresolve"]);
  t("one outcome per item sent, in order", outcomes(r1),
    [[0, "applied", null], [1, "retained", "NOT_YOURS"], [2, "applied", null]]);
  t("item 2 (after the drifted one) was APPLIED — the set did not stop at the refusal",
    r1.items?.[2] && [r1.items[2].ok, r1.items[2].status, r1.items[2].id], [true, "resolved", a3]);
  t("the retained item carries the plane's own reason and who it is with now",
    r1.items?.[1] && [r1.items[1].ok, r1.items[1].assignee, /it is with nate/.test(r1.items[1].detail || "")], [false, "nate", true]);
  t("the counts are the outcomes', not the request's", [r1.count, r1.applied, r1.retained], [3, 2, 1]);
  t("the retained item's refusal is DEC-49-coded: C-76.1, with the canned translation a member reads",
    r1.items?.[1] && [r1.items[1].code, r1.items[1].check, typeof r1.items[1].translation === "string"],
    ["NOT_YOURS", "C-76.1", true]);
  t("a MIXED set is not ok:true — it is C-75.5's summary, with a canned translation",
    [r1.ok, r1.reason, r1.code, r1.check, typeof r1.translation === "string" && r1.translation.length > 20],
    [false, "SET_ITEMS_RETAINED", "SET_ITEMS_RETAINED", "C-75.5", true]);
  const [b1, b2, b3] = [await rowOf(a1), await rowOf(a2), await rowOf(a3)];
  t("READ BACK: the two applied items are resolved in the record",
    [b1.status, b3.status, b1.history.at(-1).actor, b3.history.at(-1).actor], ["resolved", "resolved", "mona", "mona"]);
  t("READ BACK: the drifted item is untouched — still open, still nate's",
    [b2.status, b2.assignee], ["forwarded", "nate"]);
  /* THE QUEUE, READ AS EACH MEMBER. op=queue lists a member's OWN and unassigned obligations, so the
     drifted item is not in MONA's feed after the act — it moved to nate, which is the drift. It is still
     LIVE in the record and listed in the queue of the member it is with; the two applied items are
     cleared from everyone's. Keeping it listed on MONA's screen, with its reason, is the SURFACE's half
     (civicos-ui/test/queue-peritem.test.mjs), because mona's feed is right not to carry it. */
  const qIds = async (S) => { const q = R(await GET(`op=queue&${S}&limit=500`));
    return (q && Array.isArray(q.items) ? q.items : []).map((i) => String(i.id)); };
  const [qMona, qNate] = [await qIds(S_mona), await qIds(S_nate)];
  t("THE QUEUE: the retained item is still listed — in the queue of the member it is with now",
    [qNate.includes(a2), qNate.includes(a1), qNate.includes(a3)], [true, false, false]);
  t("THE QUEUE: the two applied items are cleared from the acting member's list",
    [qMona.includes(a1), qMona.includes(a3)], [false, false]);

  /* ================================================================ 2
   * taskforward: a SHARED `to` with a per-item override, and three different refusals of the act's own,
   * interleaved with applied items. */
  console.log("\n--- 2 · taskforward: shared `to`, item overrides, mixed refusals ---");
  const [f1, f2, f3] = [await assignTo("mona"), await assignTo("mona"), await assignTo("mona")];
  const r2 = R(await POST(`op=taskforward&${S_mona}`, { to: "adam", now: AT, items: [
    { id: f1 }, { id: "TASK-NOPE-0000" }, { id: f2, to: "ghost" }, { id: f3, to: "nate" }] }));
  t("each item's outcome is its own act's", outcomes(r2),
    [[0, "applied", null], [1, "retained", "NO_SUCH_TASK"], [2, "retained", "NO_SUCH_MEMBER"], [3, "applied", null]]);
  t("the shared `to` reached item 0 and the item's own `to` won on item 3",
    [r2.items?.[0]?.assignee, r2.items?.[3]?.assignee], ["adam", "nate"]);
  t("READ BACK: f2 stayed mona's", (await rowOf(f2)).assignee, "mona");
  t("each retained item echoes what was asked of it", r2.items?.[2]?.asked, { id: f2, to: "ghost" });

  /* ================================================================ 3
   * An all-applied set answers ok:true. */
  console.log("\n--- 3 · every item applied ---");
  const [g1, g2] = [await assignTo("mona"), await assignTo("mona")];
  const r3 = R(await POST(`op=taskresolve&${S_mona}`, { items: [{ id: g1 }, { id: g2 }], now: AT }));
  t("all applied: ok:true, no retained", [r3.ok, r3.applied, r3.retained, r3.weight], [true, 2, 0, "per-item"]);

  /* ================================================================ 4
   * The server's stamp wins over an item's own actor, and a malformed item is retained by itself. */
  console.log("\n--- 4 · the stamp wins; a malformed item is retained alone ---");
  const [h1, h2] = [await assignTo("mona"), await assignTo("mona")];
  const r4 = R(await POST(`op=taskresolve&${S_nate}`, { items: [{ id: h1, actor: "mona" }], now: AT }));
  t("nate naming mona as the item's actor is still nate at the fence", outcomes(r4), [[0, "retained", "NOT_YOURS"]]);
  const r4b = R(await POST(`op=taskresolve&${S_mona}`, { items: ["not-an-item", { id: h2 }], now: AT }));
  t("the malformed item is retained by C-75.3 and the next item is still applied", outcomes(r4b),
    [[0, "retained", "SET_ITEM_MALFORMED"], [1, "applied", null]]);
  t("C-75.3 carries its check and translation", [r4b.items?.[0]?.check, typeof r4b.items?.[0]?.translation], ["C-75.3", "string"]);

  /* ================================================================ 5
   * op=proposedispose as a set: shared disposition and reason, one item with a bad stage, one with an
   * empty reason of its own — and the decider is the session's, whatever an item says. */
  console.log("\n--- 5 · proposedispose: a mixed set of findings ---");
  const def = R(await POST(`op=progressiondefine&${S_mona}`, {
    progressionKey: "d126-flow", label: "D-126 fixture flow",
    stages: [{ key: "filed", label: "Filed", cardinality: "1", required: "always" },
             { key: "heard", label: "Heard", after: "filed", cardinality: "1", required: "always" },
             { key: "voted", label: "Voted", after: "heard", cardinality: "1", required: "always" },
             { key: "closed", label: "Closed", after: "voted", cardinality: "1", required: "always" }] }));
  if (!def.ok) throw new Error(`progressiondefine: ${JSON.stringify(def).slice(0, 400)}`);
  const r5 = R(await POST(`op=proposedispose&${S_mona}`, { to: "dismissed", reason: "not this group's to chase",
    items: [{ key: "d126-flow::filed", decidedBy: "somebody-else" }, { key: "d126-flow::nope" },
            { key: "d126-flow::heard", reason: "" }, { key: "d126-flow::voted", to: "deferred" },
            /* OVER-STRICTNESS: the explicit pair, a spelling of the same identity the set form must not
               narrow away — the single act accepts it, so the set must. */
            { progressionKey: "d126-flow", stageKey: "closed" }] }));
  t("each finding's outcome is its own", outcomes(r5),
    [[0, "applied", null], [1, "retained", "BAD_STAGE"], [2, "retained", "NO_REASON"], [3, "applied", null],
     [4, "applied", null]]);
  t("the decider is the session's stamp, not the item's", r5.items?.[0]?.decided_by, "mona");
  t("item 3's own disposition won over the shared one", r5.items?.[3]?.state, "deferred");
  t("an APPLIED item's `reason` is the member's words — `outcome`, not `reason`, says what happened",
    [r5.items?.[0]?.outcome, r5.items?.[0]?.reason], ["applied", "not this group's to chase"]);
  const disp = (R(await GET(`op=proposals&${S_mona}`))?.dispositions || [])
    .filter((d) => d.progression_key === "d126-flow").map((d) => `${d.stage_key}:${d.state}`).sort();
  t("READ BACK: exactly the three applied findings are dispositioned", disp, ["closed:dismissed", "filed:dismissed", "voted:deferred"]);

  /* ================================================================ 6
   * The SET's own refusals, before any item is tried. */
  console.log("\n--- 6 · the set's own shape ---");
  const r6a = R(await POST(`op=taskresolve&${S_mona}`, { items: [] }));
  t("an empty set is C-75.1 and carries no items", [r6a.ok, r6a.code, r6a.check, r6a.items], [false, "SET_NO_ITEMS", "C-75.1", undefined]);
  const r6b = R(await POST(`op=taskresolve&${S_mona}`, { items: "T-1" }));
  t("a set that is not an array is C-75.1", r6b.code, "SET_NO_ITEMS");
  const big = await assignTo("mona");
  const r6c = R(await POST(`op=taskresolve&${S_mona}`, { items: Array.from({ length: 101 }, () => ({ id: big })) }));
  t("101 items is C-75.2, refused WHOLE", [r6c.ok, r6c.code, r6c.check, r6c.max, r6c.count], [false, "SET_TOO_LARGE", "C-75.2", 100, 101]);
  t("READ BACK: no item moved", (await rowOf(big)).status, "forwarded");

  /* ================================================================ 7
   * Without `items`, the single act is unchanged. */
  console.log("\n--- 7 · the single form is unchanged ---");
  const one = R(await POST(`op=taskresolve&${S_mona}`, { id: big, now: AT }));
  t("single taskresolve answers as it always did, with no weight key", [one.ok, one.status, one.weight], [true, "resolved", undefined]);

  /* ================================================================ 8
   * The published weight and the structural pin for what no arm can drive. */
  console.log("\n--- 8 · op=affordances publishes the weight ---");
  const aff = R(await GET(`op=affordances&token=t-member`));
  const sets = (aff?.set_acts || []).map((a) => [a.id, a.weight, a.set_key, a.max_items]).sort();
  t("set_acts publishes the three ops under per-item with the store's bound", sets, [
    ["proposedispose", "per-item", "items", 100], ["taskforward", "per-item", "items", 100], ["taskresolve", "per-item", "items", 100]]);
  const store = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
  t("STRUCTURAL: a throwing item is caught and retained under C-75.4 (not driven — see header)",
    /catch \(e\) \{\s*\/\* DEC-49 REGION is-per-item-failed \*\/\s*r = refusal\("SET_ITEM_FAILED"/.test(store), true);
} finally {
  await mf.dispose();
}

console.log(`\nperitem: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
