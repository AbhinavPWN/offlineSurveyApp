// hook that owns the Community member selection, local loading, download state, and errors.
import React from "react";

import {
  communityMemberLocalRepository,
  downloadCommunityMembersUseCase,
} from "../../../di/container";
import {
  CommunityCategoryNo,
  CommunityMemberCategory,
} from "../../../services/api/dto/CommunityDTO";
import { CommunityMember } from "../models/CommunityMember";
import { SaveCommunityMembersSummary } from "../repositories/CommunityMemberLocalRepository";

interface UseCommunityMemberDownloadParams {
  empId: string;
  isOnline: boolean;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Unable to load community members.";
}

export function useCommunityMemberDownload({
  empId,
  isOnline,
}: UseCommunityMemberDownloadParams) {
  const [categoryNo, setCategoryNo] =
    React.useState<CommunityCategoryNo | null>(null);

  const [memberCategory, setMemberCategory] =
    React.useState<CommunityMemberCategory | null>(null);

  const [members, setMembers] = React.useState<CommunityMember[]>([]);
  const [lastDownloadedAt, setLastDownloadedAt] = React.useState<number | null>(
    null,
  );

  const [loadingLocalMembers, setLoadingLocalMembers] = React.useState(false);

  const [downloading, setDownloading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /*
   * Prevent an older database request from replacing results after
   * the user has already selected another filter.
   */
  const loadSequence = React.useRef(0);

  const hasSelectedFilters = categoryNo !== null && memberCategory !== null;

  const refreshLocalMembers = React.useCallback(async () => {
    const currentSequence = ++loadSequence.current;

    if (!categoryNo || !memberCategory) {
      setMembers([]);
      setLastDownloadedAt(null);
      setLoadingLocalMembers(false);
      setError(null);
      return;
    }

    const normalizedEmpId = empId.trim();

    if (!normalizedEmpId) {
      setMembers([]);
      setLastDownloadedAt(null);
      setLoadingLocalMembers(false);
      setError("Employee ID is unavailable. Please login again.");
      return;
    }

    setLoadingLocalMembers(true);
    setError(null);

    try {
      const filter = {
        empId: normalizedEmpId,
        categoryNo,
        memberCategory,
      };

      const [storedMembers, downloadedAt] = await Promise.all([
        communityMemberLocalRepository.listByFilter(filter),
        communityMemberLocalRepository.getLastDownloadedAt(filter),
      ]);

      if (currentSequence !== loadSequence.current) {
        return;
      }

      setMembers(storedMembers);
      setLastDownloadedAt(downloadedAt);
    } catch (loadError) {
      if (currentSequence !== loadSequence.current) {
        return;
      }

      setMembers([]);
      setLastDownloadedAt(null);
      setError(getErrorMessage(loadError));
    } finally {
      if (currentSequence === loadSequence.current) {
        setLoadingLocalMembers(false);
      }
    }
  }, [categoryNo, empId, memberCategory]);

  React.useEffect(() => {
    void refreshLocalMembers();

    return () => {
      loadSequence.current += 1;
    };
  }, [refreshLocalMembers]);

  const downloadMembers =
    React.useCallback(async (): Promise<SaveCommunityMembersSummary> => {
      if (!isOnline) {
        throw new Error(
          "Connect to the internet to download community members.",
        );
      }

      const normalizedEmpId = empId.trim();

      if (!normalizedEmpId) {
        throw new Error("Employee ID is unavailable. Please login again.");
      }

      if (!categoryNo || !memberCategory) {
        throw new Error("Select both Category No. and Member Category.");
      }

      setDownloading(true);
      setError(null);

      try {
        const summary = await downloadCommunityMembersUseCase.execute({
          empId: normalizedEmpId,
          categoryNo,
          memberCategory,
        });

        await refreshLocalMembers();

        return summary;
      } catch (downloadError) {
        const message = getErrorMessage(downloadError);

        setError(message);
        throw new Error(message);
      } finally {
        setDownloading(false);
      }
    }, [categoryNo, empId, isOnline, memberCategory, refreshLocalMembers]);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    categoryNo,
    setCategoryNo,

    memberCategory,
    setMemberCategory,

    members,
    lastDownloadedAt,

    hasSelectedFilters,
    canDownload: hasSelectedFilters && isOnline && !downloading,

    loadingLocalMembers,
    downloading,
    error,

    downloadMembers,
    refreshLocalMembers,
    clearError,
  };
}
