// app/_hooks/use-notifications.ts
import { useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAGE_SIZE = 4;

export function useNotifications(userId: string) {
  const queryClient = useQueryClient();

  // Debug logging
  console.log('useNotifications - userId:', userId)

  // Infinite query for notifications
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    isError,
  } = useInfiniteQuery({
    queryKey: ["notifications", userId],
    queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => {
      const { data, error } = await supabase
        .schema("morpheus")
        .from("ynotification")
        .select("*")
        .eq("ycible", userId)
        .order("sysdate", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (error) throw error;
      return (data ?? []) as Database["morpheus"]["Tables"]["ynotification"]["Row"][];
    },
    initialPageParam: 0,
    getNextPageParam: (
      lastPage: Database["morpheus"]["Tables"]["ynotification"]["Row"][],
      allPages: Database["morpheus"]["Tables"]["ynotification"]["Row"][][]
    ) =>
      lastPage.length === PAGE_SIZE
        ? allPages.length * PAGE_SIZE
        : undefined,
    enabled: !!userId && userId !== "", // Only run query if userId is valid
    staleTime: 60_000,
  });

  // Separate query for unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ["notifications-unread-count", userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .schema("morpheus")
        .from("ynotification")
        .select("*", { count: 'exact', head: true })
        .eq("ycible", userId)
        .eq("yest_lu", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId && userId !== "",
    staleTime: 30_000, // 30 seconds
  });

  // Flatten notifications
  const notifications =
    data?.pages.flat() ?? [];

  // Debug logging
  console.log('useNotifications - data:', data)
  console.log('useNotifications - notifications:', notifications)
  console.log('useNotifications - unreadCountData:', unreadCountData)
  console.log('useNotifications - isLoading:', isLoading)
  console.log('useNotifications - isError:', isError)

  // Use the separate unread count query result
  const unreadCount = unreadCountData || 0;

  // Mark single notification as seen
  const markAsSeenMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .schema("morpheus")
        .from("ynotification")
        .update({ yest_lu: true })
        .eq("ynotificationid", id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      // Update the notifications cache directly instead of invalidating
      queryClient.setQueryData(["notifications", userId], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any[]) =>
            page.map((notification: any) =>
              notification.ynotificationid === id
                ? { ...notification, yest_lu: true }
                : notification
            )
          ),
        };
      });

      // Update the unread count cache
      queryClient.setQueryData(["notifications-unread-count", userId], (oldCount: number) => {
        return Math.max(0, (oldCount || 0) - 1);
      });
    },
  });

  // Mark all as seen
  const markAllAsSeenMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .schema("morpheus")
        .from("ynotification")
        .update({ yest_lu: true })
        .eq("ycible", userId)
        .eq("yest_lu", false);
      if (error) throw error;
    },
    onSuccess: () => {
      // Update the notifications cache directly instead of invalidating
      queryClient.setQueryData(["notifications", userId], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any[]) =>
            page.map((notification: any) => ({
              ...notification,
              yest_lu: true,
            }))
          ),
        };
      });

      // Update the unread count cache to 0
      queryClient.setQueryData(["notifications-unread-count", userId], 0);
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("ynotification-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "morpheus", table: "ynotification" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
          queryClient.invalidateQueries({ queryKey: ["notifications-unread-count", userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return {
    notifications,
    unreadCount,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    isError,
    markAsSeen: markAsSeenMutation.mutate,
    markAllAsSeen: markAllAsSeenMutation.mutate,
  };
}