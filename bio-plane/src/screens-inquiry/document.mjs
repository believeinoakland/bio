/* screens-inquiry R3: the document screen (Projects › <project> › Document; registry screen `document`, its 11 acts).
 *
 * Self-contained functions (interface-shell R21 (1)). The document is the INFO bundle `view.subject` its capture is
 * filed in; its capture's digest is the document's `content_hash`, its address `source.locator`. What needs the digest
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
 * notice, reevaluation R15), `connectionchoose` and `explore`. Every sentence is a word by key (R44). */


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

/** R3, R5: the capture, its grade and note, its passages (each citable), its unread pages, the people it names, its
 *  versions, what cites it, and its acts. */
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
    ? `<p class="${ui.outcome[key].ok ? "mk-note" : "mk-msg"}" role="${ui.outcome[key].ok ? "status" : "alert"}" data-outcome="${key}">${ui.outcome[key].html}</p>` : "");
  /* a section that holds nothing is not drawn (R20): a read answered empty, or a body that draws nothing, makes no
     section; a read still pending or failed is drawn as such */
  const secOf = (titleKey, r, inner) => {
    const read = typeof r === "string" ? d[r] : r;
    if (read && read.state === "empty") return "";
    const body = cs.state(read, inner);
    return body ? cs.sec(titleKey, body) : "";
  };
  const doc = d.capture && d.capture.state === "ok" ? view.parts.front(d.capture.value["bundle.md"]) : null;
  if (doc) doc.source = doc.maps.source || {};
  const sha = doc && /^sha256:[0-9a-f]{64}$/.test(String(doc.content_hash || "")) ? String(doc.content_hash).slice(7) : "";
  const locator = doc && doc.source ? String(doc.source.locator || "") : "";
  const out = [];
  const T = (k, f) => view.parts.plain(cs, k, f);
  const W = (k, f) => cs.w(k, f);
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
  if (project) later("project:" + project, "image", { id: project });
  /* R32: the address an outside link, unquoted; a testimony's source drawn as its words */
  out.push(`<p class="mk-sub">${cs.w("screen.document.captured", {
    date: { html: doc.source.retrieved ? cs.date(String(doc.source.retrieved), { year: true }) : doc.created ? cs.date(String(doc.created), { year: true }) : "" },
    source: outside ? { html: `<a class="cs-btn" data-tone="quiet" href="${cs.esc(locator)}" rel="noopener noreferrer" target="_blank" data-outward="1">${cs.esc(locator)}</a>` }
      : (locator || doc.source.authority || "") })}</p>`);

  /* R32: this copy's grade, the capture's own grade object (its held row), drawn as one mark; none where none is read */
  const held = project && sha ? later("held", "heldcaptures", { project, limit: "500" }) : null;
  const row = held && held.state === "ok" && Array.isArray(held.value.rows || held.value.items || held.value.captures)
    ? (held.value.rows || held.value.items || held.value.captures).find((r) => r && ((r.capture && r.capture.sha256 === sha) || r.bundle_id === id || r.document === id || r.id === id)) : null;
  const gradeObj = row && row.capture && row.capture.grade ? row.capture.grade : null;
  const letter = gradeObj && /^[A-D]$/.test(String(gradeObj.grade || "")) ? String(gradeObj.grade) : "";
  const note = sha ? later("gradenote", "gradenote", { capture: sha }) : { state: "empty" };
  out.push(`<div class="mk-facts"><div><span class="k">${cs.w("screen.document.copy")}</span><span class="v">`
    + (letter ? cs.grade(testimony ? "testimony" : "capture", letter) : "")
    + cs.act("gradenote", { label: "act.gradenote.label.document", data: { capture: sha, letter }, tone: "quiet" }) + "</span></div>"
    + (sha ? `<div><span class="k">${cs.w("screen.document.fingerprint")}</span><span class="v"><span class="mk-tag" tabindex="0" data-means="screen.document.fingerprint.means">${cs.esc(sha.slice(0, 4) + "…" + sha.slice(-4))}</span></span></div>` : "")
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
  const reading = sha ? later("reading", "reading", { sha256: sha }) : { state: "empty" };
  const qs = d.questions && d.questions.state === "ok" && Array.isArray(d.questions.value.bundles) ? d.questions.value.bundles : [];
  out.push(secOf("screen.document.passages.head", reading, (r) => {
    const rd = r.reading || {};
    const passages = Array.isArray(rd.passages) ? rd.passages
      : Array.isArray(rd.units) ? rd.units
      : typeof rd.text === "string" ? rd.text.split(/\n\s*\n/).map((t) => ({ text: t })) : [];
    const list = passages.filter((p) => p && String(p.text || p.words || "").trim());
    if (!list.length) return "";
    const pick = qs.length
      ? cs.choice("document-cite-question", "screen.document.cite.question", qs.map((q) => ({ value: String(q.bundle_id), text: String(q.title || q.bundle_id) })), {})
        + cs.choice("document-cite-role", "screen.document.cite.role",
            [["supports", "screen.question.supports.head"], ["cuts_against", "screen.question.against.head"]], { value: "supports" })
      : `<p class="mk-small">${cs.w("screen.document.cite.noquestion")}</p>`;
    return list.map((p, i) => {
      const extent = p.extent && typeof p.extent === "object" ? p.extent : null;
      const page = extent && Number.isInteger(extent.page) ? extent.page : null;
      return `<blockquote class="mk-passage rec" data-passage="${i}">“${cs.esc(String(p.text || p.words).trim())}”`
        + (page !== null ? `<span class="mk-small">${cs.w("screen.document.passage.where", { page })}</span>` : "") + "</blockquote>"
        + (extent && qs.length ? cs.act("cite", { label: "act.cite.label.document",
            data: { found: JSON.stringify({ capture_sha: sha, extent, kind: "passage" }) } }) : "");
    }).join("") + pick + own("cite");
  }));

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
    out.push(`<p class="cs-draftlabel" data-label="untested">${cs.w("ai.label.untested")}</p>`);

  /* people it names: a name in its reading claimed as a person the record follows */
  if (reading.state === "ok") {
    const rd = reading.value.reading || {};
    const people = Array.isArray(rd.people) ? rd.people : Array.isArray(rd.entities) ? rd.entities.filter((e) => e && (e.kind === "person" || e.type === "person")) : [];
    if (people.length) out.push(cs.sec("screen.document.people.head",
      cs.sheet(people.map((p) => cs.row("", cs.esc(p.name || p.words || ""), cs.act("identityclaim",
          { label: "act.identityclaim.label.document", data: { entity: String(p.id || p.entity || "") } }))).join(""))
        + cs.field("document-claim-person", "screen.document.claim.label", {})
        + cs.choice("document-claim-basis", "screen.document.claim.basis",
            [["name", "screen.document.claim.basis.name"], ["corroborated_name", "screen.document.claim.basis.corroborated"], ["identifier", "screen.document.claim.basis.identifier"]], { value: "name" })
        + cs.field("document-claim-note", "screen.document.claim.note", { area: true, rec: true }) + own("identityclaim")));
  }

  /* its versions (provenance's versionchain): a newer version than this copy marked changed; refused by its words
     (R32); a newer version's notice to a question citing it decided here, adopted or kept (reevaluation R15) */
  const backs = d.backlinks && d.backlinks.state === "ok" && Array.isArray(d.backlinks.value.backlinks) ? d.backlinks.value.backlinks : [];
  if (outside && !testimony) {
    const vc = later("versions", "versionchain", { address: locator, ...(sha ? { at: sha } : {}) });
    const notices = backs.filter((x) => x && x.from_type === "inquiry").flatMap((x) => {
      const n = later("notices:" + x.from, "reevaluationnotices", { holder: String(x.from), state: "open" });
      const list = n.state === "ok" ? (Array.isArray(n.value.notices) ? n.value.notices : n.value.items || []) : [];
      return list.filter((o) => o && (o.capture_sha === sha || o.newer_capture === sha) && o.id).map((o) => ({ id: String(o.id), holder: String(x.from) }));
    });
    const decide = notices.map((o) => cs.field("document-version-why-" + o.id, "shell.reason", { area: true, rec: true, help: "shell.reason.help" })
      + cs.act("adoptversion", { label: "act.adoptversion.label.document", data: { notice: o.id } })
      + cs.act("keepversion", { label: "act.keepversion.label.document", data: { notice: o.id } })).join("");
    const vbody = vc.state === "failed" ? `<p class="cs-state" data-state="failed" role="alert">${vc.refusal && vc.refusal.words ? vc.refusal.words : cs.w("state.failed", { reason: "" })}</p>`
      : vc.state === "loading" ? cs.state({ state: "loading" }, () => "") : vc.state === "ok" ? (() => {
        const v = vc.value;
        const list = Array.isArray(v.versions) ? v.versions : [];
        if (list.length < 2) return "";
        const at = Number.isInteger(v.at_index) ? v.at_index : list.findIndex((x) => x && (x.capture_sha === sha || x.sha256 === sha));
        const newer = at >= 0 && at < list.length - 1;
        return (newer ? `<p class="cs-due" data-changed="true">${cs.w("screen.document.versions.changed")}</p>` : "")
          + cs.sheet(list.map((x, i) => cs.row("", x && (x.at || x.retrieved) ? cs.date(String(x.at || x.retrieved), { year: true }) : "",
              i === at ? `<span class="mk-small">${cs.w("screen.document.versions.this")}</span>` : "")).join(""));
      })() : "";
    if (vbody || decide) out.push(cs.sec("screen.document.versions.head", vbody + decide));
  }

  /* R32: the links this page carries (capture R57's `links`), and those it makes into held documents (connections R24's
     `links_to`, its own references): a held one a reference, an outward one a link opening outside */
  if (sha && !testimony) {
    const lk = later("links", "links", { capture: sha, limit: "200" });
    const linked = (doc.lists.references || []).filter((r) => r && r.rel === "links_to" && r.target);
    const rows = lk.state === "ok" && Array.isArray(lk.value.links) ? lk.value.links.filter((r) => r && r.address && !r.chrome) : [];
    if (lk.state === "failed") out.push(cs.sec("document.links.title", cs.state(lk, () => ""), { help: "document.links.help" }));
    else if (rows.length || linked.length) {
      const heldRows = linked.map((r) => cs.row("", cs.ref("document", String(r.target), String(r.title || r.address || T("state.undetermined", { reason: "" })), []), "",
        W("document.links.held", { date: { html: r.at ? cs.date(String(r.at), { year: true }) : "" } })));
      const outRows = rows.filter((r) => !linked.some((o) => o.address && o.address === r.address)).map((r) => {
        const target = r.target_bundle ? cs.ref("document", String(r.target_bundle), String(r.address), [])
          : `<a class="cs-btn" data-tone="quiet" href="${cs.esc(r.address)}" rel="noopener noreferrer" target="_blank" data-outward="1">${cs.esc(r.address)}</a>`;
        return cs.row("", target, "", r.target_bundle ? W("document.links.held", { date: { html: r.target_retrieved ? cs.date(String(r.target_retrieved), { year: true }) : "" } }) : "");
      });
      const heldN = linked.length + rows.filter((r) => r.target_bundle).length;
      out.push(cs.sec("document.links.title", `<p class="mk-note">${W("document.links.says", { n: String(heldRows.length + outRows.length), held: String(heldN) })}</p>`
        + cs.sheet(heldRows.concat(outRows).join("")), { help: "document.links.help" }));
    }
  }

  /* R32: the names it holds, with the mention that counts for each (connections R4's `on_point`), chosen by a member */
  if (sha) {
    const cn = later("connections", "connections", { sha256: sha, limit: "200" });
    const list = cn.state === "ok" && Array.isArray(cn.value.connections) ? cn.value.connections : [];
    if (cn.state === "failed") out.push(cs.sec("document.names.title", cs.state(cn, () => ""), { help: "document.names.help" }));
    else if (list.length) out.push(cs.sec("document.names.title", cs.sheet(list.map((c, i) => {
      const mine = c.a_capture_sha === sha ? "a" : "b";
      const op = c.on_point && c.on_point[mine];
      const other = mine === "a" ? c.b_capture_sha : c.a_capture_sha;
      const chosen = op && op.chosen_by && op.chosen_by !== "record"
        ? W("document.names.chosen.member", { who: view.parts.who(cs, op.chosen_by), date: { html: op.at ? cs.date(String(op.at), { year: true }) : "" }, why: String(op.why || "") })
        : W("document.names.chosen.record");
      const meta = op && op.occurrence && op.occurrence.page ? W("document.names.row", { n: String(c.occurrences || 1), page: String(op.occurrence.page), chosen }) : chosen;
      return cs.row("", `<span class="rec">${cs.esc(String(c.entity_name || c.entity_id || ""))}</span>`,
        cs.act("connectionchoose", { label: "act.connectionchoose.label.document", data: { capture: sha, other: String(other || ""), entity: String(c.entity_id || ""), ref: String((op && op.ref) || "") } }), meta);
    }).join("")) + cs.act("explore", { label: "act.explore.label.document", data: { from: id } }), { help: "document.names.help" }));
  }

  /* what cites it (R39: a citer without a title is undetermined, never its id) */
  out.push(secOf("screen.document.backlinks.head", "backlinks", (bk) =>
    (bk.backlinks || []).length ? cs.sheet((bk.backlinks || []).map((x) => cs.row("", cs.ref(x.from_type === "project" ? "project" : x.from_type === "inquiry" ? "question" : "document",
      String(x.from || ""), x.from_title || T("state.undetermined", { reason: "" }), [x.from_title || ""]), "")).join(""))
    + (bk.out_of_view ? `<p class="mk-small">${cs.w("screen.document.backlinks.hidden")}</p>` : "") : ""));

  /* this copy's acts: vouch (by its weight), attest (signed), watch for changes and check now (R15), retire (terminal) */
  out.push(cs.sec("screen.document.copyacts.head",
    cs.field("document-release-ack", "screen.document.release.ack", { area: true, rec: true })
    + cs.field("document-release-mitigation", "screen.document.release.mitigation", { area: true, rec: true })
    + cs.act("release", { label: "act.release.label.document", data: { document: id } }) + own("release")
    + cs.act("attest", { label: "act.attest.label.document", data: { sha } }) + own("attest")
    /* R32: a testimony has no address to watch or check */
    + (testimony ? "" : cs.act("monitorset", { label: "act.monitorset.label.document", data: { document: id } }) + own("monitorset")
      + cs.act("monitor", { label: "act.monitor.label.document", data: { document: id } }) + own("monitor"))
    + cs.act("retire", { label: "act.retire.label.document", data: { document: id } }) + own("retire")));
  return out.join("");
}

/** R3's, R15's and R32's acts. */
const acts = [
  /* R32: a newer version's notice decided here: adopt it with her reason, or keep the version cited */
  { op: "adoptversion", label: "act.adoptversion.label.document", reasonField: "why", rereads: ["backlinks"],
    send(view, el, cs) {
      const notice = String(el.dataset.notice || "");
      const why = String(cs.value("document-version-why-" + notice) || "").trim();
      return { body: { notice, why } };
    } },
  { op: "keepversion", label: "act.keepversion.label.document", rereads: ["backlinks"],
    send(view, el, cs) {
      const notice = String(el.dataset.notice || "");
      const why = String(cs.value("document-version-why-" + notice) || "").trim();
      return { body: { notice, ...(why ? { why } : {}) } };
    } },
  /* R32: the mention that counts for a name, chosen by her (connections R14–R16) */
  { op: "connectionchoose", label: "act.connectionchoose.label.document", rereads: [],
    send(view, el) {
      const ds = el.dataset;
      return { body: { capture: ds.capture || "", other: ds.other || "", entity: ds.entity || "", ...(ds.ref ? { ref: ds.ref } : {}) } };
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

/** The keys the document screen may draw (R44: keys only). */
const words = Object.freeze([
  "screen.document.name", "screen.document.purpose",
  ...["gradenote", "findin", "cite", "release", "attest", "retire", "monitorset", "monitor", "identityclaim", "transcribe", "pagetranscribe",
    "adoptversion", "keepversion", "connectionchoose", "explore"].map((op) => "act." + op + ".label.document"),
  "act.pagetranscribe.does", "ai.label.untested", "document.unread.pages",
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.scale.testimony.name", "mark.scale.testimony.means", "mark.grade.reading",
  "state.empty", "state.loading", "state.failed", "state.undetermined", "shell.reason", "shell.reason.help", "member.founder.unnamed",
  "screen.question.supports.head", "screen.question.against.head",
  "document.links.title", "document.links.help", "document.links.says", "document.links.held",
  "document.names.title", "document.names.help", "document.names.row", "document.names.chosen.record", "document.names.chosen.member",
  ...["captured", "copy", "fingerprint", "fingerprint.means", "passages.head", "passage.where", "cite.question", "cite.role",
    "cite.noquestion", "unread.head", "unread.page", "unread.words", "unread.empty", "gradenote.head", "gradenote.none",
    "backlinks.head", "backlinks.hidden", "versions.head", "versions.changed", "versions.this", "people.head", "claim.label",
    "claim.basis", "claim.basis.name", "claim.basis.corroborated", "claim.basis.identifier", "claim.note", "claim.empty",
    "copyacts.head", "release.ack", "release.mitigation", "release.empty", "retire.reason", "open", "monitor.done",
    "monitorset.done", "attest.done", "transcribe.done", "pagetranscribe.done"].map((k) => "screen.document." + k),
]);

/** The document screen (interface-shell R21). */
export function documentScreen(parts) {
  return Object.freeze({ id: "document", reads, place, render, acts, words, parts });
}
