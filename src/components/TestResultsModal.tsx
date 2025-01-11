import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface TestResult {
  nodeId: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  timestamp: number;
}

interface TestResultsModalProps {
  results: TestResult[];
  onClose: () => void;
}

export function TestResultsModal({ results, onClose }: TestResultsModalProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100">Flow Test Results</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full text-gray-400 hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg flex items-start gap-3 ${
                  result.status === 'error'
                    ? 'bg-red-500/10 text-red-400'
                    : result.status === 'warning'
                    ? 'bg-yellow-500/10 text-yellow-400'
                    : 'bg-green-500/10 text-green-400'
                }`}
              >
                {getStatusIcon(result.status)}
                <div>
                  <p className="text-sm font-medium">{result.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}