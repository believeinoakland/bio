/* The fake plane's answers, each in its owner's documented shape (membership R6–R24, R98–R107; credentials R8–R10,
   R22–R60; ai-use R2–R12; instance-setup R53–R81; hypotheses R11–R13; wizard-scripts R27; control-plane R18, R65),
   wrapped as the door wraps them (`answer-envelope` R1: `{ok: true, result}`), except `bootstrap` and
   `subscriptionsignin`, answered at the top level as the door relays them. */

export const env = (result) => ({ ok: true, result, store: "bio", tokenClass: "member" });
export const refuse = (code, extra = {}) => env({ ok: false, reason: code, code, translation: `translated ${code}`, ...extra });

export const VOCAB = ["contribute", "publish", "create_projects"];
export const ADMIN = Object.freeze({ member: "rosa", handle: "rosa", administer: true, capabilities: VOCAB, vocabulary: VOCAB, tokenClass: "session" });
export const MEMBER = Object.freeze({ member: "dev", handle: "dev", administer: false, capabilities: ["contribute"], vocabulary: VOCAB, tokenClass: "session" });
export const READER = Object.freeze({ member: "teo", handle: "teo", administer: false, capabilities: [], vocabulary: VOCAB, tokenClass: "session" });

const exp = (label, confirmed) => ({ label, state: confirmed ? "confirmed" : "declared", confirmed, by: confirmed ? "rosa" : null, at: "2026-10-05T10:00:00Z", history: [] });

export const ROSTER = [
  { member_id: "rosa", handle: "rosa", role: "admin", status: "active", capabilities: VOCAB, cover: "R. Medina", expertise: [], invitation: "spent", created: "2026-10-01T00:00:00Z" },
  { member_id: "dev", handle: "dev", role: "member", status: "active", capabilities: ["contribute"], cover: "Dev from 60th", expertise: [], invitation: "spent" },
  { member_id: "ana", handle: "ana", role: "member", status: "active", capabilities: ["contribute"], cover: "Ana the CPA", expertise: [exp("CPA", false)], invitation: "spent" },
  { member_id: "lu", handle: "lu", role: "admin", status: "active", capabilities: VOCAB, cover: "Lu", expertise: [], invitation: "spent" },
  { member_id: "kim", handle: "kim", role: "admin", status: "proposed", capabilities: VOCAB, cover: "Kim", expertise: [], invitation: null },
  { member_id: "old", handle: "old", role: "member", status: "revoked", capabilities: ["contribute"], cover: "Old", expertise: [], invitation: "spent" },
  { member_id: "mai-k", handle: null, role: "member", status: "invited", capabilities: ["contribute"], cover: "Mai K., from the Seminary Ave block", expertise: [], invitation: "live" },
];
/** The roster as a member who does not administer reads it (membership R18: no cover, no invitation). */
export const ROSTER_MEMBER = ROSTER.map(({ cover, invitation, ...r }) => r);

export const ALL_USES = { ask: true, draft: true, run: true, standing: false, explore: "no", enquire: true, read: true, transcribe: false, account: true, suggestions: false };

export const LIMITS = { ok: true, owner: "group", zone: "UTC", limits: [
  { scope: "overall", use: null, unit: "usd", period: "month", amount: 60, inclusive: null, on_top: null, used: 31.4, reached: false, set_by: "member:rosa", set_at: "2026-10-06T09:00:00Z" },
  { scope: "per_member", use: null, unit: "usd", period: "day", amount: 5, inclusive: null, on_top: null, used: 0.8, reached: false, set_by: "member:rosa", set_at: "2026-10-06T09:00:00Z" },
  { scope: "run", use: "run", unit: "tokens", period: "month", amount: 2000000, inclusive: false, on_top: true, used: 2700000, reached: true, set_by: "member:lu", set_at: "2026-10-07T09:00:00Z" },
], history: [
  { change: "set", scope: "overall", unit: "usd", period: "month", amount: 60, inclusive: null, by: "member:rosa", at: "2026-10-06T09:00:00Z" },
  { change: "removed", scope: "draft", unit: "calls", period: "day", amount: null, inclusive: true, by: "member:lu", at: "2026-10-08T09:00:00Z" },
] };

export const USAGE = (owner) => ({ ok: true, owner, month: "2026-10", zone: "UTC", uses: [
  { use: "ask", calls: 220, tokens: 1900000, total_cost_usd: 12.6, cost_unstated: false },
  { use: "draft", calls: 35, tokens: 400000, total_cost_usd: 2.3, cost_unstated: false },
  { use: "run", calls: 41, tokens: 2700000, total_cost_usd: 16.5, cost_unstated: false },
] });

/** `aiuseovertime` (ai-use R14): thirty local days, oldest first, and a period for each limit set. */
export const OVER = (owner, over = {}) => ({ ok: true, owner,
  days: Array.from({ length: 30 }, (_, i) => ({ day: new Date(Date.UTC(2026, 8, 15 + i)).toISOString().slice(0, 10), calls: i === 29 ? 12 : (i % 7) * 3, dollars: i === 29 ? 1.5 : (i % 7) * 0.4 })),
  periods: [
    { scope: "overall", unit: "usd", period: "month", period_start: "2026-10-01", used: 31.4, limit: 60 },
    { scope: "overall", unit: "usd", period: "day", period_start: "2026-10-14", used: 1.5, limit: 1.8 },
  ], ...over });

export const HISTORY = (owner) => ({ ok: true, owner, count: 3, limit: 200, truncated: false, changes: [
  { at: "2026-10-06T08:00:00Z", by: "rosa", change: "key_set", kind: "apikey" },
  { at: "2026-10-06T08:01:00Z", by: "member:rosa", change: "switched", on: true },
  { at: "2026-10-07T08:00:00Z", by: "member:lu", change: "use_set", switch: "explore", value: "ask" },
] });

/** members, read by an administrator: every read answering. */
export function membersTable(over = {}) {
  return {
    memberlist: env({ members: ROSTER }),
    // the founder holds the instance (membership R64, R86): an administrator beside the roster's
    bootstrap: { ok: true, service: "bio-plane", claimed: true, part_signin: true, part_scanner: false, part_safe_view: false },
    adminrecoverystep: env({ ok: true, administrators: 1, codes_held: false, remaining: 0, met: false }),
    groupkeystate: env({ ok: true, held: true, on: true, set_at: "2026-10-06T08:00:00Z", by: "member:rosa", suggestions: false, standing: false, uses: ALL_USES }),
    aikeepawaystate: env({ on: false, reason: null, set_by: null, set_at: null, uses: ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "explore"] }),
    expertiselist: (q) => env({ ok: true, memberId: q.memberId, expertise: (ROSTER.find((m) => m.member_id === q.memberId) || { expertise: [] }).expertise, gates: "nothing" }),
    accountuses: (q) => env({ ok: true, owner: q.owner, held: true, uses: ALL_USES, keptAway: [] }),
    ailimits: () => env(LIMITS),
    aiusage: (q) => env(USAGE(q.owner)),
    accounthistory: (q) => env(HISTORY(q.owner)),
    aiuseovertime: (q) => env(OVER(q.owner)),
    memberadd: (q, b) => env({ ok: true, memberId: b.memberId, invite: "0123456789abcdef0123456789abcdef", expires: "2026-10-19T10:00:00Z", role: b.role || "member", capabilities: b.capabilities, invited_by: "rosa" }),
    membercaps: (q, b) => env({ ok: true, memberId: b.memberId, capabilities: b.capabilities, by: "rosa" }),
    memberset: (q, b) => env({ ok: true, memberId: b.memberId, status: b.status, by: "rosa" }),
    adminendorse: (q, b) => env({ ok: true, memberId: b.memberId, invite: "fedcba9876543210fedcba9876543210", expires: "2026-10-19T10:00:00Z", endorsedBy: ["rosa", "lu"] }),
    adminremove: (q, b) => env({ ok: true, memberId: b.memberId, removed: true }),
    expertiseconfirm: (q, b) => env({ ok: true, memberId: b.memberId, label: b.label, state: "confirmed", confirmed: true, by: "rosa" }),
    invitewithdraw: (q, b) => env({ ok: true, memberId: b.memberId, status: "revoked", invitation: "withdrawn", by: "rosa", at: "2026-10-12T00:00:00Z" }),
    websitekeycreate: () => env({ ok: true, keyId: "wk1", key: "a".repeat(64), capabilities: ["contribute"], dailyCap: 5, expiresInDays: 7, warning: "" }),
    joinlinkenable: () => env({ ok: true, linkId: "jl1", link: "b".repeat(64), capabilities: ["contribute"], dailyCap: 5, expiresInDays: 7, warning: "" }),
    groupkeyset: () => env({ ok: true, set_at: "2026-10-12T00:00:00Z" }),
    groupkeyswitch: (q, b) => env({ ok: true, on: b.on === true }),
    groupkeyremove: () => env({ ok: true, removed: true }),
    accountusesset: (q, b) => env({ ok: true, owner: b.owner, switch: b.switch, on: b.on }),
    ailimitset: (q, b) => env({ ok: true, ...b, change: b.amount === null ? "removed" : "set", set_at: "2026-10-12T00:00:00Z" }),
    aikeepaway: (q, b) => env({ ok: true, on: b.on, reason: b.reason || null, set_by: "rosa", set_at: "2026-10-12T00:00:00Z", uses: b.uses || [] }),
    // T47 (R23): the signing keys an administrator withdraws, and the reset link (credentials R10, R69)
    signerlist: env({ signers: [{ key_b64: "AAAAC3NzaC1lZDI1NTE5AAAAIDev000000000000000000000000000000000000001", member_id: "dev", comment: "", status: "active", added: "2026-10-04T00:00:00Z" }] }),
    signerset: (q, b) => env({ ok: true, keyB64: b.keyB64, status: b.status, by: "rosa" }),
    passwordresetlink: (q, b) => env({ ok: true, member: b.member, link: "rl-0123456789", expiresAt: "2026-10-19T00:00:00Z" }),
    ...over,
  };
}

/** members, read by a member who does not administer: the projections the owners answer them. */
export function membersTableMember(over = {}) {
  return membersTable({
    memberlist: env({ members: ROSTER_MEMBER }),
    groupkeystate: env({ ok: true, on: true }),
    adminrecoverystep: refuse("NOT_AN_ADMIN"),
    accountuses: refuse("NOT_AN_ADMIN"), ailimits: refuse("NOT_AN_ADMIN"), aiusage: refuse("NOT_AN_ADMIN"), accounthistory: refuse("NOT_AN_ADMIN"), aiuseovertime: refuse("NOT_AN_ADMIN"),
    ...over,
  });
}

export const KEEPAWAY_ON = { on: true, reason: "We hold tips from city employees; none of it may go to an AI service.", set_by: "rosa", set_at: "2026-10-02T10:00:00Z", uses: ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "explore"] };

/** account, read by `me`. */
export function accountTable(me, over = {}) {
  return {
    whoami: env(me),
    memberlanguage: env({ ok: true, language: "es", set_at: "2026-10-03T00:00:00Z" }),
    grouplanguages: env({ ok: true, languages: ["en", "es", "vi"] }),
    expertiselist: (q) => env({ ok: true, memberId: q.memberId, expertise: [exp("Tenant organiser", true), exp("Interpreter", false)], gates: "nothing" }),
    signerlist: env({ signers: [
      { key_b64: "AAAAC3NzaC1lZDI1NTE5AAAAIMine00000000000000000000000000000000000001", member_id: me.member, comment: "laptop", status: "active", added: "2026-10-04T00:00:00Z" },
      { key_b64: "AAAAC3NzaC1lZDI1NTE5AAAAIOther0000000000000000000000000000000000002", member_id: "someone", comment: "", status: "active", added: "2026-10-04T00:00:00Z" },
    ] }),
    infolevel: env({ ok: true, level: "pause", set_at: "2026-10-05T00:00:00Z", asked_at: null }),
    memberlanguageset: (q, b) => env({ ok: true, member: me.member, language: b.language, set_at: "2026-10-12T00:00:00Z" }),
    infolevelset: (q, b) => env({ ok: true, level: b.level }),
    expertisedeclare: (q, b) => env({ ok: true, memberId: me.member, label: b.label, state: "declared", confirmed: false }),
    setpassword: () => env({ ok: true, role: "member:" + me.member, ended: 2 }),
    signerregisterown: (q, b) => env({ ok: true, keyB64: b.keyB64, memberId: me.member, status: "active", origin: "self" }),
    signerrevokeown: (q, b) => env({ ok: true, keyB64: b.keyB64, status: "revoked", by: me.member, already: false }),
    ...over,
  };
}

/** connect, read by `me`, in one of the four situations: "group" (the group's key on, no account of one's own), "own"
 *  (one's own API key), "subscription" (one's own sign-in), "none" (nothing serves), "keptaway". */
export function connectTable(me, situation = "group", over = {}) {
  const kept = situation === "keptaway";
  const ownKey = situation === "own";
  const sub = situation === "subscription";
  return {
    assistantstate: env(kept ? { ok: true, on: false, set_by: KEEPAWAY_ON.set_by, set_at: KEEPAWAY_ON.set_at, reason: KEEPAWAY_ON.reason } : { ok: true, on: true, set_by: null, set_at: null, reason: null }),
    aikeepawaystate: env(kept ? KEEPAWAY_ON : { on: false, reason: null, set_by: null, set_at: null, uses: [] }),
    groupkeystate: env({ ok: true, on: situation === "group" || ownKey }),
    groupkeynotice: env({ ok: true, due: true, text: "notice" }),
    disclosureof: (q) => env({ ok: true, member: q.member, version: "D311-1", shown: true, shown_at: "2026-10-05T00:00:00Z" }),
    accountreference: env({ ok: true, held: ownKey, kind: ownKey ? "apikey" : null, set_at: null, suggestions: false, standing: false, uses: ownKey ? ALL_USES : null, subscription: { connected: sub, since: sub ? "2026-10-04T00:00:00Z" : null, held: sub, valid_until: sub ? "2026-11-04T00:00:00Z" : undefined, uses: null } }),
    subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected: sub, member: "member:" + me.member }
      : b.step === "start" ? { ok: true, address: "https://claude.ai/oauth/authorize?code=true&state=s" }
      : { ok: true, connected: true, member: "member:" + me.member },
    // instance-setup R82: the parts as three flat keys
    bootstrap: { ok: true, service: "bio-plane", version: "0.83.0", part_signin: true, part_scanner: false, part_safe_view: false },
    accountuses: (q) => env({ ok: true, owner: q.owner, held: ownKey || sub, uses: ownKey || sub ? ALL_USES : null, keptAway: [] }),
    ailimits: (q) => env({ ...LIMITS, owner: q.owner, limits: [{ scope: "overall", use: null, unit: "tokens", period: "day", amount: 100000, inclusive: null, on_top: null, used: 4000, reached: false, set_by: "member:" + me.member, set_at: "2026-10-06T09:00:00Z" }], history: [] }),
    aiusage: (q) => q.owner ? env(USAGE(q.owner)) : env({ ok: true, member: "member:" + me.member, month: "2026-10", zone: "UTC", payers: [
      { owner: "group", whose: "group", uses: [{ use: "ask", calls: 9, tokens: 61000 }], limits: [{ scope: "overall", unit: "usd", period: "month", amount: 60, inclusive: null, reached: false }, { scope: "per_member", unit: "usd", period: "day", amount: 5, inclusive: null, reached: false }] },
    ] }),
    aiuseovertime: (q) => env(OVER(q.owner)),
    accounthistory: (q) => env({ ...HISTORY(q.owner), changes: [{ at: "2026-10-06T08:00:00Z", by: "member:" + me.member, change: "key_set", account: "reference", kind: "apikey" }] }),
    groupkeynoticeseen: () => env({ ok: true, seen: true, already: false }),
    disclosureshown: (q, b) => env({ ok: true, member: b.member, version: b.version, shown_at: "2026-10-12T00:00:00Z", shown: true }),
    accountreferenceset: () => env({ ok: true, kind: "apikey", set_at: "2026-10-12T00:00:00Z" }),
    accountreferenceremove: () => env({ ok: true, removed: true }),
    subscriptiondisconnect: () => env({ ok: true, disconnected: true }),
    accountusesset: (q, b) => env({ ok: true, owner: b.owner, switch: b.switch, on: b.on }),
    ailimitset: (q, b) => env({ ok: true, ...b, change: b.amount === null ? "removed" : "set", set_at: "2026-10-12T00:00:00Z" }),
    ...over,
  };
}

export const NOTES = [
  { note: 2, text: "Ask the crew foreman on 60th what “closed” means to them.", at: "2026-10-04T00:00:00Z", revised: null, turned: [] },
  { note: 1, text: "The potholes on Seminary keep opening.", at: "2026-10-02T00:00:00Z", revised: "2026-10-03T00:00:00Z", turned: [{ into: "observation", id: "OBS-0001", at: "2026-10-03T00:00:00Z" }] },
];

/** notes, read by `me`. */
export function notesTable(me, over = {}) {
  return {
    notes: env({ ok: true, notes: NOTES, limit: 200, truncated: false, next: null }),
    courtnotice: env({ choice: "tell", history: [] }),
    notewrite: () => env({ ok: true, note: 3, at: "2026-10-12T00:00:00Z" }),
    noterevise: (q, b) => env({ ok: true, note: b.note, at: "2026-10-12T00:00:00Z" }),
    notedelete: (q, b) => env({ ok: true, note: b.note, deleted: true }),
    noteturn: (q, b) => env({ ok: true, note: b.note, into: b.into, id: b.made || "HYP-0001", at: "2026-10-12T00:00:00Z" }),
    writinghelp: () => env({ ok: true, text: "The potholes on Seminary Avenue between 59th and 62nd reopened three times since spring.", label: { kind: "machine", asked_by: "member:" + me.member }, withheld: [], note: "" }),
    ...over,
  };
}

// ---- T47: the new screens (R14–R20) ----

/** group, read by `me` (instance-setup R10, R11, R84, R85; membership R107; strength's bar). */
export function groupTable(over = {}) {
  return {
    groupidentity: env({ group: "eastoak", display_name: "East Oakland Watch", domain: "eastoak.example", domain_verified_at: "2026-10-03T00:00:00Z", logo: false,
      display_name_recorded: "East Oakland Watch", display_name_history: [], domain_claim: { domain: "eastoak.example", set_at: "2026-10-02T00:00:00Z", set_by: "rosa", latest: { domain: "eastoak.example", verdict: "verified", checked_at: "2026-10-03T00:00:00Z" } }, domain_history: [], domain_checks: [] }),
    grouplanguages: env({ ok: true, languages: ["en", "es"] }),
    memberlanguage: env({ ok: true, language: null }),
    courtnotice: env({ choice: "tell", history: [] }),
    hostingaccess: env({ ok: true, recorded: true, current: { holders: "Rosa and Lu", note: "the shared vault", recorded_by: "rosa", at: "2026-10-04T00:00:00Z" }, history: [], limit: 50, truncated: false }),
    strengthbarof: env({ ok: true, group: "eastoak", bar: { group_id: "eastoak", capture: "B", connection: "C", author: "rosa", at: "2026-10-05T00:00:00Z", reason: "Most of our sources are records." }, seeds_new_projects: true }),
    groupnameset: (q, b) => env({ ok: true, display_name: b.name, set_at: "2026-10-12T00:00:00Z", set_by: "rosa" }),
    grouplogoset: () => env({ ok: true, logo: true }),
    groupdomainset: (q, b) => env({ ok: true, domain: b.domain, check: { verdict: "absent" } }),
    grouplanguagesset: (q, b) => env({ ok: true, languages: b.languages }),
    courtnoticeset: (q, b) => env({ ok: true, choice: b.choice, by: "rosa", at: "2026-10-12T00:00:00Z" }),
    hostingaccessset: (q, b) => env({ ok: true, holders: b.holders, note: b.note || null, recorded_by: "rosa", at: "2026-10-12T00:00:00Z" }),
    strengthbarset: (q, b) => env({ ok: true, group: "eastoak", capture: b.capture, connection: b.connection, author: "rosa", at: "2026-10-12T00:00:00Z", reason: b.reason }),
    ...over,
  };
}

const OFFICES = ["", "Office of the City Clerk", "Department of Public Works", "Office of the City Auditor"];
const office = (i, by = "class:daemon") => ({ entity_id: "ENT-" + String(i).padStart(4, "0"), kind: "office", label: OFFICES[i], note: "n", declared_by: by, at: "2026-10-01T00:00:00Z" });
/** places: two pages of offices, the second answered only when asked `after` the first's last. */
export function placesTable(over = {}) {
  return {
    profiles: env({ ok: true, profiles: [{ id: "us-ca-oakland", name: "Oakland, California", covers: ["Oakland"] }], conflicts: [], choices: [{ id: "us-ca-oakland", name: "Oakland, California", covers: ["Oakland"] }, { id: "us-ca", name: "California", covers: ["California"] }], view: "main" }),
    placewantedstate: env({ ok: true, name: "Alameda County", set_by: "rosa", set_at: "2026-10-04T00:00:00Z", matches: [] }),
    entitieskind: (q) => q.after === "ENT-0002" ? env({ ok: true, kind: "office", entities: [office(3, "lu")], count: 1, limit: 500, truncated: false, next: null })
      : env({ ok: true, kind: "office", entities: [office(1), office(2)], count: 2, limit: 500, truncated: true, next: "ENT-0002" }),
    // wizard-scripts R37: the routes, the `elsewhere` one carrying the places' pointers (three listed)
    startfrom: env({ ok: true, scripts: [], doors: [{ door: "elsewhere", scripts: [], opens: "elsewhere" }], routes: [{ route: "blank" }, { route: "elsewhere", pointer: { places: ["Oakland, California"], pointers: [{ kind: "legal-help" }, { kind: "courts-self-help" }, { kind: "city-line" }] } }], blank: true, matches: [] }),
    profilesset: (q, b) => env({ ok: true, profiles: b.profiles.map((id) => ({ id, name: id })), choices: [] }),
    placewanted: (q, b) => env({ ok: true, name: b.name, set_by: "rosa", set_at: "2026-10-12T00:00:00Z" }),
    officesseed: () => env({ ok: true, seeded: [{ what: "office" }], already: [{ what: "office" }, { what: "body" }], unseeded: [], by: "rosa" }),
    entitycreate: (q, b) => env({ ok: true, entity_id: "ENT-0009", kind: b.kind, label: b.label, alias_count: 0, at: "2026-10-12T00:00:00Z" }),
    ...over,
  };
}

/** recovery, read by `me`. */
export function recoveryTable(over = {}) {
  return {
    recoverycodesstate: env({ ok: true, held: true, remaining: 7, issuedAt: "2026-10-02T00:00:00Z" }),
    adminrecoverystep: env({ ok: true, administrators: 1, codes_held: true, remaining: 7, met: false }),
    recoverycodesissue: () => env({ ok: true, codes: Array.from({ length: 10 }, (_, i) => "CODE-" + String(i).padStart(4, "0") + "-SENTINEL"), issuedAt: "2026-10-12T00:00:00Z" }),
    ...over,
  };
}

/** group-identity (membership R109, R110; instance-setup R65). */
export function identityTable(over = {}) {
  return {
    groupdescription: env({ description: { kinds: ["community", "other"], otherKind: "a tenants' union", focus: "Street repair on Seminary.", purpose: "We keep the city to its word.", visibility: "members", by: "rosa", at: "2026-10-02T00:00:00Z" }, history: [] }),
    groupidentity: env({ group: "eastoak", display_name: "East Oakland Watch", domain: null, domain_verified_at: null }),
    groupdescriptionset: (q, b) => env({ ok: true, ...b, by: "rosa", at: "2026-10-12T00:00:00Z" }),
    groupdescriptiondraft: () => env({ focus: { text: "Potholes and street repair in East Oakland.", label: { kind: "machine", asked_by: "member:rosa" } }, purpose: { text: "To hold the city to its repair promises.", label: { kind: "machine", asked_by: "member:rosa" } } }),
    ...over,
  };
}

export const CATALOGUE_ENTRY = { provider_id: "acme-scan", vendor: "Acme", product: "Scan", kinds: ["scan"], transport: "https", reach: "file", template: false,
  credentials: ["api_key"], config: [{ name: "region", label: "The region your account is in", required: true }, { name: "tag", label: "A tag for its reports", required: false }],
  handling: { sends: ["file_bytes"], never_sends: ["member_identity"], recipient: "Acme Inc.", sub_processors: [], region: "EU", file_retention: "30 days", result_retention: "1 year", sample_sharing: "vendor_internal_research" },
  handling_digest: "d".repeat(64) };
export const OWN_ENTRY = { ...CATALOGUE_ENTRY, provider_id: "own-scan", vendor: "Our", product: "Scanner", credentials: [], config: [],
  handling: { ...CATALOGUE_ENTRY.handling, recipient: "the organization's own servers", sample_sharing: "none" }, handling_digest: "e".repeat(64) };
/** security (credentials R45; file-safety R5, R27–R31; instance-setup R82). */
export function securityTable(over = {}) {
  return {
    securitymap: (q) => env({ ok: true, from: q.from, to: q.to, step: "day", level: "Raised", levelAt: q.to, note: "",
      buckets: [{ start: q.from, counts: { signin: 4, credential: 1, rate: 2, handover: 0, through: 3, total: 10 }, usual: { signin: 1, credential: 0, rate: 1, handover: 0, through: 1, total: 3 } }],
      totals: { count: 10, usual: 3, busiest: q.from }, countries: [{ country: "XX-SENTINEL-COUNTRY", count: 9 }], unplaced: 1 }),
    bootstrap: { ok: true, service: "bio-plane", part_signin: true, part_scanner: true, part_safe_view: true },
    scanstatus: env({ ok: true, scanner: { bound: true, version: "1" }, renderer: { bound: true, version: "1" }, queued: 3, overdue: 0, held: 1, tools: [] }),
    securitytools: env({ ok: true, tools: [{ tool_id: "T1", provider_id: "acme-scan", kinds: ["scan"], use: "on_request", state: "on", handling_digest: "d".repeat(64), added_by: "rosa", added_at: "2026-10-03T00:00:00Z" }] }),
    securitytoolevents: env({ ok: true, events: [{ tool_id: "T1", event: "test_passed", at: "2026-10-03T00:00:00Z", reason: null }], cursor: null, truncated: false }),
    securitytoolcatalogue: env({ ok: true, offered: [CATALOGUE_ENTRY, OWN_ENTRY], refused: [], held: [] }),
    securitytooladd: (q, b) => env({ ok: true, tool_id: "T2", state: "added" }),
    securitytooltest: (q, b) => env({ ok: true, tool_id: b.toolId, state: "on", passed: true, detail: "", tested_at: "2026-10-12T00:00:00Z" }),
    securitytoolremove: (q, b) => env({ ok: true, tool_id: b.toolId, state: "removed" }),
    ...over,
  };
}

/** translations, for `es` (instance-setup R67–R74). */
export const TWORDS = [
  { key: "rail.home.name", en: "Home", note: "The first place", means: null, protected: false, state: "shown", text: "Inicio", adopted_by: "ana", adopted_by_name: "ana", adopted_at: "2026-10-03T00:00:00Z", english_changed: false, drafts: [], acts: [{ act: "adopt", seq: 1 }], marks: [] },
  { key: "mark.outward.means", en: "Outward: this leaves…", note: null, means: null, protected: true, state: "awaiting", text: "Hacia fuera", adopted_by: "ana", adopted_by_name: "ana", adopted_at: "2026-10-04T00:00:00Z", english_changed: true, drafts: [], acts: [{ act: "adopt", seq: 2 }], marks: [] },
  { key: "rail.queue.name", en: "Queue", note: null, means: null, protected: false, state: "missing", text: null, adopted_by: null, adopted_at: null, english_changed: false, drafts: [{ id: "D1", text: "Cola", label: "Draft", asked_by: "member:ana", asked_by_name: "ana", at: "2026-10-05T00:00:00Z" }], acts: [], marks: [] },
];
export function translationsTable(over = {}) {
  return {
    grouplanguages: env({ ok: true, languages: ["en", "es", "vi"] }),
    translations: (q) => env({ ok: true, language: q.language, words_commit: "x", counts: { missing: 1, shown: 1, awaiting: 1 }, local_names: [], words: TWORDS }),
    interfacewords: (q) => env({ ok: true, language: q.language, words: [] }),
    translationadopt: (q, b) => env({ ok: true, language: b.language, key: b.key, state: "shown" }),
    translationconfirm: (q, b) => env({ ok: true, language: b.language, key: b.key, state: "shown", confirmed_by: "rosa" }),
    translationrevert: (q, b) => env({ ok: true, language: b.language, key: b.key, state: "missing" }),
    translationgrant: (q, b) => env({ ok: true, existed: false, member: b.member, language: b.language, granted: !b.revoke }),
    translationdraft: (q, b) => b.direction === "to_english" ? env({ ok: true, key: b.key, language: b.language, english: "Outward: this goes outside", label: { kind: "machine", asked_by: "member:rosa" } })
      : env({ ok: true, language: b.language, drafted: b.keys.map((k) => ({ id: "D9", key: k, text: "x" })), not_drafted: [], offered_official: [] }),
    ...over,
  };
}

/** `updatenotice` (instance-setup R89): what Settings › Updates draws. */
export const UPDATE = Object.freeze({ ok: true,
  running: { version: "0.83.0", installed_at: "2026-09-28T10:00:00Z", allowed_by: "member:rosa" },
  last_check: { at: "2026-10-14T06:10:00Z", outcome: "ok" },
  ready: { version: "0.84.0", date: "2026-10-11", security: true, signed: true, found_at: "2026-10-11T06:00:00Z", decision: null,
    notes: { members: "Searching the record now finds words inside scanned pages.", administrators: "New releases are checked for once a day.", must_do: "After it, open Translations once." } },
  earlier: [
    { version: "0.83.1", skipped_at: "2026-10-02T10:00:00Z", skipped_by: "member:rosa", reason: "Changes nothing for us; we wait for 0.84." },
    { version: "0.83.0", installed_at: "2026-09-28T10:00:00Z", allowed_by: "member:rosa" },
    { version: "0.82.0", installed_at: "2026-09-02T10:00:00Z", allowed_by: null },
  ],
  holder: { holders: "Rosa Medina", note: null, recorded_by: "rosa", at: "2026-10-04T00:00:00Z" }, viewer_holds: true });
export function updatesTable(notice = {}, over = {}) {
  return {
    updatenotice: env({ ...UPDATE, ...notice }),
    updatestart: (q, b) => env({ ok: true, version: b.version, address: "https://civicsmith.org/update?release=" + b.version }),
    updatelater: (q, b) => env({ ok: true, version: b.version, kind: "later" }),
    updateskip: (q, b) => env({ ok: true, version: b.version, kind: "skip" }),
    ...over,
  };
}
