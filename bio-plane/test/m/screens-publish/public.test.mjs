/* screens-publish R6 (the published case), R7 (another group's case), R8 and R16 (the docket) and R9 (the doorbell), on
 * interface-shell's served page: the two public pages drawn with no session and no credential, the imported case's
 * recreation and acts, the docket's entries, filing and posting signed with the member's key. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, fill, last, ok, refused, refusedIn, bytes, keptKey, answerSign, choose, plane, P, C, SHA, E1, DIGEST } from "./fixtures.mjs";

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
  await press(p, "publishedcase", { nth: 1 }); // the first is the evidence row's "Open the document" (R19)
  assert.ok(p.byOp("publishedcase").length > n);
  const q = await open(`/app/published/${C}`, { boot: PUBLIC, plane: { verify: ok({ published: false, sha256: SHA, matches: [] }) } });
  await press(q, "verify");
  assert.match(text(q), /does not check/);
});

const publishedWith = (captures, o = {}) => ({ publishedcase: ok({ ...plane().publishedcase.json.result, captures }), ...o });
const opens = (p) => main(p).querySelectorAll('button[data-act="publishedcase"]').filter((b) => /Open the document/.test(b.textContent));

test("R19 each evidence row with a full SHA-256 opens its bytes through publishedbytes by that hash, as a public op with no Authorization header", async () => {
  const p = await open(`/app/published/${C}`, { boot: PUBLIC });
  assert.equal(opens(p).length, 1);
  await p.click(opens(p)[0]);
  await p.settle();
  const q = last(p, "publishedbytes");
  assert.ok(q, "publishedbytes asked");
  assert.equal(q.query.sha256, E1);
  assert.equal(q.headers.Authorization, undefined, "no credential");
  assert.equal(p.files.length, 1, "the bytes are handed to the browser as a file");
  assert.equal(p.byOp("whoami").length, 0);
  for (const r of p.requests) assert.equal(r.headers.Authorization, undefined, `${r.op} carries no credential`);
});

test("R19 a row with no sha, or one that is not the full hash, draws no link (control); an upper-case hash opens by its lower-case form", async () => {
  const p = await open(`/app/published/${C}`, { boot: PUBLIC, plane: publishedWith([
    { title: "Council minutes", sha256: E1 }, { title: "Unhashed memo" }, { title: "Short hash", sha256: E1.slice(0, 12) }, { title: "Mixed", sha256: E1.toUpperCase().replace(/^C/, "c") }]) });
  assert.equal(opens(p).length, 2, "only the two rows with a full hash");
  assert.match(text(p), /Unhashed memo/);
  assert.match(text(p), /Short hash/);
  await p.click(opens(p)[1]);
  await p.settle();
  assert.equal(last(p, "publishedbytes").query.sha256, E1.toLowerCase());
  const none = await open(`/app/published/${C}`, { boot: PUBLIC, plane: publishedWith([{ title: "Unhashed memo" }]) });
  assert.equal(opens(none).length, 0);
  assert.equal(none.byOp("publishedbytes").length, 0);
});

test("R19 a refused piece of evidence says why and saves nothing (control)", async () => {
  const p = await open(`/app/published/${C}`, { boot: PUBLIC, plane: { publishedbytes: refused("NO_PUBLISHED_PART", "No published part answers to that hash.") } });
  await p.click(opens(p)[0]);
  await p.settle();
  assert.equal(p.files.length, 0);
  assert.match(text(p), /No published part answers to that hash\./);
});

const download = (p) => main(p).querySelectorAll('button[data-act="publishedcase"]').find((x) => /Download the complete edition/.test(x.textContent));

test("R19 \"Download the complete edition\" fetches the edition's file through publishedbytes by the manifest's hash as a zip, with no credential, and hands it over as a file", async () => {
  const p = await open(`/app/published/${C}`, { boot: PUBLIC, plane: { publishedbytes: bytes("PK-ZIP", "application/zip") } });
  assert.ok(download(p), "offered");
  await p.click(download(p));
  await p.settle();
  const q = last(p, "publishedbytes");
  assert.equal(q.query.sha256, SHA, "the manifest's hash");
  assert.equal(q.query.format, "zip");
  assert.equal(q.headers.Authorization, undefined);
  assert.equal(p.files.length, 1);
  assert.match(p.files[0].name, /\.zip$/);
  assert.match(text(p), /complete edition is downloaded/);
  const other = await open(`/app/published/${C}/1`, { boot: PUBLIC, plane: { publishedbytes: bytes("PK-ZIP", "application/zip") } });
  await other.click(download(other));
  await other.settle();
  assert.match(other.files[0].name, /-edition-1\.zip$/, "named for the edition the address names");
});

test("R19 a refused download says why and saves nothing; an edition with no manifest hash offers no download (controls)", async () => {
  const p = await open(`/app/published/${C}`, { boot: PUBLIC, plane: { publishedbytes: refused("PART_MISSING", "A part of the case file is missing.") } });
  await p.click(download(p));
  await p.settle();
  assert.equal(p.files.length, 0);
  assert.match(text(p), /A part of the case file is missing\./);
  const q = await open(`/app/published/${C}`, { boot: PUBLIC, plane: { publishedcase: ok({ ...plane().publishedcase.json.result, manifest_sha: "" }) } });
  assert.equal(download(q), undefined);
  const silent = await open(`/app/published/${C}`, { boot: PUBLIC, plane: { publishedbytes: ok(null) } });
  await silent.click(download(silent));
  await silent.settle();
  assert.match(text(silent), /could not be downloaded/);
});

test("R21 published opened with no id offers the group's public page, never \"Go to Home\"", async () => {
  const p = await open("/app/published", { boot: PUBLIC });
  assert.equal(p.byOp("publishedcase").length, 0);
  const home = main(p).querySelectorAll("a").map((a) => ({ href: a.getAttribute("href"), t: a.textContent }));
  assert.ok(home.some((a) => a.href === "/" && /public page/.test(a.t)), "the public page is offered");
  assert.ok(!/Go to Home/.test(text(p)), "no Go to Home");
  assert.ok(!home.some((a) => a.href === "/app"), "no way into the working frame");
  const q = await open(`/app/published/${C}`, { boot: PUBLIC });
  assert.ok(q.byOp("publishedcase").length > 0, "control: with an id it reads");
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
  const p = await open(`/app/docket/${P}/${C}`, { boot: { idb: await keptKey() } });
  await press(p, "docketpost", { reason: R });
  const lines = await answerSign(p, true, "docketpost");
  assert.ok(lines.includes(`bio-docket ${C} 3 ${DIGEST}`), "the prepared statement is what the key signs");
  carries(last(p, "docketpost").body, { digest: DIGEST, acknowledged: true });
  assert.match(last(p, "docketpost").body.signature, /^-----BEGIN SSH SIGNATURE-----/);
  const q = await open(`/app/docket/${P}/${C}`, { boot: { idb: await keptKey() } });
  await press(q, "docketpost", { reason: R });
  await answerSign(q, false);
  assert.equal(q.byOp("docketpost").length, 0);
});

test("R16 a prepared statement past its hour is prepared again before it is signed (control: within it, it is not)", async () => {
  let prepared = 0;
  const expired = { docketprepare: () => { prepared += 1; return ok({ entry: "{}", digest: DIGEST, statement: `bio-docket ${C} ${2 + prepared} ${DIGEST}\n`, warning: "", expires: prepared === 1 ? "2000-01-01T00:00:00Z" : "2999-01-01T00:00:00Z" }); } };
  const p = await open(`/app/docket/${P}/${C}`, { boot: { idb: await keptKey() }, plane: expired });
  await press(p, "docketpost", { reason: R });
  const lines = await answerSign(p, true, "docketpost");
  assert.ok(lines.includes(`bio-docket ${C} 4 ${DIGEST}`), "the fresh statement is the one signed");
  assert.ok(!lines.includes(`bio-docket ${C} 3 ${DIGEST}`), "not the stale one");
  const between = (q, n) => q.requests.slice(n, q.requests.indexOf(last(q, "docketpost"))).filter((r) => r.op === "docketprepare").length;
  const q = await open(`/app/docket/${P}/${C}`, { boot: { idb: await keptKey() } });
  const n = q.requests.length;
  await press(q, "docketpost", { reason: R });
  await answerSign(q, true, "docketpost");
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
