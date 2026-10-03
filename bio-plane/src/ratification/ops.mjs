/* ratification — the Worker half of the two ceremonies (K3): `op=caseratify` (R2, the case document) and `op=ratify`
 * (R4–R6, a finding or its evidence), moved from `legacy-index` in T8. Each verifies everything at the control plane
 * (the fences, the signature, the gate), commits through this module's store half (`./index.mjs`, reached over the
 * Durable Object as `casedocfacts`, `casegate`, `caseratify`, `gatefacts`, `image`, `list`, `ratifygate`, `publish`,
 * `reusedparts`, `recordreuseverdicts`, `capturelimit`), and then copies the ratified bytes to the published store.
 * `op=caseratify`'s refusals before a signature exists are `./refusals.mjs`'s, the ones R18's pre-flight answers.
 *
 * Routing, authentication and the response envelope stay the control plane's. What it decided is passed in (`ctx`):
 * the caller class (`cls`), the minted agent credential (`aiCred`), whether the caller arrived through a member's own
 * session (`viaSession`) with its viewer and session row (`sessViewer`, `sessRights`), the store's name and bindings,
 * and its helpers — `json`, `doAnswer`, `storeSilent`, `storeRefusal` (when the caller hands it), `STORE_SILENT_REASON`/
 * `_DETAIL`, and a service of a module this one does not use directly: bias's gate arm (`withBiasChecks`).
 * The case container's assembly is public-read's (R6), imported; a caller may hand its own as `assembleCaseContainer`
 * (the module's tests do). `stub` is the Durable Object stub the op is scoped to. The legacy code's comments moved with
 * it. */

import { verifySshsig, ratifyStatement, caseRatifyStatement, NS_RATIFY } from "../sshsig.mjs";
import { deliveringPrincipal, delivererOf } from "../deliverer.mjs";
import { publishedGraphEdges } from "../publication/index.mjs";
/* K651, K691: the case container's one assembly (public-read R6), read here rather than handed in by the door; the file
   is public-read's since publication's merge (K697). */
import { assembleCaseContainer as assembleContainer } from "../publication/worker.mjs";
import { partsHeld, withRegisterChecks } from "../provenance/index.mjs";
import { userAgent } from "../acquisition/index.mjs";
import { parseFrontmatter, normalizeType, isMachineIdentity, isPublicHttpsLocator,
         MACHINE_CLASS_PREFIX } from "../record-grammar/index.mjs";
import { rowOf, isCaseMemberBytes, completenessFields, withCaseMemberChecks } from "./checks.mjs";
import { machineCaseRefusal, operatorCaseRefusal, testimonyCaseRefusal, attributionUnchosenRefusal,
         attributionStaleRefusal } from "./refusals.mjs";

/* R17 (N339, N349; control-plane R23, R25, R30; K421, K444): ONE RULE FOR EVERY RELAY, the sub-reads inside a longer
   act included. A reply `doAnswer` reads as the store's OWN REFUSAL (`refused`: `ok: false` below 500, such as
   `BAD_JSON` or an unknown op) is relayed with the store's status, code and sentence, through the caller's
   `storeRefusal` when it hands one, else as the same answer composed here (`json(reply.body, reply.status)`, which is
   what `storeRefusal` answers). Only a reply that is no answer is `storeSilent(op, correlation)`, carrying the
   correlation id `doAnswer` read from the store's own internal error when it gave one. Each site asks the two in that
   order, `refused` and then `answered`, in its own two lines. */
function storeRefused(out, { json, storeRefusal }) {
  return typeof storeRefusal === "function" ? storeRefusal(out) : json(out.reply.body, out.reply.status);
}

/** The two ceremonies' dispatch (legacy-index map §4.4, moved in T18): `op=caseratify` and `op=ratify` answered with the
 *  control plane's `ctx` (the union both handlers read); any other op is not this module's, and answers null. */
export function ratificationOp(op, req, stub, ctx) {
  if (op === "caseratify") return caseRatifyOp(req, stub, ctx);
  if (op === "ratify") return ratifyOp(req, stub, ctx);
  return null;
}

  /* THE SIGNATURE, AND THE COMMIT. Same order of operations as `op=ratify`,
     deliberately: verify everything, run the catalog, then commit. What is
     different is the SUBJECT — this act commits the CASE's own assertions, out
     of the case document, which is the signature those facts had nowhere to
     move to before this item. */
export async function caseRatifyOp(req, stub, ctx) {
  const { env, json, doAnswer, storeSilent, storeRefusal, storeName, cls, aiCred, viaSession,
          sessViewer, sessRights } = ctx;
  const assembleCaseContainer = ctx.assembleCaseContainer || assembleContainer;
  const relay = { json, storeRefusal };
    /* REC-123 / C-32.13: the machine fence alone, FIRST and before the payload is read (`./refusals.mjs` holds the
       refusal and its region; R18's pre-flight answers the same one). THE GUARD'S SHAPE IS REC-46's AND NOT STYLE:
       `aiCred` is resolved only for a minted agent credential (it is what makes the caller the `ai` class), and
       WHETHER the identity it acts under is a machine is asked of the ONE predicate over the stamp the plane writes
       for it — never decided here by a string comparison (the rule the old `hygiene.test.mjs` D1 held over the
       source; R2's and R18's tests drive the fence at this module's interface). The `ai` class only HERE; the
       operator's env-binding classes are refused by the fence directly below (REC-125, D-421). */
    if (aiCred && isMachineIdentity(`${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`))
      return json(machineCaseRefusal(cls), 403);
    /* REC-125 / C-32.15, D-421: see `op=ratify`'s twin region for the whole reasoning. Every caller that did not
       arrive through a member's own signed-in session — every env-binding bearer class `classify()` resolves, today
       ADMIN / MEMBER / PROBE — is refused, NAMING its class. Keyed on HOW the caller arrived and never on a list of
       token classes, so a fifth binding admitted to this op later is refused without anybody remembering this line. */
    if (!viaSession)
      return json(operatorCaseRefusal(cls), 403);
    const body = await req.json().catch(() => null);
    if (!body?.caseId || !Number.isInteger(body?.edition) || !body?.expectedSha
        || typeof body?.sig !== "string")
      return json({ ok: false, reason: "MALFORMED",
                    detail: "caseratify requires caseId, edition (integer), expectedSha, and sig "
                          + "(armored SSH signature over the case document's sha)" }, 400);

    const factsOut = await doAnswer(stub.fetch(
      `http://do/casedocfacts?case=${encodeURIComponent(body.caseId)}`
      + `&edition=${encodeURIComponent(String(body.edition))}`
      /* REC-130: the standing `op=casedocument` answers to, for a member's or the founder's own session (D-421): a
         member without standing in the owning project is answered NO_CASE_DOCUMENT, as for a case that does not exist. */
      + `&viewer=${encodeURIComponent(sessViewer)}`));
    /* REC-53's chokepoint, and the same judgement `op=ratify` records once for
       its whole block: BEFORE the commit a silence refuses the act outright,
       because nothing has been written and 502's sentence — nothing here is a
       statement about the record — is exactly true. */
    if (factsOut.refused) return storeRefused(factsOut, relay);
    if (!factsOut.answered) return storeSilent("caseratify/facts", factsOut.correlation);
    const facts = factsOut.result;
    if (!facts.ok) return json({ ok: false, ...facts, store: storeName, tokenClass: cls }, 404);

    /* MK-1 (A) / C-53.12, and MK-7's attribution gate, C-92.10 and C-92.11 (MEMBER-KNOWLEDGE-DESIGN.md §4.1, §4.4),
       in that order, each refused before the signature is weighed, so the answer is the same whoever signed. The
       refusals and their regions are `./refusals.mjs`'s, the ones R18's pre-flight answers. MEASURED before MK-1 built
       C-53.12 (`test/mk1-publish-probe.mjs`, path 3): a case resting on an observation naming its author RATIFIED. */
    const attr = facts.attribution || { reached: [], legacy: [], stated: [], current: [] };
    for (const refusal of [testimonyCaseRefusal(facts.doc.case_id, facts.doc.edition, attr.legacy),
                           attributionUnchosenRefusal(facts.doc.case_id, facts.doc.edition, attr),
                           attributionStaleRefusal(facts.doc.case_id, facts.doc.edition, attr)])
      if (refusal) return json({ ...refusal, store: storeName, tokenClass: cls }, 409);
    /* R35 (DEC-102): C-58.5, after C-92.11 and before the signature is weighed, asked of the store half, where strength's
       corroboration read is (`casetestimony`); the refusal is the pre-flight's own. A silence refuses: nothing is written. */
    const anonOut = await doAnswer(stub.fetch("http://do/casetestimony", { method: "POST",
      body: JSON.stringify({ caseId: facts.doc.case_id, edition: Number(facts.doc.edition) }) }));
    if (anonOut.refused) return storeRefused(anonOut, relay);
    if (!anonOut.answered) return storeSilent("caseratify/testimony", anonOut.correlation);
    if (anonOut.result && anonOut.result.refusal)
      return json({ ...anonOut.result.refusal, store: storeName, tokenClass: cls }, 409);

    if (facts.doc.doc_sha !== body.expectedSha)
      return json({ ok: false, reason: "CASE_RATIFY_STALE",
                    detail: "the case document has changed since it was reviewed; read it again and re-sign",
                    expected: facts.doc.doc_sha, got: body.expectedSha,
                    store: storeName, tokenClass: cls }, 409);
    /* D-57: NO_SIGNERS IS INSTANCE-WIDE and the detail must never say "for
       you" — the same sentence op=ratify carries, for the same reason. */
    if (!facts.signers.length)
      return json({ ok: false, reason: "NO_SIGNERS",
                    detail: "no active registered signing keys; an admin must register a member key before anything can be ratified",
                    store: storeName, tokenClass: cls }, 409);
    const sv = await verifySshsig(body.sig,
                                  caseRatifyStatement(facts.doc.case_id, facts.doc.edition, facts.doc.doc_sha),
                                  NS_RATIFY, facts.signers.map((s) => s.key_b64));
    if (!sv.ok)
      return json({ ok: false, reason: "SIG_" + sv.reason,
                    ...(sv.keyB64 ? { keyB64: sv.keyB64 } : {}),
                    ...(sv.detail ? { detail: sv.detail } : {}),
                    store: storeName, tokenClass: cls }, 403);
    const attestor = facts.signers.find((s) => s.key_b64 === sv.keyB64);

    /* THE CATALOG, over the bytes the signature covers and over nothing else, on this host's promotion instance,
       where this module's catalogue is registered (R8, K233): the store half re-reads the document at the
       `doc_sha` the signature was verified over and runs `runCaseGate` there (`casegate`). A silence here refuses
       the act: nothing has been written. */
    const gateOut = await doAnswer(stub.fetch(
      `http://do/casegate?viewer=${encodeURIComponent(sessViewer)}`,
      { method: "POST", body: JSON.stringify({ caseId: facts.doc.case_id, edition: Number(facts.doc.edition),
                                               docSha: facts.doc.doc_sha }) }));
    if (gateOut.refused) return storeRefused(gateOut, relay);
    if (!gateOut.answered) return storeSilent("caseratify/gate", gateOut.correlation);
    const gate = gateOut.result || {};
    if (gate.reason && !Array.isArray(gate.findings))
      return json({ ok: false, ...gate, store: storeName, tokenClass: cls }, gate.reason === "CASE_RATIFY_STALE" ? 409 : 404);
    if (!gate.ok)
      return json({ ok: false, reason: "GATE_REFUSED", gateVersion: gate.gateVersion,
                    findings: gate.findings, store: storeName, tokenClass: cls }, 409);

    /* REC-128 (R12): the SIGNATURE says who authorised (`attestor`, the verified key's member, null when absent and
       never the session); the SESSION ROW says who delivered (a member, or the founder, DEC-33), never the signature
       and never `sessMember`. REC-125's fence above guarantees a session here, so `sessRights` is the row. */
    const deliveredBy = deliveringPrincipal(sessRights); /* REC-128: op=caseratify */
    const out = await doAnswer(stub.fetch("http://do/caseratify", {
      method: "POST", body: JSON.stringify({
        caseId: facts.doc.case_id, edition: Number(facts.doc.edition), docSha: facts.doc.doc_sha,
        sigArmored: body.sig, attestorKey: sv.keyB64,
        attestorMember: attestor?.member_id ?? null, gateVersion: gate.gateVersion,
        deliveredBy,
      }) }));
    if (out.refused) return storeRefused(out, relay);
    if (!out.answered) return storeSilent("caseratify/commit", out.correlation);
    const answered = out.result;
    const { completedCase, evidenceMaterials, ...r } = answered || {};
    if (!answered || !r.ok)
      return json({ ok: false, ...(r.reason ? r : { reason: "CASE_PUBLISH_FAILED", detail: answered }),
                    store: storeName, tokenClass: cls }, 409);
    /* D-442 / BIO_Publication_v0_1.md §3 rule 12: a case whose every member was already ratified at
       its pin is COMPLETE at this act, and no op=ratify will come to assemble it — so it is
       assembled here, by the one function op=ratify uses. `completedCase` is the store's internal
       state and is destructured OFF the answer above, never spread into it (REC-58's pick). */
    const materialsCopied = await copyMaterials(env, storeName, Array.isArray(evidenceMaterials) ? evidenceMaterials : []);
    const container = completedCase && completedCase.complete && !completedCase.manifest_sha
      ? await assembleCaseContainer({ env, stub, storeName, cs: completedCase, via: "caseratify" })
      : null;
    return json({ ok: true, ...r, gateVersion: gate.gateVersion, materials_copied: materialsCopied,
                  ...(container ? { container } : {}),
                  attestor: { member: attestor?.member_id ?? null, key_b64: sv.keyB64 },
                  /* REC-128: who carried the signature in, beside who made it. On a
                     retry of the same signature (`existed`) the store wrote nothing,
                     so the RECORD's deliverer is the first one — read it back through
                     op=casedocument; this field is who delivered THIS request. */
                  deliveredBy: delivererOf(deliveredBy),
                  /* THE WINDOW, NAMED IN THE ANSWER RATHER THAN LEFT TO BE
                     INFERRED FROM AN EMPTY LIST. The case is committed and the
                     members still sign their own bytes, because the finding is
                     the unit of truth — the container becomes assemblable when
                     the last of them lands. */
                  next: r.awaiting?.length
                    ? `the case is committed. ${r.awaiting.length} member finding(s) still to ratify `
                      + `(op=ratify): ${r.awaiting.join(", ")}. This edition becomes servable as a `
                      + `container when the last of them lands.`
                    : "the case is committed and every member finding is already ratified at the version "
                      + "this case pinned" + (container && container.manifest_sha
                        ? `, so its container is assembled (${container.zip}).` : "."),
                  store: storeName, tokenClass: cls });
}

/* R39 (K1316, K1317): each material the case commit held only in the evidence store (publication R57) is copied into
   the published bucket by its SHA-256, as `op=ratify` copies captures; a key already there is `present`. One the
   evidence store no longer holds, or whose copy fails, is `missing`: a re-sent op=caseratify retries it, and it never
   changes `ok`, because the edition is committed. */
async function copyMaterials(env, storeName, shas) {
  const out = { copied: 0, present: 0, missing: [] };
  for (const sha of shas) {
    const key = `${storeName}/published/${sha}`;
    try {
      if (await env.PUBLISHED.head(key)) { out.present++; continue; }
      const obj = await env.CAPTURES.get(`${storeName}/captures/${sha}`);
      if (!obj) { out.missing.push(sha); continue; }
      await env.PUBLISHED.put(key, obj.body, { sha256: sha });
      out.copied++;
    } catch { out.missing.push(sha); }
  }
  return out;
}

  /* Ratification: the act that moves a bundle into the published corpus.
     The authority is the SSHSIG over the canonical statement, verified
     against the registered active signers. WHO may carry that signature in
     is a separate question with a separate answer (REC-125, D-421): a
     signed-in member's own session and nothing else. The caller states the sha it reviewed, so
     ratification has its own CAS: nobody can ratify a revision they have
     not seen. Order of operations is deliberate: verify everything, then
     commit the published rows, then copy bytes to the published bucket.
     A failure mid-copy leaves rows that a re-ratification converges. */
export async function ratifyOp(req, stub, ctx) {
  const { env, json, doAnswer, storeSilent, storeRefusal, storeName, cls, aiCred, viaSession,
          sessViewer, sessRights, withBiasChecks, STORE_SILENT_REASON, STORE_SILENT_DETAIL } = ctx;
  const assembleCaseContainer = ctx.assembleCaseContainer || assembleContainer;
  const relay = { json, storeRefusal };
  const op = "ratify";
    /* DEC-49 REGION is-machine-ratify-bundle — REC-123 / C-32.12. The fence alone, first,
       for `caseratify`'s reason above. Driven: before this, an `ai` credential whose
       scope named this op, carrying a registered member's valid signature,
       PUBLISHED THE FINDING and the record named the member as its attestor. The
       guard's shape is `caseratify`'s, for REC-46's reason stated there. */
    if (aiCred && isMachineIdentity(`${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`))
      return json({ ok: false, reason: "MACHINE_CANNOT_RATIFY", ...rowOf("MACHINE_CANNOT_RATIFY"),
        op, tokenClass: cls,
        detail: "ratifying is a member's signed act. An assistant's credential may prepare the finding and "
              + "may never carry the signature in, whoever's key made it (DEC-24 rule 4)." }, 403);
    /* END DEC-49 REGION is-machine-ratify-bundle */
    /* DEC-49 REGION is-operator-ratify-bundle — REC-125 / C-32.14. D-421, DECIDED by
       BOB #14 applying `BIO_Assistant_and_AI_Roles_v0_1.md` §3 rule 4 (no new
       doctrine): an ATTESTED act is performed ONLY by a named member's OWN
       AUTHENTICATED SESSION. REC-123 fenced the `ai` class above and deliberately
       left the operator's env-binding tokens open, because the AUTHORITY is the
       member's signature and those tokens were the operator's publication path as
       built. The ruling closes that: *the signature proves who AUTHORISED; the
       credential that delivers it decides WHEN the record changes, and the record
       names the actor.* A bearer token held in the hosting account is not the
       member it would name.
       THE PRECONDITION WAS MEASURED BEFORE THIS LINE WAS WRITTEN: the only surface
       that submits op=ratify is the instance page (`setup.mjs` ratifyPanel), and it
       posts with the SESSION from op=login; no kickoff, script, tool, installer or
       DIST procedure submits either op with a bearer token.
       THE PREDICATE IS HOW THE CALLER ARRIVED, NOT WHICH TOKEN IT HELD. `viaSession`
       is set only by the session lookup in the admission block; every class
       `classify()` resolves from an env binding leaves it false, so the fence covers
       ADMIN, MEMBER and PROBE today and any binding added tomorrow, and no token
       string or class list appears here to go stale. The refusal NAMES the class
       (`tokenClass`), so a caller learns which of its credentials was refused. */
    if (!viaSession)
      return json({ ok: false, reason: "OPERATOR_TOKEN_CANNOT_RATIFY",
        ...rowOf("OPERATOR_TOKEN_CANNOT_RATIFY"), op, tokenClass: cls,
        detail: `ratifying is a member's own signed act, delivered through that member's own signed-in `
              + `session. The credential that asked is the operator's \`${cls}\`-class bearer token: the `
              + `signature says who authorised publication, and the credential that delivers it decides `
              + `when the record changes, so a bearer token may not carry it in (D-421).` }, 403);
    /* END DEC-49 REGION is-operator-ratify-bundle */
    const body = await req.json().catch(() => null);
    if (!body?.bundleId || !body?.expectedSha || typeof body?.sig !== "string")
      return json({ ok: false, reason: "MALFORMED", detail: "ratify requires bundleId, expectedSha, and sig (armored SSH signature)" }, 400);

    /* REC-53: EVERY Durable Object read in this block goes through REC-52's
       chokepoint (`doAnswer`/`storeSilent`), and not one of them keeps a local
       guard — the whole point of that item is that there is now ONE place that
       opens an envelope, so a rule remembered here would be the twenty-fifth
       remembered check that gets forgotten. REC-52 found eleven caller-facing
       instances of this class and converted them; it left these EIGHT alone
       because the publish/ratify block was another item's ground, and they are
       the same defect: a failure to ANSWER converted into a substantive claim
       about the RECORD, at the layer beneath every surface.

       THE ONE JUDGEMENT THIS BLOCK NEEDS, because it is the only handler in
       the file with a COMMIT in the middle of it, and it is recorded here
       rather than repeated at each site:

         - BEFORE `do/publish` commits, a silence refuses the whole act with
           `storeSilent`. Nothing has been written, the caller must ask again,
           and 502 saying "nothing here is a statement about the record" is
           exactly true.
         - AFTER it commits, a silence may NOT refuse, because a ratification
           genuinely LANDED and 502's own sentence would then be false in the
           other direction — denying knowledge we have is the same overclaim
           wearing modesty. So the post-commit sites keep the true `ok:true`
           answer and state the UNDETERMINED part IN ITS OWN FIELD, which is
           CLAUDE.md's "undetermined is first-class and must be STATED" applied
           to the half of an act that did not answer.

       Every post-commit conversion is byte-identical on the wire when the
       store ANSWERS: the new fields appear only on the path that previously
       lied, so no consumer of a working instance sees anything move. */
    /* REC-25: ratification reads at the RATIFIER'S scope — a bundle the
       caller may not see cannot be assembled for their signature, and the
       answer is the same ABSENT a hidden bundle would give anywhere else.
       REC-140 (D-429): and that scope is now asked at the FIRST read, the gate
       facts, rather than only at the image. Before, the facts were read with no
       viewer, so a caller who could not see a PROJECT was told about it: a stale
       sha drew RATIFY_STALE naming the hidden bundle's real sha, and a fresh one
       drew GATE_REFUSED C-13.1 "bundle.md is missing" — the ratifier-scoped image
       of a hidden bundle reported as an empty document (REC-53's class). With
       the viewer asked here the hidden bundle answers with the SAME object a
       never-minted id does (this module's `gateFacts`, R7), so every answer below is said
       only to a caller who can see the bundle. */
    const ratViewer = encodeURIComponent(viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`);
    const factsOut = await doAnswer(stub.fetch(`http://do/gatefacts?id=${encodeURIComponent(body.bundleId)}&viewer=${ratViewer}`));
    /* A silence here previously threw a TypeError on `facts.ok` — a crash and
       not a claim, which is the mildest member of this class and is converted
       anyway because what this read answers is the GATE'S OWN FACTS: the
       published registry, the earned registry and the signer set. A gate that
       cannot see the record cannot confirm anything, and a 500 with a stack
       trace tells a publisher nothing they can act on. */
    if (factsOut.refused) return storeRefused(factsOut, relay);
    if (!factsOut.answered) return storeSilent("ratify/gatefacts", factsOut.correlation);
    const facts = factsOut.result;
    if (!facts.ok) return json({ ...facts, store: storeName, tokenClass: cls }, 404);
    /* DEC-49 REGION is-ratify-project-bundle — REC-140 / C-58.1. BIO_Publication_v0_1.md
       §3 rule 2 as BOB #15 applied it to D-429 (2026-09-18): *"Only findings that are
       part of a project can be published"*, and a project's own document is not a
       finding — a project publishes THROUGH ITS CASES. So a project bundle is refused
       by TYPE, whoever signs and whoever delivers, its owner included; there is no
       signer rule to weigh because there is nothing here to authorise. Below sight
       (the gate facts answered ABSENT to a caller who cannot see it), above the
       signature, so the refusal costs the caller no key and tells them nothing new. */
    if (normalizeType(facts.row.object_type) === "project")
      return json({ ok: false, reason: "RATIFY_PROJECT_BUNDLE", ...rowOf("RATIFY_PROJECT_BUNDLE"),
        bundleId: body.bundleId,
        detail: `${body.bundleId} is a project's own document, and a project is published through its cases, `
              + `never directly (BIO_Publication_v0_1.md §3 rule 2; D-429). Nothing was published.`,
        store: storeName, tokenClass: cls }, 409);
    /* END DEC-49 REGION is-ratify-project-bundle */
    /* DEC-49 REGION is-testimony-publish-bundle — MK-1 (A) / C-53.10, C-53.11, NARROWED BY MK-7.
       MEASURED before MK-1 built it (`test/mk1-publish-probe.mjs`): op=ratify on an observation whose bytes
       were in the working bucket PUBLISHED its words, its provenance document and the observer's handle.
       Since MK-6 an observation's files name nobody (§4.1), so what stays fenced here is an observation
       written BEFORE that, which still names its author in its own files, and a finding resting on one:
       no level can hide a name the bundle prints. Below the scope check and the machine fence, before the
       signature is weighed. */
    const legacy = Array.isArray(facts.testimonyLegacy) ? facts.testimonyLegacy : [];
    if (facts.testimony && facts.testimony.self.length && legacy.includes(body.bundleId))
      return json({ ok: false, reason: "TESTIMONY_UNPUBLISHABLE", ...rowOf("TESTIMONY_UNPUBLISHABLE"),
        bundleId: body.bundleId,
        detail: `${body.bundleId} is a member's observation whose own files name its author (written before §4.1), or `
              + `cannot be read to show they do not; publishing it could publish that name at any level `
              + `(MEMBER-KNOWLEDGE-DESIGN.md §4.1)`,
        store: storeName, tokenClass: cls }, 409);
    if (facts.testimony && facts.testimony.via.some((v) => legacy.includes(v.observation)))
      return json({ ok: false, reason: "TESTIMONY_CITED_UNPUBLISHABLE", ...rowOf("TESTIMONY_CITED_UNPUBLISHABLE"),
        bundleId: body.bundleId, rests_on: facts.testimony.via.filter((v) => legacy.includes(v.observation)),
        detail: `${body.bundleId} rests on an observation whose own files name its author (written before §4.1) or `
              + `cannot be read to show they do not `
              + `(${facts.testimony.via.filter((v) => legacy.includes(v.observation)).slice(0, 5).map((v) => v.observation).join(", ")})`,
        store: storeName, tokenClass: cls }, 409);
    /* END DEC-49 REGION is-testimony-publish-bundle */
    /* DEC-49 REGION is-attribution-ratify — MK-7 / C-92.12. THE LIFT OF C-53.10 for an observation in
       §4.1's form: its own bytes cross only as a ratified case's evidence (D-431 (b), in the committer) AND
       only once a RATIFIED case document states the level its author chose for it (§4.3). D-431 alone would
       let them cross beside no statement of whose they are. A finding resting on one needs nothing more
       here: it crosses only as a member of a ratified case (D-431 (a)), and op=caseratify refused that case
       until every observation it reaches was chosen (C-92.10). */
    if (facts.testimony && facts.testimony.self.length && !facts.attributionStated)
      return json({ ok: false, reason: "ATTRIBUTION_UNSTATED", ...rowOf("ATTRIBUTION_UNSTATED"),
        bundleId: body.bundleId,
        detail: `no ratified case document states an attribution for ${body.bundleId}; sign the case edition that `
              + `uses it (op=caseratify) first, and its author's chosen level is published with it`,
        store: storeName, tokenClass: cls }, 409);
    /* END DEC-49 REGION is-attribution-ratify */
    if (facts.row.bundle_sha !== body.expectedSha)
      return json({ ok: false, reason: "RATIFY_STALE",
                    detail: "the record has changed since it was reviewed; read it again and re-sign",
                    expected: facts.row.bundle_sha, got: body.expectedSha, store: storeName, tokenClass: cls }, 409);

    if (!facts.signers.length)
      return json({ ok: false, reason: "NO_SIGNERS",
                    detail: "no active registered signing keys; an admin must register a member key before anything can be ratified",
                    store: storeName, tokenClass: cls }, 409);
    const sv = await verifySshsig(body.sig, ratifyStatement(body.bundleId, body.expectedSha),
                                  NS_RATIFY, facts.signers.map((s) => s.key_b64));
    if (!sv.ok)
      return json({ ok: false, reason: "SIG_" + sv.reason,
                    ...(sv.keyB64 ? { keyB64: sv.keyB64 } : {}),
                    ...(sv.detail ? { detail: sv.detail } : {}),
                    store: storeName, tokenClass: cls }, 403);
    const attestor = facts.signers.find((s) => s.key_b64 === sv.keyB64);

    /* REC-25's ratifier scope, `ratViewer`, is taken above at the gate facts (REC-140). */
    /* REC-53: `runGate` does `Object.entries(image || {})`, so a silence here
       handed the gate an EMPTY BUNDLE and the ratification came back
       GATE_REFUSED with the catalog's findings about missing required files —
       a publisher told their document is empty when the plane simply failed to
       read it. Same shape as `do/list` below, one field earlier. */
    const imgOut = await doAnswer(stub.fetch(`http://do/image?id=${encodeURIComponent(body.bundleId)}&viewer=${ratViewer}`));
    if (imgOut.refused) return storeRefused(imgOut, relay);
    if (!imgOut.answered) return storeSilent("ratify/image", imgOut.correlation);
    const image = imgOut.result;
    const r2 = typeof env.CAPTURES?.head === "function";
    /* The catalog resolves references against the whole store, so it reads which identifiers exist, once. REC-53: a
       silence is refused, never handed to the gate as an empty set (which would report every reference as not
       resolving); once `answered`, an empty list is a real answer (a viewer who can see no bundles), hence `|| []`. */
    const listOut = await doAnswer(stub.fetch(`http://do/list?viewer=${ratViewer}`));
    if (listOut.refused) return storeRefused(listOut, relay);
    if (!listOut.answered) return storeSilent("ratify/list", listOut.correlation);
    const known = new Set((listOut.result || []).map((b) => b.bundle_id));
    /* N417 (K691): THE GATE RUNS IN THE STORE HALF (`ratifygate`), on this host's promotion instance, so the type
       grammars later modules registered with record-core (C-2.7 among them) reach it as they reach promote's; the
       Worker holds no host whose registrations it could read. What the gate reads is what this act read above under
       the ratifier's scope, handed over whole. The register rows' bytes are probed there, in-process (the evidence
       store, the register's receipts, the parts the bundle's record names); a store refused or silent here is R17's
       relay, never a finding about the bytes (N354, K477): an unanswered gate is never read as a clean one, nor its
       silence as PLANE_MISSING_BYTES.
       D-556: `parted` names the parts of each whole-hash row the gate admitted as HELD IN PARTS, as the record names
       them, keyed by the whole hash. Publication copies exactly these, part by part. */
    const gateOut = await doAnswer(stub.fetch(new Request("http://do/ratifygate", {
      method: "POST", body: JSON.stringify({
        bundleId: body.bundleId, image, knownIds: [...known],
        registers: facts.registers,
        /* REC-14: the two facts the catalog cannot read out of the bundle -- what THIS case asserted at its previous
           EDITION (C-21.1) and what the cases beneath it FROZE when they were signed (C-21.2). They come from the
           store with the rest of the gate facts, so the gate and the write path judge against the same published
           record. Passing nothing here does not soften the gate, it blinds it. REC-44: C-21.1's fact at CASE altitude
           travels in its own registry. REC-18: and what each basis target EARNS from the record, so the gate and
           op=promote's write path judge an earned leg identically. */
        publishedRegistry: facts.publishedRegistry,
        publishedCaseRegistry: facts.publishedCaseRegistry,
        earnedRegistry: facts.earnedRegistry,
      }) })));
    if (gateOut.refused) return storeRefused(gateOut, relay);
    if (!gateOut.answered) return storeSilent("ratify/gate", gateOut.correlation);
    const { parted, ...registerGate } = gateOut.result || {};
    const partedRows = new Map(Array.isArray(parted) ? parted : []);
    /* The C-18 register arms run after the catalogue, over the same image (provenance R42–R46, K72 (4)), and
       bias's C-26.1–C-26.7 over it too (bias R9, K146): the catalogue no longer runs them. */
    /* R9: C-2.8's case-member arm, which the catalogue no longer runs, joins after it over the same image. */
    const gate = withCaseMemberChecks(image, withBiasChecks(image, withRegisterChecks(image, registerGate)),
                                      parseFrontmatter);
    if (!gate.ok)
      return json({ ok: false, reason: "GATE_REFUSED", gateVersion: gate.gateVersion,
                    findings: gate.findings, store: storeName, tokenClass: cls }, 409);

    /* REC-22: a capture part's SIZE, taken from the register the store already
       handed us with the gate facts. The public file manifest states per-file
       sha AND bytes, and a blob part is the one kind whose length is not in
       the image — reading it here costs nothing (the rows are already in
       memory) and beats a HEAD per part against R2. Absent means absent: a
       part the register does not size stays `null` rather than being given a
       plausible number. */
    const registerBytes = new Map((facts.registers || []).map((r) => [r.path, r.bytes]));
    const shas = [];
    for (const [path, v] of Object.entries(image)) {
      if (path.startsWith("_history/")) continue;
      if (typeof v === "string") {
        const sha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)))]
          .map((x) => x.toString(16).padStart(2, "0")).join("");
        shas.push({ sha256: sha, path, kind: path === "bundle.md" ? "bundle" : "file",
                    bytes: new TextEncoder().encode(v).length, text: v });
      } else if (!partedRows.has(v.blobSha)) {
        shas.push({ sha256: v.blobSha, path, kind: "capture",
                    bytes: registerBytes.has(path) ? registerBytes.get(path) : null });
      }
    }
    /* D-556 (BOB #34, 2026-09-25 00:00Z): a capture the gate admitted as HELD IN PARTS is published AS its
       parts, each under its own hash, because no object exists under the whole's. A part the image already
       carries as a file of its own (C-18.1's filing) is published once, under that path; any other part the
       record names joins the list. The whole's identity and its parts travel in the bundle's own
       data/provenance.json, published beside them, so a reader can reassemble it. */
    const partShaSet = new Set();
    for (const [whole, parts] of partedRows) {
      const at = (facts.registers || []).find((r) => r.capture_sha === whole)?.path || whole;
      parts.forEach((p, i) => {
        partShaSet.add(p.sha256);
        if (!shas.some((s) => s.sha256 === p.sha256))
          shas.push({ sha256: p.sha256, path: p.file || `${at}.part${i + 1}`, kind: "capture_part", bytes: p.bytes });
      });
    }

    /* REC-14 / DEC-12: the EDITION, the frozen pair, the declared bar and the
       completeness assertion all come out of the RATIFIED BYTES -- never off
       the request and never re-derived here. The signature covers this
       document, so anything committed beside it must be inside the hash the
       member signed; re-deriving the strength at this point would put a
       number in the public projection that nobody attested. An inquiry that
       is not `published` ratifies exactly as before with edition 1, which is
       what every information bundle is. */
    const ratifiedFm = typeof image["bundle.md"] === "string"
      ? (parseFrontmatter(image["bundle.md"]).data || {}) : {};
    /* CASE-4 / DEC-72: THE CASE RELATION, read out of the SIGNED BYTES exactly
       as the state word was. A member finding no longer wears `published`; it
       asserts membership of a case edition, and that assertion is inside the
       hash the member signed for REC-44's own reason. Left keyed on the state
       word, this would be FALSE for every document published after this item —
       and everything it gates would then quietly take its non-case default:
       edition 1, no frozen strength, no frozen completeness, no case. A case
       would ratify as though it were an information bundle, with the suite
       green, which is why this line is the most dangerous one in the change. */
    const isCase = normalizeType(ratifiedFm.object_type) === "inquiry"
      && isCaseMemberBytes(ratifiedFm);
    const edition = isCase && Number.isInteger(ratifiedFm.edition) ? ratifiedFm.edition : 1;
    const frozenStrength = isCase && Array.isArray(ratifiedFm.published_strength)
      ? ratifiedFm.published_strength : null;
    const frozenCompleteness = isCase ? {
      ...completenessFields(ratifiedFm),
      subject_position: ratifiedFm.completeness?.subject_position ?? null,
      author: ratifiedFm.completeness?.author ?? null,
      at: ratifiedFm.completeness?.at ?? null,
    } : null;
    /* ===== CASE-5b / DEC-72: EIGHT CASE READS LEFT THIS BLOCK ==============

       `caseId`, `caseFindings`, `caseScope`, `caseProject`, `caseRoles`,
       `caseEdition`, `caseBar` and `caseBiasAck` were all read out of THIS
       MEMBER'S ratified frontmatter and handed to `publish()`, which committed
       `cases`, `published_cases` and the roster from them. That was the only
       way to get a case fact inside a signature, and REC-44's sentence for it
       was exact: *a case identity, a scope statement or a roster that is not
       inside the hash the member signed is one this plane would be asserting on
       their behalf.*

       THE SENTENCE IS UNCHANGED AND THE HASH IS A DIFFERENT ONE NOW. Those
       facts are committed by `op=caseratify`, out of the CASE DOCUMENT a member
       reviewed and signed, before any member ratifies. So this act has no case
       fact to read and none to pass: it commits one finding's own published
       row, and the store resolves which case that row belongs to from the PIN
       the case froze — `published_case_members.version_sha = bundle_sha`,
       CASE-3's column answering CASE-3's question.

       WHAT STAYED IS WHAT WAS ALWAYS THE FINDING'S — its own edition, its
       frozen strength pair, its frozen completeness. Read out of the ratified
       bytes exactly as before, and out of nothing else. ==================== */

    /* DEC-34 as REC-44 corrects it: THE CONTAINER IS THE CASE'S, and it is
       therefore NOT BUILT HERE. It used to be, because a case was assumed to
       be one inquiry and the manifest could be assembled from the one
       document this act ratifies. A case holds one or MORE findings, each
       signed on its own bytes, so the container can only be assembled when
       the LAST member of an edition lands — which is why it is built below,
       after the store has said whether this ratification completed the
       edition. Everything DEC-34 required is unchanged: every part named by
       sha256, the manifest answerable by its own hash, and tamper-EVIDENT
       rather than tamper-proof.

       DEC-34: the CONTAINER's signed hash manifest. "Protected" means
       TAMPER-EVIDENT and the record must never claim otherwise -- a zip
       password is either broken encryption or a lock on the stranger this
       surface exists to serve, and a PDF's write-protect flag is advisory.
       What actually protects: every part is listed here by sha256, the
       manifest names the bundle sha the SSHSIG covers and carries the
       armored signature itself, and the manifest's OWN sha goes into
       published_shas -- so any copy of the container anywhere can be checked
       against this instance by hash, and a modified copy is DETECTABLE by
       anyone without our cooperation. That is the stronger property, and it
       needs no DRM.

       THE CONTAINER IS THE BUNDLE'S PORTABLE FORM, not a new object: the
       parts listed here ARE the bundle's files, each already content-addressed
       in the published bucket. `layout` says how they serialise into the zip
       so REC-22 -- which serves the container and its PDF renderings -- has a
       shape to build against rather than one to invent. The renderings and
       the per-page brazening are REC-22/UI-18's half and are deliberately not
       produced here; when they land they join `parts` with kind "rendering"
       and the manifest shape does not change.

       EDITIONS ARE OVER THE CONTAINER (DEC-12): a new edition is a new
       manifest with a new hash, and earlier editions keep answering. */
    /* REC-22 / R4: THE PUBLISHED GRAPH, read out of the RATIFIED BYTES and out
       of nothing else — not the caller's request, not the working `refs`
       table, which is a projection of whatever bundle.md says today and moves
       under a published edition every time somebody promotes. What the
       signature covers is what the published graph says.

       The CLASSIFICATION is made here and enforced in the store:
         - references[]      candidates for a SERVE edge. The store admits one
                             only if the target is itself published; a
                             reference to a target not yet published is HELD
                             PRIVATELY (its id never enters the published
                             graph, which is what stops that graph naming
                             working material) and becomes a SERVE edge when
                             the target is published (R5, R16; publication
                             R22, R35; Bob, K283).
         - division_parent   NAME-ONLY, by kind, whatever the target's state.
         - division_siblings A divided parent is TERMINAL and can never be
                             published and a sibling may not be, so R4's
                             disclosure — "a published child names its parent
                             and its siblings" — exists only as a name-only
                             edge. It is name-only even when the target IS
                             published: the rule is "names them while serving
                             neither", which is about the disclosure and not
                             about what happens to be reachable. */
    /* D-431: THE CLASSIFICATION ABOVE NOW LIVES IN ONE PLACE, publication's `publishedGraphEdges`, moved there
       verbatim — because the same edge set is what a ratified case's finding RESTS ON, and the store's
       refusal of a bundle outside a ratified case reads it too (BIO_Publication_v0_1.md §3 rule 2: the
       refusal and the serving read one quantity). Do not spell the list here again. */
    const edges = publishedGraphEdges(ratifiedFm);

    /* REC-53: THE COMMIT, and the last site that may refuse. A silence here
       synthesised `reason:"PUBLISH_FAILED"` at HTTP 500 — a ternary fallback,
       which is why REC-52's detector B (built for the `||` form) could not see
       it. It is the same invention: the plane asserting the ratification did
       NOT publish when it does not know whether it did. The fallback SURVIVES
       below and is now honest, because it is reached only when the store
       ANSWERED with a result carrying no reason of its own — a description of
       what the store said rather than of a silence. */
    /* REC-128: the deliverer from the SESSION ROW, the signer from the SIGNATURE,
       each from its one source — `op=caseratify`'s twin block says why, including
       why the signer's `?? sessMember` fallback is gone. */
    const deliveredBy = deliveringPrincipal(sessRights); /* REC-128: op=ratify */
    const pubOut = await doAnswer(stub.fetch(new Request("http://do/publish", {
      method: "POST", body: JSON.stringify({
        bundleId: body.bundleId, bundleSha: body.expectedSha, deliveredBy,
        attestorKey: sv.keyB64, attestorMember: attestor?.member_id ?? null,
        gateVersion: gate.gateVersion, sigArmored: body.sig,
        /* Only a CASE names its edition, and it names it in the signed bytes.
           Everything else leaves it to the store, which appends the next one
           — an information bundle has no authored edition to assert and the
           control plane must not invent one for it. */
        ...(isCase ? { edition } : {}), title: ratifiedFm.title ?? null,
        completeness: frozenCompleteness, strength: frozenStrength,
        /* D-442 / BIO_Publication_v0_1.md §3 rule 12: a member published under rule 12 carries
           no frozen block in its own bytes (`isCase` false), and the store reads its edition and
           frozen pair from the RATIFIED case documents pinning these bytes instead. Legacy bytes
           carry their own, read above exactly as before (rule 12 (e)). */
        memberCarriesBlocks: isCase,
        /* CASE-5b: `required` IS NOT SENT ANY MORE. The bar is the CASE's
           (DEC-72 clause 2) and it left these bytes with the rest of the case,
           so there is nothing here to send. `publish()` reads it from
           `published_cases.bar` — committed from the case document a member
           signed — which is the same doctrine reading a different signature. */
        group: ratifiedFm.group ?? null,
        edges,
        shas: shas.map(({ text, ...s }) => s),
      }) })));
    if (pubOut.refused) return storeRefused(pubOut, relay);
    if (!pubOut.answered) return storeSilent("ratify/publish", pubOut.correlation);
    const pub = pubOut.result;
    if (!pub?.ok)
      return json({ ok: false, ...(pub && pub.reason ? pub : { reason: "PUBLISH_FAILED", detail: pub }),
                    store: storeName, tokenClass: cls },
                  pub && (pub.reason === "EDITION_NOT_INCREMENTED" || pub.reason === "EDITION_EXISTS"
                          /* CASE-2 / DEC-72: a DISAGREEMENT BETWEEN SIGNED DOCUMENTS (the case's signer and this
                             member's own frozen bytes), which is what 409 says here, not a fault in this request.
                             T18 (T17's finding): CASE_MEMBERSHIP_DIVERGED, CASE_ROLES_DIVERGED,
                             CASE_PRODUCTION_DIVERGED, CASE_NAMES_NO_PROJECT and CASE_ROSTER_EXCLUDES_SELF left this
                             list: publication's commit has not answered them since CASE-5b (one copy of a case fact
                             cannot disagree with itself), and none has a row. */
                          || pub.reason === "CASE_ASSERTION_DIVERGED"
                          /* REC-140: a pinned finding's authority refusals (C-57.1, and
                             C-56.1 through REC-134's one check) — the REQUEST was refused,
                             which is what 409 says; `op=caseratify` relays the same two. */
                          || pub.reason === "CASE_SIGNER_NOT_AN_OWNER"
                          || pub.reason === "PROJECT_ACT_NOT_A_PARTICIPANT"
                          /* D-431: nothing crosses outside a ratified case (C-58.2, C-58.3) — the
                             REQUEST was refused, 409, as the other C-58 refusal answers. */
                          || pub.reason === "RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE"
                          || pub.reason === "RATIFY_NOT_EVIDENCE_OF_A_RATIFIED_CASE") ? 409 : 500);

    /* The fence: ratified bytes land content-addressed in the published
       bucket, so the published corpus is self-contained. Existing keys
       are immutable and skipped; captures stream across from the working
       bucket where their presence was just gate-verified. */
    let copied = 0, present = 0, r2state = "not configured";
    if (typeof env.PUBLISHED?.put === "function" && r2) {
      r2state = "ok";
      for (const s of shas) {
        const key = `${storeName}/published/${s.sha256}`;
        if (await env.PUBLISHED.head(key)) { present++; continue; }
        if (s.kind === "capture" || s.kind === "capture_part") {
          const obj = await env.CAPTURES.get(`${storeName}/captures/${s.sha256}`);
          if (!obj) { r2state = "INCOMPLETE: capture vanished between gate and copy"; continue; }
          if (!partShaSet.has(s.sha256)) await env.PUBLISHED.put(key, obj.body);
          /* D-556: a part is put with its digest, so R2 refuses bytes that do not hash to it; a refused put
             leaves the part absent, and the re-verification below names it. */
          else try { await env.PUBLISHED.put(key, obj.body, { sha256: s.sha256 }); } catch { continue; }
        } else {
          await env.PUBLISHED.put(key, new TextEncoder().encode(s.text));
        }
        copied++;
      }
    }
    /* D-556 (BOB #34, 2026-09-25 00:00Z): EVERY PART, RE-VERIFIED AT THE DESTINATION. A part copied or found
       already present is headed in the published bucket and its digest checked by the same `partsHeld` the
       gate ran on the working one; a part that is not there, or whose digest fails or cannot be checked, is
       NAMED in the answer and the copy is INCOMPLETE, never reported ok. */
    const partShas = [...new Map([...partedRows.values()].flat().map((p) => [p.sha256, p])).values()];
    let partsPublished = null;
    if (partShas.length && r2state !== "not configured") {
      const v = await partsHeld(env.PUBLISHED, (s) => `${storeName}/published/${s}`, partShas);
      const bad = [...v.missing, ...v.disagree, ...v.unverified];
      partsPublished = { parts: partShas.length, verified: partShas.length - bad.length,
                         ...(v.missing.length ? { missing_parts: v.missing } : {}),
                         ...(v.disagree.length ? { disagreeing_parts: v.disagree } : {}),
                         ...(v.unverified.length ? { unverified_parts: v.unverified } : {}) };
      if (bad.length)
        r2state = `INCOMPLETE: ${bad.length} of ${partShas.length} parts did not verify in the published `
                + `bucket: ${bad.map((p) => p.file || p.sha256).join(", ")}`;
    }

    /* REC-44 / DEC-34: THE CASE CONTAINER, assembled the moment the LAST
       member finding of an edition is ratified and not before. A case is a
       container over one or MORE findings, each signed on its own bytes, so
       there is a real window in which a case edition EXISTS and cannot be
       served whole; the store states that as `awaiting` rather than
       pretending, and a manifest built earlier would name parts that are not
       in the published store yet — the PART_MISSING refusal by construction.
       DEC-44 determination 3 is what makes the assembly non-negotiable: a
       stranger holding the zip must be able to check EVERY finding the case
       rests on without contacting this instance, so naming them is not enough
       and every member's parts are carried in full.
       There is NO case-level strength here and there must never be one: each
       finding carries its own frozen pair inside findings[], and one letter
       over the case is R2's forbidden composition at case altitude. */
    let container = null;
    /* D-442 / BIO_Publication_v0_1.md §3 rule 12: THE ASSEMBLY IS ONE FUNCTION NOW, CALLED FROM
       BOTH ACTS THAT CAN COMPLETE A CASE EDITION. It was inline here, which was complete while every
       publication promoted its members: a case's pins were always fresh bytes, so the LAST member's
       op=ratify was always the act that completed it. Rule 12 pins a finding at the bytes it has, so
       a case over a finding ANOTHER case already carried across is complete the moment its own
       document is ratified (op=caseratify) — and a sha several cases pin ratifies with no SOLE case
       (`pub.case` absent, IC-74), so every such case edition is named in `containerCases`. Moved
       verbatim; nothing in the manifest changed but the sentence rule 12 adds to `verify`. */
    if (pub.case && pub.case.complete && !pub.case.manifest_sha)
      container = await assembleCaseContainer({ env, stub, storeName, cs: pub.case, via: "ratify" });
    else if (Array.isArray(pub.containerCases))
      for (const cs of pub.containerCases)
        if (cs && cs.complete && !cs.manifest_sha)
          container = await assembleCaseContainer({ env, stub, storeName, cs, via: "ratify" });

    /* CAP-4 / CAPTURE-SCALING item 6: re-fetch the reused parts at
       ratification, which is where a working capture's reuse becomes evidence.
       MANDATORY as an ATTEMPT AND A RECORD, never as agreement (item 6b): the
       four outcomes -- confirmed, changed, unavailable, not_attempted -- all
       ratify and say different things, and the one forbidden thing is ratifying
       with a reused part and saying nothing. A PLAIN GET, not If-None-Match
       (item 6c): both cost the one scarce subrequest, but our own SHA-256 over
       what we received is the evidence the record is keyed on, where a 304 would
       be only the origin's assertion. Bounded by the calibrated capture_limits
       ceiling (item 6d): parts the budget cannot reach are recorded
       `not_attempted` WITH the reason, never silently omitted. Ratification is
       rare and deliberate, so the budget is available exactly when the stakes
       rise; this does not gate -- every outcome still ratifies. */
    let reuseReport = null;
    /* REC-53, THE ITEM'S SECOND NAMED SITE. A silence made `reused` undefined,
       the guard below fell through, `reuseReport` stayed null and the `reuse`
       key was simply ABSENT from the answer — which reads as "no part of this
       bundle was reused", a statement about WHAT THE GROUP DID, manufactured
       out of a failure to look. Worse than it sounds against item 6b directly
       above: "the one forbidden thing is ratifying with a reused part and
       saying nothing" is precisely what a store silence made the plane do.
       Post-commit, so it states the undetermined rather than refusing. */
    const reusedOut = await doAnswer(stub.fetch(`http://do/reusedparts?id=${encodeURIComponent(body.bundleId)}`));
    const reused = reusedOut.result;
    if (!reusedOut.answered) {
      reuseReport = { ok: false, reason: STORE_SILENT_REASON, op: "ratify/reusedparts",
                      detail: STORE_SILENT_DETAIL,
                      note: "whether this record reused any part from the record is UNDETERMINED for this "
                          + "ratification, and that is NOT the same as no part having been reused. The "
                          + "record is ratified -- the signature, the gate and the published rows are all "
                          + "unaffected by this read -- and the reuse re-check (CAP-4 item 6b) did not "
                          + "happen. Re-ratifying converges it." };
    } else if (reused && Array.isArray(reused.parts) && reused.parts.length) {
      /* REC-53: a silence here left `observed` null, which is ALSO what a
         genuine "nothing calibrated yet" answers — so the recorded basis of
         every not_attempted part said "none observed" about a ceiling nobody
         read, and that sentence is written into the RECORD by
         recordreuseverdicts below. The two are separated by `ceilingRead`. */
      const limOut = await doAnswer(stub.fetch("http://do/capturelimit?runtime=subrequests"));
      const ceilingRead = limOut.answered;
      const lim = limOut.result;
      const observed = ceilingRead && lim && lim.observed ? lim.observed : null;
      const ceilingWord = !ceilingRead
        ? "UNREAD -- the store did not answer the capture-limit read, so this budget is our own appetite "
          + "and not a calibrated ceiling"
        : observed == null ? "none observed" : String(observed);
      /* Our APPETITE is ours and constant; the runtime's CAPACITY is the
         observed ceiling, discovered by being refused (capture_limits doctrine).
         A margin is reserved for the plane's own DO/R2 subrequests during this
         ratification so re-fetching does not itself trip the ceiling. */
      const appetite = Number(env.RATIFY_REFETCH_BUDGET) || 500;
      const margin = env.RATIFY_REFETCH_MARGIN !== undefined ? (Number(env.RATIFY_REFETCH_MARGIN) || 0) : 4;
      const budget = observed != null ? Math.min(appetite, Math.max(0, observed - margin)) : appetite;
      const rhex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
      const verdicts = [];
      let spent = 0;
      for (const p of reused.parts) {
        const base = { source_capture: p.primary_sha, host: p.host,
                       address_norm: p.address_norm, reused_sha: p.reused_sha };
        if (!p.address || !isPublicHttpsLocator(p.address)) {
          verdicts.push({ ...base, verdict: "unavailable", observed_sha: null,
            basis: "the reused part has no re-fetchable public https address on record, so the source "
                 + "cannot be re-checked; ratified with the bytes captured on the day" });
          continue;
        }
        if (spent >= budget) {
          verdicts.push({ ...base, verdict: "not_attempted", observed_sha: null,
            basis: `this ratification's re-fetch budget (${budget}, bounded by the calibrated subrequest `
                 + `ceiling ${ceilingWord}) was spent before this part; `
                 + `it is recorded as outstanding, not silently omitted` });
          continue;
        }
        spent++;
        let r = null;
        try { r = await fetch(p.address, { redirect: "follow", headers: { "user-agent": userAgent(env, "ratify") } }); }
        catch { r = null; }
        if (!r || !r.ok) {
          verdicts.push({ ...base, verdict: "unavailable", observed_sha: null,
            basis: `a plain GET returned ${r ? r.status : "a network error"}; the source no longer answers, `
                 + `and the record is ratified with the bytes captured on the day` });
          continue;
        }
        const got = rhex(await crypto.subtle.digest("SHA-256", new Uint8Array(await r.arrayBuffer())));
        if (got === p.reused_sha)
          verdicts.push({ ...base, verdict: "confirmed", observed_sha: got,
            basis: "a plain GET re-fetched the reused part and our own SHA-256 over what we received "
                 + "matches the reused bytes" });
        else
          verdicts.push({ ...base, verdict: "changed", observed_sha: got,
            basis: "a plain GET returned different bytes than were reused; ratified with the bytes captured "
                 + "on the day, the divergence recorded as the dated fact it is" });
      }
      const at = new Date().toISOString();
      /* REC-53: this write was FIRE-AND-FORGET, so a silence left the verdicts
         out of the record while the report below handed the caller the
         outcomes and the sentence "every reused part carries an outcome" —
         true of the response, false of the record it names. Being unread, it
         was invisible even to REC-52's detector C, which only sees a body that
         is CONSUMED; the block-level assertion in the old `plane-envelope.test.mjs`
         covered it then, and R6's test of this silence (`test/m/ratification/
         converted-c.test.mjs`, ratify-envelope site 8) covers it now. */
      const vOut = await doAnswer(stub.fetch(new Request("http://do/recordreuseverdicts", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ bundleId: body.bundleId, at, verdicts }) })));
      const tally = (k) => verdicts.filter((v) => v.verdict === k).length;
      reuseReport = {
        reused_parts: reused.parts.length, budget,
        /* Both spreads are EMPTY on the answered path, so a working instance's
           answer is byte-identical to what it was before this item; the extra
           field exists only where the answer used to be a claim nobody could
           support. */
        ...(ceilingRead ? { ceiling: observed }
                        : { ceiling_unread: { reason: STORE_SILENT_REASON, op: "ratify/capturelimit",
                                              detail: STORE_SILENT_DETAIL } }),
        confirmed: tally("confirmed"), changed: tally("changed"),
        unavailable: tally("unavailable"), not_attempted: tally("not_attempted"),
        outcomes: verdicts.map((v) => ({ address_norm: v.address_norm, source_capture: v.source_capture,
                                         verdict: v.verdict, observed_sha: v.observed_sha, basis: v.basis })),
        note: "every reused part carries an outcome. confirmed/changed/unavailable all ratify and say "
            + "different things; not_attempted names a part the budget could not reach. Re-fetch is a plain "
            + "GET, hashed by us -- a reused part ratified in silence is what is forbidden.",
        ...(vOut.answered ? {}
                          : { recorded: { ok: false, reason: STORE_SILENT_REASON,
                                          op: "ratify/recordreuseverdicts", detail: STORE_SILENT_DETAIL,
                                          note: "the outcomes above are what this ratification OBSERVED; "
                                              + "whether they reached the record is undetermined, so do not "
                                              + "read their absence from the reuse history as their never "
                                              + "having been checked. Re-ratifying converges it." } }),
      };
    }

    return json({ ok: true, bundleId: body.bundleId, bundleSha: body.expectedSha,
                  edition: pub.edition,
                  /* REC-22: the manifest's own hash IS the container's identity — every
                     part is named and hashed by it — so it is also the address the zip
                     is served at (op=publishedbytes&sha256=<manifest_sha>&format=zip),
                     and `graph` reports what the published edges did: how many the
                     surface may SERVE, how many it may only NAME, and how many
                     references to material not yet published were held privately
                     (counts, as publication answers them; a held target's id is never
                     published, R5). */
                  /* REC-58, 2026-08-05: THIS PICK IS A FENCE AND IS NAMED AS
                     ONE, because it was doing the work with nothing saying
                     so. `pub.case` is `#caseEditionState`'s WHOLE return,
                     arriving over the internal `do/publish` hop, and it
                     carries `opened` — the only route by which that field can
                     leave the store. Five fields are forwarded and `opened` is
                     not among them, so it stops here. KEEP THIS A PICK: a
                     `...pub.case` would put an unconsumed field (re-measured
                     at zero consumers by REC-58) on a public answer with
                     nobody having decided to publish it. R6's tests
                     (`test/m/ratification/converted-d.test.mjs`, REC-58;
                     `ratify-op.test.mjs`) assert the block's keys are exactly the
                     named fields and that `opened` is absent. */
                  ...(pub.caseId ? { caseId: pub.caseId,
                                     case: { edition: pub.case?.edition ?? null,
                                             complete: !!pub.case?.complete,
                                             awaiting: pub.case?.awaiting ?? [],
                                             findings: (pub.case?.findings ?? []).map((f) => f.bundle_id),
                                             detail: pub.case?.detail ?? null } } : {}),
                  container: container
                    ?? (pub.case && pub.case.manifest_sha
                      ? { manifest_sha: pub.case.manifest_sha,
                          zip: `op=publishedbytes&sha256=${pub.case.manifest_sha}&format=zip` }
                      : null),
                  graph: pub.edges ?? null,
                  /* D-442 / BIO_Publication_v0_1.md §3 rule 12: where this edition's number and
                     frozen pair were read from — the finding's own bytes (legacy), the case
                     documents pinning them, or neither — and whether those documents disagreed
                     about the pair. Two scalars, forwarded by name like every field here. */
                  frozenFrom: pub.frozenFrom ?? null,
                  ...(pub.strengthUndetermined ? { strengthUndetermined: true } : {}),
                  existed: pub.existed, ratifiedAt: pub.ratifiedAt,
                  attestor: attestor?.member_id ?? null, gateVersion: gate.gateVersion,
                  /* REC-128: who DELIVERED this request (a retry that `existed`
                     wrote nothing; the record keeps its first deliverer). */
                  deliveredBy: delivererOf(deliveredBy),
                  published: { shas: shas.length, copied, alreadyPresent: present, r2: r2state,
                               ...(partsPublished ? { parts: partsPublished } : {}) },
                  ...(reuseReport ? { reuse: reuseReport } : {}),
                  store: storeName, tokenClass: cls }, 200);
}
