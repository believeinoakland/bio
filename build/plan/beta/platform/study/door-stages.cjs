// usage: node door-stages.cjs <C> <n> <tag> [member]  — drives the project's Add door with C parallel browser uploaders, n files each batch total
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const env=Object.fromEntries(fs.readFileSync(__dirname+'/cred.env','utf8').trim().split('\n').map(l=>l.split(/=(.*)/s).slice(0,2)));
const [C,N,TAG,WHO]=[Number(process.argv[2]),Number(process.argv[3]),process.argv[4],process.argv[5]];
const [hk,pk]=WHO==='member'?['MEMBER_HANDLE','MEMBER_PW']:['ADMIN_HANDLE','ADMIN_PW'];
const BASE='https://plat-s1.believeinoakland.workers.dev', PROJ='PROJ-2026-7919-plat-s1-study-project';
const srcs=fs.readdirSync(__dirname+'/files').map(f=>__dirname+'/files/'+f).sort();
const timing=h=>{const o={};for(const part of String(h||'').split(',')){const [n,...p]=part.trim().split(';');const d=p.find(x=>x.trim().startsWith('dur='));if(n&&d)o[n.trim()]=Number(d.trim().slice(4));}return o};
(async()=>{
 const b=await chromium.launch({proxy:{server:process.env.HTTPS_PROXY}});
 const c0=await b.newContext(); const p0=await c0.newPage();
 await p0.goto(BASE+'/'); await p0.waitForTimeout(5000);
 await p0.fill('#fs-handle',env[hk]); await p0.fill('#fs-pw',env[pk]); await p0.click('[data-act="login"]'); await p0.waitForURL(/\/app/,{timeout:30000});
 const state=await c0.storageState(); await c0.close();
 let next=0; const out=[];
 const worker=async(w)=>{
  const ctx=await b.newContext({storageState:state}); const page=await ctx.newPage();
  const ops=[]; const t0s=new Map();
  page.on('request',r=>{ if(r.url().includes('/api/?op='))t0s.set(r,Date.now()); });
  page.on('response',async r=>{const rq=r.request();if(!t0s.has(rq))return;const m=r.url().match(/op=([a-z]+)/);const h=await r.allHeaders().catch(()=>({}));ops.push({op:m&&m[1],status:r.status(),start:t0s.get(rq),end:Date.now(),t:timing(h['server-timing'])});});
  while(next<N){
   const i=next++; const buf=Buffer.concat([fs.readFileSync(srcs[i%srcs.length]),crypto.randomBytes(8)]);
   const f=`/tmp/stg-${TAG}-${i}.txt`; fs.writeFileSync(f,buf);
   await page.goto(`${BASE}/app/capture/address/${PROJ}`); await page.waitForTimeout(7000);
   await page.getByText('A file or photo',{exact:false}).first().click(); await page.waitForTimeout(1500);
   await page.setInputFiles('#ci-file',f); await page.click('#ci-how-made'); await page.fill('#ci-where','plat3 stage study'); await page.fill('#ci-what','generated text for timing');
   ops.length=0; const tc=Date.now();
   await page.click('button[data-act="captureupload"]');
   let ok=true; try{ await page.getByText(/Captured:|already held exactly/).first().waitFor({timeout:45000}); }catch{ ok=false; }
   const wall=Date.now()-tc; await page.waitForTimeout(500);
   const shown=ok?null:(await page.innerText('body').catch(()=>'')).replace(/\s+/g,' ').slice(0,400);
   out.push({C,w,i,size:buf.length,ok,wall,shown,ops:ops.filter(o=>['captureupload','promote'].includes(o.op)).map(o=>({op:o.op,status:o.status,from:o.start-tc,ms:o.end-o.start,t:o.t}))});
   fs.unlinkSync(f);
  }
  await ctx.close();
 };
 await Promise.all(Array.from({length:C},(_,w)=>worker(w)));
 fs.writeFileSync(__dirname+`/door-${TAG}.json`,JSON.stringify(out,null,1));
 console.log('done',TAG,'ok',out.filter(o=>o.ok).length+'/'+out.length);
 await b.close();
})().catch(e=>{console.log('ERR',e.message.split('\n')[0]);process.exit(1)});
