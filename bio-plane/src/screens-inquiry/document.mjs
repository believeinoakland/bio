/* screens-inquiry R3: the document screen (Projects › <project> › Document; registry screen `document`, its 11 acts).
 *
 * Self-contained functions (interface-shell R21 (1)). The document is the INFO bundle `view.subject` its capture is
 * filed in; its capture's digest is the document's `content_hash`, its address `source.locator`. What needs the digest
 * or the address (the reading and its passages, the grade note, the versions) is read once the document is read.
 * `release` and `retire` act on a selection (`ratification` takes a handle), so each makes its own selection of this
 * document (`op=select`) and sends itself, drawing its own outcome beside the act. Opening the original goes through
 * `open-file` (`screens-intake`). `pagetranscribe` is drawn only while the assistant is reachable (interface-shell R20;
 * DEC-190). "Watch for changes" (`monitorset`, `monitoring` R74) and "Check for a new version now" (`monitor`) are two
 * acts (R15). A choice among record data (a question, a page) is `cs.choice` over `{value, text}` options (R8). */

import { OWN, ownRows } from "./words.mjs";

/** R3: the reads that need only the document's id; the rest follow from its front matter. */
function reads(view) {
  const id = String(view.subject || "");
  return {
    capture: { op: "image", query: { id }, empty: (v) => !v || typeof v !== "object" || !v["bundle.md"] },
    backlinks: { op: "backlinks", query: { target: id },
                 empty: (v) => !v || !Array.isArray(v.backlinks) || v.backlinks.length === 0 },
    questions: { op: "list", query: { type: "inquiry", limit: "500" } },
  };
}

/** R8's project step: the project the document states, by its id. */
function place(view) {
  const d = view.data && view.data.capture;
  const text = d && d.state === "ok" && d.value && d.value["bundle.md"];
  const m = typeof text === "string" ? /^project:\s*(\S+)\s*$/m.exec(text.split(/\n---\s*\n/)[0] || "") : null;
  return m ? { project: { id: m[1], title: m[1] } } : {};
}

/** R3, R5: the capture, its grade and note, its passages (each citable), its unread pages, the people it names, its
 *  versions, what cites it, and its acts. */
function render(cs, view) {
  const id = String(view.subject || "");
  const ui = view.ui;
  const d = view.data || {};
  const front = (text) => {
    const out = { source: {} };
    if (typeof text !== "string") return out;
    const head = text.replace(/^---\s*\n/, "").split(/\n---\s*(\n|$)/)[0];
    let block = null;
    for (const line of head.split("\n")) {
      const top = /^(\w+):\s*(.*)$/.exec(line);
      if (top) {
        block = top[2].trim() === "" ? top[1] : null;
        let v = top[2].trim();
        try { if (v.startsWith("\"")) v = JSON.parse(v); } catch { /* raw */ }
        out[top[1]] = v;
        if (block) out[block] = {};
        continue;
      }
      const sub = /^\s+(\w+):\s*(.*)$/.exec(line);
      if (sub && block && typeof out[block] === "object") out[block][sub[1]] = sub[2].trim();
    }
    return out;
  };
  const later = (key, op, query) => {
    const L = ui.later || (ui.later = {});
    const q = JSON.stringify(query);
    if (!L[key] || L[key].q !== q) {
      L[key] = { q, state: "loading" };
      const settle = (o) => { L[key] = Object.assign({ q }, o); cs.set("later", L); };
      cs.call(op, { query }).then((a) => {
        const r = a && a.result !== undefined ? a.result : a;
        if (!a || a.ok === false || (r && r.ok === false))
          {
          const f = r && r.ok === false ? r : a || {};
          const code = String(f.code || f.reason || "");
          settle({ state: "failed", refusal: { code, words: cs.esc(f.translation || code) } });
        }
        else if (r && r.found === false) settle({ state: "empty" });
        else settle({ state: "ok", value: r });
      }, () => settle({ state: "failed", refusal: null }));
    }
    return L[key];
  };
  const pagesText = (list) => {
    const n = list.slice().sort((a, b) => a - b), runs = [];
    for (const p of n) {
      const last = runs[runs.length - 1];
      if (last && p === last[1] + 1) last[1] = p; else runs.push([p, p]);
    }
    return runs.map(([a, b]) => (a === b ? String(a) : a + "–" + b)).join(", ");
  };
  const own = (key) => (ui.outcome && ui.outcome[key]
    ? `<p class="${ui.outcome[key].ok ? "cs-note" : "cs-refusal"}" role="${ui.outcome[key].ok ? "status" : "alert"}" data-outcome="${key}">${ui.outcome[key].html}</p>` : "");
  const doc = d.capture && d.capture.state === "ok" ? front(d.capture.value["bundle.md"]) : null;
  const sha = doc && /^sha256:[0-9a-f]{64}$/.test(String(doc.content_hash || "")) ? String(doc.content_hash).slice(7) : "";
  const locator = doc && doc.source ? String(doc.source.locator || "") : "";
  const out = [];
  out.push(cs.title(doc ? (doc.title || id) : id, { thing: "document" }));
  if (!doc) { out.push(cs.state("capture", view, () => "")); return out.join(""); }
  out.push(`<p class="cs-sub">${cs.w("screen.document.captured", {
    date: { html: doc.source.retrieved ? cs.date(String(doc.source.retrieved)) : doc.created ? cs.date(String(doc.created)) : "" },
    source: locator || (doc.source.authority || "") })}</p>`);

  /* this copy: its grade as one mark with "Why B?", its fingerprint, the original through open-file */
  const note = sha ? later("gradenote", "gradenote", { capture: sha }) : { state: "empty" };
  const letter = note.state === "ok" && note.value && note.value.note && note.value.note.grade ? String(note.value.note.grade) : "";
  out.push(`<div class="cs-facts"><div><span class="k">${cs.w("screen.document.copy")}</span><span class="v">`
    + (letter ? cs.grade("capture", letter) : cs.mark("gap", "unrated"))
    + cs.act("gradenote", { label: "act.gradenote.label.document", data: { capture: sha }, tone: "quiet" }) + "</span></div>"
    + (sha ? `<div><span class="k">${cs.w("screen.document.fingerprint")}</span><span class="v"><span class="cs-id" tabindex="0" data-means="screen.document.fingerprint.means">${cs.esc(sha.slice(0, 4) + "…" + sha.slice(-4))}</span></span></div>` : "")
    + `<div><a class="cs-btn" data-tone="quiet" href="/app/open-file/${cs.esc(id)}">${cs.w("screen.document.open")}</a></div></div>`);
  if (ui.gradenote) {
    const n = ui.gradenote.note;
    out.push(cs.sec("screen.document.gradenote.head", n
      ? `<p>${cs.esc(typeof n === "string" ? n : (n.says || n.text || n.how || JSON.stringify(n)))}</p>`
      : `<p>${cs.w("screen.document.gradenote.none")}</p>`, { fills: { letter: letter || (n && n.grade) || "" } }));
  }
  if (sha) out.push(cs.act("findin", { label: "act.findin.label.document", data: { capture: sha } }));

  /* passages: the reading's, each citable in a question the member chooses (citation R1's `found`) */
  const reading = sha ? later("reading", "reading", { sha256: sha }) : { state: "empty" };
  const qs = d.questions && d.questions.state === "ok" && Array.isArray(d.questions.value.bundles) ? d.questions.value.bundles : [];
  out.push(cs.sec("screen.document.passages.head", cs.state(reading, (r) => {
    const rd = r.reading || {};
    const passages = Array.isArray(rd.passages) ? rd.passages
      : Array.isArray(rd.units) ? rd.units
      : typeof rd.text === "string" ? rd.text.split(/\n\s*\n/).map((t) => ({ text: t })) : [];
    const list = passages.filter((p) => p && String(p.text || p.words || "").trim());
    if (!list.length) return `<p>${cs.w("screen.document.passages.empty")}</p>`;
    const pick = qs.length
      ? cs.choice("document-cite-question", "screen.document.cite.question", qs.map((q) => ({ value: String(q.bundle_id), text: String(q.title || q.bundle_id) })), {})
        + cs.choice("document-cite-role", "screen.document.cite.role",
            [["supports", "screen.question.supports.head"], ["cuts_against", "screen.question.against.head"]], { value: "supports" })
      : `<p class="cs-meta">${cs.w("screen.document.cite.noquestion")}</p>`;
    return list.map((p, i) => {
      const extent = p.extent && typeof p.extent === "object" ? p.extent : null;
      const page = extent && Number.isInteger(extent.page) ? extent.page : null;
      return `<blockquote class="cs-passage cs-rec" data-passage="${i}">“${cs.esc(String(p.text || p.words).trim())}”`
        + (page !== null ? `<span class="cs-meta">${cs.w("screen.document.passage.where", { page })}</span>` : "") + "</blockquote>"
        + (extent && qs.length ? cs.act("cite", { label: "act.cite.label.document",
            data: { found: JSON.stringify({ capture_sha: sha, extent, kind: "passage" }) } }) : "");
    }).join("") + pick + own("cite");
  }, { empty: "screen.document.passages.empty" })));

  /* the pages its reading could not make out (extraction R27), and the two ways to their words */
  if (reading.state === "ok" && Array.isArray(reading.value.unread_pages) && reading.value.unread_pages.length) {
    const un = reading.value.unread_pages;
    out.push(cs.sec("screen.document.unread.head",
      `<p>${cs.w("document.unread.pages", { pages: pagesText(un) })}</p>`
      + (view.reachable ? cs.act("pagetranscribe", { label: "act.pagetranscribe.label.document", data: { sha } }) : "")
      + cs.choice("document-unread-page", "screen.document.unread.page", un.map((p) => ({ value: String(p), text: String(p) })), { value: String(un[0]) })
      + cs.field("document-unread-words", "screen.document.unread.words", { area: true, rec: true })
      + cs.act("transcribe", { label: "act.transcribe.label.document", data: { document: id } })));
  }
  out.push(own("transcribe") + own("pagetranscribe"));
  if (reading.state === "ok" && reading.value.untested && reading.value.text_provenance && reading.value.text_provenance.transcribed)
    out.push(`<p class="cs-label" data-label="untested">${cs.w("ai.label.untested")}</p>`);

  /* people it names: a name in its reading claimed as a person the record follows */
  if (reading.state === "ok") {
    const rd = reading.value.reading || {};
    const people = Array.isArray(rd.people) ? rd.people : Array.isArray(rd.entities) ? rd.entities.filter((e) => e && (e.kind === "person" || e.type === "person")) : [];
    out.push(cs.sec("screen.document.people.head", people.length
      ? cs.sheet(people.map((p) => cs.row("", cs.esc(p.name || p.words || ""), cs.act("identityclaim",
          { label: "act.identityclaim.label.document", data: { entity: String(p.id || p.entity || "") } }))).join(""))
        + cs.field("document-claim-person", "screen.document.claim.label", {})
        + cs.choice("document-claim-basis", "screen.document.claim.basis",
            [["name", "screen.document.claim.basis.name"], ["corroborated_name", "screen.document.claim.basis.corroborated"], ["identifier", "screen.document.claim.basis.identifier"]], { value: "name" })
        + cs.field("document-claim-note", "screen.document.claim.note", { area: true, rec: true }) + own("identityclaim")
      : `<p>${cs.w("screen.document.people.empty")}</p>`));
  }

  /* its versions (provenance's versionchain): a newer version than this copy marked changed */
  if (locator) {
    const vc = later("versions", "versionchain", { address: locator, ...(sha ? { at: sha } : {}) });
    out.push(cs.sec("screen.document.versions.head", cs.state(vc, (v) => {
      const list = Array.isArray(v.versions) ? v.versions : [];
      if (list.length < 2) return `<p>${cs.w("screen.document.versions.empty")}</p>`;
      const at = Number.isInteger(v.at_index) ? v.at_index : list.findIndex((x) => x && (x.capture_sha === sha || x.sha256 === sha));
      const newer = at >= 0 && at < list.length - 1;
      return (newer ? `<p class="cs-due" data-changed="true">${cs.w("screen.document.versions.changed")}</p>` : "")
        + cs.sheet(list.map((x, i) => cs.row("", x && (x.at || x.retrieved) ? cs.date(String(x.at || x.retrieved), { year: true }) : "",
            i === at ? `<span class="cs-meta">${cs.w("screen.document.versions.this")}</span>` : "")).join(""));
    })));
  }

  /* what cites it */
  out.push(cs.sec("screen.document.backlinks.head", cs.state("backlinks", view, (b) =>
    cs.sheet((b.backlinks || []).map((x) => cs.row("", cs.ref(x.from_type === "project" ? "project" : x.from_type === "inquiry" ? "question" : "document",
      String(x.from || ""), x.from_title || x.from || "", [x.from_title || x.from || ""]), "")).join(""))
    + (b.out_of_view ? `<p class="cs-meta">${cs.w("screen.document.backlinks.hidden")}</p>` : ""),
  { empty: "screen.document.backlinks.empty" })));

  /* this copy's acts: vouch (by its weight), attest (signed), watch for changes and check now (R15), retire (terminal) */
  out.push(cs.sec("screen.document.copyacts.head",
    cs.field("document-release-ack", "screen.document.release.ack", { area: true, rec: true })
    + cs.field("document-release-mitigation", "screen.document.release.mitigation", { area: true, rec: true })
    + cs.act("release", { label: "act.release.label.document", data: { document: id } }) + own("release")
    + cs.act("attest", { label: "act.attest.label.document", data: { sha } }) + own("attest")
    + cs.act("monitorset", { label: "act.monitorset.label.document", data: { document: id } }) + own("monitorset")
    + cs.act("monitor", { label: "act.monitor.label.document", data: { document: id } }) + own("monitor")
    + cs.act("retire", { label: "act.retire.label.document", data: { document: id } }) + own("retire")));
  return out.join("");
}

/** R3's and R15's eleven acts. */
const acts = [
  { op: "gradenote", label: "act.gradenote.label.document",
    send(view, el) { return { query: { capture: el.dataset.capture || "" } }; },
    done(view, answer, cs) { cs.set("gradenote", answer && answer.result !== undefined ? answer.result : answer); },
    rereads: [] },
  { op: "findin", label: "act.findin.label.document",
    /* `find-in`'s scope is the route's subject: for a document, its capture's digest (screens-daily) */
    send(view, el, cs) { if (el.dataset.capture) cs.go("find-in", el.dataset.capture); return null; } },
  { op: "cite", label: "act.cite.label.document",
    send(view, el, cs) {
      const question = String(cs.value("document-cite-question") || "").trim();
      if (!question) return { refuse: "screen.document.cite.noquestion" };
      const role = cs.value("document-cite-role") === "cuts_against" ? "cuts_against" : "supports";
      return { query: { project: question, role, found: el.dataset.found || "" } };
    } },
  /* reasoned: the member's own acknowledgment is its reason (interface-shell R11, DEC-88), so no second one is asked */
  { op: "release", label: "act.release.label.document", reasonField: "acknowledgment",
    send(view, el, cs) {
      const f = { acknowledgment: String(cs.value("document-release-ack") || "").trim(), mitigation: String(cs.value("document-release-mitigation") || "").trim() };
      if (!f.acknowledgment || !f.mitigation) return { refuse: "screen.document.release.empty" };
      const said = (key, a) => {
        const r = a && a.result !== undefined ? a.result : a;
        const ok = !!(a && a.ok !== false && r && r.ok !== false);
        const o = Object.assign({}, view.ui.outcome);
        o[key] = { ok, html: ok ? "" : (r && r.translation ? cs.esc(r.translation) : cs.w("state.failed", { reason: (r && (r.code || r.reason)) || "" })) };
        cs.set("outcome", o);
        return ok;
      };
      cs.call("select", { body: { ids: [String(view.subject || "")] } }).then((s) => {
        const sr = s && s.result !== undefined ? s.result : s;
        if (!sr || !sr.handle) return said("release", s);
        return cs.call("release", { query: { handle: sr.handle, acknowledgment: String(f.acknowledgment || ""), mitigation: String(f.mitigation || "") } })
          .then((a) => said("release", a));
      }, () => said("release", null));
      return null;
    } },
  { op: "attest", label: "act.attest.label.document",
    send(view, el) { return { body: { sha256: el.dataset.sha || "" } }; },
    done(view, answer, cs) { cs.set("outcome", Object.assign({}, view.ui.outcome, { attest: { ok: true, html: cs.w("screen.document.attest.done") } })); } },
  { op: "retire", label: "act.retire.label.document",
    dialog: [{ name: "reason", label: "screen.document.retire.reason" }],
    send(view, el, cs, extra) {
      const f = (extra && extra.fields) || {};
      const said = (a) => {
        const r = a && a.result !== undefined ? a.result : a;
        const ok = !!(a && a.ok !== false && r && r.ok !== false);
        cs.set("outcome", Object.assign({}, view.ui.outcome, { retire: { ok, html: ok ? "" : (r && r.translation ? cs.esc(r.translation)
          : cs.w("state.failed", { reason: (r && (r.code || r.reason)) || "" })) } }));
      };
      cs.call("select", { body: { ids: [String(view.subject || "")] } }).then((s) => {
        const sr = s && s.result !== undefined ? s.result : s;
        if (!sr || !sr.handle) return said(s);
        return cs.call("retire", { query: { handle: sr.handle, reason: String(f.reason || "") } }).then(said);
      }, () => said(null));
      return null;
    } },
  /* R15: watching asked by the member (`monitoring` R74: `enabled`, the bundle's own frequency kept) */
  { op: "monitorset", label: "act.monitorset.label.document",
    send(view) { return { body: { bundleId: String(view.subject || ""), enabled: true } }; },
    done(view, answer, cs) { cs.set("outcome", Object.assign({}, view.ui.outcome, { monitorset: { ok: true, html: cs.w("screen.document.monitorset.done") } })); } },
  { op: "monitor", label: "act.monitor.label.document",
    send(view) { return { body: { bundleId: String(view.subject || "") } }; },
    done(view, answer, cs) { cs.set("outcome", Object.assign({}, view.ui.outcome, { monitor: { ok: true, html: cs.w("screen.document.monitor.done") } })); } },
  { op: "identityclaim", label: "act.identityclaim.label.document", reasonField: "note",
    send(view, el, cs) {
      const b = String(cs.value("document-claim-person") || "").trim();
      const note = String(cs.value("document-claim-note") || "").trim();
      if (!b || !note || !el.dataset.entity) return { refuse: "screen.document.claim.empty" };
      const text = view.data.capture && view.data.capture.state === "ok" ? view.data.capture.value["bundle.md"] : "";
      const m = typeof text === "string" ? /^content_hash:\s*sha256:([0-9a-f]{64})/m.exec(text) : null;
      const basis = ["name", "corroborated_name", "identifier"].includes(cs.value("document-claim-basis")) ? cs.value("document-claim-basis") : "name";
      return { body: { a: el.dataset.entity, b, kind: "same_as", basis, evidence: { a: { captureSha: m ? m[1] : "" } }, note } };
    } },
  { op: "transcribe", label: "act.transcribe.label.document", reasonField: "text",
    send(view, el, cs) {
      const text = String(cs.value("document-unread-words") || "");
      const page = Number(cs.value("document-unread-page"));
      if (!text.trim() || !Number.isInteger(page)) return { refuse: "screen.document.unread.empty" };
      return { body: { bundleId: String(view.subject || ""), extent: { kind: "pdf-page", page }, text } };
    },
    done(view, answer, cs) {
      cs.set("outcome", Object.assign({}, view.ui.outcome, { transcribe: { ok: true, html: cs.w("screen.document.transcribe.done", { page: String(cs.value("document-unread-page") || "") }) } }));
      cs.set("later", Object.assign({}, view.ui.later, { reading: null }));
    } },
  { op: "pagetranscribe", label: "act.pagetranscribe.label.document",
    send(view, el) {
      const text = view.data.capture && view.data.capture.state === "ok" ? view.data.capture.value["bundle.md"] : "";
      const m = typeof text === "string" ? /^project:\s*(\S+)\s*$/m.exec(text) : null;
      return { query: { sha256: el.dataset.sha || "", ...(m ? { project: m[1] } : {}) } };
    },
    done(view, answer, cs) {
      const t = (answer && (answer.transcription || (answer.result && answer.result.transcription))) || {};
      const pages = Array.isArray(t.pages) ? t.pages.join(", ") : "";
      cs.set("outcome", Object.assign({}, view.ui.outcome, { pagetranscribe: { ok: true,
        html: cs.w("screen.document.pagetranscribe.done", { pages }) + (t.untested ? " " + cs.w("ai.label.untested") : "") } }));
      cs.set("later", Object.assign({}, view.ui.later, { reading: null }));
    } },
];

/** The keys the document screen may draw. */
const words = [
  "screen.document.name", "screen.document.purpose",
  ...["gradenote", "findin", "cite", "release", "attest", "retire", "monitorset", "monitor", "identityclaim", "transcribe", "pagetranscribe"]
    .flatMap((op) => ["act." + op + ".label.document", ...(op === "pagetranscribe" ? [] : ["act." + op + ".does"])]),
  OWN["act.pagetranscribe.does"], "ai.label.untested", "document.unread.pages",
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.grade.reading", "mark.gap.unrated.name", "mark.gap.unrated.means",
  "state.empty", "state.loading", "state.failed",
  OWN["screen.question.supports.head"], OWN["screen.question.against.head"], OWN["screen.document.cite.role"],
  ...ownRows("screen.document."),
];

/** The document screen (interface-shell R21). */
export const DOCUMENT_SCREEN = Object.freeze({ id: "document", reads, place, render, acts, words });
