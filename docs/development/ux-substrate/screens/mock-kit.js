/* Civicsmith mockups (design phase step 5, DEC-139): the kit every screen is drawn with.
   Drawn in civicsmith.css (DEC-138). Every control a wizard can point at carries data-act="<op>", the op the screen
   registry lists, so a wizard step rings the real control (check_walk.mjs proves each one exists). */
'use strict';
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const I = (n, cls='i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const WNAME = ['', 'Reversible', 'Reasoned', 'Terminal', 'Signed', 'Irreversible'];
const pips = w => `<span class="cs-pips">${[1,2,3,4,5].map(i => `<i${i <= w ? ' class="on"' : ''}></i>`).join('')}</span>`;
/* weights follow DEC-87 and DEC-88; an act whose weight is not yet set is treated as reasoned */
const WEIGHT = {
  cite:1, sever:1, reinstate:1, select:1, search:1, queuesnooze:1, queuemute:1, taskforward:1, addparticipant:1, relate:1, followregister:1,
  importwatch:1, standingquestionset:1, standingquestionend:1, accountswitchset:1, aiceilingset:1, keepversion:1, explore:1, explorepreset:1,
  calculationdraw:1, selectionrelease:1, frontier:1, countask:1, bind:1, createset:1, monitor:1, reminderset:1, ruleanswer:1, suggest:1,
  airunopen:2, airunclose:1, wizards:1, person:1, heldcaptures:1, gradenote:1, invitelook:1, publishedcase:1, verify:1, disclosureshown:1,
  projectjoin:1, owed_startfrom:1, deadlinecompute:1, optionstartpreview:1, publishpreflight:1, publishtensions:1, exploreverify:1,
  addresseesuggest:1, tabledeclare:1, addworkbook:1, recordline:2, registerproceeding:2, declare:2, courtlink:2,
  conclude:2, narrow:2, promote:2, optiondispose:2, optionadd:2, optionadopt:2, optionpropose:1, scenarioset:2, checkpointrecord:2, plansubjectadd:2,
  proposedispose:2, heldsetaside:2, heldrestore:2, clockadopt:2, recordpersonfact:2, claimidentity:2, withdrawidentityclaim:2, createevent:2, recordfact:2,
  recorddatedfact:2, include:2, exclude:2, reconcile:2, committedagainstpaid:1, authoritychain:1, importaccept:2, importflag:2, inboxpull:2, inboxresolve:2,
  declaretie:2, withdrawtie:2, memberadd:2, membercaps:2, memberset:2, adminendorse:2, expertiseconfirm:2, expertisedeclare:1, strengthbarset:2,
  calculationcreate:2, calculationaccept:2, recordcheck:2, actioncreate:2, actionlaws:2, communicationprepare:2, filingprepare:2, optionstart:2,
  actionmove:2, actioncorrespond:2, actionpressure:2, actionhold:2, escalationopen:2, escalationadvance:2, declinetoescalate:2, standarddeclare:2,
  standardadopt:2, lawrelate:2, casedraft:2, whatchangedpropose:1, statementack:2, attribute:2, reviewgrant:2, reviewcomment:1, caseimport:2,
  testify:2, acquire:2, capture:2, capturerequest:1, hypothesishold:1, connectionassert:2, projectinvite:2, adoptversion:2, reminderanswer:2,
  taskresolve:2, groupnameset:2, groupdomainset:2, profilesset:2, officesseed:2, assistantset:2, aicopyceilingset:2, hostingaccess:2, enroll:2,
  bootstrap:2, selftest:1, setpassword:2, accountreferenceset:2, projectcreated:2, wizarddraft:2, wizardrevise:1, wizardsubmit:2, wizardapprove:2,
  filingrecordsent:2, owed_groupprofileset:2, owed_groupprofilevisibility:2, owed_memberlanguageset:1, owed_websitekeymint:2, owed_joinlinkset:2,
  owed_noteadd:1, owed_noteconvert:2, owed_translationdraft:1, owed_translationadopt:2, owed_checkrequest:2, knock:2, sourcelink:2,
  retire:3, planclose:3, filingapprove:3, expunge:3, adminremove:3, accountreferenceremove:3, reviewrevoke:3, escalationend:3, wizardretire:3,
  signerrevokeown:3, importacceptwithdraw:3,
  release:4, attest:4, caseratify:4, docketpost:4, signerregisterown:4, claim:4, docketfile:2,
  publish:5,
};
const OUTWARD = new Set(['filingrecordsent', 'reviewgrant', 'knock', 'owed_groupprofilevisibility', 'disclosureshown', 'accountreferenceset', 'docketpost', 'publish', 'owed_websitekeymint', 'owed_joinlinkset']);
const key = op => op.startsWith('owed:') ? 'owed_' + op.slice(5).split(' ')[0] : op;
/* a button carrying its act and weight. o: {tone, icon, out, quiet, id} */
function btn(op, label, o = {}) {
  const w = o.w || WEIGHT[key(op)] || 2;
  const out = o.out ?? OUTWARD.has(key(op));
  return `<button type="button" class="cs-btn"${o.tone ? ` data-tone="${o.tone}"` : ''} data-act="${esc(op)}">${o.icon ? I(o.icon) : ''}${out ? I('outward') : ''}${esc(label)}<span class="w">${pips(w)}${WNAME[w]}</span></button>`;
}
/* a plain control with no act (navigation, a link) */
const link = (label, icon) => `<a href="#" onclick="return false" class="cs-btn" data-tone="quiet">${icon ? I(icon) : ''}${esc(label)}</a>`;
const grade = (scale, l, full) => `<span class="cs-grade" data-scale="${scale}" tabindex="0" aria-label="${scale} ${l}">${I(scale === 'subject' ? 'subject' : scale)}${full ? `<span class="sc">${full}</span> ` : ''}${l}</span>`;
const strength = (c, n, phrase, t) => `<span class="cs-strength">${grade('capture', c)}${grade('connection', n)}${t ? grade('testimony', t) : ''}<span class="phrase">${phrase}</span></span>`;
const gapm = (k, html) => `<span class="cs-gap" data-gap="${k}">${I({undetermined:'undetermined', withheld:'withheld', unrated:'unrated', nobody:'nobody', refused:'refused'}[k])}<span>${html}</span></span>`;
const origin = (k, t) => `<span class="cs-origin" data-origin="${k}">${I({machine:'machine', elsewhere:'elsewhere', unevaluated:'unevaluated', accepted:'accepted', flagged:'flagged'}[k])}${esc(t)}</span>`;
const kindm = k => `<span class="cs-kind" data-kind="${k}">${I(k === 'todo' ? 'todo' : k)}${{todo:'To do', noticed:'Noticed', status:'Status'}[k]}</span>`;
const due = (s, t) => `<span class="cs-due"${s ? ` data-due="${s}"` : ''}>${I(s === 'met' ? 'accepted' : 'clock')}${esc(t)}</span>`;
const hint = t => `<span class="cs-hint">${I('hint')}${esc(t || 'Hint · machine work')}</span>`;
const pathm = cur => `<span class="cs-path">${['Working', 'Shared for review', 'Published'].map((s, i) => `<span${i === cur ? ' aria-current="step"' : ''}>${s}</span>`).join('<i>→</i>')}</span>`;
const ladder = (k, steps, on, pend = []) => `<div class="cs-ladder" data-ladder="${k}">${steps.map((s, i) => `<span class="${i < on ? 'on' : ''}${pend.includes(i) ? ' pend' : ''}">${esc(s)}</span>`).join('')}</div>`;
function field(id, label, value = '', o = {}) {
  const tag = o.area ? 'textarea' : 'input';
  const cls = `cs-input${o.rec ? ' rec' : ''}${o.draft ? ' cs-draft' : ''}`;
  const v = o.area ? `>${esc(value)}</textarea>` : ` value="${esc(value)}">`;
  return `<div class="cs-field"${o.act ? ` data-act="${esc(o.act)}"` : ''}><label for="${id}">${esc(label)}</label>${o.help ? `<span class="help">${o.help}</span>` : ''}<${tag} id="${id}" class="${cls}"${o.area ? '' : ' type="text"'}${o.area ? '' : ''}${v}${o.draft ? `<span class="cs-draftlabel">${I(o.draft === 'machine' ? 'machine' : 'wizard')}${o.draft === 'machine' ? 'Draft by the assistant, at your request · edit it until it is yours' : o.draft === 'template' ? 'Draft from your group\'s template · edit it until it is yours' : 'Draft from the wizard · edit it until it is yours'}</span>` : ''}</div>`;
}
const choice = (id, label, opts, sel, o = {}) => `<div class="cs-field"${o.act ? ` data-act="${esc(o.act)}"` : ''}><label for="${id}">${esc(label)}</label>${o.help ? `<span class="help">${o.help}</span>` : ''}<select id="${id}" class="cs-input">${opts.map(x => `<option${x === sel ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></div>`;
const checks = (name, opts, o = {}) => `<fieldset class="mk-checks"${o.act ? ` data-act="${esc(o.act)}"` : ''}><legend>${esc(name)}</legend>${opts.map(([t, on], i) => `<label><input type="${o.radio ? 'radio' : 'checkbox'}" name="${esc(name)}"${on ? ' checked' : ''}> ${t}</label>`).join('')}</fieldset>`;
const h1 = (t, sub) => `<div class="mk-h"><h1 class="t-title">${t}</h1>${sub ? `<p class="mk-sub">${sub}</p>` : ''}</div>`;
const sec = (t, inner, o = {}) => `<section class="cs-section mk-sec"${o.act ? ` data-act="${esc(o.act)}"` : ''}><h2>${t}</h2>${inner}</section>`;
const sheet = inner => `<div class="cs-sheet">${inner}</div>`;
const row = (a, b, c = '', meta = '') => `<div class="cs-row">${a}<span>${b}</span>${c}${meta ? `<span class="meta">${meta}</span>` : ''}</div>`;
const note = t => `<p class="mk-note">${t}</p>`;
const acts = (...b) => `<div class="mk-acts">${b.join('')}</div>`;
const machine = (who, inner) => `<div class="cs-machinework">${inner}<span class="by">${I('machine')}Machine work · the assistant, at ${esc(who)}'s request</span></div>`;
const wizmark = (n, names) => `<button type="button" class="cs-wizmark" title="${esc(names)}">${I('wizard')}${n} wizard${n > 1 ? 's' : ''} start here</button>`;
const crumbs = list => `<nav class="mk-crumbs" aria-label="Where you are">${list.map(esc).join(' <i>›</i> ')}</nav>`;
