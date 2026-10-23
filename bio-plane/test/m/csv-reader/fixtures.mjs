/* Fixtures for the csv-reader suite: the byte encoder the tests build bodies with. */
export const enc = (s) => (typeof s === "string" ? new TextEncoder().encode(s) : s);
