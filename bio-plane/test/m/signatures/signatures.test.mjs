/* signatures: requirement-named tests at the module's interface
 * (build/requirements/signatures.md). Each test names the requirement id it
 * checks in its title. Signatures are produced three independent ways: by
 * stock ssh-keygen, by a small SSHSIG signer written here from PROTOCOL.sshsig,
 * and by the signing page the module serves (its own script, run against a
 * stub DOM). Timestamp requests are compared with `openssl ts -query`, and
 * timestamp responses come from `openssl ts -reply` with a throwaway TSA.
 * Where ssh-keygen or openssl is missing, the cases that need it are skipped
 * by name; the rest still run. No network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { createHash, webcrypto } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

import * as sshsig from "../../../src/sshsig.mjs";
import * as tsa from "../../../src/tsa.mjs";
import * as signpage from "../../../src/signpage.mjs";
import { renderSignpage, SIGNPAGE_SRC, SIGNPAGE_OUT } from "../../../scripts/embed-signpage.mjs";

const {
  NS_RELEASE, NS_RATIFY, NS_FLEET, verifySshsig, ratifyStatement, caseRatifyStatement, fleetStatement,
} = sshsig;
const {
  timestampRequest, parseTimestampResponse, TSA_ENDPOINTS, TSA_CONTENT_TYPE, TSA_ACCEPT,
  ARCHIVE_SAVE_BASE, ARCHIVE_SERVICE, archiveLocatorFrom,
} = tsa;
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

/* ======================================================================= R1 */

test("R1 the three namespaces are the compiled strings, pairwise distinct, and a signature in one never verifies in another", async () => {
  assert.equal(NS_RELEASE, "bio-release");
  assert.equal(NS_RATIFY, "bio-ratify");
  assert.equal(NS_FLEET, "bio-release-fleet");
  assert.equal(new Set([NS_RELEASE, NS_RATIFY, NS_FLEET]).size, 3);
  const msg = enc("one message\n");
  for (const signedIn of [NS_RELEASE, NS_RATIFY, NS_FLEET]) {
    const sig = await sign(KEY, signedIn, msg);
    for (const checkedIn of [NS_RELEASE, NS_RATIFY, NS_FLEET]) {
      const r = await verifyAndLog(sig, msg, checkedIn, [KEY.line]);
      if (signedIn === checkedIn) assert.equal(r.ok, true);
      else assert.deepEqual(r, { ok: false, reason: "NAMESPACE", expected: checkedIn, got: signedIn });
    }
  }
});

/* ======================================================================= R2 */

test("R2 a pinned OpenSSH signature verifies, naming its key and namespace", async () => {
  const r = await verifyAndLog(PINNED.sig, enc(PINNED.msg), NS_RELEASE, [PINNED.pub]);
  assert.deepEqual(r, { ok: true, keyB64: PINNED.pub.split(" ")[1], namespace: NS_RELEASE });
});

test("R2 fresh ssh-keygen signatures verify, in sha512 and in sha256", { skip: NO_SSH_KEYGEN }, async () => {
  for (const hashalg of [undefined, "sha512", "sha256"]) {
    const msg = enc(`fresh message ${hashalg}\n`);
    const f = keygenSign(NS_RATIFY, msg, hashalg);
    const r = await verifyAndLog(f.sig, msg, NS_RATIFY, [f.pub]);
    assert.deepEqual(r, { ok: true, keyB64: f.pub.split(/\s+/)[1], namespace: NS_RATIFY });
    assert.equal((await verifyAndLog(f.sig, enc(`fresh message ${hashalg}!\n`), NS_RATIFY, [f.pub])).reason,
      "BAD_SIGNATURE");
  }
});

test("R2 the blob's declared hash decides the inner hash: sha512 and sha256 both verify, and a swapped declaration does not", async () => {
  const msg = enc("hash choice\n");
  for (const hashAlg of ["sha512", "sha256"]) {
    assert.equal((await verifyAndLog(await sign(KEY, NS_RELEASE, msg, { hashAlg }), msg, NS_RELEASE, [KEY.line])).ok, true);
  }
  /* A signature over the sha256 preimage, relabelled sha512, must not verify. */
  const h = new Uint8Array(await webcrypto.subtle.digest("SHA-256", msg));
  const signed256 = u8(enc("SSHSIG"), sstr(NS_RELEASE), sstr(new Uint8Array(0)), sstr("sha256"), sstr(h));
  const sig = new Uint8Array(await webcrypto.subtle.sign("Ed25519", KEY.priv, signed256));
  const relabelled = await sign(KEY, NS_RELEASE, msg, { hashAlg: "sha512", sig });
  assert.equal((await verifyAndLog(relabelled, msg, NS_RELEASE, [KEY.line])).reason, "BAD_SIGNATURE");
});

test("R2 the reserved field is part of the signed bytes", async () => {
  const msg = enc("reserved\n");
  const withReserved = await sign(KEY, NS_RELEASE, msg, { reserved: enc("x") });
  assert.equal((await verifyAndLog(withReserved, msg, NS_RELEASE, [KEY.line])).ok, true);
});

test("R2 allowedKeys: a bare base64 field, a full key line and a principal-prefixed allowed_signers line all name the same key", async () => {
  const msg = enc("key forms\n");
  const sig = await sign(KEY, NS_RATIFY, msg);
  const forms = [KEY.keyB64, KEY.line, `ssh-ed25519 ${KEY.keyB64}`, `alice@group ssh-ed25519 ${KEY.keyB64} comment here`,
    `  ${KEY.line}  `];
  for (const form of forms) {
    assert.deepEqual(await verifyAndLog(sig, msg, NS_RATIFY, [form]), { ok: true, keyB64: KEY.keyB64, namespace: NS_RATIFY });
    assert.equal((await verifyAndLog(sig, msg, NS_RATIFY, ["junk", OTHER.line, form])).ok, true);
  }
  for (const notIt of [OTHER.keyB64, OTHER.line, `ssh-rsa ${KEY.keyB64}`, "", "AAAA", KEY.keyB64.slice(0, -4)]) {
    assert.equal((await verifyAndLog(sig, msg, NS_RATIFY, [notIt])).reason, "UNKNOWN_KEY");
  }
});

test("R2 the signature covers exactly the bytes of message, whatever byte view carries them", async () => {
  const msg = enc("exact bytes\n");
  const sig = await sign(KEY, NS_RELEASE, msg);
  const views = [msg, Buffer.from(msg), msg.buffer.slice(msg.byteOffset, msg.byteOffset + msg.length),
    new DataView(msg.buffer, msg.byteOffset, msg.length)];
  for (const v of views) assert.equal((await verifyAndLog(sig, v, NS_RELEASE, [KEY.line])).ok, true);
  for (const other of [enc("exact bytes"), enc("exact bytes\n\n"), enc("Exact bytes\n"), new Uint8Array(0)]) {
    assert.equal((await verifyAndLog(sig, other, NS_RELEASE, [KEY.line])).reason, "BAD_SIGNATURE");
  }
});

/* ======================================================================= R3 */

test("R3 MALFORMED: bad armor, magic, version, key or signature type or length, or an unknown hash", async () => {
  const msg = enc("malformed\n");
  const good = await sign(KEY, NS_RELEASE, msg);
  const cases = {
    "no armor": "just text",
    "armor with no body": "-----BEGIN SSH SIGNATURE-----\n-----END SSH SIGNATURE-----",
    "not base64 inside": "-----BEGIN SSH SIGNATURE-----\n%%%%\n-----END SSH SIGNATURE-----",
    "truncated blob": armor(dearmor(good).slice(0, 40)),
    "bad magic": await sign(KEY, NS_RELEASE, msg, { magic: "SSHXIG" }),
    "version 2": await sign(KEY, NS_RELEASE, msg, { version: 2 }),
    "version 0": await sign(KEY, NS_RELEASE, msg, { version: 0 }),
    "rsa key type": await sign(KEY, NS_RELEASE, msg, { keyType: "ssh-rsa" }),
    "31-byte key": await sign(KEY, NS_RELEASE, msg, { pubRaw: KEY.raw.slice(0, 31) }),
    "33-byte key": await sign(KEY, NS_RELEASE, msg, { pubRaw: u8(KEY.raw, new Uint8Array([0])) }),
    "signature type mismatch": await sign(KEY, NS_RELEASE, msg, { sigType: "ssh-rsa" }),
    "63-byte signature": await sign(KEY, NS_RELEASE, msg, { sig: new Uint8Array(63) }),
    "65-byte signature": await sign(KEY, NS_RELEASE, msg, { sig: new Uint8Array(65) }),
    "sha1 hash": await sign(KEY, NS_RELEASE, msg, { hashAlg: "sha1" }),
    "SHA512 spelled in capitals": await sign(KEY, NS_RELEASE, msg, { hashAlg: "SHA512" }),
    "empty hash name": await sign(KEY, NS_RELEASE, msg, { hashAlg: "" }),
  };
  for (const [name, armored] of Object.entries(cases)) {
    const r = await verifyAndLog(armored, msg, NS_RELEASE, [KEY.line]);
    assert.equal(r.ok, false, name);
    assert.equal(r.reason, "MALFORMED", name);
  }
});

test("R3 NAMESPACE carries expected and got; UNKNOWN_KEY and BAD_SIGNATURE carry the signing key", async () => {
  const msg = enc("reasons\n");
  const sig = await sign(KEY, NS_RATIFY, msg);
  assert.deepEqual(await verifyAndLog(sig, msg, NS_RELEASE, [KEY.line]),
    { ok: false, reason: "NAMESPACE", expected: NS_RELEASE, got: NS_RATIFY });
  assert.deepEqual(await verifyAndLog(sig, msg, NS_RATIFY, [OTHER.line]),
    { ok: false, reason: "UNKNOWN_KEY", keyB64: KEY.keyB64 });
  assert.deepEqual(await verifyAndLog(sig, enc("reasons!\n"), NS_RATIFY, [KEY.line]),
    { ok: false, reason: "BAD_SIGNATURE", keyB64: KEY.keyB64 });
  /* The namespace is judged before the key list, and the key list before the signature. */
  assert.equal((await verifyAndLog(sig, enc("other"), NS_RELEASE, [])).reason, "NAMESPACE");
  assert.equal((await verifyAndLog(sig, enc("other"), NS_RATIFY, [])).reason, "UNKNOWN_KEY");
});

test("R3 CRYPTO_UNAVAILABLE when the runtime refuses to import the key", async (t) => {
  const msg = enc("no crypto\n");
  const sig = await sign(KEY, NS_RELEASE, msg);
  t.mock.method(globalThis.crypto.subtle, "importKey", async () => { throw new Error("Ed25519 not supported"); });
  const r = await verifyAndLog(sig, msg, NS_RELEASE, [KEY.line]);
  assert.equal(r.ok, false);
  assert.equal(r.reason, "CRYPTO_UNAVAILABLE");
});

/* ======================================================================= R4 */

test("R4 verifySshsig never throws, whatever it is given", async () => {
  const msg = enc("never throws\n");
  const good = await sign(KEY, NS_RELEASE, msg);
  const armoreds = [undefined, null, 0, 42, {}, [], "", good, good.replace(/[A-Z]/g, "a"), armor(new Uint8Array(3)),
    { toString() { throw new Error("hostile"); } }];
  const messages = [undefined, null, "a string", 12, {}, [1, 2], msg, new Uint8Array(0)];
  const namespaces = [undefined, null, NS_RELEASE, 7, {}];
  const keyLists = [undefined, null, "a string", [KEY.line], [null, undefined, 3, {}, KEY.line], { length: 2 }];
  for (const a of armoreds) for (const m of messages) for (const n of namespaces) for (const k of keyLists) {
    let r;
    await assert.doesNotReject(async () => { r = await verifyAndLog(a, m, n, k); });
    assert.equal(typeof r.ok, "boolean");
    if (!r.ok) assert.ok(REASONS_SSHSIG.includes(r.reason), r.reason);
    if (r.ok) assert.ok(a === good && n === NS_RELEASE && m === msg);
  }
  /* A random blob, at every length up to 300, is a reason, never a throw. */
  for (let n = 0; n < 300; n++) {
    const blob = webcrypto.getRandomValues(new Uint8Array(n));
    const r = await verifyAndLog(armor(u8(enc("SSHSIG"), blob)), msg, NS_RELEASE, [KEY.line]);
    assert.equal(r.ok, false);
  }
});

/* =================================================================== R5–R7 */

test("R5 ratifyStatement is exactly the ASCII line, the same bytes every time", () => {
  const id = "BUNDLE-2026-0001-x", sha = "ab".repeat(32);
  const out = ratifyStatement(id, sha);
  assert.ok(out instanceof Uint8Array);
  assert.deepEqual([...out], [...Buffer.from(`bio-ratify ${id} ${sha}\n`, "ascii")]);
  assert.deepEqual(ratifyStatement(id, sha), out);
  assert.equal(td.decode(ratifyStatement("a", "b")), "bio-ratify a b\n");
  assert.notDeepEqual(ratifyStatement(id, "cd".repeat(32)), out);
});

test("R6 caseRatifyStatement is exactly the ASCII line", () => {
  const out = caseRatifyStatement("CASE-9", 3, "ef".repeat(32));
  assert.ok(out instanceof Uint8Array);
  assert.deepEqual([...out], [...Buffer.from(`bio-ratify-case CASE-9 3 ${"ef".repeat(32)}\n`, "ascii")]);
  assert.deepEqual(caseRatifyStatement("CASE-9", 3, "ef".repeat(32)), out);
  assert.notDeepEqual(caseRatifyStatement("CASE-9", 4, "ef".repeat(32)), out);
});

test("R7 a bundle ratification and a case ratification are never the same bytes, and never verify for each other", async () => {
  const ids = ["x", "CASE-1", "CASE-1 1", "bio-ratify-case", "-case", ""];
  const eds = ["1", 1, "", "x y"];
  const shas = ["0".repeat(64), "ab", ""];
  for (const a of ids) for (const b of ids) for (const e of eds) for (const s of shas) for (const s2 of shas) {
    const bundle = td.decode(ratifyStatement(a, s));
    const kase = td.decode(caseRatifyStatement(b, e, s2));
    assert.notEqual(bundle, kase);
    assert.ok(bundle.startsWith("bio-ratify ") && kase.startsWith("bio-ratify-case "));
  }
  const sig = await sign(KEY, NS_RATIFY, ratifyStatement("CASE-1", "0".repeat(64)));
  assert.equal((await verifyAndLog(sig, caseRatifyStatement("CASE-1", 1, "0".repeat(64)), NS_RATIFY, [KEY.line])).reason,
    "BAD_SIGNATURE");
});

/* ================================================================== R8–R14 */

const PLANE = { sha256: "p".repeat(64), bytes: 1000, asset: "bio-plane.bundled.mjs" };
const member = (name, o = {}) => ({
  member: name, sha256: `${name[0]}`.repeat(64), bytes: 10, asset: `${name}.bundled.mjs`,
  compat: { date: "2026-01-01", flags: ["nodejs_compat"] }, services: [], parts: [], ...o,
});

test("R8 the fleet statement: header, plane line, one line per member, trailing newline", () => {
  const s = fleetStatement({ version: "1.2.3", plane: PLANE, members: [member("alpha")] });
  assert.equal(s,
    "bio-release-fleet/2\nversion 1.2.3\nplane " + "p".repeat(64) + " 1000 bio-plane.bundled.mjs\n"
    + "member alpha " + "a".repeat(64) + " 10 alpha.bundled.mjs compat=2026-01-01+nodejs_compat services= parts=\n");
  const three = fleetStatement({ version: "v", plane: PLANE, members: [member("a1"), member("b1"), member("c1")] });
  const lines = three.split("\n");
  assert.equal(lines.length, 3 + 3 + 1);
  assert.equal(lines.at(-1), "");
  assert.ok(lines.slice(3, 6).every((l) => l.startsWith("member ")));
  assert.equal(fleetStatement({ version: "v", plane: PLANE, members: [] }),
    "bio-release-fleet/2\nversion v\nplane " + "p".repeat(64) + " 1000 bio-plane.bundled.mjs\n\n");
});

test("R9 member lines are sorted by name whatever the input order", () => {
  const ms = ["pdf-worker", "agent-worker", "ocr-worker", "Zed", "b"].map((n) => member(n));
  const want = fleetStatement({ version: "v", plane: PLANE, members: ms });
  const names = want.split("\n").filter((l) => l.startsWith("member ")).map((l) => l.split(" ")[1]);
  assert.deepEqual(names, ["Zed", "agent-worker", "b", "ocr-worker", "pdf-worker"]);
  for (let i = 0; i < 30; i++) {
    const shuffled = [...ms].sort(() => Math.random() - 0.5);
    assert.equal(fleetStatement({ version: "v", plane: PLANE, members: shuffled }), want);
  }
});

test("R10 a member line states compat, flags, services and parts, each sorted, with empty lists stated", () => {
  const m = member("worker", {
    sha256: "s".repeat(64), bytes: 77, asset: "worker.mjs",
    compat: { date: "2025-09-01", flags: ["z_flag", "nodejs_compat", "a_flag"] },
    services: [{ binding: "PLANE", service: "bio-plane" }, { binding: "AUX", service: "aux" }],
    parts: [
      { path: "b.wasm", type: "CompiledWasm", sha256: "2".repeat(64), bytes: 5 },
      { path: "a.bin", type: "Data", sha256: "1".repeat(64), bytes: 4 },
    ],
  });
  const line = fleetStatement({ version: "v", plane: PLANE, members: [m] }).split("\n")[3];
  assert.equal(line, `member worker ${"s".repeat(64)} 77 worker.mjs compat=2025-09-01+a_flag,nodejs_compat,z_flag`
    + ` services=AUX:aux,PLANE:bio-plane parts=a.bin:Data:${"1".repeat(64)}:4,b.wasm:CompiledWasm:${"2".repeat(64)}:5`);
  const bare = fleetStatement({ version: "v", plane: PLANE,
    members: [member("bare", { compat: { date: "2025-01-01", flags: [] }, services: undefined, parts: undefined })] });
  assert.match(bare.split("\n")[3], / compat=2025-01-01\+- services= parts=$/);
  /* The caller's arrays are not reordered in place. */
  assert.deepEqual(m.compat.flags, ["z_flag", "nodejs_compat", "a_flag"]);
});

test("R11 an unstated compat date is refused by name", () => {
  for (const compat of [undefined, null, {}, { date: "", flags: [] }, { date: 20260101, flags: [] }, { flags: [] }]) {
    assert.throws(() => fleetStatement({ version: "v", plane: PLANE, members: [member("m", { compat })] }),
      (e) => e instanceof Error && e.message.startsWith("REFUSED [MEMBER_COMPAT_UNSTATED]: "));
  }
});

test("R12 an unstated flags list is refused by name", () => {
  for (const flags of [undefined, null, "nodejs_compat", {}, 0]) {
    assert.throws(() => fleetStatement({ version: "v", plane: PLANE,
      members: [member("m", { compat: { date: "2026-01-01", flags } })] }),
    (e) => e instanceof Error && e.message.startsWith("REFUSED [MEMBER_FLAGS_UNSTATED]: "));
  }
});

test("R13 a part with no module type is refused by name", () => {
  for (const type of [undefined, null, "", 3]) {
    assert.throws(() => fleetStatement({ version: "v", plane: PLANE,
      members: [member("m", { parts: [{ path: "x.bin", type, sha256: "0".repeat(64), bytes: 1 }] })] }),
    (e) => e instanceof Error && e.message.startsWith("REFUSED [PART_TYPE_UNSTATED]: "));
  }
});

test("R14 the statement is deterministic, and a refusal returns nothing at all", () => {
  const ms = [member("b", { services: [{ binding: "X", service: "y" }] }), member("a")];
  const one = fleetStatement({ version: "v", plane: PLANE, members: ms });
  assert.equal(fleetStatement({ version: "v", plane: PLANE, members: [...ms].reverse() }), one);
  assert.equal(fleetStatement({ version: "v", plane: PLANE, members: structuredClone(ms) }), one);
  /* A bad member anywhere in the set, first or last, refuses the whole statement. */
  for (const bad of [member("0first", { compat: {} }), member("zlast", { compat: { date: "d" } }),
    member("mid", { parts: [{ path: "p" }] })]) {
    let out = "untouched";
    assert.throws(() => { out = fleetStatement({ version: "v", plane: PLANE, members: [...ms, bad] }); });
    assert.equal(out, "untouched");
  }
});

/* ================================================================= R15–R16 */

/* The nonce openssl put in a query: the INTEGER after the MessageImprint. */
function nonceOf(der) {
  let i = 2 + (der[1] & 0x80 ? der[1] & 0x7f : 0);   /* inside the outer SEQUENCE */
  i += 3;                                             /* version INTEGER 1 */
  i += 2 + der[i + 1];                                /* MessageImprint SEQUENCE (short form) */
  assert.equal(der[i], 0x02);
  let v = der.slice(i + 2, i + 2 + der[i + 1]);
  if (v.length > 1 && v[0] === 0) v = v.slice(1);
  return v;
}

test("R15 timestampRequest is byte-identical to openssl ts -query -sha256 -cert for the same digest and nonce", { skip: NO_OPENSSL }, () => {
  for (let i = 0; i < 40; i++) {
    const data = join(DIR, `ts${i}`), q = join(DIR, `ts${i}.tsq`);
    writeFileSync(data, `timestamp me ${i}`);
    execFileSync("openssl", ["ts", "-query", "-data", data, "-sha256", "-cert", "-out", q], { stdio: "ignore" });
    const want = new Uint8Array(readFileSync(q));
    const digest = createHash("sha256").update(`timestamp me ${i}`).digest("hex");
    const { der } = timestampRequest(digest, nonceOf(want));
    assert.deepEqual([...der], [...want], `query ${i}`);
  }
});

test("R15 the request's structure: version 1, SHA-256 imprint, nonce as a minimal INTEGER, certReq true", () => {
  const digest = createHash("sha256").update("x").digest("hex");
  const imprint = [0x30, 0x31, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01, 0x05, 0x00,
    0x04, 0x20, ...Buffer.from(digest, "hex")];
  const expect = (nonceDer) => {
    const body = [0x02, 0x01, 0x01, ...imprint, ...nonceDer, 0x01, 0x01, 0xff];
    return [0x30, body.length, ...body];
  };
  const cases = [
    [[1, 2, 3, 4, 5, 6, 7, 8], [0x02, 0x08, 1, 2, 3, 4, 5, 6, 7, 8]],
    [[0x80, 0, 0, 0, 0, 0, 0, 1], [0x02, 0x09, 0x00, 0x80, 0, 0, 0, 0, 0, 0, 1]],
    [[0, 0, 0x12, 3, 4, 5, 6, 7], [0x02, 0x06, 0x12, 3, 4, 5, 6, 7]],
    [[0, 0x80, 1, 2, 3, 4, 5, 6], [0x02, 0x08, 0x00, 0x80, 1, 2, 3, 4, 5, 6]],
    [[0, 0, 0, 0, 0, 0, 0, 0], [0x02, 0x01, 0x00]],
  ];
  for (const [nonce, nonceDer] of cases) {
    assert.deepEqual([...timestampRequest(digest, new Uint8Array(nonce)).der], expect(nonceDer), String(nonce));
  }
});

test("R16 a given nonce is used verbatim and returned; an omitted one is 8 fresh random bytes", () => {
  const digest = "00".repeat(32);
  const nonce = new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2]);
  assert.equal(timestampRequest(digest, nonce).nonce, nonce);
  const seen = new Set();
  for (let i = 0; i < 50; i++) {
    const r = timestampRequest(digest);
    assert.ok(r.nonce instanceof Uint8Array);
    assert.equal(r.nonce.length, 8);
    seen.add(Buffer.from(r.nonce).toString("hex"));
    /* The nonce returned is the nonce requested. */
    assert.deepEqual([...timestampRequest(digest, r.nonce).der], [...r.der]);
  }
  assert.equal(seen.size, 50);
});

/* ================================================================= R17–R19 */

/* Hand-built TimeStampResp shapes, for the statuses a real TSA rarely gives. */
const tlv = (tag, body) => {
  const len = body.length < 0x80 ? [body.length]
    : body.length < 0x100 ? [0x81, body.length] : [0x82, body.length >> 8, body.length & 255];
  return new Uint8Array([tag, ...len, ...body]);
};
const statusInfo = (s) => tlv(0x30, tlv(0x02, new Uint8Array([s])));
const resp = (s, token) => tlv(0x30, token ? u8(statusInfo(s), token) : statusInfo(s));
const DIGEST = createHash("sha256").update("the capture").digest("hex");
const fakeToken = (digestHex) => tlv(0x30, u8(tlv(0x06, new Uint8Array([0x2a, 0x86])), tlv(0x04, Buffer.from(digestHex, "hex"))));

/* A real reply from a throwaway TSA made with openssl, when openssl is here. */
function opensslReply(dataText) {
  const d = mkdtempSync(join(DIR, "tsa-"));
  writeFileSync(join(d, "tsa.cnf"), [
    "[req]", "distinguished_name=dn", "prompt=no", "x509_extensions=ext",
    "[dn]", "CN=throwaway test TSA",
    "[ext]", "basicConstraints=critical,CA:false", "extendedKeyUsage=critical,timeStamping",
    "keyUsage=critical,digitalSignature",
    "[t]", `serial=${join(d, "serial")}`, `signer_cert=${join(d, "tsa.crt")}`, `signer_key=${join(d, "tsa.key")}`,
    "signer_digest=sha256", "default_policy=1.2.3.4", "digests=sha256", "ess_cert_id_alg=sha256", ""].join("\n"));
  writeFileSync(join(d, "serial"), "01\n");
  writeFileSync(join(d, "data"), dataText);
  const run = (args) => execFileSync("openssl", args, { cwd: d, stdio: "ignore" });
  run(["req", "-x509", "-newkey", "ec", "-pkeyopt", "ec_paramgen_curve:P-256", "-nodes", "-keyout", "tsa.key",
    "-out", "tsa.crt", "-days", "2", "-config", "tsa.cnf"]);
  run(["ts", "-query", "-data", "data", "-sha256", "-cert", "-out", "q.tsq"]);
  run(["ts", "-reply", "-config", "tsa.cnf", "-section", "t", "-queryfile", "q.tsq", "-out", "r.tsr"]);
  return new Uint8Array(readFileSync(join(d, "r.tsr")));
}

test("R17 a real granted reply is ok, bound to its digest, and the token is the token's own DER", { skip: NO_OPENSSL }, () => {
  const reply = opensslReply("the capture");
  const r = parseAndLog(reply, DIGEST);
  assert.equal(r.ok, true);
  assert.equal(r.status, 0);
  /* The token is the reply's second element, exactly: its bytes run to the reply's end. */
  const tokenStart = reply.length - r.token.length;
  assert.deepEqual([...r.token], [...reply.slice(tokenStart)]);
  assert.equal(r.token[0], 0x30);
  assert.ok(r.token.length > 32);
  /* openssl reads the token we return as a token. */
  const tok = join(DIR, "token.der");
  writeFileSync(tok, r.token);
  assert.doesNotThrow(() => execFileSync("openssl", ["ts", "-reply", "-in", tok, "-token_in", "-text", "-token_out"],
    { stdio: "ignore" }));
  assert.equal(parseAndLog(reply, createHash("sha256").update("another capture").digest("hex")).reason, "NOT_BOUND");
});

test("R17 status 0 and 1 carrying a token that holds the digest are ok, with the token returned", () => {
  for (const s of [0, 1]) {
    const token = fakeToken(DIGEST);
    const r = parseAndLog(resp(s, token), DIGEST);
    assert.equal(r.ok, true);
    assert.equal(r.status, s);
    assert.deepEqual([...r.token], [...token]);
    assert.equal(parseAndLog(resp(s, token), DIGEST.toUpperCase()).ok, true);
  }
});

test("R18 each kind of no: MALFORMED, REJECTED with status, NO_TOKEN with status, NOT_BOUND with status", () => {
  for (const bad of [new Uint8Array(0), new Uint8Array([0x30]), new Uint8Array([0x04, 0x00]), tlv(0x30, new Uint8Array(0)),
    tlv(0x30, tlv(0x04, new Uint8Array([0]))), tlv(0x30, tlv(0x30, tlv(0x04, new Uint8Array([0])))),
    new Uint8Array([0x30, 0x85, 1, 1, 1, 1, 1]), new Uint8Array([0x30, 0x80])]) {
    assert.deepEqual(parseAndLog(bad, DIGEST), { ok: false, reason: "MALFORMED" });
  }
  for (const s of [2, 3, 4, 5, 200]) {
    assert.deepEqual(parseAndLog(resp(s, fakeToken(DIGEST)), DIGEST), { ok: false, reason: "REJECTED", status: s });
  }
  for (const s of [0, 1]) {
    assert.deepEqual(parseAndLog(resp(s), DIGEST), { ok: false, reason: "NO_TOKEN", status: s });
    assert.deepEqual(parseAndLog(resp(s, tlv(0x04, new Uint8Array([1]))), DIGEST), { ok: false, reason: "NO_TOKEN", status: s });
    assert.deepEqual(parseAndLog(resp(s, fakeToken("11".repeat(32))), DIGEST), { ok: false, reason: "NOT_BOUND", status: s });
    /* A digest that binds nothing is never found. */
    for (const d of [undefined, null, "", "abc", "zz".repeat(32), 42]) {
      assert.deepEqual(parseAndLog(resp(s, fakeToken(DIGEST)), d), { ok: false, reason: "NOT_BOUND", status: s });
    }
  }
});

test("R19 parseTimestampResponse never throws", () => {
  const inputs = [undefined, null, "string", 42, {}, [], [0x30, 0x00], new ArrayBuffer(4), new Uint8Array(0),
    resp(0, fakeToken(DIGEST))];
  for (const b of inputs) for (const d of [undefined, null, DIGEST, 7, {}, "a"]) {
    let r;
    assert.doesNotThrow(() => { r = parseAndLog(b, d); });
    assert.equal(typeof r.ok, "boolean");
  }
  for (let n = 0; n < 2000; n++) {
    const bytes = webcrypto.getRandomValues(new Uint8Array(n % 97));
    if (n % 2) bytes[0] = 0x30;
    assert.doesNotThrow(() => parseAndLog(bytes, DIGEST));
  }
});

/* ================================================================= R20–R22 */

test("R20 TSA_ENDPOINTS is the compiled list, in order, and cannot be changed by a caller", () => {
  assert.deepEqual([...TSA_ENDPOINTS],
    ["http://timestamp.digicert.com", "http://timestamp.sectigo.com", "http://rfc3161.ai.moda"]);
  assert.ok(Object.isFrozen(TSA_ENDPOINTS));
  assert.throws(() => { "use strict"; TSA_ENDPOINTS.push("http://attacker.example"); });
  assert.throws(() => { TSA_ENDPOINTS[0] = "http://attacker.example"; });
  assert.throws(() => { tsa.TSA_ENDPOINTS = []; });
  assert.equal(TSA_ENDPOINTS.length, 3);
  /* No service takes an endpoint: a request is built from a digest and a nonce only. */
  assert.equal(timestampRequest.length, 2);
});

test("R21 the RFC 3161 media types", () => {
  assert.equal(TSA_CONTENT_TYPE, "application/timestamp-query");
  assert.equal(TSA_ACCEPT, "application/timestamp-reply");
});

test("R22 the archive save base and service name are compiled and not settable", () => {
  assert.equal(ARCHIVE_SAVE_BASE, "https://web.archive.org/save/");
  assert.equal(typeof ARCHIVE_SERVICE, "string");
  assert.ok(ARCHIVE_SERVICE.length > 0);
  assert.throws(() => { tsa.ARCHIVE_SAVE_BASE = "https://attacker.example/"; });
  assert.throws(() => { tsa.ARCHIVE_SERVICE = "x"; });
  assert.equal(tsa.ARCHIVE_SAVE_BASE, "https://web.archive.org/save/");
});

/* ================================================================= R23–R24 */

const answer = (headers, url) => ({ headers: new Headers(headers), url });
const LOC = "https://web.archive.org/web/20260926120000/https://example.org/page";

test("R23 the locator is read from content-location, then location, then the response url", () => {
  const cases = [
    [answer({ "content-location": "/web/20260926120000/https://example.org/page" }, ""), LOC],
    [answer({ "content-location": LOC }, ""), LOC],
    [answer({ location: "/web/20260926120000/https://example.org/page" }, ""), LOC],
    [answer({ location: LOC.replace("https:", "http:") }, ""), LOC.replace("https:", "http:")],
    [answer({}, LOC), LOC],
    /* Order: content-location wins over location, location over the url. */
    [answer({ "content-location": "/web/1/a", location: "/web/2/b" }, "https://web.archive.org/web/3/c"),
      "https://web.archive.org/web/1/a"],
    [answer({ location: "/web/2/b" }, "https://web.archive.org/web/3/c"), "https://web.archive.org/web/2/b"],
    /* A header that names no archived locator does not hide a later one that does. */
    [answer({ "content-location": "/save/whatever", location: "/web/2/b" }, ""), "https://web.archive.org/web/2/b"],
    [answer({ "content-location": "text/html", location: "https://elsewhere.example/web/1" }, LOC), LOC],
    /* None of the three names one. */
    [answer({}, ""), null],
    [answer({ location: "https://web.archive.org/save/https://example.org" }, "https://web.archive.org/save/x"), null],
    [answer({ location: "https://evil.example/web/2026/x" }, "https://web.archive.org.evil.example/web/1/x"), null],
    [answer({ location: "/web/notdigits" }, undefined), null],
  ];
  for (const [res, want] of cases) assert.equal(archiveLocatorFrom(res, "https://example.org/page"), want);
});

test("R24 archiveLocatorFrom never throws", () => {
  const hostile = { get headers() { throw new Error("boom"); }, get url() { throw new Error("boom"); } };
  const inputs = [undefined, null, 0, "x", {}, { headers: {} }, { headers: null, url: LOC }, { headers: { get: () => 5 } },
    { headers: { get() { throw new Error("no"); } }, url: LOC }, hostile, answer({}, 12)];
  for (const res of inputs) {
    let r;
    assert.doesNotThrow(() => { r = archiveLocatorFrom(res); });
    assert.ok(r === null || typeof r === "string");
  }
  assert.equal(archiveLocatorFrom({ headers: { get() { throw new Error("no"); } }, url: LOC }), LOC);
  assert.equal(archiveLocatorFrom({ headers: null, url: LOC }), LOC);
});

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

test("R25 the page served is the current render of src/sign-release.html (N7)", () => {
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

/* Run the served page's own script against a stub DOM. */
function loadPage(html) {
  const script = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"));
  const els = new Map();
  const el = () => ({ value: "", innerHTML: "", disabled: false, files: [], onclick: null,
    classList: { toggle() {} }, setAttribute() {} });
  const sandbox = {
    crypto: webcrypto, TextEncoder, atob, btoa, console, setTimeout,
    navigator: { clipboard: { writeText: async () => {} } },
    document: {
      getElementById: (id) => (els.has(id) || els.set(id, el()), els.get(id)),
      addEventListener: () => {}, createElement: () => ({ style: {}, select() {}, click() {} }),
      body: { appendChild() {}, removeChild() {} }, execCommand: () => true,
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(`${script}\n;globalThis.__page = { sshsig, keysFromSeed, pubLine, generateAll, KEYS };`, sandbox);
  return { ...sandbox.__page, el: (id) => sandbox.document.getElementById(id) };
}

test("R25 the served page's signatures are accepted by verifySshsig, and bound to their namespace and bytes", async () => {
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

test("R25 the served page's signatures are accepted by stock ssh-keygen -Y verify", { skip: NO_SSH_KEYGEN }, async () => {
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

/* ===================================================================== R26 */

test("R26 pure and offline: no service fetches or reads a clock, and the endpoints are not the caller's", () => {
  /* Run every service in a child process whose fetch, clocks and timers throw
     and record, so nothing of the test runner's own can trip the traps. */
  const src = new URL("../../../src/", import.meta.url).href;
  const child = `
    const calls = [];
    const trap = (name) => function () { calls.push(name); throw new Error(name + " called"); };
    globalThis.fetch = trap("fetch");
    globalThis.XMLHttpRequest = trap("XMLHttpRequest");
    globalThis.WebSocket = trap("WebSocket");
    globalThis.setTimeout = trap("setTimeout");
    globalThis.setInterval = trap("setInterval");
    performance.now = trap("performance.now");
    const RealDate = Date;
    globalThis.Date = new Proxy(RealDate, {
      construct() { calls.push("new Date"); throw new Error("new Date"); },
      apply() { calls.push("Date()"); throw new Error("Date()"); },
      get(t, k) { if (k === "now") return trap("Date.now"); return Reflect.get(t, k); },
    });
    const s = await import(${JSON.stringify(src + "sshsig.mjs")});
    const t = await import(${JSON.stringify(src + "tsa.mjs")});
    await import(${JSON.stringify(src + "signpage.mjs")});
    const out = {};
    out.verify = await s.verifySshsig(${JSON.stringify(PINNED.sig)}, new TextEncoder().encode(${JSON.stringify(PINNED.msg)}),
      "bio-release", [${JSON.stringify(PINNED.pub)}]);
    out.bad = await s.verifySshsig("x", new Uint8Array(1), "bio-release", []);
    s.ratifyStatement("a", "b"); s.caseRatifyStatement("a", 1, "b");
    s.fleetStatement({ version: "v", plane: { sha256: "p", bytes: 1, asset: "a" },
      members: [{ member: "m", sha256: "s", bytes: 1, asset: "a", compat: { date: "d", flags: [] }, services: [], parts: [] }] });
    const req = t.timestampRequest("${DIGEST}", new Uint8Array(8).fill(3));
    t.timestampRequest("${DIGEST}");
    out.parse = t.parseTimestampResponse(req.der, "${DIGEST}");
    out.loc = t.archiveLocatorFrom({ headers: new Headers({ location: "/web/1/x" }), url: "" });
    console.log(JSON.stringify({ calls, out }));
  `;
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", child], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const { calls, out } = JSON.parse(r.stdout);
  assert.deepEqual(calls, []);
  assert.equal(out.verify.ok, true);
  assert.equal(out.bad.reason, "MALFORMED");
  assert.equal(out.parse.ok, false);
  assert.equal(out.loc, "https://web.archive.org/web/1/x");
  /* The endpoints a caller is handed are constants no argument reaches (R20, R22). */
  assert.equal(timestampRequest.length, 2);
  assert.ok(Object.isFrozen(TSA_ENDPOINTS));
  assert.throws(() => { tsa.ARCHIVE_SAVE_BASE = "https://attacker.example/"; });
});

/* ===================================================================== R27 */

test("R27 no place is named in any string the module exports", () => {
  const PLACE = /\b(oakland|alameda|berkeley|california|county|city of|state of)\b/i;
  const strings = [];
  for (const mod of [sshsig, tsa, signpage]) {
    for (const v of Object.values(mod)) {
      if (typeof v === "string") strings.push(v);
      if (Array.isArray(v)) strings.push(...v.filter((x) => typeof x === "string"));
    }
  }
  strings.push(td.decode(ratifyStatement("a", "b")), td.decode(caseRatifyStatement("a", 1, "b")),
    fleetStatement({ version: "v", plane: PLANE, members: [] }));
  assert.ok(strings.includes(SIGN_HTML));
  for (const s of strings) assert.doesNotMatch(s, PLACE);
});

/* ===================================================================== R28 */

test("R28 a signature never verifies for another namespace or message; every tampered signature is BAD_SIGNATURE", async () => {
  const messages = [enc("m1\n"), ratifyStatement("B", "0".repeat(64)), caseRatifyStatement("B", 1, "0".repeat(64)),
    enc(fleetStatement({ version: "v", plane: PLANE, members: [member("m")] }))];
  for (const [i, m] of messages.entries()) {
    const sig = await sign(KEY, NS_RATIFY, m);
    for (const [j, other] of messages.entries()) {
      const r = await verifyAndLog(sig, other, NS_RATIFY, [KEY.line]);
      assert.equal(r.ok, i === j);
      if (i !== j) assert.equal(r.reason, "BAD_SIGNATURE");
    }
    for (const ns of [NS_RELEASE, NS_FLEET, "", "bio-ratify ", "BIO-RATIFY"]) {
      assert.equal((await verifyAndLog(sig, m, ns, [KEY.line])).reason, "NAMESPACE");
    }
    /* Every single-bit change to the message is refused. */
    for (let bit = 0; bit < m.length * 8; bit += 3) {
      const t = m.slice(); t[bit >> 3] ^= 1 << (bit & 7);
      assert.equal((await verifyAndLog(sig, t, NS_RATIFY, [KEY.line])).reason, "BAD_SIGNATURE");
    }
  }
  /* Every single-bit change to the signature is refused as BAD_SIGNATURE. */
  const m = enc("tamper the signature\n");
  const sig = await sign(KEY, NS_RELEASE, m);
  for (let bit = 0; bit < 512; bit++) {
    assert.equal((await verifyAndLog(flipSignatureBit(sig, bit), m, NS_RELEASE, [KEY.line])).reason, "BAD_SIGNATURE", `bit ${bit}`);
  }
  /* A key substituted into someone else's signature does not carry it. */
  const swapped = await sign(OTHER, NS_RELEASE, m, { sig: dearmor(sig).slice(-64) });
  assert.equal((await verifyAndLog(swapped, m, NS_RELEASE, [KEY.line, OTHER.line])).reason, "BAD_SIGNATURE");
});

/* ===================================================================== R29 */

test("R29 every no this module returned in these tests names which kind of no", () => {
  assert.ok(NOES.sshsig.length > 100);
  assert.ok(NOES.tsa.length > 50);
  for (const r of NOES.sshsig) {
    assert.equal(r.ok, false);
    assert.ok(REASONS_SSHSIG.includes(r.reason), JSON.stringify(r));
    if (r.reason === "NAMESPACE") assert.ok("expected" in r && "got" in r);
    if (r.reason === "UNKNOWN_KEY" || r.reason === "BAD_SIGNATURE") assert.equal(typeof r.keyB64, "string");
  }
  for (const r of NOES.tsa) {
    assert.equal(r.ok, false);
    assert.ok(REASONS_TSA.includes(r.reason), JSON.stringify(r));
    if (r.reason !== "MALFORMED") assert.equal(typeof r.status, "number");
  }
  for (const reason of REASONS_SSHSIG) assert.ok(NOES.sshsig.some((r) => r.reason === reason), reason);
  for (const reason of REASONS_TSA) assert.ok(NOES.tsa.some((r) => r.reason === reason), reason);
  /* archiveLocatorFrom's null is its whole answer, documented as such (R23). */
  assert.equal(archiveLocatorFrom(answer({}, "")), null);
});
