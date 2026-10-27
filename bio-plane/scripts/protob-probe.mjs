#!/usr/bin/env node
/* PROTO-B (throwaway): drives `op=protobprobe` on a deployed scratch plane started with PROTO_B=1, and times each phase from OUTSIDE (workerd
   freezes the clock in synchronous work, so the room's SQL phases read ~0 ms inside). Each phase is a whole request; `noop` is the baseline
   (hop plus door), subtracted. Phases read_room, read_r2, search_room, search_r2 run one side each. Usage:
     BASE=https://<scratch plane> ADMIN_TOKEN=... node scripts/protob-probe.mjs [n=50] [k=100] [term=word] [reps=3] [hits=20]
   Never prints the token. Reads and writes only under `proto-b/`. */
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.split("=")));
const { BASE, ADMIN_TOKEN } = process.env;
if (!BASE || !ADMIN_TOKEN) { console.error("set BASE and ADMIN_TOKEN"); process.exit(2); }
const reps = Number(args.reps || 3);
const call = async (phase, extra = {}) => {
  const q = new URLSearchParams({ op: "protobprobe", phase, ...(args.n && { n: args.n }), ...(args.k && { k: args.k }), ...(args.term && { term: args.term }),
                                  ...(args.hits && { hits: args.hits }), ...(args.maxunits && { maxunits: args.maxunits }), ...extra });
  const t0 = performance.now();
  const res = await fetch(`${BASE}/?${q}`, { headers: { authorization: `Bearer ${ADMIN_TOKEN}` } });
  const wall = performance.now() - t0, body = await res.json().catch(() => ({}));
  return { wall, status: res.status, body, serverTiming: res.headers.get("server-timing") };
};
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const many = async (phase) => { const r = []; for (let i = 0; i < reps; i++) r.push(await call(phase)); return r; };
const base = med((await many("noop")).map((r) => r.wall));
const out = { baseline_ms: Math.round(base) };
const copy = await call("copy", { copy: args.copy || "0" });
out.copy = { wall_ms: Math.round(copy.wall), status: copy.status, ...copy.body.copy };
const lessBase = async (phase) => { const r = await many(phase); return { ms: Math.round(med(r.map((x) => x.wall)) - base), inside: r[0].body.read || r[0].body.search, room_in_ms: r[0].body.timing?.room_in_ms }; };
out.read = { room: await lessBase("read_room"), r2: await lessBase("read_r2") };
out.search = { room_fts: await lessBase("search_room"), r2_index: await lessBase("search_r2") };
out.bytes = (await call("bytes")).body.bytes;
console.log(JSON.stringify(out, null, 1));
