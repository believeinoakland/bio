/* The group's home (registry screen `home`; screens-daily R1, R7, R8, R9, R11; DEC-198 (4), DEC-201 (7)). Where a member
   starts each day: the group's name and description, the first items waiting on them, "What happened?" (the front doors
   `startfrom` answers, the matching work and the blank start), the group's projects with each one's question count and
   stage, the projects they could join, and, in a new group, what to do first. Every function here is self-contained
   (interface-shell R21 (1)): it refers only to its parameters, the kit `cs`, `view.parts` and the language's own
   globals, so the shell can compose the page's script from its text. */
import { projectRows } from "./project-rows.mjs";

export const home = Object.freeze({
  id: "home",
  parts: { projectRows },

  // R1, R8, R9's reads. The projects come from `projectlist` (project-roster R26; each count read by the rows, R8), the
  // ones the member could ask to join from `projectdirectory` (project-roster R9), the front doors from `startfrom`
  // (wizard-scripts R23, R33), and, once the member has written what happened, the matching work from `search`.
  reads: function (view) {
    const ui = view.ui || {};
    const out = {
      group: { op: "groupidentity" },
      queue: {
        op: "queue", query: { limit: "5" }, // R1: the first items waiting; the rest are one link away
        empty: function (v) { return !v || !Array.isArray(v.items) || v.items.length === 0; },
      },
      projects: {
        op: "projectlist",
        empty: function (v) { return !v || !Array.isArray(v.projects) || v.projects.length === 0; },
      },
      directory: {
        op: "projectdirectory",
        empty: function (v) { return !v || !Array.isArray(v.projects) || v.projects.length === 0; },
      },
      doors: {
        op: "startfrom",
        empty: function (v) { return !v || !Array.isArray(v.doors) || v.doors.length === 0; },
      },
    };
    if (typeof ui.words === "string" && ui.words.trim()) {
      out.matching = {
        op: "search", query: { q: ui.words, limit: "10" },
        empty: function (v) { return !v || !Array.isArray(v.hits) || v.hits.length === 0; },
      };
    }
    return out;
  },

  render: function (cs, view) {
    const CLASS_KIND = { OBLIGATION: "todo", FINDING: "noticed", CONDITION: "status" };
    const ui = view.ui || {};
    const g = view.data.group;
    const gv = g && g.state === "ok" ? g.value : null;
    const name = gv && (gv.display_name || gv.group);
    const description = gv && typeof gv.description === "string" && gv.description.trim() ? gv.description : null;
    const heading = cs.state("group", function () {
      return cs.title(name || "", { thing: "group" })
        + (description ? '<p class="mk-sub">' + cs.esc(description) + "</p>" : '<p class="mk-sub muted">' + cs.w("screen.home.nodescription") + "</p>");
    });

    // R11 (DEC-201 (7), DEC-202 (4)): a new group, with no project yet and its founder alone in it: what to do first.
    const pr = view.data.projects;
    const fresh = pr && pr.state === "empty" && view.me && view.me.administer === true
      ? cs.sec("screen.home.ready", '<p class="mk-note">' + cs.w("screen.home.nothingyet") + "</p>"
        + '<div class="mk-links"><a class="cs-btn" data-tone="quiet" data-nav href="/app/members">' + cs.w("screen.home.invite") + "</a>"
        + '<a class="cs-btn" data-tone="quiet" data-nav href="/app/group-identity">' + cs.w("screen.home.saywho") + "</a></div>")
      : "";

    // R9 (DEC-198 (4)): "What happened?": each door `startfrom` answers, its words and its offered scripts, each script
    // started by the wizard runner (`cs.wizard`); with no doors the section is not drawn.
    const d = view.data.doors;
    const dv = d && d.state === "ok" && d.value ? d.value : null;
    const scripts = {};
    (dv && Array.isArray(dv.scripts) ? dv.scripts : []).forEach(function (s) { if (s && s.id) scripts[String(s.id)] = s; });
    const doors = dv && Array.isArray(dv.doors) ? dv.doors.filter(function (x) { return x && Array.isArray(x.scripts) && x.scripts.length; }) : [];
    const m = view.data.matching;
    const matching = m && m.state !== "empty" ? '<p class="mk-note" data-front="matching">' + cs.state(m, function (v) {
      return cs.w("door.front.matching", { items: "" }) + (v.hits || []).map(function (h) {
        const id = String(h.bundle_id);
        return " " + cs.ref(String(h.object_type || "").toLowerCase() === "project" || /^PROJ-/.test(id) ? "project" : "document", id, h.title || id, []);
      }).join(",");
    }) + "</p>" : "";
    const front = doors.length
      ? '<section class="cs-section mk-welcome" data-front="doors"><h2 tabindex="0">' + cs.w("door.front.head") + "</h2>"
        + '<p class="mk-sub">' + cs.w("door.front.intro") + '</p><div class="mk-doors">'
        + doors.map(function (x) {
          const k = String(x.door);
          return '<div class="mk-door" data-door="' + cs.esc(k) + '"><b>' + cs.w("door.front." + k + ".name") + "</b><span>" + cs.w("door.front." + k + ".hint") + "</span>"
            + '<span class="mk-acts">' + x.scripts.map(function (id) {
              const s = scripts[String(id)] || { id: id, name: id };
              return cs.act("startfrom", { label: "screen.home.script", fills: { name: String(s.name || s.id) }, data: { script: String(s.id), version: String(s.version === undefined ? "" : s.version) } });
            }).join("") + "</span></div>";
        }).join("") + "</div>"
        + '<div class="mk-search">' + cs.field("home-words", "screen.home.words", { value: ui.words || "" })
        + '<span class="mk-acts">' + cs.act("startfrom", { label: "act.startfrom.label.home" }) + "</span></div>" + matching
        + '<p class="mk-note">' + cs.w("door.front.blank") + "</p></section>"
      : "";

    // R1's blank start: a new project, its title the member's.
    const start = '<div class="mk-welcome">'
      + cs.field("home-title", "screen.home.title", { rec: true, help: "screen.home.title.help" })
      + '<div class="mk-acts">' + cs.act("promote", { label: "act.promote.label.home", tone: "primary" }) + "</div></div>";

    const waiting = cs.sec("screen.home.waiting", cs.state("queue", function (q) {
      const items = (q.items || []).slice(0, 5);
      const total = typeof q.item_count === "number" ? q.item_count : items.length;
      return cs.sheet(items.map(function (it) {
        const kind = CLASS_KIND[it.class] || "status";
        const due = it.due ? cs.due(String(it.due), "") : "";
        return cs.row(cs.mark("kind", kind), cs.esc(it.summary || ""), due, "");
      }).join("")) + '<a class="mk-more" data-nav href="/app/queue">' + cs.w("screen.home.queuelink", { n: String(total) }) + "</a>";
    }, { empty: "screen.home.nothingwaiting" }));

    // R8: the projects the member sees, each with its count and stage (the rows part, shared with Projects, R10).
    const rows = view.parts.projectRows(cs, view, "screen.home");
    const working = cs.sec("screen.home.working", cs.state("projects", rows, { empty: "screen.home.noprojects" }));

    const dir = view.data.directory;
    const join = dir && dir.state === "ok" && dir.value && Array.isArray(dir.value.projects) && dir.value.projects.length
      ? cs.sec("screen.home.couldjoin", cs.sheet(dir.value.projects.map(function (p) {
        const asked = p.request && p.request.state === "open" ? '<span class="meta">' + cs.w("screen.home.joinasked") + "</span>" : "";
        return cs.row("", cs.ref("project", p.id, p.name || p.id, []) + asked, "", "");
      }).join("")))
      : "";

    return heading + fresh + front + start + waiting + working + join;
  },

  acts: [
    // R9: "Start from…": a script button starts that script in the wizard runner and sends nothing; the words button keeps
    // the member's words and re-reads the doors and the work matching them.
    {
      op: "startfrom",
      label: "act.startfrom.label.home",
      rereads: ["doors", "matching"],
      send: function (view, el, cs) {
        if (el.dataset.script) {
          const v = Number(el.dataset.version);
          cs.wizard(el.dataset.script, el.dataset.version === "" || isNaN(v) ? el.dataset.version : v);
          return null;
        }
        const words = String(cs.value("home-words") || "").trim();
        if (!words) return { refuse: "screen.home.wordsfirst" };
        cs.set("words", words);
        return { query: {} };
      },
    },
    {
      // R1: a new project, its title the member's, its owner the member (the door stamps the owner, control-plane R73).
      op: "promote",
      label: "act.promote.label.home",
      send: function (view, el, cs) {
        const title = String(cs.value("home-title") || "").trim();
        if (!title) return { refuse: "screen.home.title.needed" };
        const now = new Date(cs.now());
        const iso = now.toISOString().replace(/\.\d{3}Z$/, "Z");
        const stamp = iso.replace(/[-:]/g, "");
        const nonce = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
        const text = "---\nobject_type: project\nobjective: " + JSON.stringify(title) + "\ncurrent_state: forming\ncreated: \"" + iso
          + "\"\nlast_updated: \"" + iso + "\"\n---\n\n## Session Log\n\n### Session " + iso
          + " | Formation | interactive\nTrigger: started from the group's home\nChanges: created.\n";
        return {
          body: {
            base: null,
            snapKey: stamp + "_" + nonce,
            meta: { object_type: "project", title: title, current_state: "forming", created: iso, last_updated: iso },
            files: [{ path: "bundle.md", text: text }],
            register: [],
          },
        };
      },
      // R1: opening `project` on success.
      done: function (view, answer, cs) {
        const id = answer && (answer.bundleId || (answer.result && answer.result.bundleId));
        if (id) cs.go("project", id);
      },
    },
  ],
});
