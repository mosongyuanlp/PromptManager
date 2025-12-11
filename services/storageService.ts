import { Asset } from "../types";
import { MOCK_DATA } from "../constants";

const STORAGE_KEY = "prompt_lifecycle_architect_data";

export const getAssets = (): Asset[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    // Initialize with mock data if empty
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DATA));
    return MOCK_DATA as Asset[];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse assets from storage", e);
    return [];
  }
};

export const saveAssets = (assets: Asset[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
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
