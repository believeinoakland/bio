/* journey-check R1: the steps of journey 28 (DEC-201 (9), DEC-206 (5); `mock-journeys.js`) and journey 3 (the library's
   "Welcome a new member"), and the sweep of the registry's screens. Each step drives the page as a person does: the
   screens' own controls (`[data-act]`, interface-shell R13), the installer's own page, and the words on them; no op is
   called by the walker. Journey 28's first two steps (civicsmith.org, `site`) wait on Bob's DNS act (N1011) and start
   here at the installer. */
import { Walk, StepFailed, settle } from "./walker.mjs";
import { drawnState, sweepScreens, addressOf } from "./screens.mjs";
import { FAIL } from "./walker.mjs";

const rand = (n) => Buffer.from(crypto.getRandomValues(new Uint8Array(n))).toString("base64url");
export const SLUG = "lakeshore-tenants";
export const GROUP_NAME = "Lakeshore Tenants";

/* ---------- the page's controls ---------- */

/* The visible control of act `op`; throws, naming it, when the screen does not draw it. */
export async function control(page, op, { timeout = 10000 } = {}) {
  const c = page.locator(`[data-act="${op}"]:visible`).first();
  try { await c.waitFor({ state: "visible", timeout }); }
  catch { throw new Error(`control ${op} is not on ${new URL(page.url()).pathname}`); }
  return c;
}

/* Fills the field labelled `label` (its words, as the screen draws them) in the open dialog or the page. */
export async function fill(page, label, value) {
  const scope = page.locator('dialog[open], .cs-dialog:not([hidden])').last();
  const inDialog = (await scope.count()) > 0 && (await scope.isVisible().catch(() => false));
  const f = (inDialog ? scope : page).getByLabel(label, { exact: false }).first();
  try { await f.waitFor({ state: "visible", timeout: 8000 }); }
  catch { throw new Error(`no field "${label}" on ${new URL(page.url()).pathname}`); }
  await f.fill(value);
}

/* Presses act `op`, fills `fields`, and confirms the dialog the act opens, if it opens one. */
export async function act(page, op, fields = {}, { confirm = true } = {}) {
  await (await control(page, op)).click();
  for (const [label, value] of Object.entries(fields)) await fill(page, label, value);
  if (!confirm) return;
  const dlg = page.locator('dialog[open] [data-dialog="confirm"], .cs-dialog:not([hidden]) [data-dialog="confirm"]').first();
  if (await dlg.count()) await dlg.click();
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

export async function walkFounder(walk, page, { base, founder }) {
  await walk.step(page, "hand-over: to the group's address, finishing setup", async (p) => {
    await p.locator("#handover").click();
    await p.waitForURL((u) => u.origin === base && u.pathname === "/app/setup", { timeout: 20000 });
    await settle(p);
    await requireDrawn(walk, p, "setup");
  });
  await walk.step(page, "setup: claim, the one-time password already filled in", async (p) => {
    await act(p, "claim", { "password": founder.password }, { confirm: false });
    await (await control(p, "claim")).click().catch(() => {});
  });
  await walk.step(page, "setup: ten recovery codes, saved", async (p) => {
    await act(p, "recoverycodesissue");
  });
  await walk.step(page, "setup: the group's name, and how members reach the assistant", async (p) => {
    await act(p, "groupnameset", { "name": GROUP_NAME });
  });
  await walk.step(page, "home: a new group's home", async (p) => {
    await open(walk, p, base, "/app", "home");
  });
  const invite = await inviteMember(walk, page, base, "Mai, from flat 4");
  return { invite };
}

/* An administrator makes an invitation link for a new member, with the cover the group knows them by (`memberadd`). */
export async function inviteMember(walk, page, base, cover) {
  let link = null;
  await walk.step(page, `members: an invitation link for ${cover.split(",")[0]}`, async (p) => {
    await open(walk, p, base, "/app/members", "members");
    await act(p, "memberadd", { "cover": cover });
    const at = p.locator('a[href*="#invite="], [data-invite-link], input[value*="#invite="]').first();
    await at.waitFor({ timeout: 10000 });
    link = walk.keepSecret((await at.getAttribute("href")) || (await at.inputValue()));
  });
  return link;
}

export async function walkMember(walk, page, { base, invite, member }) {
  await walk.step(page, "join: the invitation link opens the join screen", async (p) => {
    await p.goto(invite);
    await p.waitForURL((u) => u.pathname.startsWith("/app/join"), { timeout: 15000 });
    await requireDrawn(walk, p, "join");
  });
  await walk.step(page, "join: language, handle and password; joined and signed in", async (p) => {
    const lang = p.locator('[data-act="memberlanguageset"]').first();
    if (await lang.count()) await lang.click();
    await act(p, "enroll", { "handle": member.handle, "password": member.password });
  });
  await walk.step(page, "join: the member's ten recovery codes, saved", async (p) => {
    await act(p, "recoverycodesissue");
  });
  await walk.step(page, "home: the guided welcome, continued", async (p) => {
    await open(walk, p, base, "/app", "home");
  });
  await walk.step(page, "account: the member's first settings", async (p) => {
    await open(walk, p, base, "/app/account", "account");
    await act(p, "expertisedeclare", { "field": "Interpreting, Spanish and English" });
  });
  await walk.step(page, "home: what happened? a problem I live with", async (p) => {
    await open(walk, p, base, "/app", "home");
    await act(p, "startfrom");
  });
  await walk.step(page, "capture: first testimony, labelled as hers", async (p) => {
    await open(walk, p, base, "/app/capture", "capture");
    await act(p, "testify", { "what": "Water through the ceiling of flat 4 since Monday; reported twice." });
  });
  await walk.step(page, "account: sign out", async (p) => {
    await open(walk, p, base, "/app/account", "account");
    await act(p, "signout");
    await p.waitForURL((u) => u.pathname === "/" || u.pathname.startsWith("/app"), { timeout: 10000 });
  });
  await walk.step(page, "front: sign in, kept signed in on this device", async (p) => {
    await open(walk, p, base, "/", "front");
    await fill(p, "handle", member.handle);
    await fill(p, "password", member.password);
    const keep = p.getByLabel(/keep/i).first();
    if (await keep.count()) await keep.check();
    await act(p, "login", {}, { confirm: false });
    await requireDrawn(walk, p, "home");
  });
  await walk.step(page, "lock: idle on a kept device", async (p) => {
    await p.clock.fastForward("31:00");
    await p.locator('[data-state="locked"], [data-lock], #cs-lock').first().waitFor({ timeout: 10000 });
  });
  await walk.step(page, "unlock: the password again, back where she was", async (p) => {
    await fill(p, "password", member.password);
    await act(p, "unlock", {}, { confirm: false });
    await requireDrawn(walk, p, "home");
  });
}

/* ---------- journey 3: a member joins and finds their footing (the welcome wizard) ---------- */

export async function walkWelcome(walk, page, { base, link, member }) {
  walk.journey = "journey 3";
  await walk.step(page, "join: choose your language", async (p) => {
    await p.goto(link);
    await p.waitForURL((u) => u.pathname.startsWith("/app/join"), { timeout: 15000 });
    await requireDrawn(walk, p, "join");
    await act(p, "memberlanguageset");
  });
  await walk.step(page, "join: a handle and a password", async (p) => {
    await act(p, "enroll", { "handle": member.handle, "password": member.password });
  });
  for (const [id, label] of [["home", "your group's home"], ["question", "a question's strength, and Undetermined"],
    ["connect", "optional: connect your own Claude account, skipped"], ["ties", "optional: your own ties, skipped"]]) {
    await walk.step(page, `welcome: ${label}`, async (p) => {
      const next = p.locator('[data-wizard="next"], [data-wizard="skip"]').first();
      await next.waitFor({ timeout: 10000 }).catch(() => { throw new Error(`the welcome draws no way on at ${id}`); });
      await next.click();
      await settle(p);
      await requireDrawn(walk, p, id === "connect" || id === "ties" ? nextOf(id) : id);
    });
  }
  await walk.step(page, "welcome: a first step", async (p) => {
    await act(p, "startfrom");
  });
}
const nextOf = (id) => ({ connect: "ties", ties: "home" }[id]);

/* ---------- the sweep: every registry screen, drawn ---------- */

export async function sweep(walk, page, base, { screens = sweepScreens() } = {}) {
  walk.journey = "screens";
  for (const s of screens) {
    await walk.step(page, `screen ${s.id}`, async (p) => {
      await p.goto(new URL(addressOf(s.id), base).href);
      await settle(p);
      const st = await drawnState(p, s.id);
      if (!st.drawn) walk.fail(FAIL.NOT_DRAWN, `${s.id}: ${st.why}`);
    }).catch((e) => { if (!(e instanceof StepFailed)) throw e; });
  }
}

export const credentials = () => ({
  founder: { password: "founder-" + rand(12) },
  member: { handle: "mai-k", password: "member-" + rand(12) },
  newcomer: { handle: "teo-r", password: "newcomer-" + rand(12) },
});
export { Walk };
