import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import initialAllSessions from "@/data/allSessions.json";
import { ApiAllSessions, ScheduleDay } from "@/types";
import { formatSessions } from "@/utils/sessions";
import conference from "../../conference.config";

const getDataUrl = () => {
  switch (conference.data.source) {
    case "sessionize":
      return `https://sessionize.com/api/v2/${conference.data.sessionizeId}/view/All`;
    case "json":
      return conference.data.url;
    case "bundled":
      return null;
  }
};

const doFetch = async (url: string) => {
  try {
    const result = await fetch(url);
    return await result.json();
  } catch {
    return null;
  }
};

type ConfState = {
  days: ScheduleDay[];
  allSessions: ApiAllSessions;
  isRefreshing?: boolean;
  lastRefreshed: string | null;
  refreshData: (options?: { ttlMs?: number }) => Promise<void>;
  shouldUseLocalTz: boolean;
  toggleLocalTz: () => void;
};

const getInitialSchedule = () => {
  return {
    days: formatSessions(initialAllSessions),
    allSessions: initialAllSessions as ApiAllSessions,
  };
};

export const useConferenceStore = create(
  persist<ConfState>(
    (set, get) => ({
      ...getInitialSchedule(),
      isRefreshing: false,
      lastRefreshed: null,
      shouldUseLocalTz: false,
      refreshData: async (options) => {
        const ttlMs = options?.ttlMs || 0;
        const { isRefreshing, lastRefreshed } = get();

        const dataUrl = getDataUrl();

        // Bail out if the app only uses the bundled snapshot
        if (!dataUrl) {
          return;
        }

        // Bail out if already refreshing
        if (isRefreshing) {
          return;
        }

        // Bail out if last refresh was within TTL
        if (lastRefreshed) {
          const diff = new Date().getTime() - new Date(lastRefreshed).getTime();
          if (ttlMs && diff < ttlMs) {
            return;
          }
        }

        try {
          set({ isRefreshing: true });

          const allSessions = await doFetch(dataUrl);

          if (allSessions) {
            set({
              days: formatSessions(allSessions),
              allSessions,
              lastRefreshed: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.warn(e);
        } finally {
          set({ isRefreshing: false });
        }
      },
      toggleLocalTz: () => {
        set((state) => ({ shouldUseLocalTz: !state.shouldUseLocalTz }));
      },
    }),
    {
      name: `${conference.slug}-store`,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        const { isRefreshing: _, ...dataToPersist } = state;
        return dataToPersist;
      },
    },
  ),
);
