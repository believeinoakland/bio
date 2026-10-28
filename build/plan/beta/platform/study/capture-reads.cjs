// records, per screen and role, the API requests (method+path+query) the page makes on load -> reads-<role>.json
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs=require('fs');
const env=Object.fromEntries(fs.readFileSync(__dirname+'/cred.env','utf8').trim().split('\n').map(l=>l.split(/=(.*)/s).slice(0,2)));
const B='https://plat-s1.believeinoakland.workers.dev', PROJ='PROJ-2026-7919-plat-s1-study-project';
(async()=>{
 const b=await chromium.launch({proxy:{server:process.env.HTTPS_PROXY}});
 for(const role of ['member']){
  const [hk,pk]=role==='admin'?['ADMIN_HANDLE','ADMIN_PW']:['MEMBER_HANDLE','MEMBER_PW'];
  const ctx=await b.newContext(); const p=await ctx.newPage();
  await p.goto(B+'/'); await p.waitForTimeout(5000); await p.fill('#fs-handle',env[hk]); await p.fill('#fs-pw',env[pk]); await p.click('[data-act="login"]'); await p.waitForURL(/\/app/,{timeout:30000});
  let doc=(role==='member'?JSON.parse(fs.readFileSync(__dirname+'/reads-admin.json')).doc:null); const out={};
  const screens=[['home','/app'],['queue','/app/queue'],['held','/app/held'],['inbox','/app/inbox'],['add','/app/capture/address/'+PROJ],['projects','/app/projects'],['project','/app/project/'+PROJ],['document',null]];
  for(const [name,path0] of screens){
   let path=path0;
   if(name==='document'){ if(!doc){out[name]=[];continue} path='/app/document/'+doc; }
   const reqs=[]; const h=r=>{const u=new URL(r.url()); if(u.pathname.startsWith('/api')) reqs.push(r.method()+' '+u.pathname+u.search)}; p.on('request',h);
   await p.goto(B+path); await p.waitForTimeout(9000); p.off('request',h);
   out[name]=[...new Set(reqs)];
   if(name==='project'){ doc=await p.evaluate(()=>{const a=[...document.querySelectorAll('a[href^="/app/document/"]')][0];return a?a.getAttribute('href').split('/').pop():null}); }
  }
  fs.writeFileSync(`${__dirname}/reads-${role}.json`,JSON.stringify({doc,out},null,1));
  console.log(role,'doc',doc,Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v.length])));
  await ctx.close();
 }
 await b.close();
})().catch(e=>console.log('ERR',e.message.split('\n')[0]));
