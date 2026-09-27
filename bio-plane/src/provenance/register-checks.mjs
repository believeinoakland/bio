/* provenance — the C-18 register arms (R42–R46; K49, K72 (4)), moved from the check catalogue (`bio-checks.mjs`,
 * legacy-checks) with their comments, unchanged in what they find: C-18.1 (the intake provenance register's shape at
 * @1 and @2, release authority and the ratification fence), C-18.3 and C-18.4 (register integrity), C-18.9 (what a
 * capture must establish before it may be published). Each keeps its catalogue id and severity. C-18.6's hashing of
 * the stored bytes (R45) is asynchronous and stays in the catalogue, run by the gate before the transaction (K72 (4));
 * C-18.5 went to monitoring and C-18.7 stays with C-18.8 in promotion (K49).
 *
 * They run in three places, so the move loses none of them: at every promotion, as this module's registered check
 * (`index.mjs`); at the gate, after `runGate` (`withRegisterChecks`); and in the audit (`provenanceAudit`). */

import { isMachineIdentity, ACTOR_CLASSES } from "../../checks/bio-checks.mjs";

/* The catalogue's finding shape (bio-checks' `f`): check id, severity, message, and optionally repairs and a code. */
function f(check, severity, message, repairs, code) {
  const out = { check, severity, message };
  if (repairs) { out.repairable = true; out.repairs = repairs; }
  if (code) out.code = code;
  return out;
}

function asText(v) {
  if (typeof v === 'string') return v;
  return new TextDecoder().decode(v);
}

/** Presence semantics (1.13.0): a path exists if its bytes are in files OR
 *  it is declared elided (present in the store, deliberately not carried).
 *  Used ONLY by existence assertions; byte checks read ctx.files directly. */
function hasFile_(ctx, path) {
  return ctx.files.has(path) || (ctx.elided && ctx.elided.has(path));
}

const CAPTURE_GRADES = ['A', 'B', 'C'];
const ORIGIN_KINDS = ['named_request', 'sweep', 'member'];
const CAPTURE_ENCODINGS = ['utf8', 'base64', 'binary'];
const HIST_TS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const RAW_SHA_RE = /^[0-9a-f]{64}$/;

/** C-18.1: intake provenance register shape, release authority, and the
 *  ratification fence (sweep intake lands at collected, never higher). */
/** C-18.9: what a capture must establish before it may be PUBLISHED.
 *
 * REVISED 2026-07-31, and the revision is a correction of a conflation rather
 * than a loosening. Two different things were being called "authority":
 *
 *   PROVENANCE authority  who served us the bytes at each hop. We always know
 *                         our own leg, and an archive hop names the archive.
 *                         This is what a published hash actually attests.
 *   CONTENT authority     who ISSUED the document. Frequently unknown, and
 *                         legitimately so.
 *
 * The old rule refused publication whenever the CONTENT authority was
 * undetermined. That recreated, at the publication gate, exactly the failure
 * D-97 removed at the intake gate: a hard refusal on a missing attribution
 * pressures whoever wants to publish into INVENTING one, which is the false
 * assertion the three-valued ruling exists to prevent. Moving the pressure
 * later in the pipeline does not make it less corrupting; it makes it worse,
 * because by then a member has done the work and wants it out.
 *
 * What a published hash claims is: these bytes, this address, this date, this
 * chain of custody. It does not claim the document is authentic municipal
 * record. So the gate belongs on the CHAIN:
 *
 *   1. A bundle at or past verified must carry a provenance chain for every
 *      captured document. No chain is not "we fetched it ourselves"; it is a
 *      claim with nothing behind it.
 *   2. Every hop must name WHO. An unattributed hop cannot support the only
 *      claim publication makes.
 *   3. Content authority MAY be undetermined, but it must be STATED, dated,
 *      and carried into what the public reads. Silence is refused. Publishing
 *      "we do not know who issued this, and here is when we recorded that" is
 *      honest; publishing it with the question quietly absent is not.
 *
 * Ratification remains a member's signed act, so nothing here publishes
 * anything by itself: this decides what a member is ALLOWED to sign for. */
function checkAuthorityPublishable(ctx, findings) {
  const hist = Array.isArray(ctx.fm?.state_history) ? ctx.fm.state_history : [];
  const atFence = ctx.fm?.current_state === 'verified' || hist.some(e => e && e.to_state === 'verified');
  if (!atFence) return;
  const raw = ctx.files.get('data/provenance.json');
  if (!raw) return; // pre-contract bundle; C-18.1 governs register presence
  let reg; try { reg = JSON.parse(asText(raw)); } catch { return; /* C-14.3 reports unparsable JSON */ }
  const docs = reg && Array.isArray(reg.documents) ? reg.documents : [];
  docs.forEach((d, i) => {
    if (!d || typeof d !== 'object') return; // C-18.1 reports the shape
    const chain = d.provenance_chain;
    /* REC-54 / D-200, 2026-08-05: THESE WERE ONE FINDING AND THEY ARE THREE
       DIFFERENT FACTS ABOUT THE RECORD. `!Array.isArray(chain) || chain.length
       === 0` collapsed "nobody ever recorded a chain here", "something wrote a
       chain field that is not a chain" and "somebody recorded a chain and it
       came out empty" into one message reading "with no provenance_chain".
       They are not the same claim and they do not have the same repair: the
       first is a gap in what was captured, the second is a writer producing
       malformed output, and the third is a derivation that RAN and FOUND
       NOTHING — which is a statement about the route, not an absence of one.
       An operator reading the audit could not tell which they had, and the ten
       live bundles D-200 names are ALL the first kind (measured 2026-08-05:
       every one has the key ABSENT, not empty), a fact the old message could
       not express. Nothing is weakened: every input that produced an error
       before produces an error now, which `provenance-chain.test.mjs` asserts
       arm by arm rather than leaving to inspection. */
    if (!('provenance_chain' in d)) {
      findings.push(f('C-18.9', 'error', `provenance documents[${i}] is at or past verified and records no provenance_chain at all: a published hash claims these bytes came from somewhere by some route, and this document names none`,
        ['record the chain of custody for this capture, one hop per party, from us back to the source',
         'or, where the capture record already holds the route, derive it from that evidence with op=provenancechain'],
        /* REC-56 / D-206: the codes REC-54's three findings needed to reach a
           reader through the TALLY and not only through the bounded offender
           sample. One per arm, and they are the three facts in the comment
           above in the order it states them. */
        'chain-absent'));
    } else if (!Array.isArray(chain)) {
      findings.push(f('C-18.9', 'error', `provenance documents[${i}] is at or past verified and its provenance_chain is ${chain === null ? 'null' : typeof chain}, not an array of hops: whatever wrote this did not write a chain`,
        ['record the chain of custody as an array of hops, one per party, from us back to the source'],
        'chain-not-an-array'));
    } else if (chain.length === 0) {
      findings.push(f('C-18.9', 'error', `provenance documents[${i}] is at or past verified and records an EMPTY provenance_chain: a chain was recorded for this document and it names no party, which is a different fact from never having recorded one and must not be repaired by assuming a route`,
        ['name the parties that actually served these bytes, one hop each',
         'or state plainly that the route is undetermined rather than leaving an empty chain standing at verified'],
        'chain-empty'));
    } else {
      chain.forEach((hop, h) => {
        if (!hop || typeof hop !== 'object' || typeof hop.who !== 'string' || hop.who.trim() === '') {
          findings.push(f('C-18.9', 'error', `provenance documents[${i}].provenance_chain[${h}] names no attestor: an unattributed hop cannot support the claim a published hash makes`,
            ['name the party that served these bytes at this hop', 'or remove the hop if it did not happen']));
        }
      });
    }
    /* Undetermined content authority does NOT block publication, and this is
       the deliberate change. What blocks it is undetermined and SILENT: a
       reader of the published record must be able to see that the question was
       asked and not answered, and when. */
    if (d.authority_state === 'undetermined') {
      const basis = d.authority_basis;
      if (typeof basis !== 'string' || basis.trim() === '') {
        findings.push(f('C-18.9', 'error', `provenance documents[${i}] is content-authority undetermined and this bundle is at or past verified, but states no authority_basis: publishing an unanswered question is honest only when the record says it is unanswered and since when`,
          ['record a dated authority_basis saying what was tried and what it established',
           'or determine the authority through the task list and record the determination']));
      }
    } else if (d.authority_state === 'determined' && (typeof d.authority !== 'string' || d.authority.trim() === '')) {
      findings.push(f('C-18.9', 'error', `provenance documents[${i}] declares authority_state 'determined' with no authority named, and this bundle is at or past verified`,
        ['name the issuing party', "or correct authority_state to 'undetermined' with a dated basis"]));
    }
  });
}

function checkReleaseAuthority(ctx, findings) {
  if (ctx.fm?.object_type !== 'information') return;
  const raw = ctx.files.get('data/provenance.json');
  if (!raw) return; // pre-contract bundle: the register is the declaration
  let reg;
  try { reg = JSON.parse(asText(raw)); } catch { return; /* C-14.3 reports unparsable JSON */ }
  const docs = reg && Array.isArray(reg.documents) ? reg.documents : null;
  if (!docs) {
    findings.push(f('C-18.1', 'error', 'data/provenance.json must be {"documents": [...]} (the intake provenance register)'));
    return;
  }
  let sweepOrigin = false;
  docs.forEach((d, i) => {
    if (!d || typeof d !== 'object') { findings.push(f('C-18.1', 'error', `provenance documents[${i}] is not an object`)); return; }
    /* D-97: authority is THREE-VALUED (RULED, AUTHORITY-AND-TRUST.md). A
       document either carries an authority, or carries
       authority_state 'undetermined' with a basis saying why the
       determination could not be made. Undetermined must be STATED, never
       inferred from absence; a document with neither is missing its source
       axis, exactly as before the ruling. Documents from before the ruling
       carry authority with no authority_state and remain conformant: the
       corpus is non-uniform by design and provenance is never reshaped. */
    for (const k of ['file', 'locator', 'retrieved']) {
      if (!d[k]) findings.push(f('C-18.1', 'error', `provenance documents[${i}] missing '${k}'`));
    }
    const aState = d.authority_state;
    if (aState !== undefined && !['determined', 'undetermined'].includes(aState)) {
      findings.push(f('C-18.1', 'error', `provenance documents[${i}].authority_state '${aState}' is not 'determined' or 'undetermined'`));
    }
    if (aState === 'undetermined') {
      if (!d.authority_basis) findings.push(f('C-18.1', 'error', `provenance documents[${i}] is authority-undetermined but names no authority_basis: why it could not be established is itself a recorded fact`));
    } else if (!d.authority) {
      findings.push(f('C-18.1', 'error', `provenance documents[${i}] missing 'authority' and does not state authority_state 'undetermined': the source axis is named or its absence is declared, never left blank`));
    }
    if (aState === 'determined' && !d.authority_basis) {
      findings.push(f('C-18.1', 'error', `provenance documents[${i}] is authority-determined but names no authority_basis: how it was reached is recorded in BOTH cases`));
    }
    if (d.file && !hasFile_(ctx, String(d.file)) && !Array.isArray(d.parts)) {
      findings.push(f('C-18.1', 'error', `provenance documents[${i}] names '${d.file}' which does not exist in the bundle`));
    }
    const cap = d.capture;
    if (!cap || typeof cap !== 'object') findings.push(f('C-18.1', 'error', `provenance documents[${i}] missing capture block`));
    else {
      if (!cap.method) findings.push(f('C-18.1', 'error', `provenance documents[${i}].capture missing 'method'`));
      /* MK-1 / D-184 (`MEMBER-KNOWLEDGE-DESIGN.md` §3): AN AUTHORED DOCUMENT
         CARRIES NO CAPTURE GRADE, and the absence is the statement. The capture
         axis measures the act of reading a document in (DEC-21's amendment), and
         a member's own words were not read in from anywhere — so a letter here
         would be true of the bytes (we hold exactly what the member wrote) and
         would read as strength the observation does not have. Its grade is
         testimony, on MK-2's axis (IC-142). RULED RIGHT by BOB #14, 2026-09-18
         (§3 says so). `authored === true` is the ONLY
         spelling that switches the arm: the store's fence (C-53.8) refuses the
         flag on any document the testimony path did not write, so the catalogue
         can read it as said. */
      if (d.authored === true) {
        if (cap.grade !== undefined && cap.grade !== null) findings.push(f('C-18.1', 'error', `provenance documents[${i}] is a member's authored observation and carries capture.grade '${cap.grade}': the capture axis does not apply to an authored document, and a letter on it would read as strength the observation does not have (MEMBER-KNOWLEDGE-DESIGN.md §3)`));
        if (cap.actor_class !== 'member') findings.push(f('C-18.1', 'error', `provenance documents[${i}] is a member's authored observation and its capture.actor_class is '${cap.actor_class}', not 'member'`));
      } else if (!CAPTURE_GRADES.includes(cap.grade)) findings.push(f('C-18.1', 'error', `provenance documents[${i}].capture.grade '${cap.grade}' is not one of: ${CAPTURE_GRADES.join(', ')}`));
      if (!ACTOR_CLASSES.includes(cap.actor_class)) findings.push(f('C-18.1', 'error', `provenance documents[${i}].capture.actor_class '${cap.actor_class}' is not one of: ${ACTOR_CLASSES.join(', ')}`));
    }
    const or = d.origin;
    /* MK-1: the design's first §7 refusal, stated in the catalogue as well as
       fenced at the write (C-53.7) — an authored observation's origin is the
       member who made it. */
    if (d.authored === true && (!or || typeof or !== 'object' || or.kind !== 'member')) {
      findings.push(f('C-18.1', 'error', `provenance documents[${i}] is a member's authored observation and its origin.kind is '${or && typeof or === 'object' ? or.kind : or}', not 'member'`));
    }
    if (!or || typeof or !== 'object' || !ORIGIN_KINDS.includes(or.kind)) {
      findings.push(f('C-18.1', 'error', `provenance documents[${i}].origin.kind must be one of: ${ORIGIN_KINDS.join(', ')}`));
    } else if (or.kind === 'sweep') {
      sweepOrigin = true;
      if (!or.matched_sweep) findings.push(f('C-18.1', 'error', `provenance documents[${i}].origin (sweep) missing 'matched_sweep'`));
      if (!or.deeming_actor) findings.push(f('C-18.1', 'error', `provenance documents[${i}].origin (sweep) missing 'deeming_actor'`));
    }
  });
  /* Release authority: the collected -> verified transition is a named
     member's decision, AI-assisted but member-made (doctrine 4a).

     REC-56 / D-203, 2026-08-05: BOTH ARMS BELOW ADVISED ACTS NOBODY CAN
     PERFORM, and it was not only the `collected` half the item was routed for.

       - `return the bundle to collected` / `set current_state to collected`.
         `STATES.information.edges` carries no `verified -> collected`, so
         appending that transition fires C-4.2 (`transition verified ->
         collected is not a legal information edge`) and setting `current_state`
         WITHOUT appending fires C-4.2's other arm (`current_state 'collected'
         disagrees with last transition to 'verified'`). MEASURED here rather
         than assumed: the advice produces a second error in BOTH readings, so
         there was no careful way to follow it.
       - `a named member re-makes the release decision` and `a named member
         ratifies and records the collected -> verified transition`. Both arms
         only fire on a bundle that is AT OR PAST `verified`, and `op=release`
         — the one act that writes that edge — refuses anything already there
         (ILLEGAL_TRANSITION, "release is not repeatable"). So the FIRST repair
         in each array was as unreachable as the second, which is the part the
         routing did not predict.

     What replaces them names acts the plane actually offers, and nothing here
     rules on DEC-56. `op=retire` is real, reachable from `verified`, and
     terminal, and it is named with its edge; recording the defect and raising
     it is always followable. The third line states the FENCE rather than a
     destination — an operator who edits `current_state` by hand gets C-4.2
     whatever DEC-56 decides, because C-4.2 checks the transition against
     whatever the machine carries at the time. If Bob rules a retraction edge,
     these strings do not become false; they become incomplete, and the
     source-level walk in `test/repair-reachability.test.mjs` re-derives what is
     reachable from `STATES` and `deriveActs` rather than from a list here. */
  const hist = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];
  const releases = hist.filter(e => e && e.from_state === 'collected' && e.to_state === 'verified');
  for (const e of releases) {
    const a = String(e.author || '').toLowerCase();
    /* REC-46: one predicate. The word list was one of three answers to this
       question and knew nothing of the two spellings the control plane mints. */
    if (!a || isMachineIdentity(a)) {
      findings.push(f('C-18.1', 'error', `collected -> verified transition authored by '${e.author}': release is a named member's decision, never a surface or AI identity (intake doctrine 4a)`,
        ['retire this bundle with the reason recorded (verified -> retired, op=retire), if the release cannot stand as it is',
         'or record the defect against this release in Review Notes and raise it, so the record carries the doubt rather than a repair nobody can perform',
         'the state is not moved back by hand: C-4.2 refuses any transition that is not an edge in this machine, so hand-editing current_state or state_history produces a second error on top of this one']));
    }
  }
  // The ratification fence: sweep intake lands at collected, never higher
  // (doctrine Section 4). Verified, now or ever, requires a member-authored
  // release transition.
  const everVerified = ctx.fm.current_state === 'verified' || hist.some(e => e && e.to_state === 'verified');
  /* REC-46: the same predicate NEGATED — the one site in this family that asks
     whether a person DID act rather than whether a machine did. It must move
     with its complement above or the fence and the refusal disagree. */
  const memberRelease = releases.some(e => { const a = String(e.author || '').toLowerCase(); return a && !isMachineIdentity(a); });
  if (sweepOrigin && everVerified && !memberRelease) {
    findings.push(f('C-18.1', 'error', 'sweep-origin intake lands at collected, never higher: verified requires per-document human ratification, a member-authored collected -> verified transition (intake doctrine Section 4)',
      ['retire this bundle with the reason recorded (verified -> retired, op=retire), if this intake cannot be ratified as it stands',
       'or record in Review Notes that it reached verified without the per-document ratification the doctrine requires, and raise it: op=release writes the collected -> verified edge and refuses a bundle already at verified, so the ratification cannot be re-made in place',
       'the state is not moved back by hand: C-4.2 refuses any transition that is not an edge in this machine']));
  }
}

/** C-18.3 (error): a missed corroboration under the ring-once rule (identical
 *  content is corroboration on one entry, never two review items). TWO arms:
 *  the RAW arm folds captures with the same capture.sha256; the NORMALISED arm
 *  (CONSTRUCTS Step 2 / FW-4) folds captures whose determined evidentiary digest
 *  matches though their raw bytes differ — the same document served with a
 *  different __VIEWSTATE or furniture, which raw byte comparison cannot see. An
 *  undetermined (null) evidentiary digest is never bucketed. C-18.4 (warn, F4):
 *  crucial-criticality material whose register entries lack both co_archive
 *  and timestamp. Both scoped by declared contract (register present). */
function checkRegisterIntegrity(ctx, findings) {
  if (ctx.fm?.object_type !== 'information') return;
  const raw = ctx.files.get('data/provenance.json');
  if (!raw) return;
  let reg;
  try { reg = JSON.parse(asText(raw)); } catch { return; }
  const docs = reg && Array.isArray(reg.documents) ? reg.documents : null;
  if (!docs) return; // C-18.1 reports shape
  const byHash = {};
  /* The NORMALISED bucket (CONSTRUCTS Step 2 / FW-4). Keyed by the evidentiary
     digest — presentational and mechanical normalised — so two captures of the
     SAME document that differ only in per-render machinery (an ASP.NET __VIEWSTATE)
     or furniture fold into ONE corroboration, which the raw-hash bucket above
     cannot see because their raw bytes differ. Only a DETERMINED digest is bucketed:
     an undetermined capture records `evidentiary: null` and two of those must never
     be treated as equal (an equality that costs nothing to produce is not evidence),
     so nulls are skipped rather than collated. */
  const byEvid = {};
  for (let i = 0; i < docs.length; i++) {
    const h = docs[i] && docs[i].capture && docs[i].capture.sha256;
    if (h) (byHash[h] = byHash[h] || []).push(i);
    const dg = docs[i] && docs[i].profile && docs[i].profile.digests;
    if (dg && dg.determined === true && typeof dg.evidentiary === 'string')
      (byEvid[dg.evidentiary] = byEvid[dg.evidentiary] || []).push(i);
  }
  for (const h of Object.keys(byHash)) {
    if (byHash[h].length > 1) {
      findings.push(f('C-18.3', 'error', `capture hash ${h.slice(0, 16)}… appears in ${byHash[h].length} register documents (indices ${byHash[h].join(', ')}); identical content is corroboration on one entry, never duplicate review items`,
        ['fold the duplicates into corroborations[] on the earliest entry', 'if the captures genuinely differ, correct the recorded hashes']));
    }
  }
  for (const e of Object.keys(byEvid)) {
    const idx = byEvid[e];
    if (idx.length < 2) continue;
    /* Fire ONLY when at least two DIFFERENT raw captures share the evidentiary
       digest: a bucket whose members are all one raw sha is identical bytes and is
       already reported by the raw arm above, so reporting it again would double-count
       the same corroboration. This arm is exactly the duplicate the raw arm cannot
       see — same substance, different viewstate/boilerplate. */
    const rawShas = new Set(idx.map((i) => docs[i] && docs[i].capture && docs[i].capture.sha256).filter(Boolean));
    if (rawShas.size < 2) continue;
    findings.push(f('C-18.3', 'error', `${idx.length} register documents (indices ${idx.join(', ')}) share the evidentiary digest ${e.slice(0, 16)}… but differ in raw bytes; the substance is identical and only per-render machinery or furniture differs — corroboration on one entry, never duplicate review items`,
      ['fold the duplicates into corroborations[] on the earliest entry', 'if the substance genuinely differs the normalisation is wrong — correct the handler']));
  }
  if (ctx.fm.criticality === 'crucial') {
    for (let i = 0; i < docs.length; i++) {
      const d = docs[i];
      if (!d || typeof d !== 'object') continue;
      if (!d.co_archive && !d.timestamp) {
        findings.push(f('C-18.4', 'warn', `crucial-criticality document[${i}] (${d.file || '?'}) carries neither co_archive nor timestamp; a reviewing member must verify co-attestation before release (F4)`,
          ['attach a co-archive or trusted timestamp', 'record the verified provenance in Review Notes at ratification']));
      }
    }
  }
}

function checkInfo2Register(ctx, findings) {
  if (ctx.fm?.object_type !== 'information' || ctx.fm?.schema !== 'information@2') return;
  const raw = ctx.files.get('data/provenance.json');
  if (!raw) {
    findings.push(f('C-18.1', 'error', 'information@2 requires data/provenance.json: the schema bump makes the intake provenance register mandatory'));
    return;
  }
  let reg; try { reg = JSON.parse(asText(raw)); } catch { return; } // C-14.3 reports
  const docs = reg && Array.isArray(reg.documents) ? reg.documents : null;
  if (!docs) return; // C-18.1 v1 shape check reports
  for (let i = 0; i < docs.length; i++) {
    const d = docs[i]; if (!d || typeof d !== 'object') continue;
    const cap = d.capture && typeof d.capture === 'object' ? d.capture : {};
    if (!CAPTURE_ENCODINGS.includes(cap.encoding)) {
      findings.push(f('C-18.1', 'error', `provenance documents[${i}].capture.encoding '${cap.encoding}' is not one of: ${CAPTURE_ENCODINGS.join(', ')} (@2)`));
    }
    const or = d.origin && typeof d.origin === 'object' ? d.origin : {};
    if (or.kind === 'member') {
      if (cap.actor_class !== 'member') {
        findings.push(f('C-18.1', 'error', `provenance documents[${i}]: member-origin capture must record actor_class 'member' (@2)`));
      }
      const c = d.custody;
      if (!c || typeof c !== 'object') {
        findings.push(f('C-18.1', 'error', `provenance documents[${i}]: member-origin document missing custody block {holder, obtained, setting, attestation} (doctrine 3a) (@2)`));
      } else {
        for (const k of ['holder', 'setting', 'attestation']) {
          if (!c[k]) findings.push(f('C-18.1', 'error', `provenance documents[${i}].custody missing '${k}' (@2)`));
        }
        if (!HIST_TS_RE.test(c.obtained || '')) {
          findings.push(f('C-18.1', 'error', `provenance documents[${i}].custody.obtained '${c.obtained}' is not YYYY-MM-DDTHH:MM:SSZ (@2)`));
        }
      }
      if (d.attestation_attempts === undefined) {
        findings.push(f('C-18.1', 'error', `provenance documents[${i}]: member-origin document missing attestation_attempts; the 7.7 asymmetry is recorded honestly, attempted false with the reason in note (@2)`));
      }
    }
    if (d.attestation_attempts !== undefined) {
      if (!Array.isArray(d.attestation_attempts)) {
        findings.push(f('C-18.1', 'error', `provenance documents[${i}].attestation_attempts must be an array (@2)`));
      } else {
        d.attestation_attempts.forEach((a, j) => {
          if (!a || typeof a !== 'object' || !a.service || typeof a.attempted !== 'boolean' || typeof a.ok !== 'boolean') {
            findings.push(f('C-18.1', 'error', `provenance documents[${i}].attestation_attempts[${j}] lacks the {service, attempted, ok} shape (@2)`));
          }
        });
      }
    }
    if (d.parts !== undefined) {
      if (!Array.isArray(d.parts) || !d.parts.length) {
        findings.push(f('C-18.1', 'error', `provenance documents[${i}].parts must be a nonempty array (@2)`));
      } else {
        if (!RAW_SHA_RE.test(cap.sha256 || '')) {
          findings.push(f('C-18.1', 'error', `provenance documents[${i}]: parts require capture.sha256 over the reassembled whole (@2)`));
        }
        d.parts.forEach((p, j) => {
          if (!p || typeof p !== 'object' || !p.file || !RAW_SHA_RE.test(p.sha256 || '') || !(Number.isInteger(p.bytes) && p.bytes > 0)) {
            findings.push(f('C-18.1', 'error', `provenance documents[${i}].parts[${j}] lacks the {file, sha256, bytes} shape (@2)`));
          } else if (!hasFile_(ctx, String(p.file))) {
            findings.push(f('C-18.1', 'error', `provenance documents[${i}].parts[${j}] names '${p.file}' which does not exist in the bundle (@2)`));
          }
        });
      }
    }
    if (d.derived !== undefined) {
      const dv = d.derived;
      const shapeOk = dv && typeof dv === 'object' && dv.transform && dv.reason && (dv.from_file || dv.from_ref);
      if (!shapeOk) {
        findings.push(f('C-18.1', 'error', `provenance documents[${i}].derived lacks the {transform, reason, from_file|from_ref} shape (doctrine 4a) (@2)`));
      } else if (dv.from_file && !hasFile_(ctx, String(dv.from_file))) {
        findings.push(f('C-18.1', 'error', `provenance documents[${i}].derived.from_file '${dv.from_file}' does not exist in the bundle (@2)`));
      }
    }
    /* Renditions: artifacts derived FROM this document, which is the opposite
       direction from `derived` above and needs saying separately. Capture
       fidelity (0.36.0) introduces two, the script-stripped render companion
       and the snapshot manifest that resolves its placeholders.
       *
       * The shape is enforced rather than advisory for one reason: a rendition
       * is a file that LOOKS like the source and is not the source. If it can
       * sit in a bundle without naming what was done to it, what it was made
       * from, and its own hash, then a rendering and a capture become
       * indistinguishable inside the record, which is the single thing the
       * grading scheme exists to prevent. */
    if (d.renditions !== undefined) {
      if (!Array.isArray(d.renditions)) {
        findings.push(f('C-18.1', 'error', `provenance documents[${i}].renditions must be an array (@2)`));
      } else {
        d.renditions.forEach((r, j) => {
          if (!r || typeof r !== 'object' || !r.file || !RAW_SHA_RE.test(r.sha256 || '') || !r.transform || !r.reason || !r.from_file) {
            findings.push(f('C-18.1', 'error', `provenance documents[${i}].renditions[${j}] lacks the {file, sha256, transform, reason, from_file} shape: a derived artifact must say what was done to it, why, and what it was made from (@2)`));
            return;
          }
          if (!hasFile_(ctx, String(r.file))) {
            findings.push(f('C-18.1', 'error', `provenance documents[${i}].renditions[${j}] names '${r.file}' which does not exist in the bundle (@2)`));
          }
          if (!hasFile_(ctx, String(r.from_file)) && !Array.isArray(d.parts)) {
            findings.push(f('C-18.1', 'error', `provenance documents[${i}].renditions[${j}].from_file '${r.from_file}' does not exist in the bundle (@2)`));
          }
          if (r.sha256 === cap?.sha256) {
            findings.push(f('C-18.1', 'error', `provenance documents[${i}].renditions[${j}] has the same hash as the capture it claims to be derived from, so one of the two is mislabelled (@2)`));
          }
        });
      }
    }
  }
  if (reg.releases !== undefined) {
    if (!Array.isArray(reg.releases)) {
      findings.push(f('C-18.1', 'error', 'provenance releases must be an array (@2)'));
    } else {
      reg.releases.forEach((r, i) => {
        if (!r || typeof r !== 'object' || !HIST_TS_RE.test(r.transition || '') || !r.author) {
          findings.push(f('C-18.1', 'error', `provenance releases[${i}] lacks the {transition, author} shape (@2)`));
          return;
        }
        if (r.signature_file) {
          if (!hasFile_(ctx, String(r.signature_file))) {
            findings.push(f('C-18.1', 'error', `provenance releases[${i}].signature_file '${r.signature_file}' does not exist in the bundle (@2)`));
          }
          if (!r.signer) findings.push(f('C-18.1', 'error', `provenance releases[${i}] carries a signature_file but no signer (@2)`));
          if (r.namespace !== 'bio-release') {
            findings.push(f('C-18.1', 'error', `provenance releases[${i}].namespace '${r.namespace}' must be 'bio-release' (ssh-keygen -Y namespace discipline) (@2)`));
          }
        }
      });
    }
  }
}

/** The C-18 register arms over one bundle: `files` maps a path to its text (or bytes), `elided` names the paths held
 *  and not carried (a blob), `fm` is the parsed `bundle.md` front matter (null when unreadable). Answers the
 *  catalogue's findings, in the order `checkBundle` ran the arms. Never throws for a well-formed call. */
export function registerChecks({ files, fm, elided = null }) {
  const findings = [];
  const ctx = { files: files instanceof Map ? files : new Map(Object.entries(files || {})), fm: fm || null,
                elided: elided instanceof Set ? elided : new Set(elided || []) };
  if (!ctx.fm || typeof ctx.fm !== 'object') return findings;
  checkReleaseAuthority(ctx, findings);
  checkAuthorityPublishable(ctx, findings);
  checkRegisterIntegrity(ctx, findings);
  checkInfo2Register(ctx, findings);
  return findings;
}
