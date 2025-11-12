import React, { useState } from 'react';
import type { OptimizationRecommendation } from '../types';
import { CloudIcon } from './icons/CloudIcon';
import { AlertIcon } from './icons/AlertIcon';
import { KeyIcon } from './icons/KeyIcon';

interface OptimizationReportProps {
  recommendations: OptimizationRecommendation[];
  isLoading: boolean;
  error: string | null;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

const ApiKeyPrompt: React.FC<{ onApiKeyChange: (key: string) => void }> = ({ onApiKeyChange }) => {
  const [localApiKey, setLocalApiKey] = useState('');

  const handleSave = () => {
    if (localApiKey.trim()) {
      onApiKeyChange(localApiKey.trim());
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <KeyIcon className="w-16 h-16 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">API Key Required</h3>
      <p className="text-center text-sm mb-4 max-w-md">
        Please enter your Google AI API key to begin. You can create a key in Google AI Studio.
      </p>
      <div className="w-full max-w-sm flex gap-2">
        <input
          type="password"
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your API Key..."
          className="flex-grow w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
        />
        <button
          onClick={handleSave}
          disabled={!localApiKey.trim()}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Save
        </button>
      </div>
       <p className="text-xs text-gray-500 mt-3">
        Your API key is stored locally in your browser.
      </p>
    </div>
  );
};


const RecommendationCard: React.FC<{ item: OptimizationRecommendation }> = ({ item }) => {
  const getConfidenceColor = (confidence: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (confidence) {
      case 'HIGH': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'LOW': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700 shadow-md hover:border-cyan-500/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-mono text-md text-cyan-400 break-all">{item.resourceId}</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getConfidenceColor(item.confidence)}`}>
          {item.confidence}
        </span>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-1">Issue:</p>
        <p className="font-medium text-gray-200">{item.issue}</p>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-1">Recommendation:</p>
        <p className="font-medium text-gray-200">{item.recommendation}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-green-400">${item.estimatedMonthlySavings.toFixed(2)}</p>
        <p className="text-xs text-gray-500">Est. Monthly Savings</p>
      </div>
    </div>
  );
};

export const OptimizationReport: React.FC<OptimizationReportProps> = ({ recommendations, isLoading, error, apiKey, onApiKeyChange }) => {
  const renderContent = () => {
    if (!apiKey) {
      return <ApiKeyPrompt onApiKeyChange={onApiKeyChange} />;
    }
    
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <svg className="animate-spin h-10 w-10 text-cyan-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg">AI is analyzing your resources...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <AlertIcon className="w-12 h-12 mb-4"/>
          <h3 className="text-xl font-semibold mb-2">Analysis Failed</h3>
          <p className="text-center text-red-300">{error}</p>
        </div>
      );
    }

    if (recommendations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <CloudIcon className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold">Ready for OCI Analysis</h3>
          <p className="text-center mt-2">Your Oracle Cloud Infrastructure optimization report will appear here once the analysis is complete.</p>
        </div>
      );
    }
    
    const totalSavings = recommendations.reduce((sum, item) => sum + item.estimatedMonthlySavings, 0);

    return (
      <>
        <div className="mb-4 p-4 bg-green-900/50 border border-green-700 rounded-lg text-center">
            <p className="text-sm text-green-300">Total Estimated Monthly Savings</p>
            <p className="text-3xl font-bold text-green-400">${totalSavings.toFixed(2)}</p>
        </div>
        <div className="space-y-4">
          {recommendations.map((item, index) => (
            <RecommendationCard key={`${item.resourceId}-${index}`} item={item} />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-full">
      <h2 className="text-xl font-semibold text-white mb-4">Optimization Report</h2>
      <div className="bg-gray-900 rounded-md p-4 min-h-[500px] max-h-[calc(100vh-250px)] overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};