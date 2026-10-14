/* Request records (registry screen `request`; screens-action R4, R7, R8, R10). Projects › <project> › Request records.
   Look first; then, in the flow's order: the office (by its role), what is wanted in plain words, the law it goes under
   (the laws the profile names, each with its window), the text with the period, form and cost limit (R8), approving it,
   and recording the sending with the portal's number. The subject is the project (a new request) or the action (one
   already started), and an action opens at the step it has reached (R10: approved and not sent opens at the send).
   Every function here is self-contained (interface-shell R21 (1)). */
import { draftsOf, stepOf, sendSteps, PREPARE, APPROVE, RECORD_SENT } from "./send-steps.mjs";

export const request = Object.freeze({
  id: "request",

  // R8 (interface-shell): the path's project step, from the `project:` line of the action's own document (the
  // `action` read names no project) and the project's title from `list`.
  place: function (view) {
    const d = view.data.doc;
    const m = d && d.state === "ok" && d.value && typeof d.value.text === "string" ? /^project:\s*"?([^"\s]+)"?\s*$/m.exec(d.value.text) : null;
    const id = m ? m[1] : /^ACTN-/.test(String(view.subject || "")) ? null : String(view.subject || "");
    if (!id) return {};
    const l = view.data.projects;
    const rows = l && l.state === "ok" && l.value && Array.isArray(l.value.bundles) ? l.value.bundles : [];
    const hit = rows.find(function (b) { return b.bundle_id === id; });
    return hit ? { project: { id: id, title: hit.title || id } } : {};
  },

  reads: function (view) {
    const s = String(view.subject || "");
    const r = { projects: { op: "list", query: { type: "project", limit: "500" } } };
    if (/^ACTN-/.test(s)) {
      r.action = { op: "action", query: { id: s }, subject: true };
      r.filings = { op: "filingsfor", query: { action: s }, empty: function () { return false; } };
      r.profiles = { op: "profiles", empty: function () { return false; } };
      r.doc = { op: "file", query: { id: s, path: "bundle.md" }, empty: function () { return false; } };
    }
    return r;
  },

  parts: {
    draftsOf: draftsOf, stepOf: stepOf, sendSteps: sendSteps,
    isRequest: function () { return true; },
    // R4: the laws the profile names for a records request, each with its window (`profiles`' `view.deadlines`).
    laws: function (profiles) {
      const v = profiles && profiles.view ? profiles.view : {};
      return (Array.isArray(v.deadlines) ? v.deadlines : []).filter(function (d) { return d && d.applies_to === "records_request" && d.citation; });
    },
  },

  render: function (cs, view) {
    const P = view.parts;
    const s = String(view.subject || "");
    const head = cs.title(null) + '<p class="mk-sub">' + cs.w("screen.request.lookfirst")
      + ' <a class="cs-ref" href="/app/capture" data-nav>' + cs.w("screen.request.capture") + "</a></p>";
    const help = '<a class="cs-ref" href="/app/help-records" data-nav>' + cs.w("screen.help-records.name") + "</a>";
    if (!/^ACTN-/.test(s)) {
      // A new request: the office, then what is wanted; starting it opens the request's own address (its step).
      const offices = Array.isArray(view.ui.offices) ? view.ui.offices : null;
      const pick = offices && offices.length
        ? '<div class="cs-field"><label for="req-office">' + cs.w("screen.request.office") + '</label><select id="req-office" class="cs-input">'
          + offices.map(function (o, i) {
            const a = o.addressee || {};
            return '<option value="' + i + '">' + cs.esc([a.role, a.body].filter(Boolean).join(", ")) + "</option>";
          }).join("") + "</select><span class=\"help\">" + cs.w("screen.request.office.help") + "</span></div>"
        : offices ? '<p class="cs-state" data-state="empty">' + cs.w("screen.request.nooffice") + "</p>" : "";
      return head + cs.sec("screen.request.step.office", pick + '<div class="mk-acts">' + cs.act("addresseesuggest", {}) + "</div>")
        + cs.sec("screen.request.step.what", cs.field("req-what", "screen.request.what", { help: "screen.request.what.help" })
          + '<div class="mk-acts">' + cs.act("actioncreate", { tone: "primary" }) + "</div>")
        + '<p class="mk-note">' + help + "</p>";
    }
    return head + cs.state("action", function (a) {
      const office = a.addressee ? cs.esc([a.addressee.role, a.addressee.body].filter(Boolean).join(", "))
        + (a.addressee.holder_on_date && a.addressee.holder_on_date.holder ? " · " + cs.w("screen.request.holder", { holder: a.addressee.holder_on_date.holder }) : "") : "";
      const sub = '<p class="mk-sub">' + office + "</p>";
      const laws = Array.isArray(a.governing_laws) ? a.governing_laws : [];
      const pr = view.data.profiles;
      const offered = P.laws(pr && pr.state === "ok" ? pr.value : null);
      const lawSec = cs.sec("screen.request.step.law", (laws.length
        ? cs.sheet(laws.map(function (l) { return cs.row("", cs.esc(l.citation || ""), "", ""); }).join("")) : "")
        + (offered.length ? '<div class="cs-field"><label for="req-law">' + cs.w("screen.request.law") + '</label><select id="req-law" class="cs-input">'
          + offered.map(function (d, i) {
            return '<option value="' + i + '">' + cs.esc(d.citation) + " · " + cs.w("screen.request.window." + (d.count === "business" ? "business" : "calendar"), { n: String(d.amount) }) + "</option>";
          }).join("") + "</select></div>"
          + cs.choice("req-level", "screen.request.level", ["state", "city", "county", "federal"].map(function (k) { return [k, "screen.request.level." + k]; }))
          + '<div class="mk-acts">' + cs.act("actionlaws", {}) + "</div>"
          : cs.state("profiles", function () { return '<p class="cs-state" data-state="empty">' + cs.w("screen.request.nolaws") + "</p>"; }))
        + '<p class="mk-note">' + help + "</p>");
      const send = cs.sec("screen.request.step.text", cs.state("filings", function (f) { return P.sendSteps(cs, view, f, { request: true }); }));
      return sub + lawSec + send;
    });
  },

  acts: [
    {
      // R4: the offices that hold such records, each by its role; a suggestion, chosen by the member.
      op: "addresseesuggest",
      send: function (view) { return { query: { subject: view.subject } }; },
      rereads: [],
      done: function (view, answer, cs) { cs.set("offices", answer && Array.isArray(answer.offices) ? answer.offices : []); },
    },
    {
      // R4: "Start the request": what is wanted, in plain words, to the office chosen, under the project.
      op: "actioncreate",
      send: function (view, el, cs) {
        const what = String(cs.value("req-what") || "").trim();
        if (!what) return { refuse: "screen.request.what.needed" };
        const offices = Array.isArray(view.ui.offices) ? view.ui.offices : [];
        const chosen = offices[Number(cs.value("req-office"))];
        if (!chosen || !chosen.addressee) return { refuse: "screen.request.office.needed" };
        const q = function (v) { return JSON.stringify(String(v)); };
        const at = new Date(cs.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
        const ad = chosen.addressee;
        const lines = ["---", "id: PENDING", "object_type: action", "title: " + q(what.replace(/[\r\n]+/g, " ")), "current_state: planned",
          'created: "' + at + '"', 'last_updated: "' + at + '"', "project: " + view.subject, 'action_kind: "records_request"', "counterparty:"]
          .concat(Object.keys(ad).filter(function (k) { return ad[k] !== null && ad[k] !== undefined; }).map(function (k) { return "  " + k + ": " + q(ad[k]); }))
          .concat(["clock: []", "action_basis: []", "correspondence: []", "---", "", "## Action", "", what, ""]);
        return { body: { document: lines.join("\n") } };
      },
      done: function (view, answer, cs) { if (answer && answer.id) cs.go("request", answer.id); return { stay: true }; },
    },
    {
      // R4: the law it goes under, from the profile's laws for a records request.
      op: "actionlaws",
      send: function (view, el, cs) {
        const pr = view.data.profiles;
        const offered = view.parts.laws(pr && pr.state === "ok" ? pr.value : null);
        const d = offered[Number(cs.value("req-law"))];
        if (!d) return null;
        return { body: { target: view.subject, laws: [{ level: cs.value("req-level") || "state", citation: d.citation }] } };
      },
      rereads: ["action"],
    },
    Object.assign({}, PREPARE, { rereads: ["filings"] }),
    Object.assign({}, APPROVE, { rereads: ["filings"] }),
    Object.assign({}, RECORD_SENT, { rereads: ["filings", "action"] }),
  ],
});
