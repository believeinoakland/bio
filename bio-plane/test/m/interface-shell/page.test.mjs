/* interface-shell R1, R2, R21, R23: the page as `interfacePage` composes it and the door serves it, and the screen
   contract it checks before composing anything. */
import test from "node:test";
import assert from "node:assert/strict";
import { interfacePage, NONCE_SLOT, SHELL_WORDS, PATHS, checkScreens } from "../../../src/interface-shell/index.mjs";
import { withPagePolicy } from "../../../src/answer-envelope/index.mjs";
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

test("R1 one document: <html lang> en until the member's language is read, one stylesheet link to interface-assets' civicsmith.css, the icon sprite absent (icons referenced from /app/assets/icons.svg), one script with the nonce slot, no member text outside the words", async () => {
  const html = interfacePage(ALL);
  assert.match(html, /^<!doctype html>\n<html lang="en">/);
  assert.deepEqual([...html.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]), ['<link rel="stylesheet" href="/app/assets/civicsmith.css">']);
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

test("R2 served through the door (answer-envelope R6), every script element carries the response's nonce, the policy names it and no slot is left", async () => {
  const res = await withPagePolicy(new Response(interfacePage(ALL), { headers: { "content-type": "text/html" } }));
  const policy = res.headers.get("content-security-policy");
  const nonce = /script-src 'nonce-([^']+)'/.exec(policy)[1];
  const body = await res.text();
  assert.equal(body.includes(NONCE_SLOT), false);
  const s = scripts(body);
  assert.equal(s.length, 1);
  for (const attrs of s) assert.equal(/\bnonce="([^"]*)"/.exec(attrs)[1], nonce);
  assert.doesNotMatch(policy, /script-src[^;]*unsafe/);
});

test("R21 interfacePage throws, naming the screen, for a screen whose id is not in SCREEN_REGISTRY, an act naming an op OPS does not hold, or an op neither the registry's for that screen nor a named re-point; a valid set and the three re-points pass", () => {
  const bad = (s, re) => assert.throws(() => interfacePage([s]), re);
  bad({ ...HOME, id: "nowhere" }, /nowhere.*SCREEN_REGISTRY/);
  bad({ ...HOME, acts: [{ op: "notanop" }] }, /home.*notanop.*OPS/);
  bad({ ...HOME, acts: [{ op: "retire" }] }, /home.*retire.*registry/);
  bad({ ...HOME, id: "home", render: undefined }, /home/);
  assert.throws(() => interfacePage([HOME, HOME]), /home.*twice/);
  assert.ok(interfacePage(ALL).length > 1000);
  const r = (id, op) => ({ id, render: () => "", acts: [{ op }] });
  assert.equal(checkScreens([r("capture", "captureupload"), r("connect", "subscriptionsignin"), r("answers", "ask")]), true);
  assert.equal(checkScreens([r("connect", "subscriptiondisconnect")]), true);
  assert.throws(() => checkScreens([r("home", "captureupload")]), /home.*captureupload/);
  assert.equal(checkScreens([{ ...DOCUMENT }]), true);
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

