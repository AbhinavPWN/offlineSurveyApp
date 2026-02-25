const monthMap: Record<string, string> = {
  JAN: "01",
  FEB: "02",
  MAR: "03",
  APR: "04",
  MAY: "05",
  JUN: "06",
  JUL: "07",
  AUG: "08",
  SEP: "09",
  OCT: "10",
  NOV: "11",
  DEC: "12",
};

export function convertApiDateToISO(apiDate?: string | null): string | null {
  if (!apiDate) return null;

  const parts = apiDate.split("-");
  if (parts.length !== 3) return null;

  const [day, monthStr, year] = parts;

  const month = monthMap[monthStr.toUpperCase()];
  if (!month) return null;

  const paddedDay = day.padStart(2, "0");

  return `${year}-${month}-${paddedDay}`;
}

export function calculateAgeFromISO(isoDate: string): number | null {
  if (!isoDate) return null;

  const birthDate = new Date(isoDate);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}
