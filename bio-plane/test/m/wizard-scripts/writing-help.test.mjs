/* wizard-scripts: writing help in a member's own words, its layer-11 share (T34-90, T34-91; DEC-152, DEC-153; K1837,
   K1841): where it is offered and refused (R24), the no-added-fact check (R25), the request that answers
   ASSISTANT_DRAFT_UNAVAILABLE until the model turn lands (R27), and R12's and R13's share, at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, registration, V, MACHINE, STEPS, step, SCREENS, OPS, MACHINE_REFUSED, MACHINE_DRAFTS } from "./fixture.mjs";
import * as wz from "../../../src/wizard-scripts/index.mjs";

const F = V("frank");
const ON = { on: true, account: { kind: "own", level: "member" } };   /* as the door resolves it: never the key (B4) */
const row = (c) => wz.WIZARD_SCRIPTS_CHECKS[c];
const refused = (r, c, why = "") => {
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, c, c, row(c).check, row(c).translation], `${why} ${JSON.stringify(r).slice(0, 300)}`);
  return r;
};
/* A world registered with the acts `affordances` grades irreversible. */
const helped = () => {
  const w = seeded({ register: false });
  w.wz.wizardRegister(registration({ machineRefused: [...MACHINE_REFUSED, "inquirydivide"], irreversible: ["publish", "publishat", "publishatmove", "newirreversible"],
                                     machineDrafts: [...MACHINE_DRAFTS, "writinghelp", "groupdescriptiondraft"] }));
  return w;
};
const NAMED = ["release", "conclude", "withdrawconclusion", "reopen", "caseratify", "publish", "personexpunge", "bootstrap"];

test("R24 writingHelpAt, in order: AI_KEPT_AWAY while the group keeps its material away and AI_NO_ACCOUNT where no account serves the viewer; WRITING_HELP_REFUSED on every act a machine is refused, every irreversible act, DEC-153 (4)'s named acts, the set-time publishing acts and groupdescriptionset; WRITING_HELP_REASON_FIELD in a field stating the member's reason; WRITING_HELP_DRAFT_HELD where a draft fills the field; offered in a note", () => {
  const w = helped();
  const at = (x) => w.wz.writingHelpAt({ op: "notewrite", field: "text", assistant: ON, ...x });
  assert.deepEqual(at({}), { offered: true }, "negative control: a note");
  assert.deepEqual(at({ op: "testify", field: "observation" }), { offered: true }, "an observation");
  assert.deepEqual(at({ op: "actioncreate", field: "request" }), { offered: true }, "a request");
  for (const assistant of [null, {}, { on: true }]) assert.deepEqual(at({ assistant }), { offered: false, code: "AI_NO_ACCOUNT" }, JSON.stringify(assistant));
  for (const account of [null, "", undefined]) assert.deepEqual(at({ assistant: { on: true, account } }), { offered: false, code: "AI_NO_ACCOUNT" });
  for (const assistant of [{ on: false, account: "ACC-1" }, { on: "true", account: "ACC-1" }])
    assert.deepEqual(at({ assistant }), { offered: true }, `assistant.on is never read (a copy of the condition): ${JSON.stringify(assistant)}`);
  const refusedOps = [...MACHINE_REFUSED, "inquirydivide", "publish", "publishat", "publishatmove", "newirreversible", ...NAMED, "publishatcancel",
                      "groupdescriptionset"];
  for (const op of refusedOps) assert.deepEqual(at({ op, field: "reason", draftHeld: true }), { offered: false, code: "WRITING_HELP_REFUSED" }, op);
  assert.deepEqual(at({ op: "newirreversible" }), { offered: false, code: "WRITING_HELP_REFUSED" }, "an act affordances adds is refused with no change here");
  assert.deepEqual(at({ op: null }), { offered: false, code: "WRITING_HELP_REFUSED" });
  for (const field of ["reason", "endReason", "Reason", " reason "]) assert.deepEqual(at({ field, draftHeld: true }), { offered: false, code: "WRITING_HELP_REASON_FIELD" }, field);
  assert.deepEqual(at({ op: "notewrite", field: "reasoning" }), { offered: true }, "a field not stating a reason");
  for (const draftHeld of [true, { kind: "machine" }, { template: "TPL-1" }]) assert.deepEqual(at({ draftHeld }), { offered: false, code: "WRITING_HELP_DRAFT_HELD" });
  assert.deepEqual(at({ draftHeld: false }), { offered: true });
  assert.deepEqual(wz.HELP_NAMED_REFUSED, NAMED);
  assert.deepEqual(wz.HELP_SET_TIME_REFUSED, ["publishat", "publishatmove", "publishatcancel", "groupdescriptionset"]);
  assert.deepEqual(wz.WRITING_HELP_NAMED, [...NAMED, "publishat", "publishatmove", "publishatcancel", "groupdescriptionset"]);
  assert.ok(Object.isFrozen(wz.WRITING_HELP_NAMED));
  /* the refused acts as read through affordances (B3): the named list, and the two sets as registered, in order */
  assert.deepEqual(w.wz.writingHelpRefused(), { named: wz.WRITING_HELP_NAMED, machine_refused: [...MACHINE_REFUSED, "inquirydivide"],
                                                 irreversible: ["publish", "publishat", "publishatmove", "newirreversible"] });
  assert.deepEqual(seeded({ register: false }).wz.writingHelpRefused(), { named: wz.WRITING_HELP_NAMED, machine_refused: [], irreversible: [] });
  /* pure: before registration only the named lists hold; never throws, writes nothing */
  const w0 = seeded({ register: false });
  assert.deepEqual(w0.wz.writingHelpAt({ op: "filingapprove", field: "text", assistant: ON }), { offered: true }, "registered sets are read as registered");
  assert.deepEqual(w0.wz.writingHelpAt({ op: "conclude", field: "text", assistant: ON }), { offered: false, code: "WRITING_HELP_REFUSED" });
  const before = w.snapshot();
  for (const odd of [undefined, null, { op: {} }, { assistant: 3 }]) assert.doesNotThrow(() => w.wz.writingHelpAt(odd));
  assert.deepEqual(w.snapshot(), before);
});

/* Keep-away set as an administrator sets it (credentials R51), read by credentials' one site (its R35's aiKeptAway). */
const keepAway = (w, on) => assert.equal(w.credentials.aiKeepAwaySet({ on, reason: on ? "We hold residents' records" : null, by: V("erin") }).ok, true);

test("R24 (T37; N765, K231) item 1 answers AI_KEPT_AWAY while credentials.aiKeptAway() answers its refusal, read at each call, before AI_NO_ACCOUNT and every other refusal; a setting that cannot be read and a credentials that cannot be reached are kept away (fail closed); assistant.on is never read", () => {
  const w = helped();
  const at = (x) => w.wz.writingHelpAt({ op: "notewrite", field: "text", assistant: ON, ...x });
  assert.equal(w.credentials.aiKeptAway(), null);
  assert.deepEqual(at({}), { offered: true }, "negative control: off");
  keepAway(w, true);
  assert.equal(w.credentials.aiKeptAway().code, "AI_KEPT_AWAY", "credentials' own answer");
  for (const x of [{}, { assistant: { on: true } }, { assistant: null }, { op: "publish" }, { field: "reason" }, { draftHeld: true }, { assistant: { on: false, account: "A" } }])
    assert.deepEqual(at(x), { offered: false, code: "AI_KEPT_AWAY" }, `first, before every other refusal: ${JSON.stringify(x)}`);
  keepAway(w, false);
  assert.deepEqual(at({}), { offered: true }, "read at the call: turned off, offered again with no change here");
  assert.deepEqual(at({ assistant: { on: true } }), { offered: false, code: "AI_NO_ACCOUNT" });
  /* the setting cannot be read: credentials answers its refusal, saying so, and help is not offered */
  const u = helped();
  u.st.db.exec("DROP TABLE ai_keep_away");
  assert.equal(u.credentials.aiKeptAway().code, "AI_KEPT_AWAY");
  assert.deepEqual(u.wz.writingHelpAt({ op: "notewrite", field: "text", assistant: ON }), { offered: false, code: "AI_KEPT_AWAY" });
  /* credentials cannot be reached, or throws: kept away, never offered */
  for (const credentials of [null, {}, { aiKeptAway() { throw new Error("down"); } }, () => { throw new Error("unreachable"); }]) {
    const x = new wz.WizardScripts({ storage: w.st, record: w.record, membership: w.membership, filingTemplates: w.filingTemplates, credentials });
    x.wizardRegister(registration());
    assert.deepEqual(x.writingHelpAt({ op: "notewrite", field: "text", assistant: ON }), { offered: false, code: "AI_KEPT_AWAY" }, String(credentials));
    assert.deepEqual([x.writingHelp({ op: "notewrite", field: "text", told: "t", assistant: ON }).code], ["AI_KEPT_AWAY"]);
  }
  /* pure: an away not given is no reading; null is off */
  assert.deepEqual(wz.writingHelpAt({ op: "notewrite", field: "text", assistant: ON }), { offered: false, code: "AI_KEPT_AWAY" });
  assert.deepEqual(wz.writingHelpAt({ op: "notewrite", field: "text", assistant: ON }, undefined, null), { offered: true });
  assert.equal(wz.KEPT_AWAY, "AI_KEPT_AWAY");
  /* the factory, given no credentials, reaches credentials' one instance on its own host's storage, on first need */
  const y = wz.wizardScriptsOf({ storage: w.st }, { record: w.record, membership: w.membership, filingTemplates: w.filingTemplates });
  y.wizardRegister(registration());
  assert.deepEqual(y.writingHelpAt({ op: "notewrite", field: "text", assistant: ON }), { offered: true });
  keepAway(w, true);
  assert.deepEqual(y.writingHelpAt({ op: "notewrite", field: "text", assistant: ON }), { offered: false, code: "AI_KEPT_AWAY" });
});

test("R27 (T37; N765, K231) writingHelp answers a keep-away as credentials answers it, its row C-29.31 and keep_away {reason, set_by, set_at}, before AI_NO_ACCOUNT, the other refusals and WRITING_HELP_NOTHING_TOLD, writing nothing", () => {
  const w = helped();
  keepAway(w, true);
  const before = w.snapshot();
  const want = w.credentials.aiKeptAway();
  for (const x of [{}, { told: "" }, { op: "publish" }, { assistant: { on: true } }]) {
    const r = w.wz.writingHelp({ op: "notewrite", field: "text", told: "The gate was locked.", assistant: ON, by: F, viewer: F, ...x });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "AI_KEPT_AWAY", "AI_KEPT_AWAY", want.check, want.translation], JSON.stringify(x));
    assert.deepEqual(r.keep_away, want.keep_away);
    assert.equal(r.keep_away.reason, "We hold residents' records", "the administrator's reason, as credentials holds it");
  }
  assert.equal(want.check, "C-29.31", "credentials' row: the one site");
  assert.ok(!("AI_KEPT_AWAY" in wz.WIZARD_SCRIPTS_CHECKS), "never re-minted here");
  assert.deepEqual(w.snapshot(), before, "writes nothing");
});

test("R25 checkDraft withholds whole each sentence stating a figure, a date, a name or a quotation in neither what the member told nor what the record read holds (WRITING_HELP_FACT_ADDED), never rewriting it; the text answered with its label and stored nowhere", () => {
  const told = "We saw the gate locked at the park on Tuesday. Maria Lopez said it was \"closed for repairs\". About 40 people waited.";
  const draft = ["The park gate was locked on Tuesday.", "Maria Lopez said it was \"closed for repairs\".", "About 40 people waited.",
                 "The council spent 2,000 dollars on it.", "It was locked again on Friday.", "Officer Brandt confirmed it.",
                 "A sign read \"no entry until spring\".", "Everyone was upset."].join(" ");
  const r = wz.checkDraft(draft, { told, askedBy: "h_frank" });
  assert.equal(r.ok, true);
  assert.deepEqual(r.withheld, [
    { sentence: "The council spent 2,000 dollars on it.", code: "WRITING_HELP_FACT_ADDED" },
    { sentence: "It was locked again on Friday.", code: "WRITING_HELP_FACT_ADDED" },
    { sentence: "Officer Brandt confirmed it.", code: "WRITING_HELP_FACT_ADDED" },
    { sentence: "A sign read \"no entry until spring\".", code: "WRITING_HELP_FACT_ADDED" }]);
  assert.equal(r.text, "The park gate was locked on Tuesday. Maria Lopez said it was \"closed for repairs\". About 40 people waited. Everyone was upset.",
               "every other sentence kept whole, in order, unchanged");
  assert.deepEqual(r.label, { kind: "machine", asked_by: "h_frank" });
  /* a fact the record holds, read with the switch on, is not added */
  const read = wz.checkDraft("The council spent 2,000 dollars on it.", { told, readLog: ["Budget line: 2000 dollars, council minutes."], suggestions: true });
  assert.deepEqual([read.ok, read.withheld, read.text], [true, [], "The council spent 2,000 dollars on it."]);
  assert.deepEqual(wz.factsOf("Maria Lopez paid 2,000 on 3 May for \"the fix\".").map((f) => [f.kind, f.value]),
                   [["quotation", "the fix"], ["figure", "2000"], ["figure", "3"], ["date", "may"], ["name", "Maria"], ["name", "Lopez"]]);
  assert.deepEqual(wz.factsOf("I think the gate was locked."), [], "a sentence's first word and I are no names");
  for (const odd of [null, 3, undefined, ""]) assert.deepEqual(wz.checkDraft(odd, { told }).withheld, []);
  assert.doesNotThrow(() => wz.checkDraft("x", null));
});

test("R25 a read is refused while the serving account's suggestions switch is off (WRITING_HELP_SUGGESTIONS_OFF) and on a firsthand field whatever the switch (WRITING_HELP_FIRSTHAND_READ); with nothing read both work from what the member told", () => {
  const told = "The gate was locked on Tuesday.";
  const log = ["Council minutes, 3 May."];
  assert.deepEqual(wz.checkDraft(told, { told, readLog: log, suggestions: false }), { ok: false, code: "WRITING_HELP_SUGGESTIONS_OFF" });
  assert.deepEqual(wz.checkDraft(told, { told, readLog: log }), { ok: false, code: "WRITING_HELP_SUGGESTIONS_OFF" }, "off unless on");
  assert.deepEqual(wz.checkDraft(told, { told, readLog: log, suggestions: true, firsthand: true }), { ok: false, code: "WRITING_HELP_FIRSTHAND_READ" });
  assert.equal(wz.checkDraft(told, { told, readLog: log, suggestions: true }).ok, true, "negative control: the switch on, not firsthand");
  for (const x of [{ suggestions: false }, { firsthand: true }, { firsthand: true, suggestions: true }])
    assert.deepEqual(wz.checkDraft(told, { told, readLog: [], ...x }).text, told, JSON.stringify(x));
  /* firsthand: testify, the registry's act recording what the member saw; the draft adds nothing from the record */
  assert.deepEqual(wz.FIRSTHAND_ACTS, ["testify"]);
  const fh = wz.checkDraft("I saw it on Tuesday. The minutes say 3 May.", { told, firsthand: true });
  assert.deepEqual(fh.withheld.map((x) => x.sentence), ["The minutes say 3 May."]);
});

test("R27 writingHelp answers R24's refusals in order, then WRITING_HELP_NOTHING_TOLD (told empty or over 4,000), and past every refusal ASSISTANT_DRAFT_UNAVAILABLE, the field unchanged, writing nothing; the door calls it with its own assistant", () => {
  const w = helped();
  const before = w.snapshot();
  const ask = (x) => w.wz.writingHelp({ op: "notewrite", field: "text", told: "The gate was locked.", assistant: ON, by: F, viewer: F, ...x });
  refused(ask({}), "ASSISTANT_DRAFT_UNAVAILABLE", "every path past the refusals");
  refused(ask({ op: "testify", field: "observation" }), "ASSISTANT_DRAFT_UNAVAILABLE");
  refused(ask({ told: ["one", "two"] }), "ASSISTANT_DRAFT_UNAVAILABLE");
  refused(ask({ assistant: { on: false, account: ON.account } }), "ASSISTANT_DRAFT_UNAVAILABLE", "assistant.on is not read");
  assert.deepEqual(ask({ assistant: { on: true } }).code, "AI_NO_ACCOUNT");
  refused(ask({ op: "publish", told: "" }), "WRITING_HELP_REFUSED", "before nothing told");
  refused(ask({ op: "bootstrap" }), "WRITING_HELP_REFUSED");
  refused(ask({ field: "reason", told: "" }), "WRITING_HELP_REASON_FIELD");
  refused(ask({ draftHeld: true, told: "" }), "WRITING_HELP_DRAFT_HELD");
  for (const told of ["", "   ", null, [], "x".repeat(4001)]) refused(ask({ told }), "WRITING_HELP_NOTHING_TOLD", JSON.stringify(told).slice(0, 20));
  refused(ask({ told: "x".repeat(4000) }), "ASSISTANT_DRAFT_UNAVAILABLE", "4,000 is within");
  assert.equal(wz.TOLD_MAX, 4000);
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  /* the door routes the op itself and calls writingHelp (B4): no arm of the op table serves it */
  assert.equal("writinghelp" in wz.wizardScriptsOps(w.wz, new URL(`https://x/?viewer=${encodeURIComponent(F)}`), {}), false);
  for (const odd of [undefined, null, 3]) assert.equal(w.wz.writingHelp(odd).code, "AI_NO_ACCOUNT", "never throws");
});

test("R12 a step carrying {machine: writinghelp} or {machine: groupdescriptiondraft} on an act R24 refuses is WIZARD_STEP_CONCLUDES, the registered-draft exception not reaching them; on an own-words act they pass; R13 registers irreversible and both drafts", () => {
  const screens = [...SCREENS, { id: "notes", acts: ["notewrite"] }, { id: "group", acts: ["groupdescriptionset"] }, { id: "sched", acts: ["publishat"] },
                   { id: "inst", acts: ["bootstrap"] }];
  const reg = { screens, ops: [...OPS, "notewrite", "groupdescriptionset", "publishat", "bootstrap"], machineRefused: MACHINE_REFUSED,
                machineDrafts: [...MACHINE_DRAFTS, "writinghelp", "groupdescriptiondraft"], irreversible: ["publish", "publishat"] };
  const on = (screen, act, machine) => wz.checkScript([step(screen, act, { draft: { machine } }), STEPS[0]], reg).refusals.map((x) => [x.code, x.step]);
  for (const machine of ["writinghelp", "groupdescriptiondraft"]) {
    assert.deepEqual(on("notes", "notewrite", machine), [], `${machine} on a note`);
    for (const [screen, act] of [["publish", "publish"], ["filing-draft", "filingapprove"], ["sched", "publishat"], ["group", "groupdescriptionset"], ["inst", "bootstrap"]])
      assert.deepEqual(on(screen, act, machine), [["WIZARD_STEP_CONCLUDES", 1]], `${machine} on ${act}`);
  }
  assert.deepEqual(on("publish", "publish", "whatchangedpropose"), [], "control: the exception stands for the other registered drafts");
  assert.deepEqual(on("notes", "notewrite", "nothere"), [["WIZARD_DRAFT_REFUSED", 1]]);
  assert.deepEqual(wz.HELP_DRAFTS, ["writinghelp", "groupdescriptiondraft"]);
  /* a registration with both drafts and the irreversible acts, through the instance */
  const w = helped();
  assert.deepEqual(w.wz.wizardCheck({ steps: [step("case-home", "casenote", { draft: { machine: "writinghelp" } }), STEPS[1]], viewer: F }).refusals, []);
  assert.deepEqual(w.wz.wizardCheck({ steps: [step("publish", "publish", { draft: { machine: "writinghelp" } }), STEPS[1]], viewer: MACHINE }).refusals
    .map((x) => x.code), ["WIZARD_STEP_CONCLUDES"]);
});

test("R20 T34's rows: WIZARD_VIA_REFUSED and the eight writing-help rows are C-131.33 to C-131.41, in the requirement's order; DEC-149: WIZARD_DRAFT_REFUSED's translation says \"your group's Civicsmith\", never \"the instance\"", () => {
  const want = ["WIZARD_VIA_REFUSED", "WRITING_HELP_REFUSED", "WRITING_HELP_REASON_FIELD", "WRITING_HELP_DRAFT_HELD", "WRITING_HELP_NOTHING_TOLD",
                "WRITING_HELP_FACT_ADDED", "WRITING_HELP_SUGGESTIONS_OFF", "WRITING_HELP_FIRSTHAND_READ", "ASSISTANT_DRAFT_UNAVAILABLE"];
  assert.deepEqual(want.map((c) => row(c).check), want.map((_, i) => `C-131.${33 + i}`));
  assert.equal(row("ASSISTANT_DRAFT_UNAVAILABLE").translation, "The assistant cannot draft this yet. Write it in your own words; nothing was changed.");
  assert.equal(row("WRITING_HELP_REASON_FIELD").translation, "The assistant never words your reason for an act: your reasons are yours alone. Nothing was changed.");
  assert.equal(row("WIZARD_DRAFT_REFUSED").translation, "A step's draft is the script's own words, a filing template offered here, or a labelled machine draft "
    + "your group's Civicsmith registers, and this one is none of them.");
  for (const [code, r] of Object.entries(wz.WIZARD_SCRIPTS_CHECKS))
    for (const word of [/this instance/i, /the instance/i, /this copy/i, /this plane/i, /the plane/i, /\bserver\b/i]) assert.ok(!word.test(r.translation), `${code}: ${word}`);
});

test("R27 (T41; N812, K2373) the door's refusals of the account and its limit, ai-use R3's AI_LIMIT_REACHED and credentials' AI_USE_SWITCHED_OFF (and a fail-closed one), are answered as given, after R24's codes and WRITING_HELP_NOTHING_TOLD and before any model turn; a door's AI_NO_ACCOUNT at R24 item 1's place; the retired ceiling codes are named nowhere", () => {
  const w = helped();
  const before = w.snapshot();
  const limit = { ok: false, reason: "AI_LIMIT_REACHED", code: "AI_LIMIT_REACHED", check: "C-143.3", translation: "Your limit is reached.",
                  whose: "member", scope: "draft", unit: "usd", period: "day" };
  const off = { ok: false, reason: "AI_USE_SWITCHED_OFF", code: "AI_USE_SWITCHED_OFF", check: "C-29.40", translation: "Switched off.", use: "draft" };
  const unreadable = { ok: false, reason: "LIMITS_UNREADABLE", code: "LIMITS_UNREADABLE" };
  const none = { ok: false, reason: "AI_NO_ACCOUNT", code: "AI_NO_ACCOUNT", check: "C-22.1", translation: "No account serves you." };
  const ask = (refusal, x = {}) => w.wz.writingHelp({ op: "notewrite", field: "text", told: "The gate was locked.", by: F, viewer: F,
                                                      assistant: { on: true, account: ON.account, refusal }, ...x });
  for (const door of [limit, off, unreadable]) {
    assert.deepEqual(ask(door), { ...door, op: "notewrite" }, `${door.code}: as given, never re-minted`);
    assert.deepEqual(ask(door, { assistant: { on: true, refusal: door } }), { ...door, op: "notewrite" }, `${door.code}: with no account named, still not AI_NO_ACCOUNT`);
    /* R24's codes and NOTHING_TOLD come first */
    refused(ask(door, { op: "publish" }), "WRITING_HELP_REFUSED", door.code);
    refused(ask(door, { field: "reason" }), "WRITING_HELP_REASON_FIELD", door.code);
    refused(ask(door, { draftHeld: true }), "WRITING_HELP_DRAFT_HELD", door.code);
    refused(ask(door, { told: "" }), "WRITING_HELP_NOTHING_TOLD", door.code);
  }
  /* the door's AI_NO_ACCOUNT stands at R24 item 1's place: before WRITING_HELP_REFUSED */
  for (const code of ["AI_NO_ACCOUNT", "NO_ACCOUNT"]) {
    const n = { ...none, reason: code, code };
    assert.deepEqual(ask(n, { assistant: { on: true, account: null, refusal: n }, op: "publish", told: "" }), { ...n, op: "publish" }, code);
  }
  /* negative control: no door refusal, the request reaches the model turn's place */
  refused(ask(undefined), "ASSISTANT_DRAFT_UNAVAILABLE");
  refused(ask({ ok: true }), "ASSISTANT_DRAFT_UNAVAILABLE", "an answer that is no refusal is not one");
  /* a keep-away still comes first of all */
  keepAway(w, true);
  assert.equal(ask(limit, { op: "publish", told: "" }).code, "AI_KEPT_AWAY");
  keepAway(w, false);
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  for (const retired of ["AI_USE_CEILING_REACHED", "AI_USE_COPY_CEILING_REACHED"]) assert.ok(!(retired in wz.WIZARD_SCRIPTS_CHECKS), retired);
});

test("R27 (T41; K2592; credentials R57) writingHelp's own keep-away asks credentials.aiKeptAway({use: \"draft\"}): a keep-away covering only ask does not refuse a draft the door admits; one covering draft (or every use) still refuses AI_KEPT_AWAY; R24's offer reads the same", () => {
  const w = helped();
  const ask = (x = {}) => w.wz.writingHelp({ op: "notewrite", field: "text", told: "The gate was locked.", assistant: ON, by: F, viewer: F, ...x });
  const set = (on, uses) => assert.equal(w.credentials.aiKeepAwaySet({ on, uses, reason: on ? "We hold residents' records" : null, by: V("erin") }).ok, true);
  set(true, ["ask"]);
  assert.ok(w.credentials.aiKeptAway({ use: "ask" }), "control: the group keeps its material away from ask");
  refused(ask(), "ASSISTANT_DRAFT_UNAVAILABLE", "a keep-away covering only ask: the draft passes to the model turn's place");
  assert.deepEqual(w.wz.writingHelpAt({ op: "notewrite", field: "text", assistant: ON }), { offered: true });
  for (const uses of [["draft"], ["ask", "draft"], null]) {
    set(true, uses);
    const want = w.credentials.aiKeptAway({ use: "draft" });
    const r = ask();
    assert.deepEqual([r.code, r.check, r.keep_away], ["AI_KEPT_AWAY", want.check, want.keep_away], `negative control: covering ${JSON.stringify(uses)}`);
    assert.deepEqual(w.wz.writingHelpAt({ op: "notewrite", field: "text", assistant: ON }), { offered: false, code: "AI_KEPT_AWAY" });
  }
  /* the question asked is exactly {use: "draft"} */
  const asked = [];
  const x = new wz.WizardScripts({ storage: w.st, record: w.record, membership: w.membership, filingTemplates: w.filingTemplates,
                                   credentials: { aiKeptAway: (a) => { asked.push(a); return null; } } });
  x.migrate();
  x.wizardRegister(registration());
  refused(x.writingHelp({ op: "notewrite", field: "text", told: "t", assistant: ON }), "ASSISTANT_DRAFT_UNAVAILABLE");
  assert.deepEqual(asked, [{ use: "draft" }]);
  assert.equal(wz.KEEP_AWAY_USE, "draft");
});
