import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import snapshot from "@/data/snapshot.json";
import { getAdapter } from "@/data/adapters";
import { NormalizedData } from "@/data/schema";
import type { ConferenceConfig } from "@/config/types";
import { ScheduleDay, Speaker } from "@/types";
import { buildScheduleDays } from "@/utils/sessions";
import conference from "../../conference.config";

const adapter = getAdapter(conference.data);

/** A bundled conference the dev menu can load for testing. */
export type DevDataset = {
  id: string;
  name: string;
  timezone: string;
  timezoneAbbreviation?: string;
  venue?: ConferenceConfig["venue"];
  infoSections: ConferenceConfig["infoSections"];
  sponsorTiers: ConferenceConfig["sponsorTiers"];
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
  venue?: ConferenceConfig["venue"];
  infoSections: ConferenceConfig["infoSections"];
  sponsorTiers: ConferenceConfig["sponsorTiers"];
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
    venue: conference.venue,
    infoSections: conference.infoSections,
    sponsorTiers: conference.sponsorTiers,
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
          venue: dataset.venue,
          infoSections: dataset.infoSections,
          sponsorTiers: dataset.sponsorTiers,
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
      version: 2,
      migrate: (persisted) => {
        // Strip config-derived fields and cached schedules that older
        // versions persisted; both re-initialize on launch.
        const {
          venueTimezone: _venueTimezone,
          venueTimezoneAbbreviation: _venueTimezoneAbbreviation,
          displayName: _displayName,
          venue: _venue,
          infoSections: _infoSections,
          sponsorTiers: _sponsorTiers,
          devDatasetId: _devDatasetId,
          days: _days,
          speakers: _speakers,
          ...rest
        } = (persisted ?? {}) as Record<string, unknown>;
        return rest as ConfState;
      },
      partialize: (state) => {
        // Config-derived and dev-only fields re-initialize on launch, so a
        // config change is never masked by stale persisted values.
        const {
          isRefreshing: _isRefreshing,
          venueTimezone: _venueTimezone,
          venueTimezoneAbbreviation: _venueTimezoneAbbreviation,
          displayName: _displayName,
          venue: _venue,
          infoSections: _infoSections,
          sponsorTiers: _sponsorTiers,
          devDatasetId,
          ...rest
        } = state;

        // Persist the schedule only when it comes from a remote source:
        // a dev dataset must not overwrite the real cache, and with the
        // bundled source the snapshot is already the source of truth.
        if (devDatasetId || conference.data.source === "bundled") {
          const { days: _days, speakers: _speakers, ...withoutData } = rest;
          return withoutData as ConfState;
        }
        return rest as ConfState;
      },
    },
  ),
);
