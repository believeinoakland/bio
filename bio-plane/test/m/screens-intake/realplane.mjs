/* The REAL plane behind the served `capture` page, for this module's fix-round-10 tests (K4990, K4993, K4995: a test takes another module's answer from the
 * provider's own code, never builds it). Miniflare (real DO and R2) loaded from the plane's file path as `t51-seam-g126h.test.mjs` does; every request the page makes is
 * forwarded to the real door with the founder's session, its raw body (a File) as bytes. `deferred` is the one named edit tests make to a real upload answer: the live
 * door defers a picture's reading (K4428: why is open for the redeploy), the local one reads it inline. */
import "../../sandbox.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { generate } from "../../corpus.mjs";
import { open, fill, press, idle } from "./page.mjs";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ORIGIN = "https://group.example";
/* every op the capture screen's flows reach on the way from an upload to its reading */
const OPS = ["captureupload", "allocid", "promote", "heldat", "heldcaptures", "opencaptures", "capturerequests", "reading", "readheld", "search", "projectlist", "image", "memberlist", "captureseenin", "select", "release", "heldsetaside", "heldrestore"];

export function realPlane(tag) {
  const ADM = `adm-${tag}-0123456789abcdef`, PASSWORD = `the founder's long password, ${tag}`;
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: `mem-${tag}-0123456789abcdef`, PROBE_TOKEN: `prb-${tag}-0123456789abcdef`, VERSION: "4.7.2", INSTANCE_NAME: `${tag}-town` },
  });
  const door = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);

  async function founder() {
    await (await door("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) })).arrayBuffer();
    const signed = await (await door("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
    assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
    return { authorization: `Bearer ${signed.result.token}` };
  }

  /* the page's plane table: each op forwarded to the real door; `edit[op]` is a NAMED edit of one real answer */
  function viaDoor(auth, edit = {}) {
    return Object.fromEntries(OPS.map((op) => [op, async (req) => {
      const has = req.init.body !== undefined;
      const raw = has && typeof req.init.body !== "string" ? Buffer.from(await req.init.body.arrayBuffer()) : null;
      const r = await door(`/api/?${new URLSearchParams(req.query)}`, { method: has ? "POST" : "GET", headers: { ...auth, ...(raw ? {} : { "content-type": "application/json" }) }, ...(has ? { body: raw || req.init.body } : {}) });
      const json = await r.json();
      return { status: r.status, json: edit[op] ? edit[op](json) : json };
    }]));
  }

  /* the upload answer given `reading_pending: true` and no reading of its own */
  const deferred = (json) => {
    if (!json || !json.result) return json;
    const { reading: _r, text_units: _u, completeness: _c, ...answer } = json.result;
    const { reading: _dr, text_units: _du, ...document } = answer.document || {};
    return { ...json, result: { ...answer, ...(answer.document ? { document } : {}), reading_pending: true } };
  };

  /* a generated file uploaded through the served File tab, and the page after the promotion has settled */
  async function uploaded(auth, recipe, name, edit = {}) {
    const f = generate(recipe), bytes = Buffer.from(await f.bytes());
    const p = await open("/app/capture/file", { plane: viaDoor(auth, { captureupload: deferred, ...edit }) });
    fill(p, { "ci-file": new File([bytes], name, { type: f.type }), "ci-how-made": true, "ci-where": "City hall", "ci-what": "The scan." });
    await press(p, "captureupload");
    await p.clock.tick(1);
    await idle(p, 3000);
    return p;
  }

  /* the page's clock is ticked, a step of thirty seconds at a time, until what the test waits for is drawn (the plane's own jobs run on its alarm, however loaded the
     machine is): a bound of counts, never a time (R66) */
  async function ticksUntil(p, drawn, steps = 20) {
    for (let i = 0; i < steps && !drawn(); i++) { await p.clock.tick(i === 0 ? 21000 : 30000); await idle(p, 3000); }
    return drawn();
  }

  return { door, founder, viaDoor, deferred, uploaded, ticksUntil, dispose: () => mf.dispose() };
}
