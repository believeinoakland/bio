/* A configurable fake plane for the interface suite (NOT a `.test.mjs`): answers the ops a run calls, records every call
 * at the binding (`rec.calls`, with the token and the body), holds the run's log and what was written, and can be made
 * silent or refusing per op. The shapes are the plane's (ok/result, 403 refusals with `reason`, `code`, `check`). */
import { ACCOUNT } from "./account.mjs";

export const AIK = "aik-" + "c".repeat(64);
export const PACK_VERSION = "investigative-session@world+0000000000000000";
export const PACK = { id: "investigative-session", edition: "world", version: PACK_VERSION,
  resident: { objective: { text: "find what the record holds" }, disclosable: ["suggestions", "other"] },
  disclosed: { other: "other layer text", suggestions: "suggestions layer text" } };
export const WIDE = [{ bound: "fetches", allowed: 50 }, { bound: "subsessions", allowed: 50 },
                     { bound: "wallclock", allowed: 5000000 }, { bound: "runtime", allowed: 5000 }, { bound: "proposals", allowed: 50 }];
export const SCOPED = { step: "plan", pass: 0, scope: Object.fromEntries(["meaning", "content", "document", "internet"]
  .map((l) => [l, { reads: 1, documents: 3 }])) };
/** A refusal at the plane's door: a code for an invented one (`NOT_FOR_YOU`, a sentinel the module passes on unchanged), or the provider's
 *  real answer (an object from its published fixture), which the door passes on as its 403 body with `reason` and `code` both set. */
// fixtures-contract: control-plane ask-wire (the refusal body {ok:false, reason, code, check, translation} at 403)
const refusal403 = (codeOrAnswer, check = "C-0.0") => (typeof codeOrAnswer === "object" && codeOrAnswer
  ? Response.json({ ok: false, reason: codeOrAnswer.reason ?? codeOrAnswer.code, code: codeOrAnswer.code ?? codeOrAnswer.reason, ...codeOrAnswer }, { status: 403 })
  : Response.json({ ok: false, reason: codeOrAnswer, code: codeOrAnswer, check, translation: `canned ${codeOrAnswer}` }, { status: 403 }));

/** cfg: session (merged over the default), silent [ops], refuse {op: code}, entries, held [names], chains {address: versions},
 *  hits {id: {bundle_id, source_locator}}, rows (fn(query, body) -> result), pack (null = none), packVersion, tick (fn(body) -> result),
 *  suggestRefuse {name: code}, spawn (fn(level) -> payload), closeRefuse. */
export function world(cfg = {}) {
  const rec = { calls: [], log: [], wrote: [], proposals: [], closed: null, seq: 0, ticks: [] };
  const ok = (result, extra = {}) => Response.json({ ok: true, result, store: "scratch", tokenClass: "ai", ...extra });
  const session = (run) => ({ id: run, mode: "check", status: "running", context: { type: "inquiry", id: "INQ-W" }, max_passes: 1,
    principal: { plane: "member:ruth", claude: ACCOUNT.member, ref: ACCOUNT.member, skill: PACK_VERSION },
    state: SCOPED, budget: WIDE.map((b) => ({ ...b, consumed: 0, unit: null })), ...(cfg.session || {}) });
  const fetch = async (url, init) => {
    const u = new URL(url);
    const op = u.searchParams.get("op") || "";
    const q = Object.fromEntries(u.searchParams.entries());
    const body = init && typeof init.body === "string" ? JSON.parse(init.body) : null;
    const token = ((init?.headers || {}).authorization || "").replace(/^Bearer /, "");
    rec.calls.push({ op, query: q, body, token });
    if ((cfg.silent || []).includes(op)) throw new Error(`plane silent at ${op}`);
    // fixtures-contract: control-plane ask-wire (a refused op, as the door gives it)
    if (cfg.refuse?.[op]) return refusal403(cfg.refuse[op]);
    if (cfg.answer?.[op]) return cfg.answer[op](q, body, ok, refusal403);
    switch (op) {
      case "whoami": return ok({ tokenClass: "ai", session: false, member: null });
      case "airun": return cfg.noSession ? ok({ session: null }) : ok({ session: session(q.run) });
      case "airunlog": return ok({ entries: cfg.entries || rec.log, limit: 200, truncated: false });
      case "agentpack": return cfg.pack === null ? Response.json({ ok: true, pack: null, pack_absent: cfg.packAbsent ?? "no pack rendered" })
        : Response.json({ ok: true, pack: { ...(cfg.pack || PACK), version: cfg.packVersion || PACK_VERSION }, store: "scratch", tokenClass: "ai" });
      case "airunspawn": return ok({ found: true, half: "search", payload: cfg.spawn ? cfg.spawn(q.run) : { run: q.run,
        context: { type: "inquiry", id: "INQ-W" }, mode: "check", skill: PACK_VERSION, standard_pair: null } });
      case "meaningrows": return ok(cfg.rows ? cfg.rows(q, body) : { ok: true, arm: q.rows, rows: [], count: 0,
        scope: { documents: 3, documents_with_rows: 0, documents_without_rows: 3 } });
      case "basisversions": return ok({ id: q.id, versions: (cfg.held || []).map((name) => ({ name })), limit: 50, truncated: false });
      case "search": {
        const id = (/^id:"(.*)"$/.exec(q.q || "") || [])[1];
        const hit = cfg.hits?.[id];
        return ok({ hits: hit ? [hit] : [] });
      }
      case "versionchain": {
        const versions = cfg.chains?.[q.address];
        return ok({ address_norm: versions ? q.address : null, total: versions ? versions.length : 0, truncated: false, versions: versions || [] });
      }
      case "suggest": {
        const code = typeof cfg.suggestRefuse === "function" ? cfg.suggestRefuse(body) : cfg.suggestRefuse?.[body?.name];
        rec.suggested = [...(rec.suggested || []), body];
        // fixtures-contract: control-plane ask-wire (a refused suggest, as the door gives it)
        if (code) return refusal403(code, "C-27.0");
        rec.wrote.push(body?.name); return ok({ wrote: true, repeated: false });
      }
      case "capturerequest": return ok({ queued: true });
      case "airuntick": {
        rec.ticks.push(body);
        for (const e of body.log || []) rec.log.push({ seq: ++rec.seq, ...e });
        const extra = cfg.tick ? cfg.tick(body) : {};
        return ok({ run: body.run, ticked: true, status: "running", appended: (body.log || []).length, refused: [], ...extra });
      }
      // fixtures-contract: control-plane ask-wire (a refused close, as the door gives it)
      case "airunclose": rec.closed = body?.bound ?? null; return cfg.closeRefuse ? refusal403(cfg.closeRefuse) : ok({ terminated: true, bound: rec.closed });
      case "optionpropose": rec.proposals.push(body); return ok({ wrote: true });
      // fixtures-contract: control-plane ask-wire (UNKNOWN_OP: an op with no spec is 400)
      default: return cfg.other ? cfg.other(op, q, body, ok, refusal403) : Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
    }
  };
  return { fetch, rec };
}

/** A /run body as the plane sends it, the stubbed judgements path unless `judgements` is deleted by the caller. */
export const body = (extra = {}) => ({ run_id: "RUN-W", store: "scratch", credential: AIK, account: ACCOUNT, judgements: [], ...extra });
export const CHECK = (reports = [], candidates = []) => [{ targets: [] }, { reports }, { candidates }, {}];
