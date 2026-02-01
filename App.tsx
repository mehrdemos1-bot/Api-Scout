
import React, { useState, useCallback, useRef } from 'react';
import { MapComponent, MapComponentApi } from './components/Map';
import { HiveList } from './components/HiveList';
import { Header } from './components/Header';
import { Instructions } from './components/Instructions';
import { AddressSearch } from './components/AddressSearch';
import { AnalysisModal } from './components/AnalysisModal';
import { analyzeForagePotential } from './services/geminiService';
import type { Hive } from './types';
import { DEFAULT_FLIGHT_RADIUS_METERS, BRAND_LOGO_SRC } from './constants';

const App: React.FC = () => {
    const [hives, setHives] = useState<Hive[]>([]);
    const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    
    // Sidebar logo loading state
    const [sidebarLogoLoaded, setSidebarLogoLoaded] = useState(false);

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

                    {/* Fixed Brand Footer in Sidebar */}
                    <div className="mt-auto pt-8 pb-4 flex flex-col items-center border-t border-gray-100">
                        <div className="relative w-20 h-20 mb-3 flex items-center justify-center overflow-hidden">
                            {/* Fallback-Hintergrund */}
                            <div className="absolute inset-0 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600 border border-yellow-200 z-0">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                                    <path fillRule="evenodd" d="M15.97 3.97a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22-2.16-2.16a.75.75 0 0 1 0-1.06Zm-4.94 0a.75.75 0 0 1 0 1.06L8.84 7.22l-3.22-3.22a.75.75 0 0 1 1.06-1.06l3 3ZM12 5.25a.75.75 0 0 1 .75.75v3.68l1.43-1.43a.75.75 0 1 1 1.06 1.06l-2.75 2.75a.75.75 0 0 1-1.06 0L8.7 9.31a.75.75 0 1 1 1.06-1.06l1.44 1.44V6a.75.75 0 0 1 .75-.75Zm-3.75 9a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm-2.25 3a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <img 
                                src={BRAND_LOGO_SRC} 
                                alt="Branding" 
                                className={`relative z-10 w-20 h-20 object-contain transition-all hover:scale-105 rounded-full ${sidebarLogoLoaded ? 'opacity-100' : 'opacity-0'}`}
                                onLoad={() => setSidebarLogoLoaded(true)}
                                onError={() => setSidebarLogoLoaded(false)}
                            />
                        </div>

                        <a 
                            href="https://blütenpiraten.de" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-yellow-600 hover:text-yellow-700 font-bold text-sm transition-colors flex items-center space-x-1 group hover:underline underline-offset-4"
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
