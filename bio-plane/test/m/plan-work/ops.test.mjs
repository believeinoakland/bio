/* plan-work's ops (R1 `op=matteroutcomeset`, R11 `op=itemtakeup`, and the reads): the control plane's stamps govern,
   read from the query and set after the body, so a caller's own copy never wins. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { URL } from "node:url";
import { world, code, V } from "./fixture.mjs";
import { planWorkOps } from "../../../src/plan-work/index.mjs";

const op = (w, name, query, body = {}) => {
  const url = new URL(`https://x/?op=${name}&${new URLSearchParams(query)}`);
  return planWorkOps(w.pw, url, body)[name]();
};

test("R1 R11: op=matteroutcomeset and op=itemtakeup act as the stamped author; a body's author never wins", () => {
  const w = world();
  const s = w.started({ subjects: [w.S1] });
  const r = op(w, "matteroutcomeset", { plan: w.PL, author: V("bob"), viewer: V("bob") }, { subject: w.S1, text: "Fixed", author: V("alice") });
  assert.equal(r.ok, true, JSON.stringify(r)); assert.equal(r.author, V("bob"));
  assert.equal(code(op(w, "matteroutcomeset", { plan: w.PL }, { subject: w.S1, text: "Fixed", author: V("alice"), viewer: V("alice") })),
    "MACHINE_CANNOT_PLAN", "no stamp: an unstamped author");
  const t = op(w, "itemtakeup", { author: V("alice"), viewer: V("alice") }, { item: { kind: "clock", action: s.action, entry: 0 } });
  assert.equal(t.code ?? "ok", "NO_SUCH_ITEM", "the started option states no dates, so it has no clock entry");
  const u = w.started({ subjects: [w.S1], dates: [{ date: "2026-11-01", basis: "b" }], summary: "Dated" });
  assert.equal(op(w, "itemtakeup", { author: V("alice"), viewer: V("alice") }, { item: { kind: "clock", action: u.action, entry: 0 } }).ok, true);
});

test("R3 R7 R8: the read ops answer as the stamped viewer", () => {
  const w = world();
  for (const name of ["matters", "plantimeline", "planreviewopen", "planreviews", "prepitems", "plancomments", "whereitstands",
                      "statusreportdraft", "statusreports"]) {
    assert.equal(op(w, name, { plan: w.PL, viewer: V("bob") }).ok, true, name);
    assert.equal(code(op(w, name, { plan: w.PL, viewer: V("dave") })), "NO_SUCH_PLAN", name);
  }
});
