# The Civicsmith wizard library (design phase step 5, DEC-139; DEC-121 (9): written by the UX stream, approved by Bob).
# Each script follows wizard-scripts R1 and R2: a step is {screen, act, what, why, draft?}; `what` and `why` are 1-300
# characters; a draft is {text}, {template} or {machine: op}, always shown labelled; no step presses, signs or sends.
# `act` names the control the step points at (null: the step explains the screen). Side trips (`via`) start another
# wizard and return to the step left. Places, laws and venues never appear here (K1): they come from the group's profile
# and its own templates (`{template: "@…"}` names the kind of template the group's library offers).
import hashlib
L = []
def wiz(name, start, required, steps, journeys, note=''):
    sid = 'WIZ-' + hashlib.sha256(('civicsmith:' + name).encode()).hexdigest()[:16]
    out = []
    for st in steps:
        d = dict(screen=st[0], act=st[1], what=st[2], why=st[3])
        if len(st) > 4 and st[4]: d.update(st[4])
        out.append(d)
    L.append(dict(id=sid, origin='civicsmith', scope='group', name=name, start=start, required=required, journeys=journeys, note=note,
                  versions=[dict(version=1, state='draft', steps=out)]))

wiz('Set up and claim', 'install', True, [
 ('install', None, 'Check you have what is needed: a Cloudflare account and about twenty minutes.', 'The free plan works. Workers Paid ($5 a month) adds recomputing spreadsheets and signing in with a Claude subscription. No Claude account is needed to set up.'),
 ('install', 'bootstrap', 'Choose your group\'s short name, then install.', 'It appears in addresses and signatures and can never change. A group that wants to stay unnamed picks one that reveals nothing.'),
 ('install', 'selftest', 'Let your copy test itself. Allow it to run the assistant\'s container if you are asked.', 'The test proves your copy works before anyone relies on it.'),
 ('setup', 'claim', 'Claim your copy with the one-time password, then choose your own password.', 'Only the person holding the one-time password can become the first administrator.'),
 ('setup', 'groupnameset', 'Name the group, and add its logo if it has one.', 'The group\'s name heads everything it publishes; Civicsmith is credited quietly at the foot.'),
 ('setup', 'groupdomainset', 'Verify the group\'s web address.', 'Readers can then confirm that a published case really comes from your group.'),
 ('setup', 'profilesset', 'Choose the places whose rules apply, and the languages your members use.', 'Deadlines, holidays and offices come from these places, never from Civicsmith itself.'),
 ('setup', 'officesseed', 'Review the offices, seats and holders Civicsmith filled in. Each is marked with where it came from.', 'Requests go to offices by role, so correct anything before members rely on it.'),
 ('setup', None, 'Read who in the group will see facts about people.', 'Facts from public documents follow those documents; a project\'s own notes about a person stay inside the project.'),
 ('setup', 'assistantset', 'Decide whether to offer the assistant to your members.', 'Each member who wants it connects their own Claude account. Nothing is shared, and everything works without it.'),
 ('setup', 'hostingaccess', 'Record who holds the hosting account.', 'If you are ever unreachable, this is how the group gets back in.'),
 ('setup', 'memberadd', 'Invite your first members, and a second administrator now or later.', 'With one administrator the group depends on one person. A second means it is never stuck.'),
 ('group-identity', None, 'Optional: say who your group is. You will come back here when you finish or stop.', 'It shapes how each member is welcomed. It locks nothing and is never required.', {'via': 'Say who your group is'}),
], [1, 2])

wiz('Welcome a new member', 'join', True, [
 ('join', 'owed:memberlanguageset DEC-127', 'Choose your language.', 'Everything that follows should be in words you read easily. It starts from your device\'s setting.'),
 ('join', 'enroll', 'Choose a handle and a password.', 'The record shows your handle on your work. It needn\'t be your legal name: a known name lends credibility, a pen name shields you, and administrators still know who you are.'),
 ('home', None, 'This is your group\'s home: what it is working on, and what is waiting on you.', 'Come back here whenever you lose your place.'),
 ('question', None, 'Two things to know first: a question\'s strength against its project\'s bar, and "Undetermined".', 'You will see these everywhere. Every other mark is explained where you meet it, one tap away.'),
 ('connect', None, 'Optional: connect your own Claude account, or skip.', 'The assistant serves only you, and every journey works without it.', {'via': 'Connect your Claude account'}),
 ('ties', None, 'Optional: tell the group about your own ties.', 'Only you and the administrators see them, and they let a case disclose a tie honestly.', {'via': 'Your ties'}),
 ('home', 'owed:startfrom DEC-129', 'Take a first step: join a project, capture a document, or record what you saw.', 'One small act is enough to begin. Nothing here has to be done in order.'),
], [3], note='Final words once the redesign has settled (DEC-91).')

wiz('Publication ceremony', 'ceremony', True, [
 ('ceremony', 'publishpreflight', 'Check what you are publishing: the case, its edition and its scope.', 'Publishing is permanent. This is the last look before it.'),
 ('ceremony', 'publishpreflight', 'Check each finding\'s strength against the bar, and anything still open.', 'A reader sees each finding\'s strengths. Anything still open is disclosed, never hidden.'),
 ('case-editor', 'statementack', 'Read what the case leaves out, and who acknowledged it.', 'Saying what a case does not cover is part of its honesty.'),
 ('case-editor', 'attribute', 'Check each person the case names, with the reason they matter to a finding.', 'A case cannot be signed while any reason is missing.'),
 ('ceremony', 'publishtensions', 'Read what will be disclosed: the timeline as it stands, and any calculation that differs or is not tied to the record.', 'Readers must see what the case could not settle.'),
 ('ceremony', None, 'Read the group\'s declared bias as it will appear.', 'Every published case carries the lens it was made through.'),
 ('ceremony', None, 'Preview the public page as a stranger will see it.', 'This is how a reader with no account meets your work.'),
 ('ceremony', 'publish', 'Each member publishing confirms they have no undeclared tie to anyone the case concerns.', 'Including anyone paid in its money. A tie disclosed is a strength; one found later is not.'),
 ('ceremony', 'caseratify', 'Sign with your key.', 'Publishing is permanent. Corrections come as a new edition, never by changing this one.'),
], [15, 24])

wiz('Get a record', 'finder', False, [
 ('finder', 'search', 'Look first: is the record already public? Search what your group holds and where the office publishes.', 'Much is public already. A copy from the office\'s own site holds up better than one found elsewhere.'),
 ('capture', 'acquire', 'If you find it, capture it from its address. Then you are done.', 'Capturing keeps a fingerprinted copy that cannot change under you.'),
 ('request', 'addresseesuggest', 'If not, choose the office that holds the records.', 'The request goes to the office by its role, so it reaches whoever holds the post that day. You will see who that is.'),
 ('request', 'actioncreate', 'Say plainly what records you want.', 'A clear description is harder to refuse, or to answer only in part.'),
 ('request', 'actionlaws', 'Choose the law the request goes under, from your group\'s places.', 'The law sets the office\'s deadline. Where a faster kind of request fits, it is offered.'),
 ('request', 'communicationprepare', 'Read the draft request and edit it until it is yours.', 'The wizard only drafts. The words that are sent are yours.', {'draft': {'template': '@records-request'}}),
 ('request', 'filingapprove', 'Approve the text.', 'Approving is kept apart from sending, so you can stop between them.'),
 ('request', 'filingrecordsent', 'Send it the way the office accepts requests, then record that you sent it.', 'Sending tells the office what your group is looking at. Recording the send starts the clock.'),
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
 ('capture', 'testify', 'Members visit and record what they find, with place, date and photo.', 'Firsthand checks test whether the records match the street.'),
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

wiz('Say who your group is', 'group-identity', False, [
 ('group-identity', 'owed:groupprofileset DEC-132', 'What kind of group are you? Pick one or more, or describe your own.', 'It shapes how each member is welcomed. It never limits what anyone can do.'),
 ('group-identity', 'owed:groupprofileset DEC-132', 'What do you focus on: issues, places, offices or agencies?', 'New members see your focus first when they choose where to start.'),
 ('group-identity', 'owed:groupprofileset DEC-132', 'Why does the group exist? Say it in your own words.', 'Your declared bias can start from what you write here.'),
 ('group-identity', 'owed:groupprofilevisibility DEC-132', 'Who should see this: members only, or also your public page and the network directory?', 'Members only is the default. A group that wants to stay unnamed keeps it that way.'),
], [2])

wiz('Invite a member', 'members', False, [
 ('members', 'memberadd', 'Who: their handle, and the cover the group knows them by. Not a legal name.', 'The record never needs a legal name. Administrators keep the cover so they know who is who.'),
 ('members', 'membercaps', 'What they may do. Contributing is the default.', 'Give only what the person needs; you can change it later.'),
 ('members', None, 'Send the link yourself. It works once and expires after seven days.', 'Civicsmith sends no email, so the link reaches them only through you.'),
 ('members', 'owed:websitekeymint DEC-133', 'Or let people join through your website: create a website key, or turn on the reusable join link.', 'Anyone let through can see the group\'s shared work, so each comes with limits and a daily cap.'),
], [3, 27])

wiz('Connect your Claude account', 'connect', False, [
 ('connect', None, 'The assistant is optional, and serves only you.', 'It runs on your own Claude account, never the group\'s. Everything works without it.'),
 ('connect', 'disclosureshown', 'Read what connecting means.', 'Your questions, and what is read to answer them, go to Anthropic under your own account.'),
 ('connect', 'accountreferenceset', 'Connect with your own Claude API key or your own subscription token. Or skip.', 'Either serves only you. Skipping is a real choice: every journey stays open.'),
 ('connect', 'accountreferenceset', 'For a subscription token: on your own computer, open a terminal, run claude setup-token, sign in, and paste what it prints here.', 'The token is made by Anthropic\'s own sign-in on your computer. Civicsmith never sees your password.'),
 ('connect', 'aiceilingset', 'Set your daily limit.', 'It caps what the assistant can spend on your account each day. An administrator may set a lower one for the copy.'),
 ('connect', 'accountswitchset', 'Choose whether the assistant may suggest things without being asked. It is off unless you turn it on.', 'Some members want suggestions; others want quiet.'),
 ('connect', 'accountreferenceremove', 'You can disconnect at any time, here.', 'Disconnecting removes the key or token from your group\'s copy.'),
], [4, 17])

wiz('Your ties', 'ties', False, [
 ('ties', 'declaretie', 'List your employer, relatives, and businesses you have an interest in.', 'A case concerning any of them can then disclose the tie honestly.'),
 ('ties', None, 'Only you and the administrators can see this.', 'Your ties never appear in a case unless one concerns it, and then only as you choose.'),
 ('ties', 'declaretie', 'For each tie, choose how it is disclosed when a case concerns it: under your handle, or as the group.', 'Disclosing as the group protects you while keeping the case honest.'),
], [5])

wiz('Follow a proceeding', 'capture', False, [
 ('capture', 'acquire', 'Capture a filing, or the court\'s register page.', 'The proceeding is registered from what it says about itself.'),
 ('proceeding', 'registerproceeding', 'Register the proceeding from its caption: the court, the number, and a neutral label.', 'A neutral label keeps your own view out of the record\'s name for it.'),
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

wiz('Use another group\'s case', 'imported', False, [
 ('imported', 'caseimport', 'Import the case into its own read-only project.', 'Another group\'s work stays marked as theirs, and cannot be edited.'),
 ('imported', None, 'Civicsmith recreates each finding and calculation from the case file. Watch each one\'s mark.', 'Recreated, recreated in part, or did not recreate: you never rely on what you could not check.'),
 ('imported', 'importaccept', 'Accept what recreated, with a reason.', 'Accepting names one edition and changes no grade.'),
 ('imported', 'importwatch', 'Watch the publisher\'s docket for new editions and corrections.', 'Anything relying on the case is told when it changes.'),
], [25])

wiz('Translate the interface', 'translations', False, [
 ('translations', None, 'Choose the language.', 'Civicsmith\'s own translations come with releases. Your group fills gaps and improves wording.'),
 ('translations', None, 'See the words still untranslated.', 'A missing word shows in English, never blank.'),
 ('translations', 'owed:translationdraft DEC-127', 'With your own Claude account connected, ask the assistant to draft them. Each is marked "Draft".', 'Without the assistant, type them yourself.'),
 ('translations', 'owed:translationadopt DEC-127', 'Check and adopt each one.', 'A word becomes the group\'s only when someone who knows the language adopts it.'),
], [3])

wiz('Start and send', 'plan', False, [
 ('plan', 'optiondispose', 'Choose the option, and say when to be reminded.', 'Choosing records why this option, now.'),
 ('start-send', 'optionstartpreview', 'See what starting does, and anything that would stop it.', 'Refusals are shown before anything runs.'),
 ('start-send', 'optionstart', 'Start the action, addressed to the office by role.', 'The office\'s holder that day is shown, so you know who will read it.'),
 ('start-send', 'communicationprepare', 'Prepare what is sent. A template or draft is labelled until you make it yours.', 'The words that leave the group are always a member\'s.', {'draft': {'template': '@communication'}}),
 ('start-send', 'filingapprove', 'Approve the text.', 'Approving is kept apart from sending, so you can stop between them.'),
 ('start-send', 'filingrecordsent', 'Send it, then record that you sent it.', 'This tells the office what your group is looking at, and starts the clock.'),
 ('due-date', 'reminderset', 'The due date and next checkpoint go into your queue. A next step can wait on the reply.', 'If no reply comes, the next step is ready without anyone remembering.'),
], [22])
