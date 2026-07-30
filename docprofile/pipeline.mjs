/* The change pipeline: recognising change in LAYERS.
 *
 * RULED by Bob, 2026-07-30. Recognising change is layered, and the layers run in
 * this order because each one is cheap relative to the next and each one can
 * settle the question outright:
 *
 *   L1  WHICH STACK is this? Without that, nothing below can be trusted, because
 *       the same bytes mean different things on different stacks.
 *   L2  Is anything different AT THE BYTE LEVEL? If not, that is NOTED, not
 *       discarded: a dated first-party statement that the source is still serving
 *       what the record holds is evidence, and it is the primary contemporaneity
 *       route's raw material.
 *   L3  Is the difference NOTEWORTHY? Page state, security tokens and ad slots
 *       differ on every fetch by design. Furniture differs when the site changes,
 *       not when the document does.
 *   L4  WHAT TYPE OF CONTENT changed? A calendar is not an article is not a
 *       regulation is not a staff directory is not an agenda. This is a SEPARATE
 *       axis from the stack: a calendar served by Legistar and one served by
 *       Granicus are the same kind of thing built two ways.
 *   L5  Is the change MEANINGFUL for that type? A calendar whose window has moved
 *       a week is not a changed calendar. A staff member's title is another matter.
 *       Minutes appearing after a meeting was scheduled to occur is another again.
 *   L6  What CONNECTIONS does it imply? Referential, between related content, and
 *       temporal, across time. Different meanings, understood differently by people
 *       and their assistants, and presented differently.
 *
 * WHY LAYERS AND NOT ONE FUNCTION. The previous version conflated L1 through L4
 * inside a single monitor() and inherited a false positive from doing so: the
 * Legistar calendar's visible range is "This Month", MEASURED, so a week later
 * meetings have scrolled out of the window and a membership diff reports them as
 * REMOVED, which is the heaviest signal this system has. A meeting leaving the
 * visible window is not a public record being delisted, and no amount of care at
 * L3 could tell the difference, because the distinction is not about bytes or
 * furniture. It is about what a calendar IS.
 *
 * Each layer returns a verdict and may STOP. Nothing below runs speculatively,
 * which keeps the expensive parsing off the overwhelming majority of checks where
 * the bytes are identical or the difference is machinery.
 */
import { identify, digests, CONFIDENCE, profileRecord } from "./index.mjs";
import { doctypeFor } from "./doctypes/registry.mjs";

export const LAYER = {
  STACK: "L1_stack", BYTES: "L2_bytes", NOTEWORTHY: "L3_noteworthy",
  CONTENT_TYPE: "L4_content_type", MEANING: "L5_meaning", CONNECTIONS: "L6_connections",
};

/** Run the layers over two captures of one address.
 *
 *  `before` and `after` are byte arrays; `ctx` carries the locator, the response
 *  headers, a sha256, and optionally `now` and `before_at` / `after_at` so L5 can
 *  reason about time, which a calendar and an agenda both need.
 *
 *  Always returns a result with `stopped_at`, so a reader can see how far the
 *  reasoning got and why. A verdict whose depth is invisible cannot be audited. */
export async function assess(before, after, ctx) {
  const trail = [];
  const note = (layer, said, detail) => { trail.push({ layer, said, ...(detail || {}) }); };

  /* ---- L1: which stack ---- */
  const text = new TextDecoder("utf-8", { fatal: false }).decode(after);
  const id = identify({ ...ctx, text });
  note(LAYER.STACK, `${id.handler.label} (${id.confidence})`,
       { handler: id.handler.key, confidence: id.confidence, signals: id.signals });
  const profile = profileRecord(id, ctx);
  const out = (v) => ({ ...v, trail, profile, stopped_at: trail[trail.length - 1].layer });

  /* A shell is settled here and nothing below applies: its bytes are stable and
     its substance is absent, so every layer beneath would answer a question about
     a document that was never captured. */
  if (id.handler.shell)
    return out({ verdict: "unwatchable", meaningful: null, events: [], connections: [],
                 why: id.handler.warning });

  /* ---- L2: anything different at all ---- */
  const sha = ctx.sha256;
  const [ha, hb] = [await sha(before), await sha(after)];
  if (ha === hb) {
    note(LAYER.BYTES, "identical bytes");
    /* NOTED, per Bob, not discarded. This is the confirmation half and on a
       frequently-checked source it is the majority of all observations. */
    return out({ verdict: "identical", meaningful: false, events: [], connections: [],
                 confirmation: { kind: "identical_bytes", hash: ha, at: ctx.after_at || null,
                   why: "the source served exactly the bytes the record holds" },
                 why: "the source is still serving exactly what the record holds" });
  }
  note(LAYER.BYTES, "the bytes differ", { before: ha.slice(0, 12), after: hb.slice(0, 12) });

  /* ---- L3: is the difference noteworthy ---- */
  const dctx = { ...ctx, text, confidence: id.confidence };
  const [da, db] = [await digests(before, id.handler, dctx), await digests(after, id.handler, dctx)];
  if (id.confidence !== CONFIDENCE.CERTAIN && !id.handler.conservative) {
    note(LAYER.NOTEWORTHY, "cannot say: the stack is not recognised confidently enough");
    return out({ verdict: "undetermined", meaningful: null, events: [], connections: [],
                 why: "the document differs and this kind of document is not recognised well "
                    + "enough to say whether the difference matters" });
  }
  if (da.evidentiary === db.evidentiary && da.rendition === db.rendition) {
    note(LAYER.NOTEWORTHY, "only per-render machinery differs",
         { normalised: da.mechanical_bytes });
    /* Still a confirmation, and a slightly weaker one than identical bytes: the
       substance is the same and the machinery moved, which is what this stack does
       on every response. */
    return out({ verdict: "unchanged", meaningful: false, events: [], connections: [],
                 confirmation: { kind: "same_substance", digest: db.evidentiary,
                   at: ctx.after_at || null,
                   why: "the substance is the same; only machinery this site rebuilds on every visit differs" },
                 why: "the document is unchanged; only machinery this site rebuilds differs" });
  }
  if (da.evidentiary === db.evidentiary) {
    note(LAYER.NOTEWORTHY, "only the surroundings differ",
         { normalised: da.presentational_bytes });
    return out({ verdict: "restyled", meaningful: false, events: [], connections: [],
                 confirmation: { kind: "same_substance", digest: db.evidentiary, at: ctx.after_at || null,
                   why: "the document itself is unchanged; the site around it changed" },
                 why: "the document itself is unchanged; something around it moved, such as navigation" });
  }
  note(LAYER.NOTEWORTHY, "the substance differs");

  /* ---- L4: what type of content ---- */
  const dt = doctypeFor({ ...ctx, text, handler: id.handler, kind: id.kind });
  note(LAYER.CONTENT_TYPE, dt.type.label,
       { type: dt.type.key, confidence: dt.confidence, signals: dt.signals });

  /* ---- L5: is the change meaningful FOR THAT TYPE ---- */
  const textBefore = new TextDecoder("utf-8", { fatal: false }).decode(before);
  const read = (t, at) => dt.type.parse({ ...ctx, text: t, handler: id.handler, at });
  let a, b;
  try {
    a = read(textBefore, ctx.before_at); b = read(text, ctx.after_at);
  } catch (e) {
    note(LAYER.MEANING, "the content could not be parsed, so nothing is claimed about it");
    return out({ verdict: "changed", meaningful: null, events: [], connections: [],
                 why: "the substance differs and its contents could not be read this time, so "
                    + "what changed is not described" });
  }
  const m = dt.type.assess(a, b, { ...ctx, handler: id.handler });
  note(LAYER.MEANING, m.why, { events: m.events.length, meaningful: m.meaningful });

  /* ---- L6: connections ---- */
  const connections = dt.type.connections ? dt.type.connections(a, b, { ...ctx, events: m.events }) : [];
  if (connections.length) note(LAYER.CONNECTIONS, `${connections.length} implied`);

  return out({ verdict: m.meaningful ? "changed" : "routine",
               meaningful: m.meaningful, significance: m.significance,
               events: m.events, connections, content_type: dt.type.key,
               why: m.why,
               /* Even a changed document confirms whatever DIDN'T change, and on a
                  list that is most of it. Discarding the confirmation because
                  something else moved is how the negative case gets lost. */
               confirmation: m.confirmed || null });
}
