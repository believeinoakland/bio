/* Test screens for the shell's own tests: real registry ids, each act the registry's for its screen, drawn with every
   part of the kit (reads in their four states, acts of each weight, references, marks, dates, rows with picks and the
   hold strip, fields, the dock). Every function refers only to its parameters, as R21's contract asks. */
export const FIXTURE_WORDS = Object.freeze([
  ["screen.home.t.queue", "Waiting on you", false],
  ["screen.home.t.queue.holds", "What waits on you today.", false],
  ["screen.home.t.projects", "Projects", false],
  ["screen.home.t.projects.holds", "Each project you may see.", false],
  ["screen.home.t.empty", "No project yet", false],
  ["screen.home.t.title", "Title of the project", false],
  ["screen.held.t.col.name", "Capture", false],
  ["screen.held.t.col.when", "Captured", false],
  ["screen.document.t.passages", "Passages", false],
  ["screen.document.t.passages.holds", "The document's passages, as its reading made them.", false],
  ["screen.members.t.roster", "Members", false],
  ["screen.members.t.roster.holds", "Everyone in your group.", false],
  ["screen.assistant.t.panel", "What it does", false],
  ["screen.assistant.t.panel.holds", "It finds, reads and checks; it never concludes, signs or sends.", false],
].map((r) => Object.freeze(r)));

const own = (prefix) => FIXTURE_WORDS.filter((r) => r[0].startsWith(prefix));

export const HOME = {
  id: "home",
  words: own("screen.home."),
  reads(view) { return { queue: { op: "queue", query: { limit: 5 } }, projects: { op: "projectdirectory", empty: (v) => !v || !v.projects || !v.projects.length } }; },
  render(cs, view) {
    return cs.title() + cs.sec("screen.home.t.queue", cs.state("queue", view, (q) => q.items.map((i) => cs.mark("kind", i.class === "OBLIGATION" ? "todo" : "noticed") + cs.esc(i.summary || "")).join("")))
      + cs.sec("screen.home.t.projects", cs.state(view.data.projects, (v) => v.projects.map((p) => cs.row(cs.ref("project", p.id, p.title, [p.questions + " questions"]), cs.due(p.due, "near"))).join(""), { empty: "screen.home.t.empty" }))
      + cs.field("home-title", "screen.home.t.title", { rec: true })
      + cs.act("promote", { label: "act.promote.label.home", tone: "primary" });
  },
  acts: [{ op: "promote", send(view, el, cs) { const t = cs.value("home-title"); return t ? { body: { title: t } } : { refuse: "shell.reason.needed" }; },
    done(view, answer, cs) { if (answer && answer.project) cs.go("project", answer.project); } }],
};

export const HELD = {
  id: "held",
  words: own("screen.held."),
  reads() { return { held: { op: "heldcaptures" } }; },
  render(cs, view) {
    return cs.title() + cs.state("held", (v) => cs.rows({
      id: "held", pick: true, cols: ["screen.held.t.col.name", "screen.held.t.col.when"],
      items: v.items, key: (it) => it.id, name: (it) => it.title,
      cells: (it) => [cs.esc(it.title), cs.date(it.at)],
      sortKey: (it, col) => (col === 0 ? it.title : it.at),
      acts: (it) => cs.act("heldrestore", { data: { id: it.id } }),
      hold: (ids) => cs.act("release", { data: { ids: ids.join(",") } }) + cs.act("heldsetaside", { data: { ids: ids.join(",") } }),
    }));
  },
  acts: [
    { op: "release", send(view, el) { return { body: { ids: el.dataset.ids.split(",") } }; } },
    { op: "heldsetaside", send(view, el) { return { body: { ids: el.dataset.ids.split(",") } }; } },
    { op: "heldrestore", send(view, el) { return { body: { id: el.dataset.id } }; } },
  ],
};

export const DOCUMENT = {
  id: "document",
  words: own("screen.document."),
  place(view) { const d = view.data.doc; return d && d.state === "ok" ? { project: { id: d.value.project.id, title: d.value.project.title } } : null; },
  reads(view) { return { doc: { op: "image", query: { id: view.subject }, subject: true } }; },
  render(cs, view) {
    return cs.state("doc", view, (d) => cs.title(d.title, { kind: "document", facts: [d.pages + " pages"] })
      + cs.grade("capture", d.grade) + cs.mark("origin", "search") + cs.mark("gap", "refused", { reason: d.why })
      + cs.sec("screen.document.t.passages", d.passages.map((p) => cs.row(cs.ref("passage", view.subject + "#" + p.n, p.text, []), cs.act("cite", { data: { passage: p.n } }))).join(""))
      + cs.act("retire") + cs.act("attest") + cs.act("release", { data: { id: view.subject } }));
  },
  acts: [
    { op: "cite", send(view, el) { return { body: { passage: Number(el.dataset.passage), capture: view.subject } }; }, refusals: { CITE_GONE: "screen.document.t.passages" } },
    { op: "retire", send(view) { return { body: { id: view.subject } }; } },
    { op: "attest", send(view, el, cs, extra) { return { body: { id: view.subject, note: extra.fields.note } }; }, dialog: [{ name: "note", label: "screen.document.t.passages" }] },
    { op: "release", send(view) { return { body: { ids: [view.subject] } }; } },
  ],
};

export const MEMBERS = {
  id: "members",
  words: own("screen.members."),
  reads() { return {}; },
  render(cs) { return cs.title() + cs.sec("screen.members.t.roster", cs.act("memberadd") + cs.act("membercaps")); },
  acts: [{ op: "memberadd" }, { op: "membercaps" }],
};

export const ASSISTANT = {
  id: "assistant",
  words: own("screen.assistant."),
  reads(view) { return {}; },
  render(cs, view) { return cs.sec("screen.assistant.t.panel", cs.mark("origin", "machine") + cs.act("airunopen", { data: { screen: view.serves.screen } })); },
  acts: [{ op: "airunopen", send(view) { return { body: { context: view.serves } }; } }],
};

export const ALL = [HOME, HELD, DOCUMENT, MEMBERS, ASSISTANT];
