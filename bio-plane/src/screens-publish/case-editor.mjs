/* The case editor (registry screen `case-editor`; R1): Projects › <project> › Case. A project's case drafts, and the one
 * chosen: its readiness ladder, its scope, what it leaves out with each acknowledgement, the people it names with their
 * reasons, and what changed since the last edition. Its subject is the project, or `<project>/<draft>` for one draft
 * (the newest otherwise). Every function is self-contained (interface-shell R21 (1)): it refers only to its parameters,
 * the kit `cs` and the module's `parts`. */
import { PARTS } from "./parts.mjs";

export const CASE_EDITOR = Object.freeze({
  id: "case-editor",
  parts: PARTS,

  // R1's reads: the project (its title, for the path) and its case drafts; the chosen draft's own reads wait on these.
  reads: function (view) {
    const project = String(view.subject || "").split("/")[0];
    return {
      project: { op: "image", query: { id: project } },
      drafts: { op: "casedrafts", query: { project: project }, subject: true,
        empty: function (v) { return !v || !Array.isArray(v.drafts) || v.drafts.length === 0; } },
    };
  },

  place: function (view) {
    const id = String(view.subject || "").split("/")[0];
    const p = view.data.project;
    return { project: { id: id, title: view.parts.titleOf(p && p.state === "ok" ? p.value : null, id) } };
  },

  render: function (cs, view) {
    const P = view.parts;
    const parts = String(view.subject || "").split("/");
    const project = parts[0];
    const d = view.data.drafts;
    const drafts = d && d.state === "ok" && Array.isArray(d.value.drafts) ? d.value.drafts : [];
    const chosen = drafts.find(function (x) { return x.draft_id === parts[1]; }) || drafts[drafts.length - 1] || null;
    view.ui.draft = chosen;
    const out = [];
    const caseOf = chosen && chosen.case ? chosen.case : null;
    const edition = caseOf && caseOf.edition !== undefined && caseOf.edition !== null ? String(caseOf.edition) : "";
    out.push(cs.title(caseOf && caseOf.identity ? caseOf.identity + (edition ? " · " + edition : "") : null, { thing: "case" }));

    // Every draft of the project, each opening its own editor; the chosen one marked.
    out.push(cs.sec("screen.case-editor.drafts", cs.state("drafts", function (v) {
      return cs.sheet(v.drafts.map(function (x) {
        const c = x.case || {};
        const name = c.identity ? c.identity : x.draft_id;
        const link = '<a href="/app/case-editor/' + encodeURIComponent(project + "/" + x.draft_id) + '" data-nav'
          + (chosen && x.draft_id === chosen.draft_id ? ' aria-current="true"' : "") + ">" + cs.esc(name) + "</a>";
        return cs.row("", link, c.edition ? '<span class="meta">' + cs.w("screen.case-editor.edition", { n: String(c.edition) }) + "</span>" : "",
          cs.w("screen.case-editor.preparedby", { who: x.updated_by || x.created_by || "" }));
      }).join(""));
    }, { empty: "screen.case-editor.nodrafts" })));

    // A new draft, or this one changed: its scope and what it says (`casedraft`, R1), with writing help under the scope.
    const copy = chosen ? P.later(cs, view, "copy", "reviewcopy", { query: { draft: chosen.draft_id } }) : null;
    const authored = copy && copy.state === "ok" && copy.value.authored ? copy.value.authored : {};
    out.push(cs.sec("screen.case-editor.scope", cs.field("ce-scope", "screen.case-editor.scope.label", { area: true, rec: true, value: authored.scope || "", help: "screen.case-editor.scope.help" })
      + cs.field("ce-statement", "screen.case-editor.statement.label", { area: true, rec: true, value: authored.statement || "" })
      + '<div class="cs-actrow">' + cs.act("writinghelp", { data: { field: "scope" } }) + cs.act("casedraft", { tone: "primary" }) + "</div>"
      + P.said(view, "help-scope") + P.said(view, "casedraft")));
    if (!chosen) return out.join("");

    // The readiness ladder: each rung "not yet evaluated" until its check answers (R1).
    const check = caseOf && caseOf.case_id ? P.later(cs, view, "check", "casecheck", { query: { case: caseOf.case_id, edition: edition } }) : null;
    const doc = caseOf && caseOf.case_id && edition ? P.later(cs, view, "document", "casedocument", { query: { case: caseOf.case_id, edition: edition } }) : null;
    const held = check && check.state === "ok" ? check.value.state : null;
    const gates = copy && copy.state === "ok" ? copy.value.gates : null;
    const distributed = (held === "published") || (doc && doc.state === "ok" && !!doc.value.published_at);
    const rungs = [
      ["draft", true],
      ["internal", held === "held" || held === "published" ? true : held === "void" ? false : null],
      ["external", gates === "passed" ? true : gates === "refused" ? false : null],
      ["distributed", distributed ? true : null],
    ];
    out.push(cs.sec("screen.case-editor.ladder", '<ol class="cs-ladder" data-ladder="ready">' + rungs.map(function (r) {
      const said = r[1] === true ? "" : r[1] === false ? cs.w("screen.case-editor.rung.notmet") : cs.w("screen.case-editor.rung.notyet");
      return '<li data-rung="' + r[0] + '" class="' + (r[1] === true ? "on" : "") + '">' + cs.w("screen.case-editor.rung." + r[0])
        + (said ? ' <span class="meta">' + said + "</span>" : "") + "</li>";
    }).join("") + "</ol>" + (check ? cs.state(check, function () { return ""; }) : "")));

    // What it leaves out, with each acknowledgement and its acknowledger's own reason (R1; case-inputs R1).
    out.push(cs.sec("screen.case-editor.leavesout", copy ? cs.state(copy, function (v) {
      const ex = Array.isArray(v.authored && v.authored.excluded) ? v.authored.excluded : v.authored && v.authored.excluded ? [v.authored.excluded] : [];
      const acks = v.statement_acknowledgements && Array.isArray(v.statement_acknowledgements.acknowledgements) ? v.statement_acknowledgements.acknowledgements : [];
      return (ex.length ? cs.sheet(ex.map(function (e) {
        return cs.row("", '<span class="rec">' + cs.esc(typeof e === "string" ? e : e.description || e.target || "") + "</span>",
          typeof e === "object" && e.reason ? '<span class="meta">' + cs.esc(e.reason) + "</span>" : "");
      }).join("")) : '<p class="muted">' + cs.w("screen.case-editor.leavesout.none") + "</p>")
        + (acks.length ? cs.sheet(acks.map(function (a) {
          return cs.row("", cs.w("screen.case-editor.ack.by", { who: a.by || a.recipient || "" }), '<span class="rec">' + cs.esc(a.reason || "") + "</span>", a.at ? cs.date(a.at) : "");
        }).join("")) : '<p class="muted">' + cs.w("screen.case-editor.ack.none") + "</p>")
        + cs.field("ce-ackreason", "screen.case-editor.ack.reason", { area: true, help: "screen.case-editor.ack.reason.help" })
        + '<div class="cs-actrow">' + cs.act("statementack") + "</div>";
    }) : ""));

    // The people it names, each with its reason or that the reason is missing (R1; `attribute`).
    out.push(cs.sec("screen.case-editor.people", copy ? cs.state(copy, function (v) {
      const obs = Array.isArray(v.observations) ? v.observations : [];
      if (!obs.length) return '<p class="muted">' + cs.w("screen.case-editor.people.none") + "</p>";
      return cs.sheet(obs.map(function (o, i) {
        const why = o.stated ? '<span class="rec">' + cs.esc(typeof o.stated === "string" ? o.stated : o.stated.reason || "") + "</span>"
          : '<span class="muted">' + cs.w("screen.case-editor.people.noreason") + "</span>";
        const level = o.chosen ? cs.w("screen.case-editor.level." + String(o.chosen.level || o.chosen)) : "";
        const fields = cs.choice("ce-level-" + i, "screen.case-editor.level.label", ["name", "cover", "project", "group"].map(function (l) { return [l, "screen.case-editor.level." + l]; }))
          + cs.field("ce-why-" + i, "screen.case-editor.people.reason", { area: true });
        return cs.row("", '<span class="rec">' + cs.esc(o.observation) + "</span>" + (level ? " · " + level : "") + " · " + why, "",
          fields + cs.act("attribute", { data: { observation: o.observation, index: String(i) } }));
      }).join(""));
    }) : ""));

    // What changed since the last edition: the member's words, the drafts labelled machine work, writing help (R1).
    if (caseOf && caseOf.case_id) {
      const changed = P.later(cs, view, "changed", "whatchangeddrafts", { query: { case: caseOf.case_id } },
        function (v) { return !v || !Array.isArray(v.drafts) || v.drafts.length === 0; });
      out.push(cs.sec("screen.case-editor.changed", cs.field("ce-wc", "screen.case-editor.changed.label", { area: true, rec: true, help: "screen.case-editor.changed.help" })
        + '<div class="cs-actrow">' + cs.act("writinghelp", { data: { field: "whatchanged" } }) + (view.reachable ? cs.act("whatchangedpropose") : "") + "</div>"
        + P.said(view, "help-whatchanged") + P.said(view, "whatchangedpropose")
        + cs.state(changed, function (v) {
          return cs.sheet(v.drafts.map(function (x) {
            const machine = x.label && (x.label.machine || x.label.kind === "machine" || x.label.by === "machine");
            return cs.row(machine ? cs.mark("origin", "machine") : "", '<span class="rec">' + cs.esc(x.text) + "</span>"
              + (x.untested ? '<span class="cs-note">' + cs.w("ai.label.untested") + "</span>" : ""), "", x.at ? cs.date(x.at) : "");
          }).join(""));
        }, { empty: "screen.case-editor.changed.none" })));
    }
    if (doc) out.push(cs.state(doc, function () { return ""; }));
    return out.join("");
  },

  acts: [
    {
      // R1: "Prepare the draft": a new draft of the project, or the chosen one changed, with the member's scope and words.
      op: "casedraft", label: "act.casedraft.label.case-editor",
      send: function (view, el, cs) {
        const scope = String(cs.value("ce-scope") || "").trim();
        const statement = String(cs.value("ce-statement") || "").trim();
        if (!scope) return { refuse: "screen.case-editor.scope.needed" };
        const body = { scope: scope };
        if (statement) body.statement = statement;
        if (view.ui.draft) body.draft = view.ui.draft.draft_id; else body.project = String(view.subject || "").split("/")[0];
        return { body: body };
      },
      done: function (view, answer, cs) { view.parts.forget(view); view.parts.say(cs, view, "casedraft", cs.w("screen.case-editor.prepared")); },
    },
    {
      // R1: a draft of "what changed", recorded labelled by who proposed it, while the assistant is reachable.
      op: "whatchangedpropose", label: "act.whatchangedpropose.label.case-editor",
      send: function (view, el, cs) {
        const c = view.ui.draft && view.ui.draft.case;
        const text = String(cs.value("ce-wc") || "").trim();
        if (!c || !c.case_id) return null;
        if (!text) return { refuse: "screen.case-editor.changed.needed" };
        return { query: { case: c.case_id }, body: { text: text } };
      },
      done: function (view, answer, cs) {
        const r = view.parts.value(answer) || {};
        view.parts.forget(view);
        view.parts.say(cs, view, "whatchangedpropose", cs.w("screen.case-editor.changed.kept") + (r.untested ? " " + cs.w("ai.label.untested") : ""));
      },
    },
    {
      // R1; case-inputs R1: the acknowledgement of what the case leaves out, with the acknowledger's own reason.
      op: "statementack", label: "act.statementack.label.case-editor", reasonField: "reason",
      refusals: { STATEMENT_ACK_NO_REASON: "screen.case-editor.ack.reason.needed" },
      send: function (view, el, cs) {
        if (!view.ui.draft) return null;
        return { query: { draft: view.ui.draft.draft_id }, body: { reason: String(cs.value("ce-ackreason") || "").trim() } };
      },
      done: function (view) { view.parts.forget(view); },
    },
    {
      // R1: a person the case names, with the reason it must (its consequence in the shell's dialog, op-grades R4).
      op: "attribute", label: "act.attribute.label.case-editor", reasonField: "reason",
      send: function (view, el, cs) {
        const c = view.ui.draft && view.ui.draft.case;
        if (!c || !c.case_id) return { refuse: "screen.case-editor.people.nocase" };
        const i = el.dataset.index;
        return { body: { caseId: c.case_id, edition: Number(c.edition), observation: el.dataset.observation,
          level: String(cs.value("ce-level-" + i) || "name"), reason: String(cs.value("ce-why-" + i) || "").trim() } };
      },
      done: function (view) { view.parts.forget(view); },
    },
    {
      // R1 (interface-shell R20): help with the scope's or "what changed"'s words, never a reason; drawn as a labelled draft.
      op: "writinghelp", label: "act.writinghelp.label.case-editor",
      send: function (view, el, cs) {
        const field = el.dataset.field === "whatchanged" ? "whatchanged" : "scope";
        const told = String(cs.value(field === "scope" ? "ce-scope" : "ce-wc") || "").trim();
        if (!told) return { refuse: "screen.case-editor.help.needed" };
        view.ui.helpFor = field;
        return { body: { op: field === "scope" ? "casedraft" : "whatchangedpropose", field: field, told: told } };
      },
      done: function (view, answer, cs) {
        const r = view.parts.value(answer) || {};
        const which = view.ui.helpFor || "scope";
        view.parts.say(cs, view, "help-" + which, cs.w("screen.case-editor.help.draft") + ' <span class="rec">' + cs.esc(r.text || "") + "</span>"
          + (r.untested ? " " + cs.w("ai.label.untested.writinghelp") : ""));
        return { stay: true };
      },
    },
  ],
});
