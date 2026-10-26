/* The overlay's rows for this sitting: R108 (a rehearsal of five members at once, offline), R212 (one person alone), R213 (width: not drawn offline), R214 (gap states
   and refusal sentences), R215 (act weight), R216 (help-records and the glossary), R217 ("Help me write this" without an assistant), R218 (two writers, one record),
   and overlay check 15 (voice and vocabulary) on the words of this sitting's screens. */
import { check } from "./lib-04b.mjs";
import { WORD_ROWS } from "../../../../bio-plane/src/setup-words/rows.mjs";
import { knocker, J } from "./s-r39.mjs";

const R = (a) => (a && a.result !== undefined ? a.result : a);

export async function overlay(kit, ctx, net) {
  const auth = ctx.watcher, adm = await kit.founder();
  const PREFIX = /^(screen\.(inbox|doorbell|about-knocker|leads|watching|request|start-send|action|due-date|help-records|capture)\.|doorbell\.|act\.(inboxpull|inboxresolve|knocksof|knockerconsent|sourcelink|sourcedisclose|sourceconsent|sourceconsentwithdraw|sourcepersonlink|lead|leadshare|leadlook|monitorset|monitor|monitorpause|monitorslate|namedrequestset|sweepset|sweepratify|entitycreate|filingapprove|filingrecordsent|actioncorrespond|clockadopt|taskforward|taskresolve|taskdecide)\.|refusal\.(KNOCK|RATE_|RESOLVE_|SECRET_|NO_SUCH_KNOCK|SOURCE_|HOST_|CONSENT_|LEAD_|MONITOR|NAMED_|STILL_UNFILLED|ALREADY_|SAME_APPROVER|FILING_|DUE_|COUNTERPARTY|AUTHORITY|UNKNOWN_LAW|NOT_AN_ADMIN)|queue\.(source|authority)|sources\.|capture\.fieldneeded)/;
  const mine = WORD_ROWS.filter((r) => PREFIX.test(r[0]));

  await check("OV-15", "voice and vocabulary on the words of this sitting's screens: 'team' not 'group', no 'secret' or 'confidential', 'Status' not 'Signal', no 'overdue', American spelling, dates as 'October 8, 2026'", "as the member", "scan the product's own word rows for this sitting's screens, acts and refusals", async () => {
    const tests = { group: /\b(the|this|your|a) group('s|\b)/i, secret: /\bsecret/i, confidential: /confidential/i, signal: /\bsignal/i, overdue: /overdue/i, british: /\b(recognis|organis|colour|authoris|behaviour|catalogue)/i, copy: /\bcopy of your|your team's copy|\bcopy\b/i };
    const hits = {};
    for (const [k, re] of Object.entries(tests)) hits[k] = mine.filter((r) => re.test(String(r[1] || ""))).map((r) => r[0]);
    const n = mine.length;
    const saw0 = `${n} word rows of this sitting scanned; hits: ` + Object.entries(hits).map(([k, v]) => `${k} ${v.length}${v.length ? " (e.g. " + v.slice(0, 4).join(", ") + ")" : ""}`).join("; ");
    const overdueHome = hits.overdue.filter((k) => /^screen\.(home|queue)\./.test(k) || /^queue\./.test(k));
    const britishText = mine.filter((r) => tests.british.test(String(r[1] || ""))).map((r) => r[0] + ': "' + (String(r[1]).match(/[^.]*\b(recognis|organis|colour|authoris|behaviour|catalogue)[^.]*/i) || [""])[0].trim().slice(0, 70) + '"');
    const saw = saw0 + `; 'overdue' on Home or the Queue: ${overdueHome.length} (the three hits are on the action and due-date screens, where check 15 allows it); British spellings in member text: ${J(britishText, 600)}`;
    const bad = hits.group.length + hits.secret.length + hits.confidential.length + hits.signal.length + overdueHome.length + britishText.length;
    ctx.vocabHits = hits;
    return [bad ? "BROKEN" : "WORKS", saw + (hits.secret.length ? " | 'secret' is the doorbell's own term for the knocker's made password (check 15 says never 'secret'); MINOR, a wording decision for BOB and the design stream" : "")];
  });

  await check("R214", "every refusal of this sitting carries a plain sentence of its own ('translation'), never only a code or a detail; read what is missing", "as the member", "provoke refusals across the sitting's ops and read each answer's fields", async () => {
    const knock = knocker(kit);
    const rows = [];
    const probe = async (label, p) => { const b = await p; const r = R(b.body || b); rows.push({ label, code: r.reason || r.code, translation: !!r.translation, detail: !!r.detail }); };
    await probe("KNOCK_EMPTY", knock({ contentText: "" }));
    await probe("NO_SUCH_KNOCK", kit.post(auth, "inboxpull", { knockId: "KNOCK-2026-01-01-deadbeef" }));
    await probe("RESOLVE_NO_REASON", kit.post(auth, "inboxresolve", { knockId: "KNOCK-2026-01-01-deadbeef", status: "discarded" }));
    await probe("NO_PSEUDONYM", kit.post(auth, "knocksof", {}));
    await probe("SECRET_NOT_RECOGNISED", kit.plane("/api/?op=knockerconsent", { method: "POST", body: JSON.stringify({ knockerSecret: "z".repeat(25), entry: "SRCE-0000000000000000", audience: "public" }) }).then(async (r) => ({ status: r.status, body: await r.json() })));
    await probe("NO_SUCH_SOURCE", kit.post(auth, "sourcedisclose", { source: "SRC-2026-0000", revealed: { kind: "name", value: "x" }, how: "self", knownTo: "group", recorded: false, evidence: "x" }));
    await probe("MONITOR_SET_REFUSED", kit.post(auth, "monitorset", { bundleId: ctx.afterModified ? "INFO-2026-0001-city-council-agenda" : "x", enabled: true, frequency: "yearly" }));
    await probe("NAMED_REQUEST_REFUSED", kit.post(auth, "namedrequestset", { bundle: ctx.watchProject, target: { text: "x" }, locators: ["http://x"], authority: "a", criticality: "crucial", cadence: "weekly" }));
    await probe("LEAD_NOT_FOUND", Promise.resolve(kit.get(auth, { op: "leadread", id: "LEAD-2026-0000-none" })));
    await probe("LEAD_SHARE_NOT_A_PARTICIPANT", kit.post(auth, "leadshare", { lead: "LEAD-2026-0000-none", project: "PROJ-2026-9999", reason: "x" }));
    await probe("SOURCE_REFUSED", kit.acquire(auth, { locator: "https://www.refuser.example/pages/refuses.html", project: ctx.watchProject }).then((a) => ({ body: a.body })));
    await probe("NOT_AN_ADMIN", kit.post(auth, "monitorpause", { paused: true, reason: "x" }));
    await probe("NO_SUCH_TASK", kit.post(auth, "taskdecide", { id: "TASK-nope", outcome: "determined", authority: "a", basis: "b" }));
    const noSentence = rows.filter((r) => !r.translation);
    const saw = `${rows.length} refusals read; ${noSentence.length} carry no 'translation' sentence: ${noSentence.map((r) => r.label + (r.code && r.code !== r.label ? "(" + r.code + ")" : "") + (r.detail ? " [detail only]" : " [nothing]")).join(", ") || "none"}; with one: ${rows.filter((r) => r.translation).map((r) => r.label).join(", ")}`;
    return [noSentence.length ? "BROKEN" : "WORKS", saw + " (the wire answer carries no member sentence for those; the screen may supply its own by code, which is not drawn offline: an answer a caller meets with only a code or a detail is overlay check 6's 'never a code, a detail or a raw id')"];
  });

  await check("R215", "act weight by rung: the acts of this sitting as the plane grades them (affordances), against the overlay's expectations", "as the member", "op=affordances; read each act's rung", async () => {
    const a = R(await kit.get(auth, { op: "affordances" }));
    ctx.affordanceKeys = Object.keys(a || {});
    const names = ["inboxpull", "inboxresolve", "knocksof", "sourcedisclose", "sourceconsent", "sourceconsentwithdraw", "sourcelink", "sourcepersonlink", "lead", "leadshare", "leadlook", "monitorset", "monitor", "monitorpause", "namedrequestset", "sweepset", "sweepratify", "entitycreate", "filingapprove", "filingrecordsent", "filingsecondapprove", "templatesave", "actioncorrespond", "clockadopt", "taskforward", "taskresolve", "taskdecide"];
    const pools = { catalog: a.catalog, capture_acts: a.capture_acts, set_acts: a.set_acts, act_help: a.act_help };
    const found = {};
    const walk = (v, where, depth = 0) => {
      if (!v || typeof v !== "object" || depth > 4) return;
      if (Array.isArray(v)) { for (const x of v) walk(x, where, depth + 1); return; }
      const id = v.id || v.op || v.name;
      if (typeof id === "string" && names.includes(id) && !found[id]) found[id] = { rung: v.rung || v.weight || null, where };
      for (const k of Object.keys(v)) { if (names.includes(k) && !found[k] && v[k] && typeof v[k] === "object") found[k] = { rung: v[k].rung || v[k].weight || J(v[k], 60), where }; walk(v[k], where, depth + 1); }
    };
    for (const [k, v] of Object.entries(pools)) walk(v, k);
    const rung = (n) => (found[n] ? `${found[n].rung} (${found[n].where})` : "not in the catalogue");
    const table = names.map((n) => `${n}: ${rung(n)}`).join("; ");
    const fa = rung("filingapprove"), ls = rung("leadshare");
    ctx.rungs = table;
    const listed = names.filter((n) => found[n]).length;
    return [/terminal|ends|signed/i.test(String(fa)) ? "WORKS" : "BROKEN", `the affordances answer's keys ${J(Object.keys(a || {}), 200)}; ${listed} of ${names.length} acts of this sitting are graded in it: ${table}; expected: filingapprove terminal (read: ${fa}); leadshare, entitycreate and attribution open the full dialog whatever their rung (leadshare reads ${ls}); the four button states, the Sounds setting and friction are the screen's, not drawn offline`];
  });

  await check("R216", "the help pages and the glossary: the records-request help page reads its place facts from the places set", "as the member", "read the help-records words and the profile's records lines", async () => {
    const w = WORD_ROWS.filter((r) => /^screen\.help-records\./.test(r[0]));
    return `${w.length} help-records word rows; first: "${String((w[0] || [])[1] || "").slice(0, 140)}"; the page's place facts come from the active profile (op=profiles: state law, the 10-day answer, the city's own ordinance and its portal), read in R100; changing the place and re-reading it is the area 1 sitting's act; the glossary's explain-in-place is a screen behaviour not drawn offline: NOT REACHED for the glossary`;
  });

  await check("R217", "'Help me write this' on the writing boxes of this sitting's screens with no assistant connected: the answer is a guide or a plain 'not ready', never a silent failure", "as the member", "writinghelp for the lead, the source's evidence, the named request, the knock note's screens", async () => {
    const targets = [["lead", "words"], ["sourcedisclose", "evidence"], ["sourceconsent", "evidence"], ["namedrequestset", "description"], ["communicationprepare", "text"], ["actioncorrespond", "account"], ["leadshare", "reason"], ["monitorpause", "reason"]];
    const out = [];
    for (const [op, field] of targets) {
      const r = await kit.post(auth, "writinghelp", { op, field, told: "the clerk says the log was changed" });
      const b = R(r.body);
      out.push(`${op}.${field}: ${r.status} ${b.ok ? "answered " + J(Object.keys(b).slice(0, 5)) : (b.reason || b.code) + (b.translation ? ' "' + String(b.translation).slice(0, 80) + '"' : " [no sentence]")}`);
    }
    const silent = out.filter((x) => /undefined|\[no sentence\]/.test(x));
    return [silent.length ? "BROKEN" : "WORKS", `${out.join("; ")}${silent.length ? " | silent or sentence-less answers: " + silent.length : ""}`];
  });

  await check("R218", "two members change one record at once (base-stamped write, divergence outcome) on a held document's watch setting and a lead's looks", "as the member and a joined partner", "two simultaneous monitorset with different frequencies; two simultaneous leadlooks", async () => {
    const partner = await kit.person("partner");
    const id = ctx.watchedBundle || (R(await kit.get(auth, { op: "monitoring" })).items[0] || {}).bundle;
    const [a, b] = await Promise.all([kit.post(auth, "monitorset", { bundleId: id, enabled: true, frequency: "weekly" }), kit.post(partner, "monitorset", { bundleId: id, enabled: true, frequency: "monthly" })]);
    const after = R(await kit.get(auth, { op: "monitoring" })).items.find((i) => i.bundle === id);
    return `two writers at once on ${id}: ${J([R(a.body).ok ?? R(a.body).reason, R(b.body).ok ?? R(b.body).reason])}; the record then reads frequency ${after && after.frequency} (last write wins, no divergence named, no refusal: monitorset takes no base stamp); the case draft, the objective and a project page are the area 9/10 and area 3 walkers' (R90, R26)`;
  });

  await check("R213", "the working frame at 1280 px, 390 px and in dark mode", "as the member", "nothing is drawn offline", async () => ["NOT REACHED", "Miniflare answers the plane's ops; no screen is drawn, so width, tap size, tables as cards and dark mode are not walked in this offline pass (the live phase walks them at 1280 and 390 px); the words and refusals above are what a screen would draw"]);

  await check("R108", "everyday load: five members at once (rehearsal offline: contention shows as errors, lease holds or a lost write, never as a time bar)", "as five members", "five members read Queue, count, whoami, monitoring, inbox three times at once; a watch tick races a hand capture of the same address", async () => {
    const people = [];
    for (const h of ["loadone", "loadtwo", "loadthree", "loadfour", "loadfive"]) people.push(await kit.person(h));
    const reads = [{ op: "queue", count: "true" }, { op: "whoami" }, { op: "monitoring" }, { op: "inbox" }, { op: "leadlist" }];
    const t0 = Date.now();
    const calls = [];
    for (let rep = 0; rep < 3; rep++) for (const who of people) for (const q of reads) calls.push((async () => { const s = Date.now(); const r = await kit.plane(`/api/?${new URLSearchParams(q)}`, { headers: who }); const body = await r.json().catch(() => null); return { op: q.op, status: r.status, ms: Date.now() - s, st: r.headers.get("server-timing"), ok: body && body.ok !== false }; })());
    const out = await Promise.all(calls);
    const errs = out.filter((x) => x.status >= 400 || !x.ok);
    const by = {};
    for (const x of out) (by[x.op] ||= []).push(x.ms);
    const stat = Object.entries(by).map(([k, v]) => `${k} ${Math.min(...v)}-${Math.max(...v)} ms`).join(", ");
    const stl = out.filter((x) => x.st).length;
    const wall = Date.now() - t0;
    /* a watch tick racing a hand capture of the same address */
    const id = ctx.watchedBundle || (R(await kit.get(auth, { op: "monitoring" })).items[0] || {}).bundle;
    kit.serve("race.html", kit.te("<html><body>raced page, first</body></html>"), { type: "text/html" });
    const got = R((await kit.acquire(auth, { locator: "https://www.race.example/pages/race.html", project: ctx.watchProject })).body);
    const rid = (await ctx.filed("race2.html", "<html><body>baseline</body></html>", "Race page", "www.race2.example"));
    await kit.post(auth, "monitorset", { bundleId: rid, enabled: true, frequency: "daily" });
    kit.serve("race2.html", kit.te("<html><body>changed under the watch</body></html>"), { type: "text/html" });
    const [tick, hand] = await Promise.all([kit.post(auth, "monitor", { bundleId: rid }), kit.acquire(auth, { locator: "https://www.race2.example/pages/race2.html", project: ctx.watchProject })]);
    const docs = R(await kit.get(auth, { op: "list" })).filter((b) => /race page/i.test(b.title || "")).length;
    const again = R((await kit.post(auth, "monitor", { bundleId: rid })).body);
    const afterDocs = R(await kit.get(auth, { op: "list" })).filter((b) => /race page/i.test(b.title || "")).length;
    return [errs.length ? "BROKEN" : "WORKS", `${out.length} reads by 5 members at once in ${wall} ms wall: ${errs.length} errors${errs.length ? " " + J(errs.slice(0, 3), 200) : ""}; per-op wall (Miniflare, not a bar) ${stat}; ${stl} answers carried Server-Timing; the watch tick (${J({ status: R(tick.body).status, ok: R(tick.body).ok, reason: R(tick.body).reason, why: R(tick.body).capture && R(tick.body).capture.why, registered: R(tick.body).capture && R(tick.body).capture.registered }, 360)}) raced a hand capture (${J({ s: hand.status, existed: R(hand.body).existed })}) of the same changed address: documents titled 'Race page' afterwards ${docs}; the next tick (the retry the row expects) -> ${J({ status: again.status, ok: again.ok, reason: again.reason, registered: again.capture && again.capture.registered, why: again.capture && again.capture.why }, 300)}, documents then ${afterDocs}; the five-at-once times against K4354's bars, R-QUIET and the object's timings are the live phase's (Phase 2); this rehearsal is not a pass of R108`];
  });

  await check("R212", "one person alone: with a single administrator and no other member, the founder knocks-and-pulls, records a source, watches an address, writes a request and records it sent", "as the founder alone", "the sitting's chain as the founder with no second account", async () => {
    const knock = knocker(kit);
    const k = await knock({ contentText: "A founder-alone tip about the contract, with a secret.", generateSecret: true });
    const pull = R((await kit.post(adm, "inboxpull", { knockId: k.body.knockId })).body);
    const so = pull.capture ? R(await kit.get(adm, { op: "sourceof", capture: pull.capture.sha256 })) : {};
    const dis = so.sourceId ? R((await kit.post(adm, "sourcedisclose", { source: so.sourceId, revealed: { kind: "attribute", attribute: "role" }, how: "self", knownTo: "group", recorded: false, evidence: "She told me herself." })).body) : {};
    const proj = await kit.projectOf(adm, "Founder alone project");
    const doc = ["---", "id: PENDING", "object_type: action", 'title: "Founder alone request"', "current_state: planned", 'created: "2026-10-25T10:00:00Z"', 'last_updated: "2026-10-25T10:00:00Z"', "project: " + proj, 'action_kind: "records_request"', "counterparty:", '  state: "named"', '  kind: "office"', '  role: "City Clerk"', '  body: "City of Oakland"', "clock: []", "action_basis: []", "correspondence: []", "---", "", "## Action", "", "Founder alone request", ""].join("\n");
    const act = R((await kit.post(adm, "actioncreate", { document: doc })).body);
    const prep = act.id ? R((await kit.post(adm, "communicationprepare", { action: act.id, purpose: "request", text: "Please provide the stamped contracts of October." })).body) : {};
    const ap = prep.id ? R((await kit.post(adm, "filingapprove", { filing: prep.id })).body) : {};
    const sent = prep.id ? R((await kit.post(adm, "filingrecordsent", { filing: prep.id, at: "2026-10-25", account: "the portal", reference: "R999" })).body) : {};
    const steps = { pulled: pull.ok, sourceRecorded: dis.ok, projectMade: !!proj, actionStarted: act.ok, drafted: prep.ok, approved: ap.ok, recordedSent: sent.ok };
    const failed = Object.entries(steps).filter(([, v]) => !v).map(([k]) => k);
    return [failed.length ? "BROKEN" : "WORKS", `${J(steps, 300)}; steps that needed a second account or another party: ${failed.length ? failed.join(", ") + " (" + J({ pull: pull.reason, dis: dis.reason, act: act.reason, prep: prep.reason, ap: ap.reason, sent: sent.reason }, 300) + ")" : "none in this sitting's chain"}; only the hosting-holder record and the once-given advice about a second administrator are permitted`];
  });
}
