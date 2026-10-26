#!/usr/bin/env node
// Stands for the pinned image's LibreOffice 7.4.7 (F-B14, measured inside docker.io/civicsmith/file-scanner-renderer): it
// answers "source file could not be loaded" and makes no PDF for the packages the corpus generators write (every entry
// with a ZIP64 extra field, a ZIP64 end record and its locator, some entries with a data descriptor), and loads the same
// entries written as a plain ZIP. Every other source goes to the real LibreOffice.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const src = args[args.length - 1];
/** A ZIP64 end-of-central-directory locator just before the end record. */
const zip64 = (buf) => buf.length >= 42 && buf.readUInt32LE(buf.length - 42) === 0x07064b50;
if (args.includes('--convert-to') && /\.(docx|pptx|odt|odp)$/.test(src) && zip64(readFileSync(src))) {
  console.error('Warning: failed to launch javaldx - java may not function correctly\nError: source file could not be loaded');
  process.exit(0);
}
const r = spawnSync('soffice', args, { stdio: 'inherit', env: process.env });
process.exit(r.status ?? 1);
