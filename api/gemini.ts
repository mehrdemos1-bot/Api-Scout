
// This function now calls our own backend API endpoint on Vercel,
// which will then securely call the Google GenAI API.
// This is necessary because API keys cannot be safely exposed in the browser.

export async function analyzeForagePotential(base64ImageData: string, lat: number, lng: number): Promise<string> {
    const API_TIMEOUT = 90000; // 90 seconds

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ base64ImageData, lat, lng }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            // Try to parse error from our backend function
            const errorData = await response.json().catch(() => ({ error: 'Unbekannter Serverfehler. Die Antwort des Servers konnte nicht verarbeitet werden.' }));
            throw new Error(errorData.error || `Anfrage fehlgeschlagen mit Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        return data.analysis;

    } catch (error) {
        clearTimeout(timeoutId);
        console.error("Error calling analysis API:", error);
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error("Die Analyse hat zu lange gedauert und wurde abgebrochen. Bitte versuchen Sie es erneut.");
            }
            throw new Error(`${error.message}`);
        }
        throw new Error("Die Kommunikation mit dem Server ist fehlgeschlagen.");
    }
}