/* affordances: R19's backing for every op op-grades' `t47.mjs` grades `reasoned` (its R36, R37; K3147), each driven at its
   owning module's own interface, as t46-backing.test.mjs drives T46's: called well-formed but without its authored reason
   (absent, empty, blank), it is refused with its owner's code, which is in JUSTIFICATION_REFUSALS, and writes nothing;
   called with it, it is accepted. The last test holds the list driven here to the ops `t47.mjs` grades `reasoned`.
   `projectbarset` is strength's (its R40), over the real record-core, membership and promotion on a real SQLite database,
   `inquiry` a stand-in in its Provides' shape (the act reads no basis), as strength's own projectbar test builds it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JUSTIFICATION_REFUSALS, RUNGS } from "../../../src/op-grades/index.mjs";
import { T47_RUNGS } from "../../../src/op-grades/t47.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { strengthOf } from "../../../src/strength/index.mjs";
import { storage } from "../strength/fixture.mjs";

const DRIVEN = ["projectbarset"];
const WHYLESS = [undefined, "", "   "];
const GIVEN = "the member's own account of why";
const V = (m) => `member:${m}`;
const dump = (sql) => JSON.stringify([...sql.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")]
  .map(({ name }) => [name, [...sql.exec(`SELECT * FROM "${name}"`)]]));
const reasoned = (why) => (why === undefined ? {} : { reason: why });

function backed(op, code, scene) {
  assert.ok(DRIVEN.includes(op), op);
  assert.equal(T47_RUNGS[op], "reasoned", op);
  assert.equal(RUNGS[op], "reasoned", op);
  for (const why of WHYLESS) {
    const { w, act } = scene();
    const before = dump(w.st.sql);
    const r = act(why);
    assert.notEqual(r?.ok, true, `${op} ${JSON.stringify(why)}: accepted without its reason`);
    assert.equal(r?.reason, code, `${op} ${JSON.stringify(why)}: ${JSON.stringify(r).slice(0, 300)}`);
    assert.ok(JUSTIFICATION_REFUSALS.includes(r.reason), `${op}: ${r.reason} is not in JUSTIFICATION_REFUSALS`);
    assert.equal(dump(w.st.sql), before, `${op} ${JSON.stringify(why)}: refused, but wrote`);
  }
  const { act } = scene();
  const ok = act(GIVEN);
  assert.equal(ok?.ok, true, `${op}: refused with its reason: ${JSON.stringify(ok).slice(0, 300)}`);
}

/* One project P owned by alice, bob joined to it. */
function barScene() {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const now = () => "2026-10-13T12:00:00.000Z";
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now });
  promotion.registerFact("producingGroup", "instance-setup", () => "grp-one");
  const inquiry = { onGrounded: () => ({ ok: true }), restingOn: () => ({ ok: true, dependents: [] }),
                    basisFor: (id) => ({ ok: true, bundleId: id, legs: [] }), earned: () => ({ earned: {} }),
                    legCapped: () => null, subjectEntityOf: () => null };
  const s = strengthOf(host, { record, membership, promotion, inquiry, now });
  for (const m of ["alice", "bob"])
    st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                 VALUES (?, ?, ?, 'member', 'active', '["contribute"]', 't', 't')`, m, `Cover ${m}`, `h_${m}`);
  const md = ["---", "object_type: project", "schema: project@1", 'title: "Budget watch"', "current_state: forming",
    "prior_state: null", 'created: "2026-09-27T00:00:00Z"', 'last_updated: "2026-09-27T00:00:00Z"',
    'objective: "Find out what happened."', "references: []", "state_history: []", "---", "", "## Objective", "",
    "Find out.", ""].join("\n");
  const p = promotion.promote({ base: null, snapKey: "k1", author: V("alice"), ownerMemberId: "alice",
    files: [{ path: "bundle.md", text: md }], meta: { object_type: "project" } });
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  st.sql.exec(`INSERT OR REPLACE INTO project_participants (project_id, member_id, state, owner, created, updated)
               VALUES (?, 'bob', 'joined', 0, 't', 't')`, p.bundleId);
  return { st, act: (why) => s.projectBarSet({ project: p.bundleId, capture: "B", connection: "C", ...reasoned(why),
                                               author: "bob", viewer: V("bob"), identity: V("bob") }) };
}

test("R19: strength's projectbarset, graded `reasoned` (op-grades R36), is refused without the member's reason with "
   + "PROJECT_BAR_NO_REASON (strength R40), in JUSTIFICATION_REFUSALS, writing nothing, and accepted with it", () => {
  backed("projectbarset", "PROJECT_BAR_NO_REASON", () => { const w = barScene(); return { w, act: w.act }; });
});

test("R19: the ops driven here are exactly those op-grades' t47.mjs grades `reasoned`", () => {
  assert.deepEqual([...DRIVEN].sort(), Object.keys(T47_RUNGS).filter((op) => T47_RUNGS[op] === "reasoned").sort());
});
