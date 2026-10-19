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
/* Whether an image can be pulled, and what its absence lacks, are `installer-steps`' (R20, R23). */
import { IMAGE_UNPINNED, imageWhy, lacksOf } from "./steps/index.mjs";

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
