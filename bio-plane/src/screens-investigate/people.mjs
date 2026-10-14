/* screens-investigate R12, R13: the People directory (People; registry screen `people`, its 3 acts; DEC-203). The people
 * and organisations the record follows, never the group's own members (a link to Settings › Members); its rows, counts
 * and order are `people`' `peopledirectory` (its R37), searched by name or office and filtered four ways. "Search" is
 * the registry's `search` act: it reads the directory again with what the member typed and chose. */

import { row } from "./row.mjs";
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
  out.push(`<p class="cs-sub">${cs.w(S + "notmembers")} <a href="/app/members" data-nav>${cs.w(S + "members")}</a></p>`);
  /* the four filters (R12): show; holding an office in (a body the rows name); named in; named recently */
  const bodies = [];
  if (d && d.state === "ok") for (const r of d.value.rows || []) for (const p of (r.today && r.today.posts) || [])
    if (p.body && p.body.entity && !bodies.some((b) => b.value === p.body.entity)) bodies.push({ value: p.body.entity, text: p.body.label || p.body.entity });
  if (f.office && !bodies.some((b) => b.value === f.office)) bodies.push({ value: f.office, text: f.officeText || f.office });
  out.push(`<div class="mk-search">${cs.field("people-q", S + "q", { value: f.q || "" })}${cs.act("search", { label: "act.search.label.people", tone: "primary" })}</div>`
    + `<div class="cs-filters">`
    + cs.choice("people-show", S + "show", [["both", S + "show.both"], ["people", S + "show.people"], ["organisations", S + "show.organisations"]], { value: f.show || "both" })
    + cs.choice("people-office", S + "office", [{ value: "", text: cs.w(S + "office.any") }].concat(bodies), { value: f.office || "" })
    + cs.choice("people-named", S + "named", [["any", S + "named.any"], ["mine", S + "named.mine"]], { value: f.namedIn || "any" })
    + cs.choice("people-since", S + "since", [["", S + "since.any"], ["30", S + "since.30"], ["90", S + "since.90"], ["365", S + "since.365"]], { value: f.since || "" })
    + "</div>");
  const add = cs.field("people-add-name", S + "add.name", {})
    + cs.choice("people-add-kind", S + "add.kind", [["person", S + "add.kind.person"], ["institution", S + "add.kind.organisation"]], {})
    + cs.field("people-add-note", S + "add.note", { area: true, rec: true, help: S + "add.note.help" })
    + cs.act("entitycreate", { label: "act.entitycreate.label.people" });
  /* R13: each row: the kind's mark, the name opening `person`, who they are today, the counts, Explore connections */
  const kindMark = (k) => {
    const org = k !== "person";
    return `<span class="cs-kind" data-kind="${org ? "organisation" : "person"}" tabindex="0" data-level="1" data-tip="${cs.esc(cs.w(org ? S + "kind.organisation.means" : S + "kind.person.means"))}">${cs.w(org ? S + "kind.organisation" : S + "kind.person")}</span>`;
  };
  const today = (r) => {
    const t = r.today || {};
    if (r.kind === "person") {
      const posts = (t.posts || []).map((p) => [p.title || (p.office && p.office.label) || "", p.body && p.body.label ? p.body.label : ""].filter(Boolean).join(", "));
      return posts.length ? posts.join("; ") : cs.w(S + "today.none");
    }
    return t.note || t.kind || cs.w(S + "today.none");
  };
  const counts = (r) => (r.questions || r.projects
    ? cs.w(S + "counts", { documents: String(r.documents || 0), questions: String(r.questions || 0), projects: String(r.projects || 0) })
    : cs.w(S + "counts.docsonly", { documents: String(r.documents || 0) }))
    + (r.newest_added ? " · " + cs.w(S + "newest", { date: cs.date(r.newest_added) }) : "");
  const line = (r) => cs.row(kindMark(r.kind),
    `<b>${cs.ref("person", r.entity, r.name || r.entity, [today(r)])}</b> · ${cs.esc(today(r))}<span class="meta">${counts(r)}</span>`,
    cs.act("explore", { label: "act.explore.label.people", data: { entity: r.entity } }));
  const typed = !!(f.q || f.office || (f.namedIn && f.namedIn !== "any") || f.since || (f.show && f.show !== "both"));
  if (d && d.state === "empty") {
    /* R13's two empty states: a record that follows no one yet, and a search that finds no one */
    if (typed) out.push(cs.row("", `<b>${cs.w(S + "nomatch", { q: f.q || "" })}</b> ${cs.w(S + "nomatch.how")}`, "")
      + `<p><a href="/app/finder" data-nav>${cs.w(S + "nomatch.find")}</a></p>`);
    else out.push(cs.row("", `<b>${cs.w(S + "none")}</b> ${cs.w(S + "none.how")}`, "") + `<p><a href="/app/capture" data-nav>${cs.w(S + "none.capture")}</a></p>`);
    out.push(cs.sec(S + "add.head", add));
    return out.join("");
  }
  out.push(cs.state("directory", view, (v) => {
    const rows = v.rows || [];
    const mine = rows.filter((r) => r.mine), rest = rows.filter((r) => !r.mine);
    return `<p class="cs-note">${cs.w(S + "countline", { following: String(v.following || 0), mine: String(v.in_your_projects || 0) })}</p>`
      + (mine.length ? cs.sec(S + "yours", cs.sheet(mine.map(line).join(""))) : "")
      + (rest.length ? cs.sec(S + "others", cs.sheet(rest.map(line).join(""))) : "")
      + (v.truncated ? `<p class="cs-meta">${cs.w(S + "more", { n: String(rows.length) })}</p>` : "");
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
        const refused = !a || a.ok === false || (r && r.ok === false);
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

export const PEOPLE_WORDS = [
  row(S + "notmembers", "The people and organisations your group's record follows: officials, staff, companies and public bodies. Your own group's members are not listed here; they are under"),
  row(S + "members", "Settings › Members"),
  row(S + "q", "Name or office"),
  row(S + "show", "Show"),
  row(S + "show.both", "People and organisations"),
  row(S + "show.people", "People"),
  row(S + "show.organisations", "Organisations"),
  row(S + "office", "Holding an office in"),
  row(S + "office.any", "Any body"),
  row(S + "named", "Named in"),
  row(S + "named.any", "Any project"),
  row(S + "named.mine", "Your projects"),
  row(S + "since", "Named recently"),
  row(S + "since.any", "At any time"),
  row(S + "since.30", "In the last 30 days"),
  row(S + "since.90", "In the last 90 days"),
  row(S + "since.365", "In the last year"),
  row(S + "countline", "The record follows {following} people and organisations; {mine} are named in your projects. Each row counts the documents, questions and projects that name them, among those you may see, and says when the newest of them was added to the record."),
  row(S + "yours", "In your projects"),
  row(S + "yours.holds", "Named in the projects you work on. Newest added first."),
  row(S + "others", "Everyone else the record follows"),
  row(S + "others.holds", "Followed by your group but not named in your projects. Newest added first."),
  row(S + "kind.person", "Person"),
  row(S + "kind.person.means", "a person the record follows: their page holds their positions, career and interests, each dated and cited"),
  row(S + "kind.organisation", "Organisation"),
  row(S + "kind.organisation.means", "an organisation or public body the record follows: its page holds what the record holds on it and who holds its offices"),
  row(S + "today.none", "no current office recorded"),
  row(S + "counts", "named in {documents} documents, {questions} questions and {projects} projects"),
  row(S + "counts.docsonly", "named in {documents} documents, in no question or project yet"),
  row(S + "newest", "newest added {date}"),
  row(S + "more", "The first {n} are shown. Search or filter to find the rest."),
  row(S + "none", "Your group's record follows no one yet."),
  row(S + "none.how", "A person or organisation comes in one of two ways: a member ties a name in a captured document to them, on the document under “People it names”, or adds them here with a note on who they are and why the group follows them."),
  row(S + "none.capture", "Capture a document"),
  row(S + "nomatch", "No one the record follows matches “{q}”."),
  row(S + "nomatch.how", "Someone appears here only once your group follows them. If a document names them, open it and tie the name to them under “People it names”; or add them here."),
  row(S + "nomatch.find", "Look for them in documents"),
  row(S + "add.head", "Add someone the record follows"),
  row(S + "add.name", "Their name"),
  row(S + "add.kind", "A person or an organisation"),
  row(S + "add.kind.person", "A person"),
  row(S + "add.kind.organisation", "An organisation"),
  row(S + "add.note", "Your note: who they are, and why the group follows them"),
  row(S + "add.note.help", "Facts about them are then added from documents, each cited."),
  row(S + "add.empty", "Give their name and your note on who they are."),
];

const words = ["screen.people.name", "screen.people.purpose", "act.search.label.people", "act.search.does",
  "act.explore.label.people", "act.explore.does", "act.entitycreate.label.people", "act.entitycreate.does",
  "state.empty", "state.loading", "state.failed", ...PEOPLE_WORDS];

export const PEOPLE_SCREEN = Object.freeze({ id: "people", reads, render, acts, words, parts: PARTS });
