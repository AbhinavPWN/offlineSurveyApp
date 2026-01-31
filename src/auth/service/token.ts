// Token Validity Logic
import { AuthSession } from "../model/AuthSession";

export function isTokenValid(session: AuthSession): boolean {
  if (!session.accessToken || !session.tokenExpireAt) {
    return false;
  }

  return Date.now() < session.tokenExpireAt;
}
