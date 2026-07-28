const B64="__APP_HTML_BASE64__";  // injected at build from app.html
const APP_HTML=new TextDecoder().decode(Uint8Array.from(atob(B64),c=>c.charCodeAt(0)));
export default {
  async fetch(req, env){
    const url=new URL(req.url); const p=url.pathname;
    if(p==="/"||p==="/civicos"||p==="/civicos/"){
      return new Response(APP_HTML,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store"}});
    }
    if(p==="/api"||p.startsWith("/api/")){
      const target="https://biosmoke7.believeinoakland.workers.dev"+p+url.search;
      const init={method:req.method,headers:{}};
      const ct=req.headers.get("content-type"); if(ct) init.headers["content-type"]=ct;
      if(req.method!=="GET"&&req.method!=="HEAD") init.body=await req.arrayBuffer();
      const r=await env.PLANE.fetch(new Request(target, init)); const buf=await r.arrayBuffer();
      const h=new Headers(); h.set("content-type", r.headers.get("content-type")||"application/json");
      return new Response(buf,{status:r.status,headers:h});
    }
    return new Response("Not found",{status:404});
  }
};
