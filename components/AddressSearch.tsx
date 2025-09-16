
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
                setError('Keine Ergebnisse für diese Adresse gefunden.');
            } else {
                setResults(data);
            }
        } catch (err) {
            setError('Fehler bei der Adresssuche. Bitte versuchen Sie es später erneut.');
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
        <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-3">Adresse suchen</h2>
            <form onSubmit={handleSearch} className="flex space-x-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Straße, Stadt eingeben..."
                    className="flex-grow border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    aria-label="Adresse suchen"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-yellow-400 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                    aria-label="Suchen"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Suchen'}
                </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {results.length > 0 && (
                <ul className="mt-2 border border-gray-200 rounded-md bg-white max-h-60 overflow-y-auto">
                    {results.map(result => (
                        <li key={result.place_id}>
                            <button
                                onClick={() => handleResultClick(result)}
                                className="w-full text-left p-2 text-sm text-gray-700 hover:bg-yellow-100 focus:outline-none focus:bg-yellow-100"
                            >
                                {result.display_name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
