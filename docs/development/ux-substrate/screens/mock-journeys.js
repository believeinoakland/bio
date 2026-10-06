/* The twenty-seven journeys of step 3 (journeys.html), walked through the mockups. A journey either walks a wizard from
   the library (its steps are the script's, unchanged) or lists its own steps. Each step: s (screen), act (the control
   it points at, an op of that screen), say (what happens, in Bob's words), only ('ai' or 'noai': a step that exists on
   one path only), alt (what the member without the assistant does instead), dock (open the assistant panel). */
'use strict';
const J = [
 { n: 1, t: 'A group gets going', who: 'The person installing it, the founder', wiz: 'Set up and claim',
   noai: 'Nothing in setup needs a Claude account. The founder only decides whether members may connect their own.' },
 { n: 2, t: 'The group says who it is and why', who: 'Administrators', wiz: 'Say who your group is' },
 { n: 3, t: 'A member joins and finds their footing', who: 'A newcomer member', wiz: 'Welcome a new member',
   noai: 'Skipping the Claude account is a real choice. The welcome never mentions it again.' },
 { n: 4, t: 'Connecting your own Claude account', who: 'Any member who wants the assistant', wiz: 'Connect your Claude account',
   noai: 'A member who skips at step 3 simply goes on: no assistant button, panel or suggestions appear anywhere, and nothing reminds them.' },
 { n: 5, t: 'Declaring your own ties', who: 'Every member, before they publish', wiz: 'Your ties' },
 { n: 6, t: 'From a problem to a question', who: 'Any member, often a newcomer', steps: [
   { s: 'home', act: 'owed:startfrom DEC-129', say: 'Mai opens the group\'s home and picks "A problem I live with".' },
   { s: 'notes', act: 'owed:noteadd DEC-136', say: 'She writes the problem in her own words, in a note only she can see.' },
   { s: 'capture', act: 'testify', say: 'She records what she has seen on Seminary Avenue: where, when, and a photo.' },
   { s: 'answers', act: 'ruleanswer', only: 'ai', say: 'She asks the assistant what standard the city set itself. It quotes Administrative Instruction 4.12 from what the group holds, as legal information.' },
   { s: 'finder', act: 'search', only: 'noai', say: 'She searches what the group holds for "pothole" and finds the city\'s own instruction, section by section.' },
   { s: 'standard', act: 'standarddeclare', say: 'She holds the seven-day rule as a standard the city must meet.' },
   { s: 'project', act: 'promote', say: 'She turns the problem into a question the record can answer, in the Pothole repairs project.' },
   { s: 'request', act: 'addresseesuggest', say: 'The records she needs are not public, so she asks for them (journey 7).' } ] },
 { n: 7, t: 'Getting a record: find it, or ask for it', who: 'A member, often a newcomer', wiz: 'Get a record',
   noai: 'The request\'s text comes from the group\'s own template instead of the assistant\'s draft. Every other step is the same.' },
 { n: 8, t: 'Checking a deadline\'s basis', who: 'Any member', steps: [
   { s: 'action', act: null, say: 'Mai opens her request and sees "Response due 14 October".' },
   { s: 'due-date', act: 'deadlinecompute', say: 'She opens "How was this worked out?": the law, the receipt date, the days counted, the holiday skipped.' },
   { s: 'due-date', act: 'clockadopt', say: 'She confirms it in one act. If the law left the day uncertain, both dates would show as "Undetermined, because…".' },
   { s: 'queue', act: null, say: 'Later the queue shows it met, met late or overdue: facts, never legal advice.' } ] },
 { n: 9, t: 'Checking a claim about the city\'s performance', who: 'Members; often an analyst or accountant', wiz: 'Check a claim' },
 { n: 10, t: 'Following a person', who: 'Any member; often an investigator or reporter', steps: [
   { s: 'document', act: 'identityclaim', say: 'Dev meets a name in the repair policy: L. Chen, Director of Public Works.' },
   { s: 'person', act: 'person', say: 'He opens the person\'s page: positions over time, each dated and cited.' },
   { s: 'person', act: 'recordpersonfact', say: 'He adds a fact from a captured document: a licence from the state register.' },
   { s: 'person', act: 'claimidentity', say: '"Lin Chen" in the 2019 minutes: he records "claimed the same person, grade B, because…". Records are linked, never merged.' },
   { s: 'person', act: null, dock: true, only: 'ai', say: 'He asks the assistant whether Chen held other posts; it answers from what the group holds and says where it looked.' },
   { s: 'person', act: 'followregister', say: 'He asks to be told when the licence register changes for Chen.' } ] },
 { n: 11, t: 'Building a timeline', who: 'Members; the project owner', wiz: 'Build a timeline' },
 { n: 12, t: 'Following a money trail', who: 'Members; often an accountant', wiz: 'Follow the money' },
 { n: 13, t: 'Exploring connections', who: 'Investigators', steps: [
   { s: 'person', act: null, say: 'From a council member\'s page, Teo chooses "Explore connections".' },
   { s: 'explore', act: 'explore', say: 'He picks the kinds to follow (money, votes, positions) and an end point: the Coliseum lease.' },
   { s: 'explore', act: 'exploreverify', say: 'Each chain shows every step cited and graded; the weakest step sets its grade.' },
   { s: 'explore', act: 'connectionassert', say: 'A declared step is a lead, not evidence. He attaches a source to make it evidence.' },
   { s: 'explore', act: 'promote', say: 'He opens a question from the chain. No finding rests on a declared or hunch step.' } ] },
 { n: 14, t: 'Following a court case or proceeding', who: 'Members; a lawyer member', wiz: 'Follow a proceeding' },
 { n: 15, t: 'From a question to a published case', who: 'Members, often a newsroom; the project owner', steps: [
   { s: 'capture', act: 'acquire', say: 'Dev captures the rent schedules the City Clerk released.' },
   { s: 'held', act: 'release', say: 'He vouches for them, standing behind the copies.' },
   { s: 'project', act: 'promote', say: 'He opens a question. With suggestions switched on, the assistant can suggest some from the documents.' },
   { s: 'question', act: 'cite', say: 'He cites what supports it and what cuts against it.' },
   { s: 'question', act: 'conclude', say: 'He concludes, saying what would change the conclusion.' },
   { s: 'case-editor', act: 'casedraft', say: 'He prepares the case: scope, what it leaves out, the timeline, each person named with the reason.' },
   { s: 'review-copy', act: 'reviewgrant', say: 'He shares a review copy with a housing-law professor (journey 21).' },
   { s: 'ceremony', act: 'caseratify', say: 'He goes through the publication ceremony and signs in the browser. The ceremony is its own required wizard.' },
   { s: 'published', act: null, say: 'Anyone can now read and check the case (journey 26).' } ] },
 { n: 16, t: 'A professional lends expertise', who: 'A professional member; project owners', steps: [
   { s: 'account', act: 'expertisedeclare', say: 'Ana joins like any member and declares "CPA".' },
   { s: 'members', act: 'expertiseconfirm', say: 'Rosa, an administrator, may confirm it. Confirmation gates nothing.' },
   { s: 'question', act: 'owed:checkrequest DEC-135', say: 'Dev asks for a check from someone with accounting expertise; it reaches Ana as a To do.' },
   { s: 'calculation', act: 'recordcheck', say: 'Ana reads the calculation and its inputs and records her check.' },
   { s: 'question', act: null, say: 'Her declared, confirmed expertise shows beside her check, so readers know who looked.' } ] },
 { n: 17, t: 'Working with the assistant', who: 'A member with their own Claude account', steps: [
   { s: 'question', act: null, dock: true, only: 'ai', say: 'Mai opens the assistant panel beside her question. It runs on her own account, only for her.' },
   { s: 'answers', act: 'ruleanswer', only: 'ai', say: 'She asks in plain words. It answers only from what the group holds, says where it looked, and labels its answer as machine work.' },
   { s: 'project', act: 'promote', only: 'ai', say: 'With suggestions on, it suggests a question. She accepts it or not; it never concludes, signs or sends.' },
   { s: 'assistant', act: 'airunclose', only: 'ai', say: 'Her daily limit shows in the panel; she stops a run at any time.' },
   { s: 'answers', act: 'search', only: 'noai', say: 'Without the assistant, "Ask" is "Find and count": a search, and counts that show their method.' },
   { s: 'question', act: null, only: 'noai', say: 'No assistant button, panel or suggestion appears anywhere, and nothing reminds her that one exists.' } ] },
 { n: 18, t: 'Asking a standing question', who: 'A member', wiz: 'Keep asking this',
   noai: 'Without the assistant a member can still keep asking: the search re-runs on schedule and new matches arrive in the queue as a list, unread by any machine (decided in this step).' },
 { n: 19, t: 'The daily queue', who: 'Every member', steps: [
   { s: 'queue', act: null, say: 'Mai opens her queue: To do, Noticed and Status, grouped by case. The one-line explanation shows once.' },
   { s: 'queue', act: 'adoptversion', say: 'A document she cited has a newer version; she adopts it or keeps hers.' },
   { s: 'queue', act: 'reminderanswer', say: 'An office\'s due date passed: said once, with "Overdue".' },
   { s: 'queue', act: 'proposedispose', say: 'An item the machine marked worth a look carries "Hint · machine work", with how it was found and out of how many. She dismisses it with a reason.' },
   { s: 'queue', act: 'queuesnooze', say: 'She snoozes a standing question\'s answer to a local date.' } ] },
 { n: 20, t: 'From a knock to the record', who: 'Someone handing over material; members', steps: [
   { s: 'doorbell', act: 'knock', say: 'Someone with no account hands over three PDFs on the doorbell page, which says exactly what will happen to them.' },
   { s: 'inbox', act: 'inboxpull', say: 'A member reads the inbox and moves the material into the record, or discards it with a reason.' },
   { s: 'inbox', act: 'sourcelink', say: 'She records what becomes known of the source, from "unknown" to "same knocker", never revealing it first.' } ] },
 { n: 21, t: 'A review copy, out and back', who: 'Editors, the owner, an outside reviewer', steps: [
   { s: 'review-copy', act: 'reviewgrant', say: 'Dev grants a named reader a view he can stop at any time.' },
   { s: 'review-copy', act: 'reviewcomment', say: 'The reviewer comments; Dev replies.' },
   { s: 'ceremony', act: 'publish', say: 'Dev revises, then publishes, naming the draft that was reviewed.' } ] },
 { n: 22, t: 'From suspicion to a closed plan', who: 'Members; offices, reporters, counsel', steps: [
   { s: 'question', act: 'planopen', say: 'While the question is still young, Dev opens a plan from it.' },
   { s: 'plan', act: 'optionadd', say: 'He adds options. With his own account he may also ask for suggestions, which wait in a tray.' },
   { s: 'plan', act: 'optionadopt', only: 'ai', say: 'He adopts one of the assistant\'s suggestions; it is labelled as adopted from machine work.' },
   { s: 'plan', act: 'optiondispose', say: 'He chooses the records request and declines the complaint, each with a reason.' },
   { s: 'plan', act: 'scenarioset', say: 'He lays out a scenario with a checkpoint a member will judge.' },
   { s: 'start-send', act: 'optionstart', say: 'He starts the option. The start-and-send wizard can walk it (see Wizards).' },
   { s: 'action', act: 'actioncorrespond', say: 'Replies and due dates show as met, met late or overdue.' },
   { s: 'matter', act: 'declinetoescalate', say: 'For a determined breach he advances, or declines saying why not now.' },
   { s: 'plan', act: 'planclose', say: 'He records the outcome and closes the plan.' } ] },
 { n: 23, t: 'A source changes after publishing', who: 'Members; readers', steps: [
   { s: 'queue', act: 'adoptversion', say: 'Monitoring notices a changed source; the queue shows which findings it affects.' },
   { s: 'case-editor', act: 'casedraft', say: 'The owner reopens the case and prepares a new edition.' },
   { s: 'docket', act: 'docketpost', say: 'The old edition stays; the correction is on the docket.' } ] },
 { n: 24, t: 'Complying with a court order', who: 'The project\'s owner', steps: [
   { s: 'capture', act: 'acquire', say: 'The owner captures the order like any document.' },
   { s: 'docket', act: 'docketpost', say: 'She signs a docket entry naming it.' },
   { s: 'ceremony', act: 'publish', say: 'She publishes the edition stamped with what was sealed and why. Complied with openly, never silently.' } ] },
 { n: 25, t: 'Exchanging cases with other groups', who: 'Members; partner groups', wiz: 'Use another group\'s case' },
 { n: 26, t: 'Reading and checking a case', who: 'Public readers, reporters, officials', steps: [
   { s: 'published', act: null, say: 'A stranger opens the public page: the group\'s name at the head, "Made with Civicsmith" at the foot.' },
   { s: 'published', act: null, say: 'Each finding shows its two strengths in plain words; the timeline in two lanes; each person named with why they matter.' },
   { s: 'published', act: 'verify', say: 'She checks the signature, or recreates the case with the open checker, without the group\'s help.' } ] },
 { n: 27, t: 'Changing the administrators', who: 'Administrators', steps: [
   { s: 'members', act: 'memberset', say: 'Rosa proposes a second administrator.' },
   { s: 'members', act: 'adminendorse', say: 'Administrators endorse; a refusal explains the arithmetic. Only the last administrator is stopped from stepping down.' } ] },
];
/* expand a journey into its steps for the path chosen (ai true or false) */
function journeySteps(j, ai) {
  if (j.wiz) {
    const w = LIB.find(x => x.name === j.wiz);
    const st = w.versions[0].steps;
    return st.map((x, i) => ({ s: x.screen, act: x.act, say: '', wizard: { name: w.name, i: i + 1, n: st.length, what: x.what, why: x.why, via: x.via, draft: x.draft, act: x.act } }));
  }
  return j.steps.filter(x => !x.only || (x.only === 'ai') === ai);
}
