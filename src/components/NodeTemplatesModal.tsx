import React from 'react';
import { X } from 'lucide-react';

const templates = {
  agent: [
    {
      type: 'agent',
      data: {
        label: 'Research Agent',
        role: 'Researcher',
        goals: 'Gather and analyze information\nProvide detailed reports',
        backstory: 'Expert in data analysis and research methodologies',
        allowDelegation: 'true',
        memory: '1000',
        llmModel: 'gpt-4-0125-preview',
      },
    },
    {
      type: 'agent',
      data: {
        label: 'Writer Agent',
        role: 'Content Creator',
        goals: 'Create engaging content\nMaintain consistent style',
        backstory: 'Experienced content writer with expertise in various topics',
        allowDelegation: 'false',
        memory: '2000',
        llmModel: 'gpt-4-0125-preview',
      },
    },
  ],
  task: [
    {
      type: 'task',
      data: {
        label: 'Research Task',
        description: 'Conduct comprehensive research on the given topic',
        expectedOutput: 'Detailed research report with citations',
        priority: 'high',
        context: 'Focus on recent developments and reliable sources',
        executionOrder: '1',
      },
    },
    {
      type: 'task',
      data: {
        label: 'Content Creation',
        description: 'Create engaging content based on research findings',
        expectedOutput: 'Well-structured article or report',
        priority: 'medium',
        context: 'Target audience: technical professionals',
        executionOrder: '2',
      },
    },
  ],
  tool: [
    {
      type: 'tool',
      data: {
        label: 'Web Scraper',
        toolType: 'FirecrawlScrapeWebsiteTool',
        configuration: JSON.stringify({
          selectors: ['.content', '.article', 'p'],
          timeout: 30,
        }, null, 2),
        description: 'Scrape web content with customizable settings',
        returnDirect: true,
      },
    },
    {
      type: 'tool',
      data: {
        label: 'Code Interpreter',
        toolType: 'CodeInterpreterTool',
        configuration: JSON.stringify({
          timeout: 60,
          memory_limit: '512M',
        }, null, 2),
        description: 'Execute Python code for data processing',
        returnDirect: false,
      },
    },
  ],
  flow: [
    {
      type: 'flow',
      data: {
        label: 'Sequential Research',
        flowType: 'sequential',
        managerLLM: 'gpt-4-0125-preview',
        maxRetries: '3',
        timeout: '300',
      },
    },
    {
      type: 'flow',
      data: {
        label: 'Parallel Processing',
        flowType: 'parallel',
        managerLLM: 'gpt-4-0125-preview',
        maxRetries: '2',
        timeout: '600',
      },
    },
  ],
};

interface NodeTemplatesModalProps {
  onClose: () => void;
  onApplyTemplate: (template: any) => void;
}

export function NodeTemplatesModal({ onClose, onApplyTemplate }: NodeTemplatesModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100">Node Templates</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full text-gray-400 hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(templates).map(([category, categoryTemplates]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-semibold capitalize text-gray-100">{category} Templates</h3>
                <div className="space-y-2">
                  {categoryTemplates.map((template, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => onApplyTemplate(template)}
                    >
                      <h4 className="font-medium text-gray-100">{template.data.label}</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {template.data.description || template.data.role || template.data.flowType}
                      </p>
                    </div>
                  ))}
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