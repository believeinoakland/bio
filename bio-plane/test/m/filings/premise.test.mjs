/* filings — what an action's addressee and premise put on what is prepared from it (T18, the Action layer: K590 D1,
   K600 (a)): R3's addressee blanks for every arm of `actions` R9, R8's counsel packet for an action resting on a premise
   override, and R24's disclosure on every draft, packet, communication and export prepared from one. Driven at the
   module's interface, over the real modules: each action is written through actions' own write (its R8, R9). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, PROFILE } from "./fixture.mjs";
import { FILING_BLANKS, OVERRIDE_HEAD, INBAND_RULE, unfilledMarker } from "../../../src/filings/index.mjs";

const COUNSEL = { name: "A. Counsel", organisation: "Test Chambers" };
const REASON = "the clerk refused to produce the minutes the finding needs";
const prep = (x, action, over = {}) => x.f.filingPrepare({ action, preparer: V("bo"), viewer: V("bo"), ...over });
/* The test profile with `bylaw_complaint`'s template naming every blank filings fills. */
function everyBlank(x) {
  const p = x.profile(PROFILE);
  return { ...p, id: "test-filings-blanks", action_kinds: p.action_kinds.map((k) => (k.kind === "bylaw_complaint"
    ? { ...k, template: Object.keys(FILING_BLANKS).map((n) => `${n}={{${n}}}`).join(" | ") } : k)) };
}

test("R3 the addressee's blanks follow its arm (actions R9): an office fills role and body, a reporter, organisation or group role and organisation, an audience its description; a blank its arm does not hold is left unfilled, saying which arm", () => {
  const x0 = world();
  const x = world({ profiles: [everyBlank(x0)] });
  const arms = {
    office: [{ state: "named", role: "Selectboard", body: "Port Ellery Selectboard", level: "city" },
             { counterparty_role: "Selectboard", counterparty_body: "Port Ellery Selectboard" }, ["counterparty_organisation", "counterparty_description"]],
    press: [{ state: "named", kind: "press", role: "civic reporter", organisation: "The Port Ellery Ledger" },
            { counterparty_role: "civic reporter", counterparty_organisation: "The Port Ellery Ledger" }, ["counterparty_body", "counterparty_description"]],
    organisation: [{ state: "named", kind: "organisation", role: "director", organisation: "Harbour Watch" },
                   { counterparty_role: "director", counterparty_organisation: "Harbour Watch" }, ["counterparty_body", "counterparty_description"]],
    group: [{ state: "named", kind: "group", role: "convenor", organisation: "Friends of the Common" },
            { counterparty_role: "convenor", counterparty_organisation: "Friends of the Common" }, ["counterparty_body", "counterparty_description"]],
    audience: [{ state: "audience", description: "residents of the harbour ward" },
               { counterparty_description: "residents of the harbour ward" }, ["counterparty_role", "counterparty_body", "counterparty_organisation"]],
  };
  for (const [arm, [counterparty, filled, left]] of Object.entries(arms)) {
    const A = x.action({ counterparty });
    const r = prep(x, A);
    assert.equal(r.ok, true, `${arm}: ${JSON.stringify(r).slice(0, 200)}`);
    const by = Object.fromEntries(r.blanks.map((b) => [b.name, b]));
    for (const [n, v] of Object.entries(filled)) assert.deepEqual([by[n] && by[n].value, by[n] && by[n].source], [v, A], `${arm}: ${n}`);
    const why = Object.fromEntries(r.unfilled.map((u) => [u.name, u.why]));
    for (const n of left) {
      assert.ok(r.text.includes(`${n}=${unfilledMarker(n)}`), `${arm}: ${n} left visible`);
      const article = arm === "audience" ? "an audience" : arm === "office" ? "an office" : `a ${arm}`;
      assert.ok(why[n] && why[n].includes(`addressed to ${article}`), `${arm}: ${n}: ${why[n]}`);
    }
  }
  /* undetermined: every addressee blank unfilled as undetermined, never defaulted */
  const U = x.action({ counterparty: { state: "undetermined", basis: "not yet known" } });
  const u = Object.fromEntries(prep(x, U).unfilled.map((b) => [b.name, b.why]));
  for (const n of ["counterparty_role", "counterparty_body", "counterparty_organisation", "counterparty_description"])
    assert.match(u[n], /undetermined/, n);
});

test("R8 an action stating a premise override and no live determination gets a counsel packet: assembled with R24's disclosure, its facts section saying in words that no determination is held; without the override it is refused NO_DETERMINATION", async () => {
  const x = world();
  const bare = x.action({ kind: "commitment_claim", legs: [] });
  assert.equal(x.f.counselPacket({ action: bare, counsel: COUNSEL, author: V("olive"), viewer: V("olive") }).reason, "NO_DETERMINATION");
  const O = x.action({ kind: "commitment_claim", legs: [], breach: true, override: REASON });
  const o = x.read(O).premise_override;
  assert.equal(o.reason, REASON, "actions holds the override");
  const p = x.f.counselPacket({ action: O, counsel: COUNSEL, author: V("olive"), viewer: V("olive") });
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  const line = `${OVERRIDE_HEAD} ${REASON} (stated by ${o.by} at ${o.at})`;
  assert.deepEqual([p.disclosure, p.head.disclosure], [line, line]);
  assert.deepEqual(p.sections.facts.items, []);
  assert.match(p.sections.facts.says, /no determination is held/);
  assert.match(p.sections.standards.says, /no determination is held/);
  assert.equal(p.sections.chronology.items.some((e) => /^the act: /.test(e.event)), false, "no act is set out");
  assert.equal(p.fileable, false);
  /* nothing drawn from a determination can change: no basis_changed */
  assert.equal(x.f.counselPacketRead({ id: p.id, viewer: V("bo") }).basis_changed, null);
  const e = await x.f.counselPacketExport({ id: p.id, author: V("olive"), viewer: V("olive") });
  assert.ok(e.bytes.startsWith(`${line}\n`), "first on the export's face");
  assert.deepEqual([e.inband.floors.declared], [false], "no project is drawn on, so no floor is declared");
});

test("R24 a draft, packet or communication prepared from an action carrying a premise override carries, first on its face and in every export and approved bytes, \"Rests on an unestablished premise:\" with the override's reason, author and time; one prepared from an action without one carries none", async () => {
  const x = world();
  const O = x.action({ breach: true, override: REASON });
  const o = x.read(O).premise_override;
  assert.deepEqual([typeof o.by, typeof o.at], ["string", "string"], "stamped by actions with who and when");
  const line = `${OVERRIDE_HEAD} ${REASON} (stated by ${o.by} at ${o.at})`;
  /* a filing draft: first on its face, before the template's text */
  const d = prep(x, O);
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  assert.equal(d.disclosure, line);
  assert.ok(d.text.startsWith(`${line}\n\n`));
  assert.ok(d.text.includes(o.reason) && d.text.includes(o.by) && d.text.includes(o.at));
  /* its approved bytes keep it first, even when the member's text left it out */
  const own = "To the Selectboard: the works order breaches P.E.B.L. § 12.";
  const ap = await x.f.filingApprove({ filing: d.id, text: own, author: V("bo"), viewer: V("bo") });
  assert.equal(ap.ok, true);
  assert.ok(ap.bytes.startsWith(`${line}\n\n${own}\n${INBAND_RULE}\n`));
  const ap2 = await x.f.filingApprove({ filing: prep(x, O).id, text: `${line}\n\n${own}`, author: V("bo"), viewer: V("bo") });
  assert.ok(ap2.bytes.startsWith(`${line}\n\n${own}\n${INBAND_RULE}`), "not twice");
  /* a Tier 2 draft: the disclosure first, the advisory after it */
  const T2 = x.action({ kind: "records_request", risk_tier: 2, breach: true, override: REASON, law: "Test Stat. § 1.100" });
  const t2 = prep(x, T2);
  assert.ok(t2.text.startsWith(`${OVERRIDE_HEAD} `) && t2.text.split("\n\n")[1] === t2.advisory);
  /* a communication */
  const c = x.f.communicationPrepare({ action: O, text: "A statement.", purpose: "statement", preparer: V("bo"), viewer: V("bo") });
  assert.deepEqual([c.disclosure, c.text], [line, `${line}\n\nA statement.`]);
  const ca = await x.f.filingApprove({ filing: c.id, author: V("bo"), viewer: V("bo") });
  assert.ok(ca.bytes.startsWith(`${line}\n\nA statement.\n${INBAND_RULE}`));
  /* a packet on a determined action that also carries one: the disclosure beside the facts */
  const T3 = x.action({ kind: "commitment_claim", breach: true, override: REASON });
  const p = x.f.counselPacket({ action: T3, counsel: COUNSEL, author: V("olive"), viewer: V("olive") });
  assert.ok(p.disclosure.startsWith(`${OVERRIDE_HEAD} ${REASON}`));
  assert.equal(p.sections.facts.items.length, 1, "the live determination's facts are still set out");
  /* none without an override */
  const N = x.action();
  const n = prep(x, N);
  assert.equal(n.disclosure, null);
  assert.equal(n.text.includes(OVERRIDE_HEAD), false);
  const nc = x.f.communicationPrepare({ action: N, text: "Words.", purpose: "p", preparer: V("bo"), viewer: V("bo") });
  assert.deepEqual([nc.disclosure, nc.text], [null, "Words."]);
  const np = x.f.counselPacket({ action: x.action({ kind: "commitment_claim" }), counsel: COUNSEL, author: V("olive"), viewer: V("olive") });
  assert.equal(np.disclosure, null);
  assert.equal((await x.f.counselPacketExport({ id: np.id, author: V("olive"), viewer: V("olive") })).bytes.includes(OVERRIDE_HEAD), false);
});
