import fs from 'fs';
const j = JSON.parse(fs.readFileSync('/home/user/bio/build/modules.json','utf8'));
const mods = Array.isArray(j) ? j : (j.modules || Object.values(j));
const mine = ['local-facts','standards','conformance','consequences','action-grammar','actions','action-clocks','filing-templates','filings','escalation','action-plans'];
for (const id of mine) {
  const m = mods.find(x=>x.id===id);
  if(!m){console.log(id,'NOT FOUND');continue;}
  const usedBy = mods.filter(x=>(x.uses||[]).includes(id)).map(x=>x.id+'('+x.layer+')');
  console.log(`### ${id} layer=${m.layer}\n paths=${JSON.stringify(m.paths)}\n tests=${JSON.stringify(m.tests)}\n uses=${(m.uses||[]).join(', ')}\n usedBy=${usedBy.join(', ')}\n other=${JSON.stringify(Object.fromEntries(Object.entries(m).filter(([k])=>!['id','layer','paths','tests','uses'].includes(k))))}`);
}
