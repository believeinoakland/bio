/* stewards: the pages and their words (R1, R5, R7, R18–R20, R22, R23). Nothing is loaded from another origin; every
   text a reporter or steward supplied is escaped where it is shown. */
import { KINDS, CAPS } from "./config.mjs";

export const PUBLISHER = "Believe in Oakland";
export const STEWARDS = "Civicsmith's stewards";
export const RESPONSIBLE = `${STEWARDS} decide every report. ${PUBLISHER}, the publisher of Civicsmith, is responsible for them.`;

/* The shared guide words (R7): byte for byte `stewards/guide.md`, which installer R48's README follows. */
export const GUIDE_TEXT = `What a group holds, and who could compel it

Your group's Civicsmith keeps its record and its evidence in your group's own hosting account (its Cloudflare account), and nowhere else. Civicsmith's stewards hold none of it, and your group's Civicsmith sends them nothing.

Whoever can sign in to that hosting account controls your group's Civicsmith. They can replace the one-time password, claim it again, read everything in it and lock everyone else out, and no vote of the group's administrators can stop them. Use a group account for it, not anyone's personal login, and add at least one other trusted person to it.

Only two can be asked or compelled to hand over what your group's Civicsmith holds: your group itself, and its hosting provider, under the law that binds that provider. Civicsmith's stewards cannot be, because they hold none of it.

This guide is not legal advice. If you need to know what the law could require of your group, ask a lawyer.
`;

/* R7's second part: what this service holds and who could be asked for it. */
export const SERVICE_HOLDS = [
  "What this reporting service holds",
  "This service, which Civicsmith's stewards run apart from every group's Civicsmith, holds the reports sent to it, the stewards' decisions on them, and the register of withdrawn shared services.",
  "Civicsmith's stewards could be asked or compelled to hand those over, and so could this service's hosting provider, under the law that binds it. What is kept, and for how long, is said on the reporting page.",
  "This is not legal advice.",
];

export const KIND_WORDS = Object.freeze({
  fabricated_evidence: "Fabricated evidence",
  harassment: "Harassment",
  impersonation: "Impersonation",
  other: "Other abuse of Civicsmith",
});
export const SERVICE_WORDS = Object.freeze({
  shared_profile: "A shared profile contribution",
  template_library: "An item of the template library",
  public_listing: "A public listing",
});

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export const when = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");

const CSS = `body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;max-width:44rem;margin:0 auto;padding:1rem;line-height:1.5;color:#1b1b1b;background:#fff}
@media (prefers-color-scheme:dark){body{color:#e8e8e8;background:#161616}input,textarea,select{color:#e8e8e8;background:#222}}
h1{font-size:1.4rem}h2{font-size:1.15rem}label{display:block;margin-top:.8rem;font-weight:600}
input,textarea,select{width:100%;box-sizing:border-box;font:inherit;padding:.4rem}textarea{min-height:10rem}
button{margin-top:1rem;font:inherit;padding:.5rem 1rem}.notice{border-left:4px solid #888;padding-left:.8rem}
table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #8884;padding:.3rem;text-align:left;vertical-align:top}
.small{font-size:.9rem}footer{margin-top:2rem;font-size:.9rem}`;

export function page(title, body, { steward = false } = {}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">`
    + `<title>${esc(title)} · Civicsmith</title><style>${CSS}</style></head><body>`
    + `<header><p class="small">Civicsmith · ${steward ? "for Civicsmith's stewards" : "reporting abuse to Civicsmith's stewards"}</p></header>`
    + `<main>${body}</main><footer><p>${esc(RESPONSIBLE)}</p>`
    + (steward ? "" : `<p><a href="/">Report abuse</a> · <a href="/guide">What a group holds, and who could compel it</a> · <a href="/withdrawals">Withdrawn shared services</a></p>`)
    + `</footer></body></html>`;
}

export const html = (body, status = 200, headers = {}) =>
  new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-frame-options": "DENY",
    "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'", ...headers } });

/* R1: while not yet open. */
export const notYetOpenPage = () => page("Not yet open", `<h1>Reporting to Civicsmith's stewards is not yet open</h1>`
  + `<p>The service that receives reports of abuse of Civicsmith itself is not yet open, so it cannot take a report now.</p>`
  + `<p><a href="/guide">What a group holds, and who could compel it</a></p>`);

/* R5: the notice, then the form. */
export function reportPage(cfg) {
  const kinds = KINDS.map((k) => `<option value="${k}">${esc(KIND_WORDS[k])}</option>`).join("");
  return page("Report abuse of Civicsmith", `<h1>Report abuse of Civicsmith</h1>
<section class="notice" id="notice">
<p>Use this form to report abuse of Civicsmith itself: fabricated evidence, harassment or impersonation, or other abuse, by or about a group's public identity or a published case.</p>
<p>${esc(STEWARDS)} read every report. They may only withdraw a shared service (a shared profile contribution, an item of the template library, a public listing). They never edit or delete a group's record, and they have no way into any group's Civicsmith.</p>
<p>You do not need an account. The contact field is optional and is used only to reply to you; without it the stewards cannot reply.</p>
<p>What is kept: your report and, if you give one, your contact. Only ${esc(STEWARDS)} read them. Your contact is erased ${cfg.contactDays} days after the stewards' latest decision on your report, and the report itself is deleted ${cfg.reportDays} days after it. A report not yet decided is kept until it is decided.</p>
<p>You can also send a report by e-mail to <a href="mailto:${esc(cfg.address)}">${esc(cfg.address)}</a>.</p>
<p>This service gives no legal advice.</p>
<p>${esc(RESPONSIBLE)}</p>
</section>
<form method="post" action="/report">
<label for="kind">What kind of abuse</label><select id="kind" name="kind" required>${kinds}</select>
<label for="concerns">Which group or published case it concerns</label>
<input id="concerns" name="concerns" required maxlength="${CAPS.concerns}" placeholder="a group's short name, or an https:// address">
<label for="description">What happened</label>
<textarea id="description" name="description" required maxlength="${CAPS.description}"></textarea>
<label for="contact">How to reply to you (optional)</label>
<input id="contact" name="contact" maxlength="${CAPS.contact}">
<button type="submit">Send the report</button>
</form>`);
}

export const receivedPage = (ref, hasContact) => page("Report received", `<h1>Your report has been received</h1>
<p>Its reference is <strong id="ref">${esc(ref)}</strong>.</p>
<p>${hasContact ? "A steward replies only by the contact you gave, if a reply is needed." : "You gave no contact, so the stewards cannot reply to you."}</p>
<p><a href="/">Back</a></p>`);

export const refusedPage = (status, code, words, { steward = false } = {}) =>
  page("Not accepted", `<h1>Not accepted</h1><p>${esc(words)}</p><p class="small">${esc(code)}</p>`, { steward });

/* R7. */
export function guidePage(open) {
  const [head, ...paras] = GUIDE_TEXT.trimEnd().split("\n\n");
  const [h2, ...more] = SERVICE_HOLDS;
  return page("What a group holds", `<section id="guide"><h1>${esc(head)}</h1>${paras.map((p) => `<p>${esc(p)}</p>`).join("")}</section>`
    + `<section id="service"><h2>${esc(h2)}</h2>${more.map((p) => `<p>${esc(p)}</p>`).join("")}</section>`
    + (open ? `<p>To report abuse of Civicsmith itself, use <a href="/">the reporting page</a>.</p>` : ""));
}

/* R22. */
export const publicRegisterPage = (rows) => page("Withdrawn shared services", `<h1>Shared services withdrawn by Civicsmith's stewards</h1>
<p>Each line is a shared service the stewards have withdrawn and not reinstated, with the kind of abuse reported. No group's record is ever changed by a withdrawal.</p>`
  + (rows.length ? `<table><thead><tr><th>Shared service</th><th>Item</th><th>Since</th><th>Kind of abuse</th></tr></thead><tbody>`
    + rows.map((r) => `<tr><td>${esc(SERVICE_WORDS[r.service] || r.service)}</td><td>${esc(r.item)}</td><td>${esc(when(r.since))}</td><td>${esc(KIND_WORDS[r.kind] || r.kind)}</td></tr>`).join("")
    + `</tbody></table>` : `<p>None stands.</p>`));

/* The stewards' pages (R8, R11–R13). */
export const signinPage = () => page("Stewards' sign-in", `<h1>Sign in, Civicsmith's stewards</h1>
<form method="post" action="/steward/signin"><label for="name">Name</label><input id="name" name="name" required autocomplete="username">
<label for="key">Key</label><input id="key" name="key" type="password" required autocomplete="current-password">
<button type="submit">Sign in</button></form>`, { steward: true });

export const stewardHome = (name) => page("Stewards", `<h1>Civicsmith's stewards</h1><p>Signed in as ${esc(name)}.</p>
<p><a href="/steward/reports">Reports</a> · <a href="/steward/withdrawals">The register (JSON)</a></p>
<form method="post" action="/steward/signout"><button type="submit">Sign out</button></form>`, { steward: true });

export const reportsPage = (reports, n, more) => page("Reports", `<h1>Reports</h1><table><thead><tr><th>Reference</th><th>Kind</th><th>Concerns</th><th>Received</th><th>State</th></tr></thead><tbody>`
  + reports.map((r) => `<tr><td><a href="/steward/report/${esc(r.ref)}">${esc(r.ref)}</a></td><td>${esc(KIND_WORDS[r.kind])}</td><td>${esc(r.concerns)}</td><td>${esc(when(r.received))}</td><td>${esc(r.state)}</td></tr>`).join("")
  + `</tbody></table><p>${n > 1 ? `<a href="${n === 2 ? "/steward/reports" : `/steward/reports/${n - 1}`}">Newer</a> ` : ""}${more ? `<a href="/steward/reports/${n + 1}">Older</a>` : ""}</p><p><a href="/steward">Home</a></p>`, { steward: true });

export function reportDetailPage({ report: r, decisions, standing }) {
  const services = Object.entries(SERVICE_WORDS).map(([k, w]) => `<option value="${k}">${esc(w)}</option>`).join("");
  return page(`Report ${r.ref}`, `<h1>Report ${esc(r.ref)}</h1>
<p>${esc(KIND_WORDS[r.kind])} · received ${esc(when(r.received))} · ${esc(r.state)}</p>
<p><strong>Concerns:</strong> ${esc(r.concerns)}</p><p><strong>Contact:</strong> ${r.contact == null ? "none kept" : esc(r.contact)}</p>
<h2>Description</h2><pre style="white-space:pre-wrap">${esc(r.description)}</pre>
<h2>Decisions</h2>${decisions.length ? `<ul>${decisions.map((d) => `<li>${esc(when(d.at))} · ${esc(d.steward)} · ${esc(d.decision)}${d.service ? ` · ${esc(d.service)} ${esc(d.item)}${d.already ? " (already withdrawn)" : ""}` : ""}: ${esc(d.reason)}</li>`).join("")}</ul>` : "<p>None yet.</p>"}
<h2>Decide</h2><form method="post" action="/steward/decide"><input type="hidden" name="ref" value="${esc(r.ref)}">
<label for="decision">Decision</label><select id="decision" name="decision"><option value="dismiss">Dismiss</option><option value="withdraw">Withdraw a shared service</option></select>
<label for="service">Shared service (to withdraw)</label><select id="service" name="withdraw_service"><option value=""></option>${services}</select>
<label for="item">Item (to withdraw)</label><input id="item" name="withdraw_item" maxlength="${CAPS.item}">
<label for="reason">Reason</label><textarea id="reason" name="reason" required maxlength="${CAPS.reason}"></textarea><button type="submit">Record the decision</button></form>`
  + standing.map((w) => `<h2>Reinstate ${esc(w.service)} ${esc(w.item)}</h2><form method="post" action="/steward/reinstate"><input type="hidden" name="service" value="${esc(w.service)}"><input type="hidden" name="item" value="${esc(w.item)}"><label>Reason</label><textarea name="reason" required maxlength="${CAPS.reason}"></textarea><button type="submit">Reinstate</button></form>`).join("")
  + `<p><a href="/steward/reports">Reports</a></p>`, { steward: true });
}

/* R14: the notice to the stewards' address. No description, concerns, contact, key or session. */
export function notifyText({ ref, kind, received, stewardsPage }) {
  return `A report has arrived at Civicsmith's stewards' reporting service.\r\n\r\nReference: ${ref}\r\nKind: ${KIND_WORDS[kind]}\r\nReceived: ${when(received)}\r\n\r\nRead it, signed in, at ${stewardsPage}\r\n`;
}
