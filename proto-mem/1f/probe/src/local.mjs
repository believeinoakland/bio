/* proto-mem/1f (THROWAWAY): the LOCAL entry of the probe Worker (Miniflare/workerd on this machine): same routes.mjs, but `instance()` forwards to a Node process (env.SINK_URL) running the image's own
   server (probe/image-min/server.mjs, or vendor/reader-container/container/server.mjs). No Cloudflare Container exists locally: nothing about a container's start, network or billing is modelled. */
import { handle } from "./routes.mjs";
export default {
  async fetch(request, env, ctx) {
    return handle(request, env, ctx, { instance: (which) => ({ fetch: (req) => { const u = new URL(req.url); const base = which === "reader" ? env.SINK_URL_READER : env.SINK_URL; return fetch(new Request(base + u.pathname + u.search, req)); } }) });
  },
};
