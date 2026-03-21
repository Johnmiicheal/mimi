"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  CurrencyDollar,
  CloudSun,
  Stamp,
  Confetti,
  CircleNotch,
  CheckCircle,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { SafetyCard, type SafetyData } from "@/components/agent-ui/SafetyCard";
import { CurrencyCard, type CurrencyData } from "@/components/agent-ui/CurrencyCard";
import { WeatherCard, type WeatherData } from "@/components/agent-ui/WeatherCard";
import { VisaCard, type VisaData } from "@/components/agent-ui/VisaCard";
import { EventsCard, type EventsData } from "@/components/agent-ui/EventsCard";

export type AgentType = 'safety' | 'currency' | 'weather' | 'visa' | 'events';

export interface AgentData {
  safety?: SafetyData;
  currency?: CurrencyData;
  weather?: WeatherData;
  visa?: VisaData;
  events?: EventsData;
}

interface AgentConfig {
  id: AgentType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const AGENTS: AgentConfig[] = [
  { id: 'weather', label: 'Weather', icon: <CloudSun weight="fill" className="w-3.5 h-3.5" />, color: 'text-sky-600' },
  { id: 'currency', label: 'Currency', icon: <CurrencyDollar weight="fill" className="w-3.5 h-3.5" />, color: 'text-blue-600' },
  { id: 'safety', label: 'Safety', icon: <Shield weight="fill" className="w-3.5 h-3.5" />, color: 'text-emerald-600' },
  { id: 'visa', label: 'Visa', icon: <Stamp weight="fill" className="w-3.5 h-3.5" />, color: 'text-amber-600' },
  { id: 'events', label: 'Events', icon: <Confetti weight="fill" className="w-3.5 h-3.5" />, color: 'text-purple-600' },
];

interface AgentPanelProps {
  data: AgentData;
  loading: Set<AgentType>;
}

export function AgentPanel({ data, loading }: AgentPanelProps) {
  const [expanded, setExpanded] = useState<AgentType | null>(null);

  const visibleAgents = AGENTS.filter(a => loading.has(a.id) || data[a.id] !== undefined);

  if (visibleAgents.length === 0) return null;

  const toggle = (id: AgentType) => setExpanded(prev => prev === id ? null : id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-2"
    >
      {/* Agent pill row */}
      <div className="flex flex-wrap gap-1.5">
        {visibleAgents.map((agent) => {
          const isLoading = loading.has(agent.id);
          const isDone = data[agent.id] !== undefined;
          const isActive = expanded === agent.id;

          return (
            <motion.button
              key={agent.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => isDone && toggle(agent.id)}
              disabled={!isDone}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                isActive
                  ? "bg-gray-900 text-white border-gray-900"
                  : isDone
                    ? "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:shadow-sm cursor-pointer"
                    : "bg-gray-50 text-gray-400 border-gray-100 cursor-default"
              )}
            >
              <span className={isDone && !isActive ? agent.color : ''}>
                {agent.icon}
              </span>
              <span>{agent.label}</span>
              {isLoading && (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <CircleNotch className="w-3 h-3 text-gray-400" />
                </motion.span>
              )}
              {isDone && !isLoading && (
                <CheckCircle weight="fill" className={cn("w-3 h-3", agent.color)} />
              )}
              {isDone && (
                isActive
                  ? <CaretUp className="w-2.5 h-2.5 text-gray-400" />
                  : <CaretDown className="w-2.5 h-2.5 text-gray-400" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Expanded card */}
      <AnimatePresence>
        {expanded && data[expanded] && (
          <motion.div
            key={expanded}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-1">
              {expanded === 'safety' && data.safety && <SafetyCard data={data.safety} />}
              {expanded === 'currency' && data.currency && <CurrencyCard data={data.currency} />}
              {expanded === 'weather' && data.weather && <WeatherCard data={data.weather} />}
              {expanded === 'visa' && data.visa && <VisaCard data={data.visa} />}
              {expanded === 'events' && data.events && <EventsCard data={data.events} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
