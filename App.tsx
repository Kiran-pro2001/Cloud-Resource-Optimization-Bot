
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ResourceInput } from './components/ResourceInput';
import { OptimizationReport } from './components/OptimizationReport';
import { analyzeResources } from './services/geminiService';
import type { OptimizationRecommendation, CloudResource } from './types';

const App: React.FC = () => {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (jsonData: string) => {
    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      let resources: CloudResource[];
      try {
        resources = JSON.parse(jsonData);
        if (!Array.isArray(resources) || resources.length === 0) {
            throw new Error("Input must be a non-empty array of cloud resources.");
        }
      } catch (e) {
        throw new Error("Invalid JSON format. Please check the structure and try again.");
      }

      const result = await analyzeResources(resources);
      setRecommendations(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during analysis.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ResourceInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          <OptimizationReport 
            recommendations={recommendations} 
            isLoading={isLoading} 
            error={error} 
          />
        </div>
      </main>
    </div>
  );
};

export default App;
