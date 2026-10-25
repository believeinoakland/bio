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
  catch (e) { bad(id, check, role, did, "the script's step threw: " + J(String(e && e.message || e), 400), o); }
}
const yes = (saw, extra = {}) => ({ verdict: "WORKS", saw, ...extra });
const no = (saw, extra = {}) => ({ verdict: "BROKEN", saw, ...extra });
const cant = (saw, extra = {}) => ({ verdict: "NOT REACHED", saw, ...extra });
const verdictOf = (cond, saw, extra) => (cond ? yes(saw, extra) : no(saw, extra));
/* overlay findings: only what fails, per screen (checks 15, 17, 20, 31) */
const overlay = [];
function ov(check, screen, width, role, saw, shot = "") { overlay.push({ check, screen, width, role, saw, shot }); appendFileSync(REC.replace(".md", "-overlay.tmp"), [`OV${check}`, screen, width, role, saw, shot].join(" | ").replace(/\n/g, " ") + "\n"); }

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
async function go(pg, path, ms) { await pg.goto((await BASE()) + path, { waitUntil: "networkidle" }).catch(() => {}); await settle(pg, ms); return body(pg); }
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
  const ctxAs = async (handle, pw, device = "own", width = 1280) => { const c = await ctxOf(width); const p = await c.newPage(); await uiSignIn(p, handle, pw, device); return { c, p }; };

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
