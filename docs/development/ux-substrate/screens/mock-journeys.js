/* The twenty-seven journeys of step 3 (journeys.html), and journey 28 (DEC-201: the founder's link to a new member's first work), walked through the mockups. A journey either walks a wizard from
   the library (its steps are the script's, unchanged) or lists its own steps. Each step: s (screen), act (the control
   it points at, an op of that screen), say (what happens, in Bob's words), only ('ai' or 'noai': a step that exists on
   one path only), alt (what the member without the assistant does instead), dock (open the assistant panel), v (the screen's variant, as "Find in this"'s scope). */
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
   { s: 'home', act: 'startfrom', say: 'Mai opens the group\'s home and picks "A problem I live with".' },
   { s: 'notes', act: 'notewrite', say: 'She writes the problem in her own words, in a note only she can see.' },
   { s: 'capture', act: 'testify', say: 'She records what she has seen on Seminary Avenue: where, when, and a photo.' },
   { s: 'answers', act: 'ask', only: 'ai', say: 'She asks the assistant what standard the city set itself. It quotes Administrative Instruction 4.12 from what the group holds, as legal information.' },
   { s: 'finder', act: 'search', only: 'noai', say: 'She searches what the group holds for "pothole" and finds the city\'s own instruction, section by section.' },
   { s: 'find-in', act: 'findin', v: 'doc', say: 'On the instruction she uses "Find in this" for dates, deadlines and requirements. It lists "within seven calendar days" at passage 3, found by search.' },
   { s: 'standard', act: 'standarddeclare', say: 'She holds the seven-day rule as a standard the city must meet.' },
   { s: 'project', act: 'promote', say: 'She turns the problem into a question the record can answer, in the Pothole repairs project.' },
   { s: 'request', act: 'addresseesuggest', say: 'The records she needs are not public, so she asks for them (journey 7).' } ] },
 { n: 7, t: 'Getting a record: find it, or ask for it', who: 'A member, often a newcomer', wiz: 'Get a record',
   noai: 'The request\'s text comes from the group\'s own template instead of the assistant\'s draft. Every other step is the same.' },
 { n: 8, t: 'Checking a deadline\'s basis', who: 'Any member', steps: [
   { s: 'action', act: null, say: 'Mai opens her request and sees "Response due 14 October".' },
   { s: 'due-date', act: 'clockpropose', say: 'She opens "How was this worked out?": the law, the receipt date, the days counted, the holiday skipped.' },
   { s: 'due-date', act: 'clockadopt', say: 'She confirms it in one act. If the law left the day uncertain, both dates would show as "Undetermined, because…".' },
   { s: 'queue', act: null, say: 'Later the queue shows it met, met late or overdue: facts, never legal advice.' } ] },
 { n: 9, t: 'Checking a claim about the city\'s performance', who: 'Members; often an analyst or accountant', wiz: 'Check a claim' },
 { n: 10, t: 'Following a person', who: 'Any member; often an investigator or reporter', steps: [
   { s: 'document', act: 'identityclaim', say: 'Dev meets a name in the repair policy: L. Chen, Director of Public Works.' },
   { s: 'find-in', act: 'recordpersonfact', v: 'project', say: 'He uses "Find in this project" for people and offices: L. Chen is named in 6 of its 14 documents, each with its passage. Nothing is recorded until he records it.' },
   { s: 'people', act: 'search', say: 'He opens People and searches for “Chen”: L. Chen is listed under his projects, named in 14 documents, 2 questions and 1 project.' },
   { s: 'person', act: 'person', say: 'He opens the person\'s page: positions over time, each dated and cited.' },
   { s: 'person', act: 'recordpersonfact', say: 'He adds a fact from a captured document: a license from the state register.' },
   { s: 'person', act: 'identityclaim', say: '"Lin Chen" in the 2019 minutes: he records "claimed the same person, grade B, because…". Records are linked, never merged.' },
   { s: 'person', act: null, dock: true, only: 'ai', say: 'He asks the assistant whether Chen held other posts; it answers from what the group holds and says where it looked.' },
   { s: 'person', act: 'followregister', say: 'He asks to be told when the license register changes for Chen.' } ] },
 { n: 11, t: 'Building a timeline', who: 'Members; the project owner', wiz: 'Build a timeline' },
 { n: 12, t: 'Following a money trail', who: 'Members; often an accountant', wiz: 'Follow the money' },
 { n: 13, t: 'Exploring connections', who: 'Investigators', steps: [
   { s: 'people', act: 'explore', say: 'Teo opens People. J. Ortega, the council member for District 3, is listed under his projects, named in 9 documents, 2 questions and 1 project. On his row Teo chooses "Explore connections".' },
   { s: 'explore', act: 'explore', say: 'He picks the kinds to follow (money, votes, positions) and an end point: the Coliseum lease.' },
   { s: 'explore', act: 'exploreverify', say: 'Each chain shows every step cited and graded; the weakest step sets its grade.' },
   { s: 'explore', act: 'stepsource', say: 'A declared step is a lead, not evidence. He attaches a source to make it evidence.' },
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
   { s: 'question', act: 'checkrequest', say: 'Dev asks for a check from someone with accounting expertise; it reaches Ana as a To do.' },
   { s: 'calculation', act: 'recordcheck', say: 'Ana reads the calculation and its inputs and records her check.' },
   { s: 'question', act: null, say: 'Her declared, confirmed expertise shows beside her check, so readers know who looked.' } ] },
 { n: 17, t: 'Working with the assistant', who: 'A member with their own Claude account', steps: [
   { s: 'question', act: null, dock: true, only: 'ai', say: 'Mai opens the assistant panel beside her question. It runs on her own account, only for her.' },
   { s: 'answers', act: 'ask', only: 'ai', say: 'She asks in plain words. It answers only from what the group holds, says where it looked, and labels its answer as machine work.' },
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
   { s: 'queue', act: 'queuesnooze', say: 'She snoozes a standing question\'s answer to a local date.' },
   { s: 'queue', act: 'owed:updatelater K3158', say: 'Rosa, an administrator, also sees "An update is ready": the release, its date and a security mark. She opens what changes, or puts it aside with Not now.' },
   { s: 'updates', act: 'owed:updatestart K3158', v: 'holder', say: 'On Settings › Updates she reads the signed release notes in three parts and chooses Update, which opens the installer\'s page set to that release. An administrator without the Cloudflare account copies the link for whoever holds it instead.' } ] },
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
   { s: 'plan', act: 'optionadopt', only: 'ai', say: 'He adopts one of the assistant\'s suggestions; it is labeled as adopted from machine work.' },
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
 { n: 28, t: 'From civicsmith.org to a new member\'s first work', who: 'The founder, then a new member (DEC-201; Bob\'s K3053)', steps: [
   { s: 'site', v: 'home', act: null, say: 'Rosa hears about Civicsmith from a tenants\' group across town and opens civicsmith.org. She reads what it is, opens a case another group published, and sees that her group would hold its own work.' },
   { s: 'site', v: 'start', act: null, say: 'On “Start your group” she reads what the group needs: a Cloudflare account on Workers Paid, twenty minutes, no Claude account. The association agrees its treasurer opens the Cloudflare account in the group\'s name, with Rosa added. Then she chooses “Create your group”.' },
   { s: 'install', v: 'start', act: 'bootstrap', say: 'The installer asks two things. She picks the short name lakeshore-tenants, reads that it is permanent, and chooses Oakland as the group\'s place.' },
   { s: 'install', v: 'cloudflare', act: 'bootstrap', say: 'She reads what Cloudflare will ask her to allow, and that whoever holds the Cloudflare account controls the group\'s Civicsmith. She goes to Cloudflare\'s own page, signs in there and allows it.' },
   { s: 'install', v: 'progress', act: null, say: 'Back from Cloudflare, she watches each step finish in plain words. Had one stopped it, the page would say why, what to do, and that nothing was created.' },
   { s: 'install', v: 'done', act: null, say: 'The checks pass, run by the installer as part of installing. She saves the one-time password in her password manager and continues to her group\'s address.' },
   { s: 'setup', act: 'claim', say: 'The one-time password is already filled in. She chooses her own password and claims: she is the group\'s first administrator.' },
   { s: 'setup', act: 'recoverycodesissue', say: 'She saves her ten recovery codes, shown once: her way back in if she ever loses her password.' },
   { s: 'setup', act: 'groupnameset', say: 'She names the group, decides how members reach the assistant, and finishes. “Open your group\'s Civicsmith” takes her in.' },
   { s: 'home', v: 'newgroup', act: null, say: 'Her group\'s home says nothing is here yet, and offers inviting members and saying who the group is.' },
   { s: 'members', act: 'memberadd', say: 'She makes an invitation link for Mai, with the cover the group knows her by, and sends it herself: Civicsmith sends no email.' },
   { s: 'join', v: 'free', act: 'enroll', say: 'Mai opens the link. She chooses her language, a handle (mai-k is free) and a password, and joins. She is signed in.' },
   { s: 'home', v: 'firstvisit', act: null, say: 'Her home offers the guided welcome she began when she joined. She continues it.' },
   { s: 'account', act: 'expertisedeclare', say: 'In her account she checks her language and declares that she interprets Spanish and English, so members can ask her to check work in that field.' },
   { s: 'home', act: 'startfrom', say: 'Back on Home she answers “What happened?” with “A problem I live with”.' },
   { s: 'capture', act: 'testify', say: 'Her first piece of work: she records what she saw on Seminary Avenue, where and when, with a photo. It is her testimony, labeled as hers.' },
   { s: 'account', act: 'signout', say: 'At the end of the day she signs out on the library computer she used.' },
   { s: 'front', v: 'signedout', act: 'login', say: 'Next morning, on her own phone, she opens the group\'s address, signs in, and keeps herself signed in on that phone.' } ] },
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

/* Each journey's purpose and front door (the journeys page of step 3, folded in on 13 October 2026; updated for later rulings).
   Shown under the journey's title in the viewer; the walked steps below it are the journey's steps. */
const JBRIEF = {
 1: ["A group installs its own Civicsmith, claims it, says who it is, and sets up its administrators.", "civicsmith.org: “Start your group” says what a group needs, and “Create your group” opens the installer, which asks two things; setup follows from its last page."],
 2: ["A group says what kind of group it is and what moved its members to start it, so Civicsmith can welcome each member in a way that fits.", "Offered as an optional side trip at the end of the setup wizard, returning to setup when done; also run on its own at any time from the group's settings. Never required."],
 3: ["From an invitation link to a member's first useful act.", "An invitation link (from an administrator or the group's website) or the group's join link, opening in the member's chosen language; the welcome wizard picks up from there."],
 4: ["A member who wants the assistant connects their own Claude account. It serves only them; nothing is shared with the group.", "\"Connect your Claude account\" in the assistant panel, or a side trip from the welcome wizard."],
 5: ["A member tells the group about their own ties to anyone it may look into, so a case can disclose them honestly while the member stays safe.", "\"Your ties\" in the member's own settings; also asked at the publication ceremony."],
 6: ["Someone joins because something in their life isn't working. Civicsmith helps turn that frustration into a question about the city's own standards that the record can answer.", "Home asks “What happened?”; describing a problem in one's own words is a complete first step."],
 7: ["Getting a government record: often it is already public and only needs finding; when it is not, asking the office for it under the law that requires it to answer.", "The most common first action a newcomer takes, so it gets its own wizard, which looks for the record before asking for it."],
 8: ["Every due date can say where it comes from and how it was counted, so a member can trust it, or challenge it.", "\"How was this worked out?\" on any due date."],
 9: ["The city says it filled 90% of reported potholes this year. Is that true? Civicsmith holds the claim, the city's own records, members' spot-checks and the calculation together, so anyone can check the answer.", "Most members start with \"is that really true?\"; capturing the claim is a complete first step."],
 10: ["Who holds a post, what they decided and signed, their career, credentials, memberships and interests, each fact dated and cited.", "People, a name in a document, a vote in the minutes, or a council seat: each opens the person's page."],
 11: ["What happened, in order: what the city and others did, and what the group did, in two lanes never mixed.", "\"Timeline\" on any project, person, proceeding or contract."],
 12: ["Where money comes from and where it goes: budgeted, adopted, committed, paid, across years and relabelling, with the rules that govern it.", "A budget line, a transfer in the annual financial report, a contract amount."],
 13: ["Connections are the heart of an investigation: following a chain from a donor to a vote to a contract to a payment, each step cited and graded.", "“Explore connections” on a person's page, on any row of People, or on a fund, contract or proceeding page."],
 14: ["A lawsuit, a grand-jury report or a regulatory proceeding: its parties, its register of filings, its orders and their deadlines.", "\"A court case or legal proceeding\" under \"Start from…\"."],
 15: ["The core of Civicsmith: evidence gathered, a question answered, a case signed and published.", "Capturing one document or recording one observation needs nothing else first."],
 16: ["A lawyer, accountant, auditor, engineer or journalist joins, says what they know, and is asked to check work in their field.", "Declaring expertise is one field at joining; everything else is the ordinary member's path."],
 17: ["Asking the assistant to find, read, answer and check, and deciding what to keep.", "Opening the panel and asking in plain words, once the member's own Claude account is connected (journey 4) or the group offers its API key. A member reached by no account uses Civicsmith without the assistant: every journey stays open, with the assistant's steps left out."],
 18: ["A member asks Civicsmith to keep checking a question for them until a date, and is told once when something new turns up.", "\"Keep asking this\" after an answer."],
 19: ["What is waiting on a member today, in one list.", "The queue opens with a one-line explanation of its three kinds, shown once."],
 20: ["Material handed in through the group's doorbell becomes evidence, or is set aside.", "The doorbell page is the whole journey for the outsider: one page, plain words."],
 21: ["Showing a draft case to named outsiders before publishing.", "The reviewer needs no account and is told plainly what they are reading and for how long."],
 22: ["Deciding what to do about a problem, doing it, following it to an outcome, and closing the plan.", "A plan can be opened from any question with one act; the plan page explains itself."],
 23: ["A document a published case rests on changes or disappears, or a law it relies on is amended.", "Members meet this only through the queue; nothing new to learn."],
 24: ["A court orders the group to remove, redact, seal or unseal something it published. The group complies openly, never silently.", "The order itself, captured like any document."],
 25: ["Work flows both ways: this group brings in, checks and builds on other groups' cases, and other groups do the same with this group's.", "Importing from a link is one act; the read-only band says whose case it is."],
 26: ["A stranger reads a published case, understands its strength, and checks it for themselves.", "The public page explains itself from zero; nothing assumes an account."],
 27: ["Adding a third administrator, or removing one.", "Administrators only."],
 28: ["From civicsmith.org to the group's Civicsmith running, and on to a new member's first piece of work, with no break between them.", "civicsmith.org; then the invitation link the founder sends."],
};
