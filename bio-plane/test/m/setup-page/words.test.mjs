/* R21 (DEC-149; K1821 (2)): the words members see. Each of DEC-149's 35 rows for this page (T34-87;
   `build/plan/draft-T34-dec149.md`, `bio-plane/src/setup.mjs` as numbered there) is named here by its line, with the
   string it now says and the one it no longer says, read from the bytes `pageOf` answers or from what the script draws.
   Then the whole page's member-facing text, comments, codes, ids and binding names taken out, is read for any of
   "copy", "instance", "plane" or "server" naming the group's Civicsmith. (T36) Three rows, :304, :1585 and :1590, were the
   assistant switch's sentences; the switch is gone from the page (R24, instance-setup R53 superseded), so those rows are
   held as retired: neither their old words nor their DEC-149 words remain, and the keep-away sentences that replace them
   follow R21 by the whole-page scan and the drawn text below. */
import test from "node:test";
import assert from "node:assert/strict";
import { pageOf, groupLine, PAGE_HTML, GROUP_LINE_UNREAD } from "../../../src/setup-page/index.mjs";
import { pageOver } from "./fixture.mjs";
import { list as heldProfiles } from "../../../../jurisdictions/index.mjs";

const tick = () => new Promise((r) => setTimeout(r, 0));
const settle = async () => { for (let i = 0; i < 30; i++) await tick(); };

/* The page's text as a member could meet it: the served bytes less HTML comments and the script's comments. */
const memberText = (html) => html.replace(/<!--[^]*?-->/g, "")
  .replace(/<script\b[^>]*>([^]*?)<\/script>/g, (_, s) => s.replace(/\/\*[^]*?\*\//g, "").replace(/(^|[^:"'\\])\/\/[^\n]*/g, "$1"));

/* A row whose sentence left the page with what it described (T36: R53's switch, R24): its DEC-149 words are gone too. */
const RETIRED = (was) => ({ retired: was });
/* [row, now, never]: what the page says for each row, and the words it said before DEC-149. A row whose words the script
   draws is read from the script's own sentence in the bytes, and driven below where the script composes it. */
const ROWS = [
  [87, "Which group this is could not be read just now", "This copy could not read its group just now"],
  [115, "No group is recorded here yet", "No group is recorded for this copy yet"],
  [204, "Checking the state of this group's Civicsmith.", "Checking the state of this copy."],
  [208, "<h1>This group's Civicsmith has no one-time password yet</h1>", "This copy has no one-time password yet"],
  [210, "to the Cloudflare account this group's Civicsmith runs in,", "to the Cloudflare account this copy runs in"],
  [219, "<h1>Claim this group's Civicsmith</h1>", "Claim your copy"],
  [226, "this group's Civicsmith can be claimed again.", "this copy can be claimed again."],
  [240, '<button id="do-claim">Claim this group\'s Civicsmith</button>', "Claim this copy"],
  [246, "This group's Civicsmith is claimed. Members sign in", "This copy is claimed."],
  [256, "reload this page to claim\n  it again.", "the copy again."],
  [260, "<h1>Your group's Civicsmith is healthy</h1>", "Your copy is healthy"],
  [286, "<h2>Where your group's Civicsmith reads local facts from</h2>", "Where this copy's local facts come from"],
  [289, "Choose the jurisdiction profiles your group's Civicsmith reads its local facts from,", "Choose the jurisdiction profiles this copy reads"],
  [304, RETIRED("A member reaches it through their own Claude subscription or API key,\n    or through the group's API key"), "This copy holds no account for it"],
  [322, '<a id="crumb-panel">Your group\'s Civicsmith</a> &rsaquo; Record', '<a id="crumb-panel">This copy</a>'],
  [329, '<a id="crumb-panel2">Your group\'s Civicsmith</a> &rsaquo;', '<a id="crumb-panel2">This copy</a>'],
  [343, '<a class="crumb-home">Your group\'s Civicsmith</a> &rsaquo; New', '<a class="crumb-home">This copy</a> &rsaquo; New'],
  [376, "your group's Civicsmith will fetch it, hash it at the moment it arrives", "this copy will fetch it"],
  [381, "Must be an https address on a public site. Your group's Civicsmith will not fetch anything else.", "This copy will not fetch anything else."],
  [455, '<a class="crumb-home">Your group\'s Civicsmith</a> &rsaquo; <a id="e-back">Record</a> &rsaquo; Edit', '<a class="crumb-home">This copy</a> &rsaquo; <a id="e-back">'],
  [467, '<a class="crumb-home">Your group\'s Civicsmith</a> &rsaquo; Inbox', '<a class="crumb-home">This copy</a> &rsaquo; Inbox'],
  [476, '<a class="crumb-home">Your group\'s Civicsmith</a> &rsaquo; Members', '<a class="crumb-home">This copy</a> &rsaquo; Members'],
  [502, "on the signing page of your group's Civicsmith. It runs entirely in their browser", "on this copy's signing page"],
  [594, '"This group\'s Civicsmith is not answering"', "This copy is not answering"],
  [616, '"This group\'s Civicsmith was already claimed. If that was not you', "This copy was already claimed."],
  [828, "Listed by snapshot key: your group's Civicsmith does not carry the order they were written", "this copy of the record does not carry"],
  [890, "No keys are registered in your group's Civicsmith yet, so nothing can be published.", "No keys are registered on this copy yet"],
  [1425, "this key cannot sign, and your group's Civicsmith has not been told why", "this copy has not been told why"],
  [1523, "Your group&#39;s Civicsmith could not read its jurisdiction profiles just now.", "This copy could not read its jurisdiction profiles"],
  [1530, "No profile is active: your group&#39;s Civicsmith reads no local facts,", "No profile is active: this copy reads no local facts"],
  [1542, "Your group&#39;s Civicsmith holds no profile to choose.", "This copy holds no profile to choose."],
  [1553, '"From now on, your group\'s Civicsmith reads its local facts from "', "From now on, this copy reads"],
  [1555, "You chose no profile. From now on your group's Civicsmith reads no local facts,", "From now on this copy reads no local facts"],
  [1585, RETIRED("Your group&#39;s Civicsmith could not read whether the assistant is on just now."), "This copy could not read whether the assistant is on"],
  [1590, RETIRED('"The assistant is on for your group\'s Civicsmith." : "The assistant is off for your group\'s Civicsmith."'), "The assistant is on for this copy."],
];

test("R21 each of DEC-149's 35 rows for this page says 'your group's Civicsmith' (or 'this group's Civicsmith' to a reader with no credential, K1821 (2)) or needs no name, and none still says what it said; the assistant switch's three rows are retired with it (R24)", () => {
  assert.equal(ROWS.length, 35);
  assert.equal(new Set(ROWS.map(([row]) => row)).size, 35);
  assert.deepEqual(ROWS.filter(([, now]) => typeof now !== "string").map(([row]) => row), [304, 1585, 1590]);
  const served = [PAGE_HTML, pageOf({ answered: true, result: { ok: true, group: null } })].join("\n");
  for (const [row, now, never] of ROWS) {
    if (typeof now !== "string") assert.equal(served.includes(now.retired), false, `:${row} retired with the switch`);
    else assert.ok(served.includes(now), `:${row} says ${now}`);
    assert.equal(served.includes(never), false, `:${row} no longer says ${never}`);
  }
});

test("R21 R1 the group line: recorded says 'your group's Civicsmith' where it said 'group instance'; none and unread need no name; the template carries the unread line", () => {
  assert.match(groupLine({ answered: true, result: { ok: true, group: "river-town" } }), /<span class="slug">river-town<\/span> &middot; your group's Civicsmith<\/p>$/);
  assert.doesNotMatch(groupLine({ answered: true, result: { ok: true, group: "river-town" } }).replace(' id="instance-group"', ""), /instance|copy/);
  assert.equal(groupLine({ answered: true, result: { ok: true, group: null } }), '<p class="eyebrow" id="instance-group" data-group="none">No group is recorded here yet</p>');
  assert.equal(groupLine(null), GROUP_LINE_UNREAD);
  assert.equal(GROUP_LINE_UNREAD, '<p class="eyebrow" id="instance-group" data-group="unread">Which group this is could not be read just now</p>');
  assert.ok(PAGE_HTML.includes(GROUP_LINE_UNREAD));
});

test("R21 the rows the script composes, driven: the history's order, the publish refusal, a key's undetermined reason and the profiles' sentences read 'your group's Civicsmith'; the keep-away line that replaces the assistant's state needs no name", async () => {
  const fetch = async (url) => {
    const op = new URL(url, "https://copy.example").searchParams.get("op");
    const out = op === "whoami" ? { result: { capabilities: ["publish"], administer: true } } : op === "bootstrap" ? { claimed: true }
      : op === "profiles" ? { result: { ok: true, profiles: [], conflicts: [], choices: [] } }
      : op === "aikeepawaystate" ? { result: { on: true, reason: "r", set_by: "admin", set_at: "2026-10-06T00:00:00Z" } }
      : op === "image" ? { result: { "bundle.md": "---\nid: X\n---\n", "_history/manifest.json": JSON.stringify({ entries: [{ key: "b" }, { key: "a" }] }) } }
      : { result: { ok: true } };
    return { ok: true, status: 200, json: async () => out };
  };
  const p = pageOver({ html: pageOf(undefined), session: { t: "s", e: 0, w: "admin" }, fetch });
  await settle();
  assert.match(p.el("#pf-active").innerHTML, /No profile is active: your group&#39;s Civicsmith reads no local facts/);
  assert.match(p.el("#pf-choices").innerHTML, /Your group&#39;s Civicsmith holds no profile to choose\./);
  assert.match(p.el("#pn-ka-now").textContent, /^On: your group keeps its material away from AI/);
  assert.doesNotMatch(p.el("#pn-ka-now").textContent + p.el("#pn-ka-what").textContent, /\b(?:copy|instance|plane|server)\b/i);
  assert.match(p.ui.profilesWarning(["p"], [{ id: "p", name: "P" }]), /^From now on, your group's Civicsmith reads its local facts from P\./);
  assert.match(p.ui.profilesWarning([], []), /^You chose no profile\. From now on your group's Civicsmith reads no local facts/);
  assert.match(p.ui.ratifyWhy({ reason: "NO_SIGNERS" }), /^No keys are registered in your group's Civicsmith yet/);
  await p.ui.openBundle("X"); await settle();
  assert.match(p.el("#b-history").innerHTML, /Listed by snapshot key: your group's Civicsmith does not carry the order/);
});

test("R21 no member-facing text of the page calls the group's Civicsmith a copy, an instance, a plane or a server; 'copy' keeps only its other meanings", () => {
  const text = memberText(pageOf({ answered: true, result: { ok: true, group: "river-town" } }))
    .replace(/\b(?:id|for|class|name|data-[a-z-]+)="[^"]*"/g, "")             // ids, classes, binding names
    .replace(/\$\("[^"]*"\)/g, "").replace(/"#[a-z0-9-]+"/g, "")                 // selectors in the script
    .replace(/\bID\(P, "[a-z0-9-]+"\)/g, "");                                     // a block's selectors, by its prefix
  assert.doesNotMatch(text, /\b(?:this|your|the|its)\s+(?:copy|instance|plane|server)\b/i);
  assert.doesNotMatch(text, /\b(?:instance|plane|server)\b/i);
  const copies = [...text.matchAll(/[^.\n]*\bcopy\b[^.\n]*/gi)].map((m) => m[0].trim());
  /* the other meanings only: an archive's own copy, copying a key, copying a signature block or a key line, and (R30)
     a safe copy, file-safety's rebuilt document, and the maker of one (UX-DESIGN U125 (3)) */
  for (const c of copies) assert.match(c, /its own copy|copy the <b>ratification<\/b> public key|Copy the whole (?:block|line)|Copy them as text|makes a safe copy|safe-copy maker/, c);
  assert.ok(copies.length >= 3, "not vacuous: the other meanings are there");
});

test("R25 no place is named in this page's behaviour or outward text: the bytes, in every state of the group line, and what the script draws name no jurisdiction a held profile covers", async () => {
  const places = heldProfiles().flatMap((p) => p.covers).flatMap((c) => c.split(/\s+(?:of|and)\s+|\s+/))
    .filter((w) => /^[A-Z]/.test(w) && !["City", "County", "Town"].includes(w));
  assert.ok(places.length >= 2, "not vacuous: the held profiles cover named places");
  const pages = [PAGE_HTML, pageOf(undefined), pageOf({ answered: true, result: { ok: true, group: null } }),
                 pageOf({ answered: true, result: { ok: true, group: "river-town" } })];
  for (const t of pages) for (const place of places) assert.equal(t.includes(place), false, place);
  /* what the script draws, signed in as an administrator over a plane holding no profile */
  const fetch = async (url) => {
    const op = new URL(url, "https://copy.example").searchParams.get("op");
    const out = op === "whoami" ? { result: { capabilities: ["contribute", "publish"], administer: true } } : op === "bootstrap" ? { claimed: true }
      : op === "profiles" ? { result: { ok: true, profiles: [], conflicts: [], choices: [] } } : { result: { ok: true } };
    return { ok: true, status: 200, json: async () => out };
  };
  const p = pageOver({ html: PAGE_HTML, session: { t: "s", e: 0, w: "admin" }, fetch });
  await settle();
  await p.el("#go-members").fire(); await settle();
  const drawn = ["#pf-active", "#pf-choices", "#of-why", "#pn-ka-now", "#pn-ka-what", "#mk-ka-now", "#mk-gk-now", "#mk-cn-now", "#mk-ha-now", "#ln-now", "#gd-now",
                 "#mk-st-cat", "#mk-st-tools"]
    .map((s) => p.el(s).innerHTML + p.el(s).textContent).join("\n");
  assert.ok(drawn.length > 200);
  for (const place of places) assert.equal(drawn.includes(place), false, place);
});
