/* journey-check R1 (a), fix round 10 (K5101, B3): the walk's first installer step is made on the installer's first page as the
   installer draws it. `installer` R85 asks "Do you already have a Cloudflare account?" first and holds the short name's stage
   (`#stage-choose`, which holds `#slug`) back until it is answered, so a walk that filled `#slug` at once timed out. The real
   installer Worker answers its first page in this process (as account-installer.test.mjs drives it) into a real browser; the
   walk's own step (`installerFirstPage`) is run against it. */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import worker from "../../../../newgroup/src/index.mjs";
import { browser } from "../../../src/journey-check/run.mjs";
import { installerFirstPage, SLUG } from "../../../src/journey-check/journeys.mjs";

const ORIGIN = "https://newgroup.believeinoakland.workers.dev";

let B;
before(async () => { B = await browser(); });
after(async () => { await B?.close(); });

/* A page on the installer's origin whose requests the real installer Worker answers. */
async function installerPage() {
  const ctx = await B.newContext();
  await ctx.route(`${ORIGIN}/**`, async (r) => {
    const q = r.request();
    const res = await worker.fetch(new Request(q.url(), { method: q.method(), headers: q.headers() }));
    await r.fulfill({ status: res.status, headers: Object.fromEntries(res.headers), body: Buffer.from(await res.arrayBuffer()) });
  });
  await ctx.route((u) => u.origin !== ORIGIN, (r) => r.abort("blockedbyclient"));
  const page = await ctx.newPage();
  await page.goto(ORIGIN + "/");
  return { ctx, page };
}

test("R1 (a), B3: the installer's first page holds the short name back until she says she has a Cloudflare account; the walk's step answers yes and types the short name", async () => {
  const { ctx, page } = await installerPage();
  try {
    assert.equal(await page.locator("#slug").isVisible(), false, "the short name is not offered before the question is answered");
    assert.equal(await page.locator('#stage-guide [data-guide="yes"]').isVisible(), true, "the question is asked, with its yes");
    await installerFirstPage(page, ORIGIN);
    assert.equal(await page.locator("#slug").isVisible(), true, "the short name's stage is shown once she answers yes");
    assert.equal(await page.locator("#slug").inputValue(), SLUG);
  } finally { await ctx.close(); }
});

test("R1 (a), B3 control: a page that does not ask the question fails the step by name", async () => {
  const ctx = await B.newContext();
  try {
    await ctx.route(`${ORIGIN}/**`, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>x</title><main>a page with no question</main>" }));
    const page = await ctx.newPage();
    await page.goto(ORIGIN + "/");
    await assert.rejects(installerFirstPage(page, ORIGIN), /does not ask whether she has a Cloudflare account/);
  } finally { await ctx.close(); }
});
