/* csv-reader R20 (fix round 7, G82; K4743): `text(partsOrBytes, {inlineCellsMax, yieldNow})` awaits `yieldNow()` between
   its 1 MiB windows and answers exactly what the call without it answers. The clock in the stretch test is the test's
   own, read in `yieldNow` outside the call (R-CLOCK); no figure is taken from inside the module. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { csvEntry } from "../../../src/csv-reader/index.mjs";
import { bigCsv, csvField, randomText, prng, MIB } from "./large.mjs";
import { enc } from "./fixtures.mjs";

const counter = () => { const c = { n: 0, fn: async () => { c.n++; } }; return c; };

test("R20 text() awaits yieldNow between its 1 MiB windows (3.5 MiB: at least 3 awaits), none for a body within one window", async () => {
  const big = bigCsv({ rows: 1850 });
  assert.ok(big.bytes.length > 3.1 * MIB && big.bytes.length < 3.7 * MIB, `body ${big.bytes.length}`);
  const c = counter();
  const t = await csvEntry.text(big.bytes, { yieldNow: c.fn });
  assert.equal(t.ok, true);
  assert.ok(c.n >= 3, `yieldNow called ${c.n} times`);
  const small = counter();
  await csvEntry.text(bigCsv({ rows: 100 }).bytes, { yieldNow: small.fn });
  assert.equal(small.n, 0, "a body of one window has no gap to yield in");
  const parts = await csvEntry.parts(big.bytes);
  const again = counter();
  await csvEntry.text(parts, { yieldNow: again.fn });
  assert.equal(again.n, c.n, "parts() given: the same gaps");
});

test("R20 yieldNow is awaited: the next window is not walked until it settles; a non-function, a throw and a rejection change nothing", async () => {
  const body = bigCsv({ rows: 1294 }).bytes;
  const want = await csvEntry.text(body);
  let open = 0, overlapped = false;
  const slow = () => { open++; return new Promise((r) => setTimeout(() => { open--; r(); }, 5)); };
  assert.deepEqual(await csvEntry.text(body, { yieldNow: slow }), want);
  assert.equal(open, 0);
  assert.equal(overlapped, false);
  for (const yieldNow of ["yes", null, 7, () => { throw new Error("no"); }, async () => { throw new Error("no"); }]) {
    assert.deepEqual(await csvEntry.text(body, { yieldNow }), want);
  }
});

function awkwardBodies() {
  const filler = (n) => "x".repeat(n);
  const rows = (n) => Array.from({ length: n }, (_, i) => `${i},${filler(30)}`);
  const head = rows(60).join("\r\n") + "\r\n";                       // the delimiter signature reads the first 50 lines
  /* pad one record so that a chosen byte lands on the 1 MiB edge (counted from the start of the body, after any BOM) */
  const padTo = (prefix, target, make) => prefix + make(target - prefix.length);
  const edge = MIB;
  const bodies = {};
  bodies["record crossing the edge"] = enc(padTo(head, edge - 20, (n) => filler(n) + "\r\n") + "alpha,beta-gamma-delta-epsilon,zeta\r\n" + rows(70000).join("\r\n"));
  bodies["quoted newline across the edge"] = enc(padTo(head, edge - 3, (n) => filler(n) + "\r\n") + '"line one\nline two\r\nline three",b\r\nlast,row\r\n' + rows(70000).join("\r\n"));
  bodies["doubled quote across the edge"] = enc(padTo(head, edge - 4, (n) => filler(n) + "\r\n") + '"a""b""""c",d\r\n' + rows(70000).join("\n"));
  bodies["CRLF split by the edge"] = enc(padTo(head, edge - 1, (n) => filler(n)) + "\r\nx,y\r\n" + rows(70000).join("\r\n"));
  /* a two-byte, a three-byte and a four-byte character, each starting a byte or two before the edge */
  for (const [name, ch, back] of [["two-byte", "é", 1], ["three-byte", "€", 2], ["four-byte", "😀", 3]]) {
    const pre = head + filler(edge - back - head.length - 1) + ",";
    bodies[`${name} character across the edge`] = new Uint8Array([...new TextEncoder().encode(pre + ch + ",tail\r\n" + rows(70000).join("\r\n"))]);
    assert.ok(new TextEncoder().encode(pre).length < edge && new TextEncoder().encode(pre + ch).length > edge, name);
  }
  bodies["BOM"] = new Uint8Array([0xef, 0xbb, 0xbf, ...enc(head + rows(80000).join("\r\n"))]);
  const huge = filler(300 * 1024);
  bodies["row over the cap"] = enc(head + `1,${huge},2\r\n` + rows(60000).join("\r\n") + `\r\n3,${huge},"${huge}\n${huge}"\r\n` + rows(30000).join("\r\n"));
  bodies["undetermined encoding past the head"] = new Uint8Array([...enc(head + rows(70000).join("\r\n")), 0x2c, 0x96, 0x0d, 0x0a, ...enc("a,b\r\n")]);
  bodies["semicolon, no final newline"] = enc(rows(80000).map((r) => r.replace(",", ";")).join("\n"));
  const u16 = (s) => { const b = new Uint8Array(2 + s.length * 2); b[0] = 0xff; b[1] = 0xfe; for (let i = 0; i < s.length; i++) { b[2 + i * 2] = s.charCodeAt(i) & 255; b[3 + i * 2] = s.charCodeAt(i) >> 8; } return b; };
  bodies["utf-16le"] = u16(head + rows(40000).join("\r\n") + "\r\n€,😀\r\n");
  const bad = u16(head + rows(40000).join("\r\n")); bad[bad.length - 1] = 0xd8; bad[bad.length - 2] = 0x41;
  bodies["utf-16le invalid tail"] = bad;
  return bodies;
}

test("R20 the answer with yieldNow deep-equals the answer without, over awkward bodies, bytes or parts()", async () => {
  for (const [name, body] of Object.entries(awkwardBodies())) {
    for (const opts of [{}, { inlineCellsMax: 256 * 1024 }, { inlineCellsMax: 0 }]) {
      const c = counter();
      const want = await csvEntry.text(body, opts);
      const got = await csvEntry.text(body, { ...opts, yieldNow: c.fn });
      assert.deepEqual(got, want, `${name} ${JSON.stringify(opts)}`);
      assert.ok(c.n >= 1, `${name}: yielded ${c.n}`);
      const parts = await csvEntry.parts(body);
      assert.deepEqual(await csvEntry.text(parts, { ...opts, yieldNow: c.fn }), want, `${name} parts`);
    }
  }
});

test("R20 the answer is the same over the size guard, an empty body, and a body that is not bytes", async () => {
  const over = new Uint8Array(18 * MIB).fill(0x61);
  for (const body of [over, new Uint8Array(0), null, "text"]) {
    const c = counter();
    assert.deepEqual(await csvEntry.text(body, { yieldNow: c.fn }), await csvEntry.text(body));
  }
});

test("R20 no synchronous stretch of a 17 MiB read covers more than one window (test's own clock)", async () => {
  const rand = prng(5);
  const out = [];
  let bytes = 0;
  for (let r = 1; bytes < 17 * MIB - 4096; r++) {
    const record = [String(r), randomText(rand, 400), randomText(rand, 400), r % 7 === 0 ? `a,b\nsecond ${randomText(rand, 30)}` : "x"].map(csvField).join(",");
    out.push(record);
    bytes += record.length + 2;
  }
  const body = enc(out.join("\r\n") + "\r\n");
  assert.ok(body.length > 16.9 * MIB && body.length <= 17 * MIB, `body ${body.length}`);
  const stretches = [];
  let mark = performance.now();
  const yieldNow = async () => { const now = performance.now(); stretches.push(now - mark); await new Promise((r) => setTimeout(r, 0)); mark = performance.now(); };
  const t = await csvEntry.text(body, { inlineCellsMax: 512 * 1024, yieldNow });
  stretches.push(performance.now() - mark);
  assert.equal(t.ok, true);
  assert.ok(stretches.length >= 17, `${stretches.length} stretches`);
  const longest = Math.max(...stretches), total = stretches.reduce((a, b) => a + b, 0);
  console.log(`R20 stretch (bar 500 ms, K4354): ${stretches.length} stretches, longest ${longest.toFixed(1)} ms, total ${total.toFixed(1)} ms`);
  assert.ok(longest < 500, `longest stretch ${longest} ms of ${total} ms`);
});
