
import React, { useState } from 'react';

/**
 * Wir nutzen 'logo.png' (relativ), was in den meisten Umgebungen 
 * am zuverlässigsten funktioniert, wenn die Datei neben index.html liegt.
 */
const LOGO_SRC = "logo.png"; 

const BeeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-yellow-700">
        <path fillRule="evenodd" d="M15.97 3.97a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22-2.16-2.16a.75.75 0 0 1 0-1.06Zm-4.94 0a.75.75 0 0 1 0 1.06L8.84 7.22l-3.22-3.22a.75.75 0 0 1 1.06-1.06l3 3ZM12 5.25a.75.75 0 0 1 .75.75v3.68l1.43-1.43a.75.75 0 1 1 1.06 1.06l-2.75 2.75a.75.75 0 0 1-1.06 0L8.7 9.31a.75.75 0 1 1 1.06-1.06l1.44 1.44V6a.75.75 0 0 1 .75-.75Zm-3.75 9a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm-2.25 3a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
);

export const Header: React.FC = () => {
    const [logoError, setLogoError] = useState(false);

    return (
        <header className="bg-yellow-400 text-gray-900 p-4 shadow-lg z-50 flex items-center justify-between border-b-2 border-yellow-500">
            <div className="flex items-center space-x-4">
                <div className="relative group">
                    {!logoError ? (
                        <div className="bg-white rounded-full p-1 shadow-md group-hover:scale-110 transition-all duration-300 border-2 border-yellow-600/30">
                            <img 
                                src={LOGO_SRC} 
                                alt="Blütenpiraten Logo" 
                                className="h-14 w-14 object-contain rounded-full bg-white shadow-inner"
                                onError={() => {
                                    console.error("Logo konnte nicht geladen werden unter:", LOGO_SRC);
                                    setLogoError(true);
                                }}
                            />
                        </div>
                    ) : (
                        <div className="bg-yellow-300 rounded-full p-2 shadow-inner border-2 border-yellow-500">
                            <BeeIcon />
                        </div>
                    )}
                </div>
                <div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-none text-gray-900 drop-shadow-sm italic uppercase">
                        Api-Scout
                    </h1>
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-extrabold text-yellow-900 opacity-80">
                        By Blütenpiraten.de
                    </p>
                </div>
            </div>
            
            <div className="flex flex-col items-end space-y-1">
                <div className="hidden sm:flex items-center space-x-2 bg-black/10 px-4 py-2 rounded-full border border-black/5 backdrop-blur-sm">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">KI Tracht-Scan</span>
                </div>
            </div>
        </header>
    );
};
