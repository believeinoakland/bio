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
  'screen.calculation.counts': '{visited} of {n} visited: {yes} yes, {no} no, {unsure} could not tell',   # DEC-262
  'screen.calculation.range': '{share}% of the {judged} that could be judged were yes · exact {confidence}% range {low}% to {high}%',   # DEC-262
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
  'screen.ceremony.photo.facts': 'taken by {by} · relied on by {findings}',   # DEC-265 (B226 (2)): photosOf answers no date; .dated when it does
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
  'screen.due-date.of': "{who}'s reply",   # DEC-262
  'screen.due-date.step.counted': 'Counted {amount} {units}.',   # DEC-262
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
  'screen.money.didnotmove': 'did not move: a {phase} figure',   # DEC-265 (B226 (4)): the figure carries no adoption date
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
# people
w('screen.people.counts.three', 'named in {documents}, {questions} and {projects}', False, 'each a count with its noun, such as "14 documents"')
w('screen.people.counts.docsonly', 'named in {documents}, in no question or project yet')
REWRITE.update({
  'screen.people.notmembers': "The people and organizations your group's record follows: officials, staff, companies and public bodies. Your own group's members are not listed here; they are under Settings › Members.",
  'screen.people.today.seeded': "added at setup from your group's place",
})
# person
w('screen.person.testify.basis', 'How you know (for “I know this is them”)')
w('screen.person.same.because', 'claimed the same person, grade {grade}, because {basis}')
w('screen.person.expunge.title', 'Remove "{fact}" from {name}\'s page', True, 'the correction dialog (protected: irreversible)')
w('screen.person.expunge.button', 'Remove it for good, with this reason', True, "personexpunge's button inside the dialog")
w('screen.person.expunge.phone', 'On a phone this can be read but not done: like signing and publishing, it finishes on a larger screen, where the whole consequence is in view.', True)
w('screen.person.naming.it', 'Documents that may name it', False, 'entity.naming.title for an organization')
w('screen.person.testify.it', 'I know this is it…', False, 'entity.naming.testify for an organization')
REWRITE.update({
  'screen.person.facts': 'Career, credentials, memberships, interests',
  'screen.person.expunge.statement': 'This removes the recorded value for good. It cannot be undone, by you or anyone: the value is gone from this page, from every question that cited it, and from every export. A marker stays where it was: "Removed where the law requires, {date}, by {member}". Published cases are not changed; a court order for those is complied with on the docket.',
})
# places
w('screen.places.sub', "Administrators only. The places whose rules your group's Civicsmith follows, and the offices your group deals with.")
w('screen.places.profiles.help', 'Each place brings its deadlines, holidays, offices and records laws, each with its source. Changing places changes how dates and offices read from then on; what your group already recorded stays as it was.')
w('screen.places.offices.note', "Offices come from your places' rules, each marked with where it came from. After you change places, fill them in again; offices your group added itself stay.")
REWRITE.update({
  'screen.places.wanted.field': "A place you want that isn't listed (optional)",
  'screen.places.wanted.help': "Kept in your group's Civicsmith and never sent anywhere. When an update brings its rules and offices, administrators are told once in their queue and can choose it above.",
})
# plan
w('screen.plan.check.hostile', 'Scenario {scenario}: no branch answers a hostile response (refusal, obstruction, retaliation) to {item}.', False, "a plan check's finding")
w('screen.plan.subject.from', 'from the inquiry "{title}" ({status}, {date})', False, "where a plan's subject comes from; {status} such as suspected")
w('screen.plan.phase.checkpoint', '{item} → checkpoint: "{checkpoint}" (judged by a member)', False, "a scenario's phase")
w('screen.plan.item.untaken', 'nobody has taken it up', False, 'a started item no member has taken up')
REWRITE.update({'screen.plan.opened': 'opened {date} by {name}'})   # DEC-265 (B226 (3)): planopen records no reason
# proceeding
w('screen.proceeding.now', 'Now: awaiting the {event}', False, "where the proceeding stands, such as awaiting the hearing")
REWRITE.update({'screen.proceeding.login.note': "The court's register needs a login, so new filings come only by a member's own capture."})
# published
w('screen.published.howtoread.link', 'How to read a case', False, 'a link after the explanation of the two strengths')
w('screen.published.named', '{name}, by title: {reason} (finding {n}).', True, 'a person the case names by title, with the reason (protected: published)')
REWRITE.update({'screen.published.meets': "meets this project's bar (capture {capture}, connection {connection})"})
# projectai
def wp(k, en, prot=False, note=''): w('screen.projectai.' + k, en, prot, note)
wp('sub', "Optional. Who pays for the assistant's work in {project}, for which uses, and up to what limits.")
wp('state.key', "{project} has its own Anthropic API key (ending …{last4}) · {state} · set by {name}, {date}. Members' acts in this project are paid for by it, and the project is billed by Anthropic.", False, '{state} on or off')
wp('state.signin', 'Your own Claude sign-in serves {project} while you are its only member · {state} · set by you, {date}. It is your own use of your own subscription.')
wp('state.member', "{project} pays for the assistant's work here with its own API key, {state}. Its owners set what it pays for and its limits; they see how much it is used in total, never what you ask or who asked.", True, 'what a member who is not an owner sees (protected: who sees what)')
wp('paidby.key', 'An Anthropic API key for this project')
wp('paidby.signin', "My own Claude sign-in, while I am the project's only member")
wp('paidby.none', "No project account: members' own accounts, then the group's key, serve")
wp('key.help', "Made at console.anthropic.com by whoever pays for the project. Sealed in your group's Civicsmith, never shown again or exported, and used only for acts in this project. It starts switched off. Each member is told once, before the first act it pays for, that their questions go to Anthropic under the project's account.", True)
wp('owners.alone', 'Any one owner sets these alone. Every change is recorded with who and when, and every owner sees it below.')
wp('uses.heading', 'What it pays for')
wp('limit.ontop', 'on top of it', False, 'a limit on one use that is on top of the overall limit')
wp('meter.month', "This month on the project's account: {used} of the {limit} limit")
wp('meter.explore', 'Exploring this month, on top of it: {used} of the {limit} limit')
wp('limits.signin', 'Limits on your sign-in here')
wp('keepaway.member', 'Off. If an owner turns it on, you see their reason here, and the assistant stops for the uses they chose, whoever pays.')
wp('keepaway.which', "Keep this project's material away from AI")
wp('keepaway.button', "Keep this project's material away", False, "projectaikeepaway's button")
wp('changes.head', 'Changes, seen by every owner', True, 'says who sees the changes')
wp('change.ontop', '{name} set a limit of {limit} a month on {use}, on top of the overall limit')
wp('change.explore', '{name} set exploring to {setting}')
wp('change.held', "{name} held the project's API key and switched it on")
REWRITE.update({
  'screen.projectai.account.suspended': "Your sign-in no longer serves {project}. A second member joined, and a sign-in serves a project only while it has one member. Members' acts here now use their own accounts, or the group's key. Add an API key to give the project its own account again; if the project returns to just you, your sign-in serves it again.",
  'screen.projectai.notice.head': 'Before your first question here',
  'screen.projectai.key.field': "The project's API key",
})
# recovery
w('screen.recovery.sub', 'If you lose your password, one of these codes lets you set a new one. Each works once. Every member has their own.')
w('screen.recovery.lost.heading', 'If you lose your codes too')
w('screen.recovery.lost.what', 'An administrator can make you a one-time reset link instead. For administrators: if every administrator loses both password and codes, only whoever holds the hosting account can let one back in, so a second administrator is worth having.')
REWRITE.update({
  'screen.recovery.held': 'You hold recovery codes: {remaining} of {total} unused, issued {date}.',
  'screen.recovery.shown': 'Save these now: they are shown only this once. Keep them somewhere only you can reach, apart from your password. Civicsmith keeps only a fingerprint of each, so it can never show them again.',
})
# reset
w('screen.reset.dead.sub', 'A reset link works once, for seven days')
REWRITE.update({
  'screen.reset.keeps': "Your handle and everything you did stay as they are, and every other sign-in of yours ends. {name} can't see the password you choose. Your recovery codes still work; if you have lost them too, get ten new ones in Settings › Recovery codes once you are in.",
  'screen.reset.dead.what': 'It was used already, it expired, or an administrator withdrew it. Ask an administrator for a new one, in person or however your group talks. Nothing was changed.',
})
# review-copy
w('screen.review-copy.band', '{n} people outside the group can read this until {date}', True, 'the band across a draft shared for review (protected: who can see)')
w('screen.review-copy.sub', 'A named reader gets a view that you can stop at any time.')
w('screen.review-copy.link.line', 'For {who} · works until {until}, or until you stop sharing · Civicsmith sends no email: copy the link and send it yourself.', True, "under the reader's link")
REWRITE.update({
  'screen.review-copy.heading': 'Share Edition {edition} for review',
  'screen.review-copy.reads.until': 'can read until {until}',
})
# review-outside
w('screen.review-outside.sub', 'Before publishing, the group asks you to read this draft of its case and comment. It is not public: only people with this link can read it, until {date}.', True)
w('screen.review-outside.readall', 'Read the whole draft')
REWRITE.update({
  'screen.review-outside.heading': 'A review copy from {group}',
  'screen.review-outside.draft': 'The case: {case}, Edition {edition} (draft)',
})
# request
w('screen.request.law.help', "From your group's places. The faster request suits a small, clearly described set of records.")
REWRITE.update({
  'screen.request.describe': "Describe the records, not why you want them. The law doesn't let the office limit access because of why you ask ({cite}), and the city's portal shows this text to anyone.",
  'screen.request.howsend.1': "Open the city's public records portal ({portal}) and choose “{button}”.",
  'screen.request.howsend.2': 'Paste the approved text as the request description, and choose the department: {department}.',
  'screen.request.howsend.3': "Contact details are optional. Without them the request still goes in, but the city can't send you updates or ask you to clarify, and you can't sign in to collect the records. Give the address your group uses for its requests; staff see what you give.",
})
# security
def ws(k, en, prot=False, note=''): w('screen.security.' + k, en, prot, note)
ws('sub', "How hard your group's Civicsmith is being tried, against its usual. Only administrators see this.", True, 'says who can see it')
ws('summary.signin', 'Someone tried hard to sign in on {when}. Every attempt was refused.', False, 'the period summarized, when sign-ins were refused far above the usual')
ws('summary.detail', 'Refused sign-ins were about {times} times the usual between {from} and {to}, with requests coming too fast turned away at the same time. It was high from {highfrom} to {highto}, when administrators were told once. No new key, credential or administrator was made in the period.')
ws('heat.heading', 'By kind and by hour')
ws('heat.usual', 'at or below the usual', False, 'the key under the hours')
ws('heat.upto', 'up to {n} times the usual', False, 'the key under the hours')
ws('heat.note', 'Each square is one hour. Hover, focus or tap one for its count and the usual. “Usual” is your group\'s own median for the same hour over the four weeks before.')
ws('totals.heading', 'Totals for the period')
ws('totals.note', 'Counts only. Nothing here says who tried, and nothing your group holds is shown.')
ws('where.what', 'Refused sign-ins and keys, and requests turned away or blocked, by the country Cloudflare reports for them.')
ws('where.note', "A country is not proof of who is behind an attempt: anyone can borrow an address in another country. No address is ever kept or shown, and a member's own sign-ins are never placed: a mistyped password followed by the member signing in is counted without a country.")
ws('told.heading', 'When you are told')
ws('notice.signin', 'sign-in refusals far above the usual and still going on, all refused so far', False, "the administrators' notice when the level is high")
ws('notice.sent', 'sent to administrators once, at {time}, when the level became high · not sent again while it lasted', True, 'who was told (protected)')
ws('told.note', 'Administrators are told only when the level is high, never as a routine count. The notice opens this screen at that period.')
ws('tools.about', "Built in: a file scanner (ClamAV, which looks for viruses and other harmful code, with signatures fetched daily) and the safe view. Add your organization's own tools of any kind: file scanners, tools that make safe copies of files, sandboxes, address checks, a place to send security counts.")
ws('runs.own', "runs in your group's own account")
ws('runs.deeper', 'runs when a member asks for a deeper check')
ws('tool.sendsbytes', "sends the file's bytes, never its name", True, "a tool's handling: what leaves the group")
ws('tool.deletes', 'deletes the file when the scan ends', True)
ws('tool.results', 'results kept up to {days} days', True)
ws('tool.addresscheck', 'address check before a capture')
ws('tool.hosting', 'your hosting company already carries your traffic, so no one new learns an address', True)
ws('adding', 'Adding: {tool}, {kind}')
ws('adding.sends', "The file's bytes. Never its name, who captured it or your group's address.", True)
ws('adding.recipient', '{vendor}, in the region you choose; it uses no one else.', True)
ws('adding.keeps', 'Clean files up to {days} days. Files it judges malicious: kept by {vendor} in {region}, indefinitely, for its own research.', True)
ws('adding.when', "When it runs: only when a member asks for a deeper check. A tool on your organization's own servers may also check every file as it arrives.")
ws('adding.before', 'Before you turn it on')
ws('adding.understand', 'I understand that files {vendor} judges malicious are kept by {vendor} in {region} indefinitely', True)
ws('adding.test', 'Test it with a harmless test file', False, "securitytooltest's button while adding a tool")
ws('adding.private', "A service that shares by default is offered only with its private mode, which Civicsmith turns on and checks on every call; if it can't confirm private mode, nothing is sent.", True)
ws('notoffered', "Not offered, because they share what is sent to them: VirusTotal uploads, Jotti, Hybrid Analysis, and the public modes of ANY.RUN, Joe Sandbox and urlscan.io. A tool whose vendor does not say whether it shares what it is sent is not offered until it does. An address check never sends the full address to anyone new: only checks that send a scrambled fragment, or Cloudflare's own. A site known to be bad: the document is still captured, as high risk, opens only in the safe view, and the check's answer is noted on it.", True)
ws('logsink', 'Sending security counts elsewhere (a log service your organization uses) sends counts only, never who opened which file.', True)
ws('cando.heading', 'What you can do')
ws('cando', "A member who fears their password is weak can change it in Your account. An administrator can turn off the reusable join link or the group's key in Members. Whoever holds the hosting account can tighten Cloudflare's own settings there.")
REWRITE.update({
  'screen.security.kind.signin': 'Refused sign-ins',
  'screen.security.kind.credential': 'Refused keys and links',
  'screen.security.kind.rate': 'Requests over the limit',
  'screen.security.kind.handover': 'Refused hand-overs',
})
# settings
w('screen.settings.sub', "Your own settings first; then the group's, which only administrators change.")
# standard
REWRITE.update({'screen.standard.notyet': 'Not a standard until a member adopts it.'})
# start-send
w('screen.start-send.clock.law', '{days} days, from the law your profile names', False, "an action's clock, from the group profile")
w('screen.start-send.secondapproval', "If this project needs a second approval before sending, the text shows: “Waiting for a second member's approval. Any member of this project other than {approver} can give it.”")
# theme
w('screen.theme.declaredby', 'declared by {who}, {date}', False, "theme.declared within a theme's line")
w('screen.theme.placed.confirmed', 'Placed by {who}, {date}; confirmed a hunch the assistant proposed: “{note}”')
# ties
w('screen.ties.sub', 'Your work and family connections that could matter to a case, so your group can be open about them.')
w('screen.ties.summary', 'Why you are asked, and who sees it · so readers can trust a case · only you and the administrators see this list', True, 'says who sees the list')
w('screen.ties.who.change', 'You can change or remove a tie at any time. A case already published keeps what it said.')
w('screen.ties.row.says', 'a case would say: “{says}”', True, 'how a case would disclose the tie')
w('screen.ties.row.named', 'a case would name me', True)
REWRITE.update({
  'screen.ties.says.name.choice': 'Naming me by my handle: “{handle}, who worked on this case, is {tie}.”',
  'screen.ties.says.group.choice': 'Without naming me: “A member of the group who worked on this case is {tie}.”',
})
# timeline
w('screen.timeline.order.undetermined', 'Undetermined order: {events}, because both are dated only by {precision}.', False, '{precision} month or year')
w('screen.timeline.step.none.optional', 'None threaded; not every request has one.', False, 'a step that is only sometimes present')
w('screen.timeline.finding.missing', 'Step {n}, {step}: no document within {window} (by {date}).', False, 'a finding on a followed matter; it never says anyone is late')
w('screen.timeline.progression.sub', 'How the group expects {what} to go. Version {n}, declared by {name}, {date}.')
w('screen.timeline.step.within', 'within {days} days of step {n}', False, "a step's window")
w('screen.timeline.req.unless', 'Required: Unless a lawful exception applies')
w('screen.timeline.progression.prior', 'Version {n}, {date}, had no {step} step.', False, 'how the earlier version differed')
w('screen.timeline.progression.name.help', 'The kind of happening it follows, such as “{example}”.')
w('screen.timeline.progression.steps.note', 'Then add its steps, each with what comes before it, how soon, whether it is required, and how many documents it holds.')
REWRITE.update({'screen.timeline.order.evidence': 'More evidence could order them: a passage that gives either one its day (a ledger entry, a meeting\'s agenda, a letter\'s date), or a source that says which came first. Until a source orders them, both are kept as they are, never guessed into order; when one does, the timeline names it, and a source that disagrees is shown beside it, in tension.'})
# translations
def wt(k, en, prot=False, note=''): w('screen.translations.' + k, en, prot, note)
wt('who', 'Who may translate {language}')
wt('grantedby', 'granted by {name}, {date}')
wt('changedby', "changed from the assistant's draft by {name}")
wt('secondcheck', 'needs a second check', False, 'a protected word changed from its draft')
wt('localname', 'name kept; explanation translated', False, 'where a local name came from')
wt('draft.missing', 'Ask the assistant to draft the {n} missing', False, "translationdraft's button")
wt('drafts.note', "A speaker checks the assistant's drafts for errors. A protected word kept as the assistant drafted it shows once kept. Changed from the draft, it shows only after a second granted speaker confirms it, or an administrator confirms it after reading the assistant's translation of it back into English; until then members see the English.", True)
wt('typed.note', 'Type each word; a member who knows the language keeps it. A protected word shows only after a second granted speaker confirms it; until then members see the English.', True)
wt('marked.note', 'Any member can mark a word with “this translation looks wrong”; it is listed here for the granted members and the administrators. Every word records who adopted it, when and what it replaced.')
wt('localnames.note', "Names of offices, laws, programs and places stay as they are, with an explanation in the member's language beside them. Where the place publishes an official translation, it comes with the place's rules and shows its source. What goes to an office goes in the office's language, with a labeled translation beside it for the member.")
# unavailable
w('screen.unavailable.unreachable.note', "It tries again by itself every 30 seconds. If it stays out of reach for long, tell whoever holds your group's Cloudflare account.")
REWRITE.update({
  'shell.unavailable.nothing.says': "This address doesn't lead to anything in your group's Civicsmith. It may have been typed wrong, or the link is old.",
  'shell.unavailable.notyours.says': "It exists, or it may not: either way it isn't something you can see. A hidden project shows only to its own members; ask its owner if you think you should be in it.",
  'shell.unavailable.unreachable.title': "Your group's Civicsmith can't be reached",
  'shell.unavailable.unreachable.says': "Your device is offline, or your group's Civicsmith isn't answering. Nothing you did is lost: what you saved is kept there, and what you were typing is still on this page.",
})
# update (the installer's update page)
w('screen.update.sub', "For whoever holds your group's Cloudflare account. An update keeps every record, member and setting; it changes only Civicsmith's own programs.")
w('screen.update.note', "You go to Cloudflare's page to allow it, as when it was set up. If a step stops, your group's Civicsmith keeps running as it was.")
# wizards
w('screen.wizards.originalchanged', "Civicsmith's original changed since: see what changed")
REWRITE.update({'screen.wizards.basedon': "based on Civicsmith's “{name}”", 'screen.wizards.copy.note': "A copy becomes your group's own wizard: a draft until approved, like any wizard your group writes. The original stays as it is and is still offered; a required wizard stays required. The copy shows what it is based on, and when Civicsmith's original changes, your wizard editors are told and can bring the change across."})
# tour
w('screen.tour.what.says', '{group} looks into {focus}. We check what the city says against its own records, and publish what the records show.', False, "the walk-through's first step; {focus} the group's own words")
w('screen.timeline.threaded.owndate', '{document}, its own date {date}', False, 'a document threaded to a step, with the date it bears')
# --- end DEC-259
keys = [x['key'] for x in W]
dup = sorted({k for k in keys if keys.count(k) > 1})
assert not dup, 'duplicate keys: ' + ', '.join(dup)
assert not set(REWRITE) & set(keys), 'a minted key is also reworded'
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'words-drawn.json')
open(out, 'w').write(json.dumps(dict(rows=W, rewrite=REWRITE), indent=1, ensure_ascii=False) + '\n')
print(f'words-drawn.json: {len(W)} rows, {len(REWRITE)} reworded')
