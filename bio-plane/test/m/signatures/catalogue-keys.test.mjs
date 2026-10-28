/* signatures: the offline catalogue-keys page (R57; build/requirements/signatures.md), tested at the page's interface:
 * its own script run against a stub DOM, driven through its buttons and fields as a person would, with what it copies
 * and downloads captured. What it makes is read back by R34 and R35 (the release signer's own readers), and what it
 * signs is verified by R53 and by stock `ssh-keygen -Y verify`. Throwaway passphrases and keys only; no network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { webcrypto } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import vm from "node:vm";

import {
  NS_AI_CATALOGUE, RELEASE_KEYS, CATALOGUE_KEYS, aiCatalogueStatement, aiAdvisoryStatement, verifyAiCatalogue,
  verifySshsig, normalizeKey, releaseNoticeStatement,
} from "../../../src/sshsig.mjs";
import { seedFromEnvelope, signerPublicLine } from "../../../scripts/sign-sshsig.mjs";

const HTML = readFileSync(new URL("../../../scripts/catalogue-keys.html", import.meta.url), "utf8");
const HAVE_SSH_KEYGEN = !spawnSync("ssh-keygen", ["-Q"]).error;
const NO_SSH_KEYGEN = HAVE_SSH_KEYGEN ? false : "ssh-keygen is not on PATH";
const DIR = mkdtempSync(join(tmpdir(), "m-signatures-catalogue-keys-"));
process.on("exit", () => rmSync(DIR, { recursive: true, force: true }));

const b64 = (bytes) => Buffer.from(bytes).toString("base64");
const unb64 = (s) => new Uint8Array(Buffer.from(s, "base64"));
const PASS = "correct horse battery staple";
const SIGNING = "bio-ai-catalogue", RECOVERY = "bio-ai-catalogue-recovery";
const PUB_LINE = (label) => new RegExp(`^ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI[A-Za-z0-9+/]{43} ${label}$`);

/* The page's own script against a stub DOM, recording what it copies and what it downloads. */
function loadPage() {
  const script = HTML.slice(HTML.lastIndexOf("<script>") + 8, HTML.lastIndexOf("</script>"));
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
  vm.runInContext(`${script}\n;globalThis.__page = { KEYS };`, sandbox);
  const page = { ...sandbox.__page, el: (id) => sandbox.document.getElementById(id), copied, downloads };
  page.el("st-with").value = "catalogue";
  return page;
}

const unescapeHtml = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
/* The text of the copy box with this id in an answer. */
const boxText = (html, id) => {
  const m = new RegExp(`<textarea id="${id}"[^>]*>([^<]*)</textarea>`).exec(html);
  return m && unescapeHtml(m[1]);
};

async function generate(page, pass = PASS, again = pass) {
  page.el("gen-pass").value = pass;
  page.el("gen-pass2").value = again;
  await page.el("gen").onclick();
  return page.el("gen-out").innerHTML;
}
async function load(page, blob, pass = PASS) {
  page.el("load-blob").value = blob;
  page.el("load-pass").value = pass;
  await page.el("load").onclick();
  return page.el("load-out").innerHTML;
}
const read = (page, text) => { page.el("st-text").value = text; page.el("st-text").oninput(); page.el("st-read").onclick(); return page.el("st-words").innerHTML; };
async function signText(page, text) {
  read(page, text);
  await page.el("st-sign").onclick();
  return boxText(page.el("st-out").innerHTML, "out-sig");
}

/* A key the page gave out, opened independently of the page: PBKDF2 and AES-GCM from the stated form. */
async function openPrivate(blob, pass) {
  const [tag, label, salt, iv, ct, iter] = blob.split(".");
  assert.equal(tag, "BIOKEY1");
  const base = await webcrypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
  const key = await webcrypto.subtle.deriveKey({ name: "PBKDF2", salt: unb64(salt), iterations: Number(iter), hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
  const seed = new Uint8Array(await webcrypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, key, unb64(ct)));
  return { label, seed, envelope: `BIOKEY-RAW1.${label}.${b64(seed)}` };
}

const D = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
const CATALOGUE = { seq: 7, schema_version: 2, issued_at: "2026-10-27T12:30:05Z", sha256: D, bytes: 4096 };
const STATEMENT = new TextDecoder().decode(aiCatalogueStatement(CATALOGUE));

/* One generation shared by the tests that only read its answer (the key derivation is slow on purpose). */
const PAGE = loadPage();
const OUT = await generate(PAGE);
const PUBS = boxText(OUT, "out-pub").split("\n");
const PRIV = { catalogue: boxText(OUT, "out-priv-catalogue"), recovery: boxText(OUT, "out-priv-recovery") };

/* ===================================================================== R57 */

test("R57 one press makes both keys: the catalogue signing key and the recovery key, each public line in R35's form with its label, the two different", () => {
  assert.equal(PUBS.length, 2);
  assert.match(PUBS[0], PUB_LINE(SIGNING));
  assert.match(PUBS[1], PUB_LINE(RECOVERY));
  assert.notEqual(normalizeKey(PUBS[0]), normalizeKey(PUBS[1]));
  for (const l of PUBS) {
    assert.ok(!RELEASE_KEYS.map(normalizeKey).includes(normalizeKey(l)));
    assert.ok(!CATALOGUE_KEYS.map(normalizeKey).includes(normalizeKey(l)));
  }
});

test("R57 each private key is R34's passphrase form, opens with the passphrase to a seed R34 reads, and its public line is R35's for that seed", async () => {
  for (const [slot, label, pub] of [["catalogue", SIGNING, PUBS[0]], ["recovery", RECOVERY, PUBS[1]]]) {
    assert.match(PRIV[slot], new RegExp(`^BIOKEY1\\.${label}\\.[A-Za-z0-9+/=]+\\.[A-Za-z0-9+/=]+\\.[A-Za-z0-9+/=]+\\.[1-9][0-9]*$`));
    const k = await openPrivate(PRIV[slot], PASS);
    assert.equal(k.label, label);
    const env = seedFromEnvelope(k.envelope);
    assert.equal(env.label, label);
    assert.equal(Buffer.from(env.seed).toString("hex"), Buffer.from(k.seed).toString("hex"));
    assert.equal(signerPublicLine(k.envelope, label), pub);
  }
  assert.doesNotMatch(OUT, /BIOKEY-RAW1/);
  await assert.rejects(openPrivate(PRIV.catalogue, "another passphrase"));
});

test("R57 the page offers the two keys as a file too, the same lines and keys, and nothing raw", async () => {
  const page = loadPage();
  const out = await generate(page);
  await page.el("dl").onclick();
  assert.equal(page.downloads.length, 1);
  const text = await page.downloads[0].blob.text();
  assert.deepEqual(text.match(/^public: {2}(.*)$/gm).map((l) => l.replace(/^public: {2}/, "")), boxText(out, "out-pub").split("\n"));
  assert.deepEqual(text.match(/^private: (.*)$/gm).map((l) => l.replace(/^private: /, "")),
    [boxText(out, "out-priv-catalogue"), boxText(out, "out-priv-recovery")]);
  assert.doesNotMatch(text, /BIOKEY-RAW1/);
});

test("R57 no passphrase, or two that differ, makes no key and offers none", async () => {
  for (const [a, b] of [["", ""], [PASS, PASS + "x"]]) {
    const page = loadPage();
    const out = await generate(page, a, b);
    assert.doesNotMatch(out, /BIOKEY1|ssh-ed25519|id="dl"/);
    assert.equal(page.KEYS.catalogue, null);
    assert.equal(page.KEYS.recovery, null);
    assert.equal(page.el("gen-pass").value, "");
    assert.equal(page.el("gen-pass2").value, "");
  }
});

test("R57 a saved key loads with its passphrase and shows its public line; a wrong passphrase, an altered key or another kind of key does not load", async () => {
  for (const [slot, pub] of [["catalogue", PUBS[0]], ["recovery", PUBS[1]]]) {
    const page = loadPage();
    const out = await load(page, PRIV[slot]);
    assert.ok(out.includes(pub));
    assert.ok(page.KEYS[slot]);
    assert.equal(page.el("load-pass").value, "");
  }
  const bad = [
    [PRIV.catalogue, "wrong"], [PRIV.catalogue, ""],
    [PRIV.catalogue.replace(/\.[^.]*\.[^.]*$/, (t) => t.replace(/[A-Za-z]/, (c) => (c === "A" ? "B" : "A"))), PASS],
    [PRIV.catalogue.replace(`.${SIGNING}.`, ".bio-release."), PASS],
    [PRIV.catalogue.replace(`.${SIGNING}.`, ".bio-ratify."), PASS],
    [(await openPrivate(PRIV.catalogue, PASS)).envelope, PASS],
    ["", PASS], ["BIOKEY1.", PASS], [PRIV.catalogue.replace(/\.[^.]*$/, ".0"), PASS],
  ];
  for (const [blob, pass] of bad) {
    const page = loadPage();
    const out = await load(page, blob, pass);
    assert.match(out, /class="bad"/);
    assert.equal(page.KEYS.catalogue, null);
    assert.equal(page.KEYS.recovery, null);
  }
});

test("R57 it copies both public lines together, signing key first, once both keys are here, and not before", async () => {
  const page = loadPage();
  await page.el("copy-pub").onclick({ target: {} });
  assert.deepEqual(page.copied, []);
  await load(page, PRIV.catalogue);
  await page.el("copy-pub").onclick({ target: {} });
  assert.deepEqual(page.copied, []);
  await load(page, PRIV.recovery);
  await page.el("copy-pub").onclick({ target: {} });
  assert.deepEqual(page.copied, [PUBS.join("\n")]);
  const fresh = loadPage();
  await generate(fresh);
  await fresh.el("copy-pub").onclick({ target: {} });
  assert.equal(fresh.copied.length, 1);
  assert.match(fresh.copied[0], new RegExp(`^ssh-ed25519 \\S+ ${SIGNING}\\nssh-ed25519 \\S+ ${RECOVERY}$`));
});

test("R57 forgetting empties the keys, the statement and every field", async () => {
  const page = loadPage();
  await load(page, PRIV.catalogue);
  read(page, STATEMENT);
  page.el("forget").onclick();
  assert.equal(page.KEYS.catalogue, null);
  assert.equal(page.el("st-text").value, "");
  assert.equal(page.el("st-words").innerHTML, "");
  assert.equal(page.el("load-blob").value, "");
  assert.equal(page.el("st-sign").disabled, true);
});

test("R57 a statement is shown in words first: the page names every field's value, and signing waits for it", async () => {
  const page = loadPage();
  await load(page, PRIV.catalogue);
  assert.equal(await signText(loadPage(), STATEMENT), null);
  page.el("st-text").value = STATEMENT;
  page.el("st-text").oninput();
  assert.equal(page.el("st-sign").disabled, true);
  await page.el("st-sign").onclick();
  assert.equal(boxText(page.el("st-out").innerHTML, "out-sig"), null);
  const words = read(page, STATEMENT);
  for (const v of ["7", "2", "2026-10-27", "12:30:05", "4096", D]) assert.ok(words.includes(v), v);
  assert.equal(page.el("st-sign").disabled, false);
  /* editing the text withdraws the reading */
  page.el("st-text").value = STATEMENT.replace("seq 7", "seq 8");
  page.el("st-text").oninput();
  assert.equal(page.el("st-sign").disabled, true);
  assert.equal(page.el("st-words").innerHTML, "");
  await page.el("st-sign").onclick();
  assert.equal(boxText(page.el("st-out").innerHTML, "out-sig"), null);
});

test("R57 a seed signature it makes verifies by R53 against its line, in NS_AI_CATALOGUE only, over exactly R51's bytes", async () => {
  const page = loadPage();
  await load(page, PRIV.catalogue);
  const sig = await signText(page, STATEMENT);
  assert.match(sig, /^-----BEGIN SSH SIGNATURE-----\n[\s\S]+\n-----END SSH SIGNATURE-----\n$/);
  const r = await verifyAiCatalogue(CATALOGUE, sig, 6, [PUBS[0]]);
  assert.equal(r.ok, true);
  assert.deepEqual(r.statement, CATALOGUE);
  assert.equal((await verifyAiCatalogue(CATALOGUE, sig, 7, [PUBS[0]])).reason, "NOT_NEWER");
  assert.equal((await verifyAiCatalogue(CATALOGUE, sig, 0, [PUBS[1]])).reason, "UNKNOWN_KEY");
  assert.equal((await verifyAiCatalogue({ ...CATALOGUE, bytes: 4097 }, sig, 0, [PUBS[0]])).reason, "BAD_SIGNATURE");
  assert.equal((await verifySshsig(sig, aiCatalogueStatement(CATALOGUE), "bio-release", [PUBS[0]])).reason, "NAMESPACE");
  assert.equal((await verifySshsig(sig, aiCatalogueStatement(CATALOGUE), NS_AI_CATALOGUE, [PUBS[0]])).ok, true);
  /* the same statement without its last newline, or with extra ones, is signed as the six lines */
  for (const t of [STATEMENT.trimEnd(), STATEMENT + "\n\n"]) {
    assert.equal(await signText(page, t), sig, "deterministic over the same bytes");
  }
});

test("R57 the recovery key signs the same statement in the same namespace when it is chosen", async () => {
  const page = loadPage();
  await load(page, PRIV.recovery);
  page.el("st-with").value = "recovery";
  const sig = await signText(page, STATEMENT);
  assert.equal((await verifyAiCatalogue(CATALOGUE, sig, 0, [PUBS[1]])).ok, true);
  page.el("st-with").value = "catalogue";
  read(page, STATEMENT);
  await page.el("st-sign").onclick();
  assert.equal(boxText(page.el("st-out").innerHTML, "out-sig"), null);
});

test("R57 a seed signature it makes verifies by the stock ssh-keygen -Y verify", { skip: NO_SSH_KEYGEN }, async () => {
  const page = loadPage();
  await load(page, PRIV.catalogue);
  const sig = await signText(page, STATEMENT);
  writeFileSync(join(DIR, "statement.txt"), STATEMENT);
  writeFileSync(join(DIR, "statement.sig"), sig);
  writeFileSync(join(DIR, "allowed_signers"), `ceremony namespaces="${NS_AI_CATALOGUE}" ${PUBS[0]}\n`);
  const run = (ns, file = "statement.txt") => spawnSync("ssh-keygen",
    ["-Y", "verify", "-f", join(DIR, "allowed_signers"), "-I", "ceremony", "-n", ns, "-s", join(DIR, "statement.sig")],
    { input: readFileSync(join(DIR, file)) });
  assert.equal(run(NS_AI_CATALOGUE).status, 0);
  assert.notEqual(run("bio-release").status, 0);
  writeFileSync(join(DIR, "other.txt"), STATEMENT.replace("bytes 4096", "bytes 4097"));
  assert.notEqual(run(NS_AI_CATALOGUE, "other.txt").status, 0);
});

test("R57 a text that is not an R51 statement is refused and nothing is signed: another statement, a changed line, an extra or missing line, a malformed field", async () => {
  const page = loadPage();
  await load(page, PRIV.catalogue);
  const lines = STATEMENT.trimEnd().split("\n");
  const swap = (i, v) => lines.map((l, j) => (j === i ? v : l)).join("\n") + "\n";
  const texts = [
    "", "x", STATEMENT.replace("bio-ai-catalogue/1", "bio-ai-catalogue/2"),
    new TextDecoder().decode(aiAdvisoryStatement({ seq: 3, target: { entry_id: "e" }, kind: "k", reason: "r",
      effective_at: "2026-10-28T00:00:00Z", issued_at: "2026-10-27T12:30:05Z" })),
    new TextDecoder().decode(releaseNoticeStatement({ version: "1.0.0", date: "2026-10-14", manifest: D, security: false,
      notes: { members: "m", administrators: "a", must_do: "" } })),
    STATEMENT + "extra 1\n", lines.slice(0, 5).join("\n") + "\n", lines.slice(1).join("\n") + "\n",
    [lines[0], lines[2], lines[1], ...lines.slice(3)].join("\n") + "\n",
    swap(1, "seq 0"), swap(1, "seq 07"), swap(1, "seq 1.5"), swap(1, "seq -1"), swap(1, "seq  7"), swap(1, "seq 7 "),
    swap(2, "schema 0"), swap(2, "schema x"),
    swap(3, "issued 2026-10-27"), swap(3, "issued 2026-02-30T00:00:00Z"), swap(3, "issued 2026-10-27T24:00:00Z"),
    swap(3, "issued 2026-10-27T12:30:05+00:00"), swap(3, "issued 2026-10-27 12:30:05Z"),
    swap(4, "sha256 " + D.toUpperCase()), swap(4, "sha256 " + D.slice(1)), swap(4, "sha256 "),
    swap(5, "bytes 0"), swap(5, "bytes 4k"), STATEMENT.replace(/\n/g, "\r\n"), STATEMENT.replace("seq 7", "seq\t7"),
  ];
  for (const t of texts) {
    const words = read(page, t);
    assert.match(words, /class="bad"/, JSON.stringify(t));
    assert.equal(page.el("st-sign").disabled, true);
    await page.el("st-sign").onclick();
    assert.equal(boxText(page.el("st-out").innerHTML, "out-sig"), null, JSON.stringify(t));
  }
});

test("R57 it signs with a key only when that key is here", async () => {
  const page = loadPage();
  read(page, STATEMENT);
  await page.el("st-sign").onclick();
  assert.equal(boxText(page.el("st-out").innerHTML, "out-sig"), null);
});

test("R57 the page makes no network call: no fetch, XMLHttpRequest, WebSocket, EventSource, sendBeacon or import, no linked or loaded resource, no address", () => {
  assert.doesNotMatch(HTML, /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts|import\s*\(|Worker|SharedWorker|serviceWorker)\b/);
  assert.doesNotMatch(HTML, /\bhttps?:\/\//i);
  assert.doesNotMatch(HTML, /<(link|iframe|object|embed|img|audio|video|source|form)\b/i);
  assert.doesNotMatch(HTML, /<script[^>]*\bsrc\s*=/i);
  assert.doesNotMatch(HTML, /@import|\burl\(/i);
  assert.equal((HTML.match(/<script\b/g) || []).length, 1);
  /* the stub DOM offers none either: the script ran above with neither global present */
  const page = loadPage();
  assert.ok(page.el("gen"));
});
