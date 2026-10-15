/* The `capture` screen (Add; R1–R3): three tabs, each its own, at `/app/capture/address`, `/app/capture/file` and
 * `/app/capture/saw` (the subject names the tab; none is the address tab). Every function is self-contained (interface-shell
 * R21 (1)): it refers only to its parameters, the kit `cs` and the language's own globals. */

/* R1–R3: the screen reads nothing before an act. */
function captureReads() {
  return {};
}

/* R22 (T49; BOB's reading of J2): the subject is the route's `<tab>` or `<tab>/<id>`, the id a project (`PROJ-…`) or a
 * question (`INQ-…`) the capture is made for. Anything else is no subject, and the capture is filed nowhere. */
function forOf(view) {
  const s = String((view && view.subject) || "");
  const at = s.indexOf("/");
  const tab = at < 0 ? s : s.slice(0, at), id = at < 0 ? "" : s.slice(at + 1);
  return { tab: ["address", "file", "saw"].includes(tab) ? tab : "address", id: /^(PROJ|INQ)-[A-Za-z0-9-]+$/.test(id) ? id : "" };
}

/* R22: where the subject files a capture: `{id, title, question}`, the project's id and title and, for a question, the
 * question's title. A project's own id; a question's project, as its bundle states it (`project:` in its front matter; the
 * question is read through `image`). `id` is "" when a question states no project (filed nowhere); null when the
 * question could not be read, so nothing is filed where the member did not mean. A title that cannot be read is the id. */
async function projectOf(cs, id) {
  if (!id) return { id: "", title: "", question: "" };
  const front = async (of) => {
    const a = await cs.call("image", { query: { id: of } });
    const r = a && typeof a.result === "object" && a.result ? a.result : a;
    const md = r && typeof r["bundle.md"] === "string" ? r["bundle.md"] : null;
    return md === null ? null : md.split(/\n---\s*\n/)[0] || "";
  };
  const field = (fm, name) => { const m = new RegExp("^" + name + ":\\s*(.*?)\\s*$", "m").exec(fm); return m ? m[1].replace(/^["']|["']$/g, "") : ""; };
  let project = id, question = "";
  if (!/^PROJ-/.test(id)) {
    const fm = await front(id);
    if (fm === null) return null;
    question = field(fm, "title") || id;
    project = /^PROJ-\S+$/.test(field(fm, "project")) ? field(fm, "project") : "";
    if (!project) return { id: "", title: "", question };
  }
  const pm = await front(project);
  return { id: project, title: (pm && field(pm, "title")) || project, question };
}

/* R1, R21, R23 (N747): a document the screen promotes as an information bundle at `collected`, the one composition both
 * the address path (R1) and the upload path (R21) use, under an id `allocid` mints: `bundle.md` at `information@2`
 * (naming the project when the capture has one, R22), `data/provenance.json` and its register, and, so that `release` is not
 * refused `ENTRY_REQUIREMENTS` (R23), `data/dataset.json` with the `content_hash` that canonical dataset hashes to
 * (capture grammar C-2.7), beside the capture's own files under `snapshots/`. Answers `{bundleId}`, or `{refused}` with the
 * owner's words ("" when it gave none). */
async function promoteDocument(cs, o) {
  const doc = o.doc || {}, title = String(o.title || "").slice(0, 200), locator = String(o.locator || ""), project = o.project || "";
  const why = (r) => (r && (r.translation || r.detail || r.reason || r.code)) || "";
  const now = new Date(cs.now ? cs.now() : Date.now()).toISOString().split(".")[0] + "Z";
  const minted = await cs.call("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } });
  const mid = minted && (minted.result || minted);
  if (!mid || mid.ok === false || typeof mid.id !== "string") return { refused: why(mid) };
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const id = slug ? `${mid.id}-${slug}` : mid.id;
  const sha = doc.capture && doc.capture.sha256;
  /* UTF-8 length, computed from the code points (REC-178: a file's bytes is its UTF-8 length, never text.length). */
  const len = (s) => { let n = 0; for (const ch of String(s)) { const c = ch.codePointAt(0); n += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4; } return n; };
  /* record-grammar's canonical JSON: keys sorted, no space */
  const canon = (v) => Array.isArray(v) ? "[" + v.map(canon).join(",") + "]"
    : v !== null && typeof v === "object" ? "{" + Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}"
    : JSON.stringify(v);
  const bytes = doc.capture && Number.isFinite(doc.capture.bytes) ? doc.capture.bytes : null;
  const dataset = canon({ documents: [{ bytes, locator, sha256: sha || null }] });
  const text = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title),
    "current_state: collected", "prior_state: null", "created: " + now, "last_updated: " + now,
    "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
    "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + await cs.digest(dataset),
    ...(project ? ["project: " + project] : []),
    "source:", "  locator: " + JSON.stringify(locator), "  authority: member-entered", "  retrieved: " + now,
    "monitoring:", "  enabled: false", "  frequency: none", "---", "",
    "## Summary", "", title, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [doc] }, null, 1);
  const parts = Array.isArray(doc.parts) && doc.parts.length ? doc.parts : null;
  const atts = Array.isArray(doc.attestations) ? doc.attestations : [];
  const files = [{ path: "bundle.md", text, bytes: len(text), sha256: await cs.digest(text) },
                 { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: await cs.digest(prov) },
                 { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: await cs.digest(dataset) },
                 ...(parts ? parts.map((p) => ({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes }))
                   : [{ path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture && doc.capture.bytes }]),
                 ...atts.map((t) => ({ path: t.file, blobSha: t.sha256, sha256: t.sha256, bytes: t.bytes }))];
  const register = [...(parts ? parts.map((p) => ({ sha256: p.sha256, path: p.file, encoding: "binary", bytes: p.bytes }))
                      : [{ sha256: sha, path: doc.file, encoding: doc.capture && doc.capture.encoding, bytes: doc.capture && doc.capture.bytes }]),
                    ...atts.map((t) => ({ sha256: t.sha256, path: t.file, encoding: "binary", bytes: t.bytes }))];
  const hex = "0123456789abcdef";
  let tail = "";
  for (let i = 0; i < 8; i++) tail += hex[Math.floor(Math.random() * 16)];
  const done = await cs.call("promote", { body: {
    bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + tail,
    meta: { object_type: "information", title, current_state: "collected", created: now, last_updated: now },
    files, register } });
  const p = done && (done.result || done);
  if (!p || p.ok === false) return { refused: why(p) };
  return { bundleId: p.bundleId || id };
}

/* R1–R3: the page. The tab body carries no class: the design's `st` is its mock's state switch (hidden unless a `main`
 * carries `data-st`), which the served `shell.css` carries and which would hide every tab. `view.subject` the tab (and,
 * after a `/`, the project or question the capture is for, R22); `view.ui` what the acts left (outcomes, a draft);
 * `view.reachable` whether the assistant is reachable for this member (interface-shell R20). */
function renderCapture(cs, view) {
  const at = view.parts.forOf(view), tab = at.tab;
  const U = view.ui || {};
  const said = (k, f) => `<p class="mk-note" role="status">${cs.w(k, f)}</p>`;
  const tabs = [["address", "screen.capture.tab.address"], ["file", "screen.capture.tab.file"], ["saw", "screen.capture.tab.saw"]]
    .map(([k, w]) => `<span role="tab"${k === tab ? ' aria-selected="true"' : ""}><a href="/app/capture/${k}${at.id ? "/" + encodeURIComponent(at.id) : ""}" data-nav${k === tab ? ' aria-current="page"' : ""}>${cs.w(w)}</a></span>`).join("");
  /* R24: the capture's result links the document it made; R22: "Cite a passage" opens `find-in` over it, with the question
     chosen when the capture was made for one. Nothing is linked for a refused promotion or an answer naming no bundle. */
  const made = (g) => g && typeof g.bundleId === "string" && g.bundleId
    ? `<p class="mk-small">${cs.ref("document", g.bundleId, g.title || g.bundleId, [])}`
      + (g.filed && g.filed.id ? ` ${g.filed.question ? cs.w("capture.filed.question", { project: g.filed.title, question: g.filed.question }) : cs.w("capture.filed.project", { project: g.filed.title })}` : "")
      + (/^INQ-/.test(at.id) ? ` <a class="cs-btn" data-tone="quiet" href="/app/find-in/${encodeURIComponent(g.bundleId)}/${encodeURIComponent(at.id)}" data-nav data-level="1" data-tip="${cs.w("capture.cite.tip")}">${cs.w("capture.cite")}</a>` : "")
      + "</p>" : "";
  /* R21: a refused promotion is drawn on its tab in the owner's words, else the shell's own for a failure with none */
  const refusedPromotion = (t) => U.promoteRefused && U.promoteRefused.tab === t
    ? `<p class="cs-state" data-state="failed" role="alert">${U.promoteRefused.text ? cs.esc(U.promoteRefused.text) : cs.w("shell.unread")}</p>` : "";
  let body = "";
  if (tab === "address") {
    const got = U.captured;
    const freqs = ["daily", "weekly", "monthly", "hourly", "per_meeting"];
    /* R18: one act row; watching and checking join it once the address has a document, with the frequency chosen beside
       them, and no watching section is drawn before anything is captured. R14, R16: two acts, each on that document. */
    const watch = !!got && (cs.can("monitorset") || cs.can("monitor"));
    body = cs.field("ci-address", "screen.capture.address.label", { help: "screen.capture.address.help", value: U.address || "" })
      + (watch && cs.can("monitorset") ? `<p class="mk-small">${cs.w("screen.capture.address.watchabout")}</p>`
        + cs.choice("ci-freq", "screen.capture.address.freq", freqs.map((f) => [f, `screen.capture.address.freq.${f}`]), { value: U.frequency || "weekly" }) : "")
      + `<div class="mk-acts">${cs.act("acquire", { tone: "primary" })}${cs.act("capturerequest")}${watch ? `${cs.act("monitorset")}${cs.act("monitor")}` : ""}</div>`
      + (got ? (got.archive
        ? said("screen.capture.address.archive", { filed: got.filed })
          + (got.notPromoted ? said("screen.capture.address.notpromoted", { count: got.notPromoted }) : "")
        : said(got.existed ? "screen.capture.address.existed" : "screen.capture.address.done", { title: got.title }) + made(got)) : "")
      + refusedPromotion("address")
      + (U.requested ? said(U.requested.drains === false ? "screen.capture.address.requested.waits" : "screen.capture.address.requested",
        { address: U.requested.address }) : "")
      + (U.watching ? said("screen.capture.address.watching", { title: U.watching.title, frequency: cs.w(`screen.capture.address.freq.${U.watching.frequency}`) }) : "")
      + (U.checked ? said("screen.capture.address.checked", { title: U.checked }) : "")
      + `<p class="mk-note">${cs.w("screen.capture.address.note")}</p>`;
  } else if (tab === "file") {
    const how = [["made", "screen.capture.file.how.made"], ["handed", "screen.capture.file.how.handed"],
                 ["sent", "screen.capture.file.how.sent"], ["downloaded", "screen.capture.file.how.downloaded"]];
    body = cs.field("ci-file", "screen.capture.file.choose", { type: "file", help: "screen.capture.file.choosehelp", capture: "environment",
        accept: "image/*,video/*,audio/*,application/pdf,text/*,.csv,.doc,.docx,.xls,.xlsx,.odt,.ods,.zip" })
      + `<p class="mk-small muted">${cs.w("photo.reminder")}</p>`
      + `<fieldset class="mk-checks"><legend>${cs.w("screen.capture.file.how")}</legend>`
      + how.map(([k, w]) => `<label><input type="radio" id="ci-how-${k}" name="ci-how" value="${k}"> ${cs.w(w)}</label>`).join("")
      + "</fieldset>"
      + `<p class="mk-small muted">${cs.w("screen.capture.file.downloaded")} <a href="/app/capture/address${at.id ? "/" + encodeURIComponent(at.id) : ""}" data-nav>${cs.w("screen.capture.file.toaddress")}</a></p>`
      + cs.field("ci-where", "screen.capture.file.where", { help: "screen.capture.file.wherehelp", value: U.where || "" })
      + cs.field("ci-what", "screen.capture.file.what", { area: true, rec: true, value: U.what || "" })
      + `<div class="mk-acts">${cs.act("captureupload", { tone: "primary", label: "act.captureupload.label.capture" })}</div>`
      + (U.uploaded ? said(U.uploaded.existed ? "screen.capture.file.existed" : "screen.capture.file.done", { name: U.uploaded.name }) + made(U.uploaded) : "")
      + refusedPromotion("file")
      + `<p class="mk-note">${cs.w("screen.capture.file.note")}</p>`;
  } else {
    const draft = U.draft;
    /* R10 (N987): the draft is filled into the words field it asks for (`cs.fill`, in `doneWritingHelp`), labelled as
       the assistant's, asked by this member; the field keeps its id, and only the member's own `testify` keeps it */
    body = `<p class="mk-note">${cs.w("screen.capture.saw.note")}</p>`
      + cs.field("ci-words", "screen.capture.saw.words", { area: true, rec: true, value: U.words || "",
        ...(draft ? { draft: "screen.capture.saw.draft", draftFills: { handle: draft.handle } } : {}) })
      + (draft && draft.untested ? `<p class="mk-small muted" data-label="untested">${cs.w("ai.label.untested")}</p>` : "")
      + (view.reachable ? `<div class="mk-acts">${cs.act("writinghelp", { label: "act.writinghelp.label.capture" })}</div>`
        + `<p class="mk-small muted">${cs.w("screen.capture.help.only")}</p>` : "")
      + cs.field("ci-where", "screen.capture.saw.where", { value: U.where || "" })
      + cs.field("ci-when", "screen.capture.saw.when", { help: "screen.capture.saw.whenhelp", value: U.when || "" })
      + `<p class="mk-small muted">${cs.w("photo.reminder")}</p>`
      + `<div class="mk-acts">${cs.act("testify", { tone: "primary" })}</div>`
      + (U.testified ? said("screen.capture.saw.done", { id: U.testified }) : "")
      + `<p class="mk-note">${cs.w("screen.capture.saw.after")}</p>`;
  }
  return `<div class="mk-h">${cs.title()}<p class="mk-sub">${cs.w("screen.capture.sub")}</p></div>`
    + `<nav class="mk-tabs2" role="tablist" aria-label="${cs.w("screen.capture.tabs")}">${tabs}</nav>`
    + `<div data-tab="${tab}">${body}</div>`;
}

/* R1: `acquire` with the address. Its five refusals each in its own sentence (`refusals`, by key beside the address, R25),
 * any other by shell R13; an empty address is `capture.fieldneeded` with the field's label (R25). */
function sendAcquire(view, el, cs) {
  const address = String(cs.value("ci-address") || "").trim();
  if (!address) return { refuse: "capture.fieldneeded", fills: { field: { html: cs.w("screen.capture.address.label") } } };
  cs.set("address", address);
  return { body: { locator: address } };
}

/* R1 (N747; control-plane R58): an answer that carries `promoted` (an archive the door already promoted) is not
 * promoted again; any other new document is promoted here as an information bundle at `collected` (`promoteDocument`,
 * R23's files included), filed under the project the subject names (R22). A refusal of either step is drawn on the tab. */
async function doneAcquire(view, answer, cs) {
  const a = answer || {}, doc = a.document || {};
  const address = String((view.ui && view.ui.address) || "");
  const last = (address.replace(/[?#].*$/, "").match(/\/([^/]+)\/?$/) || [])[1] || "";
  const title = String(doc.title || last || address).slice(0, 200);
  cs.set("promoteRefused", null);
  if (Array.isArray(a.promoted)) {
    cs.set("captured", { archive: true, filed: a.promoted.length, notPromoted: Array.isArray(a.not_promoted) ? a.not_promoted.length : 0, title, address,
                         bundleId: typeof a.bundleId === "string" ? a.bundleId : null });
    return;
  }
  if (a.existed === true) { cs.set("captured", { existed: true, title, address, bundleId: typeof a.bundleId === "string" ? a.bundleId : null }); return; }
  const filed = await view.parts.projectOf(cs, view.parts.forOf(view).id);
  if (filed === null) { cs.set("promoteRefused", { tab: "address", text: "" }); return; }
  const made = await view.parts.promoteDocument(cs, { doc, title, locator: address, project: filed.id });
  if (made.refused !== undefined) { cs.set("promoteRefused", { tab: "address", text: made.refused }); return; }
  cs.set("captured", { title, address, bundleId: made.bundleId, filed });
}

/* R14 (capture-requests R56): "Ask for this later" is the member's own request: `capturerequest` with the address and no
 * `run`. Its answer's `drains: false` is said: the request waits until the group's Civicsmith captures unattended. */
function sendCaptureRequest(view, el, cs) {
  const address = String(cs.value("ci-address") || "").trim();
  if (!address) return { refuse: "capture.fieldneeded", fills: { field: { html: cs.w("screen.capture.address.label") } } };
  return { body: { address } };
}
function doneCaptureRequest(view, answer, cs) {
  cs.set("requested", { address: String(cs.value("ci-address") || "").trim(), drains: !(answer && answer.drains === false) });
}

/* R14, R16: the document the address was captured into: this visit's capture of it (the acquire's bundle), else the held
 * document whose source is that address (`heldcaptures`). Null when none is known: watching asks a captured address. */
async function bundleFor(view, cs, address) {
  const got = view.ui && view.ui.captured;
  if (got && got.address === address && typeof got.bundleId === "string" && got.bundleId) return { bundleId: got.bundleId, title: got.title };
  const a = await cs.call("heldcaptures", { query: { limit: 1000 } });
  const v = a && a.result && typeof a.result === "object" ? a.result : a;
  const rows = v && Array.isArray(v.held) ? v.held : [];
  const r = rows.find((x) => x && x.source && (x.source.address === address || x.source.locator === address));
  return r && typeof r.bundle_id === "string" ? { bundleId: r.bundle_id, title: r.title || address } : null;
}

/* R14, R16: "Watch this address": `monitorset` with `enabled: true` and the frequency chosen (a word of `MONITOR_FREQ`).
 * Its refusals (`NOT_MONITORED`, `NO_LOCATOR`, `MONITOR_SET_REFUSED`) are the shell's (R13). */
async function sendMonitorSet(view, el, cs) {
  const address = String(cs.value("ci-address") || "").trim();
  if (!address) return { refuse: "capture.fieldneeded", fills: { field: { html: cs.w("screen.capture.address.label") } } };
  const freq = ["daily", "weekly", "monthly", "hourly", "per_meeting"].find((f) => f === cs.value("ci-freq")) || "weekly";
  const found = await view.parts.bundleFor(view, cs, address);
  if (!found) return { refuse: "screen.capture.address.watchafter" };
  cs.set("frequency", freq);
  cs.set("target", found);
  return { body: { bundleId: found.bundleId, enabled: true, frequency: freq } };
}
function doneMonitorSet(view, answer, cs) {
  const t = (view.ui && view.ui.target) || {};
  cs.set("watching", { title: t.title || "", frequency: (answer && answer.frequency) || (view.ui && view.ui.frequency) || "weekly" });
  cs.set("checked", null);
}

/* R16: "Check it now": `monitor` alone, on the same document. */
async function sendMonitor(view, el, cs) {
  const address = String(cs.value("ci-address") || "").trim();
  if (!address) return { refuse: "capture.fieldneeded", fills: { field: { html: cs.w("screen.capture.address.label") } } };
  const found = await view.parts.bundleFor(view, cs, address);
  if (!found) return { refuse: "screen.capture.address.watchafter" };
  cs.set("target", found);
  return { body: { bundleId: found.bundleId } };
}
function doneMonitor(view, answer, cs) {
  cs.set("checked", (view.ui && view.ui.target && view.ui.target.title) || "");
}

/* R2: the upload. `statement` composed from the three answers in order, each with its label, at most 2,000 characters;
 * nothing is sent while one is empty, and the screen says which. The file's bytes are the raw body (control-plane R72),
 * under the session header. */
function sendUpload(view, el, cs) {
  const file = cs.file("ci-file");
  const choice = ["made", "handed", "sent", "downloaded"].find((k) => cs.value(`ci-how-${k}`) === true);
  const where = String(cs.value("ci-where") || "").trim(), what = String(cs.value("ci-what") || "").trim();
  if (!file || typeof file.name !== "string") return { refuse: "screen.capture.file.nofile" };
  const missing = [!choice && "screen.capture.file.how", !where && "screen.capture.file.where", !what && "screen.capture.file.what"].filter(Boolean);
  if (missing.length) return { refuse: "screen.capture.file.missing", fills: { fields: { html: missing.map((k) => cs.w(k)).join(", ") } } };
  const statement = [`${cs.w("screen.capture.file.how")}: ${cs.w(`screen.capture.file.how.${choice}`)}`,
                     `${cs.w("screen.capture.file.where")}: ${where}`, `${cs.w("screen.capture.file.what")}: ${what}`]
    .join("\n").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  if (Array.from(statement).length > 2000) return { refuse: "screen.capture.file.toolong", fills: { count: Array.from(statement).length } };
  return { query: { statement, name: file.name }, raw: file };
}
/* R21 (D9; capture R86, control-plane R72): an upload's answer is a provenance document; it is promoted as an information
 * bundle at `collected`, as R1 promotes `acquire`'s (`promoteDocument`), filed under the subject's project (R22). "It waits
 * in Held captures" is said only once that promotion answers; a refusal is drawn on the tab. An answer with `existed: true`
 * promotes nothing new. */
async function doneUpload(view, answer, cs) {
  const a = answer || {}, file = cs.file("ci-file");
  const name = file && file.name ? file.name : "";
  cs.set("promoteRefused", null);
  cs.set("uploaded", null);
  if (a.existed === true) { cs.set("uploaded", { name, existed: true, bundleId: null }); return; }
  const doc = a.document && typeof a.document === "object" ? a.document : {};
  const filed = await view.parts.projectOf(cs, view.parts.forOf(view).id);
  if (filed === null) { cs.set("promoteRefused", { tab: "file", text: "" }); return; }
  const made = await view.parts.promoteDocument(cs, { doc, title: name || String(doc.locator || ""), locator: String(doc.locator || ""), project: filed.id });
  if (made.refused !== undefined) { cs.set("promoteRefused", { tab: "file", text: made.refused }); return; }
  cs.set("uploaded", { name, existed: false, bundleId: made.bundleId, title: name, filed });
}

/* R3: what the member saw or heard (`testify`): the words, with where in them, and when as `observedAt`. */
function sendTestify(view, el, cs) {
  const words = String(cs.value("ci-words") || "").trim(), where = String(cs.value("ci-where") || "").trim();
  const when = String(cs.value("ci-when") || "").trim();
  const missing = [!words && "screen.capture.saw.words", !where && "screen.capture.saw.where", !when && "screen.capture.saw.when"].filter(Boolean);
  if (missing.length) return { refuse: "screen.capture.saw.missing", fills: { fields: { html: missing.map((k) => cs.w(k)).join(", ") } } };
  const at = Date.parse(when);
  if (!Number.isFinite(at) || at > (cs.now ? cs.now() : Date.now())) return { refuse: "screen.capture.saw.badwhen" };
  const plain = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  return { body: { words: `${words}\n\n${plain(cs.w("screen.capture.saw.wherein", { where }))}`, observedAt: new Date(at).toISOString().split(".")[0] + "Z" } };
}
function doneTestify(view, answer, cs) {
  cs.set("draft", null);
  /* provenance testify answers `{ok, bundle_id, bundle_sha, capture_sha, …}` (K3171) */
  cs.set("testified", (answer && typeof answer.bundle_id === "string" && answer.bundle_id) || "");
}

/* R3, R10: help wording the member's own account (`writinghelp`, DEC-153 (2)), drawn only while the assistant is
 * reachable; told only what the member typed. Its draft is filled into the words field by `cs.fill` (interface-shell
 * R27), labelled "Draft · the assistant's, asked by <handle>", with the test-instance label when the answer carries
 * `untested` (wizard-scripts R34). Nothing is kept until the member's own `testify`. */
function sendWritingHelp(view, el, cs) {
  const told = String(cs.value("ci-words") || "").trim();
  if (!told) return { refuse: "screen.capture.help.empty" };
  cs.set("where", cs.value("ci-where") || "");
  cs.set("when", cs.value("ci-when") || "");
  return { body: { op: "testify", field: "words", told } };
}
function doneWritingHelp(view, answer, cs) {
  const a = answer || {};
  const untested = a.untested === true || (typeof a.untested === "string" && a.untested !== "");
  cs.fill("ci-words", String(a.text || ""));
  cs.set("draft", { handle: (view.me && view.me.handle) || "", untested });
}

export const CAPTURE_SCREEN = Object.freeze({
  id: "capture",
  reads: captureReads,
  render: renderCapture,
  parts: Object.freeze({ bundleFor, forOf, projectOf, promoteDocument }),
  acts: Object.freeze([
    Object.freeze({ op: "acquire", label: "act.acquire.label.capture", send: sendAcquire, done: doneAcquire, rereads: [],
                    refusals: Object.freeze({ BAD_LOCATOR: "refusal.BAD_LOCATOR", SOURCE_REFUSED: "refusal.SOURCE_REFUSED",
                                              FETCH_FAILED: "refusal.FETCH_FAILED", EMPTY: "refusal.EMPTY", TOO_LARGE: "refusal.TOO_LARGE" }) }),
    Object.freeze({ op: "capturerequest", label: "act.capturerequest.label.capture", send: sendCaptureRequest, done: doneCaptureRequest, rereads: [] }),
    Object.freeze({ op: "monitorset", label: "act.monitorset.label.capture", send: sendMonitorSet, done: doneMonitorSet, rereads: [] }),
    Object.freeze({ op: "monitor", label: "act.monitor.label.capture", send: sendMonitor, done: doneMonitor, rereads: [] }),
    Object.freeze({ op: "captureupload", label: "act.captureupload.label.capture", send: sendUpload, done: doneUpload, rereads: [], reasonField: "statement",
                    refusals: Object.freeze({ UPLOAD_NO_STATEMENT: "screen.capture.refusal.UPLOAD_NO_STATEMENT", EMPTY: "screen.capture.refusal.upload.EMPTY",
                                              TOO_LARGE: "screen.capture.refusal.upload.TOO_LARGE",
                                              MEMBER_SESSION_REQUIRED: "screen.capture.refusal.MEMBER_SESSION_REQUIRED" }) }),
    Object.freeze({ op: "testify", label: "act.testify.label.capture", send: sendTestify, done: doneTestify, rereads: [], reasonField: "words" }),
    Object.freeze({ op: "writinghelp", label: "act.writinghelp.label.capture", send: sendWritingHelp, done: doneWritingHelp, rereads: [], reasonField: "told" }),
  ]),
});
