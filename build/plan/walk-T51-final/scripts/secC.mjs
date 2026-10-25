/* Section C: the setup parts after the claim, through the setup page (R03, R08, R09). */
import { rec, shot, metrics, pageAt } from "./lib.mjs";
import { dump } from "./secA.mjs";
import { press, visText, gaps, clean } from "./ui.mjs";

export async function secC(ctx) {
  const { kit, browser, base } = ctx;
  const p = ctx.founderPage;
  await p.goto(`${base}/app/setup`, { waitUntil: "networkidle" }); await p.waitForTimeout(1200);
  dump("C-setup-start", await visText(p));
  /* the parts: numbered cards with one line each and a Done/Optional mark */
  const parts = await p.evaluate(() => [...document.querySelectorAll("details.cs-part")].map((d) => ({ n: d.querySelector(".n")?.innerText, t: d.querySelector(".t")?.innerText, mark: d.querySelector(".cs-due")?.innerText, state: d.dataset.state, open: d.open })));
  rec("R03", "the eight parts are numbered cards with one line on what each is for and a true Done / Optional mark; the claim shows Done after the claim", 1280, "founder", "read the parts after the claim", parts.length === 8 && parts[0].mark === "Done" && parts.slice(1).every((x) => /Optional/.test(x.mark)) ? "WORKS" : "BROKEN", JSON.stringify(parts.map((x) => `${x.n} ${x.t}: ${x.mark}`)), await shot(p, "C-setup-1280"));
  const skips = await p.locator('input[id^="su-skip-"]').count();
  rec("R03", '"Skip for now" on every part after the recovery codes', 1280, "founder", "counted the Skip controls", skips >= 6 ? "WORKS" : "BROKEN", `${skips} Skip checkboxes: ${(await p.locator('input[id^="su-skip-"]').evaluateAll((e) => e.map((x) => x.id))).join(", ")}`);
  /* part 2: the name */
  await p.fill("#su-name", "Oakland Watchers");
  const named = await press(p, "groupnameset", { reason: "The name our members use for us." });
  const ident = await (await kit.get({ authorization: "Bearer " + ctx.token }, { op: "groupidentity" }));
  rec("R03", "name the team: the name is saved beside the field and replaces the short name at the head", 1280, "founder", "typed the name and pressed Name the team (the act asks for a reason, gave one)", ident.result && ident.result.display_name === "Oakland Watchers" ? "WORKS" : "BROKEN", `asked for a reason: ${named.asked}; groupidentity.display_name="${ident.result && ident.result.display_name}"; head now: "${clean(await p.locator(".mk-setuphead").innerText())}"`, await shot(p, "C-named-1280"));
}
