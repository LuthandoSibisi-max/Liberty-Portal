
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { storageService } from "./storageService";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Helper functions for audio processing as per guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const geminiService = {
    async chat(message: string, history: string[] = []): Promise<string> {
        storageService.trackUsage('flash');
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: message, 
                config: { systemInstruction: "You are a helpful recruitment assistant." }
            });
            return response.text || "I couldn't generate a response.";
        } catch (error) { return "Error processing request."; }
    },

    async fastChat(message: string): Promise<string> {
        storageService.trackUsage('flash');
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-lite-latest',
                contents: message,
                config: { systemInstruction: "Concise assistant." }
            });
            return response.text || "No response.";
        } catch (error) { return "Error."; }
    },

    async proChat(message: string): Promise<string> {
        storageService.trackUsage('pro');
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: message,
                config: { thinkingConfig: { thinkingBudget: 32768 } }
            });
            return response.text || "No response.";
        } catch (error) { return "Error."; }
    },

    async search(query: string): Promise<{ text: string, sources?: any[] }> {
        storageService.trackUsage('flash');
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: query,
                config: { tools: [{ googleSearch: {} }] }
            });
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const sources = groundingChunks.filter((c: any) => c.web?.uri).map((c: any) => ({ uri: c.web.uri, title: c.web.title }));
            return { text: response.text || "No results.", sources };
        } catch (error) { throw error; }
    },

    async mapQuery(query: string): Promise<{ text: string, sources?: any[] }> {
         storageService.trackUsage('flash');
         try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: query,
                config: { tools: [{ googleMaps: {} }] }
            });
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const sources = groundingChunks.filter((c: any) => c.maps?.uri).map((c: any) => ({ 
                title: c.maps?.title || "Location",
                uri: c.maps?.uri || "#" 
            }));
            return { text: response.text || "No location data found.", sources };
        } catch (error) { throw error; }
    },

    async editImage(base64Image: string, prompt: string): Promise<string> {
        storageService.trackUsage('flash');
        try {
             const cleanBase64 = base64Image.split(',')[1] || base64Image;
             const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [{ inlineData: { mimeType: 'image/png', data: cleanBase64 } }, { text: prompt }]
                }
            });
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
            }
            throw new Error("No image generated.");
        } catch (error) { throw error; }
    },

    async generateVideo(prompt: string): Promise<string> {
         storageService.trackUsage('veo');
         try {
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
            });
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }
            const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (!videoUri) throw new Error("Video generation failed.");
            return `${videoUri}&key=${import.meta.env.VITE_GEMINI_API_KEY}`; 
        } catch (error) { throw error; }
    },

    async screenCandidate(candidateData: any, jobDescription: string): Promise<{ score: number, analysis: string, strengths: string[], weaknesses: string[] }> {
        storageService.trackUsage('flash');
        try {
            const prompt = `Screen candidate against job. JD: ${jobDescription}. Candidate: ${JSON.stringify(candidateData)}. JSON output: score (int), analysis (str), strengths (str[]), weaknesses (str[]).`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.INTEGER },
                            analysis: { type: Type.STRING },
                            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });
            return JSON.parse(response.text || "{}");
        } catch (error) { return { score: 0, analysis: "Error", strengths: [], weaknesses: [] }; }
    },

    async deepScreenCandidate(candidateData: any, jobDescription: string): Promise<{ score: number, analysis: string, strengths: string[], weaknesses: string[] }> {
        storageService.trackUsage('pro');
        try {
            const prompt = `Perform executive reasoning analysis. JD: ${jobDescription}. Candidate: ${JSON.stringify(candidateData)}. JSON.`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 32768 },
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.INTEGER },
                            analysis: { type: Type.STRING },
                            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });
            return JSON.parse(response.text || "{}");
        } catch (error) { return { score: 0, analysis: "Failed", strengths: [], weaknesses: [] }; }
    },

    async analyzeRecruitmentRisk(requestData: any): Promise<{ riskScore: number, rationale: string, factors: string[] }> {
        storageService.trackUsage('flash');
        try {
            const prompt = `Analyze recruitment risk. Data: ${JSON.stringify(requestData)}. JSON: riskScore, rationale, factors.`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            riskScore: { type: Type.INTEGER },
                            rationale: { type: Type.STRING },
                            factors: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });
            return JSON.parse(response.text || "{}");
        } catch (error) { return { riskScore: 50, rationale: "Error", factors: [] }; }
    },

    async generateInterviewQuestions(candidateData: any, roleTitle: string): Promise<any[]> {
        storageService.trackUsage('pro');
        try {
            const prompt = `Generate 5 interview questions for ${roleTitle}. Context: ${JSON.stringify(candidateData)}. JSON array.`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                rationale: { type: Type.STRING },
                                difficulty: { type: Type.STRING },
                                category: { type: Type.STRING }
                            }
                        }
                    }
                }
            });
            return JSON.parse(response.text || "[]");
        } catch (error) { return []; }
    },

    async parseResume(base64File: string): Promise<any> {
        storageService.trackUsage('flash');
        try {
            const cleanBase64 = base64File.split(',')[1] || base64File;
            const prompt = `Extract profile data from resume. JSON.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-lite-latest',
                contents: {
                    parts: [{ inlineData: { mimeType: 'application/pdf', data: cleanBase64 } }, { text: prompt }]
                },
                config: { responseMimeType: 'application/json' }
            });
            return JSON.parse(response.text || "{}");
        } catch (error) { return {}; }
    },

    async generatePerformanceReport(metrics: any): Promise<string> {
        storageService.trackUsage('flash');
        try {
            const prompt = `Generate executive HTML report for metrics: ${JSON.stringify(metrics)}. Use Tailwind classes.`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            return response.text || "<p>Error</p>";
        } catch (error) { return "<p>Error</p>"; }
    },

    // Fix for AIChatBot.tsx: Property 'transcribeAudio' does not exist
    async transcribeAudio(base64Audio: string): Promise<string> {
        storageService.trackUsage('flash');
        try {
            const cleanBase64 = base64Audio.split(',')[1] || base64Audio;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'audio/webm', data: cleanBase64 } },
                        { text: "Transcribe this audio precisely." }
                    ]
                }
            });
            return response.text || "";
        } catch (error) { return ""; }
    },

    // Fix for AIChatBot.tsx: Property 'speak' does not exist
    async speak(text: string): Promise<Uint8Array | null> {
        storageService.trackUsage('flash');
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                return decode(base64Audio);
            }
            return null;
        } catch (error) { return null; }
    },

    // Fix for RequestWizard.tsx: Property 'parseJobSpec' does not exist
    async parseJobSpec(base64File: string): Promise<any> {
        storageService.trackUsage('flash');
        try {
            const cleanBase64 = base64File.split(',')[1] || base64File;
            const prompt = `Extract job specification data (title, department, description, requirements, skills) from document. JSON.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-lite-latest',
                contents: {
                    parts: [{ inlineData: { mimeType: 'application/pdf', data: cleanBase64 } }, { text: prompt }]
                },
                config: { responseMimeType: 'application/json' }
            });
            return JSON.parse(response.text || "{}");
        } catch (error) { return {}; }
    },

    // Fix for RequestWizard.tsx: Property 'parseJobSpecFromText' does not exist
    async parseJobSpecFromText(text: string): Promise<any> {
        storageService.trackUsage('flash');
        try {
            const prompt = `Extract skills array from the following job text: ${text}. JSON output { "skills": [] }.`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { 
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            skills: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });
            return JSON.parse(response.text || "{\"skills\": []}");
        } catch (error) { return { skills: [] }; }
    },

    // Fix for RequestDetail.tsx: Property 'getMarketAnalysis' does not exist
    async getMarketAnalysis(title: string, location: string): Promise<{ text: string, sources?: any[] }> {
        storageService.trackUsage('flash');
        try {
            const prompt = `Analyze the market for ${title} in ${location}. Include salary bands, competitor activity, and talent availability.`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { tools: [{ googleSearch: {} }] }
            });
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const sources = groundingChunks.filter((c: any) => c.web?.uri).map((c: any) => ({ uri: c.web.uri, title: c.web.title }));
            return { text: response.text || "No results.", sources };
        } catch (error) { throw error; }
    },

    // Fix for AIToolkit.tsx: Property 'generateJobDescription' does not exist
    async generateJobDescription(title: string, keywords: string): Promise<string> {
        storageService.trackUsage('flash');
        try {
            const prompt = `Write a professional job description for ${title} with focus on: ${keywords}.`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            return response.text || "";
        } catch (error) { return ""; }
    },

    // Fix for AIToolkit.tsx: Property 'suggestCandidates' does not exist
    async suggestCandidates(jd: string, candidates: any[]): Promise<any[]> {
        storageService.trackUsage('flash');
        try {
            const prompt = `Match candidates for this JD: ${jd}. Candidates: ${JSON.stringify(candidates.map(c => ({name: c.name, skills: c.skills, experience: c.experience})))}. Return JSON array of { "name": string, "reason": string, "matchScore": number } for top 3 matches.`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                reason: { type: Type.STRING },
                                matchScore: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            });
            return JSON.parse(response.text || "[]");
        } catch (error) { return []; }
    },

    // Fix for TalentPool.tsx: Property 'findTalentMatches' does not exist
    async findTalentMatches(talent: any[], description: string): Promise<any[]> {
        storageService.trackUsage('flash');
        try {
            const prompt = `Find top matches from this talent pool for JD: ${description}. Pool: ${JSON.stringify(talent.map(t => ({id: t.id, name: t.name, headline: t.headline})))}. Return JSON array of { "id": string, "score": number, "reason": string }.`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                score: { type: Type.NUMBER },
                                reason: { type: Type.STRING }
                            }
                        }
                    }
                }
            });
            return JSON.parse(response.text || "[]");
        } catch (error) { return []; }
    },

    // Fix for TalentPool.tsx: Property 'generateOutreach' does not exist
    async generateOutreach(name: string, role: string, company: string): Promise<string> {
        storageService.trackUsage('flash');
        try {
            const prompt = `Write a personalized LinkedIn outreach message for ${name} regarding a ${role} position at ${company}. Keep it professional and concise.`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            return response.text || "";
        } catch (error) { return ""; }
    }
};
