/* capture R97 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, captureOps, captureAccountStatement } from "../../../src/capture/index.mjs";
import { NS_RATIFY } from "../../../src/sshsig.mjs";
import { fresh, bucket, network, newKey, sshsign, signer, H } from "./fixture.mjs";


/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (fresh({ evidence: bucket(), env: { INSTANCE_NAME: "i" } }));
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (captureOps(env.c, url, fields, env.c.env)[op]());
};

test("R97 capture declares gradenote: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "gradenote", declaration: DECLARED_OPS["gradenote"], call: mk("gradenote", {"viewer":"member:ann"}),
    refusedNaming: named({}) });
});

test("R97 capture declares archivelist: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "archivelist", declaration: DECLARED_OPS["archivelist"], call: mk("archivelist", {"viewer":"member:ann"}),
    refusedNaming: named({"archive":["BAD_SHA"],"archiveSha":["BAD_SHA"]}, true), values: {"archive":"abababababababababababababababababababababababababababababababab","archiveSha":"abababababababababababababababababababababababababababababababab"} });
});

test("R97 capture declares heldcaptures: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "heldcaptures", declaration: DECLARED_OPS["heldcaptures"], call: mk("heldcaptures", {"viewer":"member:ann"}),
    refusedNaming: named({}) });
});

test("R97 capture declares heldsetaside: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "heldsetaside", declaration: DECLARED_OPS["heldsetaside"], call: mk("heldsetaside", {"by":"member:ann","viewer":"member:ann"}),
    refusedNaming: named({"ids":["NO_IDS"],"reason":["SET_ASIDE_NO_REASON"]}, true), values: {"ids":["INFO-2026-0001"],"reason":"because"} });
});

test("R97 capture declares reattest: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "reattest", declaration: DECLARED_OPS["reattest"], call: mk("reattest", {"by":"member:ann"}),
    refusedNaming: named({"captureSha":["BAD_SHA"]}, true), values: {"captureSha":"abababababababababababababababababababababababababababababababab"} });
});

test("R97 capture declares heldrestore: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "heldrestore", declaration: DECLARED_OPS["heldrestore"], call: mk("heldrestore", {"by":"member:ann","viewer":"member:ann"}),
    refusedNaming: named({"ids":["NO_IDS"],"reason":["SET_ASIDE_NO_REASON"]}, true), values: {"ids":["INFO-2026-0001"],"reason":"because"} });
});

/* a page the scripted network serves; `acquire` fetches it as a member's direct capture (acquisition R1, R10) */
const PAGE = "https://s.example/p";
const PAGE_BODY = "<!doctype html><html><head><title>t</title></head><body><p>x</p></body></html>";

test("R97 capture declares acquire (K4206): its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts (matchedSweep, which the act never reads) is dropped", async () => {
  const net = network({ [PAGE]: () => new Response(PAGE_BODY, { headers: { "content-type": "text/html; charset=utf-8" } }) });
  try {
    const stamps = { cls: "member", member: "1", sessMember: "member:ann" };
    await declaredOpHolds({ op: "acquire", declaration: DECLARED_OPS["acquire"],
      call: async (given) => { const r = await mk("acquire", stamps)(given); return { status: r.status, ...r.body }; },
      values: { locator: PAGE }, outside: ["undeclared_field_acquire", "matchedSweep"],
      same: (x, y) => x.status === y.status && x.ok === y.ok && x.document?.capture?.sha256 === y.document?.capture?.sha256 });
  } finally { net.restore(); }
});

test("R97 capture declares captureaccount (K4206): its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  const k = await newKey();
  const d = H("c9");
  const TEXT = "I saved this page from the clerk's site at 9:14 on 1 September, logged in as myself.";
  const signature = await sshsign(k, captureAccountStatement(d, TEXT), NS_RATIFY);
  const setup = async () => {
    const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "i" } });
    f.c.recordCaptureActor({ captureSha: d, actor: "m1", at: "2026-09-01T00:00:00Z" });
    signer(f.s, "m1", k.keyB64);
    return f;
  };
  /* `text` is read but not required: an empty one is C-118.6 by its row (R69), so the call supplies the account's words as fixed */
  await declaredOpHolds({ op: "captureaccount", declaration: DECLARED_OPS["captureaccount"],
    call: (given) => mk("captureaccount", { by: "m1" }, setup)({ text: TEXT, ...given }),
    values: { captureSha: d, signature }, same: (x, y) => x.ok === y.ok && x.reason === y.reason && x.seq === y.seq });
});

test("R98 (T51; K4206; R69): captureaccount with no captureSha is the required-argument refusal naming captureSha, writing nothing; a present digest that is malformed or not one the member captured stays C-118.5", async () => {
  const k = await newKey();
  const d = H("c9");
  const TEXT = "I saved this page from the clerk's site at 9:14 on 1 September, logged in as myself.";
  const signature = await sshsign(k, captureAccountStatement(d, TEXT), NS_RATIFY);
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "i" } });
  f.c.recordCaptureActor({ captureSha: d, actor: "m1", at: "2026-09-01T00:00:00Z" });
  signer(f.s, "m1", k.keyB64);
  for (const captureSha of [undefined, null, "", "   "]) {
    const r = await f.c.recordCaptureAccount({ captureSha, text: TEXT, signature, by: "m1" });
    assert.deepEqual([r.ok, r.reason, r.argument], [false, "REQUIRED_ARGUMENT_MISSING", "captureSha"], String(captureSha));
    assert.match(r.detail, /captureSha/);
  }
  assert.equal(f.rows("SELECT COUNT(*) AS n FROM capture_accounts")[0].n, 0, "nothing written");
  /* the control: a digest that is present keeps the C-118.5 refusal, whether malformed or one no member of this record captured */
  for (const captureSha of ["not a sha", H("c2")]) {
    const r = await f.c.recordCaptureAccount({ captureSha, text: TEXT, signature, by: "m1" });
    assert.deepEqual([r.reason, r.check], ["NOT_THE_CAPTURING_ACTOR", "C-118.5"], captureSha);
  }
});

test("R98 (T51; K4206; R69): through the op an account is dated by the server, a body's at never read; an in-process caller's at is kept (the control)", async () => {
  const k = await newKey();
  const d = H("c9");
  const TEXT = "I saved this page from the clerk's site at 9:14 on 1 September, logged in as myself.";
  const signature = await sshsign(k, captureAccountStatement(d, TEXT), NS_RATIFY);
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "i" } });
  f.c.recordCaptureActor({ captureSha: d, actor: "m1", at: "2026-09-01T00:00:00Z" });
  signer(f.s, "m1", k.keyB64);
  const sent = "2001-01-01T00:00:00Z";
  const byOp = await captureOps(f.c, new URL("http://x/captureaccount?by=m1"), { captureSha: d, text: TEXT, signature, at: sent }, f.c.env).captureaccount();
  assert.equal(byOp.ok, true);
  assert.notEqual(byOp.at, sent, "the body's at is not read");
  assert.equal(f.c.captureAccountsOf(d).accounts[0].at, byOp.at, "the account keeps the server's instant");
  const inProcess = await f.c.recordCaptureAccount({ captureSha: d, text: TEXT, signature, by: "m1", at: "2026-09-02T00:00:00Z" });
  assert.deepEqual([inProcess.ok, inProcess.at], [true, "2026-09-02T00:00:00Z"], "an in-process caller's instant is kept");
});

/* K4208 (wave 3): the census reads the screens send, declared by their owner */
const HELD_SHA = "abababababababababababababababababababababababababababababababab";

test("R97 capture declares heldat (K4208): its requires alone raise no refusal naming a field, a call with neither address nor sha256 is refused naming one, and a field outside accepts is dropped", async () => {
  await declaredOpHolds({ op: "heldat", declaration: DECLARED_OPS["heldat"], call: mk("heldat", { viewer: "member:ann" }),
    refusedNaming: named({}), values: { address: "https://s.example/p", sha256: HELD_SHA } });
});

test("R97 capture declares capturegrade (K4208): its requires alone raise no refusal naming a field, a call with neither capture nor captureSha is refused naming captureSha, and a field outside accepts is dropped", async () => {
  await declaredOpHolds({ op: "capturegrade", declaration: DECLARED_OPS["capturegrade"], call: mk("capturegrade", { viewer: "member:ann" }),
    refusedNaming: (answer, field) => named({})(answer, field === "capture" ? "captureSha" : field), values: { capture: HELD_SHA, captureSha: HELD_SHA } });
});

test("R97 capture declares captureaccounts (K4208): it requires nothing (an absent digest reads as an unknown one), accepts the digest as capture or captureSha, and a field outside accepts is dropped", async () => {
  await declaredOpHolds({ op: "captureaccounts", declaration: DECLARED_OPS["captureaccounts"], call: mk("captureaccounts", { viewer: "member:ann" }),
    refusedNaming: named({}), values: { capture: HELD_SHA, captureSha: HELD_SHA } });
  /* control: the digest is read from either field, and the unknown digest answers the same lists */
  const f = await fresh({ evidence: bucket(), env: { INSTANCE_NAME: "i" } });
  const viaQuery = captureOps(f.c, new URL(`http://x/?op=captureaccounts&viewer=member:ann&capture=${HELD_SHA}`), {}, f.c.env).captureaccounts();
  const viaBody = captureOps(f.c, new URL("http://x/?op=captureaccounts&viewer=member:ann"), { captureSha: HELD_SHA }, f.c.env).captureaccounts();
  assert.deepEqual(viaQuery, viaBody);
  assert.equal(viaQuery.captureSha, HELD_SHA);
});
