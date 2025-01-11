import React from 'react';
import { X, Download } from 'lucide-react';

interface CodePreviewModalProps {
  code: string;
  onClose: () => void;
  onDownload: () => void;
}

export function CodePreviewModal({ code, onClose, onDownload }: CodePreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100">Generated CrewAI Code</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full text-gray-400 hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto border border-gray-700">
            <code className="text-sm text-gray-100">{code}</code>
          </pre>
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
          >
            Close
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}