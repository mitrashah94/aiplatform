import { Node, Edge } from 'reactflow';

interface ValidationError {
  nodeId?: string;
  message: string;
  type: 'error' | 'warning';
}

export function validateFlow(nodes: Node[], edges: Edge[]): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check for disconnected nodes
  nodes.forEach(node => {
    const hasConnections = edges.some(
      edge => edge.source === node.id || edge.target === node.id
    );
    if (!hasConnections) {
      errors.push({
        nodeId: node.id,
        message: `${node.type} "${node.data.label}" is not connected to any other component`,
        type: 'warning'
      });
    }
  });

  // Validate required fields for each node type
  nodes.forEach(node => {
    switch (node.type) {
      case 'agent':
        if (!node.data.role) {
          errors.push({
            nodeId: node.id,
            message: `Agent "${node.data.label}" requires a role`,
            type: 'error'
          });
        }
        if (!node.data.goals) {
          errors.push({
            nodeId: node.id,
            message: `Agent "${node.data.label}" requires at least one goal`,
            type: 'error'
          });
        }
        break;
      case 'task':
        if (!node.data.description) {
          errors.push({
            nodeId: node.id,
            message: `Task "${node.data.label}" requires a description`,
            type: 'error'
          });
        }
        // Check if task has an assigned agent
        const hasAgent = edges.some(edge => edge.target === node.id);
        if (!hasAgent) {
          errors.push({
            nodeId: node.id,
            message: `Task "${node.data.label}" needs to be assigned to an agent`,
            type: 'error'
          });
        }
        break;
      case 'tool':
        if (!node.data.toolType) {
          errors.push({
            nodeId: node.id,
            message: `Tool "${node.data.label}" requires a tool type`,
            type: 'error'
          });
        }
        break;
      case 'flow':
        if (node.data.flowType === 'conditional' && !node.data.condition) {
          errors.push({
            nodeId: node.id,
            message: `Conditional flow "${node.data.label}" requires a condition`,
            type: 'warning'
          });
        }
        break;
    }
  });

  // Check for circular dependencies
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    for (const edge of outgoingEdges) {
      if (hasCycle(edge.target)) return true;
    }

    recursionStack.delete(nodeId);
    return false;
  }

  nodes.forEach(node => {
    if (hasCycle(node.id)) {
      errors.push({
        nodeId: node.id,
        message: 'Circular dependency detected in the workflow',
        type: 'error'
      });
    }
  });

  return errors;
}