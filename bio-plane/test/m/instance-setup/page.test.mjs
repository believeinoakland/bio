/* R47 and R83 (T47; N1002): this module serves no page; it holds R47's block, once, in the leaf the installer imports,
   re-exported for the screens that show it (`screens-entry`). The screens' own behaviour is theirs, tested there. */
import test from "node:test";
import assert from "node:assert/strict";
import * as S from "../../../src/setup.mjs";
import { HOSTING_CONTROL, hostingControlBlock } from "../../../src/setup-fleet.mjs";

test("R83 R86 no export names the page: setupPage, SETUP_HTML and groupLine are gone, and no export is page HTML; HOSTING_CONTROL stays R47's one holder, re-exported as the leaf holds it (control: the block itself still renders)", () => {
  for (const name of ["setupPage", "SETUP_HTML", "groupLine", "PAGE_HTML", "pageOf"]) assert.equal(name in S, false, name);
  for (const [name, v] of Object.entries(S)) {
    assert.doesNotMatch(name, /page/i, `${name} names a page`);
    if (typeof v === "string") assert.doesNotMatch(v, /<html|<!doctype/i, `${name} is page HTML`);
  }
  assert.equal(S.HOSTING_CONTROL, HOSTING_CONTROL);
  assert.equal(S.hostingControlBlock, hostingControlBlock);
  assert.match(S.hostingControlBlock("notice"), /^<div class="notice" id="hosting-control">/);
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
function r47Fails(block) {
  const fails = [];
  if (!/^<div class="notice" id="hosting-control">/.test(block)) fails.push("no block");
  for (const re of DEC_109) if (!re.test(block)) fails.push(`the block lacks ${re}`);
  if (OLD_CARD.test(block)) fails.push("the reassurance-only card is still there");
  if (/<(?:input|button|select|textarea)\b/.test(block)) fails.push("the block carries a control");
  if (/acknowledg/i.test(block)) fails.push("the block asks for an acknowledgement");
  return fails;
}

test("R47 R63 the block held once for the screens and the installer says DEC-109's words in DEC-149's (your group's Civicsmith, never this copy), and asks and records no acknowledgement", () => {
  assert.deepEqual(r47Fails(hostingControlBlock("notice")), []);
  assert.deepEqual(r47Fails(hostingControlBlock("notice", { guideHref: "#guide" })), []);
  for (const sentence of HOSTING_CONTROL.sentences) assert.equal(hostingControlBlock("notice").split(sentence).length - 1, 1, sentence);
  for (const words of [HOSTING_CONTROL.heading, ...HOSTING_CONTROL.sentences, HOSTING_CONTROL.guide.sentence]) assert.doesNotMatch(words, /\bcopy\b|\binstance\b|\bplane\b|\bserver\b/i, words);
  assert.match(hostingControlBlock('x"<'), /^<div class="x&quot;&lt;" id="hosting-control">/);
  /* negative controls: the old card in place of a sentence, and a control in the block, each fail the reading */
  const block = hostingControlBlock("notice");
  const withCard = block.replace(HOSTING_CONTROL.sentences[0], "If you ever lose the password you choose here, you are not locked out.");
  assert.ok(r47Fails(withCard).includes("the reassurance-only card is still there"));
  assert.ok(r47Fails(withCard).some((f) => f.startsWith("the block lacks")));
  const acked = block.replace('id="hosting-control"><p>', 'id="hosting-control"><p><input type="checkbox" id="ack">');
  assert.deepEqual(r47Fails(acked), ["the block carries a control"]);
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
