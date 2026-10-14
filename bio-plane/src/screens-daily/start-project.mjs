/* "Start a project" (screens-daily R1, R23, R25, R30, R33; DEC-88, DEC-237 (projects); N1091), a screen part (interface-shell
   R21, K3002) handed to Home and Projects as `view.parts.startProject`. `form(cs, id, label)` answers the act's own words as
   a disclosure that opens on press (R23): "What it is about" (the title), "Who can find it" (hidden, preselected, or
   findable) and that it can be changed later with a reason (R30), then the act. `body(cs, view, id, trigger)` answers what
   `promote` takes: the project's document with its `title` as well as its `objective` (R25: every screen reads the title),
   and the chosen `visibility` (R30). Self-contained: it refers only to its parameters. */

export function startProject() {
  const form = function (cs, id, label, act) {
    if (!act) return "";
    return '<details class="mk-details" data-start="project"><summary>' + cs.w(label) + "</summary>"
      + cs.field(id + "-title", "project.start.title", { rec: true, help: "project.start.title.help" })
      + cs.choice(id + "-visibility", "project.visibility.title",
        [["hidden", "project.visibility.start.hidden"], ["discoverable", "project.visibility.start.discoverable"]], { value: "hidden" })
      + '<p class="mk-small muted">' + cs.w("project.visibility.start.later") + "</p>"
      + '<div class="mk-acts">' + act + "</div></details>";
  };
  const body = function (cs, view, id, trigger) {
    const title = String(cs.value(id + "-title") || "").trim();
    if (!title) return null;
    const visibility = String(cs.value(id + "-visibility") || "") === "discoverable" ? "discoverable" : "hidden";
    // `cs.w` answers HTML; the session log is text, so the entities it made are undone.
    const plain = function (s) { return String(s).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"); };
    const iso = new Date(cs.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
    const nonce = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
    const text = "---\nobject_type: project\ntitle: " + JSON.stringify(title) + "\nobjective: " + JSON.stringify(title)
      + "\ncurrent_state: forming\ncreated: \"" + iso + "\"\nlast_updated: \"" + iso + "\"\n---\n\n## Session Log\n\n### Session " + iso
      + " | Formation | interactive\nTrigger: " + plain(cs.w(trigger)) + "\nChanges: created.\n";
    return {
      base: null,
      snapKey: iso.replace(/[-:]/g, "") + "_" + nonce,
      meta: { object_type: "project", title: title, current_state: "forming", created: iso, last_updated: iso },
      files: [{ path: "bundle.md", text: text }],
      register: [],
      visibility: visibility,
    };
  };
  return { form: form, body: body };
}
