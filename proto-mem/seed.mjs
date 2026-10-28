#!/usr/bin/env node
/* proto-mem (THROWAWAY): seeds a persisted room through the product's own door: N documents of about B bytes each (op=captureupload + op=promote), reads them all (pending-work ticked by hand until
   nothing is due), then registers ONE more unread 1.9 MB document so that pending-work has an owed reading. The state is left on disk in --dir for measure-consumers.mjs.
   node proto-mem/seed.mjs --dir=/path --docs=100 --bytes=100000 */
import { mkdirSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
process.env.PROTO_MEM_TOKEN ||= randomBytes(24).toString("hex");
const { start, makeText, uploadFile, promoteDoc, snapOf, sleep } = await import("./lib.mjs");
const arg = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const dir = arg.dir, DOCS = Number(arg.docs || 100), BYTES = Number(arg.bytes || 100000);
if (!dir) { console.error("--dir required"); process.exit(2); }
mkdirSync(dir, { recursive: true });
const bundle = "/home/user/wt-chain/proto-mem/dist/meas.bundled.mjs";
const w = await start({ bundle, env: { MEAS_GATE: "1" }, persist: dir });
await w.meas("registry"); await w.signin();
const t0 = Date.now(); let ok = 0; const fail = [];
for (let i = 0; i < DOCS; i++) {
  const up = await uploadFile(w, Buffer.from(makeText(BYTES, 1000 + i)), { name: `seed-${i}.txt`, statement: `proto-mem seed ${i}` });
  if (!(up.json && up.json.result && up.json.result.ok)) { fail.push(`up ${i}`); continue; }
  const pr = await promoteDoc(w, up.json.result.document, `seed doc ${i}`);
  if (pr.result && pr.result.ok) ok++; else fail.push(`promote ${i}: ${JSON.stringify(pr.result).slice(0, 100)}`);
  if (i % 50 === 49) console.error(`seeded ${i + 1} (${Math.round((Date.now() - t0) / 1000)} s) rss ${snapOf(w).rss}`);
}
let ticks = 0;
for (; ticks < 5000; ticks++) { const t = await w.meas("tick", { name: "pending-work" }); if (!t.was_due) break; }
const owed = await uploadFile(w, Buffer.from(makeText(1_900_000, 77)), { name: "owed.txt", statement: "proto-mem owed reading" });
const po = await promoteDoc(w, owed.json.result.document, "owed reading");
const cnt = async (t) => (await w.meas("sql", { sql: `SELECT count(*) n FROM ${t}` }))[0].n;
const summary = { docs_asked: DOCS, bytes_each: BYTES, docs_promoted: ok, failures: fail.slice(0, 5), read_ticks: ticks, seed_s: Math.round((Date.now() - t0) / 1000), capture_text_rows: await cnt("capture_text"), capture_text_fts_rows: await cnt("capture_text_fts"),
  keeps_pending_rows: await cnt("keeps_pending"), owed_reading_registered: !!(po.result && po.result.ok), rss_at_end: snapOf(w).rss, session: w.getSession() };
const { session, ...pub } = summary;
writeFileSync(dir + "/seed-summary.json", JSON.stringify(pub, null, 1));
writeFileSync(dir + "/session.txt", session); writeFileSync(dir + "/token.txt", process.env.PROTO_MEM_TOKEN, { mode: 0o600 });   /* a throwaway local session token, never printed */
console.log(JSON.stringify(pub));
await w.close();
