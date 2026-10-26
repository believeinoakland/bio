import { Miniflare, sleep, SP, workerdRss } from "./mf.mjs";
const script = `
export class D { constructor(s,env){this.s=s;this.sql=s.storage.sql;
  this.sql.exec("CREATE TABLE IF NOT EXISTS t(id INTEGER PRIMARY KEY, b BLOB, s TEXT)");
  this.sql.exec("CREATE TABLE IF NOT EXISTS r(id INTEGER PRIMARY KEY, b BLOB)"); }
  async fetch(req){ const u=new URL(req.url); const op=u.pathname.slice(1); const out={op};
    const attempt=(label,fn)=>{ const t0=Date.now(); try{ const v=fn(); out[label]={ok:true,v,ms:Date.now()-t0}; }catch(e){ out[label]={ok:false,name:e.name,err:String(e.message).slice(0,200),ms:Date.now()-t0}; } };
    const MB=1048576;
    if(op==="sizes"){
      for(const [label,n] of [["blob_1.9MB",1.9*MB|0],["blob_2.0MB",2*MB],["blob_2.1MB",2.1*MB|0],["blob_10MB",10*MB]]){
        attempt(label,()=>{ this.sql.exec("INSERT INTO t(b) VALUES (?)", new Uint8Array(n)); return n; }); }
      for(const [label,n] of [["text_1.9MB",1.9*MB|0],["text_2.1MB",2.1*MB|0],["text_10MB",10*MB]]){
        attempt(label,()=>{ this.sql.exec("INSERT INTO t(s) VALUES (?)", "a".repeat(n)); return n; }); }
      attempt("row_two_cols_1.5MB_each",()=>{ this.sql.exec("INSERT INTO t(b,s) VALUES (?,?)", new Uint8Array(1.5*MB|0), "a".repeat(1.5*MB|0)); return 3*MB; });
      attempt("readback_1.9MB",()=>{ const r=this.sql.exec("SELECT length(b) l FROM t WHERE length(b)=?", 1.9*MB|0).toArray(); return r.length; });
      attempt("readback_blob_full",()=>{ const r=this.sql.exec("SELECT b FROM t WHERE length(b)=?", 1.9*MB|0).one(); return r.b.byteLength; });
    }
    if(op==="stmt"){
      for(const n of [50000,100000,102400,102500,150000]){
        attempt("stmt_len_"+n,()=>{ const pad=" ".repeat(n-"SELECT 1".length); const rows=this.sql.exec("SELECT 1"+pad).toArray(); return rows.length; }); }
      for(const n of [1000,100000,200000]){
        attempt("stmt_with_literal_"+n,()=>{ const q="SELECT length('"+"a".repeat(n)+"') l"; return [q.length,this.sql.exec(q).one().l]; }); }
    }
    if(op==="like"){
      for(const n of [10,49,50,51,100,1000]){
        attempt("like_pat_"+n,()=>{ const p="%"+"a".repeat(n-1); return this.sql.exec("SELECT 'a' LIKE ? AS m, ? AS p", p, p).toArray().length; }); }
      attempt("like_pat_50_literal",()=>this.sql.exec("SELECT 'xxx' LIKE '"+"a".repeat(60)+"'").toArray().length);
      attempt("glob_pat_100",()=>this.sql.exec("SELECT 'xxx' GLOB ?", "*"+"a".repeat(99)).toArray().length);
    }
    if(op==="bulk"){ const mode=u.searchParams.get("mode"); const N=100000; const row=new Uint8Array(1024).fill(7);
      this.sql.exec("DELETE FROM r"); const t0=Date.now(); const s0=this.sql.databaseSize;
      if(mode==="onetxn"){ this.s.storage.transactionSync(()=>{ for(let i=0;i<N;i++) this.sql.exec("INSERT INTO r(b) VALUES (?)", row); }); }
      else if(mode==="batch"){ const B=Number(u.searchParams.get("b")); for(let i=0;i<N;i+=B) this.s.storage.transactionSync(()=>{ for(let j=0;j<B;j++) this.sql.exec("INSERT INTO r(b) VALUES (?)", row); }); }
      else if(mode==="auto"){ for(let i=0;i<N;i++) this.sql.exec("INSERT INTO r(b) VALUES (?)", row); }
      else if(mode==="multirow"){ const B=Number(u.searchParams.get("b")); const ph=Array(B).fill("(?)").join(","); const args=Array(B).fill(row); for(let i=0;i<N;i+=B) this.sql.exec("INSERT INTO r(b) VALUES "+ph, ...args); }
      out.ms=Date.now()-t0; out.n=this.sql.exec("SELECT count(*) c FROM r").one().c; out.dbSizeBefore=s0; out.dbSizeAfter=this.sql.databaseSize; out.mode=mode; }
    if(op==="size"){ out.dbSize=this.sql.databaseSize; }
    return Response.json(out); } }
export default { async fetch(req,env){ return env.D.get(env.D.idFromName("a")).fetch(req); } }`;
const mf = new Miniflare({ modules: true, compatibilityDate: "2026-07-01", script, durableObjects: { D: { className: "D", useSQLite: true } }, durableObjectsPersist: SP + "/data/s4-" + Date.now() });
const call = async (p) => { const t = Date.now(); const r = await mf.dispatchFetch("http://x/" + p); const txt = await r.text(); let j; try { j = JSON.parse(txt); } catch { j = { status: r.status, body: txt.slice(0, 300) }; } j.wallMs = Date.now() - t; j.workerdRssMB = workerdRss(); console.log(JSON.stringify(j)); };
for (const p of ["sizes", "stmt", "like", "size"]) await call(p);
for (const p of ["bulk?mode=onetxn", "bulk?mode=batch&b=1000", "bulk?mode=batch&b=100", "bulk?mode=multirow&b=50", "bulk?mode=auto"]) await call(p);
await call("size");
await mf.dispose();
