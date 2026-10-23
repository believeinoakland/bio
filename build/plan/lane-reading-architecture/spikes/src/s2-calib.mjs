import { Miniflare } from "./mf.mjs";
const mf = new Miniflare({ modules: true, compatibilityDate: "2026-07-01", script: `
export default { async fetch(req){ const n=Number(new URL(req.url).searchParams.get("n")); let x=0; for(let i=0;i<n;i++){x=(x*31+i)%1000003;} return new Response(String(x)); } }` });
for (const n of [1e8, 1e9]) { const t = Date.now(); const r = await mf.dispatchFetch("http://x/?n=" + n); console.log(n, r.status, await r.text(), Date.now() - t, "ms"); }
await mf.dispose();
