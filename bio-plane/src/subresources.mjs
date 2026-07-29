/* Capture fidelity for HTML sources: the subresources a page needs to look
 * like itself, and the DERIVED companion that lets them be shown.
 *
 * The doctrine constraint that shapes every line here is that the RAW bytes as
 * served are the evidence. They are hashed at receipt, graded B, and never
 * rewritten. That rules out the obvious implementation, which would be to
 * inline the stylesheets and images into the captured HTML: doing that would
 * make the thing on disk something the source never served, and the record
 * would no longer hold what was fetched.
 *
 * So the split is: every fetched thing, primary and subresource alike, is its
 * own content-addressed capture holding exactly the bytes the source sent. A
 * SEPARATE derived artifact, the render companion, is the primary HTML with
 * every subresource reference rewritten to an `about:capture#<sha256>`
 * placeholder and every executable path removed. It carries its own hash, says
 * in its own first line that it is derived, and resolves to nothing at all
 * outside a viewer that knows how to substitute verified bytes for the
 * placeholders. A companion that leaked to a browser unaided renders blank
 * rather than reaching the network, which is the failure direction to want.
 *
 * The stylesheets are the reason the manifest carries a `rewrite` list rather
 * than the companion being self-sufficient. A stylesheet's own `url()`
 * references need substituting too, but the stylesheet capture is RAW and may
 * not be touched, so the substitution has to happen at render time against
 * bytes the viewer has already verified. The manifest tells it what to swap.
 *
 * No DOM: this runs in a Worker. The parser is a tag scanner over the source
 * text with an attribute sub-scanner, which is why the bounds below are not
 * optional. An unbounded parser pointed at an attacker-chosen page is a way to
 * make an instance fetch whatever the attacker likes, as many times as they
 * like, so depth, fanout, and bytes are all capped and the caps are reported
 * when they bite.
 */

/** OUR policy ceiling: how many fetches this instance is willing to spend on a
 *  single document. This is a choice about appetite, and it exists because an
 *  adversary-chosen page can name ten thousand addresses.
 *
 *  It is NOT the platform's limit and must never be set from one. An earlier
 *  version of this file carried 45 with a comment reading "50 on this account",
 *  which is a hardcoded guess about somebody else's infrastructure dressed up
 *  as a constant: Cloudflare can change that number on either plan tomorrow,
 *  every instance runs on a different account, and a number baked in here would
 *  then be silently wrong everywhere at once.
 *
 *  The platform's limit is DISCOVERED, recorded, and acted on. See
 *  `platformCeiling` below and docs/development/CAPTURE-SCALING.md. */
export const SUBRESOURCE_CAP = 400;
/** Bytes for any one subresource. A stylesheet or an image, not a video. */
export const SUBRESOURCE_MAX = 8 * 1024 * 1024;
/** Bytes across all subresources of one capture. */
export const SUBRESOURCE_BUDGET = 64 * 1024 * 1024;

/* Depth: the primary HTML is depth 0. Everything it names directly is depth 1.
 * A stylesheet at depth 1 has its own url() and @import targets followed once,
 * to depth 2, and there the following stops. That is the "one level deep" the
 * spec asks for, and it is what makes an @import chain terminate rather than
 * walk. A depth-2 stylesheet is still CAPTURED, it is just not READ. */
export const CSS_MAX_DEPTH = 2;

/* Elements whose whole subtree leaves the render companion. Scripts are
 * captured (they are part of what the source served that day and the record
 * should hold them) and then never referenced, which is the asymmetry the spec
 * asks for. The frame-bearing elements go for a different reason: an <iframe>
 * or <object> in a rendered companion is a live network fetch wearing the
 * page's clothes, and there is no placeholder that makes it safe. */
const STRIPPED_ELEMENTS = ["script", "iframe", "object", "embed", "applet", "frame", "frameset", "noembed"];

/** Schemes that are not fetched, recorded by name so the refusal is legible. */
const REFUSED_SCHEMES = ["javascript:", "data:", "blob:", "about:", "mailto:", "tel:", "file:", "ftp:", "ws:", "wss:", "chrome:", "chrome-extension:", "view-source:"];

const TAG_RE = /<(\/?[a-zA-Z][a-zA-Z0-9:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
const ATTR_RE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const CSS_URL_RE = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]*))\s*\)/gi;
const CSS_IMPORT_RE = /@import\s+(?:url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]*))\s*\)|"([^"]*)"|'([^']*)')/gi;
const STYLE_EL_RE = /<style\b([^>]*)>([\s\S]*?)<\/style\s*>/gi;
const COMMENT_RE = /<!--[\s\S]*?-->/g;

/** The placeholder a rewritten reference becomes. */
export const placeholderFor = (sha) => `about:capture#${sha}`;
/** What a reference becomes when its bytes are not in the record. */
export const PLACEHOLDER_MISSING = "about:capture#unavailable";

function attrsOf(blob) {
  const out = [];
  ATTR_RE.lastIndex = 0;
  let m;
  while ((m = ATTR_RE.exec(blob))) {
    if (!m[0].trim()) { if (ATTR_RE.lastIndex <= m.index) ATTR_RE.lastIndex = m.index + 1; continue; }
    out.push({
      name: m[1].toLowerCase(),
      raw: m[0],
      value: m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : m[5] !== undefined ? m[5] : null,
      quote: m[3] !== undefined ? '"' : m[4] !== undefined ? "'" : "",
      present: m[2] !== undefined,
    });
  }
  return out;
}

const attr = (as, n) => { const a = as.find((x) => x.name === n); return a ? a.value : null; };

/** srcset candidates, by HTML's own algorithm rather than by splitting on
 *  commas.
 *
 *  Splitting on commas is the obvious implementation and it is wrong, because a
 *  URL is allowed to contain commas: `data:image/gif;base64,AAA,BBB 1x` is ONE
 *  candidate and comma-splitting turns it into three references to addresses
 *  that do not exist. HTML's rule is that the URL is the run up to the next
 *  whitespace, and only the DESCRIPTOR that follows is comma-terminated. A URL
 *  with trailing commas and no descriptor ends the candidate itself.
 *
 *  Getting this wrong is not cosmetic here: every invented reference is a fetch
 *  this instance makes at an address the page never named. */
export function srcsetUrls(v) {
  const out = [];
  const s = String(v);
  let i = 0;
  const isWs = (c) => c === " " || c === "\t" || c === "\n" || c === "\r" || c === "\f";
  while (i < s.length) {
    while (i < s.length && (isWs(s[i]) || s[i] === ",")) i++;
    if (i >= s.length) break;
    const start = i;
    while (i < s.length && !isWs(s[i])) i++;
    let url = s.slice(start, i);
    if (url.endsWith(",")) { out.push(url.replace(/,+$/, "")); continue; }
    out.push(url);
    /* Descriptors run to the next comma that is not inside parentheses. */
    let depth = 0;
    while (i < s.length) {
      if (s[i] === "(") depth++;
      else if (s[i] === ")" && depth) depth--;
      else if (s[i] === "," && !depth) { i++; break; }
      i++;
    }
  }
  return out.filter(Boolean);
}

function cssRefs(css) {
  const out = [];
  CSS_URL_RE.lastIndex = 0;
  let m;
  while ((m = CSS_URL_RE.exec(css))) {
    const u = m[1] ?? m[2] ?? m[3] ?? "";
    if (u.trim()) out.push(u.trim());
  }
  CSS_IMPORT_RE.lastIndex = 0;
  while ((m = CSS_IMPORT_RE.exec(css))) {
    const u = m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5] ?? "";
    if (u.trim()) out.push(u.trim());
  }
  return out;
}

/* Where in the page a reference was found. This is the mechanical half of the
 * document-boundary question: which elements TOGETHER make up the document, and
 * which sit outside it belonging to the site rather than to this document.
 *
 *   body      inside <article>/<main>, or in no furniture region at all
 *   furniture inside <nav>/<footer>/<header>/<aside>, or an ARIA landmark
 *             saying the same thing: the site's, not this document's
 *
 * Declared beats inferred, so an explicit role= is trusted over element name,
 * and the basis is recorded rather than only the conclusion. */
const FURNITURE_TAGS = new Set(["nav", "footer", "header", "aside"]);
const FURNITURE_ROLES = new Set(["navigation", "banner", "contentinfo", "complementary", "search"]);
const BODY_TAGS = new Set(["article", "main"]);

/** srcset families: one picture served at eight widths is ONE reference to the
 *  record, not eight. The largest candidate is kept, because a capture should
 *  hold the best rendition the source offered; the rest are recorded as seen
 *  and not fetched, so the page's own responsive set is still described and
 *  nothing is silently dropped.
 *
 *  A responsive family is also a WEAK SIGNAL AGAINST evidentiary value. A
 *  scanned document or a photograph entered as evidence is served at one size;
 *  a CMS generating eight widths is managing presentation. Recorded as a prior
 *  on the reference, never as a verdict about it. */
function pickSrcsetCandidate(cands) {
  const score = (raw) => {
    const d = /\s(\d+(?:\.\d+)?)([wx])\s*$/.exec(raw || "");
    if (!d) return 1;
    return d[2] === "w" ? Number(d[1]) : Number(d[1]) * 1000;
  };
  const sorted = [...cands].sort((a, b) => score(b.raw) - score(a.raw));
  return { pick: sorted[0], rest: sorted.slice(1) };
}

/** Every reference an HTML document makes to something it needs in order to
 *  look like itself, in document order, each carrying what kind of thing it is
 *  and where in the source it was found. Comments are stripped first: a
 *  commented-out stylesheet was not served to the reader and fetching it would
 *  be inventing a request the browser never made. */
export function parseHtmlRefs(html) {
  const src = String(html).replace(COMMENT_RE, "");
  const refs = [];
  /* A stack, not a flag, and body WINS OVER furniture anywhere on it.
     <footer> inside <article> is the article's byline, not the site's footer:
     HTML scopes <footer> to its nearest sectioning ancestor, so once inside
     <article> or <main> everything is the document's. Erring toward inclusion
     is also the safe direction, since the cost of keeping a logo is bytes and
     the cost of dropping a figure is evidence. */
  const region = [];
  const here = () => {
    const body = region.find((r) => r.region === "body");
    if (body) return body;
    const furn = region[region.length - 1];
    return furn || { region: "body", basis: "default" };
  };
  const add = (ref, kind, where, extra) => {
    if (!ref || !ref.trim()) return;
    const r = here();
    refs.push({ ref: ref.trim(), kind, where, region: r.region, region_basis: r.basis, ...(extra || {}) });
  };

  TAG_RE.lastIndex = 0;
  let m;
  while ((m = TAG_RE.exec(src))) {
    const raw = m[1];
    const closing = raw.startsWith("/");
    const tag = (closing ? raw.slice(1) : raw).toLowerCase();
    if (closing) {
      if (FURNITURE_TAGS.has(tag) || BODY_TAGS.has(tag)) {
        for (let i = region.length - 1; i >= 0; i--)
          if (region[i].tag === tag) { region.splice(i, 1); break; }
      }
      continue;
    }
    const as = attrsOf(m[2] || "");
    {
      const role = (attr(as, "role") || "").toLowerCase().trim();
      if (FURNITURE_ROLES.has(role)) region.push({ tag, region: "furniture", basis: `role=${role}` });
      else if (role === "main" || role === "article") region.push({ tag, region: "body", basis: `role=${role}` });
      else if (FURNITURE_TAGS.has(tag)) region.push({ tag, region: "furniture", basis: `<${tag}>` });
      else if (BODY_TAGS.has(tag)) region.push({ tag, region: "body", basis: `<${tag}>` });
    }
    const inlineStyle = attr(as, "style");
    if (inlineStyle) for (const u of cssRefs(inlineStyle)) add(u, "css-asset", `${tag}[style]`);

    if (tag === "link") {
      const rel = (attr(as, "rel") || "").toLowerCase().split(/\s+/).filter(Boolean);
      const href = attr(as, "href");
      if (!href) continue;
      if (rel.includes("stylesheet")) add(href, "stylesheet", "link[rel=stylesheet]");
      else if (rel.some((r) => r === "icon" || r === "shortcut" || r === "apple-touch-icon" || r === "mask-icon" || r === "apple-touch-icon-precomposed"))
        add(href, "icon", `link[rel=${rel.join(" ")}]`);
      else if (rel.includes("preload")) {
        const as_ = (attr(as, "as") || "").toLowerCase();
        if (as_ === "style") add(href, "stylesheet", "link[rel=preload][as=style]");
        else if (as_ === "image") add(href, "image", "link[rel=preload][as=image]");
        else if (as_ === "font") add(href, "font", "link[rel=preload][as=font]");
      }
      continue;
    }
    if (tag === "img" || tag === "input" || tag === "source" || tag === "video" || tag === "audio" || tag === "track" || tag === "image" || tag === "use") {
      if (tag === "input" && (attr(as, "type") || "").toLowerCase() !== "image") continue;
      const kind = tag === "video" || tag === "audio" || tag === "track" ? "media" : "image";
      const ss = attr(as, "srcset") || attr(as, "imagesrcset");
      /* src is a MEMBER of the family when srcset is present: it is the
         fallback rendition of the same picture, and treating it separately
         fetches the small one alongside the large one, which is the exact
         duplication collapsing exists to prevent. */
      if (ss) {
        const rawCands = ss.split(",").map((x) => x.trim()).filter(Boolean);
        const cands = srcsetUrls(ss).map((u, i) => ({ url: u, raw: rawCands[i] || u }));
        const fb = attr(as, "src");
        if (fb && !cands.some((c) => c.url === fb)) cands.push({ url: fb, raw: fb });
        const { pick, rest } = pickSrcsetCandidate(cands);
        const meta = { family: "srcset", family_size: cands.length, evidentiary_prior: "weak_against" };
        if (pick) add(pick.url, kind, `${tag}[srcset]`, meta);
        for (const r of rest) add(r.url, kind, `${tag}[srcset]`, { ...meta, collapsed: true });
        const po = attr(as, "poster");
        if (po) add(po, "image", `${tag}[poster]`);
        continue;
      }
      for (const n of ["src", "poster", "href", "xlink:href"]) {
        const v = attr(as, n);
        if (v) add(v, n === "poster" ? "image" : kind, `${tag}[${n}]`);
      }
      continue;
    }
    if (tag === "script") {
      const s = attr(as, "src");
      /* Captured because it is part of what was served, never referenced by the
         companion. The kind is what makes the companion able to tell them
         apart without re-deciding the policy. */
      if (s) add(s, "script", "script[src]");
      continue;
    }
  }

  STYLE_EL_RE.lastIndex = 0;
  while ((m = STYLE_EL_RE.exec(src)))
    for (const u of cssRefs(m[2] || "")) add(u, "css-asset", "style");

  return refs;
}

/** Resolve a reference against the page's address and decide whether this
 *  instance will fetch it. The fence is the caller's isPublicHttpsLocator, the
 *  same one guarding the primary locator and the gathering queue, so a
 *  subresource can never reach an address the primary could not. */
export function classifyRef(ref, base, isPublic) {
  const lower = ref.toLowerCase();
  for (const s of REFUSED_SCHEMES) {
    if (lower.startsWith(s)) return { ok: false, reason: "REFUSED_SCHEME", scheme: s, url: ref };
  }
  let abs;
  try { abs = new URL(ref, base).toString(); }
  catch { return { ok: false, reason: "UNRESOLVABLE", url: ref }; }
  const clean = abs.split("#")[0];
  if (!isPublic(clean)) return { ok: false, reason: "REFUSED_LOCATOR", url: clean };
  return { ok: true, url: clean };
}

/* ------------------------------------------------------------------ *
 * The render companion
 * ------------------------------------------------------------------ */

const CSP = "default-src 'none'; img-src blob: about:; style-src blob: about: 'unsafe-inline'; "
          + "font-src blob: about:; media-src blob: about:; script-src 'none'; frame-src 'none'; "
          + "object-src 'none'; form-action 'none'; base-uri 'none'";

const BANNER = (primarySha, when) =>
  `<!-- DERIVED ARTIFACT, not evidence. Generated by bio-plane from the capture\n`
+ `     ${primarySha}\n`
+ `     at ${when}. The raw bytes as served are the evidence and are stored\n`
+ `     separately, unmodified. This file has had scripts and frames removed and\n`
+ `     every subresource reference replaced with an about:capture#<sha256>\n`
+ `     placeholder resolved from data/snapshot-manifest.json. Opened without a\n`
+ `     resolving viewer it renders blank, on purpose. -->\n`;

function stripElements(html) {
  let out = html;
  for (const el of STRIPPED_ELEMENTS) {
    out = out.replace(new RegExp(`<${el}\\b[^>]*>[\\s\\S]*?<\\/${el}\\s*>`, "gi"), "");
    out = out.replace(new RegExp(`<${el}\\b[^>]*\\/?>`, "gi"), "");
    out = out.replace(new RegExp(`<\\/${el}\\s*>`, "gi"), "");
  }
  /* A <base href> would repoint every relative reference at the live site,
     which is the one thing a self-contained companion must not do. */
  out = out.replace(/<base\b[^>]*>/gi, "");
  /* meta refresh is navigation by another name. Ours goes back in below. */
  out = out.replace(/<meta\b[^>]*http-equiv\s*=\s*["']?\s*refresh[^>]*>/gi, "");
  return out;
}

function rewriteCssText(css, resolve) {
  const one = (whole, u) => {
    const t = resolve(u);
    return t === null ? whole : whole.replace(/url\(\s*(?:"[^"]*"|'[^']*'|[^)'"\s]*)\s*\)/i, `url("${t}")`);
  };
  let out = css.replace(CSS_URL_RE, (whole, a, b, c) => one(whole, (a ?? b ?? c ?? "").trim()));
  out = out.replace(CSS_IMPORT_RE, (whole, a, b, c, d, e) => {
    const u = (a ?? b ?? c ?? d ?? e ?? "").trim();
    const t = resolve(u);
    return t === null ? whole : `@import url("${t}")`;
  });
  return out;
}

/** The companion. `resolve(ref, kind)` returns the placeholder a subresource
 *  reference becomes, or null to leave it alone. `classifyLink(ref)` returns
 *  `{type, wrapper, address}` for an <a> or <area> href: the address is kept as
 *  a data attribute so what the page pointed at is never lost, while the href
 *  itself becomes a wrapper that cannot navigate anywhere on its own. */
export function renderCompanion(html, { resolve, classifyLink, primarySha, when }) {
  let src = stripElements(String(html));

  src = src.replace(STYLE_EL_RE, (whole, attrsBlob, body) =>
    `<style${attrsBlob}>${rewriteCssText(body, (u) => resolve(u, "css-asset"))}</style>`);

  src = src.replace(TAG_RE, (whole, name, blob, selfClose) => {
    const tag = name.toLowerCase();
    const as = attrsOf(blob || "");
    if (!as.length) return whole;
    const kept = [];
    for (const a of as) {
      /* Event handlers are executable and go, whatever else happens. */
      if (/^on[a-z]+$/.test(a.name)) continue;
      /* Subresource integrity over bytes the viewer will substitute would fail
         by construction; the record's own hash is the stronger check anyway. */
      if (a.name === "integrity" || a.name === "nonce") continue;
      if (!a.present || a.value === null) { kept.push(a.raw); continue; }

      const q = a.quote || '"';
      const put = (v) => kept.push(`${a.name}=${q}${v}${q}`);

      if (a.name === "style") { put(rewriteCssText(a.value, (u) => resolve(u, "css-asset"))); continue; }

      if (a.name === "srcset" || a.name === "imagesrcset") {
        /* Collapsing a responsive family leaves the other candidates without
           bytes. Leaving them in the srcset as dead placeholders is worse than
           useless: the browser picks by viewport and pixel density, so at 1x it
           would choose the candidate we deliberately did NOT capture and render
           nothing. So the survivors are the ones we hold, and if exactly one
           survives its descriptor goes too, making it unconditional. */
        const live = [];
        let anyDead = false;
        for (const cand of a.value.split(",")) {
          const trimmed = cand.trim();
          if (!trimmed) continue;
          const bits = trimmed.split(/\s+/);
          const t = resolve(bits[0], "image");
          if (t === PLACEHOLDER_MISSING) { anyDead = true; continue; }
          bits[0] = t === null ? bits[0] : t;
          live.push(bits.join(" "));
        }
        if (!live.length) { put(PLACEHOLDER_MISSING); continue; }
        put(live.length === 1 && anyDead ? live[0].split(/\s+/)[0] : live.join(", "));
        continue;
      }

      if (a.name === "href" || a.name === "src" || a.name === "poster" || a.name === "xlink:href" || a.name === "data") {
        if (tag === "a" || tag === "area") {
          const L = classifyLink(a.value);
          kept.push(`data-bio-link="${L.type}"`);
          if (L.address) kept.push(`data-bio-href="${L.address.replace(/"/g, "&quot;")}"`);
          put(L.wrapper);
          continue;
        }
        const t = resolve(a.value, tag === "script" ? "script" : "asset");
        put(t === null ? a.value : t);
        continue;
      }
      kept.push(a.raw);
    }
    return `<${name}${kept.length ? " " + kept.join(" ") : ""}${selfClose}>`;
  });

  const head = BANNER(primarySha, when) + `<meta http-equiv="Content-Security-Policy" content="${CSP}">\n`;
  /* After <head> when there is one, so the policy governs everything that
     follows it, and at the top otherwise. */
  const at = src.search(/<head\b[^>]*>/i);
  if (at !== -1) {
    const end = src.indexOf(">", at) + 1;
    return src.slice(0, end) + "\n" + head + src.slice(end);
  }
  return head + src;
}

/* ------------------------------------------------------------------ *
 * What the document needs, and what merely surrounds it
 * ------------------------------------------------------------------ */

/** same_host / same_site / third_party, recorded on every reference and every
 *  link. Cheap, mechanical, and the first useful cut at advertising, analytics,
 *  and social widgets, which are overwhelmingly cross-origin.
 *
 *  same_site is approximate: with no public suffix list it compares the last
 *  two labels, so it is right for oaklandca.gov and wrong for a .co.uk. It is
 *  recorded AS an approximation, and the host is kept beside it, so a better
 *  rule can be applied later without the input having been destroyed. */
export function originOf(url, baseHost) {
  let h;
  try { h = new URL(url).hostname.toLowerCase(); } catch { return { origin: "unknown", host: null }; }
  const b = String(baseHost || "").toLowerCase();
  if (h === b) return { origin: "same_host", host: h };
  const tail = (x) => x.split(".").slice(-2).join(".");
  if (b && tail(h) === tail(b)) return { origin: "same_site", host: h, approximate: true };
  return { origin: "third_party", host: h };
}

/** Whether a reference is fetched, and why not when it is not.
 *
 *  The rule: support content is limited to what a faithful RENDITION of the
 *  document needs. That is not the same as everything the page requested.
 *
 *  Stylesheets and anything a stylesheet names are kept unconditionally, and
 *  this is the one place the region test is deliberately NOT applied. One
 *  stylesheet lays out the navigation and the article together, and deciding
 *  which rules serve which region needs a layout engine rather than a parser.
 *  Dropping a sprite for being "only" chrome collapses the article's layout with
 *  it. They are also cheap: on the pages measured, CSS assets are icons and
 *  backgrounds while the megabytes are content images.
 *
 *  Images are where the region test earns its place. An image inside the
 *  document is explanatory or evidentiary and is kept. An image in the site's
 *  navigation or footer is a logo or a social icon, and its absence costs
 *  nothing a reader of THIS DOCUMENT would notice.
 *
 *  Third-party scripts, images, and media go. That is the advertising and
 *  analytics cut, and it is the same test rather than a special case: an ad is
 *  by definition not part of the document. */
/* When the ceiling is 45 and the page wants 300, WHICH 45 decides whether the
 * capture renders as the page or as a pile of unstyled text. Measured on a
 * Legistar calendar: document order spent nine of the fifty on scripts that are
 * never rendered, and then ran out before the stylesheets' own sprites.
 *
 * So the work is taken in rendering-necessity order, not document order.
 * Stylesheets first because nothing else matters without them, then the assets
 * those stylesheets name, then the document's own images, and scripts last
 * because they are held as evidence and never rendered at all. Truncation then
 * costs the least important thing rather than an arbitrary one. */
export const FETCH_PRIORITY = { stylesheet: 0, "css-asset": 1, font: 1, icon: 2, image: 3, media: 4, script: 5 };
export const priorityOf = (ref) =>
  (FETCH_PRIORITY[ref.kind] ?? 3) + (ref.region === "furniture" ? 10 : 0);

/** The form two references are compared in when deciding whether they name the
 *  same resource. Stored ALONGSIDE the raw address and never instead of it, so
 *  a rule that later proves wrong can be re-derived rather than having destroyed
 *  its input.
 *
 *  What it does: lowercases scheme and host, drops the default port, drops the
 *  fragment (which the server never sees), and sorts query parameters.
 *
 *  What it deliberately does NOT do: strip trailing slashes, since /a and /a/
 *  are genuinely different resources on plenty of servers; drop cache-busting
 *  parameters, since one server's v=3 is another's content selector; or touch
 *  case in the path, since paths are case-sensitive outside Windows. Each would
 *  be a guess, and a normalisation MISS looks exactly like "not captured",
 *  which is the failure hardest to notice.
 *
 *  Sorting query parameters is the one liberty taken, because Legistar's
 *  View.ashx?M=F&ID=..&GUID=.. is the shape most of this record's material
 *  arrives in and parameter order there carries no meaning. */
export function normalizeAddress(url) {
  let u;
  try { u = new URL(url); } catch { return String(url || "").trim(); }
  u.hash = "";
  u.protocol = u.protocol.toLowerCase();
  u.hostname = u.hostname.toLowerCase();
  if ((u.protocol === "https:" && u.port === "443") || (u.protocol === "http:" && u.port === "80")) u.port = "";
  const ps = [...u.searchParams.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : 1));
  u.search = ps.length ? "?" + ps.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&") : "";
  return u.toString();
}

/** Kinds whose bytes may be reused from an earlier capture of the same host.
 *
 *  Furniture is reusable; evidence is not. A stylesheet is how the site looked
 *  and is shared by every document on it. An image INSIDE the document is what
 *  that document showed, and handing a reader a copy fetched last Tuesday while
 *  they believe they are looking at this capture is exactly the confusion the
 *  grading scheme exists to prevent.
 *
 *  Scripts are excluded for a reason easy to miss: a script is captured as
 *  evidence of WHAT WAS SERVED that day, never to be run. Reusing an older copy
 *  would put a false statement about the source into the record, the same class
 *  of error as reporting a platform limit as a source failure. */
export const REUSABLE_KINDS = new Set(["stylesheet", "css-asset", "font", "icon"]);

/** Whether an earlier capture's bytes may stand in for a fetch now.
 *
 *  The first version of this gated on how long the asset had been STABLE, which
 *  was backwards and measured live as reusing nothing at all: a fresh instance
 *  has no stability history, so nothing could ever be reused until it had sat in
 *  the record for a week, and the ceiling hurts most in exactly that first week.
 *
 *  The load-bearing question is not "has this been stable for a long time" but
 *  "when did we last actually see the source serve these bytes". A stylesheet
 *  fetched and verified twenty minutes ago is a far better bet than one that was
 *  unchanged for three months and last looked at in April. Stability is a
 *  secondary confidence signal; RECENCY OF FETCH is the condition.
 *
 *  Three requirements, each doing work. The kind must be furniture rather than
 *  evidence. The bytes must have been seen served within the freshness window.
 *  And it must appear across more than one document, because an asset referenced
 *  by exactly one page is that page's own whatever directory it sits in. */
export function reuseDecision(ref, known, { now, freshWindowMs = 24 * 3600 * 1000, minDocuments = 2 } = {}) {
  if (!known || !known.sha256) return { reuse: false, why: "not_seen_before" };
  if (!REUSABLE_KINDS.has(ref.kind)) return { reuse: false, why: "evidence_is_always_fetched" };
  if ((known.documents || 0) < minDocuments) return { reuse: false, why: "not_yet_shared_across_documents" };
  const seen = Date.parse(known.last_fetched || "");
  if (!Number.isFinite(seen)) return { reuse: false, why: "no_fetch_record" };
  const age = now - seen;
  if (age > freshWindowMs) return { reuse: false, why: "last_seen_served_too_long_ago", age_ms: age };
  const stable = Date.parse(known.stable_since || "");
  return { reuse: true, fetched_age_ms: age,
           stable_for_ms: Number.isFinite(stable) ? now - stable : null,
           changes: known.changes || 0 };
}

export function fetchPolicy(ref, origin) {
  if (ref.collapsed)
    return { fetch: false, reason: "COLLAPSED_SRCSET_FAMILY",
             detail: `one of ${ref.family_size} responsive candidates for one picture; the largest is captured` };
  if (ref.kind === "stylesheet" || ref.kind === "css-asset" || ref.kind === "font" || ref.kind === "icon")
    return { fetch: true, why: "layout" };
  if (origin === "third_party" && (ref.kind === "script" || ref.kind === "image" || ref.kind === "media"))
    return { fetch: false, reason: "THIRD_PARTY",
             detail: "cross-origin script, image, or media: advertising, analytics, and social widgets are not part of the document" };
  if (ref.kind === "script") return { fetch: true, why: "served_with_the_page" };
  if (ref.region === "furniture")
    return { fetch: false, reason: "OUTSIDE_THE_DOCUMENT",
             detail: `found in ${ref.region_basis}, which belongs to the site rather than to this document` };
  return { fetch: true, why: "in_the_document" };
}

/* ------------------------------------------------------------------ *
 * Links, and the three partitions
 * ------------------------------------------------------------------ */

/* A captured page's outbound links are not decoration. BIO's whole method is
 * making and following connections, and a connection someone ELSE made and
 * published is exactly the kind the record wants to hold. So a link is
 * characterised, not blanked and not left live.
 *
 * The partitions, in Bob's terms:
 *
 *   anchor   somewhere inside this very document (a #fragment). Decided here,
 *            permanently, and it needs no wrapper beyond staying itself.
 *   intra    another file in THIS bundle, whose bytes are captured alongside.
 *            Decided at capture and cannot change afterwards.
 *   linked   an address the store may hold a capture of, in some other bundle.
 *   offsite  an address the store holds nothing for.
 *   refused  executable or otherwise not an address this system will carry.
 *
 * The load-bearing observation is that `linked` and `offsite` ARE THE SAME
 * WRAPPER HERE. Which one a given address is depends on what the store holds,
 * and the store changes: page B is uncaptured on Tuesday and captured on
 * Friday, and every already-captured page that pointed at it moves partition
 * without any of their bytes changing. The companion is content-addressed and
 * immutable, so a companion that hardcoded `offsite` would be asserting a fact
 * with a shelf life inside an artifact that can never be corrected.
 *
 * So the companion emits ONE deferred wrapper carrying the address, and the
 * resolution to linked-or-offsite happens at read time against the store. What
 * the capture-time classification was is still worth keeping, because "the
 * record held nothing for this address on the day we captured the page" is a
 * fact about the record's coverage, so it goes in the manifest, dated, where it
 * can be superseded without rewriting anything.
 */
export const LINK_TYPES = ["anchor", "intra", "deferred", "refused"];

/** The wrapper each partition renders as. `deferred` is resolved by the viewer
 *  into linked-or-offsite; the other three are final at capture. */
export const linkWrapper = {
  anchor: (frag) => frag,
  intra: (sha) => `about:capture#${sha}`,
  deferred: (url) => `about:link#${encodeURIComponent(url)}`,
  refused: () => "about:link#refused",
};

/** Read a wrapper back. The viewer needs this and so does anything auditing a
 *  companion, so it lives beside the writer rather than being re-derived. */
export function readLinkWrapper(v) {
  const s = String(v || "");
  if (s === "about:link#refused") return { type: "refused" };
  if (s.startsWith("about:link#")) {
    try { return { type: "deferred", url: decodeURIComponent(s.slice("about:link#".length)) }; }
    catch { return { type: "refused" }; }
  }
  if (s.startsWith("about:capture#")) return { type: "intra", sha256: s.slice("about:capture#".length) };
  if (s.startsWith("#")) return { type: "anchor", fragment: s };
  return null;
}



/** Fetch, hash, and store every subresource of one captured HTML page, then
 *  build the companion and the manifest.
 *
 *  Injected rather than imported, so this whole module is testable with no
 *  Worker and no network:
 *    fetchOne(url)     -> { ok, status, bytes: Uint8Array, contentType } | { ok:false, ... }
 *    put(sha, bytes)   -> { existed: boolean }
 *    sha256(bytes)     -> hex string
 *    isPublic(url)     -> boolean
 */
export async function captureSubresources({
  html, base, primarySha, primaryFile, fetchOne, put, sha256, isPublic,
  cap = SUBRESOURCE_CAP, perMax = SUBRESOURCE_MAX, budget = SUBRESOURCE_BUDGET, now = () => new Date(),
  /* What this runtime was last OBSERVED to allow, passed in by the caller from
     whatever it recorded last time, or null the first time anything runs here.
     Never a constant in this file: the number belongs to the platform, changes
     without notice, and differs per account, so the only honest source for it
     is having hit it. */
  platformCeiling = null, platformMargin = 5, subrequestsAlreadySpent = 1,
  /* What this host has served before. `siteLookup(addressNorm)` returns the
     stored record or null; absent, nothing is ever reused and behaviour is
     exactly what it was before reuse existed. */
  siteLookup = null, reuseFreshWindowMs = 24 * 3600 * 1000, reuseMinDocuments = 2,
  /* Reads a stored capture back as text, so a REUSED stylesheet can have its own
     url() targets followed just as a freshly fetched one does. Without it a
     reused stylesheet would render without its sprites. */
  readBack = null,
}) {
  /* Why an asset the host has served before was fetched anyway. Recorded so a
     reuse rate that quietly falls to zero is visible rather than mysterious. */
  const noReuse = [];
  const rec_noreuse = (stem, dec) => noReuse.push({ url: stem.url, kind: stem.kind, why: dec.why });
  const stamp = () => now().toISOString().split(".")[0] + "Z";
  const records = [];            // every reference, in the order discovered
  const bySha = new Map();       // sha -> record, for the manifest
  const byUrl = new Map();       // absolute url -> record, for dedup
  const refToUrl = new Map();    // raw ref text -> absolute url or null
  let attempted = 0, discovered = 0, spent = 0, truncated = false, budgetHit = false, platformHit = false;
  /* Two different stopping conditions that must not be confused. `cap` is what
     we are willing to spend. `ceilingBudget` is what the runtime will let us
     spend, known only if a previous run hit it. */
  let observedCeiling = null, deferred = 0, reused = 0;
  /* Everything this run saw of this host, for the caller to file afterwards.
     Written out here rather than inside the loop so that a capture which fails
     partway still reports what it did learn. */
  const siteObservations = [];
  const ceilingBudget = platformCeiling == null ? Infinity
    : Math.max(0, platformCeiling - platformMargin - subrequestsAlreadySpent);

  /* A work list rather than recursion: depth is data, so the bound is visible
     and a cycle in an @import graph cannot become a stack. */
  /* Each item carries the address it is relative TO. This is not a detail: a
     stylesheet at /css/main.css writing `url(img/bg.png)` means /css/img/bg.png,
     and resolving it against the PAGE instead silently captures a different
     file, or nothing, while every count still looks right. */
  let baseHost = null;
  try { baseHost = new URL(base).hostname; } catch { baseHost = null; }
  const queue = parseHtmlRefs(html).map((r) => ({ ...r, depth: 1, from: primaryFile, against: base }));

  /* Every path out of the loop lands here, so a reference is recorded once and
     its owning stylesheet's rewrite list is updated once, whatever happened to
     it. The first version of this had the bookkeeping on the success path only
     and a 404 background image silently kept its live URL in the CSS. */
  const settle = (item, rec) => {
    if (rec) records.push(rec);
    if (item.cssOwner)
      item.cssOwner.rewrite.push({ ref: item.ref, sha256: rec && rec.ok ? rec.sha256 : null });
  };

  while (queue.length) {
    /* Lowest priority value first, ties by discovery order, which keeps the
       result deterministic for a given page. */
    let at_ = 0, best = priorityOf(queue[0]);
    for (let i = 1; i < queue.length; i++) {
      const p = priorityOf(queue[i]);
      if (p < best) { best = p; at_ = i; }
    }
    const item = queue.splice(at_, 1)[0];
    discovered++;
    const cls = classifyRef(item.ref, item.against, isPublic);
    /* Only the page's OWN references go in this map. A relative ref inside a
       stylesheet resolves against the stylesheet, not the page, and letting the
       two share a key would make the companion substitute the wrong bytes. */
    if (item.depth === 1 && !refToUrl.has(item.ref)) refToUrl.set(item.ref, cls.ok ? cls.url : null);

    const at = stamp();
    const org = cls.ok ? originOf(cls.url, baseHost) : { origin: "unknown", host: null };
    const stem = { url: cls.ok ? cls.url : item.ref, kind: item.kind, via: item.where,
                   from: item.from, depth: item.depth,
                   region: item.region || "body", region_basis: item.region_basis || "default",
                   ...org,
                   ...(item.family ? { family: item.family, family_size: item.family_size } : {}),
                   ...(item.evidentiary_prior ? { evidentiary_prior: item.evidentiary_prior } : {}),
                   fetched_at: at };

    if (!cls.ok) {
      settle(item, { ...stem, ok: false, status: null, reason: cls.reason,
        ...(cls.scheme ? { scheme: cls.scheme } : {}),
        detail: cls.reason === "REFUSED_SCHEME"
          ? `a ${cls.scheme} reference is not something this surface fetches`
          : "the address is not public https, and the fence that guards the primary locator guards this one" });
      continue;
    }

    /* The document boundary, applied. A reference the document does not need is
       RECORDED and not fetched: the record still says the page asked for it and
       why this capture did not, which is the difference between a bounded
       capture and a lossy one. */
    const pol = fetchPolicy(item, org.origin);
    if (!pol.fetch) {
      settle(item, { ...stem, ok: false, status: null, fetched: false,
                     reason: pol.reason, detail: pol.detail });
      continue;
    }

    const already = byUrl.get(cls.url);
    /* The same address referenced twice is one fetch and one record, but both
       references still have to resolve, so the second one maps to the bytes the
       first one already stored. */
    if (already) {
      if (item.cssOwner)
        item.cssOwner.rewrite.push({ ref: item.ref, sha256: already.ok ? already.sha256 : null });
      continue;
    }
    /* Once the runtime has refused, every further attempt is another refusal.
       0.37.0 kept trying and wrote 85 identical PLATFORM_LIMIT rows, which
       spends time to record the same fact repeatedly and buries the one row
       that actually discovered the ceiling. Stop, and say the rest is
       outstanding rather than failed. */
    if (platformHit || attempted >= ceilingBudget) {
      deferred++;
      settle(item, { ...stem, ok: false, status: null, reason: "DEFERRED",
        detail: platformHit
          ? "this invocation reached the runtime's outbound request limit; the reference is outstanding, not failed, and a continuation can fetch it"
          : "held back from a previously observed runtime limit so the invocation ends on our terms rather than mid-fetch" });
      continue;
    }
    if (attempted >= cap) {
      truncated = true;
      settle(item, { ...stem, ok: false, status: null, reason: "CAP_REACHED", cap,
        detail: "the fanout cap was reached before this reference; it is recorded rather than dropped so the truncation is visible" });
      continue;
    }
    if (spent >= budget) {
      budgetHit = true;
      settle(item, { ...stem, ok: false, status: null, reason: "BUDGET_EXHAUSTED", budgetBytes: budget });
      continue;
    }
    /* Reuse, before spending a subrequest. The stored bytes are already in the
       content-addressed store, so this costs nothing at all: no request, no
       byte transfer, no draw on the ceiling. On a Legistar page roughly forty
       of the forty-five available fetches are site-wide chrome, so this is the
       difference between a second capture of a host completing and not. */
    if (siteLookup) {
      const known = await siteLookup(normalizeAddress(cls.url));
      const dec = reuseDecision(item, known, { now: Date.now(), freshWindowMs: reuseFreshWindowMs, minDocuments: reuseMinDocuments });
      if (dec.reuse) {
        reused++;
        const rec = { ...stem, ok: true, status: null, sha256: known.sha256, bytes: known.bytes,
          ...(known.content_type ? { content_type: known.content_type } : {}),
          existed: true,
          /* The honesty fields. A reader must never be led to believe a byte was
             verified against the source during THIS capture when it was not. */
          fetched_this_capture: false,
          reused_from_fetched_at: known.last_fetched,
          reused_stable_since: known.stable_since,
          reused_seen_in_documents: known.documents,
          detail: `not fetched during this capture: the source was seen serving these exact bytes at `
                + `${known.last_fetched}, across ${known.documents} documents on this host, and they are `
                + `reused from the record rather than requested again` };
        byUrl.set(cls.url, rec);
        if (!bySha.has(known.sha256)) bySha.set(known.sha256, rec);
        siteObservations.push({ address: cls.url, address_norm: normalizeAddress(cls.url),
                                sha256: known.sha256, kind: item.kind, reused: true });
        /* A reused stylesheet still needs its own url() targets resolved, so the
           bytes are read back and followed exactly as a fetched one would be. */
        if ((item.kind === "stylesheet" || known.content_type === "text/css") && item.depth < CSS_MAX_DEPTH && readBack) {
          const text = await readBack(known.sha256);
          if (text != null) {
            rec.css = true; rec.rewrite = [];
            for (const u of cssRefs(text))
              queue.push({ ref: u, kind: "css-asset", where: `url() in ${cls.url}`,
                           depth: item.depth + 1, from: cls.url, against: cls.url, cssOwner: rec,
                           region: rec.region, region_basis: rec.region_basis });
          }
        }
        settle(item, rec);
        continue;
      }
      if (known) rec_noreuse(stem, dec);
    }

    attempted++;

    let r;
    try { r = await fetchOne(cls.url); }
    catch (e) {
      const msg = String((e && e.message) || e);
      /* "we ran out of budget" and "the source did not serve it" are different
         facts and the record must not confuse them. Reporting a platform
         subrequest limit as FETCH_FAILED would put a false statement about the
         SOURCE into the manifest, which is the one kind of error this system
         exists to prevent. */
      const platform = /too many subrequests|subrequest limit|exceeded.*limit/i.test(msg);
      r = { ok: false, status: 0, reason: platform ? "PLATFORM_LIMIT" : "FETCH_FAILED",
            detail: platform
              ? "the runtime refused another outbound request in this invocation; the source was never asked, "
                + "and this says nothing about whether it would have answered"
              : msg };
      if (platform && !platformHit) {
        platformHit = true;
        /* The count reached WHEN THE RUNTIME SAID NO. This is the observation,
           and it is worth more than any documented figure because it came from
           this account, on this plan, at this moment. The caller records it and
           passes it back next time. */
        observedCeiling = attempted + subrequestsAlreadySpent;
      }
    }

    if (!r || !r.ok) {
      const rec = { ...stem, ok: false, status: r ? (r.status ?? null) : null,
                    reason: r?.reason || "SOURCE_REFUSED",
                    ...(r?.detail ? { detail: r.detail } : {}) };
      byUrl.set(cls.url, rec); settle(item, rec);
      continue;
    }
    const bytes = r.bytes || new Uint8Array(0);
    if (bytes.length > perMax) {
      const rec = { ...stem, ok: false, status: r.status ?? 200, reason: "TOO_LARGE",
                    bytes: bytes.length, maxBytes: perMax };
      byUrl.set(cls.url, rec); settle(item, rec);
      continue;
    }
    spent += bytes.length;
    const sha = await sha256(bytes);
    const { existed } = await put(sha, bytes);
    const ct = (r.contentType || "").split(";")[0].trim();
    const rec = { ...stem, ok: true, status: r.status ?? 200, sha256: sha, bytes: bytes.length,
                  ...(ct ? { content_type: ct } : {}), existed: !!existed };
    rec.fetched_this_capture = true;
    byUrl.set(cls.url, rec);
    if (!bySha.has(sha)) bySha.set(sha, rec);
    siteObservations.push({ address: cls.url, address_norm: normalizeAddress(cls.url),
                            sha256: sha, kind: item.kind, bytes: bytes.length,
                            content_type: ct || null, reused: false });

    /* One level of following, and only through stylesheets. A stylesheet's own
       references are how a page's background images and fonts arrive, so not
       following them at all would leave the common case looking broken. */
    const isCss = item.kind === "stylesheet" || ct === "text/css";
    if (isCss && item.depth < CSS_MAX_DEPTH) {
      let text = "";
      try { text = new TextDecoder("utf-8", { fatal: false }).decode(bytes); } catch { text = ""; }
      rec.css = true;
      rec.rewrite = [];
      for (const u of cssRefs(text))
        queue.push({ ref: u, kind: "css-asset", where: `url() in ${cls.url}`,
                     depth: item.depth + 1, from: cls.url, against: cls.url, cssOwner: rec,
                     /* A stylesheet's own assets carry the stylesheet's region,
                        not the region of whatever tag happened to be open. */
                     region: rec.region, region_basis: rec.region_basis });
    }
    settle(item, rec);
  }

  /* The companion resolves a reference by the same route the parser found it:
     raw text -> absolute url -> record. Scripts resolve to the dead
     placeholder even though their bytes are held, which is the whole point of
     capturing them without referencing them. */
  const resolve = (ref, kind) => {
    const trimmed = String(ref || "").trim();
    if (!trimmed) return null;
    if (kind === "script") return PLACEHOLDER_MISSING;
    const abs = refToUrl.has(trimmed) ? refToUrl.get(trimmed) : (() => {
      const c = classifyRef(trimmed, base, isPublic);
      return c.ok ? c.url : null;
    })();
    if (abs === null) return PLACEHOLDER_MISSING;
    const rec = byUrl.get(abs);
    if (!rec) return PLACEHOLDER_MISSING;
    if (rec.kind === "script") return PLACEHOLDER_MISSING;
    return rec.ok ? placeholderFor(rec.sha256) : PLACEHOLDER_MISSING;
  };

  const when0 = stamp();
  /* Links. Every <a href> the page carries is characterised into a partition
     and recorded, because a connection the source itself asserted is material
     the record wants, not noise to be stripped. */
  const links = [];
  const seenLink = new Map();
  const classifyLink = (ref) => {
    const raw = String(ref || "").trim();
    const note = (type, address, extra = {}) => {
      const key = `${type}\u0000${address || raw}`;
      if (!seenLink.has(key)) {
        seenLink.set(key, true);
        links.push({ ref: raw, type, address: address || null, as_of: when0,
                     ...(address ? originOf(address, baseHost) : {}), ...extra });
      }
      return { type, address, ...extra };
    };
    if (!raw) return { type: "refused", wrapper: linkWrapper.refused(), address: null };

    /* An in-page anchor points at this very document and is decided forever. */
    if (raw.startsWith("#")) {
      note("anchor", null);
      return { type: "anchor", wrapper: linkWrapper.anchor(raw), address: null };
    }
    const cls = classifyRef(raw, base, isPublic);
    if (!cls.ok) {
      note("refused", cls.url, { reason: cls.reason, ...(cls.scheme ? { scheme: cls.scheme } : {}) });
      return { type: "refused", wrapper: linkWrapper.refused(), address: null };
    }
    /* Intra-bundle: the link's address is one this capture already holds bytes
       for, so it resolves inside the bundle and can never become anything
       else. */
    const held = byUrl.get(cls.url);
    if (held && held.ok) {
      note("intra", cls.url, { sha256: held.sha256 });
      return { type: "intra", wrapper: linkWrapper.intra(held.sha256), address: cls.url };
    }
    /* Everything else is deferred: whether the store holds a capture of this
       address is a question about the store, and the store changes. */
    note("deferred", cls.url, { held_at_capture: false });
    return { type: "deferred", wrapper: linkWrapper.deferred(cls.url), address: cls.url };
  };

  const when = when0;
  const companionText = renderCompanion(html, { resolve, classifyLink, primarySha, when });
  const companionBytes = new TextEncoder().encode(companionText);
  const companionSha = await sha256(companionBytes);
  await put(companionSha, companionBytes);

  const fetched = records.filter((r) => r.ok);
  const manifest = {
    version: 1,
    derived: true,
    of: primaryFile,
    of_sha256: primarySha,
    base,
    generated: when,
    render: `${primaryFile}.render.html`,
    render_sha256: companionSha,
    placeholder_scheme: "about:capture#<sha256>",
    unavailable: PLACEHOLDER_MISSING,
    limits: { cap, per_max_bytes: perMax, budget_bytes: budget, css_max_depth: CSS_MAX_DEPTH },
    discovered, attempted, truncated, budget_exhausted: budgetHit,
    complete: !platformHit && !truncated && !budgetHit && deferred === 0,
    reuse: { reused, fetched: fetched.length - reused, not_reused: noReuse,
             fresh_window_ms: reuseFreshWindowMs, min_documents: reuseMinDocuments,
             note: "entries with fetched_this_capture:false were NOT fetched during this capture; "
                 + "their bytes come from an earlier fetch of the same address on this host, named in "
                 + "reused_from_fetched_at. A capture ratified as evidence must re-fetch them." },
    outstanding: deferred,
    platform: {
      limited: platformHit,
      /* Discovered, never declared. null means this run never found the edge,
         which tells the caller only that the ceiling is AT LEAST what was spent,
         not what it is. */
      observed_ceiling: observedCeiling,
      ceiling_used: platformCeiling,
      spent_this_invocation: attempted + subrequestsAlreadySpent,
      note: observedCeiling
        ? "the runtime refused an outbound request at this count; record it and pass it back as platformCeiling"
        : "no limit was reached, so the ceiling is at least spent_this_invocation and its true value is unknown",
    },
    counts: {
      fetched: fetched.length,
      failed: records.filter((r) => !r.ok && (r.reason === "SOURCE_REFUSED" || r.reason === "FETCH_FAILED" || r.reason === "TOO_LARGE")).length,
      platform_limited: records.filter((r) => r.reason === "PLATFORM_LIMIT").length,
      deferred: records.filter((r) => r.reason === "DEFERRED").length,
      refused: records.filter((r) => !r.ok && (r.reason === "REFUSED_SCHEME" || r.reason === "REFUSED_LOCATOR" || r.reason === "UNRESOLVABLE")).length,
      /* Deliberately not fetched: policy skips, plus the two bounds. Every
         record lands in exactly one of fetched/failed/refused/skipped, and the
         subresources test asserts that identity, so a new reason that forgets
         to name a bucket fails rather than quietly vanishing from the totals. */
      skipped: records.filter((r) => !r.ok && (r.reason === "OUTSIDE_THE_DOCUMENT" || r.reason === "THIRD_PARTY"
                || r.reason === "COLLAPSED_SRCSET_FAMILY" || r.reason === "CAP_REACHED" || r.reason === "BUDGET_EXHAUSTED"
                || r.reason === "PLATFORM_LIMIT" || r.reason === "DEFERRED")).length,
      scripts_held_unreferenced: fetched.filter((r) => r.kind === "script").length,
      bytes: spent,
      not_fetched: {
        outside_the_document: records.filter((r) => r.reason === "OUTSIDE_THE_DOCUMENT").length,
        third_party: records.filter((r) => r.reason === "THIRD_PARTY").length,
        collapsed_srcset: records.filter((r) => r.reason === "COLLAPSED_SRCSET_FAMILY").length,
      },
      by_origin: {
        same_host: records.filter((r) => r.origin === "same_host").length,
        same_site: records.filter((r) => r.origin === "same_site").length,
        third_party: records.filter((r) => r.origin === "third_party").length,
      },
      links: {
        anchor: links.filter((l) => l.type === "anchor").length,
        intra: links.filter((l) => l.type === "intra").length,
        deferred: links.filter((l) => l.type === "deferred").length,
        refused: links.filter((l) => l.type === "refused").length,
      },
    },
    subresources: records,
    links,
    link_note: "Every <a> the page carried, characterised. `intra` resolves inside this bundle and is final. "
        + "`deferred` is an address whose partition depends on what the store holds and is therefore NOT final: "
        + "held_at_capture records only what was true when this page was captured, and a viewer must re-resolve "
        + "it against the store at read time. A deferred link that later resolves to a capture in another bundle "
        + "is a link to THAT VERSION of the target only if the target's capture can be shown to be the version "
        + "the source was pointing at on this page's retrieval date. Until that is established the link is "
        + "unconfirmed, and unconfirmed is a third answer rather than a synonym for either of the other two.",
    note: "Every entry the viewer renders must be fetched by sha256 through op=capture and verified "
        + "against that sha before use. Entries with ok:false are recorded because a stylesheet the "
        + "source failed to serve is part of what the source served that day. Script entries hold "
        + "bytes and are never referenced by the render companion.",
  };
  const manifestBytes = new TextEncoder().encode(JSON.stringify(manifest, null, 1));
  const manifestSha = await sha256(manifestBytes);
  await put(manifestSha, manifestBytes);

  return {
    subresources: records,
    links, siteObservations, reused,
    manifest, manifestSha, manifestBytes,
    companionText, companionSha, companionBytes,
    truncated, discovered, attempted,
    /* `renditions`, not `derived`. C-18.1 already spends `derived` on a
       different claim: that THIS document is itself a derivation of something
       else, with a transform and a reason. What is being named here is the
       opposite direction, artifacts derived FROM this document, so it needs its
       own key. It borrows the transform/reason vocabulary because the honesty
       requirement is identical: a rendering that does not say what was done to
       it and why is indistinguishable from evidence. */
    renditions: [
      { file: `${primaryFile}.render.html`, kind: "render_companion", from_file: primaryFile,
        sha256: companionSha, bytes: companionBytes.length, content_type: "text/html",
        transform: "scripts and frames removed; subresource references replaced with about:capture#<sha256> placeholders; a content security policy added",
        reason: "the raw capture is the evidence and is never rewritten, so showing the page as it was needs a separate artifact that says it is one" },
      { file: "data/snapshot-manifest.json", kind: "snapshot_manifest", from_file: primaryFile,
        sha256: manifestSha, bytes: manifestBytes.length, content_type: "application/json",
        transform: "index of the render companion's placeholders to the content-addressed captures they resolve to",
        reason: "a viewer must be able to verify every byte it substitutes against the record before showing it" },
    ],
  };
}
