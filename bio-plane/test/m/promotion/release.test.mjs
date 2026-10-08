/* promotion's release-signature check, C-18.8 (build/requirements/promotion.md R31), as `runGate` runs it. Keys are
 * made with WebCrypto and signatures by a small SSHSIG signer written here from PROTOCOL.sshsig, so every verdict is
 * checked against bytes this suite made. The catalogue no longer holds a copy (K64). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { webcrypto, createHash } from "node:crypto";
import { runGate, recordChecks } from "../../../src/promotion/index.mjs";
import { checkBundle } from "../../../src/record-grammar/index.mjs";
import { releaseMessage } from "../../../src/promotion/release.mjs";

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
const md = (schema = "information@2", author = "member:ann", { title = "A report", updated = T_REL, body = "" } = {}) => ["---",
  `id: ${ID}`, "object_type: information", `schema: ${schema}`,
  `title: "${title}"`, "current_state: verified", "prior_state: collected", 'created: "2026-07-01T00:00:00Z"',
  `last_updated: "${updated}"`, "state_history:", `  - timestamp: "${T_REL}"`, "    from_state: collected",
  "    to_state: verified", '    blurb: "released"', `    author: ${author}`, "---", "", body].join("\n");
/* The bundle as collected, before its release. */
const collected = (schema = "information@2") => ["---", `id: ${ID}`, "object_type: information", `schema: ${schema}`,
  'title: "A report"', "current_state: collected", "prior_state: null", 'created: "2026-07-01T00:00:00Z"',
  'last_updated: "2026-07-01T00:00:00Z"', "state_history: []", "---", ""].join("\n");
/* The record's history as record-core serves it (its R15, R16): a pre-image `_history/bundle_<key>.md` per revision and
   `_history/manifest.json`, its entries listed by key with `seq` their write order. `texts` are bundle.md as each
   promotion left it, in write order; `keys` their snap keys. The last is live. */
function withHistory(texts, keys = texts.map((_, i) => `k${i + 1}`)) {
  const img = { "bundle.md": texts[texts.length - 1] };
  const entries = keys.map((key, i) => ({ key, seq: i + 1, kind: "promotion", files: ["bundle.md"],
    base: i === 0 ? sha("") : sha(texts[i - 1]) }));
  for (let i = 1; i < texts.length; i++) img[`_history/bundle_${keys[i]}.md`] = texts[i - 1];
  img["_history/manifest.json"] = JSON.stringify({ entries: [...entries].sort((a, b) => (a.key < b.key ? -1 : 1)) });
  return img;
}

async function registry({ signers = `member:ann ${ANN.line}`, rootSigned = true, enforce = "2026-01-01T00:00:00Z", migration = "2026-07-15T00:00:00Z" } = {}) {
  const reg = { migrationInstant: migration, signers, namespace: "bio-release", sha256: sha(signers), rootKeys: [ROOT.line],
                rootEnforceFrom: enforce };
  if (rootSigned) reg.rootSignature = await sign(ROOT, "bio-registry", latin1(signers));
  return reg;
}
/* A released bundle: created collected, then released by a second promotion (and, with `later`, revised after), its
   signature over the bundle.md the release left (`signed` overrides what is signed). */
async function bundle({ reg, schema, author = "member:ann", key = ANN, signer = "member:ann", ns = "bio-release",
                        record = true, sigFile = true, tamper = false, later = [], keys, signed, text = md(schema, author) } = {}) {
  const msg = latin1(releaseMessage({ bundle: ID, transition: T_REL, from_state: "collected", to_state: "verified",
    signer, bundle_md_sha256: sha(signed ?? text), registry_sha256: reg ? reg.sha256 : null }));
  const sig = await sign(key, ns, tamper ? u8(msg, enc("x")) : msg);
  const image = withHistory([collected(schema), text, ...later], keys);
  if (record) image["data/provenance.json"] = JSON.stringify({ releases: [{ transition: T_REL, signer, namespace: ns,
    signature_file: "data/release.sig", registry_sha256: reg ? reg.sha256 : null }] });
  if (sigFile) image["data/release.sig"] = sig;
  return image;
}
const gate = (image, releaseRegistry) => runGate({ bundleId: ID, image, knownIds: new Set([ID]), hasCapture: async () => ({ present: true }),
  registers: [], releaseRegistry });
const c188 = async (image, reg) => (await gate(image, reg)).findings.filter((f) => f.check === "C-18.8").map((f) => f.detail);
/* What the catalogue says about C-18.8 on the same bundle: nothing, since it left for this module (K64). */
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

test("R31: it fails closed — every way a release can fail is an error naming it", async () => {
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

test("R31: the module holds the one C-18.8: the catalogue no longer asks it, and the gate asks it once", async () => {
  const reg = await registry();
  assert.deepEqual(await catalogue(await bundle({ reg, tamper: true }), reg), []);
  const r = await gate(await bundle({ reg, tamper: true }), reg);
  assert.equal(r.findings.filter((f) => f.check === "C-18.8").length, 1);
  assert.equal(r.ok, false);
});

test("R31: the signature is checked over the released bytes, the bundle.md the releasing promotion left, never a later revision's live one", async () => {
  const reg = await registry();
  const released = md();
  const edit1 = md(undefined, undefined, { updated: "2026-08-05T00:00:00Z", body: "## Summary\n\nrevised" });
  const edit2 = md(undefined, undefined, { updated: "2026-08-09T00:00:00Z", title: "A report, retitled" });
  /* Two revisions after the release: the released bytes are the copy the first of them took into history. */
  assert.deepEqual(await c188(await bundle({ reg, text: released, later: [edit1, edit2] }), reg), []);
  /* A signature over the live (later) bytes is not one over what was released. */
  const overLive = await c188(await bundle({ reg, text: released, later: [edit1], signed: edit1 }), reg);
  assert.equal(overLive.length, 1);
  assert.match(overLive[0], /does not verify \(bad_signature\)/);
  /* Write order (seq), never key order: keys whose lexical order runs backwards find the same released bytes. */
  assert.deepEqual(await c188(await bundle({ reg, text: released, later: [edit1, edit2], keys: ["z1", "m2", "a3"] }), reg), []);
});

test("R31: the released bytes are read as bytes, never decoded as latin1 or any text (N808)", async () => {
  const reg = await registry();
  /* Characters outside Latin-1 in bundle.md: its digest is of its stored UTF-8 bytes. */
  const wide = md(undefined, undefined, { title: "Āpple — 東京 😀" });
  assert.deepEqual(await c188(await bundle({ reg, text: wide }), reg), []);
  /* The same, handed to the moved checks as bytes (the audit's form): the same verdict, the bytes hashed as given. */
  const img = await bundle({ reg, text: wide });
  const files = new Map(Object.entries(img).map(([k, v]) => [k, k.endsWith(".md") ? enc(v) : v]));
  const got = await recordChecks({ folderName: ID, files, releaseRegistry: reg,
    sha256: async (v) => sha(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)) });
  assert.deepEqual(got.filter((f) => f.check === "C-18.8"), []);
  /* A signature over the latin1-masked bytes of that document is not one over the bytes released. */
  const masked = await bundle({ reg, text: wide });
  const msg = latin1(releaseMessage({ bundle: ID, transition: T_REL, from_state: "collected", to_state: "verified",
    signer: "member:ann", bundle_md_sha256: sha(latin1(wide)), registry_sha256: reg.sha256 }));
  masked["data/release.sig"] = await sign(ANN, "bio-release", msg);
  assert.match((await c188(masked, reg))[0], /bad_signature/);
});

test("R31: when what was signed cannot be read, the release is an error saying so, never a pass", async () => {
  const reg = await registry();
  const want = /what was signed cannot be read/;
  /* No history manifest. */
  const bare = await bundle({ reg });
  delete bare["_history/manifest.json"];
  assert.match((await c188(bare, reg))[0], want);
  /* The releasing promotion's bundle.md held only as a blob (elided at the gate, never fetched). */
  const blob = await bundle({ reg, later: [md(undefined, undefined, { updated: "2026-08-05T00:00:00Z" })] });
  blob["_history/bundle_k3.md"] = { blobSha: "ab".repeat(32), sha256: "ab".repeat(32), bytes: 10 };
  const got = await c188(blob, reg);
  assert.equal(got.length, 1);
  assert.match(got[0], want);
  /* An earlier version that cannot be read: whether it is the first to hold the release is unknown. */
  const early = await bundle({ reg });
  delete early["_history/bundle_k2.md"];
  assert.match((await c188(early, reg))[0], want);
  /* A manifest recording no promotion: none recorded the release. */
  const none = await bundle({ reg });
  none["_history/manifest.json"] = JSON.stringify({ entries: [] });
  assert.match((await c188(none, reg))[0], want);
  /* A creation that is itself the release (one entry, the head, holding it): found in live, and verified. */
  const once = await bundle({ reg });
  once["_history/manifest.json"] = JSON.stringify({ entries: [{ key: "k1", seq: 1, kind: "promotion", files: ["bundle.md"] }] });
  delete once["_history/bundle_k2.md"];
  assert.deepEqual(await c188(once, reg), []);
});

test("R31: a character the signer's one-byte encoding cannot carry is never masked: the release, or the registry root, fails closed", async () => {
  /* A signer outside Latin-1 (a registry whose root is not enforced, so the message is reached): its message cannot be
     encoded as signed, so the release is an error, even with a signature over the masked bytes (U+0101 → 0x01). */
  const wideSigner = "member:ānn";
  const reg = await registry({ signers: `${wideSigner} ${ANN.line}`, rootSigned: false, enforce: null });
  const got = await c188(await bundle({ reg, author: wideSigner, signer: wideSigner }), reg);
  assert.equal(got.length, 1);
  assert.match(got[0], /cannot carry/);
  /* A signer inside Latin-1 but outside ASCII (U+00E5) verifies as before: its message is one byte per code unit. */
  const latinSigner = "member:ånn";
  const latinReg = await registry({ signers: `${latinSigner} ${ANN.line}` });
  assert.deepEqual(await c188(await bundle({ reg: latinReg, author: latinSigner, signer: latinSigner }), latinReg), []);
  /* A registry text outside Latin-1 cannot prove itself under an enforced root: its root signature never verifies. */
  const wideReg = await registry({ signers: `member:ann ${ANN.line}\n# ā` });
  const forgedRoot = { ...wideReg, rootSignature: await sign(ROOT, "bio-registry", latin1(wideReg.signers)) };
  assert.match((await c188(await bundle({ reg: forgedRoot }), forgedRoot))[0], /root_signature_invalid:not_latin1/);
});
