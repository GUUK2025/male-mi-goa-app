/**
 * Vercel Serverless Function to act as a secure proxy for the Gemini API.
 * This function receives a prompt from the frontend, calls the Gemini API
 * using a securely stored API key (from Vercel environment variables),
 * and returns the generated text.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// IMPORTANT: Your Gemini API key should be stored securely as a Vercel Environment Variable.
// DO NOT hardcode your API key here.
// In Vercel Project Settings -> Environment Variables, add:
// Name: GEMINI_API_KEY
// Value: YOUR_GEMINI_API_KEY_HERE
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    // In a production environment, you might want a more robust error handling
    // or a fallback, but for development, a console error is fine.
    console.error("Gemini API key is not set. Please configure it as a Vercel Environment Variable named GEMINI_API_KEY.");
    // For local testing, you might temporarily set process.env.GEMINI_API_KEY = "YOUR_KEY";
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Using gemini-pro for text generation

// This is the main handler for the Vercel Serverless Function.
// It will be accessible at /api/gemini
module.exports = async (req, res) => {
    // Vercel serverless functions typically handle POST requests for data submission
    if (req.method !== 'POST') {
        res.status(405).json({ success: false, error: 'Method Not Allowed. Only POST requests are supported.' });
        return;
    }

    const { prompt } = req.body;

    if (!prompt) {
        res.status(400).json({ success: false, error: 'Missing "prompt" in request body.' });
        return;
    }

    try {
        // Call the Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Return the success response
        res.status(200).json({ success: true, text: text });

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Return an error response to the client
        res.status(500).json({ success: false, error: 'Failed to generate AI insight.', details: error.message });
    }
};
