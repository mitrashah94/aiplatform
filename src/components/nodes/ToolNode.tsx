import React from 'react';
import { Handle, Position } from 'reactflow';
import { Wrench, Settings, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const TOOL_TYPES = {
  // Browser Tools
  BrowserbaseLoadTool: {
    label: 'Browser Load Tool',
    description: 'Interact with and extract data from web browsers',
    configFields: ['timeout', 'headers'],
    defaultConfig: { timeout: 30, headers: {} }
  },
  // Code Tools
  CodeDocsSearchTool: {
    label: 'Code Docs Search Tool',
    description: 'Search through code documentation and technical documents',
    configFields: ['index_path', 'search_type'],
    defaultConfig: { index_path: '', search_type: 'semantic' }
  },
  CodeInterpreterTool: {
    label: 'Code Interpreter Tool',
    description: 'Interpret and execute Python code',
    configFields: ['timeout', 'memory_limit'],
    defaultConfig: { timeout: 30, memory_limit: '512M' }
  },
  // File Tools
  FileReadTool: {
    label: 'File Read Tool',
    description: 'Read and extract data from files',
    configFields: ['file_path', 'encoding'],
    defaultConfig: { file_path: '', encoding: 'utf-8' }
  },
  DirectoryReadTool: {
    label: 'Directory Read Tool',
    description: 'Read and process directory structures',
    configFields: ['dir_path', 'recursive'],
    defaultConfig: { dir_path: '', recursive: true }
  },
  // Search Tools
  CSVSearchTool: {
    label: 'CSV Search Tool',
    description: 'Search within CSV files',
    configFields: ['file_path', 'delimiter'],
    defaultConfig: { file_path: '', delimiter: ',' }
  },
  DOCXSearchTool: {
    label: 'DOCX Search Tool',
    description: 'Search within DOCX documents',
    configFields: ['file_path'],
    defaultConfig: { file_path: '' }
  },
  JSONSearchTool: {
    label: 'JSON Search Tool',
    description: 'Search within JSON files',
    configFields: ['file_path', 'jq_query'],
    defaultConfig: { file_path: '', jq_query: '.' }
  },
  PDFSearchTool: {
    label: 'PDF Search Tool',
    description: 'Search within PDF documents',
    configFields: ['file_path', 'ocr_enabled'],
    defaultConfig: { file_path: '', ocr_enabled: false }
  },
  // Web Tools
  FirecrawlSearchTool: {
    label: 'Firecrawl Search Tool',
    description: 'Search webpages using Firecrawl',
    configFields: ['max_results', 'timeout'],
    defaultConfig: { max_results: 10, timeout: 30 }
  },
  FirecrawlCrawlWebsiteTool: {
    label: 'Firecrawl Website Tool',
    description: 'Crawl websites using Firecrawl',
    configFields: ['max_depth', 'timeout'],
    defaultConfig: { max_depth: 3, timeout: 60 }
  },
  FirecrawlScrapeWebsiteTool: {
    label: 'Firecrawl Scrape Tool',
    description: 'Scrape websites using Firecrawl',
    configFields: ['selectors', 'timeout'],
    defaultConfig: { selectors: [], timeout: 30 }
  },
  // GitHub Tools
  GithubSearchTool: {
    label: 'GitHub Search Tool',
    description: 'Search within GitHub repositories',
    configFields: ['repo', 'path', 'branch'],
    defaultConfig: { repo: '', path: '', branch: 'main' }
  },
  // Database Tools
  PGSearchTool: {
    label: 'PostgreSQL Search Tool',
    description: 'Search within PostgreSQL databases',
    configFields: ['connection_string', 'query'],
    defaultConfig: { connection_string: '', query: '' }
  },
  // AI Tools
  DALLETool: {
    label: 'DALL-E Tool',
    description: 'Generate images using DALL-E',
    configFields: ['model', 'size', 'quality'],
    defaultConfig: { model: 'dall-e-3', size: '1024x1024', quality: 'standard' }
  },
  VisionTool: {
    label: 'Vision Tool',
    description: 'Process and analyze images',
    configFields: ['model', 'max_tokens'],
    defaultConfig: { model: 'gpt-4-vision-preview', max_tokens: 1000 }
  },
  // YouTube Tools
  YoutubeChannelSearchTool: {
    label: 'YouTube Channel Search Tool',
    description: 'Search within YouTube channels',
    configFields: ['channel_id', 'max_results'],
    defaultConfig: { channel_id: '', max_results: 50 }
  },
  YoutubeVideoSearchTool: {
    label: 'YouTube Video Search Tool',
    description: 'Search within YouTube videos',
    configFields: ['video_id', 'language'],
    defaultConfig: { video_id: '', language: 'en' }
  }
};

export function ToolNode({ data }: { data: any }) {
  const [showConfig, setShowConfig] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);
  const selectedTool = TOOL_TYPES[data.toolType as keyof typeof TOOL_TYPES];

  const handleToolTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newToolType = e.target.value;
    data.onPropertyChange('toolType', newToolType);
    // Set default configuration when tool type changes
    if (TOOL_TYPES[newToolType as keyof typeof TOOL_TYPES]) {
      data.onPropertyChange('configuration', JSON.stringify(
        TOOL_TYPES[newToolType as keyof typeof TOOL_TYPES].defaultConfig,
        null,
        2
      ));
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 min-w-[250px]">
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-purple-500"
      />
      <div className="flex items-center gap-2 mb-2">
        <Wrench className="w-5 h-5 text-purple-600" />
        <input
          className="flex-1 border-none bg-transparent font-semibold text-gray-100"
          value={data.label || ''}
          onChange={(e) => data.onLabelChange(e.target.value)}
          placeholder="Tool Name"
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
          Tools provide specific functionalities to agents, such as web scraping, file reading, or API interactions.
        </div>
      )}
      <div className="space-y-2">
        <select
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          value={data.toolType || ''}
          onChange={handleToolTypeChange}
        >
          <option value="">Select Tool Type</option>
          <optgroup label="Browser Tools">
            <option value="BrowserbaseLoadTool">Browser Load Tool</option>
          </optgroup>
          <optgroup label="Code Tools">
            <option value="CodeDocsSearchTool">Code Docs Search Tool</option>
            <option value="CodeInterpreterTool">Code Interpreter Tool</option>
          </optgroup>
          <optgroup label="File Tools">
            <option value="FileReadTool">File Read Tool</option>
            <option value="DirectoryReadTool">Directory Read Tool</option>
          </optgroup>
          <optgroup label="Search Tools">
            <option value="CSVSearchTool">CSV Search Tool</option>
            <option value="DOCXSearchTool">DOCX Search Tool</option>
            <option value="JSONSearchTool">JSON Search Tool</option>
            <option value="PDFSearchTool">PDF Search Tool</option>
          </optgroup>
          <optgroup label="Web Tools">
            <option value="FirecrawlSearchTool">Firecrawl Search Tool</option>
            <option value="FirecrawlCrawlWebsiteTool">Firecrawl Crawl Website Tool</option>
            <option value="FirecrawlScrapeWebsiteTool">Firecrawl Scrape Website Tool</option>
          </optgroup>
          <optgroup label="GitHub Tools">
            <option value="GithubSearchTool">GitHub Search Tool</option>
          </optgroup>
          <optgroup label="Database Tools">
            <option value="PGSearchTool">PostgreSQL Search Tool</option>
          </optgroup>
          <optgroup label="AI Tools">
            <option value="DALLETool">DALL-E Tool</option>
            <option value="VisionTool">Vision Tool</option>
          </optgroup>
          <optgroup label="YouTube Tools">
            <option value="YoutubeChannelSearchTool">YouTube Channel Search Tool</option>
            <option value="YoutubeVideoSearchTool">YouTube Video Search Tool</option>
          </optgroup>
        </select>

        {selectedTool && (
          <>
            <div className="text-sm text-gray-400">{selectedTool.description}</div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-1 text-sm text-gray-300 hover:text-gray-100"
            >
              <Settings className="w-4 h-4" />
              Configuration
              {showConfig ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {showConfig && (
              <textarea
                className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100 font-mono"
                placeholder="Configuration (JSON)"
                rows={4}
                value={data.configuration || JSON.stringify(selectedTool.defaultConfig, null, 2)}
                onChange={(e) => {
                  try {
                    JSON.parse(e.target.value); // Validate JSON
                    data.onPropertyChange('configuration', e.target.value);
                  } catch (error) {
                    // Allow invalid JSON while typing, but don't update the state
                  }
                }}
              />
            )}
          </>
        )}

        <input
          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-gray-100"
          placeholder="Description"
          value={data.description || ''}
          onChange={(e) => data.onPropertyChange('description', e.target.value)}
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 text-purple-600 border-gray-600 rounded focus:ring-purple-500 bg-gray-700"
            checked={data.returnDirect || false}
            onChange={(e) => data.onPropertyChange('returnDirect', e.target.checked)}
          />
          <label className="text-sm text-gray-300">Return Direct</label>
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-purple-500"
      />
    </div>
  );
}