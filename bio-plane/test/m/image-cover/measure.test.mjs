/* image-cover R4: the cover streams, and its time and memory on a 12 MP and a 48 MP phone JPEG are measured in
 * workerd (Miniflare, the plane's own runner).
 *
 * The photos are built here from `fixtures/strip-4032x64.jpg` (4:2:0, a restart interval of 252 MCUs, about 4 bits
 * a pixel, denser than a phone's): its four restart segments, each one 16-pixel band, tiled into 4032 x 3024
 * (189 bands) and 8064 x 6048 (two segments a band, 378 bands), with the restart markers renumbered.
 *
 * Time is the request's wall time less the same body's echo (workerd's clock does not advance inside a request).
 * Memory is the workerd process's peak resident set during the request (Linux `VmHWM`, its peak reset through
 * `clear_refs` first) less its resident set just before: the request body, the answer and the cover's working set
 * together, with whatever garbage the isolate had not yet collected. Both are printed for the job's record. The
 * test holds the measurement to the isolate's 128 MB and checks the answer's covered blocks. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { Miniflare } from "miniflare";
import { MB, phoneJpeg, workerdPid, status } from "./workerd-photos.mjs";

test("R4 a 12 MP and a 48 MP phone JPEG covered in workerd: time and peak memory measured, the answer complete, the memory inside the isolate's 128 MB", { timeout: 600_000 }, async () => {
  const entry = fileURLToPath(new URL("../../../src/image-cover/index.mjs", import.meta.url));
  const { outputFiles } = await build({
    stdin: {
      contents: `import { coverAreas } from ${JSON.stringify(entry)};
export default { async fetch(req) {
  const b = new Uint8Array(await req.arrayBuffer());
  if (req.headers.get("x-echo")) return Response.json({ length: b.length });
  const r = await coverAreas(b, { areas: JSON.parse(req.headers.get("x-areas")) });
  return Response.json({ ok: r.ok, code: r.code, detail: r.detail, covered: r.covered, width: r.width, height: r.height, bytes: r.bytes?.length });
} };`,
      resolveDir: fileURLToPath(new URL(".", import.meta.url)), loader: "js",
    },
    bundle: true, format: "esm", write: false, platform: "neutral",
  });
  const mf = new Miniflare({ modules: true, script: outputFiles[0].text, compatibilityDate: "2025-01-01" });
  const rows = [];
  try {
    await mf.ready;
    const pid = workerdPid();
    const call = (body, headers) => mf.dispatchFetch("http://cover/", { method: "POST", body, headers });
    for (const [label, W, H] of [["12 MP", 4032, 3024], ["48 MP", 8064, 6048]]) {
      const photo = phoneJpeg(W, H);
      /* areas as displayed (orientation 6: H x W): three faces and a plate */
      const areas = [[400, 900, 700, 1300], [1500, 1000, 1800, 1400], [2200, 2600, 2900, 3100], [100, 3800, 600, 3950]].map((a) => a.map((v) => Math.round((v * W) / 4032)));
      await (await call(photo, { "x-echo": "1" })).json();       // warm, and the body's own cost
      const t0 = performance.now();
      await (await call(photo, { "x-echo": "1" })).json();
      const echoMs = performance.now() - t0;
      const before = status(pid, "VmRSS");
      writeFileSync(`/proc/${pid}/clear_refs`, "5");
      const t1 = performance.now();
      const r = await (await call(photo, { "x-areas": JSON.stringify(areas) })).json();
      const ms = performance.now() - t1 - echoMs;
      const peak = status(pid, "VmHWM");
      assert.equal(r.ok, true, `${label}: ${r.code} ${r.detail}`);
      assert.deepEqual([r.width, r.height], [H, W], "as displayed");
      /* each area's MCUs, 16 x 16 in the stored frame, six blocks each */
      const mcus = areas.reduce((n, [x0, y0, x1, y1]) => n + (Math.floor((y1 - 1) / 16) - Math.floor(y0 / 16) + 1) * (Math.floor((H - x0 - 1) / 16) - Math.floor((H - x1) / 16) + 1), 0);
      assert.equal(r.covered, mcus * 6, label);
      rows.push({ label, photo_mb: +(photo.length / MB).toFixed(1), answer_mb: +(r.bytes / MB).toFixed(1), ms: Math.round(ms), peak_growth_mb: +((peak - before) / MB).toFixed(1) });
      assert.ok(peak - before < 128 * MB, `${label}: ${((peak - before) / MB).toFixed(1)} MB`);
    }
  } finally {
    await mf.dispose();
  }
  console.log(`image-cover R4 (workerd): ${JSON.stringify(rows)}`);
});
