/* capture: the capturing member and late co-attestation (`acquisition` R16's actor, R68, R69) and capture's own rows
   of C-118 (R37), N364, at the module's interface: the store-side services, provenance's and host-governor's services
   as their Provides state them, and attestation's real `attest` over a scripted network (fixture.mjs). The doorbell's
   tests (the knock, the knocker secret and pseudonym, the pull, `knocksOf`, `knockAttempt`, `pulledKnocksOf`) moved
   with it to `doorbell` (T42, K2607; `build/extraction/capture-split.md` §6). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, governor, provenance, network, granted, sha, register, newKey, sshsign, signer, H } from "./fixture.mjs";
import { captureOps, captureAccountStatement, CAPTURE_ACCOUNT_TOKEN } from "../../../src/capture/index.mjs";
import { evidenceAbsent } from "../../../src/capture/ops.mjs";
import { CAPTURE_CHECKS, KNOCK_CHECKS } from "../../../src/capture/checks.mjs";
import * as signatures from "../../../src/sshsig.mjs";
import { NS_RATIFY, NS_RELEASE } from "../../../src/sshsig.mjs";
import { ARCHIVE_SERVICE, ARCHIVE_SAVE_BASE, TSA_ENDPOINTS } from "../../../src/tsa.mjs";

function setup({ evidence = true, env = {} } = {}) {
  const b = evidence ? bucket() : null;
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9", ...env } });
  return { ...f, b, prov: f.c.provenance };
}

test("R73 R69 (acquisition R16): a member session's capture names its actor, the member stamp, and is recorded as that member's capture; any other caller's is null", async () => {
  const b = bucket();
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "i" } });
  const net = network({ "https://a.example/x": () => new Response("x bytes", { headers: { "content-type": "text/plain" } }) });
  try {
    const m = await f.c.acquire({ locator: "https://a.example/x" }, { cls: "member", member: true, sessMember: "m1" });
    assert.deepEqual([m.body.document.capture.actor, m.body.document.capture.actor_class], ["m1", "member"]);
    assert.deepEqual(f.c.captureAccountsOf(sha("x bytes")).actors.map((a) => a.actor), ["m1"]);
    for (const [cls, member] of [["admin", false], ["probe", false], ["member", false]]) {
      const r = await f.c.acquire({ locator: "https://a.example/x" }, { cls, member, sessMember: null });
      assert.equal(r.body.document.capture.actor, null, cls);
    }
    assert.deepEqual(f.c.captureAccountsOf(sha("x bytes")).actors.map((a) => a.actor), ["m1"], "no machine is recorded as an actor");
  } finally { net.restore(); }
});

test("R69 R37 (C-118.5, C-118.6): only a capture's actor appends a signed account, verified over its statement against one of that member's attesting keys; append-only, and captureAccountsOf answers them", async () => {
  const { c, s } = setup();
  const d = H("c1");
  c.recordCaptureActor({ captureSha: d, actor: "m1", at: "2026-09-01T00:00:00Z" });
  const k1 = await newKey(), k2 = await newKey(), kOther = await newKey(), kRevoked = await newKey();
  signer(s, "m1", k1.keyB64); signer(s, "m1", kRevoked.keyB64, { keyStatus: "revoked" }); signer(s, "m2", kOther.keyB64);
  const text = "I saved this page from the clerk's site at 9:14 on 1 September, logged in as myself.";
  const good = await sshsign(k1, captureAccountStatement(d, text), NS_RATIFY);
  assert.equal(new TextDecoder().decode(captureAccountStatement(d, text)), `${CAPTURE_ACCOUNT_TOKEN} ${d}\n${text}`);
  const notActor = CAPTURE_CHECKS.NOT_THE_CAPTURING_ACTOR, noText = CAPTURE_CHECKS.ACCOUNT_NO_TEXT;
  /* anyone else, and a capture with no recorded actor, is C-118.5 */
  for (const [sha0, by] of [[d, "m2"], [d, "member:m2"], [d, null], [H("c2"), "m1"], ["not a sha", "m1"]]) {
    const r = await c.recordCaptureAccount({ captureSha: sha0, text, signature: good, by });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "NOT_THE_CAPTURING_ACTOR", "NOT_THE_CAPTURING_ACTOR", "C-118.5", notActor.translation], `${sha0} ${by}`);
  }
  for (const t of ["", "   ", null, 7]) {
    const r = await c.recordCaptureAccount({ captureSha: d, text: t, signature: good, by: "m1" });
    assert.deepEqual([r.reason, r.code, r.check, r.translation], ["ACCOUNT_NO_TEXT", "ACCOUNT_NO_TEXT", "C-118.6", noText.translation]);
  }
  /* SIG_<reason>: another text, another member's key, a revoked key, another namespace, no signature */
  const cases = [[await sshsign(k1, captureAccountStatement(d, "another account"), NS_RATIFY), "SIG_BAD_SIGNATURE"],
                 [await sshsign(kOther, captureAccountStatement(d, text), NS_RATIFY), "SIG_UNKNOWN_KEY"],
                 [await sshsign(kRevoked, captureAccountStatement(d, text), NS_RATIFY), "SIG_UNKNOWN_KEY"],
                 [await sshsign(k1, captureAccountStatement(d, text), NS_RELEASE), "SIG_NAMESPACE"],
                 [await sshsign(k1, `bio-ratify ${d}\n${text}`, NS_RATIFY), "SIG_BAD_SIGNATURE"],
                 ["", "SIG_MALFORMED"], [undefined, "SIG_MALFORMED"]];
  for (const [sig, reason] of cases) assert.equal((await c.recordCaptureAccount({ captureSha: d, text, signature: sig, by: "m1" })).reason, reason);
  assert.deepEqual(c.captureAccountsOf(d).accounts, [], "no refusal wrote anything");
  /* the actor, with any of their attesting keys, `member:m1` and `m1` being one member */
  const a1 = await c.recordCaptureAccount({ captureSha: d, text, signature: good, by: "m1", at: "2026-09-02T00:00:00Z" });
  assert.deepEqual([a1.ok, a1.seq, a1.key_b64], [true, 1, k1.keyB64]);
  const text2 = "A correction: it was 9:41.";
  const a2 = await c.recordCaptureAccount({ captureSha: d.toUpperCase(), text: text2, signature: await sshsign(k2, captureAccountStatement(d, text2), NS_RATIFY), by: "member:m1" });
  assert.equal(a2.reason, "SIG_UNKNOWN_KEY", "a key the member has not registered does not attest");
  signer(s, "m1", k2.keyB64);
  const a3 = await c.recordCaptureAccount({ captureSha: d, text: text2, signature: await sshsign(k2, captureAccountStatement(d, text2), NS_RATIFY), by: "member:m1" });
  assert.deepEqual([a3.ok, a3.seq], [true, 2]);
  const all = c.captureAccountsOf(d);
  assert.deepEqual(all.accounts.map((a) => [a.seq, a.by, a.text, a.key_b64]), [[1, "m1", text, k1.keyB64], [2, "member:m1", text2, k2.keyB64]], "append-only, in order");
  assert.deepEqual(all.actors.map((a) => a.actor), ["m1"]);
  /* a revoked member's keys attest nothing */
  s.sql.exec(`UPDATE members SET status = 'revoked' WHERE member_id = 'm1'`);
  assert.equal((await c.recordCaptureAccount({ captureSha: d, text, signature: good, by: "m1" })).reason, "SIG_UNKNOWN_KEY");
  assert.deepEqual(c.captureAccountsOf("nope"), { captureSha: "nope", actors: [], accounts: [] });
  /* the routes, the stamp winning */
  s.sql.exec(`UPDATE members SET status = 'active' WHERE member_id = 'm1'`);
  const via = await captureOps(c, new URL("http://x/captureaccount?by=m2"), { captureSha: d, text, signature: good, by: "m1" }, c.env).captureaccount();
  assert.equal(via.reason, "NOT_THE_CAPTURING_ACTOR", "the query's stamp, not the body's claim");
  assert.equal(captureOps(c, new URL(`http://x/captureaccounts?capture=${d}&viewer=admin`), null, c.env).captureaccounts().accounts.length, 2);
});

test("R69 (N530): the account statement capture verifies over, and the names it exports, are signatures' own (its R41): one spelling, no copy of capture's", async () => {
  assert.equal(captureAccountStatement, signatures.captureAccountStatement, "the very function signatures provides");
  assert.equal(CAPTURE_ACCOUNT_TOKEN, signatures.CAPTURE_ACCOUNT_TOKEN);
  /* the account is verified over exactly signatures' bytes: a signature over them is admitted, over any other spelling refused */
  const { c, s } = setup();
  const d = H("c9");
  c.recordCaptureActor({ captureSha: d, actor: "m1" });
  const key = await newKey();
  signer(s, "m1", key.keyB64);
  const text = "Saved from the clerk's page.\nSecond line, kept as written.";
  const theirs = signatures.captureAccountStatement(d, text);
  assert.deepEqual([...theirs], [...new TextEncoder().encode(`bio-capture-account ${d}\n${text}`)]);
  assert.equal((await c.recordCaptureAccount({ captureSha: d, text, signature: await sshsign(key, `bio-capture-account ${d} \n${text}`, NS_RATIFY), by: "m1" })).reason,
               "SIG_BAD_SIGNATURE", "another spelling of the statement does not verify");
  assert.equal((await c.recordCaptureAccount({ captureSha: d, text, signature: await sshsign(key, theirs, NS_RATIFY), by: "m1" })).ok, true);
});

/* A world for R68: a held capture (or one held in parts, an acquisition receipt naming it), attestation's real `attest`
   (its R1–R3), and the network scripted: the timestamp authorities, the archive's save and its raw replay. */
function reWorld({ held = true, acquired = false } = {}) {
  const b = bucket();
  const gov = governor();
  const f = fresh({ evidence: b, gov, env: { INSTANCE_NAME: "i" } });
  const bytes = new TextEncoder().encode("the captured page");
  const d = sha(bytes);
  if (held) b.held.set(`bio/captures/${d}`, bytes);
  if (acquired) f.c.provenance = provenance(f.s, { acquired: [d] });
  return { ...f, b, gov, d, bytes };
}
const LOCATOR = "https://a.example/page";
const ARCHIVED = "https://web.archive.org/web/20260930110001/https://a.example/page";
const REPLAY = "https://web.archive.org/web/20260930110001id_/https://a.example/page";
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
/* `tsa`: each authority's answer in TSA_ENDPOINTS order (a status, or "granted": a token bound to `d`); `save`: the
   archived locator the archive's save answers, or null for a 523; `replay`: the raw replay's bytes, or null (a 404). */
const authorities = (d, { tsa = [], save = ARCHIVED, replay = null } = {}) => network((url) => {
  const i = TSA_ENDPOINTS.indexOf(url);
  if (i >= 0) return tsa[i] === "granted" ? new Response(granted(d)) : new Response("", { status: tsa[i] ?? 500 });
  if (url === ARCHIVE_SAVE_BASE + LOCATOR)
    return save ? new Response("", { headers: { "content-location": save.replace("https://web.archive.org", "") } }) : new Response("", { status: 523 });
  if (url === REPLAY && replay) return new Response(replay);
  return null;
});
const run = async (n, fn) => { try { return await fn(); } finally { n.restore(); } };

test("R68: reattest asks attestation's attest for a fresh timestamp over the digest and a fresh co-archive, through the governor; compares the co-archive's raw replay with the digest; appends each outcome late, dated, with what it proves", async () => {
  const w = reWorld();
  const net = authorities(w.d, { tsa: [500, "granted"], replay: w.bytes });
  const r = await run(net, () => w.c.reattest({ captureSha: w.d, locator: LOCATOR, by: "m1" }));
  assert.deepEqual([r.ok, r.attested], [true, true]);
  /* the authorities in order, stopping at the first bound token; then the co-archive; then its raw replay */
  assert.deepEqual(net.seen.map((x) => x.url), [TSA_ENDPOINTS[0], TSA_ENDPOINTS[1], ARCHIVE_SAVE_BASE + LOCATOR, REPLAY]);
  for (const x of net.seen.slice(0, 2)) assert.ok(Buffer.from(x.init.body).includes(Buffer.from(w.d, "hex")), "a fresh request over the capture digest");
  for (const u of [TSA_ENDPOINTS[0], TSA_ENDPOINTS[1], ARCHIVE_SAVE_BASE + LOCATOR, REPLAY])
    assert.ok(w.gov.calls.some((c) => c[0] === "admit" && c[1] === new URL(u).host), `through the host governor: ${u}`);
  const outs = r.late_attestations;
  assert.deepEqual(outs.map((o) => [o.kind, o.service, o.ok, o.late]),
                   [["timestamp", TSA_ENDPOINTS[0], false, true], ["timestamp", TSA_ENDPOINTS[1], true, true], ["co_archive", ARCHIVE_SERVICE, true, true]]);
  for (const o of outs) {
    assert.match(o.at, ISO, "dated by its own attempt");
    assert.equal(o.proves, `proves the bytes existed by ${o.at}, not at capture`);
  }
  assert.equal(outs[0].note, "http 500", "a failed attempt is kept with its reason");
  /* the token, stored under its own digest, is the attestation over this capture */
  const tok = outs[1];
  assert.match(tok.token_sha256, /^[0-9a-f]{64}$/);
  assert.equal(sha(w.b.held.get(`bio/captures/${tok.token_sha256}`)), tok.token_sha256);
  assert.deepEqual([r.attestation.over, r.attestation.sha256, r.attestation.kind], [w.d, tok.token_sha256, "rfc3161"]);
  const co = outs[2];
  assert.deepEqual([co.matches, co.archived_locator, co.replay, co.replay_sha256], [true, ARCHIVED, REPLAY, w.d]);
  assert.deepEqual(w.c.lateAttestationsOf(w.d).late_attestations.map((o) => [o.seq, o.by, o.kind, o.matches ?? null]),
                   [[1, "m1", "timestamp", null], [2, "m1", "timestamp", null], [3, "m1", "co_archive", true]], "appended in order");
  /* a replay of other bytes: false; no archived locator, or no replay: undetermined, with the reason */
  const w2 = reWorld();
  const r2 = await run(authorities(w2.d, { tsa: ["granted"], replay: "something else" }), () => w2.c.reattest({ captureSha: w2.d, locator: LOCATOR }));
  assert.deepEqual([r2.late_attestations[1].matches, r2.late_attestations[1].match_basis], [false, "the co-archive's replay holds other bytes than the capture"]);
  const w3 = reWorld();
  const n3 = authorities(w3.d, { tsa: ["granted"], save: null });
  const r3 = await run(n3, () => w3.c.reattest({ captureSha: w3.d, locator: LOCATOR }));
  assert.deepEqual([r3.late_attestations[1].kind, r3.late_attestations[1].ok, r3.late_attestations[1].note, r3.late_attestations[1].matches],
                   ["co_archive", false, "http 523", "undetermined"]);
  assert.ok(!n3.seen.some((x) => x.url.includes("id_/")), "no replay is fetched without an archived locator");
  const w4 = reWorld();
  const r4 = await run(authorities(w4.d, { tsa: ["granted"] }), () => w4.c.reattest({ captureSha: w4.d, locator: LOCATOR }));
  assert.deepEqual([r4.late_attestations[1].matches, r4.late_attestations[1].match_basis], ["undetermined", "the replay answered 404"]);
  /* no token from any authority: every failed attempt is still appended late; a second reattest appends after the first */
  const w5 = reWorld();
  const n5 = authorities(w5.d, { tsa: [500, 503, 502] });
  const r5 = await run(n5, async () => [await w5.c.reattest({ captureSha: w5.d }), await w5.c.reattest({ captureSha: w5.d, locator: "http://a.example/plain" })]);
  assert.deepEqual(r5.map((x) => [x.ok, x.attested]), [[true, false], [true, false]]);
  assert.deepEqual(r5[0].late_attestations.map((o) => [o.service, o.ok, o.note]),
                   TSA_ENDPOINTS.map((u, i) => [u, false, `http ${[500, 503, 502][i]}`]));
  assert.deepEqual(w5.c.lateAttestationsOf(w5.d).late_attestations.map((o) => o.seq), [1, 2, 3, 4, 5, 6]);
  assert.ok(!n5.seen.some((x) => x.url.startsWith(ARCHIVE_SAVE_BASE)), "with no public locator, no co-archive is asked");
});

test("R68 (R63): reattest refuses BAD_SHA, and R63's absence when no bytes are held; a capture held in parts counts when provenance holds its receipt", async () => {
  const w = reWorld();
  for (const bad of ["abc", "", null, 42]) assert.equal((await w.c.reattest({ captureSha: bad })).reason, "BAD_SHA");
  const gone = reWorld({ held: false });
  const ng = authorities(gone.d, { tsa: ["granted"] });
  const r = await run(ng, () => gone.c.reattest({ captureSha: gone.d }));
  const want = evidenceAbsent(gone.d, "bio").body;
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.sha256], [false, want.reason, want.code, want.check, want.translation, gone.d]);
  assert.deepEqual([ng.seen, gone.c.lateAttestationsOf(gone.d).late_attestations], [[], []], "nothing asked, nothing written");
  /* held in parts: no object under the digest, an acquisition receipt naming it; attestation's attest proceeds on it */
  const parts = reWorld({ held: false, acquired: true });
  const np = authorities(parts.d, { tsa: ["granted"] });
  const p = await run(np, () => parts.c.reattest({ captureSha: parts.d }));
  assert.deepEqual([p.ok, p.attested, p.late_attestations.length], [true, true, 1]);
  assert.deepEqual(np.seen.map((x) => x.url), [TSA_ENDPOINTS[0]]);
  const noStore = fresh({});
  assert.equal((await noStore.c.reattest({ captureSha: H("a") })).reason, "EVIDENCE_NOT_HELD", "with no evidence store no bytes are held");
  /* the routes: the stamp in the query names who asked */
  const rw = reWorld();
  const via = await run(authorities(rw.d, { tsa: ["granted"] }),
                        () => captureOps(rw.c, new URL("http://x/reattest?by=m9"), { captureSha: rw.d, by: "forged" }, rw.c.env).reattest());
  assert.equal(via.ok, true);
  assert.equal(captureOps(rw.c, new URL(`http://x/lateattestations?capture=${rw.d}`), null, rw.c.env).lateattestations().late_attestations[0].by, "m9");
});

test("R37 (K2607, K2609): capture's own rows are C-118.1, .5, .6, .8, .9 and .10, each at the site in capture that raises it, with the translations the requirements state; the rows that moved to doorbell keep their codes and numbers, are defined here once and name doorbell's raisers; C-118 runs 1 to 10 with no gap", () => {
  const want = {
    EVIDENCE_NOT_HELD: ["C-118.1", "The record holds no stored copy of a document under this fingerprint.", /^src\/capture\/ops\.mjs evidenceAbsent > is-evidence-held$/],
    NOT_THE_CAPTURING_ACTOR: ["C-118.5", "An account of how a document was captured is added only by the member who captured it, and that is not you, or no member captured it. Nothing was written.",
                              /^src\/capture\/index\.mjs recordCaptureAccount > is-capturing-actor$/],
    ACCOUNT_NO_TEXT: ["C-118.6", "An account of how you captured a document says what happened in your own words, and this one is empty. Write it. Nothing was written.",
                      /^src\/capture\/index\.mjs recordCaptureAccount > is-account-worded$/],
    MACHINE_CANNOT_SET_ASIDE: ["C-118.8", "Setting held material aside, or bringing it back, is a member's own act, and no member made this request. Nothing was written.",
                               /^src\/capture\/index\.mjs #heldActRefusal > is-held-act-by-member$/],
    SET_ASIDE_NO_REASON: ["C-118.9", "Setting held material aside, or bringing it back, records why, in your own words, and no reason was given, or it is longer than 2,000 characters. Write one. Nothing was written.",
                          /^src\/capture\/index\.mjs #heldActRefusal > is-held-act-reasoned$/],
    UPLOAD_NO_STATEMENT: ["C-118.10", null, /^src\/capture\/index\.mjs uploadCapture > is-upload-stated$/],
  };
  for (const [code, [check, translation, where]] of Object.entries(want)) {
    const row = CAPTURE_CHECKS[code];
    assert.equal(row.check, check, code);
    if (translation) assert.equal(row.translation, translation, code);
    else assert.ok(typeof row.translation === "string" && row.translation.length > 0, code);
    assert.match(row.where, where, code);
    assert.ok(Object.isFrozen(row));
  }
  /* the raisers' answers carry the rows: R63's absence */
  const absent = evidenceAbsent(H("a1"), "bio").body;
  assert.deepEqual([absent.code, absent.check, absent.translation], ["EVIDENCE_NOT_HELD", "C-118.1", want.EVIDENCE_NOT_HELD[1]]);
  /* moved to doorbell (its R21), numbers kept, still defined once here until capture's delete (T43, K2609) */
  const moved = { NO_SUCH_KNOCK: "C-118.2", KNOCKER_SECRET_WEAK: "C-118.3", KNOCK_DISCARDED: "C-118.4", RESOLVE_NO_REASON: "C-118.7" };
  for (const [code, check] of Object.entries(moved)) assert.equal(CAPTURE_CHECKS[code].check, check, code);
  assert.deepEqual(Object.values(KNOCK_CHECKS).map((r) => r.check).sort(), ["C-85.1", "C-85.2", "C-85.3", "C-85.4", "C-85.5"]);
  /* each moved row names its live raiser, doorbell's (K2627; the map's §2) */
  const raisers = {
    NO_SUCH_KNOCK: "src/doorbell/index.mjs #noSuchKnock > is-knock-held",
    KNOCKER_SECRET_WEAK: "src/doorbell/door.mjs knockerSecretWeak > is-knocker-secret-strong",
    KNOCK_DISCARDED: "src/doorbell/index.mjs pullKnock > is-knock-pullable",
    RESOLVE_NO_REASON: "src/doorbell/index.mjs inboxResolve > is-resolve-reasoned",
  };
  for (const [code, where] of Object.entries(raisers)) assert.equal(CAPTURE_CHECKS[code].where, where, code);
  assert.deepEqual(Object.values(KNOCK_CHECKS).map((r) => r.where),
                   ["src/doorbell/index.mjs #knockRateRefusal > is-knock-rate", "src/doorbell/index.mjs #knockRateRefusal > is-knock-rate",
                    "src/doorbell/door.mjs knockEnvelopeTooLarge > is-knock-envelope-too-large",
                    "src/doorbell/door.mjs knockPayloadTooLarge > is-knock-payload-too-large", "src/doorbell/door.mjs knockEmpty > is-knock-empty"]);
  /* C-118's numbers: one row each, 1 to 10, so the next free number capture mints is C-118.11 */
  const nums = Object.values(CAPTURE_CHECKS).map((r) => Number(/^C-118\.(\d+)$/.exec(r.check)[1])).sort((a, b) => a - b);
  assert.deepEqual(nums, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

/* N388 (REC-30): the two capture reads that took no viewer. A project bundle hides its captures from a member who does
   not participate (membership R43, D-701's gate); an information bundle hides nothing from a member. */
function sightWorld() {
  const w = setup();
  const d = H("5a"), open = H("5b"), loose = H("5c");
  register(w.s, d, "PROJ-2026-0001", { type: "project" });
  register(w.s, open, "INFO-2026-0001");
  w.s.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES ('PROJ-2026-0001', 'm1', 'active', '2026-01-01', '2026-01-01')`);
  for (const m of ["m1", "m2"]) w.s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, m);
  for (const x of [d, open, loose]) {
    w.c.recordCaptureActor({ captureSha: x, actor: "m1", at: "2026-09-01T00:00:00Z" });
    w.s.sql.exec(`INSERT INTO capture_accounts (capture_sha, seq, by, text, signature, key_b64, at) VALUES (?, 1, 'm1', 'captured for the budget project', 'sig', 'key', '2026-09-02T00:00:00Z')`, x);
    w.s.sql.exec(`INSERT INTO late_attestations (capture_sha, seq, kind, service, ok, at, by, outcome) VALUES (?, 1, 'timestamp', 'tsa', 1, '2026-09-03T00:00:00Z', 'm1', ?)`,
                 x, JSON.stringify({ kind: "timestamp", service: "tsa", ok: true, at: "2026-09-03T00:00:00Z", late: true }));
  }
  return { ...w, d, open, loose };
}

test("R69 (N388, REC-30): captureAccountsOf answers by the caller's viewer through the capture's bundle: an unseen capture reads as an unknown one, a capture in no bundle is seen, an absent viewer sees nothing, and an in-process caller with no viewer reads whole", () => {
  const { c, d, open, loose } = sightWorld();
  const nothing = (x) => ({ captureSha: x, actors: [], accounts: [] });
  const sees = (x, viewer) => c.captureAccountsOf(x, { viewer }).accounts.length === 1;
  /* the participant and a machine credential: the project's capture is seen */
  for (const v of ["member:m1", "class:admin", "class:ai"]) assert.equal(sees(d, v), true, v);
  /* D54 (K2408, K2442): the project holds no sight setting, so it is hidden; the founder, neither invited nor joined,
     sees it only at EXISTENCE (membership R43), never its contents: its capture reads as one never recorded */
  for (const v of ["admin", "member:admin"]) assert.deepEqual(c.captureAccountsOf(d, { viewer: v }), nothing(d), v);
  /* the controls: the founder sees it once the project is discoverable (D54 leaves those unchanged), and once joined */
  const s = sightWorld();
  s.s.sql.exec(`INSERT INTO project_sight (project_id, setting) VALUES ('PROJ-2026-0001', 'discoverable')`);
  for (const v of ["admin", "member:admin"]) assert.equal(s.c.captureAccountsOf(s.d, { viewer: v }).accounts.length, 1, `discoverable: ${v}`);
  const j = sightWorld();
  j.s.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES ('PROJ-2026-0001', 'admin', 'active', '2026-01-01', '2026-01-01')`);
  assert.equal(j.c.captureAccountsOf(j.d, { viewer: "admin" }).accounts.length, 1, "joined: the founder");
  /* a member not in the project, and a viewer the gate does not recognise: nothing, exactly as for a capture never recorded */
  for (const v of ["member:m2", "", "junk", null]) {
    assert.deepEqual(c.captureAccountsOf(d, { viewer: v }), nothing(d), String(v));
    assert.deepEqual(c.captureAccountsOf(d, { viewer: v }), { ...c.captureAccountsOf(H("99"), { viewer: v }), captureSha: d }, "unseen reads as unknown");
  }
  /* an information bundle and a capture filed in no bundle: seen by every member */
  for (const x of [open, loose]) assert.equal(sees(x, "member:m2"), true, x);
  assert.deepEqual(c.captureAccountsOf(loose, { viewer: "junk" }), nothing(loose), "an unrecognised viewer sees nothing at all");
  /* in process, no viewer: whole (`case-disclosures` R3's pre-flight) */
  assert.equal(c.captureAccountsOf(d).accounts[0].text, "captured for the budget project");
  /* the route: the stamp decides, and an unstamped call sees nothing */
  const route = (q) => captureOps(c, new URL(`http://x/captureaccounts?capture=${d}${q}`), null, c.env).captureaccounts();
  assert.deepEqual([route("&viewer=member:m1").accounts.length, route("&viewer=member:m2").accounts.length, route("").accounts.length], [1, 0, 0]);
  assert.deepEqual(captureOps(c, new URL(`http://x/captureaccounts?viewer=member:m1`), { captureSha: d }, c.env).captureaccounts().actors.map((a) => a.actor), ["m1"]);
});

test("R68 (N388, REC-30): lateAttestationsOf takes no viewer: it names no bundle, so its rows about a capture stand for every reader, through the route whatever the stamp", () => {
  const { c, d } = sightWorld();
  const all = c.lateAttestationsOf(d).late_attestations;
  assert.deepEqual(all.map((o) => [o.seq, o.by, o.kind, o.late]), [[1, "m1", "timestamp", true]]);
  assert.ok(!JSON.stringify(all).includes("PROJ-"), "no bundle named");
  for (const q of ["", "&viewer=member:m2", "&viewer=junk"])
    assert.deepEqual(captureOps(c, new URL(`http://x/lateattestations?capture=${d}${q}`), null, c.env).lateattestations().late_attestations, all, q);
});

test("R68 (N388): a machine may reattest, as it may attest: the authority vouches, not the caller; the attempt is appended late with the machine's stamp as who asked, and no refusal names a fence", async () => {
  const w = reWorld();
  const net = authorities(w.d, { tsa: ["granted"] });
  await run(net, async () => {
    for (const by of ["class:ai", "class:probe", "class:admin"]) {
      const r = await captureOps(w.c, new URL(`http://x/reattest?by=${encodeURIComponent(by)}`), { captureSha: w.d }, w.c.env).reattest();
      assert.deepEqual([r.ok, r.attested, r.late_attestations.every((o) => o.late === true)], [true, true, true], by);
    }
  });
  assert.deepEqual(w.c.lateAttestationsOf(w.d).late_attestations.map((o) => o.by), ["class:ai", "class:probe", "class:admin"]);
  assert.deepEqual(net.seen.map((x) => x.url), TSA_ENDPOINTS.slice(0, 1).concat(TSA_ENDPOINTS.slice(0, 1), TSA_ENDPOINTS.slice(0, 1)),
                   "each asked attestation's attest afresh");
});
