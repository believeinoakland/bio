/* journey-check R24 (K3807; amends R1 (b), R6; `screens-publish` R37 to R39): the published frame, walked where a case is published.
   R1 (b) sweeps the working and dock frames; the carried features of `published` (a finding's page, a reader's minimum
   strength, printing) are drawn in the public frame, signed out. When the test instance holds a published case (its address
   given to the arm by `JOURNEY_PUBLISHED_CASE`, a path on the instance), the live arm opens it with no session at 1280 and 390 px,
   pairs it with the design's drawing (R6), and walks the carried states with the page's own controls: it sets a minimum
   strength and sees the filtered view's notice and that the whole case is a press away, opens a finding's page and returns, and
   presses "Print the case" with the browser's print stubbed, asserting the page sent nothing and the footer holds the key
   fingerprint line; it sends no request with an `Authorization` header. With none published it writes the note
   "published: no case on this instance" and passes nothing as walked. Every control is found by its word (R14). */
import { join, relative } from "node:path";
import { FAIL, settle, StepFailed } from "./walker.mjs";
import { pair, WIDTHS, viewportOf } from "./design.mjs";
import { requireWord, byWord, wordPattern } from "./words.mjs";
import { requireDrawn } from "./journeys.mjs";
import { localize } from "../setup-words/index.mjs";

export const PUBLISHED_ENV = "JOURNEY_PUBLISHED_CASE";
/* the walk's own note where the instance holds no published case (harness text, no member reads it) */
export const NO_PUBLISHED_NOTE = "published: no case on this instance";

export async function walkPublished(walk, b, base, mock, { path = process.env[PUBLISHED_ENV], out }) {
  walk.journey = "R24 the published frame";
  if (!path) { walk.notes.push(NO_PUBLISHED_NOTE); return; }
  const ctx = await b.newContext({ viewport: viewportOf(1280) });
  try {
    await ctx.addInitScript(() => { window.__printed = 0; window.print = () => { window.__printed += 1; }; });
    await ctx.route("**/*", (r) => {
      const req = r.request();
      if (new URL(req.url()).host !== walk.copyHost) { walk.foreign(req.url()); return r.abort("blockedbyclient"); }
      if (req.headers().authorization) { walk.fail(FAIL.STEP, localize("journey-check.published.published_a_request_carried_an", "published: a request carried an Authorization header: {method} {pathname}", { method: String(req.method()), pathname: String(new URL(req.url()).pathname) })); return r.abort("blockedbyclient"); }
      return r.continue();
    });
    const page = walk.watch(await ctx.newPage());
    const url = new URL(path, base).href;
    let sent = 0;
    page.on("request", (q) => { if (["POST", "PUT", "PATCH", "DELETE"].includes(q.method())) sent += 1; });
    for (const width of WIDTHS) {
      await page.setViewportSize(viewportOf(width));
      await walk.step(page, localize("journey-check.published.published_at_width_px_the", "published at {width}px: the case, signed out", { width: String(width) }), async (p) => {
        await p.goto(url); await settle(p);
        await requireDrawn(walk, p, "published");
        const design = await mock.draw("published", width);
        if (!design) walk.fail(FAIL.DESIGN, localize("journey-check.published.published_the_design_mock_at", "published: the design mock at {commit} draws no such screen", { commit: String(mock.commit) }));
        else walk.pairs.push(relative(out, await pair(b, await p.screenshot(), design, join(out, "pairs", `published-${width}.png`), { title: `published, ${width}px, signed out` })));
      }).catch((e) => { if (!(e instanceof StepFailed)) throw e; });
    }
    await page.setViewportSize(viewportOf(1280));
    await walk.step(page, "published: a minimum strength, the filtered view and the way back", async (p) => {
      await p.goto(url); await settle(p);
      const control = p.getByLabel(wordPattern("screen.published.show.only.findings.this.strong")).first();
      try { await control.waitFor({ state: "visible", timeout: 8000 }); } catch { throw new Error("the case offers no minimum strength (screen.published.show.only.findings.this.strong)"); }
      const before = sent;
      if ((await control.evaluate((e) => e.tagName)) === "SELECT") await control.selectOption({ index: (await control.locator("option").count()) - 1 });
      else await control.click();
      await settle(p);
      if (sent !== before) throw new Error("setting a minimum strength sent a request");
      const text = (await p.locator("#cs-main").innerText()).replace(/\s+/g, " ");
      if (!wordPattern("screen.published.this.is.part.of.the").test(text) && !wordPattern("screen.published.this.is.part.of.the.many").test(text)
        && !wordPattern("screen.published.no.finding.in.this.case").test(text)) throw new Error("the filtered view does not say it is part of the case");
      await requireWord(p, "screen.published.back.to.the.whole.case", { within: "#cs-main" });
      await byWord(p, "screen.published.back.to.the.whole.case", {}, "#cs-main").click(); await settle(p);
    }).catch((e) => { if (!(e instanceof StepFailed)) throw e; });
    await walk.step(page, "published: a finding's page, and back", async (p) => {
      await p.goto(url); await settle(p);
      const link = p.locator("#cs-main a").filter({ hasText: wordPattern("screen.published.finding") }).first();
      try { await link.waitFor({ state: "visible", timeout: 8000 }); } catch { throw new Error("the case offers no finding's page (screen.published.finding)"); }
      await link.click(); await settle(p);
      await p.goBack(); await settle(p);
    }).catch((e) => { if (!(e instanceof StepFailed)) throw e; });
    await walk.step(page, "published: Print the case, the browser's print stubbed", async (p) => {
      await p.goto(url); await settle(p);
      const before = sent;
      const btn = byWord(p, "act.owed_pubprint.label.published", {}, "#cs-main");
      try { await btn.waitFor({ state: "visible", timeout: 8000 }); } catch { throw new Error("the case offers no Print the case (act.owed_pubprint.label.published)"); }
      await btn.click(); await settle(p);
      if (sent !== before) throw new Error("printing sent a request");
      if ((await p.evaluate(() => window.__printed)) < 1) throw new Error("the press did not ask the browser to print");
      await requireWord(p, "screen.published.signed.for.lakeshore.tenants.by", { within: "body" });
    }).catch((e) => { if (!(e instanceof StepFailed)) throw e; });
  } finally { await ctx.close().catch(() => {}); }
}
