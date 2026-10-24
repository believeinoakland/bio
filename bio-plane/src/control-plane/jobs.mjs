/* control-plane R130 (fix round 9, G126a-c; K4811 (6), K4835 (2); plane R97, R98): THE REGISTERED JOB ROW, and a registration that fails is never swallowed.
   The door registers a document's `reading` row (and an archive's `unpack` row) through the store-internal route `pendingadd`, which answers plane's registrar
   (`registerJob`) as `{ok: true}` or `{ok: false, reason}` (`PENDING_NOT_KEPT`, `PENDING_MALFORMED`). The answer is READ. A throw, a silence or a refusal is
   tried once more through a fresh stub (`env.STORE.get(id)` again: a stub a reset has broken stays broken, G98), and when the row still cannot be written the
   caller is told so (`{ok: false, reason}`) and says no `reading_pending`, which is true exactly while a row is held. Each failed try writes
   `{event: "pendsha_failed", kind, sha, name, message}` BEFORE the retry, so a long await never loses the line (R-LOG); no line holds a secret: a kind, a
   digest, the registrar's reason, a short message of the error. */
import { storeStub } from "../store-place.mjs";
import { doAnswer } from "../answer-envelope/index.mjs";

const SHA = /^[0-9a-f]{64}$/;
const KINDS = Object.freeze(["reading", "ocr", "unpack", "keep"]);

async function ask(stub, kind, sha, storeName, project = null) {
  try {
    const a = await doAnswer(stub.fetch(new Request(`http://do/pendingadd?kind=${kind}&sha=${sha}&store=${encodeURIComponent(storeName)}${project ? `&project=${encodeURIComponent(project)}` : ""}`, { method: "POST" })));
    if (a.answered && a.result && a.result.ok === true) return { ok: true };
    const reason = a.answered ? (typeof a.result?.reason === "string" ? a.result.reason : "PENDING_NOT_KEPT")
      : a.refused ? (typeof a.reply?.body?.reason === "string" ? a.reply.body.reason : "PENDING_REFUSED") : "STORE_DID_NOT_ANSWER";
    return { ok: false, reason: reason.slice(0, 80), message: String(a.result?.detail ?? "").slice(0, 160) };
  } catch (e) {
    return { ok: false, reason: "REGISTER_THREW", message: String((e && e.message) || e).slice(0, 160) };
  }
}

/** `jobRegistrar({stub, env, storeName, log})` -> `async register(sha, kind = "reading", name = null) -> {ok: true, retried?: true} | {ok: false, reason}`. `stub` is
 *  the request's own stub; the retry's is made again from `env` (`storeStub`), so a stub that stays broken is not asked twice. `log` writes one JSON line (default
 *  `console.log`). */
export function jobRegistrar({ stub, env, storeName = "bio", log = (line) => console.log(JSON.stringify(line)) } = {}) {
  return async function register(sha, kind = "reading", name = null, project = null) {
    if (typeof sha !== "string" || !SHA.test(sha) || !KINDS.includes(kind)) return { ok: false, reason: "JOB_SHA_INVALID" };
    const failed = (r) => { try { log({ event: "pendsha_failed", kind, sha, name: typeof name === "string" ? name.slice(0, 120) : null, message: r.message || r.reason }); } catch { /* a log is status */ } };
    let r = await ask(stub, kind, sha, storeName, project);
    if (r.ok) return r;
    failed(r);
    let fresh = null;
    try { fresh = env ? storeStub(env, storeName) : null; } catch { fresh = null; }
    if (!fresh) return { ok: false, reason: r.reason };
    r = await ask(fresh, kind, sha, storeName, project);
    if (r.ok) return { ok: true, retried: true };
    failed(r);
    return { ok: false, reason: r.reason };
  };
}
