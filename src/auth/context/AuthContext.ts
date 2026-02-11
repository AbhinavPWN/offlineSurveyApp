// Defining Auth context shape (Contract)

import { AuthSession } from "../model/AuthSession";
import { AuthState } from "../model/AuthState";
import { CHWProfile } from "../model/CHWProfile";

export interface AssignedArea {
  provinceCode: string;
  districtCode: string;
  vdcnpCode: string;
  wardNo: string;
}

export interface AuthContextValue {
  session: AuthSession | null;
  state: AuthState;
  loading: boolean;

  // actions
  login: (session: AuthSession) => Promise<void>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // CHW profile
  chwProfile: CHWProfile | null;
}
