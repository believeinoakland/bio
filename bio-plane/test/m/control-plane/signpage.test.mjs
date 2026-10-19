/* signatures: the signing page the module used to serve, moved here unchanged from signatures.test.mjs (K3828).
 * Its tests run the page's own script against a stub DOM, and check the page's signatures with this module's
 * verifier and with stock ssh-keygen. The page's files, signpage.mjs, sign-release.html and
 * scripts/embed-signpage.mjs, leave this module at the merge (T51-124; K3807, K3814); control-plane's job deletes
 * them with the /sign route, and these tests go with them. Where ssh-keygen is missing, the cases that need it are
 * skipped by name. No network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { webcrypto } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

import * as sshsig from "../../../src/sshsig.mjs";
import * as signpage from "../../../src/signpage.mjs";
import { renderSignpage, syncIdPattern, SIGNPAGE_SRC, SIGNPAGE_OUT } from "../../../scripts/embed-signpage.mjs";
import { ID_TABLE, idPattern } from "../../../src/record-grammar/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const {
  NS_RELEASE, NS_RATIFY, NS_FLEET, NS_NOTICE, NS_RELEASE_NOTICE, verifySshsig, ratifyStatement, caseRatifyStatement, fleetStatement,
  noticeStatement, NS_DOCKET, docketStatement, CAPTURE_ACCOUNT_TOKEN, captureAccountStatement,
} = sshsig;

const { SIGN_HTML } = signpage;

const te = new TextEncoder();
const td = new TextDecoder();
const enc = (s) => te.encode(s);
const HAVE_SSH_KEYGEN = !spawnSync("ssh-keygen", ["-Q"]).error;
const HAVE_OPENSSL = !spawnSync("openssl", ["version"]).error;
const NO_SSH_KEYGEN = HAVE_SSH_KEYGEN ? false : "ssh-keygen is not on PATH";
const NO_OPENSSL = HAVE_OPENSSL ? false : "openssl is not on PATH";

const DIR = mkdtempSync(join(tmpdir(), "m-signatures-"));
process.on("exit", () => rmSync(DIR, { recursive: true, force: true }));

/* ------------------------------------------------ an independent SSHSIG signer */

const u8 = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0; for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
};
const u32 = (n) => new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
const sstr = (v) => { const b = typeof v === "string" ? enc(v) : v; return u8(u32(b.length), b); };
const b64 = (bytes) => Buffer.from(bytes).toString("base64");
const armor = (blob) =>
  `-----BEGIN SSH SIGNATURE-----\n${b64(blob).replace(/(.{70})/g, "$1\n")}\n-----END SSH SIGNATURE-----\n`;
const dearmor = (text) => new Uint8Array(Buffer.from(
  text.replace(/-----(BEGIN|END) SSH SIGNATURE-----/g, "").replace(/\s+/g, ""), "base64"));

async function newKey() {
  const kp = await webcrypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
  const raw = new Uint8Array(await webcrypto.subtle.exportKey("raw", kp.publicKey));
  const wire = u8(sstr("ssh-ed25519"), sstr(raw));
  return { priv: kp.privateKey, raw, keyB64: b64(wire), line: `ssh-ed25519 ${b64(wire)} test-key` };
}

/* Builds an SSHSIG blob field by field, so a test can set any field wrong. */
async function sign(key, namespace, message, o = {}) {
  const hashAlg = o.hashAlg ?? "sha512";
  const reserved = o.reserved ?? new Uint8Array(0);
  const h = new Uint8Array(await webcrypto.subtle.digest(hashAlg === "sha256" ? "SHA-256" : "SHA-512", message));
  const signed = u8(enc("SSHSIG"), sstr(namespace), sstr(reserved), sstr(hashAlg), sstr(h));
  const sig = o.sig ?? new Uint8Array(await webcrypto.subtle.sign("Ed25519", key.priv, signed));
  const pub = o.pubBlob ?? u8(sstr(o.keyType ?? "ssh-ed25519"), sstr(o.pubRaw ?? key.raw));
  const sigBlob = o.sigBlob ?? u8(sstr(o.sigType ?? "ssh-ed25519"), sstr(sig));
  return armor(u8(enc(o.magic ?? "SSHSIG"), u32(o.version ?? 1), sstr(pub), sstr(namespace),
    sstr(reserved), sstr(hashAlg), sstr(sigBlob)));
}

/* Flip one bit of the raw Ed25519 signature inside an armored SSHSIG. */
function flipSignatureBit(armored, bit) {
  const blob = dearmor(armored);
  const sigAt = blob.length - 64;              /* the signature is the blob's last 64 bytes */
  blob[sigAt + (bit >> 3)] ^= 1 << (bit & 7);
  return armor(blob);
}

const KEY = await newKey();
const OTHER = await newKey();

/* A signature pinned from OpenSSH 9.6p1 (key made for the legacy suite, no
   secret retained), so an ssh-keygen-made signature is checked on every machine. */
const PINNED = {
  pub: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMAATz95Xd15iuuK5zLFjBydY8u2jG37egk1MvtDAph sparky-release",
  msg: "hello bio release\n",
  sig: `-----BEGIN SSH SIGNATURE-----
U1NIU0lHAAAAAQAAADMAAAALc3NoLWVkMjU1MTkAAAAg4wABPP3ld3XmK64rnMsWMHJ1jy
7aMbft6CTUy+0MCmEAAAALYmlvLXJlbGVhc2UAAAAAAAAABnNoYTUxMgAAAFMAAAALc3No
LWVkMjU1MTkAAABAk3JISyJJOyePcA2Oge+Juv5QR/QDQxZHAsEdPXWR1aXgHZ+Mr4lkQL
2y4ylxfMGENlue22wQJPGLDCquud/hCQ==
-----END SSH SIGNATURE-----
`,
};

/* A fresh ssh-keygen key and signature, in the given namespace and hash. */
function keygenSign(namespace, message, hashalg) {
  const d = mkdtempSync(join(DIR, "kg-"));
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "fresh", "-f", join(d, "k"), "-q"]);
  writeFileSync(join(d, "m"), message);
  const args = ["-Y", "sign", "-f", join(d, "k"), "-n", namespace];
  if (hashalg) args.push("-O", `hashalg=${hashalg}`);
  execFileSync("ssh-keygen", [...args, join(d, "m")], { stdio: ["ignore", "ignore", "ignore"] });
  return { pub: readFileSync(join(d, "k.pub"), "utf8").trim(), sig: readFileSync(join(d, "m.sig"), "utf8"), dir: d };
}

/* ssh-keygen's own verdict on a signature. */
function keygenVerifies(pubLine, namespace, sig, message) {
  const d = mkdtempSync(join(DIR, "kv-"));
  writeFileSync(join(d, "allowed"), `signer@test ${pubLine.split(/\s+/).slice(0, 2).join(" ")}\n`);
  writeFileSync(join(d, "sig"), sig);
  try {
    execFileSync("ssh-keygen", ["-Y", "verify", "-f", join(d, "allowed"), "-I", "signer@test", "-n", namespace,
      "-s", join(d, "sig")], { input: Buffer.from(message), stdio: ["pipe", "ignore", "ignore"] });
    return true;
  } catch { return false; }
}

const REASONS_SSHSIG = ["MALFORMED", "NAMESPACE", "UNKNOWN_KEY", "BAD_SIGNATURE", "CRYPTO_UNAVAILABLE"];
const REASONS_TSA = ["MALFORMED", "REJECTED", "NO_TOKEN", "NOT_BOUND"];
/* Every "no" these tests see, checked against R29 at the end. */
const NOES = { sshsig: [], tsa: [] };
const verifyAndLog = async (...a) => {
  const r = await verifySshsig(...a);
  if (!r.ok) NOES.sshsig.push(r);
  return r;
};
const parseAndLog = (...a) => {
  const r = parseTimestampResponse(...a);
  if (!r.ok) NOES.tsa.push(r);
  return r;
};
const NOTICE_SHA = "0123456789abcdef".repeat(4);
const DOCKET_SHA = "fedcba9876543210".repeat(4);

/* The ids R38 and R40 judge, against record-grammar's sequential form (R46, R47): the counter's widths either side
   of four digits, the 10,000th id and far past it, every slug shape, and the near misses around each part. */
const SEQ_PREFIXES = ID_TABLE.filter((e) => e.form === "sequential").map((e) => e.prefix);
const ID_CORES = ["2026-0000", "2026-0001", "2026-9999", "2026-10000", "2026-99999", "2026-1234567890123", "0000-0001",
  "2026-000", "2026-1", "2026-", "26-0001", "20266-0001", "2026-0001a", "2026-00 01", "2026--0001", "2026-٠٠٠١"];
const ID_TAILS = ["", "-a", "-a-b", "-sewer-fund-transfers", "-10000", "-x1-2y", "-", "-A", "-a--b", "-a_b", "-a b", "-a-"];
const statementAccepts = (fn, id) => { try { fn(id, 1, "0".repeat(64)); return true; } catch { return false; } };

/* ===================================================================== R25 */

test("R25 SIGN_HTML is one non-empty, self-contained HTML document that names no remote resource", () => {
  assert.equal(typeof SIGN_HTML, "string");
  assert.ok(SIGN_HTML.length > 1000);
  assert.ok(SIGN_HTML.startsWith("<!doctype html>"));
  assert.doesNotMatch(SIGN_HTML, /\b(src|href)\s*=\s*["']?\s*https?:/i);
  assert.doesNotMatch(SIGN_HTML, /url\(\s*["']?\s*https?:/i);
  assert.doesNotMatch(SIGN_HTML, /@import/i);
  assert.equal(SIGN_HTML.match(/<script\b[^>]*>/gi).length, 1, "one inline script");
  assert.doesNotMatch(SIGN_HTML, /<script\b[^>]*\bsrc\s*=/i);
  const script = SIGN_HTML.slice(SIGN_HTML.lastIndexOf("<script>") + 8, SIGN_HTML.lastIndexOf("</script>"));
  assert.doesNotMatch(script, /\b(fetch|XMLHttpRequest|sendBeacon|WebSocket|EventSource|importScripts)\b/);
  assert.doesNotMatch(script, /\b(localStorage|sessionStorage|indexedDB|document\.cookie)\b/);
});

test("R30 the page served is the byte-identical render of src/sign-release.html by embed-signpage", () => {
  assert.equal(SIGNPAGE_SRC, fileURLToPath(new URL("../../../src/sign-release.html", import.meta.url)));
  assert.equal(SIGNPAGE_OUT, fileURLToPath(new URL("../../../src/signpage.mjs", import.meta.url)));
  const html = readFileSync(SIGNPAGE_SRC, "utf8");
  assert.equal(readFileSync(SIGNPAGE_OUT, "utf8"), renderSignpage(html));
  assert.equal(SIGN_HTML, html);
  /* The render is deterministic and survives anything JSON can carry. */
  assert.equal(renderSignpage(html), renderSignpage(html));
  const odd = '<!doctype html><button id="gen"></button>`${x}` \\   </script>';
  const mod = renderSignpage(odd);
  const ctx = {};
  vm.runInNewContext(mod.replace("export const SIGN_HTML", "globalThis.SIGN_HTML"), ctx);
  assert.equal(ctx.SIGN_HTML, odd);
  /* The generator refuses a page that is not the signing page, or that reaches out. */
  assert.throws(() => renderSignpage("<!doctype html><p>no button</p>"), /no generate button/);
  assert.throws(() => renderSignpage('<button id="gen"></button><script>fetch("/x")</script>'), /outbound call/);
});

test("R42 the page's copy of the id pattern is the plane's, regenerated by embed-signpage and never edited by hand", () => {
  const html = readFileSync(SIGNPAGE_SRC, "utf8");
  /* The committed page is a fixed point of the regeneration: a hand edit or a stale copy is red here. */
  assert.equal(syncIdPattern(html), html);
  const lines = SIGN_HTML.match(/^const OPAQUE_ID_RE = \/.*\/;$/gm);
  assert.equal(lines.length, 1);
  assert.equal(lines[0], `const OPAQUE_ID_RE = ${sshsig.OPAQUE_ID_RE};`);
  /* A stale copy, the pre-T33 four-digit counter among them, is rewritten to the plane's, and nothing else moves. */
  for (const stale of ["/^[A-Z]+-\\d{4}-\\d{4}(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?$/", "/x/", "/^$/"]) {
    const old = html.replace(lines[0], `const OPAQUE_ID_RE = ${stale};`);
    assert.notEqual(old, html);
    assert.equal(syncIdPattern(old), html);
  }
  /* A page with no copy, or two, is refused rather than half-regenerated. */
  assert.throws(() => syncIdPattern(html.replace(lines[0], "")), /0 OPAQUE_ID_RE lines/);
  assert.throws(() => syncIdPattern(html.replace(lines[0], `${lines[0]}\n${lines[0]}`)), /2 OPAQUE_ID_RE lines/);
});

/* Run the served page's own script against a stub DOM. */
function loadPage(html) {
  const script = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"));
  const els = new Map();
  const el = () => ({ value: "", innerHTML: "", disabled: false, files: [], onclick: null,
    classList: { toggle() {} }, setAttribute() {} });
  const created = [];
  const sandbox = {
    crypto: webcrypto, TextEncoder, atob, btoa, console, setTimeout, Blob,
    URL: { createObjectURL: () => "blob:local", revokeObjectURL() {} },
    navigator: { clipboard: { writeText: async () => {} } },
    document: {
      getElementById: (id) => (els.has(id) || els.set(id, el()), els.get(id)),
      addEventListener: () => {},
      createElement: (tag) => { const e = { tag, style: {}, select() {}, click() {} }; created.push(e); return e; },
      body: { appendChild() {}, removeChild() {} }, execCommand: () => true,
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(`${script}\n;globalThis.__page = { sshsig, keysFromSeed, pubLine, generateAll, KEYS, parseKeyString, wrapKey };`, sandbox);
  return { ...sandbox.__page, el: (id) => sandbox.document.getElementById(id), created };
}

test("R31 the served page's signatures are accepted by verifySshsig, and bound to their namespace and bytes", async () => {
  const page = loadPage(SIGN_HTML);
  const made = await page.generateAll();
  const relPub = made["bio-release"].pub, ratPub = made["bio-ratify"].pub;
  assert.notEqual(relPub, ratPub);
  const asset = webcrypto.getRandomValues(new Uint8Array(5000));
  const relSig = await page.sshsig(page.KEYS.release.priv, page.KEYS.release.raw32, NS_RELEASE, asset);
  assert.deepEqual(await verifyAndLog(relSig, asset, NS_RELEASE, [relPub]),
    { ok: true, keyB64: relPub.split(" ")[1], namespace: NS_RELEASE });
  const stmt = ratifyStatement("BUNDLE-1", "ab".repeat(32));
  const ratSig = await page.sshsig(page.KEYS.ratify.priv, page.KEYS.ratify.raw32, NS_RATIFY, stmt);
  assert.equal((await verifyAndLog(ratSig, stmt, NS_RATIFY, [ratPub])).ok, true);
  assert.equal((await verifyAndLog(ratSig, stmt, NS_RELEASE, [ratPub])).reason, "NAMESPACE");
  assert.equal((await verifyAndLog(ratSig, stmt, NS_RATIFY, [relPub])).reason, "UNKNOWN_KEY");
  assert.equal((await verifyAndLog(ratSig, ratifyStatement("BUNDLE-1", "cd".repeat(32)), NS_RATIFY, [ratPub])).reason,
    "BAD_SIGNATURE");
  /* The page's ratify button signs exactly ratifyStatement's bytes. */
  page.el("rat-id").value = "BUNDLE-1";
  page.el("rat-sha").value = "AB".repeat(32);
  await page.el("rat-sign").onclick();
  const fromButton = page.el("rat-out").innerHTML.match(/-----BEGIN SSH SIGNATURE-----[\s\S]*?-----END SSH SIGNATURE-----/)[0];
  assert.equal((await verifyAndLog(fromButton, stmt, NS_RATIFY, [ratPub])).ok, true);
});

test("R31 the served page's signatures are accepted by stock ssh-keygen -Y verify", { skip: NO_SSH_KEYGEN }, async () => {
  const page = loadPage(SIGN_HTML);
  const seed = new Uint8Array(32).map((_, i) => (i * 37 + 11) % 256);
  const { priv, raw32 } = await page.keysFromSeed(seed);
  const pub = page.pubLine(raw32, "page-test");
  const asset = new Uint8Array(9000).map((_, i) => (i * 13) % 256);
  const relSig = await page.sshsig(priv, raw32, NS_RELEASE, asset);
  assert.equal(keygenVerifies(pub, NS_RELEASE, relSig, asset), true);
  assert.equal(keygenVerifies(pub, NS_RATIFY, relSig, asset), false);
  const stmt = ratifyStatement("BUNDLE-2", "0".repeat(64));
  const ratSig = await page.sshsig(priv, raw32, NS_RATIFY, stmt);
  assert.equal(keygenVerifies(pub, NS_RATIFY, ratSig, stmt), true);
  assert.equal(keygenVerifies(pub, NS_RATIFY, ratSig, ratifyStatement("BUNDLE-2", "1".repeat(64))), false);
});

/* The signature the page's notice button wrote, or null with the page's words. */
async function pageSignsNotice(page, id, rev, sha) {
  page.el("not-id").value = id;
  page.el("not-rev").value = rev;
  page.el("not-sha").value = sha;
  await page.el("not-sign").onclick();
  const out = page.el("not-out").innerHTML;
  const m = out.match(/-----BEGIN SSH SIGNATURE-----[\s\S]*?-----END SSH SIGNATURE-----\n?/);
  return { sig: m ? m[0] : null, out };
}

test("R37 the served page signs a notice in NS_NOTICE over exactly noticeStatement's bytes, with the ratification key", async () => {
  const page = loadPage(SIGN_HTML);
  const made = await page.generateAll();
  const ratPub = made["bio-ratify"].pub, relPub = made["bio-release"].pub;
  assert.equal(page.el("not-sign").disabled, false, "armed by the ratification key");
  for (const [id, rev] of [["NOTE-2026-4817", 1], ["NOTE-2026-0042-a-tail", 17]]) {
    const stmt = noticeStatement(id, rev, NOTICE_SHA);
    /* Whitespace around a pasted field, and a hash pasted in capitals, sign the same statement. */
    for (const [i, r, h] of [[id, String(rev), NOTICE_SHA], [` ${id}\n`, ` ${rev} `, NOTICE_SHA.toUpperCase()]]) {
      const { sig } = await pageSignsNotice(page, i, r, h);
      assert.ok(sig, "a signature was written");
      assert.deepEqual(await verifyAndLog(sig, stmt, NS_NOTICE, [ratPub]),
        { ok: true, keyB64: ratPub.split(" ")[1], namespace: NS_NOTICE });
      assert.equal((await verifyAndLog(sig, stmt, NS_RATIFY, [ratPub])).reason, "NAMESPACE");
      assert.equal((await verifyAndLog(sig, stmt, NS_NOTICE, [relPub])).reason, "UNKNOWN_KEY");
      assert.equal((await verifyAndLog(sig, noticeStatement(id, rev + 1, NOTICE_SHA), NS_NOTICE, [ratPub])).reason,
        "BAD_SIGNATURE");
    }
  }
  /* The page refuses, and signs nothing, wherever noticeStatement would throw on the same fields. */
  const cases = [["", "1", NOTICE_SHA], ["note-2026-4817", "1", NOTICE_SHA], ["NOTE-2026-481", "1", NOTICE_SHA],
    ["NOTE 2026-4817", "1", NOTICE_SHA], ["NOTE-2026-4817-A", "1", NOTICE_SHA],
    ["NOTE-2026-4817", "", NOTICE_SHA], ["NOTE-2026-4817", "0", NOTICE_SHA], ["NOTE-2026-4817", "-1", NOTICE_SHA],
    ["NOTE-2026-4817", "01", NOTICE_SHA], ["NOTE-2026-4817", "1.5", NOTICE_SHA], ["NOTE-2026-4817", "1e3", NOTICE_SHA],
    ["NOTE-2026-4817", "x", NOTICE_SHA], ["NOTE-2026-4817", String(Number.MAX_SAFE_INTEGER + 2), NOTICE_SHA],
    ["NOTE-2026-4817", "1", ""], ["NOTE-2026-4817", "1", "0".repeat(63)], ["NOTE-2026-4817", "1", "g".repeat(64)]];
  for (const [id, rev, sha] of cases) {
    const { sig, out } = await pageSignsNotice(page, id, rev, sha);
    assert.equal(sig, null, JSON.stringify([id, rev, sha]));
    assert.match(out, /class="warn"/);
    /* The revision as a person types it: canonical digits are a number, anything else is not one. */
    assert.throws(() => noticeStatement(id.trim(), /^[1-9]\d*$/.test(rev) ? Number(rev) : rev, sha.trim().toLowerCase()));
  }
  /* With no ratification key the button is not armed. */
  page.el("forget").onclick();
  assert.equal(page.el("not-sign").disabled, true);
  assert.equal(page.el("not-out").innerHTML, "");
});

test("R37 the served page's notice signatures are accepted by stock ssh-keygen -Y verify in bio-working-on only", { skip: NO_SSH_KEYGEN }, async () => {
  const page = loadPage(SIGN_HTML);
  const seed = new Uint8Array(32).map((_, i) => (i * 53 + 5) % 256);
  const { priv, raw32 } = await page.keysFromSeed(seed);
  const pub = page.pubLine(raw32, "notice-test");
  const stmt = noticeStatement("NOTE-2026-4817", 2, NOTICE_SHA);
  const sig = await page.sshsig(priv, raw32, NS_NOTICE, stmt);
  assert.equal(keygenVerifies(pub, NS_NOTICE, sig, stmt), true);
  assert.equal(keygenVerifies(pub, NS_RATIFY, sig, stmt), false);
  assert.equal(keygenVerifies(pub, NS_NOTICE, sig, noticeStatement("NOTE-2026-4817", 3, NOTICE_SHA)), false);
  /* And the page's own button, loaded with that key. */
  await page.parseKeyString(`BIOKEY-RAW1.bio-ratify.${Buffer.from(seed).toString("base64")}`);
  page.el("load-blob").value = `BIOKEY-RAW1.bio-ratify.${Buffer.from(seed).toString("base64")}`;
  await page.el("load").onclick();
  const fromButton = (await pageSignsNotice(page, "NOTE-2026-4817", "2", NOTICE_SHA)).sig;
  assert.equal(keygenVerifies(pub, NS_NOTICE, fromButton, stmt), true);
});

/* The signature the page's docket button wrote, or null with the page's words. */
async function pageSignsDocket(page, id, seq, sha) {
  page.el("dock-case").value = id;
  page.el("dock-seq").value = seq;
  page.el("dock-sha").value = sha;
  await page.el("dock-sign").onclick();
  const out = page.el("dock-out").innerHTML;
  const m = out.match(/-----BEGIN SSH SIGNATURE-----[\s\S]*?-----END SSH SIGNATURE-----\n?/);
  return { sig: m ? m[0] : null, out };
}

test("R39 the served page signs a docket entry in NS_DOCKET over exactly docketStatement's bytes, with the ratification key", async () => {
  const page = loadPage(SIGN_HTML);
  assert.equal(page.el("dock-sign").disabled, true, "not armed before a key is loaded");
  const made = await page.generateAll();
  const ratPub = made["bio-ratify"].pub, relPub = made["bio-release"].pub;
  assert.equal(page.el("dock-sign").disabled, false, "armed by the ratification key");
  assert.match(page.el("dock-key").innerHTML, new RegExp(`Signing as.*${ratPub.split(" ")[1].replace(/[+/]/g, "\\$&")}`));
  for (const [id, seq] of [["CASE-2026-3091", 1], ["CASE-2026-0042-a-tail", 17]]) {
    const stmt = docketStatement(id, seq, DOCKET_SHA);
    /* Whitespace around a pasted field, and a hash pasted in capitals, sign the same statement. */
    for (const [i, n, h] of [[id, String(seq), DOCKET_SHA], [` ${id}\n`, ` ${seq} `, DOCKET_SHA.toUpperCase()]]) {
      const { sig } = await pageSignsDocket(page, i, n, h);
      assert.ok(sig, "a signature was written");
      assert.deepEqual(await verifyAndLog(sig, stmt, NS_DOCKET, [ratPub]),
        { ok: true, keyB64: ratPub.split(" ")[1], namespace: NS_DOCKET });
      for (const ns of [NS_RATIFY, NS_NOTICE]) assert.equal((await verifyAndLog(sig, stmt, ns, [ratPub])).reason, "NAMESPACE");
      assert.equal((await verifyAndLog(sig, stmt, NS_DOCKET, [relPub])).reason, "UNKNOWN_KEY");
      assert.equal((await verifyAndLog(sig, docketStatement(id, seq + 1, DOCKET_SHA), NS_DOCKET, [ratPub])).reason,
        "BAD_SIGNATURE");
    }
  }
  /* The page refuses, and signs nothing, wherever docketStatement would throw on the same fields. */
  const cases = [["", "1", DOCKET_SHA], ["case-2026-3091", "1", DOCKET_SHA], ["CASE-2026-309", "1", DOCKET_SHA],
    ["CASE 2026-3091", "1", DOCKET_SHA], ["CASE-2026-3091-A", "1", DOCKET_SHA],
    ["CASE-2026-3091", "", DOCKET_SHA], ["CASE-2026-3091", "0", DOCKET_SHA], ["CASE-2026-3091", "-1", DOCKET_SHA],
    ["CASE-2026-3091", "01", DOCKET_SHA], ["CASE-2026-3091", "1.5", DOCKET_SHA], ["CASE-2026-3091", "1e3", DOCKET_SHA],
    ["CASE-2026-3091", "x", DOCKET_SHA], ["CASE-2026-3091", String(Number.MAX_SAFE_INTEGER + 2), DOCKET_SHA],
    ["CASE-2026-3091", "1", ""], ["CASE-2026-3091", "1", "0".repeat(63)], ["CASE-2026-3091", "1", "g".repeat(64)]];
  for (const [id, seq, sha] of cases) {
    const { sig, out } = await pageSignsDocket(page, id, seq, sha);
    assert.equal(sig, null, JSON.stringify([id, seq, sha]));
    assert.match(out, /class="warn"/);
    assert.throws(() => docketStatement(id.trim(), /^[1-9]\d*$/.test(seq) ? Number(seq) : seq, sha.trim().toLowerCase()));
  }
  /* With no ratification key the button is not armed, and its answer is cleared. */
  page.el("forget").onclick();
  assert.equal(page.el("dock-sign").disabled, true);
  assert.equal(page.el("dock-out").innerHTML, "");
});

test("R42 the served page signs a notice or docket entry for exactly the ids noticeStatement and docketStatement accept, the 10,000th included", async () => {
  const page = loadPage(SIGN_HTML);
  await page.generateAll();
  const ids = [];
  for (const prefix of [SEQ_PREFIXES[0], "NOTE", "CASE"]) for (const core of ID_CORES) for (const tail of ["", "-a-b", "-A", "-a_b"]) {
    ids.push(`${prefix}-${core}${tail}`);
  }
  ids.push("NOTE-2026-10000", "CASE-2026-10000", "ENT-2026-999", "note-2026-10000", "NOTE1-2026-10000");
  for (const id of ids) {
    const notice = (await pageSignsNotice(page, id, "1", NOTICE_SHA)).sig !== null;
    assert.equal(notice, statementAccepts(noticeStatement, id), `notice ${id}`);
    const docket = (await pageSignsDocket(page, id, "1", DOCKET_SHA)).sig !== null;
    assert.equal(docket, statementAccepts(docketStatement, id), `docket ${id}`);
  }
  /* And a 10,000th id's signature from the page verifies over the plane's own statement. */
  const made = await page.generateAll();
  const { sig } = await pageSignsNotice(page, "NOTE-2026-10000", "1", NOTICE_SHA);
  assert.equal((await verifyAndLog(sig, noticeStatement("NOTE-2026-10000", 1, NOTICE_SHA), NS_NOTICE, [made["bio-ratify"].pub])).ok, true);
});

test("R39 the served page's docket signatures are accepted by stock ssh-keygen -Y verify in bio-docket only", { skip: NO_SSH_KEYGEN }, async () => {
  const page = loadPage(SIGN_HTML);
  const seed = new Uint8Array(32).map((_, i) => (i * 71 + 3) % 256);
  const { priv, raw32 } = await page.keysFromSeed(seed);
  const pub = page.pubLine(raw32, "docket-test");
  const stmt = docketStatement("CASE-2026-3091", 2, DOCKET_SHA);
  const sig = await page.sshsig(priv, raw32, NS_DOCKET, stmt);
  assert.equal(keygenVerifies(pub, NS_DOCKET, sig, stmt), true);
  assert.equal(keygenVerifies(pub, NS_RATIFY, sig, stmt), false);
  assert.equal(keygenVerifies(pub, NS_NOTICE, sig, stmt), false);
  assert.equal(keygenVerifies(pub, NS_DOCKET, sig, docketStatement("CASE-2026-3091", 3, DOCKET_SHA)), false);
  /* And the page's own button, loaded with that key. */
  page.el("load-blob").value = `BIOKEY-RAW1.bio-ratify.${Buffer.from(seed).toString("base64")}`;
  await page.el("load").onclick();
  const fromButton = (await pageSignsDocket(page, "CASE-2026-3091", "2", DOCKET_SHA)).sig;
  assert.equal(keygenVerifies(pub, NS_DOCKET, fromButton, stmt), true);
});

test("R32 the page's visible text names Civicsmith, never BIO and never the old name CivicOS (DEC-124), and its wire formats are unchanged", async () => {
  /* Everything a person can read: the text between tags, attribute values, and
     the strings the script writes into the page. BIO survives only as the
     BIOKEY key prefixes, which are wire format; the old product name survives
     nowhere in the page, comments included. */
  assert.doesNotMatch(SIGN_HTML, /\bBIO\b/);
  assert.doesNotMatch(SIGN_HTML, /civic\s*os/i);
  assert.match(SIGN_HTML, /<title>Civicsmith signing keys<\/title>/);
  assert.match(SIGN_HTML, /<h1>Civicsmith signing keys<\/h1>/);
  /* The markup a person reads names the product only as Civicsmith. */
  const markup = SIGN_HTML.replace(/<!--[\s\S]*?-->/g, "").replace(/<style>[\s\S]*?<\/style>/g, "")
    .replace(/<script>[\s\S]*?<\/script>/g, "");
  assert.deepEqual(markup.match(/civic\w*/gi), ["Civicsmith", "Civicsmith", "Civicsmith", "Civicsmith", "Civicsmith"],
    "the title, the heading, and the ratify, notice and docket panes' \"your team's Civicsmith\" (DEC-149)");
  const page = loadPage(SIGN_HTML);
  await assert.rejects(page.parseKeyString("hello"), /^Error: that does not look like a Civicsmith private key$/);
  /* Every string the script writes into the page, on each path: none says BIO or CivicOS. */
  page.el("load-blob").value = "hello";
  await page.el("load").onclick();
  const written = [page.el("load-out").innerHTML];
  assert.match(written[0], /that does not look like a Civicsmith private key/);
  for (const id of ["rel-key", "rat-key", "not-key", "dock-key"]) written.push(page.el(id).innerHTML);
  /* Wire formats: key prefixes, namespaces and the download name. */
  const made = await page.generateAll();
  assert.ok(made["bio-release"].priv.startsWith("BIOKEY-RAW1.bio-release."));
  assert.ok(made["bio-ratify"].priv.startsWith("BIOKEY-RAW1.bio-ratify."));
  assert.match(made["bio-release"].pub, / bio-release$/);
  const seed = (await page.parseKeyString(made["bio-release"].priv)).seed;
  const wrapped = await page.wrapKey(seed, "a long passphrase", "bio-release");
  assert.ok(wrapped.startsWith("BIOKEY1.bio-release."));
  assert.equal((await page.parseKeyString(wrapped, "a long passphrase")).label, "bio-release");
  await page.el("gen").onclick();
  assert.match(page.el("gen-out").innerHTML, /When Civicsmith goes to real teams/);
  written.push(page.el("gen-out").innerHTML);
  for (const id of ["rel-key", "rat-key", "not-key", "dock-key"]) written.push(page.el(id).innerHTML);
  page.el("forget").onclick();
  written.push(page.el("load-out").innerHTML);
  for (const s of written) {
    assert.ok(s.length > 0);
    assert.doesNotMatch(s, /\bBIO\b/);
    assert.doesNotMatch(s, /civic\s*os/i);
  }
  page.el("dl").onclick();
  assert.equal(page.created.find((e) => e.tag === "a").download, "bio-signing-keys.txt");
});

test("R32 the page calls what a member ratifies a record, never a bundle (K899 (1)); the release asset's file name stays", async () => {
  /* The markup a person reads: the page without its comments, style and script. */
  const markup = SIGN_HTML.replace(/<!--[\s\S]*?-->/g, "").replace(/<style>[\s\S]*?<\/style>/g, "")
    .replace(/<script>[\s\S]*?<\/script>/g, "");
  assert.deepEqual(markup.match(/bundle\w*/gi), ["bundled"], "only the asset's file name");
  assert.match(markup, /<code>bio-plane\.bundled\.mjs<\/code>/);
  assert.match(markup, /Copy the record id and its current hash/);
  assert.match(markup, /<label for="rat-id">Record id<\/label>/);
  assert.match(markup, /<label for="rat-sha">Record hash<\/label>/);
  /* The strings the script writes into the page, for each answer the ratify button gives. */
  const page = loadPage(SIGN_HTML);
  await page.generateAll();
  const said = [];
  for (const [id, sha] of [["", ""], ["REC-1", "not hex"], ["REC-1", "ab".repeat(32)]]) {
    page.el("rat-id").value = id;
    page.el("rat-sha").value = sha;
    await page.el("rat-sign").onclick();
    said.push(page.el("rat-out").innerHTML);
  }
  assert.match(said[0], /Paste the record id\./);
  assert.match(said[1], /The record hash is 64 hex characters\./);
  assert.match(said[2], /If the record changes before/);
  /* And for each answer the notice button gives. */
  for (const [id, rev, sha] of [["", "1", NOTICE_SHA], ["NOTE-2026-4817", "0", NOTICE_SHA],
    ["NOTE-2026-4817", "1", "x"], ["NOTE-2026-4817", "1", NOTICE_SHA]]) {
    said.push((await pageSignsNotice(page, id, rev, sha)).out);
  }
  assert.match(said.at(-1), /If the notice changes before/);
  /* And for each answer the docket button gives. */
  for (const [id, seq, sha] of [["", "1", DOCKET_SHA], ["CASE-2026-3091", "0", DOCKET_SHA],
    ["CASE-2026-3091", "1", "x"], ["CASE-2026-3091", "1", DOCKET_SHA]]) {
    said.push((await pageSignsDocket(page, id, seq, sha)).out);
  }
  assert.match(said.at(-1), /If the entry changes before/);
  for (const s of said) { assert.doesNotMatch(s, /bundle/i); assert.doesNotMatch(s, /\bBIO\b/); }
  /* The rest of what the script writes: generate, load, forget, and the key status lines. */
  await page.el("gen").onclick();
  const generated = page.el("gen-out").innerHTML;
  page.el("load-blob").value = "not a key";
  await page.el("load").onclick();
  const loadErr = page.el("load-out").innerHTML;
  page.el("forget").onclick();
  for (const s of [generated, loadErr, page.el("load-out").innerHTML,
    page.el("rel-key").innerHTML, page.el("rat-key").innerHTML, page.el("not-key").innerHTML, page.el("dock-key").innerHTML]) {
    assert.ok(s.length > 0);
    assert.doesNotMatch(s, /bundle/i);
  }
});

test("R32 (DEC-149) the page sends a member to \"your team's Civicsmith\", never to \"the instance\" or \"the plane\"", async () => {
  /* The sweep's 11 rows (T35-5; plan/draft-T35-dec149-l1-l7.md), each string as the member reads it. */
  const markup = SIGN_HTML.replace(/<!--[\s\S]*?-->/g, "").replace(/<style>[\s\S]*?<\/style>/g, "")
    .replace(/<script>[\s\S]*?<\/script>/g, "");
  for (const s of [
    word("sign-release.ratify.intro"),                     /* :146 */
    word("sign-release.notice.intro"),         /* :164 */
    word("sign-release.docket.intro"),        /* :185 */
  ]) assert.ok(markup.replace(/\s+/g, " ").includes(s), s);
  /* What the script writes, on every path of the ratify, notice and docket buttons. */
  const page = loadPage(SIGN_HTML);
  await page.generateAll();
  page.el("rat-id").value = "REC-2026-0001";
  page.el("rat-sha").value = "ab".repeat(32);
  await page.el("rat-sign").onclick();
  const said = {
    ratify: page.el("rat-out").innerHTML,
    noticeBadId: (await pageSignsNotice(page, "not an id", "1", NOTICE_SHA)).out,
    notice: (await pageSignsNotice(page, "NOTE-2026-4817", "1", NOTICE_SHA)).out,
    docketBadId: (await pageSignsDocket(page, "not an id", "1", DOCKET_SHA)).out,
    docket: (await pageSignsDocket(page, "CASE-2026-3091", "1", DOCKET_SHA)).out,
  };
  for (const [where, s] of [
    ["ratify", word("sign-release.ratify.signature")],                     /* :456 */
    ["ratify", word("sign-release.ratify.covers", { id: "REC-2026-0001" })],  /* :458 */
    ["noticeBadId", word("sign-release.notice.paste.id")],                            /* :472 */
    ["notice", word("sign-release.notice.signature")],                     /* :479 */
    ["notice", word("sign-release.notice.covers", { revision: "1", id: "NOTE-2026-4817" })],   /* :481 */
    ["docketBadId", word("sign-release.docket.paste.id")],                              /* :491 */
    ["docket", word("sign-release.docket.signature")],                     /* :498 */
    ["docket", word("sign-release.docket.covers", { entry: "1", id: "CASE-2026-3091" })], /* :500 */
  ]) assert.ok(said[where].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").includes(s), `${where}: ${s}`);
  /* Nothing a member reads, markup or written by the script on any path, says "instance" or "plane",
     save the release asset's file name, bio-plane.bundled.mjs, a wire name (R32). */
  await page.el("gen").onclick();
  const rest = [page.el("gen-out").innerHTML];
  page.el("load-blob").value = "not a key";
  await page.el("load").onclick();
  rest.push(page.el("load-out").innerHTML);
  for (const id of ["rel-key", "rat-key", "not-key", "dock-key"]) rest.push(page.el(id).innerHTML);
  page.el("rel-file").files = [];
  await page.el("rel-sign").onclick();
  rest.push(page.el("rel-out").innerHTML);
  page.el("forget").onclick();
  rest.push(page.el("load-out").innerHTML);
  for (const s of [markup, ...Object.values(said), ...rest]) {
    const text = s.replace(/bio-plane\.bundled\.mjs/g, "");
    assert.doesNotMatch(text, /\binstances?\b/i);
    assert.doesNotMatch(text, /\bplanes?\b/i);
  }
});

