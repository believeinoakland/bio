/* A client-rendered application, where the served HTML is a shell.
 *
 * MEASURED, oaklandca.opengov.com/transparency, 2026-07-30: the capture succeeded,
 * the bytes hashed clean, and the document carried ZERO anchors and no evidentiary
 * content of any kind. Everything a member would have wanted to cite is assembled
 * by script in a browser after the bytes arrive.
 *
 * This handler exists to say so, loudly, at capture time. It is the one case where
 * a technically perfect capture is evidentially worthless, and the danger is
 * specific: the bytes are stable, they hash consistently, monitoring will report
 * "unchanged" forever, and the record will look diligent while holding nothing.
 * Silence here is worse than any of the other failures in this package, because
 * every other one is noisy.
 *
 * Per the standing ruling, JS-rendered content IS the content and must be captured
 * as evidence at the SAME GRADE as the rest of the document, because the render
 * happened in the site's own execution environment at capture time. That needs the
 * browser-rendering path, and until a capture takes that path on this kind of
 * document, this handler's job is to report that what was captured is a shell.
 */
import { REGION, CONFIDENCE } from "../index.mjs";

export default {
  key: "client_rendered",
  label: "an application that builds its pages in the browser",
  version: 1,
  textual: true,
  /* The flag a capture path reads to decide whether the served bytes are worth
     treating as the document at all. */
  shell: true,

  detect(ctx) {
    const text = ctx.text || "";
    const signals = [];
    if (/<div[^>]+\bid="(?:root|app|__next|ember-basic-dropdown-wormhole)"[^>]*>\s*<\/div>/i.test(text))
      signals.push("an empty mount point");
    if (/__NEXT_DATA__/.test(text)) signals.push("Next.js data island");
    if (/\bng-version=/.test(text)) signals.push("Angular");
    if (/\bdata-reactroot\b/.test(text)) signals.push("React root");
    if (/\/reporting-classic-app\//.test(text)) signals.push("OpenGov reporting app");
    if (/window\.__(?:NUXT|INITIAL_STATE|PRELOADED_STATE)__/.test(text)) signals.push("a hydration payload");

    /* The structural test, and the one that actually matters: a document of any
       size with no anchors and no paragraphs is not a document, whatever framework
       built it. Measured on the OpenGov portal, which matched no framework marker
       this list had. */
    const anchors = (text.match(/<a\b[^>]*\bhref=/gi) || []).length;
    const paras = (text.match(/<p\b/gi) || []).length;
    const body = /<body\b[\s\S]*<\/body>/i.exec(text);
    const bodyLen = body ? body[0].length : text.length;
    if (bodyLen > 2000 && anchors === 0 && paras <= 1) signals.push("no links and no prose in the body");

    if (signals.includes("no links and no prose in the body") && signals.length >= 2)
      return { match: true, confidence: CONFIDENCE.CERTAIN, signals };
    if (signals.length >= 2) return { match: true, confidence: CONFIDENCE.LIKELY, signals };
    if (signals.length) return { match: true, confidence: CONFIDENCE.POSSIBLE, signals };
    return { match: false, confidence: CONFIDENCE.NONE };
  },

  kind() { return "shell"; },

  /* Nothing is normalised. There is no evidentiary region to protect and no
     furniture to discount: the whole point is that the substance is ABSENT, and a
     digest of a shell should move whenever the shell moves so nobody mistakes a
     stable hash for a stable document. */
  rules() { return []; },

  /* Every part is critical, because in a shell the script IS the document, and a
     shell rendered without its script shows a blank page that would be presented
     as the source's own. */
  renderCritical() { return true; },
  ignorable() { return false; },

  /* What a member is told, and it is the only handler that speaks up on its own. */
  warning: "This address builds its page in the browser, so what was collected is the "
         + "empty frame and not the figures. It cannot be relied on as evidence of what "
         + "the page shows. Collecting it properly needs the page to be rendered first.",
};
