/* publication's Worker half (requirements: `build/requirements/publication.md` R10, R13, R15; K3): the public read
 * path's control-plane side (`op=publishedcase`, `op=publishedbytes`), its governed refusals (C-68.5, C-98), and the
 * case container's assembly the moment a case edition completes. Moved from `index.mjs` with their comments; the
 * store side is `./index.mjs`.
 *
 * THE PLANE'S HELPERS ARE BOUND, NOT IMPORTED: the control plane (`legacy-index`, later in the order) owns `json()`
 * (its DEC-49 decoration), the Durable Object envelope reader (`doAnswer`), the silence refusal (`storeSilent`), the
 * required-argument refusal and the published store's namespace. It binds them once at load (`bindPublishedPlane`),
 * so this file reads every answer the way the rest of the plane does and restates none of it. */

import { parseFrontmatter, normalizeType, sectionText } from "../../checks/bio-checks.mjs";
import { NS_RATIFY, ratifyStatement, caseRatifyStatement } from "../sshsig.mjs";
import { serialiseContainer, containerEntries } from "../container.mjs";
import { inbandQuartet } from "../inband.mjs";
import { rowOf, caseDocumentStatesMemberBlocks } from "./checks.mjs";

let PLANE = null;
const PLANE_KEYS = ["json", "doAnswer", "storeSilent", "requiredArgument", "StoreSilent", "STORE_SILENT_REASON",
                    "STORE_SILENT_DETAIL", "PUBLISHED_STORE"];

/** Binds the control plane's helpers, once, at the control plane's load. A second binding replaces the first (a test
 *  binds its own); one missing a helper throws, loudly, since every public read depends on them. */
export function bindPublishedPlane(helpers) {
  const missing = PLANE_KEYS.filter((k) => !helpers || helpers[k] === undefined);
  if (missing.length) throw new Error(`bindPublishedPlane: missing ${missing.join(", ")}`);
  PLANE = Object.freeze(Object.fromEntries(PLANE_KEYS.map((k) => [k, helpers[k]])));
  return PLANE;
}
function plane() {
  if (!PLANE) throw new Error("publication/worker.mjs: the control plane has not bound its helpers (bindPublishedPlane)");
  return PLANE;
}

/* THE PUBLISHED-STORE COMPLAINT (C-68.5, D-549). A copy installed with no store
 * for its published documents cannot hand over a published document's bytes, at
 * `publishedbytes` (a refusal) or at `publishedcase` (a finding's body stated
 * `unavailable`). BOTH OPS ARE PUBLIC, so the reader of this code is most likely a
 * member of the public holding no credential at all, and until D-549 the code
 * reached them bare from two sites with no sentence behind it.
 *
 * ONE CONDITION, AND IT IS DECIDED HERE: no published store is bound. Returns
 * null when one is, so no call site restates the test and none can mint this
 * code for a different fact — `OBJECT_MISSING` (a store bound and no object at
 * that hash) is the other condition and stays its own code at its own site.
 * Minted here rather than at two sites for the reason `storageAbsent` is: a
 * DEC-49 row holds one `where`. */
export function publishedStoreAbsent(env) {
  /* DEC-49 REGION is-published-store-absent
   * THE SPAN C-68.5 names: its one condition and its one mint, the code a STRING LITERAL at its site. */
  if (typeof env.PUBLISHED?.get === "function") return null;
  const row = rowOf("NO_PUBLISHED_STORE");
  return { ok: false, reason: "NO_PUBLISHED_STORE", code: row.code, check: row.check, translation: row.translation };
  /* END DEC-49 REGION is-published-store-absent */
}

/* D-561 (C-98.1): NO PUBLISHED PART ANSWERS TO THAT HASH, at `publishedbytes`. It answered `NOT_FOUND` until
 * D-561, a code the plane also mints for three other conditions, so no row could be written for it without
 * putting this sentence on theirs. `detail` is the site's own sentence, BYTE-IDENTICAL to what it said before:
 * a hash that was never ratified and a hash that never existed stay ONE answer, and the translation keeps that. */
export function noPublishedPart(sha256) {
  /* DEC-49 REGION is-no-published-part */
  return plane().json({ ok: false, reason: "NO_PUBLISHED_PART", ...rowOf("NO_PUBLISHED_PART"), sha256,
    detail: "no published part answers to that hash. A hash that was never ratified and a hash that "
          + "never existed are the same answer here, deliberately." }, 404);
  /* END DEC-49 REGION is-no-published-part */
}

/* D-561 (C-98.2): A PUBLISHED HASH WHOSE BYTES THIS COPY'S STORE DOES NOT HOLD — the store bound and the object
 * absent. ONE condition met at both public ops: `publishedcase` states one finding's body unavailable with it
 * (D-549 left it bare there), and `publishedbytes` refuses with it where it used to answer `NOT_FOUND` with the
 * sentence "no published part answers to that hash" — FALSE of a hash the line above had just verified published.
 * Returns the refusal OBJECT so each site chooses its envelope; `NO_PUBLISHED_STORE` is the other condition and
 * is never this one. */
export function publishedObjectMissing() {
  /* DEC-49 REGION is-published-object-missing
   * THE SPAN C-98.2 names: its one mint, the code a STRING LITERAL at its site, the row's fields beside it. */
  return { ok: false, reason: "OBJECT_MISSING", ...rowOf("OBJECT_MISSING"),
           detail: "that hash is published, and this instance's published store holds no bytes for it, so "
                 + "they cannot be handed over. The hash is genuine." };
  /* END DEC-49 REGION is-published-object-missing */
}

/* REC-44 / DEC-34: THE CASE CONTAINER, assembled the moment a case edition COMPLETES — every member
   finding ratified at the version the case pinned. D-442 moved it out of the op=ratify block VERBATIM
   so op=caseratify can call it too (see the call sites). `cs` is `#caseEditionState`'s answer. Returns
   what op=ratify always answered as `container`. */
export async function assembleCaseContainer({ env, stub, storeName, cs, via }) {
        const manifest = {
          /* REC-47 bumps 2 -> 3, and the bump is deliberate rather than
             bookkeeping. The container gains `bias_acknowledgement`, which is a
             DISCLOSURE a reader is entitled to rely on being present: without a
             version move, a /2 container carrying no acknowledgement and a /2
             container that simply predates the field are indistinguishable to a
             stranger holding the zip, and "the record is silent" would read as
             "the group declared nothing". The whole premise of the container is
             that it is readable without our cooperation, so the only place that
             ambiguity could be resolved is the one place the reader cannot
             reach. REC-44 bumped 1 -> 2 for the same class of reason. */
          /* CASE-5 / DEC-72 bumps 3 -> 4, AND THE BUMP IS THE SAME ARGUMENT
             REC-47 MADE, arriving on the fields the artifact flip adds. `/4`
             carries the PIN, the AUTHORED ROLE, each member's OWN edition, whose
             production the case is and the standard it was held to. Without a
             version move a `/3` container carrying no pin and a `/4` container
             whose pin was WITHHELD are indistinguishable to a stranger holding
             the zip, and "the record is silent" would read as "the case froze
             nothing" — which is the one claim this artifact exists to refute.
             The whole premise is that it is readable without our cooperation, so
             the only place that ambiguity could be resolved is the one place the
             reader cannot reach. */
          /* CASE-5b / DEC-72 bumps 4 -> 5, AND THIS BUMP IS LOAD-BEARING IN A WAY
             THE OTHERS WERE NOT. `/4` and every version before it carried the
             case's scope, roster, partition, bias acknowledgement and bar as
             MANIFEST FIELDS — and a stranger could check every one of them,
             because the same facts were inside each member's SIGNED bundle.md.
             That is the property REC-44 bought and it is why the fields could be
             taken on trust here: the manifest was a convenience over material
             the reader could verify.

             CASE-5b removes those facts from member bytes. A `/4`-shaped
             manifest built after this item would carry the same fields with
             NOTHING BEHIND THEM — assertions this instance makes about itself,
             checkable against nothing, which is precisely the ambiguity the
             format comment above says this artifact exists to refute. So `/5`
             carries `case_document`: the bytes, their hash, and the armored
             signature a member made over them, verifiable with ssh-keygen
             against a key the artifact names.

             WITHOUT THE VERSION MOVE a reader could not tell a `/4` container
             whose case facts were member-signed from a `/4` container whose case
             facts were nobody's. That distinction is the entire difference
             between this record and a press release. */
          /* REC-128 bumps 5 -> 6, ON THE ARGUMENT EVERY BUMP ABOVE MADE. `/6`
             carries `delivered_by` beside every `attestor` — on the case document
             and on each finding — naming whose authenticated session CARRIED the
             signature in: a member, or the instance's founder. Without the move a
             `/5` container (which never recorded a deliverer) and a `/6` one whose
             deliverer was not recorded would read alike, and a stranger could not
             tell "nobody said" from "the format had no place to say". EXISTING
             containers are untouched: a manifest is built once, when an edition
             completes, and is served by its own stored hash, so nothing already
             published verifies against anything new. `delivered_by` is THIS
             INSTANCE'S RECORD and not covered by any signature (a member signs
             before anybody delivers), and `verify` below says so in words. */
          format: "bio-case-container/6",
          case: cs.caseId,
          edition: cs.edition,
          group: cs.group ?? null,
          /* THE SIGNED CASE DOCUMENT, WHOLE. The text is carried rather than a
             digest of it for the same reason every member's bundle.md is carried
             rather than named: a stranger must be able to RE-HASH what they hold
             and check the signature over it themselves. A digest alone would let
             them detect a mismatch and never let them read what was signed.

             THE STATEMENT IS PRINTED IN ASCII, which is CASE-5's own correction
             arriving on the new field: `caseRatifyStatement()` returns a
             Uint8Array, and `JSON.stringify` renders one as an object of byte
             indices — so a `/4` container told a stranger to verify over a
             statement printed as numbered integers. Decoded here, at the site,
             rather than by changing what the statement builder returns. */
          case_document: cs.document ? {
            doc_sha: cs.document.doc_sha,
            text: cs.document.text,
            gate_version: cs.document.gate_version,
            ratified_at: cs.document.ratified_at,
            attestor: cs.document.attestor,
            delivered_by: cs.document.delivered_by,
            signature: { namespace: NS_RATIFY,
                         statement: new TextDecoder().decode(
                           caseRatifyStatement(cs.caseId, cs.edition, cs.document.doc_sha)),
                         /* `armored`, the SAME field name every member's
                            signature already uses twelve lines down. A second
                            spelling for one thing in one artifact is how a
                            consumer comes to handle only the half it happened to
                            meet first. */
                         armored: cs.document.sig_armored },
          } : null,
          /* DEC-72 clause 2, INSIDE THE ARTIFACT THAT TRAVELS. Whose production
             this case is, and the standard of evidence it was held to. The
             design doc's own list of what the CASE artifact freezes names the
             bar; before this item it was reachable only by opening a member's
             bundle.md and reading that member's copy, which is one member's
             stamp of a case property. A stranger weighing a case has to be able
             to see what the group required of it and who required it, from the
             bytes in their hand. `bar: null` is the absent-bar posture and never
             a bar of zero, which `verify` below says in words. */
          project: cs.project ?? null,
          bar: cs.bar ?? null,
          /* DEC-44 determination 2: what the case is ABOUT, authored by the
             group. Beside it, what it left OUT. A reader needs both. */
          scope: cs.scope ?? null,
          /* REC-47 / DEC-46 (a): INSIDE THE CONTAINER, which is the copy that
             matters most. DEC-20 makes the bias part of the evidentiary record
             that TRAVELS with publication, and the container is the artifact
             that travels — a stranger holding the zip must be able to read the
             lens this case was made under without coming back to this instance.
             An acknowledgement served only from a live op would be a disclosure
             that stops existing the moment the instance does. */
          bias_acknowledgement: cs.bias_acknowledgement ?? null,
          completeness: cs.completeness ?? null,
          /* REC-58, 2026-08-05: `ratified_at` and NOT `opened`, and the pair is
             a decision rather than an accident of which fields were to hand.
             `cs` is the whole case-edition state and carries both. The instant
             the LAST member signed is what this container can stand behind; the
             instant somebody started work is a fact about the working record,
             and a stranger holding this zip has no way to check it and no stated
             use for it. Named rather than spread, for the reason at the sibling
             pick above: this artifact travels without this instance, so a field
             that leaks into it cannot be withdrawn from the copies. */
          ratified_at: cs.ratified_at,
          /* EVERY MEMBER FINDING, each with its OWN signature, its OWN attestor
             and its OWN frozen PAIR. The signature is per finding because the
             FINDING is the unit of truth: what a member signed is one
             document's bytes, and a case-level signature would be a signature
             over something nobody reviewed. */
          findings: cs.findings.map((f) => ({
            bundle_id: f.bundle_id, title: f.title,
            /* CASE-5, AND THIS ONE LINE WAS A FALSE STATEMENT IN A SIGNED-ADJACENT
               ARTIFACT. It read `edition: cs.edition` — the CASE's number,
               written onto every member as though it were the member's. While
               the two were slaved it happened to be true; the artifact flip makes
               it a claim about a finding that the finding's own published row
               contradicts, and this is the copy that TRAVELS, so a reader has no
               way to check it against anything. It is the member's own edition,
               off the member's own published row, resolved by the pin. */
            edition: f.edition,
            bundle_sha: f.bundle_sha,
            /* THE PIN AND THE DESIGNATION, INSIDE THE CONTAINER. The design's
               sentence: the CASE artifact freezes its members — *"content by
               hash, version, per-member strength pair, role, the bar, the
               exclusions."* The pair and the exclusions were already here (the
               latter inside `completeness.excluded`, which is why it is not
               copied a second time); the version and the role were not.
               `version_sha` is what the case COMMITTED TO and `bundle_sha` is
               what the member SIGNED — equal by construction at assembly, and
               carried as two fields anyway, because a reader checking the freeze
               must be able to see the case's commitment as a separate statement
               from the finding's own hash. `role` is the authored designation
               (clause 4): a stranger holding a SUPPORTING member must be able to
               see it was not presented as carrying the case. */
            version_sha: f.version_sha ?? null,
            role: f.role ?? null,
            ratified_at: f.ratified_at, gate_version: f.gate_version,
            attestor: f.attestor,
            delivered_by: f.delivered_by,
            /* CASE-5 CORRECTS `statement`, AND IT IS THE ONE FIELD IN THIS
               ARTIFACT THAT WAS UNREADABLE BY THE READER IT EXISTS FOR.
               `ratifyStatement()` returns a Uint8Array — it is the message fed
               to the signer — and JSON.stringify turns a Uint8Array into an
               OBJECT KEYED BY BYTE INDEX: {"0":98,"1":105,…}. So the container
               told a stranger to check a signature over a statement it printed
               as 47 numbered integers, and the one thing they had to have in
               ASCII was the one thing they had to decode. Nothing consumed it —
               measured across `civicos-ui`, the battery and this file — so this
               is a correction and not a withdrawal, and it rides the /4 bump
               with the rest of what the flip adds. Decoded here rather than by
               changing `ratifyStatement`, whose Uint8Array return is exactly
               right for `verifySshsig`'s caller two thousand lines up. */
            signature: { namespace: NS_RATIFY,
                         statement: new TextDecoder().decode(ratifyStatement(f.bundle_id, f.bundle_sha)),
                         armored: f.sig_armored },
            strength: f.strength, required_strength: f.required,
            parts: f.parts.map((p) => `${f.bundle_id}/${p.path}`),
          })),
          /* The parts are NAMESPACED BY FINDING, and that is forced rather than
             chosen: every finding carries a `bundle.md`, so a flat parts[]
             would have two members claiming one path and the archive would say
             two things about one name. */
          parts: cs.findings.flatMap((f) => f.parts.map((p) => ({
            path: `${f.bundle_id}/${p.path}`, finding: f.bundle_id,
            sha256: p.sha256, kind: p.kind, bytes: p.bytes ?? null }))),
          layout: { root: `${cs.caseId}/`, parts_at: "path", manifest_at: "MANIFEST.json",
                    note: "the zip carries every part at <case>/<finding>/<path> with this manifest at the "
                        + "root. Check each part's sha256 against this list, then check this manifest's own "
                        + "sha256 and each finding's signature over its own bundle_sha. Renderings (REC-22) "
                        + "join parts[] as kind: rendering." },
          verify: "tamper-EVIDENT, not tamper-proof: nothing here prevents a modified copy, and everything here "
                + "makes one detectable by anyone holding it, without this instance's cooperation. Each "
                + "finding is signed on its own bytes; there is no case-level strength, because composing "
                + "several findings' strengths into one letter is a claim the evidence does not support. "
                /* CASE-5: THE INSTRUCTIONS A STRANGER ACTUALLY NEEDS, in the
                   artifact rather than in our documentation — which they do not
                   have, and which is the whole point of the thing they are
                   holding. Three sentences, one per field the flip adds, each of
                   them a check the reader can RUN. */
                + "EACH FINDING'S `edition` IS ITS OWN, on its own version chain, and is NOT this case's "
                + "edition: since the artifact flip the two are separate numbers, so a member of edition 2 "
                + "of this case may be at its own edition 1. `version_sha` is the version THIS CASE "
                + "COMMITTED TO and must equal that finding's `bundle_sha` here; if they differ, this "
                + "container was assembled over a member the case did not pin and you should not rely on "
                + "it. `role` is the publisher's authored designation: only `load_bearing` members were "
                + "held to the `bar` above, and a `supporting` member is part of the published work without "
                + "being presented as carrying it. Where `bar` is null NO STANDARD WAS RECORDED, which is "
                + "not a standard of zero — the case claims no cleared bar and says so. "
                /* REC-128: the two principals of one ratification, told apart in
                   the artifact that travels. */
                + "`attestor` is who SIGNED, and the signature proves it. `delivered_by` is who DELIVERED "
                + "that signature to this instance — the authenticated session that performed the act, a "
                + "member or the instance's founder — and it is this instance's record, not covered by any "
                + "signature. `undetermined` there means the delivery was not recorded; it never means the "
                + "signer delivered it."
                /* D-442 / BIO_Publication_v0_1.md §3 rule 12 (c): WHICH SIGNATURE COVERS A MEMBER'S
                   FROZEN PAIR now depends on the case document's format, and a stranger must be told
                   which one to check — in the artifact, for CASE-5's reason above. */
                + (caseDocumentStatesMemberBlocks(parseFrontmatter(String((cs.document && cs.document.text) || "")).data || {})
                  ? " Each finding's `strength` and its own `edition` are stated in the CASE DOCUMENT carried "
                    + "above (`case_strength`, `case_roles`), under the case document's signature: publishing "
                    + "wrote nothing on any finding, so its own signature covers the finding as its project "
                    + "concluded it, and the pair is this case's reading of those bytes."
                  : ""),
        };
        /* REC-148: THE MANIFEST'S HASH IS TAKEN BY `inbandQuartet` — the one function the review copy's
           in-band quartet uses too (DEC-31's bound rule, `BIO_Publication_v0_1.md` §6A.3 point 1), so the
           two can never be two canonicalisations under one name. The bytes are unchanged: the manifest was
           always hashed over `JSON.stringify(manifest, null, 1)`, which is the function's canonical form. */
        const { bytes: mBytes, quartet: inband } = await inbandQuartet({
          subject: manifest,
          over: "this case edition's container manifest (MANIFEST.json), exactly as served at "
              + "op=publishedbytes&sha256=<this hash>",
          date: cs.ratified_at ?? null,
          author: (cs.document && cs.document.attestor && cs.document.attestor.member) ?? null,
          bar: cs.bar ?? null });
        const mSha = inband.hash.sha256;
        /* REC-53, THE FIRST POST-COMMIT SITE. A silence here made `rec`
           undefined and the fallback minted `reason:"MANIFEST_NOT_RECORDED"` —
           a statement that the published record does NOT hold this case's
           container — and carried it inside an `ok:true` ratification answer.
           Invisible to REC-52's detector B, which reads `json()` arguments, and
           to detector A, which looks for a `.result` spread: this one travels to
           the caller in a LOCAL VARIABLE and is spread twelve lines later.
           The ratification has ALREADY COMMITTED here, so this may not refuse;
           it states the exchange instead. The `MANIFEST_NOT_RECORDED` fallback
           survives for the answered path, where it describes a store that said
           `ok:false` without a reason of its own. */
        const recOut = await plane().doAnswer(stub.fetch(new Request("http://do/recordcasemanifest", {
          method: "POST", body: JSON.stringify({ caseId: cs.caseId, edition: cs.edition,
                                                 manifest, manifestSha: mSha, bytes: mBytes.length }) })));
        const rec = recOut.result;
        if (recOut.answered && rec && rec.ok && typeof env.PUBLISHED?.put === "function") {
          const key = `${storeName}/published/${mSha}`;
          if (!(await env.PUBLISHED.head(key))) await env.PUBLISHED.put(key, mBytes);
        }
        return !recOut.answered
          ? { ok: false, reason: plane().STORE_SILENT_REASON, op: `${via}/recordcasemanifest`,
              detail: plane().STORE_SILENT_DETAIL }
          : rec && rec.ok
            ? { manifest_sha: mSha, parts: manifest.parts.length, findings: manifest.findings.length,
                zip: `op=publishedbytes&sha256=${mSha}&format=zip`, inband }
            : { ok: false, ...(rec || { reason: "MANIFEST_NOT_RECORDED" }) };
}

/* REC-22 / DEC-34 / R10, R13: the public read path's control-plane side, `op=publishedcase` and `op=publishedbytes`,
   for a caller holding no credential. `stub` is the published store's Durable Object (PUBLISHED_STORE). Answers the
   Response. */
export async function publishedRoutes({ op, url, env, stub }) {
  const P = plane();
  const shaParam = (url.searchParams.get("sha256") || "").toLowerCase();
  const pubKey = (sha) => `${P.PUBLISHED_STORE}/published/${sha}`;
  const pubBytes = async (sha) => {
    if (typeof env.PUBLISHED?.get !== "function") return null;
    const o = await env.PUBLISHED.get(pubKey(sha));
    return o ? new Uint8Array(await o.arrayBuffer()) : null;
  };

  if (op === "publishedbytes") {
    if (!/^[0-9a-f]{64}$/.test(shaParam))
      return P.json({ ok: false, ...P.requiredArgument("publishedbytes", "sha256", "<64 lowercase hex>",
        "publishedbytes requires sha256=<64 lowercase hex>. This surface "
                  + "answers BY HASH and never by path, so there is nothing to walk.") }, 400);
    /* THE GUARD, and it is the whole op. A sha is served if and only if a
       published_shas row names it. Everything else 404s with the SAME body
       — a hash that was never ratified and a hash that never existed are
       one answer, so the absence of a document cannot be inferred from the
       shape of a refusal.

       It is NOT redundant with the bucket boundary and the suite proves
       that: point PUBLISHED at the working bucket (a plausible installer
       slip that nothing else in the plane would catch) and this guard is
       the only thing standing between an anonymous caller and the working
       corpus. */
    /* REC-52, a THIRD site the item did not name and the sweep found.
       `!v` and `!v.published` used to be one test, so a store that never
       answered fell into `notFound()` — and `notFound()` is not a shrug,
       it is a CLAIM: "no published part answers to that hash … a hash
       that was never ratified and a hash that never existed are the same
       answer here, deliberately." That clause is exactly what makes the
       sentence convincing, and it is true only of a real absence. The
       two are now separated: a silence is a silence, and the guard below
       keeps its whole meaning for the answers that reach it. */
    const vOut = await P.doAnswer(stub.fetch(`http://do/verify?sha256=${shaParam}`));
    if (!vOut.answered) return P.storeSilent("publishedbytes");
    const v = vOut.result;
    /* D-561: NO_PUBLISHED_PART (C-98.1) from its one governed site; it was `NOT_FOUND`. */
    if (!v || !v.published) return noPublishedPart(shaParam);
    /* D-734 (BOB #36, 2026-09-25 11:50Z, D-731 (b); BIO_Publication_v0_1.md §4): A RATIFIED CASE DOCUMENT'S HASH is
       registered when it is signed (kind `case_document`), and its bytes never go to the published bucket — they are
       the signed text itself. So they are read from the store and served only after THIS layer re-hashes them and
       finds exactly the sha asked for: the store's read does not vouch for its bytes. Ahead of the bucket's own checks
       because it needs no bucket; `format=zip` falls through to NOT_A_CONTAINER below, since a case document is a
       part, not a container. Bytes the record cannot produce at that hash are refused BY NAME and never 404'd: the
       hash IS published, and NO_PUBLISHED_PART's sentence would call it never ratified. */
    if (v.matches.some((m) => m.kind === "case_document") && (url.searchParams.get("format") || "") !== "zip") {
      const dOut = await P.doAnswer(stub.fetch(`http://do/publishedcasedoctext?sha256=${shaParam}`));
      if (!dOut.answered) return P.storeSilent("publishedbytes");
      const d = dOut.result || {};
      const docBytes = d.found && typeof d.text === "string" ? new TextEncoder().encode(d.text) : null;
      const docSha = docBytes ? [...new Uint8Array(await crypto.subtle.digest("SHA-256", docBytes))]
        .map((x) => x.toString(16).padStart(2, "0")).join("") : null;
      if (docSha !== shaParam) {
        /* DEC-49 REGION is-case-document-unservable */
        return P.json({ ok: false, reason: "CASE_DOCUMENT_UNSERVABLE", ...rowOf("CASE_DOCUMENT_UNSERVABLE"), sha256: shaParam,
          detail: "this hash is a ratified case document's and is published, but the record could not produce "
                + "bytes that hash to it, so nothing is served. Nothing here says the document was never "
                + "ratified: op=verify still answers for the hash." }, 500);
        /* END DEC-49 REGION is-case-document-unservable */
      }
      return new Response(docBytes, { status: 200, headers: {
        "content-type": "application/octet-stream", "access-control-allow-origin": "*",
        "x-published-sha256": shaParam, "x-published-kind": "case_document",
        "content-disposition": `attachment; filename="${`${d.case_id}-${d.path}`.replace(/[^\w.\-]/g, "_")}"`,
      } });
    }
    /* D-549: the code, its check and its canned translation come from the ONE governed site;
       `detail` is this site's own sentence, byte-identical to what it said before. */
    const storeAbsent = publishedStoreAbsent(env);
    if (storeAbsent)
      return P.json({ ok: false, ...storeAbsent,
        detail: "this instance has no published object store configured, so its published bytes are "
              + "not servable. The hash is genuine and this instance cannot hand over the bytes." }, 503);

    /* DEC-34, THE CONTAINER. The manifest's own hash IS the container's
       identity — it names and hashes every part — so the zip is addressed
       by that hash like everything else here, and `format=zip` on a hash
       that is not a manifest is refused by NAME rather than quietly
       serving the part instead. */
    const wantZip = (url.searchParams.get("format") || "") === "zip";
    const isManifest = v.matches.some((m) => m.kind === "manifest");
    if (wantZip && !isManifest) {
      /* DEC-49 REGION is-not-a-container
       * D-561 (C-98.3): the code a STRING LITERAL here, its translation from its row. */
      return P.json({ ok: false, reason: "NOT_A_CONTAINER", ...rowOf("NOT_A_CONTAINER"), sha256: shaParam,
        detail: "format=zip serialises a case CONTAINER, which is addressed by its MANIFEST's hash. "
              + "This hash names a part inside a container, not a container." }, 400);
      /* END DEC-49 REGION is-not-a-container */
    }
    const raw = await pubBytes(shaParam);
    /* D-561: VERIFIED published above and absent from a bound store — OBJECT_MISSING (C-98.2), never the
       "no published part answers" sentence, which is false of this hash. */
    if (!raw) return P.json({ ok: false, ...publishedObjectMissing(), sha256: shaParam }, 404);
    if (!wantZip) {
      const m = v.matches[0] || {};
      return new Response(raw, { status: 200, headers: {
        "content-type": "application/octet-stream", "access-control-allow-origin": "*",
        "x-published-sha256": shaParam, "x-published-kind": m.kind || "",
        /* The PATH is disclosed on the way OUT and is never accepted on the
           way IN: a reader saving the file deserves its name; a caller
           asking by path would be walking the corpus. */
        "content-disposition": `attachment; filename="${(m.path || shaParam).split("/").pop().replace(/[^\w.\-]/g, "_")}"`,
      } });
    }
    let manifest = null;
    try { manifest = JSON.parse(new TextDecoder().decode(raw)); } catch { manifest = null; }
    if (!manifest || typeof manifest !== "object") {
      /* DEC-49 REGION is-manifest-unreadable
       * D-561 (C-98.4): the code a STRING LITERAL here, its translation from its row. */
      return P.json({ ok: false, reason: "MANIFEST_UNREADABLE", ...rowOf("MANIFEST_UNREADABLE"),
                    sha256: shaParam }, 500);
      /* END DEC-49 REGION is-manifest-unreadable */
    }
    const built = await containerEntries(manifest, raw, pubBytes);
    /* D-561 (C-98.5–.7): `container.mjs` is pure and reads no catalogue, so each refusal's row is attached here, by
       its code, from this module's rows. D-613: THE STATUS FOLLOWS THE CODE — a part missing and two parts claiming one
       path are conflicts in what is published (409); only a container over the bound is too large (413). Every
       `serialiseContainer` refusal used to answer 413, telling a stranger a request was too large when it named a
       path twice. */
    if (!built.ok) return P.json({ ok: false, ...built, ...rowOf(built.reason) }, 409);
    const zip = serialiseContainer(built.entries);
    if (!zip.ok) return P.json({ ok: false, ...zip, ...rowOf(zip.reason) }, zip.reason === "CONTAINER_TOO_LARGE" ? 413 : 409);
    const zipSha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", zip.bytes))]
      .map((x) => x.toString(16).padStart(2, "0")).join("");
    return new Response(zip.bytes, { status: 200, headers: {
      "content-type": "application/zip", "access-control-allow-origin": "*",
      "x-manifest-sha256": shaParam, "x-container-sha256": zipSha,
      "x-container-parts": String(built.entries.length),
      "content-disposition": `attachment; filename="${String(manifest.case || "case").replace(/[^\w.\-]/g, "_")}`
                           + `-edition-${Number(manifest.edition) || 1}.zip"`,
    } });
  }

  /* ---- op=publishedcase ---- */
  const id = url.searchParams.get("id");
  if (!id && !/^[0-9a-f]{64}$/.test(shaParam))
    return P.json({ ok: false, ...P.requiredArgument("publishedcase", "id or sha256",
      "id=<bundle id> (optional &edition=N) or sha256=<64 lowercase hex>",
      "publishedcase requires id=<bundle id> (with an optional "
                + "&edition=N, latest by default) or sha256=<the bundle sha of an edition>") }, 400);
  const q = new URLSearchParams();
  if (id) q.set("id", id);
  if (url.searchParams.get("edition")) q.set("edition", url.searchParams.get("edition"));
  /* D-309 / IC-74: a finding may serve many cases (DEC-72 clause 6), so a
     finding id alone can be an ambiguous question and the store refuses it
     `FINDING_IN_SEVERAL_CASES` naming every candidate. This forwards the
     reader's ANSWER to that question. It is a resolution aid and never an
     assertion: the store still resolves the case from the RECORD and only
     uses this to pick among memberships the record already holds, so a
     caseId a caller invents reaches nothing. */
  if (url.searchParams.get("caseId")) q.set("caseId", url.searchParams.get("caseId"));
  if (/^[0-9a-f]{64}$/.test(shaParam)) q.set("sha256", shaParam);
  /* REC-52, SITE (b). This read used to be
       `if (!c || !c.ok) return json({ ok: false, ...(c || { reason: "NOT_PUBLISHED" }) }, 404);`
     — the plane MANUFACTURING a substantive claim about the record out
     of a failure to answer. `NOT_PUBLISHED` is the store's own word for
     a real absence, and it carries the store's own sentence with it
     (store.mjs states it, and preauth-vocabulary.test.mjs reads it out
     of there rather than typing a copy); minting the bare code here
     produced a refusal that LOOKS like that answer and is not one.
     THE STORE'S OWN `NOT_PUBLISHED` IS UNTOUCHED and still reaches the
     caller verbatim on the branch below — the two must not collapse in
     either direction, and both directions have their own arm. */
  const cOut = await P.doAnswer(stub.fetch(`http://do/publishedcase?${q}`));
  if (!cOut.answered) return P.storeSilent("publishedcase");
  const c = cOut.result;
  /* MEASURED, not assumed: `Store.publishedCase` returns an object on
     every path — its own `{ok:false, reason:"NOT_PUBLISHED", detail}`
     when nothing answers. So `!c` is a store that answered with nothing
     at all, which is a silence wearing an answer's envelope and gets the
     silence's reply rather than the record's. */
  if (!c) return P.storeSilent("publishedcase");
  if (!c.ok) return P.json({ ok: false, ...c }, 404);

  /* REC-44 / DEC-44: RENDERED PER FINDING, PLURAL. This surface used to
     render one body, one basis and one frozen pair because a case was
     assumed to be one inquiry. A case is a container over one or MORE
     findings, so the body and the basis are rendered for EACH of them and
     the frozen pair travels with the finding it belongs to. There is no
     case-level `strength` anywhere in this answer and there must never be
     one — composing two findings' strengths into one letter is R2's
     forbidden composition arriving at case altitude, which is exactly what
     DEC-44's own negative control exists to catch. */
  const renderFinding = async (fnd) => {
    /* D-1: THE BODY COMES FROM THE SAME BYTES AS THE FROZEN STRENGTH. The
       document is fetched from the published bucket by the finding's own
       bundle_sha, so what a reader is shown and what the group signed cannot
       be two different documents — which is precisely the overclaim D-1
       refuses (rendering a frozen strength beside a live working body). An
       unreadable body is STATED as unavailable with its reason; it is never
       substituted from the working corpus, which would be the same overclaim
       by a shorter route. */
    const md = await pubBytes(fnd.bundle_sha);
    const text = md ? new TextDecoder().decode(md) : null;
    const fm = text ? (parseFrontmatter(text).data || {}) : null;
    /* D-549: WHICH CODE UNDER WHICH CONDITION, when the bytes are unavailable. No published store
       bound -> NO_PUBLISHED_STORE, with its check and canned translation, from its one governed
       site. A store bound and no object at this finding's hash -> OBJECT_MISSING, since D-561 with
       its own check and canned translation (C-98.2) from ITS one governed site, shared with
       publishedbytes. The two never share a site again. Each helper's `ok: false` is dropped here:
       this is one finding's body stated unavailable inside a case that answered, not a refusal. */
    const { ok: _refused, ...whyUnavailable } = text ? {}
      : (publishedStoreAbsent(env) ?? publishedObjectMissing());
    const body = text
      ? { state: "published", from_sha: fnd.bundle_sha,
          question: sectionText(text, "## Question"),
          conclusion: sectionText(text, "## Conclusion"),
          falsifies: sectionText(text, "## What Would Falsify This"),
          /* D-442 / BIO_Publication_v0_1.md §3 rule 12 (d): a member published under rule 12
             carries no `## What This Excludes` in its own bytes — the case states it once, in
             its document — so the section is read from THAT signed document for such a member,
             and from the member's own bytes for a legacy one (rule 12 (e)). `excludes_from`
             says which, so a renderer never has to infer whose words it is printing. */
          excludes: fnd.frozen_from === "case_document"
            ? (typeof fnd.case_excludes === "string" ? fnd.case_excludes : null)
            : sectionText(text, "## What This Excludes"),
          excludes_from: fnd.frozen_from === "case_document" ? "case_document" : "member_bytes",
          /* BOTH, because the document says it in two places and they are not
             the same statement. The FRONTMATTER carries what op=conclude
             authored and what the catalog gates — that is the conclusion of
             record. The SECTION carries the prose beside it, which is where a
             division writes its account and where a person reads. Returning
             only one of them would either drop the gated claim or drop the
             explanation; a renderer needs to know which is which. */
          /* REC-117 / BOB 2026-09-17, AND THIS SURFACE IS THE ONE HE NAMED.
             "a member can override either temporarily or IN THE PUBLISHED
             RECORD" — so the override travels into the signed bytes and is
             rendered from them here, beside the falsifier it stands in for.
             `falsifier_override` is `{by, at}` or NULL and never absent: a
             renderer that had to tell the two cases apart by a missing key
             would be inferring the condition, and the whole of this item is
             that the condition is STATED. A published finding whose
             falsifier is empty and whose override is null is a document
             that predates this item or was never gated — NOT a silent
             override, and a renderer must not print one as the other. */
          authored: { conclusion: typeof fm?.conclusion === "string" ? fm.conclusion : null,
                      falsifier: typeof fm?.falsifier === "string" ? fm.falsifier : null,
                      falsifier_override:
                        (typeof fm?.falsifier_override_by === "string" && fm.falsifier_override_by.trim()
                         && typeof fm?.falsifier_override_at === "string" && fm.falsifier_override_at.trim())
                          ? { by: fm.falsifier_override_by.trim(), at: fm.falsifier_override_at.trim() }
                          : null },
          detail: "`authored` is what op=conclude wrote into the frontmatter and what the gate holds "
                + "the finding to; the section fields are the prose printed beside it in the signed "
                + "bytes. `falsifier_override`, when it is not null, is the member who recorded that "
                + "NO falsifier could be stated for this finding, and when they did so." }
      : { state: "unavailable", from_sha: fnd.bundle_sha, ...whyUnavailable,
          detail: "this instance cannot hand over the bytes of that edition, so its conclusion is not "
                + "rendered here. It is NOT read from the working record instead: the frozen strength "
                + "and the rendered body must come from the same bytes." };

    /* THE BASIS LEGS, from the signed bytes, each one classified as a leg
       this surface can SERVE or one it can only NAME. `served` is decided
       against the published projection and nothing else, so a leg resting on
       working material is named and never resolved; the cited EDITION's
       frozen pair travels with it (DEC-12: a leg names an edition and does
       not silently follow a newer one). A leg rests on a FINDING, never on a
       case — C-21.2's altitude, which DEC-44 leaves exactly where it was. */
    const legs = Array.isArray(fm?.basis) ? fm.basis.filter((l) => l && typeof l.target === "string") : [];
    let registry = {};
    if (legs.length) {
      const ids = [...new Set(legs.map((l) => l.target))];
      /* REC-52, a FIFTH site and the one that argues hardest for sweeping
         rather than fixing the two the item named. `registry = (rt &&
         rt.registry) || {}` meant a store that never answered produced an
         EMPTY registry, and an empty registry makes every leg resolve to
         `served: false` with the sentence "this leg is NAMED and not
         served: what it rests on is not in the published record". That is
         a substantive claim about the published record — the same defect
         as site (b), reached by a `||` on a different line, and it would
         have been rendered as a finding's own basis on the surface a
         stranger arrives at. An empty registry is now only ever the
         store's own answer. */
      const rtOut = await P.doAnswer(stub.fetch(
        `http://do/publishedtargets?ids=${encodeURIComponent(ids.join(","))}`));
      if (!rtOut.answered) throw new P.StoreSilent("publishedcase/publishedtargets");
      const rt = rtOut.result;
      registry = (rt && rt.registry) || {};
    }
    const basis = legs.map((l) => {
      const reg = registry[l.target] || null;
      const named = l.target_edition != null ? String(l.target_edition) : null;
      const cited = reg ? (named ? reg.editions[named] : reg.editions[String(reg.latest)]) : null;
      return {
        target: l.target, role: l.role ?? "supports",
        grade: l.grade ?? null, grade_axis: l.grade_axis ?? null, grade_source: l.grade_source ?? null,
        target_edition: l.target_edition ?? null,
        served: !!cited,
        cited_edition: cited
          ? { edition: cited.edition, title: cited.title, bundle_sha: cited.bundle_sha,
              ratified_at: cited.ratified_at, case_id: cited.case_id ?? null,
              capture: cited.capture, connection: cited.connection,
              /* MK-2 / IC-142: present only where the edition froze one. */
              ...(cited.testimony ? { testimony: cited.testimony } : {}) }
          : null,
        detail: cited
          ? "this leg rests on a published finding, so it can be served from this surface."
          : "this leg is NAMED and not served: what it rests on is not in the published record, so this "
          + "surface can say the finding cites it and can hand over nothing of it.",
      };
    });
    return { ...fnd, object_type: normalizeType(fm?.object_type) ?? null, body, basis,
             bytes: `op=publishedbytes&sha256=${fnd.bundle_sha}` };
  };
  const findings = [];
  try {
    for (const fnd of c.findings || []) findings.push(await renderFinding(fnd));
  } catch (e) {
    /* REC-52: a store silence inside the renderer refuses the WHOLE read
       rather than serving a partially-rendered case, because a case
       rendered from a registry that was never consulted asserts things
       about its own basis that nobody checked. Anything else is re-thrown
       untouched — a real crash must not arrive dressed as a silence. */
    if (e instanceof P.StoreSilent) return P.storeSilent(e.op);
    throw e;
  }

  return P.json({ ok: true, ...c, findings,
    verification: {
      container: c.manifest_sha ? `op=publishedbytes&sha256=${c.manifest_sha}&format=zip` : null,
      manifest: c.manifest_sha ? `op=publishedbytes&sha256=${c.manifest_sha}` : null,
      findings: findings.map((f) => ({ bundle_id: f.bundle_id,
                                       bytes: `op=publishedbytes&sha256=${f.bundle_sha}` })),
      detail: "tamper-EVIDENT, not tamper-proof: every part is named by sha256 in the manifest, the "
            + "manifest answers by its own sha256, and EACH FINDING's signature covers that finding's "
            + "own bundle sha. Nothing here prevents a modified copy; everything here makes one "
            + "detectable by anyone holding it, without this instance's cooperation.",
    } }, 200);}
