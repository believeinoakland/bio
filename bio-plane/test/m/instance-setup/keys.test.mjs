/* R44 (N397, K573; D-605): the members and keys section's key form splits a pasted public-key line into the `keyB64`
   and `comment` membership R25 takes. Driven at the page's interface: the served page's script in the fixture's
   sandbox, its key form filled and its register button clicked, and the body it sends handed to the REAL credentials
   module's `signerAdd` (credentials R6, was membership R25; K789), over the REAL membership roster it reads, whose key
   list is read back. The keys are real ed25519
   public keys in the OpenSSH line format the signing page emits. Carries `bio-plane/test/setup-signeradd.test.mjs`
   (K0–K7) at the module's interface; that suite's source-text arm (K0's pinned call) is driven here instead. */
import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { setupPage } from "../../../src/setup.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { pageOver, storage } from "./fixture.mjs";

const tick = () => new Promise((r) => setTimeout(r, 0));
const settle = async () => { for (let i = 0; i < 20; i++) await tick(); };

/* A real ed25519 public key as an OpenSSH line: base64(string "ssh-ed25519" + string key32), then the label. */
const sshLine = (label) => {
  const { publicKey } = generateKeyPairSync("ed25519");
  const raw = Buffer.from(publicKey.export({ format: "jwk" }).x, "base64url");
  const str = (b) => { const n = Buffer.alloc(4); n.writeUInt32BE(b.length); return Buffer.concat([n, b]); };
  const b64 = Buffer.concat([str(Buffer.from("ssh-ed25519")), str(raw)]).toString("base64");
  return { b64, line: label ? `ssh-ed25519 ${b64} ${label}` : `ssh-ed25519 ${b64}` };
};

/* The real membership and credentials modules on one storage, as the plane composes them (K789): credentials
   registers its claim fact, password setter and revocation listener with membership at its start (credentials
   R16, R17, R20). The founder claims (credentials R1), a second administrator and ruth enrol (membership R12, R16).
   `by` is the founder's stamp, as the control plane stamps an administrator's session. Answers the credentials
   module, whose keys the page registers and lists. */
async function roster() {
  const record = { bundleInfo: () => null, declarePurge() { return { ok: true }; } };
  const ctx = { storage: storage() };
  const m = membershipOf(ctx, { record });
  m.migrate();
  const c = credentialsOf(ctx, { record, membership: m });
  c.migrate();
  assert.equal((await c.claim({ password: "founder-passphrase-1", tokenFp: "fp-1" })).ok, true);
  for (const [id, role] of [["second", "admin"], ["ruth", "member"]]) {
    const a = await m.memberAdd({ memberId: id, cover: `cover of ${id}`, role, by: "admin" });
    assert.equal(a.ok, true, JSON.stringify(a));
    const e = await m.enroll({ invite: a.invite, handle: id, password: `${id}-passphrase-x` });
    assert.equal(e.ok, true, JSON.stringify(e));
  }
  return c;
}

/* The page as served, signed in as an administrator, its key ops answered by the real credentials module; `sent`
   records each body the key form posted to op=signeradd. */
async function adminPage(m) {
  const sent = [];
  const fetch = async (url, init) => {
    const u = new URL(url, "https://copy.example");
    const op = u.searchParams.get("op");
    const body = init && init.body ? JSON.parse(init.body) : null;
    let out = { result: { ok: true } };
    if (op === "bootstrap") out = { claimed: true, version: "v1" };
    else if (op === "whoami") out = { result: { capabilities: ["contribute"], administer: true } };
    else if (op === "signeradd") { sent.push(body); out = { result: m.signerAdd({ ...body, by: "admin" }) }; }
    else if (op === "signerlist") out = { result: m.signerList() };
    else if (op === "memberlist") out = { result: { members: [] } };
    return { ok: true, status: 200, json: async () => out };
  };
  const p = pageOver({ html: setupPage({ answered: true, result: { ok: true, group: "river-town" } }),
                       session: { t: "sess-1", e: 0, w: "admin" }, fetch });
  await settle();
  const register = async (line, who) => {
    p.el("#k-key").value = line; p.el("#k-who").value = who;
    const before = sent.length;
    await p.el("#k-add").fire(); await settle();
    return { body: sent.length > before ? sent[sent.length - 1] : null, err: p.el("#k-err").textContent };
  };
  return { ...p, sent, register };
}

const rowOf = (m, b64) => {
  const r = m.signerList().signers.find((x) => x.key_b64 === b64);
  return r ? { member: r.member_id, comment: r.comment ?? null, status: r.status } : null;
};

test("R44 a whole public-key line pasted into the key form registers the key: the form sends the line's second token as keyB64 and its label as comment, and the roster reads it active under the member with its label", async () => {
  const m = await roster();
  const A = sshLine("bio-ratify");
  assert.equal(A.b64.length, 68);
  assert.match(A.b64, /^AAAA[A-Za-z0-9+/=]+$/);
  /* the premise: credentials R6 (was membership R25) refuses the whole line, which is what the page sent before D-605 */
  const whole = m.signerAdd({ keyB64: A.line, memberId: "ruth", by: "admin" });
  assert.deepEqual([whole.ok, whole.reason, rowOf(m, A.line), rowOf(m, A.b64)], [false, "BAD_KEY", null, null]);
  const p = await adminPage(m);
  const { body, err } = await p.register(A.line, "ruth");
  assert.deepEqual(body, { keyB64: A.b64, memberId: "ruth", comment: "bio-ratify" });
  assert.equal(err, "");
  assert.deepEqual(rowOf(m, A.b64), { member: "ruth", comment: "bio-ratify", status: "active" });
  /* the button sends exactly the body the page's own builder makes (the old suite's K0, driven rather than read) */
  assert.deepEqual(p.ui.signerAddBody(A.line, "ruth"), body);
});

test("R44 a line pasted with tabs, runs of spaces, a trailing newline and a many-word label, for a member named with spaces and capitals, registers too, the label's words kept joined by single spaces", async () => {
  const m = await roster();
  const p = await adminPage(m);
  const B = sshLine(null);
  const { body } = await p.register(`  ssh-ed25519\t${B.b64}\t ruth's  laptop   bio-ratify \n`, "  Ruth ");
  assert.deepEqual(body, { keyB64: B.b64, memberId: "ruth", comment: "ruth's laptop bio-ratify" });
  assert.deepEqual(rowOf(m, B.b64), { member: "ruth", comment: "ruth's laptop bio-ratify", status: "active" });
});

test("R44 a line with no label registers with no comment sent and none stored", async () => {
  const m = await roster();
  const p = await adminPage(m);
  const C = sshLine(null);
  const { body } = await p.register(C.line, "ruth");
  assert.deepEqual(body, { keyB64: C.b64, memberId: "ruth" });
  assert.equal("comment" in body, false);
  assert.deepEqual(rowOf(m, C.b64), { member: "ruth", comment: null, status: "active" });
});

test("R44 text that is not a key line is sent trimmed, as pasted, and the plane refuses it BAD_KEY; the roster holds exactly the keys registered from lines, never a whole line", async () => {
  const m = await roster();
  const p = await adminPage(m);
  const body = p.ui.signerAddBody("  not a key at all ", "ruth");
  assert.deepEqual(body, { keyB64: "not a key at all", memberId: "ruth" });
  assert.equal(m.signerAdd({ ...body, by: "admin" }).reason, "BAD_KEY");
  /* a first token other than ssh-ed25519 is not a line either: sent as pasted, refused by the plane */
  const rsa = p.ui.signerAddBody("ssh-rsa AAAAB3Nza label", "ruth");
  assert.deepEqual(rsa, { keyB64: "ssh-rsa AAAAB3Nza label", memberId: "ruth" });
  assert.equal(m.signerAdd({ ...rsa, by: "admin" }).reason, "BAD_KEY");
  /* a lone token is sent as pasted: the key R25 accepts registers, so a bare base64 field needs no line */
  const D = sshLine(null);
  assert.deepEqual(p.ui.signerAddBody(` ${D.b64} `, "ruth"), { keyB64: D.b64, memberId: "ruth" });
  const lines = [sshLine("one"), sshLine("two words")];
  for (const k of lines) await p.register(k.line, "ruth");
  assert.deepEqual(m.signerList().signers.map((r) => r.key_b64).sort(), lines.map((k) => k.b64).sort());
});
