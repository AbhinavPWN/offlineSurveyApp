// enqueue → DB (queue table) → memory (Map) → process → DB (answers)

import { surveySQLite } from "@/src/services/surveySQLite";

// Defining Tasks
type WriteTask = {
  surveyId: string;
  questionKey: string;
  answer: string | null;
  retries: number;
  onSuccess?: () => void;
  onError?: () => void;
};

type QueueDBTask = {
  id: string;
  survey_id: string;
  question_key: string;
  answer: string | null;
  status: "pending" | "processing" | "failed";
  retry_count: number;
  created_at: string;
  updated_at: string;
};

//  Sleep Helper function
function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// Creating a simple in-memory queue
const latestTaskMap = new Map<string, WriteTask>(); // key: `${surveyId}-${questionkey}`

// Adding DEBOUNCE mechanism
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

// Trigger processing function
let isProcessing = false;

// Enqueue function with debounce
export function enqueueAnswerWrite(task: {
  surveyId: string;
  questionKey: string;
  answer: string | null;
  onSuccess?: () => void;
  onError?: () => void;
}) {
  const key = `${task.surveyId}_${task.questionKey}`;

  console.log("[Queue] Input received:", key, task.answer);

  // Clear previous timer
  if (debounceTimers.has(key)) {
    clearTimeout(debounceTimers.get(key)!);
  }

  const timer = setTimeout(async () => {
    const newTask: WriteTask = {
      ...task,
      retries: 0,
    };

    await surveySQLite.upsertQueueTask(
      task.surveyId,
      task.questionKey,
      task.answer,
    );
    // console.log("[Queue][DB_SAVED]", key, task.answer);

    latestTaskMap.set(key, newTask);

    console.log("[Queue][ENQUEUED_DEBOUNCED]", key);

    debounceTimers.delete(key); // Deleting the debounce timer so it doesn't leak

    triggerProcessing();
  }, 300);

  debounceTimers.set(key, timer);
}

function triggerProcessing() {
  if (isProcessing) return;
  processQueue();
}

// Core ENGINE
export async function processQueue() {
  if (isProcessing) return;
  const dbTasks = (await surveySQLite.getPendingQueueTasks()) as QueueDBTask[];

  isProcessing = true;

  console.log("[Queue][PROCESS_START]");

  try {
    for (const dbTask of dbTasks) {
      const key = `${dbTask.survey_id}_${dbTask.question_key}`;
      const memoryTask = latestTaskMap.get(key);

      try {
        console.log("[Queue][DB_SAVE_ATTEMPT]", key, dbTask.answer);

        await surveySQLite.saveSurveyAnswer(
          dbTask.survey_id,
          dbTask.question_key,
          dbTask.answer,
        );

        await surveySQLite.markQueueTaskSuccess(key);

        console.log("[Queue][DB_SAVE_SUCCESS]", key);
        //  trigger UI update
        if (memoryTask?.onSuccess) {
          memoryTask.onSuccess();
        }

        //  cleanup
        latestTaskMap.delete(key);

        await sleep(50);
      } catch (error) {
        const newRetry = dbTask.retry_count + 1;

        console.log("[Queue][DB_SAVE_FAILED]", key, "Retry:", newRetry, error);
        if (memoryTask?.onError) {
          memoryTask.onError();
        }

        latestTaskMap.delete(key);

        if (newRetry >= 3) {
          await surveySQLite.markQueueTaskFailure(key, newRetry);
        } else {
          await surveySQLite.markQueueTaskFailure(key, newRetry);
        }
      }
    }
  } finally {
    isProcessing = false;

    // if new tasks came in during processing, trigger again
    const remainingTasks = await surveySQLite.getPendingQueueTasks();

    if (remainingTasks.length > 0) {
      console.log("[Queue][RETRY_LOOP_TRIGGERED_DB]");

      await sleep(200); // small delay

      processQueue();
    } else {
      console.log("[Queue][PROCESS_IDLE]");
    }
  }
}

// FlushQueue : to ensure all pending writes are saved to SQLite
export async function flushQueue() {
  console.log("[Queue][FLUSH_START]");

  // Wait until all tasks are processed
  while (true) {
    const hasPendingTasks = latestTaskMap.size > 0;
    const isBusy = isProcessing;

    if (!hasPendingTasks && !isBusy) {
      break;
    }

    console.log(
      "[Queue][FLUSH_WAITING]",
      "pending:",
      latestTaskMap.size,
      "processing:",
      isProcessing,
    );

    await sleep(50);
  }

  console.log("[Queue][FLUSH_COMPLETE]");
}
