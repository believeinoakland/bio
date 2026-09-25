/* REC-206 — AN AGENDA ITEM'S MEMBERSHIP IN A FILE, DERIVED FROM CONTAINMENT.
 *
 * BOB #32's ruling of 2026-09-23 23:30Z (`BIO_Content_Framework_v0_10.md` §16,
 * "Positional text"): *I2 gains position on tier-1 text units (page and rect)
 * and anchor text plus a rect on LinkRecord; membership is DERIVED from
 * containment, labelled machine work and graded inferred, never presented as
 * the publisher's link.*
 *
 * WHAT THE PUBLISHER SAID, AND WHAT IT DID NOT. A Legistar agenda links each
 * ITEM to its matter page and each of the item's FILES to the file itself —
 * two flat sets of links, both the publisher's (I2 `links[]`, partition
 * `deferred`). It never links an item TO a file. That an attachment belongs to
 * the item printed above it is what a reader SEES on the page; M-120 found it
 * only by ordering rects in an instrument, and said nothing downstream should
 * cite that grouping as a fact the plane emitted. This module is that same
 * inference made once, in the plane, under a label that cannot be mistaken for
 * the publisher's own link.
 *
 * THE RULE. The links are put in page order and, within a page, top-down by
 * the top edge of their /Rect (then left to right). Each item link opens a
 * REGION that runs from its own top edge down to the top edge of the next item
 * link — across page breaks, since an item's attachments often spill onto the
 * next page. A file link whose top edge lies in an item's region is CONTAINED
 * by it, and that containment is the membership. A file link above the first
 * item is contained by no region and is carried in `unplaced`, never assigned.
 * A link with no page rect cannot be placed and is carried in `unplaced` too.
 *
 * THE LABEL (`MEMBERSHIP_LABEL`) is stated on the answer and on EVERY pair,
 * because a pair lifted out of its answer must still say what it is:
 *   derived: "containment"   — how it was obtained: rect containment;
 *   work: "machine"          — nobody read the page and said so;
 *   asserted_by: "system"    — schema.mjs's three-valued author (connections):
 *                              the framework inferred it, NOT 'source';
 *   grade: "C"               — framework §8.1: correspondence rather than
 *                              identity, "plausible, never presented as
 *                              established"; the ruling's "graded inferred";
 *   standing: "inferred", established: false.
 * The membership is NEVER added to `links[]` and never moves `counts`: the
 * publisher's link graph is exactly what the publisher linked.
 * `checkMembershipLabel` is the one place the label is verified; the op WITHHOLDS
 * a membership it would fail (null, with the failing property named as `membershipWhy`),
 * and the suite's labelling arm reads it.
 *
 * WHICH LINKS ARE ITEMS AND WHICH ARE FILES is read off the SOURCE'S OWN
 * address shapes (`MEMBERSHIP_SHAPES`, data rather than cases), so an item is
 * identified by the publisher's identifier for it and not by a guess at its
 * text. One shape is known today — Legistar's gateway, measured on M-120's
 * agenda — and a document matching none answers `membership: null` with its
 * reason. The anchor text (tier 1's, `pdfstructure.mjs` `anchorOf`) rides on
 * each end as the label a reader sees, never as the identifier.
 *
 * WHAT IT DOES NOT DO, stated. (1) It reads one document: whether the file the
 * item names is CAPTURED, and which capture it is, is not asked here. (2) It
 * persists nothing: `op=pdfstructure` is a read and so is this; a stored
 * membership is not built. (3) A two-column agenda, or a producer that paints
 * an item's attachments above it, would be grouped wrongly by a top-down
 * rule — no such producer is in the corpus, and the grade says the pairing is
 * a correspondence to be confirmed, not an established fact. */

export const MEMBERSHIP_LABEL = Object.freeze({
  derived: "containment",
  work: "machine",
  asserted_by: "system",
  grade: "C",
  standing: "inferred",
  established: false,
});

/* The source's own address shapes. `item` and `file` are tested against the
   link's URL; a shape applies to a document only when at least one item link
   matches it. */
export const MEMBERSHIP_SHAPES = Object.freeze([
  Object.freeze({
    shape: "legistar-gateway",
    item: /^https?:\/\/[a-z0-9-]+\.legistar\.com\/gateway\.aspx\?m=l&id=\/matter\.aspx\?key=\d+/i,
    file: /^https?:\/\/[a-z0-9-]+\.legistar\.com\/gateway\.aspx\?m=f&id=[^&#]+/i,
  }),
]);

const top = (rect) => Math.max(rect[1], rect[3]);
const left = (rect) => Math.min(rect[0], rect[2]);
const placeable = (l) => l && l.source && Number.isInteger(l.source.page)
  && Array.isArray(l.source.rect) && l.source.rect.length === 4 && l.source.rect.every(Number.isFinite);
const end = (l) => ({
  url: l.target.url,
  anchor: l.anchor ?? { text: null, why: "no_anchor_carried", tier: null },
  source: l.source ?? null,
});

/** Derive the item-to-file membership of a structure's links. Returns the
 *  membership answer, or `{ membership: null, why }` when nothing applies. */
export function deriveMembership(structure) {
  const links = (structure && Array.isArray(structure.links)) ? structure.links : [];
  const urlOf = (l) => (l && l.target && typeof l.target.url === "string") ? l.target.url : null;
  const shape = MEMBERSHIP_SHAPES.find((s) => links.some((l) => urlOf(l) && s.item.test(urlOf(l))));
  if (!shape) return { membership: null, why: "no_item_links_of_a_known_shape" };

  const items = [], files = [], unplaced = [];
  for (const l of links) {
    const u = urlOf(l);
    if (!u) continue;
    const kind = shape.item.test(u) ? "item" : shape.file.test(u) ? "file" : null;
    if (!kind) continue;
    if (!placeable(l)) { unplaced.push({ kind, ...end(l), why: "no_page_rect" }); continue; }
    (kind === "item" ? items : files).push(l);
  }
  const order = (a, b) => (a.source.page - b.source.page)
    || (top(b.source.rect) - top(a.source.rect)) || (left(a.source.rect) - left(b.source.rect));
  items.sort(order);
  files.sort(order);

  /* An item's region: from its own top edge (inclusive) down to the next
     item's top edge (exclusive), in (page, descending y) order. */
  const at = (l) => [l.source.page, top(l.source.rect)];
  const before = (p, q) => p[0] < q[0] || (p[0] === q[0] && p[1] > q[1]);
  const groups = items.map((it, i) => ({
    ...MEMBERSHIP_LABEL,
    item: end(it),
    region: {
      from: { page: at(it)[0], top: at(it)[1] },
      to: i + 1 < items.length ? { page: at(items[i + 1])[0], top: at(items[i + 1])[1] } : null,
    },
    files: [],
  }));
  for (const f of files) {
    const p = at(f);
    let g = -1;
    for (let i = 0; i < items.length; i++) {
      const s = at(items[i]);
      if (before(p, s)) break; // the file sits above this item's top edge
      g = i;
    }
    if (g < 0) unplaced.push({ kind: "file", ...end(f), why: "above_the_first_item" });
    else groups[g].files.push(end(f));
  }

  return {
    membership: {
      ...MEMBERSHIP_LABEL,
      shape: shape.shape,
      basis: "each file link is assigned to the item link whose region contains the top edge of its "
           + "rect; a region runs from an item link's top edge down to the next item link's, in page "
           + "order. The publisher linked neither end to the other: this pairing is the plane's "
           + "inference from position, to be confirmed, never the publisher's own link.",
      counts: { items: groups.length,
                placed: groups.reduce((n, g) => n + g.files.length, 0),
                unplaced: unplaced.length },
      items: groups,
      unplaced,
    },
    why: null,
  };
}

/** The label check: null when the membership is labelled as the ruling
 *  requires, else the NAME of the first property that is not. The answer and
 *  every pair in it are checked, so a pair lifted out still carries it. */
export function checkMembershipLabel(m) {
  if (m == null) return null;
  const bad = (o) => {
    for (const [k, v] of Object.entries(MEMBERSHIP_LABEL)) if (!o || o[k] !== v) return k;
    return null;
  };
  const top = bad(m);
  if (top) return `membership.${top}`;
  for (const [i, g] of (Array.isArray(m.items) ? m.items : []).entries()) {
    const k = bad(g);
    if (k) return `membership.items[${i}].${k}`;
    if (g.item && Object.prototype.hasOwnProperty.call(g.item, "partition"))
      return `membership.items[${i}].item.partition`;
  }
  return null;
}
