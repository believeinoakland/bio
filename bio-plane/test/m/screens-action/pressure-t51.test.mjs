/* screens-action, fix round 10 (diagnosis 11 §17; K5148; R5, R12): a reply marked as pressure through `actionpressure` is drawn marked on the
   action page and not offered again. The action and its marks are action-holds' and actions' own, from action-holds' published world. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ok, W, D, DATA_PLANE, ROUTES } from "./page.mjs";
import { world, V } from "../action-holds/fixture.mjs";

const M = V("alice");
const B = "ACTN-2026-0002-b";

test("R5 (diagnosis 11 §17): over the real actions and action-holds, a reply marked by `actionpressure` shows its mark and is not offered the choice again; an unmarked one is", async () => {
  const w = world();
  const s = w.doc("INFO-2026-0001-d");
  w.action(B);
  for (const at of ["2026-09-03", "2026-09-04"]) assert.equal(w.a.actionCorrespond({ target: B, direction: "received", at, artifactSha: s, viewer: M, author: M }).ok, true);
  assert.equal(w.h.actionPressure({ target: B, ord: 0, pressure: { kind: "retaliation", note: "funding cut" }, viewer: M, author: M }).ok, true);
  const read = w.a.actionRead({ id: B, viewer: M });
  assert.equal(read.entries.some((e) => e.pressure), false, "the owner's action read holds no mark of its own for it (the mark is action-holds')");
  const p = await open(`/app/action/${B}`, { ...DATA_PLANE, action: ok(read), pressurefor: ok(w.h.pressureFor({ action: B, viewer: M })) });
  assert.equal(p.doc.getElementById("pressure-kind-0"), null, "ord 0 is marked: no choice to mark it again");
  assert.ok(p.doc.getElementById("pressure-kind-1"), "ord 1 is not: it is still offered");
  const t = text(p);
  assert.ok(t.includes(W("screen.action.pressure.retaliation")), "the mark is drawn");
});
