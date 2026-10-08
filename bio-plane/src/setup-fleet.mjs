/* What instance-setup shares with the installer (N234, installer R30; K405): the slug grammar and the fleet's binding
   names, and R47's block on who controls the group's Civicsmith (installer R34), in a leaf that imports nothing, so the
   installer's neutral bundle can carry it without the plane's store or any `cloudflare:*` module. `setup.mjs` re-exports the two
   names and renders the block; this file is the one definition of each. */

/* The producing group's slug grammar ("Terms"; R2, R4): 3 to 40 of a-z, 0-9 and '-', beginning and ending with a
   letter or digit. */
export const GROUP_SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;

/* The fleet's members and the binding names the plane reads each by (R17), as `[member, binding]` pairs. T33 adds the
   recompute member (`sheet-worker`, K1531) and the assistant's container member (`agent-runner`, K1601), each read for
   its own build through the binding named here like every other member. T36 adds the virus scanner (`file-scanner`,
   K2152), which the installer installs with this binding (installer R44). */
export const FLEET_BINDINGS = [["agent-worker", "AGENT_WORKER"], ["pdf-worker", "PDF_WORKER"], ["ocr-worker", "OCR_WORKER"],
  ["sheet-worker", "SHEET_WORKER"], ["agent-runner", "AGENT_RUNNER"], ["file-scanner", "FILE_SCANNER"]];

/* R47 (DEC-109; H17; K1038): WHO REALLY CONTROLS YOUR GROUP'S CIVICSMITH, told to the founder before they choose a
   password, in DEC-149's words (R63). Held once here, for the claim page (`setup-page`'s slot, which `setup.mjs` fills)
   and the installer's last screen (installer R34), so the two cannot drift. A short plain block in DEC-109's words; nothing asks for or records an acknowledgement of it. `heading` and
   `sentences` are the words; `guide` (T35; F10, K1874) is the block's last sentence, naming the guide to replacing the
   one-time password (`setup-page` R27) and where it is found, the same words for the page and the installer.
   `hostingControlBlock(cls, {guideHref})` is the block as HTML, every word escaped, in an element whose class is the
   page's own; with `guideHref` (the page's) the guide's name is a link to it, and without (the installer's) it is
   text. */
export const HOSTING_CONTROL = Object.freeze({
  heading: "Before you choose a password: who controls your group's Civicsmith",
  sentences: Object.freeze([
    "Whoever can sign in to the hosting account your group's Civicsmith runs in (its Cloudflare account) controls it. "
      + "They can replace the one-time password, claim it again, read everything in it and lock everyone else out, "
      + "and no vote of the group's administrators can stop them.",
    "Use a group account for it, not anyone's personal login.",
    "Add at least one other trusted person to that account.",
    "Where possible, let someone other than the group's administrators hold it.",
    "The same account is the way back in if the password you choose is lost: sign in to it, replace the ADMIN_TOKEN "
      + "value in this worker's settings, and your group's Civicsmith can be claimed again.",
  ]),
  guide: Object.freeze({
    sentence: "If the one-time password may have been seen, replace it: follow the guide \u201cReplace the one-time "
      + "password\u201d in your group's Civicsmith, on its first page and in its members and keys section.",
    name: "Replace the one-time password",
  }),
});
const escBlock = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export function hostingControlBlock(cls = "notice", { guideHref = null } = {}) {
  const { sentence, name } = HOSTING_CONTROL.guide;
  const guide = typeof guideHref === "string" && guideHref
    ? sentence.split(name).map(escBlock).join(`<a href="${escBlock(guideHref)}">${escBlock(name)}</a>`)
    : escBlock(sentence);
  return `<div class="${escBlock(cls)}" id="hosting-control"><p><b>${escBlock(HOSTING_CONTROL.heading)}</b></p>`
    + HOSTING_CONTROL.sentences.map((s) => `<p>${escBlock(s)}</p>`).join("")
    + `<p style="margin:0">${guide}</p></div>`;
}
