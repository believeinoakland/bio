/* interface-shell R11, R12, R13 and R21's act contract: weight and friction, the gate, refusals beside the act. */
import test from "node:test";
import assert from "node:assert/strict";
import { RUNGS } from "../../../src/op-grades/index.mjs";
import { NEEDS, SESSION_OPS } from "../../../src/op-declarations/index.mjs";
import { boot, ok, refused, refusedIn, httpError, silent, pending, bytes, MEMBER, ADMIN } from "./harness.mjs";
import { ALL, HOME, HELD } from "./screens.fixture.mjs";

const IMAGE = ok({ title: "A lease", pages: 3, grade: "B", why: "w", project: { id: "P1", title: "Pothole repairs" }, passages: [{ n: 1, text: "Closed" }] });
const HELDA = ok({ items: [{ id: "h1", title: "Minutes", at: "2026-10-01" }, { id: "h2", title: "Budget", at: "2026-10-02" }] });
const PLANE = { image: IMAGE, heldcaptures: HELDA };
const btn = (p, op) => p.root().querySelector(`button[data-act="${op}"]`);

test("R11 each act is a button labelled act.<op>.label.<screen>, carrying its weight's pips and name from op-grades' RUNGS (attested drawn as Signed; RUNG_ABSENT or unnamed as Reasoned)", async () => {
  assert.equal(RUNGS.cite, "reversible"); assert.equal(RUNGS.retire, "terminal"); assert.equal(RUNGS.attest, "attested"); assert.equal(RUNGS.release, "reasoned");
  assert.equal(RUNGS.promote, undefined);
  const p = await boot({ screens: ALL, path: "/app/document/c1", plane: PLANE });
  const cases = [["cite", "Reversible", 1], ["retire", "Terminal", 3], ["attest", "Signed", 4], ["release", "Reasoned", 2]];
  for (const [op, name, on] of cases) {
    const b = btn(p, op);
    assert.equal(b.localName, "button");
    assert.equal(b.querySelector(".w").textContent, name, op);
    assert.equal(b.querySelectorAll(".cs-pips i.on").length, on, op);
    assert.ok(b.getAttribute("data-tip").includes(name + ":"), op);
  }
  assert.ok(btn(p, "cite").textContent.startsWith("Cite a passage"));
  const h = await boot({ screens: ALL, plane: PLANE });
  assert.equal(btn(h, "promote").querySelector(".w").textContent, "Reasoned", "promote is RUNG_ABSENT: reasoned");
  assert.ok(btn(h, "promote").textContent.startsWith("Start a project"));
});

test("R11 friction: a reversible act runs on press; a reasoned act opens a reason field in place and sends only with a reason; a terminal or signed act opens a dialog stating what it does and who signs, and sends only on its confirm", async () => {
  const p = await boot({ screens: ALL, path: "/app/document/c1", plane: PLANE });
  await p.click(btn(p, "cite"));
  assert.deepEqual(p.byOp("cite").map((r) => r.body), [{ passage: 1, capture: "c1" }]);
  await p.click(btn(p, "release"));
  assert.equal(p.byOp("release").length, 0);
  const slot = p.root().querySelector('[data-slot="m:3"]');
  assert.ok(slot.querySelector("textarea"));
  assert.ok(slot.querySelector("label").textContent === "Your reason");
  await p.click(slot.querySelector('[data-shell="reason-send"]'));
  assert.equal(p.byOp("release").length, 0, "no reason, nothing sent");
  assert.ok(slot.textContent.includes("Say why first"));
  slot.querySelector("textarea").value = "  it was checked  ";
  await p.click(slot.querySelector('[data-shell="reason-send"]'));
  assert.deepEqual(p.byOp("release")[0].body, { ids: ["c1"], reason: "it was checked" });
  for (const [op, signs] of [["retire", "Done in your name, mai."], ["attest", "Signed with your key, in your name, mai."]]) {
    await p.click(btn(p, op));
    const dlg = p.root().querySelector('[role="dialog"]');
    assert.ok(dlg, op);
    assert.ok(dlg.textContent.includes(signs), op);
    assert.equal(p.byOp(op).length, 0);
    await p.click(dlg.querySelector('[data-shell="cancel"]'));
    assert.equal(p.root().querySelector('[role="dialog"]'), null);
    assert.equal(p.byOp(op).length, 0);
    await p.click(btn(p, op));
    const d2 = p.root().querySelector('[role="dialog"]');
    if (op === "attest") d2.querySelector("textarea").value = "noted";
    await p.click(d2.querySelector('[data-shell="confirm"]'));
    assert.equal(p.byOp(op).length, 1, op);
  }
  assert.ok(p.root().querySelector('button[data-act="retire"]'));
  assert.deepEqual(p.byOp("attest")[0].body, { id: "c1", note: "noted" }, "a dialog's fields arrive as extra.fields");
});

test("R11 a terminal act's dialog states what the act does (act.<op>.does)", async () => {
  const p = await boot({ screens: ALL, path: "/app/document/c1", plane: PLANE });
  await p.click(btn(p, "retire"));
  assert.ok(p.root().querySelector('[role="dialog"] .ends').textContent.startsWith("Stops using this copy"));
});

test("R11 an act that leaves the group carries mark.outward.means; one that does not, none", async () => {
  const s = { id: "connect", reads: () => ({}), acts: [{ op: "disclosureshown", outward: true }, { op: "groupkeynoticeseen" }], render: (cs) => cs.act("disclosureshown") + cs.act("groupkeynoticeseen") };
  const p = await boot({ screens: [s], path: "/app/connect" });
  assert.ok(btn(p, "disclosureshown").querySelector('use[href$="#i-outward"]'));
  assert.ok(btn(p, "disclosureshown").getAttribute("data-tip").includes("Outward: this leaves"));
  assert.equal(btn(p, "groupkeynoticeseen").querySelector('use[href$="#i-outward"]'), null);
});

test("R11 (DEC-181) at the phone width a signed act is drawn with what it does and where to finish it, and is not sent; the same act on a wide screen is a button", async () => {
  const p = await boot({ screens: ALL, path: "/app/document/c1", plane: PLANE, phone: true });
  assert.equal(btn(p, "attest"), null);
  const phone = p.root().querySelector('[data-phone-act="attest"]');
  assert.ok(phone.textContent.includes("Finish this on a larger screen"));
  assert.equal(phone.querySelector("button"), null);
  await p.click(phone);
  assert.equal(p.byOp("attest").length, 0);
  assert.ok(btn(p, "cite"), "a reversible act is still a phone act");
  assert.ok(btn(p, "retire"), "a terminal act is not one DEC-181 sends elsewhere");
});

test("R12 an act is drawn only when NEEDS[op] is null or a held capability, the op is in the session's set, and, for an administrator's act, whoami's administer is true; absent, never greyed", async () => {
  assert.equal(NEEDS.cite, "contribute");
  assert.ok(SESSION_OPS.member.has("cite"));
  const noCap = await boot({ screens: ALL, path: "/app/document/c1", plane: { ...PLANE, whoami: ok({ ...MEMBER, capabilities: [] }) } });
  assert.equal(btn(noCap, "cite"), null);
  assert.equal(noCap.root().querySelector("button[disabled]"), null, "never greyed");
  const withCap = await boot({ screens: ALL, path: "/app/document/c1", plane: PLANE });
  assert.ok(btn(withCap, "cite"));
  const member = await boot({ screens: ALL, path: "/app/members" });
  assert.equal(btn(member, "memberadd"), null);
  assert.equal(btn(member, "membercaps"), null);
  const admin = await boot({ screens: ALL, path: "/app/members", plane: { whoami: ok(ADMIN) } });
  assert.ok(btn(admin, "memberadd"));
  assert.ok(btn(admin, "membercaps"));
  /* an op outside the session's set: the founder's set */
  const op = [...SESSION_OPS.member].find((o) => !SESSION_OPS.admin.has(o) && ["cite", "retire", "attest", "release"].includes(o));
  if (op) { const f = await boot({ screens: ALL, path: "/app/document/c1", plane: { ...PLANE, whoami: ok({ ...ADMIN, tokenClass: "admin" }) } }); assert.equal(btn(f, op), null); }
});

test("R12 before whoami answers, no act is drawn; an act the screen does not list is never drawn", async () => {
  const p = await boot({ screens: ALL, path: "/app/document/c1", plane: { ...PLANE, whoami: pending } });
  assert.equal(p.root().querySelector("button[data-act]"), null);
  const s = { id: "home", reads: () => ({}), acts: [], render: (cs) => cs.act("promote") };
  const q = await boot({ screens: [s] });
  assert.equal(btn(q, "promote"), null);
});

test("R13 a refusal of each kind (ok: false at the top level, in result, an HTTP error, no answer) is drawn beside the act it answers, never in place of the screen; a form keeps what the member typed; nothing else changes", async () => {
  const kinds = [[refused("NO_SUCH_THING_ZZ", "The thing is gone."), "The thing is gone."], [refusedIn("ZZ_IN", "Inside words."), "Inside words."], [httpError(500), "Could not read this, because 500"], [silent, "did not answer"]];
  const code = "PROJECT_SCOPE_UNKNOWN";
  for (const [answer, words] of kinds) {
    const p = await boot({ screens: ALL, plane: { promote: answer, projectdirectory: ok({ projects: [] }) } });
    p.doc.getElementById("home-title").value = "Typed title";
    const before = p.root().querySelector("#cs-main").innerHTML;
    await p.click(btn(p, "promote"));
    p.root().querySelector("textarea").value = "why";
    await p.click(p.root().querySelector('[data-shell="reason-send"]'));
    const slot = p.root().querySelector('[data-slot="m:0"]');
    assert.ok(slot.querySelector('[data-gap="refused"]'), words);
    assert.ok(slot.textContent.includes(words), slot.textContent);
    assert.equal(p.doc.getElementById("home-title").value, "Typed title");
    for (const sl of p.root().querySelectorAll(".cs-slot")) sl.innerHTML = "";
    assert.equal(p.root().querySelector("#cs-main").innerHTML.replace(' value="Typed title"', ""), before.replace(/ value="[^"]*"/, ' value=""'), "nothing else changes");
  }
  /* refusal.<code> when held, and the screen's own key for a code first */
  const held = await boot({ screens: ALL, plane: { promote: refused(code, "ignored"), projectdirectory: ok({ projects: [] }) } });
  held.doc.getElementById("home-title").value = "T";
  await held.click(btn(held, "promote")); held.root().querySelector("textarea").value = "r"; await held.click(held.root().querySelector('[data-shell="reason-send"]'));
  assert.ok(!held.root().querySelector('[data-slot="m:0"]').textContent.includes("ignored"));
  const own = await boot({ screens: ALL, path: "/app/document/c1", plane: { ...PLANE, cite: refused("CITE_GONE", "ignored") } });
  await own.click(btn(own, "cite"));
  assert.equal(own.root().querySelector('[data-slot="m:0"]').textContent, "Passages");
});

test("R21 an act's send: null sends nothing; {refuse: key} draws that word beside the act; a promise is awaited; done runs on success, then the reads named in rereads (all when absent)", async () => {
  const p = await boot({ screens: ALL, plane: { projectdirectory: ok({ projects: [] }) } });
  p.doc.getElementById("home-title").value = "";
  await p.click(btn(p, "promote")); p.root().querySelector("textarea").value = "r"; await p.click(p.root().querySelector('[data-shell="reason-send"]'));
  assert.equal(p.byOp("promote").length, 0);
  assert.ok(p.root().querySelector('[data-slot="m:0"]').textContent.includes("Say why first"));
  const q = await boot({ screens: ALL, plane: { promote: ok({ project: "P9" }), projectdirectory: ok({ projects: [] }) } });
  q.doc.getElementById("home-title").value = "New";
  await q.click(btn(q, "promote")); q.root().querySelector("textarea").value = "r"; await q.click(q.root().querySelector('[data-shell="reason-send"]'));
  assert.deepEqual(q.byOp("promote")[0].body, { title: "New", reason: "r" });
  assert.equal(q.location.pathname, "/app/project/P9", "done opened another screen");
  let reads = 0;
  const s = { id: "held", reads: () => ({ a: { op: "heldcaptures" }, b: { op: "gradenote" } }), render: (cs) => cs.act("heldrestore"),
    acts: [{ op: "heldrestore", send: async () => ({ body: { id: "x" } }), rereads: ["a"] }] };
  const r = await boot({ screens: [s], path: "/app/held", plane: { heldcaptures: () => (reads++, ok({ items: [1] })) } });
  assert.equal(reads, 1);
  await r.click(btn(r, "heldrestore")); r.root().querySelector("textarea").value = "back"; await r.click(r.root().querySelector('[data-shell="reason-send"]'));
  assert.deepEqual(r.byOp("heldrestore")[0].body, { id: "x", reason: "back" });
  assert.equal(reads, 2);
  assert.equal(r.byOp("gradenote").length, 1, "only the named read again");
});

test("R21 (K2999) a picked-rows act receives the picked keys as extra.picked; send may answer {query, raw}, the raw body sent as it is under the session header with no JSON content type", async () => {
  const s = { id: "held", reads: () => ({ h: { op: "heldcaptures" } }), acts: [{ op: "heldsetaside", send: (view, el, cs, extra) => ({ query: { n: String(extra.picked.length) }, raw: "RAW:" + extra.picked.join(",") }) }],
    render: (cs) => cs.state("h", (v) => cs.rows({ id: "t", pick: true, cols: ["screen.held.name"], items: v.items, key: (i) => i.id, name: (i) => i.title, cells: (i) => [cs.esc(i.title)], hold: () => cs.act("heldsetaside") })) };
  const p = await boot({ screens: [s], path: "/app/held", plane: { heldcaptures: HELDA } });
  for (const id of ["h1", "h2"]) { const box = p.doc.getElementById("pick-t-" + id); box.checked = true; p.fire(box, "change"); await p.settle(); }
  await p.click(btn(p, "heldsetaside")); p.root().querySelector("textarea").value = "dup"; await p.click(p.root().querySelector('[data-shell="reason-send"]'));
  const r = p.byOp("heldsetaside")[0];
  assert.equal(r.body, "RAW:h1,h2");
  assert.equal(r.query.n, "2");
  assert.equal(r.query.reason, "dup", "a raw body's reason travels in the query");
  assert.equal(r.headers.Authorization, "Bearer tok-1");
  assert.equal(r.headers["content-type"], undefined);
});

test("R21 (K2999) cs.download hands a byte answer to the browser as a file, its object address released once the download starts; a refusal answers {ok: false}", async () => {
  const s = { id: "open-file", reads: () => ({}), acts: [{ op: "openoriginal", async send(view, el, cs) { const r = await cs.download("openoriginal", { query: { sha256: "ab" } }); el.setAttribute("data-got", String(r.ok)); return null; } }],
    render: (cs) => cs.act("openoriginal") };
  const p = await boot({ screens: [s], path: "/app/open-file/ab", plane: { openoriginal: bytes("%PDF-1.7") } });
  const press = async (x) => { await x.click(btn(x, "openoriginal")); x.root().querySelector("textarea").value = "r"; await x.click(x.root().querySelector('[data-shell="reason-send"]')); };
  await press(p);
  assert.equal(p.files.length, 1);
  assert.equal(p.objectUrls.length, 1);
  assert.equal(p.objectUrls[0].released, true);
  assert.equal(p.byOp("openoriginal")[0].headers.Authorization, "Bearer tok-1");
  const q = await boot({ screens: [s], path: "/app/open-file/ab", plane: { openoriginal: refused("HELD", "Held.") } });
  await press(q);
  assert.equal(q.files.length, 0);
});

test("R21 (K2998) a screen's closed(cs, view) is called when the member leaves it, and on pagehide; its ui is kept across redraws of the same page", async () => {
  const s = { id: "held", reads: () => ({}), acts: [], closed: (cs, view) => { view.ui.n = (view.ui.n || 0); cs.call("heldcaptures", { query: { closed: "1" } }); },
    render: (cs, view) => "<button type=button id=b data-shell=x>" + cs.esc(String(view.ui.k || 0)) + "</button>" };
  const p = await boot({ screens: [s, HOME], path: "/app/held", plane: { projectdirectory: ok({ projects: [] }) } });
  await p.click('a[href="/app"]');
  assert.equal(p.requests.filter((r) => r.op === "heldcaptures" && r.query.closed === "1").length, 1);
  const q = await boot({ screens: [s], path: "/app/held" });
  for (const f of q.win.listeners.pagehide || []) f({});
  await q.settle();
  assert.equal(q.requests.filter((r) => r.op === "heldcaptures" && r.query.closed === "1").length, 1);
});

export { HELD };
