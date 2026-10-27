/* structured-text-reader R4: an SVG's text elements and titles are read; its scripts and external references are never
 * run or fetched. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "../../../src/structured-text-reader/index.mjs";
import { unitsOf } from "./fixtures.mjs";

const svg = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" onload="fetch('https://tracker.example/x')">
  <title>Zoning map</title><desc>District boundaries</desc>
  <script type="text/javascript"><![CDATA[ fetch("https://tracker.example/y"); globalThis.ran = true; ]]></script>
  <style>text { fill: red }</style>
  <image xlink:href="https://images.example/parcel.png" width="10" height="10"/>
  <use href="#local"/>
  <text x="10" y="20">Lake <tspan>Merritt</tspan> district</text>
</svg>`;

test("R4 an SVG with a script and an external image: its text is found and nothing is fetched or run", async () => {
  const realFetch = globalThis.fetch;
  let fetched = 0;
  globalThis.fetch = async () => { fetched++; throw new Error("no fetch"); };
  try {
    for (const budget of [null, { bytes: 6 }]) {
      const r = await unitsOf(S.svgEntry, svg, budget);
      const texts = r.units.map((u) => u.text);
      assert.ok(texts.includes("Zoning map"));
      assert.ok(texts.includes("District boundaries"));
      assert.ok(texts.includes("Merritt"));
      assert.ok(!texts.some((t) => t.includes("tracker") || t.includes("fill")), "script and style content are not read as text");
      assert.deepEqual(r.final.facts, { scripts: 1, external_refs: 1 });
    }
    const t = await S.svgEntry.text(new TextEncoder().encode(svg));
    assert.deepEqual(t.active, [{ kind: "script", count: 1, run: false }]);
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.equal(fetched, 0);
  assert.equal(globalThis.ran, undefined);
});
