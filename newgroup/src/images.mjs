/* R38, R23 (T46; N897 (4); `draft-T46-trial.md` §3.2) — WHETHER A CONTAINER MEMBER'S IMAGE CAN BE PULLED, AND WHAT YOUR
 * GROUP'S CIVICSMITH LACKS WITHOUT IT, held once for the fleet step (index.mjs) and the install and update pages (ui.mjs).
 *
 * A container member installs under the default scheduling policy only from a registry that policy pulls from: Docker
 * Hub, Amazon ECR, Google Artifact Registry (the Cloudflare registry is the `durable_object` policy's, which this installer
 * never uses), and only pinned to one exact build by its sha256 digest. A release whose image sits anywhere else (GitHub's
 * registry, today: there is no public registry yet, K2816 (4)) is left out by name, in words a group can read: never "not
 * a public registry image". The member names stay as the fleet statement gives them; what each provides is said beside.
 */

import { word } from "./words.mjs";

const PINNED = /^[a-z0-9][a-z0-9.-]*(?::[0-9]{1,5})?\/[a-z0-9._/-]+@sha256:[0-9a-f]{64}$/;
const PULLABLE = /^(?:docker\.io|registry-1\.docker\.io|[0-9]{12}\.dkr\.ecr\.[a-z0-9-]+\.amazonaws\.com|[a-z0-9-]+-docker\.pkg\.dev)\/[a-z0-9._/-]+@sha256:[0-9a-f]{64}$/;

export const IMAGE_UNPINNED = "this release does not pin its image to one exact build (a sha256 digest), so it cannot be checked";
export const IMAGE_UNPULLABLE = "this release's image is not yet published where your Cloudflare account can pull it";

/* null when the image installs; else why not, in words. */
export function imageWhy(image) {
  if (typeof image !== "string" || !PINNED.test(image)) return IMAGE_UNPINNED;
  if (!PULLABLE.test(image)) return IMAGE_UNPULLABLE;
  return null;
}

/* R38 (T36): what your team's Civicsmith lacks while a container member is left out, said beside its reason. */
export const CONTAINER_LACKS = Object.freeze({
  /* R57: the assistant does not run in a container, so the absence of `agent-runner` names nothing the assistant lacks. */
  "file-scanner": "your team's Civicsmith has no file scanner and no safe view until it is installed: files are kept and shown but not "
    + "scanned, and a high-risk file opens only in its safe view once one can be made",
});
export const lacksOf = (member) => (member in CONTAINER_LACKS ? CONTAINER_LACKS[member] : (member === "agent-runner" ? "" : "what it provides is missing from your team's Civicsmith until it is installed"));

/* R23 (T46): for a release's container classes ([{member, class_name, image}], as the embed records them from the signed
   fleet statement's `Container` parts), each member whose image will not install, once, with why and what it then lacks.
   [] when every image installs. `why` is IMAGE_UNPINNED or IMAGE_UNPULLABLE (the reason's identity, never its words). */
export function partsLeftOut(containers) {
  const out = [];
  for (const c of Array.isArray(containers) ? containers : []) {
    const why = imageWhy(c && c.image);
    /* R57: a member whose absence names nothing the assistant lacks is not listed. */
    if (why && !out.some((o) => o.member === c.member) && lacksOf(c.member)) out.push({ member: c.member, why });
  }
  return out;
}

const escText = (s) => String(s).replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* R23, R76 (T46; DEC-329 (7i)): what each part left out provides, why it is left out and what your team's Civicsmith then
   lacks, each read by key. */
const provides = (member) => (member === "file-scanner" ? word("installer.image.provides.scanner") : word("installer.image.provides.other"));
const whyOf = (p) => (p.why === IMAGE_UNPINNED ? word("installer.image.unpinned", { part: p.member }) : word("installer.image.unpullable", { part: p.member }));
const lacks = (member) => (member === "file-scanner" ? word("installer.image.lacks.scanner") : word("installer.image.lacks.other", { part: member }));

/* R23 (T46): the statement the install and update pages carry before the install begins, per member; "" when nothing is
   left out. `version` is the release this installer carries. */
export function leftOutNotice(containers, version) {
  const parts = partsLeftOut(containers);
  if (!parts.length) return "";
  return `<div class="notice" id="left-out"><p style="margin:0 0 .6em"><b>${escText(word("installer.image.notice.head", { version }))}</b></p>
<ul>${parts.map((p) => `<li id="left-out-${escText(p.member)}">${escText(word("installer.image.notice.item", { provides: provides(p.member), part: p.member, why: whyOf(p), lacks: lacks(p.member) }))}</li>`).join("\n")}</ul>
<p class="small" style="margin:0">${escText(word("installer.image.notice.foot"))}</p></div>`;
}
