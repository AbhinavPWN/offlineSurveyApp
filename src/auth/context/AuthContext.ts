// Defining Auth context shape (Contract)

import { AuthSession } from "../model/AuthSession";
import { AuthState } from "../model/AuthState";

export interface AuthContextValue {
  session: AuthSession | null;
  state: AuthState;
  loading: boolean;

  login: (session: AuthSession) => Promise<void>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
}
