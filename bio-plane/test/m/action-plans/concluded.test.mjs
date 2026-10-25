/* action-plans Terms and Purpose (K5131): a question concluded in the plan's project is a suspected matter whose `why` says it
   is concluded in this project and not yet a determination, never that it is still open. The stance is made by
   basis-versions' real `conclude` act in the project (its R18) and read back through its `conclusionOf` (R22). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, NOW } from "./fixture.mjs";
import { world as bvWorld, block, version, merge } from "../basis-versions/fixture.mjs";

const DOCS = ["INFO-2026-0001-a", "INFO-2026-0002-b"];
const ACC = { state: "accepted", state_by: V("alice"), state_at: "2026-09-27T00:00:00Z", state_reason: "" };
const QC = "INQ-2026-0001-concluded", QO = "INQ-2026-0002-open";

/* alice owns P and Q; both draw on both questions; bob has joined P. P concludes QC on a reading with a claim; Q concludes nothing. */
function setup() {
  const on = bvWorld({ now: NOW });
  for (const d of DOCS) on.doc(d);
  on.member("alice"); on.member("bob");
  const lines = (name) => block(merge(version(name, DOCS, { ...ACC, claim: "the council approved the transfer" }),
    { basis: DOCS.map((target) => ({ target, role: "supports" })), refs: DOCS }));
  for (const [q, name] of [[QC, "accepted-reading"], [QO, "other-reading"]]) {
    const made = on.inquiry(q, lines(name), { author: V("alice") });
    assert.equal(made.ok, true, JSON.stringify(made).slice(0, 300));
  }
  const P = on.project("Budget watch", "alice", [QC, QO], { extra: ["current_versions:", `  - inquiry: "${QC}"`, `    version: "accepted-reading"`,
    `    at: "2026-09-27T00:00:00Z"`, `    by: "${V("alice")}"`, `  - inquiry: "${QO}"`, `    version: "other-reading"`,
    `    at: "2026-09-27T00:00:00Z"`, `    by: "${V("alice")}"`] });
  const Q = on.project("Harbour watch", "alice", [QC, QO]);
  on.st.sql.exec(`INSERT OR REPLACE INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES (?, 'bob', 'joined', 0, 't', 't')`, P);
  const w = world({ on });
  return { on, w, P, Q };
}
const concludeIn = (on, project, target = QC) => on.bv.conclude({ target, project, author: V("alice"), viewer: V("alice"), identity: V("alice"),
  falsifier: "the minutes say otherwise" });
const open = (w, project, inquiry) => w.ap.planOpen({ project, subjects: [{ kind: "inquiry", inquiry }], title: "What to do", author: V("alice"), viewer: V("alice") });
const why = (w, id) => w.ap.planRead({ id, viewer: V("alice") }).subjects[0];

test("Purpose, Terms (K5131): a question concluded in the plan's project is a suspected matter, concluded here and not yet a determination, never still open", () => {
  const { on, w, P } = setup();
  const done = concludeIn(on, P);
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  assert.equal(on.bv.conclusionOf(P, QC, V("alice")).state, "concluded", "the stance is the real act's");
  const opened = open(w, P, QC);
  assert.equal(opened.ok, true, JSON.stringify(opened).slice(0, 300));
  assert.equal(opened.subjects[0].support, "hypothetical", "a conclusion is not a determination");
  const read = why(w, opened.id);
  assert.equal(read.support, "hypothetical");
  const stillOpen = stillOpenWhy(on, w, P);
  assert.notEqual(read.why, stillOpen, "it is not described as still open");
  assert.equal(typeof read.why, "string");
});

test("Purpose, Terms (K5131) control: an open question keeps the still-open sentence; so does a question another project concluded and this one did not", () => {
  const { on, w, P, Q } = setup();
  assert.equal(concludeIn(on, P).ok, true);
  const a = open(w, P, QO);
  assert.equal(why(w, a.id).why, stillOpenWhy(on, w, P), "an open question in the same project");
  const b = w.ap.planOpen({ project: Q, subjects: [{ kind: "inquiry", inquiry: QO }], title: "Other", author: V("alice"), viewer: V("alice") });
  assert.equal(why(w, b.id).why, stillOpenWhy(on, w, P), "a project that concluded nothing on it");
  const w2 = setup();
  assert.equal(concludeIn(w2.on, w2.P).ok, true);
  const mine = open(w2.w, w2.P, QC);
  const theirs = w2.w.ap.planOpen({ project: w2.Q, subjects: [{ kind: "inquiry", inquiry: QC }], title: "Theirs", author: V("alice"), viewer: V("alice") });
  assert.notEqual(why(w2.w, mine.id).why, why(w2.w, theirs.id).why, "the project that concluded it reads differently from the one that did not");
  assert.equal(why(w2.w, theirs.id).why, why(w, a.id).why, "the stance is the plan's project's, not another team's: the same sentence as any open question");
});


/* the still-open sentence, as the module answers it for a question nobody concluded: a plan in a project of its own over the open question */
let controls = 0;
function stillOpenWhy(on, w) {
  const q = on.project(`Control watch ${++controls}`, "alice", [QO]);
  const r = w.ap.planOpen({ project: q, subjects: [{ kind: "inquiry", inquiry: QO }], title: "Control", author: V("alice"), viewer: V("alice") });
  return why(w, r.id).why;
}
