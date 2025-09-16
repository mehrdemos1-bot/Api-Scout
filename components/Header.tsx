
import React from 'react';

const BeeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-500">
        <path fillRule="evenodd" d="M15.97 3.97a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22-2.16-2.16a.75.75 0 0 1 0-1.06Zm-4.94 0a.75.75 0 0 1 0 1.06L8.84 7.22l-3.22-3.22a.75.75 0 0 1 1.06-1.06l3 3ZM12 5.25a.75.75 0 0 1 .75.75v3.68l1.43-1.43a.75.75 0 1 1 1.06 1.06l-2.75 2.75a.75.75 0 0 1-1.06 0L8.7 9.31a.75.75 0 1 1 1.06-1.06l1.44 1.44V6a.75.75 0 0 1 .75-.75Zm-3.75 9a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm-2.25 3a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
);


export const Header: React.FC = () => {
    return (
        <header className="bg-yellow-400 text-gray-800 p-4 shadow-md z-10 flex items-center space-x-4">
            <BeeIcon />
            <h1 className="text-2xl font-bold">Api-Scout</h1>
        </header>
    );
};