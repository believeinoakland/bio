/* Civicsmith mockups: the 46 screens of the registry (registry.src.py), each a function of the context
   c = {ai: the member has connected their own Claude account, v: a variant name}. Sample data is invented:
   the group Lakeshore Tenants, its members Rosa (founder), Dev, Mai (new), Ana (an accountant) and Teo (a reporter). */
'use strict';
const G = { name: 'Lakeshore Tenants', slug: 'lakeshore-tenants', me: 'Mai' };
const SCR = {};

/* ---------------- the group's Civicsmith: installing, setting up, joining ---------------- */
SCR.install = c => ({ frame: 'setup', title: 'Install Civicsmith', main: `
  <div class="mk-setuphead"><svg viewBox="0 0 60 90" aria-hidden="true"><use href="#i-mark"/></svg><span class="mk-wordmark">Civicsmith</span></div>
  ${h1('Install Civicsmith for your group', 'Free software for groups that check whether government keeps its own rules and promises. It runs in a Cloudflare account your group controls; nobody else holds your group\'s work. You will become its first administrator in the next part.')}
  ${sec('Before you start', `<ul class="mk-list"><li>A Cloudflare account. The free plan works.</li><li>About twenty minutes.</li><li>Workers Paid ($5 a month, with a payment method) adds recomputing members' spreadsheets and signing in with a Claude subscription. You can add it later.</li><li>No Claude account is needed to set up.</li></ul>`)}
  ${sec('Your group\'s short name', `${note('Your group has two names. Its <b>name</b>, such as “Lakeshore Tenants”, is what people read; you choose it in the next part and can change it whenever you like. Its <b>short name</b>, chosen here, is the fixed label in its web addresses and beside every signature, and can never change.')}${field('mk-slug', 'Short name', 'lakeshore-tenants', { help: 'Lower-case letters, digits and hyphens. A group that wants to stay unnamed picks one that reveals nothing.' })}
   <div class="cs-dialog" style="max-width:none;box-shadow:none"><b>“lakeshore-tenants” is permanent</b><div class="ends">Your short name is in every address of your group's Civicsmith and beside every signature your members make. It can never be changed, by you or anyone, without installing Civicsmith again.</div>${acts(btn('bootstrap', 'Install with this short name', { tone: 'primary' }))}</div>`)}
  ${sec('Testing itself', `<div class="cs-sheet">${row(I('accepted'), 'Signed release verified', '<span class="muted">0.9 s</span>')}${row(I('accepted'), 'Record store ready', '<span class="muted">1.2 s</span>')}${row(I('clock'), 'The assistant\'s container: allow it to run?', '')}</div>${acts(btn('selftest', 'Run the test again'))}`)}
  ${sec('Your one-time password: save it now', `${note('This is how you become your group\'s first administrator, in the next part. It is shown <b>once</b>, here. Save it now somewhere safe, such as a password manager, and keep it until you have claimed. Continuing below fills it in for you.')}
   ${field('mk-otp0', 'One-time password', 'q7Rm-2xPa-V9tL-c4Hw', { help: 'Works once. When you claim, it is spent and you sign in with a password you choose.' })}${acts(link('Copy the password'))}
   ${field('mk-addr', 'Your group\'s address', 'https://lakeshore-tenants.rosa-m.workers.dev', { help: 'Where you, and later your members, open your group\'s Civicsmith.' })}
   ${sec('Two more keys, also shown once', `${note('Setting up does not need either. Most groups never use them; save them with the password in case you, or someone helping you, needs them later.')}
    ${field('mk-probekey', 'Probe key', 'p3Xv-…-8kQe', { help: 'Lets a monitoring service check that your group\'s Civicsmith is running. It reaches only a separate test store, never your group\'s records.' })}${acts(link('Copy the probe key'))}
    ${field('mk-memberkey', 'Member key', 'm9Tb-…-2fWn', { help: 'Gives a program a member\'s access to your group\'s shared work: your group\'s Civicsmith uses it for its own live checks, and you may give it to a program you connect. Keep it as safe as the password; anyone holding it can read what members read.' })}${acts(link('Copy the member key'))}`)}
   <div class="cs-dialog" style="max-width:none;box-shadow:none"><b>Whoever can sign in to this Cloudflare account controls your group's Civicsmith</b><div class="ends">They can set a new one-time password, claim it again, read everything and lock everyone out, and no vote of administrators can stop them. Use a group account rather than a personal login, and add at least one other trusted person. It is also the way back in: if the one-time password is lost before anyone claims, that account can set a new one.</div></div>
   <div class="mk-acts"><a href="#" onclick="return false" class="cs-btn" data-tone="primary">${I('next')}Continue: become the first administrator</a></div>`)}` });

SCR.setup = c => ({ frame: 'setup', title: 'Set up', main: `
  <div class="mk-setuphead"><svg viewBox="0 0 60 90" aria-hidden="true"><use href="#i-mark"/></svg><span class="mk-wordmark">Civicsmith</span><span class="muted">lakeshore-tenants</span></div>
  ${h1('Become your group\'s first administrator', 'You are not a member of anything yet. Claim what you just installed with the one-time password and it becomes yours to run; then name your group and choose its places. Seven short parts; you can leave and come back.')}
  <ol class="mk-steps"><li class="done">Claim</li><li class="done">Name</li><li aria-current="step">Places</li><li>Offices</li><li>People</li><li>The assistant</li><li>Administrators</li></ol>
  ${sec('Claim it', `${field('mk-otp', 'One-time password', '••••••••••••', { help: 'Filled in for you when you continued from the installer\'s last page, where it was shown once. Opening this page another way? Type the password you saved there. Lost it? Whoever can sign in to the Cloudflare account can set a new one.' })}${field('mk-newpw', 'Your own password', '', { help: 'At least 12 characters. From now on you sign in with this, never the one-time password.' })}${field('mk-newpw2', 'Type it again', '', { help: 'The two must match before you can claim.' })}${acts(btn('claim', 'Claim it and become its administrator', { tone: 'primary' }))}`)}
  ${sec('Your group', `${field('mk-gname', 'Group name', 'Lakeshore Tenants', { help: 'What people read: at the head of your pages, invitations and published cases. Change it whenever you like. Your short name, lakeshore-tenants, was fixed at install and stays in your addresses and signatures.' })}<div class="mk-logo">${I('add')} Add your logo (optional)</div>${acts(btn('groupnameset', 'Save the name'))}
   ${field('mk-gdom', 'Your group\'s website (optional)', 'lakeshoretenants.org', { help: 'Only if your group has a website you can put a file on. Verifying it lets readers confirm a published case really comes from you: Civicsmith gives you one small file to place on the site, then checks it. Your public page will name the site, so a group that wants to stay unnamed leaves this empty. You can add it later.' })}${acts(btn('groupdomainset', 'Verify the address'))}`)}
  ${sec('Places and languages', `${choice('mk-place', 'The places whose rules apply', ['Choose a place…', 'Oakland, California (City, County, State)', 'Other (not listed)'], 'Oakland, California (City, County, State)', { onchange: 'this.closest(\'main\').classList.toggle(\'mk-other\', this.value.indexOf(\'Other\') === 0)', help: 'The places Civicsmith holds the rules for: their deadlines, holidays, offices and records laws, each with its source. Your place not listed? Choose “Other”: everything else works, and you enter due dates and offices yourself. New places arrive with Civicsmith\'s releases.' })}<div class="mk-ifother">${field('mk-placewant', 'Your place, if it is not listed (optional)', '', { act: 'placewanted', help: 'For example “Fresno, California”. Kept in your group\'s Civicsmith and never sent anywhere. When an update brings its rules and offices, your administrators are told once in their queue and can choose it here.' })}${acts(btn('placewanted', 'Save your place'))}</div>${checks('Languages your members use', [['English', true], ['Español', true], ['Tiếng Việt', false]])}${acts(btn('profilesset', 'Save places and languages'))}`)}
  ${sec('Offices and seats', `<div class="mk-ifheld"><div class="cs-sheet">${row(I('group'), 'City Clerk · <span class="muted">held by ' + card('Asha Rao', '<b>Asha Rao</b> · City Clerk since March 2021, from the city&#39;s roster. Cited in 3 documents your group holds.') + '</span>', '<span class="cs-origin" data-origin="machine">' + I('machine') + 'From the city\'s roster</span>')}${row(I('group'), 'Director of Public Works · <span class="muted">held by ' + card('L. Chen', '<b>L. Chen</b> · Director of Public Works since 2022, from the city&#39;s roster. Signed 2 documents your group holds; named in 1 question.') + '</span>', '<span class="cs-origin" data-origin="machine">' + I('machine') + 'From the city\'s roster</span>')}${row(I('group'), 'Council District 3 · <span class="muted">held by J. Ortega since 2023</span>', '<span class="cs-origin" data-origin="machine">' + I('machine') + 'From Legistar</span>')}</div>${acts(btn('officesseed', 'Confirm these offices'))}</div><div class="mk-ifother">${note('Nothing is filled in here: Civicsmith does not hold the offices and seats for Fresno yet. Add the offices your group deals with yourself, now or at any time; each is marked as added by your group. When an update brings Fresno\'s rules, your administrators are told once in their queue and can choose it under Places; the offices you added stay.')}${acts(btn('entitycreate', 'Add an office yourself'))}</div>`)}
  ${sec('Who sees what about people', note('Facts that come from public documents follow those documents. A project\'s own notes about a person stay inside that project. ' + '<a href="#" onclick="return false">More about this</a>'))}
  ${sec('How members reach the assistant', `${note('The assistant is an optional helper, built on Anthropic\'s Claude. A member can ask it in plain words to find, read, answer or check things in what your group holds; it can suggest questions and documents, and draft translations. It answers only from what your group holds, gives legal information but never legal advice, and never concludes, signs or sends anything. What it does is labelled as the assistant\'s. Everything in Civicsmith also works without it.')}
   <details class="mk-more"><summary>More about this</summary>
    <h4>What each choice means</h4>
    <ul class="mk-list">
     <li><b>The group\'s API key.</b> One Anthropic API key, held by your group, serves every member who has no account of their own. Anthropic bills the key\'s owner for each use, so your group pays. It is off until an administrator switches it on. Each member is told once, before their first question under it, that their questions and the material read to answer them go to Anthropic under the group\'s account. Administrators see spending by member, never what was asked, and set the daily limit and whether the assistant may make suggestions unprompted.</li>
     <li><b>Members\' own accounts.</b> Each member who wants the assistant connects their own Claude subscription or their own API key, and it serves only them, at their own cost. Civicsmith uses a subscription only for its own member, and the subscription path needs the Workers Paid plan.</li>
     <li><b>Both.</b> A member\'s own account comes first; the group\'s key serves the rest.</li>
     <li><b>No assistant.</b> Every journey still works. Members lose asking in plain words, suggestions, translation drafts, and the assistant reading new results for their standing questions; searching, counting and the group\'s own templates take its place.</li>
    </ul>
    <h4>Setting one up</h4>
    <ul class="mk-list">
     <li><b>The group\'s key:</b> an administrator creates an API key in Anthropic\'s Console (console.anthropic.com), under an account that belongs to the group and has a payment method, and pastes it below. Civicsmith seals it and never shows it again. Setting a monthly spending limit in the Console as well is wise.</li>
     <li><b>A member\'s own account:</b> each member connects it themselves, from the assistant panel, with a step-by-step guide.</li>
    </ul>
    <h4>What leaves your group\'s Civicsmith</h4>
    <p>When a member asks, their question and the material read to answer it go to Anthropic, under whichever account serves them. Nothing goes unless a member asks. You can change this choice at any time in your group\'s settings.</p>
   </details>
   ${checks('Choose one (nothing is chosen for you)', [['The group\'s API key: one key, held by the group, serving every member with no account of their own', false], ['Members\' own accounts: each member connects their own Claude subscription or API key', false], ['Both: a member\'s own account comes first; the group\'s key serves the rest', false], ['No assistant: Civicsmith without it', false]], { radio: true, act: 'assistantset' })}${acts(btn('assistantset', 'Save this choice'))}
   ${field('mk-gkey', 'The group\'s Anthropic API key', 'sk-ant-…', { help: 'Sealed in your group\'s Civicsmith and never shown again. Each member is told once, before their first question under it, that their questions go to Anthropic under the group\'s account.' })}${acts(btn('groupkeyset', 'Hold this key'), btn('groupkeyswitch', 'Switch it on'))}
   ${field('mk-ceil', 'Daily limit for your group (optional)', '$5.00 per member')}${acts(btn('aicopyceilingset', 'Set the group\'s limit'))}`)}
  ${sec('What a court can reach', `${note('Work done in Civicsmith can matter. Checking whether officials and agencies keep their own rules can show money misspent, deadlines ignored or promises broken, and a published case can lead to a correction, an audit or a lawsuit. People and organisations a group looks into sometimes go to court to see the work behind it.')}${note('Your group\'s Civicsmith keeps unpublished work from the public and from the people you look into, but a court order your group cannot defeat can still require anything not public to be shown: members\' notes, sources, hidden projects. Some work is unlikely ever to draw such an order; journalists, lawyers and auditors may have protections others lack, such as shield laws or privilege. A group doing work that could draw one should make sure its members understand the risk.')}${note('The explanation is always one tap away for every member. You choose whether members are also told when they join and the first time they record something not public.')}${checks('Tell our members', [['Yes, tell them', false], ['No, keep it one tap away', false]], { radio: true, act: 'courtnoticeset' })}${acts(btn('courtnoticeset', 'Save'))}`)}
  ${sec('Administrators', `${field('mk-host', 'Who holds the hosting account', 'Rosa Medina (the Cloudflare account owner)')}${acts(btn('hostingaccess', 'Record it'))}<p class="mk-note">With one administrator, the group depends on one person. A second means it is never stuck. You can add one now or later.</p>${acts(btn('memberadd', 'Invite a member or a second administrator', { tone: 'primary' }))}`)}
  ${sec('Your organization\'s security tools (optional)', `<p class="mk-small">Civicsmith scans every file it captures with its own scanner and opens risky ones in a safe view. If your organization already uses a file scanner, a safe-copy maker or a log service, you can add it now, or later in Settings › Security.</p>${acts(btn('owed:securitytooladd K1929', 'Add a tool now'))}`)}` });

SCR['group-identity'] = c => ({ rail: 'settings', title: 'Who your group is', crumbs: ['Settings', 'Who your group is'], main: `
  ${h1('Who your group is', 'Optional. It shapes how members are welcomed and locks nothing.')}
  ${checks('What kind of group are you?', [['Professional', false], ['Issue-specific', false], ['Neighbourhood or community', true], ['Catch-all', false], ['Something else…', false]], { act: 'groupdescriptionset', onchange: 'var i=this.querySelectorAll(\'input\');this.closest(\'main\').classList.toggle(\'mk-else\', i[i.length-1].checked)' })}<div class="mk-ifelse">${field('mk-kindelse', 'Describe your kind of group, in a few words', '', { act: 'groupdescriptionset', help: 'For example “a tenants\' union”, “a students\' newspaper”, “a retired auditors\' circle”. It helps Civicsmith offer what fits first; it locks nothing.' })}</div>
  ${field('mk-focus', 'What you focus on', 'Rents and leases on city-owned land; the Coliseum lease; repairs on our streets', { act: 'groupdescriptionset', rec: true })}
  ${field('mk-why', 'Why the group exists, in your own words', 'Tenants near the Coliseum started meeting in 2025 when rents on city land rose twice in a year. We want to know whether the city is keeping its own lease terms.', { area: true, rec: true, act: 'groupdescriptionset' })}
  ${c.ai ? `${acts(btn('owed:groupdescriptiondraft DEC-152', 'Ask the assistant to help write this'))}${note('It asks you a few questions about your group, then drafts the focus and the reasons in these fields, each marked “Draft · the assistant\'s, asked by Rosa”. Nothing is saved until you edit it and keep it; once kept, the words are your group\'s.')}` : ''}
  ${checks('Who sees this', [['Members only', true], ['Also our public page and the network directory', false]], { radio: true, act: 'groupdescriptionset' })}
  ${acts(btn('groupdescriptionset', 'Save who your group is', { tone: 'primary' }))}` });

SCR.join = c => ({ frame: 'setup', title: 'Your invitation', main: `
  <div class="mk-setuphead"><span class="grp mk-grp">Lakeshore Tenants</span></div>
  ${h1('You\'re invited to Lakeshore Tenants', 'Rosa invited you to contribute. This link works once and expires on 13 October 2026.')}
  ${choice('mk-lang', 'Your language', ['English', 'Español', 'Tiếng Việt'], 'English', { act: 'owed:memberlanguageset DEC-127', help: 'Chosen from your device\'s setting. You can change it any time.' })}
  ${field('mk-handle', 'Your handle', 'mai.k', { help: 'The record shows your handle on your work. It needn\'t be your legal name. <a href="#" onclick="return false">Choosing a handle</a>: a name people know lends your work credibility and lets reporters reach you, but puts it on public cases; a pen name shields you from pressure, while the administrators still know who you are.' })}
  ${field('mk-pw', 'Password', '••••••••••••••', { help: 'At least 12 characters. A short sentence you can remember works well.' })}${field('mk-pw2', 'Type it again', '••••••••••••••', { help: 'So a typing slip can\'t lock you out. The two must match before you can continue.' })}
  ${acts(btn('enroll', 'Join Lakeshore Tenants', { tone: 'primary' }), btn('invitelook', 'Read the invitation again'))}` });

SCR.home = c => ({ rail: 'home', title: 'Home', main: `
  ${h1('Lakeshore Tenants', 'Rents and leases on city land, and the streets we live on.')}
  <div class="mk-welcome" data-act="owed:startfrom DEC-129"><h2 class="mk-h2">What brought you here?</h2>
   <div class="mk-doors">${[['A problem I live with', 'Potholes, dumping, a bill, a service'], ['A person', 'An official, a name in the news'], ['A payment or contract', 'A budget line, a lease, a change order'], ['Something I read', 'A code, a court case, a story, minutes'], ['A tip or documents', 'Something someone handed you']].map(([a, b]) => `<button type="button" class="mk-door"><b>${a}</b><span>${b}</span></button>`).join('')}</div>
   ${acts(btn('owed:startfrom DEC-129', 'Start from…'), btn('projectcreated', 'Start a project'))}</div>
  ${sec('Waiting on you', sheet(row(kindm('todo'), 'Vouch for 3 photos you captured on Seminary Avenue', due('', 'Today')) + row(kindm('status'), 'The City Clerk\'s reply to your records request is due 14 October', due('near', 'Due in 2 days'))) + `<a class="mk-more" href="#" onclick="return false">Your queue (4)</a>`)}
  ${sec('What the group is working on', sheet(
    row(I('project'), '<b>The Coliseum lease</b><span class="meta">3 questions · 1 plan · investigating</span>', ladder('stage', ['Forming', 'Investigating', 'Matured', 'Closed'], 2)) +
    row(I('project'), '<b>Pothole repairs</b><span class="meta">2 questions · forming</span>', ladder('stage', ['Forming', 'Investigating', 'Matured', 'Closed'], 1)) +
    row(I('project'), '<b>Sewer fund transfers</b><span class="meta">1 question · investigating</span>', ladder('stage', ['Forming', 'Investigating', 'Matured', 'Closed'], 2))))}` });

SCR.members = c => ({ rail: 'settings', title: 'Members', crumbs: ['Settings', 'Members'], main: `
  ${h1('Members', '6 members · 1 administrator')}
  ${note('With one administrator, the group depends on Rosa and the hosting account. <a href="#" onclick="return false">Add a second administrator</a>.')}
  ${sheet(row(I('subject'), '<b>Rosa</b> · administrator · <span class="muted">cover: R. Medina</span>', '<span class="muted">contribute, administer</span>') +
    row(I('subject'), '<b>Dev</b> · member', '<span class="muted">contribute</span>') +
    row(I('subject'), '<b>Ana</b> · member · declared: CPA', `<span>${btn('expertiseconfirm', 'Confirm expertise')}</span>`) +
    row(I('subject'), '<b>Teo</b> · member · declared: reporter', '<span class="muted">contribute</span>') +
    row(I('clock'), '<i>Invited</i> · cover: Mai K.', '<span>' + btn('invitewithdraw', 'Withdraw') + '</span>'))}
  ${sec('Invite a member', `${field('mk-ih', 'Their handle (they can change it)', 'mai.k')}${field('mk-ic', 'The cover the group knows them by, not a legal name', 'Mai K., from the Seminary Ave block')}${checks('What they may do', [['Contribute', true], ['Administer', false]], { act: 'membercaps' })}${acts(btn('memberadd', 'Create the invitation link', { tone: 'primary' }), btn('membercaps', 'Change what a member may do'))}${note('Civicsmith sends no email. Copy the link and send it yourself. It works once and expires after seven days.')}`)}
  ${sec('Joining through your website', `${note('Let your website invite people: an open form, or an application someone approves. Anyone let through can see the group\'s shared work.')}${acts(btn('websitekeycreate', 'Create a website key'), btn('joinlinkenable', 'Turn on the reusable join link'))}`)}
  ${sec('The group\'s API key', `<div class="row"><span class="cs-due" data-due="met">${I('accepted')}Held · on · set by Rosa, 6 October</span><span class="muted">$31.40 this month · Mai $12.10 · Dev $9.80 · 4 others $9.50</span></div>${note('Administrators see spending by member, never what was asked.')}${checks('Under the group\'s key', [['Members may switch on unprompted suggestions', false], ['Members may keep standing questions', true]], { act: 'groupswitchset' })}${acts(btn('groupswitchset', 'Save'), btn('groupkeyset', 'Replace the key'), btn('groupkeyswitch', 'Switch it off'), btn('groupkeyremove', 'Remove the key'))}`)}
  ${sec('Administrators', acts(btn('memberset', 'Change a member\'s status'), btn('adminendorse', 'Endorse an administrator'), btn('adminremove', 'Remove an administrator')))}` });

/* K1875 (Bob) and K1874 (Q5), drawn by DEC-165: an administrator's view of how hard the group's Civicsmith is being
   tried, over a period they choose. Counts only, by kind and by hour, against the group's usual; nothing names a source.
   Administrators are told in their queue only when the level is high (K1874). */
const HEAT = (() => {
  const hrs = Array.from({ length: 24 }, (_, i) => (23 + i) % 24);
  const lab = h => `${String(h).padStart(2, '0')}:00`;
  const rows = [
    ['Refused sign-ins', 'refused sign-ins', 3, { 2: [214, 3], 3: [188, 2], 4: [61, 2], 9: [4, 1], 15: [3, 1] }],
    ['Refused keys and links', 'refused keys and links (an expired invitation, a wrong website key, a revoked agent credential)', 0, { 3: [9, 1] }],
    ['Requests over the limit', 'requests turned away for coming too fast', 0, { 2: [1260, 3], 3: [940, 2], 4: [120, 1] }],
    ['Blocked by Cloudflare', 'requests Cloudflare blocked before they reached your group\'s Civicsmith (where your plan reports it)', 1, { 1: [40, 1], 2: [310, 2], 13: [22, 1], 20: [18, 1] }],
    ['Refused hand-overs', 'hand-overs refused at the doorbell (too many, too large)', 0, {}],
  ];
  const usual = { 'Refused sign-ins': 3, 'Refused keys and links': 1, 'Requests over the limit': 15, 'Blocked by Cloudflare': 20, 'Refused hand-overs': 1 };
  const cell = (k, what, j, d) => { const h = hrs[j]; const [n, x] = d[j] || [0, 0]; const tip = `<b>${k}</b>, ${lab(h)}–${lab((h + 1) % 24)}${j < 1 ? ' Monday' : ' Tuesday'}: <b>${n}</b> ${what}. Usual for an hour: about ${Math.max(1, Math.round(usual[k] / 24 * 10) / 10)}.`;
    return `<i data-x="${x}" tabindex="0" role="img" aria-label="${esc(tip.replace(/<[^>]+>/g, ''))}" data-tip="${esc(tip)}"></i>`; };
  return `<div class="cs-heat" style="--n:24" role="group" aria-label="Refused and blocked requests by hour, the last 24 hours">
    <span></span>${hrs.map((h, j) => `<span class="t">${j % 6 === 0 ? lab(h) : ''}</span>`).join('')}
    ${rows.map(([k, what, _, d]) => `<span class="k">${k}</span>${hrs.map((_, j) => cell(k, what, j, d)).join('')}`).join('')}</div>
    <div class="cs-heatkey"><span><i></i>at or below the usual</span><span><i style="background:color-mix(in srgb, var(--c-signal) 20%, var(--c-surface))"></i>up to 5 times the usual</span><span><i style="background:color-mix(in srgb, var(--c-signal) 50%, var(--c-surface))"></i>5 to 50 times</span><span><i style="background:var(--c-signal) repeating-linear-gradient(45deg, transparent 0 3px, color-mix(in srgb, var(--c-sheet) 40%, transparent) 3px 5px)"></i>over 50 times</span></div>`;
})();
SCR.security = c => ({ rail: 'settings', title: 'Security', main: `
  ${h1('Security', 'How hard your group\'s Civicsmith is being tried, against its usual. Only administrators see this.')}
  <div class="row" style="gap:12px;align-items:end;flex-wrap:wrap">${choice('mk-sp', 'Period', ['The last hour', 'The last 24 hours', 'The last 7 days', 'The last 30 days', 'Choose the dates…'], 'The last 24 hours', { act: 'owed:securitymap K1875' })}${acts(btn('owed:securitymap K1875', 'Show', { icon: 'search' }))}</div>
  <div class="cs-sheet" style="padding:14px 16px;display:grid;gap:8px"><div class="row" style="gap:10px"><span class="cs-risk" data-risk="raised" tabindex="0" style="margin-right:4px" data-tip="<b>Raised</b>: well above your group's usual at some point in the period, and nothing got through. <b>High</b>: well above the usual and still going on, or something unusual got through; only then are administrators told, in their queue. <b>Ordinary</b>: around the usual.">Raised</span><b>Someone tried hard to sign in on Tuesday night. Every attempt was refused.</b></div>
   <p class="mk-small" style="margin:0">Refused sign-ins were about 70 times the usual between 01:00 and 04:00, with requests coming too fast turned away at the same time. It was high from 01:40 to 03:50, when administrators were told once. No new key, credential or administrator was made in the period.</p></div>
  ${sec('By kind and by hour', HEAT + note('Each square is one hour. Hover, focus or tap one for its count and the usual. “Usual” is your group\'s own median for the same hour over the four weeks before.'))}
  ${sec('Totals for the period', `<div class="tw"><table class="mk-table"><thead><tr><th>Kind</th><th>This period</th><th>Usual</th><th>Busiest hour</th></tr></thead><tbody>
    <tr><td>Refused sign-ins</td><td>470</td><td>3</td><td>01:00–02:00, 214</td></tr>
    <tr><td>Refused keys and links</td><td>9</td><td>1</td><td>02:00–03:00, 9</td></tr>
    <tr><td>Requests over the limit</td><td>2,320</td><td>15</td><td>01:00–02:00, 1,260</td></tr>
    <tr><td>Blocked by Cloudflare</td><td>390</td><td>20</td><td>01:00–02:00, 310</td></tr>
    <tr><td>Refused hand-overs</td><td>0</td><td>1</td><td>none</td></tr></tbody></table></div>
    ${note('Counts only. Nothing here says who tried, and nothing your group holds is shown.')}`)}
  ${sec('Where from', `<div class="mk-where">${[['Netherlands', 2610], ['Germany', 330], ['United States', 160], ['Singapore', 61], ['4 other countries', 28]].map(([k, n]) => `<span class="k">${k}</span><span class="bar" style="--w:${Math.max(1, Math.round(n / 2610 * 100))}%" aria-hidden="true"></span><span class="n">${n.toLocaleString('en-US')}</span>`).join('')}</div>
    <p class="mk-small muted" style="margin:0">Refused sign-ins and keys, and requests turned away or blocked, by the country Cloudflare reports for them.</p>
    ${note('A country is not proof of who is behind an attempt: anyone can borrow an address in another country. No address is ever kept or shown, and a member\'s own sign-ins are never placed: a mistyped password followed by the member signing in is counted without a country.')}`)}
  ${sec('When you are told', `${sheet(row(kindm('noticed'), '<b>Security</b> · sign-in refusals far above the usual and still going on, all refused so far<span class="meta">sent to administrators once, at 01:40, when the level became high · not sent again while it lasted</span>', ''))}${note('Administrators are told only when the level is high, never as a routine count. The notice opens this screen at that period.')}`)}
  ${sec('Security tools', `<p class="mk-small">Built in: a virus scanner (ClamAV, signatures fetched daily) and the safe view. Add your organization's own tools of any kind: file scanners, safe-copy makers, sandboxes, address checks, a place to send security counts.</p>
    ${sheet(row(I('accepted'), '<b>ClamAV</b> · built-in file scanner<span class="meta">signatures of 6 October · runs in your group\'s own account</span>', '<span class="cs-due" data-due="met">On</span>') +
      row(I('accepted'), '<b>Scanii</b> · file scanner · runs when a member asks for a deeper check<span class="meta">sends the file\'s bytes, never its name · deletes the file when the scan ends · region: EU · results kept up to 400 days · shares nothing</span>', btn('owed:securitytoolremove K1929', 'Remove')) +
      row(I('accepted'), '<b>Cloudflare</b> · address check before a capture<span class="meta">your hosting company already carries your traffic, so no one new learns an address</span>', '<span class="cs-due" data-due="met">On</span>'))}
    ${acts(btn('owed:securitytooladd K1929', 'Add a tool', { tone: 'primary' }))}
    <div class="cs-sheet" style="padding:14px 16px;display:grid;gap:10px"><b>Adding: Sophos Intelix, file scanner</b>
     <div class="tw"><table class="mk-table"><tbody>
      <tr><td>What it is sent</td><td>The file's bytes. Never its name, who captured it or your group's address.</td></tr>
      <tr><td>Who receives it</td><td>Sophos Ltd, in the region you choose; it uses no one else.</td></tr>
      <tr><td>How long it keeps files</td><td>Clean files up to 30 days. <b>Files it judges malicious: kept by Sophos in the UK, indefinitely, for its own research.</b></td></tr>
      <tr><td>Shares with others</td><td>No.</td></tr></tbody></table></div>
     <p class="mk-small" style="margin:0"><b>When it runs:</b> only when a member asks for a deeper check. A tool on your organization's own servers may also check every file as it arrives.</p>
     ${checks('Before you turn it on', [['I understand that files Sophos judges malicious are kept by Sophos in the UK indefinitely', false]])}
     ${acts(btn('owed:securitytooltest K1929', 'Test it with a harmless test file'), btn('owed:securitytooladd K1929', 'Turn it on'))}
     <p class="mk-small muted" style="margin:0">A service that shares by default is offered only with its private mode, which Civicsmith turns on and checks on every call; if it can't confirm private mode, nothing is sent.</p></div>
    ${note('Not offered, because they share what is sent to them: VirusTotal uploads, Jotti, Hybrid Analysis, and the public modes of ANY.RUN, Joe Sandbox and urlscan.io. A tool whose vendor does not say whether it shares what it is sent is not offered until it does. An address check never sends the full address to anyone new: only checks that send a scrambled fragment, or Cloudflare\'s own. A site known to be bad: the document is still captured, as high risk, opens only in the safe view, and the check\'s answer is noted on it.')}
    ${note('Sending security counts elsewhere (a log service your organization uses) sends counts only, never who opened which file.')}`)}
  ${sec('What you can do', `<p class="mk-small">A member who fears their password is weak can change it in ${ref('Your account', 'account', '<b>Your account</b> · each member\'s own handle, password and signing key', 'Where a member changes their password.')}. An administrator can turn off the reusable join link or the group\'s key in ${ref('Members', 'members', '<b>Members</b> · everyone in the group and what each may do', 'Where the join link and the group\'s key are switched.')}. Whoever holds the hosting account can tighten Cloudflare\'s own settings there.</p>`)}` });

SCR.account = c => ({ rail: 'settings', title: 'Your account', crumbs: ['Settings', 'Your account'], main: `
  ${h1('Your account', 'mai.k · member since 6 October 2026')}
  ${sec('Language and appearance', `${choice('mk-l2', 'Language', ['English', 'Español', 'Tiếng Việt'], 'English', { act: 'owed:memberlanguageset DEC-127' })}${choice('mk-th', 'Appearance', ['Follow my device', 'Light', 'Dark'], 'Follow my device')}${choice('mk-lvl', 'Explanations', ['Marks and names', 'With guidance'], 'With guidance', { act: 'owed:infolevelset DEC-162', help: 'Marks and names: every mark and name explains itself when you rest on it. With guidance: screens, sections and the rail also say what they are and what you can do. New members start with guidance; after a month Civicsmith asks once whether to keep it. Alt+Shift+I or the masthead switches it at any time.' })}${acts(btn('owed:memberlanguageset DEC-127', 'Save'))}`)}
  ${sec('What you know', `${field('mk-exp', 'Your expertise (optional)', 'Tenant organiser; Spanish–English interpreter', { help: 'The group can ask you to check work in your field. An administrator may confirm it; it gates nothing.' })}${acts(btn('expertisedeclare', 'Declare your expertise'))}`)}
  ${sec('Password and signing key', acts(btn('setpassword', 'Change your password'), btn('signerregisterown', 'Register a signing key in this browser'), btn('signerrevokeown', 'Revoke your signing key')))}
  ${sec('Elsewhere in your settings', `<div class="mk-links"><a href="#" onclick="return false">${I('machine')}Your Claude account${c.ai ? ' · connected' : ' · not connected'}</a><a href="#" onclick="return false">${I('group')}Your ties</a><a href="#" onclick="return false">${I('case')}Your notes</a></div>`)}` });

const CONNECT_ST = { 'owed:subscriptionsignin DEC-156': 'c', groupkeynoticeseen: 'a', disclosureshown: 'c', accountreferenceset: 'c', aiceilingset: 'c', accountswitchset: 'c', accountreferenceremove: 'b' };
SCR.connect = c => { const st = CONNECT_ST[c.wizard && c.wizard.act]; const sel = v => v === (st || 'a') ? ' selected' : ''; return { rail: 'settings', title: 'The assistant', st, main: `
  <div class="mk-mockctl"><label for="mk-st">In this mockup, show the screen for</label> <select id="mk-st" class="cs-input" onchange="this.closest('main').dataset.st=this.value"><option value="a"${sel('a')}>a group offering its key; you have no account of your own</option><option value="b"${sel('b')}>a group offering its key; you connected your own</option><option value="c"${sel('c')}>a group where members bring their own accounts</option><option value="d"${sel('d')}>a group using only its own key</option><option value="e"${sel('e')}>a group without the assistant</option></select></div>
  ${h1('The assistant', 'Optional. Everything in Civicsmith works without the assistant.')}
  <div class="cs-sheet">
   <div class="st st-a">${row(I('group'), '<b>The assistant serves you on Lakeshore Tenants\' API key.</b> The group pays, up to <b>$5.00 a day for each member</b>, a limit your administrators set (you have used $0.80 of it today). At the limit, the assistant pauses for you until the next day; everything else works as usual. You have no account of your own connected.', '')}</div>
   <div class="st st-b">${row(I('accepted'), '<b>The assistant serves you on your own Claude account</b> (API key ending …4f2a). Only you use it; you pay for it.', '')}${row(I('group'), 'If you disconnect it, Lakeshore Tenants\' API key serves you instead.', '')}</div>
   <div class="st st-c">${row(I('undetermined'), '<b>The assistant isn\'t serving you yet.</b> Your group asks each member to connect their own account; connect yours below, or skip it.', '')}</div>
   <div class="st st-d">${row(I('group'), '<b>The assistant serves you on Lakeshore Tenants\' API key.</b> Your group uses only its own key, so there is nothing for you to connect.', '')}</div>
   <div class="st st-e">${row(I('status'), '<b>Your group uses Civicsmith without the assistant.</b> Everything still works: searching, counting and your group\'s templates take its place. An administrator can change this in the group\'s settings.', '')}</div>
  </div>
  <div class="st st-a st-d">${sec('Before your first question', `<div class="cs-dialog" style="max-width:none;box-shadow:none"><span class="cs-tag-outward">${I('outward')}Outward · leaves your group's Civicsmith</span><div class="ends">Your questions, and the material read to answer them, go to Anthropic under the group's account. Administrators see how much you spend, never what you ask.</div>${acts(btn('groupkeynoticeseen', 'I have read this'))}</div>`)}</div>
  <div class="st st-a st-c">${sec('Connect your own account (optional)', `<div class="st st-a">${note('If you connect your own account, it serves you instead of the group\'s key, and only you.')}</div><div class="cs-dialog" style="max-width:none;box-shadow:none"><span class="cs-tag-outward">${I('outward')}Outward · leaves your group's Civicsmith</span><div class="ends">When you ask the assistant something, your question and the material read to answer it go to Anthropic under your own Claude account, and its terms apply. Nothing goes unless you ask.</div>${acts(btn('disclosureshown', 'I have read this'))}</div>
    ${checks('Connect with', [['My Claude subscription (Pro or Max): sign in on Anthropic\'s page', true], ['My own Claude API key (made in your web browser)', false], ['Skip: use Civicsmith without the assistant', false]], { radio: true })}
    <ol class="mk-list"><li>Open Anthropic's sign-in page. It opens in a new tab: Anthropic's own page, not Civicsmith's.</li><li>Sign in to your Claude account there and approve.</li><li>Anthropic's page shows you a code. Copy it.</li><li>Paste it below and connect.</li></ol>
    ${acts(btn('owed:subscriptionsignin DEC-156', 'Open Anthropic\'s sign-in page'))}
    ${field('mk-code', 'The code from Anthropic\'s page', '', { help: 'Civicsmith never sees your Claude password. Your subscription then serves only your own questions, and you can disconnect at any time. Needs a Pro or Max plan, and your group\'s Civicsmith on Workers Paid.' })}
    <details class="mk-details"><summary>Using an API key instead</summary>${field('mk-key', 'Your API key', 'sk-ant-…', { help: 'In your web browser: go to console.anthropic.com, sign in, add a payment method, then API keys › Create key, and paste it here. Anthropic bills you for each use. Civicsmith keeps it sealed, never shows or exports it, and uses it only for your questions.' })}</details>
    ${acts(btn('accountreferenceset', 'Connect', { tone: 'primary' }))}`)}</div>
  <div class="st st-b st-c">${sec('Your limit and suggestions', `${field('mk-lim', 'Your daily limit', '$2.00', { help: 'On your own account. Your administrator has set at most $5.00 a day for anyone in the group.' })}${acts(btn('aiceilingset', 'Set your daily limit'))}${checks('Suggestions', [['Let the assistant suggest things without being asked', false]], { act: 'accountswitchset' })}${acts(btn('accountswitchset', 'Save'))}`)}</div>
  <div class="st st-a st-d">${sec('Limits and suggestions', note('On the group\'s key, your administrators set the daily limit and whether the assistant may suggest things unprompted. Today: <b>$5.00 a day for each member</b>, the figure they set for the group (you have used $0.80 of it today); suggestions <b>off</b>. If they change either, this shows the new setting.'))}</div>
  <div class="st st-b">${sec('Disconnect', acts(btn('accountreferenceremove', 'Disconnect your account')))}</div>` }; };

SCR.ties = c => ({ rail: 'settings', title: 'Your ties', crumbs: ['Settings', 'Your ties'], main: `
  ${h1('Your ties', 'Only you and the administrators can see this.')}
  ${sheet(row(I('group'), '<b>Employer</b> · East Bay Transit', '<span class="muted">a case would say: “a member of the group”</span>') + row(I('subject'), '<b>Relative</b> · a cousin on the Planning Commission staff', '<span class="muted">a case would name me</span>'))}
  ${sec('Add a tie', `${choice('mk-tk', 'Kind', ['Employer', 'Relative', 'A business I have an interest in', 'Other'], 'A business I have an interest in')}${field('mk-tw', 'Who', 'Lakeshore Hardware Co-op (member-owner)')}${checks('If a case the group publishes concerns them, the case discloses this tie', [['Naming me by my handle: “Dev, who worked on this case, is a member-owner of Lakeshore Hardware Co-op.”', false], ['Without naming me: “A member of the group who worked on this case is a member-owner of Lakeshore Hardware Co-op.”', true]], { radio: true })}${note('Either way the tie is disclosed to readers of the case. Inside the group, only you and the administrators see this list.')}${acts(btn('declaretie', 'Add this tie', { tone: 'primary' }), btn('withdrawtie', 'Remove a tie'))}`)}` });

SCR.notes = c => ({ rail: 'settings', title: 'Your notes', crumbs: ['Your notes'], main: `
  ${h1('Your notes', 'Only you can see these in your group. <a href="#" onclick="return false">What this protects, and from whom</a>')}
  ${field('mk-note', 'New note', 'The potholes on Seminary between 59th and 62nd have been patched three times since spring and keep opening.', { area: true, rec: true })}
  ${acts(btn('notewrite', 'Keep this note', { tone: 'primary' }), btn('noteturn', 'Turn into an observation, hunch or question'))}
  ${sec('Kept', sheet(row(I('case'), '<span class="rec">Ask the crew foreman on 60th what “closed” means to them.</span><span class="meta">4 October · only you</span>', `<span class="mk-acts">${btn('owed:noterevise DEC-144', 'Revise')}${btn('owed:notedelete DEC-144', 'Delete')}</span>`)))}` });

SCR.translations = c => ({ rail: 'settings', title: 'Translations', main: `
  ${h1('Translations', 'The words members see, in your group\'s languages.')}
  ${choice('mk-tl', 'Language', ['Español', 'Tiếng Việt'], 'Español')}
  ${sec('Who may translate Español', `${sheet(row(I('group'), '<b>Mai</b> · speaks Español', '<span class="muted">granted by Rosa, 2 October</span>') + row(I('group'), '<b>Teo</b> · speaks Español', '<span class="muted">granted by Rosa, 5 October</span>'))}${acts(btn('owed:translationgrant DEC-157', 'Give a member the grant for a language'))}`)}
  <div class="tw"><table class="mk-table"><thead><tr><th>English</th><th>Español</th><th></th></tr></thead><tbody>
   <tr><td>Undetermined <span class="mk-tag">Protected</span></td><td>Indeterminado</td><td class="muted">from the release</td></tr>
   <tr><td>Nobody looked</td><td class="mk-draftcell">Nadie buscó</td><td>${c.ai ? origin('machine', 'Draft · the assistant\'s') : '<span class="muted">typed by Mai</span>'}</td></tr>
   <tr><td>This tells the office what you are looking at. <span class="mk-tag">Protected</span></td><td class="mk-draftcell">Esto le indica a la oficina lo que está investigando.</td><td><span class="muted">${c.ai ? 'changed from the assistant\'s draft by Mai · needs a second check' : 'typed by Mai · needs a second check'}</span></td></tr>
   <tr><td>City Clerk <span class="mk-tag">Local name</span></td><td>City Clerk · <span class="muted">la oficina que guarda los registros de la ciudad</span></td><td class="muted">name kept; explanation translated</td></tr>
   <tr><td>Held together</td><td></td><td><span class="muted">untranslated · shown in English</span></td></tr></tbody></table></div>
  ${acts(c.ai ? btn('owed:translationdraft DEC-127', 'Ask the assistant to draft the 12 missing') : '', btn('owed:translationadopt DEC-127', 'Keep this word', { tone: 'primary' }), btn('owed:translationconfirm DEC-157', 'Confirm a protected word'), btn('owed:translationrevert DEC-157', 'Undo a change'))}
  ${note(c.ai ? 'A speaker checks the assistant\'s drafts for errors. A protected word kept as the assistant drafted it shows once kept. Changed from the draft, it shows only after a second granted speaker confirms it, or an administrator confirms it after reading the assistant\'s translation of it back into English; until then members see the English.' : 'Type each word; a member who knows the language keeps it. A protected word shows only after a second granted speaker confirms it; until then members see the English.')}
  ${sec('Marked wrong by members', `${sheet(row(I('flagged'), '“Reasoned” → “Razonado”', '<span class="muted">Ana: “should be Justificado” · 4 October</span>'))}${note('Any member can mark a word with “this translation looks wrong”; it is listed here for the granted members and the administrators. Every word records who adopted it, when and what it replaced.')}`)}
  ${sec('Local names', note('Names of offices, laws, programs and places stay as they are, with an explanation in the member\'s language beside them. Where the place publishes an official translation, it comes with the place\'s rules and shows its source. What goes to an office goes in the office\'s language, with a labelled translation beside it for the member.'))}` });

SCR.wizards = c => ({ rail: 'settings', title: 'Wizards', crumbs: ['Settings', 'Wizards'], main: `
  ${h1('Wizards', 'Walk-throughs of the real screens. Civicsmith\'s own come with each release; your group can add its own, or copy one and change the copy.')}
  ${sheet(row(I('wizard'), '<b>Get a record</b> · Civicsmith', '<span class="muted">finished by 14 members</span>') + row(I('wizard'), '<b>Get a record, Oakland style</b> · this group · <span class="muted">based on Civicsmith\'s “Get a record”</span>', '<span class="muted">approved by Rosa · Civicsmith\'s original changed since: see what changed</span>') + row(I('wizard'), '<b>Our council-meeting checklist</b> · this group', '<span class="muted">approved by Rosa</span>') + row(I('wizard'), '<b>Check a pothole report</b> · draft by Dev', '<span class="muted">draft</span>'))}
  ${acts(btn('wizards', 'See the whole library'), btn('wizarddraft', 'Record a new wizard', { tone: 'primary' }), btn('wizarddraft', 'Copy a wizard to change it'), btn('wizardrevise', 'Revise a draft'), btn('wizardsubmit', 'Submit for approval'), btn('wizardapprove', 'Approve'), btn('wizardretire', 'Retire'))}}
  ${note('A copy becomes your group\'s own wizard: a draft until approved, like any wizard your group writes. The original stays as it is and is still offered; a required wizard stays required. The copy shows what it is based on, and when Civicsmith\'s original changes, your wizard editors are told and can bring the change across.')}` });

/* ---------------- daily work ---------------- */
SCR.queue = c => ({ rail: 'queue', title: 'Your queue', main: `
  ${h1('Your queue', '6 items · grouped by case · <a href="#" onclick="return false">sort by time due</a>')}
  ${note('Three kinds: <b>To do</b> needs your act; <b>Noticed</b> is something the record found that nobody has judged; <b>Status</b> tells you where something stands. <span class="muted">(Shown once.)</span>')}
  ${sec('The Coliseum lease', sheet(
    row(kindm('todo'), `Decide on a newer version of ${ref('<span class="rec">the 2024 lease amendment</span>', 'document', '<b>Lease amendment, March 2024</b> · Coliseum lease · captured from the city&#39;s site, capture B · the city posted a newer version on 3 October · cited in 2 findings of Edition 2<span class=why><b>Here:</b> you cited it in Edition 2; decide whether the newer version changes what the case says.</span><span class=more>Click to open the document, with the two versions side by side.</span>')} you cited<span class="meta"><span class="cs-changed">${I('changed')}Changed 3 October</span>${btn('adoptversion', 'Adopt the newer version')}${btn('keepversion', 'Keep the version you cited')}</span>`, due('near', 'Due Friday')) +
    row(kindm('noticed'), `Two documents give different dates for the rent adjustment<span class="meta"><span class="cs-tension">${I('tension')}In tension</span>${btn('taskresolve', 'Open both')}</span>`, '') +
    row(kindm('status'), `The city's reply to ${ref('“Demand to rescind”', 'action', '<b>Demand to rescind</b> · a letter the group sent the City Administrator on 19 September · reply due 9 October (the group&#39;s own window) · no reply recorded<span class=why><b>Here:</b> the reply is overdue, so the plan&#39;s next step can start.</span><span class=more>Click to open the action and what was sent.</span>')} was due 9 October; no reply recorded<span class="meta">${btn('reminderanswer', 'Remind me again on…')}</span>`, due('overdue', 'Overdue'))))}
  ${sec('Pothole repairs', sheet(
    row(kindm('todo'), `Ana asked you to check a calculation: <span class="rec">812 of 903 reports closed within 7 days</span><span class="meta">${btn('taskresolve', 'Open the check')}${btn('taskforward', 'Forward to a member')}</span>`, due('', 'Due 16 October')) +
    row(kindm('noticed'), `A council member disclosed income from a firm whose contract they voted on<details class="mk-hintd"><summary>${hint()} <span class="muted">matched disclosures to votes · 1 of 212 votes · false alarms 12% · </span><span class="cs-ref">How was this found?</span></summary>
   <dl class="mk-dl"><dt>What was matched</dt><dd>${ref('J. Ortega', 'person', '<b>J. Ortega</b> · Council District 3 since 2023, from Legistar')}'s ${ref('Form 700 for 2025', 'document', '<b>Statement of Economic Interests (Form 700), 2025</b> · J. Ortega · captured from the city&#39;s filing portal, capture A')} lists income from Bayline Properties. On 12 January 2024 J. Ortega voted for ${ref('Lease amendment 1', 'document', '<b>Lease amendment 1</b> · approved 12 January 2024 · Council minutes, item 7')}, whose payments go to ${ref('Bayline Properties', 'money', '<b>Bayline Properties</b> · $1.2M paid FY2024 under the Coliseum lease')}.</dd>
   <dt>How it was found</dt><dd>The check “disclosed income against votes” compared 38 disclosure filings with 212 council votes on contracts in the documents your group holds, matching names of firms. One match.</dd>
   <dt>How far to trust it</dt><dd>Of this check's past hints that members looked into, 12% were false alarms (6 of 50), most often two firms with similar names. It is shown only because that rate is under 20%.</dd>
   <dt>What it is not</dt><dd>A lead, never a finding. Nothing here is evidence until a member opens a question and cites the documents themselves.</dd></dl>
   ${acts(btn('promote', 'Open a question from this'), btn('proposedispose', 'Dismiss with a reason'), btn('queuemute', 'Stop this kind of hint for the project'))}</details>`, '') +
    row(kindm('status'), `Your standing question found 3 new documents: <span class="rec">pothole work orders</span><span class="meta">${c.ai ? '<span class="cs-origin" data-origin="machine">' + I('machine') + 'Read by the assistant</span>' : '<span class="muted">3 new matches, unread</span>'}${btn('queuesnooze', 'Snooze to a date')}${btn('queuemute', 'Mute this kind')}</span>`, '')))}` });

SCR.finder = c => ({ rail: 'find', title: 'Find', main: `
  ${h1('Find', 'Search everything your group holds, then hold a set together to act on it.')}
  <div class="mk-search" data-act="search"><input class="cs-input" id="mk-q" value="pothole work orders 2025"><span>${btn('search', 'Search', { tone: 'primary', icon: 'search' })}</span></div>
  ${sheet(
    row('<input type="checkbox" checked aria-label="pick">', '<b class="rec">Public Works work orders, FY2025 (CSV)</b><span class="meta">' + grade('capture', 'B') + ' captured by Dev, 2 October · data.oaklandca.gov</span>', '') +
    row('<input type="checkbox" checked aria-label="pick">', '<b class="rec">Pothole repair policy, Administrative Instruction 4.12</b><span class="meta">' + grade('capture', 'B') + ' passage 3: "within seven calendar days"</span>', '') +
    row('<input type="checkbox" aria-label="pick">', '<b class="rec">Report to council: street maintenance performance</b><span class="meta">' + grade('capture', 'C') + ' public archive copy</span>', ''))}
  ${gapm('nobody', '<b>Nobody looked</b> in the 2024 council minutes for this yet. ') } ${btn('frontier', 'See where nobody looked')} ${btn('countask', 'Count')}
  <div class="cs-hold mk-hold">${I('hold')}<span><span class="n">2 documents held together</span><span class="drift"> · until 16:40 today</span></span><span class="acts">${btn('select', 'Hold these together')}${btn('owed:findin DEC-164', 'Find in these', { icon: 'search' })}${btn('selectionrelease', 'Let the set go')}</span></div>` });

SCR.capture = c => ({ rail: 'add', title: 'Add', main: `
  ${h1('Add to the record', 'A document from an address or a file, a photo, or what you saw yourself.')}
  <div class="mk-tabs2" role="tablist"><span aria-selected="true">From an address</span><span>A file or photo</span><span>What I saw or heard</span></div>
  ${field('mk-url', 'Address', 'https://www.oaklandca.gov/resources/street-maintenance-report-2026', { act: 'acquire', help: 'A copy fetched from the office\'s own site holds up better than one found elsewhere.' })}
  ${acts(btn('acquire', 'Capture', { tone: 'primary' }), btn('capturerequest', 'Ask for this later'), btn('monitor', 'Watch this address for changes'))}
  ${note('Capturing through a public archive tells that archive what your group is looking at. A site known for malware is still captured, as high risk: it opens only in a safe view.')}
  ${sec('A file or photo', `<div class="mk-drop">${I('camera')} Take a photo, or choose a file</div>${acts(btn('capture', 'Capture this file'))}${note('A ZIP archive is opened as it is captured: its files are held for review beside it, each with the archive\'s grade.')}`)}
  ${sec('What I saw or heard', `${field('mk-obs', 'In your own words', 'On 4 October at 9:10 I visited 6012 Seminary Ave. The pothole reported on 12 September and marked closed on 15 September is still open, about 60 cm across.', { area: true, rec: true })}${field('mk-where', 'Where and when', '6012 Seminary Ave · 4 October 2026, 9:10')}${acts(btn('testify', 'Record what you saw', { tone: 'primary' }))}${note('Your account is testimony: always grade D, labelled as yours, and never discounted for it.')}`)}` });

SCR.held = c => ({ rail: 'add', title: 'Held captures', crumbs: ['Add', 'Held captures'], main: `
  ${h1('Held captures', 'Captured but not yet vouched for. Nothing here is sent to you; it waits.')}
  ${sheet(
    row('<input type="checkbox" checked aria-label="pick">', '<b>Photo · Seminary Ave at 60th</b><span class="meta">' + grade('capture', 'B') + ' 2 days old · Pothole repairs</span>', '') +
    row('<input type="checkbox" checked aria-label="pick">', '<b>Photo · Seminary Ave at 61st</b><span class="meta">' + grade('capture', 'B') + ' 2 days old · Pothole repairs</span>', '') +
    row('<input type="checkbox" aria-label="pick">', '<b>City budget FY2024–25, adopted (PDF)</b><span class="meta">' + grade('capture', 'B') + ' 1 day old · Sewer fund transfers · <b>for Ana\'s question</b> <span class="rec">"Were the FY2022 transfers authorised?"</span></span>', '') +
    row('<input type="checkbox" aria-label="pick">', '<b>Council minutes, 14 May 2024</b><span class="meta">' + grade('capture', 'B') + ' 3 days old · ' + gapm('withheld', '<b>Withheld.</b> Captured for a question you may not see.') + '</span>', '') +
    row('<input type="checkbox" aria-label="pick">', '<b>Agenda packet, City Council, 14 May 2024 (ZIP)</b><span class="meta">' + grade('capture', 'B') + ' 1 day old · Sewer fund transfers · <b>36 files held beside it</b> · 2 not filed</span>', '') +
    row('<input type="checkbox" disabled aria-label="not eligible">', '<b>Lease amendment, March 2024</b><span class="meta">' + gapm('refused', 'Not eligible for a batch: it is crucial to a finding. Vouch for it on its own.') + '</span>', ''))}
  <div class="cs-reason"><p class="mk-note"><b>Ana's question is waiting for the FY2024–25 budget.</b> Your reason is kept on the record and shown to Ana on her question.</p>${field('mk-sa', 'Why set it aside?', 'Wrong year: the question is about FY2022.', { rec: true, reason: true })}</div>
  <div class="cs-hold mk-hold">${I('hold')}<span><span class="n">2 captures picked</span></span><span class="acts">${btn('heldcaptures', 'Refresh the list')}${btn('heldsetaside', 'Set aside, with one reason')}${btn('heldrestore', 'Restore')}${btn('release', 'Vouch for both', { tone: 'primary' })}</span></div>` });

/* K1852 (Bob, "as recommended"), drawn by DEC-167: a captured archive (a ZIP) opens on capture, within published limits.
   Each file cut out unambiguously is filed as its own capture with the archive's grade, held for review beside it; any
   other is listed, not filed, with its reason named. A higher grade comes only from capturing that file on its own. */
const AZ = 'Agenda packet, City Council, 14 May 2024';
const zrow = (name, meta, st, pick) => row(pick === false ? '<input type="checkbox" disabled aria-label="not filed">' : `<input type="checkbox"${pick ? ' checked' : ''} aria-label="pick">`, `<span class="id">${name}</span><span class="meta">${meta}</span>`, st);
SCR.archive = c => { const st = c.v === 'refused' ? 'b' : 'a'; return { rail: 'add', title: 'Archive', st, main: `
  <div class="mk-mockctl"><label for="mk-zst">In this mockup, show</label> <select id="mk-zst" class="cs-input" onchange="this.closest('main').dataset.st=this.value"><option value="a"${st === 'a' ? ' selected' : ''}>an archive that opened</option><option value="b"${st === 'b' ? ' selected' : ''}>an archive that could not be opened</option></select></div>
  ${h1(`<span class="rec">${AZ} (ZIP)</span>`, 'Captured by Ana from the city\'s meeting site, 2 October 2026 · Sewer fund transfers')}
  <div class="row">${grade('capture', 'B', 'Capture')}${btn('gradenote', 'Why B?')}<span class="id">fingerprint 91c4…7e02 · 41 entries · 182 MB</span></div>
  <div class="st st-a"><div style="display:grid;gap:20px">
   <div class="cs-sheet" style="padding:12px 14px;display:grid;gap:6px"><b>Opened when it was captured: 36 files filed and held for review beside it, 1 already held, 2 not filed, 2 folders.</b><span class="mk-small">Each filed file carries this archive's grade, B, and its co-attestation: never stronger, never weaker. Anyone can cut the same file out with ordinary tools and get the same fingerprint.</span></div>
   ${sec('Files in it', sheet(
     zrow('01_Agenda.pdf', 'Filed · held for review · capture B · 2 pages', '', true) +
     zrow('02_Staff report - sewer fund transfers.pdf', 'Filed · held for review · capture B · 14 pages', '', true) +
     zrow('03_Resolution 2024-118.pdf', `${origin('accepted', 'Already held')} the same file Ana captured directly on 28 September; this copy is kept as a second sighting of it`, '', false) +
     zrow('04_Attachments/', 'A folder · its 31 files are listed and filed below it', '<span class="muted">listed</span>', false) +
     zrow('05_Budget detail FY2022-24.xlsx', 'Filed · held for review · capture B · 6 sheets', '', true) +
     zrow('06_Exhibit C.pdf <span class="muted">(entry 17)</span>', 'Filed · held for review · capture B · <b>2 entries share this name</b>; each is filed by its number', '') +
     zrow('06_Exhibit C.pdf <span class="muted">(entry 18)</span>', 'Filed · held for review · capture B · 2 entries share this name', '') +
     zrow('07_Closed session draft.pdf', gapm('refused', '<b>Not filed:</b> the archive locks this file with a password. It is listed, never opened.'), '', false) +
     zrow('09_Meeting video.mp4', gapm('refused', '<b>Not filed:</b> 1.2 GB, over the 256 MB limit for one file. Capture the video from its own address.'), '', false)) +
     note('Names, folders and dates are as the archive states them, kept exactly; a name is never trusted as a place to write.'))}
   ${sec('A higher grade for one file', `<p class="mk-small">A file here can earn a higher grade only by being captured on its own, from its own source; the new capture lands beside this one, and nothing is regraded.</p>${acts(link('Capture a file on its own'))}`)}
   <div class="cs-hold mk-hold">${I('hold')}<span><span class="n">3 files picked</span><span class="drift"> · held for review beside the archive</span></span><span class="acts">${btn('owed:archivelist K1852', 'Show only those not filed')}${btn('heldsetaside', 'Set aside, with one reason')}${btn('release', 'Vouch for these 3', { tone: 'primary' })}</span></div>
  </div></div>
  <div class="st st-b"><div style="display:grid;gap:14px">
   ${gapm('refused', '<b>Could not open this archive, because two of its entries claim the same bytes.</b> Nothing in it is filed. The archive itself stays captured exactly as it arrived, with its grade, and anyone can check why it was refused.')}
   ${note('A damaged or tampered archive is refused whole rather than filed in part. If the city has a clean copy, capture it again from its address; it lands beside this one.')}
   ${acts(btn('owed:archivelist K1852', 'See what it lists'))}
  </div></div>` }; };

/* K1888, K1890, K1892, K1928, K1929 (Bob), drawn by DEC-168: before a file opens. Low risk opens the original (scanned
   first if not scanned in the week); high risk opens in the safe view, a derived copy, the original one click away after a
   deeper check; a finding holds the original until two members or a second, different engine release it. Nothing records
   who opened what (K1892). */
const OPEN_ST = { low: 'a', high: 'b', held: 'c' };
const vnote = (tool, engine, ver, res, at) => row(I('accepted'), `<b>${tool}</b> · ${engine}<span class="meta">${ver} · ${at}</span>`, `<span class="cs-due"${res === 'Found' ? ' data-due="overdue"' : res === 'Clean' ? ' data-due="met"' : ''}>${esc(res)}</span>`);
SCR['open-file'] = c => { const st = OPEN_ST[c.v] || 'b'; const sel = v => v === st ? ' selected' : ''; return { rail: 'projects', title: 'Opening a file', st, main: `
  <div class="mk-mockctl"><label for="mk-ost">In this mockup, show</label> <select id="mk-ost" class="cs-input" onchange="this.closest('main').dataset.st=this.value"><option value="a"${sel('a')}>a low-risk file</option><option value="b"${sel('b')}>a high-risk file</option><option value="c"${sel('c')}>a file held after a finding</option></select></div>
  <div class="st st-a"><div style="display:grid;gap:18px">
   ${h1('<span class="rec">Pothole repair policy, Administrative Instruction 4.12</span>', 'PDF · captured by Dev from the city\'s site, 2 October')}
   <div class="row" style="gap:10px"><span class="cs-risk" tabindex="0" data-tip="<b>Low risk</b>: your group\'s Civicsmith fetched it itself, and it holds nothing that acts on its own: no scripts, macros or links that run. It opens as it is.">Low risk</span><span class="mk-small">Fetched by your group's Civicsmith; nothing in it acts on its own.</span></div>
   ${acts(btn('owed:openoriginal K1888', 'Open the original', { tone: 'primary' }))}
   ${sec('Checks', sheet(vnote('Built-in scanner', 'ClamAV', 'engine 1.4.2 · signatures of 6 October', 'Clean', 'checked 6 October, 03:10')))}
   ${note('Checked again every week, and before it is first opened if the last check is older than that.')}
  </div></div>
  <div class="st st-b"><div style="display:grid;gap:18px">
   ${h1('<span class="rec">Memo on the 2024 rent adjustments (Word)</span>', 'Handed in at the doorbell, 3 October · The Coliseum lease')}
   <div class="row" style="gap:10px"><span class="cs-risk" data-risk="raised" tabindex="0" data-tip="<b>High risk</b>: it opens in the safe view, a picture of each page, until a deeper check passes. Its grade and its place in the record are unchanged.">High risk</span><span class="mk-small">Handed in, not fetched by your group's Civicsmith; it contains a macro.</span></div>
   ${acts(btn('owed:safeview K1888', 'Read the safe view', { tone: 'primary' }), btn('owed:deepercheck K1888', 'Ask for a deeper check'))}
   <div class="cs-sheet" style="padding:12px 14px;display:grid;gap:6px"><b>The safe view</b><span class="mk-small">A copy made by your group's Civicsmith: each page as a picture, nothing in it can run. ${origin('machine', 'Derived · a safe copy of the original')} Cite the original, never the safe copy; a citation always points at the original.</span></div>
   ${sec('Opening the original', `<p class="mk-small">The original opens only after a deeper check passes: the file read whole, the built-in scanner again, and every outside tool your group added, at least one of them a scanner other than the built-in one that finds it clean. A clean check opens it to any member for 24 hours. The safe view needs no check.</p>${sheet(vnote('Built-in scanner', 'ClamAV', 'engine 1.4.2 · signatures of 6 October', 'Clean', '3 October, 11:02') + row(I('clock'), '<b>Deeper check</b> · not asked for yet', ''))}${note('“Open the original” appears here once a deeper check passes. Who opens which file is never recorded.')}`)}
  </div></div>
  <div class="st st-c"><div style="display:grid;gap:18px">
   ${h1('<span class="rec">Budget detail FY2022-24.xlsx</span>', 'From the archive Agenda packet, City Council, 14 May 2024 · Sewer fund transfers')}
   <div class="row" style="gap:10px"><span class="cs-risk" data-risk="high" tabindex="0" data-tip="<b>Held</b>: a scanner found something. The original stays closed; the safe view, its grade and its place in the record are unchanged.">Held</span><span class="mk-small">The built-in scanner found <b>Xls.Downloader.Agent-917</b> on 6 October, and so did Scanii in the deeper check.</span></div>
   ${sheet(row(kindm('noticed'), '<b>A scanner found something</b> in Budget detail FY2022-24.xlsx<span class="meta">sent once to the members who can see it · nobody is named</span>', ''))}
   ${acts(btn('owed:safeview K1888', 'Read the safe view (its figures, as data)', { tone: 'primary' }), btn('owed:deepercheck K1888', 'Ask for a deeper check'))}
   ${sec('Releasing it', `<p class="mk-small">An outside scanner found it too, so it is released only when two members each give a reason. (Had only the built-in scanner found it, a second, different scanner finding it clean would release it.) A release covers this finding only.</p>${sheet(vnote('Built-in scanner', 'ClamAV', 'engine 1.4.2 · signatures of 6 October', 'Found', '6 October, 03:10') + vnote('Scanii', 'Sophos engine', 'deeper check', 'Found', '6 October, 09:40') + row(I('accepted'), '<b>The file read whole</b> · structure check', '<span class="cs-due">Flagged: an external link</span>'))}
    <div class="cs-reason">${field('mk-rel', 'Why release it?', 'The city\'s own budget file from its meeting site; the finding is a link to the city\'s own data portal, which we checked.', { rec: true, reason: true, act: 'owed:releasescanhold K1892' })}${acts(btn('owed:releasescanhold K1892', 'Release, with this reason', { tone: 'primary' }))}<p class="mk-small muted" style="margin:0">Ana gave a reason on 6 October; a second member's releases it. The machine never can.</p></div>`)}
  </div></div>` }; };

SCR.document = c => ({ rail: 'projects', title: 'Document', crumbs: ['Pothole repairs', 'Documents', 'Administrative Instruction 4.12'], main: `
  <div class="mk-doc-h">${h1('<span class="rec">Pothole repair policy, Administrative Instruction 4.12</span>', 'Public Works · revised 2023 · captured by Dev from oaklandca.gov, 2 October 2026')}${pathm(0)}</div>
  <div class="row">${grade('capture', 'B', 'Capture')}${btn('gradenote', 'Why B?')}<span class="id">fingerprint 3b9f…c210</span></div>
  ${acts(btn('owed:findin DEC-164', 'Find in this', { icon: 'search' }))}
  ${sec('Passages', `<blockquote class="mk-passage rec" data-act="cite">"3. The Director shall repair each reported pothole within seven calendar days of the report, weather permitting."</blockquote>${acts(btn('cite', 'Cite this passage', { tone: 'primary' }))}
    <blockquote class="mk-passage rec">"5. Repairs are recorded as closed when the crew reports the work complete."</blockquote>`)}
  ${sec('People it names', `${sheet(row(I('subject'), 'L. Chen, Director of Public Works', btn('identityclaim', 'Claim the same person')))}`)}
  ${sec('This copy', acts(btn('release', 'Vouch for this copy'), btn('attest', 'Attest'), btn('monitor', 'Watch for changes'), btn('retire', 'Retire')))}
  ${c.ai ? machine('Mai', '<p>This instruction sets the seven-day standard. The city\'s 2026 performance report counts reports "closed", which passage 5 defines as the crew reporting the work complete, not an inspection.</p>') : ''}` });

/* DEC-164: "Find in this", one control on a document, a held set and a project. Search finds words as written, figures,
   dates, requirement words and names the group already follows; it records nothing. Each result becomes a fact only by the
   act that already makes one, from its passage, by a member (K1468). The assistant's proposals are drawn as later (K1627). */
const FIND_ST = { doc: 'a', set: 'b', project: 'c' };
const found = () => origin('search', 'Found by search');
const frow = (what, where, act) => row(found(), `<span class="rec">${what}</span><span class="meta">${where}</span>`, act);
const fsec = (t, n, inner) => sec(`${t} <span class="muted">· ${n}</span>`, inner);
const NOTHING = t => `<p class="mk-note"><b>Nothing here.</b> ${t}</p>`;
SCR['find-in'] = c => { const st = FIND_ST[c.v] || 'a'; const sel = v => v === st ? ' selected' : ''; return { rail: 'projects', title: 'Find in this', st, main: `
  ${h1('Find in this', 'Pick what to look for. Every result shows where it was found. Nothing is recorded until you record it.')}
  <div class="cs-field" data-act="owed:findin DEC-164"><label for="mk-fscope">Look in</label><span class="help">Set by where you opened it: a document, the documents you are holding together, or a whole project.</span><select id="mk-fscope" class="cs-input" onchange="this.closest('main').dataset.st=this.value"><option value="a"${sel('a')}>This document: Administrative Instruction 4.12</option><option value="b"${sel('b')}>The 2 documents you are holding together</option><option value="c"${sel('c')}>Everything in Pothole repairs (14 documents)</option></select></div>
  ${checks('What to find', [['People and offices your group follows', true], ['Money figures', true], ['Dates and deadlines', true], ['Requirements: what someone shall or must do', true], ['Events in minutes and agendas', false], ['A name or term', true]])}
  ${field('mk-fterm', 'The name or term', 'closed', { help: 'Matched as Find matches words: as written, in every passage.' })}
  ${choice('mk-ffor', 'For which question (optional)', ['None yet', 'Is the city repairing reported potholes within seven days?', 'Does "closed" in the city\'s records mean "repaired"?'], 'Is the city repairing reported potholes within seven days?', { help: 'Kept with anything you record from here, so others can see why it was looked for.' })}
  ${acts(btn('owed:findin DEC-164', 'Find', { tone: 'primary', icon: 'search' }), btn('standingquestionset', 'Keep finding this as documents arrive'))}
  <div class="st st-a">
   ${fsec('People and offices', 1, sheet(frow('"The Director shall repair each reported pothole…"', 'Director of Public Works, held today by L. Chen · Administrative Instruction 4.12 · passage 3', btn('recordpersonfact', 'Add a fact from this passage'))))}
   ${fsec('Dates and deadlines', 2, sheet(frow('"within seven calendar days of the report"', 'a period, counted from each report · passage 3', btn('standarddeclare', 'Hold this as a standard')) + frow('"Revised 2023"', 'the document\'s own date · heading', btn('recorddatedfact', 'Record a dated fact'))))}
   ${fsec('Requirements', 1, sheet(frow('"The Director shall repair each reported pothole within seven calendar days of the report, weather permitting."', 'passage 3', origin('accepted', 'Held as a standard by Mai on 3 October'))))}
   ${fsec('Money figures', 0, NOTHING('This document has no money figures.'))}
   ${fsec('"closed"', 1, sheet(frow('"Repairs are recorded as <b>closed</b> when the crew reports the work complete."', 'passage 5', btn('cite', 'Cite in the question'))))}
  </div>
  <div class="st st-b">
   ${fsec('Dates and deadlines', 2, sheet(frow('"Reported" and "Closed": two date columns, 903 rows each', 'Public Works work orders, FY2025 · a table: its dates are counted through a calculation, never read in one by one', btn('tabledeclare', 'Declare the table')) + frow('"within seven calendar days of the report"', 'Administrative Instruction 4.12 · passage 3', btn('standarddeclare', 'Hold this as a standard'))))}
   ${fsec('People and offices', 1, sheet(frow('"The Director shall repair…"', 'Director of Public Works · Administrative Instruction 4.12 · passage 3', btn('recordpersonfact', 'Add a fact from this passage'))))}
   ${fsec('Requirements', 1, sheet(frow('"…shall repair each reported pothole within seven calendar days…"', 'Administrative Instruction 4.12 · passage 3', origin('accepted', 'Held as a standard by Mai on 3 October'))))}
   ${fsec('Money figures', 0, NOTHING('Neither document has money figures.'))}
   ${fsec('"closed"', 2, sheet(frow('"Closed": a column of the work orders', 'Public Works work orders, FY2025 · 903 rows', btn('tabledeclare', 'Declare the table')) + frow('"Repairs are recorded as <b>closed</b> when the crew reports the work complete."', 'Administrative Instruction 4.12 · passage 5', btn('cite', 'Cite in the question'))))}
  </div>
  <div class="st st-c">
   ${fsec('People and offices', 3, sheet(frow('L. Chen', 'named in 6 of the 14 documents · first in Report to council: street maintenance performance · passage 2', btn('recordpersonfact', 'Add a fact from this passage')) + frow('Director of Public Works', 'named in 9 documents · Administrative Instruction 4.12 · passage 3', btn('recordpersonfact', 'Add a fact from this passage')) + frow('City Administrator', 'named in 2 documents · Report to council: street maintenance performance · passage 1', btn('recordpersonfact', 'Add a fact from this passage'))))}
   ${fsec('Money figures', 1, sheet(frow('"$4.2 million for street maintenance in FY2025"', 'Report to council: street maintenance performance · passage 7', btn('recordfact', 'Read into a money fact'))))}
   ${fsec('Dates and deadlines', 3, sheet(frow('"within seven calendar days of the report"', 'Administrative Instruction 4.12 · passage 3', btn('standarddeclare', 'Hold this as a standard')) + frow('"reported on 12 September and marked closed on 15 September"', 'Mai\'s observation, 4 October · testimony, grade D', btn('recorddatedfact', 'Record a dated fact')) + frow('"Reported" and "Closed": two date columns, 903 rows each', 'Public Works work orders, FY2025 · a table', btn('tabledeclare', 'Declare the table'))))}
   ${fsec('Requirements', 1, sheet(frow('"…shall repair each reported pothole within seven calendar days…"', 'Administrative Instruction 4.12 · passage 3', origin('accepted', 'Held as a standard by Mai on 3 October'))))}
   ${fsec('"closed"', 37, sheet(frow('"Repairs are recorded as <b>closed</b> when the crew reports the work complete."', 'Administrative Instruction 4.12 · passage 5', btn('cite', 'Cite in the question')) + frow('"90% of reported potholes were <b>closed</b> within seven days"', 'Report to council: street maintenance performance · passage 4', btn('cite', 'Cite in the question'))) + acts(btn('search', 'See all 37 in Find')))}
  </div>
  ${note('Search finds words as written, figures, dates and the names of people and offices your group already follows. A name it doesn\'t follow yet is found only as a word: open the passage and add the person yourself.')}
  ${c.ai ? sec('Proposed by the assistant', `<p class="mk-note"><b>Not in the first release.</b> Switched on once it has been measured: at your request, and for a question you name, the assistant will also propose people, events and money figures that search can't match, such as "K. Osei, Deputy Director" in the council report, a person your group doesn't follow yet. Each is labelled machine work, graded no higher than its method earns, and becomes a fact only by the same acts, by a member.</p>${sheet(row(origin('machine', 'Proposed by the assistant'), '<span class="muted">"K. Osei, Deputy Director, presented the report" · Report to council: street maintenance performance · passage 2</span>', '<span class="muted">later</span>'))}`) : ''}` }; };

/* ---------------- projects and questions ---------------- */
SCR.project = c => ({ rail: 'projects', title: 'Pothole repairs', crumbs: ['Projects', 'Pothole repairs'], main: `
  <div class="mk-titlerow">${h1('Pothole repairs', 'Is the city repairing reported potholes as its own policy requires?')}${wizmark(2, 'Your first question · Check a claim')}</div>
  <div class="mk-grid2"><div>${ladder('stage', ['Forming', 'Investigating', 'Matured', 'Closed'], 1)}</div><div class="row">${btn('strengthbarset', 'Set the project\'s bar')}<span class="muted">Bar: B/B</span></div></div>
  ${acts(btn('owed:findin DEC-164', 'Find in this project', { icon: 'search' }))}
  ${sec('Questions', sheet(
    row(I('question'), `<span class="rec">Is the city repairing reported potholes within seven days?</span><span class="meta">${strength('B', 'C', '<b>Short on connection</b> · bar B/B', null, 'the link between report #4471 and the work order (C, matched by street address only). A work-order number on both would raise it to B')}</span>`, '') +
    row(I('question'), `<span class="rec">Does "closed" in the city's records mean "repaired"?</span><span class="meta">${gapm('unrated', '<b>Unrated</b> · rests on nothing yet')}</span>`, '')) +
    acts(btn('promote', 'Open a question', { tone: 'primary' }), btn('planopen', 'Plan what to do')))}
  ${c.ai ? sec('Suggested questions', machine('Mai', '<p class="rec">Did the 2026 report count reports closed within seven days, or within seven working days?</p>' + acts(btn('promote', 'Open this question')))) : ''}
  ${sec('Members', `<p>Dev (owner), Mai, Ana</p>${acts(btn('projectinvite', 'Invite a member to the project'), btn('projectjoin', 'Join'))}`)}` });

SCR.question = c => ({ rail: 'projects', title: 'Question', crumbs: ['Pothole repairs', 'Question'], main: `
  ${h1('<span class="rec">Is the city repairing reported potholes within seven days?</span>', 'Opened by Dev, 3 October · Pothole repairs')}
  <div class="mk-strengthbox"><div>${strength('B', 'C', '<b>Short on connection</b> · bar B/B', null, 'the link between report #4471 and the work order (C, matched by street address only). A work-order number on both would raise it to B')}</div><p class="mk-note">Strength is two grades, never one score. <a href="#" onclick="return false">What raises it</a>: a link the source itself makes, or a shared identifier.</p>${gapm('undetermined', '<b>Undetermined</b>, because the city does not define "closed" in the report.')}</div>
  <div class="cs-sheet" style="padding:12px 14px;display:grid;gap:8px"><span class="cs-wait">${I('clock')}Waiting: the 2024 budget PDF was set aside by Ben: <span class="rec">"wrong year"</span></span>${acts(btn('heldrestore', 'Restore it, with a reason'), btn('search', 'Find another source'))}<span class="mk-small muted">Set aside by Ben, 6 October · each act stays on the record</span></div>
  ${sec('Supports', sheet(row(grade('capture', 'B'), '<span class="rec">"…within seven calendar days of the report…"</span><span class="meta">' + ref('Administrative Instruction 4.12', 'document', '<b>Pothole repair policy, Administrative Instruction 4.12</b> · City of Oakland, Public Works · captured from the city&#39;s site 12 September 2026, capture B · current version · cited in 2 questions<span class=why><b>Here:</b> the standard this question tests the city against.</span><span class=more>Click to open it at passage 3.</span>') + ', passage 3 · cited by Dev</span>', btn('sever', 'Remove')) + row(grade('capture', 'B'), '<span class="rec">812 of 903 reports closed within 7 days</span><span class="meta">computed fact · method shown · checked by Ana</span>', btn('reinstate', 'Reinstate'))) + acts(btn('cite', 'Cite a passage', { tone: 'primary' })))}
  ${sec('Cuts against', sheet(row(grade('testimony', 'D'), '<span class="rec">"…marked closed on 15 September is still open, about 60 cm across."</span><span class="meta">Mai\'s observation, 4 October</span>', '')))}
  ${sec('Hunches', `<span class="cs-hunch">${I('hunch')}Hunch · Dev's</span> <span class="rec">Crews may be closing reports when they inspect, not when they repair.</span>${acts(btn('hypothesishold', 'Keep a hunch'))}`)}
  ${sec('Concluding', `${acts(btn('narrow', 'Narrow the question'), btn('conclude', 'Conclude'), btn('withdrawconclusion', 'Withdraw the conclusion'))}${acts(btn('checkrequest', 'Ask for a check by expertise'), btn('planopen', 'Plan what to do'))}`)}` });

SCR.answers = c => ({ rail: 'find', title: 'Ask', main: c.ai ? `
  ${h1('Ask', 'In plain words. The assistant answers only from what your group holds, and says where it looked.')}
  ${field('mk-ask', 'Your question', 'How many pothole reports did the city close within seven days in FY2025?', { act: 'ruleanswer' })}
  ${acts(btn('ruleanswer', 'Ask', { tone: 'primary' }), btn('search', 'Search instead'))}
  ${machine('Mai', '<p>In the work orders Dev captured (FY2025, 903 reports), 812 were closed within 7 calendar days. That counts "closed" as the city records it; Administrative Instruction 4.12 passage 5 says a report is closed when the crew reports the work complete. I looked in 14 documents; I found no inspection records.</p><p class="mk-note">Legal information, not legal advice.</p>')}
  ${acts(btn('standingquestionset', 'Keep asking this'), btn('standingquestionend', 'Stop asking'))}` : `
  ${h1('Find and count', 'Search what your group holds and count what matches.')}
  <div class="mk-search" data-act="search"><input class="cs-input" id="mk-q2" value="work orders closed within 7 days FY2025"><span>${btn('search', 'Search', { tone: 'primary', icon: 'search' })}</span></div>
  ${sheet(row(I('capture'), '<b class="rec">Public Works work orders, FY2025</b><span class="meta">903 rows · 812 with closed − reported ≤ 7 days (a count, method shown)</span>', ''))}
  ${acts(btn('ruleanswer', 'Show how this was counted'), btn('standingquestionset', 'Keep asking this'), btn('standingquestionend', 'Stop asking'))}
  ${note('New matches will arrive in your queue as a list for you to read.')}` });

SCR.assistant = c => ({ rail: 'projects', title: 'The assistant', crumbs: ['Pothole repairs', 'Question'], dock: 'assistant', main: SCR.question(c).main });

/* ---------------- the record's subjects ---------------- */
SCR.person = c => ({ rail: 'people', title: 'Person', crumbs: ['People', 'L. Chen'], main: `
  ${h1('L. Chen', 'Director of Public Works since March 2022 · named in 14 documents')}
  ${btn('person', 'Open the person')}
  ${sec('Positions', sheet(row(I('group'), 'Director of Public Works · March 2022–', '<span class="muted">city roster · ' + grade('capture', 'B') + '</span>') + row(I('group'), 'Deputy Director, Transportation · 2018–2022', '<span class="muted">council minutes · ' + grade('capture', 'B') + '</span>')))}
  ${sec('Career, credentials, memberships, interests', sheet(row(I('case'), 'Licensed civil engineer (California)', '<span class="muted">state licence register · ' + grade('capture', 'B') + '</span>') + row(I('money'), 'Form 700 (2025): no reportable interests', '<span class="muted">' + grade('capture', 'B') + '</span>')) + acts(btn('recordpersonfact', 'Add a fact from a document'), btn('followregister', 'Follow the licence register')))}
  ${sec('Same person?', `${sheet(row(grade('subject', 'B'), '“Lin Chen”, Deputy Director, in the 2019 minutes', '<span class="muted">claimed the same person, grade B, because both hold the Deputy Director post on the cited dates</span>'))}${acts(btn('claimidentity', 'Claim the same person'), btn('withdrawidentityclaim', 'Withdraw a claim'))}`)}
  ${sec('Correction', `<div class="cs-dialog" style="max-width:none;box-shadow:none"><b>Remove "Home address, 2019 voter file" from L. Chen's page</b><div class="ends">This removes the recorded value for good. It cannot be undone, by you or anyone: the value is gone from this page, from every question that cited it, and from every export. A marker stays where it was: "Removed where the law requires, 6 October 2026, by Dev". Published cases are not changed; a court order for those is complied with on the docket.</div>${field('mk-xr', 'The law or order that requires it', 'Superior Court order of 2 October 2026 (captured), paragraph 3', { rec: true, reason: true, act: 'personexpunge' })}${acts(btn('personexpunge', 'Remove it for good, with this reason', { tone: 'primary' }), link('Cancel'))}<p class="mk-small muted" style="margin:0">On a phone this can be read but not done: like signing and publishing, it finishes on a larger screen, where the whole consequence is in view.</p></div>`)}` });

SCR.timeline = c => ({ rail: 'projects', title: 'Timeline', crumbs: ['The Coliseum lease', 'Timeline'], main: `
  <div class="mk-titlerow">${h1('Timeline', 'The Coliseum lease')}${wizmark(1, 'Build a timeline')}</div>
  <div class="mk-lanes"><div class="mk-lanehead">What they did</div><div class="mk-lanehead">What we did</div>
   <div class="mk-ev"><span class="mk-date">12 Jan 2024</span><b>${ref('Council approves lease amendment 1', 'document', '<b>Council minutes, 12 January 2024</b>, item 7 · capture B · the vote: 5 for, 2 against<span class=why><b>Here:</b> the decision this event records, in the city&#39;s lane.</span><span class=more>Click to open the minutes at the passage cited.</span>')}</b><span>decided: Council · ${grade('capture', 'B')}</span></div><div></div>
   <div class="mk-ev"><span class="mk-date">March 2024 <i>(month known)</i></span><b>Rent adjusted without a vote</b><span>signed: City Administrator · ${grade('capture', 'B')}</span></div><div></div>
   <div></div><div class="mk-ev us"><span class="mk-date">4 Sep 2026</span><b>We requested the rent schedules</b><span>${due('met', 'Answered 18 Sep')}</span></div>
   <div class="mk-ev"><span class="mk-date">18 Sep 2026</span><b>City Clerk releases schedules</b><span>answered our request</span></div><div></div></div>
  ${gapm('undetermined', '<b>Undetermined</b> order: the March adjustment and the April notice, because both are dated only by month.')}
  ${sec('Undated', sheet(row(I('timeline'), 'Memo on rent indexing, undated', '<span class="muted">listed apart, never guessed into place</span>')))}
  ${acts(btn('createevent', 'Record an event', { tone: 'primary' }), btn('addparticipant', 'Add who took part'), btn('relate', 'Link events'), btn('recorddatedfact', 'Record a dated fact'), btn('hypothesishold', 'Keep a suspected cause as a hunch'))}` });

SCR.money = c => ({ rail: 'projects', title: 'Money trail', crumbs: ['Sewer fund transfers', 'Money trail'], main: `
  ${h1('Sewer fund transfers, FY2022', 'A money trail · 3 figures · started by Ana')}
  <div class="tw"><table class="mk-table"><thead><tr><th>Figure</th><th>Stage</th><th>Period</th><th>Amount</th><th>Source</th><th></th></tr></thead><tbody>
   <tr><td>Transfer out, Sewer Fund 3100</td><td>adopted</td><td>FY2022</td><td class="num">$4,200,000</td><td>${grade('capture', 'B')}</td><td>included · "the transfer we ask about"</td></tr>
   <tr><td>Transfer out, Sewer Fund 3100</td><td>actual (paid)</td><td>FY2022</td><td class="num">$4,750,000</td><td>${grade('capture', 'B')}</td><td>included</td></tr>
   <tr><td>Overhead charge</td><td>actual</td><td>FY2022</td><td class="num">$310,000</td><td>${grade('capture', 'B')}</td><td class="muted">left out · "a different transfer"</td></tr></tbody></table></div>
  ${note('Adopted against paid: <b>$550,000 more paid than adopted</b>. The two sources differ in basis: the budget is by fund, the financial report by department.')}
  ${acts(btn('recordfact', 'Read a figure', { tone: 'primary' }), btn('createset', 'Start a money trail'), btn('include', 'Include, with a reason'), btn('exclude', 'Leave out, with a reason'), btn('reconcile', 'Compare two sources'), btn('committedagainstpaid', 'Committed against paid'), btn('authoritychain', 'What authorised it'))}` });

SCR.calculation = c => ({ rail: 'projects', title: 'Calculation', crumbs: ['Pothole repairs', 'Calculation'], main: `
  ${h1('<span class="rec">Reports closed within seven days, FY2025</span>', 'A computed fact · method shown · recomputed when an input changes')}
  <div class="mk-bignum"><b>812 of 903</b><span>89.9% · reports closed within 7 calendar days of being reported</span></div>
  ${sec('Method', `<p class="id" style="font-size:14px">count(rows where closed − reported ≤ 7 days) / count(rows)</p>${note('Inputs: Public Works work orders FY2025 (CSV), captured 2 October, ' + grade('capture', 'B') + '. Checked by Ana (CPA, confirmed) on 5 October.')}${acts(btn('calculationcreate', 'Work it out', { tone: 'primary' }), btn('tabledeclare', 'Declare the table'), btn('recordcheck', 'Record a second member\'s check'), btn('calculationaccept', 'Accept the result'))}`)}
  ${sec('Your own spreadsheet', acts(btn('addworkbook', 'Bind your spreadsheet'), btn('bind', 'Tie an input to the record')))}
  ${sec('Spot-check', `${note('A recorded random draw picks which closed reports members visit. Anyone can repeat it with the same seed.')}<div class="row"><span class="id">seed 2026-10-05-7f31</span><span>40 of 812 closed reports</span></div>${acts(btn('calculationdraw', 'Draw a random sample'))}`)}` });

SCR.explore = c => ({ rail: 'people', title: 'Explore connections', crumbs: ['People', 'J. Ortega', 'Explore connections'], main: `
  ${h1('Explore connections', 'From J. Ortega to the Coliseum lease, through money and votes, as of 2026')}
  ${checks('Follow', [['Positions and memberships', true], ['Money', true], ['Took part', true], ['Mentioned together', false], ['Same person?', false]])}
  ${acts(btn('explore', 'Explore', { tone: 'primary' }), btn('explorepreset', 'Use a preset'))}
  ${sec('Chains found: 2', sheet(
    row(grade('connection', 'B'), '<b>' + ref('J. Ortega', 'person', '<b>J. Ortega</b> · Council District 3 since 2023, from Legistar<span class=why><b>Here:</b> where this chain starts.</span>') + '</b> → voted for → <b>' + ref('Lease amendment 1', 'document', '<b>Lease amendment 1</b> · approved 12 January 2024 · Council minutes, item 7<span class=why><b>Here:</b> the vote that links him to the payments.</span>') + '</b> → paid under → <b>' + ref('$1.2M to Bayline Properties', 'money', '<b>$1.2M to Bayline Properties</b> · paid FY2024 · from the city&#39;s annual financial report, capture B<span class=why><b>Here:</b> where the money in this chain ends up.</span>') + '</b><span class="meta">weakest step B · each step cited</span>', btn('exploreverify', 'Check this chain')) +
    row(grade('connection', 'D'), '<b>J. Ortega</b> → <i>declared, not evidenced</i> → <b>Bayline Properties</b><span class="meta">a lead, not a finding</span>', btn('connectionassert', 'Attach a source to this step'))))}
  ${gapm('undetermined', '<b>Stopped at the limit</b>, undetermined beyond four steps.')}
  ${acts(btn('promote', 'Open a question from this chain'))}` });

SCR.proceeding = c => ({ rail: 'projects', title: 'Proceeding', crumbs: ['The Coliseum lease', 'Proceeding'], main: `
  ${h1('Lakeshore Tenants Assn. v. City · RG26-114502', 'Superior Court · a neutral label: "the lease rent case"')}
  ${acts(btn('registerproceeding', 'Register the proceeding'))}
  ${sec('Parties', sheet(row(I('group'), 'Petitioner · Lakeshore Tenants Association', '') + row(I('group'), 'Respondent · City of Oakland', '') + row(I('subject'), 'Judge · Hon. M. Ferris', '')) + acts(btn('recordline', 'Add a party by role')))}
  ${sec('The register', `${sheet(row(I('changed'), '<b>New</b> · 1 October: Order on demurrer', '') + row(I('case'), '14 September: Opposition filed', ''))}${note('The court\'s register needs a login, so new filings come only by a member\'s own capture.')}${acts(btn('followregister', 'Follow its register'))}`)}
  ${sec('Orders, held as obligations', `${sheet(row(kindm('todo'), 'The City shall produce the 2024 rent schedules', due('', 'Reply due 30 October')))}${acts(btn('declare', 'Hold an order as obligations'), btn('courtlink', 'Link a decision to what it interprets'))}${note('Procedural facts (which form, which court, which deadline) are facts, never advice on what to file.')}`)}` });

SCR['due-date'] = c => ({ rail: 'queue', title: 'Due date', crumbs: ['Records request', 'Due date'], main: `
  ${h1('Due 14 October 2026', 'The City Clerk\'s reply to your records request')}
  ${sec('How this was worked out', `<ol class="mk-list"><li>Basis: the public records law your group's profile names, the 10-day response window. <span class="muted">(cited)</span></li><li>Received by the office: 2 October 2026 (you recorded sending it that day).</li><li>Counted 10 calendar days: to 12 October.</li><li>12 October is a city holiday (Indigenous Peoples' Day) and 13 October a city furlough day, both from your profile: rolled to 14 October, close of business.</li></ol>${acts(btn('deadlinecompute', 'Work it out again'))}`)}
  ${acts(btn('clockadopt', 'Confirm this due date', { tone: 'primary' }), btn('reminderset', 'Remind me'), link('Download to my calendar', 'clock'))}
  ${note('Once confirmed it goes into your queue. If no reply comes by then, the queue says so once.')}` });

SCR.standard = c => ({ rail: 'projects', title: 'Standard', crumbs: ['Pothole repairs', 'Standards'], main: `
  ${h1('<span class="rec">Repair reported potholes within seven calendar days</span>', 'Administrative Instruction 4.12, §3 · in force since 2023 · policy, Public Works')}
  <blockquote class="mk-passage rec">"The Director shall repair each reported pothole within seven calendar days of the report, weather permitting."</blockquote>
  ${acts(btn('standarddeclare', 'Hold this as a standard', { tone: 'primary' }), btn('standardadopt', 'Adopt a proposed standard'), btn('lawrelate', 'Relate to a law'))}
  ${c.ai ? machine('Dev', '<p>Proposed standard: the 2026 budget\'s performance target, "90% of potholes filled within 72 hours". Not a standard until a member adopts it.</p>') : ''}` });

/* ---------------- deciding and acting (the bound sketches) ---------------- */
SCR.plan = c => ({ rail: 'projects', title: 'Action plan', crumbs: ['Pothole repairs', 'Plans'], main: `
  ${h1('Repairs: closed is not repaired', 'open · opened 3 October by Dev, when the inquiry began')}
  <div class="mk-checks2">${I('status')} <b>Checks · 1</b> Scenario A: no branch answers a hostile response (refusal, obstruction, retaliation) to the records request.</div>
  ${sec('Subjects', sheet(row('<b>1</b>', `Pothole reports marked closed before repair, against Administrative Instruction 4.12 §3<span class="meta"><span class="muted">hypothetical: not yet shown</span> · from the inquiry "Is the city repairing…?" (suspected, 3 Oct)</span>`, '')) + acts(btn('plansubjectadd', 'Add a subject')))}
  ${sec('Options', `<div class="row mk-sortrow"><span class="muted">Sort by</span> <b>category</b> · regulated end date · subject · disposition</div>${sheet(
    row('<input type="checkbox" checked aria-label="pick">', '<b>Records request: inspection logs</b> · request · <span class="muted">chosen 4 Oct · "first, to see what closed means"</span>', '') +
    row('<input type="checkbox" aria-label="pick">', '<b>Story with a reporter</b> · awareness · <span class="muted">undecided</span>', '') +
    row('<input type="checkbox" aria-label="pick">', '<b>Complaint to the city auditor</b> · complaint · <span class="muted">declined · "too early, without the logs"</span>', ''))}
   ${acts(btn('optionadd', 'Add an option'), btn('optiondispose', 'Choose'), btn('optiondispose', 'Decline'), btn('optionstartpreview', 'Start…', { tone: 'primary' }))}
   ${c.ai ? `<div class="mk-tray">${origin('machine', 'Suggested by the assistant · for a fixing project · not yet in the plan')}${sheet(row(I('machine'), 'Ask the council\'s public works committee to agendize repair performance', btn('optionadopt', 'Adopt')))}${acts(btn('optionpropose', 'Suggest more'))}</div>` : ''}`)}
  ${sec('Scenarios', `<div class="mk-tabs2"><span aria-selected="true">A · Records first</span><span>B · Go public</span><span class="muted">+ scenario</span></div>${sheet(row('<b>Phase 1</b>', 'Records request → checkpoint: "logs show inspection dates" (judged by a member)', btn('checkpointrecord', 'Judge')))}${acts(btn('scenarioset', 'Lay out a scenario'))}`)}
  ${sec('Started', sheet(row(I('outward'), 'Records request: inspection logs · to the Office of the City Clerk', due('', 'Response due 14 Oct'))))}
  ${acts(btn('planclose', 'Close plan…'))}` });

SCR['start-send'] = c => ({ rail: 'projects', title: 'Start and send', crumbs: ['Pothole repairs', 'Plans', 'Start'], main: `
  ${h1('Start "Records request: inspection logs"', 'Nothing runs until you confirm. This is what the action will say and rest on.')}
  ${sec('Step 1 · Start', `<dl class="mk-dl"><dt>Kind</dt><dd>records request</dd><dt>Addressed to</dt><dd>${card('Office of the City Clerk', '<b>Office of the City Clerk</b> · City of Oakland · keeps the city&#39;s records and answers records requests · held today by Asha Rao (since March 2021) · 4 requests from your group, 3 answered on time')} (an office) · held today by ${card('Asha Rao', '<b>Asha Rao</b> · City Clerk since March 2021, from the city&#39;s roster. Cited in 3 documents your group holds.')}</dd><dt>Rests on</dt><dd>Subject 1: reports closed before repair · <span class="muted">hypothetical: not yet shown</span></dd><dt>Clock</dt><dd>10 days, from the law your profile names</dd><dt>Asserts a breach</dt><dd>no</dd></dl>
   ${acts(btn('optionstartpreview', 'See what starting does'), btn('optionstart', 'Start the action', { tone: 'primary' }))}`)}
  ${sec('Step 2 · Prepare and send', `${field('mk-ss', 'What the group sends', 'To the Office of the City Clerk:\nWe request copies of the inspection logs for every pothole report closed between 1 July 2025 and 30 June 2026, showing the date of each inspection and of each repair.\nSubmitted by Lakeshore Tenants, by its contact.', { area: true, rec: true, draft: c.ai && !c.wizard ? 'machine' : 'template', act: 'communicationprepare' })}
   ${acts(btn('communicationprepare', 'Prepare what is sent'), btn('filingprepare', 'Prepare the filing'), btn('filingapprove', 'Approve this text'), btn('filingrecordsent', 'I have sent it · record the sending', { tone: 'primary' }))}
   ${note('Approving fixes the text. Civicsmith sends nothing: you send it by the office\'s own means (its web form, mail, or in person), then record it here.')}`)}` });

SCR.request = c => ({ rail: 'projects', title: 'Request records', crumbs: ['Pothole repairs', 'Request records'], main: `
  <div class="mk-titlerow">${h1('Request records', 'Look first: if the record is public, capture it instead.')}${wizmark(1, 'Get a record')}</div>
  ${choice('mk-off', 'The office that holds the records', ['City Clerk · held today by Asha Rao', 'Director of Public Works · held today by L. Chen'], 'City Clerk · held today by Asha Rao', { act: 'addresseesuggest', help: 'Addressed to the office by its role, so it reaches whoever holds the post that day.' })}
  ${acts(btn('addresseesuggest', 'Choose the office'))}
  ${field('mk-what', 'What records you want, in plain words', 'Inspection logs for pothole reports closed in FY2025', { act: 'actioncreate' })}
  ${acts(btn('actioncreate', 'Start the request'))}
  ${choice('mk-law', 'The law it goes under', ['Public records act · 10 days', 'Immediate Disclosure Request · 3 working days (your city\'s ordinance)'], 'Public records act · 10 days', { act: 'actionlaws' })}
  ${acts(btn('actionlaws', 'Choose this law'))}
  ${field('mk-txt', 'The request', 'Under the public records act named in your group\'s profile, we request copies of the inspection logs for every pothole report closed between 1 July 2025 and 30 June 2026, showing the date of each inspection and of each repair.', { area: true, rec: true, draft: c.ai && !c.wizard ? 'machine' : 'template', act: 'communicationprepare' })}
  ${acts(btn('communicationprepare', 'Prepare the text'), btn('filingapprove', 'Approve this text'))}
  <div class="cs-dialog" style="max-width:none;box-shadow:none"><span class="cs-tag-outward">${I('outward')}Outward · seen outside your group</span><div class="ends">Sending this tells the City Clerk's office, and anyone it shares the request with, what your group is looking at.</div>${acts(btn('filingrecordsent', 'I have sent it · record the sending', { tone: 'primary' }))}</div>` });

SCR.action = c => ({ rail: 'projects', title: 'Action', crumbs: ['Pothole repairs', 'Actions', 'Records request'], main: `
  ${h1('Records request: inspection logs', 'to the Office of the City Clerk · sent 2 October by Mai')}
  <div class="row">${due('near', 'Response due 14 October')}<span class="cs-wait">${I('clock')}Waiting on the City Clerk's reply</span></div>
  ${sec('Replies', sheet(row(I('case'), '<b>3 October</b> · acknowledgment, reference R26-0412', '')) + acts(btn('actioncorrespond', 'Record a reply', { tone: 'primary' }), btn('actionpressure', 'Mark a reply as pressure')))}
  ${acts(btn('actionmove', 'Move the action'), btn('reminderset', 'Remind me'), btn('actionhold', 'Record a litigation hold'))}` });

SCR.matter = c => ({ rail: 'projects', title: 'Matter', crumbs: ['The Coliseum lease', 'Matter'], main: `
  ${h1('<span class="rec">The 2024 rent adjustment, made without a council vote</span>', 'noncompliant · established · against lease §7.2')}
  ${ladder('stage', ['1 Documentation', '2 Notification', '3 Clock starts', '4 Public', '5 Formal', '6 Political', '7 Legal'], 2)}
  ${sec('Consequences', sheet(row(I('money'), '$38,000 in rent above the schedule, 2024–2026', '<span class="muted">from the rent schedules · ' + grade('capture', 'B') + '</span>')))}
  ${acts(btn('escalationadvance', 'Advance to stage 3'), btn('declinetoescalate', 'Decline to escalate, with a reason'), btn('escalationopen', 'Open an escalation'), btn('escalationend', 'End'))}` });

/* ---------------- publishing ---------------- */
SCR['case-editor'] = c => ({ rail: 'projects', title: 'Case', crumbs: ['The Coliseum lease', 'Case · Edition 2'], main: `
  ${h1('The Coliseum lease · Edition 2', 'Draft · prepared by Dev')}${pathm(0)}
  ${ladder('ready', ['Draft', 'Internally checked · not yet evaluated', 'Externally compliant · not yet evaluated', 'Distributed'], 1, [1, 2])}
  ${field('mk-scope', 'Scope', 'Rent adjustments under the Coliseum lease, January 2024 to September 2026.', { rec: true })}
  ${sec('What it leaves out', `<p class="rec">Whether the rents are fair; the 2019 negotiation.</p>${acts(btn('statementack', 'Acknowledge what it leaves out'))}`)}
  ${sec('People it names', sheet(row(I('subject'), 'City Administrator (by title) · <span class="rec">signed the March 2024 adjustment</span>', btn('attribute', 'Name with the reason')) + row(I('subject'), 'J. Ortega, Council member · <span class="muted">reason missing</span>', btn('attribute', 'Add the reason'))))}
  ${sec('What changed since Edition 1', `${field('mk-wc', 'What changed', 'Adds the 2025 rent schedules released on 18 September and the finding that two adjustments had no vote.', { area: true, rec: true, draft: c.ai ? 'machine' : '' })}${acts(c.ai ? btn('whatchangedpropose', 'Draft "what changed"') : '', btn('casedraft', 'Prepare the draft', { tone: 'primary' }))}`)}` });

SCR['review-copy'] = c => ({ rail: 'projects', title: 'Review copy', crumbs: ['The Coliseum lease', 'Review copy'], band: 'review', main: `
  ${h1('Share Edition 2 for review', 'A named reader gets a view that you can stop at any time.')}${pathm(1)}
  ${sheet(row(I('subject'), '<b>Prof. N. Iyer</b> · housing law · can read until 20 October', btn('reviewrevoke', 'Stop sharing')) + row(I('subject'), '<b>Teo</b>\'s editor · Bay Courier · embargoed advance copy', btn('reviewrevoke', 'Stop sharing')))}
  ${acts(btn('reviewgrant', 'Share with a named reader', { tone: 'primary' }))}
  ${sec('Comments', sheet(row(I('testimony'), '<span class="rec">"Finding 2 should say which schedule the council approved."</span><span class="meta">Prof. Iyer · 7 October</span>', btn('reviewcomment', 'Reply'))))}` });

SCR.ceremony = c => ({ rail: 'projects', title: 'Publish', crumbs: ['The Coliseum lease', 'Publish Edition 2'], main: `
  ${h1('Publish Edition 2', 'Publishing makes this edition permanent and public. It can be corrected by a new edition, never removed.')}
  <ol class="mk-steps"><li class="done">What</li><li class="done">Strength</li><li class="done">Leaves out</li><li class="done">People</li><li aria-current="step">Disclosures</li><li>Bias</li><li>Preview</li><li>Ties</li><li>Sign</li></ol>
  ${sec('Before publishing', sheet(row(I('finding'), 'Finding 1 · meets the bar', strength('B', 'B', '<b>Meets the bar</b> · B/B')) + row(I('finding'), 'Finding 2 · meets the bar', strength('B', 'B', '<b>Meets the bar</b>'))) + acts(btn('publishpreflight', 'Check again')))}
  ${sec('Disclosed with the case', sheet(row(I('tension'), 'An unresolved contradiction: two documents date the rent notice differently', '<span class="muted">disclosed, not blocking</span>') + row(I('timeline'), 'The timeline, frozen at signing (9 events)', '')) + acts(btn('publishtensions', 'See everything that will be disclosed')))}
  ${sec('Your ties', `${checks('', [['I have no undeclared tie to anyone this case concerns, including anyone paid in its money', true]])}`)}
  <div class="cs-dialog" style="max-width:none;box-shadow:none"><b>Sign Edition 2</b><div class="ends">You sign with the key registered in this browser, as Dev, owner of the project. The edition and its timeline are fixed when you sign.</div>${acts(btn('caseratify', 'Sign with your key', { icon: 'signed' }))}
   ${checks('When it becomes public', [['Now', false], ['At a set time: Thursday 19 November 2026, 6:00 (Oakland time)', true]], { radio: true, act: 'owed:publishat DEC-147' })}
   <p class="mk-note">Until then the signed edition waits, not public. At 6:00 Civicsmith checks again; if anything changed since you signed (a source, a member's confirmation of their ties, a hold), it does not publish and tells you once. You can cancel or move the time until then.</p>
   ${acts(btn('owed:publishat DEC-147', 'Publish Edition 2 at 6:00 on 19 November', { tone: 'primary' }), btn('publish', 'Publish now'))}</div>
  ${sec('After you choose a time', `<div class="cs-sheet">${row(I('clock'), '<b>Signed · publishes Thursday 19 November, 6:00</b>', '<span class="muted">not public yet</span>')}</div>${note('The case page and your queue show this until it goes public; then the queue tells you once that it is live. The public page shows when it was signed and when it was published.')}`)}` });

SCR.published = c => ({ frame: 'published', title: 'The Coliseum lease · Edition 2', main: `
  <div class="mk-pubtitle"><h1 class="rec">The Coliseum lease</h1><p>Edition 2 · published 14 November 2026 · <a href="#" onclick="return false">Edition 1</a></p></div>
  <p class="mk-explain">This case is the work of Lakeshore Tenants. Each finding shows two strengths: how well its documents are held, and how firmly they are linked. <a href="#" onclick="return false">How to read a case</a></p>
  <article class="mk-finding"><span class="eyebrow">Finding 1</span><p class="rec mk-fbody">We found that the 2024 rent adjustments were made without the council vote the lease requires.</p><p>Relied on · meets this project's bar (capture B, connection B) · <a href="#" onclick="return false">the evidence</a></p></article>
  <article class="mk-finding"><span class="eyebrow">Timeline</span><div class="mk-lanes small"><div class="mk-lanehead">What they did</div><div class="mk-lanehead">What we did</div><div class="mk-ev"><span class="mk-date">12 Jan 2024</span>Council approves amendment 1</div><div></div><div class="mk-ev"><span class="mk-date">March 2024</span>Rent adjusted, signed by the City Administrator</div><div></div><div></div><div class="mk-ev us"><span class="mk-date">4 Sep 2026</span>We requested the schedules</div></div></article>
  <article class="mk-finding"><span class="eyebrow">People named</span><p>The City Administrator, by title: signed the March 2024 adjustment (finding 1).</p></article>
  ${acts(btn('verify', 'Check the signature'), btn('publishedcase', 'Download the complete edition'))}` });

SCR.imported = c => ({ rail: 'projects', title: 'Another group\'s case', band: 'imported', crumbs: ['Imported', 'West Oakland Neighbors · Port lease revenue'], main: `
  ${h1('Port lease revenue', 'West Oakland Neighbors · Edition 2 · imported by Dev, 1 October')}
  ${sheet(row(I('finding'), '<span class="rec">Port lease revenue fell short of the adopted budget in three years</span>', `<span class="cs-recreate" data-r="yes">${I('accepted')}Recreated</span>`) +
    row(I('finding'), '<span class="rec">The shortfall was not reported to council</span>', `<span class="cs-recreate" data-r="part">${I('elsewhere')}Recreated in part</span>`) +
    row(I('finding'), '<span class="rec">The 2025 calculation of arrears</span>', `<span class="cs-recreate" data-r="no">${I('refused')}Did not recreate</span>`))}
  ${acts(btn('caseimport', 'Import a case'), btn('importaccept', 'Accept what recreated, with a reason', { tone: 'primary' }), btn('importflag', 'Flag an issue'), btn('importwatch', 'Watch the publisher\'s docket'))}` });

SCR.docket = c => ({ rail: 'projects', title: 'Docket', crumbs: ['The Coliseum lease', 'Docket'], main: `
  ${h1('Docket', 'The case\'s public record of corrections, withdrawals and orders.')}
  ${sheet(row(I('signed'), '<b>14 November 2026</b> · Edition 2 published, superseding Edition 1', '') + row(I('case'), '<b>Draft</b> · Order of 20 November, Superior Court: seal exhibit 4 (a tenant\'s address)', '<span class="muted">captured · not yet posted</span>'))}
  ${acts(btn('docketfile', 'File a docket entry'), btn('docketpost', 'Post it, signed', { tone: 'primary' }))}
  ${note('An order is complied with openly: the next edition is stamped with what was sealed and why.')}` });

/* ---------------- outside the group ---------------- */
SCR.inbox = c => ({ rail: 'queue', title: 'Inbox', crumbs: ['Inbox'], main: `
  ${h1('Inbox', 'Material handed in through your doorbell.')}
  ${sheet(row(I('capture'), '<b>3 PDFs</b> · "These are the inspection sheets they don\'t publish." <span class="meta"><span class="id">KNOCK-2026-10-03-9c1f</span> · same knocker as 12 September</span>', ''))}
  ${ladder('ident', ['Unknown', 'Same knocker', 'Partly known', 'Known to the group', 'Public'], 2)}
  ${acts(btn('inboxpull', 'Move into the record', { tone: 'primary' }), btn('inboxresolve', 'Discard, with a reason'), btn('sourcelink', 'Record what is known of the source'))}` });

SCR.doorbell = c => ({ frame: 'public', title: 'Hand material to Lakeshore Tenants', main: `
  <div class="mk-setuphead"><span class="grp mk-grp">Lakeshore Tenants</span></div>
  ${h1('Hand material to Lakeshore Tenants', 'You don\'t need an account. Here is exactly what happens to what you send.')}
  <ul class="mk-list"><li>Your files go only to this group's own Civicsmith.</li><li>A member reads them and decides whether to use them.</li><li>You can add a secret phrase, so later material can be recognised as yours without anyone knowing who you are.</li><li>Nothing here is beyond a court's reach. <a href="#" onclick="return false">What that means</a></li></ul>
  <div class="mk-drop">${I('add')} Choose files</div>
  ${field('mk-kn', 'A note (optional)', 'These are the inspection sheets they don\'t publish.', { area: true })}
  ${field('mk-ks', 'A secret phrase (optional)', '')}
  ${acts(btn('knock', 'Hand it over', { tone: 'primary' }))}` });
