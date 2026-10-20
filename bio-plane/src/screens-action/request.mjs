/* Request records (registry screen `request`; screens-action R4, R7, R8, R10). Projects › <project> › Request records.
   Look first; then, in the flow's order: the office (by its role), what is wanted in plain words, the law it goes under
   (the laws the profile names, each with its window), the text with the period, form and cost limit (R8), approving it,
   and recording the sending with the portal's number. The subject is the project (a new request) or the action (one
   already started), and an action opens at the step it has reached (R10: approved and not sent opens at the send). With no
   office known to hold such records the screen says so and points an administrator to where one is added (R20); on every
   preparation it draws the matter's stake (R21).
   Every function here is self-contained (interface-shell R21 (1)). */
import { draftsOf, stepOf, sendSteps, draftOf, readFiling, stakeLines, readOnly, PREPARE, APPROVE, RECORD_SENT } from "./send-steps.mjs";

export const request = Object.freeze({
  id: "request",

  // R8 (interface-shell): the path's project step: the subject itself for a new request, else the project the `action` read
  // answers (actions R102), and the project's title from `list`.
  place: function (view) {
    const d = view.data.action;
    const own = d && d.state === "ok" && d.value && typeof d.value.project === "string" ? d.value.project : "";
    const id = own || (/^ACTN-/.test(String(view.subject || "")) ? null : String(view.subject || ""));
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
      // R21: the matter's stake (`filings` R60, R62) and the team's name; the question is `start-send`'s alone
      r.stake = { op: "stakeatpreparation", query: { action: s }, empty: function () { return false; } };
      r.identity = { op: "groupidentity", empty: function () { return false; } };
    } else if (s) {
      // R39: `addresseesuggest` resolves an entity or an action's records, never a project: the member says which name the records
      // concern first, from the names the record follows, and the offices are asked after she picks (the act below)
      r.names = { op: "peopledirectory", query: { show: "everything", limit: "200" }, empty: function () { return false; } };
    }
    return r;
  },

  parts: {
    draftsOf: draftsOf, stepOf: stepOf, sendSteps: sendSteps, draftOf: draftOf, readFiling: readFiling, stakeLines: stakeLines, readOnly: readOnly,
    isRequest: function () { return true; },
    // R20, R39: the offices known: those the member's last "Choose the office" answered, for the name she picked; none are known
    // before she asks (null), and a request opened with no subject at all knows none.
    officesOf: function (view) {
      if (Array.isArray(view.ui.offices)) return view.ui.offices;
      if (!String(view.subject || "")) return [];
      return null;
    },
    // R39: the names the record follows, as `peopledirectory` answers them (`{entity, kind, name}`), each a choice option
    namesOf: function (view) {
      const r = view.data.names;
      const rows = r && r.state === "ok" && r.value && Array.isArray(r.value.rows) ? r.value.rows : [];
      return rows.filter(function (x) { return x && typeof x.entity === "string" && typeof x.name === "string" && x.name; })
        .map(function (x) { return { value: x.entity, text: x.name }; });
    },
    // R4: the laws the profile names for a records request, each with its window (`profiles`' `view.deadlines`).
    laws: function (profiles) {
      const v = profiles && profiles.view ? profiles.view : {};
      return (Array.isArray(v.deadlines) ? v.deadlines : []).filter(function (d) { return d && d.applies_to === "records_request" && d.citation; });
    },
  },

  render: function (cs, view) {
    const P = view.parts;
    const s = String(view.subject || "");
    // R29: the door to the composer for any other kind of action, before the office is chosen, in both states
    const other = /^ACTN-/.test(s) ? "" : '<p class="mk-note">' + cs.w("screen.request.other") + '</p><div class="mk-links" data-list="actionnew"><a class="cs-ref" href="/app/actionnew/'
      + encodeURIComponent(String(view.subject || "")) + '" data-nav data-screen="actionnew">' + cs.w("screen.request.other.go") + '</a><span class="mk-small" data-purpose="actionnew">'
      + cs.w("screen.actionnew.name") + " · " + cs.w("screen.actionnew.purpose") + "</span></div>";
    const head = P.readOnly(cs, "screen.request.name") + cs.title(null) + '<p class="mk-sub">' + cs.w("screen.request.lookfirst")
      + ' <a class="cs-ref" href="/app/capture" data-nav>' + cs.w("screen.request.capture") + "</a></p>" + other;
    const help = '<a class="cs-ref" href="/app/help-records" data-nav>' + cs.w("screen.help-records.name") + "</a>";
    if (!/^ACTN-/.test(s)) {
      // A new request: which name the records concern (R39), then the office, then what is wanted; starting it opens the request's
      // own address (its step).
      const offices = P.officesOf(view);
      const names = P.namesOf(view);
      const asked = Array.isArray(view.ui.offices);
      const noOffice = function (pointer) {
        // R20: with no office known, the state says so and points an administrator to where one is added; nothing follows it.
        const I = '<svg class="i" aria-hidden="true"><use href="/app/assets/icons.svg#i-group"/></svg>';
        const places = view.me && view.me.administer === true
          ? '<div class="mk-links" data-list="places"><a class="cs-ref" href="/app/places" data-nav data-screen="places">' + I + cs.w("screen.places.name")
            + '</a><span class="mk-small" data-purpose="places">' + cs.w("screen.places.purpose") + "</span></div>" : "";
        // R46: a request that knows no office points to the page where an organization's records lines are kept (`screens-investigate`
        // C68): the name the member picked, where she picked one
        const keeper = pointer ? '<p class="mk-note">' + cs.w("screen.request.nooffice.pointer.a") + " " + cs.w("screen.request.nooffice.pointer.b") + "</p>"
          + '<div class="mk-links" data-list="person"><a class="cs-ref" href="/app/person/' + encodeURIComponent(pointer) + '" data-nav data-screen="person">'
          + cs.w("screen.person.name") + '</a><span class="mk-small" data-purpose="person">' + cs.w("screen.person.purpose") + "</span></div>" : "";
        return '<p class="mk-note" role="status">' + cs.w("screen.request.nooffice") + "</p>"
          + '<p class="mk-note">' + cs.w("screen.request.nooffice.admin") + "</p>" + keeper + places;
      };
      // a request opened with no subject at all, or a record that follows no name, cannot ask: it says no office is known
      if (offices !== null && !offices.length && !asked) return head + noOffice("");
      if (view.data.names && view.data.names.state !== "ok" && view.data.names.state !== "empty") return head + cs.state("names");
      if (!names.length && !asked) return head + noOffice("");
      const subjectPick = cs.choice("req-subject", "screen.person.keeper.subject.label", [{ value: "", text: "" }].concat(names), { value: String(view.ui.subject || "") })
        + '<p class="mk-note">' + cs.w("screen.person.keeper.subject.help.a") + " " + cs.w("screen.person.keeper.subject.help.b") + "</p>"
        + '<div class="mk-acts">' + cs.act("addresseesuggest", {}) + "</div>";
      const askStep = cs.sec("screen.request.step.office", subjectPick);
      if (offices === null) return head + askStep;
      if (!offices.length) return head + askStep + noOffice(String(view.ui.subject || ""));
      const pick = cs.choice("req-office", "screen.request.office", offices.map(function (o, i) {
        const a = o.addressee || {};
        return { value: String(i), text: [a.role, a.body].filter(Boolean).join(", ") };
      }), { value: String(view.ui.office || 0) }) + '<p class="mk-note">' + cs.w("screen.request.office.help") + "</p>";
      // "Start the request" is drawn once an office is chosen
      const what = view.ui.chosen === true ? cs.sec("screen.request.step.what", cs.field("req-what", "screen.request.what", { help: "screen.request.what.help" })
        + '<div class="mk-acts">' + cs.act("actioncreate", { tone: "primary" }) + "</div>") : "";
      return head + askStep + cs.sec("screen.request.step.office", pick) + what + '<p class="mk-note">' + help + "</p>";
    }
    return head + cs.state("action", function (a) {
      const office = a.addressee ? cs.esc([a.addressee.role, a.addressee.body].filter(Boolean).join(", "))
        + (a.addressee.holder_on_date && a.addressee.holder_on_date.holder ? " · " + cs.w("screen.request.holder", { holder: a.addressee.holder_on_date.holder }) : "") : "";
      const sub = '<p class="mk-sub">' + office + "</p>";
      // the laws a member stated, as `action` answers them (`actions` R25: `{state, laws, by, at}`)
      const laws = a.governing_laws && Array.isArray(a.governing_laws.laws) ? a.governing_laws.laws : [];
      const pr = view.data.profiles;
      const offered = P.laws(pr && pr.state === "ok" ? pr.value : null);
      const picker = offered.length
        ? cs.choice("req-law", "screen.request.law", offered.map(function (d, i) {
          return { value: String(i), key: "screen.request.law.option", fills: { citation: d.citation,
            window: { html: cs.w("screen.request.window." + (d.count === "business" ? "business" : "calendar"), { n: String(d.amount) }) } } };
        }))
          + cs.choice("req-level", "screen.request.level", ["state", "city", "county", "federal"].map(function (k) { return [k, "screen.request.level." + k]; }))
          + '<div class="mk-acts">' + cs.act("actionlaws", {}) + "</div>" : "";
      const lawSec = cs.sec("screen.request.step.law", (laws.length
        ? cs.sheet(laws.map(function (l) { return cs.row("", cs.esc(l.citation || ""), "", ""); }).join("")) : "")
        + (pr && pr.state === "ok" ? picker : cs.state("profiles"))
        + '<p class="mk-note">' + help + "</p>");
      const send = cs.sec("screen.request.step.text", cs.state("filings", function (f) { return P.sendSteps(cs, view, f, { request: true }); }));
      return sub + lawSec + send;
    });
  },

  acts: [
    {
      // R4: the offices that hold such records, each by its role; a suggestion, chosen by the member.
      op: "addresseesuggest",
      // R39: the subject is the name the member picked, never the project (the plane resolves an entity or an action's records)
      send: function (view, el, cs) {
        const subject = String(cs.value("req-subject") || "");
        if (!subject) return null;
        view.ui.subject = subject;
        view.ui.pick = Number(cs.value("req-office")) || 0;
        return { query: { subject: subject } };
      },
      rereads: [],
      // "Choose the office": the offices the record holds for that name, each by its role and who holds it today; what is wanted is
      // asked once there are offices to choose among.
      done: function (view, answer, cs) {
        const offices = answer && Array.isArray(answer.offices) ? answer.offices : [];
        cs.set("offices", offices);
        cs.set("office", 0);
        cs.set("chosen", offices.length > 0);
      },
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
