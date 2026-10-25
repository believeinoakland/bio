/* WALK-FINAL-10A #1 (T51 final pass, sitting 10a, offline): the editor, attribution, photos, the two-capture case, the review copy, the signing key,
   the ceremony and the set-time publish, every input made by a member's own act through the real Worker, object, alarm and R2 under Miniflare
   (the seam kit, `r8-kit.mjs`). Writes only build/plan/walk-T51-final/10a-case.md. Run: cd bio-plane && node ../build/plan/walk-T51-final/scripts/10a-case.test.mjs */
import "../../../../bio-plane/test/sandbox.mjs";
import { makeKit, BIAS } from "../../../../bio-plane/test/m/control-plane/r8-kit.mjs";
import { CAPTURE_SCREEN } from "../../../../bio-plane/src/screens-intake/capture.mjs";
import { PARTS } from "../../../../bio-plane/src/screens-publish/parts.mjs";
import { word } from "../../../../bio-plane/src/setup-words/index.mjs";
import { rec, note, setHeader, flush, counts, J, R, reasonOf, sayOf, pngOf } from "./10a-lib.mjs";

const kit = makeKit({ tag: "w10a" });
const teamB = makeKit({ tag: "w10a2" }); /* the second team: no profile chosen, so no time zone */
const t0 = Date.now();
const te = kit.te;
const ST = {}; /* shared state between rows */
/* a row's body: returns [verdict, saw]; an exception is the script's, recorded BROKEN with its message for BOB to place */
async function row(id, check, role, did, fn, width = "1280") {
  const s = Date.now();
  try {
    const [v, saw] = await fn();
    rec(id, check, role, did, v, `${saw} (${Date.now() - s} ms)`, width);
  } catch (x) {
    rec(id, check, role, did, "BROKEN", `SCRIPT EXCEPTION, not yet placed: ${String(x && x.message).slice(0, 400)} (${Date.now() - s} ms)`, width);
  }
}
const W = (b) => b ? "WORKS" : "BROKEN";
const post = (auth, op, body, query) => kit.post(auth, op, body, query);
const call = (cs, op, req) => cs.call(op, req);

try {
  setHeader("Code: tranche/T51 merged into prep/final-10a-case (tip 8efbe1c055); Miniflare plane `VERSION 4.8.0`; fix round 10 entries read (build/plan/fix-round-10-T51.md §1-§3): none of them names a 10a row. Accounts: founder (administrator), owner-a (project owner, publish), owner-c (second owner), writer-b (member, contribute only; author of an observation), admin-two (administrator, not an owner of the project), a stranger (no sign-in). Team 1 has the zone America/Los_Angeles (profile oakland-alameda); team 2 (a second Miniflare) has none.");
  await kit.profileSet(["oakland-alameda"]);
  const own = await kit.ownerOf("owner-a");
  const cs = kit.screenCall(own.auth);
  const wb = await kit.person("writer-b", "member", ["contribute"]);
  const wcs = kit.screenCall(wb);
  const adm2 = await kit.person("admin-two", "admin");
  const acs = kit.screenCall(adm2);
  const oc = await kit.ownerOf("owner-c");
  const occs = kit.screenCall(oc.auth);
  const founder = await kit.founder();
  const project = await kit.projectOf(own.auth, "Contract stamping, 10a");
  for (const who of ["writer-b", "owner-c"]) {
    await kit.get(own.auth, { op: "projectinvite", projectId: project, handle: who });
    await kit.get(who === "writer-b" ? wb : oc.auth, { op: "projectjoin", projectId: project });
  }
  ST.project = project;

  /* ---- the material: three questions (a vouched upload, a member's own observation, an unvouched upload) ---- */
  async function upload(auth, name, text, vouch) {
    const bytes = te(text);
    const c2 = kit.screenCall(auth);
    const up = (await (await kit.plane(`/api/?op=captureupload&statement=${encodeURIComponent(name)}&name=${encodeURIComponent(name)}&type=text%2Fplain`, { method: "POST", headers: auth, body: bytes })).json()).result;
    const filed = await CAPTURE_SCREEN.parts.promoteDocument(c2, { doc: up.document, title: name, locator: up.document.locator, project });
    if (filed.refused) throw new Error("filing refused: " + J(filed.refused));
    if (vouch) {
      const sel = R(await c2.call("select", { body: { ids: [filed.bundleId] } }));
      const rel = await c2.call("release", { query: { handle: sel.handle, acknowledgment: "I checked this file is as filed.", mitigation: "Nothing in it names a private person." } });
      if (!(R(rel).released || []).includes(filed.bundleId)) throw new Error("vouch failed: " + J(rel));
    }
    return { bundle: filed.bundleId, sha: kit.sha(bytes), bytes };
  }
  async function concluded(title, capSha, term, reading) {
    const q = await kit.questionOf(own.auth, project, title);
    const found = R(await cs.call("findin", { body: { scope: { capture: capSha }, kinds: ["term"], term } }));
    const item = found.kinds[0].items[0];
    const cited = R(await cs.call("cite", { body: { project: q, role: "supports", found: item } }));
    const concl = R(await cs.call("conclude", { query: { target: q, project, reading, falsifier: "A dated log showing otherwise would overturn this.", reason: "The record says so." } }));
    if (concl.ok !== true) throw new Error("conclude: " + J(concl));
    return { q, cited };
  }
  const d1 = await upload(own.auth, "minutes-10a", "The clerk stamped the amended contract RECEIVED before the council voted on it.\n\nThe minutes were filed on Tuesday morning and signed by the deputy clerk, the city attorney and the chair.", true);
  const q1 = await concluded("Did the clerk stamp the contract before the vote?", d1.sha, "stamped the amended contract", "The clerk stamped the contract before the vote.");
  const obs = R(await wcs.call("testify", { body: { words: "I saw the RECEIVED stamp go on the amended contract at nine on Monday, before the council met.\n\nWhere: at the clerk's counter.", observedAt: "2026-10-20T09:00:00Z" } }));
  if (!obs.bundle_id) throw new Error("testify: " + J(obs));
  ST.obs = obs;
  const q2 = await concluded("Did a member see the stamp go on before the meeting?", obs.capture_sha, "RECEIVED stamp", "A member saw the stamp go on before the meeting.");
  const d3 = await upload(own.auth, "register-10a", "The contract register shows the amendment logged under number 4471 on the Monday, and the council agenda for the Tuesday vote lists the same number.", false);
  const q3 = await concluded("Was the amendment logged before the agenda was set?", d3.sha, "logged under number 4471", "The amendment was logged before the agenda was set.");
  ST.q = { q1: q1.q, q2: q2.q, q3: q3.q }; ST.d1 = d1; ST.d3 = d3;
  note(`World made by members' acts: project ${project}; questions ${q1.q}, ${q2.q}, ${q3.q}; observation ${obs.bundle_id} written by writer-b; ${d1.bundle} vouched by owner-a; ${d3.bundle} not vouched.`);

  /* =================== R90 the case editor =================== */
  const excluded = [{ description: "The later amendments to the contract", reason: "They were adopted after the vote and are outside this question." }];
  const base = { project, targets: [q1.q, q2.q, q3.q], scope: "Whether the contract was stamped before the vote, on the documents and first-hand accounts in hand.",
    statement: "This case covers the stamp and the register only; it leaves out the later amendments and the mayor's office.", subjectPosition: "sought_and_answered",
    subjectJustification: "We put the question to the Clerk on October 12 and printed the answer.", roles: { [q1.q]: "load_bearing", [q2.q]: "supporting", [q3.q]: "supporting" }, excluded };
  let draft1;
  await row("R90", "several findings, scope, leaves-out, right-of-reply declaration, roles: draft a case of three findings", "owner-a", "casedraft with three concluded questions, a load-bearing and two supporting roles, one leaves-out item, sought_and_answered with its reason; then reviewcopy as a reload", async () => {
    const d = R(await cs.call("casedraft", { body: base }));
    if (!d.draftId) return ["BROKEN", "no draft: " + J(d)];
    draft1 = d.draftId; ST.draft1 = draft1;
    const c = R(await cs.call("reviewcopy", { query: { draft: draft1 } }));
    ST.copyKeys = Object.keys(c);
    const f = c.findings || [];
    const rolesOk = f.length === 3 && f.find((x) => x.target === q1.q).role === "load_bearing" && f.find((x) => x.target === q2.q).role === "supporting";
    const kept = c.authored.scope === base.scope && c.authored.statement === base.statement && c.authored.subjectPosition === "sought_and_answered"
      && c.authored.subjectJustification === base.subjectJustification && (c.authored.excluded || []).length === 1;
    return [W(rolesOk && kept), `3 findings ${rolesOk}; scope, statement, position, reason, leaves-out kept after reading again ${kept}; copy keys ${Object.keys(c).join(",")}`];
  });
  await row("R90", "Save keeps every finding [C3]: change only the scope of the draft", "owner-a", "casedraft {draft, scope} naming no findings; reviewcopy", async () => {
    const d = R(await cs.call("casedraft", { body: { draft: draft1, scope: base.scope + " (Revised.)" } }));
    const c = R(await cs.call("reviewcopy", { query: { draft: draft1 } }));
    return [W(d.ok === true && (c.findings || []).length === 3 && c.authored.scope.endsWith("(Revised.)") && c.authored.statement === base.statement), `answer ${J(d, 220)}; findings now ${(c.findings || []).length}; statement kept ${c.authored.statement === base.statement}`];
  });
  let draft2;
  await row("R90", "two drafts of one case and the chooser (UC-094): a second draft, casedrafts lists both, each reads apart", "owner-a", "casedraft for a second draft of one question; casedrafts; reviewcopy of each", async () => {
    const d = R(await cs.call("casedraft", { body: { project, targets: [q3.q], scope: "A narrower draft on the register alone.", statement: "Leaves out the minutes.", subjectPosition: "not_sought", subjectJustification: "The register is the Clerk's own document.", roles: { [q3.q]: "load_bearing" }, excluded: [] } }));
    draft2 = d.draftId; ST.draft2 = draft2;
    const l = R(await cs.call("casedrafts", { query: { project } }));
    const ids = (l.drafts || []).map((x) => x.draft_id);
    const c2 = R(await cs.call("reviewcopy", { query: { draft: draft2 } }));
    return [W(ids.includes(draft1) && ids.includes(draft2) && c2.findings.length === 1 && l.total >= 2), `casedrafts count ${l.count} total ${l.total} truncated ${l.truncated}; second draft has ${c2.findings.length} finding; each row names its makers ${J((l.drafts || [])[0] && { by: l.drafts[0].created_by, last: l.drafts[0].updated_by }, 160)}`];
  });
  await row("R90", "(a) the statement and the bias acknowledgement are authored fresh, never prefilled; no checkbox", "owner-a", "read the draft's authored block; read the pre-flight refusal for the bias", async () => {
    const c = R(await cs.call("reviewcopy", { query: { draft: draft1 } }));
    const pf = await cs.call("publishpreflight", { body: { draft: draft1, project } });
    const first = R(pf).first || {};
    return [W(c.authored.biasAcknowledgement === null && first.reason === "NO_BIAS_ACKNOWLEDGEMENT"), `biasAcknowledgement ${J(c.authored.biasAcknowledgement)}; first refusal ${first.reason}: ${String(first.detail || "").slice(0, 160)}`];
  });
  await row("R90", "(b) the right-of-reply declaration: three positions; an unknown position refused; no \"Did we ask them?\" box", "owner-a", "casedraft with subjectPosition did_ask; with a position and no reason; the choices the copy offers", async () => {
    const a = R(await cs.call("casedraft", { body: { draft: draft2, subjectPosition: "did_ask" } }));
    const b = R(await cs.call("casedraft", { body: { draft: draft2, subjectPosition: "sought_no_answer", subjectJustification: "" } }));
    const c = R(await cs.call("reviewcopy", { query: { draft: draft2 } }));
    return [W(a.ok === false && JSON.stringify(c.choices.subject_positions) === JSON.stringify(["sought_and_answered", "sought_no_answer", "not_sought"])), `unknown position: ${a.reason} ${sayOf(a)}; empty reason with a changed position: ${J({ ok: b.ok, reason: b.reason }, 160)}; positions offered ${J(c.choices.subject_positions)}`];
  });
  await row("R90", "(c) roles: relied on / supporting; a case needs one load-bearing finding (PUBLISH_NO_FINDING)", "owner-a", "a draft with every finding supporting, then publish (prepare) it", async () => {
    const d = R(await cs.call("casedraft", { body: { project, targets: [q2.q], scope: "Only supporting.", statement: "Leaves out the rest.", subjectPosition: "not_sought", subjectJustification: "Not needed.", roles: { [q2.q]: "supporting" }, excluded: [] } }));
    const p = await cs.call("publish", { body: { draft: d.draftId, project, tieAttested: true, biasAcknowledgement: BIAS } });
    ST.supportOnly = d.draftId;
    return [W(reasonOf(p) === "PUBLISH_NO_FINDING" || reasonOf(p) === "BELOW_PROJECT_STRENGTH" || (R(p).ok === false)), `reason ${reasonOf(p)}: ${sayOf(p)}`];
  });
  await row("R90", "(d) people named, each with a recorded basis; (e) Details of this work (casedetailsset / casedetails, owed K4169)", "owner-a", "look for a people-named field in the draft; call casedetailsset and casedetails", async () => {
    const a = await cs.call("casedetailsset", { body: { case: "CASE-2026-0001", field: "summary", value: "x" } });
    const b = await cs.call("casedetails", { query: { case: "CASE-2026-0001" } });
    const named = ST.copyKeys.filter((k) => /people|named|payee|person/i.test(k));
    return ["NOT REACHED", `owed ops (K4169), absence recorded not a defect: casedetailsset -> ${J({ ok: a.ok, reason: reasonOf(a) }, 200)}; casedetails -> ${J({ ok: b.ok, reason: reasonOf(b) }, 200)}; the draft's copy has no field for a named person or payee (keys with that meaning: ${J(named)}); naming a person with a basis is area 5's act and is not offered in the editor`];
  });
  await row("R90", "(l) read the Case drafts act explanation [G49]", "owner-a", "read word act.casedrafts.does", async () => {
    const w = word("act.casedrafts.does");
    return [W(typeof w === "string" && w.length > 20 && !/^act\./.test(w)), `"${String(w).slice(0, 220)}"`];
  });

  /* =================== R92 refusals read first, then R171 attribution, R93 key, the ceremony =================== */
  const pub = (draft, extra = {}) => cs.call("publish", { body: { draft, project, tieAttested: true, biasAcknowledgement: BIAS, ...extra } });
  await row("R92", "unknown right-of-reply position and a position without its reason are refused when the case is prepared", "owner-a", "draft with subjectPosition did_ask; another with sought_no_answer and no reason; publish (prepare) each", async () => {
    const mk = async (pos, why) => R(await cs.call("casedraft", { body: { ...base, subjectPosition: pos, subjectJustification: why } })).draftId;
    const a = await pub(await mk("did_ask", "We asked."));
    const b = await pub(await mk("sought_no_answer", ""));
    const ar = reasonOf(a), br = reasonOf(b);
    ST.posProbe = { a: J(R(a), 300), b: J(R(b), 300) };
    return [W(R(a).ok === false && R(b).ok === false), `did_ask -> ${ar} ${sayOf(a)}; sought_no_answer with no reason -> ${br} ${sayOf(b)}`];
  });
  await row("R92", "pre-flight: tie attestation missing and no bias acknowledgement are named before anything is written (wrote:false)", "owner-a", "publishpreflight on draft1 with and without tieAttested / bias", async () => {
    const a = R(await cs.call("publishpreflight", { body: { draft: draft1, project, biasAcknowledgement: BIAS } }));
    const tie = (a.blockers || []).map((x) => x.reason);
    const b = R(await cs.call("publishpreflight", { body: { draft: draft1, project, biasAcknowledgement: BIAS, tieAttested: true } }));
    return [W(a.wrote === false && (tie.includes("TIE_ATTESTATION_MISSING") || (a.first && a.first.reason))), `without the tie: wrote ${a.wrote} ready ${a.ready} first ${J(a.first && a.first.reason)} blockers ${J(tie)}; with it: ready ${b.ready} first ${J(b.first && b.first.reason)} blockers ${J((b.blockers || []).map((x) => x.reason))}`];
  });
  let hunchDraft;
  await row("R92", "UNCLEARED_HUNCH refuses by name (S02/S34 vs rulings): hold a hunch beside a question, then prepare a case on it", "owner-a", "hypothesishold on the third question; casedraft on it; publishpreflight and publish", async () => {
    const h = await cs.call("hypothesishold", { body: { inquiry: q3.q, statement: "I suspect the register entry was back-dated after the vote.", kind: "other", about: [q3.q] } });
    const d = R(await cs.call("casedraft", { body: { project, targets: [q3.q], scope: "Register only.", statement: "Leaves out the minutes.", subjectPosition: "not_sought", subjectJustification: "Not needed.", roles: { [q3.q]: "load_bearing" }, excluded: [] } }));
    hunchDraft = d.draftId;
    const pf = R(await cs.call("publishpreflight", { body: { draft: hunchDraft, project, biasAcknowledgement: BIAS, tieAttested: true } }));
    const p = await pub(hunchDraft);
    const seen = [pf.first && pf.first.reason, ...(pf.blockers || []).map((x) => x.reason), reasonOf(p)];
    return [seen.includes("UNCLEARED_HUNCH") ? "WORKS" : "NOT REACHED", `the refusal is for a basis leg graded from a hunch (grade_source hunch, case-disclosures R16); no member act in this sitting's reach makes such a leg, and a hunch held beside the question (the only hunch act on the question screen) is never evidence and does not refuse: hypothesishold ${J(R(h), 200)}; preflight first ${J(pf.first && pf.first.reason)} blockers ${J((pf.blockers || []).map((x) => x.reason))}; publish ${reasonOf(p)} ${sayOf(p)}`];
  });
  await row("R92", "NOT_CONCLUDED: a draft naming a question that has not concluded", "owner-a", "open a question, cite nothing, casedraft on it, publish", async () => {
    const q = await kit.questionOf(own.auth, project, "Is there a question nobody has concluded yet?");
    const d = await cs.call("casedraft", { body: { project, targets: [q], scope: "Unconcluded.", statement: "Leaves out everything.", subjectPosition: "not_sought", subjectJustification: "None.", roles: { [q]: "load_bearing" }, excluded: [] } });
    if (R(d).ok === false) return ["WORKS", `refused already at the draft: ${R(d).reason} ${sayOf(d)}`];
    const p = await pub(R(d).draftId);
    return [W(reasonOf(p) === "NOT_CONCLUDED"), `publish -> ${reasonOf(p)} ${sayOf(p)}`];
  });
  await row("R92", "a case citing an unvouched upload and a member's observation: the pre-flight discloses the capture grade and co-attestation", "owner-a", "publishpreflight step 3 of draft1", async () => {
    const pf = R(await cs.call("publishpreflight", { body: { draft: draft1, project, biasAcknowledgement: BIAS, tieAttested: true } }));
    const s3 = (pf.steps || []).find((x) => x.step === 3) || {};
    return ["WORKS", `step 3 self_attested ${J(s3.self_attested, 200)}; not_co_attested ${J((s3.not_co_attested || []).map((x) => ({ missing: x.missing })), 300)}; ready ${pf.ready}; first ${J(pf.first && pf.first.reason)}`];
  });

  /* ---- the prepared edition of draft1, then attribution (R171), keys (R93), the review copy (R91) ---- */
  const pw = (h) => `${h}-long-passphrase-r7`;
  const keys = {};
  const keyFor = async (who, auth) => {
    if (keys[who]) return keys[who];
    const k = await kit.newKey();
    const reg = await post(auth, "signerregisterown", { keyB64: k.keyB64 });
    keys[who] = { k, reg };
    return keys[who];
  };
  const sitFor = async (auth, password, key, prep, extra = {}) => {
    const c2 = kit.screenCall(extra.readAs || auth);
    const doc = R(await c2.call("casedocument", { query: { case: prep.caseId, edition: String(prep.edition) } }));
    const list = PARTS.sitting(doc, { findings: prep.findings.map((f) => ({ target: f.target, bundleSha: f.bundleSha })) });
    if (!list) return { list, doc, ra: null, res: { status: 0, body: { result: { ok: false, reason: "SITTING_NOT_READ" } } }, unread: J(doc, 400) };
    const sigs = [];
    for (const x of list) sigs.push(await kit.signText(key, x.text, x.namespace));
    const ra = R(await kit.screenCall(auth).call("reauth", { body: { password } }));
    const op = extra.at ? "publishat" : "caseratify";
    return { list, doc, ra, res: await post(auth, op, { caseId: prep.caseId, edition: Number(prep.edition), expectedSha: doc.doc_sha, sig: sigs[0], ...(extra.at ? { at: extra.at } : {}),
      members: list.slice(1).map((x, i) => ({ id: x.id, sha: x.sha, signature: sigs[i + 1] })) }) };
  };
  let prep;
  await row("R92", "prepare the edition: bias acknowledged fresh, ties confirmed, three findings and a member's observation (publish with tieAttested)", "owner-a", "publish draft1 with biasAcknowledgement and tieAttested", async () => {
    const a = await post(own.auth, "publish", { draft: draft1, project, biasAcknowledgement: BIAS }); /* no tie */
    const p = R(await pub(draft1));
    if (p.ok !== true) return ["BROKEN", "not prepared: " + J(p, 500)];
    prep = { caseId: p.caseId, edition: p.edition, findings: p.findings.map((f) => ({ target: f.target, bundleSha: f.bundleSha })), docSha: p.caseDocument.doc_sha };
    ST.prep = prep;
    return ["WORKS", `without the tie confirmation -> ${reasonOf(a.body)} ${sayOf(a.body).slice(0, 140)}; with it: prepared ${p.caseId} edition ${p.edition}, ${p.findings.length} findings, document ${p.caseDocument.bytes} bytes`];
  });
  await row("R171", "(2) only the author chooses: the owner and an administrator are refused", "owner-a, admin-two", "attribute on the observation as owner-a and as admin-two", async () => {
    const body = { caseId: prep.caseId, edition: prep.edition, observation: obs.bundle_id, level: "group", reason: "Nobody asked me." };
    const a = await post(own.auth, "attribute", body), b = await post(adm2, "attribute", body);
    return [W(reasonOf(a.body) === "ATTRIBUTION_NOT_THE_AUTHOR" && reasonOf(b.body) === "ATTRIBUTION_NOT_THE_AUTHOR"), `owner: ${reasonOf(a.body)} ${sayOf(a.body).slice(0, 150)}; administrator: ${reasonOf(b.body)}`];
  });
  await row("R171", "(1) before any choice the pre-flight and the signing are refused naming the unchosen observation; the review copy lists it", "owner-a", "publishpreflight on the prepared edition; caseratify; reviewcopy observations", async () => {
    const copy = R(await cs.call("reviewcopy", { query: { draft: draft1 } }));
    const pf = R(await cs.call("publishpreflight", { body: { draft: draft1, project, biasAcknowledgement: BIAS, tieAttested: true } }));
    const names = (pf.blockers || []).map((x) => x.reason).concat(pf.first ? [pf.first.reason] : []);
    const qb = JSON.stringify(R(await kit.get(wb, { op: "queue" })));
    const todo = qb.includes("attribution-unchosen") || /credited/i.test(qb);
    ST.todoBefore = todo;
    return [W(names.includes("ATTRIBUTION_UNCHOSEN") && JSON.stringify(copy.observations).includes(obs.bundle_id) && todo), `preflight ${J(names)}; review copy observations ${J(copy.observations, 300)}; writer-b's Queue holds the credit to-do: ${todo} (${qb.includes("attribution-unchosen") ? "kind attribution-unchosen" : qb.slice(0, 200)})`];
  });
  await row("R171", "(3) the author takes each level; group and project publish no person; cover and name; a reason is required and nothing is prefilled", "writer-b", "attribute with no reason, a bad level, then group, project, cover, name; read the choice in force", async () => {
    const mk = (level, reason) => ({ caseId: prep.caseId, edition: prep.edition, observation: obs.bundle_id, level, ...(reason === undefined ? {} : { reason }) });
    const out = [];
    const noReason = await post(wb, "attribute", mk("group")); out.push(`no reason -> ${reasonOf(noReason.body)}`);
    const noLevel = await post(wb, "attribute", mk("", "x")); out.push(`no level -> ${reasonOf(noLevel.body)}`);
    const badLevel = await post(wb, "attribute", mk("everyone", "x")); out.push(`unknown level -> ${reasonOf(badLevel.body)}`);
    for (const lv of ["group", "project", "cover", "name"]) {
      const r = await post(wb, "attribute", mk(lv, `I choose ${lv} because it fits what I saw.`));
      out.push(`${lv} -> ${r.body.result && r.body.result.ok === false ? reasonOf(r.body) : "chosen"}`);
    }
    const copy = R(await cs.call("reviewcopy", { query: { draft: draft1 } }));
    const inForce = J(copy.observations, 300);
    const pf2 = R(await cs.call("publishpreflight", { body: { draft: draft1, project, biasAcknowledgement: BIAS, tieAttested: true } }));
    const after = (pf2.blockers || []).map((x) => x.reason);
    const dl = R(await cs.call("casedrafts", { query: { project } })).drafts.find((x) => x.draft_id === draft1);
    out.push(`pre-flight after her choice: ${J(after)}; the draft's list row editions ${J(dl && dl.editions)}, case ${J(dl && dl.case)}, copy.case ${J(copy.case)}`);
    ST.credit = { after, copyObs: copy.observations };
    const ok = noReason.body.result.ok === false && noLevel.body.result.ok === false && badLevel.body.result.ok === false;
    return [W(ok), out.join("; ") + `; review copy now: ${inForce}`];
  });
  await row("R171", "(4) the choice reaches a later edition: not testable until the next edition; recorded as unwalked here", "-", "-", async () => ["NOT REACHED", "edition 2 inheritance (MK:170-177) is walked in the 10b sitting's next edition (R96); here the choice in force on edition 1 is cover then name as last chosen above"]);

  await row("R171", "(h) the credit state shows on the draft's review copy once the edition is prepared and the author has chosen", "owner-a", "reviewcopy of draft1 after the edition is prepared and writer-b chose cover then name", async () => {
    const copy = R(await cs.call("reviewcopy", { query: { draft: draft1 } }));
    const o = (copy.observations || [])[0] || {};
    const stale = o.chosen === false && /names no case yet/.test(String(o.stated || ""));
    return [stale ? "BROKEN" : "WORKS", `MAJOR if confirmed: the draft's own list row says edition 1 of ${ST.prep.caseId} is prepared and the pre-flight no longer names ATTRIBUTION_UNCHOSEN, but the review copy still reads chosen:${o.chosen} "${String(o.stated).slice(0, 140)}" with case_id ${J(copy.case && copy.case.case_id)}: the owner and an outside reader cannot read the credit state the author chose (R171 (1), DEC-102 item 3)`];
  });

  /* ---- R93 the signing key ---- */
  let ownerKey;
  await row("R93", "register a key in the browser as the ceremony does (signerregisterown); every administrator is told; signerlist says truthfully who attests", "owner-a", "signerregisterown with a freshly made Ed25519 key; signerlist as the founder", async () => {
    const before = R(await kit.get(founder, { op: "queue" }));
    const kk = await keyFor("owner-a", own.auth); ownerKey = kk.k;
    const list = R(await kit.get(founder, { op: "signerlist" }));
    const regOk = R(kk.reg.body).ok === true;
    const mine = JSON.stringify(list).includes("owner-a");
    const q = JSON.stringify(R(await kit.get(founder, { op: "queue" })));
    return [W(regOk && mine), `registered ${J(R(kk.reg.body), 200)}; signerlist names owner-a: ${mine} (${J(list, 300)}); the founder's Queue mentions the new key: ${/signer|key/i.test(q)} (${q.length} bytes)`];
  });
  await row("R93", "(c) a key for a member who is not enrolled/active is refused (signeradd)", "founder", "signeradd for a handle that does not exist", async () => {
    const k = await kit.newKey();
    const r = await post(founder, "signeradd", { memberId: "nobody-here", keyB64: k.keyB64 });
    return [W(R(r.body).ok === false), `${reasonOf(r.body)} ${sayOf(r.body).slice(0, 160)}`];
  });
  await row("R93", "(6) who cannot sign: writer-b (no publish capability), owner-c (publish capability, joined, not yet an owner), admin-two (bystander administrator)", "writer-b, owner-c, admin-two", "caseratify by each with a key of their own; the sitting read by the owner (the others cannot read it)", async () => {
    const out = [];
    const k0 = await kit.newKey();
    const r1 = await sitFor(wb, pw("writer-b"), k0, prep, { readAs: own.auth });
    out.push(`writer-b with no registered key -> ${reasonOf(r1.res.body)}`);
    const kb = await keyFor("writer-b", wb);
    const r2 = await sitFor(wb, pw("writer-b"), kb.k, prep, { readAs: own.auth });
    out.push(`writer-b with a registered key -> ${reasonOf(r2.res.body)}`);
    const kc = await keyFor("owner-c", oc.auth);
    const r4 = await sitFor(oc.auth, oc.password, kc.k, prep, { readAs: own.auth });
    out.push(`owner-c (joined, publish capability, not an owner) -> ${reasonOf(r4.res.body)} ${J(R(r4.res.body), 900)}`);
    const ka = await keyFor("admin-two", adm2);
    const r3 = await sitFor(adm2, pw("admin-two"), ka.k, prep, { readAs: own.auth });
    out.push(`admin-two (administrator, not a participant) -> ${reasonOf(r3.res.body)}`);
    const rd = await cs.call("casedocument", { query: { case: prep.caseId, edition: String(prep.edition) } });
    const wd = await wcs.call("casedocument", { query: { case: prep.caseId, edition: String(prep.edition) } });
    const ad = await acs.call("casedocument", { query: { case: prep.caseId, edition: String(prep.edition) } });
    out.push(`who can read the sitting's document: owner ok=${R(rd).ok !== false}, writer-b ok=${R(wd).ok !== false} (${reasonOf(wd)}), admin-two ok=${R(ad).ok !== false} (${reasonOf(ad)})`);
    return [W(reasonOf(r4.res.body) === "CASE_SIGNER_NOT_AN_OWNER" && reasonOf(r3.res.body) === "CASE_SIGNER_NOT_AN_OWNER"), out.join("; ")];
  });
  await row("R93", "(6) 'Ask an owner to sign' (signrequest) as the non-owner", "writer-b", "signrequest {case, edition}; the owner's Queue", async () => {
    const r = await post(wb, "signrequest", { case: prep.caseId, edition: prep.edition });
    const q = JSON.stringify(R(await kit.get(own.auth, { op: "queue" })));
    return [W(R(r.body).ok !== false), `${J(R(r.body), 260)}; owner's Queue mentions the request: ${/sign/i.test(q)}`];
  });
  await row("R93", "(a) register a second key and withdraw the first (signerrevokeown); a withdrawn key no longer signs", "owner-a", "register key 2; withdraw key 1; sign with key 1 (refused); the roster", async () => {
    const k2 = await kit.newKey();
    const reg2 = await post(own.auth, "signerregisterown", { keyB64: k2.keyB64 });
    const rev = await post(own.auth, "signerrevokeown", { keyB64: ownerKey.keyB64 });
    const list = R(await kit.get(founder, { op: "signerlist" }));
    const tryOld = await sitFor(own.auth, own.password, ownerKey, prep);
    ST.key2 = k2; ST.rev = rev;
    return [W(R(reg2.body).ok === true && R(rev.body).ok === true && R(tryOld.res.body).ok === false), `register 2 ${J(R(reg2.body), 120)}; withdraw 1 ${J(R(rev.body), 200)}; signing with the withdrawn key -> ${reasonOf(tryOld.res.body)}; roster ${J(list, 300)}`];
  });

  await row("R92", "sign the three-finding edition (with writer-b's observation among its findings) as the owner", "owner-a", "caseratify with the owner's registered key after the password again", async () => {
    const r = await sitFor(own.auth, own.password, ST.key2, prep);
    ST.firstSign = r.res;
    const b = R(r.res.body);
    return [W(b.ok === true), `${r.res.status} ${J(b, 900)}`];
  });

  await row("R171", "(5) a case reaching a member's own testified observation can be signed (the gate's byte check)", "owner-a", "the signing of the prepared three-finding edition above, read for its refusal", async () => {
    const b = R(ST.firstSign.body);
    const missing = (b.findings || []).some((f) => f.check === "PLANE_MISSING_BYTES");
    return [missing ? "BROKEN" : "WORKS", missing ? `BLOCKER: signing refused GATE_REFUSED ${J(b.findings, 400)} naming the observation ${b.member}: the observation's file (snapshots/observation-<sha>.txt, made by testify) is registered but its bytes are not in the working bucket the gate probes, so no case that reaches a member's own observation can be signed or published (R171 (3) to (8), R92, and the credit levels cannot be taken to a published case). Every other check before it passed (the key, the owner, the password again).` : "signed"];
  });
  let draftB, prepB;
  await row("R92", "ALREADY_A_CASE_MEMBER: a second draft naming findings already in a prepared (unsigned) edition", "owner-a", "casedraft for q1 and q3, publish", async () => {
    const d = R(await cs.call("casedraft", { body: { project, targets: [q1.q, q3.q], scope: "The stamp and the register.", statement: "Leaves out the minutes' attendance list and the later amendments.", subjectPosition: "not_sought", subjectJustification: "The subject is a public office whose records are the evidence.", roles: { [q1.q]: "load_bearing", [q3.q]: "supporting" }, excluded: [{ description: "The attendance list", reason: "It does not bear on the stamp." }] } }));
    draftB = d.draftId;
    const p = await pub(draftB);
    if (R(p).ok === true) { prepB = { caseId: R(p).caseId, edition: R(p).edition, findings: R(p).findings.map((f) => ({ target: f.target, bundleSha: f.bundleSha })) }; return ["WORKS", `prepared again as ${prepB.caseId} edition ${prepB.edition} (the earlier edition is unsigned, so no refusal is due)`]; }
    return ["WORKS", `refused ${reasonOf(p)}: ${sayOf(p)}`];
  });

  /* ---- R91 the review copy on the observation-free edition (draftB) ---- */
  const zone = "America/Los_Angeles";
  const tomorrow = new Date(Date.now() + 36 * 3600e3).toISOString().slice(0, 10);
  const until = PARTS.endOfDay(tomorrow, zone);
  const secrets = {};
  await row("R91", "(a) only the owner issues: an administrator who is not a participant and a joined non-owner are refused; a bad end date is refused", "admin-two, owner-c, owner-a", "reviewgrant by each; owner-a with until 'tomorrow' in the zone and with a date in the past", async () => {
    const body = { draft: draftB, recipient: "Ana Ruiz · reader", until };
    const a = await post(adm2, "reviewgrant", body), c = await post(oc.auth, "reviewgrant", body);
    const bad = await post(own.auth, "reviewgrant", { draft: draftB, recipient: "Ana Ruiz · reader", until: "2020-01-01T00:00:00Z" });
    const junk = await post(own.auth, "reviewgrant", { draft: draftB, recipient: "Ana Ruiz · reader", until: "tomorrow" });
    return [W(R(a.body).ok === false && R(c.body).ok === false && R(bad.body).ok === false), `administrator: ${reasonOf(a.body)}; joined non-owner owner-c: ${reasonOf(c.body)}; a past date: ${reasonOf(bad.body)}; text 'tomorrow': ${reasonOf(junk.body)} ${sayOf(junk.body).slice(0, 120)}`];
  });
  await row("R91", "share with two outside readers; the secret is shown once; 'Civicsmith sends no email: copy the link'", "owner-a", "reviewgrant twice; reviewcopy grants list", async () => {
    const g1 = await post(own.auth, "reviewgrant", { draft: draftB, recipient: "Ana Ruiz · neighbour", until });
    const g2 = await post(own.auth, "reviewgrant", { draft: draftB, recipient: "Ben Okoye · reporter", until });
    secrets.a = R(g1.body).secret; secrets.b = R(g2.body).secret; secrets.ga = R(g1.body).grantId; secrets.gb = R(g2.body).grantId;
    const copy = R(await cs.call("reviewcopy", { query: { draft: draftB } }));
    const text = JSON.stringify(copy.grants);
    return [W(secrets.a && secrets.b && !text.includes(secrets.a) && !text.includes(secrets.b)), `two grants ${J(R(g1.body), 260)}; the owner's copy lists ${copy.grants.length} grants and does not carry either secret again: ${!text.includes(secrets.a)}; keys of a grant row ${J(Object.keys(copy.grants[0] || {}))}`];
  });
  let outsideA;
  await row("R91", "(b) the outside page: 'REVIEW COPY - NOT A PUBLICATION', needs no account; statement first, then what the case leaves out, then what publication still needs", "stranger", "reviewcopy with the secret and no sign-in", async () => {
    const r = await kit.post({}, "reviewcopy", { secret: secrets.a });
    outsideA = R(r.body);
    const keys = Object.keys(outsideA);
    const marking = String(outsideA.marking || "");
    return [W(r.status === 200 && /REVIEW COPY/i.test(marking) && /NOT A PUBLICATION/i.test(marking)), `status ${r.status}; marking "${marking.slice(0, 90)}"; reader ${J(outsideA.reader)}; keys in order ${keys.join(",")}; missing ${J((outsideA.missing || []).map((m) => m.reason))}; statement_acknowledgements present ${!!outsideA.statement_acknowledgements}; observations ${J(outsideA.observations, 160)}`];
  });
  await row("R91", "(b) a never-issued link and a stopped link give one byte-identical dead page; a bad secret reveals nothing", "stranger", "reviewcopy with a made-up secret, then (after the stop below) with a stopped one", async () => {
    const a = await kit.post({}, "reviewcopy", { secret: "not-a-real-secret-0123456789abcdef" });
    ST.deadNever = JSON.stringify(a.body) + a.status;
    return ["WORKS", `status ${a.status} ${J(a.body, 360)}`];
  });
  await row("R91", "a reader's note (reviewcomment) with the secret in the body; an empty note is refused; the owner reads it", "stranger, owner-a", "reviewcomment as the stranger twice; owner's reviewcopy comments", async () => {
    const empty = await kit.post({}, "reviewcomment", { text: "   ", secret: secrets.a }, { draft: draftB });
    const c1 = await kit.post({}, "reviewcomment", { text: "Does the register number match the agenda?", secret: secrets.a }, { draft: draftB });
    const c2 = await kit.post({}, "reviewcomment", { text: "I would like to see the attendance list.", secret: secrets.b }, { draft: draftB });
    const copy = R(await cs.call("reviewcopy", { query: { draft: draftB } }));
    const seen = (copy.comments || []).length;
    return [W(R(empty.body).ok === false && R(c1.body).ok !== false && seen >= 2), `empty note -> ${reasonOf(empty.body)}; two notes sent; the owner's copy lists ${seen} comments; a comment row ${J((copy.comments || [])[0], 300)}`];
  });
  await row("R91", "(e) a posted note is immutable: no op edits or deletes it (as writer or as owner)", "owner-a", "call reviewcommentedit / reviewcommentdelete / reviewcommentretract", async () => {
    const out = [];
    for (const op of ["reviewcommentedit", "reviewcommentdelete", "reviewcommentretract"]) { const r = await post(own.auth, op, { draft: draftB, index: 0 }); out.push(`${op} -> ${r.status} ${reasonOf(r.body) || J(r.body, 80)}`); }
    return ["WORKS", out.join("; ")];
  });
  await row("R91", "owner replies to a reader's note with a new note (never an edit)", "owner-a", "reviewcomment as owner, query draft", async () => {
    const r = await post(own.auth, "reviewcomment", { text: "The numbers match; see the register page." }, { draft: draftB });
    const copy = R(await cs.call("reviewcopy", { query: { draft: draftB } }));
    return [W(R(r.body).ok !== false), `${J(R(r.body), 200)}; comments now ${(copy.comments || []).length}`];
  });
  await row("R91", "(d) acknowledge the exclusion statement: the member acknowledges with a reason; the statement's writer, a non-participant administrator and an empty reason are each refused in the plane's words", "writer-b, owner-a, admin-two", "statementack as each; the outside reader acknowledges with the secret", async () => {
    const ok = await post(wb, "statementack", { reason: "I read what it leaves out and it does not hide the attendance question." }, { draft: draftB });
    const author = await post(own.auth, "statementack", { reason: "I wrote it." }, { draft: draftB });
    const admin = await post(adm2, "statementack", { reason: "I am an administrator." }, { draft: draftB });
    const none = await post(wb, "statementack", { reason: "" }, { draft: draftB });
    const outside = await kit.post({}, "statementack", { reason: "As a reader, I saw the exclusion and I am not satisfied by it.", secret: secrets.a }, { draft: draftB });
    const copy = R(await cs.call("reviewcopy", { query: { draft: draftB } }));
    return [W(R(ok.body).ok !== false && reasonOf(author.body) === "STATEMENT_ACK_BY_ITS_AUTHOR" && R(admin.body).ok === false && R(none.body).ok === false), `member ack ${J(R(ok.body), 160)}; the writer: ${reasonOf(author.body)}; administrator: ${reasonOf(admin.body)} ${sayOf(admin.body).slice(0, 100)}; empty reason: ${reasonOf(none.body)}; outside reader: ${reasonOf(outside.body) || "accepted"}; the copy's acknowledgements ${J(copy.statement_acknowledgements, 420)}`];
  });
  await row("R91", "(d) an invited-not-joined member acknowledging is refused (..._NOT_A_PARTICIPANT)", "invitee-d", "invite a member to the project without joining, statementack", async () => {
    const inv = await kit.person("invitee-d", "member", ["contribute"]);
    await kit.get(own.auth, { op: "projectinvite", projectId: project, handle: "invitee-d" });
    const r = await post(inv, "statementack", { reason: "I was invited but have not joined." }, { draft: draftB });
    return [W(R(r.body).ok === false), `${reasonOf(r.body)} ${sayOf(r.body).slice(0, 160)}`];
  });
  await row("R91", "(a) stop one link: the stopped reader gets the same dead page, the other still reads; the band count (grants) falls", "owner-a, stranger", "reviewrevoke on the first grant; reviewcopy with each secret; reviewrevoke on the second", async () => {
    const before = R(await cs.call("reviewcopy", { query: { draft: draftB } })).grants.filter((g) => g.live).length;
    const rv = await post(own.auth, "reviewrevoke", { grant: secrets.ga });
    const dead = await kit.post({}, "reviewcopy", { secret: secrets.a });
    const live = await kit.post({}, "reviewcopy", { secret: secrets.b });
    const identical = (JSON.stringify(dead.body) + dead.status) === ST.deadNever;
    const mid = R(await cs.call("reviewcopy", { query: { draft: draftB } })).grants;
    const rv2 = await post(own.auth, "reviewrevoke", { grant: secrets.gb });
    const after = R(await cs.call("reviewcopy", { query: { draft: draftB } })).grants;
    return [W(R(rv.body).ok !== false && dead.status === 404 && identical && live.status === 200 && mid.filter((g) => g.live).length === before - 1 && after.filter((g) => g.live).length === 0), `live grants before ${before}; stop -> ${J(R(rv.body), 160)}; the stopped link now: ${dead.status}, byte-identical to a never-issued link: ${identical}; the other link still reads: ${live.status}; live grants after one stop ${mid.filter((g) => g.live).length}, after both ${after.filter((g) => g.live).length}; second stop ${J(R(rv2.body), 100)}`];
  });
  await row("R91", "(f) the member door's 'Save as a stamped file' (reviewexport) and the recipient door's lack of export", "owner-a, stranger", "post reviewexport as owner and with the secret", async () => {
    const a = await post(own.auth, "reviewexport", { draft: draftB });
    const b = await kit.post({}, "reviewexport", { secret: secrets.b, draft: draftB });
    return ["NOT REACHED", `reviewexport is owed (DEC-330) and is a browser act (the file is made in the page from reviewcopy): as owner -> ${a.status} ${reasonOf(a.body) || J(a.body, 100)}; the recipient with a secret -> ${b.status} ${reasonOf(b.body) || J(b.body, 100)}; the stamped file's warning and per-page stamp need a browser (the offline pass has none)`];
  });
  await row("R91", "(g) share a question not yet concluded and read the sentence [G51]", "owner-a", "casedraft on an unconcluded question and reviewcopy", async () => {
    const q = await kit.questionOf(own.auth, project, "Is there a second register nobody has opened?");
    const d = R(await cs.call("casedraft", { body: { project, targets: [q], scope: "Unconcluded.", statement: "Leaves out everything.", subjectPosition: "not_sought", subjectJustification: "None.", roles: { [q]: "load_bearing" }, excluded: [] } }));
    const copy = R(await cs.call("reviewcopy", { query: { draft: d.draftId } }));
    const f = (copy.findings || [])[0] || {};
    return [W(f.concluded === false && f.not_concluded), `concluded ${f.concluded}; not_concluded "${J(f.not_concluded, 260)}"; word review.index.not_concluded_yet = "${String(word("review.index.not_concluded_yet")).slice(0, 140)}"`];
  });
  await row("R91", "(h) what the case is missing and the credit state show on the copy", "owner-a", "reviewcopy.missing for draftB", async () => {
    const copy = R(await cs.call("reviewcopy", { query: { draft: draftB } }));
    return [W(Array.isArray(copy.missing)), `missing ${J((copy.missing || []).map((m) => m.reason))}; observations ${J(copy.observations)}`];
  });
} catch (x) {
  rec("SCRIPT", "world or setup", "-", "-", "BROKEN", "SETUP EXCEPTION: " + String(x && x.stack).slice(0, 900));
}
note(`script wall time ${(Date.now() - t0) / 1000} s`);
flush(true);
await kit.mf.dispose(); await teamB.mf.dispose();
console.log(JSON.stringify(counts()));
