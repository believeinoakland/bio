/* D-249 / D-281 — THE PORT PROBE. Six arms, run in one step.
 *
 *     node test/d249-port.probe.mjs [sockets|concurrent|census|pressure|headroom|reuse|all]
 *
 * NOT a `.test.mjs`, deliberately: the battery discovers `*.test.mjs` in test/,
 * and these arms spawn real suites, sample the OS, and one of them exhausts the
 * machine's ephemeral port range. `register.control.mjs` and
 * `walkfloor.control.mjs` are the precedent for a control the battery must not
 * discover. THE `headroom` ARM IS NOT PART OF `all` for that reason — it is
 * destructive to every other process on the machine and must be asked for.
 *
 * WHY IT EXISTS. D-249 recorded that a fixed PORT is the same class as a
 * hardcoded temp path (D-237) and that no instrument in the estate can see one:
 * the containment check reads source, and the residue report is an after-the-
 * fact filesystem walk with no "after" for a port. It measured the SOURCE and
 * found exactly one site, a non-suite. This probe asks the question the source
 * cannot answer — WHAT DOES THE ESTATE ACTUALLY BIND AT RUNTIME — because 131
 * of this battery's suites construct a Miniflare, and a source matcher is
 * structurally blind to what a DEPENDENCY chooses.
 *
 * WHAT IT MEASURED (2026-08-09, darwin 25.5.0):
 *   sockets    3 runs of a real suite: ports 60239/60254/60306, 60323/60396/
 *              60440, 60473/60573/60733 — bound by node AND workerd, ZERO in
 *              common across the three. Nothing is pinned.
 *   concurrent 8 copies of one suite at once: 8 of 8 exit 0 on ONE signature
 *              (18/0), no EADDRINUSE. The D-237 collision shape does not occur.
 *   headroom   EADDRNOTAVAIL at 14,459 simultaneous loopback connections
 *              against a 16,384-port range.
 *   reuse      0 of 400 TIME_WAIT ports handed back while 3,000 were allocated:
 *              TIME_WAIT CONSUMES the pool.
 *   pressure   TIME_WAIT tracks the number of concurrent batteries, peaking at
 *              6,895 (42.1% of the range) with 4 running.
 *
 * SO THE CONCLUSION IS TWO-PART AND THE PARTS POINT OPPOSITE WAYS: D-249's
 * hypothesis is EMPTY (nothing pins, nothing collides), and a DIFFERENT port
 * hazard is real (the range is finite, exhaustible, and the estate consumes it
 * in proportion to concurrency). That second half is D-281.
 *
 * WHAT THESE ARMS CANNOT SEE, stated rather than left to be discovered:
 *  - `sockets`/`concurrent` sample with `lsof` on a POLL, so a socket that opens
 *    and closes between two samples is invisible. Every port count here is a
 *    LOWER bound, never a total.
 *  - they run ONE suite (`bootstrap.test.mjs`). A suite that pins a port in a
 *    way `bootstrap` does not would not be caught by running `bootstrap`.
 *  - `pressure` reads the whole machine. It CANNOT attribute a socket to a
 *    process, because a socket in TIME_WAIT has no owning pid to ask. It
 *    reports the concurrent battery count beside every row so the reader can
 *    see what else was running, and that is correlation, not attribution.
 *  - `headroom` opens to ONE destination port, the worst case for 4-tuple
 *    reuse; the battery spreads over many. It is a LOWER bound on headroom.
 */
import { spawn, execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import net from "node:net";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const arm = process.argv[2] ?? "all";
const want = (a) => arm === a || (arm === "all" && a !== "headroom");

const sh = (c, a) => { try { return execFileSync(c, a, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch { return ""; } };
const sysctl = (k, d) => Number((sh("sysctl", ["-n", k]) || String(d)).trim());
const FIRST = sysctl("net.inet.ip.portrange.first", 49152);
const LAST = sysctl("net.inet.ip.portrange.last", 65535);
const RANGE = LAST - FIRST + 1;
const MSL = sysctl("net.inet.tcp.msl", 15000);
const batNow = () => (sh("ps", ["-eo", "command"]).match(/scripts\/battery\.mjs/g) || []).length;

console.log(`ephemeral range ${FIRST}-${LAST} = ${RANGE} ports · net.inet.tcp.msl=${MSL}ms\n`);

/* workerd is a CHILD of the node suite. Sampling the node pid alone reports
 * zero listeners and reads as "nothing binds" — the false negative this probe
 * exists to avoid — so the whole descendant chain is walked. */
function descendants(root) {
  const out = new Set([root]);
  const kids = new Map();
  for (const line of (sh("ps", ["-eo", "pid=,ppid="]) || "").trim().split("\n")) {
    const [pid, ppid] = line.trim().split(/\s+/).map(Number);
    if (!kids.has(ppid)) kids.set(ppid, []);
    kids.get(ppid).push(pid);
  }
  const stack = [root];
  while (stack.length) for (const k of kids.get(stack.pop()) ?? []) if (!out.has(k)) { out.add(k); stack.push(k); }
  return [...out];
}

function listeners(rootPid) {
  const raw = sh("lsof", ["-nP", "-a", "-iTCP", "-sTCP:LISTEN", "-p", descendants(rootPid).join(",")]);
  const out = [];
  for (const line of raw.trim().split("\n").slice(1)) {
    const cols = line.trim().split(/\s+/);
    const m = /:(\d+)$/.exec(cols[cols.length - 2] ?? "");
    if (m) out.push({ cmd: cols[0], port: Number(m[1]) });
  }
  return out;
}

async function sampleSuite(suite, intervalMs = 120) {
  const child = spawn(process.execPath, [join("test", suite)], { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
  let out = "";
  child.stdout.on("data", (d) => { out += d; });
  child.stderr.on("data", (d) => { out += d; });
  const seen = new Map();
  let samples = 0, maxConcurrent = 0;
  const timer = setInterval(() => {
    const ls = listeners(child.pid);
    samples++;
    if (ls.length > maxConcurrent) maxConcurrent = ls.length;
    for (const l of ls) seen.set(l.port, l.cmd);
  }, intervalMs);
  const code = await new Promise((r) => child.on("exit", r));
  clearInterval(timer);
  return { code, out, ports: seen, samples, maxConcurrent };
}

if (want("sockets")) {
  console.log("=== ARM sockets — what does ONE REAL SUITE listen on? ===");
  console.log("DECLARED: a pinned port appears on EVERY run; an ephemeral one never repeats.\n");
  const runs = [];
  for (let i = 0; i < 3; i++) {
    const r = await sampleSuite("bootstrap.test.mjs");
    const ports = [...r.ports.keys()].sort((a, b) => a - b);
    runs.push(ports);
    console.log(`  run ${i + 1}: exit=${r.code} samples=${r.samples} maxConcurrent=${r.maxConcurrent}`);
    console.log(`          ports=${JSON.stringify(ports)} boundBy=${JSON.stringify([...new Set(r.ports.values())])}`);
  }
  const overlap = runs[0].filter((p) => runs[1].includes(p) && runs[2].includes(p));
  const belowRange = runs.flat().filter((p) => p < FIRST);
  console.log(`\n  common to all three runs: ${JSON.stringify(overlap)}`);
  console.log(`  VERDICT: ${overlap.length === 0 ? "EPHEMERAL — no port is pinned" : "PINNED — " + JSON.stringify(overlap)}`);
  /* A port BELOW the ephemeral range is the shape a pin would take (8787, 9229).
     Reported separately, because "never repeats" and "is in the ephemeral range"
     are two different properties and only checking one would be a weaker claim. */
  console.log(`  ports below the ephemeral floor (${FIRST}), the shape a pin takes: ${JSON.stringify([...new Set(belowRange)])}`);
}

if (want("concurrent")) {
  console.log("\n=== ARM concurrent — do EIGHT copies of ONE suite collide? ===");
  console.log("DECLARED: a pinned port makes copies fail with DIFFERENT signatures or EADDRINUSE.");
  console.log("          ephemeral ports make all 8 green on ONE signature.\n");
  const rs = await Promise.all(Array.from({ length: 8 }, () => sampleSuite("bootstrap.test.mjs")));
  let green = 0;
  const sigs = new Set();
  for (const [i, r] of rs.entries()) {
    const m = /(\d+)\s+pass,?\s+(\d+)\s+fail/i.exec(r.out);
    const sig = m ? `${m[1]}/${m[2]}` : `exit${r.code}`;
    sigs.add(sig);
    if (r.code === 0) green++;
    console.log(`  copy ${i + 1}: exit=${r.code} sig=${sig} ports=${JSON.stringify([...r.ports.keys()])}` +
      `${/EADDRINUSE/.test(r.out) ? "  EADDRINUSE!" : ""}`);
  }
  console.log(`\n  ${green} of 8 exited 0 · distinct signatures ${JSON.stringify([...sigs])}`);
  console.log(`  VERDICT: ${green === 8 && sigs.size === 1 ? "NO COLLISION" : "COLLISION / DIVERGENCE"}`);
}

if (want("census")) {
  console.log("\n=== ARM census — how much of the battery binds at all? ===");
  const suites = readdirSync(join(ROOT, "test")).filter((f) => f.endsWith(".test.mjs"));
  let total = 0, withMf = 0;
  for (const f of suites) {
    const n = (readFileSync(join(ROOT, "test", f), "utf8").match(/new Miniflare\(/g) || []).length;
    if (n) withMf++;
    total += n;
  }
  console.log(`  suites=${suites.length} building a Miniflare=${withMf} total constructions=${total}`);
  console.log(`  every construction binds at least one ephemeral port, and the entry socket`);
  console.log(`  belongs to workerd rather than to node — measured in the sockets arm.`);
}

if (want("pressure")) {
  console.log("\n=== ARM pressure — how much of the range is consumed, and by what? ===");
  const seconds = Number(process.argv[3] ?? 120), every = 10;
  console.log("  t(s)  TIME_WAIT  loopback  %ofRange  batteries");
  const rows = [];
  for (let t = 0; t <= seconds; t += every) {
    const net_ = sh("netstat", ["-an", "-p", "tcp"]);
    let tw = 0, lo = 0;
    for (const line of net_.split("\n")) if (/TIME_WAIT\s*$/.test(line)) { tw++; if (/127\.0\.0\.1/.test(line)) lo++; }
    const b = batNow();
    rows.push({ t, tw, b });
    console.log(`  ${String(t).padStart(4)}  ${String(tw).padStart(9)}  ${String(lo).padStart(8)}` +
      `  ${String(((tw / RANGE) * 100).toFixed(1) + "%").padStart(8)}  ${String(b).padStart(9)}`);
    if (t + every <= seconds) await new Promise((r) => setTimeout(r, every * 1000));
  }
  const peak = Math.max(...rows.map((r) => r.tw));
  const meanBat = rows.reduce((a, r) => a + r.b, 0) / rows.length;
  console.log(`\n  peak ${peak} (${((peak / RANGE) * 100).toFixed(1)}% of the range) · mean concurrent batteries ${meanBat.toFixed(1)}`);
  console.log(`  ATTRIBUTION: a TIME_WAIT socket has NO owning pid, so none of this is`);
  console.log(`  attributable to any one run. The battery column is what makes it readable,`);
  console.log(`  and it is CORRELATION. Crediting these to the process that printed them`);
  console.log(`  would be exactly the error D-237 recorded.`);
  if (meanBat > 0) {
    console.log(`  per-battery share ~${Math.round(peak / meanBat)} · at the stated ceiling of 8: ` +
      `~${Math.round((peak / meanBat) * 8)} of ${RANGE} (${(((peak / meanBat) * 8 / RANGE) * 100).toFixed(0)}%)`);
    console.log(`  AN EXTRAPOLATION IS NOT A MEASUREMENT. It is a reason to look.`);
  }
}

if (arm === "headroom") {
  console.log("\n=== ARM headroom — is exhaustion REACHABLE? (DESTRUCTIVE) ===");
  console.log(`  ambient: TIME_WAIT=${(sh("netstat", ["-an", "-p", "tcp"]).match(/TIME_WAIT/g) || []).length} batteries=${batNow()}`);
  console.log("  THIS ARM EXHAUSTS THE MACHINE'S EPHEMERAL RANGE and will inflict");
  console.log("  EADDRNOTAVAIL on every other process, including other worktrees'");
  console.log("  batteries. That is why it is excluded from `all`.\n");
  const sink = net.createServer((s) => s.on("error", () => {}));
  await new Promise((r) => sink.listen(0, "127.0.0.1", r));
  const PORT = sink.address().port;
  const open = [];
  const failures = new Map();
  let stop = false, n = 0;
  while (n < 20000 && !stop) {
    const got = await Promise.all(Array.from({ length: 250 }, () => new Promise((resolve) => {
      const s = net.connect({ port: PORT, host: "127.0.0.1" });
      s.on("connect", () => { open.push(s); resolve(null); });
      s.on("error", (e) => { failures.set(e.code, (failures.get(e.code) ?? 0) + 1); s.destroy(); resolve(e.code); });
    })));
    n += 250;
    if (got.some((g) => g !== null)) stop = true;
  }
  console.log(`  HEADROOM: ${open.length} simultaneous connections before failure`);
  console.log(`  codes: ${JSON.stringify([...failures])}`);
  console.log(failures.has("EADDRNOTAVAIL") || failures.has("EADDRINUSE")
    ? "  WHAT BIT: EPHEMERAL PORT EXHAUSTION — the range is the binding constraint."
    : failures.has("EMFILE") || failures.has("ENFILE")
      ? "  WHAT BIT: the FILE DESCRIPTOR limit, a DIFFERENT resource — exhaustion NOT reached."
      : "  WHAT BIT: nothing — source ports are reused across the 4-tuple.");
  for (const s of open) s.destroy();
  sink.close();
}

if (want("reuse")) {
  console.log("\n=== ARM reuse — does TIME_WAIT actually CONSUME the pool? ===");
  console.log("DECLARED: if TIME_WAIT ports are re-handed-out, the pressure figures are");
  console.log("          bookkeeping. If they are withheld, they are capacity.\n");
  const sink = net.createServer((s) => s.on("error", () => {}));
  await new Promise((r) => sink.listen(0, "127.0.0.1", r));
  const PORT = sink.address().port;
  const minted = new Set();
  const socks = [];
  await Promise.all(Array.from({ length: 400 }, () => new Promise((resolve) => {
    const s = net.connect({ port: PORT, host: "127.0.0.1" });
    s.on("connect", () => { minted.add(s.localPort); socks.push(s); resolve(); });
    s.on("error", () => resolve());
  })));
  for (const s of socks) s.end();                      // ACTIVE close -> our port goes TIME_WAIT
  await new Promise((r) => setTimeout(r, 1500));
  const twPorts = new Set();
  for (const line of sh("netstat", ["-an", "-p", "tcp"]).split("\n")) {
    if (!/TIME_WAIT\s*$/.test(line)) continue;
    const m = /127\.0\.0\.1[.:](\d+)\s/.exec(line);
    if (m) twPorts.add(Number(m[1]));
  }
  const inTw = [...minted].filter((p) => twPorts.has(p));
  console.log(`  minted ${minted.size} ports and actively closed them · ${inTw.length} visibly in TIME_WAIT`);
  /* If nothing reached TIME_WAIT the next assertion would pass for free — the
     empty-corpus shape this project has been bitten by repeatedly. */
  if (inTw.length === 0) { console.log("  ABORT: nothing reached TIME_WAIT; the result below would be free."); process.exit(2); }
  const fresh = new Set();
  const held = [];
  for (let b = 0; b < 10; b++) {
    await Promise.all(Array.from({ length: 300 }, () => new Promise((resolve) => {
      const s = net.connect({ port: PORT, host: "127.0.0.1" });
      s.on("connect", () => { fresh.add(s.localPort); held.push(s); resolve(); });
      s.on("error", () => resolve());
    })));
  }
  const collide = [...fresh].filter((p) => inTw.includes(p));
  console.log(`  allocated ${fresh.size} fresh ports · reused a TIME_WAIT port ${collide.length} time(s)`);
  console.log(collide.length === 0
    ? "  RESULT: TIME_WAIT ports are WITHHELD — they CONSUME the pool, so a TIME_WAIT\n          count is a measure of consumed capacity."
    : "  RESULT: TIME_WAIT ports were REUSED — the pressure figures OVERSTATE the hazard.");
  /* OVER-STRICTNESS. A probe that allocated nothing would report "withheld" and
     be indistinguishable from the real result, so the allocator is asserted LIVE. */
  const outside = [...fresh].filter((p) => !minted.has(p)).length;
  console.log(`\n  OVER-STRICTNESS ARM: fresh=${fresh.size} (need >=1000) outside-minted=${outside} (need >=1000)`);
  console.log(`  ${fresh.size >= 1000 && outside >= 1000
    ? "PASS — the allocator was live, so 'withheld' is a real observation"
    : "FAIL — the allocator was not exercised; the result above is NOT trustworthy"}`);
  for (const s of held) s.destroy();
  sink.close();
}

process.exit(0);
