// PERFORMANCE: build every fleet member and the plane in memory (write:false), measure size, gzip size and a fresh-import start-up.
import { discoverMembers, planeMember, buildMember, measureStart, BUDGET, isContainer } from "/home/user/bio/bio-plane/scripts/fleet-bundle.mjs";
import { writeFileSync, readFileSync, existsSync } from "node:fs"; import { join, relative } from "node:path"; import { gzipSync } from "node:zlib";
const out = process.argv[2]; const MiB = 1048576; const f = (n) => (n / MiB).toFixed(2);
const members = [planeMember(), ...discoverMembers()];
for (const m of members) {
  if (!m.bundle) { console.log(`${m.name}: no bundle (${isContainer(m) ? "container" : "other"})`); continue; }
  try {
    const committedPath = join(m.abs, m.bundle.outfile); const committed = existsSync(committedPath) ? readFileSync(committedPath).length : null;
    const t0 = Date.now(); const built = await buildMember(m, { write: false }); const bt = Date.now() - t0;
    const bytes = Buffer.from(built.bytes); const file = join(out, m.name + ".mjs"); writeFileSync(file, bytes);
    const st = await measureStart(m, { artifact: relative(m.abs, file) });
    console.log(`${m.name}: fresh ${f(bytes.length)} MiB (gzip ${f(gzipSync(bytes, { level: 9 }).length)}) · committed ${committed === null ? "-" : f(committed)} MiB · build ${bt} ms · start ${st.measured ? st.ms.toFixed(0) + " ms" : "unmeasured: " + st.reason} · warn ${f(BUDGET.sizeWarn)} fail ${f(BUDGET.sizeFail)}`);
  } catch (e) { console.log(`${m.name}: build failed: ${String(e.message).split("\n")[0]}`); }
}
