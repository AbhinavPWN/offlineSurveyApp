import { Directory, File, Paths } from "expo-file-system";

type LogLevel = "INFO" | "WARN" | "ERROR" | "SYNC";

/**
 * Configuration
 */
const MAX_LOG_SIZE = 500 * 1024; // 500 KB
const LEVEL_ORDER: LogLevel[] = ["INFO", "WARN", "ERROR", "SYNC"];
const MIN_LOG_LEVEL: LogLevel = "INFO";

export class AppLogger {
  private static logFile: File | null = null;

  private static shouldLog(level: LogLevel): boolean {
    return LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf(MIN_LOG_LEVEL);
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

      const payload = meta ? ` | ${JSON.stringify(meta)}` : "";
      const line = `[${new Date().toISOString()}] [${level}] ${message}${payload}\n`;

      let existing = "";
      const info = await file.info();

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
