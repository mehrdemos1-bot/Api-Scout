
import React from 'react';
import type { Hive } from '../types';

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    analysisResult: string | null;
    error: string | null;
    analyzedHive: Hive | null;
}

// A more robust parser to convert markdown-like text to JSX with enhanced styling.
const formatAnalysisText = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let currentListItems: React.ReactNode[] = [];

    const flushList = () => {
        if (currentListItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc list-inside pl-2 space-y-2 text-gray-700">
                    {currentListItems}
                </ul>
            );
            currentListItems = [];
        }
    };

    text.split('\n').forEach((line, index) => {
        line = line.trim();

        // Match headings like **Futterquellen:**
        if (line.startsWith('**') && line.endsWith('**') && !line.includes('Bewertung:')) {
            flushList();
            elements.push(
                <h3 key={index} className="text-xl font-semibold text-gray-800 mt-6 mb-3 pb-2 border-b border-gray-200">
                    {line.slice(2, -2)}
                </h3>
            );
        // Match the rating line like **Bewertung:** 8/10
        } else if (line.startsWith('**Bewertung:')) {
            flushList();
            const ratingText = line.replace(/\*+/g, '').replace('Bewertung:', '').trim();
            const [score, max] = ratingText.split('/');
            const numericScore = parseInt(score, 10);
            
            let bgColor = 'bg-gray-100';
            let textColor = 'text-gray-800';
            let label = 'Neutral';

            if (!isNaN(numericScore)) {
                if (numericScore >= 8) {
                    bgColor = 'bg-green-100';
                    textColor = 'text-green-800';
                    label = 'Ausgezeichnet';
                } else if (numericScore >= 5) {
                    bgColor = 'bg-yellow-100';
                    textColor = 'text-yellow-800';
                    label = 'Gut';
                } else {
                    bgColor = 'bg-red-100';
                    textColor = 'text-red-800';
                    label = 'Verbesserungswürdig';
                }
            }


            elements.push(
                <div key={index} className={`mt-6 p-4 rounded-lg ${bgColor}`}>
                    <h4 className={`text-sm font-bold uppercase tracking-wider ${textColor} mb-2`}>Bewertung</h4>
                    <div className="flex items-baseline space-x-2">
                        <span className={`text-4xl font-extrabold ${textColor}`}>{score || '?'}</span>
                        <span className={`text-xl font-semibold text-gray-500`}>/ {max || '10'}</span>
                    </div>
                     <p className={`text-sm font-semibold mt-1 ${textColor}`}>{label}</p>
                </div>
            );
        // Match list items like * ...
        } else if (line.startsWith('* ') || line.startsWith('- ')) {
            currentListItems.push(<li key={index}>{line.slice(2)}</li>);
        // Handle regular text lines
        } else if (line.length > 0) {
            flushList();
            elements.push(<p key={index} className="text-gray-700 mb-3 leading-relaxed">{line}</p>);
        } else {
            // An empty line can also signify the end of a list.
            flushList();
        }
    });

    flushList(); // Add any remaining list items at the end of the text.
    return elements;
};



export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, isLoading, analysisResult, error, analyzedHive }) => {
    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        if (!analysisResult || !analyzedHive) return;

        const blob = new Blob([analysisResult], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const lat = analyzedHive.lat.toFixed(2);
        const lng = analyzedHive.lng.toFixed(2);
        link.download = `Analyse-Bienenstock-${lat}_${lng}.txt`;

        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center p-4 transition-opacity"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="analysis-modal-title"
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 id="analysis-modal-title" className="text-xl font-semibold text-gray-800">
                        KI-basierte Umfeldanalyse
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Analyse schließen"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className="p-6 overflow-y-auto">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center space-y-4 min-h-[200px]">
                            <svg className="animate-spin h-10 w-10 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-600 font-semibold">KI analysiert die Umgebung...</p>
                            <p className="text-sm text-gray-500 mt-2 text-center max-w-sm">
                                Die KI führt eine detaillierte, standortspezifische Analyse durch. 
                                Dies kann bis zu 90 Sekunden dauern. Vielen Dank für Ihre Geduld.
                            </p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">
                            <h3 className="font-bold">Fehler</h3>
                            <p>{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && analysisResult !== null && (
                        analysisResult.trim() ? (
                            <div className="max-w-none">
                                {formatAnalysisText(analysisResult)}
                            </div>
                        ) : (
                            <div className="text-center text-gray-600 bg-gray-100 p-4 rounded-md">
                                <h3 className="font-bold">Analyse abgeschlossen</h3>
                                <p>Die KI hat für diesen Bereich keine spezifischen Futterquellen oder Risiken identifiziert.</p>
                            </div>
                        )
                    )}
                </div>
                <footer className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end items-center space-x-3">
                    {!isLoading && analysisResult && !error && (
                        <button 
                            onClick={handleSave}
                            className="bg-blue-500 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-600 transition-colors"
                            aria-label="Analyse speichern"
                        >
                            Speichern
                        </button>
                    )}
                    <button 
                        onClick={onClose} 
                        className="bg-yellow-400 text-gray-800 font-bold py-2 px-6 rounded-md hover:bg-yellow-500"
                    >
                        Schließen
                    </button>
                </footer>
            </div>
        </div>
    );
};