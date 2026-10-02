/* What instance-setup shares with the installer (N234, installer R30; K405): the slug grammar and the fleet's binding
   names, and R47's block on who controls the copy (installer R34), in a leaf that imports nothing, so the installer's
   neutral bundle can carry it without the plane's store or any `cloudflare:*` module. `setup.mjs` re-exports the two
   names and renders the block; this file is the one definition of each. */

/* The producing group's slug grammar ("Terms"; R2, R4): 3 to 40 of a-z, 0-9 and '-', beginning and ending with a
   letter or digit. */
export const GROUP_SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;

/* The fleet's members and the binding names the plane reads each by (R17), as `[member, binding]` pairs. */
export const FLEET_BINDINGS = [["agent-worker", "AGENT_WORKER"], ["pdf-worker", "PDF_WORKER"], ["ocr-worker", "OCR_WORKER"]];

/* R47 (DEC-109; H17; K1038): WHO REALLY CONTROLS THIS COPY, told to the founder before they choose a password. Held
   once here, for the claim page (`setup.mjs`) and the installer's last screen (installer R34), so the two cannot
   drift. A short plain block in DEC-109's words; nothing asks for or records an acknowledgement of it. `heading` and
   `sentences` are the words; `hostingControlBlock(cls)` is the block as HTML, every word escaped, in an element whose
   class is the page's own. */
export const HOSTING_CONTROL = Object.freeze({
  heading: "Before you choose a password: who controls this copy",
  sentences: Object.freeze([
    "Whoever can sign in to the hosting account this copy runs in (its Cloudflare account) controls the copy. They "
      + "can replace the one-time password, claim the copy again, read everything in it and lock everyone else out, "
      + "and no vote of the group's administrators can stop them.",
    "Use a group account for it, not anyone's personal login.",
    "Add at least one other trusted person to that account.",
    "Where possible, let someone other than the group's administrators hold it.",
    "The same account is the way back in if the password you choose is lost: sign in to it, replace the ADMIN_TOKEN "
      + "value in this worker's settings, and the copy can be claimed again.",
  ]),
});
const escBlock = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export function hostingControlBlock(cls = "notice") {
  return `<div class="${escBlock(cls)}" id="hosting-control"><p><b>${escBlock(HOSTING_CONTROL.heading)}</b></p>`
    + HOSTING_CONTROL.sentences.map((s, i, all) =>
      `<p${i === all.length - 1 ? ' style="margin:0"' : ""}>${escBlock(s)}</p>`).join("") + "</div>";
}
