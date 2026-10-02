/* A stand-in for `monitoring`'s seam (its R65 `sweepHost`, R66 `registerSweep`, and the parts of R27 and R30 that
   read what R66 registers), kept to the contract those requirements state, for link-sweep's tests until monitoring's
   T24 merge brings the real one (BOB's START, (2)). Its pause is monitoring R30's setting (`monitoring_paused`), its
   epochs and claims are R21's rule held in memory, its rank is R19's rule, and its landing is R28's (a new Information
   bundle at `collected`, in the project of the request's bundle, through the real promotion). Its R27 composes C-18.5
   from the registered grammar as R66 says: an entry that is not an object is its own finding, the registered grammar
   answers the rest, one refusal per file, `SWEEP_TERM_REFUSED` before `GATHERING_REFUSED`, the fence asked last. */
import { stampInstant } from "../../../src/record-core/index.mjs";
import { viewerPredicate } from "../../../src/membership/index.mjs";
import { createSha256 } from "../../../src/record-grammar/index.mjs";

export const PAUSE_SETTING = "monitoring_paused";
export const RECHECK_MS = 3600000;
const GATHERING_ROW = { check: "C-18.10", translation: "the gathering list was refused (the stand-in's GATHERING_REFUSED)" };

export function monitoringStandIn({ record, promotion }) {
  const epochs = new Map(), claims = new Set(), running = new Set();
  let registered = null;
  const calls = { host: 0, register: [] };
  const paused = () => {
    const v = record.getSetting(PAUSE_SETTING);
    return v && typeof v === "object" && v.paused === true
      ? { paused: true, by: typeof v.by === "string" ? v.by : null, at: typeof v.at === "string" ? v.at : null } : { paused: false };
  };
  const host = {
    paused,
    openEpoch(consumer, now, staleAfterMs) {
      const open = epochs.get(consumer);
      if (open !== undefined && Math.abs(now - open) < staleAfterMs) return open;
      const epoch = Math.trunc(now);
      epochs.set(consumer, epoch);
      for (const k of [...claims]) if (k.startsWith(`${consumer}\u0000`) && !k.endsWith(`\u0000${epoch}`)) claims.delete(k);
      return epoch;
    },
    claim(consumer, subject, epoch) {
      const k = `${consumer}\u0000${subject}\u0000${epoch}`;
      if (claims.has(k)) return false;
      claims.add(k);
      return true;
    },
    closeEpoch(consumer, epoch) {
      if (epochs.get(consumer) === epoch) epochs.delete(consumer);
      for (const k of [...claims]) if (k.startsWith(`${consumer}\u0000`) && k.endsWith(`\u0000${epoch}`)) claims.delete(k);
    },
    running,
    ranked(list, item, rank, now) {
      if (typeof rank !== "function" || list.length < 2) return list;
      const PLACE = Symbol("place");
      const items = list.map((e, i) => ({ ...item(e), [PLACE]: i }));
      let answer;
      try { answer = rank(items, now); } catch { return list; }
      if (!Array.isArray(answer)) return list;
      const order = [], taken = new Set();
      for (const x of answer) {
        const i = x && typeof x === "object" ? x[PLACE] : undefined;
        if (Number.isInteger(i) && !taken.has(i)) { taken.add(i); order.push(list[i]); }
      }
      for (let i = 0; i < list.length; i++) if (!taken.has(i)) order.push(list[i]);
      return order;
    },
    land(q, filed, at, say = null) {
      try {
        const doc = filed.doc, cap = doc.capture;
        const enc = (t) => { const b = new TextEncoder().encode(t); return { text: t, bytes: b.length, sha256: createSha256().update(b).hex() }; };
        const info = record.bundleInfo(q.bundle);
        const project = info && info.project ? info.project : null;
        return record.transact(() => {
          const id = `${record.allocId("INFO", at.slice(0, 4)).id}-gathered`;
          const title = (say ? say.title : `Gathered for ${q.id}`).replace(/[\p{Cc}]+/gu, " ").slice(0, 200);
          const md = ["---", `id: ${id}`, "object_type: information", "schema: information@2", `title: ${JSON.stringify(title)}`,
            "current_state: collected", "prior_state: null", `created: "${at}"`, `last_updated: "${at}"`,
            "produced_by:", "  mode: agent", "  capability_tier: session", ...(project ? [`project: ${project}`] : []),
            "references: []", "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
            "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
            "source:", `  locator: ${JSON.stringify(filed.locator)}`, `  retrieved: ${doc.retrieved || at}`,
            "monitoring:", "  enabled: false", "  frequency: none", "---", "", "## Summary", "",
            say ? say.summary : "gathered", "", "## Provenance Notes", "", say ? say.notes : "gathered", "",
            "## Session Log", "", `### Session ${at} | Collected | token:daemon`, `Trigger: ${say ? say.trigger : q.id}`, "",
            "## Review Notes", ""].join("\n");
          const files = [{ path: "bundle.md", ...enc(md) },
                         { path: "data/provenance.json", ...enc(JSON.stringify({ documents: [doc] }, null, 2)) },
                         { path: doc.file, blobSha: cap.sha256, sha256: cap.sha256, bytes: cap.bytes }];
          const p = promotion.promote({ bundleId: id, base: null, snapKey: `${at.replace(/[-:]/g, "")}_${Math.random().toString(16).slice(2, 10)}`,
            author: "token:daemon", files, meta: { object_type: "information", title, current_state: "collected", prior_state: null,
                                                   created: at, last_updated: at, criticality: "supporting" },
            register: [{ sha256: cap.sha256, path: doc.file, encoding: "binary", bytes: cap.bytes }] });
          return p && p.ok ? { ok: true, bundle_id: id, state: "collected" }
                           : { ok: false, reason: (p && (p.reason || p.code)) || null, detail: String((p && p.detail) || "refused").slice(0, 300) };
        });
      } catch { return { ok: false, reason: null, detail: "the landing did not complete" }; }
    },
    gate: (viewer) => viewerPredicate(viewer),
    recheckMs: () => RECHECK_MS,
  };
  const m = {
    calls,
    get registered() { return registered; },
    sweepHost() { calls.host++; return host; },
    registerSweep(module, share) {
      calls.register.push(module);
      const ok = share && typeof share === "object" && ["grammar", "fence", "dueForSlate"].every((k) => typeof share[k] === "function");
      if (registered) return { ok: false, reason: "SWEEP_DECLARED", detail: `${registered.module} holds the registration` };
      if (typeof module !== "string" || !module || !ok) return { ok: false, reason: "SWEEP_MALFORMED" };
      registered = { module, ...share };
      return { ok: true, module };
    },
    /* R27 as R66 composes it */
    gatheringCheck(c) {
      const files = Array.isArray(c && c.files) ? c.files : [];
      const gj = c && c.pkg && c.pkg.replay ? null : files.find((f) => f.path === "data/gathering.json");
      if (!gj || typeof gj.text !== "string") return null;
      let g;
      try { g = JSON.parse(gj.text); } catch { return null; }
      if (!g || typeof g !== "object" || Array.isArray(g)) return null;
      const errs = [], ids = new Set();
      const sweeps = Array.isArray(g.sweeps) ? g.sweeps : [];
      for (let i = 0; i < sweeps.length; i++) {
        const s = sweeps[i];
        if (typeof s !== "object" || s === null || Array.isArray(s)) { errs.push({ check: "C-18.5", message: `gathering.json sweeps[${i}] is not an object` }); continue; }
        if (!registered) continue;
        let found;
        try { found = registered.grammar(s, ids); } catch { found = [{ check: "C-18.5", message: `gathering.json sweeps[${i}] could not be read` }]; }
        for (const f of found) errs.push({ ...f, message: `gathering.json sweeps[${i}]${f.field ? "." : " "}${f.message}` });
      }
      const term = errs.filter((x) => x.code === "SWEEP_TERM_REFUSED");
      if (term.length) {
        const r = term[0].refusal;
        return { ok: false, reason: r.code, code: r.code, check: r.check, translation: r.translation, detail: term.map((x) => x.message).join("; "),
                 findings: errs.map((x) => ({ check: x.check, detail: x.message })) };
      }
      if (errs.length) return { ok: false, reason: "GATHERING_REFUSED", code: "GATHERING_REFUSED", ...GATHERING_ROW,
                                findings: errs.map((x) => ({ check: x.check, detail: x.message })) };
      if (!registered) return null;
      try { return registered.fence(c, gj.text); } catch { return { ok: false, reason: "GATHERING_REFUSED", code: "GATHERING_REFUSED", ...GATHERING_ROW, findings: [] }; }
    },
    /* R30's slate: the due sweeps the registration answers, inside fixed framing */
    slateSweeps(now, sees) {
      if (!registered) return { items: [], said: "no sweep is registered" };
      try { return { items: registered.dueForSlate(now, sees) }; } catch { return { items: [], said: "the sweeps could not be listed" }; }
    },
    stamp: (ms) => stampInstant("second", ms),
  };
  promotion.registerStep("monitoring", { check: (c) => m.gatheringCheck(c) });
  return m;
}
