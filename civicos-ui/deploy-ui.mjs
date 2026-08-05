/* Deploy the civicos UI worker, believing only the bytes read back.
   Its ONE binding is the service binding to the plane; deploy.mjs's metadata is
   the PLANE's and would drop it, which is why this exists separately. */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
const [asset] = process.argv.slice(2);
const TOKEN = process.env.CF_TOKEN, ACCT = process.env.CF_ACCT;
if (!asset || !TOKEN || !ACCT) { console.error("usage: CF_TOKEN=.. CF_ACCT=.. node deploy-ui.mjs <asset>"); process.exit(2); }
const api = `https://api.cloudflare.com/client/v4/accounts/${ACCT}/workers/scripts/civicos`;
const src = readFileSync(asset, "utf8");
const want = createHash("sha256").update(src).digest("hex");
const meta = {
  main_module: "index.mjs",
  compatibility_date: "2026-07-01",
  compatibility_flags: [],
  bindings: [{ type: "service", name: "PLANE", service: "biosmoke7" }],
  keep_bindings: ["secret_text"],
};
const before = await (await fetch(api, { headers:{authorization:`Bearer ${TOKEN}`, accept:"application/javascript+module"} })).text();
console.log("before:", createHash("sha256").update(before).digest("hex").slice(0,16) + "…");
console.log("upload:", want.slice(0,16) + "…", src.length, "bytes");
const fd = new FormData();
fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
fd.append("index.mjs", new Blob([src], { type: "application/javascript+module" }), "index.mjs");
const r = await fetch(api, { method:"PUT", headers:{authorization:`Bearer ${TOKEN}`}, body: fd });
const j = await r.json().catch(()=>({}));
console.log(`PUT: http ${r.status}, api says ${j.success}`);
if (!r.ok || !j.success) { console.error(JSON.stringify(j.errors||j).slice(0,400)); process.exit(1); }
/* The account returns the script wrapped in a MULTIPART envelope, so hashing the
   response body compares the envelope and not the module — measured 2026-08-04,
   when this script's first version refused a deploy that had in fact succeeded.
   deploy.mjs already knew this; this is the same extraction. */
const rb = await fetch(api, { headers:{authorization:`Bearer ${TOKEN}`, accept:"application/javascript+module"} });
const ct = rb.headers.get("content-type") || "";
const body = Buffer.from(await rb.arrayBuffer());
let mod = body;
if (/multipart/i.test(ct)) {
  const m = /boundary=(.+)$/i.exec(ct);
  const parts = body.toString("binary").split("--" + m[1].replace(/"/g, "")).filter((p) => /index\.mjs/.test(p));
  const at = parts[0].indexOf("\r\n\r\n");
  mod = Buffer.from(parts[0].slice(at + 4).replace(/\r\n$/, ""), "binary");
}
const got = createHash("sha256").update(mod).digest("hex");
if (got !== want) { console.error(`REFUSING TO REPORT SUCCESS: read-back ${got.slice(0,16)} != ${want.slice(0,16)}`); process.exit(1); }
console.log("verified: deployed bytes are hash-identical to the asset");
