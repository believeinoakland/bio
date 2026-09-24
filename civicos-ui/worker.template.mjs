const B64="__APP_HTML_BASE64__";  // injected at build from app.html
const BUILD_ID="__BUILD_ID__";      // sha of app.html, injected at build
const APP_HTML=new TextDecoder().decode(Uint8Array.from(atob(B64),c=>c.charCodeAt(0)));
/* The OFL faces in civicos-ui/fonts/, embedded at build (build-worker.mjs) as {file: base64}.
   Served from this origin so the app never fetches a face from anyone else: a sovereign
   install must render offline, and an outside font request is a network tell (tokens.css). */
const FONTS=__FONTS_JSON__;
export default {
  async fetch(req, env){
    const url=new URL(req.url); const p=url.pathname;
    if(p==="/"||p==="/civicos"||p==="/civicos/"){
      return new Response(APP_HTML,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store"}});
    }
    if(p.startsWith("/fonts/")){
      const b=Object.prototype.hasOwnProperty.call(FONTS,p.slice(7))?FONTS[p.slice(7)]:null;
      if(!b) return new Response("Not found",{status:404});
      return new Response(Uint8Array.from(atob(b),c=>c.charCodeAt(0)),{headers:{"content-type":"font/woff2","cache-control":"public, max-age=31536000, immutable"}});
    }
    if(p==="/build"){
      return new Response(BUILD_ID,{headers:{"content-type":"text/plain","cache-control":"no-store"}});
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
