# The screen registry (design phase step 5, DEC-139): every member screen the redesign draws, with the acts it offers.
# wizard-scripts R13 registers it as [{id, acts}]; a wizard step names one of these screens and one of its acts.
# Each act is an op name: an op already declared (op=…), a requirement function whose op BOB declares by its
# lowercased name (K-rule pattern of op-declarations), or "owed:" with the DEC that owes it. check_library.py checks.
S = []
def screen(id, name, frame, purpose, acts, journeys):
    S.append(dict(id=id, name=name, frame=frame, purpose=purpose,
                  acts=[dict(op=a[0], label=a[1]) for a in acts], journeys=journeys))

# --- the group's copy: setting up, joining, accounts
screen('install', 'Install Civicsmith', 'setup', 'The installer page: what is needed, the short name, installing the signed release into the group\'s own account.',
  [('bootstrap','Install with this short name'),('selftest','Let it test itself')], [1])
screen('setup', 'Set up your group\'s copy', 'setup', 'The founder claims the copy, names the group, reviews offices and seats, offers the assistant and records the hosting account.',
  [('claim','Claim with the one-time password'),('groupnameset','Name the group'),('groupdomainset','Verify the web address'),('profilesset','Choose places and languages'),
   ('officesseed','Review offices and seats'),('assistantset','Offer the assistant to members'),('aicopyceilingset','Set the copy\'s daily limit'),
   ('hostingaccess','Record who holds the hosting account'),('memberadd','Invite a member or a second administrator')], [1])
screen('group-identity', 'Who your group is', 'working', 'Kinds, focus and purpose, and who sees them (DEC-132).',
  [('owed:groupprofileset DEC-132','Save who your group is'),('owed:groupprofilevisibility DEC-132','Choose who sees it')], [2])
screen('join', 'Your invitation', 'setup', 'The invitation link opens here: language, handle, password.',
  [('invitelook','Read the invitation'),('owed:memberlanguageset DEC-127','Choose your language'),('enroll','Join with a handle and password')], [3])
screen('home', 'Your group\'s home', 'working', 'What the group is working on, what waits on you, and "What brought you here?".',
  [('projectcreated','Start a project'),('owed:startfrom DEC-129','Start from…')], [3,6])
screen('members', 'Members', 'working', 'The roster: invitations, capabilities, expertise, administrators, joining through the website.',
  [('memberadd','Invite a member'),('membercaps','Change what a member may do'),('memberset','Change a member\'s status'),('adminendorse','Endorse an administrator'),
   ('adminremove','Remove an administrator'),('expertiseconfirm','Confirm declared expertise'),('owed:websitekeymint DEC-133','Create a website key'),('owed:joinlinkset DEC-133','Turn the join link on or off')], [16,27])
screen('account', 'Your account', 'working', 'Handle, password, language, expertise, signing key, theme.',
  [('expertisedeclare','Declare your expertise'),('setpassword','Change your password'),('signerregisterown','Register your signing key'),('signerrevokeown','Revoke your signing key'),('owed:memberlanguageset DEC-127','Choose your language')], [3,16])
screen('connect', 'Connect your Claude account', 'working', 'The member\'s own API key or subscription token, or skip; their daily limit; suggestions on or off (K1502, K1547).',
  [('disclosureshown','Read what connecting means'),('accountreferenceset','Connect with your own key or token'),('aiceilingset','Set your daily limit'),('accountswitchset','Let the assistant suggest unprompted'),('accountreferenceremove','Disconnect')], [4,17])
screen('ties', 'Your ties', 'working', 'The member\'s own ties, seen only by them and administrators (K1490).',
  [('declaretie','Add a tie'),('withdrawtie','Remove a tie')], [5])
screen('notes', 'Your notes', 'working', 'A member\'s own notes, seen only by them (DEC-136).',
  [('owed:noteadd DEC-136','Write a note'),('owed:noteconvert DEC-136','Turn a note into an observation, hunch or question')], [6])
screen('translations', 'Translations', 'working', 'The interface\'s words in the group\'s languages (DEC-127).',
  [('owed:translationdraft DEC-127','Ask the assistant to draft'),('owed:translationadopt DEC-127','Adopt a translation')], [3])
screen('wizards', 'Wizards', 'working', 'The group\'s wizard library: offered, drafts, submitted (DEC-121).',
  [('wizards','See the library'),('wizarddraft','Record a new wizard'),('wizardrevise','Revise a draft'),('wizardsubmit','Submit for approval'),('wizardapprove','Approve'),('wizardretire','Retire')], [])

# --- daily work
screen('queue', 'Your queue', 'working', 'To do, Noticed and Status, grouped by case (DEC-110, DEC-131).',
  [('taskresolve','Act on an item'),('taskforward','Forward to a member'),('proposedispose','Dismiss with a reason'),('queuesnooze','Snooze to a date'),('queuemute','Mute a kind'),
   ('adoptversion','Adopt the newer version'),('keepversion','Keep the version you cited'),('reminderanswer','Answer a reminder')], [19,23])
screen('finder', 'Find', 'working', 'Search what the group holds; hold a set together; see where nobody looked.',
  [('search','Search'),('select','Hold these together'),('selectionrelease','Let the set go'),('frontier','See where nobody looked'),('countask','Count')], [6,7])
screen('capture', 'Add', 'working', 'Capture a document from an address or a file, photograph a handout, or record what you saw.',
  [('acquire','Capture from an address'),('capture','Capture a file or photo'),('testify','Record what you saw or heard'),('capturerequest','Ask for a capture later'),('monitor','Watch this address')], [6,7,9,15])
screen('held', 'Held captures', 'working', 'Captures not yet vouched for, per member and project (DEC-97).',
  [('heldcaptures','See held captures'),('release','Vouch for them'),('heldsetaside','Set aside with a reason'),('heldrestore','Restore')], [15])
screen('document', 'Document', 'working', 'One captured document: its copy, grade note, passages, versions and what cites it.',
  [('gradenote','Read the grade note'),('release','Vouch for this copy'),('cite','Cite a passage'),('retire','Retire'),('attest','Attest'),('identityclaim','Claim the same person'),('monitor','Watch for changes')], [7,15,23])

# --- projects and questions
screen('project', 'Project', 'working', 'A project\'s home: objective, bar, questions, stage, plans, members.',
  [('promote','Open a question'),('strengthbarset','Set the project\'s bar'),('projectinvite','Invite a member to the project'),('projectjoin','Join'),('planopen','Plan what to do')], [6,9,15])
screen('question', 'Question', 'working', 'A question and what supports it or cuts against it; strength against the bar; concluding.',
  [('cite','Cite a passage'),('sever','Remove a citation'),('reinstate','Reinstate'),('narrow','Narrow the question'),('conclude','Conclude'),('withdrawconclusion','Withdraw the conclusion'),
   ('hypothesishold','Keep a hunch'),('planopen','Plan what to do'),('owed:checkrequest DEC-135','Ask for a check by expertise')], [6,9,15,16])
screen('answers', 'Ask', 'working', 'Ask in plain words (with the assistant) or by search (without); keep asking.',
  [('ruleanswer','Ask'),('search','Search instead'),('standingquestionset','Keep asking this'),('standingquestionend','Stop asking')], [17,18])
screen('assistant', 'The assistant panel', 'dock', 'Docked beside the screen it serves; runs only on the member\'s own account.',
  [('airunopen','Ask the assistant to work on this'),('suggest','Suggest'),('airunclose','Stop the run')], [17])

# --- the record's subjects
screen('person', 'Person', 'working', 'Positions, career, credentials, memberships, interests, statements; same person?',
  [('person','Open the person'),('recordpersonfact','Add a fact from a document'),('claimidentity','Claim the same person'),('withdrawidentityclaim','Withdraw a claim'),('followregister','Follow a register'),('expunge','Remove where the law requires')], [10])
screen('timeline', 'Timeline', 'working', 'What they did and what we did, in two lanes (K1462, K1494).',
  [('createevent','Record an event'),('addparticipant','Add who took part'),('relate','Link events'),('recorddatedfact','Record a dated fact'),('hypothesishold','Keep a suspected cause as a hunch')], [11])
screen('money', 'Money trail', 'working', 'Money facts with stage and period; a trail; reconciling sources (K1457, K1468).',
  [('recordfact','Read a figure into a money fact'),('createset','Start a money trail'),('include','Include with a reason'),('exclude','Leave out with a reason'),('reconcile','Compare two sources'),('committedagainstpaid','Committed against paid'),('authoritychain','What authorised it')], [12])
screen('calculation', 'Calculation', 'working', 'A computed fact with its method, or a member\'s spreadsheet bound to the record.',
  [('calculationcreate','Work it out'),('tabledeclare','Declare the table'),('calculationdraw','Draw a random sample'),('addworkbook','Bind your spreadsheet'),('bind','Tie an input to the record'),('recordcheck','Record a second member\'s check'),('calculationaccept','Accept the result')], [9])
screen('explore', 'Explore connections', 'working', 'Chains between a start and an end, each step cited and graded (K1469, K1487).',
  [('explore','Explore'),('explorepreset','Use a preset'),('exploreverify','Check a chain'),('connectionassert','Attach a source to a declared step'),('promote','Open a question from this chain')], [13])
screen('proceeding', 'Proceeding', 'working', 'A court case or regulatory proceeding: parties, register, orders and their dates.',
  [('registerproceeding','Register the proceeding'),('recordline','Add a party by role'),('followregister','Follow its register'),('declare','Hold an order as obligations'),('courtlink','Link a decision to what it interprets')], [14])
screen('due-date', 'How this date was worked out', 'working', 'A due date\'s basis and counting; confirm it; download it (K1431, K1444).',
  [('deadlinecompute','Work out the due date'),('clockadopt','Confirm the due date'),('reminderset','Remind me')], [7,8])
screen('standard', 'Standard', 'working', 'A requirement the city set itself, held and searchable.',
  [('standarddeclare','Hold this as a standard'),('standardadopt','Adopt a proposed standard'),('lawrelate','Relate to a law')], [6,14,22])

# --- deciding and acting (bound sketches: the plan page, start and send)
screen('plan', 'Action plan', 'working', 'The approved plan page: subjects, options, scenarios, what each option became (K608 (4)).',
  [('plansubjectadd','Add a subject'),('optionadd','Add an option'),('optionpropose','Ask the assistant for options'),('optionadopt','Adopt a suggestion'),('optiondispose','Choose or decline'),
   ('scenarioset','Lay out a scenario'),('checkpointrecord','Judge a checkpoint'),('optionstartpreview','Start…'),('planclose','Close the plan')], [22])
screen('start-send', 'Start and send', 'working', 'The bound start-and-send flow: refusals first, reason in place, approve then record the send (DEC-115).',
  [('optionstartpreview','See what starting does'),('optionstart','Start the action'),('communicationprepare','Prepare what is sent'),('filingprepare','Prepare the filing'),('filingapprove','Approve this text'),('filingrecordsent','I have sent it')], [7,22])
screen('request', 'Request records', 'working', 'A records request: the office by role, what is wanted, the law, the text, approving and recording the send.',
  [('addresseesuggest','Choose the office'),('actioncreate','Start the request'),('actionlaws','Choose the law it goes under'),('communicationprepare','Prepare the text'),('filingapprove','Approve this text'),('filingrecordsent','I have sent it')], [7])
screen('action', 'Action', 'working', 'One action: replies, deadlines, pressure, holds.',
  [('actionmove','Move the action'),('actioncorrespond','Record a reply'),('actionpressure','Mark a reply as pressure'),('reminderset','Remind me'),('actionhold','Record a litigation hold')], [7,22])
screen('matter', 'Matter', 'working', 'One government act: determination, consequences, escalation, actions.',
  [('escalationopen','Open an escalation'),('escalationadvance','Advance'),('declinetoescalate','Decline to escalate, with a reason'),('escalationend','End')], [22])

# --- publishing
screen('case-editor', 'Case', 'working', 'Prepare the case: scope, statement, what it leaves out, bias, timeline, people named.',
  [('casedraft','Prepare the draft'),('whatchangedpropose','Draft "what changed"'),('statementack','Acknowledge what it leaves out'),('attribute','Name a person with the reason')], [15,23])
screen('review-copy', 'Review copy', 'working', 'A named outsider\'s revocable view of the draft.',
  [('reviewgrant','Share for review'),('reviewrevoke','Stop sharing'),('reviewcomment','Comment')], [21])
screen('ceremony', 'Publication ceremony', 'working', 'The required wizard: checks, disclosures, ties confirmed, preview, signing.',
  [('publishpreflight','Check before publishing'),('publishtensions','See what must be disclosed'),('caseratify','Sign with your key'),('publish','Publish, with your confirmation of no undeclared tie')], [15,24])
screen('published', 'Published case', 'published', 'The public page: findings, strengths, timeline, people named, evidence; checkable without the group.',
  [('verify','Check the signature'),('publishedcase','Read the case')], [26])
screen('imported', 'Another group\'s case', 'imported', 'An imported case in its read-only project, recreated finding by finding.',
  [('caseimport','Import a case'),('importaccept','Accept what recreated'),('importflag','Flag an issue'),('importwatch','Watch the publisher\'s docket')], [25])
screen('docket', 'Docket', 'working', 'The case\'s public docket: corrections, withdrawals, court orders.',
  [('docketfile','File a docket entry'),('docketpost','Post it')], [23,24])

# --- outside the group
screen('inbox', 'Inbox', 'working', 'Material handed in through the doorbell.',
  [('inboxpull','Move into the record'),('inboxresolve','Discard with a reason'),('sourcelink','Record what is known of the source')], [20])
screen('doorbell', 'Hand material to the group', 'public', 'The doorbell page for someone outside, with no account.',
  [('knock','Hand it over')], [20])
