/* The group's home, every member's nerve centre (registry screen `home`; screens-daily R17, with R1, R8, R9, R10, R11, R14,
   R19, R21, R22, R23; N1036; DEC-218 arrangement C, DEC-219; DEC-198 (4), DEC-201 (7), DEC-227 (1)). In this order, each
   block only when it holds something (DEC-219 (3)): the strip; "Needs you"; "Needs the group"; each of the four areas at a
   glance; the projects; "Since you last looked"; and "What happened?". A new member's first visit draws no "Needs you" and
   no "Since you last looked"; a new group's home draws that it is ready, its first steps and "What happened?", nothing
   else. A read that fails is drawn failed in its block, never left out as if empty. Every function here is
   self-contained (interface-shell R21 (1)): it refers only to its parameters, the kit `cs`, `view.parts` and the
   language's own globals, so the shell can compose the page's script from its text. */
import { projectRows } from "./project-rows.mjs";
import { sourceItems } from "./source-items.mjs";
import { itemWords } from "./item-words.mjs";
import { startProject } from "./start-project.mjs";
import { participation } from "./participation.mjs";
import { homeReadings } from "./home-readings.mjs";
import { doors } from "./doors.mjs";
import { todos } from "./todos.mjs";
import { notices } from "./notices.mjs";
import { routed, ROUTED_REFUSALS } from "./routed.mjs";
import { OPS } from "../op-declarations/index.mjs";

// An act whose op the owners have not yet declared is not registered (screens-action's rule): `taskdecide` is `tasks`' alone.
const OWED = function (spec) { return Object.hasOwn(OPS, spec.op) ? [spec] : []; };

export const home = Object.freeze({
  id: "home",
  parts: { projectRows, sourceItems, itemWords, startProject, participation, homeReadings, doors, routed, todos, notices },

  // R17's reads, each through the op its provider serves: the queue (the strip, "Needs you", "Needs the group", each area's
  // to-dos), the projects (`projectlist`, each count by the rows, R8), the doors (`startfrom`, R9, R14), when the member
  // last looked (`lookedsince`, membership R143: read once per visit, so no act re-reads it), and, to an administrator,
  // the members (`memberlist`) and the group's running: `bootstrap`'s version, `profiles`, `grouplanguages` and the group
  // key's use (`aiuseovertime`). Once the member has written what happened, the matching work from `search` (R9).
  reads: function (view) {
    const ui = view.ui || {};
    const list = function (key) { return function (v) { return !v || !Array.isArray(v[key]) || v[key].length === 0; }; };
    const out = {
      group: { op: "groupidentity" },
      queue: { op: "queue", empty: list("items") },
      projects: { op: "projectlist", empty: list("projects") },
      doors: { op: "startfrom", empty: list("doors") },
      looked: { op: "lookedsince" },
      // R64: the figures the areas add: documents, cases, people followed and the clocks running.
      docs: { op: "browse", query: { kinds: "document", limit: "1" }, empty: function () { return false; } },
      published: { op: "publishedlist" },
      followed: { op: "peopledirectory", query: { show: "people", limit: "1" }, empty: function () { return false; } },
      clocks: { op: "clocksrunning" },
      // R65: the doors to Held captures and the Inbox.
      held: view.parts.doors().reads().held,
      inbox: view.parts.doors().reads().inbox,
    };
    // R17 (B21): the photos she captured and has not vouched for, each place a to-do of hers, are rows of the `held` read above (C14, P2.3).
    if (view.me && view.me.member && !(view.me.administer === true || (Array.isArray(view.me.capabilities) && view.me.capabilities.indexOf("create_projects") >= 0))) {
      out.members = { op: "memberlist", empty: list("members") };
    }
    if (view.me && view.me.administer === true) {
      out.members = { op: "memberlist", empty: list("members") };
      out.boot = { op: "bootstrap" };
      out.places = { op: "profiles" };
      out.languages = { op: "grouplanguages" };
      out.aiuse = { op: "aiuseovertime", query: { owner: "group" } };
      // R64: the security level over the last 24 hours, to an administrator only.
      const to = Math.floor(Date.now() / 3600000) * 3600000;
      out.security = { op: "securitymap", query: { from: new Date(to - 86400000).toISOString(), to: new Date(to).toISOString() } };
    }
    // R42: a member who may not start projects reads the ways into one: the findable projects and her own requests.
    const caps = view.me && Array.isArray(view.me.capabilities) ? view.me.capabilities : [];
    if (view.me && view.me.member && !(view.me.administer === true || caps.indexOf("create_projects") >= 0)) {
      out.directory = { op: "projectdirectory", empty: list("projects") };
      out.requests = { op: "projectrequests", empty: list("requests") };
    }
    return out;
  },

  render: function (cs, view) {
    const CLASS_KIND = { OBLIGATION: "todo", FINDING: "noticed", CONDITION: "status" };
    const ui = view.ui || {};
    const me = view.me || {};
    const admin = me.administer === true;
    // R42: "What happened?" and "Start a project" are for a member who holds `create projects` (every administrator does).
    const starts = admin || (Array.isArray(me.capabilities) && me.capabilities.indexOf("create_projects") >= 0);
    const data = view.data;
    const ok = function (r) { return r && r.state === "ok" ? r.value : null; };
    const failed = function (r) { return !!r && r.state === "failed"; };
    const src = view.parts.sourceItems();
    const iw = view.parts.itemWords();

    // R23: the heading is the group's name, or "Your group" while none is set, never the slug.
    const gv = ok(data.group);
    const named = gv && typeof gv.display_name === "string" && gv.display_name.trim() ? gv.display_name : null;
    const description = gv && typeof gv.description === "string" && gv.description.trim() ? gv.description : null;
    const heading = cs.state("group", function () {
      return '<div class="mk-titlerow">' + cs.title(named || cs.w("shell.group.unnamed"), { thing: "group" }) + "</div>"
        + (description ? '<p class="mk-sub">' + cs.esc(description) + "</p>" : "");
    });

    // The queue's items, each the member's or the group's (R17): "Needs you" holds those assigned to the member.
    const q = ok(data.queue);
    const items = q && Array.isArray(q.items) ? q.items : [];
    const mine = function (it) { const a = it && it.assignee; return !!a && a !== "unassigned" && (a === me.member || a === me.handle); };
    // R29, C74: a project the member is invited to is hers to join, as the participants of the project (or `projectlist`, N1118) answer her place;
    // the queue holds the same invitation as an item, and it is drawn once: as the project's row, not again among the items.
    const pv0 = ok(data.projects);
    const place = view.parts.participation(cs, view, pv0 && Array.isArray(pv0.projects) ? pv0.projects : []);
    const invitedAll = pv0 && Array.isArray(pv0.projects) ? pv0.projects.filter(function (p) { return p && place[String(p.id)] === "invited"; }) : [];
    const invitedIds = {};
    invitedAll.forEach(function (p) { invitedIds[String(p.id)] = true; });
    const dup = function (it) { return !!it && it.kind === "project-invitation" && !!it.subject && invitedIds[String(it.subject.id)] === true; };
    const own = items.filter(function (it) { return !dup(it); });
    const forMe = own.filter(mine);
    const forGroup = own.filter(function (it) { return !mine(it); });
    // C96: each Join says which project it joins, so two invitations are told apart (the accessible name; the row beside it names her).
    const joinOf = function (html, name) {
      return html ? html.replace("<button", '<button aria-label="' + cs.esc(cs.w("act.projectjoin.label.home") + " " + name) + '"') : html;
    };

    // One item's row: its kind mark, its words (the update's and the source notices' keyed, R19, R22), the way to act on it,
    // its due date, and, on "Needs the group", whose move it is.
    // An item's options (R3) among Home's registered acts: resolving a task, and adopting or keeping a newer version (its
    // reason asked in place); any other way to act is "Open", its subject's screen.
    const HOME_ACTS = { taskresolve: "taskresolve", adoptversion: "adoptversion", versionadopt: "adoptversion", keepversion: "keepversion", versionkeep: "keepversion",
      projectjoin: "projectjoin", projectrequestanswer: "projectrequestanswer", filingapprove: "filingapprove" };
    let seq = 0;
    const actsOf = function (it) {
      const ops = [];
      const add = function (op) { const r = HOME_ACTS[op]; if (r && ops.indexOf(r) < 0) ops.push(r); };
      (Array.isArray(it.options) ? it.options : []).forEach(function (o) { add(o && (o.id || o.op)); });
      const d = it.disposition || {};
      if (d.available && d.op) add(d.op);
      (Array.isArray(d.acts) ? d.acts : []).forEach(add);
      if (d.instead) add(d.instead);
      return ops.map(function (op) {
        const data = { item: String(it.id || ""), notice: d.notice ? String(d.notice) : "", notices: view.parts.notices().of(it), subject: it.subject && it.subject.id ? String(it.subject.id) : "",
          project: it.subject && it.subject.id ? String(it.subject.id) : "", who: it.subject && it.subject.requester ? String(it.subject.requester) : (it.fills && it.fills.who ? String(it.fills.who) : "") };
        // R42: an owner answers a request to join with Grant or Decline.
        if (op === "projectrequestanswer") {
          const opt = (Array.isArray(it.options) ? it.options : []).filter(function (o) { return o && (o.id || o.op) === op; })[0];
          const answers = opt && Array.isArray(opt.answers) && opt.answers.length ? opt.answers
            : [{ answer: "grant", label: "screen.home.request.grant" }, { answer: "decline", label: "screen.home.request.decline" }];
          // R104: a place to add a word, read by the act's `send` through `cs.value`.
          // one place for each request, by the project and the requester, so a word written for one is never sent with another
          const f = ("ha-" + data.project + "-" + data.who).replace(/[^A-Za-z0-9_-]/g, "_");
          const buttons = answers.map(function (a) {
            return cs.act(op, { label: "screen.home.request." + (String(a.answer) === "decline" ? "decline" : "grant"), data: Object.assign({ answer: String(a.answer), f: f }, data) });
          }).join("");
          return buttons ? cs.field(f + "-comment", "screen.plan.judge.note", { max: 280 }) + buttons : "";
        }
        if (op === "projectjoin") return joinOf(cs.act(op, { label: "act." + op + ".label.home", data: data }), String(it.subject && typeof it.subject.name === "string" && it.subject.name.trim() ? it.subject.name : data.project));
        if (op !== "adoptversion") return cs.act(op, { label: "act." + op + ".label.home", data: data });
        const f = "ha-" + (seq++);
        const button = cs.act(op, { label: "act." + op + ".label.home", data: Object.assign({ f: f }, data) });
        return button ? '<details class="mk-details"><summary>' + cs.w("act." + op + ".label.home") + "</summary>"
          + cs.field(f + "-why", "screen.home.why", {}) + button + "</details>" : "";
      }).join("");
    };
    const detailOf = function (it) { return it.detail && typeof it.detail === "object" ? it.detail : {}; };
    const itemRow = function (it, group) {
      const mark = cs.mark("kind", CLASS_KIND[it.class] || "status");
      if (it.sources) {
        const g = src.draw(cs, it, null);
        return cs.row(mark, g.list + '<span class="meta">' + g.detail + "</span>", "", "");
      }
      let words, open;
      if (it.kind === "update-ready") {
        const d = detailOf(it);
        const security = (d.security !== undefined ? d.security : it.security) === true;
        words = cs.w("home.update.ready", { version: String(d.version || it.version || ""), security: security ? cs.w("home.update.security") : "" });
        open = '<a class="cs-btn" data-tone="quiet" data-nav href="/app/updates">' + cs.w("queue.update.see") + "</a>";
      } else {
        // R75: the decisions the record routes to a member: the authority form, an endorsement, an owner vote, an expertise.
        const rt = view.parts.routed().draw(cs, it, { screen: "home", id: "hr-" + (seq++), ref: iw.subject(cs, it) });
        // R28, R31: the subject by its title, the act by its label; a reply owed and not recorded, never "overdue".
        const wd = iw.words(cs, it);
        words = rt ? rt.summary + '<span class="meta">' + rt.detail + "</span>" : wd.summary + (wd.detail ? '<span class="meta">' + wd.detail + "</span>" : "");
        open = rt ? rt.acts : actsOf(it);
        if (!open) {
          const to = iw.open(it);
          // C74: Open opens the item's subject; a subject that opens nothing draws no Open (never a link to the queue).
          open = to ? '<a class="cs-btn" data-tone="quiet" data-nav href="' + to + '">' + cs.w("screen.home.open") + "</a>" : "";
        }
      }
      let whose = "";
      if (group) {
        const a = it.assignee && it.assignee !== "unassigned" ? String(it.assignee) : "";
        whose = '<span class="muted">' + (it.assignee_role === "admin" ? cs.w("screen.home.move.admin")
          : a ? cs.w("screen.home.move.member", { who: a }) : cs.w("screen.home.move.anyone")) + "</span> ";
      }
      return cs.row(mark, words + '<span class="meta">' + whose + open + "</span>", it.due ? (iw.ours(cs, it) || cs.due(String(it.due), "")) : "", "");
    };
    const block = function (key, list, group) {
      return cs.sec(key, cs.sheet(src.fold(list).map(function (it) { return itemRow(it, group); }).join("")));
    };

    // R40, R23, R11 (DEC-219 (3)): a new team, no project yet and its founder alone in it: that it is ready, its first steps
    // numbered and in order ("Name your team" first while it has no name, the primary button), and "What happened?", nothing else.
    // The founder counts once, as `members` counts the roster (screens-settings R51; R51 here): her row from `memberlist` when it
    // lists one, else one more when the team is claimed.
    const members = ok(data.members);
    const roster = members && Array.isArray(members.members) ? members.members : [];
    const boot0 = ok(data.boot);
    const founderRow = roster.filter(function (m) { return m && (m.member_id === "admin" || m.founder === true); })[0];
    const founderIs = boot0 && typeof boot0.claimed === "boolean" ? boot0.claimed || !!founderRow : !!founderRow;
    const listed = roster.filter(function (m) { return m && m.member_id !== "admin" && m.founder !== true; });
    const rosterAll = founderIs ? [{ member_id: "admin", handle: founderRow ? founderRow.handle : null, role: "admin", status: "active", founder: true }].concat(listed) : listed;
    const active = members ? rosterAll.filter(function (m) { return m.status === "active"; }).length : null;
    const fresh = admin && data.projects && data.projects.state === "empty" && !(active !== null && active > 1);
    const button = function (href, label, tone) {
      return '<a class="cs-btn" data-tone="' + tone + '" data-nav href="' + href + '">' + cs.w(label) + "</a>";
    };
    const steps = [];
    if (gv && !named) steps.push({ text: "", act: button("/app/group", "home.first.name", "primary"), now: true });
    steps.push({ text: "screen.home.first.invite", act: button("/app/members", "screen.home.invite", steps.length ? "quiet" : "primary"), now: !steps.length });
    steps.push({ text: "screen.home.first.identity", act: button("/app/group-identity", "screen.home.saywho", "quiet") });
    steps.push({ text: "screen.home.first.project" });
    const first = cs.sec("home.ready.title", cs.path(steps));

    // R9, R14, R23, R40 (DEC-198 (4), DEC-227 (1)): "What happened?": each door `startfrom` answers is a button that starts
    // directly: pressing it sends `startfrom` for it and opens its offer in place (its scripts, each started by `cs.wizard`).
    // The sixth door, "Help for my own situation", opens `elsewhere` like the others open theirs and sends nothing. Only a
    // member who may start projects is drawn the doors and "Start a project" (R42).
    const dv = ok(data.doors);
    const scripts = {};
    (dv && Array.isArray(dv.scripts) ? dv.scripts : []).forEach(function (s) { if (s && s.id) scripts[String(s.id)] = s; });
    const all = dv && Array.isArray(dv.doors) ? dv.doors.filter(function (x) { return x && x.door; }) : [];
    const away = all.filter(function (x) { return x.door === "elsewhere" || x.opens === "elsewhere"; }).slice(0, 1);
    const five = all.filter(function (x) { return away.indexOf(x) < 0 && Array.isArray(x.scripts) && x.scripts.length; });
    // R30, R40: "Start a project" opens its form on press: what it is about, who can find it.
    const start = starts ? view.parts.startProject().form(cs, "home", "act.promote.label.home", cs.act("promote", { label: "project.start.go", tone: "primary", here: "home" })) : "";
    const opened = typeof ui.door === "string" ? ui.door : "";
    const doorCard = function (x) {
      const k = String(x.door);
      return '<div class="mk-door" data-door="' + cs.esc(k) + '"' + (opened === k ? ' data-open="true"' : "") + ">"
        + cs.act("startfrom", { label: "door.front." + k + ".name", data: { door: k } }) + "<br><span>" + cs.w("door.front." + k + ".hint") + "</span>"
        + (opened === k ? '<span class="mk-acts">' + x.scripts.map(function (id) {
          const s = scripts[String(id)] || { id: id, name: id };
          return cs.act("startfrom", { label: "screen.home.script", fills: { name: String(s.name || s.id) }, data: { script: String(s.id), version: String(s.version === undefined ? "" : s.version) } });
        }).join("") + "</span>" : "") + "</div>";
    };
    const awayCard = away.map(function () {
      return '<a class="mk-door" data-door="elsewhere" data-nav href="/app/elsewhere"><b>' + cs.w("door.front.elsewhere.name") + "</b><br><span>" + cs.w("door.front.elsewhere.hint") + "</span></a>";
    }).join("");
    const front = failed(data.doors)
      ? '<section class="mk-welcome" data-front="doors"><h2 class="mk-h2">' + cs.w("door.front.head") + "</h2>" + cs.state("doors", null) + "</section>"
      : (starts && five.length) || away.length
        // K5148 (R42): "What happened?" is asked only over the five doors; a lone "Help for my own situation" has no heading over it.
        ? '<section class="mk-welcome" data-front="doors">' + (starts && five.length ? '<h2 class="mk-h2" tabindex="0">' + cs.w("door.front.head") + "</h2>" : "")
          + (starts ? '<p class="mk-sub">' + cs.w("door.front.intro") + "</p>" : "") + '<div class="mk-doors">' + (starts ? five.map(doorCard).join("") : "") + awayCard + "</div>"
          + (start ? '<p class="mk-note">' + cs.w("door.front.blank") + "</p>" + start : "") + "</section>"
        : start ? '<section class="mk-welcome" data-front="start">' + start + "</section>" : "";

    if (fresh) return heading + first + front;

    // R17: when the member last looked; `null` is a first look (a new member's first visit, R11).
    const lk = data.looked;
    const since = ok(lk) && typeof ok(lk).since === "string" ? ok(lk).since : null;
    const firstVisit = lk && lk.state === "ok" && !since;

    // The strip (`cs.strip`, at most four readings), each one of the blocks below; none at zero.
    // R29: a project the member is invited to is hers to join, as the participants of the project (or `projectlist`, N1118) answer her place.
    // R42: a member who may not start projects and is in none reads the ways into one.
    const inNone = (data.projects && data.projects.state === "empty") || (pv0 && Array.isArray(pv0.projects) && !pv0.projects.some(function (p) { return p && (place[String(p.id)] === "joined" || place[String(p.id)] === "leaving"); }));
    const invited = !firstVisit ? invitedAll : [];
    // R17 (B21): a to-do to vouch for the photos she captured is hers, as an item assigned to her is.
    const vouching = view.parts.todos().vouch(cs, view, "home");
    // C70: while her captures are being read the count is not whole, so neither the strip nor "Needs you" is drawn from it yet: once, whole.
    const waiting = view.parts.todos().loading(view);
    // C70: the shell's number adds the vouch rows (the band) to the queue's own; once her captures are read this reports how many are drawn.
    if (!waiting) cs.band(vouching.n);
    const mineCount = forMe.length + invited.length + vouching.n;
    const readings = [];
    if (!firstVisit && mineCount) readings.push({ n: mineCount, label: "screen.home.strip.you", screen: "queue" });
    if (forGroup.length) readings.push({ n: forGroup.length, label: "screen.home.strip.group", screen: "queue" });
    // R50 (3): a team's own passed dates are a reading of their own, opening the queue.
    const ours = forMe.concat(forGroup).filter(function (it) { return it && it.kind === "action-clock-overdue.ours"; }).length;
    if (!firstVisit && ours) readings.push({ n: "", label: { key: ours === 1 ? "home.strip.ours_passed.one" : "home.strip.ours_passed.other", fills: { n: String(ours) } }, says: "home.strip.ours_passed.opens", screen: "queue" });
    const strip = readings.length && !waiting ? cs.strip(readings) : "";

    const queueFailed = failed(data.queue) ? cs.sec("screen.home.needsyou", cs.state("queue", null)) : "";
    const joinRows = invited.map(function (p) {
      const id = String(p.id);
      return cs.row(cs.mark("kind", "todo"), cs.ref("project", id, p.name || id, []) + '<span class="meta">'
        + joinOf(cs.act("projectjoin", { label: "act.projectjoin.label.home", data: { project: id } }), String(p.name || id)) + "</span>", "", "");
    }).join("");
    const needsYou = !firstVisit && waiting ? cs.sec("screen.home.needsyou", cs.state({ state: "loading" }, null))
      : !firstVisit && mineCount
      ? cs.sec("screen.home.needsyou", cs.sheet(joinRows + vouching.rows + src.fold(forMe).map(function (it) { return itemRow(it, false); }).join(""))) : "";
    const needsGroup = forGroup.length ? block("screen.home.needsgroup", forGroup, true) : "";

    // R42: "Getting into a project", for a member who may not start projects and is in none: the projects she was invited to,
    // the findable ones, her open requests, and who to ask; with none of the three, who to ask alone.
    const joinPart = (function () {
      if (starts || !inNone) return "";
      const admins = rosterAll.filter(function (x) { return x && x.status === "active" && x.role === "admin"; }).map(function (x) {
        return x.handle ? cs.esc(String(x.handle)) : cs.w("member.founder.unnamed");
      }).join(", ");
      const ask = { html: admins };
      const dir = ok(data.directory);
      const rq = ok(data.requests);
      const mineOpen = rq && Array.isArray(rq.requests) ? rq.requests.filter(function (r) { return r && r.state === "open"; }) : [];
      const askedIds = {};
      mineOpen.forEach(function (r) { askedIds[String(r.project)] = true; });
      const findable = dir && Array.isArray(dir.projects) ? dir.projects.filter(function (p) { return p && !askedIds[String(p.id)] && !(p.request && p.request.state === "open"); }) : [];
      const invitedRows = (pv0 && Array.isArray(pv0.projects) ? pv0.projects : []).filter(function (p) { return p && place[String(p.id)] === "invited"; }).map(function (p) {
        const id = String(p.id);
        return cs.row(cs.mark("kind", "todo"), cs.w("queue.project-invitation.summary.unnamed", { project: { html: cs.ref("project", id, p.name || id, []) } })
          + '<span class="meta">' + cs.w("queue.project-invitation.detail") + "</span>" + '<span class="meta">' + joinOf(cs.act("projectjoin", { label: "act.projectjoin.label.home", data: { project: id } }), String(p.name || id)) + "</span>", "", "");
      });
      const findRows = findable.map(function (p) {
        const id = String(p.id);
        return cs.row("", cs.ref("project", id, p.name || id, []) + '<span class="meta">' + cs.w("projects.findable.meta") + "</span>"
          + '<span class="meta">' + cs.act("projectrequest", { label: "act.projectrequest.label.home", data: { project: id } }) + "</span>", "", "");
      });
      const askRows = mineOpen.map(function (r) {
        const id = String(r.project);
        return cs.row("", cs.ref("project", id, r.name || id, []) + '<span class="meta">' + cs.w("projects.request.asked", { date: { html: cs.date(String(r.asked || "")) } }) + "</span>"
          + '<span class="meta">' + cs.act("projectrequestwithdraw", { label: "act.projectrequestwithdraw.label.home", data: { project: id } }) + "</span>", "", "");
      });
      const failedRead = [data.directory, data.requests].filter(failed).map(function (r) { return cs.state(r, null); }).join("");
      const rows = invitedRows.concat(findRows, askRows);
      const body = '<p class="mk-sub">' + cs.w("screen.home.join.lead") + "</p>"
        + (rows.length ? cs.sheet(rows.join("")) + '<p class="mk-note">' + cs.w("screen.home.join.nocreate", { admins: ask }) + "</p>"
          : failedRead ? "" : '<p class="mk-note">' + cs.w("screen.home.join.none", { admins: ask }) + "</p>") + failedRead;
      return cs.sec("screen.home.join.heading", body, { help: "screen.home.join.says" });
    })();

    // Each of the four areas at a glance (DEC-219 (2)): what needs the member in it, its readings, a line of what changed,
    // the area's name its reference. A reading at zero is not drawn, and an area with nothing to show is left out.
    const rd = function (n, one, many) {
      if (n === null || n === undefined || n === 0 || n === "" || n === "0") return "";
      return '<span class="mk-rd"><b>' + cs.esc(String(n)) + "</b> " + (n === 1 && one ? cs.w(one) : cs.w(many)) + "</span>";
    };
    const area = function (k, href, need, rds, lines, fails) {
      const readingsHtml = rds.join("");
      if (!need && !readingsHtml && !lines.length && !fails.length) return "";
      return '<div class="mk-ablock" data-area="' + k + '"><div class="h"><a class="cs-ref" data-nav href="' + href + '"><b>' + cs.w("screen.home.area." + k) + "</b></a>"
        + (need ? '<span class="need">' + (need === 1 ? cs.w("screen.home.area.need.one") : cs.w("screen.home.area.need.many", { n: String(need) })) + "</span>" : "") + "</div>"
        + (readingsHtml ? '<div class="rd">' + readingsHtml + "</div>" : "")
        + (lines.length ? '<ul class="mk-list mk-small">' + lines.map(function (l) { return "<li>" + l + "</li>"; }).join("") + "</ul>" : "")
        + fails.map(function (r) { return cs.state(r, null); }).join("") + "</div>";
    };
    const pv = ok(data.projects);
    const plist = pv && Array.isArray(pv.projects) ? pv.projects : [];
    // C14 (P2.2): the total of the questions is the rows' own counts; while one is not known (a project seen only at existence) no total is drawn.
    const counted = plist.length && plist.every(function (p) { return typeof p.question_count === "number" && isFinite(p.question_count); })
      ? plist.reduce(function (a, p) { return a + p.question_count; }, 0) : null;
    const latest = plist.filter(function (p) { return p.lastChange; }).sort(function (a, b) { return String(b.lastChange).localeCompare(String(a.lastChange)); })[0];
    const ACTION = /^(action|request|milestone|step|plan|filing|escalation|litigation)/;
    const actionMine = forMe.filter(function (it) { return ACTION.test(String(it.kind || "")); }).length;
    const actionGroup = forGroup.filter(function (it) { return ACTION.test(String(it.kind || "")); }).length;
    const more = view.parts.homeReadings(cs, view, { ok: ok, failed: failed, rd: rd, projects: plist, admin: admin });
    // R51 (K4107): `dash-project` is a subject screen, so the door names a project: the newest changed, else the first listed; with none, `projects`.
    const dashOf = latest || plist[0];
    const investigation = area("investigation", dashOf ? "/app/dash-project/" + encodeURIComponent(String(dashOf.id)) : "/app/projects",
      forMe.filter(function (it) { return !ACTION.test(String(it.kind || "")) && it.kind !== "update-ready"; }).length + invited.length,
      [rd(plist.length, "screen.home.rd.project", "screen.home.rd.projects"), rd(counted, "screen.home.rd.question", "screen.home.rd.questions")].concat(more.investigation.rds),
      (latest ? [cs.w("screen.home.line.lastchange", { project: { html: cs.ref("project", String(latest.id), String(latest.name || latest.id), []) }, date: { html: cs.date(String(latest.lastChange)) } })] : []).concat(more.investigation.lines),
      (failed(data.projects) ? [data.projects] : []).concat(more.investigation.fails));
    const action = area("action", "/app/dash-action", actionMine,
      [rd(actionMine, "screen.home.rd.ours", "screen.home.rd.ours"), rd(actionGroup, "screen.home.rd.group", "screen.home.rd.group")].concat(more.action.rds), more.action.lines, more.action.fails);
    const people = admin ? area("members", "/app/members", 0,
      [rd(active, "screen.home.rd.member", "screen.home.rd.members"),
        rd(rosterAll.filter(function (x) { return x && x.status === "active" && x.role === "admin"; }).length, "screen.home.rd.admin", "screen.home.rd.admins"),
        rd(rosterAll.filter(function (x) { return x && x.status === "invited"; }).length, "screen.home.rd.invited", "screen.home.rd.invited")],
      more.members.lines, failed(data.members) ? [data.members] : []) : "";
    let adminArea = "";
    if (admin) {
      const boot = ok(data.boot);
      const places = ok(data.places);
      const langs = ok(data.languages);
      const use = ok(data.aiuse);
      const lines = [];
      const placeNames = places && Array.isArray(places.profiles) ? places.profiles.map(function (p) { return String(p && (p.name || "")); }).filter(Boolean) : [];
      if (placeNames.length) lines.push(cs.w("screen.home.line.places", { places: placeNames.join(", ") }));
      const tags = langs && Array.isArray(langs.languages) ? langs.languages : [];
      const names = tags.map(function (t) {
        try { return new Intl.DisplayNames([String(t)], { type: "language" }).of(String(t)) || ""; } catch (e) { return ""; }
      }).filter(Boolean);
      if (names.length) lines.push(cs.w("screen.home.line.languages", { languages: names.join(", ") }));
      const month = use && !use.unreadable && Array.isArray(use.periods) ? use.periods.filter(function (p) { return p && p.unit === "usd" && p.period === "month"; })[0] : null;
      if (month && Number(month.used) > 0) {
        const dollars = function (n) { return "$" + Number(n).toFixed(2); };
        lines.push(month.limit !== null && month.limit !== undefined
          ? cs.w("screen.home.line.ailimit", { used: dollars(month.used), limit: dollars(month.limit) })
          : cs.w("screen.home.line.aiused", { used: dollars(month.used) }));
      }
      const version = boot && typeof boot.version === "string" && boot.version !== "0.0.0" ? boot.version : null;
      adminArea = area("administration", "/app/settings", items.filter(function (it) { return it.kind === "update-ready"; }).length,
        [rd(version, "screen.home.rd.release", "screen.home.rd.release")].concat(more.administration.rds), lines,
        more.administration.fails.concat([data.boot, data.places, data.languages].filter(failed).concat(use && use.unreadable ? [{ state: "failed", refusal: null }] : failed(data.aiuse) ? [data.aiuse] : [])));
    }
    const areasHtml = investigation + action + people + adminArea;
    const areas = areasHtml ? cs.sec("screen.home.areas", '<div class="mk-ablocks">' + areasHtml + "</div>") : "";

    // The projects (R10), drawn by the rows part Projects shares, with each one's count, stage, members and activity.
    const projects = data.projects && data.projects.state !== "empty"
      ? cs.sec("screen.home.projects", cs.state("projects", view.parts.projectRows(cs, view, "screen.home", true))) : "";

    // "Since you last looked": the members' acts since then as the areas' reads answer them (each project's last change).
    const changed = since ? plist.filter(function (p) { return p.lastChange && String(p.lastChange) > since; }) : [];
    const recent = failed(lk) ? cs.sec("screen.home.since", cs.state("looked", null))
      : changed.length ? cs.sec("screen.home.since", cs.sheet(changed.map(function (p) {
        return cs.row("", cs.ref("project", String(p.id), p.name || String(p.id), []), '<span class="muted">' + cs.w("screen.home.since.changed", { date: cs.date(String(p.lastChange)) }) + "</span>", "");
      }).join(""))) : "";

    // R65: the doors to Held captures and the Inbox, each only when it holds something.
    return strip + heading + view.parts.routed().shown(cs, ui) + queueFailed + needsYou + needsGroup + view.parts.doors().draw(cs, view, "home") + joinPart + areas + projects + recent + front;
  },

  acts: [
    // R17: an item's own acts on "Needs you" and "Needs the group" (R3's), re-reading the queue only, never `lookedsince`.
    { op: "taskresolve", label: "act.taskresolve.label.home", rereads: ["queue"],
      send: function (view, el) { return { body: { id: el.dataset.item } }; } },
    // Adopting asks why (reevaluation R15); the member's words are the act's reason (interface-shell R11, K3002).
    { op: "adoptversion", label: "act.adoptversion.label.home", reasonField: "why", rereads: ["queue"],
      send: function (view, el, cs) {
        const why = String(cs.value(el.dataset.f + "-why") || "").trim();
        return why ? view.parts.notices().send(cs, "adoptversion", el, { why: why }) : { refuse: "screen.home.fieldfirst" };
      } },
    { op: "keepversion", label: "act.keepversion.label.home", rereads: ["queue"],
      send: function (view, el, cs) { return view.parts.notices().send(cs, "keepversion", el, {}); } },
    // R75: the decisions the record routes to a member, and passing a task on; each item leaves with the next read of the queue.
    { op: "taskforward", label: "act.taskforward.label.home", rereads: ["queue"],
      send: function (view, el, cs) {
        const to = String(cs.value(el.dataset.f + "-to") || "").trim().replace(/^@/, "");
        // C75: never oneself.
        if (to && view.me && (to === view.me.handle || to === view.me.member)) return { refuse: "refusal.ALREADY_THEIRS" };
        return to ? { body: { id: el.dataset.item, to: to } } : { refuse: "screen.home.fieldfirst" };
      } },
    { op: "adminendorse", label: "act.adminendorse.label.home", rereads: ["queue"],
      send: function (view, el) { return el.dataset.memberId ? { body: { memberId: el.dataset.memberId } } : null; },
      // R82: the invitation the answer carries is kept and shown once (as Members does).
      done: function (view, answer, cs) { view.parts.routed().keep(view, answer, cs); } },
    { op: "projectowneradd", label: "act.projectowneradd.label.home", rereads: ["queue"],
      send: function (view, el) { return el.dataset.projectId && el.dataset.handle ? { query: { projectId: el.dataset.projectId, handle: el.dataset.handle } } : null; } },
    { op: "expertiseconfirm", label: "act.expertiseconfirm.label.home", rereads: ["queue"],
      send: function (view, el) { return el.dataset.memberId && el.dataset.label ? { body: { memberId: el.dataset.memberId, label: el.dataset.label } } : null; } },
    // The authority form: the member's decision with its basis, the basis being the act's reason (`taskdecide` is Reasoned).
    ...OWED({ op: "taskdecide", label: "act.owed_taskdecide.label.home", reasonField: "basis", refusals: ROUTED_REFUSALS, rereads: ["queue"],
      send: function (view, el, cs) { return view.parts.routed().decide(cs, el); } }),
    // R17 (B21): vouching for the photos she captured (re-reading her captures and the doors), and approving a letter drafted for the group.
    { op: "release", label: "act.release.label.home", reasonField: "acknowledgment", rereads: ["held"],
      send: function (view, el, cs) { return view.parts.todos().release(view, el, cs); } },
    { op: "filingapprove", label: "act.filingapprove.label.home", rereads: ["queue"],
      send: function (view, el, cs) { return view.parts.todos().approve(view, el, cs); } },
    // R29: "Join", a project the member is invited to; the projects are read again, her place in it now joined.
    { op: "projectjoin", label: "act.projectjoin.label.home", rereads: ["projects"],
      send: function (view, el) { return el.dataset.project ? { query: { projectId: el.dataset.project } } : null; } },
    // R9, R40: a door is a button that starts directly: pressing it sends `startfrom` for it and opens its offer in place; a
    // script button starts that script in the wizard runner and sends nothing.
    {
      op: "startfrom",
      label: "act.startfrom.label.home",
      rereads: ["doors"],
      send: function (view, el, cs) {
        if (el.dataset.script) {
          const v = Number(el.dataset.version);
          cs.wizard(el.dataset.script, el.dataset.version === "" || isNaN(v) ? el.dataset.version : v);
          return null;
        }
        if (!el.dataset.door) return null;
        // R81: `startfrom` takes only `message` and `parts`; which door is open is the page's memory, and the press asks the doors again.
        cs.set("door", el.dataset.door);
        return { query: {} };
      },
    },
    // R42: ask to join a findable project, and withdraw the request; the ways in are read again.
    { op: "projectrequest", label: "act.projectrequest.label.home", rereads: ["directory", "requests"],
      send: function (view, el) { return el.dataset.project ? { query: { projectId: el.dataset.project } } : null; } },
    { op: "projectrequestwithdraw", label: "act.projectrequestwithdraw.label.home", rereads: ["directory", "requests"],
      send: function (view, el) { return el.dataset.project ? { query: { projectId: el.dataset.project } } : null; } },
    // R42: an owner answers a request to join, Grant or Decline; the queue is read again.
    { op: "projectrequestanswer", label: "act.projectrequestanswer.label.home", rereads: ["queue"],
      send: function (view, el, cs) {
        if (!(el.dataset.project && el.dataset.who && el.dataset.answer)) return null;
        // R104: the member's word, when she wrote one, goes with the answer as `comment`.
        const comment = String(cs.value(el.dataset.f + "-comment") || "").trim();
        return { query: Object.assign({ projectId: el.dataset.project, handle: el.dataset.who, answer: el.dataset.answer }, comment ? { comment: comment } : {}) };
      } },
    {
      // R1, R23, R25, R30: a new project, its title the member's and written as its `title`, its visibility the member's
      // choice (hidden unless made findable), its owner the member (the door stamps the owner, control-plane R73).
      op: "promote",
      label: "act.promote.label.home",
      rereads: ["projects"],
      send: function (view, el, cs) {
        const made = view.parts.startProject().body(cs, view, "home", "file.trigger.home");
        return made.body ? { body: made.body } : { refuse: made.refuse || "screen.home.title.needed" };
      },
      // R1: opening `project` on success.
      done: function (view, answer, cs) {
        const id = answer && (answer.bundleId || (answer.result && answer.result.bundleId));
        if (id) cs.go("project", id);
      },
    },
  ],
});
