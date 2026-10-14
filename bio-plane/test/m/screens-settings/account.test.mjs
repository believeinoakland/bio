/* Settings › Your account at the module's interface (R3, R8, R10). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, day, has, lacks, open, panelOf, rowOf, said, textOf, WORDS } from "./kit.mjs";
import { ADMIN, MEMBER, READER, accountTable, refuse, env } from "./fixtures.mjs";
import { SCREENS } from "../../../src/screens-settings/index.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();

test("R3 the reads: whoami, memberlanguage, the member's own expertiselist, signerlist", async () => {
  const a = await open("account", { me: MEMBER, table: accountTable(MEMBER) });
  const reads = a.p.all.map((r) => [r.op, r.query]);
  for (const want of [["whoami", {}], ["memberlanguage", {}], ["expertiselist", { memberId: "dev" }], ["signerlist", {}]])
    assert.ok(reads.some((r) => JSON.stringify(r) === JSON.stringify(want)), JSON.stringify(want));
  assert.equal(reads.filter((r) => r[0] === "whoami").length, 2, "the shell's own, and the screen's");
});

test("R3 the handle drawn fixed in DEC-197's words; no handlechange act, and no handle.changeable, handle.formerly or handle.refused.* drawn", async () => {
  const a = await open("account", { me: MEMBER, table: accountTable(MEMBER) });
  assert.ok(textOf(a.tree).includes("dev"));
  assert.equal(said("handle.fixed"), "Your handle is fixed: it names your work in the group and in published cases, and no one else can ever take it.");
  has(a, "handle.fixed");
  assert.ok(!ops(a).includes("handlechange") && !ops(a).includes("handlecheck"));
  for (const k of ["handle.changeable", "handle.formerly", "handle.refused.paused", "handle.free", "handle.taken"].filter((k) => WORDS.has(k)))
    assert.ok(!a.html.includes(a.cs.w(k, { handle: "dev", group: "", suggestion: "", minutes: "", case: "" }).slice(0, 24)), k);
  assert.ok(!/formerly/i.test(a.html));
});

test("R3, R21 every registry act is drawn (memberlanguageset, setpassword, expertisedeclare, signerregisterown, signerrevokeown, the explanation level, the two sign-outs), and the links to connect and notes", async () => {
  const a = await open("account", { me: MEMBER, table: accountTable(MEMBER) });
  assert.deepEqual(ops(a), ["expertisedeclare", "infolevelset", "memberlanguageset", "setpassword", "signerregisterown", "signerrevokeown", "signout", "signouteverywhere"]);
  // the member's own key only: a revoke for theirs, none for another's
  const rev = acts(a.tree).filter((b) => b.attrs["data-act"] === "signerrevokeown");
  assert.equal(rev.length, 1);
  assert.ok(rev[0].attrs["data-key"].endsWith("01"));
  assert.ok(all(a.tree, (e) => e.tag === "a" && e.attrs.href === "/app/connect").length === 1);
  assert.ok(all(a.tree, (e) => e.tag === "a" && e.attrs.href === "/app/notes").length === 1);
  // (R12) the appearance choice is the device's (interface-shell R18), never an op: the kit's own control, cs.appearance()
  const ap = all(a.tree, (e) => e.attrs["data-shell"] === "theme");
  assert.equal(ap.length, 3, "the kit's control is drawn");
  await a.b.click(a.b.doc.getElementById("cs-main").querySelector('[data-shell="theme"][data-theme-to="dark"]'));
  assert.equal(a.b.doc.documentElement.getAttribute("data-theme"), "dark");
  assert.ok(!a.p.all.some((r) => /theme/.test(JSON.stringify(r))), "never sent");
  // the level the member set is drawn selected (read by the shell, its R17)
  const lv = all(a.tree, (e) => e.attrs.id === "ma-level")[0];
  assert.equal(all(lv, (e) => e.tag === "option" && e.attrs.selected !== undefined)[0].attrs.value, "pause");
});

test("R3 the explanation level: infolevelset sent through the shell's setting, kept on the device (interface-shell R17)", async () => {
  const a = await open("account", { me: MEMBER, table: accountTable(MEMBER, { infolevel: refuse("UNKNOWN_OP") }) });
  const lv = all(a.tree, (e) => e.attrs.id === "ma-level")[0];
  assert.equal(all(lv, (e) => e.tag === "option" && e.attrs.selected !== undefined)[0].attrs.value, "prompt", "the default while the level is not read");
  const r = await a.press("infolevelset", { values: { "ma-level": "pause" } });
  assert.deepEqual(r.sent.filter((x) => x.op === "infolevelset").map((x) => x.body), [{ level: "pause" }], "sent once");
  assert.equal(a.b.local.get("cs-level"), "pause", "kept for the device");
  const lv2 = all(a.tree, (e) => e.attrs.id === "ma-level")[0];
  assert.equal(all(lv2, (e) => e.tag === "option" && e.attrs.selected !== undefined)[0].attrs.value, "pause");
});

test("R3 memberlanguageset sends the tag, or null to follow the device", async () => {
  const a = await open("account", { me: MEMBER, table: accountTable(MEMBER) });
  has(a, "screen.account.language.now", { language: "es" });
  assert.deepEqual((await a.press("memberlanguageset", { values: { "ma-lang": "vi" } })).sent[0].body, { language: "vi" });
  assert.deepEqual((await a.press("memberlanguageset", { values: { "ma-lang": "" } })).sent[0].body, { language: null });
  assert.equal(a.p.requests.at(-1).op, "memberlanguage", "R8: read again after the act");
});

test("R3 setpassword: current and new, the new typed twice alike, sent only when alike (setup-page R3's rule)", async () => {
  const a = await open("account", { me: MEMBER, table: accountTable(MEMBER) });
  const differ = await a.press("setpassword", { values: { "ma-cur0": "old password one", "ma-new0": "a new long password", "ma-again0": "a new long passwerd" } });
  assert.deepEqual(differ.sent, []);
  assert.equal(a.refused.key, "screen.account.password.differ");
  const empty = await a.press("setpassword", { values: { "ma-cur0": "x", "ma-new0": "", "ma-again0": "" } });
  assert.deepEqual(empty.sent, []);
  const ok = await a.press("setpassword", { values: { "ma-cur0": "old password one", "ma-new0": "a new long password", "ma-again0": "a new long password" } });
  assert.deepEqual(ok.sent[0].body, { current: "old password one", password: "a new long password" });
  has(a, "screen.account.password.changed");
  assert.ok(!a.html.includes("a new long password") && !a.html.includes("old password one"));
});

test("R3 expertisedeclare; signerrevokeown for the member's own key", async () => {
  const a = await open("account", { me: MEMBER, table: accountTable(MEMBER) });
  has(a, "screen.account.expertise.confirmed", { label: "Tenant organiser" });
  has(a, "screen.account.expertise.declared", { label: "Interpreter" });
  assert.deepEqual((await a.press("expertisedeclare", { values: { "ma-exp": " Accounting " } })).sent[0].body, { label: "Accounting" });
  assert.deepEqual((await a.press("expertisedeclare", { values: { "ma-exp": "" } })).sent, []);
  const key = acts(a.tree).find((b) => b.attrs["data-act"] === "signerrevokeown").attrs["data-key"];
  assert.deepEqual((await a.press("signerrevokeown", { data: { key } })).sent[0].body, { keyB64: key });
});

test("R3 a member without a capability an act needs is not offered it; the founder's session is", async () => {
  const r = await open("account", { me: READER, table: accountTable(READER) });
  assert.ok(ops(r).includes("setpassword"));
  const f = await open("account", { me: { ...ADMIN, member: "admin", handle: null }, table: accountTable({ ...ADMIN, member: "admin" }) });
  assert.ok(ops(f).includes("setpassword"));
  const failed = await open("account", { me: MEMBER, table: accountTable(MEMBER, { signerlist: "none", expertiselist: refuse("NO_SUCH_MEMBER") }) });
  assert.equal(all(failed.tree, (e) => e.attrs["data-state"] === "failed").length, 2);
});

test("R12 account draws the appearance control by cs.appearance(), never the shell's buttons of its own", () => {
  const spec = SCREENS.find((x) => x.id === "account");
  const kit = { w: (k) => k, esc: (x) => String(x), date: () => "", title: () => "", state: () => "", sec: (k, inner) => inner, act: () => "", level: () => "prompt", appearance: () => "<KIT-APPEARANCE>" };
  const html = spec.render(kit, { me: MEMBER, data: {}, ui: {} });
  assert.ok(html.includes("<KIT-APPEARANCE>"), "the kit's control");
  assert.ok(!/data-shell="theme"/.test(html), "no theme button of its own");
});

test("R21 Sign out on this device (signout) and Sign out everywhere (signouteverywhere), each then drawing front's signed-out state (cs.signedOut, interface-shell R46)", async () => {
  for (const op of ["signout", "signouteverywhere"]) {
    const a = await open("account", { me: MEMBER, table: accountTable(MEMBER, { [op]: () => env({ ok: true, ended: 1 }) }) });
    const r = await a.press(op);
    assert.deepEqual([r.sent[0].op, r.sent[0].body], [op, {}]);
    const spec = a.s.acts.find((x) => x.op === op);
    let out = 0;
    spec.done({}, { ok: true, ended: 1 }, { signedOut: () => { out += 1; } });
    assert.equal(out, 1, `${op} then the signed-out state`);
  }
  // control: a refused sign-out does not draw the signed-out state
  const no = await open("account", { me: MEMBER, table: accountTable(MEMBER, { signout: refuse("NOT_SIGNED_IN") }) });
  await no.press("signout");
  assert.ok(no.refused, "drawn beside the act");
});

test("R22 Register your signing key: made by the kit's signer in this browser (cs.signer.publicLine), its public line sent with signerregisterown; no pasted line is asked; declined sends nothing", async () => {
  const a = await open("account", { me: MEMBER, table: accountTable(MEMBER) });
  assert.ok(!all(a.tree, (e) => e.tag === "input" && e.attrs.id === "ma-pub").length, "no field for a pasted line");
  has(a, "signing.ceremony.keepkey");
  const r = await a.press("signerregisterown", { values: { "ma-keep": true }, wait: true });
  const body = r.sent.find((x) => x.op === "signerregisterown").body;
  assert.ok(/^AAAAC3NzaC1lZDI1NTE5AAAAI[A-Za-z0-9+/=]+$/.test(body.keyB64), "an Ed25519 public key made here");
  assert.equal(a.b.idb.size >= 1, true, "kept on this device, as ticked");
  assert.ok(!JSON.stringify(r.sent).includes("PRIVATE"), "nothing but the public line");
  // declined: nothing is sent
  const spec = a.s.acts.find((x) => x.op === "signerregisterown");
  assert.deepEqual(await spec.send({}, {}, { value: () => false, signer: { publicLine: async () => null } }), { refuse: "screen.account.key.declined" });
});
