# DEC-259: the remaining screens keyed (K3268): every sentence a member reads on a screen is a keyed word, word for word
# (check_words_drawn.mjs). DEC-257 keyed the eleven screens on T49's path; this file keys the other fifty-eight, by the same
# rules: where a module's adopted row (DEC-252) and the drawing differed slightly, the drawing governs and the row is reworded
# (REWRITE); where the row is a design ruling's, or the drawing inlined sample data the row has no placeholder for, the
# drawing was changed; otherwise a similar undrawn row under screen.<id>. is reworded, or a new key screen.<id>.<slug> is
# minted. A sentence that carries sample data is keyed as a template, the drawing an instance of it; a sample record (a
# document's title, a file's name, a member's words) is marked .mk-data in the drawing and is not keyed.
# Run: python3 words-drawn.src.py (after words-t49.src.py), then node build_words.mjs, which adds these rows after T49's and
# applies REWRITE in its add(), failing on a reworded key that no row carries.
import json, os
W = []
def w(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-259' + (': ' + note if note else '')))
REWRITE = {}

# account
w('screen.account.explain.help', 'Promptly: every explanation opens when you rest on something for half a second. On a longer pause: marks and names still do; what screens, sections, the rail and acts are waits a second and a half, so less opens while you move. Nothing is ever hidden, and keyboard focus or a tap shows everything at once. New members start with promptly; after a month Civicsmith asks once whether to keep it. Alt+Shift+I or the masthead switches it at any time.', False, 'under the Explanations choice')
w('screen.account.signout.note', "Everywhere ends your sign-in on every phone and computer, this one included. Use it if you lost a device or signed in somewhere you shouldn't have.", False, 'under the two sign-out buttons')
w('screen.account.passwordkey.heading', 'Password and signing key')
# answers
w('screen.answers.count.line', '{rows} rows · {count} with {rule} (a count, method shown)', False, "a table's count without the assistant: {rule} the counting rule as written")
# archive
w('screen.archive.capturedby', 'Captured by {name} from {source}, {date}', False, "under an archive's name: who captured it, from where and when")
w('screen.archive.samefingerprint', 'Anyone can cut the same file out with ordinary tools and get the same fingerprint.')
w('screen.archive.samename', '{count} entries share this name', False, 'two entries of the archive with one name')
w('screen.archive.samename.each', '{count} entries share this name; each is filed by its number')
w('screen.archive.notfiled.password', 'Not filed: the archive locks this file with a password. It is listed, never opened.')
w('screen.archive.notfiled.size', 'Not filed: {size}, over the {limit} limit for one file. Capture the {kind} from its own address.', False, '{kind} the kind of file, such as video')
w('screen.archive.higher.heading', 'A higher grade for one file')
w('screen.archive.higher.how', 'A file here can earn a higher grade only by being captured on its own, from its own source; the new capture lands beside this one, and nothing is regraded.')
w('screen.archive.higher.capture', 'Capture a file on its own', False, 'a link to Add to the record')
w('screen.archive.refused.head', 'Could not open this archive, because {reason}.', False, '{reason} such as "two of its entries claim the same bytes"')
w('screen.archive.refused.note', 'A damaged or tampered archive is refused whole rather than filed in part. If the city has a clean copy, capture it again from its address; it lands beside this one.')
REWRITE.update({
  'screen.archive.summary': 'Opened when it was captured: {filed} files filed and held for review beside it, {held} already held, {notfiled} not filed, {folders} folders.',
  'screen.archive.alreadyheld': 'Already held · the same file {name} captured directly on {date}; this copy is kept as a second sighting of it',
  'screen.archive.folder': 'A folder · its {count} files are listed and filed below it',
  'screen.archive.refused.none': 'Nothing in it is filed. The archive itself stays captured exactly as it arrived, with its grade, and anyone can check why it was refused.',
})
# assistant (the dock)
w('screen.assistant.alone', 'It works for you alone.', False, 'after "On your own account" in the dock: only when your own account serves you')
w('screen.assistant.ask.label', 'Ask about this screen', False, "the dock's question field")
# calculation
w('screen.calculation.sub', 'A computed fact · method shown · recomputed when an input changes', False, "under a calculation's name")
w('screen.calculation.checkedby', 'Checked by {name} ({expertise}, {standing}) on {date}.', False, "a second member's check; {standing} confirmed or declared")
w('screen.calculation.spot.about', "The {count} is {whose} own count: {what}. A spot-check asks whether {claim} meant {meaning}, by visiting a random sample of {items} on the street.", False, "{what} the calculation's question, as written")
w('screen.calculation.found.help', 'Each visit is recorded as what that member saw, with a photo where they took one.')
w('screen.calculation.range.all', 'So of the {size} {items} marked {claim}, between about {lowc} and {highc} were really {answer}, if the {unsure} that could not be judged are like the rest.')
REWRITE.update({
  'screen.calculation.counts': '{visited} of {n} visited: {yes} {answer}, {no} not {answer}, {unsure} could not tell',
  'screen.calculation.range': '{share}% of the {judged} that could be judged were {answer} · exact {confidence}% range {low}% to {high}%',
  'screen.calculation.notsays': 'It does not recount the {size} ({whose} check did that), says nothing certain about any one {item} no one visited, and nothing about the {outside} {items} not {what}.',
})
# case-editor
REWRITE.update({'screen.case-editor.changed': 'What changed since Edition {n}'})
# ceremony
w('screen.ceremony.disclosed.tension', 'An unresolved contradiction: {what}', True, 'disclosed with the case (protected: what readers are told)')
w('screen.ceremony.disclosed.timeline', 'The timeline, frozen at signing ({n} events)', True, 'disclosed with the case')
w('screen.ceremony.when.chosen', 'At a set time: {date}, {time} ({zone})', True, 'the choice of when it becomes public, once a time is set')
w('screen.ceremony.when.note', "Until then the signed edition waits, not public. At {time} Civicsmith checks again; if anything changed since you signed (a source, a member's confirmation of their ties, a hold), it does not publish and tells you once. You can cancel or move the time until then.", True, 'under the choice of when')
w('screen.ceremony.sign.edition', 'Sign and publish Edition {edition}', True, "the signing dialog's heading")
w('screen.ceremony.signs.lines', '{n} lines like these, one for each piece of evidence the {findings} findings rest on: {list}', True, 'what your key signs, after the lines drawn')
w('screen.ceremony.signs.linesabout', 'Each line names one thing and the fingerprint of its exact text. If anything in it changes before you sign, you are asked to sign again.', True)
w('screen.ceremony.publishat.button', 'Sign and publish at {time} on {date}', True, "publishat's button, once a time is chosen")
w('screen.ceremony.photos.rules', "A photo in a format whose areas can't be covered (some phones save HEIC or progressive JPEG) stops the signing, naming the photo: capture it again as an ordinary photo, or stop relying on it. If a mark changes after the case is prepared, prepare it again before signing; if it changes after signing, the case isn't published until it is prepared and signed again. Any member who can see a photo may mark it or withdraw a mark; only a member can, never the machine.", True)
w('screen.ceremony.device.head', 'Confirm on your device', True)
w('screen.ceremony.device.example', "Your device's own window (it looks different on each device)", False, "over a drawing of the device's own window; its words are the device's, not Civicsmith's")
w('screen.ceremony.device.cancel', "If you cancel there, or your device doesn't confirm, nothing is signed or published, and you are back at the last step with everything as it was.", True)
w('screen.ceremony.signed.evidence', 'The {n} pieces of evidence', False, 'a row of what was signed')
w('screen.ceremony.signedat.note', 'The case page and your queue show this until it goes public; then your queue tells you once that it is live. The public page shows when it was signed and when it was published.')
w('screen.ceremony.signednow.told', 'Members who follow this case are told once.')
w('screen.ceremony.nokey.keyfile', 'Unless you keep it on this device, you save it as a key file, protected by a passphrase you choose.')
w('screen.ceremony.nokey.elsewhere', 'Registered a key on another computer? Sign from that one, or register a key here too. Lost a key? Withdraw it under Settings › Your account and make a new one here; cases it already signed can still be checked. Your signing keys are listed there.')
REWRITE.update({
  'screen.ceremony.photo.facts': 'taken by {by}, {date} · relied on by {findings}',
  'screen.ceremony.photos.copy': 'Mark anyone in a photo who is not part of a finding, and any number plate. The public copy shows those areas obscured, labeled “Faces, plates and camera details removed for publication; the group holds the original”, and the original stays inside the group. Every photo a published case carries goes out without its camera details (where and when it was taken, and on which device), labeled “Camera details removed for publication; the group holds the original”. City staff at work are part of what the case is about; obscure one only with a reason.',
  'screen.ceremony.signs.count': 'One confirmation signs all {n}: the edition, its {findings} findings, and the {evidence} pieces of evidence they rest on. Each signature can be checked on its own, so a reader can trust one finding without trusting the rest.',
  'screen.ceremony.signs.case': 'Edition {edition} of {case}',
})
# dash-action
w('screen.dash-action.sub', 'Every clock that is running, whose move it is, replies that came in, and what waits for a second approval.')
w('screen.dash-action.tile.noreply', '{n} with no reply recorded', False, "under the Their move tile")
w('screen.dash-action.nextready', "the plan's next step is ready")
w('screen.dash-action.clock.due', 'The {office} must answer by {date}: {days} days under the {law}, rolled past a holiday.', False, "an action's clock, as a sentence with its rule and date")
w('screen.dash-action.clock.sent', 'Sent {date}; the group gave until {due}.', False, "an action's clock where the group set the date")
w('screen.dash-action.clock.approve', "Approve by {day}, the plan's checkpoint.")
w('screen.dash-action.next.record', 'Record what came back', False, "an action's next step")
w('screen.dash-action.next.escalate', 'Escalate, as the plan sets', False, "an action's next step")
# dash-project
w('screen.dash-project.next.heading', 'Next for you here')
w('screen.dash-project.next.vouch', 'Vouch for the {count} photos you captured at {place}')
w('screen.dash-project.next.newer', 'Decide on the newer version of {document}')
w('screen.dash-project.next.prepare', 'Then Edition {edition} can be prepared: the {count} findings meet the bar')
w('screen.dash-project.glance.heading', 'This project at a glance')
w('screen.dash-project.story.heading', 'The story so far')
w('screen.dash-project.story.undetermined', 'Undetermined order: {events}, both dated by {precision}.', False, '{precision} month or year')
w('screen.dash-project.activity.events', '{name} added {count} events on {day}')
# docket
w('screen.docket.edition.published', 'Edition {n} published, superseding Edition {prior}', True, 'a docket entry (protected: public)')
REWRITE.update({'screen.docket.sub': "The case's public record of corrections, withdrawals and orders."})
# document
w('screen.document.capturedby', 'captured by {name} from {source}, {date}', False, "under a document's name, after its office and revision")
w('screen.document.pagetranscribe.button', 'Have the assistant read pages {pages}', False, "pagetranscribe's button, naming the pages")
w('screen.document.citedby.standard', 'cites {passage} as the standard {office} is held to', False, 'how a question cites this document')
w('screen.document.citedby.against', 'cites {passage}, cutting against {what}', False, 'how a question cites this document')
w('screen.document.links.one', '{n} links on this page; 1 points at a document the group holds.', False, 'document.links.says, where one link is held')
w('screen.document.theme.page', 'Page {page}, placed by {name}, {date}: “{note}”', False, "a theme placed on a page, with the member's note")
w('screen.document.theme.whole', 'The whole {kind}, placed by {name}, {date}', False, '{kind} the kind of document, such as report')
w('screen.document.theme.proposed', 'Page {page}, proposed by the assistant, {date}: “{note}”', False, "a theme the assistant proposed, with its note")
# due-date
w('screen.due-date.step.rolled', '{date} is {why} and {date2} {why2}, both from your profile: rolled to {due}, close of business.', False, 'two days skipped in a row, each from the group profile')
REWRITE.update({
  'screen.due-date.of': "{who}'s reply to your {item}",
  'screen.due-date.step.counted': 'Counted {amount} {units}: to {date}.',
})
# explore
w('screen.explore.sub', 'From {from} to {to}, through {kinds}, as of {date}', False, 'what the walk was asked: {kinds} the kinds followed, such as "money and votes"')
w('screen.explore.graph.from', 'From {name}, as a graph')
w('screen.explore.lead.short', 'a lead, not a finding', False, 'under a chain with a declared or suspected step')
w('screen.explore.stopped.short', 'Stopped at the limit, undetermined beyond {depth} steps.')
# finder
w('screen.finder.named', 'named in {n} documents, among them {document}', False, 'a person or organization among the results')
w('screen.finder.nobody.in', 'Nobody looked in {place} for this yet.', False, 'after the Nobody looked mark')
# forgot
w('screen.forgot.noadmin.heading', 'If no administrator can get in')
w('screen.forgot.noadmin.what', "Whoever holds your group's Cloudflare account can set a new one-time password and an administrator can claim again from it. That is the way back in when every administrator has lost both their password and their codes.")
# front
w('screen.front.allpublished', 'All our published cases', False, 'a link to the published cases')
w('screen.front.invited', 'Invited? Open the link you were sent: it brings you here to join.')
# group
w('screen.group.sub', 'Administrators only. The settings chosen at setup, all changeable here.')
w('screen.group.name.help', 'What people read: at the head of your pages, invitations and published cases. Your short name, {short}, stays fixed.')
w('screen.group.domain.help', 'Verified on {date}: readers can confirm a published case comes from your group. Remove it if your group would rather stay unnamed.')
w('screen.group.court.show', 'Show members the notice, before their first note and in their settings', True, 'the court notice (protected)')
w('screen.group.bar.line', 'Bar: {bar}, set by {name} on {date}')
REWRITE.update({'screen.group.court.field': 'Tell members what a court can reach'})
# group-identity
w('screen.group-identity.other.help', "For example “a tenants' union”, “a students' newspaper”, “a retired auditors' circle”. It helps Civicsmith offer what fits first; it locks nothing.")
w('screen.group-identity.ask.what', "It asks you a few questions about your group, then drafts the focus and the reasons in these fields, each marked “Draft · the assistant's, asked by {handle}”. Nothing is saved until you edit it and keep it; once kept, the words are your group's.")
REWRITE.update({
  'screen.group-identity.other.field': 'Describe your kind of group, in a few words',
  'screen.group-identity.focus.field': 'What you focus on',
  'screen.group-identity.purpose.field': 'Why the group exists, in your own words',
  'screen.group-identity.visibility.choice.public': 'Also our public page and the network directory',
})
# held
w('screen.held.setaside.why', 'Why set it aside?', False, "the reason field for heldsetaside")
REWRITE.update({
  'screen.held.archive.filed': '{count} files held beside it',
  'screen.held.ineligible': 'Not eligible for a batch: {reason}',
  'screen.held.waiting': "{asker}'s question is waiting for {capture}. Your reason is kept on the record and shown to {asker} on the question.",
})
# help-records: the law's particulars (its name, windows, reasons and sections) are the place's data, as placeholders
w('screen.help-records.title', 'How a records request works')
w('screen.help-records.sub', 'Help · for a request under the {law}, to an office in {place}')
w('screen.help-records.faster.in', 'The faster request in {place}')
w('screen.help-records.faster.what', "{place}'s {ordinance} adds the {request}: the office answers within {window}, and the ordinance sets the later limits when it needs more time ({cite}). It suits a small set of records you can describe exactly.", False, "the place's faster request, from its rules")
w('screen.help-records.portal.where', '{place} takes requests through its public records portal ({portal}).')
REWRITE.update({
  'screen.help-records.must.1': 'Answer within {days} days whether it holds records it can release, why or why not, and when they will be ready ({cite}).',
  'screen.help-records.must.2': 'Take longer only by written notice, saying why and when, for reasons the law lists ({reasons}); never more than {extra} extra days ({cite}).',
  'screen.help-records.must.3': 'Help you focus the request: identify the records that fit it, say where they are kept, and suggest ways past practical obstacles ({cite}).',
  'screen.help-records.must.4': 'Release the rest of a record that is partly exempt ({cite}), and refuse only in writing, naming who decided ({cite2}).',
  'screen.help-records.must.5': 'Give electronic records electronically, in a format it keeps them in, when you ask ({cite}).',
  'screen.help-records.must.6': 'Charge only the direct cost of copying ({cite}); for electronic records, of producing the copy, unless it must compile, extract or program data ({cite2}). You may photograph records you inspect, with your own equipment, at no charge ({cite3}).',
  'screen.help-records.must.7': "Never ask why you want them: access can't be limited because of the purpose of a request ({cite}).",
  'screen.help-records.portal.2': "Each request's page shows its full text to anyone, with its dates, the department and the city's contact. Write the request so you are content for anyone to read it.",
  'screen.help-records.portal.3': 'Contact details are optional. Without them you get no updates, and you can collect the records only if the department posts them publicly or you contact it yourself.',
  'screen.help-records.does': 'What Civicsmith does with it',
})
# imported
w('screen.imported.band', "Another group's case: {group} · Edition {edition} · read-only · {recreated} of {findings} findings recreated", False, 'the band across an imported case')
# inbox
w('screen.inbox.same.date', 'same knocker as {date}', False, 'beside a knock: the same sender handed in material on {date}')
# install (the installer's pages, before the group's Civicsmith exists)
def wi(k, en, prot=False, note=''): w('screen.install.' + k, en, prot, note)
wi('sub', 'Two choices here, then Cloudflare. What your group needs first is on civicsmith.org.')
wi('need.cloudflare', 'A Cloudflare account on the Workers Paid plan ($5 a month), with a payment method, belonging to your group rather than to one person.')
wi('need.claude', 'No Claude account: the assistant is optional.')
wi('need.link', 'What you need, on civicsmith.org')
wi('short.heading', "Your group's short name")
wi('names', 'Your group has two names. Its name, such as “{example}”, is what people read; you choose it in setup and can change it whenever you like. Its short name, chosen here, is the fixed label in its web addresses and beside every signature, and can never change.')
wi('permanent', "Your short name is in every address of your group's Civicsmith and beside every signature your members make. It can never be changed, by you or anyone, without setting up your group's Civicsmith again.", True, 'the warning before an irreversible choice')
wi('places.help', 'Each place brings its deadlines, holidays, offices and records laws, each with its source. You can change this later in Settings › Places and offices.')
wi('places.none', 'None of these: we enter due dates and offices ourselves')
wi('cf.title', 'Let this installer into your Cloudflare account')
wi('cf.sub', "Next you go to Cloudflare's own page, sign in there, and allow this installer to set up your group's Civicsmith in your account. Civicsmith never sees your Cloudflare password.", True)
wi('cf.asks', 'What Cloudflare will ask you to allow', True)
wi('cf.programs', "Putting your group's Civicsmith's programs in your account, and its storage for documents and evidence.", True)
wi('cf.plan', 'Reading which plan your account is on.', True)
wi('cf.containers', "Running its containers: the built-in file scanner, the safe view for risky files, and signing in with a Claude subscription. Without them, files are kept and shown but not scanned, and a high-risk file can't be opened.", True)
wi('cf.join', 'Joining its parts together inside your account.', True)
wi('hold.head', "Whoever can sign in to this Cloudflare account controls your group's Civicsmith", True, 'says who can see and control everything')
wi('hold.what', 'They can read everything and lock everyone out, and no vote of administrators can stop them. Use a group account, and add at least one other trusted person to it. It is also the way back in if every administrator is locked out.', True)
wi('progress.title', "Setting up your group's Civicsmith")
wi('progress.sub', 'In the Cloudflare account “{account}”. This takes a few minutes; leave this page open.')
wi('progress.single', 'Checked that this account holds no other Civicsmith')
wi('progress.plan', 'Checked the account is on Workers Paid')
wi('progress.storage', 'Made the storage for documents and evidence')
wi('progress.verified', "Checked the release is Civicsmith's own, signed and unaltered")
wi('progress.placing', "Putting your group's Civicsmith in place…")
wi('progress.scanner', 'Starting the file scanner and safe view')
wi('progress.address', 'Giving it its address')
wi('progress.answers', 'Checking it answers, and that nothing keeps a log of who opens which file')
wi('stopped.exists', "Stopped: this account already holds a Civicsmith. One group's Civicsmith per account is supported for now. Nothing was created. Use another account for this group, or open the one already here.")
wi('stopped.others', "Other steps stop the same way and say what to do: the account is on the free plan (switch to Workers Paid in Cloudflare's dashboard, then start again); no payment method; permission not granted on Cloudflare's page; a log in the account that would record who opens which file. A stop before setup has begun creates nothing.")
wi('ready.sub', 'It answered its own checks. One step is left: you become its first administrator.')
wi('ready.answers', 'It answers at its address')
wi('ready.scanner', 'File scanner and safe view running')
wi('ready.nolog', 'No log records who opens which file')
wi('ready.note', "These checks ran as part of the installation; the installer keeps nothing of your group's Civicsmith once it hands over.")
wi('otp.head', 'Your one-time password: save it now', True)
wi('otp.what', "This makes you your group's first administrator, in the next step. It is shown once, here. Save it somewhere safe, such as a password manager, until you have claimed. Continuing below fills it in for you.", True)
wi('otp.help', 'Works once. When you claim, it is spent and you sign in with a password you choose.')
wi('address.help', "Where you, and later your members, open your group's Civicsmith. Bookmark it.")
wi('probe.summary', 'A probe key, for a monitoring service (most groups never need it)')
wi('probe.help', "Lets a monitoring service check that your group's Civicsmith is running. It reaches only a separate test store, never your group's records. Shown once.")
wi('probe.copy', 'Copy the probe key')
wi('continue', "Continue to your group's Civicsmith: become its first administrator")
# join
w('screen.join.invited.by', '{name} invited you to contribute. This link works once and expires on {date}.')
w('screen.join.again.help', "So a typing slip can't lock you out. The two must match before you can continue.")
REWRITE.update({
  'screen.join.invited': "You're invited to {group}",
  'screen.join.language.help': "Chosen from your device's setting. You can change it any time.",
  'screen.join.handle.help': "The record shows your handle on your work. Choose it with care: it can't be changed after you join, and no one else can ever take it. It needn't be your legal name. Lower-case letters, digits and hyphens, 2 to 41 of them, starting with a letter or digit. Choosing a handle: a name people know lends your work credibility and lets reporters reach you, but puts it on public cases; a pen name shields you from pressure, while the administrators still know who you are.",
  'screen.join.codes.after': "When you join, you get ten recovery codes, shown once: save them, they are how you get back in if you forget your password. Then you are signed in and your group's home opens, with a short guided start you can take or leave.",
})
# notes
w('screen.notes.protects.link', 'What this protects, and from whom', True, 'a link beside "Only you can see these in your group" (protected: who can see)')
# money
w('screen.money.sub.flow', 'from {from}, mostly to {to}', False, "under a trail's name: where its figures run")
w('screen.money.graph.heading', 'Where the money went, as a graph')
w('screen.money.table.how', 'Open a figure to act on it; tick several to act on them together.')
w('screen.money.readby', 'Read by {by} from {source}, p. {page}: {as_read}.', False, '{as_read} the words as the source writes them')
w('screen.money.readby.noquote', 'Read by {by} from {source}, p. {page}.')
w('screen.money.moved.event', 'When it moved: {event}, recorded as an event with that passage.')
w('screen.money.budget.about', 'A budget figure says what was planned, not what happened. The {phase} figure from {source} sits beside it in this trail: {difference}; the two differ in {dims} and are compared, never merged. A later budget change would be read in as an adjustment naming this figure.', False, 'under a budget figure that has a paid figure beside it')
w('screen.money.moved.as', 'posted as {what}', False, 'under the date a figure moved, as the source describes the posting')
w('screen.money.saysneither', 'It says neither where the money went nor on what day.')
w('screen.money.gap.yearonly', 'Undetermined: the source gives only the year.')
w('screen.money.findin.date', 'Look for its date in this project', False, "findin's button, looking for the day a figure moved")
REWRITE.update({
  'screen.money.didnotmove': 'did not move: a {phase} figure, adopted {date}',
  'screen.money.gap.to': 'Undetermined: not stated in {source}, the only source holding this figure.',
})
# open-file
w('screen.open-file.risk.low.short', "Fetched by your group's Civicsmith; nothing in it acts on its own.", False, 'beside the Low risk mark')
w('screen.open-file.risk.high.short', "Handed in, not fetched by your group's Civicsmith; {why}.", False, 'beside the High risk mark; {why} such as "it contains a macro"')
w('screen.open-file.handedin', 'Handed in at the doorbell, {date}')
w('screen.open-file.deeper.notasked', 'not asked for yet', False, 'the state of a deeper check')
w('screen.open-file.warn.why', "Why it is high risk: it was handed in, not fetched by your group's Civicsmith, and {why}. No scanner has found anything in it; the built-in scanner checked it on {date}.", True, 'the warning before opening a high-risk original')
w('screen.open-file.warn.accept', 'Open the original, accepting this', True, "openwithwarning's button inside the warning")
w('screen.open-file.found.by', 'The built-in scanner found {finding} on {date}, and so did {tool} in the deeper check.')
w('screen.open-file.found.resembles', 'Scanners report what a file resembles; sometimes a safe file is flagged, which is what a release is for.')
w('screen.open-file.found.sent', 'sent once to the members who can see it', True, 'who is told of a finding (protected: who can see)')
w('screen.open-file.held.about.outside', 'While it is held, its original cannot be opened, not even with a warning. An outside scanner found it too, so it is released only when two members each give a reason. (Had only the built-in scanner found it, a second, different scanner finding it clean would release it.) A release covers this finding only.', True)
w('screen.open-file.whole', 'The file read whole', False, 'the structure check of a deeper check')
w('screen.open-file.flagged', 'Flagged: {what}', False, 'what the structure check flagged, such as "an external link"')
w('screen.open-file.release.waiting', "{name} gave a reason on {date}; a second member's releases it. The machine never can.")
# --- end DEC-259
keys = [x['key'] for x in W]
dup = sorted({k for k in keys if keys.count(k) > 1})
assert not dup, 'duplicate keys: ' + ', '.join(dup)
assert not set(REWRITE) & set(keys), 'a minted key is also reworded'
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'words-drawn.json')
open(out, 'w').write(json.dumps(dict(rows=W, rewrite=REWRITE), indent=1, ensure_ascii=False) + '\n')
print(f'words-drawn.json: {len(W)} rows, {len(REWRITE)} reworded')
