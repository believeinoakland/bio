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

# Rows the requirements withdraw (DEC-256): build_words.mjs drops them, failing if one is no longer there to drop
RETIRED = ['screen.forgot.handle.help', 'screen.home.strip.overdue', 'screen.queue.due.overdue', 'screen.setup.taken', 'screen.updates.skip.noreason', 'question.empty.conclude']
# Rows whose words change (DEC-256): never "overdue" on Home or in the queue (screens-daily R31)
REWRITE = {'queue.milestone-overdue.summary': 'Past its date: {milestone}',
           'queue.temporal-expectation-due.undetermined.summary': 'Its date may have passed: {duty}'}

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'words-t49.json')
open(out, 'w').write(json.dumps(dict(rows=W, retired=RETIRED, rewrite=REWRITE), indent=1, ensure_ascii=False) + '\n')
print(len(W), 'rows to', out)
