/* The `inbox` screen (Queue › Inbox; R7): the knocks at `/app/inbox`, one knock at `/app/inbox/<knock id>`, whose acts
 * are drawn with it. Self-contained functions over the kit `cs` (see `index.mjs`). */

/* R7: `inbox` (doorbell's list) always; `inboxget` for the knock the address names. */
function inboxReads(view) {
  const id = typeof view.subject === "string" && view.subject ? view.subject : null;
  return { list: { op: "inbox", query: { limit: 200 }, empty: (v) => !v || !Array.isArray(v.inbox) || !v.inbox.length },
           ...(id ? { knock: { op: "inboxget", query: { id } } } : {}) };
}

function renderInbox(cs, view) {
  const L = view.ui || {}, D = view.data || {};
  const id = typeof view.subject === "string" && view.subject ? view.subject : null;
  const said = (k, f) => `<p class="mk-note" role="status">${cs.w(k, f)}</p>`;
  const size = (n) => !Number.isFinite(n) ? "" : n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`;
  const all = D.list && D.list.state === "ok" && Array.isArray(D.list.value.inbox) ? D.list.value.inbox : [];
  const same = (k) => k.pseudonym ? all.filter((x) => x.knock_id !== k.knock_id && x.pseudonym === k.pseudonym).length : 0;
  const rungs = ["unknown", "same", "partly", "group", "public"];
  const rungOf = (k) => {
    const named = { unknown: 0, same_knocker: 1, partly_known: 2, known_to_group: 3, publicly_known: 4 }[k.rung];
    return Number.isFinite(named) ? named : k.knocker_digest || k.pseudonym ? 1 : 0;
  };
  const ladder = (k) => `<div class="cs-ladder" data-ladder="ident" role="list" aria-label="${cs.w("screen.inbox.ladder")}">`
    + rungs.map((r, i) => `<span role="listitem" class="${i <= rungOf(k) ? "on" : ""}"${i === rungOf(k) ? ' aria-current="step"' : ""}>${cs.w(`screen.inbox.ladder.${r}`)}</span>`).join("")
    + `</div><p class="mk-small muted">${cs.w("screen.inbox.ladder.basis")}</p>`;
  const facts = (k) => `<span class="meta">${cs.w("screen.inbox.knock", { size: size(k.bytes) })} ${k.received ? cs.date(k.received) : ""}`
    + ` · <span class="id">${cs.esc(k.knock_id)}</span> · ${cs.w(`screen.inbox.status.${["new", "pulled", "discarded"].includes(k.status) ? k.status : "new"}`)}</span>`
    + `<span>${k.note ? cs.w("screen.inbox.note", { note: k.note }) : cs.w("screen.inbox.nonote")}</span>`
    + (same(k) ? `<span class="meta">${cs.w("screen.inbox.same", { count: same(k) })}</span>` : "")
    + (k.status === "discarded" && k.resolve_reason ? `<span class="meta">${cs.w("screen.inbox.resolved", { reason: k.resolve_reason })}</span>` : "");
  const list = cs.state(D.list, (v) => `<div class="cs-sheet" role="list">${v.inbox.map((k) => `<div class="cs-row" role="listitem"${k.knock_id === id ? ' aria-current="true"' : ""}>`
      + `<span>${cs.ref("inbox", k.knock_id, cs.w("screen.inbox.open", { id: k.knock_id }), [])}${facts(k)}</span></div>`).join("")}</div>`,
    { empty: "screen.inbox.empty" });
  const one = !id ? "" : cs.state(D.knock, (v) => {
    const k = v.item || {};
    return `<section class="cs-section mk-sec"><h2><span class="id">${cs.esc(k.knock_id || id)}</span></h2>${facts(k)}${ladder({ ...k, rung: v.rung || k.rung })}`
      + (k.status === "new" ? `<div class="mk-acts">${cs.act("inboxpull", { tone: "primary" })}</div>`
        + `<div class="mk-acts">${cs.act("inboxresolve")}</div>` : "")
      + `<div class="cs-reason">${cs.field("cx-source", "screen.inbox.source", { value: L.source ?? (k.source_id || k.source || "") })}`
      + `${cs.field("cx-to", "screen.inbox.link.to", { help: "screen.inbox.link.tohelp", value: L.to || "" })}`
      + `${cs.field("cx-evidence", "screen.inbox.link.evidence", { area: true, rec: true, value: L.evidence || "" })}`
      + `${cs.act("sourcelink")}</div></section>`;
  });
  return `<div class="mk-h"><h1 class="t-title">${cs.w("screen.inbox.heading")}</h1><p class="mk-sub">${cs.w("screen.inbox.sub")}</p></div>`
    + one
    + (L.pulled ? said(L.pulled === "existed" ? "screen.inbox.existed" : "screen.inbox.pulled") : "")
    + (L.discarded ? said("screen.inbox.discarded") : "")
    + (L.linked ? said("screen.inbox.link.done") : "")
    + list;
}

/* R7: "Move into the record" (`inboxpull`): the pull and its promotion are one act at the door (store-door R7). */
function sendPull(view) {
  return { body: { knockId: view.subject } };
}
function donePull(view, answer, cs) {
  cs.set("pulled", answer && answer.existed === true ? "existed" : "pulled");
  cs.set("discarded", false);
}

/* R7: "Discard with a reason" (`inboxresolve` to `discarded`): a reasoned act, so the shell asks the reason first and
 * sends it as `reason` (setup-page R11's rule); `RESOLVE_NO_REASON` drawn by its words, the knock left as it was. */
function sendDiscard(view) {
  return { body: { knockId: view.subject, status: "discarded" } };
}
function doneDiscard(view, answer, cs) {
  cs.set("discarded", true);
  cs.set("pulled", false);
}

/* R7: "Record what is known of the source" (`sourcelink`, sources R6): this knock's source, the other source it is the
 * same person as, and what shows it. */
function sendSourceLink(view, el, cs) {
  const source = String(cs.value("cx-source") || "").trim(), to = String(cs.value("cx-to") || "").trim();
  const evidence = String(cs.value("cx-evidence") || "").trim();
  if (!source) return { refuse: "screen.inbox.link.nosource" };
  const missing = [!to && "screen.inbox.link.to", !evidence && "screen.inbox.link.evidence"].filter(Boolean);
  if (missing.length) return { refuse: "screen.inbox.link.missing", fills: { fields: missing.map((k) => cs.w(k)).join(", ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") } };
  return { body: { source, to, evidence } };
}
function doneSourceLink(view, answer, cs) {
  cs.set("linked", true);
}

export const INBOX_SCREEN = Object.freeze({
  id: "inbox",
  reads: inboxReads,
  render: renderInbox,
  acts: Object.freeze([
    Object.freeze({ op: "inboxpull", label: "act.inboxpull.label.inbox", send: sendPull, done: donePull }),
    Object.freeze({ op: "inboxresolve", label: "act.inboxresolve.label.inbox", send: sendDiscard, done: doneDiscard,
                    refusals: Object.freeze({ RESOLVE_NO_REASON: "screen.inbox.refusal.RESOLVE_NO_REASON" }) }),
    Object.freeze({ op: "sourcelink", label: "act.sourcelink.label.inbox", send: sendSourceLink, done: doneSourceLink }),
  ]),
});
