const BASE_URL = "https://wecareapi.nirdhan.com.np:8085";

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    expires_in: number;
    //offline_pin?:string;
  };
}

export async function loginApi(
  username: string,
  password: string,
  officeCode: string,
): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/api/Account/Login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userName: username,
      password,
      officeCode,
    }),
  });

  if (!res.ok) {
    throw new Error("Network error");
  }

  return res.json();
}
