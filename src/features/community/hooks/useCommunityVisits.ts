import React from "react";
import {
  communityVisitLocalRepository,
  saveCommunityVisitDraftUseCase,
  queueCommunityVisitUseCase,
  syncCommunityVisitUseCase,
} from "../../../di/container";
import type { CommunityVisitFormValues } from "../components/CommunityVisitForm";
import type { CommunityVisit } from "../models/CommunityVisit";
import type { CommunityVisitWithAttendees } from "../repositories/CommunityVisitLocalRepository";

interface UseCommunityVisitsParams {
  chwUsername: string;
  supervisorId: string;
}

type AccountContext = UseCommunityVisitsParams;

export interface CommunityVisitEditor {
  /** Use as the form's React key to reset state when opening another draft. */
  key: string;
  target: { visitLocalId: string; expectedUpdatedAt: number } | null;
  initialValues?: CommunityVisitFormValues;
}

interface VisitState {
  context: AccountContext;
  visits: CommunityVisit[];
  editor: CommunityVisitEditor | null;
  loading: boolean;
  opening: boolean;
  saving: boolean;
  processingVisitId: string | null;
  notice: string | null;
  error: string | null;
}

function emptyState(context: AccountContext): VisitState {
  return {
    context,
    visits: [],
    editor: null,
    loading: false,
    opening: false,
    saving: false,
    processingVisitId: null,
    notice: null,
    error: null,
  };
}

function message(error: unknown): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : "Unable to access Community visits.";
}

function formValues({
  visit,
  attendees,
}: CommunityVisitWithAttendees): CommunityVisitFormValues {
  const selectedMembers = attendees.map((attendee) => {
    if (!attendee.clientNo?.trim()) {
      // Do not silently drop provisional manual attendees when replacing a draft.
      throw new Error(
        "This draft includes a manual attendee and cannot be edited with downloaded-member selection yet.",
      );
    }
    return {
      clientNo: attendee.clientNo,
      memberName: attendee.visitorName,
      gender: attendee.gender ?? "",
      districtId: attendee.districtId ?? "",
      vdcnpCode: attendee.vdcnpCode ?? "",
      wardNo: attendee.wardNo,
      address: attendee.address ?? "",
    };
  });
  return {
    visitDateBs: visit.visitDateBs,
    visitDateAd: visit.visitDateAd,
    communityName: visit.communityName,
    address: visit.address,
    communityCategory: visit.communityCategory,
    noOfPresent: selectedMembers.length,
    noOfFemales: selectedMembers.filter(
      (member) => member.gender.trim().toUpperCase() === "F",
    ).length,
    noOfMales: selectedMembers.filter(
      (member) => member.gender.trim().toUpperCase() === "M",
    ).length,
    noOfPwd: visit.noOfPwd,
    sessionTopicNut: visit.sessionTopicNut,
    sessionTopicHealthly: visit.sessionTopicHealthly,
    sessionTopicDrug: visit.sessionTopicDrug,
    sessionTopicChild: visit.sessionTopicChild,
    sessionTopicHeat: visit.sessionTopicHeat,
    sessionTopicMalaria: visit.sessionTopicMalaria,
    sessionTopicDiarrhoea: visit.sessionTopicDiarrhoea,
    sessionTopicGbv: visit.sessionTopicGbv,
    selectedMembers,
  };
}

/** Local editing and explicit one-visit submission. No automatic or global sync. */
export function useCommunityVisits({
  chwUsername,
  supervisorId,
}: UseCommunityVisitsParams) {
  // A fresh token also distinguishes account A -> B -> A from the original A.
  const context = React.useMemo(
    () => ({ chwUsername, supervisorId }),
    [chwUsername, supervisorId],
  );
  const currentContext = React.useRef(context);
  currentContext.current = context;
  const mounted = React.useRef(true);
  const listSequence = React.useRef(0);
  const openSequence = React.useRef(0);
  const saveLock = React.useRef<object | null>(null);
  const activeEditor = React.useRef<{
    context: AccountContext;
    editor: CommunityVisitEditor;
  } | null>(null);
  const [state, setState] = React.useState<VisitState>(() =>
    emptyState(context),
  );
  // Hide the previous account immediately, before its cleanup effect runs.
  const visible = state.context === context ? state : emptyState(context);

  const isCurrent = React.useCallback(
    () => mounted.current && currentContext.current === context,
    [context],
  );
  const update = React.useCallback(
    (patch: Partial<Omit<VisitState, "context">>) => {
      if (!isCurrent()) return;
      setState((previous) => ({
        ...(previous.context === context ? previous : emptyState(context)),
        ...patch,
      }));
    },
    [context, isCurrent],
  );

  const refreshVisits = React.useCallback(async () => {
    if (!isCurrent()) return;
    const sequence = ++listSequence.current;
    if (!context.chwUsername.trim()) {
      update({
        visits: [],
        loading: false,
        error: "CHW username is unavailable. Please log in again.",
      });
      return;
    }
    update({ loading: true, error: null });
    try {
      const visits = await communityVisitLocalRepository.listByOwner(
        context.chwUsername,
      );
      if (isCurrent() && sequence === listSequence.current) update({ visits });
    } catch (error: unknown) {
      if (isCurrent() && sequence === listSequence.current)
        update({ error: message(error) });
    } finally {
      if (isCurrent() && sequence === listSequence.current)
        update({ loading: false });
    }
  }, [context, isCurrent, update]);

  React.useEffect(() => {
    mounted.current = true;
    activeEditor.current = null;
    saveLock.current = null;
    setState(emptyState(context));
    void refreshVisits();
    return () => {
      mounted.current = false;
      listSequence.current += 1;
      openSequence.current += 1;
    };
  }, [context, refreshVisits]);

  const openNewVisit = React.useCallback(() => {
    if (!isCurrent() || saveLock.current) return;
    if (!context.chwUsername.trim() || !context.supervisorId.trim()) {
      update({
        error: "CHW username and supervisor ID are required to create a draft.",
      });
      return;
    }
    const sequence = ++openSequence.current;
    const editor: CommunityVisitEditor = {
      key: `new-${sequence}`,
      target: null,
    };
    activeEditor.current = { context, editor };
    update({ editor, opening: false, error: null });
  }, [context, isCurrent, update]);

  const openDraft = React.useCallback(
    async (visitLocalId: string) => {
      if (!isCurrent() || saveLock.current) return;
      const sequence = ++openSequence.current;
      update({ opening: true, error: null });
      try {
        const record = await communityVisitLocalRepository.getByLocalId({
          chwUsername: context.chwUsername,
          visitLocalId,
        });
        if (!isCurrent() || sequence !== openSequence.current) return;
        if (!record)
          throw new Error("The visit is unavailable for this account.");
        if (
          record.visit.syncStatus !== "DRAFT" ||
          record.visit.serverId !== null ||
          record.attendees.some((attendee) => attendee.syncStatus !== "DRAFT")
        ) {
          throw new Error("Only unqueued drafts can be edited.");
        }
        if (record.visit.supervisorId !== context.supervisorId) {
          throw new Error(
            "The supervisor ID differs from this draft. Verify the account before editing.",
          );
        }
        const editor: CommunityVisitEditor = {
          key: `draft-${sequence}`,
          target: { visitLocalId, expectedUpdatedAt: record.visit.updatedAt },
          initialValues: formValues(record),
        };
        activeEditor.current = { context, editor };
        update({ editor });
      } catch (error: unknown) {
        if (isCurrent() && sequence === openSequence.current)
          update({ error: message(error) });
      } finally {
        if (isCurrent() && sequence === openSequence.current)
          update({ opening: false });
      }
    },
    [context, isCurrent, update],
  );

  /** The caller should confirm discarding unsaved changes before calling this. */
  const closeEditor = React.useCallback(() => {
    if (!isCurrent() || saveLock.current) return;
    openSequence.current += 1;
    activeEditor.current = null;
    update({ editor: null, opening: false, error: null });
  }, [isCurrent, update]);

  const saveDraft = React.useCallback(
    async (values: CommunityVisitFormValues): Promise<void> => {
      const editor = visible.editor;
      if (
        !isCurrent() ||
        !editor ||
        activeEditor.current?.context !== context ||
        activeEditor.current.editor !== editor
      ) {
        throw new Error(
          "This form is no longer active. Reopen the draft before saving.",
        );
      }
      if (saveLock.current)
        throw new Error("A draft save is already in progress.");
      const lock = {};
      saveLock.current = lock;
      // Invalidate earlier list/open requests so they cannot undo a successful save.
      listSequence.current += 1;
      openSequence.current += 1;
      update({ saving: true, loading: false, opening: false, error: null });
      try {
        const saved = await saveCommunityVisitDraftUseCase.execute({
          chwUsername: context.chwUsername,
          supervisorId: context.supervisorId,
          target: editor.target,
          values,
        });
        if (!isCurrent()) return;
        listSequence.current += 1;
        activeEditor.current = null;
        // Do not report a committed save as failed because a subsequent list read failed.
        setState((previous) => ({
          ...(previous.context === context ? previous : emptyState(context)),
          editor: null,
          loading: false,
          opening: false,
          saving: false,
          error: null,
          visits: [
            saved.visit,
            ...(previous.context === context ? previous.visits : []).filter(
              (visit) => visit.localId !== saved.visit.localId,
            ),
          ].sort(
            (a, b) =>
              b.createdAt - a.createdAt || a.localId.localeCompare(b.localId),
          ),
        }));
      } catch (error: unknown) {
        if (isCurrent()) update({ error: message(error) });
        throw error; // Form retains its inputs and displays the save error.
      } finally {
        if (saveLock.current === lock) saveLock.current = null;
        if (isCurrent()) update({ saving: false });
      }
    },
    [context, isCurrent, update, visible.editor],
  );

  const processVisit = React.useCallback(
    async (
      visitLocalId: string,
      expectedUpdatedAt: number | null,
      reviewedNotFound = false,
    ): Promise<void> => {
      if (!isCurrent()) return;
      if (saveLock.current || activeEditor.current?.context === context) {
        update({
          error: "Finish the current form or operation before submitting.",
        });
        return;
      }
      const lock = {};
      saveLock.current = lock;
      openSequence.current += 1;
      update({
        processingVisitId: visitLocalId,
        opening: false,
        error: null,
        notice: null,
      });
      let operationError: string | null = null;
      let notice: string | null = null;
      try {
        const scope = { chwUsername: context.chwUsername, visitLocalId };
        const record = await communityVisitLocalRepository.getByLocalId(scope);
        if (!isCurrent()) return;
        if (!record)
          throw new Error("This visit is unavailable for the current account.");
        if (record.visit.supervisorId !== context.supervisorId) {
          throw new Error(
            "The supervisor ID differs from this visit. Verify the account before submitting.",
          );
        }
        if (expectedUpdatedAt !== null) {
          await queueCommunityVisitUseCase.execute({
            ...scope,
            expectedUpdatedAt,
            // Keep the entered category until the senior finalizes its choices.
            confirmedCommunityCategories: null,
          });
        }
        if (!isCurrent()) return;
        const result = reviewedNotFound
          ? await syncCommunityVisitUseCase.retryAfterNotFoundReview(scope, {
              shouldContinue: isCurrent,
            })
          : await syncCommunityVisitUseCase.execute(scope, {
              retryFailed: expectedUpdatedAt === null,
              shouldContinue: isCurrent,
            });
        if (result.status === "SYNCED" || result.status === "PENDING")
          notice = result.message;
        else operationError = result.message;
      } catch (error: unknown) {
        operationError = message(error);
      } finally {
        // Reload even after a failure: the parent or some attendees may have saved.
        if (isCurrent()) {
          await refreshVisits();
          update({ processingVisitId: null, notice });
          if (operationError) update({ error: operationError });
        }
        if (saveLock.current === lock) saveLock.current = null;
      }
    },
    [context, isCurrent, refreshVisits, update],
  );

  const submitVisit = React.useCallback(
    (visitLocalId: string, expectedUpdatedAt: number) =>
      processVisit(visitLocalId, expectedUpdatedAt),
    [processVisit],
  );
  const uploadVisit = React.useCallback(
    (visitLocalId: string) => processVisit(visitLocalId, null),
    [processVisit],
  );
  const retryVisitAfterNotFoundReview = React.useCallback(
    (visitLocalId: string) => processVisit(visitLocalId, null, true),
    [processVisit],
  );

  return {
    visits: visible.visits,
    editor: visible.editor,
    loadingVisits: visible.loading,
    openingDraft: visible.opening,
    savingDraft: visible.saving,
    processingVisitId: visible.processingVisitId,
    notice: visible.notice,
    error: visible.error,
    refreshVisits,
    openNewVisit,
    openDraft,
    closeEditor,
    saveDraft,
    submitVisit,
    uploadVisit,
    retryVisitAfterNotFoundReview,
  };
}
