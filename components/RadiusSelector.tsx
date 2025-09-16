import React from 'react';
import { FLIGHT_RADIUS_OPTIONS } from '../constants';

interface RadiusSelectorProps {
    selectedRadius: number;
    onRadiusChange: (radius: number) => void;
}

export const RadiusSelector: React.FC<RadiusSelectorProps> = ({ selectedRadius, onRadiusChange }) => {
    return (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Flugradius für neue Bienenstöcke</h3>
            <div className="flex justify-around items-center">
                {FLIGHT_RADIUS_OPTIONS.map(radius => (
                    <label key={radius} className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-gray-900">
                        <input
                            type="radio"
                            name="radius"
                            value={radius}
                            checked={selectedRadius === radius}
                            onChange={() => onRadiusChange(radius)}
                            className="h-4 w-4 text-yellow-500 border-gray-300 focus:ring-yellow-400"
                        />
                        <span className="font-medium">{radius / 1000} km</span>
                    </label>
                ))}
            </div>
        </div>
    );
};