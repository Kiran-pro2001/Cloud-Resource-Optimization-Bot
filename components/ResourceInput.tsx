
import React, { useState } from 'react';

interface ResourceInputProps {
  onAnalyze: (jsonData: string) => void;
  isLoading: boolean;
}

const sampleData = [
  {
    "id": "prod-web-server-01",
    "type": "VM",
    "region": "us-east-1",
    "size": "m5.2xlarge",
    "cpuUsagePercent": 15,
    "memoryUsagePercent": 25,
    "idleHoursPerDay": 0
  },
  {
    "id": "staging-db-instance",
    "type": "DATABASE",
    "region": "us-west-2",
    "size": "db.r5.large",
    "cpuUsagePercent": 5,
    "memoryUsagePercent": 10,
    "idleHoursPerDay": 16
  },
  {
    "id": "dev-vm-for-testing",
    "type": "VM",
    "region": "eu-central-1",
    "size": "t3.medium",
    "cpuUsagePercent": 2,
    "memoryUsagePercent": 5,
    "idleHoursPerDay": 22
  },
  {
    "id": "backup-storage-main",
    "type": "STORAGE_BUCKET",
    "region": "us-east-1"
  }
];

export const ResourceInput: React.FC<ResourceInputProps> = ({ onAnalyze, isLoading }) => {
  const [jsonData, setJsonData] = useState<string>(JSON.stringify(sampleData, null, 2));

  const handleAnalyzeClick = () => {
    onAnalyze(jsonData);
  };

  const loadSampleData = () => {
    setJsonData(JSON.stringify(sampleData, null, 2));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Cloud Resource Data</h2>
        <button
          onClick={loadSampleData}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Load Sample
        </button>
      </div>
      <textarea
        value={jsonData}
        onChange={(e) => setJsonData(e.target.value)}
        placeholder="Paste your cloud resource JSON here..."
        className="flex-grow w-full p-4 bg-gray-900 border border-gray-700 rounded-md text-gray-300 font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
        spellCheck="false"
      />
      <button
        onClick={handleAnalyzeClick}
        disabled={isLoading || !jsonData.trim()}
        className="mt-4 w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : (
          'Analyze Resources'
        )}
      </button>
    </div>
  );
};
