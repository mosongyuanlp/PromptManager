import { GoogleGenAI } from "@google/genai";
import { getCurrentUser } from "./authService";

const getAIClient = () => {
  const user = getCurrentUser();
  // Prioritize User API Key, then Environment Variable
  const apiKey = user?.apiKey || process.env.API_KEY;
  
  if (!apiKey) throw new Error("API Key not found. Please configure it in Settings.");
  
  return new GoogleGenAI({ apiKey });
};

export const generateSuggestions = async (content: string, type: 'PROMPT' | 'IDEA') => {
  try {
    const ai = getAIClient();
    const model = "gemini-2.5-flash"; // Fast model for UI interactions
    
    let prompt = "";
    if (type === 'IDEA') {
      prompt = `
        Role: Prompt Lifecycle Architect.
        Task: Analyze the following idea and suggest a structured prompt direction.
        Output: A short paragraph suggesting how to convert this idea into a robust prompt, including suggested category and tags.
        
        Idea: "${content}"
      `;
    } else {
      prompt = `
        Role: Prompt Lifecycle Architect.
        Task: Analyze the following prompt for logic loopholes or improvements.
        Output: Bullet points of concise critique and optimization suggestions.
        
        Prompt: "${content}"
      `;
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API Key")) {
        return "Error: Missing API Key. Please add your Google Gemini API Key in Settings.";
    }
    return "AI Assistant unavailable. Please check your API configuration.";
  }
};

export const autoCategorize = async (content: string, categories: string[]) => {
    try {
        const ai = getAIClient();
        const model = "gemini-2.5-flash";
        const prompt = `
            Analyze this text and select the best matching category from the list: [${categories.join(", ")}].
            Also generate up to 3 relevant hashtags.
            Output JSON format: { "category": "string", "tags": ["string"] }
            
            Text: "${content.substring(0, 500)}"
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Auto categorize failed", e);
        return null;
    }
}
