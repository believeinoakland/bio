import { Miniflare, sleep, SP } from "./mf.mjs";
const script = `
function busy(n){ let x=0; for(let i=0;i<n;i++){x=(x*31+i)%1000003;} return x; }
export class D { constructor(s,env){this.s=s;}
  async fetch(req){ const u=new URL(req.url);
    if(u.pathname==="/arm"){ await this.s.storage.setAlarm(Date.now()+100); return new Response("armed"); }
    if(u.pathname==="/status"){ return Response.json({start:await this.s.storage.get("start"),end:await this.s.storage.get("end"),err:await this.s.storage.get("err")}); }
    return new Response("?"); }
  async alarm(){ await this.s.storage.put("start",Date.now()); try { busy(7.6e9); await this.s.storage.put("end",Date.now()); } catch(e){ await this.s.storage.put("err",String(e)); } } }
export default { async fetch(req,env){ const u=new URL(req.url);
  if(u.pathname==="/busy"){ const d0=Date.now(); const t0=performance.now(); const x=busy(7.6e9); return Response.json({x,dateNowDelta:Date.now()-d0,perfDelta:performance.now()-t0}); }
  const id=env.D.idFromName("a"); return env.D.get(id).fetch(req); } }`;
for (const [label, opt] of [["cpuMs", { cpuMs: 50 }], ["limits.cpu_ms", { limits: { cpu_ms: 50 } }]]) {
  try { const m = new Miniflare({ modules: true, script: "export default {fetch(){return new Response('x')}}", ...opt }); await m.ready; console.log(label, "option ACCEPTED"); await m.dispose(); }
  catch (e) { console.log(label, "option rejected:", String(e.message).split("\n").slice(0, 3).join(" / ")); }
}
const mf = new Miniflare({ modules: true, compatibilityDate: "2026-07-01", script, durableObjects: { D: { className: "D", useSQLite: true } }, durableObjectsPersist: SP + "/data/s2-do-" + Date.now() });
let t = Date.now();
const r = await mf.dispatchFetch("http://x/busy");
console.log("fetch busy:", r.status, await r.text(), "wall", Date.now() - t, "ms");
t = Date.now();
await (await mf.dispatchFetch("http://x/arm")).text();
let st; for (let i = 0; i < 100; i++) { await sleep(1000); st = await (await mf.dispatchFetch("http://x/status")).json(); if (st.end || st.err) break; }
console.log("alarm busy:", JSON.stringify(st), "wall", Date.now() - t, "ms");
await mf.dispose();
