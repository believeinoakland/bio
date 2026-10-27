import { createRequire } from "node:module";
for (const k of ["HTTPS_PROXY","HTTP_PROXY","https_proxy","http_proxy"]) delete process.env[k];
const require = createRequire("/home/user/bio/bio-plane/src/journey-check/");
const { chromium } = require("playwright-core");
import fs from "node:fs";
const BASE = "https://biosmoke8.believeinoakland.workers.dev";
const OUT = "/tmp/claude-0/-home-user-bio/be515a20-27db-59e6-83ce-af1f3bc7c036/scratchpad/smoke";
const E = process.env; const lines = []; const errs = {};
const log = (s) => { lines.push(s); console.log(s); };
const exe = (() => { const d = "/opt/pw-browsers"; const c = fs.readdirSync(d).filter(x=>/^chromium-/.test(x)); return `${d}/${c[0]}/chrome-linux/chrome`; })();
const b = await chromium.launch({ executablePath: exe, args: ["--no-proxy-server","--no-sandbox"], env: { ...process.env, HOME: "/opt/walk-home" } });
const roles = [["administrator", E.JOURNEY_ADMIN_HANDLE, E.JOURNEY_ADMIN_PASSWORD, true], ["member", E.JOURNEY_MEMBER_HANDLE, E.JOURNEY_MEMBER_PASSWORD, false]];
const scrub = (s) => { for (const [,h,p] of roles) { if (p) s = s.split(p).join("***"); } return s; };
for (const [role, handle, pw, admin] of roles) for (const w of [1280, 390]) {
  const tag = `${role}-${w}`; const ctx = await b.newContext({ viewport: { width: w, height: w === 390 ? 844 : 900 } });
  const page = await ctx.newPage(); const e = errs[tag] = [];
  page.on("console", m => { if (m.type() === "error") e.push("console: " + scrub(m.text()).slice(0,200)); });
  page.on("pageerror", x => e.push("pageerror: " + scrub(String(x)).slice(0,200)));
  page.on("response", async r => { const u = new URL(r.url()); if (u.pathname.startsWith("/api") && r.status() >= 400) e.push(`api ${r.status()} op=${u.searchParams.get("op") || (r.request().postData()||"").match(/"op"\s*:\s*"([^"]+)"/)?.[1] || u.pathname}`); });
  page.on("requestfailed", r => { if (r.url().includes("/api")) e.push(`api FAILED ${r.failure()?.errorText} ${new URL(r.url()).searchParams.get("op")}`); });
  const shot = (n) => page.screenshot({ path: `${OUT}/${tag}-${n}.png` }).catch(()=>{});
  const check = async (name, id, path) => {
    try {
      if (path) await page.goto(BASE + path);
      await page.waitForSelector("[data-screen]", { timeout: 15000 });
      await page.waitForLoadState("networkidle", { timeout: 4000 }).catch(()=>{});
      await page.waitForFunction(() => !document.querySelector('[data-state="loading"]'), null, { timeout: 8000 }).catch(()=>{});
      const r = await page.evaluate(() => { const m = document.querySelector("[data-screen]"); const main = document.getElementById("cs-main") || document.body;
        return { mark: m?.getAttribute("data-screen"), failed: !!main.querySelector('[data-state="failed"]'), len: main.textContent.trim().length, ovf: document.documentElement.scrollWidth > innerWidth + 1 }; });
      const ok = (!id || id.split("|").includes(r.mark)) && !r.failed && r.len > 20;
      log(`${role} | ${w} | ${name}: ${ok ? "drawn OK" : "PROBLEM"}${ok ? "" : ` (mark=${r.mark} failed=${r.failed} len=${r.len})`}${r.ovf ? " [horizontal overflow]" : ""}${id && r.mark && !id.split("|").includes(r.mark) ? "" : ""}`);
    } catch (x) { log(`${role} | ${w} | ${name}: FAIL ${scrub(String(x.message)).slice(0,150)}`); }
    await shot(name.replace(/\W+/g, "_"));
  };
  try {
    await page.goto(BASE + "/"); await page.waitForSelector("[data-screen]", { timeout: 15000 }).catch(()=>{});
    await check("front door", "front");
    await page.locator("#fs-handle").fill(handle); await page.locator("#fs-pw").fill(pw);
    await page.locator('[data-act="login"]:visible').first().click();
    await page.waitForFunction(() => location.pathname === "/app", null, { timeout: 15000 }).catch(()=>{});
    await check("Home", "home");
    await check("Find", "finder", "/app/finder");
    await check("Projects", "projects", "/app/projects");
    const links = async (re) => page.evaluate((re) => [...document.querySelectorAll("a[href]")].map(a => a.getAttribute("href")).filter(h => new RegExp(re).test(h)), re);
    const pl = (await links("^/app/project/"))[0]; 
    if (pl) await check("a project " + pl, "project", pl); else log(`${role} | ${w} | a project: none exists`);
    await check("Queue", "queue", "/app/queue");
    let dl = (await links("^/app/(document|open-file)/"))[0];
    if (!dl) { await page.goto(BASE + "/app/finder"); await page.waitForSelector("[data-screen]").catch(()=>{}); await page.waitForTimeout(1500); dl = (await links("^/app/(document|open-file)/"))[0]; }
    if (!dl) { await page.goto(BASE + "/app/queue"); await page.waitForTimeout(2000); dl = (await links("^/app/(document|open-file)/"))[0]; }
    if (dl) await check("a document " + dl, "document|open-file", dl); else log(`${role} | ${w} | a document: none found`);
    if (admin) { await check("Settings > Your team", "group", "/app/group"); await check("Security", "security", "/app/security");
      const t = await page.evaluate(() => document.body.innerText.match(/.{0,60}scanner.{0,100}/i)?.[0]); log(`  (security text: ${t})`); }
    else await check("Account", "account", "/app/account");
    await page.locator('[data-shell="menu"]:visible').first().click();
    await page.locator('#cs-menu [data-shell="signout"]').click();
    await page.waitForSelector('[data-state="signedout"], [data-overlay="signedout"], [data-screen="front"]', { timeout: 10000 });
    log(`${role} | ${w} | sign out: OK`); await shot("signout");
  } catch (x) { log(`${role} | ${w} | FLOW STOPPED: ${scrub(String(x.message)).slice(0,200)}`); await shot("stopped"); }
  await ctx.close();
}
log(""); for (const [t, e] of Object.entries(errs)) log(`ERRORS ${t}: ${e.length ? [...new Set(e)].join(" ; ") : "none"}`);
fs.writeFileSync(OUT + "/SMOKE.md", lines.join("\n") + "\n");
await b.close();
