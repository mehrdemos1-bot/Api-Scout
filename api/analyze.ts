
import { GoogleGenAI } from "@google/genai";

// This file is a Vercel Serverless Function.
// It acts as a secure proxy to the Google Gemini API.
// The frontend calls this endpoint, and this function adds the secret API key
// before forwarding the request to Google.

// Vercel automatically creates a Request object from the incoming HTTP request.
export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Parse the JSON body from the frontend request
        const { base64ImageData, lat, lng } = await request.json();

        if (!base64ImageData || typeof lat !== 'number' || typeof lng !== 'number') {
            return new Response(JSON.stringify({ error: 'Fehlende oder ungültige Parameter: base64ImageData, lat und lng sind erforderlich.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        // Initialize the AI client using the API_KEY from Vercel's environment variables
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        // The logic here is the same as it was on the client-side before.
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64ImageData,
            },
        };

        const textPart = {
            text: `
Analysiere das Satellitenbild im Flugradius eines Bienenstocks an den Koordinaten: Breitengrad ${lat}, Längengrad ${lng}.

Gib eine kurze, stichpunktartige Zusammenfassung im Markdown-Format.

**Futterquellen:**
* Identifiziere Hauptvegetationstypen (z.B. Wald, Felder, Siedlungen).
* Nenne basierend auf der Region typische Trachtpflanzen und ihren Nutzen (Nektar/Pollen/Honigtau).

**Risiken:**
* Identifiziere mögliche Nachteile (z.B. Monokulturen, Industrie, Wasserflächen).

**Fazit:**
* Fasse die Eignung des Standorts kurz zusammen.
* Bewerte das Trachtpotenzial auf einer Skala von 1 (sehr schlecht) bis 10 (ausgezeichnet). Beispiel: **Bewertung:** 8/10
`,
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, imagePart] },
        });

        // Send the successful analysis back to the frontend
        return new Response(JSON.stringify({ analysis: response.text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error in serverless function (api/analyze):", error);
        const errorMessage = error instanceof Error ? error.message : "Unbekannter Serverfehler";
        // Send a detailed error message back to the frontend
        return new Response(JSON.stringify({ error: `Fehler bei der KI-Analyse: ${errorMessage}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}