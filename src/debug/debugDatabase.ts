import { db } from "@/src/db";

export async function debugDatabase() {
  try {
    const tables = await db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table';",
    );

    console.log("📦 SQLite Tables:", tables);

    const surveyColumns = await db.getAllAsync("PRAGMA table_info(surveys);");

    console.log("📋 surveys table structure:", surveyColumns);

    const answerColumns = await db.getAllAsync(
      "PRAGMA table_info(survey_answers);",
    );

    console.log("📋 survey_answers table structure:", answerColumns);

    const indexes = await db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='index';",
    );

    console.log("📑 Indexes:", indexes);
  } catch (error) {
    console.error("❌ Debug DB error:", error);
  }
}
