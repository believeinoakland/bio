/* control-plane: a lease's `actor` stamped from the credential (D-61; R38, N398, K573, K607). Converted from the old
   battery's `test/unattended-lease.test.mjs`, Part A's control-plane half: a session starts an intake, a machine credential
   (the daemon, under a binding) takes the lease and completes it, and both acts are NAMED — the session by its member,
   the machine as `token:<class>`, never the caller-claimed `IMPOSTOR`.

   Carried: "the lease names the machine, not the caller-claimed actor" (here for every class that reaches op=lease, the
   `ai` credential included); "the completion NAMES the machine writer — not the caller-claimed author" (the promotion's
   `author`, R17, on the same fixture); "the start is attributed to the member's session". Not carried, each another
   module's and covered there: "a machine credential CAN take the lease", the lease as a courtesy lock ("a session is
   refused while the machine holds the lease", `heldBy`) and Part B's ANONYMOUS_LEASE are record-core R10; "a stale-base
   completion is refused by the CAS" and the manifest entries are promotion's; the member's enrolment is membership's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, call, opCalls, sha, aik, cred, refused } from "./harness.mjs";

const IMPOSTOR = "IMPOSTOR";
const id = "INFO-2026-0001-walked";
const md = `---\nid: ${id}\nobject_type: information\ntitle: "Walked-away capture"\ncurrent_state: collected\n---\n\n## Summary\n\nintake begun, evidence captured and hashed\n`;

function callers() {
  const agent = aik();
  const w = world({ creds: { [agent]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: ["lease", "promote"] }) } });
  return { w, list: [
    ["ann's member session", w.S.ann, {}, "ann"], ["the founder's session", w.S.founder, {}, "admin"],
    ["the admin binding", w.env.ADMIN_TOKEN, {}, "token:admin"], ["the member binding (the daemon)", w.env.MEMBER_TOKEN, {}, "token:member"],
    ["the probe binding", w.env.PROBE_TOKEN, { store: "scratch" }, "token:probe"], ["an agent credential", agent, {}, "token:ai"],
  ] };
}

test("R38 (D-61, N398): op=lease's `actor` is the server's — a session's member, any other caller `token:<class>` — and never the caller's, in the query or not sent at all", async () => {
  const { w, list } = callers();
  for (const [name, token, params, want] of list) {
    for (const sent of [{}, { actor: IMPOSTOR }, { actor: "" }, { actor: "ann" }]) {
      w.env.calls.length = 0;
      const r = await call(w.env, { op: "lease", token, params: { ...params, id, ...sent } });
      assert.equal(r.status, 200, `${name}: ${r.text.slice(0, 200)}`);
      const [inner] = opCalls(w.env);
      assert.deepEqual([inner.route, inner.params.id, inner.params.actor], ["lease", id, want], `${name} sending ${JSON.stringify(sent)}`);
    }
  }
  /* negative control: the daemon binding reaches no lease at all (its two verbs are the whole of it) */
  w.env.calls.length = 0;
  refused(await call(w.env, { op: "lease", token: w.env.DAEMON_TOKEN, params: { id, actor: IMPOSTOR } }), 403, "CLASS_FORBIDDEN", "C-38.2");
  assert.equal(opCalls(w.env).length, 0);
});

test("R38, R17 (D-61): the walked-away capture — the session's start is attributed to its member, and the machine's completion names the machine as `token:<class>`, never the author the caller claimed", async () => {
  const { w, list } = callers();
  const body = (base) => ({ bundleId: id, base, snapKey: base ? "20260731T010000Z_finish01" : "20260731T000000Z_start001",
    meta: { object_type: "information", title: "Walked-away capture", current_state: "collected" },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [], author: IMPOSTOR });
  for (const [name, token, params, want] of list) {
    w.env.calls.length = 0;
    await call(w.env, { op: "promote", token, params: { ...params, author: IMPOSTOR }, method: "POST", body: body(name.includes("session") ? null : "rev0") });
    const p = opCalls(w.env).find((c) => c.route === "promote");
    assert.equal(p.body.author, want, name);
    assert.equal(p.params.author ?? null, null, `${name}: no query author reaches promote`);
  }
});
