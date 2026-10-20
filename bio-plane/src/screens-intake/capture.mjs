/* The `capture` screen (Add; R1–R3): three tabs, each its own, at `/app/capture/address`, `/app/capture/file` and
 * `/app/capture/saw` (the subject names the tab; none is the address tab). Every function is self-contained (interface-shell
 * R21 (1)): it refers only to its parameters, the kit `cs` and the language's own globals. */

/* R1–R3: nothing is read before an act, but on the address tab (R29, R31, R38): the member's open captures (`opencaptures`,
 * for "Unfinished"), the held and vouched documents (the title of the one that holds a capture's primary, and of the copy an
 * address is already held as, R40), the members (`memberlist`, the handle of who captured that copy) and, when Add is opened
 * from a question, the questions the member may see (`search`, as `find-in` reads them) for "For which question". */
function captureReads(view) {
  /* the tab and the subject as `forOf` reads them: an unknown tab is the address tab */
  const s = String((view && view.subject) || "");
  const at = s.indexOf("/");
  const tab = at < 0 ? s : s.slice(0, at), id = at < 0 ? "" : s.slice(at + 1);
  if (tab === "file" || tab === "saw") return {};
  return { open: { op: "opencaptures", query: {}, empty: (v) => !v || !Array.isArray(v.captures) || !v.captures.length },
           held: { op: "heldcaptures", query: { limit: 200, state: "held_and_vouched" } },
           members: { op: "memberlist" },
           /* R47 (C20): the member's team's requests a source turned away for a login */
           refused: { op: "capturerequests", query: { state: "refused", limit: 50 }, empty: (v) => !v || !Array.isArray(v.requests) || !v.requests.length },
           ...(/^INQ-[A-Za-z0-9-]+$/.test(id) ? { questions: { op: "search", query: { q: "type:inquiry", limit: "200" },
             empty: (v) => !v || !Array.isArray(v.hits) || !v.hits.length } } : {}) };
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

/* R33 (N1139; DEC-325): a document is titled from its own title: the reading's `title` when it is not null; else what the
 * answer's document states; else, for an address that gives only a host, `document.untitled.web` (`{site}` the host,
 * `{date}` the day captured), never a slug or an address; else R50's `screen.capture.address.untitled` (`{kind}` from the document's
 * format, `{site}` the address's host), never the address's file part. Plain text, at most 200 characters. */
function titleOf(cs, o) {
  const plain = (t) => String(t).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
  const read = o.reading && typeof o.reading.title === "string" ? o.reading.title.replace(/\s+/g, " ").trim() : "";
  if (read) return read.slice(0, 200);
  const address = String(o.address || "");
  const stated = o.doc && typeof o.doc.title === "string" ? o.doc.title.trim() : "";
  if (stated) return stated.slice(0, 200);
  let host = "", hostOnly = false;
  try { const u = new URL(address); host = u.hostname; hostOnly = u.pathname.replace(/\/+$/, "") === ""; } catch (e) { host = ""; }
  if (host && hostOnly) {
    const day = new Date(cs.now ? cs.now() : Date.now()).toISOString().split(".")[0] + "Z";
    return plain(cs.w("document.untitled.web", { site: host, date: { html: cs.date(day) } })).slice(0, 200);
  }
  /* R50 (DEC-384 I-03): a document with no title is "A {kind} from {site}", never the file part of its address. `kind` is the
     document's own format (`document.kind.*`), else what its declared media type names, else "file". */
  const prof = o.doc && o.doc.profile && o.doc.profile.format && typeof o.doc.profile.format.format === "string" ? o.doc.profile.format.format : "";
  const media = String((o.doc && o.doc.capture && o.doc.capture.content_type) || (o.doc && o.doc.profile && o.doc.profile.source_content_type) || "").toLowerCase().split(";")[0].trim();
  const BY_MEDIA = { "application/pdf": "pdf", "text/html": "html", "application/xhtml+xml": "html", "text/plain": "text", "text/csv": "csv",
    "image/jpeg": "jpeg", "image/png": "png", "application/zip": "zip",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx", "application/vnd.oasis.opendocument.text": "odt",
    "application/vnd.oasis.opendocument.spreadsheet": "ods", "application/vnd.oasis.opendocument.presentation": "odp" };
  const kinds = ["pdf", "docx", "xlsx", "pptx", "odt", "ods", "odp", "csv", "jpeg", "png", "html", "zip", "text"];
  const kind = kinds.includes(prof) ? prof : BY_MEDIA[media] || "undetermined";
  return plain(cs.w("screen.capture.address.untitled", { kind: plain(cs.w("document.kind." + kind)), site: host || "" })).slice(0, 200);
}

/* R13, DEC-342: a refusal in words, beside the act or the address that met it: `refusal.<CODE>` when the table holds the code,
 * else the answer's own translation, else `refusal.uncatalogued` with the code as given; an answer with a code and neither is
 * the one place a code is drawn. Never the builder's `detail`. "" when the answer states no code and no translation (the caller
 * draws `shell.unread`). The answer's fields fill the word, as plain values only. */
function refusalHtml(cs, r) {
  const a = r && typeof r === "object" ? r : {};
  const code = String(a.code || a.reason || "");
  const fills = {};
  for (const k of Object.keys(a)) if (typeof a[k] === "string" || typeof a[k] === "number") fills[k] = a[k];
  if (code && cs.w("refusal." + code) !== "refusal." + code) return cs.w("refusal." + code, fills);
  if (typeof a.translation === "string" && a.translation) return cs.esc(a.translation);
  return code ? `${cs.w("refusal.uncatalogued")} <code>${cs.esc(code)}</code>` : "";
}

/* R1, R21, R23 (N747): a document the screen promotes as an information bundle at `collected`, the one composition both
 * the address path (R1) and the upload path (R21) use, under an id `allocid` mints: `bundle.md` at `information@2`
 * (naming the project when the capture has one, R22), `data/provenance.json` and its register, and, so that `release` is not
 * refused `ENTRY_REQUIREMENTS` (R23), `data/dataset.json` with the `content_hash` that canonical dataset hashes to
 * (capture grammar C-2.7), beside the capture's own files under `snapshots/`. Answers `{bundleId}`, or `{refused}` with the
 * answer, which `refusalHtml` words (`{}` when it gave none). */
async function promoteDocument(cs, o) {
  const doc = o.doc || {}, title = String(o.title || "").slice(0, 200), locator = String(o.locator || ""), project = o.project || "";
  const why = (r) => (r && typeof r === "object" ? r : {});
  const now = new Date(cs.now ? cs.now() : Date.now()).toISOString().split(".")[0] + "Z";
  const minted = await cs.call("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } });
  const mid = minted && (minted.result || minted);
  if (!mid || mid.ok === false || typeof mid.id !== "string") return { refused: why(mid) };
  /* R28: the cut comes first, then a trailing hyphen the cut left is trimmed, so the slug begins and ends with a letter or digit */
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40).replace(/-$/, "");
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
  const plainText = (s) => String(s).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  const made = (g) => g && typeof g.bundleId === "string" && g.bundleId
    ? `<p class="mk-small">${cs.ref("document", g.bundleId, g.existed ? plainText(cs.w("screen.capture.address.existed.open")) : g.title || g.bundleId, [])}`
      + (g.filed && g.filed.id ? ` ${g.filed.question ? cs.w("capture.filed.question", { project: g.filed.title, question: g.filed.question }) : cs.w("capture.filed.project", { project: g.filed.title })}` : "")
      /* R35: "Cite a passage" opens `find-in` over the document by its capture's fingerprint, never its record id */
      + (/^INQ-/.test(at.id) && typeof g.sha === "string" && g.sha ? ` <a class="cs-btn" data-tone="quiet" href="/app/find-in/${encodeURIComponent(g.sha)}/${encodeURIComponent(at.id)}" data-nav data-level="1" data-tip="${cs.w("capture.cite.tip")}">${cs.w("capture.cite")}</a>` : "")
      + "</p>" : "";
  /* R21: a refused promotion is drawn on its tab in words (`refusalHtml`), else the shell's own for a failure with none */
  const refusedPromotion = (t) => U.promoteRefused && U.promoteRefused.tab === t
    ? `<p class="cs-state" data-state="failed" role="alert">${U.promoteRefused.html || cs.w("shell.unread")}</p>` : "";
  /* R36 (DEC-292 D14; K3726): Add opened from a question says what it files under, first. The project and question are read
     once and kept in page memory (`filedFor`), as the act that files the capture reads them. */
  let forqNote = "";
  if (at.id) {
    if (!U.forq || U.forq.id !== at.id) {
      U.forq = { id: at.id, state: "loading" };
      view.parts.projectOf(cs, at.id).then((r) => cs.set("forq", { id: at.id, state: "ok", value: r }), () => cs.set("forq", { id: at.id, state: "ok", value: null }));
    }
    const m = U.forq.state === "ok" && U.forq.value && U.forq.value.id && U.forq.value.question && /^INQ-/.test(at.id) ? U.forq.value : null;
    if (m) forqNote = said("screen.capture.forq", { project: m.title, question: `\u201C${m.question}\u201D` });
  }
  let body = "";
  if (tab === "address") {
    const got = U.captured;
    const freqs = ["daily", "weekly", "monthly", "hourly", "per_meeting"];
    /* R18: one act row; watching and checking join it once the address has a document, with the frequency chosen beside
       them, and no watching section is drawn before anything is captured. R14, R16: two acts, each on that document. */
    const watch = !!got && (cs.can("monitorset") || cs.can("monitor"));
    /* R29 (N1117; DEC-321 (1)): opened from a question, "For which question", preset to it and changeable among the
       questions the member may see (`cs.choice` over record data); the routed one stays chosen though the list omits it */
    const D = view.data || {};
    const qs = D.questions && D.questions.state === "ok" && D.questions.value && Array.isArray(D.questions.value.hits) ? D.questions.value.hits : [];
    const routed = at.id && /^INQ-/.test(at.id) && !qs.some((h) => String(h.bundle_id) === at.id) ? [{ value: at.id, text: at.id }] : [];
    const forq = /^INQ-/.test(at.id) ? cs.choice("ci-for", "capture.forquestion", routed.concat(qs.map((h) => ({ value: String(h.bundle_id), text: String(h.title || h.bundle_id) }))), { value: at.id })
      + `<p class="mk-small muted">${cs.w("capture.forquestion.help")}</p>` : "";
    /* R31 (N1094; DEC-240 D3): the member's own unfinished captures, each titled from the held document that holds its
       primary, else the address; drawn only when one is answered (R17), a read that failed drawn failed */
    const O = D.open;
    const heldRows = D.held && D.held.state === "ok" && D.held.value && Array.isArray(D.held.value.held) ? D.held.value.held : [];
    const unfinished = !O || O.state === "empty" ? "" : O.state !== "ok" ? cs.state(O, () => "")
      : (Array.isArray(O.value.captures) ? O.value.captures : []).map((c) => {
        const row = heldRows.find((r) => r && r.capture && r.capture.sha256 === c.primary_sha);
        const title = (row && row.title) || String(c.locator || "");
        return `<p class="mk-note" role="status">${cs.w("capture.unfinished", { title, n: c.outstanding, ago: { html: cs.date(c.started) } })} `
          + cs.act("acquire", { label: "capture.finish", data: { session: c.session, locator: String(c.locator || ""), title } }) + "</p>";
      }).join("");
    /* R38 (A64): pressing the capture act asked `heldat` first; an address the record already holds is drawn beside the address
       with nothing captured. The compared copy is named by its title from the vouched list (R40), who captured it by the handle
       `memberlist` gives (a member stamp's id with its `member:` prefix removed) and the day by `cs.date`; no sentence of the
       drawing is invented where the table holds no word (the "captured by" line, "nothing was added", the undetermined row). */
    const A = U.a64;
    let a64 = "";
    if (A && A.looking) a64 = `<p class="cs-state" data-state="loading" role="status">${cs.w("state.loading")}</p>`;
    else if (A && A.failed !== undefined) a64 = `<p class="cs-state" data-state="failed" role="alert">${A.failed || cs.w("shell.unread")}</p>`;
    else if (A) {
      const plain = (t) => String(t).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
      const copy = A.copy || {};
      const vouched = D.held && D.held.state === "ok" && D.held.value && Array.isArray(D.held.value.held) ? D.held.value.held : [];
      const row = vouched.find((r) => r && r.bundle_id === copy.document);
      const title = (row && row.title) || plain(cs.w("screen.held.untitled"));
      const roster = D.members && D.members.state === "ok" && D.members.value && Array.isArray(D.members.value.members) ? D.members.value.members : [];
      const who = String(copy.actor || "").replace(/^member:/, "");
      const handle = who ? ((roster.find((m) => m && m.member_id === who) || {}).handle || "") : "";
      const open = cs.ref("document", copy.document, plain(cs.w("screen.capture.openit")), [plain(cs.w("screen.capture.openit.help"))]);
      const by = handle && copy.retrieved ? cs.w("screen.capture.a64.captured_by", { name: { html: cs.ref("member", who, handle, []) }, date: { html: cs.date(copy.retrieved) } }) : "";
      const said_ = A.state === "unchanged" ? [cs.w("screen.capture.a64.the_site_still_gives_the_same_document"), cs.w("screen.capture.a64.nothing_added")]
        : A.state === "undetermined" ? [cs.w("screen.capture.a64.undetermined")] : [];
      const held = cs.row(cs.icon("accepted"), `${cs.w("screen.capture.a64.already_in_the_record_as")} <span class="rec">${cs.esc(title)}</span>`
        + ([by, ...said_].filter(Boolean).length ? `<span class="meta">${[by, ...said_].filter(Boolean).join(" · ")}</span>` : ""), open);
      const leave = `<a class="cs-btn" data-tone="quiet" href="/app/capture/address${at.id ? "/" + encodeURIComponent(at.id) : ""}" data-nav data-level="1" data-tip="${cs.w("screen.capture.leaveit.help")}">${cs.w("screen.capture.leaveit")}</a>`;
      a64 = A.state === "unchanged" ? cs.sheet(held)
        : cs.sheet(held + (A.state === "changed" ? cs.row(cs.icon("changed"), `<b>${cs.w("screen.capture.a64.the_site_has_changed_since")}</b><span class="meta">${cs.w("screen.capture.a64.your_team_holds_a_capture_from_14_septem", { date: { html: copy.retrieved ? cs.date(copy.retrieved) : "" } })}</span>`)
          + cs.row(cs.icon("clock"), `${cs.w("screen.capture.a64.capturing_it_again_keeps_the_new_copy_be")} ${cs.w("screen.capture.a64.whoever_cited_the_old_one_stays_on_it_un")}`) : ""))
          + `<div class="mk-acts">${cs.act("acquire", { label: "screen.capture.a64.capture_the_new_copy", data: { again: "1" } })}${leave}</div>`;
    }
    /* R45 (C19; DEC-375): keep the page as the site sent it or as a visitor saw it (`render: true`); the web-archive capture is
       refused to members, so it is told and offered nothing */
    const keep = cs.checks("ci-render", "screen.watching.sweepdef.match", [["site", "screen.capture.render.keep.site", !U.render], ["visitor", "screen.capture.render.keep.visitor", !!U.render]], { radio: true })
      + `<p class="mk-small muted">${cs.w("screen.capture.render.keep.explain1")} ${cs.w("screen.capture.render.keep.explain2")}</p>`
      + `<details class="mk-details"><summary>${cs.w("screen.capture.archive.summary")}</summary><p class="mk-small">${cs.w("screen.capture.archive.explain1")} ${cs.w("screen.capture.archive.explain2")}</p></details>`;
    /* R50 (A1, A2): the working line from the press until the answer; the result is a status line under the button */
    const working = U.working ? `<p class="mk-note" role="status" data-working><b>${cs.w("screen.capture.address.working.head")}</b> ${cs.w("screen.capture.address.working")}</p>` : "";
    const result = (got ? (got.archive
        ? said("screen.capture.address.archive", { filed: got.filed })
          + (got.notPromoted ? said("screen.capture.address.notpromoted", { count: got.notPromoted }) : "")
        : said(got.existed ? "screen.capture.address.existed" : "screen.capture.address.done", { title: got.title }) + made(got)) : "")
      + refusedPromotion("address");
    /* R47 (C20; DEC-381): "A source that asked for a login": each request a source turned away for a login, a username and a secret
       field (the secret is typed into a password field, sent once and never drawn back), the login given and the request tried
       again, a retry by itself, the stored logins and their withdrawal. No secret, length or digest is ever drawn. */
    const R = D.refused;
    const turned = R && R.state === "ok" && R.value && Array.isArray(R.value.requests) ? R.value.requests.filter((r) => r && r.source_reason === "login" && r.state === "refused") : [];
    const stored = (Array.isArray(U.logins) ? U.logins : []).filter((e) => e && !e.withdrawn_at);
    const who = (m) => { const id = String(m || "").replace(/^member:/, ""); const roster = D.members && D.members.state === "ok" && D.members.value && Array.isArray(D.members.value.members) ? D.members.value.members : [];
      const h = id ? ((roster.find((x) => x && x.member_id === id) || {}).handle || "") : ""; return h ? cs.ref("member", id, h, []) : ""; };
    const credNote = U.credDone
      ? (U.credDone.refused !== undefined ? `<p class="cs-state" data-state="failed" role="alert">${U.credDone.refused}</p>` : "") : "";
    const credSec = !turned.length && !stored.length && !cs.can("capturecredentiallist") ? "" : cs.sec("screen.capture.cred.head",
      (turned.length ? `<p class="mk-small">${cs.w("screen.capture.cred.why1")} ${cs.w("screen.capture.cred.why2")}</p>`
        + cs.sheet(turned.map((r) => cs.row(cs.icon("refused"), `<b>${cs.w("screen.capture.cred.turned", { source: { html: `<span class="mk-data">${cs.esc(r.host || "")}</span>` } })}</b>`,
          "", [who(r.principal_plane), r.requested_at ? cs.date(r.requested_at) : ""].filter(Boolean).join(" · "))).join(""))
        + cs.field("cc-user", "screen.capture.cred.user", { autocomplete: "off" })
        + cs.field("cc-secret", "screen.capture.cred.secret", { type: "password", autocomplete: "off", help: ["screen.capture.cred.sealed1", "screen.capture.cred.sealed2"] })
        + turned.map((r) => `<div class="mk-acts">${cs.act("capturecredentialsupply", { tone: "primary", data: { request: r.request, host: r.host } })}${cs.act("capturerequestretry", { label: "screen.capture.cred.retry", data: { request: r.request } })}</div>`).join("")
        + `<p class="mk-small muted">${cs.w("screen.capture.cred.only1")} ${cs.w("screen.capture.cred.only2")}</p>` : "")
      + credNote
      + stored.map((e) => cs.sheet(cs.row(cs.icon("accepted"), `${cs.w("screen.capture.cred.stored", { source: { html: `<span class="mk-data">${cs.esc(e.host || "")}</span>` } })}<span class="meta">${cs.w("screen.capture.cred.notshown")}</span>`,
          cs.act("capturecredentialwithdraw", { tone: "quiet", data: { credential: e.credential } }), [who(e.supplied_by), e.supplied_at ? cs.date(e.supplied_at) : ""].filter(Boolean).join(" · ")))).join("")
      + `<div class="mk-acts">${cs.act("capturecredentiallist")}</div>`
      + (Array.isArray(U.logins) ? `<p class="mk-small muted">${cs.w("screen.capture.cred.listnote1")} ${cs.w("screen.capture.cred.listnote2")}</p>` : ""),
      { help: ["screen.capture.cred.tip1", "screen.capture.cred.tip2"] });
    body = cs.field("ci-address", "screen.capture.address.label", { help: "screen.capture.address.help", value: U.address || "" })
      + forq
      + keep
      + (watch && cs.can("monitorset") ? `<p class="mk-small">${cs.w("screen.capture.address.watchabout")}</p>`
        + cs.choice("ci-freq", "screen.capture.address.freq", freqs.map((f) => [f, `screen.capture.address.freq.${f}`]), { value: U.frequency || "weekly" }) : "")
      + `<div class="mk-acts">${cs.act("acquire", { tone: "primary" })}${cs.act("capturerequest")}${watch ? `${cs.act("monitorset")}${cs.act("monitor")}` : ""}</div>`
      + working
      + result
      + unfinished
      + a64
      + credSec
      + (U.requested ? said(U.requested.drains === false ? "screen.capture.address.requested.waits" : "screen.capture.address.requested",
        { address: U.requested.address }) : "")
      + (U.watching ? said("screen.capture.address.watching", { title: U.watching.title, frequency: cs.w(`screen.capture.address.freq.${U.watching.frequency}`) }) : "")
      + (U.checked ? `<p class="mk-note" role="status">${view.parts.checkOutcome(cs, U.checked.answer, U.checked.title)}</p>` : "")
      + `<p class="mk-note">${cs.w("screen.capture.address.note")}</p>`;
  } else if (tab === "file") {
    const how = [["made", "screen.capture.file.how.made"], ["handed", "screen.capture.file.how.handed"],
                 ["sent", "screen.capture.file.how.sent"], ["downloaded", "screen.capture.file.how.downloaded"]];
    body = cs.field("ci-file", "screen.capture.file.choose", { type: "file", help: "screen.capture.file.choosehelp", capture: "environment",
        accept: "image/*,video/*,audio/*,application/pdf,text/*,.csv,.doc,.docx,.xls,.xlsx,.odt,.ods,.zip" })
      + `<p class="mk-small muted">${cs.w("photo.reminder")}</p>`
      + `<div class="cs-field"><fieldset class="mk-checks"><legend>${cs.w("screen.capture.file.how")}</legend>`
      + how.map(([k, w]) => `<label><input type="radio" id="ci-how-${k}" name="ci-how" value="${k}"> ${cs.w(w)}</label>`).join("")
      + "</fieldset></div>"
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
    + forqNote
    + `<nav class="mk-tabs2" role="tablist" aria-label="${cs.w("screen.capture.tabs")}">${tabs}</nav>`
    + `<div data-tab="${tab}">${body}</div>`;
}

/* R1: `acquire` with the address. Its five refusals each in its own sentence (`refusals`, by key beside the address, R25),
 * any other by shell R13; an empty address is `capture.fieldneeded` with the field's label (R25). R38: the press first asks
 * `heldat` (`check: true`, the member's deliberate act) and goes on to `acquire` only when the answer says the address is not
 * held, or when the member chose "Capture the new copy"; a copy already held is drawn and nothing is sent; a `heldat` refused,
 * unanswered or answering `held: null` is drawn failed beside the address and `acquire` is not sent. */
async function sendAcquire(view, el, cs) {
  /* R31: "Finish it" resumes the session (`continue`, acquisition R12): its primary is not fetched again */
  const session = el && el.dataset ? String(el.dataset.session || "") : "";
  if (session) {
    cs.set("address", String(el.dataset.locator || ""));
    cs.set("finishing", { session, title: String(el.dataset.title || "") });
    cs.set("a64", null);
    return { body: { continue: session } };
  }
  cs.set("finishing", null);
  const address = String(cs.value("ci-address") || "").trim();
  if (!address) return { refuse: "capture.fieldneeded", fills: { field: { html: cs.w("screen.capture.address.label") } } };
  cs.set("address", address);
  /* R29 (N1117; acquisition R47): opened from a question, the chosen question rides as `for`; the file tab and a capture
     with no subject send none, and no `capturerequest` is made for it */
  const chosen = view.parts.forOf(view).id;
  const question = /^INQ-/.test(chosen) ? String(cs.value("ci-for") || chosen).trim() : "";
  const body = question ? { locator: address, for: question } : { locator: address };
  /* R45: the page as a visitor saw it is asked for only when that is chosen; the site's own copy sends no `render` */
  const visitor = cs.value("ci-render-1") === true;
  if (visitor) body.render = true;
  cs.set("render", visitor);
  const begin = () => { cs.set("captured", null); cs.set("working", true); cs.later(90000, (k, v) => { if (v && v.ui && v.ui.working) k.set("working", false); }); };
  if (el && el.dataset && el.dataset.again === "1") { cs.set("a64", null); begin(); return { body }; }
  cs.set("a64", { looking: true });
  const asked = await cs.call("heldat", { query: { address, check: "true" } });
  const r = asked && asked.result && typeof asked.result === "object" ? asked.result : asked;
  if (!r || r.ok === false || typeof r.held !== "boolean") { cs.set("a64", { failed: r && r.ok === false ? view.parts.refusalHtml(cs, r) : "" }); return null; }
  if (r.held === false) { cs.set("a64", null); begin(); return { body }; }
  const state = r.changed && (r.changed.state === "unchanged" || r.changed.state === "changed") ? r.changed.state : "undetermined";
  cs.set("a64", { state, copy: r.copy && typeof r.copy === "object" ? r.copy : {} });
  return null;
}

/* R1 (N747; control-plane R58): an answer that carries `promoted` (an archive the door already promoted) is not
 * promoted again; any other new document is promoted here as an information bundle at `collected` (`promoteDocument`,
 * R23's files included), filed under the project the subject names (R22). A refusal of either step is drawn on the tab. */
async function doneAcquire(view, answer, cs) {
  const a = answer || {}, doc = a.document || {};
  const address = String((view.ui && view.ui.address) || "");
  /* R33: the document is titled from its own title (`reading.title`), see `titleOf` */
  const fin = view.ui && view.ui.finishing;
  const title = fin && fin.session && fin.title ? fin.title : view.parts.titleOf(cs, { reading: a.reading, doc, address });
  const sha = doc.capture && typeof doc.capture.sha256 === "string" ? doc.capture.sha256 : "";
  cs.set("working", false);
  cs.set("promoteRefused", null);
  /* R31: a continuation (`continued`) files nothing new: its supporting files join the capture it resumed */
  if (a.continued) { cs.set("captured", { title, address, bundleId: null, sha }); cs.set("finishing", null); return; }
  if (Array.isArray(a.promoted)) {
    cs.set("captured", { archive: true, filed: a.promoted.length, notPromoted: Array.isArray(a.not_promoted) ? a.not_promoted.length : 0, title, address,
                         bundleId: typeof a.bundleId === "string" ? a.bundleId : null });
    return;
  }
  /* R49 (L3; K4194): `existed: true` says the object store held the bytes, not that a document the viewer can see does. The
     record is asked (`heldat`, no `check`: nothing is fetched) for the document that holds the sha as this viewer sees it: one
     that shows is linked and nothing is written; none that shows is promoted for the viewer below, as a new capture is. */
  if (a.existed === true) {
    const held = sha ? await cs.call("heldat", { query: { sha256: sha } }) : null;
    const h = held && held.result && typeof held.result === "object" ? held.result : held;
    const doc0 = h && h.ok !== false && h.held === true && h.copy && typeof h.copy.document === "string" && h.copy.document ? h.copy.document : "";
    if (doc0) { cs.set("captured", { existed: true, title, address, bundleId: doc0, sha }); return; }
  }
  const filed = await view.parts.filedFor(view, cs);
  if (filed === null) { cs.set("promoteRefused", { tab: "address", html: "" }); return; }
  const made = await view.parts.promoteDocument(cs, { doc, title, locator: address, project: filed.id });
  if (made.refused !== undefined) { cs.set("promoteRefused", { tab: "address", html: view.parts.refusalHtml(cs, made.refused) }); return; }
  cs.set("captured", { title, address, bundleId: made.bundleId, filed, sha });
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

/* R22, R36: where the subject files a capture: the project and question the page read once (kept in page memory) when it
 * is read, else read now. Null when the question could not be read. */
async function filedFor(view, cs) {
  const id = view.parts.forOf(view).id, M = view.ui && view.ui.forq;
  if (M && M.id === id && M.state === "ok") return M.value;
  return view.parts.projectOf(cs, id);
}

/* R14, R16: the document the address was captured into: this visit's capture of it (the acquire's bundle), else the held or
 * vouched document whose source is that address (`heldcaptures`, `state: "held_and_vouched"`, R40). Null when none is known: watching asks a captured address. */
async function bundleFor(view, cs, address) {
  const got = view.ui && view.ui.captured;
  if (got && got.address === address && typeof got.bundleId === "string" && got.bundleId) return { bundleId: got.bundleId, title: got.title };
  const a = await cs.call("heldcaptures", { query: { limit: 1000, state: "held_and_vouched" } });
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
  cs.set("checked", { title: (view.ui && view.ui.target && view.ui.target.title) || "", answer: answer || {} });
}

/* R42 (C55; K4164: one owner): what a check found, drawn from the answer's `status` (`modified`, `removed`, `unchanged`) and, when
 * it names none, its `note` (`monitoring` R10): four different sentences, never "Checked just now" for every outcome. The one
 * drawing of it: `screens-inquiry` imports `checkOutcome` for the document page and draws nothing of its own. Answers the
 * sentence's HTML. */
function checkOutcome(cs, answer, title) {
  const a = answer && typeof answer === "object" ? answer : {};
  const st = a.status === "modified" || a.status === "removed" || a.status === "unchanged" ? a.status : "unknown";
  const t = String(title || "");
  return cs.w("screen.capture.address.checked." + st, st === "unknown" ? { title: t, note: typeof a.note === "string" ? a.note : "" } : { title: t });
}
export { checkOutcome };

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
  /* R27 (control-plane R100): the file's declared media type rides beside `statement` and `name`; an empty type sends none */
  const query = { statement, name: file.name };
  if (typeof file.type === "string" && file.type) query.type = file.type;
  /* R34: the file's name and declared type are kept as the act is sent; `doneUpload` uses them, never the input read afterwards */
  cs.set("sent", { name: file.name, type: typeof file.type === "string" ? file.type : "" });
  return { query, raw: file };
}
/* R21 (D9; capture R86, control-plane R72): an upload's answer is a provenance document; it is promoted as an information
 * bundle at `collected`, as R1 promotes `acquire`'s (`promoteDocument`), filed under the subject's project (R22). "It waits
 * in Held captures" is said only once that promotion answers; a refusal is drawn on the tab. An answer with `existed: true`
 * promotes nothing new. */
async function doneUpload(view, answer, cs) {
  const a = answer || {}, sent = (view.ui && view.ui.sent) || {};
  const name = typeof sent.name === "string" ? sent.name : "";
  cs.set("promoteRefused", null);
  cs.set("uploaded", null);
  if (a.existed === true) { cs.set("uploaded", { name, existed: true, bundleId: null }); return; }
  const doc = a.document && typeof a.document === "object" ? a.document : {};
  const filed = await view.parts.filedFor(view, cs);
  if (filed === null) { cs.set("promoteRefused", { tab: "file", html: "" }); return; }
  /* R33: an upload is titled by its file's name, or by the reading's title when the answer carries one and the file is a page */
  const isPage = /html/i.test(String(sent.type || "")) || /\.html?$/i.test(name);
  const read = isPage && a.reading && typeof a.reading.title === "string" ? a.reading.title.replace(/\s+/g, " ").trim().slice(0, 200) : "";
  const title = read || name || String(doc.locator || "");
  const made = await view.parts.promoteDocument(cs, { doc, title, locator: String(doc.locator || ""), project: filed.id });
  if (made.refused !== undefined) { cs.set("promoteRefused", { tab: "file", html: view.parts.refusalHtml(cs, made.refused) }); return; }
  cs.set("uploaded", { name, existed: false, bundleId: made.bundleId, title, filed, sha: doc.capture && typeof doc.capture.sha256 === "string" ? doc.capture.sha256 : "" });
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

/* R47 (C20; DEC-381): "Give a login for this source and try again". The login is a username and a secret typed here, sent once as
 * `secret` ("user:secret", the form `capture-sources` R56 hands to Basic) for the refused request's host, at the team's scope; the
 * secret is read from its field and held nowhere else, never put in the page's state. Its refusals are drawn by the design's words. */
function sendCredentialSupply(view, el, cs) {
  const user = String(cs.value("cc-user") || "").trim(), secret = String(cs.value("cc-secret") || "");
  const host = el && el.dataset ? String(el.dataset.host || "") : "";
  const request = el && el.dataset ? String(el.dataset.request || "") : "";
  if (!user) return { refuse: "capture.fieldneeded", fills: { field: { html: cs.w("screen.capture.cred.user") } } };
  if (!secret) return { refuse: "capture.fieldneeded", fills: { field: { html: cs.w("screen.capture.cred.secret") } } };
  cs.set("credDone", null);
  cs.set("credFor", { request, host });
  return { body: { kind: "login", host, secret: `${user}:${secret}`, scope: "group" } };
}
/* the login stored, the turned-away request goes back in the queue (`capturerequestretry`); a request its source did not turn
   away is refused in words and the login stays stored */
async function doneCredentialSupply(view, answer, cs) {
  const f = (view.ui && view.ui.credFor) || {};
  cs.set("credFor", null);
  const a = f.request ? await cs.call("capturerequestretry", { body: { request: f.request } }) : null;
  const r = a && a.result && typeof a.result === "object" ? a.result : a;
  if (r && r.ok === false) { cs.set("credDone", { refused: view.parts.refusalHtml(cs, r) }); return; }
  cs.set("credDone", { retried: f.request });
  const l = await cs.call("capturecredentiallist", { body: {} });
  const v = l && l.result && typeof l.result === "object" ? l.result : l;
  if (v && Array.isArray(v.entries)) cs.set("logins", v.entries);
}
function sendCredentialRetry(view, el, cs) {
  cs.set("credDone", null);
  return { body: { request: el && el.dataset ? String(el.dataset.request || "") : "" } };
}
function doneCredentialRetry(view, answer, cs) { cs.set("credDone", { retried: true }); }
function sendCredentialList() { return { body: {} }; }
function doneCredentialList(view, answer, cs) {
  const a = answer || {};
  cs.set("logins", Array.isArray(a.entries) ? a.entries : []);
}
function sendCredentialWithdraw(view, el, cs) {
  return { body: { credential: el && el.dataset ? String(el.dataset.credential || "") : "" } };
}
async function doneCredentialWithdraw(view, answer, cs) {
  const l = await cs.call("capturecredentiallist", { body: {} });
  const v = l && l.result && typeof l.result === "object" ? l.result : l;
  cs.set("logins", v && Array.isArray(v.entries) ? v.entries : []);
}
/* R47: the refusals of the three, by the design's words: a machine, the team's own Civicsmith, a request its source did not turn away */
const CRED_REFUSALS = Object.freeze({
  CAPTURE_CREDENTIAL_NOT_A_MEMBER: function (refusal, cs) { return cs.w("screen.capture.cred.ref.machine1") + " " + cs.w("screen.capture.cred.ref.machine2"); },
  CAPTURE_CREDENTIAL_OWN_HOST: function (refusal, cs) { return cs.w("screen.capture.cred.ref.own1") + " " + cs.w("screen.capture.cred.ref.own2"); },
});

export const CAPTURE_SCREEN = Object.freeze({
  id: "capture",
  reads: captureReads,
  render: renderCapture,
  parts: Object.freeze({ bundleFor, checkOutcome, filedFor, forOf, projectOf, promoteDocument, refusalHtml, titleOf }),
  acts: Object.freeze([
    Object.freeze({ op: "acquire", label: "act.acquire.label.capture", send: sendAcquire, done: doneAcquire,
                    refusals: Object.freeze({ BAD_LOCATOR: "refusal.BAD_LOCATOR", SOURCE_REFUSED: "refusal.SOURCE_REFUSED",
                                              /* R29: `BAD_FOR` (not a question of the project's) beside the field, in the fold the design draws it in, open
                                                 whenever drawn, titled `capture.forquestion.refused.summary`; nothing was captured */
                                              BAD_FOR: function (refusal, cs) { return `<details class="mk-details" open><summary>${cs.w("capture.forquestion.refused.summary")}</summary>${cs.w("refusal.BAD_FOR")}</details>`; },
                                              FETCH_FAILED: "refusal.FETCH_FAILED", EMPTY: "refusal.EMPTY", TOO_LARGE: "refusal.TOO_LARGE" }) }),
    Object.freeze({ op: "capturerequest", label: "act.capturerequest.label.capture", send: sendCaptureRequest, done: doneCaptureRequest }),
    Object.freeze({ op: "monitorset", label: "act.monitorset.label.capture", send: sendMonitorSet, done: doneMonitorSet }),
    Object.freeze({ op: "monitor", label: "act.monitor.label.capture", send: sendMonitor, done: doneMonitor }),
    Object.freeze({ op: "captureupload", label: "act.captureupload.label.capture", send: sendUpload, done: doneUpload, reasonField: "statement",
                    refusals: Object.freeze({ UPLOAD_NO_STATEMENT: "screen.capture.refusal.UPLOAD_NO_STATEMENT", EMPTY: "screen.capture.refusal.upload.EMPTY",
                                              TOO_LARGE: "screen.capture.refusal.upload.TOO_LARGE",
                                              MEMBER_SESSION_REQUIRED: "screen.capture.refusal.MEMBER_SESSION_REQUIRED" }) }),
    Object.freeze({ op: "capturecredentialsupply", label: "act.owed_capturecredentialsupply.label.capture", send: sendCredentialSupply, done: doneCredentialSupply, refusals: CRED_REFUSALS }),
    Object.freeze({ op: "capturerequestretry", label: "act.capturerequestretry.label.capture", send: sendCredentialRetry, done: doneCredentialRetry,
                    refusals: Object.freeze({ CAPTURE_REQUEST_NOT_RETRYABLE: function (refusal, cs) { return cs.w("screen.capture.cred.ref.notretry"); } }) }),
    Object.freeze({ op: "capturecredentiallist", label: "act.owed_capturecredentiallist.label.capture", send: sendCredentialList, done: doneCredentialList }),
    Object.freeze({ op: "capturecredentialwithdraw", label: "act.owed_capturecredentialwithdraw.label.capture", send: sendCredentialWithdraw, done: doneCredentialWithdraw }),
    Object.freeze({ op: "testify", label: "act.testify.label.capture", send: sendTestify, done: doneTestify, reasonField: "words" }),
    Object.freeze({ op: "writinghelp", label: "act.writinghelp.label.capture", send: sendWritingHelp, done: doneWritingHelp, reasonField: "told" }),
  ]),
});
