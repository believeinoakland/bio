/* CPDF-11 instrument, half 1 of 2: the scratch Worker that carries the `AI`
 * binding. NOT part of the plane, NOT in the battery, NOT deployed by anything
 * but `ocr-moondream-probe.mjs`, which uploads it under a scratch slug and
 * deletes it again on the way out.
 *
 * WHY A WORKER AT ALL. Workers AI is reachable two ways: the account REST route
 * (`/accounts/<id>/ai/run/<model>`) and the `env.AI` binding. The REST route
 * needs a token carrying the Workers AI permission; the project token in `.env`
 * carries Workers Scripts but NOT Workers AI (measured 2026-08-04: HTTP 403
 * code 10000 on `/ai/models/search` while `/workers/scripts` answers 200). The
 * binding needs no token permission at all — which is the whole point of the
 * in-account path and is exactly how a sovereign instance would reach it. So
 * this is not a workaround: it is the production shape, probed directly.
 *
 * It is a raw pass-through on purpose. Every parameter comes from the driver so
 * the driver's source is the complete record of what was asked, and NOTHING
 * here interprets, retries, cleans or reformats a model answer — an instrument
 * that tidies its subject's output cannot measure it.
 */
export default {
  async fetch(req, env) {
    if (req.method !== "POST") return new Response("cpdf11 moondream probe\n", { status: 200 });
    let body;
    try { body = await req.json(); } catch { return Response.json({ ok: false, error: "bad json" }, { status: 400 }); }
    if (body.token !== env.PROBE_TOKEN) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
    if (body.ping) return Response.json({ ok: true, ai_binding: typeof env.AI, run: typeof (env.AI && env.AI.run) });

    const t0 = Date.now();
    try {
      const out = await env.AI.run(body.model, body.input);
      /* A streamed answer arrives as a ReadableStream, which JSON.stringify
         renders as `{}` — an empty object that looks exactly like an empty
         answer. Found the hard way: `task=detect` with the SDK's default
         `stream=true` returns a stream whose body is the error
         "task=detect does not support stream=True", and reported as `{}` it
         reads as "the model found nothing". So the stream is drained and
         handed back verbatim rather than collapsed. */
      if (out && typeof out.getReader === "function") {
        return Response.json({ ok: true, ms: Date.now() - t0, streamed: true, drained: await new Response(out).text() });
      }
      return Response.json({ ok: true, ms: Date.now() - t0, streamed: false, out });
    } catch (e) {
      return Response.json({
        ok: false,
        ms: Date.now() - t0,
        name: String((e && e.name) || ""),
        error: String((e && e.message) || e),
      });
    }
  },
};
