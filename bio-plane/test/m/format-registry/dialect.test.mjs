/* format-registry: requirement-named tests for readingDialect (build/requirements/format-registry.md
 * R14-R16), at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readingDialect } from "../../../src/formats.mjs";
import { csvEntry } from "../../../src/csv.mjs";

const EMPTY = { delimiter: null, encoding: null, confidence: { delimiter: null, encoding: null },
  signals: { delimiter: [], encoding: [] }, undetermined: [] };

test("R14: null for anything that is not a non-array object", () => {
  for (const v of [null, undefined, 0, 1, NaN, "", "utf-8", true, false, 5n, Symbol("d"), [], ["utf-8"], [{ delimiter: "," }], () => ({})]) {
    assert.equal(readingDialect(v), null);
  }
});

test("R15: a projection of the named keys only, each string key a non-empty string or null, each list its string elements or []", () => {
  const emitted = {
    delimiter: ";", encoding: "utf-8", delimiterConfidence: "certain", encodingConfidence: "likely",
    delimiterSignals: ["s1", 2, null, "s2", { x: 1 }], encodingSignals: ["e1"], undetermined: ["u1", 7, "u2"],
  };
  const r = readingDialect(emitted);
  assert.deepEqual(r, { delimiter: ";", encoding: "utf-8", confidence: { delimiter: "certain", encoding: "likely" },
    signals: { delimiter: ["s1", "s2"], encoding: ["e1"] }, undetermined: ["u1", "u2"] });
  assert.notEqual(r, emitted);
  assert.notEqual(r.signals.encoding, emitted.encodingSignals, "a list is a new filtered array, never the entry's own");
  assert.notEqual(r.undetermined, emitted.undetermined);
  assert.deepEqual(Object.keys(r), ["delimiter", "encoding", "confidence", "signals", "undetermined"]);
  assert.deepEqual(readingDialect({}), EMPTY);
  // every non-string or empty value of a string key is null; every non-array value of a list key is []
  for (const bad of ["", 0, 1, true, null, undefined, {}, [","], new String(","), Symbol("s")]) {
    const e = { delimiter: bad, encoding: bad, delimiterConfidence: bad, encodingConfidence: bad };
    assert.deepEqual(readingDialect(e), EMPTY);
  }
  for (const bad of ["abc", 0, null, undefined, {}, { length: 1, 0: "a" }, new Set(["a"]), true]) {
    const e = { delimiterSignals: bad, encodingSignals: bad, undetermined: bad };
    assert.deepEqual(readingDialect(e), EMPTY);
  }
  assert.deepEqual(readingDialect({ undetermined: [1, 2, null] }).undetermined, []);
  assert.deepEqual(readingDialect({ undetermined: ["", "x"] }).undetermined, ["", "x"], "list elements are filtered by type only");
  // a null half stays null: nothing is guessed to fill it
  const und = readingDialect({ delimiter: ",", encoding: null, delimiterConfidence: "certain", encodingConfidence: null,
    undetermined: ["encoding_undetermined"] });
  assert.equal(und.encoding, null);
  assert.equal(und.confidence.encoding, null);
  assert.deepEqual(und.undetermined, ["encoding_undetermined"]);
  // inherited keys are read like own keys (the projection reads named keys of the object)
  assert.equal(readingDialect(Object.create({ delimiter: "\t" })).delimiter, "\t");
  // the real csv entry's own dialect projects without loss of any named key
  const d = csvEntry.dialect(new TextEncoder().encode("a;b;c\n1;2;3\n4;5;6\n"));
  assert.deepEqual(readingDialect(d), {
    delimiter: d.delimiter, encoding: d.encoding,
    confidence: { delimiter: d.delimiterConfidence, encoding: d.encodingConfidence },
    signals: { delimiter: d.delimiterSignals, encoding: d.encodingSignals }, undetermined: d.undetermined,
  });
  assert.equal(readingDialect(d).delimiter, "semicolon");
});

test("R16: never throws, and any key it does not name is dropped", () => {
  const withExtra = readingDialect({ delimiter: ",", encoding: "us-ascii", later: "not projected", container_extent: {}, dialect: {} });
  assert.deepEqual(Object.keys(withExtra), ["delimiter", "encoding", "confidence", "signals", "undetermined"]);
  assert.deepEqual(Object.keys(withExtra.confidence), ["delimiter", "encoding"]);
  assert.deepEqual(Object.keys(withExtra.signals), ["delimiter", "encoding"]);
  // hostile objects: throwing getters, a revoked proxy, a throwing proxy, an array whose filter is replaced
  const throwing = {};
  for (const k of ["delimiter", "encoding", "delimiterConfidence", "encodingConfidence", "delimiterSignals", "encodingSignals", "undetermined"]) {
    Object.defineProperty(throwing, k, { get() { throw new Error("hostile " + k); }, enumerable: true });
  }
  assert.deepEqual(readingDialect(throwing), EMPTY);
  const half = { delimiter: "|", get encoding() { throw new Error("x"); } };
  assert.deepEqual(readingDialect(half), { ...EMPTY, delimiter: "|" });
  const { proxy, revoke } = Proxy.revocable({}, {});
  revoke();
  assert.equal(readingDialect(proxy), null);
  const trap = () => { throw new Error("trap"); };
  const hostileProxy = new Proxy({}, { get: trap, has: trap, ownKeys: trap, getPrototypeOf: trap, getOwnPropertyDescriptor: trap });
  assert.deepEqual(readingDialect(hostileProxy), EMPTY);
  const arr = ["a", 1, "b"];
  arr.filter = trap;
  assert.deepEqual(readingDialect({ undetermined: arr }).undetermined, ["a", "b"]);
  const hostileArray = new Proxy(["a"], { get(t, k) { if (k === "length") throw new Error("len"); return t[k]; } });
  assert.deepEqual(readingDialect({ encodingSignals: hostileArray }).signals.encoding, []);
  assert.deepEqual(readingDialect(Object.freeze({ delimiter: "," })).delimiter, ",");
  assert.deepEqual(readingDialect(Object.create(null)), EMPTY);
});
