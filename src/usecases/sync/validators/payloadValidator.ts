// rules (neonate, postpartum, etc.)

// src/usecases/sync/validators/payloadValidator.ts

export function validateSurveyPayload(payload: Record<string, any>) {
  const errors: string[] = [];

  // ---------- NEONATE ----------
  if (payload.neonateQ8 === "N" && payload.neonateQ9 !== "") {
    errors.push("Neonate: Q8=N but Q9 is filled");
  }

  if (payload.neonateQ9 !== "6" && payload.neonateQ9Others !== "") {
    errors.push("Neonate: Q9Others filled but Q9 != 6");
  }

  // ---------- POSTPARTUM ----------
  if (payload.postpartumWoQ5 === "N" && payload.postpartumWoQ6 !== "") {
    errors.push("Postpartum: Q5=N but Q6 must be empty");
  }

  if (payload.postpartumWoQ6 !== "O" && payload.postpartumWoQ6Others !== "") {
    errors.push("Postpartum: Q6Others filled but Q6 != O");
  }

  if (payload.postpartumWoQ8 === "N" && payload.postpartumWoQ9 !== "") {
    errors.push("Postpartum: Q8=N but Q9 must be empty");
  }

  if (payload.postpartumWoQ10 === "N" && payload.postpartumWoQ11 !== "") {
    errors.push("Postpartum: Q10=N but Q11 must be empty");
  }

  if (payload.postpartumWoQ11 !== "O" && payload.postpartumWoQ11Others !== "") {
    errors.push("Postpartum: Q11Others filled but Q11 != O");
  }

  return errors;
}
