/* actions' T11 entries at its interface: R3's bounds (N237, N277), R8's viewer on `op=promote` (N271), R16's
   release through record-core (N261), R42 `kinds()` and its read op (N231), R43 `noSuchAction` (N217, K275). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, actionMd, CP } from "./fixture.mjs";
import * as actions from "../../../src/actions/index.mjs";

const A = "ACTN-2026-0001-a";
const M = V("alice");

test("R3 an action document holds at most 500 legs and 500 correspondence entries: more is refused ACTION_TOO_LARGE at the write; a replay over the limit is skipped whole", () => {
  const w = world();
  w.doc("INFO-2026-0001-d");
  const legs = (n) => ["action_basis:", ...Array.from({ length: n }, (_, i) =>
    ["  - target: INFO-2026-0001-d", "    kind: rests_on", `    note: "leg ${i}"`]).flat()];
  const ledger = (n) => ["correspondence:", ...Array.from({ length: n }, (_, i) =>
    ["  - direction: sent", "    at: 2026-09-02", `    account: "asked ${i}"`, "    author: member:alice"]).flat()];
  const md = (lines) => actionMd(A, [...CP, "action_kind: records_request", ...lines]);
  const big = w.promote(A, md(legs(501)));
  assert.deepEqual([big.ok, big.reason, big.code, big.check, big.part, big.count, big.limit],
    [false, "ACTION_TOO_LARGE", "ACTION_TOO_LARGE", "C-117.3", "action_basis", 501, 500]);
  assert.ok(big.translation.length > 40);
  const talk = w.promote(A, md(ledger(501)));
  assert.deepEqual([talk.reason, talk.part, talk.count, talk.limit], ["ACTION_TOO_LARGE", "correspondence", 501, 500]);
  assert.equal(w.record.head(A), null, "nothing was written");
  /* the limit itself lands, and every entry is projected. */
  const at = w.promote(A, md([...legs(500), ...ledger(500)]));
  assert.equal(at.ok, true, JSON.stringify(at).slice(0, 300));
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_basis WHERE bundle_id=?`, A)[0].n, 500);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM correspondence WHERE bundle_id=?`, A)[0].n, 500);
  /* a revision past the limit, as an act would make it: refused, the held rows untouched. */
  const more = w.promote(A, w.text(A).replace("correspondence:", `correspondence:\n  - direction: sent\n    at: 2026-09-03\n    account: "one more"\n    author: member:alice`));
  assert.equal(more.reason, "ACTION_TOO_LARGE");
  assert.equal(w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-04", account: "again", viewer: M, author: M }).reason,
    "ACTION_TOO_LARGE", "the act's promotion refusal, answered as it stands");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM correspondence WHERE bundle_id=?`, A)[0].n, 500);
  /* a replayed document over the limit lands (the record's history is holdable verbatim) and is projected not at all. */
  const B = "ACTN-2026-0002-b";
  w.action(B, ["action_basis:", "  - target: INFO-2026-0001-d", "    kind: rests_on"]);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_basis WHERE bundle_id=?`, B)[0].n, 1);
  const rep = w.promote(B, actionMd(B, [...CP, "action_kind: records_request", ...legs(501), ...ledger(3)]), { extra: { replay: true } });
  assert.equal(rep.ok, true, JSON.stringify(rep).slice(0, 300));
  for (const t of ["action_basis", "correspondence", "action_quotes"])
    assert.equal(w.rows(`SELECT COUNT(*) AS n FROM ${t} WHERE bundle_id=?`, B)[0].n, 0, `${t}: skipped whole, never half-projected`);
});

test("R16 actionCorrespond releases its lease through record-core's releaseLease, never a zero-length lease, on every path after taking it", () => {
  const calls = [];
  const spy = (record) => new Proxy(record, { get(t, k) {
    const v = t[k];
    return typeof v === "function" ? (...a) => { calls.push([k, ...a]); return v.apply(t, a); } : v;
  } });
  const w = world({ recordAs: spy });
  const s = w.doc("INFO-2026-0001-d");
  w.action(A);
  calls.length = 0;
  assert.equal(w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-02", account: "asked", viewer: M, author: M }).ok, true);
  const leases = () => calls.filter((c) => c[0] === "acquireLease" || c[0] === "releaseLease");
  assert.deepEqual(leases(), [["acquireLease", A, M, 30000], ["releaseLease", A, M]]);
  /* a refusal after the lease was taken (C-72.4) gives it back the same way; another member writes at once. */
  calls.length = 0;
  const r = w.a.actionCorrespond({ target: A, direction: "received", at: "2026-09-03", artifactSha: s, quoteAmount: "5",
                                   quoteCurrency: "USD", quoteAnswers: "9", viewer: M, author: M });
  assert.equal(r.reason, "QUOTE_ANSWERS_NO_SENT");
  assert.deepEqual(leases(), [["acquireLease", A, M, 30000], ["releaseLease", A, M]]);
  assert.ok(!calls.some((c) => c[0] === "acquireLease" && c[3] === 0), "never a zero-length lease");
  assert.equal(w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-04", account: "b", viewer: V("bob"), author: V("bob") }).ok, true);
  /* a lease another member holds is never released by this act. */
  w.record.acquireLease(A, V("carol"), 60000);
  calls.length = 0;
  assert.equal(w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-05", account: "c", viewer: M, author: M }).reason, "LEASE_HELD");
  assert.ok(!calls.some((c) => c[0] === "releaseLease"));
  assert.equal(w.record.acquireLease(A, V("dave"), 1000).ok, false, "carol's lease stands");
});

test("R8 a member's breach action written through op=promote reads the determination as the session's viewer (N271)", () => {
  const w = world();
  const p = w.promotion.promote({ base: null, snapKey: "p1", author: M, ownerMemberId: "alice",
    files: [{ path: "bundle.md", text: ["---", "object_type: project", "schema: project@1", 'title: "Breach"',
      "current_state: forming", "prior_state: null", 'created: "2026-09-27T00:00:00Z"', 'last_updated: "2026-09-27T00:00:00Z"',
      "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", ""].join("\n") }], meta: { object_type: "project" } });
  assert.equal(p.ok, true, JSON.stringify(p));
  const D = "CONF-2026-0001-determination";
  w.st.sql.exec(`INSERT INTO determinations (determination_id, project_id, act_id, act_minted, act_description, act_role,
    act_body, act_at, act_evidence, author, at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    D, p.bundleId, "ACT-2026-0001", 1, "the act", "Town Clerk", "Town of Port Ellery", "2026-09-01", "[]", M, "2026-09-02T00:00:00Z");
  assert.equal(w.promote(D, ["---", `id: ${D}`, "object_type: determination", `title: ${D}`, "current_state: recorded",
    'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"), { extra: { replay: true } }).ok, true);
  const text = (x) => actionMd(x, [...CP, "action_kind: other", "breach: true", "action_basis:", `  - target: ${D}`, "    kind: rests_on"]);
  /* op=promote as the control plane stamps it for a member's session: the bare member as author, the session's viewer. */
  const asSession = (x, extra) => w.promotion.promote({ bundleId: x, base: null, snapKey: `s-${x}`, author: "alice",
    actorMemberId: "alice", files: [{ path: "bundle.md", text: text(x) }], meta: { object_type: "action" }, ...extra });
  const ok = asSession(A, { actorViewer: M });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  /* the stamp is the session's own: a caller's `viewer` in the body never outranks it. */
  const other = asSession("ACTN-2026-0002-b", { actorViewer: V("bob"), viewer: M });
  assert.deepEqual([other.reason, other.check], ["ACTION_NO_DETERMINATION", "C-117.6"]);
  /* negative control: with no stamp, the bare member id is no viewer (the defect N271 names). */
  assert.equal(asSession("ACTN-2026-0003-c", {}).reason, "ACTION_NO_DETERMINATION");
  /* one site, both causes: a host where no determination can be read says why. */
  const x = world({ conformance: {} });
  x.promote(D, w.text(D), { extra: { replay: true } });
  const u = x.promote(A, text(A));
  assert.deepEqual([u.reason, u.check, u.cause], ["ACTION_NO_DETERMINATION", "C-117.6", "CONFORMANCE_UNAVAILABLE"]);
});

test("R42 kinds() answers the kinds the instance accepts now, over the active profiles' combined view; offered as the read op actionkinds; writes nothing and never throws", () => {
  const w = world();
  const k = w.a.kinds();
  assert.deepEqual(k.slice(0, 3), [...actions.PRODUCT_KINDS]);
  assert.ok(k.includes("bylaw_complaint"), "the test profile's kind");
  const before = w.rows(`SELECT COUNT(*) AS n FROM manifest`)[0].n;
  const op = actions.actionsOps(w.a, new URL("https://x/?viewer=member:alice"), null).actionkinds();
  assert.deepEqual(op, { ok: true, kinds: k });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM manifest`)[0].n, before, "writes nothing");
  assert.deepEqual(world({ profiles: null }).a.kinds(), [...actions.PRODUCT_KINDS], "no profile active: the product's kinds alone");
  const odd = world({ profiles: ["no-such-profile"] });
  assert.deepEqual(odd.a.kinds(), [...actions.PRODUCT_KINDS], "a view that does not combine");
  const broken = world({ recordAs: (r) => new Proxy(r, { get(t, key) {
    if (key === "getSetting") return () => { throw new Error("storage unavailable"); };
    const v = t[key]; return typeof v === "function" ? v.bind(t) : v;
  } }) });
  assert.deepEqual(broken.a.kinds(), [...actions.PRODUCT_KINDS], "never throws");
});

test("R43 noSuchAction answers the one refusal for an action the caller may not see: fixed fields, one sentence, its catalogue row; extra adds and never replaces; never throws", () => {
  const r = actions.noSuchAction("ACTN-2026-0001-a");
  const row = actions.ACTION_CATALOGUE_CHECKS.NO_SUCH_ACTION;
  assert.deepEqual(Object.keys(r).sort(), ["action", "check", "code", "detail", "ok", "reason", "translation"]);
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.action], [false, "NO_SUCH_ACTION", "NO_SUCH_ACTION", "C-117.2", row.translation, "ACTN-2026-0001-a"]);
  assert.equal(row.where, "src/actions/index.mjs noSuchAction > is-no-such-action");
  assert.equal(actions.noSuchAction("ACTN-2026-9999-q").detail, r.detail, "one sentence for every id and every caller");
  assert.equal(actions.noSuchAction().action, null);
  assert.equal(actions.noSuchAction(null).action, null);
  const x = actions.noSuchAction("A1", { note: "no module answers an action's read here", reason: "OTHER", detail: "mine", check: "C-0", action: "B" });
  assert.deepEqual([x.note, x.reason, x.detail, x.check, x.action], ["no module answers an action's read here", "NO_SUCH_ACTION", r.detail, "C-117.2", "A1"]);
  const hostile = new Proxy({}, { ownKeys() { throw new Error("no"); } });
  assert.doesNotThrow(() => actions.noSuchAction({ toString() { throw new Error("no"); } }, hostile));
  assert.equal(actions.noSuchAction({ toString() { throw new Error("no"); } }).action, null);
  assert.deepEqual(actions.noSuchAction("A1", ["x"]), actions.noSuchAction("A1"), "an extra that is not an object adds nothing");
});
