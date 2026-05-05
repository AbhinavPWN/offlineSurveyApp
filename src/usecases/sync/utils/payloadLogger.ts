// structured logs

// src/usecases/sync/utils/payloadLogger.ts

export function logPayloadDebug(payload: Record<string, any>) {
  const emptyFields = Object.entries(payload).filter(([_, v]) => v === "");

  console.log("[PAYLOAD][EMPTY_COUNT]", emptyFields.length);

  console.log(
    "[PAYLOAD][EMPTY_KEYS]",
    emptyFields.map(([k]) => k),
  );
}
