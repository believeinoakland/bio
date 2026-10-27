/* screens-inquiry R14: the project's AI account (Projects › <project> › AI for this project; registry screen `projectai`,
 * its 8 acts; DEC-188 (1), (7); N721).
 *
 * What pays for the assistant's work in the project (`credentials`' `projectaccountstate`), the notice a member reads
 * before the project's key first pays for her (`projectkeynotice`), whether the project keeps its material away from AI
 * (`projectaikeepawaystate`), and, for the project's account, what it pays for, its limits, its use summed and its
 * changes (`accountuses`, `ailimits`, `aiusage`, `accounthistory` with `owner: "project:<id>"`), drawn by the AI account
 * panel `screens-settings` R9 holds: one render over an `owner`, handed to this screen as `view.parts` (interface-shell
 * R21, K3002), so the panel is never copied. Every act is an owner's of the project: the key sent in the request's body
 * only and never drawn again; the acting owner's own sign-in offered only while the project has no other participant
 * and her sign-in is connected (`credentials` R54); keep-away switched on only with a reason, saying first what it does.
 * Self-contained functions (interface-shell R21 (1)). */

import * as settingsPanel from "../screens-settings/panel.mjs";
import { SCREEN_WORDS as SETTINGS_ROWS } from "../screens-settings/index.mjs";
import { later, unavailable } from "./common.mjs";

const { aiPanel, aiPanelSend } = settingsPanel;

/** R14: the reads, each as its owner documents it. */
function reads(view) {
  const id = String(view.subject || "");
  const owner = "project:" + id;
  /* K3379 (D29): the founder (`whoami`'s member `admin`) sees every discoverable project whole, and project-roster
     answers her `projectdirectory` with a refusal inside a 200 (N1129): it is not asked for her, nor before `whoami` */
  const me = view.me && view.me.member;
  const directory = me && me !== "admin" ? { directory: { op: "projectdirectory", query: {} } } : {};
  return {
    project: { op: "image", query: { id }, subject: true, empty: (v) => !v || typeof v !== "object" || !v["bundle.md"] },
    participants: { op: "projectparticipants", query: { projectId: id } },
    state: { op: "projectaccountstate", query: { project: id } },
    notice: { op: "projectkeynotice", query: { project: id } },
    keepaway: { op: "projectaikeepawaystate", query: { project: id } },
    signin: { op: "subscriptionsignin", body: { step: "state" } },
    /* K3419: `accountuses`, `ailimits`, `aiusage` and `accounthistory` are an owner's; the screen reads them (`later`)
       only once the roster shows her an owner who has joined, so a participant who is not an owner never makes them */
    /* R37: the projects she may see but has not joined (project-roster's directory) */
    ...directory,
  };
}

/** The path's project step: the project's title as read (interface-shell R8). */
function place(view) {
  const d = view.data && view.data.project;
  const text = d && d.state === "ok" && d.value && d.value["bundle.md"];
  const id = String(view.subject || "");
  const m = typeof text === "string" ? /^title:\s*(.*)$/m.exec(text.split(/\n---\s*\n/)[0] || "") : null;
  let title = m ? m[1].trim() : "";
  try { if (title.startsWith("\"")) title = JSON.parse(title); } catch { /* the raw value is drawn */ }
  /* R39: never the record's id as a title; a project read without one is undetermined (the shell's step) */
  return { project: { id, title: title || "" } };
}

/** R14: the project's account and its notice, the panel over its account, and keeping its material away from AI. */
function render(cs, view) {
  const id = String(view.subject || "");
  if (!id) return "";
  const ui = view.ui;
  const d = view.data || {};
  const W = cs.w, E = cs.esc, S = "screen.projectai.";
  const owner = "project:" + id;
  /* R39: the title read from the record (or, for a project she has not joined, the directory's name), never its id */
  const listed = d.directory && d.directory.state === "ok" && Array.isArray(d.directory.value.projects)
    ? d.directory.value.projects.find((p) => p && p.id === id) : null;
  const titleOf = () => {
    const text = d.project && d.project.state === "ok" && d.project.value ? d.project.value["bundle.md"] : null;
    const m = typeof text === "string" ? /^title:\s*(.*)$/m.exec(text.split(/\n---\s*\n/)[0] || "") : null;
    let t = m ? m[1].trim() : "";
    try { if (t.startsWith("\"")) t = JSON.parse(t); } catch { /* raw */ }
    return t || (listed && (listed.name || listed.title)) || "";
  };
  const plain = (k, f) => String(W(k, f)).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
  /* R40: the viewer's row is found by member (the founder's row is marked `founder: true`), else by handle */
  const me = view.me && view.me.handle;
  const isMe = (x) => !!x && ((view.me && view.me.member === "admin" && x.founder === true) || (!!x.handle && x.handle === me));
  const parts = d.participants && d.participants.state === "ok" && Array.isArray(d.participants.value.participants)
    ? d.participants.value.participants.filter((x) => x && x.state !== "removed") : null;
  const mine = parts ? parts.find(isMe) : null;
  const isOwner = !!(mine && mine.owner && mine.state === "joined");
  const sole = !!(parts && parts.length === 1 && mine);
  const connected = d.signin && d.signin.state === "ok" && d.signin.value && d.signin.value.connected === true;
  const out = [];
  const title = titleOf();
  out.push(cs.title(title || plain("state.undetermined"), { thing: "project" }));
  /* R37: a member who has not joined the project sees the not-joined state, and Join where she may; never "What pays"
     failed with the plane's "no project answers to that id" */
  const NOT_JOINED = ["PROJECT_SEEN_NOT_A_PARTICIPANT", "PROJECT_NOT_FOUND", "NOT_A_PARTICIPANT"];
  const refusedHer = ["project", "participants", "state", "notice", "keepaway"].some((k) => d[k] && d[k].state === "failed"
    && d[k].refusal && NOT_JOINED.includes(d[k].refusal.code));
  const absent = parts && !parts.some((x) => isMe(x) && x.state === "joined");
  /* R60: a hidden project she is not in is unavailable (state b), with no form; a findable one, or her invitation, keeps Join */
  const invited = !!(parts && parts.some((x) => isMe(x) && x.state === "invited"));
  if ((refusedHer || absent) && !listed && !invited) return out.join("") + view.parts.unavailable(cs);
  if (listed || refusedHer || absent) {
    out.push(`<p data-state="notjoined">${W("projectai.notjoined", { project: title || plain("state.undetermined") })}</p>`
      + cs.act("projectjoin", { label: "act.projectjoin.label.projectai", data: { project: id }, tone: "primary" }));
    return out.join("");
  }
  out.push(`<p class="mk-sub">${W(S + "purpose")}</p>`);

  /* the project's account: what it is, who set it and when; an owner's acts on it */
  out.push(cs.sec(S + "account.head", cs.state("state", view, (a0) => {
    /* a joined participant who is no owner is told only `{on, serving}` (ai-accounts R10): a sign-in never serves a project
       of two or more members, so what serves her is the project's key; nothing serving reads as no account of its own */
    const a = a0.held === undefined && !isOwner ? { ...a0, held: a0.serving === true, kind: a0.serving === true ? "key" : null } : a0;
    const say = !a.held ? S + "account.none"
      : a.on === false ? S + "account.off"
      : a.serving === false ? S + "account.suspended"
      : a.kind === "signin" ? S + "account.signin" : S + "account.key";
    let h = `<p data-account="${E(!a.held ? "none" : a.on === false ? "off" : a.serving === false ? "suspended" : String(a.kind || ""))}">${W(say)}</p>`;
    if (a.held && (a.by || a.set_at))
      h += `<p class="mk-small">${W(S + "account.since", { who: String(a.by || "").replace(/^member:/, ""), date: { html: a.set_at ? cs.date(String(a.set_at), { year: true }) : "" } })}</p>`;
    if (!isOwner) return h + `<p class="mk-small">${W(S + "owners")}</p>`;
    const gen = ui.keyGen || 0;
    const set = cs.act("projectkeyset", { label: "act.projectkeyset.label.projectai", data: { project: id } });
    if (set) h += cs.field("pa-key" + gen, a.held ? S + "key.replace" : S + "key.field", { type: "password", autocomplete: "off", help: S + "key.never" }) + set;
    if (sole && connected) h += `<p class="mk-small">${W(S + "signin.help")}</p>`
      + cs.act("projectsigninset", { label: "act.projectsigninset.label.projectai", data: { project: id } });
    if (a.held) h += cs.act("projectaccountswitch", { label: a.on === false ? S + "switch.on" : S + "switch.off", data: { on: a.on === false ? "on" : "off" } })
      + cs.act("projectaccountremove", { label: "act.projectaccountremove.label.projectai", data: { project: id } });
    return h;
  })));

  /* the notice a member who has joined reads before the project's key first pays for her acts (credentials R58), as
     what it tells her leaves the group */
  const n = mine && mine.state === "joined" && d.notice && d.notice.state === "ok" ? d.notice.value : null;
  if (n && n.due === true && n.text)
    out.push(cs.sec(S + "notice.head", `<p class="rec" data-notice="projectkey">${E(String(n.text))}</p>`
      + `<p class="mk-small">${W("mark.outward.means")}</p>`
      + cs.act("projectkeynoticeseen", { label: "act.projectkeynoticeseen.label.projectai", data: { project: id }, tone: "primary" })));
  else if (n && n.due === false) out.push(`<p class="mk-small" data-notice="seen">${W(S + "notice.seen")}</p>`);

  /* what the project's account pays for, its limits, its use summed and its changes: screens-settings R9's panel */
  if (isOwner && view.parts && view.parts.aiPanel) {
    const tok = String(ui.paSeq || 0);
    const owned = (op) => {
      const r = view.parts.later(cs, ui, "pa:" + op, op, { owner }, tok);
      return r.state === "ok" && (!r.value || typeof r.value !== "object") ? { state: "empty", value: null, refusal: null } : r;
    };
    const seen = Object.assign({}, view, { data: Object.assign({}, d, { uses: owned("accountuses"), limits: owned("ailimits"),
      usage: owned("aiusage"), history: owned("accounthistory") }) });
    out.push(view.parts.aiPanel(cs, seen, { owner, explore: false, perMember: false }));
  }

  /* keeping the project's material away from AI: what it is now, and an owner's act, on only with a reason */
  out.push(cs.sec(S + "keepaway.head", cs.state("keepaway", view, (k) => {
    let h = k.on
      ? `<p data-keepaway="on">${W(S + "keepaway.on", { who: String(k.set_by || "").replace(/^member:/, ""), date: { html: k.set_at ? cs.date(String(k.set_at), { year: true }) : "" }, reason: String(k.reason || "") })}</p>`
      : `<p data-keepaway="off">${W(S + "keepaway.off")}</p>`;
    if (!isOwner) return h;
    const on = cs.act("projectaikeepaway", { label: k.on ? S + "keepaway.turnoff" : "act.projectaikeepaway.label.projectai", data: { on: k.on ? "off" : "on" } });
    if (on) h += `<p>${W("act.projectaikeepaway.does")}</p>` + cs.field("pa-why", S + "keepaway.reason", { area: true, rec: true, max: 2000 }) + on;
    return h;
  }, { empty: S + "keepaway.unread" })));
  return out.join("");
}

/** R14's eight acts, each with its owner's documented arguments. `ailimitset`'s and `accountusesset`'s request is the
 *  panel's own (`aiPanelSend`), over the project's account. */
const acts = [
  /* the key in the request's body only; the field drawn anew, empty, once it is held (never drawn again) */
  { op: "projectkeyset", label: "act.projectkeyset.label.projectai", rereads: ["state", "notice"],
    send(view, el, cs) {
      const key = String(cs.value("pa-key" + ((view.ui && view.ui.keyGen) || 0)) || "").trim();
      return key ? { body: { project: String(view.subject || ""), key } } : { refuse: "screen.projectai.key.nokey" };
    },
    done(view, answer, cs) { cs.set("keyGen", ((view.ui && view.ui.keyGen) || 0) + 1); cs.set("paSeq", ((view.ui && view.ui.paSeq) || 0) + 1); } },
  { op: "projectsigninset", label: "act.projectsigninset.label.projectai", rereads: ["state"],
    send(view) { return { body: { project: String(view.subject || "") } }; }, done(view, answer, cs) { cs.set("paSeq", ((view.ui && view.ui.paSeq) || 0) + 1); },
    /* its owner's translations are these words, filled with the project's name (credentials R54); held here too */
    refusals: { PROJECT_NOT_SOLE_MEMBER: (r, cs) => (r && r.translation ? cs.esc(r.translation) : cs.w("ai.refused.notsole", { project: String((r && r.project) || "") })),
                SIGNIN_NOT_CONNECTED: "ai.refused.signinnotconnected" } },
  { op: "projectaccountswitch", label: "act.projectaccountswitch.label.projectai", rereads: ["state"],
    send(view, el) { return { body: { project: String(view.subject || ""), on: el.dataset.on === "on" } }; },
    done(view, answer, cs) { cs.set("paSeq", ((view.ui && view.ui.paSeq) || 0) + 1); } },
  { op: "projectaccountremove", label: "act.projectaccountremove.label.projectai", rereads: ["state", "notice"],
    send(view) { return { body: { project: String(view.subject || "") } }; }, done(view, answer, cs) { cs.set("paSeq", ((view.ui && view.ui.paSeq) || 0) + 1); } },
  { op: "projectkeynoticeseen", label: "act.projectkeynoticeseen.label.projectai", rereads: ["notice"],
    send(view) { return { body: { project: String(view.subject || "") } }; } },
  { op: "accountusesset", label: "act.accountusesset.label.projectai", rereads: [],
    send(view, el, cs) { return view.parts.aiPanelSend("accountusesset", "project:" + String(view.subject || ""), el, cs); },
    done(view, answer, cs) { cs.set("paSeq", ((view.ui && view.ui.paSeq) || 0) + 1); },
    refusals: { SWITCH_VALUE_INVALID: "ai.refused.switchvalue" } },
  { op: "ailimitset", label: "act.ailimitset.label.projectai", rereads: [],
    send(view, el, cs) { return view.parts.aiPanelSend("ailimitset", "project:" + String(view.subject || ""), el, cs); },
    done(view, answer, cs) { cs.set("paSeq", ((view.ui && view.ui.paSeq) || 0) + 1); },
    refusals: { AI_LIMIT_INVALID: (r, cs) => cs.w("ai.refused.limitinvalid", { field: String(cs.w("ai.limitfield." + (["owner", "scope", "unit", "period", "amount", "inclusive", "use", "count"].indexOf(r && r.field) >= 0 ? r.field : "amount"))).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e])) }),
                LIMIT_UNIT_UNAVAILABLE: "ai.refused.unitunavailable" } },
  /* on only with a reason of 1 to 2,000 characters in the owner's own words, its field the act's reason (interface-shell
     R11's `reasonField`; credentials R57, R51's reason rule); off with the reason for turning it off */
  /* R37: she joins the project from here (project-roster's join, by the project's id) */
  { op: "projectjoin", label: "act.projectjoin.label.projectai", rereads: null,
    send(view) { return { query: { projectId: String(view.subject || "") } }; } },
  { op: "projectaikeepaway", label: "act.projectaikeepaway.label.projectai", rereads: ["keepaway"], reasonField: "reason", done(view, answer, cs) { cs.set("paSeq", ((view.ui && view.ui.paSeq) || 0) + 1); },
    send(view, el, cs) {
      const reason = String(cs.value("pa-why") || "").trim();
      if (reason.length < 1 || reason.length > 2000) return { refuse: "screen.projectai.keepaway.noreason" };
      return { body: { project: String(view.subject || ""), on: el.dataset.on !== "off", reason } };
    } },
];

/** The keys the panel draws over the project's account: `screens-settings`' `PANEL_KEYS` (its R9; K3369), and the
 *  `words.json` keys this module draws in its refusals and the panel's uses. */
const USES = ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "explore", "suggestions"];
const PANEL = [...(Array.isArray(settingsPanel.PANEL_KEYS) ? settingsPanel.PANEL_KEYS
  /* until screens-settings answers PANEL_KEYS (K3369), the keys of its own panel rows, read as keys only */
  : SETTINGS_ROWS.map((r) => (Array.isArray(r) ? r[0] : r)).filter((k) => typeof k === "string" && k.startsWith("screen.panel."))),
  ...USES.map((u) => `ai.use.${u}.name`), "ai.explore.no", "ai.explore.ask", "ai.explore.yes", "ai.refused.limitinvalid", "ai.refused.unitunavailable",
  "ai.refused.switchvalue", ...["owner", "scope", "unit", "period", "amount", "inclusive", "use", "count"].map((f) => `ai.limitfield.${f}`)];

/** The keys the screen may draw (R44: keys only). */
const words = Object.freeze([
  "screen.projectai.name",
  ...["projectkeyset", "projectsigninset", "projectaccountswitch", "projectaccountremove", "projectkeynoticeseen",
    "accountusesset", "ailimitset", "projectaikeepaway", "projectjoin"].map((op) => "act." + op + ".label.projectai"),
  "act.projectaikeepaway.does", "ai.refused.notsole", "ai.refused.signinnotconnected", "mark.outward.means",
  "state.undetermined", "projectai.notjoined", "shell.unavailable.notyours.title", "shell.unavailable.notyours.says",
  ...PANEL,
  ...["purpose", "account.head", "account.none", "account.key", "account.signin", "account.off", "account.suspended",
    "account.since", "owners", "key.field", "key.replace", "key.nokey", "key.never", "signin.help", "switch.on", "switch.off",
    "notice.head", "notice.seen", "keepaway.head", "keepaway.on", "keepaway.off", "keepaway.reason", "keepaway.noreason",
    "keepaway.turnoff", "keepaway.unread"].map((k) => "screen.projectai." + k),
]);

/** The project's AI account (interface-shell R21), with the panel's functions as its parts. */
export const PROJECTAI_SCREEN = Object.freeze({ id: "projectai", reads, place, render, acts, words,
  parts: Object.freeze({ aiPanel, aiPanelSend, later, unavailable }) });
