/* capture, G41 follow-up second cause, platform check L (R107): a CSV of 9 MB, held in two parts, uploaded through the whole plane (the
   Worker's entry under Miniflare, real Durable Object SQLite and R2) with a declared type, and with a name only, is stored `csv`. */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const T = { admin: "cap-adm", member: "cap-mem" };
let mf;

before(async () => {
  mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: T.admin, MEMBER_TOKEN: T.member, VERSION: "test" },
    outboundService(req) {
      if (new URL(req.url).hostname === "docs.example.org")
        return new Response("the minutes of the meeting", { headers: { "content-type": "text/plain" } });
      return new Response("unscripted", { status: 500 });
    },
  });
});
after(async () => { if (mf) await mf.dispose(); });

const send = async (q, init) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`, init);
  const text = await res.text();
  let body = null; try { body = JSON.parse(text); } catch { body = null; }
  return { status: res.status, body, text };
};
/* A member's own session (the shared member key is retired, MEMBER_TOKEN_RETIRED): enrolled by the administrator and
   signed in with the member's password. Every credential travels in the Authorization header, never the address
   (CREDENTIAL_IN_ADDRESS). */
let session = null;
const bearer = (token, init = {}) => ({ ...init, headers: { ...(init.headers || {}), authorization: `Bearer ${token}` } });
const signedIn = async () => {
  if (session) return session;
  const post = async (q, token, body) => (await send(q, bearer(token, { method: "POST", body: JSON.stringify(body) }))).body;
  const add = await post("op=memberadd", T.admin, { memberId: "m1", cover: "cover for m1", role: "member", capabilities: ["contribute"] });
  const unwrap = (j) => (j && typeof j === "object" && "result" in j ? j.result : j);
  const invite = unwrap(add) && unwrap(add).invite;
  if (!invite) throw new Error(`memberadd: ${JSON.stringify(add)}`);
  const en = unwrap((await send("op=enroll", { method: "POST", body: JSON.stringify({ invite, handle: "m1", password: "m1-passphrase-capture" }) })).body);
  if (!en || !en.ok) throw new Error(`enroll: ${JSON.stringify(en)}`);
  const lg = unwrap((await send("op=login", { method: "POST", body: JSON.stringify({ handle: "m1", password: "m1-passphrase-capture" }) })).body);
  if (!lg || !lg.token) throw new Error(`login: ${JSON.stringify(lg)}`);
  return (session = lg.token);
};
const member = async (q, init = {}) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`, bearer(await signedIn(), init));
  const text = await res.text();
  let body = null; try { body = JSON.parse(text); } catch { body = null; }
  return { status: res.status, body, text };
};


const MiB = 1024 * 1024;
const csvOf = (size) => {
  const out = new Uint8Array(size);
  let at = 0, n = 0;
  while (at < size) {
    const row = new TextEncoder().encode(`${n++},row number ${n},some text,3.14\n`);
    const take = Math.min(row.length, size - at);
    out.set(row.subarray(0, take), at); at += take;
  }
  out[size - 1] = 10;
  return out;
};
const statement = encodeURIComponent("a spreadsheet export the clerk handed me at the counter");

test("R107 G41 (platform L): a 9 MB CSV in two parts uploaded through the plane is stored csv, declared text/csv or named x.csv; control: the same bytes with neither stay undetermined", async () => {
  const bytes = csvOf(9 * MiB);
  const seen = {};
  for (const [why, extra] of [["declared", "&type=text%2Fcsv&name=x.dat"], ["named", "&name=x.csv"], ["neither", "&name=x.dat"]]) {
    /* a different last byte for each, so each is a new document and not a second sighting */
    const body = bytes.slice(); body[body.length - 2] = 48 + Object.keys(seen).length;
    const r = await member(`op=captureupload&statement=${statement}${extra}`, { method: "POST", body, headers: { "content-type": "application/octet-stream" } });
    const unwrap = (j) => (j && typeof j === "object" && "result" in j ? j.result : j);
    const out = unwrap(r.body);
    assert.equal(r.status, 200, r.text.slice(0, 400));
    assert.equal(out.ok, true, r.text.slice(0, 400));
    assert.equal(out.document.parts.length, 2, `${why}: two parts`);
    seen[why] = out.document.profile.format.format;
  }
  assert.deepEqual(seen, { declared: "csv", named: "csv", neither: "undetermined" });
});
