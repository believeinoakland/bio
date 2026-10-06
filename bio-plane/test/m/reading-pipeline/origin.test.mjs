/* reading-pipeline R1 and R11 with N615 (K1683, K1773): `read`'s recognisers are handed the capture's origin. Every
   capture `read` can be handed is a fetch the copy made, a member session's request included (K1775), or a knock,
   which carries no member session (K1776); so both of its `doctypeFor` passes (its own, R1, and `docprofile.readText`'s,
   R11) are handed `"fetch"`, whatever the document's `capture.actor_class` or request `origin` says, and a content type
   read only from a member's own capture (court-doctypes R2) never matches. Checked at `read`, over a probe content type
   that reports the origin each pass handed it, a member-only type that matches as court-doctypes R2 does, and the real
   court types. All are registered through docprofile's `registerDoctype`; this file is its own test process. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, hold, doc, withEntry } from "./fixture.mjs";
import { registerDoctype, doctypeFor } from "../../../../docprofile/registry.mjs";
import { registerCourtTypes } from "../../../../court-doctypes/index.mjs";

const MARK = "ORIGIN-PROBE-5c21";
const seen = { detect: [], parse: [] };
const originOf = (ctx) => (ctx && Object.prototype.hasOwnProperty.call(ctx, "origin") ? ctx.origin : "<absent>");
registerDoctype({
  key: "origin_probe", label: "an origin probe", version: 1, contract: null,
  detect(ctx) {
    if (!String((ctx && ctx.text) || "").includes(MARK)) return { match: false, confidence: "none", signals: [] };
    seen.detect.push(originOf(ctx));
    return { match: true, confidence: "certain", signals: [`origin ${JSON.stringify(ctx.origin ?? null)}`] };
  },
  parse(ctx) {
    seen.parse.push(originOf(ctx));
    return { entities: [{ kind: "probe", key: String(ctx.origin), label: "the origin handed in", facts: {} }] };
  },
});
const MEMBER_ONLY = "an account-gated register is read only from a member's own capture";
registerDoctype({
  key: "member_only_register", label: "a member-only register", version: 1, contract: null,
  detect(ctx) {
    if (!/Register of Actions/.test(String((ctx && ctx.text) || ""))) return { match: false, confidence: "none", signals: [] };
    if (ctx.origin !== "member") return { match: false, confidence: "none", signals: ["a register of actions"], why: MEMBER_ONLY };
    return { match: true, confidence: "certain", signals: ["a register of actions", "a member's own capture"] };
  },
  parse: () => ({ entities: [{ kind: "register", key: "r", label: "a register", facts: {} }] }),
});
registerCourtTypes(registerDoctype);

const html = (body) => `<!doctype html><html><head><title>t</title></head><body>${body}</body></html>`;
const REGISTER = html(`<h2>Register of Actions</h2><table><tr><th>Date</th><th>Description</th><th>Filed By</th></tr>`
  + `<tr><td>01/02/2026</td><td>Complaint filed</td><td>Plaintiff</td></tr></table>`);
const reset = () => { seen.detect.length = 0; seen.parse.length = 0; };

/* The shapes a document's own fields can take that must never make its origin "member": a fetch at a member
   session's request (actor_class member), a knock (actor_class member, request origin doorbell), and a request
   origin that names a member. */
const asDocs = (d) => [
  d,
  { ...d, capture: { ...d.capture, actor_class: "member", actor: "m1" } },
  { ...d, capture: { ...d.capture, actor_class: "member", actor: "m1" }, origin: { kind: "doorbell", knock_id: "k1" } },
  { ...d, origin: { kind: "member" } },
];

test("R1 (N615): text read as text: the content type's detect and its reader are each handed origin \"fetch\", whatever the document's actor class or request origin", async () => {
  const w = fresh();
  const bytes = html(`<p>${MARK}</p>`);
  const d = await hold(w.evidence, bytes);
  for (const document of asDocs(doc({ digest: d, bytes: bytes.length, fromText: true }))) {
    reset();
    const { reading } = await w.read(document);
    assert.equal(reading.content_type, "origin_probe");
    assert.equal(reading.read_from_text, true);
    assert.ok(seen.detect.length >= 1 && seen.detect.every((o) => o === "fetch"), JSON.stringify(seen.detect));
    assert.deepEqual(seen.parse, ["fetch"]);
    assert.deepEqual(reading.entities.map((e) => e.key), ["fetch"]);
  }
});

test("R11 (N615): text a format entry produced goes to readText with origin \"fetch\": its doctypeFor pass and the reader each see it", async () => {
  const w = fresh();
  const bytes = `origin entry ${MARK}`;
  const d = await hold(w.evidence, bytes);
  const entry = { format: "t3origin", text: async (b) => {
    const document = new TextDecoder().decode(b);
    return { ok: true, document, pages: [{ page: 0, text: document, undetermined: [] }], undetermined: [],
             counts: { chars: document.length, undetermined: 0 } };
  } };
  for (const document of asDocs(doc({ digest: d, bytes: bytes.length, ct: "application/x-t3origin", format: "t3origin" }))) {
    reset();
    const { reading } = await withEntry(entry, () => w.read(document));
    assert.equal(reading.content_type, "origin_probe");
    assert.equal(reading.text_tier, 1);
    assert.ok(seen.detect.length >= 1 && seen.detect.every((o) => o === "fetch"), JSON.stringify(seen.detect));
    assert.deepEqual(seen.parse, ["fetch"]);
    assert.deepEqual(reading.entities.map((e) => e.key), ["fetch"]);
  }
});

test("R1 R11 (N615, court-doctypes R2): a member-only type, and the real ecourt_roa, never match a capture read here, on either pass", async () => {
  /* The control: the member-only type does match this text when a member's own capture is stated, so its absence
     below is the origin's doing. */
  assert.equal(doctypeFor({ text: REGISTER, content_type: "text/html", origin: "member" }).type.key, "member_only_register");
  const w = fresh();
  const d = await hold(w.evidence, REGISTER);
  const entry = { format: "t3register", text: async (b) => {
    const document = new TextDecoder().decode(b);
    return { ok: true, document, pages: [{ page: 0, text: document, undetermined: [] }], undetermined: [],
             counts: { chars: document.length, undetermined: 0 } };
  } };
  for (const document of asDocs(doc({ digest: d, bytes: REGISTER.length, fromText: true, locator: "https://court.example/roa" }))) {
    const { reading } = await w.read(document);
    assert.notEqual(reading.content_type, "member_only_register");
    assert.notEqual(reading.content_type, "ecourt_roa");
  }
  for (const document of asDocs(doc({ digest: d, bytes: REGISTER.length, ct: "application/x-t3register", format: "t3register",
                                       locator: "https://court.example/roa" }))) {
    const { reading } = await withEntry(entry, () => w.read(document));
    assert.notEqual(reading.content_type, "member_only_register");
    assert.notEqual(reading.content_type, "ecourt_roa");
  }
});
