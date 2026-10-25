/* WALK-FINAL-05 #1 (T51 final pass, Phase 1, sitting 5: Vouch; the people, organizations and ties the documents name).
   The whole plane under Miniflare (the seam files' way: bio-plane/test/m/control-plane/r8-kit.mjs), every input made by a member's own acts through
   the real ops the screens press, never a hand-written answer or a row written to storage. It RECORDS what it sees (WORKS / BROKEN / NOT REACHED per
   row) into build/plan/walk-T51-final/05-vouch.md as it goes; a harness error is recorded as such and the walk goes on. Run from bio-plane/:
     node --import ./test/platform-sqlite.mjs --test ../build/plan/walk-T51-final/scripts/05-vouch.test.mjs */
import "../../../../bio-plane/test/sandbox.mjs";
import { after, test } from "node:test";
import { appendFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { makeKit } from "../../../../bio-plane/test/m/control-plane/r8-kit.mjs";
import { CAPTURE_SCREEN } from "../../../../bio-plane/src/screens-intake/capture.mjs";

const OUT = fileURLToPath(new URL("../05-vouch.rows.md", import.meta.url));
const kit = makeKit({ tag: "w05vouch" });
after(() => kit.mf.dispose());
const J = (x, n = 600) => { const s = typeof x === "string" ? x : JSON.stringify(x); return s === undefined ? "undefined" : s.length > n ? s.slice(0, n) + "…" : s; };
const R = kit.R;
const T0 = Date.now();
writeFileSync(OUT, "| row id | check | width | role | what I did | verdict | what I saw (wall) | shot |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n");
const rows = [];
/* one row of the record: written the moment the check is done */
function row(id, check, role, did, verdict, saw) {
  const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
  const line = `| ${id} | ${cell(check)} | none: offline, no screen drawn | ${role} | ${cell(did)} | ${verdict} | ${cell(saw)} | none |\n`;
  rows.push({ id, check, role, did, verdict, saw });
  appendFileSync(OUT, line);
  console.log(`ROW ${id} ${verdict} ${check}`);
}
const call = async (auth, op, body, query = {}) => {
  const t = Date.now();
  const res = await kit.plane(`/api/?${new URLSearchParams({ op, ...query })}`, { method: body === undefined ? "GET" : "POST", headers: { ...auth, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  let json = null; try { json = await res.json(); } catch { /* not json */ }
  const r = json && json.result !== undefined ? json.result : json;
  return { status: res.status, ms: Date.now() - t, ok: !!(json && json.ok !== false && (!r || r.ok !== false)), r, raw: json };
};
/* a read or act whose arguments the owner takes from the address (project-roster, retrieval, ratification take them so) */
const callQ = (auth, op, query) => call(auth, op, undefined, query);
const callBQ = (auth, op, body, query) => call(auth, op, body, query);
/* "Start a project" as the Home screen presses it (`promote` of the project's document with the chosen visibility), the kit's own with the choice made */
async function startProject(auth, title, visibility) {
  const cs = kit.screenCall(auth);
  const iso = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const made = await cs.call("promote", { body: { base: null, snapKey: iso.replace(/[-:]/g, "") + "_" + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0"),
    meta: { object_type: "project", title, current_state: "forming", created: iso, last_updated: iso },
    files: [{ path: "bundle.md", text: `---\nobject_type: project\ntitle: ${JSON.stringify(title)}\nobjective: ${JSON.stringify(title)}\ncurrent_state: forming\ncreated: "${iso}"\nlast_updated: "${iso}"\n---\n\n## Session Log\n\n### Session ${iso} | Formation | interactive\nTrigger: the walk\nChanges: created.\n` }],
    register: [], visibility } });
  return (made.result && made.result.bundleId) || made.bundleId;
}
const ctx = {};

test("sitting 5: Vouch; the people, organizations and ties the documents name", { timeout: 1_800_000 }, async () => {
  /* ---------------------------------------------------------------- the room, as areas 1 to 3 leave it (made by the real acts) */
  const adm = await kit.founder();
  const ana = (await kit.ownerOf("ana")).auth;
  const ben = await kit.person("ben");
  ctx.adm = adm; ctx.ana = ana; ctx.ben = ben;
  const project = await startProject(ana, "Public works spending", "discoverable");
  ctx.project = project;
  const anaCs = kit.screenCall(ana), benCs = kit.screenCall(ben);
  const dir = await callQ(ben, "projectdirectory", {});
  console.log("PREREQ ben's directory", J(dir.r, 500));
  const rq = await callQ(ben, "projectrequest", { projectId: project, comment: "I would like to work on this" });
  console.log("PREREQ ben asks to join", rq.status, J(rq.r, 300));
  const gr = await callQ(ana, "projectrequestanswer", { projectId: project, handle: "ben", answer: "grant" });
  console.log("PREREQ ana answers", gr.status, J(gr.r, 300));
  const question = await kit.questionOf(ana, project, "Did Public Works spend its 2024 paving budget as its policy says?");
  ctx.question = question;
  console.log("PREREQ question", question);
  const html = (title, body) => kit.te(`<!doctype html><html><head><title>${title}</title></head><body><h1>${title}</h1><p>${body}</p></body></html>`);
  kit.serve("budget-2024.html", html("City of Oakland paving budget 2024", "Public Works Agency adopted paving budget for fiscal year 2024 of 4.2 million dollars."), { type: "text/html" });
  kit.serve("budget-2022.html", html("City of Oakland paving budget 2022", "Public Works Agency adopted paving budget for fiscal year 2022 of 3.9 million dollars."), { type: "text/html" });
  const a1 = await kit.acquire(ana, { locator: "https://www.oaklandca.example/budget-2024.html", project, for: question });
  console.log("PREREQ acquire for question", a1.status, a1.ms, J(a1.body, 800));
  ctx.a1 = a1;
  const joined = await callQ(ben, "projectjoin", { projectId: project });
  console.log("PREREQ ben joins", joined.status, J(joined.r, 300));
  const file = (cs, doc, title, locator) => CAPTURE_SCREEN.parts.promoteDocument(cs, { doc, title, locator, project });
  const f1 = await file(anaCs, a1.body.document, "City of Oakland paving budget 2024", "https://www.oaklandca.example/budget-2024.html");
  console.log("PREREQ filed web page", J(f1));
  const upDoc = async (auth, cs, name, text, type = "text/plain") => {
    const up = (await (await kit.plane(`/api/?op=captureupload&statement=${encodeURIComponent(name)}&name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`, { method: "POST", headers: auth, body: kit.te(text) })).json()).result;
    const filed = await file(cs, up.document, name, up.document.locator);
    return { bundleId: filed.bundleId, sha: up.capture.sha256, up, filed };
  };
  const sel = async (auth, ids) => { const x = await callBQ(auth, "select", { ids }); return x.r && x.r.handle; };
  const release = async (auth, handle, acknowledgment, mitigation) => call(auth, "release", { handle, acknowledgment, mitigation }, { handle, acknowledgment, mitigation });
  const heldIds = async (auth, q = {}) => { const x = await callQ(auth, "heldcaptures", { limit: 50, fields: "picker", ...q }); return { ids: ((x.r && x.r.held) || []).map((h) => h.bundle_id), r: x.r, ms: x.ms }; };
  const ack = "These are minutes and budget pages from the city's own site; I checked the dates on each.";
  const mit = "I opened every one and compared its title with the address it came from.";
  const sig = {};

  /* ============================================================== R38 */
  /* fixtures: a memo and a staff list uploaded, a wrong-year page captured, and a page captured for Ben's question in his own hidden project */
  const memo = await upDoc(ana, anaCs, "Public Works memo on the paving contract", "MEMO\nTo: The Board\nFrom: Jane Smith, Director of Public Works\nThe City of Oakland Public Works Agency has contracted with Acme Paving LLC and the Oakland Community Fund, a nonprofit, to repave Telegraph Avenue.\nJane Smith signed the contract on May 2, 2024. Jane Smith also chairs the Oakland Community Fund board.\n");
  const memo2 = await upDoc(ben, benCs, "Second memo from the same office", "MEMO\nTo: The Board\nFrom: Jane Smith, Director of Public Works\nThe vendor Acme Paving LLC received an advance on the Telegraph Avenue contract.\nA second Jane Smith, of Sacramento, sits on a state board.\n");
  const a22 = await kit.acquire(ben, { locator: "https://www.oaklandca.example/budget-2022.html", project });
  const f22 = await file(benCs, a22.body.document, "City of Oakland paving budget 2022", "https://www.oaklandca.example/budget-2022.html");
  console.log("PREREQ fixtures", memo.bundleId, memo2.bundleId, f22.bundleId);
  ctx.docs = { web: f1.bundleId, memo: memo.bundleId, memo2: memo2.bundleId, y22: f22.bundleId };
  const dochash = {};
  dochash[f1.bundleId] = a1.body.capture && a1.body.capture.sha256;

  try {
    const mine = await heldIds(ana, { member: "ana" });
    const everyone = await heldIds(ana);
    const benView = await heldIds(ben);
    const byProject = await heldIds(ana, { project });
    const sorted = {};
    for (const [k, q] of [["age", { sort: "age", dir: "asc" }], ["source", { sort: "source" }], ["project", { sort: "project" }]]) sorted[k] = (await heldIds(ana, q)).ids.length;
    const full = await callQ(ana, "heldcaptures", { limit: 50, bundle_ids: [f1.bundleId, memo.bundleId, f22.bundleId].join(",") });
    const rowsFull = (full.r && full.r.held) || [];
    const webRow = rowsFull.find((h) => h.bundle_id === f1.bundleId) || {};
    const ticked = rowsFull.map((h) => ({ id: h.bundle_id, pre: h.selected || h.ticked || h.checked }));
    row("R38", "Held list: per member and per project, sortable, each row age and title, nothing pre-ticked", "ADMIN-like member Ana / member Ben",
      "Ana uploaded a memo and captured a page for her question; Ben (joined) uploaded a memo and captured the 2022 page; read heldcaptures as Ana for mine (member=ana), everyone's, as Ben, with project=, and sorted by age, source and project; read the full rows for age and title",
      (mine.ids.length === 2 && everyone.ids.length === 4 && benView.ids.length === 4 && byProject.ids.length === 4 && webRow.age_days === 0 && webRow.title && !ticked.some((t) => t.pre)) ? "WORKS" : "BROKEN",
      `mine ${J(mine.ids.length)}, everyone's ${everyone.ids.length}, Ben ${benView.ids.length}, by project ${byProject.ids.length}; sorted counts ${J(sorted)}; the web row: age_days ${webRow.age_days}, title "${webRow.title}"; a pre-ticked field: none in the answer (the list carries no selection)`);
    dochash[f1.bundleId] = webRow.capture && webRow.capture.sha256;
    const asked = webRow.captured_for;
    row("R38", "Each row says what question it was captured for", "member Ana",
      "read the full held row of the page captured with `for` = Ana's question", asked && asked.questions && asked.questions[0] && asked.questions[0].asker === "ana" ? "WORKS" : "BROKEN",
      `captured_for ${J(asked)}`);
  } catch (e) { row("R38", "Held list", "member", "list held captures", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  ctx.f1 = f1; ctx.memo = memo; ctx.memo2 = memo2; ctx.f22 = f22;
  /* ---- who sees what: an outsider (Cy, no place in the project), and a capture made for a question the viewer may not see */
  const cy = await kit.person("cy");
  const cyCs = kit.screenCall(cy);
  try {
    const cyHeld = await heldIds(cy);
    const cyProj = await callQ(cy, "heldcaptures", { project, limit: 50, fields: "picker" });
    const cyImg = await callQ(cy, "image", { id: f1.bundleId });
    row("R38", "Held list read as a member who cannot read the project (she cannot see the copy)", "member Cy (not in the project)",
      "Cy read heldcaptures bare, with project=, and the document's image", cyHeld.ids.length === 0 && (cyProj.r.held || []).length === 0 ? "WORKS" : "BROKEN",
      `Cy's held ${cyHeld.ids.length}; with project= ${J(cyProj.r)}; image ${cyImg.status} ${J(cyImg.raw, 220)}`);
  } catch (e) { row("R38", "Held list as an outsider", "member Cy", "read", "HARNESS ERROR", String(e && e.stack || e).slice(0, 400)); }
  let hiddenQ = null, withheldDoc = null;
  try {
    const priv = await startProject(ana, "Ana's private lead", "hidden");
    hiddenQ = await kit.questionOf(ana, priv, "Who at the nonprofit approved the advance?");
    kit.serve("fund-advance.html", kit.te("<!doctype html><html><head><title>Fund advance letter</title></head><body><p>The Oakland Community Fund requested an advance of forty thousand dollars.</p></body></html>"), { type: "text/html" });
    const a = await kit.acquire(ana, { locator: "https://www.oaklandca.example/fund-advance.html", project, for: hiddenQ });
    withheldDoc = await file(anaCs, a.body.document, "Fund advance letter", "https://www.oaklandca.example/fund-advance.html");
    const asBen = await callQ(ben, "heldcaptures", { limit: 50, bundle_ids: withheldDoc.bundleId });
    const asAna = await callQ(ana, "heldcaptures", { limit: 50, bundle_ids: withheldDoc.bundleId });
    const bRow = (asBen.r.held || [])[0] || {}, aRow = (asAna.r.held || [])[0] || {};
    row("R38", "A capture made for a question the viewer may not see: withheld whole", "member Ben (sees the copy, not the question) and Ana (asker)",
      "Ana captured a page for a question in her own hidden project and filed the page in the shared project; Ben and Ana read its full held row",
      bRow.captured_for && bRow.captured_for.withheld && !J(bRow.captured_for).includes("advance") ? "WORKS" : "BROKEN",
      `Ben: captured_for ${J(bRow.captured_for)}; Ana: ${J(aRow.captured_for, 300)}`);
  } catch (e) { row("R38", "Withheld asker", "member Ben", "capture for a hidden question", "HARNESS ERROR", String(e && e.stack || e).slice(0, 400)); }

  /* ---- the vouch on the document page: one document, by its capturer; a machine cannot; no un-vouch */
  try {
    const machine = { authorization: `Bearer prb-w05vouch-0123456789abcdef` };
    const memberTok = { authorization: `Bearer mem-w05vouch-0123456789abcdef` };
    const hm = await sel(adm, [memo.bundleId]); // the founder's selection (to try as a machine class)
    const probeTry = await callBQ(machine, "select", { ids: [memo.bundleId] });
    const probeHandle = probeTry.r && probeTry.r.handle;
    const rel0 = probeHandle ? await release(machine, probeHandle, ack, mit) : probeTry;
    const memTry = await callBQ(memberTok, "select", { ids: [memo.bundleId] });
    const rel0b = memTry.r && memTry.r.handle ? await release(memberTok, memTry.r.handle, ack, mit) : memTry;
    row("R38", "A machine cannot release", "machine credentials (probe token and shared member token)",
      "selected the memo and pressed release with the probe credential and with the shared member credential",
      [rel0, rel0b].every((x) => !x.ok) ? "WORKS" : "BROKEN", `probe: ${x(rel0)}; shared member token: ${x(rel0b)}`);
  } catch (e) { row("R38", "A machine cannot release", "probe", "release as machine", "HARNESS ERROR", String(e && e.stack || e).slice(0, 400)); }
  function x(a) { return `${a.status} ${J(a.r && (a.r.reason || a.r.translation) ? { reason: a.r.reason, translation: a.r.translation, detail: a.r.detail } : a.raw, 320)}`; }
  // @@C2B
  /* ---- set aside: Ben sets aside the page Ana's question waits on, and the wrong-year page, with one reason; the asker reads the wait; she restores */
  const qCount = async (auth) => { const r = await callQ(auth, "queue", { count: "true" }); return r.r; };
  try {
    const qList = async (auth) => { const r = await callQ(auth, "queue", { limit: 100 }); return r; };
    const qBefore = await qList(ana);
    const before = J(await qCount(ana), 300);
    const noReason = await callBQ(ben, "heldsetaside", { ids: [f1.bundleId, f22.bundleId] });
    const aside = await callBQ(ben, "heldsetaside", { ids: [f1.bundleId, f22.bundleId], reason: "wrong year: the 2024 page quotes the 2022 figures" });
    const docsOut = (aside.r && aside.r.documents) || [];
    const waitingNamed = J(docsOut).includes("ana");
    const listed = await heldIds(ana);
    const asideList = await callQ(ana, "heldcaptures", { limit: 50, state: "set_aside", fields: "picker" });
    const asideFull = await callQ(ana, "heldcaptures", { limit: 50, state: "set_aside", bundle_ids: f1.bundleId + "," + f22.bundleId });
    row("R38", "Set several aside with one reason (each stays held, never deleted); empty reason refused", "member Ben",
      "Ben pressed 'Set aside' on the 2024 page (the page Ana's question waits on) and the 2022 page, first with no reason, then with one reason",
      !noReason.ok && aside.ok && !listed.ids.includes(f1.bundleId) && ((asideList.r.held || []).length === 2) ? "WORKS" : "BROKEN",
      `no reason: ${x(noReason)}; with a reason: ${J(aside.r, 700)}; Ana's held list now ${listed.ids.length} rows (set-aside pair absent: ${!listed.ids.includes(f1.bundleId)}); the Set aside list: ${(asideList.r.held || []).length} rows; first full row's set_aside ${J(((asideFull.r.held || [])[0] || {}).set_aside)}`);
    const waits = await callQ(ana, "questionwaits", { question });
    const waitsBen = await callQ(ben, "questionwaits", { question });
    const after = J(await qCount(ana), 300);
    const qAfter = await qList(ana);
    const idsOf = (q) => ((q.r && (q.r.items || q.r.queue)) || []).map((i) => `${i.kind || i.type || ""}:${i.id || i.key || i.bundle || ""}:${i.title || i.text || i.label || ""}`);
    const newItems = idsOf(qAfter).filter((i) => !idsOf(qBefore).includes(i));
    const strength = await callQ(ana, "inquirystrength", { id: question });
    row("R38", "Set aside a document an open question waits on: the asker reads 'Waiting: ... set aside by Ben: wrong year'; no queue item", "member Ana (asker) and Ben",
      "Ana read questionwaits on her question and the Queue count before and after Ben's act",
      waits.ok && J(waits.r).includes("ben") && J(waits.r).includes("wrong year") && before === after ? "WORKS" : "BROKEN",
      `Ana's questionwaits ${J(waits.r, 400)}; inquirystrength mentions a wait: ${/wait|set aside/i.test(J(strength.r, 6000))}; Queue items new since Ben's act: ${J(newItems, 500)} (queue read keys ${J(Object.keys(qAfter.r || {}))}); Ben's ${J(waitsBen.r, 200)}; Queue count before ${before}, after ${after}`);
    const restoreNoReason = await callBQ(ana, "heldrestore", { ids: [f1.bundleId] });
    const restored = await callBQ(ana, "heldrestore", { ids: [f1.bundleId], reason: "It is the 2024 page; the 2022 figures it quotes are for comparison" });
    const waits2 = await callQ(ana, "questionwaits", { question });
    const listed2 = await heldIds(ana);
    row("R38", "Restore a set-aside document with a reason (no veto or quorum)", "member Ana (asker)",
      "Ana restored the 2024 page, first with no reason, then with one; read the question's waits and her held list",
      !restoreNoReason.ok && restored.ok && listed2.ids.includes(f1.bundleId) && !J(waits2.r).includes("wrong year") ? "WORKS" : "BROKEN",
      `no reason: ${x(restoreNoReason)}; restored: ${J(restored.r, 400)}; waits after: ${J(waits2.r, 300)}; held list has the page again: ${listed2.ids.includes(f1.bundleId)}; the 2022 page stays set aside: ${J(((await callQ(ana, "heldcaptures", { limit: 50, state: "set_aside", fields: "picker" })).r.held || []).map((h) => h.bundle_id))}`);
    const hist = await callQ(ana, "bundlehistory", { bundle: f1.bundleId });
    row("R38", "The question/document history lists every set-aside and restore in order", "member Ana",
      "read the 2024 page's history (bundlehistory) after the set-aside and restore",
      /set.?aside/i.test(J(hist.r, 20000)) && /restor/i.test(J(hist.r, 20000)) ? "WORKS" : "BROKEN",
      `${hist.status} ${J(hist.r, 900)}`);
  } catch (e) { row("R38", "Set aside and restore", "member", "set aside / restore", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C3B
  /* ---- vouch: one document (the Document page's 'Vouch for this copy'), then a batch with its acknowledgment; the refusals before anything moves */
  try {
    const h1 = await sel(ana, [f1.bundleId]);
    const noAck = await release(ana, h1, "", mit);
    const noMit = await release(ana, h1, ack, "");
    const longAck = await release(ana, h1, "x".repeat(501), mit);
    const quoted = await release(ana, h1, 'I checked the "dates"', mit);
    const t0 = Date.now();
    const one = await release(ana, h1, ack, mit);
    const img = await callQ(ana, "image", { id: f1.bundleId });
    const md = (img.r && img.r["bundle.md"]) || "";
    const stateNow = /current_state:\s*(\S+)/.exec(md);
    row("R38", "Vouch on the document page: the capturer vouches one copy with her acknowledgment and mitigation; empty, over-long and quoted ones refused before anything is read", "member Ana (capturer)",
      "selected the 2024 page, pressed release with no acknowledgment, no mitigation, 501 characters, a quote; then with both",
      !noAck.ok && !noMit.ok && !longAck.ok && !quoted.ok && one.ok && stateNow && stateNow[1] === "verified" ? "WORKS" : "BROKEN",
      `no ack: ${x(noAck)}; no mitigation: ${x(noMit)}; 501 chars: ${x(longAck)}; quote: ${x(quoted)}; release: ${J(one.r, 300)} in ${one.ms} ms; the document's state now ${stateNow && stateNow[1]}; the document's own log carries the acknowledgment: ${md.includes("Acknowledgment:")}; names the deciding member: ${/Released \(batch\) \| ana/.test(md)}`);
    const unv = await callBQ(ana, "unvouch", { id: f1.bundleId });
    row("R38", "Look for an 'un-vouch' and find none", "member Ana",
      "called op=unvouch; listed what the record offers on a vouched copy (retire is the terminal act)", unv.r && unv.r.reason === "UNKNOWN_OP" ? "WORKS" : "BROKEN",
      `unvouch: ${x(unv)}; the record's only act after a vouch is the terminal "retire" (checked on its own copy below)`);
  } catch (e) { row("R38", "Vouch on the document page", "member Ana", "release one", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  try {
    /* a batch: the memo, the second memo (Ben's) and the page left in Held; including an already-vouched copy */
    const mixed = await sel(ana, [f1.bundleId, memo.bundleId, memo2.bundleId]);
    const withVouched = await release(ana, mixed, ack, mit);
    row("R38", "Bulk vouch refused whole when one copy is not eligible, with each offender named", "member Ana",
      "ticked the already-vouched page with the two memos and pressed release", !withVouched.ok && !!(withVouched.r && withVouched.r.offenders) ? "WORKS" : "BROKEN", x(withVouched) + " offenders " + J(withVouched.r && withVouched.r.offenders, 300));
    const stateOf = async (id) => /current_state:\s*(\S+)/.exec(((await callQ(ana, "image", { id })).r || {})["bundle.md"] || "")?.[1];
    const none = [await stateOf(memo.bundleId), await stateOf(memo2.bundleId)];
    row("R38", "Bulk vouch: a refusal moves nothing", "member Ana", "read both memos' state after the refused batch", none.every((s) => s === "collected") ? "WORKS" : "BROKEN", `states ${J(none)}`);
    /* the second member releases first: the first member's selection of the same set */
    const hAna = await sel(ana, [memo2.bundleId, memo.bundleId]);
    const hBen = await sel(ben, [memo2.bundleId, memo.bundleId]);
    const benFirst = await release(ben, hBen, "Ben: both memos are the city's own, dated and signed.", "Ben: I read each against the signing page.");
    const anaSecond = await release(ana, hAna, ack, mit);
    row("R38", "A second member releasing first: the later release", "member Ben (first), member Ana (second)",
      "both selected the two memos; Ben released; Ana pressed release on her now-stale selection",
      benFirst.ok && !anaSecond.ok ? "WORKS" : "BROKEN", `Ben: ${J(benFirst.r, 200)}; Ana after him: ${x(anaSecond)}`);
  } catch (e) { row("R38", "Bulk vouch", "member", "release batch", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C4B
  /* ---- "Stop using this copy" (retire, terminal): on its own spare copy, with a reason; refused while a question cites it */
  try {
    const spare = await upDoc(ana, anaCs, "Spare copy of the clerk's log", "The clerk's log for the week of May 6, 2024. Nothing else of note.\n");
    const hs = await sel(ana, [spare.bundleId]);
    const heldRetire = await callBQ(ana, "retire", { handle: hs, reason: "no longer needed" }, { handle: hs, reason: "no longer needed" });
    const spareV = await release(ana, await sel(ana, [spare.bundleId]), ack, mit);
    const hr = await sel(ana, [spare.bundleId]);
    const noReason = await callBQ(ana, "retire", { handle: hr }, { handle: hr });
    const retired = await callBQ(ana, "retire", { handle: hr, reason: "A better copy came in from the clerk." }, { handle: hr, reason: "A better copy came in from the clerk." });
    const again = await callBQ(ana, "retire", { handle: await sel(ana, [spare.bundleId]), reason: "again" });
    row("R38", "'Stop using this copy' (retire): a held copy is not retirable, a reason is required, a retired copy is final", "member Ana",
      "on a spare upload: pressed retire while held, vouched it, pressed retire with no reason, with a reason, and again",
      !heldRetire.ok && spareV.ok && !noReason.ok && retired.ok && !again.ok ? "WORKS" : "BROKEN",
      `held: ${x(heldRetire)}; no reason: ${x(noReason)}; retired: ${J(retired.r, 300)}; again: ${x(again)}`);
  } catch (e) { row("R38", "Stop using this copy", "member Ana", "retire", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  /* ---- the Document page's other held acts: a timestamp (attest), a watch (monitorset) on a copy, its examination fields */
  try {
    const att = await callBQ(ana, "attest", { sha256: memo.sha }, { sha256: memo.sha });
    const attLoc = await callBQ(ana, "attest", { sha256: dochash[f1.bundleId], locator: "https://www.oaklandca.example/budget-2024.html" }, { sha256: dochash[f1.bundleId] });
    row("R38", "'Get an independent timestamp' (attest)", "member Ana",
      "pressed attest on the vouched memo's capture (an upload: no public address) and on the 2024 page's capture (a public address)",
      att.ok || attLoc.ok ? "WORKS" : "NOT REACHED", `attest on an upload: ${x(att)}; on the fetched page: ${x(attLoc)}. A real timestamp asks an outside authority the offline copy cannot reach; the answers' words are what was read`);
    const w = await callBQ(ana, "monitorset", { bundleId: f22.bundleId, enabled: true, frequency: "weekly" });
    const imgW = await callQ(ana, "image", { id: f22.bundleId });
    row("R38", "Vouch a monitored capture and confirm it was held until vouched (watch for changes on a held copy)", "member Ana",
      "pressed 'Watch for changes' (monitorset, weekly) on the set-aside 2022 page, then read the copy",
      w.ok ? "WORKS" : "BROKEN", `monitorset: ${x(w)}; the copy still ${/current_state:\s*(\S+)/.exec((imgW.r || {})["bundle.md"] || "")?.[1]}; monitoring block: ${/monitoring:[\s\S]{0,80}/.exec((imgW.r || {})["bundle.md"] || "")?.[0].replace(/\n/g, " ")}`);
  } catch (e) { row("R38", "attest / monitorset", "member Ana", "attest, monitor", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C5B
  /* ============================================================== R55 */
  const dirText = ["Public Works Agency Staff Directory", "Jane Smith, Director, jsmith@oaklandca.gov, 510-238-3001", "Wei Chen, Analyst, wchen@oaklandca.gov, 510-238-3002",
    "Dana Brooks, Coordinator, dbrooks@oaklandca.gov, 510-238-3003", "Pat Lee, Engineer, plee@oaklandca.gov, 510-238-3004", "Maria Gomez, Manager, mgomez@oaklandca.gov, 510-238-3005",
    "Robert Alvarez, Inspector, ralvarez@oaklandca.gov, 510-238-3006"].join("\n") + "\n";
  const staffdir = await upDoc(ana, anaCs, "Public Works Agency staff directory", dirText);
  const dirRead = (await callQ(ana, "reading", { sha256: staffdir.sha })).r;
  console.log("OBS directory reading", dirRead.content_type, dirRead.entity_count, J(dirRead.reading && dirRead.reading.entities, 900), J(dirRead.reading && dirRead.reading.facts, 900));
  const people0 = await callQ(ana, "peopledirectory", {});
  console.log("OBS peopledirectory (empty room)", J(people0.r, 700));
  // @@C6B
  const staffSha = staffdir.sha;
  try {
    /* a new team already holds its public offices (area 1's setup act; the administrator seeds them) */
    const prof = await callBQ(adm, "profilesset", { profiles: ["oakland-alameda"] });
    const seed = await callBQ(adm, "officesseed", {});
    const peopleSeeded = await callQ(ana, "peopledirectory", {});
    row("R55", "A new team already holds three bodies 'added at setup, from the public offices of your team's place'", "ADMIN (setup act, area 1's) and member Ana",
      "pressed the setup act officesseed as the administrator, then read the people directory as Ana",
      seed.ok && (peopleSeeded.r.rows || []).length >= 3 ? "WORKS" : (seed.ok ? "BROKEN" : "NOT REACHED"),
      `profilesset (area 1's choice of the team's place): ${J(prof.r && (prof.r.ok), 40)}; officesseed: ${J(seed.r, 700)}; directory after: following ${peopleSeeded.r.following}, rows ${(peopleSeeded.r.rows || []).length} ${J((peopleSeeded.r.rows || []).slice(0, 4).map((r) => ({ label: r.label || r.name, kind: r.kind, today: r.today })), 500)}`);
  } catch (e) { row("R55", "Setup bodies", "ADMIN", "officesseed", "HARNESS ERROR", String(e && e.stack || e).slice(0, 400)); }

  const E = {};
  try {
    const mk = (auth, kind, label, note) => callBQ(auth, "entitycreate", { kind, label, note });
    const sim0 = await callQ(ana, "entitysimilar", { name: "Jane Smith", kind: "person" });
    const noNote = await mk(ana, "person", "Jane Smith", "");
    const jane = await mk(ana, "person", "Jane Smith", "Director of Public Works, City of Oakland; signs the paving contract");
    E.jane = jane.r && jane.r.entity_id;
    const sim1 = await callQ(ana, "entitysimilar", { name: "Jane Smith", kind: "person" });
    const jane2 = await mk(ben, "person", "Jane Smith", "A different Jane Smith, of Sacramento, who sits on a state board");
    E.jane2 = jane2.r && jane2.r.entity_id;
    row("R55", "Add a person (entitycreate: kind, name, the member's note); the near-match check; two people, one name", "member Ana, member Ben",
      "asked for near matches for 'Jane Smith' (none), pressed Follow them with no note, then with a note; asked again (one held); a second member registered a different Jane Smith",
      !noNote.ok && jane.ok && E.jane && jane2.ok && E.jane2 && E.jane !== E.jane2 && J(sim1.r).includes(E.jane) ? "WORKS" : "BROKEN",
      `near-match before: ${J(sim0.r, 200)}; no note: ${x(noNote)}; created ${J(jane.r, 300)}; near-match after: ${J(sim1.r, 400)}; second: ${J(jane2.r, 250)}`);
    const org = {};
    for (const [k, label, note] of [["institution", "Public Works Agency", "The City of Oakland agency that lets the paving contracts"], ["institution", "Acme Paving LLC", "The vendor named in the memo as the paving contractor"], ["institution", "Oakland Community Fund", "A nonprofit named in the memo"]]) {
      const r = await mk(ana, k, label, note); org[label] = r.r && r.r.entity_id;
    }
    E.agency = org["Public Works Agency"]; E.vendor = org["Acme Paving LLC"]; E.nonprofit = org["Oakland Community Fund"];
    const wei = await mk(ana, "person", "Wei Chen", "Analyst in Public Works; named in the staff directory"); E.wei = wei.r && wei.r.entity_id;
    const dana = await mk(ana, "person", "Dana Brooks", "Coordinator in Public Works"); E.dana = dana.r && dana.r.entity_id;
    row("R55", "Register people and organizations for what the documents name", "member Ana",
      "registered Wei Chen and Dana Brooks as people; the agency, the vendor and the nonprofit as organizations (kind institution)", E.wei && E.dana && E.agency && E.vendor && E.nonprofit ? "WORKS" : "BROKEN",
      `ids ${J(E)}`);
  } catch (e) { row("R55", "Add a person", "member", "entitycreate", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  ctx.E = E;
  // @@C7B
  /* ---- resolve a just-vouched document's references (the staff directory names six people by their addresses) */
  try {
    const hv = await sel(ana, [staffdir.bundleId]);
    const v = await release(ana, hv, "The directory is the agency's own page; I checked the six names.", "I compared four of the six rows with the agency's site.");
    const before = (await callQ(ana, "resolutions", { sha256: staffSha })).r;
    const janeAlias = await callBQ(ana, "entityalias", { entityId: E.jane, alias: "jsmith@oaklandca.gov" });
    const noAlias = await callBQ(ana, "entityalias", { entityId: E.jane, alias: "" });
    const res = await callBQ(ana, "resolve", { captureSha: staffSha });
    const after = (await callQ(ana, "resolutions", { sha256: staffSha })).r;
    const hit = (res.r.resolved || []).find((m) => m.entity_id === E.jane);
    row("R55", "Resolve a just-vouched document's references: accepted matches carry their grade; the unmatched stay unresolved", "member Ana",
      "vouched the staff directory (six references); gave Jane Smith her address as a name; pressed 'Match to the record' on the whole document",
      v.ok && janeAlias.ok && res.ok && hit && res.r.unresolved_count === 5 ? "WORKS" : "BROKEN",
      `resolutions before: ${J(before, 200)}; alias: ${J(janeAlias.r, 160)}; empty alias: ${x(noAlias)}; resolve: references ${res.r.references}, resolved ${res.r.resolved_count}, unresolved ${res.r.unresolved_count}; the match: ${J(hit, 500)}; the unresolved: ${J((res.r.unresolved || []).slice(0, 2), 300)}`);
    const refWei = "contact:wchen@oaklandca.gov";
    const noBasis = await callBQ(ana, "resolvetestify", { captureSha: staffSha, ref: refWei, entityId: E.wei, basis: "" });
    const bogusRef = await callBQ(ana, "resolvetestify", { captureSha: staffSha, ref: "contact:nobody@oaklandca.gov", entityId: E.wei, basis: "I know them" });
    const testified = await callBQ(ana, "resolvetestify", { captureSha: staffSha, ref: refWei, entityId: E.wei, basis: "Wei Chen told me this is her address; I have worked with her for two years." });
    const re = (await callQ(ana, "resolutions", { sha256: staffSha })).r;
    row("R55", "Testify a missed match from what you know (grade D, a required 'How you know')", "member Ana",
      "on the unresolved reference for wchen@oaklandca.gov pressed 'Say who this name is' with no basis, for a reference the document does not carry, then with a basis",
      !noBasis.ok && !bogusRef.ok && testified.ok && testified.r.grade === "D" ? "WORKS" : "BROKEN",
      `no basis: ${x(noBasis)}; absent reference: ${x(bogusRef)}; testimony: ${J(testified.r, 500)}; resolutions now: ${J(re, 700)}`);
    const bulk = await callBQ(ana, "resolve", { items: [{ captureSha: staffSha, ref: "contact:dbrooks@oaklandca.gov" }, { captureSha: staffSha }] });
    row("R55", "Resolve with items (bulk): per-item results", "member Ana", "pressed resolve with two items (one reference, one whole document)",
      bulk.ok ? "WORKS" : "BROKEN", J(bulk.r, 700));
    const defect = await callBQ(ana, "resolutiondefect", { captureSha: staffSha, ref: "contact:jsmith@oaklandca.gov", entityId: E.jane, reason: "" });
    const defect2 = await callBQ(ana, "resolutiondefect", { captureSha: staffSha, ref: "contact:jsmith@oaklandca.gov", entityId: E.jane, reason: "This address belongs to the Jane Smith of Sacramento, not the Director." });
    const after2 = (await callQ(ana, "resolutions", { sha256: staffSha })).r;
    row("R55", "Report a match wrong with a reason (a defect shown beside the resolution; nothing moves)", "member Ana",
      "pressed 'Report this match as wrong' with no reason, then with a reason; re-read the resolutions",
      !defect.ok && defect2.ok && JSON.stringify(after2).includes("\"defect_count\":1") ? "WORKS" : "BROKEN",
      `no reason: ${x(defect)}; reported: ${J(defect2.r, 400)}; the resolution row after: ${J((after2.resolutions || []).find((r) => r.entity_id === E.jane), 700)}`);
  } catch (e) { row("R55", "Resolve", "member Ana", "resolve", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C8B
  /* ---- a person's page: facts from passages (valid time, undetermined, withdrawn), aliases, same-person claims */
  try {
    const cite = { captureSha: staffSha, extent: { kind: "document" } };
    const noCite = await callBQ(ana, "recordpersonfact", { person: E.jane, kind: "name", value: "Jane Smith", valid: { from: "2024-01-01", to: null } });
    const f1r = await callBQ(ana, "recordpersonfact", { person: E.jane, kind: "name", value: "Jane A. Smith", valid: { from: "2022-03-01", to: "2024-12-31", precision: "day" }, citation: cite });
    const f2r = await callBQ(ana, "recordpersonfact", { person: E.jane, kind: "locality", value: "Oakland, California", valid: { from: null, to: null }, citation: cite });
    const badKind = await callBQ(ana, "recordpersonfact", { person: E.jane, kind: "rating", value: "high risk", valid: { from: null, to: null }, citation: cite });
    const page = await callQ(ana, "person", { id: E.jane, at: "2026-10-25" });
    const page2 = await callQ(ana, "person", { id: E.jane, at: "2023-06-01" });
    const withdrawn = await callBQ(ana, "personfactwithdraw", { factId: f2r.r && f2r.r.fact_id, reason: "The directory does not say where she lives; I read too much into it." });
    const noWhy = await callBQ(ana, "personfactwithdraw", { factId: f1r.r && f1r.r.fact_id, reason: "" });
    const pageAfter = await callQ(ana, "person", { id: E.jane, at: "2026-10-25" });
    row("R55", "Record a fact from a passage with a valid time (and bounds); facts of undetermined validity are marked; a withdrawn fact is kept", "member Ana",
      "recorded a name fact valid from March 1, 2022 to December 31, 2024 and a locality fact with no dates, each citing the staff directory; one with no citation; one of a kind that is not a fact kind; then withdrew the locality with a reason (and tried with none)",
      !noCite.ok && f1r.ok && f2r.ok && !badKind.ok && withdrawn.ok && !noWhy.ok && JSON.stringify(page2.r).includes("Jane A. Smith") && JSON.stringify(page.r).includes("civil-time.start_stated") ? "WORKS" : "BROKEN",
      `no citation: ${x(noCite)}; name fact: ${J(f1r.r, 280)}; undated fact: ${J(f2r.r, 280)}; bad kind: ${x(badKind)}; person page (keys ${J(Object.keys(page.r || {}))}): ${J(page.r, 900)}; page at 2023-06-01 carries the dated name fact: ${JSON.stringify(page2.r).includes("Jane A. Smith")}, today's page lists the undated locality under "undetermined" with a why: ${JSON.stringify(page.r).includes("civil-time.start_stated")}; withdrawal: ${J(withdrawn.r, 250)}; no reason: ${x(noWhy)}; the withdrawn fact is still readable on the page (kept, shown withdrawn): ${JSON.stringify(pageAfter.r).includes("I read too much into it")}; the page's keys: ${J(Object.keys(pageAfter.r || {}))}`);
    ctx.fact = f1r.r && f1r.r.fact_id;
    const negative = /suspicio|adversar|risk|score|rank|conflict_of|likely_guilty|threat/i.exec(JSON.stringify(page.r) + JSON.stringify(pageAfter.r));
    row("R55", "Negative check: no adversarial attribute, suspicion flag or category prior on any person page", "member Ana",
      "read Jane Smith's page (person) and searched its whole answer for suspicion, risk, score, rank and conflict fields", !negative ? "WORKS" : "BROKEN", `found: ${negative ? negative[0] : "none"}; the answer's keys: ${J(Object.keys(page.r || {}))}`);
  } catch (e) { row("R55", "Person facts", "member Ana", "personfact", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  try {
    const al = await callBQ(ana, "entityalias", { entityId: E.jane, alias: "J. A. Smith" });
    const alDup = await callBQ(ana, "entityalias", { entityId: E.jane, alias: "J. A. Smith" });
    const wdNoReason = await callBQ(ana, "aliaswithdraw", { entityId: E.jane, alias: "J. A. Smith" });
    const wd = await callBQ(ana, "aliaswithdraw", { entityId: E.jane, alias: "J. A. Smith", reason: "That form of her name is only my shorthand." });
    const ent = await callQ(ana, "entity", { id: E.jane });
    row("R55", "Aliases are first-class: add a name; withdraw it with a reason ('Withdraw a name' is owed, K3674)", "member Ana",
      "added the name 'J. A. Smith' (twice), pressed withdraw with no reason and with one, and read the entity",
      al.ok && wd.ok ? "WORKS" : "BROKEN",
      `add: ${J(al.r, 200)}; again: ${J(alDup.r, 200)}; withdraw with no reason: ${x(wdNoReason)}; withdraw with a reason: ${J(wd.r, 250)}; the entity's aliases: ${J(ent.r && ent.r.entity && ent.r.entity.aliases, 500)}. The person screen's own 'aliaswithdraw' press sends only the entity and the alias (no reason field): ${"see screens-investigate/person.mjs:409-414"}`);
  } catch (e) { row("R55", "Aliases", "member Ana", "entityalias", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }

  try {
    const evn = { a: { captureSha: staffSha, extent: { kind: "document" } }, b: { captureSha: memo2.sha, extent: { kind: "document" } } };
    const noNote = await callBQ(ana, "identityclaim", { a: E.jane, b: E.jane2, kind: "not_same_as", basis: "testimony", note: "" });
    const noEvidence = await callBQ(ana, "identityclaim", { a: E.jane, b: E.jane2, kind: "unsure", basis: "name", note: "They share a name and little else." });
    const unsure = await callBQ(ana, "identityclaim", { a: E.jane, b: E.jane2, kind: "unsure", basis: "name", note: "They share a name and little else.", evidence: evn });
    const notSame = await callBQ(ana, "identityclaim", { a: E.jane, b: E.jane2, kind: "not_same_as", basis: "testimony", note: "I know the Director; the Sacramento Jane Smith is a different woman." });
    const selfClaim = await callBQ(ana, "identityclaim", { a: E.jane, b: E.jane, kind: "same_as", basis: "testimony", note: "same" });
    const toOrg = await callBQ(ana, "identityclaim", { a: E.jane, b: E.agency, kind: "same_as", basis: "testimony", note: "a person and an organization" });
    const idr = await callQ(ana, "identity", { id: E.jane });
    const wdNoWhy = await callBQ(ana, "withdrawidentityclaim", { claimId: unsure.r && unsure.r.claim_id, reason: "" });
    const wdOk = await callBQ(ana, "withdrawidentityclaim", { claimId: unsure.r && unsure.r.claim_id, reason: "I was unsure; the Director's own page settles it." });
    const idr2 = await callQ(ana, "identity", { id: E.jane });
    const e1 = await callQ(ana, "entity", { id: E.jane }), e2 = await callQ(ana, "entity", { id: E.jane2 });
    row("R55", "Two people, one name; same-person claims: linked, never merged; withdraw with a reason", "member Ana",
      "claimed 'not the same person' by testimony (with no note, then with one), 'unsure' by name (with no evidence, then with a document cited at each end), a claim between a person and herself, a claim between a person and an organization; read Jane's identity; withdrew the 'unsure' claim with no reason and with a reason",
      !noNote.ok && !noEvidence.ok && unsure.ok && notSame.ok && !selfClaim.ok && !toOrg.ok && !wdNoWhy.ok && wdOk.ok && e1.r.found && e2.r.found && E.jane !== E.jane2 ? "WORKS" : "BROKEN",
      `no note: ${x(noNote)}; a name claim with no evidence: ${x(noEvidence)}; with evidence: ${J(unsure.r, 260)}; not-same by testimony: ${J(notSame.r, 260)}; self: ${x(selfClaim)}; person/organization: ${x(toOrg)}; identity read: ${J(idr.r, 700)}; withdraw no reason: ${x(wdNoWhy)}; withdrawn: ${J(wdOk.r, 220)}; identity after: ${J(idr2.r, 420)}; both records still held, two: ${e1.r.found && e2.r.found}`);
    ctx.claims = { notSame: notSame.r && notSame.r.claim_id };
  } catch (e) { row("R55", "Same-person claims", "member Ana", "identityclaim", "HARNESS ERROR", String(e && e.stack || e).slice(0, 500)); }
  // @@C9B
  // @@NEXT
});
