/* connection-grammar at its interface: the owner registry (R2–R5). */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as cg from "../../../src/connection-grammar/index.mjs";

const { createRegistry } = cg;
const nb = () => ({ items: [] });
const k = (kind, word = "linked to", cls = "evidentiary") => ({ kind, word, class: cls });

test("R2 registers an owner once, each kind with its class and members' word", () => {
  const r = createRegistry();
  assert.deepEqual(r.registerOwner({ owner: "lines", kinds: [k("holds", "holds the seat"), k("part_of", "part of", "declared")], neighbours: nb }),
    { ok: true, owner: "lines" });
  for (const cls of ["evidentiary", "derived", "declared", "hunch"]) {
    assert.equal(r.registerOwner({ owner: `o-${cls}`, kinds: [k(`k-${cls}`, "w", cls)], neighbours: nb }).ok, true, cls);
  }
  assert.deepEqual(cg.CLASSES, ["evidentiary", "derived", "declared", "hunch"]);
});

test("R2 refusals name their kind of no and leave nothing registered", () => {
  const r = createRegistry();
  r.registerOwner({ owner: "events", kinds: [k("within")], neighbours: nb });
  const before = JSON.stringify(r.owners());
  const cases = [
    [{ owner: "events", kinds: [k("other")], neighbours: nb }, "OWNER_DUPLICATE"],
    [{ owner: "lines", kinds: [k("fresh"), k("within")], neighbours: nb }, "KIND_TAKEN", "events"],
    [{ owner: "lines", kinds: [k("a"), k("a")], neighbours: nb }, "KIND_TAKEN"],
    [{ owner: "lines", kinds: [k("a", "w", "suspicion")], neighbours: nb }, "CLASS_UNKNOWN"],
    [{ owner: "lines", kinds: [k("a", "")], neighbours: nb }, "WORD_MISSING"],
    [{ owner: "lines", kinds: [{ kind: "a", class: "derived" }], neighbours: nb }, "WORD_MISSING"],
    [{ owner: "lines", kinds: [k("a")] }, "NEIGHBOURS_MISSING"],
    [{ owner: "lines", kinds: [k("a")], neighbours: "read" }, "NEIGHBOURS_MISSING"],
    [{ owner: "", kinds: [k("a")], neighbours: nb }, "OWNER_MISSING"],
    [{ owner: "lines", kinds: [], neighbours: nb }, "KINDS_MISSING"],
    [{ owner: "lines", kinds: [{ word: "w", class: "derived" }], neighbours: nb }, "KIND_MISSING"],
    [undefined, "OWNER_MISSING"],
  ];
  for (const [arg, code, names] of cases) {
    const res = r.registerOwner(arg);
    assert.equal(res.refused, code, JSON.stringify(arg));
    assert.ok(typeof res.why === "string" && res.why.length);
    if (names) assert.ok(res.why.includes(names), `${code} names ${names}`);
    assert.equal(JSON.stringify(r.owners()), before, `${code} registers nothing`);
    assert.equal(r.kindOf("fresh"), null);
  }
});

test("R3 a word saying knows, network, conflict, suspicious or most connected, in any case, is refused WORD_FORBIDDEN", () => {
  const r = createRegistry();
  for (const w of ["knows", "Network of", "in CONFLICT with", "suspicious link", "Most Connected", "who KNOWS whom"]) {
    const res = r.registerOwner({ owner: "people", kinds: [k("tie", w)], neighbours: nb });
    assert.equal(res.refused, "WORD_FORBIDDEN", w);
    assert.equal(r.kindOf("tie"), null);
  }
  assert.equal(r.registerOwner({ owner: "people", kinds: [k("tie", "worked with")], neighbours: nb }).ok, true);
});

test("R4 owners lists every owner and its kinds in registration order; kindOf answers the entry or null; neither throws", () => {
  const r = createRegistry();
  assert.deepEqual(r.owners(), []);
  r.registerOwner({ owner: "b-owner", kinds: [k("b1", "bee"), k("b2", "bee two", "derived")], neighbours: nb });
  r.registerOwner({ owner: "a-owner", kinds: [k("a1", "ay", "hunch")], neighbours: nb });
  assert.deepEqual(r.owners(), [
    { owner: "b-owner", kinds: [k("b1", "bee"), k("b2", "bee two", "derived")] },
    { owner: "a-owner", kinds: [k("a1", "ay", "hunch")] },
  ]);
  assert.deepEqual(r.kindOf("b2"), { owner: "b-owner", word: "bee two", class: "derived" });
  assert.deepEqual(r.kindOf("a1"), { owner: "a-owner", word: "ay", class: "hunch" });
  for (const v of ["nobody", undefined, null, 3, "__proto__", "constructor", {}]) assert.equal(r.kindOf(v), null, String(v));
  // What a caller gets back is a copy: changing it changes nothing held.
  const o = r.owners();
  o[0].kinds[0].word = "changed"; o.pop();
  assert.equal(r.kindOf("b1").word, "bee");
  assert.equal(r.owners().length, 2);
});

test("R5 each registry is its own; the default registry is one the plane wires, with the same services", () => {
  const a = createRegistry(), b = createRegistry();
  a.registerOwner({ owner: "x", kinds: [k("kx")], neighbours: nb });
  assert.deepEqual(b.owners(), []);
  assert.equal(b.kindOf("kx"), null);
  assert.equal(b.registerOwner({ owner: "x", kinds: [k("kx")], neighbours: nb }).ok, true, "the same owner and kind are free in another");
  assert.deepEqual(cg.owners(), [], "neither touched the default");
  for (const f of ["registerOwner", "owners", "kindOf", "checkConnection", "neighbours"]) {
    assert.equal(typeof cg[f], "function", f);
    assert.equal(cg[f], cg.defaultRegistry[f], f);
  }
  assert.equal(cg.registerOwner({ owner: "default-owner", kinds: [k("kd")], neighbours: nb }).ok, true);
  assert.deepEqual(cg.kindOf("kd"), { owner: "default-owner", word: "linked to", class: "evidentiary" });
  assert.equal(a.kindOf("kd"), null);
  assert.ok(Object.isFrozen(a), "a registry's services cannot be replaced");
});
