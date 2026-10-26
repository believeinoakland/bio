/* R85 (fix round 9, K4951; amends R23, R84): a founder with no Cloudflare account is walked through from the start. The first page
 * asks whether there is an account; "yes" goes on to the short name and the sign-in; "no" shows the four steps in order, one a
 * screen, each with its answers beside it and a resume point; no screen asks for a token or an account id. The guide is drawn when the
 * word list holds the design's rows for it (`GUIDE_KEYS`), so this test is red by name until they land (K4947 (3)). A sentence is
 * never held here (K3810): the test reads structure, ids and keys. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { GUIDE_STEPS, GUIDE_QUESTIONS, GUIDE_KEYS, GUIDE_SCRIPT, guideReady } from "../src/guide.mjs";
import { word, hasWord, KEYS } from "../src/words.mjs";
import { req } from "./fixture.mjs";

const stage = (html) => html.slice(html.indexOf('id="stage-guide"'), html.indexOf('id="stage-choose"'));

test("R85 the design's rows for the guide are held, and every key the guide reads is in the installer's key list", () => {
  assert.deepEqual(GUIDE_KEYS.filter((k) => !hasWord(k)), [], "rows the design owes");
  assert.deepEqual(GUIDE_KEYS.filter((k) => !KEYS.includes(k)), []);
  assert.equal(guideReady(), true);
});

test("R85 a founder answering \"no account\" is shown each step in order, each with its answers and a resume point; one answering \"yes\" goes to the sign-in; no screen asks for a token or an account id", async () => {
  const html = await (await req("/")).text();
  const g = stage(html);
  assert.ok(g.length > 0, "the guide is the first stage");
  assert.match(g, /data-guide="yes"/); assert.match(g, /data-guide="no"/);
  const order = [...g.matchAll(/class="guide-step" id="guide-(\d)" data-step="([a-z]+)"/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(order, GUIDE_STEPS.map((s, i) => [String(i + 1), s]), "four steps, in order: account, plan, storage, sign-in");
  const steps = g.split('<section class="guide-step"').slice(1);
  assert.equal(steps.length, 4);
  for (const [i, s] of steps.entries()) {
    assert.equal([...s.matchAll(/data-q="([a-z]+)"/g)].map((m) => m[1]).join(), GUIDE_QUESTIONS.join(), `step ${i + 1}: the likely questions are beside it`);
    assert.match(s, /data-guide="next"/); assert.match(s, /data-guide="back"/);
    assert.ok(s.includes(word("installer.guide.resume")), `step ${i + 1}: a resume point`);
    assert.ok(s.includes(word(`installer.guide.${GUIDE_STEPS[i]}.cost`)), `step ${i + 1}: what it costs`);
  }
  assert.ok(steps[3].includes(word("installer.guide.allow.never")), "what Civicsmith never does");
  assert.ok(html.includes('id="stage-choose"') && html.includes('id="slug"'), "yes goes on to the short name and the sign-in");
  assert.equal(/<input/i.test(g), false, "no field in the guide at all");
  assert.equal(/name="(token|api[-_]?token|account[-_]?id)"|id="(token|api[-_]?token|account[-_]?id)"/i.test(html), false, "no screen asks for a token or an account id");
});

test("R85 the guide's script: \"no\" opens step 1, going on walks the steps and leaves for the short name after the last, back returns, and a fragment resumes a step; \"yes\" leaves at once", () => {
  const code = GUIDE_SCRIPT.replace(/^<script>|<\/script>$/g, "");
  const world = (hash) => {
    const el = (extra = {}) => ({ hidden: false, ...extra });
    const g = el({ listeners: {}, addEventListener(k, f) { this.listeners[k] = f; } }), c = el(), ask = el();
    const steps = [0, 1, 2, 3].map(() => el({ hidden: true }));
    g.querySelectorAll = () => steps;
    const doc = { getElementById: (id) => ({ "stage-guide": g, "stage-choose": c, "guide-ask": ask })[id] };
    const location = { pathname: "/", search: "", hash };
    new Function("document", "location", "history", code)(doc, location, { replaceState: (_, __, u) => { location.hash = u.startsWith("#") ? u : ""; } });
    const click = (a) => g.listeners.click({ target: { dataset: { guide: a } } });
    const open = () => steps.findIndex((s) => !s.hidden);
    return { g, c, ask, steps, click, open, location };
  };
  const w = world("");
  assert.equal(w.ask.hidden, false); assert.equal(w.c.hidden, true, "the sign-in waits for the answer");
  w.click("no"); assert.equal(w.open(), 0); assert.equal(w.ask.hidden, true);
  w.click("next"); w.click("next"); assert.equal(w.open(), 2); assert.equal(w.location.hash, "#guide-3", "the step is the resume point");
  w.click("back"); assert.equal(w.open(), 1);
  w.click("next"); w.click("next"); assert.equal(w.open(), 3);
  w.click("next"); assert.equal(w.g.hidden, true); assert.equal(w.c.hidden, false, "after the last step: the short name and the sign-in");
  const resumed = world("#guide-3"); assert.equal(resumed.open(), 2, "a fragment resumes the step");
  const yes = world(""); yes.click("yes"); assert.equal(yes.g.hidden, true); assert.equal(yes.c.hidden, false);
});

test("R85 control: with the design's rows missing the first page is the page it was (no guide, nothing hidden)", async () => {
  if (guideReady()) return;                       // rows held: the guide is drawn, the tests above judge it
  const html = await (await req("/")).text();
  assert.equal(html.includes("stage-guide"), false);
  assert.ok(html.includes('id="stage-choose"'));
});
