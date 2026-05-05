// debug insights

// src/usecases/sync/validators/payloadAnalyzer.ts

export function analyzeSurveyPayload(payload: Record<string, any>) {
  return {
    neonate: {
      q4: payload.neonateQ4,
      q5: [
        payload.neonateQ5Ans1,
        payload.neonateQ5Ans2,
        payload.neonateQ5Ans3,
        payload.neonateQ5Ans4,
        payload.neonateQ5Ans5,
      ],
      q8: payload.neonateQ8,
      q9: payload.neonateQ9,
      q9Others: payload.neonateQ9Others,
    },
    postpartum: {
      q5: payload.postpartumWoQ5,
      q6: payload.postpartumWoQ6,
      q6Others: payload.postpartumWoQ6Others,
      q8: payload.postpartumWoQ8,
      q9: payload.postpartumWoQ9,
      q10: payload.postpartumWoQ10,
      q11: payload.postpartumWoQ11,
      q11Others: payload.postpartumWoQ11Others,
    },
  };
}
