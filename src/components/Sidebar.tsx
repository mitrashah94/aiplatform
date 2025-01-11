import React from 'react';
import { Users, BrainCircuit, Wrench, GitGraph, PlayCircle, Download, Save, Trash2, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const components = [
  { type: 'agent', icon: Users, label: 'CrewAI Agent', color: 'text-blue-400' },
  { type: 'task', icon: BrainCircuit, label: 'CrewAI Task', color: 'text-emerald-400' },
  { type: 'tool', icon: Wrench, label: 'CrewAI Tool', color: 'text-purple-400' },
  { type: 'flow', icon: GitGraph, label: 'CrewAI Flow', color: 'text-orange-400' },
];

interface SidebarProps {
  onTestFlow: () => void;
  onGenerateCode: () => void;
  onSaveFlow: () => void;
  onClearCanvas: () => void;
}

export function Sidebar({ onTestFlow, onGenerateCode, onSaveFlow, onClearCanvas }: SidebarProps) {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = React.useState(false);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4 text-gray-100">CrewAI Components</h2>
      <div className="space-y-2 mb-8">
        {components.map((component) => {
          const Icon = component.icon;
          return (
            <div
              key={component.type}
              className="flex items-center p-3 bg-gray-700/50 rounded-lg cursor-move hover:bg-gray-700 transition-colors"
              draggable
              onDragStart={(e) => onDragStart(e, component.type)}
            >
              <Icon className={`w-5 h-5 mr-2 ${component.color}`} />
              <span className="text-gray-200">{component.label}</span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-700 pt-4 mb-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-100">Actions</h2>
        <div className="space-y-2">
          <button
            className="w-full flex items-center p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            onClick={onTestFlow}
          >
            <PlayCircle className="w-5 h-5 mr-2 text-blue-300" />
            Test Flow
          </button>
          <button
            className="w-full flex items-center p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            onClick={onGenerateCode}
          >
            <Download className="w-5 h-5 mr-2 text-emerald-300" />
            Generate Code
          </button>
          <button
            className="w-full flex items-center p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            onClick={onSaveFlow}
          >
            <Save className="w-5 h-5 mr-2 text-purple-300" />
            Save Flow
          </button>
          <button
            className="w-full flex items-center p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            onClick={onClearCanvas}
          >
            <Trash2 className="w-5 h-5 mr-2 text-red-300" />
            Clear Canvas
          </button>
        </div>
      </div>

      {/* Settings Section */}
      <div className="mt-auto border-t border-gray-700 pt-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center p-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 mr-2" />
          Settings
        </button>
        
        {showSettings && (
          <div className="mt-2 space-y-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center p-3 text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}