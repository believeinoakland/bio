/* N48 (K135, REC-206; extraction R51): AN AGENDA ITEM'S MEMBERSHIP IN A FILE, DERIVED FROM CONTAINMENT.
 *
 * BOB #32's ruling of 2026-09-23 23:30Z (`BIO_Content_Framework_v0_10.md` §16, "Positional text"): membership is
 * DERIVED from containment, labelled machine work and graded inferred, never presented as the publisher's link.
 * Landed from `land/worker/REC-206` (there `membership.mjs`, renamed here: `membership` is a module's name).
 *
 * WHAT THE PUBLISHER SAID, AND WHAT IT DID NOT. An agenda links each ITEM to its matter page and each of the item's
 * FILES to the file itself: two flat sets of links, both the publisher's (`links[]`). It never links an item TO a
 * file. That an attachment belongs to the item printed above it is what a reader SEES on the page; this is that
 * inference made once, under a label that cannot be mistaken for the publisher's own link.
 *
 * THE RULE. The links are put in page order and, within a page, top-down by the top edge of their rect (then left to
 * right). Each item link opens a REGION from its own top edge down to the next item link's top edge, across page
 * breaks. A file link whose top edge lies in an item's region is CONTAINED by it. A file link above the first item,
 * and a link with no page rect, is carried in `unplaced`, never assigned.
 *
 * WHICH LINKS ARE ITEMS AND WHICH ARE FILES is read from the ACTIVE PROFILES (K1, K135), never written here: a
 * system in the jurisdiction view that states `links: {item: pattern, file: pattern}` names its hosts, and a link is
 * an item (or a file) of that system when its host is one of them and its path and query match the pattern
 * (jurisdictions' `path` semantics). A document with no item link of a stated shape answers `membership: null` with
 * its reason. The anchor text a reader sees rides on each end when the producer carries it, never as the identifier.
 *
 * WHAT IT DOES NOT DO. It reads one document's links and persists nothing: `op=pdfstructure` is a read and so is
 * this. The stored membership is `connections`' (its R49). */

export const MEMBERSHIP_LABEL = Object.freeze({
  derived: "containment",
  work: "machine",
  asserted_by: "system",
  grade: "C",
  standing: "inferred",
  established: false,
});

const compile = (p) => {
  if (!p || typeof p.re !== "string" || !p.re) return null;
  try { return new RegExp(p.re, String(p.flags || "").replace(/[^iu]/g, "")); } catch { return null; }
};

/** The item and file link shapes the view's systems state: `[{system, hosts, item, file}]`. */
export function linkShapesOf(view) {
  const systems = view && Array.isArray(view.systems) ? view.systems : [];
  const out = [];
  for (const s of systems) {
    const l = s && s.links;
    const item = l && compile(l.item), file = l && compile(l.file);
    const hosts = Array.isArray(s && s.hosts) ? s.hosts.map((h) => String(h).toLowerCase()) : [];
    if (item && file && hosts.length) out.push({ system: s.origin || null, hosts, item, file });
  }
  return out;
}

const top = (rect) => Math.max(rect[1], rect[3]);
const left = (rect) => Math.min(rect[0], rect[2]);
const placeable = (l) => l && l.source && Number.isInteger(l.source.page)
  && Array.isArray(l.source.rect) && l.source.rect.length === 4 && l.source.rect.every(Number.isFinite);
const end = (l) => ({
  url: l.target.url,
  anchor: l.anchor ?? { text: null, why: "no_anchor_carried", tier: null },
  source: l.source ?? null,
});
const partsOf = (u) => { try { const x = new URL(u); return { host: x.hostname.toLowerCase(), pq: `${x.pathname}${x.search}` }; } catch { return null; } };

/** R51: the item-to-file membership of a structure's links under the view's link shapes. Answers
 *  `{membership, why}`: the membership, or null with the reason nothing applies. */
export function deriveMembership(structure, view) {
  const links = (structure && Array.isArray(structure.links)) ? structure.links : [];
  const urlOf = (l) => (l && l.target && typeof l.target.url === "string") ? l.target.url : null;
  const shapes = linkShapesOf(view);
  if (!shapes.length) return { membership: null, why: "no_active_profile_states_item_and_file_link_shapes" };
  const kindUnder = (s, u) => {
    const p = partsOf(u);
    if (!p || !s.hosts.includes(p.host)) return null;
    return s.item.test(p.pq) ? "item" : s.file.test(p.pq) ? "file" : null;
  };
  const shape = shapes.find((s) => links.some((l) => urlOf(l) && kindUnder(s, urlOf(l)) === "item"));
  if (!shape) return { membership: null, why: "no_item_links_of_a_stated_shape" };

  const items = [], files = [], unplaced = [];
  for (const l of links) {
    const u = urlOf(l);
    if (!u) continue;
    const kind = kindUnder(shape, u);
    if (!kind) continue;
    if (!placeable(l)) { unplaced.push({ kind, ...end(l), why: "no_page_rect" }); continue; }
    (kind === "item" ? items : files).push(l);
  }
  const order = (a, b) => (a.source.page - b.source.page)
    || (top(b.source.rect) - top(a.source.rect)) || (left(a.source.rect) - left(b.source.rect));
  items.sort(order);
  files.sort(order);
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
      if (before(p, at(items[i]))) break;
      g = i;
    }
    if (g < 0) unplaced.push({ kind: "file", ...end(f), why: "above_the_first_item" });
    else groups[g].files.push(end(f));
  }
  return {
    membership: {
      ...MEMBERSHIP_LABEL,
      system: shape.system,
      basis: "each file link is assigned to the item link whose region contains the top edge of its "
           + "rect; a region runs from an item link's top edge down to the next item link's, in page "
           + "order. The publisher linked neither end to the other: this pairing is the plane's "
           + "inference from position, to be confirmed, never the publisher's own link.",
      counts: { items: groups.length, placed: groups.reduce((n, g) => n + g.files.length, 0), unplaced: unplaced.length },
      items: groups,
      unplaced,
    },
    why: null,
  };
}

/** R51: the label check: null when the membership and every pair in it carry the label, else the name of the first
 *  property that does not. */
export function checkMembershipLabel(m) {
  if (m == null) return null;
  const bad = (o) => {
    for (const [k, v] of Object.entries(MEMBERSHIP_LABEL)) if (!o || o[k] !== v) return k;
    return null;
  };
  const head = bad(m);
  if (head) return `membership.${head}`;
  for (const [i, g] of (Array.isArray(m.items) ? m.items : []).entries()) {
    const k = bad(g);
    if (k) return `membership.items[${i}].${k}`;
    if (g.item && Object.prototype.hasOwnProperty.call(g.item, "partition")) return `membership.items[${i}].item.partition`;
  }
  return null;
}

/** R51: what `op=pdfstructure` serves beside `links[]`: the membership, or null with `membershipWhy`. */
export function membershipBeside(structure, view) {
  const d = deriveMembership(structure, view);
  const bad = checkMembershipLabel(d.membership);
  if (bad) return { membership: null, membershipWhy: `label_check_failed: ${bad}` };
  return { membership: d.membership, membershipWhy: d.membership ? null : d.why };
}
