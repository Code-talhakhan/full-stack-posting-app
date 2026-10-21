import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

router.post("/chat", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).send({ message: "Prompt is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY missing in .env!");
            return res.status(500).send({ message: "API Key missing" });
        }

        const ai = new GoogleGenAI({ apiKey });

        
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are Bayan AI, an intelligent assistant inside the Bayan social media platform. Help users write posts and answer queries concisely."
            }
        });

        return res.send({
            message: "Success",
            reply: response.text
        });
    } catch (error) {
        console.error("BAYAN_AGENT_ERROR:", error);
        return res.status(500).send({ 
            message: "Error generating response",
            error: error.message 
        });
    }
});

export default router;