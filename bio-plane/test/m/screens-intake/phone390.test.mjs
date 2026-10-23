/* screens-intake R2, R4, R7, R47 (T51 fix round 3, C81; SCREENS-INTAKE #14): the capture, Held and Inbox screens at 390 px, measured in a
 * browser. The page the shell serves, with the served stylesheets, is drawn in Chromium over this module's real `SCREENS` and a scripted
 * plane (per op); every control's width and height and every part's edge are measured. Needs `playwright-core` (found beside the product, as
 * interface-shell's `phone390.test.mjs` finds it) and Chromium (CHROMIUM, or /opt/pw-browsers/chromium); without them it fails, saying so. */
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { interfacePage, interfaceScript, scriptPath } from "../../../src/interface-shell/index.mjs";
import { ASSET_FILES } from "../../../src/interface-assets/index.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import "./page.mjs"; /* registers the owners' op declarations the screens send, as the plane does at start-up */

const root = (p) => fileURLToPath(new URL("../../../../" + p, import.meta.url));
function engine() {
  const homes = ["site/node_modules/", "bio-plane/src/journey-check/node_modules/", "bio-plane/node_modules/"].map(root).concat(["/opt/node-tools/node_modules/"]);
  for (const home of homes) {
    try { return createRequire(home + "noop.js")("playwright-core"); } catch { /* the next */ }
  }
  return null;
}
const EXE = process.env.CHROMIUM || "/opt/pw-browsers/chromium";

const SHA = "a".repeat(64), LONG = "A-very-long-member-name-or-digest-that-has-no-break-at-all-0123456789abcdef0123456789abcdef0123456789abcdef";
const ME = { session: true, member: "mai", handle: "mai", tokenClass: "member", administer: true, capabilities: ["contribute", "create_projects", "publish"], display_name: "A team with a very long name that wraps" };
const ADDRESS = "https://records.example-city.gov/agendas/2026-10-14-regular-meeting-of-the-board-of-supervisors.pdf";
const held = (extra = {}) => ({ bundle_id: "INFO-2026-0010-street-survey", title: "Street survey of the Seminary Avenue corridor, 2026", project: "PROJ-1", age_days: 2, eligible: true,
  capture: { sha256: SHA, grade: null }, source: { address: ADDRESS }, captured_for: { questions: [], withheld: null }, ...extra });
const PLANE = {
  whoami: ME,
  memberlist: { members: [{ member_id: "mai", handle: "mai" }, { member_id: "rosa", handle: "Rosa-with-a-long-handle" }] },
  projectlist: { projects: [{ id: "PROJ-1", name: "Pothole repairs" }, { id: "PROJ-2", name: "Housing repairs with a long name that wraps at the phone width" }] },
  opencaptures: { ok: true, captures: [{ session: "S-1", locator: ADDRESS, primary_sha: SHA, started: "2026-10-01T00:00:00Z", outstanding: 3 }], truncated: false },
  heldcaptures: { ok: true, held: [held(), held({ bundle_id: "INFO-2026-0011-b", title: LONG, eligible: false, class: "crucial", also_here: { home: "PROJ-2" }, project: "PROJ-2" }),
    held({ bundle_id: "INFO-2026-0012-c", title: "A photo", source: { address: `upload:${SHA}`, via: "upload" }, actor: "member:rosa", retrieved: "2026-10-04T10:00:00Z", bytes: 2300 })], truncated: false },
  capturerequests: { ok: true, requests: [
    { request: "CR-1", host: "records.example-city.gov", address: ADDRESS, state: "refused", source_reason: "login", requested_at: "2026-10-15T10:00:00Z", principal_plane: "member:mai", attempts: 1 },
    { request: "CR-2", host: "agendas.example.org", address: ADDRESS, state: "requested", requested_at: "2026-10-15T10:00:00Z", principal_plane: "member:mai" }] },
  capturecredentiallist: { ok: true, entries: [{ credential: "CRED-1", kind: "login", host: "records.example-city.gov", scope: "group", project: null, supplied_by: "member:rosa", supplied_at: "2026-10-16T09:00:00Z", withdrawn_at: null }], limit: 200, truncated: false },
  heldat: { ok: true, held: false, copy: null, versions: 0, truncated: false, changed: { state: "undetermined" } },
  search: { hits: [{ bundle_id: "INQ-2026-0001-seven-days", title: "Seven days" }] },
  inbox: { inbox: [
    { knock_id: "KNOCK-2026-10-03-9c1f0a2b", sha256: SHA, bytes: 3145728, note: "Sheets.", received: "2026-10-03T10:00:00Z", status: "new", pseudonym: "P-1", knocker_digest: "dd", file_name: "agenda-october-regular-meeting.pdf", media_type: "application/pdf" },
    { knock_id: "KNOCK-2026-09-12-11aa22bb", sha256: "b".repeat(64), bytes: 500, note: null, received: "2026-09-12T10:00:00Z", status: "discarded", resolve_reason: "A duplicate.", pseudonym: "P-1", knocker_digest: "dd" }] },
  inboxget: { ok: true, item: { knock_id: "KNOCK-2026-10-03-9c1f0a2b", sha256: SHA, bytes: 3145728, note: "Sheets.", received: "2026-10-03T10:00:00Z", status: "new", pseudonym: "P-1", knocker_digest: "dd", file_name: "agenda-october-regular-meeting.pdf", media_type: "application/pdf" } },
  sourceof: { ok: true, sourceId: null },
};

async function measure(path, width, interact = async () => {}, over = {}) {
  const pw = engine();
  assert.ok(pw && pw.chromium, "playwright-core is needed beside the product (`npm ci` in site/), with Chromium: this test cannot measure without them");
  assert.ok(existsSync(EXE), "Chromium is needed at CHROMIUM or /opt/pw-browsers/chromium");
  const html = interfacePage(SCREENS), script = interfaceScript(SCREENS);
  const browser = await pw.chromium.launch({ executablePath: EXE });
  try {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    await ctx.addInitScript(() => localStorage.setItem("bio-session", JSON.stringify({ t: "tok", e: 0, d: "own", w: "mai" })));
    const page = await ctx.newPage();
    await page.route("**/*", async (r) => {
      const u = new URL(r.request().url());
      if (u.pathname.startsWith("/app/assets/")) {
        const f = ASSET_FILES[u.pathname.slice("/app/assets/".length)];
        if (!f) return r.fulfill({ status: 404, body: "" });
        return r.fulfill({ status: 200, contentType: f.type, body: f.encoding === "base64" ? Buffer.from(f.body, "base64") : f.body });
      }
      if (u.pathname === "/api/" || u.pathname === "/api") {
        const op = u.searchParams.get("op");
        return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, result: (over[op] !== undefined ? over[op] : PLANE[op]) === undefined ? {} : (over[op] !== undefined ? over[op] : PLANE[op]) }) });
      }
      if (u.pathname === scriptPath("0")) return r.fulfill({ status: 200, contentType: "text/javascript", body: script });
      if (u.pathname === "/version") return r.fulfill({ status: 200, contentType: "text/plain", body: "v1\n" });
      return r.fulfill({ status: 200, contentType: "text/html", body: html });
    });
    await page.goto("https://group.example" + path);
    await page.waitForSelector("#cs-main .mk-h", { timeout: 15000 });
    await page.waitForTimeout(400);
    await interact(page);
    await page.evaluate(() => document.querySelectorAll("#cs-main details").forEach((d) => { d.open = true; }));
    await page.waitForTimeout(200);
    return await page.evaluate((W) => {
      const seen = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
      const out = { mainScroll: document.getElementById("cs-main").scrollWidth, over: [], small: [], thumbs: [], controls: 0 };
      for (const e of document.querySelectorAll("#cs-main *")) {
        if (!seen(e) || e.closest(".tw")) continue;
        const r = e.getBoundingClientRect();
        if (r.right > W + 0.5 || r.left < -0.5) out.over.push(e.localName + "." + e.className + " " + Math.round(r.left) + "-" + Math.round(r.right) + " " + (e.textContent || "").slice(0, 24));
        if (e.matches("a, button, input, select, textarea, summary, [role=tab]")) {
          out.controls++;
          const t = e.matches("input[type=checkbox], input[type=radio]") && e.closest("label") ? e.closest("label").getBoundingClientRect() : r;
          if (t.height < 43.5 || t.width < 43.5) out.small.push(e.localName + "." + (e.className || "") + " " + Math.round(t.width) + "x" + Math.round(t.height) + " " + (e.textContent || "").slice(0, 24));
        }
      }
      for (const t of document.querySelectorAll("#cs-main .mk-thumb")) { const r = t.getBoundingClientRect(); out.thumbs.push({ w: Math.round(r.width), h: Math.round(r.height), text: t.textContent.trim().length }); }
      return out;
    }, width);
  } finally { await browser.close(); }
}

const press = (sel) => async (page) => { await page.click(sel); await page.waitForTimeout(400); };
const HELD_COPY = { ok: true, held: true, copy: { sha256: SHA, document: "INFO-2026-0042-held", project: null, retrieved: "2026-09-14T10:30:00Z", actor: "member:rosa", grade: null, address: ADDRESS },
  versions: 1, truncated: false, changed: { state: "changed", basis: "x", as_of: null, earlier_differs: true } };
const SCREEN_PATHS = [
  ["Add (address tab) with a login-turned request, its logins pressed open", "/app/capture/address/PROJ-1", press('button[data-act="capturecredentiallist"]'), {}],
  ["Add (address tab) with an address already held and changed since", "/app/capture/address", async (page) => { await page.fill("#ci-address", ADDRESS); await press('button[data-act="acquire"]')(page); }, { heldat: HELD_COPY }],
  ["Add (file tab)", "/app/capture/file/PROJ-1", async () => {}, {}],
  ["Add (what I saw tab)", "/app/capture/saw", async () => {}, {}],
  ["Held", "/app/held", async () => {}, {}],
  ["Held with a row picked (the hold strip)", "/app/held/PROJ-1", async (page) => { await page.click("input.mk-pick"); await page.waitForTimeout(300); }, {}],
  ["Inbox, a knock opened", "/app/inbox/KNOCK-2026-10-03-9c1f0a2b", async () => {}, {}],
  ["Inbox, a discarded knock opened (put it back)", "/app/inbox/KNOCK-2026-09-12-11aa22bb", async () => {},
    { inboxget: { ok: true, item: { knock_id: "KNOCK-2026-09-12-11aa22bb", sha256: "b".repeat(64), bytes: 500, note: null, received: "2026-09-12T10:00:00Z", status: "discarded", resolve_reason: "A duplicate.", pseudonym: "P-1", knocker_digest: "dd" } } }],
];

for (const [name, path, interact, over] of SCREEN_PATHS) {
  test(`R4 R7 R47 (C81) ${name}: at 390 px nothing runs past the screen and every control is at least 44 px to press; at 1280 px the layout is the desktop's`, { timeout: 180000 }, async () => {
    const m = await measure(path, 390, interact, over);
    assert.ok(m.controls > 3, "the screen drew its controls: " + m.controls);
    assert.ok(m.mainScroll <= 390, "the main area is no wider than the screen: " + m.mainScroll);
    assert.deepEqual(m.over, [], "nothing past the edge");
    assert.deepEqual(m.small, [], "every target is at least 44 px");
    for (const t of m.thumbs) assert.ok(t.w >= 44 && t.h >= 44, "Open the file is a 44 px target: " + JSON.stringify(t));
    const d = await measure(path, 1280, interact, over);
    assert.ok(d.mainScroll <= 1280, "control: the desktop page is no wider than the screen");
    for (const t of d.thumbs) assert.ok(t.w >= 44 && t.h >= 44, "and its Open the file keeps its width there: " + JSON.stringify(t));
  });
}
