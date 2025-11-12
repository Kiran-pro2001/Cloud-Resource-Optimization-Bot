import React from 'react';
import { SparkIcon } from './icons/SparkIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center">
        <SparkIcon className="w-8 h-8 text-cyan-400 mr-3" />
        <h1 className="text-2xl font-bold text-white tracking-tight">
          OCI Cost Optimization Bot
        </h1>
      </div>
    </header>
  );
};