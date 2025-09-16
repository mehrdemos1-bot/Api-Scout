import React, { useEffect, useMemo, forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents, Pane } from 'react-leaflet';
import L from 'leaflet';
import html2canvas from 'html2canvas';
import type { Hive } from '../types';
import { 
    MAP_INITIAL_CENTER, 
    MAP_INITIAL_ZOOM, 
    MAP_TILE_URL_SATELLITE, 
    MAP_ATTRIBUTION_SATELLITE, 
    MAP_TILE_URL_LABELS,
    MAP_ATTRIBUTION_LABELS,
    BEEHIVE_ICON_SVG 
} from '../constants';

// Helper component to fix map sizing issues in flexible layouts
const MapSizingFix: React.FC = () => {
    const map = useMap();
    useEffect(() => {
        // A brief delay to allow the container to render and settle its size,
        // then tell Leaflet to update its size. This is a common fix for flexbox/grid layouts.
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);

        return () => {
            clearTimeout(timer);
        };
    }, [map]);
    return null;
};


// Helper component to handle map click events for adding hives
const MapClickHandler: React.FC<{ onAddHive: (lat: number, lng: number) => void }> = ({ onAddHive }) => {
    useMapEvents({
        click(e) {
            onAddHive(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Helper component to pan the map to a given center
const RecenterView: React.FC<{ center: [number, number] | null }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, Math.max(map.getZoom(), 13), {
                animate: true,
                duration: 1
            });
        }
    }, [center, map]);
    return null;
};

export interface MapComponentApi {
    captureHiveArea: (hiveId: string) => Promise<string>;
}

interface MapComponentProps {
    hives: Hive[];
    onAddHive: (lat: number, lng: number) => void;
    selectedHive: Hive | null;
    onSelectHive: (hive: Hive) => void;
    searchResultCenter: [number, number] | null;
}

export const MapComponent = forwardRef<MapComponentApi, MapComponentProps>(({ hives, onAddHive, selectedHive, onSelectHive, searchResultCenter }, ref) => {
    
    const hiveIcon = useMemo(() => new L.DivIcon({
        html: `<div class="p-1 bg-white rounded-full shadow-lg">${BEEHIVE_ICON_SVG}</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    }), []);

    const selectedHiveIcon = useMemo(() => new L.DivIcon({
         html: `<div class="p-1 bg-yellow-300 rounded-full shadow-lg ring-2 ring-yellow-500">${BEEHIVE_ICON_SVG}</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    }), []);
    
    const mapRef = useRef<L.Map>(null);
    const [analyzingHiveId, setAnalyzingHiveId] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
        async captureHiveArea(hiveId: string) {
            const map = mapRef.current;
            const hiveToAnalyze = hives.find(h => h.id === hiveId);

            if (!map || !hiveToAnalyze) {
                throw new Error("Karte oder Bienenstock für die Analyse nicht bereit.");
            }

            // Temporarily hide the circle for capture
            setAnalyzingHiveId(hiveId);

            const bounds = L.latLng(hiveToAnalyze.lat, hiveToAnalyze.lng).toBounds(hiveToAnalyze.radius);
            map.fitBounds(bounds, { padding: [10, 10], animate: true, duration: 1 });

            // Wait for map animation and tiles to load before capture
            await new Promise(resolve => setTimeout(resolve, 1500));

            const mapContainer = map.getContainer();
            const northWestPoint = map.latLngToContainerPoint(bounds.getNorthWest());
            const southEastPoint = map.latLngToContainerPoint(bounds.getSouthEast());

            const canvas = await html2canvas(mapContainer, {
                useCORS: true,
                logging: false,
                scale: 1,
                x: northWestPoint.x,
                y: northWestPoint.y,
                width: southEastPoint.x - northWestPoint.x,
                height: southEastPoint.y - northWestPoint.y,
            });

            // Compress image to 80% quality to reduce file size and speed up analysis
            const base64Image = canvas.toDataURL('image/jpeg', 0.8);

            // Restore circle visibility
            setAnalyzingHiveId(null);

            return base64Image.split(',')[1];
        }
    }));

    const viewCenter = useMemo<[number, number] | null>(() => {
        if (selectedHive) {
            return [selectedHive.lat, selectedHive.lng];
        }
        if (searchResultCenter) {
            return searchResultCenter;
        }
        return null;
    }, [selectedHive, searchResultCenter]);


    return (
        <div className="h-full w-full">
            <MapContainer center={MAP_INITIAL_CENTER} zoom={MAP_INITIAL_ZOOM} scrollWheelZoom={true} className="h-full w-full" maxZoom={18} ref={mapRef}>
                <TileLayer 
                    url={MAP_TILE_URL_SATELLITE} 
                    attribution={MAP_ATTRIBUTION_SATELLITE}
                    zIndex={1}
                    maxNativeZoom={18}
                />
                
                {/* Labels are kept on a separate pane to ensure they render on top of the filter. */}
                <Pane name="labels" style={{ zIndex: 450 }} />
                <TileLayer 
                    url={MAP_TILE_URL_LABELS}
                    attribution={MAP_ATTRIBUTION_LABELS}
                    pane="labels"
                    maxNativeZoom={18}
                />
                <MapClickHandler onAddHive={onAddHive} />
                
                <RecenterView center={viewCenter} />

                <MapSizingFix />

                {/* Render markers and their flight radius circles. */}
                {hives.map(hive => {
                    const isSelected = selectedHive?.id === hive.id;
                    return (
                        <React.Fragment key={hive.id}>
                            <Marker 
                                position={[hive.lat, hive.lng]} 
                                icon={isSelected ? selectedHiveIcon : hiveIcon}
                                eventHandlers={{
                                    click: () => {
                                        onSelectHive(hive);
                                    },
                                }}
                                zIndexOffset={1000} // Ensure markers are on top
                            />
                             {hive.id !== analyzingHiveId && (
                                <Circle
                                    center={[hive.lat, hive.lng]}
                                    radius={hive.radius}
                                    pathOptions={{ 
                                        color: isSelected ? '#f59e0b' : '#3b82f6', 
                                        fillColor: isSelected ? '#fcd34d' : '#93c5fd',
                                        fillOpacity: 0.3,
                                        weight: isSelected ? 3 : 2
                                    }}
                                />
                             )}
                        </React.Fragment>
                    );
                })}
            </MapContainer>
        </div>
    );
});
MapComponent.displayName = 'MapComponent';