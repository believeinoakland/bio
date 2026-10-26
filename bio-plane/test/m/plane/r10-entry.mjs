/* plane fix round 10 (R24 b2, R28b), the platform check L: `r8-headofline-entry.mjs`'s `Headline` (the plane's `Store` with the REAL alarm and a counting wrapper of `readHeld`) with the reading owner's `readHeld` replaced by a stub that
   answers at once and states the document read, so the ledger's reading pass costs nothing and a stall seen beside it is not the reading's (R24 b2: the first firings after a filing). `Stalled` adds one debug route:
   `/r10/stub` (`?mode=read` answers at once, `?mode=real` leaves the owner's own `readHeld`). Every other request is `Headline`'s, and then the plane's own door. */
import { Headline } from "./r8-headofline-entry.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { caseCarriageOf } from "../../../src/case-carriage/index.mjs";
export { default } from "../../../src/plane/index.mjs";

export class Stalled extends Headline {
  #real = null;
  #mode = "real";
  #hook() {
    if (this.#real !== null) return;   /* once: \`Headline\` wraps whatever \`readHeld\` is at its first request, to count the passes */
    const ex = extractionOf(this.ctx), real = (this.#real = ex.readHeld.bind(ex));
    // fixtures-own: synthetic the stall study isolates the plane's own work from the reading by a reader that answers at once; extraction's published fixture is not yet merged, and no test asserts what the answer says
    ex.readHeld = async (...a) => (this.#mode === "read" ? { ok: true, read: true, done: true } : real(...a));
  }
  async fetch(req) {
    const url = new URL(req.url);
    this.#hook();
    if (url.pathname === "/r10/stub") { this.#mode = url.searchParams.get("mode") === "read" ? "read" : "real"; return new Response(JSON.stringify({ mode: this.#mode }), { headers: { "content-type": "application/json" } }); }
    if (url.pathname === "/r10/copy") {   /* where the filed document's copy stands: the queue and the state of its copy */
      const sha = url.searchParams.get("sha"), q = [...this.ctx.storage.sql.exec("SELECT COUNT(*) AS n FROM document_copy_queue")][0].n;
      return new Response(JSON.stringify({ queued: q, copy: caseCarriageOf(this.ctx).documentCopy(sha) }), { headers: { "content-type": "application/json" } });
    }
    return super.fetch(req);
  }
}
