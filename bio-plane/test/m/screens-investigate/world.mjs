/* screens-investigate's tests over `store-request`'s world (K5148, K5054; op-tables §5.3, §5.5): the real store, a real sign-in, the page's door.
   A table a test scripted becomes the acts that make it (`recipes.hold|project|trail|profiles`, `recordfact`, `createset`, ...); the values a test
   asserts are read back from the world's own answers, never copied from a literal. The frame's defaults (`whoami`, `groupidentity`, ...) are the world's. */
import { boot, counted } from "../interface-shell/harness.mjs";
import { storeWorld, WORLD_FOUNDER_HANDLE } from "../store-request/fixtures.mjs";
import { SCREENS } from "./fixtures.mjs";

export { storeWorld, WORLD_FOUNDER_HANDLE };

/** A fresh world with `handle` signed in (an administrator unless `admin: false`; the founder when `founder` is true). Answers `{world, me}`. */
export async function inWorld({ handle = "rosa", admin = true, capabilities = null, founder = true } = {}) {
  const world = await storeWorld({ group: null });
  const me = await world.signIn(founder ? WORLD_FOUNDER_HANDLE : handle, { admin, capabilities });
  return { world, me };
}

/** The screens of this module at `path`, as `me`, over the world's door; `plane` replaces an op's answer (a fault or an externally driven answer
 *  only: K5044 (1)). Settles until every read has answered. */
export async function openAs(world, me, path, { plane = {}, ...options } = {}) {
  const { door, session } = world.boot(me);
  const p = await boot({ screens: SCREENS, path, plane, door: counted(door), session, ...options });
  await settled(p);
  return p;
}

/** Every read the page made has answered and the page is quiet. */
export async function settled(p) {
  let last = -1, stable = 0;
  for (let i = 0; i < 1500 && stable < 8; i++) {
    await p.settle(20); await new Promise((r) => setTimeout(r, 10));
    /* looked up each time: choosing a document redraws the screen and replaces `#cs-main` */
    const main = p.doc.getElementById("cs-main");
    const busy = main.querySelectorAll('[data-state="loading"]').length > 0;
    stable = !busy && p.requests.length === last ? stable + 1 : 0; last = p.requests.length;
  }
}

/** An op's answer as the world gives it, changed by `fn(request, answer)`: for a record the live copy holds that this build does not make
 *  (K5044 (1)); every other part of the answer is the world's own. */
export function rewrite(world, me, fn) {
  const { door } = world.boot(me);
  return async (req) => fn(req, await door(req));
}

/** The reading of a held document, made by the store's own `readheld` route (the door's reading step after an upload, which the world does not
 *  follow, `store-request` R17), then read back: answers the document's text units `[{extent, text}]`. */
export async function readHeld(world, me, sha) {
  const made = await world.send({ url: `http://x/readheld?sha=${sha}&viewer=${encodeURIComponent(me.member)}&store=bio`, method: "POST", body: {}, headers: {} });
  if (made.status >= 400) throw new Error(`readHeld: ${made.status} ${(await made.text()).slice(0, 300)}`);
  const r = await me.read("reading", { query: { sha256: sha } });
  return Array.isArray(r.text_units) ? r.text_units : [];
}

/** An act the store refuses, asked as the page asks it: answers the refusal (`{ok: false, code, ...}`), never throws. */
export async function refused(world, me, op, body) {
  const a = await world.door({ url: `/api/?op=${op}`, init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } }, me);
  const r = a && a.json && a.json.result !== undefined ? a.json.result : a && a.json;
  return r;
}

/** A standard the member declares (`standarddeclare`, her own act) over the passage `unit` of a held, read document. Answers the standard's id. */
export async function declareStandard(me, { cite, kind = "ordinance", issuer = "City Council", sha, extent, period = null, reason = "We hold the city to it." }) {
  return (await me.act("standarddeclare", { body: { cite, kind, issuer, reason, text: [{ capture_sha: sha, extent }], ...(period ? { period } : {}) } })).id;
}
