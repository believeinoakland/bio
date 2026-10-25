/* store-request R16–R20 (K5046 (d), (f); K5052 (2), (8); K5054; `op-tables.md` §3.4, §5.2, §5.3): THE WORLD'S DOOR, its sign-ins
   and the recipes of real acts, over `store-assembly`'s world (its R90–R94). A screen's test asks this door what its page's
   `fetch("/api/?op=...")` asks the Worker's, and is answered what the page would receive:
     (1) the op's alias resolved, and an op with no spec refused as the real door refuses it (`UNKNOWN_OP`, 400);
     (2) the caller admitted by `admission.admit` over the bearer token the request presents (the session the real `login` made);
     (3) the store's request made by `innerRequest` (R1) from the admitted caller, by no rule of this file's own;
     (4) passed to the world (`world.send`) and decorated in `answer-envelope`'s envelope;
     (5) the ops whose real handler is a module's door arm (the arms `plane/door.mjs` composes) answered by that arm from the
         real module, handed the stamps the real hook is; the sign-in door's three by `signin-door`; the public reads by
         `public-read`; the public relays and `whoami`, which stay in `control-plane`, re-made as the store's route of that
         name with the body fields the real door passes and nothing else.
   An op that is neither a store route nor an arm this door wires is refused `{status: 501, json: {ok: false, reason:
   "WORLD_NO_DOOR_ARM", op}}`, never guessed. The ops the world cannot reach are a closed list, `WORLD_UNREACHED`, each with the
   cause (a part of `control-plane`'s own door, a later module), and R20's test holds the list closed.
   What the real door does that this one does not (stated, never hidden): no namespace, address or window gate (a world has
   one object and no address to forge); no ask grant (`grantAdmit`); no reading followed after a promotion or an upload, no
   archive's members promoted after `unpack`, no draft asked after a draft-due act (the door's own steps after the forward);
   no bootstrap credential at `claim` (store-assembly R92). The helpers `control-plane` hands its arms (`sha256Hex`,
   `captureKey`, `caseReader`) are re-made from earlier modules (record-grammar, store-assembly R2's key, admission). */
import { generateKeyPairSync } from "node:crypto";
import { OPS, OP_ALIASES, OP_STAMPS, ACT_GATE, NETWORK_NOTICES_PUBLIC_READS, CASE_CHECKER_PUBLIC_READS } from "../../../src/op-declarations/index.mjs";
import { admit, aiCredentialPresented, presentedCredential, readerOf, bearerFence, aiCredentialMint, reviewGrantSecret,
         sourceOf, countryOf, callerViewer, SCRATCH } from "../../../src/admission/index.mjs";
import { json, doAnswer, storeRefusal, storeSilent, relayAnswer, dispatchRow, requiredArgument, STORE_SILENT_REASON,
         STORE_SILENT_DETAIL } from "../../../src/answer-envelope/index.mjs";
import { subscriptionSignin, subscriptionDisconnect, signintrace, leaverOf, signoutLeaver } from "../../../src/signin-door/index.mjs";
import { publicReadDoorRead, publicReadDoorOp } from "../../../src/public-read/door.mjs";
import { publicReadOf } from "../../../src/public-read/index.mjs";
import { bindPublishedPlane } from "../../../src/publication/worker.mjs";
import { publicationDoorOp } from "../../../src/publication/door.mjs";
import { doorbellPublicOp } from "../../../src/doorbell/door.mjs";
import { attestOp } from "../../../src/attestation/index.mjs";
import { Membership } from "../../../src/membership/index.mjs";
import { bootstrapOp, INSTANCE_SETUP_OPS, instanceSetupOp } from "../../../src/setup.mjs";
import { caseRatifyStatement, NS_RATIFY } from "../../../src/sshsig.mjs";
import { MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX, createSha256 } from "../../../src/record-grammar/index.mjs";
import { affordancesOp } from "../../../src/affordances.mjs";
import { QUEUE_DOOR_OPS, queueOp } from "../../../src/queue/door.mjs";
import { registerAuditOp } from "../../../src/provenance/ops.mjs";
import { withBiasChecks } from "../../../src/bias/index.mjs";
import { GOVERNOR_OPS, governorOpResponse } from "../../../src/host-governor/index.mjs";
import { captureOp } from "../../../src/capture/ops.mjs";
import { monitorOp } from "../../../src/monitoring/index.mjs";
import { EXTRACTION_OPS, extractionOp, acquireReadingOp, pageTranscribeOp } from "../../../src/extraction/ops.mjs";
import { CONNECTIONS_OPS, connectionsOp } from "../../../src/connections/ops.mjs";
import { ratificationOp } from "../../../src/ratification/ops.mjs";
import { askOp, actionDraftOp, ACTION_DRAFT_OPS, askOnObject, draftOnObject } from "../../../src/store-assembly/index.mjs";
import { innerRequest } from "../../../src/store-request/index.mjs";
import { evidenceStorageAbsent } from "../../../src/acquisition/index.mjs";

/** R17: the address a page's relative request is read against. */
export const WORLD_ORIGIN = "https://group.example";
/** R20: the declared ops the world's door cannot answer, each with its cause; closed (R20's test fails on any other). */
export const WORLD_UNREACHED = Object.freeze({
  agentpack: "control-plane's door renders the pack (`packOf`) from the affordances arm's answer; a later module",
  airundispatch: "control-plane's door calls the object's `dispatchMemberRun` RPC, plane's Store method; no earlier module exports it",
  textcheck: "control-plane's door shapes the draft (`draft.mjs` `checkedDraft`); a later module",
  readtranslate: "control-plane's door shapes the draft (`draft.mjs` `checkedDraft`); a later module",
});
/* control-plane R2, R53, R56, R63, R66: the names a table may hold that the real door answers as an op with no spec */
const NOT_ROUTED = Object.freeze(["assistantset", "securitycount", "translationdraftrecord", "groupswitchset", "accountswitchset"]);
/* control-plane R61: the byte answers relayed as their owner gives them */
const BYTE_OPS = Object.freeze(["openoriginal", "openwithwarning", "safeview", "safecopy"]);
/* control-plane R36, R23: the ops whose refusals state their own HTTP status */
const STATED_STATUS_OPS = Object.freeze(["inbox", "inboxpull", "inboxresolve", "heldsetaside", "heldrestore"]);
/* control-plane R45, R49: the registered public reads served by public-read's door read */
const PUBLIC_DOOR_READS = Object.freeze([...NETWORK_NOTICES_PUBLIC_READS, ...CASE_CHECKER_PUBLIC_READS, "casedetailspublic"]);
const STATS_GRAIN = 100_000_000;

/* ---- the helpers control-plane hands its arms, re-made from earlier modules ---- */
const sha256Hex = async (v) => createSha256().update(typeof v === "string" ? new TextEncoder().encode(v) : new Uint8Array(v)).hex();
const captureKey = (storeName, sha) => `${storeName}/captures/${sha}`;   /* store-assembly R2: `<namespace>/captures/` */
/* control-plane's `storageAbsent`: acquisition's one complaint (`evidenceStorageAbsent`, C-68.1), enveloped */
const storageAbsent = (op, error) => { const { status, body } = evidenceStorageAbsent(op, error); return json(body, status); };
const caseReader = async (url, env, storeName, presentedAi, credential) => {
  const r = await readerOf(url, env, storeName, presentedAi, doAnswer, credential, { background: url.searchParams.get("background") === "1" });
  return r.silent ? { silent: r.silent.op, correlation: r.silent.correlation } : r;
};
const fingerprint = async (v) => (v ? (await sha256Hex(v)).slice(0, 16) : null);

let published = false;
/* store-assembly J3 (4), K5139: the published plane bound as plane's `index.mjs` binds it, the published store the record's own */
function bindPublished(world) {
  if (published) return;
  published = true;
  bindPublishedPlane({ json, doAnswer, storeSilent, storeRefusal, requiredArgument, STORE_SILENT_REASON, STORE_SILENT_DETAIL,
                       PUBLISHED_STORE: world.store.namespace() });
}

/* The object's stub as the Worker reaches it: `fetch` to the store's dispatch, and the Store's RPCs an arm asks (plane R111) */
function stubOf(world) {
  return {
    fetch: (input, init) => world.store.dispatch(input instanceof Request && init === undefined ? input : new Request(input, init)),
    ask: (args) => askOnObject(world.ctx, world.env, args || {}),
    draft: (args) => draftOnObject(world.ctx, world.env, args || {}, { read: (op, params) => world.store.read(op, params) }),
    groupFields: (args) => publicReadOf(world.ctx).groupFields(args && args.project ? { project: args.project } : {}),
  };
}
/* The Worker's environment over the world's: `STORE` answering the world's one object (a world has one), every other binding
   the world's own, read live (the clock `tick` moves) */
function envOf(world, stub) {
  return Object.create(world.env, { STORE: { value: { idFromName: (n) => n, get: () => stub }, enumerable: true } });
}

const routesOf = (world) => world.__routes || (world.__routes = new Set(Object.keys(world.store.routes(new URL("http://x/"), null))));

/* ---- the page's request, read once ---- */
async function bytesOf(v) {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "string") return v;
  if (v instanceof Uint8Array) return v;
  if (v instanceof ArrayBuffer) return new Uint8Array(v);
  if (typeof Blob !== "undefined" && v instanceof Blob) return new Uint8Array(await v.arrayBuffer());
  if (ArrayBuffer.isView(v)) return new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
  return JSON.stringify(v);   /* the harness hands a JSON body it parsed back as an object */
}
async function readPage(req, as) {
  let url, method, headers, raw;
  if (req instanceof Request) {
    url = new URL(req.url); method = req.method; headers = new Headers(req.headers);
    raw = method === "GET" || method === "HEAD" ? undefined : new Uint8Array(await req.arrayBuffer());
    if (raw && !raw.length) raw = undefined;
  } else {
    const init = req.init || {};
    url = new URL(req.url ?? `/api/?${new URLSearchParams({ op: req.op, ...(req.query || {}) })}`, WORLD_ORIGIN);
    headers = new Headers({ ...(init.headers || {}), ...(req.headers || {}) });
    raw = await bytesOf(init.body !== undefined ? init.body : req.body);
    method = (req.method || init.method || (raw === undefined ? "GET" : "POST")).toUpperCase();
  }
  if (as && as.token && !headers.has("authorization")) headers.set("authorization", `Bearer ${as.token}`);
  const text = raw === undefined ? undefined : typeof raw === "string" ? raw : null;
  const bytes = raw === undefined ? undefined : typeof raw === "string" ? new TextEncoder().encode(raw) : raw;
  const make = () => new Request(url, { method, headers, ...(bytes !== undefined && method !== "GET" && method !== "HEAD" ? { body: bytes.slice(), duplex: "half" } : {}) });
  return { url, method, headers, bytes, text: text ?? (bytes ? new TextDecoder().decode(bytes) : undefined), make };
}

/* ---- the answer, as the page receives it ---- */
async function pageAnswer(res) {
  const type = res.headers.get("content-type") || "";
  if (/json/.test(type)) {
    const text = await res.text();
    try { return { status: res.status, json: JSON.parse(text) }; } catch { return { status: res.status, bytes: new TextEncoder().encode(text), type }; }
  }
  return { status: res.status, bytes: new Uint8Array(await res.arrayBuffer()), type };
}
// fixtures-generic: WORLD_NO_DOOR_ARM (store-request R17: the world's own refusal of an op it does not reach; store-assembly R94)
const noArm = (op) => json({ ok: false, reason: "WORLD_NO_DOOR_ARM", op }, 501);

/* control-plane R61's byte answer: a served file relayed whole, a JSON answer enveloped */
async function byteAnswer(res, op, extra) {
  const file = res.headers.has("x-capture-sha256") || res.headers.has("x-derived-sha256");
  if ((res.status === 200 || res.status === 206) && file) {
    const headers = new Headers(res.headers);
    headers.set("cache-control", "no-store");
    if (!headers.has("access-control-allow-origin")) headers.set("access-control-allow-origin", "*");
    return new Response(res.body, { status: res.status, headers });
  }
  const out = await doAnswer(Promise.resolve(res));
  if (out.refused) return storeRefusal(out, extra);
  if (!out.answered) return storeSilent(op, out.correlation);
  return json({ ...out.reply.body, ...extra }, out.reply.status);
}

/** R17: the world's door, `(req, as) → {status, json} | {status, bytes, type}`. */
export function doorOf(world) {
  bindPublished(world);
  const stub = stubOf(world);
  const env = envOf(world, stub);
  return async function worldDoor(req, as = null) {
    const page = await readPage(req, as);
    return pageAnswer(await answer(world, stub, env, page));
  };
}

async function answer(world, stub, env, page) {
  const { url, method } = page;
  const path = url.pathname.replace(/^\/api\/?/, "/");
  let op = url.searchParams.get("op") || path.slice(1) || "selftest";
  if (Object.hasOwn(OP_ALIASES, op)) op = OP_ALIASES[op];
  let spec = Object.hasOwn(OPS, op) && !NOT_ROUTED.includes(op) ? OPS[op] : undefined;
  let reqBody = null;
  if (method === "POST" && page.text !== undefined) { try { reqBody = JSON.parse(page.text || "null"); } catch { reqBody = null; } }
  let resolving = false;
  if (op === "inboxresolve" && method === "POST" && reqBody && typeof reqBody === "object" && !Array.isArray(reqBody) && reqBody.status === "pulled") {
    op = "inboxpull"; spec = OPS.inboxpull; resolving = true;
  }
  /* (1) control-plane R2: byte-identical to the real door's */
  // fixtures-own: harness the world's door re-makes control-plane R2's unknown-op answer (store-request R17 (1)), the row answer-envelope's
  if (!spec) return json({ ok: false, error: "unknown op", reason: "UNKNOWN_OP", ...dispatchRow("UNKNOWN_OP"), op }, 400);
  if (Object.hasOwn(WORLD_UNREACHED, op)) return noArm(op);
  const req = page.make();
  const credential = presentedCredential({ req, url, body: reqBody });
  const presentedAi = await aiCredentialPresented(url, env, doAnswer, { credential, op });
  if (presentedAi.silent) return storeSilent(presentedAi.silent.op, presentedAi.silent.correlation);

  if (spec.classes === null) return publicAnswer({ world, stub, env, page, op, req, reqBody, credential, presentedAi });

  /* (2) admission R5–R11 in their order */
  const admitted = await admit({ url, env, op, spec, method, presented: presentedAi, doAnswer, credential, body: reqBody,
                                 background: url.searchParams.get("background") === "1" });
  if (admitted.silent) return storeSilent(admitted.silent.op, admitted.silent.correlation);
  if (admitted.refusal) return json(admitted.refusal.body, admitted.refusal.status);
  const caller = { ...admitted.caller, token: credential.token };
  const { cls, viaSession, aiCred, storeName } = caller;
  const { member: sessMember, viewer: sessViewer, identity: sessIdentity, rights: sessRights, caps: sessCaps } = caller;

  /* control-plane R18, re-made */
  if (op === "whoami") {
    return json({ ok: true, result: {
      tokenClass: cls, session: viaSession, member: viaSession ? sessMember : null,
      handle: viaSession ? (sessRights.handle ?? null) : null,
      administer: viaSession ? !!sessRights.administer : cls === "admin",
      rootOfTrust: viaSession ? !!sessRights.rootOfTrust : false,
      capabilities: viaSession ? [...sessCaps].sort() : null, vocabulary: Membership.CAPABILITIES,
      confinedTo: cls === "ai" && aiCred ? (aiCred.confinedTo ?? null) : null,
      detail: viaSession
        ? "capabilities are set by an administrator and gate what this account may DO, not what it may see"
        : "a machine credential has no member behind it and therefore holds no capabilities; it is bounded "
        + "by the operation table and by namespace confinement instead",
    }, store: storeName, tokenClass: cls }, 200);
  }
  const fenced = bearerFence(op, caller);
  if (fenced) return json(fenced.body, fenced.status);
  if (op === "purge") {
    const confirm = url.searchParams.get("confirm");
    if (confirm !== storeName)
      return json({ ok: false, ...requiredArgument("purge", "confirm", "<store name>", "purge requires confirm=<store>"),
                    expected: storeName, got: confirm, tokenClass: cls, store: storeName }, 400);
  }
  const extra = { store: storeName, tokenClass: cls };
  const actor = viaSession ? sessViewer : cls === "ai" ? `${MACHINE_CLASS_PREFIX}ai/${aiCred.tokenId}` : `${MACHINE_CLASS_PREFIX}${cls}`;
  /* control-plane R62: a member's or an `ai` credential's `op=capture` GET is a byte answer */
  if (op === "capture" && method === "GET" && (viaSession || cls === "ai")) {
    const w = url.searchParams.get("warned");
    let warned; if (w !== null) { try { warned = JSON.parse(w); } catch { warned = w; } }
    const at = new URL(`http://x/${warned === undefined ? "openoriginal" : "openwithwarning"}`);
    at.searchParams.set("capture", (url.searchParams.get("sha256") || "").toLowerCase());
    at.searchParams.set("viewer", viaSession ? sessViewer : callerViewer(caller, { carry: false }));
    return byteAnswer(await stub.fetch(new Request(at, warned === undefined ? { method: "GET" }
      : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ warned }) })), op, extra);
  }
  /* (5) the sign-in door's three, signin-door's functions over the store */
  const stored = (p, init) => doAnswer(stub.fetch(new Request(`http://do/${p}`, init)));
  if (op === "subscriptionsignin") {
    const signed = await subscriptionSignin({ env, member: actor, asked: reqBody, store: stored });
    return json(signed.body, signed.status);
  }
  if (op === "signintrace") { const traced = await signintrace({ env, store: stored }); return json(traced.body, traced.status); }
  if (op === "subscriptiondisconnect") {
    const out = await subscriptionDisconnect({ env, member: actor, store: stored });
    if (out.refused) return storeRefusal(out, extra);
    if (!out.answered) return storeSilent(op, out.correlation);
    return json({ ...out.reply.body, ...extra }, out.reply.status);
  }
  /* (5) the module arms `plane/door.mjs` composes, with the stamps its `gatedOp` hands */
  const armed = await gatedArm({ req, url, env, op, cls, viaSession, sessMember, sessViewer, sessIdentity, sessRights, sessCaps,
                                 aiCred, storeName, stub });
  if (armed) return armed;

  /* control-plane's own steps around the forward that the world re-makes: a credential's mint and a grant's secret */
  const isUpload = op === "captureupload" || op === "captureuploadpart";
  const length = /^\d+$/.test(page.headers.get("content-length") || "") ? Number(page.headers.get("content-length"))
    : isUpload && page.bytes ? page.bytes.length : null;
  const declared = OP_STAMPS[op] || [];
  const args = { op, url, method, body: isUpload ? page.bytes : (method === "POST" ? page.text : undefined), caller,
                 source: declared.includes("source") ? await sourceOf(req, env) : null,
                 country: declared.includes("country") ? countryOf(req) : null,
                 userAgent: page.headers.get("user-agent"), origin: url.origin, length, resolving, replay: null, deferred: false };
  let secret = null;
  if (op === "aicredentialmint") {
    let asked = {};
    try { asked = page.text ? JSON.parse(page.text) : {}; } catch { asked = {}; }
    const mint = await aiCredentialMint(asked, cls);
    if (mint.refusal) return json(mint.refusal.body, mint.refusal.status);
    secret = mint.secret;
    args.mint = { writes: mint.writes, confinedTo: mint.confinedTo, secretSha: mint.secretSha };
  }
  if (op === "reviewgrant" || op === "templatereviewgrant") {
    const made = await reviewGrantSecret();
    secret = made.secret; args.secretSha = made.secretSha;
  }
  /* (3) the store's request, by innerRequest alone */
  const made = innerRequest(args);
  if (made.refusal) return json(made.refusal.body, made.refusal.status);
  if (!routesOf(world).has(new URL(made.url).pathname.slice(1))) return noArm(op);
  /* (4) to the world, and the answer enveloped */
  const headers = { ...made.headers, ...(isUpload ? { "content-type": "application/octet-stream" } : {}) };
  const res = await world.send({ url: made.url, body: made.body ?? null, headers, method: isUpload ? "POST" : method });
  if (BYTE_OPS.includes(op)) return byteAnswer(res, op, extra);
  const out = await doAnswer(Promise.resolve(res));
  if (out.refused) return storeRefusal(out, op === "aicredentialmint" || op === "reviewgrant" || op === "templatereviewgrant" ? { op, ...extra } : extra);
  if (!out.answered) return storeSilent(op, out.correlation);
  const { body, status } = out.reply;
  if (secret !== null) {
    if (!body.result || body.result.ok !== true) return json({ ok: false, ...(body.result || {}), op, ...extra }, 403);
    return json({ ok: true, result: { ...body.result, ...(op === "aicredentialmint" ? { token: secret } : { secret }) }, ...extra }, 200);
  }
  if (op === "stats" && cls !== "admin" && viaSession && sessRights.administer && body.result && typeof body.result.dbBytes === "number")
    return json({ ...body, result: { ...body.result, dbBytes: Math.floor(body.result.dbBytes / STATS_GRAIN) * STATS_GRAIN }, ...extra }, status);
  const leaver = leaverOf(op, reqBody, body.result, actor);
  if (leaver) await signoutLeaver(env, leaver);
  if ((op === "inboxget" || op === "inboxresolve") && body.result?.ok === false && body.result.reason === "NO_SUCH_KNOCK")
    return json({ ...body, ...extra }, 404);
  const hinted = body.result?.status;
  if (STATED_STATUS_OPS.includes(op) && body.result?.ok === false && Number.isInteger(hinted) && hinted >= 400 && hinted < 600)
    return json({ ...body, ...extra }, hinted);
  return json({ ...body, ...extra }, status);
}

/* plane/door.mjs `gatedOp`: the admitted ops whose handler is a module's door arm, with the same stamps; undefined for the forward */
async function gatedArm({ req, url, env, op, cls, viaSession, sessMember, sessViewer, sessIdentity, sessCaps, aiCred, storeName, stub }) {
  const store = () => stub;
  const viewer = viaSession ? sessViewer : cls === "ai" ? aiCred.principal : `${MACHINE_CLASS_PREFIX}${cls}`;
  const identity = viaSession ? sessIdentity : cls === "ai" ? aiCred.principal : `${MACHINE_CLASS_PREFIX}${cls}`;
  const author = viaSession ? sessMember : cls === "ai" ? `${MACHINE_CLASS_PREFIX}ai/${aiCred.tokenId}` : `${MACHINE_AUTHOR_PREFIX}${cls}`;
  const by = viaSession ? sessMember : cls === "ai" ? `${MACHINE_CLASS_PREFIX}ai/${aiCred.tokenId}` : `${MACHINE_CLASS_PREFIX}${cls}`;
  const grantMember = aiCred?.grant ? aiCred.principal : undefined;
  if (op === "ask") return askOp({ req, url, env, viaSession, sessMember, grantMember });
  if (ACTION_DRAFT_OPS.includes(op)) return actionDraftOp({ req, url, env, op, viaSession, sessMember, sessViewer });
  if (op === "affordances")
    return affordancesOp(url, store(), { json, doAnswer, storeSilent, storeRefusal, gate: ACT_GATE, viewer, identity, author, by, storeName, cls });
  if (QUEUE_DOOR_OPS.includes(op)) return queueOp(op, url, store, { json, doAnswer, storeRefusal, storeSilent, gate: ACT_GATE,
    storeName, cls, viewer, member: viaSession ? sessMember : "" });
  if (op === "registeraudit") return registerAuditOp(env, store(), { json, doAnswer, storeSilent, storeRefusal, captureKey, storeName, cls });
  if (INSTANCE_SETUP_OPS.includes(op)) return instanceSetupOp(op, url, env, storeName, { cls, scratch: SCRATCH, json, doAnswer,
    storeSilent, storeRefusal, viewer });
  if (CONNECTIONS_OPS.includes(op)) return connectionsOp(op, url, store, { json, doAnswer, storeRefusal, storeSilent, viewer, identity });
  if (GOVERNOR_OPS.includes(op)) return governorOpResponse(op, url, store, { json, doAnswer, storeRefusal, storeSilent });
  {
    const c = await captureOp(op, req, url, env, store, { json, storeSilent, storeRefusal, doAnswer, storageAbsent, requiredArgument,
      cls, member: viaSession, sessMember, storeName, key: (s) => captureKey(storeName, s), viewer, timings: op === "acquire" ? {} : null, trace: null,
      readAcquired: (answer, st) => acquireReadingOp(answer, st, { json, storeSilent, storeRefusal, doAnswer, storeName }) });
    if (c) return c;
  }
  if (EXTRACTION_OPS.includes(op)) return extractionOp(op, url, env, store, { json, storeSilent, storeRefusal, doAnswer, storageAbsent,
    requiredArgument, cls, session: viaSession, caps: sessCaps, viewer, author, storeName });
  if (op === "pagetranscribe") return pageTranscribeOp(url, env, store(), { json, storeSilent, storeRefusal, doAnswer, storageAbsent,
    requiredArgument, cls, session: viaSession, caps: sessCaps, viewer, author, storeName, trace: null, memberRef: null });
  if (op === "attest") return attestOp(req, env, store(), { json, doAnswer, storageAbsent, captureKey, storeName, cls });
  if (op === "monitor") return monitorOp(req, store(), { json, storeSilent, storeRefusal, requiredArgument, doAnswer, viaSession, sessViewer, storeName, cls });
  return ratificationOp(op, req, stub, { env, json, doAnswer, storeSilent, storeRefusal, storeName, cls, aiCred, viaSession,
    sessViewer, sessRights: {}, withBiasChecks, STORE_SILENT_REASON, STORE_SILENT_DETAIL });
}

/* The unauthenticated ops: control-plane's relays re-made (the body fields the real door passes and nothing else), the public
   reads, the public arms `plane/door.mjs`'s `publicOp` asks in turn, and any other public store route through innerRequest with
   no caller (R23's secret digest its only stamp). */
async function publicAnswer({ world, stub, env, page, op, req, reqBody, credential, presentedAi }) {
  const { url } = page;
  const source = typeof env.KNOCK_FINGERPRINT_KEY === "string" && env.KNOCK_FINGERPRINT_KEY ? await sourceOf(req, env) : null;
  const country = countryOf(req);
  const doorStamps = new URLSearchParams({ ...(source ? { source } : {}), ...(country ? { country } : {}) }).toString();
  const o = reqBody && typeof reqBody === "object" && !Array.isArray(reqBody) ? reqBody : {};
  const relay = (p, body, op2 = op) => relayAnswer(stub.fetch(new Request(`http://do/${p}`, { method: "POST", body: JSON.stringify(body) })), op2);
  if (op === "claim") {
    const fp = await fingerprint(env.ADMIN_TOKEN);
    return relay(`claim?fp=${fp}${doorStamps ? `&${doorStamps}` : ""}`, { handle: o.handle, password: o.password });
  }
  if (op === "login") return relay(`login${doorStamps ? `?${doorStamps}` : ""}`, { handle: o.handle, password: o.password, device: o.device });
  if (op === "recover") return relay(`recover${doorStamps ? `?${doorStamps}` : ""}`, { role: o.role, handle: o.handle, code: o.code, password: o.password });
  if (op === "passwordresetlook" || op === "passwordreset")
    return relay(`${op}${doorStamps ? `?${doorStamps}` : ""}`, op === "passwordreset" ? { link: o.link, password: o.password } : { link: o.link });
  if (op === "invitelook" || op === "enroll") return relay(op, reqBody && typeof reqBody === "object" ? reqBody : {});
  if (op === "grouplanguages") return relayAnswer(stub.fetch(new Request("http://do/grouplanguages", { method: "GET" })), op);
  if (op === "websiteinvite") return relay(op, { key: o.key, cover: o.cover, approvedBy: o.approvedBy });
  if (op === "joinlinkinvite") return relay(op, { link: o.link, cover: o.cover });
  const storeName = url.searchParams.get("store") === SCRATCH ? SCRATCH : "bio";
  if (op === "groupdescription" || op === "handlecheck") {
    const reader = await caseReader(url, env, storeName, presentedAi.cred, credential);
    if (reader.silent) return storeSilent(reader.silent, reader.correlation);
    if (op === "groupdescription") return relayAnswer(stub.fetch(`http://do/groupdescription?viewer=${encodeURIComponent(reader.viewer)}`), op);
    return relayAnswer(stub.fetch(new Request(`http://do/handlecheck?viewer=${encodeURIComponent(reader.viewer)}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ invite: o.invite, handle: o.handle }) })), op);
  }
  if (PUBLIC_DOOR_READS.includes(op)) {
    const clean = new URL(url);
    for (const k of ["grant", "session", ...(OP_STAMPS[op] || [])]) clean.searchParams.delete(k);
    return publicReadDoorRead(op, clean, env, stub, { json, requiredArgument, storeSilent, storeRefusal, doAnswer });
  }
  { const pr = await publicReadDoorOp(op, url, env, stub, { json, requiredArgument, storeSilent, storeRefusal, doAnswer }); if (pr) return pr; }
  { const pd = await publicationDoorOp(op, url, stub, { json, storeSilent, storeRefusal, doAnswer, sha256Hex, NS_RATIFY, caseRatifyStatement,
      readerOf: () => caseReader(url, env, "bio", presentedAi.cred, credential), body: () => req.clone().json() }); if (pd) return pd; }
  { const knocked = await doorbellPublicOp(op, req, env, stub, { json, requiredArgument, storeSilent, storeRefusal, doAnswer, country }); if (knocked) return knocked; }
  if (op === "bootstrap") {
    let caller = null;
    try {
      const reader = await caseReader(url, env, "bio", presentedAi.cred, credential);
      if (!reader.silent) {
        const viewer = (reader.cls === "member" || reader.cls === "admin") && typeof reader.viewer === "string" && reader.viewer !== ""
                       && !reader.viewer.startsWith(MACHINE_CLASS_PREFIX) ? reader.viewer : null;
        if (reader.cls === "admin" || viewer) caller = { ...(reader.cls === "admin" ? { cls: "admin" } : {}), ...(viewer ? { viewer } : {}) };
      }
    } catch { caller = null; }
    return bootstrapOp(url, env, await fingerprint(env.ADMIN_TOKEN), { stub, json, storeSilent, storeRefusal, doAnswer, caller });
  }
  /* any other public store route: innerRequest with no caller, a presented secret's digest its one stamp (R23) */
  const bySecret = credential.secret !== null;
  const made = innerRequest({ op, url, method: page.method, body: page.method === "POST" ? page.text : undefined, caller: null,
                              bySecret, secretSha: bySecret ? await sha256Hex(credential.secret || "") : null });
  if (made.refusal) return json(made.refusal.body, made.refusal.status);
  if (!routesOf(world).has(new URL(made.url).pathname.slice(1))) return noArm(op);
  return relayAnswer(world.send({ url: made.url, body: made.body ?? null, headers: made.headers, method: page.method }), op);
}

/** R20: whether the world's door answers `op` through an arm or function of its own (class (b)); a store route is class (a). */
export function worldAnswers(op) {
  return ["whoami", "subscriptionsignin", "signintrace", "subscriptiondisconnect", "ask", "affordances", "registeraudit", "attest",
          "monitor", "pagetranscribe", "claim", "login", "recover", "passwordresetlook", "passwordreset", "invitelook", "enroll",
          "grouplanguages", "websiteinvite", "joinlinkinvite", "groupdescription", "handlecheck", "bootstrap",
          /* capture's arm (`capture`, `links`), ratification's (`ratify`), public-read's public arm (`publishedbytes`, `credit`) */
          "capture", "links", "ratify", "publishedbytes", "credit",
          ...ACTION_DRAFT_OPS, ...QUEUE_DOOR_OPS, ...INSTANCE_SETUP_OPS, ...CONNECTIONS_OPS, ...GOVERNOR_OPS, ...EXTRACTION_OPS,
          ...PUBLIC_DOOR_READS].includes(op);
}

/* ---- R16: real sign-ins ---- */

const resultOf = (a) => (a && a.json && a.json.result !== undefined ? a.json.result : a && a.json);
const refusedAct = (op, a) => new Error(`storeWorld: ${op} was refused: ${JSON.stringify(a && (a.json ?? a.type)).slice(0, 400)}`);
const passwordOf = (handle) => `${handle}-world-passphrase`;

/** R16: `signIn(world, handle, {admin?, capabilities?, device?})` → `{handle, member, token, password, session, act, read}`, by the real acts:
 *  the founder by `login` with the claim's password; any other member by the founder's `memberadd`, the invitation's `enroll` with
 *  her own password, then `login` (with `adminendorse` for `admin: true` and `membercaps` for `capabilities`). */
export async function signIn(world, handle, { admin = false, capabilities = null, device = "own" } = {}) {
  const door = doorOf(world);
  const passwords = world.__passwords || (world.__passwords = new Map());
  const founderHandle = world.founder && world.founder.handle ? world.founder.handle : null;
  const isFounder = handle === "admin" || handle === founderHandle;
  if (!world.claimed) throw new Error("storeWorld: signIn needs a claimed world");
  const call = async (op, as, { query = {}, body } = {}) => {
    const a = await door({ url: `/api/?${new URLSearchParams({ op, ...query })}`, init: body === undefined ? { method: "GET" }
      : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } }, as);
    const r = resultOf(a);
    if (a.status >= 400 || !a.json || a.json.ok === false || (r && r.ok === false)) throw refusedAct(op, a);
    return r;
  };
  const login = async (h, password) => {
    const r = await call("login", null, { body: { handle: h, password, device } });
    return { token: r.token, expires: r.expires };
  };
  let member;
  if (isFounder) {
    member = "admin";
  } else if (!passwords.has(handle)) {
    const founder = world.__founderSession || (world.__founderSession = await login(founderHandle || "admin", world.password));
    const as = { token: founder.token };
    /* an administrator is proposed by `memberadd` with role `admin` (changing administrators asks the founder's password again,
       `reauth`, as the page's re-ask does); while the team has two or more, the proposal is an invitation only once every
       administrator has endorsed it (`adminendorse`, membership's 4.7), each by her own session */
    if (admin) await call("reauth", as, { body: { password: world.password } });
    const raw = await door({ url: `/api/?${new URLSearchParams({ op: "memberadd" })}`, init: { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ memberId: handle, cover: `the world's member ${handle}`, ...(admin ? { role: "admin" } : {}) }) } }, as);
    let added = resultOf(raw);
    if (added && added.reason === "CONSENSUS_REQUIRED") {
      for (const other of added.awaiting || []) {
        const theirs = await login(other, passwords.get(other));
        await call("reauth", { token: theirs.token }, { body: { password: passwords.get(other) } });
        const voted = await door({ url: `/api/?${new URLSearchParams({ op: "adminendorse" })}`, init: { method: "POST",
          headers: { "content-type": "application/json" }, body: JSON.stringify({ memberId: handle }) } }, { token: theirs.token });
        added = resultOf(voted);
        if (added && added.reason !== "CONSENSUS_REQUIRED" && !added.invite) throw refusedAct("adminendorse", voted);   /* a vote short of the last answers CONSENSUS_REQUIRED */
      }
    }
    if (!added || added.ok === false || !added.invite) throw refusedAct("memberadd", raw);
    const password = passwordOf(handle);
    await call("enroll", null, { body: { invite: added.invite, handle, password } });
    passwords.set(handle, password);
    if (admin) (world.__admins || (world.__admins = [])).push(handle);
    if (capabilities) await call("membercaps", as, { body: { memberId: handle, capabilities } });
    member = handle;
  } else member = handle;
  const signed = await login(isFounder ? (founderHandle || "admin") : handle, isFounder ? world.password : passwords.get(handle));
  const me = { handle, member, token: signed.token, password: isFounder ? world.password : passwords.get(handle),
               session: { t: signed.token, e: typeof signed.expires === "number" ? signed.expires : Date.parse(signed.expires) || 0, d: device === "own" ? "own" : "shared", w: handle } };
  me.act = (op, { query = {}, body = {} } = {}) => call(op, me, { query, body });
  me.read = (op, { query = {} } = {}) => call(op, me, { query });
  return me;
}

/** R18: `bootOf(world, as)` → `{door, session}` for interface-shell's `boot({screens, door, session})`. */
export function bootOf(world, as) {
  const door = doorOf(world);
  return { door: (req) => door(req, as), session: as ? as.session : null };
}

/* ---- R19: recipes of real acts ---- */

const hex = (s) => createSha256().update(typeof s === "string" ? new TextEncoder().encode(s) : s).hex();
const instant = (world) => new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");

/** R19: a file the member holds: `captureupload` of the text, `allocid` for an `INFO` id, and `promote` of an information bundle
 *  at `collected`, filed under `project` when given, as the capture screen promotes it. Answers `{sha, bundle}`. */
export async function hold(world, as, name, text, project = "") {
  const door = doorOf(world);
  const bytes = new TextEncoder().encode(text);
  const up = await door({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: name, name })}`,
                          init: { method: "POST", headers: { "content-type": "text/plain" }, body: bytes } }, as);
  const doc = resultOf(up) && resultOf(up).document;
  if (!doc || !doc.capture) throw refusedAct("captureupload", up);
  const now = instant(world);
  const minted = await as.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } });
  const id = minted.id + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const sha = doc.capture.sha256;
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(name), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(sha),
    "source:", "  locator: " + JSON.stringify(doc.locator || "upload"), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    ...(project ? ["project: " + project] : []), "---", "", "## Summary", "", name, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [doc] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator || "upload", sha256: sha }] });
  const len = (s) => new TextEncoder().encode(s).length;
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: hex(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture.bytes }];
  const register = [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }];
  const made = await as.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "information", title: name, current_state: "collected", created: now, last_updated: now }, files, register } });
  return { sha, bundle: made.bundleId || id };
}

/** R19: a project, started as Home's "Start a project" starts it (`promote` of its document with no base). Answers its bundle id. */
export async function project(world, as, title) {
  const now = instant(world);
  const text = "---\nobject_type: project\ntitle: " + JSON.stringify(title) + "\nobjective: " + JSON.stringify(title) + "\ncurrent_state: forming\ncreated: \"" + now
    + "\"\nlast_updated: \"" + now + "\"\n---\n\n## Session Log\n\n### Session " + now + " | Formation | interactive\nTrigger: test\nChanges: created.\n";
  const made = await as.act("promote", { body: { base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(title).slice(0, 8),
    meta: { object_type: "project", title, current_state: "forming", created: now, last_updated: now }, files: [{ path: "bundle.md", text }], register: [], visibility: "discoverable" } });
  return made.bundleId;
}

/** R19: a money trail for the project (`createset` with `purpose: "trail"`). Answers the set's id. */
export async function trail(world, as, projectId, label = "Stormwater trail") {
  const made = await as.act("createset", { body: { purpose: "trail", label, concerns: projectId } });
  return made.set_id;
}

/** R19: the profiles the team's administrator makes active (`profilesset`). Answers its answer. */
export async function profiles(world, as, ids) {
  return as.act("profilesset", { body: { profiles: ids } });
}

/** R19 (J5, K5163): `queue(world, {obligations?, findings?, conditions?})` → `{obligations: [ids], findings: [], conditions: []}`: the founder's
 *  queue made to hold that many obligations, by real acts: a member, `ruth`-like and made for the purpose, registers a signing key of
 *  her own for each (`signerregisterown`, which tells every administrator: an OBLIGATION `signer-self-registered`, `queue-producers`
 *  R14). A finding or a condition is raised by acts that need a project's dated actions or a recorded observation, which no act of the
 *  door makes alone: asking for one is refused naming it, never guessed (the world's rule for an arm no test needs). */
export async function queue(world, { obligations = 0, findings = 0, conditions = 0 } = {}) {
  if (findings > 0 || conditions > 0)
    throw new Error(`storeWorld: recipes.queue makes obligations only; ${findings} findings and ${conditions} conditions asked, and no act of the door raises one by itself`);
  const founder = await signIn(world, "admin");
  const holder = await signIn(world, "queue-member");
  const made = [];
  for (let i = 0; i < obligations; i++) {
    const raw = generateKeyPairSync("ed25519").publicKey.export({ format: "der", type: "spki" }).subarray(-32);
    const part = (b) => Buffer.concat([Buffer.from([0, 0, 0, b.length]), b]);
    const keyB64 = Buffer.concat([part(Buffer.from("ssh-ed25519")), part(raw)]).toString("base64");
    await holder.act("signerregisterown", { body: { keyB64, comment: `key ${i + 1}` } });
    made.push(`OBLIGATION::signer-self-registered::${keyB64}`);
  }
  return { obligations: made, findings: [], conditions: [] };
}

/** R1's callers, as the door has them: `admission.admit`'s answer for `op` over the world's store, for a request presenting
 *  `token` (a session's, a binding's or an agent credential's), with the presented token as `token`; throws on a refusal. */
export async function admittedAs(world, token, op = "search") {
  const stub = stubOf(world), env = envOf(world, stub);
  const url = new URL(`${WORLD_ORIGIN}/api/?op=${op}`);
  const req = new Request(url, { headers: token ? { authorization: `Bearer ${token}` } : {} });
  const credential = presentedCredential({ req, url, body: null });
  const presented = await aiCredentialPresented(url, env, doAnswer, { credential, op });
  const a = await admit({ url, env, op, spec: OPS[op], method: "GET", presented, doAnswer, credential, body: null });
  if (!a.caller) throw new Error(`storeWorld: ${op} did not admit the caller: ${JSON.stringify(a.refusal || a.silent).slice(0, 300)}`);
  return { ...a.caller, token: credential.token };
}

/** R20: of the declared names given, those the world's door reaches in neither class (a key of the assembled route map, after
 *  alias resolution and R2's renames, or an arm or function of the door's own) and that `WORLD_UNREACHED` does not name. */
export function unreachedOf(world, names) {
  const routes = routesOf(world);
  return names.filter((declared) => {
    const op = Object.hasOwn(OP_ALIASES, declared) ? OP_ALIASES[declared] : declared;
    return !routes.has(innerRequest({ op, url: "http://x/" }).url.slice("http://x/".length).split("?")[0]) && !worldAnswers(op)
      && !Object.hasOwn(WORLD_UNREACHED, op);
  });
}
