/* public-read over `publication` as it stands (K651: the copy runs against publication's R53–R55 and its tables under
   its R40), on `publication`'s own world: the real modules over a real SQLite database shaped as workerd's storage
   (`../publication/fixture.mjs`, reused rather than copied). `w.pr` is this module's instance on the world's host;
   `w.read(op, query)` runs one of this module's ops as the plane store's op map runs it (`publicReadOps`, spread in
   `../../../src/plane/store.mjs`; control-plane's routes reach it), and `storeOps(w, url, body)` is that op map's part
   these ops share: `publicationOps` with `publicReadOps` spread beside it, which a Worker test's stub store answers
   from. */
import { planeWorld, world as bareWorld } from "../publication/fixture.mjs";
import { publicationOps } from "../../../src/publication/index.mjs";
import { publicReadOf, publicReadOps } from "../../../src/public-read/index.mjs";

export { cursor, V, SIG, NOW, KEY, sha, caseDoc, inquiryMd } from "../publication/fixture.mjs";

function withRead(w) {
  w.pr = publicReadOf(w.host, { publication: w.p });
  w.read = (name, query = {}) => {
    const url = new URL(`http://do/${name}`);
    for (const [k, v] of Object.entries(query)) if (v != null) url.searchParams.set(k, String(v));
    return publicReadOps(w.pr, url)[name]();
  };
  return w;
}

/** A world with this module on it (workerd-shaped storage, as publication's own tests use). */
export const world = (opts = {}) => withRead(planeWorld(opts));
/** The same over array-answering storage. */
export const arrayWorld = (opts = {}) => withRead(bareWorld(opts));

/** The plane store's op map, its part here: publication's ops, and this module's beside them (`plane/store.mjs`). */
export const storeOps = (w, url, body = null) => ({ ...publicationOps(w.p, url, body), ...publicReadOps(w.pr, url) });

/** The published store's Durable Object: the op map over this world, in the envelope the plane reads. */
export function stubOf(w, { silent = false } = {}) {
  return { async fetch(req, init) {
    if (silent) return new Response("down", { status: 500 });
    const r = typeof req === "string" ? new Request(req, init) : req;
    const url = new URL(r.url);
    const op = url.pathname.slice(1);
    const body = r.method === "POST" ? JSON.parse((await r.text()) || "{}") : null;
    const ops = storeOps(w, url, body);
    if (!ops[op]) return Response.json({ ok: false, error: `unknown op: ${op}` }, { status: 400 });
    return Response.json({ ok: true, result: await ops[op]() });
  } };
}

/** The published bucket, in memory. */
export function bucket() {
  const m = new Map();
  return { m,
    async get(k) { const v = m.get(k); return v ? { arrayBuffer: async () => v.buffer.slice(v.byteOffset, v.byteOffset + v.byteLength) } : null; },
    async head(k) { return m.has(k) ? {} : null; },
    async put(k, v) { m.set(k, v instanceof Uint8Array ? v : new TextEncoder().encode(String(v))); } };
}
