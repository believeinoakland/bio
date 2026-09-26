/* promotion's release-signature check, C-18.8 (build/requirements/promotion.md R31), as `runGate` runs it. Keys are
 * made with WebCrypto and signatures by a small SSHSIG signer written here from PROTOCOL.sshsig, so every verdict is
 * checked against bytes this suite made, and against the catalogue's own C-18.8 on the same bundle. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { webcrypto, createHash } from "node:crypto";
import { runGate } from "../../../src/promotion/index.mjs";
import { releaseMessage, checkBundle } from "../../../checks/bio-checks.mjs";

const ID = "INFO-2026-0001-report";
const T_REL = "2026-08-01T10:00:00Z";
const enc = (s) => new TextEncoder().encode(s);
const latin1 = (s) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);
const u8 = (...p) => { const o = new Uint8Array(p.reduce((n, x) => n + x.length, 0)); let i = 0; for (const x of p) { o.set(x, i); i += x.length; } return o; };
const u32 = (n) => new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
const sstr = (v) => { const b = typeof v === "string" ? enc(v) : v; return u8(u32(b.length), b); };
const b64 = (b) => Buffer.from(b).toString("base64");
const armor = (blob) => `-----BEGIN SSH SIGNATURE-----\n${b64(blob).replace(/(.{70})/g, "$1\n")}\n-----END SSH SIGNATURE-----\n`;
const sha = (s) => createHash("sha256").update(s).digest("hex");

async function newKey() {
  const kp = await webcrypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
  const raw = new Uint8Array(await webcrypto.subtle.exportKey("raw", kp.publicKey));
  const wire = u8(sstr("ssh-ed25519"), sstr(raw));
  return { priv: kp.privateKey, raw, line: `ssh-ed25519 ${b64(wire)}` };
}
async function sign(key, namespace, message, hashAlg = "sha512") {
  const h = new Uint8Array(await webcrypto.subtle.digest(hashAlg === "sha256" ? "SHA-256" : "SHA-512", message));
  const signed = u8(enc("SSHSIG"), sstr(namespace), sstr(new Uint8Array(0)), sstr(hashAlg), sstr(h));
  const sig = new Uint8Array(await webcrypto.subtle.sign("Ed25519", key.priv, signed));
  return armor(u8(enc("SSHSIG"), u32(1), sstr(u8(sstr("ssh-ed25519"), sstr(key.raw))), sstr(namespace),
    sstr(new Uint8Array(0)), sstr(hashAlg), sstr(u8(sstr("ssh-ed25519"), sstr(sig)))));
}

const ANN = await newKey(), OTHER = await newKey(), ROOT = await newKey();
const md = (schema = "information@2", author = "member:ann") => ["---", `id: ${ID}`, "object_type: information", `schema: ${schema}`,
  'title: "A report"', "current_state: verified", "prior_state: collected", 'created: "2026-07-01T00:00:00Z"',
  `last_updated: "${T_REL}"`, "state_history:", `  - timestamp: "${T_REL}"`, "    from_state: collected",
  "    to_state: verified", '    blurb: "released"', `    author: ${author}`, "---", ""].join("\n");

async function registry({ signers = `member:ann ${ANN.line}`, rootSigned = true, enforce = "2026-01-01T00:00:00Z", migration = "2026-07-15T00:00:00Z" } = {}) {
  const reg = { migrationInstant: migration, signers, namespace: "bio-release", sha256: sha(signers), rootKeys: [ROOT.line],
                rootEnforceFrom: enforce };
  if (rootSigned) reg.rootSignature = await sign(ROOT, "bio-registry", latin1(signers));
  return reg;
}
async function bundle({ reg, schema, author = "member:ann", key = ANN, signer = "member:ann", ns = "bio-release",
                        record = true, sigFile = true, tamper = false } = {}) {
  const text = md(schema, author);
  const msg = latin1(releaseMessage({ bundle: ID, transition: T_REL, from_state: "collected", to_state: "verified",
    signer, bundle_md_sha256: sha(text), registry_sha256: reg ? reg.sha256 : null }));
  const sig = await sign(key, ns, tamper ? u8(msg, enc("x")) : msg);
  const image = { "bundle.md": text };
  if (record) image["data/provenance.json"] = JSON.stringify({ releases: [{ transition: T_REL, signer, namespace: ns,
    signature_file: "data/release.sig", registry_sha256: reg ? reg.sha256 : null }] });
  if (sigFile) image["data/release.sig"] = sig;
  return image;
}
const gate = (image, releaseRegistry) => runGate({ bundleId: ID, image, knownIds: new Set([ID]), hasCapture: async () => ({ present: true }),
  registers: [], releaseRegistry });
const c188 = async (image, reg) => (await gate(image, reg)).findings.filter((f) => f.check === "C-18.8").map((f) => f.detail);
/* The catalogue's own C-18.8 errors on the same bundle and registry. */
async function catalogue(image, reg) {
  const files = new Map(Object.entries(image));
  const { findings } = await checkBundle({ folderName: ID, files, elidedPaths: new Set(),
    sha256: async (v) => sha(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)),
    sha512: async (b) => new Uint8Array(createHash("sha512").update(b).digest()), resolveTarget: () => true,
    releaseRegistry: reg });
  return findings.filter((f) => f.check === "C-18.8" && f.severity === "error").map((f) => f.message);
}

test("R31: a post-migration release at information@2 verifies through signatures.verifySshsig against the key the registry holds for its signer", async () => {
  const reg = await registry();
  assert.deepEqual(await c188(await bundle({ reg }), reg), []);
  /* sha256-hashed SSHSIG is verifySshsig's rule too. */
  const text = md();
  const msg = latin1(releaseMessage({ bundle: ID, transition: T_REL, from_state: "collected", to_state: "verified",
    signer: "member:ann", bundle_md_sha256: sha(text), registry_sha256: reg.sha256 }));
  const img = await bundle({ reg });
  img["data/release.sig"] = await sign(ANN, "bio-release", msg, "sha256");
  assert.deepEqual(await c188(img, reg), []);
  /* No registry: nothing is post-migration, and nothing is asked. */
  assert.deepEqual(await c188(await bundle({}), null), []);
});

test("R31: it fails closed — every way a release can fail is an error naming it, and agrees with the catalogue's verdict", async () => {
  const reg = await registry();
  const cases = [
    ["no signed release record", await bundle({ reg, record: false })],
    ["does not equal transition author", await bundle({ reg, signer: "member:bob" })],
    ["a surface or AI identity", await bundle({ reg, author: "token:ai", signer: "token:ai" })],
    ["is not the registry namespace", await bundle({ reg, ns: "bio-ratify" })],
    ["holds no bytes at the gate", await bundle({ reg, sigFile: false })],
    ["does not verify (bad_signature)", await bundle({ reg, tamper: true })],
    ["does not verify (key_not_registered_for_principal)", await bundle({ reg, key: OTHER })],
  ];
  for (const [want, image] of cases) {
    const got = await c188(image, reg);
    assert.equal(got.length, 1, want);
    assert.match(got[0], new RegExp(want.replace(/[()]/g, "\\$&")), want);
    assert.equal((await catalogue(image, reg)).length, 1, `the catalogue also refuses: ${want}`);
  }
  /* A key outside its validity window names no key for the principal at that instant. */
  const windowed = await registry({ signers: `member:ann valid-before="20260701" ${ANN.line}` });
  assert.match((await c188(await bundle({ reg: windowed }), windowed))[0], /no_valid_key_for_principal/);
  /* A registry that does not prove itself resolves no principal. */
  const unsigned = await registry({ rootSigned: false });
  assert.match((await c188(await bundle({ reg: unsigned }), unsigned))[0], /does not prove itself \(root_signature_missing\)/);
  const forged = { ...reg, rootSignature: await sign(OTHER, "bio-registry", latin1(reg.signers)) };
  assert.match((await c188(await bundle({ reg: forged }), forged))[0], /root_signature_invalid:key_not_registered_for_principal/);
  /* Below information@2 a post-migration release is an error; an unreadable registry is an error at every schema. */
  assert.match((await c188(await bundle({ reg, schema: "information@1" }), reg))[0], /cannot carry a signature/);
  for (const schema of ["information@1", "information@2"])
    assert.match((await c188(await bundle({ schema }), { unavailable: true, reason: "down" }))[0], /unreadable at this call site \(down\)/);
  /* Releases before the migration instant are not asked. */
  const later = await registry({ migration: "2026-09-01T00:00:00Z" });
  assert.deepEqual(await c188(await bundle({ reg: later, tamper: true }), later), []);
});

test("R31: the gate judges a release once: the catalogue's C-18.8 findings are replaced by this module's, never doubled", async () => {
  const reg = await registry();
  const r = await gate(await bundle({ reg, tamper: true }), reg);
  assert.equal(r.findings.filter((f) => f.check === "C-18.8").length, 1);
  assert.equal(r.ok, false);
});
