
import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Serverless Function für Vercel.
 * Diese Funktion läuft auf dem Server, daher ist der API_KEY hier sicher.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Nur POST-Anfragen erlauben
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image, lat, lng, radius } = req.body;
        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API-Key auf dem Server nicht konfiguriert.' });
        }

        if (!image) {
            return res.status(400).json({ error: 'Keine Bilddaten empfangen.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const detailedPrompt = `
Du bist ein weltweit führender Experte für Apidologie (Bienenkunde), Botanik und Landschaftsökologie. Deine Aufgabe ist es, einen potenziellen Bienenstandort umfassend zu bewerten.

Hierfür führst du zwei Analyse-Ebenen zusammen:
1) Visuelle Analyse: Analysiere das bereitgestellte Satellitenbild für den Standort (Koordinaten: ${lat}, ${lng}) und einen Flugradius von ${radius} Metern.
2) Kontextuelle Analyse: Nutze dein Wissen über die Flora bei diesen Koordinaten.

Gib deine Antwort AUSSCHLIESSLICH in diesem Markdown-Format aus:

**Futterquellen:**
* [Liste]

**Risiken:**
* [Liste]

**Zusammenfassung:**
[Text]

**Bewertung:** [Zahl]/10
        `.trim();

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: image } },
                    { text: detailedPrompt }
                ]
            },
            config: {
                temperature: 0.1,
            }
        });

        return res.status(200).json({ text: response.text });

    } catch (error: any) {
        console.error("Server-Fehler:", error);
        return res.status(500).json({ error: error.message || 'Interner Server-Fehler' });
    }
}
