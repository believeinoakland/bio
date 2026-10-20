/* case-inputs R20–R26, R28 (T51; K4169, K4171, K4185; UC-101): a case's standard details, beside the case and never in its
   signed document. Driven at the module's interface over the real modules of its fixture: the service, the ops map as the
   door calls it, and the public read through public-read's own door. The sentences are read from the module's word table
   (CASE_DETAILS_WORDS) by equality, never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, SLUG } from "./fixture.mjs";
import { caseInputsOps, registerCaseInputsPublicReads, CASE_DETAILS_FIELDS, CASE_DETAILS_WORDS, CASE_DETAILS_HISTORY_MAX, DETAILS_LIMITS, RELATIONS,
         fillDetails } from "../../../src/case-inputs/index.mjs";

/* alice owns Team and joined bo and cy; dee belongs to nothing, so the hidden project is nothing to dee. */
function setup() {
  const w = world();
  for (const m of ["alice", "bo", "cy", "dee"]) w.member(m);
  const P = w.project("Team", "alice");
  w.join(P, "bo"); w.join(P, "cy");
  const prepared = w.prepare(P, "alice");
  const published = w.ratifiedCase(P, "alice");
  return { w, P, prepared: prepared.caseId, published };
}
const set = (w, caseId, field, value, who = "alice") => w.ci.caseDetailsSet({ case: caseId, field, value, by: who, viewer: V(who) });
const AREA = [{ words: "The harbour authority" }];
const CONTACT = { kind: "doorbell" };
const NONE = { none: true };
const line = (n) => "x".repeat(n);

test("R20: an owner sets each of the four fields of a prepared case and of a published one, and the answer is {ok, case, field, value, at}", () => {
  const { w, prepared, published } = setup();
  const values = { area: AREA, contact: CONTACT, related: [{ relation: "builds_on", url: "https://example.org/a" }], relationships: NONE };
  assert.deepEqual([...CASE_DETAILS_FIELDS], ["area", "contact", "related", "relationships"]);
  for (const id of [prepared, published])
    for (const field of CASE_DETAILS_FIELDS) {
      const r = set(w, id, field, values[field]);
      assert.deepEqual(Object.keys(r).sort(), ["at", "case", "field", "ok", "value"]);
      assert.equal(r.ok, true); assert.equal(r.case, id); assert.equal(r.field, field);
      assert.deepEqual(r.value, values[field]); assert.equal(typeof r.at, "string");
    }
  assert.equal(w.count("case_details"), 8);
  assert.deepEqual(set(w, published, "contact", null).value, null, "a clear answers null");
});

test("R20: each refusal in turn writes nothing, and the same call by the owner succeeds (the control)", () => {
  const { w, P, prepared, published } = setup();
  const none = () => w.count("case_details");
  const ask = (over = {}) => w.ci.caseDetailsSet({ case: published, field: "area", value: AREA, by: "alice", viewer: V("alice"), ...over });
  const refused = (r, reason) => { assert.equal(r.ok, false); assert.equal(r.reason, reason); assert.equal(none(), 0, `${reason} wrote nothing`); };
  /* a machine, an operator token or an unstamped by */
  for (const by of [MACHINE, "class:ai", "", null, undefined]) refused(ask({ by }), "MACHINE_CANNOT_SET_DETAILS");
  /* no case, a case the viewer cannot see: one answer, byte for byte */
  const absent = ask({ case: "CASE-2026-9999" });
  refused(absent, "NO_SUCH_CASE");
  const unseen = ask({ by: "dee", viewer: V("dee") });
  refused(unseen, "NO_SUCH_CASE");
  assert.deepEqual(unseen, absent, "a case the viewer cannot see is answered as one that does not exist");
  refused(w.ci.caseDetailsSet({ case: null, field: "area", value: AREA, by: "alice", viewer: V("alice") }), "NO_SUCH_CASE");
  refused(ask({ viewer: null }), "NO_SUCH_CASE");
  /* a project seen only at existence: C-70.1, once the project is discoverable */
  assert.equal(w.membership.projectVisibilitySet({ projectId: P, setting: "discoverable", by: "alice", viewer: V("alice") }).ok, true);
  const seen = ask({ by: "dee", viewer: V("dee") });
  refused(seen, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  assert.equal(seen.check, "C-70.1");
  /* an owner only: a joined participant, an administrator */
  const notOwner = ask({ by: "bo", viewer: V("bo") });
  refused(notOwner, "NOT_THE_PROJECT_OWNER");
  assert.equal(notOwner.detail, CASE_DETAILS_WORDS.notOwner);
  w.member("root", { role: "admin" });
  refused(ask({ by: "root", viewer: V("root") }), "NOT_THE_PROJECT_OWNER");
  /* the field, then the value */
  for (const field of ["classification", "bogus", "", null, 5]) refused(ask({ field }), "DETAILS_FIELD_UNKNOWN");
  for (const value of [undefined, "text", 5, [], {}, [{ words: "" }]]) refused(ask({ value }), "DETAILS_MALFORMED");
  /* the order: machine, case, owner, field, value */
  refused(ask({ by: MACHINE, case: "CASE-2026-9999" }), "MACHINE_CANNOT_SET_DETAILS");
  refused(ask({ by: "bo", viewer: V("dee"), case: "CASE-2026-9999" }), "NO_SUCH_CASE");
  refused(ask({ by: "bo", viewer: V("bo"), field: "bogus", value: undefined }), "NOT_THE_PROJECT_OWNER");
  refused(ask({ field: "bogus", value: undefined }), "DETAILS_FIELD_UNKNOWN");
  /* control: the owner's call, as asked, on the prepared case too */
  assert.equal(ask().ok, true);
  assert.equal(none(), 1);
  assert.equal(ask({ case: prepared }).ok, true);
  assert.equal(none(), 2);
});

test("R20: a case with neither an unsigned preparation nor a published edition is NO_SUCH_CASE, the same bytes as a case the caller cannot see", () => {
  const { w, P, published } = setup();
  const a = set(w, "CASE-2026-4242", "area", AREA);
  const b = set(w, published, "area", AREA, "dee");
  assert.equal(a.reason, "NO_SUCH_CASE");
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  /* control: a case that exists, seen by its owner */
  assert.equal(set(w, published, "area", AREA).ok, true);
  assert.ok(P);
});

test("R21: each shape is accepted at its bounds and refused one past, naming the part", () => {
  const { w, published } = setup();
  const L = DETAILS_LIMITS;
  const good = (field, value) => { const r = set(w, published, field, value); assert.equal(r.ok, true, `${field} ${JSON.stringify(value).slice(0, 80)}: ${JSON.stringify(r).slice(0, 200)}`); };
  const bad = (field, value, part) => {
    const r = set(w, published, field, value);
    assert.equal(r.reason, "DETAILS_MALFORMED", `${field} ${JSON.stringify(value).slice(0, 80)}`);
    assert.equal(r.part, part); assert.equal(r.field, field);
    assert.equal(r.detail, fillDetails("malformed", { field, part }));
  };
  const entry = (i) => ({ words: `Body ${i}` });
  /* area */
  good("area", Array.from({ length: L.areaEntries }, (_, i) => entry(i)));
  bad("area", Array.from({ length: L.areaEntries + 1 }, (_, i) => entry(i)), "area");
  bad("area", [], "area"); bad("area", "x", "area"); bad("area", [5], "area[0]");
  good("area", [{ words: line(L.areaWords) }]);
  bad("area", [{ words: line(L.areaWords + 1) }], "area[0].words");
  bad("area", [{ words: "" }], "area[0].words"); bad("area", [{ words: "  " }], "area[0].words"); bad("area", [{}], "area[0].words");
  bad("area", [{ words: "two\nlines" }], "area[0].words"); bad("area", [{ words: "ok" }, { words: 5 }], "area[1].words");
  bad("area", [{ words: "ok", classification: "facts" }], "area[0].classification");
  good("area", [{ words: "ok", entity: null }]);
  /* contact */
  good("contact", CONTACT);
  good("contact", { kind: "text", text: line(L.contactText) });
  bad("contact", { kind: "text", text: line(L.contactText + 1) }, "contact.text");
  bad("contact", { kind: "text", text: "" }, "contact.text"); bad("contact", { kind: "text", text: "a\nb" }, "contact.text");
  bad("contact", { kind: "text" }, "contact.text"); bad("contact", { kind: "member", text: "Ada" }, "contact.kind");
  bad("contact", { kind: "doorbell", text: "also" }, "contact.text"); bad("contact", "doorbell", "contact"); bad("contact", [CONTACT], "contact");
  /* related */
  const rel = (i) => ({ relation: "other", url: `https://example.org/${i}` });
  good("related", Array.from({ length: L.relatedEntries }, (_, i) => rel(i)));
  bad("related", Array.from({ length: L.relatedEntries + 1 }, (_, i) => rel(i)), "related");
  bad("related", [], "related");
  for (const relation of RELATIONS) good("related", [{ relation, url: "https://example.org/x" }]);
  bad("related", [{ relation: "cites", url: "https://example.org/x" }], "related[0].relation");
  bad("related", [{ relation: "other" }], "related[0].case_ref");
  good("related", [{ relation: "same_matter", case_ref: { group: "oakland-water", case: "CASE-2026-0001" } }]);
  good("related", [{ relation: "same_matter", case_ref: { group: "oakland-water", case: "CASE-2026-0001", edition: 2 }, url: "https://example.org/x", words: line(L.relatedWords) }]);
  bad("related", [{ relation: "other", url: "https://example.org/x", words: line(L.relatedWords + 1) }], "related[0].words");
  bad("related", [{ relation: "other", url: "https://example.org/x", words: "" }], "related[0].words");
  bad("related", [{ relation: "other", case_ref: { group: "Oakland", case: "C" } }], "related[0].case_ref.group");
  bad("related", [{ relation: "other", case_ref: { group: "oakland-water", case: "" } }], "related[0].case_ref.case");
  bad("related", [{ relation: "other", case_ref: { group: "oakland-water", case: line(L.caseRef + 1) } }], "related[0].case_ref.case");
  bad("related", [{ relation: "other", case_ref: { group: "oakland-water", case: "C-1", edition: 0 } }], "related[0].case_ref.edition");
  bad("related", [{ relation: "other", case_ref: { group: "oakland-water", case: "C-1", sha: "x" } }], "related[0].case_ref");
  good("related", [{ relation: "other", url: `https://example.org/${line(L.relatedUrl - "https://example.org/".length)}` }]);
  bad("related", [{ relation: "other", url: `https://example.org/${line(L.relatedUrl - "https://example.org/".length + 1)}` }], "related[0].url");
  bad("related", [{ relation: "other", url: "http://example.org/x" }], "related[0].url");
  bad("related", [{ relation: "other", url: "https://exa mple.org/x" }], "related[0].url");
  bad("related", [{ relation: "other", url: "https://" }], "related[0].url");
  /* relationships */
  good("relationships", NONE);
  bad("relationships", { none: false }, "relationships.none"); bad("relationships", { none: true, items: [] }, "relationships.none");
  bad("relationships", { items: [] }, "relationships.items"); bad("relationships", {}, "relationships.items");
  bad("relationships", [], "relationships");
  const item = (i) => ({ with: `Party ${i}`, nature: "a contract" });
  good("relationships", { items: Array.from({ length: L.relationshipItems }, (_, i) => item(i)) });
  bad("relationships", { items: Array.from({ length: L.relationshipItems + 1 }, (_, i) => item(i)) }, "relationships.items");
  good("relationships", { items: [{ with: line(L.relationshipWith), nature: line(L.relationshipNature) }] });
  bad("relationships", { items: [{ with: line(L.relationshipWith + 1), nature: "n" }] }, "relationships.items[0].with");
  bad("relationships", { items: [{ with: "w", nature: line(L.relationshipNature + 1) }] }, "relationships.items[0].nature");
  bad("relationships", { items: [{ with: "", nature: "n" }] }, "relationships.items[0].with");
  bad("relationships", { items: [{ with: "w", nature: "" }] }, "relationships.items[0].nature");
  bad("relationships", { items: [{ with: "w", nature: "a\nb" }] }, "relationships.items[0].nature");
  bad("relationships", { items: [{ with: "w", nature: "n", extra: 1 }] }, "relationships.items[0].extra");
  bad("relationships", { items: [{ with: "w" }] }, "relationships.items[0].nature");
  /* K4185: no classification */
  for (const value of ["facts", "analysis", "judgment", "combination"]) assert.equal(set(w, published, "classification", value).reason, "DETAILS_FIELD_UNKNOWN");
});

test("R21: {none: true} is stated, and an absent field is not stated: they read differently", () => {
  const { w, published } = setup();
  const before = w.ci.caseDetails({ case: published, viewer: V("alice") }).details.relationships;
  assert.deepEqual(before, { stated: false, value: null, set_by: null, set_at: null });
  set(w, published, "relationships", NONE);
  const after = w.ci.caseDetails({ case: published, viewer: V("alice") }).details.relationships;
  assert.equal(after.stated, true);
  assert.deepEqual(after.value, NONE);
  assert.notDeepEqual(after, before);
});

test("R21: an area entry's entity is one this team holds: an entity it does not hold is refused, the same entry with a held one is accepted (control)", () => {
  const { w, published } = setup();
  const held = w.entities.createEntity({ kind: "institution", label: "Oakland City Council", note: "the city council", declaredBy: "alice" });
  assert.equal(held.ok !== false, true, JSON.stringify(held));
  const unheld = set(w, published, "area", [{ entity: "ENT-2026-9999", words: "The council" }]);
  assert.equal(unheld.reason, "DETAILS_MALFORMED");
  assert.equal(unheld.part, "area[0].entity");
  assert.equal(w.count("case_details"), 0);
  assert.equal(set(w, published, "area", [{ words: "ok" }, { entity: "", words: "The council" }]).part, "area[1].entity", "an empty id holds nothing");
  assert.equal(set(w, published, "area", [{ entity: 5, words: "The council" }]).part, "area[0].entity");
  const ok = set(w, published, "area", [{ entity: held.entity_id, words: "The council" }]);
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.equal(ok.value[0].entity, held.entity_id);
});

test("R22: two sets then a clear read back as stated, replaced, not stated, with the history in order; a clear of one field leaves the other three", () => {
  const { w, published } = setup();
  const read = () => w.ci.caseDetails({ case: published, viewer: V("alice") });
  const A = [{ words: "Housing" }], B = [{ words: "Housing" }, { words: "Planning" }];
  set(w, published, "area", A);
  assert.deepEqual(read().details.area.value, A);
  set(w, published, "area", B);
  assert.deepEqual(read().details.area.value, B, "replaced: the latest entry stands");
  set(w, published, "contact", CONTACT);
  set(w, published, "relationships", NONE);
  set(w, published, "related", [{ relation: "other", url: "https://example.org/x" }]);
  set(w, published, "area", null);
  const r = read();
  assert.equal(r.details.area.stated, false, "cleared: not stated");
  assert.deepEqual(r.details.area.value, null);
  for (const f of ["contact", "related", "relationships"]) assert.equal(r.details[f].stated, true, `${f} untouched by the clear of area`);
  assert.deepEqual(r.history.map((h) => [h.field, h.value]),
    [["area", A], ["area", B], ["contact", CONTACT], ["relationships", NONE], ["related", [{ relation: "other", url: "https://example.org/x" }]], ["area", null]]);
  assert.deepEqual([...new Set(r.history.map((h) => h.by))], ["h_alice"]);
  assert.equal(w.count("case_details"), 6, "append-only: nothing replaced or removed");
  /* a set after a clear stands again */
  set(w, published, "area", A);
  assert.equal(read().details.area.stated, true);
});

test("R23: the owner and a joined participant read the four standing values and the history; a viewer with no sight gets the bytes of an absent case", () => {
  const { w, prepared, published } = setup();
  for (const id of [prepared, published]) set(w, id, "contact", CONTACT);
  set(w, published, "area", AREA);
  for (const who of ["alice", "bo", "cy"]) {
    const r = w.ci.caseDetails({ case: published, viewer: V(who) });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.details), [...CASE_DETAILS_FIELDS]);
    assert.deepEqual(r.details.contact, { stated: true, value: CONTACT, set_by: "h_alice", set_at: r.history[0].at });
    assert.deepEqual(r.details.related, { stated: false, value: null, set_by: null, set_at: null });
    assert.deepEqual(r.history.map((h) => h.field), ["contact", "area"]);
    assert.equal(r.truncated, false);
    assert.equal(r.published, true);
  }
  assert.equal(w.ci.caseDetails({ case: prepared, viewer: V("bo") }).published, false, "a preparation is read too");
  assert.equal(w.ci.caseDetails({ case: prepared, viewer: V("bo") }).history.length, 1, "each case its own entries");
  const absent = JSON.stringify(w.ci.caseDetails({ case: "CASE-2026-9999", viewer: V("alice") }));
  for (const viewer of [V("dee"), "class:none", "", null, undefined])
    assert.equal(JSON.stringify(w.ci.caseDetails({ case: published, viewer })), absent, `viewer ${viewer}`);
  assert.equal(JSON.parse(absent).reason, "NO_SUCH_CASE");
  assert.equal(w.ci.caseDetails({ case: null, viewer: V("alice") }).reason, "NO_SUCH_CASE");
  /* it writes nothing */
  const snap = w.snapshot();
  w.ci.caseDetails({ case: published, viewer: V("alice") });
  assert.deepEqual(w.snapshot(), snap);
});

test("R23: the history lists the latest CASE_DETAILS_HISTORY_MAX entries in order and says it was cut, while the standing values stay the latest", () => {
  const { w, published } = setup();
  for (let i = 0; i <= CASE_DETAILS_HISTORY_MAX; i++) set(w, published, "area", [{ words: `entry ${i}` }]);
  const r = w.ci.caseDetails({ case: published, viewer: V("alice") });
  assert.equal(r.truncated, true);
  assert.equal(r.history.length, CASE_DETAILS_HISTORY_MAX);
  assert.deepEqual(r.history[0].value, [{ words: "entry 1" }], "the oldest entry is the one cut");
  assert.deepEqual(r.history.at(-1).value, [{ words: `entry ${CASE_DETAILS_HISTORY_MAX}` }]);
  assert.deepEqual(r.details.area.value, [{ words: `entry ${CASE_DETAILS_HISTORY_MAX}` }]);
  /* control: exactly the bound is not cut */
  const w2 = setup();
  for (let i = 0; i < CASE_DETAILS_HISTORY_MAX; i++) set(w2.w, w2.published, "area", [{ words: `entry ${i}` }]);
  assert.equal(w2.w.ci.caseDetails({ case: w2.published, viewer: V("alice") }).truncated, false);
});

test("R24: a published case with two fields set answers them through public-read, stated: false for the other two, the team's slug and the sentence that these are its current statement; no member id or handle appears in any public answer", () => {
  const { w, prepared, published } = setup();
  set(w, published, "area", AREA); set(w, published, "contact", CONTACT);
  /* registered once at start with public-read R18 under casedetailspublic, taking the case */
  assert.deepEqual(w.publicReadsRegistration, { ok: true, module: "case-inputs", names: ["casedetailspublic"] });
  assert.deepEqual(w.publicRead.publicReads().filter((r) => r.name === "casedetailspublic"),
    [{ name: "casedetailspublic", module: "case-inputs", params: ["case"] }]);
  const served = w.publicRead.publicRead("casedetailspublic", { case: published, viewer: V("alice"), by: "alice" });
  assert.equal(served.ok, true);
  const r = served.result;
  assert.deepEqual(r, w.ci.caseDetailsPublic({ case: published }), "the door serves the module's own answer");
  assert.equal(r.group, SLUG);
  assert.equal(r.sentence, CASE_DETAILS_WORDS.publicCurrent);
  assert.deepEqual(Object.keys(r.details), [...CASE_DETAILS_FIELDS]);
  assert.equal(r.details.area.stated, true); assert.deepEqual(r.details.area.value, AREA);
  assert.equal(r.details.contact.stated, true); assert.deepEqual(r.details.contact.value, CONTACT);
  for (const f of ["related", "relationships"]) {
    assert.deepEqual(r.details[f], { stated: false, value: null, set_at: null, says: CASE_DETAILS_WORDS.notStated }, f);
  }
  assert.equal(r.details.area.says, undefined, "a stated field carries no not-stated sentence");
  /* registered once per host: a second call answers the same registration and registers nothing more; creating the instance registers nothing */
  let calls = 0;
  const stub = { registerPublicReads: (m, reads) => { calls++; return { ok: true, module: m, names: Object.keys(reads) }; } };
  const other = world({ publicReads: false });
  const first = registerCaseInputsPublicReads(other.host, { publicRead: stub });
  assert.equal(registerCaseInputsPublicReads(other.host, { publicRead: stub }), first);
  assert.equal(calls, 1);
  assert.deepEqual(first, { ok: true, module: "case-inputs", names: ["casedetailspublic"] });
  assert.equal(w.ci.publicReadsRegistration, undefined, "the instance registers nothing itself");
  /* control: an unsigned preparation answers NOT_PUBLISHED and nothing of it, the bytes of an id that never existed */
  set(w, prepared, "area", [{ words: "A secret preparation" }]);
  const prep = w.ci.caseDetailsPublic({ case: prepared });
  const never = w.ci.caseDetailsPublic({ case: "CASE-2026-9999" });
  assert.equal(prep.ok, false); assert.equal(prep.reason, "NOT_PUBLISHED"); assert.equal(prep.check, "C-98.8");
  assert.equal(JSON.stringify(prep), JSON.stringify(never));
  assert.equal(JSON.stringify(prep).includes("secret"), false);
  assert.equal(w.ci.caseDetailsPublic({ case: null }).reason, "NOT_PUBLISHED");
  assert.equal(w.publicRead.publicRead("casedetailspublic", { case: prepared }).reason, "NOT_PUBLISHED", "relayed by the door as its own refusal");
  /* the preparation, once ratified, answers what was set on it */
  w.ratify({ caseId: prepared, edition: 1 }, w.row(`SELECT project_id FROM cases WHERE case_id=?`, published).project_id);
  assert.deepEqual(w.ci.caseDetailsPublic({ case: prepared }).details.area.value, [{ words: "A secret preparation" }]);
  /* census: no key, handle or member id in any public answer of this test, and no set_by */
  const answers = [r, prep, never, w.ci.caseDetailsPublic({ case: prepared }), w.ci.caseDetailsPublic({ case: published })];
  for (const a of answers) {
    const text = JSON.stringify(a);
    for (const leak of ["alice", "h_alice", "member:", "set_by", '"by"'])
      assert.equal(text.includes(leak), false, `${leak} in ${text.slice(0, 120)}`);
  }
  /* a team with no recorded slug answers group: null, never a guess */
  const w3 = world();
  w3.member("alice");
  const P3 = w3.project("Team", "alice");
  const c3 = w3.ratifiedCase(P3, "alice");
  const noGroup = new (w3.ci.constructor)({ storage: w3.st, record: w3.record, membership: w3.membership, host: w3.host,
    promotion: { fact: () => ({ ok: false }) } });
  assert.equal(noGroup.caseDetailsPublic({ case: c3 }).group, null);
});

test("R25: setting, clearing and reading details never changes a case document: its stored bytes, hash and signature are equal with and without details", () => {
  const { w, prepared, published } = setup();
  const docs = (ids) => ids.map((id) => w.docOf(id, 1));
  const tables = () => { const s = w.snapshot(); delete s.case_details; delete s.sqlite_sequence; return s; };
  const beforeDocs = JSON.stringify(docs([prepared, published]));
  const beforeAll = tables();
  const values = { area: AREA, contact: CONTACT, related: [{ relation: "other", url: "https://example.org/x" }], relationships: NONE };
  for (const id of [prepared, published]) for (const f of CASE_DETAILS_FIELDS) assert.equal(set(w, id, f, values[f]).ok, true);
  set(w, published, "area", null);
  w.ci.caseDetails({ case: published, viewer: V("alice") }); w.ci.caseDetailsPublic({ case: published });
  assert.equal(JSON.stringify(docs([prepared, published])), beforeDocs, "the document rows, bytes, hashes and signatures");
  assert.deepEqual(tables(), beforeAll, "no other table of the store changed");
  /* control: the details are in no case document, and the details table is what changed */
  for (const d of docs([prepared, published])) for (const text of ["The harbour authority", "doorbell", "example.org"]) assert.equal(d.text.includes(text), false);
  assert.equal(w.count("case_details"), 9);
  /* the signed edition is unchanged by a later change of a contact */
  assert.equal(set(w, published, "contact", { kind: "text", text: "info@example.org" }).ok, true);
  assert.equal(JSON.stringify(docs([prepared, published])), beforeDocs);
});

test("R26: case_details is declared whole to purge, keyed to no bundle: a whole-store purge clears it, a bundle's purge does not", () => {
  const { w, P, prepared, published } = setup();
  const d = w.record.declaredTables().find((x) => x.name === "case_details");
  assert.deepEqual([d.module, d.keys, d.purge], ["case-inputs", [], "clear"]);
  set(w, published, "area", AREA); set(w, prepared, "contact", CONTACT);
  assert.equal(w.count("case_details"), 2);
  const one = w.record.purge({ bundleId: P });
  assert.equal(one.removed.case_details, 0, "named in the report, nothing removed by a bundle's purge");
  assert.equal(w.count("case_details"), 2);
  const all = w.record.purge({});
  assert.equal(all.removed.case_details, 2);
  assert.equal(w.count("case_details"), 0);
});

test("R28: every sentence of R20–R24's answers is the module's word for its key, by equality, and every entry of the word table is exercised", () => {
  const { w, P, prepared, published } = setup();
  const seen = new Set();
  const is = (got, key, fill) => { assert.equal(got, fillDetails(key, fill)); seen.add(key); };
  const ask = (over = {}) => w.ci.caseDetailsSet({ case: published, field: "area", value: AREA, by: "alice", viewer: V("alice"), ...over });
  is(ask({ by: MACHINE }).detail, "machine");
  const none = ask({ case: "CASE-2026-9999" });
  is(none.detail, "noSuchCase"); is(none.translation, "noSuchCase");
  is(ask({ by: "bo", viewer: V("bo") }).detail, "notOwner");
  is(ask({ field: "classification" }).detail, "fieldUnknown", { field: "classification", fields: CASE_DETAILS_FIELDS.join(", ") });
  is(ask({ value: [] }).detail, "malformed", { field: "area", part: "area" });
  is(w.ci.caseDetails({ case: published, viewer: V("dee") }).detail, "noSuchCase");
  ask();
  const pub = w.ci.caseDetailsPublic({ case: published });
  is(pub.sentence, "publicCurrent"); is(pub.details.contact.says, "notStated");
  is(w.ci.caseDetailsPublic({ case: prepared }).detail, "notPublished");
  assert.deepEqual([...seen].sort(), Object.keys(CASE_DETAILS_WORDS).sort());
  /* the words are the list's where it holds a row, and none is empty */
  for (const [k, v] of Object.entries(CASE_DETAILS_WORDS)) assert.ok(typeof v === "string" && v.length > 0, k);
  assert.ok(P);
});

test("R20, R23: the ops map answers the two member ops as the door calls them: case from the address, else the body; field and value from the body, else the address; by and viewer the stamps", () => {
  const { w, published } = setup();
  const url = (q) => new URL(`http://do/x?${q}`);
  const enc = encodeURIComponent;
  const stamps = `by=alice&viewer=${enc(V("alice"))}`;
  assert.deepEqual(Object.keys(caseInputsOps(w.ci, url(""), null)).filter((k) => k.startsWith("casedetails")).sort(), ["casedetails", "casedetailsset"]);
  /* the body carries field and value, the address the case */
  let r = caseInputsOps(w.ci, url(`case=${published}&${stamps}`), { field: "contact", value: CONTACT }).casedetailsset();
  assert.equal(r.ok, true); assert.deepEqual(r.value, CONTACT);
  /* everything in the body but the stamps */
  r = caseInputsOps(w.ci, url(stamps), { case: published, field: "relationships", value: NONE }).casedetailsset();
  assert.equal(r.ok, true);
  /* a value in the address is a JSON text */
  r = caseInputsOps(w.ci, url(`case=${published}&field=area&value=${enc(JSON.stringify(AREA))}&${stamps}`), null).casedetailsset();
  assert.equal(r.ok, true); assert.deepEqual(r.value, AREA);
  /* text that is not JSON is passed as it is, and is malformed */
  r = caseInputsOps(w.ci, url(`case=${published}&field=area&value=not-json&${stamps}`), null).casedetailsset();
  assert.equal(r.reason, "DETAILS_MALFORMED");
  /* a value null in the body clears; no value at all is malformed */
  r = caseInputsOps(w.ci, url(`case=${published}&${stamps}`), { field: "area", value: null }).casedetailsset();
  assert.equal(r.ok, true); assert.equal(r.value, null);
  r = caseInputsOps(w.ci, url(`case=${published}&field=area&${stamps}`), null).casedetailsset();
  assert.equal(r.reason, "DETAILS_MALFORMED"); assert.equal(r.part, "value");
  /* the stamps are the address's, never a body's */
  r = caseInputsOps(w.ci, url(`case=${published}&field=area&by=bo&viewer=${enc(V("bo"))}`), { value: AREA, by: "alice", viewer: V("alice") }).casedetailsset();
  assert.equal(r.reason, "NOT_THE_PROJECT_OWNER");
  /* the read */
  const read = caseInputsOps(w.ci, url(`case=${published}&viewer=${enc(V("bo"))}`), null).casedetails();
  assert.equal(read.ok, true); assert.equal(read.details.contact.stated, true);
  assert.deepEqual(caseInputsOps(w.ci, url(`viewer=${enc(V("bo"))}`), { case: published }).casedetails(), read, "case from the body");
  assert.equal(caseInputsOps(w.ci, url(`case=${published}`), null).casedetails().reason, "NO_SUCH_CASE", "no viewer, no sight");
});
