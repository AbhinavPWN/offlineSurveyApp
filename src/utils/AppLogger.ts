import { Directory, File, Paths } from "expo-file-system";
import * as Application from "expo-application";
import * as Device from "expo-device";

type LogLevel =
  | "INFO"
  | "WARN"
  | "ERROR"
  | "SYNC"
  | "SYNC_CONTEXT"
  | "SYNC_RECORD_PROCESSING"
  | "SYNC_INSERT_SUCCESS"
  | "SYNC_UPDATE_SUCCESS"
  | "AUTH";

/**
 * Configuration
 */
const MAX_LOG_SIZE = 500 * 1024; // 500 KB
const LEVEL_ORDER: LogLevel[] = [
  "INFO",
  "WARN",
  "ERROR",
  "SYNC",
  "SYNC_CONTEXT",
  "SYNC_RECORD_PROCESSING",
  "SYNC_INSERT_SUCCESS",
  "SYNC_UPDATE_SUCCESS",
  "AUTH",
];
const MIN_LOG_LEVEL: LogLevel = "INFO";

export class AppLogger {
  private static logFile: File | null = null;
  private static globalMeta: Record<string, any> = {};

  private static shouldLog(level: LogLevel): boolean {
    return LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf(MIN_LOG_LEVEL);
  }

  static setGlobalMeta(meta: Record<string, any>) {
    this.globalMeta = meta;
  }

  static async initialize() {
    this.globalMeta = {
      appVersion: Application.nativeApplicationVersion,
      buildVersion: Application.nativeBuildVersion,
      deviceModel: Device.modelName,
      osVersion: Device.osVersion,
    };

    await this.log("INFO", "LOGGER_INITIALIZED");
  }

  private static async ensureReady(): Promise<File> {
    if (this.logFile) return this.logFile;

    // Base document directory (Expo-managed)
    const rootDir = Paths.document;

    // logs/
    const logDir = new Directory(rootDir, "logs");
    const dirInfo = await logDir.info();

    if (!dirInfo.exists) {
      await logDir.create({ intermediates: true });
    }

    // logs/app.log
    const file = new File(logDir, "app.log");
    const fileInfo = await file.info();

    if (!fileInfo.exists) {
      await file.write(""); // create empty file
    }

    this.logFile = file;
    return file;
  }

  static async log(
    level: LogLevel,
    message: string,
    meta?: Record<string, any>,
  ) {
    try {
      if (!this.shouldLog(level)) return;

      const file = await this.ensureReady();

      // const payload = meta ? ` | ${JSON.stringify(meta)}` : "";
      const mergedMeta = {
        ...this.globalMeta,
        ...meta,
      };

      const payload =
        Object.keys(mergedMeta).length > 0
          ? ` | ${JSON.stringify(mergedMeta)}`
          : "";

      const line = `[${new Date().toISOString()}] [${level}] ${message}${payload}\n`;

      const info = await file.info();

      let existing = "";

      if (info.exists && (info.size ?? 0) > 0) {
        existing = await file.text();
      }

      const combined = existing + line;

      const trimmed =
        combined.length > MAX_LOG_SIZE
          ? combined.slice(-MAX_LOG_SIZE)
          : combined;

      await file.write(trimmed);
    } catch {
      // Logger must NEVER crash the app
    }
  }

  static async read(): Promise<string> {
    try {
      const file = await this.ensureReady();
      return await file.text();
    } catch {
      return "";
    }
  }

  static async clear() {
    try {
      if (!this.logFile) return;
      await this.logFile.delete();
      this.logFile = null;
    } catch {}
  }
}
