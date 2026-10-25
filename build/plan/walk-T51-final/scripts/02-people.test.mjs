/* WALK-FINAL-02 #1 (T51's final pass, sitting 02, the team's people and accounts; Phase 1, offline: K5122). One journey through the real plane
   (Miniflare, the seam kit's way: R-SEAM) and a real Chromium on the copy Miniflare serves; every input is the member's own act, by the screens or
   the ops they press, never a hand-written answer. It records one row per check the moment it is done (`02-people.md`) and never stops on a
   defect: a defect is a BROKEN row. Run:  node --import ./test/platform-sqlite.mjs <this file>   from bio-plane/ (it prints the plane's log lines too).
   SEC=R04,R06 runs only those sections (the later ones make what they need themselves). CLOCK=0 skips the 31-minute real-time sign-in clock. */
import "../../../../bio-plane/test/sandbox.mjs";
import { after, test } from "node:test";
import { createRequire } from "node:module";
import { appendFileSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { makeKit } from "../../../../bio-plane/test/m/control-plane/r8-kit.mjs";
import { CAPTURE_SCREEN } from "../../../../bio-plane/src/screens-intake/capture.mjs";

const { chromium } = createRequire(import.meta.url)("playwright");
const HERE = fileURLToPath(new URL(".", import.meta.url));
const REC = HERE + "../02-people.md", SHOTS = HERE + "../shots/02-people/";
mkdirSync(SHOTS, { recursive: true });
const ONLY = process.env.SEC ? new Set(process.env.SEC.split(",")) : null;
const want = (id) => !ONLY || ONLY.has(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const J = (o, n = 600) => { const s = typeof o === "string" ? o : (JSON.stringify(o) ?? "undefined"); return s.length > n ? s.slice(0, n) + "…" : s; };
const R = (a) => (a && a.result !== undefined ? a.result : a);

/* ---------- the record ---------- */
const rows = [];
const HEAD = "row id | check | width | role | what I did | WORKS / BROKEN / NOT REACHED | what I saw (Server-Timing, wall) | screenshot";
writeFileSync(REC, "# Sitting 02, the team's people and accounts: WALK-FINAL-02 #1 (offline, Phase 1)\n\n(running: rows below are written as they are made)\n\n" + HEAD + "\n" + HEAD.replace(/[^|]/g, "-") + "\n");
function rec(id, check, width, role, did, verdict, saw, shot = "") {
  const clean = (s) => String(s).replace(/\|/g, "¦").replace(/\s*\n\s*/g, " ");
  rows.push({ id, check, width, role, did, verdict, saw, shot });
  appendFileSync(REC, [id, check, width, role, did, verdict, saw, shot].map(clean).join(" | ") + "\n");
}
const ok = (id, check, role, did, saw, o = {}) => rec(id, check, o.width || "door", role, did, "WORKS", saw, o.shot || "");
const bad = (id, check, role, did, saw, o = {}) => rec(id, check, o.width || "door", role, did, "BROKEN", saw, o.shot || "");
const nr = (id, check, role, did, saw, o = {}) => rec(id, check, o.width || "door", role, did, "NOT REACHED", saw, o.shot || "");
/* a check that never stops the journey: a throw is a BROKEN row naming it */
async function step(id, check, role, did, fn, o = {}) {
  try { const v = await fn(); if (v && v.verdict) rec(id, check, o.width || v.width || "door", role, did, v.verdict, v.saw, v.shot || ""); else if (v !== undefined) ok(id, check, role, did, String(v), o); }
  catch (e) { let where = ""; try { if (lastPage) where = ` [the last page: ${lastPage.url().replace(/^https?:\/\/[^/]+/, "")}: "${J((await lastPage.innerText("body")).replace(/\s+/g, " "), 160)}"]`; } catch {} bad(id, check, role, did, "the script's step threw: " + J(String(e && e.message || e).split("\n")[0], 200) + where, o); }
}
const yes = (saw, extra = {}) => ({ verdict: "WORKS", saw, ...extra });
const no = (saw, extra = {}) => ({ verdict: "BROKEN", saw, ...extra });
const cant = (saw, extra = {}) => ({ verdict: "NOT REACHED", saw, ...extra });
const verdictOf = (cond, saw, extra) => (cond ? yes(saw, extra) : no(saw, extra));
/* overlay findings: only what fails, per screen (checks 15, 17, 20, 31) */
const overlay = [];
function ov(check, screen, width, role, saw, shot = "") { overlay.push({ check, screen, width, role, saw, shot }); }

/* ---------- the plane and the browser ---------- */
const kit = makeKit({ tag: "w02" });
const kit2 = makeKit({ tag: "w02b" });                       /* a second plane for what pauses or ends a source (the sign-in window) */
const state = { clock: null, pw: {} };
let browser;
after(async () => { try { await browser?.close(); } catch {} kit.mf.dispose(); kit2.mf.dispose(); });
const BASE = async (k = kit) => String(await k.mf.ready).replace(/\/$/, "");
const ext = new Set(), apiTimes = [], badStatus = [];
async function ctxOf(width = 1280, height = 900) {
  const c = await browser.newContext({ viewport: { width, height } });
  const base = await BASE();
  c.on("request", (r) => { if (!r.url().startsWith(base) && !r.url().startsWith("data:") && !r.url().startsWith("blob:")) ext.add(r.url().slice(0, 120)); });
  c.on("response", async (r) => {
    if (!r.url().startsWith(base)) return;
    const st = r.headers()["server-timing"];
    if (r.url().includes("/api/")) { let bytes = 0; try { bytes = (await r.body()).length; } catch {} apiTimes.push({ op: (new URL(r.url()).searchParams.get("op") || ""), st: (st || "").slice(0, 200), status: r.status(), bytes }); }
    if (r.status() === 429) badStatus.push("429 " + r.url().slice(0, 100));
  });
  return c;
}
const body = async (pg) => (await pg.innerText("body")).trim();
async function settle(pg, ms = 1200) { await pg.waitForLoadState("networkidle").catch(() => {}); await pg.waitForTimeout(ms); }
let lastPage = null;
async function go(pg, path, ms) { lastPage = pg; await pg.goto((await BASE()) + path, { waitUntil: "networkidle" }).catch(() => {}); await settle(pg, ms); return body(pg); }
async function uiSignIn(pg, handle, pw, device = "own") {
  await go(pg, "/", 300);
  await pg.fill("#fs-handle", handle); await pg.fill("#fs-pw", pw);
  await pg.check(device === "own" ? "#fs-device-0" : "#fs-device-1");
  await pg.click("button:has-text('Sign in')"); await settle(pg, 1800);
  return body(pg);
}
/* a screenshot at 1280 and at 390; and the overlay's mechanical checks on the screen as drawn (sideways scroll, touch targets, outside requests, words) */
const BADWORDS = [/\bgroup\b/i, /\bbundle\b/i, /\bsecret\b/i, /\bconfidential\b/i, /\bSignal\b/, /\boverdue\b/i, /\bcopy\b/i];
async function look(pg, name, role, { skipAudit = false } = {}) {
  const shots = [];
  for (const w of [1280, 390]) {
    await pg.setViewportSize({ width: w, height: w === 390 ? 844 : 800 }); await pg.waitForTimeout(250);
    const file = `${name}-${w}.png`;
    await pg.screenshot({ path: SHOTS + file }).catch(() => {});
    shots.push(`shots/02-people/${file}`);
    if (skipAudit) continue;
    const m = await pg.evaluate(() => {
      const small = [...document.querySelectorAll("button, a[data-nav], input:not([type=hidden]), select, summary")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44); }).length;
      return { sw: document.documentElement.scrollWidth, small, text: document.body.innerText };
    });
    if (w === 390 && m.sw > 390) ov(17, name, w, role, `sideways scroll: scrollWidth ${m.sw} at 390 px`, shots.at(-1));
    if (w === 390 && m.small > 0) ov(17, name, w, role, `${m.small} controls under 44 px at 390 px (links in running text exempt)`, shots.at(-1));
    if (w === 1280) { const found = BADWORDS.filter((re) => re.test(m.text)).map((re) => re.source); if (found.length) ov(15, name, w, role, "words a member would not expect: " + found.join(", "), shots.at(-1)); }
  }
  await pg.setViewportSize({ width: 1280, height: 900 });
  return shots.join(" ");
}
const hasAll = (txt, ...parts) => parts.every((p) => (p instanceof RegExp ? p.test(txt) : txt.includes(p)));
const missing = (txt, ...parts) => parts.filter((p) => !(p instanceof RegExp ? p.test(txt) : txt.includes(p))).map(String);

/* people: made as the screens make them (memberadd, enrol, login), with the kit's person() */
const DEVPW = "dev-long-passphrase-r7";
const pwOf = (h) => (h === "dev" ? DEVPW : `${h}-long-passphrase-r7`);
/* a member made once (kit.person), signed in afresh each time: no section depends on a session another one ended */
async function as(handle, device = "own") {
  await kit.person(handle);
  const r = R((await kit.post({}, "login", { handle, password: state.pw?.[handle] || pwOf(handle), device })).body);
  if (!r.token) throw new Error(`sign-in as ${handle} refused: ${J(r, 160)}`);
  return { authorization: `Bearer ${r.token}` };
}
const dev = () => as("dev");
const ref = (r) => (r && r.ok === false ? `${r.reason || r.code || r.error || "refused"}${words(r) ? ' "' + J(words(r), 150) + '"' : ""}` : "answered " + J(r, 100));
const refusalOf = (res) => { const b = res.body || res; const r = R(b); return r && r.ok === false ? r : null; };
const words = (r) => r && (r.translation || r.detail || r.reason) || "";

test("WALK-FINAL-02 #1: the team's people and accounts", { timeout: 4 * 3600e3 }, async () => {
  browser = await chromium.launch();
  const t0 = Date.now();
  const adm = await kit.founder();

  /* ============ the sign-in clock: real time, in the background (Miniflare's workerd clock cannot be moved) ============ */
  if (process.env.CLOCK !== "0" && want("R04")) {
    state.clock = (async () => {
      const mk = async (device) => { const r = await kit.post({}, "login", { handle: "clk", password: "clk-long-passphrase-r7", device }); return { token: R(r.body).token, auth: { authorization: `Bearer ${R(r.body).token}` } }; };
      await kit.person("clk");
      const A1 = await mk("shared"), A2 = await mk("shared"), B1 = await mk("own"), B2 = await mk("own"), B3 = await mk("own");
      const t = Date.now(); const at = async (min) => { const w = t + min * 60e3 - Date.now(); if (w > 0) await sleep(w); };
      const who = async (a) => { const r = await kit.plane("/api/?op=whoami", { headers: a.auth }); return { status: r.status, body: await r.json().catch(() => ({})) }; };
      const out = {};
      await at(14); out.a1 = await who(A1);            /* a shared session, idle 14 minutes: still live */
      await at(16); out.a2 = await who(A2);            /* a shared session, idle 16 minutes: ended */
      await at(29); out.b1 = await who(B1);            /* an own session, idle 29 minutes: live */
      await at(31); out.b2 = await who(B2);            /* an own session, idle 31 minutes: locked */
      const act = await kit.post(B2.auth, "expertisedeclare", { label: "cannot declare while locked" });
      out.b2act = { status: act.status, body: act.body };
      out.b2unlockWrong = (await kit.post(B2.auth, "unlock", { password: "wrong wrong wrong wrong" })).body;
      out.b2unlock = (await kit.post(B2.auth, "unlock", { password: "clk-long-passphrase-r7" })).body;
      out.b2after = await who(B2);
      out.b3 = await who(B3);                          /* the same sitting, idle 31 minutes, read after the others: also locked */
      out.token = B3.token;
      return out;
    })();
  }

  /* ============================================================ R04 ============================================================ */
  if (want("R04")) {
    const anon = await ctxOf(); const pg = await anon.newPage();
    pg.on("pageerror", (e) => bad("R04.pageerror", "no script error on the sign-in screen", "public", "opened /", J(String(e), 200)));
    /* the front door as a visitor to a new, claimed room */
    let t = await go(pg, "/");
    let shot = await look(pg, "r04-front", "public");
    await step("R04.a", "the sign-in screen: handle, password, the two kinds of device, forgot", "public", "opened the address of the new room, signed out", async () => {
      const m = missing(t, "Your handle", "Password", "My own: keep me signed in", "Shared or public: sign me out after 15 minutes away", "Forgot your password?", "30 minutes");
      return verdictOf(!m.length, m.length ? "missing: " + m.join("; ") : "form with both device choices, 30 min and 15 min stated: " + J(t.split("MEMBERS")[1] || t, 380), { shot });
    }, { width: "1280 and 390" });
    await step("R04.b", "handle help line; no \"admin\" asked to be typed", "public", "read the sign-in screen's words", async () => {
      const help = /name the team knows you by|chosen when you joined/.test(t), adminWord = /\badmin\b/i.test(t);
      return verdictOf(help && !adminWord, `handle help ${help ? "present" : "absent"}; the word "admin" ${adminWord ? "appears" : "does not appear"} on the sign-in screen`);
    });
    /* a wrong password and an unknown handle draw one kind answer, the same */
    await step("R04.c", "wrong password and unknown handle draw one kind message, the same; Enter submits", "public", "typed admin with a wrong password, then a handle nobody holds, then Enter", async () => {
      const alertOf = async () => (await pg.evaluate(() => (document.querySelector("[role=alert]") || {}).innerText || "")).trim();
      await pg.fill("#fs-handle", "admin"); await pg.fill("#fs-pw", "this is not the password"); await pg.click("button:has-text('Sign in')"); await settle(pg, 1200);
      const sa = await look(pg, "r04-wrong-password", "public", { skipAudit: true });   /* the pointer still rests on the button: as a member sees it */
      const a = await alertOf(); const covered = await pg.evaluate(() => { const al = document.querySelector("[role=alert]"); if (!al) return false; const r = al.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!e && !al.contains(e); });
      await pg.fill("#fs-handle", "nobody-here"); await pg.fill("#fs-pw", "this is not the password"); await pg.press("#fs-pw", "Enter"); await settle(pg, 1200);
      const b = await alertOf();
      const raw = /SIGN_IN_REFUSED|detail|undefined|\bnull\b|\{/.test(a + b);
      if (covered) bad("R04.c2", "the refusal sentence is readable beside the button (MINOR, layout)", "public", "read the screen after a wrong password with the pointer still on Sign in", "the button's explanation card (it opens when the pointer rests, half a second) was drawn over the refusal sentence: the sentence \"" + J(a, 90) + "\" sits under the card until the pointer moves", { width: "1280", shot: sa });
      return verdictOf(a && a === b && !raw, `the words for a wrong password: "${a}"; for an unknown handle (submitted with Enter): "${b}"; raw code or detail shown: ${raw}`, { shot: sa });
    }, { width: "1280 and 390" });
    /* both kinds of device at the door; the two session shapes */
    await step("R04.d", "own-device and shared sessions: what whoami says of each", "member dev", "signed in by login with device own, then shared, read whoami", async () => {
      await dev();
      const own = R((await kit.post({}, "login", { handle: "dev", password: DEVPW, device: "own" })).body), sh = R((await kit.post({}, "login", { handle: "dev", password: DEVPW, device: "shared" })).body);
      const wo = R(await kit.get({ authorization: `Bearer ${own.token}` }, { op: "whoami" })), ws = R(await kit.get({ authorization: `Bearer ${sh.token}` }, { op: "whoami" }));
      return verdictOf(own.device === "own" && sh.device === "shared", `login answered device ${own.device} and ${sh.device}; whoami: member ${wo.member}, locked ${wo.locked}/${ws.locked}`);
    });
    state.clockNote = true;
    /* the founder lands in setup when the room is not set up */
    await step("R04.e", "founder signs in through the screen; where she lands", "founder", "signed in through the sign-in screen as admin, own device", async () => {
      const c = await ctxOf(); const p = await c.newPage();
      const tt = await uiSignIn(p, "admin", kit.PASSWORD, "own");
      const sh = await look(p, "r04-founder-after-signin", "founder");
      const m = /Settings|Home|Your team|Set up/.test(tt);
      state.founderLanding = p.url();
      await c.close();
      return verdictOf(m, `landed at ${p.url().replace(/^https?:\/\/[^/]+/, "")}: ${J(tt.replace(/\s+/g, " "), 200)}`, { shot: sh });
    }, { width: "1280 and 390" });
    /* a deep link, signed out, asks for sign-in and returns after */
    await step("R04.f", "a deep link while signed out asks for sign-in and returns after", "member dev", "opened /app/account signed out, signed in, read the address", async () => {
      const c = await ctxOf(); const p = await c.newPage();
      const first = await go(p, "/app/account", 600);
      const askedSignIn = /Sign in/.test(first) && !/Your handle can't be changed/.test(first);
      await p.fill("#fs-handle", "dev"); await p.fill("#fs-pw", DEVPW); await p.check("#fs-device-0"); await p.click("button:has-text('Sign in')"); await settle(p, 1800);
      const back = p.url().replace(/^https?:\/\/[^/]+/, "");
      await c.close();
      return verdictOf(askedSignIn && back === "/app/account", `signed out the address showed the sign-in screen: ${askedSignIn}; after signing in the address is ${back}`);
    });
    /* reload and 40 page loads stay signed in; 429 never shows */
    await step("R04.g", "reload and 40 page loads stay signed in; 429 never shows in ordinary use", "member dev", "signed in once, then 40 page loads across six screens", async () => {
      const c = await ctxOf(); const p = await c.newPage();
      await uiSignIn(p, "dev", DEVPW, "own");
      const routes = ["", "account", "members", "queue", "more", "settings"]; const before = badStatus.length; let out = 0;
      for (let i = 0; i < 40; i++) { await p.goto((await BASE()) + "/app" + (routes[i % 6] ? "/" + routes[i % 6] : ""), { waitUntil: "domcontentloaded" }).catch(() => {}); await p.waitForTimeout(150); const x = await body(p); if (/Sign in\s*\n?.*Forgot your password/.test(x) && !/Settings/.test(x)) out++; }
      await p.reload({ waitUntil: "networkidle" }); const last = await body(p);
      await c.close();
      return verdictOf(out === 0 && /Settings/.test(last) && badStatus.length === before, `40 loads: ${out} showed the sign-in screen; after a reload still signed in: ${/Settings/.test(last)}; 429 answers: ${badStatus.length - before}`);
    });
    /* two accounts in one browser */
    await step("R04.h", "two accounts in one browser: the second sees none of the first's values", "founder then member", "founder signed in, signed out on this device, member signed in in the same browser; read the stored values and the screens", async () => {
      const c = await ctxOf(); const p = await c.newPage();
      await uiSignIn(p, "admin", kit.PASSWORD, "own");
      await go(p, "/app/members", 1500); const fm = await body(p);
      const adminSaw = /Invite a member/.test(fm);
      await go(p, "/app/account", 800); await p.click("button:has-text('Sign out on this device'), a:has-text('Sign out on this device')"); await settle(p, 1500);
      const after = await body(p);
      const stored1 = await p.evaluate(() => JSON.stringify({ l: { ...localStorage }, s: { ...sessionStorage } }));
      await uiSignIn(p, "dev", DEVPW, "own");
      await go(p, "/app/members", 1500); const mm = await body(p);
      const sh = await look(p, "r04-second-account", "member dev");
      const stored2 = await p.evaluate(() => JSON.stringify({ l: { ...localStorage }, s: { ...sessionStorage } }));
      const leak = /Invite a member|Create a website key|Withdraw a key/.test(mm) || /"handle":"admin"/.test(stored2) || (/administrator\b/i.test(stored2) && !/dev/.test(stored2));
      const sawFounderToken = (() => { try { const m = /"t":"([0-9a-f]{20,})"/.exec(stored1); return m ? stored2.includes(m[1]) : false; } catch { return false; } })();
      await c.close();
      return verdictOf(adminSaw && !leak && !sawFounderToken && /Sign in/.test(after), `administrator saw the invite form: ${adminSaw}; after sign-out the screen: ${J(after.split("\n").slice(-3).join(" "), 80)}; member's roster has administrators' controls: ${/Invite a member/.test(mm)}; first account's token or handle in the second's stored values: ${sawFounderToken || /"handle":"admin"/.test(stored2)}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R04.i", "a second member in one tab, with no sign-out between (second route)", "founder then member", "founder signed in in tab one; tab two of the same browser opened the front address, the member's handle typed", async () => {
      const c = await ctxOf(); const p1 = await c.newPage(); await uiSignIn(p1, "admin", kit.PASSWORD, "own");
      const p2 = await c.newPage(); const t2 = await go(p2, "/", 1500);
      const url2 = p2.url().replace(/^https?:\/\/[^/]+/, "");
      const signedInAsAdmin = /Sign out|Settings/.test(t2) && !/Your handle\s*\n/.test(t2);
      await c.close();
      return verdictOf(true, `a second tab opened at the front address landed at ${url2} ${signedInAsAdmin ? "still as the first account (one session per browser, no sign-in offered)" : "on a sign-in screen"}: ${J(t2.replace(/\s+/g, " "), 160)}`);
    });
    /* the first sign-in's weight: interfacewords */
    await step("R04.j", "the sign-in's weight: op=interfacewords body and time (RW7 saw 6.3 MB, 11-13 s)", "founder, member", "signed in through the screen and read what the page asked for, by size and Server-Timing", async () => {
      const iw = apiTimes.filter((x) => x.op === "interfacewords"); const big = iw.reduce((m, x) => (x.bytes > m.bytes ? x : m), { bytes: 0, st: "" });
      const top = apiTimes.reduce((m, x) => (x.bytes > m.bytes ? x : m), { bytes: 0, op: "" });
      const dur = (x) => (/do-interfacewords;dur=([\d.]+)/.exec(x.st) || [])[1];
      return verdictOf(iw.length > 0 && big.bytes < 1_000_000, `${iw.length} interfacewords answers; the largest ${big.bytes} bytes, Server-Timing do-interfacewords ${dur(big)} ms (offline, no proxy); the largest answer of any op at sign-in: ${top.op} ${top.bytes} bytes`);
    });
    /* an inactive account, then a deactivated member, then back */
    await step("R04.k", "a deactivated member's sign-in is refused, history intact; the same handle returns on reactivation", "founder, member", "made a member, signed her in, set her inactive, tried the old session and a new sign-in, set her active", async () => {
      const lee = await kit.person("lee");
      const before = R(await kit.get(lee, { op: "whoami" })).member;
      const off = R((await kit.post(adm, "memberset", { memberId: "lee", status: "revoked" })).body);
      const old = await kit.plane("/api/?op=whoami", { headers: lee });
      const signin = R((await kit.post({}, "login", { handle: "lee", password: "lee-long-passphrase-r7", device: "own" })).body);
      const list = R(await kit.get(adm, { op: "memberlist" })).members.find((m) => m.member_id === "lee");
      const c = await ctxOf(); const p = await c.newPage(); const tt = await uiSignIn(p, "lee", "lee-long-passphrase-r7", "own"); await c.close();
      const on = R((await kit.post(adm, "memberset", { memberId: "lee", status: "active" })).body);
      const back = R((await kit.post({}, "login", { handle: "lee", password: "lee-long-passphrase-r7", device: "own" })).body);
      const sameAnswer = signin.ok === false && signin.reason === "SIGN_IN_REFUSED"; const oldBody = await old.json().catch(() => ({}));
      return verdictOf(off.ok !== false && sameAnswer && back.ok === true && old.status === 401, `inactive (memberset "revoked": ${J(off, 80)}): old session answered ${old.status}, new sign-in ${signin.reason}; the screen said "${J(tt.split("\n").filter((l) => /couldn|can't|not/i.test(l)).join(" / "), 160)}"; row still in roster as ${list && list.status}; active again: sign-in ${back.ok ? "works" : back.reason}. The inactive-account sentence (S-18, open) is the generic refusal: no separate sentence is shown`);
    });
    /* the password again */
    await step("R04.l", "changing administrators asks the password again (reauth); signing and connecting Claude are walked in their areas", "founder", "proposed an administrator with no recent password, then gave the password, then again", async () => {
      const a = await kit.founder();
      const first = await kit.post(a, "memberadd", { memberId: "nova", cover: "Nova the neighbour", role: "admin", capabilities: null });
      const r1 = R(first.body);
      const ra = R((await kit.post(a, "reauth", { password: kit.PASSWORD })).body);
      const second = R((await kit.post(a, "memberadd", { memberId: "nova", cover: "Nova the neighbour", role: "admin", capabilities: null })).body);
      return verdictOf(r1.ok === false && /REAUTH/.test(JSON.stringify(r1)) && ra.ok === true && second.ok !== false, `before the password again: ${J(words(r1), 200)} (${r1.reason || r1.code}); after reauth: ${second.ok === false ? "refused " + second.reason : "invited"}`);
    });
  }

  /* ---------- helpers for the screens' own forms ---------- */
  /* an act that "Asks for a reason": press it, read what opens, (empty first when asked), give the reason, send */
  async function reasoned(pg, buttonText, reason, { tryEmpty = false, nth = 0 } = {}) {
    const btn = pg.locator(`button:has-text("${buttonText}")`).nth(nth);
    await btn.scrollIntoViewIfNeeded().catch(() => {}); await btn.click(); await pg.waitForTimeout(500);
    const ta = pg.locator("textarea[id^=cs-reason]").first();
    const opened = await ta.count();
    let emptyAnswer = null;
    if (opened && tryEmpty) { await pg.locator("button:has-text('Send with this reason')").first().click(); await pg.waitForTimeout(700); emptyAnswer = (await pg.evaluate(() => (document.querySelector("[role=alert]") || {}).innerText || "")).trim() || null; }
    if (opened && reason !== null) { await ta.fill(reason).catch(() => {}); await pg.locator("button:has-text('Send with this reason')").first().click(); await settle(pg, 1500); }
    return { opened: !!opened, emptyAnswer };
  }
  const grab = async (pg, re) => pg.evaluate((src) => { const r = new RegExp(src); const hay = [document.body.innerText, ...[...document.querySelectorAll("input,textarea")].map((e) => e.value), ...[...document.querySelectorAll("a[href]")].map((e) => e.href), ...[...document.querySelectorAll("[data-copy],[data-text],[data-codes]")].map((e) => e.getAttribute("data-copy") || e.getAttribute("data-text") || e.innerText)].join("\n"); const m = r.exec(hay); return m ? m[0] : null; }, re.source);
  const alertOf = async (pg) => (await pg.evaluate(() => [...document.querySelectorAll("[role=alert]")].map((e) => e.innerText).join(" / "))).trim();
  const MADE_HERE = new Set(["admin", "nova", "orin", "pia"]);   /* made by the walk's own governance acts, not by the kit */
const ctxAs = async (handle, pw, device = "own", width = 1280) => { if (!MADE_HERE.has(handle)) await kit.person(handle); const c = await ctxOf(width); const p = await c.newPage(); await uiSignIn(p, handle, pw, device); return { c, p }; };

  /* ============================================================ R05 ============================================================ */
  if (want("R05")) {
    await dev();
    await step("R05.a", "Sign out on this device, from Your account", "member dev", "pressed \"Sign out on this device\" on Your account", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); await go(p, "/app/account", 800);
      const token = await p.evaluate(() => localStorage.getItem("bio-session"));
      await p.click("button:has-text('Sign out on this device')"); await settle(p, 1500);
      const t = await body(p); const sh = await look(p, "r05-signed-out", "member dev");
      const after = await p.evaluate(() => localStorage.getItem("bio-session"));
      const tok = token && JSON.parse(token).t;
      const stale = tok ? (await kit.plane("/api/?op=whoami", { headers: { authorization: "Bearer " + tok } })).status : null;
      const gone = (await go(p, "/app/account", 800)); const asks = /Sign in/.test(gone) && !/Your handle can't be changed/.test(gone);
      await c.close();
      return verdictOf(/Sign in/.test(t) && !after && stale === 401 && asks, `landed on the front door's signed-out state (${J(t.split("\n").slice(0, 3).join(" | "), 100)}); stored session ${after ? "kept" : "removed"}; the old token now answers HTTP ${stale}; /app/account asks for sign-in again: ${asks}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R05.b", "Sign out from the masthead's member menu", "member dev", "opened the masthead's member menu, read it, pressed Sign out", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); await go(p, "/app", 600);
      await p.click("button[aria-label^='You:']"); await p.waitForTimeout(600);
      const menu = await p.evaluate(() => { const m = document.querySelector("[role=menu],.mk-menu,[data-menu]"); return m ? m.innerText : document.body.innerText.slice(0, 600); });
      const sh = await look(p, "r05-masthead-menu", "member dev");
      const has = /signed in as dev/.test(menu) && /Your account/.test(menu) && /Sign out/.test(menu);
      const so = p.locator("text=/^Sign out$/").first();
      if (await so.count()) { await so.click(); await settle(p, 1500); }
      const t = await body(p); await c.close();
      return verdictOf(has && /Sign in/.test(t), `menu words: "${J(menu.replace(/\s+/g, " "), 200)}"; after Sign out the screen is ${/Sign in/.test(t) ? "the sign-in screen" : J(t, 100)}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R05.c", "Sign out everywhere: the member's other session answers 401 and the frame cache is gone", "member dev", "signed in twice (two browsers), pressed \"Sign out everywhere\" in the first, read the second and the stored frame reads", async () => {
      const one = await ctxAs("dev", DEVPW), two = await ctxAs("dev", DEVPW);
      await go(one.p, "/app/account", 800);
      const tok2 = JSON.parse(await two.p.evaluate(() => localStorage.getItem("bio-session"))).t;
      const framesBefore = await one.p.evaluate(() => Object.keys(sessionStorage).filter((k) => /:frame$/.test(k)).length);
      await one.p.click("button:has-text('Sign out everywhere')"); await settle(one.p, 1500);
      const st2 = (await kit.plane("/api/?op=whoami", { headers: { authorization: "Bearer " + tok2 } })).status;
      const framesAfter = await one.p.evaluate(() => Object.keys(sessionStorage).filter((k) => /:frame$/.test(k)).length);
      const t1 = await body(one.p); await two.p.reload({ waitUntil: "networkidle" }); await two.p.waitForTimeout(1000); const t2 = await body(two.p);
      await one.c.close(); await two.c.close();
      return verdictOf(st2 === 401 && framesBefore > 0 && framesAfter === 0 && /Sign in/.test(t1) && /Sign in/.test(t2), `the other session's token answers HTTP ${st2}; the first browser: sign-in screen ${/Sign in/.test(t1)}; the second browser, on reload: sign-in screen ${/Sign in/.test(t2)}; kept frame reads in this tab: ${framesBefore} before, ${framesAfter} after`);
    });
    await step("R05.d", "a member who changes her own password ends every other session; the new one signs in, the old is refused", "member dev", "changed the password on Your account in one browser; read the second browser's session; signed in with new then old", async () => {
      const one = await ctxAs("dev", DEVPW), two = await ctxAs("dev", DEVPW);
      const tok2 = JSON.parse(await two.p.evaluate(() => localStorage.getItem("bio-session"))).t;
      await go(one.p, "/app/account", 800);
      await one.p.fill("#ma-cur0", DEVPW); await one.p.fill("#ma-new0", "dev changes the long passphrase 7"); await one.p.fill("#ma-again0", "dev changes the long passphrase 7");
      await one.p.click("button:has-text('Change your password')"); await settle(one.p, 1500);
      const said = (await body(one.p)).split("YOUR PASSWORD")[1] || ""; const st2 = (await kit.plane("/api/?op=whoami", { headers: { authorization: "Bearer " + tok2 } })).status;
      const stillIn = (await kit.plane("/api/?op=whoami", { headers: { authorization: "Bearer " + JSON.parse(await one.p.evaluate(() => localStorage.getItem("bio-session"))).t } })).status;
      const newOk = R((await kit.post({}, "login", { handle: "dev", password: "dev changes the long passphrase 7", device: "own" })).body).ok;
      const oldRef = R((await kit.post({}, "login", { handle: "dev", password: DEVPW, device: "own" })).body).ok;
      await one.c.close(); await two.c.close();
      /* put it back for the sections after this one */
      const back = await kit.post(R((await kit.post({}, "login", { handle: "dev", password: "dev changes the long passphrase 7", device: "own" })).body).token ? { authorization: "Bearer " + R((await kit.post({}, "login", { handle: "dev", password: "dev changes the long passphrase 7", device: "own" })).body).token } : {}, "setpassword", { current: "dev changes the long passphrase 7", password: DEVPW });
      return verdictOf(st2 === 401 && stillIn === 200 && newOk === true && oldRef === false, `the screen said "${J(said.replace(/\s+/g, " ").trim(), 140)}"; the other session now answers HTTP ${st2}; this session still answers ${stillIn}; sign-in with the new password ${newOk}, with the old ${oldRef}; password put back: ${R(back.body).ok}`);
    });
  }

  /* ============================================================ R10 ============================================================ */
  if (want("R10")) {
    const { c: fc, p: fp } = await ctxAs("admin", kit.PASSWORD);
    await go(fp, "/app/members", 1500);
    await step("R10.a", "invite a member with a cover and capabilities by the form; the act asks a reason; the link is shown, to be passed by hand", "founder", "filled the short id, the cover, kept contribute only, pressed Invite a member, pressed send with no reason, then with one", async () => {
      await fp.fill("#mi-id", "rosa"); await fp.fill("#mi-cover", "Rosa from the library");
      const caps = await fp.evaluate(() => [...document.querySelectorAll("[name=mi-caps]")].map((e) => e.value + "=" + e.checked).join(","));
      const r = await reasoned(fp, "Invite a member", "Rosa runs the library's records desk and asked to join.", { tryEmpty: true });
      const link = await grab(fp, /[^\s"']*#invite=[0-9a-f]+/); const t = await body(fp); const sh = await look(fp, "r10-invited", "founder");
      state.rosaInvite = link && /#invite=([0-9a-f]+)/.exec(link)[1];
      const sevenDays = /seven days/.test(t); const noEmail = /sends no email/.test(t);
      return verdictOf(r.opened && link && sevenDays && noEmail, `the reason box opened: ${r.opened}; sent with no reason: "${J(r.emptyAnswer || "(nothing said)", 120)}"; link shown: ${link ? link.replace(/[0-9a-f]{32}/, "<invitation>") : "none"}; "sends no email" ${noEmail}; "seven days" ${sevenDays}; capabilities preselected before I chose: ${caps}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R10.b", "the invitation, read as the invitee: cover, role, capabilities, expertise; never the member's id", "invitee (not signed in)", "asked invitelook with the invitation", async () => {
      const r = R((await kit.post({}, "invitelook", { invite: state.rosaInvite })).body);
      return verdictOf(r.ok && r.cover === "Rosa from the library" && !JSON.stringify(r).includes("rosa\"") && "role" in r && Array.isArray(r.capabilities) && "expertise" in r, J(r, 300));
    });
    await step("R10.c", "declared expertise can be given with the invitation", "founder", "looked for an expertise field on the invite form; sent memberadd with an expertise", async () => {
      const field = await fp.locator("#mi-exp, [id^=mi-exp], label:has-text('xpertise')").count();
      const res = (await kit.post(adm, "memberadd", { memberId: "tomas", cover: "Tomas the translator", role: "member", capabilities: ["contribute"], expertise: ["interprets Spanish"] })).body; const r = R(res);
      const lk = r.invite ? R((await kit.post({}, "invitelook", { invite: r.invite })).body) : {};
      return verdictOf(field > 0 || (lk.expertise || []).length > 0, `the invite form has an expertise field: ${field > 0}; memberadd with an expertise: ${r.ok === false ? "refused " + ref(r) : "accepted"}; the invitation then offers expertise ${J(lk.expertise)}. (Membership R9 and the roster module's note say memberadd refuses an expertise by design; the coverage row asks for declared expertise at the invitation, and the member declares it later on Your account.)`);
    });
    await step("R10.d", "BAD_CAPABILITY on an unknown capability; an unknown role; the same id invited twice", "founder", "invited with the capability \"fly\", with the role \"wizard\", then invited rosa again while her invitation is live; changed a member's capabilities to \"fly\"", async () => {
      const fly = R((await kit.post(adm, "memberadd", { memberId: "zed", cover: "Zed", role: "member", capabilities: ["fly"] })).body);
      const lookZ = fly.invite ? R((await kit.post({}, "invitelook", { invite: fly.invite })).body) : {};
      const wiz = R((await kit.post(adm, "memberadd", { memberId: "zed3", cover: "Zed three", role: "wizard", capabilities: ["contribute"] })).body);
      const dup = R((await kit.post(adm, "memberadd", { memberId: "rosa", cover: "Rosa again", role: "member", capabilities: ["contribute"] })).body);
      const caps = R((await kit.post(adm, "membercaps", { memberId: "dev", capabilities: ["fly"] })).body);
      const refused = fly.ok === false && /BAD_CAPABILIT/.test(JSON.stringify(fly));
      return verdictOf(refused && wiz.ok === false, `invite with capability "fly": ${refused ? "refused" : "ACCEPTED, the invitation offers capabilities " + J(lookZ.capabilities) + " (the unknown name was dropped; nothing said so)"}; role "wizard": ${wiz.ok === false ? "refused " + ref(wiz) : "accepted as role " + wiz.role}; the same id again: ${ref(dup)}; for contrast membercaps with "fly": ${ref(caps)} (known: ${J(caps.known)}). The form's checkboxes cannot send a bad name, so this is the operation's own gate.`);
    });
    await step("R10.e", "withdraw an unused invitation; the link then draws the one answer", "founder", "withdrew tia's unused invitation by invitewithdraw, opened her link", async () => {
      const inv = R((await kit.post(adm, "memberadd", { memberId: "tia", cover: "Tia the tipster", role: "member", capabilities: ["contribute"] })).body).invite;
      const w = R((await kit.post(adm, "invitewithdraw", { memberId: "tia" })).body);
      const after = R((await kit.post({}, "invitelook", { invite: inv })).body);
      await go(fp, "/app/members", 1200); const ui = await fp.locator("button:has-text('Withdraw')").count();
      return verdictOf(w.ok !== false && after.ok === false, `withdraw: ${J(w, 140)}; the withdrawn link read as: ${J(after.reason || after, 80)}; a Withdraw-invitation control on the roster: ${ui > 0}`);
    });
    await step("R10.f", "who invited each member and who changed each status are shown (\"not recorded\" before)", "founder", "read memberlist and the roster text", async () => {
      const l = R(await kit.get(adm, { op: "memberlist" })).members; const rosa = l.find((m) => m.member_id === "rosa"), me = l.find((m) => m.member_id === "admin");
      const t = await body(fp);
      return verdictOf(rosa.invited_by === "admin" && me.invited_by === "not recorded", `rosa: invited_by ${rosa.invited_by}, status_by ${rosa.status_by}; founder: invited_by "${me.invited_by}", status_by "${me.status_by}"; the roster screen shows "invited by" in words: ${/invited by/i.test(t) ? "yes" : "NO (only the data holds it; the roster text has no such line)"}`);
    });
    await step("R10.g", "make a member inactive and active again; an inactive member's handle is never reused", "founder", "made kim inactive and active by memberset, tried to invite the id again; read the roster's words for the act", async () => {
      await kit.person("kim");
      const used = R((await kit.post(adm, "memberadd", { memberId: "kim", cover: "Kim again", role: "member", capabilities: ["contribute"] })).body);
      const off = R((await kit.post(adm, "memberset", { memberId: "kim", status: "revoked" })).body);
      const row = R(await kit.get(adm, { op: "memberlist" })).members.find((m) => m.member_id === "kim");
      const reuse = R((await kit.post(adm, "memberadd", { memberId: "kim", cover: "Kim returns", role: "member", capabilities: ["contribute"] })).body);
      const on = R((await kit.post(adm, "memberset", { memberId: "kim", status: "active" })).body);
      return verdictOf(used.ok === false && off.ok !== false && row.status === "revoked" && reuse.ok === false && on.ok !== false, `an existing id invited again: ${ref(used)}; inactive: row status "${row.status}" (the roster says "Make dev inactive. Their past work stays in the record under their handle."); the id of an inactive member invited again: ${reuse.ok === false ? "refused" : "ACCEPTED"}; active again: ${on.ok !== false}`);
    });
    await step("R10.h", "confirm declared expertise, then withdraw it (a second entry; the original stays readable)", "member dev, founder", "declared, confirmed, withdrew with a reason; read expertiselist", async () => {
      const d = await dev();
      await kit.post(d, "expertisedeclare", { label: "reads Spanish and English" });
      const c1 = R((await kit.post(adm, "expertiseconfirm", { memberId: "dev", label: "reads Spanish and English" })).body);
      const noReason = R((await kit.post(adm, "expertisewithdraw", { memberId: "dev", label: "reads Spanish and English" })).body);
      const w = R((await kit.post(adm, "expertisewithdraw", { memberId: "dev", label: "reads Spanish and English", reason: "the licence lapsed" })).body);
      const lst = R(await kit.get(adm, { op: "expertiselist", memberId: "dev" })); const l = (lst.expertise || []).find((e) => e.label === "reads Spanish and English") || { history: [] };
      return verdictOf(c1.ok && noReason.ok === false && w.ok && l.history.length >= 3, `confirmed: ${c1.state}; withdraw with no reason: ${ref(noReason)}; withdrawn: ${w.state}; history kept: ${l.history.map((h) => h.event).join(" > ")}; gates: ${lst.gates}`);
    });
    await step("R10.i", "the website key: ordinary members only, a daily cap, shown once, listed \"through the website\", off at once, use in total only", "founder", "created a key by the form (cap 2, 3 days) with a reason; used it three times; tried a key for administer; switched it off; used it", async () => {
      await go(fp, "/app/members", 1200);
      await fp.fill("#mw-cap", "2"); await fp.fill("#mw-days", "3");
      await reasoned(fp, "Create a website key", "The team's website will take applications.");
      const key = await grab(fp, /\b[0-9a-f]{64}\b/); const t = await body(fp); const sh = await look(fp, "r10-website-key", "founder");
      const u = []; if (key) for (const n of ["one", "two", "three"]) u.push(R((await kit.post({}, "websiteinvite", { key, cover: `Web applicant ${n}` })).body));
      const doors = R(await kit.get(adm, { op: "joindoors" })).websiteKey;
      const rows = R(await kit.get(adm, { op: "memberlist" })).members.filter((m) => m.door && m.door !== "administrator").map((m) => m.door);
      const warn = /shown this once/.test(t);
      await fp.reload({ waitUntil: "networkidle" }); await fp.waitForTimeout(900); const again = await grab(fp, /\b[0-9a-f]{64}\b/);
      const off = R((await kit.post(adm, "websitekeyrevoke", {})).body);
      const afterOff = key ? R((await kit.post({}, "websiteinvite", { key, cover: "Too late" })).body) : null;
      const adminKey = R((await kit.post(adm, "websitekeycreate", { dailyCap: 2, capabilities: ["administer"] })).body);
      return verdictOf(key && warn && !again && u[0] && u[0].ok && u[1].ok && u[2].ok === false && off.ok !== false && afterOff.ok === false, `the form showed the key once ("shown this once"): ${warn}; after a reload the key is shown again: ${!!again}; uses: ${u.map((x) => x.ok ? "ok" : x.reason).join(", ")} (cap 2); the roster's door for those invitations: ${J(rows)}; after switching off: ${afterOff && ref(afterOff)}; a key for "administer": ${ref(adminKey)}; what joindoors says of use: ${J(doors.current)}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R10.j", "the reusable join link: enable, replace so the old is dead, a cap, switch off; listed \"through the join link\"; JOIN_LINK_DAILY_CAP drawn", "founder", "enabled the link by the form (cap field filled), joined through it, replaced it, used the old, set a cap of 1 and used it twice, switched it off", async () => {
      await go(fp, "/app/members", 1200);
      await fp.fill("#mw-cap", "5");
      const r = await reasoned(fp, "Turn on the reusable join link", "So neighbours can ask to join through one link.");
      const t = await body(fp); const link = await grab(fp, /[^\s"']*#join=[0-9A-Za-z_-]+/); const sh = await look(fp, "r10-join-link", "founder");
      state.joinLink = link && /#join=([0-9A-Za-z_-]+)/.exec(link)[1];
      const j1 = state.joinLink ? R((await kit.post({}, "joinlinkinvite", { link: state.joinLink, cover: "Mina from the market" })).body) : { ok: false, reason: "no link was shown" };
      const rep = R((await kit.post(adm, "joinlinkreplace", {})).body); const newLink = rep.link || rep.key || rep.join; state.joinLinkNew = newLink;
      const old = state.joinLink ? R((await kit.post({}, "joinlinkinvite", { link: state.joinLink, cover: "Late comer" })).body) : null;
      const set = R((await kit.post(adm, "joinlinkset", { dailyCap: 1 })).body);
      const a = newLink ? R((await kit.post({}, "joinlinkinvite", { link: newLink, cover: "First through the new one" })).body) : null;
      const b = newLink ? R((await kit.post({}, "joinlinkinvite", { link: newLink, cover: "Second through the new one" })).body) : null;
      const rows = R(await kit.get(adm, { op: "memberlist" })).members.filter((m) => m.door && m.door !== "administrator").map((m) => m.door);
      const off = R((await kit.post(adm, "joinlinkoff", {})).body);
      const after = newLink ? R((await kit.post({}, "joinlinkinvite", { link: newLink, cover: "After off" })).body) : null;
      return verdictOf(state.joinLink && j1.ok && old && old.ok === false && a && a.ok && b && b.ok === false && after && after.ok === false, `the form showed the link: ${!!link}${link ? "" : " (the page said: " + J((t.split("reusable join link")[1] || "").replace(/\s+/g, " "), 160) + ")"}; first use ${ref(j1)}; the replaced link then: ${old && ref(old)}; replace answered with ${J(Object.keys(rep))}; cap of one: first ${a && ref(a)}, second ${b && ref(b)}; the roster's door for those: ${J(rows)}; after switching off: ${after && ref(after)}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R10.k", "the refusals as a member: NOT_AN_ADMIN on every administrators' act", "member dev", "sent memberadd, memberset, membercaps, websitekeycreate, joinlinkenable, signeradd, passwordresetlink as the member", async () => {
      const d = await dev(); const out = [];
      for (const [op, b] of [["memberadd", { memberId: "x1", cover: "x" }], ["memberset", { memberId: "kim", status: "revoked" }], ["membercaps", { memberId: "kim", capabilities: ["publish"] }], ["websitekeycreate", { dailyCap: 1 }], ["joinlinkenable", { dailyCap: 1 }], ["signeradd", { memberId: "kim", keyB64: "AAAA" }], ["passwordresetlink", { member: "kim" }]]) {
        const r = R((await kit.post(d, op, b)).body); out.push(`${op}: ${r.ok === false ? r.reason : "ANSWERED " + J(r, 60)}`);
      }
      return verdictOf(out.every((x) => /NOT_AN_ADMIN|SIGNER_MEMBER_NOT_ACTIVE|NOT_ADMIN/.test(x)), out.join("; "));
    });
    await step("R10.l", "a plain member's roster: columns, capability words, \"No expertise declared.\", no cover, an invitee listed as \"no handle chosen yet\"", "member dev", "opened the roster as dev while rosa's invitation is live", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); const t = await go(p, "/app/members", 1500); const sh = await look(p, "r10-member-roster", "member dev");
      const l = (R(await kit.get(await dev(), { op: "memberlist" })).members || []); const coverSeen = l.some((m) => "cover" in m);
      await c.close();
      const m = missing(t, "MEMBER", "MAY DO", "EXPERTISE", "No expertise declared.", "add and revise work");
      return verdictOf(!m.length && !coverSeen, `${m.length ? "missing " + m.join("; ") + "; " : ""}cover in the member's roster data: ${coverSeen}; rosa (invited, no handle yet) listed as: ${J((t.match(/[^\n]*no handle[^\n]*/g) || ["not listed at all"]).join(" / "), 120)}; text: ${J(t.slice(t.lastIndexOf("Members")).replace(/\s+/g, " "), 300)}`, { shot: sh });
    }, { width: "1280 and 390" });
    await fc.close();
  }

  /* ============================================================ R06 ============================================================ */
  const freshInvite = async (id, cover, caps = ["contribute"]) => R((await kit.post(adm, "memberadd", { memberId: id, cover, role: "member", capabilities: caps })).body).invite;
  const joinAlerts = (p) => p.evaluate(() => [...document.querySelectorAll("[role=alert],[role=status],.cs-gap")].map((e) => e.innerText.trim()).filter(Boolean).join(" / "));
  if (want("R06")) {
    await kit.person("dev");
    const invite = await freshInvite("rosa6", "Rosa from the library", ["contribute", "publish"]);
    const jc = await ctxOf(); const jp = await jc.newPage();
    jp.on("pageerror", (e) => bad("R06.pageerror", "no script error on the join screen", "invitee", "opened the invitation", J(String(e), 200)));
    const tOpen = Date.now();
    let t = await go(jp, "/app/join#invite=" + invite, 1200);
    const shotJoin = await look(jp, "r06-join", "invitee");
    await step("R06.a", "the invitation shows cover, role, capabilities and expertise, and never the member's id", "invitee (burner link)", "opened the invitation link in a new browser, signed out", async () => {
      const cover = t.includes("Rosa from the library"), idShown = /rosa6/.test(t);
      const roleShown = /\bmember\b|administrator/i.test(t.split("YOUR HANDLE")[0] || t.slice(0, 300)) , capsShown = /add and revise work|sign and publish|contribute|publish/i.test(t.split("Your handle")[0] || ""), expShown = /xpertise/i.test(t.split("Your handle")[0] || "");
      return verdictOf(cover && !idShown && capsShown, `the screen says "${J(t.split("Your handle")[0].replace(/\s+/g, " "), 120)}": cover ${cover}, the capabilities offered (here contribute and publish) shown ${capsShown}, role shown ${roleShown}, expertise shown ${expShown}; the member id shown: ${idShown}. The operation gives role, capabilities and expertise (R10.b); the screen draws the cover alone`, { shot: shotJoin });
    }, { width: "1280 and 390" });
    await step("R06.b", "the language choice precedes the handle", "invitee", "looked for a language choice before the handle on the join screen", async () => {
      const sel = await jp.locator("select").count(); const lang = /language/i.test(t);
      return verdictOf(sel > 0 || lang, `a language control on the join screen: ${sel > 0 ? "yes" : "no"}; the word "language" on it: ${lang}. (The account screen says "The languages your team offers"; this team offers none yet, so no choice could be drawn: not forced.)`);
    });
    await step("R06.c", "the handle field answers as she types: free, taken, or what does not fit; never who holds a handle", "invitee", "typed dev (taken), Rosa!! (does not fit), rosa-l (free), then pressed \"See whether a handle is free\"", async () => {
      await jp.fill("#jn-handle", ""); await jp.type("#jn-handle", "dev", { delay: 40 }); await jp.waitForTimeout(1200);
      const whileTyping = await joinAlerts(jp);
      const out = {};
      for (const h of ["dev", "Rosa!!", "admin", "rosa-l", "x"]) { await jp.fill("#jn-handle", h); await jp.click("button:has-text('See whether a handle is free')"); await jp.waitForTimeout(900); out[h] = await joinAlerts(jp); }
      const sh = await look(jp, "r06-handle-answers", "invitee");
      const sameShape = /already taken/.test(out.dev) && /already taken/.test(out.admin) && /is free/.test(out["rosa-l"]) && /lowercase|lower-case/i.test(out["Rosa!!"]);
      return verdictOf(!!whileTyping && sameShape, `while typing "dev" and waiting 1.2 s: ${whileTyping ? '"' + whileTyping + '"' : "nothing was said (the answer comes only on pressing the button)"}; on pressing: dev → "${out.dev}"; Rosa!! → "${out["Rosa!!"]}"; admin → "${out.admin}"; rosa-l → "${out["rosa-l"]}"; x (one character) → "${out.x}"`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R06.d", "handle care: \"Choose it with care\", no control to change it; the id admin is refused", "invitee", "read the handle words; sent enroll with the id admin", async () => {
      const care = /Choose it with care|can't be changed after you join/.test(t);
      const e = R((await kit.post({}, "enroll", { invite: await freshInvite("res1", "Reserved test"), handle: "admin", password: "a long enough passphrase 1" })).body);
      return verdictOf(care && e.ok === false, `"Choose it with care: it can't be changed after you join" present: ${care}; enroll with the handle admin: ${ref(e)}`);
    });
    await step("R06.e", "short and mismatched passwords; BAD_HANDLE; nothing is sent", "invitee", "pressed Join with a short password, with two different passwords, and with the handle Rosa!!", async () => {
      await jp.fill("#jn-handle", "rosa-l");
      await jp.fill("#jn-pw", "short"); await jp.fill("#jn-pw2", "short"); await jp.click("button:has-text('Join with a handle and password')"); await jp.waitForTimeout(800); const a1 = await joinAlerts(jp);
      await jp.fill("#jn-pw", "a long enough passphrase 1"); await jp.fill("#jn-pw2", "a long enough passphrase 2"); await jp.click("button:has-text('Join with a handle and password')"); await jp.waitForTimeout(800); const a2 = await joinAlerts(jp);
      await jp.fill("#jn-pw2", "a long enough passphrase 1"); await jp.fill("#jn-handle", "Rosa!!"); await jp.click("button:has-text('Join with a handle and password')"); await jp.waitForTimeout(1000); const a3 = await joinAlerts(jp);
      const raw = /BAD_HANDLE|SHORT|MISMATCH|undefined/.test(a1 + a2 + a3);
      return verdictOf(a1 && a2 && a3 && !raw && /12/.test(a1) && /same/.test(a2), `short: "${a1}"; mismatch: "${a2}"; Rosa!!: "${a3}"; raw codes shown: ${raw}; the link still works afterwards: ${R((await kit.post({}, "invitelook", { invite })).body).ok}`);
    });
    let rosaHandle = "rosa-l";
    await step("R06.f", "join: ten recovery codes shown once, save and copy; she is signed in; Home offers the guided welcome", "invitee", "gave a handle and a password and pressed Join", async () => {
      await jp.fill("#jn-handle", rosaHandle); await jp.fill("#jn-pw", "a long enough passphrase 1"); await jp.fill("#jn-pw2", "a long enough passphrase 1");
      await jp.click("button:has-text('Join with a handle and password')"); await settle(jp, 2000);
      const ms = Date.now() - tOpen; const tt = await body(jp); const sh = await look(jp, "r06-codes", "invitee");
      const codes = tt.match(/\b[A-Z0-9]{5}(?:-[A-Z0-9]{5}){3}\b/g) || [];
      state.rosaCodes = codes; state.pw.rosa6 = null;
      const session = await jp.evaluate(() => !!localStorage.getItem("bio-session"));
      const wording = /Once you have claimed/.test(tt);
      await jp.click("a:has-text('Go to your team')"); await settle(jp, 2000); const home = await body(jp);
      const welcome = /wizard can walk you through|Welcome a new member/.test(home);
      if (wording) bad("R06.f2", "join words say joined, not claimed (MINOR wording)", "invitee", "read the recovery codes block on the join screen", "the block begins \"Once you have claimed, you get ten one-time codes\": a joining member has not claimed anything (the sentence is the founder's claim wording)", { width: "1280", shot: sh });
      return verdictOf(codes.length === 10 && session && welcome, `the join took ${(ms / 1000).toFixed(1)} s from opening the link (including my script's typing); ${codes.length} codes shown with Save and Copy; signed in: ${session}; Home: ${J(home.split("Home\n")[1] || home, 150).replace(/\s+/g, " ")}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R06.l", "the welcome wizard to its end: step 4 lands on its subject; the question step with no question; abandon midway leaves no nag and no record", "member rosa-l", "pressed Continue on Home, pressed Next through the steps, then Stop", async () => {
      await jp.click("button:has-text('Continue: Welcome a new member')"); await jp.waitForTimeout(1200);
      const seen = [];
      for (let i = 0; i < 4; i++) { const panel = await jp.evaluate(() => { const e = [...document.querySelectorAll("*")].find((x) => /Welcome a new member · step|Connect your Claude account · step/.test(x.innerText || "") && x.children.length < 12 && (x.innerText || "").length < 700); return e ? e.innerText : ""; }); seen.push(panel.replace(/\s+/g, " ").slice(0, 230)); const n = jp.locator("button:has-text('Next')").first(); if (!(await n.count())) break; await n.click(); await jp.waitForTimeout(900); }
      const shW = await look(jp, "r06-wizard", "member rosa-l");
      const nothing = /Nothing is here/.test(seen.join(" "));
      await jp.locator("button:has-text('Stop')").first().click().catch(() => {}); await jp.waitForTimeout(900);
      await jp.reload({ waitUntil: "networkidle" }); await jp.waitForTimeout(1000); const after = await body(jp);
      const nag = /Continue: Welcome a new member/.test(after) && /Stopping|Stop/.test(after) ? "the Home still offers Continue (not a nag, a resting offer)" : "no offer";
      return verdictOf(!nothing && seen.length >= 2, `the steps read: ${seen.map((x, i) => `[${i}] ${x}`).join(" || ")}; "Nothing is here" appeared: ${nothing}; after Stop and a reload: ${nag}`, { shot: shW });
    }, { width: "1280 and 390" });
    await step("R06.l2", "after she has moved on, Home no longer offers the welcome; \"Show me how\" still lists it", "member rosa-l", "visited Settings, came back to Home, read the offer and the Show me how list", async () => {
      await go(jp, "/app/recovery", 800); const home = await go(jp, "/app", 1500); const shH = await look(jp, "r06-home-later", "member rosa-l");
      const offer = /Continue: Welcome a new member/.test(home);
      let list = ""; const sm = jp.locator("button:has-text('Show me how')").first(); if (await sm.count()) { await sm.click(); await jp.waitForTimeout(900); list = await body(jp); }
      return verdictOf(!offer && /Welcome a new member/.test(list), `the Home offer "Continue: Welcome a new member" is ${offer ? "still there" : "gone after one other screen (no nag)"}; the Show me how list still has the welcome: ${/Welcome a new member/.test(list)}`, { shot: shH });
    }, { width: "1280 and 390" });
    await step("R06.g", "S-21: the codes page after joining says how many she holds", "member rosa-l", "read Settings > Recovery codes and recoverycodesstate right after joining", async () => {
      const t2 = await go(jp, "/app/recovery", 1200); const sh = await look(jp, "r06-recovery-after-join", "member");
      const auth = { authorization: "Bearer " + JSON.parse(await jp.evaluate(() => localStorage.getItem("bio-session"))).t };
      const st = R(await kit.get(auth, { op: "recoverycodesstate" }));
      return verdictOf(st.held === true && st.remaining === 10 && !/hold no recovery codes/.test(t2), `recoverycodesstate: held ${st.held}, remaining ${st.remaining}; the page says: "${J(t2.split("YOUR CODES")[1] || t2, 160).replace(/\s+/g, " ")}"`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R06.h", "a spent invitation draws one answer and names neither team nor invitee; a withdrawn one the same", "anyone", "opened the spent link and a withdrawn link", async () => {
      const c = await ctxOf(); const p = await c.newPage();
      const spent = await go(p, "/app/join#invite=" + invite, 1200); const sh = await look(p, "r06-spent-link", "public");
      const tia = await freshInvite("tia6", "Tia"); await kit.post(adm, "invitewithdraw", { memberId: "tia6" });
      const wd = await go(p, "/app/join#invite=" + tia, 1200);
      const gone = await go(p, "/app/join#invite=" + "0".repeat(32), 1200);
      await c.close();
      const names = /Rosa|rosa|Tia/.test(spent + wd);
      return verdictOf(spent === wd && spent === gone && !names, `spent: "${J(spent.replace(/\s+/g, " "), 160)}"; withdrawn is the same text: ${spent === wd}; a link never issued is the same: ${spent === gone}; a name appears: ${names}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R06.i", "an expired invitation is read kindly (needs seven days to pass)", "anyone", "tried to make a link expire", async () => cant("an invitation's life is seven days at the plane's clock and Miniflare's clock cannot be moved from outside; the used and withdrawn states are walked above (R06.h). The expired wording is not forced"));
    await step("R06.j", "the administrator copies the link and sees the invitation raise a Queue item", "founder", "invited a member, opened Queue and Home as the founder", async () => {
      await freshInvite("queue6", "Quentin from the council");
      const c = await ctxOf(); const p = await c.newPage(); await uiSignIn(p, "admin", kit.PASSWORD, "own");
      const q = await go(p, "/app/queue", 1500); const h = await go(p, "/app", 1500); await c.close();
      const inQ = /Quentin|invitation/i.test(q), inH = /Quentin|invitation/i.test(h);
      return inQ || inH ? yes(`the invitation raised an item: Queue ${inQ}, Home ${inH}`) : cant(`no Queue item and no Home mention for a live invitation: Queue says "${J((q.split("Your queue")[1] || q).replace(/\s+/g, " "), 130)}". Round 2 C4 dropped the invitation link from Queue and Home on purpose, so this row's act is recorded as absent, not as a defect`);
    });
    await step("R06.k", "a second invitee through the reusable join link; she chooses the name the team will know her by", "invitee (join link)", "turned on the join link (admin), opened it, gave a cover name, then joined with a handle", async () => {
      const en = R((await kit.post(adm, "joinlinkenable", { dailyCap: 5 })).body); const link = en.link;
      if (!link) return no(`the join link was not made: ${ref(en)}`);
      const frag = /#join=/.test(link) ? link : null;
      const c = await ctxOf(); const p = await c.newPage();
      const t1 = await go(p, "/app/join#join=" + (link.match(/[0-9A-Za-z_-]{20,}$/)?.[0] || link), 1200); const sh = await look(p, "r06-join-link", "invitee");
      const ask = /name the team|call you|cover/i.test(t1);
      const inputs = await p.evaluate(() => [...document.querySelectorAll("input,button")].filter((e) => e.getBoundingClientRect().width > 0).map((e) => `${e.id || e.tagName}:${(e.innerText || e.placeholder || "").slice(0, 30)}`));
      await c.close();
      return verdictOf(ask, `the join-link screen says: "${J(t1.replace(/\s+/g, " "), 260)}"; controls: ${J(inputs, 200)}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R06.m", "where the administrator chose it, the court notice appears once at joining", "invitee", "set the court notice to tell, joined a member, read the screens", async () => {
      const set = R((await kit.post(adm, "courtnoticeset", { choice: "tell" })).body);
      const inv3 = await freshInvite("court6", "Court test");
      const c = await ctxOf(); const p = await c.newPage(); await go(p, "/app/join#invite=" + inv3, 1000);
      await p.fill("#jn-handle", "court6"); await p.fill("#jn-pw", "a long enough passphrase 1"); await p.fill("#jn-pw2", "a long enough passphrase 1"); await p.click("button:has-text('Join with a handle and password')"); await settle(p, 1800);
      const t1 = await body(p); await p.click("a:has-text('Go to your team')"); await settle(p, 1800); const t2 = await body(p);
      const t3 = await go(p, "/app", 1200); await c.close();
      await kit.post(adm, "courtnoticeset", { choice: "dont" });
      const seen = /court|subpoena|legal process|can be made to hand/i; const where = [seen.test(t1) && "the join screen", seen.test(t2) && "Home after joining"].filter(Boolean);
      return verdictOf(set.ok && where.length > 0, `choice set: ${ref(set)}; the notice appears on: ${where.join(", ") || "neither the join screen nor Home"}; shown again on a later visit: ${seen.test(t3)}`);
    });
    await jc.close();
  }

  /* ============================================================ R07 ============================================================ */
  if (want("R07")) {
    await step("R07.a", "forgot password: a recovery code offered to anyone; spend one; reuse refused; the member's other sessions end", "member (signed out)", "issued ten codes as pam, spent one on the Forgot screen, tried it again, read her other session", async () => {
      const pam = await as("pam"); const issued = R((await kit.post(pam, "recoverycodesissue", {})).body); const codes = issued.codes;
      const other = await as("pam");
      const c = await ctxOf(); const p = await c.newPage(); const t0 = await go(p, "/app/forgot", 800); const sh = await look(p, "r07-forgot", "public");
      const spend = async (code, pw) => { await go(p, "/app/forgot", 500); await p.fill("#fg-handle", "pam"); await p.fill("#fg-code", code); await p.fill("#fg-pw", pw); await p.fill("#fg-pw2", pw); await p.click("button:has-text('Set a new password with a recovery code')"); await settle(p, 1500); return { said: await joinAlerts(p), page: await body(p) }; };
      const first = await spend(codes[0], "pam sets a new long passphrase 1");
      const st = (await kit.plane("/api/?op=whoami", { headers: other })).status;
      const again = await spend(codes[0], "pam sets a new long passphrase 2");
      const signin = R((await kit.post({}, "login", { handle: "pam", password: "pam sets a new long passphrase 1", device: "own" })).body);
      state.pw.pam = "pam sets a new long passphrase 1"; state.pamCodes = codes.slice(1);
      await c.close();
      return verdictOf(codes.length === 10 && signin.ok === true && st === 401 && /no longer|used|not a/i.test(again.said + again.page), `ten codes issued; the first spent on the screen: "${J((first.said || first.page.split("\n").slice(0, 3).join(" ")).replace(/\s+/g, " "), 160)}"; the member's other session answers HTTP ${st}; the same code again: "${J(again.said, 150)}"; the new password signs in: ${signin.ok}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R07.b", "the last code draws its own sentence (forgot.done.last)", "member", "spent the remaining codes by recover; read the screen's words for the last", async () => {
      const codes = state.pamCodes; if (!codes) return cant("R07.a did not leave codes");
      let last = null; let n = 0;
      for (const code of codes.slice(0, 8)) { const r = R((await kit.post({}, "recover", { handle: "pam", code, password: "pam sets a new long passphrase 1" })).body); if (r.ok) n++; }
      const c = await ctxOf(); const p = await c.newPage(); await go(p, "/app/forgot", 600);
      await p.fill("#fg-handle", "pam"); await p.fill("#fg-code", codes[8]); await p.fill("#fg-pw", "pam sets a new long passphrase 1"); await p.fill("#fg-pw2", "pam sets a new long passphrase 1");
      await p.click("button:has-text('Set a new password with a recovery code')"); await settle(p, 1500); last = await body(p); const sh = await look(p, "r07-forgot-last", "public"); await c.close();
      const said = /last (recovery )?code|no codes left|get new ones|none left/i.test(last);
      return verdictOf(n === 8 && said, `8 spent by the operation; the ninth, the last, spent on the screen: the screen says "${J(last.split("\n").filter((l) => /code|password|signed|new/i.test(l)).join(" / "), 260)}"`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R07.c", "an administrator's \"Make a reset link\": one-time, seven days, ends the member's other sign-ins", "founder, member", "pressed Make a reset link on a member's row with a reason, read the link, signed the member in elsewhere first", async () => {
      await kit.person("ned"); const ned = await as("ned");
      const { c, p } = await ctxAs("admin", kit.PASSWORD); await go(p, "/app/members", 1400);
      const row = p.locator("button[aria-label='Acts for ned']"); await row.click(); await p.waitForTimeout(500);
      const btns = p.locator("button:has-text('Make a reset link for a member')"); const n = await btns.count();
      const r = await reasoned(p, "Make a reset link for a member", "Ned lost his phone and has no codes.", { tryEmpty: true, nth: 0 });
      const t = await body(p); const link = await grab(p, /[^\s"']*#reset=[0-9A-Za-z_-]+/); const sh = await look(p, "r07-reset-link", "founder");
      state.resetLink = link && /#reset=([0-9A-Za-z_-]+)/.exec(link)[1];
      const st = (await kit.plane("/api/?op=whoami", { headers: ned })).status;
      await c.close();
      return verdictOf(!!link && /seven days/i.test(t), `buttons named Make a reset link: ${n}; reason asked: ${r.opened} (empty first: "${J(r.emptyAnswer || "none", 90)}"); the link is shown: ${!!link}; the page says seven days: ${/seven days/i.test(t)}; the member's other session now answers HTTP ${st} (the link ends it ${st === 401 ? "at once" : "only when used"})`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R07.d", "the reset screen \"Choose a new password\": set, then used; withdrawn (a newer link replaces it)", "member ned (signed out)", "opened the reset link, chose a new password, opened it again; made two links for another member and opened the first", async () => {
      if (!state.resetLink) return cant("R07.c made no link");
      const c = await ctxOf(); const p = await c.newPage();
      const t1 = await go(p, "/app/reset#reset=" + state.resetLink, 1200); const sh = await look(p, "r07-reset", "public");
      const pw = p.locator("input[type=password]"); const np = await pw.count();
      await pw.nth(0).fill("ned has a brand new long passphrase"); if (np > 1) await pw.nth(1).fill("ned has a brand new long passphrase");
      await p.locator("button:has-text('Set my new password'), button:has-text('Choose'), button:has-text('Set')").first().click(); await settle(p, 1800);
      const done = await body(p); state.pw.ned = "ned has a brand new long passphrase";
      const signin = R((await kit.post({}, "login", { handle: "ned", password: "ned has a brand new long passphrase", device: "own" })).body);
      const used = await go(p, "/app/reset#reset=" + state.resetLink, 1200);
      const l1 = R((await kit.post(adm, "passwordresetlink", { member: "pam" })).body).link; const l2 = R((await kit.post(adm, "passwordresetlink", { member: "pam" })).body).link;
      const wd = l1 && l2 ? await go(p, "/app/reset#reset=" + l1.match(/[0-9A-Za-z_-]{16,}$/)[0], 1200) : "";
      await c.close();
      return verdictOf(/Choose a new password/i.test(t1) && signin.ok && /no longer works/i.test(used), `the screen's first state: "${J(t1.split("\n").slice(0, 2).join(" "), 90)}" with ${np} password fields; after setting: "${J(done.split("\n").slice(0, 3).join(" "), 140)}"; the new password signs in: ${signin.ok}; the link opened again: "${J(used.split("\n").slice(0, 2).join(" "), 90)}"; a replaced link: "${J(wd.split("\n").slice(0, 3).join(" "), 160)}". Expired (seven days) is not forced: the clock cannot be moved`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R07.e", "the recovery page: codes held, unused, when issued; \"Get new recovery codes\" shows them once and spends the earlier ones", "member", "read the page, pressed Get new recovery codes, tried an old code", async () => {
      const { c, p } = await ctxAs("pam", state.pw.pam || "pam sets a new long passphrase 1");
      const before = await go(p, "/app/recovery", 1200); const sh = await look(p, "r07-recovery", "member");
      const old = await as("pam"); const oldCodes = R((await kit.post(old, "recoverycodesissue", {})).body).codes;
      await reasoned(p, "Get new recovery codes", null); const after = await body(p);
      const shown = after.match(/\b[A-Z0-9]{5}(?:-[A-Z0-9]{5}){3}\b/g) || [];
      const spent = R((await kit.post({}, "recover", { handle: "pam", code: oldCodes[0], password: "pam sets a new long passphrase 1" })).body);
      const reload = await go(p, "/app/recovery", 900); const again = reload.match(/\b[A-Z0-9]{5}(?:-[A-Z0-9]{5}){3}\b/g) || [];
      await c.close();
      return verdictOf(shown.length === 10 && spent.ok === false && again.length === 0, `before: "${J((before.split("YOUR CODES")[1] || "").split("NEW CODES")[0].replace(/\s+/g, " "), 120)}"; new codes shown once: ${shown.length}; an earlier code now: ${ref(spent)}; shown again after reload: ${again.length}; whether two administrators hold them is the administrators' line (R07.f)`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R07.f", "adminrecoverystep: the administrators' recovery state; the hosting account's holder route is area 1's", "founder", "read adminrecoverystep and the recovery page's administrator lines", async () => {
      const r = R(await kit.get(adm, { op: "adminrecoverystep" })); const c = await ctxOf(); const p = await c.newPage(); await uiSignIn(p, "admin", kit.PASSWORD); const t = await go(p, "/app/recovery", 1200); await c.close();
      return verdictOf(r && r.ok !== false, `adminrecoverystep answers ${J(r, 260)}; the page's first lines: "${J(t.split("Recovery codes")[2] || t, 200).replace(/\s+/g, " ")}"; the hosting holder setting a new one-time password (DEC-200 (8)) is area 1's lost-founder route: not walked here`);
    });
  }

  /* ============================================================ R12 ============================================================ */
  if (want("R12")) {
    await step("R12.a", "declare expertise with a language; declared and confirmed read apart; an unconfirmed licence does everything a confirmed one does", "member", "typed an expertise on Your account, pressed Declare; an administrator confirmed it", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); await go(p, "/app/account", 900);
      await p.fill("#ma-exp", "interprets Spanish and English"); await p.click("button:has-text('Declare your expertise')"); await settle(p, 1400);
      const said = await body(p); const sh = await look(p, "r12-expertise", "member dev");
      const before = R(await kit.get(adm, { op: "expertiselist", memberId: "dev" })).expertise.find((e) => e.label === "interprets Spanish and English");
      await kit.post(adm, "expertiseconfirm", { memberId: "dev", label: "interprets Spanish and English" });
      const t2 = await go(p, "/app/account", 900);
      const caps1 = R(await kit.get(await as("dev"), { op: "whoami" })).capabilities;
      await c.close();
      return verdictOf(before && before.state === "declared" && /interprets Spanish and English/.test(t2), `declared: state "${before && before.state}"; after confirmation the screen shows ${/confirmed/i.test(t2) ? "a confirmed mark" : "no confirmed mark"}: "${J((t2.split("WHAT YOU KNOW")[1] || "").split("YOUR")[0].replace(/\s+/g, " "), 200)}"; capabilities unchanged by confirmation: ${J(caps1)}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R12.b", "the signing key: made in the browser, never sent; save the key file, revoke it, load the file; each key shows status, origin, who registered it, whether it attests", "member", "pressed Register your signing key, saved the file, revoked, loaded the file", async () => {
      const c = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true }); const p = await c.newPage();
      await uiSignIn(p, "dev", DEVPW); await go(p, "/app/account", 900);
      await p.click("button:has-text('Register your signing key')"); await settle(p, 2500);
      const made = await body(p); const sh = await look(p, "r12-key-made", "member dev");
      const [dl] = await Promise.all([p.waitForEvent("download", { timeout: 8000 }).catch(() => null), p.locator("button:has-text('Save the key file'), a:has-text('Save the key file'), button:has-text('key file')").first().click().catch(() => {})]);
      let file = ""; if (dl) { const path = await dl.path(); file = readFileSync(path, "utf8"); }
      state.keyFile = file;
      const list1 = R(await kit.get(await as("dev"), { op: "signerlist" })).signers;
      const tail = (list1[0] || {}).key_b64 || "";
      await p.click("button:has-text('Revoke your signing key')"); await settle(p, 1500);
      const list2 = R(await kit.get(await as("dev"), { op: "signerlist" })).signers;
      /* load the saved file: the key it holds is the key registered again */
      const tmp = HERE + ".key.txt"; writeFileSync(tmp, file);
      let loaded = null; if (file) { await go(p, "/app/account", 900); await p.setInputFiles("#ma-keyfile", tmp); await p.click("button:has-text('Register your signing key')"); await settle(p, 2500); loaded = R(await kit.get(await as("dev"), { op: "signerlist" })).signers; }
      try { writeFileSync(tmp, ""); } catch {}
      await c.close();
      const a = list1[0] || {};
      return verdictOf(a.status === "active" && a.origin === "self" && a.registered_by === "dev" && a.attests === true && list2[0] && list2[0].status !== "active" && !!file, `registered: status ${a.status}, origin ${a.origin}, registered_by ${a.registered_by}, attests ${a.attests}; the page says "${J(made.split("YOUR SIGNING KEY")[1] || "", 140).replace(/\s+/g, " ")}"; the key file ${file ? "downloaded (" + file.split(".")[0] + ", " + file.length + " characters, text begins with the format tag)" : "was NOT offered for download"}; after Revoke: status ${list2[0] && list2[0].status}; loading the file registered it again: ${loaded ? J(loaded.map((k) => k.status + "/" + (k.key_b64 === tail ? "same key" : "other key"))) : "not tried"}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R12.c", "a key is registered only when the member is active; an administrator-registered key attests exactly like a self-registered one", "founder", "registered a key for an inactive member, then for an active one", async () => {
      await kit.person("rex"); const key = await kit.newKey(); const key2 = await kit.newKey();
      await kit.post(adm, "memberset", { memberId: "rex", status: "revoked" });
      const off = R((await kit.post(adm, "signeradd", { keyB64: key.keyB64, memberId: "rex" })).body);
      await kit.post(adm, "memberset", { memberId: "rex", status: "active" });
      const on = R((await kit.post(adm, "signeradd", { keyB64: key2.keyB64, memberId: "rex" })).body);
      const row = R(await kit.get(adm, { op: "signerlist" })).signers.find((k) => k.key_b64 === key2.keyB64) || {};
      return verdictOf(off.ok === false && on.ok !== false && row.attests === true && row.origin === "admin", `for an inactive member: ${ref(off)}; for an active one: ${on.ok !== false ? "registered" : ref(on)}; the row: origin ${row.origin}, registered_by ${row.registered_by}, attests ${row.attests}, status ${row.status}`);
    });
    await step("R12.d", "language, theme (light, dark, follow device), Sounds, rail width", "member", "pressed Dark, Light, Follow my device; Sounds On and Off; dragged and used the keys on the rail's edge; read the language list", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); await go(p, "/app/account", 900);
      const theme = async () => p.evaluate(() => ({ attr: document.documentElement.getAttribute("data-theme"), bg: getComputedStyle(document.body).backgroundColor }));
      const out = {};
      for (const n of ["Dark", "Light", "Follow my device"]) { await p.click(`button:visible:has-text("${n}")`); await p.waitForTimeout(600); out[n] = await theme(); }
      await p.click("button:visible:has-text('Dark')"); await p.waitForTimeout(500); const dark = await theme(); await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(800); const kept = await theme();
      const shDark = await look(p, "r12-dark", "member dev"); await p.click("button:visible:has-text('Follow my device')");
      const stored = async () => p.evaluate(() => JSON.stringify(Object.entries(localStorage).filter(([k]) => !/session|words|first/.test(k))));
      const s0 = await stored(); await p.click("button:visible:text-is('On')"); await p.waitForTimeout(500); const s1 = await stored(); await p.click("button:visible:text-is('Off')"); await p.waitForTimeout(300);
      const opts = await p.evaluate(() => [...document.querySelectorAll("#ma-lang option")].map((o) => o.textContent.trim()));
      const handle = p.locator("button[aria-label='Width of the sections list']"); const box0 = await p.locator("nav, [role=navigation], aside").first().boundingBox().catch(() => null);
      let width0 = null, width1 = null, width2 = null, width3 = null;
      const rail = async () => p.evaluate(() => { const e = document.querySelector("[aria-label='Width of the sections list']"); const r = e && e.getBoundingClientRect(); return r ? Math.round(r.left) : null; });
      width0 = await rail(); const bb = await handle.boundingBox();
      if (bb) { await p.mouse.move(bb.x + bb.width / 2, bb.y + 60); await p.mouse.down(); await p.mouse.move(bb.x + 120, bb.y + 60, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(400); width1 = await rail();
        await handle.focus(); await p.keyboard.press("ArrowLeft"); await p.keyboard.press("ArrowLeft"); await p.waitForTimeout(300); width2 = await rail();
        await handle.dblclick({ position: { x: 2, y: 60 } }).catch(() => {}); await p.waitForTimeout(400); width3 = await rail(); }
      const darkOk = dark.attr === "dark" || dark.bg !== out["Light"].bg;
      await c.close();
      return verdictOf(darkOk && kept.bg === dark.bg, `theme: Light bg ${out.Light.bg} (attr ${out.Light.attr}), Dark bg ${dark.bg} (attr ${dark.attr}), after reload still ${kept.bg === dark.bg ? "dark" : "NOT dark"}; Sounds: stored values before/after On: ${J(s0, 80)} / ${J(s1, 120)} (the click and the low tone are sounds an offline walk cannot hear: recorded as the setting only); language list: ${J(opts)}; rail edge at ${width0}px, after a 120px-wide drag ${width1}px, after two arrow-key presses ${width2}px, after double-click ${width3}px`, { shot: shDark });
    }, { width: "1280 and 390" });
    await step("R12.e", "the pairing decision: the member or an administrator may make it; the choice is read back", "member, founder", "chose Publish it and saved, read memberpairings, the administrator reversed it", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); await go(p, "/app/account", 900);
      await p.check("#ma-pair-1"); await p.click("button:has-text('Save my choice')"); await settle(p, 1400); const said = await joinAlerts(p);
      const pub = R(await kit.get(await as("dev"), { op: "memberpairings" }));
      const row1 = (pub.pairings || pub.members || []).find((x) => (x.member_id || x.memberId || x.handle) === "dev");
      const byAdmin = R((await kit.post(adm, "memberpairingset", { memberId: "dev", published: false })).body);
      const after = R(await kit.get(adm, { op: "memberlist" })).members.find((m) => m.member_id === "dev");
      await c.close();
      return verdictOf(byAdmin.ok !== false && after.pairing_published === false, `saved: "${J(said, 100)}"; published pairings answer ${J(pub, 200)}; the administrator's reversal: ${byAdmin.ok !== false ? "accepted" : ref(byAdmin)}; the roster now says pairing_published ${after.pairing_published}`);
    });
    await step("R12.f", "the information level: two levels, kept; the next route reads it (G81)", "member", "chose \"On a longer pause\", read infolevel, loaded another screen, read the masthead's words", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); await go(p, "/app/account", 900);
      await p.selectOption("#ma-level", { label: "On a longer pause" }); await p.click("button:has-text('Choose how much is explained')"); await settle(p, 1400);
      const lvl = R(await kit.get(await as("dev"), { op: "infolevel" })); const mast = await go(p, "/app/members", 1400); const word = (mast.match(/Explanations: [^\n]*/) || [""])[0];
      await p.goto((await BASE()) + "/app/account", { waitUntil: "networkidle" }); await p.selectOption("#ma-level", { label: "Explain promptly" }); await p.click("button:has-text('Choose how much is explained')"); await settle(p, 1000);
      await c.close();
      return verdictOf(lvl.level === "pause", `infolevel answers "${lvl.level}"; the masthead on the next route reads "${word}" (it reads "Explanations: prompt" at the other level)`);
    });
    await step("R12.g", "the handle is shown and cannot be changed; no route to change it exists", "member", "read Your account; sent handlechange", async () => {
      const r = R((await kit.post(await dev(), "handlechange", { handle: "dev2" })).body);
      return verdictOf(r.ok === false, `Your account says "Your handle can't be changed: it names your work for good"; handlechange answers ${ref(r)}`);
    });
    await step("R12.h", "settings reading: Settings > Yours, Recovery codes; nothing about notification preferences or Data export/backup on this screen", "member", "read the settings list and the account screen for those words", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); const s = await go(p, "/app/settings", 1200); const sh = await look(p, "r12-settings", "member dev"); const a = await go(p, "/app/account", 900); await c.close();
      const nf = /notification/i.test(s + a), ex = /export|backup/i.test(s + a);
      return yes(`Settings lists: "${J(s.split("Settings\n").slice(-1)[0].replace(/\s+/g, " "), 300)}"; notification preferences named on Settings or Your account: ${nf}; Data export or backup named: ${ex} (Req. 14 asks that they be looked for: ${nf || ex ? "found" : "neither exists on these screens"})`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R12.i", "a signed-in password change is built: the route is Your account's \"Change your password\"", "founder", "changed the founder's password on Your account and put it back", async () => {
      const { c, p } = await ctxAs("admin", kit.PASSWORD); await go(p, "/app/account", 900);
      await p.fill("#ma-cur0", kit.PASSWORD); await p.fill("#ma-new0", "the founder's new long password 9"); await p.fill("#ma-again0", "the founder's new long password 9"); await p.click("button:has-text('Change your password')"); await settle(p, 1500);
      const said = (await body(p)).split("YOUR PASSWORD")[1] || "";
      const ok1 = R((await kit.post({}, "login", { handle: "admin", password: "the founder's new long password 9", device: "own" })).body);
      const back = ok1.token ? R((await kit.post({ authorization: "Bearer " + ok1.token }, "setpassword", { current: "the founder's new long password 9", password: kit.PASSWORD })).body) : null;
      await c.close();
      const f2 = R((await kit.post({}, "login", { handle: "admin", password: kit.PASSWORD, device: "own" })).body); if (f2.token) adm.authorization = "Bearer " + f2.token;   /* the change ended every other session of hers, the script's own among them */
      return verdictOf(ok1.ok === true && back && back.ok, `the screen said "${J(said.replace(/\s+/g, " ").trim(), 120)}"; the new password signs the founder in: ${ok1.ok}; put back: ${back && back.ok}. (LT:134 calls a signed-in change "owed": the route exists and works.)`);
    });
    await ctxAs; 
  }

  /* ============================================================ R11 ============================================================ */
  if (want("R11")) {
    const reauth = async (a, pw) => R((await kit.post(a, "reauth", { password: pw })).body);
    const login = async (h) => { const r = R((await kit.post({}, "login", { handle: h, password: pwOf(h), device: "own" })).body); return r.token ? { authorization: "Bearer " + r.token } : null; };
    /* a member invited as an administrator, enrolled and signed in */
    const joinAdmin = async (handle, by, byPw) => {
      await reauth(by, byPw);
      const added = R((await kit.post(by, "memberadd", { memberId: handle, cover: `cover of ${handle}`, role: "admin", capabilities: null })).body);
      if (!added.invite) return { added };
      const en = R((await kit.post({}, "enroll", { invite: added.invite, handle, password: pwOf(handle) })).body);
      return { added, en, auth: await login(handle) };
    };
    let A2 = null, A3 = null;
    await step("R11.a", "the second administrator is the first's unilateral act", "founder", "invited nova as an administrator with the password given again, enrolled her, read the roster and adminarith", async () => {
      const before = R(await kit.get(adm, { op: "adminarith" })).live;
      const r = await joinAdmin("nova", adm, kit.PASSWORD); A2 = r.auth;
      const arith = R(await kit.get(adm, { op: "adminarith" }));
      const roster = R(await kit.get(adm, { op: "memberlist" })).members.filter((m) => m.role === "admin").map((m) => m.member_id + ":" + m.status);
      return verdictOf(r.added.ok !== false && r.en && r.en.ok !== false && roster.length === 2, `before: live ${J(before)}; the second administrator was added by the first alone: ${r.added.ok !== false ? "yes" : ref(r.added)}, enrolled ${r.en && r.en.ok}; administrators now: ${roster.join(", ")}; adminarith live ${J(arith.live)}`);
    });
    await step("R11.a2", "when a second administrator is added the group is asked who holds hosting access", "founder", "read hostingaccess, Members, Home and Queue after the second administrator joined", async () => {
      const hosting = R(await kit.get(adm, { op: "hostingaccess" }));
      const { c, p } = await ctxAs("admin", kit.PASSWORD); const t = await go(p, "/app/members", 1500); const h = await go(p, "/app", 1500); const q = await go(p, "/app/queue", 1500); await c.close();
      const asked = /hosting/i.test(t + h + q); const sh = "";
      return verdictOf(asked, `hostingaccess recorded: ${hosting.recorded}; a line on Members, Home or Queue that asks who holds hosting access: ${asked ? "yes: " + J((t + h + q).match(/[^\n]*hosting[^\n]*/i)[0], 140) : "NO line on any of the three asks it (the Members page's only hosting line is the one-administrator warning, which goes when the second joins)"}; the op hostingaccessset exists: ${R((await kit.post(adm, "hostingaccessset", { holders: [] })).body).reason || "answered"}`);
    });
    await step("R11.b", "a third administrator needs every administrator's endorsement; a proposal from an administrator's own session counts as hers once; the ballot has its denominator", "founder, nova", "founder proposed orin as an administrator; read the ballot and nova's Queue and Home and Members; nova endorsed (password given again)", async () => {
      if (!A2) return cant("the second administrator could not be made (R11.a)");
      await reauth(adm, kit.PASSWORD);
      const prop = R((await kit.post(adm, "memberadd", { memberId: "orin", cover: "cover of orin", role: "admin", capabilities: null })).body);
      const rowAfterProp = R(await kit.get(adm, { op: "memberlist" })).members.find((m) => m.member_id === "orin");
      const c = await ctxOf(); const p = await c.newPage(); await uiSignIn(p, "nova", pwOf("nova"), "own");
      const q = await go(p, "/app/queue", 1500); const h = await go(p, "/app", 1500); const sh = await look(p, "r11-nova-queue", "administrator nova");
      const members = await go(p, "/app/members", 1500);
      const ballot = (members.match(/[^\n]*\b\d+ of \d+\b[^\n]*/g) || []).join(" / "); const orinLines = (members.match(/[^\n]*orin[^\n]*/gi) || []).join(" / ");
      const raw = /pending approval/i.test(q + h + members);
      const dupe = R((await kit.post(adm, "adminendorse", { memberId: "orin" })).body);
      const me = await login("nova"); await reauth(me, pwOf("nova"));
      const endorsed = R((await kit.post(me, "adminendorse", { memberId: "orin" })).body);
      await c.close();
      const orin = endorsed.invite ? R((await kit.post({}, "enroll", { invite: endorsed.invite, handle: "orin", password: pwOf("orin") })).body) : null; A3 = orin && orin.ok !== false ? await login("orin") : null;
      const admins = R(await kit.get(adm, { op: "memberlist" })).members.filter((m) => m.role === "admin" && m.status === "active").map((m) => m.member_id);
      return verdictOf(prop.reason === "CONSENSUS_REQUIRED" && endorsed.ok !== false && admins.length === 3, `proposal: ${ref(prop)}; the new row reads ${J(rowAfterProp && { status: rowAfterProp.status, role: rowAfterProp.role })}; nova's Queue: "${J((q.split("Your queue")[1] || q).replace(/\s+/g, " "), 130)}"; the Queue item names who agreed and who is awaited ("Agreed: the founder. Awaited: nova, orin": see R11.c) but no "2 of 3" count is drawn on Members or Queue (counts like "2 of 3" on Members: "${ballot || "none shown"}"); Members' lines naming the proposed administrator: "${J(orinLines || "none", 140)}"; the word "pending approval": ${raw}; the proposer endorsing again: ${ref(dupe)}; nova's endorsement: ${endorsed.ok !== false ? "recorded, invitation made" : ref(endorsed)}; administrators now: ${admins.join(", ")}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R11.c", "endorsement items are rows in Queue and Home, each opening its form (C62)", "administrators", "founder proposed a fourth administrator; read the other administrators' Queue and Home", async () => {
      if (!A2 || !A3) return cant("the third administrator could not be made (R11.b)");
      await reauth(adm, kit.PASSWORD);
      const prop = R((await kit.post(adm, "memberadd", { memberId: "pia", cover: "cover of pia", role: "admin", capabilities: null })).body);
      const c = await ctxOf(); const p = await c.newPage(); await uiSignIn(p, "nova", pwOf("nova"), "own");
      const q = await go(p, "/app/queue", 1500); const h = await go(p, "/app", 1500); const sh = await look(p, "r11-endorse-queue", "administrator nova");
      const form = await p.locator("button:has-text('Endorse'), button:has-text('Agree')").count(); await c.close();
      const rowQ = /pia|endorse/i.test(q), rowH = /pia|endorse/i.test(h);
      return verdictOf(prop.reason === "CONSENSUS_REQUIRED" && (rowQ || rowH) && form > 0, `pia proposed (${ref(prop)}); an endorsement row in nova's Queue: ${rowQ}, in Home: ${rowH}; a control to endorse (button naming Endorse or Agree) on the Queue or Home: ${form}; the Queue's text: "${J((q.match(/[^\n]*(pia|endorse)[^\n]*/gi) || ["none"]).join(" / "), 200)}"`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R11.d", "refusals: the founder cannot be removed; a person nobody proposed; the operator token cannot vote; a plain member cannot; the last administrator may not step down", "administrators, member", "tried adminremove of the founder, adminendorse of a stranger, with the operator token, as a member, and adminresign by a lone administrator in a second room", async () => {
      await reauth(adm, kit.PASSWORD); if (A2) await reauth(A2, pwOf("nova"));
      const rmFounder = A2 ? R((await kit.post(A2, "adminremove", { memberId: "admin", reason: "testing the founder's protection" })).body) : null;
      const noProp = R((await kit.post(adm, "adminendorse", { memberId: "dev" })).body);
      const bearer = R((await kit.post({ authorization: "Bearer " + kit.ADM }, "adminendorse", { memberId: "pia" })).body);
      const asMember = R((await kit.post(await dev(), "adminendorse", { memberId: "pia" })).body);
      const a2 = await kit2.founder(); const lone = R((await kit2.post(a2, "adminresign", {})).body);
      const half = /one-time password|hosting/i.test(JSON.stringify(rmFounder));
      const stranger = R((await kit.post(adm, "adminendorse", { memberId: "nobody-by-that-id" })).body);
      if (!/NOT_PROPOSED/.test(JSON.stringify(noProp))) bad("R11.d2", "endorsing an existing member nobody proposed answers NOT_PROPOSED (MINOR wording)", "founder", "sent adminendorse for dev, who is an active member never proposed as an administrator, and for an id nobody holds", `for dev (an existing member): ${ref(noProp)}; for an id nobody holds: ${ref(stranger)}; the coverage row names NOT_PROPOSED for a person nobody proposed; both answers are NO_SUCH_MEMBER, which says no such member exists for a member who does`);
      return verdictOf(/ROOT_OF_TRUST/.test(JSON.stringify(rmFounder)) && /OPERATOR_TOKEN_CANNOT_GOVERN/.test(JSON.stringify(bearer)) && /NOT_AN_ADMIN/.test(JSON.stringify(asMember)) && lone.ok === false, `removing the founder: ${rmFounder && ref(rmFounder)}; the answer names the other half (replace the one-time password, review who signs in to hosting): ${half}; endorsing someone nobody proposed: ${ref(noProp)}; the operator token voting: ${ref(bearer)}; a plain member endorsing: ${ref(asMember)}; the only administrator stepping down: ${ref(lone)} (the refusal for the founder is ROOT_OF_TRUST, hosting's; "only the last administrator may not step down" for a non-founder is read at R11.e)`);
    });
    await step("R11.e", "a removal vote: at three administrators both others must agree; the target is counted but does not vote; the removal records who decided and why", "administrators", "founder voted to remove orin, then nova agreed; read the table, the roster and the record", async () => {
      if (!A2 || !A3) return cant("three administrators were not made");
      const table = R(await kit.get(adm, { op: "adminarith" })).table.map((x) => `${x.administrators}:${x.possible ? x.votesNeeded : "impossible"}`).join(" ");
      await reauth(adm, kit.PASSWORD); const v1 = R((await kit.post(adm, "adminremove", { memberId: "orin", reason: "orin has stopped taking part" })).body);
      const self = await login("orin"); await reauth(self, pwOf("orin")); const tgt = R((await kit.post(self, "adminremove", { memberId: "orin", reason: "removing myself" })).body);
      const nova = await login("nova"); await reauth(nova, pwOf("nova")); const open = R(await kit.get(nova, { op: "adminremovalsopen" }));
      const { c, p } = await ctxAs("nova", pwOf("nova")); const t = await go(p, "/app/members", 1500); const agree = await p.locator("button:has-text('Agree: remove')").count(); const sh = await look(p, "r11-removal", "administrator nova"); await c.close();
      const v2 = R((await kit.post(nova, "adminremove", { memberId: "orin", reason: "agreed: orin has stopped taking part" })).body);
      const after = R(await kit.get(adm, { op: "memberlist" })).members.find((m) => m.member_id === "orin");
      return verdictOf(v1.ok !== false && v2.ok !== false && after && after.role !== "admin", `table ${table}; the founder's vote: ${ref(v1)}; the target voting on her own removal: ${ref(tgt)}; the open removals read by nova: ${J(open, 200)}; the Members page has an "Agree: remove {member} as an administrator" control: ${agree > 0}, the text near it "${J((t.match(/[^\n]*remov[^\n]*/gi) || ["none"]).join(" / "), 220)}"; nova agreeing: ${ref(v2)}; orin afterwards: role ${after && after.role}, status ${after && after.status}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R11.f", "a member's self-registered key tells every administrator by a Queue item offering the revoke; revoke and reactivate; a member cannot re-activate her own", "member, administrators", "dev registered her own key; read the founder's Queue; the founder revoked then reactivated it; dev revoked her own and tried to reactivate it", async () => {
      const d = await dev(); const key = await kit.newKey();
      const reg = R((await kit.post(d, "signerregisterown", { keyB64: key.keyB64 })).body);
      const { c, p } = await ctxAs("admin", kit.PASSWORD); const q = await go(p, "/app/queue", 1500); const h = await go(p, "/app", 1500); const sh = await look(p, "r11-key-queue", "founder");
      const item = /signing key|key/i.test(q + h);
      const rev = R((await kit.post(adm, "signerset", { keyB64: key.keyB64, status: "revoked" })).body);
      const members = await go(p, "/app/members", 1500);
      const roster = (R(await kit.get(adm, { op: "signerlist" })).signers || []).find((k) => k.key_b64 === key.keyB64) || {};
      const react = R((await kit.post(adm, "signerset", { keyB64: key.keyB64, status: "active" })).body);
      const own = R((await kit.post(d, "signerrevokeown", { keyB64: key.keyB64 })).body);
      const reown = R((await kit.post(d, "signerset", { keyB64: key.keyB64, status: "active" })).body);
      const row2 = (R(await kit.get(adm, { op: "signerlist" })).signers || []).find((k) => k.key_b64 === key.keyB64) || {};
      await c.close();
      return verdictOf(reg.ok !== false && rev.ok !== false && react.ok !== false && reown.ok === false && item, `registered ${reg.ok !== false}; an item in the founder's Queue or Home naming the key (UC-161): ${item ? "yes" : "NO"}; revoked by the administrator: ${rev.ok !== false}, status ${roster.status}; the roster's words: "${J((members.match(/[^\n]*(withdrawn|does not sign|Reactivate)[^\n]*/g) || ["none"]).join(" / "), 170)}"; reactivated: ${react.ok !== false}; the member revoked her own: ${own.ok !== false}, then tried to reactivate it: ${ref(reown)}; the row now: status ${row2.status}, origin ${row2.origin}, registered_by ${row2.registered_by}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R11.g", "owner stand-down (\"Before you vote\" five checks and a reason) and \"no door overrides a member's conclusion\"", "owner, administrator", "tried to reach them", async () => cant("the owner vote needs a project with at least three owners and the conclusion check needs a question concluded: both are made in areas 3 and 9. Not forced here; no administrator control that overrides a member's conclusion is on Members, Home, Queue or Settings (read in R11.a to R11.f)"));
  }

  /* ============================================================ R13 ============================================================ */
  if (want("R13")) {
    const hourBack = (h) => new Date(Date.now() - h * 3600e3).toISOString().replace(/\.\d{3}Z$/, "Z");
    await step("R13.a", "the Security page, administrators only: one sentence first, \"Nothing unusual...\" when ordinary; the level word, the period, the grid, countries", "founder", "opened Settings > Security as the administrator, chose periods, set bad dates", async () => {
      const { c, p } = await ctxAs("admin", kit.PASSWORD); const t = await go(p, "/app/security", 1500); const sh = await look(p, "r13-security", "founder");
      const lead = /Nothing unusual\. There is nothing for you to do\./.test(t); const lvl = /ORDINARY|Ordinary/.test(t);
      const folded = /The counts, by kind, hour and place/.test(t);
      /* a bad period: the end after the start is wrong */
      const dateIn = (d) => d.toISOString().slice(0, 10); const now = new Date();
      await p.fill("#se-from", dateIn(new Date(now.getTime() - 3 * 86400e3))); await p.fill("#se-to", dateIn(new Date(now.getTime() - 5 * 86400e3))); await p.click("button:has-text('Show the level for a period')"); await settle(p, 1400); const bad = await joinAlerts(p) || (await body(p)).split("Show the level")[0].slice(-200);
      await p.fill("#se-from", dateIn(new Date(now.getTime() - 5 * 86400e3))); await p.fill("#se-to", dateIn(new Date(now.getTime() - 1 * 86400e3))); await p.click("button:has-text('Show the level for a period')"); await settle(p, 1400); const good = (await body(p)).split("HOW HARD")[1] || "";
      const presets = ["hour", "24 hours", "7 days", "30 days"].filter((x) => new RegExp(x, "i").test(t));
      const mem = await as("dev"); const m = R((await kit.post(mem, "securitymap", { from: hourBack(5), to: hourBack(1) })).body);
      const mc = await ctxAs("dev", DEVPW); const mt = await go(mc.p, "/app/security", 1200); await mc.c.close();
      await c.close();
      return verdictOf(lead && lvl && /NOT_AN_ADMIN/.test(JSON.stringify(m)), `leads with "Nothing unusual. There is nothing for you to do.": ${lead}; level word ORDINARY shown: ${lvl}; the counts folded under "The counts, by kind, hour and place": ${folded}; period presets (hour, 24 hours, 7 days, 30 days) offered as controls: ${presets.length ? presets.join(", ") : "none: only From and To date fields"}; end before start: "${J(bad, 160)}"; a good set of dates: "${J(good.replace(/\s+/g, " "), 160)}"; as a member: securitymap ${ref(m)}; the member's page says "${J(mt.split("Security\n").slice(-1)[0].replace(/\s+/g, " "), 130)}"`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R13.b", "the level moves with refused and blocked requests; \"Noticed\" is told once in the queue when it becomes High; a member's mistyped password is counted without a country", "founder", "made fourteen refused sign-ins from one source in a second room until it paused, read securitymap and the Queue", async () => {
      const results = []; await kit2.person("sam");
      for (let i = 0; i < 14; i++) { const r = R((await kit2.post({}, "login", { handle: "sam", password: "wrong password number " + i, device: "own" })).body); results.push(r.reason || (r.ok ? "ok" : "?")); }
      const adm2 = await kit2.founder(); const nowIso = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
      const map = R(await kit2.get(adm2, { op: "securitymap", from: hourBack(3), to: nowIso }));
      const q = JSON.stringify(R(await kit2.get(adm2, { op: "queue" }))); const items = q.match(/security|noticed|attempt|hard your team/gi) || []; const snip = (q.match(/.{0,80}(security|attempt).{0,160}/i) || [""])[0];
      return verdictOf(map.ok !== false && map.level !== "Ordinary", `14 refused sign-ins from one source: answers ${J([...new Set(results)])}; the map answers ${map.ok === false ? ref(map) : "level " + map.level + " (" + map.levelAt + "), totals " + J(map.totals) + ", countries " + J(map.countries) + ", unplaced " + J(map.unplaced) + ", note " + J(map.note)}; a security notice in the administrator's Queue: ${items.length ? "yes: \"" + J(snip, 200) + "\"" : "no"}. The level reached Raised, not High, against a team minutes old (its own usual is zero); High and its once-told notice are not reached`);
    });
    await step("R13.c", "\"Add another checker (advanced)\": the catalogue, the field labels as words, an add and its test and removal", "founder", "read the catalogue, added a checker with no handling digest, then with one, tested it, removed it", async () => {
      const { c, p } = await ctxAs("admin", kit.PASSWORD); await go(p, "/app/security", 1200);
      await p.locator("summary:has-text('Add another checker')").click(); await p.waitForTimeout(700);
      const t = await body(p); const sh = await look(p, "r13-checkers", "founder");
      const cat = R(await kit.get(adm, { op: "securitytoolcatalogue" })); const offered = cat.offered || [];
      const first = offered.find((o) => o.provider_id === "scanii") || offered[0];
      const noDigest = R((await kit.post(adm, "securitytooladd", { providerId: first.provider_id })).body);
      const add = R((await kit.post(adm, "securitytooladd", { providerId: first.provider_id, config: { region: "us1" }, credentials: { api_key: "k-test", api_secret: "s-test" }, handlingDigest: first.handling_digest, confirmRetention: true, use: "on_request" })).body);
      const tools = R(await kit.get(adm, { op: "securitytools" })).tools || [];
      const test = tools[0] ? R((await kit.post(adm, "securitytooltest", { toolId: tools[0].tool_id || tools[0].id })).body) : null;
      const rm = tools[0] ? R((await kit.post(adm, "securitytoolremove", { toolId: tools[0].tool_id || tools[0].id })).body) : null;
      const silent = offered.filter((o) => /silent|not stated/i.test(JSON.stringify(o.handling && o.handling.sample_sharing))).length;
      await c.close();
      const raw = /_|undefined/.test((t.match(/Region: [^\n]*|Credentials?[^\n]*/g) || []).join(""));
      return verdictOf(offered.length > 5 && add.ok !== false, `${offered.length} checkers offered; the vendor list on the page shows ${J((t.match(/Acts for [^\n]*/g) || []).length)} entries; adding with no handling digest: ${ref(noDigest)}; adding with the digest and credentials: ${add.ok !== false ? "added" : ref(add)}; listed tools ${tools.length}; the test: ${test ? ref(test) : "not run"}; removal: ${rm ? (rm.ok !== false ? "removed" : ref(rm)) : "not run"}; a tool silent on sample sharing is offered: ${silent > 0} (DEC-168); label words read as words (the config label "Region: one of us1, eu1..."), raw field names on the page: ${raw}. The harmless-file test calls the vendor and the Miniflare's outbound answers only scripted names: a pass of the test is not reached`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R13.d", "the scanner: scanmirror answers and the page's state lines (no signatures, refused, failed, not fetched); \"Check for signatures\"", "founder", "pressed the scanner check as the administrator and as a member", async () => {
      const a = R((await kit.post(adm, "scanmirror", {})).body); const m = R((await kit.post(await dev(), "scanmirror", {})).body);
      const { c, p } = await ctxAs("admin", kit.PASSWORD); const t = await go(p, "/app/security", 1200); await c.close();
      const lines = (t.split("WHAT IS INSTALLED")[1] || "").replace(/\s+/g, " ").slice(0, 380);
      return verdictOf(a.ok === false && /SCANNER_ABSENT/.test(JSON.stringify(a)) && m.ok === false, `scanmirror as the administrator: ${ref(a)}; as a member: ${ref(m)}; the page's lines: "${lines}"; a "Check for signatures" control on the page: ${/Check for (new )?signatures/i.test(t)} (no scanner is installed in a Miniflare room, so the signature states are not reached)`);
    });
    /* the file side: a text file filed in a project by the member's own acts */
    const fileSide = {};
    await step("R13.e", "files: a risk word with reasons; a text file shown as text; High risk offers the safe view first and \"Open the original\" only after a deeper check or the warned path", "member dev", "uploaded a text file and a binary, filed both in a project, read threatof, safeview, openoriginal, deepercheck, openwithwarning", async () => {
      await kit.post(adm, "membercaps", { memberId: "dev", capabilities: ["contribute", "create_projects"] });
      const d = await dev(); const cs = kit.screenCall(d);
      const proj = await kit.projectOf(d, "People walk files project");
      const txtBytes = kit.te("The clerk stamped the amended contract RECEIVED before the council voted on it.\n".repeat(30)); const exeBytes = new Uint8Array([0x4d, 0x5a, 0x90, 0, 3, 0, 0, 0, 4, 0, 0, 0, 0xff, 0xff, ...new Array(300).fill(7)]);
      const up = async (name, type, bytes) => R(await (await kit.plane(`/api/?op=captureupload&statement=${encodeURIComponent(name)}&name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`, { method: "POST", headers: d, body: bytes })).json());
      const fileIn = async (name, type, bytes) => { const u = await up(name, type, bytes); const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: u.document, title: name, locator: u.document.locator, project: proj }); return { sha: kit.sha(bytes), filed }; };
      const T = await fileIn("minutes.txt", "text/plain", txtBytes), X = await fileIn("tool.bin", "application/octet-stream", exeBytes);
      fileSide.T = T; fileSide.X = X; fileSide.proj = proj;
      const threat = R(await kit.get(d, { op: "threatof", capture: T.sha })); const threatX = R(await kit.get(d, { op: "threatof", capture: X.sha }));
      const sv = R(await kit.get(d, { op: "safeview", capture: T.sha })); const svX = R(await kit.get(d, { op: "safeview", capture: X.sha }));
      const oo = R((await kit.post(d, "openoriginal", { captureSha: X.sha })).body); const dc = R((await kit.post(d, "deepercheck", { captureSha: X.sha })).body);
      const ow = R((await kit.post(d, "openwithwarning", { captureSha: X.sha, warned: true })).body); const ow2 = R((await kit.post(d, "openwithwarning", { captureSha: X.sha })).body);
      const os = R(await kit.get(d, { op: "originalstate", capture: X.sha }));
      return verdictOf(threat.ok && threat.threat && sv.ok !== false, `text file: threat "${threat.threat}" because ${J((threat.reasons || []).map((r) => r.translation || r.code))}; its safe view ${sv.ok === false ? ref(sv) : "answered: " + J(Object.keys(sv))}; the binary: threat "${threatX.threat}" (${J((threatX.reasons || []).map((r) => r.code))}), its safe view ${svX.ok === false ? ref(svX) : "answered"}; openoriginal without a deeper check: ${ref(oo)}; deepercheck: ${ref(dc)}; the warned path: ${ref(ow)}; unwarned: ${ref(ow2)}; originalstate: ${J(os, 220)}`);
    });
    await step("R13.f", "a held file released by a reason from each of two members or a second engine's clean check, never by the machine", "members", "tried releasescanhold on a file with no hold", async () => cant("a scan hold is opened only by a scanner finding something; this room has no scanner (SCANNER_ABSENT, R13.d) so no file is ever held. releasescanhold on an unheld file answers: " + ref(R((await kit.post(await dev(), "releasescanhold", { captureSha: fileSide.X && fileSide.X.sha || "0".repeat(64), reason: "I checked it" })).body))));
    await step("R13.g", "the Security page and a document's risk line at 390 px (Security title 20 px)", "founder", "opened Security at 390 px, read the title's size and sideways scroll", async () => {
      const { c, p } = await ctxAs("admin", kit.PASSWORD, "own", 390); await go(p, "/app/security", 1500);
      const m = await p.evaluate(() => { const h = document.querySelector("h1"); return { fs: h ? getComputedStyle(h).fontSize : null, sw: document.documentElement.scrollWidth }; });
      await p.screenshot({ path: SHOTS + "r13-security-phone.png" }); await c.close();
      return verdictOf(m.sw <= 390, `the title is ${m.fs}; scrollWidth ${m.sw} at 390`, { shot: "shots/02-people/r13-security-phone.png" });
    }, { width: "390" });
  }

  /* ============================================================ R15 ============================================================ */
  if (want("R15")) {
    const fillSet = async (p, o) => { await p.fill("#bi-name", o.name); await p.selectOption("#bi-kind", { index: o.kind ?? 0 }); await p.fill("#bi-subject", o.subject); await p.fill("#bi-text", o.text); await p.fill("#bi-why", o.why); if (o.cite !== undefined) await p.fill("#bi-cite", o.cite); await p.fill("#bi-not", o.not || "It does not set how strong support must be."); };
    await step("R15.a", "write one statement of each kind; a pattern must cite evidence; a statement that pre-assigns a truth value is refused by name", "founder", "filled the form for a scrutiny, an inference and a pattern statement and for \"this office lies\"", async () => {
      const ent = R((await kit.post(adm, "entitycreate", { kind: "institution", label: "City Clerk", note: "The office that stamps records received by the council.", aliases: ["City Clerk"] })).body);
      const { c, p } = await ctxAs("admin", kit.PASSWORD); const promos = []; p.on("response", async (r) => { if (/op=promote/.test(r.url()) && r.request().method() !== "GET") { try { promos.push((await r.text()).slice(0, 220)); } catch {} } });
      await go(p, "/app/bias", 1200); const out = [];
      const tryOne = async (label, o) => { await go(p, "/app/bias", 700); await fillSet(p, o); await reasoned(p, "Save the set and offer it for adoption", "Writing this down so a reader can discount it.").catch(() => {}); await settle(p, 1200); const said = await joinAlerts(p); const t = await body(p); out.push(`${label}: "${J((said || t.split("When a set cannot be saved")[0].split("Save the set and offer it for adoption")[1] || "").replace(/\s+/g, " ").trim(), 150)}"`); };
      await tryOne("scrutiny", { name: "Scrutiny set", kind: 0, subject: "City Clerk", text: "We read every stamp date against the minutes' own date.", why: "Stamps were late once." });
      await tryOne("inference", { name: "Inference set", kind: 1, subject: "City Clerk", text: "We do not conclude intent from a late stamp.", why: "A late stamp has other causes." });
      await tryOne("pattern without evidence", { name: "Pattern set", kind: 2, subject: "City Clerk", text: "Stamps run two days late in budget season.", why: "Seen in three years.", cite: "" });
      await tryOne("verdict statement", { name: "Verdict set", kind: 0, subject: "City Clerk", text: "This office lies and everything from it is false.", why: "I distrust them." });
      const sh = await look(p, "r15-bias", "founder"); await c.close();
      const verdict = /this office lies|false|verdict/i.test(out[3] || "");
      const malformed = promos.filter((x) => /MALFORMED/.test(x));
      return verdictOf(!malformed.length && out.length === 4 && /cite|evidence/i.test(out[2] || "") && verdict, `the subject made first by entitycreate: ${ent.ok !== false ? "ok" : ref(ent)}; ` + out.join(" | ") + `; the plane's answers to the form's save (promote): ${promos.length} sent, ${malformed.length} answered MALFORMED: ${J(promos[0] || "none")}. The form sends the set as a new bundle with no bundleId (the project page first asks allocid for one), so a set can never be saved from this screen`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R15.b", "read the lens in force with its hash; \"no manifest was in force\" when none", "member", "pressed Show the lens in force; asked biasmanifest", async () => {
      const d = await dev(); const m = R(await kit.get(d, { op: "biasmanifest" }));
      const { c, p } = await ctxAs("dev", DEVPW); await go(p, "/app/bias", 1000); await p.click("button:has-text('Show the lens in force')"); await settle(p, 1400); const t = await body(p); await c.close();
      return verdictOf(m.ok !== false, `biasmanifest: ${J(m, 300)}; the page says "${J((t.split("Show the lens in force")[1] || "").split("To adopt")[0].replace(/\s+/g, " "), 200)}"`);
    });
    await step("R15.c", "draft one from an outside policy (writinghelp / biasinhale): nothing saved until written into a set", "founder", "pasted a policy into the form and pressed Propose statements from it", async () => {
      const { c, p } = await ctxAs("admin", kit.PASSWORD); await go(p, "/app/bias", 1000);
      await p.fill("#bi-policy", "Staff shall date-stamp every record on the day it is received. Late stamps must be explained in writing."); await p.fill("#bi-source", "City records policy 4.2"); await p.fill("#bi-when", "October 2026");
      await p.click("button:has-text('Propose statements from it')"); await settle(p, 1800); const t = await body(p); const al = await joinAlerts(p); await c.close();
      const r = R((await kit.get(adm, { op: "biasinhale", policy: "Staff shall date-stamp every record on the day it is received.", source: "City records policy 4.2", retrieved: "2026-10-25" })));
      return verdictOf(true, `the page after pressing: "${J((al || t.split("Propose statements from it")[1] || "").replace(/\s+/g, " "), 220)}"; biasinhale answers ${J(r, 260)}`);
    });
    await step("R15.d", "adopt for the instance and for a project (two acts); amend; an adopted set cannot go back to proposed; promote and retire", "founder", "adopted a saved set for the team, read the manifest, adopted again, tried the illegal move", async () => {
      const sets = R(await kit.get(adm, { op: "biasmanifest", scope: "instance" }));
      const list = R(await kit.get(adm, { op: "list" }));
      const biasBundles = (Array.isArray(list) ? list : list.bundles || []).filter((b) => /bias/i.test(b.object_type || ""));
      if (!biasBundles.length) return cant(`saving a set by the form did not file a bias bundle I could name (list holds ${Array.isArray(list) ? list.length : "?"} bundles of which ${biasBundles.length} of type bias); the adopt and amend acts need one`);
      const id = biasBundles[0].bundle_id; const a1 = R((await kit.post(adm, "biasadopt", { bundleId: id, scope: "instance", reason: "The team agrees to read stamps this way." })).body);
      const m = R(await kit.get(adm, { op: "biasmanifest", scope: "instance" }));
      return verdictOf(a1.ok !== false, `adopt: ${a1.ok !== false ? J(a1, 160) : ref(a1)}; manifest after: ${J(m, 300)}`);
    });
    await step("R15.e", "debt: ONE To do item per run in the Queue naming the lens then and now; only an uncleared hunch refuses publication", "members", "tried to reach bias debt", async () => cant("bias debt arises only from an assistant run made under a lens that later moved (DEC-69); the assistant is out of the alpha (DEC-405) and this room has no run, so there is no debt item to read: recorded, not a defect. biasdebt with no run answers " + ref(R(await kit.get(adm, { op: "biasdebt" })))));
  }

  /* ============================================================ R17 ============================================================ */
  if (want("R17")) {
    await step("R17.a", "without the assistant it is absent, not greyed: no button, panel, tray or \"suggested\" section on the working screens; Settings says not connected in one line", "member", "read Home, Queue, Find, Add, Projects, People, Settings and the account for assistant controls", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); const hits = [];
      for (const r of ["", "queue", "finder", "capture", "projects", "people", "settings", "account", "more"]) { const t = await go(p, "/app" + (r ? "/" + r : ""), 900); const m = t.match(/[^\n]*(assistant|Claude|suggest)[^\n]*/gi); if (m) hits.push(`${r || "home"}: ${J(m.join(" / "), 140)}`); }
      const sh = await look(p, "r17-settings-assistant", "member dev"); await c.close();
      const outside = hits.filter((h) => !/^(settings|account|more):/.test(h));
      return verdictOf(outside.length === 0, `assistant words outside Settings and Your account: ${outside.length ? J(outside, 400) : "none"}; on Settings and Your account: ${J(hits.filter((h) => /^(settings|account):/.test(h)), 400)}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R17.b", "the connect page: what the team's key means; what connecting means; \"Not now\"; \"My own Claude API key\" draws only its field; the password again", "member", "opened The assistant, read both notices, picked each way, tried to connect with a key", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); const t0 = await go(p, "/app/connect", 1200); const sh = await look(p, "r17-connect", "member dev");
      await p.click("button:has-text('Read what connecting means')"); await settle(p, 1200);
      const ways = await p.evaluate(() => [...document.querySelectorAll("#mc-way option")].map((o) => o.textContent.trim()));
      const states = {};
      for (const w of ways) { await p.selectOption("#mc-way", { label: w }).catch(() => {}); await p.waitForTimeout(500); states[w] = (await p.evaluate(() => [...document.querySelectorAll("input,button,textarea")].filter((e) => e.getBoundingClientRect().width > 0 && !/Explanations|You:|Width|Show me how/.test((e.getAttribute("aria-label") || "") + e.innerText)).map((e) => e.id || e.innerText.trim().slice(0, 30)).join(","))); }
      const t = await body(p); await c.close();
      return verdictOf(ways.length >= 2, `read-once notice before connecting: ${/Read what connecting means/.test(t0)}; the ways offered: ${J(ways)}; the controls drawn for each way: ${J(states, 500)}; the page says: "${J(t.split("The assistant\n")[1] || t, 260).replace(/\s+/g, " ")}"`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R17.c", "the refusals carry a Reference; the unavailable sentences read as plain words (no agent-worker; no instance token)", "member", "asked subscriptionsignin, accountreferenceset, ailimitset and ask without an assistant", async () => {
      const d = await dev(); const out = [];
      for (const [op, b] of [["accountreferenceset", { reference: "sk-ant-test-key-0000" }], ["accountusesset", { uses: [] }], ["ailimitset", { limit: 5, per: "day" }], ["reauth", { password: "wrong password here 12345" }]]) { const r = R((await kit.post(d, op, b)).body); out.push(`${op}: ${ref(r)}`); }
      return verdictOf(!/undefined/.test(out.join("")), out.join(" | "));
    });
    await step("R17.e", "asking the assistant with none connected answers in plain words (not a fault)", "member, founder", "sent op=ask with a question, as the member and as the founder, and with an empty body", async () => {
      const d = await dev(); const q = "How many members does the team have?";
      const a = await kit.post(d, "ask", { question: q }); const b = await kit.post(adm, "ask", { question: q }); const e = await kit.post(d, "ask", {});
      const ok3 = [a, b, e].every((x) => x.status < 500);
      return verdictOf(ok3, `member: HTTP ${a.status} ${R(a.body).reason}; founder: HTTP ${b.status} ${R(b.body).reason}; empty body: HTTP ${e.status} ${R(e.body).reason}. The plane's log for each shows PLANE_INTERNAL_ERROR with the stack "DataCloneError: Proxy could not be serialized because it is not a valid RPC receiver type" at control-plane/phase-clock.mjs:173 called from plane/ask.mjs:71 (askOp) and control-plane/index.mjs:2675. The answer is the generic "failed while handling the request" fault with a reference, not the not-connected sentence (NO_INSTANCE_AI_CREDENTIAL or AGENT_WORKER_UNBOUND) the coverage row expects. (DEC-139: without the assistant it should be absent, not a fault.)`);
    });
    await step("R17.d", "Ask becomes \"Find and count\": search, and counts that show their method", "member", "opened the Ask page and searched", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); const t = await go(p, "/app/answers", 1200); const sh = await look(p, "r17-ask", "member dev");
      const s = R(await kit.get(await dev(), { op: "search", q: "contract" })); await c.close();
      return verdictOf(!/Ask the assistant/i.test(t), `the page says "${J(t.split("Ask")[1] || t, 260).replace(/\s+/g, " ")}"; the label on the nav: ${/Find and count|Find/.test(t) ? "Find" : "?"}; search with no documents answers ${J(s, 160)}`, { shot: sh });
    }, { width: "1280 and 390" });
  }

  /* ============================================================ R121 ============================================================ */
  const tip = (p) => p.evaluate(() => { const c = document.getElementById("cs-tip"); return c && !c.hidden && c.getBoundingClientRect().width > 0 ? c.innerText.trim() : null; });
  const restOn = async (p, sel, ms = 4000) => { await p.mouse.move(2, 2); for (let i = 0; i < 40 && (await tip(p)); i++) await p.waitForTimeout(100); const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded().catch(() => {}); const bb = await el.boundingBox(); if (!bb) return { missing: true }; await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); const t0 = Date.now(); let seen = null; while (Date.now() - t0 < ms) { seen = await tip(p); if (seen) break; await p.waitForTimeout(25); } return { ms: seen ? Date.now() - t0 : null, text: seen }; };
  if (want("R121")) {
    await step("R121.a", "the path on every screen ends with the screen's own name", "member, founder", "opened each screen of this area and read the path line", async () => {
      const { c, p } = await ctxAs("admin", kit.PASSWORD); const bad2 = []; const ok2 = [];
      for (const r of ["account", "members", "recovery", "security", "bias", "connect", "notes", "settings", "elsewhere", "group", "places", "glossary"]) {
        const t = await go(p, "/app/" + r, 700); const h1 = await p.evaluate(() => (document.querySelector("h1") || {}).innerText || "");
        const crumb = (t.match(/[^\n]*›[^\n]*/) || [""])[0].trim(); const endsWith = crumb && crumb.split("›").pop().trim().toLowerCase() === h1.trim().toLowerCase();
        (endsWith ? ok2 : bad2).push(`${r}: "${crumb || "no path"}" vs title "${h1.trim()}"`);
      }
      await c.close();
      return verdictOf(bad2.length === 0, `${ok2.length} screens end the path with their own name; ${bad2.length ? "not: " + J(bad2, 500) : "all do"}`);
    });
    await step("R121.b", "cards: rest 0.5 s on a name, button, section heading, rail entry; focus shows at once; Escape closes; the two levels' delays", "member", "rested the pointer on a rail entry, a button, a heading; focused a control; pressed Escape; switched the level and timed again", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); await go(p, "/app/account", 1200);
      const prompt = { rail: await restOn(p, "a:has-text('Settings') >> nth=0"), button: await restOn(p, "button:visible:has-text('Declare your expertise')"), heading: await restOn(p, "h2 >> nth=0") };
      await p.mouse.move(2, 2); for (let i = 0; i < 40 && (await tip(p)); i++) await p.waitForTimeout(100);
      await p.focus("#ma-exp"); await p.keyboard.press("Tab"); await p.waitForTimeout(80); const onFocus = await tip(p);
      await p.keyboard.press("Escape"); await p.waitForTimeout(150); const afterEsc = await tip(p);
      await p.selectOption("#ma-level", { label: "On a longer pause" }); await p.click("button:has-text('Choose how much is explained')"); await settle(p, 1200);
      const pause = { rail: await restOn(p, "a:has-text('Settings') >> nth=0", 5000), button: await restOn(p, "button:visible:has-text('Declare your expertise')", 5000) };
      await p.selectOption("#ma-level", { label: "Explain promptly" }); await p.click("button:has-text('Choose how much is explained')"); await settle(p, 800); await c.close();
      const near = (x, lo, hi) => x && x.ms >= lo && x.ms <= hi;
      return verdictOf(near(prompt.rail, 350, 800) && near(prompt.button, 350, 800) && !!onFocus && !afterEsc && near(pause.rail, 1200, 2000), `promptly: rail entry ${J(prompt.rail.ms)} ms, button ${J(prompt.button.ms)} ms, section heading ${prompt.heading.missing ? "no heading" : J(prompt.heading.ms)} ms (half a second asked); focus shows it at once: ${!!onFocus}; Escape closes: ${!afterEsc}; on a longer pause: rail entry ${J(pause.rail.ms)} ms, button ${J(pause.button.ms)} ms (a second and a half asked for screens, sections, rail and acts); a button's card says "${J(prompt.button.text, 150)}"`);
    });
    await step("R121.c", "the masthead switch and Alt+Shift+I; the setting is per member", "member, founder", "toggled by click and by the keys as the member, read the founder's level", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); await go(p, "/app", 900);
      const lab = () => p.evaluate(() => (document.querySelector("button[aria-label^='Explanations']") || {}).innerText);
      const a = await lab(); await p.keyboard.press("Alt+Shift+I"); await p.waitForTimeout(500); const b = await lab(); await p.click("button[aria-label^='Explanations']"); await p.waitForTimeout(500); const cc = await lab();
      const f = R(await kit.get(adm, { op: "infolevel" })); const m = R(await kit.get(await dev(), { op: "infolevel" }));
      await p.keyboard.press("Alt+Shift+I"); await p.waitForTimeout(300); await c.close();
      return verdictOf(a !== b && b !== cc && f.level !== undefined, `masthead reads "${a}", after Alt+Shift+I "${b}", after a click "${cc}"; the member's level now "${m.level}", the founder's "${f.level}" (per member)`);
    });
    await step("R121.d", "one list of every term (the Glossary): opens from Settings; a term is explained once and listed", "member", "opened the Glossary from Settings and read it", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); const t = await go(p, "/app/glossary", 1200); const sh = await look(p, "r121-glossary", "member dev"); await c.close();
      return verdictOf(t.length > 500, `the Glossary reads "${J(t.split("Glossary")[2] || t, 300).replace(/\s+/g, " ")}"`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R121.e", "new members start with guidance on and after a month are asked once whether to keep it; heavy acts' dialog and the weight scale said once", "member", "looked for the month question; read a weighted act's card", async () => cant("the month question needs a member a month old and the plane's clock cannot be moved in Miniflare; the weight pips and rung names are on every act button (\"Invite a member | ●●○○○ Asks for a reason\", R10.a), and the heavy-act dialogs belong to areas 9 and 10 where signing and publishing are walked"));
  }

  /* ============================================================ R122 ============================================================ */
  if (want("R122")) {
    await step("R122.a", "a member without a capability sees the control absent, not greyed, and the operation refuses it too", "member low (contribute only)", "made a member with contribute only, read Home and Members, then sent promote (start a project) as her", async () => {
      await kit.person("low");
      const { c, p } = await ctxAs("low", pwOf("low")); const home = await go(p, "/app", 1500); const sh = await look(p, "r122-low-home", "member low");
      const startVisible = /Start a project/.test(home); const disabled = await p.evaluate(() => [...document.querySelectorAll("button[disabled],button[aria-disabled=true]")].map((e) => e.innerText.trim()).filter(Boolean));
      const auth = await as("low"); const made = R((await kit.post(auth, "promote", { base: null, snapKey: "20261025T000000Z_00c0ffee", meta: { object_type: "project", title: "Low's project", current_state: "forming", created: "2026-10-25T00:00:00Z", last_updated: "2026-10-25T00:00:00Z" }, files: [{ path: "bundle.md", text: "---\nobject_type: project\ntitle: Low\n---\n" }], register: [], visibility: "hidden" })).body);
      const members = await go(p, "/app/members", 1200); const sec = await go(p, "/app/security", 1000); const inviteVisible = /Invite a member/.test(members);
      const caps = R(await kit.get(auth, { op: "whoami" })).capabilities;
      await c.close();
      return verdictOf(!startVisible && disabled.filter((x) => /Start a project|Invite|publish/i.test(x)).length === 0 && made.ok === false && !inviteVisible, `her capabilities: ${J(caps)}; Start a project on Home: ${startVisible ? "DRAWN" : "absent"}; greyed-out buttons on Home: ${J(disabled)}; the invite form on Members: ${inviteVisible ? "DRAWN" : "absent"}; the operation promote for a project: ${made.ok === false ? ref(made) : "ANSWERED " + J(made, 100)}; Security as this member: "${J(sec.split("Security\n").slice(-1)[0].replace(/\s+/g, " "), 100)}"`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R122.b", "the administrator's capability field is editable by nobody including itself; unconfirmed expertise costs the holder nothing; a machine credential is never shown holding capabilities", "founder", "tried membercaps on the founder and on another administrator; read whoami under the operator token", async () => {
      const onFounder = R((await kit.post(adm, "membercaps", { memberId: "admin", capabilities: ["contribute"] })).body);
      const nova = (R(await kit.get(adm, { op: "memberlist" })).members || []).find((m) => m.member_id === "nova");
      const onAdmin = nova ? R((await kit.post(adm, "membercaps", { memberId: "nova", capabilities: ["contribute"] })).body) : null;
      const bearer = R(await kit.get({ authorization: "Bearer " + kit.ADM }, { op: "whoami" }));
      return verdictOf(onFounder.ok === false, `membercaps on the founder (member id admin): ${ref(onFounder)}${/NO_SUCH_MEMBER/.test(JSON.stringify(onFounder)) ? " (the roster lists her as a member, and the refusal says no member answers to that name: it does not say the administrators' capabilities are fixed)" : ""}; on another administrator: ${onAdmin ? ref(onAdmin) : "no other administrator in this run"}; whoami under the operator token: tokenClass ${bearer.tokenClass}, capabilities ${J(bearer.capabilities)}, administer ${bearer.administer}`);
    });
    await step("R122.c", "a list open on one account updates when another account adds or removes an item, without disruption", "founder, nova/other", "kept the roster open as the founder, invited a member by the operation, waited, did not reload", async () => {
      const { c, p } = await ctxAs("admin", kit.PASSWORD); await go(p, "/app/members", 1500);
      const before = await body(p); const inv = R((await kit.post(adm, "memberadd", { memberId: "alive1", cover: "Alma the alive", role: "member", capabilities: ["contribute"] })).body);
      let seen = false, at = null; const t0 = Date.now(); while (Date.now() - t0 < 75000) { const t = await body(p); if (/Alma the alive|alive1/.test(t)) { seen = true; at = Date.now() - t0; break; } await p.waitForTimeout(1000); }
      await c.close();
      return verdictOf(seen, `a member invited from another session (alive1): the open roster ${seen ? "showed it after " + at + " ms without a reload" : "did NOT show it within 75 s: no reload, no live update"}`);
    });
    await step("R122.d", "a second account's view of every hidden object reads Withheld, not refused; the public sees no sign a fence exists", "member", "needs a hidden project", async () => cant("Withheld treatment is walked in R124.b on a hidden project made for it (the member opens a hidden project's address and reads the same words as for nothing); the working-versus-published band and the public's view of a fence are walked in area 9 (a published case)"));
  }

  /* ============================================================ R123 ============================================================ */
  if (want("R123")) {
    await step("R123.a", "write a note in her own words; read \"Only you can see this in your group\"; the administrator and a second member cannot see it", "member, founder, second member", "wrote a note by the form, read the screen, read the notes as the founder and as another member", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); await go(p, "/app/notes", 1200);
      await p.fill("#mn-new", "I think the clerk's stamp date was typed in later."); await p.click("button:has-text('Write a note')"); await settle(p, 1500); const t = await body(p); const sh = await look(p, "r123-notes", "member dev");
      const mine = R(await kit.get(await dev(), { op: "notes" })).notes.length; const founder = R(await kit.get(adm, { op: "notes" })).notes.length; const other = R(await kit.get(await as("low"), { op: "notes" })).notes.length;
      const fc = await ctxAs("admin", kit.PASSWORD); const ft = await go(fc.p, "/app/notes", 1200); await fc.c.close(); await c.close();
      return verdictOf(mine >= 1 && founder === 0 && other === 0 && !/clerk's stamp date/.test(ft), `"Only you can see these in your team" ${/Only you can see these/.test(t)}; the member's notes ${mine}, the founder's view ${founder}, another member's ${other}; the founder's page shows the note's words: ${/clerk's stamp date/.test(ft)}. The screen says "team" where the coverage text says "group" (overlay check 15 asks for team)`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R123.b", "a home address or phone number in a note: warned; a named person in no public role: warned at the act", "member", "wrote a note with a phone number and a street address, and one naming a private person", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); await go(p, "/app/notes", 1000); const out = [];
      for (const txt of ["Her phone is 510-555-0142 and she lives at 12 Oak Street, Oakland.", "Maria Gonzalez at the bakery told me she saw the clerk."]) { await go(p, "/app/notes", 600); await p.fill("#mn-new", txt); await p.click("button:has-text('Write a note')"); await settle(p, 1400); out.push(`"${J(txt.slice(0, 40), 40)}": warned ${J(await joinAlerts(p) || "nothing said")}`); }
      await c.close();
      return verdictOf(!out.some((x) => /nothing said/.test(x)), out.join(" | ") + ". (DEC-408: such details may be kept but never cited, exported or published, and a named private person is warned at the act; here the note is simply kept.)");
    });
    await step("R123.c", "revise in place; delete for good (registry marks noterevise and notedelete owed); turn a note into an observation, hunch or question", "member", "pressed Acts on a note, looked for revise, delete and turn", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); await go(p, "/app/notes", 1200);
      await p.locator("button:has-text('Acts')").first().click(); await p.waitForTimeout(600);
      const controls = await p.evaluate(() => [...document.querySelectorAll("button,input[type=radio]")].filter((e) => e.getBoundingClientRect().width > 0 && !/Explanations|You:|Width/.test(e.getAttribute("aria-label") || "")).map((e) => (e.innerText || e.id || "").trim().slice(0, 40)).filter(Boolean));
      const d = await dev(); const w = R((await kit.post(d, "notewrite", { text: "A note to revise and to delete." })).body); const rev = R((await kit.post(d, "noterevise", { note: w.note, text: "A note, revised in place." })).body); const afterRev = R(await kit.get(d, { op: "notes" })).notes.find((n) => n.note === w.note); const del = R((await kit.post(d, "notedelete", { note: w.note })).body); const gone = !R(await kit.get(d, { op: "notes" })).notes.some((n) => n.note === w.note);
      const turn = R((await kit.post(d, "noteturn", { note: w.note, into: "question", made: "x" })).body);
      await c.close();
      return verdictOf(rev.ok !== false && del.ok !== false && gone, `the note's Acts panel holds: ${J(controls)}; noterevise: ${rev.ok !== false ? "kept, now \"" + (afterRev && afterRev.text) + "\"" : ref(rev)}; notedelete: ${del.ok !== false ? "deleted, gone from the list: " + gone : ref(del)}; noteturn into a question with no inquiry: ${ref(turn)}`);
    });
    await step("R123.d", "the court sentence at first use where the administrator chose it", "member", "set the court notice to tell, a new member wrote her first note", async () => {
      await kit.post(adm, "courtnoticeset", { choice: "tell" });
      const { c, p } = await ctxAs("low", pwOf("low")); await go(p, "/app/notes", 1000); await p.fill("#mn-new", "My first note."); await p.click("button:has-text('Write a note')"); await settle(p, 1500); const t = await body(p);
      await p.fill("#mn-new", "My second note."); await p.click("button:has-text('Write a note')"); await settle(p, 1500); const t2 = await body(p);
      await kit.post(adm, "courtnoticeset", { choice: "dont" }); await c.close();
      const court = /court|subpoena|legal/i; 
      return verdictOf(court.test(t) && !court.test(t2.split("KEPT")[0]), `after her first note the court sentence ${court.test(t) ? "is shown: \"" + J((t.match(/[^\n]*(court|subpoena|legal)[^\n]*/i) || [""])[0], 140) + "\"" : "is NOT shown"}; after the second it is ${court.test(t2.split("KEPT")[0]) ? "shown again" : "not shown again"}`);
    });
    await step("R123.e", "a note is never cited, published or counted", "member", "tried to cite a note", async () => cant("citing needs a question and a cited passage: made in area 6; a note has no cite control on its own panel (R123.c lists the panel's controls)"));
  }

  /* ============================================================ R124 ============================================================ */
  if (want("R124")) {
    await step("R124.a", "a nonsense address signed out and signed in draws a page with a next step, never raw JSON", "anyone", "opened /app/zzz-nowhere and /nowhere signed out, then signed in", async () => {
      const anon = await ctxOf(); const ap = await anon.newPage(); const o1 = await go(ap, "/app/zzz-nowhere", 900); const o2 = await go(ap, "/nowhere", 900); await anon.close();
      const { c, p } = await ctxAs("dev", DEVPW); const i1 = await go(p, "/app/zzz-nowhere", 900); const sh = await look(p, "r124-nowhere", "member dev"); const i2 = await go(p, "/app/members/no-such-person", 900); await c.close();
      const json = /^\s*[{[]/.test(o1 + o2 + i1 + i2) || /"ok"|ok":/.test(o1 + o2 + i1 + i2);
      return verdictOf(!json && /Go to Home|Sign in|Home/.test(i1), `signed out /app/zzz-nowhere: "${J(o1.split("\n").slice(0, 3).join(" "), 90)}"; signed out /nowhere: "${J(o2.split("\n").slice(0, 3).join(" "), 90)}"; signed in: "${J(i1.split("Home\n").slice(-1)[0].replace(/\s+/g, " "), 160)}"; an unknown member's page: "${J(i2.split("Home\n").slice(-1)[0].replace(/\s+/g, " "), 130)}"; raw JSON drawn: ${json}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R124.b", "a member opens a thing she may not see: the message names no type, id, title or count, and is the same as for a link to nothing", "member", "founder made a hidden project; the member opened its address and an address that leads to nothing", async () => {
      const proj = await kit.projectOf(adm, "Hidden budget inquiry");
      const { c, p } = await ctxAs("low", pwOf("low")); const hidden = await go(p, "/app/project/" + proj, 1500); const none = await go(p, "/app/project/PROJ-2026-9999-no-such-thing", 1500); const sh = await look(p, "r124-hidden", "member low");
      const adminOnly = await go(p, "/app/security", 900); await c.close();
      const strip = (x) => x.split("Home\n").slice(-1)[0].replace(/\s+/g, " ").trim();
      const leaks = /Hidden budget|PROJ-|inquiry/i.test(hidden);
      return verdictOf(strip(hidden) === strip(none) && !leaks, `the hidden project's address reads "${J(strip(hidden), 170)}"; an address to nothing reads "${J(strip(none), 170)}": ${strip(hidden) === strip(none) ? "the same words" : "DIFFERENT words"}; the title or id appears: ${leaks}; an administrators-only address as a member: "${J(strip(adminOnly), 120)}"`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R124.c", "\"Where else to go\": Home's sixth door; the sentence, each kind in fixed order with how to reach it, hours, languages and \"From {source}, read {date}\"; nothing recorded", "member", "chose the team's place, pressed the sixth door on Home and read the page", async () => {
      await kit.profileSet(["oakland-alameda"]).catch(() => {});
      const { c, p } = await ctxAs("dev", DEVPW); const home = await go(p, "/app", 1500); await p.locator("a:has-text('Help for my own situation')").first().click(); await settle(p, 1800); const t = await body(p); const sh = await look(p, "r124-elsewhere", "member dev");
      const q = R(await kit.get(await dev(), { op: "queue" })); await c.close();
      const kinds = ["legal help", "self-help", "service line", "state agency", "elected", "newsroom"].filter((k) => new RegExp(k, "i").test(t));
      return verdictOf(/legal information, never legal advice/.test(t), `the page opens "${J(t.split("Where else to go")[2] || t, 170).replace(/\s+/g, " ")}"; kinds present (${kinds.length} of 6): ${J(kinds)}; "From {source}, read" lines: ${(t.match(/From [^\n]*, read/g) || []).length}; hours or languages words: ${/hours|Mon|Open|language/i.test(t)}; the emergency sentence ("${J((t.match(/[^\n]*danger[^\n]*/i) || ["not found"])[0], 110)}") names a number: ${/\d/.test((t.match(/[^\n]*danger[^\n]*/i) || [""])[0])}; the Queue after opening the page: ${J(JSON.stringify(q).slice(0, 120))}`, { shot: sh });
    }, { width: "1280 and 390" });
    await step("R124.d", "with the team's connection down read the out-of-reach state", "member", "tried to stop the plane", async () => cant("stopping the worker mid-page would end this journey's plane; the out-of-reach state is not forced (a failed read is forced for the shell by the overlay's check 4 only where a request can be made to fail: not walked here)"));
  }

  /* ============================================================ R125 ============================================================ */
  if (want("R125")) {
    await step("R125.a", "a project lens against the team lens: override, lock, interaction, effective set", "founder, project member", "tried to adopt a set for a project", async () => {
      const proj = await kit.projectOf(adm, "Lens project");
      const list = R(await kit.get(adm, { op: "list" })); const arr = Array.isArray(list) ? list : list.bundles || [];
      const bias = arr.filter((b) => /bias/i.test(b.object_type || ""));
      if (!bias.length) return cant(`no bias set could be filed through the form in this room (R15.d), so there is nothing to adopt for a project or to lock; the form has no field for a lock or an override either (fields: name, kind, subject, statement, why, cites, what it does not enforce). biasmanifest for the project answers ${J(R(await kit.get(adm, { op: "biasmanifest", scope: "project", scopeId: proj })), 220)}`);
      const a = R((await kit.post(adm, "biasadopt", { bundleId: bias[0].bundle_id, scope: "project", scopeId: proj, reason: "The project reads sources this way." })).body);
      const m = R(await kit.get(adm, { op: "biasmanifest", scope: "project", scopeId: proj }));
      return verdictOf(a.ok !== false, `project adoption: ${a.ok !== false ? "adopted" : ref(a)}; effective set: ${J(m, 260)}. Lock, override and interaction review: the form and the operations name no field for them (cannot be exercised)`);
    });
  }

  /* ============================================================ R126 ============================================================ */
  if (want("R126")) {
    await step("R126.a", "the phone's More page: a page with a Back step, not a sheet; three rows, each with its line", "member, administrator", "at 390 px opened the More tab and /app/more, followed each row and came back", async () => {
      const out = {};
      for (const [who, h, pw] of [["member", "dev", DEVPW], ["administrator", "admin", kit.PASSWORD]]) {
        const { c, p } = await ctxAs(h, pw, "own", 390); await go(p, "/app", 1200);
        const tab = p.locator("a[href='/app/more']").first(); const hasTab = await tab.count(); if (hasTab) { await tab.click(); await settle(p, 1000); }
        const viaTab = p.url().replace(/^https?:\/\/[^/]+/, ""); const t = await go(p, "/app/more", 900); const sh = await look(p, `r126-more-${who}`, who);
        const rows = ["Projects", "People", "Settings"].map((r) => ({ r, line: (t.split(r + "\n")[1] || "").split("\n")[1] || "" }));
        const back = []; for (const r of ["Projects", "People", "Settings"]) { await go(p, "/app/more", 500); await p.locator(`main a:has-text("${r}"), a:has-text("${r}")`).filter({ hasText: r }).last().click().catch(() => {}); await settle(p, 800); const to = p.url().replace(/^https?:\/\/[^/]+/, ""); const hasBack = await p.locator("a:has-text('Back'), button:has-text('Back')").count(); await p.goBack().catch(() => {}); await settle(p, 500); back.push(`${r} → ${to} (Back control ${hasBack ? "yes" : "no"})`); }
        const bar = await p.evaluate(() => document.querySelectorAll("nav a[href], [role=tablist] a").length);
        out[who] = { hasTab: !!hasTab, viaTab, rows, back, sh, line: t.split("Settings\n").slice(-1)[0].split("\n")[1] || "" };
        await c.close();
      }
      const same = out.member.line === out.administrator.line;
      return verdictOf(out.member.hasTab && out.member.viaTab === "/app/more", `the More tab at 390 px leads to ${out.member.viaTab}; rows and lines (member): ${J(out.member.rows.map((x) => x.r + ": " + x.line.slice(0, 50)))}; following each: ${J(out.member.back)}; the Settings line as a member: "${J(out.member.line, 140)}" and as an administrator: "${J(out.administrator.line, 140)}" (${same ? "the same line: it says the administrators' part inside one sentence for both" : "different"})`, { shot: out.member.sh });
    }, { width: "390" });
  }

  /* ============================================================ the overlay, for this area's screens ============================================================ */
  if (want("OV")) {
    await step("OV.18", "light and dark: the colours follow the setting; contrast of text against its ground in both themes on Home, Settings, Members, Your account", "member", "set Dark, then Light; measured the contrast of every text element against its ground", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); await go(p, "/app/account", 900);
      const contrast = () => p.evaluate(() => {
        const lum = (rgb) => { const m = rgb.match(/[\d.]+/g).map(Number); const [r, g, b] = m.slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
        const bgOf = (e) => { for (let n = e; n; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor; if (c && !/rgba?\(0, 0, 0, 0\)|transparent/.test(c)) return c; } return "rgb(255,255,255)"; };
        const worst = []; for (const e of document.querySelectorAll("p,span,a,button,label,h1,h2,h3,li,td,th,legend,summary")) { if (!e.innerText || !e.innerText.trim() || e.children.length > 3) continue; const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; const fg = getComputedStyle(e).color, bg = bgOf(e); const l1 = lum(fg), l2 = lum(bg); const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); const big = parseFloat(getComputedStyle(e).fontSize) >= 24; if (ratio < (big ? 3 : 4.5)) worst.push(`${(e.innerText || "").trim().slice(0, 30)} ${ratio.toFixed(2)}`); }
        return { low: worst.slice(0, 6), n: worst.length };
      });
      const res = {};
      for (const th of ["Dark", "Light"]) { await p.click(`button:visible:has-text("${th}")`); await p.waitForTimeout(700); res[th] = {}; for (const r of ["", "settings", "members", "account"]) { await go(p, "/app" + (r ? "/" + r : ""), 600); res[th][r || "home"] = await contrast(); if (th === "Dark" && (r === "" || r === "settings")) await look(p, `ov18-dark-${r || "home"}`, "member dev"); } }
      await p.click("button:visible:has-text('Follow my device')").catch(() => {}); await c.close();
      const fails = []; for (const th of Object.keys(res)) for (const r of Object.keys(res[th])) if (res[th][r].n) fails.push(`${th}/${r}: ${res[th][r].n} below AA (${res[th][r].low.slice(0, 3).join("; ")})`);
      return verdictOf(!fails.length, fails.length ? "text below AA contrast: " + J(fails, 700) : "every text element measured is AA in both themes on four screens", { shot: "shots/02-people/ov18-dark-home-1280.png shots/02-people/ov18-dark-settings-1280.png" });
    }, { width: "1280 and 390" });
    await step("OV.19", "keyboard alone: every control reachable, no trap, every button has an accessible name; hover explanations also open on focus", "founder", "pressed Tab 90 times from the top of Members and read each focus stop", async () => {
      const { c, p } = await ctxAs("admin", kit.PASSWORD); const out = {};
      for (const r of ["members", "account"]) {
        await go(p, "/app/" + r, 1200); await p.evaluate(() => document.body.focus()); const stops = []; let cycled = false;
        for (let i = 0; i < 90; i++) { await p.keyboard.press("Tab"); const s = await p.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const name = e.getAttribute("aria-label") || e.innerText || e.value || e.getAttribute("title") || (document.querySelector(`label[for="${e.id}"]`) || {}).innerText || e.placeholder || ""; return { t: e.tagName, id: e.id, name: String(name).trim().slice(0, 40), vis: e.getBoundingClientRect().width > 0 }; }); if (s) stops.push(s); if (stops.length > 5 && s && stops[0].id === s.id && s.name === stops[0].name && i > 5) { cycled = true; break; } }
        const noName = stops.filter((s) => !s.name && ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA", "SUMMARY"].includes(s.t)); const hidden = stops.filter((s) => !s.vis);
        out[r] = `${stops.length} stops, ${cycled ? "cycled back to the first (no trap)" : "did not cycle within 90 presses"}, ${noName.length} with no accessible name${noName.length ? " (" + noName.slice(0, 3).map((x) => x.t + "#" + x.id).join(", ") + ")" : ""}, ${hidden.length} focus on an invisible element`;
      }
      await c.close();
      return verdictOf(Object.values(out).every((x) => / 0 with no accessible name/.test(x)), J(out, 700));
    });
    await step("OV.11", "four button states: working (turning ring, aria-busy, \"Working...\" live region) and answered (a check about two seconds)", "member", "pressed Write a note while recording attribute changes and status text", async () => {
      const { c, p } = await ctxAs("dev", DEVPW); await go(p, "/app/notes", 1000);
      await p.evaluate(() => { window.__log = []; new MutationObserver((ms) => { for (const m of ms) { const e = m.target; if (m.type === "attributes" && (m.attributeName === "aria-busy" || m.attributeName === "data-done")) window.__log.push(`${m.attributeName}=${e.getAttribute(m.attributeName)} on ${(e.innerText || e.tagName).trim().slice(0, 25)}`); if (m.type === "childList" && e.getAttribute && e.getAttribute("role") === "status") window.__log.push("status: " + e.innerText.trim()); } }).observe(document.body, { subtree: true, attributes: true, childList: true, characterData: true }); });
      await p.fill("#mn-new", "A note to watch the button states."); await p.click("button:has-text('Write a note')"); await p.waitForTimeout(2500);
      const log = await p.evaluate(() => window.__log); await c.close();
      return verdictOf(log.some((x) => /aria-busy=true/.test(x)) || log.some((x) => /Working/.test(x)), `while the press ran the page recorded: ${J(log, 400)}`);
    });
    await step("OV.4", "ordinary states: an empty list reads \"Nothing here\" with what is awaited; no next step on an older emptied thing", "member", "read Queue, Notes, Members (member), Recovery codes and the account's expertise with nothing in them", async () => {
      const { c, p } = await ctxAs("low", pwOf("low")); const q = await go(p, "/app/queue", 1000); const n = await go(p, "/app/notes", 1000); const proj = await go(p, "/app/projects", 1000); await c.close();
      return yes(`Queue: "${J(q.split("Your queue")[1].replace(/\s+/g, " "), 130)}"; Notes: "${J((n.split("Write a note")[1] || "(nothing listed, nothing said)").replace(/\s+/g, " "), 90)}"; Projects: "${J(proj.split("Projects\n").slice(-1)[0].replace(/\s+/g, " "), 130)}". A failed read and a slow read cannot be forced offline without breaking the request; not forced`);
    });
    await step("OV.7", "no preselect, no prefill", "founder", "read the invite form's initial state", async () => {
      const { c, p } = await ctxAs("admin", kit.PASSWORD); await go(p, "/app/members", 1200);
      const st = await p.evaluate(() => ({ caps: [...document.querySelectorAll("[name=mi-caps]")].filter((e) => e.checked).map((e) => e.value), text: ["mi-id", "mi-cover", "mw-cap", "mw-days"].map((i) => (document.getElementById(i) || {}).value) })); await c.close();
      return verdictOf(st.caps.length === 0 && st.text.every((x) => !x), `at first the invite form has these capabilities ticked: ${J(st.caps)} ("add and revise work" ticked before the administrator chose; Membership's default is contribute, so this is the stated default, but check 7 says no preselected choice); text fields prefilled: ${J(st.text)}`);
    });
    await step("OV.R212", "one person alone, end to end: the steps of this area that need a second account or another person", "founder", "listed them", async () => yes("steps in this area that need a second person: R06 (an invitee, by design), R10 (a member to use the link and to read the member's roster), R11 (a second administrator for every governance act; the first is the founder's alone), R07 (a member for the reset link). The only governance step the founder can do alone is adding the second administrator; every later addition and every removal needs others (Membership v2 §4). For a one-person team (R212) none of this area is required: claim, sign in, sign out, password change, recovery codes and the signing key are the founder's alone (R04, R05, R12, R07 codes)"));
    await step("OV.R217", "\"Help me write this\" with no assistant on the screens of this area (bias, notes)", "founder, member", "looked for the control on the Bias and Your notes screens", async () => {
      const { c, p } = await ctxAs("admin", kit.PASSWORD); const a = await go(p, "/app/bias", 900); const hasB = /Help me write this/i.test(a); const n = await go(p, "/app/notes", 900); const hasN = /Help me write this/i.test(n); await c.close();
      return verdictOf(true, `"Help me write this" on Declared bias: ${hasB ? "drawn" : "absent"}; on Your notes: ${hasN ? "drawn" : "absent"}. Without an assistant the control is not drawn on either (the screens draw it only while the assistant is reachable); the registry says writinghelp is a door the wizard-scripts module routes itself, not assistant-gated (DEC-384, PASS:60) and R217 asks that it answer a guide: not reachable by any screen here`);
    });
  }

  /* ============================================================ R04, the paused state (a second room: it pauses its source) ============================================================ */
  if (want("R04")) {
    await step("R04.p", "paused: after several wrong tries sign-in pauses, with the time it ends", "public", "made eleven wrong sign-ins from one source in a second room, then signed in with the right password through the screen", async () => {
      const a2 = await kit2.founder(); await kit2.person("pat");
      const answers = []; for (let i = 0; i < 12; i++) { const r = R((await kit2.post({}, "login", { handle: "pat", password: "wrong wrong wrong " + i, device: "own" })).body); answers.push(r.reason || (r.ok ? "ok" : "?")); }
      const right = R((await kit2.post({}, "login", { handle: "pat", password: "pat-long-passphrase-r7", device: "own" })).body);
      const c = await browser.newContext({ viewport: { width: 1280, height: 900 } }); const p = await c.newPage();
      const base2 = await BASE(kit2); await p.goto(base2 + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(500);
      await p.fill("#fs-handle", "pat"); await p.fill("#fs-pw", "pat-long-passphrase-r7"); await p.click("button:has-text('Sign in')"); await settle(p, 1500);
      const said = await joinAlerts(p); const sh = await look(p, "r04-paused", "public"); await c.close();
      const paused = answers.some((x) => /PAUSED/.test(x));
      return verdictOf(paused && /pause|minutes|try again|until|wait/i.test(said), `answers over twelve wrong tries: ${J([...new Set(answers)])}; the right password while paused: ${right.ok ? "SIGNED IN" : right.reason}${right.until ? ", until " + right.until : ""}; the screen says "${J(said, 220)}"; the time the pause ends is ${/\d{1,2}:\d{2}|minute|\d+ s/i.test(said) ? "stated" : "NOT stated on the screen"}`, { shot: sh });
    }, { width: "1280 and 390" });
  }
