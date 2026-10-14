/* The member's queue (registry screen `queue`; screens-daily R2, R3, R7, R12, R13; DEC-110, DEC-131, DEC-201 (13), DEC-212). Everything waiting on the
   member, drawn by kind (To do, Noticed, Status) and grouped by case, in the sort they chose; each item's acts are its own
   decorated options and the door its disposition names (queue R12, R17, R46), drawn when the op is one of the screen's
   registered acts, and any other option as "Open". The sort is the route's subject (`/app/queue/due`), so a chosen sort
   survives a reload and the browser's history (interface-shell R9). With nothing waiting it says the member is up to date
   (R12). The unsent-request item (`action-producers` R25) draws its own three acts (R13). Every function is
   self-contained (interface-shell R21 (1)). */

export const queue = Object.freeze({
  id: "queue",

  // R2: `queue` R49's sorts; any other subject reads the default (by case, then kind).
  reads: function (view) {
    const SORTS = ["added", "due", "case", "kind"];
    const sort = SORTS.indexOf(String(view.subject || "")) >= 0 ? String(view.subject) : "";
    return {
      queue: {
        op: "queue", query: sort ? { sort: sort } : {},
        empty: function (v) { return !v || !Array.isArray(v.items) || v.items.length === 0; },
      },
    };
  },

  render: function (cs, view) {
    const SORTS = ["added", "due", "case", "kind"];
    const CLASS_KIND = { OBLIGATION: "todo", FINDING: "noticed", CONDITION: "status" };
    // The registry's twelve acts (R3, R13), under the names options and dispositions carry (OP_ALIASES' targets included);
    // `actionmove` is drawn only on the unsent-request item, by R13's own rule below.
    const REGISTERED = {
      taskresolve: "taskresolve", taskforward: "taskforward", proposedispose: "proposedispose", queuesnooze: "queuesnooze",
      queuemute: "queuemute", adoptversion: "adoptversion", versionadopt: "adoptversion", keepversion: "keepversion",
      versionkeep: "keepversion", reminderanswer: "reminderanswer", promote: "promote", projectkeyset: "projectkeyset",
      exploreapprove: "exploreapprove",
    };
    // The queue's words keyed in WORD_ROWS (`queue.<kind>.summary` / `.detail`); an item of any other kind draws its own.
    const KEYED = ["question-find", "step-later-found", "step-date-due", "step-reminder", "step-cost-shared", "step-cost-message",
      "milestone-overdue", "milestone-reminder", "project-quiet", "review-comment-left-out", "action-clock-overdue.ours",
      "action-clock-overdue.theirs", "member-left-items", "watch-keep-or-stop", "plan-review-due", "plan-look-again",
      "litigation-hold.docket"];
    // The screens T46 builds, by the kind of subject an item names (R3's "Open").
    const OPENS = { project: "project", inquiry: "question", question: "question", bundle: "document", information: "document", capture: "document", document: "document", action: "action" };
    const sort = SORTS.indexOf(String(view.subject || "")) >= 0 ? String(view.subject) : "case";
    // The fields an act needs from the member, drawn in place in a disclosure with the act (interface-shell R11's dialog is
    // a terminal or signed act's; these are not), each read by the act's `send` through `cs.value`.
    const FIELDS = {
      taskforward: [["to", "screen.queue.forward.to"]], adoptversion: [["why", "screen.queue.why"]],
      reminderanswer: [["on", "screen.queue.reminder.on"]], promote: [["question", "screen.queue.question"]],
      projectkeyset: [["key", "screen.queue.projectkey"]], queuesnooze: [["until", "screen.queue.snooze.until"]],
    };
    let seq = 0;
    const actOf = function (op, data) {
      const fields = FIELDS[op];
      if (!fields) return cs.act(op, { label: "act." + op + ".label.queue", data: data });
      const f = "qa-" + (seq++);
      const button = cs.act(op, { label: "act." + op + ".label.queue", data: Object.assign({}, data, { f: f }) });
      return button ? '<details class="mk-actd"><summary>' + cs.w("act." + op + ".label.queue") + "</summary>"
        + fields.map(function (x) { return cs.field(f + "-" + x[0], x[1], {}); }).join("") + button + "</details>" : "";
    };

    const caseOf = function (it) {
      const c = it.case || {};
      const a = Array.isArray(c.ancestors) ? c.ancestors : [];
      const p = a.filter(function (x) { return x && x.type === "project"; })[0] || a[a.length - 1];
      return c.ungrouped || !p ? null : p;
    };
    const keyOf = function (it) {
      if (typeof it.word === "string") {
        const m = /^queue\.(.+)\.summary$/.exec(it.word);
        if (m && KEYED.indexOf(m[1]) >= 0) return m[1];
      }
      return KEYED.indexOf(String(it.kind)) >= 0 && it.fills ? String(it.kind) : null;
    };
    const today = new Date(cs.now()).toISOString().slice(0, 10);
    const dueOf = function (iso) {
      const day = String(iso).slice(0, 10);
      if (day < today) return cs.due(String(iso), "overdue");
      const soon = new Date(cs.now() + 2 * 86400000).toISOString().slice(0, 10);
      return cs.due(String(iso), day === today || day <= soon ? "near" : "");
    };
    const hintOf = function (it) {
      const h = it.hint && typeof it.hint === "object" ? it.hint : null;
      if (!h) return "";
      const rate = typeof h.false_alarm_rate === "number" ? h.false_alarm_rate : (typeof h.rate === "number" ? h.rate : null);
      const dl = '<dl class="mk-dl">'
        + (h.matched ? "<dt>" + cs.w("screen.queue.hint.matched") + "</dt><dd>" + cs.esc(h.matched) + "</dd>" : "")
        + (h.how ? "<dt>" + cs.w("screen.queue.hint.method") + "</dt><dd>" + cs.esc(h.how) + "</dd>" : "")
        + "<dt>" + cs.w("screen.queue.hint.trust") + "</dt><dd>"
        + (rate === null ? cs.w("screen.queue.hint.rate.none") : cs.w("screen.queue.hint.rate", { rate: String(Math.round(rate <= 1 ? rate * 100 : rate)) })) + "</dd>"
        + "<dt>" + cs.w("screen.queue.hint.not") + "</dt><dd>" + (h.not ? cs.esc(h.not) : cs.w("screen.queue.hint.not.text")) + "</dd></dl>";
      return '<details class="mk-hintd"><summary>' + cs.hint() + " " + cs.w("screen.queue.hint.how") + "</summary>" + dl + "</details>";
    };
    // The acts an item offers (R3): its options and its disposition's door, each once, those registered drawn.
    const actsOf = function (it, cas) {
      const ops = [];
      const add = function (op) { const r = REGISTERED[op]; if (r && ops.indexOf(r) < 0) ops.push(r); };
      let other = false;
      (Array.isArray(it.options) ? it.options : []).forEach(function (o) {
        const id = o && (o.id || o.op);
        if (REGISTERED[id]) add(id); else if (id) other = true;
      });
      const d = it.disposition || {};
      if (d.available && d.op) add(d.op);
      (Array.isArray(d.acts) ? d.acts : []).forEach(add);
      if (d.instead) add(d.instead);
      if (it.class !== "OBLIGATION") add("queuemute");
      const data = {
        item: it.id, cls: it.class || "", kind: it.kind || "",
        subject: it.subject && it.subject.id ? String(it.subject.id) : "",
        entry: it.subject && it.subject.entry !== undefined ? String(it.subject.entry) : "",
        day: it.subject && it.subject.day ? String(it.subject.day) : "",
        owner: it.basis && it.basis.owner ? String(it.basis.owner) : "",
        notice: d.notice ? String(d.notice) : "",
        finding: d.finding ? String(d.finding) : "",
        project: d.project ? String(d.project) : (Array.isArray(d.projects) && d.projects[0] ? String(d.projects[0]) : (cas ? String(cas.id) : "")),
      };
      const drawn = ops.map(function (op) { return actOf(op, data); }).join("");
      const screen = it.subject && OPENS[it.subject.kind];
      const open = other && screen && it.subject.id
        ? '<a class="cs-btn" data-tone="quiet" data-nav href="/app/' + screen + "/" + encodeURIComponent(String(it.subject.id)) + '">' + cs.w("screen.queue.open") + "</a>"
        : "";
      return drawn + open;
    };
    // R13 (DEC-212; `action-producers` R25): the unsent request: "Pick up where you left off" opens the action's screen,
    // "Keep it for later" snoozes its case (`queue` R21), "Drop the request, with a reason" moves the action to `abandoned`.
    const unsentActs = function (it, cas) {
      const id = it.subject && it.subject.id ? String(it.subject.id) : "";
      const pick = id ? '<a class="cs-btn" data-tone="quiet" data-nav href="/app/action/' + encodeURIComponent(id) + '">' + cs.w("screen.queue.unsent.pickup") + "</a>" : "";
      const f = "qa-" + (seq++);
      const snoozeBtn = cas ? cs.act("queuesnooze", { label: "screen.queue.unsent.keep", data: { project: String(cas.id), f: f } }) : "";
      const snooze = snoozeBtn ? '<details class="mk-actd"><summary>' + cs.w("screen.queue.unsent.keep") + "</summary>"
        + cs.field(f + "-until", "screen.queue.snooze.until", {}) + snoozeBtn + "</details>" : "";
      const drop = id ? cs.act("actionmove", { label: "screen.queue.unsent.drop", data: { item: it.id, action: id } }) : "";
      return pick + snooze + drop;
    };
    const itemRow = function (it) {
      const cas = caseOf(it);
      const k = keyOf(it);
      const fills = it.fills && typeof it.fills === "object" ? it.fills : {};
      const summary = k ? cs.w("queue." + k + ".summary", fills) : cs.esc(it.summary || "");
      const detail = k ? cs.w("queue." + k + ".detail", fills) : (it.detail ? cs.esc(it.detail) : "");
      return cs.row(cs.mark("kind", CLASS_KIND[it.class] || "status"),
        summary + (detail ? '<span class="meta">' + detail + "</span>" : "") + hintOf(it)
          + '<span class="mk-acts">' + (it.kind === "request-unsent" ? unsentActs(it, cas) : actsOf(it, cas)) + "</span>",
        it.due ? dueOf(it.due) : "", "");
    };

    // The three-kinds note: once per member, on the device (R2). Decided once per visit and kept in the screen's page
    // memory, so the page's redraws keep it while the member is here.
    const ui = view.ui || {};
    if (ui.kindsNote === undefined) {
      let show = false;
      try {
        const store = globalThis.localStorage;
        const k = "bio-queue-kinds-note:" + (view.me && view.me.member ? view.me.member : "");
        if (store && !store.getItem(k)) { store.setItem(k, "shown"); show = true; }
      } catch (e) { show = false; }
      ui.kindsNote = show;
    }
    const note = ui.kindsNote
      ? '<p class="mk-note">' + cs.w("screen.queue.note") + ' <span class="muted">' + cs.w("screen.queue.note.once") + "</span></p>" : "";

    const sorts = '<nav class="mk-sorts" aria-label="' + cs.w("screen.queue.sort") + '"><span>' + cs.w("screen.queue.sort") + "</span> "
      + SORTS.map(function (s) {
        return s === sort ? '<b aria-current="true">' + cs.w("screen.queue.sort." + s) + "</b>"
          : '<a data-nav href="/app/queue/' + s + '">' + cs.w("screen.queue.sort." + s) + "</a>";
      }).join(" · ") + "</nav>";

    const body = cs.state("queue", function (q) {
      const items = Array.isArray(q.items) ? q.items : [];
      const groups = [];
      const at = {};
      items.forEach(function (it) {
        const c = caseOf(it);
        const key = c ? String(c.id) : "";
        if (!(key in at)) { at[key] = groups.length; groups.push({ c: c, items: [] }); }
        groups[at[key]].items.push(it);
      });
      const n = typeof q.item_count === "number" ? q.item_count : items.length;
      const head = '<p class="mk-sub"><span>' + (n === 1 ? cs.w("screen.queue.count.one") : cs.w("screen.queue.count.many", { n: String(n) }))
        + '</span><span class="sep"> · </span><span>' + cs.w("screen.queue.grouped") + "</span></p>";
      return head + groups.map(function (g) {
        const title = g.c ? cs.ref("project", g.c.id, g.c.title || g.c.id, []) : cs.w("screen.queue.nocase");
        const snooze = g.c ? '<span class="mk-acts">' + actOf("queuesnooze", { project: String(g.c.id) }) + "</span>" : "";
        return '<section class="cs-section mk-sec"><h2>' + title + "</h2>" + snooze + cs.sheet(g.items.map(itemRow).join("")) + "</section>";
      }).join("") + (q.truncated ? '<p class="mk-note">' + cs.w("screen.queue.more", { n: String(Math.max(0, n - items.length)) }) + "</p>" : "");
    }, { empty: "screen.queue.uptodate" });

    // R12 (DEC-201 (13)): with nothing waiting, the member is up to date, one step from Home.
    const q = view.data.queue;
    const home = q && q.state === "empty" ? '<p class="mk-acts"><a class="cs-btn" data-tone="quiet" data-nav href="/app">' + cs.w("screen.queue.gohome") + "</a></p>" : "";
    return cs.title(undefined, {}) + note + sorts + body + home;
  },

  // R3: each act's body from the item it was drawn on (`el.dataset`, the data `cs.act` was handed).
  acts: [
    { op: "taskresolve", label: "act.taskresolve.label.queue",
      send: function (view, el) { return { body: { id: el.dataset.item } }; } },
    { op: "taskforward", label: "act.taskforward.label.queue",
      send: function (view, el, cs) {
        const to = String(cs.value(el.dataset.f + "-to") || "").trim().replace(/^@/, "");
        return to ? { body: { id: el.dataset.item, to: to } } : { refuse: "screen.queue.fieldfirst" };
      } },
    { op: "proposedispose", label: "act.proposedispose.label.queue",
      send: function (view, el) {
        return { body: { project: el.dataset.project, finding: el.dataset.finding || el.dataset.item, to: "dismissed" } };
      } },
    { op: "queuesnooze", label: "act.queuesnooze.label.queue",
      send: function (view, el, cs) {
        const until = String(cs.value(el.dataset.f + "-until") || "").trim();
        return until ? { body: { case: el.dataset.project, until: until } } : { refuse: "screen.queue.fieldfirst" };
      } },
    { op: "queuemute", label: "act.queuemute.label.queue",
      send: function (view, el) { return { body: { item: el.dataset.item } }; } },
    // Adopting asks why (reevaluation R15); the member's words are the act's reason (interface-shell R11, K3002).
    { op: "adoptversion", label: "act.adoptversion.label.queue", reasonField: "why",
      send: function (view, el, cs) {
        const why = String(cs.value(el.dataset.f + "-why") || "").trim();
        return why ? { body: { notice: el.dataset.notice, why: why } } : { refuse: "screen.queue.fieldfirst" };
      } },
    { op: "keepversion", label: "act.keepversion.label.queue",
      send: function (view, el) { return { body: { notice: el.dataset.notice } }; } },
    { op: "reminderanswer", label: "act.reminderanswer.label.queue",
      send: function (view, el, cs) {
        const on = String(cs.value(el.dataset.f + "-on") || "").trim();
        const body = { target: el.dataset.subject, entry: Number(el.dataset.entry || 0) };
        if (on) body.on = on;
        return { body: body };
      } },
    // A hint becomes a question in its case's project (R3; promotion's inquiry), opened on success.
    { op: "promote", label: "act.promote.label.queue",
      send: function (view, el, cs) {
        const q = String(cs.value(el.dataset.f + "-question") || "").trim();
        if (!q) return { refuse: "screen.queue.fieldfirst" };
        const iso = new Date(cs.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
        const nonce = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
        const text = "---\nobject_type: inquiry\nquestion: " + JSON.stringify(q) + "\ncurrent_state: open\ncreated: \"" + iso
          + "\"\nlast_updated: \"" + iso + "\"\n---\n\n## Session Log\n\n### Session " + iso
          + " | Formation | interactive\nTrigger: opened from a hint in the queue (" + String(el.dataset.item).replace(/[\n\r]/g, " ") + ")\nChanges: created.\n";
        return {
          query: el.dataset.project ? { project: el.dataset.project } : {},
          body: {
            base: null, snapKey: iso.replace(/[-:]/g, "") + "_" + nonce,
            meta: { object_type: "inquiry", title: q, current_state: "open", created: iso, last_updated: iso },
            files: [{ path: "bundle.md", text: text }], register: [],
          },
        };
      },
      done: function (view, answer, cs) {
        const id = answer && (answer.bundleId || (answer.result && answer.result.bundleId));
        if (id) cs.go("question", id);
      } },
    { op: "projectkeyset", label: "act.projectkeyset.label.queue",
      send: function (view, el, cs) {
        const key = String(cs.value(el.dataset.f + "-key") || "").trim();
        const owner = String(el.dataset.owner || "");
        const project = owner.indexOf("project:") === 0 ? owner.slice(8) : el.dataset.project;
        return key && project ? { body: { project: project, key: key } } : { refuse: "screen.queue.fieldfirst" };
      } },
    // R13: the unsent request dropped, with the member's reason (the shell asks it: `actionmove` is reasoned).
    { op: "actionmove", label: "act.actionmove.label.queue",
      send: function (view, el) { return el.dataset.action ? { body: { target: el.dataset.action, to: "abandoned" } } : null; } },
    { op: "exploreapprove", label: "act.exploreapprove.label.queue",
      send: function (view, el) { return { body: { owner: el.dataset.owner, day: el.dataset.day } }; } },
  ],
});
