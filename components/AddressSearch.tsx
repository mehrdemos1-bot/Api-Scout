
import React, { useState, useCallback } from 'react';
import type { SearchResult } from '../types';

interface AddressSearchProps {
    onSearchResultClick: (lat: number, lng: number) => void;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({ onSearchResultClick }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setResults([]);

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data: SearchResult[] = await response.json();
            if (data.length === 0) {
                setError('Keine Ergebnisse gefunden.');
            } else {
                setResults(data);
            }
        } catch (err) {
            setError('Fehler bei der Adresssuche.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [query]);

    const handleResultClick = (result: SearchResult) => {
        onSearchResultClick(parseFloat(result.lat), parseFloat(result.lon));
        setResults([]); // Clear results after selection
        setQuery(''); // Clear query after selection
    };

    return (
        <div className="relative group">
            <form onSubmit={handleSearch} className="flex space-x-0 rounded-md overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-transparent transition-all">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ort oder Adresse suchen..."
                    className="flex-grow border-none bg-white p-2.5 text-sm focus:ring-0 focus:outline-none"
                    aria-label="Adresse suchen"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-yellow-400 text-gray-800 font-bold px-4 hover:bg-yellow-500 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-colors border-l border-gray-200"
                    aria-label="Suchen"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </button>
            </form>
            
            {(error || results.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-xl border border-gray-200 max-h-64 overflow-y-auto z-[2000]">
                    {error && <p className="text-red-500 text-sm p-3">{error}</p>}
                    {results.length > 0 && (
                        <ul className="divide-y divide-gray-100">
                            {results.map(result => (
                                <li key={result.place_id}>
                                    <button
                                        onClick={() => handleResultClick(result)}
                                        className="w-full text-left p-2.5 text-sm text-gray-700 hover:bg-yellow-50 transition-colors"
                                    >
                                        <div className="flex items-start">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="truncate">{result.display_name}</span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};
