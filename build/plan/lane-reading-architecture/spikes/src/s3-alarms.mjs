import { Miniflare, sleep, SP } from "./mf.mjs";
const T0 = Date.now(); const logs = [];
const t = () => ((Date.now() - T0) / 1000).toFixed(2);
const script = `
export class D { constructor(s,env){this.s=s;this.env=env;}
  async log(o){ await this.env.LOG.fetch("http://log/", {method:"POST", body: JSON.stringify(o)}); }
  async fetch(req){ const u=new URL(req.url); const mode=u.searchParams.get("mode"); const ms=Number(u.searchParams.get("ms")||0);
    await this.s.storage.put("mode", mode);
    await this.s.storage.setAlarm(Date.now()+ms);
    return new Response("armed "+mode); }
  async alarm(info){ const mode = await this.s.storage.get("mode"); const n=((await this.s.storage.get("n"))||0)+1; await this.s.storage.put("n", n);
    await this.log({mode, n, info: info===undefined? "undefined": info, id: this.s.id.toString().slice(0,6), cur: await this.s.storage.getAlarm()});
    if (mode==="throw") throw new Error("boom "+n);
    if (mode==="rearm" && n<4) await this.s.storage.setAlarm(Date.now()+500);
    if (mode==="rearm-throw-retryinfo") { throw new Error("x"); }
  } }
export default { async fetch(req,env){ const u=new URL(req.url); return env.D.get(env.D.idFromName(u.searchParams.get("name")||"a")).fetch(req); } }`;
function mk(persist) {
  return new Miniflare({ modules: true, compatibilityDate: "2026-07-01", script,
    durableObjects: { D: { className: "D", useSQLite: true } }, durableObjectsPersist: persist,
    serviceBindings: { LOG: async (req) => { const o = JSON.parse(await req.text()); logs.push({ at: t(), ...o }); console.log(t(), JSON.stringify(o)); return new Response("ok"); } } });
}
const P = SP + "/data/s3-" + Date.now();
let mf = mk(P);
const arm = async (name, mode, ms) => { const r = await mf.dispatchFetch(`http://x/?name=${name}&mode=${mode}&ms=${ms}`); console.log(t(), "ARM", name, mode, ms, await r.text()); };
console.log("== past alarm"); await arm("past", "ok", -5000); await sleep(3000);
console.log("== rearm inside handler"); await arm("rearm", "rearm", 200); await sleep(6000);
console.log("== throwing alarm (observe 150s)"); await arm("throw", "throw", 200); await sleep(150000);
console.log("== persistence: alarm 25s ahead, dispose at +3s, restart after 40s total");
await arm("persist", "ok", 25000); await sleep(3000);
await mf.dispose(); console.log(t(), "disposed"); await sleep(37000);
mf = mk(P); await mf.ready; console.log(t(), "restarted (alarm was due at +25s, so overdue)");
await sleep(8000);
console.log("== persistence 2: alarm 20s ahead, dispose at +2s, restart at +5s (before due)");
await arm("persist2", "ok", 20000); await sleep(2000); await mf.dispose(); console.log(t(), "disposed");
await sleep(3000); mf = mk(P); await mf.ready; console.log(t(), "restarted early (alarm not yet due)");
await sleep(25000);
await mf.dispose();
console.log(JSON.stringify(logs));
