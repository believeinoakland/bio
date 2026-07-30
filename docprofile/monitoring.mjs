/* Monitoring, by what kind of document it is.
 *
 * RULED by Bob, 2026-07-30: `index` versus `record` changes monitoring's
 * BEHAVIOUR, not just which normalisation rules apply.
 *
 * WHY. A Legistar calendar changing is the calendar working. A
 * LegislationDetail.aspx page changing is an event somebody should look at. One
 * monitoring contract cannot serve both, and applying the record's contract to an
 * index is what turns monitoring into noise on exactly the pages BIO watches most
 * closely: an index changes every time the body it indexes does anything, so a
 * substance check on it fires constantly and gets ignored, and then the one change
 * that mattered arrives in the same undifferentiated stream as the rest.
 *
 * The inversion is the point. On a RECORD, the question is "did the substance
 * change", and the answer is normally no. On an INDEX, the substance is a LIST, and
 * the question is not whether the list changed but what happened to its MEMBERS:
 *
 *   an entry vanished        a public record removed from a public list, which is
 *                            close to the reason this system exists
 *   an entry was altered     a meeting cancelled, an item's status moved, a
 *                            document swapped under a stable heading
 *   an entry appeared        the index doing its job
 *
 * MEASURED on oakland.legistar.com/Calendar.aspx, 2026-07-30: the page carries 18
 * meeting rows, each keyed by a stable `MeetingDetail.aspx?ID=` and each naming its
 * own agenda documents, and five of the eighteen read CANCELLED. A member watching
 * the Rules and Legislation Committee needs the cancellation. It is an alteration
 * to one row of an index: a substance check on the whole page would have reported
 * it in the same breath as a new meeting being scheduled three weeks out, and a
 * substance check on the committee's own detail page would not have seen it at all.
 *
 * AND THE NEGATIVE CASE, which Bob named as equally important. On an index,
 * "nothing changed" is a STRONGER claim than on a record, precisely because an
 * index is expected to move. Confirming that all eighteen members are present and
 * unaltered is a dated, first-party statement that nothing was quietly withdrawn,
 * and that is worth recording as evidence in its own right.
 */
import { digests, REGION, CONFIDENCE } from "./index.mjs";

export const CONTRACT = {
  /* Watch the document's own substance. The normal case, and the answer is
     normally that nothing changed. */
  SUBSTANCE: "substance",
  /* Watch the membership of a list. What matters is which entries are present and
     whether each entry's own line still says what it said. */
  MEMBERSHIP: "membership",
  /* Watching is not meaningful. A client-rendered shell has stable bytes and no
     substance, so a substance check on it reports "unchanged" forever while the
     figures behind it move freely. Reporting that as monitoring would be the
     system lying quietly, which is the worst failure available to it. */
  UNMONITORABLE: "unmonitorable",
};

/* How much a member should be troubled. Ordered, so a report can lead with the
   worst thing rather than the first thing. */
export const SIGNIFICANCE = { EVENT: "event", NOTICE: "notice", ROUTINE: "routine" };
const SIG_RANK = { routine: 0, notice: 1, event: 2 };

/** What contract applies, and what the watcher should therefore do. */
export function contract(handler, kind) {
  if (handler.shell)
    return { mode: CONTRACT.UNMONITORABLE, kind,
             why: "this address builds its page in the browser, so watching the delivered "
                + "bytes would report nothing changing while the figures behind it move" };
  if (kind === "index" && typeof handler.members === "function")
    return { mode: CONTRACT.MEMBERSHIP, kind,
             why: "this is a list, so what matters is which entries are on it and whether "
                + "each entry still says what it said, rather than whether the page differs" };
  if (kind === "index")
    /* An index whose handler cannot extract members must NOT fall back to a
       substance check pretending to be useful. It falls back to a substance check
       that says what it is: noisy, and a sign the handler needs members(). */
    return { mode: CONTRACT.SUBSTANCE, kind, degraded: true,
             why: "this is a list and its entries cannot be read individually yet, so any "
                + "change to it will be reported without saying which entry moved" };
  return { mode: CONTRACT.SUBSTANCE, kind,
           why: "this is a record of one thing, so any change to its substance is worth attention" };
}

/** Diff two membership sets. Keys are the stable identity of an entry; `digest` is
 *  the entry's own line, so an entry that stayed but changed is distinguishable
 *  from one that left. */
export function diffMembers(before, after) {
  const b = new Map(before.map((m) => [m.key, m]));
  const a = new Map(after.map((m) => [m.key, m]));
  const events = [];
  for (const [key, was] of b) {
    const now = a.get(key);
    if (!now) {
      /* The heaviest thing this system can notice. A record that was listed and is
         no longer listed is not the absence of information, it is information. */
      events.push({ type: "removed", significance: SIGNIFICANCE.EVENT, key,
                    label: was.label, was: was.digest,
                    why: "an entry that was on this list is no longer on it" });
      continue;
    }
    if (now.digest !== was.digest)
      events.push({ type: "altered", significance: SIGNIFICANCE.EVENT, key,
                    label: now.label, was: was.label, now: now.label,
                    why: "an entry on this list changed what it says" });
  }
  for (const [key, now] of a)
    if (!b.has(key))
      events.push({ type: "added", significance: SIGNIFICANCE.ROUTINE, key,
                    label: now.label,
                    why: "a new entry appeared, which is this list doing its job" });
  events.sort((x, y) => SIG_RANK[y.significance] - SIG_RANK[x.significance]);
  return { events, before_count: b.size, after_count: a.size };
}

/** Watch one document across two captures, under its own contract.
 *
 *  Always answers both directions. `changed` names what happened; `confirmed`
 *  states positively what was checked and found intact, because on an index that
 *  is the more valuable half and it is the half a diff normally throws away. */
export async function monitor(before, after, handler, ctx) {
  const kind = handler.kind ? handler.kind(ctx) : "unknown";
  const c = contract(handler, kind);
  const base = { contract: c.mode, kind, handler: handler.key,
                 confidence: ctx.confidence || CONFIDENCE.NONE };

  if (c.mode === CONTRACT.UNMONITORABLE)
    return { ...base, changed: null, events: [], confirmed: null, why: c.why };

  if (c.mode === CONTRACT.MEMBERSHIP) {
    const textOf = (b) => new TextDecoder("utf-8", { fatal: false }).decode(b);
    const mb = handler.members({ ...ctx, text: textOf(before) });
    const ma = handler.members({ ...ctx, text: textOf(after) });
    /* Extraction that finds nothing is not a list with no entries. It is a reader
       that failed, and reporting "every entry was removed" would be catastrophic
       and confident. */
    if (!mb.length || !ma.length)
      return { ...base, changed: null, events: [], confirmed: null, degraded: true,
               why: "the entries on this list could not be read this time, so nothing is claimed "
                  + "about them either way" };
    const d = diffMembers(mb, ma);
    const worst = d.events.length ? d.events[0].significance : null;
    return { ...base, changed: d.events.length > 0, events: d.events, significance: worst,
             confirmed: { entries: ma.length,
                          intact: mb.filter((m) => ma.some((x) => x.key === m.key && x.digest === m.digest)).length },
             why: d.events.length
               ? summarise(d.events)
               : `all ${ma.length} entries on this list are still present and unchanged` };
  }

  const da = await digests(before, handler, ctx);
  const db = await digests(after, handler, ctx);
  if (base.confidence !== CONFIDENCE.CERTAIN && !handler.conservative)
    return { ...base, changed: null, events: [], confirmed: null,
             why: "the document differs and this kind of document is not recognised well enough "
                + "to say whether the difference matters" };
  if (da.evidentiary !== db.evidentiary)
    return { ...base, changed: true, significance: SIGNIFICANCE.EVENT,
             events: [{ type: "substance", significance: SIGNIFICANCE.EVENT,
                        why: "the substance of this document changed" }],
             confirmed: null, why: "the substance of this document changed" };
  if (da.rendition !== db.rendition)
    return { ...base, changed: false, significance: SIGNIFICANCE.NOTICE,
             events: [{ type: "restyled", significance: SIGNIFICANCE.NOTICE,
                        why: "something around the document changed, such as navigation" }],
             confirmed: { substance: true },
             why: "the document itself is unchanged; something around it moved" };
  return { ...base, changed: false, events: [], confirmed: { substance: true },
           why: da.identity === db.identity
             ? "the source served exactly the same document"
             : "the document is unchanged; only machinery this site rebuilds on every visit differs" };
}

function summarise(events) {
  const n = (t) => events.filter((e) => e.type === t).length;
  const parts = [];
  if (n("removed")) parts.push(`${n("removed")} ${n("removed") === 1 ? "entry is" : "entries are"} no longer listed`);
  if (n("altered")) parts.push(`${n("altered")} ${n("altered") === 1 ? "entry" : "entries"} changed`);
  if (n("added")) parts.push(`${n("added")} new ${n("added") === 1 ? "entry" : "entries"}`);
  return parts.join(", ");
}
