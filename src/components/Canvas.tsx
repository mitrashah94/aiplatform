import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Panel,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  ConnectionMode,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AlertCircle, BookTemplate, ChevronUp, ChevronDown } from 'lucide-react';
import { AgentNode } from './nodes/AgentNode';
import { TaskNode } from './nodes/TaskNode';
import { ToolNode } from './nodes/ToolNode';
import { FlowNode } from './nodes/FlowNode';
import { useUndoRedo } from '../lib/useUndoRedo';
import { validateFlow } from '../lib/validateFlow';
import { TestResultsModal } from './TestResultsModal';
import { NodeTemplatesModal } from './NodeTemplatesModal';

const nodeTypes = {
  agent: AgentNode,
  task: TaskNode,
  tool: ToolNode,
  flow: FlowNode,
};

interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  testResults: any[] | null;
  onCloseTestResults: () => void;
  onNodePropertyChange: (nodeId: string, property: string, value: any) => void;
  onNodeLabelChange: (nodeId: string, label: string) => void;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
}

export function Canvas({ 
  nodes, 
  edges, 
  setNodes, 
  setEdges, 
  testResults, 
  onCloseTestResults,
  onNodePropertyChange,
  onNodeLabelChange,
  selectedNodeId,
  onNodeSelect,
}: CanvasProps) {
  const [validationErrors, setValidationErrors] = React.useState<any[]>([]);
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [showValidation, setShowValidation] = React.useState(false);
  const { pushToHistory, undo, redo } = useUndoRedo(setNodes, setEdges);
  const { project } = useReactFlow();

  React.useEffect(() => {
    const errors = validateFlow(nodes, edges);
    setValidationErrors(errors);
  }, [nodes, edges]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) =>
        nds.map((node) => {
          const change = changes.find((c) => c.id === node.id);
          if (change?.type === 'position' && 'position' in change) {
            return { ...node, position: change.position };
          }
          if (change?.type === 'select') {
            onNodeSelect(change.selected ? node.id : null);
          }
          return {
            ...node,
            selected: node.id === selectedNodeId,
          };
        })
      );
      pushToHistory(nodes, edges);
    },
    [nodes, edges, setNodes, pushToHistory, onNodeSelect, selectedNodeId]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const newEdges = eds.filter((edge) => {
          const change = changes.find((c) => c.id === edge.id);
          return change?.type !== 'remove';
        });
        pushToHistory(nodes, newEdges);
        return newEdges;
      });
    },
    [nodes, setEdges, pushToHistory]
  );

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => {
        const newEdges = addEdge(params, eds);
        pushToHistory(nodes, newEdges);
        return newEdges;
      });
    },
    [nodes, setEdges, pushToHistory]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const { left, top } = event.currentTarget.getBoundingClientRect();
      const position = project({
        x: event.clientX - left,
        y: event.clientY - top,
      });

      const newNode = {
        id: `${type}-${nodes.length + 1}`,
        type,
        position,
        data: { 
          label: `${type} ${nodes.length + 1}`,
          onLabelChange: (newLabel: string) => onNodeLabelChange(newNode.id, newLabel),
          onPropertyChange: (property: string, value: any) => onNodePropertyChange(newNode.id, property, value),
          selected: false,
        },
      };

      setNodes((nds) => {
        const newNodes = nds.concat(newNode);
        pushToHistory(newNodes, edges);
        return newNodes;
      });
      
      // Select the newly created node
      onNodeSelect(newNode.id);
    },
    [nodes, edges, setNodes, pushToHistory, onNodeLabelChange, onNodePropertyChange, onNodeSelect, project]
  );

  const handleApplyTemplate = useCallback((template: any) => {
    const newNode = {
      ...template,
      id: `${template.type}-${nodes.length + 1}`,
      position: { x: 100, y: 100 },
      data: {
        ...template.data,
        onLabelChange: (newLabel: string) => onNodeLabelChange(`${template.type}-${nodes.length + 1}`, newLabel),
        onPropertyChange: (property: string, value: any) => 
          onNodePropertyChange(`${template.type}-${nodes.length + 1}`, property, value),
        selected: false,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setShowTemplates(false);
    // Select the newly created template node
    onNodeSelect(newNode.id);
  }, [nodes, setNodes, onNodeLabelChange, onNodePropertyChange, onNodeSelect]);

  return (
    <div className="flex-1 h-full bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-900"
        snapToGrid
        snapGrid={[15, 15]}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Control', 'Meta']}
        selectionKeyCode={['Shift']}
        zoomActivationKeyCode={['Control', 'Meta']}
        panActivationKeyCode={['Space']}
        preventScrolling
        nodesDraggable
        nodesConnectable
        elementsSelectable
        selectNodesOnDrag={false}
        onPaneClick={() => onNodeSelect(null)}
      >
        <Background color="#374151" gap={16} size={1} />
        <Controls className="bg-gray-800 border-gray-700" />
        
        {validationErrors.length > 0 && (
          <div
            className="absolute bottom-4 left-4 z-10 transition-transform duration-300 ease-in-out transform"
            onMouseEnter={() => setShowValidation(true)}
            onMouseLeave={() => setShowValidation(false)}
          >
            <div className="bg-gray-800/95 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-700 cursor-pointer">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-100">
                  {validationErrors.length} Validation {validationErrors.length === 1 ? 'Issue' : 'Issues'}
                </span>
                {showValidation ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showValidation ? 'max-h-48 mt-2' : 'max-h-0'}`}>
                <ul className="space-y-2">
                  {validationErrors.map((error, index) => (
                    <li
                      key={index}
                      className={`text-sm ${
                        error.type === 'error' ? 'text-red-400' : 'text-yellow-400'
                      }`}
                    >
                      {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <BookTemplate className="w-4 h-4" />
            Templates
          </button>
        </Panel>
      </ReactFlow>

      {testResults && (
        <TestResultsModal
          results={testResults}
          onClose={onCloseTestResults}
        />
      )}

      {showTemplates && (
        <NodeTemplatesModal
          onClose={() => setShowTemplates(false)}
          onApplyTemplate={handleApplyTemplate}
        />
      )}
    </div>
  );
}