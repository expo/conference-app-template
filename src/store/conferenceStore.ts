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

/** A bundled schedule the dev menu can load for testing. */
export type DevDataset = {
  id: string;
  name: string;
  timezone: string;
  timezoneAbbreviation?: string;
  data: NormalizedData;
};

type ConfState = {
  days: ScheduleDay[];
  speakers: Speaker[];
  /** Venue timezone of the data on screen. Matches the config normally. */
  venueTimezone: string;
  venueTimezoneAbbreviation?: string;
  /** Name shown in the schedule header. */
  displayName: string;
  /** Id of the dev dataset on screen, or null for the real data. */
  devDatasetId: string | null;
  isRefreshing?: boolean;
  lastRefreshed: string | null;
  refreshData: (options?: { ttlMs?: number }) => Promise<void>;
  loadDevDataset: (dataset: DevDataset | null) => void;
  shouldUseLocalTz: boolean;
  toggleLocalTz: () => void;
};

const getInitialSchedule = () => {
  const data = snapshot as unknown as NormalizedData;
  return {
    days: buildScheduleDays(data, conference.timezone),
    speakers: data.speakers,
    venueTimezone: conference.timezone,
    venueTimezoneAbbreviation: conference.timezoneAbbreviation,
    displayName: conference.shortName ?? conference.name,
    devDatasetId: null,
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
        const { isRefreshing, lastRefreshed, devDatasetId } = get();

        // Bail out if the app only uses the bundled snapshot
        if (!adapter.fetchAll) {
          return;
        }

        // Bail out while a dev dataset is on screen
        if (devDatasetId) {
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
              days: buildScheduleDays(data, conference.timezone),
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
      loadDevDataset: (dataset) => {
        if (!dataset) {
          set(getInitialSchedule());
          return;
        }
        set({
          days: buildScheduleDays(dataset.data, dataset.timezone),
          speakers: dataset.data.speakers,
          venueTimezone: dataset.timezone,
          venueTimezoneAbbreviation: dataset.timezoneAbbreviation,
          displayName: dataset.name,
          devDatasetId: dataset.id,
        });
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
