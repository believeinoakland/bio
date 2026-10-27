import { WorkflowEntrypoint, DurableObject } from "cloudflare:workers";
export class Ctr extends DurableObject {
  constructor(s, e) { super(s, e); this.sql = s.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS att(wf TEXT, step TEXT, t REAL)"); this.sql.exec("CREATE TABLE IF NOT EXISTS runs(wf TEXT, step TEXT, n INTEGER, t REAL, PRIMARY KEY(wf,step))"); }
  hit(wf, step) { const t = Date.now(); this.sql.exec('INSERT INTO att VALUES(?,?,?)', wf, step, t);
    this.sql.exec("INSERT INTO runs VALUES(?,?,1,?) ON CONFLICT(wf,step) DO UPDATE SET n=n+1, t=?", wf, step, t, t);
    return this.sql.exec("SELECT n FROM runs WHERE wf=? AND step=?", wf, step).one().n; }
  atts(wf) { return this.sql.exec('SELECT step,t FROM att WHERE wf=? ORDER BY t', wf).toArray(); }
  dump(wf) { return this.sql.exec("SELECT step,n,t FROM runs WHERE wf=? ORDER BY t", wf).toArray(); }
}
const ctr = (env) => env.CTR.get(env.CTR.idFromName("c"));
export class Fifty extends WorkflowEntrypoint {
  async run(event, step) {
    const id = event.instanceId; const slow = event.payload.slowMs || 0;
    for (let i = 0; i < 50; i++) {
      await step.do("s" + i, async () => { const n = await ctr(this.env).hit(id, "s" + i);
        if (slow) await new Promise(r => setTimeout(r, slow)); return { i, n }; });
    }
    return "done";
  }
}
export class Flaky extends WorkflowEntrypoint {
  async run(event, step) {
    const id = event.instanceId;
    const r = await step.do("flaky", { retries: { limit: 5, delay: "1 second", backoff: "exponential" } }, async () => {
      const n = await ctr(this.env).hit(id, "flaky"); if (n <= 2) throw new Error("boom " + n); return { ok: n }; });
    await step.do("after", async () => { await ctr(this.env).hit(id, "after"); return 1; });
    return r;
  }
}
export class Big extends WorkflowEntrypoint {
  async run(event, step) {
    const n = event.payload.bytes;
    const r = await step.do("big", { retries: { limit: 0, delay: 1 } }, async () => event.payload.kind === 'str' ? 'a'.repeat(n) : event.payload.kind === 'obj' ? { s: 'a'.repeat(n - 8) } : new Uint8Array(n));
    return r.length;
  }
}
export default {
  async fetch(req, env) {
    const u = new URL(req.url); const wfn = u.searchParams.get("wf"); const id = u.searchParams.get("id");
    const W = { Fifty: env.FIFTY, Flaky: env.FLAKY, Big: env.BIG }[wfn];
    if (u.pathname === "/create") { const i = await W.create({ id, params: JSON.parse(u.searchParams.get("p") || "{}") }); return Response.json({ id: i.id }); }
    if (u.pathname === "/status") { const i = await W.get(id); return Response.json(await i.status()); }
    if (u.pathname === "/op") { const i = await W.get(id); try { await i[u.searchParams.get("op")](); return Response.json({ok:1}); } catch (e) { return Response.json({err:String(e)}); } }
    if (u.pathname === "/atts") return Response.json(await ctr(env).atts(id));
    if (u.pathname === "/dump") return Response.json(await ctr(env).dump(id));
    return new Response("?", { status: 404 });
  }
};
