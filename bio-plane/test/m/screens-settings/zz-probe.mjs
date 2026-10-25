import { scannerTeam } from "./seed-security.mjs";
import { open } from "./kit.mjs";
const iso = (t) => new Date(t).toISOString();
for (const [name, st] of [["recent-refused", (n) => ({ last_attempt: iso(n - 5*60000), last_error: "REFUSED:main.cvd:403" })], ["failed", (n) => ({ last_attempt: iso(n - 3600000*5), last_error: "FAILED" })], ["mirrorrefused", (n)=>({ last_attempt: iso(n - 3600000*5), last_error: "MIRROR_REFUSED:exit 1: refused" })], ["weird", (n)=>({ last_attempt: iso(n - 3600000*5), last_error: "WEIRD" })]]) {
  const s = await scannerTeam({ state: st });
  const r = await s.founder.read("scanstatus");
  console.log(name, JSON.stringify(r.no_signatures));
  try { console.log("  mirror:", JSON.stringify(await s.founder.act("scanmirror",{body:{}}))); } catch(e) { console.log("  mirror refused:", e.message.slice(0,260)); }
}
