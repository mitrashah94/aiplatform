import { useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

export function useUndoRedo(
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void
) {
  const historyRef = useRef<HistoryState[]>([]);
  const currentIndexRef = useRef<number>(-1);
  const isUndoRedoActionRef = useRef(false);

  const pushToHistory = useCallback((nodes: Node[], edges: Edge[]) => {
    if (isUndoRedoActionRef.current) {
      isUndoRedoActionRef.current = false;
      return;
    }

    const newHistory = historyRef.current.slice(0, currentIndexRef.current + 1);
    newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
    historyRef.current = newHistory;
    currentIndexRef.current += 1;
  }, []);

  const undo = useCallback(() => {
    if (currentIndexRef.current > 0) {
      isUndoRedoActionRef.current = true;
      currentIndexRef.current -= 1;
      const { nodes, edges } = historyRef.current[currentIndexRef.current];
      setNodes(nodes);
      setEdges(edges);
    }
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoActionRef.current = true;
      currentIndexRef.current += 1;
      const { nodes, edges } = historyRef.current[currentIndexRef.current];
      setNodes(nodes);
      setEdges(edges);
    }
  }, [setNodes, setEdges]);

  return { pushToHistory, undo, redo };
}