/* store-request's published fixtures (K4990, K4993; K5046 (d), K5054): made by the real code when a test runs, never stored.
   `storeWorld()` is `store-assembly`'s world (its R90–R94) with this module's door, sign-ins and recipes over it (R16–R19):
   the real store, the real claim and sign-in, the page's door, recipes of real acts and a pinned clock. */
import { storeWorld as assemblyWorld, WORLD_NOW, WORLD_PASSWORD, WORLD_FOUNDER_HANDLE } from "../store-assembly/world.mjs";
import { doorOf, bootOf, signIn, admittedAs, hold, project, trail, profiles, WORLD_UNREACHED, WORLD_ORIGIN } from "./door.mjs";

export { WORLD_NOW, WORLD_PASSWORD, WORLD_FOUNDER_HANDLE, WORLD_UNREACHED, WORLD_ORIGIN, doorOf, bootOf, signIn, admittedAs };

/** The binding tokens a world's `env` holds (the classes an operator binds; `admission`'s `BINDINGS`), each live. */
export const WORLD_TOKENS = Object.freeze({ ADMIN_TOKEN: "world-root-of-trust-7f3a9c2e5b1d4086",
                                           PROBE_TOKEN: "world-probe-credential-2c8e41a7d0b6",
                                           DAEMON_TOKEN: "world-daemon-credential-91f0c3e6a2d8" });
/** The producing team a world records, by the root of trust's own act (`instancegroupseed`), as an installer's first boot does. */
export const WORLD_GROUP = "world-town";

/** `storeWorld({claimed?, now?, env?, group?})` (op-tables §5.2, K5054): store-assembly's world with the binding tokens of
 *  `WORLD_TOKENS` and its producing team recorded by the real `instancegroupseed` (`group: null` records none), plus
 *  `door(req, as)` (R17: what a page's `fetch("/api/?op=...")` receives), `signIn(handle, {admin?, capabilities?, device?})` (R16),
 *  `plane(as)` and `boot(as)` (R18: `{door, session}` for interface-shell's `boot`), `session(as)` (the record `{t, e, d, w}`),
 *  `admitted(token, op?)` (admission's caller for a token) and `recipes.hold|project|trail|profiles` (R19), each of real acts;
 *  `store`, `ctx`, `sql`, `tick(ms)` are the world's own. */
export async function storeWorld({ group = WORLD_GROUP, env = {}, ...opts } = {}) {
  const world = await assemblyWorld({ ...opts, env: { ...WORLD_TOKENS, ...env } });
  const door = doorOf(world);
  if (group) {
    const seeded = await door({ url: "/api/?op=instancegroupseed", init: { method: "POST",
      headers: { authorization: `Bearer ${world.env.ADMIN_TOKEN}`, "content-type": "application/json" }, body: JSON.stringify({ slug: group }) } });
    const r = seeded.json && seeded.json.result;
    if (!r || r.ok !== true) throw new Error(`storeWorld: the producing team was not recorded: ${JSON.stringify(seeded.json).slice(0, 300)}`);
  }
  return Object.assign(world, {
    door: (req, as = null) => door(req, as),
    signIn: (handle, o) => signIn(world, handle, o),
    admitted: (token, op) => admittedAs(world, token, op),
    plane: (as) => bootOf(world, as),
    boot: (as) => bootOf(world, as),
    session: (as) => (as ? as.session : null),
    recipes: {
      hold: (as, name, text, projectId) => hold(world, as, name, text, projectId),
      project: (as, title) => project(world, as, title),
      trail: (as, projectId, label) => trail(world, as, projectId, label),
      profiles: (as, ids) => profiles(world, as, ids),
    },
  });
}
