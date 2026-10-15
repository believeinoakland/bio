// K3434: wipe this account's Civicsmith so the 0.85.0 installer can install biosmoke8.
// Account 20b5…7f72 only. Keeps newgroup and civicsmith-site. Reads what is there first and last.
const A = '20b533579290b9b93168345edd3b7f72';
const B = `https://api.cloudflare.com/client/v4/accounts/${A}`;
const KEEP = new Set(['newgroup', 'civicsmith-site']);
const WORKERS = ['civicos', 'bobux', 'biosmoke7', 'agent-worker', 'agent-runner', 'pdf-worker', 'ocr-worker', 'sheet-worker', 'file-scanner'];
const BUCKETS = ['bio-captures', 'bio-published'];
const DRY = process.argv.includes('--dry');

async function cf(method, path) {
  const r = await fetch(B + path, { method });
  const d = await r.json().catch(() => ({ success: false, errors: [{ message: `HTTP ${r.status}` }] }));
  if (!d.success) throw new Error(`${method} ${path}: ${JSON.stringify(d.errors)}`);
  return d;
}
async function inventory(label) {
  const w = (await cf('GET', '/workers/scripts')).result.map((s) => s.id);
  const c = (await cf('GET', '/containers/applications')).result.map((x) => `${x.name}(${x.id})`);
  const n = (await cf('GET', '/workers/durable_objects/namespaces')).result.map((x) => x.name);
  const b = (await cf('GET', '/r2/buckets')).result.buckets.map((x) => x.name);
  console.log(`== ${label}\n workers: ${w.join(', ')}\n containers: ${c.join(', ') || '-'}\n DO: ${n.join(', ') || '-'}\n buckets: ${b.join(', ') || '-'}`);
  return { w, b };
}
async function step(what, fn) {
  if (DRY) return console.log(`would ${what}`);
  try { await fn(); console.log(`done   ${what}`); } catch (e) { console.log(`FAILED ${what}: ${e.message}`); }
}

const before = await inventory('before');
for (const w of WORKERS) {
  if (KEEP.has(w)) throw new Error('refusing a kept worker');
  if (before.w.includes(w)) await step(`delete worker ${w} (with its Durable Objects)`, () => cf('DELETE', `/workers/scripts/${w}?force=true`));
}
for (const x of (await cf('GET', '/containers/applications')).result)
  await step(`delete container application ${x.name}`, () => cf('DELETE', `/containers/applications/${x.id}`));
for (const b of BUCKETS) {
  if (!before.b.includes(b)) continue;
  let n = 0, cursor = '';
  do {
    const d = await cf('GET', `/r2/buckets/${b}/objects?per_page=1000${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);
    for (const o of d.result) { if (!DRY) await cf('DELETE', `/r2/buckets/${b}/objects/${encodeURIComponent(o.key)}`); n++; }
    cursor = d.result_info?.is_truncated ? d.result_info.cursor : '';
  } while (cursor);
  console.log(`${DRY ? 'would empty' : 'emptied'} ${b}: ${n} objects`);
  await step(`delete bucket ${b}`, () => cf('DELETE', `/r2/buckets/${b}`));
}
await inventory('after');
