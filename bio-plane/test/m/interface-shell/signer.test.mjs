/* interface-shell R40, R41, R42: the signer kit `cs.signer`: a key made in the browser and never sent, kept on the device
   only by the member's choice (non-extractable, IndexedDB) or given out as a `BIOKEY1.` key file; one confirmation signs
   a listed set; nothing of the key, passphrase or signatures written anywhere else. */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { webcrypto } from "node:crypto";
import { verifySshsig, NS_RATIFY } from "../../../src/sshsig.mjs";
import { boot, STORE_KEY } from "./harness.mjs";

/* `account`'s two signer acts drive the kit: register (keep from the screen's own tick) and sign a listed set */
const ACCOUNT = {
  id: "account", reads: () => ({}),
  acts: [
    { op: "signerregisterown", async send(view, el, cs) { const r = await cs.signer.register({ keep: cs.value("keep") }); cs.set("reg", JSON.stringify(r)); return null; } },
    { op: "signerrevokeown", async send(view, el, cs) {
      const r = await cs.signer.sign([{ label: "The case", bytes: "bio-ratify case-1 aaa\n", namespace: "bio-ratify" }, { label: "A finding", bytes: "bio-ratify f-2 bbb\n", namespace: "bio-ratify" }, { label: "Evidence", bytes: "bio-docket d-3 1 ccc\n", namespace: "bio-docket" }]);
      cs.set("sig", JSON.stringify(r)); return null; } },
    { op: "setpassword", async send(view, el, cs) { cs.set("line", JSON.stringify(await cs.signer.publicLine({ keep: true }))); return null; } },
  ],
  render(cs, view) {
    return '<label><input type="checkbox" id="keep"> ' + cs.w("signing.ceremony.keepkey") + "</label>" + cs.act("signerregisterown") + cs.act("signerrevokeown") + cs.act("setpassword")
      + '<pre id="reg">' + cs.esc(view.ui.reg || "") + '</pre><pre id="sig">' + cs.esc(view.ui.sig || "") + '</pre><pre id="line">' + cs.esc(view.ui.line || "") + "</pre>";
  },
};
const out = (p, id) => { const t = p.doc.getElementById(id).textContent; return t ? JSON.parse(t) : null; };
async function press(p, op) {
  await p.click(`button[data-act="${op}"]`);
  const go = p.root().querySelector('[data-shell="reason-send"], [data-shell="confirm"]');
  if (go) { const ta = p.root().querySelector("[data-slot] textarea"); if (ta) ta.value = "mine"; await p.click(go); }
}
/* the page runs PBKDF2 for a key file: let it finish */
async function until(p, f) { for (let i = 0; i < 400 && !f(); i++) await new Promise((r) => setTimeout(r, 10)); await p.settle(); }
const overlay = (p, kind) => p.root().querySelector(`[data-overlay="${kind}"]`);
const STATEMENTS = ["bio-ratify case-1 aaa\n", "bio-ratify f-2 bbb\n", "bio-docket d-3 1 ccc\n"];
const NS = ["bio-ratify", "bio-ratify", "bio-docket"];

function sshKeygenVerifies(sig, message, ns, line) {
  const dir = mkdtempSync(join(tmpdir(), "shell-sig-"));
  try {
    writeFileSync(join(dir, "allowed"), "signer " + line.split(" ").slice(0, 2).join(" ") + "\n");
    writeFileSync(join(dir, "sig"), sig);
    execFileSync("ssh-keygen", ["-Y", "verify", "-f", join(dir, "allowed"), "-I", "signer", "-n", ns, "-s", join(dir, "sig")], { input: message, stdio: ["pipe", "pipe", "pipe"] });
    return true;
  } catch { return false; } finally { rmSync(dir, { recursive: true, force: true }); }
}

test("R40 a key kept by the member's choice is made in the browser, kept as a non-extractable key in this origin's IndexedDB, survives a reload, and is never sent; it answers the public line for signerregisterown", async () => {
  const idb = new Map();
  const p = await boot({ screens: [ACCOUNT], path: "/app/account", idb });
  p.doc.getElementById("keep").checked = true;
  await press(p, "signerregisterown");
  await until(p, () => out(p, "reg"));
  const reg = out(p, "reg");
  assert.equal(reg.ok, true);
  assert.equal(reg.kept, true);
  assert.match(reg.keyB64, /^AAAAC3NzaC1lZDI1NTE5AAAAI[A-Za-z0-9+/=]+$/, "an ssh-ed25519 wire key");
  assert.equal(reg.line, "ssh-ed25519 " + reg.keyB64 + " bio-ratify");
  const kept = idb.get("civicsmith-signer").get("keys").get("own");
  assert.equal(kept.priv.extractable, false);
  assert.equal(kept.priv.type, "private");
  await assert.rejects(webcrypto.subtle.exportKey("pkcs8", kept.priv), "not exportable");
  for (const r of p.requests) assert.ok(!JSON.stringify(r).includes(reg.keyB64.slice(30, 50)), "the key is never sent by the kit");
  /* a reload: the same key, held */
  const q = await boot({ screens: [ACCOUNT], path: "/app/account", idb });
  await press(q, "setpassword");
  await until(q, () => out(q, "line"));
  assert.equal(out(q, "line"), reg.line);
});

test("R40 R42 unticked, the page makes a key file in signatures R43's passphrase form (BIOKEY1.), typed twice alike, and keeps nothing: IndexedDB and storage hold no key; two passphrases that differ make none", async () => {
  const idb = new Map();
  const PASS = "SENTINEL-passphrase-42";
  const p = await boot({ screens: [ACCOUNT], path: "/app/account", idb });
  await press(p, "signerregisterown");
  assert.ok(overlay(p, "register"), "the kit's own dialog asks the passphrase");
  p.doc.getElementById("cs-key-pass").value = PASS;
  p.doc.getElementById("cs-key-again").value = "something else";
  await p.click('[data-shell="dialog-yes"]');
  assert.ok(overlay(p, "register").querySelector('[data-gap="refused"]'), "differ: refused, nothing made");
  assert.equal(p.files.length, 0);
  p.doc.getElementById("cs-key-pass").value = PASS;
  p.doc.getElementById("cs-key-again").value = PASS;
  await p.click('[data-shell="dialog-yes"]');
  await until(p, () => out(p, "reg"));
  const reg = out(p, "reg");
  assert.equal(reg.ok, true);
  assert.equal(reg.kept, false);
  assert.equal(p.files.length, 1);
  assert.equal(p.files[0].name, "bio-signing-key.txt");
  const file = (await p.files[0].blob.text()).trim();
  assert.match(file, /^BIOKEY1\.bio-ratify\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+\.600000$/);
  assert.equal(p.objectUrls[0].released, true);
  assert.equal(idb.has("civicsmith-signer") ? idb.get("civicsmith-signer").get("keys").size : 0, 0, "IndexedDB holds nothing");
  for (const v of [...p.local.values(), ...p.store.values()]) { assert.ok(!String(v).includes(PASS)); assert.ok(!String(v).includes("BIOKEY")); }
  for (const r of p.requests) assert.ok(!JSON.stringify(r).includes(PASS) && !JSON.stringify(r).includes("BIOKEY"));
  assert.equal(p.doc.getElementById("cs-key-pass"), null, "the dialog closed");
  assert.ok(!p.root().innerHTML.includes(PASS), "the passphrase drawn nowhere");
  /* "Use a key file you already have": a later page, with nothing kept, loads it for the sitting and signs */
  const q = await boot({ screens: [ACCOUNT], path: "/app/account", idb: new Map() });
  await press(q, "signerrevokeown");
  const dlg = overlay(q, "sign");
  assert.ok(dlg.querySelector("#cs-key-file"), "the kit's own key-file control inside sign");
  q.doc.getElementById("cs-key-file").value = file;
  q.doc.getElementById("cs-key-filepass").value = "wrong one";
  await q.click('[data-shell="dialog-yes"]');
  await until(q, () => overlay(q, "sign") && overlay(q, "sign").querySelector('[data-gap="refused"]'));
  assert.ok(overlay(q, "sign").querySelector('[data-gap="refused"]'), "a wrong passphrase loads nothing");
  q.doc.getElementById("cs-key-file").value = file;
  q.doc.getElementById("cs-key-filepass").value = PASS;
  await q.click('[data-shell="dialog-yes"]');
  await until(q, () => out(q, "sig"));
  const sig = out(q, "sig");
  assert.equal(sig.ok, true);
  assert.equal(sig.keyB64, reg.keyB64, "the same key, from its file");
  for (const v of [...q.local.values(), ...q.store.values()]) assert.ok(!String(v).includes("BEGIN SSH SIGNATURE"));
});

test("R41 cs.signer.sign draws What your key signs, exactly (each statement), asks one confirmation for the whole list, and answers one SSHSIG per statement in list order, each verifying with signatures.verifySshsig and ssh-keygen -Y verify in its namespace", async () => {
  const idb = new Map();
  const p = await boot({ screens: [ACCOUNT], path: "/app/account", idb });
  p.doc.getElementById("keep").checked = true;
  await press(p, "signerregisterown");
  await until(p, () => out(p, "reg"));
  const reg = out(p, "reg");
  await press(p, "signerrevokeown");
  const dlg = overlay(p, "sign");
  assert.equal(dlg.querySelector("h2").textContent, "What your key signs, exactly");
  assert.deepEqual(dlg.querySelectorAll("li pre").map((x) => x.textContent), STATEMENTS);
  assert.deepEqual(dlg.querySelectorAll("li b").map((x) => x.textContent), ["The case", "A finding", "Evidence"]);
  assert.equal(dlg.querySelector("#cs-key-file"), null, "a kept key asks for no file");
  assert.equal(p.root().querySelectorAll('[data-shell="dialog-yes"]').length, 1, "one confirmation for the whole list");
  await p.click('[data-shell="dialog-yes"]');
  await until(p, () => out(p, "sig"));
  const r = out(p, "sig");
  assert.equal(r.ok, true);
  assert.equal(r.signatures.length, 3);
  for (let i = 0; i < 3; i++) {
    const msg = new TextEncoder().encode(STATEMENTS[i]);
    const v = await verifySshsig(r.signatures[i], msg, NS[i], [reg.line]);
    assert.equal(v.ok, true, "verifySshsig " + i + " " + JSON.stringify(v));
    assert.equal(sshKeygenVerifies(r.signatures[i], STATEMENTS[i], NS[i], reg.line), true, "ssh-keygen " + i);
    /* control: not in another namespace */
    assert.equal((await verifySshsig(r.signatures[i], msg, NS[i] === NS_RATIFY ? "bio-docket" : NS_RATIFY, [reg.line])).ok, false);
  }
  assert.match(r.signatures[0], /^-----BEGIN SSH SIGNATURE-----\n/);
});

test("R41 a declined confirmation answers no signature (declined), signing nothing", async () => {
  const p = await boot({ screens: [ACCOUNT], path: "/app/account", idb: new Map() });
  p.doc.getElementById("keep").checked = true;
  await press(p, "signerregisterown");
  await until(p, () => out(p, "reg"));
  await press(p, "signerrevokeown");
  assert.ok(p.root().querySelector('[data-overlay="sign"]').textContent.includes("Your device is asking you to confirm"));
  await p.click('[data-shell="dialog-no"]');
  await until(p, () => out(p, "sig"));
  assert.deepEqual(out(p, "sig"), { ok: false, declined: true });
  assert.equal(p.root().querySelector('[data-overlay="sign"]'), null);
});

test("R42 the only key material any page keeps is the non-extractable kept key; no key, passphrase or signature reaches storage, an address or a request (sentinels)", async () => {
  const idb = new Map();
  const PASS = "SENTINEL-pp-7731";
  const p = await boot({ screens: [ACCOUNT], path: "/app/account", idb });
  p.doc.getElementById("keep").checked = true;
  await press(p, "signerregisterown");
  await until(p, () => out(p, "reg"));
  await press(p, "signerrevokeown");
  await p.click('[data-shell="dialog-yes"]');
  await until(p, () => out(p, "sig"));
  const sigs = out(p, "sig").signatures;
  const q = await boot({ screens: [ACCOUNT], path: "/app/account", idb: new Map() });
  await press(q, "signerregisterown");
  q.doc.getElementById("cs-key-pass").value = PASS;
  q.doc.getElementById("cs-key-again").value = PASS;
  await q.click('[data-shell="dialog-yes"]');
  await until(q, () => out(q, "reg"));
  for (const page of [p, q]) {
    const seen = JSON.stringify([...page.local.entries(), ...page.store.entries(), page.requests.map((r) => [r.url, r.body, r.headers]), page.location.pathname, page.location.hash]);
    for (const s of sigs) assert.ok(!seen.includes(s.split("\n")[1]), "no signature");
    assert.ok(!seen.includes(PASS), "no passphrase");
    assert.ok(!seen.includes("BIOKEY"), "no key file");
    assert.ok(!/"d":"[A-Za-z0-9_-]{43}"/.test(seen), "no private key in JWK form");
  }
  const stored = [...idb.get("civicsmith-signer").get("keys").values()];
  assert.equal(stored.length, 1);
  assert.equal(stored[0].priv.extractable, false, "the one key kept, non-extractable");
  assert.equal(p.local.has(STORE_KEY), true);
});
