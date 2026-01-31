// Pin Verifier
import { hashPin } from "./pin";

const MAX_ATTEMPTS = 5;

let failedAttempts = 0;
let lockedUntil: number | null = null;

export async function verifyPin(
  enteredPin: string,
  storedHash: string,
): Promise<"OK" | "INVALID" | "LOCKED"> {
  if (lockedUntil && Date.now() < lockedUntil) {
    return "LOCKED";
  }
  const enteredHash = await hashPin(enteredPin);

  if (enteredHash === storedHash) {
    failedAttempts = 0;
    lockedUntil = null;
    return "OK";
  }

  failedAttempts += 1;

  if (failedAttempts >= MAX_ATTEMPTS) {
    lockedUntil = Date.now() + 10 * 60 * 1000; // 10 minutes
  }

  return "INVALID";
}
