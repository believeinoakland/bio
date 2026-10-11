/* plane R36 (T42; N832; D21; extraction R72; reading-pipeline R29; K2484, K2611, K2613): the one transcriber the
   composition root registers with `extraction` (`registerTranscriber("plane", t)`), built on the object's own instances
   so `extraction` reaches nothing above its layer. It decides nothing about a page and holds no table: whether the AI's
   part may run is `run-rules`' (on `ai-runs`' R75 records), whether a project keeps its material away is `credentials`',
   the account and its limit are `credentials`' and `ai-use`'s (asked by `reading-pipeline.tier4Extend`), the rendering is
   `pdf-pixels`' (a PDF page by its page renderer, a picture file by its picture renderer), the reading `agent-worker`'s, and the count `ai-use`'s (R9). The account's secret leaves the object only
   in the one `POST /transcribe` request body. */
import { recordOf } from "../record-core/index.mjs";
import { credentialsOf } from "../credentials/index.mjs";
import { aiUseOf } from "../ai-use/index.mjs";
import { aiRunsOf } from "../ai-runs/index.mjs";
import { partDeployableOn, CIVICSMITH_TEST_SET } from "../run-rules/index.mjs";
import { renderPageToPixels } from "../../../pdf-worker/src/pagepixels.mjs";
import { renderPictureToPixels } from "../../../pdf-worker/src/picturepixels.mjs";

/** R36: at most this many pages are rendered and sent for one act, `agent-worker`'s `TRANSCRIBE_PAGES_MAX` (its R72;
 *  K2611), held equal to it by this module's test (the plane does not bundle agent-worker). */
export const TRANSCRIBE_PAGES_MAX = 8;
/** R36: a rendered page's PNG over this many bytes is not sent, `agent-worker`'s `TRANSCRIBE_IMAGE_MAX_BYTES` (its R72),
 *  held equal by this module's test. */
export const TRANSCRIBE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
/** R36 (T43; N853b; K2691, K2716): the long edge, in pixels, a picture file's page is reduced to at most before it is
 *  sent: the provider's standard vision tier's long edge, so no model downscales it, and under the 2,000 px a request
 *  of more than 20 images is held to (platform.claude.com, "Resolution and token cost", read 2026-10-11). */
export const TRANSCRIBE_PICTURE_EDGE = 1568;
/** The one picture kind `agent-worker` R63 admits: a PNG Civicsmith rendered itself, never the file's own stream. */
const PNG = "image/png";
const USE = "transcribe";

const idOf = (m) => (typeof m === "string" && m.startsWith("member:") ? m.slice(7) : m);

/* R36: the paying owner as `ai-use` R1 spells it, from the account `credentials.accountFor` answered. */
function ownerOf(account, member) {
  if (account && account.level === "project") return `project:${account.project}`;
  if (account && account.level === "group") return "group";
  return `member:${idOf(member)}`;
}

/* Base64 of a byte array, in chunks (no `Buffer` is assumed in the runtime). */
function base64(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/* R36: the asked pages, whole numbers of zero or more, each once, in ascending order, at most TRANSCRIBE_PAGES_MAX. */
const pagesAsked = (pages) => [...new Set((Array.isArray(pages) ? pages : []).filter((p) => Number.isInteger(p) && p >= 0))]
  .sort((a, b) => a - b).slice(0, TRANSCRIBE_PAGES_MAX);

/** R36: each asked page rendered by `pdf-pixels` with `decodeDct: true`, as `agent-worker` R72's `{page, media_type,
 *  data}`; a page the page renderer answers `NOT_A_PDF` for is rendered by its picture renderer instead, grey, its long
 *  edge at most TRANSCRIBE_PICTURE_EDGE (T43; N853b). A page either renderer refuses (or that throws), whose picture is
 *  not a PNG, or whose PNG is over TRANSCRIBE_IMAGE_MAX_BYTES is not sent and stays unread. One page is rendered at a
 *  time. */
export async function renderPages(bytes, pages, render = renderPageToPixels, picture = renderPictureToPixels) {
  const out = [];
  for (const page of pagesAsked(pages)) {
    let r;
    try { r = await render(bytes, page, { decodeDct: true }); } catch { r = null; }
    if (r && r.ok === false && r.reason === "NOT_A_PDF") {
      try { r = await picture(bytes, page, { maxEdge: TRANSCRIBE_PICTURE_EDGE, grey: true }); } catch { r = null; }
    }
    if (!r || r.ok !== true || r.mediaType !== PNG) continue;
    const png = r.bytes instanceof Uint8Array ? r.bytes : r.bytes ? new Uint8Array(r.bytes) : null;
    if (!png || png.length === 0 || png.length > TRANSCRIBE_IMAGE_MAX_BYTES) continue;
    out.push({ page, media_type: PNG, data: base64(png) });
  }
  return out;
}

/** R36's AI path for one act of `member`, on this object: `transcribe({account, capture_sha, store, pages, use})`.
 *  `onSha` hears the capture's digest, so the act's id can carry it. */
function aiPath(ctx, env, { member, at, act, onSha }) {
  return async function transcribe({ account = null, capture_sha = null, pages = [] } = {}) {
    const w = env && env.AGENT_WORKER;
    if (!w || typeof w.fetch !== "function") return { ok: false, reason: "AGENT_WORKER_UNBOUND" };
    const sha = typeof capture_sha === "string" ? capture_sha : "";
    onSha(sha);
    const ev = recordOf(ctx).evidenceStore();
    let bytes = null;
    try { const obj = ev && sha ? await ev.get(sha) : null; bytes = obj ? new Uint8Array(await obj.arrayBuffer()) : null; }
    catch { bytes = null; }
    if (!bytes) return { ok: false, reason: "EVIDENCE_ABSENT" };
    const rendered = await renderPages(bytes, pages);
    /* Nothing rendered: nothing is sent, and no account leaves the object. */
    if (!rendered.length) return { ok: false, reason: "NO_PAGE_RENDERED" };
    const a = account && typeof account === "object" ? account : {};
    /* agent-worker R6's wire shape: `accountFor`'s `key` named `secret`, the acting member, no suggestions; a project's
       account names its project. */
    const body = JSON.stringify({ capture_sha: sha, pages: rendered,
      account: { kind: a.kind, level: a.level, ...(a.level === "project" ? { project: a.project } : {}), secret: a.key,
                 member, suggestions: false } });
    let answer;
    try {
      const res = await w.fetch("https://agent-worker/transcribe", { method: "POST",
        headers: { "content-type": "application/json" }, body });
      answer = await res.json();
    } catch { return { ok: false, reason: "AGENT_WORKER_SILENT" }; }
    if (!answer || typeof answer !== "object" || Array.isArray(answer)) return { ok: false, reason: "AGENT_WORKER_SILENT" };
    /* Whatever else it says, usage it carries is counted, in one transaction, under this act (D12). */
    if (answer.usage && typeof answer.usage === "object") {
      const entry = { owner: ownerOf(a, member), member, use: USE, mode: USE,
        model: typeof answer.engine === "string" && answer.engine ? answer.engine : null, usage: answer.usage,
        calls: answer.calls, at, act: act() };
      try { recordOf(ctx).transact(() => aiUseOf(ctx).countUsage(entry)); } catch { /* refused: rolled back, nothing counted */ }
    }
    if (answer.ok === true) return answer;
    return { ...answer, ok: false, reason: answer.reason ?? answer.code ?? null };
  };
}

/** R36: the transcriber, `{deployable(), keptAway({project, use}), transcription({member, project, at})}`. */
class Transcriber {
  #ctx; #env; #set;
  constructor(ctx, env, set) { this.#ctx = ctx; this.#env = env; this.#set = set; }

  /* run-rules R19 on ai-runs' R75 records, `transcribe` being outside the order (no verification chain). */
  deployable() {
    try {
      return partDeployableOn(this.#set, USE, { verifications: [], testBars: aiRunsOf(this.#ctx, this.#env).testBarRecords() }) === true;
    } catch { return false; }
  }

  keptAway({ project = null, use = null } = {}) { return credentialsOf(this.#ctx).aiKeptAway({ project, use }); }

  /* The act's id is minted here at `at` and carries the capture's digest once the AI path is asked for it. */
  transcription({ member = null, project = null, at = null } = {}) {
    const instant = typeof at === "string" && at ? at : new Date().toISOString();
    let prefix = "";
    const act = () => `${USE}:${prefix}:${instant}`;
    const ctx = this.#ctx, aiUse = aiUseOf(ctx);
    const tx = { member, project, at: instant, credentials: credentialsOf(ctx),
      useCheck: (q) => aiUse.useCheck(q),
      transcribe: aiPath(ctx, this.#env, { member, at: instant, act, onSha: (sha) => { prefix = sha.slice(0, 16); } }) };
    Object.defineProperty(tx, "act", { get: act, enumerable: true });
    return tx;
  }
}

/* K61: one transcriber per storage, its `deps` (a test's own `testSet`, as ai-runs' `deps.testSet`) read on the first
   call only. */
const OF = new WeakMap();
/** R36: this object's transcriber. `deps.testSet` replaces `run-rules`' `CIVICSMITH_TEST_SET` (a test's). */
export function transcriberOf(ctx, env, deps = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let t = OF.get(storage);
  if (!t) { t = new Transcriber(ctx, env, deps.testSet || CIVICSMITH_TEST_SET); OF.set(storage, t); }
  return t;
}
