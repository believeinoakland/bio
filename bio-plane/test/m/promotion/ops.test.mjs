/* promotion's ops map (R54, K757, K760): the route arms the composition root spreads, each answering what its service
 * answers, with the control plane's stamps read from the query and never from the body. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { promotionOps } from "../../../src/promotion/index.mjs";
import { makePromotion, doc, infoDoc, create, T0 } from "./fixtures.mjs";

const url = (q) => new URL("http://x/?" + new URLSearchParams(q).toString());

/* A promotion that records what each service is asked, and answers it as the real one does. */
function spied() {
  const env = makePromotion();
  const asked = [];
  for (const name of ["promote", "reopen", "forkProject"]) {
    const real = env.p[name].bind(env.p);
    env.p[name] = (args) => { asked.push([name, args]); return real(args); };
  }
  return { ...env, asked };
}

test("R54: promotionOps holds exactly promote, reopen and projectfork, each a function of no arguments", () => {
  const { p } = spied();
  const ops = promotionOps(p, url({}), null);
  assert.deepEqual(Object.keys(ops).sort(), ["projectfork", "promote", "reopen"]);
  for (const f of Object.values(ops)) { assert.equal(typeof f, "function"); assert.equal(f.length, 0); }
});

test("R54: promote is promote(body), the request's body the package whole, answering what promote answers", () => {
  const { p, asked, record } = spied();
  const pkg = create("INFO-2026-0001", infoDoc("INFO-2026-0001"));
  const r = promotionOps(p, url({ viewer: "member:zed", author: "member:zed" }), pkg).promote();
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual(asked, [["promote", pkg]], "the body, as sent: the query's stamps are not added to it");
  assert.equal(record.head("INFO-2026-0001").bundleSha, r.bundleSha);
  /* A refusal is promote's own answer, unchanged. */
  assert.deepEqual(promotionOps(p, url({}), undefined).promote(), p.promote(undefined));
});

test("R54: reopen is reopen({target, reason, viewer, author}) from the query; the body's stamps are never read", () => {
  const { p, asked } = spied();
  const inq = "INQ-2026-0001";
  p.promote({ ...create(inq, doc({ id: inq, object_type: "inquiry", title: "Q", current_state: "deferred", created: T0,
    last_updated: T0, group: "test-group", state_history: "[]" })), replay: true });
  asked.length = 0;
  const body = { target: "INQ-2026-9999", reason: "body's", viewer: "member:body", author: "member:body" };
  const r = promotionOps(p, url({ target: inq, reason: "new evidence", viewer: "member:ann", author: "member:ann" }), body).reopen();
  assert.deepEqual([r.ok, r.target, r.from, r.to, r.why, r.author], [true, inq, "deferred", "open", "new evidence", "member:ann"]);
  assert.deepEqual(asked.filter(([n]) => n === "reopen"),
                   [["reopen", { target: inq, reason: "new evidence", viewer: "member:ann", author: "member:ann" }]]);
  /* Absent parameters are null, as the store's arm passed them: a missing author is the machine fence's answer. */
  asked.length = 0;
  const none = promotionOps(p, url({ target: inq }), body).reopen();
  assert.deepEqual(asked, [["reopen", { target: inq, reason: null, viewer: null, author: null }]]);
  assert.equal(none.reason, "MACHINE_CANNOT_REOPEN");
});

test("R54: projectfork is forkProject({projectId, newId, title, visibility, by, viewer}) from the query; an absent visibility is null, so hidden", () => {
  const { p, asked, membership } = spied();
  const o = p.promote({ base: null, snapKey: "o", author: "member:ann", ownerMemberId: "ann", meta: {},
    files: [{ path: "bundle.md", text: doc({ object_type: "project", title: "Origin", current_state: "forming", created: T0, last_updated: T0 }) }] });
  assert.equal(o.ok, true, JSON.stringify(o));
  asked.length = 0;
  const body = { projectId: "PROJ-2026-0000-body", by: "mallory", viewer: "member:mallory", visibility: "discoverable" };
  const f = promotionOps(p, url({ projectId: o.bundleId, title: "The fork", by: "ann", viewer: "member:ann" }), body).projectfork();
  assert.equal(f.ok, true, JSON.stringify(f));
  assert.deepEqual(asked.find(([n]) => n === "forkProject"), ["forkProject", { projectId: o.bundleId, newId: null, title: "The fork", visibility: null, by: "ann",
                                               viewer: "member:ann" }]);
  assert.deepEqual([f.owner, f.visibility], ["ann", "hidden"]);
  assert.equal(membership.discoverable.has(f.newId), false);
  /* A visibility in the query is the forker's choice; a named newId is refused before anything is looked up. */
  const g = promotionOps(p, url({ projectId: o.bundleId, title: "Second", by: "ann", viewer: "member:ann", visibility: "discoverable" })).projectfork();
  assert.deepEqual([g.ok, g.visibility], [true, "discoverable"]);
  const n = promotionOps(p, url({ projectId: o.bundleId, newId: "PROJ-2026-0009-mine", title: "Third", by: "ann" })).projectfork();
  assert.equal(n.reason, "PROJECT_FORK_ID_SUPPLIED");
});
