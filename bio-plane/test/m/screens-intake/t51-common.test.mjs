/* screens-intake R43, R44, R46 (T51 fix round): the writing help the registry lists on the three new screens is drawn only while the
 * assistant is reachable (interface-shell R20), under the own-words field it helps. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, btn, ok } from "./page.mjs";

const SHA = "3".repeat(64);
const plane = { sourceof: ok({ ok: true, sourceId: "SRC-1", history: [] }), sourcerung: ok({ ok: true, rung: "unknown" }), sourcepublishable: ok({ ok: true, entries: [] }),
  memberlist: ok({ members: [] }), peopledirectory: ok({ rows: [] }), projectlist: ok({ projects: [] }), monitoring: ok({ ok: true, items: [], counts: {}, paused: { paused: false } }),
  sweeps: ok({ ok: true, sweeps: [] }), namedrequests: ok({ ok: true, items: [] }) };

test("R43 R44 R46 writing help is drawn on about-knocker, leads and watching only while the assistant is reachable", async () => {
  for (const path of [`/app/about-knocker/${SHA}`, "/app/leads", "/app/watching"]) {
    assert.ok(btn(await openPage(path, { plane, reachable: true }), "writinghelp"), `${path}: reachable`);
    assert.equal(btn(await openPage(path, { plane, reachable: false }), "writinghelp"), null, `${path}: not reachable`);
  }
});
