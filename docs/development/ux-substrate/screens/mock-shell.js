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
// DEC-155: the rail's width, the member's own (184px by default; 64px is icons only); kept per member and device.
const railW = () => window.CS_RAILW || 184;
function render(screenId, c) {
  WRITE_ON = !!c.ai;
  const s = SCR[screenId](c);
  WRITE_ON = false;
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
