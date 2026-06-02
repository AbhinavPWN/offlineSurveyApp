import { GlobalSyncResult } from "./GlobalSyncUseCase";

export type SyncAlertContent = {
  title: string;
  message: string;
};

function getSyncStepLabel(step: string) {
  switch (step) {
    case "HOUSEHOLD":
      return "Households";
    case "MEMBER":
      return "Members";
    case "SURVEY":
      return "Surveys";
    default:
      return step;
  }
}

export function buildGlobalSyncAlert(
  result: GlobalSyncResult,
): SyncAlertContent {
  const steps = result?.steps ?? [];

  const totalSuccess = steps.reduce(
    (sum, step) => sum + (step.summary?.success ?? 0),
    0,
  );

  const totalFailed = steps.reduce(
    (sum, step) => sum + (step.summary?.failed ?? 0),
    0,
  );

  const totalSkipped = steps.reduce(
    (sum, step) => sum + (step.summary?.skipped ?? 0),
    0,
  );

  const totalItems = steps.reduce(
    (sum, step) => sum + (step.summary?.total ?? 0),
    0,
  );

  const isOffline = steps.some((step) =>
    step.summary?.items?.some(
      (item) =>
        item.reason === "No internet connection." ||
        item.reason === "No internet connection",
    ),
  );

  if (isOffline) {
    return {
      title: "No Internet Connection",
      message:
        "Your data is safely saved on this device.\n\nPlease connect to the internet and try syncing again.",
    };
  }

  if (totalItems === 0) {
    return {
      title: "Nothing to Sync",
      message: "All completed records are already synced.",
    };
  }

  const successLines = steps
    .filter((step) => (step.summary?.success ?? 0) > 0)
    .map((step) => {
      const count = step.summary.success;
      return `✓ ${getSyncStepLabel(step.step)}: ${count} synced`;
    });

  const failedLines = steps
    .filter((step) => (step.summary?.failed ?? 0) > 0)
    .map((step) => {
      const failedItems =
        step.summary?.items
          ?.filter((item) => item.status === "FAILED")
          ?.slice(0, 3)
          ?.map((item) => {
            const reason = item.reason ? ` — ${item.reason}` : "";
            return `  • ${item.label || item.id}${reason}`;
          })
          ?.join("\n") || "";

      return `⚠ ${getSyncStepLabel(step.step)}: ${
        step.summary.failed
      } need attention${failedItems ? `\n${failedItems}` : ""}`;
    });

  const skippedLines = steps
    .filter((step) => (step.summary?.skipped ?? 0) > 0)
    .map((step) => {
      const skippedItems =
        step.summary?.items
          ?.filter((item) => item.status === "SKIPPED")
          ?.slice(0, 3)
          ?.map((item) => {
            const reason = item.reason ? ` — ${item.reason}` : "";
            return `  • ${item.label || item.id}${reason}`;
          })
          ?.join("\n") || "";

      return `• ${getSyncStepLabel(step.step)}: ${
        step.summary.skipped
      } waiting${skippedItems ? `\n${skippedItems}` : ""}`;
    });

  if (totalFailed === 0 && totalSkipped === 0) {
    return {
      title: "Sync Complete",
      message: [
        "Your completed data has been synced successfully.",
        "",
        ...successLines,
      ].join("\n"),
    };
  }

  if (totalFailed === 0 && totalSkipped > 0) {
    return {
      title: "Sync Complete",
      message: [
        "Your completed data has been synced.",
        "",
        ...successLines,
        "",
        "Waiting:",
        ...skippedLines,
      ].join("\n"),
    };
  }

  if (totalSuccess > 0) {
    return {
      title: "Sync Partly Complete",
      message: [
        "Some data synced successfully, but some records need review.",
        "",
        "Synced:",
        ...successLines,
        "",
        "Needs attention:",
        ...failedLines,
        ...(totalSkipped > 0 ? ["", "Waiting:", ...skippedLines] : []),
        "",
        "Please review the highlighted records and sync again.",
      ].join("\n"),
    };
  }

  return {
    title: "Sync Needs Attention",
    message: [
      "No records could be synced.",
      "",
      ...failedLines,
      ...(totalSkipped > 0 ? ["", "Waiting:", ...skippedLines] : []),
      "",
      "Please check the records and try again.",
    ].join("\n"),
  };
}

export function mapSyncStepStatusForUI(
  status: string,
): "PENDING" | "SUCCESS" | "FAILED" {
  switch (status) {
    case "SUCCESS":
    case "SKIPPED":
      return "SUCCESS";

    case "PARTIAL":
    case "FAILED":
      return "FAILED";

    default:
      return "FAILED";
  }
}
