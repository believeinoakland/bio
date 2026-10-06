/* Civicsmith mockups: the frames (working, setup, public, published), the dock (the assistant panel and the wizard
   guide), and the ring a wizard draws on the control its step names. */
'use strict';
const RAIL = [['home', 'Home', 'home'], ['queue', 'Queue', 'queue', 4], ['find', 'Find', 'search'], ['add', 'Add', 'add'], ['projects', 'Projects', 'project'], ['people', 'People', 'subject'], ['settings', 'Settings', 'settings']];
const TABS = [['home', 'Home', 'home'], ['queue', 'Queue', 'queue'], ['add', 'Add', 'add'], ['find', 'Find', 'search'], ['more', 'More', 'settings']];
const BANDS = {
  working: `<b>Working</b> · not public · seen by your group's members`,
  review: `${I('outward')}<b>Shared for review</b> · 2 people outside the group can read this until 20 October`,
  imported: `${I('elsewhere')}<b>Another group's case:</b> West Oakland Neighbors · Edition 2 · read-only · 1 of 3 findings recreated`,
};
/* what the assistant says beside each screen, when the member has connected their own account */
const ASSIST = {
  question: ['Is there anything that links the work orders to the policy directly?', 'The work orders cite "AI 4.12" in their category field, row by row. Citing that column would make the link one the source itself makes, which would raise connection from C to A. I looked in the 14 documents this project holds.'],
  document: ['What does this instruction say "closed" means?', 'Passage 5: a report is closed "when the crew reports the work complete". It does not mention an inspection. This is legal information, not legal advice.'],
  plan: ['What options does a group usually have here?', 'For a fixing project with a hypothetical subject, groups often start with a records request, then ask the responsible committee to agendize the issue. I put two suggestions in the tray; they are not in the plan until you adopt one.'],
  'start-send': ['Draft the request for me.', 'I drafted it in the field, labelled as my draft. Edit it until it is yours; nothing is sent until you approve it and send it yourself.'],
  request: ['Draft the request for me.', 'I drafted it in the field, labelled as my draft. The law and the office come from your group\'s profile.'],
  person: ['Has L. Chen held any other post?', 'Deputy Director, Transportation, 2018–2022, from the council minutes the group holds. I found nothing earlier; I looked in 31 documents.'],
  timeline: ['Can you propose events from the rent schedules?', 'This is switched on after its measurement at the release. For now, record events from cited passages yourself.'],
  _: ['What is waiting on me here?', 'Two things on this screen need you. I can explain any mark: tap it, or ask me.'],
};
function assistantPanel(screen, c) {
  const [q, a] = ASSIST[screen] || ASSIST._;
  return `<aside class="cs-dock" aria-label="The assistant">
   <header>${I('machine')}The assistant<span class="spacer"></span><span class="muted mk-small">$0.42 of your $2.00 today</span><button type="button" class="cs-btn" data-tone="quiet" aria-label="Widen">${I('expand')}</button></header>
   <div class="body"><p class="mk-small muted">Runs on your own Claude account, or on your group's API key where it offers one; only for you. It finds, reads and checks; it never concludes, signs or sends.</p>
    <div class="mk-msg me">${esc(q)}</div>${machine('Mai', `<p>${esc(a)}</p>`)}</div>
   <footer>${field('mk-ask-' + screen, 'Ask about this screen', '', {})}<div class="mk-acts">${btn('airunopen', 'Work on this', { tone: 'primary' })}${btn('suggest', 'Suggest')}${btn('airunclose', 'Stop')}</div></footer></aside>`;
}
function wizardGuide(w) {
  return `<aside class="cs-dock" aria-label="Wizard">
   <header>${I('wizard')}Wizard<span class="spacer"></span><button type="button" class="cs-btn" data-tone="quiet">Stop</button></header>
   <div class="body"><div class="cs-wizard">
    <span class="step">${I('wizard')}${esc(w.name)} · step ${w.i} of ${w.n}</span>
    <span class="what">${esc(w.what)}</span><span class="why">${esc(w.why)}</span>
    ${w.via ? `<p class="mk-small">${I('wizard')} Side trip: <b>${esc(w.via)}</b>. When it finishes or you stop it, you come back to this step.</p>` : ''}
    ${w.draft ? `<p class="mk-small">${I('machine')} This step places a labelled draft in the field. It becomes yours only when you keep or edit it.</p>` : ''}
    <span class="nav"><button type="button" class="cs-btn" data-tone="quiet">${I('back')}Back</button><button type="button" class="cs-btn">Next${I('next')}</button></span>
    ${w.act ? `<span class="nav"><button type="button" class="cs-btn" data-replay>${I('wizard')}Show me where</button><span class="cs-kbd">Alt+Shift+W</span></span>` : ''}
    <p class="mk-small muted">Stopping is fine: nothing is lost, and nobody is told.</p></div></div></aside>`;
}
function mast(c, s) {
  return `<header class="cs-mast"><span class="grp">${G.name}</span><span class="spacer"></span>
    <span class="mk-mastsearch">${I('search')}<span>Search</span></span>
    ${c.ai ? `<button type="button" class="cs-btn" data-tone="quiet" aria-label="The assistant">${I('machine')}<span class="mk-hide-phone">Assistant</span></button>` : ''}
    <span class="cs-kind mk-hide-phone" data-kind="todo">${I('queue')}4</span><span class="mk-avatar" aria-label="Mai">M</span></header>`;
}
// DEC-154 (Bob, 6 October): every screen shows where it is, in the same place: its path, from the section of the rail
// (or, outside the workspace, the group or Civicsmith) to the screen's own name, which is always last. The heading below
// names the thing shown (a question's words, a person's name); the path names the screen.
const PATH = {
  install: ['Civicsmith', 'Install'], setup: ['Set up', 'Places and languages'], join: ['Lakeshore Tenants', 'Your invitation'],
  doorbell: ['Lakeshore Tenants', 'Hand material over'], published: ['Lakeshore Tenants', 'Published cases', 'The Coliseum lease'],
  home: ['Home'], queue: ['Queue'], 'due-date': ['Queue', 'Due date'], inbox: ['Queue', 'Inbox'],
  finder: ['Find'], capture: ['Add'], held: ['Add', 'Held captures'],
  'group-identity': ['Settings', 'Who your group is'], members: ['Settings', 'Members'], account: ['Settings', 'Your account'],
  connect: ['Settings', 'The assistant and your account'], ties: ['Settings', 'Your ties'], notes: ['Settings', 'Your notes'],
  translations: ['Settings', 'Translations'], wizards: ['Settings', 'Wizards'],
  person: ['People', 'Person'], explore: ['People', 'Person', 'Explore connections'],
  project: ['Projects', 'Pothole repairs'], document: ['Projects', 'Pothole repairs', 'Document'],
  question: ['Projects', 'Pothole repairs', 'Question'], assistant: ['Projects', 'Pothole repairs', 'Question'],
  calculation: ['Projects', 'Pothole repairs', 'Calculation'], standard: ['Projects', 'Pothole repairs', 'Standard'],
  plan: ['Projects', 'Pothole repairs', 'Action plan'], 'start-send': ['Projects', 'Pothole repairs', 'Action plan', 'Start and send'],
  request: ['Projects', 'Pothole repairs', 'Request records'], action: ['Projects', 'Pothole repairs', 'Action'],
  timeline: ['Projects', 'The Coliseum lease', 'Timeline'], money: ['Projects', 'Sewer fund transfers', 'Money trail'],
  proceeding: ['Projects', 'The Coliseum lease', 'Proceeding'], matter: ['Projects', 'The Coliseum lease', 'Matter'],
  'case-editor': ['Projects', 'The Coliseum lease', 'Case'], 'review-copy': ['Projects', 'The Coliseum lease', 'Review copy'],
  ceremony: ['Projects', 'The Coliseum lease', 'Publish'], docket: ['Projects', 'The Coliseum lease', 'Docket'],
  imported: ['Projects', 'Imported', "Another group's case"],
};
const pathOf = (id, s) => PATH[id] && !(id === 'answers') ? PATH[id] : id === 'answers' ? ['Find', s.title] : [(RAIL.find(r => r[0] === s.rail) || ['', 'Settings'])[1], s.title];
const pathNav = list => `<nav class="mk-crumbs" aria-label="Where you are">${list.map((x, i) => i === list.length - 1 ? `<b aria-current="page">${esc(x)}</b>` : `<a href="#" onclick="return false">${esc(x)}</a>`).join(' <i>›</i> ')}</nav>`;

// DEC-160, widened on Bob's direction (6 October): the references on each screen, each with what it is and why it matters
// on that screen. Hover or focus shows the card; a click opens it (null: a card only). Attached as the screen draws.
const tipOf = (what, why, go) => `${what}${why ? `<span class=why><b>Here:</b> ${why}</span>` : ''}${go ? '<span class=more>Click to open it.</span>' : ''}`;
const AQ = 'Is the city repairing reported potholes within seven days?';
const REFS = {
  home: [['The Coliseum lease', 'project', '<b>The Coliseum lease</b> · project · 3 questions · Edition 2 published 14 November', '2 items in it wait on you this week.'],
         ['Pothole repairs', 'project', '<b>Pothole repairs</b> · project · 2 questions · its main question is short on connection', 'A better link between reports and work orders would bring it to the bar.'],
         ['Sewer fund transfers', 'money', '<b>Sewer fund transfers</b> · project · a money trail across FY2022 to FY2024', 'Ana\'s question there waits for the FY2024–25 budget.']],
  members: [['Rosa', null, '<b>Rosa</b> · administrator · cover name R. Medina', 'The group\'s only administrator: the group depends on her and the hosting account.'],
            ['Dev', null, '<b>Dev</b> · member · owner of The Coliseum lease', 'Signs the group\'s cases for that project.'],
            ['Ana', null, '<b>Ana</b> · member · works on Sewer fund transfers', 'Has a question waiting on a held document.'],
            ['Teo', null, '<b>Teo</b> · member · reporter at the Bay Courier · declared expertise: journalism', 'Runs the story that cites Edition 2.']],
  queue: [['812 of 903 reports closed within 7 days', 'calculation', '<b>Reports closed within seven days, FY2025</b> · a calculation · 812 of 903 · computed from the city\'s work orders', 'One of its inputs changed: check whether the count still holds.'],
          ['pothole work orders', 'document', '<b>Public Works work orders, FY2025</b> · CSV, 903 rows · captured from the city\'s open-data portal, capture A', 'The input that changed.']],
  finder: [['Public Works work orders, FY2025 (CSV)', 'document', '<b>Public Works work orders, FY2025</b> · CSV, 903 rows · capture A', 'The city\'s own record of every pothole report: what your search matched most.'],
           ['Pothole repair policy, Administrative Instruction 4.12', 'document', '<b>Administrative Instruction 4.12</b> · Public Works · capture B · current version', 'Sets the seven-day standard your question tests the city against.'],
           ['Report to council: street maintenance performance', 'document', '<b>Report to council: street maintenance performance</b> · 2026 · capture B', 'Where the city claims 90% of potholes were filled.']],
  held: [['City budget FY2024–25, adopted (PDF)', 'document', '<b>City budget FY2024–25, adopted</b> · 412 pages · captured 2 October · not yet released', 'Held until a member vouches for it; Ana\'s question is waiting for it.'],
         ['Council minutes, 14 May 2024', 'document', '<b>Council minutes, 14 May 2024</b> · captured 28 September · not yet released', 'Records the vote on the FY2024 transfers.'],
         ['Lease amendment, March 2024', 'document', '<b>Lease amendment, March 2024</b> · the city posted a newer version on 3 October', 'Can\'t be released here: part of it is withheld by its source.']],
  project: [[AQ, 'question', `<b>${AQ}</b> · question · capture B, connection C · short on connection`, 'The project\'s main question, and the one closest to the bar.'],
            ['Does "closed" in the city\'s records mean "repaired"?', 'question', '<b>Does “closed” mean “repaired”?</b> · question · unrated · opened by Mai', 'If the answer is no, the main question\'s count overstates repairs.']],
  question: [['812 of 903 reports closed within 7 days', 'calculation', '<b>Reports closed within seven days, FY2025</b> · a calculation from the city\'s work orders', 'Supports the question, using the city\'s own count of “closed”.']],
  answers: [['Public Works work orders, FY2025', 'document', '<b>Public Works work orders, FY2025</b> · CSV, 903 rows · capture A', 'The answer counts its rows.']],
  timeline: [['City Clerk releases schedules', 'action', '<b>The City Clerk released the rent schedules</b> · 18 September · answering the group\'s request', 'The group\'s own act and the office\'s reply, in the second lane.']],
  explore: [['J. Ortega', 'person', '<b>J. Ortega</b> · Council District 3 since 2023, from Legistar', 'Where this chain starts.'],
            ['Bayline Properties', 'money', '<b>Bayline Properties</b> · paid $1.2M in FY2024 under the Coliseum lease', 'Where the money in this chain ends up.']],
  plan: [['Records request: inspection logs', 'action', '<b>Records request: inspection logs</b> · sent to the City Clerk 4 October · reply due 14 October', 'The plan\'s first step; the next one waits on its reply.'],
         ['Complaint to the city auditor', 'action', '<b>Complaint to the city auditor</b> · an option, not started', 'Becomes ready if the inspection logs show reports closed without repair.']],
  'start-send': [['Asha Rao', 'person', '<b>Asha Rao</b> · City Clerk since March 2021, from the city\'s roster', 'Holds the office this request goes to, today.']],
  'review-copy': [['Prof. N. Iyer', null, '<b>Prof. N. Iyer</b> · housing-law professor · an outside reader named by Dev · can read until 20 November', 'Reviewing Edition 2 before it is published.']],
  imported: [['Port lease revenue fell short of the adopted budget in three years', 'question', '<b>Port lease revenue fell short of the adopted budget in three years</b> · West Oakland Neighbors\' finding · recreated here', 'Recreated from their case; it counts for your group only once a member accepts it.']],
};

// Things named on many screens: one card wherever they appear (DEC-160, widened 6 October). [text, opens, what it is, why here
// (usually none: a screen's own REFS add that), screens where it is not attached].
const GLOBAL_REFS = [
  ['The Coliseum lease', 'project', '<b>The Coliseum lease</b> · a project · whether the city kept the terms of its lease of the Coliseum land, including rent raised in 2024 without a council vote · owner: Dev · Edition 2 published 14 November', null, ['project']],
  ['Pothole repairs', 'project', '<b>Pothole repairs</b> · a project · whether the city repairs reported potholes within the seven days its own policy sets · 2 questions · owner: Mai', null, ['project']],
  ['Sewer fund transfers', 'money', '<b>Sewer fund transfers</b> · a project · where sewer-fee money moved between funds, FY2022 to FY2024, and whether each transfer was authorised · owner: Ana', null, []],
  ['Lakeshore Tenants', null, '<b>Lakeshore Tenants</b> · your group · tenants near the Coliseum, meeting since 2025 · 6 members, 1 administrator', null, ['install', 'setup', 'join', 'doorbell', 'published']],
  ['Rosa', 'members', '<b>Rosa</b> · member of your group · administrator', null, ['members']],
  ['Dev', 'members', '<b>Dev</b> · member of your group · owns The Coliseum lease and signs its cases', null, ['members']],
  ['Mai', 'members', '<b>Mai</b> · member of your group · works on Pothole repairs · translates Español', null, ['members']],
  ['Ana', 'members', '<b>Ana</b> · member of your group · works on Sewer fund transfers', null, ['members']],
  ['Teo', 'members', '<b>Teo</b> · member of your group · a reporter at the Bay Courier · declared expertise: journalism', null, ['members']],
  ['Asha Rao', 'person', '<b>Asha Rao</b> · a person the record follows · City Clerk since March 2021, from the city\'s roster', null, []],
  ['L. Chen', 'person', '<b>L. Chen</b> · a person the record follows · Director of Public Works since 2022, from the city\'s roster', null, ['person']],
  ['J. Ortega', 'person', '<b>J. Ortega</b> · a person the record follows · Council District 3 since 2023, from Legistar', null, []],
  ['Office of the City Clerk', null, '<b>Office of the City Clerk</b> · an office · keeps the city\'s records and answers records requests · held today by Asha Rao', null, []],
  ['City Clerk', null, '<b>City Clerk</b> · an office · keeps the city\'s records and answers records requests · held today by Asha Rao', null, []],
  ['City Administrator', null, '<b>City Administrator</b> · an office · runs the city\'s departments and answers to the council', null, []],
  ['Director of Public Works', null, '<b>Director of Public Works</b> · an office · runs the department that repairs streets · held today by L. Chen', null, []],
  ['Administrative Instruction 4.12', 'document', '<b>Administrative Instruction 4.12</b> · a document · the city\'s pothole repair policy · Public Works · capture B · sets seven calendar days', null, ['document']],
  ['Lease amendment 1', 'document', '<b>Lease amendment 1</b> · a document · the Coliseum lease change approved 12 January 2024', null, []],
  ['Bayline Properties', 'money', '<b>Bayline Properties</b> · a firm · paid $1.2M in FY2024 under the Coliseum lease', null, []],
  ['Edition 2', 'published', '<b>Edition 2</b> of The Coliseum lease · a published case · signed and published 14 November 2026', null, ['published']],
  ['Edition 1', 'published', '<b>Edition 1</b> of The Coliseum lease · a published case, since corrected by Edition 2', null, []],
  ['West Oakland Neighbors', 'imported', '<b>West Oakland Neighbors</b> · another group · its published cases can be imported and recreated here', null, ['imported']],
  ['Bay Courier', null, '<b>Bay Courier</b> · a newsroom · Teo reports for it; its story cites Edition 2', null, []],
];
// Attach references by text: every occurrence on the screen, inside running text too, never inside a link, button, field,
// heading or an element that already explains itself. Per-screen entries win over GLOBAL ones (things named on many screens).
const NO_REF = 'a,button,select,option,textarea,input,label,h1,legend,summary,[data-tip],.cs-grade,.cs-btn,.mk-crumbs,.mk-mockctl,.id,script,style';
function attachRefs(id, html) {
  if (typeof document === 'undefined') return html;
  const own = (REFS[id] || []).map(r => [...r, true]);
  const seen = new Set(own.map(r => r[0]));
  const list = own.concat((typeof GLOBAL_REFS !== 'undefined' ? GLOBAL_REFS : []).filter(r => !seen.has(r[0]) && !(r[4] || []).includes(id)));
  if (!list.length) return html;
  const t = document.createElement('template'); t.innerHTML = html;
  const esc_ = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const [text, go, what, why] of list.sort((a, b) => b[0].length - a[0].length)) {
    const re = new RegExp('(^|[^\\w])(' + esc_(text) + ')(?![\\w])');
    const walker = document.createTreeWalker(t.content, NodeFilter.SHOW_TEXT);
    const hits = []; let n;
    while ((n = walker.nextNode())) { if (n.parentElement && n.parentElement.closest(NO_REF)) continue; if (re.test(n.nodeValue)) hits.push(n); }
    for (const node of hits) {
      let cur = node;
      for (let m; cur && (m = re.exec(cur.nodeValue));) {
        const start = m.index + m[1].length;
        const after = cur.splitText(start); const rest = after.splitText(text.length);
        const el = document.createElement(go ? 'a' : 'span');
        if (go) { el.href = '#'; el.className = 'cs-ref'; el.dataset.goto = go; } else { el.className = 'cs-card'; el.tabIndex = 0; }
        el.dataset.tip = tipOf(what, why, go); el.textContent = text; after.replaceWith(el); cur = rest;
      }
    }
  }
  return t.innerHTML;
}
// DEC-155: the rail's width, the member's own (184px by default; 64px is icons only); kept per member and device.
const railW = () => window.CS_RAILW || 184;
function render(screenId, c) {
  WRITE_ON = !!c.ai;
  const s = SCR[screenId](c);
  WRITE_ON = false;
  s.main = attachRefs(screenId, s.main);
  const frame = s.frame || 'working';
  const dock = c.wizard ? wizardGuide(c.wizard) : (s.dock === 'assistant' && c.ai) || (c.dockAssist && c.ai) ? assistantPanel(screenId, c) : '';
  if (frame === 'published') return `<div class="cs-frame mk-page" data-frame="published"><header class="cs-pubhead"><span class="grp">${G.name}</span></header><main class="mk-pubmain">${pathNav(pathOf(screenId, s))}${s.main}</main>
    <footer class="cs-pubfoot"><span class="id">${G.slug} · signed by an owner of the project · 7c1e…a90b</span><span class="cs-credit">Made with <svg viewBox="0 0 60 90" aria-hidden="true"><use href="#i-mark"/></svg><b>Civicsmith</b></span></footer></div>`;
  if (frame === 'setup' || frame === 'public') return `<div class="cs-frame mk-page mk-plain${dock ? ' with-dock' : ''}" data-frame="${frame}"><main class="mk-plainmain">${pathNav(pathOf(screenId, s))}${s.main}</main>${dock}</div>`;
  const band = s.band || 'working';
  return `<div class="cs-frame cs-shell mk-page${dock ? ' with-dock' : ''}${railW() < 120 ? ' rail-icons' : ''}" data-frame="working" style="--rail:${railW()}px">${mast(c, s)}<div class="cs-band" data-band="${band}">${BANDS[band]}</div>
   <nav class="cs-rail" aria-label="Sections">${RAIL.map(([k, l, ic, n]) => `<a href="#" onclick="return false" title="${l}"${s.rail === k ? ' aria-current="page"' : ''}>${I(ic)}${l}${n ? `<span class="count">${n}</span>` : ''}</a>`).join('')}<button type="button" class="cs-grip" role="separator" aria-orientation="vertical" aria-label="Width of the sections list" aria-valuemin="64" aria-valuemax="320" aria-valuenow="${railW()}" title="Drag to resize; arrow keys too; double-click to reset"></button></nav>
   <main class="cs-main"${s.st ? ` data-st="${s.st}"` : ''}>${pathNav(pathOf(screenId, s))}${s.main}</main>${dock}
   <nav class="cs-tabs" aria-label="Sections">${TABS.map(([k, l, ic]) => `<a href="#" onclick="return false"${(s.rail === k || (k === 'more' && ['projects', 'people', 'settings'].includes(s.rail))) ? ' aria-current="page"' : ''}>${I(ic)}${l}</a>`).join('')}</nav></div>`;
}
/* "Show me where": draw the ring again on the step's control, scroll it into view, and move the keyboard to it */
function replay(root) {
  const el = root.querySelector('.cs-target'); if (!el) return false;
  el.classList.remove('again'); void el.offsetWidth; el.classList.add('again');
  const main = el.closest('.cs-main, .mk-plainmain, .mk-pubmain');
  if (main) { const r = el.getBoundingClientRect(), m = main.getBoundingClientRect(); main.scrollTop += (r.top - m.top) - 120; }
  el.focus({ preventScroll: true });
  return true;
}
/* draw the wizard's ring on the control its step names; return whether it was found */
function ring(root, act, label) {
  if (!act) return true;
  const sel = `[data-act="${CSS.escape(act)}"]`;
  const el = root.querySelector(`button${sel}`) || root.querySelector(sel);
  if (!el) return false;
  el.classList.add('cs-target');
  const tag = document.createElement('span');
  tag.className = 'cs-target-label mk-ringlabel';
  tag.innerHTML = `${I('wizard')}${label || (el.tagName === 'BUTTON' ? 'Press here when you\'re ready' : 'Here')}`;
  el.insertAdjacentElement(el.tagName === 'BUTTON' ? 'afterend' : 'beforeend', tag);
  const main = el.closest('.cs-main, .mk-plainmain, .mk-pubmain');
  if (main) { const r = el.getBoundingClientRect(), m = main.getBoundingClientRect(); main.scrollTop += (r.top - m.top) - 120; }
  return true;
}
