
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
    // 1. Basic Text Generation (Flash)
    async chat(message: string, history: string[] = []): Promise<string> {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: message, 
                config: {
                    systemInstruction: "You are a helpful recruitment assistant."
                }
            });
            return response.text || "I couldn't generate a response.";
        } catch (error) {
            console.error("Gemini Chat Error:", error);
            return "Sorry, I encountered an error processing your request.";
        }
    },

    async fastChat(message: string): Promise<string> {
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
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: message
            });
            return response.text || "No response.";
        } catch (error) { return "Error."; }
    },

    async search(query: string): Promise<{ text: string, sources?: any[] }> {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: query,
                config: { tools: [{ googleSearch: {} }] }
            });
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const sources = groundingChunks.filter((c: any) => c.web?.uri).map((c: any) => ({ uri: c.web.uri, title: c.web.title }));
            return { text: response.text || "No results.", sources };
        } catch (error) { throw error; }
    },

    async getMarketAnalysis(role: string, location: string): Promise<{ text: string, sources?: any[] }> {
        try {
            const prompt = `Market analysis for "${role}" in "${location}". Salary, skills, competitors, trends.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { tools: [{ googleSearch: {} }] }
            });
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const sources = groundingChunks.filter((c: any) => c.web?.uri).map((c: any) => ({ uri: c.web.uri, title: c.web.title }));
            return { text: response.text || "No data.", sources };
        } catch (error) { throw error; }
    },

    async mapQuery(query: string): Promise<{ text: string, sources?: any[] }> {
         try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: query,
                config: { tools: [{ googleMaps: {} }] }
            });
            return { text: response.text || "No location data." };
        } catch (error) { throw error; }
    },

    async deepThink(query: string): Promise<string> {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: query,
                config: { thinkingConfig: { thinkingBudget: 32768 } }
            });
            return response.text || "Thinking failed.";
        } catch (error) { throw error; }
    },

    async editImage(base64Image: string, prompt: string): Promise<string> {
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
            return `${videoUri}&key=${process.env.API_KEY}`; 
        } catch (error) { throw error; }
    },

    async screenCandidate(candidateData: any, jobDescription: string): Promise<{ score: number, analysis: string, strengths: string[], weaknesses: string[] }> {
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
        } catch (error) { return { score: 0, analysis: "Error during screening", strengths: [], weaknesses: [] }; }
    },

    async parseResume(base64File: string): Promise<{ name?: string, email?: string, phone?: string, skills?: string[], experience?: string, currentRole?: string, currentCompany?: string, noticePeriod?: string, isRE5Certified?: boolean }> {
        try {
            const cleanBase64 = base64File.split(',')[1] || base64File;
            const prompt = `Extract: Name, Email, Phone, Skills[], Experience, Current Role, Current Company, Notice Period, isRE5Certified (bool) from resume. JSON.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [{ inlineData: { mimeType: 'application/pdf', data: cleanBase64 } }, { text: prompt }]
                },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            email: { type: Type.STRING },
                            phone: { type: Type.STRING },
                            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                            experience: { type: Type.STRING },
                            currentRole: { type: Type.STRING },
                            currentCompany: { type: Type.STRING },
                            noticePeriod: { type: Type.STRING },
                            isRE5Certified: { type: Type.BOOLEAN }
                        }
                    }
                }
            });
            return JSON.parse(response.text || "{}");
        } catch (error) { return {}; }
    },

    async parseJobSpec(base64File: string): Promise<{ title?: string, description?: string, requirements?: string, skills?: string[], department?: string, location?: string }> {
        try {
            const cleanBase64 = base64File.split(',')[1] || base64File;
            const prompt = `Extract the following Job Request details from this document:
            - Job Title
            - Department (Finance, IT, Operations, or HR)
            - Location
            - Full Description (formatted text)
            - Key Requirements (formatted text list)
            - Top 5 Skills (array)
            
            Return JSON only.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'application/pdf',
                                data: cleanBase64
                            }
                        },
                        {
                            text: prompt
                        }
                    ]
                },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            department: { type: Type.STRING },
                            location: { type: Type.STRING },
                            description: { type: Type.STRING },
                            requirements: { type: Type.STRING },
                            skills: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });

            return JSON.parse(response.text || "{}");
        } catch (error) {
            console.error("Gemini Job Spec Parsing Error:", error);
            return {};
        }
    },

    async parseJobSpecFromText(text: string): Promise<{ title?: string, skills?: string[], department?: string }> {
        try {
            const prompt = `Extract structured data from the following job description text. 
            Focus on:
            - Suggested Job Title
            - Top 8 Technical and Soft Skills (as a list)
            - Targeted Department (Finance, IT, Operations, or HR)
            
            Text: "${text}"
            
            Return JSON only.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                            department: { type: Type.STRING }
                        }
                    }
                }
            });

            return JSON.parse(response.text || "{}");
        } catch (error) {
            console.error("Gemini Job Text Parsing Error:", error);
            return {};
        }
    },

    async extractSkillsFromText(text: string): Promise<string[]> {
        try {
            const prompt = `Extract a list of the top 5-8 most important technical and soft skills from the following job description: "${text}". Return as a JSON array of strings called "skills".`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
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
            const data = JSON.parse(response.text || "{}");
            return data.skills || [];
        } catch (error) { return []; }
    },

    async findTalentMatches(talentPool: any[], jobDescription: string): Promise<any[]> {
        try {
            const prompt = `Match talent to JD: ${jobDescription}. Pool: ${JSON.stringify(talentPool)}. JSON array of {id, score, reason}.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                score: { type: Type.INTEGER },
                                reason: { type: Type.STRING }
                            }
                        }
                    }
                }
            });
            return JSON.parse(response.text || "[]");
        } catch (error) { return []; }
    },

    async generateOutreach(talentName: string, roleTitle: string, companyName: string): Promise<string> {
        try {
            const prompt = `Write LinkedIn DM to ${talentName} for ${roleTitle} at ${companyName}. Short, professional.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });
            return response.text || "Hi.";
        } catch (error) { return "Error."; }
    },

    async transcribeAudio(base64Audio: string): Promise<string> {
        try {
            const cleanBase64 = base64Audio.split(',')[1] || base64Audio;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [{ inlineData: { mimeType: 'audio/webm', data: cleanBase64 } }, { text: "Transcribe." }]
                }
            });
            return response.text || "Error.";
        } catch (error) { return "Error."; }
    },

    async speak(text: string): Promise<ArrayBuffer | null> {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: { parts: [{ text: text }] },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                },
            });
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const binaryString = atob(base64Audio);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
                return bytes.buffer;
            }
            return null;
        } catch (error) { return null; }
    }
};
