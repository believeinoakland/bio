/* store-request's published fixtures (K4990, K4993; K5046 (d), K5054): made by the real code when a test runs, never stored.
   `storeWorld()` is `store-assembly`'s world (its R90–R94) with this module's door, sign-ins and recipes over it (R16–R19):
   the real store, the real claim and sign-in, the page's door, recipes of real acts and a pinned clock. */
import { storeWorld as assemblyWorld, WORLD_NOW, WORLD_PASSWORD, WORLD_FOUNDER_HANDLE, WORLD_INSTANCE_NAME, memoryBucket } from "../store-assembly/world.mjs";
import { doorOf, bootOf, routeOf, signIn, admittedAs, hold, project, trail, profiles, queue, WORLD_UNREACHED, WORLD_ORIGIN } from "./door.mjs";
import { page, pdf, question, questions, contradiction, conflict, setAside, finding, signer, published, imported, cited, rerun, assistant, writingHelp } from "./recipes.mjs";

export { WORLD_NOW, WORLD_PASSWORD, WORLD_FOUNDER_HANDLE, WORLD_UNREACHED, WORLD_ORIGIN, doorOf, bootOf, routeOf, signIn, admittedAs };

/** The binding tokens a world's `env` holds (the classes an operator binds; `admission`'s `BINDINGS`), each live. */
export const WORLD_TOKENS = Object.freeze({ ADMIN_TOKEN: "world-root-of-trust-7f3a9c2e5b1d4086",
                                           PROBE_TOKEN: "world-probe-credential-2c8e41a7d0b6",
                                           DAEMON_TOKEN: "world-daemon-credential-91f0c3e6a2d8" });
/** The producing team a world records: the one store-assembly's base binds as `INSTANCE_NAME` at its first boot (K5149), as an installer does. */
export const WORLD_GROUP = WORLD_INSTANCE_NAME;
/** What `storeWorld({ ai: true })` adds to the environment: the seal secret a team's Claude key is kept under, and the instance named a test instance
 *  (`CIVICSMITH_TEST_INSTANCE` equal to `INSTANCE_NAME`, as ai-runs reads it), the only instance a run opens on while no AI part is verified. */
export const WORLD_AI_SECRET = "world-account-seal-secret-3b9d71c4e0a5f628";

/** `storeWorld({claimed?, now?, env?, ai?})` (op-tables §5.2, K5054): store-assembly's world (its producing team recorded at its first boot, K5149) with the binding tokens of
 *  `WORLD_TOKENS`, plus
 *  `door(req, as)` (R17: what a page's `fetch("/api/?op=...")` receives), `signIn(handle, {admin?, capabilities?, device?})` (R16),
 *  `plane(as)` and `boot(as)` (R18: `{door, session}` for interface-shell's `boot`), `route(as)` (R18: a Playwright route handler answering the page's `/api/` from the door, for a browser test), `session(as)` (the record `{t, e, d, w}`),
 *  `admitted(token, op?)` (admission's caller for a token) and `recipes.hold|project|trail|profiles` (R19), each of real acts;
 *  `store`, `ctx`, `sql`, `tick(ms)` are the world's own. */
export async function storeWorld({ env = {}, ai = false, ...opts } = {}) {
  const name = WORLD_GROUP;
  const world = await assemblyWorld({ ...opts, env: { ...WORLD_TOKENS, PUBLISHED: memoryBucket(), ...(ai ? { ACCOUNT_SEAL_SECRET: WORLD_AI_SECRET, INSTANCE_NAME: name, CIVICSMITH_TEST_INSTANCE: name } : {}), ...env } });
  const door = doorOf(world);
  const make = () => storeWorld();
  return Object.assign(world, {
    door: (req, as = null) => door(req, as),
    signIn: (handle, o) => signIn(world, handle, o),
    admitted: (token, op) => admittedAs(world, token, op),
    plane: (as) => bootOf(world, as),
    boot: (as) => bootOf(world, as),
    route: (as) => routeOf(world, as),
    session: (as) => (as ? as.session : null),
    recipes: {
      hold: (as, name, content, projectId, opts) => hold(world, as, name, content, projectId, opts),
      project: (as, title, o) => project(world, as, title, o),
      trail: (as, projectId, label) => trail(world, as, projectId, label),
      profiles: (as, ids) => profiles(world, as, ids),
      queue: (spec) => queue(world, spec),
      page: (as, name, o) => page(world, as, name, o),
      pdf: (as, name, o) => pdf(world, as, name, o),
      question: (as, projectId, o) => question(world, as, projectId, o),
      questions: (as, projectId, n, o) => questions(world, as, projectId, n, o),
      contradiction: (as, o) => contradiction(world, as, o),
      conflict: (as, o) => conflict(world, as, o),
      setAside: (as, o) => setAside(world, as, o),
      finding: (as, projectId, o) => finding(world, as, projectId, o),
      signer: (as) => signer(world, as),
      published: (as, found) => published(world, as, found),
      imported: (as, o) => imported(world, as, o, make),
      cited: (as, projectId, o) => cited(world, as, projectId, o, make),
      rerun: (as, o) => rerun(world, as, o, make),
      assistant: (as, o) => assistant(world, as, o),
      writingHelp: (as, o) => writingHelp(world, as, o),
    },
  });
}
