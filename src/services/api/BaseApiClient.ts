import axios, { AxiosInstance } from "axios";
import { AppLogger } from "@/src/utils/AppLogger";
import { loadAuthSession } from "@/src/auth/storage/authStorage";
import { isTokenValid } from "@/src/auth/service/token";

declare module "axios" {
  interface AxiosRequestConfig {
    metadata?: any;
  }
}

const BASE_URL = "https://wecareapi.nirdhan.com.np:8085/api/SavingDeposit";

export class BaseApiClient {
  private static instance: AxiosInstance;

  static getInstance(): AxiosInstance {
    if (!BaseApiClient.instance) {
      BaseApiClient.instance = axios.create({
        baseURL: BASE_URL,
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      BaseApiClient.attachInterceptors(BaseApiClient.instance);
    }

    return BaseApiClient.instance;
  }

  private static attachInterceptors(client: AxiosInstance) {
    client.interceptors.request.use(async (config) => {
      config.metadata = { startTime: Date.now() };

      await AppLogger.log("INFO", "API_REQUEST", {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL ?? ""}${config.url ?? ""}`,
        body: config.data ?? null,
      });

      try {
        const session = await loadAuthSession();

        if (session?.accessToken && isTokenValid(session)) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
      } catch (error: any) {
        await AppLogger.log("ERROR", "API_TOKEN_ATTACH_FAILED", {
          message: error?.message,
        });
      }

      return config;
    });

    client.interceptors.response.use(
      async (response) => {
        const duration =
          Date.now() - (response.config.metadata?.startTime ?? 0);

        await AppLogger.log("INFO", "API_RESPONSE", {
          method: response.config.method?.toUpperCase(),
          url: `${response.config.baseURL ?? ""}${response.config.url ?? ""}`,
          status: response.status,
          durationMs: duration,
        });

        return response;
      },
      async (error) => {
        const config = error.config || {};
        const duration = Date.now() - (config.metadata?.startTime ?? 0);

        await AppLogger.log("ERROR", "API_ERROR", {
          method: config.method?.toUpperCase(),
          url: config.baseURL + config.url,
          status: error.response?.status ?? "NO_RESPONSE",
          message: error.message,
          durationMs: duration,
        });

        if (error.response?.status === 401) {
          await AppLogger.log("AUTH", "API_401_UNAUTHORIZED", {
            url: config.url,
          });
        }

        return Promise.reject(error);
      },
    );
  }
}
