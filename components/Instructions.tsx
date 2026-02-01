
import React from 'react';

export const Instructions: React.FC = () => {
    return (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded-md">
            <p className="font-bold">Anleitung</p>
            <p className="mt-1">Klicke auf die Karte, um einen neuen Bienenstock (maximal 3) hinzuzufügen. Der Flugradius wird automatisch angezeigt. Anschließend kannst du eine KI-gestützte Analyse des Trachtpotentials durchführen.</p>
        </div>
    );
};
