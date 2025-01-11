import React from 'react';
import { Handle, Position } from 'reactflow';
import { GitGraph, EyeOff, Eye, AlertCircle } from 'lucide-react';

const LLM_MODELS = [
  // OpenAI Models
  { value: 'gpt-4-0125-preview', label: 'GPT-4 Turbo (Preview)', provider: 'openai' },
  { value: 'gpt-4', label: 'GPT-4', provider: 'openai' },
  { value: 'gpt-3.5-turbo-0125', label: 'GPT-3.5 Turbo', provider: 'openai' },
  // Anthropic Models
  { value: 'claude-3-opus', label: 'Claude 3 Opus', provider: 'anthropic' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', provider: 'anthropic' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku', provider: 'anthropic' },
  { value: 'claude-2.1', label: 'Claude 2.1', provider: 'anthropic' },
  // Google Models
  { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro', provider: 'google' },
  { value: 'gemini-1.0-ultra', label: 'Gemini 1.0 Ultra', provider: 'google' },
  // Mistral Models
  { value: 'mistral-large', label: 'Mistral Large', provider: 'mistral' },
  { value: 'mistral-medium', label: 'Mistral Medium', provider: 'mistral' },
  { value: 'mistral-small', label: 'Mistral Small', provider: 'mistral' },
  // Custom Option
  { value: 'custom', label: 'Custom Model', provider: 'custom' }
];

export function FlowNode({ data }: { data: any }) {
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);
  const selectedModel = LLM_MODELS.find(model => model.value === data.managerLLM) || LLM_MODELS[0];

  return (
    <div className="bg-gray-800 rounded-lg p-4 min-w-[250px]">
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-orange-500"
      />
      <div className="flex items-center gap-2 mb-2">
        <GitGraph className="w-5 h-5 text-orange-600" />
        <input
          className="flex-1 border-none bg-transparent font-semibold text-gray-100"
          value={data.label || ''}
          onChange={(e) => data.onLabelChange(e.target.value)}
          placeholder="Flow Name"
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
          Flow nodes control how tasks are executed. Choose between sequential, parallel, or conditional execution.
        </div>
      )}
      <div className="space-y-2">
        <select
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          value={data.flowType || 'sequential'}
          onChange={(e) => data.onPropertyChange('flowType', e.target.value)}
        >
          <option value="sequential">Sequential Flow</option>
          <option value="parallel">Parallel Flow</option>
          <option value="conditional">Conditional Flow</option>
        </select>
        <select
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          value={data.managerLLM || 'gpt-4-0125-preview'}
          onChange={(e) => data.onPropertyChange('managerLLM', e.target.value)}
        >
          <optgroup label="OpenAI">
            {LLM_MODELS.filter(m => m.provider === 'openai').map(model => (
              <option key={model.value} value={model.value}>{model.label}</option>
            ))}
          </optgroup>
          <optgroup label="Anthropic">
            {LLM_MODELS.filter(m => m.provider === 'anthropic').map(model => (
              <option key={model.value} value={model.value}>{model.label}</option>
            ))}
          </optgroup>
          <optgroup label="Google">
            {LLM_MODELS.filter(m => m.provider === 'google').map(model => (
              <option key={model.value} value={model.value}>{model.label}</option>
            ))}
          </optgroup>
          <optgroup label="Mistral">
            {LLM_MODELS.filter(m => m.provider === 'mistral').map(model => (
              <option key={model.value} value={model.value}>{model.label}</option>
            ))}
          </optgroup>
          <optgroup label="Custom">
            {LLM_MODELS.filter(m => m.provider === 'custom').map(model => (
              <option key={model.value} value={model.value}>{model.label}</option>
            ))}
          </optgroup>
        </select>
        {data.managerLLM === 'custom' && (
          <input
            className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
            placeholder="Custom Manager Model Name"
            value={data.customManagerModel || ''}
            onChange={(e) => data.onPropertyChange('customManagerModel', e.target.value)}
          />
        )}
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100 pr-8"
            placeholder={`${selectedModel.provider.toUpperCase()} API Key`}
            value={data.managerApiKey || ''}
            onChange={(e) => data.onPropertyChange('managerApiKey', e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <textarea
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          placeholder="Condition (Required for conditional flows)"
          rows={2}
          value={data.condition || ''}
          onChange={(e) => data.onPropertyChange('condition', e.target.value)}
        />
        <input
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          placeholder="Max Retries"
          type="number"
          value={data.maxRetries || ''}
          onChange={(e) => data.onPropertyChange('maxRetries', e.target.value)}
          min="0"
        />
        <input
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          placeholder="Timeout (seconds)"
          type="number"
          value={data.timeout || ''}
          onChange={(e) => data.onPropertyChange('timeout', e.target.value)}
          min="0"
        />
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-orange-500"
      />
    </div>
  );
}