import React from 'react';
import { Handle, Position } from 'reactflow';
import { Users, EyeOff, Eye, AlertCircle, GripVertical } from 'lucide-react';

const LLM_MODELS = [
  // OpenAI Models
  { value: 'gpt-4-0125-preview', label: 'GPT-4 Turbo (Preview)', provider: 'openai' },
  { value: 'gpt-4', label: 'GPT-4', provider: 'openai' },
  { value: 'gpt-3.5-turbo-0125', label: 'GPT-3.5 Turbo', provider: 'openai' },
  // ... other models
];

export function AgentNode({ data }: { data: any }) {
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);
  const selectedModel = LLM_MODELS.find(model => model.value === data.llmModel) || LLM_MODELS[0];

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="node-content">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 mb-2">
        <div className="node-drag-handle cursor-move">
          <GripVertical className="w-5 h-5 text-gray-500" />
        </div>
        <Users className="w-5 h-5 text-blue-600" />
        <input
          className="flex-1 border-none bg-transparent font-semibold text-gray-100"
          value={data.label || ''}
          onChange={(e) => data.onLabelChange(e.target.value)}
          placeholder="Agent Name"
          onClick={handleInputClick}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowHelp(!showHelp);
          }}
          className="text-gray-400 hover:text-gray-300"
        >
          <AlertCircle className="w-4 h-4" />
        </button>
      </div>
      {showHelp && (
        <div className="mb-2 text-xs text-gray-400 bg-gray-700 p-2 rounded">
          Agents are AI workers that perform tasks. Each agent needs a role, goals, and an LLM model to function.
        </div>
      )}
      <div className="space-y-2" onClick={handleInputClick}>
        <input
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          placeholder="Role (e.g., Researcher, Writer, Analyst)"
          value={data.role || ''}
          onChange={(e) => data.onPropertyChange('role', e.target.value)}
        />
        <textarea
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          placeholder="Goals (one per line)"
          rows={3}
          value={data.goals || ''}
          onChange={(e) => data.onPropertyChange('goals', e.target.value)}
        />
        <textarea
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          placeholder="Backstory (Optional personality and background)"
          rows={2}
          value={data.backstory || ''}
          onChange={(e) => data.onPropertyChange('backstory', e.target.value)}
        />
        <select
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          value={data.llmModel || 'gpt-4-0125-preview'}
          onChange={(e) => data.onPropertyChange('llmModel', e.target.value)}
        >
          <optgroup label="OpenAI">
            {LLM_MODELS.filter(m => m.provider === 'openai').map(model => (
              <option key={model.value} value={model.value}>{model.label}</option>
            ))}
          </optgroup>
          {/* ... other model groups */}
        </select>
        {data.llmModel === 'custom' && (
          <input
            className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
            placeholder="Custom Model Name"
            value={data.customModel || ''}
            onChange={(e) => data.onPropertyChange('customModel', e.target.value)}
          />
        )}
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100 pr-8"
            placeholder={`${selectedModel.provider.toUpperCase()} API Key`}
            value={data.apiKey || ''}
            onChange={(e) => data.onPropertyChange('apiKey', e.target.value)}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowApiKey(!showApiKey);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <select
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          value={data.allowDelegation || 'false'}
          onChange={(e) => data.onPropertyChange('allowDelegation', e.target.value)}
        >
          <option value="true">Allow Delegation</option>
          <option value="false">Disable Delegation</option>
        </select>
        <input
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          placeholder="Memory (max tokens)"
          type="number"
          value={data.memory || ''}
          onChange={(e) => data.onPropertyChange('memory', e.target.value)}
          min="0"
        />
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}