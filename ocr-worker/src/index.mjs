/* ocr-worker — the THIRD member of the function-specific Worker fleet (I9).
 *
 * WHY THIS EXISTS, AND WHY IT IS A MEMBER RATHER THAN CODE IN THE PLANE.
 * DEC-35 ruled the in-account path the DEFAULT for Tier-3 OCR and ruled the
 * plane and `pdf-worker` OUT by bundle size; DEC-42 named wasm tesseract as the
 * engine and left it blocked only on the Free CPU ceiling, which Workers Paid
 * removes; CPDF-14 exhausted the Moondream candidates with a NO-GO on the one
 * thing this record cannot do without (a rectangle that comes back about half
 * the time cannot anchor a claim); and CPDF-15 MEASURED the remaining candidate
 * on the deployed runtime and returned GO. So the engine is `tesseract-wasm`, it
 * carries ~5.95 MB of wasm and language model that must never enter the plane's
 * module graph, and it lives here.
 *
 * WHAT IT DOES. Given a capture sha, a store namespace and the pages that have
 * no text layer, it reads the captured bytes FROM R2 ITSELF (the `CAPTURES` read
 * binding — never handed the bytes, I6's rule and the same reason), renders ONE
 * page to pixels through CPDF-12's renderer, runs the engine over that frame,
 * and answers with per-word regions each carrying the image region a reader can
 * check them against.
 *
 * ===================================================================== *
 * WHAT IT MUST NOT DO — fleet rules 2/3, inherited from I6 and I8
 * ===================================================================== *
 *
 *   - WRITE ANYTHING. No register row, no provenance, no capture, no task. It
 *     holds no STORE (Durable Object) binding, so it structurally CANNOT write
 *     the record, and it never calls `.put`/`.delete` on R2 (asserted in the
 *     suite behaviourally AND by a source scan). It returns derived text and the
 *     PLANE decides what it means: a hop a component can hand us is a hop a
 *     component can invent (D-112).
 *   - Hold a `PUBLISHED` binding. `CAPTURES` read is the whole of its need.
 *   - Be reached by anything but the plane. No member-facing surface, no token
 *     classes of its own; the plane's op layer is the authorisation boundary.
 *   - **CLAIM ANYTHING ABOUT ITS OWN FIDELITY THAT IS NOT A MEASUREMENT.** This
 *     is the rule this member has that neither sibling does, because it is the
 *     first one whose output the record GRADES. `cap` and `measured_by` come
 *     from `transcribe.mjs`'s two named constants, both pointing at CPDF-15's
 *     row; a confidence number is passed through only where a classic decoder
 *     computed it and is the STATED string `none` otherwise. The plane refuses
 *     this member's answer outright if either is missing — `ocrTextFromMember`
 *     is the fence and it was built before this member existed.
 *
 * It versions and rolls out on its own (fleet rule 4), so `GET /version` exists
 * and reads `env.VERSION` — the build that is RUNNING, never a constant compiled
 * in beside it. DS-2's authority (D-116) is what keeps that value honest across
 * the fleet: this member's `package.json` and `wrangler.jsonc` are its two
 * declaring sites and `resolveversion.test.mjs` refuses a tree where they and
 * the plane disagree, in BOTH directions.
 */
import { transcribeRequest, REFUSALS } from "./transcribe.mjs";
import { ENGINE_NAME, ENGINE_VERSION, MODEL_NAME, engineCheck } from "./tessengine.mjs";

/* The member's surface, declared for the fleet-coverage instrument to read the
 * same way it reads the plane's OPS table (scripts/coverage.mjs, D-117).
 *
 * `mutating` is FALSE on every row and that is a `--strict` GATE rather than a
 * convention (fleet rule 2: a member ASSERTS nothing). Both rows could not be
 * anything else — `transcribe` reads bytes and returns text, `version` reads one
 * env var. */
export const SURFACE = {
  transcribe: { method: "POST", mutating: false },
  version:    { method: "GET",  mutating: false },
};

/* D-478 — THE NAMESPACES THIS MEMBER WILL READ FROM: EXACTLY `bio` OR `scratch`, AND NOTHING ELSE.
 *
 * WHAT WAS WRONG, AND WHY IT IS A RECORD DEFECT RATHER THAN A WRITE DEFECT. The store test here read
 * `/^[a-z0-9_-]+$/i` — "a namespace token" — so `biosmoke`, `Scratch` and any other well-shaped name was accepted
 * and spent as the R2 key prefix `<store>/captures/<sha>`. Nothing was ever written (this member holds no STORE
 * binding and never calls .put/.delete; IC-237 measured it), so the bucket was safe — but the ANSWER was not: a
 * bucket with no key under a prefix that does not exist answers the same 404 `NOT_FOUND` as a capture genuinely
 * absent from a real namespace. That is the conflation CLAUDE.md §1 names outright — *not found* is not *absent* —
 * and this member is the one where it costs most, because its whole output is GRADED: a page reported unread
 * because the capture "was not there" is a fact about the document, and the truth was a fact about the NAME.
 *
 * WHY THE PLANE'S SPELLING IS HONEST HERE. The plane's set is not per instance: `namespaceGate` holds
 * `Object.freeze(["bio", SCRATCH])` in code, so the fact this member states — "no such namespace exists" — is the
 * same fact on every instance it can be bound to (D-456, C-78.1, IC-237; `agent-worker`'s member half is
 * D-462/IC-253 and this is the I9 half of the same guard). It is kept here as a COPY because a fleet member
 * cannot import the plane's `index.mjs`, and a copy ages; `test/ocr-worker.test.mjs` §6 reads the plane's
 * `NAMESPACES` from its source and requires this set to equal it, so the day the plane gains a namespace this
 * member's suite goes red. The set is exact and case-sensitive for the plane's reason: a Durable Object name, and
 * an R2 key, is an exact string.
 *
 * NOT NAMING ONE IS A DIFFERENT CONDITION and keeps its old code, BAD_STORE — now the condition it always claimed
 * to be: `store` ABSENT or not a string. An empty `store: ""` is a NAMED value and meets NAMESPACE_UNKNOWN with
 * the rest, which is the same line `agent-worker` and `pdf-worker` draw. */
const NAMESPACES = Object.freeze(["bio", "scratch"]);

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });

/* THE CONFIDENCE FLOOR, AND WHY ITS DEFAULT IS `null` RATHER THAN A NUMBER.
 *
 * `null` means THIS ENGINE REPORTS CONFIDENCE AND THIS RECORD HAS MEASURED NO
 * THRESHOLD ON IT, which is a statement and not an omission. Inventing a cutoff
 * would be the costs-nothing class one level up from the pseudo-confidence
 * DEC-35 forbids: the number would be the engine's, the THRESHOLD would be ours,
 * and nothing would have measured that a word below it is wrong.
 *
 * What carries a floorless region instead is the engine's measured `cap`, which
 * is DEC-35's own named alternative — and it is worth more here than a guessed
 * threshold would be, because CPDF-15 measured that this engine SELF-REFUSES
 * rather than emitting confident garbage: the empty string on uniform noise, the
 * empty string at CPDF-11's R3 rung where the local floor engine emitted 674
 * characters and MINTED FOURTEEN DIGITS.
 *
 * It is settable per instance (`env.OCR_CONFIDENCE_FLOOR`) so a group that HAS
 * measured one can apply it, and the member states which case it is in. The
 * discard itself is not implemented here and must not be: `applyConfidenceFloor`
 * in `bio-plane/src/textchain.mjs` owns rule 4, it DELETES the text of a floored
 * region rather than flagging it, and a second copy of that rule in a member is
 * how the two come to disagree. */
function floorFrom(env) {
  const raw = env && env.OCR_CONFIDENCE_FLOOR;
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : null;
}

async function handleTranscribe(req, env) {
  if (typeof env.CAPTURES?.get !== "function")
    return json({ ok: false, reason: "R2_NOT_CONFIGURED", detail: REFUSALS.R2_NOT_CONFIGURED }, 503);

  const body = await req.json().catch(() => null);
  const sha = typeof body?.capture_sha === "string" ? body.capture_sha.toLowerCase() : "";
  const store = typeof body?.store === "string" ? body.store : "";
  if (!/^[0-9a-f]{64}$/.test(sha))
    return json({ ok: false, reason: "BAD_SHA", detail: REFUSALS.BAD_SHA }, 400);
  if (typeof body?.store !== "string")
    return json({ ok: false, reason: "BAD_STORE", detail: REFUSALS.BAD_STORE }, 400);
  /* D-478: a NAMED namespace that is not exactly one of NAMESPACES — `biosmoke`, `Scratch`, the empty string — is
     refused by the plane's own code, with `asked` and `namespaces` beside it, and R2 was never touched. Before
     this, such a name reached R2 as a key prefix and came back NOT_FOUND. */
  if (!NAMESPACES.includes(store))
    return json({ ok: false, reason: "NAMESPACE_UNKNOWN", detail: REFUSALS.NAMESPACE_UNKNOWN,
                  asked: store.slice(0, 80), namespaces: [...NAMESPACES] }, 400);
  const pages = Array.isArray(body?.pages) ? body.pages : null;
  if (!pages || !pages.length)
    return json({ ok: false, reason: "BAD_PAGES", detail: REFUSALS.BAD_PAGES }, 400);

  // I1 §2: the R2 key shape, the same load-bearing dependency `pdf-worker`
  // consumes. READ ONLY — never head/put/delete.
  const obj = await env.CAPTURES.get(`${store}/captures/${sha}`);
  if (!obj) return json({ ok: false, reason: "NOT_FOUND", detail: REFUSALS.NOT_FOUND, capture_sha: sha, store }, 404);
  const bytes = new Uint8Array(await obj.arrayBuffer());

  const out = await transcribeRequest(bytes, pages, {
    confidenceFloor: floorFrom(env),
    psm: env && env.OCR_PSM ? env.OCR_PSM : null,
  });
  /* A REFUSAL IS A 200 CARRYING `ok:false`, NOT AN HTTP ERROR, and that ordering
     matters at the other end: the plane reads the STATUS before the body
     precisely because parsing the body of a 500 throws and turns "the member
     failed on this document" into "the member could not be reached". Two
     different findings, and only one of them is about the document. So a member
     that answered — with a refusal — answers 200 and says why. */
  return json(out);
}

/* Fleet rule 4, and this member says one more thing than its siblings do: which
   ENGINE it is carrying. A version endpoint that names only the build tells a
   rollout gate which code answered; for this member the code is a thin wrapper
   round bytes whose fidelity is the thing being claimed, so the engine, its
   version and the model are on the wire too. `engine_loaded` is asked rather
   than assumed — a member deployed WITHOUT its wasm part looks perfectly healthy
   until the first page. */
function handleVersion(env) {
  const why = engineCheck();
  return json({ ok: true, name: "ocr-worker", version: env.VERSION || "0.0.0",
                engine: ENGINE_NAME, engine_version: ENGINE_VERSION, model: MODEL_NAME,
                engine_loaded: why == null, ...(why ? { engine_unavailable: why } : {}) });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/+/, "");
    if (req.method === "GET" && path === "version") return handleVersion(env);
    if (req.method === "POST" && (path === "transcribe" || path === ""))
      return handleTranscribe(req, env);
    return json({ ok: false, reason: "UNKNOWN", detail: "POST /transcribe or GET /version only" }, 404);
  },
};
