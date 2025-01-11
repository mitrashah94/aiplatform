export function generateCrewAICode(flowData: any) {
  let code = `from crewai import Agent, Task, Crew, Process
from crewai.tools import FileReaderTool, WebScrapingTool, PythonREPLTool, SearchTool
import os

# Set API keys for LLMs
${generateApiKeySetup(flowData.nodes)}

# Initialize tools
tools = {
${generateToolsCode(flowData.nodes.filter((n: any) => n.type === 'tool'))}
}

# Create agents
agents = {
${generateAgentsCode(flowData.nodes.filter((n: any) => n.type === 'agent'))}
}

# Define tasks
tasks = {
${generateTasksCode(flowData.nodes.filter((n: any) => n.type === 'task'), flowData.edges)}
}

# Create crew
crew = Crew(
    agents=list(agents.values()),
    tasks=list(tasks.values()),
    process=Process.${getProcessType(flowData.nodes.find((n: any) => n.type === 'flow')?.data?.flowType || 'sequential')},
    manager_llm="${getManagerLLM(flowData.nodes.find((n: any) => n.type === 'flow')?.data)}"
)

# Execute the crew
result = crew.kickoff()
print("\\nCrew Execution Result:\\n", result)
`;

  return code;
}

function generateApiKeySetup(nodes: any[]) {
  const apiKeys = new Set();
  
  // Collect API keys from agents
  nodes.filter(n => n.type === 'agent').forEach(agent => {
    if (agent.data.apiKey) {
      const provider = getLLMProvider(agent.data.llmModel);
      apiKeys.add(`os.environ["${provider}_API_KEY"] = "${agent.data.apiKey}"`);
    }
  });

  // Collect API key from flow manager
  const flowNode = nodes.find(n => n.type === 'flow');
  if (flowNode?.data?.managerApiKey) {
    const provider = getLLMProvider(flowNode.data.managerLLM);
    apiKeys.add(`os.environ["${provider}_API_KEY"] = "${flowNode.data.managerApiKey}"`);
  }

  return Array.from(apiKeys).join('\n');
}

function getLLMProvider(model: string) {
  if (model?.startsWith('gpt-')) return 'OPENAI';
  if (model?.startsWith('claude-')) return 'ANTHROPIC';
  if (model?.startsWith('gemini-')) return 'GOOGLE';
  if (model?.startsWith('mistral-')) return 'MISTRAL';
  return 'CUSTOM';
}

function generateToolsCode(tools: any[]) {
  return tools.map(tool => {
    const config = tool.data.configuration ? JSON.parse(tool.data.configuration) : {};
    switch (tool.data.toolType) {
      case 'FileReaderTool':
        return `    "${tool.id}": FileReaderTool(),`;
      case 'WebScrapingTool':
        return `    "${tool.id}": WebScrapingTool(),`;
      case 'PythonREPLTool':
        return `    "${tool.id}": PythonREPLTool(),`;
      case 'SearchTool':
        return `    "${tool.id}": SearchTool(),`;
      case 'CustomTool':
        return `    "${tool.id}": Tool(
        name="${tool.data.label}",
        description="${tool.data.description}",
        return_direct=${tool.data.returnDirect || false},
        **${JSON.stringify(config)}
    ),`;
      default:
        return '';
    }
  }).join('\n');
}

function generateAgentsCode(agents: any[]) {
  return agents.map(agent => `    "${agent.id}": Agent(
        role="${agent.data.role || ''}",
        goal="${agent.data.goals || ''}",
        backstory="${agent.data.backstory || ''}",
        allow_delegation=${agent.data.allowDelegation || 'False'},
        memory=${agent.data.memory || 'None'},
        llm="${getLLMModel(agent.data)}",
        tools=[${getAgentTools(agent.id)}]
    )`).join(',\n');
}

function generateTasksCode(tasks: any[], edges: any[]) {
  return tasks.map(task => `    "${task.id}": Task(
        description="${task.data.description || ''}",
        expected_output="${task.data.expectedOutput || ''}",
        agent=agents["${getTaskAgent(task.id, edges)}"],
        context="${task.data.context || ''}",
        priority="${task.data.priority || 'medium'}"
    )`).join(',\n');
}

function getAgentTools(agentId: string) {
  return `tools["${agentId}"]`;
}

function getTaskAgent(taskId: string, edges: any[]) {
  const edge = edges.find(e => e.target === taskId);
  return edge ? edge.source : '';
}

function getProcessType(flowType: string) {
  switch (flowType) {
    case 'parallel':
      return 'PARALLEL';
    case 'sequential':
      return 'SEQUENTIAL';
    default:
      return 'SEQUENTIAL';
  }
}

function getLLMModel(data: any) {
  if (data.llmModel === 'custom' && data.customModel) {
    return data.customModel;
  }
  return data.llmModel || 'gpt-4-0125-preview';
}

function getManagerLLM(data: any) {
  if (data?.managerLLM === 'custom' && data?.customManagerModel) {
    return data.customManagerModel;
  }
  return data?.managerLLM || 'gpt-4-0125-preview';
}