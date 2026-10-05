import fs from 'fs';
const j = JSON.parse(fs.readFileSync('/home/user/bio/build/modules.json','utf8'));
const mods = Array.isArray(j) ? j : (j.modules || Object.values(j));
const mine = ['jurisdictions','id-spaces','docprofile','office-readers','odf-reader','extraction','content','entities','connections','progressions','bias'];
for (const id of mine) {
  const m = mods.find(x => x.id === id);
  if (!m) { console.log(id, 'NOT FOUND'); continue; }
  const usedBy = mods.filter(x => (x.uses||[]).includes(id)).map(x => `${x.id}(L${x.layer})`);
  console.log(`\n### ${id} layer=${m.layer}\n paths=${JSON.stringify(m.paths)}\n uses=${JSON.stringify(m.uses)}\n usedBy=${usedBy.join(', ')}`);
}
