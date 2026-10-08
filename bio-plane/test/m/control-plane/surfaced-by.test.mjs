/* control-plane: `surfaced_by` stamped at op=promote from the credential (D-78; R37, N398, K573, K607). Converted from
   the old battery's `test/surfaced-by.test.mjs`, over its own fixture: a focus `bundle.md` exactly as both bundle writers
   produce it, carrying the hardcoded literal `surfaced_by: human` whoever writes it. Driven through `makeFetch(hooks)`; what
   is checked is the body the store's `promote` route receives, which is what the store keeps byte for byte.

   Carried from the old suite: "a focus a member surfaced records surfaced_by: human" (here: every session, the founder's
   included); "a focus an agent surfaced records surfaced_by: agent" and "the caller's hardcoded 'human' did NOT survive"
   (here: every non-session caller, each binding class and both kinds of agent credential). Not carried: "admin creates a
   member", "enrollment succeeds", "member logs in", "the session/machine credential creates the focus" and the read-back
   through op=file: they are membership's and promotion's (the store keeps the forwarded bytes, promotion R18), not this
   door's; the session and the credentials are the harness's here. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, world, call, opCalls, sha, aik, cred, hex64 } from "./harness.mjs";

const now = "2026-07-31T00:00:00Z";
/* The old suite's fixture, verbatim but for the group line (no jurisdiction in a test fixture's name is needed here). */
const focusMd = (id, surfacedBy = "human", type = "focus") => [
  "---", "id: " + id, `object_type: ${type}`, "schema: focus@1",
  'title: "Is the franchise fee still lawful"', "current_state: surfaced", "prior_state: null",
  "created: " + now, "last_updated: " + now,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: a-group", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []",
  `surfaced_by: ${surfacedBy}`, "recheck_triggers:", "  - text: Revisit this",
  "    description: replace with a real trigger.", "---", "",
  "## Statement", "", "a question worth asking", "", "## Why It Matters", "",
  "## Open Questions", "", "## Session Log", "", "## Review Notes", ""
].join("\n");
const pkg = (id, text, extra = {}) => ({
  bundleId: id, base: null, snapKey: id + "_new",
  meta: { object_type: "focus", title: "Is the franchise fee still lawful", current_state: "surfaced", created: now, last_updated: now },
  files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256: sha(text) }], register: [], ...extra });

/* What reached the store's promote route: the bundle.md it will keep. */
const sent = (env) => {
  const p = opCalls(env).filter((c) => c.route === "promote");
  assert.equal(p.length, 1, "one promotion forwarded");
  return p[0].body.files.find((f) => f.path === "bundle.md");
};
const surfacedBy = (text) => (text.match(/^surfaced_by:\s*(\S+)\s*$/m) || [])[1] ?? null;

function callers() {
  const agent = aik(), org = aik();
  const w = world({ creds: { [agent]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: ["promote"] }),
                             [org]: cred({ tokenId: "agent-org", principal: "class:ai", writes: ["promote"] }) } });
  return { w, list: [
    ["ann's member session", w.S.ann, {}, "human"], ["the founder's session", w.S.founder, {}, "human"],
    ["the admin binding", w.env.ADMIN_TOKEN, {}, "agent"],
    ["the probe binding", w.env.PROBE_TOKEN, { store: "scratch" }, "agent"],
    ["a member-scoped agent credential", agent, {}, "agent"], ["an organisation agent credential", org, {}, "agent"],
  ] };
}

test("R37 (D-78, N398): a creation of an inquiry records `surfaced_by` from the credential — `human` for a session, `agent` for every other caller — never the caller's own literal, with the bytes and digest of what the store keeps recomputed", async () => {
  const { w, list } = callers();
  for (const [name, token, params, want] of list) {
    /* both literals a caller could send: the writers' hardcoded `human`, and a session asserting `agent` */
    for (const claimed of ["human", "agent"]) {
      w.env.calls.length = 0;
      const id = `FOCUS-2026-0001-${hex64().slice(0, 6)}`;
      const r = await call(w.env, { op: "promote", token, params, method: "POST", body: pkg(id, focusMd(id, claimed)) });
      assert.equal(r.status, 200, `${name}: ${r.text.slice(0, 200)}`);
      const f = sent(w.env);
      assert.equal(surfacedBy(f.text), want, `${name}, claiming ${claimed}`);
      /* the stored digest and size are those of the text the store keeps */
      assert.deepEqual([f.sha256, f.bytes], [sha(f.text), Buffer.byteLength(f.text)], name);
      /* nothing else in the document moved */
      assert.equal(f.text, focusMd(id, want), name);
    }
  }
});

test("R37 (D-78, REC-10): every spelling the catalogue folds to an inquiry is stamped — the document's own `object_type` decides, the envelope's only where the document states none; a document of any other type is not touched", async () => {
  const { env, S } = world();
  for (const [type, stamped] of [["focus", true], ["problem", true], ["inquiry", true], ["information", false], ["project", false]]) {
    env.calls.length = 0;
    const id = `X-2026-0001-${type}`;
    const text = focusMd(id, "human", type);
    await call(env, { op: "promote", token: env.PROBE_TOKEN, params: { store: "scratch" }, method: "POST", body: pkg(id, text, { meta: { object_type: type } }) });
    assert.equal(surfacedBy(sent(env).text), stamped ? "agent" : "human", type);
    if (!stamped) assert.equal(sent(env).text, text, `${type}: byte-identical`);
  }
  /* the envelope is read only where the document names no type */
  const bare = focusMd("X-2026-0002-x").replace(/^object_type: focus\n/m, "");
  env.calls.length = 0;
  await call(env, { op: "promote", token: env.PROBE_TOKEN, params: { store: "scratch" }, method: "POST", body: pkg("X-2026-0002-x", bare, { meta: { object_type: "focus" } }) });
  assert.equal(surfacedBy(sent(env).text), "agent");
  /* negative control: the same body through a session reads human */
  env.calls.length = 0;
  await call(env, { op: "promote", token: S.ann, method: "POST", body: pkg("X-2026-0002-x", bare, { meta: { object_type: "focus" } }) });
  assert.equal(surfacedBy(sent(env).text), "human");
});

test("R37 (D-78, REC-175): a revision is not restamped — the origin fact is not rewritten by a later editor — and a digest the caller sent that is not of its text is left as sent, so the store refuses the mismatch rather than the stamp papering over it", async () => {
  const { env } = world();
  const id = "FOCUS-2026-0003-rev";
  const text = focusMd(id, "human");
  /* a revision by a machine credential keeps the document's value, byte for byte */
  env.calls.length = 0;
  await call(env, { op: "promote", token: env.PROBE_TOKEN, params: { store: "scratch" }, method: "POST", body: pkg(id, text, { base: "rev0" }) });
  assert.deepEqual([sent(env).text, sent(env).sha256], [text, sha(text)]);
  /* a false digest: text and digest reach the store as sent */
  env.calls.length = 0;
  const wrong = "0".repeat(64);
  const body = pkg(id, text);
  body.files[0].sha256 = wrong;
  await call(env, { op: "promote", token: env.PROBE_TOKEN, params: { store: "scratch" }, method: "POST", body });
  assert.deepEqual([sent(env).text, sent(env).sha256], [text, wrong]);
  /* the digest of the text sent, in capitals, is the true one and is restamped (the store's comparison rule) */
  env.calls.length = 0;
  const upper = pkg(id, text);
  upper.files[0].sha256 = sha(text).toUpperCase();
  await call(env, { op: "promote", token: env.PROBE_TOKEN, params: { store: "scratch" }, method: "POST", body: upper });
  assert.deepEqual([surfacedBy(sent(env).text), sent(env).sha256], ["agent", sha(sent(env).text)]);
  /* no digest sent: stamped, and the digest is the server's */
  env.calls.length = 0;
  const none = pkg(id, text);
  delete none.files[0].sha256;
  await call(env, { op: "promote", token: env.PROBE_TOKEN, params: { store: "scratch" }, method: "POST", body: none });
  assert.deepEqual([surfacedBy(sent(env).text), sent(env).sha256], ["agent", sha(sent(env).text)]);
});

test("R37, R16 (REC-173 (b)): an inquiry creation the plane verifies as a migration replay keeps its recorded `surfaced_by` although the admin binding is no session; unverified, the same creation is stamped `agent`", async () => {
  for (const hold of [true, false]) {
    const id = "INQ-2026-0001-replayed";
    const text = focusMd(id, "human", "inquiry");
    const prov = JSON.stringify({ promotions: [{ key: "p1", record: { target: id, files: [{ name: "bundle.md", sha256: sha(text) }] } }] });
    const cap = sha(prov);
    const bytes = new TextEncoder().encode(prov);
    const w = world();
    w.env.CAPTURES = { async get(k) {
      return hold && k === `bio/captures/${cap}` ? { arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) } : null;
    } };
    const body = pkg(id, text, { meta: { object_type: "inquiry" }, provenanceCapture: cap,
                                 register: [{ sha256: cap, path: M.DRIVE_PROVENANCE_PATH }] });
    const r = await call(w.env, { op: "promote", token: w.env.ADMIN_TOKEN, method: "POST", body });
    assert.equal(r.status, 200, r.text.slice(0, 200));
    const f = sent(w.env);
    assert.equal(surfacedBy(f.text), hold ? "human" : "agent", `verified: ${hold}`);
    const b = opCalls(w.env).find((c) => c.route === "promote").body;
    assert.equal(!!b.migrationReplay, hold, "the replay is the server's word");
  }
});
