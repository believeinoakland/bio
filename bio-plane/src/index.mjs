import { SCHEMA } from "./schema.mjs";
import { livefire } from "./livefire.mjs";
import { setupPage } from "./setup.mjs";
import { SIGN_HTML } from "./signpage.mjs";
import { liveToken } from "./tokens.mjs";
import { GATE_VERSION } from "./gate.mjs";
import { ratifyStatement, caseRatifyStatement, NS_RATIFY } from "./sshsig.mjs";
/* REC-128: who DELIVERED an attested act, read off the SESSION, and its read shape. */
/* The locator fence, taken from the catalog rather than restated: https only,
   public hosts only, no credentials in the authority, no bare IPs, no localhost.
   It is the one bound between a member typing a URL and this Worker fetching it,
   so it must be the same function the checker uses on the queue. */
/* REC-50: `EARNED_CAPTURE_CEILING` arrives on the same import for the same
   reason — op=acquire STAMPS the direct-fetch capture grade, and the letter it
   stamps is the ceiling `checkEarnedLeg` enforces rather than a copy that
   happens to agree. One value, read where it is refused. */
/* REC-46 (2026-08-04): the two prefixes this file STAMPS on a machine
   credential now come from the catalog rather than being typed here twenty
   times. This is the trust boundary and the mint, so it is where the value used
   to live — but store.mjs held a copy of one of them and the catalog's gate
   knew about NEITHER, which is how `asserted_by: token:member` reached the
   record through op=promote (REC-45's measurement). One home, one spelling: a
   refusal that reads one literal while the stamp writes another is exactly the
   drift D-164 exists to stop. Nothing on the wire moves — the composed stamps
   are character-identical while the prefixes are `token:` and `class:`. */
import { parseFrontmatter, createSha256, normalizeType,
         EARNED_CAPTURE_CEILING,
         /* PL-4: the ONE composer for the honest agent, and the capture-request
            arm's DEC-49 row. Both live in the catalog so the Durable Object's
            drain and this control plane cannot disagree about what was sent. */
         civicosUserAgent, CAPTURE_REQUEST_CHECKS,
         /* D-270 / C-61: the argument complaint's row. Named rather than reached
            through the namespace below, because it is used AS A VALUE at the one
            governed site — the code is a STRING LITERAL there so the DEC-49
            guard's arm C can COMPARE it rather than read past a variable. */
         REQUIRED_ARGUMENT_CHECKS,
         /* CAP-8 / C-48: the Google Drive host stack's DEC-49 rows. Every one is
            a NAMING — a folder, a kind the address does not carry, a shape this
            recogniser does not read, the application shell, an export that could
            not be fetched, and a caller trying to author the hop (D-112). The
            item's rule is that none of these is ever a silent skip. */
         DRIVE_CAPTURE_CHECKS,
         /* D-64 / C-83: the render arm's DEC-49 rows. */
         RENDER_CAPTURE_CHECKS,
         MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX,
         /* REC-123: the ONE machine-identity predicate (REC-46), asked by the two
            ratification fences of the stamp an `ai` credential acts under. */
         isMachineIdentity } from "../checks/bio-checks.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "./publication/worker.mjs";
import { publishedGraphEdges } from "./publication/index.mjs";
import { inbandQuartet } from "./inband.mjs";   /* REC-148: DEC-31's in-band quartet, one function */
/* CAP-8: the Google Drive HOST STACK, enacting Bob's ruling of 2026-09-14 — a
   link to a Drive file KEEPS THE LINK and the harvest is the OpenDocument export.
   `drive.mjs` is PURE (no fetch, no store, no registry): it reads an address's
   shape and composes the export address from the file id and the kind, and it
   builds the hop from what the plane itself derived. Nothing about the hop's
   three facts — export address, export format, producer — is readable off a
   request body, and `callerSuppliedHopFacts` makes an attempt to supply one a
   NAMED refusal rather than a silent drop (D-112). */
import { odfEvidentiaryDigest, ODF_FORMATS } from "./odf.mjs";
import { driveHop, callerSuppliedHopFacts,
         DRIVE_PRODUCER, driveConvertStep } from "./drive.mjs";
/* REC-19 / DEC-8: the act catalogue and derivation behind op=affordances. The
   catalogue reads the legal-edge table from the check catalogue (exported,
   never copied); `needs` and `mode` are composed HERE from NEEDS and
   SESSION_OPS, the tables that actually gate the call, so the publication and
   the gate cannot drift. */
/* N177 (T8, affordances R11): the act decoration is affordances' `decorate(act, gate)`; this file supplies the gate
   from the tables that actually gate the call (`ACT_GATE`, beside `NEEDS`). */
/* N231 (affordances R26, actions R42): the vocabularies are `vocabulariesFor(kinds)`, `action_kind` the kinds this
   instance's `actions` answers at the call (its `actionkinds` route, asked by op=affordances and op=queue below), never a
   copy held here. */
import { ACTS, CAPTURE_ACTS, PER_ITEM_ACTS, PER_ITEM_MAX, deriveActs, decorate, vocabulariesFor } from "./affordances.mjs";
/* REC-48 / DEC-39: op=acquire's `note` is COMPOSED from the enforced capture
   ceiling rather than spelled here. It is not the attest fence and is not
   `ATTEST_FENCE` — a different act, a different reader — but it states the same
   doctrine, so its two grade letters come from the same place the refusal reads
   them. N80 (T8): the note is capture's (`acquireGradeNote`, capture's Provides), composed where acquire is. */
import { ACQUIRE_GRADE_NOTE } from "./capture/index.mjs";
import { queueAnswer } from "./queue/index.mjs";
import { captureSubresources, normalizeAddress, normalizeCitation } from "./subresources.mjs";
/* D-64: the render arm's pure half and its renderer seam. */
import { RENDER_DEFAULTS, completenessReading, keepRenderBodies, renderAllowanceMs,
         renderConcurrencyCap, renderBlock,
         renderedAuthority, renderReserveMs, rendererFor } from "./render.mjs";
/* COFF-1 (I7): the FORMAT registry is the ONLY format dispatch in this file.
   pdfstructure.mjs is no longer imported here — it is the registry's pdf
   entry, reached through getFormat("pdf").structure with byte-identical
   output; the acquire-time subresource guard and the profile's format stamp
   consult detectFormat. A new format costs one registerFormat() in
   formats.mjs and NO edit here — the D-70 test, and formats.test.mjs holds
   the evidence. */
import { detectFormat, getFormat, readingDialect } from "./formats.mjs";
import { parseCdx, selectCapture, replayLocator, cdxQuery, archiveHop } from "./cdx.mjs";
/* docprofile is READ here, never copied. This is the FIRST plane consumer of it
   (CONSTRUCTS Step 1 / FW-3): op=acquire calls identify() and doctypeFor() to
   RECORD which host stack and which content type the record thinks it holds, so
   a judgment can later be found and revised when its recogniser turns out wrong.
   The package lives outside bio-plane/, which costs the deployed artifact nothing
   (I4): esbuild inlines it at build, and the miniflare battery resolves it from
   disk (modulesRoot "/"). profileRecord serialises the stack axis; the doctype
   axis is added beside it at the call site.

   CONSTRUCTS Step 2 / FW-4 also reads docprofile's `digests()` — the ONE
   implementation of the three normalisation digests, never a second copy — and
   `CONFIDENCE` (the single ladder) to gate whether a normalised digest can be
   trusted to assert two documents are the same substance. */
import { identify, doctypeFor, profileRecord, digests, CONFIDENCE, readText, CONTRACT } from "../../docprofile/registry.mjs";

/* PL-4: `delegated` is the MEMBER'S OWN BROWSER AGENT and the only caller that
 * may supply one is the capture-request arm, which reads it from a request row
 * the drain has already judged — never from a request body. BOB-3 (DEC-47's
 * access-parity amendment) permits it for publicly available documents because
 * delegating an agent a member actually uses is a member speaking as themselves
 * through a tool they run; SOURCE-ACCESS.md's line is AUTHORSHIP, and a
 * fabricated string invents a client that does not exist. Every other call site
 * passes nothing and gets the honest CivicOS string, which stays the default for
 * all other traffic. */
async function governedFetch(env, stub, target, purpose, delegated = null) {
  return fetchGoverned(target, { userAgent: userAgent(env, purpose, delegated), fetch: (...a) => fetch(...a),
                                 governor: stub ? governorOverStub(stub) : null });
}
import { cpuProbe } from "./cpu.mjs";
import { Store } from "./store.mjs";
import { attest, attestStatus, registerAuditReport } from "./provenance/index.mjs";
import { withBiasChecks } from "./bias/index.mjs";
import { governedFetch as fetchGoverned, governorOverStub, governorOp } from "./host-governor/index.mjs";
import { knockOp } from "./capture/doorbell.mjs";
import { userAgent } from "./capture/acquire.mjs";
import { linksOp, captureObjectOp, archiveLookupOp, acquireOp } from "./capture/ops.mjs";
import { monitorOp } from "./monitoring/index.mjs";
import { pdfStructureOp, acquireReadingOp } from "./extraction/ops.mjs";
import { caseRatifyOp, ratifyOp } from "./ratification/ops.mjs";
export { Store };
export { PUBLISHED_TOKEN_HASHES, liveToken } from "./tokens.mjs";

// T12 (control-plane's extraction, K3, K93): the op declarations, the doors, the gates, the stamps and the envelope are
// control-plane's. What stays here is the arms whose modules have not taken them yet; control-plane routes to them.
import { makeFetch, json, doAnswer, storeSilent, relayAnswer, StoreSilent, STORE_SILENT_REASON, STORE_SILENT_DETAIL, PUBLISHED_STORE,
         SCRATCH, sha256Hex, classify, scopeFor, caseReader, captureKey, installationRow } from "./control-plane/index.mjs";
import { decorateAct, ACT_GATE } from "./control-plane/ops.mjs";

/* REC-163 / IC-174 — THE PUBLIC READ OF THE PRODUCING GROUP, ONE READER FOR THE TWO SURFACES THAT SHOW IT TO A
   STRANGER: op=instancegroup's public arm and the setup page served at `/`. `BIO_Publication_v0_1.md` §7 point 1:
   the slug is PUBLIC. It asks the store's `instanceGroupPublic`, which selects nothing but the slug through the one
   reader every stamp uses, so the page, the op and the bytes of every document this store creates name ONE group.
   Answers `doAnswer`'s `{ answered, result }`, and a silence is the caller's to state AS a silence. An instance with
   no store binding at all cannot be asked, and that is a silence too: the page it serves must still be served.

   D-596 — WHICH PUBLIC PROJECTION IS THE CALLER'S TO NAME, AND THERE ARE EXACTLY TWO. op=instancegroup's public arm
   keeps `instancegrouppublic`, the slug and nothing else (REC-163's contract, its key set pinned by group-public's
   G1/G2/C3/C5). The setup page names `groupidentitypublic`, the projection op=groupidentity answers a stranger
   (REC-164): the slug, the display name only beside a slug, and a domain only while its latest verdict is `verified`,
   dated. Both read the slug through the store's one `#producingGroup()` reader, so the page and the op still name
   ONE group. THE DEFECT: the page read `instancegrouppublic` alone, so it showed the slug and never the name or the
   verified domain, while op=groupnameset's answer told the administrator every public surface shows the name beside
   the slug. Any other value is answered as a silence rather than forwarded, so a typo cannot reach a DO path. */
const PUBLIC_GROUP_PROJECTIONS = ["instancegrouppublic", "groupidentitypublic"];
async function publicInstanceGroup(env, storeName, projection = "instancegrouppublic") {
  if (!PUBLIC_GROUP_PROJECTIONS.includes(projection)) return { answered: false, result: undefined };
  let stub = null;
  try { stub = env.STORE.get(env.STORE.idFromName(storeName)); } catch { stub = null; }
  if (!stub) return { answered: false, result: undefined };
  return doAnswer(stub.fetch(`http://do/${projection}`));
}


/* D-116 — EACH FLEET MEMBER'S BUILD, READ BACK THROUGH THE BINDING THIS PLANE ACTUALLY HOLDS.
 *
 * A member versions and rolls out on its own (`BIO_Distribution_v0_1.md` §4 rule 1), and an installer that uploaded
 * one has only Cloudflare's word that it landed — never the member's, and never the PLANE's view of it, which is the
 * one that decides whether a group's PDFs, OCR and assistant do what every description of them says (D-115). So the
 * question is asked where it matters: over `env.<BINDING>`, `GET /version`, the route every member has served since
 * CPDF-9 / FL-2 / CPDF-10. Each answer is the MEMBER'S OWN reply — its `name` and `version` fields, copied — and never
 * this isolate's env.VERSION: a plane that filled these in from its own env would make every member agree for free.
 *
 * States, per member, each a first-class statement rather than a missing key:
 *   SERVING   the member answered through the binding, under its own name, with `version`.
 *   UNBOUND   this plane holds no binding by that name — the member is unreachable FROM HERE whatever the account holds.
 *   SILENT    bound, and it did not answer a readable version within the bound (`why` says what happened).
 *   MISNAMED  something answered through the binding, but under another name — the binding points at the wrong worker.
 * Read only on `op=bootstrap&members=1`, so the anonymous answer a browser polls does not fan out to three workers. */
const FLEET_BINDINGS = [["agent-worker", "AGENT_WORKER"], ["pdf-worker", "PDF_WORKER"], ["ocr-worker", "OCR_WORKER"]];
const MEMBER_VERSION_WAIT_MS = 4000;
async function memberVersions(env) {
  const out = {};
  await Promise.all(FLEET_BINDINGS.map(async ([member, binding]) => {
    const b = env[binding];
    if (!b || typeof b.fetch !== "function") { out[member] = { binding, state: "UNBOUND" }; return; }
    let timer;
    try {
      const r = await Promise.race([
        b.fetch(`https://${member}/version`, { method: "GET" }),
        new Promise((_, no) => { timer = setTimeout(() => no(new Error(`no answer within ${MEMBER_VERSION_WAIT_MS} ms`)),
                                                    MEMBER_VERSION_WAIT_MS); }),
      ]);
      const j = await r.json().catch(() => null);
      if (!r.ok || !j || typeof j.version !== "string" || !j.version) {
        out[member] = { binding, state: "SILENT", why: `answered HTTP ${r.status} without a version` };
      } else if (j.name !== member) {
        out[member] = { binding, state: "MISNAMED", name: typeof j.name === "string" ? j.name : null, version: j.version };
      } else {
        out[member] = { binding, state: "SERVING", version: j.version };
      }
    } catch (e) {
      out[member] = { binding, state: "SILENT", why: String(e && e.message || e).slice(0, 200) };
    } finally { clearTimeout(timer); }
  }));
  return out;
}

/* D-270 / C-61: the argument complaint's row reader, `admissionRow`'s shape and
   its refusal to invent — a code with no sentence behind it throws here rather
   than reaching a member. */
const requiredArgumentRow = (code) => {
  const row = REQUIRED_ARGUMENT_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`requiredArgumentRow: ${code} has no REQUIRED_ARGUMENT_CHECKS row with a canned `
                  + `translation (DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};


/* THE ARGUMENT COMPLAINT (C-61). ONE code for the whole condition with the
 * argument in `argument` and the shape in `shape`, rather than a row per op —
 * `AI_BEYOND_TASK_SCOPE` is the standing precedent for one code whose producers
 * are told apart by a field.
 *
 * A HELPER RATHER THAN THREE EDITED SITES, for the `where` field's sake: a
 * DEC-49 row holds ONE `where` naming the SMALLEST SPAN, so a code minted at
 * three sites inside `fetch` could not name one honestly. */
function requiredArgument(op, argument, shape, error) {
  /* DEC-49 REGION is-required-argument
   * THE SPAN `REQUIRED_ARGUMENT_MISSING` names. Code a STRING LITERAL at its
   * site. `error` is passed in BYTE-IDENTICAL from the call site rather than
   * rebuilt from a template here, so all three legacy sentences survive this
   * change unaltered and no consumer reading `error` moves at all. */
  return { ok: false, reason: "REQUIRED_ARGUMENT_MISSING",
           ...requiredArgumentRow("REQUIRED_ARGUMENT_MISSING"),
           error, op, argument, shape,
           detail: `op=${op} needs '${argument}' in the shape ${shape}, and this request carried `
                 + `none the operation could use. Nothing was changed.` };
  /* END DEC-49 REGION is-required-argument */
}

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

/* D-533: `partsHeld`, the one rule for a capture held in parts, is provenance's (R7; imported above). */

bindPublishedPlane({ json, doAnswer, storeSilent, requiredArgument, StoreSilent, STORE_SILENT_REASON,
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
      /* 7a. Anyone, no token, no session. The DO consults only the
         published projection. */
      if (op === "verify") {
        const sha = (url.searchParams.get("sha256") || "").toLowerCase();
        if (!/^[0-9a-f]{64}$/.test(sha))
          /* D-278: C-61.1. `error` is written as a KEY here rather than passed into the helper, so the
             sentence stays readable where `preauth-vocabulary.test.mjs` reads it textually; the key after
             the spread is the one on the wire, byte-identical to the pre-D-278 answer. */
          return json({ ok: false, ...requiredArgument("verify", "sha256", "<64 lowercase hex>"),
            error: "verify requires sha256=<64 lowercase hex>" }, 400);
        /* REC-52, SITE (a). This read used to be
             `const out = await r.json(); return json({ ok: true, ...out.result }, 200);`
           with no look at `out.ok`, so a store failure left the plane as an
           HTTP 200 SUCCESS carrying nothing — no `published`, no `sha256`, no
           `matches` — and D-197's public verification surface rendered that as
           "NOT PUBLISHED … a hash that was never ratified and a hash that never
           existed are the same answer here, deliberately", a sentence that is
           true of a real absence and false of a silence. */
        const out = await doAnswer(stub.fetch(new Request(`http://do/verify?sha256=${sha}`)));
        if (!out.answered) return storeSilent("verify");
        return json({ ok: true, ...out.result }, 200);
      }
      /* Section 8.2. Anyone, no token, no session, and nothing to withhold.
         Published material is content-addressed and its hashes are public, so
         any member or any stranger rebuilds and independently verifies the
         published record without this instance's cooperation, permission, or
         continued existence. Reads the published projection ONLY, exactly as
         op=verify above does, which is the whole safety of an open endpoint:
         working material is never consulted, so there is nothing to leak. */
      if (op === "publishedmanifest") {
        /* REC-52, and this one was NOT in the item's scope — the sweep found
           it. The re-wrap read `result: (await r.json()).result`, so a store
           failure produced `{ok:true, result:undefined}`, and `JSON.stringify`
           DROPS an undefined value: `{ok:true}` at HTTP 200 again, by a
           different route from section 7a's spread. This is the op that fills
           the published INDEX, so the rendered consequence was the whole
           record rather than one hash — which is the shape UI-37 measured as
           the worst of its three. The WRAPPED envelope is preserved on the
           success path (auth-surface.test.mjs pins that it is not flattened). */
        const out = await doAnswer(stub.fetch(new Request("http://do/publishedmanifest")));
        if (!out.answered) return storeSilent("publishedmanifest");
        return json({ ok: true, result: out.result }, 200);
      }

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
        if (igReader.silent) return storeSilent(igReader.silent);
        if (igReader.viewer) {
          const igOut = await doAnswer(env.STORE.get(env.STORE.idFromName(igStore)).fetch("http://do/instancegroup"));
          if (!igOut.answered) return storeSilent("instancegroup");
          return json({ ok: true, result: igOut.result, store: igStore, tokenClass: igReader.cls }, 200);
        }
        const pubOut = await publicInstanceGroup(env, igStore);
        if (!pubOut.answered) return storeSilent("instancegroup");
        return json({ ok: true, result: pubOut.result, store: igStore }, 200);
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
        if (giReader.silent) return storeSilent(giReader.silent);
        const giOut = await doAnswer(env.STORE.get(env.STORE.idFromName(giStore))
          .fetch(giReader.viewer ? "http://do/groupidentity" : "http://do/groupidentitypublic"));
        if (!giOut.answered) return storeSilent("groupidentity");
        return json({ ok: true, result: giOut.result, store: giStore,
                      ...(giReader.viewer ? { tokenClass: giReader.cls } : {}) }, 200);
      }

      /* ============================================================         REC-22: THE PUBLIC READ PATH. Anyone, no token, no session, and — the
         part that matters — nothing withheld, because there is nothing here
         that was not deliberately published.

         WHY THIS IS SAFE WITHOUT A CREDENTIAL, stated once for both ops: every
         byte either op can reach comes from the published projection —
         published_bundles, published_shas, published_edges, and the PUBLISHED
         bucket, which the ratification act is the only writer of. The fence is
         structural in two independent layers (a table set and a bucket
         boundary), so it does not depend on a predicate being remembered. That
         is the property schema.mjs states those tables exist for, and REC-30's
         sweep classifies both ops as deliberately ungated for exactly it.

         PINNED TO `bio`, like op=verify and op=publishedmanifest above: an
         instance has ONE published record. A probe's `scratch` namespace has its
         own Durable Object and its own PUBLISHED prefix and is therefore NOT
         readable here, which is deliberate — rehearsing a publication must not
         put anything on the public surface. */
      /* ---- CASE-4 / DEC-72: op=caseflags ----
         WHICH PUBLISHED CASES ARE CARRYING A STALE PIN, AND WHICH OWNING
         PROJECTS HAVE ACTED. Placed with the public read path above and pinned
         to `bio` for its reason: every fact in the answer is already on the
         public surface, and an instance has ONE published record, so a probe's
         scratch namespace is deliberately not readable here.

         `case=` OR `target=` OR NEITHER, and neither is a whole-store sweep of
         the FLAG TABLE only — bounded by the number of revisions that have ever
         been made to a published member, which is a small number by
         construction and never a walk of the corpus. */
      if (op === "caseflags") {
        const q = new URLSearchParams();
        const cid = (url.searchParams.get("case") || "").trim();
        const tgt = (url.searchParams.get("target") || "").trim();
        if (cid) q.set("case", cid);
        if (tgt) q.set("target", tgt);
        if (url.searchParams.get("outstanding") === "1") q.set("outstanding", "1");
        if (url.searchParams.get("limit")) q.set("limit", url.searchParams.get("limit"));
        const fOut = await doAnswer(stub.fetch(`http://do/caseflags?${q}`));
        if (!fOut.answered) return storeSilent("caseflags");
        return json({ ok: true, result: fOut.result }, 200);
      }

      /* ===== CASE-5b / DEC-72: THE CASE-LEVEL SIGNING CEREMONY ================

         THE READ. A member cannot sign what they have not read, and the container
         manifest's constraint — *a case-level signature would be a signature over
         something nobody reviewed* — is answered by this op existing and by the
         document it hands back being the WHOLE document rather than a summary of
         it. The sha in the answer is the sha the signature covers. */
      if (op === "casedocument") {
        const caseId = url.searchParams.get("case") || "";
        const ed = url.searchParams.get("edition");
        if (!caseId || !ed)
          return json({ ok: false, reason: "MALFORMED",
                        detail: "casedocument requires case=<CASE-YYYY-NNNN> and edition=<n>" }, 400);
        /* REC-130: the viewer is STAMPED here from the credential and never read
           from the request — the inner URL is built from nothing of the caller's
           but the two keys. The store answers an unsigned document to standing
           and answers everybody else exactly as it answers a case that does not
           exist. */
        const reader = await caseReader(url, env, "bio", presentedAi.cred);
        if (reader.silent) return storeSilent(reader.silent);
        /* REC-126 / IC-145: A LIVE GRANT HOLDER is the second party §6A.2's
           precondition admits to an unsigned document. The secret is HASHED HERE
           and only its fingerprint crosses to the store, which judges it through
           the review copy's one live-grant predicate. Absent, the parameter is
           not sent at all and the answer is REC-130's, unchanged. */
        const docSecret = url.searchParams.has("secret") ? await sha256Hex(url.searchParams.get("secret") || "") : "";
        const out = await doAnswer(stub.fetch(
          `http://do/casedocument?case=${encodeURIComponent(caseId)}&edition=${encodeURIComponent(ed)}`
          + `&viewer=${encodeURIComponent(reader.viewer)}`
          + (docSecret ? `&secretSha=${docSecret}` : "")));
        if (!out.answered) return storeSilent("casedocument");
        const r = out.result;
        /* THE VERDICT IS DECLARED AS A LITERAL, FIRST, rather than inherited
           from the spread. D-240's detector grades a json() site by its first
           boolean-shaped property, and an answer whose verdict arrives only
           inside a spread reads as UNCLASSIFIED — which is a place this
           detector'"'"'s own subject could hide. The spread still carries the
           store'"'"'s own `ok`, so the two cannot disagree. */
        if (!r?.ok) return json({ ok: false, ...r }, 404);
        return json({ ok: true, ...r,
                      /* THE STATEMENT TO SIGN, PRINTED. It is the exact bytes
                         `caseRatifyStatement` builds, handed to the member so the
                         signer page, the wizard and a member at a terminal all
                         sign the same thing — the same service `op=ratify`'s own
                         clients get, one altitude up. */
                      sign: { namespace: NS_RATIFY,
                              statement: new TextDecoder().decode(
                                caseRatifyStatement(r.case_id, r.edition, r.doc_sha)) } });
      }


      if (op === "publishedcase" || op === "publishedbytes") return publishedRoutes({ op, url, env, stub });
      /* 7b. Anyone, no token, no session. Size-capped, rate-limited, and
         confined to the inbox namespace: payload bytes land under
         bio/inbox/<sha256> in the working bucket and nowhere else, the way
         probe is confined to scratch. Nothing is read back out except by a
         signed-in member. */
      if (op === "knock") return knockOp(req, env, stub, { json, requiredArgument, storeSilent, doAnswer });
      /* REC-52: the same spread as section 7a's. A store silence used to leave
         a `{ok:true}` carrying the service name, the version and the bootstrap
         flag and NOTHING the store knows — an instance answering "here is what
         I am" while unable to say anything about itself. The installer and
         `newgroup` both read this op (measured at newgroup/src/index.mjs:364
         and :631), so the false success reached a caller deciding whether an
         instance was ready. */
      const out = await doAnswer(stub.fetch(new Request(`http://do/bootstrap?fp=${fp}`)));
      if (!out.answered) return storeSilent("bootstrap");
      /* D-116 / IC (see INTERFACE-CHANGES.md): THREE BUILDS, EACH READ FROM WHERE IT RUNS. `version` is THIS routing
         isolate's; `storeVersion` arrives inside `out.result` from the Durable Object's own env (store.mjs, the
         `bootstrap` route) and is NEVER written here — filling it from `env.VERSION` would make the two agree for
         free, which is exactly the lie this field exists to prevent. `memberVersions` (on `members=1` only) is each
         fleet member's own reply through this plane's binding. */
      return json({ ok: true, service: "bio-plane", version: env.VERSION || "0.0.0",
                    bootstrapConfigured: await liveToken(env.ADMIN_TOKEN), ...out.result,
                    ...(url.searchParams.get("members") === "1" ? { memberVersions: await memberVersions(env) } : {}) },
                  200);
}

/* The admitted ops whose handlers are still here; undefined for control-plane's generic forward. */
async function gatedOp({ req, url, env, op, cls, viaSession, sessMember, sessViewer, sessIdentity, sessRights, sessCaps,
                        aiCred, storeName, stub }) {

    /* op=affordances (REC-19, DEC-8). THE plane-sourced act pre-flight: for
       this object as it stands, which acts exist — each with the capability it
       needs, how it is reached, its set-application weight and its declared
       ladder rung — plus the object vocabularies, so a surface renders what it
       received and keeps no copy of any of it.

       Composed HERE, not in the store, deliberately: the store reports FACTS
       (type, state, citation edges — through the same predicate retire's CITED
       refusal runs), and the act metadata comes from NEEDS and SESSION_OPS in
       this file plus the catalogue's exported state table. Nothing is asked of
       the caller and nothing here mutates.

       `rung` is DECLARED, never guessed, and since FW-14 it is also TOTAL: every
       op the dispatch table declares mutating either carries a rung or is named
       with the GROUND on which it has none, asserted in both directions by
       `test/rung-ladder.test.mjs`. So `rung: null` is now always accompanied by
       a non-null `rung_absence`, and the pair "no rung, no ground" is a shape
       the suite refuses to let exist. The line this replaces carried the figure
       "7 of 57 mutating ops have a source" — the 57 was never re-measured and
       the table declares 84, which is why the count now lives in the suite's
       printed corpus rather than in this comment.
       An `action` bundle returns an empty act list because nothing operates one
       until REC-24, and an empty list is the honest answer. */
    if (op === "affordances") {
      /* REC-20: op=queue's options[] and this answer come from the SAME function (decorateAct, affordances'
         `decorate` over this file's gate). */
      const target = url.searchParams.get("target");
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      /* N231 (affordances R26): `action_kind` is the kinds this instance's `actions` accepts at this call (actions
         R42), asked of the store; a silence is stated as one, never answered with the product's kinds (REC-52). */
      const kOut = await doAnswer(st.fetch("http://do/actionkinds"));
      if (!kOut.answered) return storeSilent("affordances");
      const vocabularies = vocabulariesFor(kOut.result?.kinds);
      if (!target) {
        /* No target: the whole catalogue and the vocabularies, the shape a
           surface loads once — searchfields' precedent exactly. */
        return json({ ok: true, result: {
          target: null,
          catalog: ACTS.map((a) => ({ ...decorateAct(a), appliesTo: a.types })),
          vocabularies,
          capture_acts: CAPTURE_ACTS.map(decorateAct),
          /* D-126: the acts that take a SET under the `per-item` weight (affordances.mjs PER_ITEM_ACTS),
             decorated from the same tables as every act, with the bound the store enforces. */
          set_acts: PER_ITEM_ACTS.map((a) => ({ ...decorateAct(a), set_key: a.set_key, item_keys: a.item_keys,
                                               shared_keys: a.shared_keys, max_items: PER_ITEM_MAX })),
          detail: "pass target=<bundle id> for the acts available on that object right now; "
                + "rung is the weight ladder (vocabularies.rung_ladder, low to high, IRREVERSIBLE "
                + "at the top per DEC-19 with vocabularies.rung_correction_path beside it) and is "
                + "null only where the act carries a STATED absence — read rung_absence for the "
                + "ground, and vocabularies.rung_absence_grounds for what that ground means; "
                + "capture_acts are keyed by a capture sha rather than by a bundle, so they are "
                + "published with their metadata and never derived against an object's state; "
                + "set_acts take a selection as `items` under the per-item weight: each item is "
                + "applied or RETAINED with its own act's reason, and none stops the others",
        }, store: storeName, tokenClass: cls }, 200);
      }
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
      /* REC-52: `(facts || { reason: "NO_FACTS" })` is site (b)'s shape with a
         different word — a store silence answering "there are no facts about
         that object", which is a claim about the object. What the acts on an
         object are is the whole of what this op is asked, so answering it out
         of a failure to ask would put a wrong set of affordances in front of a
         member. The store's own NO_SUCH_BUNDLE, and its 404, are untouched. */
      /* D-311: THE TWO ACT STAMPS, composed by the SAME expressions the acts receive them by —
         `author` as the object-directed acts' author stamp (a bearer is `token:<cls>`), `by` as the
         roster acts' `by` stamp (a bearer is `class:<cls>`, the `ai` class included, whose
         `identity` above is its member principal). The store asks the machine fences' predicate of
         the first and the roster predicates of the second, so the pre-flight asks each question of
         the caller the act will see. `d311-roster-affordances.test.mjs` pins these two expressions
         to the stamp sites' own text. */
      const affAuthor = viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`;
      const affBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
      const fOut = await doAnswer(st.fetch(
        `http://do/affordancefacts?target=${encodeURIComponent(target)}&viewer=${encodeURIComponent(affViewer)}`
        + `&identity=${encodeURIComponent(affIdentity)}`
        + `&author=${encodeURIComponent(affAuthor ?? "")}&by=${encodeURIComponent(affBy ?? "")}`));
      if (!fOut.answered) return storeSilent("affordances");
      const facts = fOut.result;
      if (!facts) return storeSilent("affordances");
      if (facts.ok !== true)
        return json({ ok: false, ...facts, store: storeName, tokenClass: cls },
                    facts.reason === "NO_SUCH_BUNDLE" ? 404 : 400);
      return json({ ok: true, result: {
        target: facts.target, object_type: facts.object_type,
        current_state: facts.current_state,
        acts: deriveActs(facts).map(decorateAct),
        vocabularies,
        /* REC-38. The SAME block the no-target catalogue answers, and it is
           deliberately NOT filtered by this target: a capture act's subject is
           a capture sha, and whether one is attestable turns on the bytes being
           in the store — a fact `affordanceFacts` does not carry and this
           handler must not guess at. So this is metadata a surface RENDERS
           beside a capture it already holds, never a derivation about this
           object; deriving one here would be the publication disagreeing with
           op=attest's own NO_SUCH_CAPTURE. The reasoning is on CAPTURE_ACTS,
           where both consumers of the distinction read it. */
        capture_acts: CAPTURE_ACTS.map(decorateAct),
      }, store: storeName, tokenClass: cls }, 200);
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
      if (!qOut.answered) return storeSilent("queue");
      const r = qOut.result;
      if (!r) return storeSilent("queue");
      /* N231 (affordances R26): op=affordances' vocabularies, `action_kind` asked of `actions` at this call. */
      const qkOut = await doAnswer(st.fetch("http://do/actionkinds"));
      if (!qkOut.answered) return storeSilent("queue");
      if (r.ok !== true)
        return json({ ok: false, ...r, store: storeName, tokenClass: cls }, 400);
      return json({ ok: true, result: queueAnswer(r, { gate: ACT_GATE, kinds: qkOut.result?.kinds }).result, store: storeName, tokenClass: cls }, 200);
    }

    if (op === "registeraudit") {
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      /* REC-52: this one CRASHED rather than lied — `r.unresolved` on an absent
         result throws a TypeError and the caller gets a platform 500 — so it is
         the less dangerous half of the class. It is converted anyway, because
         the answer below is a SOUNDNESS VERDICT about the register ("sound:
         true") and an audit that reports on a register it could not read is the
         worst possible place to be one line away from a false clean bill. */
      const aOut = await doAnswer(st.fetch("http://do/registeraudit"));
      if (!aOut.answered || !aOut.result) return storeSilent("registeraudit");
      /* R8, R9: provenance's report, each unresolved row probed in the working bucket (D-533's parts included). */
      return json({ ok: true, result: await registerAuditReport(aOut.result, typeof env.CAPTURES?.head === "function"
        ? { head: (sha) => env.CAPTURES.head(captureKey(storeName, sha)), get: (sha) => env.CAPTURES.get(captureKey(storeName, sha)) }
        : null), store: storeName, tokenClass: cls }, 200);
    }

    /* selftest reports deployment health as JSON, so "did the deploy work" is a
       link rather than a command. It asserts every binding is present and that
       the store answers, and it never returns a secret. */
    if (op === "selftest") {
      /* R2 is optional by design: a new group has nothing over the spill
         threshold, so everything lives in SQLite and no card is needed.
         "Not configured" is a first-class healthy state, distinct from
         "configured and broken", which stays a failure. Fence doctrine
         survives because the buckets are only ever added as a pair. */
      const r2Configured = typeof env.CAPTURES?.get === "function"
                        && typeof env.PUBLISHED?.get === "function";
      const out = {
        ok: true, service: "bio-plane", version: env.VERSION || "0.0.0",
        time: new Date().toISOString(), tokenClass: cls,
        bindings: {
          STORE: typeof env.STORE?.idFromName === "function",
          CAPTURES: typeof env.CAPTURES?.get === "function" ? true : "not configured",
          PUBLISHED: typeof env.PUBLISHED?.get === "function" ? true : "not configured",
          ADMIN_TOKEN: await liveToken(env.ADMIN_TOKEN),
          MEMBER_TOKEN: await liveToken(env.MEMBER_TOKEN),
          PROBE_TOKEN: await liveToken(env.PROBE_TOKEN),
          /* REC-33: REPORTED, and deliberately NOT required below. An instance
             that predates this class runs monitoring on the ADMIN_TOKEN
             fallback and is HEALTHY; making the binding required would fail
             every already-installed instance's own health check for holding the
             posture it shipped with. Absence is a first-class state here, the
             same way R2's is — and reporting it is what lets an operator SEE
             whether the fallback is what is carrying their monitoring. */
          DAEMON_TOKEN: (typeof env.DAEMON_TOKEN === "string" && env.DAEMON_TOKEN.length > 0)
            ? await liveToken(env.DAEMON_TOKEN)
            : "not configured",
        },
        r2Configured,
        schemaChars: SCHEMA.length,
      };
      /* Half a fence is a defect, not an option. */
      if ((typeof env.CAPTURES?.get === "function") !== (typeof env.PUBLISHED?.get === "function")) {
        out.ok = false;
        out.r2 = "MISCONFIGURED: one bucket bound without the other; the fence requires both or neither";
      }
      try {
        /* REC-52: a store that ANSWERED `ok:false` reported `out.store =
           undefined` and left `out.ok` TRUE — a deployment health check
           reporting healthy because the failure it was looking for arrived in
           the one shape it did not read. Only a thrown fetch was caught. */
        /* REC-131 / IC-148: selftest RELAYS the store's stats — the same answer through a second
           door, under op=stats' one stamp: `dbBytes` for the admin class only (see op=stats). */
        const sOut = await doAnswer(env.STORE.get(env.STORE.idFromName(storeName))
          .fetch(`http://x/stats?capacity=${cls === "admin" ? "1" : "0"}&viewer=${encodeURIComponent(
            viaSession ? sessViewer : cls === "ai" ? aiCred.principal : `${MACHINE_CLASS_PREFIX}${cls}`)}`));
        if (!sOut.answered) { out.ok = false; out.store = "ERR the store did not answer /stats"; }
        else out.store = sOut.result;
      } catch (e) { out.ok = false; out.store = "ERR " + String(e && e.message || e); }
      if (r2Configured) {
        try {
          const key = `${SCRATCH}/selftest-${Date.now()}`;
          await env.CAPTURES.put(key, "ok");
          const back = await env.CAPTURES.get(key);
          out.captures = (await back.text()) === "ok" ? "read-write ok" : "MISMATCH";
          await env.CAPTURES.delete(key);
        } catch (e) { out.ok = false; out.captures = "ERR " + String(e && e.message || e); }
      } else {
        out.captures = "not configured";
      }
      /* Required for health: the store and three live token bindings. R2 is
         reported but not required. */
      out.bindingsAllPresent =
        out.bindings.STORE === true && out.bindings.ADMIN_TOKEN === true
        && out.bindings.MEMBER_TOKEN === true && out.bindings.PROBE_TOKEN === true;
      if (!out.bindingsAllPresent) out.ok = false;
      return json(out, out.ok ? 200 : 500);
    }

    /* purge is the only destructive op. It refuses unless the caller names the
       store it resolved to, so a purge can never land somewhere the caller did
       not mean. Probe class reaches it, but scopeFor has already confined probe
       to scratch, so probe can only ever confirm "scratch". */
    if (op === "purge") {
      const confirm = url.searchParams.get("confirm");
      if (confirm !== storeName)
        /* REC-185 / D-278's class: C-61.1 through the ONE governed helper, so this site adds no row
           and the row's `where` keeps naming one span. The condition IS the argument complaint —
           `confirm` is missing or in a shape the op cannot use — and the shape it must take is the
           store name this request resolved to, which is why `expected` is kept beside it.
           `error` is passed in BYTE-IDENTICAL (D-270's pattern), so `purge.test.mjs`'s two arms and
           any script reading `error` move not at all. The helper's `detail` says NOTHING WAS CHANGED,
           which on the plane's one destructive op is the sentence a caller most needs. */
        return json({ ok: false,
                      ...requiredArgument("purge", "confirm", "<store name>",
                                          "purge requires confirm=<store>"),
                      expected: storeName,
                      got: confirm, tokenClass: cls, store: storeName }, 400);
    }

    if (op === "livefire") {
      const out = await livefire(env, storeName, { capacity: cls === "admin",
        viewer: viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}` });
      /* D-506 / IC-265, on BOB #32's ruling of 2026-09-24 06:07Z. This read `out.ok ? 200 : 500`, and
         `out.ok` WAS the canary's verdict — which is why a failing canary answered `ok:false` with no
         code of any kind to every consumer that reads `ok:false` as a refusal. `out.ok` is now
         `true` whenever the op answered, and the verdict lives in `out.verdict` / `out.failing`.
         THE STATUS IS KEYED TO THE VERDICT, so it is byte-for-byte what it was for every outcome: a
         DIST gate or a curl that reads the status alone loses nothing to this change, which is the
         whole point of moving the verdict to keys of its own rather than deleting it from the wire. */
      return json(out, out.verdict === "pass" ? 200 : 500);
    }

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
    /* What runs here have COST, measured. A read, and the honest counterpart to
       the store's `capturelimit` read — a DO PATH and not an op, M0-12; nothing
       on the control plane reaches it — : that one reports a ceiling found by
       being refused, this
       one reports consumption found by measuring, because CPU has no catchable
       refusal to find a ceiling with. */
    if (op === "runtime") {
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      /* REC-52: three unchecked reads feeding one `{ok:true}`. A store silence
         made every one of them `undefined`, `JSON.stringify` dropped all three,
         and the answer became `{ok:true, asymmetry:"…"}` — a MEASUREMENT op
         reporting success while carrying no measurement, which is this class at
         its most literal: an outcome that costs nothing to produce. */
      const obsOut = await doAnswer(st.fetch("http://x/runtimeobservations"));
      const probeOut = await doAnswer(st.fetch("http://x/cpuprobestate"));
      const limOut = await doAnswer(st.fetch("http://x/capturelimit?runtime=subrequests"));
      if (!obsOut.answered || !probeOut.answered || !limOut.answered) return storeSilent("runtime");
      const obs = obsOut.result, probe = probeOut.result, lim = limOut.result;
      return json({ ok: true, measured: obs, cpu_probe: probe, subrequests: lim,
        asymmetry: "a refused subrequest throws and is caught, so the subrequest ceiling is known by "
                 + "having hit it. Exceeding the CPU limit TERMINATES the isolate, so no run can "
                 + "report its own death: consumption is measured on every run and the ceiling is "
                 + "found by op=cpuprobe, whose checkpoints survive the kill." });
    }

    /* Find the CPU ceiling by walking into it. Each completed step is
       checkpointed durably BEFORE the next begins, so when the isolate is killed
       the trail shows the last step that finished and the ceiling is bracketed.
       Probe class only: it burns compute on purpose and belongs nowhere near a
       member's session. */
    if (op === "cpuprobe") {
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      /* REC-52: `before.highest_completed` threw on an absent result, so this
         one crashed rather than lied. Converted for the same reason as
         op=registeraudit — the answer it builds is a CEILING, and a ceiling
         derived from a starting point nobody read is a number presented as a
         measurement. */
      const beforeOut = await doAnswer(st.fetch("http://x/cpuprobestate"));
      if (!beforeOut.answered || !beforeOut.result) return storeSilent("cpuprobe");
      const before = beforeOut.result;
      const iters = Math.max(100000, Number(url.searchParams.get("iterations")) || 2000000);
      const budget = Math.max(50, Number(url.searchParams.get("budget_ms")) || 20000);
      const r = await cpuProbe({
        startStep: before.highest_completed, iterationsPerStep: iters, budgetMs: budget,
        checkpoint: async (step, elapsed) => {
          await st.fetch("http://x/recordcpuprobestep", {
            method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify({ step, elapsedMs: elapsed, iterations: iters }) });
        },
      });
      const afterOut = await doAnswer(st.fetch("http://x/cpuprobestate"));
      if (!afterOut.answered) return storeSilent("cpuprobe");
      const after = afterOut.result;
      return json({ ok: true, run: r, state: after,
        note: "this run RETURNED, so the ceiling is above its elapsed time. If a later run does not "
            + "return, the trail's highest step is the last one that fit and the ceiling lies just "
            + "above its elapsed_ms." });
    }

    /* Project a capture's resolved links into edges. Separate from op=links
       because it writes, and the capability gate has to see that. */
    if (op === "linkproject") {
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      const capture = url.searchParams.get("capture");
      if (!/^[0-9a-f]{64}$/.test(capture || ""))
        return json({ ok: false, reason: "NEED_CAPTURE", detail: "pass capture=<sha256>" }, 400);
      const bundle = url.searchParams.get("bundle");
      /* REC-52: op=linkproject WRITES — it projects a capture's links into
         edges — and `json({ ok: true, ...p.result })` reported a store silence
         as a successful projection carrying no counts. A write reported as
         done when nothing was written is the worst member of this class after
         the public reads, because the caller stops asking. */
      /* D-706 (T5-11, connections R26): the answer names capture shas and the target's bundle, so the store reads
         the source and every target through the D-15 viewer, decided here by the SERVER exactly as the stamp block
         below decides it (a member-scoped agent key stamps its principal), and fails CLOSED on an absent one.
         D-722 (connections R27): where the source bundle is a PROJECT the store asks REC-134's JOINED test, as `cite`
         does, of the POSITIONAL identity. This handler builds its own store request and returns above that block,
         so it stamps both here, by the same expressions. */
      const linkViewer = viaSession ? sessViewer : cls === "ai" ? aiCred.principal : `${MACHINE_CLASS_PREFIX}${cls}`;
      const linkIdentity = viaSession ? sessIdentity : cls === "ai" ? aiCred.principal : `${MACHINE_CLASS_PREFIX}${cls}`;
      const p = await doAnswer(st.fetch(`http://x/projectlinks?capture=${capture}`
        + (bundle ? `&bundle=${encodeURIComponent(bundle)}` : "") + `&viewer=${encodeURIComponent(linkViewer)}`
        + `&identity=${encodeURIComponent(linkIdentity)}`));
      if (!p.answered) return storeSilent("linkproject");
      return json({ ok: true, ...p.result });
    }

    {
      const g = await governorOp(op, url, () => env.STORE.get(env.STORE.idFromName(storeName)));
      if (g) return g.silent ? storeSilent(op) : json(g.body, g.status);
    }

    if (op === "links") return linksOp(url, env.STORE.get(env.STORE.idFromName(storeName)), { json, storeSilent, doAnswer,
      viewer: viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}` });

    if (op === "capture") return captureObjectOp(req, url, env,
      { json, storageAbsent, requiredArgument, key: (s) => captureKey(storeName, s), storeName, cls });

    /* R31–R35: op=pdfstructure is extraction's; the control plane stamps who asks. */
    if (op === "pdfstructure") return pdfStructureOp(url, env, env.STORE.get(env.STORE.idFromName(storeName)),
      { json, storeSilent, storageAbsent, requiredArgument, cls, session: viaSession, caps: sessCaps,
        viewer: viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`,
        author: viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`, storeName });

    if (op === "archivelookup") return archiveLookupOp(req, url, env.STORE.get(env.STORE.idFromName(storeName)), { json, storeSilent, doAnswer });

    if (op === "acquire") {
      /* K72 (8), (11); N265: the acquisition is capture's service in the Durable Object, and the reading of what it
         filed is extraction's (R1, `acquireReadingOp`). This op forwards to the one, hands the other the filed document,
         and adds only the grade note; it runs no reading of its own. */
      const acquired = await acquireOp(req, env, env.STORE.get(env.STORE.idFromName(storeName)), { json, storeSilent,
        storageAbsent, doAnswer, cls, member: viaSession, sessMember, storeName });
      if (acquired.response) return acquired.response;
      const read = await acquireReadingOp(acquired.answer, env.STORE.get(env.STORE.idFromName(storeName)), { storeSilent, storeName });
      if (read.response) return read.response;
      return json(Object.assign(read.body, { note: ACQUIRE_GRADE_NOTE }), 200);
    }

    /* Co-attestation over a capture hash.
     *
     * The doctrine's asymmetry: a self-recorded hash proves integrity since
     * capture and nothing about origin, because it is the group attesting to
     * itself. A timestamp token is issued by somebody the group does not
     * control, so it proves the capture EXISTED at the claimed instant, which
     * is the part an attacker holding a write token cannot forge.
     *
     * Every attempt is recorded, successes and failures alike, in the shape
     * C-18.1 requires. The doctrine is explicit that a failed attempt is
     * recorded with its reason and never omitted: a provenance register showing
     * no attempt and one showing an attempt that failed are different claims,
     * and collapsing them would let an absence read as a success.
     */
    if (op === "attest") {
      if (req.method !== "POST") return json({ ok: false, error: "attest is a POST" }, 405);
      if (typeof env.CAPTURES?.put !== "function")
        return storageAbsent(op, "this instance has no evidence storage configured");
      // R31–R33: provenance's `attest`, over the working bucket by digest, the network, and the store's register and
      // receipts (D-476's `registerholds`, which answers whether a receipt or the register names the hash).
      const body = await req.json().catch(() => null);
      const attested = await attest(body || {}, {
        head: (sha) => env.CAPTURES.head(captureKey(storeName, sha)),
        put: (sha, bytes) => env.CAPTURES.put(captureKey(storeName, sha), bytes, { sha256: sha }),
        fetch: (...a) => fetch(...a),
        holds: async (sha) => {
          const hOut = await doAnswer(env.STORE.get(env.STORE.idFromName(storeName)).fetch(
            `http://x/registerholds?sha256=${encodeURIComponent(sha)}`));
          return hOut.answered ? hOut.result : null;
        },
      });
      return json({ ...attested, store: storeName, tokenClass: cls }, attestStatus(attested));
    }

    /* K372 (N278, N247): `doAnswer` is handed in, as it is to `knockOp`, so the one envelope reader opens monitoring's. */
    if (op === "monitor") return monitorOp(req, env.STORE.get(env.STORE.idFromName(storeName)), { json, storeSilent, requiredArgument, doAnswer, viewer: viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`, actorClass: viaSession ? "member" : "machine", actor: viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`, storeName, cls });


    if (op === "caseratify") return caseRatifyOp(req, stub, { env, json, doAnswer, storeSilent, assembleCaseContainer, storeName, cls, aiCred, viaSession, sessViewer, sessRights });
    if (op === "ratify") return ratifyOp(req, stub, { env, json, doAnswer, storeSilent, assembleCaseContainer, storeName, cls, aiCred, viaSession, sessViewer, sessRights, captureKey, withBiasChecks, STORE_SILENT_REASON, STORE_SILENT_DETAIL });
}

export default { fetch: makeFetch({ publicOp, gatedOp, publicInstanceGroup }) };
