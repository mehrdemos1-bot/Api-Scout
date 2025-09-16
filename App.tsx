
import React, { useState, useCallback, useRef } from 'react';
import { MapComponent, MapComponentApi } from './components/Map';
import { HiveList } from './components/HiveList';
import { Header } from './components/Header';
import { Instructions } from './components/Instructions';
import { AddressSearch } from './components/AddressSearch';
import { RadiusSelector } from './components/RadiusSelector';
import { AnalysisModal } from './components/AnalysisModal';
import { analyzeForagePotential } from './api/gemini';
import type { Hive } from './types';
import { DEFAULT_FLIGHT_RADIUS_METERS } from './constants';

const App: React.FC = () => {
    const [hives, setHives] = useState<Hive[]>([]);
    const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    const [currentRadius, setCurrentRadius] = useState<number>(DEFAULT_FLIGHT_RADIUS_METERS);
    
    // State for AI analysis
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [analyzedHive, setAnalyzedHive] = useState<Hive | null>(null);

    const mapApiRef = useRef<MapComponentApi>(null);


    const handleAddHive = useCallback((lat: number, lng: number) => {
        const newHive: Hive = {
            id: crypto.randomUUID(),
            lat,
            lng,
            radius: currentRadius,
        };
        setHives(prevHives => [...prevHives, newHive]);
        setSelectedHive(newHive);
    }, [currentRadius]);

    const handleDeleteHive = useCallback((id: string) => {
        setHives(prevHives => prevHives.filter(hive => hive.id !== id));
        if (selectedHive?.id === id) {
            setSelectedHive(null);
        }
    }, [selectedHive]);

    const handleSelectHive = useCallback((hive: Hive | null) => {
        setSelectedHive(hive);
        if (hive) {
            setMapCenter(null); // Hive selection takes precedence over search
        }
    }, []);

    const handleSearchResultClick = useCallback((lat: number, lng: number) => {
        setMapCenter([lat, lng]);
        setSelectedHive(null); // Deselect hive when searching
    }, []);

    const handleUpdateHiveRadius = useCallback((hiveId: string, newRadius: number) => {
        setHives(prevHives => 
            prevHives.map(hive => 
                hive.id === hiveId ? { ...hive, radius: newRadius } : hive
            )
        );
        // Also update the selected hive object if it's the one being changed
        if (selectedHive?.id === hiveId) {
            setSelectedHive(prevSelected => prevSelected ? { ...prevSelected, radius: newRadius } : null);
        }
    }, [selectedHive]);

    const handleAnalyzeHive = useCallback(async (hiveId: string) => {
        const hiveToAnalyze = hives.find(h => h.id === hiveId);
        if (!hiveToAnalyze || !mapApiRef.current) {
            setAnalysisError("Karten-Komponente nicht bereit. Analyse kann nicht gestartet werden.");
            setIsModalOpen(true);
            return;
        }

        // Select the hive to center the map on it
        setSelectedHive(hiveToAnalyze);
        setMapCenter(null);
        
        setAnalyzedHive(hiveToAnalyze);
        setIsAnalyzing(true);
        setAnalysisResult(null);
        setAnalysisError(null);
        setIsModalOpen(true);

        try {
            const imageData = await mapApiRef.current.captureHiveArea(hiveId);
            const result = await analyzeForagePotential(imageData, hiveToAnalyze.lat, hiveToAnalyze.lng);
            setAnalysisResult(result);
        } catch (error) {
            console.error("Analysis failed:", error);
            const errorMessage = error instanceof Error ? error.message : "Die Analyse ist fehlgeschlagen. Bitte versuchen Sie es später erneut.";
            setAnalysisError(errorMessage);
        } finally {
            setIsAnalyzing(false);
        }
    }, [hives]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        // We don't reset the content immediately, so it doesn't vanish during the closing animation
    }, []);


    return (
        <div className="flex flex-col h-screen font-sans">
            <Header />
            <div className="flex flex-col md:flex-row flex-1 min-h-0">
                <aside className="relative w-full md:w-1/3 lg:w-1/4 xl:w-1/5 md:flex-shrink-0 bg-white shadow-lg p-2 md:p-4 overflow-y-auto flex flex-col h-2/5 md:h-auto mobile-scroll-fade">
                    <AddressSearch onSearchResultClick={handleSearchResultClick} />
                    <Instructions />
                    <RadiusSelector 
                        selectedRadius={currentRadius}
                        onRadiusChange={setCurrentRadius}
                    />
                    <HiveList 
                        hives={hives} 
                        selectedHive={selectedHive}
                        onSelectHive={handleSelectHive}
                        onDeleteHive={handleDeleteHive}
                        onUpdateHiveRadius={handleUpdateHiveRadius}
                        onAnalyzeHive={handleAnalyzeHive}
                        isAnalyzing={isAnalyzing}
                    />
                </aside>
                <main className="flex-grow h-3/5 md:h-auto">
                    <MapComponent 
                        ref={mapApiRef}
                        hives={hives}
                        onAddHive={handleAddHive}
                        selectedHive={selectedHive}
                        onSelectHive={handleSelectHive}
                        searchResultCenter={mapCenter}
                    />
                </main>
            </div>
            <AnalysisModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                isLoading={isAnalyzing}
                analysisResult={analysisResult}
                error={analysisError}
                analyzedHive={analyzedHive}
            />
        </div>
    );
};

export default App;