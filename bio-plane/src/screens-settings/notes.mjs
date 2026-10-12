/* screens-settings R6, R7 (and R8): Settings › Your notes, the registry's 5 acts (DEC-136). A member's own notes, seen
   only by them: written, revised, deleted, and turned into an observation, a hunch or a question in the shapes the owner
   names (hypotheses R13); the assistant's help under the note's field only while it is reachable (interface-shell R20),
   its draft labelled "Draft · the assistant's, asked by <handle>" and kept only by the member's own act (DEC-153 (3)),
   with the test-instance label when the answer carries it (screens-inquiry R7's words); the court sentence once, the
   first time the member keeps a note while the group tells members what a court can reach (DEC-136; membership R108).
   Every function is self-contained (interface-shell R21). */

export const notes = {
  id: "notes",

  reads() {
    return {
      notes: { op: "notes", empty: (v) => !v.notes || v.notes.length === 0 },
      court: { op: "courtnotice" },
    };
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.notes.";
    const D = (iso) => String(cs.date(iso, { year: true })).replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const ui = view.ui || {};
    const data = view.data || {};
    // a note's field, holding the assistant's draft when one was asked for it, labelled as the assistant's
    const textField = (id, field, value) => {
      const dr = ui.draft && ui.draft.field === field ? ui.draft : null;
      const label = dr ? W(S + "draft.label", { handle: dr.askedBy }) : W(field === "new" ? S + "new.field" : S + "revise.field");
      const help = view.reachable ? cs.act("writinghelp", { data: { field, id } }) : "";
      return `<label for="${id}">${label}</label>${dr && dr.untested ? `<p class="cs-label-untested">${W("ai.label.untested")}</p>` : ""}<textarea id="${id}" class="cs-input rec${dr ? " cs-draft" : ""}">${E(dr ? dr.text : value)}</textarea>${help}`;
    };
    const out = [`<p>${W(S + "private")}</p><p class="cs-note">${W(S + "protects")}</p>`];

    // the court sentence, once (R7)
    if (ui.court) out.push(`<p class="cs-notice" data-shown="court">${W(S + "court")}</p>`);

    // a new note
    const write = cs.act("notewrite");
    if (write) out.push(`<div class="cs-form">${textField("mn-new", "new", "")}${write}</div>`);

    // the notes kept, each with its acts in its panel (interface-shell R19)
    out.push(cs.sec(S + "kept.heading", cs.state(data.notes, (v) => cs.rows({
      cols: [S + "col.note", S + "col.when"], items: v.notes || [], key: (n) => String(n.note),
      cells: (n) => [
        `<span class="rec">${E(n.text)}</span>`,
        `${E(D(n.at))}${n.revised ? " · " + W(S + "revised", { date: D(n.revised) }) : ""} · ${W(S + "onlyyou")}${(n.turned || []).map((t) => " · " + W(S + "turned." + (["observation", "hunch", "question"].indexOf(t.into) >= 0 ? t.into : "other"), { id: t.id })).join("")}`,
      ],
      acts: (n) => {
        const id = String(n.note);
        const p = [];
        const rev = cs.act("noterevise", { data: { note: id } });
        if (rev) p.push(`<div class="cs-form">${textField("mn-r" + id, "note:" + id, n.text)}${rev}</div>`);
        const turn = cs.act("noteturn", { data: { note: id } });
        if (turn) p.push(`<div class="cs-form"><fieldset><legend>${W(S + "turn.into")}</legend>${["observation", "hunch", "question"].map((k, i) => `<input type="radio" id="mn-${k}${id}" name="mn-into${id}"${i === 0 ? " checked" : ""}><label for="mn-${k}${id}">${W(S + "turn." + k)}</label>`).join("")}</fieldset>
<label for="mn-made${id}">${W(S + "turn.made")}</label><span class="help">${W(S + "turn.made.help")}</span><input id="mn-made${id}" type="text" class="cs-input">
<label for="mn-inq${id}">${W(S + "turn.inquiry")}</label><span class="help">${W(S + "turn.inquiry.help")}</span><input id="mn-inq${id}" type="text" class="cs-input">
<label for="mn-kind${id}">${W(S + "turn.kind")}</label><select id="mn-kind${id}" class="cs-input">${["cause", "identity", "relation", "flow", "other"].map((k) => `<option value="${k}">${W(S + "turn.kind." + k)}</option>`).join("")}</select>
<label for="mn-about${id}">${W(S + "turn.about")}</label><span class="help">${W(S + "turn.about.help")}</span><input id="mn-about${id}" type="text" class="cs-input">${turn}</div>`);
        p.push(cs.act("notedelete", { data: { note: id } }));
        return p.join("");
      },
    }), { empty: S + "empty" })));
    return out.join("");
  },

  acts: [
    { op: "notewrite", rereads: ["notes"],
      send(view, el, cs) { const text = String(cs.value("mn-new") || "").trim(); return text ? { body: { text } } : { refuse: "screen.notes.notext" }; },
      // the court sentence the first time this member keeps a note, while the group tells members (R7)
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        const d = view.data || {};
        const tell = !!(d.court && d.court.state === "ok" && d.court.value && d.court.value.choice === "tell");
        const first = !!(d.notes && d.notes.state === "empty");
        if ((a && a.courtStatement) || (tell && first)) cs.set("court", true);
        if (view.ui && view.ui.draft) cs.set("draft", null);
      } },
    { op: "noterevise", rereads: ["notes"],
      send(view, el, cs) { const n = el.dataset.note; const text = String(cs.value("mn-r" + n) || "").trim(); return text ? { body: { note: Number(n), text } } : { refuse: "screen.notes.notext" }; },
      done(view, answer, cs) { if (view.ui && view.ui.draft) cs.set("draft", null); } },
    { op: "notedelete", rereads: ["notes"],
      send(view, el) { return { body: { note: Number(el.dataset.note) } }; } },
    // the owner's two shapes (hypotheses R13): into a hunch, or the link to an observation or question already made
    { op: "noteturn", rereads: ["notes"],
      send(view, el, cs) {
        const n = el.dataset.note, note = Number(n);
        const into = cs.value("mn-hunch" + n) === true ? "hunch" : cs.value("mn-question" + n) === true ? "question" : "observation";
        if (into === "hunch") {
          const inquiry = String(cs.value("mn-inq" + n) || "").trim();
          const ids = String(cs.value("mn-about" + n) || "").split(/[\s,]+/).filter(Boolean);
          const kind = cs.value("mn-kind" + n) || "other";
          if (!inquiry || !ids.length) return { refuse: "screen.notes.turn.incomplete" };
          const pair = ["cause", "identity", "relation"].indexOf(kind) >= 0;
          if (pair && ids.length !== 2) return { refuse: "screen.notes.turn.pair" };
          return { body: { note, into, hunch: { inquiry, kind, about: pair ? { from: ids[0], to: ids[1] } : ids } } };
        }
        const made = String(cs.value("mn-made" + n) || "").trim();
        return made ? { body: { note, into, made } } : { refuse: "screen.notes.turn.nomade" };
      } },
    // the assistant's help with the note's words (wizard-scripts R27; DEC-153): nothing is kept until the member keeps it
    { op: "writinghelp", rereads: [],
      send(view, el, cs) {
        const told = String(cs.value(el.dataset.id) || "").trim();
        if (!told) return { refuse: "screen.notes.notext" };
        // which field asked, for the draft to land in (the act's `done` is handed no control)
        cs.set("helping", el.dataset.field);
        return { body: { op: el.dataset.field === "new" ? "notewrite" : "noterevise", field: "text", told } };
      },
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        const me = view.me || {};
        const by = a && a.label && a.label.asked_by ? String(a.label.asked_by).replace(/^member:/, "") : me.member;
        cs.set("draft", { field: (view.ui && view.ui.helping) || "new", text: (a && a.text) || "", askedBy: by === me.member && me.handle ? me.handle : by, untested: !!(a && (a.untested || (a.label && a.label.untested))) });
      } },
  ],
};
