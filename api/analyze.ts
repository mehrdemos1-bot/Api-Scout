
import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Einfacher In-Memory-Speicher für das Limit.
// Hinweis: In Serverless-Umgebungen wie Vercel ist dies nicht 100% präzise, 
// da Instanzen neu gestartet werden können, dient aber als guter Basisschutz.
let usageCount = 0;
let lastResetDate = new Date().toDateString();
const MAX_DAILY_REQUESTS = 50;

/**
 * Serverless Function für Vercel.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Nur POST-Anfragen erlauben
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Tageslimit-Check
    const today = new Date().toDateString();
    if (today !== lastResetDate) {
        usageCount = 0;
        lastResetDate = today;
    }

    if (usageCount >= MAX_DAILY_REQUESTS) {
        return res.status(429).json({ 
            error: 'Das globale Tageslimit für Analysen wurde bereits überschritten. Die Analyse ist erst morgen wieder möglich.' 
        });
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
1) Visuelle Analyse: Analysiere das bereitgestellte Satellitenbild für den Standort (Koordinaten: ${lat.toFixed(6)}, ${lng.toFixed(6)}) und einen Flugradius von ${radius} Metern. Identifiziere Landnutzungsarten wie Mischwälder, Agrarflächen, Blühstreifen, Hausgärten, Alleen, Wasserquellen oder versiegelte Flächen.
2) Kontextuelle Analyse: Nutze dein tiefes Wissen über die spezifische Region bei diesen Koordinaten (${lat.toFixed(4)}, ${lng.toFixed(4)}). Berücksichtige die dort typische lokale Flora, Blühphasen, Baumarten, landwirtschaftliche Nutzung und klimatische Bedingungen. 

Führe die visuelle Analyse des bereitgestellten Sattelitenbildes mit der kontextuellen Analyse möglichst genau zusammen. Wenn beispielsweise das Sattelitenbild zeigt, dass Straßen signifikant von Bäumen gesäumt sind, dann führe dein Wissen über die vor Ort typische Straßenbeflanzung und deren Trachtpotential zusammen. 

Achte bei deiner Bewertung besonders auf:
- Das 'Trachtfließband': Gibt es eine kontinuierliche Versorgung mit Nektar und Pollen vom frühen Frühjahr bis in den späten Herbst? Wodurch könnten Trachtlücken entstehen?.
- Diversität: Ist das Nahrungsangebot abwechslungsreich genug für eine gesunde Entwicklung des Bienenvolkes?
- Risiken: Gibt es Anzeichen für intensive Monokulturen oder potenzielle Pestizidbelastungen in der Nähe?

Gib deine Antwort AUSSCHLIESSLICH in diesem Markdown-Format aus:

**Futterquellen:**
* [Liste von 4-10 Hauptfutterquellen, basierend auf Bild und Region]

**Risiken:**
* [Liste von 1-4 Hauptrisiken für die Bienen an diesem Standort]



**Wichtiger Hinweis:**
Diese KI-gestütze Analyse dient der groben Orientierung und kann Fehler enthalten. Sie ersetzt keine Begutachtung vor Ort.
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

        // Nur bei erfolgreicher Analyse den Zähler erhöhen
        usageCount++;

        return res.status(200).json({ text: response.text });

    } catch (error: any) {
        console.error("Server-Fehler:", error);
        return res.status(500).json({ error: error.message || 'Interner Server-Fehler' });
    }
}
