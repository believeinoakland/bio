/* R100: the records request round trip, by the door's own ops (the request, start-send and action screens' acts). */
import { check } from "./lib-04b.mjs";
import { CAPTURE_SCREEN } from "../../../../bio-plane/src/screens-intake/capture.mjs";
import { J } from "./s-r39.mjs";

const R = (a) => (a && a.result !== undefined ? a.result : a);
const LAW = "Cal. Gov. Code § 7920.000 et seq.";

export async function r100(kit, ctx) {
  await kit.profileSet(["oakland-alameda"]);
  const { auth } = await kit.ownerOf("requester");
  const second = await kit.person("approvertwo");
  const invitee = await kit.ownerOf("invitedmember");
  const adm = await kit.founder();
  const cs = kit.screenCall(auth);
  const project = await kit.projectOf(auth, "Contract records");
  const doc = (ent, project2 = project, kind = "records_request", title = "Stamped contracts, October", cp = null) => ["---", "id: PENDING", "object_type: action", `title: ${JSON.stringify(title)}`, "current_state: planned",
    'created: "2026-10-25T10:00:00Z"', 'last_updated: "2026-10-25T10:00:00Z"', "project: " + project2, `action_kind: "${kind}"`, "counterparty:",
    ...(cp || ['  state: "named"', '  kind: "office"', '  role: "City Clerk"', '  body: "City of Oakland"', `  entity_id: "${ent}"`]), "clock: []", "action_basis: []", "correspondence: []", "---", "", "## Action", "", title, ""].join("\n");
  let office, action, filing;

  await check("R100", "first look in the finder whether the record is already public (browse the held record for the words)", "as the member", "op=browse and op=searchfields", async () => {
    const f = R(await kit.get(auth, { op: "searchfields" }));
    const b = R(await kit.get(auth, { op: "browse", q: "stamped contracts", text: "stamped contracts" }));
    return `searchfields ${J(f, 200)}; browse ${J(b, 300)}`;
  });
  await check("R100", "'How a records request works' (help-records): the place facts (state law, the city's faster request, the portal) come from the places set", "as the member", "op=profiles; read the records law lines and the response deadline", async () => {
    const p = R(await kit.get(auth, { op: "profiles" }));
    const laws = (p.view && p.view.laws) || p.laws || null;
    const dl = p.view && p.view.deadlines && p.view.deadlines.find((d) => d.rule === "records_response");
    return `profile ${p.profiles[0].id} covers ${p.profiles[0].covers.join(" and ")}; records_response deadline ${dl ? dl.amount + " " + dl.count + " days from " + dl.starts + ", extension " + (dl.extension && dl.extension.days) + " days (" + dl.extension.citation + ")" : "ABSENT"}; laws listed: ${J(laws, 260)}; changing the place and re-reading the page is the area-1 sitting's act (profilesset is the same op used here)`;
  });

  await check("R100", "name the office yourself: agency and office are two fields; the law must be one the team's places name; naming it again answers the first", "as the member", "entitycreate kind office with a law; with an unnamed law; again", async () => {
    const ok = R((await kit.post(auth, "entitycreate", { kind: "office", label: "City of Oakland, City Clerk", note: "The clerk keeps the stamped contracts.", law: LAW, contact: { kind: "portal", value: "https://oaklandca.nextrequest.com" } })).body);
    const bad = R((await kit.post(auth, "entitycreate", { kind: "office", label: "Oakland Parks Dept", note: "Parks.", law: "Imaginary Law § 1" })).body);
    const again = R((await kit.post(auth, "entitycreate", { kind: "office", label: "City of Oakland, City Clerk", note: "Again.", law: LAW })).body);
    office = ok.entity_id;
    return [ok.ok && bad.reason === "UNKNOWN_LAW" ? "WORKS" : "BROKEN", `first ${J(ok, 200)}; a law no place names -> ${bad.reason} (lists ${J(bad.laws)}); the same office again -> ${J(again, 200)}`];
  });
  await check("R100", "an office a member named is marked and an administrator confirms it (officeconfirm); a member's own confirm is refused", "as the member and the administrator", "entitieskind; officeconfirm by member and by administrator", async () => {
    const before = R(await kit.get(auth, { op: "entitieskind", kind: "office", limit: "500" })).entities.find((e) => e.entity_id === office);
    const m = R((await kit.post(auth, "officeconfirm", { entityId: office })).body);
    const a = R((await kit.post(adm, "officeconfirm", { entityId: office })).body);
    const again = R((await kit.post(adm, "officeconfirm", { entityId: office })).body);
    const after = R(await kit.get(auth, { op: "entitieskind", kind: "office", limit: "500" })).entities.find((e) => e.entity_id === office);
    return [a.ok && (m.ok === false) ? "WORKS" : "BROKEN", `before: named_by_member ${before && before.named_by_member}; member confirm -> ${m.ok === false ? m.reason : "accepted"}; administrator confirm ${J(a, 140)}; repeat already ${again.already}; after named_by_member ${after && after.named_by_member}`];
  });
  await check("R100", "'Choose the office': offices the record holds for a name, by role and who holds it today; an addressee is a role, never a private individual", "as the member", "addresseesuggest by the office's id; actioncreate with a private person as the counterparty", async () => {
    const sug = R(await kit.get(auth, { op: "addresseesuggest", subject: office }));
    const priv = R((await kit.post(auth, "actioncreate", { document: doc(null, project, "records_request", "To a private person", ['  state: "named"', '  kind: "person"', '  role: "Neighbour"', '  body: "Jane Roe"']) })).body);
    return `suggest for ${office}: ${J(sug, 420)}; a private person as the addressee -> ${priv.ok ? "ACCEPTED " + priv.id : priv.reason + ' "' + String(priv.translation).slice(0, 130) + '"'}`;
  });

  await check("R100", "start the request: one action addressed to the chosen office; its place, its law (no default level; an empty list reads undetermined)", "as the member", "actioncreate; action (governing laws before and after); actionlaws", async () => {
    const c = R((await kit.post(auth, "actioncreate", { document: doc(office) })).body);
    action = c.id;
    const before = R(await kit.get(auth, { op: "action", id: action }));
    const set = R((await kit.post(auth, "actionlaws", { target: action, laws: [{ level: "state", citation: LAW }] })).body);
    const noLevel = R((await kit.post(auth, "actionlaws", { target: action, laws: [{ citation: LAW }] })).body);
    const after = R(await kit.get(auth, { op: "action", id: action }));
    const prop = await kit.post(auth, "actionlawspropose", { target: action });
    return [c.ok && set.ok ? "WORKS" : "BROKEN", `created ${c.id}; governing laws before ${J(before.governing_laws, 200)}; set ${J({ by: set.by, laws: set.laws }, 200)}; a law with no level -> ${noLevel.ok ? "accepted as " + J(noLevel.laws) : noLevel.reason}; after ${J(after.governing_laws, 200)}; actionlawspropose -> ${J(R(prop.body), 260)}`];
  });

  await check("R100", "the request's text: a blank '[UNFILLED: name]' blocks approval; a fill the text has no blank for is refused; the text is a draft nobody sent", "as the member", "communicationprepare with an unfilled blank, then filingapprove; with a fill for a missing blank", async () => {
    const withBlank = R((await kit.post(auth, "communicationprepare", { action, purpose: "request", text: "Under the California Public Records Act, please provide [UNFILLED: name the records]. Release the rest and refuse in writing naming who decided." })).body);
    const ap = R((await kit.post(auth, "filingapprove", { filing: withBlank.id })).body);
    const unknown = R((await kit.post(auth, "communicationprepare", { action, purpose: "request", text: "Please provide the stamped contracts.", fills: { period: "October" } })).body);
    return [withBlank.ok && ap.ok === false ? "WORKS" : "BROKEN", `draft ${withBlank.id}, label "${withBlank.label && withBlank.label.says && withBlank.label.says.slice(0, 80)}"; approving it with the blank -> ${ap.ok === false ? ap.reason + ' "' + String(ap.translation).slice(0, 120) + '"' : "APPROVED"}; a fill for a blank the text lacks -> ${unknown.ok === false ? unknown.reason : "accepted"}`];
  });

  await check("R100", "approve this text: terminal; fixes the bytes and adds the in-band stamp; the instance sends nothing", "as the member", "communicationprepare, filingapprove; read the bytes; approve again; edit after approval", async () => {
    const prep = R((await kit.post(auth, "communicationprepare", { action, purpose: "request", text: "Under the California Public Records Act, please provide the stamped contracts of October. Release the rest and refuse in writing naming who decided." })).body);
    filing = prep.id;
    const ap = R((await kit.post(auth, "filingapprove", { filing })).body);
    const again = R((await kit.post(auth, "filingapprove", { filing })).body);
    const edited = R((await kit.post(auth, "filingapprove", { filing, text: "A different text." })).body);
    const stamped = /---- in-band ----/.test(ap.bytes || "");
    return [ap.ok && stamped ? "WORKS" : "BROKEN", `approved by ${ap.approved_by}, sha ${String(ap.sha).slice(0, 12)}, in-band stamp present ${stamped}; approving again -> ${again.ok ? "ok (existed " + again.existed + ")" : again.reason}; an edit after approval -> ${edited.ok ? "accepted?!" : edited.reason}; no op sends anything: the answer is the bytes the member sends herself`];
  });

  await check("R100", "record that it was sent by the venue's own means (day, how, the portal's reference); refusals ALREADY_SENT and NOT_APPROVED; reference format", "as the member", "filingrecordsent on an unapproved draft; bad reference; correct; again", async () => {
    const fresh = R((await kit.post(auth, "communicationprepare", { action, purpose: "request", text: "A draft nobody approved." })).body);
    const na = R((await kit.post(auth, "filingrecordsent", { filing: fresh.id, at: "2026-10-25", account: "the city's portal" })).body);
    const badRef = R((await kit.post(auth, "filingrecordsent", { filing, at: "2026-10-25", account: "the city's online portal", reference: "R 12 \n 45" })).body);
    const sent = R((await kit.post(auth, "filingrecordsent", { filing, at: "2026-10-25", account: "the city's online portal", reference: "R012345-102526" })).body);
    const dup = R((await kit.post(auth, "filingrecordsent", { filing, at: "2026-10-25", account: "the city's online portal" })).body);
    ctx.sent = sent;
    const ok = na.ok === false && sent.ok && dup.ok === false;
    return [ok ? "WORKS" : "BROKEN", `unapproved -> ${na.reason}; a reference with line breaks -> ${badRef.ok ? "accepted" : badRef.reason}; sent ${J({ held_as: sent.held_as, ord: sent.ord, reference: sent.reference, recorded_by: sent.recorded_by }, 220)}; again -> ${dup.reason}; the answer proposes the next state ${J(sent.proposed && sent.proposed.next_state, 160)} and a clock ${J(sent.proposed && sent.proposed.clocks && sent.proposed.clocks[0] && { rule: sent.proposed.clocks[0].rule, citation: sent.proposed.clocks[0].citation }, 200)}; the portal-shows-the-text warning is the screen's words (screen.request.*)`];
  });

  await check("R100", "a second approval where the project's owners require it: the same member cannot give it; a second project member can", "as the member and a second project member", "invite and join; communicationprepare; filingapprove; filingsecondapprove by the same member and by the second", async () => {
    await kit.post(auth, "projectinvite", {}, { projectId: project, handle: "approvertwo" });
    await kit.post(second, "projectjoin", {}, { projectId: project });
    const prep = R((await kit.post(auth, "communicationprepare", { action, purpose: "request", text: "A second request, for the register of stamps." })).body);
    await kit.post(auth, "filingapprove", { filing: prep.id });
    const same = R((await kit.post(auth, "filingsecondapprove", { filing: prep.id })).body);
    const other = R((await kit.post(second, "filingsecondapprove", { filing: prep.id })).body);
    const sentNoSecond = R((await kit.post(auth, "filingrecordsent", { filing: prep.id, at: "2026-10-25", account: "the portal" })).body);
    const ok = same.ok === false && other.ok;
    return [ok ? "WORKS" : "BROKEN", `the same member -> ${same.reason}; the second member -> ${J(other, 180)}; recording it sent afterwards -> ${sentNoSecond.ok ? "ok" : sentNoSecond.reason}; whether the project's owners REQUIRE a second approval (and a refusal SECOND_APPROVAL_NEEDED before it) could not be set from any door tried here: ${J(sentNoSecond.reason)}`];
  });

  await check("R100", "keep the approved text as the team's template (as a filing or a brief); name taken; from an unapproved draft refused", "as the member", "templatesave; again; from an unapproved draft; templatesforaction", async () => {
    const t = R((await kit.post(auth, "templatesave", { filing, name: "Oakland CPRA request", use: "file", project })).body);
    const dup = R((await kit.post(auth, "templatesave", { filing, name: "Oakland CPRA request", use: "file", project })).body);
    const un = R((await kit.post(auth, "communicationprepare", { action, purpose: "request", text: "Unapproved text for a template." })).body);
    const fromUn = R((await kit.post(auth, "templatesave", { filing: un.id, name: "From a draft", use: "file", project })).body);
    const list = R(await kit.get(auth, { op: "templatesforaction", action }));
    return [t.ok && dup.ok === false && fromUn.ok === false ? "WORKS" : "BROKEN", `saved ${J(t, 220)}; the same name again -> ${dup.reason}; from an unapproved draft -> ${fromUn.reason}; offered for the next request: ${J(list, 260)}`];
  });

  await check("R100", "a member who was invited and then joined files and keeps a template (K4569, G52, G53)", "as an invited-then-joined member", "projectinvite; projectjoin; actioncreate; prepare; approve; templatesave", async () => {
    const own = invitee.auth;
    const p2 = await kit.projectOf(auth, "Second records project");
    await kit.post(auth, "projectinvite", {}, { projectId: p2, handle: "invitedmember" });
    const before = R((await kit.post(own, "actioncreate", { document: doc(office, p2, "records_request", "Filed before joining") })).body);
    const j = R((await kit.post(own, "projectjoin", {}, { projectId: p2 })).body);
    const c = R((await kit.post(own, "actioncreate", { document: doc(office, p2, "records_request", "Filed after joining") })).body);
    const pr = R((await kit.post(own, "communicationprepare", { action: c.id, purpose: "request", text: "A request from a member who was invited and then joined." })).body);
    const ap = R((await kit.post(own, "filingapprove", { filing: pr.id })).body);
    const tp = R((await kit.post(own, "templatesave", { filing: pr.id, name: "Invited member template", use: "file", project: p2 })).body);
    return [ap.ok && tp.ok ? "WORKS" : "BROKEN", `filing before joining -> ${before.ok ? "accepted" : before.reason}; joined ${J(j, 100)}; created ${c.id}; approved ${ap.ok}; template ${J(tp, 200)}`];
  });

  await check("R100", "a member who is not in the project files into it: the stand-in refusal (G74), and the wording when the project is blank", "as a member not in the project", "actioncreate into a project the member never joined and was not invited to; the same member's document promoted into it (G74)", async () => {
    const out = await kit.person("strangerone");
    const cso = kit.screenCall(out);
    const r = R((await kit.post(out, "actioncreate", { document: doc(office, project, "records_request", "Filed by a stranger to the project") })).body);
    const up = (await (await kit.plane(`/api/?op=captureupload&statement=s&name=stranger-note.txt&type=text%2Fplain`, { method: "POST", headers: out, body: kit.te("A note from someone who is not in the project.") })).json()).result;
    const filed = await CAPTURE_SCREEN.parts.promoteDocument(cso, { doc: up.document, title: "Stranger's note", locator: up.document.locator, project });
    const docRefused = !filed.bundleId;
    const saw = `the action: ${r.ok ? "ACCEPTED " + r.id + " in a project this member never joined" : r.reason + ' "' + String(r.translation).slice(0, 140) + '"'}; her document promoted into it (G74's act): ${docRefused ? "refused " + J(filed, 260) : "ACCEPTED " + filed.bundleId}`;
    return [r.ok === false && docRefused ? "WORKS" : "BROKEN", saw];
  });

  await check("R100", "the clock: the plane proposes the due date from the profile (10 calendar days from receipt), the member confirms it, and 'How was this worked out?' shows its basis", "as the member", "clockpropose; clockadopt; action", async () => {
    const prop = R((await kit.post(auth, "clockpropose", { target: action, rule: "records_response" })).body);
    const key = prop.proposals && prop.proposals[0] && prop.proposals[0].key || (prop.proposal && prop.proposal.key);
    const adopt = key ? R((await kit.post(auth, "clockadopt", { target: action, proposal: key, why: "Ten calendar days from receipt under the Public Records Act." })).body) : null;
    const a = R(await kit.get(auth, { op: "action", id: action }));
    return [adopt && adopt.ok ? "WORKS" : "BROKEN", `proposal ${J(prop, 300)}; adopted ${J(adopt, 260)}; the action now reads clock_next ${J(a.clock_next)}, overdue ${a.clock_overdue}`];
  });

  /* the reply arrives as a document */
  let replySha;
  await check("R100", "the reply arrives as a document (uploaded and filed in the project) and is recorded as its own correspondence entry with the fixed outcome vocabulary", "as the member", "captureupload a letter; promote; actioncorrespond for each outcome", async () => {
    const letter = kit.te("City of Oakland, Office of the City Clerk. Re: your request. We grant the request in part. Records withheld under Gov. Code 7927.705 (records exempt by law). A fee of $48.50 is due before copies are released.");
    const up = (await (await kit.plane(`/api/?op=captureupload&statement=reply&name=${encodeURIComponent("clerk-reply.txt")}&type=text%2Fplain`, { method: "POST", headers: auth, body: letter })).json()).result;
    const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: "Clerk's reply", locator: up.document.locator, project });
    replySha = kit.sha(letter);
    const out = [];
    for (const outcome of ["granted", "denied", "partial", "reversed", "affirmed", "none_stated", "none_exists", "refused"]) {
      const r = await kit.post(auth, "actioncorrespond", {}, { target: action, direction: "received", at: "2026-11-02", artifact_sha: replySha, outcome, party: "City Clerk", medium: "email" });
      out.push(`${outcome}:${R(r.body).ok ? "kept" : R(r.body).reason}`);
    }
    return [out.slice(0, 7).every((x) => /kept/.test(x)) && /refused:(?!kept)/.test(out[7]) ? "WORKS" : "BROKEN", `filed ${filed.bundleId}; outcomes ${out.join(", ")} (the vocabulary tokens are granted, denied, partial, reversed, affirmed, none_stated, none_exists; the row names "none stated")`];
  });
  await check("R100", "a reply as the member's own account (never both a document and an account); exemptions as the office cited them; a reply that names the entry it answers", "as the member", "actioncorrespond with both, with an account and exemptions", async () => {
    const both = R((await kit.post(auth, "actioncorrespond", {}, { target: action, direction: "received", at: "2026-11-02", artifact_sha: replySha, account: "also my account" })).body);
    const acct = R((await kit.post(auth, "actioncorrespond", {}, { target: action, direction: "received", at: "2026-11-03", account: "The clerk phoned and read me the exemptions.", outcome: "partial", exemptions: "Gov. Code 7927.705; Gov. Code 7927.700", follows: "0" })).body);
    return [both.ok === false && acct.ok ? "WORKS" : "BROKEN", `a document and an account together -> ${both.ok ? "accepted" : both.reason}; an account with exemptions -> ${J(acct, 280)}`];
  });
  await check("R100", "a fee quote becomes evidence (amount, currency as quoted, basis, the entry it answers); read by actionquotes; a waiver is a revision to zero", "as the member", "actioncorrespond with quote_*; actionquotes", async () => {
    const q = R((await kit.post(auth, "actioncorrespond", {}, { target: action, direction: "received", at: "2026-11-04", artifact_sha: replySha, quote_amount: "48.50", quote_currency: "USD", quote_basis: "copying at 10 cents a page, 485 pages", quote_answers: "0" })).body);
    const waived = R((await kit.post(auth, "actioncorrespond", {}, { target: action, direction: "received", at: "2026-11-05", account: "The clerk waived the fee by email.", quote_amount: "0", quote_currency: "USD", quote_basis: "waived", quote_answers: "0", quote_revises: String(q.ord) })).body);
    const quotes = R(await kit.get(auth, { op: "actionquotes", request: action }));
    return [q.ok && waived.ok && quotes.ok !== false ? "WORKS" : "BROKEN", `quote ${J(q, 200)}; waiver ${J(waived, 200)}; actionquotes ${J(quotes, 420)}`];
  });
  await check("R100", "no response is its own entry and partial compliance does not stop the clock; the next-stage due date lives on the entry with its citation (DUE_CITE_NOT_GOVERNING unless a stated governing law)", "as the member", "actioncorrespond no_response; due_by with an ungoverned citation", async () => {
    const silence = R((await kit.post(auth, "actioncorrespond", {}, { target: action, direction: "no_response", at: "2026-11-12", account: "No reply came by the date." })).body);
    const cite = R((await kit.post(auth, "actioncorrespond", {}, { target: action, direction: "received", at: "2026-11-13", account: "An extension notice.", due_by: "2026-12-01", due_cite: "Imaginary Act § 9" })).body);
    const good = R((await kit.post(auth, "actioncorrespond", {}, { target: action, direction: "received", at: "2026-11-13", account: "An extension notice, citing the Act.", due_by: "2026-11-27", due_cite: LAW })).body);
    const a = R(await kit.get(auth, { op: "action", id: action }));
    return [silence.ok && cite.ok === false ? "WORKS" : "BROKEN", `no response -> ${J(silence, 160)}; an ungoverned citation -> ${cite.ok ? "accepted" : cite.reason}; a governing law's -> ${J(good, 200)}; the action reads ${a.correspondence ? a.correspondence.length : "?"} entries, clock_next ${J(a.clock_next)}`];
  });
  await check("R100", "the due date shows met, met late or no reply (R106)", "as the member", "read action's clock entries after the replies", async () => {
    const a = R(await kit.get(auth, { op: "action", id: action }));
    return `clock entries ${J(a.clock, 500)}; correspondence statuses ${J((a.correspondence || []).map((c) => ({ outcome: c.outcome, direction: c.direction })), 400)}; the three words 'met', 'met late' and 'no reply' are the screen's (screen.due-date.*), judged in area 11 where the clock is walked`;
  });
  await check("R100", "other kinds of action (grand jury complaint, controller referral, Brown Act report, court petition, comment) belong to R101 and the action area; the lifecycle's member surface (CM:253-254 says 'not built', CM:8 'built')", "as the member", "read the surface the registry lists", async () => ["NOT REACHED", "these are the action area's (R101); the lifecycle surface was exercised above through actioncorrespond, actionquotes, clockadopt: it exists, so CM:8 holds"]);
}
