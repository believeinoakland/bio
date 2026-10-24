# The Civicsmith wizard library (design phase step 5, DEC-139; DEC-121 (9): written by the UX stream, approved by Bob).
# Each script follows wizard-scripts R1 and R2: a step is {screen, act, what, why, draft?}; `what` and `why` are 1-300
# characters; a draft is {text}, {template} or {machine: op}, always shown labeled; no step presses, signs or sends.
# `act` names the control the step points at (null: the step explains the screen). Side trips (`via`) start another
# wizard and return to the step left. Places, laws and venues never appear here (K1): they come from the team's profile
# and its own templates (`{template: "@…"}` names the kind of template the team's library offers).
import hashlib
L = []
# DEC-281: a script keeps the id its first name gave it when the name is reworded ("group" became "team", K3472)
FIRST_NAME = {"Say who your team is": "Say who your group is", "Update your team's Civicsmith": "Update your group's Civicsmith",
              "Use another team's case": "Use another group's case", "Comment for the team": "Comment for the group"}
def wiz(name, start, required, steps, journeys, note=''):
    sid = 'WIZ-' + hashlib.sha256(('civicsmith:' + FIRST_NAME.get(name, name)).encode()).hexdigest()[:16]
    out = []
    for st in steps:
        d = dict(screen=st[0], act=st[1], what=st[2], why=st[3])
        if len(st) > 4 and st[4]: d.update(st[4])
        out.append(d)
    L.append(dict(id=sid, origin='civicsmith', scope='group', name=name, start=start, required=required, journeys=journeys, note=note,
                  versions=[dict(version=1, state='draft', steps=out)]))

wiz('Set up and claim', 'install', True, [
 ('install', None, 'Check you have what is needed: a Cloudflare account on the Workers Paid plan ($5 a month, with a payment method) and about twenty minutes.', 'Civicsmith uses parts of Cloudflare that only the paid plan includes. No Claude account is needed to set up.'),
 ('install', 'bootstrap', 'Choose your team\'s short name, then install. It is not the team\'s name: you choose that next, and can change it.', 'The short name is the fixed label in your addresses and beside every signature, and can never change. A team that wants to stay unnamed picks one that reveals nothing.'),
 ('install', None, 'Your team\'s Civicsmith tests itself as part of installing; the finished panel shows what passed. Allow it to run its file scanner if you are asked.', 'The test proves it works before anyone relies on it. The installer keeps nothing once it hands over, so the checks are run then, not later.'),
 ('install', None, 'Save the one-time password somewhere safe, such as a password manager, then continue.', 'It is shown once, and it is how you become the first administrator. Continuing fills it in; if it is lost before you claim, whoever can sign in to the Cloudflare account can set a new one.'),
 ('setup', 'claim', 'Make it yours: with the one-time password (already filled in if you came straight from the installer), choose your handle and your own password, and claim.', 'Only the person holding the one-time password can become the first administrator. Once you claim, it is spent.'),
 ('setup', 'groupnameset', 'Open “Your team”: type its name as people should read it, and add its logo if it has one.', 'The team\'s name heads everything it publishes and can change at any time; the short name you chose at install stays fixed in addresses and signatures.'),
 ('setup', 'groupdomainset', 'If your team has a website of its own, choose “Yes” and verify its address: put the small file Civicsmith gives you on the site.', 'Readers can then confirm that a published case really comes from your team. The public page names the site, so a team that wants to stay unnamed skips this.'),
 ('setup', 'profilesset', 'Open “Where your team works”: choose your place, and the languages your members read.', 'Deadlines, holidays and offices come from these places, never from Civicsmith itself. If yours is not listed, choose Other: everything else works, and you enter due dates yourself.'),
 ('setup', 'officesseed', 'Open “The officials you deal with”: check the offices and who holds them, then confirm the list. Each is marked with where it came from.', 'Requests go to offices by role, so correct anything before members rely on it.'),
 ('setup', None, 'Open “Privacy and the law” and read who will see facts about people.', 'Facts from public documents follow those documents; a project\'s own notes about a person stay inside the project.'),
 ('setup', 'aikeepaway', "Open “The AI assistant”, read what it is, then choose whether your team uses it. Choosing “No” keeps the team's material away from AI and hides the rest.", "Any member may connect their own Claude account unless you keep the material away from AI; then members see who chose it and your reason. Everything works without the assistant."),
 ('setup', 'groupkeyset', 'If your team will pay for the assistant, choose “Your team, with one API key” and paste the key. It is never shown again.', 'It serves every member with no account of their own; each is told once, before their first question, that it goes to Anthropic under the team\'s account. Leave it empty and members bring their own.'),
 ('setup', 'courtnoticeset', 'In “Privacy and the law”, choose whether members are told what a court can reach.', 'A court order your team cannot defeat can require anything not public to be shown. Some teams want every member told; the explanation is always one tap away.'),
 ('setup', 'hostingaccessset', 'In “A second administrator”, record who holds the hosting account.', 'If you are ever unreachable, this is how the team gets back in.'),
 ('setup', 'memberadd', 'Invite a second administrator, now or later; your first members come after.', 'With one administrator the team depends on one person. A second means it is never stuck.'),
 ('group-identity', None, 'Optional: say who your team is. You will come back here when you finish or stop.', 'It shapes how each member is welcomed. It locks nothing and is never required.', {'via': 'Say who your team is'}),
], [1, 2])

wiz('Welcome a new member', 'join', True, [
 ('join', 'memberlanguageset', 'Choose your language.', 'Everything that follows should be in words you read easily. It starts from your device\'s setting.'),
 ('join', 'enroll', 'Choose a handle and a password.', 'The record shows your handle on your work. It needn\'t be your legal name: a known name lends credibility, a pen name shields you, and administrators still know who you are.'),
 ('home', None, 'This is your team\'s home: what it is working on, and what is waiting on you.', 'Come back here whenever you lose your place.'),
 ('question', None, 'Here is your team\'s most recent question. Two things to know first: its strength against its project\'s bar, and "Undetermined".', 'You will see these everywhere. Every other mark is explained where you meet it, one tap away.'),
 ('connect', None, 'Optional: connect your own Claude account, or skip.', 'The assistant serves only you, and every journey works without it.', {'via': 'Connect your Claude account'}),
 ('ties', None, 'Optional: tell the team about your own ties.', 'Only you and the administrators see them, and they let a case disclose a tie honestly.', {'via': 'Your ties'}),
 ('home', 'startfrom', 'Take a first step: join a project, capture a document, or record what you saw.', 'One small act is enough to begin. Nothing here has to be done in order.'),
], [3], note='Final words once the redesign has settled (DEC-91).')

wiz('Publication ceremony', 'ceremony', True, [
 ('ceremony', 'publishpreflight', 'Check what you are publishing: the case, its edition and its scope.', 'Publishing is permanent. This is the last look before it.'),
 ('ceremony', 'publishpreflight', 'Check each finding\'s strength against the bar, and anything still open.', 'A reader sees each finding\'s strengths. Anything still open is disclosed, never hidden.'),
 ('case-editor', 'statementack', 'Read what the case leaves out, and who acknowledged it.', 'Saying what a case does not cover is part of its honesty.'),
 ('case-editor', 'attribute', 'Check each person the case names, with the reason they matter to a finding.', 'A case cannot be signed while any reason is missing.'),
 ('ceremony', 'obscuremark', 'Check each photo the case relies on: mark anyone in it who is not part of a finding, and any number plate.', 'The public copy shows them obscured and says so; the original stays inside the team.'),
 ('ceremony', 'publishtensions', 'Read what will be disclosed: the timeline as it stands, and any calculation that differs or is not tied to the record.', 'Readers must see what the case could not settle.'),
 ('ceremony', None, 'Read the team\'s declared bias as it will appear.', 'Every published case carries the lens it was made through.'),
 ('ceremony', None, 'Preview the public page as a stranger will see it.', 'This is how a reader with no account meets your work.'),
 ('ceremony', 'publish', 'Confirm you have no undeclared tie to anyone the case concerns, and prepare the edition for signing.', 'Including anyone paid in its money. Your confirmation goes inside what you sign. A tie disclosed is a strength; one found later is not.'),
 ('ceremony', 'caseratify', 'Choose when it becomes public, enter your password again, and sign: your device asks you once to confirm with your key, for the edition, its findings and their evidence together.', 'Only you can sign, and Civicsmith never sees your key. Publishing is permanent; corrections come as a new edition, never by changing this one.'),
 ('ceremony', 'publishat', 'To publish later, sign now with “Sign and publish at…”, such as when a story citing it runs.', 'At that time Civicsmith checks again; if anything changed since you signed, it holds the case and tells you. You can cancel or move the time until then.'),
], [15, 24])

wiz('Get a record', 'finder', False, [
 ('finder', 'search', 'Look first: is the record already public? Search what your team holds and where the office publishes.', 'Much is public already. A copy from the office\'s own site holds up better than one found elsewhere.'),
 ('capture', 'acquire', 'If you find it, capture it from its address. Then you are done.', 'Capturing keeps a fingerprinted copy that cannot change under you.'),
 ('request', 'addresseesuggest', 'If not, choose the office that holds the records.', 'The request goes to the office by its role, so it reaches whoever holds the post that day. You will see who that is.'),
 ('request', 'actioncreate', 'Say plainly what records you want.', 'A clear description is harder to refuse, or to answer only in part.'),
 ('request', 'actionlaws', 'Choose the law the request goes under, from your team\'s places.', 'The law sets the office\'s deadline. Where a faster kind of request fits, it is offered.'),
 ('request', 'communicationprepare', 'Read the draft request and edit it until it is yours.', 'The wizard only drafts. The words that are sent are yours.', {'draft': {'template': '@records-request'}}),
 ('request', 'filingapprove', 'Approve the text.', 'Approving is kept apart from sending, so you can stop between them.'),
 ('request', 'filingrecordsent', 'Send it the way the office accepts requests, then record that you sent it.', 'Sending tells the office what your team is looking at. Recording the send starts the clock.'),
 ('due-date', 'clockadopt', 'Confirm the due date worked out from the law. Download it to your calendar if you like.', 'You can see exactly how it was counted, and challenge it.'),
], [7, 8])

wiz('Check a claim', 'capture', False, [
 ('capture', 'acquire', 'Capture the claim where the city made it: a budget, a report to council, a press release.', 'The claim itself is your first piece of evidence.'),
 ('document', 'cite', 'Point at the words that make the claim.', 'Every later step refers back to exactly what was said.'),
 ('project', 'promote', 'Open the question: do the city\'s own records support the claim?', 'A claim cannot be checked; a question can be answered, or shown undetermined.'),
 ('question', 'narrow', 'Pin down what the claim\'s words mean: what counts, and over what period. If the city never says, record that.', 'A share means nothing until you know what was counted. A gap is recorded as undetermined, with its reason.'),
 ('finder', 'search', 'Get the city\'s own records behind the claim: online, or by request.', 'The claim should be checked against the city\'s own data, not anyone\'s impression.', {'via': 'Get a record'}),
 ('calculation', 'calculationcreate', 'Work it out with the built-in calculation, or bind your own spreadsheet to the captured records.', 'The method is shown with the result, so anyone can check it.'),
 ('calculation', 'calculationdraw', 'Plan a spot-check: a recorded random draw picks which records members visit.', 'A draw anyone can repeat means no one can say you picked the worst cases.'),
 ('capture', 'testify', 'Members visit and record what they find, with place and date, and a photo where they can take one.', 'Firsthand checks test whether the records match the street.'),
 ('question', 'conclude', 'Conclude with what the evidence supports, and say what would change it.', 'A conclusion that names what would change it is one others can trust.'),
], [9])

wiz('Your first question', 'project', False, [
 ('project', None, 'What drew you in? A problem you live with, a person, a payment or contract, or something you read.', 'Any of these is a good start. Civicsmith offers a first step from each.'),
 ('project', 'promote', 'Say what you want to know, as a question.', 'A question is something the record can answer: yes, no, or undetermined, and why.'),
 ('finder', 'search', 'Find or capture a document that bears on it.', 'Every answer rests on documents anyone could check.'),
 ('document', 'cite', 'Point at the passage that matters.', 'Citing a passage, not a whole document, shows exactly what you rely on.'),
 ('question', 'cite', 'Say whether it supports the question or cuts against it.', 'Evidence against is kept as carefully as evidence for.'),
 ('question', None, 'See the question\'s strength against the project\'s bar, and what would raise it.', 'Strength is two grades, never one score: how well the documents are held and how firmly they are linked.'),
], [6, 15])

wiz('Say who your team is', 'group-identity', False, [
 ('group-identity', 'groupdescriptionset', 'What kind of team are you? Pick one or more, or describe your own.', 'It shapes how each member is welcomed. It never limits what anyone can do.'),
 ('group-identity', 'groupdescriptionset', 'What do you focus on: issues, places, offices or agencies?', 'New members see your focus first when they choose where to start.'),
 ('group-identity', 'groupdescriptionset', 'Why does the team exist? Say it in your own words.', 'Your declared bias can start from what you write here.'),
 ('group-identity', 'groupdescriptionset', 'Who should see this: members only, or also your public page and the network directory?', 'Members only is the default. A team that wants to stay unnamed keeps it that way.'),
], [2])

wiz('Invite a member', 'members', False, [
 ('members', 'memberadd', 'Who: a short id for the invitation, and the cover the team knows them by. Not a legal name.', 'They choose their own handle when they join. The record never needs a legal name; administrators keep the cover so they know who is who.'),
 ('members', 'membercaps', 'What they may do. Contributing is the default.', 'Give only what the person needs; you can change it later.'),
 ('members', None, 'Send the link yourself. It works once and expires after seven days.', 'Civicsmith sends no email, so the link reaches them only through you.'),
 ('members', 'websitekeycreate', 'Or let people join through your website: create a website key, or turn on the reusable join link.', 'Anyone let through can see the team\'s shared work, so each comes with limits and a daily cap.'),
], [3, 27])

wiz('Update your team\'s Civicsmith', 'updates', False, [
 ('updates', None, 'Read what changes: the signed release notes say what members will see, what administrators will see, and anything an administrator must do.', 'The notes are signed with the release itself, so what you read is what Civicsmith published.'),
 ('updates', 'owed:updatestart K3158', 'Choose Update if you hold your team\'s Cloudflare account. If not, copy the link and pass it to whoever does. Not now and Skip this version are the other choices.', 'Only Cloudflare\'s consent, given by the account\'s holder, lets a new release in. Your team\'s Civicsmith cannot rewrite itself.'),
 ('update', 'bootstrap', 'On the installer\'s page, check the release running and the release chosen, then continue to Cloudflare and allow the update.', 'If a step stops, your team\'s Civicsmith keeps running as it was; the stop says what to do.'),
], [19])

wiz('Connect your Claude account', 'connect', False, [
 ('connect', None, 'The assistant is optional. If your team offers its API key, you can use it already; your own account, if you connect one, always comes first.', 'Your own account serves only you. Everything works without the assistant.'),
 ('connect', 'disclosureshown', 'Read what connecting means.', 'Your questions, and what is read to answer them, go to Anthropic under your own account.'),
 ('connect', 'subscriptionsignin', 'To connect your Claude subscription, open Anthropic\'s sign-in page, sign in and approve. Or use an API key, or skip.', 'You sign in on Anthropic\'s own page; Civicsmith never sees your Claude password. Skipping is a real choice: every journey stays open.'),
 ('connect', 'subscriptionsignin', 'Copy the code Anthropic\'s page shows you, paste it under "The code from Anthropic\'s page", and connect with it.', 'The code is used once and never kept. Your subscription then serves only your own questions, and you can disconnect at any time.'),
 ('connect', 'accountreferenceset', 'Using an API key instead? Paste it under "Using an API key instead" and connect with it.', 'Anthropic bills you for each use of your own key; it serves only your questions.'),
 ('connect', 'ailimitset', 'Set a limit on your account, if you want one: for everything or for one use, a day or a month.', 'It binds only your own account. The team\'s and a project\'s limits never bind it.'),
 ('connect', 'accountusesset', 'Choose what your account pays for, and whether the assistant may suggest things without being asked. Suggestions are off unless you turn them on.', 'Some members want suggestions; others want quiet.'),
 ('connect', 'subscriptiondisconnect', 'You can disconnect at any time, here: your subscription, or your API key.', 'Disconnecting removes the sign-in or the key from your team\'s Civicsmith.'),
], [4, 17])

wiz('Your ties', 'ties', False, [
 ('ties', 'declaretie', 'List your employer, relatives, and businesses you have an interest in.', 'A case concerning any of them can then disclose the tie honestly.'),
 ('ties', None, 'Only you and the administrators can see this.', 'Your ties never appear in a case unless one concerns it, and then only as you choose.'),
 ('ties', 'declaretie', 'For each tie, choose how a published case discloses it when the case concerns them: naming you by your handle, or as “a member of the team”.', 'Readers learn of the tie either way; not naming you protects you while keeping the case honest.'),
], [5])

wiz('Follow a proceeding', 'capture', False, [
 ('capture', 'acquire', 'Capture a filing, or the court\'s register page.', 'The proceeding is registered from what it says about itself.'),
 ('proceeding', 'entitycreate', 'Register the proceeding from its caption: the court, the number, and a neutral label.', 'A neutral label keeps your own view out of the record\'s name for it.'),
 ('proceeding', 'recordline', 'Add the parties by role.', 'Roles say who is suing, who is sued, and who is deciding.'),
 ('proceeding', 'followregister', 'Follow its register: on a schedule, or by your own capture where the register needs a login.', 'New filings are flagged, so nothing arrives unseen.'),
 ('proceeding', 'declare', 'Hold each order\'s requirements as obligations, with their reply dates.', 'An order is a standard the office must meet. Its dates go into your queue.'),
], [14])

wiz('Follow the money', 'capture', False, [
 ('capture', 'acquire', 'Capture the budget, financial report or contract.', 'Every figure must point back to where it was printed.'),
 ('money', 'recordfact', 'Read just the figures you need, each with its stage and period.', 'Proposed, adopted, committed and paid are different facts. Mixing them is how money stories go wrong.'),
 ('money', 'createset', 'Start a money trail.', 'A trail gathers the figures one question needs.'),
 ('money', 'include', 'Include or leave out each item, with a reason.', 'Your reasons show a reader why the trail adds up the way it does.'),
 ('money', 'reconcile', 'Compare two sources of one figure, or what was committed against what was paid.', 'Differences in basis, period or rounding are named, not hidden.'),
], [12])

wiz('Build a timeline', 'timeline', False, [
 ('timeline', 'createevent', 'Record an event from a cited passage: what, when, and how precisely you know the date.', 'Every event points at its source. A date you only know roughly is recorded as rough.'),
 ('timeline', 'addparticipant', 'Add who took part and in what role: decided, signed, voted.', 'Roles are what make an event useful to a finding.'),
 ('timeline', 'relate', 'Link events: made under, answered, amended.', 'Links let a reader follow one thread through the record.'),
 ('timeline', 'hypothesishold', 'Keep a suspected cause as a hunch, never as a fact.', 'A hunch is marked as yours and is never evidence.'),
 ('timeline', None, 'Review the two lanes before the case is signed: what they did, and what we did.', 'The timeline is frozen into the case when it is signed.'),
], [11])

wiz('Keep asking this', 'answers', False, [
 ('answers', 'standingquestionset', 'Choose how often to check, and until when.', 'An end date is required, so no question runs forever.'),
 ('answers', None, 'The search runs on schedule. With the assistant connected, it reads only what is new, on your account and within your limit.', 'Without the assistant, new matches arrive as a list for you to read.'),
 ('queue', None, 'The answer reaches your queue once.', 'Only you see it; it is never shared.'),
 ('answers', 'standingquestionend', 'Stop it any time.', 'Stopping is immediate, and nothing further is checked.'),
], [18])

wiz('Use another team\'s case', 'imported', False, [
 ('imported', 'caseimport', 'Import the case into its own read-only project.', 'Another team\'s work stays marked as theirs, and cannot be edited.'),
 ('imported', None, 'Civicsmith recreates each finding and calculation from the case file. Watch each one\'s mark.', 'Recreated, recreated in part, or did not recreate: you never rely on what you could not check.'),
 ('imported', 'importaccept', 'Accept what recreated, with a reason.', 'Accepting names one edition and changes no grade.'),
 ('imported', 'importwatch', 'Watch the publisher\'s docket for new editions and corrections.', 'Anything relying on the case is told when it changes.'),
], [25])

wiz('Translate the interface', 'translations', False, [
 ('translations', None, 'Choose the language.', 'Civicsmith\'s own translations come with releases. Your team fills gaps and improves wording.'),
 ('translations', None, 'See the words still untranslated.', 'A missing word shows in English, never blank.'),
 ('translations', 'translationdraft', 'Where you can reach the assistant, ask it to draft them all. Each is marked "Draft · the assistant\'s".', 'Your task becomes finding its errors. Without the assistant, type them yourself.'),
 ('translations', 'translationadopt', 'Read each draft against the English; keep it or correct it.', 'A word becomes the team\'s only when a granted member who knows the language keeps it.'),
 ('translations', 'translationconfirm', 'A protected word you changed, or typed without a draft, waits for a second check.', 'A second granted speaker, or an administrator reading the assistant\'s back-translation, confirms it. Until then members see the English.'),
], [3])

wiz('Comment for the team', 'plan', False, [
 ('plan', 'optiondispose', 'Choose a public comment as the option, and the meeting or comment period it is for.', 'Choosing records why this option, now.'),
 ('start-send', 'optionstart', 'Start the comment, addressed to the body that holds the meeting.', 'It goes to the body by role, so it reaches whoever sits there that day.'),
 ('start-send', 'communicationprepare', 'Choose "For the team" or "As myself", then write what the record shows and what you ask the body to examine or apply. Start from your team\'s template for a written comment if it has one.', 'A comment for the team is the team\'s act. One as yourself is your own notes, never recorded as sent.'),
 ('start-send', None, 'Read any sentence pointed out as a policy position: remove it, or comment as yourself.', 'A comment for the team states facts and asks. A position is a member\'s to take as themselves.'),
 ('start-send', 'filingapprove', 'Approve the text.', 'Approving is kept apart from sending, so you can stop between them.'),
 ('start-send', 'filingrecordsent', 'Submit it, or read it at the meeting, then record that it was sent.', 'The record keeps what the team said, and when.'),
], [22], 'DEC-194 (B140): public comment')

wiz('Demand a correction', 'plan', False, [
 ('plan', 'optiondispose', 'Choose the demand as the option. Read its advisory first: a demand is a Tier 2 act, and a lawyer\'s view helps.', 'A demand can lead to a court; knowing that before starting is part of choosing it.'),
 ('start-send', 'optionstartpreview', 'See what starting does: the window the law gives the body to correct its act, and anything that would stop it.', 'A demand starts a legal clock. You see it before anything runs.'),
 ('start-send', 'optionstart', 'Start the demand, addressed to the body by role.', 'The body\'s holder that day is shown, so you know who will read it.'),
 ('start-send', 'communicationprepare', 'Write what the body did, the rule it seems to break, and what correcting it would look like. Start from your team\'s demand template if it has one.', 'A demand asks the body to correct its own act, so it says exactly what correcting it means.'),
 ('start-send', None, 'Rewrite any sentence pointed out as asking for something for your team.', 'A demand asks nothing for the team. Approval waits until those sentences are gone.'),
 ('start-send', 'filingapprove', 'Approve the text.', 'Approving is kept apart from sending, so you can stop between them.'),
 ('start-send', 'filingrecordsent', 'Send it, then record that you sent it.', 'Recording it starts the body\'s window to correct the act.'),
 ('due-date', 'reminderset', 'The window\'s end goes into your queue.', 'If the body doesn\'t correct it, the next stage is ready without anyone remembering.'),
], [22], 'DEC-194 (B140): demand to cure')

wiz('Take an escalation to its next stage', 'matter', False, [
 ('matter', None, 'Read where the escalation stands. Each stage is a question, such as "Did we tell them?" or "What did they say?".', 'The questions say what each stage needs before the next.'),
 ('action', 'actioncorrespond', 'If they replied, record what they said.', 'The next stage rests on the reply, or on there being none.'),
 ('matter', 'escalationadvance', 'Advance to the next stage, or decline to escalate with your reason.', 'Either way the record keeps why.'),
 ('matter', 'escalationstoppursuing', 'If your team is stopping, stop pursuing it, with your reason.', 'Stopping is never recorded as ended or as a success, and it can be reopened where it stopped.'),
 ('due-date', 'reminderset', 'Set when to look at it again.', 'An escalation moves only when a member moves it.'),
], [22], 'DEC-194 (B140): escalation stage')

wiz('Refer it to an oversight body', 'plan', False, [
 ('plan', 'optiondispose', 'Choose a referral to the oversight body as the option.', 'Choosing records why this option, now.'),
 ('start-send', 'optionstart', 'Start the referral, addressed to the oversight body by role.', 'It goes to the body by role, so it reaches whoever holds it that day.'),
 ('start-send', 'communicationprepare', 'Write what happened and ask the body to look into it. Start from your team\'s referral template if it has one.', 'A referral asks for an examination. It doesn\'t claim a breach the body hasn\'t found.'),
 ('start-send', 'filingapprove', 'Approve the text.', 'Approving is kept apart from sending, so you can stop between them.'),
 ('start-send', 'filingrecordsent', 'Send it, then record that you sent it. Say if no reply is owed.', 'Some oversight bodies don\'t reply to a referral; saying so keeps a missing reply from being counted against them.'),
 ('action', 'actionscope', 'If the referral shouldn\'t be published, make the action confidential, with your reason.', 'A confidential action is seen inside the team and never published.'),
 ('action', 'actioncorrespond', 'When they reply, record it, with their own words for its status.', 'Outcomes are kept in the oversight body\'s own terms.'),
], [22], 'DEC-194 (B140): oversight referral')

wiz('Pick up a plan', 'plan', False, [
 ('plan', None, 'Read where it stands: the matters, what each has reached, and what is due next.', 'Joining midway starts from what is already true, not from the beginning.'),
 ('plan', None, 'Read the latest status report, if a member saved one, and what changed since.', 'Each line cites what it rests on, so you can check it.'),
 ('plan', 'itemtakeup', 'Take up an item you can do. Nobody assigns anybody: you choose.', 'Taking it up routes its dates and reminders to you.'),
 ('due-date', 'reminderset', 'Set a reminder for your item.', 'Your reminder is yours alone.'),
], [22], 'DEC-194 (B140): pick up a plan')

wiz('Start and send', 'plan', False, [
 ('plan', 'optiondispose', 'Choose the option, and say when to be reminded.', 'Choosing records why this option, now.'),
 ('start-send', 'optionstartpreview', 'See what starting does, and anything that would stop it.', 'Refusals are shown before anything runs.'),
 ('start-send', 'optionstart', 'Start the action, addressed to the office by role.', 'The office\'s holder that day is shown, so you know who will read it.'),
 ('start-send', 'communicationprepare', 'Prepare what is sent: start from your team\'s template for this kind of action if it has one, or write it yourself. A template or draft is labeled until you make it yours.', 'The words that leave the team are always a member\'s.'),
 ('start-send', 'filingapprove', 'Approve the text.', 'Approving is kept apart from sending, so you can stop between them.'),
 ('start-send', 'filingrecordsent', 'Send it, then record that you sent it.', 'This tells the office what your team is looking at, and starts the clock.'),
 ('due-date', 'reminderset', 'The due date and next checkpoint go into your queue. A next step can wait on the reply.', 'If no reply comes, the next step is ready without anyone remembering.'),
], [22])

# The front doors (wizard-scripts R23 `doors`; canon BIO_Investigation §7, Bob's D52 through K2407: one door, "What happened?").
# By hand, the door offers these plain-language choices, each leading to offered scripts of this library; Home also shows
# existing work that matches and allows a blank start ("Start a project"). Words: door.front.<door>.name and .hint in words.json.
DOORS = [
 ('problem', ['Your first question', 'Get a record', 'Check a claim']),
 ('person', ['Your first question', 'Follow the money', 'Build a timeline']),
 ('money', ['Follow the money', 'Get a record']),
 ('read', ['Check a claim', 'Follow a proceeding', 'Use another team\'s case']),
 ('tip', ['Check a claim', 'Build a timeline']),
 ('elsewhere', [], 'elsewhere'),  # DEC-227 (1), DEC-232: the sixth door opens the screen Where else to go (wizard-scripts R37)
]
