export const yesNo = (val: string | null | undefined) =>
  val === "Y" ? "Yes" : val === "N" ? "No" : "-";

export const genderLabel = (val: string | null | undefined) =>
  val === "M" ? "Male" : val === "F" ? "Female" : val === "O" ? "Other" : "-";

export const maritalStatusLabel = (val: string | null | undefined) =>
  val === "M"
    ? "Married"
    : val === "U"
      ? "Unmarried"
      : val === "D"
        ? "Divorced"
        : val === "W"
          ? "Widowed"
          : "-";

export const documentTypeLabel = (val: string | null | undefined) =>
  val === "CITIZENSHIP"
    ? "Citizenship"
    : val === "PASSPORT"
      ? "Passport"
      : (val ?? "-");

export const addressTypeLabel = (val: string | null | undefined) =>
  val === "T" ? "Temporary" : val === "P" ? "Permanent" : "-";
