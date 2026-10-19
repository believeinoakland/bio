/* screens-settings R61 (T51; N858 D8; DEC-340, U366; K3935; `local-facts` R10–R13, R18, R19): Settings › Places and offices › Your
   team's own rules, the registry's `grouprules`. A deadline or a legal fact the places' rules lack, drafted by one member from its
   primary source and applied only after a different member confirms it. Reads `grouprules` (each rule with its state, drafter,
   dates, source and, R19, the kind it is for and its tier) and the roster (to name who by handle). It draws "Waiting for a second
   member" (a rule the viewer drafted is told so and has no confirm act), "Rules in force" (each with "Withdraw this rule, with a
   reason"), and, to confirm, "Confirm this rule" with, for a rule whose tier is 2 or 3 or unknown, the viewer's own statement of
   what qualifies them, required before the act is sent (the owner records it with that confirmation alone). Every sentence is a
   word read by key (R39). Every function is self-contained (interface-shell R21).
   The draft form (`ruledraft`, and `writinghelp` under it) is held: the drawing's form does not match `ruleFields` and the words hold
   no label for most of its fields (QUESTION J1 of this job, BOB to UX-DESIGN); the acts are listed as the registry lists them. */

export const grouprules = {
  id: "grouprules",

  reads() {
    return { rules: { op: "grouprules" }, roster: { op: "memberlist" } };
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.grouprules.";
    const T = (k, f) => String(W(k, f)).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const D = (iso) => String(cs.date(iso, { year: true })).replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    // a word the list may not hold for this value (a kind or a trigger no word names): null, never the key
    const tryT = (k, f) => { try { return T(k, f); } catch (e) { return null; } };
    const me = view.me || {};
    const data = view.data || {};
    const okv = (o) => (o && o.state === "ok" ? o.value : null);
    const roster = okv(data.roster) && Array.isArray(data.roster.value.members) ? data.roster.value.members : [];
    const today = new Date(typeof cs.now === "function" ? cs.now() : Date.now()).toISOString().slice(0, 10);
    // who, by handle through the roster; the founder by hers, else `member.founder.unnamed`; a stamp the roster does not know, as given
    const who = (id) => {
      const x = String(id == null ? "" : id).replace(/^member:/, "");
      if (x === "admin") { const f = roster.find((r) => r.founder === true || r.member_id === "admin"); return (f && f.handle) || T("member.founder.unnamed"); }
      const m = roster.find((r) => r.member_id === x);
      return m ? m.handle || x : x;
    };
    const out = [cs.title(), `<p class="mk-small">${W(S + "sub1")} ${W(S + "sub2")}</p>`, `<p class="mk-note">${W(S + "note")} ${W(S + "note2")}</p>`];

    out.push(cs.state(data.rules, (v) => {
      const all = Array.isArray(v.rules) ? v.rules : [];
      const waiting = all.filter((r) => r.state === "drafted"), inForce = all.filter((r) => r.state === "confirmed");
      // what the rule is for: the kinds it names (a word where the list holds one, else the id as data), or the section's own name
      const kindOf = (r) => {
        const a = r.applies_to, ids = Array.isArray(a) ? a : a ? [a] : [];
        return ids.map((id) => tryT("screen.start-send.kind." + id) || String(id)).join(", ");
      };
      const forLine = (r) => {
        const k = kindOf(r);
        return k ? W(S + (r.section === "deadlines" ? "deadline.for" : "fact.for"), { kind: k }) : W(S + "kind." + (r.section === "deadlines" ? "deadline" : "fact"));
      };
      const title = (r) => { const e = r.entry || {}; return String(r.section === "deadlines" ? e.rule || "" : e.key || e.statement || ""); };
      const facts = (r) => {
        const e = r.entry || {}, deadline = r.section === "deadlines";
        const trig = e[deadline ? "starts" : "trigger"];
        const tw = trig ? tryT(S + "trigger." + (deadline ? "start." : "fact.") + trig) : null;
        return [
          tw ? W(S + "row.trigger", { trigger: tw }) : "",
          !deadline && e.statement ? W(S + "row.requires", { requires: String(e.statement) }) : "",
          e.citation ? W(S + "row.cite", { citation: String(e.citation) }) : "",
          e.effective_from ? W(S + "row.eff", { date: D(e.effective_from) }) : "",
        ].filter(Boolean).map((x) => `<span class="mk-small">${x}</span>`).join("");
      };
      const src = (r) => (r.source && r.source.captureSha ? cs.ref("document", r.source.captureSha, String(r.source.captureSha).slice(0, 8)) : "");
      const drafted = (r) => (r.drafter === me.member ? W(S + "drafted.you", { date: D(r.drafted_at) }) : W(S + "drafted", { member: who(r.drafter), date: D(r.drafted_at) }));
      let h = "";

      if (waiting.length) {
        const rows = waiting.map((r) => {
          const own = r.drafter === me.member;
          // tier 1 asks no statement; 2, 3 and a kind with none ask the confirmer's own (local-facts R11)
          const needs = r.tier !== 1;
          const act = own ? `<p class="mk-msg" data-note="self">${W(S + "self")}</p>`
            : `${needs ? `${cs.field("gr-q-" + r.rule, S + "qual.label", { help: S + "qual.help", rec: true, max: 500, autocomplete: "off" })}<p class="mk-small">${W(S + "confirm.kept")}</p>` : ""}${cs.act("ruleconfirm", { data: { rule: r.rule, needs: needs ? "1" : "0" } })}`;
          return `<li data-rule="${E(r.rule)}" data-state="drafted"><b class="rec">${E(title(r))}</b><span class="mk-small">${forLine(r)} · ${drafted(r)}${src(r) ? " · " + src(r) : ""}</span>${facts(r)}${act}</li>`;
        }).join("");
        h += cs.sec(S + "waiting", `<ul class="mk-list" data-list="waiting">${rows}</ul><p class="mk-note">${W(S + "inprofile")} ${W(S + "inprofile2")}</p>`, { help: S + "waiting.tip1" });
        // what confirming asks, said once for the page (the drawing's own section)
        if (waiting.some((r) => r.drafter !== me.member)) h += cs.sec(S + "confirm.heading", `<p class="mk-note">${W(S + "confirm.says")}${waiting.some((r) => r.drafter !== me.member && r.tier !== 1) ? " " + W(S + "confirm.qual") : ""}</p>`);
      }

      if (inForce.length) {
        const rows = inForce.map((r) => {
          const e = r.entry || {};
          const later = typeof e.effective_from === "string" && e.effective_from > today;
          return `<li data-rule="${E(r.rule)}" data-state="confirmed"><b class="rec">${E(title(r))}</b><span class="mk-small">${forLine(r)} · ${drafted(r)} · ${W(S + "confirmed", { member: who(r.confirmer), date: D(r.confirmed_at) })}${later ? "" : " · " + W(S + "applies")}${src(r) ? " · " + src(r) : ""}</span>${facts(r)}${cs.act("rulewithdraw", { data: { rule: r.rule } })}</li>`;
        }).join("");
        // the design's heading "Rules in force" is held by no key (REPORT J1): the list is drawn without one until it is
        h += `<div class="cs-section" data-section="inforce"><ul class="mk-list" data-list="inforce">${rows}</ul><p class="mk-note">${W(S + "withdrawn")}</p></div>`;
      }
      return h;
    }));

    out.push(`<p class="mk-note">${W(S + "machine")} ${W(S + "machine2")}</p>`);
    return out.join("");
  },

  // the registry's four acts. `ruledraft` and `writinghelp` are held until the design draws the draft form (QUESTION J1); neither is drawn yet
  acts: [
    { op: "ruleconfirm", rereads: ["rules"],
      send(view, el, cs) {
        const rule = el.dataset.rule;
        const statement = String(cs.value("gr-q-" + rule) || "").trim();
        // tier 2, 3 or none: the confirmer's own statement, required before the act is sent (local-facts R11)
        if (el.dataset.needs === "1") return statement && statement.length <= 500 ? { body: { rule, statement } } : { refuse: "refusal.RULE_NEEDS_QUALIFICATION" };
        return { body: { rule } };
      } },
    { op: "rulewithdraw", rereads: ["rules"],
      send(view, el) { return { body: { rule: el.dataset.rule } }; } },
    { op: "ruledraft", rereads: ["rules"], send() { return { refuse: "screen.grouprules.src.help2" }; } },
    { op: "writinghelp", rereads: [], send() { return null; } },
  ],
};
