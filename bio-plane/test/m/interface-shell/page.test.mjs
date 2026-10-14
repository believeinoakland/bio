/* interface-shell R1, R2, R21, R23: the page as `interfacePage` composes it and the door serves it, and the screen
   contract it checks before composing anything. */
import test from "node:test";
import assert from "node:assert/strict";
import { interfacePage, NONCE_SLOT, SHELL_WORDS, PATHS, checkScreens } from "../../../src/interface-shell/index.mjs";
import { SCREEN_REGISTRY } from "../../../src/wizard-scripts/index.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { randomBytes } from "node:crypto";
import { boot, ok, scriptOf } from "./harness.mjs";
import { ALL, HOME, DOCUMENT } from "./screens.fixture.mjs";
import { documentOf, textNodes } from "./dom.mjs";

const scripts = (html) => [...html.matchAll(/<script\b([^>]*)>/gi)].map((m) => m[1]);
const handlers = (html) => {
  const out = [];
  for (const [tag, attrs] of [...String(html).matchAll(/<[a-z][\w-]*\b([^>]*)>/gi)].map((m) => [m[0], m[1]]))
    for (const [, name, raw = ""] of attrs.matchAll(/([^\s=/>"']+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g)) {
      const value = raw.replace(/^["']|["']$/g, "").trim();
      if (/^on/i.test(name) || (/^(?:href|src|action|formaction|xlink:href)$/i.test(name) && /^javascript:/i.test(value))) out.push(tag);
    }
  return out;
};
const IMAGE = ok({ title: "A lease", pages: 3, grade: "B", why: "withheld", project: { id: "P1", title: "Pothole repairs" }, passages: [{ n: 1, text: "Closed" }] });

test("R1 R56 one document: <html lang> en until the member's language is read, interface-assets' civicsmith.css and then shell.css linked before the shell's own style, the icon sprite absent (icons referenced from /app/assets/icons.svg), one script with the nonce slot, no member text outside the words", async () => {
  const html = interfacePage(ALL);
  assert.match(html, /^<!doctype html>\n<html lang="en">/);
  assert.deepEqual([...html.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]), ['<link rel="stylesheet" href="/app/assets/civicsmith.css">', '<link rel="stylesheet" href="/app/assets/shell.css">']);
  assert.ok(html.indexOf("shell.css") < html.indexOf("<style>"), "both before the shell's own style");
  assert.doesNotMatch(html, /<symbol\b|<svg[^>]*>\s*<defs/, "no inline sprite");
  assert.equal(scripts(html).length, 1);
  assert.equal(scripts(html)[0].trim(), `nonce="${NONCE_SLOT}"`);
  const before = documentOf(html);
  assert.deepEqual(textNodes(before.body).map((t) => t.data.trim()).filter(Boolean), [], "no text but the script's words");
  assert.equal(/<title>([^<]*)<\/title>/.exec(html)[1], "", "even the title is drawn from the words");
  const p = await boot({ screens: ALL, path: "/app/document/c1", plane: { image: IMAGE, interfacewords: ok({ ok: true, language: "es", words: [{ key: "rail.home.name", text: "Inicio", en: "Home", fallback: false }] }) } });
  assert.equal(p.doc.documentElement.getAttribute("lang"), "es");
  const uses = p.root().querySelectorAll("use").map((u) => u.getAttribute("href"));
  assert.ok(uses.length > 5);
  for (const u of uses) assert.match(u, /^\/app\/assets\/icons\.svg#i-[a-z-]+$/);
  /* control: before the language is read the page says en */
  const q = await boot({ screens: ALL, plane: { interfacewords: ok({ ok: true, language: null, words: [] }) } });
  assert.equal(q.doc.documentElement.getAttribute("lang"), "en");
});

test("R1 no secret: the page holds no session token or key, and the session it reads is the browser's, never the page's", async () => {
  const html = interfacePage(ALL);
  assert.doesNotMatch(html, /Bearer [A-Za-z0-9]|sk-ant|ADMIN_TOKEN/);
});

test("R2 no resource on another origin in any src, href, @import, url() or fetch, and no typeface but interface-assets' (the page loads none itself)", async () => {
  const html = interfacePage(ALL);
  for (const m of html.replace(/<script[\s\S]*<\/script>/, "").matchAll(/\b(?:src|href)\s*=\s*"([^"]*)"/g)) assert.match(m[1], /^\/(?!\/)/, m[0]);
  assert.doesNotMatch(html, /@import|@font-face|url\(\s*["']?(?:https?:|\/\/)/i);
  assert.doesNotMatch(scriptOf(html), /https?:\/\/|["'`]\/\//, "the script names no other origin");
  const p = await boot({ screens: ALL, path: "/app/document/c1", plane: { image: IMAGE } });
  for (const el of p.root().querySelectorAll("[href], [src]")) assert.match(el.getAttribute("href") || el.getAttribute("src"), /^\/(?!\/)/);
  assert.ok(p.requests.length > 3);
  for (const r of p.requests) assert.match(r.url, /^\/api\/\?op=/);
});

test("R2 no inline event-handler attribute, no javascript: address and no script made from a string, in the page or anything it draws", async () => {
  const html = interfacePage(ALL);
  assert.deepEqual(handlers(html.replace(/<script[\s\S]*<\/script>/, "")), []);
  assert.doesNotMatch(scriptOf(html), /\beval\s*\(|new\s+Function\b|setTimeout\(\s*["'`]|setInterval\(\s*["'`]|javascript:/);
  for (const path of ["/app", "/app/held", "/app/document/c1", "/app/members", "/app/settings"]) {
    const p = await boot({ screens: ALL, path, plane: { image: IMAGE, heldcaptures: ok({ items: [{ id: "h1", title: "Minutes", at: "2026-10-01" }] }) } });
    assert.deepEqual(handlers(p.root().innerHTML), [], path);
  }
  /* control: the checker finds one */
  assert.equal(handlers('<a href="javascript:x">a</a><b onclick="x">b</b>').length, 2);
});

/* One response as the door makes it (answer-envelope R6, which is not in this module's uses; its own test and control-plane's
   end-to-end suite serve this page through the real door): a fresh 128-bit nonce, its policy, every slot filled. */
const door = (html) => { const nonce = randomBytes(16).toString("base64"); return { policy: `default-src 'self'; script-src 'nonce-${nonce}'`, body: html.split(NONCE_SLOT).join(nonce) }; };

test("R2 served as the door serves it, every script element carries the response's nonce, the policy names it, two responses differ and no slot is left", async () => {
  const [a, b] = [door(interfacePage(ALL)), door(interfacePage(ALL))];
  assert.notEqual(a.policy, b.policy);
  for (const { policy, body } of [a, b]) {
    const nonce = /script-src 'nonce-([^']+)'/.exec(policy)[1];
    assert.equal(body.includes(NONCE_SLOT), false);
    const s = scripts(body);
    assert.equal(s.length, 1);
    for (const attrs of s) assert.equal(/\bnonce="([^"]*)"/.exec(attrs)[1], nonce);
  }
  assert.equal(interfacePage(ALL).split(NONCE_SLOT).length - 1, 1, "the slot is nowhere but in the script's nonce");
});

test("R21 interfacePage throws, naming the screen, for a screen whose id is not in SCREEN_REGISTRY, an act naming an op OPS does not hold, or an op neither the registry's for that screen nor a named re-point; a valid set passes", () => {
  const bad = (s, re) => assert.throws(() => interfacePage([s]), re);
  bad({ ...HOME, id: "nowhere" }, /nowhere.*SCREEN_REGISTRY/);
  bad({ ...HOME, acts: [{ op: "notanop" }] }, /home.*notanop.*OPS/);
  bad({ ...HOME, acts: [{ op: "retire" }] }, /home.*retire.*registry/);
  bad({ ...HOME, id: "home", render: undefined }, /home/);
  assert.throws(() => interfacePage([HOME, HOME]), /home.*twice/);
  assert.ok(interfacePage(ALL).length > 1000);
  const r = (id, op) => ({ id, render: () => "", acts: [{ op }] });
  assert.throws(() => checkScreens([r("home", "captureupload")]), /home.*captureupload/);
  assert.equal(checkScreens([{ ...DOCUMENT }]), true);
});

test("R38 R21 admits only the registry's ops, infolevelset, and two re-points until the registry lists them (ratify on ceremony, unlock on front); R28's four re-points and R21's three T46 ones are retired: a screen naming an unlisted op throws at interfacePage", () => {
  const r = (id, ...ops) => ({ id, render: () => "", acts: ops.map((op) => ({ op })) });
  const listed = (id, op) => SCREEN_REGISTRY.find((s) => s.id === id).acts.includes(op);
  assert.equal(checkScreens([r("ceremony", "ratify")]), true);
  assert.equal(checkScreens([r("account", "infolevelset"), r("home", "infolevelset")]), true);
  assert.equal(checkScreens([r("front", "unlock", "login")]), true);
  /* each T46 and T47 re-point stands only where the registry itself now lists it */
  for (const [id, op] of [["capture", "captureupload"], ["connect", "subscriptionsignin"], ["connect", "subscriptiondisconnect"], ["answers", "ask"], ["capture", "monitorset"], ["project", "projectbarset"], ["project", "drawquestion"], ["calculation", "spotcheckvisit"]]) {
    if (listed(id, op)) assert.equal(checkScreens([r(id, op)]), true, id + " " + op);
    else assert.throws(() => checkScreens([r(id, op)]), new RegExp(id + ".*" + op), id + " " + op);
  }
  /* control: an op OPS holds, listed on no screen it names, throws naming both */
  assert.throws(() => interfacePage([r("project", "strengthbarset")]), /project.*strengthbarset/);
  assert.throws(() => interfacePage([r("home", "ratify")]), /home.*ratify/);
  assert.throws(() => interfacePage([r("doorbell", "cite")]), /doorbell/);
});

test("R30 a screen of the public or published frame naming an act that is not a public op throws at interfacePage", () => {
  const r = (id, op) => ({ id, render: () => "", acts: [{ op }] });
  assert.equal(checkScreens([r("doorbell", "knock")]), true);
  const pub = SCREEN_REGISTRY.find((s) => s.id === "published");
  const member = pub.acts.find((op) => OPS[op] && OPS[op].classes !== null);
  if (member) assert.throws(() => checkScreens([r("published", member)]), /published.*public/);
  assert.equal(SCREEN_REGISTRY.find((s) => s.id === "doorbell").acts.includes("knock"), true);
});

test("R23 no place is named in the shell's behaviour or words: its words, paths and program name none", () => {
  const PLACES = /Oakland|California|Alameda|Coliseum|Lakeshore|San Francisco|Berkeley|United States|\bCity of\b/;
  for (const [k, en] of SHELL_WORDS) assert.doesNotMatch(en, PLACES, k);
  assert.doesNotMatch(JSON.stringify(PATHS), PLACES);
  assert.doesNotMatch(scriptOf(interfacePage([])), PLACES);
  /* control: the pattern finds one */
  assert.match("the Coliseum lease", PLACES);
});

test("R5 the shell's own words: frozen [key, en, protected] rows, keys shell.<part>, distinct", () => {
  assert.ok(Object.isFrozen(SHELL_WORDS));
  const keys = new Set();
  for (const r of SHELL_WORDS) {
    assert.ok(Object.isFrozen(r));
    assert.equal(r.length, 3);
    assert.match(r[0], /^shell\.[a-z.-]+$/);
    assert.equal(typeof r[1], "string");
    assert.equal(typeof r[2], "boolean");
    assert.ok(!keys.has(r[0]), r[0]);
    keys.add(r[0]);
  }
});


test("R21 (K3297) a screen's functions may use Intl beside JSON, Math, String, Number, Array, Object and Date: composed and drawn, a language's name read through it", async () => {
  const s = { id: "account", reads: () => ({}), acts: [], render: (cs) => "<p id=lang>" + cs.esc(new Intl.DisplayNames(["en"], { type: "language" }).of("es")) + "</p>" };
  assert.ok(interfacePage([s]).length > 1000);
  const p = await boot({ screens: [s], path: "/app/account" });
  assert.equal(p.doc.getElementById("lang").textContent, "Spanish");
});
