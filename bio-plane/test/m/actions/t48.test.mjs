/* actions' T48 entry at its interface (T48-48; N1035, N1040; K231, K3145, K3147, K3207): R102 the read's `project` and
   `title`, R103 the ops map without `action-records`' arms, R104 R65's refusal through `entities.notAProceeding`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, actionMd, CP } from "./fixture.mjs";
import * as actions from "../../../src/actions/index.mjs";
import { actionRecordsOps } from "../../../src/action-records/index.mjs";
import { notAProceeding } from "../../../src/entities/index.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c";
const M = V("alice");
const P = "PRJ-2026-0001";

test("R102 actionRead answers the action's project (record-core R34's, through bundleInfo) and title (the document's, as held); an action with no project and no title answers both null", () => {
  const w = world();
  w.action(A);
  w.action(B);
  /* a document with no `title` key at all */
  const bare = actionMd(C, ["action_kind: other"]).split("\n").filter((l) => !l.startsWith("title:")).join("\n");
  const held = w.promote(C, bare);
  assert.equal(held.ok, true, `control: an action with no title is held ${JSON.stringify(held).slice(0, 300)}`);
  w.record.bundleInfo = ((orig) => (id) => (id === A ? { ...orig(id), project: P } : orig(id)))(w.record.bundleInfo.bind(w.record));
  const a = w.a.actionRead({ id: A, viewer: M });
  assert.deepEqual([a.ok, a.id, a.project, a.title], [true, A, P, A], "an action in a project answers its id, project and title");
  const b = w.a.actionRead({ id: B, viewer: M });
  assert.deepEqual([b.project, b.title], [null, B], "a project-less action answers null for its project");
  const c = w.a.actionRead({ id: C, viewer: M });
  assert.deepEqual([c.ok, c.project, c.title], [true, null, null], "no project and no title: both null");
  assert.equal(a.current_state, "planned", "nothing else in the block changes");
  const op = actions.actionsOps(w.a, new URL(`https://x/?id=${A}&viewer=${M}`), null).action();
  assert.deepEqual([op.project, op.title], [P, A], "op=action answers them too");
});

test("R103 actionsOps publishes this module's own arms only: none for action-records' six ops, which its own map still serves", () => {
  const w = world();
  const url = new URL(`https://x/?viewer=${M}&author=${M}`);
  const own = actions.actionsOps(w.a, url, null);
  for (const op of ["actionreceipt", "actionscope", "actionpromise", "actionlawspropose", "actionriskpropose", "actionseekspropose"])
    assert.equal(own[op], undefined, `${op} is not this module's arm`);
  const theirs = actionRecordsOps(w.a.records, url, null);
  for (const op of Object.keys(theirs)) assert.equal(typeof theirs[op], "function", `control: action-records serves ${op}`);
  for (const op of ["actionmove", "actionlaws", "actionrisktier", "actioncorrespond", "actioncreate", "action", "actions"])
    assert.equal(typeof own[op], "function", `control: ${op} is still this module's arm`);
  assert.equal(Object.keys(own).some((k) => k in theirs), false, "no op is routed twice");
});

/* A registered entity (entities R1); a proceeding with its facet (entities R45). */
function ent(w, kind, label) {
  const proceeding = kind === "proceeding"
    ? { forum: ent(w, "institution", `${label}, its forum`), kind: "commitment_suit", number: "MC-26-1001" } : undefined;
  const r = w.a.entities.createEntity({ kind, label, note: `${label}, registered by the test`, declaredBy: M, proceeding });
  assert.equal(r.ok, true, JSON.stringify(r));
  return r.entity_id;
}

test("R104 R65's refusal of an entity not of kind proceeding is entities.notAProceeding's answer: its code, row and fixed fields, the caller's own entity_id and kind beside them; a proceeding lands", () => {
  const w = world();
  const office = ent(w, "office", "Clerk of the Court"), P2 = ent(w, "proceeding", "Harbour suit");
  const md = (extra) => actionMd(A, [...CP, "action_kind: other", ...extra]);
  const r = w.promote(A, md([`proceeding: ${office}`]));
  const site = notAProceeding("x", { entity_id: office, kind: "office" });
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "NOT_A_PROCEEDING", "NOT_A_PROCEEDING", site.check, site.translation]);
  assert.deepEqual([r.entity_id, r.kind], [office, "office"]);
  assert.equal(typeof r.detail, "string");
  assert.equal(w.record.head(A), null, "nothing was written");
  assert.equal(w.promote(A, md([`proceeding: ${P2}`])).ok, true, "control: an entity of kind proceeding lands");
});
