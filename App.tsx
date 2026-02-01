
import React, { useState, useCallback, useRef } from 'react';
import { MapComponent, MapComponentApi } from './components/Map';
import { HiveList } from './components/HiveList';
import { Header } from './components/Header';
import { Instructions } from './components/Instructions';
import { AddressSearch } from './components/AddressSearch';
import { AnalysisModal } from './components/AnalysisModal';
import { analyzeForagePotential } from './services/geminiService';
import type { Hive } from './types';
import { DEFAULT_FLIGHT_RADIUS_METERS } from './constants';

const App: React.FC = () => {
    const [hives, setHives] = useState<Hive[]>([]);
    const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    
    // State for AI analysis
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [analyzedHive, setAnalyzedHive] = useState<Hive | null>(null);

    const mapApiRef = useRef<MapComponentApi>(null);
    const analysisAbortController = useRef<AbortController | null>(null);


    const handleAddHive = useCallback((lat: number, lng: number) => {
        if (hives.length >= 3) {
            return;
        }
        const newHive: Hive = {
            id: crypto.randomUUID(),
            lat,
            lng,
            radius: DEFAULT_FLIGHT_RADIUS_METERS,
        };
        setHives(prevHives => [...prevHives, newHive]);
        setSelectedHive(newHive);
    }, [hives]);

    const handleDeleteHive = useCallback((id: string) => {
        setHives(prevHives => prevHives.filter(hive => hive.id !== id));
        if (selectedHive?.id === id) {
            setSelectedHive(null);
        }
    }, [selectedHive]);

    const handleSelectHive = useCallback((hive: Hive | null) => {
        setSelectedHive(hive);
        if (hive) {
            setMapCenter(null);
        }
    }, []);

    const handleSearchResultClick = useCallback((lat: number, lng: number) => {
        setMapCenter([lat, lng]);
        setSelectedHive(null);
    }, []);

    const handleUpdateHiveRadius = useCallback((hiveId: string, newRadius: number) => {
        setHives(prevHives => 
            prevHives.map(hive => 
                hive.id === hiveId ? { ...hive, radius: newRadius } : hive
            )
        );
        if (selectedHive?.id === hiveId) {
            setSelectedHive(prevSelected => prevSelected ? { ...prevSelected, radius: newRadius } : null);
        }
    }, [selectedHive]);

    const handleAnalyzeHive = useCallback(async (hiveId: string) => {
        const hiveToAnalyze = hives.find(h => h.id === hiveId);
        if (!hiveToAnalyze || !mapApiRef.current) {
            setAnalysisError("Karten-Komponente nicht bereit.");
            setIsModalOpen(true);
            return;
        }

        analysisAbortController.current?.abort();
        const controller = new AbortController();
        analysisAbortController.current = controller;

        setSelectedHive(hiveToAnalyze);
        setAnalyzedHive(hiveToAnalyze);
        setIsAnalyzing(true);
        setAnalysisResult(null);
        setAnalysisError(null);
        setIsModalOpen(true);

        try {
            const imageData = await mapApiRef.current.captureHiveArea(hiveId);
            const result = await analyzeForagePotential(
                imageData, 
                hiveToAnalyze.lat, 
                hiveToAnalyze.lng, 
                hiveToAnalyze.radius
            );
            
            if (!controller.signal.aborted) {
                setAnalysisResult(result);
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                setAnalysisError(error.message);
            }
        } finally {
            if (analysisAbortController.current === controller) {
                setIsAnalyzing(false);
            }
        }
    }, [hives]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        analysisAbortController.current?.abort();
    }, []);


    return (
        <div className="flex flex-col h-screen font-sans bg-gray-50 text-gray-900">
            <Header />
            
            <div className="flex flex-col md:flex-row flex-1 min-h-0 relative">
                <aside className="relative w-full md:w-1/3 lg:w-1/4 xl:w-1/5 md:flex-shrink-0 bg-white shadow-lg p-3 md:p-4 overflow-y-auto flex flex-col h-[40vh] md:h-auto mobile-scroll-fade z-20 border-r border-gray-200">
                    <Instructions />
                    <HiveList 
                        hives={hives} 
                        selectedHive={selectedHive}
                        onSelectHive={handleSelectHive}
                        onDeleteHive={handleDeleteHive}
                        onUpdateHiveRadius={handleUpdateHiveRadius}
                        onAnalyzeHive={handleAnalyzeHive}
                        isAnalyzing={isAnalyzing}
                    />

                    {/* Brand Footer in Sidebar */}
                    <div className="mt-auto pt-8 pb-4 flex flex-col items-center border-t border-gray-100">
                        <img 
                            src="logo.png" 
                            alt="Blütenpiraten" 
                            className="w-20 h-20 object-contain mb-3 opacity-80 hover:opacity-100 transition-opacity"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        <a 
                            href="https://blütenpiraten.de" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-yellow-600 hover:text-yellow-700 font-bold text-sm transition-colors flex items-center space-x-1 group"
                        >
                            <span>www.blütenpiraten.de</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </a>
                        <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">
                            Homepage & Blog
                        </p>
                    </div>
                </aside>
                
                <main className="flex-grow flex flex-col h-[60vh] md:h-auto relative z-10">
                    <div className="p-3 bg-white border-b border-gray-200 relative z-[1001]">
                        <div className="max-w-xl">
                            <AddressSearch onSearchResultClick={handleSearchResultClick} />
                        </div>
                    </div>

                    <div className="flex-grow relative overflow-hidden z-0">
                        <MapComponent 
                            ref={mapApiRef}
                            hives={hives}
                            onAddHive={handleAddHive}
                            selectedHive={selectedHive}
                            onSelectHive={handleSelectHive}
                            searchResultCenter={mapCenter}
                        />
                    </div>
                </main>
            </div>

            <footer className="bg-white border-t py-2 px-4 flex justify-between items-center text-[10px] text-gray-400 z-30">
                <div>&copy; {new Date().getFullYear()} Api-Scout - Smart Beekeeping</div>
                <div className="space-x-4">
                    <a href="https://blütenpiraten.de/impressum/" className="hover:text-yellow-600">Impressum</a>
                    <a href="https://blütenpiraten.de/datenschutz" className="hover:text-yellow-600">Datenschutz</a>
                </div>
            </footer>

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
