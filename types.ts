export enum AssetType {
  PROMPT = 'Prompt',
  IDEA = 'Idea',
}

export interface Version {
  version: string;
  content: string;
  changelog: string;
  timestamp: number;
}

export interface Asset {
  id: string;
  type: AssetType;
  title: string;
  category: string;
  tags: string[];
  currentVersion: string;
  content: string;
  versions: Version[];
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  username: string;
  password?: string; // Stored locally for simulation
  apiKey?: string;
  createdAt: number;
}

export type AssetFilter = 'ALL' | AssetType.PROMPT | AssetType.IDEA;

export interface SortOption {
  field: 'updatedAt' | 'createdAt' | 'title';
  direction: 'asc' | 'desc';
}
