
import React from 'react';
import type { Hive } from '../types';
import { TRASH_ICON_SVG, FLIGHT_RADIUS_OPTIONS } from '../constants';

const AnalysisIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M10 3.5a.75.75 0 0 1 .75.75v.756a4.5 4.5 0 1 1 0 8.488V15.5a.75.75 0 0 1-1.5 0v-2.006a4.5 4.5 0 0 1 0-8.488V4.25a.75.75 0 0 1 .75-.75Z" />
    </svg>
);

interface HiveListProps {
    hives: Hive[];
    selectedHive: Hive | null;
    onSelectHive: (hive: Hive) => void;
    onDeleteHive: (id: string) => void;
    onUpdateHiveRadius: (id: string, radius: number) => void;
    onAnalyzeHive: (id: string) => void;
    isAnalyzing: boolean;
}

export const HiveList: React.FC<HiveListProps> = ({ hives, selectedHive, onSelectHive, onDeleteHive, onUpdateHiveRadius, onAnalyzeHive, isAnalyzing }) => {
    
    if (hives.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <p className="text-gray-500 italic">Noch keine Bienenstöcke hinzugefügt.</p>
                <p className="text-xs text-gray-400 mt-2">Klicke auf die Karte, um zu starten.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-3 mt-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 flex justify-between items-center">
                <span>Deine Bienenstöcke</span>
                <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${hives.length >= 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                    {hives.length}/3
                </span>
            </h2>

            {hives.length >= 3 && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700 mb-2">
                    <strong>Limit erreicht:</strong> Du kannst maximal 3 Standorte gleichzeitig planen.
                </div>
            )}

            <ul className="space-y-2">
                {hives.map((hive, index) => {
                    const isSelected = selectedHive?.id === hive.id;
                    return (
                        <li
                            key={hive.id}
                            onClick={() => onSelectHive(hive)}
                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out ${
                                isSelected 
                                ? 'bg-yellow-200 ring-2 ring-yellow-500 shadow-md' 
                                : 'bg-gray-100 hover:bg-yellow-100'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-gray-800">Bienenstock #{index + 1}</span>
                                    <p className="text-xs text-gray-600">
                                        Lat: {hive.lat.toFixed(4)}, Lng: {hive.lng.toFixed(4)}
                                    </p>
                                    <p className="text-xs text-gray-600 font-medium">
                                        Radius: {hive.radius / 1000} km
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent li's onClick from firing
                                        onDeleteHive(hive.id);
                                    }}
                                    className="p-2 rounded-full text-gray-500 hover:bg-red-200 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex-shrink-0"
                                    aria-label={`Bienenstock #${index + 1} löschen`}
                                >
                                    {TRASH_ICON_SVG}
                                </button>
                            </div>
                            {isSelected && (
                                <div className="mt-3 pt-3 border-t border-yellow-300 space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Radius anpassen:</h4>
                                        <div className="flex justify-around items-center">
                                            {FLIGHT_RADIUS_OPTIONS.map(radius => (
                                                <label key={radius} className="flex items-center space-x-2 cursor-pointer text-gray-700 text-sm">
                                                    <input
                                                        type="radio"
                                                        name={`radius-${hive.id}`}
                                                        value={radius}
                                                        checked={hive.radius === radius}
                                                        onChange={() => onUpdateHiveRadius(hive.id, radius)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="h-4 w-4 text-yellow-500 border-gray-300 focus:ring-yellow-400"
                                                    />
                                                    <span>{radius / 1000} km</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                     <div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAnalyzeHive(hive.id);
                                            }}
                                            disabled={isAnalyzing}
                                            className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Analysiere...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AnalysisIcon />
                                                    <span>Trachtpotential analysieren</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
