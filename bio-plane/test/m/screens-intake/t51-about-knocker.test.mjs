/* screens-intake R43 (T51 fix round; DEC-375 C17): the `about-knocker` screen on the real served page. Each act sends the fields its
 * owner declares (the shell's guard accepts them); each refusal is drawn by its words; a sentence is asserted by its key. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, text, main, btn, fill, press, ok, refused, word, says, saysIn, rawKeys } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const SHA = "3".repeat(64);
const PEOPLE = ok({ rows: [{ entity: "PER-1", kind: "person", name: "Dana Ortiz", today: "school custodian" }, { entity: "PER-2", kind: "person", name: "Marcus Webb", today: "building manager" }] });
const MEMBERS = ok({ members: [{ member_id: "dev", handle: "Dev-h" }, { member_id: "mai", handle: "Mai-h" }] });
const ATTR = { entry: "SRCE-1", source: "SRC-1", kind: "attribute", attribute: "occupation", how: "self", knownTo: "group", recorded: true, evidence: { statement: "x" }, by: "member:dev", at: "2026-10-03T10:00:00Z", superseded_by: null, value: "school custodian" };
const HOSTILE = { entry: "SRCE-2", source: "SRC-1", kind: "name", how: "hostile", knownTo: "group", recorded: false, evidence: { statement: "y" }, by: "member:dev", at: "2026-10-06T10:00:00Z", superseded_by: null,
  claimed_by: "the landlord's lawyer", claimed_at: "2026-10-06T00:00:00Z", confirmed: false, claim: "Named by the landlord's lawyer on October 6, 2026; not confirmed by the team" };
const src = (history = []) => ok({ ok: true, captureSha: SHA, sourceId: "SRC-1", source: {}, history });
const open = (history, plane = {}, path = `/app/about-knocker/${SHA}`) => openPage(path, { reachable: true, plane: { sourceof: src(history), sourcerung: ok({ ok: true, rung: "known_to_group" }),
  sourcepublishable: ok({ ok: true, entries: [] }), memberlist: MEMBERS, peopledirectory: PEOPLE, ...plane } });
const rungNow = (p) => main(p).querySelector('[data-ladder="ident"] [aria-current="step"]').textContent;

test("R43 nothing known: the ladder at the source's rung and the form to record what became known; no list, no consent, no heading for what is not there", async () => {
  const p = await open([]);
  assert.equal(rungNow(p), word("screen.inbox.ladder.group"));
  assert.ok(says(p, "screen.about-knocker.intro1") && says(p, "screen.about-knocker.intro2"));
  assert.ok(btn(p, "sourcedisclose"));
  assert.ok(!says(p, "screen.about-knocker.publish.heading"), "nothing to consent to yet");
  assert.ok(!main(p).querySelector("h2") || !Array.from(main(p).querySelectorAll("h2")).some((h) => h.textContent === word("screen.about-knocker.known.head")), "no empty list of what became known");
  assert.deepEqual(rawKeys(p), []);
});

test("R43 what became known and how: each current entry with its value, how it became known and to whom; a hostile claim as a claim, never as a fact", async () => {
  const p = await open([ATTR, HOSTILE]);
  const t = text(p);
  assert.ok(t.includes(word("screen.about-knocker.attribute.occupation")) && t.includes("school custodian"));
  assert.ok(t.includes(word("screen.about-knocker.how.self")) && t.includes(word("screen.about-knocker.knownto.group")));
  assert.ok(t.includes("the landlord's lawyer"));
  assert.ok(t.includes(word("screen.about-knocker.how.hostile")), "the hostile entry is drawn as someone hostile's claim");
  assert.ok(main(p).querySelector("#ab-confirms"), "a hostile claim can be confirmed");
  /* a superseded entry is not drawn as current */
  const q = await open([{ ...ATTR, superseded_by: "SRCE-9", value: "old value" }, { ...ATTR, entry: "SRCE-9", value: "new value" }]);
  assert.ok(text(q).includes("new value") && !text(q).includes("old value"));
});

test("R43 recording what became known sends the fields sourcedisclose declares: stored with the members who may read it, or known and not stored", async () => {
  const p = await open([]);
  fill(p, { "ab-kind": "attribute", "ab-attr": "employer", "ab-value": "the school district", "ab-how": "third_party", "ab-known": "group", "ab-evidence": "She told Dev at the meeting.", "ab-sight-0": true });
  await press(p, "sourcedisclose");
  assert.deepEqual(p.byOp("sourcedisclose").map((r) => r.body), [{ source: "SRC-1", revealed: { kind: "attribute", attribute: "employer", value: "the school district" },
    how: "third_party", knownTo: "group", recorded: true, evidence: "She told Dev at the meeting.", sight: ["dev"] }]);
  const q = await open([]);
  fill(q, { "ab-kind": "name", "ab-how": "hostile", "ab-by": "the landlord's lawyer", "ab-at": "2026-10-06", "ab-evidence": "A letter.", "ab-store-0": false, "ab-store-1": true, "ab-known": "member" });
  await press(q, "sourcedisclose");
  assert.deepEqual(q.byOp("sourcedisclose").map((r) => r.body), [{ source: "SRC-1", revealed: { kind: "name" }, how: "hostile", knownTo: "member", recorded: false, evidence: "A letter.", claimedBy: "the landlord's lawyer", claimedAt: "2026-10-06" }]);
  /* control: no evidence, nothing is sent */
  const r = await open([]);
  fill(r, { "ab-value": "x", "ab-evidence": "" });
  const s = await press(r, "sourcedisclose");
  assert.equal(r.byOp("sourcedisclose").length, 0);
  assert.ok(saysIn(s.slot(), "capture.fieldneeded", { field: word("screen.about-knocker.evidence.label") }));
});

test("R43 consent given and withdrawn: the detail, the audience and the evidence are sent; a consent standing is drawn beside the entry", async () => {
  const p = await open([ATTR], { sourcepublishable: ok({ ok: true, entries: [{ entry: "SRCE-1", value: "school custodian", basis: "consent" }] }) });
  assert.ok(says(p, "screen.about-knocker.consent.members"), "consent given is drawn");
  fill(p, { "ab-cdetail": "SRCE-1", "ab-caud": "public", "ab-cev": "She wrote to the doorbell." });
  await press(p, "sourceconsent");
  assert.deepEqual(p.byOp("sourceconsent").map((r) => r.body), [{ source: "SRC-1", entry: "SRCE-1", audience: "public", evidence: "She wrote to the doorbell." }]);
  fill(p, { "ab-cdetail": "SRCE-1", "ab-caud": "public" });
  await press(p, "sourceconsentwithdraw", { reason: "She took it back." });
  assert.deepEqual(p.byOp("sourceconsentwithdraw").map((r) => ({ source: r.body.source, entry: r.body.entry, audience: r.body.audience })), [{ source: "SRC-1", entry: "SRCE-1", audience: "public" }]);
  /* control: no consent standing, none is drawn */
  const q = await open([ATTR]);
  assert.ok(!says(q, "screen.about-knocker.consent.members"));
});

test("R43 linked to a person: the person, the evidence and the members who may read it are sent; an organization is refused in the design's words", async () => {
  const p = await open([ATTR], { sourcepersonlink: ok({ ok: true, source: "SRC-1", person: "PER-1", sight: ["dev"] }) });
  fill(p, { "ab-person": "PER-1", "ab-pev": "The badge in the council video.", "ab-psight-0": true });
  await press(p, "sourcepersonlink");
  assert.deepEqual(p.byOp("sourcepersonlink").map((r) => r.body), [{ source: "SRC-1", person: "PER-1", evidence: "The badge in the council video.", sight: ["dev"] }]);
  const q = await open([ATTR], { sourcepersonlink: refused("NOT_A_PERSON", "builder detail") });
  fill(q, { "ab-person": "PER-2", "ab-pev": "e", "ab-psight-0": true });
  const r = await press(q, "sourcepersonlink");
  assert.ok(saysIn(r.slot(), "screen.about-knocker.person.refused.org") && saysIn(r.slot(), "screen.about-knocker.person.refused.org.next"));
  assert.ok(!r.slot().textContent.includes("builder detail"));
});

test("R43 each refusal is drawn by its words, never the builder's detail: BAD_DISCLOSURE, NO_EVIDENCE, NO_SIGHT_LIST, NO_SUCH_SOURCE, CONSENT_NOT_STANDING", async () => {
  const seen = new Set();
  for (const [op, code] of [["sourcedisclose", "BAD_DISCLOSURE"], ["sourcedisclose", "NO_EVIDENCE"], ["sourcedisclose", "NO_SIGHT_LIST"], ["sourcedisclose", "NO_SUCH_SOURCE"], ["sourceconsent", "CONSENT_NOT_STANDING"]]) {
    const p = await open([ATTR], { [op]: refused(code, "builder detail") });
    if (op === "sourcedisclose") fill(p, { "ab-value": "v", "ab-evidence": "e", "ab-sight-0": true });
    else fill(p, { "ab-cdetail": "SRCE-1", "ab-cev": "e" });
    const r = await press(p, op);
    assert.ok(saysIn(r.slot(), `refusal.${code}`), code);
    assert.ok(!r.slot().textContent.includes("builder detail"), code);
    seen.add(r.slot().textContent);
  }
  assert.equal(seen.size, 5);
});

test("R43 opened bare, the shell's Nothing is here with the way back", async () => {
  const p = await open([], {}, "/app/about-knocker");
  assert.ok(says(p, "shell.unavailable.nothing.says"));
  assert.equal(p.byOp("sourceof").length, 0);
});
