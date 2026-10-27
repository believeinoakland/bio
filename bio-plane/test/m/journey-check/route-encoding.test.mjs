/* journey-check R8, R1 (a) (K4473): what the walk's browser is answered, it can read. The local arm answers the browser from
   workerd, which compresses a body when the request asks for it and hands the bytes back as they are; the route removes the
   header that names the compression, so the browser, and the walker that judges each answer for a refusal (R8), met bytes of gzip
   where JSON stood (`op=interfacewords`, `op=captureupload`), and every answer so sent was never judged. The routes (the world's and
   the pseudo-locale's) ask for no compression. No browser: each route's handler is run against a request that asks for it. */
import "../screens-settings/register.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";

const { localWorld, SITE_ORIGIN } = await import("../../../src/journey-check/local.mjs");
const { pseudoRoute } = await import("../../../src/journey-check/pseudo.mjs");

const ASKS = { "accept-encoding": "gzip, deflate, br", accept: "text/html" };
const call = (url) => ({ request: () => ({ url: () => url, resourceType: () => "document", method: () => "GET", headers: () => ({ ...ASKS }), postDataBuffer: () => null }),
  fallback: async () => {}, abort: async () => {}, fulfill: async (r) => { out = r; } });
let out = null;

test("R8: the world's route answers the browser a body it can read though the browser asked for compression; control: the pseudo route's request to the copy asks for none", async () => {
  const world = await localWorld();
  try {
    let handler;
    await world.route({ route: async (_p, h) => { handler = h; } }, () => {});
    out = null;
    await handler(call(SITE_ORIGIN + "/"));
    assert.ok(out && out.status === 200, "the site answers");
    const text = out.body.toString("utf8");
    assert.ok(/<html/i.test(text), "the body is the page, not compressed bytes: " + JSON.stringify(text.slice(0, 20)));
    /* the pseudo route's own request to the copy */
    let sent = null;
    let h2;
    await pseudoRoute({ route: async (_p, h) => { h2 = h; } }, { host: "copy.test", fetchCopy: async (req) => { sent = req; return new Response("{}", { headers: { "content-type": "application/json" } }); } });
    await h2({ request: () => ({ url: () => "https://copy.test/api/?op=x", resourceType: () => "fetch", method: () => "GET", headers: () => ({ ...ASKS }), postDataBuffer: () => null }),
      fallback: async () => {}, fulfill: async () => {} });
    assert.equal(sent.headers.get("accept-encoding"), null, "no compression asked of the copy");
    assert.equal(sent.headers.get("accept"), "text/html", "the browser's other headers go on");
  } finally { await world.close(); }
});
