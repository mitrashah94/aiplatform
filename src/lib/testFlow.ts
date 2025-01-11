import { Node, Edge } from 'reactflow';

interface TestResult {
  nodeId: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  timestamp: number;
}

interface TestProgress {
  currentNode: string | null;
  completedNodes: string[];
  results: TestResult[];
  isComplete: boolean;
}

export async function testFlow(nodes: Node[], edges: Edge[]): Promise<TestProgress> {
  const results: TestResult[] = [];
  const completedNodes = new Set<string>();
  let currentNode: string | null = null;

  // Find starting nodes (nodes with no incoming edges)
  const startNodes = nodes.filter(node => 
    !edges.some(edge => edge.target === node.id)
  );

  if (startNodes.length === 0) {
    return {
      currentNode: null,
      completedNodes: [],
      results: [{
        nodeId: '',
        status: 'error',
        message: 'No starting nodes found in the flow',
        timestamp: Date.now()
      }],
      isComplete: true
    };
  }

  // Process nodes in topological order
  const processNode = async (node: Node) => {
    currentNode = node.id;
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    switch (node.type) {
      case 'agent':
        if (!node.data.role || !node.data.goals) {
          results.push({
            nodeId: node.id,
            status: 'error',
            message: 'Agent requires role and goals',
            timestamp: Date.now()
          });
        } else {
          results.push({
            nodeId: node.id,
            status: 'success',
            message: `Agent "${node.data.label}" initialized successfully`,
            timestamp: Date.now()
          });
        }
        break;

      case 'task':
        if (!node.data.description) {
          results.push({
            nodeId: node.id,
            status: 'error',
            message: 'Task requires a description',
            timestamp: Date.now()
          });
        } else {
          const assignedAgent = edges.find(edge => edge.target === node.id);
          if (!assignedAgent) {
            results.push({
              nodeId: node.id,
              status: 'warning',
              message: 'Task has no assigned agent',
              timestamp: Date.now()
            });
          } else {
            results.push({
              nodeId: node.id,
              status: 'success',
              message: `Task "${node.data.label}" validated successfully`,
              timestamp: Date.now()
            });
          }
        }
        break;

      case 'tool':
        if (!node.data.toolType) {
          results.push({
            nodeId: node.id,
            status: 'error',
            message: 'Tool requires a type',
            timestamp: Date.now()
          });
        } else {
          try {
            if (node.data.configuration) {
              JSON.parse(node.data.configuration);
            }
            results.push({
              nodeId: node.id,
              status: 'success',
              message: `Tool "${node.data.label}" configured successfully`,
              timestamp: Date.now()
            });
          } catch (error) {
            results.push({
              nodeId: node.id,
              status: 'error',
              message: 'Invalid tool configuration JSON',
              timestamp: Date.now()
            });
          }
        }
        break;

      case 'flow':
        if (node.data.flowType === 'conditional' && !node.data.condition) {
          results.push({
            nodeId: node.id,
            status: 'warning',
            message: 'Conditional flow missing condition',
            timestamp: Date.now()
          });
        } else {
          results.push({
            nodeId: node.id,
            status: 'success',
            message: `Flow "${node.data.label}" validated successfully`,
            timestamp: Date.now()
          });
        }
        break;
    }

    completedNodes.add(node.id);
  };

  // Process all nodes
  for (const startNode of startNodes) {
    await processNode(startNode);
  }

  const visited = new Set<string>();
  const processNextNodes = async (nodeId: string) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    for (const edge of outgoingEdges) {
      const nextNode = nodes.find(n => n.id === edge.target);
      if (nextNode) {
        await processNode(nextNode);
        await processNextNodes(nextNode.id);
      }
    }
  };

  for (const startNode of startNodes) {
    await processNextNodes(startNode.id);
  }

  return {
    currentNode: null,
    completedNodes: Array.from(completedNodes),
    results,
    isComplete: true
  };
}