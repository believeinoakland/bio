/* host-governor's two ops (R18, R19): the handlers at the module's interface over a stand-in store, and then through
   the whole plane (Miniflare, the real Worker and Durable Object), by every token class and every kind of session,
   because who reaches an op is decided where the op is declared. No network: the outbound service answers nothing. */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { governorOp, governorRoutes } from "../../../src/host-governor/index.mjs";
import { world } from "./fixture.mjs";

const url = (q) => new URL(`http://x/api/?${q}`);
/* A stand-in Durable Object stub over a real governor, answering as the legacy store's dispatcher does. */
const storeOver = (g, calls = []) => ({ async fetch(u, init) {
  const where = new URL(u);
  const body = init && init.body ? JSON.parse(init.body) : null;
  calls.push([where.pathname + where.search, body]);
  return Response.json({ ok: true, result: governorRoutes(g, where, body)[where.pathname.slice(1)]() });
} });
const silent = [{ fetch: async () => { throw new Error("no store"); } }, { fetch: async () => new Response("<html>") },
                { fetch: async () => Response.json({ ok: false }) }];

test("R18: op=governorstate answers {ok: true, hosts} for one host or all, and a store that does not answer is silence", async () => {
  const w = world();
  w.g.governorReport({ host: "b.example", status: 429 });
  w.g.governorAdmit({ host: "a.example" });
  const calls = [];
  const all = await governorOp("governorstate", url("op=governorstate"), storeOver(w.g, calls));
  assert.deepEqual(all, { status: 200, body: { ok: true, hosts: w.g.governorState({}).hosts } });
  assert.deepEqual(all.body.hosts.map((r) => r.host), ["a.example", "b.example"]);
  const one = await governorOp("governorstate", url("op=governorstate&host=b.example"), () => storeOver(w.g, calls));
  assert.deepEqual(one.body.hosts.map((r) => r.host), ["b.example"]);
  assert.equal(one.body.hosts[0].last_refusal_status, 429);
  const none = await governorOp("governorstate", url("op=governorstate&host=zzz.example"), storeOver(w.g));
  assert.deepEqual(none, { status: 200, body: { ok: true, hosts: [] } });
  assert.equal(w.count(), 2);                                         // a read never creates a host
  for (const st of silent) assert.deepEqual(await governorOp("governorstate", url("op=governorstate"), st), { silent: true });
  assert.equal(await governorOp("links", url("op=links"), storeOver(w.g)), null);   // any other op is not this module's
});

test("R19: op=governorconfig refuses NEED_HOST and BAD_APPETITE, sets or clears, and a store that does not answer is silence", async () => {
  const w = world();
  const calls = [];
  const st = storeOver(w.g, calls);
  const need = await governorOp("governorconfig", url("op=governorconfig&appetite_per_min=5"), st);
  assert.equal(need.status, 400);
  assert.equal(need.body.reason, "NEED_HOST");
  for (const bad of ["0", "-4", "abc", "Infinity", "1e999"]) {
    const r = await governorOp("governorconfig", url(`op=governorconfig&host=h.example&appetite_per_min=${bad}`), st);
    assert.equal(r.status, 400, bad);
    assert.equal(r.body.reason, "BAD_APPETITE");
    assert.equal(r.body.check, "host-governor.R12");          // the one refusal R12 names, not a second wording
    assert.deepEqual(r.body, w.g.governorConfig({ host: "h.example", appetite_per_min: bad }));
  }
  assert.deepEqual(calls, []);                                 // nothing reached the store
  assert.equal(w.count(), 0);
  const set = await governorOp("governorconfig", url("op=governorconfig&host=h.example&appetite_per_min=9"), st);
  assert.deepEqual(set, { status: 200, body: { ok: true, configured: true, host: "h.example", appetite_per_min: 9 } });
  assert.equal(w.row("h.example").appetite_per_min, 9);
  for (const q of ["op=governorconfig&host=h.example", "op=governorconfig&host=h.example&appetite_per_min="]) {
    w.g.governorConfig({ host: "h.example", appetite_per_min: 9 });
    const cleared = await governorOp("governorconfig", url(q), st);
    assert.deepEqual(cleared.body, { ok: true, configured: true, host: "h.example", appetite_per_min: null });
    assert.equal(w.row("h.example").appetite_per_min, null);
  }
  for (const s of silent)
    assert.deepEqual(await governorOp("governorconfig", url("op=governorconfig&host=h.example&appetite_per_min=3"), s), { silent: true });
});

/* ---- through the whole plane ---- */
const SRC = fileURLToPath(new URL("../../../src/index.mjs", import.meta.url));
let mf;
const T = { admin: "hg-adm", member: "hg-mem", probe: "hg-prb" };
const call = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`, { method: "POST", body: JSON.stringify(body ?? {}) });
  const j = await res.json();
  return (j && typeof j === "object" && "result" in j) ? j.result : j;
};
const S = {};

before(async () => {
  mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: T.admin, MEMBER_TOKEN: T.member, PROBE_TOKEN: T.probe, VERSION: "test" },
    outboundService() { return new Response("unscripted", { status: 500 }); },
  });
  /* Two enrolled administrators and an ordinary member, then the founder's claim and session (Membership
     Architecture 4.2/4.3: the first two administrators are enrolled before anyone else). */
  const enrol = async (id, role, capabilities) => {
    const add = await call(`op=memberadd&token=${T.admin}`, { memberId: id, cover: `cover for ${id}`, role, capabilities });
    if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
    const en = await call("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-hg` });
    if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
    const lg = await call("op=login", { role: `member:${id}`, password: `${id}-passphrase-hg` });
    if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
    return lg.token;
  };
  S.ruth = await enrol("ruth", "admin", ["contribute"]);
  S.gus = await enrol("gus", "admin", ["contribute"]);
  S.cai = await enrol("cai", "member", []);
  const claimed = await call("op=claim", { bootstrapToken: T.admin, password: "founder-passphrase-hg" });
  if (!claimed?.ok) throw new Error(`claim: ${JSON.stringify(claimed)}`);
  const fl = await call("op=login", { password: "founder-passphrase-hg" });
  if (!fl?.token) throw new Error(`founder login: ${JSON.stringify(fl)}`);
  S.founder = fl.token;
});
after(async () => { if (mf) await mf.dispose(); });

test("R18: op=governorstate is reached by the admin, member and probe classes and by every session", async () => {
  const setup = await call(`op=governorconfig&token=${T.admin}&host=state.example&appetite_per_min=7`);
  assert.equal(setup.ok, true);
  const probeSetup = await call(`op=governorconfig&token=${T.probe}&host=state.example&appetite_per_min=5`);
  assert.equal(probeSetup.ok, true);
  for (const [who, tok, want] of [["admin", T.admin, 7], ["member", T.member, 7], ["probe (its own namespace)", T.probe, 5],
                                  ["the founder's session", S.founder, 7], ["an enrolled administrator's session", S.ruth, 7],
                                  ["a member's session", S.cai, 7]]) {
    const r = await call(`op=governorstate&token=${tok}&host=state.example`);
    assert.equal(r.ok, true, `${who}: ${JSON.stringify(r)}`);
    assert.deepEqual(r.hosts.map((h) => [h.host, h.appetite_per_min]), [["state.example", want]], who);
    const all = await call(`op=governorstate&token=${tok}`);
    assert.equal(all.ok, true, who);
    assert.ok(all.hosts.some((h) => h.host === "state.example"), who);
  }
  const anon = await call("op=governorstate&host=state.example");
  assert.equal(anon.ok, false);                              // no credential, no state
});

test("R19: op=governorconfig is reached by the admin and probe classes and the founder's session alone", async () => {
  const appetiteOf = async (h) => ((await call(`op=governorstate&token=${T.admin}&host=${h}`)).hosts[0] || {}).appetite_per_min ?? null;
  const allowed = [["admin", T.admin], ["the founder's session", S.founder]];
  let n = 11;
  for (const [who, tok] of allowed) {
    const r = await call(`op=governorconfig&token=${tok}&host=cfg.example&appetite_per_min=${n}`);
    assert.deepEqual([r.ok, r.appetite_per_min], [true, n], `${who}: ${JSON.stringify(r)}`);
    assert.equal(await appetiteOf("cfg.example"), n, who);
    n++;
  }
  const p = await call(`op=governorconfig&token=${T.probe}&host=cfg-probe.example&appetite_per_min=3`);
  assert.deepEqual([p.ok, p.appetite_per_min], [true, 3]);
  assert.equal((await call(`op=governorstate&token=${T.probe}&host=cfg-probe.example`)).hosts[0].appetite_per_min, 3);
  for (const [who, tok] of [["member", T.member], ["an enrolled administrator's session", S.ruth],
                            ["another enrolled administrator's session", S.gus], ["a member's session", S.cai]]) {
    const r = await call(`op=governorconfig&token=${tok}&host=cfg-refused.example&appetite_per_min=2`);
    assert.equal(r.ok, false, `${who}: ${JSON.stringify(r)}`);
  }
  assert.equal(await appetiteOf("cfg-refused.example"), null);   // nothing a refused caller asked for landed
  const need = await call(`op=governorconfig&token=${T.admin}&appetite_per_min=2`);
  assert.deepEqual([need.ok, need.reason], [false, "NEED_HOST"]);
  for (const bad of ["0", "-4", "abc"]) {
    const r = await call(`op=governorconfig&token=${T.admin}&host=cfg.example&appetite_per_min=${bad}`);
    assert.deepEqual([r.ok, r.reason, r.check], [false, "BAD_APPETITE", "host-governor.R12"], bad);
  }
  assert.equal(await appetiteOf("cfg.example"), 12);
  const cleared = await call(`op=governorconfig&token=${T.admin}&host=cfg.example`);
  assert.deepEqual([cleared.ok, cleared.appetite_per_min], [true, null]);
  assert.equal(await appetiteOf("cfg.example"), null);
});
