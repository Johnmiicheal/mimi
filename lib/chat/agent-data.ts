"use client";

import type { AgentData, AgentType } from "@/components/AgentPanel";

export const TOOL_TO_AGENT: Record<string, AgentType> = {
  checkSafety: "safety",
  getWeather: "weather",
  getCurrency: "currency",
  checkVisa: "visa",
  getLocalEvents: "events",
  getPackingList: "shopping",
  searchFlights: "flights",
  getTransportOptions: "flights",
  findLodging: "lodging",
  finalizeTripReservations: "booking",
  tripPlanner: "itinerary",
  suggestDestinations: "suggestions",
};

export function getAgentTypeForToolName(toolName: string | undefined): AgentType | undefined {
  if (!toolName) return undefined;
  return TOOL_TO_AGENT[toolName];
}

export function extractAgentData(parts: unknown[] | undefined): { agentData: AgentData; loadingAgents: Set<AgentType> } {
  const agentData: AgentData = {};
  const loadingAgents = new Set<AgentType>();
  const toolCallNames = new Map<string, string>();

  if (!parts) return { agentData, loadingAgents };

  for (const part of parts) {
    const p = part as Record<string, unknown>;

    if (typeof p.toolCallId === "string" && typeof p.toolName === "string") {
      toolCallNames.set(p.toolCallId, p.toolName);
    }

    if (p.type === "tool-invocation") {
      const invocation = p.toolInvocation as
        | { toolCallId?: string; toolName?: string }
        | undefined;
      if (typeof invocation?.toolCallId === "string" && typeof invocation.toolName === "string") {
        toolCallNames.set(invocation.toolCallId, invocation.toolName);
      }
    }

    if (p.type === "dynamic-tool" && typeof p.toolCallId === "string" && typeof p.toolName === "string") {
      toolCallNames.set(p.toolCallId, p.toolName);
    }
  }

  for (const part of parts) {
    const p = part as Record<string, unknown>;

    if (p.type === "tool-input-available" || p.type === "tool-output-available") {
      const toolName =
        typeof p.toolName === "string"
          ? p.toolName
          : typeof p.toolCallId === "string"
            ? toolCallNames.get(p.toolCallId)
            : undefined;
      const agentKey = getAgentTypeForToolName(toolName);
      if (!agentKey) continue;

      if (p.type === "tool-output-available" && p.output !== undefined) {
        (agentData as Record<string, unknown>)[agentKey] = p.output;
        loadingAgents.delete(agentKey);
      } else {
        loadingAgents.add(agentKey);
      }
      continue;
    }

    if (p.type === "dynamic-tool") {
      const toolName = typeof p.toolName === "string" ? p.toolName : undefined;
      const agentKey = getAgentTypeForToolName(toolName);
      if (!agentKey) continue;

      const state = typeof p.state === "string" ? p.state : undefined;
      if (state === "output-available" && p.output !== undefined) {
        (agentData as Record<string, unknown>)[agentKey] = p.output;
        loadingAgents.delete(agentKey);
      } else if (state === "input-available" || state === "input-streaming") {
        loadingAgents.add(agentKey);
      }
      continue;
    }

    if (typeof p.type === "string" && p.type.startsWith("tool-") && p.type !== "tool-invocation") {
      const toolName =
        typeof p.toolName === "string"
          ? p.toolName
          : p.type.slice("tool-".length);
      const agentKey = getAgentTypeForToolName(toolName);
      if (!agentKey) continue;

      const state = typeof p.state === "string" ? p.state : undefined;
      if ((state === "output-available" || state === "result") && p.output !== undefined) {
        (agentData as Record<string, unknown>)[agentKey] = p.output;
        loadingAgents.delete(agentKey);
      } else if (state === "input-available" || state === "input-streaming" || state === "call") {
        loadingAgents.add(agentKey);
      }
      continue;
    }

    if (p.type === "tool-invocation") {
      const invocation = p.toolInvocation as
        | { toolCallId?: string; toolName?: string; state?: string; result?: unknown }
        | undefined;
      const toolName =
        invocation?.toolName ??
        (typeof invocation?.toolCallId === "string"
          ? toolCallNames.get(invocation.toolCallId)
          : undefined);
      const agentKey = getAgentTypeForToolName(toolName);
      if (!agentKey || !invocation?.state) continue;

      if (invocation.state === "result" && invocation.result !== undefined) {
        (agentData as Record<string, unknown>)[agentKey] = invocation.result;
        loadingAgents.delete(agentKey);
      } else if (invocation.state === "call" || invocation.state === "partial-call") {
        loadingAgents.add(agentKey);
      }
      continue;
    }

    if (p.type === "data-tool-agent") {
      const data = p.data as
        | {
            status?: string;
            toolCalls?: Array<{ toolName?: string }>;
            toolResults?: Array<{ toolName?: string; result?: unknown }>;
          }
        | undefined;

      for (const toolCall of data?.toolCalls ?? []) {
        const agentKey = getAgentTypeForToolName(toolCall.toolName);
        if (agentKey) loadingAgents.add(agentKey);
      }

      for (const toolResult of data?.toolResults ?? []) {
        const agentKey = getAgentTypeForToolName(toolResult.toolName);
        if (!agentKey || toolResult.result === undefined) continue;
        (agentData as Record<string, unknown>)[agentKey] = toolResult.result;
        loadingAgents.delete(agentKey);
      }

      if (data?.status === "finished") {
        for (const toolCall of data.toolCalls ?? []) {
          const agentKey = getAgentTypeForToolName(toolCall.toolName);
          if (agentKey) loadingAgents.delete(agentKey);
        }
      }
    }
  }

  return { agentData, loadingAgents };
}
