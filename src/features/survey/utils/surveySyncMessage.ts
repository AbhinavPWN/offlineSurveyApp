import type { SyncEntitySummary } from "@/src/usecases/sync/SyncSummary";

export function buildSurveySyncMessage(result: SyncEntitySummary) {
  const count = (value: number) =>
    `${value} ${value === 1 ? "survey" : "surveys"}`;
  if (result.total === 0) {
    return {
      title: "Nothing to sync",
      message: "There are no completed surveys waiting to sync.",
    };
  }
  if (result.failed === 0) {
    return {
      title: "Sync complete",
      message: `${count(result.success)} synced successfully.`,
    };
  }
  const failures = result.items.filter((item) => item.status === "FAILED");
  const details = failures
    .slice(0, 3)
    .map(
      (item) =>
        `${item.label || "Survey"}: ${item.reason || "Could not sync. Open the member's survey status for details."}`,
    );
  if (failures.length > 3)
    details.push(
      "Open Pending sync to see the other surveys that need attention.",
    );
  return {
    title:
      result.success > 0
        ? "Some surveys could not sync"
        : "Surveys could not sync",
    message: `${count(result.success)} synced. ${count(result.failed)} not synced.\n\nYour answers remain saved on this phone.\n\n${details.join("\n\n")}\n\nOpen Pending sync to find these surveys. If a submission needs checking, contact support before retrying.`,
  };
}
