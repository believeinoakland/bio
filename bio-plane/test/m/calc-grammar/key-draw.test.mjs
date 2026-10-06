/* calc-grammar at its interface: result keys (R15), recorded draws (R16) and the exact interval (R17). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { resultKey, draw, interval, METHOD } from "../../../src/calc-grammar/index.mjs";

const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const R = { method: METHOD, inputs: [{ name: "t", kind: "table" }], steps: [{ op: "count", as: "c", from: "t" }], output: "c" };

test("R15 the result key is SHA-256 of the canonical JSON of {recipe, inputs, method_version}: same in, same key; another method version, another key", () => {
  const h = { t: "a".repeat(64) };
  const k = resultKey(R, h);
  assert.match(k, /^[0-9a-f]{64}$/);
  const canonical = `{"inputs":{"t":"${"a".repeat(64)}"},"method_version":"${METHOD}","recipe":{"inputs":[{"kind":"table","name":"t"}],"method":"${METHOD}","output":"c","steps":[{"as":"c","from":"t","op":"count"}]}}`;
  assert.equal(k, sha(canonical));
  const reordered = { output: "c", steps: [{ from: "t", op: "count", as: "c" }], inputs: [{ kind: "table", name: "t" }], method: METHOD };
  assert.equal(resultKey(reordered, { t: "a".repeat(64) }), k);
  assert.notEqual(resultKey(R, { t: "b".repeat(64) }), k);
  assert.notEqual(resultKey({ ...R, output: "d" }, h), k);
  assert.notEqual(resultKey(R, h, { methodVersion: "bio-calc/1+1" }), k);
  assert.equal(resultKey(R, h, { methodVersion: METHOD }), k);
  assert.throws(() => resultKey(null, h), TypeError);
  assert.throws(() => resultKey(R, "x"), TypeError);
});

test("R16 a draw ranks every key by SHA-256 of the seed and the key and takes the first n: reproducible by any SHA-256 tool, with the frame's hash, the seed and the method", () => {
  const frame = Array.from({ length: 300 }, (_, i) => `ROW-${i}`);
  for (const [seed, n] of [["2026-10-05 public draw", 25], ["x", 0], ["x", 300], ["ünïcode seed", 7]]) {
    const r = draw({ frame, n, seed });
    const want = [...frame].sort((a, b) => { const x = sha(`${seed}\n${a}`); const y = sha(`${seed}\n${b}`); return x < y ? -1 : x > y ? 1 : 0; }).slice(0, n);
    assert.deepEqual(r.sample, want);
    assert.equal(r.seed, seed);
    assert.equal(r.frame_hash, sha(JSON.stringify([...frame].sort())));
    assert.match(r.method, /sha256\(seed \+ "\\n" \+ key\)/);
    assert.deepEqual(draw({ frame: [...frame].reverse(), n, seed }), r, "the frame's order does not change the draw");
  }
  assert.notDeepEqual(draw({ frame, n: 25, seed: "a" }).sample, draw({ frame, n: 25, seed: "b" }).sample);
  assert.equal(draw({ frame, n: 301, seed: "x" }).refused, "DRAW_TOO_LARGE");
  assert.equal(draw({ frame, n: -1, seed: "x" }).refused, "DRAW_TOO_LARGE");
  assert.equal(draw({ frame: ["a", "b", "a"], n: 1, seed: "x" }).refused, "FRAME_INVALID");
  assert.equal(draw({ frame: ["a", 2], n: 1, seed: "x" }).refused, "FRAME_INVALID");
  assert.equal(draw({ frame, n: 1, seed: "" }).refused, "SEED_INVALID");
  assert.throws(() => draw({ frame, n: 1 }), TypeError);
  assert.throws(() => draw({ frame: "abc", n: 1, seed: "x" }), TypeError);
});

/* An independent oracle: every M scanned, tails as exact fractions. */
function oracle(N, n, x, conf) {
  const C = (m, k) => { if (k < 0 || k > m) return 0n; let r = 1n; for (let i = 0; i < k; i++) r = (r * BigInt(m - i)) / BigInt(i + 1); return r; };
  const [, f] = conf.split(".");
  const q = 10n ** BigInt(f.length); const p = BigInt(f);
  const total = C(N, n);
  const ok = (t) => 2n * q * t >= (q - p) * total;
  const up = (M) => { let s = 0n; for (let k = x; k <= n; k++) s += C(M, k) * C(N - M, n - k); return s; };
  const down = (M) => { let s = 0n; for (let k = 0; k <= x; k++) s += C(M, k) * C(N - M, n - k); return s; };
  let low = null; let high = null;
  for (let M = 0; M <= N; M++) { if (low === null && ok(up(M))) low = M; if (ok(down(M))) high = M; }
  return { low, high };
}

test("R17 the exact hypergeometric interval: low and high are the extreme frame counts whose tails are not below (1 − confidence)/2, for every small frame", () => {
  for (const conf of ["0.8", "0.9", "0.95", "0.99"]) for (let N = 1; N <= 14; N++) for (let n = 1; n <= N; n++) for (let x = 0; x <= n; x++) {
    const r = interval({ frame_size: N, sample_size: n, successes: x, confidence: conf });
    const o = oracle(N, n, x, conf);
    assert.deepEqual([r.low, r.high], [o.low, o.high], `N=${N} n=${n} x=${x} c=${conf}`);
    assert.ok(r.low <= x + (N - n) && r.low >= x && r.high <= N - (n - x));
  }
  const big = interval({ frame_size: 5000, sample_size: 400, successes: 40, confidence: 0.95 });
  assert.match(big.method, /hypergeometric/);
  assert.ok(big.low < 500 && big.high > 500 && big.low > 300 && big.high < 750, JSON.stringify(big));
  assert.deepEqual(interval({ frame_size: 10, sample_size: 10, successes: 4, confidence: "0.95" }), { low: 4, high: 4, method: big.method });
  for (const bad of [{ frame_size: 0, sample_size: 0, successes: 0, confidence: "0.9" }, { frame_size: 5, sample_size: 6, successes: 1, confidence: "0.9" },
    { frame_size: 5, sample_size: 3, successes: 4, confidence: "0.9" }, { frame_size: 5, sample_size: 3, successes: -1, confidence: "0.9" },
    { frame_size: 5.5, sample_size: 3, successes: 1, confidence: "0.9" }, { frame_size: 5, sample_size: 3, successes: 1, confidence: "1" },
    { frame_size: 5, sample_size: 3, successes: 1, confidence: "0" }, { frame_size: 5, sample_size: 3, successes: 1, confidence: "95%" },
    { frame_size: 5, sample_size: 3, successes: 1 }]) assert.equal(interval(bad).refused, "INTERVAL_INVALID", JSON.stringify(bad));
});
