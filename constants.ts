import { AssetType } from "./types";

export const INITIAL_CATEGORIES = [
  "Writing Assistant",
  "Coding",
  "Image Generation",
  "Data Analysis",
  "Creative Writing",
  "Business",
  "Education"
];

export const MOCK_DATA = [
  {
    id: "P-001",
    type: AssetType.PROMPT,
    title: "English Translator Professional",
    category: "Writing Assistant",
    tags: ["#Translation", "#V1", "#Professional"],
    currentVersion: "v1.0",
    content: "You are a professional translator specializing in academic papers. Translate the following text into fluent, academic English...",
    versions: [
      {
        version: "v1.0",
        content: "You are a professional translator specializing in academic papers. Translate the following text into fluent, academic English...",
        changelog: "Initial version",
        timestamp: Date.now() - 10000000
      }
    ],
    createdAt: Date.now() - 10000000,
    updatedAt: Date.now() - 10000000
  },
  {
    id: "I-001",
    type: AssetType.IDEA,
    title: "React Component Generator",
    category: "Coding",
    tags: ["#React", "#Frontend"],
    currentVersion: "v1.0",
    content: "Need a prompt that takes a JSON description of props and returns a functional React component with Typescript interfaces.",
    versions: [
        {
            version: "v1.0",
            content: "Need a prompt that takes a JSON description of props and returns a functional React component with Typescript interfaces.",
            changelog: "Initial thought",
            timestamp: Date.now() - 5000000
        }
    ],
    createdAt: Date.now() - 5000000,
    updatedAt: Date.now() - 5000000
  }
];
