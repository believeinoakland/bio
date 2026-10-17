/* basis-versions R53 (T50; N1106; DEC-248 (4)): accepting a reading of several parts names the part left out.
   `VERSION_AFFIRMATION_INCOMPLETE` also carries `part`, the first part in the reading's own order that `affirmed` does not
   name, which `refusal.VERSION_AFFIRMATION_INCOMPLETE` fills; `basisVersions` answers each version's `parts`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, V } from "./fixture.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const D1 = "INFO-2026-0001-a", D2 = "INFO-2026-0002-b", D3 = "INFO-2026-0003-c", Q = "INQ-2026-0001-q";
const T = "2026-09-27T00:00:00Z", ALICE = "member:alice";
const PARTS = ["the minutes", "the ledger", "the audit"];

function setup() {
  const w = world();
  for (const d of [D1, D2, D3]) w.doc(d);
  w.member("alice");
  const three = {
    versions: [{ name: "three routes", description: "three separate routes to the same answer", relationship: "or", state: "suggested",
                 hidden: false, derived_from: null, author: ALICE, at: T }],
    grounds: PARTS.map((g) => ({ version: "three routes", ground: g, asserted_by: ALICE, at: T })),
    legs: [D3, D1, D2].map((t, i) => ({ version: "three routes", target: t, role: "supports", ground: PARTS[i] })),
  };
  const r = w.inquiry(Q, block(merge(three, version("one route", [D1]), { refs: [D1] })));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  return w;
}
const accept = (w, o) => w.bv.versionAccept({ target: Q, version: "three routes", author: ALICE, viewer: V("alice"), ...o });

test("R53: a reading of three parts accepted with two ticked answers part equal to the third, in the reading's own order, with the list's words filled; parts lists all three", () => {
  const w = setup();
  const sha = w.sha(Q);
  const r = accept(w, { affirmed: [PARTS[0], PARTS[1]] });
  assert.deepEqual([r.ok, r.reason, r.check, r.part, r.missing, r.unknown, r.declared],
    [false, "VERSION_AFFIRMATION_INCOMPLETE", "C-25.33", PARTS[2], [PARTS[2]], [], PARTS]);
  assert.equal(r.translation, word("refusal.VERSION_AFFIRMATION_INCOMPLETE", { part: PARTS[2] }));
  assert.match(r.translation, /the audit is not ticked/);
  assert.equal(w.sha(Q), sha, "nothing written");
  /* the first of several missing, in the reading's order, not the order they were sent */
  const none = accept(w, {});
  assert.deepEqual([none.part, none.missing], [PARTS[0], PARTS]);
  assert.equal(accept(w, { affirmed: PARTS[2] }).part, PARTS[0]);
  const pv = accept(w, { affirmed: PARTS[0], preview: "1" });
  assert.deepEqual([pv.reason, pv.part], ["VERSION_AFFIRMATION_INCOMPLETE", PARTS[1]], "a preview answers it too");
  const [three] = w.bv.basisVersions({ id: Q, viewer: V("alice") }).versions.filter((v) => v.name === "three routes");
  assert.deepEqual(three.parts, PARTS, "the distinct ground labels of its legs, in the legs' order — the list affirmed must equal");
  assert.deepEqual(three.grounds, [...PARTS].sort(), "grounds keeps its sorted form");
  const ok = accept(w, { affirmed: PARTS.join(",") });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  assert.deepEqual(ok.affirmed, PARTS);
});

test("R53: only unknown parts named — no part is missing to name, so part is null and the row's own words stand", () => {
  const w = setup();
  const r = accept(w, { affirmed: [...PARTS, "the rumour"] });
  assert.deepEqual([r.reason, r.part, r.missing, r.unknown], ["VERSION_AFFIRMATION_INCOMPLETE", null, [], ["the rumour"]]);
  assert.match(r.translation, /Accepting this reading claims/);
});

test("R53 control: a reading of one part accepts with no affirmed and answers parts of length 1", () => {
  const w = setup();
  const r = w.bv.versionAccept({ target: Q, version: "one route", author: ALICE, viewer: V("alice") });
  assert.deepEqual([r.ok, r.affirmed], [true, null]);
  const one = w.bv.basisVersions({ id: Q, viewer: V("alice") }).versions.find((v) => v.name === "one route");
  assert.deepEqual([one.parts, one.affirmed], [["main"], null]);
});
