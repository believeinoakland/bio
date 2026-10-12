/* Ask (registry screen `answers`, Find › Ask; screens-daily R6, R7). While the assistant is reachable for the member
   (interface-shell R20, `view.reachable`), "Ask" sends the question through `op=ask` (agent-worker R54: its answer's
   summary and sentences with their support, the holdings each rests on, the looks, labelled machine work) and "Search
   instead" opens Find. While it is not, the screen is "Find and count": search, and `ruleanswer` "Show how this was
   counted". In both, the question can be kept asking (`standingquestionset`) and stopped (`standingquestionend`). The
   registry's "Ask" names `ruleanswer`; it is re-pointed to `ask` (draft-T46-interface.md §3, item 3; interface-shell
   R21). Every function is self-contained (interface-shell R21 (1)). */

export const answers = Object.freeze({
  id: "answers",

  reads: function (view) {
    const ui = view.ui || {};
    const out = {};
    if (!view.reachable && typeof ui.q === "string" && ui.q.trim()) {
      out.search = {
        op: "search", query: { q: ui.q, limit: "50", snippet: "160" },
        empty: function (v) { return !v || !Array.isArray(v.hits) || v.hits.length === 0; },
      };
    }
    return out;
  },

  render: function (cs, view) {
    const ui = view.ui || {};
    const keep = '<div class="mk-acts">' + cs.act("standingquestionset", { label: "act.standingquestionset.label.answers" })
      + (ui.standing ? cs.act("standingquestionend", { label: "act.standingquestionend.label.answers", data: { id: String(ui.standing.id) } }) : "")
      + "</div>"
      + (ui.standing ? '<p class="mk-note">' + cs.w("screen.answers.kept", { cadence: cs.w("screen.answers.cadence.weekly"), date: cs.date(String(ui.standing.ends || ""), { year: true }) }) + "</p>" : "")
      + '<p class="mk-note">' + cs.w("screen.answers.keeping") + "</p>";

    if (view.reachable) {
      const a = ui.answer && typeof ui.answer === "object" ? ui.answer : null;
      let drawn = "";
      if (a) {
        const holdings = Array.isArray(a.holdings) ? a.holdings : [];
        const looks = Array.isArray(a.looks) ? a.looks : [];
        const holdingLink = function (i) {
          const h = holdings[i];
          if (!h) return "";
          const addr = String(h.address || "");
          const doc = addr.split("#")[0];
          return cs.ref("document", addr, h.quote ? String(h.quote) : doc, [doc]);
        };
        const supportOf = function (ids) {
          return (Array.isArray(ids) ? ids : []).map(function (id) {
            const m = /^h(\d+)$/.exec(String(id));
            return m ? " " + holdingLink(Number(m[1]) - 1) : "";
          }).join("");
        };
        const summary = a.summary && a.summary.text ? "<p><b>" + cs.esc(String(a.summary.text)) + "</b></p>" : "";
        const sentences = (Array.isArray(a.sentences) ? a.sentences : []).map(function (s) {
          return "<p>" + cs.esc(String(s.text || "")) + supportOf(s.support) + "</p>";
        }).join("");
        const where = holdings.length
          ? '<h3>' + cs.w("screen.answers.holdings") + '</h3><ul class="mk-list">' + holdings.map(function (h, i) { return "<li>" + holdingLink(i) + "</li>"; }).join("") + "</ul>" : "";
        const LEVELS = ["document", "content", "meaning", "internet"];
        const STATES = ["LOOKED_FOUND", "LOOKED_ABSENT", "NOT_LOOKED"];
        const looked = looks.length
          ? '<h3>' + cs.w("screen.answers.looks") + '</h3><ul class="mk-list">' + looks.map(function (l) {
            const level = LEVELS.indexOf(l.level) >= 0 ? cs.w("screen.answers.level." + l.level) : cs.esc(String(l.level || ""));
            const state = STATES.indexOf(l.state) >= 0 ? cs.w("screen.answers.state." + l.state) : cs.w("screen.answers.state.other", { state: String(l.state || "") });
            return "<li><span>" + level + "</span> <span>" + state + "</span></li>";
          }).join("") + "</ul>" : "";
        const withheld = Array.isArray(ui.withheld) && ui.withheld.length
          ? '<p class="mk-note">' + cs.w("screen.answers.withheld", { n: String(ui.withheld.length) }) + "</p>" : "";
        const asRead = a.question_as_read ? '<p class="mk-small">' + cs.w("screen.answers.asread", { question: String(a.question_as_read) }) + "</p>" : "";
        const untested = ui.untested ? '<p class="cs-untested" data-tip="' + cs.w("ai.label.untested") + '">' + cs.w("ai.label.untested") + "</p>" : "";
        drawn = '<div class="cs-machinework">' + asRead + summary + sentences + where + looked + withheld
          + '<p class="mk-note">' + cs.w("screen.answers.legal") + "</p>" + untested
          + '<span class="by">' + cs.w("screen.answers.machine") + "</span></div>";
      }
      return cs.title(cs.w("screen.answers.name"), {}) + '<p class="mk-sub">' + cs.w("screen.answers.sub") + "</p>"
        + cs.field("answers-q", "screen.answers.question", { area: true, rec: true, value: ui.q || "" })
        + '<div class="mk-acts">' + cs.act("ask", { label: "act.ruleanswer.label.answers", tone: "primary" })
        + cs.act("search", { label: "act.search.label.answers" }) + "</div>"
        + drawn + keep;
    }

    // Not reachable: "Find and count".
    const results = view.data.search ? cs.state("search", view, function (s) {
      return cs.sheet((Array.isArray(s.hits) ? s.hits : []).map(function (h) {
        const id = String(h.bundle_id);
        return cs.row(cs.mark("origin", "search"), cs.ref("document", id, h.title || id, []) + (h.snippet ? '<span class="meta">' + cs.esc(String(h.snippet)) + "</span>" : ""), "", "");
      }).join(""));
    }, { empty: "screen.finder.none" }) : "";
    const r = ui.rule && typeof ui.rule === "object" ? ui.rule : null;
    const LABELS = ["legal_information", "procedural_fact", "computed_fact"];
    const rule = !r ? "" : '<div class="mk-note">' + (r.not_held
      ? "<p>" + cs.w("screen.answers.rule.notheld", { reason: String(r.not_held.reason || "") }) + "</p>"
      : "<p>" + cs.w("screen.answers.rule.value", {
        label: LABELS.indexOf(r.label) >= 0 ? cs.w("screen.answers.label." + r.label) : String(r.label || ""),
        value: typeof r.value === "object" ? JSON.stringify(r.value) : String(r.value),
      }) + "</p>" + (r.basis ? "<p>" + cs.w("screen.answers.rule.basis", { basis: typeof r.basis === "object" ? JSON.stringify(r.basis) : String(r.basis) }) + "</p>" : ""))
      + "</div>";
    return cs.title(cs.w("screen.answers.offtitle"), {}) + '<p class="mk-sub">' + cs.w("screen.answers.offsub") + "</p>"
      + '<div class="mk-search">' + cs.field("answers-q", "screen.finder.words", { value: ui.q || "" })
      + '<span class="mk-acts">' + cs.act("search", { label: "act.search.label.finder", tone: "primary" }) + "</span></div>"
      + results
      + (ui.q ? '<div class="mk-acts">' + cs.act("ruleanswer", { label: "screen.answers.counted" }) + "</div>" : "")
      + rule + keep;
  },

  acts: [
    // R6: the question through `op=ask`; the answer is a stream whose last event is the answer or the refusal.
    { op: "ask", label: "act.ruleanswer.label.answers", rereads: [],
      refusals: {
        AI_LIMIT_REACHED: "ai.refused.limit", AI_LIMIT_UNJUDGED: "ai.refused.limit.unjudged", AI_USE_SWITCHED_OFF: "ai.refused.off",
        AI_KEPT_AWAY: "ai.refused.projectkeptaway", NO_ACCOUNT: "ai.refused.signinnotconnected",
        ASSISTANT_OFF: "screen.answers.refused.off", AI_PART_NOT_DEPLOYED: "screen.answers.refused.notdeployed",
      },
      send: function (view, el, cs) {
        const q = String(cs.value("answers-q") || "").trim();
        if (!q) return { refuse: "screen.answers.questionfirst" };
        cs.set("q", q);
        return { body: { question: q } };
      },
      done: function (view, answer, cs) {
        let ev = answer;
        if (typeof ev === "string") {
          const lines = ev.split("\n").filter(function (l) { return l.trim(); });
          try { ev = JSON.parse(lines[lines.length - 1]); } catch (e) { ev = null; }
        }
        if (Array.isArray(ev)) ev = ev[ev.length - 1];
        if (ev && ev.result && !ev.answer) ev = ev.result;
        const a = ev && ev.answer && typeof ev.answer === "object" ? ev.answer : null;
        cs.set("answer", a);
        cs.set("withheld", ev && Array.isArray(ev.withheld) ? ev.withheld : []);
        cs.set("untested", !!(ev && ev.untested) || !!(a && a.untested));
      } },
    // "Search instead" (reachable) opens Find with the question's words; "Search" (not reachable) searches here.
    { op: "search", label: "act.search.label.answers", rereads: ["search"],
      send: function (view, el, cs) {
        const q = String(cs.value("answers-q") || "").trim();
        if (!q) return { refuse: "screen.finder.wordsfirst" };
        cs.set("q", q);
        if (view.reachable) { cs.go("finder", q); return null; }
        return { query: { q: q, limit: "50", snippet: "160" } };
      } },
    // "Show how this was counted": the rule service's answer with its basis and label (answers R7).
    { op: "ruleanswer", label: "screen.answers.counted", rereads: [],
      send: function (view, el, cs) {
        const q = String((view.ui || {}).q || "").trim();
        if (!q) return { refuse: "screen.finder.wordsfirst" };
        return { body: { service: "occurrences", args: { q: q } } };
      },
      done: function (view, answer, cs) {
        cs.set("rule", answer && answer.service ? answer : (answer && answer.result) || null);
      } },
    { op: "standingquestionset", label: "act.standingquestionset.label.answers", rereads: [],
      send: function (view, el, cs) {
        const q = String(cs.value("answers-q") || (view.ui || {}).q || "").trim();
        if (!q) return { refuse: "screen.answers.questionfirst" };
        const ends = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
        return { body: { question: q, query: q, cadence: "weekly", ends: ends } };
      },
      done: function (view, answer, cs) {
        const a = answer && answer.id ? answer : (answer && answer.result) || {};
        if (a.id) cs.set("standing", { id: a.id, ends: a.ends || "" });
      } },
    { op: "standingquestionend", label: "act.standingquestionend.label.answers", rereads: [],
      send: function (view, el) { return el.dataset.id ? { body: { id: el.dataset.id } } : null; },
      done: function (view, answer, cs) { cs.set("standing", null); } },
  ],
});
