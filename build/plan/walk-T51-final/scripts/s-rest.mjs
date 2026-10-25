/* R135, R139-R146: the rows placed in area 4 whose prerequisites stand in the watch room (captured addresses, a populated record, the administrator). */
import { check } from "./lib-04b.mjs";
import { CAPTURE_SCREEN } from "../../../../bio-plane/src/screens-intake/capture.mjs";
import { generate } from "../../../../bio-plane/test/docgen.mjs";
import { J } from "./s-r39.mjs";

const R = (a) => (a && a.result !== undefined ? a.result : a);

export async function rest(kit, ctx, net) {
  const auth = ctx.watcher, adm = await kit.founder();
  const mem = await kit.person("plainmember");
  const cs = kit.screenCall(auth);
  const project = ctx.watchProject;
  const upload = async (name, bytes, type = "text/plain", who = auth) => {
    const r = await kit.plane(`/api/?op=captureupload&statement=${encodeURIComponent(name)}&name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`, { method: "POST", headers: who, body: bytes });
    return R(await r.json());
  };

  /* R135 */
  await check("R135", "redaction and expunge: a redacted derivative with its own digest and a derivation record; an expunge leaves a tombstone", "as the member", "look for an op or a screen: redact, redaction, expunge, derivative", async () => {
    const tried = {};
    for (const op of ["redact", "redaction", "redactionlog", "derive", "derivative", "expunge", "capturexpunge", "tombstone"]) {
      const a = await kit.get(auth, { op });
      tried[op] = a.code || a.reason || (a.ok === false ? "refused" : "ANSWERED");
    }
    const answered = Object.entries(tried).filter(([, v]) => v === "ANSWERED");
    return ["NOT REACHED", `${J(tried, 400)}${answered.length ? " ANSWERED: " + answered.map(([k]) => k).join(",") : ""}; the only expunge is personexpunge (an administrator's act on a person's fact, claim, tie or source link, not on a held capture); no document redaction op or screen exists, so the row stays doctrine-only, as the map says (ID:198-224 drafted)`];
  });
  /* R139 */
  await check("R139", "reading guides: a shipped checklist for a kind of document, the team's own, offered to another team", "as the member", "look for an op or a screen: readingguide, guides", async () => {
    const tried = {};
    for (const op of ["readingguide", "readingguides", "guides", "guide", "checklist"]) {
      const a = await kit.get(auth, { op });
      tried[op] = a.code || a.reason || "ANSWERED";
    }
    return ["NOT REACHED", `${J(tried, 300)}; no registry screen and no op: absence recorded (not built); procedureguides is the action area's 'Show the routes', a different thing`];
  });

  /* R140 */
  await kit.profileSet(["oakland-alameda"]);
  const kinds = {
    agenda: ["agenda.txt", "Thursday, July 16, 2026\n*Rules & Legislation Committee\n Agenda - SUPPLEMENTAL\n1\nCall to Order\n2\nOpen Forum\nPage 1\nCity of Oakland\nPrinted on 7/15/2026\nThursday, July 16, 2026\n*Rules & Legislation Committee\n Agenda - SUPPLEMENTAL\n3.1\n26-0910\nSubject:\nGrand Performance Mural\nFrom:\nCouncilmember Wang\nRecommendation: Adopt a resolution accepting a grant for the mural.\nPage 2\nCity of Oakland\nPrinted on 7/15/2026\nThursday, July 16, 2026\n*Rules & Legislation Committee\n Agenda - SUPPLEMENTAL\n3.2\n26-0911\nSubject:\nContract with Acme Paving\nFrom:\nCity Administrator\nRecommendation: Adopt a resolution authorizing a contract not to exceed $1,200,000.\nPage 3\nCity of Oakland\nPrinted on 7/15/2026\nThursday, July 16, 2026\n*Rules & Legislation Committee\n Agenda - SUPPLEMENTAL\n4.1\n26-0912\nSubject:\nAmend Chapter 2.20 Sunshine Ordinance\nFrom:\nCouncilmember Kaplan\nRecommendation: Adopt an ordinance amending Chapter 2.20.\nPage 4\nCity of Oakland\nPrinted on 7/15/2026\nThursday, July 16, 2026\n*Rules & Legislation Committee\n Agenda - SUPPLEMENTAL\n4.2\n26-0913\nSubject:\nPublic Records Fee Schedule\nFrom:\nCity Clerk\nRecommendation: Receive a report on fees for public records.\n"],
    minutes: ["minutes.txt", "The Oakland City Council Rules And Legislation Committee Convened At 10:30 A.M.\nRowena Brown, Janani Ramachandran, and Kevin Jenkins\nPresent\n3 - \nCarroll Fife\nExcused\n1 - \nPage 1\nCity of Oakland\n Meeting Minutes - DRAFT\n3.1\n26-0910\nSubject:\nGrand Performance Mural\nFrom:\nCouncilmember Wang\nA motion was made by Councilmember Brown, seconded by Councilmember Jenkins, that this matter be Recommended Adoption. The motion carried by the following vote:\nAye: 3 - Brown, Ramachandran, Jenkins\nExcused: 1 - Fife\nPage 2\nCity of Oakland\n Meeting Minutes - DRAFT\n3.2\n26-0911\nSubject:\nContract with Acme Paving\nFrom:\nCity Administrator\nA motion was made by Councilmember Brown, seconded by Councilmember Jenkins, that this matter be Recommended Adoption. The motion carried by the following vote:\nAye: 3 - Brown, Ramachandran, Jenkins\nExcused: 1 - Fife\nPage 3\nCity of Oakland\n Meeting Minutes - DRAFT\n4.1\n26-0912\nSubject:\nAmend Chapter 2.20 Sunshine Ordinance\nFrom:\nCouncilmember Kaplan\nA motion was made by Councilmember Brown, seconded by Councilmember Jenkins, that this matter be Recommended Adoption. The motion carried by the following vote:\nAye: 3 - Brown, Ramachandran, Jenkins\nExcused: 1 - Fife\nPage 4\nCity of Oakland\n Meeting Minutes - DRAFT\n4.2\n26-0913\nSubject:\nPublic Records Fee Schedule\nFrom:\nCity Clerk\nA motion was made by Councilmember Brown, seconded by Councilmember Jenkins, that this matter be Recommended Adoption. The motion carried by the following vote:\nAye: 3 - Brown, Ramachandran, Jenkins\nExcused: 1 - Fife\nThere Being No Further Business, The Rules And Legislation Committee Adjourned The Meeting At 11:02 A.M.\n"],
    staffReport: ["staff-report.txt", "AGENDA REPORT\n\nTO: Office of the City Administrator\nFROM: Director, Public Works\nSUBJECT: Contract with Acme Paving\nDATE: October 8, 2026\n\nRECOMMENDATION\nStaff recommends that the City Council adopt a resolution authorizing the City Administrator to enter into a contract with Acme Paving in an amount not to exceed $1,200,000 for street resurfacing.\n\nFISCAL IMPACT\nFunds are available in Fund 1010.\n"],
    ordinance: ["ordinance.txt", "ORDINANCE NO. 13650 C.M.S.\n\nAN ORDINANCE AMENDING CHAPTER 2.20 OF THE OAKLAND MUNICIPAL CODE (SUNSHINE ORDINANCE)\n\nWHEREAS, the City Council finds that public access to records is essential;\n\nNOW, THEREFORE, THE COUNCIL OF THE CITY OF OAKLAND DOES ORDAIN AS FOLLOWS:\n\nSECTION 1. Section 2.20.230 is amended to read as follows:\nSec. 2.20.230 Immediate disclosure requests. Records shall be disclosed promptly.\n\nSECTION 2. This ordinance shall be effective upon final adoption.\n"],
    calendar: ["calendar.txt", "City Council Meeting Calendar, October 2026\nOct 6, 2026  5:30 PM  City Council Regular Meeting\nOct 13, 2026  1:00 PM  Rules and Legislation Committee\nOct 20, 2026  5:30 PM  City Council Regular Meeting\nOct 27, 2026  Meeting cancelled\n"],
    regulation: ["regulation.txt", "TITLE 8: HEALTH AND SAFETY\nCHAPTER 8.04 PUBLIC NUISANCES\nSec. 8.04.010 Definitions.\nFor the purposes of this chapter the following words shall have the meanings given:\n(a) \"Nuisance\" means anything injurious to health.\n(b) \"Owner\" means the owner of record.\nSec. 8.04.020 Abatement.\nThe city may abate a nuisance after notice.\n"],
    generic: ["notes.txt", "Some notes written by a member about lunch plans for next week.\n"],
    misnamed: ["agenda-for-october.txt", "The Oakland City Council Rules And Legislation Committee Convened At 10:30 A.M.\nRowena Brown, Janani Ramachandran, and Kevin Jenkins\nPresent\n3 - \nCarroll Fife\nExcused\n1 - \nPage 1\nCity of Oakland\n Meeting Minutes - DRAFT\n3.1\n26-0910\nSubject:\nGrand Performance Mural\nFrom:\nCouncilmember Wang\nA motion was made by Councilmember Brown, seconded by Councilmember Jenkins, that this matter be Recommended Adoption. The motion carried by the following vote:\nAye: 3 - Brown, Ramachandran, Jenkins\nExcused: 1 - Fife\nPage 2\nCity of Oakland\n Meeting Minutes - DRAFT\n3.2\n26-0911\nSubject:\nContract with Acme Paving\nFrom:\nCity Administrator\nA motion was made by Councilmember Brown, seconded by Councilmember Jenkins, that this matter be Recommended Adoption. The motion carried by the following vote:\nAye: 3 - Brown, Ramachandran, Jenkins\nExcused: 1 - Fife\nPage 3\nCity of Oakland\n Meeting Minutes - DRAFT\n4.1\n26-0912\nSubject:\nAmend Chapter 2.20 Sunshine Ordinance\nFrom:\nCouncilmember Kaplan\nA motion was made by Councilmember Brown, seconded by Councilmember Jenkins, that this matter be Recommended Adoption. The motion carried by the following vote:\nAye: 3 - Brown, Ramachandran, Jenkins\nExcused: 1 - Fife\nPage 4\nCity of Oakland\n Meeting Minutes - DRAFT\n4.2\n26-0913\nSubject:\nPublic Records Fee Schedule\nFrom:\nCity Clerk\nA motion was made by Councilmember Brown, seconded by Councilmember Jenkins, that this matter be Recommended Adoption. The motion carried by the following vote:\nAye: 3 - Brown, Ramachandran, Jenkins\nExcused: 1 - Fife\nThere Being No Further Business, The Rules And Legislation Committee Adjourned The Meeting At 11:02 A.M.\n"],
  };
  await check("R140", "a document read as its kind: agenda, minutes (not an agenda), staff report, ordinance, calendar, regulation, a generic note, and a file whose name says one kind and whose body is another", "as the member", "captureupload one of each; read the document's profile: kind, confidence, reason", async () => {
    const out = [], reads = {};
    for (const [k, [name, text]] of Object.entries(kinds)) {
      const up = await upload(name, kit.te(text));
      const p = up.document && up.document.profile;
      reads[k] = p ? `${p.handler_label} (${p.confidence}; kind ${p.document_kind}; content type ${p.content_type_label}, ${p.content_type_confidence})` : "no profile: " + J(up, 160);
      out.push(`${k}: ${reads[k]}`);
    }
    ctx.kindReads = reads;
    const typed = Object.entries(reads).filter(([, v]) => !/no recognised type/.test(v)).map(([k]) => k);
    const minutesAsAgenda = /agenda/i.test(reads.minutes) && !/minutes/i.test(reads.minutes);
    const bodyDecides = /minutes/i.test(reads.misnamed) && !/agenda/i.test(reads.misnamed);
    const wordsClash = /an unrecognised document \(none/.test(reads.agenda) && /a meeting agenda/.test(reads.agenda);
    const saw = `${out.join(" | ")}; read as a kind: ${typed.join(", ")}; a file named agenda-... holding minutes reads as minutes (the body decides): ${bodyDecides}; the agenda, minutes and ordinance fixtures are shaped on the readers' measured Legistar documents; the staff report and the calendar fixtures I wrote are not Legistar-shaped and read as no recognised type, which says nothing of the readers (a real staff report and calendar are not available offline); the regulation text reads as 'an ordinance or resolution' (one class for both here)`;
    return [typed.includes("agenda") && typed.includes("minutes") && !minutesAsAgenda && bodyDecides ? "WORKS" : "BROKEN", saw + (wordsClash ? " | the same profile says 'an unrecognised document (none)' as its handler and 'a meeting agenda (certain)' as its content type: two contradictory descriptions of one document (the words G76 meant to settle; MINOR)" : "")];
  });
  await check("R140", "an agenda packet (an agenda, staff reports and draft resolutions in one file) is described as more than one kind; a budget or an audited financial statement reads generic with no description", "as the member", "upload a combined text and a budget table; read the profile", async () => {
    const packet = kinds.agenda[1] + "\n\n" + kinds.staffReport[1] + "\n\nRESOLUTION NO. 90001 C.M.S.\nWHEREAS the council finds; NOW THEREFORE BE IT RESOLVED that the contract is approved.\n";
    const up = await upload("packet.txt", kit.te(packet));
    const p = up.document.profile;
    const budget = await upload("budget.txt", kit.te("FY 2026-27 ADOPTED BUDGET\nFund 1010 General Fund Revenue 1,200,000,000 Expenditure 1,199,000,000\nFund 2100 Library Fund 12,000,000\n"));
    const pb = budget.document.profile;
    return `packet: ${p.handler_label} (${p.confidence}), considered ${J(p.considered, 200)}, document_kind ${p.document_kind}; budget: ${pb.handler_label} / ${pb.content_type_label} (a budget or dataset has no reader: generic, as the map says); the description 'more than one kind' is ${/more than one|and/i.test(JSON.stringify(p.considered)) ? "present" : "not drawn in this profile"}`;
  });
  await check("R140", "a staff directory PDF with no Unicode map is not written (expect a refusal to read, not a kind); a council staff report's whole recommendation (about 1,500 characters) on the Document page (G23)", "as the member", "upload a text staff report with a 1,500-character recommendation; read the held document's staff-report reading", async () => {
    const rec = "Staff recommends that the City Council adopt the resolution. ".repeat(26).slice(0, 1500);
    const up = await upload("long-rec.txt", kit.te(`AGENDA REPORT\n\nTO: Office of the City Administrator\nFROM: Director, Public Works\nSUBJECT: Long recommendation\n\nRECOMMENDATION\n${rec}\n\nFISCAL IMPACT\nNone.\n`));
    const p = up.document.profile;
    const f = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: "Long recommendation", locator: up.document.locator, project });
    const prov = R(await kit.get(auth, { op: "image", id: f.bundleId }));
    const json = prov["data/provenance.json"] || "";
    const whole = json.includes(rec.slice(-60)) || (prov["bundle.md"] || "").includes(rec.slice(-60));
    return [/staff report|agenda report/i.test(p.handler_label) ? (whole ? "WORKS" : "BROKEN") : "NOT REACHED", `profile "${p.handler_label}" (${p.confidence}); the filed document carries the last 60 characters of the 1,500-character recommendation: ${whole}; a staff directory PDF is not made here (it needs a font with no Unicode map): NOT REACHED`];
  });

  /* R141: Drive */
  const DRIVE = "https://docs.google.com";
  const odt = Buffer.from(await generate({ kind: "odt", seed: "drive1", size: { units: 4 } }).bytes());
  net.specials.set("export", (req, url) => {
    if (url.pathname.includes("PRIVATE")) return new Response("<html><head><title>Sign in</title></head><body>Google Accounts: sign in to continue</body></html>", { headers: { "content-type": "text/html" } });
    return new Response(odt, { headers: { "content-type": "application/vnd.oasis.opendocument.text", "content-length": String(odt.length) } });
  });
  await check("R141", "a shared Google Doc link is filed with the Drive address kept and the capture the export; the hop shows export address, format, producer, file id and kind", "as the member", "acquire a docs.google.com document link; read the document's hop", async () => {
    const r = await kit.acquire(auth, { locator: `${DRIVE}/document/d/1aBcD3fGhIjKlMnOpQrStUvWxYz0123456789AbCdEfG/edit`, project });
    const b = R(r.body);
    const d = b.document;
    const hop = d && J({ chain: (d.provenance_chain || []).map((h) => ({ who: h.who, via: h.via })), capture: d.capture && { method: d.capture.method, grade: d.capture.grade, grade_basis: d.capture.grade_basis }, drive: d.drive || d.hop }, 700);
    return [b.ok && d ? "WORKS" : "BROKEN", `status ${r.status}; document locator ${d && d.locator}; ${hop}; the answer: ${J({ ok: b.ok, reason: b.reason, existed: b.existed }, 160)}`];
  });
  await check("R141", "a folder and a kind-less file id are refused before the network; a private (shell) page is refused as Google's application shell by name", "as the member", "acquire a /drive/folders/ link, a bare file id, a PRIVATE Doc", async () => {
    const f = R((await kit.acquire(auth, { locator: `${DRIVE.replace("docs", "drive")}/drive/folders/1FolderFolderFolderFolderFolderFolder12`, project })).body);
    const k = R((await kit.acquire(auth, { locator: `https://drive.google.com/open?id=1KindlessKindlessKindlessKindless123456`, project })).body);
    const s = R((await kit.acquire(auth, { locator: `${DRIVE}/document/d/1PRIVATE9PRIVATE9PRIVATE9PRIVATE9PRIVATE9ab/edit`, project })).body);
    const ok = f.reason === "DRIVE_FOLDER_NOT_A_DOCUMENT" && /DRIVE_KIND_UNDETERMINED|DRIVE_SHAPE_UNRECOGNISED/.test(k.reason) && /DRIVE_EXPORT_IS_THE_SHELL|DRIVE_SHELL/.test(s.reason);
    return [ok ? "WORKS" : "BROKEN", `folder -> ${f.reason}; kind-less id -> ${k.reason}; private page -> ${s.reason}`];
  });
  await check("R141", "watch the Drive link and tick it; driveshells (administrator) classes each Drive-linked bundle with its basis and remedy", "as the member and the administrator", "file the Doc capture, monitorset, monitor; driveshells", async () => {
    const got = R((await kit.acquire(auth, { locator: `${DRIVE}/document/d/1ZyXwVuTsRqPoNmLkJiHgFeDcBa9876543210ZyXwVuT/edit`, project })).body);
    const f = got.document ? await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: got.document, title: "A shared Doc", locator: got.document.locator, project }) : {};
    if (!f.bundleId) throw new Error("not filed: " + J(got, 300));
    await kit.post(auth, "monitorset", { bundleId: f.bundleId, enabled: true, frequency: "daily" });
    const t = R((await kit.post(auth, "monitor", { bundleId: f.bundleId })).body);
    const ds = R(await kit.get(adm, { op: "driveshells" }));
    const mine = [...(ds.export || []), ...(ds.shells || []), ...(ds.undetermined || []), ...(ds.no_baseline || [])];
    return [t.status ? "WORKS" : "BROKEN", `tick -> ${t.status} "${t.note}" (compared ${t.compared}); driveshells counts ${J(ds.counts)}; classed ${J(mine.map((x) => ({ class: x.class || x.kind, basis: String(x.basis || "").slice(0, 80), remedy: x.remedy })), 360)}; a Doc export compares raw and may read modified (the row says do not expect unchanged)`];
  });

  /* R142 */
  await check("R142", "re-read a document and read the attributed difference (reading history); an equal re-read adds nothing; no screen reads a text tier as a per-page fact", "as the member", "readheld twice on an uploaded text; read the reading's history", async () => {
    const up = await upload("reread.txt", kit.te("A short text that is read once and re-read."));
    const sha = up.capture.sha256;
    await kit.get(auth, { op: "readheld", sha });
    await kit.get(auth, { op: "readheld", sha });
    const rd = R(await kit.get(auth, { op: "reading", sha256: sha }));
    const hist = rd.reading_history || rd.history;
    return `the reading answers keys ${Object.keys(rd).slice(0, 14).join(",")}; reading_history ${J(hist, 200)}; a changed re-read of a scanned or mixed PDF (the sentence 'tier 3 on ocr-worker returned different text for page 1') is NOT REACHED: it needs an OCR worker answering twice differently, which no door here can make`;
  });

  /* R143 */
  await check("R143", "the owed-work ledger and its watchdog: the five watchdog fields present on every answer for the administrator, absent for an ordinary member; per-tick last_ms, own_ms and wait_ms of a large reading", "as the administrator and the member", "owedwork before and after a 3 MB upload; owedwork&sha= polled until the reading ends; as a member", async () => {
    const five = ["last_run", "alarm_at", "stale", "oldest_overdue", "watchdog_seen"];
    const have = (a) => five.filter((k) => Object.prototype.hasOwnProperty.call(a, k));
    const timed = async (q, who = adm) => { const t0 = Date.now(); const a = R(await kit.get(who, q)); return { a, t0, t1: Date.now() }; };
    const first = await timed({ op: "owedwork" });
    const big = Buffer.from("The clerk stamped the contract. ".repeat(100000));
    const up = await upload("three-mb.txt", big);
    const sha = up.capture.sha256;
    await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: "Three MB text", locator: up.document.locator, project });
    const ticks = [];
    const end = Date.now() + 900000;
    let lastAns = null, sample = null, finished = false;
    while (Date.now() < end) {
      const { a, t0, t1 } = await timed({ op: "owedwork", sha });
      lastAns = a;
      if (!sample) sample = a;
      const row = Array.isArray(a.owed) ? a.owed.find((r) => r.sha === sha) || a.owed[0] : null;
      ticks.push({ n: have(a).length, stale: a.stale, alarmIn: typeof a.alarm_at === "number" ? Math.round((a.alarm_at - t1) / 1000) : null, seen: a.watchdog_seen, state: row ? row.state : "none", why: row && row.why, ms: row && [row.last_ms, row.own_ms, row.wait_ms], mem: row && row.last_mem, attempts: row && row.attempts });
      if (!row || row.state !== "owed") { finished = true; break; }
      await kit.later(2500);
    }
    const aEnd = (await timed({ op: "owedwork" }));
    const m = R(await kit.get(mem, { op: "owedwork" }));
    const allFive = ticks.every((t) => t.n === 5) && have(first.a).length === 5 && have(aEnd.a).length === 5;
    const memberNone = have(m).length === 0;
    const alarmFuture = typeof aEnd.a.alarm_at === "number" && aEnd.a.alarm_at > aEnd.t0;
    const saw = `start ${J(first.a, 230)}; ${ticks.length} polls of owedwork&sha= until the reading ended (${finished}); the row's state, why, attempts per poll ${J(ticks.map((t) => [t.state, t.why, t.attempts]), 260)}; last_ms/own_ms/wait_ms ${J(ticks.map((t) => t.ms), 200)}; last_mem ${J([...new Set(ticks.map((t) => t.mem))])}; alarm_at relative to the answer (s) ${J(ticks.map((t) => t.alarmIn), 120)}; stale ${J([...new Set(ticks.map((t) => t.stale))])}; the sha-keyed answer's own fields ${J(Object.keys(sample || {}), 200)} and its owed block ${J(sample && sample.owed, 400)}; end ${J(aEnd.a, 240)}; an ordinary member's answer carries none of the five: ${memberNone}; five fields present on every answer: ${allFive}; alarm_at after the answer's instant at the end: ${alarmFuture}; watchdog_seen ${aEnd.a.watchdog_seen}`;
    const nulls = ticks.filter((t) => t.alarmIn === null).length;
    return [allFive && memberNone && !nulls ? "WORKS" : "BROKEN", saw + (nulls ? ` | alarm_at was null in ${nulls} of ${ticks.length} polls while a reading was owed (KNOWN fix-round-10 R28 (G5): alarm_at past or null while owed); the row first read why NO_HOME (KNOWN R25 (G5): the first big text's reading refused NO_HOME)` : "")];
  });

  /* R144 */
  await check("R144", "the administrators' record-integrity reads: registeraudit, homecensus, digestcensus, snapkeycensus, changedfromaudit, versionchain; a member is refused; no census changes a row", "as the administrator and the member", "call each as administrator after the intake, read twice; call as a member", async () => {
    const ops = ["registeraudit", "homecensus", "digestcensus", "snapkeycensus", "changedfromaudit"];
    const first = {}, second = {}, mem2 = {};
    for (const op of ops) { first[op] = R(await kit.get(adm, { op })); }
    for (const op of ops) { second[op] = R(await kit.get(adm, { op })); mem2[op] = (R(await kit.get(mem, { op }))).reason; }
    const vc = R(await kit.get(adm, { op: "versionchain", address: "https://www.example.gov/pages/agenda.html" }));
    const same = ops.every((op) => J(first[op], 4000) === J(second[op], 4000));
    const memberRefused = ops.every((op) => mem2[op] === "CLASS_FORBIDDEN");
    const ra = first.registeraudit, dc = first.digestcensus;
    return [same && memberRefused ? "WORKS" : "BROKEN", `registeraudit total ${ra.total}, sound ${ra.sound}, undetermined ${ra.undetermined}, held_in_parts ${ra.held_in_parts}; digestcensus bytes_disagree ${dc.files && dc.files.bytes_disagree}/${dc.history && dc.history.bytes_disagree}, rewritten ${dc.rewritten}; homecensus first_holder ${first.homecensus.first_holder}; snapkeycensus undetermined ${first.snapkeycensus.undetermined}; versionchain ${J(vc, 260)}; two reads equal (nothing changed): ${same}; a member is answered ${J(mem2)}`];
  });
  await check("R144", "stats equal the counts a member's own view allows (a hidden project does not show in the counts)", "as the member and the administrator", "op=stats as a member who is in no project and as the administrator, after projects and documents exist", async () => {
    const m = R(await kit.get(mem, { op: "stats" })), a = R(await kit.get(adm, { op: "stats" }));
    const mine = R(await kit.get(mem, { op: "list" })).length, theirs = R(await kit.get(adm, { op: "list" })).length, owner = R(await kit.get(auth, { op: "stats" }));
    const sees = (x) => `bundles ${x.bundles}, files ${x.files}, history ${x.history}, projectParticipants ${x.projectParticipants}`;
    return [m.bundles === mine && owner.bundles === a.bundles || a.bundles === theirs ? "WORKS" : "BROKEN", `member stats: ${sees(m)}; the same member's own list holds ${mine} documents; the administrator's list holds ${theirs}, the project owner's stats ${sees(owner)}; the administrator's stats: ${sees(a)}; a member's stats equal her view: ${m.bundles === mine}`];
  });

  /* R145 */
  await check("R145", "a reference-only source (Grade C): a locator and a citation with no archived bytes", "as the member", "look for a door that takes a locator without bytes", async () => {
    const tried = {};
    for (const op of ["referencesource", "referenceonly", "captureref", "locatoronly", "sourcecite"]) { const a = await kit.get(auth, { op }); tried[op] = a.code || a.reason || "ANSWERED"; }
    const noBytes = R((await kit.post(auth, "captureupload", {}, {})).body);
    return ["NOT REACHED", `${J(tried, 300)}; an upload with no bytes -> ${noBytes && (noBytes.reason || noBytes.code)}; no screen or op takes a locator with no bytes (the Add screen's tabs are address, file, observation): absence recorded; the 'observation' (testify) is the nearest, graded testimony D`];
  });

  /* R146 */
  await check("R146", "authority undetermined at capture: exactly one task in the Queue, routed to a project owner, its subject as quoted text and its basis; the same capture again folds into it", "as the member", "read op=tasks and the Queue after address captures; capture the same document again", async () => {
    const t0 = R(await kit.get(auth, { op: "tasks" }));
    const q = R(await kit.get(auth, { op: "queue" })).items.filter((i) => i.kind === "authority-undetermined");
    const again = await kit.acquire(auth, { locator: "https://www.example.gov/pages/agenda.html", project });
    const t1 = R(await kit.get(auth, { op: "tasks" }));
    const subjects = q.map((i) => i.subject && i.subject.id);
    const dupes = subjects.length - new Set(subjects).size;
    const one = q[0] || {};
    const parts = R(await kit.get(auth, { op: "projectparticipants", projectId: project }));
    const owners = (parts.participants || []).filter((x) => Number(x.owner)).map((x) => x.handle);
    const routed = q.filter((i) => i.assignee && i.assignee !== "unassigned" && i.assignee_role !== "group-admin").length;
    return [q.length && dupes === 0 && routed > 0 ? "WORKS" : "BROKEN", `${q.length} authority task(s) for ${new Set(subjects).size} documents (duplicates ${dupes}); tasks counts ${J(t0.counts)} -> ${J(t1.counts)} after pressing the same address again (${J({ ok: R(again.body).ok, existed: R(again.body).existed })}); the project's owner(s): ${J(owners)}; tasks routed to an owner or a named member: ${routed} of ${q.length} (the row says a task is routed to the project's manager or owner, and to a group administrator only when the project has none); first item: summary "${one.summary}", detail "${String(one.detail).slice(0, 160)}", assignee ${one.assignee}, role ${one.assignee_role}, options ${J((one.options || []).map((o) => o.id))}`];
  });
  await check("R146", "forward it to a better-placed member; the original assignment stays in the task's history; an obligation is never muted", "as the member and a second member", "taskforward; read both Queues; queuemute the task", async () => {
    const partner = await kit.person("partner");
    const items = R(await kit.get(auth, { op: "queue" })).items.filter((i) => i.kind === "authority-undetermined");
    if (!items.length) throw new Error("no authority task to route");
    const id = items[0].id;
    const fw = R((await kit.post(auth, "taskforward", { id, to: "partner" })).body);
    const mine = R(await kit.get(auth, { op: "queue" })).items.some((i) => i.id === id);
    const theirs = R(await kit.get(partner, { op: "queue" })).items.find((i) => i.id === id);
    const muted = R((await kit.post(partner, "queuemute", { item: id })).body);
    const hist = R(await kit.get(partner, { op: "tasks" })).tasks.find((t) => t.id === id);
    ctx.forwarded = id;
    const refused = muted.ok === false;
    return [fw.ok && !mine && theirs && refused ? "WORKS" : "BROKEN", `forward ${J(fw, 200)}; the forwarder's Queue still holds it: ${mine}; the receiver's holds it: ${!!theirs}; mute -> ${refused ? muted.reason : "ACCEPTED " + J(muted, 120)}; the task's history ${J(hist && hist.history, 300)}`];
  });
  await check("R146", "decide it: 'Who issued this document?' and 'How do you know?', or 'I could not tell' with 'What you tried'; the basis dated on the document; the task leaves everyone's list", "as a member", "taskdecide determined with authority and basis; undetermined_after_review; no basis; read the document's authority afterwards", async () => {
    const partner = await kit.person("partner");
    const items = R(await kit.get(auth, { op: "queue" })).items.filter((i) => i.kind === "authority-undetermined");
    if (items.length < 2) throw new Error("fewer than two authority tasks");
    const bundleOf = (i) => i.subject && i.subject.id;
    const taskRows = R(await kit.get(auth, { op: "tasks" })).tasks;
    const shaOf = (id) => { const t = taskRows.find((x) => x.id === id); return t && (t.capture_sha || t.capture); };
    const noteBefore = R(await kit.get(auth, { op: "gradenote", capture: shaOf(items[0].id) }));
    const noBasis = R((await kit.post(auth, "taskdecide", { id: items[0].id, outcome: "determined", authority: "City Clerk" })).body);
    const det = R((await kit.post(auth, "taskdecide", { id: items[0].id, outcome: "determined", authority: "City of Oakland, Office of the City Clerk", basis: "The page's footer names the clerk and its address is the clerk's." })).body);
    const und = R((await kit.post(auth, "taskdecide", { id: items[1].id, outcome: "undetermined_after_review", basis: "Searched the clerk's site and asked the front desk; nobody could say." })).body);
    const plain = R((await kit.post(auth, "taskresolve", { id: items[2] ? items[2].id : items[1].id })).body);
    const after = R(await kit.get(auth, { op: "queue" })).items.filter((i) => i.kind === "authority-undetermined").map((i) => i.id);
    const img = R(await kit.get(auth, { op: "image", id: bundleOf(items[0]) }));
    const noteAfter = R(await kit.get(auth, { op: "gradenote", capture: shaOf(items[0].id) }));
    const sha0 = shaOf(items[0].id), b0 = bundleOf(items[0]);
    const carriers = [];
    for (const q of [{ op: "provenanceroutes", id: b0 }, { op: "provenanceroutes", bundle: b0 }, { op: "textprovenance", sha: sha0 }, { op: "reading", sha256: sha0 }, { op: "gradenote", capture: sha0 }, { op: "list" }, { op: "queue" }, { op: "tasks" }]) {
      const a = JSON.stringify(R(await kit.get(auth, q)));
      if (a.includes("Office of the City Clerk")) carriers.push(q.op);
    }
    const heard = carriers.length > 0;
    const prov = String(img["data/provenance.json"] || "");
    const where = Object.keys(img).filter((k) => String(img[k]).includes("Office of the City Clerk"));
    const state = /authority_state"?:\s*"([a-z_]+)"/.exec(prov);
    const basis = /authority_basis"?:\s*"([^"]{0,160})/.exec(prov);
    const ok = noBasis.ok === false && det.ok && und.ok && !after.includes(items[0].id) && !after.includes(items[1].id) && (heard || (state && state[1] === "determined"));
    return [ok ? "WORKS" : "BROKEN", `without a basis -> ${noBasis.reason}; determined ${J(det, 160)}; undetermined after review ${J(und, 160)}; a plain taskresolve (the Queue's own 'Done') -> ${J(plain, 140)}; the document's own authority afterwards: state ${state && state[1]}, basis "${basis && basis[1]}"; the stated issuer appears in these reads of the document after the decision: ${J(carriers)} (it is held in the authority_decisions table, which the ceremony's check reads; none of the document, grade-note, reading or provenance reads tried draws it) (grade note keys ${J(Object.keys(noteAfter || {}), 160)}; before ${J(noteBefore, 200)}); the files of that document that carry the stated issuer: ${J(where)} (of ${J(Object.keys(img).filter((k) => !k.startsWith("_history/")), 200)}); the two decided tasks left the Queue: ${!after.includes(items[0].id) && !after.includes(items[1].id)}; whether the three ways are drawn with nothing preselected is the screen's (overlay check 7), not drawn offline; the endorsement, owner-vote and expertise items and the owner's join request (Grant / Decline) are the people area's (R10, R11)`];
  });
}
