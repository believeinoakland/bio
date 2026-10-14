/* The publication ceremony (registry screen `ceremony`; R3–R5, R12–R15; DEC-147, DEC-180, DEC-183, DEC-207, DEC-208,
 * DEC-210; N683, N757, N788): Projects › <project> › Publish. Its steps in order, the current one marked; the checks
 * against the bar and what will be disclosed; the Photos step; the Ties step that prepares the edition; then the Sign
 * step inside the ceremony: when it becomes public, one sitting of the member's own key over every statement listed, and
 * the edition signed and waiting or published. Its subject is `<project>/<draft>`. Every function is self-contained
 * (interface-shell R21 (1)). */
import { PARTS } from "./parts.mjs";

export const CEREMONY = Object.freeze({
  id: "ceremony",
  parts: PARTS,

  reads: function (view) {
    if (!view.parts.subject(view, 2)) return {}; // K3171: no subject in the address, no subject read
    const s = String(view.subject || "").split("/");
    return {
      project: { op: "image", query: { id: s[0] } },
      copy: { op: "reviewcopy", query: { draft: s[1] || "" }, subject: true },
      group: { op: "groupidentity" },
    };
  },

  place: function (view) {
    const id = String(view.subject || "").split("/")[0];
    const p = view.data.project;
    return { project: { id: id, title: view.parts.titleOf(p && p.state === "ok" ? p.value : null, id) } };
  },

  render: function (cs, view) {
    if (!view.parts.subject(view, 2)) return view.parts.nothing(cs);
    const P = view.parts, ui = view.ui;
    const s = String(view.subject || "").split("/");
    const draft = s[1] || "";
    const copy = view.data.copy && view.data.copy.state === "ok" ? view.data.copy.value : null;
    const pv = view.data.project && view.data.project.state === "ok" ? view.data.project.value : null;
    const projectTitle = P.titleOf(pv, s[0]);
    const g = view.data.group && view.data.group.state === "ok" ? view.data.group.value : null;
    const groupName = g ? g.display_name || g.group || "" : "";
    const c = copy && copy.case ? copy.case : {};
    const out = [cs.title(c.identity ? cs.w("screen.ceremony.heading", { case: c.identity, edition: String(c.edition || "") }) : null, { thing: "case" }),
      '<p class="mk-sub">' + cs.w("screen.ceremony.permanent") + "</p>"];
    if (!copy) { out.push(cs.state("copy", function () { return ""; })); return out.join(""); }
    const args = P.caseArgs(copy, draft);

    // R3's reads: the checks against the bar, what will be disclosed, and an edition waiting to publish.
    const pre = P.later(cs, view, "preflight", "publishpreflight", { body: args });
    const ten = P.later(cs, view, "tensions", "publishtensions", { body: { project: args.project, targets: args.targets } });
    const prepared = ui.prepared || null;
    const caseId = prepared ? prepared.caseId : c.case_id;
    const sched = caseId ? P.later(cs, view, "schedule", "publishschedule", { query: { case: caseId } },
      function (v) { return !v || !Array.isArray(v.editions) || v.editions.length === 0; }) : null;
    const steps = pre.state === "ok" && Array.isArray(pre.value.steps) ? pre.value.steps : [];
    const stepWith = function (k) { return steps.find(function (x) { return x && typeof x === "object" && k in x; }) || null; };
    const photoStep = stepWith("photos");
    const photos = photoStep && Array.isArray(photoStep.photos) ? photoStep.photos : [];
    const signStep = stepWith("publish_at") || stepWith("signer") || {};
    const waiting = sched && sched.state === "ok" ? sched.value.editions.find(function (e) {
      return e.state === "waiting" && (!prepared || String(e.edition) === String(prepared.edition));
    }) : null;
    const published = ui.signed && ui.signed.now ? ui.signed : sched && sched.state === "ok" ? sched.value.editions.find(function (e) {
      return e.state === "published" && prepared && String(e.edition) === String(prepared.edition);
    }) : null;

    // R3: the steps in order, the current one marked.
    const NAMES = ["what", "strength", "leavesout", "people", "photos", "disclosures", "bias", "preview", "ties", "sign"];
    const unchecked = photoStep ? Number(photoStep.unchecked || 0) : 0;
    const current = published || waiting || (ui.signed && ui.signed.at) ? NAMES.length : prepared ? 9 : unchecked > 0 ? 4 : 8;
    out.push('<ol class="mk-steps" data-steps="ceremony">' + NAMES.map(function (n, i) {
      return "<li" + (i < current ? ' class="done"' : "") + (i === current ? ' aria-current="step"' : "") + ' data-step="' + n + '">' + cs.w("screen.ceremony.step." + n) + "</li>";
    }).join("") + "</ol>");

    // R3: each finding against the bar and every refusal that holds before signing, by its words; "Check again".
    out.push(cs.sec("screen.ceremony.checks", cs.state(pre, function (v) {
      const what = stepWith("pinned");
      const pinned = what && Array.isArray(what.pinned) ? what.pinned : [];
      const blockers = (v.first ? [v.first] : []).concat(Array.isArray(v.blockers) ? v.blockers : []);
      return (pinned.length ? cs.sheet(pinned.map(function (f) { return cs.row("", cs.ref("question", f.target, f.target, []), ""); }).join("")) : "")
        + '<p data-ready="' + (v.ready ? "yes" : "no") + '">' + cs.w(v.ready ? "screen.ceremony.ready" : "screen.ceremony.notready") + "</p>"
        + (blockers.length ? '<ul class="mk-list" data-blockers>' + blockers.map(function (b) { return '<li role="alert">' + P.refusalText(cs, b) + "</li>"; }).join("") + "</ul>" : "");
    }) + '<div class="mk-acts">' + cs.act("publishpreflight") + "</div>"));

    // R3: what will be disclosed with the case; "See everything that will be disclosed". Not drawn when nothing is to be
    // disclosed, and no count is drawn at zero (R20).
    out.push(P.sec(cs, "screen.ceremony.disclosed", cs.state(ten, function (v) {
      const all = ui.allTensions || null;
      const list = all && Array.isArray(all.candidates) ? all.candidates : Array.isArray(v.candidates) ? v.candidates.slice(0, 5) : [];
      const n = typeof v.count === "number" ? v.count : list.length;
      if (!n && !list.length) return "";
      return '<p>' + cs.w("screen.ceremony.disclosed.count", { n: String(n) }) + "</p>"
        + (list.length ? cs.sheet(list.map(function (t) {
          return cs.row("", '<span class="rec">' + cs.esc(t.says || t.summary || t.description || t.candidate || "") + "</span>", "");
        }).join("")) : "") + '<p class="muted">' + cs.w("screen.ceremony.timeline.frozen") + "</p>"
        + '<div class="mk-acts">' + cs.act("publishtensions") + "</div>";
    })));

    // R4: the Photos step.
    out.push(P.sec(cs, "screen.ceremony.photos", !photos.length ? "" : '<p>' + cs.w("screen.ceremony.photos.copy") + "</p><p>" + cs.w("screen.ceremony.photos.gate") + "</p>"
      + (photos.map(function (ph, i) {
        const sha = ph.sha || ph.capture || "";
        const marks = P.later(cs, view, "marks:" + sha, "photomarks", { query: { capture: sha } });
        // The sentence of facts needs the day the photo was taken, which the Photos step answers only when it carries one
        // (`taken_at`); with none, no sentence is drawn, never one with a gap in it.
        const when = ph.taken_at || ph.taken || "";
        const facts = when ? cs.w("screen.ceremony.photo.facts", { by: ph.taken_by || "", date: { html: cs.date(when) },
          findings: (ph.relied_on_by || []).map(function (r) { return r && (r.target || r.member) || ""; }).filter(Boolean).join(", ") }) : "";
        return '<div class="cs-sheet" data-photo="' + cs.esc(sha) + '"><p><b>' + cs.w("screen.ceremony.photo.name", { n: String(i + 1) }) + "</b> "
          + '<span class="id">' + cs.esc(String(sha).slice(0, 12)) + "</span>" + (facts ? " · " + facts : "") + "</p>"
          + (ph.refused || ph.words === "photo.refused.format" ? '<p role="alert">' + cs.w("screen.ceremony.photo.format") + "</p>" : "")
          + cs.state(marks, function (m) {
            return '<p data-photo-state="' + cs.esc(m.state || "") + '">' + cs.w("screen.ceremony.photo.state." + (m.state === "marked" ? "marked" : m.state === "nothing_to_obscure" ? "nothing" : "unchecked")) + "</p>"
              + (m.marks || []).map(function (x) {
                const areas = (x.areas || []).map(function (a) { return cs.w("screen.ceremony.area." + (a.kind === "plate" ? "plate" : a.kind === "staff" ? "staff" : "person")); }).join(", ");
                return cs.row("", cs.w(x.withdrawn ? "screen.ceremony.mark.withdrawn" : "screen.ceremony.mark.standing", { n: String(x.mark), areas: { html: areas || cs.w("screen.ceremony.area.none") } })
                  + (x.withdrawn ? ' <span class="rec">' + cs.esc(x.withdrawn.reason || "") + "</span>" : ""), "",
                  x.withdrawn ? "" : cs.field("ce-wd-" + i + "-" + x.mark, "screen.ceremony.withdraw.reason", { area: true })
                    + cs.act("obscuremarkwithdraw", { data: { capture: sha, mark: String(x.mark), field: "ce-wd-" + i + "-" + x.mark } }));
              }).join("");
          })
          // R4 (K3147, K3150): the member draws the areas on the photo itself (interface-shell R49's `cs.image`, `cs.areas`,
          // the original read as `open-file` reads it), then names what they cover.
          + cs.areas(cs.image("openoriginal", { capture: sha }, { alt: { key: "screen.ceremony.photo.name", fills: { n: String(i + 1) } } }),
            { id: "ce-areas-" + i, areas: [], label: "screen.ceremony.areas.label" })
          + '<fieldset class="cs-field"><legend>' + cs.w("screen.ceremony.areas.legend") + "</legend>"
          + cs.choice("ce-kind-" + i, "screen.ceremony.area.kind", [["person", "screen.ceremony.area.person"], ["plate", "screen.ceremony.area.plate"], ["staff", "screen.ceremony.area.staff"]])

          + cs.field("ce-staff-" + i, "screen.ceremony.area.reason", { area: true, help: "screen.ceremony.area.reason.help" }) + "</fieldset>"
          + '<div class="mk-acts">' + cs.act("obscuremark", { data: { capture: sha, index: String(i) } })
          + cs.act("obscuremark", { label: "screen.ceremony.photo.nothing", data: { capture: sha, index: String(i), nothing: "1" } }) + "</div></div>";
      }).join("") + P.said(view, "obscure"))));

    // R5: the Ties step: the member's own confirmation of no undeclared tie, sent with `publish` as `tieAttested`.
    out.push(cs.sec("screen.ceremony.ties", cs.checks("ce-tie", "screen.ceremony.ties.legend", [["yes", "screen.ceremony.ties.confirm", false]])
      + '<div class="mk-acts">' + cs.act("publish", { tone: "primary" }) + "</div><p class=\"muted\">" + cs.w("screen.ceremony.ties.part") + "</p>"
      + P.said(view, "publish") + (prepared ? '<p class="mk-note" role="status">' + cs.w("screen.ceremony.prepared", { edition: String(prepared.edition) }) + "</p>" : "")));

    // R12–R15: the Sign step, offered only once `publish` has answered (R5's control); at the phone width it says where
    // signing finishes (R15; DEC-181), the kit drawing a signed act there as what it does, never sent.
    const phone = /data-phone-act/.test(cs.act("caseratify"));
    if ((prepared || phone) && !published && !waiting && !(ui.signed && ui.signed.at)) {
      const doc = prepared && !phone ? P.later(cs, view, "document", "casedocument", { query: { case: prepared.caseId, edition: String(prepared.edition) } }) : null;
      const zone = signStep && signStep.publish_at && (signStep.publish_at.zone || signStep.publish_at.time_zone) || "";
      let sign = '<p class="mk-explain">' + cs.w("signing.ceremony.who", { signer: (view.me && view.me.handle) || "", project: projectTitle, group: groupName }) + "</p>";
      if (phone) sign += '<p role="status" data-phone>' + cs.w("signing.ceremony.phone", { project: projectTitle }) + "</p>";
      else {
        sign += '<fieldset class="cs-field"><legend>' + cs.w("screen.ceremony.when") + "</legend>"
          + '<p class="help">' + cs.w("screen.ceremony.when.help", { zone: zone }) + "</p>"
          + cs.field("ce-date", "screen.ceremony.when.date", { type: "date" }) + cs.field("ce-time", "screen.ceremony.when.time", { type: "time" }) + "</fieldset>"
          + cs.state(doc, function (d) {
            const list = P.sitting(d, prepared) || [];
            return '<details data-statements><summary>' + cs.w("screen.ceremony.signs.exactly") + "</summary><ul class=\"mk-list\">"
              + list.map(function (x) {
                return '<li data-statement="' + x.kind + '"><span class="id">' + cs.esc(x.text.trim()) + "</span> · " + cs.w("screen.ceremony.signs." + x.kind, { id: x.id, edition: String(x.edition === undefined ? "" : x.edition), case: x.id }) + "</li>";
              }).join("") + "</ul></details><p>" + cs.w("screen.ceremony.signs.count", { n: String(list.length),
                findings: String(list.filter(function (x) { return x.kind === "finding"; }).length),
                evidence: String(list.filter(function (x) { return x.kind === "evidence"; }).length) }) + "</p>";
          })
          // R12 (K3147, K3150): one button that follows the choice of when (interface-shell R49's `cs.choice` with `acts`).
          + '<div class="mk-acts">' + cs.choice("ce-when", "screen.ceremony.when", [["now", "screen.ceremony.when.now"], ["at", "screen.ceremony.when.at"]],
            { acts: { now: "caseratify", at: "publishat" }, act: { tone: "primary", icon: "signed" } }) + "</div>"
          + '<p class="muted">' + cs.w("screen.ceremony.device.next") + "</p>";
      }
      if (ui.nokey) sign += '<div class="cs-dialog" data-nokey><p>' + cs.w("signing.ceremony.nokey") + "</p>"
        + cs.checks("ce-keep", "screen.ceremony.keep.legend", [["keep", "signing.ceremony.keepkey", false]])
        + '<div class="mk-acts">' + cs.act("signerregisterown", { tone: "primary" }) + "</div>" + P.said(view, "register") + "</div>";
      if (ui.notowner) sign += '<div class="cs-dialog" data-notowner><p>' + cs.w("signing.ceremony.notowner", { project: projectTitle, owners: ui.notowner.owners || "" }) + "</p>"
        + '<div class="mk-acts">' + cs.act("signrequest") + "</div>" + P.said(view, "signrequest") + "</div>";
      out.push(cs.sec("screen.ceremony.sign", sign + P.said(view, "sign")));
    }

    // R14: signed and waiting, with "Move the time" and "Cancel publishing"; or signed and published, with its page.
    if (waiting || (ui.signed && ui.signed.at)) {
      const w = waiting || {};
      const at = w.at || ui.signed.at || {};
      out.push(cs.sec("screen.ceremony.signed", '<p role="status" data-signed="at">' + cs.w("signing.ceremony.signedat", {
        edition: String(w.edition || (prepared && prepared.edition) || ""), date: { html: at.date ? cs.date(at.date) : "" }, time: at.time || "", zone: at.zone || "" }) + "</p>"
        + cs.field("ce-move-date", "screen.ceremony.when.date", { type: "date" }) + cs.field("ce-move-time", "screen.ceremony.when.time", { type: "time" })
        + '<div class="mk-acts">' + cs.act("publishatmove", { data: { case: String(w.case || caseId || ""), edition: String(w.edition || (prepared && prepared.edition) || "") } })
        + cs.act("publishatcancel", { data: { case: String(w.case || caseId || ""), edition: String(w.edition || (prepared && prepared.edition) || "") } }) + "</div>"
        + P.said(view, "moved")));
    } else if (published) {
      out.push(cs.sec("screen.ceremony.signed", '<p role="status" data-signed="now">' + cs.w("signing.ceremony.signednow", { edition: String(published.edition || "") }) + "</p>"
        + '<a href="/app/published/' + encodeURIComponent(String(published.case || caseId || "")) + '" data-nav>' + cs.w("screen.ceremony.publicpage") + "</a>"));
    }
    if (sched && sched.state !== "ok" && sched.state !== "empty") out.push(cs.state(sched, function () { return ""; }));
    return out.join("");
  },

  acts: [
    {
      // R3: "Check again": the checks read once more.
      op: "publishpreflight", label: "act.publishpreflight.label.ceremony",
      send: function (view) {
        const copy = view.data.copy && view.data.copy.state === "ok" ? view.data.copy.value : null;
        return copy ? { body: view.parts.caseArgs(copy, String(view.subject || "").split("/")[1] || "") } : null;
      },
      done: function (view, answer, cs) { if (!view.parts.refused(cs, view, "publishpreflight", answer)) view.parts.forget(view); }, // D29
    },
    {
      // R3: "See everything that will be disclosed".
      op: "publishtensions", label: "act.publishtensions.label.ceremony",
      send: function (view) {
        const copy = view.data.copy && view.data.copy.state === "ok" ? view.data.copy.value : null;
        if (!copy) return null;
        const a = view.parts.caseArgs(copy, "");
        return { body: { project: a.project, targets: a.targets } };
      },
      done: function (view, answer, cs) {
        if (view.parts.refused(cs, view, "publishtensions", answer)) return { stay: true }; // D29
        view.ui.allTensions = view.parts.value(answer);
        return { stay: true };
      },
    },
    {
      // R4: the areas the member marks on a photo (a person not part of a finding, a number plate, city staff at work
      // with a reason), or "nothing to obscure" (`areas: []`).
      op: "obscuremark", label: "act.obscuremark.label.ceremony",
      send: function (view, el, cs) {
        const i = el.dataset.index;
        if (el.dataset.nothing === "1") return { query: { capture: el.dataset.capture }, body: { areas: [] } };
        const kind = String(cs.value("ce-kind-" + i) || "person");
        const reason = String(cs.value("ce-staff-" + i) || "").trim();
        if (kind === "staff" && !reason) return { refuse: "screen.ceremony.area.reason.needed" };
        const named = function (rect) { const a = { rect: rect, kind: kind }; if (kind === "staff") a.reason = reason; return a; };
        // interface-shell R49: the rectangles drawn on the photo, `[{left, top, width, height}]` in its pixels, each named by
        // the kind chosen, sent as case-carriage's `{rect: [x0, y0, x1, y1], kind, reason?}`.
        const drawnAreas = cs.value("ce-areas-" + i);
        const list = (Array.isArray(drawnAreas) ? drawnAreas : []).filter(function (r) { return r && r.width >= 1 && r.height >= 1; });
        if (!list.length) return { refuse: "screen.ceremony.areas.needed" };
        return { query: { capture: el.dataset.capture }, body: { areas: list.map(function (r) {
          return named([Math.round(r.left), Math.round(r.top), Math.round(r.left + r.width), Math.round(r.top + r.height)]); }) } };
      },
      done: function (view, answer, cs) { if (!view.parts.refused(cs, view, "obscure", answer)) view.parts.forget(view); }, // D29
    },
    {
      // R4: a mark withdrawn with a reason, never erased.
      op: "obscuremarkwithdraw", label: "act.obscuremarkwithdraw.label.ceremony", reasonField: "reason",
      send: function (view, el, cs) {
        return { query: { capture: el.dataset.capture }, body: { mark: Number(el.dataset.mark), reason: String(cs.value(el.dataset.field) || "").trim() } };
      },
      done: function (view, answer, cs) { if (!view.parts.refused(cs, view, "obscure", answer)) view.parts.forget(view); }, // D29
    },
    {
      // R5: the Ties step's confirmation prepares the edition for signing: `publish` with `tieAttested: true`.
      op: "publish", label: "act.publish.label.ceremony",
      send: function (view, el, cs) {
        const copy = view.data.copy && view.data.copy.state === "ok" ? view.data.copy.value : null;
        if (!copy) return null;
        const tick = cs.value("ce-tie");
        if (!(Array.isArray(tick) ? tick.includes("yes") : tick === true)) return { refuse: "screen.ceremony.ties.needed" };
        const s = String(view.subject || "").split("/");
        return { body: Object.assign(view.parts.caseArgs(copy, s[1] || ""), { tieAttested: true }) };
      },
      done: function (view, answer, cs) {
        if (view.parts.refused(cs, view, "publish", answer)) return; // D29: nothing is prepared on a refusal
        const r = view.parts.value(answer) || {};
        view.ui.prepared = { caseId: r.caseId, edition: r.edition, docSha: r.caseDocument ? r.caseDocument.doc_sha : null,
          findings: (Array.isArray(r.findings) ? r.findings : r.target ? [{ target: r.target, bundleSha: r.bundleSha }] : [])
            .map(function (f) { return { target: f.target, bundleSha: f.bundleSha }; }) };
        view.ui.nokey = false; view.ui.notowner = null;
        view.parts.forget(view);
      },
    },
    {
      // R12, R13: "Sign and publish now": one sitting over every statement listed, sent as one `caseratify`.
      op: "caseratify", label: "act.caseratify.label.ceremony",
      refusals: {
        NO_ATTESTING_KEY: function (r, cs) { cs.set("nokey", true); return cs.w("screen.ceremony.refused.nokey"); },
        NO_SIGNERS: function (r, cs) { cs.set("nokey", true); return cs.w("screen.ceremony.refused.nokey"); },
        SIG_UNKNOWN_KEY: function (r, cs) { cs.set("nokey", true); return cs.w("screen.ceremony.refused.nokey"); },
        CASE_SIGNER_NOT_AN_OWNER: function (r, cs) {
          cs.set("notowner", { owners: Array.isArray(r.owners) ? r.owners.join(", ") : String(r.owners || "") });
          return cs.w("screen.ceremony.refused.notowner");
        },
      },
      send: async function (view, el, cs) {
        const P = view.parts, pr = view.ui.prepared;
        if (!pr) return null;
        const a = await cs.call("casedocument", { query: { case: pr.caseId, edition: String(pr.edition) } });
        const doc = P.value(a);
        const list = doc && doc.ok !== false ? P.sitting(doc, pr) : null;
        if (!list) return { refuse: "screen.ceremony.sign.nodoc" };
        const signed = await cs.signer.sign(list.map(function (x) { return { label: x.kind + " " + x.id, bytes: P.bytes(x.text), namespace: x.namespace }; }));
        if (!signed || signed.ok !== true || !Array.isArray(signed.signatures) || signed.signatures.length !== list.length) return { refuse: "signing.ceremony.declined" };
        return { body: { caseId: pr.caseId, edition: Number(pr.edition), expectedSha: doc.doc_sha, sig: signed.signatures[0],
          members: list.slice(1).map(function (x, i) { return { id: x.id, sha: x.sha, signature: signed.signatures[i + 1] }; }) } };
      },
      done: function (view, answer, cs) {
        if (view.parts.refused(cs, view, "sign", answer)) return; // D29: nothing is drawn signed on a refusal
        const r = view.parts.value(answer) || {};
        view.ui.signed = { now: true, case: r.caseId, edition: r.edition, sitting: Array.isArray(r.sitting) ? r.sitting : [] };
        view.parts.forget(view);
      },
    },
    {
      // R12, R13: "Sign now and publish at <time>": the same sitting, the edition held until then.
      op: "publishat", label: "act.publishat.label.ceremony",
      refusals: {
        NO_ATTESTING_KEY: function (r, cs) { cs.set("nokey", true); return cs.w("screen.ceremony.refused.nokey"); },
        NO_SIGNERS: function (r, cs) { cs.set("nokey", true); return cs.w("screen.ceremony.refused.nokey"); },
        SIG_UNKNOWN_KEY: function (r, cs) { cs.set("nokey", true); return cs.w("screen.ceremony.refused.nokey"); },
        CASE_SIGNER_NOT_AN_OWNER: function (r, cs) {
          cs.set("notowner", { owners: Array.isArray(r.owners) ? r.owners.join(", ") : String(r.owners || "") });
          return cs.w("screen.ceremony.refused.notowner");
        },
      },
      send: async function (view, el, cs) {
        const P = view.parts, pr = view.ui.prepared;
        if (!pr) return null;
        const at = P.at(cs.value("ce-date"), cs.value("ce-time"));
        if (!at) return { refuse: "screen.ceremony.when.needed" };
        const a = await cs.call("casedocument", { query: { case: pr.caseId, edition: String(pr.edition) } });
        const doc = P.value(a);
        const list = doc && doc.ok !== false ? P.sitting(doc, pr) : null;
        if (!list) return { refuse: "screen.ceremony.sign.nodoc" };
        const signed = await cs.signer.sign(list.map(function (x) { return { label: x.kind + " " + x.id, bytes: P.bytes(x.text), namespace: x.namespace }; }));
        if (!signed || signed.ok !== true || !Array.isArray(signed.signatures) || signed.signatures.length !== list.length) return { refuse: "signing.ceremony.declined" };
        return { body: { caseId: pr.caseId, edition: Number(pr.edition), expectedSha: doc.doc_sha, sig: signed.signatures[0], at: at,
          members: list.slice(1).map(function (x, i) { return { id: x.id, sha: x.sha, signature: signed.signatures[i + 1] }; }) } };
      },
      done: function (view, answer, cs) {
        if (view.parts.refused(cs, view, "sign", answer)) return; // D29
        const r = view.parts.value(answer) || {};
        view.ui.signed = { at: r.at || {}, case: r.case, edition: r.edition };
        view.parts.forget(view);
      },
    },
    {
      // R15: no signing key in this browser: one made on this device by the signer kit, kept only when the member ticks.
      op: "signerregisterown", label: "act.signerregisterown.label.ceremony",
      send: async function (view, el, cs) {
        const tick = cs.value("ce-keep");
        const keep = Array.isArray(tick) ? tick.includes("keep") : tick === true;
        const k = await cs.signer.register({ keep: keep });
        if (!k || k.ok !== true || typeof k.keyB64 !== "string") return { refuse: "signing.ceremony.declined" };
        return { body: { keyB64: k.keyB64 } };
      },
      done: function (view, answer, cs) {
        if (view.parts.refused(cs, view, "sign", answer)) return; // D29
        view.ui.nokey = false;
        view.parts.say(cs, view, "sign", cs.w("screen.ceremony.registered"));
      },
    },
    {
      // R15: a member who is not an owner asks the owners to sign (tasks R19).
      op: "signrequest", label: "act.signrequest.label.ceremony",
      send: function (view) { const pr = view.ui.prepared; return pr ? { body: { case: pr.caseId, edition: Number(pr.edition) } } : null; },
      done: function (view, answer, cs) {
        if (!view.parts.refused(cs, view, "signrequest", answer)) view.parts.say(cs, view, "signrequest", cs.w("screen.ceremony.asked")); // D29
        return { stay: true };
      },
    },
    {
      // R14: "Move the time".
      op: "publishatmove", label: "act.publishatmove.label.ceremony",
      send: function (view, el, cs) {
        const at = view.parts.at(cs.value("ce-move-date"), cs.value("ce-move-time"));
        if (!at) return { refuse: "screen.ceremony.when.needed" };
        return { body: { case: el.dataset.case, edition: Number(el.dataset.edition), at: at } };
      },
      done: function (view, answer, cs) {
        if (view.parts.refused(cs, view, "moved", answer)) return; // D29
        view.ui.signed = null;
        view.parts.forget(view);
      },
    },
    {
      // R14: "Cancel publishing".
      op: "publishatcancel", label: "act.publishatcancel.label.ceremony",
      send: function (view, el) { return { body: { case: el.dataset.case, edition: Number(el.dataset.edition) } }; },
      done: function (view, answer, cs) {
        if (view.parts.refused(cs, view, "moved", answer)) return; // D29
        view.ui.signed = null;
        view.ui.prepared = null;
        view.parts.forget(view);
      },
    },
  ],
});
