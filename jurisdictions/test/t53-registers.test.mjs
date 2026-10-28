/* jurisdictions, T53 (T53-12; N1259, K4403; R127-R133): registers, the data-use limit, a source's call limits and gate, the
 * number-only query templates, and the first profile's listing. Tested at the module's interface: validate, combine,
 * validateRegisterDefinition, queryAddress. The test profile supplies every shape; no sentence of a member's is asserted. */
import test from "node:test";
import assert from "node:assert/strict";
import { get, validate, combine, validateRegisterDefinition, queryAddress, REGISTER_ROLES, REGISTER_GATES, SECTIONS, USE_LIMIT_WORDS } from "../index.mjs";

const TEST = "test-port-ellery", FIRST = "oakland-alameda";
const codes = (r) => (r.errors || []).map((e) => e.code);
const has = (r, code, path) => (r.errors || []).some((e) => e.code === code && (path === undefined || e.path === path));
const broke = (fn, id = TEST) => { const p = structuredClone(get(id)); fn(p); return validate(p); };
const reg = (p, key) => p.registers.find((r) => r.key === key);

test("R127 every shipped and test register validates; the sections are known; a profile with none lists none", () => {
  for (const id of [FIRST, TEST]) assert.deepEqual(validate(get(id)).errors, [], id);
  for (const s of ["registers", "use_limits", "query_templates"]) assert.ok(SECTIONS.includes(s), s);
  const none = structuredClone(get(TEST)); delete none.registers; delete none.query_templates;
  none.identifier_schemes = none.identifier_schemes.filter((x) => !x.registers);
  assert.deepEqual(validate(none).errors, []);
  assert.equal(combine([none]).view.registers, undefined);
  assert.equal(combine([none]).view.query_templates, undefined);
});

test("R127 the test profile exercises every field: each role, each delimiter, a zip member, a separate header file, a content row key, each gate but people_search, beta", () => {
  const t = get(TEST);
  const roles = new Set(t.registers.flatMap((r) => r.columns.map((c) => c.role)));
  assert.deepEqual([...roles].sort(), [...REGISTER_ROLES].sort());
  assert.deepEqual([...new Set(t.registers.flatMap((r) => [r.delimiter, ...r.pieces.map((p) => p.delimiter)]).filter(Boolean))].sort(), ["comma", "pipe", "tab"]);
  assert.ok(t.registers.some((r) => r.pieces.some((p) => p.member)), "a zip member");
  assert.ok(t.registers.some((r) => r.pieces.some((p) => p.header_from)), "a separate header file");
  assert.ok(t.registers.some((r) => r.row_key_basis === "content") && t.registers.some((r) => r.row_key_basis === "source"));
  assert.deepEqual([...new Set(t.registers.map((r) => r.gate))].sort(), ["account", "fee", "none"]);
  assert.ok(!REGISTER_GATES.slice(0, 3).includes("people_search") && REGISTER_GATES.includes("people_search"));
  const beta = reg(t, "company_officers");
  assert.deepEqual([beta.phase, beta.gate, beta.pieces], ["beta", "account", []]);
  assert.ok(t.registers.some((r) => r.use_limit) && t.registers.some((r) => r.listing) && t.registers.some((r) => r.count) && t.registers.some((r) => r.refresh));
});

test("R127 each field absent, of the wrong type or outside its list is REGISTER_INVALID naming it; a duplicate key; a url off its system's hosts", () => {
  const bad = (path, fn) => assert.ok(has(broke(fn), "REGISTER_INVALID", path), path);
  bad("registers[0].key", (p) => { p.registers[0].key = "Bad Key"; });
  bad("registers[1].key", (p) => { p.registers[1].key = p.registers[0].key; });
  bad("registers[0].label", (p) => { delete p.registers[0].label; });
  bad("registers[0].publisher", (p) => { p.registers[0].publisher = ""; });
  bad("registers[0].system", (p) => { p.registers[0].system = "nowhere"; });
  bad("registers[0].url", (p) => { p.registers[0].url = "http://data.marlow-county.example/filings"; });
  bad("registers[0].url", (p) => { p.registers[0].url = "https://elsewhere.example/filings"; });
  bad("registers[0].pieces", (p) => { p.registers[0].pieces = []; });
  bad("registers[0].pieces[0].locator", (p) => { p.registers[0].pieces[0].locator = "ftp://data.marlow-county.example/x"; });
  bad("registers[0].pieces[0].locator", (p) => { p.registers[0].pieces[0].locator = "https://data.marlow-county.example/{other}.csv"; });
  bad("registers[0].pieces[0].locator", (p) => { p.registers[0].pieces[0].locator = "https://elsewhere.example/a.csv"; });
  bad("registers[0].delimiter", (p) => { p.registers[0].delimiter = "semicolon"; });
  bad("registers[2].pieces[1].header_from", (p) => { p.registers[2].pieces[1].header_from = "nothing"; });
  bad("registers[0].columns[0].role", (p) => { p.registers[0].columns[0].role = "ssn"; });
  bad("registers[0].columns[0].keep", (p) => { p.registers[0].columns[0].keep = "yes"; });
  bad("registers[0].columns[1].name", (p) => { p.registers[0].columns[1].name = p.registers[0].columns[0].name; });
  bad("registers[0].row_key_basis", (p) => { p.registers[0].row_key_basis = "guess"; });
  bad("registers[0].gate", (p) => { p.registers[0].gate = "secret"; });
  bad("registers[0].phase", (p) => { p.registers[0].phase = "gamma"; });
  bad("registers[0].schemes", (p) => { p.registers[0].schemes = ["no_such_scheme"]; });
  bad("registers[0].status", (p) => { p.registers[0].status = "measured"; });
  assert.ok(has(broke((p) => { p.registers[0].zzz = 1; }), "UNKNOWN_SECTION", "registers[0].zzz"));
  assert.ok(has(broke((p) => { delete p.registers[0].basis; }), "BASIS_MISSING", "registers[0].basis"));
});

test("R128 a definition that keeps contact data, hides its terms, ignores its system's use limit, reaches a people-search or keys a missing column is refused by name; controls pass", () => {
  const view = { systems: get(TEST).systems };
  const base = () => structuredClone(reg(get(TEST), "federal_individual"));
  assert.deepEqual(validateRegisterDefinition(base(), view).ok, true);
  const refused = (fn, code, field) => { const d = base(); fn(d); const r = validateRegisterDefinition(d, view); assert.equal(r.ok, false, code); assert.equal(r.code, code); if (field) assert.equal(r.field, field); assert.equal(r.key, "federal_individual"); };
  refused((d) => { d.columns.push({ name: "TEL", role: "phone", keep: true }); }, "REGISTER_KEEPS_CONTACT", "columns[6].keep");
  refused((d) => { d.columns.push({ name: "ADR", role: "home_address", keep: true }); }, "REGISTER_KEEPS_CONTACT");
  refused((d) => { delete d.terms_basis; }, "REGISTER_NO_TERMS", "terms_basis");
  refused((d) => { d.terms_basis = "  "; }, "REGISTER_NO_TERMS");
  refused((d) => { delete d.use_limit; }, "REGISTER_NO_USE_LIMIT", "use_limit");
  refused((d) => { d.gate = "people_search"; }, "REGISTER_PEOPLE_SEARCH", "gate");
  refused((d) => { d.row_key = ["NOT_A_COLUMN"]; }, "REGISTER_ROW_KEY_INVALID", "row_key");
  refused((d) => { d.row_key_basis = "source"; d.row_key = ["TRAN"]; d.columns.push({ name: "TRAN", role: "other", keep: true }); }, "REGISTER_ROW_KEY_INVALID");
  /* controls: the same fault removed; a contact column kept false; a source key with a role beside `other` */
  const ok = base(); ok.columns.push({ name: "TEL", role: "phone", keep: false });
  assert.equal(validateRegisterDefinition(ok, view).ok, true);
  assert.equal(validateRegisterDefinition({ ...base(), row_key_basis: "source", row_key: ["CMTE_ID", "NAME"] }, view).ok, true);
  assert.equal(validateRegisterDefinition(null, view).ok, false);
  /* a team's own definition meets the same rule through validate: no second rule */
  assert.ok(has(broke((p) => { p.registers[0].columns.push({ name: "TEL2", role: "phone", keep: true }); }), "REGISTER_KEEPS_CONTACT"));
  assert.ok(has(broke((p) => { p.registers[0].gate = "people_search"; }), "REGISTER_PEOPLE_SEARCH"));
  assert.ok(has(broke((p) => { delete p.registers[0].terms_basis; }), "REGISTER_NO_TERMS"));
  assert.ok(has(broke((p) => { delete reg(p, "federal_individual").use_limit; }), "REGISTER_NO_USE_LIMIT"));
  assert.ok(has(broke((p) => { p.registers[0].row_key = ["nothing"]; }), "REGISTER_ROW_KEY_INVALID"));
});

test("R129 each listed figure carries its basis; a figure with a basis and no date, a not_stated figure with a value, an estimate with no method are refused", () => {
  assert.ok(has(broke((p) => { delete p.registers[0].listing.measured_at; }), "REGISTER_INVALID", "registers[0].listing.measured_at"));
  assert.ok(has(broke((p) => { p.registers[0].listing.rows.value = 5; p.registers[0].listing.bytes.value = 5; }), "REGISTER_INVALID", "registers[0].listing.bytes.value"));
  assert.ok(has(broke((p) => { delete reg(p, "county_raw").listing.rows.how; }), "REGISTER_INVALID", "registers[1].listing.rows.how"));
  assert.ok(has(broke((p) => { p.registers[0].listing.rows.basis = "guessed"; }), "REGISTER_INVALID", "registers[0].listing.rows.basis"));
  assert.ok(has(broke((p) => { p.registers[0].refresh.validators = ["magic"]; }), "REGISTER_INVALID", "registers[0].refresh.validators"));
  assert.ok(has(broke((p) => { delete p.registers[0].count; }), "REGISTER_INVALID", "registers[0].refresh.validators"), "a count validator needs a count query");
  assert.ok(has(broke((p) => { p.registers[0].count.kind = "other"; }), "REGISTER_INVALID", "registers[0].count.kind"));
  /* control: a not_stated figure with a null value is valid, and a refresh with no validators means always fetch */
  assert.deepEqual(broke((p) => { p.registers[0].refresh.validators = []; }).errors, []);
  assert.equal(reg(get(TEST), "town_filings").listing.bytes.value, null);
  /* a bare basis names no measurement date: the first profile's registers rest on a dated entry */
  assert.ok(has(broke((p) => { p.registers[0].basis = "M-R1"; }, "us-federal"), "BASIS_INVALID", "registers[0].basis"), "a bare M-R1 is no basis");
});

test("R130 query templates compose an address from a number of the scheme's form, percent-encoded, never from a name", () => {
  const view = combine([TEST]).view;
  assert.deepEqual(queryAddress(view, "company", "company_officers", "C1234567"), { ok: true, address: "https://api.company.state.example/officers?company=C1234567" });
  assert.deepEqual(queryAddress(view, "docket", "county_raw", "D123456"), { ok: true, address: "https://files.marlow-county.example/docket/D123456.json" });
  for (const v of ["C12", "ACME Inc", "C1234567/../x", "C1234567&x=1", "", 7, null]) assert.equal(queryAddress(view, "company", "company_officers", v).reason, "VALUE_NOT_OF_FORM", String(v));
  assert.equal(queryAddress(view, "licence", "trades_licences", "L123456").reason, "NO_QUERY_TEMPLATE", "a scheme with no template cannot be watched");
  assert.equal(queryAddress(view, "nothing", "x", "C1234567").reason, "NO_QUERY_TEMPLATE");
  assert.equal(queryAddress({}, "company", "company_officers", "C1234567").reason, "NO_QUERY_TEMPLATE");
  const t = (template) => broke((p) => { p.query_templates[1].template = template; });
  assert.ok(has(t("https://api.company.state.example/officers?company={name}"), "QUERY_TEMPLATE_NOT_NUMBER"));
  assert.ok(has(t("https://api.company.state.example/officers?first={first}&last={last}"), "QUERY_TEMPLATE_NOT_NUMBER"));
  assert.ok(has(t("https://api.company.state.example/officers?officer={officer}"), "QUERY_TEMPLATE_INVALID"));
  assert.ok(has(t("https://{value}.company.state.example/officers"), "QUERY_TEMPLATE_INVALID"));
  assert.ok(has(t("https://api.company.state.example/{value}/{value}"), "QUERY_TEMPLATE_INVALID"));
  assert.ok(has(t("https://api.company.state.example/officers"), "QUERY_TEMPLATE_INVALID"));
  assert.ok(has(t("https://other.example/officers?company={value}"), "QUERY_TEMPLATE_INVALID"), "the host is among the register's system hosts");
  assert.ok(has(broke((p) => { p.query_templates[1].scheme = "nothing"; }), "SCHEME_INVALID"));
  /* control: the template removed validates and cannot be looked up */
  const noTemplate = structuredClone(get(TEST)); noTemplate.query_templates = noTemplate.query_templates.filter((q) => q.scheme !== "company");
  assert.deepEqual(validate(noTemplate).errors, []);
  assert.equal(queryAddress(combine([noTemplate]).view, "company", "company_officers", "C1234567").reason, "NO_QUERY_TEMPLATE");
  /* the schemes need a form in their space, else SCHEME_INVALID (R52) */
  assert.ok(has(broke((p) => { p.identifier_schemes.find((x) => x.scheme === "company").form = "no-such-form"; }), "SCHEME_INVALID"));
});

test("R131 a limit is data: the first profile's federal system names it and its registers inherit it; a register omitting it is refused; an on_publish outside the three is", () => {
  const f = get("us-federal");
  const limit = f.use_limits[0];
  assert.deepEqual([limit.export, limit.on_publish], ["never", "warn"]);
  assert.equal(f.systems.find((s) => s.origin === "fec.bulk").use_limit, limit.key);
  assert.ok(f.registers.filter((r) => r.system === "fec.bulk").every((r) => r.use_limit === limit.key), "inherited, not cleared");
  assert.equal(typeof USE_LIMIT_WORDS[limit.text_key], "string", "its words are written once, in the module, by the key the limit names");
  const broken = (fn) => { const p = structuredClone(f); fn(p); return validate(p); };
  assert.ok(has(broken((p) => { delete p.registers[0].use_limit; }), "REGISTER_NO_USE_LIMIT"));
  assert.ok(has(broken((p) => { p.use_limits[0].on_publish = "maybe"; }), "USE_LIMIT_INVALID", "use_limits[0].on_publish"));
  assert.ok(has(broken((p) => { p.use_limits[0].export = "csv"; }), "USE_LIMIT_INVALID", "use_limits[0].export"));
  assert.ok(has(broken((p) => { p.systems[0].use_limit = "nothing"; }), "USE_LIMIT_INVALID", "systems[0].use_limit"));
  assert.ok(has(broken((p) => { p.use_limits.push({ ...p.use_limits[0] }); }), "USE_LIMIT_INVALID"));
  /* control: a limit-free register carries none */
  assert.ok(get("us-ca-oakland").registers.every((r) => r.use_limit === undefined));
  assert.deepEqual(validate(f).errors, []);
});

test("R132 a system states its call limits, its gate and its terms: a non-positive count, a limit with no date, and a gate: none register on a gated system are refused; a system with none is valid", () => {
  assert.ok(has(broke((p) => { p.systems.find((s) => s.origin === "marlow.opendata").rate_limits.per_minute = 0; }), "VALUE_INVALID"));
  assert.ok(has(broke((p) => { delete p.systems.find((s) => s.origin === "marlow.opendata").rate_limits.measured_at; }), "VALUE_INVALID"));
  assert.ok(has(broke((p) => { p.systems.find((s) => s.origin === "marlow.opendata").rate_limits = { basis: "TEST", measured_at: "2026-01-01" }; }), "VALUE_INVALID"));
  assert.ok(has(broke((p) => { reg(p, "company_officers").gate = "none"; }), "REGISTER_INVALID", "registers[4].gate"));
  assert.ok(has(broke((p) => { reg(p, "trades_licences").gate = "none"; }), "REGISTER_INVALID"), "a fee-gated system's register");
  assert.ok(has(broke((p) => { p.systems.find((s) => s.origin === "marlow.files").gated = "locked"; }), "VALUE_INVALID"));
  assert.ok(has(broke((p) => { p.systems.find((s) => s.origin === "marlow.files").volatile = []; }), "VALUE_INVALID"));
  assert.ok(has(broke((p) => { p.systems.find((s) => s.origin === "marlow.files").terms = ""; }), "VALUE_INVALID"));
  /* control: a system with none of these is valid; the keyed service differs from the open-data portal's limits */
  const t = get(TEST);
  assert.deepEqual(t.systems.find((s) => s.origin === "ellery.ledger").rate_limits, undefined);
  assert.notDeepEqual(t.systems.find((s) => s.origin === "state.company_service").rate_limits, t.systems.find((s) => s.origin === "marlow.opendata").rate_limits);
  assert.ok(combine([TEST]).view.systems.some((s) => s.volatile));
});

test("R133 the first profile lists what was measured and no more; what was not read is listed as not_measured, never as importable", () => {
  const all = combine([FIRST]).view.registers;
  const listed = all.filter((r) => r.status === "not_measured");
  const importable = all.filter((r) => r.status !== "not_measured");
  /* the measured: the City's open-data copies (one per schedule), the lobbyist datasets, the state's raw tables, the federal files */
  assert.deepEqual(importable.map((r) => r.key).sort(), ["calaccess_expenditures", "calaccess_receipts", "fec_committees", "fec_individual_contributions",
    "oakland_behested_payments", "oakland_form460_schedule_a", "oakland_form460_schedule_e", "oakland_form460_summary",
    "oakland_lobbyist_clients", "oakland_lobbyist_contacts", "oakland_lobbyist_contributions"]);
  assert.ok(importable.every((r) => r.listing === undefined || r.listing.measured_at === "2026-10-21"));
  assert.ok(importable.every((r) => r.columns.every((c) => !["home_address", "phone"].includes(c.role) || c.keep === false)), "no contact column kept");
  /* the not read: Form 700, state and contractors' licences, the company bulk file, OpenCorporates, officers: no figure, no columns */
  assert.deepEqual(listed.map((r) => r.key).sort(), ["ca_company_bulk", "ca_company_officers", "ca_licences_cslb", "ca_licences_dca", "form_700", "opencorporates"]);
  for (const r of listed) { assert.equal(r.listing, undefined, r.key); assert.equal(r.columns, undefined, r.key); }
  const officers = listed.find((r) => r.key === "ca_company_officers");
  assert.deepEqual([officers.phase, officers.gate, officers.pieces], ["beta", "account", []]);
  /* nothing names a paid people-search or OpenCorporates as a host or a template */
  const view = combine([FIRST]).view;
  assert.ok(!view.systems.some((s) => s.hosts.some((h) => /opencorporates/.test(h))));
  assert.equal(view.query_templates, undefined);
  assert.ok(!all.some((r) => r.gate === "people_search"));
  /* the sources are the measured hosts: the OakData datasets by path, the state's CDN, the federal host and the storage it redirects to */
  assert.deepEqual(view.systems.filter((s) => ["oakland.opendata", "calaccess.cdn", "fec.bulk"].includes(s.origin)).map((s) => s.origin).sort(), ["calaccess.cdn", "fec.bulk", "oakland.opendata"]);
  assert.ok(view.systems.find((s) => s.origin === "fec.bulk").hosts.some((h) => h.endsWith(".s3-us-gov-west-1.amazonaws.com")));
  assert.ok(view.systems.find((s) => s.origin === "oakland.opendata").path);
  /* the federal register inherits the limit, each figure its basis */
  assert.ok(all.filter((r) => r.system === "fec.bulk").every((r) => r.use_limit === "fec_contributor_names"));
  const a = all.find((r) => r.key === "oakland_form460_schedule_a");
  assert.deepEqual([a.listing.rows.value, a.listing.rows.basis, a.listing.bytes.basis], [73043, "counted", "not_stated"]);
  /* the columns of the state's tables are the headers as read, one table per register */
  assert.equal(all.find((r) => r.key === "calaccess_receipts").pieces[0].member, "CalAccess/DATA/RCPT_CD.TSV");
  assert.ok(all.find((r) => r.key === "fec_individual_contributions").pieces.some((p) => p.header_from === "header"));
  /* every shipped and test definition validates */
  for (const r of [...all, ...combine([TEST]).view.registers]) assert.equal(validateRegisterDefinition(r, combine([r.system && /fec|calaccess|oakland/.test(r.system) ? FIRST : TEST]).view).ok, true, r.key);
});
