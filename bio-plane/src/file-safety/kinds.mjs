/* file-safety R38 (DEC-169, DEC-99): a scanner's finding name explained in member words. One table of finding kinds,
 * held for translation: each row is a kind of threat, the names engines use for it (matched without regard to case),
 * and plain words saying what that kind does and that a scanner reports what a file resembles, not a certainty. The
 * list is open (DEC-169: "and others"); a name whose kind no row holds is answered with `NO_PLAIN_DESCRIPTION`.
 *
 * A name is split into its parts as the scanner's naming gives them: ClamAV's `Platform.Kind.Variant`
 * (`Xls.Downloader.Agent-917`), and its `Heuristics.` and `PUA.` names, whose first part is the kind; Microsoft's
 * `Kind:Platform/Variant`; and the common `Platform/Variant` and `Kind.Variant` forms of other engines. Pure: the answer
 * depends on the name alone, and it never throws. */

const RESEMBLES = 'Scanners report what a file resembles, not a certainty.';
const kind = (id, names, words) => Object.freeze({ kind: id, names: Object.freeze(names), words: `${words} ${RESEMBLES}` });

export const FINDING_KINDS = Object.freeze([
  kind('downloader', ['downloader', 'trojandownloader', 'dldr'],
    'A downloader fetches other harmful programs from the internet once it runs.'),
  kind('dropper', ['dropper', 'trojandropper'],
    'A dropper carries another harmful program inside it and puts it on the computer when it runs.'),
  kind('trojan', ['trojan', 'trj'],
    'A trojan pretends to be something harmless while doing something harmful, such as giving someone else control of '
      + 'the computer.'),
  kind('macro', ['macro', 'macros', 'w97m', 'x97m', 'o97m', 'vba'],
    'A harmful macro is a small program inside a document that runs when editing or macros are enabled.'),
  kind('exploit', ['exploit', 'exp', 'cve'],
    'An exploit uses a flaw in the program that opens the file to run code it should not.'),
  kind('phishing', ['phishing', 'phish'],
    'Phishing imitates a trusted page or message to trick a reader into giving away a password or payment details.'),
  kind('potentially_unwanted', ['pua', 'pup', 'adware', 'riskware', 'potentiallyunwanted'],
    'A potentially unwanted program is not always harmful, but does things a reader may not want, such as showing '
      + 'adverts or collecting information.'),
  kind('heuristic', ['heuristics', 'heuristic', 'suspicious', 'generic', 'heur'],
    'A heuristic finding means the file behaves or is built like harmful files, without matching a known one.'),
  kind('worm', ['worm'], 'A worm copies itself to other computers on its own.'),
  kind('ransomware', ['ransomware', 'ransom', 'filecoder'],
    'Ransomware locks a computer\'s files and demands payment to unlock them.'),
  kind('backdoor', ['backdoor', 'rat'], 'A backdoor lets someone else reach the computer without permission.'),
  kind('virus', ['virus', 'infector'], 'A virus attaches itself to other files so that it spreads when they are opened.'),
  kind('spyware', ['spyware', 'keylogger', 'stealer', 'infostealer', 'pws', 'passwordstealer'],
    'Spyware watches what is done on a computer, such as the passwords typed, and sends it elsewhere.'),
  kind('test', ['test', 'eicar'],
    'This is a harmless test file that scanners are built to recognise, used to check that scanning works.'),
]);

/** R38: the words when no row matches the name's kind of threat, exactly. */
export const NO_PLAIN_DESCRIPTION = 'Civicsmith has no plain description of this name';

const BY_NAME = new Map(FINDING_KINDS.flatMap((k) => k.names.map((n) => [n, k])));
/* The names whose first part is the kind of threat, not the file kind (ClamAV's `Heuristics.` and `PUA.`). */
const KIND_FIRST = new Set(['heuristics', 'heuristic', 'pua', 'pup']);
const squash = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

/* The parts as the name's form gives them. */
function partsOf(name) {
  const n = name.trim();
  const ms = /^([A-Za-z][\w-]*):([^/]+)\/(.+)$/.exec(n);              // Microsoft: Trojan:Win32/Emotet.A!ml
  if (ms) return { file_kind: ms[2], threat_kind: ms[1], variant: ms[3] };
  const slash = /^([^/.\s]+)\/(.+)$/.exec(n);                           // W97M/Downloader.ABC, JS/Agent.X
  if (slash) {
    const rest = slash[2].split('.');
    return BY_NAME.has(squash(rest[0])) && rest.length > 1
      ? { file_kind: slash[1], threat_kind: rest[0], variant: rest.slice(1).join('.') }
      : { file_kind: slash[1], threat_kind: null, variant: slash[2] };
  }
  const dots = n.split('.').filter((p) => p !== '');
  if (dots.length >= 3) {
    if (KIND_FIRST.has(dots[0].toLowerCase())) return { file_kind: dots[1], threat_kind: dots[0], variant: dots.slice(2).join('.') };
    return { file_kind: dots[0], threat_kind: dots[1], variant: dots.slice(2).join('.') };
  }
  if (dots.length === 2) {
    if (KIND_FIRST.has(dots[0].toLowerCase()) || BY_NAME.has(squash(dots[0]))) return { file_kind: null, threat_kind: dots[0], variant: dots[1] };
    return { file_kind: dots[0], threat_kind: dots[1], variant: null };
  }
  return { file_kind: null, threat_kind: null, variant: dots.length === 1 ? dots[0] : null };
}

/** R38: `findingKind(name)` → `{file_kind, threat_kind, variant, words}`. Pure; never throws. */
export function findingKind(name) {
  try {
    if (typeof name !== 'string' || !name.trim()) return { file_kind: null, threat_kind: null, variant: null, words: NO_PLAIN_DESCRIPTION };
    const p = partsOf(name);
    const row = p.threat_kind ? BY_NAME.get(squash(p.threat_kind)) : null;
    return { file_kind: p.file_kind || null, threat_kind: p.threat_kind || null, variant: p.variant || null,
             words: row ? row.words : NO_PLAIN_DESCRIPTION };
  } catch {
    return { file_kind: null, threat_kind: null, variant: null, words: NO_PLAIN_DESCRIPTION };
  }
}
