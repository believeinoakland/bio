/* Civicsmith mockups: the 42 screens of the registry (registry.src.py), each a function of the context
   c = {ai: the member has connected their own Claude account, v: a variant name}. Sample data is invented:
   the group Lakeshore Tenants, its members Rosa (founder), Dev, Mai (new), Ana (an accountant) and Teo (a reporter). */
'use strict';
const G = { name: 'Lakeshore Tenants', slug: 'lakeshore-tenants', me: 'Mai' };
const SCR = {};

/* ---------------- the group's copy: installing, setting up, joining ---------------- */
SCR.install = c => ({ frame: 'setup', title: 'Install Civicsmith', main: `
  <div class="mk-setuphead"><svg viewBox="20 2 60 90" aria-hidden="true"><use href="#i-mark"/></svg><span class="mk-wordmark">Civicsmith</span></div>
  ${h1('Install your group\'s copy', 'Free software for civic groups. Your group\'s copy runs in your own Cloudflare account; nobody else holds your work.')}
  ${sec('Before you start', `<ul class="mk-list"><li>A Cloudflare account. The free plan works.</li><li>About twenty minutes.</li><li>Workers Paid ($5 a month, with a payment method) adds recomputing members' spreadsheets and signing in with a Claude subscription. You can add it later.</li><li>No Claude account is needed to set up.</li></ul>`)}
  ${sec('Your group\'s short name', `${field('mk-slug', 'Short name', 'lakeshore-tenants', { help: 'Lower-case letters, digits and hyphens. It appears in your addresses and beside every signature, and can never change. A group that wants to stay unnamed picks one that reveals nothing.' })}
   ${acts(btn('bootstrap', 'Install with this short name', { tone: 'primary' }))}`)}
  ${sec('Testing itself', `<div class="cs-sheet">${row(I('accepted'), 'Signed release verified', '<span class="muted">0.9 s</span>')}${row(I('accepted'), 'Record store ready', '<span class="muted">1.2 s</span>')}${row(I('clock'), 'The assistant\'s container: allow it to run?', '')}</div>${acts(btn('selftest', 'Run the test again'))}`)}` });

SCR.setup = c => ({ frame: 'setup', title: 'Set up', main: `
  <div class="mk-setuphead"><svg viewBox="20 2 60 90" aria-hidden="true"><use href="#i-mark"/></svg><span class="mk-wordmark">Civicsmith</span><span class="muted">lakeshore-tenants</span></div>
  ${h1('Set up your group\'s copy', 'Seven short parts. You can leave and come back; nothing is lost.')}
  <ol class="mk-steps"><li class="done">Claim</li><li class="done">Name</li><li aria-current="step">Places</li><li>Offices</li><li>People</li><li>The assistant</li><li>Administrators</li></ol>
  ${sec('Claim your copy', `${field('mk-otp', 'One-time password', '••••••••••••', { help: 'From the installer. It works once.' })}${acts(btn('claim', 'Claim this copy', { tone: 'primary' }))}`)}
  ${sec('Your group', `${field('mk-gname', 'Group name', 'Lakeshore Tenants')}<div class="mk-logo">${I('add')} Add your logo (optional)</div>${acts(btn('groupnameset', 'Save the name'))}
   ${field('mk-gdom', 'Web address', 'lakeshoretenants.org', { help: 'Verifying it lets readers confirm a published case really comes from you.' })}${acts(btn('groupdomainset', 'Verify the address'))}`)}
  ${sec('Places and languages', `${choice('mk-place', 'The places whose rules apply', ['Oakland, California (City, County, State)'], 'Oakland, California (City, County, State)')}${checks('Languages your members use', [['English', true], ['Español', true], ['Tiếng Việt', false]])}${acts(btn('profilesset', 'Save places and languages'))}`)}
  ${sec('Offices and seats, filled in for you', `<div class="cs-sheet">${row(I('group'), 'City Clerk · <span class="muted">held by Asha Rao</span>', '<span class="cs-origin" data-origin="machine">' + I('machine') + 'From the city\'s roster</span>')}${row(I('group'), 'Director of Public Works · <span class="muted">held by L. Chen</span>', '<span class="cs-origin" data-origin="machine">' + I('machine') + 'From the city\'s roster</span>')}${row(I('group'), 'Council District 3 · <span class="muted">held by J. Ortega since 2023</span>', '<span class="cs-origin" data-origin="machine">' + I('machine') + 'From Legistar</span>')}</div>${acts(btn('officesseed', 'Confirm these offices'))}`)}
  ${sec('Who sees what about people', note('Facts that come from public documents follow those documents. A project\'s own notes about a person stay inside that project. ' + '<a href="#" onclick="return false">More about this</a>'))}
  ${sec('The assistant', `<p>Each member who wants the assistant connects their own Claude account. Nothing is shared, and everything works without it.</p>${checks('Offer the assistant to members', [['Yes, members may connect their own account', true], ['No', false]], { radio: true })}${field('mk-ceil', 'Daily limit for this copy (optional)', '$5.00 per member')}${acts(btn('assistantset', 'Save'), btn('aicopyceilingset', 'Set the copy\'s limit'))}`)}
  ${sec('Administrators', `${field('mk-host', 'Who holds the hosting account', 'Rosa Medina (the Cloudflare account owner)')}${acts(btn('hostingaccess', 'Record it'))}<p class="mk-note">With one administrator, the group depends on one person. A second means it is never stuck. You can add one now or later.</p>${acts(btn('memberadd', 'Invite a member or a second administrator', { tone: 'primary' }))}`)}` });

SCR['group-identity'] = c => ({ rail: 'settings', title: 'Who your group is', crumbs: ['Settings', 'Who your group is'], main: `
  ${h1('Who your group is', 'Optional. It shapes how members are welcomed and locks nothing.')}
  ${checks('What kind of group are you?', [['Professional', false], ['Issue-specific', false], ['Neighbourhood or community', true], ['Catch-all', false], ['Something else…', false]], { act: 'owed:groupprofileset DEC-132' })}
  ${field('mk-focus', 'What you focus on', 'Rents and leases on city-owned land; the Coliseum lease; repairs on our streets', { act: 'owed:groupprofileset DEC-132', rec: true })}
  ${field('mk-why', 'Why the group exists, in your own words', 'Tenants near the Coliseum started meeting in 2025 when rents on city land rose twice in a year. We want to know whether the city is keeping its own lease terms.', { area: true, rec: true })}
  ${checks('Who sees this', [['Members only', true], ['Also our public page and the network directory', false]], { radio: true, act: 'owed:groupprofilevisibility DEC-132' })}
  ${acts(btn('owed:groupprofileset DEC-132', 'Save who your group is', { tone: 'primary' }), btn('owed:groupprofilevisibility DEC-132', 'Change who sees it'))}` });

SCR.join = c => ({ frame: 'setup', title: 'Your invitation', main: `
  <div class="mk-setuphead"><span class="grp mk-grp">Lakeshore Tenants</span></div>
  ${h1('You\'re invited to Lakeshore Tenants', 'Rosa invited you to contribute. This link works once and expires on 13 October 2026.')}
  ${choice('mk-lang', 'Your language', ['English', 'Español', 'Tiếng Việt'], 'English', { act: 'owed:memberlanguageset DEC-127', help: 'Chosen from your device\'s setting. You can change it any time.' })}
  ${field('mk-handle', 'Your handle', 'mai.k', { help: 'The record shows your handle on your work. It needn\'t be your legal name. <a href="#" onclick="return false">Choosing a handle</a>: a name people know lends your work credibility and lets reporters reach you, but puts it on public cases; a pen name shields you from pressure, while the administrators still know who you are.' })}
  ${field('mk-pw', 'Password', '••••••••••••••', { help: 'At least 12 characters.' })}
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

SCR.members = c => ({ rail: 'members', title: 'Members', crumbs: ['Settings', 'Members'], main: `
  ${h1('Members', '6 members · 1 administrator')}
  ${note('With one administrator, the group depends on Rosa and the hosting account. <a href="#" onclick="return false">Add a second administrator</a>.')}
  ${sheet(row(I('subject'), '<b>Rosa</b> · administrator · <span class="muted">cover: R. Medina</span>', '<span class="muted">contribute, administer</span>') +
    row(I('subject'), '<b>Dev</b> · member', '<span class="muted">contribute</span>') +
    row(I('subject'), '<b>Ana</b> · member · declared: CPA', `<span>${btn('expertiseconfirm', 'Confirm expertise')}</span>`) +
    row(I('subject'), '<b>Teo</b> · member · declared: reporter', '<span class="muted">contribute</span>') +
    row(I('clock'), '<i>Invited</i> · cover: Mai K.', '<span class="muted">expires 13 October</span>'))}
  ${sec('Invite a member', `${field('mk-ih', 'Their handle (they can change it)', 'mai.k')}${field('mk-ic', 'The cover the group knows them by, not a legal name', 'Mai K., from the Seminary Ave block')}${checks('What they may do', [['Contribute', true], ['Administer', false]], { act: 'membercaps' })}${acts(btn('memberadd', 'Create the invitation link', { tone: 'primary' }), btn('membercaps', 'Change what a member may do'))}${note('Civicsmith sends no email. Copy the link and send it yourself. It works once and expires after seven days.')}`)}
  ${sec('Joining through your website', `${note('Let your website invite people: an open form, or an application someone approves. Anyone let through can see the group\'s shared work.')}${acts(btn('owed:websitekeymint DEC-133', 'Create a website key'), btn('owed:joinlinkset DEC-133', 'Turn on the reusable join link'))}`)}
  ${sec('Administrators', acts(btn('memberset', 'Change a member\'s status'), btn('adminendorse', 'Endorse an administrator'), btn('adminremove', 'Remove an administrator')))}` });

SCR.account = c => ({ rail: 'settings', title: 'Your account', crumbs: ['Settings', 'Your account'], main: `
  ${h1('Your account', 'mai.k · member since 6 October 2026')}
  ${sec('Language and appearance', `${choice('mk-l2', 'Language', ['English', 'Español', 'Tiếng Việt'], 'English', { act: 'owed:memberlanguageset DEC-127' })}${choice('mk-th', 'Appearance', ['Follow my device', 'Light', 'Dark'], 'Follow my device')}${acts(btn('owed:memberlanguageset DEC-127', 'Save'))}`)}
  ${sec('What you know', `${field('mk-exp', 'Your expertise (optional)', 'Tenant organiser; Spanish–English interpreter', { help: 'The group can ask you to check work in your field. An administrator may confirm it; it gates nothing.' })}${acts(btn('expertisedeclare', 'Declare your expertise'))}`)}
  ${sec('Password and signing key', acts(btn('setpassword', 'Change your password'), btn('signerregisterown', 'Register a signing key in this browser'), btn('signerrevokeown', 'Revoke your signing key')))}
  ${sec('Elsewhere in your settings', `<div class="mk-links"><a href="#" onclick="return false">${I('machine')}Your Claude account${c.ai ? ' · connected' : ' · not connected'}</a><a href="#" onclick="return false">${I('group')}Your ties</a><a href="#" onclick="return false">${I('case')}Your notes</a></div>`)}` });

SCR.connect = c => ({ rail: 'settings', title: 'Your Claude account', crumbs: ['Settings', 'Your Claude account'], main: `
  ${h1('Connect your Claude account', 'Optional. The assistant serves only you, never the group, and everything works without it.')}
  ${sec('What connecting means', `<div class="cs-dialog" style="max-width:none;box-shadow:none"><span class="cs-tag-outward">${I('outward')}Outward · leaves your group's copy</span><div class="ends">When you ask the assistant something, your question and the material read to answer it go to Anthropic under your own Claude account, and its terms apply. Nothing goes unless you ask.</div>${acts(btn('disclosureshown', 'I have read this'))}</div>`)}
  ${sec('How to connect', `${checks('Connect with', [['My own Claude API key', true], ['My own Claude subscription token', false], ['Skip: use Civicsmith without the assistant', false]], { radio: true })}
    ${field('mk-key', 'Your API key', 'sk-ant-…', { help: 'From console.anthropic.com → API keys. Civicsmith keeps it sealed, never shows or exports it, and uses it only for your questions.' })}
    <details class="mk-details"><summary>Using a subscription token instead</summary><ol class="mk-list"><li>On your own computer, open a terminal.</li><li>Run <span class="id">claude setup-token</span> and sign in to Claude when your browser opens.</li><li>Paste the token it prints into the field above.</li></ol><p class="mk-note">Your group's copy needs Workers Paid for this. Civicsmith never sees your Claude password.</p></details>
    ${acts(btn('accountreferenceset', 'Connect', { tone: 'primary' }))}`)}
  ${sec('Limits and suggestions', `${field('mk-lim', 'Your daily limit', '$2.00', { help: 'Your administrator has set at most $5.00 for this copy.' })}${acts(btn('aiceilingset', 'Set your daily limit'))}${checks('Suggestions', [['Let the assistant suggest things without being asked', false]], { act: 'accountswitchset' })}${acts(btn('accountswitchset', 'Save'))}`)}
  ${sec('Disconnect', acts(btn('accountreferenceremove', 'Disconnect your account')))}` });

SCR.ties = c => ({ rail: 'settings', title: 'Your ties', crumbs: ['Settings', 'Your ties'], main: `
  ${h1('Your ties', 'Only you and the administrators can see this.')}
  ${sheet(row(I('group'), '<b>Employer</b> · East Bay Transit', '<span class="muted">disclose as the group</span>') + row(I('subject'), '<b>Relative</b> · a cousin on the Planning Commission staff', '<span class="muted">disclose under my handle</span>'))}
  ${sec('Add a tie', `${choice('mk-tk', 'Kind', ['Employer', 'Relative', 'A business I have an interest in', 'Other'], 'A business I have an interest in')}${field('mk-tw', 'Who', 'Lakeshore Hardware Co-op (member-owner)')}${checks('If a case concerns them, disclose the tie', [['Under my handle', false], ['As the group', true]], { radio: true })}${acts(btn('declaretie', 'Add this tie', { tone: 'primary' }), btn('withdrawtie', 'Remove a tie'))}`)}` });

SCR.notes = c => ({ rail: 'settings', title: 'Your notes', crumbs: ['Your notes'], main: `
  ${h1('Your notes', 'Only you can see these in your group. <a href="#" onclick="return false">What this protects, and from whom</a>')}
  ${field('mk-note', 'New note', 'The potholes on Seminary between 59th and 62nd have been patched three times since spring and keep opening.', { area: true, rec: true })}
  ${acts(btn('owed:noteadd DEC-136', 'Keep this note', { tone: 'primary' }), btn('owed:noteconvert DEC-136', 'Turn into an observation, hunch or question'))}` });

SCR.translations = c => ({ rail: 'settings', title: 'Translations', crumbs: ['Settings', 'Translations'], main: `
  ${h1('Translations', 'The words members see, in your group\'s languages.')}
  ${choice('mk-tl', 'Language', ['Español', 'Tiếng Việt'], 'Español')}
  <div class="tw"><table class="mk-table"><thead><tr><th>English</th><th>Español</th><th></th></tr></thead><tbody>
   <tr><td>Undetermined</td><td>Indeterminado</td><td class="muted">from the release</td></tr>
   <tr><td>Nobody looked</td><td class="mk-draftcell">Nadie buscó</td><td>${c.ai ? origin('machine', 'Draft') : '<span class="muted">untranslated</span>'}</td></tr>
   <tr><td>Held together</td><td></td><td><span class="muted">untranslated · shown in English</span></td></tr></tbody></table></div>
  ${acts(c.ai ? btn('owed:translationdraft DEC-127', 'Ask the assistant to draft the 12 missing') : '', btn('owed:translationadopt DEC-127', 'Adopt', { tone: 'primary' }))}
  ${c.ai ? '' : note('Type each translation yourself; a member who knows the language adopts it.')}` });

SCR.wizards = c => ({ rail: 'settings', title: 'Wizards', crumbs: ['Settings', 'Wizards'], main: `
  ${h1('Wizards', 'Walk-throughs of the real screens. Civicsmith\'s own come with each release; your group can add its own.')}
  ${sheet(row(I('wizard'), '<b>Get a record</b> · Civicsmith', '<span class="muted">finished by 14 members</span>') + row(I('wizard'), '<b>Our council-meeting checklist</b> · this group', '<span class="muted">approved by Rosa</span>') + row(I('wizard'), '<b>Check a pothole report</b> · draft by Dev', '<span class="muted">draft</span>'))}
  ${acts(btn('wizards', 'See the whole library'), btn('wizarddraft', 'Record a new wizard', { tone: 'primary' }), btn('wizardrevise', 'Revise a draft'), btn('wizardsubmit', 'Submit for approval'), btn('wizardapprove', 'Approve'), btn('wizardretire', 'Retire'))}` });

/* ---------------- daily work ---------------- */
SCR.queue = c => ({ rail: 'queue', title: 'Your queue', main: `
  ${h1('Your queue', '6 items · grouped by case · <a href="#" onclick="return false">sort by time due</a>')}
  ${note('Three kinds: <b>To do</b> needs your act; <b>Noticed</b> is something the record found that nobody has judged; <b>Status</b> tells you where something stands. <span class="muted">(Shown once.)</span>')}
  ${sec('The Coliseum lease', sheet(
    row(kindm('todo'), `Decide on a newer version of <span class="rec">the 2024 lease amendment</span> you cited<span class="meta"><span class="cs-changed">${I('changed')}Changed 3 October</span>${btn('adoptversion', 'Adopt the newer version')}${btn('keepversion', 'Keep the version you cited')}</span>`, due('near', 'Due Friday')) +
    row(kindm('noticed'), `Two documents give different dates for the rent adjustment<span class="meta"><span class="cs-tension">${I('tension')}In tension</span>${btn('taskresolve', 'Open both')}</span>`, '') +
    row(kindm('status'), `The city's reply to "Demand to rescind" was due 9 October; no reply recorded<span class="meta">${btn('reminderanswer', 'Remind me again on…')}</span>`, due('overdue', 'Overdue'))))}
  ${sec('Pothole repairs', sheet(
    row(kindm('todo'), `Ana asked you to check a calculation: <span class="rec">812 of 903 reports closed within 7 days</span><span class="meta">${btn('taskresolve', 'Open the check')}${btn('taskforward', 'Forward to a member')}</span>`, due('', 'Due 16 October')) +
    row(kindm('noticed'), `A council member disclosed income from a firm whose contract they voted on<span class="meta">${hint()}<span>matched disclosures to votes · 1 of 212 votes · false alarms 12%</span>${btn('proposedispose', 'Dismiss with a reason')}</span>`, '') +
    row(kindm('status'), `Your standing question found 3 new documents: <span class="rec">pothole work orders</span><span class="meta">${c.ai ? '<span class="cs-origin" data-origin="machine">' + I('machine') + 'Read by the assistant</span>' : '<span class="muted">3 new matches, unread</span>'}${btn('queuesnooze', 'Snooze to a date')}${btn('queuemute', 'Mute this kind')}</span>`, '')))}` });

SCR.finder = c => ({ rail: 'find', title: 'Find', main: `
  ${h1('Find', 'Search everything your group holds, then hold a set together to act on it.')}
  <div class="mk-search" data-act="search"><input class="cs-input" id="mk-q" value="pothole work orders 2025"><span>${btn('search', 'Search', { tone: 'primary', icon: 'search' })}</span></div>
  ${sheet(
    row('<input type="checkbox" checked aria-label="pick">', '<b class="rec">Public Works work orders, FY2025 (CSV)</b><span class="meta">' + grade('capture', 'B') + ' captured by Dev, 2 October · data.oaklandca.gov</span>', '') +
    row('<input type="checkbox" checked aria-label="pick">', '<b class="rec">Pothole repair policy, Administrative Instruction 4.12</b><span class="meta">' + grade('capture', 'B') + ' passage 3: "within seven calendar days"</span>', '') +
    row('<input type="checkbox" aria-label="pick">', '<b class="rec">Report to council: street maintenance performance</b><span class="meta">' + grade('capture', 'C') + ' public archive copy</span>', ''))}
  ${gapm('nobody', '<b>Nobody looked</b> in the 2024 council minutes for this yet. ') } ${btn('frontier', 'See where nobody looked')} ${btn('countask', 'Count')}
  <div class="cs-hold mk-hold">${I('hold')}<span><span class="n">2 documents held together</span><span class="drift"> · until 16:40 today</span></span><span class="acts">${btn('select', 'Hold these together')}${btn('selectionrelease', 'Let the set go')}</span></div>` });

SCR.capture = c => ({ rail: 'add', title: 'Add', main: `
  ${h1('Add to the record', 'A document from an address or a file, a photo, or what you saw yourself.')}
  <div class="mk-tabs2" role="tablist"><span aria-selected="true">From an address</span><span>A file or photo</span><span>What I saw or heard</span></div>
  ${field('mk-url', 'Address', 'https://www.oaklandca.gov/resources/street-maintenance-report-2026', { act: 'acquire', help: 'A copy fetched from the office\'s own site holds up better than one found elsewhere.' })}
  ${acts(btn('acquire', 'Capture', { tone: 'primary' }), btn('capturerequest', 'Ask for this later'), btn('monitor', 'Watch this address for changes'))}
  ${note('Capturing through a public archive tells that archive what your group is looking at.')}
  ${sec('A file or photo', `<div class="mk-drop">${I('camera')} Take a photo, or choose a file</div>${acts(btn('capture', 'Capture this file'))}`)}
  ${sec('What I saw or heard', `${field('mk-obs', 'In your own words', 'On 4 October at 9:10 I visited 6012 Seminary Ave. The pothole reported on 12 September and marked closed on 15 September is still open, about 60 cm across.', { area: true, rec: true })}${field('mk-where', 'Where and when', '6012 Seminary Ave · 4 October 2026, 9:10')}${acts(btn('testify', 'Record what you saw', { tone: 'primary' }))}${note('Your account is testimony: always grade D, labelled as yours, and never discounted for it.')}`)}` });

SCR.held = c => ({ rail: 'add', title: 'Held captures', crumbs: ['Add', 'Held captures'], main: `
  ${h1('Held captures', 'Captured but not yet vouched for. Nothing here is sent to you; it waits.')}
  ${sheet(
    row('<input type="checkbox" checked aria-label="pick">', '<b>Photo · Seminary Ave at 60th</b><span class="meta">' + grade('capture', 'B') + ' 2 days old · Pothole repairs</span>', '') +
    row('<input type="checkbox" checked aria-label="pick">', '<b>Photo · Seminary Ave at 61st</b><span class="meta">' + grade('capture', 'B') + ' 2 days old · Pothole repairs</span>', '') +
    row('<input type="checkbox" disabled aria-label="not eligible">', '<b>Lease amendment, March 2024</b><span class="meta">' + gapm('refused', 'Not eligible for a batch: it is crucial to a finding. Vouch for it on its own.') + '</span>', ''))}
  <div class="cs-hold mk-hold">${I('hold')}<span><span class="n">2 captures picked</span></span><span class="acts">${btn('heldcaptures', 'Refresh the list')}${btn('heldsetaside', 'Set aside, with one reason')}${btn('heldrestore', 'Restore')}${btn('release', 'Vouch for both', { tone: 'primary' })}</span></div>` });

SCR.document = c => ({ rail: 'projects', title: 'Document', crumbs: ['Pothole repairs', 'Documents', 'Administrative Instruction 4.12'], main: `
  <div class="mk-doc-h">${h1('<span class="rec">Pothole repair policy, Administrative Instruction 4.12</span>', 'Public Works · revised 2023 · captured by Dev from oaklandca.gov, 2 October 2026')}${pathm(0)}</div>
  <div class="row">${grade('capture', 'B', 'Capture')}${btn('gradenote', 'Why B?')}<span class="id">fingerprint 3b9f…c210</span></div>
  ${sec('Passages', `<blockquote class="mk-passage rec" data-act="cite">"3. The Director shall repair each reported pothole within seven calendar days of the report, weather permitting."</blockquote>${acts(btn('cite', 'Cite this passage', { tone: 'primary' }))}
    <blockquote class="mk-passage rec">"5. Repairs are recorded as closed when the crew reports the work complete."</blockquote>`)}
  ${sec('People it names', `${sheet(row(I('subject'), 'L. Chen, Director of Public Works', btn('identityclaim', 'Claim the same person')))}`)}
  ${sec('This copy', acts(btn('release', 'Vouch for this copy'), btn('attest', 'Attest'), btn('monitor', 'Watch for changes'), btn('retire', 'Retire')))}
  ${c.ai ? machine('Mai', '<p>This instruction sets the seven-day standard. The city\'s 2026 performance report counts reports "closed", which passage 5 defines as the crew reporting the work complete, not an inspection.</p>') : ''}` });

/* ---------------- projects and questions ---------------- */
SCR.project = c => ({ rail: 'projects', title: 'Pothole repairs', crumbs: ['Projects', 'Pothole repairs'], main: `
  <div class="mk-titlerow">${h1('Pothole repairs', 'Is the city repairing reported potholes as its own policy requires?')}${wizmark(2, 'Your first question · Check a claim')}</div>
  <div class="mk-grid2"><div>${ladder('stage', ['Forming', 'Investigating', 'Matured', 'Closed'], 1)}</div><div class="row">${btn('strengthbarset', 'Set the project\'s bar')}<span class="muted">Bar: B/B</span></div></div>
  ${sec('Questions', sheet(
    row(I('question'), `<span class="rec">Is the city repairing reported potholes within seven days?</span><span class="meta">${strength('B', 'C', '<b>Short on connection</b> · bar B/B')}</span>`, '') +
    row(I('question'), `<span class="rec">Does "closed" in the city's records mean "repaired"?</span><span class="meta">${gapm('unrated', '<b>Unrated</b> · rests on nothing yet')}</span>`, '')) +
    acts(btn('promote', 'Open a question', { tone: 'primary' }), btn('planopen', 'Plan what to do')))}
  ${c.ai ? sec('Suggested questions', machine('Mai', '<p class="rec">Did the 2026 report count reports closed within seven days, or within seven working days?</p>' + acts(btn('promote', 'Open this question')))) : ''}
  ${sec('Members', `<p>Dev (owner), Mai, Ana</p>${acts(btn('projectinvite', 'Invite a member to the project'), btn('projectjoin', 'Join'))}`)}` });

SCR.question = c => ({ rail: 'projects', title: 'Question', crumbs: ['Pothole repairs', 'Question'], main: `
  ${h1('<span class="rec">Is the city repairing reported potholes within seven days?</span>', 'Opened by Dev, 3 October · Pothole repairs')}
  <div class="mk-strengthbox"><div>${strength('B', 'C', '<b>Short on connection</b> · bar B/B')}</div><p class="mk-note">Strength is two grades, never one score. <a href="#" onclick="return false">What raises it</a>: a link the source itself makes, or a shared identifier.</p>${gapm('undetermined', '<b>Undetermined</b>, because the city does not define "closed" in the report.')}</div>
  ${sec('Supports', sheet(row(grade('capture', 'B'), '<span class="rec">"…within seven calendar days of the report…"</span><span class="meta">Administrative Instruction 4.12, passage 3 · cited by Dev</span>', btn('sever', 'Remove')) + row(grade('capture', 'B'), '<span class="rec">812 of 903 reports closed within 7 days</span><span class="meta">computed fact · method shown · checked by Ana</span>', btn('reinstate', 'Reinstate'))) + acts(btn('cite', 'Cite a passage', { tone: 'primary' })))}
  ${sec('Cuts against', sheet(row(grade('testimony', 'D'), '<span class="rec">"…marked closed on 15 September is still open, about 60 cm across."</span><span class="meta">Mai\'s observation, 4 October</span>', '')))}
  ${sec('Hunches', `<span class="cs-hunch">${I('hunch')}Hunch · Dev's</span> <span class="rec">Crews may be closing reports when they inspect, not when they repair.</span>${acts(btn('hypothesishold', 'Keep a hunch'))}`)}
  ${sec('Concluding', `${acts(btn('narrow', 'Narrow the question'), btn('conclude', 'Conclude'), btn('withdrawconclusion', 'Withdraw the conclusion'))}${acts(btn('owed:checkrequest DEC-135', 'Ask for a check by expertise'), btn('planopen', 'Plan what to do'))}`)}` });

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
  ${sec('Correction', acts(btn('expunge', 'Remove a fact where the law requires')))}` });

SCR.timeline = c => ({ rail: 'projects', title: 'Timeline', crumbs: ['The Coliseum lease', 'Timeline'], main: `
  <div class="mk-titlerow">${h1('Timeline', 'The Coliseum lease')}${wizmark(1, 'Build a timeline')}</div>
  <div class="mk-lanes"><div class="mk-lanehead">What they did</div><div class="mk-lanehead">What we did</div>
   <div class="mk-ev"><span class="mk-date">12 Jan 2024</span><b>Council approves lease amendment 1</b><span>decided: Council · ${grade('capture', 'B')}</span></div><div></div>
   <div class="mk-ev"><span class="mk-date">March 2024 <i>(month known)</i></span><b>Rent adjusted without a vote</b><span>signed: City Administrator · ${grade('capture', 'B')}</span></div><div></div>
   <div></div><div class="mk-ev us"><span class="mk-date">4 Sep 2026</span><b>We requested the rent schedules</b><span>${due('met', 'Answered 18 Sep')}</span></div>
   <div class="mk-ev"><span class="mk-date">18 Sep 2026</span><b>City Clerk releases schedules</b><span>answered our request</span></div><div></div></div>
  ${gapm('undetermined', '<b>Undetermined</b> order: the March adjustment and the April notice, because both are dated only by month.')}
  ${sec('Undated', sheet(row(I('timeline'), 'Memo on rent indexing, undated', '<span class="muted">listed apart, never guessed into place</span>')))}
  ${acts(btn('createevent', 'Record an event', { tone: 'primary' }), btn('addparticipant', 'Add who took part'), btn('relate', 'Link events'), btn('recorddatedfact', 'Record a dated fact'), btn('hypothesishold', 'Keep a suspected cause as a hunch'))}` });

SCR.money = c => ({ rail: 'projects', title: 'Money trail', crumbs: ['Sewer fund transfers', 'Money trail'], main: `
  ${h1('Sewer fund transfers, FY2022', 'A money trail · 4 figures · started by Ana')}
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
    row(grade('connection', 'B'), '<b>J. Ortega</b> → voted for → <b>Lease amendment 1</b> → paid under → <b>$1.2M to Bayline Properties</b><span class="meta">weakest step B · each step cited</span>', btn('exploreverify', 'Check this chain')) +
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
  ${sec('How this was worked out', `<ol class="mk-list"><li>Basis: the public records law your group's profile names, the 10-day response window. <span class="muted">(cited)</span></li><li>Received by the office: 2 October 2026 (you recorded sending it that day).</li><li>Counted 10 calendar days: to 12 October.</li><li>12 October is a Sunday and 13 October a city holiday (your profile): rolled to 14 October, close of business.</li></ol>${acts(btn('deadlinecompute', 'Work it out again'))}`)}
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
  ${sec('Step 1 · Start', `<dl class="mk-dl"><dt>Kind</dt><dd>records request</dd><dt>Addressed to</dt><dd>Office of the City Clerk (an office) · held today by Asha Rao</dd><dt>Rests on</dt><dd>Subject 1: reports closed before repair · <span class="muted">hypothetical: not yet shown</span></dd><dt>Clock</dt><dd>10 days, from the law your profile names</dd><dt>Asserts a breach</dt><dd>no</dd></dl>
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
  <div class="cs-dialog" style="max-width:none;box-shadow:none"><b>Sign Edition 2</b><div class="ends">You sign with the key registered in this browser, as Dev, owner of the project. The edition and its timeline are fixed when you sign.</div>${acts(btn('caseratify', 'Sign with your key', { icon: 'signed' }), btn('publish', 'Publish Edition 2', { tone: 'primary' }))}</div>` });

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
  <ul class="mk-list"><li>Your files go only to this group's own copy of Civicsmith.</li><li>A member reads them and decides whether to use them.</li><li>You can add a secret phrase, so later material can be recognised as yours without anyone knowing who you are.</li><li>Nothing here is beyond a court's reach. <a href="#" onclick="return false">What that means</a></li></ul>
  <div class="mk-drop">${I('add')} Choose files</div>
  ${field('mk-kn', 'A note (optional)', 'These are the inspection sheets they don\'t publish.', { area: true })}
  ${field('mk-ks', 'A secret phrase (optional)', '')}
  ${acts(btn('knock', 'Hand it over', { tone: 'primary' }))}` });
