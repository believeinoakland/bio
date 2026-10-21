/* screens-inquiry R3: the document screen (Projects › <project> › Document; registry screen `document`, its 11 acts).
 *
 * Self-contained functions (interface-shell R21 (1)). The document is the INFO bundle `view.subject` its capture is
 * filed in; its capture's digest is its provenance document's `documents[0].capture.sha256` (never `content_hash`, the
 * dataset digest, capture grammar C-2.7; K3387), its address `source.locator`. What needs the digest
 * or the address (the reading and its passages, the grade note, the versions) is read once the document is read.
 * `release` and `retire` act on a selection (`ratification` takes a handle), so each makes its own selection of this
 * document (`op=select`) and sends itself, drawing its own outcome beside the act. Opening the original goes through
 * `open-file` (`screens-intake`) by the capture's SHA-256, never by the bundle id (R22). `pagetranscribe` is drawn only while the assistant is reachable (interface-shell R20;
 * DEC-190). "Watch for changes" (`monitorset`, `monitoring` R74) and "Check for a new version now" (`monitor`) are two
 * acts (R15). A choice among record data (a question, a page) is `cs.choice` over `{value, text}` options (R8).
 *
 * R32 (T49): the capture's own grade object (its `heldcaptures` row, `provenance.captureGrade`), drawn as one mark, and
 * none at all where no read answers it (never "Unrated" beside a grade note); "Its versions" refused by its words; the
 * address an outside link, unquoted; the title the document's, never the address's last segment (R39); a testimony (a
 * member's firsthand observation, `op=testify`) offers Find in as a link and its words, and neither watching nor checking
 * for a new version; times by `cs.date`. Its reads gain the links the page carries (`links`, capture R57), the links it
 * makes into held documents (`links_to`, connections R24, its own references) and the mention that counts for each name
 * it holds (`on_point`, `connections`, connections R4); its acts gain `adoptversion` and `keepversion` (a newer version's
 * notice, reevaluation R15), `connectionchoose` and `explore`. Every sentence is a word by key (R44).
 * R49 (K3560): "In which question" preselects the question the capture was held for, never the group's first; the
 * document's own project's questions come first (passages section).
 *
 * T51 (R65–R70, R78): the screen follows the drawing's order (passages, Versions, "Your citations, leg by leg", "The record of
 * this copy", Fingerprints, What cites it, the links in five groups, the names with their grade and how they were matched,
 * Themes, Steps, the copy's own acts). R65 reads `bundlehistory` (the release, the log oldest first, the revisions, and two of
 * them side by side from the `image` answer the page already holds: no other read); R66 the fingerprints with Copy (`hashcopy`,
 * nothing sent); R67 the links by their verdict, an outside link opening a warning before its address (the browser acts
 * `linkopen`, `revisioncompare`: done in the page, nothing sent); R68 the names from `resolutions`; R69 one row for each
 * question that rests on the document, asked for a newer copy only when the member asks (`versionnotice`); R78 every page
 * drawn is the record's page + 1, every value sent is the record's own.
 *
 * CR-19 (R81, R82): the second "Read it" tab compares the revision a question cites with the current copy (matched by the leg's
 * `extent_capture` to `bundlehistory`'s `capture_sha`), by the browser act `revisioncompare`; the original-file card draws the
 * file's kind from the reading's format id and its size from `bytes`, and none without `bytes`. */

import { checkOutcome } from "../screens-intake/index.mjs";

/** R3: the reads that need only the document's id; the rest follow from its front matter. */
function reads(view) {
  const id = String(view.subject || "");
  return {
    capture: { op: "image", query: { id }, subject: true, empty: (v) => !v || typeof v !== "object" || !v["bundle.md"] },
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
  if (!m) return {};
  const t = view.ui && view.ui.later && view.ui.later["project:" + m[1]];
  const ft = t && t.state === "ok" && t.value && typeof t.value["bundle.md"] === "string" ? /^title:\s*(.*)$/m.exec(t.value["bundle.md"]) : null;
  let title = ft ? ft[1].trim() : "";
  try { if (title.startsWith("\"")) title = JSON.parse(title); } catch { /* raw */ }
  return { project: { id: m[1], title } };
}

/** R3, R5: the capture, its grade and note, its passages (each citable), its unread pages, its versions, what each question that
 *  rests on it asks of a newer copy, the record of this copy, its fingerprints, what cites it, the links it carries, the names
 *  it holds, its themes and steps, and its acts. */
function render(cs, view) {
  const id = String(view.subject || "");
  if (!id) return "";
  const ui = view.ui;
  const d = view.data || {};
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
          /* a refusal is drawn by its words: the plane's own, else the word held for the code, else "could not be read" */
          const held = ["NO_SUCH_BUNDLE", "NO_BUNDLE", "NO_SHA", "VERSION_NOTICE_NO_INQUIRY", "VERSION_NOTICE_NO_SUBJECT"].includes(code);
          settle({ state: "failed", refusal: { code, words: f.translation ? cs.esc(f.translation) : held ? cs.w("refusal." + code) : code ? cs.esc(code) : cs.w("shell.unread") } });
        }
        else if (r && r.found === false) settle({ state: "empty" });
        else settle({ state: "ok", value: r });
      }, () => settle({ state: "failed", refusal: null }));
    }
    return L[key];
  };
  /* R78: a page the record counts from zero is drawn from one; a run of pages as "7–9", the value sent staying the record's */
  const pg = (p) => (Number.isInteger(p) && p >= 0 ? p + 1 : null);
  const pagesText = (list) => {
    const n = list.slice().sort((a, b) => a - b), runs = [];
    for (const p of n) {
      const last = runs[runs.length - 1];
      if (last && p === last[1] + 1) last[1] = p; else runs.push([p, p]);
    }
    return runs.map(([a, b]) => (a === b ? String(a) : a + "–" + b)).join(", ");
  };
  const own = (key) => (ui.outcome && ui.outcome[key]
    ? `<p class="${ui.outcome[key].ok ? "mk-note" : "mk-msg"}" role="${ui.outcome[key].ok ? "status" : "alert"}" data-outcome="${key}">${ui.outcome[key].html}</p>` : "");
  /* a section that holds nothing is not drawn (R20): a read answered empty, or a body that draws nothing, makes no
     section; a read still pending or failed is drawn as such */
  const secOf = (titleKey, r, inner, opts) => {
    const read = typeof r === "string" ? d[r] : r;
    if (read && read.state === "empty") return "";
    const body = cs.state(read, inner);
    return body ? cs.sec(titleKey, body, opts) : "";
  };
  const doc = d.capture && d.capture.state === "ok" ? view.parts.front(d.capture.value["bundle.md"]) : null;
  if (doc) doc.source = doc.maps.source || {};
  /* R3, R32 (K3387): every capture read is keyed on the capture's own sha, from its provenance document (a testimony's
     too); never `content_hash`, which is the bundle's dataset digest (capture grammar C-2.7) */
  const prov = (() => {
    if (!doc) return null;
    let p = null;
    try { p = JSON.parse(String(d.capture.value["data/provenance.json"] || "")); } catch { p = null; }
    return p;
  })();
  const regDocs = prov && Array.isArray(prov.documents) ? prov.documents.filter((x) => x && typeof x === "object") : [];
  const sha = (() => {
    const s0 = regDocs[0] && regDocs[0].capture ? String(regDocs[0].capture.sha256 || "") : "";
    return /^[0-9a-f]{64}$/.test(s0) ? s0 : "";
  })();
  /* R65, R66: a copy that came as a set of files lists more than one entry of `documents` in its provenance register */
  const isSet = regDocs.length > 1;
  const locator = doc && doc.source ? String(doc.source.locator || "") : "";
  const out = [];
  const T = (k, f) => view.parts.plain(cs, k, f);
  const W = (k, f) => cs.w(k, f);
  const who = (x) => view.parts.who(cs, x);
  /* R6, R65: a moment with its time of day, through `time.at` ({date} by `cs.date`, {time} through `time.clock`, 12 hours) */
  const at = (iso) => {
    const t = new Date(String(iso || ""));
    if (!iso || isNaN(t.getTime())) return "";
    const h = t.getHours();
    const clock = W("time.clock", { hour: String(h % 12 === 0 ? 12 : h % 12), minute: String(t.getMinutes()).padStart(2, "0"), ampm: { html: W(h < 12 ? "time.am" : "time.pm") } });
    return W("time.at", { date: { html: cs.date(String(iso), { year: true }) }, time: { html: clock } });
  };
  const dayOf = (iso) => (iso ? cs.date(String(iso), { year: true }) : "");
  const undetermined = (raw) => W("state.undetermined", { reason: raw ? { html: `<span class="id">${cs.esc(String(raw))}</span>` } : "" });
  const shortOf = (h) => String(h).slice(0, 8) + "…" + String(h).slice(-4);
  const text = d.capture && d.capture.state === "ok" ? String(d.capture.value["bundle.md"] || "") : "";
  /* a member's firsthand observation (provenance's `op=testify`): her words, never an address to watch */
  const testimony = /Authored through op=testify/.test(text);
  const outside = /^https?:\/\//i.test(locator);
  /* R32, R39: the document's own title, never the address's last segment nor its id */
  const slug = outside ? decodeURIComponent(String(locator.split(/[?#]/)[0].replace(/\/+$/, "").split("/").pop() || "")) : "";
  const titled = doc && doc.title && doc.title !== slug && doc.title !== id ? String(doc.title) : "";
  out.push(cs.title(titled || T("state.undetermined", { reason: "" }), { thing: "document" }));
  if (!doc) { out.push(cs.state("capture", view, () => "")); return out.join(""); }
  const project = /^PROJ-/.test(String(doc.project || "")) ? String(doc.project) : "";
  const pimg = project ? later("project:" + project, "image", { id: project }) : null;
  /* R32: the address an outside link, unquoted; a testimony's source drawn as its words */
  out.push(`<p class="mk-sub">${cs.w("screen.document.captured", {
    date: { html: doc.source.retrieved ? cs.date(String(doc.source.retrieved), { year: true }) : doc.created ? cs.date(String(doc.created), { year: true }) : "" },
    source: outside ? { html: `<a class="cs-btn" data-tone="quiet" href="${cs.esc(locator)}" rel="noopener noreferrer" target="_blank" data-outward="1">${cs.esc(locator)}</a>` }
      : (locator || doc.source.authority || "") })}</p>`);

  /* R54: this copy's grade is `capturegrade`'s own answer for its digest, not the project's list of held captures; the row of
     that list (R49, R61) still says what the capture was held for. R55: the viewer's own held captures say whether this copy
     is hers and not yet vouched for. */
  /* R111 (L1): `heldcaptures` answers `{held: rows}` (capture R77), each row `{bundle_id, capture: {sha256}, captured_for, ...}` */
  const heldRows = (a) => (a && a.state === "ok" && a.value && Array.isArray(a.value.held) ? a.value.held : []);
  const isThis = (r) => !!r && ((r.capture && r.capture.sha256 === sha) || r.bundle_id === id);
  /* R3, R55, R111 (C16, C27): ONE `heldcaptures` read, the viewer's own held captures (`member` the id the plane records, capture R77), narrowed
     to this document's project where it has one: the row it finds for this copy says the copy is hers and not yet vouched for, and what it
     was held for. A document outside any project is read the same way, so its vouch box is drawn wherever it is filed. */
  const meId = view.me && view.me.member ? String(view.me.member) : "";
  const held = sha && meId ? later("held", "heldcaptures", { ...(project ? { project } : {}), member: meId, limit: "500" }) : null;
  const row = heldRows(held).find(isThis) || null;
  const gr = sha ? later("grade", "capturegrade", { capture: sha }) : null;
  const gradeObj = gr && gr.state === "ok" && gr.value && gr.value.grade ? gr.value.grade : null;
  const letter = gradeObj && /^[A-D]$/.test(String(gradeObj.grade || "")) ? String(gradeObj.grade) : "";
  const isHeld = !!row;
  const vouched = ui.outcome && ui.outcome.release && ui.outcome.release.ok === true;
  if (isHeld && !vouched) out.push(`<div class="mk-note" data-held="1"><p>${cs.w("document.held.says")}</p>`
    + cs.field("document-release-ack", "screen.document.release.ack", { area: true, rec: true })
    + cs.field("document-release-mitigation", "screen.document.release.mitigation", { area: true, rec: true })
    + cs.act("release", { label: "act.release.label.document", data: { document: id }, tone: "primary" }) + own("release") + "</div>");
  else if (vouched) out.push(`<p class="mk-note" data-vouched="1">${cs.w("document.vouched", { member: view.parts.who(cs, view.me && (view.me.handle || view.me.member) || ""), date: { html: cs.date(new Date(cs.now()).toISOString(), { year: true }) } })}</p>`);
  /* R113: a copy a member has stopped using says so, whatever page she meets it on; no second retirement is offered */
  const retiredNow = String(doc.current_state || "") === "retired";
  if (retiredNow) out.push(`<p class="mk-note" data-retired="1"><b>${cs.w("state.item.retired.name")}</b> ${cs.w("state.item.retired.means")}</p>`);
  /* R55: a held page with no title of its own is headed by its site and capture day, never the address */
  if (!titled && outside) { let site = ""; try { site = new URL(locator).hostname; } catch { site = ""; }
    out[0] = cs.title(site ? T("document.untitled.web", { site, date: doc.source.retrieved ? cs.date(String(doc.source.retrieved), { year: true }) : "" }) : T("state.undetermined", { reason: "" }), { thing: "document" }); }
  const note = sha ? later("gradenote", "gradenote", { capture: sha }) : { state: "empty" };
  /* R3, R96: the reading is read as soon as the digest is known: its passages, and how complete its text is (full, partial, none or
     unread). A reading never made is unread; one made with no words in it holds none; one with pages it could not make out is partial. */
  const reading = sha ? later("reading", "reading", { sha256: sha }) : { state: "empty" };
  const rv0 = reading.state === "ok" && reading.value && typeof reading.value === "object" ? reading.value : null;
  const words0 = rv0 && Array.isArray(rv0.text_units) ? rv0.text_units.filter((p) => p && String(p.text || "").trim()) : [];
  const blind0 = rv0 && Array.isArray(rv0.unread_pages) ? rv0.unread_pages.filter((n) => Number.isInteger(n) && n >= 0) : [];
  const textState = !sha ? "" : reading.state === "empty" ? "unread" : rv0 ? (!words0.length ? "none" : blind0.length ? "partial" : "full") : "";
  /* R66: the head's fingerprint is the first one shortened, with its tip */
  out.push(`<div class="mk-facts"><div><span class="k">${cs.w("screen.document.copy")}</span><span class="v">`
    + (letter ? cs.grade(testimony ? "testimony" : "capture", letter) : "")
    + cs.act("gradenote", { label: "act.gradenote.label.document", data: { capture: sha, letter }, tone: "quiet" }) + "</span></div>"
    + (textState ? `<div><span class="v"><span data-text-state="${textState}"${textState === "full" || textState === "none" ? "" : ' tabindex="0"'} data-level="1" data-tip="${cs.esc(cs.w("screen.document.text.tip"))}">`
      + (textState === "partial" ? cs.w("screen.document.text.partial", { pages: pagesText(blind0.map((n) => n + 1)) }) : textState === "unread" ? cs.mark("gap", "undetermined") : "") + "</span></span></div>" : "")
    + (sha ? `<div><span class="k">${cs.w("screen.document.fingerprint")}</span><span class="v"><span class="mk-tag" tabindex="0" data-level="1" data-tip="${cs.esc(cs.w("screen.document.fingerprint.means"))}">${cs.esc(sha.slice(0, 4) + "…" + sha.slice(-4))}</span></span></div>` : "")
    + (sha ? `<div><a class="cs-btn" data-tone="quiet" href="/app/open-file/${cs.esc(sha)}">${cs.w("screen.document.open")}</a></div>` : "") + "</div>");
  if (ui.gradenote) {
    const n = ui.gradenote.note;
    out.push(cs.sec("screen.document.gradenote.head", n
      ? `<p>${cs.esc(typeof n === "string" ? n : (n.says || n.text || n.how || JSON.stringify(n)))}</p>`
      : `<p>${cs.w("screen.document.gradenote.none")}</p>`, { fills: { letter: letter || T("state.undetermined", { reason: "" }) } }));
  }
  /* a testimony offers Find in as a link (screens-daily R26); any other document as the act */
  if (sha) out.push(testimony ? `<p><a class="cs-btn" data-tone="quiet" href="/app/find-in/${cs.esc(sha)}" data-nav data-findin="link">${cs.w("act.findin.label.document")}</a></p>`
    : cs.act("findin", { label: "act.findin.label.document", data: { capture: sha } }));

  /* passages: the reading's, each citable in a question the member chooses (citation R1's `found`) */
  const qs = d.questions && d.questions.state === "ok" && Array.isArray(d.questions.value.bundles) ? d.questions.value.bundles : [];
  /* R49 (K3560): the question the capture was held for (its held row's `captured_for`, the questions she may see) is
     preselected, else none is; the document's own project's questions come first, then the others she may cite into */
  const pq = project ? later("projectq:" + project, "projectquestions", { project, limit: "100" }) : { state: "empty" };
  const ownQ = new Set(pq.state === "ok" && Array.isArray(pq.value.items) ? pq.value.items.filter((x) => x && x.inquiry).map((x) => String(x.inquiry)) : []);
  const heldFor = row && row.captured_for && Array.isArray(row.captured_for.questions) ? row.captured_for.questions.filter((x) => x && x.question) : [];
  /* R118 (A6, I-11): each question is named with its project, `screen.document.cite.option`. The projects she is in are `projectlist`'s
     (project-roster R26) and each one's questions `projectquestions`'; a question no project of hers draws is named by its title alone. */
  const plist = later("projects", "projectlist", { limit: "200" });
  const projects = plist.state === "ok" && plist.value && Array.isArray(plist.value.projects) ? plist.value.projects.filter((x) => x && x.id) : [];
  const ownTitle = (() => {
    const t = pimg && pimg.state === "ok" && pimg.value && typeof pimg.value["bundle.md"] === "string" ? view.parts.front(pimg.value["bundle.md"]).title : "";
    return t ? String(t) : "";
  })();
  const projectOf = new Map();
  for (const pr of projects) {
    const q = String(pr.id) === project ? pq : later("projectq:" + pr.id, "projectquestions", { project: String(pr.id), limit: "100" });
    for (const x of q.state === "ok" && q.value && Array.isArray(q.value.items) ? q.value.items : []) if (x && x.inquiry && !projectOf.has(String(x.inquiry))) projectOf.set(String(x.inquiry), String(pr.name || ""));
  }
  if (project && ownTitle) for (const qid of ownQ) if (!projectOf.has(qid)) projectOf.set(qid, ownTitle);
  const optionOf = (value, title) => (projectOf.get(value) ? { value, key: "screen.document.cite.option", fills: { question: title, project: projectOf.get(value) } } : { value, text: title });
  const askable = qs.map((q) => ({ value: String(q.bundle_id), title: String(q.title || q.bundle_id) }));
  for (const c of heldFor) if (!askable.some((o) => o.value === String(c.question))) askable.push({ value: String(c.question), title: String(c.title || c.question) });
  const cites = askable.filter((o) => ownQ.has(o.value)).concat(askable.filter((o) => !ownQ.has(o.value))).map((o) => optionOf(o.value, o.title));
  const preset = heldFor.length ? String(heldFor[0].question) : "";
  /* the reading section is built once the revisions it compares are read (R81), in the slot it holds here */
  const readingAt = out.push("") - 1;
  const readingBody = () => secOf("document.read.title", reading, (r) => {
    /* K3387: the document's words are the reading's `text_units` (extraction R36's units, in seq order, withheld as
       the bundle is); a reading answers no other text, and with none the section says it holds nothing */
    const list = (Array.isArray(r.text_units) ? r.text_units : []).filter((p) => p && String(p.text || "").trim());
    if (!list.length) return originalCard + `<p class="cs-state" data-state="empty">${cs.w("state.empty")}</p>`;
    /* nothing is preselected unless the capture was held for a question: then the first choice says to choose one, never a blank
       (R118); a cite with it unchosen is refused in place */
    const pick = cites.length
      ? cs.choice("document-cite-question", "screen.document.cite.question", (preset ? [] : [{ value: "", key: "screen.document.cite.choose" }]).concat(cites), { value: preset })
        + cs.choice("document-cite-role", "screen.document.cite.role",
            [["supports", "screen.question.supports.head"], ["cuts_against", "screen.question.against.head"]], { value: "supports" })
      : `<p class="mk-small">${cs.w("screen.document.cite.noquestion")}</p>`;
    const pickHelp = cites.length ? `<p class="mk-small">${cs.w("screen.document.cite.question.help")}</p><p class="mk-small">${cs.w("document.read.cite.help")}</p>` : "";
    /* C30: what the last cite did, drawn beside the passages: cited, or already resting on a passage of this document (which one, and the
       question to narrow it on). The question's own legs on this document name the passage, at the record's page + 1 (R78). */
    const citeDoneHtml = () => {
      const cd = ui.citeDone && typeof ui.citeDone === "object" ? ui.citeDone : null;
      if (!cd || !cd.question || (!cd.cited.length && !cd.already.length)) return "";
      const qi = later("qimg:" + cd.question, "image", { id: cd.question });
      const qf = qi.state === "ok" && qi.value && typeof qi.value["bundle.md"] === "string" ? view.parts.front(qi.value["bundle.md"]) : null;
      const named = askable.find((o) => o.value === cd.question);
      const qtitle = qf && qf.title ? String(qf.title) : named ? named.title : "";
      const ref = cs.ref("question", cd.question, qtitle || T("state.undetermined", { reason: "" }), [qtitle]);
      if (cd.cited.length) return `<p class="mk-note" data-cite-done="cited" role="status"><b>${W("screen.finder.cite.cited")}</b> ${ref}</p>`;
      const places = (qf ? qf.lists.basis || [] : []).filter((l) => l && String(l.target) === id && l.extent_page !== undefined && l.extent_page !== "")
        .map((l) => pg(Number(l.extent_page))).filter((n) => n !== null);
      return `<p class="mk-note" data-cite-done="already" role="status"><b>${W("screen.finder.a17.left_as_it_was")}</b> ${W("screen.finder.a17.the_question_already_cited_it")}`
        + (places.length ? " · " + places.map((n) => W("screen.document.passage.where", { page: n })).join(", ") : "") + ` · ${ref}</p>`;
    };
    const none = ui.citeNone ? `<details class="mk-details" data-cite="none" open><summary>${cs.w("screen.document.cite.none.summary")}</summary><p class="mk-small">${cs.w("screen.find-in.questionfirst")}</p></details>` : "";
    /* R80, R78: the reading's pages (an extent's page counts from 0, a slide from 1) drawn from one, one at a time, with the kit's
       choice control (interface-shell R90) redrawing in the page: no op, no new read. A text of one page draws no page bar. */
    const numOf = (p) => { const e = p.extent && typeof p.extent === "object" ? p.extent : null;
      if (e && e.kind === "pdf-page" && Number.isInteger(e.page) && e.page >= 0) return e.page + 1;
      if (e && /^slide/.test(String(e.kind || "")) && Number.isInteger(e.slide) && e.slide >= 1) return e.slide;
      return null; };
    const nums = list.map(numOf).filter((n) => n !== null);
    const unreadN = Array.isArray(r.unread_pages) ? r.unread_pages.filter((n) => Number.isInteger(n) && n >= 0).map((n) => n + 1) : [];
    const pdfTotal = nums.length ? Math.max(...nums, ...unreadN) : 0;
    const pagedByNumber = pdfTotal > 1;
    /* R112 (L5): a reading whose passages carry no page is drawn in blocks of a stated size (20 passages), with the same page bar, so a
       captured web page of hundreds of passages is not drawn whole, each with its own Cite control */
    const BLOCK = 20;
    const blocks = pagedByNumber ? 0 : Math.ceil(list.length / BLOCK);
    const blocked = blocks > 1;
    const paged = pagedByNumber || blocked;
    const total = pagedByNumber ? pdfTotal : blocked ? blocks : 0;
    const first = pagedByNumber ? Math.min(...nums) : blocked ? 1 : 0;
    const asked = Number(ui.readpage);
    const cur = paged ? (Number.isInteger(asked) && asked >= 1 && asked <= total ? asked : first) : 0;
    const shown = pagedByNumber ? list.map((p, i) => [p, i]).filter(([p]) => { const n = numOf(p); return n === cur || (n === null && cur === first); })
      : blocked ? list.map((p, i) => [p, i]).slice((cur - 1) * BLOCK, cur * BLOCK) : list.map((p, i) => [p, i]);
    /* R81: the second tab, the comparison with the revision a question cites, is drawn only where that revision is found (citedRev);
       the compare tab shows the comparison in place of the passages and their pages */
    const compareOn = citedRev >= 0 && ui.readtab === "compare";
    const tabs = paged || citedRev >= 0 ? cs.checks("document-read-tab", "document.read.title",
      [{ value: "page", key: "document.read.tab.page", on: !compareOn }].concat(citedRev >= 0 ? [{ value: "compare", key: "document.read.tab.compare", on: compareOn }] : []),
      { radio: true, redraw: "readtab" }) : "";
    if (compareOn) return originalCard + tabs + compareTab();
    const bar = paged ? `<div class="mk-pagebar" data-pagebar="1">` + tabs
      + cs.checks("document-read-page", { key: "document.read.page", fills: { n: String(cur), count: String(total) } },
          (cur > 1 ? [{ value: String(cur - 1), key: "document.read.prev", on: false }] : []).concat(cur < total ? [{ value: String(cur + 1), key: "document.read.next", on: false }] : []),
          { radio: true, redraw: "readpage" }) + "</div>" : tabs;
    return originalCard + `<p class="mk-small">${cs.w("document.read.select")}</p>` + bar + (shown.length ? "" : `<p class="cs-state" data-state="empty">${cs.w("state.empty")}</p>`) + shown.map(([p, i]) => {
      const extent = p.extent && typeof p.extent === "object" ? p.extent : null;
      /* R78: the record's page 0 is drawn "Page 1"; the extent a citation sends keeps the record's own number */
      const page = extent && Number.isInteger(extent.page) ? pg(extent.page) : null;
      return `<blockquote class="mk-passage rec" data-passage="${i}">“${cs.esc(String(p.text).trim())}”`
        + (page !== null ? `<span class="mk-small">${cs.w("screen.document.passage.where", { page })}</span>` : "") + "</blockquote>"
        + (extent && cites.length ? cs.act("cite", { label: "document.read.cite",
            data: { found: JSON.stringify({ capture_sha: sha, extent, kind: "passage" }) } }) : "");
    }).join("") + pick + pickHelp + none + citeDoneHtml() + own("cite");
  }, { help: "document.read.help" });

  /* the pages its reading could not make out (extraction R27), and the two ways to their words */
  let drewTranscribe = false;
  if (reading.state === "ok" && Array.isArray(reading.value.unread_pages) && reading.value.unread_pages.length) {
    const un = reading.value.unread_pages.filter((p) => Number.isInteger(p) && p >= 0);
    /* R78: drawn from one, the picker's own choices one-based as well (a transcription sends the record's number) */
    if (un.length) out.push(cs.sec("screen.document.unread.head",
      `<p>${cs.w("document.unread.pages", { pages: pagesText(un.map((p) => p + 1)) })}</p>`
      + (view.reachable ? (drewTranscribe = true, cs.act("pagetranscribe", { label: "act.pagetranscribe.label.document", data: { sha } })) : "")
      + cs.choice("document-unread-page", "screen.document.unread.page", un.map((p) => ({ value: String(p + 1), text: String(p + 1) })), { value: String(un[0] + 1) })
      + cs.field("document-unread-words", "screen.document.unread.words", { area: true, rec: true })
      + cs.act("transcribe", { label: "act.transcribe.label.document", data: { document: id } })));
  }
  out.push(own("transcribe") + own("pagetranscribe"));
  /* R96 (C21; DEC-375): a copy whose text is not full can be read again with OCR (`pdfstructure`, `ocr=1`), which looks for the words in the
     page images; a full one offers no such act. The pages with no text are named where the reading names them. */
  /* R3, R96 (C17): the PDF reader (`pdfstructure`) reads PDFs only: a photograph or other picture (its reading's content type or format) is
     never offered it. The re-read the plane has for a picture is the assistant's reading of its page (`pagetranscribe`, extraction R71),
     offered once while the assistant is reachable and not at all when it is not (the page can still be typed). */
  const isPicture = (() => {
    const rd = rv0 && rv0.reading && typeof rv0.reading === "object" ? rv0.reading : null;
    const ct = String((rd && rd.content_type) || (rv0 && rv0.content_type) || "");
    const fm = String((rv0 && rv0.format) || (rd && rd.text_container) || "");
    return /^image\//i.test(ct) || /^(jpe?g|png|gif|webp|tiff?|bmp)$/i.test(fm);
  })();
  if (textState && textState !== "full" && sha) {
    if (isPicture) {
      if (view.reachable && !drewTranscribe) out.push(`<div class="mk-acts">${cs.act("pagetranscribe", { label: "act.pagetranscribe.label.document", data: { sha } })}</div>`);
    } else {
      const act = cs.act("pdfstructure", { label: "act.pdfstructure.label.document", data: { sha } });
      out.push(textState === "partial" && blind0.length ? cs.sheet(cs.row("", W("screen.document.ocr.says", { pages: pagesText(blind0.map((n) => n + 1)) }), act)) : `<div class="mk-acts">${act}</div>`);
    }
  }
  /* R97 (C22; DEC-375): a page another member typed is confirmed by a second member (`transcriptionattest`); the typist's own page
     offers her no confirmation, since the plane refuses it (content R25). The typings are the document's `transcriptions` (content R57),
     read for any document with a digest: a typed page can make the text whole, and it still waits for its confirmation. */
  if (sha) {
    const ty = later("typed", "transcriptions", { bundleId: id });
    const typed = ty.state === "ok" && ty.value && Array.isArray(ty.value.transcriptions) ? ty.value.transcriptions.filter((t) => t && t.content_id) : [];
    const meIds = [view.me && view.me.member, view.me && view.me.handle].filter(Boolean).map(String);
    if (typed.length) out.push(`<details class="mk-details" open data-fold="typed"><summary>${W("screen.document.attest.summary")}</summary>` + typed.map((t) => {
      const mine = meIds.includes(String(t.transcriber));
      const ext = t.extent && typeof t.extent === "object" ? t.extent : null;
      const page = ext && Number.isInteger(ext.page) ? pg(ext.page) : null;
      const name = who(t.transcriber);
      /* C17: the typed words are the page's reading: read from the typing (content R26's `transcription`) and drawn under the page typed */
      const tw = later("typing:" + String(t.content_id), "transcription", { id: String(t.content_id) });
      const words = tw.state === "ok" && tw.value && typeof tw.value.text === "string" && tw.value.text.trim()
        ? `<blockquote class="mk-passage rec" data-typed-text="1">\u201c${cs.esc(tw.value.text.trim())}\u201d</blockquote>` : "";
      return `<div data-typed="${cs.esc(String(t.content_id))}">` + cs.sheet(cs.row("", `<span class="rec">${W("screen.document.attest.row", { page: page !== null ? String(page) : String(t.ref || ""), name, date: { html: dayOf(t.at) } })}</span>`
          + `<br><span class="mk-sub">${W("screen.document.attest.status", { name })}</span>`)) + words
        + (mine ? "" : cs.field("document-attest-note-" + String(t.content_id), "screen.document.attest.note", { area: true, rec: true, help: "screen.document.attest.note.help" })
          + `<p class="mk-note">${W("screen.document.attest.at")}</p>` + cs.act("transcriptionattest", { label: "act.transcriptionattest.label.document", data: { content: String(t.content_id) } })) + "</div>";
    }).join("") + own("transcriptionattest") + "</details>");
  }
  /* R55: a picture whose text the reading could not make out, and a table read flat, say so */
  if (reading.state === "ok" && reading.value && reading.value.reading) {
    const rd0 = reading.value.reading;
    if (rd0.content_type && /^image\//.test(String(rd0.content_type)) && !(Array.isArray(reading.value.text_units) && reading.value.text_units.length))
      out.push(`<details class="mk-details" data-fold="image" open><summary>${cs.w("document.image.unread.summary")}</summary><p class="mk-small">${cs.w("document.image.unread")}</p></details>`);
    if (rd0.tables_flattened === true || rd0.table_flattened === true) out.push(`<p class="mk-note" data-note="table">${cs.w("document.table.flattened")}</p>`);
  }
  if (reading.state === "ok" && reading.value.untested && reading.value.text_provenance && reading.value.text_provenance.transcribed)
    out.push(`<p class="cs-draftlabel" data-label="untested">${cs.w("ai.label.untested")}</p>`);

  /* its versions (provenance's versionchain): a newer version than this copy marked changed; refused by its words
     (R32). Each question that rests on it asks about a newer copy on its own row (R69), never here. */
  const backs = d.backlinks && d.backlinks.state === "ok" && Array.isArray(d.backlinks.value.backlinks) ? d.backlinks.value.backlinks : [];
  const vc = outside && !testimony ? later("versions", "versionchain", { address: locator, ...(sha ? { at: sha } : {}) }) : null;
  if (vc) {
    const vbody = vc.state === "failed" ? `<p class="cs-state" data-state="failed" role="alert">${vc.refusal && vc.refusal.words ? vc.refusal.words : cs.w("state.failed", { reason: "" })}</p>`
      : vc.state === "loading" ? cs.state({ state: "loading" }, () => "") : vc.state === "ok" ? (() => {
        const v = vc.value;
        const list = Array.isArray(v.versions) ? v.versions : [];
        if (list.length < 2) return "";
        const at0 = Number.isInteger(v.at_index) ? v.at_index : list.findIndex((x) => x && (x.capture_sha === sha || x.sha256 === sha));
        const newer = at0 >= 0 && at0 < list.length - 1;
        /* R86 (C32): each other version is a reference opening that version's document; this copy is not, and a version the record holds
           no document for is a date alone */
        return (newer ? `<p class="cs-due" data-changed="true">${cs.w("screen.document.versions.changed")}</p>` : "")
          + cs.sheet(list.map((x, i) => {
            const when = x && x.first_retrieved ? cs.date(String(x.first_retrieved), { year: true }) : "";
            return cs.row("", i !== at0 && x && x.bundle_id && when ? cs.ref("document", String(x.bundle_id), when, []) : when,
              i === at0 ? `<span class="mk-small">${cs.w("screen.document.versions.this")}</span>` : "");
          }).join(""));
      })() : "";
    if (vbody) out.push(cs.sec("screen.document.versions.head", vbody));
  }

  /* R69: "Your citations, leg by leg": one row for each question that rests on this document and the viewer may see. Until the
     member asks, a row says it has not been asked (B314) and no `versionnotice` is sent for it; a notice the sweep raised
     (`reevaluationnotices`) is a read of the record, so its row is drawn asked from the start; a notice a member closed is
     drawn as decided. */
  {
    const askedFor = ui.asked || {};
    const versions = vc && vc.state === "ok" && vc.value && Array.isArray(vc.value.versions) ? vc.value.versions : [];
    const dateOfSha = (s) => { const v = versions.find((x) => x && (x.capture_sha === s || x.sha256 === s)); return v && v.first_retrieved ? String(v.first_retrieved) : ""; };
    const newestOf = (list) => list.filter(Boolean).sort().pop() || "";
    const seenQ = new Set();
    const rows = [];
    for (const x of backs.filter((b) => b && b.from_type === "inquiry" && b.from)) {
      const qid = String(x.from);
      if (seenQ.has(qid)) continue;
      seenQ.add(qid);
      const qi = later("qimg:" + qid, "image", { id: qid });
      const qf = qi.state === "ok" && qi.value && typeof qi.value["bundle.md"] === "string" ? view.parts.front(qi.value["bundle.md"]) : null;
      const pid = qf && /^PROJ-/.test(String(qf.project || "")) ? String(qf.project) : "";
      const pi = pid ? later("project:" + pid, "image", { id: pid }) : null;
      const ptitle = pi && pi.state === "ok" && pi.value && typeof pi.value["bundle.md"] === "string" ? String(view.parts.front(pi.value["bundle.md"]).title || "") : "";
      /* the place the question rests on: its legs on this document, each at the record's page + 1 (R78) */
      const places = (qf ? qf.lists.basis || [] : []).filter((l) => l && String(l.target) === id && l.extent_page !== undefined && l.extent_page !== "")
        .map((l) => pg(Number(l.extent_page))).filter((n) => n !== null);
      const nt = later("renotices:" + qid, "reevaluationnotices", { holder: qid, state: "all" });
      const list = nt.state === "ok" && nt.value ? (Array.isArray(nt.value.notices) ? nt.value.notices : Array.isArray(nt.value.items) ? nt.value.items : []) : [];
      const mine = list.filter((o) => o && (String(o.target || "") === id || o.capture_sha === sha || o.newer_capture === sha) && (o.notice || o.id));
      const stateOf = (o) => String(o.state || "open");
      const open = mine.filter((o) => stateOf(o) === "open");
      const closed = mine.filter((o) => stateOf(o) === "adopted" || stateOf(o) === "kept")
        .sort((a, b) => String(a.closed_at || "").localeCompare(String(b.closed_at || "")));
      const ans = askedFor[qid] || null;
      const unseen = (inner) => `<span class="mk-small" data-leg-state="asked">${inner}</span>`;
      let acts = "", meta = [];
      if (ptitle) meta.push(cs.esc(ptitle));
      if (places.length) meta.push(W("screen.document.place.restson", { page: pagesText(places) }));
      if (!open.length && closed.length) {
        /* decided: what she chose, who and when, in her own words; nothing more is offered for that capture */
        const c = closed[closed.length - 1];
        const adopted = stateOf(c) === "adopted";
        const fills = { member: who(c.closed_by || ""), date: { html: dayOf(c.closed_at) } };
        const sentence = c.why ? W(adopted ? "screen.document.a34.moved" : "screen.document.a34.kept", { ...fills, why: String(c.why) })
          : W(adopted ? "screen.document.a34.moved.noreason" : "screen.document.a34.kept.noreason", fills);
        meta.push(`<span data-leg-state="decided" data-decided="${cs.esc(stateOf(c))}">` + sentence + "</span>");
      } else if (ans || open.length) {
        const lines = [];
        const legs = ans && ans.state === "ok" ? ans.legs.filter((n) => n && String(n.target) === id) : [];
        const items = legs.length ? legs.map((n) => ({ state: String(n.state || ""), affects: n.affects,
          date: newestOf((Array.isArray(n.candidates) ? n.candidates : []).map((c) => c && c.first_retrieved ? String(c.first_retrieved) : "")
            .concat((Array.isArray(n.chains) ? n.chains : []).map((c) => c && c.newest && c.newest.first_retrieved ? String(c.newest.first_retrieved) : ""))) }))
          : ans && ans.state === "ok" ? [{ state: "chain_unread", affects: null, date: "" }]
          : open.map((o) => ({ state: "newer_capture", affects: o.affects || null, date: dateOfSha(String(o.newer_capture || "")) }));
        if (ans && ans.state === "failed") lines.push(cs.state({ state: "failed", refusal: ans.words ? { words: ans.words } : null }, () => ""));
        for (const it of items) {
          if (it.state === "no_newer_capture") { lines.push(`<span data-leg="none">${W("screen.document.a34.no_newer")}</span>`); continue; }
          if (it.state === "chain_unread" || it.state === "not_asked" || !it.state) {
            /* never "none": the record could not tell, and it does not guess */
            lines.push(`<span data-leg="unread">${cs.mark("gap", "undetermined")} ${W("screen.document.a34.it_does_not_guess")}</span>`);
            continue;
          }
          if (it.date) lines.push(`<span data-leg="newer">${W("screen.document.a34.a_newer_copy_exists_captured_2_october", { date: { html: dayOf(it.date) } })}</span>`);
          if (it.affects === "unaffected" && places.length) lines.push(`<span data-leg="same">${W("screen.document.a34.page_same", { page: pagesText(places) })}</span>`);
          else if (it.affects === "affected" && places.length) lines.push(`<span data-leg="differs">${W("screen.document.a34.page_differs", { page: pagesText(places) })}</span>`);
          else if (it.affects === "undetermined") lines.push(`<span data-leg="undetermined">${cs.mark("gap", "undetermined")}</span>`);
        }
        if (lines.length) meta.push(unseen(lines.join(" · ")));
        /* a newer copy is taken up or declined by a notice (reevaluation R15), so each open notice carries its two acts */
        acts = open.map((o) => { const nid = String(o.notice || o.id);
          return cs.field("document-version-why-" + nid, "shell.reason", { area: true, rec: true, help: "shell.reason.help" })
            + cs.act("adoptversion", { label: "act.adoptversion.label.document", data: { notice: nid } })
            + cs.act("keepversion", { label: "act.keepversion.label.document", data: { notice: nid } }); }).join("");
        if (nt.state === "failed") meta.push(cs.state(nt, () => ""));
      } else {
        meta.push(`<span data-leg-state="unchecked">${W("screen.document.a34.not_checked_yet")}</span>`);
        acts = cs.act("versionnotice", { label: "act.versionnotice.label.document", data: { question: qid } });
        if (nt.state === "failed") meta.push(cs.state(nt, () => ""));
      }
      rows.push(`<div data-leg-row="${cs.esc(qid)}">` + cs.row("", cs.ref("question", qid, x.from_title || T("state.undetermined", { reason: "" }), [x.from_title || ""]), "", meta.join(" · ")) + acts + "</div>");
    }
    if (rows.length) out.push(cs.sec("screen.document.a34.your_citations_leg_by_leg",
      `<p class="mk-small muted">${W("screen.document.a34.a_newer_copy_never_moves_a_citation_by_i")} ${W("screen.document.a34.each_reasoning_that_rests_on_this_docume")}</p>`
      + cs.sheet(rows.join("")), { help: "screen.document.a34.one_line_for_each_question_that_rests_on" }));
  }

  /* R65: "The record of this copy" (`bundlehistory`, promotion R58): the release that wrote it, what was done to its standing
     oldest first, and every earlier revision, two of which can be set side by side from the `image` answer already held. */
  const hist = later("history", "bundlehistory", { bundle: id });
  const image = d.capture.value;
  const revs = hist.state === "ok" && hist.value && Array.isArray(hist.value.revisions) ? hist.value.revisions.filter((r) => r && typeof r === "object").slice().sort((a, b) => Number(b.seq) - Number(a.seq)) : [];
  /* a revision's bytes, as the image answer holds them (promotion R58, record-core R15): the newest revision's file is the live
     one; an older revision's is the snapshot the promotion that replaced it archived, `_history/<name>_<snapKey>.<ext>` by the
     key of that replacing revision (the nearest newer one that wrote the file), or the live file when none did */
  const snapPath = (path, key) => { const cut = path.lastIndexOf("/"), dir = cut === -1 ? "" : path.slice(0, cut + 1), name = cut === -1 ? path : path.slice(cut + 1), dot = name.lastIndexOf(".");
    return dot === -1 ? `_history/${dir}${name}_${key}` : `_history/${dir}${name.slice(0, dot)}_${key}${name.slice(dot)}`; };
  const bytesOf = (path, i) => {
    for (let j = i - 1; j >= 0; j--) {
      const files = Array.isArray(revs[j].files) ? revs[j].files : [];
      if (files.some((f) => f && f.path === path)) { const v = image[snapPath(path, String(revs[j].snapKey))]; return typeof v === "string" ? v : null; }
    }
    const v = image[path];
    return typeof v === "string" ? v : null;
  };
  /* the standing, the grade and who vouched, as one revision's own bytes state them; null when the answer holds none */
  const factsOf = (i) => {
    const t = bytesOf("bundle.md", i);
    if (t === null) return null;
    const f = view.parts.front(t);
    const verified = (f.lists.state_history || []).filter((x) => x && x.to_state === "verified");
    let grade = "";
    try { const pj = JSON.parse(String(bytesOf("data/provenance.json", i) || "")); const g = pj && pj.documents && pj.documents[0] && pj.documents[0].capture ? String(pj.documents[0].capture.grade || "") : ""; grade = /^[A-D]$/.test(g) ? g : ""; } catch { grade = ""; }
    return { standing: String(f.current_state || ""), vouched: verified.length ? String(verified[verified.length - 1].author || "") : "", grade };
  };
  const standingWord = (to) => (to === "collected" ? W("screen.document.a27.held_until_vouched_for") : to === "verified" ? W("screen.document.a27.now_used_by_the_team")
    : to === "retired" ? W("state.item.retired.name") : undetermined(to));
  const filesOf = (r) => (Array.isArray(r.files) ? r.files.filter((f) => f && f.path) : []);
  const titleOf = (r) => T("screen.document.revision.title", { n: String(r.seq) });
  /* R65, R81: two revisions side by side, the older on the left (`ia`, `ib` index `revs`): the standing, the grade and who vouched,
     each marked where the two differ, and, for a copy that came as a set of files, the files that changed between them */
  const comparePanel = (ia, ib) => {
    const fa = factsOf(ia), fb = factsOf(ib);
    const edit = (same, left, inner) => (same ? inner : left ? `<del>${inner}</del>` : `<ins>${inner}</ins>`);
    const standingLine = (st) => (st === "collected" ? W("screen.document.a27.standing_held_until_vouched_for") : st === "verified" ? W("screen.document.a27.standing_used_by_the_team")
      : st === "retired" ? W("state.item.retired.name") : undetermined(st));
    const lines = (f, g, left) => (!f ? `<p>${cs.mark("gap", "undetermined")} ${W("screen.document.revision.nobytes")}</p>`
      : `<p>${edit(!g || f.standing === g.standing, left, standingLine(f.standing))}</p>`
      + `<p>${W("screen.document.compare.grade")} ${edit(!g || f.grade === g.grade, left, f.grade ? cs.grade("capture", f.grade) : cs.mark("gap", "undetermined"))}</p>`
      + `<p>${edit(!g || f.vouched === g.vouched, left, f.vouched ? W("screen.document.a27.vouched_for_by_dev.2", { member: who(f.vouched) }) : W("screen.document.a27.vouched_for_by_nobody"))}</p>`);
    const side = (i, f, g, left) => `<div><h3>${cs.esc(titleOf(revs[i]))}</h3><span class="mk-date">${at(revs[i].at)} · ${cs.esc(who(revs[i].author))}</span>${lines(f, g, left)}</div>`;
    /* a set of files: the files that changed between the two, each with its digest on either side */
    let changed = "";
    if (isSet) {
      const fa2 = new Map(filesOf(revs[ia]).map((f) => [String(f.path), String(f.sha256 || "")])), fb2 = new Map(filesOf(revs[ib]).map((f) => [String(f.path), String(f.sha256 || "")]));
      changed = [...new Set([...fa2.keys(), ...fb2.keys()])].filter((p) => fa2.get(p) !== fb2.get(p))
        .map((p) => `<p class="mk-small id" data-file-changed="${cs.esc(p)}">${cs.esc(p)} ${fa2.has(p) ? `<del>${W("screen.document.compare.fingerprint", { digest: shortOf(fa2.get(p)) })}</del>` : ""} ${fb2.has(p) ? `<ins>${W("screen.document.compare.fingerprint", { digest: shortOf(fb2.get(p)) })}</ins>` : ""}</p>`).join("");
    }
    return `<div class="mk-compare" data-compare="revisions">${side(ia, fa, fb, true)}${side(ib, fb, fa, false)}</div>` + changed;
  };
  /* R81 (CR-19; promotion R59): the earlier revision a question that rests on this document cites: its leg's `extent_capture` (the
     capture the leg pins) matched to a revision's `capture_sha`, among the questions the screen already reads (backlinks, each question's
     image). A leg with only a `content_id` is not matched, as no read this screen makes answers it; a capture no revision lists is not
     guessed. -1 when there is none. */
  const citedRev = (() => {
    for (const x of backs.filter((b) => b && b.from_type === "inquiry" && b.from)) {
      const qi = later("qimg:" + String(x.from), "image", { id: String(x.from) });
      const qf = qi.state === "ok" && qi.value && typeof qi.value["bundle.md"] === "string" ? view.parts.front(qi.value["bundle.md"]) : null;
      for (const l of (qf ? qf.lists.basis || [] : [])) {
        if (!l || String(l.target) !== id || !l.extent_capture) continue;
        const i = revs.findIndex((r) => r && r.capture_sha === String(l.extent_capture));
        if (i >= 1) return i;
      }
    }
    return -1;
  })();
  /* R81: the compare tab shows the cited revision beside the current copy; the browser act `revisioncompare` sets the pair (nothing sent) */
  const compareTab = () => {
    const cited = revs[citedRev], current = revs[0];
    const shownNow = ui.revcmp && String(ui.revcmp.a) === String(cited.seq) && String(ui.revcmp.b) === String(current.seq);
    return shownNow ? comparePanel(citedRev, 0)
      : cs.act("revisioncompare", { label: "screen.document.revisions.compare.act", data: { a: String(cited.seq), b: String(current.seq) } });
  };
  /* R82 (CR-19; DEC-368; extraction R77): the original file's card, its kind from the format id the reading names (its `text_container`,
     the same id the capture's format falls back to; a text/plain capture the registry leaves undetermined is `text`; an id with no row is
     `undetermined`) and its size from `bytes`; no size, no card */
  const originalCard = (() => {
    const rv = reading.state === "ok" && reading.value ? reading.value : null;
    if (!rv || !Number.isInteger(rv.bytes)) return "";
    /* R83 (CR-19; K4127): the capture format `extraction` states (R78) names the kind; the reading's own `text_container` only when none is stated */
    const stated = typeof rv.format === "string" ? rv.format.trim() : "";
    const named = stated || (rv.reading && typeof rv.reading.text_container === "string" ? rv.reading.text_container.trim() : "");
    const id0 = named || (/^text\/plain\b/.test(String(rv.content_type || "")) ? "text" : "");
    const kind = view.parts.kinds.includes(id0) ? id0 : "undetermined";
    const n = rv.bytes;
    const size = n < 1024 ? T("size.small") : n >= 1073741824 ? T("size.gb", { n: (n / 1073741824).toFixed(1) })
      : n >= 1048576 ? T("size.mb", { n: (n / 1048576).toFixed(1) }) : T("size.kb", { n: String(Math.round(n / 1024)) });
    return `<p class="mk-note" data-card="original">${W("document.read.original.card", { kind: T("document.kind." + kind), size })}</p>`;
  })();
  out[readingAt] = readingBody();

  const recordBody = (h) => {
    if (!h || typeof h !== "object") return "";
    const states = Array.isArray(h.states) ? h.states.filter((s) => s && typeof s === "object") : [];
    const hop = regDocs[0] && Array.isArray(regDocs[0].provenance_chain) ? regDocs[0].provenance_chain[0] : null;
    const rel = hop && typeof hop.who === "string" ? /Civicsmith\/([^\s)]+)/.exec(hop.who) : null;
    const parts = [];
    if (rel) parts.push(cs.sheet(cs.row("", `<b>${W("screen.document.record.release", { version: { html: `<span class="id" data-release="1">${cs.esc(rel[1])}</span>` } })}</b>`, "", W("screen.document.a27.the_release_of_civicsmith_that_wrote_thi"))));
    const first = revs.length ? revs[revs.length - 1] : null;
    const log = [];
    if (first) {
      const f0 = factsOf(revs.length - 1);
      log.push(cs.row("", `<b>${W("screen.document.record.added", { member: who(first.author) })}</b>`, "", [at(first.at), f0 && f0.standing === "collected" ? W("screen.document.a27.held_until_vouched_for") : "",
        locator ? `<span class="id">${cs.esc(locator)}</span>` : ""].filter(Boolean).join(" · ")));
    }
    for (const s of states) {
      const to = String(s.to || "");
      log.push(cs.row("", to === "verified" ? W("screen.document.a27.vouched_for_by_dev", { member: who(s.author) }) : `<b>${cs.esc(who(s.author))}</b>`, "",
        [at(s.at), standingWord(to)].filter(Boolean).join(" · ") + (s.blurb ? ` · <span class="rec">“${cs.esc(String(s.blurb))}”</span>` : "")));
    }
    if (log.length) parts.push(`<p class="mk-note">${W("screen.document.a27.everything_done_to_this_copy_s_standing_")} ${W("screen.document.a27.none_of_it_is_ever_changed_or_removed")}</p>` + cs.sheet(log.join("")));
    if (revs.length > 1) {
      const revRows = revs.map((r, i) => cs.row("", `<b>${cs.esc(titleOf(r))}</b>` + (i === 0 ? ` <span class="mk-small">${W("document.versions.thiscopy")}</span>` : ""), "",
        [dayOf(r.at), cs.esc(who(r.author))].filter(Boolean).join(" · ")
        + (isSet ? filesOf(r).map((f) => ` <span class="id">${cs.esc(String(f.path))} ${cs.esc(shortOf(String(f.sha256 || "")))}</span>`).join("") : "")));
      const opts = revs.map((r) => ({ value: String(r.seq), text: titleOf(r) }));
      const cmp = ui.revcmp && opts.some((o) => o.value === String(ui.revcmp.a)) && opts.some((o) => o.value === String(ui.revcmp.b)) ? ui.revcmp : null;
      let panel = "";
      if (cmp) {
        panel = comparePanel(revs.findIndex((r) => String(r.seq) === String(cmp.a)), revs.findIndex((r) => String(r.seq) === String(cmp.b)));
      }
      parts.push(`<details class="mk-details" data-fold="revisions"${cmp ? " open" : ""}><summary>${W("screen.document.a27.earlier_revisions_of_this_record")} <span class="muted">· ${revs.length}</span></summary>`
        + cs.sheet(revRows.join(""))
        + `<div class="mk-grid2">${cs.choice("document-rev-a", "screen.document.revisions.compare", opts, { value: cmp ? String(cmp.a) : opts[opts.length - 1].value })}`
        + `${cs.choice("document-rev-b", "screen.document.revisions.with", opts, { value: cmp ? String(cmp.b) : opts[0].value })}</div>`
        + cs.act("revisioncompare", { label: "screen.document.revisions.compare.act" }) + panel
        + (isSet ? `<p class="mk-note">${W("screen.document.a27.a_copy_that_came_as_a_set_of_files_such_")}</p>` : "") + "</details>");
    }
    if (h.truncated === true) parts.push(`<p class="mk-note" data-truncated="1">${W("screen.document.revisions.truncated", { n: String(revs.length) })}</p>`);
    return parts.join("");
  };
  if (hist.state !== "empty") {
    const body = cs.state(hist, recordBody);
    if (body) out.push(cs.sec("screen.document.a27.the_record_of_this_copy", body, { help: "screen.document.a27.who_added_this_copy_who_vouched_for_it_a" }));
  }

  /* R66: the fingerprints, each in full with its short form beside its title and a Copy that puts the full value on the clipboard
     (nothing is sent). The second, the current revision's `bundle_sha`, is for a copy that came as a set of files only. */
  if (sha) {
    const setSha = isSet && revs.length && /^[0-9a-f]{64}$/.test(String(revs[0].sha256 || "")) ? String(revs[0].sha256) : "";
    const fp = (value, titleKey, whyKey, tag) => cs.row("", `<b>${W(titleKey)}</b> <span class="id">${cs.esc(shortOf(value))}</span>`, cs.act("hashcopy", { label: "shell.copy", data: { value }, tone: "quiet" }),
      `<span class="id" data-fingerprint="${tag}">${cs.esc(value)}</span> · ${W(whyKey)}`);
    out.push(cs.sec("screen.document.fingerprints.head", cs.sheet(fp(sha, "screen.document.a26.this_copy_s_words_and_file", "screen.document.a26.computed_from_the_exact_bytes_of_this_co", "capture")
      + (setSha ? fp(setSha, "screen.document.a26.this_copy_and_the_files_captured_with_it", "screen.document.a26.computed_from_the_whole_set_so_the_set_c", "set") : ""))
      + (setSha ? `<p class="mk-note">${W("screen.document.fingerprint.setonly")}</p>` : "") + `<p class="mk-small">${W("screen.document.a26.anyone_holding_the_same_bytes_computes_t")}</p>`,
      { help: "screen.document.a26.short_codes_computed_from_the_exact_byte" }));
  }

  /* what cites it (R39: a citer without a title is undetermined, never its id) */
  out.push(secOf("screen.document.backlinks.head", "backlinks", (bk) =>
    (bk.backlinks || []).length ? cs.sheet((bk.backlinks || []).map((x) => cs.row("", cs.ref(x.from_type === "project" ? "project" : x.from_type === "inquiry" ? "question" : "document",
      String(x.from || ""), x.from_title || T("state.undetermined", { reason: "" }), [x.from_title || ""]), "")).join(""))
    + (bk.out_of_view ? `<p class="mk-small">${cs.w("screen.document.backlinks.hidden")}</p>` : "") : ""));

  /* R32, R67: the links this page carries (capture R57's `links`, resolved by capture R27) and those it makes into held documents
     (connections R24's `links_to`, its own references), in five groups, each row with the verdict word its link carries. An outside
     link is not a bare anchor: pressing it opens a warning first, and only "Open it anyway" opens the address. */
  if (sha && !testimony) {
    const lk = later("links", "links", { capture: sha, limit: "200" });
    const linked = (doc.lists.references || []).filter((r) => r && r.rel === "links_to" && r.target);
    const rows = lk.state === "ok" && Array.isArray(lk.value.links) ? lk.value.links.filter((r) => r && r.address && !r.chrome) : [];
    if (lk.state === "failed") out.push(cs.sec("document.links.title", cs.state(lk, () => ""), { help: "document.links.help" }));
    else if (rows.length || linked.length) {
      const g = { inside: [], beside: [], held: [], outside: [], refused: [] };
      for (const r of rows) {
        const part = String(r.resolution || r.partition || "");
        if (part === "anchor") g.inside.push(r);
        else if (part === "intra") g.beside.push(r);
        else if (part === "refused") g.refused.push(r);
        else if (r.target_bundle) g.held.push(r);
        else g.outside.push(r);
      }
      for (const r of linked) if (!g.held.some((o) => String(o.target_bundle) === String(r.target) || (o.address && o.address === r.address)))
        g.held.push({ address: String(r.address || ""), target_bundle: String(r.target), verdict: r.verdict, target_retrieved: r.at, title: r.title });
      const word = (k) => W("screen.document.links.verdict." + k);
      const verdictOf = (r, group) => (group === "inside" ? word("final") : group === "beside" ? word("checked") : group === "refused" ? word("refused")
        : r.verdict === "contemporaneous" ? word("same") : r.verdict === "superseded" ? word("different") : r.verdict === "undetermined" ? word("notestablished")
        : group === "outside" ? word("nocapture") : "");
      const addr = (r) => `<span class="id">${cs.esc(String(r.address) + (r.fragment && !String(r.address).includes("#") ? "#" + r.fragment : ""))}</span>`;
      const meta = (verdict, why) => (verdict ? `<b>${verdict}</b>` : "") + (why ? " · " + why : "");
      const groupOf = (key, list, draw) => (list.length ? `<p class="mk-small"><b>${W("screen.document.links.group." + key, { n: String(list.length) })}</b></p>` + cs.sheet(list.map(draw).join("")) : "");
      const leaving = ui.leaving ? String(ui.leaving) : "";
      const leave = leaving && g.outside.some((r) => String(r.address) === leaving)
        ? `<div class="cs-dialog" role="dialog" data-dialog="leave" aria-label="${W("screen.document.a30.you_are_about_to_leave_the_record")}"><b>${W("screen.document.a30.you_are_about_to_leave_the_record")}</b>`
          + `<div class="ends">${W("screen.document.a30.this_page_carried_this_address_and_the_r")} ${W("screen.document.a30.what_is_at_the_address_now_the_record_do")} ${W("screen.document.a27.opening_it_leaves_the_record_and_nothing")}</div>`
          + `<div class="id">${cs.esc(leaving)}</div><span class="mk-acts">${cs.act("linkopen", { label: "screen.document.a30.open_anyway", data: { address: leaving, step: "open" } })}`
          + `${cs.act("linkopen", { label: "screen.document.a30.stay_in_the_record", data: { step: "stay" }, tone: "quiet" })}</span></div>` : "";
      const total = g.inside.length + g.beside.length + g.held.length + g.outside.length + g.refused.length;
      const tally = g.outside.length === 0 ? W("screen.document.a30.tally.none", { n: String(total) })
        : g.outside.length === 1 ? W("screen.document.a30.tally.one", { n: String(total) })
        : W("screen.document.a30.6_links_on_this_page_4_lead_outside_the_", { n: String(total), outside: String(g.outside.length) });
      out.push(cs.sec("document.links.title",
        `<p class="mk-note" data-tally="1">${tally} ${W("screen.document.links.navleft")}</p>`
        + groupOf("inside", g.inside, (r) => cs.row("", addr(r), "", meta(verdictOf(r, "inside"), W("screen.document.a30.a_pointer_into_this_very_copy_settled_wh"))))
        + groupOf("beside", g.beside, (r) => cs.row("", addr(r), "", meta(verdictOf(r, "beside"), W("screen.document.a64.captured_together_with_this_page_and_che"))))
        + groupOf("held", g.held, (r) => cs.row("", cs.ref("document", String(r.target_bundle), String(r.title || r.address || T("state.undetermined", { reason: "" })), []), "",
            meta(verdictOf(r, "held"), (r.verdict === "contemporaneous" ? W("screen.document.a27.the_copy_your_team_holds_is_the_one_this") : "")
              + (r.target_retrieved ? (r.verdict === "contemporaneous" ? " · " : "") + W("document.links.held", { date: { html: dayOf(r.target_retrieved) } }) : ""))))
        + (g.held.length ? `<p class="mk-note">${W("screen.document.a30.the_other_verdicts_a_held_link_can_carry")} ${W("screen.document.a64.not_established_means_the_record_cannot_")}</p>` : "")
        + groupOf("outside", g.outside, (r) => cs.row("", addr(r), /^https?:\/\//i.test(String(r.address)) ? cs.act("linkopen", { label: "act.owed_linkopen.label.document", data: { address: String(r.address), step: "ask" }, tone: "quiet" }) : "",
            meta(verdictOf(r, "outside"), "")))
        + leave
        + groupOf("refused", g.refused, (r) => cs.row("", addr(r), "", meta(verdictOf(r, "refused"), W("screen.document.a30.not_an_address_the_record_will_carry") + " " + W("screen.document.a30.this_is_a_refusal_not_a_gap_in_what_was_")))),
        { help: "document.links.help" }));
    }
  }

  /* R32, R68: the names it holds, each with its grade as one mark and how it was matched (`resolutions`, entities R14, R58), the
     mention that counts (`on_point`, connections R4) chosen by the record or by a member; a person she says the record follows.
     R95: each name is a reference opening `person` with the entity id. R85: the mentions the connection row lists (connections R70)
     are offered and the one chosen is sent, never the one already on point. R100: a match she meets can be reported as wrong. */
  if (sha) {
    const rs = later("resolutions", "resolutions", { sha256: sha, limit: "500" });
    const cn = later("connections", "connections", { sha256: sha, limit: "200" });
    const names = rs.state === "ok" && rs.value && Array.isArray(rs.value.names) ? rs.value.names.filter((n) => n && n.entity_id) : [];
    const conns = cn.state === "ok" && cn.value && Array.isArray(cn.value.connections) ? cn.value.connections : [];
    const matches = rs.state === "ok" && rs.value && Array.isArray(rs.value.resolutions) ? rs.value.resolutions.filter((x) => x && x.ref && x.entity_id) : [];
    if (rs.state === "failed") out.push(cs.sec("document.names.title", cs.state(rs, () => ""), { help: "document.names.help" }));
    else if (names.length) {
      const people = names.some((n) => n.kind === "person");
      const labelOf = new Map(names.map((n) => [String(n.entity_id), String(n.label || n.entity_id)]));
      out.push(cs.sec("document.names.title", cs.sheet(names.map((n) => {
        const c = conns.find((x) => x && String(x.entity_id) === String(n.entity_id));
        const mine = c ? (c.a_capture_sha === sha ? "a" : "b") : "";
        const op = c && c.on_point ? c.on_point[mine] : null;
        const other = c ? (mine === "a" ? c.b_capture_sha : c.a_capture_sha) : "";
        const chosen = op && op.chosen_by && op.chosen_by !== "record"
          ? W("document.names.chosen.member", { who: who(op.chosen_by), date: { html: op.at ? cs.date(String(op.at), { year: true }) : "" }, why: String(op.why || "") })
          : W("document.names.chosen.record");
        const page = op && op.occurrence ? pg(Number(op.occurrence.page)) : null;
        const count = Number.isInteger(n.mentions) ? n.mentions : c && Number.isInteger(c.occurrences) ? c.occurrences : null;
        const how = W("screen.document.names.matched." + (["identifier", "reference", "reference_key", "label", "testimony"].includes(n.matched_by) ? n.matched_by : "none"));
        const said0 = page !== null && count !== null ? W("document.names.row", { n: String(count), page: String(page), chosen: { html: chosen } }) : chosen;
        const said = how + " · " + said0;
        const grade = /^[A-D]$/.test(String(n.grade || "")) ? cs.grade("subject", String(n.grade)) : cs.mark("gap", "undetermined");
        const ms = c && Array.isArray(c.mentions) ? c.mentions.filter((m) => m && m.ref) : [];
        const pick = ms.length ? cs.choice("document-mention-" + String(n.entity_id), "act.connectionchoose.label.document", [{ value: "", text: "" }].concat(ms.map((m, i) => {
          const at0 = m.position && Number.isInteger(m.position.page) ? pg(m.position.page) : null;
          return { value: String(i), text: [String(m.ref), at0 !== null ? T("screen.document.passage.where", { page: at0 }) : ""].filter(Boolean).join(" · ") };
        })), { value: "" }) : "";
        return cs.row("", cs.ref("person", String(n.entity_id), String(n.label || n.entity_id), []),
          (c ? pick + cs.act("connectionchoose", { label: "act.connectionchoose.label.document", data: { capture: sha, other: String(other || ""), entity: String(n.entity_id) } }) : "")
          + (n.kind === "person" ? cs.act("identityclaim", { label: "act.identityclaim.label.document", data: { entity: String(n.entity_id) } }) : ""),
          grade + " " + said);
      }).join(""))
        + `<p class="mk-note">${W("screen.document.a31.the_grade_on_each_name_says_how_the_matc")} ${W("screen.document.a31.it_says_nothing_about_how_far_to_trust_t")} ${W("screen.document.a31.a_connection_to_another_document_takes_t")}</p>`
        + (cn.state === "failed" ? cs.state(cn, () => "") : "")
        + own("connectionchoose")
        + (people ? cs.field("document-claim-person", "screen.document.claim.label", {})
          + cs.choice("document-claim-basis", "screen.document.claim.basis",
              [["name", "screen.document.claim.basis.name"], ["corroborated_name", "screen.document.claim.basis.corroborated"], ["identifier", "screen.document.claim.basis.identifier"]], { value: "name" })
          + cs.field("document-claim-note", "screen.document.claim.note", { area: true, rec: true }) + own("identityclaim") : "")
        + (matches.length ? `<details class="mk-details" data-fold="defect"><summary>${W("screen.document.defect.summary")}</summary><p class="mk-note">${W("screen.document.defect.says")}</p>`
          + cs.choice("document-defect-which", "screen.document.defect.which", [{ value: "", text: "" }].concat(matches.map((x, i) => ({ value: String(i), text: `\u201c${x.ref}\u201d \u00b7 ${labelOf.get(String(x.entity_id)) || x.entity_id}` }))), { value: "" })
          + `<p class="mk-small">${W("screen.document.defect.which.help")}</p>`
          + cs.field("document-defect-why", "screen.document.defect.why", { area: true, rec: true, help: "screen.document.defect.why.help" })
          + `<p class="mk-note">${W("screen.document.defect.at")}</p>` + cs.act("resolutiondefect", { label: "act.resolutiondefect.label.document", data: { sha } }) + own("resolutiondefect") + "</details>" : "")
        + cs.act("explore", { label: "act.explore.label.document", data: { from: id } }), { help: "document.names.help" }));
    }
  }

  /* R99 (C29; DEC-375): a member asserts a connection between this document and another one the team holds, by hand (`connectionassert`),
     graded D and under her name; the other document is chosen among the documents she can see */
  {
    const il = later("docs", "list", { type: "information", limit: "500" });
    const others = il.state === "ok" && il.value && Array.isArray(il.value.bundles)
      ? il.value.bundles.filter((b) => b && b.bundle_id && String(b.bundle_id) !== id && String(b.object_type || "").toLowerCase() === "information") : [];
    if (others.length) out.push(cs.sec("screen.document.connect.heading", `<p class="mk-note">${W("screen.document.connect.says")}</p>`
      + cs.choice("document-assert-other", "screen.document.connect.other", [{ value: "", text: "" }].concat(others.map((b) => ({ value: String(b.bundle_id), text: String(b.title || b.bundle_id) }))), { value: "" })
      + `<p class="mk-small">${W("screen.document.connect.other.help")}</p>`
      + cs.field("document-assert-basis", "screen.document.connect.basis", { area: true, rec: true, help: "screen.document.connect.basis.help" })
      + cs.act("connectionassert", { label: "act.connectionassert.label.document", data: { document: id } }) + own("connectionassert")
      + `<p class="mk-note">${W("screen.document.connect.again")}</p>`, { help: "screen.document.connect.help" }));
  }

  /* R56: themes this document or its passages are placed in (never evidence), placements and hunches apart, and the steps it is
     threaded to (`captureprogressions`) */
  if (sha) {
    const tl = later("themes", "themeread", { limit: "200" });
    const themes = tl.state === "ok" && tl.value && Array.isArray(tl.value.themes) ? tl.value.themes.filter((t) => t && t.theme_id).slice(0, 20) : [];
    const lines = [];
    /* R78: a placement's page is the record's, drawn from one; none stated, none drawn */
    const pageOf = (v) => (v === null || v === undefined || v === "" || !Number.isInteger(Number(v)) ? null : pg(Number(v)));
    for (const t of themes) {
      const r = later("theme:" + t.theme_id, "themeread", { id: String(t.theme_id), limit: "500" });
      if (r.state !== "ok" || !r.value) continue;
      const mine = (x) => x && (String(x.document || "") === id || String(x.target || "").split(/[#/:?]/)[0] === id);
      for (const m of (Array.isArray(r.value.members) ? r.value.members : []).filter(mine))
        lines.push(`<p class="mk-small" data-theme="${cs.esc(t.theme_id)}"><b>${cs.esc(String(t.name || ""))}</b> ${pageOf(m.page) !== null ? cs.w("screen.document.theme.page", { page: String(pageOf(m.page)), name: String(m.placer_handle || ""), date: { html: m.placed_at ? cs.date(String(m.placed_at), { year: true }) : "" }, note: String(m.note || "") })
          : cs.w("screen.document.theme.whole", { kind: T("shell.card.document"), name: String(m.placer_handle || ""), date: { html: m.placed_at ? cs.date(String(m.placed_at), { year: true }) : "" } })}`
          + cs.act("themewithdraw", { label: "act.themewithdraw.label.document", data: { theme: String(t.theme_id), target: String(m.target || id) } }) + "</p>");
      for (const h of (Array.isArray(r.value.hunches) ? r.value.hunches : []).filter(mine))
        lines.push(`<p class="mk-small" data-hunch="${cs.esc(t.theme_id)}"><span class="cs-hunch" data-mark="hunch">${cs.w("theme.hunch.mark")}</span> <b>${cs.esc(String(t.name || ""))}</b> ${cs.w("screen.document.theme.proposed", { page: String(pageOf(h.page) === null ? "" : pageOf(h.page)), date: { html: h.proposed_at ? cs.date(String(h.proposed_at), { year: true }) : "" }, note: String(h.proposal_note || "") })}`
          + cs.act("themewithdraw", { label: "act.themewithdraw.label.document", data: { theme: String(t.theme_id), target: String(h.target || id) } }) + "</p>");
    }
    const placeBox = themes.length ? cs.choice("document-theme-which", "theme.section", themes.map((t) => ({ value: String(t.theme_id), text: String(t.name || "") })), {})
      + cs.field("document-theme-note", "theme.place", { rec: true })
      + cs.act("themeplace", { label: "theme.place", data: { target: id } }) + cs.act("themepropose", { label: "theme.propose", data: { target: id } }) : "";
    if (tl.state === "failed") out.push(cs.sec("theme.section", cs.state(tl, () => "")));
    else if (lines.length || placeBox) out.push(cs.sec("theme.section", lines.join("") + `<p class="mk-small">${W("theme.never.evidence")}</p>` + placeBox));
    const pgr = later("progs", "captureprogressions", { sha256: sha });
    const plist = pgr.state === "ok" && pgr.value ? (Array.isArray(pgr.value.instances) ? pgr.value.instances : Array.isArray(pgr.value.progressions) ? pgr.value.progressions : []) : [];
    if (pgr.state === "failed") out.push(cs.sec("progression.threadedto", cs.state(pgr, () => "")));
    else if (plist.length) {
      /* R84 (C25): a flow the document is threaded under is threaded to another of its steps by `thread` with the flow's key, the entity
         and one placement for the step chosen among the flow's own (`progression`); each flow and entity once */
      const flows = [];
      for (const x of plist) if (x && x.progression_key && x.entity_id && !flows.some((f) => f.key === String(x.progression_key) && f.entity === String(x.entity_id)))
        flows.push({ key: String(x.progression_key), entity: String(x.entity_id), label: String(x.progression_label || x.label || x.progression_key) });
      const threadBox = flows.map((f, i) => {
        const def = later("flow:" + f.key, "progression", { key: f.key });
        const stages = def.state === "ok" && def.value && Array.isArray(def.value.stages) ? def.value.stages.filter((g) => g && g.stage_key) : [];
        return stages.length ? cs.choice("document-thread-stage-" + i, "progression.steps", [{ value: "", text: "" }].concat(stages.map((g) => ({ value: String(g.stage_key), text: String(g.label || g.stage_key) }))), { value: "" })
          + cs.act("thread", { label: "progression.thread.here", data: { progression: f.key, entity: f.entity, n: String(i), sha } }) : "";
      }).join("");
      out.push(cs.sec("progression.threadedto", cs.sheet(plist.map((x) => cs.row("", `<span class="rec">${cs.esc(String(x.progression_label || x.label || x.progression_key || ""))}</span>`, "",
        W("progression.followed", { progression: String(x.progression_label || x.label || x.progression_key || ""), n: String(x.definition_version || x.thread_version || "") }))).join("")) + threadBox + own("thread")));
    }
  }

  /* R55: the copy's other acts sit at the foot: attest with when it is useful, whether its route can be shown (R98), watching and checking
     (R15, R92, R118) and retire folded apart (R113). Watching names its frequency; "Check for a new version now" is drawn only for an address
     that is watched (its `monitoring.enabled`), otherwise the page says it is not and offers "Watch for changes". */
  const watched = !testimony && !!(doc.maps.monitoring && String(doc.maps.monitoring.enabled) === "true");
  /* R98 (K4259; provenance-routes R15): the document's standing route is read (`provenanceroutes` with `bundleId`); the answer of the act she
     pressed, newer than the read, stands over it until the page reads it again */
  const routeRead = later("route", "provenanceroutes", { bundleId: id });
  const routeNow = ui.route && typeof ui.route === "object" ? ui.route : routeRead.state === "ok" && routeRead.value && typeof routeRead.value === "object" ? routeRead.value : null;
  const finding = routeNow && routeNow.route && typeof routeNow.route === "object" ? String(routeNow.route.finding || "") : "";
  out.push(cs.sec("screen.document.copyacts.head",
    cs.act("attest", { label: "document.attest.label", data: { sha } }) + `<p class="mk-small">${cs.w("document.attest.when")}</p>` + own("attest")
    /* the registry's `captureprogressions`: the steps this document is threaded to, asked for again by the member (above, R56, they are
       drawn from the read the page makes when it opens) */
    + (sha ? cs.act("captureprogressions", { label: "act.captureprogressions.label.document", data: { sha }, tone: "quiet" }) : "")
    + cs.sheet(cs.row("", `<span class="rec" data-route="${cs.esc(finding || "unchecked")}">${W(finding === "PRESENT" ? "screen.document.route.shown" : finding === "LOOKED_INDETERMINATE" ? "screen.document.route.notshown" : "screen.document.route.standing")}</span>`
      + `<br><span class="mk-sub">${W("screen.document.route.says")}</span>`, cs.act("provenanceroute", { label: "act.provenanceroute.label.document", data: { document: id } })))
    + (routeRead.state === "failed" && !ui.route ? cs.state(routeRead, () => "") : "")
    + (routeNow && routeNow.appended === false ? `<p class="mk-note" data-route-same="1">${W("screen.document.route.same")}</p>` : "") + own("provenanceroute")
    + (testimony ? "" : (watched ? "" : `<details class="mk-details" data-unwatched="1" open><summary>${W("screen.document.unwatched.head")}</summary><p class="mk-small">${W("screen.document.unwatched")}</p></details>`)
      /* R92, C35: the first frequency is the one shown and the one sent: "Every day" is chosen, with no empty option before it */
      + cs.choice("document-watch-freq", "screen.capture.address.freq", ["daily", "weekly", "monthly", "hourly", "per_meeting"].map((f) => [f, "screen.capture.address.freq." + f]), { value: "daily" })
      + cs.act("monitorset", { label: "act.monitorset.label.document", data: { document: id } }) + own("monitorset")
      + (watched ? cs.act("monitor", { label: "act.monitor.label.document", data: { document: id } }) + own("monitor") : ""))
    + (retiredNow ? "" : `<details class="mk-details" data-fold="retire"><summary>${cs.w("document.retire.fold")}</summary><p class="mk-small">${cs.w("document.retire.when")}</p>`
      + cs.act("retire", { label: "document.retire.label", data: { document: id } }) + own("retire") + "</details>")));

  /* R108 (C23; DEC-381): "Where this document came from", after "This copy": the system it came from, declared by a member with her name
     and the date (`declareorigin`, provenance R64). A second declaration is added beside the first and never replaces it: the
     declarations made on this page stay listed in the order they were made. */
  /* the declarations are read (`origins`, provenance R70: oldest first, each `{seq, system, by, at}`); a read that fails is drawn failed */
  const og = later("origins", "origins", { bundleId: id });
  const origins = og.state === "ok" && og.value && Array.isArray(og.value.origins) ? og.value.origins.filter((o) => o && o.system) : [];
  /* R108 (C20): the statement an upload stored (provenance R63: the register document's `origin_statement` `{text, words_of}`, the member's words,
     never evidence of the file's truth) is drawn first, as its fields, each under its word key (the labels the capture screen composed it
     with: how it was got, where and when, what it shows), then who said it and when. A field it holds no words for is not drawn. */
  const statementHtml = (() => {
    const src = (regDocs.find((x) => x.origin_statement && typeof x.origin_statement === "object" && typeof x.origin_statement.text === "string" && x.origin_statement.text.trim()) || {}).origin_statement
      || (prov && prov.origin_statement && typeof prov.origin_statement.text === "string" && prov.origin_statement.text.trim() ? prov.origin_statement : null);
    if (!src) return "";
    const keys = ["screen.capture.file.how", "screen.capture.file.where", "screen.capture.file.what"].map((k) => [k, T(k)]);
    const got = [];
    for (const ln of String(src.text).split(/\r?\n/)) {
      const hit = keys.find(([, lab]) => ln.startsWith(lab + ": "));
      if (hit) got.push({ key: hit[0], value: ln.slice(hit[1].length + 2) });
      else if (got.length) got[got.length - 1].value += "\n" + ln;
    }
    const fields = got.filter((g) => g.value.trim());
    /* a statement in none of the labels' words is drawn as the member wrote it, under no head */
    const body = fields.length ? fields.map((g) => `<p data-statement-field="${g.key}"><b>${W(g.key)}</b> <span class="rec">${cs.esc(g.value.trim())}</span></p>`).join("")
      : `<p class="rec" data-statement-raw="1">${cs.esc(String(src.text).trim())}</p>`;
    const by = src.words_of ? `<p class="mk-small">${W("screen.document.said_by", { member: who(String(src.words_of).replace(/^member:/, "")), date: { html: dayOf(doc.source.retrieved || doc.created) } })}</p>` : "";
    return `<div class="mk-note" data-statement="1">${body}${by}</div>`;
  })();
  out.push(cs.sec("screen.document.origin.head", statementHtml + cs.field("document-origin-system", "screen.document.origin.field", { rec: true, help: "screen.document.origin.eg" })
    + cs.act("declareorigin", { label: "act.owed_declareorigin.label.document", data: { document: id }, tone: "primary" }) + own("declareorigin")
    + `<p class="mk-note">${W("screen.document.origin.second1")} ${W("screen.document.origin.second2")}</p>`
    + (origins.length ? cs.sheet(origins.map((o) => `<div data-origin="${cs.esc(String(o.seq))}">` + cs.row("", `<span class="rec">${cs.esc(String(o.system))}</span>`, "",
        [cs.esc(who(o.by)), o.at ? cs.date(String(o.at), { year: true }) : ""].filter(Boolean).join(" \u00b7 ")) + "</div>").join("")) : "")
    + (og.state === "failed" ? cs.state(og, () => "") : ""), { help: "screen.document.origin.tip" }));
  return out.join("");
}

/** R117 (L9, L20): a refusal whose answer carries `findings[]` is drawn by its first finding, not by the code's generic sentence: the
 *  word held for the finding's code where there is one, else the finding's own words (`translation`, else `detail`) with its check.
 *  A refusal with no finding is the word held for its code, else the plane's words. Self-contained (the page carries it by its text). */
function findingsRefusal(refusal, cs) {
  const r = refusal && typeof refusal === "object" ? refusal : {};
  const f = (Array.isArray(r.findings) ? r.findings : []).find((x) => x && typeof x === "object" && (x.code || x.translation || x.detail));
  if (f) {
    const key = f.code ? "refusal." + f.code : "";
    if (key && cs.w(key) !== key) return cs.w(key);
    return (f.check ? '<span class="id">' + cs.esc(String(f.check)) + "</span> " : "") + cs.esc(String(f.translation || f.detail || ""));
  }
  const generic = "refusal." + String(r.code || r.reason || "");
  return cs.w(generic) !== generic ? cs.w(generic) : r.translation ? cs.esc(String(r.translation)) : cs.w("shell.unread");
}

/** R3's, R15's, R32's, R56's and R61's acts. */
const acts = [
  /* R56: a placement in a theme (or a hunch, apart), taken out with a reason */
  ...["themeplace", "themepropose"].map((op) => ({ op, label: "theme." + (op === "themeplace" ? "place" : "propose"),
    send(view, el, cs) {
      const theme = String(cs.value("document-theme-which") || "");
      if (!theme) return { refuse: "screen.document.cite.noquestion" };
      const note = String(cs.value("document-theme-note") || "").trim();
      return { body: { theme, target: String(view.subject || ""), ...(note ? { note } : {}) } };
    },
    done(view, answer, cs) { cs.set("later", Object.assign({}, view.ui.later, { themes: null })); } })),
  { op: "themewithdraw", label: "act.themewithdraw.label.document", reasonField: "reason",
    send(view, el) { return { body: { theme: String(el.dataset.theme || ""), target: String(el.dataset.target || view.subject || "") } }; },
    done(view, answer, cs) { cs.set("later", Object.assign({}, view.ui.later, { themes: null })); } },
  /* the registry's `captureprogressions` (progressions R19): the steps of every flow this capture is threaded to, read again at the member's
     press, and drawn where R56 draws them */
  { op: "captureprogressions", label: "act.captureprogressions.label.document", rereads: [],
    send(view, el) { return { query: { sha256: String(el.dataset.sha || "") } }; },
    done(view, answer, cs) { cs.set("later", Object.assign({}, view.ui.later, { progs: null })); } },
  /* R84 (C25): the flow's key, the entity (from `captureprogressions`) and one placement for the step chosen among the flow's own */
  { op: "thread", label: "progression.thread.here",
    send(view, el, cs) {
      const stage = String(cs.value("document-thread-stage-" + String(el.dataset.n || "")) || "");
      if (!stage) return { refuse: "capture.fieldneeded", fills: { field: { html: cs.w("progression.steps") } } };
      return { body: { progressionKey: String(el.dataset.progression || ""), entityId: String(el.dataset.entity || ""), placements: [{ stage, captureSha: String(el.dataset.sha || "") }] } };
    },
    done(view, answer, cs) { cs.set("later", Object.assign({}, view.ui.later, { progs: null })); } },
  /* R32, R69: a newer version's notice decided here: adopt it with her reason, or keep the version cited; the rows re-read their
     notices, so a decided row is drawn as decided */
  /* C41 (R35, R50, R117): a basis version the plane refused is drawn by its first finding, as a refused basis is */
  { op: "adoptversion", label: "act.adoptversion.label.document", reasonField: "why", rereads: ["backlinks"], refusals: { BASIS_VERSION_REFUSED: findingsRefusal },
    send(view, el, cs) {
      const notice = String(el.dataset.notice || "");
      const why = String(cs.value("document-version-why-" + notice) || "").trim();
      return { body: { notice, why } };
    },
    done(view, answer, cs) { cs.set("later", Object.fromEntries(Object.entries(view.ui.later || {}).filter(([k]) => !k.startsWith("renotices:")))); } },
  { op: "keepversion", label: "act.keepversion.label.document", rereads: ["backlinks"], refusals: { BASIS_VERSION_REFUSED: findingsRefusal },
    send(view, el, cs) {
      const notice = String(el.dataset.notice || "");
      const why = String(cs.value("document-version-why-" + notice) || "").trim();
      return { body: { notice, ...(why ? { why } : {}) } };
    },
    done(view, answer, cs) { cs.set("later", Object.fromEntries(Object.entries(view.ui.later || {}).filter(([k]) => !k.startsWith("renotices:")))); } },
  /* R69: asked by the member for one question, never on load: whether a newer copy of this document exists (reevaluation R10, R11);
     the answer is kept for that question's row */
  { op: "versionnotice", label: "act.versionnotice.label.document", rereads: [],
    send(view, el) { view.ui.asking = String(el.dataset.question || ""); return { query: { target: String(el.dataset.question || "") } }; },
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      const q = String((r && r.target) || view.ui.asking || "");
      const next = Object.assign({}, view.ui.asked);
      next[q] = r && r.ok !== false && Array.isArray(r.notices) ? { state: "ok", legs: r.notices } : { state: "failed", words: r && r.translation ? cs.esc(r.translation) : "" };
      cs.set("asked", next);
    } },
  /* R32: the mention that counts for a name, chosen by her (connections R14–R16) */
  /* R85 (C28; B18): the mention she chose among those the connection row lists (connections R70), by its `ref`, and its `occurrence` where
     the reading kept one; the mention already on point is never the default, and none chosen sends nothing */
  { op: "connectionchoose", label: "act.connectionchoose.label.document", rereads: [],
    send(view, el, cs) {
      const ds = el.dataset;
      const L = view.ui.later || {};
      const rows = L.connections && L.connections.state === "ok" && L.connections.value && Array.isArray(L.connections.value.connections) ? L.connections.value.connections : [];
      const c = rows.find((x) => x && String(x.entity_id) === String(ds.entity || ""));
      const ms = c && Array.isArray(c.mentions) ? c.mentions.filter((m) => m && m.ref) : [];
      const at = String(cs.value("document-mention-" + String(ds.entity || "")) || "");
      const m = at !== "" && /^\d+$/.test(at) ? ms[Number(at)] : null;
      if (!m) return { refuse: "capture.fieldneeded", fills: { field: { html: cs.w("act.connectionchoose.label.document") } } };
      return { body: { capture: ds.capture || "", other: ds.other || "", entity: ds.entity || "", ref: String(m.ref), ...(m.occurrence !== null && m.occurrence !== undefined ? { occurrence: m.occurrence } : {}) } };
    },
    done(view, answer, cs) { cs.set("later", Object.assign({}, view.ui.later, { connections: null })); } },
  /* R32: the connection graph started from this document (`explore`'s screen, its own reads) */
  { op: "explore", label: "act.explore.label.document",
    send(view, el, cs) { cs.go("explore", String(el.dataset.from || view.subject || "")); return null; } },
  { op: "gradenote", label: "act.gradenote.label.document",
    send(view, el) { return { query: { capture: el.dataset.capture || "" } }; },
    done(view, answer, cs) { cs.set("gradenote", answer && answer.result !== undefined ? answer.result : answer); },
    rereads: [] },
  { op: "findin", label: "act.findin.label.document",
    /* `find-in`'s scope is the route's subject: for a document, its capture's digest (screens-daily) */
    send(view, el, cs) { if (el.dataset.capture) cs.go("find-in", el.dataset.capture); return null; } },
  { op: "cite", label: "act.cite.label.document", refusals: { BASIS_REFUSED: findingsRefusal, ACTION_BASIS_REFUSED: findingsRefusal },
    send(view, el, cs) {
      const question = String(cs.value("document-cite-question") || "").trim();
      if (!question) { cs.set("citeNone", true); return null; }
      cs.set("citeNone", false);
      const role = cs.value("document-cite-role") === "cuts_against" ? "cuts_against" : "supports";
      view.ui.citing = question;
      return { query: { project: question, role, found: el.dataset.found || "" } };
    },
    /* C30 (R3, R49): the answer is read, never left silent: what was cited, or that the question already rests on a passage of this document
       (citation answers 200 with `cited: []` and `alreadyCited`); the page then names the passage and links the question, where it is narrowed */
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      const list = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === "string" && x) : []);
      cs.set("citeDone", { question: String((r && r.inquiry) || view.ui.citing || ""), cited: list(r && r.cited), already: list(r && r.alreadyCited) });
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
        o[key] = { ok, html: ok ? "" : (r && (r.findings || r.translation) ? view.parts.findingsRefusal(r, cs) : cs.w("state.failed", { reason: (r && (r.code || r.reason)) || "" })) };
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
  /* R113 (L11): Confirm, with her reason, selects this copy and then retires it with the handle; the shell draws the plane's refusal beside
     the act and, on success, the page says the copy is retired by key and reads the document again. A reason is the member's: with none
     nothing is sent. A select that fails draws its own refusal and sends no retire. */
  { op: "retire", label: "act.retire.label.document", rereads: ["capture"],
    dialog: [{ name: "reason", label: "screen.document.retire.reason" }],
    async send(view, el, cs, extra) {
      const reason = String(((extra && extra.fields) || {}).reason || "").trim();
      if (!reason) return { refuse: "shell.reason.needed" };
      const s = await cs.call("select", { body: { ids: [String(view.subject || "")] } }).catch(() => null);
      const sr = s && s.result !== undefined ? s.result : s;
      if (!sr || !sr.handle) {
        cs.set("outcome", Object.assign({}, view.ui.outcome, { retire: { ok: false, html: sr && (sr.findings || sr.translation) ? view.parts.findingsRefusal(sr, cs) : cs.w("shell.unread") } }));
        return null;
      }
      return { query: { handle: sr.handle, reason } };
    },
    done(view, answer, cs) {
      cs.set("outcome", Object.assign({}, view.ui.outcome, { retire: { ok: true, html: cs.w("state.item.retired.name") + " " + cs.w("state.item.retired.means") } }));
      cs.set("later", Object.assign({}, view.ui.later, { history: null }));
    } },
  /* R15, R92 (C54): watching asked by the member (`monitoring` R74: `enabled` and the frequency she chose, one of its words); with none
     chosen nothing is sent; the page says it is watched only once the plane has answered, and reads the document again */
  { op: "monitorset", label: "act.monitorset.label.document", rereads: ["capture"],
    send(view, el, cs) {
      const frequency = ["daily", "weekly", "monthly", "hourly", "per_meeting"].find((f) => f === cs.value("document-watch-freq"));
      if (!frequency) return { refuse: "capture.fieldneeded", fills: { field: { html: cs.w("screen.capture.address.freq") } } };
      return { body: { bundleId: String(view.subject || ""), enabled: true, frequency } };
    },
    done(view, answer, cs) { cs.set("outcome", Object.assign({}, view.ui.outcome, { monitorset: { ok: true, html: cs.w("screen.document.monitorset.done") } })); } },
  /* R15, R93 (C55): what the check found, drawn by the one drawing `screens-intake` owns (its R42) from the answer's `status` and note */
  { op: "monitor", label: "act.monitor.label.document",
    send(view) { return { body: { bundleId: String(view.subject || "") } }; },
    done(view, answer, cs) {
      const c = view.data.capture && view.data.capture.state === "ok" ? view.parts.front(String(view.data.capture.value["bundle.md"] || "")) : null;
      cs.set("outcome", Object.assign({}, view.ui.outcome, { monitor: { ok: true, html: view.parts.checkOutcome(cs, answer && answer.result !== undefined ? answer.result : answer, c && c.title ? String(c.title) : "") } }));
    } },
  { op: "identityclaim", label: "act.identityclaim.label.document", reasonField: "note",
    send(view, el, cs) {
      const b = String(cs.value("document-claim-person") || "").trim();
      const note = String(cs.value("document-claim-note") || "").trim();
      if (!b || !note || !el.dataset.entity) return { refuse: "screen.document.claim.empty" };
      const text = view.data.capture && view.data.capture.state === "ok" ? view.data.capture.value["bundle.md"] : "";
      /* the capture's own sha, from its provenance document (K3387) */
      let prov = null;
      try { prov = JSON.parse(String((view.data.capture && view.data.capture.state === "ok" && view.data.capture.value["data/provenance.json"]) || "")); } catch { prov = null; }
      const capSha = prov && Array.isArray(prov.documents) && prov.documents[0] && prov.documents[0].capture ? String(prov.documents[0].capture.sha256 || "") : "";
      const m = /^[0-9a-f]{64}$/.test(capSha) ? [null, capSha] : null;
      const basis = ["name", "corroborated_name", "identifier"].includes(cs.value("document-claim-basis")) ? cs.value("document-claim-basis") : "name";
      return { body: { a: el.dataset.entity, b, kind: "same_as", basis, evidence: { a: { captureSha: m ? m[1] : "" } }, note } };
    } },
  { op: "transcribe", label: "act.transcribe.label.document", reasonField: "text",
    send(view, el, cs) {
      const text = String(cs.value("document-unread-words") || "");
      /* R78: the picker draws the page from one; the extent sent is the record's own number */
      const page = Number(cs.value("document-unread-page")) - 1;
      if (!text.trim() || !Number.isInteger(page) || page < 0) return { refuse: "screen.document.unread.empty" };
      return { body: { bundleId: String(view.subject || ""), extent: { kind: "pdf-page", page }, text } };
    },
    done(view, answer, cs) {
      cs.set("outcome", Object.assign({}, view.ui.outcome, { transcribe: { ok: true, html: cs.w("screen.document.transcribe.done", { page: String(cs.value("document-unread-page") || "") }) } }));
      cs.set("later", Object.assign({}, view.ui.later, { reading: null }));
    } },
  /* R96 (C21; DEC-375): the copy read again with OCR, for the pages Civicsmith's own reading could not make out (extraction R31–R35). The
     owner's refusals are drawn by the design's words. The reading is read again once it has answered. */
  { op: "pdfstructure", label: "act.pdfstructure.label.document",
    refusals: { REEXTRACT_NOT_CAPABLE: "screen.document.ocr.refused.capable", REEXTRACT_NO_OCR_MEMBER: "screen.document.ocr.refused.member", REEXTRACT_NOT_READ: "screen.document.ocr.refused.unread" },
    send(view, el) { return { query: { sha256: String(el.dataset.sha || ""), ocr: "1" } }; },
    done(view, answer, cs) { cs.set("later", Object.assign({}, view.ui.later, { reading: null })); } },
  /* R97 (C22; DEC-375): a second member confirms another member's typing of a page, with her note of what she compared (content R25); the
     typist's own is refused by the plane and offered no confirmation on the page */
  { op: "transcriptionattest", label: "act.transcriptionattest.label.document", reasonField: "note",
    refusals: { TRANSCRIPTION_SELF_ATTEST: "screen.document.attest.refused.self", ATTEST_NO_NOTE: "screen.document.attest.refused.note" },
    send(view, el, cs) {
      const contentId = String(el.dataset.content || "");
      const note = String(cs.value("document-attest-note-" + contentId) || "").trim();
      if (!note) return { refuse: "screen.document.attest.refused.note" };
      return { body: { contentId, note } };
    },
    done(view, answer, cs) { cs.set("later", Object.assign({}, view.ui.later, { typed: null })); } },
  /* R98 (C24; DEC-375): whether the document's route to the team can be shown, checked and recorded under her name (provenance-routes); the
     answer is read back: shown, not shown, or nothing new since the last check */
  { op: "provenanceroute", label: "act.provenanceroute.label.document",
    refusals: { ROUTE_MARK_NO_SUCH_BUNDLE: "screen.document.route.refused", ROUTE_MARK_NO_BUNDLE: "screen.document.route.refused" },
    /* C32: the arm reads `bundleId` from the query (provenance-routes R9), so it is sent there and in no body */
    send(view) { return { query: { bundleId: String(view.subject || "") } }; },
    done(view, answer, cs) { cs.set("route", answer && answer.result !== undefined ? answer.result : answer); } },
  /* R99 (C29; DEC-375): a connection she asserts by hand between this document and another one (connections R53), with her reason; graded D */
  { op: "connectionassert", label: "act.connectionassert.label.document", reasonField: "basis",
    refusals: { CONNECTION_ASSERT_NO_BASIS: "screen.document.connect.refused.basis", CONNECTION_ASSERT_BASIS_TOO_LONG: "screen.document.connect.refused.basis", NO_SUCH_BUNDLE: "screen.document.connect.refused.other" },
    send(view, el, cs) {
      const b = String(cs.value("document-assert-other") || "");
      const basis = String(cs.value("document-assert-basis") || "").trim();
      if (!b) return { refuse: "screen.document.connect.refused.other" };
      if (!basis) return { refuse: "screen.document.connect.refused.basis" };
      return { body: { a: String(view.subject || ""), b, basis } };
    } },
  /* R100 (C31; DEC-375): a match the record made, reported as wrong with her reason (entities R38); the match itself does not change */
  { op: "resolutiondefect", label: "act.resolutiondefect.label.document", reasonField: "reason",
    refusals: { NO_REASON: "screen.document.defect.refused.why", NO_REF: "screen.document.defect.refused.gone", NO_ENTITY: "screen.document.defect.refused.gone" },
    send(view, el, cs) {
      const L = view.ui.later || {};
      const rows = L.resolutions && L.resolutions.state === "ok" && L.resolutions.value && Array.isArray(L.resolutions.value.resolutions)
        ? L.resolutions.value.resolutions.filter((x) => x && x.ref && x.entity_id) : [];
      const at = String(cs.value("document-defect-which") || "");
      const m = at !== "" && /^\d+$/.test(at) ? rows[Number(at)] : null;
      if (!m) return { refuse: "capture.fieldneeded", fills: { field: { html: cs.w("screen.document.defect.which") } } };
      const reason = String(cs.value("document-defect-why") || "").trim();
      if (!reason) return { refuse: "screen.document.defect.refused.why" };
      return { body: { captureSha: String(el.dataset.sha || ""), ref: String(m.ref), entityId: String(m.entity_id), reason } };
    },
    done(view, answer, cs) { cs.set("later", Object.assign({}, view.ui.later, { resolutions: null })); } },
  /* R108 (C23; DEC-381): the system this document came from, declared with her name and the date (provenance R64); a second declaration is
     added beside the first and never replaces it, so each answer is kept in the list the page draws */
  { op: "declareorigin", label: "act.owed_declareorigin.label.document",
    refusals: { ORIGIN_NOT_A_MEMBER: (r, cs) => cs.w("screen.document.origin.ref.machine1") + " " + cs.w("screen.document.origin.ref.machine2"),
      ORIGIN_NO_SYSTEM: "screen.document.origin.ref.empty", ORIGIN_NOT_A_DOCUMENT: "screen.document.origin.ref.notdoc" },
    send(view, el, cs) {
      const system = String(cs.value("document-origin-system") || "").trim();
      if (!system) return { refuse: "screen.document.origin.ref.empty" };
      return { body: { bundleId: String(view.subject || ""), system } };
    },
    /* the list is read again, so a declaration made here and one made elsewhere are both in it, in the order they were made */
    done(view, answer, cs) { cs.set("later", Object.assign({}, view.ui.later, { origins: null })); } },
  { op: "pagetranscribe", label: "act.pagetranscribe.label.document",
    send(view, el) {
      const text = view.data.capture && view.data.capture.state === "ok" ? view.data.capture.value["bundle.md"] : "";
      const m = typeof text === "string" ? /^project:\s*(\S+)\s*$/m.exec(text) : null;
      return { query: { sha256: el.dataset.sha || "", ...(m ? { project: m[1] } : {}) } };
    },
    done(view, answer, cs) {
      const t = (answer && (answer.transcription || (answer.result && answer.result.transcription))) || {};
      /* R78: the pages the assistant read, drawn from one */
      const pages = Array.isArray(t.pages) ? t.pages.map((p) => (Number.isInteger(p) ? p + 1 : p)).join(", ") : "";
      cs.set("outcome", Object.assign({}, view.ui.outcome, { pagetranscribe: { ok: true,
        html: cs.w("screen.document.pagetranscribe.done", { pages }) + (t.untested ? " " + cs.w("ai.label.untested") : "") } }));
      cs.set("later", Object.assign({}, view.ui.later, { reading: null }));
    } },
];

/** R65–R67 (T51; interface-shell R100, op-declarations R76): the browser acts `revisioncompare`, `hashcopy` and `linkopen`, done in the
 *  page: each calls its `send` and sends no request. Held apart from `acts`, and handed over as the screen's `browserActs`: interface-shell's `checkScreens` admits a browser
 *  act only once its R100 is merged and `BROWSER_ACTS` names it (op-declarations R76), and until then an act it does not hold
 *  would stop every screen of the module. Once R100 is merged the screen's acts are `[...acts, ...browserActs]` (one line, below);
 *  until then `cs.act` draws none of the three, so no Copy, no compare and no way past an outside link's warning is offered. */
const browserActs = [
  /* R66: a fingerprint's full value put on the clipboard, as `cs.copy` does */
  { op: "hashcopy", label: "shell.copy",
    send(view, el) {
      const value = String(el.dataset.value || "");
      if (/^[0-9a-f]{64}$/.test(value)) { try { const c = window.navigator && window.navigator.clipboard; if (c && c.writeText) c.writeText(value); } catch { /* the clipboard refused: nothing copied */ } }
      return null;
    } },
  /* R65: two revisions of this copy's record set side by side, from the image answer the page holds */
  { op: "revisioncompare", label: "screen.document.revisions.compare.act",
    /* R81: the compare tab's act carries its pair as its own data (the cited revision and the current copy); the fold's act reads its two choices */
    send(view, el, cs) {
      const a = el && el.dataset.a !== undefined ? el.dataset.a : cs.value("document-rev-a");
      const b = el && el.dataset.b !== undefined ? el.dataset.b : cs.value("document-rev-b");
      cs.set("revcmp", { a: String(a || ""), b: String(b || "") }); return null;
    } },
  /* R67: an outside link's warning opens ("ask"), closes ("stay") or lets the address open in a new window ("open"); a script
     scheme is never opened */
  { op: "linkopen", label: "act.owed_linkopen.label.document",
    send(view, el, cs) {
      const step = String(el.dataset.step || "");
      const address = String(el.dataset.address || "");
      if (step === "ask") { if (/^https?:\/\//i.test(address)) cs.set("leaving", address); return null; }
      if (step === "open" && /^https?:\/\//i.test(address)) { try { window.open(address, "_blank", "noopener"); } catch { /* the browser refused: nothing opened */ } }
      cs.set("leaving", null);
      return null;
    } },
];

/** The keys the document screen may draw (R44: keys only). */
const words = Object.freeze([
  "screen.document.name", "screen.document.purpose",
  ...["gradenote", "findin", "cite", "release", "attest", "retire", "monitorset", "monitor", "identityclaim", "transcribe", "pagetranscribe",
    "adoptversion", "keepversion", "versionnotice", "connectionchoose", "explore", "captureprogressions"].map((op) => "act." + op + ".label.document"),
  "act.pagetranscribe.does", "ai.label.untested", "document.unread.pages",
  /* T50 (R54–R56, R61) */
  "document.held.says", "document.vouched", "document.attest.label", "document.attest.when", "document.retire.fold", "document.retire.when",
  "document.retire.label", "document.image.unread", "document.image.unread.summary", "document.table.flattened", "document.untitled.web",
  "document.read.cite", "screen.document.cite.question.help", "screen.document.cite.none.summary", "screen.find-in.questionfirst",
  "screen.document.said_by", "screen.capture.file.how", "screen.capture.file.where", "screen.capture.file.what", "screen.finder.cite.cited", "screen.finder.a17.left_as_it_was", "screen.finder.a17.the_question_already_cited_it",
  "theme.section", "theme.never.evidence", "theme.place", "theme.propose", "theme.hunch.mark", "screen.document.theme.page",
  "screen.document.theme.whole", "screen.document.theme.proposed", "progression.threadedto", "progression.followed", "progression.thread.here",
  "shell.card.document", "act.themewithdraw.label.document",
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.scale.testimony.name", "mark.scale.testimony.means", "mark.grade.reading",
  "mark.scale.subject.name", "mark.scale.subject.means", "mark.gap.undetermined.name", "mark.gap.undetermined.means",
  "state.empty", "state.loading", "state.failed", "state.undetermined", "shell.reason", "shell.reason.help", "shell.unread", "shell.copy",
  "member.founder.unnamed", "screen.question.supports.head", "screen.question.against.head",
  "document.links.title", "document.links.help", "document.links.held",
  "document.names.title", "document.names.help", "document.names.row", "document.names.chosen.record", "document.names.chosen.member",
  /* T51 (R65–R69, R78): the record of this copy, the fingerprints, the links in five groups, the names, "Your citations, leg by leg" */
  "time.at", "time.clock", "time.am", "time.pm", "document.versions.thiscopy", "state.item.retired.name",
  "refusal.NO_SUCH_BUNDLE", "refusal.NO_BUNDLE", "refusal.NO_SHA", "refusal.VERSION_NOTICE_NO_INQUIRY", "refusal.VERSION_NOTICE_NO_SUBJECT",
  "act.owed_linkopen.label.document", "act.owed_linkopen.does", "act.owed_revisioncompare.label.document", "act.owed_revisioncompare.does",
  "act.owed_hashcopy.label.document", "act.owed_hashcopy.does", "act.versionnotice.does",
  ...["fingerprints.head", "revision.title", "revisions.compare", "revisions.with", "revisions.compare.act", "fingerprint.setonly",
    "links.group.inside", "links.group.beside", "links.group.held", "links.group.outside", "links.group.refused", "links.verdict.final",
    "links.verdict.checked", "links.verdict.same", "links.verdict.different", "links.verdict.notestablished", "links.verdict.nocapture",
    "links.verdict.refused"].map((k) => "screen.document." + k),
  ...["a26.this_copy_s_words_and_file", "a26.computed_from_the_exact_bytes_of_this_co", "a26.this_copy_and_the_files_captured_with_it",
    "a26.computed_from_the_whole_set_so_the_set_c", "a26.short_codes_computed_from_the_exact_byte", "a26.anyone_holding_the_same_bytes_computes_t",
    "a27.the_record_of_this_copy", "a27.the_release_of_civicsmith_that_wrote_thi", "a27.everything_done_to_this_copy_s_standing_",
    "a27.none_of_it_is_ever_changed_or_removed", "a27.held_until_vouched_for", "a27.vouched_for_by_dev", "a27.now_used_by_the_team",
    "a27.earlier_revisions_of_this_record", "a27.standing_held_until_vouched_for", "a27.vouched_for_by_nobody", "a27.standing_used_by_the_team",
    "a27.vouched_for_by_dev.2", "a27.a_copy_that_came_as_a_set_of_files_such_", "a27.who_added_this_copy_who_vouched_for_it_a",
    "a27.the_copy_your_team_holds_is_the_one_this", "a27.opening_it_leaves_the_record_and_nothing",
    "a30.a_pointer_into_this_very_copy_settled_wh", "a30.the_other_verdicts_a_held_link_can_carry", "a30.you_are_about_to_leave_the_record",
    "a30.this_page_carried_this_address_and_the_r", "a30.what_is_at_the_address_now_the_record_do", "a30.stay_in_the_record", "a30.tally.one", "a30.tally.none", "a30.6_links_on_this_page_4_lead_outside_the_", "a30.open_anyway", "links.navleft",
    "a30.not_an_address_the_record_will_carry", "a30.this_is_a_refusal_not_a_gap_in_what_was_",
    "a31.the_grade_on_each_name_says_how_the_matc", "a31.it_says_nothing_about_how_far_to_trust_t", "a31.a_connection_to_another_document_takes_t",
    "a34.your_citations_leg_by_leg", "a34.a_newer_copy_never_moves_a_citation_by_i", "a34.each_reasoning_that_rests_on_this_docume",
    "a34.a_newer_copy_exists_captured_2_october", "a34.page_same", "a34.page_differs", "a34.no_newer", "a34.moved", "a34.kept", "a34.not_checked_yet", "a34.it_does_not_guess",
    "a34.one_line_for_each_question_that_rests_on", "a64.captured_together_with_this_page_and_che",
    "a64.not_established_means_the_record_cannot_"].map((k) => "screen.document." + k),
  /* FR-28 (R84–R118): the keys the new controls draw */
  "capture.fieldneeded", "shell.reason.needed", "progression.steps", "screen.capture.address.freq", "state.item.retired.means",
  ...["daily", "weekly", "monthly", "hourly", "per_meeting"].map((f) => "screen.capture.address.freq." + f),
  "screen.document.cite.option", "screen.document.cite.choose", "screen.document.unwatched.head", "screen.document.unwatched",
  "screen.document.text.tip", "screen.document.text.partial", "screen.document.ocr.says", "screen.document.ocr.refused.capable", "screen.document.ocr.refused.member",
  "screen.document.ocr.refused.unread", "act.pdfstructure.label.document", "act.transcriptionattest.label.document", "act.provenanceroute.label.document",
  "act.connectionassert.label.document", "act.resolutiondefect.label.document", "act.owed_declareorigin.label.document",
  ...["summary", "row", "status", "note", "note.help", "at", "refused.self", "refused.note"].map((k) => "screen.document.attest." + k),
  ...["summary", "says", "which", "which.help", "why", "why.help", "at", "refused.why", "refused.gone"].map((k) => "screen.document.defect." + k),
  ...["heading", "help", "says", "other", "other.help", "basis", "basis.help", "again", "refused.basis", "refused.other"].map((k) => "screen.document.connect." + k),
  ...["standing", "says", "shown", "notshown", "same", "refused"].map((k) => "screen.document.route." + k),
  ...["head", "field", "eg", "second1", "second2", "tip", "ref.machine1", "ref.machine2", "ref.empty", "ref.notdoc"].map((k) => "screen.document.origin." + k),
  "document.read.title", "document.read.help", "document.read.tab.page", "document.read.page", "document.read.prev", "document.read.next", "document.read.select", "document.read.cite.help",
  /* T51 (R81, R82, CR-19): the compare tab, the original-file card, its size and kind */
  "document.read.tab.compare", "document.read.original.card", "size.small", "size.kb", "size.mb", "size.gb",
  ...["record.release", "record.added", "revisions.truncated", "revision.nobytes", "compare.grade", "compare.fingerprint", "a34.moved.noreason", "a34.kept.noreason", "place.restson", "names.matched.identifier",
    "names.matched.reference", "names.matched.reference_key", "names.matched.label", "names.matched.testimony", "names.matched.none"].map((k) => "screen.document." + k),
  ...["captured", "copy", "fingerprint", "fingerprint.means", "passages.head", "passage.where", "cite.question", "cite.role",
    "cite.noquestion", "unread.head", "unread.page", "unread.words", "unread.empty", "gradenote.head", "gradenote.none",
    "backlinks.head", "backlinks.hidden", "versions.head", "versions.changed", "versions.this", "claim.label",
    "claim.basis", "claim.basis.name", "claim.basis.corroborated", "claim.basis.identifier", "claim.note", "claim.empty",
    "copyacts.head", "release.ack", "release.mitigation", "release.empty", "retire.reason", "open", "monitor.done",
    "monitorset.done", "attest.done", "transcribe.done", "pagetranscribe.done"].map((k) => "screen.document." + k),
]);

/** The document screen (interface-shell R21). */
export function documentScreen(parts) {
  /* R93: the one drawing of what a check found is `screens-intake`'s (its R42), imported and carried as this screen's part; R117: a refusal's
     first finding is drawn by `findingsRefusal` */
  return Object.freeze({ id: "document", reads, place, render, acts: [...acts, ...browserActs],
    words: Object.freeze([...words, ...parts.kinds.map((k) => "document.kind." + k)]), parts: Object.freeze({ ...parts, checkOutcome, findingsRefusal }) });
}
