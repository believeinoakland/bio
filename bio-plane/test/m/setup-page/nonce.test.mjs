/* R28 (F17; K1881; answer-envelope R6): every script element of the page carries the nonce of the response that serves
   it, so the page runs under a policy that allows no inline script without that nonce. Read at the interface: the bytes
   `pageOf` answers, served as the door is to serve them (answer-envelope R6, T35-80: a fresh 128-bit nonce per response,
   `script-src 'nonce-<n>'`, every NONCE_SLOT filled), and the page's script run in the fixture's sandbox through its
   sections with every way of making a script from a string trapped. The fetch through the real door is answer-envelope
   R6's own test. */
import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { pageOf, PAGE_HTML, NONCE_SLOT, HOSTING_SLOT } from "../../../src/setup-page/index.mjs";
import { pageOver, hostileSecurity } from "./fixture.mjs";

const tick = () => new Promise((r) => setTimeout(r, 0));
const settle = async () => { for (let i = 0; i < 30; i++) await tick(); };

/* One response as the door is to make it: a fresh nonce, its policy, and the body with every slot filled. */
const serve = (html) => {
  const nonce = randomBytes(16).toString("base64");
  return { nonce, policy: `default-src 'self'; script-src 'nonce-${nonce}'`, body: html.split(NONCE_SLOT).join(nonce) };
};
const scripts = (html) => [...html.matchAll(/<script\b([^>]*)>/gi)].map((m) => m[1]);
const nonceOf = (attrs) => (/\bnonce="([^"]*)"/.exec(attrs) || [])[1] ?? null;
/* inline handlers and `javascript:` addresses, what a nonce-based policy would refuse to run: each tag's attributes read
   as attributes (an escaped value is text, never an attribute), a name beginning `on`, or an address attribute whose
   value is a `javascript:` address */
const handlers = (html) => {
  const out = [];
  for (const [tag, attrs] of [...String(html).matchAll(/<[a-z][\w-]*\b([^>]*)>/gi)].map((m) => [m[0], m[1]]))
    for (const [, name, raw = ""] of attrs.matchAll(/([^\s=/>"']+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g)) {
      const value = raw.replace(/^["']|["']$/g, "").trim();
      if (/^on/i.test(name) || (/^(?:href|src|action|formaction|xlink:href)$/i.test(name) && /^javascript:/i.test(value))) out.push(tag);
    }
  return out;
};
const PAGES = [PAGE_HTML, pageOf(undefined), pageOf({ answered: true, result: { ok: true, group: null } }),
  pageOf({ answered: true, result: { ok: true, group: "river-town", display_name: "River Town" } })];

test("R28 every <script> element of the page holds the one slot NONCE_SLOT in its nonce attribute, in every state of the group line and with R14's block in its slot", () => {
  assert.equal(typeof NONCE_SLOT, "string");
  assert.ok(NONCE_SLOT.length > 0 && !/["<>&\s]/.test(NONCE_SLOT), "an attribute-safe marker");
  const composed = PAGE_HTML.replace(HOSTING_SLOT, () => '<div class="notice"><p>The block.</p></div>');
  for (const html of [...PAGES, composed]) {
    const s = scripts(html);
    assert.ok(s.length >= 1, "not vacuous: the page has script");
    for (const attrs of s) assert.equal(nonceOf(attrs), NONCE_SLOT, attrs);
    assert.equal(html.split(NONCE_SLOT).length - 1, s.length, "the slot is nowhere but in a script element's nonce");
  }
});

test("R28 served as the door serves it, two responses carry two different nonces, each response's every script element carrying the nonce its policy names, no slot left, and no inline handler or javascript: address that a nonce-based policy would refuse", () => {
  for (const html of PAGES) {
    const a = serve(html), b = serve(html);
    assert.notEqual(a.nonce, b.nonce);
    for (const r of [a, b]) {
      const named = (/script-src 'nonce-([^']+)'/.exec(r.policy) || [])[1];
      assert.equal(named, r.nonce);
      assert.doesNotMatch(r.policy, /unsafe-inline|unsafe-eval/);
      assert.equal(r.body.includes(NONCE_SLOT), false);
      for (const attrs of scripts(r.body)) assert.equal(nonceOf(attrs), named, attrs);
      assert.deepEqual(handlers(r.body), []);
    }
  }
  /* negative controls: the reading sees a handler, a javascript: address and a script with no nonce */
  assert.notDeepEqual(handlers(PAGE_HTML.replace("<main>", '<main><button onclick="x()">x</button>')), []);
  assert.notDeepEqual(handlers(PAGE_HTML.replace("<main>", '<main><a href="javascript:void 0">x</a>')), []);
  const bare = serve(PAGE_HTML.replace("</body>", "<script>x()</script></body>"));
  assert.ok(scripts(bare.body).some((attrs) => nonceOf(attrs) !== bare.nonce));
});

test("R28 driven, the page makes no script from a string (no eval, no Function, no timer given a string) and draws no inline handler or javascript: address, whatever the plane answers", async () => {
  const made = [];
  const trapped = {
    eval: (...a) => { made.push(["eval", a]); throw new Error("no script from a string"); },
    Function: function Function(...a) { made.push(["Function", a]); throw new Error("no script from a string"); },
    setTimeout: (f, ...a) => { if (typeof f !== "function") made.push(["setTimeout", f]); return setTimeout(typeof f === "function" ? f : () => {}, ...a); },
    setInterval: (f) => { made.push(["setInterval", f]); return 0; },
  };
  const evil = '<img src=x onerror="alert(1)"><a href="javascript:alert(1)">x</a>';
  const answers = {
    stats: { ok: true }, bootstrap: { claimed: true, version: "v1" },
    whoami: { result: { capabilities: ["read", "contribute", "create_projects", "publish"], administer: true } },
    profiles: { result: { ok: true, profiles: [{ id: "p", name: evil, covers: [evil] }], conflicts: [], choices: [{ id: "p", name: evil, covers: [evil] }] } },
    entitieskind: { result: { ok: true, kind: "office", entities: [{ entity_id: "ENT-2026-0001", kind: "office", label: evil, declared_by: evil }], next: null } },
    list: { result: [{ bundle_id: evil, object_type: evil, current_state: evil, title: evil, last_updated: evil }] },
    image: { result: { "bundle.md": `---\nid: X\ntitle: "${evil}"\n---\n\n## Summary\n\n${evil}\n`, [evil]: { blobSha: evil, sha256: evil },
                       "_history/manifest.json": JSON.stringify({ entries: [{ key: evil, seq: 1, kind: evil, author: evil }] }) } },
    inbox: { result: { inbox: [{ knock_id: evil, status: evil, received: evil, sha256: evil, bytes: evil, note: evil, contact: evil }] } },
    memberlist: { result: { members: [{ member_id: evil, cover: evil, status: evil }] } },
    signerlist: { result: { signers: [{ member_id: evil, key_b64: evil, status: evil, attests: false, attests_why: evil }] } },
    hostingaccess: { result: { ok: true, current: { holders: evil, note: evil, recorded_by: evil } } },
    ...hostileSecurity(evil),
    recoverycodesissue: { result: { ok: true, codes: [evil], issuedAt: evil } }, memberadd: { result: { ok: true, invite: evil } },
  };
  const fetch = async (url) => ({ ok: true, status: 200, json: async () => answers[new URL(url, "https://copy.example").searchParams.get("op")] ?? { result: { ok: true } },
                                  blob: async () => new Blob(["x"]) });
  const p = pageOver({ html: serve(PAGE_HTML).body, session: { t: "s", e: 0, w: "admin" }, fetch, globals: trapped });
  await settle();
  await p.ui.openBrowse(); await settle();
  await p.ui.openBundle("X"); await settle();
  await p.ui.openInbox(); await settle();
  await p.el("#go-members").fire(); await settle();
  await p.el("#mk-rc-issue").fire(); await settle();
  p.el("#mk-sa-name").value = "n"; p.el("#mk-sa-id").value = "n"; await p.el("#mk-sa-add").fire(); await settle();
  /* R30's step: the catalogue, a tool picked, added and tested, and the group's tools, all from a hostile answer */
  await p.drawn("#mk-st-cat .st-pick", { i: "0" }).fire(); await settle();
  const fields = p.el("#mk-st-fields").innerHTML;
  p.el("#mk-st-cred-0").value = "k"; p.el("#mk-st-cfg-0").value = "v"; await p.el("#mk-st-add").fire(); await settle();
  assert.deepEqual(made, []);
  assert.deepEqual(handlers(fields), [], "#mk-st-fields");
  const drawn = ["#browse-body", "#b-facts", "#b-md", "#b-files", "#b-history", "#b-ratify", "#inbox-body", "#m-list", "#k-list", "#pf-active",
    "#pf-choices", "#of-list", "#mk-sa-invite", "#mk-rc-codes", "#mk-st-cat", "#mk-st-tools"];
  assert.ok(p.el("#mk-st-cat").innerHTML.includes("&lt;img") && fields.includes("&lt;img"), "not vacuous: R30's step drew the hostile answer, escaped");
  assert.equal(p.el("#pn-ka-now").innerHTML, "", "the keep-away line is text");
  assert.ok(drawn.map((s) => p.el(s).innerHTML).join("").length > 500, "not vacuous: the sections drew");
  for (const s of drawn) assert.deepEqual(handlers(p.el(s).innerHTML), [], s);
});
