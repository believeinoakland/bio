/* screens-settings R61 (T51; N858 D8; DEC-340, U366; K3935; `local-facts` R10–R13, R18, R19): Settings › Places and offices › Your
   team's own rules, the registry's `grouprules`. A deadline or a legal fact the places' rules lack, drafted by one member from its
   primary source and applied only after a different member confirms it. Reads `grouprules` (each rule with its state, drafter,
   dates, source and, R19, the kind it is for and its tier) and the roster (to name who by handle). It draws "Waiting for a second
   member" (a rule the viewer drafted is told so and has no confirm act), "Rules in force" (each with "Withdraw this rule, with a
   reason"), and, to confirm, "Confirm this rule" with, for a rule whose tier is 2 or 3 or unknown, the viewer's own statement of
   what qualifies them, required before the act is sent (the owner records it with that confirmation alone). Every sentence is a
   word read by key (R39). Every function is self-contained (interface-shell R21).
   "Draft the rule" (DEC-357, U386): the member names the rule once (the screen derives the stored `rule` or `key` from the name), chooses
   a deadline or a legal fact and fills its fields (the kinds of action from `rulefields`), chooses the document among the captures held
   (`heldcaptures`) and copies the passage that states the rule exactly; the screen finds those words in the capture's reading
   (`reading`'s `text_units`) and sends their place as `source.extent`. `writinghelp` is offered under "What it says" only while the
   assistant is reachable, never under the passage or the reason. */

export const grouprules = {
  id: "grouprules",

  reads() {
    // the kinds of action a deadline may apply to (local-facts R18) and the captures the member can see, for the draft form
    return { rules: { op: "grouprules" }, roster: { op: "memberlist" }, fields: { op: "rulefields", query: { section: "deadlines" } },
      docs: { op: "heldcaptures", query: { limit: "200", state: "held_and_vouched", fields: "picker" }, empty: (v) => !v || !Array.isArray(v.held) || !v.held.length } };
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.grouprules.";
    const T = (k, f) => String(W(k, f)).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const D = (iso) => String(cs.date(iso, { year: true })).replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    // a word the list may not hold for this value (a kind or a trigger no word names): null, never the key
    const tryT = (k, f) => { try { return T(k, f); } catch (e) { return null; } };
    const me = view.me || {};
    const data = view.data || {};
    const ui = view.ui || {};
    const okv = (o) => (o && o.state === "ok" ? o.value : null);
    const roster = okv(data.roster) && Array.isArray(data.roster.value.members) ? data.roster.value.members : [];
    const today = new Date(typeof cs.now === "function" ? cs.now() : Date.now()).toISOString().slice(0, 10);
    // who, by handle through the roster, else by the kit's `memberName` (C94): the founder by hers or the unnamed word, a member with no
    // handle or one the roster does not hold by the fallback word, never an id
    const who = (id) => {
      const x = String(id == null ? "" : id).replace(/^member:/, "");
      const m = roster.find((r) => r.member_id === x || (x === "admin" && r.founder === true));
      return (m && m.handle) || cs.memberName(x);
    };
    // the owner names a drafter and a confirmer as `member:<id>` (local-facts R10, R11): the viewer's own is told by the id behind the prefix
    const mine = (id) => String(id == null ? "" : id).replace(/^member:/, "") === me.member;
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
      const drafted = (r) => (mine(r.drafter) ? W(S + "drafted.you", { date: D(r.drafted_at) }) : W(S + "drafted", { member: who(r.drafter), date: D(r.drafted_at) }));
      let h = "";

      if (waiting.length) {
        const rows = waiting.map((r) => {
          const own = mine(r.drafter);
          // tier 1 asks no statement; 2, 3 and a kind with none ask the confirmer's own (local-facts R11)
          const needs = r.tier !== 1;
          const act = own ? `<p class="mk-msg" data-note="self">${W(S + "self")}</p>`
            : `${needs ? `${cs.field("gr-q-" + r.rule, S + "qual.label", { help: S + "qual.help", rec: true, max: 500, autocomplete: "off" })}<p class="mk-small">${W(S + "confirm.kept")}</p>` : ""}${cs.act("ruleconfirm", { data: { rule: r.rule, needs: needs ? "1" : "0" } })}`;
          return `<li data-rule="${E(r.rule)}" data-state="drafted"><b class="rec">${E(title(r))}</b><span class="mk-small">${forLine(r)} · ${drafted(r)}${src(r) ? " · " + src(r) : ""}</span>${facts(r)}${act}</li>`;
        }).join("");
        h += cs.sec(S + "waiting", `<ul class="mk-list" data-list="waiting">${rows}</ul><p class="mk-note">${W(S + "inprofile")} ${W(S + "inprofile2")}</p>`, { help: S + "waiting.tip1" });
        // what confirming asks, said once for the page (the drawing's own section)
        if (waiting.some((r) => !mine(r.drafter))) h += cs.sec(S + "confirm.heading", `<p class="mk-note">${W(S + "confirm.says")}${waiting.some((r) => !mine(r.drafter) && r.tier !== 1) ? " " + W(S + "confirm.qual") : ""}</p>`);
      }

      if (inForce.length) {
        const rows = inForce.map((r) => {
          const e = r.entry || {};
          const later = typeof e.effective_from === "string" && e.effective_from > today;
          return `<li data-rule="${E(r.rule)}" data-state="confirmed"><b class="rec">${E(title(r))}</b><span class="mk-small">${forLine(r)} · ${drafted(r)} · ${W(S + "confirmed", { member: who(r.confirmer), date: D(r.confirmed_at) })}${later ? "" : " · " + W(S + "applies")}${src(r) ? " · " + src(r) : ""}</span>${facts(r)}${cs.act("rulewithdraw", { data: { rule: r.rule } })}</li>`;
        }).join("");
        h += cs.sec(S + "inforce", `<ul class="mk-list" data-list="inforce">${rows}</ul><p class="mk-note">${W(S + "withdrawn")}</p>`);
      }
      return h;
    }));


    // "Draft the rule" (R61; DEC-357): one name, a deadline or a legal fact, the document and the passage that states it, and why
    const dr = ui.draft && ui.draft.field === "statement" ? ui.draft : null;
    const kindName = (id) => tryT("screen.action.kind." + id) || String(id);
    const choiceOf = (id, label, list, o) => cs.choice(id, S + label, list.map(([v, k]) => [v, S + k]), o || {});
    const help = (...ks) => `<p class="mk-small">${ks.map((k) => W(S + k)).join(" ")}</p>`;
    const draftIt = cs.act("ruledraft");
    if (draftIt) {
      const kv = data.fields && data.fields.state === "ok" && data.fields.value ? (() => { const f = (Array.isArray(data.fields.value.fields) ? data.fields.value.fields : []).find((x) => x.field === "applies_to"); return Array.isArray(f && f.choices) ? f.choices.map(String) : []; })() : [];
      const appOpts = kv.map((id) => ({ value: id, text: id === "claim" ? T(S + "app.claim") : kindName(id) }));
      const bearOpts = kv.filter((id) => id !== "claim").map((id) => ({ value: id, text: kindName(id) }));
      // G20 (K4571): the picker is the page `reads()` asked for and, while the answer says `truncated` with a `next`, the pages the cursor names
      // (1000 rows each, twice at most, kept in `view.ui.later` and drawn on arrival); past that it says how many it shows, and a search narrows by title
      const first = okv(data.docs) && Array.isArray(data.docs.value.held) ? data.docs.value : null;
      const held = first ? first.held.slice() : [];
      const L = view.ui.later || (view.ui.later = {});
      let cur = first, k = 1, waiting = false;
      while (cur && cur.truncated && typeof cur.next === "string" && cur.next && k < 3) {
        const key = "docs:" + k, query = { state: "held_and_vouched", fields: "picker", limit: "1000", after: cur.next }, qs = JSON.stringify(query);
        if (!L[key] || L[key].q !== qs) {
          L[key] = { q: qs, state: "loading", value: null };
          const settle = (x) => { L[key] = Object.assign({ q: qs }, x); cs.set("later", L); };
          cs.call("heldcaptures", { query }).then((a) => {
            const r = a && typeof a === "object" && a.result !== undefined ? a.result : a;
            settle(a && a.ok !== false && r && typeof r === "object" && r.ok !== false && Array.isArray(r.held) ? { state: "ok", value: r } : { state: "failed", value: null });
          }, () => settle({ state: "failed", value: null }));
        }
        const x = L[key];
        if (x.state !== "ok") { waiting = x.state === "loading"; break; }
        for (const r of x.value.held) held.push(r);
        cur = x.value; k++;
      }
      const moreDocs = !waiting && !!(cur && cur.truncated);
      const docs = held.filter((r) => r && r.capture && typeof r.capture.sha256 === "string" && r.capture.sha256).map((r) => ({ value: r.capture.sha256, text: r.title || "" }));
      const docQ = String(ui.docq || "").trim().toLowerCase();
      const shownDocs = docQ ? docs.filter((d) => d.text.toLowerCase().includes(docQ)) : docs;
      const timeEg = new Date(Date.UTC(2000, 0, 1, 17, 0)).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
      let f = "";
      f += choiceOf("gr-kind", "kind.label", [["deadline", "kind.deadline"], ["fact", "kind.fact"]]) + help("kind.help1", "kind.help2");
      f += cs.field("gr-name", S + "name.label", { help: S + "name.help1", max: 80, autocomplete: "off" }) + help("name.help2");
      f += `<fieldset><legend>${W(S + "deadline.legend")}</legend>`
        + (data.fields && data.fields.state !== "ok" ? cs.state(data.fields, () => "") : cs.choice("gr-app", S + "app.label", appOpts, {}) + help("app.help1"))
        + cs.field("gr-amount", S + "amount.label", { help: S + "amount.help1", max: 6, autocomplete: "off" })
        + choiceOf("gr-units", "units.label", ["days", "hours", "business_hours", "months", "years"].map((u) => [u, "units." + u]))
        + choiceOf("gr-count", "count.label", [["calendar", "count.calendar"], ["business", "count.business"]]) + help("count.help1")
        + choiceOf("gr-start", "start.label", ["received", "filed", "act", "known", "entered", "served", "hearing"].map((x) => [x, "trigger.start." + x])) + help("start.help1")
        + choiceOf("gr-dir", "dir.label", [["forward", "dir.forward"], ["backward", "dir.backward"]]) + help("dir.help1", "dir.help2")
        + choiceOf("gr-owed", "owed.label", [["none", "owed.none"], ["body", "owed.body"], ["group", "owed.group"]])
        + choiceOf("gr-due", "due.label", [["none", "due.none"], ["cob", "due.cob"], ["time", "due.time"]])
        + cs.field("gr-time", S + "due.time", { max: 12, autocomplete: "off" }) + `<p class="mk-small">${W(S + "due.help1", { time: timeEg })}</p>`
        + "</fieldset>";
      f += `<details class="mk-details" data-fold="fact"><summary>${W(S + "fact.summary")}</summary>`
        + choiceOf("gr-shown", "shown.label", ["paid_attendee", "recording", "threat_letter", "pending_measure_or_candidate", "serial_meeting"].map((x) => [x, "trigger.fact." + x])) + help("shown.help1")
        + cs.field("gr-statement", S + "statement.label", { area: true, rec: true, max: 1000, value: dr ? dr.text : "", ...(dr ? { draft: "screen.group-identity.draft.label", draftFills: { handle: dr.askedBy } } : {}) })
        + (dr && dr.untested ? ` <span class="mk-tag">${W("ai.label.untested")}</span>` : "") + (view.reachable ? cs.act("writinghelp", { data: { field: "statement", id: "gr-statement" } }) : "")
        + help("statement.help1", "statement.help2")
        + (bearOpts.length ? cs.checks("gr-bears", S + "bears.legend", bearOpts, {}) + help("bears.help1") : "")
        + "</details>";
      f += cs.field("gr-cite", S + "cite.label", { help: S + "cite.help1", max: 200, autocomplete: "off" });
      f += cs.field("gr-eff", S + "eff.label", { help: S + "eff.help1", max: 10, autocomplete: "off" });
      f += `<div data-part="source">`
        + cs.checks("gr-src", S + "src.legend", [["held", S + "src.held", true], ["first", S + "src.first", false]], { radio: true }) + help("src.help2")
        + (docs.length > 1 ? cs.field("gr-doc-q", "form.choose.search", { value: String(ui.docq || ""), typing: (cs2, view2, value) => { cs2.set("docq", String(value || "").trim()); } }) : "")
        + (!docs.length ? cs.state({ state: "empty" }, () => "")
          : shownDocs.length ? cs.choice("gr-doc", S + "doc.label", shownDocs, {}) + help("doc.help1")
          : `<p class="mk-small" data-note="nodocs">${W("form.choose.search.none")}</p>`)
        + (moreDocs ? `<p class="mk-small" data-docs-more>${W("screen.people.more", { n: String(docs.length) })}</p>` : "")
        + cs.field("gr-pass", S + "pass.label", { area: true, rec: true, max: 4000, help: S + "pass.help1" }) + help("pass.help2")
        + (ui.passMiss ? `<p class="mk-msg" data-note="passage">${W(S + "pass.notfound2")}</p>` : "")
        + "</div>";
      f += cs.field("gr-why", S + "why.label", { area: true, rec: true, max: 500 });
      out.push(cs.sec(S + "draft", `<div data-form="draft">${f}${draftIt}</div>`));
    }
    out.push(`<p class="mk-note">${W(S + "machine")} ${W(S + "machine2")}</p>`);
    return out.join("");
  },

  // the registry's four acts. `ruledraft` and `writinghelp` are held until the design draws the draft form (QUESTION J1); neither is drawn yet
  acts: [
    { op: "ruleconfirm", rereads: ["rules"],
      ready(view, el, cs) {
        const statement = String(cs.value("gr-q-" + el.dataset.rule) || "").trim();
        if (el.dataset.needs === "1" && !(statement && statement.length <= 500)) return { refuse: "refusal.RULE_NEEDS_QUALIFICATION" };
      },
      send(view, el, cs) {
        const rule = el.dataset.rule;
        const statement = String(cs.value("gr-q-" + rule) || "").trim();
        // tier 2, 3 or none: the confirmer's own statement, required before the act is sent (local-facts R11)
        if (el.dataset.needs === "1") return statement && statement.length <= 500 ? { body: { rule, statement } } : { refuse: "refusal.RULE_NEEDS_QUALIFICATION" };
        return { body: { rule } };
      } },
    { op: "rulewithdraw", rereads: ["rules"],
      send(view, el) { return { body: { rule: el.dataset.rule } }; } },
    // the member's own words in the reason field are the act's reason (interface-shell R87)
    { op: "ruledraft", rereads: ["rules"], reasonField: "reason",
      async send(view, el, cs) {
        const val = (id) => String(cs.value(id) || "").trim();
        const one = (id) => { const v = cs.value(id); return Array.isArray(v) ? String(v[0] || "") : String(v || ""); };
        const fact = one("gr-kind") === "fact";
        // the one name the member gives; the stored `rule` or `key` is derived from it (a letter first, then letters, digits and _)
        // an empty box is refused naming it (C87): the box's own label, as plain text
        const plain = (t) => String(t).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
        const missing = (labelKey) => ({ refuse: "shell.field.needed", fills: { field: plain(cs.w(labelKey)) } });
        let slug = val("gr-name").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
        if (!slug) return missing("screen.grouprules.name.label");
        if (!/^[a-z]/.test(slug)) slug = "r_" + slug;
        if (fact && !val("gr-statement")) return missing("screen.grouprules.statement.label");
        if (!fact && !val("gr-amount")) return missing("screen.grouprules.amount.label");
        if (!val("gr-cite")) return missing("screen.grouprules.cite.label");
        if (!val("gr-eff")) return missing("screen.grouprules.eff.label");
        const entry = fact ? { key: slug, trigger: one("gr-shown"), statement: val("gr-statement") } : { rule: slug, applies_to: one("gr-app") };
        if (fact) { const bears = (cs.value("gr-bears") || []).map(String); if (bears.length) entry.applies_to = bears; }
        else {
          const units = one("gr-units"), amount = val("gr-amount");
          if (!/^[1-9][0-9]*$/.test(amount)) return { refuse: "screen.grouprules.amount.help1" };
          Object.assign(entry, { units, amount: Number(amount), starts: one("gr-start"), direction: one("gr-dir") });
          if (units === "days") entry.count = one("gr-count");
          if (one("gr-owed") !== "none") entry.owed_by = one("gr-owed");
          const due = one("gr-due");
          if (due === "cob") entry.due_at = "close_of_business";
          else if (due === "time") {
            // a set time, typed on the 12-hour clock (or 24-hour), sent as HH:MM
            const m = /^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m?\.?$/i.exec(val("gr-time")) || /^(\d{1,2}):(\d{2})()$/.exec(val("gr-time"));
            let h = m ? Number(m[1]) : NaN; const min = m ? Number(m[2] || 0) : NaN;
            if (m && m[3]) { if (h < 1 || h > 12) h = NaN; else h = (h % 12) + (m[3].toLowerCase() === "p" ? 12 : 0); }
            if (!(h >= 0 && h <= 23 && min >= 0 && min <= 59)) return { refuse: "screen.grouprules.due.help1", fills: { time: new Date(Date.UTC(2000, 0, 1, 17, 0)).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }) } };
            entry.due_at = String(h).padStart(2, "0") + ":" + String(min).padStart(2, "0");
          }
        }
        entry.citation = val("gr-cite"); entry.effective_from = val("gr-eff");
        // the source: the capture chosen, and the place of the passage copied, found in its reading's text units
        const sha = one("gr-doc").toLowerCase();
        if (one("gr-src") === "first" || !/^[0-9a-f]{64}$/.test(sha)) return { refuse: "screen.grouprules.src.refuse" };
        const norm = (t) => String(t || "").replace(/\s+/g, " ").trim();
        const want = norm(cs.value("gr-pass"));
        if (!want) return missing("screen.grouprules.pass.label");
        if (!val("gr-why")) return missing("screen.grouprules.why.label");
        const a = want ? await cs.call("reading", { query: { sha256: sha } }) : null;
        const r = a && a.result !== undefined ? a.result : a;
        const unit = r && Array.isArray(r.text_units) ? r.text_units.find((u) => u && u.extent && typeof u.extent === "object" && norm(u.text).includes(want)) : null;
        if (!unit) { cs.set("passMiss", true); return { refuse: "screen.grouprules.pass.notfound1" }; }
        if (view.ui && view.ui.passMiss) cs.set("passMiss", false);
        return { body: { section: fact ? "legal_facts" : "deadlines", entry, source: { captureSha: sha, extent: unit.extent }, reason: val("gr-why") } };
      } },
    // the draft of "What it says" only (an exact copy of the source and the reason are never drafted); kept only by the member's own `ruledraft`
    { op: "writinghelp", rereads: [], reasonField: "told",
      send(view, el, cs) {
        const told = String(cs.value("gr-statement") || "").trim();
        if (!told) return { refuse: "screen.grouprules.statement.help1" };
        return { body: { op: "ruledraft", field: "statement", told } };
      },
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        const me = view.me || {};
        const by = a && a.label && a.label.asked_by ? String(a.label.asked_by).replace(/^member:/, "") : me.member;
        if (a && typeof a.text === "string") cs.fill("gr-statement", a.text);
        cs.set("draft", { field: "statement", text: (a && a.text) || "", askedBy: by === me.member && me.handle ? me.handle : cs.memberName(by), untested: !!(a && (a.untested || (a.label && a.label.untested))) });
      } },
  ],
};
