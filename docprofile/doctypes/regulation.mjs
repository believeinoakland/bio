/* An ordinance or a resolution: an instrument of law, enacted or proposed.
 *
 * FW-18, the THIRD class in M0-32's measured order (`MEASUREMENTS.md` M-18;
 * `EXTRACTION-BREADTH-DESIGN.md` §2's table, row 3) — ~1,629 items (+/-540) scaled to
 * the text-bearing stratum, SEPARATED from minutes by the census's paired comparison
 * at z = 2.27 and from directories at z = 3.95. It sits third because it was measured
 * to, not because an ordinance matters less than a report.
 *
 * ONE TYPE FOR BOTH INSTRUMENTS, and the choice is the design's. §2's table names the
 * class *ordinance or resolution*, and the two are the same KIND OF THING: a body's
 * own operative act, carrying a caption, recitals and clauses that change something.
 * A reader answers the same four questions of each. Which instrument it is travels as
 * a FACT (`instrument`), where a member can see it, rather than as two registry
 * entries whose detectors would differ by one word.
 *
 * MEASURED ON REAL DOCUMENTS, fetched and read through the plane's own Tier-1
 * extraction, 2026-09-15:
 *
 *   A · oakland.legistar1.com/oakland/attachments/9fde50ed-8b3d-45a5-bb51-c67af1d9d1a7.pdf
 *       — the `View Legislation` attachment of Oakland matter 37551, a PROPOSED
 *       ordinance amending O.M.C. Chapter 8.28 (solid waste collection). 369,264
 *       bytes, 37 pages, 142,138 characters decoded, ZERO undetermined. It carries the
 *       caption `OAKLAND CITY COUNCIL / ORDINANCE NO. ________ C.M.S.` with the number
 *       still blank, 25 WHEREAS recitals, `NOW, THEREFORE, THE CITY COUNCIL OF THE
 *       CITY OF OAKLAND DOES ORDAIN AS FOLLOWS`, and `SECTION 1. Amendment of Oakland
 *       Municipal Code.`
 *   B · cao-94612.s3.amazonaws.com/documents/2020.06.23-Errata-3-Agenda-Report-Exhibits-
 *       and-Resolution.pdf — a RESOLUTION amending Resolution No. 87759 C.M.S.,
 *       published inside the staff report the `staff_report` type was measured on. Six
 *       WHEREAS recitals and eleven operative clauses. It is here deliberately: it is
 *       this item's live instance of M0-32's multi-class finding.
 *
 * THE DEFECT THIS TYPE WAS BUILT NOT TO MAKE, measured on a third real document. All
 * five of M0-32's own recogniser errors were one shape — a REFERENCE to a kind read as
 * MEMBERSHIP of it — and the trap here is sprung by the minutes read for
 * `meeting_minutes`: the Council's 2026-07-21 minutes carry SEVEN well-formed
 * instrument captions (`Resolution No. 90xxx C.M.S.`), because minutes cite the
 * instruments a body adopted. A matcher resting on the caption would call that document
 * an ordinance. It carries ZERO enacting formulas and ZERO recitals, because it does
 * not ENACT anything — so the threshold below requires the OPERATIVE VOICE and the
 * caption is never sufficient on its own.
 *
 * WHAT THIS MATCHER CANNOT SEE, and it is the honest limit of the rule above: a
 * document that QUOTES an instrument at length — a report reproducing a resolution, a
 * set of minutes with the full text of what was adopted attached — carries the same
 * enacting formula and the same recitals as the instrument itself, and this type will
 * detect it. That is not a bug being tolerated: such a document genuinely CONTAINS an
 * instrument, which is what `also_satisfies` exists to say. What the type does NOT do
 * is claim the containing document IS only that.
 *
 * WHY THE PHRASES ARE MATCHED OVER FLATTENED TEXT. Document A's Tier-1 text opens
 * `R\nESOLUTION \nN\nO\n.` from a drop cap and splits its own enacting formula across a
 * line break. Line-anchored phrase tests find neither. See `flatten` in ./index.mjs.
 */
import { CONFIDENCE, CONTRACT, entity, readAgain, diffEntities, flatten, alsoSatisfies,
         vocabPatterns, anyMatch, allMatches, enactmentPatterns, enactmentNumber, codePatterns } from "./index.mjs";
import { event, worstSignificance, isMeaningful, bySeverity } from "../events.mjs";

/* THE OPERATIVE VOICE — a body enacting, in the forms the measured instruments use plus
   the general shapes. It is the language of enactment, the same in every jurisdiction
   that ordains and resolves, so it stays here (N3 moved only the local words). This is the family that separates an instrument from a document
   that cites one, so it is written as a principle (a body ORDAINS or RESOLVES, in the
   present operative voice) rather than as one literal: document A carries none of
   `BE IT ORDAINED`, which a list of spellings would have made the whole test. */
const ENACTING = /\b(?:DOES\s+(?:HEREBY\s+)?(?:ORDAIN|RESOLVE)|BE\s+IT\s+(?:FURTHER\s+)?(?:ORDAINED|RESOLVED)|IT\s+IS\s+(?:FURTHER\s+)?(?:ORDAINED|RESOLVED)|NOW,?\s+THEREFORE[^.]{0,160}?\b(?:ORDAINS?|RESOLVED?))\b/i;
/* A recital chain. One `WHEREAS` is a quotation; a chain is how an instrument
   establishes its own grounds. */
const RECITAL = /\bWHEREAS\b/gi;
/* The instrument's own CAPTION is the jurisdiction's (N3): the kinds of instrument and
   their number forms are the view's `spaces.enactment`, and any series marker after the
   number (`C.M.S.` in the measured instance) its `enactment_markers`. The number may be
   blank on a proposed instrument, which document A shows. */
const regCaptions = (ctx) => enactmentPatterns(ctx, { blankNumber: true });
/* Codification: the language by which an instrument changes a code. The verbs and a
   code's generic name are the language's; which codes exist is the view's `codes`. */
const CODIFYING = /\b(?:is\s+hereby\s+(?:amended|added|repealed|deleted)|hereby\s+(?:amended|repealed)|Municipal\s+Code\s+(?:Section|Chapter))\b/gi;

/* The enacting BODY, immediately above its own caption. The words that name a body
   are the view's `bodies` (N3); the measured instruments open `<CITY> CITY COUNCIL` /
   `RESOLUTION NO. ____ C.M.S.`, a body named on its own just above. */
const regBodyEnds = (ctx) => vocabPatterns(ctx, "bodies", (re) => `(?:${re})[^A-Za-z0-9]{0,40}$`);

/** WHICH caption is the instrument's OWN, as opposed to one it merely cites.
 *
 *  THIS FUNCTION EXISTS BECAUSE THE FIRST TWO DRAFTS OF THIS READER MADE THE DEFECT
 *  THIS WHOLE ITEM IS ABOUT, and both were caught by DRIVING the reader over the real
 *  document rather than by reading it back.
 *
 *    Draft 1 took the first well-formed `ORDINANCE NO. nnnnn C.M.S.` anywhere in the
 *    text. On document A — whose own caption reads `ORDINANCE NO. ________ C.M.S.`,
 *    the number still blank because the instrument is PROPOSED — it reported
 *    `number: 83689`, the number of a different ordinance document A cites.
 *
 *    Draft 2 took the last caption BEFORE the enacting formula, reasoning that an
 *    instrument's caption is what its clauses hang off. It reported `number: 13314`:
 *    document A's twenty-five WHEREAS recitals cite prior ordinances by number, and
 *    every one of them sits between the real caption and the enactment.
 *
 *  Both are a REFERENCE read as MEMBERSHIP — M0-32's one defect class — made twice
 *  inside the reader written to avoid it. That is worth recording rather than
 *  smoothing: the class is not obvious from the outside, and neither draft looked
 *  wrong until a real document was run through it.
 *
 *  WHAT ACTUALLY SEPARATES THEM is what sits IMMEDIATELY ABOVE. An instrument's own
 *  caption is introduced by the ENACTING BODY (`OAKLAND CITY COUNCIL`); a citation
 *  sits inside a sentence. So the own caption is the first one whose preceding ~120
 *  characters end in a body's name.
 *
 *  AND WHEN THERE IS NONE, THERE IS NONE. A document whose caption did not survive
 *  extraction — document B's opens `R ESOLUTION N O .` after a drop cap, which no
 *  caption pattern matches — gets a null number with its reason stated, never the
 *  nearest number in the text. That is the direction this reader has already been
 *  wrong in twice. */
function ownCaption(flat, captions, bodies) {
  for (const { m, tag } of allMatches(captions, flat)) {
    /* Tested as printed and in capitals: a caption's body is set in capitals, and a
       profile may write a body's name in either case. */
    const before = flat.slice(Math.max(0, m.index - 120), m.index);
    if (anyMatch(bodies, before) || anyMatch(bodies, before.toUpperCase()))
      return { m, kind: tag.kind, number: enactmentNumber(tag.forms, m.groups && m.groups.num) };
  }
  return null;
}

/** What was verified unchanged between two readings of an instrument, or null when
 *  nothing was (R16): the references still named, and the instrument's own facts that
 *  were read on both sides and agree. */
function regConfirmed(a, b) {
  const intact = (a.entities || []).filter((e) => (b.entities || []).some((x) => x.key === e.key)).length;
  const facts = ["instrument", "number", "title"].filter((k) => a[k] && String(a[k]) === String(b[k] || ""));
  if (!intact && !facts.length) return null;
  return { entries: (b.entities || []).length, intact, facts };
}

export default {
  key: "regulation",
  label: "an ordinance or resolution",
  version: 1,
  /* An instrument is a text that says what it says; what matters is its SUBSTANCE.
     Declared on the content type (CONSTRUCTS Step 0 #4). */
  contract: CONTRACT.SUBSTANCE,

  /** Is this an instrument of law?
   *
   *  FOUR FAMILIES: (1) the operative voice, (2) a recital chain, (3) the instrument's
   *  caption, (4) codifying language. THE OPERATIVE VOICE IS REQUIRED FOR EVERY
   *  MATCH — it is the one family a document that merely CITES an instrument does not
   *  produce, and the measured minutes prove the point by carrying seven captions and
   *  no enacting formula at all. */
  detect(ctx) {
    const t = String(ctx.text || "");
    const flat = flatten(t);
    const signals = [];

    const enacting = ENACTING.test(flat);
    if (enacting) signals.push("an enacting formula in the operative voice");
    const recitals = (flat.match(RECITAL) || []).length;
    if (recitals >= 2) signals.push(`a recital chain of ${recitals} WHEREAS clause(s)`);
    const caption = allMatches(regCaptions(ctx), flat).length > 0;
    if (caption) signals.push("an instrument caption");
    const codify = (flat.match(CODIFYING) || []).length + allMatches(codePatterns(ctx), flat).length;
    if (codify) signals.push(`${codify} codification phrase(s)`);

    /* The caption alone is NEVER a match, at any confidence — that is the measured
       minutes' seven captions refused by name. */
    if (!enacting) return { match: false, confidence: CONFIDENCE.NONE };
    if (recitals >= 2 || caption) return { match: true, confidence: CONFIDENCE.CERTAIN, signals };
    /* An instrument with neither recitals nor a caption in a shape this type knows —
       a short resolution, or a producer whose caption did not survive extraction —
       still enacts something, and declining to narrow is the ladder working. */
    return { match: true, confidence: CONFIDENCE.LIKELY, signals };
  },

  /** What is in it: which instrument it is, its own number when it has one, and every
   *  instrument and code section it acts on.
   *
   *  FW-17 / IC-86 — THIS READER CAN SAY WHERE, with the same limit as the staff
   *  report's: its references are cited inline, so every pattern is run over the RAW
   *  text (with `\s+` standing in for a line break) and the match's own offset is what
   *  `ctx.locate` is given. A flattened offset would address a string no container ever
   *  emitted. `rect` is null — Tier-1 text has no geometry — and a reader may emit only
   *  a source `locate` gave it.
   *
   *  WHAT IT CANNOT PLACE: a citation this producer split mid-word (document A's own
   *  `R` / `ESOLUTION` drop cap) is not matched, so it is absent rather than
   *  mispositioned. Absent-and-said is the safe direction; a confident wrong page is
   *  not.
   *
   *  ONE THING IT DELIBERATELY DOES NOT DO: it does not decide whether the instrument
   *  was ADOPTED. A proposed ordinance and an enacted one read the same at this grain,
   *  and whether a body passed it is the minutes' business — which is why `enacted` is
   *  not a fact here and `number` being null is reported as exactly what it is. */
  parse(ctx) {
    const raw = String(ctx.text || "");
    const flat = flatten(raw);
    const locate = typeof ctx.locate === "function" ? ctx.locate : () => null;

    const cap = ownCaption(flat, regCaptions(ctx), regBodyEnds(ctx));
    const number = cap && cap.number ? cap.number : null;
    const instrument = cap ? cap.kind : (/\bORDAIN/i.test(flat) ? "ordinance" : null);

    /* The caption's TITLE — the capitalised sentence that says what the instrument
       does. Taken from the OWN caption only, for the same reason the number is, and
       read as THE FIRST SUBSTANTIAL MOSTLY-CAPITALS SENTENCE after it rather than as
       the text immediately following: document A interposes `INTRODUCED BY
       COUNCILMEMBER [IF APPLICABLE]` between its caption and its title, and a rule
       that demanded adjacency returned null on the one document it was written from. */
    let title = null;
    if (cap) {
      const after = flat.slice(cap.m.index + cap.m[0].length, cap.m.index + cap.m[0].length + 2500);
      const blanks = vocabPatterns(ctx, "template_blanks", null, "g");
      for (const s of after.split(/(?<=\.)\s+/)) {
        const t = s.trim();
        if (t.length < 40) continue;
        const letters = t.replace(/[^A-Za-z]/g, "");
        if (!letters.length) continue;
        /* "Mostly capitals" rather than "all capitals": these titles carry ordinals,
           punctuation and the occasional lower-case artefact of extraction. */
        if ((t.replace(/[^A-Z]/g, "").length / letters.length) < 0.85) continue;
        /* The template's own unfilled text is not the title: document A's caption is
           followed by `INTRODUCED BY COUNCILMEMBER [IF APPLICABLE]`, a blank on the
           form rather than anything the instrument says. Which text is a blank is the
           jurisdiction's template (`template_blanks`, N3). */
        let u = t;
        for (const re of blanks) u = u.replace(re, " ");
        u = u.replace(/\s+/g, " ").trim();
        if (u.length < 40) continue;
        title = u.slice(0, 500);
        break;
      }
    }

    const recitals = (flat.match(RECITAL) || []).length;

    const entities = [];
    /* D-454: a repeat is ANOTHER OCCURRENCE of the one reference (`readAgain`), never dropped. */
    const seen = new Map();
    const take = (key, kind, label, facts, offset) => {
      if (seen.has(key)) { readAgain(seen.get(key), locate(offset)); return; }
      const e = entity(key, kind, label, facts, locate(offset));
      seen.set(key, e);
      entities.push(e);
    };
    /* The instruments this one acts on or cites. Its OWN number, when it has one, is a
       document fact rather than an entity — an instrument is not a reference to
       itself, and emitting it as one would make every instrument appear to cite one
       more thing than it does. */
    const ownKey = number ? `${instrument}:${number}` : null;
    for (const { m, tag } of allMatches(enactmentPatterns(ctx), raw)) {
      const n = enactmentNumber(tag.forms, m.groups && m.groups.num);
      if (!n) continue;
      const key = `${tag.kind}:${n}`;
      if (key === ownKey) continue;
      take(key, "instrument", `${tag.kind[0].toUpperCase()}${tag.kind.slice(1)} No. ${n}`,
           { instrument: tag.kind, number: n }, m.index);
    }
    for (const { m, tag } of allMatches(codePatterns(ctx), raw))
      take(`${tag.key}:${m.groups.sec}`, "code_section", `${tag.label} ${m.groups.sec}`,
           { code: tag.key, section: m.groups.sec }, m.index);

    return {
      entities,
      instrument,
      /* Null means THIS INSTRUMENT CARRIES NO NUMBER — document A's caption is
         `ORDINANCE NO. ________ C.M.S.`, a proposed instrument awaiting one. It does
         not mean the reader failed, and `number_why` says which. */
      number,
      number_why: number ? null
        : cap ? "this instrument's caption carries no number, which is what a proposed ordinance "
              + "or resolution looks like before a body adopts it"
        : "no caption introduced by an enacting body was read, in the words the active "
        + "jurisdiction profiles give for instruments and bodies, so the number is not stated",
      title,
      recitals,
      also_satisfies: alsoSatisfies(ctx, "regulation"),
      at: ctx.at || null,
    };
  },

  /** Given two parses of the same instrument's address, what happened to it. */
  assess(a, b) {
    /* Nothing read on EITHER side is a failed reader (R16, R33), never an instrument
       that lost its text. */
    const readNothing = (x) => !x.instrument && !(x.entities || []).length;
    if (readNothing(a) || readNothing(b))
      return { meaningful: null, significance: null, events: [], confirmed: null,
               why: "nothing could be read from this instrument this time, so nothing is claimed "
                  + "about it either way" };

    const events = [];
    /* AN INSTRUMENT'S OWN TEXT MOVING AT THE SAME ADDRESS IS THE SERIOUS ONE. This is
       the class of change the record exists to be able to prove: what a body enacted
       is not supposed to change afterwards, and a member who cited the title or the
       number of an instrument cited something fixed. */
    for (const k of ["instrument", "number", "title"])
      if (String(a[k] || "") !== String(b[k] || ""))
        events.push(event("instrument_changed", { key: k, was: a[k] || null, now: b[k] || null,
          why: `this instrument's ${k} is not what it was at this address` }));
    if (Number(a.recitals || 0) !== Number(b.recitals || 0))
      events.push(event("instrument_changed", { key: "recitals", was: a.recitals, now: b.recitals,
        why: "the recitals establishing this instrument's grounds changed in number" }));

    const d = diffEntities(a.entities || [], b.entities || []);
    for (const e of d.gone)
      events.push(event("item_pulled", { key: e.key, label: e.label,
        why: "an instrument or code section this one acted on is no longer named in it" }));
    for (const e of d.appeared)
      events.push(event("item_added", { key: e.key, label: e.label,
        why: "this instrument now names something it did not name before" }));

    bySeverity(events);
    return {
      meaningful: isMeaningful(events), significance: worstSignificance(events), events,
      confirmed: regConfirmed(a, b),
      why: events.length
        ? `${events.length} change(s) to an instrument at the same address`
        : "this instrument says what it said, and acts on the same things",
    };
  },
};
