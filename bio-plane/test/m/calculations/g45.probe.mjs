/* G45's measure (not run by the suite): the money ingest at N rows in a capped node child, as the E3 harness caps the plane.
   node --expose-gc --max-old-space-size=CAP --import bio-plane/test/platform-sqlite.mjs g45.probe.mjs ROWS [build]
   prints one JSON line. "build" makes the table and the binding and stops (the act's baseline). */
import { seeded, V } from "./fixture.mjs";
const rows = Number(process.argv[2] || 18098), buildOnly = process.argv[3] === "build";
const w = seeded();
w.person("Pat Quill", "P001"); w.person("Lee Quill", "P002");
const parts = ["payer,payee,amount\n"];
for (let i = 0; i < rows; i++) parts.push(`${i % 60 === 0 ? "P001" : "U" + String(i).padStart(6, "0")},P002,${(i % 97) + 1}\n`);
const text = parts.join(""); parts.length = 0;
const t = await w.table(text, [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }],
  { roles: { payer: { role: "payer", scheme: "ellery_person" }, payee: { role: "payee", scheme: "ellery_person" }, amount: { role: "amount" } } });
const b = w.c.adoptBinding({ table: t.sha, roles: { amount: "amount", payer: "payer", payee: "payee", kind: { value: "payment" }, phase: { value: "actual" },
  stage: { value: "paid" }, basis: { value: "cash" }, currency: { value: "USD" }, period: { value: "2025-07-01/2026-06-30" } }, by: V("bob") });
globalThis.gc?.(); globalThis.gc?.();
const idle = process.memoryUsage().heapUsed + process.memoryUsage().arrayBuffers;
if (buildOnly) { console.log(JSON.stringify({ rows, tableBytes: text.length, idleMB: +(idle / 1048576).toFixed(1), maxRssMB: Math.round(process.resourceUsage().maxRSS / 1024) })); process.exit(0); }
const t0 = performance.now();
const r = await w.c.ingestMoney({ binding: b.binding, rows: "all", reason: "measure", by: V("bob") });
const ms = Math.round(performance.now() - t0);
const answer = JSON.stringify(r);
globalThis.gc?.(); globalThis.gc?.();
const after = process.memoryUsage().heapUsed + process.memoryUsage().arrayBuffers;
const stored = Math.max(...w.rows(`SELECT length(CAST(not_written_json AS BLOB)) a FROM calc_ingests`).map((x) => x.a), ...w.rows(`SELECT length(CAST(chunk AS BLOB)) a FROM calc_ingest_parts`).map((x) => x.a), 0);
console.log(JSON.stringify({ rows, ok: r.ok, written: r.written?.length, notWritten: r.not_written?.length, answerBytes: answer.length, largestStored: stored,
  pieces: w.count("calc_ingest_parts"), idleMB: +(idle / 1048576).toFixed(1), afterMB: +(after / 1048576).toFixed(1), maxRssMB: Math.round(process.resourceUsage().maxRSS / 1024), ms }));
