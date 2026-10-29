// mixed ramp: N virtual members (member token) + 1 administrator walker per 10 (admin token) + 1 upload/min; steps given; stop rule: errors > 1%
// usage: node ramp3.cjs <label> <stepSeconds> <n1,n2,...>
const https=require('https'),fs=require('fs'),crypto=require('crypto');const {createRequire}=require('module');
const {HttpsProxyAgent}=createRequire('/opt/node-tools/node_modules/')('https-proxy-agent');
const agent=new HttpsProxyAgent(process.env.HTTPS_PROXY,{keepAlive:true,maxSockets:200});
const D=__dirname, tok={admin:fs.readFileSync(D+'/admin.tok','utf8').trim(),member:fs.readFileSync(D+'/member.tok','utf8').trim()};
const reads={admin:JSON.parse(fs.readFileSync(D+'/reads-admin.json')).out,member:JSON.parse(fs.readFileSync(D+'/reads-member.json')).out};
const HOST='plat-s1.believeinoakland.workers.dev';
const [label,stepSec,steps]=[process.argv[2],Number(process.argv[3]),process.argv[4].split(',').map(Number)];
const MIX=[['home',25],['queue',15],['project',35],['projects',10],['held',5],['inbox',5],['add',5]];          // member: Document (15%) folded into Project
const AMIX=[['home',25],['queue',20],['project',30],['document',25]];
const pick=m=>{let r=Math.random()*m.reduce((a,b)=>a+b[1],0);for(const [n,w] of m){if((r-=w)<0)return n}return m[0][0]};
const exp=mean=>-Math.log(1-Math.random())*mean;
const req=(role,line)=>new Promise(res=>{const [m,path]=line.split(' ');const t0=Date.now();
 const body=m==='POST'?Buffer.from(JSON.stringify({step:'state'})):null;  // the page posts {step:'state'} to subscriptionsignin
 const r=https.request({host:HOST,path,method:m,agent,headers:{authorization:'Bearer '+tok[role],...(body?{'content-type':'application/json','content-length':body.length}:{})}},x=>{x.on('data',()=>{});x.on('end',()=>res({s:x.statusCode,ms:Date.now()-t0}))});
 r.setTimeout(60000,()=>r.destroy(new Error('timeout')));r.on('error',()=>res({s:0,ms:Date.now()-t0}));r.end(body);});
const frame=async(role,name)=>{const t0=Date.now();const rs=await Promise.all((reads[role][name]||[]).map(l=>req(role,l)));return {role,name,ms:Date.now()-t0,n:rs.length,bad:rs.filter(r=>r.s===0||r.s>=500).length,st:rs.filter(r=>r.s===0||r.s>=500).map(r=>r.s)}};
const files=fs.readdirSync(D+'/files').map(f=>D+'/files/'+f).filter(f=>fs.statSync(f).size<=300*1024||true).slice(0,1);
const upload=()=>new Promise(res=>{const body=Buffer.concat([fs.readFileSync(D+'/files/stage-0.txt'),crypto.randomBytes(8)]);const t0=Date.now();
 const q=new URLSearchParams({op:'captureupload',statement:'How you got it: generated for a ramp.\nWhere and when: test container, 2026-10-28.\nWhat it shows, in your own words: generated text.',name:'ramp-'+Date.now()+'.txt',type:'text/plain'});
 const r=https.request({host:HOST,path:'/api/?'+q,method:'POST',agent,headers:{authorization:'Bearer '+tok.member,'content-type':'application/octet-stream','content-length':body.length}},x=>{x.on('data',()=>{});x.on('end',()=>res({s:x.statusCode,ms:Date.now()-t0}))});
 r.setTimeout(150000,()=>r.destroy(new Error('timeout')));r.on('error',()=>res({s:0,ms:Date.now()-t0}));r.end(body);});
const med=(a,p=.5)=>{a=[...a].sort((x,y)=>x-y);return a.length?a[Math.min(a.length-1,Math.floor(a.length*p))]:null};
(async()=>{
 const all=[];
 for(const N of steps){
  const W=Math.max(1,Math.round(N/10)), t_end=Date.now()+stepSec*1000, rec=[], ups=[]; const t_start=new Date().toISOString().slice(11,19);
  const walker=async(role,m)=>{await new Promise(r=>setTimeout(r,Math.random()*30000));while(Date.now()<t_end){rec.push(await frame(role,pick(m)));await new Promise(r=>setTimeout(r,exp(30000)))}};
  const upl=async()=>{await new Promise(r=>setTimeout(r,5000));while(Date.now()<t_end){ups.push(await upload());await new Promise(r=>setTimeout(r,60000))}};
  await Promise.all([...Array.from({length:N},()=>walker('member',MIX)),...Array.from({length:W},()=>walker('admin',AMIX)),upl()]);
  const reqs=rec.reduce((a,f)=>a+f.n,0), bad=rec.reduce((a,f)=>a+f.bad,0);
  const sum={label,members:N,adminWalkers:W,start:t_start,end:new Date().toISOString().slice(11,19),frames:rec.length,requests:reqs,errors:bad,errPct:+(100*bad/reqs).toFixed(2),errStatuses:Object.fromEntries(rec.flatMap(f=>f.st).reduce((m,s)=>m.set(s,(m.get(s)||0)+1),new Map())),
   member:Object.fromEntries(MIX.map(([n])=>{const v=rec.filter(f=>f.role==='member'&&f.name===n).map(f=>f.ms);return [n,v.length?[v.length,med(v),med(v,.9)]:null]})),
   admin:Object.fromEntries(AMIX.map(([n])=>{const v=rec.filter(f=>f.role==='admin'&&f.name===n).map(f=>f.ms);return [n,v.length?[v.length,med(v),med(v,.9)]:null]})),
   uploads:ups.map(u=>[u.s,u.ms])};
  console.log(JSON.stringify(sum)); all.push(sum);
  if(sum.errPct>1 && !process.env.NOSTOP){console.log('STOP RULE: errors over 1%');break}
 }
 fs.writeFileSync(D+`/ramp-${label}.json`,JSON.stringify(all,null,1));
})();
