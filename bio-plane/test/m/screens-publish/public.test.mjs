/* screens-publish R6 (the published case), R7 (another group's case), R8 and R16 (the docket) and R9 (the doorbell), on
 * interface-shell's served page: the two public pages drawn with no session and no credential, the imported case's
 * recreation and acts, the docket's entries, filing and posting signed with the member's key. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, fill, last, ok, refused, refusedIn, signer, choose, P, C, SHA, DIGEST } from "./fixtures.mjs";

const carries = (body, want) => { for (const [k, v] of Object.entries(want)) assert.deepEqual(body[k], v, k); };
const R = "because";
const PUBLIC = { session: null };

test("R6 the published case at /app/published/<case>, in the public frame with no session: findings with two strengths and the bar, dated", async () => {
  const p = await open(`/app/published/${C}`, { boot: PUBLIC });
  assert.equal(p.byOp("whoami").length, 0, "no session read");
  for (const r of p.requests) assert.equal(r.headers.Authorization, undefined, `${r.op} carries no credential`);
  assert.equal(last(p, "publishedcase").query.id, C);
  const t = text(p);
  assert.match(t, /Edition 2 · signed 18 November 2026 · published 19 November 2026 · Edition 1/);
  assert.match(t, /This case is the work of River Town\..*two strengths/);
  assert.match(t, /The 2024 adjustments were made without the council vote the lease requires\..*CaptureB.*ConnectionC.*meets this project's bar/);
  assert.match(t, /Council approves amendment 1.*12 January 2024/);
  assert.match(t, /The City Administrator.*signed the March 2024 adjustment/);
  assert.match(t, /Council minutes, 12 January 2024/);
  assert.ok(main(p).querySelector(`a[href="/app/published/${encodeURIComponent(C + "/1")}"]`), "the other edition links its page");
});

test("R6 \"Check the signature\" (verify, the manifest's sha) and \"Read the case\", with no account; a mismatch is said (control)", async () => {
  const p = await open(`/app/published/${C}`, { boot: PUBLIC });
  await press(p, "verify");
  assert.equal(last(p, "verify").query.sha256, SHA);
  assert.equal(last(p, "verify").headers.Authorization, undefined);
  assert.match(text(p), /The signature checks/);
  const n = p.byOp("publishedcase").length;
  await press(p, "publishedcase");
  assert.ok(p.byOp("publishedcase").length > n);
  const q = await open(`/app/published/${C}`, { boot: PUBLIC, plane: { verify: ok({ published: false, sha256: SHA, matches: [] }) } });
  await press(q, "verify");
  assert.match(text(q), /does not check/);
});

test("R7 another group's case: each finding recreated, in part or not, read-only, with the four acts", async () => {
  const p = await open("/app/imported/IMP-2026-0001");
  assert.equal(last(p, "importedcase").query.import, "IMP-2026-0001");
  const r = main(p).querySelectorAll("[data-r]").map((x) => x.getAttribute("data-r"));
  assert.deepEqual(r, ["yes", "part", "no"]);
  assert.match(text(p), /Recreated.*Recreated in part.*Did not recreate/);
  assert.deepEqual(ops(p).sort(), ["caseimport", "importaccept", "importflag", "importwatch"]);
  await press(p, "importaccept", { values: { "im-checked": "Each document's hash against theirs.", "im-reason": "It recreated whole." } });
  carries(last(p, "importaccept").body, { import: "IMP-2026-0001", edition: 2, findings: ["FND-W-1"], checked: "Each document's hash against theirs.", reason: "It recreated whole." });
  await press(p, "importflag", { values: { "im-issue": "Their arrears figure double-counts March." }, reason: R });
  carries(last(p, "importflag").body, { import: "IMP-2026-0001", edition: 2, issue: "Their arrears figure double-counts March." });
  await press(p, "importwatch", { values: { "im-publisher": "http://not-https.example" }, reason: R });
  assert.equal(p.byOp("importwatch").length, 0, "an address that is not https sends nothing (control)");
  await press(p, "importwatch", { values: { "im-publisher": "https://westoakland.example" }, reason: R });
  carries(last(p, "importwatch").body, { import: "IMP-2026-0001", publisher: "https://westoakland.example" });
});

test("R7 \"Import a case\" sends the chosen file's bytes as one part and opens the import", async () => {
  const p = await open("/app/imported", { plane: { caseimport: ok({ import: "IMP-2026-0002", recreation: {} }) } });
  assert.match(text(p), /Port lease revenue/);
  choose(p, "im-file", new Uint8Array([1, 2, 3]));
  await press(p, "caseimport", { reason: R });
  assert.deepEqual(last(p, "caseimport").body.parts, ["AQID"]);
  assert.equal(p.location.pathname, "/app/imported/IMP-2026-0002");
});

test("R8 the docket's entries, each drafted or posted; \"File a docket entry\" with the member's reason for the record or public choice", async () => {
  const p = await open(`/app/docket/${P}/${C}`);
  assert.equal(last(p, "docket").query.case, C);
  const t = text(p);
  assert.match(t, /Edition · Edition 2 published, superseding Edition 1.*posted/);
  assert.match(t, /Court order · Order of 20 November: seal exhibit 4.*drafted, not yet posted/);
  assert.equal(last(p, "docketprepare").query.entry, "2", "the draft entry is prepared for its post");
  await press(p, "docketfile", { values: { "dk-kind": "response", "dk-from": "Port of Oakland", "dk-summary": "The Port disputes finding 1.", "dk-proposed": "public", "dk-reason": "It answers a published finding." } });
  carries(last(p, "docketfile").body, { case: C, kind: "response", from: { kind: "other", name: "Port of Oakland" }, summary: "The Port disputes finding 1.", proposed: "public", reason: "It answers a published finding." });
});

test("R8 R16 \"Post it, signed\": docketStatement in NS_DOCKET through the signer kit, posted with its digest; declined, nothing is sent", async () => {
  const s = signer();
  const p = await open(`/app/docket/${P}/${C}`, { boot: { signer: s } });
  await press(p, "docketpost", { reason: R });
  assert.deepEqual(s.asked[0], [{ label: "docket " + C, text: `bio-docket ${C} 3 ${DIGEST}\n`, namespace: "bio-docket" }]);
  carries(last(p, "docketpost").body, { digest: DIGEST, signature: "-----BEGIN SSH SIGNATURE-----SIG0", acknowledged: true });
  const q = await open(`/app/docket/${P}/${C}`, { boot: { signer: signer({ decline: true }) } });
  await press(q, "docketpost", { reason: R });
  assert.equal(q.byOp("docketpost").length, 0);
});

test("R16 a prepared statement past its hour is prepared again before it is signed (control: within it, it is not)", async () => {
  let prepared = 0;
  const expired = { docketprepare: () => { prepared += 1; return ok({ entry: "{}", digest: DIGEST, statement: `bio-docket ${C} ${2 + prepared} ${DIGEST}\n`, warning: "", expires: prepared === 1 ? "2000-01-01T00:00:00Z" : "2999-01-01T00:00:00Z" }); } };
  const s = signer();
  const p = await open(`/app/docket/${P}/${C}`, { boot: { signer: s }, plane: expired });
  await press(p, "docketpost", { reason: R });
  assert.equal(s.asked[0][0].text, `bio-docket ${C} 4 ${DIGEST}\n`, "the fresh statement is the one signed");
  const between = (q, n) => q.requests.slice(n, q.requests.indexOf(last(q, "docketpost"))).filter((r) => r.op === "docketprepare").length;
  assert.equal(between(p, p.requests.indexOf(p.byOp("docketprepare")[0]) + 1), 1, "prepared again before the post");
  const q = await open(`/app/docket/${P}/${C}`, { boot: { signer: signer() } });
  const n = q.requests.length;
  await press(q, "docketpost", { reason: R });
  assert.equal(between(q, n), 0, "within its hour, not prepared again");
});

test("R9 the doorbell at /app/doorbell with no session: headed by the group's public name, what happens to what is sent", async () => {
  const p = await open("/app/doorbell", { boot: PUBLIC });
  assert.equal(p.byOp("whoami").length, 0);
  assert.ok(p.byOp("groupidentity").length > 0);
  const t = text(p);
  assert.match(t, /Hand material to River Town/);
  assert.match(t, /go only to this group's own Civicsmith.*A member reads them and decides.*secret phrase.*without anyone knowing who you are.*beyond a court's reach/);
  assert.ok(p.doc.getElementById("db-file") && p.doc.getElementById("db-note") && p.doc.getElementById("db-secret"));
});

test("R9 R11 \"Hand it over\" sends the file, note and phrase with no credential, says it was received, and keeps no phrase", async () => {
  const phrase = "SENTINEL-PHRASE-correct-horse-battery";
  const p = await open("/app/doorbell", { boot: PUBLIC });
  choose(p, "db-file", new Uint8Array([104, 105]));
  await press(p, "knock", { values: { "db-note": "Inspection sheets.", "db-secret": phrase } });
  const k = last(p, "knock");
  assert.equal(k.headers.Authorization, undefined);
  carries(k.body, { contentB64: "aGk=", note: "Inspection sheets.", knockerSecret: phrase });
  assert.ok(main(p).querySelector("[data-received]"));
  assert.equal(p.doc.getElementById("db-secret").value, "", "the phrase field is cleared");
  for (const v of [...p.store.values(), ...p.local.values()]) assert.ok(!String(v).includes(phrase));
  const later = p.requests.filter((r) => r !== k);
  for (const r of later) assert.ok(!JSON.stringify([r.url, r.body]).includes(phrase), "no other request carries it");
});

test("R9 the knock's refusals are drawn by their words; nothing chosen sends nothing (control)", async () => {
  const p = await open("/app/doorbell", { boot: PUBLIC });
  const { slot } = await press(p, "knock");
  assert.equal(p.byOp("knock").length, 0);
  assert.match(slot().textContent, /Choose a file/);
  for (const [code, words] of [["KNOCK_EMPTY", /Choose a file/], ["KNOCK_PAYLOAD_TOO_LARGE", /too large/], ["KNOCK_ENVELOPE_TOO_LARGE", /too large/], ["RATE_IP", /Too many/]]) {
    const q = await open("/app/doorbell", { boot: PUBLIC, plane: { knock: refused(code, null, 413) } });
    choose(q, "db-file", new Uint8Array([1]));
    const r = await press(q, "knock");
    assert.match(r.slot().textContent, words, code);
    assert.equal(q.doc.getElementById("db-note").value, "", code);
  }
});
