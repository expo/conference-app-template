// Data adapters. Each one resolves to the normalized schema, or null when
// the fetch fails (the app keeps its last data).
// Keep this file free of React Native imports so Node scripts can use it.

import type { DataSource } from "../../config/types";
import { isNormalizedData, NormalizedData } from "../schema";
import { fetchSessionize } from "./sessionize";

export type DataAdapter = {
  /** Null when the source is offline-only (bundled). */
  fetchAll: (() => Promise<NormalizedData | null>) | null;
};

const fetchNormalizedJson = async (
  url: string,
): Promise<NormalizedData | null> => {
  try {
    const result = await fetch(url);
    const data = await result.json();
    return isNormalizedData(data) ? data : null;
  } catch {
    return null;
  }
};

export const getAdapter = (source: DataSource): DataAdapter => {
  switch (source.source) {
    case "sessionize":
      return { fetchAll: () => fetchSessionize(source.sessionizeId) };
    case "json":
      return { fetchAll: () => fetchNormalizedJson(source.url) };
    case "bundled":
      return { fetchAll: null };
  }
};
