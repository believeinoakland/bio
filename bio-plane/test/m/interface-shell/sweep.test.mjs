/* interface-shell R5, R15, R22 over T47's frames and states: front in each session state, the public, published and
   setup frames, the lock, the password asked again, the signing dialogs, unavailable, the test band, a guide's panel
   and marks, the bound controls and the at-a-glance elements, at both widths. Every drawn text node (and explanation)
   is a word or the record's own data; no explaining element sits inside another; every control has a name and every
   field a label. */
import test from "node:test";
import assert from "node:assert/strict";
import { wordsOf } from "../../../src/interface-shell/index.mjs";
import { boot, ok, refused, silent, textNodes, nestedTips, controls, accessibleName } from "./harness.mjs";
import { ALL, FRONT, DOORBELL, PUBLISHED, JOIN, PERSON } from "./screens.fixture.mjs";

const GUIDE = {
  words: [["screen.guide.t.step", "Step {i} of {n}", false]], ops: ["wizardsat"], acts: [{ op: "wizarddraft" }],
  render(cs, view) { return view.ui.on ? "<p>" + cs.w("screen.guide.t.step", { i: "1", n: "3" }) + "</p>" + cs.act("wizarddraft", { label: "screen.guide.t.step", fills: { i: "1", n: "3" } }) : ""; },
  marks(cs) { return cs.hint(); },
  start(cs, view) { view.ui.on = true; },
};
const GLANCE = { id: "home", reads: () => ({}), acts: [{ op: "promote" }, { op: "startfrom", send: (view, el, cs) => { cs.wizard("W", 1); return null; } }],
  render: (cs) => cs.title() + cs.reading({ label: "rail.queue.name", value: 3, change: "shell.glance.steady", bars: [1, 2, 3, 4, 5, 6, 7, 8] }) + cs.activity([1, 2, 3, 4, 5, 6, 7, 8], "shell.glance.busy")
    + cs.initials(["mai", "rosa"]) + cs.path([{ text: "rail.add.name", act: cs.act("promote"), now: true }]) + cs.storyline([{ date: "2026-10-01", text: "rail.home.name", us: true }], { open: { screen: "timeline", subject: "P" } })
    + cs.strip([{ n: 2, label: "rail.queue.name" }]) + cs.save("a.txt", "x") + cs.copy("x") + cs.signout() + cs.appearance() + cs.act("startfrom") };
const SIGN = { id: "account", reads: () => ({}), acts: [
  { op: "signerregisterown", async send(view, el, cs) { await cs.signer.register({ keep: false }); return null; } },
  { op: "signerrevokeown", async send(view, el, cs) { await cs.signer.sign([{ label: "x", bytes: "bio-ratify a b\n", namespace: "bio-ratify" }]); return null; } }],
  render: (cs) => cs.act("signerregisterown") + cs.act("signerrevokeown") };
const DATA = ["River Town", "M", "mai", "rosa", "Dana", "The case", "Kept", "3", "2", "+2", "8", "1, 2, 3, 4, 5, 6, 7, 8", "bio-ratify a b", "x", "R", "D", "1"];

async function press(p, op) {
  const b = p.root().querySelector(`button[data-act="${op}"]`);
  if (!b) return;
  await p.click(b);
  const go = p.root().querySelector('[data-shell="reason-send"], [data-shell="confirm"]');
  if (go) { const ta = p.root().querySelector("[data-slot] textarea"); if (ta) ta.value = "r"; await p.click(go); }
}

/* every page state worth sweeping, each a function that answers a booted page */
const CASES = [
  ["front, none", '[data-screen="front"]', (phone) => boot({ phone, screens: [...ALL, FRONT], path: "/app/held", session: null })],
  ["front, ended", '[data-screen="front"]', (phone) => boot({ phone, screens: [...ALL, FRONT], path: "/app/held", plane: { heldcaptures: refused("X", null, 401) } })],
  ["front, locked", '[data-screen="front"]', (phone) => boot({ phone, screens: [...ALL, FRONT], path: "/app/held", plane: { whoami: refused("SESSION_LOCKED", null, 403) } })],
  ["front, signed out", '[data-screen="front"]', async (phone) => { const p = await boot({ phone, screens: [...ALL, FRONT] }); await p.click('[data-shell="menu"]'); await p.click('[data-shell="signout"]'); return p; }],
  ["doorbell", '.cs-testband', (phone) => boot({ phone, screens: [...ALL, DOORBELL], path: "/app/doorbell", session: null, plane: { bootstrap: ok({ test_instance: true }) } })],
  ["published", '[data-screen="published"]', (phone) => boot({ phone, screens: [...ALL, PUBLISHED], path: "/app/published/c1", session: null, plane: { publishedcase: ok({ title: "The case" }) } })],
  ["join", '[data-frame="setup"]', (phone) => boot({ phone, screens: [...ALL, JOIN], path: "/app/join", session: null })],
  ["the lock", '[data-overlay="lock"]', async (phone) => { const p = await boot({ phone, screens: ALL, plane: { projectdirectory: ok({ projects: [] }) } }); await p.clock.tick(30 * 60 * 1000 + 1); return p; }],
  ["the password again", '[data-overlay="reauth"]', async (phone) => { const p = await boot({ phone, screens: ALL, plane: { projectdirectory: ok({ projects: [] }), promote: refused("REAUTH_DUE", null, 403) } }); p.doc.getElementById("home-title").value = "T"; await press(p, "promote"); return p; }],
  ["the register dialog", '[data-overlay="register"]', async (phone) => { const p = await boot({ phone, screens: [SIGN], path: "/app/account" }); await press(p, "signerregisterown"); return p; }],
  ["the sign dialog", '[data-overlay="sign"]', async (phone) => { const p = await boot({ phone, screens: [SIGN], path: "/app/account" }); await press(p, "signerrevokeown"); return p; }],
  ["unavailable, nothing", '[data-unavailable="nothing"]', (phone) => boot({ phone, screens: ALL, path: "/app/nowhere" })],
  ["unavailable, not yours", '[data-unavailable="notyours"]', (phone) => boot({ phone, screens: [...ALL, PERSON], path: "/app/person/x", plane: { person: refused("NOT_VISIBLE") } })],
  ["unavailable, unreachable", '[data-unavailable="unreachable"]', (phone) => boot({ phone, screens: [...ALL, PERSON], path: "/app/person/x", plane: { person: silent } })],
  ["the whole page unreachable", '[data-unavailable="unreachable"]', (phone) => boot({ phone, screens: ALL, plane: { whoami: silent } })],
  ["glance, guide, bound controls", '[data-panel="guide"]', async (phone) => { const p = await boot({ phone, screens: [GLANCE], guide: GUIDE, plane: { bootstrap: ok({ test_instance: true }) } }); await press(p, "startfrom"); return p; }],
];

test("R5 R15 R22 T47's frames, states and dialogs at both widths: every drawn text a word (filled) or the record's data, no explaining element inside another, every control named and every field labelled", async () => {
  const screens = [...ALL, FRONT, DOORBELL, PUBLISHED, JOIN, PERSON, GLANCE, SIGN];
  const words = wordsOf(screens.concat([GUIDE]));
  const pats = [], pieces = new Set();
  for (const [, en] of words) {
    const parts = en.split(/\{\w+\}/);
    pats.push(new RegExp("^" + parts.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[\\s\\S]*") + "$"));
    for (const x of parts) if (x.trim()) pieces.add(x.trim());
  }
  const isWord = (t) => DATA.includes(t) || pieces.has(t) || pats.some((re) => re.test(t)) || [...pieces].some((x) => x.length > 3 && x.includes(t));
  let n = 0;
  for (const [name, shows, make] of CASES) for (const phone of [false, true]) {
    const p = await make(phone);
    const r = p.root();
    assert.ok(r.querySelector(shows), name + " draws " + shows);
    for (const node of textNodes(r)) { const t = node.data.trim(); if (!t) continue; n++; assert.ok(isWord(t), `${name}: "${t}"`); }
    for (const el of r.querySelectorAll("[data-tip]")) {
      const tip = p.doc.createElement("div"); tip.innerHTML = el.getAttribute("data-tip");
      for (const node of textNodes(tip)) { const t = node.data.trim(); if (t) assert.ok(isWord(t), `${name} tip: "${t}"`); }
    }
    assert.deepEqual(nestedTips(r).map((e) => e.outerHTML.slice(0, 60)), [], name);
    for (const c of controls(r)) assert.ok(accessibleName(c, p.doc).length > 0, name + " " + c.outerHTML.slice(0, 100));
    for (const f of r.querySelectorAll("input, select, textarea")) {
      const label = f.getAttribute("aria-label") || (f.id && r.querySelector(`label[for="${f.id}"]`)) || f.closest("label");
      assert.ok(label, name + " " + f.outerHTML);
    }
    for (const el of r.querySelectorAll("[data-tip]")) if (!el.matches("a, button, input, select, textarea")) assert.equal(el.getAttribute("tabindex"), "0", name + ": " + el.outerHTML.slice(0, 80));
  }
  assert.ok(n > 300);
});
