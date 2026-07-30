/* ASP.NET WebForms, which is what Oakland's legislative record runs on.
 *
 * MEASURED, oakland.legistar.com/Calendar.aspx, 2026-07-30, two fetches three
 * seconds apart: identical length, 114,177 differing bytes, 31.4% of the
 * document, and every differing byte inside two hidden fields, __VIEWSTATE
 * (115,096 bytes) and __EVENTVALIDATION (876 bytes). With those normalised the
 * remaining 252,948 bytes were byte-identical. Nothing about the calendar had
 * changed.
 *
 * WebForms serialises its entire control tree into __VIEWSTATE on every response
 * and reissues __EVENTVALIDATION as an anti-forgery list of legal postback
 * targets. Both are mechanism for interacting with the page and neither is
 * content. The implication runs one way only: if the content changed the viewstate
 * would change too, but the converse is false, which is exactly why byte
 * comparison cannot answer a question about content on this stack.
 *
 * A NOTE ON WHAT IS *NOT* CLAIMED HERE. Two fetches of this calendar minutes apart
 * also differed in total LENGTH (364,941 against 368,904 bytes), which viewstate
 * alone does not explain: the page's own content varies with the date window it
 * shows. That is a real change in the document and this handler must not hide it,
 * so nothing about calendar rows is normalised. Only the two hidden fields are.
 */
import { REGION, CONFIDENCE, unescapeHtml } from "../index.mjs";

const VIEWSTATE_FIELDS = "__VIEWSTATE|__VIEWSTATEGENERATOR|__VIEWSTATEENCRYPTED|__EVENTVALIDATION"
                       + "|__PREVIOUSPAGE|__SCROLLPOSITIONX|__SCROLLPOSITIONY|__LASTFOCUS";

export default {
  key: "aspnet_webforms",
  label: "a page built with ASP.NET WebForms",
  version: 1,
  textual: true,

  detect(ctx) {
    const h = ctx.headers || {};
    const text = ctx.text || "";
    const signals = [];
    /* The hidden field is the definitive signal: nothing but WebForms emits it,
       and it is present on every WebForms page by construction. */
    if (/<input[^>]*\bname="__VIEWSTATE"/i.test(text)) signals.push("__VIEWSTATE field");
    if (/<input[^>]*\bname="__EVENTVALIDATION"/i.test(text)) signals.push("__EVENTVALIDATION field");
    if (/\bid="aspnetForm"/i.test(text)) signals.push("aspnetForm");
    const powered = String(h["x-powered-by"] || "");
    if (/asp\.net/i.test(powered)) signals.push("x-powered-by: " + powered);
    if (h["x-aspnet-version"]) signals.push("x-aspnet-version: " + h["x-aspnet-version"]);
    if (/microsoft-iis/i.test(String(h.server || ""))) signals.push("server: " + h.server);

    /* A header alone is LIKELY and not certain: ASP.NET also serves MVC and Core
       pages that have no viewstate, and applying viewstate rules to those would
       normalise nothing and mislead nobody, but claiming certainty about the wrong
       framework is how a handler starts hiding things it should not. Certainty
       requires the field itself. */
    if (signals.some((s) => s.startsWith("__VIEWSTATE")))
      return { match: true, confidence: CONFIDENCE.CERTAIN, signals };
    if (signals.length) return { match: true, confidence: CONFIDENCE.LIKELY, signals };
    return { match: false, confidence: CONFIDENCE.NONE };
  },

  /* An index or a record. A WebForms index page (Calendar.aspx, Legislation.aspx)
     lists items and its content legitimately changes as the underlying data does;
     a detail page (LegislationDetail.aspx, MeetingDetail.aspx) is a record of one
     thing and should be stable. The distinction matters for update management: a
     changed index is expected and a changed record is worth a member's attention. */
  kind(ctx) {
    const p = String(ctx.locator || "").toLowerCase();
    if (/detail\.aspx/.test(p)) return "record";
    if (/(calendar|legislation|meeting|people|departments)\.aspx/.test(p)) return "index";
    if (/\.aspx/.test(p)) return "page";
    return "unknown";
  },

  rules() {
    return [
      { key: "webforms_page_state", region: REGION.MECHANICAL,
        label: "page state this site rebuilds on every visit",
        patterns: [
          new RegExp(`(<input[^>]*\\bname="(?:${VIEWSTATE_FIELDS})"[^>]*\\bvalue=")([^"]*)(")`, "gi"),
          /* Some skins emit the field with value= before name=. Measured absent on
             Legistar, included because the attribute order is the page author's
             choice and a rule that depends on it is a rule that breaks quietly. */
          new RegExp(`(<input[^>]*\\bvalue=")([^"]*)("[^>]*\\bname="(?:${VIEWSTATE_FIELDS})")`, "gi"),
        ] },
      { key: "webforms_antiforgery", region: REGION.MECHANICAL,
        label: "a one-time security token",
        patterns: [
          /(<input[^>]*\bname="__RequestVerificationToken"[^>]*\bvalue=")([^"]*)(")/gi,
          /(\bnonce=")([^"]*)(")/gi,
        ] },
      { key: "aspnet_session", region: REGION.MECHANICAL, label: "a visit identifier",
        patterns: [/(\bASP\.NET_SessionId=)([A-Za-z0-9._%-]+)()/gi] },
      /* Ad and analytics slots. Legistar carries GPT and Google Analytics, and per
         the standing ruling a third party's script output is that third party's,
         never the publisher's, so it is machinery here and not decoration. */
      { key: "ad_slots", region: REGION.MECHANICAL, label: "an advertising or analytics slot",
        patterns: [
          /(\bdata-google-query-id=")([^"]*)(")/gi,
          /(["'&](?:correlator|cachebuster|ord|gclid|_ga|_gid)=)([^"'&\s]+)()/gi,
        ] },
    ];
  },

  /* MEASURED, and it replaced a rule that did nothing. Legistar emits no <nav>,
     no <header> and no <footer>: its furniture is ASP.NET control divs with
     generated ids (ctl00_divTop, ctl00_tabTop, ctl00_divHeader), and a rule that
     guessed at those ids normalised 303 bytes of a 369KB page while looking like
     it worked. What the page does carry is exactly one <main id="mainContent"
     role="main">, which is the document. Naming the boundary is both simpler and
     safer than cataloguing the furniture: everything outside it is furniture in
     one stroke, and a theme change cannot quietly reclassify substance. */
  boundary() {
    return /<main\b[^>]*>([\s\S]*)<\/main>/i;
  },

  /* The entries on an index, keyed so one can be told from another across fetches.
     MEASURED on Calendar.aspx: 41 table rows inside <main>, of which 18 carry a
     MeetingDetail link with a stable numeric ID, and five of those eighteen read
     CANCELLED. The ID is the key because it survives the row moving, the title
     being edited and the grid being re-sorted; the row's own visible text is the
     digest, so a cancellation is an ALTERED entry rather than a page that differs.

     Legistar's document links (View.ashx?M=A for an agenda, M=IC for minutes) are
     folded into the digest deliberately: an agenda being swapped under an unchanged
     heading is exactly the kind of quiet substitution a member would want flagged,
     and it changes no other part of the row. */
  members(ctx) {
    const text = String(ctx.text || "");
    const main = /<main\b[^>]*>([\s\S]*)<\/main>/i.exec(text);
    const scope = main ? main[1] : text;
    const out = [];
    for (const row of scope.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || []) {
      const raw = unescapeHtml(row);
      const id = /(?:Meeting|Legislation|MatterFile|Person)Detail\.aspx\?ID=(\d+)/i.exec(raw);
      if (!id) continue;
      const label = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const docs = (raw.match(/View\.ashx\?[^"'\s]*/gi) || []).sort().join(" ");
      out.push({ key: id[1], label: label.slice(0, 160), digest: label + " || " + docs });
    }
    return out;
  },

  /* Stylesheets decide whether the page reads as the source published it, so a
     missing one makes the rendition unfaithful. An icon or a background image does
     not. Fonts sit on the line and are treated as non-critical: a page in a
     fallback face is still, in Bob's terms, meaningfully the same document. */
  renderCritical(part) {
    return part.kind === "stylesheet" || part.kind === "css-asset" && /\.css($|\?)/i.test(part.url || "");
  },
  ignorable(part) {
    return part.reason === "THIRD_PARTY" || part.reason === "OUTSIDE_THE_DOCUMENT"
        || part.reason === "COLLAPSED_SRCSET_FAMILY";
  },
};
