/* The `capture` screen (Add; R1–R3): three tabs, each its own, at `/app/capture/address`, `/app/capture/file` and
 * `/app/capture/saw` (the subject names the tab; none is the address tab). Every function is self-contained (interface-shell
 * R21 (1)): it refers only to its parameters, the kit `cs` and the language's own globals. */

/* R1–R3: the screen reads nothing before an act. */
function captureReads() {
  return {};
}

/* R1–R3: the page. `view.subject` the tab; `view.ui` what the acts left (outcomes, a draft); `view.reachable` whether the
 * assistant is reachable for this member (interface-shell R20). */
function renderCapture(cs, view) {
  const tab = ["address", "file", "saw"].includes(view.subject) ? view.subject : "address";
  const U = view.ui || {};
  const said = (k, f) => `<p class="mk-note" role="status">${cs.w(k, f)}</p>`;
  const tabs = [["address", "screen.capture.tab.address"], ["file", "screen.capture.tab.file"], ["saw", "screen.capture.tab.saw"]]
    .map(([k, w]) => `<a role="tab" class="cs-tab" href="/app/capture/${k}" data-nav${k === tab ? ' aria-selected="true" aria-current="page"' : ""}>${cs.w(w)}</a>`).join("");
  let body = "";
  if (tab === "address") {
    const got = U.captured;
    body = cs.field("ci-address", "screen.capture.address.label", { help: "screen.capture.address.help", value: U.address || "" })
      + `<div class="mk-acts">${cs.act("acquire", { tone: "primary" })}${cs.act("capturerequest")}`
      + (got && got.bundleId ? cs.act("monitor", { data: { bundle: got.bundleId } }) : "") + "</div>"
      + (got ? (got.archive
        ? said("screen.capture.address.archive", { filed: got.filed })
          + (got.notPromoted ? said("screen.capture.address.notpromoted", { count: got.notPromoted }) : "")
        : said(got.existed ? "screen.capture.address.existed" : "screen.capture.address.done", { title: got.title })) : "")
      + (U.promoteRefused ? `<p class="cs-refusal" role="alert">${cs.esc(U.promoteRefused)}</p>` : "")
      + (U.requested ? said("screen.capture.address.requested", { address: U.requested }) : "")
      + (U.watching ? said("screen.capture.address.watching", { title: U.watching }) : "")
      + `<p class="mk-note">${cs.w("screen.capture.address.note")}</p>`;
  } else if (tab === "file") {
    const how = [["made", "screen.capture.file.how.made"], ["handed", "screen.capture.file.how.handed"],
                 ["sent", "screen.capture.file.how.sent"], ["downloaded", "screen.capture.file.how.downloaded"]];
    body = `<div class="cs-field mk-drop"><label for="ci-file">${cs.w("screen.capture.file.choose")}</label>`
      + `<span class="help" id="ci-file-help">${cs.w("screen.capture.file.choosehelp")}</span>`
      + `<input id="ci-file" type="file" accept="image/*,video/*,audio/*,application/pdf,text/*,.csv,.doc,.docx,.xls,.xlsx,.odt,.ods,.zip" capture="environment" aria-describedby="ci-file-help"></div>`
      + `<p class="mk-small muted">${cs.w("photo.reminder")}</p>`
      + `<fieldset class="mk-checks"><legend>${cs.w("screen.capture.file.how")}</legend>`
      + how.map(([k, w]) => `<label><input type="radio" id="ci-how-${k}" name="ci-how" value="${k}"> ${cs.w(w)}</label>`).join("")
      + "</fieldset>"
      + `<p class="mk-small muted">${cs.w("screen.capture.file.downloaded")} <a href="/app/capture/address" data-nav>${cs.w("screen.capture.file.toaddress")}</a></p>`
      + cs.field("ci-where", "screen.capture.file.where", { help: "screen.capture.file.wherehelp", value: U.where || "" })
      + cs.field("ci-what", "screen.capture.file.what", { area: true, rec: true, value: U.what || "" })
      + `<div class="mk-acts">${cs.act("captureupload", { tone: "primary", label: "act.capture.label.capture" })}</div>`
      + (U.uploaded ? said(U.uploaded.existed ? "screen.capture.file.existed" : "screen.capture.file.done", { name: U.uploaded.name }) : "")
      + `<p class="mk-note">${cs.w("screen.capture.file.note")}</p>`;
  } else {
    const draft = U.draft;
    /* a draft is drawn into a field of a new id: the shell keeps what was typed into a field it redraws (K3002) */
    body = `<p class="mk-note">${cs.w("screen.capture.saw.note")}</p>`
      + cs.field(U.wordsId || "ci-words", "screen.capture.saw.words", { area: true, rec: true, value: draft ? draft.text : (U.words || "") })
      + (draft ? `<p class="cs-draftlabel">${cs.w("draft.machine.label")}</p>`
        + (draft.untested ? `<p class="cs-untested" data-label="untested">${cs.w("ai.label.untested")}</p>` : "") : "")
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
    + `<div class="st" data-tab="${tab}">${body}</div>`;
}

/* R1: `acquire` with the address. Its five refusals each in its own sentence (`refusals`), any other by shell R13. */
function sendAcquire(view, el, cs) {
  const address = String(cs.value("ci-address") || "").trim();
  if (!address) return { refuse: "screen.capture.address.empty" };
  cs.set("address", address);
  return { body: { locator: address } };
}

/* R1 (N747; control-plane R58): an answer that carries `promoted` (an archive the door already promoted) is not
 * promoted again; any other new document is promoted here as an information bundle at `collected`, composed as the
 * setup page's intake composes one (`bundle.md` at `information@2`, `data/provenance.json` and its register), under an id
 * `allocid` mints. A refusal of either step is drawn on the tab. */
async function doneAcquire(view, answer, cs) {
  const a = answer || {}, doc = a.document || {};
  const address = String((view.ui && view.ui.address) || "");
  const last = (address.replace(/[?#].*$/, "").match(/\/([^/]+)\/?$/) || [])[1] || "";
  const title = String(doc.title || last || address).slice(0, 200);
  cs.set("promoteRefused", null);
  if (Array.isArray(a.promoted)) {
    cs.set("captured", { archive: true, filed: a.promoted.length, notPromoted: Array.isArray(a.not_promoted) ? a.not_promoted.length : 0, title });
    return;
  }
  if (a.existed === true) { cs.set("captured", { existed: true, title }); return; }
  const why = (r) => (r && (r.translation || r.detail || r.reason || r.code)) || "";
  const now = new Date(cs.now ? cs.now() : Date.now()).toISOString().split(".")[0] + "Z";
  const minted = await cs.call("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } });
  const mid = minted && (minted.result || minted);
  if (!mid || mid.ok === false || typeof mid.id !== "string") { cs.set("promoteRefused", why(mid)); return; }
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const id = slug ? `${mid.id}-${slug}` : mid.id;
  const sha = doc.capture && doc.capture.sha256;
  /* UTF-8 length, computed from the code points (REC-178: a file's bytes is its UTF-8 length, never text.length). */
  const len = (s) => { let n = 0; for (const ch of String(s)) { const c = ch.codePointAt(0); n += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4; } return n; };
  const text = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title),
    "current_state: collected", "prior_state: null", "created: " + now, "last_updated: " + now,
    "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
    "criticality: supporting", "source_status: unchanged", ...(sha ? ["content_hash: sha256:" + sha] : []),
    "source:", "  locator: " + JSON.stringify(address), "  authority: member-entered", "  retrieved: " + now,
    "monitoring:", "  enabled: false", "  frequency: none", "---", "",
    "## Summary", "", title, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [doc] }, null, 1);
  const parts = Array.isArray(doc.parts) && doc.parts.length ? doc.parts : null;
  const atts = Array.isArray(doc.attestations) ? doc.attestations : [];
  const files = [{ path: "bundle.md", text, bytes: len(text), sha256: await cs.digest(text) },
                 { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: await cs.digest(prov) },
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
  if (!p || p.ok === false) { cs.set("promoteRefused", why(p)); return; }
  cs.set("captured", { title, bundleId: p.bundleId || id });
}

/* R1: "Ask for this later" (`capturerequest`, the address). Refusals by shell R13 (N969: no member path yet). */
function sendCaptureRequest(view, el, cs) {
  const address = String(cs.value("ci-address") || "").trim();
  if (!address) return { refuse: "screen.capture.address.empty" };
  return { body: { address } };
}
function doneCaptureRequest(view, answer, cs) {
  cs.set("requested", String(cs.value("ci-address") || "").trim());
}

/* R1: "Watch this address": `monitor` names the bundle the address was captured into (`data.bundle`), so it is drawn
 * once a capture landed. Refusals by shell R13 (`NOT_MONITORED` among them; N969). */
function sendMonitor(view, el) {
  const bundleId = el && el.dataset && el.dataset.bundle;
  if (!bundleId) return { refuse: "screen.capture.address.watchafter" };
  return { body: { bundleId } };
}
function doneMonitor(view, answer, cs) {
  cs.set("watching", view.ui && view.ui.captured ? view.ui.captured.title : "");
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
  if (missing.length) return { refuse: "screen.capture.file.missing", fills: { fields: missing.map((k) => cs.w(k)).join(", ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") } };
  const statement = [`${cs.w("screen.capture.file.how")}: ${cs.w(`screen.capture.file.how.${choice}`)}`,
                     `${cs.w("screen.capture.file.where")}: ${where}`, `${cs.w("screen.capture.file.what")}: ${what}`]
    .join("\n").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  if (Array.from(statement).length > 2000) return { refuse: "screen.capture.file.toolong", fills: { count: Array.from(statement).length } };
  return { query: { statement, name: file.name }, raw: file };
}
function doneUpload(view, answer, cs) {
  const file = cs.file("ci-file");
  cs.set("uploaded", { name: file && file.name ? file.name : "", existed: !!(answer && answer.existed === true) });
}

/* R3: what the member saw or heard (`testify`): the words, with where in them, and when as `observedAt`. */
function sendTestify(view, el, cs) {
  const words = String(cs.value((view.ui && view.ui.wordsId) || "ci-words") || "").trim(), where = String(cs.value("ci-where") || "").trim();
  const when = String(cs.value("ci-when") || "").trim();
  const missing = [!words && "screen.capture.saw.words", !where && "screen.capture.saw.where", !when && "screen.capture.saw.when"].filter(Boolean);
  if (missing.length) return { refuse: "screen.capture.saw.missing", fills: { fields: missing.map((k) => cs.w(k)).join(", ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") } };
  const at = Date.parse(when);
  if (!Number.isFinite(at) || at > (cs.now ? cs.now() : Date.now())) return { refuse: "screen.capture.saw.badwhen" };
  const plain = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  return { body: { words: `${words}\n\n${plain(cs.w("screen.capture.saw.wherein", { where }))}`, observedAt: new Date(at).toISOString().split(".")[0] + "Z" } };
}
function doneTestify(view, answer, cs) {
  cs.set("draft", null);
  cs.set("testified", (answer && (answer.id || answer.bundleId)) || "");
}

/* R3: help wording the member's own account (`writinghelp`, DEC-153 (2)), drawn only while the assistant is reachable;
 * told only what the member typed. Its draft fills the field labelled as its draft, with the test-instance label when
 * the answer carries `untested` (K2816 (2); screens-inquiry R7). */
function sendWritingHelp(view, el, cs) {
  const told = String(cs.value((view.ui && view.ui.wordsId) || "ci-words") || "").trim();
  if (!told) return { refuse: "screen.capture.help.empty" };
  cs.set("where", cs.value("ci-where") || "");
  cs.set("when", cs.value("ci-when") || "");
  return { body: { op: "testify", field: "words", told } };
}
function doneWritingHelp(view, answer, cs) {
  const a = answer || {};
  const untested = a.untested === true || a.label === "untested" || (Array.isArray(a.labels) && a.labels.includes("untested"));
  const n = Number(String((view.ui && view.ui.wordsId) || "ci-words-0").split("-").pop()) || 0;
  cs.set("wordsId", `ci-words-${n + 1}`);
  cs.set("draft", { text: String(a.text || ""), untested });
}

export const CAPTURE_SCREEN = Object.freeze({
  id: "capture",
  reads: captureReads,
  render: renderCapture,
  acts: Object.freeze([
    Object.freeze({ op: "acquire", label: "act.acquire.label.capture", send: sendAcquire, done: doneAcquire, rereads: [],
                    refusals: Object.freeze({ BAD_LOCATOR: "screen.capture.refusal.BAD_LOCATOR", SOURCE_REFUSED: "screen.capture.refusal.SOURCE_REFUSED",
                                              FETCH_FAILED: "screen.capture.refusal.FETCH_FAILED", EMPTY: "screen.capture.refusal.EMPTY",
                                              TOO_LARGE: "screen.capture.refusal.TOO_LARGE" }) }),
    Object.freeze({ op: "capturerequest", label: "act.capturerequest.label.capture", send: sendCaptureRequest, done: doneCaptureRequest, rereads: [] }),
    Object.freeze({ op: "monitor", label: "act.monitor.label.capture", send: sendMonitor, done: doneMonitor, rereads: [] }),
    Object.freeze({ op: "captureupload", label: "act.capture.label.capture", send: sendUpload, done: doneUpload, rereads: [], reasonField: "statement",
                    refusals: Object.freeze({ UPLOAD_NO_STATEMENT: "screen.capture.refusal.UPLOAD_NO_STATEMENT", EMPTY: "screen.capture.refusal.upload.EMPTY",
                                              TOO_LARGE: "screen.capture.refusal.upload.TOO_LARGE",
                                              MEMBER_SESSION_REQUIRED: "screen.capture.refusal.MEMBER_SESSION_REQUIRED" }) }),
    Object.freeze({ op: "testify", label: "act.testify.label.capture", send: sendTestify, done: doneTestify, rereads: [], reasonField: "words" }),
    Object.freeze({ op: "writinghelp", label: "act.writinghelp.label.capture", send: sendWritingHelp, done: doneWritingHelp, rereads: [], reasonField: "told" }),
  ]),
});
