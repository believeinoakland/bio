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

/** A docket on its public interface (`docket` R12, R14, R15): `withdrawalOf`, `lastEntryOf`, `docketPublic`, `docketFeed`, over cases
 *  a test declares (`cases`) and the public entries and withdrawals it places (`place`). A case it does not hold answers
 *  null, as an absent one; `calls` records every read, so a test can see what was asked and that nothing was written. */
export function docketOn({ cases = [] } = {}) {
  const held = new Map(cases.map((c) => [c, []]));
  const calls = [];
  const d = {
    held, calls,
    hold(c) { if (!held.has(c)) held.set(c, []); return d; },
    /* a public entry: `{seq, date, kind, edition, reason, digest}` as `docket` R6 and R12 state them */
    place(c, entry) { d.hold(c); held.get(c).push({ ...entry }); return d; },
    withdrawalOf({ case: c, edition }) {
      calls.push(["withdrawalOf", c, edition]);
      const w = (held.get(c) || []).find((e) => e.kind === "withdrawal"
        && (e.edition === edition || (e.edition === "all" && (e.covers || []).includes(edition))));
      return w ? { seq: w.seq, entry: `${c}#${w.seq}`, date: w.date, reason: w.reason, digest: w.digest } : null;
    },
    /* synchronous, without any capture's bytes (`docket` R14, K1276): the latest public entry's date, or null */
    lastEntryOf({ case: c }) {
      calls.push(["lastEntryOf", c]);
      const es = held.get(c) || [];
      return es.length ? es[es.length - 1].date : null;
    },
    /* async, as `docket` answers it (B3): `{ok, case, group, entries, captures, last_entry, feed}` */
    async docketPublic({ case: c }) {
      calls.push(["docketPublic", c]);
      if (!held.has(c)) return null;
      const entries = held.get(c).map((e) => ({ seq: e.seq, entry: `${c}#${e.seq}`, digest: e.digest ?? null,
        json: JSON.stringify(e), fields: { ...e }, signature: "-----BEGIN SSH SIGNATURE-----", published_at: e.date,
        taken_back: null }));
      return { ok: true, case: c, group: "parks-group", entries, captures: {},
               last_entry: entries.length ? entries[entries.length - 1].fields.date : null,
               feed: `op=docketfeed&case=${encodeURIComponent(c)}` };
    },
    async docketFeed({ case: c }) {
      calls.push(["docketFeed", c]);
      if (!held.has(c)) return null;
      const es = [...held.get(c)].reverse();
      return `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><id>${c}</id>`
        + es.map((e) => `<entry><id>${c}#${e.seq}</id><updated>${e.date}</updated></entry>`).join("") + "</feed>";
    },
  };
  return d;
}

function withRead(w, opts = {}) {
  w.docket = opts.docket || docketOn();
  w.pr = publicReadOf(w.host, { publication: w.p, docket: w.docket });
  w.read = (name, query = {}) => {
    const url = new URL(`http://do/${name}`);
    for (const [k, v] of Object.entries(query)) if (v != null) url.searchParams.set(k, String(v));
    return publicReadOps(w.pr, url)[name]();
  };
  return w;
}

/** A world with this module on it (workerd-shaped storage, as publication's own tests use). */
export const world = (opts = {}) => withRead(planeWorld(opts), opts);
/** The same over array-answering storage. */
export const arrayWorld = (opts = {}) => withRead(bareWorld(opts), opts);

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
