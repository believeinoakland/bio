/* One matter (registry screen `matter`; screens-action R6, R7; DEC-89). Projects › <project> › Matter: one government
   act's determination (the standard it is tested against, what it requires and what the act did, its outcome, compliant
   or not, recorded with the same care either way), its consequences (an undetermined measure never read as zero, people
   counted as a class), and its escalation (the seven stages, the proposed next stage and its trigger, what ends it, the
   actions attached, the legal tools a stage makes available listed as facts, never as advice). The subject is the
   determination's id, and `<determination>~<escalation>` once an escalation is opened. Every function here is self-
   contained (interface-shell R21 (1)). */

export const matter = Object.freeze({
  id: "matter",

  place: function (view) {
    const d = view.data.determination;
    const v = d && d.state === "ok" ? d.value : null;
    if (!v || !v.project) return {};
    const l = view.data.projects;
    const rows = l && l.state === "ok" && l.value && Array.isArray(l.value.bundles) ? l.value.bundles : [];
    const hit = rows.find(function (b) { return b.bundle_id === v.project; });
    return { project: { id: v.project, title: (hit && hit.title) || v.project } };
  },

  reads: function (view) {
    const s = String(view.subject || "");
    const det = s.split("~")[0], esc = s.split("~")[1];
    const r = {
      determination: { op: "determination", query: { id: det }, subject: true },
      consequences: { op: "consequencesof", query: { determination: det },
        empty: function (v) { return !v || !Array.isArray(v.parts) || v.parts.length === 0; } },
      status: { op: "escalationstatus", query: { determination: det }, empty: function () { return false; } },
      projects: { op: "list", query: { type: "project", limit: "500" } },
    };
    if (esc) r.escalation = { op: "escalation", query: { id: esc } };
    return r;
  },

  parts: {
    det: function (view) { return String(view.subject || "").split("~")[0]; },
    outcome: function (o) { return ["compliant", "noncompliant", "unclear"].includes(o) ? o : "undetermined"; },
    measure: function (cs, p) {
      if (p.state === "undetermined" || p.measure === null || p.measure === undefined) return cs.w("screen.matter.undetermined");
      const m = p.measure;
      if (typeof m !== "object") return cs.esc(String(m));
      return cs.esc([m.amount !== undefined ? m.amount : m.value, m.currency || m.unit].filter(function (x) { return x !== undefined && x !== null && x !== ""; }).join(" "));
    },
    affected: function (cs, p) {
      const a = p.affected;
      if (!a) return "";
      if (typeof a !== "object") return cs.esc(String(a));
      return cs.esc(a.name || a.description || a.label || "") + (a.kind ? " · " + cs.esc(a.kind) : "");
    },
  },

  render: function (cs, view) {
    const P = view.parts;
    const det = P.det(view);
    return cs.state("determination", function (d) {
      const act = d.act || {};
      const actor = act.actor ? [act.actor.role, act.actor.body].filter(Boolean).join(", ") : "";
      const head = cs.title(null) + '<p class="mk-sub">' + cs.esc(act.event || act.id || "") + (actor ? " · " + cs.w("screen.matter.by", { actor: actor }) : "")
        + (act.when ? " · " + cs.date(act.when) : "") + "</p>";

      // R6: the determination: each standard, what it requires and what the act did, its outcome, either way alike.
      const standards = Array.isArray(d.standards) ? d.standards : [];
      const detSec = cs.sec("screen.matter.determination", (standards.length ? cs.sheet(standards.map(function (s) {
        const rows = Array.isArray(s.rows) ? s.rows : [];
        return cs.row("<b>" + cs.esc(s.standard || "") + "</b>", rows.map(function (r) {
          return cs.w("screen.matter.requires", { requires: r.requires || "" }) + " · " + cs.w("screen.matter.did", { did: r.did || "" });
        }).join("<br>"), cs.w("screen.matter.outcome." + P.outcome(s.outcome)), "");
      }).join("")) : '<p class="cs-state" data-state="empty">' + cs.w("screen.matter.nostandards") + "</p>")
        + '<p class="mk-note">' + cs.w("screen.matter.samecare") + "</p>"
        + (d.live === false ? '<p class="mk-note">' + cs.w("screen.matter.notlive") + "</p>" : ""));

      // R6: the consequences: who or what, the measure and how it is known.
      const cons = cs.sec("screen.matter.consequences", cs.state("consequences", function (c) {
        return cs.sheet(c.parts.map(function (p) {
          return cs.row(P.affected(cs, p), P.measure(cs, p), '<span class="meta">' + cs.w("screen.matter.known." + (["computed", "assessed"].includes(p.state) ? p.state : "undetermined"))
            + (p.label ? " · " + cs.esc(p.label) : "") + "</span>", "");
        }).join(""));
      }, { empty: "screen.matter.noconsequences" }) + '<p class="mk-note">' + cs.w("screen.matter.neverzero") + "</p>");

      // R6: the escalation.
      const st = view.data.status;
      const status = st && st.state === "ok" ? st.value : null;
      const escs = status && Array.isArray(status.escalations) ? status.escalations : [];
      const live = escs.find(function (e) { return e.state !== "ended"; });
      const e = view.data.escalation;
      let escSec;
      if (e) {
        escSec = cs.state("escalation", function (x) {
          const stage = Number(x.stage) || 1;
          const ladder = '<ol class="cs-ladder" data-ladder="stage">' + [1, 2, 3, 4, 5, 6, 7].map(function (n) {
            return "<li" + (n === stage ? ' aria-current="step"' : "") + ">" + cs.w("screen.matter.stage." + n) + "</li>";
          }).join("") + "</ol>";
          const prop = Array.isArray(x.proposed) && x.proposed.length ? x.proposed[0] : null;
          const proposed = prop ? '<p class="mk-note">' + cs.w("screen.matter.proposed", { stage: { html: cs.w("screen.matter.stage." + (Number(prop.to || prop.stage) || 1)) } })
            + (prop.says ? " · " + cs.esc(prop.says) : "") + "</p>" : "";
          const open = x.state === "open";
          const stopped = x.state === "stopped_pursuing";
          const to = prop ? Number(prop.to || prop.stage) : stage + 1;
          const acts = open ? cs.act("escalationadvance", { label: "screen.matter.advance", fills: { n: String(to) }, data: { to: String(to) } })
            + cs.act("escalationend", {}) + cs.act("escalationstoppursuing", {})
            : stopped ? cs.act("escalationreopen", {}) : "";
          const exit = x.exit ? '<ul class="mk-list"><li>' + cs.w("screen.matter.exit.compliance") + " · " + cs.esc(typeof x.exit.compliance === "object" && x.exit.compliance ? x.exit.compliance.says || x.exit.compliance.state || "" : String(x.exit.compliance || ""))
            + "</li><li>" + cs.w("screen.matter.exit.consequences") + " · " + cs.esc(typeof x.exit.consequences === "object" && x.exit.consequences ? x.exit.consequences.says || x.exit.consequences.state || "" : String(x.exit.consequences || "")) + "</li></ul>" : "";
          const actions = Array.isArray(x.actions) && x.actions.length ? cs.sheet(x.actions.map(function (a) {
            return cs.row("", '<a class="cs-ref" href="/app/action/' + encodeURIComponent(a.action) + '" data-nav>' + cs.esc(a.action) + "</a>",
              '<span class="meta">' + cs.w("screen.matter.atstage", { stage: { html: cs.w("screen.matter.stage." + (Number(a.stage) || 1)) } }) + "</span>", "");
          }).join("")) : '<p class="cs-state" data-state="empty">' + cs.w("screen.matter.noactions") + "</p>";
          const avail = x.available ? '<p class="mk-note">' + cs.w("screen.matter.available") + "</p>" + cs.sheet((Array.isArray(x.available) ? x.available : [x.available]).map(function (t) {
            return cs.row("", cs.esc(typeof t === "object" ? t.label || t.kind || t.venue || "" : String(t)), "", "");
          }).join("")) : "";
          return '<p class="mk-sub">' + cs.w("screen.matter.escstate." + (["open", "suspended", "stopped_pursuing", "ended"].includes(x.state) ? x.state : "open")) + "</p>"
            + ladder + proposed + '<div class="mk-acts">' + acts + "</div>"
            + "<h3>" + cs.w("screen.matter.endswhen") + "</h3>" + exit + "<h3>" + cs.w("screen.matter.actions") + "</h3>" + actions + avail;
        });
      } else {
        escSec = cs.state("status", function () {
          const list = escs.length ? cs.sheet(escs.map(function (x) {
            return cs.row("", '<a class="cs-ref" href="/app/matter/' + encodeURIComponent(det + "~" + x.id) + '" data-nav>' + cs.w("screen.matter.openesc") + "</a>",
              '<span class="meta">' + cs.w("screen.matter.stage." + (Number(x.stage) || 1)) + "</span>", "");
          }).join("")) : "";
          const declined = status && Array.isArray(status.declines) ? status.declines.filter(function (x) { return !x.superseded_by; }) : [];
          return list + (declined.length ? '<p class="mk-note">' + cs.w("screen.matter.declined", { reason: declined[declined.length - 1].reason || "" }) + "</p>" : "")
            + (!live ? '<div class="mk-acts">' + cs.act("escalationopen", {}) + cs.act("declinetoescalate", {}) + "</div>" : "");
        });
      }
      return head + detSec + cons + cs.sec("screen.matter.escalation", escSec);
    });
  },

  acts: [
    {
      // R6: open an escalation of this determination, with the member's reason (asked by the shell).
      op: "escalationopen",
      send: function (view) { return { body: { determination: view.parts.det(view) } }; },
      done: function (view, answer, cs) { if (answer && answer.id) cs.go("matter", view.parts.det(view) + "~" + answer.id); return { stay: true }; },
    },
    {
      op: "escalationadvance",
      send: function (view, el) { return { body: { id: String(view.subject).split("~")[1], to: Number(el.dataset.to) } }; },
    },
    {
      op: "declinetoescalate",
      send: function (view) { return { body: { determination: view.parts.det(view) } }; },
    },
    {
      // R6: terminal; its dialog states what ending does (`act.escalationend.does`).
      op: "escalationend",
      send: function (view) { return { body: { id: String(view.subject).split("~")[1] } }; },
    },
    {
      op: "escalationstoppursuing",
      send: function (view) { return { body: { id: String(view.subject).split("~")[1] } }; },
    },
    {
      op: "escalationreopen",
      send: function (view) { return { body: { id: String(view.subject).split("~")[1] } }; },
    },
  ],
});
