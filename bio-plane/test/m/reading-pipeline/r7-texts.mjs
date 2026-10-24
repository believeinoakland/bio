/* reading-pipeline G88 (fix round 7): the 12 MB texts the classification tests read, built here so the failing-first test and the contention
   test read the same shapes. `plainText` matches no registered content type (the probe's text); `minutesText` is matched by the real
   meeting-minutes type (the masthead at furniture rate, motions and a roll-call tally, a meeting that convened and adjourned), so
   the matched type's `parse` runs over it too. Both are about 12 MB. */
export const TWELVE_MB = 12 * 1000 * 1000;

export const plainText = (bytes = TWELVE_MB) => {
  const n = Math.ceil(bytes / 100);
  return Array.from({ length: n }, (_, i) => `line ${String(i).padStart(6, "0")} ` + "council-minutes ".repeat(5).padEnd(87, ".")).join("\n");
};

const MINUTES_PAGE = [
  "Minutes - City Council Regular Meeting",
  "Council convened at 7:00 p.m.",
  "Present",
  "Absent",
  "A motion was made by Council Member Alvarez to approve the consent calendar. The motion carried.",
  "Ayes: 3  Noes: 0  Abstain: 0",
  "Council adjourned the meeting at 9:45 p.m.",
].join("\n");

export const minutesText = (bytes = TWELVE_MB) => {
  const filler = "Public comment was received on items not on the agenda; the speakers addressed the council in turn about street repairs.\n";
  const page = MINUTES_PAGE + "\n" + filler.repeat(Math.ceil(2200 / filler.length)) + "\n";
  return page.repeat(Math.ceil(bytes / page.length));
};
