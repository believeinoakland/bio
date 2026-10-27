/* The invitation page (`bio-plane/public/newgroup/index.html`), built from the design's keys (R79, DEC-338 B323 5): the page is
 * static and cannot read a key, so this script writes it from `setup-words`' rows, and a test holds the committed file to its
 * output. Nothing here is a sentence: the markup, the style and the two addresses are the page's own; every sentence a reader
 * reads is a key's word. Run from the module's directory: `node scripts/invite-page.mjs` writes the file, `--check` says
 * whether it is current. R35: no resource of another origin; the faces are the device's. */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { word } from "../src/words.mjs";

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../bio-plane/public/newgroup/index.html");
const INSTALLER = "newgroup.believeinoakland.workers.dev";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => esc(s).replace(/"/g, "&quot;");
/* A sentence with one drawn element: the element's slot is written as a mark, escaped, and replaced. */
const MARK = "\u0001";
const around = (sentence, html) => esc(sentence).replace(MARK, html);
/* A sentence whose words up to `to` (a prefix of it) are bold. */
const lead = (sentence, to) => `<b>${esc(to)}</b>${esc(sentence.slice(to.length))}`;
const code = (s) => `<span class="mono">${esc(s)}</span>`;

const CSS = `:root{
  --ink:#16232E; --paper:#EDEFE8; --paper-2:#E3E7DD;
  --verdigris:#2F6F62; --verdigris-dk:#1F4F45;
  --signal:#B3441E; --rule:#C6CBBF; --muted:#5C6B66;
  /* R35 (DEC-122 (3)): the device's own typefaces, the installer's pages' stacks; nothing is loaded from elsewhere. */
  --display:Georgia,serif;
  --body:system-ui,-apple-system,"Segoe UI",sans-serif;
  --mono:ui-monospace,Menlo,Consolas,monospace;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:var(--paper);color:var(--ink);font-family:var(--body);
  font-size:17px;line-height:1.65;-webkit-font-smoothing:antialiased}
main{max-width:700px;margin:0 auto;padding:56px 24px 90px}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--verdigris);margin:0 0 14px}
h1{font-family:var(--display);
  font-weight:600;font-size:clamp(30px,4.6vw,46px);line-height:1.08;letter-spacing:-.015em;margin:0 0 18px}
h2{font-family:var(--display);font-weight:600;
  font-size:21px;margin:34px 0 10px;letter-spacing:-.01em}
p{margin:0 0 16px;max-width:62ch}
.lede{font-size:19px;color:#26343F}
/* R42 (DEC-146): what Civicsmith is, in the installer's own two lines (newgroup/src/ui.mjs DESCRIPTION, WHO). */
.what{font-size:19px;color:#26343F;margin:0 0 6px}
.who{margin:0 0 18px}
.small{font-size:14.5px;color:var(--muted)}
ul{margin:0 0 18px;padding-left:20px}
ul li{margin-bottom:9px;max-width:58ch}
.card{border:1px solid var(--rule);background:#F6F7F2;padding:20px 22px;margin:0 0 20px}
.okbox{border-left:3px solid var(--verdigris);background:#EDF3F0;padding:16px 20px;margin:0 0 20px}
a{color:var(--verdigris-dk)}
a.btn{display:inline-block;margin-top:6px;padding:14px 26px;font-size:16px;font-weight:700;
  background:var(--verdigris);color:#fff;border:1px solid var(--verdigris-dk);text-decoration:none}
a.btn:hover{background:var(--verdigris-dk)}
a:focus-visible{outline:2px solid var(--verdigris);outline-offset:2px}
.mono{font-family:var(--mono);font-size:14px}
hr{border:0;border-top:1px solid var(--rule);margin:34px 0}
`;

export function invitePage() {
  const w = word;
  const cloudflare = w("installer.invite.needs.cloudflare", { link: MARK });
  const cf = cloudflare.slice(0, cloudflare.indexOf(".") + 1);
  const plan = w("installer.invite.needs.plan"), payment = w("installer.invite.needs.payment"), containers = w("installer.invite.needs.containers"),
    assistant = w("installer.invite.needs.assistant"), time = w("installer.invite.needs.time");
  const upToComma = (s, n = 1) => { let at = -1; for (let i = 0; i < n; i++) at = s.indexOf(",", at + 1); return s.slice(0, at + 1); };
  const firstSentence = (s) => s.slice(0, s.indexOf(".") + 1);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(w("installer.invite.title"))}</title>
<meta name="description" content="${attr(w("public-read.free_software_groups"))}">
<style>
${CSS}</style>
</head>
<body>
<main>
<p class="eyebrow">Civicsmith</p>
<h1>${esc(w("installer.invite.title"))}</h1>

<p class="what">${esc(w("public-read.free_software_groups"))}</p>
<p class="small who">${esc(w("public-read.neighborhood_issue_groups"))}</p>

<p class="lede">${esc(w("installer.invite.lede1"))} ${esc(w("installer.invite.lede2"))} ${esc(w("installer.invite.lede3"))}</p>

<h2>${esc(w("installer.invite.get.head"))}</h2>
<ul>
<li>${esc(w("installer.invite.get.own"))}</li>
<li>${esc(w("installer.invite.get.control"))}</li>
<li>${esc(w("installer.invite.get.history"))}</li>
</ul>

<h2>${esc(w("installer.invite.needs.head"))}</h2>
<ul>
<li>${`<b>${esc(cf)}</b>` + around(cloudflare.slice(cf.length), `<a href="https://dash.cloudflare.com/sign-up" rel="noopener">${esc(w("installer.invite.needs.cloudflare.link"))}</a>`)}</li>
<li>${lead(plan, upToComma(plan))}</li>
<li>${lead(payment, firstSentence(payment))}</li>
<li>${lead(containers, upToComma(containers))}</li>
<li>${lead(assistant, upToComma(assistant, 2))}</li>
<li>${lead(time, upToComma(time))}</li>
</ul>

<h2>${esc(w("installer.invite.happens.head"))}</h2>
<p>${esc(w("installer.invite.happens.permission"))} ${esc(w("installer.invite.happens.passes"))}</p>
<p class="small">${esc(w("installer.invite.manual"))}</p>

<hr>

<div class="okbox">
<p style="margin:0"><b>${esc(w("installer.invite.before.lead"))}</b> ${around(w("installer.invite.before", { address: MARK }), code(INSTALLER))}</p>
</div>

<p><a class="btn" href="https://${INSTALLER}/">${esc(w("installer.invite.button"))}</a></p>

<p class="small">${around(w("installer.invite.update", { address: MARK }), code(`${INSTALLER}/update`))}</p>

<p class="small publisher">${esc(w("installer.publisher"))}</p>

</main>
</body>
</html>
`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const text = invitePage();
  if (process.argv.includes("--check")) {
    const held = readFileSync(OUT, "utf8");
    if (held !== text) { console.error("the invitation page is not the keys' output: run node scripts/invite-page.mjs"); process.exit(1); }
    console.log("the invitation page is current");
  } else { writeFileSync(OUT, text); console.log(`wrote ${OUT}`); }
}
