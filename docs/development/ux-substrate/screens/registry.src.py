# The screen registry (design phase step 5, DEC-139): every member screen the redesign draws, with the acts it offers.
# wizard-scripts R13 registers it as [{id, acts}]; a wizard step names one of these screens and one of its acts.
# Each act is an op name: an op already declared (op=…), a requirement function whose op BOB declares by its
# lowercased name (K-rule pattern of op-declarations), or "owed:" with the DEC that owes it. check_library.py checks.
S = []
def screen(id, name, frame, purpose, acts, journeys):
    S.append(dict(id=id, name=name, frame=frame, purpose=purpose,
                  acts=[dict(op=a[0], label=a[1]) for a in acts], journeys=journeys))

# --- the group's Civicsmith: setting up, joining, accounts
screen('site', 'civicsmith.org', 'setup', 'Civicsmith\'s own website, one site of three pages joined by one menu (Bob\'s D6, K3060; DEC-206; rewritten for its readers, DEC-223): the front page, for someone who has never heard of Civicsmith (what it is, how a group uses it in five steps, what a group gets, what it does not do, a published case, members sent to their own group\'s address); "Start a group", for a member who has decided (whether it fits, what is needed, who holds the Cloudflare account, what happens step by step, what it costs, then "Create your group" opens the installer); "Groups at work", the groups that chose to be listed (DEC-132).',
  [], [1,28])
screen('install', 'Create your Civicsmith group', 'setup', 'The founder\'s link and the installer, in order: what Civicsmith is and what is needed, the short name and places, Cloudflare\'s permission, the progress and any stop, the checks and the one-time password, the hand-over to setup (DEC-201).',
  [('bootstrap','Continue to Cloudflare')], [1,28])
screen('update', 'Update your group\'s Civicsmith', 'setup', 'The hosting account\'s holder updates the group\'s Civicsmith to the signed release chosen in Settings › Updates and no other: the versions before and after, the steps as they run, a stop that leaves it running as it was, and the finish; records, members and settings are kept (installer R1, R17, R52, R54; DEC-201, DEC-226).',
  [('bootstrap','Continue to Cloudflare to update')], [1])
screen('front', 'Your group\'s page', 'public', 'The group\'s own landing page at its address (Bob\'s D2, K3060): who it is, what it has published, handing it material, how it works; members sign in beside it, with an own device kept signed in (locks after 30 minutes away, signs out after 12 hours) or a shared one (signed out after 15 minutes away) (D3, K3061); refused, paused, signed out, ended and locked (credentials R4, R38; DEC-201, DEC-202).',
  [('login','Sign in'),('unlock','Unlock')], [3,28])
screen('tour', 'How we work, step by step', 'public', 'The walk-through for anyone, offered on the group\'s page before joining (Bob\'s D7, K3060): what the group looks into, how a finding shows its source and its strength, what it publishes and who signs it, handing it material, and how people join (DEC-205).',
  [], [3])
screen('reset', 'Choose a new password', 'public', 'The administrator\'s one-time reset link opens here: the member chooses a new password, keeping their handle and work; a used, expired or withdrawn link says so (Bob\'s D4, K3060; DEC-201, DEC-205).',
  [('passwordreset','Set my new password')], [3])
screen('forgot', 'Forgot your password', 'public', 'Getting back in without email: any member with one of their recovery codes, or through an administrator\'s one-time reset link (Bob\'s D4, B3, K3060; credentials R47; DEC-201, DEC-202).',
  [('recover','Set a new password with a recovery code')], [3])
screen('setup', 'Become your group\'s first administrator', 'setup', 'The founder claims it, choosing their own handle, names the group, reviews offices and seats, offers the assistant and records the hosting account; a founder who claimed before handles were chosen picks one once, at the next sign-in.',
  [('claim','Claim with the one-time password'),('owed:founderhandleset K3265','Choose this handle'),('groupnameset','Name the group'),('groupdomainset','Verify the web address'),('profilesset','Choose places and languages'),
   ('officesseed','Review offices and seats'),('entitycreate','Add an office yourself'),('placewanted','Name a place not yet listed'),('aikeepaway','Keep the group\'s material away from AI, with a reason'),('groupkeyset','Hold the group\'s API key'),('groupkeyswitch','Switch the group\'s key on or off'),('ailimitset','Set each member\'s daily use of the group\'s key'),('courtnoticeset','Choose whether members are told what a court can reach'),
   ('hostingaccessset','Record who holds the hosting account'),('securitytooladd','Add a security tool (optional)'),('memberadd','Invite a member or a second administrator'),('recoverycodesissue','Show my recovery codes')], [1,28])
screen('group-identity', 'Who your group is', 'working', 'Kinds, focus and purpose, and who sees them (DEC-132).',
  [('groupdescriptionset','Save who your group is, and who sees it'),('groupdescriptiondraft','Ask the assistant to help write it')], [2])
screen('join', 'Your invitation', 'setup', 'The invitation link opens here: language, handle, password.',
  [('invitelook','Read the invitation'),('memberlanguageset','Choose your language'),('handlecheck','See whether a handle is free'),('enroll','Join with a handle and password'),('joinlinkinvite','Join through the group\'s join link')], [3,28])
screen('home', 'Your group\'s home', 'working', 'The group\'s nerve center (Bob\'s S20, DEC-218: one home for everyone, arrangement C): the strip, what needs you, what needs the group, each area at a glance, the projects, what changed since you last looked, and "What happened?", the door to a first step; a new member\'s first visit and a new group\'s empty home as states.',
  [('release','Vouch for photos'),('adoptversion','Adopt the newer version'),('keepversion','Keep the version you cited'),('filingapprove','Approve the text'),('taskresolve','Act on an item'),('promote','Start a project'),('startfrom','Start from…')], [3,6])
screen('members', 'Members', 'working', 'The roster: invitations, capabilities, expertise, administrators, joining through the website.',
  [('memberadd','Invite a member'),('owed:passwordresetlink DEC-201','Make a reset link for a member'),('signerset','Withdraw a member\'s signing key'),('membercaps','Change what a member may do'),('memberset','Change a member\'s status'),('adminendorse','Endorse an administrator'),
   ('adminremove','Remove an administrator'),('expertiseconfirm','Confirm declared expertise'),('invitewithdraw','Withdraw an unused invitation'),('websitekeycreate','Create a website key'),('joinlinkenable','Turn on the reusable join link'),
   ('groupkeyset','Hold the group\'s API key'),('groupkeyswitch','Switch the group\'s key on or off'),('accountusesset','Set what the group\'s key pays for'),('ailimitset','Set a limit on the group\'s key'),('groupkeyremove','Remove the group\'s key'),('aikeepaway','Keep the group\'s material away from AI, with a reason')], [16,27])
screen('security', 'Security', 'working', 'Administrators only: how hard the group\'s Civicsmith is being tried over a period they choose, by kind and hour against its usual; counts only; told only when risk is high (K1875, K1874, DEC-165).',
  [('securitymap','Show the level for a period'),('securitytooladd','Add a security tool'),('securitytooltest','Test a security tool'),('securitytoolremove','Remove a security tool')], [27])
screen('account', 'Your account', 'working', 'Handle, password, language, expertise, signing key, theme.',
  [('expertisedeclare','Declare your expertise'),('signout','Sign out on this device'),('signouteverywhere','Sign out everywhere'),('setpassword','Change your password'),('signerregisterown','Register your signing key'),('signerrevokeown','Revoke your signing key'),('memberlanguageset','Choose your language'),('infolevelset','Choose how much is explained')], [3,16])
screen('connect', 'The assistant', 'working', 'The member\'s own API key or subscription token, or the group\'s key where it offers one, or none; which account pays for an act; their own account\'s uses and limits; their own use across every payer (K1547, K1755, DEC-188).',
  [('groupkeynoticeseen','Read what the group\'s key means'),('disclosureshown','Read what connecting means'),('subscriptionsignin','Open Anthropic\'s sign-in page'),('accountreferenceset','Connect with your own API key'),('subscriptiondisconnect','Disconnect your subscription'),('accountusesset','Set what your account pays for'),('ailimitset','Set a limit on your account'),('accountreferenceremove','Disconnect')], [4,17])
screen('places', 'Places and offices', 'working', 'Administrators: the places whose rules apply, the place a group wants that Civicsmith does not hold yet, and the offices and seats the group deals with (setup-page R13; instance-setup R50, R62; DEC-200 (8), N997).',
  [('profilesset','Choose the places whose rules apply'),('placewanted','Save the place you want'),('officesseed','Fill in the offices again'),('entitycreate','Add an office yourself')], [2])
screen('recovery', 'Recovery codes', 'working', 'Every member\'s own one-time recovery codes (D4, K3060), how many are left, and whether two administrators hold them (credentials R46; instance-setup R66; K1888; DEC-200 (8), N997).',
  [('recoverycodesissue','Get new recovery codes')], [2])
screen('group', 'Your group', 'working', 'Administrators: the settings chosen at setup, changeable here: name and logo, website, languages, the court notice, the hosting account\'s holder, the group\'s bar, what the group has at stake (DEC-201, DEC-231).',
  [('groupnameset','Save the name'),('groupdomainset','Verify the website'),('grouplanguagesset','Save the languages'),('grouplogoset','Change the logo'),('courtnoticeset','Show the court notice'),('hostingaccessset','Record who holds the hosting account'),('strengthbarset','Set the group\'s bar'),('declaredstakeset','Save the statement'),('writinghelp','Help me write this')], [2])
screen('settings', 'Settings', 'working', 'Every setting in one list: the member\'s own, then the group\'s for administrators (DEC-201).', [], [2,3])
screen('more', 'More', 'working', 'The phone\'s More tab: the rail\'s places the tabs do not hold (Projects, People, Settings), each a row with its icon and name and a line saying what it holds; never a bare list. On a desktop the rail shows them (DEC-241; R63, K3250).', [], [2])
screen('updates', 'Updates', 'working', 'Administrators: the release the group\'s Civicsmith runs; the release ready to install (version, date, a security mark when present, the signed release notes in three parts: for members, for administrators, what an administrator must do); the choice Update (the installer\'s page, set to that release), Not now, or Skip this version with a reason; the hand-off, with a link to copy, for an administrator who does not hold the group\'s Cloudflare account; the releases installed and skipped (K3158, DEC-226).', [('owed:updatestart K3158','Update'),('owed:updatelater K3158','Not now'),('owed:updateskip K3158','Skip this version, with a reason')], [19])
screen('ties', 'Your ties', 'working', 'The member\'s own ties, seen only by them and administrators (K1490).',
  [('declaretie','Add a tie'),('withdrawtie','Remove a tie')], [5])
screen('notes', 'Your notes', 'working', 'A member\'s own notes, seen only by them (DEC-136).',
  [('notewrite','Write a note'),('noteturn','Turn a note into an observation, hunch or question'),('noterevise','Revise your note'),('notedelete','Delete your note'),('writinghelp','Help me write this')], [6])
screen('translations', 'Translations', 'working', 'The interface\'s words in the group\'s languages (DEC-127).',
  [('translationdraft','Ask the assistant to draft'),('translationadopt','Adopt a translation'),('translationgrant','Give a member the grant for a language'),('translationconfirm','Confirm a protected word'),('translationrevert','Undo a change')], [3])
screen('wizards', 'Wizards', 'working', 'The group\'s wizard library: offered, drafts, submitted (DEC-121).',
  [('wizards','See the library'),('wizarddraft','Record a new wizard'),('wizardrevise','Revise a draft'),('wizardsubmit','Submit for approval'),('wizardapprove','Approve'),('wizardretire','Retire')], [])

# --- daily work
screen('projects', 'Projects', 'working', 'Every project the member may see, with its owner, questions and stage (projectlist; DEC-201); the group\'s themes, which cut across projects (DEC-242).', [('promote','Start a project'),('themeread','Read the themes')], [6])
screen('theme', 'Themes', 'working', 'The group\'s themes, newest first, searchable by name or test, and declaring one (state a); one theme with what was placed in it, its hunches apart, and what was taken out with the reasons (state b). A theme is never evidence (DEC-242; connections R39 to R46).',
  [('themeread','Read the themes'),('themedeclare','Declare a theme'),('themeplace','Place it in the theme'),('themewithdraw','Take out or reject, with a reason')], [6])
screen('dash-action', 'The Action dashboard', 'working', 'An area dashboard in three tiers (DEC-214): status (clocks running, our move, their move, replies to read), what needs you, then every action with whose move it is and its clock as a sentence.',
  [('filingapprove','Approve the text'),('reminderanswer','Answer a reminder'),('taskresolve','Start the next step'),('actioncreate','Start an action')], [22])
screen('dash-project', 'A project\'s dashboard', 'working', 'A project as a dashboard (DEC-214): the next steps for the member here, in order, each the act itself; the project at a glance; the story so far as a timeline in brief; who works on it and how busy it is.',
  [('release','Vouch for photos'),('adoptversion','Adopt the newer version'),('keepversion','Keep the version you cited')], [15])
screen('unavailable', 'Can\'t open this', 'working', 'An address that leads nowhere, something the member may not see, and the group\'s Civicsmith out of reach (DEC-201).', [], [3])
screen('elsewhere', 'Where else to go', 'working', 'What a member sees when what they need is not Civicsmith\'s work (wizard-scripts R23\'s \'elsewhere\' route, reached from Home\'s sixth door and from a door-offered wizard\'s guide): the places the group\'s place lists for it, by kind, each with what it does, how to reach it, and where that came from; and what shows when the place lists none (K3183, N847, DEC-227).', [], [6])
screen('queue', 'Your queue', 'working', 'To do, Noticed and Status, grouped by case (DEC-110, DEC-131).',
  [('taskresolve','Act on an item'),('taskforward','Forward to a member'),('owed:updatelater K3158','Not now'),('proposedispose','Dismiss with a reason'),('queuesnooze','Snooze to a date'),('queuemute','Mute a kind'),
   ('adoptversion','Adopt the newer version'),('keepversion','Keep the version you cited'),('reminderanswer','Answer a reminder'),('promote','Open a question from a hint'),('projectkeyset','Add an API key for a project'),('exploreapprove','Let the assistant explore today'),('actionmove','Drop an unsent request, with a reason')], [19,23])
screen('finder', 'Find', 'working', 'Search what the group holds, or browse it by kind and state with no words; hold a set together; see where nobody looked.',
  [('search','Search'),('select','Hold these together'),('findin','Find in these'),('selectionrelease','Let the set go'),('frontier','See where nobody looked'),('calculationcreate','Count'),('owed:watchitem DEC-238','Watch'),('owed:secondlook DEC-238','Flag for a second look')], [6,7])
screen('capture', 'Add', 'working', 'Capture a document from an address or a file, photograph a handout, or record what you saw.',
  [('acquire','Capture from an address'),('captureupload','Capture a file or photo'),('testify','Record what you saw or heard'),('capturerequest','Ask for a capture later'),('monitorset','Watch this address'),('monitor','Check it now'),('writinghelp','Help me write this')], [6,7,9,15])
screen('held', 'Held captures', 'working', 'Captures not yet vouched for, per member and project (DEC-97).',
  [('heldcaptures','See held captures'),('release','Vouch for them'),('heldsetaside','Set aside with a reason'),('heldrestore','Restore')], [15])
screen('archive', 'Archive', 'working', 'A captured ZIP: every file with its state (filed with the archive\'s grade and held for review, already held, or not filed with its reason); vouching or setting files aside; an archive refused whole (K1852, DEC-167).',
  [('gradenote','Read the grade note'),('archivelist','List the archive\'s files by state'),('heldsetaside','Set aside with a reason'),('release','Vouch for them')], [15])
screen('open-file', 'Opening a file', 'working', 'Before a file opens: its risk, the safe view, the deeper check, its checks as notes, and a hold released by two members or a second engine; nothing records who opened what (K1888, K1892, K1929, DEC-168).',
  [('openoriginal','Open the original'),('openwithwarning','Open the original after the warning, without a deeper check'),('safeview','Read the safe view'),('deepercheck','Ask for a deeper check'),('releasescanhold','Release, with a reason')], [7,15])
screen('document', 'Document', 'working', 'One captured document: its copy and grade note, its words by page with citing, its versions set beside each other, the links it carries, the people and organizations it names, and what cites it.',
  [('gradenote','Read the grade note'),('release','Vouch for this copy'),('cite','Cite a passage'),('retire','Retire'),('attest','Attest'),('identityclaim','Say this is a person we follow'),('monitorset','Watch for changes'),('monitor','Check for a new version now'),('findin','Find in this'),('pagetranscribe','Have the assistant read pages'),('transcribe','Type a page\'s words yourself'),('adoptversion','Move my citations to this copy'),('keepversion','Keep citing the version I cited'),('connectionchoose','Choose the mention that counts'),('explore','Explore connections')], [7,15,23])
screen('find-in', 'Find in this', 'working', 'One control on a document, a held set or a project: pick what to find; each result cites its passage and becomes a fact only by a member\'s own act (DEC-164, K1468).',
  [('findin','Find in this'),('standingquestionset','Keep finding this as documents arrive'),('recordpersonfact','Add a fact from this passage'),('recorddatedfact','Record a dated fact'),
   ('standarddeclare','Hold this as a standard'),('recordfact','Read into a money fact'),('tabledeclare','Declare the table'),('cite','Cite in the question'),('search','See all in Find')], [6,10])

# --- projects and questions
screen('project', 'Project', 'working', 'A project\'s home: objective, bar, questions, stage, plans, what the group has at stake here, members.',
  [('promote','Open a question'),('drawquestion','Draw on a question from elsewhere'),('findin','Find in this project'),('projectbarset','Set this project\'s bar'),('projectinvite','Invite a member to the project'),('projectvisibilityset','Change who can find it'),('projectownerremove','Stand down as owner'),('projectowneradd','Make an owner, or agree to it'),('projectremove','Remove a member'),('projectleave','Ask to leave this project'),('owed:projectfork DEC-237','Start a project from this one'),('projectownerrescue','Become the owner of an ownerless project'),
   ('projectjoin','Join'),('planopen','Plan what to do'),('owed:projectstakeset K3230','Save this project\'s stake'),('writinghelp','Help me write this')], [6,9,15])
screen('projectai', 'AI for this project', 'working', 'Who pays for the assistant\'s work in a project: its own API key, or its sole member\'s sign-in; what it pays for; its limits; its use summed, naming no member; keeping the project\'s material away from AI; every change, seen by every owner (DEC-188).',
  [('projectkeyset','Hold the project\'s API key'),('projectsigninset','Use your own sign-in for the project'),('projectaccountswitch','Switch the project\'s account on or off'),('projectaccountremove','Remove the project\'s account'),('projectkeynoticeseen','Read what the project\'s key means'),('accountusesset','Set what the project\'s account pays for'),('ailimitset','Set a limit on the project\'s account'),('projectaikeepaway','Keep the project\'s material away from AI, with a reason')], [])
screen('question', 'Question', 'working', 'A question and what supports it or cuts against it; what each cited passage carries; strength against the bar; its readings and the one a project stands on; what relies on it; concluding.',
  [('cite','Cite a passage'),('sever','Remove a citation'),('reinstate','Reinstate'),('narrow','Narrow the question'),('conclude','Conclude'),('withdrawconclusion','Withdraw the conclusion'),
   ('hypothesishold','Keep a hunch'),('planopen','Plan what to do'),('checkrequest','Ask for a check by expertise'),
   ('heldrestore','Restore a set-aside document, with a reason'),('search','Find another source'),
   ('inquiryground','Say what each passage carries'),('versionaccept','Accept a reading'),('versionhide','Hide a reading'),('owed:versionconsider DEC-235','Weigh a reading'),
   ('owed:versionreject DEC-235','Reject a reading'),('owed:versionrevert DEC-235','Undo the decision on a reading'),('owed:versioncurrent DEC-235','Stand on a reading for a project'),('owed:readtranslate DEC-240','Read in my language')], [6,9,15,16])
screen('answers', 'Ask', 'working', 'Ask in plain words (with the assistant) or by search (without); keep asking.',
  [('ask','Ask'),('ruleanswer','Show how this was counted'),('search','Search instead'),('standingquestionset','Keep asking this'),('standingquestionend','Stop asking')], [17,18])
screen('assistant', 'The assistant panel', 'dock', 'Docked beside the screen it serves; runs only on the member\'s own account.',
  [('airunopen','Ask the assistant to work on this'),('suggest','Suggest'),('airunclose','Stop the run')], [17])

# --- the record's subjects
screen('people', 'People', 'working', 'A directory of the people and organizations the record follows, never the group\'s own members (Settings › Members): search and filters (office or body, project, newest added), each row with who they are today, how many documents, questions and projects name them and when the newest was added, those in the member\'s projects first; a row opens the person, and "Explore connections" starts from it; an empty state saying how someone enters the record, and a search that finds no one (Bob\'s D8, K3061; DEC-203; replaces interface-shell R29\'s Find over people).',
  [('search','Search people and organizations'),('explore','Explore connections'),('entitycreate','Add someone the record follows')], [10,13])
screen('person', 'Person', 'working', 'A person or an organization the record follows: positions, career, credentials, memberships, interests, statements; same person?; what the group says about them (other names, declared ties, the documents that may name them) (DEC-233).',
  [('person','Open the person'),('explore','Explore connections'),('recordpersonfact','Add a fact from a document'),('identityclaim','Say another record is this person'),('withdrawidentityclaim','Withdraw a same-person claim'),('followregister','Follow a register'),('personexpunge','Remove a fact where the law requires'),('entityalias','Add another name'),('relationdeclare','Declare a tie'),('resolve','Match a document to them'),('resolvetestify','Say from what you know that a document names them'),('connect','Connect the documents that name them'),('writinghelp','Help me write this')], [10])
screen('timeline', 'Timeline', 'working', 'What they did and what we did, in two lanes (K1462, K1494).',
  [('createevent','Record an event'),('addparticipant','Add who took part'),('relate','Link events'),('recorddatedfact','Record a dated fact'),('hypothesishold','Keep a suspected cause as a hunch'),('findin','Look for dates in this project')], [11])
screen('money', 'Money trail', 'working', 'Money facts with stage and period; a trail; reconciling sources (K1457, K1468).',
  [('recordfact','Read a figure into a money fact'),('createset','Start a money trail'),('include','Include with a reason'),('exclude','Leave out with a reason'),('reconcile','Compare two sources'),('committedagainstpaid','Committed against paid'),('authoritychain','What authorized it'),
   ('findin','Look for it in this project'),('actioncreate','Ask the city for the record'),('createevent','Record when it moved'),('gradenote','Why B, and what would raise it'),('acquire','Get the city\'s own copy'),('checkrequest','Ask a member who knows budgets'),('hypothesishold','Keep my reading as a hunch')], [12])
screen('calculation', 'Calculation', 'working', 'A computed fact with its method, or a member\'s spreadsheet bound to the record.',
  [('calculationcreate','Work it out'),('tabledeclare','Declare the table'),('calculationdraw','Draw a random sample'),('addworkbook','Bind your spreadsheet'),('bind','Tie an input to the record'),('recordcheck','Record a second member\'s check'),('calculationaccept','Accept the result'),('testify','Record what you saw at a report'),('spotcheckvisit','Count it for the drawn report')], [9])
screen('help-records', 'Help: How a records request works', 'working', 'What your state\'s public records law requires of the office, your city\'s faster request where it has one, what the city\'s portal shows, and what Civicsmith does with a request; the place\'s own facts come from the group\'s places (Bob\'s D13, K3060; DEC-209; B177).',
  [], [7])
screen('help', 'Help: How spot-checks work', 'working', 'A help page: one method explained in plain words, linked from where it is used (Bob, 7 October).',
  [], [9])
screen('explore', 'Explore connections', 'working', 'Chains between a start and an end, each step cited and graded (K1469, K1487).',
  [('explore','Explore'),('explorepreset','Use a preset'),('exploreverify','Check a chain'),('stepsource','Attach a source to a declared step'),('promote','Open a question from this chain')], [13])
screen('proceeding', 'Proceeding', 'working', 'A court case or regulatory proceeding: parties, register, orders and their dates.',
  [('entitycreate','Register the proceeding'),('recordline','Add a party by role'),('followregister','Follow its register'),('declare','Hold an order as obligations'),('courtlink','Link a decision to what it interprets')], [14])
screen('due-date', 'How this date was worked out', 'working', 'A due date\'s basis and counting; confirm it; download it (K1431, K1444).',
  [('clockpropose','Work out the due date'),('clockadopt','Confirm the due date'),('reminderset','Remind me')], [7,8])
screen('standard', 'Standard', 'working', 'A requirement the city set itself, held and searchable.',
  [('standarddeclare','Hold this as a standard'),('standardadopt','Adopt a proposed standard'),('lawrelate','Relate to a law')], [6,14,22])

# --- deciding and acting (bound sketches: the plan page, start and send)
screen('plan', 'Action plan', 'working', 'The approved plan page: subjects, options, scenarios, what each option became (K608 (4)).',
  [('plansubjectadd','Add a subject'),('optionadd','Add an option'),('planask','Ask the assistant for options'),('optionadopt','Adopt a suggestion'),('optiondispose','Choose or decline'),
   ('scenarioset','Lay out a scenario'),('checkpointrecord','Judge a checkpoint'),('optionstartpreview','Start…'),('planclose','Close the plan'),('itemtakeup','Take an item up yourself')], [22])
screen('start-send', 'Start and send', 'working', 'The bound start-and-send flow: refusals first, reason in place, approve then record the send (DEC-115).',
  [('optionstartpreview','See what starting does'),('optionstart','Start the action'),('communicationprepare','Prepare what is sent'),('filingprepare','Prepare the filing'),('filingapprove','Approve this text'),('filingrecordsent','I have sent it'),('filingsecondapprove','Give the second approval'),('owed:actionstake K3230','Save this action\'s stake'),('writinghelp','Help me write this')], [7,22])
screen('request', 'Request records', 'working', 'A records request: the office by role, what is wanted, the law, the text, approving and recording the send.',
  [('addresseesuggest','Choose the office'),('actioncreate','Start the request'),('actionlaws','Choose the law it goes under'),('communicationprepare','Prepare the text'),('filingapprove','Approve this text'),('filingrecordsent','I have sent it')], [7])
screen('action', 'Action', 'working', 'One action: replies, deadlines, the law it goes under, its risk tier, pressure, holds; a question opened when no reply is recorded.',
  [('actionmove','Move the action'),('actioncorrespond','Record a reply'),('actionpressure','Mark a reply as pressure'),('reminderset','Remind me'),('actionhold','Record a litigation hold'),('actionscope','Make the action confidential, or not'),('actionrisktier','Revise the risk tier, with a reason'),('actionlaws','Change the law it goes under'),('actionlawspropose','Propose another law'),('owed:actioninquiry DEC-239','Open a question from this')], [7,22])
screen('matter', 'Matter', 'working', 'One government act: determination, consequences, escalation, actions.',
  [('escalationopen','Open an escalation'),('escalationadvance','Advance'),('declinetoescalate','Decline to escalate, with a reason'),('escalationend','End'),('escalationstoppursuing','Stop pursuing, with a reason'),('escalationreopen','Reopen where it stopped')], [22])

# --- publishing
screen('case-editor', 'Case', 'working', 'Prepare the case: scope, statement, what it leaves out, bias, timeline, people named.',
  [('casedraft','Prepare the draft'),('whatchangedpropose','Draft "what changed"'),('statementack','Acknowledge what it leaves out'),('attribute','Name a person with the reason'),('writinghelp','Help me write this')], [15,23])
screen('review-copy', 'Review copy', 'working', 'A named outsider\'s revocable view of the draft.',
  [('reviewgrant','Share for review'),('reviewrevoke','Stop sharing'),('reviewcomment','Comment')], [21])
screen('ceremony', 'Publication ceremony', 'working', 'The required wizard: checks, disclosures, ties confirmed, preview, then signing inside the ceremony (Bob\'s D9, K3060; Q4): when it becomes public, the password asked again (D3), the member\'s own device confirming the key, signed and waiting or published; no key in this browser, a phone, a member who isn\'t an owner (DEC-207).',
  [('publishpreflight','Check before publishing'),('publishtensions','See what must be disclosed'),('caseratify','Sign and publish now'),('publish','Confirm your ties and prepare the edition for signing'),('publishat','Sign now and publish at a set time, checked again then'),('obscuremark','Mark who and what to obscure in a photo'),('obscuremarkwithdraw','Withdraw a mark on a photo, with a reason'),('signerregisterown','Register a signing key in this browser'),('signrequest','Ask an owner to sign'),('publishatmove','Move the publishing time'),('publishatcancel','Cancel publishing')], [15,24])
screen('review-outside', 'A review copy, from outside', 'published', 'What an outside reviewer sees from a review link: the draft, how long the link works, and their comment (journey 21; DEC-201).', [('reviewcomment','Send your comment'),('statementack','Acknowledge what the case does not cover')], [21])
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

# DEC-242 (S4): themes on the document, the question and Find (connections R39 to R46).
_THEME_ACTS = {'document': [('themeplace','Place it in a theme'),('themepropose','Propose it for a theme'),('themewithdraw','Reject a hunch, with a reason')],
  'question': [('themeplace','Place a passage in a theme')], 'finder': [('themeread','Filter by theme')]}
for _s in S:
    for _op, _l in _THEME_ACTS.get(_s['id'], []):
        _s['acts'].append(dict(op=_op, label=_l))
