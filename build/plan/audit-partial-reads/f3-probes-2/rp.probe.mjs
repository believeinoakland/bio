import test from "node:test";
import { realChain } from "./mp.mjs";
const DOCID = "INFO-2026-0001-a";
const ch = await realChain("b", { id: DOCID });      /* the real chain's provenance, 3 parts + whole */
globalThis.REALPROV = ch.w.prov;
const { world, LAYER, Q, Q2, DOC, ALICE, sha } = await import("./rp-fx.mjs");
const AK = "class:ai/k1";
const P1 = { kind: "pdf-page", page: 0, ref: "page 1" };
const TEXT = ["The Board approved ordinance 12 on 3 March 2026, for $4,500.", "Minutes of the Clerk, page two."];
const kind = (s, m) => s === m.whole ? "WHOLE" : m.held.some((h) => h.sha256 === s) ? "PART" : s;
test("run-productions whole", () => {
  const m = ch.m, W = m.whole, part0 = m.held[0].sha256;
  const w = world();
  w.inquiry(Q); w.inquiry(Q2);
  console.log("capturesOf", JSON.stringify(ch.w.prov.capturesOf(DOC).map((c) => kind(c.capture_sha, m))), "captureFor", kind(w.content.captureFor(DOC), m));
  w.mpdoc(DOC, ch);
  w.units(W, TEXT);
  w.run("RUN-E", { mode: "extract", principal_plane: AK, mints: 10, pages: 3 });
  /* 660 #heldDocument via extractPropose */
  const r = w.p.extractPropose({ run: "RUN-E", bundleId: DOC, fn: "propose-reading", version: "0.1.0", refs: [{ ref: "the board", label: "The Board", quote: "The Board approved", source: P1 }], proposedBy: AK, viewer: ALICE, caller: AK });
  console.log("660 extractPropose", r.ok, r.code ?? "", "proposed", r.proposed?.length, "verified", r.proposed?.[0]?.verified_quote, "earned", r.proposed?.[0]?.earned);
  const cid = r.proposed?.[0]?.content_id;
  console.log("   minted content row capture", cid ? kind(w.row(`SELECT capture_sha FROM content WHERE content_id=?`, cid)?.capture_sha, m) : "none");
  /* 1230 machinePassage */
  const read = (leg) => w.p.machinePassage({ legs: [leg], author: ALICE, viewer: ALICE });
  const sum = (x) => x == null ? "null(stands)" : x.code + " legs=" + JSON.stringify((x.legs || []).map((l) => l.proposals?.length));
  console.log("1230 machinePassage by id", sum(read({ ord: 0, target: DOC, content_id: cid })));
  const extent = { extent_kind: "pdf-page", extent_page: 0 };
  console.log("1230   by part (no capture named; presented now)", sum(read({ ord: 1, target: DOC, ...extent })));
  console.log("1230   extent_capture=WHOLE", sum(read({ ord: 2, target: DOC, ...extent, extent_capture: W })));
  console.log("1230   extent_capture=PART0", sum(read({ ord: 3, target: DOC, ...extent, extent_capture: part0 })));
  /* bearingNote 1290 */
  const note = (capture) => w.p.bearingNote({ capture, question: Q, run: "RUN-E", viewer: ALICE, caller: AK, sentences: [{ text: "It records the approval.", quote: "The Board approved", source: P1 }] });
  const nw = note(W), np = note(part0);
  console.log("1290 bearingNote capture=WHOLE", nw.ok ?? "", nw.kept ?? "", nw.code ?? "", "| capture=PART0", np.ok, np.code ?? np.kept);
  /* suggest 420/423 */
  w.run("RUN-S", { context_id: Q2 });
  const LEG = (over) => ({ target: DOC, role: "supports", ground: "paper", ...over });
  const PART = [{ ground: "paper", statement: "the paper trail of the approval" }];
  for (const [n, leg] of [["no capture named", LEG({})], ["extent_capture=WHOLE", LEG({ extent_capture: W })], ["extent_capture=PART0", LEG({ extent_capture: part0 })]]) {
    const s = w.suggest({ target: Q2, kind: "basis-version", run: "RUN-S", name: "read " + n.length, legs: [leg], grounds: PART });
    console.log("420/423 suggest", n, s.ok, s.code ?? "", s.ok ? "" : (s.detail || "").slice(0, 110));
  }
});
