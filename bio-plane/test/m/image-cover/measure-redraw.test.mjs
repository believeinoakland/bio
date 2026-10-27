/* image-cover R12: the redraw and the photo reader on a 12 MP and a 48 MP phone JPEG, measured in workerd (Miniflare, the
 * plane's own runner), as `measure.test.mjs` measures the cover: the same photographs (`workerd-photos.mjs`), the same
 * way of reading time (the request's wall time less its echo) and memory (the workerd process's peak resident set during the
 * request, less its resident set just before). The rows are printed for the job's record. The test holds each measurement
 * to the isolate's 128 MB; a photograph past the decoded-frame bound is refused from its header and its row says so. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { Miniflare } from "miniflare";
import { MB, phoneJpeg, workerdPid, status } from "./workerd-photos.mjs";

test("R12 a 12 MP and a 48 MP phone JPEG redrawn and read in workerd: time and peak memory measured, inside the isolate's 128 MB", { timeout: 900_000 }, async () => {
  const entry = fileURLToPath(new URL("../../../src/image-cover/index.mjs", import.meta.url));
  const { outputFiles } = await build({
    stdin: {
      contents: `import { redrawPicture, photoFactsOf } from ${JSON.stringify(entry)};
export default { async fetch(req) {
  const b = new Uint8Array(await req.arrayBuffer());
  const what = req.headers.get("x-what");
  if (what === "echo") return Response.json({ length: b.length });
  if (what === "facts") { const r = await photoFactsOf(b); return Response.json({ ok: r.ok, code: r.code, kept: Object.keys(r.facts || {}).length, left: r.left_out?.length }); }
  const r = await redrawPicture(b);
  return Response.json({ ok: r.ok, code: r.code, detail: r.detail, width: r.width, height: r.height, orientation: r.orientation, bytes: r.bytes?.length });
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
    const call = (body, what) => mf.dispatchFetch("http://redraw/", { method: "POST", body, headers: { "x-what": what } });
    for (const [label, W, H] of [["12 MP", 4032, 3024], ["48 MP", 8064, 6048]]) {
      const photo = phoneJpeg(W, H);
      await (await call(photo, "echo")).json();
      const t0 = performance.now();
      await (await call(photo, "echo")).json();
      const echoMs = performance.now() - t0;
      const row = { label, photo_mb: +(photo.length / MB).toFixed(1) };
      for (const what of ["facts", "redraw"]) {
        const before = status(pid, "VmRSS");
        writeFileSync(`/proc/${pid}/clear_refs`, "5");
        const t1 = performance.now();
        const r = await (await call(photo, what)).json();
        const ms = performance.now() - t1 - echoMs;
        const grown = status(pid, "VmHWM") - before;
        row[what] = { ok: r.ok, code: r.code, ms: Math.round(ms), peak_growth_mb: +(grown / MB).toFixed(1), answer_mb: r.bytes ? +(r.bytes / MB).toFixed(1) : undefined };
        assert.ok(grown < 128 * MB, `${label} ${what}: ${(grown / MB).toFixed(1)} MB`);
        if (what === "facts") { assert.equal(r.ok, true, `${label}: the photo's facts are read whatever its size`); assert.ok(r.kept >= 3); }
        else if (r.ok) { assert.deepEqual([r.width, r.height, r.orientation], [W, H, 6], `${label}: as stored, the orientation as read`); }
        else assert.equal(r.code, "IMAGE_TOO_LARGE", `${label}: ${r.code} ${r.detail}`);
      }
      rows.push(row);
    }
    assert.equal(rows[0].redraw.ok, true, "a 12 MP photograph is redrawn");
  } finally {
    await mf.dispose();
  }
  console.log(`image-cover R12 (workerd): ${JSON.stringify(rows)}`);
});
