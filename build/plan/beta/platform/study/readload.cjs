// usage: node readload.cjs <op> <concurrency> <rounds> ; admin token ; read-only op
const https=require('https'),fs=require('fs');const {createRequire}=require('module');const req=createRequire('/opt/node-tools/node_modules/');const {HttpsProxyAgent}=req('https-proxy-agent');
const agent=new HttpsProxyAgent(process.env.HTTPS_PROXY),tok=fs.readFileSync(__dirname+'/admin.tok','utf8').trim();
const [op,C,R]=[process.argv[2],+process.argv[3],+process.argv[4]];
const one=()=>new Promise(res=>{const t0=Date.now();const r=https.request(`https://plat-s1.believeinoakland.workers.dev/api/?op=${op}`,{agent,headers:{authorization:'Bearer '+tok}},x=>{let n=0;x.on('data',c=>n+=c.length);x.on('end',()=>res({s:x.statusCode,ms:Date.now()-t0,n}));});r.setTimeout(60000,()=>r.destroy());r.on('error',e=>res({s:0,ms:Date.now()-t0,n:0}));r.end();});
(async()=>{const t0=Date.now();const all=[];for(let i=0;i<R;i++){all.push(...await Promise.all(Array.from({length:C},one)));}
const ms=all.map(a=>a.ms).sort((a,b)=>a-b);console.log(op,'C',C,'rounds',R,'window',new Date(t0).toISOString().slice(11,19),'-',new Date().toISOString().slice(11,19),'statuses',JSON.stringify(all.reduce((o,a)=>(o[a.s]=(o[a.s]||0)+1,o),{})),'p50',ms[Math.floor(ms.length/2)],'max',ms[ms.length-1],'bytes',all[0].n);})();
