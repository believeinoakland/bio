/* The action plan (registry screen `plan`; screens-action R1, R7, R13; K608 (4); v0.2 rules 18, 19). Projects › <project> ›
   Action plan: the plan's matters (its subjects, each with its determination's support and its escalation's stage), its
   options (sorted and picked as rows, interface-shell R19), the standing offers and, while the assistant is reachable,
   the proposals labelled machine work "not yet in the plan" and "Ask the assistant for options" (a planning run, drawn
   running until it ends, R13), its scenarios and their checkpoints, what each started
   option became, and the checks. Every function here is self-contained (interface-shell R21 (1)): it refers only to its
   parameters, the kit `cs` and the language's own globals. The subject is the plan's id. It holds no member-facing English
   (R19): each sentence is a key read through the kit's `cs.w`, and the plan names its project and its questions by their
   titles, each a reference (R18). */

export const plan = Object.freeze({
  id: "plan",

  // R8 (interface-shell): Projects › <project> › Action plan; the project's title from `list` (the plan read names
  // only the project's id).
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
    const r = {
      plan: { op: "plan", query: { id: view.subject }, subject: true },
      projects: { op: "list", query: { type: "project", limit: "500" } },
    };
    // R1: the assistant's suggestions are read only while it is reachable for this member.
    if (view.reachable) r.proposals = {
      op: "planproposals", query: { plan: view.subject },
      empty: function (v) { return !v || !Array.isArray(v.proposals) || v.proposals.length === 0; },
    };
    return r;
  },

  parts: {
    // R18: a matter's own line, named by its title as the record answers it (never an `INQ-…` reference), each a reference
    // the kit links; a determination links its screen.
    matterName: function (cs, s, titles) {
      const sub = s && s.subject ? s.subject : {};
      if (sub.kind === "outcome" && sub.determination)
        return '<a class="cs-ref" href="/app/matter/' + encodeURIComponent(sub.determination + (s.escalation && s.escalation.id ? "~" + s.escalation.id : "")) + '" data-nav>'
          + cs.esc(titles.determination(sub.determination) || sub.determination) + "</a>" + (sub.standard ? " · " + cs.esc(sub.standard) : "");
      const t = sub.inquiry ? titles.question(sub.inquiry) : "";
      return t ? cs.ref("question", sub.inquiry, t, [t]) : "";
    },
    // R18: the titles the record answers, by the reference a plan holds: a question's from `projectquestions`, a
    // determination's act from `determinations`; "" where it is not (yet) answered, never the reference itself.
    titlesOf: function (qs, ds) {
      const qm = new Map(qs.items.map(function (q) { return [q.inquiry, typeof q.title === "string" ? q.title : ""]; }));
      const dm = new Map(ds.items.map(function (d) { return [d.id, d.act && typeof d.act.event === "string" ? d.act.event : ""]; }));
      const ofKey = function (k) {
        const m = /^(inquiry|outcome):([^#]+)(?:#(.*))?$/.exec(String(k));
        if (!m) return "";
        if (m[1] === "inquiry") return qm.get(m[2]) || "";
        const t = dm.get(m[2]) || "";
        return t ? t + (m[3] ? " · " + m[3] : "") : "";
      };
      return { question: function (id) { return qm.get(id) || ""; }, determination: function (id) { return dm.get(id) || ""; }, ofKey: ofKey,
        questions: qs, determinations: ds };
    },
    // R18: a list the record answers (`projectquestions`, `determinations`), read page after page by its cursor (at most
    // five), each page once and kept in the page's memory.
    paged: function (cs, view, key, op, query) {
      const items = [];
      let after = null, state = "ok";
      for (let n = 0; n < 5; n++) {
        const st = view.parts.later(cs, view, key + ":" + n, op, after ? Object.assign({}, query, { after: after }) : query, "");
        if (st.state !== "ok") { state = st.state; break; }
        items.push.apply(items, Array.isArray(st.value.items) ? st.value.items : []);
        after = st.value.cursor;
        if (!after) break;
      }
      return { items: items, state: state };
    },
    // R18 (D29): an answer that is `ok` yet carries a refusal (`started: false` with no run already asked,
    // `dispatched: false` or `withheld`) is that refusal; drawn by its words where the code has them, else by the words
    // the answer carries, else "could not be read".
    refused: function (a) {
      return !!a && (a.ok === false || (a.started === false && a.existed !== true) || a.dispatched === false || !!a.withheld);
    },
    refusalWords: function (cs, a) {
      const code = String(a.code || (typeof a.withheld === "string" ? a.withheld : "") || "");
      const key = "refusal." + code;
      if (code && cs.w(key) !== cs.esc(key)) return cs.w(key);
      return typeof a.translation === "string" && a.translation ? cs.esc(a.translation) : cs.w("shell.unread");
    },
    // The option's regulated end: the latest of its dates (the order R1 sorts on), or none.
    endOf: function (o) {
      const ds = Array.isArray(o.dates) ? o.dates.map(function (d) { return String(d && d.date || ""); }).filter(Boolean).sort() : [];
      return ds.length ? ds[ds.length - 1] : "";
    },
    // R13: a read the page makes itself, once per query and token, kept in the page's memory (as `screens-inquiry` R8's dock).
    later: function (cs, view, key, op, query, token) {
      const L = view.ui.later || (view.ui.later = {});
      const q = JSON.stringify(query) + "#" + (token || "");
      if (!L[key] || L[key].q !== q) {
        L[key] = { q: q, state: "loading" };
        const settle = function (o) { L[key] = Object.assign({ q: q }, o); cs.set("later", L); };
        cs.call(op, { query: query }).then(function (a) {
          const r = a && a.result !== undefined ? a.result : a;
          if (!r || r.ok === false) {
            const code = String((r && (r.code || r.reason)) || "");
            settle({ state: "failed", refusal: { code: code, words: cs.esc((r && r.translation) || code) } });
          } else settle({ state: "ok", value: r });
        }, function () { settle({ state: "failed", refusal: null }); });
      }
      return L[key];
    },
    subjectKeys: function (o) {
      return (Array.isArray(o.subjects) ? o.subjects : []).map(function (x) {
        return typeof x === "string" ? x : x && x.kind === "outcome" ? "outcome:" + x.determination + "#" + x.standard : x && x.inquiry ? "inquiry:" + x.inquiry : "";
      }).filter(Boolean);
    },
  },

  render: function (cs, view) {
    const P = view.parts;
    const CATS = ["mitigation", "legal", "awareness", "journalistic", "grassroots", "other"];
    return cs.state("plan", function (p) {
      const open = p.state !== "closed";
      const subjects = Array.isArray(p.subjects) ? p.subjects : [];
      const options = Array.isArray(p.options) ? p.options : [];
      // R18: the plan's project and its questions, named by their titles as the record answers them, each a reference.
      const lists = p.project ? { questions: P.paged(cs, view, "questions", "projectquestions", { project: p.project, limit: "100" }),
        determinations: P.paged(cs, view, "determinations", "determinations", { project: p.project, live: "true", limit: "100" }) } : null;
      const titles = P.titlesOf(lists ? lists.questions : { items: [] }, lists ? lists.determinations : { items: [] });
      const projects = view.data.projects && view.data.projects.state === "ok" && view.data.projects.value && Array.isArray(view.data.projects.value.bundles)
        ? view.data.projects.value.bundles : [];
      const projectHit = projects.find(function (b) { return b.bundle_id === p.project; });
      const projectRef = projectHit && projectHit.title ? cs.ref("project", p.project, projectHit.title, [projectHit.title]) : "";
      const head = cs.title(p.title || p.id)
        + '<p class="mk-sub">' + cs.w("screen.plan.state." + (["open", "paused", "closed"].includes(p.state) ? p.state : "open"))
        + (p.opened_at ? " · " + cs.w("screen.plan.opened", { date: { html: cs.date(p.opened_at) } }) : "") + (projectRef ? " · " + projectRef : "") + "</p>"
        + (p.closed ? '<p class="mk-sub">' + cs.w("screen.plan.closedwhy", { reason: p.closed.reason || "" }) + "</p>" : "");

      // R1: the checks strip states each check (its own sentence, as the plan read answers it).
      const checks = Array.isArray(p.checks) ? p.checks : [];
      const strip = checks.length
        ? '<div class="mk-checks2" role="region" aria-label="' + cs.w("screen.plan.checks", { n: String(checks.length) }) + '"><b>'
          + cs.w("screen.plan.checks", { n: String(checks.length) }) + "</b>"
          + checks.map(function (c) { return "<p>" + cs.esc(c.says || c.check || "") + "</p>"; }).join("") + "</div>"
        : "";

      // R18: a reference is picked from the lists the record answers (the project's questions, the project's determinations
      // with their standards), never typed; what the plan already holds is not offered again.
      const held = new Set(subjects.map(function (s) { return s.key; }));
      const pickable = lists ? lists.questions.items.map(function (q, i) {
        return { value: "inquiry:" + q.inquiry, text: typeof q.title === "string" && q.title ? q.title : null, n: i + 1 };
      }).concat(lists.determinations.items.flatMap(function (d) {
        return (Array.isArray(d.outcomes) ? d.outcomes : []).map(function (o) {
          const t = d.act && d.act.event ? d.act.event : "";
          return { value: "outcome:" + d.id + "#" + o.standard, text: t ? t + " · " + o.standard : o.standard, n: 0 };
        });
      })).filter(function (o) { return !held.has(o.value); }) : [];
      const choices = pickable.map(function (o) {
        return o.text ? { value: o.value, text: o.text } : { value: o.value, key: "screen.plan.matter.n", fills: { n: String(o.n) } };
      });
      const listsState = lists ? ["questions", "determinations"].map(function (k) { return lists[k].state; }) : ["ok"];
      const addMatter = choices.length
        ? cs.choice("plan-subject-id", "screen.plan.subject.id", choices)
          + cs.field("plan-subject-reason", "screen.plan.subject.reason", { help: "screen.plan.subject.reason.help" })
          + '<div class="mk-acts">' + cs.act("plansubjectadd", { label: "act.plansubjectadd.label.plan" }) + "</div>"
        : listsState.includes("failed") ? cs.state({ state: "failed" }) : "";

      // R1, R7: the plan's subjects, called matters.
      const mattersIn =(subjects.length ? cs.sheet(subjects.map(function (s, i) {
        const esc = s.escalation && s.escalation.id
          ? cs.w("screen.plan.escalation", { stage: { html: cs.w("screen.matter.stage." + (Number(s.escalation.stage) >= 1 && Number(s.escalation.stage) <= 7 ? Number(s.escalation.stage) : 1)) } })
          : s.escalation && s.escalation.state === "undetermined" ? cs.w("screen.plan.escalation.undetermined") : "";
        const live = s.liveness && s.liveness.state && s.liveness.state !== "live" ? " · " + cs.w("screen.plan.liveness." + (s.liveness.state === "superseded" ? "superseded" : "closed")) : "";
        const took = view.ui.took || {};
        const take = s.escalation && s.escalation.id && took["escalation_stage:" + s.escalation.id] ? cs.w("screen.plan.tookup")
          : s.escalation && s.escalation.id && s.escalation.state === "open"
          ? cs.act("itemtakeup", { label: "screen.plan.takeup", data: { kind: "escalation_stage", escalation: s.escalation.id, stage: String(s.escalation.stage || "") } }) : "";
        return cs.row("<b>" + cs.w("screen.plan.matter.n", { n: String(i + 1) }) + "</b>", P.matterName(cs, s, titles)
          + '<span class="meta">' + cs.w("screen.plan.support." + (["hypothetical", "established", "short"].includes(s.support) ? s.support : "undetermined"))
          + (s.why ? " · " + cs.esc(s.why) : "") + live + (esc ? " · " + esc : "") + "</span>", take, "");
      }).join("")) : "")
        + (open ? addMatter : "");
      const matters = mattersIn ? cs.sec("screen.plan.matters", mattersIn) : "";

      // R1: the options, sorted by category, regulated end date, matter or disposition, picked as rows.
      const optionRows = cs.rows({
        id: "options", pick: open, items: options,
        cols: ["screen.plan.col.option", "screen.plan.col.category", "screen.plan.col.ends", "screen.plan.col.matter", "screen.plan.col.disposition"],
        key: function (o) { return o.id; },
        name: function (o) { return cs.esc(o.summary || o.id); },
        sortKey: function (o, col) {
          return col === 1 ? String(CATS.indexOf(o.category)) : col === 2 ? (P.endOf(o) || "9999") : col === 3 ? P.subjectKeys(o).map(titles.ofKey).join(" ")
            : col === 4 ? String(o.disposition || "") : String(o.summary || "");
        },
        cells: function (o) {
          const end = P.endOf(o);
          const disp = ["open", "chosen", "declined", "done", "blocked"].includes(o.disposition) ? o.disposition : "open";
          const last = Array.isArray(o.dispositions) && o.dispositions.length ? o.dispositions[o.dispositions.length - 1] : null;
          return [cs.esc(o.summary || o.id),
            cs.w("screen.plan.category." + (CATS.includes(o.category) ? o.category : "other")),
            end ? cs.date(end) : cs.w("screen.plan.noend"),
            cs.esc(P.subjectKeys(o).map(titles.ofKey).filter(Boolean).join(", ")),
            cs.w("screen.plan.disposition." + disp) + (last && last.reason ? " · " + cs.esc(last.reason) : "")
              + (o.action && o.action.id ? " · " + cs.w("screen.plan.started") : "")];
        },
        acts: function (o) {
          if (!open) return "";
          const started = o.action && o.action.id;
          return (started ? '<a class="cs-ref" href="/app/action/' + encodeURIComponent(o.action.id) + '" data-nav>' + cs.w("screen.plan.openaction") + "</a>" : "")
            + (!started && o.disposition !== "chosen" ? cs.act("optiondispose", { label: "screen.plan.choose", data: { option: o.id, disposition: "chosen" } }) : "")
            + (!started && o.disposition !== "declined" ? cs.act("optiondispose", { label: "screen.plan.decline", data: { option: o.id, disposition: "declined" } }) : "")
            + (!started && o.disposition === "chosen" ? cs.act("optionstartpreview", { label: "act.optionstartpreview.label.plan", tone: "primary", data: { option: o.id } }) : "");
        },
        hold: function () {
          return cs.act("optiondispose", { label: "screen.plan.choose", data: { disposition: "chosen" } })
            + cs.act("optiondispose", { label: "screen.plan.decline", data: { disposition: "declined" } });
        },
      });
      const subjectChoice = function (id) {
        return cs.choice(id, "screen.plan.option.matter", subjects.map(function (s, i) {
          const t = titles.ofKey(s.key);
          return t ? { value: s.key, text: t } : { value: s.key, key: "screen.plan.matter.n", fills: { n: String(i + 1) } };
        }));
      };
      const catChoice = function (id) {
        return cs.choice(id, "screen.plan.option.category", CATS.map(function (c) { return [c, "screen.plan.category." + c]; }));
      };
      const addOption = open ? cs.field("plan-opt-summary", "screen.plan.option.summary")
        + catChoice("plan-opt-category") + subjectChoice("plan-opt-matter")
        + cs.field("plan-opt-detail", "screen.plan.option.detail", { area: true })
        + '<div class="mk-acts">' + cs.act("optionadd", { label: "act.optionadd.label.plan" }) + "</div>" : "";

      // R1 (v0.2 rule 19; DEC-194): the standing offers, then the assistant's suggestions, each labelled and adopted
      // only by the member's own act.
      const offers = (Array.isArray(p.offers) ? p.offers : []).flatMap(function (g) {
        return (g.offers || []).filter(function (o) { return !(o.adopted && o.adopted.length); }).map(function (o) {
          const k = o.kind === "chance_to_fix" ? "plan.offer.chancetofix" : "plan.offer.document";
          return cs.row("", "<b>" + cs.w(k) + "</b> · " + cs.esc(g.key || "") + '<span class="meta">' + cs.w(k + ".means")
            + (o.offered_again ? " · " + cs.w("plan.offer.chancetofix.again") : "") + "</span>",
          open ? cs.act("optionadopt", { label: "screen.plan.adopt", data: { subject: g.key || "", offer: o.kind } }) : "", "");
        });
      });
      // R13: "Ask the assistant for options" starts a planning run (`planask`), drawn running and read again on the page's
      // clock until it ends; its proposals then reach the tray, read again, labelled machine work and adopted only by the
      // member's own act.
      const pr = view.data.proposals;
      const asked = view.ui.ask || null;
      let askNote = "", fresh = null;
      if (asked && asked.refused) {
        // R18 (D5, D29): an answer carrying a refusal is drawn as that refusal, never as a run looking for options.
        askNote = '<p class="mk-note" role="alert" data-run="refused">' + asked.refused + "</p>";
      } else if (asked && asked.run) {
        const st = P.later(cs, view, "run", "airun", { run: asked.run }, String(view.ui.seq || 0));
        const session = st.state === "ok" && st.value && st.value.session ? st.value.session : null;
        if (session) view.ui.askStatus = { run: asked.run, status: session.status };
        // R18: "looking for options" is drawn only while `airun` answers the run as running; until it answers, nothing.
        const status = session ? session.status : view.ui.askStatus && view.ui.askStatus.run === asked.run ? view.ui.askStatus.status : null;
        const poll = function () {
          if (st.state !== "loading" && !view.ui.askPolling && (view.ui.askPolls || 0) < 60) {
            view.ui.askPolling = true;
            cs.later(10000, function (k, v) { v.ui.askPolling = false; v.ui.askPolls = (v.ui.askPolls || 0) + 1; k.set("seq", (v.ui.seq || 0) + 1); });
          }
        };
        if (status === "running") {
          askNote = '<p class="mk-note" role="status" data-run="running">' + cs.w(asked.existed ? "screen.plan.ask.already" : "screen.plan.ask.running") + "</p>";
          poll();
        } else if (status) {
          askNote = '<p class="mk-note" role="status" data-run="ended">' + cs.w("screen.plan.ask.ended") + "</p>";
          fresh = P.later(cs, view, "tray", "planproposals", { plan: view.subject }, asked.run);
        } else if (st.state === "failed") poll();
      }
      const trayRows = function (v) {
        const rows = (Array.isArray(v.proposals) ? v.proposals : []).filter(function (x) { return !x.adopted; }).map(function (x) {
          return cs.row("", "<b>" + cs.esc(x.summary || "") + "</b>" + '<span class="meta">' + cs.esc(x.why || "") + (x.label ? " · " + cs.esc(x.label) : "") + "</span>",
            open ? cs.act("optionadopt", { label: "screen.plan.adopt", data: { proposal: x.id } }) : "", "");
        });
        return rows.length ? cs.sheet(rows.join("")) : "";
      };
      const trayList = fresh ? (fresh.state === "ok" ? trayRows(fresh.value) : cs.state(fresh)) : pr && pr.state !== "empty" ? cs.state("proposals", trayRows) : "";
      const trayIn = askNote + trayList + (open ? '<div class="mk-acts">' + cs.act("planask", {}) + "</div>" : "");
      const tray = view.reachable && pr && trayIn ? '<div class="mk-tray" role="region" aria-label="' + cs.w("screen.plan.suggested") + '"><p class="eyebrow">'
        + cs.w("screen.plan.suggested") + "</p>" + trayIn + "</div>" : "";

      const optionsIn = (options.length ? optionRows : "") + addOption + (offers.length ? cs.sheet(offers.join("")) : "") + tray;
      const optionsSec = optionsIn ? cs.sec("screen.plan.options", optionsIn) : "";

      // R1: scenarios and their phases; a checkpoint judged by a member; take-up, never assignment (v0.2 rule 18).
      const scenarios = Array.isArray(p.scenarios) ? p.scenarios : [];
      const chosen = options.filter(function (o) { return o.disposition === "chosen"; });
      const scenIn = scenarios.map(function (s) {
        return "<h3>" + cs.esc(s.name || "") + (s.set_aside ? " · " + cs.w("screen.plan.setaside") : "") + "</h3>"
          + cs.sheet((s.phases || []).map(function (ph) {
            const judged = ph.judgement ? cs.w("screen.plan.judged." + (ph.judgement.judged === "met" ? "met" : "not_met")) + (ph.judgement.note ? " · " + cs.esc(ph.judgement.note) : "") : "";
            const due = ph.checkpoint_due ? cs.due(String(ph.checkpoint_due), "") : "";
            const tookIt = (view.ui.took || {})["checkpoint:" + s.scenario + ":" + ph.id];
            const form = ph.checkpoint && !ph.judgement && open
              ? cs.choice("plan-judge-" + s.scenario + "-" + ph.id, "screen.plan.judge.outcome", [["met", "screen.plan.judged.met"], ["not_met", "screen.plan.judged.not_met"]])
                + cs.field("plan-judgenote-" + s.scenario + "-" + ph.id, "screen.plan.judge.note")
                + cs.act("checkpointrecord", { label: "screen.plan.judge", data: { scenario: String(s.scenario), phase: ph.id } })
                + (tookIt ? cs.w("screen.plan.tookup") : cs.act("itemtakeup", { label: "screen.plan.takeup", data: { kind: "checkpoint", scenario: String(s.scenario), phase: ph.id } }))
              : "";
            return cs.row("<b>" + cs.esc(ph.name || ph.id) + "</b>", cs.esc((ph.options || []).join(", ")) + (judged ? '<span class="meta">' + judged + "</span>" : ""), due, form);
          }).join(""));
      }).join("") + (open ? cs.field("plan-scen-name", "screen.plan.scenario.name")
        + '<fieldset class="cs-field" id="plan-scen-options"><legend>' + cs.w("screen.plan.scenario.options") + "</legend>"
        + chosen.map(function (o, i) { return '<label><input type="checkbox" id="plan-scen-options-' + i + '" value="' + cs.esc(o.id) + '"> ' + cs.esc(o.summary || o.id) + "</label>"; }).join("")
        + "</fieldset>" + cs.field("plan-scen-days", "screen.plan.scenario.days", { type: "number" })
        + '<div class="mk-acts">' + cs.act("scenarioset", { label: "act.scenarioset.label.plan", data: { next: String(scenarios.length + 1) } }) + "</div>" : "");
      const scen = scenIn ? cs.sec("screen.plan.scenarios", scenIn) : "";

      // R1: what each started option became.
      const started = options.filter(function (o) { return o.action && o.action.id; });
      const startedSec = !started.length ? "" : cs.sec("screen.plan.startedsec", cs.sheet(started.map(function (o) {
        return cs.row("", '<a class="cs-ref" href="/app/action/' + encodeURIComponent(o.action.id) + '" data-nav>' + cs.esc(o.summary || o.action.id) + "</a>",
          '<span class="meta">' + cs.w("screen.plan.actionstate." + (["planned", "active", "awaiting_response", "resolved", "abandoned"].includes(o.action.state) ? o.action.state : "planned")) + "</span>", "");
      }).join("")));

      const close = open ? cs.field("plan-close-note", "plan.close.lessons", { area: true })
        + '<div class="mk-acts">' + cs.act("planclose", { label: "screen.plan.close" }) + "</div>" : "";
      // R14: a plan with nothing in it to show draws its one empty state.
      const body = strip + matters + optionsSec + scen + startedSec + close;
      return head + (body || '<p class="cs-state" data-state="empty">' + cs.w("screen.plan.empty") + "</p>");
    });
  },

  acts: [
    {
      // R1, R7: "Add a matter": an inquiry, or a determination's outcome against a standard, with the member's reason.
      op: "plansubjectadd", reasonField: "reason",
      send: function (view, el, cs) {
        // R18: the reference is picked from the record's lists: `inquiry:<question>` or `outcome:<determination>#<standard>`.
        const m = /^(inquiry|outcome):([^#]+)(?:#(.*))?$/.exec(String(cs.value("plan-subject-id") || ""));
        if (!m) return { refuse: "screen.plan.subject.needed" };
        const subject = m[1] === "outcome" ? { kind: "outcome", determination: m[2], standard: m[3] || "" } : { kind: "inquiry", inquiry: m[2] };
        return { body: { plan: view.subject, subject: subject, reason: String(cs.value("plan-subject-reason") || "").trim() } };
      },
    },
    {
      op: "optionadd",
      send: function (view, el, cs) {
        const summary = String(cs.value("plan-opt-summary") || "").trim();
        if (!summary) return { refuse: "screen.plan.option.needed" };
        const detail = String(cs.value("plan-opt-detail") || "").trim();
        const body = { plan: view.subject, summary: summary, category: cs.value("plan-opt-category"), subjects: [cs.value("plan-opt-matter")].filter(Boolean) };
        if (detail) body.detail = detail;
        return { body: body };
      },
    },
    {
      // R13, R15, R18: "Ask the assistant for options" (`act.planask.label.plan`, explained by `act.planask.does`) starts a
      // planning run for this plan, drawn only while the assistant is reachable (`interface-shell` R55 admits this op); it
      // records no option and no proposal of the member's own. `existed` draws the run already asked; an answer that
      // carries a refusal is drawn as that refusal.
      op: "planask",
      send: function (view) { return { body: { plan: view.subject } }; },
      done: function (view, answer, cs) {
        const a = answer || {};
        if (view.parts.refused(a)) { cs.set("ask", { refused: view.parts.refusalWords(cs, a) }); return; }
        if (a.run) { cs.set("askPolls", 0); cs.set("ask", { run: a.run, existed: a.existed === true }); }
      },
      rereads: [],
    },
    {
      // R1: a suggestion or a standing offer becomes an option only by the member's own act.
      op: "optionadopt",
      send: function (view, el) {
        const d = el.dataset;
        return d.proposal ? { body: { proposal: d.proposal } } : { body: { plan: view.subject, offer: { subject: d.subject, kind: d.offer } } };
      },
    },
    {
      // R1: "Choose" or "Decline" (the shell asks the reason, required where declining), one option or the picked ones.
      op: "optiondispose",
      send: function (view, el, cs, extra) {
        const options = extra && extra.picked && extra.picked.length ? extra.picked : [el.dataset.option].filter(Boolean);
        if (!options.length) return null;
        return { body: { plan: view.subject, options: options, disposition: el.dataset.disposition } };
      },
    },
    {
      // R1: "Lay out a scenario": its name and one phase of the chosen options, from the plan's start, with a checkpoint.
      op: "scenarioset",
      send: function (view, el, cs) {
        const name = String(cs.value("plan-scen-name") || "").trim();
        const options = cs.value("plan-scen-options") || [];
        if (!name || !options.length) return { refuse: "screen.plan.scenario.needed" };
        const days = Number(cs.value("plan-scen-days"));
        const phase = { id: "p1", name: name, options: options, starts: "plan_start" };
        if (Number.isInteger(days) && days > 0) phase.checkpoint = { after_days: days };
        return { body: { plan: view.subject, scenario: Number(el.dataset.next) || 1, name: name, phases: [phase] } };
      },
    },
    {
      op: "checkpointrecord",
      send: function (view, el, cs) {
        const d = el.dataset;
        const note = String(cs.value("plan-judgenote-" + d.scenario + "-" + d.phase) || "").trim();
        const body = { plan: view.subject, scenario: Number(d.scenario), phase: d.phase, judged: cs.value("plan-judge-" + d.scenario + "-" + d.phase) };
        if (note) body.note = note;
        return { body: body };
      },
    },
    {
      // R1: "Start…" opens `start-send` for the option; nothing is read or started here.
      op: "optionstartpreview",
      send: function (view, el, cs) { cs.go("start-send", view.subject + "~" + el.dataset.option); return null; },
    },
    {
      // R1 (v0.2 rule 18): "Take this up" routes the item's to-dos to the member; nobody assigns anybody.
      op: "itemtakeup",
      send: function (view, el) {
        const d = el.dataset;
        const item = d.kind === "checkpoint" ? { kind: "checkpoint", plan: view.subject, scenario: Number(d.scenario), phase: d.phase }
          : { kind: "escalation_stage", escalation: d.escalation, stage: Number(d.stage) };
        return { body: { item: item } };
      },
      // nothing on the plan changes: the screen says the item is the member's from now on.
      rereads: [],
      done: function (view, answer, cs) {
        const it = answer && answer.item ? answer.item : {};
        const took = Object.assign({}, view.ui.took || {});
        took[it.kind === "checkpoint" ? "checkpoint:" + it.scenario + ":" + it.phase : "escalation_stage:" + it.escalation] = true;
        cs.set("took", took);
      },
    },
    {
      // R1: "Close plan…" with a reason (the shell asks it), and the lessons note when written.
      op: "planclose",
      send: function (view, el, cs) {
        const note = String(cs.value("plan-close-note") || "").trim();
        return { body: note ? { plan: view.subject, note: note } : { plan: view.subject } };
      },
    },
  ],
});
