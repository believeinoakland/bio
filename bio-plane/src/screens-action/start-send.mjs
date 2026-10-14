/* Start and send (registry screen `start-send`; screens-action R2, R3, R7; DEC-115; v0.2 rules 1–3, 19). Projects ›
   <project> › Action plan › Start and send. Step 1 (subject `<plan>~<option>`): what starting does, first, with every
   refusal it would meet, each resolved in place; nothing runs before the member's confirm. Step 2 (subject the action
   started): prepare what is sent, approve it, give the second approval where the project asks one, and record the
   sending. Every function here is self-contained (interface-shell R21 (1)). */
import { draftsOf, stepOf, sendSteps, draftOf, readFiling, PREPARE, PREPARE_FILING, APPROVE, SECOND, RECORD_SENT } from "./send-steps.mjs";

export const startSend = Object.freeze({
  id: "start-send",

  place: function (view) {
    const p = view.data.plan;
    const v = p && p.state === "ok" ? p.value : null;
    if (!v || !v.project) return {};
    const l = view.data.projects;
    const rows = l && l.state === "ok" && l.value && Array.isArray(l.value.bundles) ? l.value.bundles : [];
    const hit = rows.find(function (b) { return b.bundle_id === v.project; });
    return { project: { id: v.project, title: (hit && hit.title) || v.project } };
  },

  reads: function (view) {
    const s = String(view.subject || "");
    const at = s.indexOf("~");
    if (at < 0) return {
      action: { op: "action", query: { id: s }, subject: true },
      filings: { op: "filingsfor", query: { action: s }, empty: function () { return false; } },
    };
    const plan = s.slice(0, at), option = s.slice(at + 1);
    const body = { plan: plan, option: option, kind: view.ui.kind || "records_request", breach: view.ui.breach === true };
    if (view.ui.override) body.premise_override = { reason: view.ui.override };
    return {
      plan: { op: "plan", query: { id: plan }, subject: true },
      projects: { op: "list", query: { type: "project", limit: "500" } },
      preview: { op: "optionstartpreview", body: body },
    };
  },

  parts: {
    draftsOf: draftsOf, stepOf: stepOf, sendSteps: sendSteps, draftOf: draftOf, readFiling: readFiling,
    isRequest: function () { return false; },
    kinds: function () { return ["records_request", "request_for_comment", "other"]; },
    // R2: the preview's answer drawn: the kind, the office by its role, what it rests on, the clock, the breach, and the
    // refusal it would meet, first.
    preview: function (cs, view, pv) {
      const a = pv && pv.action ? pv.action : {};
      const ad = a.addressee;
      const to = !ad ? cs.w("screen.start-send.noaddressee")
        : ad.state === "audience" ? cs.esc(ad.description || "")
          : cs.esc([ad.role, ad.body || ad.organisation].filter(Boolean).join(", ")) + " · " + cs.w("screen.start-send.byrole");
      const legs = (Array.isArray(a.legs) ? a.legs : []).flatMap(function (l) { return l.subjects || []; });
      const rests = legs.length ? legs.map(function (s) {
        const key = s.subject && s.subject.kind === "outcome" ? s.subject.determination : s.subject && s.subject.inquiry;
        return cs.esc(key || "") + " · " + cs.w("screen.plan.support." + (["hypothetical", "established", "short"].includes(s.support) ? s.support : "undetermined"));
      }).join("<br>") : cs.w("screen.start-send.restsnothing");
      const clock = Array.isArray(a.clock) && a.clock.length ? a.clock.map(function (c) {
        return cs.date(c.date) + " · " + cs.esc(c.basis || "");
      }).join("<br>") : cs.w("screen.start-send.noclock");
      const k = view.parts.kinds().includes(a.kind) ? a.kind : "other";
      const refused = pv && pv.refusal ? '<div class="cs-gap" data-gap="refused" role="alert"><b>' + cs.w("screen.start-send.wouldrefuse") + "</b><p>"
        + cs.esc(pv.refusal.translation || pv.refusal.detail || pv.refusal.reason || pv.refusal.code || "") + "</p><p>" + cs.w("screen.start-send.resolve") + "</p></div>" : "";
      return refused + '<dl class="mk-dl"><dt>' + cs.w("screen.start-send.kind") + "</dt><dd>" + cs.w("screen.start-send.kind." + k)
        + "</dd><dt>" + cs.w("screen.start-send.to") + "</dt><dd>" + to
        + "</dd><dt>" + cs.w("screen.start-send.rests") + "</dt><dd>" + rests
        + "</dd><dt>" + cs.w("screen.start-send.clock") + "</dt><dd>" + clock
        + "</dd><dt>" + cs.w("screen.start-send.breach") + "</dt><dd>" + cs.w(a.breach ? "screen.start-send.breach.yes" : "screen.start-send.breach.no")
        + (a.premise_override ? " · " + cs.w("screen.start-send.override.stated") : "") + "</dd></dl>";
    },
  },

  render: function (cs, view) {
    const P = view.parts;
    const s = String(view.subject || "");
    if (s.indexOf("~") < 0) {
      // Step 2: the action started.
      return cs.state("action", function (a) {
        return cs.title(null)
          + '<p class="mk-sub">' + cs.w("screen.start-send.titlestarted") + " · " + cs.esc(a.addressee ? [a.addressee.role, a.addressee.body].filter(Boolean).join(", ") : "") + "</p>"
          + cs.sec("screen.start-send.step2", cs.state("filings", function (f) { return P.sendSteps(cs, view, f, {}); }));
      });
    }
    const option = s.slice(s.indexOf("~") + 1);
    return cs.state("plan", function (p) {
      const o = (p.options || []).find(function (x) { return x.id === option; });
      if (!o) return '<p class="cs-state" data-state="empty">' + cs.w("state.empty") + "</p>";
      const head = cs.title(null) + '<p class="mk-sub">' + cs.w("screen.start-send.title", { option: o.summary || o.id }) + "</p>"
        + '<p class="mk-sub">' + cs.w("screen.start-send.nothingruns") + "</p>";
      if (o.action && o.action.id)
        return head + '<p class="mk-note">' + cs.w("screen.start-send.alreadystarted") + "</p>"
          + '<a class="cs-ref" href="/app/start-send/' + encodeURIComponent(o.action.id) + '" data-nav>' + cs.w("screen.start-send.tostep2") + "</a>";
      const pv = view.ui.preview || null;
      const shown = pv ? P.preview(cs, view, pv) : cs.state("preview", function (v) { return P.preview(cs, view, v); });
      const kinds = P.kinds().map(function (k) { return [k, "screen.start-send.kind." + k]; });
      const form = cs.choice("start-kind", "screen.start-send.kind", kinds, { value: view.ui.kind || "records_request" })
        + cs.checks("start-breach", "screen.start-send.breach", [["yes", "screen.start-send.breach.tick", view.ui.breach === true]])
        + cs.field("start-override", "screen.start-send.override", { help: "screen.start-send.override.help", value: view.ui.override || "" })
        + '<div class="mk-acts">' + cs.act("optionstartpreview", { data: { option: option } })
        + cs.act("optionstart", { tone: "primary", data: { option: option } }) + "</div>";
      return head + cs.sec("screen.start-send.step1", shown + form);
    });
  },

  acts: [
    {
      // R2: what starting does, asked again with the kind, the breach and the reason the member set; writes nothing.
      op: "optionstartpreview",
      send: function (view, el, cs) {
        const s = String(view.subject);
        const kind = cs.value("start-kind") || "records_request";
        const breach = (cs.value("start-breach") || []).includes("yes");
        const override = String(cs.value("start-override") || "").trim();
        const body = { plan: s.slice(0, s.indexOf("~")), option: el.dataset.option, kind: kind, breach: breach };
        if (override) body.premise_override = { reason: override };
        view.ui.kind = kind; view.ui.breach = breach; view.ui.override = override;
        return { body: body };
      },
      rereads: [],
      done: function (view, answer, cs) { cs.set("preview", answer); },
    },
    {
      // R2: "Start the action" on the member's confirm (the shell asks her reason, sent as `why_first` where the option
      // goes out before its matter is documented); a refusal stays beside it, resolved in place.
      op: "optionstart",
      send: function (view, el, cs, extra) {
        const s = String(view.subject);
        const override = String(cs.value("start-override") || "").trim();
        const body = { plan: s.slice(0, s.indexOf("~")), option: el.dataset.option, kind: cs.value("start-kind") || "records_request",
          breach: (cs.value("start-breach") || []).includes("yes") };
        if (override) body.premise_override = { reason: override };
        if (extra && typeof extra.reason === "string" && extra.reason.trim()) body.why_first = extra.reason.trim().slice(0, 500);
        return { body: body };
      },
      done: function (view, answer, cs) { if (answer && answer.action) cs.go("start-send", answer.action); return { stay: true }; },
    },
    Object.assign({}, PREPARE, { rereads: ["filings"] }),
    Object.assign({}, PREPARE_FILING, { rereads: ["filings"] }),
    Object.assign({}, APPROVE, { rereads: ["filings"] }),
    Object.assign({}, SECOND, { rereads: ["filings"] }),
    Object.assign({}, RECORD_SENT, { rereads: ["filings", "action"] }),
  ],
});
