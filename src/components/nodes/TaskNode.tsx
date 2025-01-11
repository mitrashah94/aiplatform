import React from 'react';
import { Handle, Position } from 'reactflow';
import { BrainCircuit, AlertCircle } from 'lucide-react';

const TASK_PRIORITIES = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'critical', label: 'Critical Priority' }
];

export function TaskNode({ data }: { data: any }) {
  const [showHelp, setShowHelp] = React.useState(false);

  return (
    <div className="bg-gray-800 rounded-lg p-4 min-w-[250px]">
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-green-500"
      />
      <div className="flex items-center gap-2 mb-2">
        <BrainCircuit className="w-5 h-5 text-green-600" />
        <input
          className="flex-1 border-none bg-transparent font-semibold text-gray-100"
          value={data.label || ''}
          onChange={(e) => data.onLabelChange(e.target.value)}
          placeholder="Task Name"
        />
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-gray-400 hover:text-gray-300"
        >
          <AlertCircle className="w-4 h-4" />
        </button>
      </div>
      {showHelp && (
        <div className="mb-2 text-xs text-gray-400 bg-gray-700 p-2 rounded">
          Tasks are units of work that agents perform. Each task should have a clear description and expected output.
        </div>
      )}
      <div className="space-y-2">
        <textarea
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          placeholder="Task Description (What should be done?)"
          rows={3}
          value={data.description || ''}
          onChange={(e) => data.onPropertyChange('description', e.target.value)}
        />
        <textarea
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          placeholder="Expected Output (What should be produced?)"
          rows={2}
          value={data.expectedOutput || ''}
          onChange={(e) => data.onPropertyChange('expectedOutput', e.target.value)}
        />
        <select
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          value={data.priority || 'medium'}
          onChange={(e) => data.onPropertyChange('priority', e.target.value)}
        >
          {TASK_PRIORITIES.map(priority => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </select>
        <textarea
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          placeholder="Additional Context (Optional background information)"
          rows={2}
          value={data.context || ''}
          onChange={(e) => data.onPropertyChange('context', e.target.value)}
        />
        <input
          type="number"
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          placeholder="Execution Order (Optional)"
          value={data.executionOrder || ''}
          onChange={(e) => data.onPropertyChange('executionOrder', e.target.value)}
          min="1"
        />
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
}