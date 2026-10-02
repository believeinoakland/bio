/* public-read — the published record served to anybody without a credential (requirements:
 * `build/requirements/public-read.md`; BIO_Publication_v0_1.md §1, §2, §3 rules 9–12 and 16). The public reads by hash,
 * by finding and by case, and the whole projection (R1–R4), and the evidence-package block beside a published case
 * (R8), and the named credential-free reads a later module registers (R18); beside a case, `docket`'s withdrawal stamp
 * and last entry (R20), and the docket and its feed served (R21). It writes nothing (R16): every table it reads is
 * `publication`'s, read under `publication` R40, and it reaches `publication` and `docket` only through the services
 * named below.
 *
 * Split from `publication` by copy (K617, K651; seam read `build/extraction/publication-split.md` §3.2): the methods
 * below are `publication/index.mjs`' `registerEvidenceBlock`, `#evidencePackage`, `publishedManifest`,
 * `#frozenPairsByCase`, `verifySha`, `publishedList`, `publishedEditions`, `publishedCase`, `#deliveredBy`,
 * `#looseEditionState`, `#resolveOneCase` and `#casesOfSha`, with their comments; `publication`'s job, after this one
 * merged, deleted its copies, and `publicReadOps` is spread in `plane`'s store op map (`../plane/store.mjs`). The legacy code's comments
 * moved with it and keep their old ids (REC-, CASE-, D-); a `publication` R id in them is named as such. The Worker
 * half (`../publication/worker.mjs`, `../container.mjs`, `../inband.mjs`: R5–R7, R9) is this module's by `paths` and
 * stays at those paths (K697, K702); the door's routes reach it through `./door.mjs`. Its refusal rows are its own,
 * in `./checks.mjs` (R17); the case document's tensions and blocks are read from `case-grammar`.
 *
 * REACHED as `publicReadOf(host, deps)` (K61): one instance per host, created on the first call with `deps`, returned
 * to every later caller. `deps`:
 *   publication    `caseEditionState` (its R53), `soleCase` (its R54), `caseDocMemberFrozen` (its R55), and its
 *                  storage, whose tables it reads under its R40 (default: `publicationOf(host)`).
 *   docket         `withdrawalOf` (its R12), `lastEntryOf`, `docketPublic` (its R14) and `docketFeed` (its R15), for
 *                  R20 and R21:
 *                  the docket's public answers, which this module serves and never composes (N520).
 *   storage        the Durable Object's storage (default: the host's).
 *
 * READ CONTRACT it reads in its own SQL, and never writes: `publication` R40's `published_bundles`, `published_cases`,
 * `published_case_members`, `cases`, `published_edges` and `published_shas`. */

import { publicationOf } from "../publication/index.mjs";
import { caseTensionsOf, caseDocumentBlocks, whatChangedOf, lensOf, LENS_HEAD,
         LENS_CLOSING_SENTENCES, workingOnOf } from "../case-grammar/index.mjs";
import { parseFrontmatter } from "../record-grammar/index.mjs";
import { rowOf } from "./checks.mjs";
import { delivererOf } from "../deliverer.mjs";
import { PUBLIC_READ_NAME, PUBLIC_READ_PARAM, PUBLIC_READ_OWN_OPS, PUBLIC_READ_RESERVED_PARAMS,
         DOCKET_FEED_MEDIA_TYPE } from "./reads.mjs";

/* CPDF-10: a column `publication` WROTE as JSON, read back; null rather than a throw on a malformed value. */
const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : "");

/* R3 (DEC-101, DEC-103), R19: a signed document's front matter and body, parsed once (record-grammar); null for no text
   or no front matter, so every reader below answers its own null. */
const signedParts = (doc) => {
  if (!doc || typeof doc.text !== "string") return null;
  try { const p = parseFrontmatter(doc.text); return p.data ? { fm: p.data, body: p.body } : null; }
  catch { return null; }
};
/* R3 (DEC-103): the lens section of a signed body, from its head to the next `## ` heading, whole and as signed. */
const lensSection = (body) => {
  const lines = String(body ?? "").split(/\r\n|\n/);
  const at = lines.indexOf(LENS_HEAD);
  if (at < 0) return null;
  let end = at + 1;
  while (end < lines.length && !lines[end].startsWith("## ")) end++;
  return lines.slice(at, end).join("\n").replace(/\s+$/, "");
};
/* R3 (DEC-103): what a document without the lens blocks says instead (R13: stated, never filled). */
export const LENS_FINGERPRINT_SENTENCE = "this edition carries only the lens's fingerprint, not its statements: the "
  + "statements_sha of the bias manifest it froze, which anyone holding that manifest can check it against";
export const LENS_NONE_IN_FORCE_SENTENCE = "this edition carries only the lens's fingerprint, and its bias manifest "
  + "states that no manifest was in force, so there is no fingerprint to give";
export const LENS_FINGERPRINT_UNDETERMINED_SENTENCE = "this edition carries only the lens's fingerprint, and its bias "
  + "manifest states none that can be read, so the fingerprint is undetermined, not absent";
/* R21: the fixed address a case's docket is served at (its feed's is `op=docketfeed&case=`). */
export const docketAddress = (caseId) => `op=docketpublic&case=${encodeURIComponent(caseId)}`;
export const LENS_NO_DOCUMENT_SENTENCE = "no signed case document is held for this edition, so it states no lens here";

export class PublicRead {
  #evidenceBlock = null; // R8: {module, name, fn}, filled once
  #publicReads = new Map(); // R18: name -> {module, params, read}, each name registered once

  constructor({ storage, publication, docket } = {}) {
    this.sql = storage.sql;
    this.publication = publication;
    this.docket = docket;
  }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }

  /* ---------------------------------------------------------------- R36: the evidence-package block */

  /** R8 (was `publication` R36): a later module fills, once at start, one evidence-package block: `fn({caseId, edition, findings})` answers
   *  the block `publishedCase` (R3) carries under `name` beside the case, computed at the read. `filings` fills the
   *  available-actions block (its R15). Nothing it answers enters the case's own bytes. A second registration is
   *  refused `PROVIDER_DECLARED`, a malformed one `PROVIDER_MALFORMED`. */
  registerEvidenceBlock(module, name, fn) {
    if (!str(module) || !/^[a-z][a-z0-9_]{0,63}$/.test(String(name ?? "")) || typeof fn !== "function")
      return { ok: false, reason: "PROVIDER_MALFORMED",
               detail: "an evidence-package block names its module, a lowercase block name and its function" };
    if (this.#evidenceBlock)
      return { ok: false, reason: "PROVIDER_DECLARED", module: this.#evidenceBlock.module,
               detail: `the evidence-package block is already registered by ${this.#evidenceBlock.module}` };
    this.#evidenceBlock = { module: str(module), name: String(name), fn };
    return { ok: true, module: this.#evidenceBlock.module, name: this.#evidenceBlock.name };
  }

  /* R8: the package's block for one answered case edition, computed at the read. A block that throws is stated as
     unavailable, never as absent; with none registered the package says it carries no such block. */
  #evidencePackage(caseId, edition, findings) {
    if (!this.#evidenceBlock)
      return { blocks: {}, detail: "no module provides an evidence-package block, so this package carries none; the "
                                 + "evidence package is the published case edition itself" };
    const { name, module, fn } = this.#evidenceBlock;
    let value;
    try { value = fn({ caseId, edition, findings: findings.map((f) => f.bundle_id) }); }
    catch (e) { value = { unavailable: true, detail: `${module} could not compute this block: ${String(e && e.message || e).slice(0, 200)}` }; }
    return { blocks: { [name]: value ?? null },
             detail: `each block is computed at this read by the module that provides it (${module}); it is not in the `
                   + "case's signed bytes, and nothing of it is a claim the case makes" };
  }


  /* ---------------------------------------------------------------- R18: the registered public reads */

  /** R18: a later module registers once at start a set of named, credential-free reads, served on the public path
   *  (`op=publicread&name=<name>`, or `op=<name>` where the door is told the name; `./door.mjs`). `reads` maps each
   *  name to its read, `fn(args)` or `{params, read}`: `params` are the query parameters it takes (none by default), and
   *  `args` holds exactly those the caller sent, as strings, so a read is handed nothing else. The registration is
   *  checked whole and is all or nothing: a malformed one is refused `PROVIDER_MALFORMED` naming what is wrong (a name
   *  that is not an op's spelling or is this module's own op, a read that is no function, a parameter that is
   *  malformed or carries a credential or a stamp, R10); a name already registered, by any module, is refused
   *  `PROVIDER_DECLARED` naming who holds it, and the first stands. */
  registerPublicReads(module, reads) {
    const mod = str(module);
    const entries = reads && typeof reads === "object" && !Array.isArray(reads) ? Object.entries(reads) : [];
    const wrong = [];
    if (!mod) wrong.push("the registration names no module");
    if (!entries.length) wrong.push("it names no read");
    const specs = [];
    for (const [name, spec] of entries) {
      const read = typeof spec === "function" ? spec : spec && typeof spec.read === "function" ? spec.read : null;
      const params = typeof spec === "function" || (spec && spec.params === undefined) ? []
        : spec && Array.isArray(spec.params) ? spec.params : null;
      if (!PUBLIC_READ_NAME.test(name)) wrong.push(`${JSON.stringify(name)} is not a read's name (lowercase letters and digits)`);
      else if (PUBLIC_READ_OWN_OPS.includes(name)) wrong.push(`${name} is this module's own op`);
      if (!read) wrong.push(`${name} has no read function`);
      if (!params) { wrong.push(`${name}'s params is not a list`); continue; }
      for (const p of params) {
        if (typeof p !== "string" || !PUBLIC_READ_PARAM.test(p)) wrong.push(`${name} declares a malformed parameter`);
        else if (PUBLIC_READ_RESERVED_PARAMS.includes(p))
          wrong.push(`${name} declares ${p}, which carries a credential or a stamp and is never handed to a public read`);
      }
      if (new Set(params).size !== params.length) wrong.push(`${name} declares a parameter twice`);
      specs.push({ name, read, params: [...params] });
    }
    if (wrong.length)
      return { ok: false, reason: "PROVIDER_MALFORMED", module: mod || null, problems: wrong,
               detail: "a public-read registration names its module and each read's name, its function and the "
                     + "parameters it takes; nothing of this one was registered" };
    const taken = specs.filter((s) => this.#publicReads.has(s.name))
      .map((s) => ({ name: s.name, module: this.#publicReads.get(s.name).module }));
    if (taken.length)
      return { ok: false, reason: "PROVIDER_DECLARED", module: mod, taken,
               detail: `${taken.map((t) => `${t.name} is already registered by ${t.module}`).join("; ")}; `
                     + "the first registration stands, and nothing of this one was registered" };
    for (const s of specs) this.#publicReads.set(s.name, { module: mod, params: Object.freeze(s.params), read: s.read });
    return { ok: true, module: mod, names: specs.map((s) => s.name) };
  }

  /** R18: every registered read, `{name, module, params}`, in name order. */
  publicReads() {
    return [...this.#publicReads.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([name, r]) => ({ name, module: r.module, params: [...r.params] }));
  }

  /** R18 (R10's terms): one registered read, served. `query` is the caller's parameters; the read is handed only those
   *  it declared, frozen, and nothing else: no credential and no stamp can be among them. It answers
   *  `{ok: true, read, module, result}` with the read's answer as `result`; a read that refuses (`ok: false`) is
   *  relayed as its own refusal, naming the read. An unregistered name answers `PUBLIC_READ_NOT_REGISTERED` (C-98.10, its row), saying so.
   *  A read that answers a promise is answered as one; one that throws is not caught here, so the store's own internal
   *  error answers it and nothing is dressed as an absence. */
  publicRead(name, query = {}) {
    const n = String(name ?? "");
    const r = this.#publicReads.get(n);
    if (!r) {
      /* DEC-49 REGION is-public-read-not-registered
       * C-98.10 (K1149): the code a STRING LITERAL at its site, its row from this module's table (R17). */
      return { ok: false, reason: "PUBLIC_READ_NOT_REGISTERED", ...rowOf("PUBLIC_READ_NOT_REGISTERED"), name: n,
               detail: `no public read named ${JSON.stringify(n)} is registered on this copy of the record, so there `
                     + "is nothing to serve under that name" };
      /* END DEC-49 REGION is-public-read-not-registered */
    }
    const args = {};
    for (const p of r.params) {
      const v = query && Object.hasOwn(query, p) ? query[p] : undefined;
      if (typeof v === "string") args[p] = v;
    }
    const shape = (v) => (v && typeof v === "object" && v.ok === false
      ? { ...v, ok: false, read: n, module: r.module }
      : { ok: true, read: n, module: r.module, result: v === undefined ? null : v });
    const out = r.read(Object.freeze(args));
    return out && typeof out.then === "function" ? out.then(shape) : shape(out);
  }


  /* ---------------------------------------------------------------- R21: the docket beside a case, served */

  /** R21 (DEC-116 item 8; DEC-100 item 2): a case's docket, `docket.docketPublic` (its R14), served with no credential
   *  (R10): `{...its answer, ok: true, case}`, a promise as the docket's read is. A case the docket answers null for
   *  (absent, or with no ratified edition) is `publishedCase`'s own `NOT_PUBLISHED` answer for an absent case, taken
   *  from `publishedCase` itself, so the two are the same bytes by construction and C-98.8 keeps its one site. */
  async docketPublic(caseId) {
    const c = str(caseId);
    const d = c ? await this.docket.docketPublic({ case: c }) : null;
    if (d == null) return this.#absentCase();
    return { ...d, ok: true, case: c };
  }

  /** R21 (DEC-116 item 8): a case's Atom feed, `docket.docketFeed` (its R15), one fixed address per case
   *  (`op=docketfeed&case=<case>`): `{ok: true, case, media_type, feed}`, the door serving `feed` as the response's
   *  bytes under `media_type`; a promise, as the docket's read is. Null from the docket is `NOT_PUBLISHED`, as
   *  `docketPublic`. */
  async docketFeed(caseId) {
    const c = str(caseId);
    const feed = c ? await this.docket.docketFeed({ case: c }) : null;
    if (feed == null) return this.#absentCase();
    return { ok: true, case: c, media_type: DOCKET_FEED_MEDIA_TYPE, feed: String(feed) };
  }

  /* R21: `publishedCase`'s answer for an absent case. Asked with no route, it resolves nothing, whatever the record
     holds, and so answers its `NOT_PUBLISHED` (C-98.8) from its one governed site. */
  #absentCase() { return this.publishedCase({}); }

  /* R20 (DEC-116 item 7): the stamp of the docket withdrawal naming one edition of a case, or null when none names it
     (and for anything that is not a case). Read from `docket.withdrawalOf` (its R12), never composed: its `seq`, `date`
     and `reason` as the docket answers them, and `entry`, the link to the withdrawal entry: its `seq`, the docket's id
     for it (`<case>#<seq>`), its digest and the fixed address the docket is served at (R21). */
  #withdrawnStamp(theCase, edition) {
    if (!theCase || edition == null) return null;
    const w = this.docket.withdrawalOf({ case: theCase, edition: Number(edition) });
    if (!w) return null;
    return { seq: w.seq, date: w.date, reason: w.reason,
             entry: { seq: w.seq, id: w.entry ?? null, digest: w.digest ?? null, docket: docketAddress(theCase) } };
  }

  /** 8.2: published-record reconstruction, requiring NOTHING.
   *
   *  Published material is content-addressed and its hashes are public, so any
   *  member or any stranger can rebuild and independently verify the published
   *  record without the cooperation, permission, or continued existence of the
   *  instance it came from. Nothing can be withheld here by construction.
   *
   *  READS THE PUBLISHED PROJECTION ONLY. That is the entire safety of an open
   *  endpoint: working material is never consulted, so there is nothing to leak,
   *  exactly as op=verify already works. */
  publishedManifest() {
    const byCase = this.#frozenPairsByCase();
    return { ok: true, scope: "published",
      /* REC-49, and it is CONDUCT's determination enacted rather than a
         convenience: EVERY RATIFIED FINDING CARRIES ITS OWN FROZEN PAIR HERE,
         inside the awaiting window as much as outside it.
         `published_bundles.strength` is the member's OWN signed, ratified pair —
         the same bytes op=publishedcase publishes for that finding and the same
         value the container manifest copies at assembly — so stating it composes
         nothing and makes no new claim. REC-44 already ruled that the findings
         which ratified are published and answerable NOW; an index that withheld
         their pairs until the LAST member landed would understate, for days,
         what the record actually holds.
         WHY IT MATTERS THAT IT IS HERE AND NOT ONLY IN `cases[].manifest`: the
         container's manifest does not exist until the edition completes, so a
         reader of an incomplete case would see nothing at all. A record that
         understates what it holds is still a record that does not say what is
         true, and understatement reads as modesty, which is why nobody
         questions it.
         AND THE ALTITUDE IS THE WHOLE POINT (DEC-44): the pair belongs to a
         FINDING and there is no such thing as a case-level pair. These fields
         sit on the finding rows and must NEVER appear on `cases[]`. */
      published: this.#rows(
        `SELECT p.bundle_id, p.edition, p.title, p.bundle_sha, p.ratified_at, p.attestor_key,
                p.gate_version, p.strength, p.required
         FROM published_bundles p ORDER BY p.bundle_id, p.edition`)
        .map((r) => {
          const row = { ...r,
            strength: r.strength ? JSON.parse(r.strength) : null,
            required: r.required ? JSON.parse(r.required) : null };
          /* ===== REC-170 / BIO_Publication_v0_1.md §3 rule 12 (b)–(d), with IC-74: WHERE THE
             RATIFIED CASE DOCUMENTS PINNING THESE BYTES STATE DIFFERENT FROZEN PAIRS, THE ROW
             SERVES EVERY CASE'S PAIR, EACH NAMED BY ITS CASE, AND NO SCALAR. ======================
             `published_bundles.strength` is written ONCE, at the member's FIRST ratification
             (`ON CONFLICT … DO NOTHING`), so on b5ce975a this row told a stranger one of two false
             things: a BARE NULL where the documents already disagreed at that ratification (the
             committer's `strengthUndetermined`, which reached op=ratify's answer and nothing
             else), or — measured by rec170-manifest-pair.test.mjs (since retired), and worse — THE FIRST CASE'S
             PAIR where a later case froze another, one case's reading served as THE pair (IC-74:
             a finding in several cases answers every case, never one). Rule 12 (b) makes the pair
             a fact about ONE case's reading of the finding at that sha, so where two readings
             differ the scalar is null and SAYS why (`strengthUndetermined`, a reason code, the
             `production` sentence's rule that a null is never left to be read), and
             `strengthByCase` carries each ratified case edition's own pair as its document states
             it — the same `caseDocMemberFrozen` read op=publishedcase serves.
             WHERE THE DOCUMENTS AGREE, OR ONE CASE PINS THE FINDING, NOTHING HERE RUNS and the row
             is byte-identical to what it was: an added key on an agreeing row would be a flag
             that is not true. */
          const pinned = byCase.get(`${r.bundle_id}\u0000${r.bundle_sha}`);
          if (!pinned || new Set(pinned.map((p) => JSON.stringify(p.strength))).size < 2) return row;
          return { ...row, strength: null, strengthUndetermined: "CASES_DISAGREE", strengthByCase: pinned };
        }),
      /* REC-44: the CASES, beside the findings rather than instead of them. The
         findings are what carry a signature and a frozen pair; the case is what
         carries the container's manifest, its own hash and the scope. A
         reconstruction needs both, and conflating them is what D-187 records. */
      cases: this.#rows(
        /* REC-47: the acknowledgement is on the PUBLIC index too, and that is
           the point of it — a reader reconstructing the record from this op
           alone must be able to see the bias each case edition was produced
           under without asking us for it. */
        /* CASE-1 / DEC-72: and WHOSE PRODUCTION the case is, on the public index,
           for the same reason the acknowledgement is on it — a reader
           reconstructing the record from this op alone must be able to see which
           project published a case, because under DEC-72 the bar the case was
           held to is THAT PROJECT'S and no other. A LEFT JOIN rather than an
           inner one, and that is the load-bearing half: a case published before
           this model has no `cases` row, and it must still appear here with its
           project stated as unknown rather than disappearing from the index
           because the record gained a table. */
        /* CASE-5 / DEC-72 clause 2: AND THE BAR, on the reconstruction index, for
           the reason the acknowledgement and the project are already on it — a
           reader rebuilding the published record from this op ALONE must be able
           to say what standard each case edition was held to, and until this
           item the only route was one member's stamped `required` block, which is
           one member's copy of a case property. `production` below states what a
           null means so a bare null cannot read as a bar of zero. */
        `SELECT c.case_id, c.edition, c.scope, c.bias_acknowledgement, c.bar, c.ratified_at,
                c.manifest_sha, c.manifest, k.project_id
         FROM published_cases c LEFT JOIN cases k ON k.case_id = c.case_id
         ORDER BY c.case_id, c.edition`)
        .map((c) => ({ ...c, bar: c.bar ? safeJson(c.bar) : null })),
      /* CASE-1 / DEC-72: the member's PINNED VERSION and its AUTHORED ROLE travel
         with the roster row, because they are what the roster row now IS —
         (finding id, version hash, role, ordinal). Both are null until CASE-2
         authors a role and CASE-3 pins a version, and `production` below states
         that in words rather than leaving a reader to read a bare null. */
      caseMembers: this.#rows(
        `SELECT case_id, edition, ord, bundle_id, version_sha, role FROM published_case_members
         ORDER BY case_id, edition, ord`),
      /* CASE-1 / DEC-72, and it exists because "undetermined is first-class and
         must be STATED" is not satisfied by a null. Three different facts arrive
         here as null and a reader cannot tell them apart without this sentence:
         a case nobody published as a project's production, a member nobody
         designated, and a member whose version nobody pinned. */
      production: "DEC-72: a case is a PRODUCTION OF A PROJECT, and the standard of evidence it was "
                + "held to is that project's, told to the publishing act at the time it was made. Where "
                + "`project_id` is null NO PROJECT IS RECORDED as this case's publisher — the case was "
                + "published before this model, and an absent owner is not a claim that it had none, it "
                + "is this record saying it does not know. Where a member's `role` is null NOBODY "
                + "DESIGNATED that member load-bearing or supporting, so nothing here says whether the "
                + "case rests on it: a designation is authored by the publisher and is never derived, so "
                + "the record will not supply one it was not given. Where `version_sha` is null the "
                + "member was rostered without a version being pinned, and the finding it names may have "
                + "moved since. None of the three is a gap in this answer; each is a state of the record. "
                /* CASE-5 / DEC-72: the fourth null, and the ONE instruction a
                   reconstructor cannot do without. `caseMembers[].edition` is the
                   CASE's and `published[].edition` is the FINDING's, and they are
                   no longer the same number — so the join between the two tables
                   is `version_sha` to `bundle_sha` and NEVER edition to edition.
                   Said here rather than left to be inferred because a join on the
                   old equality does not error: it silently drops exactly the
                   members the pin exists for, which is the defect IC-66 measures
                   in this record's own UI. */
                + "Where a case edition's `bar` is null NO STANDARD OF EVIDENCE IS RECORDED for it, and that "
                + "is NOT a bar of zero: the edition predates the case carrying its own bar, or none was "
                + "ever declared, and a case that cleared no declared standard says so. AND THE JOIN "
                + "BETWEEN `caseMembers` AND `published` IS `version_sha` TO `bundle_sha`, NEVER EDITION TO "
                + "EDITION: `caseMembers.edition` is the CASE's edition and `published.edition` is the "
                + "FINDING's own, and since the artifact flip a member of a case's edition 2 may be at its "
                + "own edition 1. A join on the two numbers does not fail — it silently drops the members "
                + "the pin exists to name.",
      shas: this.#rows(
        `SELECT sha256, bundle_id, path, kind, bytes, published FROM published_shas ORDER BY published`),
      altitudes: "a frozen strength pair belongs to a FINDING and travels on that finding's row here. A CASE "
               + "has a scope, a completeness assertion, a bias acknowledgement, editions and a container; "
               + "it has no strength, and "
               + "composing its members' pairs into one letter would be a claim the evidence does not "
               + "support. A member named in caseMembers with no row in published[] is DECLARED AND NOT YET "
               + "RATIFIED: it has no pair because nothing has been signed for it, which is a state of the "
               + "record and not a gap in this answer. "
               /* REC-170: the one null on a finding row that is not "nothing was signed". */
               + "Since the frozen pair is stated in each CASE's document (a case's reading of the finding at "
               + "that hash), a finding several cases pin may carry several pairs: where their documents "
               + "disagree, `strength` is null, `strengthUndetermined` says CASES_DISAGREE, and "
               + "`strengthByCase` lists every ratified case edition's own pair, named by its case and "
               + "edition. None of them is the finding's pair; each is that case's.",
      detail: "every hash here is verifiable by anyone with ssh-keygen and the doorbell, without this "
            + "instance's cooperation or continued existence. Nothing unpublished appears, by construction: "
            + "this reads the published projection and never the working corpus." };
  }

  /* REC-170 / BIO_Publication_v0_1.md §3 rule 12 (b): EVERY RATIFIED CASE EDITION'S OWN FROZEN PAIR
     FOR EVERY PINNED SHA, keyed `bundle_id NUL bundle_sha`, for `publishedManifest`. One set-based read
     of the pins, then `caseDocMemberFrozen` (the one parser of the per-case facts) once per case edition
     that pins a sha SEVERAL editions pin — a sha pinned by one edition has nothing to disagree with, so
     its document is never opened here. EVERY ratified edition counts, not only a case's latest: each is
     a separate signed document that stated its own reading of those bytes. A LEGACY (/1) document states
     no pair of its own (its members carried theirs, rule 12 (e)) and is left out rather than read as an
     empty pair — which is also where this reader is blind: a /1 reading does not join the comparison. */
  #frozenPairsByCase() {
    const pins = this.#rows(
      `SELECT m.case_id, m.edition, m.bundle_id, m.version_sha FROM published_case_members m
         JOIN published_cases c ON c.case_id=m.case_id AND c.edition=m.edition
        WHERE m.version_sha IS NOT NULL
        ORDER BY m.bundle_id, m.version_sha, m.case_id, m.edition`);
    const groups = new Map();
    for (const p of pins) {
      const k = `${p.bundle_id}\u0000${p.version_sha}`;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(p);
    }
    const docs = new Map();
    const out = new Map();
    for (const [k, ps] of groups) {
      if (ps.length < 2) continue;
      const stated = [];
      for (const p of ps) {
        const dk = `${p.case_id}\u0000${Number(p.edition)}`;
        if (!docs.has(dk)) docs.set(dk, this.publication.caseDocMemberFrozen(p.case_id, Number(p.edition)));
        const row = docs.get(dk) ? docs.get(dk).get(p.bundle_id) : null;
        if (row && row.version_sha === p.version_sha)
          stated.push({ case_id: p.case_id, edition: Number(p.edition), strength: row.strength });
      }
      out.set(k, stated);
    }
    return out;
  }


  /* 7a: answers ONLY from the published projection. Working material is not
     consulted, so there is nothing to leak: a hash that was never ratified
     is indistinguishable from a hash that never existed. */
  verifySha(sha) {
    const matches = this.#rows(
      `SELECT bundle_id, path, kind, published FROM published_shas WHERE sha256=? ORDER BY published`, sha);
    return { published: matches.length > 0, sha256: sha, matches };
  }

  /* REC-14 / DEC-12: the public index ENUMERATES EDITIONS rather than one row
     per bundle, because an edition is a separate document and edition 1 keeps
     answering after edition 2 lands. `title` is here — the one deliberate
     divergence from DATA-MODEL 2.4.4 — so a public index is not N+1 reads of
     the bytes to learn what each case is called. */
  publishedList() {
    return { bundles: this.#rows(
      `SELECT bundle_id, edition, title, bundle_sha, ratified_at, attestor_member, delivered_by, gate_version
       FROM published_bundles ORDER BY bundle_id, edition`)
      /* REC-44: each published FINDING names the case it was published in, so a
         public index can be read as the cases it actually is. The finding rows
         stay the rows — a finding is what carries a signature and a frozen pair
         — and the case is stated beside them rather than replacing them.
         CASE-5: resolved BY THE HASH, and `case_edition` is stated beside the
         case id because it is no longer derivable from `edition` on this row —
         that number is the FINDING's. A consumer joining a member to its case on
         the equality of the two numbers is the defect IC-66 measures in the UI. */
      /* D-309 / DEC-72 clause 6: THIS CALLER WANTS **ALL** OF THEM. A public
         index whose purpose is *"so a public index can be read as the cases it
         actually is"* cannot name one case for a finding that serves two — it
         would be telling a reader the record holds less than it does, on the one
         surface a stranger browses. `cases` is the answer; the scalar pair is
         kept and is the SOLE membership or null (`soleCase`), so a consumer
         still reading it receives null rather than a guess. */
      .map((r) => {
        const cms = this.#casesOfSha(r.bundle_id, r.bundle_sha, r.edition);
        const sole = this.publication.soleCase(cms);
        return { ...r, delivered_by: this.#deliveredBy(r),
                 case_id: sole ? sole.case_id : null, case_edition: sole ? sole.edition : null,
                 cases: cms };
      }),
      cases: this.#rows(
      `SELECT case_id, edition, scope, ratified_at, manifest_sha FROM published_cases
       ORDER BY case_id, edition`)
      .map((c) => ({ ...c, findings: this.#rows(
        `SELECT bundle_id FROM published_case_members WHERE case_id=? AND edition=? ORDER BY ord`,
        c.case_id, c.edition).map((m) => m.bundle_id) })) };
  }

  /* One case, every edition it has ever had, each with its OWN signature,
     attestor, time and gate version, and with the frozen assertion and the
     frozen PAIR the group signed. This is what makes "edition 1 still answers"
     checkable rather than merely stated. */
  publishedEditions(bundleId) {
    if (!bundleId) return { ok: false, reason: "NO_ID", detail: "publishededitions requires ?id=" };
    const rows = this.#rows(
      `SELECT bundle_id, edition, title, bundle_sha, ratified_at, attestor_key, attestor_member,
              delivered_by, gate_version, sig_armored, strength, required
       FROM published_bundles WHERE bundle_id=? ORDER BY edition`, bundleId);
    /* REC-44: `completeness` is no longer here and that is the correction — it
       is a CASE assertion, so it is fetched from the case each edition belongs
       to rather than repeated on every member finding of it. */
    return { ok: true, bundleId, editions: rows.map((r) => {
      /* CASE-5: BY THE HASH, and the case's edition comes back WITH the case id
         rather than being taken from `r.edition`. This read is the clearest
         instance of the conflation in the file: it resolved the case at the
         FINDING's edition and then fetched `published_cases` at that same
         number, so a finding at its own edition 1 inside a case at edition 3 was
         answered with edition 1's scope, completeness and bias acknowledgement —
         a case assertion attributed to the wrong edition of the right case. */
      /* D-309: **ALL** OF THEM, and the case-level fields below stay tied to the
         SOLE membership. The scope, completeness assertion, bias acknowledgement
         and bar on this row are ONE CASE EDITION'S claims; a finding serving two
         cases has two of each, and flattening them onto one row is the exact
         defect this read's own comment records one paragraph up — *"a case
         assertion attributed to the wrong edition of the right case"*, which
         becomes "attributed to the wrong CASE" the moment clause 6 is live. So
         when the membership is set-valued those fields go NULL and `cases` names
         where to ask; when it is a single case they are unchanged. */
      const cms = this.#casesOfSha(r.bundle_id, r.bundle_sha, r.edition);
      const cm = this.publication.soleCase(cms);
      const cid = cm ? cm.case_id : null;
      const c = cm ? this.#one(
        `SELECT scope, completeness, bias_acknowledgement, bar, manifest_sha
         FROM published_cases WHERE case_id=? AND edition=?`,
        cm.case_id, cm.edition) : null;
      return { ...r, delivered_by: this.#deliveredBy(r),
               case_id: cid, case_edition: cm ? cm.edition : null, cases: cms,
               bar: c && c.bar ? safeJson(c.bar) : null,
               /* The container's manifest is the CASE edition's, so it is
                  reported from there — one manifest per case per edition,
                  naming every member finding's parts. */
               manifest_sha: c ? (c.manifest_sha ?? null) : null,
               scope: c ? (c.scope ?? null) : null,
               bias_acknowledgement: c ? (c.bias_acknowledgement ?? null) : null,
               completeness: c && c.completeness ? JSON.parse(c.completeness) : null,
               strength: r.strength ? JSON.parse(r.strength) : null,
               required: r.required ? JSON.parse(r.required) : null };
    }) };
  }

  /* REC-22: ONE PUBLISHED EDITION, everything the public read path can say about
     it from the store side. Reads published_bundles and published_edges and
     NOTHING else -- it never joins the working corpus, never reports a working
     state, and carries no title but the one frozen into the edition -- which is
     the whole of why this answers without a credential of any kind (REC-30's
     classification, and this module's R10 states exactly that property).

     RESOLUTION, three ways and one rule (DEC-12): a bundle id alone answers with
     the LATEST edition; an id and an edition answer with that edition; a
     bundle_sha answers with THE EDITION THOSE BYTES ARE -- a hash resolves to
     its own edition and never to the current one, which is what makes "edition 1
     still answers after edition 2 lands" true rather than merely stated.

     A NOT_PUBLISHED answer is IDENTICAL for a bundle that was never published,
     an edition that does not exist and an id that never existed, and it is
     identical by construction rather than by care: there is no other table in
     this method to tell them apart with. */
  /* REC-44 / DEC-44: RESOLUTION NOW HAS A FOURTH ROUTE and the surface answers
     with a CASE. `id` may be the CASE identity or the bundle id of any member
     FINDING — a stranger who was handed one finding's id must be able to reach
     the case it was published in, since that case is the artifact the group put
     its name on. A finding id is answered WITH the case and `asked` names which
     finding was reached for, so the surface resolves without deciding on the
     reader's behalf what they meant.

     AND THERE IS NO `strength` AT THIS LEVEL. Every member finding carries its
     own frozen pair inside findings[]; a case-level letter would be R2's
     forbidden composition arriving at case altitude, and its ABSENCE from this
     answer is asserted by `published.test.mjs`' R3 and R11 arms rather than
     left to review. */
  publishedCase({ id = null, edition = null, sha256 = null, caseId = null } = {}) {
    let theCase = caseId ? String(caseId).trim() : null, ed = null, asked = null;
    /* CASE-5: the FINDING's own edition, kept apart from `ed` (the CASE's) from
       here on. The two used to be one variable on this method as well, and the
       loose-bundle fallback below reads `published_bundles` — which is keyed on
       the finding's number and would have been handed the case's. */
    let askedEdition = null;
    if (sha256) {
      const r = this.#one(`SELECT bundle_id, edition FROM published_bundles WHERE bundle_sha=? ORDER BY edition LIMIT 1`,
                          sha256);
      /* CASE-5 / DEC-72: THE STRANGER'S OWN ROUTE, and the conflation was at its
         worst here. A caller who holds a hash and nothing else — the caller the
         whole published projection exists for — was answered by taking the
         FINDING's edition off its published row and asking for the CASE at that
         number. While the two agreed it worked; after the flip it would fetch a
         different edition of the right case, or none, and hand a stranger one
         edition's scope and completeness assertion over another edition's
         findings. Resolved by the hash the case actually pinned. */
      if (r) {
        asked = r.bundle_id;
        askedEdition = Number(r.edition);
        const cms = this.#casesOfSha(r.bundle_id, sha256, askedEdition);
        /* D-309: THIS CALLER MUST SERVE **ONE** CASE AND SO IT REFUSES RATHER
           THAN PICKS — and that is this method's own stated doctrine rather than
           a new rule. Its header already says a finding id is answered WITH the
           case *"so the surface resolves without deciding on the reader's behalf
           what they meant."* A hash that two cases froze has two honest answers;
           serving the newest would attribute one finding's support to a case the
           reader never asked about, on the surface a stranger uses to check a
           claim. Named, with both candidates, so the reader picks. */
        const got = this.#resolveOneCase(r.bundle_id, cms, caseId);
        if (!got.ok) return got;
        if (got.pick) { theCase = got.pick.case_id; ed = got.pick.edition; }
      }
    } else if (id) {
      const want = edition != null && Number.isInteger(Number(edition)) ? Number(edition) : null;
      if (this.#one(`SELECT case_id FROM published_cases WHERE case_id=? LIMIT 1`, id)) {
        theCase = id;
      } else {
        /* D-309: SITES 3 AND 4 OF CASE-6's NINE — the two spellings of
           `publishedCase()`'s finding-id resolution. SAME DECISION AS THE HASH
           ROUTE ABOVE AND FOR THE SAME REASON: a stranger handed one finding id
           that serves two cases is told BOTH and picks, because this surface
           exists to resolve without choosing for them. Note the edition here is
           the CASE's, so `AND edition=?` can match two different cases that each
           have an edition N — which is exactly the shape the old scalar would
           have resolved by whichever row SQLite handed back first. */
        /* THE TERNARY IS OUTSIDE THE CALL, not inside its argument list, and that
           is this item's own census correcting this item's own code. Written as
           `this.#rows(want != null ? \`…\` : \`…\`)` the receiving call sits behind
           the ternary CONDITION, and the walk `multicase.test.mjs` then ran
           (deleted in T20) — which found a query's kind by looking back from the
           literal to the call — could not see it and reported it UNCLASSIFIED.
           **That was the matcher being right
           rather than blunt**, so the code moved to the spelling every other
           member of the class uses instead of the matcher being widened to
           tolerate one. A census nobody can read the same way twice is not one. */
        const ms = (want != null
          ? this.#rows(`SELECT case_id, edition FROM published_case_members
                         WHERE bundle_id=? AND edition=? ORDER BY case_id`, id, want)
          : this.#rows(`SELECT case_id, edition FROM published_case_members
                         WHERE bundle_id=? ORDER BY case_id, edition`, id))
          .map((r) => ({ case_id: r.case_id, edition: Number(r.edition) }));
        const got = this.#resolveOneCase(id, ms, caseId);
        if (!got.ok) return got;
        if (got.pick) { theCase = got.pick.case_id; asked = id; }
      }
      if (want != null) ed = want;
    }
    if (theCase && ed == null) {
      const top = this.#one(`SELECT MAX(edition) AS m FROM published_cases WHERE case_id=?`, theCase);
      ed = top && top.m != null ? Number(top.m) : null;
    }
    let state = theCase && ed != null ? this.publication.caseEditionState(theCase, ed) : null;
    /* A RATIFIED BUNDLE THAT IS IN NO CASE still answers here, and it answers
       as what it is: an information bundle (or any non-inquiry) that was
       ratified and is verifiable by hash, carrying NO case identity, NO scope
       and NO completeness assertion, because it is not a case and this surface
       must not manufacture one for it. Before REC-44 it answered as a "case"
       because everything shared one table, which is the conflation D-187
       records. It is stated rather than dropped: the doorbell's promise is that
       ratified bytes answer, and that promise is not about inquiries. */
    if (!state && (asked || sha256 || id)) {
      const who = asked || id;
      /* CASE-5: the FINDING's number, never the case's. `ed` is the case
         edition this method resolved (or the one the caller asked for) and
         `published_bundles` has never been keyed on it. Before the flip the
         substitution was invisible; it is the same class as the two above. */
      const want = askedEdition != null ? askedEdition
                 : (sha256 == null && id != null && edition != null
                    && Number.isInteger(Number(edition)) ? Number(edition) : null);
      const r = sha256
        ? this.#one(`SELECT bundle_id, edition, bundle_sha FROM published_bundles WHERE bundle_sha=? ORDER BY edition LIMIT 1`, sha256)
        : want != null
          ? this.#one(`SELECT bundle_id, edition, bundle_sha FROM published_bundles WHERE bundle_id=? AND edition=?`, who, want)
          : this.#one(`SELECT bundle_id, edition, bundle_sha FROM published_bundles WHERE bundle_id=? ORDER BY edition DESC LIMIT 1`, who);
      /* D-309: THIS CALLER IS ASKING A DIFFERENT QUESTION AND NOW ASKS IT
         EXPLICITLY — not "which case" but "is this in NO case at all", which over
         a set is `length === 0` and was never really a scalar question. It was
         only ever spelled as one because a truthy scalar and a non-empty set
         happened to coincide while a finding could have at most one case. */
      if (r && this.#casesOfSha(r.bundle_id, r.bundle_sha, r.edition).length === 0) {
        const st = this.#looseEditionState(r.bundle_id, r.edition);
        if (st) { theCase = null; ed = r.edition; state = st; }
      }
    }
    /* D-561 (C-98.8): THE CODE CARRIES ITS CANNED TRANSLATION, from its row in this module's table (R17): the control plane's `json()`
       decorates by code from the catalogue only, and the row moved with this read. */
    if (!state) {
      /* DEC-49 REGION is-not-published */
      return { ok: false, reason: "NOT_PUBLISHED", ...rowOf("NOT_PUBLISHED"),
               detail: "no published edition answers to that. A case that was never published, an edition "
                     + "that does not exist and an id that never existed are one answer here, because the "
                     + "published projection is the only thing this read can see." };
      /* END DEC-49 REGION is-not-published */
    }

    /* Every edition of this CASE, so a reader holding an older one learns that a
       newer one exists WITHOUT this surface deciding on their behalf that the
       new one supersedes what they read (DEC-12: the supersession is SURFACED,
       never followed -- REC-17 renders the obligation from exactly this).
       Editions are over the CONTAINER, which DEC-44 makes their natural home. */
    const editions = theCase
      ? this.#rows(`SELECT edition, ratified_at, manifest_sha FROM published_cases WHERE case_id=? ORDER BY edition`,
                   theCase)
      : this.#rows(`SELECT edition, ratified_at FROM published_bundles WHERE bundle_id=? ORDER BY edition`,
                   state.findings[0].bundle_id);

    /* The graph, PER FINDING. published_edges is keyed from the finding that
       cited, so a case of two findings has two graphs and they are not merged:
       merging them would attribute one finding's citations to the other, and
       R4's division disclosure is a statement about a particular finding's
       question rather than about the case. */
    const findings = state.findings.map((fnd) => {
      const serves = [], names = [], unresolved = [];
      for (const e of this.#rows(
        `SELECT to_bundle, kind, disclosure FROM published_edges WHERE from_bundle=? ORDER BY kind, to_bundle`,
        fnd.bundle_id)) {
        if (e.disclosure === "name") { names.push({ to: e.to_bundle, kind: e.kind }); continue; }
        const t = this.#one(
          `SELECT edition, title, bundle_sha, ratified_at FROM published_bundles
           WHERE bundle_id=? ORDER BY edition DESC LIMIT 1`, e.to_bundle);
        /* A SERVE edge with nothing published behind it is a CONTRADICTION in the
           index and is REPORTED rather than swallowed. Silently dropping it would
           make the write-time restriction untestable from here — an assertion that
           no served edge names working material would pass on an empty list, which
           is an outcome that costs nothing to produce. It discloses nothing new:
           every row of this table comes from that finding's OWN ratified bundle.md,
           which any caller can fetch by hash, so the id is already public in the
           bytes the group signed. The honest cause is a target published and later
           purged; the dishonest one is the restriction having been broken, and
           `published.test.mjs`' R3 arm on an unresolved edge is exactly that. */
        if (!t) { unresolved.push({ to: e.to_bundle, kind: e.kind }); continue; }
        /* CASE-5: BY THE HASH. `t.edition` is the TARGET FINDING's own edition
           and this line asked `published_cases` for a container at that number —
           so a served leg pointing at a finding inside a case whose editions ran
           ahead of the finding's would report the wrong container hash, or none,
           on the surface a reader uses to check the leg. `case_edition` is
           stated so the reader can fetch the container the hash belongs to. */
        /* D-309: **ALL** OF THEM. A served leg points at a FINDING, and under
           clause 6 that finding may be a member of several cases — the shape the
           ruling exists for, since a leg resting on a mined finding is exactly
           the "lasting value" Bob named. Naming one container would tell a reader
           checking this leg to fetch a case the leg was never about. Each entry
           carries its own `manifest_sha` because the container hash is per case
           edition, so the reader can verify whichever one they hold. The scalar
           pair is the sole membership or null, as everywhere else. */
        const tms = this.#casesOfSha(e.to_bundle, t.bundle_sha, t.edition);
        const manifestOf = (cid, ced) =>
          this.#one(`SELECT manifest_sha FROM published_cases WHERE case_id=? AND edition=?`,
                    cid, ced)?.manifest_sha ?? null;
        const tm = this.publication.soleCase(tms);
        serves.push({ to: e.to_bundle, kind: e.kind, edition: t.edition, title: t.title,
                      bundle_sha: t.bundle_sha, ratified_at: t.ratified_at,
                      case_id: tm ? tm.case_id : null, case_edition: tm ? tm.edition : null,
                      cases: tms.map((x) => ({ case_id: x.case_id, edition: x.edition,
                                               manifest_sha: manifestOf(x.case_id, x.edition) })),
                      manifest_sha: tm ? manifestOf(tm.case_id, tm.edition) : null });
      }
      return { ...fnd, serves, names, unresolved,
               division: {
                 parent: names.find((n) => n.kind === "division_parent")?.to ?? null,
                 siblings: names.filter((n) => n.kind === "division_sibling").map((n) => n.to).sort(),
                 detail: "a division's parent and siblings are NAMED and never served: the parent is terminal and "
                       + "can never be published, a sibling may not be, and a reader who can see one half of a "
                       + "divided question is entitled to know the other half exists (R4).",
               } };
    });

    /* R3 (N345): THE TENSIONS THE SIGNED DOCUMENT DISCLOSED, read from its bytes and never live; each member's own
       sentences beside it. A document before /5 answers null with its sentence (R13); no signed document, or no case,
       discloses nothing here and says so. */
    const disclosed = state.document && typeof state.document.text === "string"
      ? caseTensionsOf(state.document.text)
      : { tensions: null, highlighted: null, members: {}, unread: null,
          detail: theCase ? "no signed case document is held for this edition, so it states no disclosure here"
                          : "this is not a case, so it discloses no contradiction" };
    for (const f of findings) f.tensions = disclosed.tensions === null ? null : disclosed.members[f.bundle_id] || [];
    /* R3 (N364; `case-grammar` R1): the `captures:` and `sources:` blocks as signed, from the same bytes and never live: what
       the document states of a source is what `publishableAt` answered at the commit (`publication` R51), and nothing is added. */
    const blocks = state.document && typeof state.document.text === "string"
      ? caseDocumentBlocks(state.document.text)
      : { captures: null, sources: null,
          detail: theCase ? "no signed case document is held for this edition, so it states no capture or source here"
                          : "this is not a case, so it states no capture or source" };
    const cRow = theCase
      ? this.#one(`SELECT manifest FROM published_cases WHERE case_id=? AND edition=?`, theCase, ed) : null;
    const manifest = cRow && cRow.manifest ? JSON.parse(cRow.manifest) : null;
    const signed = signedParts(state.document);
    const said = this.#editionStatements(signed, theCase, ed, editions);
    /* R20 (DEC-116 items 7, 8): each edition a docket withdrawal names carries its stamp; the edition is answered whole
       as before. The docket's last date is `docket` R14's `last_entry`, read synchronously and without any capture's
       bytes through its `lastEntryOf` (K1276), null when the case has no public entry. */
    const withdrawn = theCase ? new Map(editions.map((e) => [Number(e.edition), this.#withdrawnStamp(theCase, e.edition)]))
                              : new Map();
    return { ok: true, caseId: theCase, edition: ed,
             /* R20: the withdrawal stamp at the top of the answer, linked to its entry; null when no withdrawal names
                this edition. */
             withdrawn: withdrawn.get(Number(ed)) ?? null,
             docket_last_entry: theCase ? (this.docket.lastEntryOf({ case: theCase }) ?? null) : null,
             /* R3 (DEC-101; Publication §5A): what changed in this edition, at the top, and the successor's statement
                beside the pointer to it; both read from signed documents, never live. */
             what_changed: said.what_changed, successor: said.successor,
             scope: state.scope,
             /* CASE-5 / DEC-72 clause 2, ON THE ANONYMOUS PUBLIC READ, which is
                the surface the whole ruling is FOR. Clause 4's design sentence
                is *"each claim's own derived strength displayed beside the case's
                standard"* — a reader cannot do that if the standard is not on
                the answer, and until this item the only way to reach it was to
                pick one member's `required` block and hope the others agreed.
                `project` beside it because a bar with no publisher is a
                requirement nobody asserted. Both null for a case published
                before DEC-72, and null here is the design's absent-bar posture,
                not a bar of zero: `bar_detail` below says so in words. */
             project: state.project ?? null,
             /* R19 (DEC-111; `case-grammar` R10): the notice this edition names as its project reference, read from its
                signed document with `case-grammar`'s one reading, never live; null when it names none or is not `/5`. */
             project_reference: signed ? workingOnOf(signed.fm) : null,
             bar: state.bar ?? null,
             bar_detail: state.bar
               ? "the standard of evidence this case was held to, read from its publishing project at the "
               + "moment of publication and frozen here (DEC-72). It is the CASE's property: no bar attaches "
               + "to any finding, and nothing composed it across projects. Each member's own derived pair is "
               + "printed beside it inside findings[], and a member may exceed it."
               : "NO BAR IS RECORDED for this case edition, and that is not a bar of zero. Either the case "
               + "was published before a case carried its own standard, or no bar was ever declared — in "
               + "which case the case claims no cleared standard and says so, because undetermined is "
               + "first-class here and is never rounded to a number nobody chose.",
             bias_acknowledgement: state.bias_acknowledgement ?? null,
             /* R3 (DEC-103): the lens this edition was produced under, read from its signed document, never live. */
             lens: said.lens, lens_fingerprint: said.lens_fingerprint, lens_detail: said.lens_detail,
             /* D-712: THE SIGNED CASE DOCUMENT, SERVED. `caseEditionState` builds `document` for exactly this read (the
                ratify path and the public read must not be able to disagree), and this return picks its fields by
                name (IC-22), so it names it. NULL UNTIL RATIFIED, never a partial; null on the loose branch. */
             document: state.document ?? null,
             /* IC-22, 2026-08-05 (UI-40): `opened` IS NOT PUBLISHED HERE. It was
                the instant the case edition was opened, and NOTHING read it —
                re-measured across the whole repository rather than inherited
                from the item that found it: zero reads in `civicos-ui`, in
                `newgroup`, in `docprofile`, in `pdf-worker`, in `tools`, and not
                one assertion in the test battery of the day. The surface renders `ratified_at`,
                which is the instant the record can actually stand behind.
                Removed rather than blanked, on REC-41's precedent: there is no
                key in the answer for a later refactor to re-expose and a caller
                cannot tell one was ever computed.

                CORRECTED 2026-08-05 (REC-58), AND THE CORRECTION IS THE WHOLE
                OF THAT ITEM. This block used to finish: "`caseEditionState`
                still carries `opened` and STILL SHOULD — [the publish-case op]
                returns it to the member who just published, which is a
                different op, a different class and a different question". The
                CONCLUSION was right and the REASON WAS FALSE. `publishCase()`
                computes no `opened`, reads none and returns none — the only
                occurrence of the letters in its whole body is the word
                "reopened" inside a refusal sentence.
                No sibling op was being spared, because no sibling op publishes
                it. REC-58 was queued off this sentence to sweep a site that
                does not exist, which is why the sentence is corrected here
                rather than quietly dropped: an item was spent on it.

                CORRECTED AGAIN 2026-08-08 (M0-12), AND THE SECOND CORRECTION IS
                WHY THAT ITEM EXISTS. Both sentences above named the op as
                `publishcase`. THERE IS NO SUCH OP. `publishcase` is the STORE'S
                DO PATH; `DO_PATH` (then in the plane's index.mjs, now `control-plane`'s) aliases `op=publish` onto it, so
                the op whose name matches the method is routed AWAY from it and
                a caller sending the path name as `op=` gets `unknown op`. The
                routing chain, in full: **`op=publish` -> DO path `publishcase`
                -> `Store.publishCase()`**. REC-58 was right about the field and
                wrong about the op — REC-41's lesson for the FOURTH time, inside
                the very correction written to close the third. The mechanical
                check was `scripts/op-claims.mjs`, driven by
                `test/op-claims.test.mjs` (both since retired), and it found this line.

                WHERE IT ACTUALLY GOES, measured: `caseEditionState` has TWO
                callers. `publish()` — the ratification committer — returns the
                state WHOLE as `case: caseState`, and that is an INTERNAL
                Durable Object hop; the control plane then builds `op=ratify`'s
                answer and the container manifest by NAMING their fields, and
                `opened` is in neither list. This method is the other caller and
                picks its fields likewise. So the field reaches no caller on any
                op, and the risk it carries is not that it IS published but that
                it BECOMES published — one `...state` spread in any of the three
                and a field with zero measured demand is on the wire with nobody
                having decided it. This read's pick is held by
                `convert-publishedcase.test.mjs` and the container's by
                `convert-multifinding.test.mjs`; `op=ratify`'s is the control
                plane's. */
             completeness: state.completeness, ratified_at: state.ratified_at,
             complete: state.complete, awaiting: state.awaiting,
             ...(asked ? { asked } : {}),
             findings,
             tensions: disclosed.tensions, highlighted: disclosed.highlighted,
             /* K499: the member legs the conflict read could not examine, stated by the document; null where it states none. */
             tensions_unread: disclosed.unread,
             captures: blocks.captures, sources: blocks.sources,
             blocks_detail: blocks.detail
               ?? "each capture a member rests on, with its grade and co-attestation, and what may be told of the source "
                + "behind it, read from the signed document: a source's detail is stated only as it could be published "
                + "when the case was signed.",
             tensions_detail: disclosed.detail
               ?? "each contradiction this edition's owner disclosed, read from the signed document: both sides as "
                + "the publisher saw them, its state and who acknowledged it. One marked highlighted rests on a side in "
                + "conflict with a record the publisher could not see, which is not named. A disclosure reaches one "
                + "level. It composes no strength.",
             /* R8: the evidence package's block, computed at this read by the module that provides it. */
             evidence_package: this.#evidencePackage(theCase, ed, findings),
             manifest_sha: state.manifest_sha, manifest,
             files: (manifest && Array.isArray(manifest.parts) ? manifest.parts : []).map(
               (p) => ({ path: p.path, sha256: p.sha256, kind: p.kind, bytes: p.bytes ?? null,
                         finding: p.finding ?? null })),
             editions: editions.map((e) => e.edition),
             /* R20: each case edition's row carries its own stamp, or null, so a reader of any edition sees which
                stand withdrawn; a loose bundle's rows are not a case's editions and are unchanged. */
             edition_index: theCase ? editions.map((e) => ({ ...e, withdrawn: withdrawn.get(Number(e.edition)) ?? null }))
                                    : editions,
             latest_edition: editions.length ? editions[editions.length - 1].edition : ed,
             case_detail: "a published case is a CONTAINER over one or more FINDINGS (DEC-44). Each finding "
                        + "carries its OWN conclusion, falsifier, basis and its own frozen PAIR of strengths; "
                        + "the case carries the scope that brought them together, the completeness "
                        + "assertion, and the group's acknowledgement of the bias the case was produced "
                        + "under — the last of these is a DISCLOSURE the reader weighs, never a verdict this "
                        + "plane reached (DEC-20, DEC-46). There is deliberately no case-level strength: "
                        + "composing two findings' strengths into one letter is the substitution R2 forbids.",
             graph_detail: "each finding's serves[] is what this surface may hand over — every entry names a "
                         + "published edition. names[] is what it may only NAME. unresolved[] is an edge "
                         + "classified servable at publication with no published edition behind it now, stated "
                         + "rather than dropped; it should be empty." };
  }

  /* R3 (DEC-101, DEC-103; K1019): THE EDITION'S OWN STATEMENTS, from its signed document through `case-grammar`'s
     readers (its R8, R9) and never live, so a bias manifest or a statement changed after signing changes nothing here.
     `what_changed` is answered for an edition above 1 only (edition 1 has nothing it changed); a document without the
     block answers null and nothing is filled in (R13). `successor` is the next edition's statement, quoted beside this
     edition's pointer to it; null on the latest edition. `lens` is the signed section whole (`print`, the print form)
     and its parts: the acknowledgement, each statement with its justification, printed citations and withheld count
     in the document's order, and the closing sentences the document prints. A withheld citation is a count; nothing
     names it. Without the blocks, `lens` is null and `lens_fingerprint` is the frozen manifest's `statements_sha`. */
  #editionStatements(doc, theCase, ed, editions) {
    const wc = doc && Number(ed) > 1 ? whatChangedOf(doc.fm, doc.body) : null;
    const what_changed = wc ? { statement: wc.statement, began_as: wc.began_as, draft: wc.draft,
                                adopted_as_drafted: wc.adopted_as_drafted } : null;
    let successor = null;
    const next = theCase ? editions.map((e) => Number(e.edition)).filter((n) => n > Number(ed)).sort((a, b) => a - b)[0]
                         : undefined;
    if (next !== undefined) {
      const nd = signedParts((this.publication.caseEditionState(theCase, next) || {}).document);
      const nwc = nd ? whatChangedOf(nd.fm, nd.body) : null;
      successor = { edition: next, statement: nwc ? nwc.statement : null };
    }
    const l = doc ? lensOf(doc.fm) : null;
    if (l) {
      const print = lensSection(doc.body);
      const ack = doc.fm.bias_acknowledgement;
      return { what_changed, successor, lens_fingerprint: null, lens_detail: null,
               lens: { bias_acknowledgement: typeof ack === "string" ? ack : null,
                       statements: l.statements.map((x) => ({ bundle: x.bundle, id: x.id, kind: x.kind,
                         subject: x.subject, text: x.text, justification: x.justification,
                         citations: x.citations, withheld: x.withheld })),
                       closing: print ? LENS_CLOSING_SENTENCES.filter((c) => print.includes(c)) : [],
                       print } };
    }
    if (!doc) return { what_changed, successor, lens: null, lens_fingerprint: null, lens_detail: LENS_NO_DOCUMENT_SENTENCE };
    const bm = doc.fm.bias_manifest && typeof doc.fm.bias_manifest === "object" ? doc.fm.bias_manifest : null;
    const sha = bm && typeof bm.statements_sha === "string" && /^[0-9a-f]{64}$/.test(bm.statements_sha)
      ? bm.statements_sha : null;
    const noneInForce = bm && (bm.in_force === false || bm.in_force === "false");
    return { what_changed, successor, lens: null, lens_fingerprint: sha,
             lens_detail: sha ? LENS_FINGERPRINT_SENTENCE
               : noneInForce ? LENS_NONE_IN_FORCE_SENTENCE : LENS_FINGERPRINT_UNDETERMINED_SENTENCE };
  }

  /* REC-128 — THE ONE READ CHOKEPOINT FOR WHO DELIVERED A RATIFICATION. Every
     read that serves a ratification (the finding rows, the case document, the
     public case read and so the container that travels) answers through here,
     from the stored `delivered_by` column and from NOTHING ELSE: in particular
     never from `attestor_member`, so a row written before the column existed
     reads UNDETERMINED, stated, rather than back-filled from its signer.
     `published.test.mjs`' R12 and R13 arms hold that. */
  #deliveredBy(row) { return delivererOf(row ? row.delivered_by : null); }

  /* A ratified bundle that belongs to NO case, in the same shape as a case
     edition so one renderer serves both — with `caseId: null`, no scope and no
     completeness, because it is not a case and saying otherwise is the exact
     claim DEC-44 corrects. This is what an information bundle's ratification
     is: verifiable bytes with a signature and no case-level assertion. */
  #looseEditionState(bundleId, ed) {
    const r = this.#one(
      `SELECT bundle_id, title, bundle_sha, ratified_at, attestor_key, attestor_member, delivered_by, gate_version,
              sig_armored, strength, required, parts
       FROM published_bundles WHERE bundle_id=? AND edition=?`, bundleId, ed);
    if (!r) return null;
    /* REC-47: `bias_acknowledgement: null` for the same reason `scope` and
       `completeness` are null here — a ratified bundle that is not a case makes
       no case-level assertion, and inventing one would be the exact claim
       DEC-44 corrects. Stated as null rather than omitted, so a renderer sees
       "no such assertion" rather than a missing key it might read as absence of
       bias. */
    return { caseId: null, edition: ed, scope: null, completeness: null,
             bias_acknowledgement: null,
             /* D-712: no case document — this is not a case. Stated as null so both branches answer one key set. */
             document: null,
             /* CASE-5: `project` and `bar` null here for the reason `scope` and
                `completeness` already are — whose production a thing is and what
                standard it was held to are CASE assertions, and this is not a
                case. Stated rather than omitted so a renderer sees "no such
                assertion" instead of a missing key it might read as a bar of
                zero, which is the distinction the design doc's absent-bar clause
                is entirely about. */
             project: null, bar: null,
             opened: r.ratified_at, ratified_at: r.ratified_at, manifest_sha: null,
             complete: true, awaiting: [],
             findings: [{ ord: 0, bundle_id: r.bundle_id, title: r.title, bundle_sha: r.bundle_sha,
                          /* CASE-5: the same two keys `caseEditionState` serves
                             per member, so ONE renderer still serves both shapes
                             — which is this method's whole reason for existing.
                             `version_sha` is null because nothing pinned these
                             bytes: no case committed to them. `role` is null
                             because a designation is a case's partition and there
                             is no case here to be a member of. */
                          version_sha: null, role: null, edition: ed,
                          ratified_at: r.ratified_at, gate_version: r.gate_version, sig_armored: r.sig_armored,
                          attestor: { member: r.attestor_member, key_b64: r.attestor_key },
                          delivered_by: this.#deliveredBy(r),
                          strength: r.strength ? JSON.parse(r.strength) : null,
                          required: r.required ? JSON.parse(r.required) : null,
                          parts: r.parts ? JSON.parse(r.parts) : [] }],
             detail: "this is a RATIFIED RECORD that is not a member of any published case: it was never "
                   + "published as a finding, so it carries no case identity, no scope statement, no "
                   + "completeness assertion and no bias acknowledgement — those are claims a CASE makes, "
                   + "and this is not one. Its bytes are verifiable by hash exactly as any other ratified "
                   + "bytes are." };
  }

  /* D-309: THE READ SURFACE'S HALF OF CLAUSE 6 — one case to serve, chosen by the
     READER and never by this plane.

     `publishedCase()` serves ONE case edition: its scope, its completeness
     assertion, its bias acknowledgement, its bar, its findings. That is a single
     artifact and cannot be two. So when a finding serves several cases this
     surface has three options and only one of them is honest — serve the newest
     (a guess dressed as an answer), serve all (a container that is not an
     artifact anybody published), or SAY SO AND NAME THEM.

     THE CALLER'S OWN `caseId` WINS WHENEVER IT ANSWERS, which is what keeps this
     a resolution aid rather than a wall: a reader who already knows which case
     they mean passes it and is served, and only a reader who has not said is
     asked. That ordering matters — refusing someone who DID say would be a fence
     tighter than its rule.

     IT NEVER REFUSES AN EMPTY LIST. A finding in no case at all is not ambiguous,
     it is loose, and the loose arm further down is what answers it — refusing
     here would break the doorbell's promise that ratified bytes answer. */
  #resolveOneCase(bundleId, list, namedCase = null) {
    const rows = list || [];
    if (!rows.length) return { ok: true, pick: null };
    const named = String(namedCase ?? "").trim();
    if (named) {
      const mine = rows.filter((x) => x.case_id === named);
      if (mine.length) return { ok: true, pick: this.publication.soleCase(mine) };
    }
    const sole = this.publication.soleCase(rows);
    if (sole) return { ok: true, pick: sole };
    const cases = [...new Set(rows.map((x) => x.case_id))].sort();
    /* UI-81 / C-44.2: THE CODE NOW CARRIES ITS CANNED TRANSLATION (DEC-49). It reached the published
       case page raw — no `*_CHECKS` row named it, so the guard could not see the one refusal a stranger
       meets on that page. Built from its row (`rowOf`, C-44.2 held in this module's table, R17), so `reason` and `code` are one literal and the wire only GAINS `code`, `check` and
       `translation`; every field it carried is unchanged (IC-185). */
    /* DEC-49 REGION is-finding-in-several-cases */
    return { ok: false, reason: "FINDING_IN_SEVERAL_CASES", ...rowOf("FINDING_IN_SEVERAL_CASES"), target: bundleId, cases,
             memberships: rows.map((x) => ({ case_id: x.case_id, edition: x.edition })),
             detail: `${bundleId} is a published finding of ${cases.length} cases (${cases.join(", ")}). `
                   + `A finding can serve many cases (DEC-72 clause 6), and each case is its own artifact `
                   + `with its own scope and completeness assertion — so this read cannot choose one for `
                   + `you. Ask again naming the case you mean.` };
    /* END DEC-49 REGION is-finding-in-several-cases */
  }

  /* CASE-5 / DEC-72: WHICH CASE EDITION A SET OF PUBLISHED BYTES BELONGS TO,
     RESOLVED BY THE HASH RATHER THAN BY A NUMBER.
     `#casesOf(bundleId, edition)` above takes a CASE edition and is still exactly
     right when a caller holds one. What its callers actually held, in four of
     the five places it was used, was a `published_bundles` row — whose `edition`
     is the FINDING'S, and passing that as the case's is the same conflation
     `caseEditionState` carried, arriving through the argument list instead of
     through a WHERE clause. Before the flip the two numbers agreed and nobody
     could see it; after it a finding at its own edition 1 inside a case at
     edition 2 would resolve to NO CASE AT ALL and read as unpublished material.
     Answers BOTH halves — the case and THE CASE'S EDITION — because every caller
     that wanted one wanted the other and was deriving it from the wrong number.
     The fallback is the pre-CASE-3 row whose pin is honestly NULL, and for those
     rows the finding's edition IS the case's, which is the model they were
     written under.
     IT USED TO SAY `ORDER BY edition DESC LIMIT 1`, described as a real bound
     rather than a formality: one sha can in principle be pinned by more than one
     case edition, so the newest membership answered. Beside it stood the sentence
     that turned out to be the most useful in the file — *"Nothing writes that
     shape today"* — and CASE-6 pointed it at the fence that kept it true.

     ===== D-309, 2026-09-10: SITES 8 AND 9 OF CASE-6's NINE, AND THE SENTENCE IS
     NOW FALSE ON PURPOSE. `FINDING_IN_ANOTHER_CASE` is gone, so something DOES
     write that shape: a finding can be pinned by case A and case B at one hash,
     which is precisely what DEC-72 clause 6 rules it may be. The cross-reference
     did its job — the two moved together, in one item, and neither drifted.

     **THE DECISION HERE IS ALL MEMBERSHIPS, RETURNED AS AN ARRAY, AND IT IS NOT
     A CHOICE BETWEEN SHAPES.** The old comment already diagnosed what would
     happen if this stayed scalar past the fence: it *"starts answering a
     set-valued question with its newest element, which reads as an answer and is
     a guess."* This helper has five callers and they want three different things
     — `publishedList` and `publishedEditions` want to REPORT every membership,
     `publishedCase`'s loose arm wants the BOOLEAN "in no case at all", and
     `publishedCase`'s resolution arms want to serve ONE case and must refuse
     rather than pick when there are two. An array serves all three; a scalar
     serves none of them honestly. Each caller's decision is argued at its own
     site, because deciding them here is how one reader's convenience becomes
     another reader's overclaim.

     THE LEGACY FALLBACK KEEPS ITS MEANING AND ITS ORDER: pre-CASE-3 rows whose
     pin is honestly NULL, for which the finding's edition IS the case's, because
     that is the model they were written under. It is consulted only when the pin
     answers nothing, exactly as before. */
  /* D-309: SITE 2's QUERY, LIFTED OUT OF `publish()` AND PUT BESIDE ITS SIBLINGS,
     AND THE REASON IS A MEASUREMENT RATHER THAN TIDINESS — stated in full because
     a reader could otherwise take it for evasion, and it is the opposite.

     `meaning-bounds.test.mjs` (deleted in T20) graded an op OPAQUE when its
     method contained a `#rows(` call and published no collection: *"rows came
     out of the store and this reader could not say what happened to them."*
     Correcting site 2 put the first `#rows(` into `publish()`'s own body, and the
     walk moved `op=publish` out of NO-COLLECTION and into OPAQUE — a blind spot
     on the heaviest act in the system, which is the state `op=airunlog` was in
     while a ratchet read green over it.

     THE OLD CLASSIFICATION WAS AND REMAINS THE TRUE ONE. These rows do NOT reach
     the wire: they drive a divergence refusal, a per-case flag discharge, and a
     scalar bar projection, and the act answers with `caseCount` — a number — and
     nothing else. `publish()` genuinely publishes no collection. The `#rows(` in
     its body was the only thing making it look otherwise, so the query moved to
     where the file's other which-case readers already live rather than the
     roster growing a member that would have been describing the wrong thing.

     IT WAS NOT HIDDEN FROM ANYTHING: `multicase.test.mjs`'s census (deleted in
     T20) counted it as a full member of CASE-6's class. Its callers' answers are
     what `published.test.mjs`' R2 and R3 arms now hold.

     WHAT IT ANSWERS: which case editions froze THESE EXACT BYTES, one entry per
     CASE at that case's newest edition holding them — the same collapse every
     other D-309 site takes, so "how many cases is this member in" has one answer
     across the file. The JOIN on `published_cases` is unchanged and still does its
     job: only case editions that exist are membership. */
  #casesOfSha(bundleId, bundleSha, fallbackEdition = null) {
    const rows = bundleSha
      ? this.#rows(`SELECT case_id, edition FROM published_case_members
                     WHERE bundle_id=? AND version_sha=? ORDER BY case_id, edition`, bundleId, bundleSha)
      : [];
    if (rows.length) return rows.map((r) => ({ case_id: r.case_id, edition: Number(r.edition) }));
    const legacy = fallbackEdition != null
      ? this.#rows(`SELECT case_id, edition FROM published_case_members
                     WHERE bundle_id=? AND edition=? AND version_sha IS NULL ORDER BY case_id`,
                   bundleId, fallbackEdition)
      : [];
    return legacy.map((r) => ({ case_id: r.case_id, edition: Number(r.edition) }));
  }

}

const instances = new WeakMap();

/** The one instance for a host (K61). The first call creates it with `deps` (a test passes its own). It owns no table,
 *  so it creates and declares none (R16). */
export function publicReadOf(host, deps) {
  let r = instances.get(host);
  if (!r) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const publication = d.publication || publicationOf(host);
    const docket = d.docket ?? null;
    r = new PublicRead({ storage, publication, docket });
    instances.set(host, r);
  }
  return r;
}

/** The module's ops (K3), as entries of `plane`'s store op map (`../plane/store.mjs`), every one unstamped: each reads the published
 *  projection only (R10), so it answers without a credential; `publicread` serves a registered read under the same terms
 *  (R18). */
export function publicReadOps(r, url) {
  const q = (k) => url.searchParams.get(k);
  return {
    publishededitions: () => r.publishedEditions(q("id")),
    /* REC-22: the public read path's store side. */
    publishedcase: () => r.publishedCase({ id: q("id"), edition: q("edition"), caseId: q("caseId") || null,
                                           sha256: (q("sha256") || "").toLowerCase() || null }),
    publishedmanifest: () => r.publishedManifest(),
    verify: () => r.verifySha((q("sha256") || "").toLowerCase()),
    publishedlist: () => r.publishedList(),
    /* R18: a registered read by its name, handed only the parameters it declared (R10). */
    publicread: () => r.publicRead(q("name"), Object.fromEntries(url.searchParams)),
    /* R21: the docket and its feed, by case, under R10's terms. */
    docketpublic: () => r.docketPublic(q("case")),
    docketfeed: () => r.docketFeed(q("case")),
  };
}
