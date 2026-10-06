/* R47 over the page this module composes and serves (K1851): setup-page's template (its R14's one slot) with the hosting
   block held once in setup-fleet.mjs for the page and the installer, and the re-exports every importer reads. The
   page's own behaviour is setup-page's, tested there. */
import test from "node:test";
import assert from "node:assert/strict";
import { setupPage, groupLine, SETUP_HTML } from "../../../src/setup.mjs";
import { HOSTING_CONTROL, hostingControlBlock } from "../../../src/setup-fleet.mjs";
import { PAGE_HTML, HOSTING_SLOT, pageOf, groupLine as pageGroupLine } from "../../../src/setup-page/index.mjs";

test("R47 K1851 the composed page is setup-page's template with the hosting block in its one slot and no slot left; setupPage(read) is that page with the read's group line, and groupLine is setup-page's", () => {
  assert.equal(PAGE_HTML.split(HOSTING_SLOT).length - 1, 1, "the template carries the slot once");
  assert.equal(SETUP_HTML, PAGE_HTML.replace(HOSTING_SLOT, hostingControlBlock("notice")));
  assert.equal(SETUP_HTML.includes(HOSTING_SLOT), false);
  assert.equal(groupLine, pageGroupLine);
  for (const read of [undefined, { answered: false }, { answered: true, result: { ok: true, group: null } },
                      { answered: true, result: { ok: true, group: "river-town", display_name: "River <Town>" } }]) {
    const page = setupPage(read);
    assert.equal(page, pageOf(read).replace(HOSTING_SLOT, hostingControlBlock("notice")), JSON.stringify(read));
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
  assert.ok(SETUP_HTML.includes(hostingControlBlock("notice")));
  for (const sentence of HOSTING_CONTROL.sentences) assert.equal(SETUP_HTML.split(sentence).length - 1, 1, sentence);
  /* R63 (DEC-149): the block names the group's Civicsmith, never "copy"; "installation" only for the hosting */
  for (const words of [HOSTING_CONTROL.heading, ...HOSTING_CONTROL.sentences]) assert.doesNotMatch(words, /\bcopy\b|\binstance\b|\bplane\b|\bserver\b/i, words);
  assert.match(hostingControlBlock('x"<'), /^<div class="x&quot;&lt;" id="hosting-control">/);
  /* negative controls: the old card restored, and the block placed after pw1, each fail the reading */
  const card = '<div class="card"><p class="small" style="margin:0"><b>If you ever lose the\n  password you choose here,</b> you are not locked out.</p></div>';
  const withCard = SETUP_HTML.replace(hostingControlBlock("notice"), card);
  assert.ok(r47Fails(withCard).includes("no block in the claim section"));
  assert.ok(r47Fails(withCard).includes("the reassurance-only card is still there"));
  const after = SETUP_HTML.replace(hostingControlBlock("notice"), "")
    .replace('<label for="pw2">', hostingControlBlock("notice") + '<label for="pw2">');
  assert.deepEqual(r47Fails(after), ["the block is not before the password field"]);
  const acked = SETUP_HTML.replace('id="hosting-control"><p>', 'id="hosting-control"><p><input type="checkbox" id="ack">');
  assert.ok(r47Fails(acked).includes("the block carries a control"));
});
