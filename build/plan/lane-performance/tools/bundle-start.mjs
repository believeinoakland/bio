import { discoverMembers, planeMember, budgetReport } from "/home/user/bio/bio-plane/scripts/fleet-bundle.mjs";
const want = process.argv.slice(2); const ms = [planeMember(), ...discoverMembers()].filter(m => want.includes(m.name));
for (const m of ms) { const r = await budgetReport(m); console.log(r.line); }
