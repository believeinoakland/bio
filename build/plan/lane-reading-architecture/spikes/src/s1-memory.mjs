import { boot, rssMB } from "./wd.mjs";
const src = `
let keep = [];
export default { async fetch(req) {
  const u = new URL(req.url);
  if (u.pathname === "/idle") return new Response("ok");
  const mb = Number(u.searchParams.get("mb"));
  if (u.pathname === "/reset") { keep = []; return new Response("reset"); }
  try {
    if (u.pathname === "/ab") { keep.push(new Uint8Array(mb*1048576).fill(1)); }
    else if (u.pathname === "/ab-nofill") { keep.push(new Uint8Array(mb*1048576)); }
    else if (u.pathname === "/abs") { // many 8MB buffers, each touched
      for (let i=0;i<mb/8;i++) keep.push(new Uint8Array(8*1048576).fill(i&255)); }
    else if (u.pathname === "/heap") { // ~mb MB of small objects (each {a,b} + string ≈ ) 
      const n = mb*1048576/64|0; const a=[]; for (let i=0;i<n;i++) a.push({a:i,b:"x"+i}); keep.push(a); }
    else if (u.pathname === "/str") { let s="a".repeat(1024); const a=[]; for (let i=0;i<mb*1024;i++) a.push(s+i); keep.push(a); }
    return Response.json({ok:true, mb, mem: typeof performance !== "undefined" ? 0 : 0});
  } catch (e) { return Response.json({ok:false, err: String(e&&e.message||e), name: e&&e.name}); }
} }`;
const flagSets = [[], ["--max-old-space-size=64"], ["--max-old-space-size=128"], ["--max-old-space-size=256"]];
const tests = [["ab", 64], ["ab", 128], ["ab", 200], ["ab-nofill", 200], ["abs", 400], ["heap", 60], ["heap", 100], ["heap", 150], ["heap", 300], ["str",100],["str",300]];
let port = 19100;
for (const flags of flagSets) {
  for (const [path, mb] of tests) {
    port++;
    const w = await boot({ dir: "/tmp/claude-0/-home-user-bio/ace00fc7-30a5-5161-8a63-7cfeb7cb24c6/scratchpad/platform/spikes/data/s1", src, flags, port });
    let out;
    try {
      const r = await fetch(`http://127.0.0.1:${port}/${path}?mb=${mb}`, { signal: AbortSignal.timeout(60000) });
      out = `HTTP ${r.status} ${(await r.text()).slice(0, 120)}`;
    } catch (e) { out = `FETCH-ERROR ${e.cause?.code || e.message}`; }
    await new Promise((r) => setTimeout(r, 300));
    const rss = w.exited ? null : rssMB(w.p.pid);
    console.log(JSON.stringify({ flags: flags.join(" ") || "(none)", path, mb, out, rssMB: rss && Math.round(rss), processExited: w.exited, tail: w.exited ? w.log.trim().split("\n").slice(-3).join(" | ").slice(0, 300) : undefined }));
    w.p.kill("SIGKILL");
    await new Promise((r) => setTimeout(r, 200));
  }
}
