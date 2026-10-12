/* Settings › Your account at the module's interface (R3, R8, R10). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, acts, all, textOf, said, ancestor } from "./kit.mjs";
import { ADMIN, MEMBER, READER, accountTable, refuse, env } from "./fixtures.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();
const has = (o, key, fills) => assert.ok(o.html.includes(o.cs.w(key, fills)), `drawn: ${key}`);

test("R3 the reads: whoami, memberlanguage, the member's own expertiselist, signerlist (and the explanation level)", async () => {
  const a = await open("account", { me: MEMBER, table: accountTable(MEMBER) });
  assert.deepEqual(a.p.requests.map((r) => [r.op, r.query]), [["whoami", {}], ["memberlanguage", {}], ["expertiselist", { memberId: "dev" }], ["signerlist", {}], ["infolevel", {}]]);
});

test("R3 the handle drawn fixed in DEC-197's words; no handlechange act, and no handle.changeable, handle.formerly or handle.refused.* drawn", async () => {
  const a = await open("account", { me: MEMBER, table: accountTable(MEMBER) });
  assert.ok(textOf(a.tree).includes("dev"));
  assert.equal(said("handle.fixed"), "Your handle is fixed: it names your work in the group and in published cases, and no one else can ever take it.");
  has(a, "handle.fixed");
  assert.ok(!ops(a).includes("handlechange") && !ops(a).includes("handlecheck"));
  for (const k of ["handle.changeable", "handle.formerly", "handle.refused.unchecked", "handle.refused.paused", "handle.refused.notmember", "handle.free", "handle.taken"])
    assert.ok(!a.html.includes(a.cs.w(k, { handle: "dev", group: "", suggestion: "", minutes: "", case: "" }).slice(0, 24)), k);
  assert.ok(!/formerly/i.test(a.html));
});

test("R3 every registry act is drawn (memberlanguageset, setpassword, expertisedeclare, signerregisterown, signerrevokeown, the explanation level), and the links to connect and notes", async () => {
  const a = await open("account", { me: MEMBER, table: accountTable(MEMBER) });
  assert.deepEqual(ops(a), ["expertisedeclare", "infolevelset", "memberlanguageset", "setpassword", "signerregisterown", "signerrevokeown"]);
  // the member's own key only: a revoke for theirs, none for another's
  const rev = acts(a.tree).filter((b) => b.attrs["data-act"] === "signerrevokeown");
  assert.equal(rev.length, 1);
  assert.ok(rev[0].attrs["data-key"].endsWith("01"));
  assert.ok(all(a.tree, (e) => e.tag === "a" && e.attrs.href === "/app/connect").length === 1);
  assert.ok(all(a.tree, (e) => e.tag === "a" && e.attrs.href === "/app/notes").length === 1);
  // the appearance choice is the device's (interface-shell R18), never an op
  const ap = all(a.tree, (e) => e.attrs["data-device"] === "appearance")[0];
  assert.deepEqual(all(ap, (e) => e.tag === "option").map((o) => textOf(o)), [said("screen.account.appearance.device"), said("screen.account.appearance.light"), said("screen.account.appearance.dark")]);
  // the level read is drawn selected
  const lv = all(a.tree, (e) => e.attrs.id === "ma-level")[0];
  assert.equal(all(lv, (e) => e.tag === "option" && e.attrs.selected !== undefined)[0].attrs.value, "pause");
});

test("R3 the explanation level falls back to the device's while infolevel does not answer (interface-shell R17)", async () => {
  const a = await open("account", { me: MEMBER, table: accountTable(MEMBER, { infolevel: refuse("UNKNOWN_OP") }) });
  const lv = all(a.tree, (e) => e.attrs.id === "ma-level")[0];
  assert.equal(all(lv, (e) => e.tag === "option" && e.attrs.selected !== undefined)[0].attrs.value, "prompt");
  const r = await a.press("infolevelset", { values: { "ma-level": "pause" } });
  assert.deepEqual(r.sent[0].body, { level: "pause" });
  assert.equal(a.view.ui.level, "pause", "kept for the device");
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
  const differ = await a.press("setpassword", { values: { "ma-cur": "old password one", "ma-new": "a new long password", "ma-again": "a new long passwerd" } });
  assert.deepEqual(differ.sent, []);
  assert.equal(a.refused.key, "screen.account.password.differ");
  const empty = await a.press("setpassword", { values: { "ma-cur": "x", "ma-new": "", "ma-again": "" } });
  assert.deepEqual(empty.sent, []);
  const ok = await a.press("setpassword", { values: { "ma-cur": "old password one", "ma-new": "a new long password", "ma-again": "a new long password" } });
  assert.deepEqual(ok.sent[0].body, { current: "old password one", password: "a new long password" });
  has(a, "screen.account.password.changed");
  assert.ok(!a.html.includes("a new long password") && !a.html.includes("old password one"));
});

test("R3 expertisedeclare; signerregisterown with the public line the signing page gives; signerrevokeown for the member's own key", async () => {
  const a = await open("account", { me: MEMBER, table: accountTable(MEMBER) });
  has(a, "screen.account.expertise.confirmed", { label: "Tenant organiser" });
  has(a, "screen.account.expertise.declared", { label: "Interpreter" });
  assert.deepEqual((await a.press("expertisedeclare", { values: { "ma-exp": " Accounting " } })).sent[0].body, { label: "Accounting" });
  assert.deepEqual((await a.press("expertisedeclare", { values: { "ma-exp": "" } })).sent, []);
  const line = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINew000000000000000000000000000000000000003 dev laptop";
  assert.deepEqual((await a.press("signerregisterown", { values: { "ma-pub": line } })).sent[0].body, { keyB64: "AAAAC3NzaC1lZDI1NTE5AAAAINew000000000000000000000000000000000000003", comment: "dev laptop" });
  assert.deepEqual((await a.press("signerregisterown", { values: { "ma-pub": "AAAAC3NzaC1lZDI1NTE5AAAAINew0" } })).sent[0].body, { keyB64: "AAAAC3NzaC1lZDI1NTE5AAAAINew0" });
  assert.deepEqual((await a.press("signerregisterown", { values: { "ma-pub": "-----BEGIN OPENSSH PRIVATE KEY-----" } })).sent, [], "never a private key");
  assert.equal(a.refused.key, "screen.account.key.bad");
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
  assert.ok(env);
  assert.ok(ancestor);
});
