/* The member's queue (registry screen `queue`; screens-daily R2, R3, R7, R12, R13, R18, R19, R21, R22; DEC-110, DEC-131, DEC-201 (13), DEC-212,
   DEC-226 (1)). Everything waiting on the
   member, drawn by kind (To do, Noticed, Status) and grouped by case, in the sort they chose; each item's acts are its own
   decorated options and the door its disposition names (queue R12, R17, R46), drawn when the op is one of the screen's
   registered acts, and any other option as "Open". The sort is the route's subject (`/app/queue/due`), so a chosen sort
   survives a reload and the browser's history (interface-shell R9). With nothing waiting it says the member is up to date
   (R12). The unsent-request item (`action-producers` R25) draws its own three acts (R13). "Mute a kind" mutes the item's
   kind for its nearest home case (R18). The update to-do has its own section, "Your group's Civicsmith" (R19). The source
   notices of one kind are one item with their count, opening the list of their documents (R22, the `sourceItems` part).
   Every function is self-contained (interface-shell R21 (1)). */
import { sourceItems } from "./source-items.mjs";
import { itemWords } from "./item-words.mjs";
import { queueStates } from "./queue-states.mjs";
import { doors } from "./doors.mjs";

export const queue = Object.freeze({
  id: "queue",
  parts: { sourceItems, itemWords, queueStates, doors },

  // R2: `queue` R49's sorts; any other subject reads the default (by case, then kind). R59, R61: `/app/queue/answered` reads what the
  // member answered and the set-aside findings; R58: `/app/queue/choose` reads the queue as it is, each item with a box. The queue's
  // reads are `refresh: true` (R60, interface-shell R93): the shell reads them again while the screen is on view.
  reads: function (view) {
    const SORTS = ["added", "due", "case", "kind"];
    const sub = String(view.subject || "");
    const none = function (key) { return function (v) { return !v || !Array.isArray(v[key]) || v[key].length === 0; }; };
    if (sub === "answered") {
      return {
        answered: { op: "queue", query: { answered: "true" }, refresh: true, empty: none("answered") },
        aside: { op: "queue", query: { aside: "true", limit: "200" }, refresh: true, empty: none("aside") },
      };
    }
    const sort = SORTS.indexOf(sub) >= 0 ? sub : "";
    return {
      queue: {
        op: "queue", query: sort ? { sort: sort } : {}, refresh: true,
        empty: function (v) { return !v || !Array.isArray(v.items) || v.items.length === 0; },
      },
      // R50 (1): what the member has muted, `queue` R55's list, at the foot.
      muted: { op: "queue", query: { muted: "true" }, empty: none("muted") },
      // R65: the doors to Held captures and the Inbox, on the list only.
      held: view.parts.doors().reads().held,
      inbox: view.parts.doors().reads().inbox,
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
      exploreapprove: "exploreapprove", updatelater: "updatelater", projectjoin: "projectjoin", projectrequestanswer: "projectrequestanswer",
    };
    const sort = SORTS.indexOf(String(view.subject || "")) >= 0 ? String(view.subject) : "case";
    const ui = view.ui || {};
    const sub = String(view.subject || "");
    const choosing = sub === "choose";
    // R58: an outcome is shown only on the choosing route; leaving it drops the outcome, so choosing again starts clean.
    if (!choosing && ui.outcome) ui.outcome = null;
    // The fields an act needs from the member, drawn in place in a disclosure with the act (interface-shell R11's dialog is
    // a terminal or signed act's; these are not), each read by the act's `send` through `cs.value`.
    const FIELDS = {
      taskforward: [["to", "screen.queue.forward.to"]], adoptversion: [["why", "screen.queue.why"]],
      reminderanswer: [["on", "screen.queue.reminder.on"]], promote: [["question", "screen.queue.question"]],
      projectkeyset: [["key", "screen.queue.projectkey"]], queuesnooze: [["until", "screen.queue.snooze.until"]],
    };
    let seq = 0;
    const actOf = function (op, data, it) {
      // R42: an owner answers a request to join with Grant or Decline, the answers the item's option carries (queue-producers R42).
      if (op === "projectrequestanswer") {
        const opt = (it && Array.isArray(it.options) ? it.options : []).filter(function (o) { return o && (o.id || o.op) === op; })[0];
        const answers = opt && Array.isArray(opt.answers) && opt.answers.length ? opt.answers
          : [{ answer: "grant", label: "screen.home.request.grant" }, { answer: "decline", label: "screen.home.request.decline" }];
        return answers.map(function (a) {
          return cs.act(op, { label: "screen.home.request." + (String(a.answer) === "decline" ? "decline" : "grant"), data: Object.assign({ answer: String(a.answer) }, data) });
        }).join("");
      }
      const fields = FIELDS[op];
      if (!fields) return cs.act(op, { label: "act." + op + ".label.queue", data: data });
      const f = "qa-" + (seq++);
      const button = cs.act(op, { label: "act." + op + ".label.queue", data: Object.assign({}, data, { f: f }) });
      return button ? '<details class="mk-details"><summary>' + cs.w("act." + op + ".label.queue") + "</summary>"
        + fields.map(function (x) { return cs.field(f + "-" + x[0], x[1], {}); }).join("") + button + "</details>" : "";
    };

    const caseOf = function (it) {
      const c = it.case || {};
      const a = Array.isArray(c.ancestors) ? c.ancestors : [];
      const p = a.filter(function (x) { return x && x.type === "project"; })[0] || a[a.length - 1];
      return c.ungrouped || !p ? null : p;
    };
    // R18: the item's nearest home case, a question or a project (the ancestor of least depth).
    const nearestOf = function (it) {
      const c = it.case || {};
      if (c.ungrouped) return null;
      const a = (Array.isArray(c.ancestors) ? c.ancestors : []).filter(function (x) { return x && x.id && (x.type === "inquiry" || x.type === "project"); });
      a.sort(function (x, y) { return (Number(x.depth) || 0) - (Number(y.depth) || 0); });
      return a[0] || null;
    };
    const today = new Date(cs.now()).toISOString().slice(0, 10);
    const dueOf = function (iso) {
      const day = String(iso).slice(0, 10);
      if (day < today) return cs.due(String(iso), "");
      const soon = new Date(cs.now() + 2 * 86400000).toISOString().slice(0, 10);
      return cs.due(String(iso), day === today || day <= soon ? "near" : "");
    };
    const hintOf = function (it) {
      const h = it.hint && typeof it.hint === "object" ? it.hint : null;
      if (!h) return "";
      const rate = typeof h.false_alarm_rate === "number" ? h.false_alarm_rate : (typeof h.rate === "number" ? h.rate : null);
      // The false-alarm sentence names the rate, how many of the hints looked into were false and why most were (the word's own
      // placeholders); a rate the hint gives without those is not drawn, and no rate recorded says so.
      const known = rate !== null && h.looked !== undefined && h.looked !== null && h.false !== undefined && h.false !== null && typeof h.reason === "string" && h.reason;
      const trust = rate === null ? cs.w("screen.queue.hint.rate.none")
        : known ? cs.w("screen.queue.hint.rate", { rate: String(Math.round(rate <= 1 ? rate * 100 : rate)), false: String(h.false), looked: String(h.looked), reason: h.reason }) : "";
      const dl = '<dl class="mk-dl">'
        + (h.matched ? "<dt>" + cs.w("screen.queue.hint.matched") + "</dt><dd>" + cs.esc(h.matched) + "</dd>" : "")
        + (h.how ? "<dt>" + cs.w("screen.queue.hint.method") + "</dt><dd>" + cs.esc(h.how) + "</dd>" : "")
        + (trust ? "<dt>" + cs.w("screen.queue.hint.trust") + "</dt><dd>" + trust + "</dd>" : "")
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
      const near = nearestOf(it);
      const data = {
        mutecase: near ? String(near.id) : "",
        item: it.id, cls: it.class || "", kind: it.kind || "",
        subject: it.subject && it.subject.id ? String(it.subject.id) : "",
        who: it.subject && it.subject.requester ? String(it.subject.requester) : (it.fills && it.fills.who ? String(it.fills.who) : ""),
        entry: it.subject && it.subject.entry !== undefined ? String(it.subject.entry) : "",
        day: it.subject && it.subject.day ? String(it.subject.day) : "",
        owner: it.basis && it.basis.owner ? String(it.basis.owner) : "",
        notice: d.notice ? String(d.notice) : "",
        finding: d.finding ? String(d.finding) : "",
        project: d.project ? String(d.project) : (Array.isArray(d.projects) && d.projects[0] ? String(d.projects[0]) : (cas ? String(cas.id) : "")),
      };
      // R42: an invitation or a request to join names its project as its subject, not as a case.
      if ((it.kind === "project-invitation" || it.kind === "project-request") && it.subject && it.subject.id) data.project = String(it.subject.id);
      const drawn = ops.map(function (op) { return actOf(op, data, it); }).join("");
      const to = iw.open(it);
      const open = other && to ? '<a class="cs-btn" data-tone="quiet" data-nav href="' + to + '">' + cs.w("screen.queue.open") + "</a>" : "";
      return drawn + open;
    };
    // R13 (DEC-212; `action-producers` R25): the unsent request: "Pick up where you left off" opens the records request at
    // its step (the `request` screen takes the action's id; K3145),
    // "Keep it for later" snoozes its case (`queue` R21), "Drop the request, with a reason" moves the action to `abandoned`.
    const unsentActs = function (it, cas) {
      const id = it.subject && it.subject.id ? String(it.subject.id) : "";
      const pick = id ? '<a class="cs-btn" data-tone="quiet" data-nav href="/app/request/' + encodeURIComponent(id) + '">' + cs.w("screen.queue.unsent.pickup") + "</a>" : "";
      const f = "qa-" + (seq++);
      const snoozeBtn = cas ? cs.act("queuesnooze", { label: "screen.queue.unsent.keep", data: { project: String(cas.id), f: f } }) : "";
      const snooze = snoozeBtn ? '<details class="mk-details"><summary>' + cs.w("screen.queue.unsent.keep") + "</summary>"
        + cs.field(f + "-until", "screen.queue.snooze.until", {}) + snoozeBtn + "</details>" : "";
      const drop = id ? cs.act("actionmove", { label: "screen.queue.unsent.drop", here: "queue", data: { item: it.id, action: id } }) : "";
      return pick + snooze + drop;
    };
    const src = view.parts.sourceItems();
    const iw = view.parts.itemWords();
    const pickBox = function (it) {
      const on = Array.isArray(ui["pick:queue"]) && ui["pick:queue"].indexOf(String(it.id)) >= 0;
      const name = (iw.words(cs, it).summary || "").replace(/<[^>]*>/g, "") || String(it.id);
      return '<input type="checkbox" class="mk-pick" id="queue-pick-' + cs.esc(String(it.id)) + '" data-shell="pick" data-table="queue" data-id="' + cs.esc(String(it.id)) + '"'
        + (on ? " checked" : "") + ' aria-label="' + cs.w("screen.finder.pick", { title: name }) + '">';
    };
    const itemRow = function (it, picking) {
      // R58: the choosing state draws a box on each item and its kind beside the words.
      if (picking && !it.sources) {
        const wd0 = iw.words(cs, it);
        return cs.row(pickBox(it), wd0.summary + '<span class="meta">' + cs.mark("kind", CLASS_KIND[it.class] || "status") + (wd0.detail ? " " + wd0.detail : "") + "</span>", "", "");
      }
      // R22: one kind's source notices as one item with its count; each document with its own options.
      if (it.sources) {
        const g = src.draw(cs, it, function (x) { return actsOf(x, caseOf(x)); });
        return cs.row(cs.mark("kind", CLASS_KIND[it.class] || "noticed"), g.list + '<span class="meta">' + g.detail + "</span>", "", "");
      }
      const cas = caseOf(it);
      // R28, R31: the subject by its title, the act by its label; a reply owed and not recorded, never "overdue".
      const wd = iw.words(cs, it);
      return cs.row(cs.mark("kind", CLASS_KIND[it.class] || "status"),
        wd.summary + (wd.detail ? '<span class="meta">' + wd.detail + "</span>" : "") + hintOf(it)
          + '<span class="mk-acts">' + (it.kind === "request-unsent" ? unsentActs(it, cas) : actsOf(it, cas)) + "</span>",
        it.due ? (iw.ours(cs, it) || dueOf(it.due)) : "", "");
    };

    // The three-kinds note: once per member, on the device (R2). Decided once per visit and kept in the screen's page
    // memory, so the page's redraws keep it while the member is here.
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

    const sorts = '<nav class="mk-sortrow" aria-label="' + cs.w("screen.queue.sort") + '"><span>' + cs.w("screen.queue.sort") + "</span> "
      + SORTS.map(function (s) {
        return s === sort ? '<b aria-current="true">' + cs.w("screen.queue.sort." + s) + "</b>"
          : '<a data-nav href="/app/queue/' + s + '">' + cs.w("screen.queue.sort." + s) + "</a>";
      }).join(" · ") + "</nav>";

    // R19 (DEC-226 (1)): the update to-do, under its own section: the release, its date, the security mark when marked,
    // "See what changes" (opening `updates`) and Not now (`updatelater`).
    const updateSection = function (list) {
      if (!list.length) return "";
      return cs.sec("queue.update.section", cs.sheet(list.map(function (it) {
        const d = it.detail && typeof it.detail === "object" ? it.detail : {};
        const version = String(d.version || it.version || "");
        const security = (d.security !== undefined ? d.security : it.security) === true;
        const mark = security ? '<span class="mk-tag" tabindex="0" data-level="1" data-tip="' + cs.w("updates.ready.security_says") + '">' + cs.w("updates.ready.security") + "</span> " : "";
        const acts = '<a class="cs-btn" data-tone="quiet" data-nav href="/app/updates">' + cs.w("queue.update.see") + "</a>"
          + cs.act("updatelater", { label: "act.owed_updatelater.label.queue", data: { version: version } });
        return cs.row(cs.mark("kind", "todo"), mark + cs.w("queue.update.ready", { version: version, date: { html: cs.date(String(d.date || it.date || "")) } })
          + '<span class="mk-acts">' + acts + "</span>", it.due ? dueOf(it.due) : "", "");
      }).join("")), { help: "queue.update.section_says" });
    };

    // The list, by case: the default view (R2) or the choosing state (R58: a box on each item, the source notices not folded).
    const listOf = function (picking) {
      return cs.state("queue", function (q) {
        const all = Array.isArray(q.items) ? q.items : [];
        const updates = picking ? [] : all.filter(function (it) { return it && it.kind === "update-ready"; });
        const rest = picking ? all : all.filter(function (it) { return !(it && it.kind === "update-ready"); });
        const items = picking ? rest : src.fold(rest);
        const groups = [];
        const at = {};
        items.forEach(function (it) {
          const c = caseOf(it.sources ? it.sources[0] : it);
          const key = c ? String(c.id) : "";
          if (!(key in at)) { at[key] = groups.length; groups.push({ c: c, items: [] }); }
          groups[at[key]].items.push(it);
        });
        const n = typeof q.item_count === "number" ? q.item_count : items.length;
        const head = picking ? '<p class="mk-sub">' + cs.w("queue.multi.head") + " " + cs.w("queue.multi.head2") + "</p>"
          : '<p class="mk-sub"><span>' + (n === 1 ? cs.w("screen.queue.count.one") : cs.w("screen.queue.count.many", { n: String(n) }))
          + "</span> · <span>" + cs.w("screen.queue.grouped") + "</span></p>";
        return head + updateSection(updates) + groups.map(function (g) {
          const title = g.c ? cs.ref("project", g.c.id, g.c.title || g.c.id, []) : cs.w("screen.queue.nocase");
          const snooze = g.c && !picking ? '<span class="mk-acts">' + actOf("queuesnooze", { project: String(g.c.id) }) + "</span>" : "";
          return '<section class="cs-section mk-sec"><h2>' + title + "</h2>" + snooze + cs.sheet(g.items.map(function (it) { return itemRow(it, picking); }).join("")) + "</section>";
        }).join("") + (q.truncated ? '<p class="mk-note">' + (function (m) { return m === 1 ? cs.w("screen.queue.more.one") : cs.w("screen.queue.more", { n: String(m) }); })(Math.max(0, n - items.length)) + "</p>" : "");
      }, { empty: "screen.queue.empty" });
    };

    // R50 (1): "Muted", at the foot: each kind muted in a project, and each item muted on its own, with "Turn back on". A row
    // with no instant says `queue.muted.by.undated`, never a blank date. Not drawn when nothing is drawable.
    const mutedPart = (function () {
      const m = view.data.muted;
      if (!m || m.state === "loading" || m.state === "empty") return "";
      if (m.state === "failed") return cs.sec("queue.muted.title", cs.state("muted", null), { help: "queue.muted.help" });
      const rows = (m.value && Array.isArray(m.value.muted) ? m.value.muted : []).map(function (r) {
        if (!r) return "";
        const by = r.at ? cs.w("queue.muted.by", { date: { html: cs.date(String(r.at)) } }) : cs.w("queue.muted.by.undated");
        if (r.kind && r.case && r.case.id) {
          const unmute = cs.act("queuemute", { label: "queue.muted.unmute", here: "queue_kind", data: { unmute: "kind", mutecase: String(r.case.id), kind: String(r.kind) } });
          return cs.row("", cs.w("queue.muted.kind", { kind: { html: cs.w("queue.kind." + String(r.kind)) }, project: { html: cs.ref("project", String(r.case.id), r.case.title || String(r.case.id), []) } })
            + '<span class="meta">' + by + "</span>", unmute, "");
        }
        if (r.item) {
          const unmute = cs.act("queuemute", { label: "queue.muted.unmute", data: { unmute: "item", item: String(r.item) } });
          // R61 (2): the item by its title, else its kind's plain name, never its id; with neither, the shell's unread word.
          const named = typeof r.title === "string" && r.title.trim() ? r.title : r.kind ? { html: cs.w("queue.kind." + String(r.kind)) } : { html: cs.w("shell.unread") };
          return cs.row("", cs.w("queue.muted.item", { item: named }) + '<span class="meta">' + by + "</span>", unmute, "");
        }
        return "";
      }).filter(Boolean);
      return rows.length ? cs.sec("queue.muted.title", cs.sheet(rows.join("")), { help: "queue.muted.help" }) : "";
    })();
    const doneNote = typeof ui.done === "string" && ui.done
      ? '<p class="mk-note" role="status">' + cs.w("queue.done", { what: { html: cs.w("act." + ui.done + ".label.queue") } }) + "</p>" : "";

    // R41, R60: with nothing waiting and every feed answered, the sentence, each class "none here", the up-to-date row and the door to
    // Home; with a feed that did not answer, the all-clear is withheld and the failed feed named with "Try again".
    const states = view.parts.queueStates();
    const q = view.data.queue;
    const qv = q && (q.state === "ok" || q.state === "empty") && q.value && typeof q.value === "object" ? q.value : {};
    const again = "/app/queue" + (sub ? "/" + sub : "");
    const failedRow = states.failedFeeds(cs, qv, again);
    const wordsOf = function (it) { const wd = iw.words(cs, it); return wd.summary || cs.esc(String(it.id)); };
    const doorOf = function (it, op) {
      const c = caseOf(it);
      return REGISTERED[op] ? actOf(REGISTERED[op], { item: it.id, project: c ? String(c.id) : "", subject: it.subject && it.subject.id ? String(it.subject.id) : "" }, it)
        : (function () { const to = iw.open(it); return to ? '<a class="cs-btn" data-tone="quiet" data-nav href="' + to + '">' + cs.w("screen.queue.open") + "</a>" : ""; })();
    };
    // R59, R61: what the member answered, and the findings set aside, on the same page; the aside is paged by `after` to its end.
    if (sub === "answered") {
      const first = view.data.aside && view.data.aside.state === "ok" && view.data.aside.value && Array.isArray(view.data.aside.value.aside) ? view.data.aside.value.aside : [];
      const av = view.data.aside && view.data.aside.state === "ok" ? view.data.aside.value : null;
      if (Array.isArray(ui.asideAll) === false && av && av.truncated && av.next && !ui.asideWalking) {
        ui.asideWalking = true;
        const rows = first.slice();
        const walk = function (after) {
          return cs.call("queue", { query: { aside: "true", limit: "200", after: after } }).then(function (a) {
            const v = a && typeof a === "object" ? (a.result && typeof a.result === "object" ? a.result : a) : null;
            if (!v || v.ok === false || !Array.isArray(v.aside)) return rows;
            v.aside.forEach(function (r) { rows.push(r); });
            return v.truncated && v.next ? walk(String(v.next)) : rows;
          }, function () { return rows; });
        };
        walk(String(av.next)).then(function (all) { cs.set("asideAll", all); });
      }
      const drawn = Array.isArray(ui.asideAll) ? ui.asideAll : first;
      return states.answered(cs, view, states.aside(cs, view, drawn));
    }
    // R58: the outcome of a set act (state e), and the choosing state (state d) with its hold strip.
    if (choosing && ui.outcome) return states.outcome(cs, view, ui.outcome, wordsOf, doorOf);
    if (choosing) {
      const picked = Array.isArray(ui["pick:queue"]) ? ui["pick:queue"] : [];
      const have = q && q.state === "ok" && q.value && Array.isArray(q.value.items) ? q.value.items.filter(function (it) { return it && picked.indexOf(String(it.id)) >= 0; }).length : 0;
      return cs.title(undefined, {}) + doneNote + listOf(true) + (have ? states.strip(cs, have) : "") + '<p class="mk-acts"><a class="cs-btn" data-tone="quiet" data-nav href="/app/queue">' + cs.w("queue.multi.back") + "</a></p>" + mutedPart;
    }
    // R65: the doors to Held captures and the Inbox, on the list and its empty states.
    const doorsHtml = view.parts.doors().draw(cs, view, "queue");
    if (q && q.state === "empty") {
      if (qv.feeds && qv.all_answered === false) {
        return cs.title(undefined, {}) + doneNote + '<p class="mk-sub">' + cs.w("queue.allclear.withheld") + "</p>" + failedRow + doorsHtml + mutedPart;
      }
      return cs.title(undefined, {}) + doneNote + doorsHtml + listOf(false) + (qv.feeds ? states.allClear(cs, qv) : "") + mutedPart;
    }
    return cs.title(undefined, {}) + doneNote + (q && q.state === "ok" ? failedRow + states.entry(cs) : "") + doorsHtml + note + sorts + listOf(false) + mutedPart;
  },

  // R3: each act's body from the item it was drawn on (`el.dataset`, the data `cs.act` was handed).
  acts: [
    { op: "taskresolve", label: "act.taskresolve.label.queue",
      send: function (view, el, cs, extra) { return el.dataset.multi ? view.parts.queueStates().run("taskresolve", view, el, cs, extra) : { body: { id: el.dataset.item } }; },
      done: function (view, answer, cs) { cs.set("done", "taskresolve"); } },
    { op: "taskforward", label: "act.taskforward.label.queue",
      send: function (view, el, cs, extra) {
        if (el.dataset.multi) return view.parts.queueStates().run("taskforward", view, el, cs, extra);
        const to = String(cs.value(el.dataset.f + "-to") || "").trim().replace(/^@/, "");
        return to ? { body: { id: el.dataset.item, to: to } } : { refuse: "screen.queue.fieldfirst" };
      },
      done: function (view, answer, cs) { cs.set("done", "taskforward"); } },
    { op: "proposedispose", label: "act.proposedispose.label.queue",
      send: function (view, el, cs, extra) {
        if (el.dataset.multi) return view.parts.queueStates().run("proposedispose", view, el, cs, extra);
        // R61: a deferred set-aside finding is dismissed with a reason: an instance row by its key and version, a project row by both.
        if (el.dataset.key) return { body: { key: el.dataset.key, definition_version: el.dataset.version === "" ? undefined : Number(el.dataset.version), to: "dismissed" } };
        return { body: { project: el.dataset.project, finding: el.dataset.finding || el.dataset.item, to: "dismissed" } };
      },
      done: function (view, answer, cs) { cs.set("done", "proposedispose"); } },
    { op: "queuesnooze", label: "act.queuesnooze.label.queue",
      send: function (view, el, cs, extra) {
        if (el.dataset.multi) return view.parts.queueStates().run("queuesnooze", view, el, cs, extra);
        const until = String(cs.value(el.dataset.f + "-until") || "").trim();
        return until ? { body: { case: el.dataset.project, until: until } } : { refuse: "screen.queue.fieldfirst" };
      } },
    // R18 (queue R19, R20): "Mute a kind" mutes the item's kind for its nearest home case; with no case, the item.
    { op: "queuemute", label: "act.queuemute.label.queue",
      send: function (view, el) {
        // R50 (1): "Turn back on" sends the same form with `unmute`.
        if (el.dataset.unmute === "kind") return { body: { case: el.dataset.mutecase, kinds: [el.dataset.kind], unmute: true } };
        if (el.dataset.unmute === "item") return { body: { item: el.dataset.item, unmute: true } };
        return el.dataset.mutecase && el.dataset.kind ? { body: { case: el.dataset.mutecase, kinds: [el.dataset.kind] } } : { body: { item: el.dataset.item } };
      },
      done: function (view, answer, cs) { cs.set("done", "queuemute"); } },
    // Adopting asks why (reevaluation R15); the member's words are the act's reason (interface-shell R11, K3002).
    { op: "adoptversion", label: "act.adoptversion.label.queue", reasonField: "why",
      send: function (view, el, cs) {
        const why = String(cs.value(el.dataset.f + "-why") || "").trim();
        return why ? { body: { notice: el.dataset.notice, why: why } } : { refuse: "screen.queue.fieldfirst" };
      },
      done: function (view, answer, cs) { cs.set("done", "adoptversion"); } },
    { op: "keepversion", label: "act.keepversion.label.queue",
      send: function (view, el) { return { body: { notice: el.dataset.notice } }; },
      done: function (view, answer, cs) { cs.set("done", "keepversion"); } },
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
        // `cs.w` answers HTML; the session log is text, so the entities it made are undone.
        const plain = function (t) { return String(t).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"); };
        const iso = new Date(cs.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
        const nonce = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
        // R81: `promote` takes the package fields only; the question's project is the file's own `project` line, as `project` writes one.
        const text = "---\nobject_type: inquiry\nquestion: " + JSON.stringify(q) + (el.dataset.project ? "\nproject: " + el.dataset.project : "") + "\ncurrent_state: open\ncreated: \"" + iso
          + "\"\nlast_updated: \"" + iso + "\"\n---\n\n## Session Log\n\n### Session " + iso
          + " | Formation | interactive\nTrigger: " + plain(cs.w("file.trigger.queue", { item: String(el.dataset.item).replace(/[\n\r]/g, " ") })) + "\nChanges: created.\n";
        return {
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
    // R42: "Join" an invitation, and an owner's Grant or Decline of a request to join; the item leaves with the re-read.
    { op: "projectjoin", label: "act.projectjoin.label.queue",
      send: function (view, el) { return el.dataset.project ? { query: { projectId: el.dataset.project } } : null; },
      done: function (view, answer, cs) { cs.set("done", "projectjoin"); } },
    { op: "projectrequestanswer", label: "act.projectrequestanswer.label.queue",
      send: function (view, el) {
        return el.dataset.project && el.dataset.who && el.dataset.answer ? { query: { projectId: el.dataset.project, handle: el.dataset.who, answer: el.dataset.answer } } : null;
      },
      done: function (view, answer, cs) { cs.set("done", "projectrequestanswer"); } },
    // R19: Not now, for every administrator (instance-setup R90).
    { op: "updatelater", label: "act.owed_updatelater.label.queue",
      send: function (view, el) { return el.dataset.version ? { body: { version: el.dataset.version } } : null; } },
    { op: "exploreapprove", label: "act.exploreapprove.label.queue",
      send: function (view, el) { return { body: { owner: el.dataset.owner, day: el.dataset.day } }; } },
  ],
});
