/* What a case's findings reach, and what of it this copy holds whole (requirements: `build/requirements/case-authoring.md`,
 * R44–R50; DEC-112 (4)(5), DEC-119, DEC-96 item 4). Kept apart from `index.mjs` so the case's disclosures (R31–R37,
 * R43–R53) can leave this module whole along that seam (K617).
 *
 * A CHAIN REACHES WHAT ITS LEGS TARGET (R46), followed through inquiry legs to `strength`'s depth bound (its R2), and it
 * STOPS at a leg on another group's finding (R50): that material is the source group's, in its own case file. The walk
 * reads only stated read contracts — inquiry R40's `inquiry_basis`, record-core R37's `bundles`, content R45's
 * `content`, provenance R48's `register` — through the `io` it is handed, so it holds no store of its own. A target the
 * publisher may not see is not followed and not listed (R33: sight at the act governs). */

/** The material one leg reaches: the passage's own capture when the leg names a content row, else every capture its
 *  document registers. Answers `[{ref, kind, sha}]`; `kind` is `observation` for a member's authored words (provenance
 *  R48's `authored`), else `document`. */
function materialsOfLeg(leg, io) {
  const cap = leg.content_id ? io.one(`SELECT capture_sha FROM content WHERE content_id=?`, leg.content_id) : null;
  const regs = cap && cap.capture_sha
    ? io.rows(`SELECT capture_sha, bundle_id, authored FROM register WHERE capture_sha=?`, cap.capture_sha)
    : io.rows(`SELECT capture_sha, bundle_id, authored FROM register WHERE bundle_id=? ORDER BY capture_sha`, leg.target_id);
  if (cap && cap.capture_sha && !regs.length) return [{ ref: leg.target_id, kind: "document", sha: cap.capture_sha }];
  return regs.map((r) => ({ ref: r.bundle_id, kind: Number(r.authored) === 1 ? "observation" : "document",
                            sha: r.capture_sha }));
}

/** R44, R45: what of one material this copy holds whole. Its captured bytes are held when record-core's file at the
 *  register's `(bundle_id, path)` exists, inline or by blob (`publishCase` is synchronous, R18, so object storage is not
 *  asked). A document's extracted text is `extraction.unitsOf`'s units in reading order, each `{extent, ref, text}`, as
 *  canonical JSON, held whole only when the index is `whole` and no unit was cut; `text_sha` is its SHA-256. An
 *  observation's text is its own bytes, so it has no separate text (`text_sha` null). Answers `{bytes, text, text_sha,
 *  whole, missing}`, `missing` naming what is not held. */
export function materialHeld(m, io) {
  const reg = io.one(`SELECT bundle_id, path FROM register WHERE capture_sha=?`, m.sha);
  let bytes = false;
  try {
    const f = reg ? io.readFile(reg.bundle_id, reg.path) : null;
    bytes = !!(f && (typeof f.text === "string" || f.blobSha));
  } catch { bytes = false; }
  if (m.kind === "observation")
    return { bytes, text: bytes, text_sha: null, whole: bytes, missing: bytes ? [] : ["text"] };
  let units = null;
  try { units = io.unitsOf(m.sha); } catch { units = null; }
  const list = units && Array.isArray(units.units) ? units.units : [];
  const text = !!(units && units.state === "whole" && list.length && !list.some((u) => u.truncated));
  const textSha = text ? io.sha256(io.canonicalJson(list.map((u) => ({ extent: u.extent, ref: u.ref, text: u.text }))))
                       : null;
  const missing = [...(bytes ? [] : ["bytes"]), ...(text ? [] : ["extracted_text"])];
  return { bytes, text, text_sha: textSha, whole: bytes && text, missing };
}

/** R45 (K1134 Q6, BOB's decision 15): the `materials:` and `material_attestations:` rows (`case-grammar` R12) for the
 *  materials `chainsOf` reached, each with what `materialHeld` found. `facts(sha)` is R35's read of a capture (grade,
 *  co-attestation, signed accounts), `origin(sha)` its earliest captured address, `registered(sha)` its register row,
 *  `member(m)` the attesting member's row or rows as R48 states them, `group` the producing group's slug. Rows, in the
 *  materials' order:
 *   - the attesting member's (`member`): the capturing member's signed accounts, or an observation's author, as their
 *     level allows (R48 decides what of them is stated);
 *   - its co-attestation (`co_attestation`), a timestamp and a co-archive, each where held (R35);
 *   - the project's (`project`): the register row holding it in the project's record, `recorded_in` its bundle;
 *   - the group's (`group`): one row whose signature is the literal `case`, the case document's own.
 *  No new table and no new act holds the project's or the group's attestation. */
export function materialRows(materials, { project, group, at, facts, origin, registered, member }) {
  const rows = [], attestations = [];
  for (const m of materials) {
    const f = m.kind === "document" ? facts(m.sha) : null;
    rows.push({ ref: m.ref, kind: m.kind, sha: m.sha, text_sha: m.held.text_sha, origin: origin(m.sha),
                archived_copy: f ? f.co_archive ?? null : null, included: m.included, rests_under: m.rests_under });
    attestations.push(...member(m, f).map((x) => ({ ref: m.ref, by_kind: "member", recorded_in: null, ...x })));
    if (f && f.timestamp_at)
      attestations.push({ ref: m.ref, by_kind: "co_attestation", by: "timestamp", level: null, at: f.timestamp_at,
                          signature: null, recorded_in: null });
    if (f && f.co_archive)
      attestations.push({ ref: m.ref, by_kind: "co_attestation", by: f.co_archive, level: null, at: null,
                          signature: null, recorded_in: null });
    const reg = registered(m.sha);
    if (reg)
      attestations.push({ ref: m.ref, by_kind: "project", by: project, level: null, at: reg.registered ?? null,
                          signature: null, recorded_in: reg.bundle_id });
    attestations.push({ ref: m.ref, by_kind: "group", by: group, level: null, at, signature: "case", recorded_in: null });
  }
  return { rows, attestations };
}

/** R46, R50: each member's chain, to `depth`. `members` are `[{id, role}]`. Answers `{materials, refs, truncated}`:
 *  `materials` one entry per capture reached, in first-reached order, `{ref, kind, sha, members: [id], rests_under}`
 *  (`load_bearing` when any load-bearing member reaches it, R12 of `case-grammar`); `refs` one entry per (member, leg)
 *  on another group's finding, `{member, leg_of, ord, ref}`; `findings` every inquiry reached, members first, each
 *  `{id, member}` once per member. `io.parseRef(target)` is `inquiry-grammar`'s reading of a ref (null for a local id);
 *  `io.visible(id)` the publisher's sight. Never throws on a missing row: an unreadable target reaches nothing. */
export function chainsOf(members, io, depth) {
  const materials = new Map();
  const refs = [];
  const findings = [];
  for (const m of members) {
    const seen = new Set([m.id]);
    let frontier = [m.id];
    findings.push({ id: m.id, member: m.id });
    for (let d = 0; d < depth && frontier.length; d++) {
      const next = [];
      for (const inq of frontier) {
        for (const leg of io.rows(`SELECT ord, target_id, content_id, grade_source FROM inquiry_basis WHERE bundle_id=?
                                     ORDER BY ord`, inq)) {
          const t = typeof leg.target_id === "string" ? leg.target_id : "";
          if (!t) continue;
          if (io.parseRef(t)) { refs.push({ member: m.id, leg_of: inq, ord: Number(leg.ord), ref: t }); continue; }
          if (!io.visible(t)) continue;
          const b = io.one(`SELECT object_type FROM bundles WHERE bundle_id=?`, t);
          const type = b ? io.normalizeType(b.object_type) : null;
          if (type === "inquiry") {
            if (!seen.has(t)) { seen.add(t); next.push(t); findings.push({ id: t, member: m.id }); }
            continue;
          }
          if (type !== "information") continue;
          for (const x of materialsOfLeg(leg, io)) {
            const held = materials.get(x.sha) || { ...x, members: [], rests_under: "supporting" };
            if (!held.members.includes(m.id)) held.members.push(m.id);
            if (m.role === "load_bearing") held.rests_under = "load_bearing";
            materials.set(x.sha, held);
          }
        }
      }
      frontier = next;
    }
  }
  return { materials: [...materials.values()], refs, findings };
}
