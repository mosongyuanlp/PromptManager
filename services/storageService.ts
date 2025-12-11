import { Asset } from "../types";
import { MOCK_DATA } from "../constants";

const GLOBAL_STORAGE_KEY = "prompt_lifecycle_architect_data";

// Helper to get key based on user
const getStorageKey = (userId?: string) => {
    if (!userId) return GLOBAL_STORAGE_KEY;
    return `prompt_lifecycle_architect_data_${userId}`;
}

export const getAssets = (userId?: string): Asset[] => {
  const key = getStorageKey(userId);
  const data = localStorage.getItem(key);
  
  if (!data) {
    // If user specific and empty, we could initialize with empty or mock.
    // Let's initialize with empty for new users to avoid clutter.
    if (userId) {
        return [];
    }
    // Fallback for guest mode (backward compatibility)
    localStorage.setItem(key, JSON.stringify(MOCK_DATA));
    return MOCK_DATA as Asset[];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse assets from storage", e);
    return [];
  }
};

export const saveAssets = (assets: Asset[], userId?: string) => {
  const key = getStorageKey(userId);
  localStorage.setItem(key, JSON.stringify(assets));
};

export const exportData = (assets: Asset[]) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(assets, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "prompt_architect_export.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
