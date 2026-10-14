# T49's words owed by the design (DEC-253; DEC-252's owed: line, BOB's N1075): affordances' ten vocabularies and standards'
# sentences, keyed so each module reads them from words.json instead of carrying its own English.
# Key rules (DEC-253): a vocabulary value is label.<set>.<value>, the set its name without underscores, the value as the
# module holds it with spaces made underscores; a role is label.lineroles.<kind>.<role>. connection_kinds keys only its own
# kinds: line:<kind> reads label.linekinds.<kind>, line:holds:<capacity> reads label.connectionkinds.holds with
# label.linecapacities.<capacity>, and same_as, not_same_as, unsure read label.identityclaimkinds.<value>.
# Words sit inside a line ("Mayor's Office · part of · City of Oakland"), so they are lower case. An owner's registered word
# (affordances R39) is kept as written unless a note says the design's governs (DEC-252 (2)).
# Run: python3 words-t49.src.py, then node build_words.mjs.
import json, os
W = []
NC = ' Nothing was changed.'
NW = ' Nothing was written.'
def w(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note=('DEC-253: ' + note) if note else 'DEC-253'))
def vocab(setname, pairs, note=''):
    for v, t in pairs:
        w(f'label.{setname}.{v.replace(" ", "_")}', t, False, note)

# --- affordances: the ten vocabularies (R39)
vocab('linekinds', [('part_of','part of'),('post_in','a post in'),('holds','holds'),('reports_to','reports to'),('oversees','oversees'),
  ('appoints','appoints'),('seat_on','a seat on'),('funds','funds'),('contracts_with','has a contract with'),('acts_for','acts for'),
  ('responsible_for','responsible for'),('custodian_of','keeps the records of'),('successor_of','successor of'),('belongs_to','a member of'),
  ('educated_at','studied at'),('credentialed_by','holds a credential from'),('owns_interest_in','has an interest in'),('related_to','related to'),
  ('associate_of','an associate of'),('party_to','a party to'),('appeal_of','an appeal of'),('consolidated_with','consolidated with'),
  ('remanded_to','remanded to'),('arises_from','arises from')], 'a line between two entities, read between their names')
vocab('linecapacities', [('employee','employee'),('elected','elected'),('appointed','appointed'),('acting','acting'),('interim','interim'),
  ('ex officio','ex officio'),('board member','board member'),('officer or director','officer or director'),('partner','partner'),
  ('military service','military service'),('volunteer','volunteer'),('contractor','contractor'),('other','other')], 'the capacity in which a post is held')
vocab('lineroles', [('reports_to.administrative','administrative'),('reports_to.functional','functional'),('reports_to.budgetary','budgetary'),
  ('contracts_with.buyer','buyer'),('contracts_with.procuringEntity','purchasing agency'),('contracts_with.supplier','supplier'),
  ('contracts_with.tenderer','bidder'),('contracts_with.funder','funder'),('contracts_with.enquirer','inquirer'),('contracts_with.payer','payer'),
  ('contracts_with.payee','payee'),('contracts_with.reviewBody','bid protest reviewer'),('contracts_with.interestedParty','interested party'),
  ('party_to.plaintiff','plaintiff'),('party_to.defendant','defendant'),('party_to.petitioner','petitioner'),('party_to.respondent','respondent'),
  ('party_to.appellant','appellant'),('party_to.appellee','appellee'),('party_to.cross_complainant','cross-complainant'),
  ('party_to.cross_defendant','cross-defendant'),('party_to.intervenor','intervenor'),('party_to.real_party_in_interest','real party in interest'),
  ('party_to.amicus','friend of the court (amicus)'),('party_to.applicant','applicant'),('party_to.protestant','protestant'),
  ('party_to.complainant','complainant'),('party_to.interested_party','interested party'),('party_to.other','other')],
  "an entity's role on a line, by the line's kind; American usage (bidder, inquirer), a court's and a commission's own terms kept")
vocab('moneykinds', [('revenue','revenue'),('expenditure','expenditure'),('transfer','transfer'),('allocation','allocation'),('payment','payment'),
  ('contribution','contribution'),('gift','gift'),('income','income'),('behested','behested payment'),('settlement','settlement'),('debt','debt'),
  ('balance','balance'),('fee charged','fee'),('other','other')], "what a sum of money is; a behested payment is California's term")
vocab('moneyphases', [('proposed','proposed'),('adopted','adopted'),('adjusted','amended'),('actual','actual')], "a budget figure's phase")
vocab('moneystages', [('encumbered','committed'),('incurred','spent'),('paid','paid'),('assessed','billed'),('collected','collected')], "where a sum stands")
vocab('moneybases', [('budgetary','budgetary basis'),('cash','cash basis'),('modified accrual','modified accrual basis'),('accrual','accrual basis'),
  ('undetermined','basis not stated')], 'the accounting basis a figure is reported on')
vocab('moneyprecisions', [('exact','exact'),('rounded','rounded'),('approximate','approximate'),('range','a range')], 'how precise a figure is')
vocab('identityclaimkinds', [('same_as','claimed the same person'),('not_same_as','claimed not the same person'),('unsure','unsure whether the same person')],
  "a member's claim about two records of people; the design's words govern the owner's \"same person?\" (a claim, not a question)")
vocab('connectionkinds', [('proxy_for','proxy for'),('member_of','a member of'),('overlaps','overlaps'),('money_flow','money'),
  ('law_amends','amends'),('law_repeals','repeals'),('law_renumbers','renumbers'),('law_recodifies','recodifies'),('law_refers_to','refers to'),
  ('law_defines','defines a term of'),('law_excepts','makes an exception to'),('law_implements','implements'),('law_incorporates','incorporates'),
  ('court_interprets','interprets'),('court_applies','applies'),('court_holds_invalid','holds invalid'),('court_requires','requires'),
  ('in_force_at_event','was in force on the date of')], "a connection's own kinds; member_of reads \"a member of\" as the line's belongs_to does")
w('label.connectionkinds.holds', 'held the post ({capacity})', False, '{capacity} is label.linecapacities.<capacity>')

# --- standards (R45; DEC-145)
vocab('standardforce', [('requires','Requires'),('recommends','Recommends'),('allows','Allows'),('mandatory','Required')], "a provision's force, beside its own words")
w('label.standardforce.discretionary', 'At the discretion of {holder}', False, "a policy's discretionary provision")
w('standard.discretion.holder.none', 'an office not named', False, '{holder} when the record names none')
w('label.standardcriteria.stated', 'criteria stated', False, 'beside a discretionary force')
w('label.standardcriteria.none', 'no criteria stated', False, 'beside a discretionary force')
vocab('standardaccess', [('free','Free to read'),('reading_room','Reading room only'),('paywalled','Behind a paywall')], "how a standard's text can be read; none when not stated")
vocab('standardheld', [('cited','Cited, not seen'),('absent','Looked for, not found')], 'a standard held without its text')
w('standard.held.cited.by', 'Cited by {source}', False, 'beside "Cited, not seen"')
w('standard.held.absent.searched', 'Looked for in {where}', False, 'beside "Looked for, not found"')
vocab('standardcopy', [('official','Official copy'),('codifier','A code publisher\'s copy'),('in_force','The copy in force'),('draft','Draft'),
  ('superseded','Superseded'),('production','Produced in response to a request'),('vendor_model','A vendor\'s model policy'),
  ('undetermined','Kind of copy not known')], 'the copy a member declares a capture to be')
w('standard.binding.binds', 'Standard · binds {body}')
w('standard.binding.benchmark', 'Benchmark · not binding on {body}')
w('standard.binding.unknown', 'Whether this binds {body} is not recorded')
w('standard.binding.body.none', 'the body', False, '{body} when the record names none')
w('standard.policy.owner', '{issuer} policy', False, 'a policy always with its owner')
w('standard.notpublic', 'Not public', True, 'never "confidential"')
w('standard.notpublic.releaseby', 'Only {who} can release it', False, 'beside "Not public"')
w('standard.text.withheld', "This standard's words can be read only by the group's members, inside the group.", False, 'in place of a reading-room or paywalled text, for a reader outside the group')
w('standard.note', 'A standard as the record holds it: what it is and where it comes from, never whether it is a good one. Each passage says whether a newer capture of its document still holds it; nothing is moved.')
w('standard.inforce.known', 'Known to be in force through {through}, from {source}, recorded by {author}', False, "standards' T36 owed words")
w('standard.source.capture', 'capture {capture}, {extent}', False, '{capture} is the first twelve characters of its fingerprint')
w('standard.source.capture.whole', 'capture {capture}', False, 'when no extent is named')


# --- DEC-254 (Bob's S24: A): a member may write a reading herself, marked as hers, accepted by concluding on it
def w4(key, en, prot=False, note=''): W.append(dict(key=key, en=en, protected=prot, note='DEC-254' + (': ' + note if note else '')))
w4('question.conclude.own.choice', 'Write the reading yourself', False, 'beside the readings to conclude on; offered with or without the assistant')
w4('question.conclude.own.field', 'Your reading')
w4('question.conclude.own.help', "Say in your own words what the cited passages show. It is marked as yours, not the assistant's, and concluding on it accepts it in the same act.")
w4('question.reading.by.member', 'Written by {member}', True, "a member's own reading; never marked machine work")

# --- DEC-255 (Bob's S25: B): the stewards may decline or remove a listing on civicsmith.org, only under a published rule
def w5(key, en, prot=False, note=''): W.append(dict(key=key, en=en, protected=prot, note='DEC-255' + (': ' + note if note else '')))
w5('site.groups.rule', "The people who make Civicsmith decline or remove a listing only under the listing rule below, never for a group's views or for whom it holds to account. A group is always told why.", True, "under Groups at work")

# --- DEC-256: T49's requirements against the screens: the refusals drawn by their words (DEC-83: what happened, then what to do)
def w6(key, en, prot=False, note=''): W.append(dict(key=key, en=en, protected=prot, note='DEC-256' + (': ' + note if note else '')))
for code, t in [
  ('PROJECT_VISIBILITY_NOT_THE_OWNER', "Only the project's owners can change whether it can be found; administrators and the group's founder cannot. Ask an owner." + NC),
  ('PROJECT_VISIBILITY_NO_OWNER', 'A project can be findable only when it has an owner, and this one has none. Leave it hidden, or give it an owner first.' + NW),
  ('NAME_TAKEN', 'A project in this group already has that name. Choose another.' + NW),
  ('CONSENSUS_REQUIRED', 'Your endorsement is recorded. While the group has two or more administrators, a new one is invited only once every administrator endorses. Still to endorse: {awaiting}.'),
  ('OWNERS_ARE_ACTIVE', 'This project still has active owners: {owners}. An administrator adds an owner only when every owner is inactive. Ask one of them.' + NC),
  ('NO_REASON', 'This needs a reason, and none was given. Write one.' + NW),
  ('NO_CLAIM', 'There is nothing to conclude on yet: the project must first stand on a reading of this question. Accept a reading, or write your own, then conclude.' + NW),
  ('ANSWER_MALFORMED', "The assistant's answer came back incomplete ({field} missing), so none of it is shown. Ask again." + NW),
  ('RISK_TIER_UNCHANGED', 'This action already has that risk tier.' + NC),
  ('CRUCIAL_IN_BATCH', 'Crucial material is never vouched for in a batch, and {count} of these are crucial. Vouch for each of them on its own. Nothing in the batch was vouched for.'),
  ('ENTRY_REQUIREMENTS', 'Some of these are not complete enough to vouch for: {offenders}, each missing what it names. Complete them or leave them out. Nothing in the batch was vouched for.'),
  ('STATEMENT_ACK_NO_REASON', 'An acknowledgement of a statement is recorded with your own words on it, and none were given, or they are longer than 2,000 characters. Write them.' + NW),
  ('DOOR_RATE_LIMITED', 'Too many requests came from your connection in the last ten minutes. Try again in {minutes} minutes.' + NW),
]: w6(f'refusal.{code}', t, False, "T49's requirement draws it by its words")
w6('question.empty.conclude.own', 'Nothing to conclude on yet: a conclusion adopts a reading, the assistant\'s accepted or one you write yourself, and a reading stands on cited passages.', False, "replaces question.empty.conclude's sentence after S24")

# --- DEC-256: T49's requirements drawn on the screens (each note names its requirement)
w6('question.adddoc', 'Add a document', False, "screens-inquiry R38: on the question, opening Add with the question as its subject")
w6('question.adddoc.tip', 'Opens Add, set to this question: what you capture is held for you to vouch for, then ready to cite here.', False, 'screens-inquiry R38')
w6('project.adddoc', 'Add a document', False, "screens-inquiry R38: on the project, opening Add with the project as its subject")
w6('project.adddoc.tip', 'Opens Add, set to {project}: what you capture is held for you to vouch for, then filed in it.', False, 'screens-inquiry R38')
w6('question.plan.link', 'Its plan: {plan}', False, "screens-inquiry R36: after planopen, the plan's name, a reference opening it")
w6('question.plan.link.tip', 'The action plan opened from this question: what the group means to do about it, and what each option became.', False, 'screens-inquiry R36')
w6('projectai.notjoined', "You haven't joined {project}. Its members see here who pays for the assistant's work in it, for which uses and up to what limits. Join the project to see it.", False, 'screens-inquiry R37: beside "Join" (projectjoin) where she may join')
w6('screen.findin.cite.supports', 'Supports', False, 'screens-daily R24: beside each "Cite in the question", under screen.document.cite.role; none preselected')
w6('screen.findin.cite.against', 'Cuts against', False, 'screens-daily R24: as above')
w6('screen.findin.cite.norole', 'Choose first whether this passage supports the question or cuts against it. Nothing was cited.', False, 'screens-daily R24: refused in place until a role is chosen')
w6('screen.findin.cite.norole.summary', 'Citing before choosing', False, 'screens-daily R24: where the refusal is shown')
w6('setup.member.heading', 'Your group is set up', False, 'screens-entry R19: setup opened by a member, or an administrator who is not the founder')
w6('setup.member.sub', "Your group's Civicsmith is already set up, so there is nothing to do here. Your group's work is on Home.", False, 'screens-entry R19')
w6('setup.member.home', 'Go to Home', False, 'screens-entry R19')
w6('setup.member.home.tip', "Your group's home: what needs you, and what changed since you last looked.", False, 'screens-entry R19')
w6('screen.explore.nocentre', 'Choose where to start: a person, an organization, a document or a payment. Its connections are then drawn here, each step cited and graded.', False, 'screens-investigate R29: explore opened with no centre')

# --- DEC-257: the drawn screens reconciled with the words (K3268): every sentence a member reads on a screen is a keyed word,
# word for word (check_words_drawn.mjs). Where an adopted row (DEC-252) and the drawing differed, the drawing governs and the
# row is reworded (REWRITE7); where a design row differed, the row governs and the drawing was changed. A sentence that
# carries sample data is keyed as a template, the drawing an instance of it.
def w7(key, en, prot=False, note=''): W.append(dict(key=key, en=en, protected=prot, note='DEC-257' + (': ' + note if note else '')))
REWRITE7 = {
  'screen.capture.file.wherehelp': 'Filled from the photo where it says; correct it if it is wrong.',
  'screen.setup.otp.help': "Filled in for you when you continued from the installer's last page, where it was shown once. Opening this page another way? Type the password you saved there. Lost it? Whoever can sign in to the Cloudflare account can set a new one.",
  'screen.setup.security.scanner': 'Civicsmith scans every file it captures with its own scanner and opens risky ones in a safe view.',
  'screen.setup.assistant.own': "Any member may connect their own Claude subscription or API key, which then serves only them, unless you keep your group's material away from AI.",
  'screen.setup.places.now': 'The places whose rules apply',
  'screen.ties.either': 'Either way the tie is disclosed to readers of the case. Inside the group, only you and the administrators see this list.',
  'screen.money.tension': "Each column is read from the figure's own source, as it writes it, never guessed; when it moved comes from the event the figure is tied to, never its accounting period. Adding evidence never changes a figure: it is a new fact or event beside it, with its own source. New evidence may agree or disagree; where two sources disagree, both stay, shown in tension, and the table never picks one.",
  'screen.help.random.p': 'Civicsmith draws the sample from a recorded seed. Anyone, including the city or a reporter, can repeat the draw and get exactly the same items, so no one could have picked the easy or the damning ones.',
  'screen.imported.none': 'No case imported yet. Choose a case file to import the first.',
  'screen.projectai.keepaway.head': "Keeping this project's material away from AI",
  'screen.proceeding.register': 'Register the proceeding',
  'screen.connect.apikey.help': "In your web browser: go to console.anthropic.com, sign in, add a payment method, then API keys › Create key, and paste it here. Anthropic bills you for each use. Your group's Civicsmith keeps it sealed, never shows or exports it, and uses it only for your questions.",
  'screen.capture.file.choosehelp': 'on a phone, the camera opens',
  'screen.home.strip.group': 'Needs the group',
  'screen.find-in.scope.project': 'Everything in {project} ({count} documents)',
  'screen.home.line.languages': 'languages: {languages}',
  'screen.home.line.ailimit': "This month on the group's key: {used} of the {limit} limit",
  'screen.project.questions.empty': 'Start with one question the record could answer, such as “{example}”. Documents, notes and plans gather under it.',
  'screen.project.account.project': "Paid for by the project's own API key",
  'screen.question.opened': 'Opened by {name}, {date} · {project}',
  'screen.question.opened.noproject': 'Opened by {name}, {date}',
  'screen.question.strength.raise': 'What raises it: {raise}',
  'screen.setup.lede': 'You are not a member of anything yet. Claim what you just installed with the one-time password and it becomes yours to run; then name your group and choose its places. Seven short parts; you can leave and come back.',
  'screen.setup.own.help': 'At least 12 characters. From now on you sign in with your handle and this, never the one-time password.',
  'screen.entry.codes.what': 'Once you have claimed, you get ten one-time codes. If you ever lose your password, one of them lets you set a new one; Civicsmith sends no email, so they are your way back in. They are shown once: save them with your password, somewhere only you can reach.',
  'screen.setup.domain.help': 'Only if your group has a website you can put a file on. Verifying it lets readers confirm a published case really comes from you: Civicsmith gives you one small file to place on the site, then checks it. Your public page will name the site, so a group that wants to stay unnamed leaves this empty. You can add it later.',
  'screen.setup.places.help': "The places Civicsmith holds the rules for: their deadlines, holidays, offices and records laws, each with its source. Your place not listed? Choose “Other”: everything else works, and you enter due dates and offices yourself. New places arrive with Civicsmith's releases.",
  'screen.setup.assistant.what': "The assistant is an optional helper, built on Anthropic's Claude. A member can ask it in plain words to find, read, answer or check things in what your group holds; it can suggest questions and documents, and draft translations. It answers only from what your group holds, gives legal information but never legal advice, and never concludes, signs or sends anything. What it does is labeled as the assistant's. Everything in Civicsmith also works without it.",
  'screen.setup.assistant.paid': "The group's API key. One Anthropic API key, held by your group, serves every member who has no account of their own. Anthropic bills the key's owner for each use, so your group pays. It is off until an administrator switches it on. Each member is told once, before their first question under it, that their questions and the material read to answer them go to Anthropic under the group's account. Administrators see the key's use summed over members, never who used it or what was asked, and set the daily limit and whether the assistant may make suggestions unprompted.",
  'screen.setup.limit': "Each member's daily use of the group's key (optional)",
  'screen.setup.limit.help': "The most one member's acts may use of the group's key in a day. It binds only the group's key, never a member's own account or a project's. More limits, by use or by month, are in Settings › Members.",
  'screen.setup.court.what': "Your group's Civicsmith keeps unpublished work from the public and from the people you look into, but a court order your group cannot defeat can still require anything not public to be shown: members' notes, sources, hidden projects. Some work is unlikely ever to draw such an order; journalists, lawyers and auditors may have protections others lack, such as shield laws or privilege. A group doing work that could draw one should make sure its members understand the risk.",
}
# projects
w7('screen.projects.progress.spotcheck', 'a spot-check under way', False, "a project's progress, after its questions")
w7('screen.projects.invited.hidden', 'hidden: only the members invited know it exists', False, 'beside a hidden project you were invited to')
w7('screen.projects.columns.note', 'Stage: how far the project has come. Members: who works on it. Activity: acts on it each week over the last eight, with the word the bars say; the newest week is darker.', False, "under the projects' table")
# capture
w7('screen.capture.title', 'Add to the record')
w7('screen.capture.address.later', 'Ask for this later', False, "capturerequest's button")
w7('screen.capture.address.watchhead', 'Once it is captured: watching the address')
w7('screen.capture.address.from', "from {office}'s own site", False, "a capture fetched from the office's own site")
w7('screen.capture.address.watchbutton', 'Watch this address for changes', False, "monitorset's button")
w7('screen.capture.file.taken', 'taken {date}, {time}, by the phone that took it', False, "a photo's own record of when it was taken")
w7('screen.capture.file.location', 'location in the photo: {place}')
w7('screen.capture.file.zip', "A ZIP archive is opened as it is captured: its files are held for review beside it, each with the archive's grade.")
w7('screen.capture.saw.photo', 'Add a photo or recording you made then')
w7('screen.capture.saw.photo.optional', 'optional; it is kept beside your account')
w7('screen.capture.saw.record', 'Record what you saw', False, "testify's button")
# find-in
w7('screen.find-in.scope.this', 'This document: {document}', False, 'a choice of where to look')
w7('screen.find-in.office.heldby', '{office}, held today by {name}')
w7('screen.find-in.date.period', 'a period, counted from each {item}', False, 'what kind of date a match is')
w7('screen.find-in.date.own', "the document's own date", False, 'what kind of date a match is')
w7('screen.find-in.date.table', 'a table: its dates are counted through a calculation, never read in one by one')
w7('screen.find-in.standard.held', 'Held as a standard by {name} on {date}')
w7('screen.find-in.money.none.one', 'This document has no money figures.')
w7('screen.find-in.money.none.all', 'Neither document has money figures.', False, 'when it looked in two documents')
w7('screen.find-in.person.named', 'named in {count} of the {total} documents')
w7('screen.find-in.person.first', 'first in {document}')
w7('screen.find-in.seeall', 'See all {count} in Find')
w7('screen.find-in.proposed.head', 'Proposed by the assistant')
w7('screen.find-in.proposed.notyet', 'Not in the first release.')
w7('screen.find-in.proposed.later', 'Switched on once it has been measured: at your request, and for a question you name, the assistant will also propose people, events and money figures that search can\'t match, such as "{example}" in {document}, a person your group doesn\'t follow yet.')
w7('screen.find-in.proposed.labeled', 'Each is labeled machine work, graded no higher than its method earns, and becomes a fact only by the same acts, by a member.')
# home
w7('screen.home.strip.hint.one', '1 hint to look at')
w7('screen.home.strip.hint.other', '{n} hints to look at')
w7('screen.home.welcome.what', 'The guided start you began when you joined shows you around in about ten minutes more: how the group judges evidence, your settings, and a first step. Stop it at any point and pick it up later here.')
w7('screen.home.welcome.continue', 'Continue the guided welcome')
w7('screen.home.todo.vouch', 'Vouch for {count} photos you captured on {place}')
w7('screen.home.todo.newer', 'Decide on a newer version of {document} you cited')
w7('screen.home.todo.approve', 'Approve {filing}, drafted by {name}')
w7('screen.home.todo.approve.button', 'Read and approve it', False, "filingapprove's button")
w7('screen.home.todo.check', '{name} asked you to check a calculation: {calculation}')
w7('screen.home.group.noreply', "{office}'s reply to “{action}” was due {date}; no reply recorded")
w7('screen.home.group.tension', 'Two documents give different dates for {what}')
w7('screen.home.group.unjudged', 'nobody has judged it')
w7('screen.home.group.requestdue', "{office}'s reply to your records request is due {date}")
w7('screen.home.area.meetbar', '{count} questions meet the bar')
w7('screen.home.area.edition', 'Edition {n} of {case} published {date}; a draft is shared for review until {until}, no comment to answer')
w7('screen.home.area.camein', '{count} things came in since you last looked: {latest}')
w7('screen.home.area.ourmove', 'Our move: {what}, due {date}')
w7('screen.home.area.theirmove', 'Their move: {reply}, none recorded by {date}; {reply2}, due {due}')
w7('screen.home.area.nothing', 'nothing needs you here')
w7('screen.home.area.expertise', 'Expertise on hand: {people}')
w7('screen.home.area.invitation', "{name}'s invitation link is out, unused")
w7('screen.home.since.captured', '{name} captured {document}')
w7('screen.home.since.events', '{name} added {count} events to {timeline}')
w7('screen.home.since.trail', '{name} started the money trail “{trail}”')
# project
w7('screen.project.account.exploring', 'exploring: {frequency}.', False, "after the uses the project's account pays for")
w7('screen.project.account.open', 'Open AI for this project')
w7('screen.project.question.unrated', 'rests on nothing yet', False, 'beside an unrated question')
w7('screen.project.visibility.made', 'Made findable by {name}, {date}: “{reason}”')
w7('screen.project.opened', 'Opened by {name} on {date}.')
w7('screen.project.rescue.opened', 'Hidden project · opened by {name}, {date}', False, 'what an administrator sees of a hidden project whose owners are all gone')
w7('screen.project.rescue.why.help', 'Its members see this beside your name.', False, 'under the reason for projectownerrescue')
# question
w7('screen.question.strength.raise.connection', 'a link the source itself makes, or a shared identifier.', False, 'what raises a short connection grade, after screen.question.strength.raise')
w7('screen.question.gap.undetermined', 'Undetermined, because {reason}', False, "beside the strength; {reason} is the record's own")
w7('screen.question.waits.restore', 'Restore it, with a reason', False, "heldrestore's button where the question waits on a set-aside document")
w7('screen.question.reading.standfor', 'Stand on this one for {project}…', False, "versioncurrent's button on a reading")
w7('screen.question.affirm.head', 'Accepting a reading that rests on parts each enough on its own')
w7('screen.question.theme.passages', "{count} of this question's passages", False, 'beside a theme its passages are in')
w7('screen.question.relies.cites', 'cites this one as a passage', False, 'beside a question that relies on this one')
w7('screen.question.conclude.adopts', "A conclusion adopts one reading as the group's answer, in that reading's own words; it rests on the passages the reading stands on.", False, 'under question.conclude.reading')
w7('screen.question.airun.reading', 'Reading the {count} documents the group holds on {subject} for passages that bear on this question', False, "the assistant's run, while it works")
w7('screen.question.proposal.rests', 'It rests on {count} passages: {passages}.', False, "under the assistant's proposed reading")
w7('screen.question.proposal.testinstance', 'On a test instance, its work also reads: “{label}”', False, '{label} is ai.label.untested')
# ai
w7('ai.machine.request', "Machine work · the assistant, at {who}'s request", False, "machine work run at another member's request; at your own, screen.answers.machine")
# setup
w7('screen.setup.claim.button', 'Claim it and become its administrator', False, "claim's button")
w7('screen.setup.logo.add', 'Add your logo (optional)')
w7('screen.setup.places.chosen', "You chose {place} when you created your group's Civicsmith. Change it here if you need to.")
w7('screen.setup.place.example', 'For example “{place}”.', False, 'before screen.setup.place.wanted.help')
w7('screen.setup.languages', 'Languages your members use')
w7('screen.setup.places.save', 'Save places and languages', False, "profilesset's button")
w7('screen.setup.office.heldby', 'held by {name}')
w7('screen.setup.office.heldsince', 'held by {name} since {year}')
w7('screen.setup.office.roster', "From {office}'s roster", False, 'where an office filled in for you came from')
w7('screen.setup.offices.none', "Nothing is filled in here: Civicsmith does not hold the offices and seats for {place} yet. Add the offices your group deals with yourself, now or at any time; each is marked as added by your group. When an update brings {place}'s rules, your administrators are told once in their queue and can choose it under Places; the offices you added stay.")
w7('screen.setup.people.head', 'Who sees what about people')
w7('screen.setup.people.what', "Facts that come from public documents follow those documents. A project's own notes about a person stay inside that project.")
w7('screen.setup.choice.head', 'What each choice means')
w7('screen.setup.choice.own', "Members' own accounts. Each member who wants the assistant connects their own Claude subscription or their own API key, and it serves only them, at their own cost. Civicsmith uses a subscription only for its own member, and the subscription path needs the Workers Paid plan.")
w7('screen.setup.choice.both', "Both. A member's own account comes first; the group's key serves the rest.")
w7('screen.setup.choice.none', "No assistant. Every journey still works. Members lose asking in plain words, suggestions, translation drafts, and the assistant reading new results for their standing questions; searching, counting and the group's own templates take its place.")
w7('screen.setup.setting.head', 'Setting one up')
w7('screen.setup.setting.groupkey', "The group's key: an administrator creates an API key in Anthropic's Console (console.anthropic.com), under an account that belongs to the group and has a payment method, and pastes it below. Civicsmith seals it and never shows it again. Setting a monthly spending limit in the Console as well is wise.")
w7('screen.setup.setting.own', "A member's own account: each member connects it themselves, from the assistant panel, with a step-by-step guide.")
w7('screen.setup.leaves.head', "What leaves your group's Civicsmith")
w7('screen.setup.leaves.what', "When a member asks, their question and the material read to answer it go to Anthropic, under whichever account serves them. Nothing goes unless a member asks. You can change this choice at any time in your group's settings.")
w7('screen.setup.keepaway.head', 'Keeping your material away from AI')
w7('screen.setup.keepaway.example', 'For example: “{example}”', False, "after the reason field's first sentence")
w7('screen.setup.key.told', "Each member is told once, before their first question under it, that their questions go to Anthropic under the group's account.")
w7('screen.setup.court.matters', 'Work done in Civicsmith can matter. Checking whether officials and agencies keep their own rules can show money misspent, deadlines ignored or promises broken, and a published case can lead to a correction, an audit or a lawsuit. People and organizations a group looks into sometimes go to court to see the work behind it.', True, 'the court notice (protected)')
w7('screen.setup.court.choice', 'The explanation is always one tap away for every member. You choose whether members are also told when they join and the first time they record something not public.', True, 'the court notice (protected)')
w7('screen.setup.security.add', 'Add a tool now', False, "securitytooladd's button")
w7('screen.setup.finished.title', "Your group's Civicsmith is set up.")
w7('screen.setup.handle.after', 'Once chosen, the step says: “{done}” Then it opens Home.', False, '{done} is founder.handle.done')
# --- end DEC-257

# Rows the requirements withdraw (DEC-256): build_words.mjs drops them, failing if one is no longer there to drop
RETIRED = ['screen.forgot.handle.help', 'screen.home.strip.overdue', 'screen.queue.due.overdue', 'screen.setup.taken', 'screen.updates.skip.noreason', 'question.empty.conclude']
# Rows whose words change (DEC-256): never "overdue" on Home or in the queue (screens-daily R31)
REWRITE = {'queue.milestone-overdue.summary': 'Past its date: {milestone}',
           'queue.temporal-expectation-due.undetermined.summary': 'Its date may have passed: {duty}'}

REWRITE.update(REWRITE7)   # DEC-257: rows reworded to the words the screens draw
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'words-t49.json')
open(out, 'w').write(json.dumps(dict(rows=W, retired=RETIRED, rewrite=REWRITE, rewrite_dec={k: 'DEC-257' for k in REWRITE7}), indent=1, ensure_ascii=False) + '\n')
print(len(W), 'rows to', out)
