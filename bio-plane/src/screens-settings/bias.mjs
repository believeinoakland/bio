/* screens-settings R65 (T51 FR-25; C47; DEC-374 (B398), DEC-378 (B401); `bias` R11–R21, R35, R36; `interface-shell` R106): Settings ›
   Declared bias, the registry's `bias` (`SCR.bias`). The lens the team reads evidence through, stated so a reader can discount it; it
   never blocks work. One page, four parts: what is in force for the whole team or one project (`biasmanifest`, asked by the choice and
   its button); writing a set and saving it offered for adoption (`promote` of a bias bundle), and adopting the set just saved
   (`biasadopt`); drafting statements from an outside policy (`biasinhale`: proposals, nothing saved, offered or adopted; "Start a set
   from these" promotes them as a draft); and a work product made under an earlier lens (`biasdebt`, the address `/app/bias/<run>`) with
   the reason to settle it (`biasdebtresolve`). Every sentence is a word read by key (R39). The design's headings and labels that
   `words.json` does not yet hold are drawn without them (REPORTED, J11), never as the key or as English written here. A set holds one
   statement in this form (the drawing's). The sets the team offered earlier are listed through `retrieval`'s `list` (`type: "bias"`,
   `state: "proposed"`, page after page by its cursor, at most five pages), so one is adoptable without writing it again, with the set
   just saved first. Every function is self-contained (interface-shell R21). */

export const bias = {
  id: "bias",

  reads(view) {
    const ui = view.ui || {};
    // the lens in force: the whole team's, else the project chosen (asked again after the choice's button, `scope` held in the page)
    const sc = ui.scope && ui.scope.project ? { scope: "project", scopeId: String(ui.scope.project) } : { scope: "instance" };
    const r = {
      lens: { op: "biasmanifest", query: sc },
      projects: { op: "projectlist", empty: (v) => !v || !Array.isArray(v.projects) || !v.projects.length },
      // the bias sets the team offered earlier (first page; the rest are read by the page as the cursor says)
      earlier: { op: "list", query: { type: "bias", state: "proposed", limit: 50 } },
    };
    // a work product made under an earlier lens, named by the address (the bias-debt reference of interface-shell R106)
    if (view.subject) r.debt = { op: "biasdebt", query: { run: String(view.subject) } };
    return r;
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, B = "screen.bias.";
    const T = (k, f) => String(W(k, f)).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const D = (iso) => String(cs.date(iso, { year: true })).replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const data = view.data || {};
    const ui = view.ui || {};
    const okv = (o) => (o && o.state === "ok" ? o.value : null);
    const icon = (k) => (typeof cs.icon === "function" ? cs.icon(k) : "");
    const data1 = (x) => `<span class="mk-data">${E(String(x))}</span>`;
    const gap = (kind, inner) => `<div class="cs-gap" data-gap="${kind}">${inner}</div>`;
    // the kinds of statement, by the design's long forms (the short names are not held)
    const KINDS = ["scrutiny", "inference", "pattern"];
    const kindWord = (k) => (KINDS.indexOf(k) >= 0 ? W(B + { scrutiny: "scrutiny_how_closely_we_read", inference: "inference_what_we_do_not", pattern: "pattern_how_a_source_has" }[k]) : E(String(k)));
    const projects = okv(data.projects) && Array.isArray(okv(data.projects).projects) ? okv(data.projects).projects : [];
    const projTitle = (p) => String((p && (p.title || p.name)) || (p && p.id) || "");
    const projectOf = (id) => projects.find((p) => String(p.id) === String(id)) || null;
    const out = [cs.title(), `<p class="mk-sub">${W(B + "the_lens_your_team_reads")} ${W(B + "it_never_blocks_work")}</p>`];

    // ---- the lens in force (R65: biasmanifest) ----
    const scopeOpts = [{ value: "instance", key: B + "the_whole_team_an_administrator" }, ...projects.map((p) => ({ value: String(p.id), text: projTitle(p) }))];
    const acts = {};
    for (const o of scopeOpts) acts[o.value] = "biasmanifest";
    const chosen = ui.scope && ui.scope.project ? String(ui.scope.project) : "instance";
    const choice = cs.choice("bi-scope", "", scopeOpts, { acts, value: chosen, act: { label: "act.biasmanifest.label.bias" } });
    const lens = okv(data.lens);
    let lensHtml = cs.state(data.lens, (v) => {
      if (v.in_force === false) {
        const p = ui.scope && ui.scope.project ? projectOf(ui.scope.project) : null;
        return `<p data-state="nolens">${p ? W(B + "no_lens_is_in_force", { project: projTitle(p) }) : ""}</p><p class="mk-note">${W(B + "a_case_published_now_says")}</p>`;
      }
      if (v.in_force !== true) return `<p class="cs-state" data-state="failed" role="alert">${W("shell.unread")}</p>`;
      const stmts = Array.isArray(v.statements) ? v.statements : [];
      const bundles = Array.isArray(v.bundles) ? v.bundles : [];
      const residue = Array.isArray(v.residue) ? v.residue : [];
      const rows = stmts.map((s) => cs.row(icon("flagged"), `<b>${kindWord(s.kind)}</b> · ${data1(s.subject)}<span class="rec" style="display:block">“${E(s.text || "")}”</span>`, "", s.justification ? `<span class="rec">${E(s.justification)}</span>` : "")).join("");
      let h = cs.sheet(rows);
      // who adopted what, and when (the owner's adoptions, by member id as data)
      if (bundles.length) h += `<dl class="mk-dl"><dt>${W("screen.standard.state.adopted")}</dt>${bundles.map((b) => `<dd>${data1(String(b.adopted_by || "").replace(/^member:/, ""))} · ${data1(D(b.adopted_at))}</dd>`).join("")}`;
      else h += `<dl class="mk-dl">`;
      const stated = residue.filter((x) => x && x.stated && x.text);
      if (stated.length) h += `<dt>${W(B + "what_this_set_does_not")}</dt>${stated.map((x) => `<dd><span class="rec">${E(x.text)}</span></dd>`).join("")}`;
      if (v.statements_sha) h += `<dd>${data1(String(v.statements_sha).slice(0, 4) + "…" + String(v.statements_sha).slice(-4))} · ${W(B + "the_same_lens_gives_the")}</dd>`;
      h += `</dl>`;
      // a project statement that met a locked one, and a set adopted while only offered
      if (Array.isArray(v.lock_violations) && v.lock_violations.length) h += `<details class="mk-details"><summary>${W(B + "when_a_project_statement_meets")}</summary>${gap("refused", `<span>${W(B + "a_project_statement_that_replaces")} ${W(B + "the_page_lists_it_so")}</span>`)}</details>`;
      if (Array.isArray(v.pins_proposed) && v.pins_proposed.length) h += `<details class="mk-details"><summary>${W(B + "when_an_adopted_set_is")}</summary><p class="mk-note">${W(B + "a_set_that_was_adopted")} ${W(B + "this_page_then_lists_it")}</p></details>`;
      return h;
    });
    out.push(`<div data-part="lens">${choice}${lensHtml}<p class="mk-note">${W(B + "to_adopt_write_or_draft")} ${W(B + "your_queue_tells_you_when")}</p></div>`);

    // ---- writing a set, and adopting it (R65: promote, biasadopt) ----
    const save = cs.act("promote", { label: "act.promote.label.bias", tone: "primary", data: { from: "write" } });
    if (save) {
      const help = (id, field) => (view.reachable ? cs.act("writinghelp", { data: { field, id } }) : "");
      const dr = ui.draft || null;
      let w = `<p class="mk-sub">${W(B + "a_set_is_a_list")} ${W(B + "a_set_stays_a_draft")}</p>`
        + cs.field("bi-name", B + "name_of_the_set", { autocomplete: "off" })
        + cs.choice("bi-kind", "", KINDS.map((k) => ({ value: k, key: B + { scrutiny: "scrutiny_how_closely_we_read", inference: "inference_what_we_do_not", pattern: "pattern_how_a_source_has" }[k] })), { value: "scrutiny" })
        + `<p class="mk-small">${W(B + "a_pattern_statement_must_cite")}</p>`
        + cs.field("bi-subject", B + "who_or_what_it_is", { autocomplete: "off", help: B + "someone_or_something_the_teams" }) + `<p class="mk-small">${W(B + "add_it_under_people_first")}</p>`
        + cs.field("bi-text", "", { area: true, rec: true, help: B + "say_how_you_read_it", value: dr && dr.field === "text" ? dr.text : undefined }) + `<p class="mk-small">${W(B + "do_not_say_a_source")}</p>${help("bi-text", "text")}`
        + cs.field("bi-why", B + "why_you_read_it_this", { area: true, rec: true, help: B + "required_for_every_statement", value: dr && dr.field === "justification" ? dr.text : undefined }) + help("bi-why", "justification")
        + cs.field("bi-cite", "", { help: B + "required_for_a_pattern_statement", autocomplete: "off" })
        + cs.field("bi-not", B + "what_this_set_does_not", { area: true, rec: true, help: B + "required_before_the_set_is" }) + `<p class="mk-small">${W(B + "readers_see_it_beside_the")}</p>`
        + `<div class="mk-acts">${save}</div>`
        + `<details class="mk-details"><summary>${W(B + "when_a_set_cannot_be")}</summary>${gap("refused", `<span>${W(B + "a_statement_in_it_says")} ${W(B + "nothing_was_saved_offered_or")} ${W(B + "reword_that_statement_to_say")}</span>`)}${gap("refused", `<span>${W(B + "a_statement_has_no_reason")} ${W(B + "nothing_was_saved_offered_or")} ${W(B + "add_what_it_asks_for")}</span>`)}</details>`;
      // adopting a set that was offered: the one just saved, else any the team offered earlier (`list`, followed by its cursor, five pages at most)
      const saved = ui.saved || null;
      const adopt = cs.act("biasadopt", { label: "act.biasadopt.label.bias", tone: "primary" });
      const later = (key, query) => {
        const L = ui.later || (ui.later = {});
        const q = JSON.stringify(query);
        if (!L[key] || L[key].q !== q) {
          L[key] = { q, state: "loading" };
          const settle = (o) => { L[key] = Object.assign({ q }, o); cs.set("later", L); };
          cs.call("list", { query }).then((a) => {
            const r = a && a.result !== undefined ? a.result : a;
            if (!r || r.ok === false) settle({ state: "failed" }); else settle({ state: "ok", value: r });
          }, () => settle({ state: "failed" }));
        }
        return L[key];
      };
      const sets = [];
      let earlierState = "ok";
      if (saved) sets.push({ id: saved.bundleId, title: saved.name || "", at: "" });
      if (adopt) {
        let page = okv(data.earlier);
        if (!page && data.earlier && data.earlier.state === "failed") earlierState = "failed";
        for (let n = 0; page && n < 5; n++) {
          const rows = Array.isArray(page) ? page : Array.isArray(page.bundles) ? page.bundles : [];
          for (const b of rows) if (b && b.object_type === "bias" && b.current_state === "proposed" && b.bundle_id && !sets.some((x) => x.id === b.bundle_id)) sets.push({ id: String(b.bundle_id), title: String(b.title || b.bundle_id), at: b.last_updated || "" });
          const after = !Array.isArray(page) && page.cursor ? String(page.cursor) : "";
          if (!after || n === 4) break;
          const next = later("earlier:" + n, { type: "bias", state: "proposed", limit: 50, after });
          if (next.state !== "ok") { earlierState = next.state; break; }
          page = next.value;
        }
      }
      if (adopt && earlierState === "failed" && !sets.length) w += `<p class="cs-state" data-state="failed" role="alert">${W("shell.unread")}</p>`;
      if (adopt && sets.length) {
        const radios = [{ value: "instance", key: B + "the_whole_team_an_administrator", on: true }, ...projects.map((p) => ({ value: String(p.id), key: B + "one_project_the_coliseum_lease", fills: { project: projTitle(p) } }))];
        w += `<div data-part="adopt">`
          + cs.checks("bi-set", "", sets.map((x, i) => ({ value: x.id, text: x.at ? x.title + " · " + D(x.at) : x.title, on: i === 0 })), { radio: true })
          + cs.checks("bi-adopt", "", radios, { radio: true })
          + cs.field("bi-adwhy", B + "why_you_adopt_it", { area: true, rec: true, help: B + "required_up_to_characters" }) + `<p class="mk-small">${W(B + "it_is_kept_with_the")}</p>`
          + `<div class="mk-acts">${adopt}</div>`
          + `<p class="mk-small">${W(B + "adopting_names_the_revision_in")} ${W(B + "later_changes_to_the_set")} ${W(B + "adopting_a_different_set_for")}</p>`
          + `<details class="mk-details"><summary>${W(B + "when_you_cannot_adopt_it")}</summary>${gap("refused", `<span>${W(B + "only_an_administrator_adopts_a")} ${W(B + "ask_one_or_adopt_it")}</span>`)}${gap("refused", `<span>${W(B + "only_an_owner_of_a")}</span>`)}${gap("refused", `<span>${W(B + "the_set_must_be_offered")} ${W(B + "save_it_and_offer_it")}</span>`)}</details></div>`;
      }
      out.push(`<div data-part="write">${w}</div>`);
    }

    // ---- drafting from an outside policy (R65: biasinhale) ----
    const inhale = cs.act("biasinhale", { label: "act.biasinhale.label.bias", tone: "primary" });
    if (inhale) {
      let c = `<p class="mk-sub">${W(B + "paste_another_organizations_policy")} ${W(B + "civicsmith_proposes_statements_from_it")} ${W(B + "nothing_is_saved_offered_or")}</p>`
        + cs.field("bi-policy", B + "the_policy_in_its_own", { area: true })
        + cs.field("bi-source", B + "where_it_comes_from", { help: B + "kept_with_the_set_so", autocomplete: "off" })
        + cs.field("bi-when", B + "when_you_read_it", { autocomplete: "off" })
        + `<div class="mk-acts">${inhale}</div>`;
      const pr = ui.proposal || null;
      if (pr) {
        const props = Array.isArray(pr.statements) ? pr.statements : [];
        const start = props.length ? cs.act("promote", { label: B + "start_a_set_from_these", data: { from: "inhale" } }) : "";
        if (props.length) c += cs.sheet(props.map((s, i) => cs.row(icon("flagged"), `<b>${kindWord(s.kind)}</b><span class="rec" style="display:block">“${E(s.text || "")}”</span><span class="meta">${W(B + "proposed_not_yet_yours")} ${W(B + "choose_who_it_is_about")}</span>`
          + cs.field("bi-psub" + i, B + "who_or_what_it_is", { autocomplete: "off" }) + cs.field("bi-pwhy" + i, B + "why_you_read_it_this", { area: true, rec: true }))).join("")) + `<p class="mk-note">${W(B + "a_pattern_statement_is_never")}</p>${start}`;
        const bars = Array.isArray(pr.bars) ? pr.bars : [], left = Array.isArray(pr.residue) ? pr.residue : [];
        if (bars.length || left.length) {
          c += `<dl class="mk-dl">${bars.map((b) => `<dd><span class="rec">“${E(b.text || "")}”</span> ${W(B + "it_says_how_strong_support")} ${W(B + "that_is_a_bar_which")}</dd>`).join("")}`
            + `${left.map((x) => `<dd><span class="rec">“${E(x.text || "")}”</span> ${x.check ? W(B + "it_says_a_source_is") + " " + W(B + "a_lens_never_says_that") : E(x.why || "")}</dd>`).join("")}</dl>`
            + `<p class="mk-small">${W(B + "sentences_that_could_not_become")} ${W(B + "you_can_still_write_your")}</p>`;
        }
        c += `<p class="mk-note">${W(B + "nothing_was_saved_offered_or")} ${W(B + "starting_a_set_from_these")}</p>`;
      }
      out.push(`<div data-part="inhale">${cs.sec(B + "draft_a_set_from_an", c)}</div>`);
    }

    // ---- work made under an earlier lens (R65: biasdebt, biasdebtresolve) ----
    if (view.subject) {
      out.push(`<div data-part="debt">` + cs.sec(B + "work_made_under_an_earlier", `<p class="mk-sub">${W(B + "your_teams_lens_changed_after")} ${W(B + "say_whether_the_change_bears")} ${W(B + "it_is_disclosed_to_readers")}</p>`
        + cs.state(data.debt, (d) => {
          const settlements = Array.isArray(d.settlements) ? d.settlements : [];
          // the owner's answer for work with no debt this reader can open: nothing is drawn of it
          if (d.found === false) return "";
          const open = d.open === true;
          const rec = cs.act("biasdebt", { label: "act.biasdebt.label.bias", data: { run: String(view.subject) } });
          const resolve = open ? cs.act("biasdebtresolve", { label: "act.biasdebtresolve.label.bias", tone: "primary", data: { run: String(view.subject) } }) : "";
          let h = cs.sheet(cs.row(icon(open ? "flagged" : "accepted"), `${data1(view.subject)}${d.lens_then ? ` · ${data1(String(d.lens_then).slice(0, 8))}` : ""}${d.lens_now ? ` · ${data1(String(d.lens_now).slice(0, 8))}` : ""}`, rec || ""));
          if (open) {
            h += `<h3>${W(B + "waiting_for_your_word")}</h3>` + cs.field("bi-dreason", "shell.reason", { area: true, rec: true, help: B + "required_up_to_characters2" }) + `<p class="mk-small">${W(B + "say_why_the_lens_change")} ${W(B + "this_is_the_whole_of")}</p><div class="mk-acts">${resolve}</div>`
              + `<p class="mk-small">${W(B + "this_cannot_be_undone_your")} ${W(B + "the_assistant_cannot_settle_it")} ${W(B + "if_you_would_rather_re")}</p>`
              + `<details class="mk-details"><summary>${W(B + "when_it_cannot_be_settled")}</summary>${gap("refused", `<span>${W(B + "you_gave_no_reason")} ${W(B + "write_why_the_change_does")}</span>`)}${gap("refused", `<span>${W(B + "someone_settled_it_already_or")} ${W(B + "open_your_queue_to_see")}</span>`)}</details>`;
          }
          const done = settlements.filter((x) => x && x.reason);
          if (done.length) h += cs.sheet(done.map((x) => cs.row(icon("accepted"), `${data1(String(x.actor || x.by || "").replace(/^member:/, ""))} · ${data1(D(x.at))}<span class="rec" style="display:block">“${E(x.reason)}”</span>`)).join(""));
          return h;
        })) + `</div>`);
    }
    return out.join("");
  },

  acts: [
    // the lens for the choice made: the whole team's, or one project's; the page then reads it again
    { op: "biasmanifest", rereads: ["lens"],
      send(view, el, cs) {
        const v = String(cs.value("bi-scope") || "instance");
        cs.set("scope", v === "instance" ? null : { project: v });
        return { query: v === "instance" ? { scope: "instance" } : { scope: "project", scopeId: v } };
      } },
    // a bias bundle written as a set and offered (`from: write`), or the proposals of an outside policy started as a draft (`from: inhale`)
    { op: "promote", rereads: [],
      send(view, el, cs) {
        const iso = new Date(cs.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
        const nonce = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
        const q = (s) => JSON.stringify(String(s));
        const fromInhale = el.dataset.from === "inhale";
        let statements = [], title = "", state = "proposed", residue = "";
        const subjectOf = async (typed) => {
          const t = String(typed || "").trim();
          if (/^ENT-\d{4}-\d+$/.test(t)) return t;
          if (!t) return null;
          const r = await cs.call("entitybyalias", { query: { alias: t } });
          const a = r && r.result !== undefined ? r.result : r;
          const list = a && Array.isArray(a.entities) ? a.entities : a && Array.isArray(a.matches) ? a.matches : [];
          const first = list[0];
          return first ? String(first.entity_id || first.id || "") || null : null;
        };
        return (async () => {
          if (fromInhale) {
            // the proposals, each with the subject and reason the member gave; a draft needs no citation
            const pr = (view.ui && view.ui.proposal && view.ui.proposal.statements) || [];
            state = "draft"; title = String(cs.value("bi-source") || "").trim() || "Draft";
            for (let i = 0; i < pr.length; i++) {
              const subject = await subjectOf(cs.value("bi-psub" + i)), why = String(cs.value("bi-pwhy" + i) || "").trim();
              if (!subject) return { refuse: "screen.bias.add_it_under_people_first" };
              if (!why) return { refuse: "screen.bias.a_statement_has_no_reason" };
              statements.push({ id: "s" + (i + 1), kind: pr[i].kind, subject, text: pr[i].text, justification: why, citations: [], locked: false });
            }
          } else {
            const kind = String(cs.value("bi-kind") || "scrutiny");
            title = String(cs.value("bi-name") || "").trim();
            const text = String(cs.value("bi-text") || "").trim(), why = String(cs.value("bi-why") || "").trim(), cite = String(cs.value("bi-cite") || "").trim();
            const subject = await subjectOf(cs.value("bi-subject"));
            if (!title || !text) return { refuse: "screen.bias.a_statement_has_no_reason" };
            if (!subject) return { refuse: "screen.bias.add_it_under_people_first" };
            statements = [{ id: "s1", kind, subject, text, justification: why, citations: cite ? [cite] : [], locked: false }];
            residue = String(cs.value("bi-not") || "").trim();
          }
          if (!statements.length) return null;
          cs.set("savedName", title);
          const yaml = ["---", "object_type: bias", "title: " + q(title), "current_state: " + state, "prior_state: " + (state === "draft" ? "null" : "draft"), "created: " + q(iso), "last_updated: " + q(iso), "statements:"];
          for (const s of statements) {
            yaml.push("  - id: " + q(s.id), "    kind: " + q(s.kind), "    subject: " + q(s.subject), "    text: " + q(s.text), "    justification: " + q(s.justification), "    citations: " + JSON.stringify(s.citations), "    locked: false");
          }
          yaml.push("---", "", "## What This Does Not Enforce", "", residue, "");
          const text = yaml.join("\n");
          return { body: { base: null, snapKey: iso.replace(/[-:]/g, "") + "_" + nonce, meta: { object_type: "bias", title, current_state: state, created: iso, last_updated: iso }, files: [{ path: "bundle.md", text }], register: [] } };
        })();
      },
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        const id = a && (a.bundleId || a.bundle_id);
        if (id) cs.set("saved", { bundleId: String(id), name: (view.ui && view.ui.savedName) || "" });
      } },
    // the set just saved, for the whole team or one project, with the adopter's own reason (the field is its reason, so the shell asks none)
    { op: "biasadopt", rereads: ["lens"], reasonField: "reason",
      send(view, el, cs) {
        const set = (cs.value("bi-set") || [])[0];
        const reason = String(cs.value("bi-adwhy") || "").trim();
        if (!set) return { refuse: "screen.bias.the_set_must_be_offered" };
        if (!reason || reason.length > 2000) return { refuse: "screen.bias.required_up_to_characters" };
        const picked = ["instance"].concat((view.data && view.data.projects && view.data.projects.value && view.data.projects.value.projects || []).map((p) => String(p.id))).find((v, i) => cs.value("bi-adopt-" + i) === true) || "instance";
        const body = { bundleId: String(set), reason };
        if (picked === "instance") body.scope = "instance"; else { body.scope = "project"; body.scopeId = picked; }
        return { body };
      } },
    // an outside policy read into proposals; nothing is saved, offered or adopted
    { op: "biasinhale", rereads: [],
      send(view, el, cs) {
        const policy = String(cs.value("bi-policy") || "").trim();
        if (!policy) return { refuse: "screen.bias.the_policy_in_its_own" };
        const source = String(cs.value("bi-source") || "").trim(), retrieved = String(cs.value("bi-when") || "").trim();
        return { body: Object.assign({ policy }, source ? { source } : {}, retrieved ? { retrieved } : {}) };
      },
      done(view, answer, cs) { const a = answer && answer.result !== undefined ? answer.result : answer; cs.set("proposal", a && typeof a === "object" ? a : null); } },
    // the record of one work product under an earlier lens
    { op: "biasdebt", rereads: ["debt"],
      send(view, el) { return { query: { run: String(el.dataset.run || view.subject) } }; } },
    // settled with the member's own reason; the assistant cannot
    { op: "biasdebtresolve", rereads: ["debt"], reasonField: "reason",
      send(view, el, cs) {
        const reason = String(cs.value("bi-dreason") || "").trim();
        if (!reason || reason.length > 4000) return { refuse: "screen.bias.you_gave_no_reason" };
        return { body: { run: String(el.dataset.run || view.subject), reason } };
      } },
    // the assistant's help with the statement's or the reason's words; nothing is kept until the member saves
    { op: "writinghelp", rereads: [], reasonField: "told",
      send(view, el, cs) {
        const told = String(cs.value(el.dataset.id) || "").trim();
        if (!told) return { refuse: "screen.bias.say_how_you_read_it" };
        cs.set("helping", el.dataset.field);
        return { body: { op: "promote", field: el.dataset.field, told } };
      },
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        const field = (view.ui && view.ui.helping) || "text";
        if (a && typeof a.text === "string") cs.fill(field === "text" ? "bi-text" : "bi-why", a.text);
      } },
  ],
};
