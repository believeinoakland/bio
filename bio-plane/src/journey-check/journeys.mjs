/* journey-check R1: the steps of journey 28 (DEC-201 (9), DEC-206 (5); `mock-journeys.js`) and journey 3 (the library's
   "Welcome a new member"), and the sweep of the registry's screens. Each step drives the page as a person does: the
   screens' own fields and controls (`[data-act]`, interface-shell R13; the shell's confirmation and reason, R11; the
   wizard guide's own controls, `[data-guide]`), the installer's own page; no op is called by the walker. Journey 28's
   first two steps (civicsmith.org, `site`) wait on Bob's DNS act (N1011) and start here at the installer. */
import { StepFailed, settle } from "./walker.mjs";
import { drawnState, sweepScreens, addressOf } from "./screens.mjs";
import { FAIL } from "./walker.mjs";

const rand = (n) => Buffer.from(crypto.getRandomValues(new Uint8Array(n))).toString("base64url");
export const SLUG = "lakeshore-tenants";
export const GROUP_NAME = "Lakeshore Tenants";

/* ---------- the page's controls ---------- */

const where = (page) => new URL(page.url()).pathname;

/* The visible control of act `op` (in `within`, a selector, when given); throws, naming it, when the screen does not
   draw it. */
export async function control(page, op, { within = null, timeout = 10000 } = {}) {
  const c = (within ? page.locator(within) : page).locator(`[data-act="${op}"]:visible`).first();
  try { await c.waitFor({ state: "visible", timeout }); }
  catch { throw new Error(`control ${op} is not on ${where(page)}`); }
  return c;
}

/* Types `value` into the field with id `id`, as a person does (each keystroke). */
export async function type(page, id, value) {
  const f = page.locator(`[id="${id}"]`).first();
  try { await f.waitFor({ state: "visible", timeout: 10000 }); }
  catch { throw new Error(`no field ${id} on ${where(page)}`); }
  await f.fill(value);
}

/* Presses act `op` after filling `fields` ({id: value}); then answers what the shell asks before it sends (interface-shell
   R11): its confirmation, or a reason (`reason`). Waits for the answer to arrive. */
export async function act(page, op, { fields = {}, within = null, reason = "Recorded by the release walk." } = {}) {
  for (const [id, value] of Object.entries(fields)) await type(page, id, value);
  await (await control(page, op, { within })).click();
  const ask = page.locator('[data-shell="confirm"]:visible, [data-shell="reason-send"]:visible').first();
  try { await ask.waitFor({ state: "visible", timeout: 1500 }); } catch { /* sent at once */ }
  if (await ask.count()) {
    if ((await ask.getAttribute("data-shell")) === "reason-send")
      await page.locator('.cs-reason textarea:visible').first().fill(reason);
    await ask.click();
  }
  await settle(page);
}

/* Opens `path` on the copy and requires screen `id` drawn. */
export async function open(walk, page, base, path, id) {
  await page.goto(new URL(path, base).href);
  await settle(page);
  if (id) await requireDrawn(walk, page, id);
}
export async function requireDrawn(walk, page, id) {
  const st = await drawnState(page, id);
  if (!st.drawn) { walk.fail(FAIL.NOT_DRAWN, `${id}: ${st.why}`); throw new Error(`screen ${id} not drawn (${st.why})`); }
}
/* Waits for `selector` to be shown; throws with `what` when it is not. */
async function shown(page, selector, what, timeout = 15000) {
  try { await page.locator(selector).first().waitFor({ state: "visible", timeout }); }
  catch { throw new Error(`${what} is not shown on ${where(page)}`); }
}
/* Ten recovery codes, shown once (screens-entry's `pre[data-codes]`, K3306). */
async function tenCodes(page) {
  await shown(page, "pre[data-codes]", "the ten recovery codes");
  const n = (await page.locator("pre[data-codes]").first().textContent()).trim().split(/\n/).filter(Boolean).length;
  if (n !== 10) throw new Error(`${n} recovery codes are shown, not ten`);
}

/* ---------- journey 28, the installer's half (local arm) ---------- */

/* From the installer's first page to its last: the short name, Cloudflare's consent, the progress, the checks. Answers
   the copy's address and the one-time password (kept secret by the walk). */
export async function walkInstaller(walk, page, installerOrigin) {
  let copy = null, boot = null;
  walk.mask.push("#out-boot", "#out-probe", '[href*="#invite="]', "[data-invite-link]", '[data-secret]');
  await walk.step(page, "install: the installer's first page", async (p) => {
    await p.goto(installerOrigin + "/");
    await p.locator("#slug").fill(SLUG);
    const profile = p.locator('input[name="profile"]').first();
    if (await profile.count()) await profile.check();
  });
  await walk.step(page, "install: the short name, confirmed permanent", async (p) => {
    await p.locator("#go").click();
    await p.locator("#confirm-yes").click();
    await p.locator("#stage-before:not([hidden])").waitFor({ timeout: 10000 });
  });
  await walk.step(page, "install: before Cloudflare, what it will be asked to allow", async (p) => {
    await p.locator("#cloudflare").click();
    await p.waitForURL(/dash\.cloudflare\.com\/oauth2\/auth/, { timeout: 15000 });
  });
  await walk.step(page, "install: Cloudflare's permission, allowed", async (p) => {
    await p.locator("#allow").click();
    await p.waitForURL(/\/callback\?/, { timeout: 15000 });
  });
  await walk.step(page, "install: each step finishes, the checks pass", async (p) => {
    await p.locator("#done:not([hidden]), #fail:not([hidden])").first().waitFor({ timeout: 120000 });
    if (await p.locator("#fail:not([hidden])").count())
      throw new Error("the installer stopped: " + (await p.locator("#fail-h").textContent()) + " " + (await p.locator("#fail-p").textContent()));
    const stopped = await p.locator('#log [data-r="no"], #checks [data-r="no"]').allTextContents();
    if (stopped.length) throw new Error("a step did not finish: " + stopped.join(" | "));
    if (!(await p.locator("#done .okbox").count())) throw new Error("the final panel does not say the copy is running: "
      + (await p.locator("#done").textContent()).slice(0, 300));
    copy = (await p.locator("#out-url").textContent()).trim();
    boot = walk.keepSecret((await p.locator("#out-boot").textContent()).trim());
    walk.keepSecret((await p.locator("#out-probe").textContent()).trim());
  });
  return { copy, boot };
}

/* ---------- journey 28, inside the group's Civicsmith ---------- */

/* The founder: the hand-over, the claim with the one-time password filled in, the ten codes, the group's name, Home in a
   new group, and an invitation for the first member. */
export async function walkFounder(walk, page, { base, founder }) {
  await walk.step(page, "hand-over: to the group's address, finishing setup", async (p) => {
    await p.locator("#handover").click();
    await p.waitForURL((u) => u.origin === base && u.pathname === "/app/setup", { timeout: 20000 });
    await settle(p);
    await requireDrawn(walk, p, "setup");
    if (!(await p.locator("#su-otp").inputValue())) throw new Error("the one-time password is not filled in");
  });
  await walk.step(page, "setup: claim; she is the group's first administrator", async (p) => {
    await act(p, "claim", { fields: { "su-pw": founder.password, "su-pw2": founder.password } });
    await shown(p, '[data-state="claimed"]', "the claim");
  });
  await walk.step(page, "setup: her ten recovery codes, shown once", async (p) => {
    await tenCodes(p);
  });
  await walk.step(page, "setup: the group's name", async (p) => {
    await act(p, "groupnameset", { fields: { "su-name": GROUP_NAME } });
    await p.locator("a[href='/app'][data-nav]").last().click();
    await settle(p);
  });
  await walk.step(page, "home: a new group's home, inviting members and saying who it is", async (p) => {
    await requireDrawn(walk, p, "home");
    await shown(p, "a[href='/app/members']", "the invitation to invite members");
  });
  const invite = await inviteMember(walk, page, base, { id: "mai", cover: "Mai, from flat 4" });
  return { invite };
}

/* An administrator makes an invitation link for a new member, with the short id and the cover the group knows them by
   (`memberadd`); the link is shown once. */
export async function inviteMember(walk, page, base, { id, cover }) {
  let link = null;
  await walk.step(page, `members: an invitation link for ${id}`, async (p) => {
    await open(walk, p, base, "/app/members", "members");
    await act(p, "memberadd", { fields: { "mi-id": id, "mi-cover": cover } });
    await shown(p, '[data-shown="invite"] code', "the invitation link");
    link = walk.keepSecret((await p.locator('[data-shown="invite"] code').first().textContent()).trim());
    if (!link.includes("#invite=")) throw new Error("the invitation shown is not a link into the group's address");
  });
  return link;
}

/* The new member (journey 28's second half): joining, her codes, the welcome, her first settings, a first piece of
   work, signing out, signing in kept on her own device, the lock and unlock. */
export async function walkMember(walk, page, { base, invite, member, phone }) {
  await walk.step(page, "join: the invitation link opens the join screen", async (p) => {
    await p.goto(invite);
    await p.waitForURL((u) => u.pathname === "/app/join", { timeout: 15000 });
    await settle(p);
    await requireDrawn(walk, p, "join");
  });
  await walk.step(page, "join: a handle, free, and a password; joined and signed in", async (p) => {
    await act(p, "handlecheck", { fields: { "jn-handle": member.handle } });
    await shown(p, '[data-due="met"]', `that ${member.handle} is free`);
    await act(p, "enroll", { fields: { "jn-pw": member.password, "jn-pw2": member.password } });
    await shown(p, '[data-state="joined"]', "that she joined");
  });
  await walk.step(page, "join: her ten recovery codes, shown once", async (p) => {
    await tenCodes(p);
    await p.locator("a[href='/app'][data-nav]").last().click();
    await settle(p);
  });
  await walk.step(page, "home: the guided welcome she began when she joined, continued", async (p) => {
    await requireDrawn(walk, p, "home");
    await shown(p, '[data-guide="start"], [data-guide-state="running"]', "the welcome to continue");
  });
  await walk.step(page, "account: her first settings, her expertise declared", async (p) => {
    await open(walk, p, base, "/app/account", "account");
    await act(p, "expertisedeclare", { fields: { "ma-exp": "Interpreting, Spanish and English" } });
    await shown(p, "text=Interpreting, Spanish and English", "the expertise declared");
  });
  await walk.step(page, "home: what happened? a problem I live with", async (p) => {
    await open(walk, p, base, "/app", "home");
    /* the door for "A problem I live with"; its first offered script starts in the wizard runner */
    const door = '[data-door]:has-text("problem")';
    await (await control(p, "startfrom", { within: (await p.locator(door).count()) ? door : null })).click();
    await settle(p);
  });
  await walk.step(page, "capture: her first testimony, labelled as hers", async (p) => {
    await open(walk, p, base, "/app/capture/saw", "capture");
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    await act(p, "testify", { fields: { "ci-words": "Water has come through the ceiling of flat 4 since Monday; reported twice.",
      "ci-where": "Flat 4, second floor", "ci-when": yesterday } });
    await shown(p, '[data-tab="saw"] [role="status"]', "the testimony recorded");
  });
  await walk.step(page, "account: sign out on this device", async (p) => {
    await open(walk, p, base, "/app/account", "account");
    await act(p, "signout");
    await shown(p, '[data-state="signedout"]', "the signed-out state");
  });
  /* Next morning, on her own phone (another device): the group's address, signed in and kept signed in there. */
  await walk.step(phone, "front: on her phone, sign in, kept signed in", async (p) => {
    await open(walk, p, base, "/", "front");
    await act(p, "login", { fields: { "fs-handle": member.handle, "fs-pw": member.password } });
    await p.waitForFunction(() => !document.querySelector("#fs-pw"), null, { timeout: 15000 });
    await settle(p);
    await requireDrawn(walk, p, "home");
  });
  await walk.step(phone, "lock: idle half an hour on her own device", async (p) => {
    await p.clock.fastForward("31:00");
    await shown(p, '[data-overlay="lock"], [data-state="locked"]', "the lock");
  });
  await walk.step(phone, "unlock: her password again, back where she was", async (p) => {
    const overlay = await p.locator('[data-overlay="lock"]').count();
    if (overlay) { await type(p, "cs-lock-pw", member.password); await p.locator('[data-shell="unlock"]').click(); }
    else await act(p, "unlock", { fields: { "fl-lock": member.password } });
    try { await p.waitForFunction(() => !document.querySelector('[data-overlay="lock"], [data-state="locked"]'), null, { timeout: 10000 }); }
    catch { throw new Error("still locked after her password"); }
    await settle(p);
    await requireDrawn(walk, p, "home");
  });
}

/* ---------- journey 3: a member joins and finds their footing (the welcome wizard) ---------- */

export async function walkWelcome(walk, page, { base, link, member }) {
  walk.journey = "journey 3";
  await walk.step(page, "welcome 1–2: join, the language and a handle and a password", async (p) => {
    await p.goto(link);
    await p.waitForURL((u) => u.pathname === "/app/join", { timeout: 15000 });
    await settle(p);
    await requireDrawn(walk, p, "join");
    if (await p.locator("#jn-lang").count()) await p.locator("#jn-lang").selectOption({ index: 0 });
    await act(p, "enroll", { fields: { "jn-handle": member.handle, "jn-pw": member.password, "jn-pw2": member.password } });
    await shown(p, '[data-state="joined"]', "that he joined");
    await p.locator("a[href='/app'][data-nav]").last().click();
    await settle(p);
  });
  await walk.step(page, "welcome 3: this is your group's home", async (p) => {
    await requireDrawn(walk, p, "home");
    if (!(await p.locator('[data-guide-state="running"]').count())) await p.locator('[data-guide="start"]').first().click();
    await shown(p, '[data-guide-state="running"]', "the welcome running");
  });
  for (const [n, id, label] of [[4, "question", "a question's strength, and Undetermined"],
    [5, "connect", "optional: connect your own Claude account, skipped"], [6, "ties", "optional: your own ties, skipped"],
    [7, "home", "a first step"]]) {
    await walk.step(page, `welcome ${n}: ${label}`, async (p) => {
      await p.locator('[data-guide="next"]').first().click();
      await settle(p);
      /* a side trip the step offers is a choice: skipped (Stop), it returns to the welcome at the same step */
      try { await p.locator("[data-guide-trip]").first().waitFor({ state: "visible", timeout: 3000 }); } catch { /* no trip */ }
      if (await p.locator("[data-guide-trip]").count()) { await p.locator('[data-guide="stop"]').first().click(); await settle(p); }
      const at = new RegExp(`step ${n} of 7`, "i");
      try { await p.locator(".cs-wizard .step").filter({ hasText: at }).first().waitFor({ state: "visible", timeout: 8000 }); }
      catch { throw new Error(`the welcome is not at step ${n} of 7: ${(await p.locator(".cs-wizard .step").first().textContent().catch(() => "none")) || "none"}`); }
    });
  }
  await walk.step(page, "welcome: finished", async (p) => {
    await p.locator('[data-guide="next"]').first().click();
    await settle(p);
    if (await p.locator('[data-guide-state="running"]').count()) throw new Error("the welcome did not finish");
  });
}

/* ---------- the sweep: every registry screen, drawn ---------- */

/* A screen opened at its bare address has no subject: the answers interface-shell R35 draws as "Nothing is here" or
   "You can't open this" are its designed absence, expected; any other refusal fails the sweep. */
export const ABSENCE = /^(?:NOT_FOUND|NO_SUCH_[A-Z_]+|[A-Z_]+_NOT_FOUND|NOT_VISIBLE|NOT_A_PARTICIPANT)$/;

/* `each(page, screen, drawn)`, when given, is done on each screen within its step, once it is opened and judged. */
export async function sweep(walk, page, base, { screens = sweepScreens(), journey = "screens", each = null } = {}) {
  walk.journey = journey;
  for (const s of screens) {
    await walk.step(page, `screen ${s.id}`, async (p) => {
      await p.goto(new URL(addressOf(s.id), base).href);
      await settle(p);
      const st = await drawnState(p, s.id);
      if (!st.drawn) walk.fail(FAIL.NOT_DRAWN, `${s.id}: ${st.why}`);
      if (each) await each(p, s, st.drawn);
    }, { expect: [ABSENCE] }).catch((e) => { if (!(e instanceof StepFailed)) throw e; });
  }
}

/* The acts the page draws, by op (interface-shell R13's `data-act`; an act a member may not do is absent from the page). */
export const drawnActs = (page) => page.evaluate(() => [...new Set([...document.querySelectorAll("[data-act]")].map((e) => e.getAttribute("data-act")))].sort());

export const credentials = () => ({
  founder: { password: "founder-" + rand(12) },
  member: { handle: "mai-k", password: "member-" + rand(12) },
  newcomer: { handle: "teo-r", password: "newcomer-" + rand(12) },
});
