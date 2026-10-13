import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import snapshot from "@/data/snapshot.json";
import { getAdapter } from "@/data/adapters";
import { NormalizedData } from "@/data/schema";
import { ScheduleDay, Speaker } from "@/types";
import { buildScheduleDays } from "@/utils/sessions";
import conference from "../../conference.config";

const adapter = getAdapter(conference.data);

type ConfState = {
  days: ScheduleDay[];
  speakers: Speaker[];
  isRefreshing?: boolean;
  lastRefreshed: string | null;
  refreshData: (options?: { ttlMs?: number }) => Promise<void>;
  shouldUseLocalTz: boolean;
  toggleLocalTz: () => void;
};

const getInitialSchedule = () => {
  const data = snapshot as unknown as NormalizedData;
  return {
    days: buildScheduleDays(data),
    speakers: data.speakers,
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

        // Bail out if the app only uses the bundled snapshot
        if (!adapter.fetchAll) {
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

          const data = await adapter.fetchAll();

          if (data) {
            set({
              days: buildScheduleDays(data),
              speakers: data.speakers,
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
