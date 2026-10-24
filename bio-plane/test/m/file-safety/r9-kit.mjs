/* file-safety's fix-round-9 fixtures: the files the cases of SCAN E/F and DOCS S/O name, made small. Not product code. */
import { makeZip } from "../../make-zip.mjs";

export const enc = (s) => new TextEncoder().encode(s);
const CT = (main) => `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="${main}"/></Types>`;
const DOC = `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>hi</w:t></w:r></w:p></w:body></w:document>`;
export const DOCX_MAIN = "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml";
export const DOCM_MAIN = "application/vnd.ms-word.document.macroEnabled.main+xml";
/* a DOCX (or, with another `main`, a DOCM); `extra` more entries; `options` the zip writer's (a prefix, for a polyglot) */
export const docxOf = (extra = [], main = DOCX_MAIN, options = {}) =>
  makeZip([{ name: "[Content_Types].xml", data: CT(main) }, { name: "word/document.xml", data: DOC }, ...extra], options);

/* a PDF whose trailer asks for a password */
export const ENC_PDF = enc("%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\n"
  + "3 0 obj<</Filter/Standard/V 2/R 3/O(x)/U(y)/P -4>>endobj\ntrailer<</Root 1 0 R/Encrypt 3 0 R/ID[<00><00>]>>\n%%EOF");
/* an Office file with a password: a compound file holding an `EncryptedPackage` stream */
export const encOle = (tag = "") => {
  const magic = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  const name = enc("E\0n\0c\0r\0y\0p\0t\0e\0d\0P\0a\0c\0k\0a\0g\0e\0");
  return new Uint8Array([...magic, ...new Uint8Array(504), ...name, ...enc(tag)]);
};
export const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 9, 9]);
export const jpeg = (comment = "", pad = 0) => new Uint8Array([0xff, 0xd8, 0xff, 0xfe, 0x00, comment.length + 2, ...enc(comment), 0xff, 0xdb, ...new Uint8Array(pad), 0xff, 0xd9]);
export const TIFF = new Uint8Array([0x49, 0x49, 0x2a, 0x00, 8, 0, 0, 0, 1, 2, 3, 4]);
export const HEIC = new Uint8Array([0, 0, 0, 24, ...enc("ftypheic"), 0, 0, 0, 0, ...enc("mif1heic")]);
export const BMP = new Uint8Array([0x42, 0x4d, 36, 0, 0, 0, 0, 0, 0, 0, 26, 0, 0, 0, 12, 0, 0, 0, 1, 0, 1, 0, 1, 0, 24, 0, 0, 0, 255, 0]);
