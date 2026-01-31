export interface AuthSession {
  userName: string;
  officeCode: string;

  accessToken: string | null;
  tokenExpireAt: number | null;

  offlinePinHash: string;

  //   debugging and audit
  lastOnlineLoginAt: number;
}
