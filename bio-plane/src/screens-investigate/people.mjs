/* screens-investigate R12, R13: the People directory (People; registry screen `people`, its 3 acts; DEC-203). The people
 * and organizations the record follows, never the group's own members (a link to Settings › Members); its rows, counts
 * and order are `people`' `peopledirectory` (its R37), searched by name or office and filtered four ways. "Search" is
 * the registry's `search` act: it reads the directory again with what the member typed and chose. */

import { PARTS } from "./parts.mjs";

const S = "screen.people.";

/** R12: the directory, as the member last searched it (`view.ui.filter`); nothing typed reads the whole of it. */
function reads(view) {
  const S = "screen.people.";
  const f = view.ui.filter || {};
  const query = {};
  for (const k of ["q", "show", "office", "namedIn", "since"]) if (f[k]) query[k] = String(f[k]);
  return { directory: { op: "peopledirectory", query, empty: (v) => !v || !Array.isArray(v.rows) || v.rows.length === 0 } };
}

/** R12, R13: the search and its filters, the counts line, those in the member's projects first, then the rest. */
function render(cs, view) {
  const S = "screen.people.";
  const f = view.ui.filter || {};
  const d = view.data.directory;
  const out = [cs.title()];
  out.push(`<p class="mk-sub">${cs.w(S + "notmembers")} <a href="/app/members" data-nav>${cs.w(S + "members")}</a></p>`);
  const add = cs.field("people-add-name", S + "add.name", {})
    + cs.choice("people-add-kind", S + "add.kind", [["person", S + "add.kind.person"], ["institution", S + "add.kind.organization"]], {})
    + cs.field("people-add-note", S + "add.note", { area: true, rec: true, help: S + "add.note.help" })
    + cs.act("entitycreate", { label: "act.entitycreate.label.people" });
  /* R13: each row: the kind's mark, the name opening `person`, who they are today, the counts, Explore connections */
  const kindMark = (k) => {
    const org = k !== "person";
    return `<span class="cs-kind" data-kind="${org ? "organisation" : "person"}" tabindex="0" data-level="1" data-tip="${cs.esc(cs.w(org ? S + "kind.organization.means" : S + "kind.person.means"))}">${cs.w(org ? S + "kind.organization" : S + "kind.person")}</span>`;
  };
  /* who they are today: the record's own data as plain text (posts, a member's note), else the screen's words */
  const todayText = (r) => {
    const t = r.today || {};
    if (r.kind === "person") {
      const posts = (t.posts || []).map((p) => [p.title || (p.office && p.office.label) || "", p.body && p.body.label ? p.body.label : ""].filter(Boolean).join(", "));
      return posts.length ? posts.join("; ") : null;
    }
    /* never a record's machine note (K3177, R15): setup's seeding declares as a machine; `today.machine` says so, never the note's text */
    const note = typeof t.note === "string" ? t.note.trim() : "";
    return note && t.machine !== true ? note : null;
  };
  const todayHtml = (r) => {
    const text = todayText(r);
    if (text !== null) return cs.esc(text);
    const t = r.today || {};
    if (r.kind !== "person" && t.machine === true) return cs.w(S + "today.seeded");
    const kinds = ["office", "body", "institution", "movement", "fund", "program"];
    return r.kind !== "person" && kinds.includes(t.kind || r.kind) ? cs.w(S + "today.kind." + (t.kind || r.kind)) : cs.w(S + "today.none");
  };
  /* R22: no count is drawn at zero: only what the row is named in */
  const counts = (r) => {
    const parts = [];
    if (r.documents) parts.push(cs.w(S + (r.documents === 1 ? "count.document" : "count.documents"), { n: String(r.documents) }));
    if (r.questions) parts.push(cs.w(S + (r.questions === 1 ? "count.question" : "count.questions"), { n: String(r.questions) }));
    if (r.projects) parts.push(cs.w(S + (r.projects === 1 ? "count.project" : "count.projects"), { n: String(r.projects) }));
    return (parts.length ? cs.w(S + "counts", { list: parts.join(", ") }) : "") + (r.newest_added ? (parts.length ? " · " : "") + cs.w(S + "newest", { date: cs.date(r.newest_added) }) : "");
  };
  const line = (r) => cs.row(kindMark(r.kind),
    `<b>${cs.ref("person", r.entity, r.name || r.entity, [todayText(r)])}</b> · ${todayHtml(r)}<span class="meta">${counts(r)}</span>`,
    cs.act("explore", { label: "act.explore.label.people", data: { entity: r.entity } }));
  const typed = !!(f.q || f.office || (f.namedIn && f.namedIn !== "any") || f.since || (f.show && f.show !== "both"));
  /* R25: nothing followed and nothing searched: the designed empty state alone, no search, filters or counts */
  if (d && d.state === "empty" && !typed) {
    out.push(cs.row("", `<b>${cs.w(S + "none")}</b> ${cs.w(S + "none.how")}`, "") + `<p><a href="/app/capture" data-nav>${cs.w(S + "none.capture")}</a></p>`);
    out.push(cs.sec(S + "add.head", add));
    return out.join("");
  }
  /* the four filters (R12): show; holding an office in (a body the rows name); named in; named recently */
  const bodies = [];
  if (d && d.state === "ok") for (const r of d.value.rows || []) for (const p of (r.today && r.today.posts) || [])
    if (p.body && p.body.entity && !bodies.some((b) => b.value === p.body.entity)) bodies.push({ value: p.body.entity, text: p.body.label || p.body.entity });
  if (f.office && !bodies.some((b) => b.value === f.office)) bodies.push({ value: f.office, text: f.officeText || f.office });
  out.push(`<div class="mk-search">${cs.field("people-q", S + "q", { value: f.q || "" })}${cs.act("search", { label: "act.search.label.people", tone: "primary" })}</div>`
    + `<div class="mk-acts">`
    + cs.choice("people-show", S + "show", [["both", S + "show.both"], ["people", S + "show.people"], ["organisations", S + "show.organizations"]], { value: f.show || "both" })
    + cs.choice("people-office", S + "office", [{ value: "", text: cs.w(S + "office.any") }].concat(bodies), { value: f.office || "" })
    + cs.choice("people-named", S + "named", [["any", S + "named.any"], ["mine", S + "named.mine"]], { value: f.namedIn || "any" })
    + cs.choice("people-since", S + "since", [["", S + "since.any"], ["30", S + "since.30"], ["90", S + "since.90"], ["365", S + "since.365"]], { value: f.since || "" })
    + "</div>");
  if (d && d.state === "empty") {
    /* R13's second empty state: a search that finds no one */
    out.push(cs.row("", `<b>${cs.w(S + "nomatch", { q: f.q || "" })}</b> ${cs.w(S + "nomatch.how")}`, "")
      + `<p><a href="/app/finder" data-nav>${cs.w(S + "nomatch.find")}</a></p>`);
    out.push(cs.sec(S + "add.head", add));
    return out.join("");
  }
  out.push(cs.state("directory", view, (v) => {
    const rows = v.rows || [];
    const mine = rows.filter((r) => r.mine), rest = rows.filter((r) => !r.mine);
    return `<p class="mk-note">${cs.w(S + (v.in_your_projects ? "countline" : "countline.none"), { following: String(v.following || rows.length), mine: String(v.in_your_projects || 0) })}</p>`
      + (mine.length ? cs.sec(S + "yours", cs.sheet(mine.map(line).join(""))) : "")
      + (rest.length ? cs.sec(S + "others", cs.sheet(rest.map(line).join(""))) : "")
      + (v.truncated ? `<p class="mk-small">${cs.w(S + "more", { n: String(rows.length) })}</p>` : "");
  }));
  out.push(cs.sec(S + "add.head", add));
  return out.join("");
}

const acts = [
  /* R12: the search reads the directory again, as the member typed and chose; nothing is written */
  { op: "search", label: "act.search.label.people", rereads: [],
    send(view, el, cs) {
      const office = String(cs.value("people-office") || "");
      const sel = cs.value("people-since");
      const filter = { q: String(cs.value("people-q") || "").trim(), show: String(cs.value("people-show") || "both"),
        office, namedIn: String(cs.value("people-named") || "any"), since: sel ? String(sel) : "" };
      view.ui.filter = filter;
      const query = {};
      for (const k of ["q", "show", "office", "namedIn", "since"]) if (filter[k]) query[k] = filter[k];
      view.ui.searching = true;
      cs.call("peopledirectory", { query }).then((a) => {
        const r = a && a.result !== undefined ? a.result : a;
        const refused = !a || a.ok === false || (r && (r.ok === false || typeof r.refused === "string"));
        view.data.directory = refused
          ? { state: "failed", value: null, refusal: { code: String((r && (r.code || r.reason)) || (a && (a.code || a.reason)) || ""), words: cs.esc((r && r.translation) || (a && a.translation) || (r && (r.code || r.reason)) || cs.w("shell.noanswer")) } }
          : (!r || !Array.isArray(r.rows) || !r.rows.length ? { state: "empty", value: r, refusal: null } : { state: "ok", value: r, refusal: null });
        cs.set("searching", false);
      });
      return null;
    } },
  /* R13: Explore connections from this row (`explore` opens with it as the start) */
  { op: "explore", label: "act.explore.label.people",
    send(view, el, cs) { cs.go("explore", String(el.dataset.entity || "")); return null; } },
  /* R13: Add someone the record follows, with the member's note (its own words serve as the reason, DEC-88) */
  { op: "entitycreate", label: "act.entitycreate.label.people", reasonField: "note",
    send(view, el, cs) {
      const label = String(cs.value("people-add-name") || "").trim();
      const note = String(cs.value("people-add-note") || "").trim();
      if (!label || !note) return { refuse: "screen.people.add.empty" };
      return { body: { kind: String(cs.value("people-add-kind") || "person"), label, note } };
    },
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      if (r && r.entity_id) cs.go("person", r.entity_id);
    } },
];

const PEOPLE_KEYS = [
  "screen.people.notmembers", "screen.people.members", "screen.people.q", "screen.people.show", "screen.people.show.both",
  "screen.people.show.people", "screen.people.show.organizations", "screen.people.office", "screen.people.office.any", "screen.people.named",
  "screen.people.named.any", "screen.people.named.mine", "screen.people.since", "screen.people.since.any", "screen.people.since.30",
  "screen.people.since.90", "screen.people.since.365", "screen.people.countline.none", "screen.people.countline", "screen.people.yours",
  "screen.people.yours.holds", "screen.people.others", "screen.people.others.holds", "screen.people.kind.person", "screen.people.kind.person.means",
  "screen.people.kind.organization", "screen.people.kind.organization.means", "screen.people.today.none", "screen.people.today.seeded",
  "screen.people.today.kind.office", "screen.people.today.kind.body", "screen.people.today.kind.institution", "screen.people.today.kind.movement",
  "screen.people.today.kind.fund", "screen.people.today.kind.program", "screen.people.counts", "screen.people.count.document",
  "screen.people.count.documents", "screen.people.count.question", "screen.people.count.questions", "screen.people.count.project",
  "screen.people.count.projects", "screen.people.newest", "screen.people.more", "screen.people.none", "screen.people.none.how",
  "screen.people.none.capture", "screen.people.nomatch", "screen.people.nomatch.how", "screen.people.nomatch.find", "screen.people.add.head",
  "screen.people.add.name", "screen.people.add.kind", "screen.people.add.kind.person", "screen.people.add.kind.organization",
  "screen.people.add.note", "screen.people.add.note.help", "screen.people.add.empty",
];

const words = ["screen.people.name", "screen.people.purpose", "act.search.label.people", "act.search.does",
  "act.explore.label.people", "act.explore.does", "act.entitycreate.label.people", "act.entitycreate.does",
  "state.empty", "state.loading", "state.failed", ...PEOPLE_KEYS];

export const PEOPLE_SCREEN = Object.freeze({ id: "people", reads, render, acts, words, parts: PARTS });
