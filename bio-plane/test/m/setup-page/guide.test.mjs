/* R27 (F10; K1874 (Q6): DEC-2 is not reopened) and R14's link to it: the guide to replacing the one-time password in the
   hosting account, part of the page. Read from the bytes `pageOf` answers, and driven in the fixture's sandbox: a link
   to ROTATION_GUIDE_HREF, from the claim's slot (the block instance-setup places there) or from members and keys, opens
   the guide signed out or in, its fragment stripped, and Back returns to where the reader was; opening it sends
   nothing. */
import test from "node:test";
import assert from "node:assert/strict";
import { pageOf, PAGE_HTML, HOSTING_SLOT, ROTATION_GUIDE_HREF } from "../../../src/setup-page/index.mjs";
import { pageOver } from "./fixture.mjs";

const tick = () => new Promise((r) => setTimeout(r, 0));
const settle = async () => { for (let i = 0; i < 30; i++) await tick(); };
const section = (html, id) => (html.match(new RegExp(`<section id="${id}">[^]*?</section>`)) || [""])[0];
const text = (html) => html.replace(/<!--[^]*?-->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

/* A plane that answers the public reads and, signed in, an administrator's whoami; `sent` records each op. */
function plane({ claimed = false } = {}) {
  const sent = [];
  const fetch = async (url, init) => {
    const op = new URL(url, "https://copy.example").searchParams.get("op");
    sent.push(op);
    const out = op === "bootstrap" ? { claimed, bootstrapConfigured: true }
      : op === "whoami" ? { result: { capabilities: ["contribute"], administer: true } }
      : op === "profiles" ? { result: { ok: true, profiles: [], conflicts: [], choices: [] } } : { result: { ok: true } };
    return { ok: true, status: 200, json: async () => out };
  };
  return { sent, fetch };
}

test("R27 the page carries the guide in plain steps: sign in to the hosting account; make a new long random value with a password manager's generator, at least 32 characters; replace ADMIN_TOKEN in the Worker's settings' secrets; at once claim again with the new value and choose the founder's password; keep it where the hosting account's sign-in is kept", () => {
  const g = section(PAGE_HTML, "s-rotate");
  assert.ok(g, "the guide is a section of the page");
  const steps = [...(g.match(/<ol id="rt-steps">([^]*?)<\/ol>/) || ["", ""])[1].matchAll(/<li>([^]*?)<\/li>/g)].map((m) => text(m[1]).trim());
  assert.equal(steps.length, 5);
  assert.match(steps[0], /^Sign in to the hosting account \( Cloudflare \)\.$/);
  assert.match(steps[1], /password manager's generator: at least 32 characters\.$/);
  assert.match(steps[2], /^Open your group's Civicsmith's Worker, then its settings' secrets, and replace ADMIN_TOKEN with the new value\.$/);
  assert.match(steps[3], /^At once, come back to this page and claim your group's Civicsmith again with the new value, choosing the founder's password\. A replaced one-time password lets whoever holds the new value claim it/);
  assert.match(steps[4], /^Keep the new value where the hosting account's sign-in is kept, never in a message or a shared document\.$/);
  /* when to do it, and what does not change */
  const when = [...(g.match(/<ul id="rt-when">([^]*?)<\/ul>/) || ["", ""])[1].matchAll(/<li>([^]*?)<\/li>/g)].map((m) => text(m[1]).trim());
  assert.deepEqual(when, ["The value may have been seen by someone else.", "Someone who held the hosting account leaves.", "After any use of it but the claim."]);
  assert.match(g, /<p id="rt-same">The record, the members, their passwords and their keys stay as they are\.<\/p>/);
  /* part of the page, holding no secret and reading nothing: no field, no form, and the hosting provider's sign-in is a link */
  assert.doesNotMatch(g, /<(?:input|textarea|select|form|button)\b/);
  assert.match(g, /<a class="filelink" href="https:\/\/dash\.cloudflare\.com\/" target="_blank"\s+rel="noopener">Cloudflare<\/a>/);
  assert.deepEqual([...g.matchAll(/\b(?:src|srcset)\s*=/g)], [], "nothing loaded from another origin");
  /* the guide is reached from members and keys */
  assert.match(section(PAGE_HTML, "s-members"), new RegExp(`<a class="filelink" href="${ROTATION_GUIDE_HREF}">How to replace the one-time password`));
});

test("R14 R27 the claim's slot block's mention of the guide is a link to it: a link to ROTATION_GUIDE_HREF placed in HOSTING_SLOT opens the guide on the claim screen, signed out, its fragment stripped, sending nothing; Back returns to the claim", async () => {
  assert.equal(ROTATION_GUIDE_HREF, "#replace-one-time-password");
  const block = `<div class="notice" id="hosting-control"><p>If the one-time password may have been seen, replace it:
    <a href="${ROTATION_GUIDE_HREF}">the guide</a>.</p></div>`;
  const composed = pageOf({ answered: true, result: { ok: true, group: "river-town" } }).replace(HOSTING_SLOT, () => block);
  assert.ok(section(composed, "s-claim").includes(`<a href="${ROTATION_GUIDE_HREF}">`));
  const pl = plane();
  const p = pageOver({ html: composed, hash: "#boot=one-time", fetch: pl.fetch });
  await settle();
  assert.deepEqual(p.shown(), ["#s-claim"]);
  const before = pl.sent.length, rewrites = p.replaced();
  p.sandbox.location.hash = ROTATION_GUIDE_HREF; await p.hashchange(); await settle();   // the link followed
  assert.deepEqual(p.shown(), ["#s-rotate"]);
  assert.equal(p.sandbox.location.hash, "", "the fragment is stripped at once");
  assert.equal(p.replaced(), rewrites + 1);
  assert.equal(pl.sent.length, before, "opening the guide reads nothing");
  assert.equal(p.el("#boot").value, "one-time", "the claim form is as the founder left it");
  await p.el("#rt-back").fire(); await settle();
  assert.deepEqual(p.shown(), ["#s-claim"]);
  /* another fragment is not the guide's */
  p.sandbox.location.hash = "#elsewhere"; await p.hashchange(); await settle();
  assert.deepEqual(p.shown(), ["#s-claim"]);
});

test("R27 reached from members and keys, signed in, and from an address carrying the guide's fragment on load; Back returns to members and keys, or, arriving by the address, to the page's own start", async () => {
  const pl = plane({ claimed: true });
  const p = pageOver({ html: PAGE_HTML, session: { t: "sess-1", e: 0, w: "admin" }, fetch: pl.fetch });
  await settle();
  await p.el("#go-members").fire(); await settle();
  assert.deepEqual(p.shown(), ["#s-members"]);
  p.sandbox.location.hash = ROTATION_GUIDE_HREF; await p.hashchange(); await settle();
  assert.deepEqual(p.shown(), ["#s-rotate"]);
  await p.el("#rt-back").fire(); await settle();
  assert.deepEqual(p.shown(), ["#s-members"]);
  /* arriving by the address: the guide first, and Back is the page's own start (here, sign-in) */
  const q = plane({ claimed: true });
  const r = pageOver({ html: PAGE_HTML, hash: ROTATION_GUIDE_HREF, fetch: q.fetch });
  await settle();
  assert.deepEqual([r.shown(), r.sandbox.location.hash, q.sent], [["#s-rotate"], "", []]);
  await r.el("#rt-back").fire(); await settle();
  assert.deepEqual(r.shown(), ["#s-login"]);
});
