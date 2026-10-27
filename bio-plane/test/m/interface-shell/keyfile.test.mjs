/* interface-shell R115, R116 (fix round 4, C51; K4429): a key file chosen on the page reaches the signer without the dialog's box. Driven through the
   page as a signing screen draws it: a file chosen in a real file input, read by `cs.keyFile`, handed to `cs.signer.sign(statements, {keyFile})`, the
   dialog asking only the passphrase, every signature verifying, and the signer then holding the key for the sitting. Each test was seen failing first
   (against the shell as it stood before the C51 job's changes, as the record states). */
import "./register.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { verifySshsig } from "../../../src/sshsig.mjs";
import { boot } from "./harness.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const TEXT = "bio-ratify case-1 aaa\n";
/* the ceremony's key-file step as `screens-publish` draws it: a file input, `cs.keyFile` on the press, then `sign` with what it answered */
const SIGNING = {
  id: "account", reads: () => ({}),
  acts: [
    { op: "signerregisterown", async send(view, el, cs) { const r = await cs.signer.register({ keep: false, passphrase: cs.value("pp"), defer: true }); cs.set("reg", JSON.stringify(r)); return null; } },
    { op: "signerrevokeown", async send(view, el, cs) {
      cs.set("before", JSON.stringify(await cs.signer.held()));
      const k = await cs.keyFile("kf");
      if (!k.ok) return { refuse: k.word };
      const r = await cs.signer.sign([{ label: "The case", bytes: "bio-ratify case-1 aaa\n", namespace: "bio-ratify" }], { keyFile: k });
      cs.set("sig", JSON.stringify(r));
      cs.set("after", JSON.stringify(await cs.signer.held()));
      return null; } },
  ],
  render(cs, view) {
    return '<input id="pp"><input id="kf" type="file">' + cs.act("signerregisterown") + cs.act("signerrevokeown")
      + ["reg", "sig", "before", "after"].map((n) => '<pre id="' + n + '">' + cs.esc(view.ui[n] || "") + "</pre>").join("");
  },
};
const out = (p, id) => { const t = p.doc.getElementById(id).textContent; return t ? JSON.parse(t) : null; };
const fileOf = (text, { fail = false } = {}) => ({ name: "bio-signing-key.txt", size: text.length, text: async () => { if (fail) throw new Error("denied"); return text; } });
async function press(p, op) {
  await p.click(`button[data-act="${op}"]`);
  const go = p.root().querySelector('[data-shell="reason-send"], [data-shell="confirm"]');
  if (go) { const ta = p.root().querySelector("[data-slot] textarea"); if (ta) ta.value = "mine"; await p.click(go); }
}
async function until(p, f) { for (let i = 0; i < 400 && !f(); i++) await new Promise((r) => setTimeout(r, 10)); await p.settle(); }
const overlay = (p, kind) => p.root().querySelector(`[data-overlay="${kind}"]`);
async function keyFileMade(pass) {
  const p = await boot({ screens: [SIGNING], path: "/app/account", idb: new Map() });
  p.doc.getElementById("pp").value = pass;
  await press(p, "signerregisterown");
  await until(p, () => out(p, "reg"));
  return out(p, "reg");
}

test("R115 R116 (C51) a key file chosen in the page's file input is read and signed with: the dialog asks only its passphrase, the signatures verify, and the signer then holds the key; no key, file text or passphrase is sent or stored", async () => {
  const PASS = "SENTINEL-c51-pass";
  const reg = await keyFileMade(PASS);
  assert.ok(reg.file.startsWith("BIOKEY1."));
  const q = await boot({ screens: [SIGNING], path: "/app/account", idb: new Map() });
  q.doc.getElementById("kf").files = [fileOf(reg.file)];
  const sent = q.requests.length;
  await press(q, "signerrevokeown");
  const dlg = overlay(q, "sign");
  assert.ok(dlg, "the sign dialog is drawn");
  assert.equal(dlg.querySelector("#cs-key-file"), null, "no box for the file's text: the page handed it over");
  assert.ok(dlg.querySelector("#cs-key-filepass"), "the passphrase is asked");
  assert.equal(out(q, "before").held, false, "before the passphrase opens it, the signer holds no key");
  q.doc.getElementById("cs-key-filepass").value = PASS;
  await q.click('[data-shell="dialog-yes"]');
  await until(q, () => out(q, "sig"));
  const sig = out(q, "sig");
  assert.equal(sig.ok, true);
  assert.equal(sig.keyB64, reg.keyB64, "the key the file holds");
  assert.equal((await verifySshsig(sig.signatures[0], new TextEncoder().encode(TEXT), "bio-ratify", [reg.line])).ok, true);
  const after = out(q, "after");
  assert.equal(after.held, true, "once the file is opened the signer holds the key for the sitting");
  assert.equal(after.kept, false, "not kept on the device");
  assert.equal(after.line, reg.line);
  for (const v of [...q.local.values(), ...q.store.values()]) assert.ok(!String(v).includes("BIOKEY") && !String(v).includes(PASS), "nothing stored");
  for (const r of q.requests.slice(sent)) assert.ok(!JSON.stringify(r).includes("BIOKEY") && !JSON.stringify(r).includes(PASS), "nothing sent: " + r.op);
});

test("R115 R116 (C51) control: no file chosen, an unreadable one and an empty one draw the key's own word beside the act, open no dialog and send nothing", async () => {
  const q = await boot({ screens: [SIGNING], path: "/app/account", idb: new Map() });
  const sent = q.requests.length;
  await press(q, "signerrevokeown");
  assert.equal(overlay(q, "sign"), null, "no dialog");
  const beside = () => [...q.root().querySelectorAll("[data-slot]")].map((s) => s.textContent).join(" ");
  assert.ok(beside().includes(word("shell.keyfile.none")), "nothing chosen: " + beside());
  q.doc.getElementById("kf").files = [fileOf("x", { fail: true })];
  await press(q, "signerrevokeown");
  assert.ok(beside().includes(word("shell.keyfile.unreadable")), "unreadable: " + beside());
  q.doc.getElementById("kf").files = [fileOf("  \n")];
  await press(q, "signerrevokeown");
  assert.ok(beside().includes(word("shell.keyfile.empty")), "empty: " + beside());
  assert.equal(overlay(q, "sign"), null);
  assert.equal(q.requests.length, sent, "nothing sent");
});
