/* screens-investigate R31: the team's themes (Projects › Themes; registry screen `theme`, its 4 acts; N1101; DEC-242 (S4),
 * DEC-323). State a lists every theme, newest first, searchable by words in its name or test, and declares one; state b is
 * one theme: what was placed in it, its hunches apart, and what was taken out with the reasons. A theme is never evidence
 * (connections R39 to R46): nothing here is drawn as a finding, a count only where `themeread` answers one, names handles
 * only, and a hunch is never drawn as a placement. The subject is the theme's id, or none for state a. */

import { PARTS } from "./parts.mjs";

function reads(view) {
  const id = String(view.subject || "");
  if (id) return { theme: { op: "themeread", query: { id }, subject: true } };
  const q = String((view.ui && view.ui.q) || "").trim();
  return { themes: { op: "themeread", query: q ? { q } : {}, empty: (v) => !v || !Array.isArray(v.themes) || !v.themes.length } };
}

function render(cs, view) {
  const S = "theme.";
  const P = view.parts;
  const id = String(view.subject || "");
  const me = view.me || {};
  const out = [cs.title()];
  out.push(`<p class="mk-note">${cs.w(S + "never.evidence")}</p>`);
  /* names are handles only; a date as the kit draws it */
  const handle = (h) => cs.esc(String(h || "").replace(/^member:/, ""));
  const day = (at) => cs.date(String(at || "").slice(0, 10), { year: true });
  /* a document or passage a placement names, a reference to it, by its title where a document answers one */
  const target = (t, kind) => {
    const isDoc = !/^CNT-/.test(String(t)) && kind !== "content" && kind !== "passage";
    let title = "";
    if (isDoc) {
      const q = P.later(cs, view, "t:" + t, "image", { query: { id: t } });
      title = q.state === "ok" && q.value && q.value["bundle.md"] ? String(P.front(q.value["bundle.md"]).title || "") : "";
    }
    return P.refOf(cs, t, title || P.plain(cs, "shell.card." + (isDoc ? "document" : "passage")), [], isDoc ? "document" : "passage");
  };
  if (!id) {
    /* state a: the search, the list, and declaring one */
    const q = String(view.ui.q || "");
    out.push(`<div class="mk-search">${cs.field("theme-q", S + "q.label", { value: q })}${cs.act("themeread", { label: "act.themeread.label.theme", tone: "primary" })}</div>`);
    const list = cs.state("themes", view, (v) => {
      const rows = Array.isArray(v.themes) ? v.themes : [];
      return cs.sec(S + "list.heading", cs.sheet(rows.map((t) => cs.row("",
        `<b>${cs.ref("theme", t.theme_id, t.name, [t.test])}</b> <span class="mk-small">${cs.w(S + "test.label")}: ${cs.esc(t.test)}</span>`
        + `<br><span class="mk-small">${cs.w(S + "declared", { who: handle(t.declared_by_handle), date: day(t.at) })}</span>`
        + (typeof t.placed === "number" ? ` <span class="mk-small">${cs.esc(String(t.placed))}</span>` : ""))).join("")));
    });
    out.push(list);
    out.push(cs.sec(S + "declare", cs.field("theme-name", S + "name.label", { help: S + "name.help" })
      + cs.field("theme-test", S + "test.label", { area: true, rec: true, help: S + "test.help" })
      + cs.act("themedeclare", { label: S + "declare.go", tone: "primary" })));
    return out.join("");
  }
  /* state b: one theme */
  out.push(cs.state("theme", view, (t) => {
    const mine = (placedBy) => !!placedBy && (placedBy === me.handle || me.administer === true);
    const members = Array.isArray(t.members) ? t.members : [];
    const hunches = Array.isArray(t.hunches) ? t.hunches : [];
    const ended = Array.isArray(t.withdrawn) ? t.withdrawn : [];
    const placedRow = (m) => cs.row("", `<b>${target(m.target, m.target_kind)}</b> <span class="mk-small">${cs.w(S + "placed.by", { who: handle(m.placed_by_handle), date: day(m.placed_at), note: m.note || "" })}</span>`
      + (m.proposed_by_handle ? `<br><span class="mk-small">${cs.mark("hunch")} ${cs.w(S + "hunch.mark")} · ${cs.w(S + "hunch.by", { who: handle(m.proposed_by_handle), date: day(m.proposed_at), note: m.proposal_note || "" })}</span>` : ""),
    mine(m.placed_by_handle) ? cs.act("themewithdraw", { label: S + "takeout", data: { target: m.target } }) : "");
    const hunchRow = (m) => cs.row(cs.mark("hunch"), `<b>${target(m.target, m.target_kind)}</b> <span class="mk-small">${cs.w(S + "hunch.by", { who: handle(m.proposed_by_handle), date: day(m.proposed_at), note: m.proposal_note || "" })}</span>`,
      cs.act("themeplace", { label: S + "confirm", data: { target: m.target } }) + cs.act("themewithdraw", { label: S + "reject", data: { target: m.target } }));
    const endedRow = (m) => cs.row("", `<b>${target(m.target, m.target_kind)}</b>`
      + `<br><span class="mk-small">${cs.w(m.state === "rejected" ? S + "out.rejected" : S + "out.withdrawn", { who: handle(m.ended_by_handle), date: day(m.ended_at), reason: m.reason || "" })}</span>`);
    return `<p class="mk-sub">${cs.w(S + "test.label")}: ${cs.esc(t.test)}</p><p class="mk-small">${cs.w(S + "declared", { who: handle(t.declared_by_handle), date: day(t.at) })}</p>`
      + (members.length ? cs.sec(S + "placed", cs.sheet(members.map(placedRow).join(""))) : "")
      + (hunches.length ? cs.sec(S + "hunches", `<p class="mk-note">${cs.w(S + "hunch.note")}</p>` + cs.sheet(hunches.map(hunchRow).join(""))) : "")
      + (ended.length ? cs.sec(S + "out", cs.sheet(ended.map(endedRow).join(""))) : "");
  }));
  return out.join("");
}

const acts = [
  /* "Read the themes", with the words the member typed: the list is read again; nothing is written */
  { op: "themeread", label: "act.themeread.label.theme", rereads: [],
    send(view, el, cs) {
      const q = String(cs.value("theme-q") || "").trim();
      view.ui.q = q;
      cs.call("themeread", { query: q ? { q } : {} }).then((a) => {
        const r = a && a.result !== undefined ? a.result : a;
        const refused = !a || a.ok === false || (r && (r.ok === false || typeof r.refused === "string"));
        view.data.themes = refused
          ? { state: "failed", value: null, refusal: { code: String((r && (r.code || r.reason)) || ""), words: (r && r.translation) || (a && a.translation) ? cs.esc((r && r.translation) || (a && a.translation)) : cs.w("shell.noanswer") } }
          : (!r || !Array.isArray(r.themes) || !r.themes.length ? { state: "empty", value: r, refusal: null } : { state: "ok", value: r, refusal: null });
        cs.set("searched", q);
      });
      return null;
    } },
  { op: "themedeclare", label: "theme.declare.go",
    send(view, el, cs) {
      const name = String(cs.value("theme-name") || "").trim(), test = String(cs.value("theme-test") || "").trim();
      return { body: { name, test } };
    },
    done(view, answer, cs) { const r = answer && answer.result !== undefined ? answer.result : answer; if (r && r.theme_id) cs.go("theme", r.theme_id); } },
  /* "It belongs": a hunch confirmed by a member's own act */
  { op: "themeplace", label: "theme.confirm",
    send(view, el) { const t = String((el && el.dataset && el.dataset.target) || ""); return t ? { body: { theme: String(view.subject || ""), target: t } } : null; } },
  /* "Take it out" (the placer or an administrator) and "Reject" (any member), each with a reason */
  { op: "themewithdraw", label: "act.themewithdraw.label.theme",
    send(view, el) { const t = String((el && el.dataset && el.dataset.target) || ""); return t ? { body: { theme: String(view.subject || ""), target: t } } : null; } },
];

const THEME_KEYS = [
  "theme.never.evidence", "theme.list.heading", "theme.q.label", "theme.declare", "theme.name.label", "theme.name.help", "theme.test.label",
  "theme.test.help", "theme.declare.go", "theme.declared", "theme.placed", "theme.placed.by", "theme.hunches", "theme.hunch.note", "theme.hunch.by",
  "theme.hunch.mark", "theme.out", "theme.out.withdrawn", "theme.out.rejected", "theme.confirm", "theme.takeout", "theme.reject",
  "shell.card.document", "shell.card.passage",
];

const words = ["screen.theme.name", "screen.theme.purpose",
  ...["themeread", "themeplace", "themewithdraw", "themedeclare"].flatMap((op) => ["act." + op + ".label.theme", "act." + op + ".does"]),
  "mark.hunch.means",
  "state.empty", "state.loading", "state.failed", "shell.noanswer", ...THEME_KEYS];

export const THEME_SCREEN = Object.freeze({ id: "theme", ABSENT_CODES: Object.freeze(["THEME_NOT_FOUND"]), reads, render, acts, words, parts: PARTS });
