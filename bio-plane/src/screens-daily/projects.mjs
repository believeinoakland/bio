/* Projects (registry screen `projects`; screens-daily R10, R7, R20, R21, R23; DEC-201 (8), DEC-214 (3)). Every project the member sees, as
   `projectlist` answers it (project-roster R26, R28), each a reference opening `project` with its question count
   (`projectquestions`, paged), its stage on the ladder, its members (`cs.initials`), its activity over eight weeks
   (`cs.activity`) and its last change, `truncated` said; "Start a project", its title field opened on press (R23); and the imported cases (R20). Every function is self-contained
   (interface-shell R21 (1)). */
import { projectRows } from "./project-rows.mjs";
import { startProject } from "./start-project.mjs";
import { participation } from "./participation.mjs";

export const projects = Object.freeze({
  id: "projects",
  parts: { projectRows, startProject, participation },

  reads: function (view) {
    return {
      projects: {
        op: "projectlist",
        empty: function (v) { return !v || !Array.isArray(v.projects) || v.projects.length === 0; },
      },
    };
  },

  render: function (cs, view) {
    // R23, R30: the definition once, under the heading; "Start a project" opens its form on press (the title, who can find it).
    const start = view.parts.startProject().form(cs, "projects", "act.promote.label.projects", cs.act("promote", { label: "project.start.go", tone: "primary" }));
    // R20 (DEC-228 (4)): the imported cases, a reference opening `imported`.
    const imported = '<p class="mk-acts"><a class="cs-ref" data-nav href="/app/imported">' + cs.w("screen.imported.name") + "</a></p>";
    const pr = view.data.projects;
    // R33 (DEC-245): with no project, its designed empty state, then the act. The first question is the project page's.
    if (pr && pr.state === "empty") {
      return cs.title(undefined, {}) + '<p class="cs-state" data-state="empty">' + cs.w("projects.empty.sub") + "</p>"
        + '<p class="mk-note">' + cs.w("projects.empty.note") + "</p>" + start + imported;
    }
    // R29 (D25): a project the member is invited to is set apart, with "Join"; the rest are the member's own.
    const all = pr && pr.state === "ok" && pr.value && Array.isArray(pr.value.projects) ? pr.value.projects : [];
    const place = view.parts.participation(cs, view, all);
    const invitedList = all.filter(function (p) { return p && place[String(p.id)] === "invited"; });
    const rows = view.parts.projectRows(cs, view, "screen.projects", true);
    const rowsJoin = view.parts.projectRows(cs, view, "screen.projects", true, "act.projectjoin.label.projects", place);
    const invited = invitedList.length
      ? cs.sec("projects.invited.head", rowsJoin({ projects: invitedList }), { help: "projects.invited.says" }) : "";
    return cs.title(undefined, {}) + '<p class="mk-sub">' + cs.w("screen.projects.sub") + "</p>" + invited
      + cs.state("projects", function (v) {
        const rest = (v.projects || []).filter(function (p) { return !(p && place[String(p.id)] === "invited"); });
        return rest.length || !invitedList.length ? rows(Object.assign({}, v, { projects: rest })) : "";
      }, { empty: "projects.empty.sub" }) + start + imported;
  },

  acts: [
    {
      // "Start a project": as Home's (R1, R25, R30), its title the member's, opening `project` on success.
      op: "promote",
      label: "act.promote.label.projects",
      send: function (view, el, cs) {
        const body = view.parts.startProject().body(cs, view, "projects", "file.trigger.projects");
        return body ? { body: body } : { refuse: "screen.projects.title.needed" };
      },
      done: function (view, answer, cs) {
        const id = answer && (answer.bundleId || (answer.result && answer.result.bundleId));
        if (id) cs.go("project", id);
      },
    },
    // R29: "Join", a project the member is invited to; the list is read again, her place in it now joined.
    { op: "projectjoin", label: "act.projectjoin.label.projects", rereads: ["projects"],
      send: function (view, el) { return el.dataset.project ? { query: { projectId: el.dataset.project } } : null; } },
  ],
});
