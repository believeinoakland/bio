#!/usr/bin/env node
/* PROTO-PACKED (throwaway): drives `op=protopackedprobe` on a plane started with PROTO_PACKED=1 and times each phase from OUTSIDE (workerd
   freezes the clock in synchronous work). Each phase is a whole request; `noop` is the baseline, subtracted. Median of `reps` (3).
   Usage: NODE_USE_ENV_PROXY=1 BASE=https://<plane>[/api] ADMIN_TOKEN=... node scripts/protopacked-probe.mjs [n=50] [maxunits=400] [term=word] [reps=3] [hits=20] [copy=1]
   Prints one JSON: for k = 20, 100, 400 and the term search, R2-packed against the room's own read and FTS search, and the byte table.
   Never prints the token. Reads and writes R2 only under `proto-packed/`. */
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.split("=")));
const { BASE, ADMIN_TOKEN } = process.env;
if (!BASE || !ADMIN_TOKEN) { console.error("set BASE and ADMIN_TOKEN"); process.exit(2); }
const root = BASE.replace(/\/+$/, "");
const reps = Number(args.reps || 3);
const call = async (phase, extra = {}) => {
  const q = new URLSearchParams({ op: "protopackedprobe", phase, ...(args.n && { n: args.n }), ...(args.term && { term: args.term }),
                                  ...(args.hits && { hits: args.hits }), ...(args.maxunits && { maxunits: args.maxunits }), ...extra });
  const t0 = performance.now();
  const res = await fetch(`${root}/?${q}`, { headers: { authorization: `Bearer ${ADMIN_TOKEN}` } });
  const wall = performance.now() - t0, body = await res.json().catch(() => ({}));
  return { wall, status: res.status, body };
};
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const many = async (phase, extra) => { const r = []; for (let i = 0; i < reps; i++) r.push(await call(phase, extra)); return r; };
const base = med((await many("noop")).map((r) => r.wall));
const out = { baseline_ms: Math.round(base), reps };
const copy = await call("copy", { copy: args.copy || "0" });
out.copy = { wall_ms: Math.round(copy.wall), status: copy.status, ...copy.body.copy, error: copy.body.error };
const lessBase = async (phase, extra) => {
  const r = await many(phase, extra), b = r[0].body;
  return { ms: Math.round(med(r.map((x) => x.wall)) - base), status: r[0].status, inside: b.read || b.search, room_in_ms: b.timing?.room_in_ms };
};
out.read = {};
for (const k of [20, 100, 400]) out.read[`k${k}`] = { room: await lessBase("read_room", { k }), r2_packed: await lessBase("read_r2", { k }) };
out.search = { room_fts: await lessBase("search_room"), r2_packed: await lessBase("search_r2") };
out.bytes = (await call("bytes")).body.bytes;
console.log(JSON.stringify(out, null, 1));
