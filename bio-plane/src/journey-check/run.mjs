/* journey-check R1: the two arms. `runLocal` walks journey 28 from the installer through the hand-over into the copy and
   on, then journey 3, then sweeps the registry's screens; `runLive` signs in to a named test instance as its
   administrator and as a member, each verified by `whoami`, and sweeps every working screen beside the design mock.
   Each answers the walk (its steps, its failures, its report); R3's guard runs before anything is written. */
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import https from "node:https";
import { Walk, StepFailed, FAIL, settle } from "./walker.mjs";
import { requireTestInstance, WalkRefused } from "./guard.mjs";
import { walkInstaller, walkFounder, inviteMember, walkMember, walkWelcome, sweep, credentials, open, act, requireDrawn, drawnActs } from "./journeys.mjs";
import { sweepScreens } from "./screens.mjs";
import { designMock, pageLimits, pair, WIDTHS, viewportOf } from "./design.mjs";

export const OUT = join(dirname(fileURLToPath(import.meta.url)), "out");

/* R5: a Chromium that reaches every address directly, through no proxy the environment names. The headless shell
   ignores `--no-proxy-server` alone and follows an environment proxy; `--proxy-server=direct://`, last, holds in both. */
export const DIRECT_ARGS = Object.freeze(["--no-proxy-server", "--proxy-server=direct://"]);

export async function browser({ direct = false, args = [] } = {}) {
  let chromium;
  try { ({ chromium } = await import("playwright-core")); }
  catch (e) { throw new Error(`playwright-core cannot be loaded (run \`npm ci\` in ${dirname(fileURLToPath(import.meta.url))}): ${e.message}`); }
  return chromium.launch({ ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}),
    args: [...args, ...(direct ? DIRECT_ARGS : [])] });
}

/* R5: a fetch that reaches the instance directly. Node's own fetch follows the environment's proxy (NODE_USE_ENV_PROXY);
   a request on an agent of its own does not. */
export async function directFetch(req) {
  const u = new URL(req.url);
  const lib = u.protocol === "https:" ? https : http;
  const body = ["GET", "HEAD"].includes(req.method) ? null : Buffer.from(await req.arrayBuffer());
  return new Promise((done, failed) => {
    const q = lib.request(u, { method: req.method, headers: Object.fromEntries(req.headers), agent: new lib.Agent() }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => done(new Response(res.statusCode === 204 ? null : Buffer.concat(chunks),
        { status: res.statusCode, headers: Object.entries(res.headers).flatMap(([k, v]) => (Array.isArray(v) ? v.map((x) => [k, x]) : [[k, String(v)]])) })));
      res.on("error", failed);
    });
    q.on("error", failed);
    q.end(body);
  });
}

/* What an arm's error says in its walk: a refusal, or a step that stopped (a StepFailed has said so already). */
function failed(walk, e) {
  if (e instanceof WalkRefused) walk.fail(FAIL.REFUSAL, e.message);
  else if (!(e instanceof StepFailed)) walk.fail(FAIL.STEP, e.stack || e.message);
}

/* A browser context (one person's device) whose pages the walk watches. `route(context)` sends its requests where the
   arm says; the clock is installed so the lock can be reached without waiting (interface-shell R33). */
async function device(walk, b, route, viewport = { width: 1280, height: 900 }) {
  const context = await b.newContext({ viewport });
  await route(context);
  const page = walk.watch(await context.newPage());
  await page.clock.install();
  return { context, page };
}

/* The local arm (R1 (a)), with no account. `world` starts the world, `launch` the browser. Whatever stops the walk (a
   step, the guard's refusal, a world or a browser that cannot start), the browser and the world, with their servers and
   Miniflare instances, are closed before it answers. */
export async function runLocal({ out = join(OUT, "local"), world: makeWorld, launch = browser } = {}) {
  const { localWorld, INSTALLER_ORIGIN } = await import("./local.mjs");
  const walk = new Walk({ out, arm: "local", ownHosts: [new URL(INSTALLER_ORIGIN).host, "dash.cloudflare.com"] });
  const who = credentials();
  for (const p of [who.founder.password, who.member.password, who.newcomer.password]) walk.keepSecret(p);
  let world = null, b = null;
  try {
    world = await (makeWorld || localWorld)();
    b = await launch();
    const route = (ctx) => world.route(ctx, (u) => walk.foreign(u));
    walk.journey = "journey 28";
    const founder = await device(walk, b, route);
    const { copy } = await walkInstaller(walk, founder.page, INSTALLER_ORIGIN);
    walk.copyHost = new URL(copy).host;
    /* R3: before the hand-over writes anything, the copy must be a test instance. */
    await requireTestInstance(copy, (req) => world.fetchCopy(req));
    const { invite } = await walkFounder(walk, founder.page, { base: copy, founder: who.founder });
    const mai = await device(walk, b, route);
    const phone = await device(walk, b, route, { width: 390, height: 844 });
    await walkMember(walk, mai.page, { base: copy, invite, member: who.member, phone: phone.page });
    const teo = await device(walk, b, route);
    walk.journey = "journey 3";
    const second = await inviteMember(walk, founder.page, copy, { id: "teo", cover: "Teo, from flat 9" });
    await walkWelcome(walk, teo.page, { base: copy, link: second, member: who.newcomer });
    await sweep(walk, founder.page, copy);
  } catch (e) {
    failed(walk, e);
  } finally {
    if (world) for (const u of world.unansweredAll()) walk.fail(FAIL.ADDRESS, `unanswered: ${u}`);
    if (b) await b.close().catch(() => {});
    if (world) await world.close().catch((e) => walk.fail(FAIL.STEP, `the world did not close: ${e.message}`));
  }
  return { walk, report: walk.report(), ok: walk.failures.length === 0 };
}

/* The live arm (R1 (b), R5, R6): `base` a named test instance; the credentials are read from the environment and never
   printed: JOURNEY_ADMIN_HANDLE, JOURNEY_ADMIN_PASSWORD, JOURNEY_MEMBER_HANDLE, JOURNEY_MEMBER_PASSWORD. It reaches the
   instance directly (R5). Each role signs in, `whoami` must answer it as that role, and it walks every working screen;
   on each, at 1280 and 390 px, the page's limits are measured and the page is paired with the design mock's drawing
   (R6). The administrator must be drawn every act the member is, and somewhere an act the member is not. `screens`
   narrows the sweep; `commit` names the mock's commit (the interface's ASSETS_COMMIT when not given). */
export async function runLive({ base, env = process.env, out = join(OUT, "live"), fetchOf = directFetch, launch = browser,
  screens = null, commit = undefined } = {}) {
  const walk = new Walk({ out, arm: "live" });
  const need = ["JOURNEY_ADMIN_HANDLE", "JOURNEY_ADMIN_PASSWORD", "JOURNEY_MEMBER_HANDLE", "JOURNEY_MEMBER_PASSWORD"];
  for (const k of need) if (env[k]) walk.keepSecret(env[k]);
  const missing = need.filter((k) => !env[k]);
  try {
    if (!base) throw new WalkRefused("NO_INSTANCE", "the live arm needs the test instance's address (--live <address>)");
    if (missing.length) throw new WalkRefused("NO_CREDENTIALS", `the environment does not hold ${missing.join(", ")}`);
    await requireTestInstance(base, fetchOf);
    walk.copyHost = new URL(base).host;
    /* the instance's own short name, never to be read on a screen */
    const slugs = [walk.copyHost.split(".")[0]].filter((x) => !/^\d+$/.test(x) && x !== "localhost");
    const b = await launch({ direct: true });
    let mock = null;
    try {
      mock = await designMock(b, { dir: join(out, "design"), ...(commit ? { commit } : {}) });
      const working = screens || sweepScreens().filter((s) => s.frame === "working" || s.frame === "dock");
      const acts = { administrator: new Map(), member: new Map() };
      const sweepAs = async (role, handle, password, administer) => {
        walk.journey = `as ${role}`;
        walk.whoami = null;
        const ctx = await b.newContext({ viewport: viewportOf(1280) });
        try {
          await ctx.route("**/*", (r) => (new URL(r.request().url()).host === walk.copyHost ? r.continue()
            : (walk.foreign(r.request().url()), r.abort("blockedbyclient"))));
          const page = walk.watch(await ctx.newPage());
          await walk.step(page, `${role}: open / and sign in`, async (p) => {
            await open(walk, p, base, "/", "front");
            await act(p, "login", { fields: { "fs-handle": handle, "fs-pw": password } });
            await p.waitForFunction(() => location.pathname === "/app" || location.pathname === "/", null, { timeout: 15000 });
            await requireDrawn(walk, p, "home");
          });
          /* R5: the plane says who signed in; a credential that is not the role it is given for stops that role */
          const who = walk.whoami;
          if (!who) { walk.fail(FAIL.ROLE, `as ${role}: whoami answered no member session after sign-in`); return; }
          if (!!who.administer !== administer) {
            walk.fail(FAIL.ROLE, `the ${role}'s credential signs in a session whoami answers with administer: ${!!who.administer}`);
            return;
          }
          await sweep(walk, page, base, { screens: working, journey: `as ${role}`, each: async (p, s, drawn) => {
            acts[role].set(s.id, await drawnActs(p));
            if (!drawn) return;
            for (const width of WIDTHS) {
              if (width !== 1280) { await p.setViewportSize(viewportOf(width)); await p.reload(); await settle(p); }
              for (const l of await pageLimits(p, { width, slugs })) walk.fail(l.kind, `${s.id} at ${width}px: ${l.detail}`);
              const live = await p.screenshot();
              const design = await mock.draw(s.id, width);
              if (!design) walk.fail(FAIL.DESIGN, `${s.id}: the design mock at ${mock.commit} draws no such screen`);
              else walk.pairs.push(relative(out, await pair(b, live, design, join(out, "pairs", `${role}-${s.id}-${width}.png`),
                { title: `${s.id}, ${width}px, as ${role}` })));
            }
            await p.setViewportSize(viewportOf(1280));
          } });
        } catch (e) { if (!(e instanceof StepFailed)) throw e; }
        finally { await ctx.close().catch(() => {}); }
      };
      await sweepAs("administrator", env.JOURNEY_ADMIN_HANDLE, env.JOURNEY_ADMIN_PASSWORD, true);
      await sweepAs("member", env.JOURNEY_MEMBER_HANDLE, env.JOURNEY_MEMBER_PASSWORD, false);
      /* R5: the acts only an administrator is drawn */
      walk.journey = "roles";
      if (acts.administrator.size && acts.member.size) {
        let only = 0;
        for (const [id, mine] of acts.member) {
          const theirs = acts.administrator.get(id) || [];
          for (const op of mine) if (!theirs.includes(op)) walk.fail(FAIL.ROLE, `${id}: the member is drawn ${op}, the administrator is not`);
        }
        for (const [id, theirs] of acts.administrator) only += theirs.filter((op) => !(acts.member.get(id) || []).includes(op)).length;
        if (!only) walk.fail(FAIL.ROLE, "no screen draws the administrator an act it does not draw the member: the administrator's walk did not administer");
      }
    } finally { if (mock) await mock.close(); await b.close().catch(() => {}); }
  } catch (e) {
    failed(walk, e);
  }
  return { walk, report: walk.report(), ok: walk.failures.length === 0 };
}
