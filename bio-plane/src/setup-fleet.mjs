/* instance-setup's two names the installer imports (N234, installer R30; K405), in a leaf that imports nothing, so
   the installer's neutral bundle can carry it without the plane's store or any `cloudflare:*` module. `setup.mjs`
   re-exports both; this file is their one definition. */

/* The producing group's slug grammar ("Terms"; R2, R4): 3 to 40 of a-z, 0-9 and '-', beginning and ending with a
   letter or digit. */
export const GROUP_SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;

/* The fleet's members and the binding names the plane reads each by (R17), as `[member, binding]` pairs. */
export const FLEET_BINDINGS = [["agent-worker", "AGENT_WORKER"], ["pdf-worker", "PDF_WORKER"], ["ocr-worker", "OCR_WORKER"]];
