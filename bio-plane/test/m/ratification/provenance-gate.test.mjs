/* ratification R55 (T51; K4219; provenance R66): the ratify gate runs the C-18 register arms with the record's resolver, so a
   member's standing decision on a capture's content authority is read before the document's own. Driven at the store half's
   interface (`ratifyGate`, the gate the Worker's `op=ratify` and the publish-time check both run), over the real register checks;
   the provenance stand-in's `standing` map is the one answer the record gives for the capture. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, infoMd } from "./fixture.mjs";

const B = "INFO-2026-0001-a";
const CAP = "c".repeat(64);
/* A captured document whose own authority is undetermined with no basis: C-18.9 refuses it at verified. */
const DOC = { file: "a.txt", locator: "https://example.org/a", retrieved: "2026-09-27T00:00:00Z", authority: null,
              authority_state: "undetermined", authority_basis: "",
              capture: { method: "acquire", grade: "B", actor_class: "session", sha256: CAP, encoding: "utf8", bytes: 1 },
              origin: { kind: "named_request" }, provenance_chain: [{ hop: 1, who: "the publisher" }] };

/* The C-18.9 findings the gate answers for this bundle at verified, with the record's standing decision (or none). */
async function c189(standing) {
  const w = world();
  if (standing) w.provenance.standing.set(CAP, standing);
  const md = infoMd(B).replace("current_state: collected", "current_state: verified");
  const image = { "bundle.md": md, "data/provenance.json": JSON.stringify({ documents: [DOC] }) };
  const gate = await w.r.ratifyGate({ bundleId: B, image, knownIds: new Set([B]), registers: [],
                                      publishedRegistry: null, publishedCaseRegistry: null, earnedRegistry: null });
  return gate.findings.filter((x) => x.check === "C-18.9");
}

test("R55 the ratify gate reads the document's own authority when no member has decided (control: C-18.9 refuses it)", async () => {
  const found = await c189(null);
  assert.equal(found.length, 1, JSON.stringify(found));
  assert.match(found[0].detail, /content-authority undetermined/);
});

test("R55 a member's standing decision on the capture is read before the document's own: the same bytes pass once it determines the authority", async () => {
  const found = await c189({ authority_state: "determined", authority: "City Clerk", basis: "named on the letterhead" });
  assert.deepEqual(found, [], JSON.stringify(found));
});
