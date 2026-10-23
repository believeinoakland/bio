/* G55's measure (not run by the suite; extends g45.probe.mjs): the money ingest at N rows, one table shape per run, in a
   node child capped as the E3 harness caps the plane. Work counts are printed beside the wall time (the clock is never asserted).
   node --expose-gc --max-old-space-size=CAP --import bio-plane/test/platform-sqlite.mjs g55.probe.mjs ROWS MODE
   MODE: mixed (one row in 60 resolves, the rest unidentified payers, G45 (a)), resolving (every row resolves and is written),
   crosswalk (the payer column resolves through a captured crosswalk of 2,000 vendors, 50 distinct payers in the rows, one row in 60
   unknown). Prints one JSON line. */
import { seeded, V } from "./fixture.mjs";
const rows = Number(process.argv[2] || 18098), mode = process.argv[3] || "mixed";
const w = seeded();
w.person("Pat Quill", "P001"); w.person("Lee Quill", "P002");
const calls = { lookups: 0, facts: 0 };
const ent = w.entities, lookup = ent.entityByIdentifier.bind(ent);
ent.entityByIdentifier = (a) => { calls.lookups++; return lookup(a); };
const fields = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
let payerRole = { role: "payer", scheme: "ellery_person" };
if (mode === "crosswalk") {
  const vendors = Array.from({ length: 50 }, (_, k) => w.entity(`Vendor ${k}`, "institution"));
  const cwText = ["vendor_no,entity\n", ...Array.from({ length: 2000 }, (_, k) => `V${String(k).padStart(4, "0")},${k < 50 ? vendors[k] : vendors[k % 50]}\n`)].join("");
  const cw = await w.table(cwText, [{ name: "vendor_no", type: "string" }, { name: "entity", type: "string" }], { roles: { vendor_no: { role: "crosswalk_from" }, entity: { role: "crosswalk_to" } } });
  payerRole = { role: "payer", crosswalk: { table: cw.sha, from: "vendor_no", to: "entity" } };
}
const payerOf = (i) => (mode === "resolving" ? "P001" : mode === "crosswalk" ? (i % 60 === 0 ? "X" + String(i).padStart(6, "0") : "V" + String(i % 50).padStart(4, "0"))
  : i % 60 === 0 ? "P001" : "U" + String(i).padStart(6, "0"));
const parts = ["payer,payee,amount\n"];
for (let i = 0; i < rows; i++) parts.push(`${payerOf(i)},P002,${(i % 97) + 1}\n`);
const text = parts.join(""); parts.length = 0;
const t = await w.table(text, fields, { roles: { payer: payerRole, payee: { role: "payee", scheme: "ellery_person" }, amount: { role: "amount" } } });
const b = w.c.adoptBinding({ table: t.sha, roles: { amount: "amount", payer: "payer", payee: "payee", kind: { value: "payment" }, phase: { value: "actual" },
  stage: { value: "paid" }, basis: { value: "cash" }, currency: { value: "USD" }, period: { value: "2025-07-01/2026-06-30" } }, by: V("bob") });
globalThis.gc?.(); globalThis.gc?.();
const t0 = performance.now();
const r = await w.c.ingestMoney({ binding: b.binding, rows: "all", reason: "measure", by: V("bob") });
const ms = Math.round(performance.now() - t0);
calls.facts = w.money.calls.length;
console.log(JSON.stringify({ rows, mode, ok: r.ok, written: r.written?.length, notWritten: r.not_written?.length, lookups: calls.lookups, facts: calls.facts,
  answerBytes: JSON.stringify(r).length, ms, msPerRow: +(ms / rows).toFixed(3), maxRssMB: Math.round(process.resourceUsage().maxRSS / 1024) }));
