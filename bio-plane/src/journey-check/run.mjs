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
import { walkInstaller, walkFounder, inviteMember, walkMember, walkWelcome, sweep, credentials, open, act, requireDrawn, drawnActs,
  signInBy, sweepAsFounder, walkSite } from "./journeys.mjs";
import { walkAdministrator, walkMemberJourney, journey29Live } from "./investigation.mjs";
import { sweepScreens } from "./screens.mjs";
import { designMock, pageLimits, pair, WIDTHS, viewportOf, journeyPairs } from "./design.mjs";

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

/* The local arm (R1 (a), R9–R11), with no account. `world` starts the world, `launch` the browser; `model: false` binds
   the runner with no fake model (R11's control); `parts` names which walks follow journey 28 and R9 (all by default:
   `journey 3`, `R10`, `sweep`, `R13`). Journey 28 (its founder claiming by her own handle, R9 step 1), journey
   3, then the journey to a first conclusion as administrator (R9) and as the member journey 28 joined (R10), then the
   sweep. Whatever stops the walk (a step, the guard's refusal, a world or a browser that cannot start), the browser and
   the world, with their servers and Miniflare instances, are closed before it answers. */
export const PARTS = Object.freeze(["journey 3", "R10", "sweep", "R13"]);
export async function runLocal({ out = join(OUT, "local"), world: makeWorld, launch = browser, model = true, parts = PARTS } = {}) {
  const { localWorld, INSTALLER_ORIGIN, SITE_ORIGIN } = await import("./local.mjs");
  const walk = new Walk({ out, arm: "local", ownHosts: [new URL(INSTALLER_ORIGIN).host, "dash.cloudflare.com", new URL(SITE_ORIGIN).host] });
  const who = credentials();
  for (const p of [who.founder.password, who.member.password, who.newcomer.password]) walk.keepSecret(p);
  let world = null, b = null;
  try {
    world = await (makeWorld || localWorld)({ model });
    b = await launch();
    const route = (ctx) => world.route(ctx, (u) => walk.foreign(u));
    walk.journey = "journey 28";
    const founder = await device(walk, b, route);
    await walkSite(walk, founder.page, SITE_ORIGIN, INSTALLER_ORIGIN);
    const { copy } = await walkInstaller(walk, founder.page, INSTALLER_ORIGIN);
    walk.copyHost = new URL(copy).host;
    /* R3: before the hand-over writes anything, the copy must be a test instance. */
    await requireTestInstance(copy, (req) => world.fetchCopy(req));
    /* R7 (K3380): every screen swept as the founder while she has no handle, DEC-230's words excepted; where the claim
       took her handle there is no such founder here, which the report notes */
    const handleless = parts.includes("sweep") ? async (p) => {
      await sweepAsFounder(walk, p, copy, { handle: null });
      walk.journey = "journey 28";
    } : null;
    const { invite, byHandle } = await walkFounder(walk, founder.page, { base: copy, founder: who.founder, whileHandleless: handleless });
    if (byHandle && parts.includes("sweep")) walk.notes.push("R7 with no handle: not walkable here (the claim took a handle)");
    const mai = await device(walk, b, route);
    const phone = await device(walk, b, route, { width: 390, height: 844 });
    await walkMember(walk, mai.page, { base: copy, invite, member: who.member, phone: phone.page });
    if (parts.includes("journey 3")) {
      const teo = await device(walk, b, route);
      walk.journey = "journey 3";
      const second = await inviteMember(walk, founder.page, copy, { id: "teo", cover: "Teo, from flat 9" });
      await walkWelcome(walk, teo.page, { base: copy, link: second, member: who.newcomer });
    }
    /* each journey that stops has said why; the next is still walked, and the sweep after them */
    const going = (e) => { if (!(e instanceof StepFailed)) throw e; return null; };
    const r9 = await walkAdministrator(walk, founder.page, { base: copy, founder: who.founder }).catch(going);
    if (parts.includes("R10")) {
      walk.journey = "R10 as member";
      if (!r9) walk.fail(FAIL.STEP, "the member's journey needs the administrator's project, and R9 stopped before it was made");
      else await (async () => {
        await signInBy(walk, mai.page, copy, who.member, "she signs in on her own computer");
        await walkMemberJourney(walk, mai.page, { base: copy, member: who.member, inviter: founder.page, project: r9.project });
      })().catch(going);
    }
    /* the sweep with her handle held (a founder who could not choose one was swept handleless above) */
    if (parts.includes("sweep") && who.founder.handle) await sweepAsFounder(walk, founder.page, copy, { handle: who.founder.handle });
    /* R13: design journey 29, step by step, each LIVE step beside the mock's drawing of it */
    if (parts.includes("R13")) {
      walk.journey = "R13 design journey 29";
      const mock = await designMock(b, { dir: join(out, "design") });
      try {
        for (const f of await journeyPairs(walk, b, mock, { out, liveOf: (st) => journey29Live(walk, st) })) walk.pairs.push(relative(out, f));
      } finally { await mock.close(); }
    }
  } catch (e) {
    failed(walk, e);
  } finally {
    if (world) for (const u of world.unansweredAll()) walk.fail(FAIL.ADDRESS, `unanswered: ${u}`);
    if (b) await b.close().catch(() => {});
    if (world) await world.close().catch((e) => walk.fail(FAIL.STEP, `the world did not close: ${e.message}`));
  }
  return { walk, report: walk.report(), ok: walk.failures.length === 0 };
}

/* R12: the sign-in's code, typed by the person signing in at the terminal the walk runs in, as she reads it on
   Anthropic's page at `address`; what she types is not echoed, and the walk keeps it secret. With no terminal, or nothing
   typed, there is no code, and step 4 fails by name. */
export async function askCode(role, address) {
  if (!process.stdin.isTTY) return null;
  const { createInterface } = await import("node:readline");
  const rl = createInterface({ input: process.stdin, output: process.stderr, terminal: true });
  process.stderr.write(`\nAs the ${role}: open ${address.replace(/\?.*$/, "")} (the link the connect screen shows), sign in to Claude, `
    + "approve, then type the code Anthropic's page shows (it is not echoed) and press Enter:\n");
  rl._writeToOutput = () => {};
  const code = await new Promise((done) => rl.question("", done));
  rl.close();
  process.stderr.write("\n");
  return code.trim() || null;
}

/* R12: the administrator's journey (R9) and the member's (R10), each signed in by her own credentials on her own device,
   connecting her own subscription through the real sign-in. A journey that stops has said why. */
async function investigateLive(walk, b, base, { founder, member, codeOf }) {
  const devices = [];
  const device = async () => {
    const ctx = await b.newContext({ viewport: viewportOf(1280) });
    devices.push(ctx);
    await ctx.route("**/*", (r) => { const u = new URL(r.request().url());
      return u.host === walk.copyHost || u.protocol === "https:" && /(^|\.)(claude\.ai|claude\.com|anthropic\.com)$/.test(u.hostname) ? r.continue()
        : (walk.foreign(r.request().url()), r.abort("blockedbyclient")); });
    return walk.watch(await ctx.newPage());
  };
  const going = (e) => { if (!(e instanceof StepFailed)) throw e; return null; };
  try {
    const admin = await device();
    walk.journey = "R9 as administrator";
    const r9 = await (async () => {
      await signInBy(walk, admin, base, founder, "1 · sign in by her handle");
      return walkAdministrator(walk, admin, { base, founder, codeOf: (address) => codeOf("administrator", address) });
    })().catch(going);
    walk.journey = "R10 as member";
    if (!r9) { walk.fail(FAIL.STEP, "the member's journey needs the administrator's project, and R9 stopped before it was made"); return; }
    const mine = await device();
    await (async () => {
      await signInBy(walk, mine, base, member, "she signs in by her handle");
      await walkMemberJourney(walk, mine, { base, member, inviter: admin, project: r9.project, codeOf: (address) => codeOf("member", address) });
    })().catch(going);
  } finally { for (const c of devices) await c.close().catch(() => {}); }
}

/* The live arm (R1 (b), R5, R6, R12): `base` a named test instance; the credentials are read from the environment and never
   printed: JOURNEY_ADMIN_HANDLE, JOURNEY_ADMIN_PASSWORD, JOURNEY_MEMBER_HANDLE, JOURNEY_MEMBER_PASSWORD. It reaches the
   instance directly (R5). Each role signs in, `whoami` must answer it as that role, and it walks every working screen;
   on each, at 1280 and 390 px, the page's limits are measured and the page is paired with the design mock's drawing
   (R6). The administrator must be drawn every act the member is, and somewhere an act the member is not. `screens`
   narrows the sweep; `commit` names the mock's commit (the interface's ASSETS_COMMIT when not given). */
export async function runLive({ base, env = process.env, out = join(OUT, "live"), fetchOf = directFetch, launch = browser,
  screens = null, commit = undefined, investigate = true, codeOf = askCode } = {}) {
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
      /* R12: R9 and R10 on the instance, each through its real subscription sign-in, whose code the person types */
      if (investigate) await investigateLive(walk, b, base, {
        founder: { handle: env.JOURNEY_ADMIN_HANDLE, password: env.JOURNEY_ADMIN_PASSWORD },
        member: { handle: env.JOURNEY_MEMBER_HANDLE, password: env.JOURNEY_MEMBER_PASSWORD }, codeOf });
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
