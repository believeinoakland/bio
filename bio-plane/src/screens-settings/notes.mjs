/* screens-settings R6, R7 (and R8): Settings › Your notes, the registry's 5 acts (DEC-136). A member's own notes, seen
   only by them: written, revised, deleted, and turned into an observation, a hunch or a question in the shape the owner
   names (hypotheses R13); the assistant's help under the note's field only while it is reachable (interface-shell R20),
   its draft labelled and kept only by the member's own act (DEC-153 (3)); the court sentence once, the first time the
   member keeps a note while the group tells members what a court can reach (DEC-136; membership R108). Every function
   is self-contained (K2854 T1). */

export const notes = {
  id: "notes",

  reads() {
    return [
      { name: "notes", op: "notes" },
      { name: "court", op: "courtnotice" },
    ];
  },

  render(cs, d, ctx) {
    const W = cs.w, E = cs.esc, S = "screen.notes.";
    const me = ctx.me || {};
    const shown = ctx.shown || {};
    const form = (inner) => `<div class="cs-form" data-form>${inner}</div>`;
    const sec = (key, inner) => `<section class="cs-section"><h2>${W(key)}</h2>${inner}</section>`;
    const ok = (o) => o && o.state === "ok" && o.value && o.value.ok !== false;
    // the assistant's draft for a field, labelled as its own (DEC-153 (3)), with the test-instance label when marked
    const draftOf = (field) => shown.draft && shown.draft.field === field ? shown.draft : null;
    const textField = (id, field, value, help) => {
      const dr = draftOf(field);
      const label = dr ? W(S + "draft.label", { handle: dr.askedBy }) : W(field === "new" ? S + "new.field" : S + "revise.field");
      const helpAct = ctx.reachable ? cs.act("writinghelp", { subject: field, screen: "notes" }) : "";
      return `<label for="${id}">${label}</label>${dr && dr.untested ? `<span class="cs-label-untested">${W("ai.label.untested")}</span>` : ""}<textarea id="${id}" name="text" class="cs-input rec${dr ? " cs-draft" : ""}">${E(dr ? dr.text : value)}</textarea>${helpAct}`;
    };
    const out = [`<h1>${W("screen.notes.name")}</h1>`, `<p>${W(S + "private")}</p><p class="cs-note">${W(S + "protects")}</p>`];

    // the court sentence, once (R7)
    if (shown.court) out.push(`<p class="cs-notice" data-shown="court">${W(S + "court")}</p>`);

    // a new note
    const write = cs.act("notewrite", { subject: "new", screen: "notes" });
    if (write) out.push(form(textField("mn-new", "new", "") + write));

    // the notes kept, each with its acts in its panel (interface-shell R19), opened at `/app/notes/<n>`
    let kept = "";
    if (!ok(d.notes)) kept = cs.state(d.notes.state === "ok" ? { state: "failed", refusal: d.notes.value } : d.notes);
    else if (!(d.notes.value.notes || []).length) kept = cs.state({ state: "empty" }, S + "empty");
    else kept = `<ul class="cs-list">${d.notes.value.notes.map((n) => {
      const id = String(n.note);
      const turned = (n.turned || []).map((t) => W(S + "turned." + (["observation", "hunch", "question"].includes(t.into) ? t.into : "other"), { id: t.id })).join(" · ");
      let panel = "";
      if (String(ctx.subject) === id) {
        const p = [];
        const rev = cs.act("noterevise", { subject: id, screen: "notes" });
        if (rev) p.push(form(textField("mn-r" + id, "note:" + id, n.text) + rev));
        const turn = cs.act("noteturn", { subject: id, screen: "notes" });
        if (turn) p.push(form(`<fieldset><legend>${W(S + "turn.into")}</legend>${["observation", "hunch", "question"].map((k, i) => `<label><input type="radio" name="into" value="${k}"${i === 0 ? " checked" : ""}> ${W(S + "turn." + k)}</label>`).join("")}</fieldset>
<label for="mn-made${id}">${W(S + "turn.made")}</label><span class="help">${W(S + "turn.made.help")}</span><input id="mn-made${id}" name="made" type="text" class="cs-input">
<label for="mn-inq${id}">${W(S + "turn.inquiry")}</label><span class="help">${W(S + "turn.inquiry.help")}</span><input id="mn-inq${id}" name="inquiry" type="text" class="cs-input">
<label for="mn-kind${id}">${W(S + "turn.kind")}</label><select id="mn-kind${id}" name="kind" class="cs-input">${["cause", "identity", "relation", "flow", "other"].map((k) => `<option value="${k}">${W(S + "turn.kind." + k)}</option>`).join("")}</select>
<label for="mn-about${id}">${W(S + "turn.about")}</label><span class="help">${W(S + "turn.about.help")}</span><input id="mn-about${id}" name="about" type="text" class="cs-input">${turn}`));
        const del = cs.act("notedelete", { subject: id, screen: "notes" });
        if (del) p.push(form(del));
        panel = `<div class="cs-panel" data-panel-of="${E(id)}">${p.join("")}</div>`;
      }
      return `<li data-row="${E(id)}"><a href="/app/notes/${encodeURIComponent(id)}" data-ref="note"><span class="rec">${E(n.text)}</span></a> <span class="meta">${cs.date(n.at)}${n.revised ? " · " + W(S + "revised", { date: cs.dateText(n.revised) }) : ""} · ${W(S + "onlyyou")}</span>${turned ? ` <span class="meta">${turned}</span>` : ""}${panel}</li>`;
    }).join("")}</ul>`;
    out.push(sec(S + "kept.heading", kept));
    return out.join("");
  },

  acts: [
    { op: "notewrite", rereads: ["notes"], clears: ["text"],
      args(f) { const text = String(f.text || "").trim(); return text ? { body: { text } } : { hold: "screen.notes.notext" }; },
      // the court sentence the first time this member keeps a note, while the group tells members (R7)
      after(a, ctx, d) {
        const tell = d.court && d.court.state === "ok" && d.court.value && d.court.value.choice === "tell";
        const first = d.notes && d.notes.state === "ok" && d.notes.value && Array.isArray(d.notes.value.notes) && d.notes.value.notes.length === 0;
        return { show: { court: !!(a && a.courtStatement) || (tell && first) } };
      } },
    { op: "noterevise", rereads: ["notes"],
      args(f, ctx, d, subject) { const text = String(f.text || "").trim(); return text ? { body: { note: Number(subject), text } } : { hold: "screen.notes.notext" }; } },
    { op: "notedelete", rereads: ["notes"],
      args(f, ctx, d, subject) { return { body: { note: Number(subject) } }; } },
    { op: "noteturn", rereads: ["notes"],
      // the owner's two shapes (hypotheses R13): into a hunch, or the link to an observation or question already made
      args(f, ctx, d, subject) {
        const note = Number(subject);
        const into = f.into || "observation";
        if (into === "hunch") {
          const inquiry = String(f.inquiry || "").trim();
          const ids = String(f.about || "").split(/[\s,]+/).filter(Boolean);
          const kind = f.kind || "other";
          if (!inquiry || !ids.length) return { hold: "screen.notes.turn.incomplete" };
          const about = ["cause", "identity", "relation"].includes(kind) ? (ids.length === 2 ? { from: ids[0], to: ids[1] } : null) : ids;
          if (!about) return { hold: "screen.notes.turn.pair" };
          return { body: { note, into, hunch: { inquiry, kind, about } } };
        }
        const made = String(f.made || "").trim();
        return made ? { body: { note, into, made } } : { hold: "screen.notes.turn.nomade" };
      } },
    // the assistant's help with the note's words (wizard-scripts R27; DEC-153): nothing is kept until the member keeps it
    { op: "writinghelp", rereads: [],
      args(f, ctx, d, subject) {
        const told = String(f.text || "").trim();
        if (!told) return { hold: "screen.notes.notext" };
        return { body: { op: String(subject).startsWith("note:") ? "noterevise" : "notewrite", field: "text", told } };
      },
      after(a, ctx, d, f, subject) {
        const me = ctx.me || {};
        const by = a && a.label && a.label.asked_by ? String(a.label.asked_by).replace(/^member:/, "") : me.member;
        return { show: { draft: { field: subject, text: (a && a.text) || "", askedBy: by === me.member && me.handle ? me.handle : by, untested: !!(a && (a.untested || (a.label && a.label.untested))) } } };
      } },
  ],
};
