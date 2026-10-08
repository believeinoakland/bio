/* signatures: the signer page's keys (R43, R44; build/requirements/signatures.md), tested at the page's interface:
 * the page the module serves (`SIGN_HTML`), its own script run against a stub DOM, driven through its buttons and
 * fields as a person would, with what it copies and downloads captured. Every private key the page gives out is
 * read back with the page's own loader, and every key is checked by signing with it and verifying with
 * `verifySshsig` (and stock `ssh-keygen` where present). Throwaway passphrases and keys only; no network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { webcrypto } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import vm from "node:vm";

import { SIGN_HTML } from "../../../src/signpage.mjs";
import { verifySshsig, NS_RELEASE, NS_RATIFY } from "../../../src/sshsig.mjs";
import { seedFromEnvelope, signSshsig, signerPublicLine } from "../../../scripts/sign-sshsig.mjs";

const HAVE_SSH_KEYGEN = !spawnSync("ssh-keygen", ["-Q"]).error;
const NO_SSH_KEYGEN = HAVE_SSH_KEYGEN ? false : "ssh-keygen is not on PATH";
const DIR = mkdtempSync(join(tmpdir(), "m-signatures-keys-"));
process.on("exit", () => rmSync(DIR, { recursive: true, force: true }));

const b64 = (bytes) => Buffer.from(bytes).toString("base64");
const PASS = "correct horse battery staple";
const RECOVERY = "bio-release-recovery";
const PUB_LINE = (label) => new RegExp(`^ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI[A-Za-z0-9+/]{43} ${label}$`);
const ANY_PRIVATE = /BIOKEY(?:-RAW)?1\.[A-Za-z0-9.+/=-]+/g;

/* The served page's own script against a stub DOM, recording what it copies and what it downloads. */
function loadPage() {
  const script = SIGN_HTML.slice(SIGN_HTML.lastIndexOf("<script>") + 8, SIGN_HTML.lastIndexOf("</script>"));
  const els = new Map();
  const el = () => ({ value: "", innerHTML: "", disabled: false, files: [], onclick: null, textContent: "",
    classList: { toggle() {} }, setAttribute() {} });
  const copied = [], blobs = new Map(), downloads = [];
  const sandbox = {
    crypto: webcrypto, TextEncoder, atob, btoa, console, setTimeout: () => 0, Blob,
    URL: { createObjectURL: (blob) => { const u = `blob:${blobs.size}`; blobs.set(u, blob); return u; }, revokeObjectURL() {} },
    navigator: { clipboard: { writeText: async (t) => { copied.push(t); } } },
    document: {
      getElementById: (id) => (els.has(id) || els.set(id, el()), els.get(id)),
      addEventListener: () => {},
      createElement: (tag) => ({ tag, style: {}, select() {},
        click() { if (tag === "a") downloads.push({ name: this.download, blob: blobs.get(this.href) }); } }),
      body: { appendChild() {}, removeChild() {} }, execCommand: () => true,
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(`${script}\n;globalThis.__page = { KEYS, parseKeyString, keysFromSeed, pubLine };`, sandbox);
  const page = { ...sandbox.__page, el: (id) => sandbox.document.getElementById(id), copied, downloads };
  page.file = async (i = -1) => { const d = downloads.at(i); return { name: d.name, text: await d.blob.text() }; };
  return page;
}

/* The text of each copy box in an answer, keyed by its label. */
const boxes = (html) => Object.fromEntries([...html.matchAll(
  /<label for="box\d+">([^<]*)<\/label>[\s\S]*?<textarea[^>]*>([^<]*)<\/textarea>/g)].map((m) => [m[1], m[2]]));

/* Press Generate with these two passphrase fields. */
async function generate(page, pass = "", again = pass) {
  page.el("gen-pass").value = pass;
  page.el("gen-pass2").value = again;
  await page.el("gen").onclick();
  return page.el("gen-out").innerHTML;
}

/* Press "Make a recovery key" with these two passphrase fields. */
async function makeRecovery(page, pass = "", again = pass) {
  page.el("rec-pass").value = pass;
  page.el("rec-pass2").value = again;
  await page.el("rec-gen").onclick();
  return page.el("rec-out").innerHTML;
}

/* Load a private key through the page's own "Load a key you already have". */
async function load(page, blob, pass = "") {
  page.el("load-blob").value = blob;
  page.el("load-pass").value = pass;
  await page.el("load").onclick();
  return page.el("load-out").innerHTML;
}

/* Sign an asset with the release slot through the page's "Sign a release" button; the manifest it writes. */
async function signRelease(page, bytes) {
  page.el("rel-file").files = [{ name: "bio-plane.bundled.mjs", arrayBuffer: async () => bytes.buffer.slice(0) }];
  await page.el("rel-sign").onclick();
  const text = boxes(page.el("rel-out").innerHTML);
  return JSON.parse(Object.values(text)[0].replace(/&lt;/g, "<"));
}

const ASSET = new Uint8Array(4000).map((_, i) => (i * 29 + 3) % 256);

/* A key the page gave out works: loaded back by the page, it signs a release that verifies under its public line. */
async function signsAsRelease(blob, pass, pub) {
  const page = loadPage();
  await load(page, blob, pass);
  const m = await signRelease(page, ASSET);
  assert.equal(m.signer, pub);
  return verifySshsig(m.sig, ASSET, NS_RELEASE, [pub]);
}

/* ===================================================================== R43 */

test("R43 with no passphrase, Generate gives the raw form as before: both private keys BIOKEY-RAW1 everywhere they are given out, the public lines unchanged, and no raw showing offered", async () => {
  const page = loadPage();
  const out = await generate(page);
  const b = boxes(out);
  const rel = b["Release key: private, keep this"], rat = b["Ratification key: private, keep this"];
  assert.match(rel, /^BIOKEY-RAW1\.bio-release\.[A-Za-z0-9+/]{43}=$/);
  assert.match(rat, /^BIOKEY-RAW1\.bio-ratify\.[A-Za-z0-9+/]{43}=$/);
  const pubs = b["Both public keys: paste these into the session"].split("\n");
  assert.equal(pubs.length, 2);
  assert.match(pubs[0], PUB_LINE("bio-release"));
  assert.match(pubs[1], PUB_LINE("bio-ratify"));
  assert.equal(pubs[0], signerPublicLine(rel, "bio-release"));
  assert.equal(pubs[1], signerPublicLine(rat, "bio-ratify"));
  assert.doesNotMatch(out, /show-raw|BIOKEY1\./);
  assert.match(out, /These are development keys with no passphrase/);
  /* Copied and downloaded: the same raw keys. */
  await page.el("copy-all").onclick({ target: page.el("copy-all") });
  page.el("dl").onclick();
  const file = await page.file();
  assert.equal(file.name, "bio-signing-keys.txt");
  for (const text of [page.copied.at(-1), file.text]) {
    assert.deepEqual(text.match(ANY_PRIVATE), [rel, rat]);
    for (const p of pubs) assert.ok(text.includes(`public:  ${p}\n`));
  }
  /* Each key is the one its public line names. */
  assert.equal((await signsAsRelease(rel, "", pubs[0])).ok, true);
});

test("R43 with a passphrase, every private key Generate shows, copies or downloads is the passphrase-protected form, carrying no form of either seed; the public lines are as before", async () => {
  for (const pass of [PASS, "x", "pässwörd ✓ with spaces "]) {
    const page = loadPage();
    const out = await generate(page, pass);
    /* The passphrase fields are emptied once read. */
    assert.equal(page.el("gen-pass").value, "");
    assert.equal(page.el("gen-pass2").value, "");
    const b = boxes(out);
    const rel = b["Release key: private, keep this"], rat = b["Ratification key: private, keep this"];
    assert.match(rel, /^BIOKEY1\.bio-release\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+\.600000$/);
    assert.match(rat, /^BIOKEY1\.bio-ratify\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+\.600000$/);
    const pubs = b["Both public keys: paste these into the session"].split("\n");
    assert.match(pubs[0], PUB_LINE("bio-release"));
    assert.match(pubs[1], PUB_LINE("bio-ratify"));
    /* Unlocked with the passphrase, each is the key its public line names, and the one loaded into the tab. */
    const seeds = {};
    for (const [label, blob, pub, slot] of [["bio-release", rel, pubs[0], "release"], ["bio-ratify", rat, pubs[1], "ratify"]]) {
      const { label: got, seed } = await page.parseKeyString(blob, pass);
      assert.equal(got, label);
      seeds[label] = seed;
      assert.equal(page.pubLine((await page.keysFromSeed(seed)).raw32, label), pub);
      assert.equal(page.pubLine(page.KEYS[slot].raw32, label), pub);
    }
    await page.el("copy-all").onclick({ target: page.el("copy-all") });
    page.el("dl").onclick();
    const file = await page.file();
    assert.equal(file.name, "bio-signing-keys.txt");
    for (const text of [out, page.copied.at(-1), file.text]) {
      assert.deepEqual(text.match(ANY_PRIVATE), [rel, rat]);
      assert.doesNotMatch(text, /BIOKEY-RAW1/);
      for (const seed of Object.values(seeds)) {
        for (const form of [b64(seed), Buffer.from(seed).toString("hex"), Buffer.from(seed).toString("base64url")]) {
          assert.ok(!text.includes(form), "a form of a seed");
        }
      }
    }
    for (const p of pubs) assert.ok(file.text.includes(`public:  ${p}\n`));
    assert.doesNotMatch(out, /development keys with no passphrase/);
  }
});

test("R43 the page's own load reads a protected key back with its passphrase, and refuses it with any other, or none", async () => {
  const maker = loadPage();
  const b = boxes(await generate(maker, PASS));
  const rel = b["Release key: private, keep this"], rat = b["Ratification key: private, keep this"];
  const pubs = b["Both public keys: paste these into the session"].split("\n");
  for (const [blob, pub, slot, title] of [[rel, pubs[0], "release", "Release key"], [rat, pubs[1], "ratify", "Ratification key"]]) {
    for (const wrong of ["", "wrong", PASS.toUpperCase(), `${PASS} `, PASS.slice(0, -1)]) {
      const page = loadPage();
      const said = await load(page, blob, wrong);
      assert.match(said, /class="bad"/);
      assert.match(said, wrong ? /wrong passphrase, or the key was altered/ : /protected with a passphrase/);
      assert.equal(page.KEYS[slot], null, "nothing loaded");
      await assert.rejects(page.parseKeyString(blob, wrong));
    }
    const page = loadPage();
    const said = await load(page, blob, PASS);
    assert.match(said, new RegExp(`${title} loaded\\.`));
    assert.ok(said.includes(pub));
    assert.equal(page.el("load-pass").value, "", "the passphrase is emptied once used");
  }
  /* A protected key altered in any field is refused, never loaded as some other key. */
  const parts = rel.split(".");
  const first = (s) => s.replace(/^./, (c) => (c === "A" ? "B" : "A"));
  /* BIOKEY1 . label . salt . iv . ciphertext . iterations */
  for (const [i, change] of [[2, first], [3, first], [4, first], [5, () => "1"], [5, () => "99999999"], [5, () => "-1"],
    [5, () => "x"], [5, () => ""]]) {
    const altered = parts.map((p, k) => (k === i ? change(p) : p)).join(".");
    assert.notEqual(altered, rel);
    await assert.rejects(loadPage().parseKeyString(altered, PASS));
  }
  /* And the loaded key signs a release that verifies under the public line given at Generate. */
  assert.equal((await signsAsRelease(rel, PASS, pubs[0])).ok, true);
});

test("R43 with a passphrase, the release key's raw form is shown once, only when asked, is that key, and never reaches a file or the clipboard's whole copy", async () => {
  const page = loadPage();
  const out = await generate(page, PASS);
  const b = boxes(out);
  const rel = b["Release key: private, keep this"];
  const relPub = b["Both public keys: paste these into the session"].split("\n")[0];
  const { seed } = await page.parseKeyString(rel, PASS);
  const raw = `BIOKEY-RAW1.bio-release.${b64(seed)}`;
  /* Not shown until asked: only the offer. */
  assert.match(out, /id="show-raw"/);
  assert.ok(!out.includes(raw));
  assert.equal(page.el("raw-once").innerHTML, "");
  page.el("show-raw").onclick();
  const shown = page.el("raw-once").innerHTML;
  const box = boxes(shown)["Release key: raw, for the signing secret only"];
  assert.equal(box, raw);
  /* It is the release key: the release signer accepts it, and its signature verifies under the release key's public line. */
  assert.deepEqual([...seedFromEnvelope(box).seed], [...seed]);
  assert.equal(signerPublicLine(box, "bio-release"), relPub);
  assert.equal((await verifySshsig(signSshsig(box, ASSET, NS_RELEASE), ASSET, NS_RELEASE, [relPub])).ok, true);
  /* Once: asking again shows nothing more, and hiding it leaves no way back. */
  page.el("show-raw").onclick();
  assert.equal(page.el("raw-once").innerHTML, shown);
  page.el("hide-raw").onclick();
  assert.ok(!page.el("raw-once").innerHTML.includes(raw));
  assert.match(page.el("raw-once").innerHTML, /will not show it again/);
  page.el("show-raw").onclick();
  assert.ok(!page.el("raw-once").innerHTML.includes(raw));
  /* Never written to a file, before or after the showing; never in the whole copy. */
  page.el("dl").onclick();
  await page.el("copy-all").onclick({ target: page.el("copy-all") });
  for (const text of [(await page.file()).text, page.copied.at(-1)]) {
    assert.doesNotMatch(text, /BIOKEY-RAW1/);
    assert.ok(!text.includes(b64(seed)));
  }
  assert.ok(page.downloads.every((d) => d.name === "bio-signing-keys.txt"));
  /* The ratification key's raw form is never shown. */
  const rat = await page.parseKeyString(b["Ratification key: private, keep this"], PASS);
  assert.ok(!shown.includes(b64(rat.seed)));
  /* A new Generate offers one new showing, of its own key; Forget withdraws an offer not yet taken. */
  const again = loadPage();
  await generate(again, PASS);
  again.el("forget").onclick();
  again.el("show-raw").onclick();
  assert.equal(again.el("raw-once").innerHTML, "");
});

test("R43 a passphrase typed twice differently makes no key, and says so", async () => {
  for (const [a, c] of [[PASS, ""], ["", PASS], [PASS, `${PASS} `], ["a", "A"]]) {
    const page = loadPage();
    const out = await generate(page, a, c);
    assert.match(out, /class="warn"/);
    assert.match(out, /two passphrases differ/);
    assert.equal(out.match(ANY_PRIVATE), null);
    assert.equal(page.KEYS.release, null);
    assert.equal(page.KEYS.ratify, null);
    assert.equal(page.el("gen-pass").value, "");
    const rec = await makeRecovery(page, a, c);
    assert.match(rec, /two passphrases differ/);
    assert.equal(rec.match(ANY_PRIVATE), null);
  }
});

/* ===================================================================== R44 */

test("R44 the page makes a recovery key named the recovery key in its private and public text, in each box and in its file, without arming it", async () => {
  for (const pass of [PASS, ""]) {
    const page = loadPage();
    const out = await makeRecovery(page, pass);
    const b = boxes(out);
    assert.deepEqual(Object.keys(b), ["Recovery key: public, paste this into the session", "Recovery key: private, keep this offline"]);
    const pub = b["Recovery key: public, paste this into the session"];
    const priv = b["Recovery key: private, keep this offline"];
    assert.match(pub, PUB_LINE(RECOVERY));
    assert.match(priv, pass ? /^BIOKEY1\.bio-release-recovery\./ : /^BIOKEY-RAW1\.bio-release-recovery\./);
    assert.doesNotMatch(out, /Release key:/, "never labelled as the release key");
    assert.equal(page.KEYS.release, null, "making it does not arm it");
    page.el("rec-dl").onclick();
    const file = await page.file();
    assert.equal(file.name, "bio-recovery-key.txt");
    assert.match(file.text, /^# Recovery key \(/);
    assert.ok(file.text.includes(`public:  ${pub}\n`));
    assert.deepEqual(file.text.match(ANY_PRIVATE), [priv]);
    if (pass) assert.doesNotMatch(file.text, /BIOKEY-RAW1/);
    /* The passphrase fields are emptied once read. */
    assert.equal(page.el("rec-pass").value, "");
    /* Its public line is its key's. */
    const { label, seed } = await page.parseKeyString(priv, pass);
    assert.equal(label, RECOVERY);
    assert.equal(page.pubLine((await page.keysFromSeed(seed)).raw32, RECOVERY), pub);
    /* Not the release key it backs up. */
    await generate(page, pass);
    assert.notEqual(page.pubLine(page.KEYS.release.raw32, "bio-release").split(" ")[1], pub.split(" ")[1]);
  }
});

test("R44 the recovery key is a release key: loaded, it is named the recovery key and signs bio-release statements that verify under its public line", async () => {
  const maker = loadPage();
  const b = boxes(await makeRecovery(maker, PASS));
  const pub = b["Recovery key: public, paste this into the session"];
  const priv = b["Recovery key: private, keep this offline"];
  assert.match(await load(loadPage(), priv, "wrong"), /wrong passphrase/);
  const page = loadPage();
  const said = await load(page, priv, PASS);
  assert.match(said, /Recovery key loaded\./);
  assert.ok(said.includes(pub));
  assert.match(page.el("rel-key").innerHTML, /Signing as<\/span> Recovery key: <code>/);
  assert.ok(page.el("rel-key").innerHTML.includes(pub));
  assert.equal(page.el("rel-sign").disabled, false);
  assert.equal(page.el("rat-sign").disabled, true, "it is not a ratification key");
  const m = await signRelease(page, ASSET);
  assert.equal(m.signer, pub);
  assert.deepEqual(await verifySshsig(m.sig, ASSET, NS_RELEASE, [pub]), { ok: true, keyB64: pub.split(" ")[1], namespace: NS_RELEASE });
  assert.equal((await verifySshsig(m.sig, ASSET, NS_RATIFY, [pub])).reason, "NAMESPACE");
  /* Its raw form, made without a passphrase, is a BIOKEY-RAW1 envelope the release signer reads. */
  const rawPage = loadPage();
  const raw = boxes(await makeRecovery(rawPage, ""))["Recovery key: private, keep this offline"];
  const rawPub = boxes(rawPage.el("rec-out").innerHTML)["Recovery key: public, paste this into the session"];
  assert.equal(seedFromEnvelope(raw).label, RECOVERY);
  assert.equal(signerPublicLine(raw, RECOVERY), rawPub);
  assert.equal((await verifySshsig(signSshsig(raw, ASSET, NS_RELEASE), ASSET, NS_RELEASE, [rawPub])).ok, true);
  assert.equal((await signsAsRelease(raw, "", rawPub)).ok, true);
});

test("R44 the recovery key's release signature from the page is accepted by stock ssh-keygen -Y verify in bio-release", { skip: NO_SSH_KEYGEN }, async () => {
  const maker = loadPage();
  const b = boxes(await makeRecovery(maker, PASS));
  const pub = b["Recovery key: public, paste this into the session"];
  const page = loadPage();
  await load(page, b["Recovery key: private, keep this offline"], PASS);
  const m = await signRelease(page, ASSET);
  const d = mkdtempSync(join(DIR, "kv-"));
  writeFileSync(join(d, "allowed"), `release@test ${pub}\n`);
  writeFileSync(join(d, "sig"), m.sig);
  const verify = (ns) => { try {
    execFileSync("ssh-keygen", ["-Y", "verify", "-f", join(d, "allowed"), "-I", "release@test", "-n", ns, "-s", join(d, "sig")],
      { input: Buffer.from(ASSET), stdio: ["pipe", "ignore", "ignore"] });
    return true; } catch { return false; } };
  assert.equal(verify(NS_RELEASE), true);
  assert.equal(verify(NS_RATIFY), false);
});

/* ============================================================ R32 (new text) */

test("R32 R43 R44 what the new paths write names no BIO, bundle, instance or plane, and Forget clears them", async () => {
  const page = loadPage();
  const said = [await generate(page, PASS)];
  page.el("show-raw").onclick();
  said.push(page.el("raw-once").innerHTML);
  page.el("hide-raw").onclick();
  said.push(page.el("raw-once").innerHTML, await makeRecovery(page, PASS), await makeRecovery(page, ""),
    await generate(page, "a", "b"), await makeRecovery(page, "a", "b"));
  const rec = boxes(said[3])["Recovery key: private, keep this offline"];
  said.push(await load(page, rec, PASS), page.el("rel-key").innerHTML);
  for (const s of said) {
    const text = s.replace(ANY_PRIVATE, "").replace(/ssh-ed25519 \S+/g, "");
    assert.ok(text.length > 0);
    assert.doesNotMatch(text, /\bBIO\b/);
    assert.doesNotMatch(text, /civic\s*os/i);
    assert.doesNotMatch(text, /bundle/i);
    assert.doesNotMatch(text, /\binstances?\b/i);
    assert.doesNotMatch(text, /\bplanes?\b/i);
  }
  page.el("forget").onclick();
  for (const id of ["gen-out", "rec-out"]) assert.equal(page.el(id).innerHTML, "");
  for (const id of ["gen-pass", "gen-pass2", "rec-pass", "rec-pass2", "load-pass"]) assert.equal(page.el(id).value, "");
});
