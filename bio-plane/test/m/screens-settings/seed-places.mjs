/* The world for places, grouprules and bias (screens-settings R19, R25, R46, R60, R61 ...): the team's state made by the real acts of
   the owners, over store-request's world. A table is kept only to script a fault (`"none"`, a read made to fail) or an answer
   the owner gives that the page cannot be made to ask for, which is built here from the owner's own answer. */
import { storeWorld } from "./kit.mjs";
import { env } from "./fixtures.mjs";

export const PROFILE = "oakland-alameda";

/** A world with the founder (its one active administrator) and dev (a member who administers nothing), the Oakland profile active unless `profile: false`. */
export async function team({ profile = true } = {}) {
  const w = await storeWorld();
  const founder = await w.signIn("founder");
  const dev = await w.signIn("dev");
  if (profile) await w.recipes.profiles(founder, [PROFILE]);
  return { w, founder, dev };
}

/** An act of a machine class (the root of trust's token): what the team's seeding does, an author the screens read as `class:admin`. Throws when refused. */
export async function machineAct(w, op, body) {
  const a = await w.door({ url: `/api/?op=${op}`, init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } }, { token: w.env.ADMIN_TOKEN });
  const r = a.json && a.json.result;
  if (a.status >= 400 || !r || r.ok === false) throw new Error(`${op} was refused: ${JSON.stringify(a.json).slice(0, 300)}`);
  return r;
}

/** The owner's own answer to a request the page cannot be made to send (an act with a body of the caller's choosing): the whole enveloped answer. */
export async function rawAnswer(w, as, op, body, query = {}) {
  const a = await w.door({ url: `/api/?${new URLSearchParams({ op, ...query })}`, init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } }, as);
  return a.json;
}

/** `n` offices the team holds, the last made by a machine (so that it reads as seeded), one page and one more of the offices read (500 a page). */
export async function manyOffices(w, founder, n) {
  for (let i = 0; i < n - 1; i++) await founder.act("entitycreate", { body: { kind: "office", label: "Office " + String(i).padStart(4, "0"), note: "n" } });
  await machineAct(w, "entitycreate", { kind: "office", label: "Seeded office", note: "n" });
}

/** Every page of the offices (the owner's own reads, 500 a page). */
export async function officesOf(as) {
  const out = []; let after = null;
  do {
    const r = await as.read("entitieskind", { query: { kind: "office", limit: "500", ...(after ? { after } : {}) } });
    out.push(...r.entities); after = r.next;
  } while (after);
  return out;
}

/** A table that answers every read of `op` as the world does, but a read `after` a first page, silently failing (a later page that cannot be read). */
export const laterPageFails = (as) => ({ entitieskind: async (q) => (q.after ? "none" : env(await as.read("entitieskind", { query: q }))) });
/** A table that answers the courts read silently failing, every other read as the world does. */
export const courtsFail = (as) => ({ entitieskind: async (q) => (q.kind === "body" ? "none" : env(await as.read("entitieskind", { query: q }))) });
/** The world's answer to `startfrom`, with the elsewhere route's pointer unread (null): a list that could not be read. */
export const pointerUnread = (as) => ({ startfrom: async () => { const r = await as.read("startfrom"); return env({ ...r, routes: r.routes.map((x) => (x.route === "elsewhere" ? { ...x, pointer: null } : x)) }); } });
/** The world's answer to `profiles`, with a profile held that is only for tests among those active (the world refuses to activate one). */
export const testProfileActive = (as) => ({ profiles: async () => { const r = await as.read("profiles"); return env({ ...r, profiles: [{ id: "test-port-ellery", name: "Port Ellery", covers: [], test: true }] }); } });
/** The world's answer to `profiles`, with no profile offered to choose (the world's jurisdictions always offer one). */
export const noChoices = (as) => ({ profiles: async () => env({ ...(await as.read("profiles")), choices: [] }) });
