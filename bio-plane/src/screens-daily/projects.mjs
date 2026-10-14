/* Projects (registry screen `projects`; screens-daily R10, R7, R20, R21, R23; DEC-201 (8), DEC-214 (3)). Every project the member sees, as
   `projectlist` answers it (project-roster R26, R28), each a reference opening `project` with its question count
   (`projectquestions`, paged), its stage on the ladder, its members (`cs.initials`), its activity over eight weeks
   (`cs.activity`) and its last change, `truncated` said; "Start a project", its title field opened on press (R23); and the imported cases (R20). Every function is self-contained
   (interface-shell R21 (1)). */
import { projectRows } from "./project-rows.mjs";

export const projects = Object.freeze({
  id: "projects",
  parts: { projectRows },

  reads: function (view) {
    return {
      projects: {
        op: "projectlist",
        empty: function (v) { return !v || !Array.isArray(v.projects) || v.projects.length === 0; },
      },
    };
  },

  render: function (cs, view) {
    // R23: the definition once, under the heading; "Start a project" opens its title field on press, as the act's own words.
    const rows = view.parts.projectRows(cs, view, "screen.projects", true);
    const promote = cs.act("promote", { label: "act.promote.label.projects", tone: "primary" });
    const start = promote ? '<details class="mk-details" data-start="project"><summary>' + cs.w("act.promote.label.projects") + "</summary>"
      + cs.field("projects-title", "screen.projects.title", { rec: true, help: "screen.projects.title.help" }) + '<div class="mk-acts">' + promote + "</div></details>" : "";
    // R20 (DEC-228 (4)): the imported cases, a reference opening `imported`.
    const imported = '<p class="mk-acts"><a class="cs-ref" data-nav href="/app/imported">' + cs.w("screen.imported.name") + "</a></p>";
    return cs.title(undefined, {}) + '<p class="mk-sub">' + cs.w("screen.projects.sub") + "</p>"
      + cs.state("projects", rows, { empty: "screen.projects.none" }) + start + imported;
  },

  acts: [
    {
      // "Start a project": as Home's (R1), its title the member's, opening `project` on success.
      op: "promote",
      label: "act.promote.label.projects",
      send: function (view, el, cs) {
        const title = String(cs.value("projects-title") || "").trim();
        if (!title) return { refuse: "screen.projects.title.needed" };
        const iso = new Date(cs.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
        const nonce = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
        const text = "---\nobject_type: project\nobjective: " + JSON.stringify(title) + "\ncurrent_state: forming\ncreated: \"" + iso
          + "\"\nlast_updated: \"" + iso + "\"\n---\n\n## Session Log\n\n### Session " + iso
          + " | Formation | interactive\nTrigger: started from the projects list\nChanges: created.\n";
        return {
          body: {
            base: null,
            snapKey: iso.replace(/[-:]/g, "") + "_" + nonce,
            meta: { object_type: "project", title: title, current_state: "forming", created: iso, last_updated: iso },
            files: [{ path: "bundle.md", text: text }],
            register: [],
          },
        };
      },
      done: function (view, answer, cs) {
        const id = answer && (answer.bundleId || (answer.result && answer.result.bundleId));
        if (id) cs.go("project", id);
      },
    },
  ],
});
