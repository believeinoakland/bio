/* screens-intake R43 (C17; DEC-375), the inbox half: the other material from the same knocker (`knocksof`), and the door to the source. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, text, main, btn, press, ok, word, says, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const open = (path, o = {}) => openPage(path, { ...o, screens: [...SCREENS, DOCUMENT_STUB] });
const SHA = "3".repeat(64);
const K1 = { knock_id: "KNOCK-2026-10-03-9c1f0a2b", sha256: "1".repeat(64), bytes: 3 * 1048576, note: "Sheets.", received: "2026-10-03T10:00:00Z", status: "new", pseudonym: "P-1", knocker_digest: "dd" };
const K2 = { knock_id: "KNOCK-2026-09-12-11aa22bb", sha256: "2".repeat(64), bytes: 500, note: null, received: "2026-09-12T10:00:00Z", status: "pulled", pseudonym: "P-1", knocker_digest: "dd", capture_sha: "2".repeat(64) };
const K3 = { knock_id: "KNOCK-2026-09-01-33cc44dd", sha256: SHA, bytes: 2048, note: "", received: "2026-09-01T10:00:00Z", status: "pulled", pseudonym: "P-9", knocker_digest: "ee", capture_sha: SHA };
const knock = (k, list, plane = {}) => open(`/app/inbox/${k.knock_id}`, { plane: { inbox: ok({ inbox: list }), inboxget: ok({ ok: true, item: k }),
  sourceof: ok({ ok: true, sourceId: "SRC-1" }), sourcerung: ok({ ok: true, rung: "same_knocker" }), ...plane } });

test("R43 the knocker's other material is listed by knocksof, this knock left out; each listed knock opens the inbox at it", async () => {
  const p = await knock(K1, [K1, K2], { knocksof: ok({ ok: true, pseudonym: "P-1", knocks: [K2, K1], count: 2, truncated: false }) });
  assert.ok(btn(p, "knocksof"), "offered where the inbox holds another knock of the same secret");
  assert.ok(!text(p).includes(word("screen.inbox.knocker.same1")), "nothing is listed before it is asked");
  await press(p, "knocksof");
  assert.deepEqual(p.byOp("knocksof").map((r) => r.body), [{ pseudonym: "P-1" }]);
  assert.ok(says(p, "screen.inbox.knocker.same1") && says(p, "screen.inbox.knocker.same2"));
  const sec = main(p).querySelectorAll("section.cs-section").find((s) => s.querySelector("h2") && s.querySelector("h2").textContent.includes(word("screen.inbox.knocker.heading")) && s.querySelector("a"));
  assert.ok(sec.querySelector(`a[href*="${K2.knock_id}"]`), "the other knock");
  assert.equal(sec.querySelectorAll(`a[href*="${K1.knock_id}"]`).length, 0, "this knock is not listed as another");
});

test("R43 control: a knocker with only one knock draws no such section, and no act", async () => {
  const p = await knock(K3, [K1, K2, K3]);
  assert.equal(btn(p, "knocksof"), null);
  assert.ok(!says(p, "screen.inbox.knocker.heading"));
  const q = await knock(K1, [K1], {});
  assert.equal(btn(q, "knocksof"), null);
  assert.ok(!says(q, "screen.inbox.knocker.heading"));
});

test("R43 a knock in the record offers the source: a link to about-knocker by its capture; a knock not in the record offers none", async () => {
  const p = await knock(K3, [K3]);
  const a = main(p).querySelector(`a[href*="/app/about-knocker/${SHA}"]`);
  assert.ok(a, "the source's door");
  assert.ok(a.textContent.includes(word("screen.about-knocker.name")));
  assert.ok(says(p, "screen.inbox.source.line"));
  const q = await knock(K1, [K1]);
  assert.equal(main(q).querySelector('a[href*="/app/about-knocker/"]'), null);
});
