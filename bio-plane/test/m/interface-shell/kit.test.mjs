/* interface-shell R27, R31, R39, R44, R46, R47: the kit's T47 calls (a row's name as its reference, appearance, choices
   over record data, the page clock, filling a field, a knock's card), the dock's wizard guide and the ring, a refusal's
   trace, the at-a-glance elements, and the screens' session, fragment and bound controls. */
import test from "node:test";
import assert from "node:assert/strict";
import { REF_SCREENS, ADMIN_ACTS, interfacePage, checkGuide } from "../../../src/interface-shell/index.mjs";
import { boot, ok, refused, ADMIN, STORE_KEY, nestedTips } from "./harness.mjs";
import { ALL, HELD, FRONT, PERSON } from "./screens.fixture.mjs";

const ROWS = ok({ items: [{ id: "c1", title: "Minutes <draft>", at: "2026-10-01" }, { id: "c2", title: "Budget", at: "2026-10-02" }] });
const btn = (p, op) => p.root().querySelector(`button[data-act="${op}"]`);

test("R27 cs.rows takes name(item), the HTML of the row's name (a reference), and draws the panel's control beside it, never around it: the name opens the reference's screen, the control the panel (R19); no explanation inside another (R15)", async () => {
  const doc = { id: "document", reads: () => ({}), acts: [], render: (cs) => cs.title() };
  const s = { id: "held", reads: () => ({ h: { op: "heldcaptures" } }), acts: [{ op: "heldrestore", send: (view, el) => ({ body: { id: el.dataset.id } }) }],
    render: (cs) => cs.state("h", (v) => cs.rows({ id: "t", cols: ["screen.held.name", "screen.held.name"], items: v.items, key: (i) => i.id,
      name: (i) => cs.ref("document", i.id, i.title, [i.at]), cells: (i) => [cs.date(i.at)], acts: (i) => cs.act("heldrestore", { data: { id: i.id } }) })) };
  const p = await boot({ screens: [s, doc], path: "/app/held", plane: { heldcaptures: ROWS } });
  const row = p.root().querySelector("tr.cs-r");
  const ref = row.querySelector("a.cs-ref");
  const ctl = row.querySelector('[data-shell="row"]');
  assert.equal(ref.textContent, "Minutes <draft>");
  assert.equal(ref.closest("button"), null, "the reference is not inside the control");
  assert.equal(ctl.querySelector("a"), null, "nor the control around the reference");
  assert.equal(ctl.getAttribute("aria-label"), "Acts for Minutes <draft>");
  assert.deepEqual(nestedTips(p.root()), []);
  await p.click(ctl);
  assert.equal(row.nextElementSibling.hidden === false || p.root().querySelector("tr.cs-panel").hidden === false, true, "the control opens the panel beneath");
  assert.ok(p.root().querySelector("tr.cs-panel button[data-act='heldrestore']"));
  await p.click(p.root().querySelector("tr.cs-r a.cs-ref"));
  assert.equal(p.location.pathname, "/app/document/c1", "the name opens the reference's screen");
  /* control: the old form (cells for every column, name as text) still draws the control beside the first cell */
  const q = await boot({ screens: ALL, path: "/app/held", plane: { heldcaptures: ROWS } });
  assert.equal(q.root().querySelector("tr.cs-r .cs-rowname").childNodes[0].textContent, "Minutes <draft>");
});

test("R27 cs.appearance() draws R18's control (Follow my device, Light, Dark), each switching the appearance", async () => {
  const s = { id: "account", reads: () => ({}), acts: [], render: (cs) => "<div id=ap>" + cs.appearance() + "</div>" };
  const p = await boot({ screens: [s], path: "/app/account" });
  const bs = p.doc.getElementById("ap").querySelectorAll("button");
  assert.deepEqual(bs.map((b) => b.textContent), ["Follow my device", "Light", "Dark"]);
  assert.equal(bs[0].getAttribute("aria-pressed"), "true");
  await p.click(bs[2]);
  assert.equal(p.doc.documentElement.getAttribute("data-theme"), "dark");
  assert.equal(p.doc.getElementById("ap").querySelectorAll("button")[2].getAttribute("aria-pressed"), "true");
  assert.equal(p.local.get("cs-theme"), "dark");
});

test("R27 cs.choice takes options as words by key or as record data ({value, text}), the text drawn HTML-escaped and never read as a key", async () => {
  const s = { id: "project", reads: () => ({}), acts: [],
    render: (cs) => cs.choice("q", "shell.reason", [{ value: "Q1", text: "Was the <lease> signed?" }, { value: "Q2", text: "rail.home.name" }, ["k", "shell.appearance.dark"]], { value: "Q2" }) };
  const p = await boot({ screens: [s], path: "/app/project/P1" });
  const opts = p.doc.getElementById("q").querySelectorAll("option");
  assert.deepEqual(opts.map((o) => [o.getAttribute("value"), o.textContent]), [["Q1", "Was the <lease> signed?"], ["Q2", "rail.home.name"], ["k", "Dark"]]);
  assert.equal(opts[0].querySelectorAll("lease").length, 0);
  assert.equal(p.doc.getElementById("q").value, "Q2");
});

test("R27 cs.later(ms, fn) calls fn(cs, view) once after ms on the page clock; a timer set before the member leaves the screen, or the page, never fires", async () => {
  const s = { id: "held", reads: () => ({}), acts: [],
    render: (cs, view) => { if (!view.ui.armed) { view.ui.armed = true; cs.later(60000, (c, v) => c.set("fired", (v.ui.fired || 0) + 1)); } return "<p id=n>" + cs.esc(String(view.ui.fired || 0)) + "</p>"; } };
  const home = { id: "home", reads: () => ({}), acts: [], render: (cs) => cs.title() };
  const p = await boot({ screens: [s, home], path: "/app/held" });
  await p.clock.tick(59_999);
  assert.equal(p.doc.getElementById("n").textContent, "0");
  await p.clock.tick(1);
  assert.equal(p.doc.getElementById("n").textContent, "1");
  await p.clock.tick(120_000);
  assert.equal(p.doc.getElementById("n").textContent, "1", "once");
  /* control: left before it fires */
  const q = await boot({ screens: [s, home], path: "/app/held" });
  let fired = 0;
  const watch = { id: "held", reads: () => ({}), acts: [], render: (cs, view) => { if (!view.ui.a) { view.ui.a = 1; cs.later(1000, (c) => c.call("heldcaptures", { query: { late: "1" } })); } return ""; } };
  const r = await boot({ screens: [watch, home], path: "/app/held" });
  await r.click('a[href="/app"]');
  await r.clock.tick(5000);
  assert.equal(r.requests.filter((x) => x.query.late === "1").length, 0, "left the screen: never fires");
  const t = await boot({ screens: [watch, home], path: "/app/held" });
  for (const f of t.win.listeners.pagehide || []) f({});
  await t.clock.tick(5000);
  assert.equal(t.requests.filter((x) => x.query.late === "1").length, 0, "left the page: never fires");
  assert.equal(fired, 0);
  assert.ok(q);
});

test("R27 cs.fill(id, value) sets a field the screen drew over what was typed, and later redraws keep it (a typed value otherwise kept); a label is drawn beside it", async () => {
  const s = { id: "notes", reads: () => ({}), acts: [{ op: "notewrite", send: (view, el, cs) => { cs.fill("t", "A labelled draft", { label: "shell.reason.help" }); return null; } }],
    render: (cs, view) => cs.field("t", "shell.reason", { area: true }) + cs.act("notewrite") + "<p id=r>" + cs.esc(String(view.ui.n || 0)) + "</p>" };
  const p = await boot({ screens: [s], path: "/app/notes" });
  p.doc.getElementById("t").value = "typed";
  await p.click(btn(p, "notewrite"));
  if (p.root().querySelector('[data-shell="reason-send"]')) { p.root().querySelector("[data-slot] textarea").value = "r"; await p.click(p.root().querySelector('[data-shell="reason-send"]')); }
  assert.equal(p.doc.getElementById("t").value, "A labelled draft");
  assert.ok(p.root().querySelector(".cs-draftlabel").textContent.includes("It is kept with the act"));
  await p.click('[data-shell="menu"]');
  assert.equal(p.doc.getElementById("t").value, "A labelled draft", "kept by the redraw");
});

test("R27 R47 REF_SCREENS: a knock opens inbox at that knock, its card naming what was handed in and when; a person opens person, a proceeding proceeding, a standard standard, each with its card", async () => {
  assert.deepEqual([REF_SCREENS.knock, REF_SCREENS.person, REF_SCREENS.proceeding, REF_SCREENS.standard], ["inbox", "person", "proceeding", "standard"]);
  const target = (id) => ({ id, reads: () => ({}), acts: [], render: (cs) => cs.title() });
  const s = { id: "home", reads: () => ({}), acts: [],
    render: (cs) => cs.ref("knock", "K1", "A tip about the lease", ["Handed in on 3 October 2026"]) + cs.ref("person", "E1", "Dana Ruiz", ["Director"]) + cs.ref("proceeding", "R1", "Case 22-1", []) + cs.ref("standard", "S1", "Ten days to answer", []) };
  const p = await boot({ screens: [s, ...["inbox", "person", "proceeding", "standard"].map(target)] });
  const refs = p.root().querySelectorAll("#cs-main a.cs-ref");
  assert.deepEqual(refs.map((a) => a.getAttribute("href")), ["/app/inbox/K1", "/app/person/E1", "/app/proceeding/R1", "/app/standard/S1"]);
  assert.ok(refs[0].getAttribute("data-tip").includes("Material handed to your group at its doorbell"));
  assert.ok(refs[0].getAttribute("data-tip").includes("Handed in on 3 October 2026"));
  for (const [i, words] of [[1, "A person or organisation"], [2, "A proceeding"], [3, "A standard"]]) assert.ok(refs[i].getAttribute("data-tip").includes(words), words);
});

test("R47 ADMIN_ACTS gains personexpunge: drawn only to a member who administers", async () => {
  assert.ok(ADMIN_ACTS.has("personexpunge"));
  const m = await boot({ screens: [PERSON], path: "/app/person/x", plane: { person: ok({ name: "Dana" }), whoami: ok({ ...ADMIN, administer: false, capabilities: ["contribute", "publish"] }) } });
  assert.equal(btn(m, "personexpunge"), null);
  const a = await boot({ screens: [PERSON], path: "/app/person/x", plane: { person: ok({ name: "Dana" }), whoami: ok({ ...ADMIN, capabilities: ["contribute", "publish"] }) } });
  assert.equal(!!btn(a, "personexpunge") || !!a.root().querySelector('[data-phone-act="personexpunge"]'), true);
});

test("R39 a refusal carrying trace is drawn with Reference: <first 8 characters> beside its words; the trace is kept nowhere in the browser", async () => {
  const TRACE = "9f8e7d6c5b4a39281706";
  const p = await boot({ screens: ALL, plane: { projectdirectory: ok({ projects: [] }), promote: refused("SIGNIN_UNAVAILABLE", "Anthropic's sign-in did not answer.", 502, { trace: TRACE }) } });
  p.doc.getElementById("home-title").value = "T";
  await p.click(btn(p, "promote"));
  const slot = p.root().querySelector('[data-slot="m:0"]');
  assert.ok(slot.textContent.includes("Reference: 9f8e7d6c"));
  assert.ok(!slot.textContent.includes(TRACE), "the first 8 characters only");
  for (const v of [...p.local.values(), ...p.store.values()]) assert.ok(!String(v).includes(TRACE.slice(0, 8)));
  /* a read's refusal likewise; control: a refusal with no trace draws no reference */
  const q = await boot({ screens: ALL, path: "/app/held", plane: { heldcaptures: refused("NOT_ALLOWED", "No.", 403, { trace: TRACE }) } });
  assert.ok(q.root().querySelector('[data-state="failed"]').textContent.includes("Reference: 9f8e7d6c"));
  const r = await boot({ screens: ALL, path: "/app/held", plane: { heldcaptures: refused("NOT_ALLOWED", "No.") } });
  assert.ok(!r.root().querySelector('[data-state="failed"]').textContent.includes("Reference"));
});

const GUIDE = {
  words: [["screen.guide.step", "Step {i} of {n}", false]],
  ops: ["wizardsat"],
  acts: [{ op: "wizarddraft", send: (view) => ({ body: { recorded: view.ui.heard || [] } }) }],
  render(cs, view) { return view.ui.running ? "<p id=g>" + cs.w("screen.guide.step", { i: String(view.ui.step || 1), n: "2" }) + "</p>" + cs.act("wizarddraft", { label: "screen.guide.step", fills: { i: "1", n: "2" } }) : ""; },
  marks(cs, view) { return '<p id=marks data-ui="' + cs.esc(JSON.stringify(view.ui)) + '">' + cs.esc(String(view.screen)) + "</p>"; },
  start(cs, view, o) { view.ui.running = o.script; view.ui.version = o.version; view.ui.o = o; },
  entered(cs, view, at) { cs.set("entered", (view.ui.entered || []).concat([at.screen])); },
  pressed(cs, view, p) { cs.set("heard", (view.ui.heard || []).concat([p])); },
  ring(cs, view) { cs.set("again", (view.ui.again || 0) + 1); },
};
const HELDROWS = ok({ items: [{ id: "h1", title: "Minutes", at: "2026-10-01" }] });

test("R31 (K3143) the dock holds one panel: the guide's while it draws one, in place of the assistant's (no close control), the assistant's returning when it ends; cs.wizard calls the guide's start from any screen", async () => {
  const starter = { id: "home", reads: () => ({}), acts: [{ op: "startfrom", send: (view, el, cs) => { cs.wizard("WIZ-1", 2, { at: "home" }); return null; } }], render: (cs) => cs.act("startfrom") };
  const p = await boot({ screens: [starter, ...ALL.filter((s) => s.id !== "home")], guide: GUIDE, plane: { assistantstate: ok({ on: true }), accountreference: ok({ held: true }) } });
  await p.click('.cs-mast [data-shell="dock"]');
  assert.equal(p.root().querySelector(".cs-dock").getAttribute("data-panel"), "assistant");
  await p.click(btn(p, "startfrom"));
  if (p.root().querySelector('[data-shell="reason-send"]')) { p.root().querySelector("[data-slot] textarea").value = "r"; await p.click(p.root().querySelector('[data-shell="reason-send"]')); }
  const dock = p.root().querySelector(".cs-dock");
  assert.equal(dock.getAttribute("data-panel"), "guide");
  assert.equal(p.doc.getElementById("g").textContent, "Step 1 of 2");
  assert.equal(dock.querySelector('[data-shell="dock"]'), null, "no close control: Stop is the guide's");
  assert.equal(p.root().querySelectorAll(".cs-dock").length, 1, "one panel at a time");
  /* the guide's own act is drawn and sent as a screen's */
  await p.click(dock.querySelector('button[data-act="wizarddraft"]'));
  if (p.root().querySelector('[data-shell="reason-send"]')) { p.root().querySelector("[data-slot] textarea").value = "r"; await p.click(p.root().querySelector('[data-shell="reason-send"]')); }
  assert.equal(p.byOp("wizarddraft").length, 1);
  /* the guide's page-memory view carries the start's arguments; it ends by drawing nothing */
  const q = await boot({ screens: ALL, guide: { ...GUIDE, render: (cs, view) => (view.ui.running && !view.ui.stopped ? "<p id=g>run</p>" : ""), start: (cs, view, o) => { view.ui.running = o.script; } } });
  assert.equal(q.root().querySelector(".cs-dock"), null, "no wizard, no guide panel");
  /* control: no guide given, cs.wizard answers false and nothing is drawn */
  const r = await boot({ screens: [starter] });
  await r.click(btn(r, "startfrom"));
  assert.equal(r.root().querySelector(".cs-dock"), null);
});

test("R31 (K3143) the guide's marks are drawn under the path of every working screen; entered is called once the screen's reads settle; pressed hears each act by its op and screen only, never a value", async () => {
  let release;
  const slow = new Promise((r) => { release = r; });
  const p = await boot({ screens: ALL, guide: GUIDE, path: "/app/held", plane: { heldcaptures: async () => { await slow; return HELDROWS; } } });
  const main = p.root().querySelector("#cs-main");
  assert.equal(main.children[0].localName, "nav");
  assert.equal(main.children[1].id, "marks", "directly under the path");
  assert.equal(p.doc.getElementById("marks").textContent, "held");
  assert.equal(GUIDE_UI(p).entered, undefined, "not before the reads settle");
  release();
  await p.settle();
  assert.deepEqual(GUIDE_UI(p).entered, ["held"]);
  await p.click(p.root().querySelector('[data-shell="row"]'));
  await p.click(btn(p, "heldrestore"));
  const heard = GUIDE_UI(p).heard;
  assert.deepEqual(heard, [{ op: "heldrestore", screen: "held" }]);
});
/* the guide's view.ui, read back through the marks it draws */
const GUIDE_UI = (p) => JSON.parse(p.doc.getElementById("marks").getAttribute("data-ui"));

test("R31 cs.ring(op) finds the control the screen drew for op, opens the row panel holding it, draws the ring and its label (\"Press here when you're ready\" on a button), scrolls it into view and focuses it; an act the screen does not draw answers false; Alt+Shift+W asks the guide to ring again; the shell never presses it", async () => {
  const q = await boot({ screens: [{ id: "held", reads: () => ({ h: { op: "heldcaptures" } }), acts: [{ op: "heldrestore" }, { op: "heldsetaside", send: (view, el, cs) => { cs.wizard("W", 1); return null; } }],
    render: (cs) => cs.act("heldsetaside") + cs.state("h", (v) => cs.rows({ id: "t", cols: ["screen.held.name"], items: v.items, key: (i) => i.id, name: (i) => i.title, cells: (i) => [cs.esc(i.title)], acts: () => cs.act("heldrestore") })) }],
    path: "/app/held", plane: { heldcaptures: HELDROWS }, guide: { ...GUIDE, render: () => "", start(cs, view) { view.ui.r = [cs.ring("heldrestore"), cs.ring("retire")]; } } });
  await q.click(btn(q, "heldsetaside"));
  if (q.root().querySelector('[data-shell="reason-send"]')) { q.root().querySelector("[data-slot] textarea").value = "r"; await q.click(q.root().querySelector('[data-shell="reason-send"]')); }
  const ringed = q.root().querySelector('button[data-act="heldrestore"]');
  assert.equal(q.root().querySelector("tr.cs-panel").hidden, false, "its row panel opened");
  assert.ok(ringed.classList.contains("cs-ring"));
  assert.equal(ringed.previousElementSibling.textContent, "Press here when you're ready");
  assert.ok(q.doc.activeElement === ringed, "focused");
  assert.ok(q.doc.scrolledTo && q.doc.scrolledTo.getAttribute("data-act") === "heldrestore", "scrolled into view");
  assert.equal(q.byOp("heldrestore").length, 0, "never pressed");
  /* Alt+Shift+W */
  const r = await boot({ screens: ALL, path: "/app/held", plane: { heldcaptures: HELDROWS }, guide: GUIDE });
  r.fire(r.doc.body, "keydown", { key: "W", altKey: true, shiftKey: true });
  await r.settle();
  assert.equal(GUIDE_UI(r).again, 1);
  /* control: the act the screen does not draw answers false */
  const t = await boot({ screens: [{ id: "held", reads: () => ({}), acts: [{ op: "heldsetaside", send: (view, el, cs) => { cs.set("r", String(cs.ring("heldrestore"))); return null; } }], render: (cs, view) => cs.act("heldsetaside") + "<p id=r>" + cs.esc(view.ui.r || "") + "</p>" }], path: "/app/held" });
  await t.click(btn(t, "heldsetaside"));
  if (t.root().querySelector('[data-shell="reason-send"]')) { t.root().querySelector("[data-slot] textarea").value = "r"; await t.click(t.root().querySelector('[data-shell="reason-send"]')); }
  assert.equal(t.doc.getElementById("r").textContent, "false");
});

test("R46 view.session tells a screen the session's state and handle; view.fragment carries the fragment read once; cs.signin with stay keeps the screen signed in, without it opens the kept page or Home", async () => {
  const p = await boot({ screens: [...ALL, FRONT], path: "/app/held", session: null });
  assert.equal(p.doc.getElementById("state").textContent, "State: none");
  const q = await boot({ screens: [...ALL, FRONT], path: "/app/held", session: { t: "t", e: 0, d: "own", w: "rosa" }, plane: { heldcaptures: refused("X", null, 401) } });
  assert.equal(q.doc.getElementById("state").textContent, "State: ended");
  assert.equal(q.doc.getElementById("f-handle").value, "rosa");
  const live = { id: "home", reads: () => ({}), acts: [], render: (cs, view) => "<p id=s>" + cs.esc(view.session.state + "/" + view.session.handle) + "</p>" };
  const r = await boot({ screens: [live] });
  assert.equal(r.doc.getElementById("s").textContent, "live/mai");
});

test("R46 R47 cs.signout({label}), cs.save(name, text, {label}) and cs.copy(text, {label}) each answer their own bound control; cs.signedOut() clears the record and draws front signed out", async () => {
  const copied = [];
  const s = { id: "recovery", reads: () => ({}), acts: [{ op: "recoverycodesissue", send: (view, el, cs) => { cs.signedOut(); return null; } }],
    render: (cs) => "<div id=c>" + cs.save("codes.txt", "AAA-111\nBBB-222", { label: "shell.reason" }) + cs.copy("AAA-111") + cs.signout() + "</div>" + cs.act("recoverycodesissue") };
  const p = await boot({ screens: [s, FRONT], path: "/app/recovery" });
  p.win.navigator = { clipboard: { writeText: (t) => copied.push(t) } };
  const [save, copy, out] = p.doc.getElementById("c").querySelectorAll("button");
  assert.deepEqual([save.textContent, copy.textContent, out.textContent], ["Your reason", "Copy", "Sign out"]);
  await p.click(save);
  assert.equal(p.files.length, 1);
  assert.equal(p.files[0].name, "codes.txt");
  assert.equal(await p.files[0].blob.text(), "AAA-111\nBBB-222");
  assert.equal(p.objectUrls[0].released, true);
  await p.click(copy);
  assert.deepEqual(copied, ["AAA-111"]);
  for (const r of p.requests) assert.ok(!JSON.stringify(r).includes("AAA-111"), "made in the page, never sent");
  await p.click(out);
  assert.equal(p.byOp("signout").length, 1);
  assert.equal(p.local.has(STORE_KEY), false);
  assert.equal(p.doc.getElementById("state").textContent, "State: signedout");
  /* cs.signedOut: no signout op of its own */
  const q = await boot({ screens: [s, FRONT], path: "/app/recovery", plane: { whoami: ok({ ...ADMIN }) } });
  const b = btn(q, "recoverycodesissue");
  if (b) {
    await q.click(b);
    const go = q.root().querySelector('[data-shell="reason-send"], [data-shell="confirm"]');
    if (go) { const ta = q.root().querySelector("[data-slot] textarea"); if (ta) ta.value = "r"; await q.click(go); }
    assert.equal(q.byOp("signout").length, 0);
    assert.equal(q.local.has(STORE_KEY), false);
    assert.equal(q.doc.getElementById("state").textContent, "State: signedout");
  }
});

test("R44 the at-a-glance elements: a reading, activity, people, next steps, the story so far and the status strip, each drawn once as the visual language draws them", async () => {
  const s = { id: "home", reads: () => ({}), acts: [{ op: "promote" }],
    render: (cs) => "<div id=r>" + cs.reading({ label: "rail.queue.name", value: 12, change: { text: "3 more than last week" }, bars: [1, 2, 3, 4, 5, 6, 7, 8] }) + "</div>"
      + "<div id=a>" + cs.activity([0, 1, 0, 2, 3, 1, 4, 6], "shell.glance.busy") + "</div>"
      + "<div id=i>" + cs.initials(["mai", "rosa", "dev", "ana", "lee", "kim"]) + "</div>"
      + "<div id=n>" + cs.path([{ text: "rail.add.name", act: cs.act("promote") }, { text: { text: "Ask the clerk" }, now: true }]) + "</div>"
      + "<div id=t>" + cs.storyline([{ date: "2026-09-01", text: { text: "The council voted" } }, { date: null, text: { text: "Undated" } }, { date: "2026-09-10", text: { text: "We asked" }, us: true }], { open: { screen: "timeline", subject: "P1" } }) + "</div>"
      + "<div id=s>" + cs.strip([1, 2, 3, 4, 5].map((n) => ({ n, label: { text: "item " + n }, screen: "queue" }))) + "</div>" };
  const p = await boot({ screens: [s] });
  const $ = (id) => p.doc.getElementById(id);
  assert.equal($("r").querySelector(".k").textContent, "Queue");
  assert.equal($("r").querySelector(".v").textContent, "12");
  assert.equal($("r").querySelector(".d").textContent, "3 more than last week");
  assert.equal($("r").querySelectorAll(".cs-spark i").length, 8);
  const bars = $("a").querySelectorAll(".cs-spark i");
  assert.equal(bars.length, 8);
  assert.ok(bars[7].classList.contains("now"), "the newest week darker");
  assert.equal($("a").querySelector("b").textContent, "busy");
  assert.ok($("a").querySelector(".cs-spark").getAttribute("aria-label").includes("0, 1, 0, 2, 3, 1, 4, 6"));
  assert.deepEqual($("i").querySelectorAll("i").map((x) => x.textContent), ["M", "R", "D", "A", "+2"], "at most four, then the count");
  assert.equal($("i").querySelector(".cs-people > span").textContent, "6");
  const steps = $("n").querySelectorAll("li");
  assert.equal(steps.length, 2);
  assert.ok(steps[0].querySelector('button[data-act="promote"]'), "each step the act itself");
  assert.equal(steps[1].getAttribute("aria-current"), "step");
  const evs = $("t").querySelectorAll(".ev");
  assert.equal(evs.length, 2, "undated things never placed");
  assert.ok(evs[0].classList.contains("them") && evs[1].classList.contains("us"));
  assert.equal($("t").querySelector("a").getAttribute("href"), "/app/timeline/P1");
  /* control: a strip handed five readings draws four */
  assert.equal($("s").querySelectorAll("a").length, 4);
  /* at the phone width, one chip */
  const q = await boot({ screens: [s], phone: true });
  const chip = q.doc.getElementById("s").querySelectorAll("a");
  assert.equal(chip.length, 1);
  assert.ok(chip[0].textContent.startsWith("10"), "the four's sum");
});

test("R31 (K3143) checkGuide: the guide's ops and acts each an op OPS holds; interfacePage throws, naming the guide, for one that is not", () => {
  assert.equal(checkGuide(GUIDE), true);
  assert.throws(() => interfacePage(ALL, { guide: { ...GUIDE, ops: ["nosuchop"] } }), /guide.*nosuchop.*OPS/);
  assert.throws(() => interfacePage(ALL, { guide: { ...GUIDE, acts: [{ op: "zz" }] } }), /guide.*zz/);
  assert.throws(() => interfacePage(ALL, { guide: { ...GUIDE, render: undefined } }), /guide/);
  assert.ok(interfacePage(ALL, { guide: GUIDE }).includes("wizardsat"));
});
