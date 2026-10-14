/* journey-check R1: the two arms. `runLocal` walks journey 28 from the installer through the hand-over into the copy and
   on, then journey 3, then sweeps the registry's screens; `runLive` signs in to a named test instance as its
   administrator and as a member and sweeps every working screen. Each answers the walk (its steps, its failures, its
   report); R3's guard runs before anything is written to the instance. */
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Walk, StepFailed, FAIL } from "./walker.mjs";
import { requireTestInstance, WalkRefused } from "./guard.mjs";
import { walkInstaller, walkFounder, inviteMember, walkMember, walkWelcome, sweep, credentials, open, act, requireDrawn } from "./journeys.mjs";
import { sweepScreens } from "./screens.mjs";

export const OUT = join(dirname(fileURLToPath(import.meta.url)), "out");

export async function browser() {
  const { chromium } = await import("playwright-core");
  return chromium.launch({ ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}) });
}

/* A browser context (one person's device) whose pages the walk watches. `route(context)` sends its requests where the
   arm says; the clock is installed so the lock can be reached without waiting (interface-shell R33). */
async function device(walk, b, route) {
  const context = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await route(context);
  const page = walk.watch(await context.newPage());
  await page.clock.install();
  return { context, page };
}

/* The local arm (R1 (a)), with no account. */
export async function runLocal({ out = join(OUT, "local"), world: makeWorld } = {}) {
  const { localWorld, INSTALLER_ORIGIN } = await import("./local.mjs");
  const world = await (makeWorld || localWorld)();
  const walk = new Walk({ out, arm: "local", ownHosts: [new URL(INSTALLER_ORIGIN).host, "dash.cloudflare.com"] });
  const who = credentials();
  for (const p of [who.founder.password, who.member.password, who.newcomer.password]) walk.keepSecret(p);
  const b = await browser();
  const route = (ctx) => world.route(ctx, (u) => walk.foreign(u));
  try {
    walk.journey = "journey 28";
    const founder = await device(walk, b, route);
    const { copy } = await walkInstaller(walk, founder.page, INSTALLER_ORIGIN);
    walk.copyHost = new URL(copy).host;
    /* R3: before the hand-over writes anything, the copy must be a test instance. */
    await requireTestInstance(copy, (req) => world.fetchCopy(req));
    const { invite } = await walkFounder(walk, founder.page, { base: copy, founder: who.founder });
    const mai = await device(walk, b, route);
    await walkMember(walk, mai.page, { base: copy, invite, member: who.member });
    const teo = await device(walk, b, route);
    walk.journey = "journey 3";
    const second = await inviteMember(walk, founder.page, copy, { id: "teo", cover: "Teo, from flat 9" });
    await walkWelcome(walk, teo.page, { base: copy, link: second, member: who.newcomer });
    await sweep(walk, founder.page, copy);
  } catch (e) {
    if (e instanceof WalkRefused) walk.fail(FAIL.REFUSAL, e.message);
    else if (!(e instanceof StepFailed)) walk.fail(FAIL.STEP, e.stack || e.message);
  } finally {
    for (const u of world.unansweredAll()) walk.fail(FAIL.ADDRESS, `unanswered: ${u}`);
    await b.close().catch(() => {});
    await world.close();
  }
  return { walk, report: walk.report(), ok: walk.failures.length === 0 };
}

/* The live arm (R1 (b)): `base` a named test instance; the credentials are read from the environment and never printed:
   JOURNEY_ADMIN_HANDLE, JOURNEY_ADMIN_PASSWORD, JOURNEY_MEMBER_HANDLE, JOURNEY_MEMBER_PASSWORD. */
export async function runLive({ base, env = process.env, out = join(OUT, "live"), fetchOf = fetch } = {}) {
  const walk = new Walk({ out, arm: "live" });
  const need = ["JOURNEY_ADMIN_HANDLE", "JOURNEY_ADMIN_PASSWORD", "JOURNEY_MEMBER_HANDLE", "JOURNEY_MEMBER_PASSWORD"];
  for (const k of need) if (env[k]) walk.keepSecret(env[k]);
  const missing = need.filter((k) => !env[k]);
  try {
    if (!base) throw new WalkRefused("NO_INSTANCE", "the live arm needs the test instance's address (--live <address>)");
    if (missing.length) throw new WalkRefused("NO_CREDENTIALS", `the environment does not hold ${missing.join(", ")}`);
    await requireTestInstance(base, fetchOf);
    walk.copyHost = new URL(base).host;
    const b = await browser();
    try {
      const sweepAs = async (role, handle, password, screens) => {
        walk.journey = `as ${role}`;
        const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
        await ctx.route("**/*", (r) => (new URL(r.request().url()).host === walk.copyHost ? r.continue()
          : (walk.foreign(r.request().url()), r.abort("blockedbyclient"))));
        const page = walk.watch(await ctx.newPage());
        await walk.step(page, `${role}: open / and sign in`, async (p) => {
          await open(walk, p, base, "/", "front");
          await act(p, "login", { fields: { "fs-handle": handle, "fs-pw": password } });
          await p.waitForFunction(() => location.pathname === "/app" || location.pathname === "/", null, { timeout: 15000 });
          await requireDrawn(walk, p, "home");
        });
        await sweep(walk, page, base, { screens });
        await ctx.close();
      };
      const working = sweepScreens().filter((s) => s.frame === "working" || s.frame === "dock");
      await sweepAs("administrator", env.JOURNEY_ADMIN_HANDLE, env.JOURNEY_ADMIN_PASSWORD, working);
      await sweepAs("member", env.JOURNEY_MEMBER_HANDLE, env.JOURNEY_MEMBER_PASSWORD, working);
    } finally { await b.close().catch(() => {}); }
  } catch (e) {
    if (e instanceof WalkRefused) walk.fail(FAIL.REFUSAL, e.message);
    else if (!(e instanceof StepFailed)) walk.fail(FAIL.STEP, e.stack || e.message);
  }
  return { walk, report: walk.report(), ok: walk.failures.length === 0 };
}
