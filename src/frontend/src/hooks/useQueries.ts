import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CashflowEntry,
  CommunityMessage,
  DirectMessage,
  Habit,
  Task,
  UserProfile,
} from "../backend.d";
import { CommunityChannel, EntryType } from "../backend.d";
import { useActor } from "./useActor";

export { CommunityChannel, EntryType };

// ─── Profile ─────────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
      return profile;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(["currentUserProfile"], profile);
    },
  });
}

export function useIsFounder() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isFounder"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isFounder();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetUserList() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<
    Array<{
      principal: Principal;
      username: string;
      displayName: string;
      avatarId?: string;
    }>
  >({
    queryKey: ["userList"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserList();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30 * 1000,
  });
}

// ─── Habits ───────────────────────────────────────────────────────────────────

export function useGetHabits() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHabits();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddHabit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      const id = await actor.addHabit(name);
      return id;
    },
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: ["habits"] });
      const prev = queryClient.getQueryData<Habit[]>(["habits"]) ?? [];
      const optimistic: Habit = {
        id: BigInt(-Date.now()),
        name,
        completions: [],
        userId: {} as Principal,
        createdAt: BigInt(Date.now()),
      };
      queryClient.setQueryData(["habits"], [...prev, optimistic]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["habits"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useMarkHabitComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      habitId,
      dayTimestamp,
    }: { habitId: bigint; dayTimestamp: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markHabitComplete(habitId, dayTimestamp);
    },
    onMutate: async ({ habitId, dayTimestamp }) => {
      await queryClient.cancelQueries({ queryKey: ["habits"] });
      const prev = queryClient.getQueryData<Habit[]>(["habits"]) ?? [];
      queryClient.setQueryData(
        ["habits"],
        prev.map((h) =>
          h.id === habitId
            ? { ...h, completions: [...h.completions, dayTimestamp] }
            : h,
        ),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["habits"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useDeleteHabit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteHabit(habitId);
    },
    onMutate: async (habitId) => {
      await queryClient.cancelQueries({ queryKey: ["habits"] });
      const prev = queryClient.getQueryData<Habit[]>(["habits"]) ?? [];
      queryClient.setQueryData(
        ["habits"],
        prev.filter((h) => h.id !== habitId),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["habits"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export function useGetTasks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasks();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addTask(title);
    },
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const prev = queryClient.getQueryData<Task[]>(["tasks"]) ?? [];
      const optimistic: Task = {
        id: BigInt(-Date.now()),
        title,
        completed: false,
        userId: {} as Principal,
        createdAt: BigInt(Date.now()),
      };
      queryClient.setQueryData(["tasks"], [...prev, optimistic]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["tasks"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCompleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.completeTask(taskId);
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const prev = queryClient.getQueryData<Task[]>(["tasks"]) ?? [];
      queryClient.setQueryData(
        ["tasks"],
        prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t)),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["tasks"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteTask(taskId);
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const prev = queryClient.getQueryData<Task[]>(["tasks"]) ?? [];
      queryClient.setQueryData(
        ["tasks"],
        prev.filter((t) => t.id !== taskId),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["tasks"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// ─── Cashflow ─────────────────────────────────────────────────────────────────

export function useGetCashflowEntries() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CashflowEntry[]>({
    queryKey: ["cashflow"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCashflowEntries();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCashflowSummary() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    totalIncome: number;
    totalExpenses: number;
    totalInvestments: number;
    savings: number;
  }>({
    queryKey: ["cashflowSummary"],
    queryFn: async () => {
      if (!actor)
        return {
          totalIncome: 0,
          totalExpenses: 0,
          totalInvestments: 0,
          savings: 0,
        };
      return actor.getCashflowSummary();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddCashflowEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entryType,
      entryLabel,
      amount,
      date,
    }: {
      entryType: EntryType;
      entryLabel: string;
      amount: number;
      date: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addCashflowEntry(entryType, entryLabel, amount, date);
    },
    onMutate: async ({ entryType, entryLabel, amount, date }) => {
      await queryClient.cancelQueries({ queryKey: ["cashflow"] });
      const prev =
        queryClient.getQueryData<CashflowEntry[]>(["cashflow"]) ?? [];
      const optimistic: CashflowEntry = {
        id: BigInt(-Date.now()),
        entryType,
        entryLabel,
        amount,
        date,
        userId: {} as Principal,
      };
      queryClient.setQueryData(["cashflow"], [...prev, optimistic]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["cashflow"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cashflow"] });
      queryClient.invalidateQueries({ queryKey: ["cashflowSummary"] });
      queryClient.invalidateQueries({ queryKey: ["wealthProgress"] });
    },
  });
}

export function useDeleteCashflowEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteCashflowEntry(entryId);
    },
    onMutate: async (entryId) => {
      await queryClient.cancelQueries({ queryKey: ["cashflow"] });
      const prev =
        queryClient.getQueryData<CashflowEntry[]>(["cashflow"]) ?? [];
      queryClient.setQueryData(
        ["cashflow"],
        prev.filter((e) => e.id !== entryId),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["cashflow"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cashflow"] });
      queryClient.invalidateQueries({ queryKey: ["cashflowSummary"] });
    },
  });
}

// ─── Wealth Goal ──────────────────────────────────────────────────────────────

export function useGetWealthProgress() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ goal: number; currentSavings: number; percentage: number }>(
    {
      queryKey: ["wealthProgress"],
      queryFn: async () => {
        if (!actor) return { goal: 0, currentSavings: 0, percentage: 0 };
        return actor.getWealthProgress();
      },
      enabled: !!actor && !actorFetching,
    },
  );
}

export function useSetWealthGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setWealthGoal(amount);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wealthProgress"] });
    },
  });
}

// ─── Community ────────────────────────────────────────────────────────────────

export function useGetChannelMessages(channel: CommunityChannel) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CommunityMessage[]>({
    queryKey: ["channelMessages", channel],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChannelMessages(channel);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function usePostToChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      channel,
      content,
      imageId,
    }: {
      channel: CommunityChannel;
      content: string;
      imageId: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.postToChannel(channel, content, imageId);
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["channelMessages", vars.channel],
      });
    },
  });
}

export function useGetConversationList() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<
    Array<{
      otherPrincipal: Principal;
      otherUsername: string;
      lastMessage: string;
      timestamp: bigint;
    }>
  >({
    queryKey: ["conversationList"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversationList();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function useGetDirectMessages(otherPrincipal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DirectMessage[]>({
    queryKey: ["directMessages", otherPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !otherPrincipal) return [];
      return actor.getDirectMessages(otherPrincipal);
    },
    enabled: !!actor && !actorFetching && !!otherPrincipal,
    refetchInterval: 3000,
  });
}

export function useSendDirectMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      toPrincipal,
      content,
      imageId,
    }: {
      toPrincipal: Principal;
      content: string;
      imageId: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.sendDirectMessage(toPrincipal, content, imageId);
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["directMessages", vars.toPrincipal.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["conversationList"] });
    },
  });
}
