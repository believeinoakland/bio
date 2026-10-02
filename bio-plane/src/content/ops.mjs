/* content's ops map (requirements: `build/requirements/content.md` R50; `build/extraction/legacy-store.md` §4.2 (6)).
 * Written at T19 from the legacy store's eight explicit arms (`store.mjs`' route table), each with today's behaviour, for
 * that store's one spread (K671); since that store was retired, `plane`'s store (`src/plane/store.mjs`) spreads it. The
 * parameters are read from the query, where the control plane stamps `viewer` and every authorship field (`mintedBy`,
 * `attestor`, `transcriber`), never from the body. Which credential reaches each op is `op-declarations`' and
 * `control-plane`'s, never this map's. */

/** The retired legacy store's one JSON reader for a query value, kept as it was: `null` for absent or unreadable,
 *  never a throw. */
const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };

/** R50: the module's route arms, keyed by op name, each a function of no arguments answering what its service answers. */
export function contentOps(content, url, body) {
  const q = (k) => url.searchParams.get(k);
  return {
    /* REC-83 / IC-84 (4): THE FIXED-KEY CONTENT READ (R17–R19). `extras` hands the read EVERY parameter name that
       arrived, so a predicate or a page is refused by name rather than ignored. */
    content: () => content.contentRead({ id: q("id"), viewer: q("viewer"), extras: [...url.searchParams.keys()] }),
    /* D-419: the crop of a cited PDF image (R32). */
    contentcrop: () => content.cropOf({ contentId: q("id"), viewer: q("viewer") }),
    /* SK-7 (Bob's 5.7): MARKING A PASSAGE CITABLE (R15). `mintedBy` is the query's stamp and the body's is never read,
       so a machine credential cannot post a member's name into the field that says who did this. */
    contentmint: () => content.contentMint({ bundleId: (body || {}).bundleId, extent: (body || {}).extent,
                                             at: (body || {}).at || null, mintedBy: q("mintedBy"), viewer: q("viewer") }),
    /* CPDF-10: the attestations over one capture and what a leg citing a given region may claim (R44). */
    textattest: () => content.attestationsFor(q("sha256"),
      q("page") == null ? null : { page: Number(q("page")), rect: safeJson(q("rect")) },
      q("viewer"), q("limit")),
    /* CPDF-10 / SK-7: the attestation itself (R43). The attestor is the query's stamp and the body's `member` is never
       read; an absent stamp reaches `checkAttestation` as an absent member and is refused there. */
    attesttext: () => content.attestText({ ...(body || {}), member: q("attestor"), viewer: q("viewer") }),
    /* REC-87 / IC-128: TRANSCRIBE (R23, R24). The typist is the query's stamp, never a body field. */
    transcribe: () => content.transcribe({
      bundleId: (body && body.bundleId) || null,
      extent: body && body.extent !== undefined ? body.extent : null,
      text: body ? body.text : null,
      at: (body && body.at) || null,
      transcriber: q("transcriber"),
      viewer: q("viewer"),
    }),
    /* A second member's attestation of a typing (R25): the content id from the body, else the query; the attestor the
       query's stamp. */
    transcriptionattest: () => content.transcriptionAttest({
      contentId: (body && body.contentId) || q("contentId"),
      at: (body && body.at) || null,
      note: body ? body.note : null,
      attestor: q("attestor"),
      viewer: q("viewer"),
    }),
    /* One typing, its text and its attestations (R26). */
    transcription: () => content.transcriptionRead({ id: q("id"), viewer: q("viewer") }),
  };
}
