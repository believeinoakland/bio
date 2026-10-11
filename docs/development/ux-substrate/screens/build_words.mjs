// The interface's word list for translation (DEC-157, DEC-179; BOB's B90 for N669 and N670): every fixed word and phrase
// the member screens use, each with the stable key a translation is known by and whether it is protected (DEC-157 (4)).
// Read from the same sources the mockups are drawn from, so the list cannot drift from the screens:
// mock-acts.js (ACT_HELP), mock-kit.js (WNAME, WEIGHT, OUTWARD, the draft labels), mock-shell.js (RAIL, TABS, the guide),
// mock-refs.js (SCREEN_HELP, RAIL_HELP, COL_HELP), page.src.html (the marks' explanations), registry.json (screen and act
// names), library.json (Civicsmith's wizard scripts). Sentences on a screen that carry its data (names, counts, dates) are
// not here: they become keyed strings with placeholders when each screen is built, under the same key scheme and rules.
// Run: node docs/development/ux-substrate/screens/build_words.mjs   (writes words.json beside it; fails on any drift)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const R = f => fs.readFileSync(path.join(HERE, f), 'utf8');
const fail = m => { console.error('build_words: ' + m); process.exit(1); };

// the mockup scripts, evaluated as the page evaluates them (functions that touch the DOM are never called here)
const ctx = vm.createContext({ console, CSS: { escape: s => s } });
const js = ['mock-acts.js', 'mock-kit.js', 'mock-screens.js', 'mock-shell.js', 'mock-refs.js'].map(R).join('\n')
  + '\n;globalThis.__W = { ACT_HELP, WNAME, WEIGHT, OUTWARD: [...OUTWARD], RAIL, TABS, SCREEN_HELP, RAIL_HELP, COL_HELP, WRITE_ACT };';
vm.runInContext(js, ctx);
const W = ctx.__W;
const page = R('page.src.html');
const shell = R('mock-shell.js');
const kit = R('mock-kit.js');
const g0 = page.indexOf('var G = {'), g1 = page.indexOf('window.CS_LEVEL', g0);
if (g0 < 0 || g1 < 0) fail('the marks table (var G) was not found in page.src.html');
const G = vm.runInNewContext('(' + page.slice(g0 + 'var G = '.length, g1).trim().replace(/;\s*$/, '') + ')');
const reg = JSON.parse(R('registry.json')).screens;
const lib = JSON.parse(R('library.json')).scripts;

const plain = s => String(s).replace(/<span class=["']?more["']?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const words = [];
const seen = new Set();
const add = (key, en, prot, source, note) => {
  if (seen.has(key)) fail('duplicate key ' + key);
  if (!en || !String(en).trim()) fail('empty text for ' + key);
  seen.add(key);
  if (/\b(DEC|K)-?\d{2,4}\b|\bN\d{3}\b/.test(plain(en))) fail(`an internal code in member words: ${key}`);
  words.push({ key, en: plain(en), protected: !!prot, source, ...(note ? { note } : {}) });
};
// a phrase written here by hand must appear, word for word, in the source it names (a drift guard)
const must = (src, name, s) => { if (!src.includes(s)) fail(`"${s}" is no longer in ${name}`); return s; };
const opkey = op => op.startsWith('owed:') ? 'owed_' + op.slice(5).split(' ')[0] : op;
const weightOf = op => W.WEIGHT[opkey(op)] || 2;

// 1. Weights: the five names and what each means (protected: the weights, DEC-157 (4))
W.WNAME.forEach((n, i) => { if (!i) return; add(`weight.${n.toLowerCase()}.name`, n, true, 'mock-kit.js WNAME'); });
for (const [n, t] of Object.entries(G.weight)) add(`weight.${n.toLowerCase()}.means`, t, true, 'page.src.html marks');
add('weight.dots.means', must(page, 'page.src.html', 'The dots show how much the act weighs, from one to five.'), true, 'page.src.html marks');

// 2. The marks: fixed terms (protected)
for (const [k, [name, means]] of Object.entries(G.scale)) {
  add(`mark.scale.${k}.name`, name, true, 'page.src.html marks');
  add(`mark.scale.${k}.means`, means, true, 'page.src.html marks');
}
add('mark.grade.reading', must(page, 'page.src.html', 'A is easiest to check; D rests on a person\\\'s word. A grade never says whether something is true.').replace(/\\'/g, "'"), true, 'page.src.html marks');
for (const [k, t] of Object.entries(G.gap)) { add(`mark.gap.${k}.name`, (t.match(/<b>([^<]+)<\/b>/) || [])[1], true, 'page.src.html marks'); add(`mark.gap.${k}.means`, t, true, 'page.src.html marks'); }
for (const [k, t] of Object.entries(G.origin)) { add(`mark.origin.${k}.name`, (t.match(/<b>([^<]+)<\/b>/) || [])[1], true, 'page.src.html marks'); add(`mark.origin.${k}.means`, t, true, 'page.src.html marks'); }
for (const [k, t] of Object.entries(G.kind)) { add(`mark.kind.${k}.name`, (t.match(/<b>([^<]+)<\/b>/) || [])[1], true, 'page.src.html marks'); add(`mark.kind.${k}.means`, t, true, 'page.src.html marks'); }
for (const [k, t] of Object.entries(G.path)) add(`mark.path.${k.toLowerCase().replace(/\s+/g, '-')}.means`, t, true, 'page.src.html marks');
const fixed = [
  ['mark.strength.means', 'An answer is only as strong as the weakest thing it depends on'],
  ['mark.due.means', 'counted on your group\\\'s local day.'],
  ['mark.hint.means', 'something the machine marked worth a look, with how it was found and out of how many. A lead, never a finding.'],
  ['mark.hunch.means', 'a member\\\'s suspicion, labelled as one. Never evidence, and it never moves a finding.'],
  ['mark.outward.means', 'this leaves your group\\\'s Civicsmith. Someone outside will see it.'],
  ['mark.band.means', 'this band says who can see what you are working on.'],
];
const tipLine = (key, frag) => {
  must(page, 'page.src.html', frag);
  const i = page.indexOf(frag), a = page.lastIndexOf("'", i - 1), b = page.indexOf("'", i + frag.length);
  // the whole quoted string the fragment sits in, as tipFor returns it
  let s = page.slice(a + 1, b);
  while (s.endsWith('\\')) { const c = page.indexOf("'", b + 1); s = page.slice(a + 1, c); }
  return s.replace(/\\'/g, "'");
};
for (const [key, frag] of fixed) add(key, tipLine(key, frag), true, 'page.src.html marks');
add('mark.tag.protected.means', tipLine('', 'it protects members, so a change to it needs a second check before it shows'), true, 'page.src.html marks');
add('mark.tag.local-name.means', tipLine('', 'the official name stays as it is, with an explanation in the member'), true, 'page.src.html marks');
add('mark.hint.label', must(kit, 'mock-kit.js', 'Hint · machine work'), true, 'mock-kit.js hint');
add('mark.kind.todo.label', 'To do', true, 'mock-kit.js kindm');
add('mark.kind.noticed.label', 'Noticed', true, 'mock-kit.js kindm');
add('mark.kind.status.label', 'Status', true, 'mock-kit.js kindm');
for (const p of ['Working', 'Shared for review', 'Published']) add(`mark.path.${p.toLowerCase().replace(/\s+/g, '-')}.name`, must(kit, 'mock-kit.js', `'${p}'`).slice(1, -1), true, 'mock-kit.js pathm');

// 3. The ordinary states (DEC-98): one vocabulary everywhere ("Undetermined, because…" is a fixed term, protected)
add('state.empty', 'Nothing here', false, 'DEC-98');
add('state.loading', 'Still loading', false, 'DEC-98');
add('state.failed', 'Could not read this, because {reason}', false, 'DEC-98', 'the reason always follows');
add('state.undetermined', 'Undetermined, because {reason}', true, 'DEC-98', 'the reason always follows');

// 4. Labelled drafts (DEC-120 G5, DEC-153): who wrote what is in a field
for (const [k, s] of [['machine', 'Draft by the assistant, at your request · edit it until it is yours'], ['template', 'Draft from your group\\\'s template · edit it until it is yours'], ['wizard', 'Draft from the wizard · edit it until it is yours']])
  add(`draft.${k}.label`, must(kit, 'mock-kit.js', s).replace(/\\'/g, "'"), false, 'mock-kit.js field');
add('draft.writing-help.act', 'Help me write this', false, 'mock-kit.js writeHelp');

// 4a. Photos in a published case (DEC-180, DEC-183): the reminder, the copy's label and the Photos step's words (protected: they say
//     who can see something)
const scr = R('mock-screens.js');
add('photo.reminder', must(scr, 'mock-screens.js', 'Frame what you are checking, and leave out people\\\'s faces and number plates where you can. If a published case carries this photo, anyone in it who is not part of a finding, and any number plate, is obscured in the public copy; the original stays inside your group.').replace(/\\'/g, "'"), true, 'mock-screens.js PHOTO_REMINDER');
add('photo.obscured.label', must(scr, 'mock-screens.js', 'Faces, plates and camera details removed for publication; the group holds the original'), true, 'mock-screens.js ceremony', 'the label a published copy with marked areas carries');
add('photo.published.label', must(scr, 'mock-screens.js', 'Camera details removed for publication; the group holds the original'), true, 'mock-screens.js ceremony', 'the label every other published photo carries (K2248)');
add('photo.step.gate', must(scr, 'mock-screens.js', 'Every photo the case carries must be checked before signing, including one that only supports a finding: marked, or “nothing to obscure”. A mark that covers the wrong thing is withdrawn with a reason, never erased. Text read from a photo, such as a number plate, is never published with it; a passage you quote in the case still is.'), true, 'mock-screens.js ceremony');
add('photo.state.nothing', must(scr, 'mock-screens.js', 'nothing to obscure'), true, 'mock-screens.js ceremony');
add('photo.refused.format', 'This photo\'s format can\'t be obscured: {photo}. Capture it again as an ordinary photo, or stop relying on it.', true, 'DEC-183', 'PHOTO_NOT_COVERABLE');
add('photo.refused.changed', 'A mark changed after this case was prepared. Prepare it again before signing.', true, 'DEC-183', 'PHOTO_MARKS_CHANGED_SINCE');
add('photo.refused.unchecked', 'Signing waits until every photo in the case is checked, including one that only supports a finding: {photo}.', true, 'DEC-183', 'the Photos step as a gate');
add('photo.refused.changed.signed', 'This case wasn\'t published: a mark on {photo} changed after it was prepared. Prepare it again, and sign it again.', true, 'DEC-187', 'PHOTO_MARKS_CHANGED_SINCE at the commit or a scheduled stop, after signing');
add('photo.withdraw.refused.machine', 'Only a member can withdraw a mark; the machine never can.', true, 'DEC-187', 'obscuremarkwithdraw by a machine');
add('photo.withdraw.refused.nomark', 'There is no such mark on {photo}. Open the photo again to see the marks that stand.', true, 'DEC-187', 'obscuremarkwithdraw: no such mark');
add('photo.withdraw.refused.already', '{member} already withdrew this mark on {date}.', true, 'DEC-187', 'obscuremarkwithdraw: already withdrawn');
add('photo.withdraw.refused.noreason', 'Say why you are withdrawing this mark. Your reason is kept beside it.', true, 'DEC-187', 'obscuremarkwithdraw: no reason');

// 4b. Choosing a handle (DEC-184): what the field says as a member types
add('handle.free', '{handle} is free in {group}', false, 'mock-screens.js join');
must(scr, 'mock-screens.js', 'mai-k is free in Lakeshore Tenants');
add('handle.taken', '{handle} is already taken in {group}. Try another, such as {suggestion}.', false, 'mock-screens.js join');
must(scr, 'mock-screens.js', 'is already taken in Lakeshore Tenants. Try another, such as');
add('handle.changeable', 'You can still change it: none of your work is in a published case yet.', false, 'mock-screens.js account');
must(scr, 'mock-screens.js', 'You can still change it: none of your work is in a published case yet.');
add('handle.fixed', 'Your handle is fixed: your work is in a published case ({case}).', false, 'DEC-186');
add('handle.formerly', 'formerly {handle}', false, 'mock-screens.js members');
must(scr, 'mock-screens.js', 'formerly dev-o');
add('handle.characters', 'A handle uses only lower-case letters, digits and hyphens.', false, 'mock-screens.js join');
must(scr, 'mock-screens.js', 'A handle uses only lower-case letters, digits and hyphens');

add('handle.refused.unchecked', 'Civicsmith couldn\'t check whether your work is in a published case, so your handle wasn\'t changed. Try again in a moment.', false, 'DEC-188', 'HANDLE_CHANGE_UNCHECKED');
add('handle.refused.paused', 'Too many handles checked in a short time. Try again in {minutes} minutes.', false, 'DEC-188', 'HANDLE_CHECK_PAUSED');
add('handle.refused.notmember', 'Only a member can change their own handle.', false, 'DEC-188', 'HANDLE_CHANGE_NOT_A_MEMBER');

// 4c. AI accounts and limits (DEC-188; N812): who pays, what for, up to what; protected where they say who sees what
add('ai.whopays', must(scr, 'mock-screens.js', 'For a member\\\'s act in a project that has its own AI account, that project\\\'s account pays. Otherwise the member\\\'s own account, if they connected one; otherwise the group\\\'s key. The account chosen is the one used: if it has reached a limit, or that use is switched off on it, the assistant stops for that act and says whose setting stopped it.').replace(/\\'/g, "'"), true, 'mock-screens.js AI_WHO_PAYS');
for (const [k, name] of [['ask', 'Asking'], ['draft', 'Drafting'], ['run', 'Runs'], ['standing', 'Standing questions'], ['transcribe', 'Reading page pictures'], ['explore', 'Exploring'], ['suggestions', 'Suggestions']]) add(`ai.use.${k}.name`, name, false, 'mock-screens.js AI_USES');
for (const [k, t] of [['no', 'No'], ['ask', 'Ask every day'], ['yes', 'Yes']]) add(`ai.explore.${k}`, t, false, 'mock-screens.js aiExplore');
add('ai.whose.group', 'your group\'s', false, 'DEC-188', 'whose, in the refusals');
add('ai.whose.project', 'this project\'s', false, 'DEC-188', 'whose, in the refusals');
add('ai.whose.own', 'your own', false, 'DEC-188', 'whose, in the refusals');
add('ai.refused.limit', 'The assistant stopped here: {whose} {period} limit for {use} is reached. It works again {when}. Everything else works as usual.', true, 'DEC-188', 'AI_LIMIT_REACHED, scope a use; {period} daily or monthly; never a cost');
add('ai.refused.limit.overall', 'The assistant stopped here: {whose} {period} limit is reached. It works again {when}. Everything else works as usual.', true, 'DEC-188', 'AI_LIMIT_REACHED, scope overall');
add('ai.refused.limit.member', 'The assistant stopped here: you have used the {period} amount each member may use of {whose} account. It works again {when}. Everything else works as usual.', true, 'DEC-188', 'AI_LIMIT_REACHED, scope per_member');
add('ai.refused.off', '{Use} is switched off on {whose} account, so the assistant can\'t do this here. {who} can switch it on.', true, 'DEC-188', 'AI_USE_SWITCHED_OFF; {who}: An administrator, An owner of this project, You');
add('ai.refused.projectkeptaway', 'This project keeps its material away from AI{for_uses}. {member} set this on {date}: “{reason}”. Everything else in the project works as usual.', true, 'DEC-188', 'PROJECT_AI_KEPT_AWAY; {for_uses} empty, or " for exploring"');
add('ai.refused.notsole', 'Your own sign-in can be a project\'s account only while you are its only member, and {project} has other members. Add an Anthropic API key for the project instead.', true, 'DEC-188', 'PROJECT_NOT_SOLE_MEMBER');
add('ai.disclosure.projectkey', must(scr, 'mock-screens.js', 'Your questions in Pothole repairs, and the material read to answer them, go to Anthropic under the project\'s API account. Its owners see how much is used in total, never what you ask or who asked.').replace(/\\'/g, "'").replace('Pothole repairs', '{project}'), true, 'mock-screens.js projectai', 'PROJECT_KEY_NOTICE_DUE shows it before the first act the key pays for');
add('ai.refused.noticedue', 'Before the assistant works on {project}\'s account, read what that means.', true, 'DEC-188', 'PROJECT_KEY_NOTICE_DUE');
add('ai.refused.switchvalue', 'That isn\'t a setting this switch takes: a use is on or off, and exploring is No, Ask every day or Yes.', false, 'DEC-188', 'SWITCH_VALUE_INVALID');
add('ai.refused.signinnotconnected', 'Connect your own Claude sign-in first, in Settings › The assistant; then it can serve this project.', false, 'DEC-188', 'SIGNIN_NOT_CONNECTED');
add('ai.refused.limitinvalid', 'That limit can\'t be set: {field}. A limit is a positive amount in dollars, tokens or calls, for a day or a month.', false, 'DEC-188', 'AI_LIMIT_INVALID');
add('ai.refused.unitunavailable', 'A limit in dollars needs an API key: a subscription doesn\'t report what a use costs. Set it in tokens or calls instead.', false, 'DEC-188', 'LIMIT_UNIT_UNAVAILABLE');
add('ai.refused.explorenotenabled', 'Exploring is off on {whose} account. Its owners can switch it on.', false, 'DEC-189', 'EXPLORE_NOT_ENABLED; an exploring limit is never required (ai-use R3): the overall limit judges exploring when no exploring limit is set');
add('ai.queue.limitreached', '{account} reached its {period} limit for {use} on {date}. It pauses {use} until {when}; its other uses go on.', true, 'DEC-189', 'the told-once Noticed item, scope a use; names no member');
must(scr, 'mock-screens.js', 'reached its monthly limit for runs on 14 October. It pauses runs until 1 November; its other uses go on.');
add('ai.queue.suspended', must(scr, 'mock-screens.js', 'a second member joined, and a sign-in serves a project only while it has one member. Members\\\' acts there now use their own accounts, or the group\\\'s key.').replace(/\\'/g, "'").replace(/^/, 'Your sign-in no longer serves {project}: '), true, 'mock-screens.js queue', 'the project account suspended; names no member');
add('ai.queue.exploreask', 'The assistant found something worth exploring in {scope} today: {what}. Explore it today on {account}? If nobody says yes today, it doesn\'t.', false, 'DEC-188', 'the daily Ask, shown as Noticed with Explore today');
must(scr, 'mock-screens.js', 'If nobody says yes today, it doesn\\\'t.');
add('ai.label.explored', 'Machine work · found while exploring · enabled by {owner}', true, 'DEC-189', 'shown only to the paying account\'s owners (question-explorer R5); {owner}: the group, the project\'s name, or the member\'s handle');
add('ai.label.explored.member', must(scr, 'mock-screens.js', 'Machine work · found while exploring'), true, 'DEC-189', 'what every other member sees: which account paid, and who enabled it, are answered only to its owners');
add('ai.owner.group', 'the group', false, 'DEC-188', 'enabled_by for the group');

// 4c'. The fills of the AI sentences (DEC-189; BOB's B124 and B126): each placeholder above that names a fixed word has a key
for (const [k, t] of [['day', 'daily'], ['month', 'monthly']]) add(`ai.period.${k}`, t, false, 'DEC-189', '{period}');
add('ai.when.day', 'tomorrow', false, 'DEC-189', '{when} for a daily limit');
add('ai.when.month', 'on {month} 1', false, 'DEC-189', '{when} for a monthly limit; {month} from date.month.*');
['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  .forEach(m => add(`date.month.${m}`, m[0].toUpperCase() + m.slice(1), false, 'DEC-189', 'a month\'s name in a sentence'));
add('ai.refused.limit.unjudged', 'The assistant stopped here: Civicsmith couldn\'t check the use of {whose} account just now, and it spends nothing it can\'t count. Try again in a moment. Everything else works as usual.', true, 'DEC-189', 'AI_LIMIT_REACHED when the limit can\'t be judged (ai-use R3 failing closed); in place of a {period} and {when}');
for (const [k, t] of [
  ['owner', 'it doesn\'t say which account it is for'],
  ['scope', 'that isn\'t something a limit can cover'],
  ['unit', 'that isn\'t a unit a limit takes'],
  ['period', 'that isn\'t a period a limit takes'],
  ['amount', 'that isn\'t an amount a limit takes'],
  ['inclusive', 'only a limit on one use can be on top of the overall limit'],
  ['use', 'that isn\'t one of the assistant\'s uses'],
  ['count', 'the count is a whole number, one or more'],
]) add(`ai.limitfield.${k}`, t, false, 'DEC-189', '{field} in ai.refused.limitinvalid');
for (const [k, t] of [['ask', 'asking'], ['draft', 'drafting'], ['run', 'runs'], ['standing', 'standing questions'], ['transcribe', 'reading page pictures'], ['explore', 'exploring'], ['suggestions', 'suggestions']])
  add(`ai.use.${k}.inline`, t, false, 'DEC-189', '{use} inside a sentence; {Use} at a sentence\'s start is ai.use.*.name');
add('ai.account.group', 'Your group\'s key', false, 'DEC-189', '{account} at a sentence\'s start');
add('ai.account.project', '{project}\'s account', false, 'DEC-189', '{account} at a sentence\'s start');
add('ai.account.own', 'Your own account', false, 'DEC-189', '{account} at a sentence\'s start');
add('ai.account.group.inline', 'your group\'s key', false, 'DEC-189', '{account} inside a sentence');
add('ai.account.project.inline', 'the project\'s account', false, 'DEC-189', '{account} inside a sentence');
add('ai.account.own.inline', 'your own account', false, 'DEC-189', '{account} inside a sentence');
add('ai.queue.limitreached.overall', '{account} reached its {period} limit on {date}. Uses counted in its overall limit pause until {when}; uses with their own limit on top of it go on.', true, 'DEC-189', 'the told-once Noticed item, scope overall; names no member');
add('ai.queue.limitreached.member', '{account}: a member reached the {period} amount each member may use, on {date}. Their uses on it pause until {when}; other members\' go on.', true, 'DEC-189', 'the told-once Noticed item, scope per_member; names no member');
add('ai.scope.group', 'your group\'s work', false, 'DEC-189', '{scope} in ai.queue.exploreask for the group\'s key');
add('ai.scope.own', 'your own questions', false, 'DEC-189', '{scope} in ai.queue.exploreask for a member\'s own account; a project\'s is its name');

// 4c''. Queue items from steps, milestones, projects and reviews (DEC-189; BOB's B126 (2), notice-producers R17): each kind's
//     one-line summary and its detail, told once
for (const [k, sum, det, note] of [
  ['question-find', 'Found while looking into {question}: {what}', 'The assistant found this while looking into a question you can see. It is a lead, not evidence: it becomes evidence only if a member opens it, checks it and cites the source.', 'FINDING, Hint · machine work; labelled with ai.label.explored or ai.label.explored.member'],
  ['step-later-found', 'Found later: {what}', 'You looked for this on {date} and didn\'t find it; it has since arrived. Your earlier look stays as it was, dated. Open the step to say whether this changes what it shows for each question.', 'FINDING'],
  ['step-date-due', 'Past its date: {step}', 'You set {date} for this step, and it isn\'t done. Only you are told. Finish it, move the date, or end it with a reason.', 'OBLIGATION, to the member who set the date'],
  ['step-reminder', 'Your reminder: {step}', 'You asked to be reminded about this step today. Only you are told.', 'OBLIGATION, to the member who asked'],
  ['step-cost-shared', 'Shared work: {step}', 'This step\'s costs ({totals}) serve questions that {projects} each draw on. Its owners are told, so they can talk about sharing the cost; Civicsmith records no split and no payment.', 'FINDING, to the owners of each project'],
  ['step-cost-message', 'A message about the cost of {step}', '{member}, an owner of another project that draws on this step, wrote: “{text}”', 'FINDING, to the owners of each other project'],
  ['milestone-overdue', 'Overdue: {milestone}', 'This milestone was due on {date}. Everyone who joined the project is told once.', 'FINDING'],
  ['milestone-reminder', 'Your reminder: {milestone}', 'You asked to be reminded about this milestone today. Only you are told.', 'OBLIGATION, to the member who asked'],
  ['project-quiet', 'Quiet: {project}', 'Nothing has moved in this project for a while. Where it stands: {progress}. You can write it up and act, keep watching its sources, close it with what remains unknown, or revise what it set out to show. Nobody is asked again until it moves.', 'FINDING, to the project\'s joined members'],
  ['review-comment-left-out', 'Your comments were not included: {case}', 'The case was published without your review comments. You may file a response in its docket, as anyone may.', 'FINDING, to each reviewer who is a member'],
]) { add(`queue.${k}.summary`, sum, false, 'DEC-189', note); add(`queue.${k}.detail`, det, false, 'DEC-189', note); }

// 4c'''. The assistant's reading of page pictures (DEC-190; BOB's B128, B129; extraction R71, C-51.7)
add('transcribe.refused.notdeployed', 'Nothing was read or sent: the assistant\'s reading of page pictures isn\'t switched on in your group\'s Civicsmith yet. Each part of the assistant is switched on only after it passes Civicsmith\'s test investigations. You can type a page\'s words yourself meanwhile.', false, 'DEC-190', 'TRANSCRIBE_NOT_DEPLOYED (C-51.7); names no account');
add('transcribe.label', 'The assistant\'s reading of the page image · undetermined until a member checks a passage against the page', true, 'DEC-190', 'the label on words from pagetranscribe (reading-pipeline R29\'s "the AI\'s reading")');
add('transcribe.none', 'The assistant read pages {pages} but found no words it could give: {why}', false, 'DEC-190', 'performed false; {why} the reason as answered');
add('transcribe.done', 'The assistant read pages {pages}. Their words can now be found; each passage stays undetermined until a member checks it against the page.', false, 'DEC-190', 'performed and written');
add('document.unread.pages', must(scr, 'mock-screens.js', 'are pictures of text that Civicsmith\\\'s own reading couldn\\\'t make out, so their words can\\\'t be found or cited yet. The page images are kept as they are.').replace(/\\'/g, "'").replace(/^/, 'Pages {pages} '), false, 'DEC-190', 'the Document screen\'s section, shown only when such pages exist');

// 4d. Supplied documents in a published case (BOB's drafts from T39, adopted as written; DEC-188)
add('document.cleaned.label', 'Details of who made this file, and of its pictures, removed for publication; the group holds the original', true, 'DEC-188', 'COPY_CLEANED_LABEL');
add('document.refused.changed', 'A document a member supplied now needs a different publication copy from the one this case was prepared with. Prepare the case again. Nothing was published.', true, 'DEC-188', 'DOCUMENT_COPY_CHANGED_SINCE');
add('document.refused.clean', 'A document a member supplied can\'t be cleaned of the details that could show who made it: {document}. Capture it from where it was published, supply a plainer copy, or stop relying on it.', true, 'DEC-188', 'DOCUMENT_NOT_CLEANABLE');
add('document.refused.pending', 'The publication copy of a document a member supplied is still being made: {document}. Try again in a few minutes.', false, 'DEC-188', 'DOCUMENT_COPY_PENDING');

// 4e. A question a project draws on (DEC-188; Bob's ruling that setting aside is each project's own)
add('question.refused.drawnon', 'This question can\'t be set aside for the whole group, because a project draws on it. Set it aside in your project instead; that leaves it as it is everywhere else.', false, 'DEC-188', 'DRAWN_ON_BY_A_PROJECT; names no project');

// 5. The frame: rail, phone tabs, explanation levels
for (const [k, name] of W.RAIL) { add(`rail.${k}.name`, name, false, 'mock-shell.js RAIL'); if (W.RAIL_HELP[k]) add(`rail.${k}.holds`, W.RAIL_HELP[k], false, 'mock-refs.js RAIL_HELP'); }
for (const [k, name] of W.TABS) if (!W.RAIL.some(r => r[0] === k)) add(`tab.${k}.name`, name, false, 'mock-shell.js TABS');
add('tab.more.holds', must(shell, 'mock-shell.js', 'projects, people and settings.'), false, 'mock-shell.js decorate');
add('level.prompt.name', 'Explain promptly', false, 'DEC-175');
add('level.pause.name', 'On a longer pause', false, 'DEC-175');

// 6. The wizard guide (DEC-120, DEC-121): the guide's own words, around each script's step
add('guide.stopping', must(shell, 'mock-shell.js', 'Stopping is fine: nothing is lost, and nobody is told.'), false, 'mock-shell.js wizardGuide');
add('guide.showwhere', must(shell, 'mock-shell.js', 'Show me where'), false, 'mock-shell.js wizardGuide');
add('guide.sidetrip', 'Side trip: {wizard}. When it finishes or you stop it, you come back to this step.', false, 'mock-shell.js wizardGuide', 'the wizard\'s name in place of {wizard}');
must(shell, 'mock-shell.js', 'When it finishes or you stop it, you come back to this step.');
add('guide.draft', must(shell, 'mock-shell.js', 'This step places a labelled draft in the field. It becomes yours only when you keep or edit it.'), false, 'mock-shell.js wizardGuide');
add('guide.press', must(shell, 'mock-shell.js', 'Press here when you\\\'re ready').replace(/\\'/g, "'"), false, 'mock-shell.js ring');
add('guide.step', 'step {i} of {n}', false, 'mock-shell.js wizardGuide');

// 7. Screens: each one's name and what it is for
for (const s of reg) {
  add(`screen.${s.id}.name`, s.name, false, 'registry.json');
  if (W.SCREEN_HELP[s.id]) add(`screen.${s.id}.purpose`, W.SCREEN_HELP[s.id], false, 'mock-refs.js SCREEN_HELP');
}

// 8. Acts: each act's name as each screen labels it (a fixed term: protected), and what it does (protected where the act is
//    signed, terminal, irreversible or outward: its explanation is the warning before it, DEC-157 (4))
for (const s of reg) for (const a of s.acts) {
  const k = `act.${opkey(a.op)}.label.${s.id}`;
  if (!seen.has(k)) add(k, a.label, true, 'registry.json');
}
for (const [op, t] of Object.entries(W.ACT_HELP)) add(`act.${op}.does`, t, weightOf(op.startsWith('owed_') ? 'owed:' + op.slice(5) : op) >= 3 || W.OUTWARD.includes(op), 'mock-acts.js ACT_HELP');
for (const s of reg) for (const a of s.acts) if (!W.ACT_HELP[opkey(a.op)]) fail(`no ACT_HELP for ${a.op} (screen ${s.id})`);

// 9. Table columns: the heading and what it shows
for (const [k, t] of Object.entries(W.COL_HELP)) {
  const [scr, head] = k.split('|');
  const slug = head.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  add(`column.${scr}.${slug}.name`, head, false, 'mock-refs.js COL_HELP');
  add(`column.${scr}.${slug}.shows`, t, false, 'mock-refs.js COL_HELP');
}
add('column.sort.how', must(shell, 'mock-shell.js', 'Click to sort the rows by this column; click again to reverse. Sorting changes only your view, never the record.'), false, 'mock-shell.js decorate');

// 10. Civicsmith's wizard library (DEC-148): each script's name and each step's what and why
for (const w of lib) {
  add(`wizard.${w.id}.name`, w.name, false, 'library.json');
  w.versions[0].steps.forEach((st, i) => {
    add(`wizard.${w.id}.step${i + 1}.what`, st.what, false, 'library.json');
    add(`wizard.${w.id}.step${i + 1}.why`, st.why, false, 'library.json');
  });
}

const out = {
  _note: 'The interface word list (DEC-179). Built by build_words.mjs from the mockups\' sources; never edit by hand. Keys are stable: a word keeps its key when its English changes, and a new word takes a new key. {name} marks a placeholder the screen fills.',
  protected_rule: 'DEC-157 (4): the fixed terms (grades and scales, the five gaps, origins, the queue\'s kinds, the path, the acts\' names), the weights, every warning and dialog before an outward, signed or irreversible act, the court notice, and every "who can see this" notice. A protected word changed from the assistant\'s draft, or typed without one, shows only after a second check.',
  for_builders: 'A sentence on a screen that carries its data (a name, a count, a date) is keyed when the screen is built: screen.<id>.<part>, with {placeholders}; it is protected when it is a warning or dialog before an outward, signed or irreversible act, the court notice ("What a court can reach"), or says who can see something.',
  counts: {},
  words,
};
for (const w of words) { const f = w.key.split('.')[0]; out.counts[f] = (out.counts[f] || 0) + 1; }
out.counts.total = words.length;
out.counts.protected = words.filter(w => w.protected).length;
fs.writeFileSync(path.join(HERE, 'words.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`words.json: ${words.length} words and phrases, ${out.counts.protected} protected · ` + Object.entries(out.counts).filter(([k]) => !['total', 'protected'].includes(k)).map(([k, v]) => `${k} ${v}`).join(', '));
