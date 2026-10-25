/* R79 (G42; K4635, K4638; R-SEAM): the record's gauge through the real door and the real record. Nothing between the plane's answer and the
   words is scripted: the screen's own `stats` read goes to the real control-plane door (`makeFetch`), which stamps the caller's sight and
   capacity from the session, and on to the real plane object (`Store`) over a real database whose reported size the test sets (`databaseSize`,
   a settable figure of the storage as the platform's is). The callers are the journey's own: an administering member (`ADMIN`, the class
   whose answer the door floors to a whole 100 MB, K4638), the founder (the exact figure) and a member (no figure, and the screen never asks).
   Red by name until CONTROL-PLANE #50 stamps capacity for an administering member (control-plane `stats.test.mjs`). */
import test from "node:test";
import assert from "node:assert/strict";
/* The kit registers every owner's declared ops once, before the op tables are read (op-declarations R81); the plane's own start does the same
   (`src/store-assembly/register.mjs`), and a second registration is refused. Here the kit's registration is the one, so the plane's start-up import is answered
   by an empty module (the tables it would have registered are the kit's); everything else of the plane is loaded for real. */
const { registerHooks } = await import("node:module");
registerHooks({
  resolve(spec, ctx, next) {
    if (/(^|\/)register\.mjs$/.test(spec) && String(ctx.parentURL || "").includes("/src/plane/")) return { url: "data:text/javascript,", shortCircuit: true };
    return next(spec, ctx);
  },
});
const { all, has, lacks, open } = await import("../screens-settings/kit.mjs");
const { ADMIN, FOUNDER, MEMBER, groupTable } = await import("../screens-settings/fixtures.mjs");
const { store } = await import("./fixture.mjs");
const worker = (await import("../../../src/plane/index.mjs")).default;
const { randomBytes } = await import("node:crypto");

const G = "screen.group.storage.";
const drawn = (o, state) => all(o.tree, (e) => e.attrs["data-state"] === state).length;

/* the plane: the Worker the product deploys (the door and its hooks) over one real object, whose database size is the test's to set. Only the
   session lookup is scripted (a session's row, as the sign-in leaves it); every other route, `stats` included, is the object's own. */
const hex64 = () => randomBytes(32).toString("hex");
const SESSION = (id, extra = {}) => ({ role: `member:${id}`, capabilities: ["contribute"], administer: false, rootOfTrust: false, handle: id, ...extra });
async function plane() {
  const x = await store();
  const size = { v: 0 };
  Object.defineProperty(x.ctx.storage.sql, "databaseSize", { get: () => size.v });
  const tokens = { admin: hex64(), founder: hex64(), member: hex64() };
  const sessions = {
    [tokens.admin]: SESSION("rosa", { capabilities: ["contribute", "publish", "create_projects"], administer: true }),
    [tokens.founder]: { role: "admin", capabilities: ["contribute"], administer: true, rootOfTrust: true, handle: "founder" },
    [tokens.member]: SESSION("dev"),
  };
  const env = {
    ADMIN_TOKEN: hex64(), MEMBER_TOKEN: hex64(), PROBE_TOKEN: hex64(), DAEMON_TOKEN: hex64(), VERSION: "9.9.9", INSTANCE_NAME: "storage-seam",
    STORE: { idFromName: (n) => n, get: () => ({ async fetch(input, init) {
      const req = input instanceof Request ? input : new Request(String(input), init);
      const u = new URL(req.url);
      if (u.pathname === "/session") return new Response(JSON.stringify({ ok: true, result: { session: sessions[req.headers.get("x-bio-session") ?? u.searchParams.get("t")] ?? null } }), { status: 200 });
      return x.s.fetch(req);
    } }) },
  };
  const stats = async (token) => {
    const res = await worker.fetch(new Request("https://plane.example/api?op=stats", { headers: { authorization: `Bearer ${token}` } }), env);
    return res.json();
  };
  return { env, size, tokens, stats };
}

/* the screen, whose `stats` read is the door's answer to the caller the screen's `me` stands for (the session's token) */
const screenAs = async (p, me, token) => {
  const answer = await p.stats(token);   /* made at the door before the page boots, so the page's own read waits on no timer */
  return open("group", { me, table: groupTable({ stats: async () => answer }) });
};
const asked = (o) => o.p.all.filter((r) => r.op === "stats").length;

const CASES = [
  { bytes: 0, used: "0.0", percent: "0", warn: 0 },
  { bytes: 6_999_999_999, used: "6.9", percent: "69", warn: 0 },
  { bytes: 7_000_000_000, used: "7.0", percent: "70", warn: 1 },
  { bytes: 8_999_999_999, used: "8.9", percent: "89", warn: 1 },
  { bytes: 9_000_000_000, used: "9.0", percent: "90", warn: 2 },
  { bytes: 10_500_000_000, used: "10.5", percent: "105", warn: 2 },
];

test("R79 G42 (S): the administering member's screen, through the real door and the real record, shows the size floored to 100 MB at every edge", async () => {
  const p = await plane();
  for (const c of CASES) {
    p.size.v = c.bytes;
    const answer = await p.stats(p.tokens.admin);
    assert.equal(answer.result.dbBytes, Math.floor(c.bytes / 1e8) * 1e8, `${c.bytes}: the door answers an administering member the figure floored to a whole 100 MB (CONTROL-PLANE #50)`);
    const o = await screenAs(p, ADMIN, p.tokens.admin);
    assert.equal(asked(o), 1, "stats read once");
    has(o, G + "size", { used: c.used, limit: "10", percent: c.percent });
    assert.equal(drawn(o, "storagewarn1"), c.warn === 1 ? 1 : 0, `${c.bytes}: first warning`);
    assert.equal(drawn(o, "storagewarn2"), c.warn === 2 ? 1 : 0, `${c.bytes}: second warning`);
  }
});

test("R79 G42 (S): the founder is shown the exact figure through the same door", async () => {
  const p = await plane();
  p.size.v = 7_000_000_000;
  assert.equal((await p.stats(p.tokens.founder)).result.dbBytes, 7_000_000_000);
  const o = await screenAs(p, FOUNDER, p.tokens.founder);
  has(o, G + "size", { used: "7.0", limit: "10", percent: "70" });
  assert.equal(drawn(o, "storagewarn1"), 1);
});

test("R79 G42 (S) control: a member's session is answered no figure by the door, the screen sends no `stats` and draws nothing", async () => {
  const p = await plane();
  p.size.v = 9_500_000_000;
  const answer = await p.stats(p.tokens.member);
  assert.equal(answer.ok, true);
  assert.equal("dbBytes" in answer.result, false, "the door answers a member no dbBytes");
  const o = await screenAs(p, MEMBER, p.tokens.member);
  assert.equal(asked(o), 0, "a member's screen sends no stats");
  lacks(o, G + "head"); lacks(o, G + "warn2");
});

test("R79 G42 (S): an object that states no size (null) is drawn `not stated`, through the door", async () => {
  const p = await plane();
  p.size.v = null;
  const answer = await p.stats(p.tokens.founder);
  assert.equal(answer.result.dbBytes, null, "record-core answers null for a storage that states none");
  const o = await screenAs(p, FOUNDER, p.tokens.founder);
  has(o, G + "unstated");
  lacks(o, G + "size", { used: "0.0", limit: "10", percent: "0" });
});
