/* file-safety R38 (DEC-169, DEC-99): a scanner's finding name explained in member words. One table of finding kinds,
 * held for translation: each row is a kind of threat, the names engines use for it (matched without regard to case),
 * and plain words saying what that kind does and that a scanner reports what a file resembles, not a certainty. The
 * list is open (DEC-169: "and others"); a name whose kind no row holds is answered with `NO_PLAIN_DESCRIPTION`.
 *
 * A name is split into its parts as the scanner's naming gives them: ClamAV's `Platform.Kind.Variant`
 * (`Xls.Downloader.Agent-917`), and its `Heuristics.` and `PUA.` names, whose first part is the kind; Microsoft's
 * `Kind:Platform/Variant`; and the common `Platform/Variant` and `Kind.Variant` forms of other engines. Pure: the answer
 * depends on the name alone, and it never throws. */

import { word } from '../setup-words/index.mjs';
import { RESEMBLES_KEY, NO_PLAIN_DESCRIPTION_KEY } from './words.mjs';

/* T50 (plan rule 6): the sentence every kind ends with, and R38's fallback, are the words of their keys; each kind's own
   sentence is `unkeyed` in `words-reads.json` for this module and stays here. */
const RESEMBLES = word(RESEMBLES_KEY);
const kind = (id, names, words) => Object.freeze({ kind: id, names: Object.freeze(names), words: `${words} ${RESEMBLES}` });

export const FINDING_KINDS = Object.freeze([
  kind('downloader', ['downloader', 'trojandownloader', 'dldr'],
    word('file-safety.kind.downloader')),
  kind('dropper', ['dropper', 'trojandropper'],
    word('file-safety.kind.dropper')),
  kind('trojan', ['trojan', 'trj'],
    'A trojan pretends to be something harmless while doing something harmful, such as giving someone else control of '
      + 'the computer.'),
  kind('macro', ['macro', 'macros', 'w97m', 'x97m', 'o97m', 'vba'],
    word('file-safety.kind.macro')),
  kind('exploit', ['exploit', 'exp', 'cve'],
    word('file-safety.kind.exploit')),
  kind('phishing', ['phishing', 'phish'],
    word('file-safety.kind.phishing')),
  kind('potentially_unwanted', ['pua', 'pup', 'adware', 'riskware', 'potentiallyunwanted'],
    'A potentially unwanted program is not always harmful, but does things a reader may not want, such as showing '
      + 'adverts or collecting information.'),
  kind('heuristic', ['heuristics', 'heuristic', 'suspicious', 'generic', 'heur'],
    word('file-safety.kind.heuristic')),
  kind('worm', ['worm'], word('file-safety.kind.worm')),
  kind('ransomware', ['ransomware', 'ransom', 'filecoder'],
    word('file-safety.kind.ransomware')),
  kind('backdoor', ['backdoor', 'rat'], word('file-safety.kind.backdoor')),
  kind('virus', ['virus', 'infector'], word('file-safety.kind.virus')),
  kind('spyware', ['spyware', 'keylogger', 'stealer', 'infostealer', 'pws', 'passwordstealer'],
    word('file-safety.kind.spyware')),
  kind('test', ['test', 'eicar'],
    'This is a harmless test file that scanners are built to recognise, used to check that scanning works.'),
]);

/** R38: the words when no row matches the name's kind of threat, exactly. */
export const NO_PLAIN_DESCRIPTION = word(NO_PLAIN_DESCRIPTION_KEY);

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
