import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Genre, PremiumPlan } from "../backend.d";
import { useActor } from "./useActor";

export function useListVideosByGenre(genre: Genre) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["videos", genre],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listVideosByGenre(genre);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListAllVideos() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["videos", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVideoById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["video", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getVideoById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useContinueWatching() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["continueWatching"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getContinueWatching();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWatchProgress(videoId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["watchProgress", videoId?.toString()],
    queryFn: async () => {
      if (!actor || videoId === null) return null;
      return actor.getWatchProgress(videoId);
    },
    enabled: !!actor && !isFetching && videoId !== null,
  });
}

export function useRecordProgress() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      videoId,
      watchedSeconds,
    }: { videoId: bigint; watchedSeconds: bigint }) => {
      if (!actor) return false;
      return actor.recordProgress(videoId, watchedSeconds);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["continueWatching"] });
    },
  });
}

export function useSubmitPremiumRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      plan,
      utrId,
    }: { plan: PremiumPlan; utrId: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitPremiumRequest(plan, utrId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["premiumStatus"] });
    },
  });
}

export function usePendingPremiumRequests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pendingPremiumRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingPremiumRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVerifyPremiumRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      approve,
    }: { requestId: bigint; approve: boolean }) => {
      if (!actor) throw new Error("Not connected");
      return actor.verifyPremiumRequest(requestId, approve);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingPremiumRequests"] });
    },
  });
}
