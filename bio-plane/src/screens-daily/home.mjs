/* The group's home (registry screen `home`; screens-daily R1, R7). Where a member starts each day: the group's name and
   description, the first items waiting on them, the projects they may see with each one's stage, the projects they could
   join, and "Start a project". Every function here is self-contained (interface-shell R21 (1)): it refers only to its
   parameters, the kit `cs` and the language's own globals, so the shell can compose the page's script from its text. */

export const home = Object.freeze({
  id: "home",

  // R1's reads. The projects the member may see come from `search` over `type:project` (retrieval's sight gate), and
  // the ones they could ask to join from `projectdirectory` (project-roster R9), with no question count in T46 (K3000).
  reads: function (view) {
    return {
      group: { op: "groupidentity" },
      queue: {
        op: "queue", query: { limit: "5" }, // R1: the first items waiting; the rest are one link away
        empty: function (v) { return !v || !Array.isArray(v.items) || v.items.length === 0; },
      },
      projects: {
        op: "search", query: { q: "type:project", limit: "200" },
        empty: function (v) { return !v || !Array.isArray(v.hits) || v.hits.length === 0; },
      },
      directory: {
        op: "projectdirectory",
        empty: function (v) { return !v || !Array.isArray(v.projects) || v.projects.length === 0; },
      },
    };
  },

  render: function (cs, view) {
    const STAGES = ["forming", "investigating", "matured", "closed"];
    const CLASS_KIND = { OBLIGATION: "todo", FINDING: "noticed", CONDITION: "status" };
    const ladder = function (state) {
      const at = STAGES.indexOf(String(state || "").toLowerCase());
      return '<div class="cs-ladder" data-ladder="stage" aria-label="' + cs.w("screen.home.stage.means") + '">'
        + STAGES.map(function (s, i) {
          return '<span class="' + (at >= 0 && i <= at ? "on" : "") + '"' + (i === at ? ' aria-current="step"' : "") + ">"
            + cs.w("screen.home.stage." + s) + "</span>";
        }).join("") + "</div>";
    };
    const g = view.data.group;
    const gv = g && g.state === "ok" ? g.value : null;
    const name = gv && (gv.display_name || gv.group);
    const description = gv && typeof gv.description === "string" && gv.description.trim() ? gv.description : null;
    const heading = cs.state("group", function () {
      return cs.title(name || "", { thing: "group" })
        + (description ? '<p class="mk-sub">' + cs.esc(description) + "</p>" : '<p class="mk-sub muted">' + cs.w("screen.home.nodescription") + "</p>");
    });

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

    const working = cs.sec("screen.home.working", cs.state("projects", function (s) {
      return cs.sheet((s.hits || []).map(function (h) {
        return cs.row("", cs.ref("project", h.bundle_id, h.title || h.bundle_id, []), ladder(h.current_state), "");
      }).join(""));
    }, { empty: "screen.home.noprojects" }));

    const d = view.data.directory;
    const join = d && d.state === "ok" && d.value && Array.isArray(d.value.projects) && d.value.projects.length
      ? cs.sec("screen.home.couldjoin", cs.sheet(d.value.projects.map(function (p) {
        const asked = p.request && p.request.state === "open" ? '<span class="meta">' + cs.w("screen.home.joinasked") + "</span>" : "";
        return cs.row("", cs.ref("project", p.id, p.name || p.id, []) + asked, "", "");
      }).join("")))
      : "";

    return heading + start + waiting + working + join;
  },

  acts: [
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
