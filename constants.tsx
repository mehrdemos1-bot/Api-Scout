import React from 'react';

export const DEFAULT_FLIGHT_RADIUS_METERS = 3000;
export const FLIGHT_RADIUS_OPTIONS = [1000, 2000, 3000];
export const MAP_INITIAL_CENTER: [number, number] = [51.1657, 10.4515]; // Center of Germany
export const MAP_INITIAL_ZOOM = 6;

// Using Esri World Imagery for the base satellite layer
export const MAP_TILE_URL_SATELLITE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
export const MAP_ATTRIBUTION_SATELLITE = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

// Using CartoDB Positron for labels
export const MAP_TILE_URL_LABELS = 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png';
export const MAP_ATTRIBUTION_LABELS = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';


export const BEE_ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-yellow-500 drop-shadow-lg">
  <path fill-rule="evenodd" d="M15.97 3.97a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22-2.16-2.16a.75.75 0 0 1 0-1.06Zm-4.94 0a.75.75 0 0 1 0 1.06L8.84 7.22l-3.22-3.22a.75.75 0 0 1 1.06-1.06l3 3ZM12 5.25a.75.75 0 0 1 .75.75v3.68l1.43-1.43a.75.75 0 1 1 1.06 1.06l-2.75 2.75a.75.75 0 0 1-1.06 0L8.7 9.31a.75.75 0 1 1 1.06-1.06l1.44 1.44V6a.75.75 0 0 1 .75-.75Zm-3.75 9a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm-2.25 3a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
</svg>
`;

export const BEEHIVE_ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FBBF24" class="w-6 h-6">
  <path d="M19.3,6.2C18.6,3.9,16.5,2,14,2H10C7.5,2,5.4,3.9,4.7,6.2H19.3z M20.9,7.8H3.1C2.3,7.8,2,8.3,2,9c0,0.8,0.6,1.4,1.4,1.4h17.1 c0.8,0,1.4-0.6,1.4-1.4C21.9,8.3,21.6,7.8,20.9,7.8z M20.6,12H3.4c-0.8,0-1.4,0.6-1.4,1.4c0,0.7,0.5,1.3,1.2,1.4h17.5 c0.7,0,1.2-0.6,1.2-1.3C22,12.7,21.5,12,20.6,12z M19.7,16.2H4.3c-0.8,0-1.3,0.5-1.2,1.2c0.1,0.7,0.7,1.2,1.4,1.2h15.1 c0.7,0,1.3-0.5,1.4-1.2C21,16.7,20.5,16.2,19.7,16.2z M14,20H10v-1.5c0-0.3,0.2-0.5,0.5-0.5h3c0.3,0,0.5,0.2,0.5,0.5V20z"/>
</svg>
`;

export const TRASH_ICON_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);