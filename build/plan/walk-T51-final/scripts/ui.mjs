/* Small drivers for the shell's controls. */
export const clean = (s) => String(s).replace(/\s+/g, " ").trim();
export const visText = async (p, sel = "#cs-main") => clean(await p.locator(sel).first().innerText());
export const gaps = async (p) => clean((await p.locator(".cs-gap:visible").allInnerTexts()).join(" / "));
/* press an act's button; if the shell asks for a reason in place, give it */
export async function press(p, act, { reason = null, nth = 0, wait = 1500, within = null } = {}) {
  const scope = within ? p.locator(within) : p;
  const b = scope.locator(`button[data-act="${act}"]:visible`).nth(nth);
  await b.click();
  await p.waitForTimeout(400);
  const send = p.locator('button:has-text("Send with this reason"):visible');
  let asked = false;
  if (await send.count()) {
    asked = true;
    if (reason !== null) {
      await p.locator("textarea:visible, input[type=text]:visible").last().fill(reason).catch(() => {});
      await send.first().click();
    }
  }
  await p.waitForTimeout(wait);
  return { asked };
}
export async function pickReasonOnly(p) { return (await p.locator('button:has-text("Send with this reason"):visible').count()) > 0; }
