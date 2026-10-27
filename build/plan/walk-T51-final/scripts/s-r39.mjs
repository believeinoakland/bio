/* R39: the doorbell and the Inbox, by the door's own ops (knock; inbox, inboxget, inboxpull, inboxresolve, knocksof; doorbelltally). */
import { check } from "./lib-04b.mjs";
import { word } from "../../../../bio-plane/src/setup-words/index.mjs";

export const J = (x, n = 600) => String(JSON.stringify(x)).slice(0, n);
let ipn = 10;
export function knocker(kit) {
  return (payload, ip = `203.0.113.${ipn++}`, raw = null) => kit.plane("/api/?op=knock", { method: "POST", headers: { "cf-connecting-ip": ip },
    body: raw !== null ? raw : JSON.stringify(payload) }).then(async (r) => ({ status: r.status, body: await r.json() }));
}

export async function r39(kit, ctx) {
  const knock = knocker(kit);
  const mem = await kit.person("memberone");
  const mem2 = await kit.person("membertwo");
  const stranger = "as the public with no account";
  const said = (a) => J(a, 500);
  ctx.mem = mem; ctx.mem2 = mem2;

  let k1;
  await check("R39", "knock with text, a note and a contact: the receipt", stranger, "POST op=knock {contentText, note, contact, fileName, mediaType}", async () => {
    k1 = await knock({ contentText: "The clerk stamped the amended contract RECEIVED before the council voted.", note: "I was at the counter that day.", contact: "clerk@example.org", fileName: "tip.txt", mediaType: "text/plain" });
    const b = k1.body;
    if (k1.status !== 200 || !b.ok || !/^KNOCK-/.test(b.knockId) || !/^[0-9a-f]{64}$/.test(b.sha256) || typeof b.bytes !== "number" || !b.received) throw new Error("receipt not as stated: " + said(k1));
    return `status 200; receipt: knockId, sha256, bytes ${b.bytes}, received "${b.received}", pseudonym ${b.pseudonym}`;
  });
  ctx.k1 = k1 && k1.body;

  await check("R39", "knock a file (a PDF) with a stated name and type", stranger, "POST op=knock {contentB64, fileName, mediaType, note}", async () => {
    const pdf = kit.pdfOf("The stamped copy of the contract, RECEIVED.", 20000);
    ctx.pdfBytes = pdf;
    const r = await knock({ contentB64: Buffer.from(pdf).toString("base64"), note: "the stamped copy", fileName: "stamp.pdf", mediaType: "application/pdf" });
    if (r.status !== 200 || !r.body.ok || r.body.bytes !== pdf.length) throw new Error(said(r));
    ctx.kPdf = r.body;
    return `status 200, ${r.body.bytes} bytes, knockId ${r.body.knockId}`;
  });

  await check("R39", "knock a CSV", stranger, "POST op=knock {contentText csv, fileName x.csv, mediaType text/csv}", async () => {
    const csv = "office,amount\nClerk,1200\nTreasurer,3400\nAttorney,5600\n";
    ctx.csv = csv;
    const r = await knock({ contentText: csv, fileName: "offices.csv", mediaType: "text/csv", note: "the table from the budget." });
    if (r.status !== 200 || !r.body.ok) throw new Error(said(r));
    ctx.kCsv = r.body;
    return `status 200, ${r.body.bytes} bytes, knockId ${r.body.knockId}`;
  });

  await check("R39", "note up to 2,000 characters and a contact up to 300 are kept; one character over: what the door does", stranger, "knock with a 2,000-char note and 300-char contact, then with 2,001 and 301", async () => {
    const note = "n".repeat(2000), contact = "c".repeat(300);
    const a = await knock({ contentText: "A long note knock.", note, contact });
    if (a.status !== 200) throw new Error("2000/300 refused: " + said(a));
    const got = (await kit.get(ctx.mem, { op: "inboxget", id: a.body.knockId })).result.item;
    const over = await knock({ contentText: "An over-long note knock.", note: "n".repeat(2001), contact: "c".repeat(301) });
    let gotOver = null;
    if (over.status === 200) gotOver = (await kit.get(ctx.mem, { op: "inboxget", id: over.body.knockId })).result.item;
    const saw = `2000/300: status ${a.status}, note kept ${got.note.length}, contact kept ${got.contact.length}; 2001/301: status ${over.status}` + (gotOver ? `, kept note ${gotOver.note.length}, contact ${gotOver.contact.length} (cut silently, no sentence to the sender)` : " " + said(over));
    ctx.kLong = a.body;
    return gotOver && (gotOver.note.length > 2000 || gotOver.contact.length > 300) ? ["BROKEN", saw] : saw;
  });

  let withSecret, again;
  await check("R39", "press for a made secret, see it once; knock again with the same secret: the same pseudonym", stranger, "knock {generateSecret:true}; knock {knockerSecret: the secret}", async () => {
    withSecret = await knock({ contentText: "A second tip from the same person: the vote was at 7 pm.", generateSecret: true });
    if (!withSecret.body.secret || !withSecret.body.pseudonym) throw new Error(said(withSecret));
    if (String(withSecret.body.secret).length < 20) throw new Error("made secret under 20 characters");
    again = await knock({ contentText: "A third tip: the minutes were typed afterwards.", knockerSecret: withSecret.body.secret });
    const same = again.body.pseudonym === withSecret.body.pseudonym;
    const listed = (await kit.get(ctx.mem, { op: "inbox" })).result.inbox;
    const seenSecret = JSON.stringify(listed).includes(withSecret.body.secret);
    ctx.secret = withSecret.body.secret; ctx.pseud = withSecret.body.pseudonym; ctx.kSecret1 = withSecret.body; ctx.kSecret2 = again.body;
    if (!same) throw new Error("pseudonyms differ: " + withSecret.body.pseudonym + " vs " + again.body.pseudonym);
    if (seenSecret) throw new Error("the secret appears in the inbox read");
    if (again.body.secret) throw new Error("the second answer shows a secret again");
    return `made secret ${String(withSecret.body.secret).length} chars shown once; same pseudonym ${again.body.pseudonym}; the secret is in no inbox read; statement words: "${word("screen.inbox.same", { count: "1" }).replace(/<[^>]+>/g, "")}"`;
  });

  await check("R39", "refusals by name and sentence: empty, bad base64, weak secret, envelope too large, payload too large", stranger, "knock with empty content, contentB64 'not base64!!', secret of 10 chars, an 8 MiB+5000 B body, an 8 MiB+1 B payload", async () => {
    const out = [];
    const empty = await knock({ contentText: "" });
    out.push(`empty -> ${empty.status} ${empty.body.reason}`);
    const empty2 = await knock({ contentB64: "" });
    out.push(`empty b64 -> ${empty2.status} ${empty2.body.reason}`);
    const badb64 = await knock({ contentB64: "not base64!!" });
    out.push(`bad base64 -> ${badb64.status} ${badb64.body.reason || badb64.body.error} "${(badb64.body.translation || badb64.body.detail || "").slice(0, 90)}"`);
    const weak = await knock({ contentText: "x", knockerSecret: "short-secret" });
    out.push(`weak secret -> ${weak.status} ${weak.body.reason}`);
    const payload = await knock({ contentText: "p".repeat(8 * 1024 * 1024 + 200) });
    out.push(`8 MiB+200 B as text -> ${payload.status} ${payload.body.reason}`);
    const seven = await knock({ contentB64: Buffer.alloc(7 * 1024 * 1024, 66).toString("base64") });
    out.push(`a 7 MiB file as base64 (under the stated 8 MiB bound) -> ${seven.status} ${seven.body.reason || "accepted"}`);
    ctx.sevenMiB = seven;
    const env = await knock(null, undefined, "x".repeat(8 * 1024 * 1024 + 6000));
    out.push(`body over 8 MiB+4096 -> ${env.status} ${env.body.reason}`);
    const none = await knock({ note: "no content" });
    out.push(`no content field -> ${none.status} ${none.body.reason || none.body.error}`);
    const want = { empty: "KNOCK_EMPTY", weak: "KNOCKER_SECRET_WEAK", payload: "KNOCK_PAYLOAD_TOO_LARGE", env: "KNOCK_ENVELOPE_TOO_LARGE" };
    const bad = [empty.body.reason !== want.empty && "empty", weak.body.reason !== want.weak && "weak", payload.body.reason !== want.payload && "payload", env.body.reason !== want.env && "envelope", badb64.status !== 400 && "base64"].filter(Boolean);
    ctx.refusalSentences = { empty: empty.body.translation, weak: weak.body.translation, payload: payload.body.translation, env: env.body.translation };
    if (bad.length) throw new Error("not as ruled: " + bad.join(",") + "; " + out.join("; "));
    const saw = out.join("; ") + "; sentences: " + J(ctx.refusalSentences, 700);
    return seven.status !== 200 ? ["BROKEN", saw + " | the doorbell states 8 MiB with an evidence store, but a file of 7 MiB (9.3 MiB once base64) is turned away by the envelope check (door.mjs: body over 8 MiB + 4096 B), so a file over about 6 MiB cannot be knocked as base64"] : saw;
  });

  /* the member's side */
  await check("R39", "member reads the Inbox: unhandled knocks, status, sort by time, status, secret presented, project", "as the member", "GET op=inbox with sort= and dir=", async () => {
    const base = (await kit.get(ctx.mem, { op: "inbox" })).result;
    const rows = base.inbox;
    const bySort = {};
    for (const s of ["received", "status", "secret", "project"]) {
      const a = await kit.get(ctx.mem, { op: "inbox", sort: s });
      bySort[s] = (a.result && a.result.inbox) ? (a.result.sort + "/" + a.result.inbox.length) : "answered " + J(a.result || a, 160);
    }
    const statuses = [...new Set(rows.map((r) => r.status))].join(",");
    const hasContact = rows.every((r) => "contact" in r);
    return `${rows.length} knocks, statuses ${statuses}, default sort ${base.sort} ${base.dir}, limit ${base.limit}, truncated ${base.truncated}; sorts: ${J(bySort)}; every row names pseudonym/status/note/contact: ${hasContact}`;
  });

  await check("R39", "discard asks a reason first (RESOLVE_NO_REASON); discard with reason; a discarded knock cannot be pulled (KNOCK_DISCARDED); Put it back; unknown knock NO_SUCH_KNOCK", "as the member", "inboxresolve without and with a reason; inboxpull on a discarded knock; inboxresolve status new; inboxpull of KNOCK-nope", async () => {
    const id = ctx.k1.knockId;
    const noReason = await kit.post(ctx.mem, "inboxresolve", { knockId: id, status: "discarded" });
    const r0 = noReason.body.result || {};
    const d = await kit.post(ctx.mem, "inboxresolve", { knockId: id, status: "discarded", reason: "Not about this team's question." });
    const pd = await kit.post(ctx.mem, "inboxpull", { knockId: id });
    const back = await kit.post(ctx.mem, "inboxresolve", { knockId: id, status: "new", reason: "Looked again: it is about the contract." });
    const none = await kit.post(ctx.mem, "inboxpull", { knockId: "KNOCK-2026-01-01-deadbeef" });
    const got = (await kit.get(ctx.mem, { op: "inboxget", id })).result.item;
    const ok = r0.reason === "RESOLVE_NO_REASON" && d.body.result.status === "discarded" && pd.body.result.reason === "KNOCK_DISCARDED" && pd.status === 409
      && back.body.result.status === "new" && none.body.result.reason === "NO_SUCH_KNOCK";
    const saw = `no reason -> ${noReason.status} ${r0.reason}; discarded -> ${d.body.result.status}; pull discarded -> ${pd.status} ${pd.body.result.reason}; put back -> ${back.body.result.status}; unknown -> ${none.body.result.reason}; after put back status ${got.status}, resolve_reason "${got.resolve_reason}"`;
    return ok ? saw : ["BROKEN", saw];
  });

  await check("R39", "discard keeps a reason; the archive of discarded knocks is cleared after a week (read what the record says)", "as the member", "discard a knock and read its row; look for a clearing date or an archive read", async () => {
    const id = ctx.kCsv.knockId;
    await kit.post(ctx.mem, "inboxresolve", { knockId: id, status: "discarded", reason: "Rehearsal: discard and keep." });
    const row = (await kit.get(ctx.mem, { op: "inboxget", id })).result.item;
    const keys = Object.keys(row).join(",");
    await kit.post(ctx.mem, "inboxresolve", { knockId: id, status: "new", reason: "Put back for the pull." });
    return `a discarded knock's row keeps status ${row.status}, resolved_by ${row.resolved_by}, resolve_reason "${row.resolve_reason}"; fields: ${keys}; no clear-after field drawn in the row (the one-week clearing is the scheduler's, not seen from the door)`;
  });

  await check("R39", "pull a text: collected capture, source named by receipt, pulling member the capturing actor, note as the knocker's own words, contact stays in the inbox", "as the member", "inboxpull the text knock; read the answer's capture block and the document", async () => {
    const p = await kit.post(ctx.mem, "inboxpull", { knockId: ctx.k1.knockId });
    const r = p.body.result;
    if (!r.ok) throw new Error(said(p));
    const d = r.document;
    const cap = d.capture, src = d.source;
    ctx.textPull = r;
    const contactIn = JSON.stringify(r).includes("clerk@example.org");
    const checks = [cap.method.includes("doorbell"), cap.actor === "memberone", cap.actor_class === "member", src.kind === "knocker" && src.named === false, d.knocker_note.words_of === "the knocker" && d.knocker_note.evidence_of_truth === false, !contactIn, r.existed === false];
    const saw = `existed ${r.existed}; capture method "${cap.method}", grade ${cap.grade} (${cap.grade_basis}), actor ${cap.actor} (${cap.actor_class}); source kind ${src.kind} named ${src.named} pseudonym ${src.pseudonym}; note words_of "${d.knocker_note.words_of}" evidence_of_truth ${d.knocker_note.evidence_of_truth}; contact in the answer: ${contactIn}; authority_state ${d.authority_state}; bundle ${r.bundle && r.bundle.bundleId}; reading_pending ${r.reading_pending}`;
    return checks.every(Boolean) ? saw : ["BROKEN", saw];
  });

  await check("R39", "pulling again answers existed true with the same capture; commits the member to nothing more", "as the member", "inboxpull the same knock twice more", async () => {
    const a = await kit.post(ctx.mem, "inboxpull", { knockId: ctx.k1.knockId });
    const b = await kit.post(ctx.mem2, "inboxpull", { knockId: ctx.k1.knockId });
    const ra = a.body.result, rb = b.body.result;
    if (!(ra.existed === true && ra.capture.sha256 === ctx.textPull.capture.sha256)) throw new Error("first re-pull: " + said(a));
    return `member re-pull existed ${ra.existed}, same capture ${ra.capture.sha256 === ctx.textPull.capture.sha256}; a second member's pull existed ${rb.existed}, pulled_by ${rb.pulled_by}`;
  });

  await check("R39", "pull a PDF and a CSV and see each read", "as the member", "inboxpull both; readheld; poll the reading until read or stated", async () => {
    const out = [];
    for (const [name, k] of [["PDF", ctx.kPdf], ["CSV", ctx.kCsv]]) {
      const p = await kit.post(ctx.mem, "inboxpull", { knockId: k.knockId });
      const r = p.body.result;
      if (!r.ok) { out.push(`${name} pull refused ${said(p)}`); continue; }
      const rh = await kit.get(ctx.mem, { op: "readheld", sha: r.capture.sha256 });
      const reading = await kit.get(ctx.mem, { op: "reading", sha256: r.capture.sha256 });
      out.push(`${name}: existed ${r.existed}, format ${r.document.profile.format && r.document.profile.format.format}, profile "${r.document.profile.handler_label}" (${r.document.profile.content_type_label}), reading_pending ${r.reading_pending}, readheld ${J(rh.result, 160)}, reading ${J(reading.result || reading, 260)}`);
      ctx[name === "PDF" ? "pdfPull" : "csvPull"] = r;
    }
    return out.join(" || ");
  });

  await check("R39", "profile words for a pulled plain text and CSV (known MINOR: 'an unrecognised document' for text and CSV, G76 carried)", "as the member", "read the pulled text's and CSV's profile labels", async () => {
    const t = ctx.textPull.document.profile, c = ctx.csvPull && ctx.csvPull.document.profile;
    const sawT = `${t.handler_label} / ${t.content_type_label}`, sawC = c ? `${c.handler_label} / ${c.content_type_label}` : "n/a";
    const bad = /unrecogni[sz]ed/.test(t.handler_label) || (c && /unrecogni[sz]ed/.test(c.handler_label)) || /no recognised type/.test(t.content_type_label);
    return bad ? ["BROKEN", `text profile: "${sawT}"; CSV profile: "${sawC}" (a plain text or CSV is described as unrecognised; the G76 words were meant to stop this; MINOR)`] : `text: ${sawT}; csv: ${sawC}`;
  });

  await check("R39", "the pulled document's title and a member's list: no raw knock id in member text (overlay check 15)", "as the member", "read the document row's title from op=list", async () => {
    const list = (await kit.get(ctx.mem, { op: "list" })).result;
    const titles = list.map((b) => b.title);
    const raw = titles.filter((t) => /KNOCK-\d{4}-\d\d-\d\d-[0-9a-f]+/.test(t));
    return raw.length ? ["BROKEN", `${raw.length} document titles carry a raw knock id, e.g. "${raw[0]}" (the card is named by what was handed in and when, R32 (3), but the filed document's own title is "Material handed in at the doorbell (KNOCK-...)")`] : `titles: ${J(titles, 300)}`;
  });

  await check("R39", "'Already held' shows the holder: the same bytes knocked again and pulled", "as the member", "knock the text's bytes again from another address; pull; read existed/holder, and read op=list for the holder's visibility", async () => {
    const dup = await knock({ contentText: "The clerk stamped the amended contract RECEIVED before the council voted.", note: "same words again" });
    const p = await kit.post(ctx.mem, "inboxpull", { knockId: dup.body.knockId });
    const r = p.body.result;
    const has = Object.prototype.hasOwnProperty.call(r, "holder");
    const visible = (await kit.get(ctx.mem, { op: "list" })).result.some((b) => b.bundle_id === (r.bundle && r.bundle.bundleId));
    ctx.dup = r;
    const saw = `existed ${r.existed}; holder ${J(r.holder)}; the answer's own bundle ${J(r.bundle)}; the same member's op=list shows that bundle: ${visible}`;
    return r.existed === true && has && (r.holder || !visible) ? saw : ["BROKEN", saw + " (the holder is named only to a viewer who may see it, and this viewer does: the Inbox then draws 'held by another, you may not see it'; store-door/pull.mjs calls doorbell.pullKnock without the viewer it was given)"];
  });

  await check("R39", "See this knocker's other material (knocksof by pseudonym)", "as the member", "knocksof {pseudonym}", async () => {
    const a = await kit.post(ctx.mem, "knocksof", { pseudonym: ctx.pseud });
    const r = a.body.result;
    return r && Array.isArray(r.knocks) && r.knocks.length >= 2 ? `${r.knocks.length} knocks under ${r.pseudonym}; fields ${Object.keys(r.knocks[0]).join(",")}` : ["BROKEN", J(a.body)];
  });

  await check("R39", "the count-only tally and no notification: nothing identifying", "as the member", "doorbelltally as a member and as the founder", async () => {
    const t = await kit.get(ctx.mem, { op: "doorbelltally" });
    const f = await kit.get(await kit.founder(), { op: "doorbelltally" });
    return `member: ${J(t.result)}; founder (admin session, handle admin): ${J(f.result)}; refusals so far counted: the tally lists ${t.result.days.reduce((n, d) => n + d.refused, 0)} turned away`;
  });

  await check("R39", "the litigation hold pauses the archive's one-week clearing of discarded knocks; the optional gatekeeper (machine work) dismisses obvious spam and is labelled; a stranger's knock that contests a published finding raises a re-evaluation notice; the older setup page's 'Mark as taken up' and 'Set aside'", "as the member", "look for each door", async () => {
    return ["NOT REACHED", "the clearing is the scheduler's and is paused by a hold made in the action area (area 11); no assistant is connected so no gatekeeper runs (nothing machine-labelled appears in the inbox rows read above: none of the rows carries a machine mark); a published finding does not exist in this sitting (areas 9 and 10); the older setup page is a screen, not drawn offline (its two acts are the inbox ops inboxpull and inboxresolve, walked above)"];
  });
}
