/* screens-settings R14 (N897 (1); N551, its share; DEC-152, DEC-153) and R11: Settings › Who your group is, the
   registry's 2 acts. Reads `groupdescription` (membership R110; the whole record, as a member reads it) and
   `groupidentity`. An administrator saves who the group is and who sees it (`groupdescriptionset`, membership R109: its
   kinds, focus and purpose, and one visibility for the whole description, members only or also the public), and, only
   while the assistant is reachable (interface-shell R20), asks it for a draft (`groupdescriptiondraft`, instance-setup
   R65) from their answers to a few questions: the draft is filled into the focus and purpose fields (`cs.fill`,
   interface-shell R27), labeled "Draft · the assistant's, asked by <handle>" (and as untested where its answer says so,
   R11), and kept only by the administrator's own save (DEC-152). Every function is self-contained (interface-shell
   R21).
   T51 (R58; DEC-331 (2), DEC-336 (1), DEC-338): the team's short name is not asked for here: `instancegroupseed` is drawn nowhere
   (the installer's act, K3868). The screen says once, above its title, that the short name was recorded at installation, or, for
   an older installation whose `groupidentity` answers `group: null`, that it is not recorded yet; it draws no field or act. */

export const identity = {
  id: "group-identity",

  reads() {
    return {
      description: { op: "groupdescription" },
      identity: { op: "groupidentity" },
    };
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.group-identity.";
    const me = view.me || {};
    const admin = me.administer === true;
    const ui = view.ui || {};
    const data = view.data || {};
    const KINDS = ["professional", "issue", "community", "catch-all", "other"];
    const id = data.identity && data.identity.state === "ok" ? data.identity.value : null;
    // R58: said once, above the title, to every session: recorded, or not recorded yet; a read that did not answer says neither
    const seed = id && id.group ? S + "seed.recorded" : id && id.group === null ? S + "seed.unrecorded" : null;
    const out = [seed ? `<p class="mk-note" data-note="seed">${W(seed)}</p>` : "", cs.title()];
    if (id && id.display_name) out.push(`<p data-state="group">${W(S + "group", { name: id.display_name })}</p>`);

    // what the group has said of itself; a group that has not is told nothing of it (R28)
    const now = cs.state(data.description, (v) => {
      const d = v.description || null;
      if (!d) return "";
      const kinds = (d.kinds || []).filter((k) => KINDS.indexOf(k) >= 0).map((k) => (k === "other" && d.otherKind ? E(d.otherKind) : W(S + "kind." + k))).join(", ");
      return `<div data-state="description"><p>${kinds ? W(S + "kinds", { kinds: "" }) + kinds : ""}</p>${d.focus ? `<p><b>${W(S + "focus.field")}</b> <span class="rec">${E(d.focus)}</span></p>` : ""}${d.purpose ? `<p><b>${W(S + "purpose.field")}</b> <span class="rec">${E(d.purpose)}</span></p>` : ""}<p>${W(d.visibility === "public" ? S + "visibility.public" : S + "visibility.members")}</p></div>`;
    });
    if (now) out.push(cs.sec(S + "now.heading", now));

    const set = admin ? cs.act("groupdescriptionset") : "";
    if (set) {
      const d = data.description && data.description.state === "ok" && data.description.value ? data.description.value.description || {} : {};
      const dr = ui.draft || null;
      // a field holding the assistant's draft says so beside its label, and as untested where its answer says so (R11)
      const draftOf = (field) => (dr && dr[field] ? { draft: S + "draft.label", draftFills: { handle: dr[field].askedBy } } : {});
      const untested = (field) => (dr && dr[field] && dr[field].untested ? ` <span class="mk-tag">${W("ai.label.untested")}</span>` : "");
      let h = `<fieldset><legend>${W(S + "kinds.field")}</legend>${KINDS.map((k) => `<label for="gi-k-${k}"><input type="checkbox" id="gi-k-${k}"${(d.kinds || []).indexOf(k) >= 0 ? " checked" : ""}>${W(S + "kind." + k)}</label>`).join("")}</fieldset>
${cs.field("gi-other", S + "other.field", { rec: true, max: 120, value: d.otherKind || "", autocomplete: "off" })}
${cs.field("gi-focus", S + "focus.field", { area: true, rec: true, max: 1000, value: d.focus || "", ...draftOf("focus") })}${untested("focus")}
${cs.field("gi-purpose", S + "purpose.field", { area: true, rec: true, max: 4000, value: d.purpose || "", ...draftOf("purpose") })}${untested("purpose")}
<fieldset><legend>${W(S + "visibility.field")}</legend>${["members", "public"].map((x) => `<label for="gi-v-${x}"><input type="radio" id="gi-v-${x}" name="gi-v"${(d.visibility === "public" ? "public" : "members") === x ? " checked" : ""}>${W(S + "visibility.choice." + x)}</label>`).join("")}</fieldset>${set}`;
      // the assistant's draft, only while it is reachable, from the administrator's own answers
      const ask = view.reachable ? cs.act("groupdescriptiondraft") : "";
      if (ask) h += `<div data-form="draft"><p>${W(S + "ask.intro")}</p>${["what", "who", "why"].map((q) => cs.field("gi-q-" + q, S + "ask.q." + q, { area: true, rec: true, max: 1000 })).join("")}${ask}</div>`;
      out.push(cs.sec(S + "edit.heading", h));
    }
    return out.join("");
  },

  acts: [
    // the whole record each time (membership R109 appends a record): kinds, the other kind, focus, purpose, visibility
    { op: "groupdescriptionset", rereads: ["description"],
      // R119 (C87 (c)): with no kind ticked and nothing written, the first box to fill is named before any reason is asked
      ready(view, el, cs) {
        const kinds = ["professional", "issue", "community", "catch-all", "other"].filter((k) => cs.value("gi-k-" + k) === true);
        if (!kinds.length && !String(cs.value("gi-other") || "").trim() && !String(cs.value("gi-focus") || "").trim() && !String(cs.value("gi-purpose") || "").trim()) return { refuse: "shell.field.needed", fills: { field: String(cs.w("screen.group-identity.focus.field")).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e])) } };
      },
      send(view, el, cs) {
        const kinds = ["professional", "issue", "community", "catch-all", "other"].filter((k) => cs.value("gi-k-" + k) === true);
        const body = { kinds, visibility: cs.value("gi-v-public") === true ? "public" : "members" };
        const other = String(cs.value("gi-other") || "").trim(), focus = String(cs.value("gi-focus") || "").trim(), purpose = String(cs.value("gi-purpose") || "").trim();
        // never saved empty (C87): with no kind ticked and nothing written, the first box to fill is named
        if (!kinds.length && !other && !focus && !purpose) return { refuse: "shell.field.needed", fills: { field: String(cs.w("screen.group-identity.focus.field")).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e])) } };
        if (other) body.otherKind = other;
        if (focus) body.focus = focus;
        if (purpose) body.purpose = purpose;
        return { body };
      },
      // kept: the words are the group's now, no longer the assistant's draft
      done(view, answer, cs) { if (view.ui && view.ui.draft) cs.set("draft", null); } },
    // the draft from the administrator's answers; nothing is saved until they keep it
    { op: "groupdescriptiondraft", rereads: [],
      send(view, el, cs) {
        const answers = ["what", "who", "why"].map((q) => ({ question: q, text: String(cs.value("gi-q-" + q) || "").trim() })).filter((a) => a.text);
        return answers.length ? { body: { answers } } : { refuse: "screen.group-identity.ask.none" };
      },
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        const me = view.me || {};
        const one = (p) => {
          if (!p || typeof p.text !== "string") return null;
          const by = p.label && p.label.asked_by ? String(p.label.asked_by).replace(/^member:/, "") : me.member;
          return { askedBy: by === me.member && me.handle ? me.handle : cs.memberName(by), untested: !!(p.untested || (a && a.untested)) };
        };
        const draft = { focus: one(a && a.focus), purpose: one(a && a.purpose) };
        if (draft.focus) cs.fill("gi-focus", a.focus.text);
        if (draft.purpose) cs.fill("gi-purpose", a.purpose.text);
        cs.set("draft", draft);
      } },
  ],
};
