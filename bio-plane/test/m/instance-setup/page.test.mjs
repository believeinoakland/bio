/* R47 over the page this module composes and serves (K1851): setup-page's template (its R14's one slot) with the hosting
   block held once in setup-fleet.mjs for the page and the installer, and the re-exports every importer reads. The
   page's own behaviour is setup-page's, tested there. */
import test from "node:test";
import assert from "node:assert/strict";
import { setupPage, groupLine, SETUP_HTML } from "../../../src/setup.mjs";
import { HOSTING_CONTROL, hostingControlBlock } from "../../../src/setup-fleet.mjs";
import { PAGE_HTML, HOSTING_SLOT, pageOf, groupLine as pageGroupLine } from "../../../src/setup-page/index.mjs";
import * as setupPageModule from "../../../src/setup-page/index.mjs";
/* K2038: setup-page's address of its guide to replacing the one-time password (its R27); read through the namespace
   until setup-page's T35 merge brings the name. */
const ROTATION_GUIDE_HREF = setupPageModule.ROTATION_GUIDE_HREF ?? null;

test("R47 K1851 the composed page is setup-page's template with the hosting block in its one slot and no slot left; setupPage(read) is that page with the read's group line, and groupLine is setup-page's", () => {
  assert.equal(PAGE_HTML.split(HOSTING_SLOT).length - 1, 1, "the template carries the slot once");
  assert.equal(SETUP_HTML, PAGE_HTML.replace(HOSTING_SLOT, hostingControlBlock("notice", { guideHref: ROTATION_GUIDE_HREF })));
  assert.equal(SETUP_HTML.includes(HOSTING_SLOT), false);
  assert.equal(groupLine, pageGroupLine);
  for (const read of [undefined, { answered: false }, { answered: true, result: { ok: true, group: null } },
                      { answered: true, result: { ok: true, group: "river-town", display_name: "River <Town>" } }]) {
    const page = setupPage(read);
    assert.equal(page, pageOf(read).replace(HOSTING_SLOT, hostingControlBlock("notice", { guideHref: ROTATION_GUIDE_HREF })), JSON.stringify(read));
    assert.equal((page.match(/id="instance-group"/g) || []).length, 1);
    assert.ok(page.includes(groupLine(read)));
  }
});

/* R47's conditions over one page's bytes, as a list of what fails (empty when it holds), so the negative controls below
   run the same reading over a page that breaks it. The words are pinned here, in this test, not read from the block. */
const OLD_CARD = /If you ever lose the\s+password you choose here/;
const DEC_109 = [
  /Before you choose a password: who controls your group's Civicsmith/,
  /Whoever can sign in to the hosting account your group's Civicsmith runs in \(its Cloudflare account\) controls it\./,
  /can replace the one-time password, claim it again, read everything in it and lock everyone else out,\s+and no vote of the group's administrators can stop them\./,
  /Use a group account for it, not anyone's personal login\./,
  /Add at least one other trusted person to that account\./,
  /Where possible, let someone other than the group's administrators hold it\./,
  /The same account is the way back in if the password you choose is lost[^<]*your group's Civicsmith can be claimed again\./,
];
function r47Fails(html) {
  const fails = [];
  const claim = (html.match(/<section id="s-claim">[^]*?<\/section>/) || [""])[0];
  const block = (claim.match(/<div class="notice" id="hosting-control">[^]*?<\/div>/) || [""])[0];
  if (!block) fails.push("no block in the claim section");
  for (const re of DEC_109) if (!re.test(block)) fails.push(`the block lacks ${re}`);
  if (block && !(claim.indexOf(block) < claim.indexOf('id="pw1"'))) fails.push("the block is not before the password field");
  if (OLD_CARD.test(html)) fails.push("the reassurance-only card is still there");
  if (/<(?:input|button|select|textarea)\b/.test(block)) fails.push("the block carries a control");
  if (/acknowledg/i.test(claim.replace(/<!--[^]*?-->/g, ""))) fails.push("the claim section asks for an acknowledgement");
  return fails;
}

test("R47 R63 the claim section of the page served shows DEC-109's block before the password is chosen, in place of the reassurance-only card, in DEC-149's words (your group's Civicsmith, never this copy), and asks and records no acknowledgement", async () => {
  assert.deepEqual(r47Fails(SETUP_HTML), []);
  assert.deepEqual(r47Fails(setupPage({ answered: true, result: { ok: true, group: "river-town" } })), []);
  /* the words are held once, in the leaf the installer imports, and the page carries them as that leaf renders them */
  assert.ok(SETUP_HTML.includes(hostingControlBlock("notice", { guideHref: ROTATION_GUIDE_HREF })));
  for (const sentence of HOSTING_CONTROL.sentences) assert.equal(SETUP_HTML.split(sentence).length - 1, 1, sentence);
  /* R63 (DEC-149): the block names the group's Civicsmith, never "copy"; "installation" only for the hosting */
  for (const words of [HOSTING_CONTROL.heading, ...HOSTING_CONTROL.sentences, HOSTING_CONTROL.guide.sentence]) assert.doesNotMatch(words, /\bcopy\b|\binstance\b|\bplane\b|\bserver\b/i, words);
  assert.match(hostingControlBlock('x"<'), /^<div class="x&quot;&lt;" id="hosting-control">/);
  /* negative controls: the old card restored, and the block placed after pw1, each fail the reading */
  const card = '<div class="card"><p class="small" style="margin:0"><b>If you ever lose the\n  password you choose here,</b> you are not locked out.</p></div>';
  const block = hostingControlBlock("notice", { guideHref: ROTATION_GUIDE_HREF });
  const withCard = SETUP_HTML.replace(block, card);
  assert.ok(r47Fails(withCard).includes("no block in the claim section"));
  assert.ok(r47Fails(withCard).includes("the reassurance-only card is still there"));
  const after = SETUP_HTML.replace(block, "")
    .replace('<label for="pw2">', block + '<label for="pw2">');
  assert.deepEqual(r47Fails(after), ["the block is not before the password field"]);
  const acked = SETUP_HTML.replace('id="hosting-control"><p>', 'id="hosting-control"><p><input type="checkbox" id="ack">');
  assert.ok(r47Fails(acked).includes("the block carries a control"));
});

/* R47's T35 sentence (F10, K1874 (Q6)): the block ends by naming the guide to replacing the one-time password, in the
   same held words for the page and the installer. The words are pinned here, in this test. */
const GUIDE = "If the one-time password may have been seen, replace it: follow the guide \u201cReplace the one-time password\u201d "
  + "in your group's Civicsmith, on its first page and in its members and keys section.";
const lastParagraph = (html) => (html.match(/<p[^>]*>((?:(?!<p[ >]).)*)<\/p><\/div>$/s) || [])[1] ?? null;
const text = (html) => html.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

test("R47 F10 the block ends by naming the guide to replacing the one-time password, held once for the page and the installer: on the installer's screen as text saying where it is found, on the page with its name a link", () => {
  assert.equal(HOSTING_CONTROL.guide.sentence, GUIDE);
  assert.ok(GUIDE.includes(HOSTING_CONTROL.guide.name));
  /* the installer's call (no href): the sentence as text, last, no link */
  const installer = hostingControlBlock("notice");
  assert.equal(text(lastParagraph(installer)), GUIDE);
  assert.doesNotMatch(installer, /<a\b/);
  /* the page's form: the same words, the guide's name, and only it, a link to the href given */
  const page = hostingControlBlock("notice", { guideHref: "#guide-x" });
  const last = lastParagraph(page);
  assert.equal(text(last), GUIDE, "the same words on the page");
  assert.deepEqual([...last.matchAll(/<a href="([^"]*)">([^<]*)<\/a>/g)].map((m) => [m[1], m[2]]), [["#guide-x", HOSTING_CONTROL.guide.name]]);
  assert.match(hostingControlBlock("notice", { guideHref: '#"><script>' }), /<a href="#&quot;&gt;&lt;script&gt;">/, "the href is escaped");
  /* the rest of the block is the same in both forms */
  assert.equal(page.replace(last, ""), installer.replace(lastParagraph(installer), ""));
});

test("R47 F10 setup-page R14 on the page this module serves, the guide's name links to setup-page's guide (its R27), an element of the same page", () => {
  assert.equal(ROTATION_GUIDE_HREF, "#replace-one-time-password", "setup-page exports its guide's address (K2038)");
  const id = ROTATION_GUIDE_HREF.slice(1);
  const block = (SETUP_HTML.match(/<div class="notice" id="hosting-control">[^]*?<\/div>/) || [""])[0];
  assert.ok(block.includes(`<a href="${ROTATION_GUIDE_HREF}">${HOSTING_CONTROL.guide.name}</a>`));
  assert.equal(SETUP_HTML.split(`id="${id}"`).length - 1, 1, "the guide is one element of the composed page");
});
