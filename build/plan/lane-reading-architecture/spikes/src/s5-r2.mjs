import { Miniflare, sleep, SP, workerdRss } from "./mf.mjs";
const script = `
const MiB=1048576;
function fillBuf(n,seed){ const b=new Uint8Array(n); for(let i=0;i<n;i+=4096) b[i]=(seed+i/4096)&255; return b; }
async function sum(ab){ const d=await crypto.subtle.digest("SHA-256", ab); return [...new Uint8Array(d).slice(0,4)].map(x=>x.toString(16).padStart(2,"0")).join(""); }
export default { async fetch(req, env) {
  const u=new URL(req.url); const op=u.pathname.slice(1); const key=u.searchParams.get("key")||"big"; const R=env.R; const t0=Date.now(); const out={op};
  try {
  if(op==="mp"){ // multipart upload of N parts of partMiB
    const parts=Number(u.searchParams.get("parts")), part=Number(u.searchParams.get("partBytes")), lastBytes=Number(u.searchParams.get("lastBytes")||part);
    const up=await R.createMultipartUpload(key); const done=[]; const per=[];
    for(let i=1;i<=parts;i++){ const t1=Date.now(); const n=i===parts?lastBytes:part; done.push(await up.uploadPart(i, fillBuf(n,i))); per.push(Date.now()-t1); }
    out.partMs=per; const t2=Date.now();
    try { const o=await up.complete(done); out.complete="ok"; out.size=o.size; } catch(e){ out.complete="FAILED: "+e.message; out.code=e.code; }
    out.completeMs=Date.now()-t2; }
  if(op==="putfixed"){ const total=Number(u.searchParams.get("bytes")); const fls=new FixedLengthStream(total);
    const chunk=fillBuf(MiB,3); (async()=>{ const w=fls.writable.getWriter(); for(let w0=0;w0<total;w0+=MiB){ await w.write(chunk.subarray(0,Math.min(MiB,total-w0))); } await w.close(); })();
    const o=await R.put(key, fls.readable); out.size=o.size; }
  if(op==="range"){ const total=Number(u.searchParams.get("total")), L=Number(u.searchParams.get("len")); const per=[]; let h=[];
    for(let off=0;off<total;off+=L){ const t1=Date.now(); const o=await R.get(key,{range:{offset:off,length:Math.min(L,total-off)}}); const ab=await o.arrayBuffer(); per.push([off/MiB,ab.byteLength,Date.now()-t1]); h.push(await sum(ab)); }
    out.ranges=per.length; out.perRange=per; out.firstHash=h.slice(0,3); out.sumMs=per.reduce((a,x)=>a+x[2],0); }
  if(op==="streamall"){ const o=await R.get(key); const rd=o.body.getReader(); let n=0; for(;;){ const {done,value}=await rd.read(); if(done)break; n+=value.byteLength; } out.bytes=n; }
  if(op==="whole"){ const o=await R.get(key); const ab=await o.arrayBuffer(); out.bytes=ab.byteLength; }
  if(op==="head"){ const o=await R.head(key); out.size=o&&o.size; }
  } catch(e){ out.error=String(e.message); out.code=e.code; }
  out.ms=Date.now()-t0; return Response.json(out); } }`;
const mf = new Miniflare({ modules: true, compatibilityDate: "2026-07-01", script, r2Buckets: ["R"], r2Persist: SP + "/data/s5-" + Date.now() });
await mf.ready;
async function call(path, label) {
  let peak = 0, run = true; const base = workerdRss();
  const sampler = (async () => { while (run) { peak = Math.max(peak, workerdRss()); await sleep(40); } })();
  const t = Date.now(); const r = await mf.dispatchFetch("http://x/" + path); const j = await r.json(); run = false; await sampler;
  j.wallMs = Date.now() - t; j.rssBaseMB = base; j.rssPeakMB = peak; j.rssAfterMB = workerdRss(); j.label = label;
  const s = JSON.stringify(j); console.log(s.length > 1500 ? s.slice(0, 1500) + "…" : s); return j;
}
const MiB = 1048576;
await call(`mp?key=big&parts=10&partBytes=${10 * MiB}`, "multipart 10x10MiB = 100MiB");
await call(`head?key=big`, "head");
await call(`mp?key=small&parts=3&partBytes=${1 * MiB}`, "multipart 3 parts of 1MiB (non-last <5MiB)");
await call(`mp?key=small1&parts=1&partBytes=${1 * MiB}`, "multipart 1 part of 1MiB (single=last)");
await call(`mp?key=uneven&parts=3&partBytes=${6 * MiB}&lastBytes=${7 * MiB}`, "multipart last part larger than others");
await call(`putfixed?key=fixed100&bytes=${100 * MiB}`, "put 100 MiB via FixedLengthStream");
// fresh instance for memory comparisons? use same instance but separate steps
await call(`range?key=big&total=${100 * MiB}&len=${8 * MiB}`, "13 ranges of 8MiB, sequential, arrayBuffer each");
await call(`range?key=big&total=${100 * MiB}&len=${8 * MiB}`, "second pass");
await call(`streamall?key=big`, "stream whole 100MiB chunk by chunk");
await call(`whole?key=big`, "arrayBuffer whole 100MiB");
await call(`range?key=big&total=${100 * MiB}&len=${1 * MiB}`, "100 ranges of 1MiB");
await mf.dispose();
