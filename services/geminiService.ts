
/**
 * Frontend-Service für die Trachtanalyse.
 * Ruft nun nicht mehr die Google API direkt auf (Sicherheitsrisiko),
 * sondern nutzt unseren eigenen Backend-Proxy unter /api/analyze.
 */
export async function analyzeForagePotential(
    base64ImageData: string, 
    lat: number, 
    lng: number, 
    radius: number
): Promise<string> {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: base64ImageData,
                lat,
                lng,
                radius
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server-Fehler: ${response.status}`);
        }

        const data = await response.json();
        return data.text;

    } catch (error: any) {
        console.error("Fehler bei der Kommunikation mit dem Analyse-Server:", error);
        throw new Error(error.message || "Die Verbindung zum Analyse-Dienst konnte nicht hergestellt werden.");
    }
}
