export interface AuthSession {
  userName: string; // wcadmin
  employeeName?: string; // Gagan Ghimire
  officeCode: string;

  accessToken: string | null;
  tokenExpireAt: number | null;

  offlinePinHash: string;

  //   debugging and audit
  lastOnlineLoginAt: number;
  idofCHW?: string;
  employeeId?: string;
}
