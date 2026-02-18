import axios from "axios";
import { AppLogger } from "@/src/utils/AppLogger";

const BASE_URL = "https://wecareapi.nirdhan.com.np:8085";

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    expires_in: number;
  };
}

// Create axios instance (separate from HouseholdApiService)
const authClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function loginApi(
  username: string,
  password: string,
  officeCode: string,
): Promise<LoginResponse> {
  try {
    const response = await authClient.post("/api/Account/Login", {
      userName: username,
      password,
      officeCode,
    });

    return response.data;
  } catch (error: any) {
    await AppLogger.log("ERROR", "LOGIN_API_ERROR", {
      message: error?.message,
      status: error?.response?.status ?? "NO_RESPONSE",
    });

    throw error;
  }
}
