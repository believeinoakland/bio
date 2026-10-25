/* screens-intake R43 (C17; DEC-375), the inbox half: the other material from the same knocker (`knocksof`), and the door to the source.
 * Fix round 10 (K5054): over the REAL store. A knock is handed in at the doorbell by the public `knock` act (no account), a pull is the member's
 * own `inboxpull`, and every id, digest and pseudonym is read from what those acts answered. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld, members, text, main, btn, press, word, says, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const SECRET = "the-same-knocker-secret-one-0123456789";
const OTHER = "another-knockers-secret-two-0123456789";
const SCREENS_ALL = [...SCREENS, DOCUMENT_STUB];

/* a knock handed in at the doorbell, as a stranger does: the public act, no session */
async function knock(world, content, { secret = null, note = null } = {}) {
  const r = await world.door({ url: "/api/?op=knock", init: { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ contentText: content, ...(note ? { note } : {}), ...(secret ? { knockerSecret: secret } : {}) }) } });
  if (!r.json || r.json.ok !== true) throw new Error(`knock was refused: ${JSON.stringify(r.json)}`);
  return r.json;
}
const team = async () => members({ mai: ["contribute", "create_projects"] });
const at = (t, id, plane = {}) => openWorld(`/app/inbox/${id}`, { world: t.world, as: t.mai, plane, screens: SCREENS_ALL });

test("R43 the knocker's other material is listed by knocksof, this knock left out; each listed knock opens the inbox at it", async () => {
  const t = await team();
  const first = await knock(t.world, "Sheets of the garage inspection, one.", { secret: SECRET, note: "Sheets." });
  await t.world.tick(1000);
  const second = await knock(t.world, "Sheets of the garage inspection, two.", { secret: SECRET });
  await t.world.tick(1000);
  const stranger = await knock(t.world, "Something from somebody else.", { secret: OTHER });
  const p = await at(t, first.knockId);
  assert.ok(btn(p, "knocksof"), "offered where the inbox holds another knock of the same secret");
  assert.ok(!text(p).includes(word("screen.inbox.knocker.same1")), "nothing is listed before it is asked");
  await press(p, "knocksof");
  assert.deepEqual(p.byOp("knocksof").map((r) => r.body), [{ pseudonym: first.pseudonym }]);
  assert.ok(says(p, "screen.inbox.knocker.same1") && says(p, "screen.inbox.knocker.same2"));
  const sec = main(p).querySelectorAll("section.cs-section").find((s) => s.querySelector("h2") && s.querySelector("h2").textContent.includes(word("screen.inbox.knocker.heading")) && s.querySelector("a"));
  assert.ok(sec.querySelector(`a[href*="${second.knockId}"]`), "the other knock");
  assert.equal(sec.querySelectorAll(`a[href*="${first.knockId}"]`).length, 0, "this knock is not listed as another");
  assert.equal(sec.querySelectorAll(`a[href*="${stranger.knockId}"]`).length, 0, "another knocker's material is not this knocker's");
  assert.ok(first.pseudonym && first.pseudonym !== stranger.pseudonym);
});

test("R43 control: a knocker with only one knock draws no such section, and no act", async () => {
  const t = await team();
  await knock(t.world, "Sheets of the garage inspection, one.", { secret: SECRET });
  const alone = await knock(t.world, "Something from somebody else.", { secret: OTHER });
  const p = await at(t, alone.knockId);
  assert.equal(btn(p, "knocksof"), null);
  assert.ok(!says(p, "screen.inbox.knocker.heading"));
  const u = await team();
  const only = await knock(u.world, "A knock with no secret at all.");
  const q = await at(u, only.knockId);
  assert.equal(btn(q, "knocksof"), null);
  assert.ok(!says(q, "screen.inbox.knocker.heading"));
});

test("R43 a knock in the record offers the source: a link to about-knocker by its capture; a knock not in the record offers none", async () => {
  const t = await team();
  const kept = await knock(t.world, "Sheets of the garage inspection, one.", { secret: SECRET });
  const waiting = await knock(t.world, "Something from somebody else.", { secret: OTHER });
  const pulled = await t.mai.act("inboxpull", { body: { knockId: kept.knockId } });
  const sha = kept.sha256;
  const p = await at(t, kept.knockId);
  const a = main(p).querySelector(`a[href*="/app/about-knocker/${sha}"]`);
  assert.ok(a, "the source's door");
  assert.ok(a.textContent.includes(word("screen.about-knocker.name")));
  assert.ok(says(p, "screen.inbox.source.line"));
  assert.ok(pulled && pulled.ok !== false);
  const q = await at(t, waiting.knockId);
  assert.equal(main(q).querySelector('a[href*="/app/about-knocker/"]'), null);
});
