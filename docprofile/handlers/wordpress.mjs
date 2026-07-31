/* WordPress, which is what local news and many small agencies publish on.
 *
 * MEASURED, oaklandside.org, 2026-07-30: two fetches were BYTE-IDENTICAL, 871,068
 * bytes each, served by nginx. That is worth stating plainly because it is the
 * opposite of the ASP.NET case and it corrects an assumption this codebase was
 * drifting toward: churn is not a property of the web, it is a property of the
 * stack. A cached WordPress page has no per-render mechanism to normalise, and a
 * handler that went looking for some would find nothing and should say nothing.
 *
 * What WordPress DOES have, in quantity, is furniture. The same fetch carried 59
 * <article> elements, 10 <nav> elements and 2 <footer> elements on one page. On a
 * news front page most of those articles are OTHER articles: teasers, related
 * links, "more from this section" rails. Those change every few hours as the site
 * publishes, and none of it is a change to the document a member captured.
 *
 * This is the case that forced PRESENTATIONAL to exist as a category separate from
 * MECHANICAL. A teaser rail is not machinery: it is really on the page, it is
 * captured, it renders, and it is not the article's claim about its subject.
 */
import { REGION, CONFIDENCE } from "../index.mjs";

export default {
  key: "wordpress",
  label: "a page published with WordPress",
  version: 1,
  textual: true,

  detect(ctx) {
    const text = ctx.text || "";
    const signals = [];
    /* wp-content and wp-includes are the theme and core asset paths and appear on
       essentially every WordPress page. Two of them together is conclusive; one
       could in principle be a copied asset path on some other site. */
    if (/\/wp-content\//i.test(text)) signals.push("wp-content asset paths");
    if (/\/wp-includes\//i.test(text)) signals.push("wp-includes asset paths");
    if (/\/wp-json\//i.test(text)) signals.push("wp-json API link");
    const gen = /<meta[^>]+name="generator"[^>]+content="([^"]*WordPress[^"]*)"/i.exec(text);
    if (gen) signals.push("generator: " + gen[1]);
    if (/\bid="wp-block-|\bclass="[^"]*wp-block-/i.test(text)) signals.push("block editor markup");

    if (gen || signals.length >= 2) return { match: true, confidence: CONFIDENCE.CERTAIN, signals };
    if (signals.length) return { match: true, confidence: CONFIDENCE.LIKELY, signals };
    return { match: false, confidence: CONFIDENCE.NONE };
  },

  /* An article is a record of one thing and its substance should be stable. A
     front page or a section index is a LISTING whose content is supposed to
     change, and treating a new headline appearing there as a change to captured
     evidence would bury every real change under the news cycle. */
  /* THE ADDRESS DECIDES FIRST, and this ordering is a correction rather than a
     preference. An earlier version tested content markers first and classified
     oaklandside.org's FRONT PAGE as an article, on the strength of markup a theme
     puts on every page. That is the dangerous misclassification: on a listing the
     articles ARE the substance, so the furniture rules below would have normalised
     the entire document and reported every front page as unchanged forever. A
     listing is recognisable from its address with no ambiguity, so the address is
     asked first and the markup only gets a say when the address is silent. */
  kind(ctx) {
    const text = ctx.text || "";
    const p = String(ctx.locator || "");
    if (/^https?:\/\/[^/]+\/?(?:\?|#|$)/.test(p)) return "index";
    if (/\/(?:category|tag|author|page|section|topics?)\//i.test(p)) return "index";
    if (/\/(?:feed|search)\/?$/i.test(p) || /[?&]s=/.test(p)) return "index";
    if (/\/\d{4}\/\d{2}\//.test(p)) return "article";
    if (/<meta[^>]+property="og:type"[^>]+content="article"/i.test(text)
        && !/<meta[^>]+property="og:type"[^>]+content="website"/i.test(text)) return "article";
    if (/\bclass="[^"]*\bsingle(?:-post)?\b/i.test(text)) return "article";
    return "page";
  },

  rules(ctx) {
    const kind = this.kind(ctx);
    const rules = [
      { key: "wp_nonce", region: REGION.MECHANICAL, label: "a one-time security token",
        patterns: [
          /(\bname="_wpnonce"[^>]*\bvalue=")([^"]*)(")/gi,
          /(["'&](?:_wpnonce|_ajax_nonce|nonce)["']?\s*[:=]\s*["'])([A-Za-z0-9]+)(["'])/gi,
          /(\bnonce=")([^"]*)(")/gi,
        ] },
      /* Asset version stamps. WordPress appends ?ver= to enqueued styles and
         scripts, and the value moves whenever a theme or plugin updates. The FILE
         is captured and hashed on its own, so the stamp is addressing rather than
         content. Kept narrow deliberately: only ?ver= and only on an asset-looking
         path, because a bare ?v= elsewhere is content often enough to matter. */
      { key: "wp_asset_version", region: REGION.MECHANICAL, label: "a version stamp on a design file",
        patterns: [/((?:\/wp-content\/|\/wp-includes\/)[^"'\s>]*[?&]ver=)([^"'&\s>]+)()/gi] },
      { key: "wp_ads", region: REGION.MECHANICAL, label: "an advertising or analytics slot",
        patterns: [
          /(\bdata-google-query-id=")([^"]*)(")/gi,
          /(\bid="div-gpt-ad-)([0-9]{6,}[^"]*)(")/gi,
          /(["'&](?:correlator|cachebuster|ord|gclid|_ga|_gid|utm_[a-z]+)=)([^"'&\s]+)()/gi,
        ] },
    ];
    /* Furniture, and ONLY on a document whose substance is one article. On a
       listing page the articles ARE the substance, so normalising <article>
       elements there would erase the entire document and report every front page
       as unchanged forever, which is the exact failure this package exists to
       prevent. */
    if (kind === "article") rules.push(
      { key: "wp_chrome", region: REGION.PRESENTATIONAL, label: "site navigation and footer",
        patterns: [
          /(<nav\b[^>]*>)([\s\S]*?)(<\/nav>)/gi,
          /(<footer\b[^>]*>)([\s\S]*?)(<\/footer>)/gi,
        ] },
      { key: "wp_related", region: REGION.PRESENTATIONAL, label: "related and recommended stories",
        patterns: [
          /(<aside\b[^>]*>)([\s\S]*?)(<\/aside>)/gi,
          /(<(?:div|section)[^>]*\bclass="[^"]*(?:related|recirc|more-from|trending|newsletter)[^"]*"[^>]*>)([\s\S]{0,20000}?)(<\/(?:div|section)>)/gi,
        ] },
    );
    return rules;
  },

  /* An article's own boundary, when the theme marks one. Preferred over the
     furniture patterns above for the same reason it is on the WebForms handler:
     naming the document is one structural fact, while naming its surroundings is
     an open-ended list of theme guesses. Only ever applied to an article, because
     on a listing the <article> elements are the substance. */
  boundary(ctx) {
    if (this.kind(ctx) !== "article") return null;
    return /<article\b[^>]*>([\s\S]*)<\/article>/i;
  },

  /* Listing membership — which stories are on a section or category page and which
     headline was rewritten — used to live here as members(), keyed by permalink. It
     is gone with its only consumer (the deleted monitor()): membership is the
     CONTENT-TYPE axis's question now (CONSTRUCTS Step 0), and there is no WordPress
     content type yet. When one is measured and written (Step 9) the extraction lands
     there, on named facts, not back on the stack handler. The measurement that shaped
     it is preserved in this file's header and in git history. */

  renderCritical(part) { return part.kind === "stylesheet"; },
  ignorable(part) {
    return part.reason === "THIRD_PARTY" || part.reason === "OUTSIDE_THE_DOCUMENT"
        || part.reason === "COLLAPSED_SRCSET_FAMILY";
  },
};
