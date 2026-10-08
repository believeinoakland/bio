/* control-plane: THE INSTANCE'S DOOR (R1–R68). The Worker's HTTP entry — routing and the stamps (the answer's envelope
   and decoration are `answer-envelope`'s, the store's door `store-door`'s, since the split, K1907, K1974) — moved from legacy-index (`index.mjs`) at control-plane's extraction (T12, K3, K93). Who may call an op is
   `admission`'s and what each op is `op-declarations'` (the split, K617, K624 (2)): this door calls admission's gates in
   R28's order and reads op-declarations' tables. An op's own handler is its module's: `makeFetch(hooks)` takes the
   hooks `plane` composes from the arms' owners (`publicOp` for the unauthenticated ops, `gatedOp` for the admitted ones,
   plane R6) and routes to them, so routing is one place (the map's §3). */
/* The shared grammar this door reads (the front matter, the digest, a type's canonical spelling, the two machine-stamp
   prefixes) is record-grammar's. */
import { parseFrontmatter, createSha256, normalizeType, MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX } from "../record-grammar/index.mjs";
/* C-68.1 (K794, K796, K850): the capability complaint is acquisition's, minted at its one region (`evidenceStorageAbsent`). */
import { evidenceStorageAbsent } from "../acquisition/index.mjs";
/* K617, K624 (2): who may call an op is `admission`'s — the namespace gates, the credential's resolution, the admission
   in its order, the bearer fences, the reader of a public op's caller and the mint's secrets — called here in R28's
   order; each gate answers `null`, a refusal `{status, body}` this door answers as given, or a silence. */
import { SCRATCH, classify, scopeFor, namespaceGate, confinedNamespaceGate, pinnedNamespaceGate,
         aiCredentialPresented, admit, bearerFence, readerOf, aiCredentialMint, reviewGrantSecret,
         projectCreationGate, queryGate } from "../admission/index.mjs";
/* T35 (admission R20–R22; F1, F4, N703; K2044): the credential read once from the header or the body, the public ops'
   window and the caller's source and country, and the security tally of every refusal the door gives or relays. (T36;
   K2111) A credential in the address is refused by admission's gate (its R20, C-38.10), the code's one site. */
import { presentedCredential, doorWindowGate, sourceOf, countryOf, securityTally } from "../admission/index.mjs";
import { credentialAddressGate } from "../admission/index.mjs";
/* answer-envelope (its R1–R8; the split, K1907, K1974): the envelope, its decoration, the store's answer read once, the
   internal-error answer, the row readers, the page policy and the composed catalogue the published fences read (R41). */
import { json, doAnswer, storeRefusal, storeSilent, relayAnswer, planeInternalError, replayRow, requiredArgument,
         installationRow, dispatchRow, withPagePolicy, CHECK_FAMILIES } from "../answer-envelope/index.mjs";
/* R57 (T35): the draft asked of agent-worker once every refusal is answered. */
import { draftDue, draftAsk, checkedDraft, TRANSLATION_DRAFT, TRANSLATION_RECORD } from "./draft.mjs";
/* R58 (T35): the promotions of what an unpack files. */
import { archiveDocuments, promoteArchive } from "./archive.mjs";
/* R65 (T37): a member's own Claude sign-in, relayed to their own runner, and its sign-out when they leave. */
import { subscriptionSignin, leaverOf, signoutLeaver } from "./signin.mjs";
import { machineFences, renderPack } from "../skillpack.mjs";
import { liveToken } from "../tokens.mjs";
import { SIGN_HTML } from "../signpage.mjs";
import { setupPage, instanceGroupOp, groupIdentityOp } from "../setup.mjs";
import { inbandQuartet } from "../inband.mjs";   /* REC-148: DEC-31's in-band quartet, one function */
/* R45 (DEC-111, K1170): a registered public read is served by public-read's door read (its R18). */
import { publicReadDoorRead } from "../public-read/door.mjs";
/* R44 (K921): the template grant's one dead answer is filing-templates' (its R8), built from no argument. */
import { noTemplateGrant } from "../filing-templates/index.mjs";
import { normalizeAddress } from "../subresources.mjs";
/* R18: the capability vocabulary `op=whoami` publishes is membership's (N13: no longer read through legacy-store). */
import { Membership } from "../membership/index.mjs";
/* What each op is, and the act lists that drive the stamps (R17), are op-declarations'. */
import { OPS, EDGE_ACTIONS, STATE_ACTIONS, ACTION_ACTIONS, DECLARATION_ACTIONS, STRUCTURE_ACTIONS, VERSION_ACTIONS,
         PROJECT_ACTIONS, GOVERNANCE_ACTIONS, IDENTITY_ACTIONS, CUSTODIAL_ACTIONS, ROSTER_SELF_ACTIONS,
         OWN_KEY_ACTIONS, CAPTURE_MEMBER_ACTIONS, CAPTURE_VIEWER_ACTIONS, CAPTURE_READS, SOURCE_ACTIONS, SOURCE_READS, QUEUE_ACTIONS, RUN_VERB_ACTIONS,
         RUN_PRODUCTION_ACTIONS, POSITIONAL_ACTS, INTENT_ACTIONS, INTENT_READS, REEVALUATION_ACTIONS,
         STANDARDS_ACTIONS, CONTRADICTION_ACTIONS, CONTRADICTION_READS, QUERY_AUTHOR_ACTIONS, ACTION_LAYER_ACTIONS,
         ACTION_LAYER_READS, PLAN_PROPOSAL_ACTIONS, TEMPLATE_PROPOSAL_ACTIONS, LOCAL_FACTS_ACTIONS, TEMPLATE_DOOR_ACTIONS,
         TEMPLATE_DOOR_READS, WHAT_CHANGED_PROPOSAL_ACTIONS, WHAT_CHANGED_READS, NETWORK_NOTICES_ACTIONS,
         NETWORK_NOTICES_READS, NETWORK_NOTICES_BY, NETWORK_NOTICES_PUBLIC_READS, DOCKET_ACTIONS, DOCKET_READS, DOCKET_AUTHOR,
         DOCKET_BY } from "../op-declarations/index.mjs";
/* R53 (K1674): the stamps T33's ops declare, op → keys (op-declarations R17–R20); R55 (K1863 (7)): the registry's
   aliases, alias → op (its R21). */
import { OP_STAMPS, OP_ALIASES, OP_FAMILIES } from "../op-declarations/index.mjs";
/* R53 (K1601, K1674): an ask's grant reads only its list (credentials R28). */
import { AI_GRANT_OPS } from "../credentials/index.mjs";

/* R49 (DEC-112 (3)(6), DEC-96; N520, N522; op-declarations R14): `case-import`'s eight member ops (its R1–R8), routed
   through its own map by the general forward. The six acts take `by` (the positional identity case-import asks
   membership's `positionalMember` of) and `viewer`; the two reads `viewer` alone. Each op's row admits a member's session
   only (`machineClasses: []`), so no other caller reaches a stamp here. `case-checker`'s public reads (its R15) are
   registered with `public-read` (its R18) and served by public-read's door read, credential-free, as R45's are. */
/* R52 (DEC-101 (3); N534; op-declarations R16): the watch acts `importwatch` and `importunwatch` (case-import R17) join
   them, stamped as they are (`by` and `viewer`), each for a member's session only by its row. */
const CASE_IMPORT_ACTIONS = Object.freeze(["caseimport", "caseimportdocument", "importaccept", "importacceptwithdraw",
                                           "importflag", "importflagclear", "importwatch", "importunwatch"]);
const CASE_IMPORT_READS = Object.freeze(["importedcases", "importedcase"]);
const CASE_CHECKER_PUBLIC_READS = Object.freeze(["casechecker", "casefilespec"]);

/* R50 (DEC-120, DEC-121; N528; op-declarations R15; K1402): `wizard-scripts`' ops, routed through its own map by the
   general forward. Every act is stamped `author`, the one key its map reads every identity from (the
   `filingTemplatesOps` pattern): the POSITIONAL identity on the authoring, approving and editor acts (its R3, R4, R6–R9),
   filing-templates' form (`QUERY_AUTHOR_ACTIONS`), and the template proposal's label on a proposal (its R5). Every act but
   the editor grant's two, and every read, takes `viewer`. `wizardprogress` (its R15) takes nothing: no member id, viewer
   or identity reaches the module, and every caller's stamp is deleted as for every op. */
const WIZARD_AUTHOR_ACTIONS = Object.freeze(["wizarddraft", "wizardrevise", "wizardsubmit", "wizardapprove", "wizardretire",
                                             "wizardeditorgrant", "wizardeditorrevoke"]);
const WIZARD_PROPOSAL_ACTIONS = Object.freeze(["wizardpropose"]);
const WIZARD_VIEWER_OPS = Object.freeze(["wizarddraft", "wizardrevise", "wizardsubmit", "wizardapprove", "wizardretire",
                                         "wizardpropose", "wizards", "wizardread", "wizardsat", "wizarduse",
                                         "wizardcandidates", "wizardcheck",
                                         /* T34 (wizard-scripts R23, R26; op-declarations R15, R28): the two reads it adds */
                                         "startfrom", "baseupdates"]);

/* R54 (DEC-133, DEC-136, DEC-132; op-declarations R22): membership's T34 administrator acts, routed through
   `membershipOps` by the general forward with `by` stamped below; the doors and the two reads are answered above. */
const MEMBERSHIP_ADMIN_ACTS = Object.freeze(["invitewithdraw", "websitekeycreate", "websitekeyset", "websitekeyrevoke",
  "joinlinkenable", "joinlinkset", "joinlinkreplace", "joinlinkoff", "courtnoticeset", "groupdescriptionset"]);

/* R50 (wizard-scripts R16; K1364 B4): A REFUSAL ANSWERED TO A MEMBER'S SESSION IS COUNTED, UNATTRIBUTED. Read off the
   answer on its way out (the two levels R22 decorates): its op and its code, and nothing else of the call, reach the
   store's internal route `wizardrefusaltally` (`dispatch.mjs`), which hands them to `wizard-scripts.tallyRefusal`. A
   count that cannot be written, or an answer that cannot be read, changes nothing the caller receives. */
async function tallySessionRefusal(res, session) {
  if (!session || !res) return;
  try {
    if (!/application\/json/i.test(res.headers.get("content-type") || "")) return;
    const body = await res.clone().json();
    const codeOf = (r) => r && typeof r === "object" && !Array.isArray(r) && r.ok === false
      ? (typeof r.reason === "string" ? r.reason : typeof r.code === "string" ? r.code : null) : null;
    const code = codeOf(body) ?? codeOf(body && body.result);
    if (!code) return;
    await doAnswer(session.stub.fetch(new Request("http://do/wizardrefusaltally", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: session.op, code }) })));
  } catch { /* the tally is status, never a gate */ }
}

/* R59 (admission R20, R22; F1, N703; K2044): ON THE WAY OUT. A refusal the door gives or relays, at either of the two
   levels R22 decorates, is handed once to admission's `securityTally`, after the answer is composed; a tally that fails
   never changes the answer. (T36; K2111) No answer carries `deprecated`: a credential in the address is refused. */
async function tallyOnTheWayOut(res, seen, req, env) {
  if (!res || !/application\/json/i.test(res.headers.get("content-type") || "")) return res;
  let body;
  try { body = await res.clone().json(); } catch { return res; }
  if (!body || typeof body !== "object" || Array.isArray(body)) return res;
  const refusal = body.ok === false ? body : body.result && typeof body.result === "object" && body.result.ok === false ? body.result : null;
  if (refusal) {
    /* admission R22 (ADMISSION #6, K2166): handed the store and the reader, so the count reaches `securitycount` */
    try { await securityTally({ op: seen.op, answer: refusal, presented: { token: seen.credential?.token ?? null, cred: seen.cred }, req,
                                env, doAnswer }); }
    catch { /* the tally is status, never a gate */ }
  }
  return res;
}

/* R59, R28 (admission R20; F1, K2111): A CREDENTIAL IN THE ADDRESS IS REFUSED, by admission's gate (C-38.10, the code's
   one site), which this door runs directly after admission R1 and before any other gate, public op, owner's door or
   store request; its refusal is relayed as given. */
const addressGate = (url) => credentialAddressGate(url);

/* REC-22: the ONE namespace the public read path answers from. An instance has
   one published record, so op=publishedcase and op=publishedbytes are pinned
   here exactly as op=verify and op=publishedmanifest are — and a probe's
   `scratch` rehearsal, which lives in a different Durable Object under a
   different PUBLISHED prefix, is therefore unreachable from the public surface. */
const PUBLISHED_STORE = "bio";

async function fingerprint(v) {
  if (!v) return null;
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return [...new Uint8Array(b)].slice(0, 8).map((x) => x.toString(16).padStart(2, "0")).join("");
}

/* Full 64-hex SHA-256 of a string or a byte view. This is what docprofile's
   `digests()` calls to name each normalised variant (CONSTRUCTS Step 2 / FW-4);
   it hashes the SAME raw bytes for `identity`, which is why identity must equal
   the capture sha and is asserted to. */
async function sha256Hex(v) {
  const b = await crypto.subtle.digest("SHA-256", typeof v === "string" ? new TextEncoder().encode(v) : v);
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/* REC-126 / REC-198 — THE REVIEW COPY'S ANSWER SHAPE, ONE FUNCTION FOR EVERY READ OF A DRAFT. The store's
   `#noReviewCopy` is carried at 404 with nothing added, so a caller outside the fence reads the same status and the
   same bytes from the single read (`reviewcopy`) and from the list (`casedrafts`); a store that did not answer is a
   silence, stated as one. */
/* `extra` is put in the answer before the in-band hash is taken, so the hash is over the answer exactly as served. */
async function reviewAnswer(out, op, extra = {}) {
  if (out.refused) return storeRefusal(out, extra);   /* R23: the store's own refusal, at its status */
  if (!out.answered) return storeSilent(op, out.correlation);
  const r = out.result;
  if (!r?.ok) return json({ ok: false, ...r, ...extra }, r?.reason === "NO_REVIEW_COPY" ? 404 : 400);
  if (op === "reviewcopy") {
    /* REC-148 / DEC-31's BOUND RULE (`BIO_Publication_v0_1.md` §6A.3 point 1): the answer carries its
       hash, date, author and both floors IN-BAND, by the SAME function the container manifest is
       hashed with. The hash is over every byte of this answer but `inband` itself, in the form it is
       served; the floors are the project's required strength, the quantity `op=publish` freezes into
       the case document and the container carries as `bar`. The store's `required_strength` is read
       into the floors and not served twice. (Moved here from the review door's inline branch when REC-198
       made this function the one answer shape for every read of a draft.) */
    const { required_strength: bar, ...copy } = r;
    const served = { ok: true, ...copy, ...extra };
    const { quartet } = await inbandQuartet({
      subject: served,
      over: "this answer exactly as served, without its `inband` key: parse it, delete `inband`, and "
          + "hash JSON.stringify(rest, null, 1) as UTF-8",
      /* REC-200 / BOB #32, 2026-09-23 23:08Z: THE DATE IS THE COPY'S LAST CHANGE, not the draft's last
         EDIT — a comment moves these bytes, so it moves the hash, and it must move the date with it. The
         store computes it over the rows it SERVES and says in `last_change.stated` what it cannot see.
         THE AUTHOR DOES NOT MOVE: the ruling is about the date, and a recipient who comments on a copy
         has not authored it; `last_change.by` is who made that change, beside it. */
      date: r.last_change?.at ?? null, author: r.updated_by ?? null, bar: bar ?? null });
    return json({ ...served, inband: quartet }, 200);
  }
  return json({ ok: true, ...r, ...extra }, 200);
}

/* R44 (K921; filing-templates R8, R9, R13, R14) — THE TEMPLATE GRANT'S FOUR DOORS, on the review copy's (R20) for its
   reason: the reader a grant exists for holds no credential of this instance. `templateread`, `templatecomments`,
   `templatereview` and `templatecomment` admit two callers and no third:
     - `secret=` — a RECIPIENT. Any presented value takes this door, an empty or malformed one included, so a malformed
       secret travels the path a revoked one does. The value is HASHED HERE and only its digest crosses, stamped
       `secretSha` and `bySecret` as `reviewcopy`'s are; filing-templates asks whether a live grant holds it.
     - otherwise a MEMBER'S SESSION, admitted by `admission`'s `admit` held to a session (no binding class, no agent
       credential), stamped `viewer` and `author` (its positional identity, the form filing-templates asks membership
       of) as every act of the action layer is.
   Every caller the grant does not admit (no secret and no session; a secret no live grant holds, of any kind) receives
   filing-templates' ONE dead answer, `NO_TEMPLATE_GRANT`, at 404 and in the same bytes whoever built it, so a revoked,
   never-issued or malformed secret and a stranger cannot be told apart. A store that did not answer is a silence. The
   inner request carries the caller's own arguments with every stamp and credential removed. */
const TEMPLATE_GRANT_DOORS = Object.freeze([...TEMPLATE_DOOR_ACTIONS, ...TEMPLATE_DOOR_READS]);   /* op-declarations R8 */
const deadTemplateGrant = () => json({ ok: false, ...noTemplateGrant() }, 404);
async function templateGrantDoor({ req, url, env, op, spec, presentedAi, stub, credential }) {
  const inner = new URL(`http://do/${op}`);
  for (const [k, v] of url.searchParams) inner.searchParams.set(k, v);
  for (const k of ["token", "op", "store", "secret", "secretSha", "bySecret", ...QUERY_STAMPS]) inner.searchParams.delete(k);
  /* R59 (admission R20): the secret is the body's `secret`, never the address's; R64 (N761): its digest crosses in the
     internal request's body alone (`secretSha`), beside the door's mark `bySecret` in the query */
  let digest = null;
  if (credential.secret !== null) {
    inner.searchParams.set("bySecret", "1");
    digest = await sha256Hex(credential.secret || "");
  } else {
    const admitted = await admit({ url, env, op, spec: { ...spec, classes: ["admin", "member"], machineClasses: [] },
                                   method: req.method, presented: presentedAi, doAnswer, credential });
    if (admitted.silent) return storeSilent(admitted.silent.op, admitted.silent.correlation);
    if (admitted.refusal || !admitted.caller.viaSession) return deadTemplateGrant();
    inner.searchParams.set("viewer", admitted.caller.viewer);
    inner.searchParams.set("author", admitted.caller.identity);
  }
  let body;
  if (req.method === "POST" || digest !== null) {
    let b = {};
    if (req.method === "POST") try { b = JSON.parse((await req.text()) || "{}"); } catch { b = {}; }
    if (!b || typeof b !== "object" || Array.isArray(b)) b = {};
    for (const k of [...BODY_STAMPS, ...QUERY_STAMPS, "secretSha", "bySecret", "secret", "token"]) delete b[k];
    if (digest !== null) b.secretSha = digest;
    body = JSON.stringify(b);
  }
  const out = await doAnswer(stub.fetch(new Request(inner, body === undefined ? { method: "GET" } : { method: "POST", body })));
  if (out.refused) return storeRefusal(out);   /* R23: the store's own refusal, at its status */
  if (!out.answered) return storeSilent(op, out.correlation);
  const r = out.result;
  if (r?.reason === "NO_TEMPLATE_GRANT") return deadTemplateGrant();
  if (!r?.ok) return json({ ok: false, ...r }, r?.reason === "NO_SUCH_TEMPLATE" ? 404 : 400);
  return json({ ok: true, ...r }, 200);
}

/* WHO IS ASKING, FOR A PUBLIC OP THAT ANSWERS WORKING MATERIAL ONLY TO SOME: `admission`'s `readerOf` (its R16), in the
   shape the arms behind plane's hooks read (`{viewer, cls}`, or `{silent: <op>, correlation}`). */
async function caseReader(url, env, storeName, presentedAi, credential = null) {
  const r = await readerOf(url, env, storeName, presentedAi, doAnswer, credential);
  return r.silent ? { silent: r.silent.op, correlation: r.silent.correlation } : r;
}

/* The R2 key for a capture's bytes (I1 §2): content-addressed under the store
   prefix. The ONE place this shape is written, so op=capture and op=pdfstructure
   read the identical object rather than two copies of the key drifting apart. */
const captureKey = (storeName, sha) => `${storeName}/captures/${sha}`;

/* THE CAPABILITY COMPLAINT (C-68.1, D-278). A copy installed with no evidence
 * storage bound cannot serve `capture`, `pdfstructure`, `acquire` or `attest`.
 * ONE row for the four, the op named beside it, minted at acquisition's one
 * region (`evidenceStorageAbsent`, K850) for the same reason `requiredArgument`
 * is minted once: a DEC-49 row holds one `where`. `error` is passed in
 * BYTE-IDENTICAL from each site — the sites said two different sentences before
 * this and still do. Handed to every arm this door routes those ops to (moved
 * from legacy-index at T19, its door share). */
function storageAbsent(op, error) {
  const { status, body } = evidenceStorageAbsent(op, error);
  return json(body, status);
}

/* REC-163 / IC-174 and REC-164: WHICH STORE `op=instancegroup` and `op=groupidentity` read, and WHO ASKS — the
   resolution is the door's, the answer instance-setup's (`instanceGroupOp`, `groupIdentityOp`). Who asks decides which
   projection, never whether: a caller the admission gate would admit (a machine class in its own namespace, a session,
   an agent credential in scope) is answered the store's whole row, provenance included, `caseReader` deciding it; anybody
   else the public projection. The store: the namespace a machine credential is confined to or names (`scopeFor`'s rule,
   so a probe naming nothing still reads `scratch`), and for every other caller `store=scratch` when named and `bio`
   otherwise, the invitation ops' rule. A silence is a silence (REC-52): never "no group is recorded". Moved from
   legacy-index at T19 (its door share). */
async function groupRead(op, url, env, presentedAi, credential) {
  const held = credential.token;
  const heldCls = held ? await classify(held, env) : null;
  const heldScope = heldCls ? scopeFor(heldCls, url) : null;
  const store = heldScope && !heldScope.error ? heldScope.name
    : (url.searchParams.get("store") === SCRATCH ? SCRATCH : "bio");
  const reader = await caseReader(url, env, store, presentedAi.cred, credential);
  if (reader.silent) return storeSilent(reader.silent, reader.correlation);
  const io = { json, storeSilent, storeRefusal, doAnswer };
  return op === "instancegroup" ? instanceGroupOp(env, store, reader, io) : groupIdentityOp(env, store, reader, io);
}


/* REC-173 (INVESTIGATIVE-SESSION.md §11 item 5, "A MIGRATION IS A REPLAY, NOT A SURFACING", BOB #30): IS THIS
   CREATION A MIGRATION REPLAY? — and since D-512 (BOB #33's step (2)) IS THIS PROMOTION, of ANY type and ANY revision,
   A REPLAY THE SERVER CAN VERIFY? The same test answers both: nothing below is particular to an inquiry or to a
   creation (`b.bundleId` is the bundle a revision revises too). Condition (2) of the ruling, asked of what the SERVER
   holds and never of what the caller says: the promotion names a capture (`provenanceCapture`, a sha256) that is
     - REGISTERED as the Drive era's provenance — at `DRIVE_PROVENANCE_PATH` — by this creation's own `register`
       list, the one writer of the register (`promote`) and so the earliest act that can register anything against
       a bundle that does not exist yet (the builder's DESIGN GAP, stated in the IC);
     - HELD: its bytes are read back from R2 under the one capture key and must hash to the sha named, so the
       provenance is the bytes already in the record, not a copy the request carries;
     - and its PRESERVED PROMOTION RECORDS name THIS bundle id (`record.target`) and, in THE SAME record, list THIS
       revision's `bundle.md` SHA-256 — computed here from the text being promoted, and the `sha256` the caller
       sent must BE that value, because the store keeps the caller's figure as the bundle's head.
   Null when any of it fails: a promotion that ASSERTED `replay` is then refused REPLAY_UNVERIFIED (C-66.6, D-512), and
   an inquiry creation that asserted nothing is an ORDINARY creation and rule 2 and D-78 apply unchanged, so this
   door cannot be used to skip a run. Condition (1), the ADMIN class, is the caller's to ask before calling this.
   WHAT THIS CANNOT CHECK, stated rather than hidden: the provenance capture is uploaded by the root of trust, whose
   honesty the record does not model (Membership §DEC-2, deferred). */
const DRIVE_PROVENANCE_PATH = "migration/drive-provenance.json";
async function migrationReplayOf(env, storeName, b) {
  const cap = typeof b.provenanceCapture === "string" ? b.provenanceCapture.trim() : "";
  if (!/^[0-9a-f]{64}$/.test(cap)) return null;
  const registered = Array.isArray(b.register)
    && b.register.some((r) => r && r.sha256 === cap && r.path === DRIVE_PROVENANCE_PATH);
  if (!registered) return null;
  const bm = Array.isArray(b.files) ? b.files.find((f) => f && f.path === "bundle.md" && typeof f.text === "string") : null;
  if (!bm) return null;
  const mdSha = createSha256().update(new TextEncoder().encode(bm.text)).hex();
  if (bm.sha256 !== mdSha) return null;
  let held;
  try { held = await env.CAPTURES.get(captureKey(storeName, cap)); } catch { return null; }
  if (!held) return null;
  const bytes = new Uint8Array(await held.arrayBuffer());
  if (createSha256().update(bytes).hex() !== cap) return null;
  let prov;
  try { prov = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); } catch { return null; }
  const records = Array.isArray(prov?.promotions) ? prov.promotions : [];
  const match = records.find((p) => p && p.record && typeof p.record === "object"
    && p.record.target === b.bundleId
    && Array.isArray(p.record.files)
    && p.record.files.some((f) => f && f.name === "bundle.md" && f.sha256 === mdSha));
  if (!match) return null;
  return { capture: cap, promotion: typeof match.key === "string" ? match.key : null, bundleMdSha: mdSha };
}

/* D-526 (`BIO_Case_Making_v0_1.md` §2; D-510, C-86.1): WHAT A PROMOTION IS, derived ONCE from the bytes the caller sent —
   the document's own `object_type` through record-grammar's `normalizeType`, the envelope's only where the document
   states none — exactly as `promote` derives it in the store. The gates that ask it (the migration-replay admission,
   `create_projects`, D-78's `surfaced_by` restamp) asked the ENVELOPE, and an envelope is legal with no type at all:
   measured on 8bdf20e6, a member without `create_projects` created a project by leaving the type out. A contradicting
   envelope is still refused, by the store (ENVELOPE_TYPE_DISAGREES); here it only decides which gate a caller meets. */
function promotedTypeOf(b) {
  const md = Array.isArray(b.files) ? b.files.find((f) => f && f.path === "bundle.md") : null;
  const fm = md && typeof md.text === "string" ? parseFrontmatter(md.text).data : null;
  const said = fm && typeof fm === "object" ? fm.object_type : undefined;
  if (typeof said === "string" && said.trim() !== "") return normalizeType(said);
  return b.meta && typeof b.meta === "object" ? normalizeType(b.meta.object_type) : undefined;
}

/* R16 (D-511, D-512): A PROMOTION'S REPLAY, judged from the body as sent. Only the ADMIN class with no session may
   assert one (D-511: every other caller's flag is deleted by the promote block, and it is judged by the fences it tried
   to skip); an admin's assertion, or an admin's inquiry creation, is checked by `migrationReplayOf`. `asserted` with no
   `proven` is refused REPLAY_UNVERIFIED before any handler runs (R28). A body that is not a JSON object asserts nothing:
   the store refuses it in its own words. */
async function replayVerdict(env, storeName, text, viaSession, cls) {
  let b;
  try { b = JSON.parse(text); } catch { return null; }
  if (!b || typeof b !== "object" || Array.isArray(b)) return null;
  const admin = !viaSession && cls === "admin";
  const asserted = admin && !!b.replay;
  const creatingInquiry = b.base === null && !!b.meta && promotedTypeOf(b) === "inquiry";
  const proven = admin && (asserted || creatingInquiry) ? await migrationReplayOf(env, storeName, b) : null;
  return { asserted, proven,
           bundleId: typeof b.bundleId === "string" ? b.bundleId.slice(0, 200) : null,
           provenanceCapture: typeof b.provenanceCapture === "string" ? b.provenanceCapture.slice(0, 64) : null };
}

/* N364 (sources R11): `op=knockerconsent`, a knocker's consent (or its withdrawal) by their knocker secret, with no
   account. Pinned to `bio` (R5), as the knock is. The stamps are the knock's: the connecting address as `source` and the
   instant as `now`, set here and read by `sources` after the body, so a caller's own copies never reach it; only the
   four fields the act takes are passed on. A rate refusal answers as the knock's does (429, with its sentence); every
   other failure is the module's one `SECRET_NOT_RECOGNISED`, relayed whole at one status. */
async function knockerConsent(req, store) {
  if (req.method !== "POST") return json({ ok: false, error: "knockerconsent is a POST" }, 405);
  let b = null;
  try { b = JSON.parse((await req.text()) || "{}"); } catch { b = null; }
  if (!b || typeof b !== "object" || Array.isArray(b)) b = {};
  const source = req.headers.get("cf-connecting-ip") || "unknown";
  const out = await doAnswer(store.fetch(new Request(
    `http://do/knockerconsent?source=${encodeURIComponent(source)}&now=${Date.now()}`,
    { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ knockerSecret: b.knockerSecret, entry: b.entry, audience: b.audience,
                             ...(b.withdraw !== undefined ? { withdraw: b.withdraw } : {}) }) })));
  if (out.refused) return storeRefusal(out);
  if (!out.answered) return storeSilent("knockerconsent", out.correlation);
  const rec = out.result && typeof out.result === "object" ? out.result : {};
  if (rec.ok !== true)
    return json({ ok: false, ...rec }, rec.reason === "RATE_IP" || rec.reason === "RATE_GLOBAL" ? 429 : 403);
  return json({ ...rec, ok: true }, 200);
}

/* R41 (K585 (1), K674 (1); agent-worker R48, N157; T36: N695, K2135): THE PUBLISHED FENCES AND THE RENDERED PACK, served
   by `op=agentpack` alone, from the untargeted `op=affordances` answer (affordances R17's, whose handler answers it):
   `fences`, skills' `machineFences` over `CHECK_FAMILIES`, and `pack`, `renderPack` over that same answer with its
   `fences`, whole with its `version`. A member's agent reads both from there and imports no catalogue. A render that
   throws answers `pack: null` and `pack_absent` (its sentence), never a partial pack, so a reader refuses it. Null for an
   answer that is not `ok: true` with a result. Since T36 the untargeted `op=affordances` answer is the handler's as it
   stands, with neither key. */
async function packOf(res) {
  let body;
  try { body = await res.clone().json(); } catch { return null; }
  if (!body || body.ok !== true || !body.result || typeof body.result !== "object" || Array.isArray(body.result)) return null;
  const fences = machineFences(CHECK_FAMILIES);
  let pack = null, absent = null;
  try { pack = renderPack({ ...body.result, fences }); }
  catch (e) { absent = String((e && e.message) || "the pack could not be rendered").slice(0, 500); }
  return { fences, pack, ...(pack ? {} : { pack_absent: absent }) };
}

/* N336 (installer R20, K649 (6)): THE PLANE'S LIMITS, stated in its code so the bundle a release signs carries them, equal
   to the `limits` of the plane's own configuration (`wrangler.jsonc`), which a test pins. The installer reads them from
   the verified plane bundle and holds no value of its own; the door carries them as `limits` on the function it makes,
   so a bundle of the door cannot leave them out. */
const PLANE_LIMITS = Object.freeze({ subrequests: 10000 });
/* The statement a release's verified bundle is read for (installer R20, K723, K724): the tag, then `key=<positive
   integer>` for each key of the limits, keys sorted, single spaces, no quotes or backslashes, so a reader of the bundle's
   text finds it whole. `PLANE_LIMITS` is its parsed form. */
const PLANE_LIMITS_STATEMENT = "bio-plane-limits/1 subrequests=10000";

/* R53 (K1601, K1674; credentials R27, R28; agent-worker R54): AN ASK'S GRANT. Its token has a session's shape and is
   no session, so admission answers NOT_AUTHENTICATED; for an op on the grant's list, or one of the ask's own four calls
   (`affordances` untargeted), the door then asks credentials in `bio` whether a live grant admits it (the four, off the
   list, by its first read). Admitted, the caller is `ai`, its viewer the grant's member, its grant stamped `grant`
   (answers' arms, the read log); GRANT_OP_REFUSED is answered; anything else keeps admission's answer. */
/* R41 (T35): `agentpack` is admitted under a grant (op-declarations R30); (T36; K2135) the ask reads the pack there alone
   (agent-worker R48, its `ASK_PLANE_OPS`), so the untargeted `affordances` is no longer one of the ask's own calls. */
const GRANT_OWN_OPS = Object.freeze(["askceiling", "askcheck", "askusage", "agentpack"]);
/* store-door R9 (K2037 (b)): the internal header an ask's grant travels in to the store (store-door's `GRANT_HEADER`). */
const GRANT_HEADER = "x-bio-grant";
/* store-door R9 (K2038 (1)): the internal header a stamped session travels in to the store. */
const SESSION_HEADER = "x-bio-session";
async function grantAdmit(env, url, op, spec, token) {
  const own = GRANT_OWN_OPS.includes(op);
  if (!own && !AI_GRANT_OPS.includes(op)) return {};
  const out = await doAnswer(env.STORE.get(env.STORE.idFromName("bio")).fetch(new Request("http://do/aigrantadmit", {
    method: "POST", body: JSON.stringify({ token, op: own ? AI_GRANT_OPS[0] : op, write: own ? false : spec.mutating }) })));
  if (!out.answered) return { silent: { op: "aigrantadmit", correlation: out.correlation } };
  const g = out.result || {};
  if (g.ok === true) return { caller: { cls: "ai", viaSession: false, member: null, viewer: null, identity: null, rights: null,
    caps: null, aiCred: { tokenId: "grant", principal: g.viewer, grant: token },
    storeName: url.searchParams.get("store") === SCRATCH ? SCRATCH : "bio" } };
  return g.reason === "GRANT_OP_REFUSED" ? { refusal: { status: 403, body: g } } : {};
}

/* R1–R25: the Worker entry. `hooks.publicOp(ctx)` answers a public op whose handler is a module's, through plane's hooks;
   `hooks.gatedOp(ctx)` an admitted op's handler there, or undefined for the generic forward below. */
/* R17: the stamps a caller may never supply, in the query and in a body. */
const QUERY_STAMPS = Object.freeze(["viewer", "identity", "author", "by", "actor", "who", "origin", "administer", "aiCred",
                                    /* T35 (R58): who is calling, the door's alone (admission R21) */ "source", "country"]);
const BODY_STAMPS = Object.freeze(["actorIdentity", "actorViewer", "actorMemberId", "ownerMemberId", "assistantPrincipal",
                                   "migrationReplay"]);
/* R36, R23 (K1037): the ops whose refusals state their own HTTP status in `result.status`, which the forward answers. */
const STATED_STATUS_OPS = Object.freeze(["inbox", "inboxpull", "inboxresolve", "heldsetaside", "heldrestore"]);
/* R53 (T36; DEC-172, instance-setup R53) and R63: `assistantset` is retired and `securitycount` store-internal, so a
   request naming either is answered as an op with no spec (R2), whatever any table holds. */
/* R66 (op-declarations R37; instance-setup R67): `translationdraftrecord` is the door's own store-internal call after a
   translation draft, never a caller's. */
const NOT_ROUTED = Object.freeze(["assistantset", "securitycount", "translationdraftrecord"]);
/* R61 (N714, N707, N710; DEC-169, DEC-173; file-safety R8, R11, R33): file-safety's four byte answers, relayed as the owner
   answers them, never enveloped; `openwithwarning` takes `warned` from the body (a GET's query `warned`, its JSON, is
   carried there). R62: a member's or an `ai` credential's `op=capture` GET is answered by the first two. */
const BYTE_OPS = Object.freeze(["openoriginal", "openwithwarning", "safeview", "safecopy"]);
/* R61 (file-safety R28; op-declarations R32): `securitytooladd`'s secrets are the body's alone, never the address's. */
/* R68 (op-declarations R39; credentials R3): `setpassword`'s two passwords are the body's alone, and it names no role in
   either place (the role is the session's): a `role` in the address leaves with them, and one in the body is deleted
   (`BODY_DROPPED`). */
const BODY_ONLY = Object.freeze({ securitytooladd: Object.freeze(["credentials", "config"]),
                                  setpassword: Object.freeze(["current", "password", "role"]) });
const BODY_DROPPED = Object.freeze({ setpassword: Object.freeze(["role"]) });
/* R60, R29 (K1687; op-declarations' families): the acts whose owner reads its actor from the BODY under a key that is not
   `by` (`bodyBy`, R53, sets that one) — standards' `author`, its proposals' `proposer` — op → key, derived once from the
   families, so a family's new act is stamped as its others are. */
const BODY_ACTOR = Object.freeze(Object.fromEntries(Object.values(OP_FAMILIES).flatMap((f) => [
  ...(f.actor?.at === "body" && f.actor.key !== "by" ? f.acts.map((op) => [op, f.actor.key]) : []),
  ...(f.proposer?.at === "body" && f.proposer.key !== "by" ? f.proposals.map((op) => [op, f.proposer.key]) : []),
])));
const BODY_ACTOR_KEYS = Object.freeze([...new Set(Object.values(BODY_ACTOR))]);

/* R61, R62: A BYTE ANSWER, AS ITS OWNER GAVE IT. A served file (an answer at 200 or 206 carrying its owner's digest header,
   which no JSON answer carries; a file's own content type may be anything, JSON or text included) is relayed whole
   — its bytes, content type, length and digest header (`x-capture-sha256` for an original, `x-derived-sha256` for a view
   or copy) — with `cache-control: no-store`, and `access-control-allow-origin: *` as `op=capture`'s GET carries it; a JSON
   answer is read through `doAnswer` and enveloped as any answer of the forward (a refusal the owner's, answered as given;
   a silence a silence). Nothing of it is logged, kept or counted here beyond what every answer meets (file-safety R10). */
async function byteAnswer(res, op, extra) {
  const file = res.headers.has("x-capture-sha256") || res.headers.has("x-derived-sha256");
  if ((res.status === 200 || res.status === 206) && file) {
    const headers = new Headers(res.headers);
    headers.set("cache-control", "no-store");
    if (!headers.has("access-control-allow-origin")) headers.set("access-control-allow-origin", "*");
    return new Response(res.body, { status: res.status, headers });
  }
  const out = await doAnswer(Promise.resolve(res));
  if (out.refused) return storeRefusal(out, extra);
  if (!out.answered) return storeSilent(op, out.correlation);
  const { body, status } = out.reply;
  return json({ ...body, ...extra }, status);
}
/* R64 (N761; F1's rule for digests): a body carrying the digest a door minted or hashed as `secretSha`, beside the request's
   own fields (already stripped of any `secretSha` or `bySecret` a caller sent, R17). A body that is not JSON is passed as
   sent, so the store refuses it in its own words and no grant is made; the digest is then in no request at all. */
function withDigest(text, secretSha) {
  let b;
  try { b = text ? JSON.parse(text) : {}; } catch { return text; }
  if (!b || typeof b !== "object" || Array.isArray(b)) b = {};
  return JSON.stringify({ ...b, secretSha });
}
/* R61: a GET's query `warned` (`{"own_device":true,"no_macros":true}`), read as JSON, else as the text sent, for the body. */
function warnedOf(url) {
  const w = url.searchParams.get("warned");
  if (w === null) return undefined;
  try { return JSON.parse(w); } catch { return w; }
}
export function makeFetch(hooks = {}) {
  /* R25: the door's one outermost catch. */
  /* R50: `seen.session` is set once admission has admitted a member's session, so a refusal answered to it is tallied;
     R51: every HTML answer leaves with the page policy. */
  const planeDoor = async function planeDoor(req, env) {
    const seen = { session: null, credential: null, cred: null, op: null };
    let res;
    try { res = await fetch(req, env, seen); } catch (e) { res = planeInternalError(e, req); }
    await tallySessionRefusal(res, seen.session);
    res = await tallyOnTheWayOut(res, seen, req, env);
    return await withPagePolicy(res);
  };
  planeDoor.limits = PLANE_LIMITS;
  planeDoor.limitsStatement = PLANE_LIMITS_STATEMENT;
  return planeDoor;
  async function fetch(req, env, seen = { session: null }) {
    const url = new URL(req.url);
    /* R59 (admission R20; F1, K2044): the credential this request presents, read once — the `Authorization` header's, else
       a JSON body's `token`, never the address's — and every gate below judges it and no other. */
    let reqBody = null;
    if (req.method === "POST")
      try { reqBody = JSON.parse((await req.clone().text()) || "null"); } catch { reqBody = null; }
    const credential = presentedCredential({ req, url, body: reqBody });
    seen.credential = credential;
    if (req.method === "OPTIONS")
      return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "content-type" } });

    /* The API lives under /api so the instance can serve its own setup UI at
       the root. A bare GET of / with no op parameter is a person in a browser
       and gets the page. The legacy root query API (/?op=...) still answers,
       for the one deployment that predates this, and should be dropped once
       that instance is gone. */
    /* The signing page, served by the group's own instance. It is the same
       self-contained file a release ships, with no network calls, and
       it holds no secret: keys are made and used in the visitor's browser.
       Serving it means the instance can LINK to it, which is the difference
       between a step an ordinary person can follow and one they cannot. */
    /* Which version is this? A plain GET, no token, no op parameter, no JSON
       field to know the name of. `op=bootstrap` has always carried the version
       and always will, but "call bootstrap and read the version field" is not
       something anyone should have to be told, and the question gets asked
       after every update. */
    if (req.method === "GET" && (url.pathname === "/version" || url.pathname === "/version/"))
      return new Response((env.VERSION || "0.0.0") + "\n",
        { headers: { "content-type": "text/plain; charset=utf-8",
                     "access-control-allow-origin": "*" } });
    if (req.method === "GET" && (url.pathname === "/sign" || url.pathname === "/sign/"))
      return new Response(SIGN_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
    /* REC-163 / IC-174: the page names whose record this is — the group ITS record records, read when the page is
       SERVED, through the one public read (`publicInstanceGroup`). `setupPage` puts the slug in the served bytes,
       or says in words that none is recorded, or — when the record did not answer — says THAT, never "none" and
       never a name. `no-store`, because the bytes now carry a fact the record can change: a page kept from before a
       seed would go on saying none is recorded. D-596: the read is op=groupidentity's PUBLIC projection, so the line
       carries the display name beside the slug and a verified domain with its date (`setup.mjs` `groupLine`).

       D-475 — AND THE NAMESPACE IS THE CALLER'S TO NAME HERE, because NOTHING BELOW CAN REACH THIS ROUTE. This is an
       HTML route: it answers before `path` and `op` exist, so D-456's `namespaceGate` and D-461's
       `pinnedNamespaceGate`, both of which run at the op front door a few lines down, never see it. MEASURED: the
       read was written `publicInstanceGroup(env, "bio")`, so `/?store=scratch` served `bio`'s slug as this copy's
       own — a live verification whose whole no-write guarantee is naming its namespace (D-325) read
       production while believing it was in scratch — and `/?store=nonsense` did the same, which is D-456's own
       defect surviving at the one route D-456 did not reach. Found by D-461's worker.

       THE RULE IS op=instancegroup's, NOT A NEW ONE, and that is the decision rather than a convenience: this page
       and that op are ONE READER (`publicInstanceGroup` — its own header says so) shown to a stranger, so a
       namespace that does not exist is refused BY NAME through the very gate every other caller meets,
       `store=scratch` reads scratch, and everything else reads `bio`. The page is deliberately NOT added to
       D-461's pinned set: pinning one of two surfaces over one reader would make `store=scratch` mean two things on
       the same copy — refused on the page, honoured on the op — and the op is exempt because it reads `store=`
       itself, which is now exactly what the page does. `/version` and `/sign` are left alone on purpose: they
       address no namespace, and a gate on a route that reads no record would be a fence tighter than its rule. */
    if (req.method === "GET" && !url.pathname.startsWith("/api")
        && (url.pathname === "/" || url.pathname === "") && !url.searchParams.get("op")) {
      const pageNamespace = namespaceGate(url);   /* admission R1 */
      if (pageNamespace) return json(pageNamespace.body, pageNamespace.status);
      const pageAddress = addressGate(url);   /* R59: admission R20, before the page's read */
      if (pageAddress) return json(pageAddress.body, pageAddress.status);
      const pageStore = url.searchParams.get("store") === SCRATCH ? SCRATCH : "bio";
      return new Response(setupPage(await hooks.publicInstanceGroup(env, pageStore, "groupidentitypublic")),
        { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    }

    const path = url.pathname.replace(/^\/api\/?/, "/");
    let op = url.searchParams.get("op") || path.slice(1) || "selftest";
    const askedOp = op;   /* R50: the op the caller asked, before R36's re-route */
    /* R55 (op-declarations R21): a requirement function's name that aliases an op is that op, before every gate: its
       handler, its stamps and its answer, so the two answer alike. */
    if (Object.hasOwn(OP_ALIASES, op)) op = OP_ALIASES[op];
    seen.op = op;
    let spec = Object.hasOwn(OPS, op) && !NOT_ROUTED.includes(op) ? OPS[op] : undefined;   /* R2: the table's own keys only */
    /* R36 (N364; capture R32, R65): a knock resolved to `pulled` is R65's pull, so it is routed as `op=inboxpull` before
       any gate: every gate, stamp and answer it meets is the pull's, the promotion included, and no pull files a capture
       without its bundle. The body is read from a copy; the other statuses stay `inboxresolve`'s. */
    /* DEC-88 (2), K1037: it is capture R32's resolve all the same, so it takes the resolve's reason, which `op=inboxpull`
       asked directly does not (capture R65): `resolving` marks the re-route, and the forward below tells the store's pull
       route so with a stamp of the door's own, never the caller's. */
    let resolving = false;
    if (op === "inboxresolve" && req.method === "POST") {
      let b = null;
      try { b = JSON.parse(await req.clone().text()); } catch { b = null; }
      if (b && typeof b === "object" && !Array.isArray(b) && b.status === "pulled") {
        op = "inboxpull"; spec = OPS.inboxpull; resolving = true;
      }
    }
    /* DEC-49 REGION is-unknown-op
       D-278 (C-69.1). `error` stays "unknown op" BYTE-IDENTICAL and stays the
       FIRST key after `ok`: civicos-ui's `queueAbsent` reads the sentence to tell
       an older plane from a refusal (I3), and R2's test (`test/m/control-plane/
       doors.test.mjs`) holds both at the interface. */
    if (!spec) return json({ ok: false, error: "unknown op", reason: "UNKNOWN_OP", ...dispatchRow("UNKNOWN_OP"),
                             op }, 400);
    /* END DEC-49 REGION is-unknown-op */

    /* R28: admission R1 (a `store=` naming no namespace), before any credential is read; then the presented agent
       credential's row, read ONCE (admission R6) and reused by the admission and the readers below, because the
       confinement is a property of the row; admission R2 (a confined credential held to `scratch`), before R3 (a public
       op pinned to `bio`), so a confined caller reaching a bio-pinned public op is told which fence stopped it. */
    const refused = (r) => json(r.body, r.status);
    const unknownNamespace = namespaceGate(url);
    if (unknownNamespace) return refused(unknownNamespace);
    /* R59, R28 (admission R20; K2111): a credential or secret in the address, refused C-38.10 directly after R1, before
       any credential is judged, any public op runs or any store is asked */
    const inAddress = addressGate(url);
    if (inAddress) return refused(inAddress);
    /* R28 (K1861 (6)): admission's query gate, which never refuses: what an op may take only from the body (a door's key,
       link and cover; the group key) and a public door's `token` leave the URL before anything reads it (R54, R56). */
    queryGate(url, op, credential);
    const presentedAi = await aiCredentialPresented(url, env, doAnswer, { credential, op });
    seen.cred = presentedAi.cred ?? null;
    if (presentedAi.silent) return storeSilent(presentedAi.silent.op, presentedAi.silent.correlation);
    const confinedNamespace = confinedNamespaceGate(url, presentedAi.cred);
    if (confinedNamespace) return refused(confinedNamespace);
    const pinnedNamespace = pinnedNamespaceGate(url, op, spec);
    if (pinnedNamespace) return refused(pinnedNamespace);

    /* Unauthenticated by design. Each one gates itself. */
    if (spec.classes === null) {
      /* R28, R58 (admission R21; F4): the public ops' window first, before the op reads or writes anything; then who is
         calling, as admission knows them (a keyed fingerprint and a country, never the address), the stamps `claim`,
         `login` and `recover` take (credentials R1, R4, R47) and capture's knock its `country` (its R85). */
      const windowed = await doorWindowGate({ req, env, op, spec, doAnswer });
      if (windowed.refusal) return refused(windowed.refusal);
      /* (T38; K2326) the window's answer carries the source; when the window was not read, `sourceOf` is asked again
         only where it needs no store (the fingerprint key bound), so a store fault is never asked a second time and the
         source is then `null`, as admission R21 states for a store that cannot be asked */
      const source = windowed.source ?? (typeof env.KNOCK_FINGERPRINT_KEY === "string" && env.KNOCK_FINGERPRINT_KEY
        ? await sourceOf(req, env) : null);
      const country = countryOf(req);
      const doorStamps = new URLSearchParams({ ...(source ? { source } : {}), ...(country ? { country } : {}) }).toString();
      const fp = await fingerprint(env.ADMIN_TOKEN);
      const stub = env.STORE.get(env.STORE.idFromName("bio"));
      /* Claiming and logging in are pinned to `bio` above, because an instance
         has ONE identity and there is nothing to claim in a scratch namespace.
         The INVITATION ops are different: the token IS the authority and it
         exists in exactly one store, so an unauthenticated caller naming a
         store gains nothing they do not already have, and pinning them to `bio`
         made an invitation created in `scratch` unredeemable. `memberadd` in
         `scratch` answered ok and handed over a token that could never work,
         which is a silent dead end and made the scratch namespace useless for
         rehearsing the member surface. Found against the deployed plane while
         closing D-41, not by the suite. */
      const invStub = url.searchParams.get("store") === SCRATCH
        ? env.STORE.get(env.STORE.idFromName(SCRATCH)) : stub;
      if (op === "claim") {
        const body = await req.json().catch(() => ({}));
        /* DEC-49 REGION is-bootstrap-claim
           D-278 (C-68.2–.4): installation facts, each `error` byte-identical, and
           no row says more than its sentence did. */
        if (!env.ADMIN_TOKEN) return json({ ok: false, reason: "BOOTSTRAP_CREDENTIAL_UNSET",
          ...installationRow("BOOTSTRAP_CREDENTIAL_UNSET"), error: "instance has no bootstrap credential set" }, 409);
        if (!(await liveToken(env.ADMIN_TOKEN)))
          return json({ ok: false, reason: "BOOTSTRAP_CREDENTIAL_PUBLISHED", ...installationRow("BOOTSTRAP_CREDENTIAL_PUBLISHED"),
            error: "bootstrap credential is a published repository value and can never arm a claim; set a fresh ADMIN_TOKEN in the Cloudflare dashboard" }, 409);
        if (body.bootstrapToken !== env.ADMIN_TOKEN)
          return json({ ok: false, reason: "BOOTSTRAP_CREDENTIAL_MISMATCH", ...installationRow("BOOTSTRAP_CREDENTIAL_MISMATCH"),
            error: "bootstrap credential does not match" }, 403);
        /* END DEC-49 REGION is-bootstrap-claim */
        return relayAnswer(stub.fetch(new Request(`http://do/claim?fp=${fp}${doorStamps ? `&${doorStamps}` : ""}`, {
          method: "POST", body: JSON.stringify({ role: "admin", password: body.password }) })), "claim");
      }
      /* ===== REC-126 / DEC-31 / IC-145: THE REVIEW COPY'S READ AND COMMENT (R20) ====== */
      /* ===== REC-126 / DEC-31 / IC-145: THE REVIEW COPY'S READ AND COMMENT ======

         UNGATED, because the reader it exists for holds no credential of this
         instance. Two doors and nothing else:
           - `secret=` — a RECIPIENT. The value is HASHED HERE and only the
             fingerprint crosses to the store (`aicredentialmint`'s rule: nothing
             past this line has ever held the value). ANY presented value takes
             this door, including an empty or malformed one, so a malformed secret
             travels the same path as a revoked one and meets the same bytes.
           - otherwise the caller's session or credential, resolved by
             `caseReader` exactly as the unsigned case document resolves it, and
             the store asks standing in the producing project.
         Every caller who is neither a live grant's holder nor a member with
         standing receives ONE answer — the store's `#noReviewCopy`, built from no
         argument — at ONE status, so revoked, never-issued, malformed, a draft
         that does not exist and a draft the caller cannot see are the same bytes.
         The inner URL is built from nothing of the caller's but `draft` (and, for
         `statementack`, its subject and the acknowledger's `reason`, below). */
      /* D-150: `statementack` takes these two doors, and a member may name an unsigned case
         document (`case` + `edition`) in place of a draft. */
      if (op === "reviewcopy" || op === "reviewcomment" || op === "statementack") {
        const bySecret = credential.secret !== null;   /* R59 (admission R20): the body's `secret` */
        const q = new URLSearchParams();
        const draftParam = (url.searchParams.get("draft") || "").trim();
        if (draftParam) q.set("draft", draftParam);
        if (op === "statementack" && !bySecret)
          for (const k of ["case", "edition"])
            if (url.searchParams.get(k)) q.set(k, (url.searchParams.get(k) || "").trim());
        if (op === "reviewcopy" && url.searchParams.get("limit")) q.set("limit", url.searchParams.get("limit"));
        /* R64 (N761): the grant's digest crosses in the internal request's body alone, never its query; the door's mark
           `bySecret` stays in the query, where the owners read it */
        const digest = bySecret ? await sha256Hex(credential.secret || "") : null;
        if (bySecret) {
          q.set("bySecret", "1");
        } else {
          const reader = await caseReader(url, env, "bio", presentedAi.cred, credential);   /* admission's `readerOf` */
          if (reader.silent) return storeSilent(reader.silent, reader.correlation);
          q.set("viewer", reader.viewer);
        }
        /* DEC-88 (case-authoring R19, C-82.8): an acknowledgement carries the acknowledger's own words, on either door, in
           the query as case-authoring's `statementack` arm reads them: the caller's `reason=`, else a POST body's string
           `reason`, verbatim. Nothing else of the caller's crosses; an absent reason stays absent, refused there. */
        if (op === "statementack") {
          let reason = url.searchParams.get("reason");
          if (reason === null && req.method === "POST") {
            let b = null;
            try { b = JSON.parse((await req.text()) || "null"); } catch { b = null; }
            if (b && typeof b === "object" && !Array.isArray(b) && typeof b.reason === "string") reason = b.reason;
          }
          if (reason !== null) q.set("reason", reason);
        }
        let innerBody = digest === null ? null : { secretSha: digest };
        if (op === "reviewcomment") {
          let b = {};
          try { b = req.method === "POST" ? JSON.parse((await req.text()) || "{}") : {}; } catch { b = {}; }
          innerBody = { text: typeof b?.text === "string" ? b.text : "", ...(innerBody || {}) };
        }
        const out = await doAnswer(stub.fetch(`http://do/${op}?${q}`,
          innerBody === null ? undefined : { method: "POST", headers: { "content-type": "application/json" },
                                             body: JSON.stringify(innerBody) }));
        return reviewAnswer(out, op);
      }
      /* The sign-in and the invitation's two steps, relayed to the store's routes (credentials' `login`, membership's
         `invitelook` and `enroll`) and answered through R24's relay (D-679). The invitation ops answer from the store
         the caller names (`invStub` above). Moved from legacy-index at T19 (its door share). */
      if (op === "login") {
        const body = await req.json().catch(() => ({}));
        return relayAnswer(stub.fetch(new Request(`http://do/login${doorStamps ? `?${doorStamps}` : ""}`, {
          method: "POST", body: JSON.stringify({ role: body.role || "admin", password: body.password }) })), "login");
      }
      /* R58 (credentials R47; K1888): `recover`, credential-free as `login` is, pinned to `bio`: its `role`, `code` and
         `password` from the body alone, relayed once and never logged, kept or echoed here (R30); `source` and `country`
         the door's. */
      if (op === "recover") {
        const b = await req.json().catch(() => null);
        const o = b && typeof b === "object" && !Array.isArray(b) ? b : {};
        return relayAnswer(stub.fetch(new Request(`http://do/recover${doorStamps ? `?${doorStamps}` : ""}`, {
          method: "POST", body: JSON.stringify({ role: o.role, code: o.code, password: o.password }) })), "recover");
      }
      if (op === "invitelook" || op === "enroll") {
        const body = await req.json().catch(() => ({}));
        return relayAnswer(invStub.fetch(new Request(`http://do/${op}`, {
          method: "POST", body: JSON.stringify(body) })), op);
      }
      /* R54 (membership R101, R104; admission R17): the group website's and the join page's calls, answered as the
         invitation's two steps are, from the store the caller names (admission R3 lists them among the public ops that
         address `scratch`: each namespace holds its own key and link). Only the body's key (or link), cover and the
         website's approver cross, nothing of whoever called, and the one-time invitation is relayed once, never kept
         here (R30). */
      if (op === "websiteinvite" || op === "joinlinkinvite") {
        const b = await req.json().catch(() => null);
        const o = b && typeof b === "object" && !Array.isArray(b) ? b : {};
        const pass = op === "websiteinvite" ? { key: o.key, cover: o.cover, approvedBy: o.approvedBy } : { link: o.link, cover: o.cover };
        return relayAnswer(invStub.fetch(new Request(`http://do/${op}`, { method: "POST", body: JSON.stringify(pass) })), op);
      }
      /* R54 (membership R110): the group's self-description, the viewer read as admission's `readerOf` reads who is asking
         (`""` for no one) in the store the caller names, so the public receives only what membership answers the public. */
      if (op === "groupdescription") {
        const reader = await caseReader(url, env, url.searchParams.get("store") === SCRATCH ? SCRATCH : "bio", presentedAi.cred, credential);
        if (reader.silent) return storeSilent(reader.silent, reader.correlation);
        return relayAnswer(invStub.fetch(`http://do/groupdescription?viewer=${encodeURIComponent(reader.viewer)}`), op);
      }
      /* R44 (K921): the template grant's four doors, a recipient's secret or a member's session (above). */
      if (TEMPLATE_GRANT_DOORS.includes(op)) return templateGrantDoor({ req, url, env, op, spec, presentedAi, stub, credential });
      if (op === "instancegroup" || op === "groupidentity") return groupRead(op, url, env, presentedAi, credential);
      if (op === "knockerconsent") return knockerConsent(req, stub);
      /* R45 (DEC-111, K1170; public-read R18, R10): network-notices' public reads, each asked by its own name, served by
         public-read's door read from the published store (`stub`, `bio`; a `store=scratch` was refused above), with no
         credential and none of the caller's stamps; the read is handed only the parameters it declared. Asked as
         `op=publicread&name=<name>`, the same read is the public hook's (plane's, through `publicReadDoorOp`). */
      /* R49 (case-checker R15): case-checker's two public reads, by the same door read. */
      if (NETWORK_NOTICES_PUBLIC_READS.includes(op) || CASE_CHECKER_PUBLIC_READS.includes(op))
        return publicReadDoorRead(op, url, env, stub, { json, requiredArgument, storeSilent, storeRefusal, doAnswer });
      /* The public ops whose handlers are their modules' (publication, public-read, instance-setup, capture). */
      return hooks.publicOp({ req, url, env, op, stub, invStub, fp, presentedAi, credential, source, country });
    }

    /* R28: admission R5–R11 in their order (`admit`): the binding class, the agent credential, the session (its export
       refusal and session gate), the class or the agent's task scope, the capability, the landing. A refusal is answered
       as the gate gives it; a store that could not be asked is a silence, never a statement about the caller. */
    let admitted = await admit({ url, env, op, spec, method: req.method, presented: presentedAi, doAnswer, credential });
    if (admitted.silent) return storeSilent(admitted.silent.op, admitted.silent.correlation);
    if (admitted.refusal?.body?.reason === "NOT_AUTHENTICATED") {   /* R53: an ask's grant */
      const granted = await grantAdmit(env, url, op, spec, credential.token);
      if (granted.silent) return storeSilent(granted.silent.op, granted.silent.correlation);
      if (granted.caller || granted.refusal) admitted = granted;
    }
    if (admitted.refusal) return refused(admitted.refusal);
    const caller = admitted.caller;
    const { cls, viaSession, aiCred, storeName } = caller;
    /* REC-132: the session's two halves, apart: `sessViewer` wherever a VISIBILITY gate is stamped, `sessIdentity`
       wherever the question is WHO; `sessMember` the folded id every author, by and actor stamp carries. */
    const { member: sessMember, viewer: sessViewer, identity: sessIdentity, rights: sessRights, caps: sessCaps } = caller;

    /* D-9. The register audit finishes HERE and not in the Durable Object,
       because classifying a register row needs R2, and the DO neither holds the
       store name nor should guess it: capture keys are `<store>/captures/<sha>`.
       This is the SAME probe the gate already uses on the ratify path, where
       runGate enforces "bytes the register claims must exist" and refuses with
       PLANE_MISSING_BYTES. Making the diagnostic ask the same question as the
       enforcer, rather than inventing a second answer, is the whole point: the
       first version of this audit looked only in `files` and `history`, called
       everything else "dropped", and produced a confident wrong finding that
       the Apps Script migration was unauditable. The bytes were in R2. */
    /* op=whoami. What the caller is and what they may DO, so an interface can
       satisfy section 5's "absent from their interface" without keeping its own
       copy of the capability rules and letting it drift.

       A machine credential holds NO capabilities and the honest answer is null
       rather than an empty list or a full one: there is no member behind a token
       class, so there is nothing to hold them. What bounds a machine caller is
       the op table and the scratch confinement, and reporting it as though
       section 5 applied would be inventing a member who does not exist.

       `vocabulary` is the full set, so an interface can tell "not held" from
       "not a capability at all" without hardcoding the list. */
    if (op === "whoami") {
      return json({ ok: true, result: {
        tokenClass: cls,
        session: viaSession,
        member: viaSession ? sessMember : null,
        handle: viaSession ? (sessRights.handle ?? null) : null,
        administer: viaSession ? !!sessRights.administer : cls === "admin",   /* R18: the root of trust administers */
        rootOfTrust: viaSession ? !!sessRights.rootOfTrust : false,
        capabilities: viaSession ? [...sessCaps].sort() : null,
        vocabulary: Membership.CAPABILITIES,
        /* D-463: WHETHER THIS CREDENTIAL CAN EVER REACH THE RECORD, answered as a value rather than left for a
           caller to infer from the `store` beside it. The two are different facts and an instrument needs both:
           `store` is where THIS call landed, `confinedTo` is where every call it will ever make lands. `null` is
           "not confined", which is the honest answer for a session (a member is not a confined credential) and
           for the four binding classes (an operator sets them in the hosting dashboard, and there is no row to
           carry the property — the probe class's confinement is its CLASS's, read out of `scopeFor`, and is
           reported as `store` on every one of its answers). */
        confinedTo: cls === "ai" && aiCred ? (aiCred.confinedTo ?? null) : null,
        detail: viaSession
          ? "capabilities are set by an administrator and gate what this account may DO, not what it may see"
          : "a machine credential has no member behind it and therefore holds no capabilities; it is bounded "
          + "by the operation table and by namespace confinement instead",
      }, store: storeName, tokenClass: cls }, 200);
    }

    const stub = env.STORE.get(env.STORE.idFromName(storeName));
    /* R50: from here on, a refusal answered to a member's session is counted (`tallySessionRefusal`, in its namespace). */
    if (viaSession) seen.session = { op: askedOp, stub };

    /* A few ops read better at the edge than they do inside the store, so
       the public name and the internal name differ. The map is the only
       place that difference lives. */
    /* REC-14: op=publish is the STATE ACT; the store's own /publish is the
       ratify committer that writes the published_bundles row. Two different
       things with one obvious name, so the public name and the internal name
       differ here exactly as they do for op=inbox. */
    /* R36 (N364): `op=inboxpull` is the pull with its promotion, the store door's own route (`dispatch.mjs`), beside
       capture's `inboxpull`, which files the capture alone. */
    const DO_PATH = { inbox: "inboxlist", memberlist: "memberlist", signerlist: "signerlist",
                      publish: "publishcase", inboxpull: "inboxpullfile" };
    const inner = new URL("http://x/" + (DO_PATH[op] || op));
    for (const [k, v] of url.searchParams) if (k !== "token" && k !== "op") inner.searchParams.set(k, v);
    /* REC-132 / D-422: `identity` — WHO is asking, beside `viewer`'s what they may see —
       is the SERVER's stamp and nothing else. Deleted for every op before anything is
       stamped, so a caller naming a member here reads as nobody rather than as them. */
    inner.searchParams.delete("identity");
    /* R17, R29: EVERY stamp the caller sent is deleted, whether this op declares it or not; the op's own are set below. */
    for (const k of QUERY_STAMPS) inner.searchParams.delete(k);
    /* R44: a grant's digest and the secret door's mark are the door's alone (the mints below, the four grant doors), so a
       caller's copy reaches no admitted op. */
    for (const k of ["secretSha", "bySecret"]) inner.searchParams.delete(k);
    /* R61 (op-declarations R32): what an op takes from the body alone leaves the address the store is asked at */
    if (Object.hasOwn(BODY_ONLY, op)) for (const k of BODY_ONLY[op]) inner.searchParams.delete(k);
    /* R53 (K1122, K1674; op-declarations R17–R20): T33'S OPS' STAMPS, each declared key (`OP_STAMPS`) deleted from the
       caller's query and set by one expression: `viewer` every read's; `by` (query) and `bodyBy` (the body's `by`, below)
       the actor in the viewer's form (a session's viewer; a machine `class:<cls>`, an agent `class:ai/<tokenId>`);
       `author` the positional identity and `proposer` the label, by `QUERY_AUTHOR_ACTIONS`' and `actionlawspropose`'s
       expressions; `member` and `session` a session's own member and token, never set for another caller. An ask grant
       token travels in the `x-bio-grant` header (below). */
    const declared = OP_STAMPS[op] || [];
    const actor = viaSession ? sessViewer : cls === "ai" ? `${MACHINE_CLASS_PREFIX}ai/${aiCred.tokenId}` : `${MACHINE_CLASS_PREFIX}${cls}`;
    const stampOf = { viewer: viaSession ? sessViewer : cls === "ai" ? aiCred.principal : actor, by: actor,
      author: viaSession ? sessIdentity : actor, proposer: viaSession ? sessMember : actor,
      member: viaSession ? sessViewer : null, session: viaSession ? credential.token : null,
      /* T35 (op-declarations R30; K1972): `principal`, the run verbs' expression; `owner`, a selection's owner (the
         stamp a selection scope is read under) */
      principal: viaSession ? sessIdentity : cls === "ai" ? `${aiCred.principal}/${aiCred.tokenId}` : `${MACHINE_CLASS_PREFIX}${cls}`,
      owner: viaSession ? sessIdentity : `${MACHINE_CLASS_PREFIX}${cls}`,
      /* R68 (admission R21; T37): who is calling, as on `login` (R58): the window's keyed fingerprint of the connecting
         address and Cloudflare's country, the door's alone, read only for an op that declares them */
      ...(declared.includes("source") ? { source: await sourceOf(req, env) } : {}),
      ...(declared.includes("country") ? { country: countryOf(req) } : {}) };
    /* R59, store-door R9 (K2038 (1)): a stamped `session` is a credential, so it reaches the store in the internal header
       `x-bio-session`, never the address; store-door hands it to the owner's map in process. A caller's `session`
       parameter is deleted for every op. */
    inner.searchParams.delete("session");
    let sessionCarried = null;
    for (const k of declared) if (Object.hasOwn(stampOf, k)) {
      inner.searchParams.delete(k);
      if (k === "session") { sessionCarried = stampOf[k]; continue; }
      if (stampOf[k] !== null) inner.searchParams.set(k, stampOf[k]);
    }
    /* R59, store-door R9 (F1; K2037 (b)): an ask's grant reaches the store in the internal header `x-bio-grant`, never the
       address: a caller's `grant` parameter is deleted for every op, and the header is set for the grant's caller alone. */
    inner.searchParams.delete("grant");
    const withGrant = (init) => {
      const headers = { ...(init.headers || {}), ...(aiCred?.grant ? { [GRANT_HEADER]: aiCred.grant } : {}),
                        ...(sessionCarried ? { [SESSION_HEADER]: sessionCarried } : {}) };
      return Object.keys(headers).length ? { ...init, headers } : init;
    };
    /* Who holds a lease is stamped by the server, never taken from the request,
       for BOTH a session and a machine credential — the same impostor rule
       `author`, `by` and `viewer` follow below. A session stamps the member; a
       machine credential stamps `token:<class>`, a NAMED machine identity, so an
       unattended writer can take the lock (D-61) without borrowing a person's
       name and without being anonymous. The caller's own `actor` was copied in
       the loop above, so it is DELETED first and set second: a lease whose actor
       the caller may choose names nobody. This does not weaken integrity — the
       lease is a courtesy lock and promote's CAS on `base` is what prevents a
       lost update — it makes the courtesy lock reachable by a named daemon.
       The store additionally refuses a null/blank actor by name, so a bypass of
       this stamp fails closed rather than tripping the NOT NULL constraint. */
    /* R58 (T35; acquisition R38, R40; capture R73): `op=unpack` reaches capture's pass-through with the caller's class
       and whether it arrived by a member's session, the door's word, never the caller's (`cls: "member"` for a member's
       session, `"daemon"` for the daemon continuing an automatic unpack); acquisition judges who may open an archive. */
    if (op === "unpack") {
      inner.searchParams.set("cls", viaSession ? "member" : cls);
      inner.searchParams.set("member", viaSession ? "1" : "0");
    }
    if (op === "lease") inner.searchParams.set("actor", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* K372 (monitoring R30): WHO PAUSED OR RESUMED THE DAEMON, the server's stamp by the roster acts' `by` expression and
       set after the caller's parameters were copied, so a caller's `actor` is overwritten; monitoring records it with
       the pause and states it on every tick's answer. */
    if (op === "monitorpause") inner.searchParams.set("actor", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* D-15: whose view a query compiles for is decided by the SERVER, from the
       credential that authenticated, and set AFTER the caller's parameters were
       copied so a caller-supplied `viewer` is overwritten rather than honoured.
       The gate is flat member scope today and returns true for a member; when
       projects and positions land it returns a real predicate and this is still
       the only place the identity comes from. A viewer the compiler does not
       recognise compiles to a deny predicate, so the failure mode of a missing
       stamp is an empty result rather than an unfiltered one. */
    /* REC-25 / F-8: the stamp covers EVERY read that could name a bundle, not
       only the compiled-query paths. op=list, op=index, op=projection,
       op=image and op=file bypassed it — an uninvited member read every
       project's id, title and state, and op=image handed over the document
       body itself — and op=backlinks is born stamped. The store fails closed
       on an absent viewer, so removing an op from this list yields an empty
       answer rather than an unfiltered one. (op=affordances takes the same
       stamp in its own handler, reached through plane's hooks; op=search and the edge/state actions
       were stamped from the first commit.) */
    /* REC-30: the sweep of what REC-25 left. REC-25 stamped the reads ADDRESSED
       to a bundle; these are the reads addressed to something else that NAME a
       bundle on the way past — op=dangling (measured: a project citing a
       nonexistent target handed an uninvited member its own id), the task inbox
       and its refers_to filter, the recogniser and progression reads and the
       two write-echoes that read an instance back, and the two paging integrity
       sweeps whose findings name bundles. Every one fails closed in the store on
       an absent stamp, so removing an op from this list withholds an answer and
       never widens one. `op=queue` and `op=affordances` take the same stamp in
       their own handlers, reached through plane's hooks. */
    /* REC-36: `readingname` joins them, and its posture is the STRONGER of the
       two the gate's header describes. The other reading reads keep the row and
       withhold the bundle back-reference; a CANDIDATE list withholds the ROW,
       because a document a member cannot open is not a candidate and offering a
       nameless one still discloses that something mentioning their subject sits
       in a project they were not invited to. Fails closed in the store on an
       absent stamp, like every op in this list. */
    /* CPDF-10: both transcription reads name the bundle a capture is filed in,
       so both take the same stamp for REC-30's reason exactly — the answer
       would otherwise disclose that a document sits in a project the caller was
       never invited to, by telling them what produced its text. `attesttext`
       is NOT here: it is a WRITE and takes its own member route. */
    /* REC-132 / D-422: the ops whose store method reads the POSITIONAL `identity` stamp
       (`#positionalMember`). `affordances` and `queue` build their own inner requests
       in their owners' handlers, reached through plane's hooks (`gatedOp`), and stamp it there. A new reader of `identity` joins this list. */
    /* D-681 (T5-11): `leadlist` joins, `leadread`'s reach asked of the same positional stamp. */
    const IDENTITY_READS = ["leadlook", "leadread", "leadshare", "leadlist", "frontier"];
    const REC30_VIEWER_READS = ["dangling", "tasks", "reading", "readingref", "readingname",
                                "textprovenance", "textattest",
                                /* CPDF-13: the drift obligation's rows NAME the bundle each
                                   affected capture is filed in, so it takes the same stamp
                                   for REC-30's reason exactly — otherwise "which of your
                                   documents rest on a superseded measurement" would disclose
                                   that a document sits in a project the caller was never
                                   invited to. `calibrations` is NOT here: it answers about
                                   ENGINES and names no bundle at all. */
                                "calibrationdrift", "resolutions",
                                "concerns", "connections", "instance", "exceptions", "thread",
                                "discharge", "audit", "searchindexcheck", "projectownerarith",
                                /* REC-14's read, swept at the merge: its bar report NAMES the
                                   projects that declared the bar, which is §7.9's reverse-edge
                                   walk arriving by a new door. The VALUE stays whole for every
                                   reader (DEC-17) — only the names are withheld. */
                                "strengthbarof",
                                /* REC-149: the setting's read and the directory decide by the caller's SIGHT
                                   (Membership v2 §7.14), so both take the stamp; each fails closed without it. */
                                "projectvisibility", "projectdirectory",
                                /* REC-196: the roster read names a project by its own id, so the store needs the
                                   caller's SIGHT to answer C-70.1 at EXISTENCE (BOB #32's ruling (a)). Its own
                                   answer still reads the `by` stamp below; the viewer is read only by that check. */
                                "projectparticipants",
                                /* REC-150: the requests read decides by the caller's SIGHT of the project it
                                   names (C-70.1 at EXISTENCE, the absent answer at NONE), so it takes the stamp. */
                                "projectrequests",
                                /* N321 (publication R44): the stage read names a project by its own id and answers by
                                   the caller's SIGHT (the absent answer at NONE, the id and name at EXISTENCE), so it
                                   takes the stamp and fails closed without it. */
                                "projectstage",
                                /* N388 (capture R69, K580): the accounts of a capture answer by the caller's SIGHT of
                                   the bundle that files it, so an unseen capture reads as one with no account; capture
                                   fails closed without the stamp. `lateattestations` names no bundle and takes none. */
                                "captureaccounts"];
    /* PL-9: op=meaningrows is the SAME compiler read at meaning grain, so it
       takes op=search's stamp beside op=search rather than joining a list of
       reads that merely name a bundle. Its answer is a CANDIDATE LIST in §14c's
       sense and takes REC-36's stronger posture in the store — the whole ROW is
       withheld, never a redacted reference — and, like every op here, it fails
       closed on an absent stamp: the deny predicate answers zero rows AND a zero
       total, so hidden and absent are the same answer. */
    if (op === "search" || op === "meaningrows" || op === "select" || op === "selection" || EDGE_ACTIONS.includes(op)
        || STATE_ACTIONS.includes(op)
        /* REC-24: both action acts read the bundle behind the fail-closed gate
           before they write it, so an action the caller may not see refuses
           NO_SUCH_BUNDLE identically to an absent one. */
        || ACTION_ACTIONS.includes(op)
        /* REC-45: it reads the inquiry behind the fail-closed gate before it
           rewrites it, so a question the caller may not see refuses
           NO_SUCH_BUNDLE identically to an absent one. */
        || STRUCTURE_ACTIONS.includes(op)
        || op === "list" || op === "index" || op === "projection" || op === "image"
        || op === "file" || op === "backlinks" || op === "excludedby" || op === "reevaluations"
        /* REC-34: the gated read of the derived pair. Its subject is a bundle
           and its answer NAMES bundles in fields AND in prose, so it is stamped
           with every other retrieval read; the store fails closed on an absent
           stamp and withholds the answer as an absent bundle's. */
        || op === "inquirystrength"
        /* REC-18: its subject is an inquiry and its answer names the bundles a
           basis rests on, so it is stamped with every other retrieval read. The
           store fails closed on an absent stamp, withholds an invisible inquiry
           as an absent one, and drops an invisible target with no id and no
           count. */
        || op === "earnedbasis"
        /* REC-83 / IC-84 (4): the fixed-key content read. Its subject is a
           content ROW and its answer names the BUNDLE the row's capture is
           filed in, so it takes the same stamp for REC-30's reason exactly. It
           matters more here than on most of this list: the id is
           hash(capture, extent, chain), so a caller who can guess an address
           must not be able to learn from the answer whether the passage exists
           in a project they were never invited to. The store fails closed on an
           absent stamp and answers an invisible row EXACTLY as an absent one. */
        || op === "content"
        /* D-419 (T5-11): the crop resolves ONE content row by id, so it takes op=content's stamp for op=content's
           reason, and the store answers an invisible row exactly as an absent one (NO_SUCH_CONTENT). */
        || op === "contentcrop"
        /* REC-54: its subject is a bundle and it reads that bundle's register
           before it rewrites it, so a document the caller may not see refuses
           NO_SUCH_BUNDLE identically to an absent one. The store fails closed on
           an absent stamp, like every op in this list. */
        || op === "provenancechain"
        /* REC-63: its subject is a bundle and its answer names it, so it is
           stamped with every other retrieval read — and the store's own refusal
           makes an invisible document answer EXACTLY as an absent one
           (ROUTE_MARK_NO_SUCH_BUNDLE), which is the whole reason the stamp
           matters here: a marker on a document the caller may not see must not
           be establishable by asking to make one. */
        || op === "provenanceroute"
        /* REC-116: the COLLECTION read over the same marks, and it is the shape
           that LEAKS if the stamp is missing rather than the shape that merely
           refuses — a marker names a document the group holds, so a row the
           caller may not see must be ABSENT from the roster byte-identically to
           one that does not exist (op=airuns' rule, REC-30/REC-25's leak). The
           store fails closed on an absent stamp, like every op in this list. */
        || op === "provenanceroutes"
        || QUEUE_ACTIONS.includes(op)
        /* IS-6: a run names an inquiry or a project bundle, so a run over a
           project the caller was never invited to must answer exactly as a
           nonexistent run does — REC-25/REC-30's leak, one object over. The
           store fails closed on an absent stamp, like every op in this list. */
        || op === "airun" || op === "airunlog" || op === "airunspawn"
        /* REC-139 / D-428: the three RUN VERBS state how many projects draw on the run's question
           (`projectGate.projects`), and that count may include only projects the caller can SEE
           (Membership v2 §7, BOB #15). The stamp is what the store counts in; DEC-63's verdict is
           not read from it. Fails closed on an absent stamp: no project is stated, never every one. */
        || RUN_VERB_ACTIONS.includes(op)
        /* REC-93: the frontier's subjects are addresses a project went looking
           for, which is the same disclosure a run is — §6 says REC-36's
           withholding applies row-whole across the fence. Stamped here so the
           store fails closed on an absent stamp, like every op in this list. */
        || op === "frontier" || op === "contentaxis"
        /* REC-69: the same gate, keyed the other way round. Its three siblings
           take a RUN ID and answer about the context that run names; this one
           takes the CONTEXT and answers about the runs in it — so it is the
           shape that leaks if the stamp is missing, rather than the shape that
           merely refuses. A run in a project the caller was never invited to is
           ABSENT from the list, byte-identically to one that does not exist, and
           the store fails closed on an absent stamp like every op in this list. */
        || op === "airuns"
        /* PL-10 / D-220: a version chain names a BUNDLE per version, so a
           document captured inside a project the caller was never invited to
           must be absent from the chain exactly as it is absent from op=list.
           The store gates at `register.bundle_id` through the same
           `#bundleGate` every read here compiles and counts `total` through the
           same predicate, so hidden and absent are one answer; and it fails
           closed on an absent stamp, like every op in this list. */
        || op === "versionchain"
        /* D-394: the notice names the question or passage asked about AND the
           newer version it found, so both are gated: the subject through
           `#viewerSees` and the chain through `versionChain`'s own gate. Fails
           closed on an absent stamp, like the chain it reads. */
        || op === "versionnotice"
        /* PL-1 / IS-1: a version set names its INQUIRY and every bundle its legs
           rest on, so an inquiry the caller was never invited to must answer
           exactly as one with no versions and as one that does not exist. The
           store applies `#bundleGate` to the inquiry ONCE and counts `total`
           behind the same gate, so hidden and absent are one answer; and it
           fails closed on an absent stamp, like every op in this list. */
        || op === "basisversions"
        /* PL-14 / IS-7: a strength names the QUESTION and every document its
           reading rests on, so a question the caller was never invited to must
           answer exactly as one that does not exist. The store applies
           `#bundleGate` to the inquiry ONCE, before any leg is read, and fails
           closed on an absent stamp, like every op in this list. */
        || op === "versionstrength"
        /* REC-161: the proposed-partition independence read names the same
           QUESTION and the documents its reasons rest on, so it takes the same
           stamp; the store gates the inquiry ONCE, before any leg is read, and
           fails closed on an absent stamp. */
        || op === "partitionindependence"

        /* PL-12 / D-84: a project-scoped manifest names a PROJECT bundle, and
           the adopted bias bundles are bundles too, so a caller who may not see
           the project must be answered exactly as they are for a project that
           does not exist — REC-25/REC-30's leak arriving at the lens. The store
           gates through the same `#bundleGate` every read here compiles and
           fails closed on an absent stamp, like every op in this list. */
        || op === "biasmanifest"
        /* REC-207: the bias-debt READ names a RUN and its answer names the run's context, so it takes the
           same fail-closed stamp its three run-read siblings do — a debt on a run the caller was never
           invited to must be absent byte-identically to a run that never carried one. And the RESOLVE
           takes it too, because its refusal is asked through the SAME `#bundleGate`: an unseen debt and an
           absent one are deliberately one answer, which they cannot be if the gate is not stamped. Fails
           closed on an absent stamp, like every op in this list. */
        || op === "biasdebt" || op === "biasdebtresolve"
        /* REC-149 (Membership v2 §7.14): the two acts that name a project and took no viewer — a bias set adopted
           into a project's scope, and a review copy's draft under a project. Each asks the stamp ONLY for
           EXISTENCE (a discoverable project, a member outside it: C-70.1); every other caller's answer is
           unchanged, because each act's own fence already answers without it. */
        || op === "biasadopt" || op === "casedraft"
        /* PL-2 / IS-2: the six acts name an inquiry, and make-current also names
           a project. A question the caller was never invited to must refuse
           exactly as an absent one does, so the store gates both through the same
           predicate and fails closed on an absent stamp, like every op here. */
        || VERSION_ACTIONS.includes(op)
        /* PL-3 / IS-4: the suggest endpoint names an inquiry AND resolves every
           leg against the corpus, so it takes the same fail-closed viewer stamp
           for BOTH — a question the caller was never invited to must refuse
           exactly as an absent one does, and a leg the caller cannot see must
           be unreachable rather than silently accepted. */
        || op === "suggest"
        /* PL-4 / IS-4: the capture-request door names the inquiry the request is
           accountable to, so a question the caller was never invited to must
           refuse exactly as an absent one does — otherwise the door would be a
           way to learn that a question exists by asking to fetch under it. */
        || op === "capturerequest"
        /* PL-4: and the queue READ, for the same reason one line up — a request
           names the question it was asked under, so the queue under an inquiry
           the caller was never invited to must be absent exactly as one that was
           never made. */
        || op === "capturerequests"
        /* T6-13 (capture-requests R42): the retry names a request and the question it was asked under, so the store
           asks this viewer's sight of it and answers an unseen request as an absent one. Fails closed on an absent
           stamp. */
        || op === "capturerequestretry"
        /* T6-13 (intent R23): every one of intent's reads and acts names a project, a goal or an aspiration, and each
           answers one the viewer may not see exactly as an absent one, so all seventeen take the stamp. */
        || INTENT_ACTIONS.includes(op) || INTENT_READS.includes(op)
        /* T6-13 (reevaluation R9, R14–R16, R20): the notices and the pull read name findings and passages, and the three
           acts name a notice or a dependent, each seen through its holder; an unseen one answers as absent. */
        || op === "reevaluationnotices" || op === "reevaluationchanges" || REEVALUATION_ACTIONS.includes(op)
        /* D-266 / IC-60: the disposition act's SECOND key shape names a PROJECT — the team
           whose feed the decision governs — so it takes the same fail-closed stamp for the
           same reason every op above does. A project the caller was never invited to must
           refuse EXACTLY as one that does not exist, or the act becomes a way to learn that
           a project exists by trying to record a judgment under it (REC-25/REC-30's leak
           arriving at a WRITE rather than a read). The instance-wide shape names no project
           and is unaffected: it reaches the same store method and never consults the stamp. */
        || op === "proposedispose"
        /* SK-7: marking a passage citable NAMES A DOCUMENT, so it takes the same
           fail-closed stamp every op above does and for the same reason arriving
           at a new door. A content id is `hash(capture, extent, chain)` and the
           act answers whether the row was NEWLY minted, so without the gate a
           caller could learn that a document exists in a project they were never
           invited to by trying to mark a page of it — REC-25/REC-30's leak,
           arriving at a WRITE. The store fails closed on an absent stamp and
           answers an invisible bundle EXACTLY as an absent one. */
        || op === "contentmint"
        /* SK-8: both EXTRACT ops, for `contentmint`'s reason exactly. The WRITE
           mints through that same door, so it carries the same oracle; and the
           READ answers about documents, so an ungated listing would be the
           identical leak one op over. Fails closed on an absent stamp. */
        || op === "extractpropose" || op === "extractproposals"
        /* REC-147: the candidate write re-forms the pairs AS THIS VIEWER (§6) and pairs only what the viewer may
           see, so it needs the viewer exactly as `contradictionpairs` does. Fails closed on an absent stamp. */
        || op === "contradictionpropose"
        /* REC-86: NARROW and its candidate read both NAME A QUESTION and read
           its readings, so a question the caller was never invited to must
           answer exactly as one that does not exist — the version acts' reason
           one screen up. Fails closed on an absent stamp. */
        || op === "narrow" || op === "narrowcandidates"
        /* REC-122: choosing a connection's on-point mention NAMES A DOCUMENT (the end
           chosen on), so a document the caller was never invited to must answer exactly
           as a connection that does not exist (C-74.2). Fails closed on an absent stamp. */
        || op === "connectionchoose"
        /* T5-11 (K145, connections R53–R57): each names a document or a capture — the two ends asserted, a
           document's asserted connections, an agenda capture, a stored containment's two ends — so a document the
           caller was never invited to answers exactly as one that does not exist. Fails closed on an absent stamp. */
        || op === "connectionassert" || op === "connectionsasserted" || op === "filemembershipstore"
        || op === "filemembership" || op === "filemembershipjudge"
        /* REC-146: THE PAIRING READ names no single object and is gated for a wider
           reason than the two above — it ENUMERATES, across every question and every
           cited document, and section 6 of its design requires it to pair only what
           the viewer may see and never to enter a project's contents uninvited. An
           absent stamp therefore fails CLOSED to `scope: DENY`, and the answer SAYS
           it compared nothing rather than reading as a record with no conflicts. */
        || op === "contradictionpairs"
        /* D-148: the quote read ENUMERATES across actions by counterparty, so it
           reads only what the viewer may see and fails CLOSED on an absent stamp. */
        || op === "actionquotes"
        /* REC-198: the LIST of a project's drafts NAMES A PROJECT and enumerates its working material, so a
           project the caller cannot see must answer exactly as one that does not exist — and the single read of
           a draft answers such a caller `#noReviewCopy`, so the list does too (BOB #32: fenced exactly like it).
           Fails closed on an absent stamp. */
        || op === "casedrafts"
        /* REC-87: all three TRANSCRIBE ops name a DOCUMENT (the act) or a content
           row filed in one (the attestation and the read), so a document the
           caller was never invited to must answer exactly as one that does not
           exist — `contentmint`'s and `content`'s reason. Fails closed on an
           absent stamp. */
        || op === "transcribe" || op === "transcriptionattest" || op === "transcription"
        /* T5-11 (content R43, K134): attesting a capture's text names the bundle the capture is filed in, so the
           store asks the viewer before it records anything and answers a capture filed where the caller cannot see
           exactly as one this record has not read (NO_READING); it fails closed on an absent stamp. The attestor
           is stamped below, by its own rule. */
        || op === "attesttext"
        /* MK-4: the look and the read name a LEAD, readable by its author only,
           and the look names what it found (a capture or a content row), which is
           gated like every other reference to a document. Fails closed on an
           absent stamp. */
        || op === "leadlook" || op === "leadread" || op === "leadshare" || op === "leadlist"
        /* D-162: a THEME's placement acts and its read NAME A DOCUMENT (or a passage
           of one), so a document the caller was never invited to must answer exactly
           as one that does not exist — `contentmint`'s reason. Fails closed on an
           absent stamp. */
        || op === "themeplace" || op === "themepropose" || op === "themeread" || op === "themewithdraw"
        /* REC-203: a PAIR judgement names two CAPTURES and reads where the record retrieved each, so a
           document the caller was never invited to must answer exactly as one the record does not hold
           (C-91.3) — `contentmint`'s reason. Fails closed on an absent stamp. */
        || op === "idmatch"
        /* REC-195: the governing-law proposal NAMES AN ACTION and reads it behind the fail-closed gate before
           it writes anything, so an action the caller may not see refuses NO_SUCH_BUNDLE identically to an
           absent one — `ACTION_ACTIONS`' own reason, arriving at an op that is not one of them. */
        || op === "actionlawspropose"
        /* D-464: the COUNTS. Every counter `op=stats` serves names rows, and a row naming a project the caller
           cannot see is that project's existence (§7.9) — so the counts are taken through the caller's own
           sight, and fail closed on an absent stamp. `op=selftest` relays the same answer and stamps the same
           viewer at its own fetch. */
        || op === "stats"
        /* D-464: `op=selectionlist`'s `bytes` sums every owner's selection rows, so it takes the same stamp. */
        || op === "selectionlist"
        /* D-525: the Drive shell sweep walks `bundles` and names bundle ids, so it takes
           op=index's stamp for op=index's reason (REC-25): an invisible bundle is not walked. */
        || op === "driveshells"
        /* REC-138 / D-426: the ROSTER acts name a project, so one the caller cannot see must
           answer exactly as one that does not exist — asked of SIGHT before any positional test
           (membership's `inSight`). `by` (below) stays the positional half; this is the visibility half.
           ONE DIFFERENCE from the rest of this list, stated at membership's `rosterInSight`: the store
           treats a viewer that was never SENT as a direct internal call and does not ask, on
           `#projectAuthority`'s absent-identity precedent — so this stamp is load-bearing, and the
           `roster-stamp-dropped` control arm measures what removing it discloses. */
        || PROJECT_ACTIONS.includes(op)
        /* N85's other half (membership R19, K124): which pairings a caller may see is asked of its viewer — a
           member sees its own unpublished pairing — beside the administer stamp below. Without either the store
           answers the published pairings alone (fails closed). */
        || op === "memberpairings"
        /* T8 (layer 9): every act and read of the action layer names a determination, a standard, an act, an
           action, a filing, a packet or an escalation, each seen through the project it belongs to, so each module
           answers one the viewer may not see exactly as an absent one. Fails closed on an absent stamp. */
        || ACTION_LAYER_ACTIONS.includes(op) || ACTION_LAYER_READS.includes(op)
        /* T8 (actions R28): the risk-tier proposal names an action and reads it behind the fail-closed gate before it
           writes, `actionlawspropose`'s reason. */
        || op === "actionriskpropose"
        /* T8 (monitoring R32): the monitored sources name bundles, `driveshells`' reason (REC-25). */
        || op === "monitoring"
        /* K372 (monitoring R30): the due slate names bundles too, and answers only what the viewer may see. */
        || op === "monitorslate"
        /* N345 (contradiction R10, R25–R55): every read and act names a candidate, an inquiry, a referent or a project
           and answers only what the viewer may see of each side; the run's recommendation is re-formed as this viewer,
           as its candidate write is. Fails closed on an absent stamp. */
        || CONTRADICTION_ACTIONS.includes(op) || CONTRADICTION_READS.includes(op) || op === "contradictionrecommend"
        /* N345 (entities R38, R32): the two registry reads now answer each resolution's defect reports, whose `by` is
           withheld from a viewer who may not see the document, so they take the stamp. */
        || op === "entity" || op === "entitybyalias"
        /* N345 (case-authoring R32): the ceremony's read names a project and its members, read exactly as op=publish
           reads them, so it takes publish's stamp. */
        || op === "publishtensions"
        /* N364 (case-authoring R34): the ceremony's pre-flight is op=publish run and rolled back, so it takes publish's
           stamp; (sources R1, R5, R9) a source's reads answer by the caller's sight, and a machine credential reads
           nothing there; (R36) the pull's promotion is asked of the puller's sight, op=promote's `actorViewer`. */
        || op === "publishpreflight" || SOURCE_READS.includes(op) || op === "inboxpull"
        /* K1037, K1108 (capture R76, R77, R79–R81): the held documents' list and acts, the grade note and the doorbell's
           tally answer by the caller's sight (membership R43), and capture fails closed without the stamp: an unstamped
           call sees nothing. The acts' `by` is CAPTURE_MEMBER_ACTIONS' below. */
        || CAPTURE_VIEWER_ACTIONS.includes(op) || CAPTURE_READS.includes(op)
        /* R45 (K1168; op-declarations R10): case-authoring's draft of what changed and its read (R39) and network-notices'
           act and reads (R1, R4, R22, R23) each answer by the caller's sight, and fail closed without the stamp
           (escalation's `escalationreasondraft` and link-sweep's `sweeps`, its R9 (N506), take it as `ACTION_LAYER_READS`). */
        || WHAT_CHANGED_PROPOSAL_ACTIONS.includes(op) || WHAT_CHANGED_READS.includes(op)
        || NETWORK_NOTICES_ACTIONS.includes(op) || NETWORK_NOTICES_READS.includes(op)
        /* R48 (op-declarations R13; docket R1–R8, R12): every docket act and read answers by the caller's sight of the
           case's project, and docket fails closed without the stamp. (`projectholds`, `actionholdpreview` and
           `actionholdrelease`, R47, take it as the action layer's, op-declarations R12.) */
        || DOCKET_ACTIONS.includes(op) || DOCKET_READS.includes(op)
        /* R49 (op-declarations R14; case-import R1, R4): every import act and read answers by the caller's membership,
           asked of `viewer` (or `by`), and case-import answers a viewer who is no active member as if no import exists. */
        || CASE_IMPORT_ACTIONS.includes(op) || CASE_IMPORT_READS.includes(op)
        /* R50 (op-declarations R15; wizard-scripts R20): every wizard act but the editor grant's and every wizard read
           answers a script the viewer may not see as absent, so each takes the stamp. */
        || WIZARD_VIEWER_OPS.includes(op)
        || REC30_VIEWER_READS.includes(op)) {
      /* PL-11 / IS-5 / D-199 (4) — THE STATED VIEWER, AND IT IS THE RECORD'S
         ANSWER RATHER THAN THE CLASS'S.
         An `ai` credential does NOT stamp `class:ai`. It stamps the PRINCIPAL
         the minting member wrote down, which is `member:<id>` for a
         member-scoped key and `class:ai` for an organisation-scoped one. That
         makes D-199 (4)'s distinction operational instead of decorative: a
         member-scoped credential compiles under `viewerPredicate`'s
         PARTICIPATION FILTER and sees exactly what that member sees, so an
         agent cannot read a project its principal was never invited to — while
         an organisation key acts for the group and is unfiltered like every
         other instance-level credential. The two are measurably different reads
         and both arms are driven.
         IS-5's "member-scoped default" lives at the MINT, where a principal must
         be stated (C-29.2) and the member-scoped form is the documented one; it
         is not defaulted here, because a viewer this function guessed would be a
         viewer the record cannot account for. */
      inner.searchParams.set("viewer",
        viaSession ? sessViewer
        : cls === "ai" ? aiCred.principal
        : `${MACHINE_CLASS_PREFIX}${cls}`);
      /* REC-132 / D-422: THE POSITIONAL HALF, stamped beside the viewer for the ops whose
         store method READS it. It differs from the viewer for exactly ONE principal — the
         founder's session, whose viewer is the administrator's and whose identity is
         `member:admin` — and the store reads it only where a ruling names a person: the
         lead reads (`#leadReach`: author, or a participant it was shared to) and the
         internet frontier built on them.
         NAMED OPS, NOT EVERY OP IN THIS LIST, and that is measured rather than tidy: the
         first build stamped it on every op here and `op=content` — a FIXED-KEY read that
         refuses any parameter it does not name (D-222) — refused every call, which six
         content suites caught. A param a route does not read is not free. */
      if (IDENTITY_READS.includes(op)) inner.searchParams.set("identity",
        viaSession ? sessIdentity
        : cls === "ai" ? aiCred.principal
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    }
    /* D-157: WHETHER THIS CALLER ADMINISTERS, decided by the SERVER from the
       credential that authenticated, and set AFTER the caller's parameters were
       copied above so a caller-supplied `administer` is overwritten rather than
       honoured. It drives ONE thing: whether op=memberlist's rows carry `cover`
       beside `handle`. Section 3 gives members and the public the handle roster
       and gives only administrators the PAIRING, so the rule is a projection in
       the store (membership's member list) rather than a class ACL here — the op is
       legitimately reachable by a member, and what a member must not receive is
       a FIELD, not the answer.

       Who administers: a SESSION reports its own `administer` right, which is
       true for the root-admin session and for a member whose role is admin —
       the same field op=whoami publishes, so an interface cannot be told one
       thing and served another. A MACHINE credential administers only when it is
       the ADMIN_TOKEN class, the root of trust every membership rule sits
       beneath (4.6). MEMBER_TOKEN does not, which is half of what D-157
       measured. PROBE_TOKEN does not either, and that is deliberate rather than
       incidental: scopeFor confines probe to the scratch namespace — a different
       Durable Object with its own member table — so it never reached the live
       roster, and it now also cannot use scratch to rehearse a read of a pairing
       no non-administrator is entitled to.

       The store fails closed on an absent or unrecognised stamp (handles, no
       cover), so deleting this line loses the pairing rather than leaking it. */
    /* PL-10 / D-220. THE ADDRESS IS NORMALISED BY THE SAME FUNCTION THAT WROTE
       THE ROW, and that is not a convenience — it is the whole reason the chain
       can be trusted. `recordCapturedLocator` stores `address_norm` as
       `normalizeAddress` produced it at capture time; a chain that normalised
       differently, or not at all, would answer "no versions" for a document the
       record plainly holds, and `subresources.mjs` says exactly why that is the
       failure hardest to notice: *a normalisation MISS looks exactly like "not
       captured"*. The store's route takes the address as given (normalising it
       there was legacy-store's gap, whose `store.mjs` is gone), so it happens here,
       at the same seam op=links has used since REC-52. The caller's raw
       `address` was copied in the loop above and is overwritten. */
    if (op === "versionchain")
      inner.searchParams.set("address", normalizeAddress(url.searchParams.get("address") || ""));
    /* PL-12 / D-84 / DEC-46: WHOSE NAME IS ON THE ADOPTION, decided by the
       SERVER from the credential that authenticated and set after the caller's
       parameters were copied, so a caller-supplied `author` is overwritten
       rather than honoured. This is the strictest reading of DEC-54 (c): the
       whole hazard the ruling names is a group appearing to follow an
       organisation's standards "with nobody in the group having authored
       anything", and an author a caller can name is an author nobody authored.
       A machine credential stamps `token:<class>` and the store refuses it BY
       NAME (C-26.9) rather than recording a machine as the adopter — the same
       fence op=publishedcase already draws for the bias acknowledgement. */
    if (op === "biasadopt")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* REC-131 / IC-148: THERE IS NO `operator` STAMP ON op=stats ANY MORE — every COUNT is the same for
       every class (`MEMBER-KNOWLEDGE-DESIGN.md` §5, BOB #15), and a caller's `operator=` is not read.
       What remains is `capacity`, which governs `dbBytes` ONLY (the admin class's: capacity is an
       operator need, and the figure moves in whole pages on every write, a lead's included). Set by
       the SERVER from the class that authenticated, AFTER the caller's parameters were copied, so a
       caller's `capacity=1` is overwritten. `admin` is the ADMIN_TOKEN class and the ROOT-admin
       session; an admin-ROLE member signs in as class `member` and does not receive it. */
    if (op === "stats") inner.searchParams.set("capacity", cls === "admin" ? "1" : "0");
    if (op === "memberlist")
      inner.searchParams.set("administer",
        (viaSession ? !!sessRights.administer : cls === "admin") ? "1" : "0");
    /* N85's other half (membership R19): an administrator sees every pairing, published or not — memberlist's stamp,
       by memberlist's expression. */
    if (op === "memberpairings")
      inner.searchParams.set("administer",
        (viaSession ? !!sessRights.administer : cls === "admin") ? "1" : "0");
    /* BOB #32 (2026-09-24), D-162's theme readings: THE SAME STAMP, on the same rule and for the same
       reason. Every theme act and read names a declarer, a placer or a proposer; a reader who does not
       administer is shown the HANDLE alone, and the member id and cover go to administrators only
       (Membership v2 §3; MK-6's precedent). The store fails closed on an absent stamp. */
    if (op === "themedeclare" || op === "themeplace" || op === "themepropose" || op === "themeread"
        || op === "themewithdraw")
      inner.searchParams.set("administer",
        (viaSession ? !!sessRights.administer : cls === "admin") ? "1" : "0");
    /* REC-21. WHOSE attention this is, stamped by the server and never taken
       from the request — the strictest instance of the impostor rule in this
       file, because the thing being written is not a claim about the record but
       a claim about a PERSON: a caller who could name the member could decide
       what somebody else is told about, and could do it leaving nothing in the
       record for that person to find. The caller's own `member` was copied in the
       loop above, so it is overwritten here rather than honoured. A machine
       credential stamps EMPTY rather than `class:<cls>` — unlike a lease actor,
       there is no named machine identity that makes sense here, because a
       preference belongs to somebody's attention and a token has none — and the
       store refuses NO_MEMBER, so a bypass fails closed instead of writing a row
       nobody owns. The viewer stamp above covers the case-visibility gate, so
       muting cannot be used to probe for a project you were never invited to. */
    if (QUEUE_ACTIONS.includes(op))
      inner.searchParams.set("member", viaSession ? sessMember : "");
    /* CPDF-10 / SK-7 — WHO ATTESTED, STAMPED BY THE SERVER, AND THIS IS A
       CORRECTION OF A FENCE THAT DID NOT HOLD.
       *
       * THE MEASUREMENT, taken through a REAL minted `ai` credential rather
       * than reasoned about: `op=attesttext` read its `member` from the request
       * BODY. C-35.10 refuses a MACHINE IDENTITY, so it fired only when the
       * caller volunteered one — and a caller who wants to attest does not
       * volunteer one. An `ai` credential whose member had named `attesttext`
       * in its declared `writes` posted `member: "ruth"` and THE ATTESTATION
       * LANDED, attributed to ruth, who had said nothing. `member: "member:ruth"`
       * landed too, at an attestor string no member has. The MEMBER_TOKEN
       * machine credential did the same. Only `class:ai` was refused, which is
       * the one spelling every suite drove.
       *
       * The old `content-extent.test.mjs` recorded the belief that an op-level arm
       * was impossible here — *"driving it through op=attesttext with a machine
       * token answers NOT_AUTHENTICATED before checkAttestation is ever
       * reached"*. That was measured with a token that was not a credential at
       * all. With a real one the op IS reached, and the fence was not there.
       * R29's test (`test/m/control-plane/stamps.test.mjs`) now drives this
       * stamp for every kind of caller.
       *
       * SO IT IS STAMPED, exactly as the queue's `member` above is, and for the
       * identical reason written there: the thing being written is not a claim
       * about the record but a claim about a PERSON. The caller's own `member`
       * was copied in the loop above and is overwritten here rather than
       * honoured. A machine credential of ANY class stamps `class:<cls>`, which
       * `isMachineIdentity` answers TRUE for, so C-35.10 refuses BY NAME at the
       * store instead of being handed a name it cannot question — the second of
       * CPDF-10's *two fences on purpose*, now actually load-bearing rather than
       * reachable only by a caller who incriminates itself.
       *
       * THE `ai` CLASS STAMPS ITS CLASS AND NEVER ITS PRINCIPAL. A member-scoped
       * credential's principal is `member:<id>`, which is NOT a machine identity
       * by this record's own predicate — stamping it would walk the hole
       * straight back in wearing a server-side stamp. The principal answers what
       * a credential may SEE (D-199 (4)); it is not who acted. */
    if (op === "attesttext")
      inner.searchParams.set("attestor", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* REC-87 / IC-128 — WHO TYPED, AND WHO ATTESTED THE TYPING, stamped by the
       server on `attesttext`'s rule one stamp up and for its measured reason: a
       body field is a name a machine can post. Typing a page's text is a
       member's own act in their own name, and so is attesting another member's
       typing. The caller's own `transcriber`/`attestor` was copied in the loop
       above and is overwritten here rather than honoured. A machine credential
       of ANY class stamps `class:<cls>`, which `isMachineIdentity` answers TRUE
       for, so the store refuses it BY NAME — C-52.1 at `transcribe`, C-35.10
       (`checkAttestation`, unchanged) at `transcriptionAttest`. NEVER the
       principal: `member:<id>` is not a machine identity by this record's own
       predicate, and stamping it would let an `ai` credential type in a
       member's name. */
    if (op === "transcribe")
      inner.searchParams.set("transcriber", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* The ATTESTOR of a typing, stamped on `attesttext`'s rule exactly and in its
       shape. Its machine fence is C-35.10 inside `checkAttestation` — the SAME
       function `attesttext` reaches, imported from textchain.mjs; the fence is
       content's and text-chain's to prove, and this door's stamp R29's. */
    if (op === "transcriptionattest")
      inner.searchParams.set("attestor", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* MK-1 / D-184 / IC-133 — WHO OBSERVED IT, stamped by the server on the rule
       of every authorship field in this block, and OVERWRITING any `author` the
       caller put in the query string (the loop above copied it). The design's
       words: the author is server-stamped from the session, as every authorship
       in this plane is. A machine credential of any class stamps `class:<cls>`,
       which the store refuses BY NAME (C-53.1). NEVER the principal of an `ai`
       credential: `member:<id>` is not a machine identity by this record's own
       predicate, and stamping it would let an assistant testify in a member's
       name. */
    if (op === "testify")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* MK-4 / IC-136 — WHO WROTE THE LEAD, AND WHO FOLLOWED IT, stamped on
       `transcribe`'s rule one stamp up and for its measured reason (§7: an author
       field supplied by the caller rather than stamped is refused). A machine
       credential of any class stamps `class:<cls>`, and the store refuses it BY
       NAME (C-54.2 at the act, C-54.8 at the look). Never the principal. */
    if (op === "lead")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    if (op === "leadlook")
      inner.searchParams.set("looker", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    if (op === "leadshare")
      inner.searchParams.set("sharer", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* MK-7 — WHO CHOSE THE ATTRIBUTION, stamped on `testify`'s rule: the store compares it with the
       observation's registered author, so a caller-supplied chooser would be a way to choose for somebody
       else. A machine credential stamps `class:<cls>`, refused BY NAME (C-92.1). Never the principal. */
    if (op === "attribute")
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* D-162 / IC-241 — WHO DECLARED THE THEME, WHO PLACED IN IT, WHO PROPOSED, stamped on
       `lead`'s rule one stamp up (§8.4 fence 1: declared under the member's own name, never a
       caller's field). A machine credential stamps `class:<cls>`, which the store refuses BY NAME
       for a declaration (C-81.2) and a placement (C-81.7) and RECORDS for a proposal — the hunch
       is attributed to the credential that proposed it. */
    if (op === "themedeclare")
      inner.searchParams.set("declarer", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    if (op === "themeplace")
      inner.searchParams.set("placer", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* T5-11 (connections R43): WHO WITHDREW OR REJECTED, stamped on `themeplace`'s rule; the store compares it with
       the placer (or the administer stamp) and refuses a machine stamp BY NAME (C-81.11). */
    if (op === "themewithdraw")
      inner.searchParams.set("actor", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* D-162: WHO PROPOSED A PLACEMENT. Any credential may propose (the result is a hunch, graded C,
       never membership), so the only obligation here is NAMING: a session stamps its signed-in id, a
       machine stamps `class:<cls>`, and the `ai` class stamps its tokenId beside its class —
       `extractpropose`'s form — so a hunch stays attributable to the exact key that proposed it.
       Never the principal a key was minted for, which would put an assistant's hunch under a
       person's id. */
    if (op === "themepropose")
      inner.searchParams.set("proposer",
        viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* REC-195 / D-149: WHO PROPOSED AN ACTION'S GOVERNING LAWS, stamped on the line above for its reason
       exactly. Any credential may propose — the plane LABELS a proposal rather than fencing it — so the only
       obligation here is NAMING: a session stamps its signed-in id, a machine stamps `class:<cls>`, and the
       `ai` class stamps its tokenId beside its class, so a proposal stays attributable to the exact key that
       proposed it. Never the principal a key was minted for, which would put a machine's citations under
       somebody else's id. A caller-supplied `proposer` is overwritten rather than honoured: the label is the
       whole product and a label a caller can write is not one.
       THE PROSE HERE DELIBERATELY CLAIMS NO PERSON-ONLY CONSTRAINT, and that is not style: nothing refuses a
       machine identity here BY DESIGN — D-149 says the machine MAY propose — so a comment claiming otherwise
       would be a fence that reads as present and is not. The fence is one op up, at the act that SETS the
       list. */
    if (op === "actionlawspropose")
      inner.searchParams.set("proposer",
        viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* T8 (actions R28, ACTIONS #1 J2.5): WHO PROPOSED A RISK TIER, by the line above's expression and for its reason —
       the label is the whole product, and a caller-supplied `proposer` is overwritten. */
    if (op === "actionriskpropose")
      inner.searchParams.set("proposer",
        viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* T18 (action-plans R11, R31; K711, K727): WHO PROPOSED A PLAN OPTION. Any credential may propose, so the stamp is
       the label, by `actionlawspropose`'s expression (a session its member, a machine `class:<cls>`, an `ai` credential
       `class:ai/<tokenId>`); beside it the caller as a planning run's principal, by the run productions' expression
       (`RUN_PRODUCTION_ACTIONS` below), which action-plans compares with the run's own. A caller's copy of either is
       overwritten. */
    if (PLAN_PROPOSAL_ACTIONS.includes(op)) {
      inner.searchParams.set("proposer",
        viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
      inner.searchParams.set("principal",
        viaSession ? sessIdentity
        : cls === "ai" ? `${aiCred.principal}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    }
    /* K921 (filing-templates R6; op-declarations R8): WHO PROPOSED A TEMPLATE'S WORDING. Any credential may propose, so
       the stamp is the label, by `actionlawspropose`'s expression (a session its member, a machine `class:<cls>`, an
       `ai` credential `class:ai/<tokenId>`). It is set as `proposer`, the stamp op-declarations names, and as `author`,
       the key filing-templates' ops map reads its proposer from; a caller's copy of either is overwritten. */
    if (TEMPLATE_PROPOSAL_ACTIONS.includes(op)) {
      const proposer = viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`;
      inner.searchParams.set("proposer", proposer);
      inner.searchParams.set("author", proposer);
    }
    /* T8 (layer 9): WHO DETERMINED, COMPARED, RECORDED A CONSEQUENCE OR ITS ADDRESSING, PREPARED, APPROVED OR SENT A
       FILING, NAMED COUNSEL, EXPORTED A PACKET, PROPOSED A THEORY, OR MOVED AN ESCALATION — conformance, consequences,
       filings and escalation read `author` from the QUERY after the body, so it is set here, after the caller's
       parameters were copied, and a caller's is overwritten. It is the POSITIONAL identity (`member:<id>`, the
       founder's `member:admin`), intent's expression, because each module asks membership's `projectAuthority` of it and
       a bare id would read as nobody there; a machine credential stamps `class:<cls>` and an `ai` credential
       `class:ai/<tokenId>`, each a machine identity every act refuses BY NAME and every proposal labels as machine work —
       NEVER a key's principal, which would put an assistant's act under a person's name. */
    if (QUERY_AUTHOR_ACTIONS.includes(op))
      inner.searchParams.set("author",
        viaSession ? sessIdentity
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* N345 (contradiction R30–R36, R51, R53): WHO DISMISSED, CLARIFIED, TOOK UP, RESOLVED, OPTED IN OR RESPONDED —
       contradiction reads `author` from the query after the body, so it is set here and a caller's is overwritten. The
       action layer's expression one statement up, for its reason: contradiction hands the author to promotion as
       `actorIdentity` on a take-up and asks membership's facts of it, so it is the POSITIONAL identity; a machine
       credential stamps `class:<cls>` and an `ai` credential `class:ai/<tokenId>`, each a machine identity every act
       refuses BY NAME (C-93.10) — never a key's principal, which would put an assistant's act under a person's name. */
    if (CONTRADICTION_ACTIONS.includes(op))
      inner.searchParams.set("author",
        viaSession ? sessIdentity
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* SK-7 / framework Part II §14.4 (Bob's 5.7) — WHO MARKED THIS PASSAGE AS
       CITABLE, stamped by the server on the same rule as every authorship field
       in this block. The body's own `mintedBy` is not read at the store at all
       (the DO route takes it from the query string), so there is no second door.
       A MACHINE CREDENTIAL STAMPS `class:<cls>` AND THAT IS THE LABEL'S WHOLE
       SOURCE OF TRUTH: `contentMintState` reads the stamp through
       `isMachineIdentity`, so the sentence a member is shown about a
       machine-minted row is derived from the credential that authenticated and
       from nothing a caller could write. The `ai` class stamps its CLASS and its
       tokenId — `class:ai/<tokenId>` — for `op=airunopen`'s reason (an act
       stays attributable to the named credential a member chose) while keeping
       the `class:` prefix that makes it a machine identity. NEVER the principal:
       `member:<id>` is not a machine identity, and stamping it would label the
       assistant's own row as a member's.

       IDENTITY-CLAIM: RULED DEC-24 — a machine credential MAY perform this act
       and the ruling is framework Part II §14.4's EXTRACT role under DEC-24
       (*the machine may do the looking, the member does the concluding*), folded
       there as Bob's 5.7. So the member-actor words above describe WHO IS SHOWN
       the label, never who may write the field, and there is deliberately no
       fence on this op: what the machine may not do is ATTEST, which is
       C-35.10's and sits at `op=attesttext` one stamp above. The naming half the
       ruling rests on is the `class:<cls>` stamp this line writes — permission
       is granted against a NAMED actor, and a row whose minter were anonymous
       would be a row the label could say nothing about. */
    if (op === "contentmint")
      inner.searchParams.set("mintedBy",
        viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* SK-8 — WHO PROPOSED THIS READING, stamped on the identical rule and in the
       identical shape, because it is the identical question about the identical
       kind of act: a claim about a PERSON (or about a machine) rather than about
       the record. The two lines are kept apart rather than folded into one
       condition so each op's own reasoning stays readable at its own site; what
       must never drift is the VALUE, and it cannot, because both read the same
       three cases off the same `viaSession` / `cls` / `aiCred` state. A machine
       class stamps `class:<cls>`; the `ai` class stamps its tokenId beside it so
       the act stays attributable to the named credential a member chose; and
       NEITHER ever stamps the PRINCIPAL — `member:<id>` is not a machine
       identity by this record's own predicate, and stamping it would label the
       assistant's own proposal as a member's.

       IDENTITY-CLAIM: RULED DEC-24 — a machine credential MAY perform this act,
       and the ruling is the EXTRACT role under DEC-24 (*the machine may do the
       looking, the member does the concluding*), placed at
       `BIO_Assistant_and_AI_Roles_v0_1.md` §7.3 and folded into framework Part II
       §14.4 as Bob's 5.7. So the member-actor words in this block describe WHO IS
       SHOWN the label, never who may write the field, and there is deliberately
       no fence on this op. What the machine may not do is ATTEST — C-35.10's, at
       `op=attesttext` a few stamps above — and PRODUCE WITHOUT A BOUND, refused
       at the store by name when the run declares no `mints` allowance (§7.3 (5)).
       The naming half the ruling rests on is the `class:<cls>` stamp this line
       writes: permission is granted against a NAMED actor, and a proposal whose
       proposer were anonymous would be one the record could say nothing about,
       which is exactly what `NO_PROPOSER` refuses at the store. */
    /* REC-147: the contradiction candidate's proposer is the same server-side stamp, for the same reason; N345's
       recommendation (contradiction R37) is the run's other production and takes it too. */
    if (op === "extractpropose" || op === "contradictionpropose" || op === "contradictionrecommend")
      inner.searchParams.set("proposedBy",
        viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* Ownership of a selection is the same server-side stamp. A selection is
       readable only by the credential that made it, and "only by the credential"
       is worth nothing if the caller names the credential. */
    if (op === "select" || op === "selection" || op === "selectionlist" ||
        op === "selectionrelease" || EDGE_ACTIONS.includes(op) || STATE_ACTIONS.includes(op))
      inner.searchParams.set("owner", viaSession ? sessIdentity : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* Who cited is part of the record, and citing writes a Session Log entry
       carrying the name. Stamped like every other authorship in this file: a
       browser cannot write history as someone else, and a machine credential
       says plainly that it was a machine rather than borrowing a person's name.
       A caller-supplied `author` is overwritten, not honoured. */
    /* REC-24 adds the two action acts to the author stamp, and the correspondence
       arm is the strictest instance of the impostor rule in this file: on the
       testimony half, the author IS the evidence — "who says this exchange
       happened" is the whole of what the record holds when there are no bytes —
       so a caller naming it would be a caller signing somebody else's name to a
       claim about a real party outside this system. */
    /* REC-45 joins them, and the reasoning is on STRUCTURE_ACTIONS above: the
       name this stamps is the name that goes against "these reasons were enough
       on their own", which is the one authored judgement in the record that
       makes a finding stronger. */
    /* REC-54 joins them. Reconstructing a provenance chain is a named member's
       judgement that the capture record supports the route being written — the
       act D-200 exists to keep honest — so the name against it is stamped by the
       server like every other authorship here, and a caller-supplied `author` is
       overwritten rather than honoured. It is NOT added to STATE_ACTIONS: it
       moves no state and applies to no selection, so it would inherit an `owner`
       stamp and a set-application shape it does not have.
       IDENTITY-CLAIM: OPEN — DEC-52 rules on three verbs and reconstructing a provenance
       chain is not one of them. Left for Bob, pinned by name, not decided.
       OPEN AND NAMED, REC-65: the sentence above says "a named member's judgement"
       and **NOTHING IN THE PLANE REFUSES A MACHINE FROM MAKING IT** —
       `provenanceChainRebuild` carries no identity fence of any kind. DEC-52 ruled on
       three verbs and this is not one of them, so REC-65 neither fenced it nor extended
       the ruling to cover it; a worker doing either would be deciding doctrine nobody
       asked for. It is LEFT for Bob as a known-open finding (REC-65's report).
       What is NOT open: the stamp itself. A machine arrives named
       `token:<class>`, so whatever is ruled later can be enforced on an honest
       identity rather than a guessed one. */
    /* PL-2 / IS-2 joins them, and this is FENCE LAYER 1 (see VERSION_ACTIONS
       above). The name this stamps is the name that goes against "this is the
       reading this record stands on" and against the reason a member gave for
       turning one down — the two facts D-214 says the whole rejection record
       exists to hold. A caller-supplied `author` is OVERWRITTEN rather than
       honoured, which is what makes the store's MACHINE_CANNOT_MOVE_VERSION
       refusal possible at all: a machine arrives honestly named `token:<class>`
       instead of borrowing a person's. It is NOT added to STATE_ACTIONS: these
       move no bundle state and apply to no selection, so they would inherit an
       `owner` stamp and a set-application shape they do not have. */
    if (EDGE_ACTIONS.includes(op) || STATE_ACTIONS.includes(op) || ACTION_ACTIONS.includes(op)
        || DECLARATION_ACTIONS.includes(op) || STRUCTURE_ACTIONS.includes(op)
        /* REC-122: the name that goes against "this mention is the one on point for this
           connection". Overwritten rather than honoured, so the store refuses a machine BY
           SHAPE (C-74.1). Placed ABOVE `VERSION_ACTIONS` and not beside `narrow` below: the
           versionstate suite pins FENCE LAYER 1 by the span from `VERSION_ACTIONS` to this
           stamp, and a new op is not a reason to lengthen that span. */
        || op === "connectionchoose"
        || VERSION_ACTIONS.includes(op)
        /* PL-3 / IS-4: and the suggest endpoint, for the reason one paragraph
           up. `author` here is the name that goes against a STRUCTURAL claim —
           "this part of the argument would carry the answer on its own" — which
           C-25.15 says only a named member may make. A caller-supplied `author`
           is OVERWRITTEN rather than honoured, which is what lets the store
           refuse a machine BY SHAPE through REC-46's one predicate instead of
           trusting what the caller wrote. */
        || op === "suggest"
        || op === "provenancechain"
        /* REC-63: `author` here is the name that goes against a STANDING
           STATEMENT that a document's route cannot be shown, which C-34.1 says
           only a named member may make. Overwritten rather than honoured, for
           the reason one paragraph up: a principal a caller can name is not one. */
        || op === "provenanceroute"
        /* REC-86: the name that goes against "this passage is the one on point"
           and against the new reading's partition. Overwritten rather than
           honoured, so the store refuses a machine BY SHAPE (C-50.5). */
        || op === "narrow")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* T5-11 (K145, connections R53, R57): the member who asserts a connection, and the member who confirms or rejects
       a stored containment, stamped on `connectionchoose`'s rule by its expression and in a statement of its own so
       the span pinned above is not lengthened. A caller's `author` is overwritten; a machine arrives honestly named
       and the store refuses it BY SHAPE (CONNECTION_ASSERT_NOT_A_MEMBER, FILE_MEMBERSHIP_NOT_A_MEMBER). */
    if (op === "connectionassert" || op === "filemembershipjudge")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* N345 (case-authoring R32): the ceremony's read asks the owner test op=publish asks, of the same `author`, so it
       takes publish's stamp by publish's expression (`STATE_ACTIONS`' author above), in a statement of its own so the
       span pinned above is not lengthened; a caller's `author` is overwritten. */
    /* N364 (case-authoring R34): the pre-flight asks what op=publish asks, of the same `author`, so it takes publish's
       stamp by publish's expression, in the same statement of its own. */
    /* N407 (K649 (4); ratification R18, admission's `callerViewer`): the ceremony's pre-flight holds a minted agent
       credential to the machine fences whatever its viewer stamp, and a member-scoped agent's stamp is its member's, so
       the door names the credential beside the viewer, `aiCred` (its token id and principal, never its value), for an
       agent caller alone; every other caller's is deleted with the stamps above. */
    if (op === "publishpreflight" && cls === "ai")
      inner.searchParams.set("aiCred", JSON.stringify({ tokenId: aiCred.tokenId, principal: aiCred.principal }));
    if (op === "publishtensions" || op === "publishpreflight")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* T6-13 (reevaluation R15, R16): the member who adopts a newer version, keeps the earlier one, or records a
       re-evaluation, stamped by the version acts' expression (`VERSION_ACTIONS`' author above), which reevaluation reads
       from the query after the body; a caller's `author` is overwritten, and a machine arrives honestly named, refused
       BY NAME at the store (MACHINE_CANNOT_ADOPT_VERSION, MACHINE_CANNOT_KEEP_VERSION, MACHINE_CANNOT_RECORD_REEVALUATION). */
    if (REEVALUATION_ACTIONS.includes(op))
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* REC-134 / C-56 — SIGHT IS NOT AUTHORITY (Membership v2 §7, BOB #15): the acts that change
       a project and took the VISIBILITY gate as their only barrier (or none) now ask the actor's
       OWN POSITION in that project, and the store reads that position from THIS stamp — the
       POSITIONAL identity, never the viewer. A session stamps `resolveSession`'s identity
       (`member:<id>`, the founder's `member:admin`); a member-scoped `ai` credential stamps its
       PRINCIPAL, so an agent is refused exactly where its member would be (D-199 (4)'s rule for
       sight, applied to acts); every instance credential stamps `class:<cls>`, which holds no
       roster position and is not asked — machine fences are their own and unchanged. The caller's
       `identity` was DELETED for every op above, so nothing here can be named by a caller.
       A new act on a project joins POSITIONAL_ACTS (op-declarations); R29's test drives every op that declares the stamp. */
    if (POSITIONAL_ACTS.includes(op))
      inner.searchParams.set("identity",
        viaSession ? sessIdentity
        : cls === "ai" ? aiCred.principal
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* D-587 (T5-11, calibration R5, K136): WHO MEASURED is the control plane's stamp and never the body's — a session
       its member, a machine credential `class:<cls>`, an `ai` credential its principal — by the identity stamp's own
       expression. The store records it as `measured_by` and refuses an empty one CAL_UNATTRIBUTED (C-42.8). */
    if (op === "calibrate")
      inner.searchParams.set("identity",
        viaSession ? sessIdentity
        : cls === "ai" ? aiCred.principal
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* R28: admission R12 (`bearerFence`), the bearer fences on the §4 governance acts (C-32.17) and the group-identity
       acts (C-64.4), before any handler: how the caller ARRIVED, never which token it held. */
    const fenced = bearerFence(op, caller);
    if (fenced) return refused(fenced);
    /* R16, R28: a promotion's replay is judged here, after the R14 fences and before any handler, from a copy of the
       body (the request's own body stays whole for whoever serves the op). The verdict is the promote block's below. */
    const replay = op === "promote" && req.method === "POST"
      ? await replayVerdict(env, storeName, await req.clone().text(), viaSession, cls) : null;
    /* DEC-49 REGION is-promote-replay-verified */
    if (replay?.asserted && !replay.proven)
      return json({ ok: false, reason: "REPLAY_UNVERIFIED", ...replayRow("REPLAY_UNVERIFIED"), op,
        bundleId: replay.bundleId, provenanceCapture: replay.provenanceCapture,
        detail: `this promotion says it is a replay of the record's own past, and a replay is honoured only when the `
              + `plane can check it: it must name a drive-provenance capture (\`provenanceCapture\`) that this `
              + `promotion registers at ${DRIVE_PROVENANCE_PATH}, whose bytes the record holds, and whose preserved `
              + `promotion records name this record and list this revision's bundle.md SHA-256. One of those did not `
              + `hold. Nothing was written.` }, 403);
    /* END DEC-49 REGION is-promote-replay-verified */
    /* R39 (N408, K621): purge is the only destructive op. It refuses unless the caller names the namespace the request
       resolved to, before the store is called, so a purge never lands somewhere its caller did not name; a probe,
       confined to `scratch`, can confirm only `scratch`. C-61.1 through the one governed helper; `error` byte-identical
       (D-270's pattern), and the helper's `detail` says nothing was changed. */
    if (op === "purge") {
      const confirm = url.searchParams.get("confirm");
      if (confirm !== storeName)
        return json({ ok: false,
                      ...requiredArgument("purge", "confirm", "<store name>",
                                          "purge requires confirm=<store>"),
                      expected: storeName,
                      got: confirm, tokenClass: cls, store: storeName }, 400);
    }
    /* R28: an op whose handler is a module's, reached through plane's hooks, answers here, after the R14 fences and R16;
       undefined falls through to the forward. */
    /* R41 (T35, T36; N695, K1717, K1864, K2135): `op=agentpack` alone serves the fences and the rendered pack: the
       affordances handler is asked untargeted (with no request body: the read takes none) and `packOf` read off its
       answer; a refusal or a silence is answered as that handler gives it. */
    if (op === "agentpack") {
      const u = new URL(url);
      u.searchParams.set("op", "affordances");
      u.searchParams.delete("target");
      const res = hooks.gatedOp ? await hooks.gatedOp({ req: new Request(u, { method: "GET", headers: req.headers }), url: u, env,
        op: "affordances", cls, viaSession, sessMember, sessViewer, sessIdentity, sessRights, sessCaps, aiCred, storeName, stub,
        grantMember: aiCred?.grant ? aiCred.principal : undefined }) : undefined;
      if (!res) return storeSilent("agentpack");
      const served = await packOf(res);
      if (!served) return res;
      return json({ ok: true, ...served, store: storeName, tokenClass: cls }, 200);
    }
    /* R58 (K2042 (2)): the promotions after an unpack, Worker-side, one act each, with `op=promote`'s stamps for this
       caller; the archive's project is the request body's `project`, read from a copy before the handler reads the body. */
    const archiveWho = { author: viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`,
      ...(viaSession ? { actorMemberId: sessMember } : {}),
      actorIdentity: viaSession ? sessIdentity : cls === "ai" ? aiCred.principal : `${MACHINE_CLASS_PREFIX}${cls}`,
      actorViewer: viaSession ? sessViewer : cls === "ai" ? aiCred.principal : `${MACHINE_CLASS_PREFIX}${cls}`,
      ...(viaSession ? {} : { assistantPrincipal: cls === "ai" ? `${aiCred.principal}/${aiCred.tokenId}` : `${MACHINE_CLASS_PREFIX}${cls}` }) };
    let archiveProject = null;
    if ((op === "acquire" || op === "unpack") && req.method === "POST")
      try { const b = JSON.parse((await req.clone().text()) || "null"); archiveProject = b && typeof b.project === "string" ? b.project : null; }
      catch { archiveProject = null; }
    async function promoteAcquired(res) {
      let b = null;
      try { b = await res.clone().json(); } catch { return res; }
      const docs = archiveDocuments("acquire", b);
      if (!docs.length) return res;
      const done = await promoteArchive({ stub, doAnswer, docs, project: archiveProject, archiveSha: b.document?.capture?.sha256 ?? null,
                                          who: archiveWho });
      return json({ ...b, ...done }, res.status);
    }
    /* R62 (rev. 2 conflict (c); K1888 (3), K1892; DEC-173; BOB's review (8), K2130): A MEMBER'S OPENING OF AN ORIGINAL GOES
       THROUGH `file-safety`. A member's session's or an `ai` credential's GET of a capture's bytes is answered as
       `file-safety.openOriginal({captureSha, viewer})` answers it (its R8), at the store's `openoriginal` route — with
       `warned` in the query, `openwithwarning` with `warned` in its body — never by capture's own read, so no route opens
       a file file-safety would keep to its safe view. Only the digest and the viewer travel; nothing here keeps, logs or
       counts who asked for which file (file-safety R10). The binding classes keep capture's own answer (plane's hook). */
    if (op === "capture" && req.method === "GET" && (viaSession || cls === "ai")) {
      const warned = warnedOf(url);
      const at = new URL(`http://x/${warned === undefined ? "openoriginal" : "openwithwarning"}`);
      at.searchParams.set("capture", (url.searchParams.get("sha256") || "").toLowerCase());
      at.searchParams.set("viewer", viaSession ? sessViewer : aiCred.principal);
      return byteAnswer(await stub.fetch(new Request(at, warned === undefined ? { method: "GET" }
        : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ warned }) })), op,
        { store: storeName, tokenClass: cls });
    }
    /* R65 (T37; N708, DEC-156; agent-worker R66): a member's own Claude sign-in goes to their own runner, `member` the
       door's `by` stamp and `step` and `code` the body's (`signin.mjs`); only a member's session reaches the op (its
       spec). Nothing of it reaches the record but the fact `credentials` R43 keeps. */
    if (op === "subscriptionsignin") {
      const stored = (path, init) => doAnswer(stub.fetch(new Request(`http://do/${path}`, init)));
      const signed = await subscriptionSignin({ env, member: stampOf.by, asked: reqBody, store: stored });
      if (signed.unread) return signed.unread.refused ? storeRefusal(signed.unread) : storeSilent(op, signed.unread.correlation);
      return json(signed.body, signed.status);
    }
    const armed = hooks.gatedOp ? await hooks.gatedOp({ req, url, env, op, cls, viaSession, sessMember, sessViewer,
      sessIdentity, sessRights, sessCaps, aiCred, storeName, stub,
      grantMember: aiCred?.grant ? aiCred.principal : undefined }) : undefined;   /* R53 (K1684): an ask's grant's member */
    if (armed && op === "acquire") return promoteAcquired(armed);
    if (armed) return armed;
    /* R57 (K1983): the rendered pack the door holds for this caller, `op=agentpack`'s (R41), sent with a draft that reads
       nothing of the record; null when none renders. */
    async function heldPack(ctx) {
      if (!hooks.gatedOp) return null;
      const u = new URL(url);
      u.searchParams.set("op", "affordances");
      u.searchParams.delete("target");
      try {
        const res = await hooks.gatedOp({ ...ctx, req: new Request(u, { method: "GET" }), url: u, op: "affordances" });
        if (!res) return null;
        return (await packOf(res))?.pack ?? null;
      } catch { return null; }
    }
    /* Who is acting on a project's roster is decided by the SERVER. Set after
       the caller's parameters were copied, so a caller-supplied `by` is
       overwritten rather than honoured: "only an owner may remove" is worth
       nothing if the caller names who they are. A machine credential says
       plainly that it was a machine, which matches no participation row and no
       administrator, so it is refused by the store rather than let through. */
    /* D-136 adds `GOVERNANCE_ACTIONS`, and it is THE SAME SENTENCE one section
       out: the comment above says *"only an owner may remove" is worth nothing
       if the caller names who they are*, and §4.7 read against it says **"every
       subsequent addition requires the consensus of all existing
       administrators" is worth nothing if the caller names who consented.**
       The store already ASKED for `by` on `adminEndorse` and `adminRemove` and
       checked it against the live administrator roster — the check was whole and
       the INPUT was the caller's, which is the shape a fence acquires when
       nobody supplies its subject. `memberCaps` gains the same argument and the
       same check in this landing, so the stamp is READ on all three rather than
       being recorded and trusted. */
    /* REC-156 adds `memberadd` — D-136's sentence in the one op that ruling did
       not name. membership's `memberAdd` WRITES the proposer's `admin_votes` ('add') row
       when an addition needs §4.7's consensus, and the voter it wrote was whoever
       the caller put in `by`, so a proposal could carry one endorsement in another
       administrator's name. Now the SERVER names the proposer, and the store's
       relay reads it from the query, never the body: a proposal records its
       proposer's own endorsement and nobody else's.
       ITS OWN DISJUNCT, NOT `GOVERNANCE_ACTIONS`: that array also spreads
       MEMBER-set reach and the operator fence, and REC-156 moves neither.
       A SESSION stamps its member — the FOUNDER'S (`admin`), because
       `SESSION_OPS.admin` is the only set holding this op, and the store counts
       the founder an administrator only where a claim was spent. A BEARER stamps
       `class:<cls>`, which is on no roster: it opens a proposal and endorses nothing.
       **PROVISIONAL, AND BOB'S TO RULE: a bearer reaching `memberadd` is NOT
       refused** the way C-32.17 refuses one at the three ops above. MEASURED
       before choosing (M-84): 99 suites of the old battery, five probes and a live
       verification run created their members through a bearer `memberadd`;
       `setup.mjs`, the one non-test caller, posts with the founder's SESSION.
       With this stamp a bearer's `by` names nobody, and what the op still does for
       one — an invitation, §4.2's second administrator, a proposal awaiting every
       administrator — attributes no act to any administrator and is the
       ADMIN_TOKEN holder's by §4.6. C-32.17's sentence (*"a vote it delivered
       would be attributed to whoever the caller named"*) would be FALSE here,
       which is D-270's class. REVERSING IT costs one disjunct on the fence above
       and a founder-session fixture for every caller named in M-84. */
    /* REC-159 widens REC-156's disjunct from `op === "memberadd"` to the four §4.9 custodial acts,
       one expression still: a session stamps its member — now an ENROLLED administrator's too — and
       a bearer `class:<cls>`, which the store records as the operator's credential and never as a
       person. `memberset`, `signeradd` and `signerset` write the stamp into the row they change
       (`status_by`); the store refuses a member-named `by` that is not an active administrator. */
    if (PROJECT_ACTIONS.includes(op) || GOVERNANCE_ACTIONS.includes(op)
        || op === "projectparticipants" || op === "projectownerarith"
        || CUSTODIAL_ACTIONS.includes(op))
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* REC-150: whose requests to join a caller reads — its own, or a project's as its owner or an administrator — is
       a POSITIONAL question, so `op=projectrequests` takes the server's `by` exactly as projectparticipants does, by
       the SAME expression. A statement of its own rather than a disjunct above, `IDENTITY_ACTIONS`' precedent below:
       that condition is pinned as one expression by adminvote.test and anchored by adminvote.control, and it sits at
       its pin's bound. */
    if (op === "projectrequests")
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* N43: membership's R10, R11 and R19 acts take the server's `by` by the same expression, in a statement of their
       own for the reason just given; the store's relays read it from the query after the body, so a caller's `by`
       names nobody. */
    /* K407: who set the instance's profiles, the session's member; instance-setup refuses a `by` that is no administrator. */
    if (op === "profilesset")
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* R54 (op-declarations R22; membership R84): an administrator's T34 acts on the group's doors and settings, whose
       `by` membership asks `isAdministrator` of as a member id: the custodial acts' expression, after any declared stamp,
       so a caller's `by` names nobody and a machine credential is refused there NOT_AN_ADMIN. */
    if (MEMBERSHIP_ADMIN_ACTS.includes(op))
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);

    if (ROSTER_SELF_ACTIONS.includes(op))
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* N364: the own-key acts (membership R89, R90), capture's pull, re-attestation and account (R65, R68, R69) and
       sources' four acts (R2, R6, R7) each take the server's `by` by the roster acts' expression, in a statement of their
       own for the reason just given; each module reads it from the query after the body, so a caller's `by` names
       nobody. A bearer, where an op's row admits one, stamps `class:<cls>`, and what that name may do is the module's. */
    if (OWN_KEY_ACTIONS.includes(op) || CAPTURE_MEMBER_ACTIONS.includes(op) || SOURCE_ACTIONS.includes(op))
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* R36: the pull's promotion carries the session's POSITIONAL identity as op=promote's `actorIdentity` (POSITIONAL_ACTS'
       expression); only a session reaches the op (its row's `machineClasses: []`). */
    if (op === "inboxpull") {
      inner.searchParams.set("identity", viaSession ? sessIdentity : `${MACHINE_CLASS_PREFIX}${cls}`);
      /* R36 (capture R32; DEC-88 (2)): whether this pull is the `pulled` resolve, and so takes its reason, is the door's
         word: a caller's `resolve` is deleted, and it is set only for the re-routed resolve. */
      inner.searchParams.delete("resolve");
      if (resolving) inner.searchParams.set("resolve", "pulled");
    }
    /* REC-164: the setter of the group's display name or domain is the SERVER's stamp — set after the caller's
       parameters were copied, so a caller's `by` is overwritten rather than honoured, and the store asks the roster
       for an active administrator (C-64.5). `origin` is stamped the same way: the address the administrator's
       session reached is the instance address the domain's well-known file must name, never one the caller types. */
    if (IDENTITY_ACTIONS.includes(op)) {
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
      inner.searchParams.set("origin", url.origin);
    }
    /* IS-6 / §14a, DEC-27(b), DEC-55.4: THE PLANE-CREDENTIAL PRINCIPAL on a run,
       decided by the SERVER from the credential that authenticated and set after
       the caller's parameters were copied, so a caller-supplied `principal` is
       overwritten rather than honoured. A principal a caller can name is not a
       principal.

       This is only HALF of what the run must name. The other half — WHICH LEVEL
       of the Claude-account cascade pays (member, then project, then instance)
       — is NOT stamped here and cannot be: it is resolved where the token
       actually resolves, in the fleet member, and the plane learns it by being
       told. So the store REFUSES to open a run that does not carry it, which is
       the fail-closed direction: a run with no payer named is a run nobody can
       be billed for and nobody can audit. Never a token value, on either half. */
    /* PL-11 / D-199 (4): AN `ai` CREDENTIAL NAMES BOTH — THE PRINCIPAL BEHIND
       IT AND THE TOKEN IDENTITY — IN ONE STRING, and the composite is why a
       requested capture stays attributable. PL-4 copies `principal_plane` off
       the run into every `capture_requests` row and the drain composes the
       capture's attribution from it, so an identity dropped here would be an
       identity missing from the provenance of a document. NEVER THE TOKEN'S
       VALUE — the identity is a public name a member chose, which is exactly
       what D-199 (4) distinguishes it from.
       IT IS DELIBERATELY NOT THE VIEWER STRING. The viewer is the bare
       principal, because `viewerPredicate` decides what a caller may SEE and
       that is a question about the person or the group, not about which of
       their credentials asked. Two fields, two questions, and collapsing them
       would silently widen or narrow one of the two. */
    /* REC-152 (Membership v2 §7, "WHO MAY TICK AND CLOSE A RUN", BOB #16): THE SAME STAMP ON THE TICK AND
       THE CLOSE, because they are the run's PRINCIPAL's acts and the store compares the caller with the
       principal the OPEN stamped — so both sides of that comparison must be composed by ONE expression, or
       a member and her own credential could stop being recognised as one principal by a spelling drift.
       SET, never appended: a `principal` the caller put in its own query is overwritten here, and the
       store reads it as `caller` only from this stamp (a principal a caller can name is not one).
       REC-165 (§11 item 5 rule 1, BOB #25): THE SAME EXPRESSION FOR THE RUN'S TWO PRODUCTIONS, so a suggestion
       and a proposed reading are compared with the run's principal in the one form the open stamped. */
    if (RUN_VERB_ACTIONS.includes(op) || RUN_PRODUCTION_ACTIONS.includes(op))
      inner.searchParams.set("principal",
        viaSession ? sessIdentity
        : cls === "ai" ? `${aiCred.principal}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* T6-13 (capture-requests R42, K181 (6)): the retry's caller, by the same expression, in a statement of its own —
       a retry is not a production of a run, so it does not join RUN_PRODUCTION_ACTIONS. */
    if (op === "capturerequestretry")
      inner.searchParams.set("principal",
        viaSession ? sessIdentity
        : cls === "ai" ? `${aiCred.principal}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* R45 (case-authoring R39): WHO PROPOSED A DRAFT OF WHAT CHANGED. Any credential may propose (a machine's draft is
       labelled machine work), so the stamp is the label, by `actionlawspropose`'s expression (a session its member, a
       machine `class:<cls>`, an `ai` credential `class:ai/<tokenId>`); set as `proposedBy`, the stamp op-declarations
       names, and as `author`, the key case-authoring's map reads it from. A caller's copy of either is overwritten. */
    if (WHAT_CHANGED_PROPOSAL_ACTIONS.includes(op)) {
      const proposer = viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`;
      inner.searchParams.set("proposedBy", proposer);
      inner.searchParams.set("author", proposer);
    }
    /* R45 (network-notices R1, R4, R24): WHO PREPARES OR POSTS A NOTICE, the POSITIONAL identity (`member:<id>`, the
       founder's `member:admin`), the form network-notices asks membership of; only a member's session reaches these
       ops, and a machine stamp, were one to arrive, is refused there by name (C-127.1). */
    if (NETWORK_NOTICES_BY.includes(op))
      inner.searchParams.set("by", viaSession ? sessIdentity : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* R48 (op-declarations R13; docket R1, R2, R4, R5, R7, R18): WHO FILES OR MARKS A THREAT (`author`, any joined member)
       AND WHO PREPARES, POSTS OR DECLINES (`by`, the case's manager), the POSITIONAL identity (`member:<id>`, the
       founder's `member:admin`), the form docket asks membership's `positionalMember` of; only a member's session reaches
       these ops (their rows' `machineClasses: []`), and a machine stamp, were one to arrive, is refused there by name
       (C-129.1, MACHINE_CANNOT_PLACE_DOCKET). A caller's copy of either is overwritten. The docket's public shelves and
       its feed (`docketpublic`, `docketfeed`) are public ops, answered by plane's public hook through public-read's door
       (its R21), and stamp nothing. */
    if (DOCKET_AUTHOR.includes(op))
      inner.searchParams.set("author", viaSession ? sessIdentity : `${MACHINE_CLASS_PREFIX}${cls}`);
    if (DOCKET_BY.includes(op))
      inner.searchParams.set("by", viaSession ? sessIdentity : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* R49 (op-declarations R14; case-import R1, R5–R8): WHO IMPORTS, COMPLETES, ACCEPTS, WITHDRAWS, FLAGS OR CLEARS, the
       POSITIONAL identity (`member:<id>`, the founder's `member:admin`), the form case-import asks membership's
       `positionalMember` of; only a member's session reaches these ops, and a machine stamp, were one to arrive, is
       refused there by name (C-130.1, MACHINE_CANNOT_IMPORT). A caller's `by` (or `author`, which case-import's map reads
       when `by` is absent) is overwritten or deleted above. */
    if (CASE_IMPORT_ACTIONS.includes(op))
      inner.searchParams.set("by", viaSession ? sessIdentity : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* R50 (op-declarations R15; wizard-scripts R3–R9; K1402): WHO DRAFTS, REVISES, SUBMITS, APPROVES, RETIRES, GRANTS OR
       REVOKES THE EDITOR, the POSITIONAL identity, filing-templates' form, and WHO PROPOSED, the template proposal's label
       (a session its member, a machine `class:<cls>`, an agent `class:ai/<tokenId>`): each stamped as `author`, the one
       key wizard-scripts' map reads every identity from (the `filingTemplatesOps` pattern). Only a member's session
       reaches the acts (their rows); a machine stamp, were one to arrive, is refused there by name
       (MACHINE_CANNOT_DRAFT_WIZARD, MACHINE_CANNOT_APPROVE_WIZARD); any credential may propose. A caller's `author` was
       deleted above. `wizardprogress` is stamped nothing. */
    if (WIZARD_AUTHOR_ACTIONS.includes(op))
      inner.searchParams.set("author", viaSession ? sessIdentity : `${MACHINE_CLASS_PREFIX}${cls}`);
    if (WIZARD_PROPOSAL_ACTIONS.includes(op))
      inner.searchParams.set("author",
        viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* PL-18 / DEC-63 — WHICH MEMBER IS ASKING, for the project-participation
       gate on the three run verbs. Bob ruled 2026-08-09 that an investigation
       can be started by ANY MEMBER OF THE PROJECT: the gate is participation in
       the project the inquiry belongs to, with `contribute` (in NEEDS above)
       kept as the FLOOR beneath it.
       DELETED FIRST AND SET SECOND, the `ownerMemberId` discipline: a
       caller-supplied `actor` would be a caller deciding whose membership is
       checked, which is the whole gate handed to the person it gates.
       A MACHINE CREDENTIAL STAMPS EMPTY rather than `class:<cls>` — the
       QUEUE_ACTIONS precedent one stamp above — because participation is a
       relationship between a PERSON and a project and a token class is not a
       person. The store reads empty as *no participation to check* and does not
       apply the gate, which keeps its population identical to the capability
       floor's: `NEEDS` is enforced only `if (viaSession)` too. A fence wider
       than the floor beneath it would refuse the daemon outright, and DEC-63
       names the lever for the machine half explicitly and it is a different
       one — *"any narrowing happens at the credential layer"*, IS-5's `ai`
       credential scope.

       ***** THE `delete` IS SCOPED TO THE THREE VERBS, AND IT IS SCOPED
       BECAUSE AN UNSCOPED ONE BROKE `op=lease` — MEASURED, NOT REASONED. *****
       `actor` IS NOT THIS ITEM'S PARAMETER NAME: `op=lease` has stamped its own
       `actor` since REC-21's neighbourhood, forty lines above this. PL-18's
       first draft deleted the key UNCONDITIONALLY, on the `ownerMemberId`
       precedent — and `ownerMemberId` is a name only `promote` uses, which is
       what makes that precedent safe and this copy of it wrong. Found by the
       old battery's `members.test.mjs`, *"session lease is stamped with the
       member, not the claimed actor"*, one assertion, a lease arriving at the
       store with its actor wiped; R38's tests (`test/m/control-plane/
       lease.test.mjs`) hold the lease's actor now. **A server-side stamp that clears a key it
       does not own reaches every op that shares the name**, and the blast
       radius of this class is the whole parameter namespace, not the op being
       edited. Both halves now sit inside the guard, so nothing outside these
       three verbs is touched. */
    if (RUN_VERB_ACTIONS.includes(op)) {
      inner.searchParams.delete("actor");
      inner.searchParams.set("actor", viaSession ? sessMember : "");
    }
    let passBody = req.method === "POST" ? await req.text() : undefined;
    /* R17, R29: and every body stamp, for every op; the ops that declare one set it below. */
    if (passBody) {
      try {
        const b0 = JSON.parse(passBody);
        /* R59 (admission R20): a body's `token` is the caller's credential, the door's alone, never passed on; (K2146;
           R44) a grant's digest and the secret door's mark are the door's alone too, so no caller supplies either */
        /* R29, R67 (T38): an op whose `by` or `viewer` the door stamps in the address (`OP_STAMPS`) takes neither from
           the caller's body either, so its owner's map never holds a caller's statement of who is acting */
        const strip = [...BODY_STAMPS, "token", "secretSha", "bySecret", ...(BODY_DROPPED[op] ?? []),
                       ...declared.filter((k) => k === "by" || k === "viewer")];
        if (b0 && typeof b0 === "object" && !Array.isArray(b0) && strip.some((k) => k in b0)) {
          for (const k of strip) delete b0[k];
          passBody = JSON.stringify(b0);
        }
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* R53: `bodyBy`, the actor in the body's `by` (lines, money, money-checks, people, hypotheses, workbooks); an empty
       POST body is stamped too, so a refusal is the module's own. */
    if (declared.includes("bodyBy") && req.method === "POST") {
      try {
        const b = passBody ? JSON.parse(passBody) : {};
        if (b && typeof b === "object" && !Array.isArray(b)) { b.by = actor; passBody = JSON.stringify(b); }
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* create_projects (section 5) and the 7.1 owner claim, in one place.
     *
     * There is no op that creates a project: a project is created by promoting a
     * bundle with no base whose object_type is `project`. So the capability
     * gates that SHAPE, here, rather than appearing in NEEDS as an op name that
     * does not exist.
     *
     * `ownerMemberId` is deleted UNCONDITIONALLY before anything else and is
     * then set only for an identified session creating a project. It is the
     * field the store uses to decide who owns a new project, so a caller
     * supplying it would be a caller granting ownership to whomever they liked.
     * Deleting first and stamping second is the same discipline `author`,
     * `viewer`, `owner` and `by` follow in this file. */
    if (op === "promote" && passBody) {
      try {
        const b = JSON.parse(passBody);
        /* D-526: what this promotion is, derived once (`promotedTypeOf`). */
        const promotedType = promotedTypeOf(b);
        delete b.ownerMemberId;
        /* Who is ACTING, for the 7.11 owner check on deactivation and
           reactivation. Deleted first and stamped only for a session, like every
           other identity field here: a machine credential carries none and so
           cannot deactivate a project, which is deliberate. */
        delete b.actorMemberId;
        /* Authorship on the manifest is the server's stamp, never the caller's,
           for a machine credential as much as a session — the same rule `author`
           already follows for cite/sever and `by` for the roster. A session
           stamps the member; a machine credential stamps `token:<class>`, so an
           unattended writer that completes a capture a member walked away from
           (D-61) is NAMED on the manifest rather than anonymous, and cannot
           borrow a person's name. Deleted first so a caller-supplied `author` is
           overwritten, not honoured. `actorMemberId` stays session-only: a
           machine credential holds no member and so cannot deactivate a
           project. */
        delete b.author;
        if (viaSession) { b.author = sessMember; b.actorMemberId = sessMember; }
        else b.author = `${MACHINE_AUTHOR_PREFIX}${cls}`;
        /* REC-134 / C-56: the POSITIONAL identity a revision of a PROJECT's document is checked
           against (the actor must have joined it, §7.5) — `POSITIONAL_ACTS`' stamp, in the body
           because promote's payload is a body. Deleted first and set second, every credential:
           a session its identity, an `ai` key its principal, an instance credential its class
           (no roster position, not asked). */
        delete b.actorIdentity;
        b.actorIdentity = viaSession ? sessIdentity
          : cls === "ai" ? aiCred.principal
          : `${MACHINE_CLASS_PREFIX}${cls}`;
        /* REC-138 / D-426: and the VISIBILITY half beside it, so a revision of a project the actor
           cannot see answers exactly as a revision of one that does not exist (ABSENT), asked
           BEFORE the positional check. The same three arms as the viewer stamp on every gated op:
           the founder's is the administrator viewer, an `ai` key its principal. Deleted first. */
        delete b.actorViewer;
        b.actorViewer = viaSession ? sessViewer
          : cls === "ai" ? aiCred.principal
          : `${MACHINE_CLASS_PREFIX}${cls}`;
        /* D-85 (INVESTIGATIVE-SESSION.md §11 item 5, rule 2, BOB #25): AN ASSISTANT OPENS A QUESTION ONLY INSIDE A
           RUN IT HOLDS. The store asks that of a creation carrying THIS stamp, and only an `ai` credential carries
           it: a member's creation is untouched. It is the run's principal stamp in the ONE form `RUN_PRODUCTION_ACTIONS`
           uses (`<principal>/<tokenId>`), so `runPrincipalGate` recognises a member and the credential she minted as
           one principal by the same expression the run verbs are compared with. Deleted FIRST for every caller, so a
           session that sends one is not taken for an assistant and an assistant cannot name someone else.
           REC-171 (§11 item 5, "Rule 2's reach", BOB #30): THE RULE BINDS THE SURFACING ACT, NOT THE `ai` CLASS. Every
           creation that did not arrive through a member's session is the one D-78 stamps `surfaced_by: agent` below —
           an admin, member or probe DEPLOY TOKEN's included, which has no member behind it — so every such caller
           carries the stamp, composed by the run verbs' OWN expression (`class:<cls>` for a deploy token, the same
           string `op=airunopen` stamped as the run's principal), and `runPrincipalGate` compares it unchanged. The
           condition is `!viaSession` and never a list of classes: a class added later is asked, not exempted. The
           alternative — restamping a deploy token's creation `human` — would invent a person, and is not done. */
        /* REC-173 (§11 item 5, "A MIGRATION IS A REPLAY, NOT A SURFACING", BOB #30): A THIRD CASE, ADMITTED BY WHAT THE
           SERVER CAN CHECK. A creation of an inquiry is a MIGRATION REPLAY when (1) it arrives under the ADMIN class —
           the root of trust, a deploy token and never a session — and (2) `migrationReplayOf` finds the registered,
           held drive-provenance capture it names listing this bundle id and this `bundle.md` SHA-256. A replay is
           (a) exempt from rule 2 — no surfacing happens on this plane, so no `assistantPrincipal` is stamped; (b) NOT
           restamped by D-78 below — its Drive-era `surfaced_by` is kept, because a server-verified replay of recorded
           bytes is not a caller's assertion; and (c) recorded by the store as migrated, so its read states `not
           recorded (migrated from the Drive era)`. `migrationReplay` is the SERVER's stamp: deleted first for every
           caller, set only here. A verified replay is a replay: `replay` is set with it, so no creation-time stamp
           (D-436's group) rewrites the bytes the provenance lists. Anything failing (1) or (2) falls through to the
           ordinary creation unchanged. */
        /* D-511 (§11 item 5, "`replay` IS THE SERVER'S WORD, NEVER THE CALLER'S", RULED 2026-09-24 by BOB #33 on
           D-505's finding), STEP (1), THE FENCE. `replay` exempts a promotion from every SHAPE fence `promote` has —
           the gathering grammar, the inquiry and action basis arms, the correspondence arms, the bias arm, the
           creation-time group stamp, and C-32.19's rule that no machine writes a member's `risk_tier`. The exemption
           is right for what it is FOR: a replay re-states the record's own past verbatim, and that past predates the
           fences. But the flag ARRIVED IN THE REQUEST BODY and nothing removed it, so any caller could hand itself
           the exemption. MEASURED by D-505 through op=promote (the old `risk-tier.test.mjs` §7 arm (ix)): a
           MEMBER-class deploy token sending `replay: true` landed `risk_tier: 1` — "file freely" — on an action
           nobody assessed, and `op=projection` published it. A provenance hop a caller can hand us is one a caller
           can invent, which is the reasoning `migrationReplay` below already answers one field over.
           THE CONDITION IS THE ADMIN CLASS WITH NO SESSION, AND BOTH HALVES ARE LOAD-BEARING. Admin is the only class
           the migration tool used (`migrate.mjs`, narrowed to admin at REC-173 and retired in K739), so an honest
           replay is untouched. `!viaSession` is there because admission's session resolution sets `cls = kind` from
           `sess.role === "admin"`, and the FOUNDER'S OWN SESSION — the one whose stored role is the literal `admin`
           (membership's `ROOT_ADMIN`, `rootOfTrust: true`), minted by `op=claim` and `op=login` — therefore arrives as
           `cls === "admin"` exactly as the deploy token does. A person signed in at a browser is not the root of
           trust, which is the distinction admission's export refusal draws in the same words. MEASURED, because the
           first draft of this comment said an ADMIN-ROLE MEMBER's session arrives that way too and that is FALSE:
           a member login stores `member:<id>`, so her class is `member` and `m.role === "admin"` decides only her
           capabilities (membership's `sessionRights`). The old `risk-tier.test.mjs` §8's REACH arm asked `op=whoami` for all
           four callers rather than asserting any of it, and its control caught the error; R16's tests
           (`test/m/control-plane/gates.test.mjs`) hold the class test now. Everything else
           — a member session, a member, probe or `ai` token, and any class added later — has the flag removed BEFORE
           the store sees it, so every fence applies to it. It is a DELETE and not a refusal: the caller asked for an
           exemption it may not have, and the honest answer is the promotion judged as what it IS, which then refuses
           by the fence's own name (C-32.19 for the measured case) rather than by a name about the flag.
           DELETED BEFORE the `migrationReplay` block below, which sets `b.replay` as the SERVER's word on a verified
           migration replay — the only writer of it that remains.
           THE RESIDUE STEP (1) LEFT — an ADMIN-class caller could still ASSERT a replay it cannot show — IS CLOSED BY
           STEP (2) (D-512, the block below): every replayed promotion, of any type and any revision, now names a
           drive-provenance capture the plane verifies, and this class test stays as its second condition. */
        if (viaSession || cls !== "admin") delete b.replay;
        delete b.migrationReplay;
        /* D-512 (§11 item 5, "`replay` IS THE SERVER'S WORD, NEVER THE CALLER'S", BOB #33), STEP (2), THE END STATE.
           `replay` is honoured only where the SERVER VERIFIES it: a replayed promotion of ANY type and ANY revision
           names its drive-provenance capture, and `migrationReplayOf` — REC-173's check, which asked this of an
           inquiry's creation alone — finds the capture registered by this promotion, its bytes HELD and hashing to
           the sha named, and one preserved promotion record naming THIS bundle and listing THIS revision's
           `bundle.md` SHA-256, computed here from the text being promoted. The caller's flag is read once and
           DELETED; the only writer of `b.replay` after this line is the verification. Step (1)'s class test above
           is KEPT as the SECOND condition, as BOB #33 ruled: a non-admin caller's flag was already removed, so it is
           judged by the fences it tried to skip exactly as D-511 made it (no new refusal reaches that class).
           AN ADMIN THAT ASSERTS A REPLAY IT CANNOT SHOW IS REFUSED BY NAME (C-66.6), NOT DOWNGRADED. Deleting the
           flag and letting the promotion land as an ordinary one would be D-511's answer, and it is wrong for an
           honest replay, which carries the record's past VERBATIM (as the Drive-era migration did, through its tool
           `migrate.mjs`, retired in K739), while an ordinary creation is rewritten on the way in (D-436's group stamp;
           D-78's restamp) — the replay would report success over bytes the Drive record does not list. So the root of trust hears which claim failed and
           nothing is written. An inquiry CREATION that asserts nothing is still asked, as REC-173 built it: verified,
           it is a migration replay; unverified, it is an ordinary creation and rule 2 and D-78 apply unchanged.
           RESIDUE, STATED: the provenance capture is itself uploaded by the root of trust, whose honesty the record
           does not model (Membership §DEC-2, deferred). After this step no caller can ASSERT a replay the held
           bytes do not list; an admin can still FABRICATE the bytes. */
        delete b.replay;
        const creatingInquiry = b.base === null && !!b.meta && promotedType === "inquiry";   /* D-526's one derivation */
        /* R16: the verdict reached before the handler (above); an unverified assertion never reaches this line. */
        const proven = replay?.proven ?? null;
        if (proven) b.replay = true;
        /* REC-173's migration-replay stamp stays an INQUIRY CREATION's: it is what `op=projection`'s `surfaced_in`
           reads, and no other promotion has a surfacing act to account for. */
        const replayed = creatingInquiry ? proven : null;
        if (replayed) b.migrationReplay = replayed;
        /* N290 (K334; inquiry R44, SOURCE-ACCESS): THE MEMBER'S BROWSER AGENT IS THE SERVER'S STAMP, as `migrationReplay`
           is one field over: a promotion never rewrites the caller's bytes, and a line the caller writes is one it can
           invent. Deleted first for every caller; set only on a CREATION through a member's session, from that
           request's own `User-Agent` header, trimmed, at most 512 characters. A deploy token or an `ai` key has no
           member's browser behind it, so it carries none. The store records it at the creation (inquiry R44). */
        delete b.memberUserAgent;
        if (viaSession && b.base === null) {
          const agent = (req.headers.get("User-Agent") || "").trim().slice(0, 512).trimEnd();
          if (agent) b.memberUserAgent = agent;
        }
        delete b.assistantPrincipal;
        if (!viaSession)
          b.assistantPrincipal = cls === "ai" ? `${aiCred.principal}/${aiCred.tokenId}` : `${MACHINE_CLASS_PREFIX}${cls}`;
        /* REC-173 (a): a verified migration replay is exempt from rule 2 — no surfacing happens on this plane — so it
           carries no stamp for `#surfacingGate` to ask. Written as its own line after REC-171's stamp, which stands
           byte-for-byte for every other caller. */
        if (replayed) delete b.assistantPrincipal;
        if (b.base === null && b.meta && promotedType === "project" && viaSession) {
          /* admission R11 (K723): a session creating a project without `create_projects` is refused NOT_CAPABLE (C-38.5)
             at admission's one site, `projectCreationGate`, from the payload, since no op names the shape. */
          const creation = projectCreationGate(sessCaps);
          if (creation) return refused(creation);
          b.ownerMemberId = sessMember;
        }
        /* D-78: surfaced_by is the ACTOR CLASS, decided by the SERVER and never
           taken from the caller's assertion. A focus opened by an assistant (a
           machine credential) honestly records `agent`; one opened by a member
           records `human`. Both bundle writers (setup.mjs, civicos-ui) emit a
           literal `human`, and the store byte-trusts bundle.md, so the honest
           place to decide it is HERE, at the trust boundary, beside author,
           owner and by — the same delete-and-restamp discipline, and the reason
           it fixes BOTH writers at once. C-2.8 already permits either value.
           Stamped on the CREATION (the surfacing act itself); a revision carries
           the document's value forward, so the origin fact is not rewritten by
           whoever later edits it. Only a focus/problem carries the field, and
           the store recomputes nothing — the recomputed bundle.md sha below is
           what becomes the bundle_sha, so overwriting a caller's `agent` claim
           on a session write cannot smuggle a false attribution past the gate. */
        if (b.base === null && b.meta && !replayed   /* REC-173 (b): a verified migration replay keeps its Drive-era bytes */
            /* Through record-grammar's normalizeType (REC-10), so the canonical
               `inquiry` spelling and both legacy spellings all get the D-78
               restamp — hand-listed spellings here is how the last rename
               made a check silently stop firing. */
            && promotedType === "inquiry"
            && Array.isArray(b.files)) {
          const bm = b.files.find((f) => f && f.path === "bundle.md" && typeof f.text === "string");
          if (bm) {
            const want = viaSession ? "human" : "agent";
            const lines = bm.text.split("\n");
            const end = lines.indexOf("---", 1);
            let changed = false;
            for (let i = 1; i < (end === -1 ? lines.length : end); i++) {
              if (lines[i].startsWith("surfaced_by:")) { lines[i] = "surfaced_by: " + want; changed = true; break; }
            }
            /* REC-175: A SUPPLIED DIGEST THAT IS NOT OF THE BYTES SENT IS NOT PAPERED OVER HERE. This restamp
               recomputes the sha of what it writes, which would silently REPLACE a caller's false `sha256` with a
               true one and answer `ok: true` over it. So the restamp runs only when the caller sent no digest or
               the digest OF THE TEXT IT SENT; otherwise the bytes and the digest go to the store as sent, and
               `promote` refuses them FILE_DIGEST_MISMATCH by name. Compared by the store's own rule (UTF-8, hex
               case-insensitive). */
            const sentSha = createSha256().update(new TextEncoder().encode(bm.text)).hex();
            const sentOk = bm.sha256 === undefined || bm.sha256 === null
              || (typeof bm.sha256 === "string" && bm.sha256.toLowerCase() === sentSha);
            if (changed && sentOk) {
              bm.text = lines.join("\n");
              const bytes = new TextEncoder().encode(bm.text);
              bm.bytes = bytes.length;
              bm.sha256 = createSha256().update(bytes).hex();
            }
          }
        }
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* Who dispositioned a knock is part of the record. A session signs its
       own name; a machine credential says so plainly rather than borrowing
       a person's. */
    /* A member declares their OWN expertise and an administrator confirms as
       THEMSELVES. Both stamped from the session and overwritten if supplied, on
       the same reasoning as author and by: a declaration a caller can address to
       someone else is not a declaration. Without a session there is no member to
       be, so the store refuses on the identity it is handed.

       IDENTITY-CLAIM: ENFORCED-ELSEWHERE NO_SUCH_MEMBER NOT_AN_ADMIN — the machine is
       refused here, but NOT as a machine, and the difference is the finding.

       CORRECTED BY DEC-52 (REC-65), AND THIS PAIR IS THE ONE WHERE THE RULING AND THE
       BEHAVIOUR COME APART — which is why it gets its own paragraph instead of a
       pointer to FW-6. DEC-52 permits a machine credential to perform the constitutive
       acts, so the last sentence above must NOT be read as a machine fence. It is not
       one, and it never was. What actually refuses is MEASURED rather than inferred
       (REC-65, driven through the control plane under a machine credential with a
       payload a member then completes successfully with the same body):
         - op=expertisedeclare answers **NO_SUCH_MEMBER** — `class:member` is not a
           member id, so there is no row to hang a licence on;
         - op=expertiseconfirm answers **NOT_AN_ADMIN** — `#isAdminMember("class:admin")`
           is false, so a machine ADMIN credential is not an administrator MEMBER.
       NEITHER IS A MACHINE REFUSAL, and saying so is the point: this is D-229's exact
       shape — a fence believed to be doing work that an ordinary identity guard is
       doing instead. The distinction is load-bearing here, because a later author who
       thought a machine fence stood here might delete the membership guard as
       redundant and open BOTH doors at once.
       WHY THE OUTCOME IS NEVERTHELESS RIGHT AND IS NOT A GAP TO CLOSE: expertise (§1.3)
       is a claim about a PERSON'S standing, and confirmation is one person VOUCHING FOR
       another. DEC-52 licenses a machine to declare things about the RECORD; it says
       nothing about a machine acquiring a licence of its own, and there is nowhere in
       the members table to put one. The act is permitted by doctrine and impossible by
       construction, which is a better outcome than a fence and is left exactly as it
       is. */
    if ((op === "expertisedeclare" || op === "expertiseconfirm") && passBody) {
      try {
        const b = JSON.parse(passBody);
        if (op === "expertisedeclare") b.memberId = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        else b.by = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* FW-6: the SUBJECT REGISTRY writes carry WHO declared the entry or the
       relation, stamped from the session and overwritten if the caller supplied it,
       on the same reasoning as author, by and memberId above: a declared relation is
       a member's constitutive statement, so an entry a caller could attribute to
       someone else is not that member's declaration. A machine credential says what
       it is (class:<cls>) rather than borrowing a person's name.

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may declare a relation, and
       the record names it.

       CORRECTED 2026-08-07 BY DEC-52 (enacted as REC-65), AND THE CORRECTION RUNS THE
       OPPOSITE WAY FROM THE ONE THE SENTENCE ABOVE INVITES. Bob ruled: *"allowing the
       machine to rule doesn't go against doctrine. So it can rule."* A MACHINE
       CREDENTIAL MAY DECLARE A RELATION DIRECTLY INTO THE RECORD — the act is
       permitted, not tolerated. The paragraph above read for months as though only a
       member could, and NOTHING HAS EVER ENFORCED THAT: REC-46 measured the gap,
       deliberately changed no site here, and every one stayed green, which WAS the
       measurement. **The comment was the wrong half, not the code. No fence is to be
       added at `declareRelation`, `createEntity` or `addEntityAlias` to make the older
       wording true**, and the absence of one is now a DECISION a later author may rely
       on rather than an oversight to tidy up. This block is the long form; the FW-7,
       FW-8, FW-9 and expertise sites below point back here rather than restating it,
       because five copies of a ruling drift and this project has measured that five
       times.

       WHY A FALSE COMMENT WAS WORTH AN ITEM: a comment describing a constraint that
       does not exist is a FENCE THAT READS AS PRESENT TO EVERY SUBSEQUENT AUTHOR —
       the class D-229, REC-73, D-228 and IC-33 each cost a whole item, in its cheapest
       and most durable form.

       WHAT THE RULING CARRIES WITH IT, and a later author must not drop any of it:
         - THE RECORD NAMES THE MACHINE PRINCIPAL on every such act — `class:<cls>`,
           never a person's name (DEC-55 det 4 / D-199.4). That is what the stamp on
           the next line is FOR, and it is now load-bearing rather than merely honest:
           permission to act is granted against a named actor.
         - A machine-declared statement is therefore VISIBLY MACHINE-ATTRIBUTED
           (D-82's look-derived rule) — a reader can tell a machine's declaration from
           a member's, which is the whole reason the two may sit in one table.
         - GRADES STAY EARNED (framework §8.1). The ruling decides WHO may declare and
           says nothing about what a declaration is worth; a declared relation still
           carries no connection grade at all (D-83).
         - DEC-15 stands: a hunch is a member act.
         - The earlier provisional — sidebar approval as the act of record — is
           SUPERSEDED AS A GATE. The sidebar (INVESTIGATIVE-SESSION.md §14a) remains a
           visibility and bulk-review surface, and reviewing is not the same as
           permitting. */
    if ((op === "entitycreate" || op === "entityalias" || op === "relationdeclare") && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.declaredBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* T5-11 (entities R8, R4, R28): WHO WITHDREW an alias or a relation, stamped on the FW-6 rule above and overwriting
       any `withdrawnBy` the caller put in the body, so a correction is never attributed to someone who did not make it.

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may correct the registry it may build, and the record names it (class:<cls>).

       The FW-6 block above carries the ruling in full; nothing refuses a machine here BY DESIGN. */
    if ((op === "aliaswithdraw" || op === "relationwithdraw") && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.withdrawnBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* N345 (entities R38): WHO REPORTED that a resolution matched the wrong subject, stamped on the FW-6 rule above into
       the body `reportResolutionDefect` reads, overwriting any `by` the caller put there; a repeat is judged per reporter,
       so a caller who could name one could report twice or as someone else. An empty POST body is stamped too, so the
       report's refusal is the module's own and never an unattributed row.

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may report a defect in the registry it may build, and the record names it (class:<cls>).

       The FW-6 block above carries the ruling in full; nothing refuses a machine here BY DESIGN. */
    if (op === "resolutiondefect" && req.method === "POST") {
      try {
        const b = passBody ? JSON.parse(passBody) : {};
        if (b && typeof b === "object" && !Array.isArray(b)) {
          b.by = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
          passBody = JSON.stringify(b);
        }
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* FW-7: WHO resolved a reference or TESTIFIED a grade-D connection is part of the
       record, stamped from the session and overwritten if supplied, on the same
       reasoning as the registry writes above: a resolution a caller could attribute to
       someone else is not that member's act, and a grade-D testimony without a named
       author is not testimony at all (framework 8.1). A machine credential says what it
       is (class:<cls>) rather than borrowing a person's name.

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may resolve a reference and
       may testify, and the record names it (class:<cls>).

       CORRECTED BY DEC-52 (REC-65) — SEE THE FW-6 BLOCK ABOVE FOR THE RULING IN FULL.
       A MACHINE CREDENTIAL MAY RESOLVE A REFERENCE, and nothing here refuses one BY
       DESIGN rather than by omission. Two things this site adds to the ruling and they
       are not decoration. (1) DEC-52's own reasoning records that `resolve` is DERIVED
       — `#recogniseTier` is a deterministic cascade over aliases a member ALREADY
       registered, and it never mints the weakest grade — so it asserts nothing the
       member's alias declaration did not already imply. Fencing it would have cost the
       automated-recognition capability and bought no honesty; that is why the derived
       act was the easiest of the three to rule on. (2) `resolvetestify` is the opposite
       case — PURE TESTIMONY, and the sentence above about a grade-D testimony needing a
       named author STANDS UNCHANGED under the ruling, because `class:<cls>` IS a name.
       What §8.1 refuses is anonymity, not machinery: the act is permitted and the
       ANONYMITY is not, which is the distinction the whole stamp exists to draw. */
    if ((op === "resolve" || op === "resolvetestify") && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.resolvedBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* FW-8: a PROGRESSION DEFINITION is a member's constitutive claim about how an
       institution ought to behave (framework §8.1 note 3), so who declared it is stamped
       from the session and overwritten if the caller supplied it, exactly as the registry
       writes are. And a DERIVED connection is asserted by the SYSTEM in slice A: asserted_by
       is FORCED to "system" server-side so a caller cannot pass it off as source- or
       member-asserted (a member-asserted connection is a distinct, slice-B fact — an
       equality a caller can hand us is one a caller can invent).

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may define a progression, and
       the record names it (class:<cls>).

       CORRECTED BY DEC-52 (REC-65) — SEE THE FW-6 BLOCK ABOVE FOR THE RULING IN FULL.
       A MACHINE CREDENTIAL MAY DEFINE A PROGRESSION and is refused by nothing here, BY
       DECISION. The §8.1 note-3 sentence above still describes what the claim IS — a
       constitutive claim about how an institution ought to behave — and the ruling
       changes only who may make it, on Bob's reasoning that letting the machine rule
       does not go against doctrine. The record says which: `class:<cls>` on the row, so
       a definition proposed by an agent and one authored by a member are DISTINGUISHABLE
       facts rather than one indistinguishable one.
       THE `assertedBy: "system"` FORCE ON op=connect IS A DIFFERENT RULE AND IS
       UNTOUCHED. It is not an identity fence at all: it stops a caller passing a DERIVED
       connection off as source- or member-asserted, which is a claim about HOW the
       connection was reached, not about who reached it. DEC-52 does not reach it. */
    if (op === "progressiondefine" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.declaredBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    if (op === "connect" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.assertedBy = "system";
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* FW-9: WHICH stage a document fills in a progression instance is the threading member's
       authored judgment, so who threaded it is stamped from the session and overwritten if the
       caller supplied it, on the same reasoning as the registry, recogniser and progression
       writes above. The GRADE of each placement is the record's (a document's resolution to the
       entity), never the caller's, so only the authorship is stamped here. A machine credential
       says what it is (class:<cls>) rather than borrowing a person's name.

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may thread a progression, and
       the record names it (class:<cls>).

       CORRECTED BY DEC-52 (REC-65) — SEE THE FW-6 BLOCK ABOVE FOR THE RULING IN FULL. A
       MACHINE CREDENTIAL MAY THREAD A PROGRESSION, and the absence of a fence here is a
       decision rather than an omission. The sentence above about an authored judgment
       stands as a description of the JUDGMENT; what it no longer implies is that only a
       member may make it.
       AND THE SECOND SENTENCE IS WHY THIS ACT WAS THE SAFEST OF THE THREE TO RULE ON,
       which is worth having at the site: the GRADE of each placement is EARNED from the
       document's resolution to the entity and is never taken from the caller, so a
       machine that threads a progression cannot thereby make the record claim anything
       stronger than the evidence already supports (framework §8.1). Grades stay earned
       is not a promise made elsewhere about this act — it is a property of this act. */
    if (op === "thread" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.threadedBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* FW-10: an exception document DISCHARGES a lawful skip, and WHO declared the skip lawful is
       part of the record — the author of a justification, exactly as a progression definition or a
       declared relation carries its author. Stamped from the session and overwritten if the caller
       supplied it; a machine credential says what it is (class:<cls>) rather than borrowing a
       person's name. The GRADE-like earning (the document must resolve to the entity) is the
       record's, checked in the store, never the caller's.
       REC-65 / DEC-52: this site states its rule BY REFERENCE — "exactly as a progression
       definition or a declared relation carries its author" — so the reference now points at
       corrected prose, and that is deliberate rather than incidental. A machine credential may
       discharge a lawful skip, for the same reason and with the same naming (`class:<cls>`).
       A comment that inherits its rule inherits its corrections too, which is the argument for
       writing it by reference in the first place. */
    if (op === "discharge" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.declaredBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* REC-7: WHO deferred or dismissed a proposal is the whole of the disposition — declining is
       not authoring, so the disposition record IS the act, and it must carry the deciding member.
       Stamped from the session and overwritten if the caller supplied it, exactly as the other
       progression writes are: a member's decision to set aside the record's question, addressed to
       nobody but themselves. A machine credential says what it is (class:<cls>) rather than
       borrowing a person's name; the store refuses a blank decider (NO_DECIDER), so a bypass fails
       closed.

       IDENTITY-CLAIM: OPEN — DEC-52 rules on three verbs and setting aside the record's
       own question is not one of them. Left for Bob, pinned by name, not decided.

       OPEN, NAMED, AND DELIBERATELY NOT CLOSED BY REC-65 — read this before adding a
       fence OR relying on its absence. **DEC-52 DOES NOT REACH THIS ACT.** Bob ruled on
       three verbs — declare a relation, resolve a reference, thread a progression — and
       setting aside the record's own question is none of them. But the sentence above
       describes it as a member's decision and NOTHING REFUSES A MACHINE, which REC-65
       MEASURED rather than inferred: driven through the control plane under a machine
       credential, `op=proposedispose` SUCCEEDS and the row reads
       `decided_by: "class:member"`. So an agent can defer the record's own question to
       nobody but itself, and the record will say so honestly and permit it.
       WHY IT IS LEFT AS IT IS RATHER THAN FENCED OR BLESSED: fencing it would be a
       worker deciding a doctrine question Bob has not been asked, and blessing it would
       be worse — it would extend a ruling by analogy, which is exactly how a ruling
       drifts. It is LEFT for Bob (REC-65's report) as the question DEC-52's
       reasoning raises without answering. */
    if (op === "proposedispose" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.decidedBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* T6-13 (intent R2, R8–R11, R16, R18, R20; INTENT #1 REPORT J4.2): WHO SET THE CONDITION, DECLARED, LINKED, CLOSED,
       DEPARTED, RECORDED, RETIRED, TRIAGED OR SET AN ASSISTANT TO WORK — intent reads `author` from the BODY, so it is
       stamped into the body here and a caller's is overwritten. It is the POSITIONAL identity (`member:<id>`, the
       founder's `member:admin`), the form intent asks membership's `projectAuthority` of; a machine credential stamps
       `class:<cls>` and an `ai` credential `class:ai/<tokenId>` (`contentmint`'s form), each a machine identity intent
       refuses BY NAME at every act but `triage`'s `question` — NEVER a key's principal, which would put an assistant's
       act under a person's name.
       `triage` also carries `assistantPrincipal`, op=promote's stamp by op=promote's expression: `question` opens an
       inquiry through promotion, and ai-runs' surfacing step (its R25) asks that stamp for the run the caller holds. It
       is deleted first for every caller and set only for one that did not arrive by a session, so a session is never
       taken for an assistant and an assistant cannot name another. `run` stays the caller's word: the step asks every
       question of it (sight, position, status, bound). An empty POST body is stamped too, so a signed-in session's
       act never reads as a machine's for want of a body. */
    if (INTENT_ACTIONS.includes(op) && req.method === "POST") {
      try {
        const b = passBody ? JSON.parse(passBody) : {};
        if (b && typeof b === "object" && !Array.isArray(b)) {
          b.author = viaSession ? sessIdentity
            : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
            : `${MACHINE_CLASS_PREFIX}${cls}`;
          if (op === "triage") {
            delete b.assistantPrincipal;
            if (!viaSession)
              b.assistantPrincipal = cls === "ai" ? `${aiCred.principal}/${aiCred.tokenId}` : `${MACHINE_CLASS_PREFIX}${cls}`;
          }
          passBody = JSON.stringify(b);
        }
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* T8 (standards R1, R9, R10): WHO RECORDED OR ADOPTED A STANDARD, AND WHO PROPOSED ONE — standards reads `author` and
       `proposer` from the BODY (its `viewer` from the query, after the body), so each is stamped into the body here and a
       caller's is overwritten; the proposal takes `proposer` and the other two `author`, the one key each accepts. The
       layer's expression (`QUERY_AUTHOR_ACTIONS` above): the positional identity for a session, `class:<cls>` or
       `class:ai/<tokenId>` for a machine, which standards refuses BY NAME at a declaration or an adoption
       (MACHINE_CANNOT_DECLARE_STANDARD) and labels as machine work on a proposal. An empty POST body is stamped too. */
    /* K1687: standards' five T33 acts read `author` (`lawpropose` `proposer`) from the body too, as these do; (T35, T36;
       R60) so does every act and proposal of its family (`BODY_ACTOR`): T35's force, release, adoption, imposition and
       benchmark acts, which reached it with no author, and the two in-force-through acts (standards R50). */
    if ((STANDARDS_ACTIONS.includes(op) || Object.hasOwn(BODY_ACTOR, op)) && req.method === "POST") {
      try {
        const b = passBody ? JSON.parse(passBody) : {};
        if (b && typeof b === "object" && !Array.isArray(b)) {
          const who = viaSession ? sessIdentity
            : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
            : `${MACHINE_CLASS_PREFIX}${cls}`;
          for (const k of ["author", "proposer", ...BODY_ACTOR_KEYS]) delete b[k];
          b[Object.hasOwn(BODY_ACTOR, op) ? BODY_ACTOR[op] : op === "standardpropose" ? "proposer" : "author"] = who;
          passBody = JSON.stringify(b);
        }
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* K921 (local-facts R1): WHO CONFIRMED, CORRECTED OR DISPUTED A LOCAL FACT. local-facts reads `by` from the BODY,
       so it is stamped into the body here and a caller's is overwritten: the positional identity (`member:<id>`, the
       founder's `member:admin`), the action layer's expression, a machine `class:<cls>` and an agent `class:ai/<tokenId>`,
       each a machine identity local-facts refuses BY NAME (MACHINE_CANNOT_CONFIRM). An empty POST body is stamped too,
       so the refusal is the module's own and never an unattributed row. */
    if (LOCAL_FACTS_ACTIONS.includes(op) && req.method === "POST") {
      try {
        const b = passBody ? JSON.parse(passBody) : {};
        if (b && typeof b === "object" && !Array.isArray(b)) {
          /* local-facts' ops map spreads the whole body into the act, so no stamp of the caller's may ride in it */
          for (const k of QUERY_STAMPS) delete b[k];
          b.by = viaSession ? sessIdentity
            : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
            : `${MACHINE_CLASS_PREFIX}${cls}`;
          passBody = JSON.stringify(b);
        }
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    if (op === "inboxresolve" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.by = viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* D-98. Who forwarded a task and who resolved it are the two facts its
       history exists to hold, so neither is taken from the caller. A machine
       credential says what it is rather than borrowing a person's name.
       CORRECTED 2026-08-04 (REC-28, D-151): this comment used to finish "and the
       store refuses a forward or a resolution that names no member, so a daemon
       cannot close somebody's work" — true of the NO_ACTOR refusal it described
       and NOT the guarantee it sounded like, because an UNASSIGNED task is
       nobody's work and the store closed it happily for `token:probe`. The stamp
       is what MAKES the store's act refusals possible and is unchanged: it is
       precisely because a machine is honestly named `token:<class>` here that
       taskForward/taskResolve can refuse it BY SHAPE (MACHINE_CANNOT_FORWARD /
       MACHINE_CANNOT_RESOLVE). `taskdrain` keeps the stamp and no such refusal:
       routing an event into a task is the daemon's job. */
    /* REC-207: `op=biasdebtresolve` takes the SAME body stamp and for the same reason. WHO settled the
       obligation is the whole of what the act records beside the reason, so it is the server's word and
       never the caller's; and a machine credential arriving honestly named `token:<class>` is precisely
       what lets the store refuse it BY SHAPE rather than by guessing from an absence. */
    if ((op === "taskforward" || op === "taskresolve" || op === "taskdrain"
         || op === "biasdebtresolve") && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.actor = viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* PL-11 / IS-5 / D-199 (3): WHO WITHDREW AN AGENT CREDENTIAL is the whole
       content of `revoked_by`, so it is stamped from the session and the
       caller's own copy is overwritten rather than honoured — the same rule
       every identity field in this file follows. A machine credential arrives
       honestly named `token:<class>` and the store refuses it BY SHAPE
       (C-29.4), which is only possible because the stamp is the server's. */
    if (op === "aicredentialrevoke")
      inner.searchParams.set("who", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* D-436 / IC-172: WHO RECORDED THE INSTANCE'S PRODUCING GROUP is the whole of `recorded_by`, so it is the
       SERVER's stamp, set after the caller's parameters were copied — a caller-supplied `author` is overwritten.
       Only the root of trust reaches the op (its OPS row), so this reads `token:admin` in practice. */
    if (op === "instancegroupseed")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* REC-126 / DEC-31: WHO AUTHORED THE DRAFT, WHO ISSUED THE GRANT, WHO WITHDREW
       IT — the three facts §6A.2's "attributed" row demands, so all three are
       stamped by the server and a caller-supplied `author` is overwritten rather
       than honoured. A machine arrives honestly named `token:<class>` and the store
       refuses it BY NAME (MACHINE_CANNOT_REVIEW). `secretSha` is DELETED for the
       same reason: only the mint below may set it. */
    if (op === "casedraft" || op === "reviewgrant" || op === "reviewrevoke") {
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
      inner.searchParams.delete("secretSha");
    }

    /* PL-11 / IS-5 / D-199 — THE MINT, AND IT IS NOT A PLAIN FORWARD FOR ONE
     * REASON: THE VALUE IS GENERATED HERE AND IS RETURNED EXACTLY ONCE.
     *
     * The Durable Object receives the SHA and never the value, so no method
     * behind the store's door can print a credential because none has ever held one — a
     * stronger statement than a rule about not logging it; R30's test
     * (`test/m/control-plane/envelope.test.mjs`) drives the mint and finds the
     * value in its one answer and nowhere else. What is stored is an
     * identity a member chose and a hash that verifies a presentation, and
     * D-199 (4) is explicit that the record names the identity and the
     * principal, NEVER the token's value.
     *
     * THE DECLARATION IS JUDGED BEFORE ANYTHING IS WRITTEN, because a scope the
     * gate would refuse is a sentence that must not enter the record at all
     * (C-29.8 / C-29.9). `who` and `secretSha` are SET rather than merged: a
     * caller who could name either could mint themselves a credential in
     * somebody else's name, or bind a secret they chose. */
    if (op === "aicredentialmint") {
      let asked = {};
      try { asked = passBody ? JSON.parse(passBody) : {}; } catch { asked = {}; }
      /* admission R13: the declared writes and the confinement are judged before anything is written, and the value is
         generated there; only its SHA-256 and the NORMALISED declaration cross to the store, never the caller's spelling. */
      const mint = await aiCredentialMint(asked, cls);
      if (mint.refusal) return refused(mint.refusal);
      const secret = mint.secret;
      inner.searchParams.set("who", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
      /* R64 (N761; credentials R53): the digest in the internal request's body alone, never its query */
      const minted = await doAnswer(stub.fetch(new Request(inner,
        { method: "POST", body: JSON.stringify({ ...asked, writes: mint.writes, confinedTo: mint.confinedTo,
                                                  secretSha: mint.secretSha }) })));
      if (minted.refused) return storeRefusal(minted, { op, store: storeName, tokenClass: cls });
      if (!minted.answered) return storeSilent("aicredentialmint", minted.correlation);
      if (!minted.result || minted.result.ok !== true)
        return json({ ok: false, ...(minted.result || {}), op, store: storeName, tokenClass: cls }, 403);
      return json({ ok: true, result: {
        ...minted.result,
        /* THE ONE TIME THIS VALUE EXISTS ANYWHERE A CALLER CAN READ IT. It is
           not recoverable afterwards from this instance by any route, because
           nothing here kept it — losing it means minting another and revoking
           this one, which leaves both acts on the record where they belong. */
        token: secret,
        tokenIsShownOnce: "This is the only time your group's Civicsmith will show this value. It is not stored "
          + "and cannot be recovered — the record holds the credential's NAME and who created it, "
          + "never the value. If it is lost, withdraw this credential and create another.",
      }, store: storeName, tokenClass: cls }, 200);
    }

    /* REC-126 / DEC-31 / IC-145 — THE GRANT'S READ SECRET, GENERATED HERE AND
     * SHOWN EXACTLY ONCE, on `aicredentialmint`'s pattern one block up and for its
     * reason: the Durable Object receives the SHA-256 and never the value, so no
     * method behind the store's door can print it because none has ever held it. The value is
     * a READ credential only (§6A.2): it is not a token, `classify` never admits it,
     * and the only ops that read it are `reviewcopy`, `reviewcomment` and the
     * unsigned half of `casedocument`. 32 random bytes, base64url, behind a version
     * prefix — not an id, and not derivable from one. */
    if (op === "reviewgrant") {
      const { secret, secretSha } = await reviewGrantSecret();   /* admission R13 */
      /* R64 (N761): the digest in the internal request's body alone, never its query */
      const issued = await doAnswer(stub.fetch(new Request(inner, { method: "POST", body: withDigest(passBody, secretSha) })));
      if (issued.refused) return storeRefusal(issued, { op, store: storeName, tokenClass: cls });
      if (!issued.answered) return storeSilent("reviewgrant", issued.correlation);
      if (!issued.result || issued.result.ok !== true)
        return json({ ok: false, ...(issued.result || {}), op, store: storeName, tokenClass: cls }, 403);
      return json({ ok: true, result: {
        ...issued.result,
        secret,
        secretIsShownOnce: "This is the only time your group's Civicsmith will show this value. It is stored only as a "
          + "fingerprint and cannot be recovered. Give it to the recipient: it lets them READ this one draft and "
          + "COMMENT on it, and nothing else. If it is lost, withdraw this grant and issue another.",
        read: "a POST to op=reviewcopy with the value above as `secret` in its JSON body, never in the address",
      }, store: storeName, tokenClass: cls }, 200);
    }

    /* R44 (K921; filing-templates R8): THE TEMPLATE GRANT'S SECRET, answered as `reviewgrant` is, one block up and for
       its reason: generated here by admission's `reviewGrantSecret` (its R13), its SHA-256 alone stamped `secretSha` for
       filing-templates, and the value returned once, in this answer. It opens the four grant doors (R44) to one version
       while the grant is live, and nothing else. */
    if (op === "templatereviewgrant") {
      const { secret, secretSha } = await reviewGrantSecret();   /* admission R13 */
      /* R64 (N761): the digest in the internal request's body alone, never its query */
      const issued = await doAnswer(stub.fetch(new Request(inner, { method: "POST", body: withDigest(passBody, secretSha) })));
      if (issued.refused) return storeRefusal(issued, { op, store: storeName, tokenClass: cls });
      if (!issued.answered) return storeSilent("templatereviewgrant", issued.correlation);
      if (!issued.result || issued.result.ok !== true)
        return json({ ok: false, ...(issued.result || {}), op, store: storeName, tokenClass: cls }, 403);
      return json({ ok: true, result: {
        ...issued.result,
        secret,
        secretIsShownOnce: "This is the only time your group's Civicsmith will show this value. It is stored only as a "
          + "fingerprint and cannot be recovered. Give it to the reviewer: it lets them READ this one template version, "
          + "COMMENT on it and REVIEW it while it is a draft or in review, and nothing else. If it is lost, withdraw "
          + "this grant and open another.",
        read: "a POST to op=templateread with the value above as `secret` in its JSON body, never in the address",
      }, store: storeName, tokenClass: cls }, 200);
    }

    /* R61: file-safety's byte answers, at the store's route of their own name, relayed as the owner answers them. */
    if (BYTE_OPS.includes(op)) {
      const warned = op === "openwithwarning" && req.method === "GET" ? warnedOf(url) : undefined;
      inner.searchParams.delete("warned");
      const init = warned === undefined ? { method: req.method, body: passBody }
        : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ warned }) };
      return byteAnswer(await stub.fetch(new Request(inner, withGrant(init))), op, { store: storeName, tokenClass: cls });
    }

    /* REC-198: the list of a project's drafts answers in the review copy's OWN shape — through `reviewAnswer`,
       the function `reviewcopy` answers through — so the dead answer a caller outside the fence receives is the
       single read's, status and bytes, and not this handler's generic envelope. */
    if (op === "casedrafts")
      return reviewAnswer(await doAnswer(stub.fetch(new Request(inner, withGrant({ method: "GET" })))), op);

    /* R23 (K421), R30, REC-52: the reply is read through `doAnswer`. The store's own refusal (`BAD_JSON`, an unknown
       route) is relayed at its status; anything that is not JSON carrying a boolean `ok`, or the store's catch, is a
       silence, never relayed (a store's stack included). */
    const out = await doAnswer(stub.fetch(new Request(inner, withGrant({ method: req.method, body: passBody }))));
    if (out.refused) return storeRefusal(out, { store: storeName, tokenClass: cls });
    if (!out.answered) return storeSilent(op, out.correlation);
    const { body, status } = out.reply;
    /* R65 (credentials R16, R43): a member who disconnects their subscription, or is revoked, is signed out of their own
       runner, after the act and whatever the runner answers; the act's answer is unchanged. */
    const leaver = leaverOf(op, reqBody, body.result, stampOf.by);
    if (leaver) await signoutLeaver(env, leaver);
    /* R58 (K2042 (2)): what an `op=unpack` filed is promoted, one act each, and named in the answer */
    if (op === "unpack" && body.result && body.result.ok === true) {
      const docs = archiveDocuments("unpack", body.result);
      if (docs.length || Array.isArray(body.result.documents)) {
        const done = await promoteArchive({ stub, doAnswer, docs, project: archiveProject,
                                            archiveSha: body.result.archive?.sha256 ?? null, who: archiveWho });
        return json({ ...body, result: { ...body.result, ...done }, store: storeName, tokenClass: cls }, status);
      }
    }
    /* R57 (T35; N686, K1837, K1841): past every refusal of the store's door and of the owner, a draft is asked of the
       object (`draft.mjs`, wired by plane as its `draft`), with the pack the door holds (R41) and the request's own words;
       only a member's session reaches these ops (their specs). */
    if (draftDue(op, body) && viaSession && typeof stub.draft === "function") {
      let asked = {};
      try { asked = passBody ? JSON.parse(passBody) : {}; } catch { asked = {}; }
      const pack = await heldPack({ req, url, env, cls, viaSession, sessMember, sessViewer, sessIdentity, sessRights, sessCaps,
                                    aiCred, storeName, stub });
      const ask = draftAsk(op, asked, { member: sessMember, session: credential.token,
                                       firsthand: body.result.firsthand === true, pack, owner: body.result });
      const res = await stub.draft(ask);
      let drafted = null;
      try { drafted = await res.json(); } catch { drafted = null; }
      if (!drafted || typeof drafted !== "object") return storeSilent(op);
      /* ai-runs R48: whatever the check answers, a conversation that reached the model is counted to the member's day */
      if (drafted.ok === true)
        await doAnswer(stub.fetch(new Request(`http://do/askusage?viewer=${encodeURIComponent(sessViewer)}`, { method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mode: "draft", usage: drafted.usage ?? null, calls: drafted.calls }) })));
      /* (T37; N669, K2201; instance-setup R67) a translation is checked by its owner (its placeholders), never here: its
         answered draft is handed to the owner's store-internal `translationdraftrecord`, with the door's stamps, and that
         route's answer is the op's. An ending or a silence is answered as for the other two, and nothing is recorded. */
      if (op === TRANSLATION_DRAFT) {
        if (drafted.ok !== true) {
          const { grant: _g, ...given } = drafted;
          return json({ ...given, ok: false, store: storeName, tokenClass: cls }, res.status >= 400 ? res.status : 502);
        }
        const at = new URL(`http://x/${TRANSLATION_RECORD}`);
        for (const k of ["by", "viewer"]) if (inner.searchParams.has(k)) at.searchParams.set(k, inner.searchParams.get(k));
        /* K2238 (3d): the hand-back's body is instance-setup's — the asked `keys` (or `key`) beside what the owner answered
           and what agent-worker drafted — and it re-runs its refusals before recording anything */
        const handed = { direction: ask.direction, language: ask.language,
                         ...(Array.isArray(asked.keys) ? { keys: asked.keys } : {}), ...(asked.key !== undefined ? { key: asked.key } : {}),
                         words: ask.words, draft: drafted.draft ?? null,
                         ...(Array.isArray(drafted.not_drafted) ? { not_drafted: drafted.not_drafted } : {}) };
        const recorded = await doAnswer(stub.fetch(new Request(at, { method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify(handed) })));
        if (recorded.refused) return storeRefusal(recorded, { store: storeName, tokenClass: cls });
        if (!recorded.answered) return storeSilent(TRANSLATION_RECORD, recorded.correlation);
        return json({ ...recorded.reply.body, store: storeName, tokenClass: cls }, recorded.reply.status);
      }
      const shaped = checkedDraft(ask, drafted, res.status, sessViewer);
      return shaped.body.ok === true ? json({ ok: true, result: shaped.body, store: storeName, tokenClass: cls }, 200)
        : json({ ...shaped.body, store: storeName, tokenClass: cls }, shaped.status);
    }
    /* K383 (capture's C-118.2): an inbox read or disposition naming no knock answers 404, as NO_SUCH_BUNDLE does. */
    if ((op === "inboxget" || op === "inboxresolve") && body.result?.ok === false && body.result.reason === "NO_SUCH_KNOCK")
      return json({ ...body, store: storeName, tokenClass: cls }, 404);
    /* R36 (capture R65): the pull's refusals carry their status (400, 403, 404, 409, 500, 502, 503), which its answer takes;
       so do the resolve's `RESOLVE_NO_REASON` (capture R32, C-118.7) and the held acts' refusals (capture R79, R81: C-118.8,
       C-118.9, the id count, the named ids). A refusal stating no status in that range answers the forward's own. */
    const hinted = body.result?.status;
    if (STATED_STATUS_OPS.includes(op) && body.result?.ok === false && Number.isInteger(hinted) && hinted >= 400 && hinted < 600)
      return json({ ...body, store: storeName, tokenClass: cls }, hinted);
    return json({ ...body, store: storeName, tokenClass: cls }, status);
  }
}
export { PUBLISHED_STORE, sha256Hex, fingerprint, caseReader, reviewAnswer, captureKey, migrationReplayOf, DRIVE_PROVENANCE_PATH,
         storageAbsent, PLANE_LIMITS, PLANE_LIMITS_STATEMENT };
/* K624 (1), (2): admission's namespace names, read through this door by plane's hooks and by the fleet members' pin
   (`members-pin.test.mjs`); the door itself calls admission directly. */
export { SCRATCH, NAMESPACES } from "../admission/index.mjs";
