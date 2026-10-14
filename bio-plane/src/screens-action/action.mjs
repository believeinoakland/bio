/* One action (registry screen `action`; screens-action R5, R7, R10, R12; DEC-113; v0.2 rules 6, 15). Projects › <project> ›
   Action: headed by its title (a null drawn absent), what it is, to whom, when and by whom it was sent, its clock entries
   with their due dates and state, its replies, its scope, its hold and pressure (the marks `pressurefor` answers); "Waiting on <office>'s reply" while one is owed. A passed date is drawn as
   canon's question ("no reply recorded by <date>"), never "overdue" until a member determines it (`action-producers` R1).
   An action holding an approved, unsent text offers to pick up where it was left (R10). The subject is the action's
   id. Every function here is self-contained (interface-shell R21 (1)). */
import { draftsOf, stepOf } from "./send-steps.mjs";

export const action = Object.freeze({
  id: "action",

  // R8 (interface-shell), R12: the path's project step, from the project the `action` read answers (its R102) and the
  // project's title from `list`.
  place: function (view) {
    const d = view.data.action;
    const id = d && d.state === "ok" && d.value && typeof d.value.project === "string" ? d.value.project : "";
    if (!id) return {};
    const l = view.data.projects;
    const rows = l && l.state === "ok" && l.value && Array.isArray(l.value.bundles) ? l.value.bundles : [];
    const hit = rows.find(function (b) { return b.bundle_id === id; });
    return hit ? { project: { id: id, title: hit.title || id } } : {};
  },

  reads: function (view) {
    return {
      action: { op: "action", query: { id: view.subject }, subject: true },
      filings: { op: "filingsfor", query: { action: view.subject }, empty: function () { return false; } },
      hold: { op: "actionholdpreview", query: { target: view.subject }, empty: function () { return false; } },
      // R12: the action's pressure marks and the pressure records, each with where it arrived (action-holds R16).
      pressure: { op: "pressurefor", query: { action: view.subject },
        empty: function (v) { return !v || !Array.isArray(v.items) || v.items.length === 0; } },
      projects: { op: "list", query: { type: "project", limit: "500" } },
    };
  },

  parts: {
    draftsOf: draftsOf, stepOf: stepOf,
    // The states an action may move to from where it stands (actions' state edges).
    moves: function (from) {
      return { planned: ["active", "abandoned"], active: ["awaiting_response", "resolved", "abandoned"],
        awaiting_response: ["active", "resolved", "abandoned"] }[from] || [];
    },
    today: function (cs) { return new Date(cs.now()).toISOString().slice(0, 10); },
    // R12: the pressure marks past the first page, read by `after` until no cursor follows (at most 20 pages), kept in the
    // page's memory; answers the marks so far and the state of the page it stopped at.
    pressurePages: function (cs, view, first) {
      const L = view.ui.pages || (view.ui.pages = {});
      const items = [];
      let cursor = first, state = "ok", n = 0;
      while (cursor && n < 20) {
        const k = String(cursor);
        if (!L[k]) {
          L[k] = { state: "loading" };
          const settle = function (o) { L[k] = o; cs.set("pages", L); };
          cs.call("pressurefor", { query: { action: view.subject, after: k } }).then(function (a) {
            const r = a && a.result !== undefined ? a.result : a;
            if (!r || r.ok === false) {
              const code = String((r && (r.code || r.reason)) || "");
              settle({ state: "failed", refusal: { code: code, words: cs.esc((r && r.translation) || code) } });
            } else settle({ state: "ok", items: Array.isArray(r.items) ? r.items : [], cursor: r.truncated && r.cursor ? r.cursor : null });
          }, function () { settle({ state: "failed", refusal: null }); });
        }
        if (L[k].state !== "ok") { state = L[k].state; break; }
        items.push.apply(items, L[k].items);
        cursor = L[k].cursor;
        n++;
      }
      return { items: items, state: state, page: state === "ok" ? null : L[String(cursor)] };
    },
  },

  render: function (cs, view) {
    const P = view.parts;
    const STATES = ["planned", "active", "awaiting_response", "resolved", "abandoned"];
    return cs.state("action", function (a) {
      const office = a.addressee ? [a.addressee.role, a.addressee.body].filter(Boolean).join(", ") : "";
      const holder = a.addressee && a.addressee.holder_on_date && a.addressee.holder_on_date.holder ? a.addressee.holder_on_date.holder : "";
      const corr = Array.isArray(a.correspondence) ? a.correspondence : [];
      const sent = corr.filter(function (c) { return c.direction === "sent"; });
      const first = sent.length ? sent[0] : null;
      const state = STATES.includes(a.current_state) ? a.current_state : "planned";
      const head = cs.title(typeof a.title === "string" && a.title ? a.title : null) + '<p class="mk-sub">' + cs.w("screen.action.kind." + (["records_request", "request_for_comment"].includes(a.kind) ? a.kind : "other"))
        + (office ? " · " + cs.w("screen.action.to", { office: office }) : "") + (holder ? " · " + cs.w("screen.request.holder", { holder: holder }) : "")
        + (first ? " · " + cs.w("screen.action.sentby", { date: { html: cs.date(first.at) }, who: String(first.author || "").replace(/^member:/, "") }) : "")
        + " · " + cs.w("screen.plan.actionstate." + state) + "</p>"
        + (a.confidential ? '<p class="mk-note">' + cs.w("screen.action.confidential") + "</p>" : "");

      // R10: an approved text not yet sent opens its send step.
      const f = view.data.filings;
      const step = f && f.state === "ok" ? P.stepOf(f.value) : null;
      const pickup = step === "send" || step === "second"
        ? '<div class="cs-reason" role="region"><p>' + cs.w("screen.action.unsent") + '</p><a class="cs-ref" href="/app/'
          + (a.kind === "records_request" ? "request/" : "start-send/") + encodeURIComponent(view.subject) + '" data-nav>' + cs.w("screen.action.pickup") + "</a></div>" : "";

      // R5: "Waiting on <office>'s reply" while one is owed; each due date with `mark.due`, a passed one as canon's
      // question, never "overdue" until a member determines it.
      const owed = a.reply_owed && a.reply_owed.owed;
      const wait = owed ? '<p class="cs-wait" role="status">' + cs.w("screen.action.waiting", { office: office || cs.w("screen.action.theoffice") }) + "</p>" : "";
      const today = P.today(cs);
      const clock = Array.isArray(a.clock) ? a.clock : [];
      const clocks = !clock.length ? "" : cs.sec("screen.action.dates", cs.sheet(clock.map(function (c, i) {
        const st = ["pending", "met", "overdue", "waived"].includes(c.status) ? c.status : "pending";
        const passed = st === "pending" && c.date && String(c.date) < today;
        const says = passed ? cs.w("screen.action.noreplyby", { date: { html: cs.date(c.date) } }) : cs.w("screen.action.clock." + st);
        const due = c.date ? '<a href="/app/due-date/' + encodeURIComponent(view.subject + "~" + i) + '" data-nav>' + cs.due(String(c.date), st === "met" ? "met" : passed ? "passed" : "") + "</a>" : "";
        const remind = c.date && st === "pending"
          ? cs.field("remind-" + i, "screen.action.remindon", { type: "date" }) + cs.act("reminderset", { data: { entry: String(i) } }) : "";
        return cs.row(due, cs.esc(c.text || c.description || "") + '<span class="meta">' + says + (c.basis ? " · " + cs.esc(c.basis) : "") + "</span>", "", remind);
      }).join("")));

      // R5: the replies, each received one markable as pressure (once).
      const entries = Array.isArray(a.entries) ? a.entries : [];
      const received = corr.filter(function (c) { return c.direction !== "sent"; });
      const replies = cs.sec("screen.action.replies", (received.length ? cs.sheet(received.map(function (c) {
        const e = entries.find(function (x) { return x.ord === c.ord; }) || {};
        const pr = e.pressure ? cs.w("screen.action.pressure." + (["legal", "retaliation", "discrediting"].includes(e.pressure.kind) ? e.pressure.kind : "other")) : "";
        const mark = !e.pressure && c.direction === "received"
          ? cs.choice("pressure-kind-" + c.ord, "screen.action.pressure.kind", ["legal", "retaliation", "discrediting", "other"].map(function (k) { return [k, "screen.action.pressure." + k]; }))
            + cs.field("pressure-note-" + c.ord, "screen.action.pressure.note") + cs.act("actionpressure", { data: { ord: String(c.ord) } }) : "";
        return cs.row(cs.date(c.at), cs.w(c.direction === "no_response" ? "screen.action.noresponse" : "screen.action.received")
          + (c.party ? " · " + cs.esc(c.party) : "") + (c.medium ? " · " + cs.esc(c.medium) : "") + (pr ? '<span class="meta">' + pr + "</span>" : ""), "", mark);
      }).join("")) : "")
        + cs.field("reply-at", "screen.action.reply.at", { type: "date" })
        + cs.field("reply-account", "screen.action.reply.account", { area: true, help: "screen.action.reply.account.help" })
        + '<div class="mk-acts">' + cs.act("actioncorrespond", { tone: "primary" }) + "</div>");

      // R12: the pressure marks and records on this action, each with where it arrived, paged by `after`; none drawn at
      // zero; a mark that arrived on another action is not this action's.
      const pr = view.data.pressure;
      const marks = function (items) {
        return cs.sheet(items.map(function (m) {
          const at = m.arrived && m.arrived.action ? cs.w("screen.action.pressuremark.reply", { ord: String(m.arrived.ord) }) : cs.w("screen.action.pressuremark.record");
          return cs.row(cs.date(m.at), cs.w("screen.action.pressure." + (["legal", "retaliation", "discrediting"].includes(m.kind) ? m.kind : "other"))
            + (m.note ? " · " + cs.esc(m.note) : "") + '<span class="meta">' + at + (m.by ? " · " + cs.w("screen.action.pressuremark.by", { who: String(m.by).replace(/^member:/, "") }) : "") + "</span>", "", "");
        }).join(""));
      };
      let pressureSec = "";
      if (pr && pr.state === "ok") {
        const first = (pr.value.items || []).filter(function (m) { return !(m.arrived && m.arrived.action && m.arrived.action !== view.subject); });
        const more = pr.value.truncated && pr.value.cursor ? P.pressurePages(cs, view, pr.value.cursor) : { items: [], state: "ok" };
        const all = first.concat(more.items.filter(function (m) { return !(m.arrived && m.arrived.action && m.arrived.action !== view.subject); }));
        pressureSec = cs.sec("screen.action.pressuremarks", (all.length ? marks(all) : "") + (more.state !== "ok" ? cs.state(more.page) : ""));
      } else if (pr && pr.state === "failed") pressureSec = cs.sec("screen.action.pressuremarks", cs.state("pressure"));

      // R5: move, hold and scope.
      const moves = P.moves(state);
      const move = moves.length ? cs.choice("move-to", "screen.action.move.to", moves.map(function (m) { return [m, "screen.plan.actionstate." + m]; }))
        + cs.choice("move-resolution", "screen.action.move.resolution", ["complied", "denied", "escalated", "withdrawn", "completed"].map(function (r) { return [r, "screen.action.resolution." + r]; }))
        + cs.act("actionmove", {}) : "";
      const h = view.data.hold;
      const held = h && h.state === "ok" && h.value && h.value.hold === "in_place";
      const hold = held ? '<p class="mk-note">' + cs.w("screen.action.held") + "</p>" : cs.act("actionhold", {});
      const scope = '<p class="mk-note">' + cs.w(a.confidential ? "screen.action.scope.confidential" : "screen.action.scope.open") + "</p>"
        + cs.act("actionscope", { data: { to: a.confidential ? "false" : "true" } });
      const manage = cs.sec("screen.action.manage", '<div class="mk-acts">' + move + "</div>" + hold + scope);
      return head + pickup + wait + clocks + replies + pressureSec + manage;
    });
  },

  acts: [
    {
      // R5: "Record a reply": the day it came and the member's account of it.
      op: "actioncorrespond",
      send: function (view, el, cs) {
        const at = String(cs.value("reply-at") || "").trim();
        const account = String(cs.value("reply-account") || "").trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(at)) return { refuse: "screen.action.reply.at.needed" };
        if (!account) return { refuse: "screen.action.reply.account.needed" };
        return { query: { target: view.subject, direction: "received", at: at, account: account }, raw: "" };
      },
    },
    {
      // R5: a received reply marked as pressure directed at the group, once.
      op: "actionpressure",
      send: function (view, el, cs) {
        const ord = el.dataset.ord;
        const note = String(cs.value("pressure-note-" + ord) || "").trim();
        if (!note) return { refuse: "screen.action.pressure.needed" };
        return { body: { target: view.subject, ord: Number(ord), pressure: { kind: cs.value("pressure-kind-" + ord), note: note } } };
      },
    },
    {
      // R5: "Move the action", with the member's reason (asked by the shell, sent in the query actions reads).
      op: "actionmove",
      send: function (view, el, cs) {
        const to = cs.value("move-to");
        if (!to) return null;
        const q = { target: view.subject, to: to };
        if (to === "resolved") q.resolution = cs.value("move-resolution");
        return { query: q, raw: "" };
      },
    },
    {
      // R5: "Remind me" on a dated entry, on the day the member chooses.
      op: "reminderset",
      send: function (view, el, cs) {
        const on = String(cs.value("remind-" + el.dataset.entry) || "").trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(on)) return { refuse: "screen.action.remindon.needed" };
        return { body: { target: view.subject, entry: Number(el.dataset.entry), on: on } };
      },
      rereads: [],
      done: function (view, answer, cs) { cs.set("reminded", true); },
    },
    {
      // R5: "Record a litigation hold", with a reason (the shell asks it).
      op: "actionhold",
      send: function (view) { return { body: { target: view.subject, hold: "in_place" } }; },
      rereads: ["hold"],
    },
    {
      // R5 (v0.2 rule 15): confidential or not, with a reason; a published case keeps what it said.
      op: "actionscope",
      send: function (view, el) { return { body: { target: view.subject, confidential: el.dataset.to === "true" } }; },
      rereads: ["action"],
    },
  ],
});
