/* Section B: the claim (R03), through the claim screen in a real browser. */
import { rec, shot, metrics, pageAt, ST, later } from "./lib.mjs";
import { dump } from "./secA.mjs";

export const FOUNDER = { handle: "bob", password: "a long enough password 1" };
const say = async (p, sel = "#cs-main") => (await p.locator(sel).first().innerText()).replace(/\s+/g, " ");

export async function secB(ctx) {
  const { kit, browser, base } = ctx;
  const boot = kit.ADM;
  const p = await pageAt(browser, base);
  await p.goto(`${base}/app/setup#boot=${boot}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const t = await say(p);
  dump("B-claim-start", t);
  const m = await metrics(p);
  rec("R03", "before the claim: only the claim shows, the other parts closed beneath it", 1280, "founder (not yet signed in)", "opened /app/setup with the installer's one-time password in the address", /Make it yours/.test(t) && /seven more parts/.test(t) ? "WORKS" : "BROKEN",
    `claim card + "seven more parts" listed beneath; one-time password prefilled: ${await p.inputValue("#su-otp") === boot}; ${t.slice(0, 200)}`, await shot(p, "B-claim-1280"));
  const gap = async () => (await p.locator(".cs-gap").allInnerTexts()).join(" / ").replace(/\s+/g, " ");
  /* the whole-truth block */
  const det = p.locator("#hosting-control");
  await det.locator("summary").click(); await p.waitForTimeout(300);
  const truthText = (await det.innerText()).replace(/\s+/g, " ");
  dump("B-truth", truthText);
  const need = ["replace the one-time password", "claim", "read", "lock", "team account", "trusted", "same"];
  const miss = need.filter((w) => !new RegExp(w, "i").test(truthText));
  rec("R03", "whole-truth block before the password fields (holders of the hosting account can replace the one-time password, reclaim, read everything, lock others out; use a group account; add a trusted person; the same account is the way back in); no acknowledgement step", 1280, "founder", "opened the disclosure above the password fields", miss.length === 0 ? "WORKS" : "BROKEN", `${miss.length ? "missing words: " + miss.join(",") + "; " : ""}${truthText}`, await shot(p, "B-truth-1280"));
  const claim = async (h, pw, pw2 = pw) => { await p.fill("#su-handle", h); await p.fill("#su-pw", pw); await p.fill("#su-pw2", pw2); await p.click('button[data-act="claim"]'); await p.waitForTimeout(1500); return gap(); };
  const check = (row, name, did, g, re) => rec(row, name, 1280, "founder", did, re.test(g) ? "WORKS" : "BROKEN", `the screen says: "${g}"`);
  let g = await claim("", "a long enough password 1");
  check("R03", "claim with no handle is refused before anything is sent (NO_HANDLE)", "pressed Claim with the handle empty", g, /Choose a handle first/);
  g = await claim("bob", "short", "short");
  check("R03", "a password under 12 characters is refused (PASSWORD_TOO_SHORT)", "claim with a 5-character password", g, /at least 12 characters/);
  g = await claim("bob", "a long enough password 1", "a different password 12");
  check("R03", "the two passwords must match", "claim with two different passwords", g, /don't match/);
  g = await claim("Bob K!", "a long enough password 1");
  check("R03", "a bad handle is refused (BAD_HANDLE) in the handle rules' words", "claim with handle \"Bob K!\"", g, /lowercase letters, digits and hyphens, 2 to 41/);
  g = await claim("admin", "a long enough password 1");
  check("R03", "a taken handle is refused (HANDLE_TAKEN); the founder cannot be \"admin\"", "claim with handle \"admin\"", g, /already taken/);
  /* a wrong one-time password */
  await p.fill("#su-otp", "not-the-one-time-password");
  g = await claim("bob", "a long enough password 1");
  const still = await p.locator('button[data-act="claim"]').count();
  rec("R03", "a wrong one-time password is refused and nothing is claimed", 1280, "founder", "claim with a changed one-time password", still === 1 && g.length > 0 ? "WORKS" : "BROKEN", `the screen says: "${g}"; claim button still offered: ${still === 1}; bootstrap claimed: ${(await (await kit.plane("/api/?op=bootstrap")).json()).claimed}`, "", /administrator token/.test(g) ? ["MINOR", `the refusal for a wrong one-time password says "The administrator token given does not match..." on a screen whose field is called "One-time password"; the founder has been told of no "administrator token" (words a member would not understand)`] : null);
  await p.fill("#su-otp", boot);
  /* the claim itself */
  const t0 = Date.now();
  await p.fill("#su-handle", FOUNDER.handle); await p.fill("#su-pw", FOUNDER.password); await p.fill("#su-pw2", FOUNDER.password);
  await p.click('button[data-act="claim"]');
  await p.waitForSelector("text=Claimed.", { timeout: 20000 }).catch(() => {});
  const wall = Date.now() - t0;
  await p.waitForTimeout(1200);
  const after = await say(p);
  dump("B-claimed", after);
  const codes = after.match(/[A-Z0-9]{5}(-[A-Z0-9]{5}){3}/g) || [];
  rec("R03", "claim: the founder is named by the chosen handle (not \"admin\"), signed in on this device, ten recovery codes shown once with Copy and Save as a file", 1280, "founder", "claimed with handle bob", /signed in as bob/.test(after) && codes.length === 10 && /Copy them/.test(after) && /Save them as a file/.test(after) ? "WORKS" : "BROKEN",
    `${codes.length} codes shown; "Shown once. Each works one time" ${/Shown once/.test(after)}; wall ${wall} ms; says: ${(after.match(/Claimed\.[^.]*\./) || [""])[0]}`, await shot(p, "B-claimed-1280"));
  ctx.founderPage = p;
  ctx.token = await ctx.login(FOUNDER.handle, FOUNDER.password);
  ctx.codes = codes;
  /* the claim a second time, through a fresh browser */
  const q = await pageAt(browser, base);
  await q.goto(`${base}/app/setup#boot=${boot}`, { waitUntil: "networkidle" }); await q.waitForTimeout(800);
  const t2 = await say(q);
  dump("B-second", t2);
  rec("R03", "a second claim reads ALREADY_CLAIMED, and the one-time password cannot claim again", 1280, "stranger", "opened the claim address again after the claim", /already|claimed/i.test(t2) && !(await q.locator('button[data-act="claim"]').count()) ? "WORKS" : "BROKEN", t2.slice(0, 400), await shot(q, "B-second-1280"));
  await q.context().close();
  /* the codes are not shown again */
  await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(1200);
  const re = await say(p);
  const codes2 = re.match(/[A-Z0-9]{5}(-[A-Z0-9]{5}){3}/g) || [];
  rec("R03", "recovery codes are shown once: after a reload the ten codes are not drawn again", 1280, "founder", "reloaded the setup page", codes2.length === 0 ? "WORKS" : "BROKEN", `${codes2.length} codes after reload; ${re.slice(re.indexOf("Make it yours"), re.indexOf("Make it yours") + 200)}`);
}
