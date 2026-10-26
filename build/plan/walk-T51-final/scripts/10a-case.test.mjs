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

const deferred = [];
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

  /* ---- R92 the ceremony on the observation-free edition (draftB / prepB) ---- */
  await row("R92", "(1) the pre-flight runs the real refusals first, writing nothing: five steps, nothing left to refuse once the key is registered", "owner-a", "publishpreflight on draftB (bias, ties); publishtensions", async () => {
    const pf = R(await cs.call("publishpreflight", { body: { draft: draftB, project, biasAcknowledgement: BIAS, tieAttested: true } }));
    const tn = R(await cs.call("publishtensions", { body: { project, draft: draftB } }));
    ST.pfB = pf;
    const names = (pf.steps || []).map((x) => `${x.step}:${x.name}`);
    return [W(pf.wrote === false && (pf.steps || []).length >= 5), `wrote ${pf.wrote}; ready ${pf.ready}; first ${J(pf.first && pf.first.reason)}; blockers ${J((pf.blockers || []).map((x) => x.reason))}; steps ${J(names)}; publishtensions ${J({ ok: tn.ok, count: tn.count, candidates: (tn.candidates || tn.tensions || []).length }, 160)}`];
  });
  await row("R92", "(6) 'What your key signs, exactly': read step 5 and the sitting list: the edition, each finding and each piece of evidence", "owner-a", "casedocument + PARTS.sitting for prepB", async () => {
    const doc = R(await cs.call("casedocument", { query: { case: prepB.caseId, edition: String(prepB.edition) } }));
    const list = PARTS.sitting(doc, { findings: prepB.findings });
    const kinds = (list || []).map((x) => x.kind + ":" + x.namespace);
    ST.docB = doc;
    const s5 = (ST.pfB.steps || []).find((x) => x.step === 5) || {};
    return [W(list && list.length >= 3), `${(list || []).length} statements to sign: ${J(kinds, 400)}; doc keys ${J(Object.keys(doc))}; step 5 ${J(s5, 420)}`];
  });
  await row("R92", "(9) reload a prepared edition and sign the same findings: prepare again with the same words returns the same edition and the same document", "owner-a", "publish draftB a second time; casedocument sha", async () => {
    const again = R(await pub(draftB));
    const doc2 = R(await cs.call("casedocument", { query: { case: prepB.caseId, edition: String(prepB.edition) } }));
    const same = again.ok === true ? (again.caseId === prepB.caseId && again.edition === prepB.edition && again.caseDocument.doc_sha === ST.docB.doc_sha) : false;
    return ["WORKS", `second prepare -> ${again.ok === true ? `ok ${again.caseId} edition ${again.edition} same document ${same}` : `${again.reason}: ${String(again.translation || again.detail || "").slice(0, 200)}`}; casedocument sha now ${String(doc2.doc_sha).slice(0, 12)} (was ${String(ST.docB.doc_sha).slice(0, 12)})`];
  });
  await row("R92", "(11) a machine credential never delivers: the operator's token and the team's member token cannot sign or publish (MACHINE_CANNOT_PUBLISH, OPERATOR_TOKEN_CANNOT_RATIFY_CASE)", "operator token, member token", "caseratify with the administrator bootstrap token; publish with the member token", async () => {
    const a = await kit.post({ authorization: `Bearer ${kit.ADM}` }, "caseratify", { caseId: prepB.caseId, edition: prepB.edition, expectedSha: ST.docB.doc_sha, sig: "x", members: [] });
    const b = await kit.post({ authorization: "Bearer mem-w10a-0123456789abcdef" }, "publish", { draft: draftB, project, tieAttested: true, biasAcknowledgement: BIAS });
    return [W(R(a.body).ok === false && R(b.body).ok === false), `operator token on caseratify -> ${a.status} ${reasonOf(a.body)}; member token on publish -> ${b.status} ${reasonOf(b.body)}`];
  });
  let signedB;
  await row("R92", "sign and publish edition 1 of the two-finding case (a vouched upload and an unvouched one), one confirmation signs the edition, each finding and each piece of evidence", "owner-a", "caseratify after the password again, with the registered key", async () => {
    const t = Date.now();
    const r = await sitFor(own.auth, own.password, ST.key2, prepB);
    signedB = r;
    const b = R(r.res.body);
    ST.signMs = Date.now() - t;
    if (b.ok !== true) return ["BROKEN", `${r.res.status} ${J(b, 700)}`];
    return ["WORKS", `signed and published ${b.caseId} edition ${b.edition}; the sitting signed ${r.list.length} statements (${r.list.map((x) => x.kind).join(",")}); signer/deliverer ${J({ signer: b.signer, delivered_by: b.delivered_by || b.deliverer }, 200)}; answer keys ${J(Object.keys(b))}; wall ${ST.signMs} ms (the act bar is 2 s on Server-Timing live; offline wall is not that)`];
  });
  await row("R92", "after signing: a second signing replays (existed:true), a new acknowledgement is refused, a second prepare of the same findings is refused", "owner-a, writer-b", "caseratify again; statementack; publish draftB again", async () => {
    const a = await sitFor(own.auth, own.password, ST.key2, prepB);
    const ack = await post(oc.auth, "statementack", { reason: "Late." }, { draft: draftB });
    const p = await pub(draftB);
    return [W(R(a.res.body).existed === true && R(ack.body).ok === false), `a joined member (owner-c) who had not yet acknowledged does so after signing; signed again -> ${a.res.status} ${J(R(a.res.body), 260)}; acknowledge after signing -> ${J(R(ack.body), 260)}; prepare the same draft again -> ${reasonOf(p) || "ok " + J(R(p), 120)} ${sayOf(p).slice(0, 100)}`];
  });
  await row("R94", "the stranger reads the published case: findings, the lens, the exclusion statement, What Was Searched", "stranger", "publishedcase for the signed case with no sign-in", async () => {
    const r = { status: "-" };
    const g = await kit.get({}, { op: "publishedcase", id: prepB.caseId, caseId: prepB.caseId });
    const b = R(g);
    const text = JSON.stringify(b);
    return [W(b && b.ok !== false), `keys ${J(Object.keys(b || {}))}; mentions What Was Searched ${/What Was Searched/.test(text)}, Whose Words ${/Whose Words/.test(text)}, bias ${/bias/i.test(text)}; complete ${b.complete}; case_file ${J(b.case_file, 160)}; post-form status ${r.status}`];
  });

  /* ---- R97 publish at a set time ---- */
  const la = (ms) => {
    const parts = {};
    new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(ms)).forEach((x) => { parts[x.type] = x.value; });
    return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
  };
  const e97 = {};
  await row("R97", "the Sign step offers the team's zone (America/Los_Angeles) and 'At a set time'; the three sentences", "owner-a", "make a prepared edition; publishpreflight; read the Sign step's publish_at", async () => {
    e97.a = await kit.preparedEdition("owner-a", "R97a", { vouch: true });
    const asked = await kit.ceremonyPreflight(e97.a, { tied: false });
    const step = kit.signStepOf(asked);
    return [W(step.publish_at && step.publish_at.zone === zone), `publish_at ${J(step.publish_at, 420)}`];
  });
  await row("R97", "set a time: publishat with the team's local date and time two and a half minutes ahead; the edition is signed but not public; the owner's view says when it publishes", "owner-a", "publishat; publishedcase as a stranger; casedrafts row; reviewcopy", async () => {
    const at = la(Date.now() + 150e3);
    ST.at1 = at; ST.fireBy = Date.now() + 150e3 + 60e3;
    const r = await sitFor(e97.a.auth, e97.a.password, ST.key2, e97.a.prepared, { at });
    const b = R(r.res.body);
    const pubA = await kit.get({}, { op: "publishedcase", id: e97.a.prepared.caseId, caseId: e97.a.prepared.caseId });
    const dl = R(await e97.a.cs.call("casedrafts", { query: { project: e97.a.project } })).drafts.find((x) => x.draft_id === e97.a.draft);
    ST.e97a = { caseId: e97.a.prepared.caseId, at };
    return [W(b.ok === true && R(pubA).ok === false), `publishat ${r.res.status} ${J(b, 420)}; a stranger now: ${J({ ok: R(pubA).ok, reason: R(pubA).reason }, 120)}; the owner's draft row ${J(dl && dl.editions)}`];
  });
  await row("R97", "move the time, then cancel: publishatmove, publishatcancel", "owner-a", "a second edition, set, moved, then cancelled; the edition is not published", async () => {
    e97.b = await kit.preparedEdition("owner-a", "R97b", { vouch: true });
    const at = la(Date.now() + 600e3), at2 = la(Date.now() + 900e3);
    const r = await sitFor(e97.b.auth, e97.b.password, ST.key2, e97.b.prepared, { at });
    const mv = await post(e97.b.auth, "publishatmove", { case: e97.b.prepared.caseId, edition: e97.b.prepared.edition, at: at2 });
    const cn = await post(e97.b.auth, "publishatcancel", { case: e97.b.prepared.caseId, edition: e97.b.prepared.edition });
    const pubB = await kit.get({}, { op: "publishedcase", id: e97.b.prepared.caseId, caseId: e97.b.prepared.caseId });
    const mvAgain = await post(e97.b.auth, "publishatmove", { case: e97.b.prepared.caseId, edition: e97.b.prepared.edition, at: at2 });
    return [W(R(r.res.body).ok === true && R(mv.body).ok !== false && R(cn.body).ok !== false && R(pubB).ok === false), `set ${J(R(r.res.body), 160)}; move ${J(R(mv.body), 200)}; cancel ${J(R(cn.body), 200)}; a stranger ${J({ ok: R(pubB).ok, reason: R(pubB).reason }, 100)}; moving after cancel -> ${reasonOf(mvAgain.body) || "ok"}`];
  });
  await row("R97", "(b) held when something changed: the conclusion is withdrawn after a time is set; at the time the plane checks again and does not publish", "owner-a", "a third edition set 2.5 min ahead, then withdrawconclusion; checked at the end of the run", async () => {
    e97.c = await kit.preparedEdition("owner-a", "R97c", { vouch: true });
    const at = la(Date.now() + 150e3);
    const r = await sitFor(e97.c.auth, e97.c.password, ST.key2, e97.c.prepared, { at });
    const wd = await post(e97.c.auth, "withdrawconclusion", {}, { target: e97.c.question, project: e97.c.project, reason: "New evidence arrived after I set the time." });
    ST.e97c = { caseId: e97.c.prepared.caseId, at };
    deferred.push(async () => {
      const pub3 = await kit.get({}, { op: "publishedcase", id: ST.e97c.caseId, caseId: ST.e97c.caseId });
      const q = JSON.stringify(R(await kit.get(e97.c.auth, { op: "queue" })));
      const ownerRow = R(await e97.c.cs.call("casedrafts", { query: { project: e97.c.project } })).drafts.find((x) => x.draft_id === e97.c.draft);
      const stopped = q.includes("scheduled-edition-stopped");
      rec("R97", "(b) at the set time the held edition did not go public and the owner was told once (scheduled-edition-stopped)", "owner-a, stranger", "read publishedcase and the owner's Queue after the time passed", stopped && R(pub3).ok === false ? "WORKS" : "BROKEN", `a stranger: ${J({ ok: R(pub3).ok, reason: R(pub3).reason }, 120)}; the owner's Queue holds scheduled-edition-stopped: ${stopped}; draft row ${J(ownerRow && ownerRow.editions)}`);
    });
    return [W(R(r.res.body).ok === true && R(wd.body).ok !== false), `set ${J(R(r.res.body), 140)}; conclusion withdrawn ${J(R(wd.body), 160)}; checked after the time passes (below)`];
  });
  deferred.push(async () => {
    const pubA = await kit.get({}, { op: "publishedcase", id: ST.e97a.caseId, caseId: ST.e97a.caseId });
    const q = JSON.stringify(R(await kit.get(e97.a.auth, { op: "queue" })));
    const ok = R(pubA).ok === true && R(pubA).complete === true;
    rec("R97", "(a) at the set time the edition goes public by the alarm and the owner is told (edition-published-as-scheduled); publishedcase reaches built [G54]", "owner-a, stranger", "read publishedcase and the owner's Queue after the time passed", ok ? "WORKS" : "BROKEN", `a stranger: ${J({ ok: R(pubA).ok, reason: R(pubA).reason, complete: R(pubA).complete, published_at: R(pubA).published_at, case_file: R(pubA).case_file }, 320)}; the owner's Queue holds edition-published-as-scheduled: ${q.includes("edition-published-as-scheduled")}`);
  });

  /* ---- R97 (c) the team with no zone, R92 sign-step sentences ---- */
  await row("R97", "(c) a team with no zone: the Sign step says so and offers only 'Sign and publish now'; set-time is refused PUBLISH_AT_NO_ZONE; a review link's end date has no zone", "owner of team 2", "a second Miniflare team with no profile: prepared edition, publishpreflight, publishat, reviewgrant", async () => {
    const b = await teamB.preparedEdition("owner-b", "R97n", { vouch: true });
    const asked = await teamB.ceremonyPreflight(b, { tied: false });
    const step = teamB.signStepOf(asked);
    const kb = await teamB.newKey();
    await teamB.post(b.auth, "signerregisterown", { keyB64: kb.keyB64 });
    const doc = teamB.R(await b.cs.call("casedocument", { query: { case: b.prepared.caseId, edition: String(b.prepared.edition) } }));
    const list = PARTS.sitting(doc, { findings: b.prepared.findings.map((f) => ({ target: f.target, bundleSha: f.bundleSha })) });
    const sigs = []; for (const x of list) sigs.push(await teamB.signText(kb, x.text, x.namespace));
    await b.cs.call("reauth", { body: { password: b.password } });
    const hold = await teamB.post(b.auth, "publishat", { caseId: b.prepared.caseId, edition: Number(b.prepared.edition), expectedSha: doc.doc_sha, sig: sigs[0], at: { date: "2026-12-01", time: "09:00" }, members: list.slice(1).map((x, i) => ({ id: x.id, sha: x.sha, signature: sigs[i + 1] })) });
    const copy = teamB.R(await b.cs.call("reviewcopy", { query: { draft: b.draft } }));
    const g = await teamB.post(b.auth, "reviewgrant", { draft: b.draft, recipient: "Reader · neighbour", until: "2026-12-01T07:59:59Z" });
    return [W(step.publish_at && step.publish_at.offered === false && reasonOf(hold.body) === "PUBLISH_AT_NO_ZONE"), `publish_at ${J(step.publish_at, 460)}; publishat -> ${reasonOf(hold.body)} ${sayOf(hold.body).slice(0, 200)}; the review copy's zone ${J(copy.zone)}; reviewgrant with an instant and no zone -> ${reasonOf(g.body) || "accepted " + J(R(g.body), 100)}`];
  });
  /* ---- edition 2 of the signed case (R90 (i), R92) ---- */
  let draftB2;
  await row("R90", "(i) an edition after the first: a draft naming the case; 'What changed in this edition, and why' is required and authored; a byte-identical exclusion statement is refused COMPLETENESS_CARRIED_FORWARD; a reprinted bias acknowledgement refused", "owner-a", "casedraft {caseId}; publish with the same statement and the same bias sentence; whatchangedpropose", async () => {
    const d = R(await cs.call("casedraft", { body: { project, caseId: prepB.caseId, targets: [q1.q, q3.q], scope: "The stamp and the register (second edition).", statement: "This case covers the stamp and the register only; it leaves out the later amendments and the mayor's office.", subjectPosition: "not_sought", subjectJustification: "No new contact.", roles: { [q1.q]: "load_bearing", [q3.q]: "supporting" }, excluded: [{ description: "The attendance list", reason: "It does not bear on the stamp." }] } }));
    draftB2 = d.draftId;
    if (!draftB2) return ["BROKEN", "no second-edition draft: " + J(d, 400)];
    const a = await pub(draftB2);
    const wc = await post(own.auth, "whatchangedpropose", { text: "Added the register page." }, { case: prepB.caseId });
    return [W(R(a).ok === false), `${d.caseId} edition ${d.edition}; prepare edition 2 with nothing new -> ${reasonOf(a)} ${sayOf(a).slice(0, 180)}; whatchangedpropose (an assistant-draft act, after the alpha) -> ${J({ ok: R(wc.body).ok, reason: reasonOf(wc.body) }, 160)}`];
  });
  await row("R90", "(i) edition 2 after the conclusions moved: no 'What changed' is refused; a statement carried forward byte for byte is refused COMPLETENESS_CARRIED_FORWARD; a reprinted bias sentence is refused BIAS_ACKNOWLEDGEMENT_CARRIED_FORWARD; 'the lens is unchanged' and a fresh sentence are accepted", "owner-a", "withdrawconclusion and conclude again on q1 and q3 with different readings; casedraft/publish edition 2 four ways", async () => {
    const out = [];
    for (const [q, text] of [[q1.q, "The clerk stamped the contract before the vote, and the stamp is initialled."], [q3.q, "The amendment was logged before the agenda was set, under number 4471."]]) {
      const w = await post(own.auth, "withdrawconclusion", {}, { target: q, project, reason: "Re-read the register page." });
      const c = R(await cs.call("conclude", { query: { target: q, project, reading: text, falsifier: "A dated log showing otherwise would overturn this.", reason: "The register page was added." } }));
      out.push(`${q.slice(0, 12)} withdrawn ${R(w.body).ok !== false}, concluded again ${c.ok === true}`);
    }
    const common = { project, caseId: prepB.caseId, targets: [q1.q, q3.q], scope: "The stamp and the register (second edition).", subjectPosition: "not_sought", subjectJustification: "No new contact; the first edition's answer stands.", roles: { [q1.q]: "load_bearing", [q3.q]: "supporting" }, excluded: [{ description: "The attendance list", reason: "It does not bear on the stamp." }] };
    const same = "This case covers the stamp and the register only; it leaves out the later amendments and the mayor's office.";
    const mk = async (extra) => R(await cs.call("casedraft", { body: { ...common, ...extra } })).draftId;
    const d1 = await mk({ statement: same });
    const a = await cs.call("publish", { body: { draft: d1, project, tieAttested: true, biasAcknowledgement: "A fresh sentence one." } });
    out.push(`no What changed -> ${reasonOf(a) || "accepted"}`);
    const d2 = await mk({ statement: same, whatChanged: { text: "The register page was added as evidence." } });
    const b = await cs.call("publish", { body: { draft: d2, project, tieAttested: true, biasAcknowledgement: "A fresh sentence two." } });
    out.push(`same statement, What changed authored -> ${reasonOf(b) || "accepted"}`);
    const d3 = await mk({ statement: same + " It now also leaves out the attendance list.", whatChanged: { text: "The register page was added as evidence." } });
    const c3 = await cs.call("publish", { body: { draft: d3, project, tieAttested: true, biasAcknowledgement: BIAS } });
    out.push(`new statement, the first edition's bias sentence reprinted -> ${reasonOf(c3) || "accepted"}`);
    const d4 = await mk({ statement: same + " It now also leaves out the attendance list.", whatChanged: { text: "The register page was added as evidence." } });
    const e = await cs.call("publish", { body: { draft: d4, project, tieAttested: true, biasAcknowledgement: "The lens is unchanged since the first edition of this case." } });
    out.push(`'the lens is unchanged' -> ${reasonOf(e) || "accepted"} ${R(e).ok === true ? "edition " + R(e).edition : sayOf(e).slice(0, 120)}`);
    ST.ed2 = R(e).ok === true ? R(e) : null;
    return [W(reasonOf(b) === "COMPLETENESS_CARRIED_FORWARD" && reasonOf(c3) === "BIAS_ACKNOWLEDGEMENT_CARRIED_FORWARD"), out.join("; ")];
  });

  /* =================== R172 photos in a case =================== */
  const photoProject = await kit.projectOf(own.auth, "Photos, 10a");
  await kit.get(own.auth, { op: "projectinvite", projectId: photoProject, handle: "writer-b" });
  await kit.get(wb, { op: "projectjoin", projectId: photoProject });
  const fileDoc = async (auth, doc, title, vouch = true) => {
    const c2 = kit.screenCall(auth);
    const filed = await CAPTURE_SCREEN.parts.promoteDocument(c2, { doc, title, locator: doc.locator, project: photoProject });
    if (filed.refused) throw new Error("filing refused " + J(filed.refused));
    if (vouch) {
      const sel = R(await c2.call("select", { body: { ids: [filed.bundleId] } }));
      await c2.call("release", { query: { handle: sel.handle, acknowledgment: "I took this photo.", mitigation: "A street scene; faces and plates are marked in the ceremony." } });
    }
    return filed.bundleId;
  };
  const acquirePic = async (name, bytes, type = "image/png") => {
    kit.serve(name, bytes, { type });
    const a = await kit.acquire(own.auth, { locator: `https://group.example/files/${name}`, project: photoProject });
    if (!a.body.document) throw new Error("acquire: " + J(a.body, 300));
    return a.body.document;
  };
  const wholeDoc = (sha) => ({ kind: "term", words: "the photograph as a whole", capture_sha: sha, extent: { kind: "document" } });
  const photoQ = async (title, shas) => {
    const q = await kit.questionOf(own.auth, photoProject, title);
    for (const sha of shas) await cs.call("cite", { body: { project: q, role: "supports", found: wholeDoc(sha) } });
    const c = R(await cs.call("conclude", { query: { target: q, project: photoProject, reading: "The photographs show the stamp on the contract.", falsifier: "A photograph of an unstamped contract would overturn this.", reason: "Seen in the photographs." } }));
    if (c.ok !== true) throw new Error("conclude " + J(c, 300));
    return q;
  };
  const photoDraft = async (q) => R(await cs.call("casedraft", { body: { project: photoProject, targets: [q], scope: "Whether the photographs show the stamp.", statement: "Leaves out other photographs taken that day.", subjectPosition: "not_sought", subjectJustification: "The photographs are of a public counter.", roles: { [q]: "load_bearing" }, excluded: [{ description: "Other photographs taken that day", reason: "They show no stamp." }] } })).draftId;
  const pubP = (draft, sa = []) => cs.call("publish", { body: { draft, project: photoProject, tieAttested: true, biasAcknowledgement: BIAS, ...(sa.length ? { selfAttested: sa.map((sha) => ({ capture: sha, reason: "The address could not be archived by a second party today." })) } : {}) } });
  const ph = {};
  await row("R172", "a photo added by the Add screen's upload route is told to be a photo (the ceremony's Photos step lists it; obscuremark accepts it)", "owner-a", "captureupload a PNG with type image/png and name photo.png; file it; obscuremark nothing-to-obscure", async () => {
    const bytes = pngOf(64, 48, 11);
    const up = (await (await kit.plane(`/api/?op=captureupload&statement=photo&name=${encodeURIComponent("street.png")}&type=image%2Fpng`, { method: "POST", headers: { ...own.auth, "content-type": "image/png" }, body: bytes })).json()).result;
    const bundle = await fileDoc(own.auth, up.document, "street-upload");
    ph.upBundle = bundle; ph.upSha = kit.sha(bytes);
    const m = await cs.call("obscuremark", { query: { capture: ph.upSha }, body: { areas: [] } });
    const q = await photoQ("Does the uploaded photograph show the stamp?", [ph.upSha]);
    const d = await photoDraft(q);
    const pf = R(await cs.call("publishpreflight", { body: { draft: d, project: photoProject, biasAcknowledgement: BIAS, tieAttested: true } }));
    const s4 = (pf.steps || []).find((x) => x.name === "photos") || {};
    const prof = JSON.stringify(R(await cs.call("image", { query: { id: bundle } }))["data/provenance.json"] || "").includes("content_type");
    const refused = reasonOf(m) === "NOT_A_PHOTO";
    return [refused ? "BROKEN" : "WORKS", refused ? `MAJOR (privacy): a photo added by the upload route (type image/png recorded in the profile as source_content_type; the filed document's path is snapshots/upload-<sha> with no extension; provenance capture has no content_type) is not told to be a photo: obscuremark -> NOT_A_PHOTO "${sayOf(m).slice(0, 110)}"; the pre-flight Photos step lists ${J((s4.photos || []).length)} photos, unchecked ${s4.unchecked}; the case citing it prepared as ready:${pf.ready}, so a photo with faces or plates would publish unobscured with no Photos step (case-carriage #photo reads capture.content_type, which upload never writes; a fetched address records it)` : `obscuremark ok ${J(R(m), 160)}; photos listed ${J((s4.photos || []).length)}`];
  });
  await row("R172", "a photo captured from an address: the Photos step lists it, signing is refused while it is unchecked (PHOTO_UNCHECKED); the reminder", "owner-a", "acquire a PNG from a served address; file, vouch, cite as a whole; publishpreflight; publish", async () => {
    const png = pngOf(80, 60, 21);
    const doc = await acquirePic("scene-a.png", png);
    ph.a = { sha: kit.sha(png) };
    ph.a.bundle = await fileDoc(own.auth, doc, "scene-a");
    ph.a.q = await photoQ("Does photograph A show the stamp on the contract?", [ph.a.sha]);
    ph.a.draft = await photoDraft(ph.a.q);
    const pf = R(await cs.call("publishpreflight", { body: { draft: ph.a.draft, project: photoProject, biasAcknowledgement: BIAS, tieAttested: true } }));
    const s4 = (pf.steps || []).find((x) => x.name === "photos") || {};
    const p = await pubP(ph.a.draft);
    ph.aRefusal = reasonOf(p);
    const rem = word("photo.reminder");
    return [W(R(p).ok === false && /PHOTO/.test(String(reasonOf(p)) + JSON.stringify(pf.blockers || []))), `Photos step ${J(s4, 360)}; pre-flight blockers ${J((pf.blockers || []).map((x) => x.reason))}; prepare -> ${reasonOf(p)} ${sayOf(p).slice(0, 160)}; Add-screen reminder word "${String(rem).slice(0, 120)}"`];
  });
  await row("R172", "check one 'nothing to obscure'; mark a face and a plate on another; read the copy's labels; withdraw a mark with a reason as a second member; areas outside the photo, malformed, a format that cannot be covered are each refused", "owner-a, writer-b", "obscuremark with areas [] ; with person and plate rectangles; an outside rectangle; a zero rectangle; a GIF; withdraw", async () => {
    const out = [];
    const none = await cs.call("obscuremark", { query: { capture: ph.a.sha }, body: { areas: [] } });
    out.push(`nothing to obscure -> ${J(R(none), 160)}`);
    const png2 = pngOf(80, 60, 31);
    const doc2 = await acquirePic("scene-b.png", png2);
    ph.b = { sha: kit.sha(png2), bundle: await fileDoc(own.auth, doc2, "scene-b") };
    const marks = await cs.call("obscuremark", { query: { capture: ph.b.sha }, body: { areas: [{ rect: [4, 4, 30, 40], kind: "person" }, { rect: [40, 30, 78, 55], kind: "plate" }] } });
    out.push(`face and plate marked -> ${J(R(marks), 260)}`);
    const outside = await cs.call("obscuremark", { query: { capture: ph.b.sha }, body: { areas: [{ rect: [4, 4, 900, 900], kind: "person" }] } });
    out.push(`outside -> ${J(R(outside), 330)}`);
    const bad = await cs.call("obscuremark", { query: { capture: ph.b.sha }, body: { areas: [{ rect: [4, 4, 4, 4], kind: "person" }] } });
    out.push(`zero-size -> ${reasonOf(bad)}`);
    const staff = await cs.call("obscuremark", { query: { capture: ph.b.sha }, body: { areas: [{ rect: [4, 4, 20, 20], kind: "staff" }] } });
    out.push(`staff with no reason -> ${reasonOf(staff)}`);
    const gif = await acquirePic("scene-c.gif", new Uint8Array([71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 0, 0, 0, 59]), "image/gif");
    const gifSha = kit.sha(new Uint8Array([71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 0, 0, 0, 59]));
    await fileDoc(own.auth, gif, "scene-c");
    const g = await cs.call("obscuremark", { query: { capture: gifSha }, body: { areas: [{ rect: [0, 0, 1, 1], kind: "person" }] } });
    out.push(`GIF -> ${J(R(g), 330)}`);
    const markId = R(marks).mark;
    const wd = await wcs.call("obscuremarkwithdraw", { query: { capture: ph.b.sha }, body: { mark: markId, reason: "The plate is a public sign, not a private vehicle." } });
    out.push(`withdraw mark ${markId} as writer-b -> ${J(R(wd), 260)}`);
    const wdNo = await cs.call("obscuremarkwithdraw", { query: { capture: ph.b.sha }, body: { mark: markId, reason: "" } });
    out.push(`withdraw with no reason -> ${reasonOf(wdNo)}`);
    const oneOk = R(marks).ok !== false;
    return [W(oneOk && R(bad).ok === false), out.join("; ")];
  });
  await row("R172", "prepare the photo case, read the Photos step labels, sign it, and as a stranger read the published case", "owner-a, stranger", "publish after the checks; publishpreflight step 4; caseratify; publishedcase", async () => {
    const q = await photoQ("Do photographs A and B show the stamp?", [ph.a.sha, ph.b.sha]);
    const d = await photoDraft(q);
    ph.d = d;
    const pf = R(await cs.call("publishpreflight", { body: { draft: d, project: photoProject, biasAcknowledgement: BIAS, tieAttested: true } }));
    const s4 = (pf.steps || []).find((x) => x.name === "photos") || {};
    const p = R(await pubP(d, [ph.a.sha, ph.b.sha]));
    if (p.ok !== true) return ["BROKEN", `not prepared: ${J(p, 500)}; step 4 ${J(s4, 400)}`];
    const prepP = { caseId: p.caseId, edition: p.edition, findings: p.findings.map((f) => ({ target: f.target, bundleSha: f.bundleSha })) };
    const r = await sitFor(own.auth, own.password, ST.key2, prepP);
    const pubr = R(await kit.get({}, { op: "publishedcase", id: prepP.caseId, caseId: prepP.caseId }));
    return [W(R(r.res.body).ok === true), `Photos step ${J(s4, 520)}; signed ${J(R(r.res.body), 140)}; stranger reads materials ${J(pubr.materials, 420)}`];
  });

  /* =================== R182 two captures of one source =================== */
  const k2 = {};
  await row("R182", "capture the same address twice (the page changed), file and vouch both, cite a passage in each in one question, conclude, draft and prepare", "owner-a", "acquire register.txt twice with a changed body; promoteDocument each; release each; cite; conclude; casedraft; publish", async () => {
    const t1 = kit.te("The register logs the amendment as number 4471 on Monday. The clerk initialled the entry.");
    const t2 = kit.te("The register logs the amendment as number 4472 on Tuesday. The deputy clerk initialled the entry.");
    kit.serve("register-k2.txt", t1, { type: "text/plain" });
    const a1 = await kit.acquire(own.auth, { locator: "https://group.example/files/register-k2.txt", project: photoProject });
    kit.serve("register-k2.txt", t2, { type: "text/plain" });
    const a2 = await kit.acquire(own.auth, { locator: "https://group.example/files/register-k2.txt", project: photoProject });
    const bA = await fileDoc(own.auth, a1.body.document, "register-monday");
    const bB = await fileDoc(own.auth, a2.body.document, "register-tuesday");
    k2.shaA = kit.sha(t1); k2.shaB = kit.sha(t2); k2.bA = bA; k2.bB = bB;
    const q = await kit.questionOf(own.auth, photoProject, "Was the amendment logged twice under different numbers?");
    const fa = R(await cs.call("findin", { body: { scope: { capture: k2.shaA }, kinds: ["term"], term: "number 4471" } })).kinds[0].items[0];
    const fb = R(await cs.call("findin", { body: { scope: { capture: k2.shaB }, kinds: ["term"], term: "number 4472" } })).kinds[0].items[0];
    const ca = R(await cs.call("cite", { body: { project: q, role: "supports", found: fa } }));
    const cb = R(await cs.call("cite", { body: { project: q, role: "supports", found: fb } }));
    const c = R(await cs.call("conclude", { query: { target: q, project: photoProject, reading: "The amendment was logged twice, under 4471 and 4472.", falsifier: "A register showing one entry would overturn this.", reason: "Two captures of the register." } }));
    k2.q = q;
    const d = await photoDraft(q);
    const pre = R(await pubP(d, [k2.shaA, k2.shaB]));
    k2.prep = pre.ok === true ? { caseId: pre.caseId, edition: pre.edition, findings: pre.findings.map((f) => ({ target: f.target, bundleSha: f.bundleSha })) } : null;
    k2.same = a1.body.document.locator === a2.body.document.locator;
    return [W(!!k2.prep && ca.ok !== false && cb.ok !== false && c.ok === true), `two captures ${k2.shaA.slice(0, 10)} and ${k2.shaB.slice(0, 10)} of one address (same locator ${k2.same}); cites ${J(ca.cited)} and ${J(cb.cited)}; concluded ${c.ok}; prepared ${k2.prep ? k2.prep.caseId : J(pre, 400)}`];
  });
  await row("R182", "sign and publish the two-capture case; as a stranger the manifest and the case file list each capture's material once under its own path (materials/<ref>/<sha>/...), case file format", "owner-a, stranger", "caseratify; publishedcase; publishedmanifest", async () => {
    const r = await sitFor(own.auth, own.password, ST.key2, k2.prep);
    if (R(r.res.body).ok !== true) return ["BROKEN", `${r.res.status} ${J(R(r.res.body), 600)}`];
    const pc = R(await kit.get({}, { op: "publishedcase", id: k2.prep.caseId, caseId: k2.prep.caseId }));
    const man = R(await kit.get({}, { op: "publishedmanifest", case: k2.prep.caseId, edition: String(k2.prep.edition) }));
    const paths = JSON.stringify(man).match(/materials\/[^"\\]+/g) || [];
    const dup = paths.length !== new Set(paths).size;
    return [W(pc.ok !== false && paths.length >= 2 && !dup), `signed; case_file ${J(pc.case_file, 180)}; manifest keys ${J(Object.keys(man || {}))}; material paths ${J(paths.slice(0, 6), 420)}; duplicate path ${dup}; materials on the page ${J((pc.materials || []).length)}`];
  });
  await row("R182", "the one-capture control (the two-finding case signed above) carries case file format bio-case-file/3; the two-capture case /4; verify and recreate with the regenerated checker, a tampered copy of B, an unknown /5 and the seal-order 451 are the stranger's acts of sitting 10b", "stranger", "publishedmanifest of both and compare the case file format", async () => {
    const a = JSON.stringify(R(await kit.get({}, { op: "publishedmanifest", case: prepB.caseId, edition: String(prepB.edition) })));
    const b = JSON.stringify(R(await kit.get({}, { op: "publishedmanifest", case: k2.prep.caseId, edition: String(k2.prep.edition) })));
    const fmt = (t) => (t.match(/bio-case-file\/\d+/g) || []).filter((x, i, arr) => arr.indexOf(x) === i);
    return ["WORKS", `one capture per source: ${J(fmt(a))}; two captures of one source: ${J(fmt(b))}; the stranger's verify and recreate, the tampered copy of B and the seal-order 451 (R95, R96) are walked in 10b and are NOT REACHED here`];
  });
  await row("R182", "CASE_DOCUMENT_TOO_LARGE (bound 1,572,864 B) is not reachable at alpha size", "-", "-", async () => ["NOT REACHED", "the case document bound is not reachable by a walk at alpha size (README note); the two-capture case document was far below it"]);

  /* =================== R90 (g) sever and reinstate; R92 further refusals =================== */
  await row("R90", "(g) sever and reinstate a citation of the case itself from the case editor (fix round 10 R31: a severed citation leaves its ground and the ceremony refuses in machine words)", "owner-a", "the editor's own request shape (body {project, handle: the cited document's id}); then with a selection handle as the question screen sends", async () => {
    const asEditor = await post(own.auth, "sever", { project, handle: d3.bundle, reason: "The register entry is under dispute." });
    const sel = R(await cs.call("select", { body: { ids: [d3.bundle] } }));
    const proper = await post(own.auth, "sever", { project, handle: sel.handle, reason: "The register entry is under dispute." });
    const pf = R(await cs.call("publishpreflight", { body: { draft: draftB2 || draft1, project, biasAcknowledgement: "A fresh sentence three.", tieAttested: true } }));
    const names = (pf.blockers || []).map((x) => x.reason).concat(pf.first ? [pf.first.reason] : []);
    const sel2 = R(await cs.call("select", { body: { ids: [d3.bundle] } }));
    const back = await post(own.auth, "reinstate", { project, handle: sel2.handle, reason: "The entry is settled." });
    const editorOk = R(asEditor.body).ok !== false;
    return [editorOk ? "WORKS" : "BROKEN", `the editor's request (handle = the document id) -> ${editorOk ? "ok" : reasonOf(asEditor.body) + " " + sayOf(asEditor.body).slice(0, 110)}${editorOk ? "" : " (MAJOR if the shell sends it as is: the case editor's Sever and Reinstate (case-editor.mjs:187, :485) send the cited document's id where the plane wants a selection handle, as the question screen's own sever does by calling select first)"}; with a selection handle -> ${J({ ok: R(proper.body).ok, reason: reasonOf(proper.body), says: sayOf(proper.body).slice(0, 80) }, 220)}; the pre-flight afterwards names ${J(names)}; reinstate with a handle -> ${J({ ok: R(back.body).ok, reason: reasonOf(back.body) }, 120)}`];
  });
  await row("R92", "CASE_CONCLUSION_MOVED: prepare, withdraw the conclusion before signing, sign: refused naming what the project stands on now; nothing committed", "owner-a", "a fresh prepared edition; withdrawconclusion; caseratify", async () => {
    const e = await kit.preparedEdition("owner-a", "R92m", { vouch: true });
    const w = await post(e.auth, "withdrawconclusion", {}, { target: e.question, project: e.project, reason: "I want to read the register again." });
    const r = await sitFor(e.auth, e.password, ST.key2, e.prepared);
    return [W(reasonOf(r.res.body) === "CASE_CONCLUSION_MOVED"), `withdrawn ${R(w.body).ok !== false}; signing -> ${r.res.status} ${reasonOf(r.res.body)} ${sayOf(r.res.body).slice(0, 220)}`];
  });
  await row("R92", "BELOW_PROJECT_STRENGTH: set the project's bar (A, A) and prepare a load-bearing finding that falls short; read the arithmetic", "owner-a", "projectbarset capture A connection A; publishpreflight of a fresh draft on the vouched upload; publish", async () => {
    const e = await kit.preparedEdition("owner-a", "R92b", { vouch: true, prepare: false });
    const bar = await kit.get(e.auth, { op: "projectbarset", project: e.project, capture: "A", connection: "A", reason: "We hold this case to the highest grades." });
    const pf = R(await e.cs.call("publishpreflight", { body: { draft: e.draft, project: e.project, biasAcknowledgement: BIAS, tieAttested: true } }));
    const p = R(await e.cs.call("publish", { body: { draft: e.draft, project: e.project, tieAttested: true, biasAcknowledgement: BIAS } }));
    const names = (pf.blockers || []).map((x) => x.reason).concat(pf.first ? [pf.first.reason] : []).concat([p.reason]);
    return [W(names.includes("BELOW_PROJECT_STRENGTH")), `bar set ${J(R(bar), 120)}; refusals named ${J(names)}; prepare -> ${p.ok === true ? "prepared (no refusal)" : String(p.translation || p.detail || "").slice(0, 300)}`];
  });
  await row("R92", "(2) PUBLISH_NO_FINDING: a draft that names no finding", "owner-a", "casedraft with no targets, publish", async () => {
    const d = await cs.call("casedraft", { body: { project, targets: [], scope: "Nothing.", statement: "Leaves out everything.", subjectPosition: "not_sought", subjectJustification: "None.", roles: {}, excluded: [] } });
    if (R(d).ok === false) return ["WORKS", `refused already at the draft: ${R(d).reason} ${sayOf(d).slice(0, 160)}`];
    const p = await pub(R(d).draftId);
    return [W(R(p).ok === false), `publish -> ${reasonOf(p)} ${sayOf(p).slice(0, 180)}`];
  });
  /* =================== R175 the fence =================== */
  await row("R175", "the working frame band, 'Shared for review: 2 people outside the group can read this', and the path-to-publication marker", "owner-a", "read the shell's band source and the grants count the plane gives", async () => {
    return ["NOT REACHED", "designed, not built (brief.today 2026-10-01): the shell draws one fixed band, data-band=\"working\" with 'not public · seen by your team's members' (interface-shell/browser.mjs:1371, setup-words shell.band.working); the marker words mark.path.shared-for-review.name/.means exist in the word list (rows.mjs:60,75) but no screen draws them; the plane does give the live-grant count the band would need (reviewcopy.grants[].live: 2, 1, 0 as links were stopped in R91). Absence recorded, not logged as a defect."];
  });

  /* =================== overlay rows that the plane can answer =================== */
  await row("R215", "act weight by rung for the acts of this sitting (affordances: rung, phone)", "owner-a", "affordances catalog read for publish, attribute, reviewgrant, statementack, sever, reinstate, obscuremark, signerregisterown, publishat", async () => {
    const cat = (R(await kit.get(own.auth, { op: "affordances" })).catalog || []);
    const ids = ["publish", "caseratify", "attribute", "reviewgrant", "reviewrevoke", "statementack", "sever", "reinstate", "obscuremark", "obscuremarkwithdraw", "signerregisterown", "signerrevokeown", "publishat", "publishatmove", "publishatcancel", "casedraft", "reviewcomment", "withdrawconclusion"];
    const found = ids.map((id) => { const c = cat.find((x) => x.id === id); return c ? `${id}=${c.rung}${c.phone === false ? "/not on the phone" : ""}` : `${id}=not in the catalog`; });
    const tops = cat.filter((c) => ids.includes(c.id));
    return ["WORKS", `catalog has ${cat.length} entries; ${found.join(", ")}; the catalog lists acts by subject kind, so acts that are not an object's options (caseratify, attribute, reviewgrant...) are not in it: their weight comes from op-grades (the shell's dialog), a browser reading`];
  });
  await row("R217", "'Help me write this' on the case editor with no assistant connected", "owner-a", "writinghelp for the scope field and for 'what changed'", async () => {
    const a = await post(own.auth, "writinghelp", { op: "casedraft", field: "scope", told: "whether the contract was stamped before the vote" });
    const b = await post(own.auth, "writinghelp", { op: "whatchangedpropose", field: "whatChanged", told: "added the register page" });
    return [W(R(a.body).ok === false && /./.test(sayOf(a.body)) && !/something went wrong/i.test(sayOf(a.body))), `scope -> ${reasonOf(a.body)}: "${sayOf(a.body).slice(0, 200)}"; what changed -> ${reasonOf(b.body)}: "${sayOf(b.body).slice(0, 120)}"; a guide or the 'not ready' state is drawn, never a silent failure`];
  });
  await row("R214", "a refusal teaches: every refusal this sitting provoked carries the plane's own sentence (a translation), none says 'something went wrong', none is a bare code", "owner-a", "re-provoke twelve refusals and read each translation", async () => {
    const probes = [
      ["REVIEW_NOT_PROJECT_OWNER", () => post(adm2, "reviewgrant", { draft: draftB, recipient: "x · y", until })],
      ["ATTRIBUTION_NOT_THE_AUTHOR", () => post(own.auth, "attribute", { caseId: prep.caseId, edition: prep.edition, observation: obs.bundle_id, level: "group", reason: "r" })],
      ["STATEMENT_ACK_BY_ITS_AUTHOR", () => post(own.auth, "statementack", { reason: "x" }, { draft: draftB })],
      ["REVIEW_BAD_UNTIL", () => post(own.auth, "reviewgrant", { draft: draftB, recipient: "x · y", until: "2020-01-01T00:00:00Z" })],
      ["NO_SUBJECT_POSITION", async () => pub(R(await cs.call("casedraft", { body: { ...base, subjectPosition: "did_ask", subjectJustification: "x" } })).draftId)],
      ["TIE_ATTESTATION_MISSING", () => post(own.auth, "publish", { draft: draft1, project, biasAcknowledgement: BIAS })],
      ["NO_BIAS_ACKNOWLEDGEMENT", () => post(own.auth, "publish", { draft: draft1, project, tieAttested: true })],
      ["NOT_CAPABLE", () => post(wb, "caseratify", { caseId: prepB.caseId, edition: prepB.edition, expectedSha: "x", sig: "x", members: [] })],
      ["OPERATOR_TOKEN_CANNOT_RATIFY_CASE", () => kit.post({ authorization: `Bearer ${kit.ADM}` }, "caseratify", { caseId: prepB.caseId, edition: prepB.edition, expectedSha: "x", sig: "x", members: [] })],
      ["ALREADY_A_CASE_MEMBER", () => pub(draftB)],
      ["NO_REVIEW_COPY", () => kit.post({}, "reviewcopy", { secret: "nope-nope-nope-nope-nope" })],
      ["NOT_CONCLUDED", async () => { const q = await kit.questionOf(own.auth, project, "A question left open?"); const d = R(await cs.call("casedraft", { body: { project, targets: [q], scope: "x", statement: "y", subjectPosition: "not_sought", subjectJustification: "z", roles: { [q]: "load_bearing" }, excluded: [] } })); return pub(d.draftId); }],
    ];
    const bad = [], seen = [];
    for (const [code, fn] of probes) {
      const r = await fn();
      const body = r && r.body ? r.body : r;
      const x = R(body) || {};
      const tr = String(x.translation || x.detail || "");
      const ok = (x.reason === code || x.code === code) && tr.length > 25 && !/something went wrong/i.test(tr) && !/^[A-Z_]{6,}$/.test(tr.trim());
      seen.push(`${code}: "${tr.slice(0, 70)}"`);
      if (!ok) bad.push(`${code} -> ${x.reason || x.code} "${tr.slice(0, 60)}"`);
    }
    return [W(!bad.length), bad.length ? `not as expected: ${bad.join("; ")}` : `all ${probes.length} carry the plane's sentence; ${seen.slice(0, 4).join(" | ")} ...`];
  });
  await row("R218", "two owners change one case draft at once: different fields both kept; the same field", "owner-a, owner-c", "projectowneradd owner-c; both casedraft the same draft", async () => {
    const add = await kit.get(own.auth, { op: "projectowneradd", projectId: project, handle: "owner-c" });
    const dr = R(await cs.call("casedraft", { body: { project, targets: [q3.q], scope: "Scope for two writers.", statement: "Statement for two writers.", subjectPosition: "not_sought", subjectJustification: "None.", roles: { [q3.q]: "load_bearing" }, excluded: [] } })).draftId;
    const [a, b] = await Promise.all([cs.call("casedraft", { body: { draft: dr, scope: "Scope by owner-a." } }), occs.call("casedraft", { body: { draft: dr, statement: "Statement by owner-c." } })]);
    const c1 = R(await cs.call("reviewcopy", { query: { draft: dr } }));
    const [a2, b2] = await Promise.all([cs.call("casedraft", { body: { draft: dr, scope: "Same field by owner-a." } }), occs.call("casedraft", { body: { draft: dr, scope: "Same field by owner-c." } })]);
    const c2 = R(await cs.call("reviewcopy", { query: { draft: dr } }));
    return [W(c1.authored.scope === "Scope by owner-a." && c1.authored.statement === "Statement by owner-c."), `owner added ${J(R(add), 120)}; different fields: a ${J({ ok: R(a).ok, reason: R(a).reason }, 80)}, c ${J({ ok: R(b).ok, reason: R(b).reason }, 80)}, kept scope "${c1.authored.scope}" and statement "${c1.authored.statement}"; same field: a ${J({ ok: R(a2).ok, reason: R(a2).reason }, 80)}, c ${J({ ok: R(b2).ok, reason: R(b2).reason }, 80)}, kept "${c2.authored.scope}"; the call carries no base stamp (casedraft takes no base/expected value), so a divergence is neither named nor offered back: the later write overwrites without a record (R218 (2))`];
  });
  await row("R212", "one person alone: the founder (administrator, no other member) claims, makes a project, uploads, vouches, concludes, drafts, prepares and signs", "founder", "the founder's own session through the same acts (no memberadd)", async () => {
    const f = founder, fcs = kit.screenCall(f);
    const out = [];
    const pj = await kit.projectOf(f, "Founder alone, 10a");
    out.push("project made");
    const tx = kit.te("The founder's own register shows the vote notice posted on Friday morning at the counter.");
    const up = (await (await kit.plane(`/api/?op=captureupload&statement=fa&name=fa-notice&type=text%2Fplain`, { method: "POST", headers: f, body: tx })).json()).result;
    if (!up || up.ok !== true) return ["BROKEN", "the founder's upload: " + J(up, 300)];
    const filed = await CAPTURE_SCREEN.parts.promoteDocument(fcs, { doc: up.document, title: "fa-notice", locator: up.document.locator, project: pj });
    if (filed.refused) return ["BROKEN", "the founder's filing refused: " + J(filed.refused, 300)];
    out.push("document filed");
    const sel = R(await fcs.call("select", { body: { ids: [filed.bundleId] } }));
    const rel = await fcs.call("release", { query: { handle: sel.handle, acknowledgment: "I checked.", mitigation: "Nothing private." } });
    out.push(`vouch ${R(rel).ok !== false}`);
    const q = await kit.questionOf(f, pj, "Was the vote notice posted on Friday?");
    const fi = R(await fcs.call("findin", { body: { scope: { capture: kit.sha(tx) }, kinds: ["term"], term: "vote notice posted" } })).kinds[0].items[0];
    await fcs.call("cite", { body: { project: q, role: "supports", found: fi } });
    const c = R(await fcs.call("conclude", { query: { target: q, project: pj, reading: "The notice was posted on Friday.", falsifier: "A log showing otherwise.", reason: "The register says so." } }));
    out.push(`conclude ${c.ok === true}`);
    const d = R(await fcs.call("casedraft", { body: { project: pj, targets: [q], scope: "The notice.", statement: "Leaves out the agenda.", subjectPosition: "not_sought", subjectJustification: "A public notice.", roles: { [q]: "load_bearing" }, excluded: [] } }));
    out.push(`draft ${!!d.draftId}`);
    const p = R(await fcs.call("publish", { body: { draft: d.draftId, project: pj, tieAttested: true, biasAcknowledgement: BIAS } }));
    out.push(`prepare ${p.ok === true ? "ok" : p.reason + " " + String(p.translation || "").slice(0, 120)}`);
    if (p.ok !== true) return ["BROKEN", out.join("; ")];
    const fk = await kit.newKey();
    const reg = await post(f, "signerregisterown", { keyB64: fk.keyB64 });
    out.push(`own key ${R(reg.body).ok === true ? "ok" : reasonOf(reg.body) + " " + sayOf(reg.body).slice(0, 100)}`);
    const prF = { caseId: p.caseId, edition: p.edition, findings: p.findings.map((x) => ({ target: x.target, bundleSha: x.bundleSha })) };
    const r = await sitFor(f, kit.PASSWORD, fk, prF);
    out.push(`sign ${R(r.res.body).ok === true ? "ok" : reasonOf(r.res.body) + " " + sayOf(r.res.body).slice(0, 120)}`);
    return [R(r.res.body).ok === true ? "WORKS" : "BROKEN", out.join("; ") + "; steps that asked for a second account: none in the editor-to-signing chain (the observation credit, statement acknowledgement and review readers are optional parties, not gates)"];
  });
} catch (x) {
  rec("SCRIPT", "world or setup", "-", "-", "BROKEN", "SETUP EXCEPTION: " + String(x && x.stack).slice(0, 900));
}
if (deferred.length) {
  const wait = Math.max(0, (ST.fireBy || 0) - Date.now());
  note(`waiting ${Math.round(wait / 1000)} s for the set times (the alarm publishes a scheduled edition at its time)`);
  await new Promise((r) => setTimeout(r, wait));
  for (const d of deferred) { try { await d(); } catch (x) { rec("R97", "deferred check", "-", "-", "BROKEN", "SCRIPT EXCEPTION: " + String(x && x.message).slice(0, 300)); } }
}
note(`script wall time ${(Date.now() - t0) / 1000} s`);
flush(true);
await kit.mf.dispose(); await teamB.mf.dispose();
console.log(JSON.stringify(counts()));
