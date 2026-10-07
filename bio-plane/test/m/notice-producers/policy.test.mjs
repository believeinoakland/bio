/* R13: a policy's silent change (N652; K1727, K1740; DEC-145 (5)), over the real `following` (its R20 watches and R21
   `policyChanges`) on following's own test world (the profile's zone America/Halifax, UTC-3 in October), and the real
   `membership` (alice, bob and outsider members, root an administrator). `standards`' declaration read (its R5: the
   declarer, `declared_by`) is a stand-in over the policies the test holds, with following's own sight rule. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, sha, MEMBER, BOB, MACHINE, DAY } from "../following/fixture.mjs";
import { fresh, reader, ofKind, sentences, snapshot, notHintFailures, JUDGMENT, HINT, SIGNAL } from "./fixture.mjs";
import { HINT_MARK, POLICY_CHANGES_MAX, POLICY_CHANGE_DAYS } from "../../../src/notice-producers/index.mjs";

const KIND = "policy-changed-noticed";
const ADDR = "https://ellery.example/policies/records-retention";
const SRC = "https://ellery.example/policies/sources";
const HELD = "2026-10-01T00:00:00Z";
const DUE = Date.parse("2026-10-08T00:00:00Z");
const V1 = "<h1>Records retention</h1><p>Keep for 2 years.</p>";
const V2 = "<h1>Records retention</h1><p>Keep for 1 year.</p>";
const V3 = "<p>third</p>";
const P1 = "STD-2026-0001-policy", P2 = "STD-2026-0002-policy";
const AFTER = Date.parse("2026-10-25T12:00:00Z");

/* A held policy whose text is a passage of a capture of `address`, filed in `bundle` (following's own test's form). */
function policy(w, { id = P1, address = ADDR, bundle = "INFO-2026-0300-policy", ...x } = {}) {
  w.bundle(bundle, { project: x.project || "" });
  const text = w.policyText(`cid-${id}`, sha(address === ADDR ? V1 : `held at ${address}`), bundle, address, HELD);
  const p = { id, text: [text], cite: `the policy ${id}`, declared_by: MEMBER, ...x };
  w.policies.push(p);
  return p;
}
/* standards R5 as read here: the declaration's fields and its declarer, to a viewer who may see the policy. */
const standardsOver = (w) => ({ standardRead: ({ id, viewer }) => {
  const p = w.policies.find((x) => x.id === id);
  const sees = p && (p.readers ? p.readers.includes(viewer) : /^member:/.test(String(viewer)));
  return sees ? { ok: true, id, cite: p.cite, declared_by: p.declared_by } : { ok: false, reason: "NO_SUCH_STANDARD" };
} });
async function setup({ second = false } = {}) {
  const w = world();
  const p = policy(w);
  if (second) {
    w.project("PRJ-2026-0001-a");
    policy(w, { id: P2, address: SRC, bundle: "INFO-2026-0310-src", project: "PRJ-2026-0001-a", sight: "bundle", readers: [BOB] });
  }
  w.f.follows({ viewer: MEMBER });
  const versions = [V2, V1, V3];
  for (let i = 0; i < versions.length; i++) {
    w.serve(ADDR, versions[i]);
    w.serve(SRC, `s${i}`);
    w.t = DUE + i * 7 * DAY;
    await w.f.followTick(w.t);
  }
  const n = fresh(w.host, { membership: w.membership, following: w.f, standards: standardsOver(w) });
  const { read } = reader(n);
  const items = (member, now = AFTER) => ofKind(read(member, { now }), KIND);
  return { w, p, n, read, items };
}

test("R13: one FINDING policy-changed-noticed per change with amendment_held false, keyed by watch and later capture, to the member who declared the policy and to nobody else", async () => {
  const { w, items } = await setup();
  const mine = items("alice");
  const watch = w.f.policyChanges({ viewer: MEMBER }).changes[0].watch;
  assert.deepEqual(mine.map((i) => i.id), [sha(V2), sha(V1), sha(V3)].map((s) => `FINDING::${KIND}::${watch}::${s}`));
  for (const it of mine) {
    assert.equal(it.class, "FINDING");
    assert.equal(it.label, "noticed");
    assert.deepEqual(it.recipients, ["alice"]);
    assert.equal(it.subject.kind, "standard");
    assert.equal(it.subject.id, P1);
    assert.equal(it.subject.address, ADDR);
  }
  assert.deepEqual(mine.map((i) => [i.subject.before.capture, i.subject.after.capture]), [[sha(V1), sha(V2)], [sha(V2), sha(V1)], [sha(V1), sha(V3)]]);
  for (const m of ["bob", "outsider", "root"]) assert.deepEqual(items(m), [], m);
});

test("R13: its detail is exactly DEC-145 (5)'s sentence, <date> the local day of the earlier capture in the profile's zone", async () => {
  const { items } = await setup();
  assert.deepEqual(items("alice").map((i) => i.detail), [
    "Changed without notice: the text differs from the copy captured on 2026-09-30, and no amendment was announced",
    "Changed without notice: the text differs from the copy captured on 2026-10-07, and no amendment was announced",
    "Changed without notice: the text differs from the copy captured on 2026-10-14, and no amendment was announced"],
    "midnight UTC is the evening before in Halifax");
});

test("R13: it never says what the change means, never states a violation, is never a finding of the record, and is no hint (no R11 mark)", async () => {
  const { items } = await setup();
  for (const it of items("alice")) {
    assert.deepEqual(notHintFailures(it, HINT_MARK), []);
    for (const s of sentences(it)) {
      assert.doesNotMatch(s, JUDGMENT, s);
      assert.doesNotMatch(s, /\b(?:means?|meaning|weaken\w*|strengthen\w*|illegal|significan\w*|finding)\b/i, s);
      assert.doesNotMatch(s, HINT, s);
      assert.doesNotMatch(s, SIGNAL, s);
    }
  }
});

test("R13: it leaves when a later read answers the change with amendment_held true (a superseding version effective between the captures)", async () => {
  const { w, p, items } = await setup();
  assert.equal(items("alice").length, 3);
  w.policies.push({ id: "STD-2026-0009-policy", text: [], period: { from: "2026-10-05", to: null } });
  p.superseded_by = "STD-2026-0009-policy";
  assert.deepEqual(items("alice").map((i) => i.subject.after.capture), [sha(V1), sha(V3)], "the first change is covered");
});

test("R13: a declarer no longer active, or a machine, sends it to the administrators instead", async () => {
  const { w, p, items } = await setup();
  w.st.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='alice'`);
  assert.deepEqual(items("alice"), []);
  const admin = items("root");
  assert.equal(admin.length, 3);
  assert.deepEqual(admin[0].recipients, ["root"]);
  assert.equal(admin[0].basis.recipients_rule, "administrators");
  for (const m of ["bob", "outsider"]) assert.deepEqual(items(m), [], m);
  w.st.sql.exec(`UPDATE members SET status='active' WHERE member_id='alice'`);
  p.declared_by = MACHINE;
  assert.equal(items("root").length, 3);
  assert.deepEqual(items("alice"), []);
});

test("R13: only while the recipient may see the policy: a change policyChanges leaves out for that viewer is no item", async () => {
  const { w, p, items } = await setup({ second: true });
  /* P2 is seen by bob alone, declared by alice: alice is its recipient and cannot see it; bob sees it, and is not */
  assert.deepEqual([...new Set(items("alice").map((i) => i.subject.id))], [P1]);
  assert.deepEqual(items("bob"), []);
  /* declared by bob: his */
  w.policies.find((x) => x.id === P2).declared_by = BOB;
  assert.deepEqual([...new Set(items("bob").map((i) => i.subject.id))], [P2]);
  /* the administrators' turn reaches an administrator only for what they see */
  p.readers = [MEMBER];
  w.st.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='alice'`);
  assert.deepEqual(items("root"), []);
});

test("R13: read for the changes whose later capture is no older than 90 days", async () => {
  const { items } = await setup();
  const edge = DUE + POLICY_CHANGE_DAYS * DAY;
  assert.equal(items("alice", edge).length, 3, "exactly 90 days old");
  assert.deepEqual(items("alice", edge + 1).map((i) => i.subject.after.capture), [sha(V1), sha(V3)]);
  assert.deepEqual(items("alice", edge + 14 * DAY + 1), []);
});

test("R13: following cursor to at most 1,000 changes, facts naming the bound and truncated", async () => {
  const { w } = await setup();
  const change = (i) => ({ watch: 1, standard: P1, address: ADDR, before: { capture: `b${i}`, at: "2026-10-20T00:00:00Z" },
    after: { capture: `a${i}`, at: "2026-10-21T00:00:00Z" }, amendment_held: false });
  const over = (total) => {
    const asked = [];
    const following = { policyChanges: ({ after, limit, viewer }) => {
      asked.push({ after, limit, viewer });
      const from = after === null ? 0 : Number(after);
      const page = Array.from({ length: Math.max(0, Math.min(limit, total - from)) }, (_, k) => change(from + k));
      return { ok: true, changes: page, cursor: from + page.length < total ? String(from + page.length) : null };
    } };
    const r = reader(fresh(w.host, { membership: w.membership, following, standards: standardsOver(w) })).read("alice", { now: AFTER });
    return { r, asked };
  };
  const at = over(POLICY_CHANGES_MAX);
  assert.equal(ofKind(at.r, KIND).length, POLICY_CHANGES_MAX);
  assert.deepEqual(at.r.facts.policy_change, { bound: POLICY_CHANGES_MAX, days: POLICY_CHANGE_DAYS, truncated: false });
  const past = over(POLICY_CHANGES_MAX + 1);
  assert.equal(ofKind(past.r, KIND).length, POLICY_CHANGES_MAX);
  assert.deepEqual(past.r.facts.policy_change, { bound: POLICY_CHANGES_MAX, days: POLICY_CHANGE_DAYS, truncated: true });
  assert.ok(past.asked.every((a) => a.limit <= 200 && a.viewer === MEMBER), "pages of at most 200, as the viewer");
  assert.equal(past.asked.reduce((n, a) => n + a.limit, 0), POLICY_CHANGES_MAX);
});

test("R13: a following or standards that throws contributes no item and is named in facts.failed; the read writes nothing", async () => {
  const { w } = await setup();
  const boom = () => { throw new Error("down"); };
  const run = (deps) => reader(fresh(w.host, { membership: w.membership, following: w.f, standards: standardsOver(w), ...deps })).read("alice", { now: AFTER });
  for (const [deps, name] of [[{ following: { policyChanges: boom } }, "following"], [{ following: { policyChanges: () => null } }, "following"],
                              [{ standards: { standardRead: boom } }, "standards"]]) {
    const r = run(deps);
    assert.deepEqual(ofKind(r, KIND), []);
    assert.ok(r.facts.failed.includes(name), name);
  }
  const before = snapshot((q) => w.st.sql.exec(q));
  assert.equal(ofKind(run({}), KIND).length, 3);
  assert.deepEqual(snapshot((q) => w.st.sql.exec(q)), before);
});
