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
 * NEGATIVE CONTROL (REC-205, 2026-09-24): THREE MORE ARMS, each declared before it ran, each armed ALONE
 * against `src/store.mjs` with every other defence held open, each restored by `cp` from a UNIQUELY-NAMED
 * per-arm pristine copy in the session scratchpad (never in the worktree, BOB #32) and verified by sha256,
 * by `cmp` and by a marker count of 0. BASELINE this suite 50/0; d266scope 38/0 and resolveset 22/0 (the
 * two other suites over the same two functions) taken on the same tree. Pristine copy 3,292,792 bytes,
 * sha256 cfb04fc8…76fc, restored identically after every arm.
 *   (1) THE ROW'S OWN — DROP THE PER-ITEM PROJECT (`#perItem` deletes `project` from each item before the
 *       spread, so an item cannot carry its own). DECLARED to fail: block 9's mixed-selection counts, its
 *       per-item outcomes, `recorded ... against the project IT named`, both op=queue read-backs and the
 *       two-different-projects arm. DECLARED not to fail: blocks 1-8, the shared-project arm, the
 *       over-strictness arm, the three single-act bridge arms, set_acts. **RED, exit 1, 43/7 — the seven
 *       declared, and no others.** The seventh is the STRUCTURAL pin, which reads the very line the arm
 *       edits and is declared with it. NOT A SURPRISE BUT WORTH THE LINE: the OVER-STRICTNESS arm (the
 *       project named in the shared body AND on the item) stayed GREEN, because the shared body hands back
 *       the same value the arm took away — an arm that names the project twice cannot see this defect, and
 *       that is why the arm that names it once per item is the one the row turns on.
 *   (2) REVERT THE NARROWING (`sharedFor(it)` back to `shared`, the state of the code at 1a7f0bcc0).
 *       DECLARED to fail: ONLY the shared-project arm and the structural pin — every other arm sends each
 *       item's identity on the item, where contamination cannot reach it. **RED, exit 1, 48/2, exactly
 *       those two**, and d266scope 38/0 and resolveset 22/0 UNMOVED, which is the measurement that the
 *       narrowing is a no-op for an act with one identity group.
 *   (3) OVER-STRICTNESS / THE CLASS BRIDGE — remove the CLASS_NOT_DISPOSED branch. DECLARED to fail: the
 *       per-item outcomes arm, the CONDITION arm and the OBLIGATION arm; DECLARED not to fail: the FINDING
 *       bridge arm and the real-typo arm, which the widening must not have swallowed. **RED, exit 1, 47/3,
 *       as declared; d266scope 38/0.** AND THE COUNTS ARM STAYED GREEN AND IS RIGHT TO: the condition is
 *       retained either way — 2 applied, 1 retained — so only the arm that reads the refusal BY NAME can
 *       tell a useful answer from a true and useless one. A suite counting outcomes would have carried
 *       this defect indefinitely.
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
import { createHash } from "node:crypto";   /* REC-205: the fixture bundles are content-addressed */
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
  /* CORRECTED 2026-09-24 (REC-211): `definitionVersion` is sent ONCE as a shared field of the set —
     every item here is a stage of `d126-flow`, standing at version 1. That it carries from the set to
     each item is the property `#perItem` is for, and the retained items below still fail on their own
     conditions (BAD_STAGE, NO_REASON), which are asked before this one. */
  const r5 = R(await POST(`op=proposedispose&${S_mona}`, { to: "dismissed", reason: "not this group's to chase",
    definitionVersion: 1,
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
  /* CORRECTED 2026-09-24 by D-291, not exempted: this read "the three ops" and listed exactly three. D-291 gave
     `op=resolve` a set form on the SAME weight (BIO_Interaction_Constructs §S; `resolveset.test.mjs` drives it),
     so a fourth row is correct and the old exact list would have failed a right landing. */
  t("set_acts publishes the four ops under per-item with the store's bound", sets, [
    ["proposedispose", "per-item", "items", 100], ["resolve", "per-item", "items", 100],
    ["taskforward", "per-item", "items", 100], ["taskresolve", "per-item", "items", 100]]);
  const store = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
  t("STRUCTURAL: a throwing item is caught and retained under C-75.4 (not driven — see header)",
    /catch \(e\) \{\s*\/\* DEC-49 REGION is-per-item-failed \*\/\s*r = refusal\("SET_ITEM_FAILED"/.test(store), true);

  /* ================================================================ 9
   * REC-205 · A PROJECT-SCOPED FINDING JOINS THE SELECTION, AND EACH ITEM IS RESOLVED AGAINST ITS
   * OWN PROJECT.
   *
   * THE ROW'S PREMISE WAS FALSE AND THE MEASUREMENT IS WHY THIS BLOCK EXISTS. REC-205 read *"its act
   * names a project per item, so D-126's set has no way to carry one"*; driven at `1a7f0bcc0` before
   * any change, a set mixing `{project, finding}` with `{key}` APPLIED BOTH — `#perItem` spreads each
   * item after the shared fields, so an item naming its own project always overrode. What was true is
   * that NOTHING ASSERTED IT: `PER_ITEM_ACTS` published `["project","finding"]` among proposedispose's
   * identity shapes from D-126's first commit and the word `project` did not occur in this suite. A
   * published claim no suite holds is the defect this project ranks worst, and it is what let the two
   * REAL defects below sit under it unseen.
   *
   *  (a) THE SHARED BODY CONTAMINATED THE OTHER SHAPE. A caller naming the project ONCE for a
   *      selection all in one team — the legitimate shape, the items then carrying only their
   *      `finding` — made every OTHER item in that set project-scoped too. The progression finding
   *      beside it, naming a perfectly good `key`, came back NO_FINDING: *"a project with no finding
   *      names a team and no decision"*, which is true of the body the helper built and false of the
   *      act the member asked for. `#perItem` now narrows the shared body by the act's own published
   *      `item_keys`.
   *  (b) A CONDITION IN THE SELECTION WAS TOLD TO DEFINE A PROGRESSION. The accepts-when's own
   *      selection mixes one with a finding. `op=queue` publishes, per item, that a CONDITION is not
   *      disposed and that `op=queuemute` is the act that reaches it; the disposition act answered
   *      NO_SUCH_PROGRESSION — the same true-and-useless refusal IC-60's bridge exists to have
   *      replaced, arriving by the other door. It now refuses CLASS_NOT_DISPOSED naming `instead`.
   *
   * WHAT THIS BLOCK CANNOT SEE: the SURFACE. `civicos-ui/app.html`'s `queueSetOpFor` returns null for
   * a finding whose `disposition.scope` is `project`, so no member can select one today whatever the
   * plane accepts — that half is UI's and is DELEGATED (CLAIMS.md, REC-205), not closed here. */
  console.log("\n--- 9 · REC-205: a project-scoped finding in the selection ---");
  /* The fixture is `d266scope.test.mjs`'s, carried here deliberately rather than shared: the two
     suites must be able to disagree about the SET's behaviour without disagreeing about what a
     project, a reading or a divergence looks like. Two teams stand on two readings of one question,
     which is what puts a JUDGMENT-LAYER finding — one carrying no progression stage — under both. */
  const NOW9 = "2026-07-01T00:00:00Z", LATER9 = "2026-07-02T00:00:00Z";
  const sha9 = (v) => createHash("sha256").update(v).digest("hex");
  const scalar9 = (k, v) => v === null ? [`    ${k}: null`]
    : v === undefined ? [] : typeof v === "boolean" ? [`    ${k}: ${v}`] : [`    ${k}: "${String(v)}"`];
  const versionLines9 = (versions) => {
    const rows = versions.map((v) => ['  - name: "' + v.name + '"',
      ...scalar9("description", v.description), ...scalar9("relationship", "and"),
      ...scalar9("state", "suggested"), ...scalar9("derived_from", null), ...scalar9("hidden", false),
      ...scalar9("run", v.run), ...scalar9("author", "iris"), ...scalar9("at", v.at ?? NOW9)].join("\n"));
    const grounds = versions.flatMap((v) => (v.grounds ?? []).map((g) =>
      ['  - version: "' + v.name + '"', ...scalar9("ground", g),
       ...scalar9("asserted_by", "iris"), ...scalar9("at", NOW9)].join("\n")));
    const legs = versions.flatMap((v) => (v.legs ?? []).map((l) =>
      ['  - version: "' + v.name + '"', ...scalar9("target", l.target), ...scalar9("role", "supports"),
       ...scalar9("ground", l.ground), ...scalar9("grade", "B"), ...scalar9("grade_axis", "capture"),
       ...scalar9("grade_source", "capture")].join("\n")));
    return ["basis_versions:", ...rows,
            ...(grounds.length ? ["basis_version_grounds:", ...grounds] : []),
            ...(legs.length ? ["basis_version_legs:", ...legs] : [])];
  };
  const infoMd9 = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
    `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
    `created: "${NOW9}"`, `last_updated: "${LATER9}"`, "produced_by:", "  mode: agent",
    "  capability_tier: high", "group: believe-in-oakland", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
    "visuals: []", "---", "", "## Summary", "", "A captured document.", "",
    "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const inquiryMd9 = (id, versions, basis) => ["---", `id: ${id}`, "object_type: inquiry",
    "schema: inquiry@1", `title: "Did the sewer fund transfer follow the adopted process?"`,
    "current_state: open", "prior_state: null", `created: "${NOW9}"`, `last_updated: "${LATER9}"`,
    "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland",
    "references:", ...basis.flatMap((b) => [`  - target: ${b}`, "    rel: cites", "    status: confirmed"]),
    "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
    "  source: null", "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
    "recheck_triggers:", "  - text: Revisit after the next budget cycle",
    "    description: The adopted budget may restate the transfer basis.",
    "basis:", ...basis.flatMap((b) => [`  - target: ${b}`, "    role: supports"]),
    ...versionLines9(versions), "---", "", "## Question", "", "Did it?", "", "## What It Rests On", "",
    "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
    `### Session ${LATER9} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
    "## Review Notes", ""].join("\n");
  const projectMd9 = (title, cites) => ["---", "object_type: project", `title: "${title}"`,
    "current_state: forming", `created: "${NOW9}"`, `last_updated: "${LATER9}"`,
    "references:", ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"]),
    "required_strength:", "  capture: B", "  connection: C", "---", "", "## Summary", "",
    "A project.", "", "## Session Log", ""].join("\n");
  let seq9 = 0;
  const put9 = async (id, text, type, title) => R(await POST(`op=promote&${S_iris}`, {
    ...(id ? { bundleId: id } : {}), base: null,
    snapKey: `rec205-${++seq9}-${sha9(String(seq9)).slice(0, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha9(text) }],
    register: type === "information"
      ? [{ path: "snapshots/doc.bin", sha256: sha9(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${title || id}`,
            current_state: type === "inquiry" ? "open" : type === "project" ? "forming" : "collected",
            created: NOW9, last_updated: LATER9 } }));
  const must9 = async (what, r) => {
    if (!r || r.ok === false) throw new Error(`${what}: ${JSON.stringify(r).slice(0, 600)}`);
    return r;
  };
  const LEDGER9 = "INFO-2026-9205-ledger", MINUTES9 = "INFO-2026-9205-minutes";
  const INQ9 = "INQ-2026-9205-sewer-transfers";
  const RUN_A9 = "AIRUN-2026-9205-oversight", RUN_B9 = "AIRUN-2026-9205-budget";
  for (const d of [LEDGER9, MINUTES9]) await must9(`promote ${d}`, await put9(d, infoMd9(d), "information"));
  const PA = (await must9("create project A", await put9(null, projectMd9("Oversight", [INQ9]), "project", "REC-205 Oversight"))).bundleId;
  const PB = (await must9("create project B", await put9(null, projectMd9("Budget", [INQ9]), "project", "REC-205 Budget"))).bundleId;
  const openRun9 = async (run, ctx) => {
    const r = R(await POST(`op=airunopen&${S_iris}`, {
      run, contextType: "project", contextId: ctx, label: `REC-205 fixture run under ${ctx}`,
      mode: "check", principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
      skillVersion: "investigative-session@1", biasManifest: null,
      bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000 }));
    if (r?.started !== true) throw new Error(`airunopen ${run}: ${JSON.stringify(r).slice(0, 600)}`);
  };
  await openRun9(RUN_A9, PA);
  await openRun9(RUN_B9, PB);
  const V1_9 = { name: "opening account", run: RUN_A9, at: "2026-07-03T00:00:00Z",
    description: "The first reading: the ledger and the minutes together show the transfer.",
    grounds: ["paper trail"],
    legs: [{ target: LEDGER9, ground: "paper trail" }, { target: MINUTES9, ground: "paper trail" }] };
  const V2_9 = { name: "the ledger alone", run: RUN_B9, at: "2026-07-04T00:00:00Z",
    description: "Second reading: the ledger carries the finding without the minutes.",
    grounds: ["the ledger"], legs: [{ target: LEDGER9, ground: "the ledger" }] };
  await must9(`promote ${INQ9}`,
    await put9(INQ9, inquiryMd9(INQ9, [V1_9, V2_9], [LEDGER9, MINUTES9]), "inquiry"));
  /* §6 RULE 5: a project stands only on a reading its members have ACCEPTED. */
  for (const v of [V1_9.name, V2_9.name])
    await must9(`versionaccept ${v}`, R(await POST(
      `op=versionaccept&${S_iris}&target=${encodeURIComponent(INQ9)}&version=${encodeURIComponent(v)}`,
      { affirmed: true })));
  for (const [p, v] of [[PA, V1_9.name], [PB, V2_9.name]])
    await must9(`versioncurrent ${p}`, R(await POST(
      `op=versioncurrent&${S_iris}&target=${encodeURIComponent(INQ9)}`
      + `&version=${encodeURIComponent(v)}&project=${encodeURIComponent(p)}`, {})));

  const queue9 = async () => R(await GET(`op=queue&${S_iris}&limit=500`));
  const ITEMS9 = (q) => (q && Array.isArray(q.items)) ? q.items : [];
  const item9 = (q, id) => ITEMS9(q).find((i) => i && i.id === id) || null;
  const homes9 = (it) => ((it && it.case && Array.isArray(it.case.ancestors)) ? it.case.ancestors : [])
    .map((a) => a.id).sort();
  const STANCE_A = `FINDING::stance-changed-here-not-elsewhere::${INQ9}::${PA}`;
  const STANCE_B = `FINDING::stance-changed-here-not-elsewhere::${INQ9}::${PB}`;
  const CONDITION_ITEM = "CONDITION::governor-holding-host::example.org";

  {
    const q = await queue9();
    const st = item9(q, STANCE_B);
    t("fixture: a JUDGMENT-LAYER finding is live and filed under BOTH teams — without which every "
    + "arm below would be asserted over an item with one home and would prove nothing about `its own`",
      [ITEMS9(q).length > 0, st !== null, homes9(st)], [true, true, [PA, PB].sort()]);
    t("and the plane publishes it as the (project, finding) shape with a NULL key and the candidate "
    + "projects — the block a surface composing a selection reads",
      [st?.disposition?.available, st?.disposition?.scope, st?.disposition?.keyed_on,
       st?.disposition?.key, st?.disposition?.finding, (st?.disposition?.projects || []).slice().sort()],
      [true, "project", ["project", "finding"], null, STANCE_B, [PA, PB].sort()]);
  }

  /* THE ROW'S ACCEPTS-WHEN, IN ONE ACT: a project-scoped finding resolved against ITS OWN project, a
     progression finding beside it, and a CONDITION. The condition is RETAINED — which is the per-item
     weight doing its job, not a failure of the set: it is kept with the act that DOES reach it. */
  const r9 = R(await POST(`op=proposedispose&${S_iris}`, {
    to: "dismissed", reason: "REC-205: a mixed selection, handled in one act", definitionVersion: 1,
    items: [{ project: PA, finding: STANCE_B },
            { key: "d126-flow::heard" },
            { key: CONDITION_ITEM }] }));
  t("the mixed selection is ONE act under the per-item weight, and its counts are the outcomes'",
    [r9.op, r9.weight, r9.count, r9.applied, r9.retained],
    ["proposedispose", "per-item", 3, 2, 1]);
  t("each item's own outcome: the project-scoped finding and the progression finding APPLIED, the "
  + "CONDITION retained", outcomes(r9),
    [[0, "applied", null], [1, "applied", null], [2, "retained", "CLASS_NOT_DISPOSED"]]);
  t("the project-scoped item was recorded at the JUDGMENT layer, against the project IT named",
    [r9.items?.[0]?.scope, r9.items?.[0]?.project, r9.items?.[0]?.finding, r9.items?.[0]?.decided_by],
    ["project", PA, STANCE_B, "iris"]);
  t("the progression item beside it was recorded INSTANCE-wide — the shared `definitionVersion` "
  + "reached it and the project did not",
    [r9.items?.[1]?.scope, r9.items?.[1]?.project, r9.items?.[1]?.progression_key,
     r9.items?.[1]?.definition_version],
    [undefined, undefined, "d126-flow", 1]);
  t("the CONDITION is told the act that DOES reach it, by name, and nothing about it was written",
    [r9.items?.[2]?.reason, r9.items?.[2]?.class, r9.items?.[2]?.kind, r9.items?.[2]?.instead],
    ["CLASS_NOT_DISPOSED", "CONDITION", "governor-holding-host", "queuemute"]);
  {
    const q = await queue9();
    const rows = ((q && q.disposed && Array.isArray(q.disposed.findings)) ? q.disposed.findings : [])
      .filter((d) => d.finding === STANCE_B);
    t("READ BACK through op=queue: the decision stands for the team it named, and for one team only",
      rows.map((d) => [d.scope, d.project, d.state]), [["project", PA, "dismissed"]]);
    t("READ BACK: the finding is STILL LIVE for the other team — one team's dismissal governs that "
    + "team's feed and nothing else, which a set act must not quietly widen",
      homes9(item9(q, STANCE_B)), [PB]);
    const disp = (R(await GET(`op=proposals&${S_iris}`))?.dispositions || [])
      .filter((d) => d.progression_key === "d126-flow" && d.stage_key === "heard")
      .map((d) => d.state);
    t("READ BACK through op=proposals: the progression item in the same set was dispositioned too",
      disp, ["dismissed"]);
  }

  /* TWO PROJECT-SCOPED ITEMS NAMING DIFFERENT TEAMS IN ONE SET — the `its OWN project` half, which a
     single shared project cannot express at all. */
  const r9b = R(await POST(`op=proposedispose&${S_iris}`, {
    to: "deferred", reason: "REC-205: each against its own team",
    items: [{ project: PB, finding: STANCE_B }, { project: PA, finding: STANCE_A }] }));
  t("two items naming DIFFERENT projects are each resolved against the one IT named",
    [r9b.ok, r9b.applied, r9b.items?.[0]?.project, r9b.items?.[1]?.project], [true, 2, PB, PA]);

  /* (a) THE CONTAMINATION ARM. The project named ONCE for the set, the items carrying only their own
     `finding` — and a progression finding in the same set, which must NOT become project-scoped. */
  const r9c = R(await POST(`op=proposedispose&${S_iris}`, {
    to: "dismissed", reason: "REC-205: the project named once", project: PA, definitionVersion: 1,
    items: [{ finding: STANCE_A }, { key: "d126-flow::voted" }] }));
  t("a SHARED project reaches the item that named only its finding, and does NOT reach the item that "
  + "named a progression key — measured NO_FINDING before this landing",
    [r9c.ok, r9c.applied, r9c.items?.[0]?.scope, r9c.items?.[0]?.project,
     r9c.items?.[1]?.scope, r9c.items?.[1]?.progression_key],
    [true, 2, "project", PA, undefined, "d126-flow"]);
  /* OVER-STRICTNESS: the same project named in BOTH places, a redundant spelling a caller may well
     send. The narrowing must not read that as two shapes and refuse it. */
  const r9d = R(await POST(`op=proposedispose&${S_iris}`, {
    to: "deferred", reason: "REC-205: over-strictness — shared and per-item agree", project: PA,
    items: [{ project: PA, finding: STANCE_A }] }));
  t("OVER-STRICTNESS: the project named in the shared body AND on the item is one act, not a refusal",
    [r9d.ok, r9d.items?.[0]?.project], [true, PA]);

  /* (b) THE CLASS BRIDGE, on the OTHER spelling: a surface composing `key` from the item's own
     PUBLISHED id, class segment and all. Before this landing both answered NO_SUCH_PROGRESSION. */
  const r9e = R(await POST(`op=proposedispose&${S_iris}`,
    { key: STANCE_A, to: "dismissed", reason: "REC-205: the published id as key" }));
  t("a FINDING's published id sent as `key` is told what is MISSING — the project — and what to send, "
  + "naming the finding id it already holds",
    [r9e.ok, r9e.reason, r9e.finding, r9e.kind, r9e.requires],
    [false, "NO_PROJECT_SCOPE", STANCE_A, "stance-changed-here-not-elsewhere", ["project", "finding"]]);
  const r9f = R(await POST(`op=proposedispose&${S_iris}`,
    { key: "authority-undetermined::whatever", to: "dismissed", reason: "REC-205: an obligation" }));
  t("an OBLIGATION key is refused by its CLASS and told op=taskresolve, not told to define a progression",
    [r9f.ok, r9f.reason, r9f.class, r9f.instead], [false, "CLASS_NOT_DISPOSED", "OBLIGATION", "taskresolve"]);
  const r9g = R(await POST(`op=proposedispose&${S_iris}`,
    { key: "no-such-flow::filed", to: "dismissed", reason: "REC-205: a real typo", definitionVersion: 1 }));
  t("and a key that is a REAL typo still reads NO_SUCH_PROGRESSION — the bridge widened, it did not "
  + "swallow the refusal it was built beside", [r9g.ok, r9g.reason], [false, "NO_SUCH_PROGRESSION"]);

  /* WHAT THE ACT ENFORCES IS WHAT op=affordances PUBLISHES, asserted out of one read: `#perItem`
     narrows by THIS array, so a shape published here and not honoured there is the drift the import
     closes. `definitionVersion` joins shared_keys (REC-211/IC-273) — the act has taken it as a shared
     field since REC-211 and it was published in neither list. */
  const aff9 = R(await GET(`op=affordances&token=t-member`));
  const pd9 = (aff9?.set_acts || []).find((a) => a.id === "proposedispose") || null;
  t("set_acts publishes proposedispose's THREE identity shapes and its shared fields",
    [pd9?.item_keys, pd9?.shared_keys],
    [[["key"], ["progressionKey", "stageKey"], ["project", "finding"]],
     ["to", "reason", "kind", "definitionVersion"]]);
  t("STRUCTURAL: `#perItem` narrows the shared body by that published array and by nothing else",
    [/const published = PER_ITEM_ACTS\.find\(\(a\) => a\.id === act\) \|\| null;/.test(store),
     /try \{ r = one\(\{ \.\.\.sharedFor\(it\), \.\.\.it, \.\.\.stamped, items: undefined \}\); \}/.test(store)],
    [true, true]);
} finally {
  await mf.dispose();
}

console.log(`\nperitem: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
