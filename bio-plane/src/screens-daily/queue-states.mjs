/* The queue's other states (screens-daily R58 to R61; DEC-330 A58, A61, A62, A63; DEC-335, DEC-336), a screen part
   (interface-shell R21, K3002) handed to `queue` as `view.parts.queueStates`: choosing several items and acting once, each
   item's outcome (R58); what the member answered (R59); the feeds' honesty, the failed feeds named with "Try again" and the
   all-clear given only for a class every feed answered (R60); and the set-aside findings (R61). `picks` and `outcome` answer
   the chosen items and the outcome of a set act; the draw functions answer HTML. Self-contained: it refers only to its
   parameters and the language's own globals. */

export function queueStates() {
  // `affordances`' `PER_ITEM_MAX` (record-core R50): a set call over the bound is refused whole, so more are sent in further calls.
  const PER_ITEM_MAX = 100;
  // The feeds the word list names (`queue.feed.<id>`); another feed has no words, so it is never named (R60).
  const FEEDS = ["membership", "people", "money-checks", "answers", "duties", "inquiry", "credentials", "following", "file-safety", "ai-use",
    "ai-accounts", "question-explorer", "steps", "investigation", "review", "retrieval", "notice-producers", "noticeItems", "action-clock-overdue",
    "plan-checkpoint-due", "escalation-stage-proposed", "action-reminder", "litigation-hold", "litigation-hold-released", "template-review-requested",
    "local-fact-due", "member-left-items", "watch-keep-or-stop", "plan-review-due", "plan-look-again", "request-unsent",
    "tasks", "bias-debts", "sources", "proposals", "shared-inquiries", "leads", "exports", "references", "objectives", "machinery", "contradictions", "signing-keys",
    "action", "attribution", "docket", "cited-cases", "wizards", "schedule", "places", "projects"];
  const link = function (cs, href, key) { return '<a class="cs-btn" data-tone="quiet" data-nav href="' + href + '">' + cs.w(key) + "</a>"; };
  // A moment as people read it: its day and the time on the 12-hour clock (`time.at`, `time.clock`, DEC-335).
  const when = function (cs, iso) {
    const t = new Date(String(iso || ""));
    if (!iso || isNaN(t.getTime())) return "";
    const h = t.getHours();
    return cs.w("time.at", { date: { html: cs.date(String(iso)) }, time: { html: cs.w("time.clock", { hour: String(h % 12 === 0 ? 12 : h % 12), minute: String(t.getMinutes()).padStart(2, "0"), ampm: { html: cs.w(h < 12 ? "time.am" : "time.pm") } }) } });
  };
  // An answer to a call made by `cs.call`: the result when there is one, else the body (a refusal carries its fields).
  const bodyOf = function (a) { return a && typeof a === "object" ? (a.result && typeof a.result === "object" ? a.result : a) : null; };
  // R79 (c): the day a snooze comes back is chosen on a date input whose earliest day is tomorrow, helped by `screen.queue.snooze.pick`;
  // a day before tomorrow is not sent.
  const tomorrow = function (cs) { return new Date(cs.now() + 86400000).toISOString().slice(0, 10); };
  const dayField = function (cs, id) {
    return cs.field(id, "screen.queue.snooze.until", { type: "date", help: "screen.queue.snooze.pick" }).replace('type="date"', 'type="date" min="' + tomorrow(cs) + '"');
  };
  const dayOf = function (cs, id) {
    const until = String(cs.value(id) || "").trim();
    if (!until) return { refuse: "screen.queue.fieldfirst" };
    return until < tomorrow(cs) ? { refuse: "screen.queue.snooze.pick" } : { until: until };
  };

  /* ---- R58: choosing several items ---- */
  // The route's entry to the two other states, drawn on the queue's list.
  const entry = function (cs) {
    return cs.row(cs.icon("hold"), cs.w("queue.multi.entry"), link(cs, "/app/queue/choose", "queue.multi.choose") + link(cs, "/app/queue/answered", "queue.answered.title"), "");
  };
  // The identity a set act takes for one item: a task's `id`; a finding's `key` and version, or `project` and `finding`.
  const identity = function (op, it, near) {
    const d = it.disposition || {};
    if (op === "proposedispose") {
      // R70: the word `proposedispose` reads is `definitionVersion`.
      if (d.key) return d.definition_version === undefined || d.definition_version === null ? { key: String(d.key) } : { key: String(d.key), definitionVersion: d.definition_version };
      const project = d.project ? String(d.project) : Array.isArray(d.projects) && d.projects[0] ? String(d.projects[0]) : near ? String(near.id) : "";
      return { project: project, finding: String(d.finding || it.id) };
    }
    return { id: String(it.id) };
  };
  // Whether a set act reaches an item: a to-do's own door is `taskresolve` (queue R12); a finding with a disposition is dismissed;
  // any item in a case is snoozed with its case. An item no set act reaches carries its own door (`instead`).
  const reaches = function (op, it, near) {
    const d = it.disposition || {};
    if (op === "queuesnooze") return !!near;
    if (op === "proposedispose") return it.class === "FINDING" && d.available === true;
    return it.class === "OBLIGATION" && (!d.instead || d.instead === "taskresolve") && !!it.id;
  };
  // Runs one set act over the chosen items: every call of it in order, the first refusal of the whole stopping the rest, and
  // the outcome kept in the screen's page memory for the list that follows. `near(it)` answers an item's nearest case.
  const run = function (op, view, el, cs, extra) {
    const ui = view.ui;
    // An item's case, a project (the snooze's), and its nearest home case, a question or a project (a finding's project, queue R12).
    const caseOf = function (it) {
      const c = it.case || {};
      const a = Array.isArray(c.ancestors) ? c.ancestors : [];
      const p = a.filter(function (x) { return x && x.type === "project"; })[0] || a[a.length - 1];
      return c.ungrouped || !p ? null : p;
    };
    const near = function (it) {
      const c = it.case || {};
      if (c.ungrouped) return null;
      const a = (Array.isArray(c.ancestors) ? c.ancestors : []).filter(function (x) { return x && x.id && (x.type === "inquiry" || x.type === "project"); });
      a.sort(function (x, y) { return (Number(x.depth) || 0) - (Number(y.depth) || 0); });
      return a[0] || null;
    };
    const q = view.data.queue && view.data.queue.state === "ok" && view.data.queue.value && Array.isArray(view.data.queue.value.items) ? view.data.queue.value.items : [];
    const picked = Array.isArray(ui["pick:queue"]) ? ui["pick:queue"] : [];
    const chosen = q.filter(function (it) { return it && picked.indexOf(String(it.id)) >= 0; });
    if (!chosen.length) return Promise.resolve({ refuse: "screen.finder.pickfirst" });
    const shared = {};
    if (op === "taskforward") {
      // C75: a member chosen from the group's, never oneself.
      const picked = view.parts.forward().to(cs, view, "qm-to");
      if (!picked.to) return Promise.resolve(picked);
      shared.to = picked.to;
    }
    if (op === "queuesnooze") {
      const day = dayOf(cs, "qm-until");
      if (day.refuse) return Promise.resolve(day);
      shared.until = day.until;
    }
    if (op === "proposedispose") { shared.to = "dismissed"; if (extra && extra.reason !== undefined) shared.reason = extra.reason; }
    const rows = chosen.map(function (it) { return { it: it, sent: false, applied: false, why: "" }; });
    const sendable = rows.filter(function (r) { return reaches(op, r.it, op === "queuesnooze" ? caseOf(r.it) : near(r.it)); });
    sendable.forEach(function (r) { r.sent = true; });
    const calls = [];
    if (op === "queuesnooze") {
      const cases = [];
      sendable.forEach(function (r) { const c = caseOf(r.it); if (cases.indexOf(String(c.id)) < 0) cases.push(String(c.id)); });
      cases.forEach(function (c) { calls.push({ body: { case: c, until: shared.until }, rows: sendable.filter(function (r) { return String(caseOf(r.it).id) === c; }), whole: true }); });
    } else {
      for (let i = 0; i < sendable.length; i += PER_ITEM_MAX) {
        const part = sendable.slice(i, i + PER_ITEM_MAX);
        calls.push({ body: Object.assign({ items: part.map(function (r) { return identity(op, r.it, near(r.it)); }) }, shared), rows: part, whole: false });
      }
    }
    const go = function (i) {
      if (i >= calls.length) return Promise.resolve(true);
      const c = calls[i];
      return cs.call(op, { body: c.body }).then(function (a) {
        const r = bodyOf(a) || {};
        if (c.whole) c.rows.forEach(function (x) { x.applied = r.ok !== false; if (r.ok === false) x.why = r.translation ? String(r.translation) : ""; });
        else {
          const per = Array.isArray(r.items) ? r.items : null;
          c.rows.forEach(function (x, k) {
            const o = per ? per.filter(function (p) { return p && p.index === k; })[0] || per[k] : null;
            x.applied = o ? o.outcome === "applied" : r.ok !== false;
            if (o && o.outcome !== "applied") x.why = o.translation ? String(o.translation) : o.check ? String(o.check) : "";
          });
        }
        return go(i + 1);
      }, function () { return go(i + 1); });
    };
    return go(0).then(function () {
      const draw = rows.map(function (r) {
        const d = r.it.disposition || {};
        return { id: String(r.it.id), applied: r.applied, instead: !r.sent && d.instead ? String(d.instead) : "", why: r.why };
      });
      cs.set("outcome", { rows: draw, done: draw.filter(function (r) { return r.applied; }).length, op: op });
      return null;
    });
  };
  // The outcome (state e): the headline and, for each chosen item, done or "Not handled, stays here" with why and its door.
  const outcome = function (cs, view, o, wordsOf, doorOf) {
    const n = o.rows.length;
    const kept = n - o.done;
    const items = view.data.queue && view.data.queue.state === "ok" && view.data.queue.value && Array.isArray(view.data.queue.value.items) ? view.data.queue.value.items : [];
    const rows = o.rows.map(function (r) {
      const it = items.filter(function (x) { return x && String(x.id) === r.id; })[0] || null;
      const title = it ? wordsOf(it) : cs.esc(r.id);
      if (r.applied) return cs.row(cs.icon("accepted"), "<b>" + cs.w("queue.multi.done") + "</b> · " + title + '<span class="meta">' + cs.w("queue.done", { what: { html: cs.w("act." + o.op + ".label.queue") } }) + "</span>", "", "");
      // C71: every kept row says why: the two reasons the design words, the owner's own `check` or `translation` when it answered one, else
      // the design's sentence for an item that needs the member to read, check or decide it herself (BOB: a key for "needs your own reason").
      const why = r.instead === "filingapprove" ? cs.w("queue.multi.why.letter") : it && it.kind === "check" ? cs.w("queue.multi.why.check") : r.why ? cs.esc(r.why) : cs.w("queue.multi.done.help2");
      return cs.row(cs.icon("refused"), "<b>" + cs.w("queue.multi.refused") + "</b> · " + title
        + '<span class="meta">' + why + (it && r.instead ? " " + doorOf(it, r.instead) : "") + "</span>", "", "");
    }).join("");
    const head = n === 1 ? cs.w("queue.multi.result.one", { done: String(o.done), kept: String(kept) }) : cs.w("queue.multi.result", { n: String(n), done: String(o.done), kept: String(kept) });
    return cs.title(undefined, {}) + '<p class="mk-sub">' + head + "</p>" + cs.sheet(rows)
      + '<p class="mk-acts">' + link(cs, "/app/queue", "queue.multi.back") + link(cs, "/app/queue/answered", "queue.answered.title") + "</p>";
  };
  // The choosing state's hold strip: the number chosen and the four acts, each with the fields it asks in place.
  const strip = function (cs, n, forwardTo) {
    const act = function (op, key, extraHtml, data) {
      const b = cs.act(op, { label: key, data: Object.assign({ multi: "1" }, data || {}) });
      return b ? (extraHtml ? '<details class="mk-details"><summary>' + cs.w(key) + "</summary>" + extraHtml + b + "</details>" : b) : "";
    };
    return '<div class="cs-hold mk-hold">' + cs.icon("hold") + '<span><span class="n">' + (n === 1 ? cs.w("queue.multi.chosen.one") : cs.w("queue.multi.chosen", { n: String(n) })) + '</span></span><span class="acts">'
      + act("taskresolve", "queue.multi.done", "")
      + act("taskforward", "queue.multi.forward", forwardTo)
      + act("queuesnooze", "queue.multi.snooze", dayField(cs, "qm-until") + '<p class="mk-small muted">' + cs.w("queue.multi.snooze.help") + "</p>")
      + act("proposedispose", "queue.multi.dismiss", "") + "</span></div>";
  };

  /* ---- R60: the feeds' honesty ---- */
  // The failed feeds, each named where the word list holds a name, with "Try again" (the same read asked again).
  const failedFeeds = function (cs, q, again) {
    const feeds = Array.isArray(q.feeds) ? q.feeds : [];
    const failed = feeds.filter(function (f) { return f && f.answered === false; });
    if (!failed.length) return "";
    const named = failed.map(function (f) {
      const id = String(f.feed);
      if (id === "sources") return cs.w("queue.allclear.failed") + " " + cs.w("queue.allclear.failed2");
      return FEEDS.indexOf(id) >= 0 ? cs.w("queue.allclear.failed.feed", { feed: { html: cs.w("queue.feed." + id) } }) : "";
    }).filter(Boolean);
    return cs.row(cs.icon("withheld"), named.length ? "<b>" + named.join(" ") + "</b>" : "<b>" + cs.w("queue.allclear.withheld") + "</b>", link(cs, again, "queue.tryagain"), "");
  };
  // Nothing waiting and every feed answered: each class "none here", then the up-to-date row and the door to Home.
  const allClear = function (cs, q) {
    const clear = q.all_clear && typeof q.all_clear === "object" ? q.all_clear : {};
    const classes = [["OBLIGATION", "todo"], ["FINDING", "noticed"], ["CONDITION", "status"]];
    const lines = classes.filter(function (c) { return clear[c[0]] === true; }).map(function (c) {
      return cs.row(cs.mark("kind", c[1]), "<b>" + cs.w("queue.none." + c[1]) + "</b> " + cs.w("queue.none." + c[1] + "2"), "", "");
    }).join("");
    return (lines ? cs.sheet(lines) : "") + cs.row(cs.icon("accepted"), cs.w("screen.queue.uptodate"), "", "")
      + '<p class="mk-acts"><a class="cs-btn" data-tone="quiet" data-nav href="/app">' + cs.w("screen.queue.gohome") + "</a>" + link(cs, "/app/queue/answered", "queue.answered.title") + "</p>";
  };

  /* ---- R59: what the member answered ---- */
  const answeredRow = function (cs, r) {
    const title = typeof r.title === "string" && r.title.trim() ? '<span class="rec">' + cs.esc(r.title) + "</span>" : cs.w("queue.source.untitled", { date: { html: cs.date(String(r.at || "")) } });
    const at = when(cs, r.at);
    // R79 (d): each row says what was done, never a name and a day alone.
    const said = function (key, fills) { return cs.w(key, fills); };
    if (r.act === "resolved") {
      const byYou = r.by_you === true;
      const meta = r.by === null || r.by === undefined ? at
        : byYou ? cs.w("queue.answered.byyou", { when: { html: at } }) : cs.w("queue.answered.bymember", { member: cs.memberName(r.by), when: { html: at } }) + " · " + cs.w("queue.answered.byother");
      return cs.row(cs.icon("accepted"), said("queue.answered.done", { item: { html: title } }) + (meta ? '<span class="meta">' + meta + "</span>" : ""), "", "");
    }
    if (r.act === "forwarded") {
      // R85: the member it went to by her handle (`cs.memberName`), never her id.
      const who = r.to === null || r.to === undefined || r.to === "" ? "" : cs.memberName(r.to);
      return cs.row(cs.icon("accepted"), (who ? cs.w("queue.answered.forwarded", { item: { html: title }, member: who }) : cs.w("queue.answered.forwarded.unnamed", { item: { html: title } }))
        + '<span class="meta">' + cs.w("queue.answered.byyou", { when: { html: at } }) + "</span>", "", "");
    }
    if (r.act === "snoozed") {
      const c = r.case && typeof r.case === "object" ? r.case : {};
      const day = cs.date(String(r.until || ""));
      return cs.row(cs.icon("clock"), cs.w("queue.answered.snoozed", { item: { html: '<span class="rec">' + cs.esc(String(c.title || c.id || "")) + "</span>" }, date: { html: day } })
        + '<span class="meta">' + (at ? cs.w("queue.answered.byyou", { when: { html: at } }) + " · " : "") + cs.w("queue.answered.snoozed.meta") + "</span>", "", "");
    }
    // The findings set aside are R61's list on this page.
    if (r.act === "set_aside") return "";
    // R95 (item 78 (1)): a join request she answered: the requester, the project (a reference by its title), the answer and the moment;
    // the design holds no sentence for it yet, so the request's own sentence and the answer's button word stand in.
    if (r.act === "join_answer" && (r.answer === "granted" || r.answer === "declined")) {
      const who = r.requester && typeof r.requester === "object" ? String(r.requester.handle || r.requester.member || "") : "";
      const project = typeof r.title === "string" && r.title.trim() && r.project ? cs.ref("project", String(r.project), r.title, []) : title;
      const granted = r.answer === "granted";
      return cs.row(cs.icon(granted ? "accepted" : "refused"), cs.w("queue.project-request.summary", { who: who ? cs.memberName(who) : "", project: { html: project } })
        + '<span class="meta">' + (at ? cs.w("queue.answered.byyou", { when: { html: at } }) + " · " : "") + cs.w(granted ? "screen.home.request.grant" : "screen.home.request.decline") + "</span>", "", "");
    }
    const meta = at ? '<span class="meta">' + cs.w("queue.answered.byyou", { when: { html: at } }) + "</span>" : "";
    if (r.act === "dismissed") {
      const reason = typeof r.reason === "string" && r.reason.trim() ? r.reason.trim() : "";
      return cs.row(cs.icon("refused"), (reason ? cs.w("queue.answered.dismissed", { item: { html: title }, reason: reason }) : cs.w("queue.answered.dismissed.noreason", { item: { html: title } })) + meta, "", "");
    }
    if (r.act === "muted" && typeof r.kind === "string" && r.kind) return cs.row(cs.icon("refused"), cs.w("queue.answered.muted", { kind: { html: cs.w("queue.kind." + r.kind) } }) + meta, "", "");
    return cs.row(cs.icon("accepted"), cs.w("queue.answered.generic", { item: { html: title } }) + meta, "", "");
  };
  // R69: the snoozed cases, apart from the list, under `screen.queue.snoozed.head` (explained by `.holds`): each case as a reference with the
  // day it comes back (`screen.queue.snoozed.until`) and "Bring back" (`queuesnooze` with `clear`, the case).
  const snoozed = function (cs, items) {
    const cases = [];
    const at = {};
    (Array.isArray(items) ? items : []).forEach(function (it) {
      const snz = it && it.snoozed && Array.isArray(it.snoozed.cases) ? it.snoozed.cases : [];
      const ancestors = it && it.case && Array.isArray(it.case.ancestors) ? it.case.ancestors : [];
      snz.forEach(function (x) {
        if (!x || !x.case || (x.case in at)) return;
        const a = ancestors.filter(function (y) { return y && String(y.id) === String(x.case); })[0];
        at[x.case] = cases.length;
        cases.push({ id: String(x.case), title: a && typeof a.title === "string" && a.title.trim() ? a.title : String(x.case), until: x.until });
      });
    });
    if (!cases.length) return "";
    return cs.sec("screen.queue.snoozed.head", cs.sheet(cases.map(function (c) {
      const back = cs.act("queuesnooze", { label: "screen.queue.bringback", data: { project: c.id, clear: "1" } });
      return cs.row(cs.icon("clock"), cs.ref("project", c.id, c.title, [])
        + '<span class="meta">' + cs.w("screen.queue.snoozed.until", { date: { html: cs.date(String(c.until || "")) } }) + (back ? " " + back : "") + "</span>", "", "");
    }).join("")), { help: "screen.queue.snoozed.holds" });
  };
  // The answered rows (`op=queue` with `answered: true`), then the set-aside findings (R61) on the same page.
  const answered = function (cs, view, asideRows) {
    const a = view.data.answered;
    let list;
    if (!a || a.state === "loading") list = cs.state({ state: "loading" }, null);
    else if (a.state === "failed") list = cs.state(a, null);
    else {
      const rows = (a.value && Array.isArray(a.value.answered) ? a.value.answered : []).map(function (r) { return r ? answeredRow(cs, r) : ""; }).filter(Boolean);
      list = rows.length ? cs.sec("queue.answered.heading", cs.sheet(rows.join("")), { help: "queue.answered.help" }) : "";
    }
    return cs.title(cs.w("queue.answered.title"), {}) + '<p class="mk-sub">' + cs.w("queue.answered.head") + "</p>" + list + asideRows
      + '<p class="mk-acts">' + link(cs, "/app/queue", "queue.multi.back") + "</p>";
  };

  /* ---- R61: the set-aside findings ---- */
  const aside = function (cs, view, rows) {
    const a = view.data.aside;
    if (!a || a.state === "loading") return "";
    if (a.state === "failed") return cs.sec("progression.finding.state.dismissed", cs.state(a, null), { help: "queue.aside.help" });
    if (!rows.length) return "";
    const body = rows.map(function (r) {
      if (!r) return "";
      const title = typeof r.title === "string" && r.title.trim() ? r.title : null;
      const ref = cs.ref("timeline", String(r.finding || r.key || ""), title || cs.w("queue.source.untitled", { date: { html: cs.date(String(r.at || "")) } }), []);
      const you = r.decided_by === "you" || r.by_you === true || (view.me && r.decided_by && (r.decided_by === view.me.member || r.decided_by === view.me.handle));
      const dismissed = r.state === "dismissed";
      const decision = dismissed
        ? (you ? cs.w("queue.aside.dismissed", { date: { html: cs.date(String(r.at || "")) } }) : cs.w("queue.aside.dismissed.bymember", { member: cs.memberName(r.decided_by), date: { html: cs.date(String(r.at || "")) } }))
        : (you ? cs.w("queue.aside.deferred", { date: { html: cs.date(String(r.at || "")) } }) : cs.w("queue.aside.deferred.bymember", { member: cs.memberName(r.decided_by), date: { html: cs.date(String(r.at || "")) } }));
      const version = r.definition_version !== null && r.definition_version !== undefined ? " · " + cs.w("queue.aside.v2", { n: String(r.definition_version) }) : "";
      const reason = typeof r.reason === "string" && r.reason.trim() ? ' · <span class="rec">' + cs.esc(r.reason) + "</span>" : "";
      const again = !dismissed ? cs.act("proposedispose", { label: "act.proposedispose.label.queue", data: { to: "dismissed", project: r.project ? String(r.project) : "", finding: String(r.finding || ""), key: r.key ? String(r.key) : "", version: r.definition_version === null || r.definition_version === undefined ? "" : String(r.definition_version) } }) : "";
      return cs.row(cs.icon(dismissed ? "refused" : "clock"), ref + '<span class="meta">' + decision + reason + version + (again ? " " + again : "") + "</span>", "", "");
    }).filter(Boolean).join("");
    return cs.sec("progression.finding.state.dismissed", '<p class="mk-small muted">' + cs.w("queue.aside.help2") + "</p>" + cs.sheet(body), { help: "queue.aside.help" });
  };

  return { PER_ITEM_MAX: PER_ITEM_MAX, entry: entry, run: run, outcome: outcome, strip: strip, failedFeeds: failedFeeds, allClear: allClear, answered: answered, aside: aside, when: when, dayField: dayField, dayOf: dayOf, snoozed: snoozed };
}
