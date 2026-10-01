import { publicInstanceGroup, instanceGroupOp, groupIdentityOp, bootstrapOp, INSTANCE_SETUP_OPS,
         instanceSetupOp } from "./setup.mjs";
import { caseRatifyStatement, NS_RATIFY } from "./sshsig.mjs";
/* REC-46 (2026-08-04): the two prefixes this file STAMPS on a machine
   credential now come from the catalog rather than being typed here twenty
   times. This is the trust boundary and the mint, so it is where the value used
   to live — but store.mjs held a copy of one of them and the catalog's gate
   knew about NEITHER, which is how `asserted_by: token:member` reached the
   record through op=promote (REC-45's measurement). One home, one spelling: a
   refusal that reads one literal while the stamp writes another is exactly the
   drift D-164 exists to stop. Nothing on the wire moves — the composed stamps
   are character-identical while the prefixes are `token:` and `class:`. */
/* D-270 / C-61: the argument complaint's row, used AS A VALUE at the one governed site — the code is a STRING
   LITERAL there so the DEC-49 guard's arm C can COMPARE it rather than read past a variable. */
import { MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX } from "../checks/bio-checks.mjs";
import { bindPublishedPlane, assembleCaseContainer } from "./publication/worker.mjs";
import { publicReadDoorOp } from "./public-read/door.mjs";
import { publicationDoorOp } from "./publication/door.mjs";
import { affordancesOp } from "./affordances.mjs";
/* REC-48 / DEC-39: op=acquire's `note` is COMPOSED from the enforced capture
   ceiling rather than spelled here. It is not the attest fence and is not
   `ATTEST_FENCE` — a different act, a different reader — but it states the same
   doctrine, so its two grade letters come from the same place the refusal reads
   them. N80 (T8): the note is capture's (`acquireGradeNote`, capture's Provides), composed where acquire is. */
import { queueAnswer } from "./queue/index.mjs";

import { registerAuditOp, attestOp } from "./provenance/ops.mjs";
import { withBiasChecks } from "./bias/index.mjs";
import { GOVERNOR_OPS, governorOpResponse } from "./host-governor/index.mjs";
import { capturePublicOp } from "./capture/doorbell.mjs";
import { captureOp } from "./capture/ops.mjs";
import { monitorOp } from "./monitoring/index.mjs";
import { EXTRACTION_OPS, extractionOp, acquireReadingOp } from "./extraction/ops.mjs";
import { CONNECTIONS_OPS, connectionsOp } from "./connections/ops.mjs";
import { ratificationOp } from "./ratification/ops.mjs";
/* N348 (control-plane R35): the Durable Object class is control-plane's, which starts instance-setup and routes its ops
   inside the store's one frame. */
export { Store } from "./control-plane/dispatch.mjs";
export { PUBLISHED_TOKEN_HASHES, liveToken } from "./tokens.mjs";
export { PLANE_LIMITS } from "./control-plane/index.mjs";

// T12 (control-plane's extraction, K3, K93): the op declarations, the doors, the gates, the stamps and the envelope are
// control-plane's. What stays here is the arms whose modules have not taken them yet; control-plane routes to them.
import { makeFetch, json, doAnswer, storeSilent, storeRefusal, relayAnswer, STORE_SILENT_REASON, STORE_SILENT_DETAIL, PUBLISHED_STORE,
         SCRATCH, sha256Hex, classify, scopeFor, caseReader, captureKey, installationRow, requiredArgument } from "./control-plane/index.mjs";
import { decorateAct, ACT_GATE } from "./control-plane/ops.mjs";



/* THE CAPABILITY COMPLAINT (C-68.1, D-278). A copy installed with no evidence
 * storage bound cannot serve `capture`, `pdfstructure`, `acquire` or `attest`.
 * ONE row for the four, the op named beside it, minted here rather than at four
 * sites inside `fetch` for the same reason `requiredArgument` is: a DEC-49 row
 * holds one `where`. `error` is passed in BYTE-IDENTICAL from each site — the
 * sites said two different sentences before this and still do. */
function storageAbsent(op, error) {
  /* DEC-49 REGION is-storage-absent */
  return json({ ok: false, reason: "EVIDENCE_STORAGE_NOT_CONFIGURED",
                ...installationRow("EVIDENCE_STORAGE_NOT_CONFIGURED"), error, op }, 503);
  /* END DEC-49 REGION is-storage-absent */
}

bindPublishedPlane({ json, doAnswer, storeSilent, storeRefusal, requiredArgument, STORE_SILENT_REASON,
                    STORE_SILENT_DETAIL, PUBLISHED_STORE });

/* The public ops whose handlers are still here (control-plane R1, R2). */
async function publicOp({ req, url, env, op, stub, invStub, fp, presentedAi }) {
      if (op === "login") {
        const body = await req.json().catch(() => ({}));
        const r = await stub.fetch(new Request("http://do/login", {
          method: "POST", body: JSON.stringify({ role: body.role || "admin", password: body.password }) }));
        return relayAnswer(r, "login");   /* control-plane R24 (D-679) */
      }
      if (op === "invitelook") {
        const body = await req.json().catch(() => ({}));
        const r = await invStub.fetch(new Request("http://do/invitelook", {
          method: "POST", body: JSON.stringify(body) }));
        return relayAnswer(r, "invitelook");   /* control-plane R24 (D-679) */
      }
      if (op === "enroll") {
        const body = await req.json().catch(() => ({}));
        const r = await invStub.fetch(new Request("http://do/enroll", {
          method: "POST", body: JSON.stringify(body) }));
        return relayAnswer(r, "enroll");   /* control-plane R24 (D-679) */
      }
      { const pr = await publicReadDoorOp(op, url, env, stub, { json, requiredArgument, storeSilent, storeRefusal, doAnswer }); if (pr) return pr; }

      /* ===== REC-163 / IC-174: op=instancegroup — THE PRODUCING GROUP, AND ITS SLUG IS PUBLIC ================
         `BIO_Publication_v0_1.md` §7 point 1 (BOB #24, 2026-09-21). WHO ASKS DECIDES WHICH PROJECTION, NEVER
         WHETHER:
           - a caller holding a credential the admission gate would admit to this read — a machine class in its
             own namespace, a session, an agent credential in scope — is answered the store's WHOLE ROW, provenance
             included, exactly as before this item. `caseReader` decides it, the one resolver of "who is asking"
             this branch already has, asked about the store this read addresses;
           - anybody else is answered the PUBLIC projection — the slug, or the statement that none is recorded,
             and nothing else — through `publicInstanceGroup`, the read the setup page makes too.
         WHICH STORE: the namespace a machine credential is confined to or names (`scopeFor`'s rule, so a probe
         naming nothing still reads `scratch`), and for every other caller `store=scratch` when named and `bio`
         otherwise, the invitation ops' rule — the slug is the same public fact either way. The answer says which
         store answered. A SILENCE IS A SILENCE (REC-52): never "no group is recorded", on either arm. */
      if (op === "instancegroup") {
        const held = url.searchParams.get("token");
        const heldCls = held ? await classify(held, env) : null;
        const heldScope = heldCls ? scopeFor(heldCls, url) : null;
        const igStore = heldScope && !heldScope.error ? heldScope.name
          : (url.searchParams.get("store") === SCRATCH ? SCRATCH : "bio");
        const igReader = await caseReader(url, env, igStore, presentedAi.cred);
        if (igReader.silent) return storeSilent(igReader.silent, igReader.correlation);
        return instanceGroupOp(env, igStore, igReader, { json, storeSilent, storeRefusal, doAnswer });
      }

      /* ===== REC-164: op=groupidentity — THE DISPLAY NAME AND THE VERIFIED DOMAIN, BESIDE THE PUBLIC SLUG =========
         `BIO_Publication_v0_1.md` §7 points 2 and 3. op=instancegroup's rule for WHO and WHICH STORE, unchanged: a
         caller the admission gate would admit is answered the claim, its latest verdict and both dated histories
         (§7: "members see the claim and its state"); anybody else the public projection — the slug, the display
         name only beside a slug, and a domain only while its latest verdict is `verified`. A silence is a silence. */
      if (op === "groupidentity") {
        const held = url.searchParams.get("token");
        const heldCls = held ? await classify(held, env) : null;
        const heldScope = heldCls ? scopeFor(heldCls, url) : null;
        const giStore = heldScope && !heldScope.error ? heldScope.name
          : (url.searchParams.get("store") === SCRATCH ? SCRATCH : "bio");
        const giReader = await caseReader(url, env, giStore, presentedAi.cred);
        if (giReader.silent) return storeSilent(giReader.silent, giReader.correlation);
        return groupIdentityOp(env, giStore, giReader, { json, storeSilent, storeRefusal, doAnswer });
      }

      { const pd = await publicationDoorOp(op, url, stub, { json, storeSilent, storeRefusal, doAnswer, sha256Hex, NS_RATIFY, caseRatifyStatement, readerOf: () => caseReader(url, env, "bio", presentedAi.cred) }); if (pd) return pd; }

      /* 7b. Anyone, no token, no session. Size-capped, rate-limited, and
         confined to the inbox namespace: payload bytes land under
         bio/inbox/<sha256> in the working bucket and nowhere else, the way
         probe is confined to scratch. Nothing is read back out except by a
         signed-in member. */
      { const knocked = await capturePublicOp(op, req, env, stub, { json, requiredArgument, storeSilent, storeRefusal, doAnswer }); if (knocked) return knocked; }
      return bootstrapOp(url, env, fp, { stub, json, storeSilent, storeRefusal, doAnswer });
}

/* The admitted ops whose handlers are still here; undefined for control-plane's generic forward. */
async function gatedOp({ req, url, env, op, cls, viaSession, sessMember, sessViewer, sessIdentity, sessRights, sessCaps,
                        aiCred, storeName, stub }) {

    if (op === "affordances") {
      /* REC-25: the D-15 viewer stamp, server-side from the authenticated
         identity exactly as the passthrough reads take it below. An object the
         viewer may not see answers NO_SUCH_BUNDLE, identical to an absent one. */
      const affViewer = viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`;
      /* REC-132: D-310's owner fact is POSITIONAL, so it is asked of the identity.
         REC-134: an `ai` credential's identity is its PRINCIPAL here, as it is at every act the
         positional check reads (`POSITIONAL_ACTS` below) — a member-scoped key acts as its
         member and is refused where its member would be, so the pre-flight must ask the same
         member or it offers `cite`/`sever`/`reinstate` the act then refuses (DEC-8). The VIEWER
         (sight) is unchanged; an organisation-scoped key's principal is `class:ai` and answers
         null, byte-unchanged. */
      const affIdentity = viaSession ? sessIdentity
        : cls === "ai" ? aiCred.principal
        : `${MACHINE_CLASS_PREFIX}${cls}`;
      /* D-311: THE TWO ACT STAMPS, composed by the SAME expressions the acts receive them by —
         `author` as the object-directed acts' author stamp (a bearer is `token:<cls>`), `by` as the
         roster acts' `by` stamp (a bearer is `class:<cls>`, the `ai` class included, whose
         `identity` above is its member principal). The store asks the machine fences' predicate of
         the first and the roster predicates of the second, so the pre-flight asks each question of
         the caller the act will see. `d311-roster-affordances.test.mjs` pins these two expressions
         to the stamp sites' own text. */
      const affAuthor = viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`;
      const affBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
      return affordancesOp(url, env.STORE.get(env.STORE.idFromName(storeName)), { json, doAnswer, storeSilent, storeRefusal,
        gate: ACT_GATE, viewer: affViewer, identity: affIdentity, author: affAuthor, by: affBy, storeName, cls });
    }

    /* op=queue (REC-20, ruled by DEC-16). The member's ONE feed: OBLIGATIONs
       from `tasks` and FINDINGs from the proposals derivation, in one contract,
       each with the case set it belongs to and the acts available on its
       subject.

       Composed the way op=affordances is, and for the same reason: the store
       derives the ITEMS and the homes (it holds the edges and the D-15
       predicate), and the act metadata is added HERE, where NEEDS and SESSION_OPS
       live — through decorateAct, the SAME function op=affordances uses (the
       rungs are affordances'), so the two answers cannot drift.

       TWO server-side stamps, both set AFTER nothing of the caller's is read,
       because either one taken from the request would defeat the other:
         - `member` decides WHOSE obligations these are. A caller who could name
           the member could read anyone's queue.
         - `viewer` decides which case names the answer may contain. D-15 has
           exactly one compilation point and this is the only place the identity
           enters it; the store fails closed, so a missing stamp yields an
           ungrouped feed rather than an unfiltered one.
       A machine credential has no member behind it, so it stamps `member` empty
       and receives the whole live set — the operator view the token exists for,
       and the same carve-out D-15 makes for a machine viewer. */
    if (op === "queue") {
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      const inner = new URL("http://do/queue");
      inner.searchParams.set("viewer", viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`);
      inner.searchParams.set("member", viaSession ? sessMember : "");
      for (const k of ["now", "limit"]) {
        const v = url.searchParams.get(k);
        if (v !== null) inner.searchParams.set(k, v);
      }
      /* REC-52: `(r || { reason: "NO_QUEUE" })` — a store silence reported to a
         member as a statement that there is no queue. It refused with `ok:false`
         rather than a false success, so it is the milder half of the class and
         it is still the plane inventing a word the store never said. */
      const qOut = await doAnswer(st.fetch(inner.toString()));
      if (qOut.refused) return storeRefusal(qOut);
      if (!qOut.answered) return storeSilent("queue", qOut.correlation);
      const r = qOut.result;
      if (!r) return storeSilent("queue");
      /* N231 (affordances R26): op=affordances' vocabularies, `action_kind` asked of `actions` at this call. */
      const qkOut = await doAnswer(st.fetch("http://do/actionkinds"));
      if (qkOut.refused) return storeRefusal(qkOut);
      if (!qkOut.answered) return storeSilent("queue", qkOut.correlation);
      if (r.ok !== true)
        return json({ ok: false, ...r, store: storeName, tokenClass: cls }, 400);
      return json({ ok: true, result: queueAnswer(r, { gate: ACT_GATE, kinds: qkOut.result?.kinds }).result, store: storeName, tokenClass: cls }, 200);
    }

    if (op === "registeraudit") return registerAuditOp(env, env.STORE.get(env.STORE.idFromName(storeName)),
      { json, doAnswer, storeSilent, storeRefusal, captureKey, storeName, cls });

    if (INSTANCE_SETUP_OPS.includes(op)) return instanceSetupOp(op, url, env, storeName, { cls, scratch: SCRATCH, json, doAnswer,
      storeSilent, storeRefusal, viewer: viaSession ? sessViewer : cls === "ai" ? aiCred.principal : `${MACHINE_CLASS_PREFIX}${cls}` });


    /* capture is the one op that moves bytes. PUT or POST writes capture
       content to the working bucket, content-addressed by its SHA-256 and
       verified server-side against the received body, so a caller can never
       land bytes under the wrong name. Existing keys are immutable: a re-put
       of identical content answers ok with existed true and writes nothing.
       GET reads the bytes back and honours a Range header. The DO is not
       involved: the register row that NAMES a capture travels inside a
       promote package; this op only moves the bytes the row names. Keys live
       under `<store>/captures/<sha256>`, so probe confinement to the scratch
       store confines its captures mechanically, the same way as everything
       else. Publishing to the PUBLISHED bucket is the publisher's act during
       ratification and deliberately has no op here. */
    /* What a captured document pointed at, resolved against the store as it
       stands NOW rather than as it stood at capture. That is deliberate: which
       partition a link falls in depends on what the record holds, and the
       record changes, so the answer is computed at read time and never frozen
       into the capture. */

    if (CONNECTIONS_OPS.includes(op)) return connectionsOp(op, url, () => env.STORE.get(env.STORE.idFromName(storeName)), { json, doAnswer, storeRefusal, storeSilent,
      viewer: viaSession ? sessViewer : cls === "ai" ? aiCred.principal : `${MACHINE_CLASS_PREFIX}${cls}`,
      identity: viaSession ? sessIdentity : cls === "ai" ? aiCred.principal : `${MACHINE_CLASS_PREFIX}${cls}` });

    if (GOVERNOR_OPS.includes(op)) return governorOpResponse(op, url, () => env.STORE.get(env.STORE.idFromName(storeName)), { json, doAnswer, storeRefusal, storeSilent });

    {
      const c = await captureOp(op, req, url, env, () => env.STORE.get(env.STORE.idFromName(storeName)), { json, storeSilent, storeRefusal,
        doAnswer, storageAbsent, requiredArgument, cls, member: viaSession, sessMember, storeName, key: (s) => captureKey(storeName, s),
        viewer: viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`,
        readAcquired: (answer, store) => acquireReadingOp(answer, store, { json, storeSilent, storeRefusal, doAnswer, storeName }) });
      if (c) return c;
    }

    if (EXTRACTION_OPS.includes(op)) return extractionOp(op, url, env, () => env.STORE.get(env.STORE.idFromName(storeName)),
      { json, storeSilent, storeRefusal, doAnswer, storageAbsent, requiredArgument, cls, session: viaSession, caps: sessCaps,
        viewer: viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`,
        author: viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`, storeName });

    if (op === "attest") return attestOp(req, env, env.STORE.get(env.STORE.idFromName(storeName)),
      { json, doAnswer, storageAbsent, captureKey, storeName, cls });

    if (op === "monitor") return monitorOp(req, env.STORE.get(env.STORE.idFromName(storeName)), { json, storeSilent, storeRefusal, requiredArgument, doAnswer, viaSession, sessViewer, storeName, cls });


    return ratificationOp(op, req, stub, { env, json, doAnswer, storeSilent, storeRefusal, storeName, cls, aiCred, viaSession, sessViewer, sessRights, withBiasChecks, STORE_SILENT_REASON, STORE_SILENT_DETAIL });
}

export default { fetch: makeFetch({ publicOp, gatedOp,
  publicInstanceGroup: (env, storeName, projection) => publicInstanceGroup(env, storeName, projection, doAnswer) }) };
