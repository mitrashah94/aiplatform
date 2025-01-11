import React, { useCallback, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Sidebar } from '../components/Sidebar';
import { Canvas } from '../components/Canvas';
import { Node, Edge } from 'reactflow';
import { generateCrewAICode } from '../lib/codeGenerator';
import { testFlow } from '../lib/testFlow';
import { CodePreviewModal } from '../components/CodePreviewModal';

export function Editor() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleTestFlow = useCallback(async () => {
    if (nodes.length === 0) {
      alert('Please add some nodes to test the flow');
      return;
    }
    const results = await testFlow(nodes, edges);
    setTestResults(results.results);
  }, [nodes, edges]);

  const handleGenerateCode = useCallback(() => {
    if (nodes.length === 0) {
      alert('Please add some nodes to generate code');
      return;
    }
    const code = generateCrewAICode({ nodes, edges });
    setGeneratedCode(code);
    setShowCodePreview(true);
  }, [nodes, edges]);

  const handleSaveFlow = useCallback(() => {
    const flow = { nodes, edges };
    const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crew-flow.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleClearCanvas = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null);
    }
  }, []);

  const handleDownloadCode = useCallback(() => {
    const blob = new Blob([generatedCode], { type: 'text/python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crew_script.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedCode]);

  const handleNodePropertyChange = useCallback((nodeId: string, property: string, value: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                [property]: value,
              },
            }
          : node
      )
    );
  }, []);

  const handleNodeLabelChange = useCallback((nodeId: string, label: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                label,
              },
            }
          : node
      )
    );
  }, []);

  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          selected: node.id === nodeId,
        },
      }))
    );
  }, []);

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar
        onTestFlow={handleTestFlow}
        onGenerateCode={handleGenerateCode}
        onSaveFlow={handleSaveFlow}
        onClearCanvas={handleClearCanvas}
      />
      <main className="flex-1 flex flex-col">
        <header className="bg-gray-800 border-b border-gray-700 p-3">
          <h1 className="text-lg font-semibold text-gray-100">Elekite AI Editor</h1>
        </header>
        <ReactFlowProvider>
          <Canvas 
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            testResults={testResults}
            onCloseTestResults={() => setTestResults(null)}
            onNodePropertyChange={handleNodePropertyChange}
            onNodeLabelChange={handleNodeLabelChange}
            selectedNodeId={selectedNodeId}
            onNodeSelect={handleNodeSelect}
          />
        </ReactFlowProvider>
      </main>
      {showCodePreview && (
        <CodePreviewModal
          code={generatedCode}
          onClose={() => setShowCodePreview(false)}
          onDownload={handleDownloadCode}
        />
      )}
    </div>
  );
}