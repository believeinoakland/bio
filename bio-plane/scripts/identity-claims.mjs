/* REC-65 / DEC-52 — THE SWEEP: which comments state a constraint on WHO MAY WRITE an
 * identity field, and which of those constraints the code actually enforces.
 *
 * WHY THIS INSTRUMENT EXISTS, and it is not a style checker. A comment describing a
 * constraint that does not exist is A FENCE THAT READS AS PRESENT TO EVERY SUBSEQUENT
 * AUTHOR. This project has now met that class four times in two days: eleven
 * `MACHINE_CANNOT_*` fences that did not fire while an unrelated payload guard did the
 * work (D-229); ten of twelve acts going all the way through under complete payloads
 * (REC-73); a documented tokenizer branch that could not be reached at all (D-228); and
 * a fence TIGHTER than its rule that silently blocked a later item (IC-33). A false
 * comment is the cheapest possible version of that defect and the easiest to leave.
 *
 * WHAT IT MEASURES. The control plane is where identity is DECIDED: `index.mjs` deletes
 * whatever the caller wrote into an identity field and stamps its own answer — the
 * session's member id, or a MACHINE PRINCIPAL (`class:<cls>` / `token:<class>`). Every
 * such STAMP SITE is a place where the record's answer to "who did this" is fixed. The
 * sweep pairs each stamp site with
 *
 *   (a) the CLAIM its own comment makes about who may write the field, and
 *   (b) whether the plane ENFORCES that claim — i.e. whether the store method the op
 *       reaches refuses a machine identity at all.
 *
 * A site whose comment says the act is a member's while nothing refuses a machine is a
 * DEFECT. A site whose comment says so AND is fenced is TRUE. A site that records
 * DEC-52's ruling — that the machine may rule, and names the machine principal it
 * stamps — is CLOSED ON PURPOSE, which is a different thing from an oversight and the
 * whole reason this reports three verdicts rather than a boolean.
 *
 * WHAT IT CANNOT SEE — stated here rather than discovered later:
 *   - It reads `index.mjs`'s stamp sites only. A comment elsewhere in the plane that
 *     claims a member-only constraint without sitting at a stamp site is reported by
 *     `wideClaims()` as a LEDGER and is NOT judged: the sweep cannot tell which act such
 *     a sentence governs, and guessing would be the over-strict direction.
 *   - Enforcement is read from the store method the DISPATCH TABLE names, plus ONE level
 *     of private-helper call. A fence two helpers deep reads as absent.
 *   - It resolves `X_ACTIONS.includes(op)` against `const X_ACTIONS = [...]` literals in
 *     `index.mjs`. An op set built at runtime reads as empty and the site is reported
 *     with `ops: []` rather than silently dropped.
 *   - It cannot tell a claim from a quotation of a claim. A comment quoting the OLD
 *     wording in order to correct it would be flagged; none does today, and the arms
 *     below would catch it as a delta if one arrived.
 *   - **AND THE LIMIT THAT MATTERS MOST, BECAUSE IT IS THE ONE THIS PROJECT HAS ALREADY
 *     PAID FOR TWICE: it measures the PRESENCE of a machine refusal, never that the
 *     refusal FIRES for every payload.** D-229 found eleven fences that did not do the
 *     work an unrelated payload guard was doing, and REC-73 found ten of twelve acts
 *     going all the way through once the payloads were complete. A site this sweep
 *     reports as TRUE has a fence in the method the op reaches; whether that fence is
 *     what refuses is REC-73's question and `machine-fences.test.mjs` is where it is
 *     answered. Reading TRUE here as "proved" would be the same error one layer over.
 */

/* ---------------------------------------------------------------- the matchers */

/* A MEMBER-ACTOR claim: the comment names a member (or a person, as a category) as the
   actor of the write. Deliberately NOT a list of the six spellings that exist today —
   REC-70's lesson is that a list of spellings is a fence you have to keep extending.
   What every one of them has in common is a POSSESSIVE or a PREDICATION binding the act
   to `member`: "a member's constitutive statement", "that member's declaration", "the
   threading member's authored judgment", "Members BUILD the registry", "MEMBER actions
   performed by a PERSON". */
export const MEMBER_ACTOR = [
  /\bmembers?['’]s?\b/i,                                            /* member's / members' */
  /\bonly a (?:named |signed-in )?member\b/i,
  /\bMEMBER (?:action|act|verb|write)s?\b/,                              /* case-sensitive: the emphatic form */
  /\bmembers?\s+(?:author|declare|build|confirm|thread|resolve|own)s?\b/i,
];

/* THE DISPOSITION IS DECLARED, NOT SNIFFED — and this is the second thing the instrument
   got wrong about itself before it got anything right about the plane.
   THE FIRST DESIGN read the prose: a site counted as closed-on-purpose if its comment
   cited DEC-52 and mentioned the machine principal. Run against REC-65's OWN corrected
   comments it was wrong in BOTH directions at once. It read `op=provenancechain` and
   `op=proposedispose` as CLOSED ON PURPOSE because their new comments say, at length,
   that DEC-52 does NOT cover them — the matcher cannot tell a citation from a denial.
   And it read the expertise pair as a DEFECT because that block names the real machine
   identity (`class:member`) instead of the placeholder spelling `class:<cls>`.
   A prose sniffer would also hand any later author a six-character silencer. So the
   verdict is DECLARED at the site in a marker this file defines, and the declaration is
   then CHECKED AGAINST THE CODE — which is the shape `DEC-49 REGION` already uses in
   store.mjs, and the reason a marker beats an adjective.

     IDENTITY-CLAIM: RULED DEC-52 — <why the act is permitted>
     IDENTITY-CLAIM: ENFORCED-ELSEWHERE NO_SUCH_MEMBER — <what actually refuses>
     IDENTITY-CLAIM: OPEN — <what is undecided, and where it is routed>

   Each is falsifiable and each is falsified by a DIFFERENT thing, which is the point:
     - RULED must name a DEC, must NOT sit over a fenced op (a fence would contradict the
       ruling), and must carry the naming half the ruling depends on — `class:<cls>` /
       `token:<class>`. Drop the naming and RULED stops being true, because permission is
       granted against a named actor.
     - ENFORCED-ELSEWHERE must NAME the refusal code that actually fires, and the suite's
       behavioural block drives the op and compares. A code that stops firing fails.
     - OPEN is the honest answer and it is not free: every OPEN site is pinned BY NAME in
       `test/identity-claims.test.mjs`, as a SET, so it fails when a site is added AND
       when one is quietly resolved. */
export const MARKER = /IDENTITY-CLAIM:\s*(RULED|ENFORCED-ELSEWHERE|OPEN)\b([^\n*]*)/;
export const PRINCIPAL_NAMED = /class:\s*<cls|class:<class>|token:\s*<cls|token:<class>|MACHINE_(?:CLASS|AUTHOR)_PREFIX/;

export function classifyComment(text) {
  const claims = MEMBER_ACTOR.filter((re) => re.test(text)).map((re) => String(re));
  const m = text.match(MARKER);
  const marker = m ? m[1] : null;
  const tail = m ? m[2] : "";
  return {
    memberActor: claims.length > 0,
    claimPatterns: claims,
    marker,
    markerDec: marker === "RULED" ? (tail.match(/\bDEC-\d+\b/) || [null])[0] : null,
    markerCodes: marker === "ENFORCED-ELSEWHERE" ? [...tail.matchAll(/\b([A-Z][A-Z_]{3,})\b/g)].map((x) => x[1]) : [],
    principalNamed: PRINCIPAL_NAMED.test(text),
  };
}

/* ------------------------------------------------------- index.mjs: the stamp sites */

const STAMP = /MACHINE_(?:CLASS|AUTHOR)_PREFIX/;

/* `const X_ACTIONS = ["a", "b", ...];` — resolved so a site guarded by a named set
   reports the ops it actually covers rather than the identifier. */
export function actionSets(src) {
  const out = new Map();
  const re = /const\s+([A-Z][A-Z0-9_]*)\s*=\s*\[([^\]]*)\]/g;
  let m;
  while ((m = re.exec(src))) {
    const names = [...m[2].matchAll(/"([a-z][a-z0-9_]*)"/g)].map((x) => x[1]);
    if (names.length) out.set(m[1], names);
  }
  return out;
}

/* The comment block above a line: contiguous comment lines, walking up through blank
   lines is NOT allowed (a declaration is a paragraph — the same extent rule the control
   register learned the hard way in M0-14), but several adjacent `/* … *\/` blocks ARE
   one comment, because that is how this file writes a site with three reasons. */
export function commentAbove(lines, i) {
  let end = i - 1, out = [];
  let inBlock = false;
  while (end >= 0) {
    const raw = lines[end];
    const s = raw.trim();
    if (!inBlock && s.endsWith("*/")) { inBlock = !s.startsWith("/*"); out.unshift(raw); end--; continue; }
    if (inBlock) { out.unshift(raw); if (s.startsWith("/*")) inBlock = false; end--; continue; }
    if (s.startsWith("//")) { out.unshift(raw); end--; continue; }
    if (s.startsWith("/*") && s.endsWith("*/")) { out.unshift(raw); end--; continue; }
    break;
  }
  return { text: out.join("\n"), firstLine: end + 2, lines: out.length };
}

/* The ops a stamp site covers. Read from the `if (...)` head that governs the site: the
   nearest preceding line at or before it whose text opens an `if (`, widened to the
   whole condition (it may run several lines). An `else` branch takes the enclosing
   block's head MINUS the sibling `if`'s own literals, which is the expertise pair's
   exact shape (`if (op === "expertisedeclare") … else …`). */
export function opsFor(lines, i, sets) {
  const collect = (txt) => {
    const direct = [...txt.matchAll(/op\s*===\s*"([a-z][a-z0-9_]*)"/g)].map((m) => m[1]);
    const viaSet = [...txt.matchAll(/([A-Z][A-Z0-9_]*)\s*\.includes\(\s*op\s*\)/g)]
      .flatMap((m) => sets.get(m[1]) || []);
    return [...new Set([...direct, ...viaSet])];
  };
  const head = (n) => {
    /* the condition may span lines: take from the `if (` to the line whose parens balance */
    let txt = "", depth = 0, started = false;
    for (let k = n; k < Math.min(lines.length, n + 25); k++) {
      const l = lines[k];
      txt += l + "\n";
      for (const ch of l) {
        if (ch === "(") { depth++; started = true; }
        else if (ch === ")") depth--;
      }
      if (started && depth <= 0) break;
    }
    return txt;
  };
  const own = lines[i];
  /* the site's own line carries an inline guard (`if (op === "x") b.f = …`) */
  if (/^\s*if\s*\(/.test(own) && collect(own).length) return { ops: collect(own), from: i + 1 };
  if (/^\s*else\b/.test(own.trim())) {
    /* the sibling `if` is the nearest preceding `if (` line; the enclosing block's head
       is the nearest one BEFORE that */
    for (let n = i - 1; n >= 0 && n > i - 40; n--) {
      if (/^\s*if\s*\(/.test(lines[n])) {
        const sibling = collect(head(n));
        for (let p = n - 1; p >= 0 && p > n - 40; p--) {
          if (/^\s*if\s*\(/.test(lines[p])) {
            const outer = collect(head(p));
            const ops = outer.filter((o) => !sibling.includes(o));
            if (ops.length) return { ops, from: p + 1 };
            break;
          }
        }
        break;
      }
    }
  }
  for (let n = i; n >= 0 && n > i - 40; n--) {
    if (/^\s*(\}\s*)?(else\s+)?if\s*\(/.test(lines[n])) {
      const ops = collect(head(n));
      if (ops.length) return { ops, from: n + 1 };
    }
  }
  return { ops: [], from: null };
}

export function stampSites(indexSrc) {
  const lines = indexSrc.split("\n");
  const sets = actionSets(indexSrc);
  const sites = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!STAMP.test(l)) continue;
    if (/^\s*(\*|\/\/|\/\*)/.test(l)) continue;                 /* the prose about the prefixes */
    if (/^\s*import\b|from "/.test(l)) continue;                /* the import line */
    /* the field this statement writes: walk back to the statement head */
    let field = null, headLine = i;
    for (let n = i; n >= 0 && n > i - 8; n--) {
      const mSet = lines[n].match(/inner\.searchParams\.set\(\s*"([a-zA-Z_]+)"/);
      const mAsg = lines[n].match(/(?:^|[^A-Za-z0-9_.])b\.([a-zA-Z_]+)\s*=/);
      if (mSet) { field = mSet[1]; headLine = n; break; }
      if (mAsg) { field = mAsg[1]; headLine = n; break; }
    }
    if (!field) continue;
    const { ops, from } = opsFor(lines, headLine, sets);
    /* THE ANCHOR. A site's reasons are written above the `if` that guards it. Where that
       `if` is an INLINE guard inside an already-guarded block — the expertise pair's
       exact shape, `if (op === "expertisedeclare") b.memberId = …` — there is no comment
       directly above it and the reasons belong to the ENCLOSING block. So the anchor
       walks outward through preceding `if (` heads until a comment is found. Without
       this the two expertise sites read as having no comment at all, which is the
       generous direction and the one this instrument must not fail in. */
    let anchor = from == null ? headLine : from - 1;
    let c = commentAbove(lines, anchor);
    for (let n = anchor - 1; c.lines === 0 && n >= 0 && n > anchor - 40; n--) {
      /* AND THE WALK STOPS AT A CLOSED BLOCK. Without this it kept climbing past a
         SIBLING block's brace and handed `op=inboxresolve` — which has no comment of its
         own — the REC-7 reasons written for `op=proposedispose` one block above. A site
         credited with a neighbour's comment is worse than a site with none: it would read
         as judged when it was never looked at. `op=inboxresolve` is reported with a
         ZERO-LINE comment, which is the honest answer. */
      if (/^ {0,4}\}/.test(lines[n])) break;
      if (!/^\s{0,8}if\s*\(/.test(lines[n])) continue;
      anchor = n; c = commentAbove(lines, n);
    }
    sites.push({
      file: "src/index.mjs", line: i + 1, field, ops,
      commentFrom: c.firstLine, commentLines: c.lines, comment: c.text,
      ...classifyComment(c.text),
    });
  }
  return sites;
}

/* MUTATING, read from the plane's OWN `OPS` table rather than from a list here. This is
   what separates an AUTHORSHIP stamp from a READ SCOPE, and the separation is not
   cosmetic: it is the difference REC-46 already held open when it declined to rewire
   `viewerPredicate`, because that one answers a PERMISSION and not a refusal.
   THE INSTRUMENT NEEDED IT. Before this split the sweep reported `op=queue`'s viewer
   stamp as a DEFECT on the strength of "The member's ONE feed" — a possessive naming
   WHOSE feed it is, in a comment that goes on to say plainly that a machine credential
   receives the whole live set. A read has no authorship to misdescribe. Judging it would
   have been the over-strict direction, and it was caught by reading the sweep's own
   output rather than by trusting it. */
export function opsTable(indexSrc) {
  const out = new Map();
  const re = /^\s*([a-z][a-z0-9_]*)\s*:\s*\{[^}]*mutating\s*:\s*(true|false)/gm;
  let m;
  while ((m = re.exec(indexSrc))) if (!out.has(m[1])) out.set(m[1], m[2] === "true");
  return out;
}

/* ------------------------------------------------- store.mjs: is anything enforced? */

/* op -> method, from the DO's own dispatch tables. Reading the table rather than a
   hand-kept list is M0-12's rule and the reason a thirteenth op cannot arrive
   unmeasured. */
export function dispatch(storeSrc) {
  const out = new Map();
  const re = /^\s*"?([a-z][a-z0-9_]*)"?\s*:\s*\(\)\s*=>\s*(?:await\s+)?this\.(#?[A-Za-z0-9_]+)\(/gm;
  let m;
  while ((m = re.exec(storeSrc))) if (!out.has(m[1])) out.set(m[1], m[2]);
  return out;
}

/* Method bodies, keyed by name. A class member at indentation 2. */
export function methodBodies(storeSrc) {
  const lines = storeSrc.split("\n");
  const starts = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^ {2}(?:static\s+|async\s+)*(#?[A-Za-z0-9_]+)\s*\(/);
    if (m && !/^\s*(if|for|while|switch|catch|return)\b/.test(lines[i].trim())) starts.push([m[1], i]);
  }
  const out = new Map();
  for (let k = 0; k < starts.length; k++) {
    const [name, a] = starts[k];
    const b = k + 1 < starts.length ? starts[k + 1][1] : lines.length;
    if (!out.has(name)) out.set(name, lines.slice(a, b).join("\n"));
  }
  return out;
}

/* A MACHINE FENCE: a refusal whose condition tests machine identity. Two shapes exist in
   this plane and both are read — a `MACHINE_CANNOT_*` reason literal, and an
   `isMachineStamp`/`isMachineIdentity` test standing next to a refusal. */
/* THE FENCE MUST BE EMITTED, NOT MENTIONED. An earlier draft of this function matched a
   bare `MACHINE_CANNOT_*` token anywhere in the body and reported `op=tasks` FENCED —
   `taskList`'s own prose names the refusal its neighbours emit. A comment naming a fence
   is exactly the thing this item exists to distrust, so the matcher requires the QUOTED
   refusal: `reason: "MACHINE_CANNOT_…"` or `refuse("MACHINE_CANNOT_…"`. Found by reading
   the fenced list rather than by trusting it. */
const isCommentLine = (l) => /^\s*(\*|\/\/|\/\*)/.test(l);
export function fencesMachine(body) {
  if (!body) return false;
  if (/(?:reason\s*:\s*|refuse\s*\(\s*)"MACHINE_CANNOT_[A-Z_]+"/.test(body)) return true;
  const bl = body.split("\n");
  for (let i = 0; i < bl.length; i++) {
    if (isCommentLine(bl[i])) continue;
    if (!/isMachine(?:Stamp|Identity)\s*\(/.test(bl[i])) continue;
    const win = bl.slice(Math.max(0, i - 2), i + 7).filter((l) => !isCommentLine(l)).join("\n");
    /* `refusal(` as well as `refuse(` — the plane has both spellings and an earlier draft
       matched only the shorter one, which reported `op=suggest` and `op=aicredentialmint`
       UNFENCED while both refuse a machine identity by name. Wrong in the ACCUSING
       direction: it would have had this item "correct" two comments that were true. */
    if (/\breason\s*:|\brefus(?:e|al)\s*\(/.test(win)) return true;
  }
  return false;
}

export function enforcement(storeSrc) {
  const disp = dispatch(storeSrc);
  const bodies = methodBodies(storeSrc);
  const out = new Map();
  for (const [op, method] of disp) {
    const body = bodies.get(method);
    let fenced = fencesMachine(body);
    let via = fenced ? method : null;
    if (!fenced && body) {
      /* ONE level of private-helper call, no more. Stated as a limit, not a promise. */
      for (const h of new Set([...body.matchAll(/this\.(#[A-Za-z0-9_]+)\s*\(/g)].map((m) => m[1]))) {
        if (fencesMachine(bodies.get(h))) { fenced = true; via = h; break; }
      }
    }
    out.set(op, { method, fenced, via });
  }
  return out;
}

/* ----------------------------------------------------------------- the whole sweep */

export function sweep(indexSrc, storeSrc) {
  const sites = stampSites(indexSrc);
  const enf = enforcement(storeSrc);
  const tbl = opsTable(indexSrc);
  for (const s of sites) {
    s.opsKnownToStore = s.ops.filter((o) => enf.has(o));
    /* Only the WRITES are judged. A site that stamps nothing but reads is a scope, not
       an authorship claim, and is reported as such rather than scored. The write set is
       taken from the OPS table over ALL the site's ops — NOT over the ops the dispatch
       table names. `op=promote` is the reason: it is mutating and it is handled by the
       store's own path rather than by a dispatch row, so filtering on the dispatch first
       silently reclassified the largest write in the plane as a READ. */
    const writes = s.ops.filter((o) => tbl.get(o) === true);
    s.writeOps = writes;
    /* An op the dispatch table does not name has enforcement UNDETERMINED, and that is
       reported rather than collapsed into either answer — absent evidence is not
       evidence of absence, and it is certainly not evidence of a fence. */
    s.undeterminedOps = writes.filter((o) => !enf.has(o));
    s.enforcedOps = writes.filter((o) => enf.has(o) && enf.get(o).fenced);
    s.unfencedOps = writes.filter((o) => enf.has(o) && !enf.get(o).fenced);
    /* ENFORCED means EVERY write this site stamps refuses a machine. A site covering a
       set where only some are fenced is NOT enforced — the unfenced member is the hole,
       and an "any" rule would report the set as safe because of its safest element. */
    s.enforced = writes.length > 0 && s.unfencedOps.length === 0 && s.undeterminedOps.length === 0;
    /* A marker that contradicts the code is worse than no marker, so each is checked
       before it is honoured, and a failed check falls through to DEFECT rather than to a
       softer verdict. */
    s.markerOk =
      s.marker === "RULED" ? (!!s.markerDec && s.principalNamed && s.enforcedOps.length === 0)
      : s.marker === "ENFORCED-ELSEWHERE" ? s.markerCodes.length > 0
      : s.marker === "OPEN" ? true
      : false;
    s.verdict = writes.length === 0 ? "READ-SCOPE"
      : !s.memberActor ? "CLEAR"
      : s.enforced ? "TRUE"
      : s.markerOk ? s.marker
      : "DEFECT";
  }
  return { sites, enforcement: enf, opsTable: tbl };
}

/* The WIDE ledger: every comment ANYWHERE in the plane's sources that makes a
   member-actor claim, whether or not it sits at a stamp site. Reported, never judged —
   see "what it cannot see" above. Its point is the DENOMINATOR: "is six the number" is
   only answerable against a corpus somebody printed. */
export function wideClaims(files) {
  const out = [];
  for (const [name, src] of files) {
    const lines = src.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const s = lines[i].trim();
      const isComment = s.startsWith("*") || s.startsWith("/*") || s.startsWith("//") || s.startsWith("--");
      if (!isComment) continue;
      if (MEMBER_ACTOR.some((re) => re.test(lines[i]))) out.push({ file: name, line: i + 1, text: s });
    }
  }
  return out;
}
